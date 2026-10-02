# Pinnaccle DCA: authority and independent operation

## Scope of review

This is a source inspection and read-only execution review, not an independent security audit. The MainNet evidence identifies capacity package 15c0bb6a587f2ff2746702fba4a53a243d6d9909e19b742a0ad748655e1a4c1b (0.0.10). The local working adapter is 0.0.11. Package-indexed dependency source for 0.0.10 was inspected separately; local source is not presented as proof of the deployed backend build.

## Authority matrix

| Constraint | Observed enforcement | Grant release requirement |
|---|---|---|
| Authorization | Owner controls creation of bound capacity; owner, operator, mandate revision and funding instrument are checked | Publish exact authorization payload and negative tests |
| Spending | Capacity route checks positive spend, per-slot maximum and remaining capacity; settlement follows bound allocation lineage | Demonstrate over-budget and concurrent-worker rejection |
| Schedule | Ledger time must be at or after the exact next scheduled slot and before capacity deadline | Explicit missed-window policy; test scheduling and restart boundaries |
| Cancellation | Owner-controlled mandate cancellation consumes the prior mandate and clears its next execution; release requires terminal state and no in-flight slot | Reproduce cancel/submit races and disclose outstanding commitment |
| Route selection | Operator supplies route/pool, target-asset and quote inputs; the adapter has structural validation and the bridge submits a venue minOut | Document operator trust and verify every advertised mandate-to-route restriction; do not treat structural validation as proof of a user-bound price or target policy |
| Quote and price | Bridge derives venue minOut from quoted output and slippage; quote discovery and input selection are operational responsibilities | Test stale quotes, unauthorized parameter changes and ledger-time boundaries |
| Completion | Matching capacity evidence and a filled route outcome are required before receipt creation and mandate advancement | Trace outcome authority through actual delivery evidence; test fabricated/mismatched outcomes |
| Fees | Application runner integrates a separate prepaid-fee lifecycle | Publish an optional fee interface with explicit asset units; no mandatory Pinnaccle treasury dependency |

Source anchors: `MandateAdapter.daml` choices `Owner_CreateBoundV2Capacity`, `Operator_ReserveSettleAndOpenV2RouteSlot`, `Operator_RecordV2RouteCompletionAndAdvance`, `Operator_CancelRemainingV2CapacityAfterTerminalMandate`; `Trading/DcaMandate.daml` choice `Cancel_DcaMandate`; compact V3 bridge `Operator_OpenAndSubmitTradecraftRoute`.

User keys are not handed to the scheduler, but this does not make every execution input trustless. The grant must define, test and audit the operator boundary before recommending independent production use. Successful MainNet receipts demonstrate operation, not adversarial security completeness.

## Independent deployment boundary

| Requirement | Integrator responsibility | Grant deliverable / current limitation |
|---|---|---|
| Canton participant access | Own or hosted participant, party identity, authenticated ledger access and traffic funding | Document supported ledger interfaces; do not require Pinnaccle's gateway |
| User authorization | CIP-0103-compatible wallet/signing provider and receiving permissions | Wallet-facing SDK and reference application use CIP-0103; M3 verifies authorization and rejection/error handling through at least one independently operated compatible wallet; keys remain with the user/provider |
| Token and venue access | Token eligibility, preapprovals, allocation factories, accessible liquidity route and applicable venue terms | Deliver one validated permissionless reference integration without Tradecraft DARs or Pinnaccle-specific agreements; finalize configuration in M1 and verify independent access before M2 |
| Execution service | Java runtime, persistent storage, operator credentials and scheduling | Extract tenant/account/fee dependencies into documented interfaces |
| Contract packages | Obtain required third-party packages from their provider or another authorized source and upload/vet them under the applicable terms | Publish original grant components under Apache-2.0; do not bundle third-party venue DARs; document and validate independent dependency acquisition, installation and use |
| Monitoring and recovery | Operate reconciliation, alerts, backups and incident procedures | Supply restore tests, bounded retry policy and recovery runbooks |

The independent installation acceptance is a clean environment with no Pinnaccle account, private repository, production credentials or mandatory paid Pinnaccle endpoint. The evaluator will authorize a finite plan, settle two TestNet slots, restart the service, reconcile capacity and cancel future work. This is an acceptance target, not a claim that the current commercial deployment is already portable.

M1 selects and specifies the permissionless reference integration, including authorization, price protection, settlement evidence and recovery compatibility. Before M2 begins, verify a usable real TestNet route and document and validate how independent operators obtain, install and use its dependencies under the applicable terms. The funded reference deployment must not require Tradecraft DARs. Release checks include embedded dependency DALFs and container contents. Redistribution of third-party venue DARs by Pinnaccle is not part of the funded delivery. If these cannot be secured, seek committee agreement on a replacement route or scope; a mocked route cannot substitute for real settlement acceptance.

## Verification schedule

Audit procurement/quotation arrangements are pre-approval confirmations. Pinnaccle schedules a qualified evaluator who did not implement the funded components to support M3's target completion and discloses qualifications and conflicts of interest to the Foundation. If unavailable, the evaluator is replaced by someone meeting the same criteria. Evaluation costs are included in M3; material budget or schedule impacts follow change control. A named evaluator's commitment is not a separate funding-approval or M2 acceptance prerequisite; independent verification remains required for M3 acceptance. Reference integration selection and the dependency/access plan are M1 outputs, with usable access verified before M2. M2 demonstrates two real TestNet settlements and capacity reconciliation. M3 includes independent clean builds of both backend and Daml components with pinned source, dependencies and toolchains, build logs and artifact comparisons; a container image identifier alone is insufficient. Independent adoption is evaluated separately under M5, not assumed from the technical evaluator's participation.

The historical Tradecraft execution evidence does not validate the new reference adapter. Permissionless access does not establish technical compatibility or third-party redistribution rights; these are separately assessed under the milestone requirements.
