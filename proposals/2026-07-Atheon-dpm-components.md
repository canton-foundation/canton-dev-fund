## Development Fund Proposal

**Title:** DPM Ledger Operations & Reproducible Replay Suite
**Author:** Atheon
**Status:** Draft
**Created:** 2026-06-29
**Label:** daml-tooling
**Champion:** Need Champion

---

## Abstract

DPM gives Canton developers a clean local loop for creating, building, testing, sandboxing, and generating code, but the workflow after a package has been deployed still lacks a scriptable surface for inspecting state, submitting transactions, recording runs, estimating costs, replaying recorded submissions, and resetting a Sandbox to a named baseline. This proposal delivers an open-source suite of DPM components for that **post-deployment developer-operations and reproducible-replay layer** across LocalNet, DevNet, TestNet, and MainNet-connected participants: scriptable ledger-query and external-party wallet commands, transaction submission, a real-time terminal live tail of ledger updates, a run journal that records every suite-driven run with suite-wide human-readable error presentation, traffic fee and reward estimation, and named save/restore for locally controlled Sandbox targets. The suite builds on existing Canton services, including the JSON Ledger API, PQS where available, and supported local participant repair or import capabilities, and introduces no new ledger functionality or Canton-internal changes.

---

## Specification

### 1. Objective

The objective is to deliver a unified, scriptable set of installable DPM components for live-ledger inspection, transaction submission, run recording, reproducible replay, and named Sandbox baselines. The suite begins **after deployment**.

The canonical DPM workflow today is `dpm new`, then `dpm build`, `dpm test`, `dpm sandbox`, and `dpm codegen-*`. Once a package is deployed, to inspect the Active Contract Set, read a contract or transaction, follow updates live, submit a choice, rerun a failing submission from its recorded inputs, estimate its traffic cost, or reset a local Sandbox to a known baseline, developers still move between interactive tools and hand-written JSON/gRPC requests. The gap, precisely stated, is a one-shot, `--json` command surface for post-deployment interaction that records the inputs, ledger effects, errors, and target identity needed to investigate and replay suite-driven submissions, plus a named save/restore surface for locally controlled Sandbox state. The DPM team's call for community-built components explicitly identifies fee estimators, debugging, and observability tooling as high-value contributions ([DPM Components: Extend the Canton Developer Stack](https://forum.canton.network/t/dpm-components-extend-the-canton-developer-stack/8822)). This proposal concentrates on those areas.

For comparison, Ethereum's Foundry toolchain gives developers a broad post-deployment surface (`cast send`, `cast call`, and state queries); this proposal delivers that interaction and recording layer for Canton.

The intended outcome is that, once an application is deployed, a Canton developer can inspect ledger state, follow transaction flow live in the terminal, use external-party signing flows, submit transactions, estimate traffic costs and app rewards before submitting, keep a durable, replayable record of every suite-driven run, and restore a locally controlled Sandbox to a named baseline through scriptable DPM commands and CI. The network-facing command surface applies across LocalNet, DevNet, TestNet, and MainNet-connected participants by selecting a named target; snapshot restore is Sandbox-only. The suite will document an integration path that imports named network targets from `canton-deploy.config.js`.

### 2. Implementation Mechanics

#### 2.1 Architecture and target resolution

The components are built as a lightweight orchestration layer over existing Canton services. The default backend is the Canton JSON Ledger API: `/v2/parties/external/*` for external-party workflows and `/v2/state/*` plus `/v2/updates` for ledger queries (bounded HTTP requests for one-shot commands and websocket streaming for the follow mode). The Participant Query Store (PQS) is used where available for historical ACS and offset-based inspection.

##### 2.1.1 Why DPM components on the JSON API

Targeting the JSON API avoids protobuf generation and a gRPC toolchain, enabling faster implementation and lower maintenance. The transport layer is abstracted so gRPC support can be added without reworking command logic.

##### 2.1.2 Party- and participant-scoped by design

Canton has no global, readable state, state is inherently party-scoped and participant-scoped. The components treat this as a first-class design constraint rather than something to work around: every query command supports configurable `--party`, `--participant`, and `--offset` options, providing an ergonomic command line while fully preserving Canton's security and privacy model.

##### 2.1.3 Cross-network by design

