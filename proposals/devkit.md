## Development Fund Proposal

**Author:** Zhe Li (BitDynamics)

**Status:** Submitted  

**Created:** 2026-02-22

---

## Abstract

**Canton DevKit** is a proposed standalone, language-neutral LocalNet operations, debugging, observability, and CIP-56 testing toolkit for the Canton network. It makes local Canton development faster and more discoverable while building on the existing Splice LocalNet and DPM toolchains rather than replacing them.

DevKit packages common LocalNet workflows into a native CLI and Web UI: starting and managing named LocalNets, inspecting services and endpoints, uploading and inspecting DARs, exploring live contracts and transactions, viewing developer-focused observability dashboards, and testing CIP-56 token flows locally. 

---

## Specification

### 1. Objective

The current official LocalNet stack creates significant friction for onboarding, workshops, hackathons, and automated development workflows because it requires users to manually manage:

* Docker containers
* Configuration files
* Environment variables
* Observability setup
* Ad-hoc scripts and tools for inspection and token operations

The goal is to deliver a unified DevKit. This maintained tooling will enable any developer or automation workflow to manage the complete lifecycle of one or more LocalNets—using simple commands or a UI—monitor and explore activity, and easily experiment with CantonCoin and CIP-56 tokens.

### 2. Implementation Mechanics
(Explain how the solution will be implemented. Include technologies, components, workflows, and operational approach.)

The solution is delivered as a **standalone CLI application** (`canton-devkit`) with web UI. It will be implemented in **Go** and distributed as standalone native binaries for macOS and Linux on arm64 and amd64. End users will not need Go, Node.js, Python, Rust, or a source checkout to run it. DevKit uses Docker containers and runs LocalNet using Splice nodes, but packages the developer experience into a single binary that requires no git clone, no Makefile knowledge, and no manual environment variable setup. It will also include other optional helper services that developers can enable or disable as needed.

Windows native support is out of scope for the initial grant. Windows users may be documented later through WSL2 if there is demand, but it is not part of the committed deliverables.

#### Distribution and Runtime Requirements

DevKit release artifacts will be published through GitHub Releases with checksums. Additional install paths such as a Homebrew tap and/or install script may be provided for convenience, but the supported runtime artifact is the standalone Go binary for macOS and Linux.

DevKit will not install or bundle Docker. A working Docker runtime is the only required local system dependency because DevKit orchestrates the existing Splice LocalNet container stack rather than replacing it. DevKit will not modify Docker daemon configuration, install system packages, or change user permissions on the host.

#### Docker Handling

`canton-devkit localnet up` will run Docker preflight checks before starting LocalNet, including Docker CLI availability, daemon connectivity, Docker Compose v2, Linux user permissions, required ports, disk space, and memory suitable for the Splice LocalNet stack. If a check fails, DevKit will provide platform-specific remediation instructions instead of modifying the host system.

DevKit will manage LocalNet resources through deterministic Docker Compose project names and labels, so named LocalNets can be started, inspected, logged, stopped, snapshotted, and cleaned without affecting unrelated Docker containers, networks, or volumes. It will also make port allocation explicit for named instances and print the actual endpoints selected for each LocalNet.

#### Relationship to Existing Tooling

Canton already ships several developer tools. The DevKit is designed to complement—not replace—them:

| Existing Tool | What It Does | DevKit Relationship |
|---|---|---|
| **DPM** (`dpm`) | SDK management, Daml build/test/codegen, lightweight single-process sandbox (`dpm sandbox`), Daml Shell | DevKit does **not** replicate DPM functionality. Developers continue to use `dpm` for Daml compilation, testing, and codegen. DevKit targets the higher-level **multi-node LocalNet** lifecycle instead of the single-node sandbox that `dpm sandbox` does not cover. |
| **Existing LocalNet setup in Splice codebase** | Raw Docker Compose with validators, PostgreSQL, wallet/SV/scan UIs, and Canton Console | Splice LocalNet remains the underlying runtime. DevKit selects and version-pins known Splice LocalNet artifacts, generates local configuration, manages Docker lifecycle, exposes endpoints, health, logs, snapshots, and explorer workflows, while still allowing developers to use raw Splice LocalNet directly. |
| **`cn-quickstart` and official getting-started flows** | Tutorial and starter-app workflows for learning Canton application development | DevKit does not decide what official docs should recommend or replace quickstart content. It can provide a repeatable LocalNet lifecycle and inspection layer for quickstart-style development, workshops, and demos. |
| **Daml Shell** | Interactive REPL for low-level contract and transaction inspection against a participant | DevKit does **not** replace Daml Shell. Developers who prefer a REPL continue to use it. DevKit complements it with a CLI + Web UI experience that spans **multiple participants of a named LocalNet**, adds DAR package management, and surfaces ACS and transaction views in a visual explorer. |
| **PQS (Participant Query Store)** | SQL-backed historical query store for a participant | DevKit's first-pass contract tracking uses the live Ledger API v2 (`StateService`, `UpdateService`, `EventQueryService`) and does **not** require PQS. Optional PQS-backed history is a possible future enhancement. |

#### Canton DevKit Features

##### LocalNet Management

The existing LocalNet setup requires manually downloading Splice bundles, exporting environment variables, composing multi-flag Docker commands, and understanding Docker Compose profiles. DevKit collapses this into:

###### LocalNet Scope and Boundaries

DevKit's LocalNet scope starts with the core CLI lifecycle: starting, stopping, restarting, cleaning, checking status, viewing logs, selecting a Splice LocalNet version, running preflight checks, and using basic named-instance isolation. Richer automation conveniences such as machine-readable output, environment export, instance discovery, deeper diagnostics, and Web UI views are treated as incremental additions rather than requirements for the first usable LocalNet release.

###### CI and Automation Support

DevKit will support headless automation workflows without making CI the only design target. For the core CLI lifecycle, commands will return deterministic exit codes and `localnet up` will wait for LocalNet readiness or fail with a clear timeout/error. Additional automation conveniences will include machine-readable `--json` output, `.env`-style endpoint export for tests, and example CI workflows that start LocalNet, wait for readiness, run application tests, and tear the instance down safely.

###### Multiple LocalNets on One Machine

Basic named-instance support belongs in the core orchestration model because Docker resource naming and port isolation should be designed in from the beginning. DevKit will support `--name <localnet-name>` with deterministic Docker Compose project names, labels, and explicit port configuration so two LocalNets can run on one machine when sufficient resources and non-conflicting ports are available. Advanced instance discovery and dashboards, such as `localnet list`, `localnet env`, and Web UI views across named instances, are higher-level conveniences rather than requirements for the first usable LocalNet release.

###### Splice Version Compatibility

`--version <version>` selects the Splice LocalNet version to run. DevKit documentation will include a compatibility matrix for supported Splice versions and platforms. The initial release will validate the initially supported version, while maintenance releases will cover smoke testing, compatibility updates, and patch releases for newer Splice releases.

###### LocalNet Configuration Model

DevKit will make the important LocalNet inputs explicit: instance name, Splice version, port settings, enabled optional services, observability settings, startup DAR uploads, and LocalNet-only token test setup. The initial scope does not require a full topology language; the priority is a predictable, documented configuration surface for common local development, workshop, and CI workflows.

###### CLI Commands

The core lifecycle commands are part of the first usable CLI release. Automation and diagnostic conveniences such as environment export, instance discovery, richer status formats, and host diagnostics are added incrementally as the CLI matures.

