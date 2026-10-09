# Pinnaccle DCA - Open Recurring Trading Infrastructure for Canton

**Author:** Ecem K., co-founder of Pinnaccle; ecem@pinnaccle.xyz

**Applicant:** Individual

**Status:** Submitted; seeking champion

**Created:** 2026-09-18

**Champion:** Needs Champion

**Proposed alignment:** RFP 13, Payments and DeFi

**Label / SIG:** financial-workflows-composability / Financial Workflows & Composability

**Funding request:** 1,000,000 CC for project milestones, plus a separately approved external audit and retest allowance provisionally estimated at 183,000 CC. Indicative combined request: 1,183,000 CC, subject to an approved audit quotation.

**Duration:** Technical delivery and integration enablement targeted within 24 weeks; independent MainNet adoption claims within six months of M4 acceptance; maintenance for 12 months from M4 acceptance. With audited release at weeks 18-20, the adoption claim window closes approximately 10-11 months after project start and the overall maintenance period ends approximately 16-17 months after project start.

## Abstract

Pinnaccle proposes open recurring-trading infrastructure that Canton wallets and financial applications can use to offer scheduled asset purchases within their own products. Users authorize a finite spending budget and schedule while retaining control of their signing keys. Integrating teams retain their interface and customer relationship rather than directing users to Pinnaccle.

Pinnaccle's existing MainNet implementation provides execution evidence linking order creation, delivery confirmation, slot receipts and mandate advancement. The grant will extract and harden that implementation into reusable Daml components, a deployable Java/Spring execution service and a TypeScript SDK, supported by independent security review and hands-on integration assistance.

The delivered workflow manages each purchase from its authorized schedule through submission, settlement reconciliation and remaining-budget updates. A pending transaction remains tracked rather than being treated as a completed purchase or blindly retried. Cancellation stops future purchases while preserving visibility of outstanding commitments; after a restart, the service reconciles existing work before deciding whether another submission is safe. Wallet teams receive this trading lifecycle as an integrated capability within their own product.

The intended outcome is recurring trading used through independent Canton applications on MainNet. The delivery plan connects requirements assessment and TestNet integration to security review, operational readiness and measured production use. The open components require neither a Pinnaccle account nor a commercial agreement with Pinnaccle; participant, token and venue access remain subject to the relevant providers' requirements.

## Motivation and Target Users

Wallet providers are the primary audience. They can offer recurring purchases alongside their existing asset balances and trading features while reusing authorization, execution and reconciliation components. Financial applications offering scheduled asset acquisition are a second audience.

Tokenization creates assets on the ledger; applications still need usable workflows around them. Pinnaccle addresses recurring purchases of supported assets under finite user authorization, with settlement tracking and recovery. This is the proposed workflow's role, not evidence that any particular issuer or institution has requested the toolkit.

The architecture separates recurring-execution logic from the venue adapter. Initial delivery validates one venue integration end to end; this is not a one-asset or one-pair restriction. The release will publish the tested asset/pair matrix and required permissions. An additional asset using the same adapter requires compatibility and access checks; a new venue adapter or materially different token/signing behavior requires separately agreed scope. Existing app support does not automatically establish support in the portable release.

The best-fit initial teams have an existing Canton signing path and can operate a backend service themselves or through an infrastructure operator they select. A selected operator could be the team's existing backend or participant-hosting provider if that provider agrees to run the service and meets its access and security requirements. The grant provides deployable software and operational documentation, not an assumed managed-service provider or a new hosted service.

Independent operation gives those teams control over deployment, execution policies and integration with their own systems. The benefit is avoiding repeated implementation of bounded authority, pending-settlement handling, cancellation and recovery, not eliminating the need for operations.

The initial adoption target is three qualifying wallet or application integrations, one per unaffiliated organization. Participation is not yet committed. This is an initial target, not a limit on reuse: further teams can use the release subject to its access and compatibility requirements. Existing Pinnaccle activity demonstrates execution feasibility; independent demand and production adoption will be reported separately.

## Adoption and Integration Plan

The adoption objective is three independent applications offering recurring purchases to their users on MainNet. Pinnaccle will support the path from use-case assessment and TestNet onboarding to audited-release readiness and bounded production rollout. M5 pays separately for each verified integration; publishing code or completing a demonstration alone does not earn that payment. The stages below explain how teams reach that outcome and what each side contributes.

### Finding and supporting initial integrations

We are in discussions with independent ecosystem teams about integrating recurring trading into their products, with feedback informing the onboarding plan. Confirmed participation and production adoption will be reported separately.

Outreach will assess the need for native recurring purchases, willingness to operate the service and fit with the supported route, rather than solicit general endorsements. Evaluation interest and confirmed production use are reported separately. Progress reporting identifies participating organizations and their integration status with consent; prospective teams are not presented as committed adopters. The toolkit is intended for teams seeking integration within their own products, rather than only a hosted API or a link to Pinnaccle.