Every network-facing command resolves its endpoint, authentication, TLS, participant, and default party from a named `--target`. The same component and command logic supports LocalNet, DevNet, TestNet, and MainNet-connected Canton participants wherever the required JSON Ledger API capability is exposed and the authenticated user has the necessary rights. Queries remain party- and participant-scoped, while unavailable optional capabilities return an explicit unsupported result.

##### 2.1.4 Interoperable target resolution

The suite reads endpoint, authentication, TLS, and network-profile information through a target-provider interface. The first provider imports named profiles from the Daml Deployment Toolkit's `canton-deploy.config.js`. A minimal JSON-API-only provider is available for users who deploy by other means. Authentication tokens are referenced through environment variables rather than stored in suite configuration. An illustrative fallback config:

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

##### 2.1.5 OCI distribution

Each component is published as a versioned OCI artifact containing its complete command group. Releases use immutable version tags and published digests or checksums, so projects and CI pipelines can install and pin the components through DPM. OCI is used only for distribution; the commands do not require a container runtime unless their underlying workflow independently uses one.

The component suite exposes five coherent groups of commands.

#### 2.2 Ledger querying

Scriptable, one-shot commands that replace REPL-gated inspection:

```
# Ledger queries
dpm query acs <template-fqn> [--target T] [--party P] [--participant N] [--offset O] [--json]
dpm query contract <contract-id> [--target T] [--party P] [--json]
dpm query updates [--target T] [--template <fqn>] [--from-offset O] [--json]
dpm query updates --follow [--target T] [--template <fqn>] [--json]   # live tail: stream events to stdout as they land
dpm query tx <update-id> [--target T] [--json]
dpm query offset [--target T] [--json]
```

##### 2.2.1 Common query behavior

- **Environment selection:** `--target T` selects a LocalNet, DevNet, TestNet, or MainNet-connected participant profile. When omitted, the configured default target is used.
- **Party visibility:** Results are restricted to the selected or configured Daml party. `--party` selects an existing authorized view; it never grants additional ledger rights.
- **Participant scope:** `--participant N` selects an endpoint when a target contains multiple participants. Queries never represent public or global Canton state.
- **Offsets:** Offsets belong to one participant target and must not be reused across environments. Historical reads remain subject to that participant's pruning and retention limits.
- **Machine-readable output:** `--json` returns structured output for scripts and CI. Continuous streams use line-delimited JSON.

##### 2.2.2 Ledger-query command reference

| Command | Purpose | Selection and filtering | Result and limits |
|---|---|---|---|
| `dpm query acs <template-fqn>` | Inspect active contracts for one template. | Resolves the template against the selected target. Supports `--party`, `--participant`, and `--offset`. | Returns only matching active contracts visible to the authorized party at the requested retained offset. |
| `dpm query contract <contract-id>` | Inspect one contract and its available lifecycle information. | Uses `--party` or the target's default party. | Returns the visible create event and, where available, archive event and status. Contracts outside the party's visibility are not exposed. |
| `dpm query updates` | Read a finite set of ledger updates and exit. | `--template` filters by a template deployed on the target; `--from-offset` begins at a saved target-specific position. | Returns visible creates, archives, exercised choices, and other supported update types. Intended for one-shot scripts and CI jobs. |
| `dpm query updates --follow` | Follow new ledger updates continuously. | Uses the selected target's websocket stream and optional template filter. | Runs until interrupted. In `--json` mode, emits one party-visible event per line for incremental downstream processing. |
| `dpm query tx <update-id>` | Inspect one committed Canton update. | Resolves the update ID on the selected target and uses the configured party projection. | Returns only transaction events visible to that party. The update ID is target-specific, not a globally public transaction hash. |
| `dpm query offset` | Read the selected participant's latest ledger offset. | Uses the selected or default target. | Returns a participant-local synchronization position for later ACS or update queries. It is not a public global block height. |

#### 2.3 External-party wallet, identity, schema, and submission

##### 2.3.1 External-party wallet and signing model

The wallet commands provide a DPM command surface over Canton’s existing external-party Ledger API mechanisms and, where practical, the official Canton Wallet SDK building blocks; the suite does not introduce another signing protocol or wallet service. For a local party, a participant authorizes submissions using its node keys, whereas an external party controls its own signing keys. Those keys may be held by an HSM, custody service, external wallet, or explicitly development-only local keystore, but production private-key material is never provided to the participant or passed through the command line. The following commands expose these identity, onboarding, signing, schema, and submission workflows.

