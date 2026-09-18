# Pinnaccle DCA - Open Recurring Trading Infrastructure for Canton

**Author:** Ecem K., co-founder of Pinnaccle; ecem@pinnaccle.xyz

**Applicant:** Individual

**Status:** Submitted; seeking champion

**Created:** 2026-09-18

**Champion:** Needs Champion

**Proposed alignment:** RFP 13, Payments and DeFi

**Label / SIG:** financial-workflows-composability / Financial Workflows & Composability

**Funding request:** 1,000,000 CC (proposed)

**Duration:** 24 weeks delivery; 12 months maintenance from the audited release targeted for weeks 18-20, approximately 16-17 months overall

## Abstract

Pinnaccle's DCA product lets users schedule recurring purchases on Canton within limits they authorize, without handing over their wallet keys. Its implementation brings together spending controls, scheduled execution, settlement tracking and cancellation. We propose to turn that work into open infrastructure that other Canton wallets and financial applications can operate themselves.

Pinnaccle has MainNet execution evidence through its execution integration, linking order creation to delivery confirmation, a slot receipt and mandate advancement. The grant will extract and harden this implementation into reusable Daml components, a deployable execution service and a TypeScript SDK, supported by independent security review and external integrations.

The result should let another team add recurring trading without rebuilding the relationship between user permission, committed funds and completed purchases. Use of the open components will require neither a Pinnaccle account nor a commercial agreement with Pinnaccle.

## Motivation

Tokenized assets need useful ways to reach and serve holders alongside issuance infrastructure. DCA gives users a simple way to make scheduled purchases instead of returning to sign every trade. Wallets can embed that experience; asset platforms can offer recurring acquisition of compatible assets.

Pinnaccle has already brought those concerns together in one application. Opening the underlying implementation gives other teams a foundation for recurring asset purchases while retaining their own interface and customer relationship. The initial adoption target is two independent application integrations, measured through setup effort, completed workflows and integration outcomes. External participation is not yet committed.

## Specification

### 1. Objective

Enable other Canton applications to run bounded, user-authorized recurring trades and reconcile each execution through settlement, cancellation or an explicit recovery state.

DCA is the reference use case. This proposal does not create a new exchange, liquidity pool or general-purpose automation protocol. It covers one real execution route and an extensible integration boundary, not universal support for Canton assets or venues.

### 2. Existing implementation and evidence

A read-only MainNet review on September 18 confirmed a September 17 execution using Pinnaccle's V2 capacity adapter, compact V3 bridge and integrated execution venue. The queried chain includes order creation, owner-delivery confirmation, a slot receipt and mandate advancement. The [evidence appendix](pinnaccle-recurring-trading-evidence/MAINNET-EXECUTION-EVIDENCE.md) records the deployed Daml package identities, update IDs and verification limits.

Two subsequent consecutive slots, scheduled three hours apart, were also queried directly from the ledger. Both created executed receipts and advanced the same mandate through revisions 2 and 3. The appendix distinguishes these ledger observations from operational logs and records the observed runtime image; reproducible backend source-to-binary provenance remains open.

| Existing component | Grant-funded work |
|---|---|
| Daml capacity authorization, reservation, completion and release choices | Extract reusable mandate/capacity logic from application-specific trading types; document and test enforcement |
| Java/Spring execution service and slot identities | Separate private tenant, account and prepaid-fee dependencies; publish persistence, identity and execution interfaces |
| Route and release services with application tests | Package one independently accessible TestNet route and portable recovery fixtures |
| Application integration code | Build a standalone TypeScript SDK, signing example and minimal reference interface |

The current capacity package depends on the application trading package. Publishing its DAR alone would therefore not deliver an independently usable toolkit. Existing MainNet functionality is our starting point; portability, the public SDK, external security review and independent adoption are the new work.

### 3. Implementation mechanics

The release will retain Java/Spring for the reference execution service and Daml for ledger logic. The TypeScript SDK will prepare requests and expose state to integrating applications; it will not store user keys or replace existing ledger clients.

The workflow is:

1. The user authorizes a finite mandate with instruments, recipient, executor, spending limits, schedule, expiry and price protection.
2. The execution service identifies an eligible slot and checks mandate state.
3. A route prepares and submits the allocation-backed trade.
4. Reconciliation links the outcome to that slot, updates remaining capacity and exposes a receipt.
5. Cancellation stops new eligible work; committed funds remain tracked until their outcome or release is established.

The public route interface will distinguish preparation, submission, reconciliation and release. Pending or unknown outcomes will remain visible rather than collapse into a success flag.

