## Development Fund Proposal

**Title:** DPM Ledger Operations & Reproducible Testing Suite  
**Author:** Atheon
**Status:** Draft
**Created:** 2026-06-29
**Label:** daml-tooling
**Champion:** Need Champion

---

## Abstract

DPM gives Canton developers a clean local loop for creating, building, testing, sandboxing, and generating code, but the workflow after a package has been deployed still lacks a scriptable surface for inspecting state, submitting transactions, recording runs, estimating costs, and running recorded, reproducible tests. This proposal delivers an open-source suite of DPM components for that **post-deployment developer-operations and reproducible-testing layer** across LocalNet, DevNet, TestNet, and MainNet-connected participants: scriptable ledger-query and external-party wallet commands, transaction submission, a real-time terminal live tail of ledger updates, a run journal that records every suite-driven run with suite-wide human-readable error presentation, traffic fee and reward estimation, and table-driven testing with journal-backed exact replay. The suite is a thin orchestration layer over existing Canton services (the JSON Ledger API, with PQS where available) and introduces no new ledger functionality or Canton-internal changes.

---

## Specification

### 1. Objective

The objective is to deliver a unified, scriptable set of installable DPM components for live-ledger inspection, transaction submission, run recording, and reproducible testing against named LocalNet, DevNet, TestNet, and MainNet-connected participant targets. The suite begins **after deployment**.

The canonical DPM workflow today is `dpm new`, then `dpm build`, `dpm test`, `dpm sandbox`, and `dpm codegen-*`. Once a package is deployed, to inspect the Active Contract Set, read a contract or transaction, follow updates live, submit a choice, replay a failing run, estimate its traffic cost, or run a table-driven test campaign, developers still move between interactive tools and hand-written JSON/gRPC requests. The gap, precisely stated, is a one-shot, `--json` command surface for post-deployment interaction, plus testing capabilities that `dpm test` does not provide: table-driven tests and journal-recorded, exactly-replayable test runs. The DPM team's call for community-built components explicitly identifies fee estimators, testing, debugging, and observability tooling as high-value contributions ([DPM Components: Extend the Canton Developer Stack](https://forum.canton.network/t/dpm-components-extend-the-canton-developer-stack/8822)). This proposal concentrates on those areas.

For comparison, Ethereum's Foundry toolchain gives developers a broad post-deployment surface (`cast send`, `cast call`, state queries, and advanced tests); this proposal delivers that interaction, recording, and testing layer for Canton.

The intended outcome is that, once an application is deployed, a Canton developer can inspect ledger state, follow transaction flow live in the terminal, use external-party signing flows, submit transactions, estimate traffic costs and app rewards before submitting, keep a durable record of every suite-driven run, and run table-driven, journal-recorded tests entirely from scriptable DPM commands and CI. The same command surface applies across LocalNet, DevNet, TestNet, and MainNet-connected participants by selecting a named target; changing environments does not require changes to command logic. The suite will document an integration path that imports those named targets from `canton-deploy.config.js`.

### 2. Implementation Mechanics

The components are built as a lightweight orchestration layer over existing Canton services. The default backend is the Canton JSON Ledger API: `/v2/parties/external/*` for external-party workflows and `/v2/state/*` plus `/v2/updates` for ledger queries (bounded HTTP requests for one-shot commands and websocket streaming for the follow mode). The Participant Query Store (PQS) is used where available for historical ACS and offset-based inspection.

**Why DPM components on the JSON API.** Targeting the JSON API avoids protobuf generation and a gRPC toolchain, enabling faster implementation and lower maintenance. The transport layer is abstracted so gRPC support can be added without reworking command logic.

**Party- and participant-scoped by design.** Canton has no global, readable state, state is inherently party-scoped and participant-scoped. The components treat this as a first-class design constraint rather than something to work around: every query command supports configurable `--party`, `--participant`, and `--offset` options, providing an ergonomic command line while fully preserving Canton's security and privacy model.

