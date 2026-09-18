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
| User authorization | Existing wallet/signing provider and receiving permissions | SDK signing example; keys remain with the user/provider |
| Token and venue access | Token eligibility, preapprovals, allocation factories, accessible liquidity route and applicable venue terms | Pin one tested TestNet route; commercial access for Pinnaccle is not a transferable entitlement |
| Execution service | Java runtime, persistent storage, operator credentials and scheduling | Extract tenant/account/fee dependencies into documented interfaces |
| Contract packages | Upload/vet supported packages under their respective licenses | Publish original grant components under Apache-2.0; third-party redistribution permissions must be confirmed |
| Monitoring and recovery | Operate reconciliation, alerts, backups and incident procedures | Supply restore tests, bounded retry policy and recovery runbooks |

The independent installation acceptance is a clean environment with no Pinnaccle account, private repository, production credentials or mandatory paid Pinnaccle endpoint. The evaluator will authorize a finite plan, settle two TestNet slots, restart the service, reconcile capacity and cancel future work. This is an acceptance target, not a claim that the current commercial deployment is already portable.

Before M2 begins, agree a usable TestNet route and permitted dependency distribution. If these cannot be secured, seek committee agreement on a replacement route or scope; a mocked route cannot substitute for real settlement acceptance.

## Remaining pre-vote confirmations

Audit scope and quotation, independent evaluator/adopter participation, reproducible backend-build provenance and third-party access/license terms remain open. The proposal is suitable for technical discussion; these are not represented as completed work.
