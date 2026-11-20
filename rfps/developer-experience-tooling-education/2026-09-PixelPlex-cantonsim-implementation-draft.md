# cantonsim: implementation draft

Transaction simulation and pre-flight for Canton. Companion to the Development Fund proposal. PixelPlex, 2026-09-23.

Canton facts in this draft were read against Canton 3.5.11 sources and the 3.5 interactive submission proto; the 3.4 line was read for comparison where feature availability differs. Claims are pinned to the releases named beside them.

## 1. Goal and non-goals

Goal. Given a command, answer before submission: what will it do, who will receive which part of it, what will it cost, and if it cannot proceed, why and how to fix it.

**Three results, kept apart.** A local tool cannot promise a future distributed outcome, and the proposal does not claim one. cantonsim produces three distinct things, and every report says which one it is:

| Result | What it establishes |
| --- | --- |
| **Transaction preview** | What this prepared transaction describes: actions, input contracts, expected effects, required signing authority |
| **Pre-flight assessment** | Which prerequisites are satisfied, violated, or unobservable, at a stated observation time |
| **Scenario sandbox** | What happens under a specified local state and an explicit set of assumptions |

The user-facing verdict is never "will succeed". It is computed by the fixed rule in §6.6 — `blocked`, `indeterminate` or `passed_required_checks` — and never chosen by hand. Every check that could not be completed is listed in the report with the reason. A check whose answer would change with topology, contention or timing carries the observation time it was taken at.

Non-goals. Committing anything. Re-implementing the Daml interpreter or a second authorization engine. Visualizing committed history (dpm trace, Daml Shell). Indexing (PQS, Canton Index). Cross-synchronizer simulation (later proposal).

## 2. Users and their questions

| User | Question | Surface |
| --- | --- | --- |
| Daml developer | Why does my submission fail, and what will it do when it works | `dpm sim run`, local web UI |
| App operator, Featured App | Will this settlement go through, is every counterparty's participant ready, what will it cost | `dpm sim check`, CI mode |
| Wallet | Show the signer what they are about to sign, who receives it, what it costs — bound to the exact transaction being signed | `@cantonsim/core` preview |
| Validator operator supporting hosted parties | Why did a hosted party's command get rejected | `dpm sim explain <completion>` |
| Integrator, institutional | Rehearse a settlement flow against real state without touching production | `dpm sim sandbox` |

## 3. What Canton gives us and what it does not

`InteractiveSubmissionService.PrepareSubmission` (Ledger API v2, Canton 3.3 and later, gRPC and JSON Ledger API):

- Runs Daml interpretation on the participant against the current active contract set. Does not commit.
- Input: `user_id`, `command_id`, `commands` (exactly one command per transaction, see the shape constraint below), `act_as`, `read_as`, `disclosed_contracts`, `synchronizer_id`, `min_ledger_time` (a `MinLedgerTime` oneof, absolute or relative), `max_record_time`, `package_id_selection_preference`, `prefetch_contract_keys`, `verbose_hashing`, and `estimate_traffic_cost`. The last is **not a boolean**: it is an `optional CostEstimationHints` message (field 16) carrying `disabled` and `expected_signatures`. Estimation runs unless `disabled` is set, and supplying the expected signature algorithms materially improves accuracy, since the estimate otherwise assumes threshold-many signatures. The field and the `cost_estimation` response exist from Canton 3.5; neither is present in the 3.4 proto.
- Output: `prepared_transaction` with `DamlTransaction` (version, root node ids, flattened Create, Exercise, Fetch, Rollback nodes, node seeds) and `Metadata` (submitter info, synchronizer id, mediator group, transaction uuid, preparation time, input contracts, global key mapping), `prepared_transaction_hash`, `hashing_scheme_version`, `cost_estimation` (`estimation_timestamp`, `confirmation_request_traffic_cost_estimation`, `confirmation_response_traffic_cost_estimation`, `total_traffic_cost_estimation`; the API exposes no variance field — the ~10% spread is our own measurement — and reassignment cost is explicitly excluded; absent before 3.5), optional `hashing_details`.
- **Runs synchronizer routing as part of preparation.** `commandExecutor.execute(..., routingSynchronizerState, forExternallySigned = true)` calls `SyncService.selectRoutingSynchronizer`, which reaches `UsableSynchronizers.check`. That check already performs, against the shared topology snapshot and the prepared ledger time: package vetting for every party on every participant hosting it, an active-participant check for every party, a confirming-participant check for every confirmer, protocol-version compatibility, and hashing-scheme compatibility. So counterparty vetting and hosting are **not** post-submission surprises — they make prepare itself fail. See §3.1.
- Fails at prepare on: interpretation errors, contract lookup failures, argument validation, package resolution, and the routing checks above (as `NO_SYNCHRONIZER_FOR_SUBMISSION`, whose cause is a single string listing each discarded synchronizer and its reason).
- Does not check: external signatures and the `act_as` claims presented at execute, contention at sequencing, the mediator verdict, ledger and record time bounds at execute, and the number of root nodes the command produced.
- Does not expose: the view and informee structure. That is derived by Canton during submission.
- **Time bounds, computed rather than asserted.** Two different dynamic synchronizer parameters govern two different windows, and a single "about a minute" figure conflates them. `ledgerTimeRecordTimeTolerance` bounds how far the record time may sit from the ledger effective time and so constrains transactions with a ledger-time dependency; `preparationTimeRecordTimeTolerance` bounds how long a prepared transaction stays submittable, and on Canton Network it is set to **24 hours** with a 48-hour mediator deduplication timeout (`splice/bootstrap-canton.sc:68`). cantonsim therefore computes the window from the prepared metadata — `preparation_time`, `min_ledger_effective_time`, `max_ledger_effective_time`, `max_record_time` — and the synchronizer's current dynamic parameters, and reports the resulting interval with the values it used. It does not quote a constant.
- **Command and root-node shape.** The limit is enforced in two different units, and the difference matters. `PrepareSubmission` rejects a request with **more than one command** (`config.enforceSingleRootNode && cmds.length > 1`). `ExecuteSubmission` rejects a prepared transaction with **more than one root node** (`transaction.roots.sizeIs == 1`). The Canton config comment states both halves: *"Reject early requests with multiple commands (prepare) or multiple root nodes (execute). Such transactions are not supported and would be rejected anyway during confirmation."* Both were turned into early rejections in Canton 3.4.9 (`ledger-api.interactive-submission-service.enforce-single-root-node`, on by default); before that they failed later in transaction processing. Two consequences:
  - A single command is not necessarily a single root node. `CreateAndExerciseCommand` produces **two** root nodes, a Create followed by an Exercise. It therefore passes prepare and is rejected at execute. **Scope of this claim:** it is version-pinned, not universal. It holds for the releases we have read and test against — 3.4.9 through 3.5.11, where `enforce-single-root-node` exists and defaults to on — and the config comment indicates such transactions would be refused at confirmation regardless. The claim is asserted by a behavioural pin in CI (§9) so that an upstream change breaks the test rather than the product, and we do not assert it for releases we have not tested.
  - The restriction is specific to interactive submission. The ordinary Command Service still accepts several commands in one transaction; verified experimentally on Canton 3.5.6, where two `CreateCommand`s in one ordinary submission produced one transaction with two events.