##### 2.3.2 Proposed command reference

| Group | Command | Purpose | Behavior and limits |
|---|---|---|---|
| Identity | `dpm wallet whoami [--target T]` | Inspect the selected target's authenticated Ledger API user and default party context. | Returns the authenticated user ID, its optional configured primary party, and relevant rights, including `CanReadAs`, `CanActAs`, and, where supported, `CanExecuteAs`. A Ledger API user is not itself a Daml party. If no primary party is configured, the command reports that condition and does not infer one from party hints or other granted rights. |
| Identity | `dpm wallet public-key [<party>] [--target T] [--synchronizer S]` | Display signing-key information available for a party. | For an external party, returns namespace and protocol-signing keys, fingerprints, key specifications, usages, and thresholds when available through an authorized topology API or DPM's local signer metadata. Local parties may not have party-owned signing keys because submission authority is delegated to a participant. The command never returns private keys and reports when the necessary topology information is unavailable. |
| External party | `dpm wallet external import --name NAME (--public-key-file FILE \| --provider URI) [--target T]` | Add an external signer or public-key reference to DPM configuration. | Stores public material or a reference to a supported HSM, custody service, or development keystore for later DPM operations. This is local DPM configuration: it does not onboard a party, register a key in Canton topology, or prove control of the corresponding private key. Production private keys are never accepted as command-line arguments. Any development-only local private-key store is separately configured and clearly marked unsafe for production. |
| External party | `dpm wallet external allocate <party-name> [--target T] [--synchronizer S] [--signer NAME]` | Onboard a party whose signing key is controlled outside the participant. | Selects a configured signer, calls `/v2/parties/external/generate-topology`, validates the generated party ID and topology transactions, recomputes and signs the returned multi-transaction hash or supported individual transaction hashes, and submits them through `/v2/parties/external/allocate`. The target must expose the required endpoints and the caller must satisfy its version-specific authorization requirements. Multisignature, decentralized-namespace, and advanced multi-hosting arrangements are supported only when explicitly configured. |
| External party | `dpm wallet external sign <file\|-> --kind transaction\|topology [--signer NAME] [--target T]` | Sign a supported prepared transaction or topology-onboarding payload using an external key. | Parses and displays the payload, verifies its type, recomputes the required hash using the declared hashing-scheme and protocol version, and requests a signature from the configured signer. It refuses arbitrary byte strings and malformed or unsupported payloads. Only the hash is sent to remote signing providers; private keys are never transmitted to the participant or included in command output. |
| Package and schema | `dpm resolve <template-fqn> [--target T] [--party P...] [--synchronizer S]` | Resolve a template reference against packages available on the selected participant. | Downloads and inspects available Daml-LF package metadata and reports matching package names, versions, package IDs, modules, templates, choices, and interfaces. When party and synchronizer context is supplied, it may query the preferred-packages API and report the package version vetted across the relevant hosting participants. Without that context, it reports candidates rather than claiming one preferred upgrade version. It does not upload or vet packages. |
| Package and schema | `dpm decode <file\|-> [--target T]` | Render supported Ledger API contract, event, or prepared-transaction JSON as readable typed output. | Resolves available package metadata and annotates templates, choices, fields, and Daml types where schema information exists. Fields defined as opaque by the Ledger API, including opaque event blobs, are preserved and identified rather than decoded, discarded, or guessed. |
| Package and schema | `dpm hash fingerprint --public-key-file FILE --format FORMAT --key-spec SPEC` | Calculate Canton's fingerprint for a supported public-key representation. | Implements Canton's version-appropriate public-key fingerprint algorithm using the declared key format and specification. It runs entirely offline, requires no target, makes no network requests, and does not persist the supplied public key. |
| Submission | `dpm exercise <contract-id> <choice> --args '{...}' --act-as P... [--read-as P...] [--target T] [--signer NAME] [--validate-only]` | Validate or exercise a Daml choice on an existing contract. | Resolves the visible contract and choice schema and checks the supplied record fields and Daml value types. Missing fields, unknown fields, malformed party identifiers, and type errors are reported before submission. With `--validate-only`, it emits the validated Ledger API JSON and exits without preparing, signing, or submitting a transaction; party existence, hosting, contract state, visibility, and authorization are not guaranteed by this local schema check. Without the flag, it submits using the explicitly supplied `actAs` parties. Exercising a choice requires authorization from all required controllers; the CLI may display controller information but does not claim it can always infer the correct `actAs` set. Ordinary submission requires appropriate `CanActAs` rights. External-party submission uses the prepare-inspect-sign-execute flow and requires the corresponding interactive-submission rights and signatures. A transaction-returning endpoint provides the update ID and caller-visible resulting events. Contract visibility alone does not grant exercise authority. |