**Authority.** The [authority and deployment appendix](pinnaccle-recurring-trading-evidence/TECHNICAL-READINESS.md) separates observed contract checks from operator responsibilities. Capacity enforces spending and due-slot constraints; route and quote selection also involve operator-supplied inputs. The funded release will document and test these operator trust assumptions alongside user key control. The execution service must not acquire users' signing credentials or unrestricted authority to act as them. Per-slot and aggregate spending, trading assets and fees use separate accounting and explicit rounding rules.

**Scheduling and recovery.** Slot identity incorporates mandate version and schedule. Missed windows are skipped, not replayed as a purchase backlog. Durable claims, ledger guards and command deduplication prevent duplicate economic completion for a slot. A timeout triggers reconciliation before another submission decision; bounded retries and operator procedures handle unresolved work. These safeguards do not control a venue's internal retry worker or guarantee network availability.

**Settlement.** Submission acknowledgement alone does not complete a slot. Completion requires authorized ledger evidence of the intended economic outcome. Delivery-versus-payment (DvP) execution and subsequent receipt/reconciliation stages will have their atomicity boundaries documented per route; the entire lifecycle is not represented as one atomic transaction.

**Cancellation.** Cancelling future activity does not reverse an in-flight trade. Release procedures reconcile outstanding allocations under the relevant token and route authority. Where automated recovery is unsupported, the operator procedure must explain the remaining commitment.

**Compatibility and privacy.** Releases will pin tested Canton, Daml, Splice, token and venue packages. New assets require receiving permissions, eligibility checks and route validation. Private evidence is obtained through authorized participant interfaces; correctness must not depend on a public explorer exposing it. Public reproductions use test identities or consented disclosures.

### 4. Architectural alignment and reuse

The proposed RFP 13 contribution is reusable financial workflow tooling. We will retain Canton's authorization and disclosure model and use Token Standard interfaces and existing client libraries where suitable. Component review will identify what can be reused or extended before implementing replacements; work already delivered or funded elsewhere is excluded.

A proprietary DCA app would not provide this shared capability. A scheduler alone would leave allocation, uncertain outcomes and cancellation to each integrator. A generic authorization component can be a dependency, but still needs a tested trading workflow. The grant focuses on that complete workflow rather than duplicating underlying standards.

Featured App approval and reward entitlement are not prerequisites.

### 5. Backward compatibility

Adoption is opt-in. The toolkit does not automatically migrate existing production mandates. Releases include versioned interfaces and migration instructions; expanded authority requires new user authorization. Pending trades must be reconciled before switching execution paths.

## Milestones and Deliverables

Delivery spans 24 weeks from the project start date agreed with the Foundation following funding approval. The schedule assumes two founders each contributing five working days per week. All week numbers below are measured from that date. Maintenance begins upon M4 acceptance. The first two weeks include a technical walkthrough of the existing implementation and execution evidence. Independently runnable authorization is targeted for week 3, followed by two settled TestNet executions by week 6. Payments follow acceptance; completed milestones may be submitted early. Audit scheduling and independent integration participation must be confirmed; changes to agreed dates require committee agreement.

| Milestone | Target | Acceptance outcome | CC |
|---|---|---|---:|
| M1: Reusable authorization | Week 3 | Reviewer builds the public mandate slice and uses a local ledger example to authorize, reject over-limit activity and cancel without private Pinnaccle services; enforcement and prerequisites documented | 80,000 |
| M2: Independent route execution | Week 6 | Reviewer runs the extracted service on the agreed real TestNet route, settles two slots and reconciles remaining capacity; setup report and outcome linkage published | 170,000 |
| M3: SDK, recovery and operational portability | Week 12 | Independent evaluator integrates the SDK in a separate example application and reproduces cancellation/release, duplicate notifications and lost-response recovery; restores persisted state into a clean deployment and resumes safely; stale-dependency and uncertain-outcome runbooks reproduced; threat model and audit scope published | 300,000 |
| M4: Audited release | Weeks 18-20 | Independent audit and retest published, no unresolved Critical/High findings, security regressions reproduced and release versions pinned | 150,000 |
| M5: External adoption | By week 24 | Two unaffiliated teams integrate into their own applications, each demonstrating multi-slot settlement and cancellation; one conducts a 14-day TestNet evaluation | 150,000 |
| M6: Maintenance | 12 months from M4 acceptance | Quarterly compatibility, regression, security-triage and handover reports | 150,000 |
| **Total** | | | **1,000,000** |

M5 pays 75,000 CC per accepted integration; M6 pays four quarterly installments of 37,500 CC following acceptance of each completed maintenance period. Adoption is demonstrated by integration into another team's application, supported by consented technical evidence; reproducing the reference example alone does not qualify. Paid evaluation and conflicts will be disclosed. Unachieved adoption outcomes remain unpaid unless the committee approves an amendment.

