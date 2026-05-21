## Development Fund Proposal

**Author:** Shanu | LYNC<br/>
**Status:** Submitted<br/>
**Created:** 2026-05-11<br/>
**Label:** daml-tooling

**Champion:** Need Champion

---

## Abstract

This proposal outlines a grant proposal to build two DPM Components:
1. __Daml contract deployment framework__- similar to how Ethereum has Hardhat, Solana has Anchor and Sui has the Sui CLI. A single command-line tool, which handles the development environment and framework designed for building, testing, deploying, and debugging Daml smart contracts.
2. __Canton Pre-Flight Transaction Profiler__ - The Transaction Profiler is a DPM component that estimates sequencer traffic cost and checks validator readiness before a transaction is submitted to the Canton network, built for validator, operators and multi-party workflow developers. Similar to how Tenderly works on EVM.

Together these DPM plugin handles the Canton developer workflow from getting a Daml contract deploy onto a validator, and estimating what a transaction will cost and whether it will succeed before it is submitted.

Deploying a Daml package to a validator currently requires a developer to run manually, `daml build`, locate and pin the right Canton protobuf bundle, write gRPC client code or shell out to `daml ledger upload-dar` (and lose Admin API features), resolve auth tokens per environment, allocate parties via a separate API call, and run setup scripts manually. Deployment component supports both the Admin API and Ledger API upload paths, is multi-synchronizer, integrates cleanly with DPM-built packages.

Separately, There is no way to estimate sequencer traffic cost or check validator readiness before submitting — a single bad transaction can exhaust a validator's traffic budget and reject every transaction on it.

Both components close those gaps. Each plugin is a DPM component that is published to an OCI registry and installed via `dpm install package`. Each reads Canton protobufs from the active SDK install and works across LocalNet, DevNet, TestNet, and MainNet from one config file with named per-network profiles.

Total request: **260,000 CC (CC is at 0.156)** across four milestones over approximately two months.

---

# Component 1 — Daml Contract Deployment Framework

## Specification

### 1. Objective

The primary objective for this proposal is to deliver a single, documented command-line maintained as open-source DPM Component that handles the full Daml deployment lifecycle on Canton which compile, upload, party allocation, post-deploy scripting, usable across LocalNet, TestNet, and MainNet validators with one consistent interface and no environment code changes by the developer.

### 2. Implementation Mechanics

The plugin is a DPM Component, Shipped and invoked as a DPM component (dpm canton-deploy <command> ). Install follows the same pattern as other DPM components.

**Core architecture:**

The following must be present on your machine before using `Daml Deployment Plugin`:

| Dependency | Why it is needed | Install |
|---|---|---|
| **DPM** ≥ 1.0.14 | Host for the component; resolves and runs `dpm canton-deploy` | Bundled with Daml SDK 3.5+
| **Daml SDK** ≥ 3.5 | `daml build` compiles your project to a `.dar`; `daml script` runs post-deploy scripts | `curl -sSL https://get.daml.com/ \| sh` |
| **A running Canton node** | Target for deploy — Admin API and/or Ledger API must be reachable from your machine | LocalNet via Docker Compose, or a managed validator |

## Two ways to upload a DAR

Canton exposes package upload through two different gRPC APIs. The plugin supports both, and you can switch between them per-run or set a default in config.

| Path | gRPC service | Default port | When to use |
|---|---|---|---|
| `admin` | `PackageService.UploadDar` | 5002 | Operator-style tooling. Admin API must be reachable (may need VPN or port-forward). Not available on most managed validators. |
| `ledger` | `PackageManagementService.UploadDarFile` | 5001 | Same class of flow as `daml ledger upload-dar`. Works where only the Ledger API is exposed. Recommended default for TestNet / MainNet. |

**Precedence:** `--upload-via` flag → `CANTON_PLUGIN_UPLOAD_VIA` env var → `uploadVia` in config → default `admin`.

---

## Implementation Workflow

```bash
dpm canton-deploy deploy --network testnet --upload-via ledger
```
### 1. Pre-deployment Phase