##### 2.3.3 External-party allocation sequence

| Step | Operation | Responsibility |
|---:|---|---|
| 1 | Resolve the target and select the configured external signer. | DPM target and signer adapters |
| 2 | Obtain the signer's public key without exposing its private key. | External signer |
| 3 | Request the required onboarding topology transactions from `/v2/parties/external/generate-topology`. | DPM and participant |
| 4 | Inspect the returned topology transactions and independently recompute the multi-transaction hash or supported individual transaction hashes to be signed. | DPM |
| 5 | Sign only the validated onboarding hash or hashes. | External signer |
| 6 | Submit the signed transactions through `/v2/parties/external/allocate`. | DPM and participant |
| 7 | Return the allocated party ID and record the operation in the run journal. | DPM |

##### 2.3.4 Choice-submission mode

| Configured party type | Submission path |
|---|---|
| Participant-managed party | Validate arguments and explicit `actAs` parties → submit an `ExerciseCommand` → wait for and render the result. |
| External party | Validate arguments and explicit `actAs` parties → prepare the transaction → decode and inspect it → recompute its hash → sign externally → execute the signed submission. |



#### 2.4 Live ledger tail

`dpm query updates --follow` streams contract creates and archives, exercised choices, and party disclosures to stdout as line-delimited JSON (or human-readable text), party-scoped by construction: the feed renders exactly what the configured party is entitled to see, nothing more. The stream's stable JSON schema doubles as a live data feed that dashboards and visual tooling can consume directly.


#### 2.5 Run journal and diagnostics interoperability

##### 2.5.1 Run journal (flight recorder)

Every suite-driven operation, including `dpm exercise` submissions, is recorded in a structured, append-only journal. Capture occurs at the API boundary without compiler, source-level, or participant-node instrumentation. This preserves failed submissions that never reached the ledger and therefore have no transaction to inspect.

```text
dpm runlog list [--target T]
dpm runlog show <run-id> [--target T] [--json]
dpm runlog rerun <run-id> [--target T] [--json] [--allow-production]
```

Each journal entry records the normalized input, acting and reading parties, package or DAR identifiers, target, participant and synchronizer identity, and the resulting ledger events or rejection.

`dpm runlog rerun` reconstructs a supported `dpm exercise` request, generates fresh identifiers to avoid Ledger API deduplication, submits it to a compatible target, and links the new journal entry to the original run. Target mismatches are refused, and production reruns require `--allow-production`.

Rerunning preserves the recorded input but does not guarantee the same result because contract state, contract IDs, ledger time, package vetting, topology, visibility, or authorization may have changed. Equivalent outcomes require compatible ledger state. Authentication tokens, authorization headers, private keys, and signer credentials are never recorded. Journal entries use a published, versioned line-delimited JSON schema for downstream automation and agentic-debugging tools.

##### 2.5.2 Diagnostics interoperability

A successful journal entry carries its target, party projection, and update ID so compatible trace tooling can inspect the committed update without resubmitting the command, subject to ledger retention and visibility. A rejected entry instead carries the sanitized submission context and raw, undecoded Ledger API rejection with its correlation ID so compatible failure-classification tooling can diagnose the failure without attempting the submission again. Visual debugging tools can consume the same published journal and trace schemas.

#### 2.6 Traffic fee and reward estimation

A fee & reward estimation plugin answers the app-economics question no Foundry-equivalent ever had to: what will this transaction cost, and what will it earn?

```
dpm estimate choice <contract-id> <choice> --args '{...}' [--target T]   # pre-flight a choice before exercising it
dpm estimate tx <command-json> [--target T]                              # estimate a prepared command file
dpm estimate rewards [--app <id>] [--target T]                           # projected app rewards per transaction
dpm exercise <contract-id> <choice> --args '{...}' --act-as P... --estimate [--target T]   # dry-run flag on submission itself
```

