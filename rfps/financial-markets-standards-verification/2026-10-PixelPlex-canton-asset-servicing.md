## Development Fund Proposal

**Organization:** PixelPlex  
**Author / Primary Contact:** Semyon Protas, Yury Korzun (PixelPlex)  
**Status:** Draft  
**Created:** 2026-10-27  
**Proposal Type:** RFP-aligned  
**RFP / Roadmap Area:** Financial Markets, Standards & Verification. RFP 12 RWA Standards, sub-area "Daml and Institutional RWA Workflow Standards": item 4 (corporate actions and other asset lifecycle events), item 7 (repo, collateral, lending and servicing workflows), item 8 (interoperability between Canton applications), item 11 (conformance tests and reference implementations).  
**Champion:** `Needs Champion`  
**Total Funding Request:** 2,400,000 CC  
**Project Duration:** 9 months (delivery in 28 weeks; adoption payments until month 9)  
**Label:** token-asset-standards  

---

## Abstract

We propose an open standard for servicing tokenized securities on Canton. Servicing covers announcing a coupon, dividend or redemption, then recording who is entitled to it as of a record time and how much has been paid. It also covers redirecting the payment to a pledgee when the security is pledged, and correcting it after money has moved. CIP-0056 and CIP-0112 define holdings and transfers but not servicing. As a result, every registry models servicing on its own, and every custodian, collateral application and wallet integrates with each registry separately.

Version 1 covers cash distributions, full redemption, a pledge redirect and corrections. It adds five Daml interfaces on top of CIP-0112, pays over the existing transfer and allocation flows, and records each payment in the same transaction that makes it. We deliver the CIP, the interface package, a reference registry, a conformance suite that other registries run themselves, and a demonstration in which a registry and an independent custodian agree on every figure for a pledged bond. Half of the 2,400,000 CC is paid only for adoption by teams other than PixelPlex. Everything is Apache-2.0.

The companion implementation draft, [`2026-10-PixelPlex-canton-asset-servicing-implementation-draft.md`](./2026-10-PixelPlex-canton-asset-servicing-implementation-draft.md), has the interfaces in Daml, the derivation and settlement rules, the privacy analysis, the demonstration setup and the conformance scenarios.

---

## Specification

### 1. Objective

Make servicing of a tokenized security work across applications from different vendors, as transfers already do.

A registry that issues a bond on the token standard can move it with the standard. To service it, the registry uses its own contracts for the announcement, its own rule for who gets paid and its own record of payments. Counterparties reconcile these by file, by API or by hand. The standard has five gaps, checked against Splice 0.8.3 and unchanged through 0.9.4:

1. **No event object** to state "instrument X pays 2.5 per 100 units, record time 2026-12-29T22:00Z, payment time 2026-12-31".
2. **No entitlement** that payer, payee, custodian and auditor all read the same way: who is owed how much as of a record time, how it was computed and how much has been paid.
3. **Locked holdings carry no economic meaning.** `Lock` (`HoldingV2.daml:48`) has holders, two expiry fields and a free-text `context`. A pledged holding cannot say that the coupon belongs to someone other than the recorded holder.
4. **No correction path** linking a wrong event, the corrected one, what was paid and what is still owed.
5. **No shared arithmetic**, so two correct implementations can disagree on the last decimal.

Version 1 covers one instrument's life: cash distributions, full redemption, a pledge redirect, payment with a record of what has been paid, and corrections. Holder elections, unit changes, partial redemption, residual allocation against a funded total, securities-lending equivalent payments, and mergers, spin-offs or rights issues are extensions. Each is a separate package on top of this one and is proposed separately. An extension reuses version 1's keys, leaves its interfaces as they are, and puts what it adds in interfaces of its own.

### 2. Implementation Mechanics

Section numbers in parentheses in this section refer to the implementation draft.

**The three objects.** Roles are technical. An account provider is the party in `Account.provider`, and a paying agent is the party that exercises the settlement choice. Neither implies a licensed function.

