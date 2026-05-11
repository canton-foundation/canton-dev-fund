## Development Fund Proposal

**Author:** Shanu | LYNC<br/>
**Status:** Submitted<br/>
**Created:** 2026-05-11<br/>
**Label:** daml-tooling

**Champion:** Need Champion

---

## Abstract

This proposal outlines a grant proposal to build a Daml contract deployment framework, similar to how Ethereum has Hardhat, Solana has Anchor and Sui has the Sui CLI. A single command-line tool, which handles the development environment and framework designed for building, testing, deploying, and debugging Daml smart contracts.

Deploying a Daml package to a validator currently requires a developer to run manually, `daml build`, locate and pin the right Canton protobuf bundle, write gRPC client code or shell out to `daml ledger upload-dar` (and lose Admin API features), resolve auth tokens per environment, allocate parties via a separate API call, and run setup scripts manually.

**Daml Deployment Plugin** will close that gap. It is a Node.js CLI — a Hardhat equivalent for Daml — that handles the full deployment lifecycle to any Canton validator (LocalNet, TestNet, or MainNet) from one config file with named per-network profiles. It supports both the Admin API and Ledger API upload paths, is multi-synchronizer, integrates cleanly with DPM-built packages, and resolves Canton protobuf bundles automatically against the project's SDK version.

Total request: **333,000 CC** across three milestones over approximately two months.

---

## Specification

### 1. Objective

The primary objective for this proposal is to deliver a single, documented command-line maintained as open-source ecosystem infrastructure tool that handles the full Daml deployment lifecycle on Canton which compile, upload, party allocation, post-deploy scripting, usable across LocalNet, TestNet, and MainNet validators with one consistent interface and no environment code changes by the developer.

### 2. Implementation Mechanics

The plugin is a Node.js CLI (`daml-deployment`) installed globally via npm and run from inside any Daml project root, alongside `daml.yaml`. It is built on the standard Canton developer surface and introduces no protocol changes.

**Core architecture:**

The following must be present on your machine before using `Daml Deployment Plugin`:

| Dependency | Why it is needed | Install |
|---|---|---|
| **Node.js** ≥ 18 | Runtime for the CLI itself | `brew install node` or [nodejs.org](https://nodejs.org) |
| **Daml SDK** ≥ 3.4 | `daml build` compiles your project to a `.dar`; `daml script` runs post-deploy scripts | `curl -sSL https://get.daml.com/ \| sh` |
| **Canton protobuf bundle** | The CLI loads Canton `.proto` definitions at runtime via `@grpc/proto-loader`. You need the Canton open-source protobuf bundle (same version as your node) available locally. | Download from the Canton open-source release assets (recommended), or clone the repo at the matching tag. See below. |
| **A running Canton node** | Target for deploy — Admin API and/or Ledger API must be reachable from your machine | LocalNet via Docker Compose, or a managed validator |


**Automated download:** The plugin ships a built-in command that reads `sdk-version` from your `daml.yaml` (or `CANTON_SDK_VERSION` env var) and downloads the matching bundle automatically:

```bash
canton-plugin fetch-protos                          # uses sdk-version from daml.yaml
canton-plugin fetch-protos --sdk-version 3.x.xx     # explicit version
canton-plugin fetch-protos --output-dir /opt/canton-protos
```

**Version mismatch handling:** The plugin resolves the proto directory at startup by checking `daml.yaml` `sdk-version` first, then `CANTON_SDK_VERSION`, then any `canton-open-source-*` directory present in the workspace. If nothing matches, it prints a clear error with the exact `curl` command to download the right bundle. You can also set `CANTON_PROTO_PATH=/absolute/path/to/protobuf` to pin a specific directory regardless of version detection.

**CI pinning:** Set `CANTON_SDK_VERSION` and `CANTON_PROTO_PATH` in your pipeline environment. Run `canton-plugin fetch-protos` as a setup step. The same variables work across all plugin commands — no source changes needed.

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
canton-plugin deploy --network testnet --upload-via ledger
```
### 1. Pre-deployment Phase

- **Config Resolution:** Load `canton-plugin.config.js` → merge CLI flags → resolve env vars → validate schema
- **Protobuf Discovery:** Read `sdk-version` from `daml.yaml` → locate `canton-open-source-{version}/protobuf/` → load gRPC service definitions
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

All settings live in `canton-plugin.config.js` at your project root. Multiple named networks are supported; use `--network <name>` to select one.

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
// canton-plugin.config.js
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

### `canton-plugin deploy`

The main workhorse. Runs `daml build` to produce a `.dar` (or accepts a pre-built one via `--dar`), uploads it to the validator, optionally allocates parties defined in your config, and optionally runs a Daml Script.

```bash
canton-plugin deploy --host localhost
canton-plugin deploy --host localhost --upload-via ledger
canton-plugin deploy --host 192.168.1.50 --token eyJhbG...
canton-plugin deploy --network testnet --script My.Module:setup
canton-plugin deploy --dar .daml/dist/my-app.dar --dry-run
```

**Key flags:** `--upload-via admin|ledger`, `--dar <path>`, `--dry-run`, `--script <Module:fn>`.

### `canton-plugin dars`

Lists all DARs currently uploaded to a participant via the Admin API (`PackageService.ListDars`).

```bash
canton-plugin dars --host localhost --admin-port 5002
canton-plugin dars --host localhost --admin-port 2902  # Splice LocalNet app-user
```

### `canton-plugin status`

Checks connectivity and auth against both the Admin API and Ledger API. Useful to confirm ports, token validity, and TLS settings before attempting a deploy.

```bash
canton-plugin status --host localhost
```

### `canton-plugin parties` / `allocate-party`

Lists known parties on the node, or allocates a new party by display name. Uses the Ledger API (`PartyManagementService`).

```bash
canton-plugin parties --host localhost
canton-plugin allocate-party "Alice" --host localhost
```

### `canton-plugin run`

Runs a Daml Script standalone (i.e. not as part of a deploy). Useful for seeding data or running test scenarios against a live node.

```bash
canton-plugin run My.Module:main --host localhost
```

### `canton-plugin contracts`

Queries active contracts through the HTTP JSON API. Good for a quick app-level smoke check.

```bash
canton-plugin contracts --host localhost --http-port 7575
```

### `canton-plugin token`

Shows which JWT token is resolved for the current config/flags, and can decode it to inspect claims (`sub`, `aud`, expiry, time remaining).

```bash
canton-plugin token --decode --host localhost
```

### `canton-plugin packages`

Lists known packages (Daml package IDs) on the participant via the Ledger API (`PackageManagementService.ListKnownPackages`). Use this to verify a DAR upload succeeded when the Admin API is unavailable, or to check which package IDs are active.

```bash
canton-plugin packages --host localhost --ledger-port 5001
```

### `canton-plugin fetch-protos`

Downloads the Canton protobuf bundle matching your SDK version. Reads `sdk-version` from `daml.yaml` automatically, or accepts an explicit `--sdk-version`. Run this once per workspace (or per CI pipeline) before any other command.

```bash
canton-plugin fetch-protos                          # auto-detects version from daml.yaml
canton-plugin fetch-protos --sdk-version 3.x.xx     # explicit version
canton-plugin fetch-protos --output-dir /opt/protos
```

### `canton-plugin init`

Interactive wizard that generates a `canton-plugin.config.js` in your project root. Walks through: network name, host, ports, default upload path (admin vs ledger), TLS settings, and token source (inline / file / shell command / LocalNet auto).

```bash
canton-plugin init
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

## Milestones and Deliverables

### Milestone 1: _(Core CLI MVP on Localnet)_
- **Estimated Delivery:**3 weeks from project start
- **Focus:**MVP of Deployment Framework on Localnet and Devnet with support of 10 commands (mentioned above) using Admin API upload path. Verified against LocalNet and self-hosted Devnet validator.
- **Deliverables / Value Metrics:**
    - Public release on GitHub of the MVP CLI, runnable from any Daml project root.
    - [All commands](#supported-commands-of-plugin) working end-to-end against a LocalNet and Devnet via the Admin API Upload path.
    - Auth handled automatically (HMAC-signed JWT using Splice's unsafe secret).
    - Value metric: at least one external Canton-builder team (outside LYNC) running the MVP against their Localnet by milestone end.

### Milestone 2: _(CLI tool on Mainnet and Testnet)_
- **Estimated Delivery:** 3 weeks after milestone 1
- **Focus:** Add the Ledger API upload path (required for managed and MainNet validators), full multi-network configuration, multi-synchronizer support. Verified against LocalNet, Devnet, a self-hosted Testnet node, and a Mainnet validator.
- **Deliverables / Value Metrics:**
    - Ledger API upload path implemented and selectable per-run via `--upload-via admin|ledger`, per-network in config, or via `CANTON_PLUGIN_UPLOAD_VIA`.
    - [All commands](#supported-commands-of-plugin) working end-to-end on a Localnet, Devnet, Testnet and Mainnet via the Admin API and Ledger API Upload path.
    - Multi-synchronizer supporting `synchronizerId` configuration for participants connected to multiple synchronizers, with `canton-plugin status` reporting connected synchronizers.
    - End to end testing on all networks (LocalNet, Devnet, Testnet and Mainnet)
    - Value metric: at least one Canton application provider using the plugin to deploy to Testnet or Mainnet validator from a single configuration file by milestone end.


### Milestone 3 _(Documentation, NPM Distribution and Ecosystem Onboarding)_
- **Estimated Delivery:** 2 weeks after milestone 2
- **Focus:**
- **Deliverables / Value Metrics:**
    - Public npm release of the plugin, with versioning to Canton SDKs and a documented release process.
    - Complete developer documentation: installation, configuration, every command in the surface, auth in each environment, multi-synchronizer setup, DPM integration, and MainNet deployment patterns. Hosted at [docs.lync.world](https://docs.lync.world/) and at Foundation-approved location.
    - "Deploy your first Daml package to Canton in 5 minutes" quickstart tutorial with an accompanying example repository, along side a tutorial video and document.
    - Tutorial video, walking a new developer through proccess of installing the plugin from npm, running canton-plugin init, deploying to Localnet, then redeploying the same project to Testnet by changing one --network flag. Published on YouTube and embedded in the documentation.
    - Submission for inclusion in Canton's developer resources directory and Daml docs.
---

## Acceptance Criteria
The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone.
- Demonstrated functionality: a committee member or delegate can install the plugin, follow the published documentation, and complete the milestone-specific reference flow end-to-end.
- Each milestone's documentation should be sufficient for an independent Canton developer to use the relevant features.

Project-specific acceptance conditions:

- All code released in a public GitHub repository before any milestone payment.
- npm package (Milestone 3) and docs published.
- Canton SDK compatibility: the plugin will track the latest Canton SDK major within 60 days of any new release during the grant period.
---

## Funding

**Total Funding Request:**
Total 333,000 Canton Coin (CC) funding requested.

### Payment Breakdown by Milestone
- Milestone 1 _(Core CLI MVP on Localnet and Devnet)_: 133,000 CC upon committee acceptance
- Milestone 2 _(CLI tool on Mainnet and Testnet)_: 150,000 CC upon committee acceptance
- Milestone 3 _(Documentation, NPM Distribution and Ecosystem Onboarding)_: 50,000 CC upon final release and acceptance

### Volatility Stipulation
The grant duration is 2 months. The grant is denominated in fixed Canton Coin. Should the project timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility.


## Co-Marketing
Upon release, LYNC entity will collaborate with the Foundation on:

- Announcement coordination across Foundation and LYNC channels at each milestone.
- A technical blog post and video walking developers through the plugin — from `npm install` to a deploy Daml package on LocalNet, TestNet, and MainNet.
- Documentation inclusion: Submission for inclusion in Canton's official documentation and developer onboarding channels, so new builders find the plugin.
- Co-marketing on X: Launch announcement by coordinated across LYNC and Canton Foundation X accounts, with cross-amplification on major release.
---

## Motivation

Every Daml project that ships to a Canton goes through the same deployment workflow: build, upload, allocate parties, run setup. There is no tool for this.

In the recent ecosystem survey, 41% of respondents cited environment setup and node operations as the task that took the longest to get right when they first started, a statistic that captures, in numbers. A deployment CLI shifts that wall from hours of trial-and-error to a few minutes of `npm install`.

Local Development Frameworks were rated the most urgent gap, the only category rated "Critical" in the prioritization matrix, with respondents naming Hardhat, Anchor, and similar CLIs. 71% of surveyed developers come from an Ethereum background and arrive expecting that shape of tooling as mentioned in the [recent survey analysis 2026](https://forum.canton.network/t/canton-network-developer-experience-and-tooling-survey-analysis-2026/8412).

When we started building on canton network, we faced the same problem and decided to solve this for everyone by building Daml Deployment Plugin.

---

## Rationale

Why a Hardhat-style CLI specifically?

The Hardhat / Foundry / Anchor / Sui-CLI pattern is the established development tool for smart-contract deployment across other major blockchains. The pattern is proven, and developers arriving from other ecosystems expect it.

As of now, No Canton tool covers the full deployment lifecycle. `daml ledger upload-dar` handles upload only. The Canton console is an operator REPL, not a developer CLI. DPM manages package lifecycle. Daml Deployment Plugin unifies these into one CLI.