Estimation is native, not heuristic: the plugin submits the command to the JSON Ledger API's interactive-submission *prepare* endpoint (Canton 3.4+, present on the current network), which runs the Daml interpreter and returns an estimate of the transaction's synchronizer traffic cost (`cost_estimation.total_traffic_cost_estimation`, split into confirmation-request and confirmation-response components) **without committing anything to the ledger**. That traffic-cost estimate is converted to Canton Coin spend and USD using the network's extra-traffic price and the CC/USD rate from open mining rounds, both served by the public Scan API, and projected app rewards per transaction are computed from the traffic-based app reward parameters introduced by CIP-0104 (FeaturedAppRight activity weights, traffic price, round issuance) published by Scan, reported as a projection since per-round issuance depends on network-wide totals. Every estimate returns `--json` output so cost checks compose into CI gates (e.g., fail a pipeline if a workflow's traffic cost regresses). Against LocalNet, where traffic is free, the plugin reports the traffic-cost estimate and a configured-rate projection, so cost regressions are caught before TestNet. Cost estimation is an optional response field that a participant can disable, so the plugin handles its absence gracefully. Like the rest of the suite it is a thin layer: prepare endpoint, Scan rates, no new metering infrastructure.

#### 2.7 Sandbox snapshots

The suite provides named save and restore for a locally controlled DPM Sandbox so developers can return to a known baseline without repeating package upload, party allocation, and application setup.

| Command | Purpose |
|---|---|
| `dpm sandbox-snapshot status [--target T] [--json]` | Report whether the selected Sandbox supports snapshot save and restore. |
| `dpm sandbox-snapshot save <name> [--target T] [--json]` | Save the selected Sandbox as a named baseline. |
| `dpm sandbox-snapshot restore <name> [--target T] [--json]` | Restore the selected Sandbox from a named baseline. |
| `dpm sandbox-snapshot list [--json]` | List locally stored Sandbox snapshots. |
| `dpm sandbox-snapshot describe <name> [--json]` | Show a snapshot's manifest, contents, and compatibility metadata. |
| `dpm sandbox-snapshot delete <name>` | Delete a locally stored snapshot. |
| `dpm sandbox-snapshot conformance <name> [--target T] [--json]` | Compare the live package set, parties, and ACS fingerprint with the snapshot. |

Each named snapshot is stored under `.dpm/sandbox-snapshots/<name>/` and contains a versioned manifest, Sandbox identity and SDK/protocol metadata, package hashes and required DAR references, allocated-party metadata, and an ACS export. Restore quiesces the selected Sandbox, restores packages, parties, and active contracts through supported local participant repair or import mechanisms, then runs a conformance check over the package set, parties, and ACS fingerprint. If those capabilities are unavailable, `status` reports the target as unsupported and save or restore does not proceed.

The guarantee is an equivalent application-visible baseline, not identical contract IDs, update IDs, offsets, or timestamps. Snapshot operations are refused for LocalNet, DevNet, TestNet, MainNet, and any target not explicitly configured as a locally controlled Sandbox. This component does not start, stop, or manage LocalNet, Docker containers, volumes, synchronizers, or other network infrastructure.

### 3. Architectural Alignment

The tool is designed to align with Canton's architecture rather than impose patterns borrowed wholesale from account-based chains. Because Canton has no global readable state, all inspection commands are party-scoped and participant-scoped by construction, surfacing `--party`, `--participant`, and `--offset` as first-class flags and preserving Canton's need-to-know data model end to end. The ledger-facing components build on the JSON Ledger API and PQS where available; Sandbox restore uses only supported local participant repair or import capabilities. The suite introduces no new ledger functionality or Canton-internal changes. Its journal and `--follow` stream are designed as data sources for adjacent tooling. Nothing about DPM is forked.

### 4. Backward Compatibility

No backward compatibility impact. The tool is additive: it wraps existing Canton JSON Ledger API, PQS, and supported local participant repair or import capabilities, requires no changes to Canton core, Splice, or Daml, and extends DPM only through its official component interface. It introduces no new on-ledger logic. Existing DPM workflows and coverage reporting are unchanged.

---

## Impact

This proposal supplies a target-configured post-deployment layer for ledger interaction, run recording, and replay across LocalNet, DevNet, TestNet, and MainNet-connected participants, plus named baseline restore for locally controlled Sandbox targets.

The implementation provides native support for:

* Active Contract Set inspection and ledger queries
* Contract, transaction, update, and offset inspection
* Real-time ledger updates through `dpm query updates --follow`
* External-party identity, onboarding, and signing
* Choice validation and transaction submission
* A machine-readable run journal recording inputs, ledger events, visibility, and rejections
* Pre-flight traffic-cost, Canton Coin, USD, and app-reward estimates
* Named Sandbox save, restore, inspection, deletion, and conformance checks for repeatable local baselines
* Versioned OCI distribution for every component and command group

Developers can move from deployment into inspection, submission, estimation, recording, Sandbox restoration, and replay without an interactive REPL or hand-written API requests.

The suite builds on existing Canton JSON Ledger API, PQS, Scan API, and supported local Sandbox repair or import capabilities without changing Canton internals.

---

## Milestones and Deliverables

The work is delivered in two phases. A **six-month build phase**, staffed by four engineers, ships five DPM components across four milestones: ledger querying & submission, external-party wallet, fee & reward estimation, the run journal, and Sandbox snapshots. A **six-month maintenance and adoption phase** follows v1.0, funding compatibility releases, public support, and community onboarding, so the suite does not arrive as a fire-and-forget deliverable.

All components share a core library for target-provider adapters, JSON Ledger API access, authentication, output formatting, and suite-wide error presentation. The first target provider consumes named profiles from the Daml Deployment Toolkit. Each milestone ships as a tagged open-source release and versioned OCI artifacts installable through DPM, with published digests or checksums and documentation alongside the release.

**Milestone 1: Foundation, Deployment Toolkit adapter, querying & submission (Months 1-2)**
*Goal: from an application already deployed to LocalNet, DevNet, TestNet, or a MainNet-connected participant, provide the same scriptable inspection and submission surface through one-shot `--json` commands and named targets.*
- DPM component foundation, shared core library (JSON Ledger API client, auth handling, output formatting, suite-wide error presentation), CI, and OCI release process for every component and command group.
- Target-provider interface plus an adapter that imports LocalNet, DevNet, TestNet, and MainNet endpoint/auth/TLS profiles from `canton-deploy.config.js`; minimal JSON-API-only fallback for users of other deployment paths.
- `dpm query acs / contract / updates / tx / offset` with named-target, party, participant, and offset selection plus `--json`; PQS-backed historical queries where available; `dpm query updates --follow` live tail streaming line-delimited JSON.
- Schema utilities: `resolve`, `decode`, `hash fingerprint`.
- Transaction submission: `dpm exercise`, including `--validate-only` for schema validation without preparing, signing, or submitting a transaction.
- Documentation that begins from an already-deployed application and demonstrates switching the same commands among LocalNet, DevNet, TestNet, and MainNet deployment profiles without changing command logic.

**Milestone 2: External-party wallet flows (Month 3)**
*Goal: complete target-aware external-party workflows across supported LocalNet, DevNet, TestNet, and MainNet-connected participants, where the key is held outside the participant, without hand-written topology requests.*
- Identity helpers: `dpm wallet whoami`, `dpm wallet public-key`.
- External-party signing: `dpm wallet external import / allocate / sign`, wrapping signer configuration, the generate-topology → external-sign → allocate flow, and prepared-transaction signing.
- Worked example: selecting a named non-production target, allocating an external party, and exercising a choice on its behalf end to end; MainNet configuration and capability detection are documented without requiring an unsafe production mutation for acceptance.

**Milestone 3: Traffic fee & reward estimation (Month 4)**
*Goal: answer "what will this transaction cost, and what will it earn?" before submitting to the selected LocalNet, DevNet, TestNet, or MainNet-connected participant.*
- `dpm estimate choice / tx / rewards` and `dpm exercise --estimate`, built on the interactive-submission prepare endpoint plus Scan rates.
- Per-target capability detection, conversion of the traffic-cost estimate to Canton Coin and USD, and CIP-0104 app-reward projection where the selected environment exposes the required participant and Scan data.
- `--json` output with a worked cost-regression CI gate example.