- **Config Resolution:** Load `canton-deploy.config.js` → merge CLI flags → resolve env vars → validate schema
- **Protobuf Discovery:** Read SDK root from DPM environment → locate Canton `protobuf/` under the active SDK → load gRPC service definitions
- **Authentication:** Execute `tokenCommand` / read `tokenFile` / generate LocalNet HMAC token / use inline token
- **Connectivity Check:** Ping Admin API, Ledger API, JSON API endpoints with auth headers

### 2. Build Phase

- **Daml SDK Integration:** Shell out to `daml build` or `dpm build` for DAR compilation
- **DAR Path Resolution:** Auto-detect from `daml.yaml` name/version or accept explicit `--dar` override
- **DPM Compatibility:** Support pre-built DARs from DPM workflow output directories

### 3. Deployment Phase (Dual Upload Path)

- **API Selection Logic:** `--upload-via admin|ledger` → config `uploadVia` → env `CANTON_PLUGIN_UPLOAD_VIA` → default `admin`
- **gRPC Channel Options:** Handle `grpc.default_authority` for Nginx virtual host routing
- **Error Handling:** Retry logic for transient network failures, detailed error context for auth/permission issues

### 4. Post-deployment Operations

- **Party Management:** Automatic allocation via Ledger API `PartyManagementService`
- **Script Execution:** Shell out to `daml script` against live Canton participant
- **Verification:** Query uploaded packages via Admin API `ListDars` or Ledger API `ListKnownPackages`

---

## Multi-Environment Operational Approach

### LocalNet and DevNet

- **Auto-detection:** HMAC token generation with `unsafe` secret
- **Port mapping:** Default Admin API `5002→2902`, Ledger API `5001→2901` for Splice LocalNet
- **No TLS:** Direct HTTP/gRPC connections to `localhost`

### TestNet 

- **Token acquisition:** File-based (`tokenFile`) or command-based (`tokenCommand`) for CI/CD integration
- **Upload strategy:** Prefer `ledger` API when Admin API requires VPN/port-forwarding
- **Synchronizer assignment:** Explicit `synchronizerId` configuration for multi-domain participants

### MainNet

- **Vault integration:** `tokenCommand: "vault kv get -field=token secret/mainnet-ledger"`
- **TLS termination:** Support for client certificates and custom CA trust stores
- **Audit logging:** Structured JSON output for deployment tracking
- **Rollback capability:** DAR versioning and package upgrade validation

---

## Configuration

All settings live in `canton-deploy.config.js` at your project root. Multiple named networks are supported; use `--network <name>` to select one.

| Key | What it controls |
|---|---|
| `host` | Validator host or IP address |
| `adminPort` | Admin gRPC API port (default 5002) |
| `ledgerPort` | Ledger gRPC API port (default 5001) |
| `httpPort` | HTTP JSON API port (default 7575) |
| `uploadVia` | `"admin"` or `"ledger"` — which API uploads the DAR |
| `token` / `tokenFile` / `tokenCommand` | JWT bearer token source |
| `tls` / `tlsCertFile` | Enable TLS and optional CA cert path |
| `synchronizerId` | Pin the target synchronizer (domain). **Required** when the participant is connected to more than one synchronizer. Omit only on single-synchronizer nodes where auto-detect is safe. |
| `parties` | List of display names to auto-allocate after deploy |

```js
// canton-deploy.config.js
module.exports = {
  defaultNetwork: "localnet",
  networks: {
    localnet: {
      host: "localhost",
      adminPort: 2902,    // Splice LocalNet app-user
      ledgerPort: 2901,
      httpPort: 7575,
      uploadVia: "admin",
    },
    testnet: {
      host: "192.168.50.10",
      ledgerPort: 5011,
      uploadVia: "ledger",  // only Ledger API is exposed here
      tokenFile: "./.tokens/testnet.jwt",
    },
  },
  parties: ["Alice", "Bob"],
};
```

Every port and the upload path can also be set via env vars: `CANTON_PLUGIN_ADMIN_PORT`, `CANTON_PLUGIN_LEDGER_PORT`, `CANTON_PLUGIN_HTTP_PORT`, `CANTON_PLUGIN_UPLOAD_VIA`, `CANTON_PLUGIN_TOKEN`.

---

## Supported Commands of Plugin

### `dpm canton-deploy`

