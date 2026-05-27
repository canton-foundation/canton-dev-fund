## Development Fund Proposal

**Author:** Shanu | LYNC<br/>
**Status:** Submitted<br/>
**Created:** 2026-05-27<br/>
**Label:** daml-tooling

**Champion:** Need Champion

---

## Abstract

This proposal outlines a grant proposal to build Canton Pre-Flight Transaction Profiler, The Transaction Profiler is a DPM component that estimates sequencer traffic cost and checks validator readiness before a transaction is submitted to the Canton network, built for validator, operators and multi-party workflow developers. Similar to how Tenderly works on EVM. The component estimates what a transaction will cost and whether it will succeed before it is submitted. 

There is no way to estimate sequencer traffic cost or check validator readiness before submitting, A single bad transaction can exhaust a validator's traffic budget and reject every transaction on it. 

Canton Pre-Flight Transaction Profiler is a DPM component that is published to an OCI registry and installed via `dpm install package`. It reads Canton protobufs from the active SDK install and works across LocalNet, DevNet, TestNet, and MainNet from one config file with named per-network profiles.

Total request: **130,000 CC (CC is at 0.156)** across three milestones over approximately two months.

---

## Specification

### 1. Objective

The profiler answers three questions before anything hits the network: 
- Will this transaction succeed?
- How many bytes of sequencer traffic will it use?
- Can the validator's traffic budget cover it? 

It is shipped and invoked as a DPM component (`dpm profiler <command>`).

**Who it is for:** Any Daml developers designing workflows with many parties or large payloads and Teams running their own validator on DevNet, TestNet, or MainNet and deploying on Canton Network.

**What it is not:** An end-user gas calculator. Canton validators pay traffic fees (in Canton Coin) per megabyte of sequencer traffic — not individual wallets. This tool is for operators and workflow designers.

### 2. Problem it solves

Canton charges validators a fixed fee per megabyte of sequencer traffic. When the budget runs out, every transaction on that validator is rejected, not just the expensive one. With Profiler developers are informed before anything hits the network.

| Failure mode | Today | With profiler |
|---|---|---|
| Traffic budget exhausted | `ABORTED` mid-workflow; hours in logs | Balance check before submit |
| gRPC payload too large | `RESOURCE_EXHAUSTED`; often confused with traffic | Local size check against inbound limit |
| Multi-party amplification | Small command → huge tree; invisible until MainNet | Party breakdown and byte estimate in seconds |

### 3. How it works

1. **Sequencer traffic estimation** 
Calls the Ledger API `/v2/interactive-submission/prepare`. Canton runs the Daml interpreter and returns the exact traffic cost in bytes **without committing** to the ledger. Converts to Canton Coin and USD using live rates from the public Scan API (when available).
2. **Validator balance check** 
Reads the validator's current traffic balance (base rate + purchased extra traffic) and reports whether the command can run right now — and how much CC to buy if not.
3. **gRPC payload size check** 
Serialises the command locally and compares size to the validator's inbound message limit (default 4 MB). Runs on all environments, including LocalNet (no traffic fees there).

### 4. Capability modes

In normal development you only need STANDARD (Ledger + Scan), or FULL if you also have Admin API. The profiler picks the best mode automatically; you do not choose it by hand.

| Mode | Typical user | What you get |
|---|---|---|
| **STANDARD** | Most TestNet / MainNet devs (managed or self-hosted validator, Ledger + JWT) | Exact traffic via `/prepare`, balance, CC/USD, gRPC size check |
| **FULL** | Validator operator with Admin API (port 5002) | Everything in STANDARD, plus exact gRPC limit and DAR vetting via Admin |

---

## Supported Commands of Profiler

### `dpm profiler estimate`

Primary command. Will this transaction succeed, and what will it cost? Takes a path to a command JSON file.

```bash
dpm profiler estimate ./commands/settlement.json
dpm profiler estimate ./commands/settlement.json --network mainnet
dpm profiler estimate ./commands/settlement.json --static
dpm profiler estimate ./commands/settlement.json --json --fail-on-error
```

Outputs: bytes, CC, USD, balance sufficiency, gRPC size check, party amplification breakdown, warnings. `--static` forces an approximate estimate (no `/prepare` call). `--json --fail-on-error` is for pipelines.

### `dpm profiler balance`

How much traffic does my validator have right now?

```bash
dpm profiler balance
dpm profiler balance --network mainnet --json
```

### `dpm profiler simulate`

Design-time view of the transaction tree: creates, archives, stakeholders per sub-tx, and how the tree maps to sequencer envelopes. Use `--verbose` for per-envelope bytes.

```bash
dpm profiler simulate ./commands/settlement.json
dpm profiler simulate ./commands/settlement.json --verbose
```

