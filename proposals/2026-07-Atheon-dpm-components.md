## Development Fund Proposal

**Title:** DPM Ledger Operations & Reproducible Testing Suite
**Author:** Atheon
**Status:** Draft
**Created:** 2026-06-29
**Label:** daml-tooling
**Champion:** Need Champion

---

## Abstract

DPM gives Canton developers a clean local loop for creating, building, testing, sandboxing, and generating code, but the workflow after a package has been deployed still lacks a scriptable surface for inspecting state, submitting transactions, recording runs, estimating costs, and running recorded, reproducible tests. This proposal delivers an open-source suite of DPM components for that **post-deployment developer-operations and reproducible-testing layer** across LocalNet, DevNet, TestNet, and MainNet-connected participants: scriptable ledger-query and external-party wallet commands, transaction submission, a real-time terminal live tail of ledger updates, a run journal that records every suite-driven run with suite-wide human-readable error presentation, traffic fee and reward estimation, and an end-to-end DamlFuzz engine for property fuzzing and stateful invariant testing with snapshot-isolated execution on supported local targets. The suite builds on existing Canton services (the JSON Ledger API, with PQS where available) and introduces no new ledger functionality or Canton-internal changes.

---

## Specification

### 1. Objective

The objective is to deliver a unified, scriptable set of installable DPM components for live-ledger inspection, transaction submission, run recording, and reproducible testing against named LocalNet, DevNet, TestNet, and MainNet-connected participant targets. The suite begins **after deployment**.

The canonical DPM workflow today is `dpm new`, then `dpm build`, `dpm test`, `dpm sandbox`, and `dpm codegen-*`. Once a package is deployed, to inspect the Active Contract Set, read a contract or transaction, follow updates live, submit a choice, rerun a failing submission from its recorded inputs, estimate its traffic cost, or run a reproducible fuzz or invariant campaign, developers still move between interactive tools and hand-written JSON/gRPC requests. The gap, precisely stated, is a one-shot, `--json` command surface for post-deployment interaction plus a complete fuzzing system that derives typed inputs, generates stateful multi-party action sequences, evaluates user-defined invariants, guides exploration toward new behavior, shrinks failures, and records the seed, plan, ledger effects, counterexample, and snapshot identity needed for reproduction. The DPM team's call for community-built components explicitly identifies fee estimators, testing, debugging, and observability tooling as high-value contributions ([DPM Components: Extend the Canton Developer Stack](https://forum.canton.network/t/dpm-components-extend-the-canton-developer-stack/8822)). This proposal concentrates on those areas.

For comparison, Ethereum's Foundry toolchain gives developers a broad post-deployment surface (`cast send`, `cast call`, state queries, and advanced tests); this proposal delivers that interaction, recording, and testing layer for Canton.

The intended outcome is that, once an application is deployed, a Canton developer can inspect ledger state, follow transaction flow live in the terminal, use external-party signing flows, submit transactions, estimate traffic costs and app rewards before submitting, keep a durable record of every suite-driven run, and run journal-recorded fuzz and invariant campaigns entirely from scriptable DPM commands and CI. The same network-facing command surface applies across LocalNet, DevNet, TestNet, and MainNet-connected participants by selecting a named target; snapshot save and restore are restricted to supported Sandbox and LocalNet targets. The suite will document an integration path that imports named network targets from `canton-deploy.config.js`.

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

**Proposed identity, external-party, schema, and submission command reference**

