## Development Fund Proposal

**Organization:** PixelPlex

**Author / Primary Contact:** Alexei Dulub, alexei.dulub@pixelplex.io

**Status:** Draft

**Created:** 2026-09-23

**Proposal Type:** RFP-aligned

**RFP / Roadmap Area:** Developer Experience, Tooling & Education. RFP 20 Indexers (transaction simulation / dry-run and debugging, the top unmet need in the Q1 and Q2 DevRel surveys). Secondary: RFP 19 DPM Components, RFP 18 Integration into SDLCs, RFP 26 Key Management and Signing Controls (human-readable transaction verification before signing).

**Champion:** `Needs Champion`

**Total Funding Request:** 2,400,000 CC

**Project Duration:** 6 months (24 weeks)

**Label:** daml-tooling

**Suggested SIGs:** Daml Language & Developer Tooling (primary), Canton APIs, DAR Package Management & App Lifecycle

---

## Abstract

We propose **cantonsim**, an open-source transaction analysis tool for Canton that tells a developer, an application operator or a wallet **what a command will do, who will receive which part of it, what it will cost, and why it cannot proceed, before anything is signed or submitted**. It runs against the caller's own participant with the caller's own credentials; the preview and pre-flight analyses require no contract state to leave the caller's environment.

cantonsim runs the Ledger API prepare flow and then answers the questions prepare leaves open. Its central answer is who receives what. It projects the transaction into Canton views and reports two things separately: which parties are entitled to observe each part, and which participants receive and can decrypt it. The first is the informee projection the Daml engine computes, and any tool embedding that engine can produce it. The second is Canton's view decomposition, which keys on the participants hosting each node's informees rather than on the informees themselves; it is computed in the protocol layer at submission and returned by no API. That participant-level answer is what a signer needs, and no available tool gives it.

It turns Canton's routing rejections into structured attribution instead of one unstructured string: the identifiers Canton already emits are extracted, enriched from topology and package data, and linked to the responsible party and transaction node wherever the available evidence supports it. It binds a wallet's pre-sign preview to the exact prepared transaction that will be signed. A scenario sandbox replays multi-step flows against a snapshot of the caller's own contract state in an ephemeral local Canton.

The tool distinguishes three results and never conflates them: a **transaction preview** (what this prepared transaction describes), a **pre-flight assessment** (which prerequisites are satisfied, violated or unobservable, at a stated time), and a **scenario sandbox** (what happens under explicit assumptions). The verdict is computed by a fixed rule, not chosen: any blocking failure yields `blocked`; an unknown answer to a check the caller declared required yields `indeterminate`; only a run in which every required check completed successfully yields `passed_required_checks`. Incomplete optional checks are always visible alongside the verdict, and the same rule drives the CLI, the JSON, the UI, the JUnit output and the exit code.

The result ships as a DPM component (`dpm sim`), a TypeScript library that wallets and dApps embed for a pre-sign preview, a CI mode for the SDLC, and a local web UI. Everything is Apache-2.0 and reusable by any Canton team.

A companion implementation draft is filed alongside this proposal as [`2026-09-PixelPlex-cantonsim-implementation-draft.md`](./2026-09-PixelPlex-cantonsim-implementation-draft.md): the interface shapes, the data source and stated confidence of each analysis, the validation plan, and an appendix reproducing the contract-id recomputation self-check.

---

## Specification

### 1. Objective

Close the transaction simulation and dry-run gap identified in the Foundation's DevRel surveys: developers cannot answer "what will this submission change, who will see it, what will it cost, and why is it being refused" without submitting and reading an opaque failure.

Canton already offers part of the answer. `InteractiveSubmissionService.PrepareSubmission` interprets a command without committing and returns the transaction nodes, input contracts and, from Canton 3.5, a traffic cost estimate. As part of preparation it also runs synchronizer routing, which already checks package vetting and party hosting across counterparty participants — but reports the outcome as one concatenated string per discarded synchronizer. Some of those reasons already carry identifiers: `MissingActiveParticipant` names the parties, and `PackageUnknownTo` renders as "Participant P has not vetted Q" (`UsableSynchronizers.scala`, `TransactionTreeFactory.scala:229`, Canton 3.5.11). What is missing is not the identifiers but the structure: the reasons are unstructured text, they are not linked to the transaction node that required the package, and they do not say which party's requirement pulled it in.