- One command is still not a small transaction: a single exercise can unfold into a tree of any size.

### 3.1 What prepare already checks, and what cantonsim adds

This is the table a reviewer needs in order to see the incremental value. It is version-specific and is regenerated per pinned Canton release in CI.

| Check | prepare today | cantonsim adds | can change between check and execute |
| --- | --- | --- | --- |
| Daml interpretation, argument validation | yes, hard failure | decodes the error into cause, subject and fix; structured `DAML_FAILURE` payload surfaced | input contracts may be archived |
| Input contract lookup and visibility | yes, for the caller's parties plus `disclosed_contracts` | says which party needs `read_as`, or which disclosure is missing | archival, disclosure expiry |
| Party hosting on the target synchronizer | yes, via routing (`checkConnectedParties`, `checkConfirmingParties`) — hard failure | names the party, the participants and their permissions; reports as a warning where the caller wants to proceed anyway | topology change |
| Package vetting on every hosting participant | yes, via routing (`checkPackagesVetted`), per party, at the prepared ledger time; package **dependencies** are included only when the synchronizer's protocol version is ≤ 34. The rejection reason already names the participant and the package (`PackageUnknownTo`: "Participant P has not vetted Q") but not the requiring party or the node | turns the free-text `NO_SYNCHRONIZER_FOR_SUBMISSION` cause into structured findings, adds the requiring party by re-deriving `partyPackages`, and adds the node where a transaction tree exists; evaluates a **future** ledger time; flags vetting windows about to close | vetting revoked or newly added |
| Protocol version and hashing scheme compatibility | yes, via routing | states which synchronizer was discarded and why | — |
| Root-node count accepted by execute | **no** — prepare counts commands, not roots | computes root count from the prepared transaction and fails before the signing round trip (catches `CreateAndExercise`) | — |
| View and informee decomposition | no, computed at submission | computes it from the prepared nodes plus topology, or abstains (§6.4 A2) | topology change |
| Required signing authority for external parties | no | lists the parties whose signatures execute will require, and the threshold per party | keys rotated |
| Caller's API rights (`act_as`, `read_as`) | checked for the caller's token at prepare; re-checked at execute | compares required authority with the rights the caller actually holds, separately from Daml authorization | rights revoked |
| Contention at sequencing | no | historical indicator from the caller's own update stream, labelled as such | any competing submission |
| Traffic balance versus cost | cost estimate only, and only from 3.5 | timestamped comparison with the participant's traffic state, with headroom and uncertainty; `not_applicable` on 3.3 and 3.4, where the API does not exist | traffic consumed or purchased |
| Maximum request size | no | like-for-like comparison against the synchronizer parameter | — |
| Ledger and record time bounds at execute | sets them | shows the window and warns when an external signing path is unlikely to fit | the clock |
| Mediator verdict, confirmation responses | no | **not established** — reported as such | — |

Rows in the last column are exactly what stops any local tool from saying "will succeed".

## 4. Architecture

```
                 ┌────────────────────────────────────────────────┐
  command ──────▶│  input adapters                                 │
  or prepared tx │  ledger-api json · dapp-sdk request · prepared  │
   (dApp SDK)    └───────────────┬────────────────────────────────┘
                                 ▼
                 ┌────────────────────────────────────────────────┐
                 │  prepare client        PrepareSubmission        │──▶ participant (caller's)
                 │  or prepared-transaction loader (hash-bound)    │
                 └───────────────┬────────────────────────────────┘
                                 ▼
                 ┌────────────────────────────────────────────────┐
                 │  transaction model      nodes · inputs · seeds  │
                 └───────────────┬────────────────────────────────┘
                                 ▼
  ┌──────────────┬───────────────┼───────────────┬──────────────┐
  ▼              ▼               ▼               ▼              ▼
 authority    views &        hosting &       contention &    cost &
 & signing    recipients     vetting         ledger time     limits
  │              │               │               │              │
  │ prepared tx  │   topology reads (Admin API)  │  ACS/updates │ traffic state
  └──────────────┴───────────────┴───────────────┴──────────────┘
                                 ▼
                 ┌────────────────────────────────────────────────┐
                 │  explain layer     error registry → cause → fix │
                 └───────────────┬────────────────────────────────┘
                                 ▼
                 ┌────────────────────────────────────────────────┐
                 │  report   json · human · trace · junit          │
                 │  + provenance and completed/incomplete checks   │
                 └────────────────────────────────────────────────┘

  sandbox mode:  ACS export ──▶ ephemeral local Canton ──▶ sequences, time travel, diff
```

Components, one TypeScript monorepo:

| Package | Role |
| --- | --- |
| `@cantonsim/core` | prepare client, prepared-transaction loader, transaction model, analyses, explain, report. No CLI or UI dependencies. Embeddable in wallets and dApps. |
| `@cantonsim/topology` | Admin API reads, cached with an observation timestamp: party-to-participant, participant permissions, vetted packages, package dependencies, synchronizer parameters. |
| `@cantonsim/sandbox` | snapshot export, completeness check, ephemeral Canton lifecycle, id mapping, replay, diff. |
| `@cantonsim/cli` | `dpm sim` component. Packaged per DPM component conventions (manifest, OCI). |
| `@cantonsim/ui` | local web UI, renders the report and the recipient projection. Reuses dpm trace's tree rendering where practical. |
| `@cantonsim/ci` | assertions, JUnit output, GitHub Action. |

## 5. Data sources and privacy

RFP 20 asks every proposal to state which data it needs, where it comes from, and how it survives if involved-party metadata stops being public.

