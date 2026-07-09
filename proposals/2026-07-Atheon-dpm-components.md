## Development Fund Proposal

**Author:** Atheon
**Status:** Submitted
**Created:** 2026-06-29
**Label:** daml-tooling
**Champion:** Need Champion

---

## Abstract

DPM gives Canton developers a clean local loop new, build, test, sandbox, codegen but that loop ends before an application reaches a ledger. Every step after local testing (uploading DARs, allocating parties, deploying, inspecting the ACS, querying contracts, advanced testing) forces developers out of the CLI and into a patchwork of Canton Console, daml-shell, declarative config, and hand-written JSON/gRPC calls. This proposal delivers an open-source suite of DPM components that closes that gap end to end, so every command runs natively as `dpm <command>`: project scaffolding from community-publishable templates, native deployment commands, scriptable ledger-query and wallet commands, a real-time visual transaction explorer, a transaction log & trace plugin with human-readable error decoding, a traffic fee & reward estimation plugin, a ledger snapshot plugin for checkpoint/rollback of local state, and a property-based and invariant testing harness. It is a thin orchestration layer over existing Canton services (the JSON Ledger API, with PQS where available) that introduces no new ledger functionality and modifies no Canton internals, giving every Canton developer a Foundry-class command-line experience that respects Canton's party-scoped, privacy-first architecture.

---

## Specification

### 1. Objective

The objective is to deliver a unified, scriptable set of DPM commands, delivered as installable DPM components, that extends the DPM developer workflow from the point it currently ends, local testing through live-ledger deployment, inspection, and advanced testing.