| Command | Purpose | Expected Output / Behavior |
|---|---|---|
| `canton-devkit localnet up --name <name> [--version <version>]` | Start a named LocalNet | Runs Docker preflight checks, selects the requested Splice LocalNet version, starts services, waits for readiness, and prints endpoints and credential locations. |
| `canton-devkit localnet down --name <name>` | Stop a named LocalNet | Stops DevKit-managed services for that instance without touching unrelated Docker resources. |
| `canton-devkit localnet restart [service] --name <name>` | Restart an instance or service | Restarts the full LocalNet or one service and re-runs readiness checks. |
| `canton-devkit localnet clean --name <name>` | Remove LocalNet resources | Removes DevKit-managed containers, networks, and volumes for the named instance after confirmation. |
| `canton-devkit localnet status --name <name>` | Inspect health | Shows service health, selected Splice version, ports, participant readiness, wallet/scan URLs, and next troubleshooting steps when unhealthy. |
| `canton-devkit localnet logs [service] --name <name>` | Debug services | Streams or tails logs with optional service filtering. |
| `canton-devkit localnet snapshot/restore --name <name>` | Save or replay state | Captures or restores LocalNet state for demos, workshops, and repeatable testing. |
| `canton-devkit localnet env --name <name>` | Export app/test config | Prints `.env`-style values for Ledger API, JSON API, admin API, wallet UI, scan UI, parties, and users. |
| `canton-devkit localnet list` | Discover instances | Lists DevKit-managed LocalNets and their state without touching unrelated Docker resources. |
| `canton-devkit localnet doctor` | Diagnose host readiness | Checks Docker, Compose v2, permissions, ports, memory, disk, and supported platform assumptions. |

###### Web UI Features
All features covered by CLI commands but with a user-friendly interface.

###### Optional AI Agent Skill Documents

DevKit will provide optional, editor-agnostic AI agent skill documents that describe safe workflows for invoking `canton-devkit` commands. These skills are not part of the core runtime and do not prescribe how developers write code or which editor or agent they use. They simply expose DevKit's infrastructure primitives to agents through agent skill documents, following the agent skills pattern described at https://agentskills.io/home.

Example workflows include starting or stopping a named LocalNet, checking LocalNet readiness with `canton-devkit localnet status`, tailing logs with `canton-devkit localnet logs [service]`, uploading a pre-built DAR, listing deployed packages, inspecting active contracts, and reporting LocalNet readiness. Where compilation is needed, the skill delegates to existing Daml tooling such as `dpm` and then uses DevKit only for LocalNet deployment and inspection.

Initial skill examples may be provided for Claude and Codex-style agent formats, but the supported integration surface is the stable `canton-devkit` CLI rather than any specific editor or AI platform.

##### DAR Management

Today developers upload DARs to each LocalNet participant manually (via `daml ledger upload-dar`, the JSON API, or the Canton Console), and there is no built-in way to inspect, diff, or hot-redeploy packages across a multi-participant LocalNet. DevKit closes that gap without replicating `dpm` / `daml build` — it accepts pre-built DAR files and, when `dpm` is available on `PATH`, offers an optional build+upload shortcut that delegates compilation to `dpm`.

###### CLI Commands
* `canton-devkit dar upload <path> [--participant <name> | --all-participants] [--vet] [--dry-run]` — upload a DAR to one or all participants of the active (or `--name`-selected) LocalNet, optionally vetting for Smart Contract Upgrade (SCU).
* `canton-devkit dar list [--participant <name>]` — list uploaded packages with package ID, name, version, Daml-LF version, module count, upload time, and vetting status.
* `canton-devkit dar info <package-id|package-name>` — show modules, templates, interfaces, choices, fields, dependencies, and hash for a package.
* `canton-devkit dar download <package-id> [--out <file>]` — fetch a DAR back from a participant.
* `canton-devkit dar diff <package-a> <package-b>` — human-readable diff of templates/choices/fields between two package versions, with SCU-compatibility signals (name/version/LF-version/field deltas).
* `canton-devkit dar remove <package-id>` — unvet / remove where supported by the participant admin API.
* `canton-devkit dar build [--project <path>]` — optional thin shortcut that invokes `dpm` (or `daml build`) and uploads the result; skipped with a clear message if `dpm` is not installed.
* `canton-devkit dar watch <project>` — watch mode: rebuild via `dpm` and re-upload to selected participants on source change for a hot-deploy loop.

