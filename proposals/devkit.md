## Development Fund Proposal

**Author:** Zhe Li (BitDynamics)

**Status:** Submitted  

**Created:** 2026-02-22

---

## Abstract

Canton DevKit is a native DPM component and standalone CLI for LocalNet operations, debugging, observability, and CIP-0112 (token standard V2) testing for the Canton network. Distributed primarily as a DPM component that registers a single "localnet" top-level command, DevKit integrates directly into the existing DPM toolchain — developers install it via dpm install package and access all features as "dpm localnet <subcommand>". It is also available as a standalone CLI ("canton-devkit") for users who do not use DPM.
DevKit packages common LocalNet workflows into the dpm localnet command tree and an embedded Web UI: starting and managing named LocalNets, inspecting services and endpoints, uploading and inspecting DARs, exploring live contracts and transactions, viewing developer-focused observability dashboards, and testing CIP-0112 token flows locally. It builds on the existing Splice LocalNet and DPM toolchains rather than replacing them.

---

## Specification

### 1. Objective

According to the [Canton Network Developer Experience and Tooling Survey](https://forum.canton.network/t/canton-network-developer-experience-and-tooling-survey-analysis-2026/8412), 41% of respondents cited Environment Setup & Node Operations as the task that took the longest to "get right." Developers are currently forced to be infrastructure engineers before they can be product builders.

The current official LocalNet stack creates significant friction for onboarding, workshops, hackathons, and automated development workflows because it requires users to manually manage Docker containers, configuration files, environment variables, observability setup, and ad-hoc scripts for inspection and token operations. The survey also rated Local Development Frameworks as the most critical need, with specific mentions of tools like Hardhat, Foundry, and Anchor — a unified CLI toolchain that helps with orchestrating local node environments and automating testing and deployment pipelines without complex manual configuration.

DevKit targets the following use cases:

* Local app development, particularly with multiple participants
* Integration and end-to-end testing
* CI/CD flows
* Demos, workshops, and other repeatable/controlled environments

The goal is to deliver a complementary DevKit for local Canton development. This maintained tooling will enable any developer or automation workflow to manage the complete lifecycle of one or more LocalNets using simple commands or a UI, monitor and explore activity, and experiment with CantonCoin and CIP-0112 flows locally.

### 2. Implementation Mechanics
(Explain how the solution will be implemented. Include technologies, components, workflows, and operational approach.)

The solution is delivered primarily as a **native DPM component** that registers a single top-level `localnet` command, and additionally as a **standalone CLI application** (`canton-devkit`). It will be implemented in **Go** and the same binary serves both distribution paths. DPM users install DevKit via `dpm install package` and invoke commands as `dpm localnet ...`; standalone users install a native binary and invoke commands as `canton-devkit localnet ...`. End users will not need Go, Node.js, Python, Rust, or a source checkout to run it. DevKit uses Docker containers to run LocalNet, and packages the developer experience into a single binary that requires no git clone, no Makefile knowledge, and no manual environment variable setup. It will also include other optional helper services that developers can enable or disable as needed.

Throughout this document, commands are shown in their DPM form (`dpm localnet ...`). Standalone users invoke the same commands by replacing `dpm` with `canton-devkit` (e.g. `canton-devkit localnet up`). Both forms execute the same code path.

DevKit will support all platforms: macOS (apple silicon), Linux, and Windows from the start.

#### Distribution and Runtime Requirements

DevKit's primary distribution path is a native DPM component published to an OCI registry. Users add a reference (e.g. `oci://<registry>/canton-devkit:<version>`) to the `components` section of their `daml.yaml` or `multi-package.yaml` and run `dpm install package`. DPM then exposes DevKit as a single top-level `localnet` command (e.g. `dpm localnet up`, `dpm localnet dar upload`). Nesting all DevKit features under one top-level command keeps the DPM integration surface minimal and avoids naming conflicts with existing or future DPM builtins.

Additionally, DevKit will be published as a standalone Go binary through GitHub Releases with checksums. The initial artifact set will target macOS (apple silicon), Linux, and Windows. Optional convenience install paths such as Homebrew where appropriate and/or an install script may be provided. The standalone path serves users who do not have or want DPM installed (for example DevOps engineers, CI pipelines, and workshop facilitators) and exposes the same command tree under the `canton-devkit` binary name.

DevKit will not install or bundle Docker. A working Docker runtime is the only required local system dependency because DevKit orchestrates the existing Splice LocalNet container stack rather than replacing it. DevKit will not modify Docker daemon configuration, install system packages, or change user permissions on the host.

#### Docker Handling

`dpm localnet up` (or `canton-devkit localnet up`) will run Docker preflight checks before starting LocalNet, including Docker CLI availability, daemon connectivity, Docker Compose v2, required ports, disk space, memory suitable for the Splice LocalNet stack, and host-specific prerequisites such as Linux Docker permissions or Docker Desktop availability on macOS/Windows. If a check fails, DevKit will provide platform-specific remediation instructions instead of modifying the host system.

DevKit will manage LocalNet resources through deterministic Docker Compose project names and labels, so named LocalNets can be started, inspected, logged, stopped, snapshotted, and cleaned without affecting unrelated Docker containers, networks, or volumes. It will also make port allocation explicit for named instances and print the actual endpoints selected for each LocalNet.

#### Relationship to Existing Tooling

Canton already ships several developer tools. The DevKit is designed to complement them, not to replace them:

| Existing Tool | DevKit Relationship |
|---|---|
| **DPM** (`dpm`) | DevKit is distributed as a **native DPM component** that registers a single `localnet` top-level command, so DPM users access all DevKit features as `dpm localnet <subcommand>` (e.g. `dpm localnet up`, `dpm localnet dar upload`, `dpm localnet contracts ls`). Command naming will be coordinated with the DPM maintainers to avoid conflicts with future builtins. |
| **Existing LocalNet setup in Splice codebase** | Splice LocalNet remains the underlying runtime. DevKit selects and version-pins known Splice LocalNet artifacts, generates local configuration, manages Docker lifecycle, exposes endpoints, health, logs, snapshots, and explorer workflows, while still allowing developers to use raw Splice LocalNet directly. |
| **`cn-quickstart` and official getting-started flows** | DevKit does not decide what official docs should recommend or replace quickstart content. It can provide a repeatable LocalNet lifecycle and inspection layer for quickstart-style development, workshops, and demos. |
| **Daml Shell** | DevKit does **not** replace Daml Shell. Developers who prefer a REPL continue to use it. DevKit complements it with a CLI + Web UI experience that spans **multiple participants of a named LocalNet**, adds DAR package management, and surfaces ACS and transaction views in a visual explorer. |

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

Compatibility with breaking Splice releases follows a best-effort model: the implementing team owns compatibility patches within a documented support window (or explicit cutoff) for each major Splice line, and will communicate timelines early when upstream breaking changes land so teams can plan upgrades. If ecosystem demand justifies it, stricter turnaround commitments (for example an SLA-style support tier) could be introduced by mutual agreement with the Committee without changing the default grant expectations.

###### LocalNet Configuration Model

DevKit will make the important LocalNet inputs explicit: instance name, Splice version, port settings, enabled optional services, observability settings, startup DAR uploads, and LocalNet-only token test setup. The initial scope does not require a full topology language; the priority is a predictable, documented configuration surface for common local development, workshop, and CI workflows.

###### New dpm Commands

The core lifecycle commands are part of the first usable CLI release. Automation and diagnostic conveniences such as environment export, instance discovery, richer status formats, and host diagnostics are added incrementally as the CLI matures.

| Command | Purpose | Expected Output / Behavior |
|---|---|---|
| `dpm localnet up --name <name> [--version <version>]` (or `canton-devkit localnet up ...` standalone) | Start a named LocalNet | Runs Docker preflight checks, selects the requested Splice LocalNet version, starts services, waits for readiness, and prints endpoints and credential locations. |
| `dpm localnet down --name <name>` | Stop a named LocalNet | Stops DevKit-managed services for that instance without touching unrelated Docker resources. |
| `dpm localnet restart [service] --name <name>` | Restart an instance or service | Restarts the full LocalNet or one service and re-runs readiness checks. |
| `dpm localnet clean --name <name>` | Remove LocalNet resources | Removes DevKit-managed containers, networks, and volumes for the named instance after confirmation. |
| `dpm localnet status --name <name>` | Inspect health | Shows service health, selected Splice version, ports, participant readiness, wallet/scan URLs, and next troubleshooting steps when unhealthy. |
| `dpm localnet logs [service] --name <name>` | Debug services | Streams or tails logs with optional service filtering. |
| `dpm localnet snapshot/restore --name <name>` | Save or replay state | Captures or restores LocalNet state for demos, workshops, and repeatable testing. |
| `dpm localnet env --name <name>` | Export app/test config | Prints `.env`-style values for Ledger API, JSON API, admin API, wallet UI, scan UI, parties, and users. |
| `dpm localnet list` | Discover instances | Lists DevKit-managed LocalNets and their state without touching unrelated Docker resources. |
| `dpm localnet doctor` | Diagnose host readiness | Checks Docker, Compose v2, permissions, ports, memory, disk, and supported platform assumptions. |

The **standalone** binary exposes the same command tree; invoke it with `canton-devkit` instead of `dpm`, for example:

```
canton-devkit localnet up
```

###### Web UI Features

The Web UI will provide a LocalNet dashboard showing named instances, service health, selected Splice version, endpoints, ports, credential locations, participant readiness, and recent logs. It will include service-level log views, participant/party/package views, links into Grafana dashboards, and quick actions for common LocalNet lifecycle operations such as start, stop, restart, status, and cleanup.

##### DAR Management

Today developers upload DARs to each LocalNet participant manually (via `daml ledger upload-dar`, the JSON API, or the Canton Console), and there is no built-in way to inspect, diff, or hot-redeploy packages across a multi-participant LocalNet. DevKit closes that gap without replicating `dpm build` / `daml build` — it accepts pre-built DAR files and, when `dpm` is available, offers a `build-upload` convenience shortcut that delegates compilation to `dpm` and then uploads the resulting DAR to LocalNet participants in a single step.

###### New dpm Commands
* `dpm localnet dar upload <path> [--participant <name> | --all-participants] [--vet] [--dry-run]` (or `canton-devkit localnet dar upload ...` standalone) — upload a DAR to one or all participants of the active (or `--name`-selected) LocalNet, optionally vetting for Smart Contract Upgrade (SCU).
* `dpm localnet dar list [--participant <name>]` — list uploaded packages with package ID, name, version, Daml-LF version, module count, upload time, and vetting status.
* `dpm localnet dar info <package-id|package-name>` — show modules, templates, interfaces, choices, fields, dependencies, and hash for a package.
* `dpm localnet dar download <package-id> [--out <file>]` — fetch a DAR back from a participant.
* `dpm localnet dar diff <package-a> <package-b>` — human-readable diff of templates/choices/fields between two package versions, with SCU-compatibility signals (name/version/LF-version/field deltas).
* `dpm localnet dar remove <package-id>` — unvet / remove where supported by the participant admin API.
* `dpm localnet dar build-upload [--project <path>]` — convenience shortcut that invokes `dpm build` (or `daml build`) and uploads the resulting DAR to LocalNet participants in a single step; skipped with a clear message if `dpm` is not available.
* `dpm localnet dar watch <project>` — watch mode: rebuild via `dpm build` and re-upload to selected participants on source change for a hot-deploy loop.

###### Web UI Features
* Drag-and-drop DAR upload with per-participant vetting toggles.
* Package explorer tree: modules → templates → choices → fields (with types), interfaces, dependencies, and hashes.
* SCU-aware diff viewer between any two package versions.
* Hot-deploy indicator showing the last watch-mode upload and its status per participant.

###### Scope Boundaries
* DevKit is **not** a Daml compiler. It delegates to `dpm build` / `daml build` and will not duplicate DPM functionality.
* SCU-compatibility output is best-effort based on package metadata and structural comparison — authoritative upgrade validation remains the responsibility of the Ledger API and `daml` tooling.

##### Contract Tracking & Exploration

The proposal already notes that developers "often build ad-hoc tools for exploring transactions, contract state, and token operations." DevKit ships a shared, privacy-aware explorer for the Active Contract Set (ACS) and transaction history across one or more named LocalNets, so teams stop rebuilding the same inspector.

The first-pass scope is the **live** view: ACS table, transaction list, and detail views backed by Ledger API v2. Historical / archived-contract search via PQS is explicitly deferred.

###### New dpm Commands
* `dpm localnet contracts ls [--template <FQN>] [--party <p>] [--participant <n>] [--active | --archived | --all]` (or `canton-devkit localnet contracts ls ...` standalone) — list ACS entries with filters.
* `dpm localnet contracts show <contract-id>` — pretty-print payload, signatories, observers, creation transaction, archival transaction (if any), package/version, and interface views.
* `dpm localnet contracts watch [filters]` — live tail of create/archive events, similar to `kubectl get -w`.
* `dpm localnet contracts export [filters] [--format json|csv]` — snapshot the filtered ACS to a file for test fixtures or diffing.
* `dpm localnet tx ls [--party <p>] [--from <offset>] [--to <offset>] [--template <FQN>]` (or `canton-devkit localnet tx ls ...` standalone) — list transactions with filters.
* `dpm localnet tx show <tx-id|offset>` — render the transaction as a tree of creates and (nested) exercises, with contract IDs and choice arguments.
* `dpm localnet tx replay <tx-id>` — reconstruct the per-party visibility projection ("what this party sees") for debugging privacy and authorization issues.

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

DevKit does not rebuild the observability stack from scratch. Instead, it bundles and configures a Prometheus/Grafana stack tailored for LocalNet, with ongoing optimization of that stack where practical.

* Per-component toggles for Prometheus, Grafana so developers enable only what they need.
* A single observability stack can serve multiple LocalNet instances on the host, reducing duplicated overhead when several environments are in use.
* Ships Canton-specific Grafana dashboard presets focused on DApp developers (as opposed to operator-level dashboards): transactions/sec, command completion latency, active contract counts, and per-template throughput.
* Adds a `dpm localnet metrics` subcommand (or `canton-devkit localnet metrics` standalone) that prints Grafana dashboard URLs and a concise text summary of key metrics (throughput, latency p50/p99, resource usage) for quick terminal-based checks.
* Documents how teams can extend or customize dashboards for their own services.

##### Optional AI Agent Skill Documents

DevKit may provide optional, editor-agnostic AI agent skill documents that describe safe workflows for invoking documented `dpm localnet` commands (or the equivalent `canton-devkit localnet` commands for standalone users). These documents are auxiliary documentation artifacts layered on top of the stable CLI; they are not part of the core runtime and do not prescribe how developers write code or which editor or agent they use.

Example workflows include starting or stopping a named LocalNet, checking readiness with `dpm localnet status`, tailing logs with `dpm localnet logs [service]`, uploading a pre-built DAR, listing deployed packages, inspecting active contracts, and reporting LocalNet readiness. Where compilation is needed, the workflow delegates to existing Daml tooling such as `dpm build` and then uses DevKit only for LocalNet deployment and inspection.

Initial examples may be provided for Claude and Codex-style agent formats, but the supported integration surface is the stable `dpm localnet` (and equivalent `canton-devkit localnet`) CLI rather than any specific editor or AI platform.

##### Local Token Faucets & Token Standard Toolkit (CIP-0112)

LocalNet already ships wallet UIs and a Registry API for token transfers, but developers still lack a CLI-driven faucet and a guided token-creation flow for everyday token operations. DevKit closes those gaps for LocalNet testing: it helps developers exercise token registration and common token flows before integrating with production-grade wallet, registry, custody, or compliance infrastructure.

The token wizard and convenience commands (Milestone 3) target CIP-0112 first, so new projects align with the expected direction. CIP-56 (V1) compatibility and V1→V2 migration helpers remain optional and may be scoped to a later milestone or post-grant workstream depending on ecosystem demand and feedback during implementation.

DevKit will use the LocalNet Ledger API, wallet UI/API, and registry APIs where available, but it will not act as a production issuer, custodian, wallet provider, or dApp connectivity layer. The committed token scope for this grant is Canton token-standard testing on LocalNet centered on CIP-0112 (V2) as primary; support for other token standards or a broad dual-V1/V2 product surface would require explicit scope renegotiation.

* `dpm localnet token create` (or `canton-devkit localnet token create` standalone) — interactive "token wizard" to define new tokens (name, symbol, decimals, initial supply) and mint to test wallets, aligned with CIP-0112 semantics as the default path.
* `dpm localnet token [mint | transfer | burn | balance] {token-name} {amount} [--to wallet]` — convenience commands wrapping the Ledger API / Registry API for common token operations on that default path.

### 3. Architectural Alignment

The Canton DevKit removes the friction of managing local test environments so developers can focus on building their applications. It aligns with the Development Fund's remit to support developer tooling and critical infrastructure as common goods, and is consistent with the milestone‑based, CC‑denominated funding and governance model formalized under CIP‑100. Token tooling is designed to follow the CIP-0112 (Token Standard V2) direction (evolving CIP-56), making it easier for developers to test tokenized applications and integrations in a way that reflects Mainnet patterns.

### 4. Backward Compatibility

The Canton DevKit primarily targets LocalNet developer environments and does not change Canton protocol behavior, Daml semantics, or existing production deployments. Developers can continue using the Splice LocalNet Docker stack.

No backward compatibility impact.

---

## Milestones and Deliverables

### Milestone 1: LocalNet Management — CLI

- **Estimated Delivery:** Month 3  
- **Focus:** Single-command LocalNet lifecycle management via CLI.  
- **Deliverables /  Metrics:**  
  - `dpm localnet up/down/restart/clean/status/logs` CLI commands (and equivalent `canton-devkit localnet ...` standalone commands) with auto-generated configs, keys, identities, and printed endpoints and credentials.  
  - Version pinning (`--version`) and basic named-instance isolation (`--name`) using deterministic Docker Compose project names, labels, and explicit port configuration.  
  - Snapshot and restore (`dpm localnet snapshot/restore`) for saving and replaying LocalNet state.  
  - **Native DPM component packaging** (`component.yaml` plus OCI publishing in the release CI) so DevKit is installable via `dpm install package` from Milestone 1 onward.  
  - Standalone Go binary release artifacts for macOS arm64, Linux amd64, and Windows amd64, published with checksums (same binary as the DPM component).
  - Installation and "Getting Started" guide for both DPM-component and standalone install paths on macOS, Linux, and Windows, including Docker prerequisite checks and troubleshooting.
  - Docker preflight checks in `dpm localnet up` for Docker CLI availability, daemon connectivity, Docker Compose v2, required ports, disk space, memory, and host-specific prerequisites such as Linux Docker permissions or Docker Desktop availability on macOS/Windows.
  - Basic `dpm localnet doctor` diagnostics covering Docker CLI availability, daemon connectivity, Docker Compose v2, platform support, required ports, disk space, memory, and host-specific prerequisites.
  - Deterministic exit codes and readiness wait behavior suitable for basic headless automation.  
  - Compatibility matrix documenting the initially supported Splice LocalNet version and supported macOS/Linux/Windows platforms.
  - Demo script showing startup, readiness, status, logs, teardown, and one two-instance run using explicit non-conflicting ports.  
  - Internal testing plus at least one external tester validating that a new developer can go from zero to running LocalNet in under 10 minutes.  
- **Adoption Metrics:** at least 3 companies/teams have reviewed the tool and tested it for LocalNet setup and lifecycle usage.

### Milestone 2: Web UI, Observability, Monitoring, DAR & Contract Tooling, Optional AI Agent Skill Documents

- **Estimated Delivery:** Month 6  
- **Focus:** Web UI for LocalNet management, integrated observability, DAR package management, live contract and transaction exploration, and optional AI agent skill documents.  
- **Deliverables / Value Metrics:**  
  - Web UI covering all CLI features from Milestone 1 with a user-friendly interface.  
  - Richer LocalNet automation conveniences, such as machine-readable status output, environment export for app/test configuration, named-instance discovery, enriched `doctor` diagnostics, and deeper troubleshooting guidance.  
  - Example CI workflow demonstrating LocalNet startup, readiness wait, optional DAR upload, test execution, and teardown.  
  - Bundled Prometheus/Grafana stack with per-component enable/disable, sensible lightweight defaults, and documentation of minimum practical resources when the full stack is enabled.  
  - Canton-specific Grafana dashboard presets focused on DApp developers: transactions/sec, command completion latency, active contract counts, and per-template throughput.  
  - `dpm localnet metrics` subcommand printing Grafana dashboard URLs and a concise text summary of key metrics (throughput, latency p50/p99, resource usage).  
  - DAR management CLI (`dpm localnet dar upload/list/info/download/diff/remove/build-upload/watch`) with multi-participant support, optional `dpm build` integration, and SCU-aware diff signals.  
  - DAR Web UI with drag-and-drop upload, per-participant vetting toggles, package explorer tree, diff viewer, and hot-deploy indicator.  
  - Contract tracking CLI (`dpm localnet contracts ls/show/watch/export` and `dpm localnet tx ls/show/replay`) backed by Ledger API v2.  
  - Contract tracking Web UI "Explorer" with live ACS table, transaction timeline, contract detail drawer, and explicit per-party visibility projection.  
  - Optional AI agent skill documents demonstrating safe `dpm localnet` workflows for LocalNet lifecycle, DAR upload, package inspection, contract queries, and log/status checks.  
  - Documentation on recommended usage, dashboard customization, DAR workflows, contract explorer usage, and optional AI agent skill documents.  
- **Adoption Metrics:** at least 5 companies/teams have started using it in their daily Canton development workflow.

### Milestone 3: Token Faucets & Token Standard Tooling (CIP-0112)

- **Estimated Delivery:** Month 9  
- **Focus:** CantonCoin / Token Standard tooling and UX polish, CIP-0112.  
- **Deliverables / Value Metrics:**  
  - `dpm localnet token mint` CLI and Web UI minting for tokens on LocalNet on the CIP-0112 path.  
  - `dpm localnet token create` interactive token wizard defining new tokens (name, symbol, decimals, initial supply) aligned with CIP-0112 as the default.  
  - `dpm localnet token transfer / burn / balance` convenience commands wrapping the Ledger API / Registry API for that path.  
  - Expanded regression coverage across the supported macOS, Linux, and Windows targets, UX polish across CLI and Web UI, and consolidated documentation, FAQs, and troubleshooting guides (including explicit note of CIP-0112 scope and optional future CIP-56 support per ecosystem demand).
- **Adoption Metrics:** at least 7 external projects/teams demonstrate a LocalNet workflow on the CIP-0112 path.

### Milestone 4: Adoption Validation and Ecosystem Outreach

- **Estimated Delivery:** Month 12  
- **Focus:** Demonstrate meaningful external adoption of DevKit and publish ecosystem-facing validation artifacts.  
- **Deliverables / Value Metrics:**  
  - Document at least 5 external apps/projects using DevKit in real development or testing workflows, evidenced by issue reports, demos, written feedback, case studies, or maintainer attestations.  
  - Publish a short adoption transparency update in release notes or changelog entries, including release/download/install trends, stars/forks/watchers (labeled as visibility), and telemetry aggregates if enabled.  
  - Report progress toward a composite floor of at least 250 cumulative installs/downloads across supported distribution channels (for example: GitHub Releases, Homebrew, install script).  
  - Track external feedback through issues, release notes, or documented changelog entries.  
  - Host 2 online/offline workshops about the Canton DevKit.  
  - Publish 1 case study or blog post.
- **Adoption Metrics:** at least 5 external apps/projects are actively using DevKit in real development or testing workflows by Milestone 4 acceptance.

### Adoption Measurement

Meaningful external adoption is evaluated using a composite view rather than any single KPI, no single public metric is treated as definitive proof on its own.

DevKit adoption reporting will combine:

* Installation-oriented signals (GitHub release downloads, package-manager installs such as Homebrew where available, and install-script usage counts where applicable).
* Visibility signals (GitHub stars, forks, watchers) used as discoverability indicators rather than direct usage proof.
* Privacy-preserving telemetry aggregates (if implemented), with clear documentation and user opt-out controls.
* Qualitative usage evidence such as issue reports, demos, case studies, feedback notes, or maintainer attestations from external teams/projects.

Milestone 4 targets documented adoption across at least 5 external apps/projects, supported by a composite floor of at least 250 cumulative installs/downloads across supported channels and the qualitative evidence above.

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

* Delivery of the Canton DevKit capabilities specified for each milestone.  
* **Milestone-specific adoption criteria:**  
  * **Milestone 1:** 3 external companies/teams have installed DevKit (via the DPM component, the standalone binary, or both) and successfully run `localnet up/status/down` across the supported macOS, Linux, and Windows environments, including at least one validated Windows installation/run, with at least one tester validating named-instance isolation using explicit non-conflicting ports.  
  * **Milestone 2:** 5 external companies/teams or representative Canton deployments have used the Web UI, DAR workflow, contract explorer, transaction explorer, or observability workflow against their own DAR/application and provided feedback artifacts.  
  * **Milestone 3:** At least 7 external projects/teams demonstrate a LocalNet workflow on the CIP-0112 path such as `create -> mint -> transfer` or `mint -> transfer -> burn` and provide feedback or demo artifacts.  
  * **Milestone 4:** Meaningful external adoption is demonstrated through at least 2 public workshops, 1 case study/blog post, documented usage by at least 5 external apps/projects in real development or testing workflows, and at least 250 cumulative installs/downloads across supported distribution channels; this is evaluated with composite evidence (downloads/installs + optional telemetry + visibility signals + direct feedback/case-study evidence), not any single metric in isolation.  
* If the optional Maintenance & Compatibility Extension is approved, completion of that extension would be evaluated based on a maintained compatibility matrix for supported Splice releases/platforms, smoke tests against newer Splice releases, published compatibility notes, patch releases for compatibility fixes and high-priority bugs, and documented incorporation of user feedback during the extension term.  
* Acceptable adoption and feedback evidence includes GitHub issues, pull requests, release notes, written feedback, demo recordings, workshop materials, case studies, Committee acceptance notes, release/download/install statistics, documented telemetry summaries (if enabled), and repository visibility metrics when reported as trends.  
* Demonstrated functionality via scripts, demos, and documentation showing:  
  * Installation via the **native DPM component** (`dpm install package`) as the primary path, and via the standalone Go binary on macOS, Linux, and Windows as the additional path; neither requires users to install a programming language runtime.  
  * Single-command LocalNet startup and teardown, including named-instance isolation, explicit port configuration, and snapshot/restore workflows.  
  * Docker prerequisite handling with clear failures when Docker is missing, unreachable, lacks Compose v2, has insufficient resources, or has port conflicts.  
  * Web UI covering the same LocalNet management features as the CLI.  
  * Working Grafana dashboards for throughput, latency, and resource usage on a sample DApp.  
  * Upload, list, inspect, and diff DAR packages across multiple participants of a named LocalNet, including the `dpm`-backed `dar build-upload` convenience command and watch-mode hot redeploy.  
  * Browse the Active Contract Set and transaction history live via both CLI and Web UI, with an explicit per-party visibility projection.  
  * Optional AI agent skill documents demonstrating use of documented `dpm localnet` commands (or equivalent `canton-devkit localnet` commands) to manage a named LocalNet, upload a DAR, and inspect resulting packages/contracts without requiring editor-specific integration.  
  * Token creation wizard and token flows (mint, transfer, burn, balance) on LocalNet targeting CIP-0112 as the default; optional CIP-56 support is out of scope for the committed acceptance bar unless later agreed.  
* Documentation and knowledge transfer sufficient for developers to install, run, and extend DevKit.  
* Evidence that feedback loops from external users are incorporated into releases (bug fixes, UX improvements, and docs updates).

---

## Funding

**Total Funding Request:**

Base proposal total: **1,900,000 CC** over **12 months**.

### Payment Breakdown by Milestone

* Milestone 1 (LocalNet Management — CLI): 400,000 CC upon committee acceptance.  
* Milestone 2 (Web UI, Observability, Monitoring, DAR & Contract Tooling, Optional AI Agent Skill Documents): 400,000 CC upon committee acceptance.  
* Milestone 3 (Token Faucets & Token Standard Tooling, CIP-0112): 500,000 CC upon final release and acceptance.  
* Milestone 4 (Adoption Validation and Ecosystem Outreach): 600,000 CC upon committee acceptance.

### Optional Maintenance & Compatibility Extension

An additional **600,000 CC** is proposed as a separate optional extension covering **12 months** of post-grant maintenance and Splice upgrade support after completion of the base proposal.

If approved, this optional extension would cover:

* Maintaining a documented compatibility matrix for supported Splice releases and platforms, consistent with the support-window / best-effort policy described under Splice Version Compatibility.
* Running smoke tests against newer Splice releases and publishing compatibility notes.
* Shipping patch releases for compatibility fixes and high-priority user-reported bugs.
* Ongoing incorporation of external feedback into maintenance releases.

This optional extension is not included in the **1,900,000 CC** base proposal total above. If approved in addition to the base proposal, the combined total would be **2,500,000 CC**.

Funding is requested in Canton Coin, consistent with the Development Fund's CC‑denominated, milestone‑based grants model under CIP‑100.

### Volatility Stipulation

The proposed base project duration is 12 months, with Months 1-9 focused on core delivery and Months 10-12 focused on adoption validation and ecosystem outreach.

* The base grant is denominated in a fixed amount of Canton Coin (**1,900,000 CC**) with milestone allocations as above, and will be subject to re‑evaluation at the 6‑month mark to account for material CC/USD volatility, in line with the Fund's governance guidelines.  
* If scope changes or delays requested by the Committee extend timelines beyond the original plan, remaining milestones and CC amounts can be renegotiated by mutual agreement.
* If the optional Maintenance & Compatibility Extension is approved, its support term, checkpoints, and CC allocation can be finalized by mutual agreement through the Committee process.
* The committed token tooling targets CIP-0112 as the default path; optional CIP-56 compatibility or other token standards would require renegotiation of milestone scope and funding if pursued within the grant period.

### Post-grant sustainability

The base twelve-month grant is structured to deliver the product and validate adoption using the milestone adoption metrics above. Beyond that window, sustainable operation may take the form of the optional Maintenance & Compatibility Extension described above, continued open-source/community-led maintenance, and/or handover or closer alignment with Digital Asset or the Canton Foundation—whichever the Committee judges best, informed by adoption evidence from the milestones. Nothing in this proposal binds the Foundation or Digital Asset to take ownership absent mutual agreement through the Fund’s governance process.

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

By consolidating LocalNet lifecycle management, observability, and token testing into a single CLI and Web UI tool suite, the proposal significantly lowers the barrier to entry for building on Canton. It directly supports the Fund's aim to back developer tooling and critical infrastructure that act as common goods and deliver long‑term value across the ecosystem.

---

## Rationale

Reducing the operational overhead of local development is a prerequisite for sustainable ecosystem growth; developer time reclaimed from infrastructure management translates directly into faster application delivery and broader adoption. Delivering functionality in three incremental, self‑contained milestones enables early value (single-command LocalNet lifecycle management) and iterative refinement (metrics, tokens) with clear checkpoints for the Committee.

Success is measured through sustained, multi-signal adoption trends over time that combine team usage, installation-oriented indicators, and external feedback evidence.

Separate, uncoordinated tools for observability, explorers, and token testing would increase maintenance burden and fragment the developer experience. A unified Canton DevKit CLI and Web UI tool suite offers a complementary local workflow layer over existing Canton tooling, while remaining extensible so the community can adapt it to evolving needs and future CIPs.