| Group | Command | Purpose | Behavior and limits |
|---|---|---|---|
| Identity | `dpm wallet whoami [--target T]` | Inspect the selected target's authenticated Ledger API user and default party context. | Returns the authenticated user ID, its optional configured primary party, and relevant rights, including `CanReadAs`, `CanActAs`, and, where supported, `CanExecuteAs`. A Ledger API user is not itself a Daml party. If no primary party is configured, the command reports that condition and does not infer one from party hints or other granted rights. |
| Identity | `dpm wallet public-key [<party>] [--target T] [--synchronizer S]` | Display signing-key information available for a party. | For an external party, returns namespace and protocol-signing keys, fingerprints, key specifications, usages, and thresholds when available through an authorized topology API or DPM's local signer metadata. Local parties may not have party-owned signing keys because submission authority is delegated to a participant. The command never returns private keys and reports when the necessary topology information is unavailable. |
| External party | `dpm wallet external allocate <party-name> [--target T] [--synchronizer S] [--signer NAME]` | Onboard a party whose signing key is controlled outside the participant. | Selects a configured signer, calls `/v2/parties/external/generate-topology`, validates the generated party ID and topology transactions, recomputes and signs the returned multi-transaction hash or supported individual transaction hashes, and submits them through `/v2/parties/external/allocate`. The target must expose the required endpoints and the caller must satisfy its version-specific authorization requirements. Multisignature, decentralized-namespace, and advanced multi-hosting arrangements are supported only when explicitly configured. |
| External party | `dpm wallet external sign <file\|-> --kind transaction\|topology [--signer NAME] [--target T]` | Sign a supported prepared transaction or topology-onboarding payload using an external key. | Parses and displays the payload, verifies its type, recomputes the required hash using the declared hashing-scheme and protocol version, and requests a signature from the configured signer. It refuses arbitrary byte strings and malformed or unsupported payloads. Only the hash is sent to remote signing providers; private keys are never transmitted to the participant or included in command output. |
| External party | `dpm wallet external import --name NAME (--public-key-file FILE \| --provider URI) [--target T]` | Add an external signer or public-key reference to DPM configuration. | Stores public material or a reference to a supported HSM, custody service, or development keystore for later DPM operations. This is local DPM configuration: it does not onboard a party, register a key in Canton topology, or prove control of the corresponding private key. Production private keys are never accepted as command-line arguments. Any development-only local private-key store is separately configured and clearly marked unsafe for production. |
| Package and schema | `dpm resolve <template-fqn> [--target T] [--party P...] [--synchronizer S]` | Resolve a template reference against packages available on the selected participant. | Downloads and inspects available Daml-LF package metadata and reports matching package names, versions, package IDs, modules, templates, choices, and interfaces. When party and synchronizer context is supplied, it may query the preferred-packages API and report the package version vetted across the relevant hosting participants. Without that context, it reports candidates rather than claiming one preferred upgrade version. It does not upload or vet packages. |
| Package and schema | `dpm decode <file\|-> [--target T]` | Render supported Ledger API contract, event, or prepared-transaction JSON as readable typed output. | Resolves available package metadata and annotates templates, choices, fields, and Daml types where schema information exists. Fields defined as opaque by the Ledger API, including opaque event blobs, are preserved and identified rather than decoded, discarded, or guessed. |
| Package and schema | `dpm hash fingerprint --public-key-file FILE --format FORMAT --key-spec SPEC` | Calculate Canton's fingerprint for a supported public-key representation. | Implements Canton's version-appropriate public-key fingerprint algorithm using the declared key format and specification. It runs entirely offline, requires no target, makes no network requests, and does not persist the supplied public key. |
| Submission | `dpm exercise <contract-id> <choice> --args '{...}' --act-as P... [--read-as P...] [--target T] [--signer NAME] [--validate-only]` | Validate or exercise a Daml choice on an existing contract. | Resolves the visible contract and choice schema and checks the supplied record fields and Daml value types. Missing fields, unknown fields, malformed party identifiers, and type errors are reported before submission. With `--validate-only`, it emits the validated Ledger API JSON and exits without preparing, signing, or submitting a transaction; party existence, hosting, contract state, visibility, and authorization are not guaranteed by this local schema check. Without the flag, it submits using the explicitly supplied `actAs` parties. Exercising a choice requires authorization from all required controllers; the CLI may display controller information but does not claim it can always infer the correct `actAs` set. Ordinary submission requires appropriate `CanActAs` rights. External-party submission uses the prepare-inspect-sign-execute flow and requires the corresponding interactive-submission rights and signatures. A transaction-returning endpoint provides the update ID and caller-visible resulting events. Contract visibility alone does not grant exercise authority. |

**External-party allocation sequence**

| Step | Operation | Responsibility |
|---:|---|---|
| 1 | Resolve the target and select the configured external signer. | DPM target and signer adapters |
| 2 | Obtain the signer's public key without exposing its private key. | External signer |
| 3 | Request the required onboarding topology transactions from `/v2/parties/external/generate-topology`. | DPM and participant |
| 4 | Inspect the returned topology transactions and independently recompute the multi-transaction hash or supported individual transaction hashes to be signed. | DPM |
| 5 | Sign only the validated onboarding hash or hashes. | External signer |
| 6 | Submit the signed transactions through `/v2/parties/external/allocate`. | DPM and participant |
| 7 | Return the allocated party ID and record the operation in the run journal. | DPM |