**Milestone 4: Run journal, Sandbox snapshots, diagnostics interoperability & v1.0 (Months 5-6)**
*Goal: record every suite-driven run with linked replay evidence and provide named Sandbox baselines for repeatable local execution.*
- Run journal: automatic capture of suite-driven submissions (target/network identity, inputs, events, visibility, and rejections); `dpm runlog list / show / rerun`; published, versioned line-delimited JSON schema; successful entries carrying the update ID and rejected entries carrying the unmodified rejection payload for hand-off to compatible tracing and failure-classification tools.
- `dpm runlog rerun <run-id>`: reconstruction of supported exercise submissions, fresh command/submission identifiers where required, linked journal entries for each rerun, target-identity compatibility checks, and an explicit production-target safeguard; documentation states that identical outcomes are not guaranteed when ledger state has changed.
- `dpm sandbox-snapshot status / save / restore / list / describe / delete / conformance` for locally controlled Sandbox targets, with versioned manifests, equivalence reporting, and refusal of LocalNet and remote targets.
- Published schemas for journal entries and diagnostic hand-off payloads.
- Integration suite and v1.0 OCI release of all five components with immutable version tags and published digests or checksums.
- End-to-end tutorial: deploy with the Daml Deployment Toolkit → save a Sandbox baseline → query, submit, and estimate with this suite → inspect a recorded failure → restore the baseline and replay it from the journal.

**Milestone 5: Maintenance, compatibility & adoption (Months 7-12)**
*Goal: the suite stays current, supported, and growing for six months after v1.0, following the maintenance-milestone precedent set by other dev-fund proposals.*
- Compatibility releases for all five components tracking DPM and Canton SDK updates for the duration of the phase.
- Public issue triage and developer support with a committed first-response window of 5 business days.
- At least two point releases incorporating community-reported fixes and feature requests.
- Integration support for external teams adopting the components and consuming the published journal and diagnostic schemas.
- Two developer workshops with published materials, and a public adoption report at the end of the phase.

## Acceptance Criteria

Each milestone is verified by functional checks and ecosystem-value checks.

**Functional checks**

- **All milestones:** tagged open-source release; every delivered component and command group published as a versioned OCI artifact with an immutable version tag and verifiable digest or checksum; installable into a clean DPM project; all network-facing commands documented and compatibility-tested for LocalNet, DevNet, TestNet, and MainNet-connected participant targets; Sandbox snapshot commands tested against a locally controlled Sandbox; live demonstrations performed against Sandbox and DevNet plus authenticated TestNet/MainNet validation where reviewer access is available; documentation identifies any target capability that depends on an optional participant or ecosystem service.
- **M1:** a reviewer can import named LocalNet, DevNet, TestNet, and MainNet profiles from `canton-deploy.config.js` without copying endpoint/auth settings and select them with `--target`; starting from an application deployed through the Daml Deployment Toolkit, the reviewer can locate a contract, inspect its transaction, exercise a choice, and confirm the ACS change through one-shot `--json` commands on non-production targets; the exercise appears in the `--follow` live tail, limited to the configured party's visibility. A read-only query is validated against an authenticated MainNet-connected participant where access is available, and a deliberately failing command surfaces a decoded human-readable message and never a raw gRPC status.
- **M2:** external-party allocation is demonstrated on an authenticated non-production target with a key held outside the participant using only `dpm wallet external` commands; the same command resolves LocalNet, DevNet, TestNet, and MainNet profiles, reporting endpoint availability and authorization failures per target.
- **M3:** for each configured environment that exposes the required prepare and Scan capabilities, a reviewer receives the target-specific estimated traffic cost, CC/USD cost, and projected rewards before submission; `--json` drives a CI cost gate, and unsupported target capabilities produce a clear machine-readable result.
- **M4:** a deliberately failing exercise produces a schema-valid journal entry containing the selected target/network identity, submitted inputs, visibility, decoded message, and unmodified rejection payload consumable by compatible failure-classification tooling; a successful exercise records its update ID for compatible trace tooling. `dpm runlog rerun` reconstructs a supported exercise submission with fresh identifiers, creates a new entry linked to the original run, refuses an incompatible target, and requires the explicit production safeguard for a target marked as production. A reviewer saves a named Sandbox baseline, mutates its ledger state, restores the baseline, and receives a passing package, party, and ACS conformance report; the same restore command refuses LocalNet, DevNet, TestNet, and MainNet targets. The published journal and diagnostic hand-off schemas pass validation against the supplied examples.
- **M5:** compatibility releases published for DPM/SDK updates affecting the suite during the phase; a public triage log demonstrates the committed response window; two point releases and two workshops delivered with published materials; the end-of-phase adoption report is published.

**Ecosystem-value checks**