- *Lifecycle event*. The instrument admin announces a cash distribution or a redemption. The announcement gives the rate per unit, the payment instrument, the **record time** that fixes who is entitled, the **payment time** and the rounding rule. Its observers are narrow, so holders do not see each other. Each holder gets the terms on its own entitlements (§4.1).

- *Entitlement*. There is one per event and holding account, plus one per redirect on it. It holds the units at the record time, gross, deductions, net, the account it is payable to, and **how much has been paid**. Whoever sees the holding sees the entitlement. The paying agent sees it too, and so do the pledgee and its provider for a redirected share. Its `paidAmount` changes only through a payment, in the same transaction as the payment; a correction replaces the entitlement and carries `paidAmount` over (§7). `LifecycleEvent_SettleBatch` pays a batch of entitlements and `Entitlement_Settle` pays one (§4.2, §6).

- *Entitlement redirect*. For pledged assets. It says that income on up to a given number of units in an account is owed to the pledgee's account, for a class of events and a period. It attaches to the account, not to a holding contract, because holdings are re-created on every transfer and lock. As with a V2 transfer instruction, one party proposes and each other party approves with its own command. The owners of both accounts always approve, so a custodian cannot redirect a client's income alone (§4.3).

**How payment happens.**

```
 registry announces       registry derives at        paying agent exercises      existing token-standard flow
 LifecycleEvent    ─────▶ record time, one     ────▶ LifecycleEvent_       ────▶ SettlementFactory_SettleBatch
 (rate, record time)      Entitlement per            SettleBatch                 (receipt allocations of the
                          account and redirect       (one transaction            payable accounts, one cash
                                                     per batch)                  allocation of the paying agent)
                                                           │
                                                           └─▶ each entitlement re-created with paidAmount increased
```

Each payable account, or its provider, signs once a receipt-only authorization for the paying agent, following `TradeSettlementAgreement` in the token standard's `TradingAppV2` example. For each event the paying agent creates receipt allocations for the payable accounts and one allocation of its own cash, then settles them in batches through `SettlementFactory_SettleBatch` inside `LifecycleEvent_SettleBatch`. The payment and the updated `paidAmount` are one transaction, so a retry cannot pay twice and nothing is marked paid without being paid. A redemption is paid the same way and in full. Its units go to the `cip-112/burn` account in the same transaction where the holder's allocation exists. The registry freezes the instrument from shortly before the record time (§6). A wallet sees the payment in the token standard's own event log, `EventLog_HoldingsChange`, with the entitlement reference on the leg.

**Arithmetic.** The standard fixes the record-time snapshot, the rounding and the deduction bases. Each holder's figure depends only on that holder's units, so a custodian can recompute every line for its own clients (§5). Test vectors come at Milestone 2.

**Corrections.** Nothing is erased or changed in place. A corrected event supersedes the old one. Each affected entitlement is replaced, the old and new records point to each other, and the replacement inherits what has already been paid:

| | Amount |
| --- | --- |
| Original entitlement | 100 |
| Paid before the correction | 40 |
| Corrected entitlement | 90 |
| Still owed, paid as an ordinary settlement | 50 |

If the corrected amount is below what was paid, the difference is recorded as a claim and is never paid as a negative transfer. A change to the record time, the event kind or the payment instrument is a cancellation followed by a new announcement (§7).

**Off-ledger API.** `servicing-v1.yaml` follows the shape of the shipped registry API. It lists an instrument's events and serves the factories and choice contexts that redirects and settlement need. Entitlements are read from the Ledger API only (§8).

**Cost.** There is one entitlement contract per event and account, plus one per redirect, and it is re-created on every payment and correction. An instrument with 50,000 holders that pays quarterly has about 200,000 entitlements a year. Traffic on Canton depends mainly on the number of views per transaction (CIP-0112 §4.3.8). Derivation, payment and correction each take one transaction per batch. Views grow linearly with the batch: one per entitlement for derivation and correction, and about two or three per entitlement for payment (§4.2). Milestone 3 measures and publishes views and bytes per transaction on the reference registry. We also put a batched entitlement to the SIG (§12.3, §12.6).

**Deliverables.**