**Choice-submission mode**

| Configured party type | Submission path |
|---|---|
| Participant-managed party | Validate arguments and explicit `actAs` parties → submit an `ExerciseCommand` → wait for and render the result. |
| External party | Validate arguments and explicit `actAs` parties → prepare the transaction → decode and inspect it → recompute its hash → sign externally → execute the signed submission. |

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

**Run journal (flight recorder).** Every run driven through the suite, whether a `dpm exercise` submission or a fuzz or invariant campaign, is automatically recorded into a structured, append-only journal: the submitted command inputs, resulting create/archive events, party visibility, abort/assert messages, campaign seed and symbolic action plan, invariant results, and any minimized counterexample. Capture happens at the API boundary as the submission is made, with no compiler, source-level, or node instrumentation. This is the property post-hoc inspection cannot provide: a failed submission that never reached the ledger leaves no transaction to fetch, but its inputs are in the journal. Activity from other clients appears with its events from the update stream; participant-side interception is explicitly out of scope.

```
dpm runlog list [--target T]                       # recorded runs on this target
dpm runlog show <run-id> [--target T] [--json]     # inputs, events, visibility, errors
dpm runlog rerun <run-id> [--target T] [--json] [--allow-production]  # reconstruct and submit recorded inputs again
```

The journal is the reproduction substrate for the testing component. Each entry records the normalized command or script input, acting and reading parties, package and script/DAR identifiers, named target, participant and synchronizer identity, and the resulting response or rejection. Campaign entries additionally record the DamlFuzz version, campaign and invariant identifiers, seed, run/depth settings, symbolic action plan, accepted and rejected actions, minimized counterexample, and—when local snapshot isolation is used—the snapshot name, manifest hash, and conformance result. `dpm runlog rerun` reconstructs a supported `dpm exercise` request or minimized campaign plan, generates fresh command and submission identifiers where required to avoid Ledger API deduplication, submits it to the selected compatible target, and records the attempt as a new run linked to the source run. Target identity mismatches are refused, and a rerun against a target marked as production requires `--allow-production`.

A rerun repeats the recorded input; it does not guarantee the same result. Contract state, contract IDs, ledger time, package vetting, topology, visibility, or authorization may have changed since the original run. Equivalent outcomes therefore require compatible ledger state, optionally established through an external snapshot/reset tool on supported local environments. Authentication tokens, authorization headers, private keys, and signer credentials are never written to the journal. The format is a versioned, line-delimited JSON schema published for downstream automated-testing and agentic-debugging tools.

**Diagnostics interoperability.** A successful journal entry carries its target, party projection, and update ID so compatible trace tooling can inspect the committed update without resubmitting the command, subject to ledger retention and visibility. A rejected entry instead carries the sanitized submission context and raw, undecoded Ledger API rejection with its correlation ID so compatible failure-classification tooling can diagnose the failure without attempting the submission again. Visual debugging tools can consume the same published journal and trace schemas.

**Traffic fee & reward estimation.** A fee & reward estimation plugin answers the app-economics question no Foundry-equivalent ever had to: what will this transaction cost, and what will it earn?

```
dpm estimate choice <contract-id> <choice> --args '{...}' [--target T]   # pre-flight a choice before exercising it
dpm estimate tx <command-json> [--target T]                              # estimate a prepared command file
dpm estimate rewards [--app <id>] [--target T]                           # projected app rewards per transaction
dpm exercise <contract-id> <choice> --args '{...}' --act-as P... --estimate [--target T]   # dry-run flag on submission itself
```