| Data | Source | Class | Needed for |
| --- | --- | --- | --- |
| Prepared transaction, input contracts, cost estimate | Ledger API v2 prepare, caller's participant, caller's `act_as` and `read_as` | node-local | everything |
| Active contracts, recent updates and completions for the caller's parties | Ledger API v2 state and update services | node-local | contention, staleness, explain from completions |
| Party to participant mappings, participant permissions | synchronizer topology via Admin API of the caller's participant | shared topology, visible to every participant by design | hosting check, recipient projection, view decomposition |
| Vetted packages per participant, with validity windows | synchronizer topology | shared topology | vetting check |
| Package dependency graph | caller's participant package service, or DARs available to it | node-local | vetting check on synchronizers with protocol version ≤ 34, where Canton checks dependencies too |
| Synchronizer parameters, size limits | synchronizer topology and parameters | shared | limits check |
| Traffic state of the caller's participant | validator or Admin API traffic status | node-local | cost versus balance |
| Package types and templates | DARs available on the caller's participant | node-local | sandbox mode: recomputing the contract hash, since `TypedNormalForm` normalises values against the template type |

Authorization reporting and recipient projection need no DAR: the prepared transaction already carries per-node `signatories`, `stakeholders`, `acting_parties` and `choice_observers`, and the participant enriches it with type info and field names before returning it. Topology is still required to turn parties into participants.

Nothing comes from the mediator, from other participants' ledgers, or from public scan data. If involved-party metadata disappears from public view, cantonsim is unaffected. Hosted mode (CC View) runs with the user's own token and does not persist payloads unless the user saves a report.

**Provenance.** Reads are not one atomic snapshot. Every report records the ledger offset it read the ACS at, the topology observation time, the effective package versions, and a timestamp per check. Two checks in one report may disagree because they were taken microseconds apart; the report makes that visible rather than hiding it.

## 6. Pipeline in detail

### 6.1 Input adapters
- Ledger API JSON command file, identical to what the JSON Ledger API accepts. This is the lowest common denominator and what dpm trace uses.
- dApp SDK request object (CIP-0103 shape), so a wallet can pass exactly what it received.
- **An already prepared transaction.** Required for signing safety: the wallet passes the `PrepareSubmissionResponse` it is about to have signed, and cantonsim analyses that exact object rather than preparing its own. See §8.
- Daml Script command extraction, later, for teams that keep scenarios as scripts.

### 6.2 Prepare
- Call prepare with the caller's parties and `verbose_hashing` off. Cost estimation is left enabled by passing a `CostEstimationHints` message with `disabled` unset and `expected_signatures` populated from the signing algorithms of the external parties involved; it is not a boolean flag, and on releases before 3.5 the field does not exist and A7 reports `not_applicable`. Or skip this step entirely when the input is already a prepared transaction.
- Record round-trip time, preparation time, the synchronizer chosen, and the ledger offset current at that moment.
- If prepare fails, go straight to the explain layer with the gRPC status and error metadata. A `NO_SYNCHRONIZER_FOR_SUBMISSION` cause is parsed per discarded synchronizer and enriched locally (§6.4 A3, A4) so the user gets structured party, package and participant fields rather than one long string. Node attribution is **not** available on this path: a failed preparation returns no transaction tree, so the node dimension is reported `unknown` rather than guessed. Still run the checks that do not need a transaction (hosting of `act_as` parties, traffic balance).

### 6.3 Transaction model
Normalize the flattened `DamlTransaction` into a tree: node id, kind, template or interface id, package id, contract id (existing or fresh), acting parties, signatories, observers, choice, consuming flag, children, and for Fetch and Exercise the referenced input contract. Keep node seeds, root node ids and the prepared-transaction hash with its hashing scheme version. Keep input contract metadata (creation time, stakeholders as known to the caller).

### 6.4 Analyses

Each analysis returns findings: `{ id, severity: error|warn|info, status: pass|fail|unknown|not_applicable, subject, message, fix, evidence, confidence, observed_at }`.

`unknown` is a first-class result. An analysis that cannot be completed for this transaction shape says so and is listed in the report's incomplete-checks block; it never degrades into a silent pass.

**A1 Authority and signing.** Three separate questions, reported separately, because conflating them produces confident wrong answers:

1. *Daml authorization.* The participant's interpreter has already decided this — a transaction came back, so it is authorized under Daml's rules. **This conclusion is conditional on provenance.** It holds on the `preview(command)` path, where cantonsim itself called prepare on a participant the caller trusts and observed it succeed. On the `previewPrepared` path the prepared object is supplied by the caller: a hash that matches its contents establishes integrity of what is displayed, not that the object was produced by a successful preparation on a trusted participant. In that case the finding is reported as conditional, naming the assumption, and the report records whether preparation was observed by cantonsim or asserted by the caller. cantonsim **explains** that result per node (which parties authorize each Create and Exercise, where authority was delegated) and, when prepare failed with a Daml authorization error, decodes which node lacked which authorizer. It does not run a second authorization engine, and it does not take the union of authorizing parties across the transaction: authority is scoped, and a union ignores that scope.
2. *Required signing authority.* For external parties, list the parties whose signatures `ExecuteSubmission` will require and the threshold per party, from the prepared transaction and the party's topology state. Signatures that do not exist yet cannot be validated; the report says "required", not "valid".
3. *Caller's API rights.* Compare the `act_as` and `read_as` the transaction needs with the rights the caller's token actually carries. Never suggest "add party X to `act_as`" as a generic fix — the caller may have no authority to act for X. The fix text names who would have to grant it.

Confidence high for 1 and 3, high for 2 as a requirement statement.

**A2 View decomposition and recipients.** Two distinct questions are answered and labelled separately: which **participants** receive and can decrypt which part of the transaction, and which **parties** are entitled to observe it. A third, what an authenticated Ledger API user can subsequently retrieve, is out of scope and stated as such.

The decomposition rule follows Canton's implementation, which keys on **hosting participants, not on informees**: a child node starts a new view when the set of participants hosting its informees is **not a subset** of the current view's participant set (`TransactionViewDecompositionFactory.buildChildView` → `needNewView(node, currentParticipants) = !node.participants.subsetOf(currentParticipants)`). A change of informees alone does not start a new view unless it brings in a new participant. The same function aggregates confirmation quorums per view and carries a rollback context, both of which the projection reproduces.