The canonical DPM workflow today is `dpm new`, then `dpm build`, `dpm test`, `dpm sandbox`, and `dpm codegen-*`. After this point, essential operations have no first-class CLI command. To upload a DAR, allocate parties, deploy to a participant, or verify a deployment, developers must reach for one of the documented replacements for the removed `daml ledger` commands: the Declarative API, the Canton Console (a Scala REPL, also runnable non-interactively via `canton daemon --bootstrap`), or hand-written JSON/gRPC requests. Each works; none is a developer command line. The Declarative API is participant-operator configuration: it reconciles a declared desired state, but offers no one-shot verbs, no feedback loop, and nothing for inspection. Console `--bootstrap` scripts are CI-runnable (they exit non-zero on failure), but they mean writing and maintaining Scala against admin APIs, paying JVM startup on every invocation, and getting no structured stdout to pipe. Raw JSON/gRPC calls mean hand-rolling auth, JSON encoding, and error handling for every request. To inspect the Active Contract Set, read a single contract, or check an offset, developers must enter daml-shell (the PQS REPL) or the Console, and neither offers a documented non-interactive mode. The gap, precisely stated, is not that no path exists; it is that no first-class, one-shot, `--json` command surface exists that composes into shell pipelines and CI the way the rest of the DPM workflow does. And `dpm test`, while it supports deterministic unit tests and coverage, offers no fuzz testing, no stateful invariant testing, and no table-driven tests. This gap is a recurring developer complaint, see [forum thread](https://forum.canton.network/t/dpm-lacks-the-upload-dar-command/8341/2). Nor is the direction speculative: the DPM team has announced first-class support for community-built DPM components (dpm 1.0.21 / SDK 3.5.2), described as "npm plugins for Hardhat but built for the Canton stack," and its call for contributions explicitly names custom project templates, deployment helpers, fee estimators, and local dashboards, alongside testing, debugging, scaffolding, and observability tooling, as the high-value components it wants the community to build ([DPM Components: Extend the Canton Developer Stack](https://forum.canton.network/t/dpm-components-extend-the-canton-developer-stack/8822)). This proposal delivers that slate as one coherent, consistently designed suite.

 For comparison, Ethereum's Foundry toolchain lets a developer move from build to deployment to live-state inspection to advanced testing without ever leaving the command line (`forge create`, `forge script --broadcast`, `cast send`, `cast call`, and dozens of `cast` subcommands for chain and ABI queries). Canton developers have no equivalent.

The intended outcome is that a Canton developer can scaffold an application from a community template, deploy it, inspect ledger state, watch transaction flow in real time, manage parties and packages, submit transactions, estimate traffic costs and app rewards before submitting, trace every local run and debug failures from decoded errors, checkpoint and roll back local ledger state, and run property-based tests entirely from the command line scriptably, in CI, without dropping into an interactive REPL or hand-writing API requests. This is a single objective, restoring a first-class CLI for the post-build Canton workflow, delivered as one coherent component suite across milestones.

### 2. Implementation Mechanics

The components are built as a lightweight orchestration layer over existing Canton services. The default backend is the Canton JSON Ledger API -> `/v2/dars` (DAR upload), `/v2/parties` and `/v2/parties/external/*` (party allocation), `/v2/packages` (package listing), and `/v2/state/*` and `/v2/updates` (ledger queries: over plain HTTP `/v2/updates` is a bounded, blocking list query, which is exactly what one-shot commands need; the follow/tail mode and the explorer UI use its websocket streaming variant); the Participant Query Store (PQS) is used where available to enable advanced capabilities such as historical ACS queries and offset-based inspection. The components introduce no new ledger functionality; they coordinate endpoints that already exist behind ergonomic, scriptable commands.

**Why DPM components on the JSON API.** Targeting the JSON API avoids protobuf generation and a gRPC toolchain, enabling faster implementation and lower maintenance. The transport layer is abstracted so gRPC support can be added without reworking command logic.

**Party- and participant-scoped by design.** Canton has no global, readable state, state is inherently party-scoped and participant-scoped. The components treat this as a first-class design constraint rather than something to work around: every query command supports configurable `--party`, `--participant`, and `--offset` options, providing an ergonomic command line while fully preserving Canton's security and privacy model.



**Configuration over repetition.** To eliminate manual HTTP requests and repeated endpoint configuration, the components reads connection and deployment settings from a project configuration file describing named targets (local Sandbox, DevNet, or named participants), the DAR path, parties, and the synchronizer. Authentication tokens are referenced through environment variables rather than stored in the config file. An illustrative config:

```
[target.local]
json_api = "http://localhost:7575"
auth = { type = "none" }
# a default local sandbox runs with no auth configured, so no bearer token is
# required (any token sent is ignored). To exercise auth locally, configure the
# participant with unsafe-jwt-hmac-256 (HMAC-signed dev tokens, testing only)
# and switch to auth = { type = "bearer", token_env = "CANTON_LOCAL_DEV_TOKEN" }.

[target.devnet]
json_api = "https://devnet.participant.example/api"
auth = { type = "bearer", token_env = "CANTON_DEVNET_TOKEN" }
synchronizer = "global-synchronizer"

[deploy]
dar = "./.daml/dist/myproject-0.1.0.dar"
parties = ["Alice", "Bob"]
```

The component suite exposes eight coherent groups of commands.

**Project scaffolding.** A custom Daml template plugin extends `dpm new` beyond the built-in skeleton with community-publishable templates. Each template ships with a Daml scaffold, a frontend stub, a README, and the project configuration file described above, pre-wired with local sandbox and DevNet targets, the DAR path, and a CI example, so a scaffolded project works with the deployment, query, and testing commands from its first minute. Templates live in a public templates repository under the Canton Network Devs GitHub org: `dpm template list` surfaces the catalog, `dpm new --template <name>` fetches and instantiates one, and the community adds new templates via PR to the repo, gated by automated validation (the scaffold builds, its tests pass, README and config present). The plugin fetches templates at instantiation time, so new community templates become available without a component release.

```
dpm template list                     # browse the community catalog
dpm template info <name>              # README, structure, maintainer
dpm new <project> --template <name>   # scaffold: Daml + frontend stub + config + CI
```

**Deployment.** Native commands for the ledger-management operations currently missing from DPM. `dpm upload <dar>` uploads a DAR package. Party allocation and listing, and package listing, wrap the corresponding endpoints. The high-level `dpm deploy` command orchestrates the full sequence:
```text
Build DAR
      │
      ▼
Upload DAR
      │
      ▼
Allocate Parties(local, via POST /v2/parties)
      │
      ▼
Verify Deployment
```
behind a single developer-friendly command with sensible defaults, readable output, and configurable targets. Rather than introducing new deployment logic, it coordinates existing JSON API endpoints.


**Ledger querying, wallet, package and submission.** Scriptable, one-shot commands that replace REPL-gated inspection:

```
# Ledger queries
dpm query acs <template-fqn> [--party P] [--participant N] [--offset O] [--json]
dpm query contract <contract-id> [--party P] [--json]
dpm query updates [--template <fqn>] [--from-offset O] [--json]
dpm query updates --follow [--template <fqn>] [--json]   # live tail: stream events to stdout as they land
dpm query tx <update-id> [--json]
dpm query offset
dpm query packages [--json]

# Party & wallet management
dpm wallet parties list                          # GET  /v2/parties
dpm wallet parties allocate <party-name>         # POST /v2/parties        (local party, single call)
dpm wallet whoami                                # resolve configured hint → party-id
dpm wallet public-key [<party>]                  # export public key / fingerprint

# External-party signing (advanced, wraps the /v2/parties/external/* topology flow)
dpm wallet external allocate <party-name>        # generate-topology → external-sign → allocate
dpm wallet external sign <payload>               # sign a prepared submission with an external key
dpm wallet external import <key>                 # register an externally-held signing key

# Package & schema utilities
dpm resolve <template-fqn>
dpm encode choice <template-fqn> <choice> --args '{...}'
dpm decode <contract-or-event-json>
dpm hash package <dar>
dpm hash fingerprint <public-key>

# Transaction submission
dpm exercise <contract-id> <choice> --args '{...}'
```

Every command supports a `--json` flag so output composes cleanly into shell pipelines and CI, replacing REPL-gated inspection with command-gated, scriptable inspection.

Party allocation has two distinct paths. Local parties  where the participant holds the key, are a single POST /v2/parties call, exposed as dpm wallet parties allocate and reused by dpm deploy. External parties where the key lives outside the participant require Canton's external-signing topology flow (`/v2/parties/external/generate-topology` → external Ed25519 signing of a multi-hash → `/v2/parties/external/allocate`); these are grouped under `dpm wallet external *` and represent the most involved part of this command group.

**Transaction visualization.** Real-time exploration ships on two surfaces over one shared streaming backend: a terminal live tail and a visual explorer.

```
dpm query updates --follow               # CLI explorer: live tail of events in the terminal
dpm explorer [--target T] [--port P]     # UI explorer: localhost web UI over the configured target
```

Both explorers stream the same real-time feed (contract creates and archives, exercised choices, party disclosures, and fee charges, sourced from the participant's traffic/metering endpoints where the connected node exposes them), and differ only in how a developer consumes it:

| | CLI explorer | UI explorer |
|---|---|---|
| Command | `dpm query updates --follow` | `dpm explorer` |
| Interface | `tail -f`-style live stream to stdout | localhost web UI |
| Output | line-delimited JSON (`--json`) or human-readable text | visual real-time feed with per-event drill-down |
| Best for | SSH sessions, piping through `jq`/`grep`, CI logs | interactive debugging, watching a transaction unfold |
| Backend | websocket variant of `/v2/updates` (shared) | websocket variant of `/v2/updates` (shared) |

Both ride the same websocket backend the one-shot query commands use, with PQS enriching historical context where available, and like every other command in the suite they are party- and participant-scoped by construction: the feed renders exactly what the configured party is entitled to see, nothing more. Together with the one-shot `--json` commands for scripts and CI, this gives three complementary inspection surfaces without a REPL anywhere.

**Transaction logging & tracing.** A transaction log & trace plugin gives every local run a durable, structured record, and gives failures a readable explanation:

```
dpm trace list                       # recorded runs on this target
dpm trace show <run-id> [--json]     # full trace: command inputs, events, visibility, errors
dpm trace decode <error>             # decode a gRPC/Daml error to a human-readable message
```

On every sandbox or LocalNet run driven through the suite (`dpm deploy`, `dpm exercise`, fuzz and invariant campaigns), the plugin captures the full transaction detail into a structured, append-only log: the submitted command inputs, resulting create/archive events, party visibility, and abort/assert messages. Input capture is deliberately scoped to submissions made through the suite's own commands; activity from other clients still appears in the log with its events (from the update stream), but participant-side interception is explicitly out of scope. Capture happens at the API boundary, with no compiler, source-level, or node instrumentation. Error decoding is applied suite-wide, not just in traces: any `dpm` command that receives a structured Canton gRPC error surfaces it as a human-readable message pointing to the offending choice and contract, replacing the raw error dump that developers currently debug by web search. The trace format itself is a versioned, machine-readable schema (line-delimited JSON), designed as a stable substrate for downstream AI- and LLM-based developer tooling: automated test generation, error explanation, and agentic debugging can consume traces without scraping human-oriented output.

**Traffic fee & reward estimation.** A fee & reward estimation plugin answers the app-economics question no Foundry-equivalent ever had to: what will this transaction cost, and what will it earn?

```
dpm estimate choice <contract-id> <choice> --args '{...}'   # pre-flight a choice before exercising it
dpm estimate tx <command-json>                              # estimate a prepared command file
dpm estimate rewards [--app <id>]                           # projected app rewards per transaction
dpm exercise <contract-id> <choice> --args '{...}' --estimate   # dry-run flag on submission itself
```

Estimation is exact, not heuristic: the plugin submits the command to the JSON Ledger API's interactive-submission *prepare* endpoint, which runs the Daml interpreter and returns the transaction's synchronizer traffic size in bytes **without committing anything to the ledger**. Those bytes are converted to Canton Coin spend and USD using live rates from the public Scan API, and projected app rewards per transaction are computed from the current featured-app reward parameters (CIP-0104) published by Scan. Every estimate returns `--json` output so cost checks compose into CI gates (e.g., fail a pipeline if a workflow's traffic cost regresses). Against LocalNet, where traffic is free, the plugin reports the byte size and a configured-rate projection, so cost regressions are caught before TestNet. Like the rest of the suite it is a thin layer: prepare endpoint, Scan rates, no new metering infrastructure.

**Ledger snapshots.** A ledger snapshot plugin brings the Canton equivalent of Hardhat's `evm_snapshot` to local development:

```
dpm snapshot save <name>       # checkpoint current local ledger state
dpm snapshot restore <name>    # roll back to a saved checkpoint
dpm snapshot list              # saved checkpoints with age and size
dpm snapshot delete <name>
```

The workflow it unlocks: set up the initial party and contract state once, save it, and run multiple test passes, or destructive experiments, without re-bootstrapping the node each time. Because Canton exposes no snapshot API, this is the one component that reaches below the API surface: it checkpoints and restores the local node's postgres state, which requires running the LocalNet postgres servers with persistent storage (the plugin manages this configuration). For exactly that reason it is scoped to local development targets only, sandbox and LocalNet, with a hard guardrail refusing to run against remote or production participants, keeping the suite's no-Canton-internals guarantee intact for everything that touches a live network.

**Property-based and invariant testing.** Daml has no nondeterministic IO, so in-language generation is limited to seeded PRNG within script code; an external harness gives you schema-derived generators from DAR types, JSON-level input control, counterexample shrinking, and CI-native reproduction that in-language approaches don't. The harness therefore lives outside the language: it generates inputs and drives existing Daml Scripts through `daml script --input-file`, requiring no changes to Daml or the runtime.

- `dpm fuzz <module>:<property> --runs 256 --seed 42` introduces property-based testing by repeatedly executing a parameterized Daml Script with automatically generated inputs.
```text
Generate Input
      │
      ▼
Serialize to JSON
      │
      ▼
daml script --input-file
      │
      ▼
Property Pass / Counterexample
```


-  Runs are seeded and reproducible, input schemas are derived automatically from DAR type definitions, and failing cases are reduced via counterexample shrinking to a minimal reproduction.
- `dpm invariant <module>:<invariant> --depth 50 --runs 256` introduces stateful testing by executing randomized sequences of ledger operations and verifying user-defined invariants after each successful transaction, with replayable execution traces and sequence shrinking for minimal reproductions.
- `dpm test --table <module>:<script> --rows rows.json` adds parameterized table-driven testing by executing the same script against a predefined set of input rows.
- The harness builds directly on the snapshot component: a fuzz or invariant campaign bootstraps the initial party and contract state once, saves it via `dpm snapshot save`, and restores it between runs instead of re-initializing the ledger each time, dramatically accelerating campaign throughput and guaranteeing every run starts from an identical state (which is also what makes seeded reproduction exact).

All three reuse existing infrastructure: `daml script --input-file` provides the execution mechanism, DAR type definitions provide the input schema, and existing coverage reporting is unchanged, and can later be leveraged for coverage-guided fuzzing.

### 3. Architectural Alignment

The tool is designed to align with Canton's architecture rather than impose patterns borrowed wholesale from account-based chains. Because Canton has no global readable state, all inspection commands are party-scoped and participant-scoped by construction, surfacing `--party`, `--participant`, and `--offset` as first-class flags and preserving Canton's need-to-know data model end to end. It is a thin wrapper over existing Canton services (JSON Ledger API, and PQS where available) that introduces no new ledger functionality and modifies no Canton internals, so it stays compatible as the platform evolves and keeps its maintenance surface small. It complements DPM rather than replacing it: the work extends the existing DPM workflow at exactly the point it currently ends, is delivered as DPM components from day one, so adoption is a single component install and nothing about DPM is forked or duplicated. This directly serves the ecosystem priority of strengthening Canton's developer tooling (the `daml-tooling` area) and lowers the barrier for developers arriving from mature smart-contract toolchains.

### 4. Backward Compatibility

No backward compatibility impact. The tool is additive: it wraps existing Canton JSON Ledger API and PQS endpoints, requires no changes to Canton core, Splice, or Daml, and extends DPM only through its official component interface. It introduces no new on-ledger logic. The snapshot plugin manages the storage configuration and database state of a developer's own local node, without modifying Canton itself and with a guardrail that prevents any use against remote participants. Existing DPM workflows and coverage reporting are unchanged.

---

## Impact

This proposal restores a first-class, end-to-end CLI experience for the complete Canton developer workflow by extending DPM beyond local development to deployment, ledger interaction, and advanced testing.

The implementation provides native support for:

* Project scaffolding from community-publishable templates
* Ledger deployment and package upload
* Active Contract Set (ACS) inspection and ledger queries
* Contract, transaction, package, and offset inspection
* Real-time transaction exploration on two surfaces, a terminal live tail (`dpm query updates --follow`) and a local explorer UI, streaming creates/archives, exercised choices, party disclosures, and fee charges
* Party and wallet management
* Transaction submission and choice encoding/decoding
* Structured transaction logging and tracing of every local run (command inputs, events, visibility, abort/assert messages), with suite-wide human-readable error decoding and a machine-readable schema for AI/LLM tooling
* Pre-flight traffic fee estimation (bytes, Canton Coin, USD) and app-reward projection per transaction, composable into CI cost gates
* Ledger state checkpoint and rollback for local development (`dpm snapshot`)
* Property-based, invariant, and table-driven testing

By exposing these capabilities through a unified, scriptable CLI, developers can build, deploy, inspect, test, and automate Canton applications entirely from the command line without relying on interactive REPLs, manual JSON/gRPC requests, or multiple disconnected tools. This significantly improves developer productivity, enables seamless CI/CD integration, and brings the Canton developer experience closer to modern smart contract toolchains while preserving Canton's party-scoped, privacy-first architecture.

The implementation is a thin orchestration layer over existing Canton services including the JSON Ledger API, Participant Query Store (where available), and existing Daml Script infrastructure, requiring no changes to Canton internals while substantially improving the developer experience.

---

## Milestones and Deliverables

The work is delivered over 10 months by a team of four engineers, as eight DPM components, one per command group (scaffolding; deployment; querying, wallet & submission; transaction visualization; logging & tracing; fee & reward estimation; ledger snapshots; testing), across nine milestones, so that each feature traces cleanly to a milestone and its budget. The components are not disconnected tools: they share a common core library providing project-configuration parsing, the JSON Ledger API client, auth/token handling, and output formatting, so the suite behaves as one coherent CLI with consistent flags, configuration, and `--json` output across every command. Each milestone ships as a tagged open-source release, published through dpm's component publishing mechanism and installable into any DPM project, meaning each milestone is independently usable, not a partial build-up to a final drop.

**Milestone 1: Component foundation & scaffolding (Month 1)**
- Component scaffold on the DPM component framework, including the shared core library (configuration parsing, JSON Ledger API client, auth handling, output formatting) that all components build on; published and installable via dpm; CI pipeline and release process established.
- Project configuration file: named targets (sandbox, DevNet, named participants), env-var-referenced auth, DAR path, parties, synchronizer.
- Custom Daml template plugin: `dpm template list` / `info` and `dpm new --template <name>`; public templates repository under the Canton Network Devs org with PR-based community contribution flow and automated template validation; 3 starter templates (each with Daml scaffold, frontend stub, README, and pre-wired project config + CI example).
- Documentation for all M1 commands.

**Milestone 2: Deployment (Month 2)**
- `dpm upload <dar>`, `dpm wallet parties allocate` / `list` (local parties), `dpm query packages`.
- `dpm deploy`: full build → upload → allocate → verify orchestration against a configured target.
- Documentation for all M2 commands plus a working CI usage example (GitHub Actions).

**Milestone 3: Ledger querying & submission (Month 3)**
- Full `dpm query` group: `acs`, `contract`, `updates`, `tx`, `offset`, with `--party`, `--participant`, `--offset`, and `--json` on every command; PQS-backed historical queries where PQS is available.
- Package & schema utilities: `resolve`, `encode choice`, `decode`, `hash package`, `hash fingerprint`.
- Transaction submission: `dpm exercise`.
- Documentation for all M3 commands.

**Milestone 4: Wallet & external signing (Month 4)**
- Wallet completion: `whoami`, `public-key`.
- External-party signing flow: `dpm wallet external allocate / sign / import`, wrapping the generate-topology → external-sign → allocate sequence.
- Documentation for all M4 commands, including an external-signing walkthrough.

**Milestone 5: Transaction explorers (Month 5)**
- CLI explorer: `dpm query updates --follow`, a live tail of ledger events to stdout (line-delimited JSON) over the websocket variant of `/v2/updates`.
- UI explorer: `dpm explorer`, a visual transaction explorer plugin, a localhost web UI streaming real-time create/archive events, exercised choices, party disclosures, and fee charges for the configured target, sharing the websocket backend with `--follow`.
- Documentation for both explorer surfaces.

**Milestone 6: Transaction log & trace (Month 6)**
- Transaction log & trace plugin: `dpm trace list / show / decode`; structured, append-only capture of command inputs, resulting events, party visibility, and abort/assert messages on every suite-driven sandbox/LocalNet run.
- Suite-wide error decoding: every `dpm` command surfaces structured Canton gRPC errors as human-readable messages pointing to the offending choice and contract.
- Published, versioned trace schema (line-delimited JSON) for downstream LLM/AI developer tooling.
- Documentation for the trace workflow and schema.

**Milestone 7: Ledger snapshots (Month 7)**
- Ledger snapshot plugin: `dpm snapshot save / restore / list / delete` against local targets (sandbox, LocalNet), including persistent-storage configuration for the LocalNet postgres servers and the local-only guardrail.
- Documentation for the snapshot workflow (bootstrap once → save → iterate).

**Milestone 8: Traffic fee & reward estimation (Month 8)**
- Fee & reward estimation plugin: `dpm estimate choice / tx / rewards` and the `dpm exercise --estimate` dry-run flag, providing exact traffic-byte estimation via the interactive-submission prepare endpoint, CC/USD conversion and CIP-0104 reward projection from live Scan API rates, configured-rate projection on LocalNet.
- `--json` output for CI cost gates; documentation including a cost-regression CI example.

**Milestone 9: Testing harness & v1.0 (Months 9-10)**
- `dpm fuzz`: schema-derived input generators from DAR type definitions, seeded reproducible runs, counterexample shrinking to minimal reproductions, snapshot-accelerated campaigns via the snapshot component, every campaign run captured as a structured trace log via the trace component.
- `dpm invariant`: randomized operation sequences with user-defined invariant checks, replayable execution traces, sequence shrinking.
- `dpm test --table`: parameterized table-driven execution from a rows file.
- Integration test suite for the full component suite against sandbox and DevNet; v1.0 release of all eight components.
- End-to-end tutorial (the co-marketing deliverable): scaffold → deploy → query → fuzz a sample application entirely from the command line, starting from a community template.

## Acceptance Criteria

Each milestone is verified by the Foundation against two kinds of objective checks: functional checks that the deliverable works as specified, and ecosystem-value checks that developers outside Atheon are actually using it.

**Functional checks**

- **All milestones:** tagged open-source release; components install into a clean DPM project via a single documented command; every listed command demonstrated live against a Canton sandbox (and DevNet where applicable); per-command documentation published.
- **M1:** a reviewer can scaffold a project with `dpm new --template <name>` from the community catalog and the scaffolded project builds; a new template submitted via PR passes the automated validation pipeline and appears in `dpm template list` without a component release.
- **M2:** starting from a scaffolded project, a reviewer can reach a verified deployment on a configured target using only `dpm` commands, with no Console, daml-shell, or hand-written API calls. The provided CI example runs green.
- **M3:** a reviewer can locate a contract, inspect its transaction, exercise a choice on it, and confirm the resulting ACS change using only one-shot commands with `--json` output piped through standard shell tools.
- **M4:** external-party allocation demonstrated end to end with a key held outside the participant, using only `dpm wallet external` commands.
- **M5:** a reviewer's exercise appears live on both explorer surfaces as it happens, streamed to the terminal by `dpm query updates --follow` and rendered in the `dpm explorer` web UI with its create/archive events, exercised choice, and party disclosures, and both feeds show only what the configured party is entitled to see.
- **M6:** after a scripted run that includes a deliberately failing exercise, the trace log contains the submitted command inputs, resulting events, party visibility, and the abort/assert message; the failing gRPC error is surfaced as a human-readable message naming the offending choice and contract; the trace output validates against the published schema.
- **M7:** a reviewer can bootstrap party and contract state on a local target, save it with `dpm snapshot save`, run a destructive test pass, and restore to the identical starting state with `dpm snapshot restore`. The guardrail is demonstrated refusing a remote target.
- **M8:** a reviewer can pre-flight a choice with `dpm estimate` and receive its exact traffic size in bytes with CC and USD cost and a projected app reward; submitting the same choice confirms the estimate; against LocalNet the command reports byte size with a configured-rate projection; the `--json` output drives a working CI cost-gate example.
- **M9:** a seeded, snapshot-accelerated fuzz campaign against a sample project containing a planted bug produces a shrunk, minimal, reproducible counterexample; re-running with the same seed reproduces the identical failure, and the campaign's runs are captured as trace logs. An invariant violation is demonstrated with a replayable trace.

**Ecosystem-value checks**

- **M2:** the scaffolding and deployment components and the CI example have been exercised end to end by at least 2 developers outside Atheon (e.g., SIG members or community developers recruited through the daml-tooling channels), with their feedback tracked as public GitHub issues on the component repository.
- **M5:** at least 3 developers or projects outside Atheon have used the query/wallet/submission commands or the explorers against their own applications, evidenced by public repositories, CI configurations, or written confirmation shared with the committee; at least 5 inbound issues or feature requests from non-Atheon users have been triaged publicly across the suite.
- **M9 (v1.0):** at least 3 independent external repositories use the components in their repositories or CI pipelines (scaffolding, deployment, query, trace, estimation, snapshot, or testing-harness usage all qualify), evidenced by public repos/CI configs or written confirmation from those teams; at least 2 community-contributed templates have been submitted via PR and merged into the templates repository; the end-to-end tutorial has been completed start-to-finish by at least 2 community developers, with completion feedback published.

If an ecosystem-value check is not met at review time despite the functional checks passing, Atheon will present the committee with evidence of outreach undertaken and a concrete adoption plan, and the committee may accept the milestone with a follow-up verification at the next milestone review, mirroring how adoption evidence is handled in comparable tooling grants.

## Funding Request and Milestone Breakdown

Total request: **$400,000 USD-equivalent, disbursed in $CC** per milestone upon Foundation acceptance of that milestone's criteria. This funds a four-engineer team for ten months at **$10,000 per engineer-month** (4 engineers × $10,000 × 10 months). Each milestone's payment equals the team's engineering cost for its delivery window, so the budget traces transparently to time on the work.

| Milestone | Timeline | Scope | Amount |
|---|---|---|---|
| M1 - Foundation & scaffolding | Month 1 | Shared core library, config, CI/release process, template plugin + community templates repo | $40,000 (10%) |
| M2 - Deployment | Month 2 | Upload, party allocation, `dpm deploy` orchestration, CI example | $40,000 (10%) |
| M3 - Querying & submission | Month 3 | Full query surface, schema utilities, `dpm exercise` | $40,000 (10%) |
| M4 - Wallet & external signing | Month 4 | `whoami` / `public-key`, external allocate / sign / import | $40,000 (10%) |
| M5 - Transaction explorers | Month 5 | CLI live tail (`--follow`) + `dpm explorer` web UI | $40,000 (10%) |
| M6 - Transaction log & trace | Month 6 | `dpm trace` capture + suite-wide error decoding + published trace schema | $40,000 (10%) |
| M7 - Ledger snapshots | Month 7 | `dpm snapshot` save/restore/list, postgres persistence, local-only guardrail | $40,000 (10%) |
| M8 - Fee & reward estimation | Month 8 | `dpm estimate` + `--estimate` dry-run flag, Scan-rate CC/USD conversion, CI cost gates | $40,000 (10%) |
| M9 - Testing harness & v1.0 | Months 9-10 | Fuzz, invariant, table-driven testing, integration suite, tutorial, v1.0 | $80,000 (20%) |

No upfront tranche is requested; payment is entirely milestone-gated.

---

### Co-Marketing
Upon each milestone release, Atheon will collaborate with the Foundation on:

* Announcement coordination for each milestone.
* A technical blog or developer tutorial demonstrating the end-to-end component workflow (deploy, query, test).
* Educational content and developer workshops introducing the components to the Canton developer community.
* Ecosystem promotion, including positioning the components within Canton developer channels and the relevant SIG, and proposing them as recommended developer tooling in community documentation.



---

## Motivation

This work is valuable to the Canton ecosystem because it targets the single most common point of friction for every application developer: the jump from a clean local loop to live-ledger operations. Today that jump means leaving the CLI for a patchwork of Console sessions, REPLs, and hand-written API calls, friction that slows onboarding, blocks CI automation, and makes Canton feel unfamiliar to developers arriving from Foundry-class ecosystems. The demand is documented rather than inferred: the Foundation's own [call for community-built DPM components](https://forum.canton.network/t/dpm-components-extend-the-canton-developer-stack/8822) names project templates, deployment helpers, fee estimators, and local dashboards, with testing, debugging, scaffolding, and observability as its priority areas, and this suite answers that call directly.

The output is a common good, not a private product: open-source DPM components freely available to all Canton participants, which no single application has to rebuild. The portion of the ecosystem that benefits is broad: effectively every Daml/Canton application developer and the CI/DevOps engineers supporting them, since deployment, ledger inspection, and testing are universal needs across dApps regardless of domain. Adoption is the success measure: external projects using the commands in their own repositories and CI, inbound issues and feature requests from real users, third-party adoption of the testing harness, and ultimately a component installs and usage in external repos/CI.

## Rationale

A thin component suite over the JSON Ledger API is the right approach because it extends what already exists rather than replacing it. The default approach is to extend: the JSON API, PQS, and `daml script --input-file` are all stable, well-specified, existing components, and this proposal wraps them rather than forking or duplicating ledger logic. Targeting the JSON API (rather than gRPC first) gives faster delivery and a smaller maintenance surface, while the abstracted transport layer keeps gRPC open as a future option. Delivering the work as DPM components, rather than a separate binary or a patch to DPM core, uses exactly the extension mechanism DPM now provides: commands surface natively under dpm, releases are decoupled from the SDK, and the components remain thin, replaceable wrappers over stable APIs. Alternatives considered and rejected: a standalone CLI (fragments the developer experience and duplicates DPM's config/auth surface); patching DPM core (couples delivery to SDK release cycles and raises the maintenance bar for the DPM team); leaning on the Declarative API (operator-side desired-state configuration, the right tool for provisioning a participant, but not a developer command surface, and with no inspection or query story); and Console `--bootstrap` scripting (CI-runnable but requires authoring Scala against admin APIs, with JVM startup per run and no structured output contract for pipelines; `dpm deploy` can in fact coexist with it, covering the interactive developer loop while bootstrap scripts remain suited to participant provisioning).

The testing harness sits outside the Daml language by necessity: because Daml is deterministic, randomized input generation cannot live in the language, so an external harness driving existing Daml Scripts is the natural, least invasive design. Alternatives considered and rejected include adding deployment/query logic directly into Canton internals (higher maintenance, slower to evolve, larger compatibility risk) and leaving inspection REPL-only (which is precisely the composability gap this proposal exists to close). Throughout, the design respects Canton's party-scoped, participant-scoped model rather than assuming a globally readable state, which is what makes this tooling correct for Canton specifically rather than a naive port of an account-chain toolchain.

---

## About Atheon

Atheon is an R&D lab working at the frontier of AI, cryptography, and zero-knowledge systems, building production-grade cryptographic infrastructure and developer tooling. We have contributed to and collaborated with leading organizations in applied cryptography and protocol engineering, including World, a16z, zkEmail, and the Ethereum Foundation. Our background spans zero-knowledge proving pipelines, zkVM research, blockchain indexing infrastructure, and protocol-level engineering and direct, hands-on experience with the mature smart-contract toolchains (Foundry and equivalents) whose developer ergonomics this proposal brings to Canton's privacy-first architecture.

**Website:** [atheon.xyz](https://atheon.xyz/)
**X (Twitter):** [@atheonxyz](https://x.com/atheonxyz)




