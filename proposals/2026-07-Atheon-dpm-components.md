## Development Fund Proposal

**Title:** DPM Ledger Operations & Reproducible Testing Suite  
**Author:** Atheon
**Status:** Draft
**Created:** 2026-06-29
**Label:** daml-tooling
**Champion:** Need Champion

---

## Abstract

DPM gives Canton developers a clean local loop for creating, building, testing, sandboxing, and generating code, but the workflow after a package has been deployed still lacks a scriptable surface for inspecting state, submitting transactions, recording runs, estimating costs, and running recorded, reproducible tests. This proposal delivers an open-source suite of DPM components for that **post-deployment developer-operations and reproducible-testing layer**: scriptable ledger-query and external-party wallet commands, transaction submission, a real-time terminal live tail of ledger updates, a run journal that records every suite-driven run with suite-wide human-readable error presentation, traffic fee and reward estimation, and table-driven testing with journal-backed exact replay. The suite is a thin orchestration layer over existing Canton services (the JSON Ledger API, with PQS where available) and introduces no new ledger functionality or Canton-internal changes.

---

## Specification

### 1. Objective

The objective is to deliver a unified, scriptable set of installable DPM components for live-ledger inspection, transaction submission, run recording, and reproducible testing. The suite begins **after deployment**.

The canonical DPM workflow today is `dpm new`, then `dpm build`, `dpm test`, `dpm sandbox`, and `dpm codegen-*`. Once a package is deployed, to inspect the Active Contract Set, read a contract or transaction, follow updates live, submit a choice, replay a failing run, estimate its traffic cost, or run a table-driven test campaign, developers still move between interactive tools and hand-written JSON/gRPC requests. The gap, precisely stated, is a one-shot, `--json` command surface for post-deployment interaction, plus testing capabilities that `dpm test` does not provide: table-driven tests and journal-recorded, exactly-replayable test runs. The DPM team's call for community-built components explicitly identifies fee estimators, testing, debugging, and observability tooling as high-value contributions ([DPM Components: Extend the Canton Developer Stack](https://forum.canton.network/t/dpm-components-extend-the-canton-developer-stack/8822)). This proposal concentrates on those areas.

For comparison, Ethereum's Foundry toolchain gives developers a broad post-deployment surface (`cast send`, `cast call`, state queries, and advanced tests); this proposal delivers that interaction, recording, and testing layer for Canton.

The intended outcome is that, once an application is deployed, a Canton developer can inspect ledger state, follow transaction flow live in the terminal, use external-party signing flows, submit transactions, estimate traffic costs and app rewards before submitting, keep a durable record of every local run, and run table-driven, journal-recorded tests entirely from scriptable DPM commands and CI. The suite will document an integration path that imports a named target from `canton-deploy.config.js`.

### 2. Implementation Mechanics

The components are built as a lightweight orchestration layer over existing Canton services. The default backend is the Canton JSON Ledger API: `/v2/parties/external/*` for external-party workflows and `/v2/state/*` plus `/v2/updates` for ledger queries (bounded HTTP requests for one-shot commands and websocket streaming for the follow mode). The Participant Query Store (PQS) is used where available for historical ACS and offset-based inspection.

**Why DPM components on the JSON API.** Targeting the JSON API avoids protobuf generation and a gRPC toolchain, enabling faster implementation and lower maintenance. The transport layer is abstracted so gRPC support can be added without reworking command logic.

**Party- and participant-scoped by design.** Canton has no global, readable state, state is inherently party-scoped and participant-scoped. The components treat this as a first-class design constraint rather than something to work around: every query command supports configurable `--party`, `--participant`, and `--offset` options, providing an ergonomic command line while fully preserving Canton's security and privacy model.



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
```

The component suite exposes four coherent groups of commands.

**Ledger querying, external-party wallet, schema, and submission.** Scriptable, one-shot commands that replace REPL-gated inspection:

```
# Ledger queries
dpm query acs <template-fqn> [--party P] [--participant N] [--offset O] [--json]
dpm query contract <contract-id> [--party P] [--json]
dpm query updates [--template <fqn>] [--from-offset O] [--json]
dpm query updates --follow [--template <fqn>] [--json]   # live tail: stream events to stdout as they land
dpm query tx <update-id> [--json]
dpm query offset

# Identity helpers
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
dpm hash fingerprint <public-key>

