# Calend: Open RWA Credit & Collateral Standard for Tokenized Vaults

**Proposing organization:** Vigente Protocol
**Author / primary contact:** Lucas Cifuentes (CEO & Founder, Vigente Protocol) — zzzbedream@gmail.com — GitHub @zzzbedream
**Champion:** Needs Champion
**Proposal type:** RFP-aligned — RFP 12 (RWA Standards → *Repo, collateral, lending, and servicing workflows*), RFP 13 (Payments & DeFi)
**Suggested SIGs:** Token Standards / Asset Standards · DeFi Protocols & Liquidity · Decentralized Attestor Pools · Financial Workflows & Composability
**License:** Apache-2.0
**Duration:** 18 weeks (4.5 months)
**Funding request:** 750,000 CC

# Abstract

Tokenized RWA vault shares on Canton cannot be used as lending collateral today. The Tokenized Vault Standard ([#863](https://github.com/canton-foundation/canton-dev-fund/pull/863)) defines how shares are issued and priced. Regulated-token work ([#881](https://github.com/canton-foundation/canton-dev-fund/pull/881)) restricts who may hold them. But no shared component answers the questions a lender needs answered: how much can be lent against these shares, how is their value protected from manipulation, and who receives them on default when they cannot be sold on a public DEX?

Calend is an open, Apache-2.0 Daml standard and reference implementation for that missing layer. It has three components:

1. **CreditPassport**: a non-transferable borrower credential issued by a threshold of attestors. Private financial evidence is never disclosed to lenders.
2. **NavGuard**: an asymmetric valuation guard on top of a vault's `convertToAssets` rate.
3. **MarginController**: a lending-facility template with a first-loan throttle. Liquidation goes to an allowlisted liquidator, is agreed at origination, and settles through CIP-112 allocations.

It is not a lending protocol. Lending markets, including the curated lending vaults being built on #863, can adopt it to accept restricted RWA shares as collateral.

# Specification

## 1. Objective

RFP 12 asks for reusable Daml models and reference implementations for "repo, collateral, lending, and servicing workflows", including "conformance tests and reference implementations", and asks that they support multiple issuers and applications. Calend delivers this for one specific, unsolved case: **collateral that cannot be liquidated through a public market**.

Public-market DeFi lending sets LTV from exit liquidity: if the borrower defaults, the protocol sells. Regulated RWA vault shares break that assumption:
- transfers to non-allowlisted parties are rejected (#881);
- secondary liquidity is shallow or absent;
- the reference DEX settlement pattern ([#108](https://github.com/canton-foundation/canton-dev-fund/pull/108)) assumes freely transferable assets.

Lenders therefore either refuse these assets or apply punitive haircuts. Calend replaces "sell on default" with two mechanisms:
- **underwriting on verified borrower history**;
- **a settlement path agreed by all parties at origination**.

## 2. What Already Exists vs. What Is Net-New

| Layer | Exists today | Gap Calend fills |
|---|---|---|
| Holdings, transfers, allocations | CIP-56, CIP-112 (Token Standard v2) | — (Calend builds on it) |
| Vault shares and pricing | Tokenized Vault Standard #863 (`convertToAssets`, async redeem) | No guard against stale or inflated rates when shares are used as collateral |
| Regulated transfer controls | Regulated Token Standard #881 (open) | No liquidation path that respects the allowlist |
| Price / data feeds | RedStone CAPS [#497](https://github.com/canton-foundation/canton-dev-fund/pull/497) (approved), DIA multi-oracle [#873](https://github.com/canton-foundation/canton-dev-fund/pull/873) (open) | Feeds report a value; nothing turns that value into a collateral rule |
| Settlement / DEX | Reference settlement pattern and DEX #108 | Designed for freely transferable assets |
| Borrower credit | — | **No standard credential for verified repayment history or default status** |

Net-new: CreditPassport, NavGuard and MarginController (with conformance tests), plus a TypeScript attestor SDK.

## 3. Implementation Mechanics

### 3.1 CreditPassport: threshold attestation without divulgence
- **Phase 1, private.** The borrower creates a `PrivateFinancialSubmission`. Its only stakeholders are the borrower and the attestor set; it holds a hash of the evidence and the minimal fields needed to review it.
- **Approval.** Each attestor approves with its own authority (`signatory borrower, approvals`). Finalization requires `size approvals >= threshold` (for example 3 of 5).
- **Phase 2, credential.** Finalization archives the submission and creates a separate `CreditPassport` with no ContractId or payload from the submission. It contains only `reputationScoreBps`, `completedCleanLoans`, `maxAllowedLtvBps`, `isSlashed` and `evidenceRootHash`.
- **Why lenders see nothing private.** Lenders and margin governance are observers of the passport only. They never become informees of the submission, so the private data is not divulged to them.
- **Attestor pool deployment.** The reference uses an explicit attestor set. Deployments can instead use a single decentralized party (PartyToParticipant threshold hosting), for example as provided by BitSafe's Decentralization Manager.
- **Non-transferable.** No choice on the passport changes the borrower.
- **Default handling.**
  - `TriggerImmutableSlash` is controlled by margin governance and authorized in advance by the borrower when the passport is created.
  - It sets `isSlashed = True` and `maxAllowedLtvBps = 0`, which the template's `ensure` clause then enforces.
  - `RecordCleanRepayment` advances the credit ladder and is rejected on slashed passports.
  - A slashed passport cannot be reused. It cannot be silently replaced by a new attestation either: attestors are required to check slash records, and that rule is specified and tested in M2.

### 3.2 NavGuard: asymmetric valuation
NavGuard wraps the share-to-asset rate reported by a #863 vault, which an oracle such as RedStone CAPS or DIA can cross-check:
- **Downward moves** (`newRate <= current`) apply immediately, so health checks see impairment at once.
- **Upward moves** must wait `minUpwardInterval` since the last update and are capped at `maxUpwardStepBps` per update.

This blocks the attack pattern of inflating an illiquid vault's rate just before borrowing against it. It complements #863's own first-depositor protections, which cover share minting, not collateral valuation.

### 3.3 MarginController: credit ladder and pre-agreed liquidation
- **Origination.** A facility needs the signatures of margin governance, the lender, the borrower and an allowlisted liquidator (a secondary buyer or the issuer's redemption facility). These are collected with a standard propose/accept flow.
- **Checks at opening:**
  - per-asset exposure cap;
  - first-loan cap while `completedCleanLoans == 0`;
  - `principal <= collateralValue × min(assetMaxLtv, passport.maxAllowedLtv)`.
- **Collateral.** Collateral shares are locked as a CIP-112 `Allocation`. On default the lock is settled to the liquidator through the instrument admin's `SettlementFactory`. Because the registrar co-validates settlement, the #881 allowlist is enforced at the moment collateral moves.
- **Default (`ExecuteDeterministicDefault`).** Allowed only if the loan is past maturity, or if `principal × 10000 > collateralValue × liquidationLtvBps` (a zero valuation counts as undercollateralized). In one transaction it settles the collateral to the liquidator and slashes the passport. No auction or AMM is involved.
- **Repayment.** It releases the allocation and records a clean repayment, raising future limits.

### 3.4 TypeScript attestor SDK
`@vigente/calend-sdk` lets attestors and data providers sign and submit attestations and rate updates through the Ledger API.

### 3.5 Prior work
The same risk model (threshold attestation, asymmetric NAV guard, first-loan throttle) runs as Soroban contracts on Stellar testnet as part of Vigente Protocol. A Daml prototype of the three Calend templates already exists. It builds against SDK 3.4.11, and its Daml Script tests cover threshold enforcement, privacy isolation, NAV asymmetry, the first-loan throttle, default with slashing, and clean repayment. We can share it with reviewers on request.

## 4. Long-Term Ownership and Maintenance

Vigente Protocol commits to maintaining Calend for at least 12 months after Milestone 3:
- compatibility updates for Daml SDK, CIP-112 and #863 changes;
- bug fixes;
- reviewing external contributions.

This is funded from protocol operations, with no additional grant. All code, specifications and tests are Apache-2.0 under a public repository. We will transfer it to a Canton Foundation organization if the committee prefers.

## 5. Architectural Alignment

- **RFP 12, RWA Standards.** A reusable collateral and lending workflow for restricted RWAs, with conformance tests, built on CIP-56/CIP-112 and #863 and compatible with #881. The passport is provider-neutral: any attestor set can issue it and any lending application can read it.
- **RFP 13, Payments & DeFi.** Opens credit workflows for assets that cannot route through the reference DEX (#108). This adds productive activity on the Global Synchronizer.
- **Ecosystem dependencies:**
  - BootNode's canton-token-forge ([#889](https://github.com/canton-foundation/canton-dev-fund/pull/889)) as the reference instrument in tests;
  - canton-testkit ([#888](https://github.com/canton-foundation/canton-dev-fund/pull/888)) for end-to-end tests, if those proposals are funded (otherwise plain Daml Script / LocalNet);
  - RedStone CAPS (#497) and DIA (#873) as oracle inputs to NavGuard.
- **Decentralized attestor pools.** Designed to run on a decentralized party, for example BitSafe's Decentralization Manager.

# Milestones and Deliverables

## Milestone 1: CreditPassport and NavGuard (weeks 1–6) — 225,000 CC
**Deliverables:**
- Public specification of the CreditPassport and NavGuard interfaces, circulated in the relevant SIGs for feedback.
- Daml packages `calend-credit-passport` and `calend-nav-guard`, wired to the #863 Vault interface.
- Daml Script suite: threshold enforcement, privacy isolation, asymmetric rate behavior.

**Ecosystem value:** Lending applications get a reusable borrower credential and a manipulation-resistant valuation source for any #863 vault.

## Milestone 2: MarginController and CIP-112 liquidation (weeks 7–12) — 262,500 CC
**Deliverables:**
- Daml package `calend-margin-controller`: origination flow, exposure caps, first-loan throttle, CIP-112 allocation lock and `SettlementFactory` settlement to an allowlisted liquidator, atomic slash.
- LocalNet end-to-end tests of both lifecycles (clean repayment → ladder upgrade; default → settlement + slash), using a #881-style restricted instrument.
- Conformance test suite that any alternative implementation can run.

**Ecosystem value:** A tested reference showing that restricted RWA shares can be lent against and resolved on default without a public market.

## Milestone 3: Hardening, SDK and first adoption (weeks 13–18) — 262,500 CC
**Deliverables:**
- External privacy and authorization review (observer minimization, no divulgence, archival hygiene), with all high and critical findings fixed.
- `@vigente/calend-sdk` (TypeScript) and builder documentation, including an integration guide for lending vaults.
- TestNet deployment with transaction references covering attestation, rate updates, origination, repayment and default.
- At least one external team integrates or commits to integrate Calend (public repository or comment on this PR).
- Workshop for the relevant SIGs.

**Ecosystem value:** A reviewed, documented standard, with evidence of use outside the proposing team.

# Acceptance Criteria

- **M1:** Packages build with `dpm build`. Tests show:
  - fewer than `threshold` approvals cannot finalize;
  - a non-stakeholder party's query for `PrivateFinancialSubmission` returns nothing;
  - rate drops apply immediately, while rises are capped and fail during cooldown.

  Specification published and SIG feedback logged.
- **M2:** LocalNet tests demonstrate:
  - first-loan cap enforced when `completedCleanLoans == 0`;
  - default settles collateral to the allowlisted liquidator via CIP-112 with no DEX/AMM leg;
  - the passport remains slashed and cannot be upgraded.

  Conformance suite published.
- **M3:** Review report published with zero open high or critical findings; SDK published on npm; TestNet transaction references listed; at least one external integration or written commitment.

# Funding

**Total:** 750,000 CC, fixed in CC (duration ≤ 6 months).

| Milestone | Weeks | CC |
|---|---|---|
| M1 CreditPassport + NavGuard | 1–6 | 225,000 |
| M2 MarginController + CIP-112 liquidation | 7–12 | 262,500 |
| M3 Hardening, SDK, adoption | 13–18 | 262,500 |

**Effort basis:** two full-time contributors for 18 weeks:
- Lucas Cifuentes: specification, architecture, ecosystem coordination;
- Cristian: Daml and TypeScript development.

The budget also covers an external privacy and authorization review in M3.

# Live Reference Pilot (not grant-funded)

Vigente is in early discussions with a battery energy storage (BESS) and mining operator in Chile about a reference pilot. No agreement has been signed. If it goes ahead, Vigente would run it at its own cost. Settlement data from Chile's National Electrical Coordinator, electronic tax invoices, and operational telemetry would feed the attestor flow and NavGuard on TestNet. The pilot is outside the scope of this grant and is not an acceptance criterion. The idea follows BitSafe's self-funded CBTC proof point in its Decentralization Manager proposal.

# Co-Marketing

At each milestone, Vigente will coordinate with the Canton Foundation on:
- the announcement;
- a technical write-up on lending against restricted RWAs on Canton;
- a case study once an external integration is live.

# Motivation

RWA issuance on Canton is moving faster than the infrastructure to use those assets productively. Vault and regulated-token standards make RWAs representable. Calend makes them borrowable, without weakening the transfer restrictions that make them compliant.

# Rationale

## Why Vigente
Vigente Protocol builds reputation-underwritten RWA credit on Stellar Soroban. Its threshold attestation, asymmetric NAV guard and first-loan throttle already run as Soroban contracts on testnet. Calend ports that risk model to Daml, where Canton's sub-transaction privacy lets borrower financials stay private by construction rather than only off-chain.

## Why this approach
- **Agreed liquidation paths** use what Canton already provides: multi-party authorization and allocation settlement co-validated by the registrar. Defaults resolve deterministically and stay within allowlists.
- **Asymmetric valuation** reflects the actual risk of illiquid collateral: losses must show up immediately, while gains can wait.
- **A credential rather than a score oracle** means any lending application can read a borrower's verified history without seeing the evidence behind it.
