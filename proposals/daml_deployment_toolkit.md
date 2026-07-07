## Development Fund Proposal

**Author:** Shanu | LYNC<br/>
**Status:** Submitted<br/>
**Created:** 2026-05-11<br/>
**Label:** daml-tooling

**Champion:** Jatin (Canton Foundation)

---

## Abstract

This proposal outlines a grant proposal to build a **Daml contract deployment framework**,distributed as a DPM component, similar to how Ethereum has Hardhat, Solana has Anchor and Sui has the Sui CLI. A single command-line tool that handles the full deployment workflow for Daml smart contracts: build, upload, party allocation, post-deploy scripting, and on-ledger verification.

Deploying a Daml package to a validator currently requires a developer to manually run `dpm build`, choose an upload path (Ledger API, JSON API, or Canton console depending on what the validator exposes), resolve auth tokens per environment, allocate parties via a separate API call, and run setup scripts manually and repeat all of this per network, with different flags and token sources each time.

**Daml Deployment Plugin** will close that gap. It is a DPM component, published to an OCI registry and installed via `dpm install package`, that registers a `dpm canton-deploy subcommand` and handles the full Daml deployment lifecycle to any Canton validator (LocalNet, TestNet, or MainNet) from one config file with named per-network profiles.
Deployment component supports both the Admin API and Ledger API upload paths, is multi-synchronizer, integrates cleanly with DPM-built packages.

`canton-deploy` is implemented as a Node.js/TypeScript DPM component (Node.js 18+).

**Out of scope:** `damlc` remains the compiler, `daml-script` remains the script execution engine, DPM remains the package manager. This component is the deployment workflow layer that sits above them.

Total request: **130,000 CC (CC is at 0.156)** across three milestones over approximately one month.

---

## Specification

### 1. Objective

The primary objective for this proposal is to deliver a single, documented command-line maintained as open-source DPM Component that handles the full Daml deployment lifecycle on Canton which upload, vetting, party allocation, post-deploy scripting, usable across LocalNet, TestNet, and MainNet validators with one consistent interface and no environment code changes by the developer.

### 2. Implementation Mechanics

The plugin is a DPM Component, Shipped and invoked as a DPM component (dpm canton-deploy ). Install follows the same pattern as other DPM components.

**Core architecture:**

The following must be present on your machine before using `Daml Deployment Plugin`:

| Dependency | Why it is needed | Install |
|---|---|---|
| **DPM** ≥ 1.0.14 | Host for the component; resolves and runs `dpm canton-deploy` | Bundled with Daml SDK 3.5+
| **`damlc`** DPM component | Compiles your project to a `.dar` (via `dpm build`) | Installed via `dpm install package`
| **`daml-script`** DPM component | Runs post-deploy scripts (via `dpm script`) | Installed via `dpm install package`
| **A running Canton node** | Target for deploy — Ledger API and/or JSON API must be reachable from your machine | LocalNet via Docker Compose, or a managed validator |

### Two ways to upload a DAR

Canton exposes package upload through the Ledger/JSON API path and the Admin API path. The plugin supports both, and you can switch between them per-run or set a default in config.

| Path | API / service | Default port | When to use |
|---|---|---|---|
| `ledger` | `PackageManagementService.UploadDarFile` / JSON API `POST /v2/dars` | 5001 / 7575 | Works where only the Ledger API or JSON API is exposed. Recommended default for TestNet / MainNet. |
| `admin` | `PackageService.UploadDar` | 5002 | Operator-style tooling. Admin API must be reachable (may need VPN or port-forward). Not available on most managed validators. |

**Precedence:** `--upload-via` flag → `CANTON_DEPLOY_UPLOAD_VIA` env var → `uploadVia` in config → default `ledger`.

---

### Implementation Workflow

```bash
dpm canton-deploy deploy --network devnet --upload-via ledger
```
### 1. Pre-deployment Phase