Estimation is native, not heuristic: the plugin submits the command to the JSON Ledger API's interactive-submission *prepare* endpoint (Canton 3.4+, present on the current network), which runs the Daml interpreter and returns an estimate of the transaction's synchronizer traffic cost (`cost_estimation.total_traffic_cost_estimation`, split into confirmation-request and confirmation-response components) **without committing anything to the ledger**. That traffic-cost estimate is converted to Canton Coin spend and USD using the network's extra-traffic price and the CC/USD rate from open mining rounds, both served by the public Scan API, and projected app rewards per transaction are computed from the traffic-based app reward parameters introduced by CIP-0104 (FeaturedAppRight activity weights, traffic price, round issuance) published by Scan, reported as a projection since per-round issuance depends on network-wide totals. Every estimate returns `--json` output so cost checks compose into CI gates (e.g., fail a pipeline if a workflow's traffic cost regresses). Against LocalNet, where traffic is free, the plugin reports the traffic-cost estimate and a configured-rate projection, so cost regressions are caught before TestNet. Cost estimation is an optional response field that a participant can disable, so the plugin handles its absence gracefully. Like the rest of the suite it is a thin layer: prepare endpoint, Scan rates, no new metering infrastructure.

**End-to-end DamlFuzz engine and invariant testing.** The suite delivers DamlFuzz as a complete generative-testing system. Its implementation includes the property and invariant DSL, deterministic generator framework, DAR-derived typed generators, stateful campaign engine, party/actor derivation, coverage-guided scheduling, invariant evaluation, counterexample shrinking, Sandbox and live-participant execution backends, structured reporting, and journal-backed replay.

```
dpm test-fuzz <module>:<property> --runs 256 --seed 42 [--target T] [--snapshot baseline] [--json]
dpm test-invariant <module>:<campaign> --runs 256 --seed 42 --depth 50 [--target T] [--snapshot baseline] [--json]
```

The property DSL lets developers declare generated inputs, action preconditions, expected authorization failures, state transitions, and invariants that must hold after every accepted action. The generator framework includes primitives and combinators for Daml records, variants, enums, optionals, maps, numerics, timestamps, parties, contract keys, and weighted action selection. A DAR code-generation step produces typed generator skeletons and choice metadata; developers can refine generated values with predicates and domain-specific distributions. Every campaign is driven by a deterministic seed, so the same configuration produces the same symbolic action plan.

The stateful engine maintains a model of available contracts and candidate actions, derives acting parties from template signatories and choice controllers where metadata permits, and supports both an authorized mode that maximizes useful ledger execution and an adversarial mode that deliberately probes authorization and visibility boundaries. System-wide invariants run against the omniscient Sandbox test view; party-scoped invariants run against the exact projection visible to a selected party and remain usable against authorized live participants.

After each accepted action, the engine evaluates every active invariant and records coverage and ledger effects. Coverage guidance is optional: when compatible Daml coverage data is available, the scheduler increases the weight of actions and value ranges that reach new code paths; without coverage data, seeded randomized generation remains fully functional. When a property fails, the shrinker first minimizes the action sequence and then shrinks generated argument values. Every candidate shrink is replayed from a clean starting state, and only candidates that preserve the same failure are retained.

On Sandbox, the end-to-end workflow is: deploy the packages and create the initial parties/contracts; save or select a named baseline through a compatible local snapshot provider; restore and run its conformance check before each independent campaign run; generate and execute the DamlFuzz symbolic plan; evaluate invariants after each accepted action; and, after a failure, restore the same baseline while the engine shrinks the plan to a minimal counterexample. The final proof step restores the baseline once more and replays that minimized counterexample. Snapshot operations hard-fail for DevNet, TestNet, MainNet, and every other remote target.

Sandbox restore provides equivalent packages, parties, and Active Contract Set, not identical contract IDs, offsets, or timestamps. Campaign plans and journal entries therefore use symbolic template/key/action references that are resolved again after every restore rather than persisting stale contract IDs. Runs against one Sandbox instance are serialized; parallel CI workers use separate Sandbox instances and snapshot directories. A missing, incompatible, or non-conformant snapshot prevents the campaign from starting.

Fuzz and invariant campaigns may also run without snapshots or against an authorized live participant through the JSON Ledger API backend, but replay then repeats the recorded seed and symbolic plan rather than promising the same ledger result. Equivalent outcomes depend on compatible packages, parties, permissions, contract state, and ledger time. Authentication tokens, authorization headers, private keys, and signer credentials are never recorded.

**Snapshot-provider boundary.** DamlFuzz, its generator framework, invariant engine, coverage scheduler, and shrinker are implemented by this proposal. Local checkpoint storage and restore remain behind a versioned snapshot-provider adapter. If no compatible provider is available, campaigns still run from a freshly bootstrapped Sandbox or against an authorized target, while snapshot acceleration is reported as unavailable. The suite does not implement a storage-level snapshot backend.