###### Web UI Features
* Drag-and-drop DAR upload with per-participant vetting toggles.
* Package explorer tree: modules → templates → choices → fields (with types), interfaces, dependencies, and hashes.
* SCU-aware diff viewer between any two package versions.
* Hot-deploy indicator showing the last watch-mode upload and its status per participant.

###### Scope Boundaries
* DevKit is **not** a Daml compiler. It delegates to `dpm` / `daml build` and will not duplicate DPM functionality.
* SCU-compatibility output is best-effort based on package metadata and structural comparison — authoritative upgrade validation remains the responsibility of the Ledger API and `daml` tooling.

##### Contract Tracking & Exploration

The proposal already notes that developers "often build ad-hoc tools for exploring transactions, contract state, and token operations." DevKit ships a shared, privacy-aware explorer for the Active Contract Set (ACS) and transaction history across one or more named LocalNets, so teams stop rebuilding the same inspector.

The first-pass scope is the **live** view: ACS table, transaction list, and detail views backed by Ledger API v2. Historical / archived-contract search via PQS is explicitly deferred.

###### CLI Commands
* `canton-devkit contracts ls [--template <FQN>] [--party <p>] [--participant <n>] [--active | --archived | --all]` — list ACS entries with filters.
* `canton-devkit contracts show <contract-id>` — pretty-print payload, signatories, observers, creation transaction, archival transaction (if any), package/version, and interface views.
* `canton-devkit contracts watch [filters]` — live tail of create/archive events, similar to `kubectl get -w`.
* `canton-devkit contracts export [filters] [--format json|csv]` — snapshot the filtered ACS to a file for test fixtures or diffing.
* `canton-devkit tx ls [--party <p>] [--from <offset>] [--to <offset>] [--template <FQN>]` — list transactions with filters.
* `canton-devkit tx show <tx-id|offset>` — render the transaction as a tree of creates and (nested) exercises, with contract IDs and choice arguments.
* `canton-devkit tx replay <tx-id>` — reconstruct the per-party visibility projection ("what this party sees") for debugging privacy and authorization issues.

###### Web UI Features
* **Explorer** section with a live ACS table filterable by template, party, and participant; payload previews, age, signatories/observers, and a detail drawer.
* **Transaction timeline** with expandable trees, party visibility badges, and links from exercise/create nodes to the affected contracts.
* **Contract detail view**: full payload (JSON and typed), lifecycle (created-at tx → exercises → archived-at tx), interface views, and related contracts by key or referenced contract ID.
* **Per-party projection** selector that always displays which participant + party the current view is projected through, to avoid a misleading "global ledger" impression.
* **Saved queries / bookmarks** shareable via URL, and an ad-hoc **event subscription panel** that updates in real time.

###### Implementation Notes
* Backend uses Ledger API v2: `StateService.GetActiveContracts`, `UpdateService.GetUpdates`, and `EventQueryService`, with `PackageService` + DAR metadata (from the DAR Management feature) to decode payloads into typed form.
* Multi-LocalNet aware via Milestone 1's named instances (`--name`); participant selector is present in every command and UI view.
* Privacy is not cosmetic: visibility is always projected through an explicit (participant, party) pair.

###### Scope Boundaries
* No PQS dependency in the first pass; archived-contract history beyond what the live Ledger API exposes, and SQL-style historical queries, are out of scope.
* DevKit does not re-implement Daml Shell's REPL; it offers a complementary visual + CLI explorer.

##### Observability and Monitoring

DevKit does **not** rebuild the observability stack from scratch. Instead, it bundles and configures a Prometheus/Grafana/Loki/Tempo stack tailored for LocalNet:

* Ensures the observability profile is enabled by default when starting LocalNet.
* Ships **Canton-specific Grafana dashboard presets** focused on DApp developers (as opposed to operator-level dashboards): transactions/sec, command completion latency, active contract counts, and per-template throughput.
* Adds a `canton-devkit metrics` subcommand that prints Grafana dashboard URLs and a concise text summary of key metrics (throughput, latency p50/p99, resource usage) for quick terminal-based checks.
* Documents how teams can extend or customize dashboards for their own services.
* Introduces an experimental **"cost projection" view** that estimates how an application's observed transaction patterns would translate to traffic costs on Mainnet, helping developers understand running costs and project margins before deployment.