The main workhorse. Runs `daml build` to produce a `.dar` (or accepts a pre-built one via `--dar`), uploads it to the validator, optionally allocates parties defined in your config, and optionally runs a Daml Script.

```bash
dpm canton-deploy deploy --host localhost
dpm canton-deploy deploy --host localhost --upload-via ledger
dpm canton-deploy deploy --host 192.168.1.50 --token eyJhbG...
dpm canton-deploy deploy --network testnet --script My.Module:setup
dpm canton-deploy deploy --dar .daml/dist/my-app.dar --dry-run
```

**Key flags:** `--upload-via admin|ledger`, `--dar <path>`, `--dry-run`, `--script <Module:fn>`.

### `dpm canton-deploy dars`

Lists all DARs currently uploaded to a participant via the Admin API (`PackageService.ListDars`).

```bash
dpm canton-deploy dars --host localhost --admin-port 5002
dpm canton-deploy dars --host localhost --admin-port 2902  # Splice LocalNet app-user
```

### `dpm canton-deploy status`

Checks connectivity and auth against both the Admin API and Ledger API. Useful to confirm ports, token validity, and TLS settings before attempting a deploy.

```bash
dpm canton-deploy status --host localhost
```

### `dpm canton-deploy parties` / `allocate-party`

Lists known parties on the node, or allocates a new party by display name. Uses the Ledger API (`PartyManagementService`).

```bash
dpm canton-deploy parties --host localhost
dpm canton-deploy allocate-party "Alice" --host localhost
```

### `dpm canton-deploy run`

Runs a Daml Script standalone (i.e. not as part of a deploy). Useful for seeding data or running test scenarios against a live node.

```bash
dpm canton-deploy run My.Module:main --host localhost
```

### `dpm canton-deploy contracts`

Queries active contracts through the HTTP JSON API. Good for a quick app-level smoke check.

```bash
dpm canton-deploy contracts --host localhost --http-port 7575
```

### `dpm canton-deploy token`

Shows which JWT token is resolved for the current config/flags, and can decode it to inspect claims (`sub`, `aud`, expiry, time remaining).

```bash
dpm canton-deploy token --decode --host localhost
```

### `dpm canton-deploy packages`

Lists known packages (Daml package IDs) on the participant via the Ledger API (`PackageManagementService.ListKnownPackages`). Use this to verify a DAR upload succeeded when the Admin API is unavailable, or to check which package IDs are active.

```bash
dpm canton-deploy packages --host localhost --ledger-port 5001
```

### `dpm canton-deploy init`

Interactive wizard that generates a `canton-deploy.config.js` in your project root. Walks through: network name, host, ports, default upload path (admin vs ledger), TLS settings, and token source (inline / file / shell command / LocalNet auto).

```bash
dpm canton-deploy init
```

---

### 3. Architectural Alignment
This proposal aligns with Canton priorities because:

- According to canton network developer experiance and toolign survey (2026), several mention of a development framework similar to hardhat was marked as the most critical need.
- Local Development Frameworks are the most urgent gap, rated “Critical” (the highest rating in any category), indicating this is a significant pain point.
- The work aligns with CIP-0082's named targets of "dev tools" and "critical infra" as common-good investments.


### 4. Backward Compatibility
No backward compatibility impact.

---

# Component 2 — Canton Pre-Flight Transaction Profiler

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

Non-LocalNet use requires `daml-profiler.config.js` at the project root (same idea as `canton-deploy.config.js`). Multiple named networks; select with `--network <name>`.

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