**Relationship to OpenZeppelin `daml-props`.** OpenZeppelin's [`daml-props`](https://github.com/OpenZeppelin/daml-props) is valuable prior art. It is an independently maintained pure-Daml property-testing library, not part of Daml's built-in library set and not distributed as a DPM component. It generates stateful action sequences, checks invariants after each step, and shrinks a failing sequence to a smaller reproduction. It is well suited to developers who explicitly add the library and want property definitions and model execution to remain inside Daml.

This proposal delivers a native DPM component and addresses the broader operational problem that an in-language library alone does not solve. It provides DAR-derived typed generators, actor-aware execution, named Sandbox and network targets, structured capture of submissions and rejections, snapshot-manifest binding, restore-before-run and restore-during-shrink isolation, coverage guidance, cross-run lineage, machine-readable CI output, remote-target safety controls, and replay through the same journal used by interactive ledger operations. The result is a stronger end-to-end testing and debugging workflow: `daml-props` can find and shrink a property failure inside an in-language test, while this suite also preserves the environment, target, parties, ledger interactions, failure artifacts, and final replay needed to reproduce and investigate that failure across a team or CI system. Teams using `daml-props` can import its seeds, action sequences, invariant results, and minimized counterexamples through the published journal adapter.

### 3. Architectural Alignment

The tool is designed to align with Canton's architecture rather than impose patterns borrowed wholesale from account-based chains. Because Canton has no global readable state, all inspection commands and live-ledger invariant checks are party-scoped and participant-scoped by construction, surfacing `--party`, `--participant`, and `--offset` as first-class flags and preserving Canton's need-to-know data model end to end. The ledger-facing components build on existing Canton services (JSON Ledger API, and PQS where available) and introduce no new ledger functionality or Canton-internal changes. The testing component implements the DamlFuzz property DSL, generators, stateful campaign engine, coverage guidance, invariant evaluator, and shrinker, while keeping local checkpoint mechanics behind a compatible snapshot-provider interface. Its journal and `--follow` stream are designed as data sources for adjacent tooling. Nothing about DPM is forked.

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
* Transaction submission with pre-submission choice validation and typed response decoding
* A run journal automatically recording every suite-driven run (command inputs, events, visibility, abort/assert messages) in a published machine-readable schema, with suite-wide human-readable error presentation and hand-off hooks for compatible diagnostic tools
* Pre-flight traffic fee estimation (traffic cost, Canton Coin, USD) and app-reward projection per transaction, composable into CI cost gates
* An end-to-end DamlFuzz implementation for property fuzzing and stateful invariant campaigns, including typed generation, actor derivation, coverage guidance, invariant evaluation, shrinking, recorded seeds, symbolic plans, and journal-backed reruns
* A journal adapter for OpenZeppelin `daml-props`, extending its pure-Daml property tests with target context, snapshot identity, CI artifacts, and cross-run replay lineage
* Snapshot-isolated Sandbox campaigns through a compatible local provider, including baseline conformance, restore-before-run, shrink-against-baseline, and final minimized replay

By exposing these capabilities through a unified, scriptable CLI that interoperates with existing deployment profiles, developers can move from deployment into inspection, submission, recording, estimation, and recorded tests without an interactive REPL or hand-written JSON/gRPC requests. This improves CI/CD composability while preserving Canton's party-scoped, privacy-first architecture.

The ledger-operations surface is a thin layer over existing Canton services including the JSON Ledger API, Participant Query Store (where available), and existing Daml Script infrastructure. The testing surface adds a self-contained DamlFuzz engine above those public interfaces, requiring no changes to Canton internals while substantially improving the developer experience.

---

## Milestones and Deliverables

The work is delivered in two phases. A **six-month build phase**, staffed by four engineers, ships four DPM components across four milestones: ledger querying & submission, external-party wallet, fee & reward estimation, and the run journal with the end-to-end DamlFuzz engine. A **six-month maintenance and adoption phase** follows v1.0, funding compatibility releases, public support, and community onboarding, so the suite does not arrive as a fire-and-forget deliverable.