- **Config Resolution:** Load `canton-deploy.config.js` → merge CLI flags → resolve env vars → validate schema
- **Authentication:** `--token` / `CANTON_DEPLOY_TOKEN` / `tokenCommand` / `tokenFile` / generate LocalNet HMAC token / use inline token
- **Connectivity Check:** Ping Ledger API, JSON API (and optionally Admin API) endpoints with auth headers. `deploy` runs this as a preflight check by default before upload.

### 2. Build Phase

- **Daml SDK Integration:** Primary path is `dpm build`; `deploy` accepts a pre-built DAR via `--dar`, or invokes `dpm build` as a convenience when no DAR is provided
- **DAR Path Resolution:** Auto-detect from `daml.yaml` name/version or accept explicit `--dar` override
- **DPM Compatibility:** Support pre-built DARs from DPM workflow output directories

### 3. Deployment Phase (Dual Upload Path)

- **API Selection Logic:** `--upload-via admin|ledger` → config `uploadVia` → env `CANTON_DEPLOY_UPLOAD_VIA` → default `ledger`
- **Upload and vetting:** `deploy` uploads the DAR and auto-vets it as part of the upload flow
- **gRPC Channel Options:** Handle `grpc.default_authority` for Nginx virtual host routing
- **Error Handling:** Retry logic for transient network failures, detailed error context for auth/permission issues. Optional `--log-file` for CI artifact capture.

### 4. Post-deployment Operations

- **Party Management:** Exposes `parties` (list known parties) and `allocate-party` (allocate by display name) via Ledger API `PartyManagementService`. `deploy` can also auto-allocate parties listed in `parties: [...]` config after upload; existing parties are checked first and skipped if already present.
- **Script Execution:** Invoke `dpm script` against live Canton participant (optional convenience wrapper via `run` / `deploy --script`)
- **Verification:** Query uploaded packages via Admin API `ListDars` or Ledger API `ListKnownPackages`

---

### Multi-Environment Operational Approach

### LocalNet and DevNet

- **Auto-detection:** HMAC token generation with `unsafe` secret
- **Port mapping:** Default Admin API `5002→2902`, Ledger API `5001→2901` for Splice LocalNet
- **Upload strategy:** Default `ledger` upload path; Admin API remains available where reachable (e.g. LocalNet)
- **No TLS:** Direct HTTP/gRPC connections to `localhost`

### TestNet 

- **Token acquisition:** File-based (`tokenFile`) or command-based (`tokenCommand`) for CI/CD integration
- **Upload strategy:** Prefer `ledger` API when Admin API requires VPN/port-forwarding
- **Synchronizer assignment:** Explicit `synchronizerId` configuration for multi-domain participants

### MainNet

- **Vault integration:** `tokenCommand: "vault kv get -field=token secret/mainnet-ledger"` (available for any network; Vault is just one example of a command that prints a JWT)
- **TLS termination:** Support for client certificates and custom CA trust stores
- **Audit logging:** Structured JSON output for deployment tracking

---

### Configuration

All settings live in `canton-deploy.config.js` at your project root. Multiple named networks are supported; use `--network` to select one.

| Key | What it controls |
|---|---|
| `host` | Validator host or IP address |
| `adminPort` | Admin gRPC API port (default 5002) |
| `ledgerPort` | Ledger gRPC API port (default 5001) |
| `httpPort` | HTTP JSON API port (default 7575) |
| `uploadVia` | `"admin"` or `"ledger"` — which API uploads the DAR (default `ledger`) |
| `token` / `tokenFile` / `tokenCommand` | JWT bearer token source |
| `tls` / `tlsCertFile` | Enable TLS and optional CA cert path |
| `synchronizerId` | Pin the target synchronizer (domain). **Required** when the participant is connected to more than one synchronizer. Omit only on single-synchronizer nodes where auto-detect is safe. |
| `parties` | List of display names to auto-allocate after deploy |