### `dpm profiler watch`

Live stream of transaction cost as commits happen. Optional alert when a single tx exceeds a CC threshold.

```bash
dpm profiler watch
dpm profiler watch --network mainnet --alert-cc 5.0
```

### `dpm profiler inspect`

Pre-flight health check: DARs uploaded and vetted, parties allocated, synchronizer connected, gRPC limit. Useful as the first step in CI before integration tests.

```bash
dpm profiler inspect
dpm profiler inspect --network testnet --json
```

### Command summary

| Command | Question it answers | LocalNet |
|---|---|---|
| `estimate` | Cost and will it succeed? | Size check only (no fees) |
| `balance` | How much traffic left? | N/A (no fees) |
| `simulate` | Full tx tree and parties? | Yes (tree view) |
| `watch` | What is each live tx costing? | Yes (no CC values) |
| `inspect` | Is the validator ready? | Yes |

---

## Environment behaviour

| Feature | LocalNet | DevNet / TestNet | MainNet |
|---|---|---|---|
| Traffic fee estimate | Off | On (Scan API) | On |
| gRPC size check | On | On | On |
| Balance check | Off | MemberTraffic via Ledger | Same |
| JWT auth | HMAC unsafe | OIDC / file / command | Same |
| High-cost warning | N/A | ~1 CC | ~5 CC |

---

## Configuration

Non-LocalNet use requires `daml-profiler.config.js` at the project root. Multiple named networks; select with `--network <name>`.

| Key | What it controls |
|---|---|
| `host` | Validator host |
| `ledgerPort` | Ledger gRPC (default 5001) |
| `adminPort` | Admin gRPC (optional; default 5002) |
| `token` / `tokenFile` / `tokenCommand` | JWT source |
| `tls` | TLS for gRPC |
| `scanApiUrl` | Scan API base URL (or env-specific default) |
| `synchronizerId` | Required when participant has multiple synchronizers |

```js
// daml-profiler.config.js
module.exports = {
  defaultNetwork: "testnet",
  networks: {
    testnet: {
      host: "192.168.50.10",
      ledgerPort: 5011,
      tokenFile: "./.tokens/testnet.jwt",
      scanApiUrl: "https://scan.sv.test.canton.global",
    },
    mainnet: {
      host: "validator.example.com",
      ledgerPort: 5001,
      tokenCommand: "vault read -field=token secret/mainnet-jwt",
      synchronizerId: "synchronizer::1220abc...",
    },
  },
};
```

### Requirements

| Dependency | Minimum | Notes |
|---|---|---|
| **DPM** | 1.0.14+ | Bundled with Canton SDK 3.5+ |
| **Node.js** | 18+ | Runs the bundled profiler script |
| **Canton SDK** | 3.5+ | For `/v2/interactive-submission/prepare` |
| **Ledger API** | Reachable | Required for exact estimate |
| **Scan API** | Optional | CC/USD conversion; fallback rates in config |

---

### 3. Architectural Alignment
This proposal aligns with Canton priorities because:

- The survey names a "Pre-Flight Resource & Cost Profiler" as a distinct tooling opportunity, observing that developers often deploy "blindly," only discovering that their transactions are too large (hitting byte-size limits) or too expensive after they fail in a testnet or production environment. The profiler component addresses this need directly.
- It also have multiple mentions of Tenderly as the missing standard for transaction simulation and visual debugging, wanting to replace the workflow of parsing cryptic log files. The profiler's `simulate` and `estimate` commands bring pre-submit transaction tracing and failure prediction to the CLI.
- The work aligns with CIP-0082's named targets of "dev tools" and "critical infra" as common-good investments.

### 4. Backward Compatibility
No backward compatibility impact.


## Milestones and Deliverables

### Milestone 1: _(Core Profiler component MVP on Localnet and Devnet)_
- **Estimated Delivery:** 1.5 weeks from project start
- **Focus:** MVP build of the Pre-Flight Transaction Profiler on LocalNet and DevNet/TestNet with support of all commands (mentioned above). Verified against LocalNet and self-hosted Devnet validator.
- **Deliverables / Value Metrics:**
    - `dpm profiler estimate`, `simulate`, and `inspect` working with the gRPC payload size check and static (approximate) estimation.
    - Traffic estimation working against Localnet, Devnet and Testnet.
    - Profiler MVP public GitHub release.
    - Value metric: at least one external operator team running `dpm profiler inspect` against their TestNet validator.