During M1-M2, Pinnaccle will approach prospective wallet and application teams with a working demonstration and a brief covering signing, hosting and venue requirements. Discussions will identify a concrete recurring-purchase need, integration owner, operator and blockers. Interested teams will be invited to provide design feedback and review acceptance results. Names and participation status will be published with consent; outreach and general endorsements are reported separately from integration commitments.

| Stage | Pinnaccle deliverable/support | Adopter contribution and evidence |
|---|---|---|
| Assessment, M1-M2 | Workflow walkthrough, capability checklist and supported-route requirements | Confirm use case, signing path, operator and unresolved dependencies in an integration brief |
| Independent technical evaluation, M2-M3 | Route setup instructions, SDK example and recovery procedures, with evaluator integration complete by week 12 | Independent evaluator runs a separate application and records settlement, restart/reconciliation and cancellation results; this proves portability, not customer demand |
| Prospective adopter onboarding, through week 24 | Requirements-led setup and TestNet troubleshooting for the three target integrations | Participating teams validate their own signing and operational paths; participation and blockers are reported separately from evaluator results |
| Readiness, M4 | Audited release, version manifest, permissions and operating checklist | Confirm MainNet access, monitoring, backups, responsibilities and launch decision |
| MainNet, M5 | Bounded rollout troubleshooting and evidence support | Demonstrate recurring use and confirm the results against the M5 conditions |

### Adopter onboarding and production rollout

The target is three independent organizations, not three accounts or applications controlled by one organization. Outreach focuses on wallets and financial applications with an identified recurring-purchase use case, an integration owner and a supported signing and operating path. No team is represented as committed before it confirms participation.

For each participating team, Pinnaccle supplies an integration brief, responsibilities and dependency checklist; a SDK/signing walkthrough; setup and TestNet troubleshooting; cancellation and restart/reconciliation exercises; and a production-readiness review. The adopter confirms its use case, product integration, operating owner and launch decision. Production onboarding follows the audited release and the team's readiness checks.

During the M5 observation period, support covers deployment issues, reconciliation of slot outcomes, documented interventions and evidence preparation. Progress reports distinguish outreach, active evaluation, TestNet completion, production launch and accepted adoption, with blockers and next actions. A stalled prospect can be replaced within the existing window; replacement does not relax independence or usage criteria or automatically extend deadlines.

### Who operates what

The adopter supplies its product interface, customer consent, compatible signing path, own or hosted participant access, traffic funding and token/venue eligibility. The adopter or its selected operator runs the service, database, operator credentials, monitoring and backups. Pinnaccle supplies the reusable components, deployment guides, recovery procedures and integration support for the three target integrations.

The wallet-facing SDK and reference application will use CIP-0103-compatible wallet connectivity for user authorization, reusing existing Canton tooling where suitable. M1 specifies the supported methods, wallet/signing path and tested versions. M3 demonstrates connection and mandate authorization through at least one independently operated compatible wallet from a separate application, including user rejection, missing authorization and disconnection handling. User signing keys remain with the signing provider. CIP-0103 connectivity does not itself grant recurring-execution authority: the finite mandate and ledger enforcement provide that boundary. Compatibility with every wallet connector is not implied. Additional adapter development or venue support by Pinnaccle requires agreed scope changes; independent teams can implement their own adapters against the published interface.

Support includes a requirements walkthrough, setup/signing examples, TestNet troubleshooting, readiness review and evidence assistance. It excludes unlimited custom features, custody and 24/7 operation. Documentation and the independent evaluator integration are M3 deliverables at week 12. Prospective adopter TestNet onboarding targets week 24 and may begin earlier; this later target does not defer M3 acceptance requirements. Each adopter must complete its own readiness checks before production launch. Bounded launch/evidence support continues through the M5 claim window and is included in the proposed scope.

### Independent Technical Verification

