# Development Fund Proposal

**Title:** Canton Private Scheduled Execution Toolkit  
**Author:** Orbit
**Status:** Revised draft — external demand, venue commitment, and Champion pending  
**Updated:** 2026-09-16  
**Champion:** To be confirmed with a Canton Foundation Tech & Ops Committee member before resubmission; builder endorsements do not replace this role.  
**Labels:** `financial-workflows-composability`, `dapp-integration`  
**Type:** Open-source reference implementation and developer toolkit  
**License:** Apache-2.0 for code; CC-BY-4.0 for documentation  
**Target:** LocalNet and dependency-gated TestNet  
**Delivery period:** 8 weeks for engineering followed by up to 10 weeks for external adoption milestones, after approval and dependency confirmation  
**Funding request:** 1,850,000 CC total: 1,295,000 CC (70%) for engineering and 555,000 CC (30%) for independently verified adoption. The request is denominated in CC; a dated CC/USD reference and cost basis will be attached before resubmission.

---

## Summary

The **Canton Private Scheduled Execution Toolkit** is an open-source Daml and TypeScript stack for executing a large asset order over time while keeping the full parent order private from the venue.

The owner approves a parent order and a bounded Token Standard V2 allocation. A deterministic executor creates short-lived child slices, checks venue-authorized quotes, and submits Token Standard settlements. The toolkit supports partial fills, cancellation, expiry, bounded catch-up, restart recovery, and ledger-based reconciliation.

The deliverables are:

- Daml contracts for the parent order, execution slices, fills, and final summary;
- a deterministic TypeScript executor with PostgreSQL persistence;
- a CLI, reference UI, and adapter conformance suite;
- a LocalNet RFQ fixture and one named Canton venue or settlement adapter;
- CIP-0103 wallet approval integration;
- a security test corpus and independent review;
- one independently operated pilot on a compatible Canton workflow, followed by a second independent integration or reproducible pilot, with public evidence that respects transaction privacy.

Orbit is the first internal integrator, but all funded components work without an Orbit account, API, model, or proprietary data. Orbit's own use is not counted as ecosystem adoption. No external builder endorsement or pilot commitment has been supplied for this draft; the proposal must be updated with attributable responses before it is represented as submission-ready.

## Problem and Ecosystem Benefit

Canton provides private workflows and atomic settlement, but applications still need to build the execution layer between an approved large order and a venue:

- parent and child order state;
- time, quantity, price, fee, and payment-budget controls;
- partial-fill and residual accounting;
- cancellation and expiry behavior;
- retries, deduplication, restart recovery, and reconciliation;
- selective disclosure of only the active slice;
- integration tests for venue adapters.

This project packages those responsibilities as reusable infrastructure for Canton trading, treasury, wallet, and agent applications. It does not build a venue or require downstream teams to use Orbit.

### Evidence of Ecosystem Need and Current Validation Status

Public product descriptions show plausible integration contexts, not confirmed demand for this toolkit. They also do not prove that the products expose the Token Standard V2 allocation and venue-authorized settlement interfaces required by this proposal. The following teams have been suggested for feedback. The links document their public product scope only; each team's own written answer is needed before citing it as evidence of need or endorsement.