All components share a core library for target-provider adapters, JSON Ledger API access, authentication, output formatting, and suite-wide error presentation. The first target provider consumes named profiles from the Daml Deployment Toolkit. Each milestone ships as a tagged open-source release installable through DPM, with documentation published alongside the release.

**Milestone 1: Foundation, Deployment Toolkit adapter, querying & submission (Months 1-2)**
*Goal: from an application already deployed to LocalNet, DevNet, TestNet, or a MainNet-connected participant, provide the same scriptable inspection and submission surface through one-shot `--json` commands and named targets.*
- DPM component foundation, shared core library (JSON Ledger API client, auth handling, output formatting, suite-wide error presentation), CI, and release process.
- Target-provider interface plus an adapter that imports LocalNet, DevNet, TestNet, and MainNet endpoint/auth/TLS profiles from `canton-deploy.config.js`; minimal JSON-API-only fallback for users of other deployment paths.
- `dpm query acs / contract / updates / tx / offset` with named-target, party, participant, and offset selection plus `--json`; PQS-backed historical queries where available; `dpm query updates --follow` live tail streaming line-delimited JSON.
- Schema utilities: `resolve`, `decode`, `hash fingerprint`.
- Transaction submission: `dpm exercise`, including `--validate-only` for schema validation without preparing, signing, or submitting a transaction.
- Documentation that begins from an already-deployed application and demonstrates switching the same commands among LocalNet, DevNet, TestNet, and MainNet deployment profiles without changing command logic.

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

**Milestone 4: Run journal, end-to-end DamlFuzz & v1.0 (Months 5-6)**
*Goal: deliver the complete DamlFuzz engine and ensure every suite-driven run is recorded with its target identity, deterministic seed, symbolic plan, invariant results, shrink lineage, and replay evidence, with snapshot-isolated reproduction on Sandbox.*
- Run journal: automatic capture of suite-driven submissions (target/network identity, inputs, events, visibility, abort/assert messages); `dpm runlog list / show / rerun`; published, versioned line-delimited JSON schema; successful entries carrying the update ID and rejected entries carrying the unmodified rejection payload for hand-off to compatible tracing and failure-classification tools.
- `dpm runlog rerun <run-id>`: reconstruction of supported exercise submissions and minimized DamlFuzz plans, fresh command/submission identifiers where required, linked journal entries for each rerun, target-identity compatibility checks, and an explicit production-target safeguard; documentation states that identical outcomes are not guaranteed without a compatible local baseline.
- `dpm test-fuzz` and `dpm test-invariant`: first-class campaign commands with named targets, deterministic seeds, run/depth settings, structured `--json` results, and automatic journal capture.
- Property and invariant DSL: generated inputs, action preconditions, expected failures, model transitions, post-action invariants, and party-scoped ledger assertions.
- Typed generation: reusable combinators plus DAR-derived generator skeletons and choice metadata for records, variants, enums, optionals, maps, numerics, timestamps, parties, contract keys, and weighted actions.
- Stateful campaign engine: symbolic contract references, model-state tracking, signatory/controller-based actor derivation, authorized and adversarial modes, and Sandbox and JSON Ledger API execution backends.
- Exploration and minimization: optional coverage-guided action/value weighting, invariant evaluation after every accepted action, sequence shrinking followed by argument-value shrinking, and deterministic final replay.
- OpenZeppelin `daml-props` journal adapter: import the property name, seed, generated action sequence, invariant result, and minimized counterexample into the same versioned campaign schema, linked to the selected target and snapshot manifest where available.
- Sandbox isolation through a compatible local snapshot provider: named baseline selection, manifest identity, restore and conformance before every independent run, serialized use of one Sandbox instance, separate instances for parallel CI, and a local-only guardrail.
- Failure minimization workflow: restore the baseline between shrink attempts, record the minimized symbolic plan, restore once more, and replay it as the acceptance proof.
- Published schemas for DamlFuzz properties, campaign inputs/results, coverage data, shrink lineage, journal entries, and snapshot manifests. Only storage-level checkpoint creation and restore remain outside the engine behind the snapshot-provider contract.
- Integration suite and v1.0 release of all four components.
- End-to-end tutorial: deploy with the Daml Deployment Toolkit → query and submit with this suite → save a Sandbox baseline with a compatible local snapshot provider → find and minimize an invariant violation with DamlFuzz → replay it from the journal.