M3 verifies that a developer outside the implementation team can deploy the released components and run the recurring-purchase workflow using its own authorized test identities. This is technical evaluation, not a customer commitment. The clean-environment procedure and evidence requirements are retained in [Appendix A](#appendix-a-reference-integration-and-portability-evidence).

### Progress reporting

Each milestone report records contacted teams, evaluating teams, TestNet integrations and verified MainNet adopters separately, with integration effort, blockers, feedback and the next step. Confirmed participants are invited to confirm their integration and milestone results publicly; sensitive transaction evidence is shared only with authorized reviewers. Self-attestation by Pinnaccle alone does not establish adoption.

M2 acceptance is based on technical deliverables and the progress report; customer commitments are not required. M3 verifies independent technical usability, while M5 rewards verified MainNet adoption. Outreach results guide support priorities without creating an additional approval gate. Changes to agreed scope, budget or schedule follow the change-control process.

Independent route access and licensing are checked during design. Pinnaccle's venue access is not transferable by assumption. A team's MainNet rollout requires confirmed production permissions and resolved security gates; TestNet onboarding can proceed earlier in parallel with hardening.

## Milestones and Proposed Payments

Weeks run from the project start agreed with the Foundation. Partner integration and auditor availability are dependencies of the delivery schedule. Completed deliverables may be submitted early. Project payments are tied to accepted outcomes, not billed hours; audit procurement has the distinct proposed process below.

| Milestone | Target | Acceptance outcome | CC |
|---|---|---|---:|
| M1: Reusable authorization and integration design | Week 3 | Public mandate slice builds and runs on a local ledger; tests reject excess authority and demonstrate cancellation without private Pinnaccle services. Finalize the reference integration and dependency/access plan. Publish signing/operator boundaries, CIP-0103 wallet test path, initial asset/pair test matrix and initial adoption progress report. | 70,000 |
| M2: Independent route execution | Week 6 | Extracted service settles two slots on the agreed real TestNet route and reconciles capacity. Publish setup evidence and permitted dependency installation instructions, with an integration progress report. Adopter participation or commitment is not required for acceptance. | 90,000 |
| M3: SDK, recovery and operational portability | Week 12 | Independent evaluator completes the clean-environment exercise in Appendix A, building both backend and Daml components, integrating the SDK in a separate application, demonstrating CIP-0103 authorization with at least one independently operated compatible wallet, and verifying cancellation/release, prevention of duplicate economic execution and lost-response recovery; restores persisted state and resumes safely. Publish evaluator-confirmed reproduction evidence, signing example, stale-dependency runbooks, threat model, audit scope and source/build traceability for the candidate release. | 170,000 |
| M4: Audited production-ready release | Weeks 18-20 | Independent audit and retest delivered; no unresolved Critical/High findings in the agreed scope; security regressions reproduced, release versions pinned and production operating/readiness documentation published. | 90,000 |
| M5: Independent MainNet adoption | Within six months of M4 acceptance | Three qualifying independent integrations at 150,000 CC each, plus 50,000 CC for the accepted consolidated adoption evidence and reusable materials after all three qualify. | 500,000 |
| M6: Maintenance | 12 months from M4 acceptance | Four evidenced maintenance periods meeting the M6 criteria below, including supported-version tests, issue/security handling and release or no-change evidence; 20,000 CC per accepted period. | 80,000 |
| **Project milestone total** | | | **1,000,000** |
| A1: External audit and retest procurement | Approved auditor schedule | Separate cost-only allowance, against approved scope, quotation and engagement/payment schedule; paid by the arrangement below. | 183,000 (provisional) |
| **Indicative combined request** | | Subject to the approved audit quotation. | **1,183,000** |

### M5: evidence required for each integration

Each of up to three organizations must be independent of Pinnaccle and of each other. It integrates the released components into its own wallet or application and operates a genuine MainNet recurring-purchase workflow. A selected infrastructure provider may operate the backend; the organization remains responsible for its integration and user workflow.

Acceptance requires:

- A live recurring-purchase feature integrated into the adopting organization's own production product, with a dated release/deployment record and evidence of genuine operational use. A standalone test or unchanged reference demo is not sufficient.
- At least 30 days of production observation beginning with the first qualifying execution, including successful settlement at multiple distinct scheduled due times under genuine user-authorized recurring plans. Extend the observation where the natural schedule requires more time to demonstrate repeated use; monthly schedules need not be accelerated into weekly activity. The complete observation and evidence submission must fit within the M5 claim window unless an amendment is approved. A transaction count alone does not establish adoption: production integration, actual use, operating responsibility and the evidence requirements below must all be met.
- A complete record of all plans and scheduled slot outcomes using this integration during the claimed observation period, with privacy-preserving identifiers: settled, skipped, failed, pending or cancelled, with reasons and recovery/intervention evidence. Report authorized schedules, changes and outstanding commitments rather than selecting only successful transactions. Unexplained missing slots or unresolved safety/accounting discrepancies prevent acceptance until clarified or resolved.
- Authorized ledger evidence linking the application's integration, released components, plan/slots, actual delivery and remaining-capacity reconciliation. Record versions, route, failures and interventions.
- Written confirmation from the adopting team identifying its use case, deployment responsibilities and observed results. The evidence package names the adopting organization and includes its consented confirmation; private ledger records and user data are shared only with authorized reviewers.
- Controlled TestNet evidence for cancellation, pending outcomes and recovery on the integration path. Real users are not required to manufacture financial failures or unnecessary cancellations for acceptance.
- Genuine use independent of Pinnaccle-controlled test identities, circular trades and activity generated solely to trigger a grant payment. Paid evaluation, subsidies and affiliations must be disclosed for Committee assessment. Grant funding supplies no trading capital.

One organization qualifies once, even if it operates several apps. Reproducing an unchanged demo, installing an SDK or directing users to Pinnaccle does not qualify. Featured App status and rewards are not prerequisites. This is a limited initial production-adoption target, not a claim of product-market fit or broad distribution.

Each qualifying integration is payable separately at 150,000 CC upon Committee acceptance. Claims with complete evidence must be submitted within six months of M4 acceptance; subsequent Committee review time does not invalidate a timely claim. Unclaimed amounts expire unless the Committee approves an amendment. Failed adoption does not by itself invalidate previously accepted engineering work or automatically cancel maintenance obligations, subject to the final grant terms.

### M5: cross-integration completion payment

The final 50,000 CC is payable only after all three integrations have been accepted and the Committee accepts a consolidated report covering adopter-confirmed outcomes, release/route versions, observation periods, reconciled execution results, integration effort and remaining limitations. Publish reusable onboarding examples, a troubleshooting guide incorporating adopter issues and consented case studies linked to the accepted evidence. These materials document production learning rather than repeat M3's baseline technical documentation.

This deliverable shares the six-month claim window. If fewer than three integrations qualify, their accepted 150,000 CC tranches remain separately claimable, but the final 50,000 CC is not earned without an agreed amendment.

The M5 window runs concurrently with maintenance and does not restart the maintenance clock. Delays to M4 and resulting downstream dates must be reported and agreed through change control.

## Technical Scope and Existing Evidence

Our MainNet implementation provides execution evidence for capacity-backed order creation, settlement reconciliation, delivery confirmation and consecutive scheduled executions. The funded work extracts Pinnaccle's existing authorization, scheduling and reconciliation logic into reusable components, separating venue-specific execution calls behind a documented adapter interface. M2 and M3 will validate the reference adapter and independent deployment against the documented bounded-spending, settlement-tracking and recovery requirements, building on this existing execution evidence.

The objective is to let an independent application run bounded, user-authorized recurring trades and reconcile each execution through settlement, cancellation or an explicit recovery state. The project covers one validated venue adapter with a documented asset/pair matrix and an extensible execution interface, not a new exchange, liquidity pool or general-purpose automation protocol. The initial test matrix is specified during M1 and its verified coverage published with the release; neither unlimited asset onboarding nor universal token compatibility is promised.

The matrix records the venue/adapter version, token identifiers, pair direction, environment, signing and receiving permissions, precision/fee handling and verification status. A successful test for one pair does not establish support for its reverse direction or another token. M1 specifies the initial matrix for agreement within the funded scope; M2-M4 evidence identifies the rows actually verified. Additional coverage is reported only after validation and is not an implied commitment to unlimited token onboarding.

The funded release includes one open-source reference adapter for a compatible Canton trading interface with permissionless access. Independent operators must be able to deploy and use the reference integration without Pinnaccle-specific agreements or credentials. Tradecraft is used in the existing MainNet implementation and execution evidence; the funded reference deployment will not require Tradecraft's DARs or Pinnaccle's commercial access. This is a delivery requirement, not a claim that the alternative integration is already validated.

M1 finalizes the selected integration, asset/pair matrix, execution and price-protection design, package versions and dependency/access requirements. Permissionless venue access does not imply open-source venue code, unrestricted token eligibility or rights to redistribute third-party packages. Participant access, token permissions, receiving setup and applicable usage requirements are documented separately. A usable acquisition and installation path must be verified before M2 begins. M2 demonstrates real TestNet settlement; each adopter's MainNet readiness is assessed separately.

The public adapter interface and conformance tests cover bounded authorization, per-slot identity, execution evidence, price protection, cancellation and recovery. A submission acknowledgement is not delivery evidence. An interface must satisfy these requirements to qualify as the reference integration, regardless of its access model.

Other teams may implement adapters for their preferred venues using the published execution interface. This does not require Pinnaccle's permission or make those implementations part of the funded delivery. Each alternative adapter must satisfy the documented authorization, settlement-evidence, reconciliation and recovery requirements and undergo its own compatibility and security validation. The grant covers one reference adapter; development or support of additional adapters by Pinnaccle requires separately agreed scope.

A read-only MainNet review on September 18 confirmed a September 17 execution using Pinnaccle's V2 capacity adapter and compact V3 bridge. Two subsequent consecutive slots scheduled three hours apart produced executed receipts and advanced the same mandate through revisions 2 and 3. These observations establish operation, not an independent security audit. Reproducible backend source-to-binary provenance remains open.

The existing PR's [execution evidence](https://github.com/cutepawss/canton-dev-fund/blob/proposal/pinnaccle-recurring-trading/rfps/financial-markets-standards-verification/pinnaccle-recurring-trading-evidence/MAINNET-EXECUTION-EVIDENCE.md) and [authority review](https://github.com/cutepawss/canton-dev-fund/blob/proposal/pinnaccle-recurring-trading/rfps/financial-markets-standards-verification/pinnaccle-recurring-trading-evidence/TECHNICAL-READINESS.md) describe the observed implementation and its limits. Historical evidence is not a claim that the portable release is already available.

| Existing component | Grant-funded outcome |
|---|---|
| Daml capacity and mandate logic | Extract reusable authorization, reservation, completion and release components from application trading types |
| Java/Spring runner and slot identities | Publish execution, identity and persistence interfaces independent of private tenant/account and prepaid-fee services |
| Route and release services | Package the initial venue adapter with a real independently accessible TestNet route, tested asset/pair matrix, recovery fixtures and an adopter-specific MainNet readiness checklist |
| Application integration | Publish a TypeScript SDK, signing example, minimal reference interface and operational guides |

The SDK prepares requests and exposes state; keys remain with the user's signing provider. The current capacity package depends on application trading types, so publishing the existing DAR alone would not deliver independent portability.

The reusable starting point is the existing mandate/capacity implementation, runner, slot identity and settlement/recovery logic described above. The grant funds their extraction and hardening, replacement of private application dependencies with documented interfaces, and the public SDK, reproducible deployment, tests and integration materials needed by independent operators. It does not fund rebuilding the commercial app from scratch. M3's clean-environment evaluation verifies the resulting separation from Pinnaccle's private systems.

### Reproducible backend and Daml release

M3 includes both backend and Daml reproduction, not only contract compilation. Publish source commit IDs, dependency locks, toolchain/runtime versions, build commands, configuration templates without secrets and artifact/package hashes. The independent evaluator builds the backend and Daml components in a clean environment and executes the reference workflow using those artifacts. Record build logs and artifact comparisons; explain any nondeterministic metadata and how source-to-artifact correspondence is verified. A prebuilt image identifier alone does not meet this requirement.

### Authority, execution and safety

1. The user authorizes a finite mandate specifying instruments, recipient, executor, limits, schedule, expiry and price protection.
2. The service checks mandate state and an eligible slot before preparing and submitting an allocation-backed trade.
3. Reconciliation links authorized delivery evidence to the slot, updates capacity and exposes a receipt.
4. Cancellation stops future eligible work while committed funds remain tracked until settlement or release is established.

The funded release will define, enforce, test and audit each advertised mandate-to-route restriction. Current capacity checks enforce spending and due-slot constraints; route, target and quote inputs also involve operator responsibilities. User key control does not imply every operator-supplied input is trustless. The service must not receive user signing credentials or unrestricted authority to act as users. Fees and traded assets use separate units and explicit rounding rules.

Slot identity includes mandate version and schedule. Missed windows are skipped rather than accumulated into a purchase backlog. Durable claims, ledger guards and command deduplication protect against duplicate economic completion. Uncertain submissions are reconciled before any resubmission decision, with bounded retries and documented intervention states. Venue-internal retry behavior and network availability remain external dependencies.

Submission acknowledgement is not completion. Completion requires authorized evidence of the intended delivery. DvP settlement and later reconciliation/receipt stages have documented atomicity boundaries; the whole lifecycle is not represented as one atomic transaction. Cancellation does not reverse an in-flight trade; release follows the relevant token and route authority, including manual intervention where automation is unsupported.

Releases pin tested Canton, Daml, Splice, token and venue versions. New assets require eligibility, receiving permissions and route validation. Evidence is obtained through authorized participant interfaces, without relying on public explorers exposing private transactions. Migration is opt-in; increased authority requires fresh user authorization and pending work must be reconciled before a route switch.

## Technical Acceptance Criteria

The portable release must build and run without access to private Pinnaccle repositories, Pinnaccle accounts or production credentials, or mandatory Pinnaccle-operated paid endpoints. Adopters use their own authorized participant and venue access; third-party hosting, traffic and route charges remain their responsibility. An independent evaluator must authorize a finite plan, settle at least two eligible executions, reconcile capacity and cancel future activity.

| Scenario | Required outcome |
|---|---|
| Budget exhaustion, expiry or wrong instrument/recipient/executor | Applicable enforcement rejects unauthorized work without corrupting accounting |
| Concurrent workers or duplicate notifications | No duplicate economic completion for a slot |
| Lost acknowledgement or restart | Existing work reconciled before resubmission |
| Delayed or rejected settlement | No false completion; bounded retry or explicit intervention state |
| Cancellation during pending execution | Defined ordering and visible outstanding commitment |
| Missing permission or stale dependency | No unsafe fallback; documented recovery |
| Fees and precision | Asset-specific accounting and rounding; no mixed-currency totals |

Reports state environment, versions, expected/observed results and limitations. Real TestNet settlement accompanies fault-injection tests; a fixture is not multi-venue proof. MainNet adoption has the separate M5 evidence gate.

## Funding and External Audit Arrangement

The project milestone request is 1,000,000 CC. M1-M4 allocate 420,000 CC to reusable contracts, execution services, SDK, tests, documentation, release infrastructure, integration enablement and internal security remediation. M5 allocates up to 500,000 CC to independently verified MainNet adoption, including bounded rollout and evidence support. M6 allocates 80,000 CC to twelve months of maintenance. These are outcome-based payment allocations, not hourly billing or a claim that each allocation equals an external invoice.

Adoption accounts for 50% of the 1,000,000 CC project milestone budget. The external audit is a separate provisional procurement allowance. Technical integration tests, outreach and maintenance do not qualify for adoption payments.

External audit and retest are provisionally budgeted at 183,000 CC, additional to the project milestones. The final amount requires a written quotation covering scope, report, retest, currency, taxes and payment dates, with Committee approval of the auditor and scope. We propose Foundation-direct payment to the approved auditor or dedicated audit funds released before the approved invoices fall due, avoiding vendor pre-financing from engineering payments. This payment arrangement is proposed for agreement.

Audit procurement does not itself constitute acceptance of M4. M4 still requires the report, retest and remediation outcomes. Pinnaccle's remediation engineering remains within development scope; A1 covers external vendor costs only. Unused audit allowance is not an engineering payment: undisbursed amounts remain unclaimed and any unspent advance is returned or reconciled under the agreed grant process. Costs above the approved allowance, including exchange-rate exposure, require agreement before additional expenditure is committed.

M1-M3 payments total 330,000 CC and M1-M4 total 420,000 CC, payable on acceptance. Integration support starts during technical delivery; M5 payment separately requires demonstrated adoption.

Evidence submission, deficiency handling and payment processing follow the agreed Foundation process; no automatic acceptance or unilateral payment deadline is claimed. Funding excludes prior commercial product development, commercial acquisition and live trading capital. The fixed-CC grant is reviewed at six months; changes to remaining scope or funding require Committee agreement.

### Budget Rationale and Existing vs. Funded Work

The change from the original request is explicit:

| Budget view | Original all-inclusive request | Revised request | Difference |
|---|---:|---:|---:|
| Project allocation excluding external audit | 817,000 CC | 1,000,000 CC | +183,000 CC |
| External audit planning allowance | 183,000 CC, within original total | 183,000 CC, additional to project total | No change in provisional vendor allowance |
| Combined request | 1,000,000 CC | 1,183,000 CC | +183,000 CC (18.3%) |

The original request reserved 183,000 CC within the milestone envelope for the auditor. This revision requests the full 1,000,000 CC for project outcomes, including the supported MainNet integration path, with external vendor fees separately funded. It is an 18.3% increase in the combined request, not an accounting-only change. The amounts below are proposed fixed-price payments for accepted outcomes; the audit line remains subject to quotation and approval.

The request is structured as fixed-price milestones. Existing Pinnaccle code and execution evidence provide the starting point; funding pays for the work needed to make those components independently deployable, testable, supportable and usable through other applications. The milestone amounts cover the associated implementation, testing, documentation and release work together, rather than separate charges for each activity.

| Milestone / allocation | Existing starting point | Funded work and basis for the allocation |
|---|---|---|
| M1 - 70,000 CC | Application-linked mandate and capacity logic | Separate the reusable authorization boundary from private application types; specify signing and operator responsibilities; demonstrate bounded authority and cancellation in a reproducible build. |
| M2 - 90,000 CC | A route and runner operated within Pinnaccle | Extract service and persistence interfaces; establish independently accessible route dependencies; demonstrate real TestNet settlement and reconciliation with installation instructions. |
| M3 - 170,000 CC | Internal integration and recovery behavior | Deliver the public SDK and signing example, clean-deployment recovery, fault and duplicate-submission tests, build traceability and evaluator-led integration. This is the largest technical allocation because it brings the contract, service, persistence and client boundaries together into an independently reproducible release candidate. |
| M4 - 90,000 CC | Candidate produced by M1-M3 | Coordinate the review, implement in-scope security fixes and regression tests, pin release dependencies and complete operational readiness documentation. External auditor fees are covered only by A1. |
| M5 - up to 500,000 CC | Integration examples and readiness materials | Support three independent teams through bounded production rollout and verify sustained MainNet use. Each 150,000 CC tranche requires that integration's acceptance. The final 50,000 CC requires all three accepted integrations and the consolidated production-learning deliverables. |
| M6 - 80,000 CC | Accepted portable release | Maintain supported-version compatibility, dependencies and regression coverage; provide security triage and quarterly reports for twelve months. This covers ongoing upkeep, while M5 covers initial integration and adoption evidence. |

Build/test infrastructure, release tooling and technical documentation are included in the relevant milestone amounts. Adopters fund their own production operations and transactions. The initial scope covers one validated venue adapter, its agreed asset/pair test matrix and three target application integrations. Additional venues, custom connectors, materially different token behavior and managed hosting require a separate scope agreement; the architecture is not restricted to a single asset pair.

The current revision retains independent MainNet use as the adoption outcome and increases the target to three organizations with at least 30 days of production evidence covering repeated natural execution dates. Existing commitments to extraction, SDK delivery, recovery testing and security remediation remain within M1-M4. Adopter-specific readiness, rollout troubleshooting and production-usage evidence fall within M5. M5 is earned only on its usage and completion conditions, not by resubmitting technical deliverables already accepted under M1-M4.

The technical allocation is a fixed-price reallocation, not a claim that the engineering work has disappeared. Ecem leads core extraction and reference execution integration in M1-M2; Gamze leads test evidence and setup documentation alongside that work. M3 combines SDK delivery, backend/Daml reproduction and evaluator support, with Ecem responsible for integration fixes and Gamze for reproduction records. M4 covers internal remediation and regression work; external audit fees remain separate. One reference adapter and one agreed signing path bound this tranche; no extra venue implementations are added. Progress reviews track delivery effort and support capacity, with material deviations handled through change control rather than silently reducing acceptance tests.

### Audit Allowance Basis

The 183,000 CC allowance is a provisional planning figure, not a received quotation. Public precedents include a 160,000 CC vendor allowance backed by a Cure53 quotation in [Go SDK #38](https://github.com/canton-foundation/canton-dev-fund/pull/38#issuecomment-4350328883), a 205,000 CC separately quoted vendor line in [C# SDK #46](https://github.com/canton-foundation/canton-dev-fund/blob/0a9210f41c1cc2485ce90f1014bdf16184424a7e/proposals/csharp-dotnet-sdk.md#appendix-c--security-audit-cure53), and 200,000 CC against an approved quote in [Payment Streams #94](https://github.com/canton-foundation/canton-dev-fund/pull/94#issuecomment-4673609079). These provide budgeting context, not equivalent scopes, current exchange rates or evidence that this project's review can be delivered for the same price.

Our quote request will cover the reusable Daml authorization components, execution/reconciliation service, persistence and recovery boundaries, SDK/signing interface, findings report and fix verification. The auditor will confirm the reviewable version, scope, exclusions, schedule and fee before engagement. Venue internals and unrelated commercial application code are outside this proposed review. The approved quotation, rather than comparison with other grants, will determine the final external audit request.

## Team, Licensing and Maintenance

Ecem K. leads architecture, execution integration, releases and maintenance, including security-remediation coordination. Gamze supports testing, reproducibility, documentation, integration onboarding and maintenance triage.

Original funded Daml components, reference adapter, service, SDK and tests will be Apache-2.0. The funded distribution will not bundle or redistribute third-party venue DARs, and the independent reference deployment will not require Tradecraft's DARs. Required external packages are obtained separately from authorized sources under their applicable terms. M1 documents acquisition sources, versions, package identities, usage requirements and installation commands; the usable setup path is verified before M2. Release checks cover archives, embedded dependency DALFs and container contents, not only standalone DAR filenames. Our own Daml artifacts remain part of the release. The commercial interface, customer data and unrelated systems are excluded. Proposal text follows the repository's CC0-1.0 terms.

Maintenance covers supported-version compatibility, regression tests, dependencies and security triage for 12 months after M4 acceptance. First response targets five business days, not guaranteed resolution or 24/7 service. Handover documentation supports continued use without mandatory paid Pinnaccle services.

### M6: quarterly maintenance acceptance

Each 20,000 CC claim must evidence the work and supported state for that quarter, not merely delivery of a report:

- A version/support matrix and dated build, compatibility and regression results for the supported release. Relevant upstream changes are assessed, with required fixes or documented constraints.
- An issue and security-triage record showing reported problems, responses, resolution status and links to fixes/tests. Open findings include severity, mitigations and a remediation plan for Committee assessment; listing a blocker alone does not establish acceptance.
- Release tags and changelog entries where changes were needed. A no-change quarter can qualify with current test results and documented dependency/security review; unnecessary releases are not required.
- Updated operating/recovery documentation where behavior changed, and a consolidated handover/status record in the final quarter.

Production-adoption claims under M5 require their separate integration evidence. M6 pays for ongoing upkeep of the supported release, not a second payment for the same launch or usage report.

## Dependencies, Risk and Change Control

The auditor, audit scope, quotation and payment arrangements require Committee approval before the audit engagement is committed and audit funds are released. These are audit-procurement conditions, not prerequisites for project funding approval. Pinnaccle coordinates independent evaluation to support M3's target completion under Appendix A; a named evaluator's commitment is not a separate funding-approval or M2 acceptance prerequisite. Reference integration selection and its dependency/access plan are M1 deliverables; access and package availability are verified before M2 begins, rather than a separate venue-selection prerequisite for funding approval. Prospective adopters and confirmed participants are recorded distinctly; the proposal does not name committed partners without consent.

Before M2 begins, the selected permissionless TestNet route and a documented, permitted acquisition, installation and use path for its dependencies must be available to independent operators without Tradecraft packages or Pinnaccle-specific agreements. Third-party venue DAR redistribution by Pinnaccle is not part of delivery. Before each MainNet launch, confirm token/participant eligibility, signing and receiving permissions, operating responsibilities and security readiness. If a candidate fails the technical or access requirements, select and verify a compatible route within M1; any resulting material scope or schedule change requires Committee agreement. Mock settlement cannot replace real-route acceptance.

Extraction effort, auditor scheduling and adopter decisions can affect delivery. Network and venue liveness are external dependencies. Material scope, schedule, audit-cost or acceptance changes require written agreement; neither unfunded scope expansion nor automatic extensions are assumed.

## Co-Marketing

Pinnaccle will publish a developer walkthrough covering dependency setup, CIP-0103 user authorization, plan creation, scheduled execution, settlement observation and cancellation on the tested reference path. It will identify tested versions and distinguish TestNet examples from production-adoption evidence.

An integration workshop for wallet and application teams will demonstrate the reference workflow and address signing, hosting, dependency and recovery questions. Publish the workshop materials and incorporate recurring questions into the setup guide. Coordinate timing and distribution with the Foundation where available; delivery does not depend on Foundation promotion.

Consented case studies for accepted integrations will describe the adopter's use case, product integration, operational responsibilities, natural execution schedule, observed outcomes and lessons for subsequent teams. These contribute to M5's existing consolidated materials, not a new payment or a substitute for MainNet usage evidence. Foundation introductions are welcomed, not assumed commitments or payment prerequisites.

## Appendix A: Reference Integration and Portability Evidence

The reference integration uses a tested asset pair through the initial venue adapter: an application with an existing Canton signing path adds a recurring-purchase workflow. It keeps its interface and user keys, and connects to a separately deployed execution service through the published SDK. This exercise verifies the integration pattern; the published matrix identifies which other pairs have been tested. The following describes funded delivery and verification, not an integration already completed by an external customer.

| Integration step | What the release supplies | What the integrating operator supplies |
|---|---|---|
| Establish access | Versioned dependency manifest, package/license references and a route access checklist distinguishing public setup from provider approval | Authorized participant access, operator identity, traffic funding and any token/venue approval |
| Deploy | Reproducible build, configuration schema, database setup and operating instructions | A clean deployment environment and its own service credentials; no Pinnaccle production secrets |
| Authorize | CIP-0103 SDK/signing example specifying the finite mandate, required permissions and rejection/error handling | An independently operated compatible wallet on the tested path; the user reviews and signs the authorization |
| Execute and observe | Scheduled execution, settlement reconciliation and slot/remaining-budget state | Its application displays plan state and outcomes; its operator monitors the service |
| Stop and recover | Cancellation and documented pending-settlement/restart recovery | User authorizes cancellation where required; operator follows the documented recovery procedure |

M1's dependency checklist identifies each required package, service and permission, who controls access, and whether the access path is documented, verified or still unresolved. TestNet availability is distinguished from MainNet approval. This makes the initial route's prerequisites reviewable without assuming that Pinnaccle's own venue relationship transfers to another operator. M2 supplies evidence for the real TestNet route; production eligibility remains part of each adopter's readiness review.

For M3, a developer who did not implement the funded components uses the released source, documentation and their own authorized test identities to run the reference workflow in a clean environment. The developer need not be a customer or commit to adopting the toolkit. This technical exercise does not qualify as M5 adoption.

Pinnaccle will coordinate a qualified evaluator who did not implement the funded components and schedule the exercise to support M3's target completion. The evaluator's qualifications and any conflicts of interest will be disclosed to the Foundation. If the evaluator becomes unavailable, a replacement meeting the same criteria will be arranged. Evaluation costs are included in M3's 170,000 CC allocation; any material impact on the agreed budget or schedule will be addressed through the proposal's change-control process. Independent verification remains required for M3 acceptance. No evaluator is named or represented as committed at submission.

The exercise covers setup, a finite authorized plan with at least two settled slots, visible reconciliation, restart from persisted state and cancellation of future work. Controlled failure cases demonstrate the existing duplicate/lost-response requirements without manufacturing failures in real customer funds. The evaluator records versions, setup steps, required provider approvals, manual interventions, assistance received and observed results. Setup time is reported as an observation, not a promised installation-time SLA.

Pinnaccle can provide troubleshooting, but the evaluator performs the deployment and execution. Any missing instructions or integration fixes are incorporated into the public release and the affected steps repeated. Acceptance evidence includes a version-pinned reproduction guide and an evaluator-confirmed result; confidential ledger/access details may be supplied to the Foundation rather than published. Private Pinnaccle code or credentials cannot substitute for the documented integration path.

This exercise demonstrates technical portability and exposes the actual integration burden. It does not establish market demand or guarantee provider approval for every team. M5 separately demonstrates real independent MainNet use. These are concrete verification details for the existing M1-M3 scope, not additional venues, wallet connectors or a customer-signup prerequisite for technical payments.

## References

- [Technical documentation](https://tech.pinnaccle.xyz/)
- [Current PR and evidence appendices](https://github.com/canton-foundation/canton-dev-fund/pull/812)
- [Development Fund roadmap](https://github.com/canton-foundation/canton-dev-fund/blob/main/2026-2028-strategic-roadmap.md)