**Cross-network by design.** Every network-facing command resolves its endpoint, authentication, TLS, participant, and default party from a named `--target`. The same component and command logic supports LocalNet, DevNet, TestNet, and MainNet-connected Canton participants wherever the required JSON Ledger API capability is exposed and the authenticated user has the necessary rights. This is not a claim of globally public MainNet state: MainNet queries remain participant-scoped and return only data visible to the authorized Daml party. Optional capabilities such as PQS history, external-party endpoints, cost estimation, and Scan-derived rates are detected per target and report a clear unsupported/unavailable result rather than silently changing behavior. Purely local transformations such as public-key fingerprinting require no target. Unlike LocalNet lifecycle and explorer tooling, this suite does not create or manage a LocalNet; it provides the same post-deployment automation surface for every supported environment.

**Interoperable target resolution.** The suite reads endpoint, authentication, TLS, and network-profile information through a target-provider interface. The first provider imports named profiles from the Daml Deployment Toolkit's `canton-deploy.config.js`. A minimal JSON-API-only provider is available for users who deploy by other means. Authentication tokens are referenced through environment variables rather than stored in suite configuration. An illustrative fallback config:

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

[target.testnet]
json_api = "https://testnet.participant.example/api"
auth = { type = "bearer", token_env = "CANTON_TESTNET_TOKEN" }