Inputs: the prepared transaction (per-node signatories, stakeholders, acting parties, choice observers) plus `activeParticipantsOfParties` from topology — the same topology read A3 already performs. The projection is ours to compute in TypeScript, and its size should not be understated: the recursion in `TransactionViewDecompositionFactory.Builder` is compact, but a faithful reproduction also needs the informee and confirming-party semantics per node kind (`signatoriesOrMaintainers`, `actingParties`, `informeesOfNode`), quorum construction and aggregation across child views, rollback-context entry and exit, and the rule that a submitting admin party is added as an extra confirming party on root nodes only. It is one well-scoped function reproduced faithfully and validated against an oracle, not a line-count triviality and not a port of the platform. Release-specific behaviour is pinned in CI.

Supported shapes are declared explicitly. Where a shape is not yet supported — deep rollback nesting, multi-hosted parties with mixed permissions, disclosure-driven inputs, package upgrade across a view boundary — the analysis returns `unknown` with **"visibility analysis incomplete"** and names the node that could not be classified. Silence is never interpreted as "nobody else sees this".

**Minimum coverage.** A declared set of shapes must produce complete analysis rather than abstention: the Token Standard transfer, allocation and settlement flows, plus multi-party exercise, nested exercise, explicit disclosure and multi-hosted party. Abstention outside that set is acceptable; abstention inside it is a defect, and overall abstention is capped in §9 so that declining to answer cannot satisfy an accuracy target.

Acceptance is defined in §9. It is a test standard, not a claim of correctness for every future transaction.

**A3 Hosting.** For each informee, list participants with hosting rights on the target synchronizer and their permission (submission, confirmation, observation), at a recorded topology observation time. Prepare already fails hard when a party has no active participant or a confirmer has no confirming participant; cantonsim's contribution is naming the party and participant instead of a discarded-synchronizer string, reporting it before the signing round trip, and evaluating the same question for a future ledger time or for a party that is not yet in the transaction. Confidence high for the topology facts. Whether a hosting participant is actually reachable and responsive is **not established**.

**A4 Counterparty package vetting.** Reproduces Canton's own check rather than a stricter one. Canton computes required packages **per party** (`Blinding.partyPackages`: for each node, the parties that witness it, mapped to that node's template and interface package ids), resolves each party to its hosting participants, unions the requirements per participant, and checks them at the ledger time — including package **dependencies** when the synchronizer's protocol version is ≤ 34. Checking every package of the transaction against every participant would over-check and produce false failures for participants that never see the node in question, so cantonsim does not do that.

cantonsim's contribution, stated against what Canton already emits. The rejection reasons are not identifier-free: `MissingActiveParticipant` renders the party set, and `PackageUnknownTo` renders as "Participant P has not vetted Q". They are, however, unstructured free text, inconsistent between reasons, concatenated per discarded synchronizer, unlinked to the transaction node, and silent about which party's witnessing required the package. So cantonsim extracts the identifiers that are present, enriches them from topology and the package dependency graph, re-derives the requiring party from `partyPackages`, and attributes the node **only where a transaction tree exists**. Each dimension — party, package, participant, node — is a separate field that may be `unknown` or `not_applicable`; no rejection is expected to yield all four. Beyond attribution: evaluate the check at a ledger time other than now; warn on vetting windows that expire inside the expected signing window; and answer the question for a synchronizer the caller is not currently submitting to. Confidence high. Data: topology plus the participant's package dependency graph.

**A5 Input contract status.** For every input contract: report whether it is active in the caller's ACS at the recorded offset. A contract that is absent is reported as **"not visible / not established"**, not "inactive" — an explicitly disclosed contract is usable without ever appearing in the caller's ACS. Separately, count recent exercises or archives touching it in the last N minutes of the caller's update stream, and present that as a **historical contention indicator**: it cannot reveal competing submissions that are pending right now. Confidence medium, and the report says why.

**A6 Ledger time.** Use the prepared metadata and the synchronizer's dynamic parameters. The metadata fields are `preparation_time` (6), `min_ledger_effective_time` (9), `max_ledger_effective_time` (10) and `max_record_time` (11) — note that `min_ledger_time` is the name of the *request* field, a `MinLedgerTime` oneof, and not a metadata field. The window is computed from those values together with `ledgerTimeRecordTimeTolerance` and `preparationTimeRecordTimeTolerance` as currently configured on the target synchronizer, and the report prints the parameter values it used. Report the submission window and the record time bound, and warn when an external signing flow is unlikely to complete inside it. A `getTime` call is not an ordinary transaction node and a minimum requested time alone does not prove semantic time dependence; the report states which signal it used. Confidence high for the window, medium for the time-dependence classification.

**A7 Cost and traffic.** Available from Canton 3.5 only; on 3.3 and 3.4 the request field and the response message do not exist and this analysis returns `not_applicable` with that reason, rather than estimating. Where available, surface `cost_estimation` with its breakdown (`confirmation_request_traffic_cost_estimation`, `confirmation_response_traffic_cost_estimation`, `total_traffic_cost_estimation`, `estimation_timestamp`), our measured spread of about 10%, and the note that reassignment cost is not included. Accuracy depends on the `expected_signatures` hint: without it the estimate assumes threshold-many signatures, and the report says which was used. Read the participant's traffic state and present **timestamped headroom with its uncertainty** — an estimate above the current balance is not a guaranteed future rejection, because balance moves. Three quantities are kept apart and never summed into one number:

1. the network resource cost of the confirmation request and responses, in bytes;
2. the additional traffic the participant would have to purchase to cover it;
3. the fee a wallet chooses to show its user.

On Canton Network, convert bytes to CC from `AmuletRules.SynchronizerFeesConfig.extraTrafficPrice` ($/MB) and the amulet price of the open mining round; both are governance-controlled, so the report records the values and the round it used rather than a bare number. Confidence high for the estimate, medium for the conversion.

**A8 Size and limits.** Compare like with like. The prepared transaction's JSON size is not the serialized, encrypted sequencer request size; the comparison against the synchronizer's maximum request size is made on the closest available representation and the report states which representation was measured and the residual uncertainty. Confidence medium.

**A9 Package preference.** Report which package versions were selected for each package name and whether a newer vetted version exists on the caller's participant, to catch upgrade drift. Confidence high.

**A10 Execute compatibility.** Checks that the prepared transaction is one `ExecuteSubmission` will accept at all, before any signing happens. Today that means the root-node count: more than one root is rejected at execute even though prepare accepted the request, which is exactly what `CreateAndExerciseCommand` produces. Fails with the rule, the observed root count, and a remediation that is ordered by safety rather than convenience:

1. **Where the application allows it, use an existing choice on an existing contract that performs both operations inside one root exercise.** This preserves atomicity and is the only rewrite that is equivalent.
2. **Otherwise, splitting into a separate create and a separate exercise is an application-specific redesign, not an equivalent fix, and cantonsim says so.** Two transactions are not one: if the exercise fails or is never submitted, the created contract remains committed, and its stakeholders see a standalone contract that the atomic version would never have exposed. The finding states both consequences and leaves the decision to the developer.

The unsupported prepared shape is described per tested release rather than universally. Confidence high. We are not aware of an equivalent check in the tooling we surveyed as of 2026-09.

### 6.5 Explain layer
An error registry maps Canton and Daml error ids to a cause, the subject (party, contract, package, participant), and a fix. Indicative entries, final ids taken from the Canton error code registry at implementation time:

| Error family | Cause shown | Fix shown |
| --- | --- | --- |
| Contract not found or not active | input contract archived, or never visible to `read_as`, or expected via disclosure and not disclosed | who archived it, which party needs `read_as`, or the missing `disclosed_contracts` entry |
| Daml authorization error | missing authorizer on node N, with the scope in which authority was available | which authority is missing and who can grant it |
| Daml interpretation error, `DAML_FAILURE` | template, choice, and the structured `failWithStatus` payload | source location when debug metadata exists |
| `NO_SYNCHRONIZER_FOR_SUBMISSION` — unvetted package | participant P and package Q taken from the reason Canton already emits; party Y re-derived from `partyPackages`; node N only when a transaction tree exists, otherwise `unknown` | vetting command, or package preference change |
| `NO_SYNCHRONIZER_FOR_SUBMISSION` — missing active participant | informee X has no active participant on synchronizer S | onboarding or synchronizer selection |
| `INVALID_PRESCRIBED_SYNCHRONIZER_ID` | the prescribed synchronizer failed one of the routing checks | the specific failed check, same decoding |
| Multiple root nodes at execute | the command produced N root nodes; interactive submission accepts one on the tested releases | prefer a single choice that performs both operations in one root exercise; splitting into create-then-exercise is a redesign that loses atomicity, and the finding states that |
| Locked or inactive contracts at local verdict | contention on contract C | retry policy, or sequence the commands in sandbox mode |
| Mediator timeout, missing confirmations | confirmer Y's participant did not respond | hosting and vetting evidence for Y |
| Ledger or record time out of bounds | prepared ledger time expired | re-prepare, shorten signing path |
| Traffic limit | estimated cost above balance at the recorded observation time | top up, or reduce the transaction |

`dpm sim explain <completion.json | command-id>` runs the explain layer on an actual failed completion so operators get the same reading after the fact.

### 6.6 Report
One JSON document, versioned schema.

**Verdict aggregation, deterministic.** The verdict is computed, never chosen, by this rule in this order:

1. any finding with `status: fail` and `severity: error` → **`blocked`**;
2. otherwise, any check the caller declared **required** with `status: unknown` → **`indeterminate`**;
3. otherwise, every required check completed successfully → **`passed_required_checks`**;
4. incomplete **optional** checks never change the verdict; they are listed separately in `optional_incomplete`, and the display policy for them is the caller's.

The required set is declared by the caller — a wallet policy or a CI configuration — and always includes complete recipient analysis for wallet pre-sign use. Every surface agrees with the rule and with each other: JSON `verdict.status`, the CLI summary line, the UI banner, the JUnit result, and the exit code (0 `passed_required_checks`, 1 `blocked`, 3 `indeterminate`, 2 tool error). `checks_completed`, `checks_incomplete` and `views.status` are **derived from `findings`**, never written independently — an `unknown` from A2 sets `views.status` to `incomplete` by construction, so the two cannot disagree.

```json
{
  "schema": "cantonsim/report/1",
  "result_kind": "preflight_assessment",
  "verdict": {
    "status": "blocked",
    "rule": "cantonsim/verdict/1",
    "required_checks": ["A2", "A3", "A4", "A10"],
    "blocking": ["A4"],
    "checks_completed": 9,
    "checks_incomplete": 1,
    "optional_incomplete": [],
    "required_incomplete": ["A2"]
  },
  "provenance": {
    "ledger_offset": 918273,
    "topology_observed_at": "2026-09-21T09:14:02.117Z",
    "package_versions": { "splice-amulet": "0.1.9" },
    "synchronizer": "...",
    "checked_at": { "A3": "2026-09-21T09:14:02.140Z", "A4": "2026-09-21T09:14:02.190Z" }
  },
  "input": { "adapter": "prepared-transaction", "command_id": "...", "act_as": ["..."] },
  "prepare": { "ok": true, "ms": 143, "ledger_time": "...", "hash": "...", "hashing_scheme_version": "V2" },
  "transaction": { "roots": ["n0"], "root_count": 1, "nodes": [ { "id": "n0", "kind": "exercise", "template": "...", "package": "...", "contract": "...", "actors": ["..."], "consuming": true, "children": ["n1", "n2"] } ] },
  "views": { "status": "incomplete", "incomplete_reason": "A2 returned unknown for node n4", "views": [ { "id": "v0", "nodes": ["n0"], "informees": ["..."], "confirmers": ["..."], "quorum_threshold": 2, "participants": ["PAR::..."] } ] },
  "signing": { "required_parties": ["..."], "threshold": { "alice::122...": 2 }, "signatures_present": false },
  "findings": [
    { "id": "A4", "status": "fail", "severity": "error", "subject": { "participant": "PAR::x", "package": "abc...", "party": "bob::122...", "node": "n2" }, "attribution": { "participant": "from_error", "package": "from_error", "party": "derived", "node": "derived" }, "message": "...", "fix": "...", "confidence": "high", "observed_at": "..." },
    { "id": "A2", "status": "unknown", "severity": "warn", "message": "visibility analysis incomplete: node n4 is inside a nested rollback", "confidence": "n/a" }
  ],
  "cost": { "available": true, "min_canton_version": "3.5", "signature_hint_used": true, "estimate_bytes": 18440, "measured_spread": 0.1, "cc_estimate": "0.0184", "cc_price_round": 42, "traffic_available_bytes": 4200000, "traffic_observed_at": "..." },
  "binding": { "hash_covers": "transaction content as displayed", "hash_does_not_cover": ["topology", "hosting", "vetting", "traffic balance", "api permissions"], "prepare_provenance": "observed_by_cantonsim", "observations_refreshed_at": "..." },
  "sandbox": null
}
```