##### Local Token Faucets & CIP-56 Developer Toolkit

This is the most differentiated feature. LocalNet already ships wallet UIs and a Registry API for token transfers, but developers still lack a CLI-driven faucet, a guided token-creation flow, and reusable Daml templates for everyday token operations. DevKit closes those gaps:

* `canton-devkit token create` — interactive "token wizard" to define new CIP-56 tokens (name, symbol, decimals, initial supply) and mint to test wallets.
* `canton-devkit token [mint | transfer | burn | balance] {token-name} {amount} [--to wallet]` — convenience commands wrapping the Ledger API / Registry API for common token operations.
* Example Daml templates and scripts for issuance, transfer, burn, and escrow flows that developers can use as starting points for their own token applications.

### 3. Architectural Alignment

The Canton DevKit removes the friction of managing local test environments so developers can focus on building their applications. It aligns with the Development Fund's remit to support developer tooling and critical infrastructure as common goods, and is consistent with the milestone‑based, CC‑denominated funding and governance model formalized under CIP‑100. Token tooling is designed to follow the Canton token standard CIP‑56, making it easier for developers to test tokenized applications and integrations in a way that reflects Mainnet patterns.

### 4. Backward Compatibility

The Canton DevKit primarily targets LocalNet developer environments and does not change Canton protocol behavior, DAML semantics, or existing production deployments. Developers can continue using the Splice LocalNet Docker stack.

No backward compatibility impact.

---

## Milestones and Deliverables

### Milestone 1: LocalNet Management — CLI

- **Estimated Delivery:** Month 3  
- **Focus:** One-click LocalNet lifecycle management via CLI.  
- **Deliverables /  Metrics:**  
  - `canton-devkit localnet up/down/restart/clean/status/logs` CLI commands with auto-generated configs, keys, identities, and printed endpoints and credentials.  
  - Version pinning (`--version`) and basic named-instance isolation (`--name`) using deterministic Docker Compose project names, labels, and explicit port configuration.  
  - Snapshot and restore (`canton-devkit localnet snapshot/restore`) for saving and replaying LocalNet state.  
  - Standalone Go binary release artifacts for macOS and Linux on arm64 and amd64, published with checksums.  
  - Installation and "Getting Started" guide for macOS and Linux, including Docker prerequisite checks and troubleshooting.  
  - Docker preflight checks in `canton-devkit localnet up` for Docker CLI availability, daemon connectivity, Docker Compose v2, Linux user permissions, required ports, disk space, and memory.  
  - Deterministic exit codes and readiness wait behavior suitable for basic headless automation.  
  - Internal testing plus at least one external tester validating that a new developer can go from zero to running LocalNet in under 10 minutes.  
- **Adoption Metrics:** at least 3 companies have reviewed the tool and tested it for LocalNet setup and lifecycle usage.

### Milestone 2: Web UI, Observability, Monitoring, DAR & Contract Tooling, Optional AI Agent Skill Documents