What is missing, and what this proposal delivers:

1. **The view and recipient structure.** Which participants receive and can decrypt which part of the transaction, and which parties are entitled to observe it. Canton computes this during submission and returns it through no API. The party-level half is available from any tool that embeds the Daml engine; the participant-level half is not. This is the core of a trustworthy pre-sign preview.
2. **Structured attribution for routing refusals.** The identifiers Canton emits, parsed out of the discarded-synchronizer string, enriched with topology and package data, and attributed to party, package, participant and — where the evidence allows — the transaction node, instead of `NO_SYNCHRONIZER_FOR_SUBMISSION: Discarded synchronizers: ...`. Each dimension is reported separately and may be `unknown`; a failed preparation returns no transaction tree, so node-level attribution is not always reconstructible.
3. **The checks that exist in neither place.** Whether the prepared transaction is one `ExecuteSubmission` will accept at all (root-node count — a `CreateAndExerciseCommand` passes prepare and is refused at execute, after signing); which signing authority execute will require; the binding between what a signer was shown and what they sign.
4. **Pre-flight at a time other than now**, and for parties or synchronizers not in the current submission.
5. **A place to run sequences and hypothetical state** — an ephemeral local Canton seeded from the caller's own snapshot.

Outcome: a developer runs one command, or a wallet calls one function, and receives a structured, explained assessment whose scope and observation time are explicit.

Out of scope, and deliberately left to adjacent work: visualizing committed transactions (dpm trace, Walnut), historical ledger investigation (Daml Shell, Digital Asset), local indexing (PQS, Canton Index). cantonsim consumes and produces their formats rather than replacing them.

### 2. Implementation Mechanics

**Core pipeline.** Input is a command payload in the Ledger API shape (gRPC or JSON Ledger API), a dApp SDK / CIP-0103 request, or **an already prepared transaction**. cantonsim:

1. Calls `PrepareSubmission` on the caller's participant with the caller's `act_as` / `read_as` and cost estimation left enabled — the request field is `estimate_traffic_cost`, a `CostEstimationHints` message rather than a flag, and estimation runs unless `disabled` is set. The field and the `cost_estimation` response it produces exist from Canton 3.5; on 3.3 and 3.4 the cost analysis reports `not_applicable` rather than guessing. This step is skipped entirely when the input is already prepared, which is the signing-safe path.
2. Builds a transaction model from the returned `DamlTransaction` (Create, Exercise, Fetch, Rollback nodes, node seeds, root node ids) and `Metadata` (submitter info, synchronizer, mediator group, input contracts, global key mapping, preparation time), keeping the prepared-transaction hash and its hashing scheme version.
3. Runs the analyses below, each recording its own observation time.
4. Emits a report: JSON for machines, a readable rendering for humans, a dpm-trace compatible export, and JUnit-style output for CI. The report states which of the three result kinds it is, carries the verdict computed by the fixed aggregation rule, and lists every check that could not be completed. Callers — a wallet policy or a CI configuration — declare which checks are required; an `unknown` answer to a required check fails the corresponding assertion rather than passing quietly. Check counts and completion status are derived from the findings, never asserted independently.

**Analyses.** Each states its data source, its confidence, and whether it duplicates, decodes or extends what the participant already does.