```js
// canton-deploy.config.js
module.exports = {
  defaultNetwork: "devnet",
  networks: {
    localnet: {
      host: "localhost",
      adminPort: 2902,    // Splice LocalNet app-user
      ledgerPort: 2901,
      httpPort: 7575,
      uploadVia: "ledger",
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

Every port and the upload path can also be set via env vars: `CANTON_DEPLOY_ADMIN_PORT`, `CANTON_DEPLOY_LEDGER_PORT`, `CANTON_DEPLOY_HTTP_PORT`, `CANTON_DEPLOY_UPLOAD_VIA`, `CANTON_DEPLOY_TOKEN`.

---

### Supported Commands of Plugin

### `dpm canton-deploy`

The main workhorse. Runs `dpm build` to produce a `.dar` (or accepts a pre-built one via `--dar`), uploads it to the validator, auto-vets it as part of the upload flow, optionally allocates parties defined in your config, and optionally runs a Daml Script.

```bash
dpm canton-deploy deploy --host localhost
dpm canton-deploy deploy --host localhost --upload-via ledger
dpm canton-deploy deploy --host 192.168.1.50 --token eyJhbG...
dpm canton-deploy deploy --network testnet --script My.Module:setup
dpm canton-deploy deploy --dar .daml/dist/my-app.dar --dry-run
```

**Key flags:** `--upload-via admin|ledger`, `--dar `, `--dry-run`, `--script `, `--token`, `--log-file`, `--host`, `--ledger-port`, `--admin-port`, `--http-port`.

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

Lists known parties on the node, or allocates a new party by display name. Uses the Ledger API (`PartyManagementService`). The allocate flow checks existing parties first and allocates only if the party is not already present.

```bash
dpm canton-deploy parties --host localhost
dpm canton-deploy allocate-party "Alice" --host localhost
```

### `dpm canton-deploy run`

Runs a Daml Script standalone (i.e. not as part of a deploy). Useful for seeding data or running test scenarios against a live node. Script output streams to stdout; optional `--log-file` captures command output/errors for CI artifacts.

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

Lists known packages (Daml package IDs) on the participant via the Ledger API (`PackageManagementService.ListKnownPackages`). Resolves package ID to name and version where available. Use this to verify a DAR upload succeeded when the Admin API is unavailable, or to check which package IDs are active.

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

- According to canton network developer experience and tooling survey (2026), several mention of a development framework similar to hardhat was marked as the most critical need.
- Local Development Frameworks are the most urgent gap, rated “Critical” (the highest rating in any category), indicating this is a significant pain point.
- The work aligns with CIP-0082's named targets of "dev tools" and "critical infra" as common-good investments.

### 4. Backward Compatibility
No backward compatibility impact.

---

## Milestones and Deliverables

### Milestone 1: _(Core Deployment component MVP on Localnet and Devnet)_
- **Estimated Delivery:** 1 week from project start
- **Focus:** MVP of Deployment Framework on Localnet and Devnet with support of 10 commands (mentioned above) using Admin API upload path. Verified against LocalNet and self-hosted Devnet validator.
- **Deliverables / Value Metrics:**
    - Public release on GitHub of the MVP CLI, runnable from any Daml project root.
    - [All commands](#supported-commands-of-plugin) working end-to-end against a LocalNet and Devnet via the Admin API Upload path.
    - Auth handled automatically (HMAC-signed JWT using Splice's unsafe secret).
    - Value metric: at least one external Canton-builder team (outside LYNC) running the MVP against their Localnet by milestone end.

### Milestone 2: _(Launch Deployment component with Documentation, OCI Distribution)_
- **Estimated Delivery:** 1 week after milestone 1
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


### Milestone 3 _(GTM and Ecosystem Adoption)_
- **Estimated Delivery:** 2 weeks after milestone 2
- **Focus:** Go-to-market for the completed deployment framework
- **Deliverables / Value Metrics:**
    - Announcement coordination via @lyncworld (74K+ followers) and @bhushanvishwas (17.7k followers).
    - Inclusion of Canton Foundation branding within the plugin as a grant recipient.
    - "Deploy your first Daml package to Canton in 5 minutes" quickstart tutorial with an accompanying example repository, along side a tutorial video and document.
    - Tutorial video, walking a new developer through process of installing the plugin via DPM, running `dpm canton-deploy init`, deploying to Localnet, then redeploying the same project to Testnet by changing one --network flag. Published on YouTube and embedded in the documentation.
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
- OCI component release (Deployment framework at Milestone 2) and docs published.
- Canton SDK compatibility: both components will track the latest Canton SDK major within 60 days of any new release during the grant period.

---

## Funding

**Total Funding Request:**
Total 130,000 Canton Coin (CC is at 0.156) funding requested.

### Payment Breakdown by Milestone
- Milestone 1 _(Core Deployment component MVP on Localnet and Devnet)_: 30,000 CC upon committee acceptance
- Milestone 2 _(Launch Deployment component with Documentation, OCI Distribution)_: 30,000 CC upon committee acceptance
- Milestone 3 _(GTM and Ecosystem Adoption)_: 70,000 CC upon acceptance


### Volatility Stipulation
The grant duration is 1 month. The grant is denominated in fixed Canton Coin. Should the project timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility.


## Co-Marketing
Upon release, LYNC entity will collaborate with the Foundation on:

- Announcement coordination across Foundation and LYNC channels at each milestone.
- A technical blog post and video walking developers through the plugin — from `dpm install package` to a deploy Daml package on LocalNet, TestNet, and MainNet.
- Documentation inclusion: Submission for inclusion in Canton's official documentation and developer onboarding channels, so new builders find the plugin.
- Co-marketing on X: Launch announcement coordinated across LYNC and Canton Foundation X accounts, with cross-amplification on major release.
---

## Motivation

Every Daml project that ships to a Canton goes through the same deployment workflow: build, upload, allocate parties, run setup. Each step exists in DPM today, but as separate commands invoked with separate flags against separately configured endpoints. 
There is no single tool that composes them into one config-driven workflow per network profile.

In the recent ecosystem survey, 41% of respondents cited environment setup and node operations as the task that took the longest to get right when they first started, a statistic that captures, in numbers. A deployment CLI shifts that wall from hours of trial-and-error to a few minutes of `dpm install package`.

Local Development Frameworks were rated the most urgent gap, the only category rated "Critical" in the prioritization matrix, with respondents naming Hardhat, Anchor, and similar CLIs. 71% of surveyed developers come from an Ethereum background and arrive expecting that shape of tooling as mentioned in the [recent survey analysis 2026](https://forum.canton.network/t/canton-network-developer-experience-and-tooling-survey-analysis-2026/8412).

When we started building on canton network, we faced the same problem and decided to solve this for everyone by building Daml Deployment Plugin.

---

## Rationale

**Why a Hardhat-style CLI specifically?**

The Hardhat / Foundry / Anchor / Sui-CLI pattern is the established development tool for smart-contract deployment across other major blockchains. The pattern is proven, and developers arriving from other ecosystems expect it.

As of now, No Canton tool covers the full deployment lifecycle. `dpm build` / `damlc` handles compilation only. DPM 3.5 removed `daml ledger upload-dar` and similar commands — upload, party allocation, and on-ledger package queries are now done via JSON/gRPC APIs or Canton console. The Canton console is an operator REPL, not a developer CLI. Daml Deployment Plugin unifies the post-build deployment workflow into one CLI with one config file.

**Why DPM components instead of npm packages?**

- Canton developers already run DPM, adding npm globals is friction the ecosystem does not need.
- Components declared in `daml.yaml` are pinned per project and tied to the SDK the project compiles against.
- Canton developers find first-party tooling through DPM components.