- **Estimated Delivery:** Month 6  
- **Focus:** Web UI for LocalNet management, integrated observability, DAR package management, live contract and transaction exploration, and optional AI agent skill documents.  
- **Deliverables / Value Metrics:**  
  - Web UI covering all CLI features from Milestone 1 with a user-friendly interface.  
  - Richer LocalNet automation conveniences, such as machine-readable status output, environment export for app/test configuration, named-instance discovery, and deeper diagnostics.  
  - Bundled Prometheus/Grafana/Loki/Tempo stack enabled by default when starting LocalNet.  
  - Canton-specific Grafana dashboard presets focused on DApp developers: transactions/sec, command completion latency, active contract counts, and per-template throughput.  
  - `canton-devkit metrics` subcommand printing Grafana dashboard URLs and a concise text summary of key metrics (throughput, latency p50/p99, resource usage).  
  - DAR management CLI (`canton-devkit dar upload/list/info/download/diff/remove/build/watch`) with multi-participant support, optional `dpm` integration, and SCU-aware diff signals.  
  - DAR Web UI with drag-and-drop upload, per-participant vetting toggles, package explorer tree, diff viewer, and hot-deploy indicator.  
  - Contract tracking CLI (`canton-devkit contracts ls/show/watch/export` and `canton-devkit tx ls/show/replay`) backed by Ledger API v2.  
  - Contract tracking Web UI "Explorer" with live ACS table, transaction timeline, contract detail drawer, and explicit per-party visibility projection.  
  - Optional AI agent skill documents demonstrating safe `canton-devkit` workflows for LocalNet lifecycle, DAR upload, package inspection, contract queries, and log/status checks.  
  - Documentation on recommended usage, dashboard customization, DAR workflows, contract explorer usage, and optional AI agent skill documents.  
  - (Experimental) Cost projection view estimating how observed transaction patterns translate to traffic costs on Mainnet.
- **Adoption Metrics:** at least 3 companies have started using it in their daily canton workflow.

### Milestone 3: Token Faucets & CIP-56 Token Tooling

- **Estimated Delivery:** Month 9  
- **Focus:** CantonCoin/CIP-56 tooling and UX polish.  
- **Deliverables / Value Metrics:**  
  - `canton-devkit token mint` CLI and Web UI minting for CIP-56 tokens on LocalNet.  
  - `canton-devkit token create` interactive token wizard to define new CIP-56 tokens (name, symbol, decimals, initial supply).  
  - `canton-devkit token transfer / burn / balance` convenience commands wrapping the Ledger API / Registry API.  
  - Cross-platform testing, UX polish across CLI and Web UI, and consolidated documentation, FAQs, and troubleshooting guides.

### Milestone 4: Maintenance and Marketing

- **Estimated Delivery:** Month 12  
- **Focus:** Stability, compatibility maintenance, and ecosystem outreach.  
- **Deliverables / Value Metrics:**  
  - Patch bugs and maintain compatibility with **newer Splice releases**.  
  - Host 2 online/offline workshops about the Canton DevKit.  
  - Publish 1 case study or blog post.

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

* Delivery of the Canton DevKit capabilities specified for each milestone.  
* **Milestone-specific adoption criteria:**  
  * **Milestone 1:** **3 voting member companies** have reviewed the tool and accepted it for LocalNet setup and lifecycle usage.  
  * **Milestone 2:** **5 voting member companies or representative Canton deployments** have run the tool on their codebases/workflows and confirmed practical usability.  
  * **Milestone 3:** At least **5 external projects/teams** demonstrate end-to-end CIP-56 workflow usage with DevKit (`create -> mint -> transfer` and/or `burn`) and provide feedback or demo artifacts.  
  * **Milestone 4:** Sustained external adoption is demonstrated through at least **2 public workshops** and **1 case study/blog post**, plus compatibility maintenance across newer Splice releases.  
* Demonstrated functionality via scripts, demos, and documentation showing:  
  * Installation from standalone Go-based binaries on macOS and Linux without requiring users to install a programming language runtime.  
  * One-command LocalNet startup and teardown, including named-instance isolation, explicit port configuration, and snapshot/restore workflows.  
  * Docker prerequisite handling with clear failures when Docker is missing, unreachable, lacks Compose v2, has insufficient resources, or has port conflicts.  
  * Web UI covering the same LocalNet management features as the CLI.  
  * Working Grafana dashboards for throughput, latency, and resource usage on a sample DApp.  
  * Upload, list, inspect, and diff DAR packages across multiple participants of a named LocalNet, including an optional `dpm`-backed build+upload shortcut and watch-mode hot redeploy.  
  * Browse the Active Contract Set and transaction history live via both CLI and Web UI, with an explicit per-party visibility projection.  
  * Optional AI agent skill documents demonstrating use of documented `canton-devkit` commands to manage a named LocalNet, upload a DAR, and inspect resulting packages/contracts without requiring editor-specific integration.  
  * CIP-56 token creation wizard, and CIP-56 token flows (mint, transfer, burn, balance) on LocalNet.  
