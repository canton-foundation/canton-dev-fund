## Development Fund Proposal

**Author:** Michael Pappalardo, Dork Labs Inc. (michael@dork.fi)
**Co-Author:** Nicholas Shellabarger ([@temptemp3](https://github.com/temptemp3))
**Organization:** [Dork Labs Inc.](https://dorklabs.us/) — builders of [DorkFi](https://dork.fi)
**Status:** Draft
**Created:** 2026-03-13

---

## Abstract

Repo markets are the backbone of institutional short-term finance — yet they still rely on manual settlement, bilateral negotiation, and fragmented custody. This proposal funds the design, development, and live pilot deployment of a programmable repo market on Canton, enabling regulated participants to borrow against tokenized collateral and settle programmatically with full privacy between counterparties.

Dork Labs operates DorkFi (dork.fi), a live overcollateralized lending protocol on two blockchain networks with active markets, a native stablecoin, and a governance token. Our CTO has deep Haskell and functional systems experience directly applicable to DAML. This is not a greenfield proposal — it is an extension of proven lending infrastructure into the institutional domain.

All contracts and DAML templates will be delivered as open-source, reusable by any Canton participant. Target pilot counterparties include Circle (USDC liquidity), Ondo Finance (tokenized treasury collateral), and Anchorage Digital (institutional custody), with existing contacts at each organization.

---

## Specification

### 1. Objective

Short-duration repo agreements between regulated institutions are a multi-trillion dollar market. The friction in this market — manual execution, fragmented custody, bilateral opacity — is not a feature. It is a gap that programmable infrastructure on Canton can close.

The objective of this proposal is to build and deploy a production-grade repo market on Canton: a system where collateral is posted, funding is issued, and repayment is settled programmatically, with transaction privacy enforced at the protocol level. The output will be a working system with live transactions and a complete open-source codebase that any Canton participant can fork and deploy.

Dr. Amanda Martin (COO, Canton Foundation) is serving as our confirmed Tech & Ops Committee champion.

Dork Labs ([dorklabs.us](https://dorklabs.us)) is the right team to build this. We run DorkFi ([dork.fi](https://dork.fi)), a live lending protocol handling overcollateralized credit markets, liquidations, interest rate models, and a native stablecoin in production across two networks. We understand the mechanics of collateralized lending at the contract level. Our CTO's background in Haskell and formal systems translates directly to DAML. We are not learning this domain — we are applying what we already know to a new execution environment.

### 2. Implementation Mechanics

The system consists of four components, each delivered as open-source DAML contracts and supporting tooling:

**Repo Agreement Contracts**
DAML contracts governing loan issuance, collateral posting, repayment schedules, and automated settlement. Each contract defines principal, interest rate, collateral amount, maturity date, and counterparty identities. Contracts are visible only to authorized participants per Canton's privacy model.

**Collateral Vaults**
Vault contracts hold tokenized collateral (US Treasuries, tokenized money market instruments). Vaults enforce loan-to-value thresholds, margin requirements, and liquidation conditions. Anchorage Digital custody provides off-chain asset verification.

**Funding Pools**
Liquidity providers deposit stablecoins into pools. Borrowers draw funding via repo contracts. Interest rates are configurable and utilization-responsive — a model we have already implemented in production on DorkFi.

**Settlement Engine**
At maturity, borrowers repay principal plus interest, collateral unlocks automatically, and lender yield distributes — all on-chain with no manual intervention required.

---

**Pilot Architecture**

```
┌────────────────────────────┐
│      Circle Treasury       │
│   Stablecoin Liquidity     │
│          (USDC)            │
└──────────────┬─────────────┘
               │
               │ Funding Capital
               ▼
  ┌──────────────────────────┐
  │     Repo Funding Layer   │
  │     (DorkFi Contracts)   │
  │   Bilateral Term Funding │
  │   DAML Multi-Party Logic │
  └─────────────┬────────────┘
                │
   ┌────────────┼────────────┐
   │            │            │
   ▼            ▼            ▼
┌──────────┐ ┌───────────┐ ┌─────────────────┐
│   Ondo   │ │  Canton   │ │   Anchorage     │
│ Finance  │ │  Ledger   │ │   Digital       │
│Tokenized │ │ Privacy   │ │  Institutional  │
│  RWA /   │ │  Layer /  │ │  Custody &      │
│Collateral│ │Multi-Party│ │Collateral Verify│
└────┬─────┘ └─────┬─────┘ └───────┬─────────┘
     │             │               │
     │ Collateral  │ Contract Exec │ Custody Proof
     ▼             ▼               ▼

           Repo Agreement Lifecycle
  1. Collateral Locked  (Ondo → Anchorage custody)
  2. Repo Contract Created  (DorkFi DAML contract)
  3. Funding Issued  (Circle → Borrower)
  4. Maturity Settlement  (Borrower repayment)
  5. Collateral Released
```

### 3. Architectural Alignment

This proposal is built around Canton's specific capabilities, not adapted to them after the fact:

- **Privacy:** Repo counterparties require confidentiality on position sizes, collateral allocations, and loan terms. Canton's privacy model enforces this at the ledger level without requiring off-chain workarounds.
- **Multi-party workflows:** A single repo transaction involves a collateral issuer, a custodian, a liquidity provider, and a borrower. Canton's atomic multi-party model coordinates all four in a single workflow — something that cannot be replicated cleanly on a transparent public chain.
- **Regulated asset infrastructure:** The target assets (tokenized Treasuries, USDC) require permissioned access and verified identities. Canton's infrastructure handles this natively.
- **DAML:** Repo agreements are contracts with defined obligations, lifecycle events, and contingent settlement logic. DAML's type system is purpose-built for exactly this kind of financial modeling.

### 4. Backward Compatibility

No backward compatibility impact. This is new infrastructure deployed under isolated namespaces with no dependency on existing Canton contracts or workflows.

---

## Milestones and Deliverables

### Milestone 1: System Architecture and Contract Specification
- **Estimated Delivery:** Month 1
- **Focus:** Design and specification
- **Deliverables / Value Metrics:**
  - Full repo market system design document (open-source, publicly published)
  - DAML contract specifications for repo agreements, collateral vaults, and funding pools
  - Counterparty workflow documentation covering all interaction patterns
  - Architectural alignment writeup mapping design decisions to Canton primitives

### Milestone 2: Core Protocol Development
- **Estimated Delivery:** Month 2
- **Focus:** DAML contract implementation and unit testing
- **Deliverables / Value Metrics:**
  - Fully implemented and tested DAML repo agreement contracts
  - Collateral vault contracts with LTV enforcement and liquidation logic
  - Funding pool contracts with utilization-based interest rate model
  - Test suite with documented coverage across all lifecycle states

### Milestone 3: Integration and Testnet Deployment
- **Estimated Delivery:** Month 3
- **Focus:** Counterparty integration and Canton testnet deployment
- **Deliverables / Value Metrics:**
  - Circle USDC liquidity flow integration
  - Ondo Finance tokenized treasury collateral integration
  - Anchorage Digital custody verification integration
  - Live end-to-end transactions on Canton testnet with documented results
  - Settlement engine operational across full maturity lifecycle

### Milestone 4: Mainnet Pilot and Open-Source Release
- **Estimated Delivery:** Month 4
- **Focus:** Live pilot execution, open-source release, and documentation
- **Deliverables / Value Metrics:**
  - Minimum 3 executed repo transactions on Canton mainnet
  - Minimum $5M aggregate pilot transaction volume
  - Full open-source release of all contracts and tooling under permissive license
  - Developer documentation, deployment guide, and integration reference
  - Public case study co-authored with the Canton Foundation

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- All DAML contract code delivered as open-source under a permissive license by Milestone 4
- Demonstrated end-to-end repo lifecycle (create → fund → monitor → settle) on Canton testnet by Milestone 3
- Minimum 3 live repo transactions executed on Canton mainnet with documented counterparty participation
- Minimum $5M aggregate transaction volume across the pilot period
- Developer documentation sufficient for an independent team to fork and deploy the system
- Public case study published in coordination with the Canton Foundation

---

## Funding

**Total Funding Request:** 2,000,000 CC (~$300,000 USD at $0.15/CC, at submission date)

### Payment Breakdown by Milestone
- Milestone 1 — System Architecture: 400,000 CC upon committee acceptance
- Milestone 2 — Core Protocol Development: 600,000 CC upon committee acceptance
- Milestone 3 — Integration and Testnet Deployment: 600,000 CC upon committee acceptance
- Milestone 4 — Mainnet Pilot and Open-Source Release: 400,000 CC upon final acceptance

### Volatility Stipulation
Project duration is under 6 months. Should the timeline extend beyond 6 months due to Committee-requested scope changes, remaining milestones will be renegotiated to account for significant USD/CC price volatility.

---

## Co-Marketing

Upon completion of the mainnet pilot, Dork Labs will collaborate with the Canton Foundation on:

- Joint announcement of pilot results and open-source release
- Co-authored technical post covering the repo market architecture, DAML implementation, and lessons learned
- Case study documenting the counterparty workflow, transaction structure, and settlement mechanics for use by future Canton builders
- Participation in a Canton ecosystem event or developer forum upon invitation

---

## Motivation

Institutional repo markets process trillions of dollars in daily volume. The infrastructure running them is decades old. Settlement is slow, custody is fragmented, and counterparties have no privacy from each other or from intermediaries. The inefficiency is not incidental — it is structural, and it persists because no sufficiently capable programmable platform existed to replace it.

Canton changes that calculus. Privacy at the ledger level, atomic multi-party execution, and DAML's financial modeling primitives make Canton the first platform capable of running an institutional repo market that would actually satisfy a compliance team.

This proposal builds that system and runs a live pilot to prove it works. The deliverables — open-source DAML contracts, integration references, and a documented live pilot — become permanent infrastructure that subsequent Canton developers can build on. The counterparty relationships de-risk future institutional onboarding onto the network.

DorkFi provides the execution foundation. We run live credit markets in production. We have built the liquidation logic, interest rate models, and collateral management systems this work requires. We are bringing that operational experience to DAML and Canton, not starting from scratch.

---

## Long-Term Maintenance Plan

The open-source contracts and tooling delivered under this proposal will be maintained by Dork Labs as part of our active development portfolio. We have a direct operational incentive to keep this infrastructure current — DorkFi itself depends on the same collateral management and interest rate logic that underpins the Canton repo system.

Specifically:

- All DAML contracts will be published in a public GitHub repository under a permissive license, with versioned releases and a documented upgrade path
- Bug reports and security disclosures will be triaged within 72 hours and patched on a best-effort basis
- The codebase will be updated to remain compatible with Canton SDK releases for a minimum of 12 months post-delivery
- Dork Labs will accept and review community contributions via pull request

If Dork Labs ceases operations or discontinues maintenance, the codebase will remain publicly available and forkable by any Canton participant or Foundation-designated maintainer.

---

## Adoption and Distribution Plan

The open-source release is designed to be immediately usable by other Canton participants, not just Dork Labs. The adoption path has three layers:

**Pilot counterparty expansion**
The initial pilot with Circle, Ondo Finance, and Anchorage Digital establishes a working reference deployment. These organizations have networks of institutional counterparties. A successful pilot creates direct pull from their existing relationships into the Canton ecosystem.

**Developer reuse**
Each contract module (repo agreements, collateral vaults, funding pools, settlement engine) is designed to be independently deployable. A team building a different credit product on Canton can adopt the vault or settlement logic without taking the entire stack. The developer documentation and deployment guide are written for this use case explicitly.

**Canton Foundation co-promotion**
The co-authored case study and technical blog post (committed under Co-Marketing) will be distributed through Canton Foundation channels. This surfaces the reference implementation to other teams evaluating Canton for institutional use cases, reducing their time-to-build.

**Business Development strategy**
Dork Labs will actively pursue additional institutional counterparties and Canton ecosystem participants throughout the pilot period. This includes outreach to regulated financial institutions exploring tokenized asset infrastructure, engagement with existing Canton Foundation members and contributor organizations, and participation in relevant industry events and working groups (e.g., tokenized finance, digital asset lending, institutional DeFi). The goal is to identify at least two additional counterparty relationships beyond the initial three pilot participants before the Milestone 4 delivery, expanding the network effect of the open-source infrastructure from day one.

The goal is not a single pilot that ends at Month 4. It is a foundation layer that makes the next institutional lending product on Canton faster and cheaper to build.

---

## Rationale

The repo pilot scope was chosen over a broader institutional credit engine for three reasons.

First, repo agreements are the closest analog to existing institutional workflows. The operational familiarity lowers integration resistance with counterparties and reduces the risk of the pilot stalling on compliance or onboarding friction.

Second, short duration (7–30 days) compresses the feedback loop. Each transaction completes in weeks, not months. The committee can evaluate real results before the pilot concludes rather than waiting for a single final delivery.

Third, a tightly scoped pilot produces more reusable open-source output. The DAML contracts for a focused repo system are cleaner, better documented, and more forkable than contracts built for a sprawling multi-instrument credit engine.

The modular architecture — separate contracts for repo agreements, collateral vaults, funding pools, and the settlement engine — ensures each component can be independently adopted, extended, or replaced by future Canton developers without rebuilding the entire stack.