**Milestone 5: Maintenance, compatibility & adoption (Months 7-12)**
*Goal: the suite stays current, supported, and growing for six months after v1.0, following the maintenance-milestone precedent set by other dev-fund proposals.*
- Compatibility releases for all four components tracking DPM and Canton SDK updates for the duration of the phase.
- Public issue triage and developer support with a committed first-response window of 5 business days.
- At least two point releases incorporating community-reported fixes and feature requests.
- Integration support for external teams adopting the components, including authoring DamlFuzz properties and invariants and integrating local snapshot providers through the published journal and snapshot-manifest contracts.
- Two developer workshops with published materials, and a public adoption report at the end of the phase.

## Acceptance Criteria

Each milestone is verified by functional checks and ecosystem-value checks.

**Functional checks**

- **All milestones:** tagged open-source release; installable into a clean DPM project; all commands documented and compatibility-tested for LocalNet, DevNet, TestNet, and MainNet-connected participant targets; live demonstrations performed against sandbox and DevNet plus authenticated TestNet/MainNet validation where reviewer access is available; documentation identifies any target capability that depends on an optional participant or ecosystem service.
- **M1:** a reviewer can import named LocalNet, DevNet, TestNet, and MainNet profiles from `canton-deploy.config.js` without copying endpoint/auth settings and select them with `--target`; starting from an application deployed through the Daml Deployment Toolkit, the reviewer can locate a contract, inspect its transaction, exercise a choice, and confirm the ACS change through one-shot `--json` commands on non-production targets; the exercise appears in the `--follow` live tail, limited to the configured party's visibility. A read-only query is validated against an authenticated MainNet-connected participant where access is available, and a deliberately failing command surfaces a decoded human-readable message and never a raw gRPC status.
- **M2:** external-party allocation is demonstrated on an authenticated non-production target with a key held outside the participant using only `dpm wallet external` commands; the same command resolves LocalNet, DevNet, TestNet, and MainNet profiles, reporting endpoint availability and authorization failures per target.
- **M3:** for each configured environment that exposes the required prepare and Scan capabilities, a reviewer receives the target-specific estimated traffic cost, CC/USD cost, and projected rewards before submission; `--json` drives a CI cost gate, and unsupported target capabilities produce a clear machine-readable result.
- **M4:** a deliberately failing exercise produces a schema-valid journal entry containing the selected target/network identity, submitted inputs, visibility, decoded message, and unmodified rejection payload consumable by compatible failure-classification tooling; a successful exercise records its update ID for compatible trace tooling. The DamlFuzz engine generates typed values from a representative DAR containing records, variants, enums, optionals, maps, numerics, timestamps, parties, and contract-key choices; identical configurations and seeds produce identical symbolic plans. Authorized mode derives valid actors from template and choice metadata, while adversarial mode produces expected authorization and visibility failures without treating them as engine errors. A planted stateful invariant violation is found, checked after each accepted action, minimized through both sequence and argument shrinking, and reproduced by a final replay. On Sandbox, the campaign starts from a conformant named baseline and restores it before independent runs, every shrink candidate, and the final replay; party-scoped invariants observe only the selected party's projection. An equivalent campaign executes through the JSON Ledger API backend without snapshot guarantees. A benchmark demonstrates that optional coverage guidance reaches at least one path not reached by the same fixed-budget unguided campaign. A separate OpenZeppelin `daml-props` run is imported through the journal adapter with its property name, seed, action sequence, invariant result, and minimized counterexample. The journal records the engine version, seed, plan, invariant result, snapshot manifest hash, shrink lineage, and final replay; a remote target is refused for every snapshot operation, a non-conformant snapshot prevents execution, and parallel campaigns use isolated Sandbox instances.
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
| M1 - Foundation, adapter, querying & submission | Months 1-2 | Core library, deployment-profile adapter, query surface, live tail, schema utilities, `dpm exercise`, error presentation | $80,000 (26.7%) |
| M2 - External-party wallet | Month 3 | Identity helpers and external allocate/sign/import | $40,000 (13.3%) |
| M3 - Fee & reward estimation | Month 4 | Pre-flight estimation, Scan conversion, CI cost gates | $40,000 (13.3%) |
| M4 - Run journal, end-to-end DamlFuzz & v1.0 | Months 5-6 | Run journal & schema, property/invariant DSL, typed generators, actor-aware stateful engine, coverage guidance, shrinking, `daml-props` adapter, Sandbox snapshot isolation, integration suite, tutorial, v1.0 | $80,000 (26.7%) |
| M5 - Maintenance, compatibility & adoption | Months 7-12 | Compatibility releases, public triage & support, point releases, engine-integration support, workshops, adoption report | $60,000 (20.0%) |