- The CIP.
- The Daml package `cn-servicing-api-v1` with its OpenAPI.
- A reference bond registry on the test-harness pattern of `splice-token-standard-v1-test`.
- A conformance package, `cn-servicing-test`, which a third-party registry copies and runs against its own implementation.
- TypeScript reading code for wallets and applications (events, entitlements, servicing payments in the token standard's event log, a client generated from `servicing-v1.yaml`), proposed to the Wallet SDK (`canton-network/wallet`).
- A small `dpm` CLI that compares two parties' records field by field for Milestone 5.

Package names are working names for the Token Standards SIG to confirm. Everything is Apache-2.0. We propose the interface package and the suite to `canton-network/splice` beside `splice-api-token-*` (draft §12.1). Until merged, they are released from our public repository and installed with the Milestone 2 guide. If Splice also ships them in its releases, the manual step goes away; that is the maintainers' decision.

**Integration paths** (draft sections in brackets).

- **Registry.**
  - Implement the five interfaces on its own templates and pass `cn-servicing-test` (§11).
  - Create a redirect register per account and instrument.
  - Announce events, derive entitlements from the snapshot at the record time (§5), and freeze the instrument before a redemption.
  - Serve `servicing-v1.yaml` and pay, itself or through a delegated paying agent, in batches (§6).
- **Account provider (custodian).**
  - Vet the packages on its participant (Milestone 2 guide).
  - Sign, or have its clients sign, the receipt-only authorization.
  - Recompute its clients' entitlements from its own participant and compare them with the registry's (§5.5).
  - Approve redirects on client positions where the registry's policy asks for it.
- **Collateral application (pledgee).**
  - Approve, or propose, a redirect with its cap, event kinds and period (§4.3).
  - Reconcile the redirected entitlement's `paidAmount` against receipts into its account.
  - Revoke the redirect when the pledge is released.
- **Wallet.**
  - Show the user's entitlements: due, paid and outstanding, including corrections and overpayment claims (§7).
  - Recognize payments by the `cip-<nr>/` keys in `EventLog_HoldingsChange` (§6).
  - Show the receipt-only authorization and redirect requests for the user to sign, approve or revoke.

### 3. Architectural Alignment

- Adds to CIP-0056 and CIP-0112, which already provide accounts, custody relationships and mint and burn accounts. No existing interface changes, and no existing package gets a new major version (§4).
- Uses the standard's own extension points: factories, `_PublicFetch` in its V2 form, `ExtraArgs` / `ChoiceContext`, and `Metadata` keys. The keys are prefixed with the CIP number, `cip-<nr>/`, as the V2 packages in Splice prefix theirs with `cip-112/` (draft §6, §12.1).
- Follows Canton's privacy model. The registry already sees every holding, so deriving entitlements tells it nothing new. A redirect tells it who the pledgee is. The pledge terms stay in their own application. Draft §9 lists what each party learns, including the two cases where a pledgee can infer the holder's position. We put this list to the Milestone 1 gate.
- Supports multiple issuers and applications, as RFP 12 requires. Nothing in the design assumes a single registry, a single custodian or a service run by PixelPlex.
- Does not depend on Daml Finance. Digital Asset no longer develops it, it has no release for Canton 3.x, and extending it would not reach registries built directly on the token standard, where most assets are. Draft §3.1 relates its lifecycle effects to servicing objects.

### 3a. Relationship to adjacent work

Our scope is the servicing record shared across applications, with its derivation and its settlement. The record is the event, the entitlement and what has been paid on it, and the redirect that follows a pledge.

| Adjacent work | Overlap | Boundary |
| --- | --- | --- |
| Token Standard V2 / CIP-0112 (Digital Asset, approved) | accounts, custody relationships, event log, mint and burn accounts | we build on it and take the CIP through the same Token Standards SIG |
| RedStone CAPS #497 (approved) | verified corporate-action data, including record and payment dates and entitlement parameters | an oracle for the announcement. A registry can take event terms from it. It defines no on-ledger entitlement that a payment consumes, no record of payment, no pledge redirect and no correction after payment |
| Merkl #806 (open) | dividend, coupon and yield payouts, with Merkl as onchain paying agent | a paying-agent service. This proposal is the shared record it would pay against, through `LifecycleEvent_SettleBatch` |
| Canton Reward Engine #672 (in vote) | calculating and distributing rewards, yield and dividends | a distribution engine inside one application. It could settle against servicing entitlements |
| DTCC Tokenization Service (live on Canton) | on-chain Treasury servicing, with equity and ETF corporate actions on its 2027 roadmap | servicing inside one platform. A standard lets counterparties read the same record from any registry |
| Kaiko corporate-actions data on Canton ([offered](https://onchain.kaiko.com/reference-data-canton)) | announced corporate actions | a data feed, with no entitlement and no record of payment |
| DA Registry (Digital Asset, shipped) | issuing and moving registry assets | its documented workflows define no servicing objects. A registry like it is what the standard is for |
| Token Data Disclosure #878 (PixelPlex), canton-token-forge #889 (open) | default or reference tokens for CIP-0056 and CIP-0112 | holding layers. The Milestone 3 reference registry uses #878's token if it has shipped (see Funding). Servicing is funded only here |
| Daml Finance; `ex-asset-servicing` (Digital Asset; no longer developed, archived) | lifecycle effects inside one application, and holder-side processing | neither can be read by a second application or runs on Canton 3.x. We compare them in draft §3.1 |
| Common Asset #232, Risk Engine #665, alphaPilot #758, Vault Infrastructure #796, regulated tokens #881, Zoniqx #19, SIT #918 (open); Tokenized Vault Standard #863 (approved) | locks and liquidation; risk; asset discovery; vaults; regulated tokens; issuance and distribution on DA Registry; a token with its own dividend templates | applications and token layers that can carry or consume events and entitlements. None defines a record that other vendors' applications read |

### 4. Backward Compatibility

The package adds interfaces and modifies no shipped package. A registry that adopts servicing forces no upgrade on its wallets or counterparties, and an application that does not implement the interfaces behaves as it does today. Extensions are separate packages, and the conformance suite pins behaviour per Splice release in CI.

---

## Milestones and Deliverables

Engineers from the Console Wallet team, which builds PixelPlex's Canton wallet, will do the work.

Weeks count from the proposal's approval.

### Milestone 1: Standard draft and feasibility gate
- **Estimated Delivery:** week 6
- **Focus:** CIP draft, interface definitions, the derivation specification, and settlement and correction semantics. The derivation specification covers the snapshot of holdings and redirects, the order of operations, rounding, deduction bases, and withholding as a declared input.
- **Deliverables / Value Metrics:** draft CIP submitted to and reviewed in the Token Standards / Asset Standards SIG, including the field-level mapping to ISO 20022 `seev` messages. Written reviews from at least **3 organizations**: at least one registry or issuer, one custodian or account provider, and one collateral application.
- **Feasibility gate, published either way:** entitlement derivation is demonstrated where the recorded holder, the account provider and the pledgee are three different parties. The five redirect disclosures of draft §9 are put in writing to at least one custodian and one buy-side holder. Each is asked whether it would allow a client position to be pledged under them, with reasons.

  **If the gate fails**, the Committee decides the scope and budget of Milestones 2 to 5. Our proposed fallback restricts the redirect's beneficiary to an account **owned by** the holder's own provider, so no pledgee is named on the ledger. It drops the cross-provider case from Milestone 5 and reduces Milestone 5 by 200,000 CC.

### Milestone 2: Daml package and registry API
- **Estimated Delivery:** week 12
- **Focus:** `cn-servicing-api-v1` (lifecycle event, entitlement with settlement, redirect) with `servicing-v1.yaml`, published under Apache-2.0.
- **Deliverables / Value Metrics:** the package builds against the current Splice release and the one before it. The DAR is released in the public repository with its package ID and hash. A short guide for participant operators says which nodes need it (those hosting the registry, the paying agent, holders, their providers and beneficiaries). It also says how to upload it with `vetAllPackages = false`, vet it through `POST /v2/package-vetting/update` and check the result through `/v2/package-vetting/list`. We publish test vectors for the derivation. They cover rounding boundaries in every direction at scales 0 and 10, the overflow boundary, deductions on each basis, zero entitlements, holdings and redirects on each side of the record time, partial and multiple redirects, and a position below its committed caps. At least one Milestone 1 reviewer or Token Standards SIG member reruns them from the repository and confirms the result publicly.

### Milestone 3: Reference registry and conformance suite
- **Estimated Delivery:** week 18
- **Focus:** a reference bond registry that pays coupons and redeems at maturity, with pledge scenarios, and `cn-servicing-test` in the same form as the existing V1/V2 test packages. Before any servicing code runs, the reference registry needs a full token-standard V2 holding layer: holdings, a transfer factory, an allocation factory and a settlement factory. It uses #878's default token if that has shipped. Otherwise we build and cost the minimal layer in this milestone.
- **Deliverables / Value Metrics:** the reference registry passes the twenty scenarios of draft §11. They include a coupon on a pledged holding with the pledgee at a different provider, a redirect built one party per command, settlement on retry and concurrently, redemption under a record-time freeze, and corrections after partial payment. Each scenario asserts field-by-field equality, not only totals. At least one Milestone 1 reviewer or Token Standards SIG member runs the suite from the public repository and confirms the result publicly. The views and bytes of each servicing transaction type, measured on the reference registry, are published with the suite. The TypeScript reading code (entitlements from the Ledger API, event terms from the entitlement or the registry's API, servicing payments recognized by the reference keys in `EventLog_HoldingsChange`) and the comparison CLI ship here. Pull requests are opened to `canton-network/wallet` with the reading code and to `canton-network/splice` with the package and the suite, and their review comments are addressed. Merging is the maintainers' decision and not a condition of payment. If a pull request is declined, the code stays in our repository and the decision is recorded publicly.

### Milestone 4: Independent adoption
- **Estimated Delivery:** claimable from the delivery of Milestone 3 (week 18) until 9 months after the proposal's approval, about five months after the conformance suite is published.
- **Focus:** adoption by parties other than PixelPlex, paid per adopter.
- **Deliverables / Value Metrics:**
  - **Each independent registry or issuer** that implements the interfaces and passes the full conformance suite on its own participant, with published results: 75,000 CC, for up to two.
  - **Each such registry that then services a real instrument in production on MainNet** (at least one announced and settled coupon, distribution or redemption under the standard): a further 225,000 CC, for up to two.
  - **Each independent application** (a custodian, a collateral application or a wallet) that reads entitlements of at least one servicing event on a real instrument **in production on MainNet**, and shows or acts on them, including what has been paid: 150,000 CC, for up to two.
  - Payment uses V2 allocations, which every CIP-0112 registry supports. Canton Coin implements them, but only for basic accounts (an owner, no provider, the default account id). A pledged position sits in accounts held at custodians, so the MainNet tranches for that case need a V2 cash instrument that supports provider accounts and accepts a receipt allocation from a single account party.
  - "Independent" means neither operated nor authored by PixelPlex. PixelPlex's own Console Wallet does not count. Each adopter is confirmed by a public repository or a public comment from the adopting team.

### Milestone 5: Cross-application demonstration and handover
- **Estimated Delivery:** week 28. The third-party portion can be claimed until 9 months after the proposal's approval.
- **Focus:** the end-to-end case this proposal is for, plus documentation and maintenance.
- **Deliverables / Value Metrics:** **a registry and a custodian application, each on its own participant, process a coupon on a pledged security, including a corrected event after partial payment, and produce matching entitlement records.** We demonstrate this on DevNet or TestNet using the setup in draft §10, which fixes every account, its owner and provider, and what each party observes. We publish a transcript, and at least one Milestone 1 reviewer reproduces it. If at least one of the two applications is neither operated nor authored by PixelPlex, the demonstration evidences the standard and earns the first half of the third-party portion. The second half is paid when that application processes a real servicing event in production on MainNet (see Funding). We also deliver a getting-started guide, integration guides for registries, account providers, collateral applications and wallets, a reference architecture, and a 12-month maintenance commitment from PixelPlex.

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone
- Demonstrated functionality against local Canton, DevNet and an authorized MainNet participant where applicable
- Documentation and knowledge transfer provided
- Alignment with stated value metrics

Project-specific conditions:

- The CIP goes through the standard CIP process. The handover part of Milestone 5 is paid when the CIP is **approved**. If approval is still pending three months after the demonstration, the Committee decides on that payment. If the Token Standards SIG directs the design differently, the milestones are adjusted with the Committee.
- "Matching entitlement records" means field-by-field equality of the figures that the custodian (the holder's account provider) derives independently from its own participant. These figures are units, the split per redirect, gross, deductions on a gross or remaining basis, net, payable account, and what was paid on the holder's share. Each side runs the published CLI on its own data. The full list is in draft §5.5. Comparing the registry's contract with itself does not count.
- Adoption is evidenced by public repositories or a public comment from the adopting organization. A PixelPlex customer counts only if it runs its own participant and implements independently, with no PixelPlex-authored commits in the implementation.
- The third-party portion of Milestone 5 (300,000 CC) requires at least one of the two applications in the demonstration to be neither operated nor authored by PixelPlex. Half of it also requires that application to process a real servicing event in production on MainNet within the adoption window. The rest of Milestone 5 is accepted on the demonstration and handover either way and paid on approval of the CIP.
- All code, specifications, test vectors and documentation are public under Apache-2.0 throughout the project, not only at the end.
- If the design shows that a servicing case cannot be represented without changing an existing token standard interface, we publish that finding and raise it with the SIG instead of working around it privately.

---

## Funding

**Total Funding Request:** 2,400,000 CC

### Payment Breakdown by Milestone
- Milestone 1 (Standard draft and feasibility gate): 250,000 CC upon committee acceptance
- Milestone 2 (Daml package and registry API): 300,000 CC upon committee acceptance
- Milestone 3 (Reference registry and conformance suite): 450,000 CC upon committee acceptance
- Milestone 4 (Independent adoption): up to 900,000 CC, paid per independent adopter as listed in Milestone 4
- Milestone 5 (Cross-application demonstration and handover): 500,000 CC. Of this, 200,000 CC is paid when the demonstration and handover are accepted and the CIP is approved, and 300,000 CC is for the third-party portion as listed in Milestone 5

| | Paid regardless of adoption | Paid only for independent adoption | of which only for MainNet production |
| --- | --- | --- | --- |
| Milestones 1–3 | 1,000,000 | | |
| Milestone 4 | | 900,000 | 750,000 |
| Milestone 5 | 200,000 | 300,000 | 150,000 |
| **Total** | **1,200,000 (50%)** | **1,200,000 (50%)** | **900,000 (37.5%)** |

The 300,000 CC of adoption money not tied to MainNet pays for independent implementations that pass the conformance suite and for an independent application in the demonstration. Both show that others can implement the standard. If nobody else adopts, PixelPlex delivers all of the work for half its price and carries that risk.

### Effort basis

The work is **75 engineer-weeks** over 28 weeks, roughly 17 person-months. The request is priced at 32,000 CC per engineer-week, which is the full 2,400,000 CC. The part paid regardless of adoption comes to about 16,000 CC per engineer-week.

| Milestone | Engineer-weeks | Effort |
| --- | --- | --- |
| 1 | 13 | an architect throughout, a second Daml engineer, financial-domain review, the gate interviews and their write-up |
| 2 | 14 | the interface package, the OpenAPI, the test vectors, CI against two Splice releases |
| 3 | 24 | the reference registry (events, derivation, redirects and register, settlement, corrections), the twenty-scenario suite, the TypeScript reading code (proposed to the Wallet SDK) and the comparison CLI |
| 4 | 8 | integration support for independent registries and applications |
| 5 | 8 | the DevNet or TestNet demonstration with a custodian application on its own participant, the guides and reference architecture |
| across | 8 | project management and Token Standards SIG coordination |

The reference registry is a reference and test implementation, not a production registry. It is not audited under this grant.

**Funded once.** If #878's default token has shipped by Milestone 3, the reference registry uses it. Milestone 3 is then reduced by 75,000 CC, about four engineer-weeks at that milestone's rate. Adoption then makes up just over half of 2,325,000 CC.

**If the Milestone 1 gate fails,** we publish the results and the Committee decides the scope and budget of the remaining milestones. Our proposed fallback restricts the redirect's beneficiary to a provider-owned account. It drops the cross-provider case from Milestone 5, which becomes 300,000 CC. Of this, 100,000 CC is for the demonstration and handover, and 200,000 CC for the third-party portion, split evenly between the demonstration and MainNet production. The total becomes 2,200,000 CC, and the share that depends on adoption stays at half.

### Volatility Stipulation
The grant is denominated in fixed Canton Coin, with no repricing in USD. PixelPlex carries the price risk in both directions. The template lets the Committee re-evaluate at the 6-month mark. If the Committee uses that option, the re-evaluation applies only to milestones not yet delivered.

### Maintenance
PixelPlex commits to 12 months of maintenance after Milestone 5, at its own cost. It covers **the current and the previous Splice release** at any point in those 12 months. These are the two releases the conformance suite pins in CI. Maintenance is done in Splice if the packages have been merged there, otherwise in our repository. It keeps the package, the reference registry and the suite compatible with each new Splice release within 30 days of that release. It also includes security fixes and issue triage within 5 business days. Older releases are not maintained. The extensions listed in §1 are proposed separately.

---

## Co-Marketing

Upon release, the implementing entity will collaborate with the Foundation on:

- Announcement coordination for each milestone
- A technical blog per milestone and a case study with the first independent adopter
- A workshop in the Token Standards / Asset Standards SIG and recorded training for the Foundation's materials
- Listing in the ecosystem directory alongside the token standard packages

---

## Motivation

Much of an institution's operational effort goes into servicing: getting the coupon to the right party on the right day, redeeming at maturity, keeping a record of what has been paid, and correcting terms that were announced wrong. The Foundation's 2026–2028 roadmap lists corporate actions and asset lifecycle events as an RFP area.

Income-bearing instruments already settle on Canton. Société Générale issued a SOFR-linked floating-rate bond on the Global Synchronizer in November 2025, with BNY as paying agent ([press release](https://www.societegenerale.com/en/news/press-release/first-digital-bond-united-states-blockchain)). DTCC's Tokenization Service lists Canton, with CIP-56 tokens, as live at launch. It services tokenized US Treasury distributions and maturities on-chain, with payments in fiat to participants' traditional accounts. Expanded servicing of equity and ETF corporate actions is on its 2027 roadmap ([DTCC](https://communications.dtcc.com/rs/669-QIL-921/images/DTCC%20Tokenization%20Service%20At-a-Glance.pdf)). Tokenized money market funds such as Hashnote's USYC are on the network ([press release](https://www.canton.network/canton-network-press-releases/hashnote-brings-usyc-to-the-canton-network-to-offer-the-first-tokenized-money-market-fund-with-built-in-privacy)). In a cross-border intraday repo on tokenized UK gilts in February 2026, TreasurySpring embedded the haircuts and repo interest in the smart contracts of the trades themselves ([press release](https://www.canton.network/canton-network-press-releases/cantons-industry-working-group-advances-cross-border-collateral-mobility-on-canton)). Each of these is serviced inside its own platform, by its own paying agent and its own contracts. So a custodian, collateral application or wallet that holds two of them integrates twice.

A common case is a bond pledged as collateral, where the recorded holder is not the party owed the coupon. The registry, the custodian, the collateral application and the wallet are four products from four vendors. The token standard tells all four who holds what. It does not tell them who gets paid, or whether they have been paid.

**Who benefits.** Registries that issue income-bearing instruments, custodians that provide accounts, collateral applications, and wallets that display positions. Each of them today either builds a bilateral integration per counterparty or reconciles by file.

**How it drives adoption.** The interfaces only add to the standard, so adoption can be gradual. A registry can announce events before anyone consumes them. A wallet can display them before any collateral application redirects them. A registry proves conformance by running the published suite, without PixelPlex in the loop. PixelPlex plans to use the holder side in Console Wallet, where users will see announced events, their entitlements and the amounts already paid. This is a first use and does not count as adoption. Milestones 4 and 5 pay only for independent organisations.

---

## Rationale

**Why this needs to be a standard.** If servicing is implemented in a single product, every wallet, custodian or collateral application still needs separate integrations with the products it works with. This proposal defines interfaces that independently developed applications can use together. That is why Milestone 5 requires two independent applications to agree, and why half of the funding depends on adoption by others.

**Scope of the first version.** Coupons, redemption, pledges and corrections are enough to test whether two applications can agree on the entitlement and track the amount paid. Elections, unit changes and securities lending bring rules of their own and are left out so they do not delay that.

**Recording entitlements and settling payments.** If two parties calculate entitlements independently, discrepancies may surface only at reconciliation, weeks later. Here the entitlement is recorded on-ledger and consumed in the same transaction as the payment. This prevents the same entitlement from being settled twice and defines how a payment relates to a subsequent correction.

**Keeping redirects separate from `Lock`.** Adding redirect logic to `Lock` would require every registry to handle collateral and every collateral application to use the same lock semantics. It would also change a V2 interface. The proposal uses a separate object attached to a position instead. The registry needs to know which party should receive the payment, but not why the redirect was created.

**Using existing payment flows.** Payment runs over the existing V2 allocation and transfer flows, which applications already display and settle, so the proposal adds no new payment rail (draft §6, §10). Whether the receipt-only authorization should itself be an interface is an open question for the SIG (draft §12.5).

**Relation to ISO 20022.** Custodians and paying agents already exchange corporate-action messages (`seev.031` notification, `seev.035` preliminary advice, `seev.036` confirmation, `seev.039` cancellation). Events, entitlements, payments and cancellations map onto them, and the event carries its ISO event type (`INTR`, `DVCA`, `REDM`, `MCAL`) in `meta` (draft §3.2). Two things do not map one to one: a correction after payment, which ISO handles by reversing a booked movement (`seev.037`) while this standard carries `paidAmount` forward, and the redirect, which has no ISO counterpart.

**Why not V2 settlement objects.** An event resembles a V2 settlement, entitlements its legs, and partial payments and corrections its iterations. They differ where servicing needs a record. An allocation authorizes a movement and is archived when it settles, so nothing remains that states what was owed and what was paid. V2 legs are whatever the executor specifies. V2 has no rule that derives them from holdings at a record time. A receipt allocation cannot be iterated (`ensureIsReceiptAllocation` requires `nextIterationFunding = None`), so partial payments are separate settlements that something has to link. A correction arrives after the money has moved and can leave an overpayment, which no V2 leg can express. So we add the record and keep V2 for everything that moves (draft §3):

| From V2 | Added by this standard |
| --- | --- |
| accounts, `InstrumentId`, `HoldingView` | the record-time snapshot and the derivation rule |
| receipt allocations, `SettlementFactory_SettleBatch`, the burn account | the entitlement: what is owed and what has been paid |
| `EventLog_HoldingsChange` | supersession of events and entitlements, with `paidAmount` carried over |
| factories, `ExtraArgs`, `ChoiceContext` | the redirect and its register |

**Alternatives considered.** We considered recording only the payment on-ledger while keeping servicing itself off-ledger. This would leave the entitlement outside the shared record, even though it is often the source of disagreement.

**About PixelPlex.** PixelPlex operates a Canton validator, four Featured Applications and an asset issuer. It builds CC View (explorer and data API), Console Wallet and CC Tag (Canton Name Service front end). It co-authored CIP-0103 (dApp Standard). It also authored the draft Standard Package Validation CIP (cips PR #168), which the funded Package Distribution proposal builds on. About a third of its 100 engineers work on Canton and Daml.