[target.mainnet]
json_api = "https://mainnet.participant.example/api"
auth = { type = "bearer", token_env = "CANTON_MAINNET_TOKEN" }
```

The component suite exposes four coherent groups of commands.

**Ledger querying, external-party wallet, schema, and submission.** Scriptable, one-shot commands that replace REPL-gated inspection:

```
# Ledger queries
dpm query acs <template-fqn> [--target T] [--party P] [--participant N] [--offset O] [--json]
dpm query contract <contract-id> [--target T] [--party P] [--json]
dpm query updates [--target T] [--template <fqn>] [--from-offset O] [--json]
dpm query updates --follow [--target T] [--template <fqn>] [--json]   # live tail: stream events to stdout as they land
dpm query tx <update-id> [--target T] [--json]
dpm query offset [--target T] [--json]
```

**Identity, external-party, schema, and submission command reference**

| Group | Command | Purpose | Behavior and limits |
|---|---|---|---|
| Identity | `dpm wallet whoami [--target T]` | Resolve the selected target's authenticated ledger user to its full Daml party identity. | Returns the user's configured primary party and relevant `CanReadAs`/`CanActAs` rights. If the user has no unambiguous primary party, the command reports that condition rather than guessing from a display name or party hint. |
| Identity | `dpm wallet public-key [<party>] [--target T]` | Display the public signing-key information available for the selected or configured party. | Returns the available public key or keys, fingerprints, key specifications, usages, and threshold information. It never exports private keys and reports when the target does not expose the required topology information. |
| External party | `dpm wallet external allocate <party-name> [--target T]` | Onboard a party whose signing key is held outside the participant. | Selects a configured external signer, calls `/v2/parties/external/generate-topology`, validates and externally signs the returned topology hashes, and submits the signed transactions through `/v2/parties/external/allocate`. The caller must have the required allocation rights and the target must expose the external-party endpoints. |
| External party | `dpm wallet external sign <payload> [--target T]` | Sign a supported prepared Canton submission using an external key. | Parses the prepared transaction or topology payload, displays and validates what will be signed, recomputes the required hash, and requests a signature from the configured signer. It does not sign arbitrary text, transmit the private key to the participant, or include private material in its output. |
| External party | `dpm wallet external import <key> [--target T]` | Register an existing public key or external-signer reference for subsequent DPM operations. | Accepts public material or a reference to an HSM, custody service, or development keystore. Production private keys are not accepted directly on the command line; supporting a local private-key development keystore, if included, is explicitly testing-only and separately configured. |
| Package and schema | `dpm resolve <template-fqn> [--target T]` | Resolve a template reference against packages available on the selected participant. | Reports the selected package name, version, package ID, module, template, interfaces, and upgrade-selection information. It diagnoses package resolution only; it does not upload or vet packages. |
| Package and schema | `dpm encode choice <template-fqn> <choice> --args '{...}' [--target T]` | Validate and encode choice arguments for Ledger API submission. | Loads the choice's Daml schema, checks fields and types, and emits canonical Daml-LF JSON. Missing fields, unknown fields, invalid party IDs, and type errors are reported before submission. |
| Package and schema | `dpm decode <contract-or-event-json> [--target T]` | Render Ledger API contract, event, or supported prepared-transaction JSON as readable typed output. | Resolves available package metadata and annotates templates, choices, fields, and Daml types. Opaque values that cannot be decoded are preserved and identified rather than discarded or guessed. |
| Package and schema | `dpm hash fingerprint <public-key>` | Calculate Canton's canonical fingerprint for a supported public-key representation. | Runs entirely offline, requires no target, and neither transmits nor stores the supplied public key. |
| Submission | `dpm exercise <contract-id> <choice> --args '{...}' [--target T]` | Exercise a Daml choice on an existing contract. | Resolves the contract and choice schema, validates the arguments, determines the authorized `actAs` party, submits the command, and returns the update ID and visible resulting events. The user must have `CanActAs` for an authorized controller; visibility of a contract alone does not grant exercise permission. |

**External-party allocation sequence**

| Step | Operation | Responsibility |
|---:|---|---|
| 1 | Resolve the target and select the configured external signer. | DPM target and signer adapters |
| 2 | Obtain the signer's public key without exposing its private key. | External signer |
| 3 | Request the required onboarding topology transactions from `/v2/parties/external/generate-topology`. | DPM and participant |
| 4 | Inspect the returned topology transactions and independently recompute the hashes to be signed. | DPM |
| 5 | Sign the validated topology hashes. | External signer |
| 6 | Submit the signed transactions through `/v2/parties/external/allocate`. | DPM and participant |
| 7 | Return the allocated party ID and record the operation in the run journal. | DPM |

**Choice-submission mode**

| Configured party type | Submission path |
|---|---|
| Participant-managed party | Validate arguments → submit an `ExerciseCommand` → wait for and render the result. |
| External party | Prepare the transaction → decode and inspect it → recompute its hash → sign externally → execute the signed submission. |

**Common query behavior**

- **Environment selection:** `--target T` selects a LocalNet, DevNet, TestNet, or MainNet-connected participant profile. When omitted, the configured default target is used.
- **Party visibility:** Results are restricted to the selected or configured Daml party. `--party` selects an existing authorized view; it never grants additional ledger rights.
- **Participant scope:** `--participant N` selects an endpoint when a target contains multiple participants. Queries never represent public or global Canton state.
- **Offsets:** Offsets belong to one participant target and must not be reused across environments. Historical reads remain subject to that participant's pruning and retention limits.
- **Machine-readable output:** `--json` returns structured output for scripts and CI. Continuous streams use line-delimited JSON.

**Ledger-query command reference**

| Command | Purpose | Selection and filtering | Result and limits |
|---|---|---|---|
| `dpm query acs <template-fqn>` | Inspect active contracts for one template. | Resolves the template against the selected target. Supports `--party`, `--participant`, and `--offset`. | Returns only matching active contracts visible to the authorized party at the requested retained offset. |
| `dpm query contract <contract-id>` | Inspect one contract and its available lifecycle information. | Uses `--party` or the target's default party. | Returns the visible create event and, where available, archive event and status. Contracts outside the party's visibility are not exposed. |
| `dpm query updates` | Read a finite set of ledger updates and exit. | `--template` filters by a template deployed on the target; `--from-offset` begins at a saved target-specific position. | Returns visible creates, archives, exercised choices, and other supported update types. Intended for one-shot scripts and CI jobs. |
| `dpm query updates --follow` | Follow new ledger updates continuously. | Uses the selected target's websocket stream and optional template filter. | Runs until interrupted. In `--json` mode, emits one party-visible event per line for incremental downstream processing. |
| `dpm query tx <update-id>` | Inspect one committed Canton update. | Resolves the update ID on the selected target and uses the configured party projection. | Returns only transaction events visible to that party. The update ID is target-specific, not a globally public transaction hash. |
| `dpm query offset` | Read the selected participant's latest ledger offset. | Uses the selected or default target. | Returns a participant-local synchronization position for later ACS or update queries. It is not a public global block height. |

Commands support structured JSON output, allowing query results to be processed by shell scripts and CI without using an interactive REPL.

The wallet commands provide a DPM command surface over Canton's existing external-party Ledger API mechanisms and, where practical, the official Canton Wallet SDK building blocks; the suite does not introduce another signing protocol or wallet service. For a local party, a submitting participant uses its node keys to authorize submissions on the party's behalf. An external party instead controls its own private signing keys and has no submitting participant. Its keys may be held by an HSM, custody service, external wallet, or explicitly development-only local keystore, but production private-key material is never provided to the participant or passed directly through the command line. These mechanisms are available on LocalNet, DevNet, TestNet, and MainNet-connected participants that expose the required endpoints and authorize the caller; the selected target supplies the environment-specific endpoint, TLS, authentication, participant, and network metadata.

**Live ledger tail.** `dpm query updates --follow` streams contract creates and archives, exercised choices, and party disclosures to stdout as line-delimited JSON (or human-readable text), party-scoped by construction: the feed renders exactly what the configured party is entitled to see, nothing more. The stream's stable JSON schema doubles as a live data feed that dashboards and visual tooling can consume directly.

**Suite-wide error presentation.** No suite command ever surfaces a raw gRPC status: any command that receives a structured Canton error renders it as a human-readable message naming the failing choice and contract where the error payload permits, in both pretty and `--json` form. This is a thin, deterministic presentation layer shipped in the shared core library.

**Run journal (flight recorder).** Every run driven through the suite, whether a `dpm exercise` submission or a table-driven test campaign, is automatically recorded into a structured, append-only journal: the submitted command inputs, resulting create/archive events, party visibility, and abort/assert messages. Capture happens at the API boundary as the submission is made, with no compiler, source-level, or node instrumentation. This is the property post-hoc inspection cannot provide: a failed submission that never reached the ledger leaves no transaction to fetch, but its inputs are in the journal. Activity from other clients appears with its events from the update stream; participant-side interception is explicitly out of scope.

```
dpm runlog list [--target T]                       # recorded runs on this target
dpm runlog show <run-id> [--target T] [--json]     # inputs, events, visibility, errors
```

The journal is the reproduction substrate for the testing component: recorded runs are replayed exactly from their journal entries, which is why it ships as part of that component. Each entry records the named target and participant/network identity so offsets, update IDs, and submissions from LocalNet, DevNet, TestNet, and MainNet cannot be accidentally mixed. The format is a versioned, line-delimited JSON schema, published for downstream automated-testing and agentic-debugging tools.

**Diagnostics interoperability.** Each journal entry carries the update ID and the raw, undecoded rejection payload with its correlation ID, so a recorded run can be opened in DPM Trace's visualizer (PR #327) or handed to the Canton Transaction Debugger (PR #297) without re-running anything.

**Traffic fee & reward estimation.** A fee & reward estimation plugin answers the app-economics question no Foundry-equivalent ever had to: what will this transaction cost, and what will it earn?

```
dpm estimate choice <contract-id> <choice> --args '{...}' [--target T]   # pre-flight a choice before exercising it
dpm estimate tx <command-json> [--target T]                              # estimate a prepared command file
dpm estimate rewards [--app <id>] [--target T]                           # projected app rewards per transaction
dpm exercise <contract-id> <choice> --args '{...}' --estimate [--target T]   # dry-run flag on submission itself
```

Estimation is native, not heuristic: the plugin submits the command to the JSON Ledger API's interactive-submission *prepare* endpoint (Canton 3.4+, present on the current network), which runs the Daml interpreter and returns an estimate of the transaction's synchronizer traffic cost (`cost_estimation.total_traffic_cost_estimation`, split into confirmation-request and confirmation-response components) **without committing anything to the ledger**. That traffic-cost estimate is converted to Canton Coin spend and USD using the network's extra-traffic price and the CC/USD rate from open mining rounds, both served by the public Scan API, and projected app rewards per transaction are computed from the traffic-based app reward parameters introduced by CIP-0104 (FeaturedAppRight activity weights, traffic price, round issuance) published by Scan, reported as a projection since per-round issuance depends on network-wide totals. Every estimate returns `--json` output so cost checks compose into CI gates (e.g., fail a pipeline if a workflow's traffic cost regresses). Against LocalNet, where traffic is free, the plugin reports the traffic-cost estimate and a configured-rate projection, so cost regressions are caught before TestNet. Cost estimation is an optional response field that a participant can disable, so the plugin handles its absence gracefully. Like the rest of the suite it is a thin layer: prepare endpoint, Scan rates, no new metering infrastructure.

**Table-driven and recorded testing.** Generative testing for Daml is already served by the ecosystem: OpenZeppelin's [daml-props](https://github.com/OpenZeppelin/daml-props) provides in-language property-based testing (generators, `forAll`, sequence testing, and shrinking inside Daml Script), and the [DamlFuzz proposal](https://github.com/canton-foundation/canton-dev-fund/pull/52) proposes a dedicated property-based testing and coverage-guided fuzzing engine for Daml. This suite deliberately builds neither a generator library nor a fuzzing engine. It delivers the testing capabilities that remain missing and that no in-language engine provides:

- `dpm test --table <module>:<script> --rows rows.json [--target T]` adds parameterized table-driven testing by executing the same Daml Script against a predefined set of input rows through `daml script --input-file`, with per-row pass/fail reporting in `--json` for CI. The selected target may be LocalNet, DevNet, TestNet, or a MainNet-connected participant, although state-changing campaigns default to non-production targets and require explicit production authorization.
- Every table run is captured in the run journal, and any recorded run, whether a table row or an interactive `dpm exercise`, is replayed exactly from its journal entry, which is what makes reproduction exact rather than approximate.
- For repeatable campaign state, test campaigns integrate with environment-level snapshot/restore where available (e.g. DevKit's `dpm localnet snapshot`) rather than shipping a snapshot mechanism of their own.

Rather than competing with the ecosystem's testing engines, the suite is designed as their execution and reproduction substrate: the journal's published schema is available to any external campaign driver. daml-props properties and DamlFuzz campaigns both execute as Daml Scripts, so runs driven through this suite gain recorded inputs and exact replay with no changes to those tools. `daml script --input-file` provides the execution mechanism, existing coverage reporting is unchanged, and no changes to Daml or the runtime are required.

### 3. Architectural Alignment

The tool is designed to align with Canton's architecture rather than impose patterns borrowed wholesale from account-based chains. Because Canton has no global readable state, all inspection commands are party-scoped and participant-scoped by construction, surfacing `--party`, `--participant`, and `--offset` as first-class flags and preserving Canton's need-to-know data model end to end. It is a thin wrapper over existing Canton services (JSON Ledger API, and PQS where available) that introduces no new ledger functionality and modifies no Canton internals. It covers ledger interaction, run recording, and table-driven testing, and its journal and `--follow` stream are designed as data sources for adjacent tooling. Nothing about DPM is forked or duplicated.

### 4. Backward Compatibility

No backward compatibility impact. The tool is additive: it wraps existing Canton JSON Ledger API and PQS endpoints, requires no changes to Canton core, Splice, or Daml, and extends DPM only through its official component interface. It introduces no new on-ledger logic. Existing DPM workflows and coverage reporting are unchanged.

---

## Impact

This proposal supplies the target-independent post-deployment layer of a first-class Canton CLI experience: ledger interaction, run recording, and reproducible testing through the same commands across LocalNet, DevNet, TestNet, and MainNet-connected participants.

The implementation provides native support for:

* Active Contract Set (ACS) inspection and ledger queries
* Contract, transaction, update, and offset inspection
* Real-time transaction flow via a terminal live tail (`dpm query updates --follow`), streaming creates/archives, exercised choices, and party disclosures as line-delimited JSON
* External-party signing and identity helpers
* Transaction submission and choice encoding/decoding
* A run journal automatically recording every suite-driven run (command inputs, events, visibility, abort/assert messages) in a published machine-readable schema, with suite-wide human-readable error presentation and hand-off hooks for the PR #327/#297 diagnostic tools
* Pre-flight traffic fee estimation (traffic cost, Canton Coin, USD) and app-reward projection per transaction, composable into CI cost gates
* Table-driven testing with journal-backed exact reproduction, plus a published journal schema that ecosystem testing engines (daml-props, DamlFuzz) can build on

By exposing these capabilities through a unified, scriptable CLI that interoperates with PR #322's deployment profiles, developers can move from deployment into inspection, submission, recording, estimation, and recorded tests without an interactive REPL or hand-written JSON/gRPC requests. This improves CI/CD composability while preserving Canton's party-scoped, privacy-first architecture.

The implementation is a thin orchestration layer over existing Canton services including the JSON Ledger API, Participant Query Store (where available), and existing Daml Script infrastructure, requiring no changes to Canton internals while substantially improving the developer experience.

---

## Milestones and Deliverables

The work is delivered in two phases. A **six-month build phase**, staffed by four engineers, ships four DPM components across four milestones: ledger querying & submission, external-party wallet, fee & reward estimation, and the run journal with table-driven testing. A **six-month maintenance and adoption phase** follows v1.0, funding compatibility releases, public support, and community onboarding, so the suite does not arrive as a fire-and-forget deliverable.

All components share a core library for target-provider adapters, JSON Ledger API access, authentication, output formatting, and suite-wide error presentation. The first target provider consumes named profiles from the Daml Deployment Toolkit (PR #322). Each milestone ships as a tagged open-source release installable through DPM, with documentation published alongside the release.

**Milestone 1: Foundation, Deployment Toolkit adapter, querying & submission (Months 1-2)**
*Goal: from an application already deployed to LocalNet, DevNet, TestNet, or a MainNet-connected participant, provide the same scriptable inspection and submission surface through one-shot `--json` commands and named targets.*
- DPM component foundation, shared core library (JSON Ledger API client, auth handling, output formatting, suite-wide error presentation), CI, and release process.
- Target-provider interface plus an adapter that imports LocalNet, DevNet, TestNet, and MainNet endpoint/auth/TLS profiles from `canton-deploy.config.js`; minimal JSON-API-only fallback for users of other deployment paths.
- `dpm query acs / contract / updates / tx / offset` with named-target, party, participant, and offset selection plus `--json`; PQS-backed historical queries where available; `dpm query updates --follow` live tail streaming line-delimited JSON.
- Schema utilities: `resolve`, `encode choice`, `decode`, `hash fingerprint`.
- Transaction submission: `dpm exercise`.
- Documentation that begins from an already-deployed application and demonstrates switching the same commands among PR #322 LocalNet, DevNet, TestNet, and MainNet profiles without changing command logic.

**Milestone 2: External-party wallet flows (Month 3)**
*Goal: complete target-aware external-party workflows across supported LocalNet, DevNet, TestNet, and MainNet-connected participants, where the key is held outside the participant, without hand-written topology requests.*
- Identity helpers: `dpm wallet whoami`, `dpm wallet public-key`.
- External-party signing: `dpm wallet external allocate / sign / import`, wrapping the generate-topology → external-sign → allocate flow.
- Worked example: selecting a named non-production target, allocating an external party, and exercising a choice on its behalf end to end; MainNet configuration and capability detection are documented without requiring an unsafe production mutation for acceptance.

**Milestone 3: Traffic fee & reward estimation (Month 4)**
*Goal: answer "what will this transaction cost, and what will it earn?" before submitting to the selected LocalNet, DevNet, TestNet, or MainNet-connected participant.*
- `dpm estimate choice / tx / rewards` and `dpm exercise --estimate`, built on the interactive-submission prepare endpoint plus Scan rates.
- Per-target capability detection, conversion of the traffic-cost estimate to Canton Coin and USD, and CIP-0104 app-reward projection where the selected environment exposes the required participant and Scan data.
- `--json` output with a worked cost-regression CI gate example.

**Milestone 4: Run journal, table-driven testing & v1.0 (Months 5-6)**
*Goal: every suite-driven run is recorded with its LocalNet, DevNet, TestNet, or MainNet target identity and is exactly replayable only against a compatible selected target; table-driven testing lands as the suite's testing capability.*
- Run journal: automatic capture of suite-driven submissions (target/network identity, inputs, events, visibility, abort/assert messages); `dpm runlog list / show`; published, versioned line-delimited JSON schema; every entry carrying the update ID and unmodified rejection payload for hand-off to the PR #327 / #297 tools.
- `dpm test --table --target T`: parameterized execution from rows files, per-row `--json` reporting, and exact replay of any recorded row from its journal entry, with safeguards against replaying a record against the wrong environment.
- Documented integration with environment-level snapshot/restore where available (e.g. DevKit's `dpm localnet snapshot`) for repeatable campaign state.
- Integration documentation for external testing engines (daml-props, DamlFuzz) consuming the journal schema.
- Integration suite and v1.0 release of all four components.
- End-to-end tutorial: deploy with PR #322 → query and submit with this suite → run table tests with journal-backed reproduction.

**Milestone 5: Maintenance, compatibility & adoption (Months 7-12)**
*Goal: the suite stays current, supported, and growing for six months after v1.0, following the maintenance-milestone precedent set by other dev-fund proposals.*
- Compatibility releases for all four components tracking DPM and Canton SDK updates for the duration of the phase.
- Public issue triage and developer support with a committed first-response window of 5 business days.
- At least two point releases incorporating community-reported fixes and feature requests.
- Integration support for external teams adopting the components, including testing-engine integrations (daml-props, DamlFuzz) over the published journal schema.
- Two developer workshops with published materials, and a public adoption report at the end of the phase.

## Acceptance Criteria

Each milestone is verified by functional checks and ecosystem-value checks.

**Functional checks**

- **All milestones:** tagged open-source release; installable into a clean DPM project; all commands documented and compatibility-tested for LocalNet, DevNet, TestNet, and MainNet-connected participant targets; live demonstrations performed against sandbox and DevNet plus authenticated TestNet/MainNet validation where reviewer access is available; documentation identifies any target capability that depends on an optional participant or ecosystem service.
- **M1:** a reviewer can import named LocalNet, DevNet, TestNet, and MainNet profiles from `canton-deploy.config.js` without copying endpoint/auth settings and select them with `--target`; starting from an application deployed through PR #322's toolkit, the reviewer can locate a contract, inspect its transaction, exercise a choice, and confirm the ACS change through one-shot `--json` commands on non-production targets; the exercise appears in the `--follow` live tail, limited to the configured party's visibility. A read-only query is validated against an authenticated MainNet-connected participant where access is available, and a deliberately failing command surfaces a decoded human-readable message and never a raw gRPC status.
- **M2:** external-party allocation is demonstrated on an authenticated non-production target with a key held outside the participant using only `dpm wallet external` commands; the same command resolves LocalNet, DevNet, TestNet, and MainNet profiles, reporting endpoint availability and authorization failures per target.
- **M3:** for each configured environment that exposes the required prepare and Scan capabilities, a reviewer receives the target-specific estimated traffic cost, CC/USD cost, and projected rewards before submission; `--json` drives a CI cost gate, and unsupported target capabilities produce a clear machine-readable result.
- **M4:** a deliberately failing exercise produces a schema-valid journal entry containing the selected target/network identity, submitted inputs, events, visibility, decoded message, and unmodified rejection payload and update ID consumable by the PR #327 / #297 tools; a table campaign containing a deliberately failing row reports the failure per-row, the failing row is replayed exactly from its journal entry against the compatible target, and replay against a mismatched target is refused.
- **M5:** compatibility releases published for DPM/SDK updates affecting the suite during the phase; a public triage log demonstrates the committed response window; two point releases and two workshops delivered with published materials; the end-of-phase adoption report is published.

**Ecosystem-value checks**

- **M1:** at least 2 developers outside Atheon have used the target adapter plus query/submission flow, with feedback tracked publicly.
- **M3:** at least 3 external developers or projects have used the query/submission commands or the live tail against their own applications, and at least 5 inbound issues or feature requests have been triaged publicly.
- **M4 (v1.0):** at least 3 independent external repositories use one or more components in their repositories or CI pipelines; at least 2 community developers have completed the integration tutorial, with completion feedback published.

If an ecosystem-value check is not met at review time despite functional completion, Atheon will provide outreach evidence and a concrete adoption plan for committee review.

## Funding Request and Milestone Breakdown

Total request: **$300,000 USD-equivalent, disbursed in $CC** upon milestone acceptance. This funds a four-engineer, six-month build phase at **$10,000 per engineer-month** (4 × $10,000 × 6 = $240,000), plus a six-month maintenance and adoption phase staffed at one full-time engineer equivalent ($60,000).

| Milestone | Timeline | Scope | Amount |
|---|---|---|---|
| M1 - Foundation, adapter, querying & submission | Months 1-2 | Core library, PR #322 target adapter, query surface, live tail, schema utilities, `dpm exercise`, error presentation | $80,000 (26.7%) |
| M2 - External-party wallet | Month 3 | Identity helpers and external allocate/sign/import | $40,000 (13.3%) |
| M3 - Fee & reward estimation | Month 4 | Pre-flight estimation, Scan conversion, CI cost gates | $40,000 (13.3%) |
| M4 - Run journal, table tests & v1.0 | Months 5-6 | Run journal & schema, table-driven tests, engine-integration docs, integration suite, tutorial, v1.0 | $80,000 (26.7%) |
| M5 - Maintenance, compatibility & adoption | Months 7-12 | Compatibility releases, public triage & support, point releases, engine-integration support, workshops, adoption report | $60,000 (20.0%) |

No upfront tranche is requested; payment is entirely milestone-gated. M5 is disbursed at the end of the maintenance phase against its acceptance criteria.

---

### Co-Marketing
Upon each milestone release, Atheon will collaborate with the Foundation on:

* Announcement coordination for each milestone.
* A technical blog or developer tutorial demonstrating the integrated workflow (deploy with PR #322, then query, record, and test with this suite).
* Educational content and developer workshops introducing the components to the Canton developer community.
* Ecosystem promotion, including positioning the components within Canton developer channels and the relevant SIG, and proposing them as recommended developer tooling in community documentation.



---

## Motivation

This work is valuable because after deployment, developers still need scriptable queries, submission, run recording, cost estimation, and recorded, reproducible testing rather than a patchwork of REPLs and hand-written API calls. The Foundation's call for community-built DPM components names fee estimators, testing, debugging, and observability as priority areas; this suite answers those priorities directly.

The output is a common good: open-source DPM components freely available to Canton application developers and CI/DevOps engineers. Adoption is measured by external repositories and CI pipelines using the query, journal, estimation, external-party, or testing components, plus third-party contributions and issue activity.

## Rationale

A thin component suite over the JSON Ledger API is the right approach because it extends existing services rather than replacing them. The JSON API, PQS, and `daml script --input-file` provide the underlying behavior; this proposal supplies ergonomic post-deployment commands. DPM components keep releases decoupled from the SDK while presenting a native command surface. A standalone CLI and a DPM-core patch were rejected because they would fragment the experience or couple delivery to SDK release cycles. For network profiles, the target-provider adapter reuses the Daml Deployment Toolkit's configuration rather than defining a second schema, and the `--follow` stream's stable JSON schema and the run journal's preserved raw payloads make the suite a natural data source for visual and diagnostic tooling built on top.

On testing, the suite deliberately builds neither a generator library nor a fuzzing engine: in-language property-based testing for Daml already exists (OpenZeppelin's daml-props), and a dedicated fuzzing framework has been proposed to this fund (DamlFuzz, PR #52). Duplicating either would waste ecosystem funding. The suite instead contributes what those engines lack: a scriptable table-driven runner and journal-recorded runs with exact replay. It publishes the journal schema as an execution substrate those engines can build on. Adding query or testing logic to Canton internals and leaving inspection REPL-only were rejected as higher-maintenance or non-composable alternatives. Throughout, the design respects Canton's party-scoped, participant-scoped model.

---

## About Atheon

Atheon is an R&D lab working at the frontier of AI, cryptography, and zero-knowledge systems, building production-grade cryptographic infrastructure and developer tooling. We have contributed to and collaborated with leading organizations in applied cryptography and protocol engineering, including World, a16z, zkEmail, and the Ethereum Foundation. Our background spans zero-knowledge proving pipelines, zkVM research, blockchain indexing infrastructure, and protocol-level engineering and direct, hands-on experience with the mature smart-contract toolchains (Foundry and equivalents) whose developer ergonomics this proposal brings to Canton's privacy-first architecture.

**Website:** [atheon.xyz](https://atheon.xyz/)
**X (Twitter):** [@atheonxyz](https://x.com/atheonxyz)