The payment split and TestNet adoption criteria are proposed for committee agreement. Unaudited releases are for controlled testing, not public production use.

## Acceptance Criteria

The portable release must build and run without private Pinnaccle repositories, accounts or secrets. An integrating application must authorize a finite plan, complete at least two eligible executions, reconcile remaining capacity and cancel future activity.

| Scenario | Required outcome |
|---|---|
| Budget exhaustion, expiry or wrong instrument/recipient/executor | Applicable enforcement rejects unauthorized activity without corrupting accounting |
| Concurrent workers or duplicate notifications | No duplicate economic completion for a slot |
| Lost acknowledgement or restart | Existing work reconciled before resubmission |
| Delayed or rejected settlement | No false completion; bounded retry or explicit intervention state |
| Cancellation during pending execution | Defined ordering and visible outstanding commitment |
| Missing permission or stale dependency | No unsafe fallback; documented recovery |
| Fees and precision | Asset-specific accounting and rounding; no mixed-currency totals |

Acceptance reports identify tested versions, environment, expected and observed results, and known limitations. Real TestNet execution is required alongside fault-injection tests. One route plus a fixture does not establish multi-venue compatibility.

## Funding

**Proposed request: 1,000,000 CC, including audit, retest and maintenance.**

| Budget allocation | CC |
|---|---:|
| Core engineering, SDK, testing, documentation and integration support | 613,000 |
| Independent security audit and retest | 183,000 |
| Twelve-month maintenance | 148,500 |
| Infrastructure and release tooling | 55,500 |
| **Total** | **1,000,000** |

These are proposed allocations, not supplier quotations. The independent audit and retest allocation is provisional, not a supplier quotation. Before funding approval, written quotations will establish the scope, price, retest coverage and auditor availability. If confirmed costs exceed the allowance, a revised funding request or allocation will be submitted for committee agreement before approval. Engineering includes remediation; the independent audit allocation covers external review and retesting. Funding excludes prior product development, commercial acquisition and live trading capital.

Cost allocations describe use of funds; the milestone table defines payments. M1-M2 account for 25% of the request and M1-M3 for 55%, payable upon acceptance. No advance is requested.

### Volatility stipulation

The grant will be denominated in fixed CC and re-evaluated at the six-month mark. Changes to remaining milestones or funding require committee agreement, not an automatic increase.

## Team, Licensing and Maintenance

**Ecem K.** (ecem@pinnaccle.xyz) leads architecture, execution integration, releases and maintenance, including security-remediation coordination. **Gamze** (gamze@pinnaccle.xyz) supports testing, reproducibility, documentation, integration onboarding and maintenance triage.

Original grant-funded Daml components, service, SDK and tests will be released under Apache-2.0. Third-party terms remain applicable and redistribution rights must be confirmed. Pinnaccle's commercial interface, customer data and unrelated systems are excluded. Proposal text follows the repository's CC0-1.0 terms.

Maintenance covers supported-version compatibility, regression testing, dependency updates and security triage for 12 months from M4 acceptance. The first-response target is five business days; this is not a resolution guarantee or 24/7 service. The release includes handover documentation, and continued use does not require paid Pinnaccle services.

## Dependencies and Delivery Risks

Independent TestNet route access and redistribution rights must be confirmed before the execution milestones. Existing commercial access does not automatically extend to other teams. Extraction effort needs technical validation against the selected source boundary; audit availability and adopter schedules can affect delivery.

Before funding approval, we will agree independent evaluation availability and candidate adopter participation plans. If access, audit or adoption assumptions cannot be secured, scope and acceptance dates must be revisited with the committee. Network or venue liveness remains outside Pinnaccle's control.

## Co-Marketing

With Foundation coordination, Pinnaccle will publish a technical walkthrough, hold an integration workshop and share consented integration case studies. These materials will explain deployment and operational lessons, without implying endorsement of the commercial app.

## References

- [Pinnaccle technical documentation](https://tech.pinnaccle.xyz/)
- [MainNet execution evidence](pinnaccle-recurring-trading-evidence/MAINNET-EXECUTION-EVIDENCE.md)
- [Authority and independent deployment](pinnaccle-recurring-trading-evidence/TECHNICAL-READINESS.md)
- [Development Fund roadmap](https://github.com/canton-foundation/canton-dev-fund/blob/main/2026-2028-strategic-roadmap.md)
- [Proposal template](https://github.com/canton-foundation/canton-dev-fund/blob/main/proposals/_template.md)
- [RFP submission guidance](https://github.com/canton-foundation/canton-dev-fund/blob/main/rfps/README.md)
- [Review process](https://github.com/canton-foundation/canton-dev-fund/blob/main/Development%20Fund%20Proposal%20Review%20Process.md)
