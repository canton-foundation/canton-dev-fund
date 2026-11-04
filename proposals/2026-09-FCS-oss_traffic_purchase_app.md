# Open Source Traffic Purchase App

## Development Fund Proposal

| Field | Value |
| :---- | :---- |
| Author | Lyutskan Lyutskanov |
| Org | Finoa Consensus Services GmbH |
| Created | 2026-09-10 |
| Category | Initiative grant |
| Label | dapp-integration, rfp-07:validator-onboarding |
| RFP alignment | RFP 7, expanded network access and validator onboarding |
| Related CIPs | [CIP-0103](https://github.com/canton-foundation/cips/blob/main/cip-0103/cip-0103.md), [CIP-0104](https://github.com/canton-foundation/cips/blob/main/cip-0104/cip-0104.md), [CIP-0107](https://github.com/canton-foundation/cips/blob/main/cip-0107/cip-0107.md), [CIP-0056](https://github.com/canton-foundation/cips/blob/main/cip-0056/cip-0056.md), [CIP-0112](https://github.com/canton-foundation/cips/blob/main/cip-0112/cip-0112.md) |
| Related proposals | User-Paid Traffic Accounting ([\#527](https://github.com/canton-foundation/canton-dev-fund/pull/527)), dApp SDK ([\#69](https://github.com/canton-foundation/canton-dev-fund/pull/69)), Splice Wallet Kernel maintenance ([\#50](https://github.com/canton-foundation/canton-dev-fund/pull/50)), Token Standard traffic-purchase path (splice [\#7255](https://github.com/canton-foundation/canton-dev-fund/pull/7255) / [\#7427](https://github.com/canton-foundation/canton-dev-fund/pull/7427)) |

## Abstract

FCS requests 2,995,000 CC to build an open-source [CIP-0103](https://github.com/canton-foundation/cips/blob/main/cip-0103/cip-0103.md) reference app for buying synchronizer traffic on the Canton Network, including a fiat-to-traffic path through a licensed onramp provider, and maintain the app for six months after the v1.0 release.

The app lets any party holding CC connect a wallet, sign a traffic purchase, and fund a validator’s traffic balance. The intended on-chain command is the Token Standard transfer path being added in splice ([\#7255](https://github.com/canton-network/splice/issues/7255) / [\#7427](https://github.com/canton-network/splice/pull/7427)): TransferFactory\_Transfer to a reserved traffic-purchase receiver, with memberId, synchronizerId, migrationId, and trafficAmount in the memo. That path uses the same buyMemberTraffic helper as today’s AmuletRules\_BuyMemberTraffic and follows [CIP-0107](https://github.com/canton-foundation/cips/blob/main/cip-0107/cip-0107.md) in reading pricing from ExternalPartyConfigState, which supports a 24h prepare-to-sign window. Until that path is live on the target network, the app falls back to constructing AmuletRules\_BuyMemberTraffic directly. It supports **validator bootstrap and recovery** when an operator or sponsor needs to top up a validator that can no longer transact on its own.

Users without CC fund their wallet by a supported fiat rail via a licensed onramp provider. The app embeds a licensed onramp provider’s integration (widget, iframe or redirect), so the user can onramp CC into their own wallet through the provider and then separately buy traffic through the app. Users who already hold CC go straight to the traffic purchase, and an interrupted path resumes there. The provider is merchant of record and runs KYC. The app never holds fiat or CC.

FCS will publish an operator and deployment guide and **test the app with three different [CIP-0103](https://github.com/canton-foundation/cips/blob/main/cip-0103/cip-0103.md) wallets** from three non-custodial wallet providers on TestNet and MainNet. For six months after v1.0, FCS maintains the codebase against a moving protocol: compatibility patches for the splice traffic-purchase path and [CIP-0107](https://github.com/canton-foundation/cips/blob/main/cip-0107/cip-0107.md) config-state changes, refreshed wallet compatibility matrices, bug fixes, and documentation updates. A MainNet reference instance is kept current so each release is exercised against live AmuletRules, Scan, and wallet behaviour before it is tagged.

Work is delivered in milestones: design and TestNet validation (M1–M2), MainNet release (M3), a **fiat-to-traffic path** through a licensed onramp provider within eight weeks of release (M4), and **six months of post-release maintenance** with monthly maintenance reports and partial payout on the model used in approved grants [**\#47**](https://github.com/canton-foundation/canton-dev-fund/pull/47) and [**\#50**](https://github.com/canton-foundation/canton-dev-fund/pull/50) (M5.1–M5.6). **M1, M2 and M4 (1,922,000 CC)** pay on delivery. **M3 (365,000 CC)** pays when the MainNet release is accepted and 3 MainNet traffic purchases have been completed through the app we operate, by the Canton Foundation or by others. **Each M5 month (118,000 CC)** pays when that month’s report is accepted and 3 MainNet traffic purchases have been completed in that month, by the Canton Foundation or by others. A separate Development Fund proposal may follow for an external audit if demand materializes.

---

## Business Model

The app is free to use. The app takes no fee, commission or referral share on the traffic purchase or on the onramp purchase. Onramp fees may be charged by the provider and traffic costs arising from the traffic top-up transaction may be forwarded to the user by the wallet provider.

---

## Specification

### Objective

Open source reference app for validator bootstrap and traffic recovery: calculator, validator resolution, [CIP-0103](https://github.com/canton-foundation/cips/blob/main/cip-0103/cip-0103.md) purchase flow, MainNet v1.0, fiat-to-traffic path through a licensed onramp provider, six months of post-release maintenance.

**In scope**

* Open source app: calculator (USD/bytes to CC), validator resolution (participant ID or party ID with multi-host selection), [CIP-0103](https://github.com/canton-foundation/cips/blob/main/cip-0103/cip-0103.md) prepareExecute of the Token Standard traffic-purchase transfer when that path is on the network, otherwise AmuletRules\_BuyMemberTraffic

* M1 records the purchase-command contract (sentinel party, memo schema) from splice \#7255 once published, with a fallback until it is live

* **Three-wallet test:** FCS tests the app with three different wallets from three non-custodial wallet providers; each wallet completes a traffic purchase for a validator on TestNet (M2) and MainNet (M3); results published in a compatibility matrix (including which purchase path was used)

* 1.0 release (M3)

* M4 fiat-to-traffic path: 

  * a licensed onramp provider integration; 

  * the user can onramp CC into their own wallet and use it to purchase traffic; 

  * the path for users who already hold CC stays the same;

  * legal counsel review before MainNet go-live

* M5.1 to M5.6: 

  * post-release maintenance (protocol-compat patches, wallet-matrix updates, bug fixes, docs) and adoption (the Canton Foundation or others buying traffic through the app we operate);
  * monthly maintenance reports;
  * jurisdiction controls per M1 legal memo;
  * onramp integration upkeep

**Out of scope**

* Standalone traffic-purchase SDK or wallet-embedding library

* The app acting as merchant of record or holding fiat or CC.
* Card-to-stablecoin, bridge or swap routes to CC.

* Custodial or proxy burn paths; the app never signs the purchase command on a user’s behalf

* Foundation or SV hosting of a public instance

* Implementing splice protocol work: Token Standard traffic-purchase path ([\#7255](https://github.com/canton-foundation/canton-dev-fund/pull/7255) / [\#7427](https://github.com/canton-foundation/canton-dev-fund/pull/7427)), [CIP-0112](https://github.com/canton-foundation/cips/blob/main/cip-0112/cip-0112.md) burn-account transfers (\#6990), party-level prepaid traffic ([\#527](https://github.com/canton-foundation/canton-dev-fund/pull/527))

* [CIP-0112](https://github.com/canton-foundation/cips/blob/main/cip-0112/cip-0112.md) AllocationFactory or Delivery-versus-Burn as a traffic-purchase API; extra traffic is still credited only via MemberTraffic

* External audit in this grant. A separate Development Fund proposal may follow if demand for an audit materializes

### Implementation Mechanics

**Pricing.** Reads `ExternalPartyConfigState` from Scan, including `amuletPrice`, `trafficPrice`, `supportedSynchronizerIds` and `minTrafficTopupAmount`. Extra traffic is priced in USD per MB (1 MB \= 1,000,000 bytes). The user can enter bytes and see CC (and USD) to pay, or enter a USD or CC budget and see how many bytes that buys, using `(trafficAmount bytes / 1e6) × trafficPrice / amuletPrice` and its inverse. The transferred CC amount determines the purchased traffic, rounded down to whole bytes. Purchases below `minTrafficTopupAmount` are rejected. The quote is bound to `ExternalPartyConfigState` and re-quoted if that state rolls. Pricing fields come from live Scan/governance config, not from DAR constants.

**Validator resolution.** Extra traffic is credited to a sequencer member (`memberId`, `PAR::…`), not to a Daml party. The app takes a participant ID as the purchase target. If the user enters a party ID (for example the validator operator), the app resolves hosting participants via Scan `GET /v1/domains/{domain_id}/parties/{party_id}/participant-id` and the user picks one when several are returned. A validator node is one participant; multi-hosting applies only to this party lookup, not to the validator target itself. After the target is chosen, the app shows sequencer status via `GET /v0/domains/{domain_id}/members/{member_id}/traffic-status` (base rate vs purchased extra) so the user can see remaining traffic and decide how much to buy.

**Purchase.** App-side CIP-0103 client (`@canton-network/dapp-sdk`). Users connect with a CIP-0103 wallet, including wallets reached through WalletConnect’s Canton integration.

The app builds a V1 or V2 Token Standard `TransferFactory_Transfer` to the reserved traffic-purchase receiver introduced by [splice \#8012](https://github.com/canton-network/splice/pull/8012):

`splice_traffic-manager::1220000000000000000000000000000000000000000000000000000000000000abcd`

The transfer memo is:

`splice/memo:member-id=…&synchronizer-id=…&migration-id=…`

The transfer amount is the CC amount to burn and determines how many traffic bytes are purchased; `trafficAmount` is not included in the memo. Input holdings are unlocked CC selected via the Holding interface (V1 or V2; the same Amulet contracts). Choice context and disclosed contracts come from Scan’s transfer-factory registry. Splice recognises the reserved receiver and memo, burns the complete transfer amount through the shared `buyMemberTraffic` helper and creates `MemberTraffic` for the target participant instead of transferring CC to the receiver.

For a longer signing window, the app appends `&forfeit-validator-reward-coupon=true` to the memo. This skips the validator reward coupon and removes the short-lived `OpenMiningRound` dependency. Without this field, the prepared purchase must be executed within approximately 10 minutes.

The payer signs in the wallet and must hold enough unlocked CC for the burn, and enough sequencer traffic on their own host to submit. Locked holdings and CIP-0112 committed allocations are not used as inputs. A CIP-0112 burn to `cip-112/burn` / `cip-112_no-owner` (\#6990) does not credit traffic.

**Fiat-to-traffic path (M4).** 

Step 1: After the user connects a wallet and chooses the onramp option, the app opens the onramp provider’s integration (hosted widget, iframe or redirect) with the quoted CC amount, plus a buffer for fees and price movement, and the user’s party ID pre-filled. The user reviews the quote, completes KYC and payment, and confirms the purchase using the provider integration. The provider delivers CC to the user’s party. The app receives order status only (order ID and state), never card or KYC data. 

Step 2: once the CC is in the user’s party, the app re-quotes and the user signs the traffic purchase as above. If the path is interrupted, the app reads the party’s CC balance and resumes at step 2 if funds are sufficient. The current step is kept in browser storage, with no account. 

### Architectural Alignment

Uses the same on-chain traffic credit as the validator top-up loop (MemberTraffic plus sequencer SetTrafficPurchased). Command construction and signing go through [CIP-0103](https://github.com/canton-foundation/cips/blob/main/cip-0103/cip-0103.md) (@canton-network/dapp-sdk); WalletConnect is only a connect transport where the wallet supports it. No Wallet Provider bypass.

Purchase API preference: Token Standard transfer to the reserved traffic-purchase receiver (splice [\#7255](https://github.com/canton-foundation/canton-dev-fund/pull/7255)), so wallets that already implement [CIP-0056](https://github.com/canton-foundation/cips/blob/main/cip-0056/cip-0056.md) or [CIP-0112](https://github.com/canton-foundation/cips/blob/main/cip-0112/cip-0112.md) transfers do not need a proprietary BuyMemberTraffic choice. Fallback: AmuletRules\_BuyMemberTraffic until that receiver is live. [CIP-0112](https://github.com/canton-foundation/cips/blob/main/cip-0112/cip-0112.md) is the CC holding and history layer (Holding V1+V2, EventLog\_HoldingsChange on the burn), not a replacement purchase choice. Complementary to [\#527](https://github.com/canton-foundation/canton-dev-fund/pull/527) (party-level traffic is a future extension) and distinct from [\#6990](https://github.com/canton-foundation/canton-dev-fund/pull/6990) (generic CC burn). Traffic price and floor are read live from Scan, so SV changes to AmuletRules, round, or ExternalPartyConfigState pricing do not require an app redeploy.

---

## Milestones and Deliverables

All dates from grant approval. Grant closes on **M5.6** (\~34 weeks: 8 weeks build, M4 fiat-to-traffic path, six maintenance months). Build milestones include one week for Committee review.

| Milestone | Timing |
| :---- | :---- |
| M1 Design, calculator, resolution, CC-path legal sign-off | Week 3 |
| M2 [CIP-0103](https://github.com/canton-foundation/cips/blob/main/cip-0103/cip-0103.md) flow, three-wallet test (TestNet) | Week 6 |
| M3 1.0, MainNet release | Week 8 |
| M4 Fiat-to-traffic path | 6 to 8 weeks after M3 acceptance |
| M5.1 to M5.6 Adoption and monthly maintenance | Months 1 to 6 post-release |

### Milestone 1

* Technical design, threat model, TestNet calculator, participant/party resolution with traffic status

* **Legal sign-off on the CC-path app** (non-custodial operator model, jurisdictional and regulatory requirements, ToS and geoblocking). Onramp legal work is **M4**, not M1.

* Public repo with CI (lint, unit, integration)

* Purchase-path decision: detect the Token Standard traffic-purchase receiver on TestNet; specify memo schema and BuyMemberTraffic fallback; input selection is unlocked Holding CIDs only

### Milestone 2

* End-to-end TestNet purchase via prepareExecute using the Token Standard transfer path if deployed, otherwise BuyMemberTraffic; MemberTraffic referenced; traffic balance re-read

* FCS completes a traffic purchase through the app with each of three different wallets (from three wallet providers); matrix published (wallet, provider, environment, target validator, purchase path used, pass/fail)

* TestNet instance we operate, available for the Canton Foundation and others to buy validator traffic on TestNet

* [CIP-0103](https://github.com/canton-foundation/cips/blob/main/cip-0103/cip-0103.md) error paths (4001, 4200); internal security review; E2E suite in CI

### Milestone 3

* v1.0 tagged; operator and deployment guide published; MainNet reference instance kept current from this tag

* **Same three wallets** repeat the purchase on MainNet; matrix updated. If splice [\#7255](https://github.com/canton-foundation/canton-dev-fund/pull/7255) is on MainNet by M3, the matrix uses the Token Standard path; otherwise the fallback is documented and switching is in M5

* M3 pays on acceptance of the release, and on 3 MainNet traffic purchases through the app we operate by the Canton Foundation or others. The purchases must be completed end to end on MainNet; TestNet or sandbox runs do not count. A purchase is a validator onboarding or a traffic top-up

* M5.1 and M4 clock start on acceptance

### Milestone 4

**Estimated delivery:** **6 to 8 weeks** after M3 acceptance (runs in parallel with M5.1 and M5.2). Provider selection and the provider agreement run in parallel from M1.

**Focus:** Fiat-to-traffic path through a licensed onramp provider. The provider is merchant of record, runs KYC and delivers CC to the user’s own party. The user then separately signs the traffic purchase in their wallet. No fiat or CC passes through the app. The card option is available only in regions the onramp provider covers.

**Deliverables / value metrics:**

* Licensed onramp provider selected and contracted, with country coverage and delivery of CC to external Canton party IDs confirmed

* Provider widget, iframe or redirect integrated, with amount and party ID pre-filled and order status

* Direct path for users who already hold CC

* Legal counsel review of the provider agreement and the onramp model before MainNet go-live

* End-to-end fiat-to-traffic path on MainNet

* Operator guide section on running the path with an operator’s own provider account

* **Milestone payment on Committee acceptance** (independent of M3 adoption and of M5)

If provider coverage or the counsel review blocks MainNet go-live, M4 is accepted on the MainNet path with a documented blocker, and MainNet go-live follows in M5.

### Milestones 5.1 to 5.6

We operate the reference implementation and support the Canton Foundation and others in using it to buy traffic. Each month we deliver a maintenance report within five business days of month end: on-chain usage summary, tagged patches, changelog against splice [\#7255](https://github.com/canton-foundation/canton-dev-fund/pull/7255) / [CIP-0107](https://github.com/canton-foundation/cips/blob/main/cip-0107/cip-0107.md), wallet-matrix diffs, onramp integration changes, review of the provider’s country coverage and terms, and fixed issues. That month pays its 118,000 CC only when the report is accepted and 3 MainNet traffic purchases have been completed in that month through the app we operate. The Canton Foundation or others may make them. A purchase is a validator onboarding or a traffic top-up. Only MainNet counts. Purchases in one month do not count toward another month. Late or rejected report pauses that month only. A MainNet reference instance is kept current so each release is exercised against live AmuletRules, Scan, and wallet behaviour before it is tagged.

---

## Delivery and Acceptance Model

Build milestones (M1 to M3): review-ready tag plus completion notes in the Development Fund issue.

**M4 and M5 are independent.** M4 pays on acceptance of the fiat-to-traffic path. Each M5 month pays on its report and on 3 purchases in that month.

**M3 and the M5 months (1,073,000 CC) are adoption-gated.**

* **M1, M2 and M4 (1,922,000 CC)** pay on delivery acceptance.

* **M3 (365,000 CC)** pays when the MainNet release is accepted and 3 MainNet traffic purchases have been completed through the app we operate, by the Canton Foundation or by others.

* **M5.1 to M5.6 (118,000 CC each, 708,000 CC)** each pay when that month’s report is accepted and 3 MainNet traffic purchases have been completed in that month, by the Canton Foundation or by others.

A purchase is a validator onboarding or a traffic top-up. Only MainNet counts. The 3 purchases that release M3 also count toward the maintenance month in which they settle. A later month cannot reuse them.

Maintenance follows approved grants [**\#47**](https://github.com/canton-foundation/canton-dev-fund/pull/47) and [**\#50**](https://github.com/canton-foundation/canton-dev-fund/pull/50): monthly deliverables, partial payout, optional quarterly reassessment of workload and CC price on remaining M5 months.

Scope changes that require architectural rework beyond this document pause the affected milestone until recorded and priced via scope amendment.

**Acceptance checks**

* Committee member completes TestNet purchase from fresh clone with repo docs and a listed [CIP-0103](https://github.com/canton-foundation/cips/blob/main/cip-0103/cip-0103.md) wallet

* FCS demonstrates a successful traffic purchase with each of three different wallets on TestNet and MainNet

* Committee member completes a traffic purchase on MainNet (M4)

* 3 end-to-end MainNet traffic purchases through the app we operate, by the Canton Foundation or others (M3); TestNet or sandbox runs do not count. A purchase is a validator onboarding or a traffic top-up

* Each M5 month lists on-chain usage, tagged releases and compatibility patches, and 3 MainNet traffic purchases in that month by the Canton Foundation or others

---

## Funding

**Total Funding Request:** **2,995,000 CC**  
**Reference rate:** **USD 0.0911 per CC** (CoinGecko, 16 September 2026\)  
**Implied USD amount:** **USD 273,000**

The request covers twelve weeks of build, the M4 fiat-to-traffic path, and six months of post-release maintenance. Engineering and UI/UX hours convert at **3,293 CC/h** (USD 300), project management at **2,469 CC/h** (USD 225), and internal legal at **9,329 CC/h** (USD 850 pass-through). Legal counsel fees are pass-through at cost. **M1 legal counsel (USD 15k)** covers CC-path sign-off only. **M4 legal counsel (USD 15k)** covers the onramp provider agreement and the onramp model before MainNet go-live.

| Milestone | Eng h | UI/UX h | PM h | Legal h | Third-party | CC |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| M1 | 56 | 16 | 12 | 10 | Legal counsel USD 15k, CC-path (\~165k CC) | 525,000 |
| M2 [CIP-0103](https://github.com/canton-foundation/cips/blob/main/cip-0103/cip-0103.md) purchase, three-wallet test | 96 | 28 | 12 | — | — | 438,000 |
| M3 | 67 | 24 | 19 | 2 | — | 365,000 |
| M4 Fiat-to-traffic path | 112 | 28 | 52 | 22 | Legal counsel USD 15k, onramp (\~165k CC) | 959,000 |
| M5.1–M5.6 (each) | 22 | 5 | 8 | 1 | — | 118,000 |
| **Total** | **463** | **126** | **143** | **40** |  | **2,995,000** |

M1 to M3 hours are unchanged. M4 and M5 hours cover the fiat-to-traffic path and its upkeep. M1, M2 and M4 pay on delivery. M3 pays on the MainNet adoption gate. Each M5 month pays on that month’s own gate.

| Milestone | Paid on delivery | Adoption-gated | What releases the adoption amount |
| :---- | ----: | ----: | :---- |
| M1 | 525,000 | — | — |
| M2 | 438,000 | — | — |
| M3 | — | 365,000 | Release accepted, plus 3 MainNet purchases by the Foundation or others |
| M4 | 959,000 | — | — |
| M5.1–M5.6 | — | 708,000 | Each month: report accepted, plus 3 MainNet purchases in that month |
| **Total** | **1,922,000** | **1,073,000** |  |

### Volatility Stipulation

Project duration is estimated at approximately 9.5 months. Should the timeline extend beyond 9 months due to Committee-requested scope changes, any remaining milestones will be renegotiated to account for significant USD/CC price volatility.

### Timeline Accountability

* **Acceleration:** \+20% on M3 if v1.0 delivered \>1 month early

* Milestones \>60 days late subject to Committee review and renegotiation

---

## Motivation

Every validator on Canton needs synchronizer traffic to submit transactions. Traffic is purchased by burning CC, crediting a sequencer member (memberId). Today that burn is AmuletRules\_BuyMemberTraffic; splice [\#7255](https://github.com/canton-foundation/canton-dev-fund/pull/7255) exposes the same helper as a Token Standard transfer to a reserved receiver.That model works when the operator holding CC is the same party running the validator, but it breaks down in the two situations where new network participants most often get stuck.

Recovery. A validator out of purchased extra traffic runs on base traffic alone. Base traffic refills continuously, but at a capped rate. A busy validator spends it on routine submissions such as ACS commitments and its apps' transactions as fast as it refills, so little or nothing is left for the `AmuletRules_BuyMemberTraffic` transaction that would buy more. Without outside help, it stays throttled to the base rate.

The deadlock has two independent triggers: either the validator is out of traffic, or the wallet funding the top-up is out of CC. An automated top-up only solves the second case if the first hasn’t happened yet. It can’t submit anything once traffic hits zero. Recovery then depends on an external sponsor; a separate party with sufficient funds on a participant node with sufficient traffic of its own submitting the SetTrafficPurchased request on behalf of the depleted participant.

Today that intervention is unclear: manual BuyMemberTraffic commands, ad hoc runbooks and provider-specific support channels. It does not scale to the broader validator set and is not available to every operator on the network.

### Evidence from production operations

FCS sees this problem daily as a node-as-a-service operator on MainNet. Even relying on the top-up setup provided by the participant node, we have faced cases where our nodes depleted the traffic faster than triggering the automation, which we could only mitigate due to us running multiple setups that could purchase traffic on behalf of others in such cases. This is not applicable to the overall ecosystem and is not a fallback capability that other validators can reuse.

An open source reference app with a published operator guide, **proven with three different wallets** from ecosystem providers, would give any CC holder a standard path to fund or restore a validator without routing through a specific NaaS provider.

### Ecosystem alignment

This proposal complements rather than duplicates funded protocol work:

* [**\#527 User-Paid Traffic Accounting**](https://github.com/canton-foundation/canton-dev-fund/pull/527) targets wallet-level traffic attribution and local accounting primitives. This grant uses today’s validator memberId model.

Six months of post-release maintenance (M5) gives the Committee measurable evidence: tagged compatibility patches, wallet-native [CIP-0103](https://github.com/canton-foundation/cips/blob/main/cip-0103/cip-0103.md) usage, and whether the Token Standard purchase path can replace ad hoc BuyMemberTraffic runbooks.

---

## Rationale

FCS understands the limitation of the existing solution and the need to enable the ecosystem to execute a self-service traffic purchase independent from the validator itself. We operate validators on MainNet and execute traffic purchases for other validators in production, delivered Dev Fund grant [**\#444**](https://github.com/canton-foundation/canton-dev-fund/pull/444) (Splice governance UI, 18 accepted upstream issues), and understand Scan pricing, BuyMemberTraffic construction and wallet signing flows from production NaaS work. Further we operate the Vala wallet, where we implemented [CIP-0103](https://github.com/canton-foundation/cips/blob/main/cip-0103/cip-0103.md) already, giving us the needed understanding of how the whole workflow and integration is to be implemented.

The grant funds a focused utility: open source app, three-wallet validation by FCS, a fiat-to-traffic path through a licensed onramp provider (M4), and post-release maintenance on the model used in approved grants [**\#47**](https://github.com/canton-foundation/canton-dev-fund/pull/47) and [**\#50**](https://github.com/canton-foundation/canton-dev-fund/pull/50). That scope is reviewable and produces artefacts any operator or wallet team can reuse.

---

## Team and Qualifications

* Frontend engineer: reference and production app

* Backend engineer: onramp integration, order status and country controls, cost calculator, party resolution, [CIP-0103](https://github.com/canton-foundation/cips/blob/main/cip-0103/cip-0103.md)

* PM: Committee alignment, wallet and onramp partners, counsel

**Track record:** Grant \#444 (393,000 CC, 18 issues); 15+ customer validators on MainNet; manual traffic purchase runbooks.

---

## Risks and Mitigations

| Risk | L | I | Mitigation |
| :---- | :---- | :---- | :---- |
| Fewer than three wallets available for M2 test | L | M | FCS uses wallets from additional non-custodial providers |
| Token Standard traffic-purchase path (\#7255) not on TestNet by M2 | M | M | M2 uses BuyMemberTraffic fallback; switch when the sentinel party and memo contract are published; no extra Daml in this grant |
| Sentinel party or memo schema changes before the CIP number is assigned ([\#7255](https://github.com/canton-network/splice/issues/7255)) | M | M | Read receiver and field names from live Scan/docs, not hardcoded DAR constants; M3 re-validates |
| DAR or factory changes to BuyMemberTraffic or TransferFactory\_Transfer | L | H | Live config and registry choice context; dual-path in M1; M3 re-validates on MainNet |
| Onramp provider selection or agreement slow | M | M | Provider selection starts at M1; shortlist of more than one licensed provider |
| No licensed provider delivers CC to external Canton party IDs in the target countries | M | H | M4 accepted on the MainNet path; MainNet go-live follows in M5; CC path unaffected |
| Counsel review delays MainNet go-live of the fiat-to-traffic path | M | M | Fiat option stays off on MainNet until cleared; CC path live from M3 |
| Legal counsel fees exceed USD 15k in M1 or M4 | M | L | Scope amendment before expanded counsel scope |
| Fewer than 3 MainNet purchases for M3, or fewer than 3 in a given M5 month | M | H | M1, M2 and M4 still pay on delivery. M3 stays unpaid until its 3 purchases. A month with fewer than 3 stays unpaid. Later months are unaffected |

## Ecosystem Impact

* Validator bootstrap and recovery via self-service traffic purchases on MainNet

* Reference [CIP-0103](https://github.com/canton-foundation/cips/blob/main/cip-0103/cip-0103.md) app over the Token Standard traffic-purchase transfer, with BuyMemberTraffic fallback: forks, operator guide, three-wallet matrix including purchase path

* Fiat-to-traffic path for operators who do not yet hold CC

* Reduced manual NaaS top-ups

---

## Maintenance and Sustainability

After M5.6, the repository and operator guide let any operator run the app. FCS intends to continue maintenance if usage warrants; further work via a separate proposal or rolling grant. Apache 2.0; offered for transfer to Foundation GitHub at release.

---

