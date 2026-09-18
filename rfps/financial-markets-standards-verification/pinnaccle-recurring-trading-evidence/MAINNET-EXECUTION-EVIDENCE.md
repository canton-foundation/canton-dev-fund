# Pinnaccle DCA: MainNet execution evidence

Verified 2026-09-18 by read-only queries to the authorized MainNet ledger gateway. No new trade, signature, deployment or configuration change was made. This supersedes the July/August examples as the primary grant execution evidence.

## Ledger-confirmed package identities

The opening transaction exercises execution-venue package `2cd542acf5c33629a283731df3062bb383533fc2d0f82adfc34ffc410127799c`, matching the pinned Tradecraft 1.3.3 manifest.

| Component | Package ID observed in ledger events |
|---|---|
| Execution venue: AMMRules and SwapOrder | 2cd542acf5c33629a283731df3062bb383533fc2d0f82adfc34ffc410127799c |
| Pinnaccle compact bridge V3 | fa3ec9df8fe1a3c2bf0d5e7081ed8196625f4718ce62da6c393e6994ba5c7913 |
| Pinnaccle V2 capacity adapter | 15c0bb6a587f2ff2746702fba4a53a243d6d9909e19b742a0ad748655e1a4c1b |
| Pinnaccle trading mandate/receipt | dbf93a4150435b3c7aa2e069cf1c57fb81779d2c5a958fa5170881122b3f4867 |
| Utility allocation factory | 1eddd268bdd50d6e262722bea799c9455da032b3f94489e589975151b274b8c0 |
| Utility registry allocation | 8c654487d9f5fb195fbcdd7b44cd8e365b1ea39c15ae62ce6c7a48343f1210dd |

These are observed deployed Daml identities. They do not identify the complete Java backend build or imply that current local files are identical to deployed sources.

## Confirmed slot lifecycle

Mandate `dca-mu4jonan`; slot `dca-slot-20260916T231821Z-1755d703f79a565d`. Times below are ledger record times, UTC, on September 17.

| Stage | Time | Update ID |
|---|---|---|
| Capacity-backed route and order creation | 06:57:57.782407 | 12202acc59686858f614b9048ef94c9340072a5b863e328ee862951529f9c158561a |
| Pool return observed | 07:06:12.967224 | 122012d63f3415a466c58c1a6e7903cfb6f22154e575e23691d427ee7a4ba314d13c |
| Owner delivery transfer | 07:17:28.587171 | 1220a0c0358e9b562f4cfccfe2b158be4ab3093cf9666c9aad7aa9f5c819a04252fa |
| Owner delivery confirmation/outcome | 07:17:30.870653 | 1220628199d4c47d1758c61692bec0bd7d80a0247ca3620b440f161afe86e65dc844 |
| Slot receipt and mandate advancement | 07:17:37.389215 | 1220b7009e0301693be57cc2e9c3c785d6a613a0ce9b4e6e0fc3a3e3aa7a178d46bb |

The opening update exercises `Operator_OpenAndSubmitTradecraftRoute`, `Operator_ReserveSettleAndOpenV2RouteSlot`, Utility `SettlementFactory_SettleBatch` and `AMMRules_CreateSwapOrderFromHoldingsV2`; it creates a `TC.V4.SwapOrderV2:SwapOrder` and a Utility `DvpLegAllocation`.

The subsequent events link the route contract through `Operator_RecordPoolReturnObserved` to `Operator_RecordOwnerDeliveryConfirmed`. The last update exercises `Operator_RecordV2RouteCompletionAndAdvance`, creates `DcaSlotReceipt`, and exercises `Advance_DcaMandateAfterExecutedSlotReceipt` to create the next mandate state. The route/receipt command IDs refer to the same mandate and slot.

This establishes a real capacity-backed execution lifecycle through delivery confirmation and receipt/advancement, not merely unsigned preparation. It does not claim the entire end-to-end lifecycle is one atomic transaction, instant, or free of recovery delays. Exact economic amounts and detailed venue-internal settlement atomicity were not extracted in this query. The opening and final record times differ by about 20 minutes; this example is not a latency benchmark.

## Later scheduled activity: operational log corroboration

Read-only execution-service logs show the same mandate submitting later scheduled slots on September 17 at 08:18, 11:18 and 14:18 UTC.

| Scheduled slot UTC | Submission update ID | Return-observation update ID |
|---|---|---|
| 08:18:21 | 1220fca211da274f50246578a1412fb1082671938f8c75dbb6b2c8c5c807a604d940 | 122094b235ed74e6f2fe7a0f208d29631f30f806cb4ba73e54f239033ec6cffed51f |
| 11:18:21 | 12203a29929329ce14b37fe098c6babc913309dcc8bd9bc39a9bdd503a1f2710ca02 | 1220f9e4e4bc570aa37cfef9f9ae76872aa8ed2b8879d3fce19486bc0e6e5e2e3bf2 |
| 14:18:21 | 1220c684d8fa4135720d41e2e2d128f0a1b7e03a4dea331d798c0fa96bce5a68c79c | 122092053f0c6de0191b19b496df5221b6f544010f1f981e41bb4cad2d1136654568 |

Submission and return-observation rows above originate in logs. The 08:18 and 11:18 final receipt updates were subsequently queried directly from the ledger, as recorded below. The runner's `status=settled` accompanies `submitted_pending_completion`; that log label alone is not final delivery evidence.

## Two consecutive scheduled completions

Read-only participant queries confirmed both updates exercise `Operator_RecordV2RouteCompletionAndAdvance`, create an `Executed` receipt and exercise `Advance_DcaMandateAfterExecutedSlotReceipt`. Both use capacity package 15c0bb6a...a4c1b and trading package dbf93a41...f4867 listed above, for the same mandate. Times are UTC on September 17, 2026.

| Scheduled slot | Revision | Ledger completion record time | Receipt spent amount | Receipt received amount | Update ID |
|---|---:|---|---:|---:|---|
| 08:18:21.242 | 2 | 08:19:17.728232 | 0.6500000000 | 6.4781099750 | 1220775871c01a03123b0adb4b9a79a8a02ecf1a92c633cfd57948db819716f9e512 |
| 11:18:21.242 | 3 | 11:19:26.564279 | 0.6500000000 | 6.4066789547 | 1220889c06c1a2de9f7edb9a1120cb2888725f1598869683c524c45a823c2df459a0 |

Amounts are receipt fields, not independently recalculated portfolio balances. These queries establish consecutive completion and advancement; the venue's internal processing and every intermediate transfer were not newly replayed in this review.

The inspected running container reports image identity `sha256:e58e492628c1428ceb838afc1a1b8762673d5eaa09296f560c363daea0fdcf3b` and start time `2026-09-17T07:16:40.566021612Z`. This identifies the observed runtime container, not a reproducible source-to-binary attestation or proof that no runtime files changed.

## Reproduction and limits

Read-only gateway route: `/v2/updates/update-by-id`, authorized transaction event format. Query the five lifecycle update IDs and compare package IDs, contract links, choices and command slot identity. Public explorers may omit private events, so screenshots alone are insufficient.

Remaining work includes reproducible backend source-to-binary provenance and independent security review. External adopters are not currently committed and this product evidence is not independent toolkit adoption.