# Transaction submission
dpm exercise <contract-id> <choice> --args '{...}'
```

Every command supports a `--json` flag so output composes cleanly into shell pipelines and CI, replacing REPL-gated inspection with command-gated, scriptable inspection.

The wallet commands cover the external-party case, where the key lives outside the participant and allocation requires Canton's external-signing topology flow (`/v2/parties/external/generate-topology` → external Ed25519 signing of a multi-hash → `/v2/parties/external/allocate`).

**Live ledger tail.** `dpm query updates --follow` streams contract creates and archives, exercised choices, and party disclosures to stdout as line-delimited JSON (or human-readable text), party-scoped by construction: the feed renders exactly what the configured party is entitled to see, nothing more. The stream's stable JSON schema doubles as a live data feed that dashboards and visual tooling can consume directly.

**Suite-wide error presentation.** No suite command ever surfaces a raw gRPC status: any command that receives a structured Canton error renders it as a human-readable message naming the failing choice and contract where the error payload permits, in both pretty and `--json` form. This is a thin, deterministic presentation layer shipped in the shared core library.

**Run journal (flight recorder).** Every run driven through the suite, whether a `dpm exercise` submission or a table-driven test campaign, is automatically recorded into a structured, append-only journal: the submitted command inputs, resulting create/archive events, party visibility, and abort/assert messages. Capture happens at the API boundary as the submission is made, with no compiler, source-level, or node instrumentation. This is the property post-hoc inspection cannot provide: a failed submission that never reached the ledger leaves no transaction to fetch, but its inputs are in the journal. Activity from other clients appears with its events from the update stream; participant-side interception is explicitly out of scope.

```
dpm runlog list                       # recorded runs on this target
dpm runlog show <run-id> [--json]     # inputs, events, visibility, errors
```

The journal is the reproduction substrate for the testing component: recorded runs are replayed exactly from their journal entries, which is why it ships as part of that component. The format is a versioned, line-delimited JSON schema, published for downstream automated-testing and agentic-debugging tools.

**Diagnostics interoperability.** Each journal entry carries the update ID and the raw, undecoded rejection payload with its correlation ID, so a recorded run can be opened in DPM Trace's visualizer (PR #327) or handed to the Canton Transaction Debugger (PR #297) without re-running anything.

**Traffic fee & reward estimation.** A fee & reward estimation plugin answers the app-economics question no Foundry-equivalent ever had to: what will this transaction cost, and what will it earn?

```
dpm estimate choice <contract-id> <choice> --args '{...}'   # pre-flight a choice before exercising it
dpm estimate tx <command-json>                              # estimate a prepared command file
dpm estimate rewards [--app <id>]                           # projected app rewards per transaction
dpm exercise <contract-id> <choice> --args '{...}' --estimate   # dry-run flag on submission itself
```

Estimation is native, not heuristic: the plugin submits the command to the JSON Ledger API's interactive-submission *prepare* endpoint (Canton 3.4+, present on the current network), which runs the Daml interpreter and returns an estimate of the transaction's synchronizer traffic cost (`cost_estimation.total_traffic_cost_estimation`, split into confirmation-request and confirmation-response components) **without committing anything to the ledger**. That traffic-cost estimate is converted to Canton Coin spend and USD using the network's extra-traffic price and the CC/USD rate from open mining rounds, both served by the public Scan API, and projected app rewards per transaction are computed from the traffic-based app reward parameters introduced by CIP-0104 (FeaturedAppRight activity weights, traffic price, round issuance) published by Scan, reported as a projection since per-round issuance depends on network-wide totals. Every estimate returns `--json` output so cost checks compose into CI gates (e.g., fail a pipeline if a workflow's traffic cost regresses). Against LocalNet, where traffic is free, the plugin reports the traffic-cost estimate and a configured-rate projection, so cost regressions are caught before TestNet. Cost estimation is an optional response field that a participant can disable, so the plugin handles its absence gracefully. Like the rest of the suite it is a thin layer: prepare endpoint, Scan rates, no new metering infrastructure.

**Table-driven and recorded testing.** Generative testing for Daml is already served by the ecosystem: OpenZeppelin's [daml-props](https://github.com/OpenZeppelin/daml-props) provides in-language property-based testing (generators, `forAll`, sequence testing, and shrinking inside Daml Script), and the [DamlFuzz proposal](https://github.com/canton-foundation/canton-dev-fund/pull/52) proposes a dedicated property-based testing and coverage-guided fuzzing engine for Daml. This suite deliberately builds neither a generator library nor a fuzzing engine. It delivers the testing capabilities that remain missing and that no in-language engine provides:

- `dpm test --table <module>:<script> --rows rows.json` adds parameterized table-driven testing by executing the same Daml Script against a predefined set of input rows through `daml script --input-file`, with per-row pass/fail reporting in `--json` for CI.
- Every table run is captured in the run journal, and any recorded run, whether a table row or an interactive `dpm exercise`, is replayed exactly from its journal entry, which is what makes reproduction exact rather than approximate.
- For repeatable campaign state, test campaigns integrate with environment-level snapshot/restore where available (e.g. DevKit's `dpm localnet snapshot`) rather than shipping a snapshot mechanism of their own.

Rather than competing with the ecosystem's testing engines, the suite is designed as their execution and reproduction substrate: the journal's published schema is available to any external campaign driver. daml-props properties and DamlFuzz campaigns both execute as Daml Scripts, so runs driven through this suite gain recorded inputs and exact replay with no changes to those tools. `daml script --input-file` provides the execution mechanism, existing coverage reporting is unchanged, and no changes to Daml or the runtime are required.

### 3. Architectural Alignment

The tool is designed to align with Canton's architecture rather than impose patterns borrowed wholesale from account-based chains. Because Canton has no global readable state, all inspection commands are party-scoped and participant-scoped by construction, surfacing `--party`, `--participant`, and `--offset` as first-class flags and preserving Canton's need-to-know data model end to end. It is a thin wrapper over existing Canton services (JSON Ledger API, and PQS where available) that introduces no new ledger functionality and modifies no Canton internals. It covers ledger interaction, run recording, and table-driven testing, and its journal and `--follow` stream are designed as data sources for adjacent tooling. Nothing about DPM is forked or duplicated.

### 4. Backward Compatibility

No backward compatibility impact. The tool is additive: it wraps existing Canton JSON Ledger API and PQS endpoints, requires no changes to Canton core, Splice, or Daml, and extends DPM only through its official component interface. It introduces no new on-ledger logic. Existing DPM workflows and coverage reporting are unchanged.

---

## Impact

This proposal supplies the post-deployment layer of a first-class Canton CLI experience: ledger interaction, run recording, and reproducible testing.

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
*Goal: from an already-deployed application to scriptable inspection and submission in one-shot `--json` commands.*
- DPM component foundation, shared core library (JSON Ledger API client, auth handling, output formatting, suite-wide error presentation), CI, and release process.
- Target-provider interface plus an adapter that imports endpoint/auth/TLS settings from `canton-deploy.config.js`; minimal JSON-API-only fallback for users of other deployment paths.
- `dpm query acs / contract / updates / tx / offset` with party/participant/offset filters and `--json`; PQS-backed historical queries where available; `dpm query updates --follow` live tail streaming line-delimited JSON.
- Schema utilities: `resolve`, `encode choice`, `decode`, `hash fingerprint`.
- Transaction submission: `dpm exercise`.
- Documentation that begins from an already-deployed application and demonstrates reuse of a PR #322 named target.

**Milestone 2: External-party wallet flows (Month 3)**
*Goal: complete external-party workflows, where the key is held outside the participant, without hand-written topology requests.*
- Identity helpers: `dpm wallet whoami`, `dpm wallet public-key`.
- External-party signing: `dpm wallet external allocate / sign / import`, wrapping the generate-topology → external-sign → allocate flow.
- Worked example: allocating an external party and exercising a choice on its behalf, end to end.

**Milestone 3: Traffic fee & reward estimation (Month 4)**
*Goal: answer "what will this transaction cost, and what will it earn?" before submitting.*
- `dpm estimate choice / tx / rewards` and `dpm exercise --estimate`, built on the interactive-submission prepare endpoint plus Scan rates.
- Conversion of the traffic-cost estimate to Canton Coin and USD, and CIP-0104 app-reward projection.
- `--json` output with a worked cost-regression CI gate example.

**Milestone 4: Run journal, table-driven testing & v1.0 (Months 5-6)**
*Goal: every suite-driven run recorded and exactly replayable; table-driven testing lands as the suite's testing capability.*
- Run journal: automatic capture of suite-driven submissions (inputs, events, visibility, abort/assert messages); `dpm runlog list / show`; published, versioned line-delimited JSON schema; every entry carrying the update ID and unmodified rejection payload for hand-off to the PR #327 / #297 tools.
- `dpm test --table`: parameterized execution from rows files, per-row `--json` reporting, and exact replay of any recorded row from its journal entry.
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

- **All milestones:** tagged open-source release; installable into a clean DPM project; listed commands demonstrated against sandbox and DevNet where applicable; documentation published.
- **M1:** a reviewer can import a named `canton-deploy.config.js` profile into the suite without copying endpoint/auth settings; starting from an application deployed through PR #322's toolkit, the reviewer can locate a contract, inspect its transaction, exercise a choice, and confirm the ACS change through one-shot `--json` commands; the exercise appears in the `--follow` live tail, limited to the configured party's visibility; a deliberately failing command surfaces a decoded human-readable message and never a raw gRPC status.
- **M2:** external-party allocation is demonstrated with a key held outside the participant using only `dpm wallet external` commands.
- **M3:** a reviewer receives the estimated traffic cost, CC/USD cost, and projected rewards before submission; `--json` drives a CI cost gate.
- **M4:** a deliberately failing exercise produces a schema-valid journal entry containing the submitted inputs, events, visibility, the decoded message, and the unmodified rejection payload and update ID consumable by the PR #327 / #297 tools; a table campaign containing a deliberately failing row reports the failure per-row and the failing row is replayed exactly from its journal entry.
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