Renderings: human (CLI), dpm trace prepared-transaction export, JUnit XML for CI, and the local web UI. All of them render the verdict produced by the rule above and agree on it by construction, because each is a projection of the same computed object rather than an independent summary. Incomplete checks are visible in every rendering, not only in the JSON, and a required check that came back `unknown` fails its CI assertion rather than passing quietly.

## 7. Scenario sandbox

Purpose: sequences of transactions, time travel, hypothetical state. The name is deliberate — the result is what happens **under stated assumptions on a local copy**, not evidence about the network.

Flow:
1. Export the caller's active contracts for the parties involved, plus the packages, from the caller's participant.
2. **Snapshot completeness check**, before anything is started. **The default is to refuse**, with a list, when: an input contract is referenced by another contract or by a key but is not in the export; a required contract is not in the caller's party-visible state at all; inputs arrive by explicit disclosure rather than from the ACS; a package, a dependency or a contract-id version in the snapshot is unsupported by the target build. A partial run is available only when the caller passes `--allow-partial`, is recorded in the report as `completeness: partial` with the dropped set enumerated, and **never satisfies a complete-scenario assertion** in CI.

   **Completeness is defined relative to a declared scope**, not as a universal guarantee: a supported application adapter, the declared scenario inputs, the reference rules known to that adapter, and the external dependencies named in the scenario. Within that scope the check is exhaustive. Outside it there is no claim — a generic checker cannot discover every reference a party id might have inside free text, a hash or an external signature, and the tool does not pretend otherwise. What it does guarantee is that unhandled reference classes are named in the report rather than passed over.
3. Start an ephemeral local Canton: one participant, one synchronizer, same protocol version, packages uploaded and vetted.
4. Allocate local parties for every party in the snapshot. Party ids carry the original participant's namespace, so local parties get new ids. cantonsim keeps a bidirectional mapping and rewrites the snapshot on import. Contract ids are recomputed by cantonsim and mapped too. Canton removed automatic contract-id recomputation on ACS import in 3.5.1, so the tool computes the unicum itself and imports with `ContractImportMode.Validation`, which makes Canton verify the result. This is established on a working proof of concept, whose recipe and verbatim self-check output are reproduced in Appendix A so a reader can judge the method without running it: the self-check reproduces an existing contract id byte for byte, the party swap produces a new valid id, and `import_acs` accepts it under `Validation`. The full script and run output are available to the Committee on request and are published as part of the Milestone 1 evidence package.

   **What this establishes and what it does not.** It establishes that contract-id recomputation is correct and that Canton itself validates the rebuilt contract on import. It does **not** establish behavioural equivalence after remapping, which is a separate and weaker claim: a remapped snapshot can be valid and still behave differently, because party ids embedded in free text, keys, hashes or external signatures do not survive a typed rewrite. The two are reported as separate findings and never merged.

5. Run the scenario: a list of commands, optional time advances, optional mutations (archive, replace, inject a contract).
6. Diff: created, archived, unchanged, per party. Report per step with the same findings model, `result_kind: "scenario_sandbox"`, and the assumption list as part of the report.

**Assumptions, carried in every sandbox report, not only in the UI:**
- Party ids and contract ids differ from production; the mapping is attached.
- Acting locally as a remapped counterparty asserts that the counterparty *would* act. It is a scenario assumption, never evidence that they will.
- One participant collapses distributed permissions, availability and confirmation behaviour. There is no real mediator behaviour beyond the local one.
- Applications that embed party ids or contract ids in text fields, hashes or external signatures will not behave identically after remapping. These templates are listed in the completeness check.
- Off-ledger services, oracle inputs and automation are absent unless the scenario stubs them explicitly.

Initial scope is a declared set of contract types and applications — the Token Standard reference flows plus the two ecosystem applications named in the milestone — extended as the completeness check proves each new shape. Hosting and vetting findings are still taken from the real topology, since the sandbox cannot represent counterparties' participants.

Sandbox mode answers "does this sequence make sense on my state". Pre-flight mode answers "are the prerequisites satisfied right now". Neither answers "will the network accept it".

Snapshot sources: the Admin API ACS export (`repair.export_acs`, which unlike `import_acs` does not require the repair feature flag) in the sandbox milestone; PQS or Canton Index queries as an optional faster path later.

## 8. Surfaces

**CLI, DPM component.**
```
dpm sim run      --commands cmd.json [--participant URL --token ...] [--json] [--trace out.json]
dpm sim inspect  --prepared prepared.json        (analyse an already prepared transaction)
dpm sim check    --commands cmd.json --assert no-blocking-issues --assert cost-below 50000 --junit out.xml
dpm sim explain  --completion completion.json | --command-id ID
dpm sim sandbox  --scenario scenario.yaml [--snapshot acs.json]
dpm sim ui       (local web UI on the last report)
```

**Library, and the binding that makes a pre-sign preview safe.**
```ts
import { preview, previewPrepared } from '@cantonsim/core'

// (a) from a command — convenient, but the wallet must re-prepare to sign
const report = await preview(request, { ledger, topology, actAs })

// (b) from the exact transaction that will be signed — the signing-safe path
const report = await previewPrepared(preparedResponse, { topology })
report.prepare.hash                  // bind the display to this
report.prepare.hashing_scheme_version
```

