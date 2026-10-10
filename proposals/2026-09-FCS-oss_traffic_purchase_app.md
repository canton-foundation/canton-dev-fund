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

FCS requests 2,437,000 CC to build, audit, and maintain an open-source [CIP-0103](https://github.com/canton-foundation/cips/blob/main/cip-0103/cip-0103.md) reference app for buying synchronizer traffic on the Canton Network, through the first six months after the v1.0 release.

The app lets any party holding CC connect a wallet, sign a traffic purchase, and fund a validator's traffic balance. The intended on-chain command is the Token Standard transfer path being added in splice ([\#7255](https://github.com/canton-network/splice/issues/7255) / [\#7427](https://github.com/canton-network/splice/pull/7427)): `TransferFactory_Transfer` to a reserved traffic-purchase receiver, with `memberId`, `synchronizerId`, `migrationId`, and `trafficAmount` in the memo. That path uses the same `buyMemberTraffic` helper as today's `AmuletRules_BuyMemberTraffic` and follows [CIP-0107](https://github.com/canton-foundation/cips/blob/main/cip-0107/cip-0107.md) in reading pricing from `ExternalPartyConfigState`, which supports a 24h prepare-to-sign window. Until that path is live on the target network, the app falls back to constructing `AmuletRules_BuyMemberTraffic` directly. It supports **validator bootstrap and recovery** when an operator or sponsor needs to top up a validator that can no longer transact on its own.

FCS will publish an operator and deployment guide and **test the app with three different [CIP-0103](https://github.com/canton-foundation/cips/blob/main/cip-0103/cip-0103.md) wallets** from three non-custodial wallet providers on TestNet and MainNet. For six months after v1.0, FCS maintains the codebase against a moving protocol: compatibility patches for the splice traffic-purchase path and [CIP-0107](https://github.com/canton-foundation/cips/blob/main/cip-0107/cip-0107.md) config-state changes, refreshed wallet compatibility matrices, bug fixes, and documentation updates. A MainNet reference instance is kept current so each release is exercised against live AmuletRules, Scan, and wallet behaviour before it is tagged.

Work is delivered in milestones: design and TestNet validation (M1–M2), external audit and MainNet release (M3), a **Stripe/onramp feasibility verdict** within four weeks of release (M4), and **six months of post-release maintenance** with monthly maintenance reports and partial payout on the model used in approved grants [**\#47**](https://github.com/canton-foundation/canton-dev-fund/pull/47) and [**\#50**](https://github.com/canton-foundation/canton-dev-fund/pull/50) (M5.1–M5.6). A separate Development Fund proposal may follow for live fiat onramp integration if M4 recommends **go**.

---

## Business Model

The app is free to use. A platform fee on the CC-path flow may be introduced only if M1 external legal counsel approves it.

---

## Specification

### Objective

Open source reference app for validator bootstrap and traffic recovery: calculator, validator resolution, [CIP-0103](https://github.com/canton-foundation/cips/blob/main/cip-0103/cip-0103.md) purchase flow, MainNet v1.0, six months of post-release maintenance.

**In scope**

- Open source app: calculator (USD/bytes to CC), validator resolution (participant ID or party ID with multi-host selection), [CIP-0103](https://github.com/canton-foundation/cips/blob/main/cip-0103/cip-0103.md) `prepareExecute` of the Token Standard traffic-purchase transfer when that path is on the network, otherwise `AmuletRules_BuyMemberTraffic`  
- M1 records the purchase-command contract (sentinel party, memo schema) from splice \#7255 once published, with a fallback until it is live  
- **Three-wallet test:** FCS tests the app with three different wallets from three non-custodial wallet providers; each wallet completes a traffic purchase for a validator on TestNet (M2) and MainNet (M3); results published in a compatibility matrix (including which purchase path was used)  
- External audit, 1.0 release (M3)  
- M4 Stripe/onramp feasibility verdict (go / no-go / conditional go); **2 to 4 weeks** including Stripe and onramp partner outreach  
- M5.1 to M5.6: post-release maintenance (protocol-compat patches, wallet-matrix updates, bug fixes, docs); monthly maintenance reports; jurisdiction controls per M1 legal memo  
- Operator and deployment guide; internal security review

**Out of scope**

- Standalone traffic-purchase SDK or wallet-embedding library  
- Live Stripe, fiat checkout, or onramp orchestration in this grant   
- Custodial or proxy burn paths; the app never signs the purchase command on a user's behalf  
- Foundation or SV hosting of a public instance  
- Implementing splice protocol work: Token Standard traffic-purchase path ([\#7255](https://github.com/canton-foundation/canton-dev-fund/pull/7255) / [\#7427](https://github.com/canton-foundation/canton-dev-fund/pull/7427)), [CIP-0112](https://github.com/canton-foundation/cips/blob/main/cip-0112/cip-0112.md) burn-account transfers (\#6990), party-level prepaid traffic ([\#527](https://github.com/canton-foundation/canton-dev-fund/pull/527))  
- [CIP-0112](https://github.com/canton-foundation/cips/blob/main/cip-0112/cip-0112.md) `AllocationFactory` or Delivery-versus-Burn as a traffic-purchase API; extra traffic is still credited only via `MemberTraffic`  
- 

### Implementation Mechanics

**Pricing.** Reads AmuletRules config and the open mining round from Scan, including that round’s `amuletPrice`. Extra traffic is priced as `extraTrafficPrice` or `trafficPrice` in USD per MB (1 MB \= 1 000 000 bytes); `minTopupAmount` is the network-wide minimum purchase, in bytes. The user can enter bytes and see CC (and USD) to pay, or enter a USD or CC budget and see how many bytes that buys, using `(trafficAmount bytes / 1e6) × extraTrafficPrice / amuletPrice` and its inverse. Purchases below `minTopupAmount` are rejected. The quote is bound to the open round and re-quoted if the round rolls. Pricing fields come from live Scan/governance config, not from DAR constants.

When the Token Standard path is used, the quote is bound to `ExternalPartyConfigState` (up to 24h prepare-to-sign per [CIP-0107](https://github.com/canton-foundation/cips/blob/main/cip-0107/cip-0107.md)) rather than the current open mining round; the app still re-quotes if that config state rolls.

**Validator resolution.** Extra traffic is credited to a sequencer member (`memberId`, `PAR::…`), not to a Daml party. The app takes a **participant ID** as the purchase target. If the user enters a **party ID** (for example the validator operator), the app resolves hosting participants via Scan `GET /v1/domains/{domain_id}/parties/{party_id}/participant-id` and the user picks one when several are returned. A validator node is one participant; multi-hosting applies only to this party lookup, not to the validator target itself. After the target is chosen, the app shows sequencer status via `GET /v0/domains/{domain_id}/members/{member_id}/traffic-status` (base rate vs purchased extra) so the user can see remaining traffic and decide how much to buy.

**Purchase.** App-side [CIP-0103](https://github.com/canton-foundation/cips/blob/main/cip-0103/cip-0103.md) client (`@canton-network/dapp-sdk`). Users connect with a [CIP-0103](https://github.com/canton-foundation/cips/blob/main/cip-0103/cip-0103.md) wallet, including wallets reached through WalletConnect’s Canton integration.

Preferred command, when the Token Standard traffic-purchase path is deployed (splice [\#7255](https://github.com/canton-foundation/canton-dev-fund/pull/7255) / \#7427): the app builds a [CIP-0056](https://github.com/canton-foundation/cips/blob/main/cip-0056/cip-0056.md) `TransferFactory_Transfer` ([CIP-0112](https://github.com/canton-foundation/cips/blob/main/cip-0112/cip-0112.md) `TransferFactory` when the connected wallet is V2) to the reserved traffic-purchase receiver (`cip-<N>_traffic-purchase::…`, CIP number TBD in the public-sequencer CIP). Memo is URL-query style: `memberId=…&synchronizerId=…&migrationId=…&trafficAmount=…`. Input holdings are unlocked CC selected via the Holding interface (V1 or V2; same `Amulet` contracts). Choice context and disclosed contracts come from Scan’s transfer-factory registry. Internally Splice still burns via the shared `buyMemberTraffic` helper and creates `MemberTraffic`.

Fallback command, until that path is on the target network: the app constructs `AmuletRules_BuyMemberTraffic` with the connected wallet party as `provider`, the resolved participantId as `memberId`, the chosen `trafficAmount` in bytes, Scan-derived `synchronizerId` and `migrationId`, `expectedDso`, `InputAmulet` holdings covering the quoted CC, and `TransferContext`. This matches today’s validator top-up loop and Wallet Kernel `AmuletService.buyMemberTraffic`.

The payer signs in the wallet and must hold enough unlocked CC for the burn, and enough sequencer traffic on their own host to submit. Locked holdings and [CIP-0112](https://github.com/canton-foundation/cips/blob/main/cip-0112/cip-0112.md) committed allocations are not used as inputs. A [CIP-0112](https://github.com/canton-foundation/cips/blob/main/cip-0112/cip-0112.md) burn to `cip-112/burn` / `cip-112_no-owner` (\#6990) does not credit traffic.

### Architectural Alignment

Uses the same on-chain traffic credit as the validator top-up loop (`MemberTraffic` plus sequencer `SetTrafficPurchased`). Command construction and signing go through [CIP-0103](https://github.com/canton-foundation/cips/blob/main/cip-0103/cip-0103.md) (`@canton-network/dapp-sdk`); WalletConnect is only a connect transport where the wallet supports it. No Wallet Provider bypass.

Purchase API preference: Token Standard transfer to the reserved traffic-purchase receiver (splice [\#7255](https://github.com/canton-foundation/canton-dev-fund/pull/7255)), so wallets that already implement [CIP-0056](https://github.com/canton-foundation/cips/blob/main/cip-0056/cip-0056.md) or [CIP-0112](https://github.com/canton-foundation/cips/blob/main/cip-0112/cip-0112.md) transfers do not need a proprietary `BuyMemberTraffic` choice. Fallback: `AmuletRules_BuyMemberTraffic` until that receiver is live. [CIP-0112](https://github.com/canton-foundation/cips/blob/main/cip-0112/cip-0112.md) is the CC holding and history layer (`Holding` V1+V2, `EventLog_HoldingsChange` on the burn), not a replacement purchase choice. Complementary to [\#527](https://github.com/canton-foundation/canton-dev-fund/pull/527) (party-level traffic is a future extension) and distinct from [\#6990](https://github.com/canton-foundation/canton-dev-fund/pull/6990) (generic CC burn). Traffic price and floor are read live from Scan, so SV changes to AmuletRules, round, or `ExternalPartyConfigState` pricing do not require an app redeploy.

---

## Milestones and Deliverables

All dates from grant approval. Grant closes on **M5.6** (\~38 weeks: 12 weeks build, M4 verdict, six maintenance months). Build milestones include one week for Committee review.

| Milestone | Timing |
| :---- | :---- |
| M1 Design, calculator, resolution, CC-path legal sign-off | Week 3 |
| M2 [CIP-0103](https://github.com/canton-foundation/cips/blob/main/cip-0103/cip-0103.md) flow, three-wallet test (TestNet) | Week 6 |
| M3 Audit, 1.0, MainNet release | Week 12 |
| M4 Stripe/onramp feasibility verdict | Weeks 13 to 16 post-release (2 to 4 weeks) |
| M5.1 to M5.6 Monthly maintenance | Months 1 to 6 post-release |

### Milestone 1

- Technical design, threat model, TestNet calculator, participant/party resolution with traffic status  
- **Legal sign-off on the CC-path app** (non-custodial operator model, jurisdictional and regulatory requirements, ToS and geoblocking, optional platform fee). Stripe, fiat onramp, and payment-stack legal work are **M4**, not M1.  
- Public repo with CI (lint, unit, integration)  
- Purchase-path decision: detect the Token Standard traffic-purchase receiver on TestNet; specify memo schema and `BuyMemberTraffic` fallback; input selection is unlocked Holding CIDs only

### Milestone 2

- End-to-end TestNet purchase via `prepareExecute` using the Token Standard transfer path if deployed, otherwise `BuyMemberTraffic`; `MemberTraffic` referenced; traffic balance re-read  
- FCS completes a traffic purchase through the app with each of three different wallets (from three wallet providers); matrix published (wallet, provider, environment, target validator, purchase path used, pass/fail)  
-   
- [CIP-0103](https://github.com/canton-foundation/cips/blob/main/cip-0103/cip-0103.md) error paths (4001, 4200); internal security review; E2E suite in CI

### Milestone 3

- v1.0 tagged; operator and deployment guide published; MainNet reference instance kept current from this tag  
- **Same three wallets** repeat the purchase on MainNet; matrix updated. If splice [\#7255](https://github.com/canton-foundation/canton-dev-fund/pull/7255) is on MainNet by M3, the matrix uses the Token Standard path; otherwise the fallback is documented and switching is in M5  
- External audit (command construction for both paths, calculator, [CIP-0103](https://github.com/canton-foundation/cips/blob/main/cip-0103/cip-0103.md) flow, app); Critical/High resolved; report published  
- M5.1 and M4 clock start on acceptance

### Milestone 4

**Estimated delivery:** **2 to 4 weeks** after M3 acceptance (runs in parallel with M5.1).

**Focus:** Product and legal consolidation and partner outreach for **fiat onramp / Stripe feasibility only**. No live Stripe or fiat checkout in this grant. Separate from M1 CC-path legal sign-off: M4 covers payment-stack options, KYC requirement, and partner viability with Foundation wallets-team input and direct Stripe and onramp outreach.

**Deliverables / value metrics:**

- Outreach log: Stripe and relevant onramp partner contacts pursued and outcomes recorded  
- **Feasibility verdict document** (legal \+ product): recommended payment/onramp stack, explicit **go**, **no-go**, or **conditional go** outcome, jurisdiction and KYC requirements for a follow-on implementation, documented alternative if no-go  
- Handover notes for the separate payment integration proposal if go or conditional go  
- **Milestone payment on Committee acceptance** (independent of M5)

### Milestones 5.1 to 5.6

Each month FCS delivers a maintenance report within five business days of month end: tagged patches, changelog against splice [\#7255](https://github.com/canton-foundation/canton-dev-fund/pull/7255) / [CIP-0107](https://github.com/canton-foundation/cips/blob/main/cip-0107/cip-0107.md), wallet-matrix diffs, and fixed issues. Partial payment on acceptance. Late or rejected report pauses that month only. A MainNet reference instance is kept current so each release is exercised against live AmuletRules, Scan, and wallet behaviour before it is tagged.

---

## Delivery and Acceptance Model

Build milestones (M1 to M3): review-ready tag plus completion notes in the Development Fund issue.

**M4 and M5 are independent.** M4 pays on verdict acceptance; each M5 month pays on maintenance report acceptance.

Maintenance follows approved grants [**\#47**](https://github.com/canton-foundation/canton-dev-fund/pull/47) and [**\#50**](https://github.com/canton-foundation/canton-dev-fund/pull/50): monthly deliverables, partial payout, optional quarterly reassessment of workload and CC price on remaining M5 months.

Scope changes that require architectural rework beyond this document pause the affected milestone until recorded and priced via scope amendment.

**Acceptance checks**

- Committee member completes TestNet purchase from fresh clone with repo docs and a listed [CIP-0103](https://github.com/canton-foundation/cips/blob/main/cip-0103/cip-0103.md) wallet  
- Audit report public; zero open Critical or High findings  
- FCS demonstrates a successful traffic purchase with each of three different wallets on TestNet and MainNet  
- M5 reports list tagged releases and compatibility patches

---

## Funding

**Total Funding Request:** **2,437,000 CC**  
**Reference rate:** **USD 0.0911 per CC** (CoinGecko, 16 September 2026\)  
**Implied USD amount:** **USD 222,000**

The request covers twelve weeks of build and audit, the M4 feasibility verdict, and six months of post-release maintenance. Engineering and UI/UX hours convert at **3,293 CC/h** (USD 300), project management at **2,469 CC/h** (USD 225), and internal legal at **9,329 CC/h** (USD 850 pass-through). Audit and external legal counsel fees are pass-through at cost. **M1 external counsel (USD 15k)** covers CC-path sign-off only; onramp and Stripe legal analysis is funded in **M4** (internal legal hours).

| Milestone | Eng h | UI/UX h | PM h | Legal h | Third-party | CC |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| M1 | 56 | 16 | 12 | 10 | External legal counsel USD 15k, CC-path (\~165k CC) | 525,000 |
| M2 [CIP-0103](https://github.com/canton-foundation/cips/blob/main/cip-0103/cip-0103.md) purchase, three-wallet test | 96 | 28 | 12 | — | — | 438,000 |
| M3 | 67 | 24 | 19 | 2 | Audit USD 35k (\~384k CC) | 749,000 |
| M4 Feasibility verdict and partner outreach | 8 | — | 48 | 14 | — | 275,000 |
| M5.1–M5.6 (each) | 16 | 3 | 5 | — | — | 75,000 |
| **Total** | **323** | **84** | **121** | **26** |  | **2,437,000** |

### Volatility Stipulation

Fixed USD at approval: M1 USD 47,800, M2 USD 39,900, M3 USD 68,250, **M4 USD 25,050** (\~EUR 23,200), each M5 month USD 6,825 (total USD 222,000). CC recomputed from 30-day CoinGecko moving average at milestone submission ([\#262](https://github.com/canton-foundation/canton-dev-fund/pull/262) pattern). Quarterly M5 reassessment optional per [\#47](https://github.com/canton-foundation/canton-dev-fund/pull/47)/[\#50](https://github.com/canton-foundation/canton-dev-fund/pull/50) terms.

**M4 effort basis:** partner outreach (Stripe and onramp contacts), product consolidation, and internal legal support for the verdict document. M4 is funded at EUR 20,000–25,000 scale; roughly half of the build hours originally earmarked for M3 partner-outreach overlap move to M4, with the remainder retained in M3 for audit remediation and the v1.0 MainNet release..

### Timeline Accountability

- **Acceleration:** \+20% on M3 if v1.0 and audit report delivered \>1 month early  
- Milestones \>60 days late subject to Committee review and renegotiation

---

## Co-Marketing

Canton Forum write-up on validator bootstrap and recovery; app listed in FCS public tooling; operator guide in onboarding docs; wallets-team onramp coordination per M4 verdict.

---

## Motivation

Every validator on Canton needs synchronizer traffic to submit transactions. Traffic is purchased by burning CC, crediting a sequencer member (`memberId`). Today that burn is `AmuletRules_BuyMemberTraffic`; splice [\#7255](https://github.com/canton-foundation/canton-dev-fund/pull/7255) exposes the same helper as a Token Standard transfer to a reserved receiver.That model works when the operator holding CC is the same party running the validator, but it breaks down in the two situations where new network participants most often get stuck.

**Recovery.** A validator with no base traffic and no purchased extra traffic can't submit the `SetTrafficPurchased` request needed to top up as that request itself requires traffic. Base traffic only recovers during inactivity; an active validator keeps draining its balance through routine submissions like ACS commitments or enqueued transactions, so it doesn't get the idle window needed to recover on its own.

The deadlock has two independent triggers: either the validator is out of traffic, or the wallet funding the top-up is out of CC. An automated top-up only solves the second case if the first hasn't happened yet. It can't submit anything once traffic hits zero. Recovery then depends on an external sponsor; a separate party with sufficient funds on a participant node with sufficient traffic of its own submitting the `SetTrafficPurchased` request on behalf of the depleted participant.

Today that intervention is opaque: manual `BuyMemberTraffic` commands, ad hoc runbooks and provider-specific support channels. It does not scale to the broader validator set and is not available to every operator on the network.

### Evidence from production operations

FCS sees this problem daily as a node-as-a-service operator on MainNet. Even relying on the top-up setup provided by the participant node, we have faced cases where our nodes depleted the traffic faster than triggering the automation, which we could only mitigate due to us running multiple setups that could purchase traffic on behalf of others in such cases. This is not applicable to the overall ecosystem and is not a fallback capability that other validators can reuse.

An open source reference app with a published operator guide, **proven with three different wallets** from ecosystem providers, would give any CC holder a standard path to fund or restore a validator without routing through a specific NaaS provider.

### Ecosystem alignment

This proposal complements rather than duplicates funded protocol work:

- [**\#527 User-Paid Traffic Accounting**](https://github.com/canton-foundation/canton-dev-fund/pull/527) targets wallet-level traffic attribution and local accounting primitives. This grant uses today's validator `memberId` model.

Six months of post-release maintenance (M5) gives the Committee measurable evidence: tagged compatibility patches, wallet-native [CIP-0103](https://github.com/canton-foundation/cips/blob/main/cip-0103/cip-0103.md) usage, and whether the Token Standard purchase path can replace ad hoc `BuyMemberTraffic` runbooks.

---

## Rationale

FCS understands the limitation of the existing solution and the need to enable the ecosystem to execute a self-service traffic purchase independent from the validator itself. We operate validators on MainNet and execute traffic purchases for other validators in production, delivered Dev Fund grant [**\#444**](https://github.com/canton-foundation/canton-dev-fund/pull/444) (Splice governance UI, 18 accepted upstream issues), and understand Scan pricing, `BuyMemberTraffic` construction and wallet signing flows from production NaaS work. Further we operate the Vala wallet, where we implemented [CIP-0103](https://github.com/canton-foundation/cips/blob/main/cip-0103/cip-0103.md) already, giving us the needed understanding of how the whole workflow and integration is to be implemented.

The grant funds a focused utility: open source app, external audit, three-wallet validation by FCS, feasibility assessment for optional fiat onramps (M4), and post-release maintenance on the model used in approved grants [**\#47**](https://github.com/canton-foundation/canton-dev-fund/pull/47) and [**\#50**](https://github.com/canton-foundation/canton-dev-fund/pull/50). That scope is reviewable and produces artefacts any operator or wallet team can reuse.

---

## Team and Qualifications

- Canton integration engineer: calculator, resolution, [CIP-0103](https://github.com/canton-foundation/cips/blob/main/cip-0103/cip-0103.md), audit remediation  
- Frontend engineer: reference and production app  
- PM: Committee alignment, wallet partners, auditor, counsel

**Track record:** Grant \#444 (393,000 CC, 18 issues); 15+ customer validators on MainNet; manual traffic purchase runbooks.

---

## Risks and Mitigations

| Risk | L | I | Mitigation |
| :---- | :---- | :---- | :---- |
| Fewer than three wallets available for M2 test | L | M | FCS uses wallets from additional non-custodial providers |
| Token Standard traffic-purchase path (\#7255) not on TestNet by M2 | M | M | M2 uses `BuyMemberTraffic` fallback; switch when the sentinel party and memo contract are published; no extra Daml in this grant |
| Sentinel party or memo schema changes before the CIP number is assigned ([\#7255](https://github.com/canton-network/splice/issues/7255)) | M | M | Read receiver and field names from live Scan/docs, not hardcoded DAR constants; M3 re-validates |
| DAR or factory changes to `BuyMemberTraffic` or `TransferFactory_Transfer` | L | H | Live config and registry choice context; dual-path in M1; M3 re-validates on MainNet |
| Auditor delays M3 | M | M | Engage at M1; audit parallel to late M2 |
| Stripe or onramp partner outreach slow in M4 | M | M | Verdict documents partial progress; conditional go with remediation plan |
| M4 no-go on Stripe | M | L | Payment proposal not filed; wallet-only documented; M5 continues |
| External legal counsel fees exceed USD 15k | M | L | Scope amendment before expanded counsel scope |

## 

## Ecosystem Impact

- Validator bootstrap and recovery via self-service traffic purchases on MainNet  
- Reference [CIP-0103](https://github.com/canton-foundation/cips/blob/main/cip-0103/cip-0103.md) app over the Token Standard traffic-purchase transfer, with `BuyMemberTraffic` fallback: forks, operator guide, three-wallet matrix including purchase path  
- Reduced manual NaaS top-ups

---

## Maintenance and Sustainability

After M5.6, the repository and operator guide let any operator run the app. FCS intends to continue maintenance if usage warrants; further work via a separate proposal or rolling grant. Apache 2.0; offered for transfer to Foundation GitHub at release.

---

## Related proposal

Live payment integration: `[traffic-purchase-app-payment-proposal.md](traffic-purchase-app-payment-proposal.md)` (contingent on M4 **go**).