- **M1:** at least 2 developers outside Atheon have used the target adapter plus query/submission flow, with feedback tracked publicly.
- **M3:** at least 3 external developers or projects have used the query/submission commands or the live tail against their own applications, and at least 5 inbound issues or feature requests have been triaged publicly.
- **M4 (v1.0):** at least 3 independent external repositories use one or more components in their repositories or CI pipelines; at least 2 community developers have completed the integration tutorial, with completion feedback published.

If an ecosystem-value check is not met at review time despite functional completion, Atheon will provide outreach evidence and a concrete adoption plan for committee review.

## Funding Request and Milestone Breakdown

Total request: **2,539,167 CC, worth approximately 300,000 USD**, disbursed upon milestone acceptance.

| Milestone | Timeline | Scope | Amount |
|---|---|---|---|
| M1 - Foundation, adapter, querying & submission | Months 1-2 | Core library, OCI release pipeline, deployment-profile adapter, query surface, live tail, schema utilities, `dpm exercise`, error presentation | 634,792 CC (25.0%) |
| M2 - External-party wallet | Month 3 | Identity helpers and external import/allocate/sign | 317,396 CC (12.5%) |
| M3 - Fee & reward estimation | Month 4 | Pre-flight estimation, Scan conversion, CI cost gates | 317,396 CC (12.5%) |
| M4 - Run journal, Sandbox snapshots, diagnostics interoperability & v1.0 | Months 5-6 | Run journal and schemas, linked reruns, Sandbox save/restore and conformance, diagnostic hand-off payloads, integration suite, tutorial, v1.0 | 507,833 CC (20.0%) |
| M5 - Maintenance, compatibility & adoption | Months 7-12 | Compatibility releases, public triage and support, point releases, integration support, workshops, adoption report | 761,750 CC (30.0%) |

No upfront tranche is requested; payment is entirely milestone-gated. M5 is disbursed at the end of the maintenance phase against its acceptance criteria.

---

### Co-Marketing
Upon each milestone release, Atheon will collaborate with the Foundation on:

* Announcement coordination for each milestone.
* A technical blog or developer tutorial demonstrating the integrated workflow: deploy with the Daml Deployment Toolkit, save a Sandbox baseline, then query, submit, estimate, record, restore, and replay with this suite.
* Educational content and developer workshops introducing the components to the Canton developer community.
* Ecosystem promotion, including positioning the components within Canton developer channels and the relevant SIG, and proposing them as recommended developer tooling in community documentation.



---

## Motivation

This work is valuable because after deployment, developers still need scriptable queries, submission, run recording, cost estimation, and reproducible replay rather than a patchwork of REPLs and hand-written API calls. The Foundation's call for community-built DPM components names fee estimators, debugging, and observability as priority areas; this suite answers those priorities directly.

The output is a common good: open-source DPM components freely available to Canton application developers and CI/DevOps engineers. Adoption is measured by external repositories and CI pipelines using the query, journal, estimation, external-party, or Sandbox snapshot components, plus third-party contributions and issue activity.

## Rationale

A thin component suite over existing Canton interfaces is the right approach because it extends existing services rather than replacing them. The JSON API, PQS, local participant repair or import capabilities, and `dpm script --input-file` provide the underlying behavior; this proposal supplies ergonomic post-deployment commands. DPM components keep releases decoupled from the SDK while presenting a native command surface. A standalone CLI and a DPM-core patch were rejected because they would fragment the experience or couple delivery to SDK release cycles. For network profiles, the target-provider adapter reuses the Daml Deployment Toolkit's configuration rather than defining a second schema, and the `--follow` stream's stable JSON schema and the run journal's preserved raw payloads make the suite a natural data source for visual and diagnostic tooling built on top.

---

## About Atheon

Atheon is an R&D lab working at the frontier of AI, cryptography, and zero-knowledge systems, building production-grade cryptographic infrastructure and developer tooling. We have contributed to and collaborated with leading organizations in applied cryptography and protocol engineering, including World, a16z, zkEmail, and the Ethereum Foundation. Our background spans zero-knowledge proving pipelines, zkVM research, blockchain indexing infrastructure, and protocol-level engineering and direct, hands-on experience with the mature smart-contract toolchains (Foundry and equivalents) whose developer ergonomics this proposal brings to Canton's privacy-first architecture.

**Website:** [atheon.xyz](https://atheon.xyz/)
**X (Twitter):** [@atheonxyz](https://x.com/atheonxyz)