The failure mode `previewPrepared` exists to prevent: cantonsim prepares and displays transaction A; the wallet prepares again; changed state or package selection yields transaction B; the user signs B having read A. The report identifies the prepared-transaction hash and its hashing scheme, and the wallet is required to verify that the hash it signs is the hash it displayed. We will reuse or integrate with **Verify Before Sign (canton-dev-fund #617)**, which proposes independent prepared-transaction hashing, rather than inventing a second binding scheme.

For arbitrary Daml applications, showing contract-level changes is feasible for any template. Translating them into a financial statement — "you pay 100 and receive 3 units" — requires **versioned, application-specific decoders**; the Token Standard ships first, and any template without a decoder keeps a raw, clearly labelled view rather than a guessed summary.

**CI.** Assertions in the check command, JUnit output, a GitHub Action that runs against a local Canton or a DevNet participant with a scoped token.

**Hosted.** PixelPlex integrates the UI into CC View for users of its hosted participant access. Not part of the grant.

## 9. Validation

**Early feasibility gate, end of Milestone 1.** Three things are proven before the pre-flight milestone starts, and the result is published either way:
1. View projection reproduces Canton's decomposition on a declared set of transaction shapes, measured against a reference oracle (below).
2. The minimum topology-read permission set for a user on a hosted validator is established, and documented, or the degraded mode is specified.
3. Snapshot handling works on representative contracts, including contracts referencing other contracts and contract keys.

Failing any of these is published with the evidence, and the affected milestone's scope and payment schedule go back to the Committee within two weeks. We do not narrow a milestone ourselves to fit a failed gate; the point of gating is that the finding arrives before the milestone starts, not inside it.

**How the reference view structure is obtained. Two oracles, not one.** A committed transaction's Ledger API response does not expose Canton's internal view decomposition, and an update stream is not a sufficient oracle for the participant-level claim either.

| Claim under test | Oracle | Why |
| --- | --- | --- |
| **Party-visible committed effects** — which parties end up entitled to observe what | Ledger API update streams on a multi-participant test network, each transaction submitted once, each participant's stream recorded | This is exactly what the API is for, and it validates the party-level half of A2 directly |
| **Participant receipt and internal view structure** — which participant received and could decrypt which view | An instrumented test participant, or a Canton test hook obtained from upstream | Committed updates **cannot** establish this. Nodes inside a rollback are carried in a view but never appear in a committed update; transactions that are rejected produce no update at all; and a participant receives views, not the party-projected event stream. An update-stream oracle is silent on all three |

Building the participant-level oracle is therefore a **required, published deliverable of Milestone 1**, not an assumption of Milestone 2. If neither an instrumented participant nor an upstream hook proves obtainable, the participant-level claim of A2 is withdrawn to party-level only and the Committee is told before Milestone 2 begins, under the gate rule below. We raise the test-hook question with Canton maintainers in the feasibility gate (§13.5) rather than assuming one exists.

**Acceptance standard for the visibility analysis.** A single aggregate match percentage is deliberately not used. At 95%, 25 transactions in 500 could tell a signer that an institution will not receive information when it will — the single most consequential error this tool can make. The standard is instead:

- **Exact agreement** on every explicitly supported transaction shape.
- **Zero unflagged recipient omissions** across the whole acceptance corpus. A missed recipient is a release blocker; a spurious extra recipient is a defect.
- **A minimum coverage set that must not abstain:** the Token Standard transfer, allocation and settlement flows, plus multi-party exercise, nested exercise, explicit disclosure and multi-hosted party. Abstention on any of these is a defect, not an acceptable answer.
- **Explicit abstention** on unsupported shapes, verified by test, **and capped**: abstention on more than 10% of the acceptance corpus fails the milestone. Without a ceiling, a tool that abstains from everything would satisfy "zero unflagged omissions" perfectly, which is not the standard we intend.
- Coverage, false warnings and missed problems reported **separately**, never merged into one percentage.
- Regression tests for: multi-hosted parties, nested exercises, rollback nodes, explicit disclosure, package upgrades across a view boundary, and `CreateAndExercise` (which must be reported as execute-incompatible).

**Other corpora.**
- Error corpus: failing commands and their completions collected with at least 3 teams, anonymized, published with the repo. Explain coverage is measured against it.
- Routing-rejection corpus: real `NO_SYNCHRONIZER_FOR_SUBMISSION` and `INVALID_PRESCRIBED_SYNCHRONIZER_ID` failures, attributed by A3/A4. Accuracy is measured **per dimension — party, package, participant, node — and never aggregated**, with `unknown` and `not_applicable` as explicit, countable outcomes. Target: at least 90% on each dimension the underlying reason actually carries. No rejection is required to produce every identifier; in particular, node attribution is `not_applicable` whenever preparation failed before producing a transaction tree, and counting those as misses would measure the wrong thing. The measure is attribution accuracy, not detection — prepare already detects these.
- Compatibility matrix, run in CI, with versions pinned per milestone rather than "current":

  | Axis | Values covered |
  | --- | --- |
  | Canton release | pinned patch releases, not version lines: 3.3.x, 3.4.9, 3.4.11, 3.5.6, 3.5.11. The matrix records the exact patch each result was produced on |
  | Feature availability | a per-release column rather than an assumption of a uniform API. Known differences: `estimate_traffic_cost` / `CostEstimationHints` and the `cost_estimation` response exist from 3.5 and are absent in the 3.4 proto, so A7 is `not_applicable` below 3.5; `enforce-single-root-node` exists from 3.4.9; automatic contract-id recomputation on ACS import was removed in 3.5.1 |
  | Protocol version | determines contract-id version and hashing method: PV ≥ 34 → `AuthenticatedContractIdVersionV12` / `TypedNormalForm`; earlier → V11 / `UpgradeFriendly`, V10 / `Legacy`. Sandbox recomputation branches here. PV ≤ 34 also determines whether Canton checks package **dependencies** during vetting, which A4 must match |
  | Prepared-transaction hashing scheme | `HASHING_SCHEME_VERSION_V2` (default) and V3 |
  | API flavour | gRPC and JSON Ledger API |
  | Network | local Canton plus a DevNet build pinned per milestone |
  | Behavioural pins | single-command rejection at prepare, single-root rejection at execute, `CreateAndExercise` root count — each asserted by test so a change upstream breaks CI rather than the product |

## 10. Security

- **Pre-flight and preview modes never submit.** The execute endpoint is not called and no submission path exists in those code paths.
- **Sandbox mode submits only to the isolated local environment it started**, never to a configured production participant. The target endpoint is the one cantonsim generated, and it is asserted before every sandbox submission.
- Localhost binding alone does not make a sandbox safe: automation, oracles or application code running inside a scenario can still reach external production services. Sandbox runs are therefore executed with outbound network access denied by default, and any scenario that needs an external endpoint declares it explicitly and has it recorded in the report's assumption list.
- Tokens are read from the environment or the DPM auth context, never written to reports.
- Reports may contain contract payloads. Default output is local; hosted mode does not persist unless the user saves.
- The ephemeral Canton runs with generated credentials and is destroyed on exit, including its database.

## 11. Risks

| Risk | Mitigation |
| --- | --- |
| Prepare API shape changes between Canton releases | thin client behind an interface; the compatibility matrix pins exact patch releases and records feature availability per release, so an analysis whose API is absent reports `not_applicable` instead of guessing; behavioural pins in CI; maintenance commitment |
| View projection diverges from Canton's decomposition | two oracles (§9): update streams for party-visible effects, an instrumented participant or upstream test hook for participant receipt and view structure, the latter built and published in Milestone 1. Abstention on unsupported shapes, capped so it cannot substitute for accuracy; zero-unflagged-omission acceptance rule; upstream questions raised in the feasibility gate rather than at the end |
| Reviewers read the incremental value as smaller than claimed, because prepare already performs routing checks | §3.1 states exactly what is already covered; the value claim is decoding, timing, future-time evaluation and the checks prepare does not do at all (A2, A10, signing binding) |
| Topology reads restricted on some hosted validators | degrade to `unknown` findings with a clear message; the minimum permission set is established in the feasibility gate and documented |
| The single-command limit is lifted during the project | multi-step scenario testing is retained either way: one atomic transaction is not the same thing as a sequence of separately committed transactions, and a sandbox that replays a sequence against local state answers a question multi-command prepare would not. If it ships, the sandbox's *rationale* shifts from "prepare cannot express this" to sequencing, time travel and hypothetical state, and we flag it at the pre-flight review rather than treating the milestone as obviated |
| Snapshot portability proves narrower than hoped | the sandbox ships for a declared set of contract types with a completeness check that refuses by default rather than misleads; partial runs are opt-in and cannot satisfy a complete-scenario assertion; scope is extended by evidence, and the shapes that remain unproven are named rather than omitted |
| Overlap perception with adjacent proposals, in particular the hosted simulation proposed in canton-dev-fund #481 | explicit relationship table and a named technical boundary in the proposal §3a; shared export format; adapters rather than re-implementation; consume a funded hosted simulator's API rather than duplicate it |

## 12. Team and timeline

Wallet integration moves ahead of the sandbox: it validates practical value earlier and reduces dependence on the riskiest milestone.

| Weeks | Milestone | Team |
| --- | --- | --- |
| 1 to 5 | M1 preview core, explain, feasibility gate | 2 engineers, 1 Daml engineer |
| 6 to 10 | M2 pre-flight assessment | 2 engineers, 1 Daml engineer, 1 Canton operations engineer for topology |
| 11 to 14 | M3 integrations: wallet pre-sign binding, CI, library | 2 engineers, 1 front end, wallet team for the Console Wallet integration |
| 15 to 20 | M4 scenario sandbox | 2 engineers, 1 Canton operations engineer |
| 21 to 24 | M5 adoption, docs, handover | 1 engineer, DevRel |

## 13. Open questions for Canton maintainers

1. Roadmap for multi-command prepare. If it lands during the project, the sandbox narrows to time travel and hypothetical state.
2. Is `CreateAndExercise` intended to be permanently unusable through interactive submission, or is single-root support planned for it? The asymmetry between the prepare check (commands) and the execute check (root nodes) currently makes it fail only after signing.
3. Stability of `cost_estimation` fields and the recommended conversion to CC.
4. Whether hosted validators expose topology reads to hosted parties' users by default, and the minimal permission set to document.
5. Whether Canton can expose its view decomposition for a prepared transaction directly, or provide a test hook for it. If yes, A2 becomes a pass-through and the projection code is dropped.
6. Whether the reason strings inside `NO_SYNCHRONIZER_FOR_SUBMISSION` can become structured error metadata. That would let every tool, not only ours, name the party, package and participant.
7. Interest in taking the report schema and the trace export into a shared standard with dpm trace.

---

## Appendix A. Contract-id recomputation: recipe and self-check

§7 step 4 asserts that a contract can be rewritten for a different party and re-imported under Canton's own validation. That assertion is load-bearing for Milestone 4, so the method is given here in full, in a form a reader who knows Canton can judge by inspection. Established on Canton 3.5.6 (`dpm` component `canton-open-source`), Daml SDK 3.5.2, contract-id version `AuthenticatedContractIdVersionV12` (protocol version ≥ 34), contract hashing method `TypedNormalForm`. The full script and run output go to the Committee on request and are published with the Milestone 1 evidence package.

**What is computed:**

```
contractId = discriminator ++ suffix
suffix     = 0xca12 ++ unicum
unicum     = UnicumGenerator.recomputeUnicum(salt, createdAt, metadata, contractHash)
```

| Input | Where it comes from |
| --- | --- |
| `salt` | the contract's `authenticationData` (`UntypedVersionedMessage{ ContractAuthenticationData{ salt }, version = 30 }`). Authentication checks only that the salt is consistent with the unicum, so any 32 bytes work for a rebuild |
| `createdAt` | preserved from the original, so the production creation time is not lost |
| `metadata` | `ContractMetadata.create(signatories, stakeholders, keyWithMaintainers)` |
| `contractHash` | `ContractHasher(engine, packageResolver).hash(createNode, TypedNormalForm, …)` — **the only part that cannot be computed without the LF engine**. The package resolver reads the DAR directly; no participant is required |

**Self-check.** Before any rewrite, the unicum is recomputed from the contract's own unmodified data and compared with the real suffix of its id. This is what distinguishes a reproduced recipe from one fitted to the answer:

```
SELFCHECK recomputed = ca121220120af0fd7cf1148e5b74ed3d53b411c833b4cf3fc37906f8ecd91298a2c1caf8
SELFCHECK actual     = ca121220120af0fd7cf1148e5b74ed3d53b411c833b4cf3fc37906f8ecd91298a2c1caf8
SELFCHECK MATCH      = true
```

After swapping the party in `signatories`, `stakeholders` and `createArg`, the rebuilt contract keeps its discriminator and takes a new suffix, and `repair.import_acs` accepts it under `ContractImportMode.Validation` — that is, Canton itself verifies the result rather than taking it on trust.

**Two findings that shape the design, both of them silent failures:**

- `import_acs` does **not** check that a party exists in topology. A contract for an unknown party imports without error and is then invisible through the Ledger API. Parties must be allocated locally first, and the completeness check enforces this rather than relying on an import error that never comes.
- A party id embedded in a `Text` field is invisible to a typed traversal, because for LF it is an ordinary string. Rewriting it is a policy decision — a shape heuristic on `hint::fingerprint`, or a per-application list of known locations — and a miss does **not** break the import, since the contract hash is computed over the payload either way. It simply leaves a dangling reference in the fork. This is precisely why §7 defines completeness against a declared application adapter instead of claiming a generic checker.

**Not yet established, and named as such:** contract keys through the remap; contract-id versions V10 and V11 (`Legacy` and `UpgradeFriendly` hashing); hashing scheme branches other than the one tested. These are what the Milestone 1 snapshot gate closes, and the gate result is published whether it passes or fails.