- *View decomposition and recipients.* **New — no equivalent today.** Groups nodes into Canton views and resolves each view to the participants that receive it. Follows Canton's actual rule, which keys on hosting participants: a child node starts a new view when the participants hosting its informees are not a subset of the current view's participants. Reports participant-level reception and party-level entitlement separately. Abstains explicitly, with "visibility analysis incomplete", on transaction shapes it does not yet support. Data: prepared transaction plus party-to-participant topology.
- *Authority and signing.* **Partly new.** Three separate questions, never merged: what the participant's interpreter already authorized (explained, not recomputed); which signing authority `ExecuteSubmission` will require, with the threshold per external party; and whether the caller's API rights cover the requested operation. Signatures that do not yet exist are reported as required, not validated.
- *Execute compatibility.* **New.** Checks the prepared transaction against what `ExecuteSubmission` accepts, before any signing round trip. Today that is the root-node count: prepare rejects multiple *commands*, execute rejects multiple *root nodes*, and a `CreateAndExerciseCommand` — one command, two root nodes — falls through the gap. Data: prepared transaction.
- *Hosting.* **Decoding and extension.** Prepare already fails when a party has no active participant or a confirmer has no confirming participant. cantonsim names the party, the participants and their permissions, evaluates the same question for a future ledger time or a party not yet in the transaction, and can report it as a warning where the caller wants to proceed. Data: synchronizer topology.
- *Counterparty package vetting.* **Decoding and extension.** Reproduces Canton's own check exactly — required packages **per party** from the nodes that party witnesses, resolved to that party's hosting participants, including package dependencies where the protocol version requires them — rather than a stricter check that would produce false failures. Adds: decoding the routing rejection into party, node, package and participant; evaluation at a future ledger time; warnings on vetting windows that close inside the expected signing window. Data: vetted-packages topology and the participant's package dependency graph.
- *Input contract status and contention.* **New, with stated limits.** Reports whether each input contract is visible and active at a recorded ledger offset — a contract absent from the caller's ACS is reported as "not visible / not established", since explicit disclosure makes an input usable without it appearing there. Recent contention is presented as a historical indicator, which cannot reveal competing submissions pending right now.
- *Ledger time.* Uses prepared metadata and configured tolerance bounds to report the signing and submission window, and warns when an external signing path is unlikely to fit inside it.
- *Cost and traffic.* Surfaces the prepare cost estimate (confirmation request and response bytes, their total, the estimation timestamp, our measured spread; reassignment cost excluded) and compares it with timestamped traffic headroom. Network resource cost, additional traffic purchase and any wallet-facing fee are kept as three separate figures.
- *Size and limits.* Compares like with like against the synchronizer's maximum request size, stating which representation was measured, since prepared JSON size is not the serialized encrypted sequencer request.