No upfront tranche is requested; payment is entirely milestone-gated. M5 is disbursed at the end of the maintenance phase against its acceptance criteria.

---

### Co-Marketing
Upon each milestone release, Atheon will collaborate with the Foundation on:

* Announcement coordination for each milestone.
* A technical blog or developer tutorial demonstrating the integrated workflow: deploy with the Daml Deployment Toolkit, then query, record, and test with this suite.
* Educational content and developer workshops introducing the components to the Canton developer community.
* Ecosystem promotion, including positioning the components within Canton developer channels and the relevant SIG, and proposing them as recommended developer tooling in community documentation.



---

## Motivation

This work is valuable because after deployment, developers still need scriptable queries, submission, run recording, cost estimation, and recorded, reproducible testing rather than a patchwork of REPLs and hand-written API calls. The Foundation's call for community-built DPM components names fee estimators, testing, debugging, and observability as priority areas; this suite answers those priorities directly.

The output is a common good: open-source DPM components freely available to Canton application developers and CI/DevOps engineers. Adoption is measured by external repositories and CI pipelines using the query, journal, estimation, external-party, or testing components, plus third-party contributions and issue activity.

## Rationale

A thin component suite over the JSON Ledger API is the right approach because it extends existing services rather than replacing them. The JSON API, PQS, and `dpm script --input-file` provide the underlying behavior; this proposal supplies ergonomic post-deployment commands. DPM components keep releases decoupled from the SDK while presenting a native command surface. A standalone CLI and a DPM-core patch were rejected because they would fragment the experience or couple delivery to SDK release cycles. For network profiles, the target-provider adapter reuses the Daml Deployment Toolkit's configuration rather than defining a second schema, and the `--follow` stream's stable JSON schema and the run journal's preserved raw payloads make the suite a natural data source for visual and diagnostic tooling built on top.

The testing architecture unifies the complete DamlFuzz stack and its operational environment through one deterministic campaign model. The stack includes the property and invariant DSL, DAR-derived typed generators, stateful multi-party action generation, actor derivation, coverage guidance, post-action invariant evaluation, sequence and value shrinking, Sandbox and JSON Ledger API backends, structured CI output, and journal-backed replay. A seed, symbolic plan, party projection, snapshot manifest, shrink lineage, and minimized counterexample therefore describe one reproducible execution.

OpenZeppelin `daml-props` remains important prior art and a useful externally installed pure-Daml option; it is neither a built-in Daml library nor a DPM component. This proposal goes further operationally and technically by delivering the testing workflow as a DPM component: it derives generators from deployed package schemas, runs against both Sandbox and authorized participant APIs, models Canton party visibility and actor authorization explicitly, uses optional coverage feedback to guide exploration, isolates runs and shrink attempts through named snapshots, and records the complete campaign in a cross-run journal. Teams already using `daml-props` can import its seeds, action sequences, invariant results, and minimized counterexamples through the journal adapter. Storage-level checkpoint creation and restore are supplied through an environment-specific provider interface. Throughout, the design respects Canton's party-scoped, participant-scoped model and treats identical ledger offsets or contract IDs after restore as explicitly unsupported.

---

## About Atheon

Atheon is an R&D lab working at the frontier of AI, cryptography, and zero-knowledge systems, building production-grade cryptographic infrastructure and developer tooling. We have contributed to and collaborated with leading organizations in applied cryptography and protocol engineering, including World, a16z, zkEmail, and the Ethereum Foundation. Our background spans zero-knowledge proving pipelines, zkVM research, blockchain indexing infrastructure, and protocol-level engineering and direct, hands-on experience with the mature smart-contract toolchains (Foundry and equivalents) whose developer ergonomics this proposal brings to Canton's privacy-first architecture.

**Website:** [atheon.xyz](https://atheon.xyz/)
**X (Twitter):** [@atheonxyz](https://x.com/atheonxyz)