| Team | Public product signal | Specific question to validate | Current evidence status |
| --- | --- | --- | --- |
| [Rocky](https://rocky.exchange/) | Canton spot and perpetual trading; its [public Daml repository](https://github.com/Rocky-exchange/daml-contracts) describes a custom perpetuals stack. | Does a spot or treasury workflow need private, bounded TWAP execution? Can the relevant venue interface issue a slice-bound quote and compose Token Standard settlement without exposing the parent? | Public product evidence only; team feedback not yet supplied to this draft. |
| [Canborsa](https://canborsa.com/blog/canborsa-beta-is-live) | Wallet, swaps, and perpetual markets for crypto and tokenized assets. | Is there a live swap or spot asset workflow with a large-order execution problem and a compatible quote/settlement interface? | Public product evidence only; team feedback not yet supplied to this draft. |
| [ibex](https://ibex.market/) | Private perpetuals on Canton. | Would an external scheduled execution component be useful for this product, and can its derivatives position flow use the proposed Token Standard V2 settlement path? | Public product evidence only; team feedback and derivatives compatibility not yet supplied to this draft. |
| [Unhedged](https://unhedged.gg/faq/) | Canton prediction markets with outcome-share trading. | Does any longer-lived outcome-share order need bounded scheduling, and can its order/expiry/settlement model use the proposed adapter? | Public product evidence only; team feedback and settlement compatibility not yet supplied to this draft. |

Before resubmission, Orbit will publish an evidence register with a link to each authorized public response, the respondent's role, the date, the specific use case, the pain in its current implementation, the requested toolkit capability, interface/deployment requirements, and the level of commitment: feedback only, design review, TestNet pilot, or production consideration. A negative or non-applicable answer will be recorded honestly. Private feedback may be summarized only with the respondent's permission and enough detail for the committee to assess it.

**Submission gate:** obtain at least one independent builder's written description of a concrete scheduled-execution need and one named venue or settlement maintainer's technical confirmation of usable extension points and willingness to support a TestNet pilot. Preferably obtain a second independent builder's feedback. If no compatible venue and independent use case are confirmed, narrow or defer the proposal rather than treating Orbit's internal use or the four teams' product categories as adoption evidence. These pre-submission confirmations do not earn a grant payment.

## User Flow

Example instruction:

> Buy 1,000,000 units of a tokenized Treasury asset over two hours. Pay no more than 99.30 per unit. Submit one slice every ten minutes and no more than 100,000 units per slice.

A UI, OMS, rules engine, or AI agent produces a proposed order:

```json
{
  "clientOrderId": "TWAP-20260804-001",
  "instrument": { "admin": "TreasuryRegistry::...", "id": "UST-2027" },
  "side": "BUY",
  "totalQuantity": "1000000",
  "startTime": "2026-08-04T14:00:00Z",
  "endTime": "2026-08-04T16:00:00Z",
  "sliceIntervalSeconds": 600,
  "maxSliceQuantity": "100000",
  "limitPrice": "99.30",
  "maxPaymentBudget": "99300000",
  "venueAdapter": "named-venue-v1"
}
```

1. The owner reviews and approves the normalized order through an existing wallet or institutional signing process.
2. The approval creates the private parent order and a bounded CIP-0112 allocation.
3. The executor creates a due child slice.
4. The adapter obtains a venue-authorized quote bound to that slice.
5. A fill settles through the Token Standard allocation and reduces the remaining slice quantity.
6. Additional fills may complete the slice before expiry.
7. Skipped or partially filled intervals may catch up later without exceeding the approved total or maximum slice size.
8. Cancellation blocks new slices. Committed settlements remain final.
9. The owner receives a ledger-derived execution summary and audit export.

An LLM may propose the JSON in step 1. It cannot approve, sign, change approved terms, calculate runtime fills, or determine settlement.

## Scope

### In Scope

- one asset pair or instrument per parent order;
- one configured venue per parent order;
- deterministic TWAP scheduling;
- buy and sell price limits;
- venue fees and maximum payment budget enforced from on-ledger settlement terms;
- partial fills and residual quantity;
- skipped intervals and bounded catch-up;
- cancellation and expiry;
- CIP-0112 committed allocations and iterated settlement;
- private parent state and selectively disclosed child slices;
- TypeScript executor, PostgreSQL persistence, CLI, and reference UI;
- current-state recovery from active contracts, application receipts, and retained Ledger API or PQS updates;
- CIP-0103 `prepareExecute` wallet approval flow;
- LocalNet fixture, one named venue adapter, and dependency-gated TestNet demonstration;
- adapter conformance tests and independent security review.

### Out of Scope

- a DEX, CLOB, AMM, RFQ venue, market maker, or liquidity program;
- cross-venue aggregation, best execution, or smart-order routing;
- VWAP, percentage-of-volume, or adaptive algorithms;
- market-data or oracle infrastructure;
- generic automation, agent mandates, policy engines, or approval systems;
- a wallet, custody, key-management, MPC, or signing product;
- FIX or ISO 20022 translation;
- a general event gateway, indexer, or transaction simulator;
- MainNet operation or trading capital;
- exactly-once guarantees for an off-ledger venue without stable execution identifiers and reconciliation.

Perpetual positions and prediction-market shares are not assumed to be Token Standard V2 spot assets. Integrating a team whose workflow uses a different order or settlement model would require a separately reviewed scope change; its expression of interest alone does not qualify it as the named v1 venue or an adoption pilot.

## Technical Design

### Daml Contracts

| Contract | Purpose |
| --- | --- |
| `ScheduledExecutionOrder` | Approved immutable terms, owner, executor, venue, and observers. |
| `ActiveExecutionOrder` | Private cumulative state, interval, settled quantity, consideration, allocation references, and status. |
| `ExecutionSlice` | Venue-visible slice containing only instrument, side, quantity, limit, expiry, and adapter ID. |
| `VenueQuote` | Venue-authorized quote bound to one slice and validity window. |
| `SliceFillReceipt` | Ledger-derived fill quantity, consideration, fee, venue execution ID, and settlement references. |
| `ScheduledExecutionSummary` | Final totals, weighted average price, residual quantity, skipped intervals, and fill references. |

Daml enforces:

1. cumulative fills cannot exceed the parent quantity or committed allocation;
2. a slice cannot exceed its due quantity or maximum size;
3. a fill must be positive and no larger than the slice remainder;
4. buy fills cannot exceed the price and payment budget; sell fills cannot fall below the limit;
5. venue fees must match the settlement legs and approved fee rules;
6. expired or cancelled orders and slices cannot execute;
7. a consuming state transition prevents duplicate fills and duplicate slices;
8. only the designated executor can advance execution;
9. final state cannot return to active;
10. venue-visible contracts do not include the parent total or future schedule.

Partial fills use an archive-and-recreate transition:

```text
ExecutionSlice(remaining = 100,000)
  -> settle 40,000
  -> SliceFillReceipt(40,000)
  -> ExecutionSlice(remaining = 60,000)
```

The final fill closes the slice. An expired partial slice records its residual without creating an unrestricted market order.

### Scheduling

Let `Q` be total quantity, `N` the number of intervals, `M` the maximum slice size, and `F(k)` the cumulative settled quantity before interval `k`:

```text
target(k) = min(Q, Q * k / N)
due(k)    = min(M, max(0, target(k) - F(k)))
```

The specification defines rounding, minimum quantity increments, skipped intervals, catch-up, expiry, and residual handling. Daml is authoritative for financial constraints; TypeScript must match published conformance vectors.

### Token Standard

The project uses CIP-0056 as the deployed interoperability baseline and pins the exact CIP-0112 reference or deployed package versions used for:

- committed allocations;
- iterated settlement;
- account-aware holdings;
- settlement events.

CIP-0112 is Approved but not assumed to be universally deployed. LocalNet uses pinned packages. TestNet acceptance requires the same packages and the named venue interfaces to be available and vetted. If they are unavailable, Orbit and the committee must approve a revised target or schedule; the LocalNet fixture alone does not count as the promised public integration.

### Privacy

The owner, executor, and optional auditor can see the parent order. A venue or counterparty sees only the slice and settlement in which it participates.

LocalNet tests inspect party-visible active contracts and projected transaction views. Timing, repeated size, and traffic may still permit inference; the documentation will state this limitation.

Atomic parent accounting with a third-party venue is conditional on that venue's Daml extension points. A venue that requires disclosure of the full parent or cannot compose an atomic settlement is not eligible for the reference adapter without a reviewed design change.

### TypeScript Executor

The self-hosted executor provides:

- deterministic scheduling and fill accounting;
- JSON Ledger API integration and generated Daml types;
- PostgreSQL persistence and a lightweight local mode;
- transactional worker locking;
- stable order, slice, command, and client execution IDs;
- participant-scoped command deduplication;
- bounded retry and error classification;
- reconciliation against active contracts and committed settlement events;
- recovery after crashes before submission, after submission, and before local persistence;
- structured logs, metrics, and dry-run mode;
- ledger-derived JSON and CSV audit exports.

The toolkit rebuilds current execution state from active contracts, application receipts, and retained updates. It does not claim that pruned historical events are always recoverable. Full historical reporting requires retained receipts, PQS data, or an application archive.

Network traffic cost is estimated and guarded in the executor or wallet layer. Venue fees and settlement consideration are enforced on-ledger when included in the settlement terms.

### Venue Adapter

```typescript
interface ScheduledExecutionVenueAdapter {
  discoverQuote(slice: SliceRequest): Promise<OnLedgerQuoteRef | null>;
  prepareFill(
    slice: SliceRequest,
    quote: OnLedgerQuoteRef,
    fillQuantity: Decimal,
    allocation: AllocationRef,
    clientExecutionId: string,
  ): Promise<PreparedLedgerSettlement>;
  reconcile(clientExecutionId: string): Promise<SettlementStatus>;
}
```

An HTTP response is not settlement proof. A quote must resolve to a venue-authorized Canton contract, and a settled result must be backed by a committed ledger event or receipt.

The repository ships a LocalNet RFQ fixture and one adapter to a named public Canton workflow. Before resubmission, the proposal will identify the target, the specific quote and settlement extension points, package versions, TestNet access requirements, and the venue maintainer's authorized feedback or pilot commitment. The fixture alone is not a substitute for an independently operated venue workflow.

### Wallet and Orbit Integration

The reference UI uses the CIP-0103 dApp API `prepareExecute` flow for user review and signing where supported by the selected wallet. A static JSON file can replace the UI or AI proposal layer without changing execution.

Orbit will use the toolkit as its first integrator:

```text
Orbit intent or strategy output
  -> proposed order JSON
  -> deterministic validation
  -> wallet approval
  -> open-source executor
  -> Canton settlement
  -> ledger reconciliation and user summary
```

Orbit's models, prompts, datasets, multi-chain routing, and hosted platform are not funded deliverables.

## Security and Conformance

The public test corpus covers at minimum:

- duplicate slice and fill submission;
- two workers racing on one interval;
- overfill and allocation overspend;
- partial-fill residual errors;
- price, fee, and payment-budget violations;
- execution before start, after expiry, or after cancellation;
- stale, unauthorized, or mismatched quotes;
- settlement and cancellation races;
- crash and Ledger API stream recovery;
- adapter settlement claims without ledger evidence;
- parent-order disclosure to a venue or unrelated party;
- malicious JSON attempting to change approved terms;
- inconsistent final summaries.

The independent review covers Daml authorization, Token Standard settlement, partial-fill accounting, privacy views, command deduplication, reconciliation, and the named adapter. Critical and high findings must be remediated before Milestone 3 acceptance. Adoption pilots cannot start with unresolved critical or high findings in their relevant execution path.

## Deliverables and Repository

The Apache-2.0 repository will contain:

```text
daml/                  Daml contracts and LocalNet RFQ fixture
packages/core/         schema, types, schedule, and conformance vectors
packages/executor/     executor, persistence, recovery, and audit export
packages/venue/        reference and named venue adapters
packages/agent-example optional JSON proposal example
apps/reference-ui/     wallet approval and execution status UI
cli/                   validate, create, start, status, reconcile, cancel, export
conformance/           adapter and security scenarios
docs/                  architecture, privacy, integration, and operations
```

No core package requires an Orbit service or commercial license.

## Milestones

Engineering workstreams may run in parallel. The eight-week engineering schedule is valid only if the named team, venue access, pinned packages, and independent review slot are confirmed before work starts. Adoption milestones follow the reviewed v1.0 release and require independent team action, not just Orbit's delivery of code or outreach. Each proposed payment is below one quarter of the total grant. The amounts are a provisional allocation pending named person-week estimates, the venue commitment, and a security-review quote.

### Milestone 1 — Specification and Daml Proof

**Delivery:** End of Week 3  
**Funding:** 400,000 CC — engineering

Deliverables:

- order schema and normative TWAP specification;
- Daml parent, slice, partial-fill receipt, and summary contracts;
- pinned CIP-0112 packages and committed-allocation flow;
- LocalNet RFQ fixture and privacy matrix;
- at least 25 Daml and integration tests;
- one-command demonstration covering approval, allocation, two fills, settlement, cancellation, and expiry.

Acceptance:

- quantity, price, fee, payment-budget, allocation, time, and authorization violations are rejected;
- one slice settles through at least two partial fills without overfill;
- a venue cannot query the parent total or unrelated slices;
- the pre-identified venue target, its usable extension points, and the asset/settlement compatibility assumptions are documented against maintainer feedback.

### Milestone 2 — Executor and Operational Safety

**Delivery:** End of Week 6  
**Funding:** 450,000 CC — engineering

Deliverables:

- TypeScript executor and PostgreSQL persistence;
- locking, retries, participant-scoped deduplication, and reconciliation;
- current-state rebuild and audit export;
- CLI and adapter conformance suite;
- structured logs, metrics, and operations guide;
- at least 40 additional executor and failure-injection tests.

Acceptance:

- identical inputs and clock values produce identical decisions;
- restart tests before and after ledger submission create no duplicate committed fills;
- skipped intervals, bounded catch-up, partial fills, cancellation, expiry, and residuals produce the expected summary;
- current state can be rebuilt from active contracts, receipts, and retained updates after deleting the local executor database.

### Milestone 3 — Public Integration, UI, and Security Review

**Delivery:** End of Week 8  
**Funding:** 445,000 CC — engineering

Deliverables:

- one adapter to the named Canton venue or settlement workflow;
- LocalNet integration and dependency-gated TestNet demonstration;
- CIP-0103 wallet approval flow and reference UI;
- independent security review and remediation report;
- v1.0 packages, integration guide, and twelve-month maintenance plan.

Acceptance:

- the end-to-end demo covers approval, allocation, at least five intervals, partial fills, a skipped interval, restart, cancellation or expiry, and final audit export;
- executable prices and quantities come from venue-authorized contracts and committed Token Standard events;
- the selected venue is integrated through documented extension points;
- critical and high review findings are remediated;
- the system works with static JSON and without Orbit services or an LLM.

### Milestone 4 — First Independent TestNet Pilot

**Delivery:** Target end of Week 12  
**Funding:** 250,000 CC — adoption

The funded work covers partner onboarding, adapter support for the agreed workflow, pilot operations, issue resolution, and a reproducible evidence package. It does not fund trading capital, liquidity, referrals, or payment for endorsements.

Deliverables:

- one named team independent of Orbit operates or directly supervises a TestNet pilot using its own documented venue or settlement workflow;
- a partner-specific integration guide and repeatable runbook, using the released public toolkit rather than an Orbit-only fork;
- a pilot report that identifies the released package and adapter versions, supported asset, quote and settlement interfaces, number of scheduled intervals, partial-fill and cancellation results, and any deviations from the expected privacy model;
- a link to the independent team's public acknowledgment of what it tested, or a committee-reviewable attestation where publishing its identity or transaction details is not permitted.

Acceptance:

- the pilot completes at least one bounded parent order over five scheduled intervals, including a partial fill, a skipped interval, and cancellation or expiry, with ledger-derived reconciliation;
- the independent team can reproduce the run from published instructions or a private runbook supplied to the committee;
- the partner confirms in its own words which need the toolkit addressed and what still blocks production use;
- Orbit-only demonstrations, feedback calls, waitlist signups, and unconfirmed partner mentions do not count.

### Milestone 5 — Second Independent Adoption and Maintenance Handoff

**Delivery:** Target end of Week 18  
**Funding:** 305,000 CC — adoption

The funded work covers a second team's onboarding and integration support, generalization of integration documentation and conformance tests from both pilots, issue triage, and maintenance handoff. The second team must be independent of Orbit and of the first pilot team.

Deliverables:

- a second independent team completes an integration or reproducible TestNet pilot for a concrete supported workflow;
- a public integration package comprising adapter documentation, deployment and security notes, conformance results, and a record of pilot-discovered fixes;
- an adoption report distinguishing contacted, interested, evaluated, integrated, and independently operated teams, with evidence links and no unconfirmed endorsements;
- a published twelve-month maintenance schedule with issue response and compatibility-update responsibilities.

Acceptance:

- the second team confirms the use case and can run at least one approved, bounded scheduled order through the public release and its own compatible workflow, with a ledger-derived result;
- at least two independent teams in total have produced reviewable integration or pilot evidence by the end of this milestone; neither may be Orbit or a controlled affiliate;
- the published conformance suite covers the integration differences surfaced by the two teams, and critical or high security regressions are resolved;
- the committee can verify the evidence without access to proprietary Orbit services or sensitive parent-order details.

The partner's decision to continue into production is outside Orbit's control and is not represented as a guaranteed outcome. If an external partner withdraws, Orbit must present a replacement with comparable compatibility and independence for committee approval; outreach alone does not satisfy the milestone.

The second team may reuse the same named venue adapter. A second venue, new execution algorithm, production deployment, or MainNet trading is not required for Milestone 5.

## Funding and Cost Basis

| Milestone | Category | Payment | Share of total |
| --- | --- | ---: | ---: |
| Milestone 1 — Specification and Daml proof | Engineering | 400,000 CC | 21.6% |
| Milestone 2 — Executor and operational safety | Engineering | 450,000 CC | 24.3% |
| Milestone 3 — Integration, UI, and security review | Engineering | 445,000 CC | 24.1% |
| **Engineering subtotal** | | **1,295,000 CC** | **70.0%** |
| Milestone 4 — First independent TestNet pilot | Adoption | 250,000 CC | 13.5% |
| Milestone 5 — Second independent adoption and handoff | Adoption | 305,000 CC | 16.5% |
| **Adoption subtotal** | | **555,000 CC** | **30.0%** |
| **Total** | | **1,850,000 CC** | **100.0%** |

The adoption budget pays for the proposer team's integration support, onboarding, pilot operations, reusable guidance, and evidence production tied to independently verified outcomes. It is not an allocation to pay other teams to endorse the proposal. Before resubmission, Orbit will attach:

- named contributors, person-week allocation, and a cost breakdown for each engineering and adoption milestone;
- the named venue's integration commitment, public interface evidence, and asset/settlement compatibility assessment;
- the independent builder feedback and evidence register described above;
- an independent security-review quote;
- a dated CC/USD reference used for cost comparison and a plan for handling material price changes if the timeline moves beyond six months.

The budget reallocation does not establish that the original engineering scope can be delivered safely for 1,295,000 CC. Before resubmission, the named contributors and reviewer must validate this estimate. If it is insufficient, Orbit will reduce nonessential scope, revise the schedule, or submit a newly justified total while preserving an approximately 30% outcome-based adoption share; it will not silently move safety-critical work into the adoption category.

No funds are requested for proprietary Orbit development, LLM training, liquidity, trading capital, validator rewards, or transaction incentives.

## Non-Overlap

| Existing work | Difference |
| --- | --- |
| Reference DEX and settlement projects | They provide venue and settlement primitives. This project provides scheduled parent/child execution above one venue. |
| RFQ aggregators | They compare and route across venues. This project uses one configured venue and does not rank quotes. |
| Agent automation and control-plane projects | They provide generic tasks, policies, and approvals. This project starts after approval and implements one financial execution workflow. |
| Wallet and dApp SDK projects | This project consumes CIP-0103 and existing signing infrastructure; it does not build a wallet. |
| Event gateways and simulation projects | This project consumes them when available; it does not expose a general gateway or simulator. |

The new public contribution is the combined Daml state model, partial-fill TWAP semantics, selective slice disclosure, deterministic executor, venue-adapter conformance suite, and recovery corpus.

## Risks and Dependencies

| Risk | Mitigation |
| --- | --- |
| CIP-0112 packages are unavailable on TestNet | Pin LocalNet packages; make TestNet acceptance conditional and require committee approval for a revised target. |
| Named venue cannot compose the required settlement | Validate extension points before submission; do not count the reference fixture as a real venue integration. |
| Eight weeks is too short | Start only after three engineering workstreams and the auditor are confirmed; otherwise revise the schedule. |
| Historical events are pruned | Preserve active summaries and fill receipts; document PQS and archival requirements. |
| Retry creates duplicate off-ledger execution | Require stable client execution IDs and reconciliation; do not claim exactly once for unsupported venues. |
| Parent intent leaks through transaction design | Test party views and reject a venue design that requires parent disclosure; document timing inference. |
| Scope expands into routing or a venue | Limit v1 to one deterministic strategy and one venue per order. |
| Suggested projects have no scheduled-execution need or use incompatible derivatives/prediction-market settlement | Record their responses as feedback, not endorsements; secure a compatible named venue and independent use case before resubmission. Do not expand v1 to fit an incompatible product without a reviewed scope and budget change. |
| Partner withdraws or cannot reproduce a pilot | Do not claim an adoption payment for outreach alone; propose a comparable replacement to the committee, with the same independent acceptance evidence. |
| LocalNet fixture is mistaken for external adoption | Require a named non-Orbit team, its own compatible workflow, TestNet run evidence, and its acknowledgment or committee-reviewable attestation. |

## Maintenance and Adoption

Orbit will maintain the repository for twelve months after Milestone 3, including security fixes, release notes, issue triage, supported Daml and Token Standard compatibility, and review of community adapters. The maintenance owner, response targets, and person-week allocation will be named in the final cost basis. Maintenance and external adoption will be reported separately; a maintenance release by Orbit is not an independent adoption event.

### Partner Engagement and Evidence Plan

Orbit will invite Rocky, ibex, Canborsa, and Unhedged through verified team contacts and, where available, tag confirmed GitHub representatives in the [proposal PR](https://github.com/canton-foundation/canton-dev-fund/pull/685). Orbit will ask each team:

1. whether it has a current or planned need to execute one approved large order in bounded slices over time;
2. which asset, order, quote, and settlement interfaces it actually uses, and whether Token Standard V2 committed allocations and atomic settlement are compatible;
3. what privacy, custody, compliance, cancellation, and audit requirements a reusable executor must meet;
4. whether it is willing to provide public design feedback, review an adapter, or operate a TestNet pilot, with the team's exact commitment recorded.

Orbit will publish the outreach date, response link and evidence level in the table above. An unanswered invitation stays "awaiting response"; a general positive comment stays "feedback" until a technical use case and commitment are confirmed. A team may decline without affecting how its public product is described. The named venue and pilot team will be selected for technical compatibility rather than for the number of project names mentioned.

The adoption report will use the following noninterchangeable statuses: **contacted**, **need confirmed**, **technical fit confirmed**, **pilot committed**, **pilot completed**, and **integrated**. Advancement requires a link to the corresponding team statement, technical interface evidence, or reproducible run. No website traffic, social engagement, or Orbit-only usage will be presented as ecosystem adoption.