**Explain layer.** Every prepare error and every predicted execute-time failure maps to a cause, the parties, contracts, packages or participants involved, and a suggested fix. Routing rejections are decoded per discarded synchronizer, with each attribution dimension reported separately and explicitly marked unknown where preparation failed before a transaction tree existed. Structured `DAML_FAILURE` errors from `failWithStatus` are passed through with their metadata. Where debug metadata is available (Walnut's debug-info work, once merged), errors link to Daml source locations. Fixes never suggest acting for a party the caller has no authority over; they name who would have to grant it.

**Wallet pre-sign binding.** `@cantonsim/core` exposes `previewPrepared(preparedResponse)` alongside `preview(command)`. The failure mode this prevents is concrete: cantonsim prepares and displays transaction A, the wallet prepares again, changed state or package selection yields transaction B, and the user signs B having read A. The report carries the prepared-transaction hash and its hashing scheme version, and the wallet verifies that what it signs is what it displayed. We will reuse or integrate with **Verify Before Sign (#617)** rather than introduce a second hashing scheme.

What the binding does and does not cover is stated in the report itself: *the signing hash binds the displayed transaction content; the recipient and prerequisite assessments are conditional on the recorded topology and other observations, and are not guaranteed by that hash.* Topology, hosting, vetting, traffic balance and API permissions are external observations, each carrying its own timestamp. Required observations are refreshed immediately before signing under a declared freshness policy, and a material change in any of them forces renewed review — but refreshing narrows the window rather than closing it, since state can still move between signing and submission. Separately, a prepared transaction produced by a participant the caller trusts is not the same thing as an arbitrary prepared object handed to `previewPrepared`: a matching hash establishes that the displayed bytes are the signed bytes, not that they were produced by a successful preparation on a trusted participant. Contract-level effects are shown for any template; financial summaries ("you pay 100 and receive 3 units") require versioned, application-specific decoders, shipping first for the Token Standard, with every undecoded template keeping a raw, clearly labelled view.

**Scenario sandbox.** `dpm sim sandbox` exports the caller's active contracts for the involved parties, runs a **snapshot completeness check** that refuses by default rather than silently dropping (contracts referenced by other contracts or keys, contracts absent from the party-visible export, disclosure-only inputs, unsupported packages or contract-id versions), starts an ephemeral local Canton, imports the snapshot with a party and contract-id mapping, and runs sequences of commands, time advances or mutations. A partial run is possible only when the caller selects it explicitly, and a partial run never satisfies a complete-scenario assertion. Completeness is defined against a declared scope — a supported application adapter, declared scenario inputs, known reference rules and named external dependencies — not as a promise to discover every reference embedded in arbitrary text, hashes or external signatures. Contract ids are recomputed by cantonsim — Canton removed automatic recomputation on ACS import in 3.5.1 — and imported under `ContractImportMode.Validation` so Canton verifies the result. The recomputation recipe and the byte-for-byte self-check output are given in the implementation draft; the full evidence package, including the shapes that remain unproven, is published at Milestone 1. Valid recomputation and import is a narrower claim than behavioural equivalence after remapping, and the two are reported separately. Every sandbox report carries its assumptions, including that acting locally as a remapped counterparty asserts the counterparty *would* act, which is a hypothesis and not evidence. Initial scope is a declared set of contract types and applications, extended as the completeness check proves each new shape.

**Surfaces.**

- `dpm sim run | inspect | check | explain | sandbox`, packaged as a DPM component following the component conventions (RFP 19).
- `@cantonsim/core`, a TypeScript library with `preview(command)` and `previewPrepared(preparedTransaction)`, built on the dApp SDK connectivity layer so wallets can render counterparties, amounts, cost and who-receives-what before signing (RFP 26).
- CI mode with assertions (`expect no blocking issues`, `expect recipients`, `expect cost below`), exit codes and a GitHub Action example (RFP 18).
- A local web UI for the report and the recipient projection. PixelPlex will additionally host it inside CC View for parties that use CC View's hosted participant access, outside this grant.

**Technology.** TypeScript core, gRPC and JSON Ledger API clients, Canton Admin API for topology reads, DPM component packaging (OCI), Apache-2.0.

### 3. Architectural Alignment

- Uses only public, documented Canton interfaces: the Ledger API v2 interactive submission service, the ACS and update services, the Admin API topology reads and the validator traffic status. No private participant internals.
- Respects Canton's privacy model as RFP 20 requires. Every analysis runs on the caller's own participant with the caller's own rights. The only cross-party data used is synchronizer topology, which is shared with every participant by design. cantonsim does not read or depend on mediator metadata and is unaffected if involved-party metadata stops being publicly observable.
- Reports are honest about scope: reads are not one atomic snapshot, so every report carries the ledger offset, the topology observation time, effective package versions and a timestamp per check.
- Complements CIP-0103 (dApp Standard) on the wallet side and the package vetting direction of RFP 3 and the Standard Package Validation draft CIP.
- Follows DPM component conventions and the ledger client standard for SDK behaviour.

**What RFP 20 asks applicants to identify.**

1. **Which data the proposal requires.** The prepared transaction and its metadata from `PrepareSubmission`; the caller's active contract set and command completions; synchronizer topology — party-to-participant mappings, participant permissions and vetted packages; the participant's package dependency graph; the validator's traffic status. For the sandbox milestone, an ACS export limited to parties the caller already sees.
2. **Whether that data is node-local, application-provided or publicly observable.** All of it is node-local or shared by design. The prepared transaction, the ACS and the completions are node-local to the caller's own participant and are read with the caller's own rights. Topology is shared with every participant by construction. Nothing is provided by a third-party application, and nothing is taken from the mediator, from other participants' ledgers or from public scan data.
3. **How the proposal continues to function if involved-party metadata is no longer publicly available.** Unaffected. cantonsim reads no mediator metadata and derives no analysis from publicly observable activity. Every recipient and prerequisite answer is computed from the caller's own prepared transaction together with the shared topology, both of which remain available to the caller's participant whatever the protocol stops exposing publicly.
4. **How privacy, access control and selective disclosure are handled.** Every analysis runs with the caller's credentials and can see no more than the caller may see. Where a topology read is denied, the finding degrades to `unknown` with a message naming the missing permission rather than being inferred. Reports can contain contract payloads, so output is local by default and each report records what it observed and when. The optional hosted UI in CC View runs on the user's own token, is outside this grant, and persists nothing unless the user saves a report.

### 3a. Relationship to adjacent proposals

Several funded and proposed efforts touch the same surface. cantonsim integrates with them and does not re-implement them; the defensible scope is **integrated pre-flight analysis, visibility assessment and wallet-ready transaction previews, with adapters to adjacent components** — not another standalone error catalogue, cost estimator and snapshot manager.

| Adjacent work | Overlap | Boundary we commit to |
| --- | --- | --- |
| Tenderly Simulation for Daml on Canton (#481, open, `Core/ready for vote`) | simulation before submission, privacy projection, contract state diff, CI API | we do not build a hosted simulation service; if #481 is funded we consume its API as an additional backend. The technical boundary is stated below. |
| Failure-Classification Engine (#297, closed) | error registry, diagnosis, suggested checks | build and publish our own extensible registry rather than depend on one that is not being funded, and keep the routing-rejection decoding contributable in a form anyone can extend |
| DPM Ledger Operations (#520) | prepare-based fee estimation, CI cost gates, replay | consume its cost surfaces; cantonsim's contribution is the timestamped headroom and the three-way cost separation, not another estimator |
| Ledger Snapshot (#604) | state capture and restoration for development | prefer it as the snapshot source for the sandbox milestone if it ships in time; our addition is the completeness check and the party/contract-id remapping |
| Verify Before Sign (#617) | binding prepared content to signing | reuse its hashing scheme for the wallet binding; do not introduce a second one |
| DPM Trace (#327) | transaction inspection and presentation | shared export format, reuse its tree rendering; trace covers prepared and committed transactions, cantonsim covers the assessment around them |
| DPM Debug (#494, open) | visual debugging of Daml on Canton | a debugger steps through interpretation; cantonsim assesses a prepared transaction against live topology. Adopt its source mapping where it lands rather than build a second one |
| Daml Shell (#752, open), CantonTrace (#185, open) | historical investigation of committed activity | complementary; they cover the past, cantonsim the pre-submission moment |

**On #481 specifically.** Tenderly proposes a hosted simulation environment built on a forked "Virtual Participant" that embeds the Daml engine and mocks the Global Synchronizer, hydrated from an uploaded ACS; two of its three ingestion paths move contract state outside the caller's network. The difference is not hosted against local — cantonsim has an optional hosted UI as well — but where the analysis is computed. Because cantonsim asks the caller's real participant, it answers what a fork cannot: what `ExecuteSubmission` will refuse before a signature is spent, what the live synchronizer routing rejected and for which party and package, the traffic cost `PrepareSubmission` actually returned, and whether the hash a wallet displayed is the hash it signs. The privacy projection #481 publishes is party-level; ours is the participant-level view decomposition described in §1. RFP 20 states a preference for approaches that do not depend on data leaving the caller's control and that remain useful as Canton's privacy protections evolve. Should both be funded, we will consume Tenderly's simulation API as an additional backend rather than stand up a competing hosted service.

Statuses on 2026-09-23: #327 merged; #297 closed on 2026-09-02 because the proposing team held an active grant, not on the merits of the idea; #481, #520, #604, #617, #494, #752 and #185 open. Of the open work #481 is the closest in ambition. None of it delivers participant-level view and recipient projection, the execute-compatibility check and the pre-sign hash binding as one result computed on the caller's own participant.

### 4. Backward Compatibility

No backward compatibility impact. cantonsim never submits in preview or pre-flight mode, never changes participant configuration, and adds no new protocol or API. Sandbox mode submits only to the ephemeral local environment it started. It tracks Ledger API v2 as shipped in Canton 3.3 and later, with tested patch releases pinned and behaviour asserted per release in CI. The APIs are not identical across that range — traffic cost estimation, for one, arrives in 3.5 — so the repository carries a feature-availability matrix rather than a single supported-version claim, and analyses degrade to `not_applicable` on releases that lack the underlying API.

---

## Milestones and Deliverables

### Milestone 1: Preview core, explained failures, feasibility gate
- **Estimated Delivery:** week 5 from project start
- **Focus:** `dpm sim run` and `dpm sim inspect` on top of `PrepareSubmission`, transaction model, execute-compatibility check, timestamped cost estimate, error mapping including routing-rejection decoding, JSON and human output, dpm-trace compatible export.
- **Deliverables / Value Metrics:** a developer runs one command against a local or remote participant and receives an explained result with explicit unknowns. At least 25 distinct Canton and Daml error situations mapped to causes and fixes, demonstrated on a public corpus of failing commands assembled with at least 3 ecosystem teams.
- **Feasibility gate, published either way.** Three concrete artifacts, each published as code and output whether it passes or fails:
  1. **The recipient oracle**, in two parts. Party-visible committed effects are validated against Ledger API updates. Participant receipt and internal Canton view structure are validated against an instrumented test participant or a Canton test hook — committed updates cannot establish what a participant received during rollback processing or for transactions that never commit, so an update stream alone is not an acceptable oracle for the participant-level claim. Establishing this oracle is a deliverable of Milestone 1, not an assumption of Milestone 2.
  2. **The minimum topology-read permission set** for a user on a hosted validator, documented, or the specified degraded mode.
  3. **The snapshot evidence package**: contract-id recomputation and import, contracts that reference other contracts, contract keys, and post-import execution, with the shapes that remain unproven named explicitly.
- **Consequence of a failed gate.** A failed gate does not silently shrink the work. Within two weeks we publish the finding and submit a revised scope and a revised payment schedule for the affected milestone to the Committee. Should the recipient-analysis gate fail, Milestone 2 and its 500,000 CC are reopened for explicit reconsideration rather than narrowed by us.

### Milestone 2: Pre-flight assessment
- **Estimated Delivery:** week 10 from project start
- **Focus:** view decomposition and recipients, authority and signing requirements, hosting, counterparty vetting decoding and future-time evaluation, input contract status and contention, ledger-time window, cost versus traffic balance, size limits.
- **Deliverables / Value Metrics:**
  - **A declared minimum coverage set** that must receive complete recipient analysis, not abstention: the Token Standard transfer, allocation and settlement flows, plus the ordinary wallet shapes — multi-party exercise, nested exercise, explicit disclosure, multi-hosted party. Shapes outside that set may abstain; shapes inside it may not.
  - **Exact agreement** between the view projection and the reference oracle on every explicitly supported transaction shape, with **zero unflagged recipient omissions** across the whole acceptance corpus (500 transactions, at least 5 Daml packages). A missed recipient is a release blocker.
  - **Explicit abstention**, verified by test, on every unsupported shape — and a ceiling on it: abstention above 10% of the acceptance corpus fails the milestone. Explicit abstention is an honest answer, not a way to satisfy an accuracy target by declining to answer.
  - Coverage, false warnings and missed problems reported separately; no single aggregate percentage is used as an acceptance figure.
  - Regression tests for multi-hosted parties, nested exercises, rollback, explicit disclosure, package upgrades across a view boundary, and `CreateAndExercise`.
  - Routing-rejection corpus: real `NO_SYNCHRONIZER_FOR_SUBMISSION` and `INVALID_PRESCRIBED_SYNCHRONIZER_ID` failures, with attribution accuracy measured **separately for party, package, participant and node**, each with explicit `unknown` and `not_applicable` outcomes. The target is at least 90% on the dimensions the underlying error actually carries; no rejection is required to yield every identifier, and node attribution is reported as unavailable where preparation failed before producing a transaction tree. Measured as attribution accuracy, since prepare already detects these.

### Milestone 3: Integrations and pre-sign binding
- **Estimated Delivery:** week 14 from project start
- **Focus:** `@cantonsim/core` with `preview` and `previewPrepared`, hash binding aligned with Verify Before Sign (#617), dApp SDK hook for wallet pre-sign preview, Token Standard effect decoders, CI mode with assertions and GitHub Action, JSON Ledger API support, local web UI.
- **Deliverables / Value Metrics:** at least 2 wallets show the cantonsim preview before signing, with the displayed transaction bound to the signed hash. At least 3 repositories run cantonsim assertions in CI. **Secured today:** Console Wallet and CC View are PixelPlex's own products and are committed. The second external wallet and the external CI repositories are intended partnerships, not signed commitments, and are reported as such until they are confirmed in writing.

### Milestone 4: Scenario sandbox
- **Estimated Delivery:** week 20 from project start
- **Focus:** ACS snapshot export, snapshot completeness check, ephemeral local Canton, party and contract-id mapping, command sequences, time travel, state diff, assumption reporting.
- **Deliverables / Value Metrics:** a developer replays a settlement flow of at least 5 commands from a snapshot of their own state and reads a state diff with its assumption list. Demonstrated on the Token Standard reference flows and on at least 2 ecosystem applications. Released only after the snapshot compatibility tests pass; shapes that fail the completeness check are documented as unsupported rather than shipped, and a partial run — available only on explicit selection — never satisfies a complete-scenario assertion.

### Milestone 5: Adoption and handover
- **Estimated Delivery:** week 24 from project start
- **Focus:** documentation, DPM component publication, training material, maintenance plan.
- **Deliverables / Value Metrics:** at least 5 ecosystem teams, including at least 2 Featured Apps and 1 validator operator, use cantonsim in development or operations and confirm it in writing. Of these, PixelPlex's own Featured Applications and validator are committed; the remainder are intended adoption and are listed separately in every progress report, so the Committee can always see which commitments are secured and which are still being sought. Published getting-started guide, reference architecture, and a 12-month maintenance commitment from PixelPlex.

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone
- Demonstrated functionality against local Canton, DevNet and an authorized MainNet participant
- Documentation and knowledge transfer provided
- Alignment with stated value metrics

Project-specific conditions:

- Adoption in Milestones 3 and 5 is evidenced by public repositories, wallet release notes or written confirmation from the adopting team. Teams that do not operate their own participant, and PixelPlex's own products, are counted and reported separately from independent adopters.
- All code, corpora and documentation are public under Apache-2.0 for the whole project, not only at the end, so the ecosystem keeps the result whether or not the later milestones are funded.
- The feasibility gate result at Milestone 1 is published whether it passes or fails, together with the revised scope and payment schedule proposed to the Committee within two weeks of the result.
- Milestone 2 accuracy figures are measured on corpora published with the repository so any reviewer can rerun them, and are reported as separate coverage, false-warning and missed-problem figures rather than one aggregate. Attribution accuracy is reported per dimension — party, package, participant, node — never as a single number.
- The report verdict follows the published aggregation rule, and the CLI exit code, the JUnit result and the JSON verdict always agree. A required check that could not be completed produces `indeterminate` and a failing CI assertion, never a pass.

---

## Funding

**Total Funding Request:** 2,400,000 CC

### Payment Breakdown by Milestone
- Milestone 1 (Preview core, explained failures, feasibility gate): 400,000 CC upon committee acceptance
- Milestone 2 (Pre-flight assessment): 500,000 CC upon committee acceptance
- Milestone 3 (Integrations and pre-sign binding): 450,000 CC upon committee acceptance
- Milestone 4 (Scenario sandbox): 600,000 CC upon committee acceptance
- Milestone 5 (Adoption and handover): 450,000 CC upon final release and acceptance

**Basis of the request.** The milestone amounts follow the staffing in the implementation draft: roughly 77 person-weeks across five milestones (M1 15, M2 20, M3 16, M4 18, M5 8), which puts the request at approximately 31,000 CC per person-week, inclusive of infrastructure, test networks and the published corpora. The figure is an assumption stated openly so the Committee can test it, not a quoted rate.

**Risk ordering, stated accurately.** The wallet integration that proves practical value is funded before the sandbox rather than after it. The sandbox (M4) carries the largest delivery risk and is funded late. But the single largest *technical* risk — the view and recipient projection — sits in M2 and is funded second, which is deliberate: it is the proposal's differentiator, it is gated by the Milestone 1 feasibility work, and a failed gate reopens M2's scope and funding rather than proceeding on hope.

### Volatility Stipulation
The project duration is under 6 months. Should the project timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility.

### Maintenance
PixelPlex commits to 12 months of maintenance after Milestone 5 at its own cost: Ledger API compatibility with new Canton releases, security fixes, and issue triage within 5 business days. Larger evolutions, for example multi-synchronizer simulation, will be proposed separately.

---

## Co-Marketing
Upon release, the implementing entity will collaborate with the Foundation on:

- Announcement coordination for each milestone
- A technical blog per milestone and a case study with an adopting Featured App
- A workshop at a Canton developer meetup and recorded training for the Foundation's materials
- Listing in the DPM component registry and the ecosystem directory

---

## Motivation

The Foundation's own data says this is the longest-standing unmet need. The roadmap records that "transaction simulation / dry-run tooling (Tenderly-equivalent) was requested by Q1 respondents and reappears in Q2 as a repeated ask", and that Transaction Debugging & Observability was the lowest-rated experience area in both quarters — 2.55 in Q1, 3.26 in Q2, still tied for lowest.

Every team that submits transactions is affected: application developers, Featured App operators, wallets, validator operators supporting hosted parties, and the institutional integrators the roadmap targets. Today the feedback loop is submit or sign, fail, read an error, guess. The Canton-specific failures are the worst, and not because the participant fails to detect them — it often does — but because what it returns is a single concatenated string listing discarded synchronizers. Identifiers are sometimes inside it and sometimes not, in an inconsistent free-text shape that no tool can rely on, never linked to the transaction node that caused the requirement, and never machine-readable. A `CreateAndExerciseCommand` is worse still: it prepares cleanly, gets signed, and is only then refused.

Expected reach: the checks apply to any Daml application, so we expect the majority of active application teams to use at least the CLI or the CI mode within a year, and wallets that adopt the pre-sign preview to expose it to every one of their users.

Strategic importance: institutional participants will not sign what they cannot preview, and will not accept a preview that cannot say who else receives the information. A standard way to show a signer what a transaction does, which participants receive it, what it costs, and what has *not* been established is a prerequisite for the ClearSigning direction in RFP 26 and for the institutional workflows in RFP 12.

---

## Rationale

**Why build on prepare instead of a separate interpreter.** `PrepareSubmission` is the participant's own interpretation of the command on the real active contract set, so the preview reflects what the participant actually decided and stays correct as Daml and Canton evolve. A re-implemented interpreter would drift. What prepare cannot do is guarantee a future distributed outcome — a contract may be consumed, topology may change, a signing window may expire — which is why the tool reports a pre-flight assessment with an observation time rather than a prediction.

**Why the pre-flight layer is the core, stated precisely.** Prepare's routing already checks counterparty vetting and hosting, and its rejection reasons already carry some of the identifiers involved. What it cannot do is present them in a structured, consistent form, link them to the transaction node that created the requirement, or say which party's witnessing pulled a package in. The genuinely missing pieces are the view and recipient structure (computed by Canton at submission and exposed nowhere), the execute-compatibility check that prepare does not perform, the signing-authority statement, and the ability to ask any of these about a future time or a different synchronizer. Reading the shared topology through the caller's own participant answers them without any privacy trade-off.

**Why a scenario sandbox.** Prepare accepts one command per transaction and only the present state. Multi-step settlement flows and hypothetical states need a place to run. An ephemeral local Canton seeded from the caller's own snapshot is the smallest honest sandbox — and it is labelled a sandbox, with its assumptions attached, because a single participant collapses distributed permissions, availability and counterparty behaviour.

**Why not extend dpm trace or Daml Shell.** dpm trace visualizes prepared and committed transactions and its proposal lists simulation and what-if tooling as explicit follow-ons outside its scope. Daml Shell investigates history. cantonsim sits before submission and hands its output to both. We will contribute the trace export format upstream rather than fork either tool. Our relationship to the other adjacent proposals is in §3a.

**Why TypeScript.** The dApp SDK and the wallet ecosystem are TypeScript, so a library that wallets can embed must be too. The view decomposition we reproduce is a bounded algorithm over data we already fetch — the recursion itself is small, and the work is in the informee and confirming-party semantics per node kind, quorum aggregation, rollback contexts and the submitting-admin-party rule — so this is a faithful reimplementation of one well-scoped function, validated against an oracle, not a port of the platform. The CLI is the same code packaged as a DPM component, which keeps one implementation.

**Alternatives considered.** A hosted-only service would be simpler but would centralize command payloads and contradict RFP 20's privacy guidance. A Daml Script based harness covers only local sandboxes and cannot check topology. Both were rejected.

**About PixelPlex.** PixelPlex operates a Canton validator, four Featured Applications and an asset issuer, builds CC View (explorer and data API), Console Wallet (the largest wallet on Canton) and CC Tag (Canton Name Service front end), co-authored CIP-0103 (dApp Standard) and authored the draft Standard Package Validation CIP (cips PR #168) that the funded Package Distribution proposal builds on. About a third of its 100 engineers work on Canton and Daml.