### Milestone 2: _(Launch Profiler component with Documentation, OCI Distribution)_
- **Estimated Delivery:** 1 weeks after milestone 1
- **Focus:** Finalize and launch the profiler with full MainNet support, Verified against LocalNet, Devnet, a self-hosted Testnet node, and a Mainnet validator.
- **Deliverables / Value Metrics:**
    - [All commands](#supported-commands-of-profiler) working end-to-end on Localnet, Devnet, Testnet and Mainnet.
    - End to end testing of profiler on all networks (LocalNet, Devnet, Testnet and Mainnet)
    - Public OCI registry release of the profiler component, versioned to Canton SDKs.
    - Repo published under Apache 2.0.
    - Complete developer documentation: installation, configuration, every command, hosted at [docs.lync.world](https://docs.lync.world/) and at Foundation-approved location.
    - Value metric: at least one operator team using `dpm profiler estimate` / `balance` in a MainNet pre-submit workflow.


### Milestone 3 _(GTM, Ecosystem Adoption for Profiler)_
- **Estimated Delivery:** 1.5 weeks after milestone 2
- **Focus:** Go-to-market for Transaction Profiler
- **Deliverables / Value Metrics:**
    - Announcement coordination via @lyncworld (74K+ followers) and @bhushanvishwas (17.7k followers).
    - Inclusion of Canton Foundation branding within the plugin as a grant recipient.
    - Profiler tutorial video published on YouTube and embedded in the documentation.
    - Tutorial video, walking a new developer through proccess of installing the plugin via DPM, running `dpm profiler estimate` / `balance`, on the Localnet, then the same project on Testnet, Published on YouTube and embedded in the documentation.
    - Submission for inclusion in Canton's developer resources directory and Daml docs.
    - Developer-focused content, case studies, showcasing the public API and integration opportunities.

---

## Acceptance Criteria
The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone.
- Demonstrated functionality: a committee member or delegate can install the plugin, follow the published documentation, and complete the milestone-specific reference flow end-to-end.
- Each milestone's documentation should be sufficient for an independent Canton developer to use the relevant features.

Project-specific acceptance conditions:

- All code released in a public GitHub repository before any milestone payment.
- OCI component release (Transaction Profiler at Milestone 2) and docs published.
- Canton SDK compatibility: both components will track the latest Canton SDK major within 60 days of any new release during the grant period.

---

## Funding

**Total Funding Request:**
Total 130,000 Canton Coin (CC is at 0.156) funding requested.

### Payment Breakdown by Milestone
- Milestone 1 _(Core Profiler component MVP on Localnet and Devnet)_: 60,000 CC upon committee acceptance
- Milestone 2 _(Launch Profiler component with Documentation, OCI Distribution)_: 50,000 CC upon committee acceptance
- Milestone 3 _(GTM, Ecosystem Adoption for Profiler)_: 50,000 CC upon acceptance


### Volatility Stipulation
The grant duration is 1 months. The grant is denominated in fixed Canton Coin. Should the project timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility.


## Co-Marketing
Upon release, LYNC entity will collaborate with the Foundation on:

- Announcement coordination across Foundation and LYNC channels at each milestone.
- A technical blog post and video walking developers through the plugin — from `dpm install package` to a use Daml package on LocalNet, TestNet, and MainNet.
- Documentation inclusion: Submission for inclusion in Canton's official documentation and developer onboarding channels, so new builders find the plugin.
- Co-marketing on X: Launch announcement by coordinated across LYNC and Canton Foundation X accounts, with cross-amplification on major release.
---

## Motivation

Once a Daml workflow is created, There is no way to know what a transaction will cost in sequencer traffic, or whether a validator can afford it, before submitting. A single bad transaction can exhaust a validator's traffic budget and reject every transaction on it.

The ecosystem survey have multiple mentions of a "Pre-Flight Resource & Cost Profiler" as a distinct tooling opportunity, Developers often deploy "blindly," only discovering their transactions are too large or too expensive after they fail on testnet or in production. 

The same survey has multiple mentions of Tenderly as the missing standard for transaction simulation, with developers wanting to replace the workflow of parsing cryptic log files, as documented in the [recent survey analysis 2026](https://forum.canton.network/t/canton-network-developer-experience-and-tooling-survey-analysis-2026/8412).

The Transaction Profiler brings pre-submit transaction tracing and failure prediction into a DPM package.

---

## Rationale

**Why a pre-flight profiler specifically?**

Canton's cost model is different from EVM gas: validators pay traffic fees per megabyte of sequencer traffic, and when a validator's budget runs out, every transaction on it is rejected. That makes blind submission more consequential. A pre-flight check that estimates traffic cost, verifies validator balance, and catches gRPC payload limits before submit is the natural fit for that cost model.

**Why DPM components instead of npm packages?**

- Canton developers already run DPM, adding npm globals is friction the ecosystem does not need.
- Components declared in `daml.yaml` are pinned per project and tied to the SDK the project compiles against, which removes the protobuf-bundle resolution problem entirely.
- Canton developers find first-party tooling through DPM components.