### Milestone 1: _(Core Deployment component MVP on Localnet and Testnet)_
- **Estimated Delivery:** 1 weeks from project start
- **Focus:** MVP of Deployment Framework on Localnet and Devnet with support of 10 commands (mentioned above) using Admin API upload path. Verified against LocalNet and self-hosted Devnet validator.
- **Deliverables / Value Metrics:**
    - Public release on GitHub of the MVP CLI, runnable from any Daml project root.
    - [All commands](#supported-commands-of-plugin) working end-to-end against a LocalNet and Devnet via the Admin API Upload path.
    - Auth handled automatically (HMAC-signed JWT using Splice's unsafe secret).
    - Value metric: at least one external Canton-builder team (outside LYNC) running the MVP against their Localnet by milestone end.

### Milestone 2: _(Launch Deployment component with Documentation, OCI Distribution)_
- **Estimated Delivery:** 1 weeks after milestone 1
- **Focus:** Add the Ledger API upload path (required for managed and MainNet validators), full multi-network configuration, multi-synchronizer support. Verified against LocalNet, Devnet, a self-hosted Testnet node, and a Mainnet validator.
- **Deliverables / Value Metrics:**
    - Ledger API upload path implemented and selectable per-run via `--upload-via admin|ledger`, per-network in config, or via `CANTON_PLUGIN_UPLOAD_VIA`.
    - [All commands](#supported-commands-of-plugin) working end-to-end on a Localnet, Devnet, Testnet and Mainnet via the Admin API and Ledger API Upload path.
    - Multi-synchronizer supporting `synchronizerId` configuration for participants connected to multiple synchronizers, with `canton-deploy status` reporting connected synchronizers.
    - End to end testing on all networks (LocalNet, Devnet, Testnet and Mainnet)
    - Public OCI registry release of the component, with versioning tied to Canton SDKs and a documented release process.
    - Complete developer documentation: installation, configuration, every command in the surface, auth in each environment, multi-synchronizer setup, DPM integration, and MainNet deployment patterns. Hosted at [docs.lync.world](https://docs.lync.world/) and at Foundation-approved location.
    - Repo published under Apache 2.0.
    - Value metric: at least one Canton application provider using the plugin to deploy to Testnet or Mainnet validator from a single configuration file by milestone end.


### Milestone 3 _(GTM, Ecosystem Adoption for Deployment component and MVP of Profiler)_
- **Estimated Delivery:** 2 weeks after milestone 2
- **Focus:** Go-to-market for the completed deployment framework, in parallel with the core MVP build of the Pre-Flight Transaction Profiler on LocalNet and DevNet/TestNet.
- **Deliverables / Value Metrics:**
  - **Deployment GTM:**
      - Announcement coordination via @lyncworld (74K+ followers) and @bhushanvishwas (17.7k followers).
      - Inclusion of Canton Foundation branding within the plugin as a grant recipient.
      - "Deploy your first Daml package to Canton in 5 minutes" quickstart tutorial with an accompanying example repository, along side a tutorial video and document.
      - Tutorial video, walking a new developer through proccess of installing the plugin via DPM, running `dpm canton-deploy init`, deploying to Localnet, then redeploying the same project to Testnet by changing one --network flag. Published on YouTube and embedded in the documentation.
      - Submission for inclusion in Canton's developer resources directory and Daml docs.
      - Developer-focused content, case studies, showcasing the public API and integration opportunities.
   - **Profiler MVP:**
      - `dpm profiler estimate`, `simulate`, and `inspect` working with the gRPC payload size check and static (approximate) estimation. 
      - Traffic estimation working against Localnet, Devnet and Testnet.
      - Profiler MVP public GitHub release.
      - Value metric: at least one external operator team running `dpm profiler inspect` against their TestNet validator.

### Milestone 4 _(Profiler Launch with docs and GTM, Ecosystem Adoption for Profiler)_
- **Estimated Delivery:** 2 weeks after milestone 3
- **Focus:** Finalize and launch the profiler with full MainNet support, and bring user adoption for Profiler Component.
- **Deliverables / Value Metrics:**
    - [All commands](#supported-commands-of-profiler) working end-to-end on Localnet, Devnet, Testnet and Mainnet.
    - End to end testing of profiler on all networks (LocalNet, Devnet, Testnet and Mainnet)
    - Public OCI registry release of the profiler component, versioned to Canton SDKs.
    - Repo published under Apache 2.0.
    - Complete developer documentation: installation, configuration, every command, hosted at [docs.lync.world](https://docs.lync.world/) and at Foundation-approved location.
    - Announcement coordination via @lyncworld (74K+ followers) and @bhushanvishwas (17.7k followers).
    - Inclusion of Canton Foundation branding within the plugin as a grant recipient.
    - Profiler tutorial video published on YouTube and embedded in the documentation.
    - Submission for inclusion in Canton's developer resources directory and Daml docs.
    - Value metric: at least one operator team using `dpm profiler estimate` / `balance` in a MainNet pre-submit workflow.


---

## Acceptance Criteria
The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone.
- Demonstrated functionality: a committee member or delegate can install the plugin, follow the published documentation, and complete the milestone-specific reference flow end-to-end.
- Each milestone's documentation should be sufficient for an independent Canton developer to use the relevant features.

Project-specific acceptance conditions:

- All code released in a public GitHub repository before any milestone payment.
- OCI component release (Deployment framework at Milestone 2, Profiler at Milestone 4) and docs published.
- Canton SDK compatibility: both components will track the latest Canton SDK major within 60 days of any new release during the grant period.

---

## Funding

**Total Funding Request:**
Total 260,000 Canton Coin (CC is at 0.156) funding requested.

### Payment Breakdown by Milestone
- Milestone 1 _(Core Deployment component MVP on Localnet and Devnet)_: 50,000 CC upon committee acceptance
- Milestone 2 _(Launch Deployment component with Documentation, OCI Distribution)_: 50,000 CC upon committee acceptance
- Milestone 3 _(GTM, Ecosystem Adoption for deployment component and MVP of Profiler)_: 100,000 CC upon acceptance
- Milestone 4 _(Profiler Launch with docs and GTM, Ecosystem Adoption for Profiler)_: 60,000 CC


### Volatility Stipulation
The grant duration is 2 months. The grant is denominated in fixed Canton Coin. Should the project timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility.


## Co-Marketing
Upon release, LYNC entity will collaborate with the Foundation on:

- Announcement coordination across Foundation and LYNC channels at each milestone.
- A technical blog post and video walking developers through the plugin — from `dpm install package` to a deploy both Daml package on LocalNet, TestNet, and MainNet.
- Documentation inclusion: Submission for inclusion in Canton's official documentation and developer onboarding channels, so new builders find the plugin.
- Co-marketing on X: Launch announcement by coordinated across LYNC and Canton Foundation X accounts, with cross-amplification on major release.
---

## Motivation

Every Daml project that ships to a Canton goes through the same deployment workflow: build, upload, allocate parties, run setup. There is no tool for this.

In the recent ecosystem survey, 41% of respondents cited environment setup and node operations as the task that took the longest to get right when they first started, a statistic that captures, in numbers. A deployment CLI shifts that wall from hours of trial-and-error to a few minutes of `dpm install package`.

Local Development Frameworks were rated the most urgent gap, the only category rated "Critical" in the prioritization matrix, with respondents naming Hardhat, Anchor, and similar CLIs. 71% of surveyed developers come from an Ethereum background and arrive expecting that shape of tooling as mentioned in the [recent survey analysis 2026](https://forum.canton.network/t/canton-network-developer-experience-and-tooling-survey-analysis-2026/8412).

The survey also have multiple mentions of Tenderly as the missing standard for transaction simulation and visual debugging, wanting to replace the workflow of parsing cryptic log files. The profiler brings pre-submit transaction tracing and failure prediction into a DPM package.

When we started building on canton network, we faced the same problem and decided to solve this for everyone by building Daml Deployment Plugin.

---

## Rationale

**Why a Hardhat-style CLI specifically?**

The Hardhat / Foundry / Anchor / Sui-CLI pattern is the established development tool for smart-contract deployment across other major blockchains. The pattern is proven, and developers arriving from other ecosystems expect it.

As of now, No Canton tool covers the full deployment lifecycle. `daml ledger upload-dar` handles upload only. The Canton console is an operator REPL, not a developer CLI. DPM manages package lifecycle. Daml Deployment Plugin unifies these into one CLI.

**Why a pre-flight profiler alongside it?**

Deployment gets a package onto a validator, The profiler tells you whether the transactions that package will run are affordable and will succeed. 
The two cover opposite ends of the same workflow. Tenderly plays this role in the EVM. Canton has no equivalent, and the cost model (validators paying per megabyte of sequencer traffic, with budget exhaustion rejecting all traffic) makes the gap more consequential here than a simple gas estimate.

**Why DPM components instead of npm packages?**

- Canton developers already run DPM, adding npm globals is friction the ecosystem does not need.
- Components declared in `daml.yaml` are pinned per project and tied to the SDK the project compiles against, which removes the protobuf-bundle resolution problem entirely.
- Canton developers find first-party tooling through DPM components.