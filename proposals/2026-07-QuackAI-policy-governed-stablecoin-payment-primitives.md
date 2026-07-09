## Development Fund Proposal

**Author:** Lynn
**Status:** Draft
**Created:** 2026-07-09
**Label:** financial-workflows-composability

**[Champion](https://github.com/canton-foundation/canton-dev-fund/blob/main/sig-directory.md):** need Champion

---

## Abstract

RedStone brought institution-grade NAV and price data onto Canton as its first oracle (December 2025), so a tokenized fund's NAV can be delivered on-ledger to authorized parties. But when that NAV means money is owed to holders (a redemption, a coupon, a dividend), the money does not move by itself. What actually happens is this: the issuer's back office runs a private script, finance reconciles a spreadsheet, someone manually approves a transfer. The asset is tokenized and the data is on chain, yet the payout, the last step, still lives in private code and manual process at every single issuer: off chain, opaque, rebuilt by each firm, with each firm carrying its own risk.

Quack AI will close that gap and hand it to the ecosystem as an open-source public good (Apache-2.0): a set of Daml primitives that let an on-ledger event (a NAV update, a coupon date, a redemption request) trigger a USDCx payout directly, with the spending rules (per-transaction and cumulative limits, payee allowlists, time windows, approval holds, expiry) enforced by the ledger itself, not by anyone's script. Any Canton app or RWA issuer can adopt them instead of building privately.

This is not a concept. We have already shipped the exact same pattern in production on EVM: a RedStone NAV feed triggering a policy-checked, gasless stablecoin payout, proven by a real on-chain settlement and validated by an independent audit. This proposal ports a working mechanism to the network where it belongs: Canton.

---

## Specification

### 1. Objective

The problem is easiest to see as the scene it actually is. A tokenized money market fund on Canton updates its NAV daily. Holders redeem, the fund pays coupons. This should be a straight line from data to money. Today that line breaks in the middle: the oracle can put the NAV on chain and the ledger can settle USDCx, but the logic of "under what conditions, to whom, and at most how much" has no shared, audited primitive to live in. So every issuer faces two options: fall back to manual operations (slow, costly, and at odds with the point of tokenization), or write private payout code (unaudited, at their own risk, and rewritten from scratch by the next issuer).

The result is a paradox: assets on Canton are programmable, but paying is not.

The outcome we deliver: an issuer adopts these primitives, and a NAV update leads to a ledger-level rules check and then an automatic USDCx payout. No human in the loop, no gas exposure for recipients, and every spending rule sits on the ledger where auditors and risk teams can read it.

### 2. Implementation Mechanics

The primitive set (Apache-2.0) consists of:

1. **PolicyHook**: the on-chain spend-control engine, enforced as transaction preconditions: per-transaction and cumulative or rolling limits, payee allowlists, time windows, approval holds, and expiry. Cumulative and rolling limits are maintained via a counter contract, with the concurrency design validated against Amulet and Splice patterns.
2. **AgentPayment**: a gasless USDCx transfer initiated under PartyId-delegated authority, so an automation or issuer process can settle within scoped, revocable permissions.
3. **AgentIdentity**: a scoped, revocable authorization mapping an external or automation identity to a Canton party.
4. **SDK, a reference integration, and documentation** for adoption.

Data flows through it as follows: an oracle or issuer event (for example, a NAV update disclosed to the receiving party) is read, evaluated against PolicyHook, and, if it passes, settled as a USDCx transfer over the Token Standard, end to end, with no gas exposure for the recipient.

Quack has already implemented and shipped this mechanism on EVM: a RedStone signed NAV feed, then a policy check, then an automatic gasless stablecoin payout. It is live in production across 11 EVM mainnets, proven by a real on-chain settlement (Apollo ACRED NAV triggering a gasless USDT redemption on BNB: https://bscscan.com/tx/0x40d36571cb31bc6246045080f5a1ef22a1920ee12457730f8e0b9619c49bd6a2), covered by 42 integration tests within a 1,588-test suite, validated by an independent adversarial audit of the money path (0 critical or high findings), and distributed through our open-source MCP (github.com/bitgett/q402-mcp).

This proposal ports that proven design to Canton's Daml model, which differs architecturally: oracle data is consumed via explicit disclosure, initiation authority via PartyId delegation, and settlement via the Token Standard. The port is genuine engineering, not a copy of the EVM contracts.

### 3. Architectural Alignment

- Builds directly on existing Canton primitives (USDCx, PartyId delegation, CIP-56 DvP, native oracle data) and adds the missing programmable-payout and spend-control layer, rather than replacing any of them.
- A genuine common good: any participant can adopt it, and it complements rather than competes with oracles, issuers, and wallets.
- Advances the Foundation's network-growth priority by giving external-chain users and stablecoin flow a concrete reason and path to settle on Canton.
- Ships a reusable reference implementation other builders can fork.

### 4. Backward Compatibility

No backward compatibility impact. These are new, additive primitives that build on existing Canton components and do not modify USDCx, the Token Standard, PartyId delegation, or any existing app.

---

## Milestones and Deliverables

Confidence in this timeline comes from a proven design: the same mechanism already runs in production on EVM, so the engineering here is a Daml port and Canton-native adaptation, not new mechanism research. Core delivery (M1 through M3) is compressed into four months; M4 keeps a realistic adoption window. Each milestone is verified before payment, and acceptance is based on ecosystem value, not artifact delivery.

### Milestone 1: Core primitives on TestNet
- **Estimated Delivery:** Week 6 from grant approval
- **Focus:** AgentPayment, PolicyHook, and AgentIdentity Daml templates, with a test suite and a published design doc.
- **Deliverables / Value Metrics:** Primitives pass the test suite on DevNet and TestNet; design doc published so other builders can evaluate and reuse the approach.

### Milestone 2: Reference integration (event to policy to payout)
- **Estimated Delivery:** Month 2.5
- **Focus:** An end-to-end reference flow where an oracle or issuer event (for example, a NAV update) triggers a policy-checked USDCx payout, plus issuer-facing integration documentation.
- **Deliverables / Value Metrics:** Live TestNet demo of the full flow; copy-paste integration doc that lets an issuer wire up automated disbursement without rebuilding spend control.

### Milestone 3: MainNet and public release
- **Estimated Delivery:** Month 4 (build ready earlier; the independent security review runs as an external four-to-six-week cycle alongside)
- **Focus:** MainNet deployment, Apache-2.0 repository, SDK, docs site, and an independent third-party security review.
- **Deliverables / Value Metrics:** Contracts live on MainNet; public repo and docs available to all builders; published security-review report.

### Milestone 4: Adoption
- **Estimated Delivery:** Months 5 to 6
- **Focus:** Real ecosystem use of the primitives.
- **Deliverables / Value Metrics:** At least one third-party issuer or app adopts the primitives in a live flow, with measurable external stablecoin volume routed into Canton settlement through them.

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone
- Demonstrated functionality or operational readiness, verifiable on chain or in the public repo
- Documentation and knowledge transfer provided
- Alignment with stated value metrics

Project-specific conditions:

- Milestone 2 is accepted on a working TestNet demonstration of event to policy check to USDCx payout, not merely on passing tests.
- Milestone 4 is accepted on demonstrated third-party adoption and measurable inbound stablecoin volume into Canton, not on artifact delivery.

Funding for a milestone is released only after its acceptance criteria are met.

---

## Funding

**Total Funding Request:** 1,800,000 CC (final figure to be confirmed with the Champion after headcount scoping; denominated in Canton Coin).

### Payment Breakdown by Milestone
- Milestone 1 (Core primitives on TestNet): 360,000 CC upon committee acceptance
- Milestone 2 (Reference integration): 540,000 CC upon committee acceptance
- Milestone 3 (MainNet and public release): 630,000 CC upon committee acceptance
- Milestone 4 (Adoption): 270,000 CC upon final acceptance

### Volatility Stipulation
Project duration is under 6 months. Should the timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones will be renegotiated to account for USD and CC price volatility.

---

## Co-Marketing

Upon release, Quack AI will collaborate with the Foundation on:

- Announcement coordination for the public release of the primitives
- A technical blog or case study documenting the event-to-policy-to-payout pattern and the first live integration
- Developer and ecosystem promotion, including SDK and MCP distribution and an issuer-facing integration guide

Where the participating oracle or issuer agrees, Quack will also co-announce the reference integration, subject to their review of any joint messaging.

---

## Motivation

Why institutions need this comes down to one sentence: institutions do not lack the desire to automate, they lack the permission.

An automated process that can initiate payments is a problem in front of any risk committee: what stops it from overpaying, what stops it from paying the wrong party, who catches a failure. Today's answers are either "a human is watching" (which is not automation) or "our own code has checks" (private, unaudited, unconvincing to risk). This is exactly why tokenized-fund operations on Canton have not truly automated. What is missing is not data and not settlement. It is a layer of ledger-enforced spending rules an institution can sign off on.

Our primitives change the answer: limits, allowlists, time windows, and approvals are written into the ledger as transaction preconditions. A payment that violates the rules is not caught after the fact; it simply cannot be constructed. That is automation an issuer can take into a risk committee: shared, open source, independently audited, and every adopter stops paying for the same logic and the same audit over and over.

Who benefits: any Canton RWA issuer or app that needs automated disbursement (redemptions, coupons, dividends), a shared need across the tokenized-fund use cases the network is targeting. The benefit compounds: every additional adopter removes one more private risk codebase from the ecosystem, and every integration routes external stablecoin flow into Canton settlement, which is the network growth the Foundation prioritizes.

---

## Rationale

This is the right approach for three reasons.

First, it extends rather than replaces. It builds on Canton's existing USDCx, PartyId delegation, CIP-56, and oracle data, and adds only the missing payout and spend-control layer as new, additive primitives. It does not fork or duplicate any existing component; where Canton already provides a capability, the primitives consume it.

Second, the design is already proven and de-risked. Quack has shipped this exact event-to-policy-to-gasless-payout pattern in production on EVM, with a real on-chain settlement, an independent adversarial audit of the money path (0 critical or high findings), and open-source distribution. The mechanism, the safety posture (fail-closed reads, single-fire trigger logic, no double payment across retries), and the policy engine are not theoretical. The grant funds porting a working design to Canton's Daml model, not researching a new one.

Third, it is delivered as a neutral public good by a commercially self-sustaining team. Quack operates a live, revenue-generating product, so this is a contribution to the ecosystem rather than a subsidy the team depends on, and everything is released under Apache-2.0 for anyone to adopt or fork. Canton and Daml delivery is led by the Quack AI engineering team, which includes engineers with Daml and Canton experience.