* Documentation and knowledge transfer sufficient for developers to install, run, and extend DevKit.  
* Evidence that feedback loops from external users are incorporated into releases (bug fixes, UX improvements, and docs updates).

---

## Funding

**Total Funding Request:**

Total: **1,665,900 CC** over **12 months**.

### Payment Breakdown by Milestone

* Milestone 1 (LocalNet Management — CLI): 555,300 CC upon committee acceptance.  
* Milestone 2 (Web UI, Observability, Monitoring, DAR & Contract Tooling, Optional AI Agent Skill Documents): 555,300 CC upon committee acceptance.  
* Milestone 3 (Token Faucets & CIP-56 Token Tooling): 555,300 CC upon final release and acceptance.  
* Milestone 4 (Maintenance and Marketing): 0 CC upon completion (costs covered by Milestones 1–3 payments through month 12).

Funding is requested in Canton Coin, consistent with the Development Fund's CC‑denominated, milestone‑based grants model under CIP‑100.

### Volatility Stipulation

The proposed project duration is 9 months (core development, followed by 3 months of maintenance).

* The grant is denominated in a fixed amount of Canton Coin (**1,665,900 CC**) with milestone allocations as above, and will be subject to re‑evaluation at the 6‑month mark to account for material CC/USD volatility, in line with the Fund's governance guidelines.  
* If scope changes or delays requested by the Committee extend timelines beyond the original plan, remaining milestones and CC amounts can be renegotiated by mutual agreement.
* The token tooling will only support CIP-56 token standard, any other token standards released during the project will require re-negotiation of the milestone scope and funding.

---

## Team Background

### BitDynamics

BitDynamics brings deep experience in building and operating blockchain infrastructure. The team has worked across Ethereum client infrastructure, validator operations, and production-grade hosting systems supporting validator infrastructure securing more than 2 billion USD in assets. This background is directly relevant to building reliable, auditable, and security-conscious public infrastructure for a grants program. Team is also building actively on Canton. 

---

## Co-Marketing

Upon release of major components (e.g., first public DevKit release, explorer, token tooling), the implementing entity will collaborate with the Canton Foundation on:

* Coordinated announcements highlighting DevKit as shared developer tooling for the ecosystem.  
* A case study or technical blog post explaining how DevKit simplifies LocalNet workflows and token experimentation.  
* Participation in developer‑focused promotion such as workshops, hackathons, office hours, or webinars showcasing DevKit usage.

---

## Motivation

The Splice source code for Canton already provides a LocalNet environment, but developers must manually manage Docker, configs, and observability and often build ad‑hoc tools for exploring transactions, contract state, and token operations. This slows down onboarding for new teams, workshops, and hackathons, and leads to fragmented, privately maintained tooling rather than shared public goods.

By consolidating one‑click LocalNet lifecycle management, observability and token tooling into a single CLI tool suite, the proposal significantly lowers the barrier to entry for building on Canton. It directly supports the Fund's aim to back developer tooling and critical infrastructure that act as common goods and deliver long‑term value across the ecosystem.

---

## Rationale

Reducing the operational overhead of local development is a prerequisite for sustainable ecosystem growth; developer time reclaimed from infrastructure management translates directly into faster application delivery and broader adoption. Delivering functionality in three incremental, self‑contained milestones enables early value (one‑click LocalNet) and iterative refinement (metrics, tokens) with clear checkpoints for the Committee.

Alternative approaches—such as separate, uncoordinated tools for observability, explorers, and token tooling—would increase maintenance burden and fragment the developer experience. A unified Canton DevKit CLI tool suite offers a single, opinionated path that can offer an alternative to the existing tooling for local development, while remaining extensible so the community can adapt it to evolving needs and future CIPs.
