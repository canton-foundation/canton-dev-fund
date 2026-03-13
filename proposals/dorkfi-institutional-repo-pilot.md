## Development Fund Proposal

**Author:** Michael Pappalardo, Dork Labs Inc. (michael@dork.fi)
**Status:** Draft
**Created:** 2026-03-13
**Architecture Diagram:** See [Pilot Architecture](#pilot-architecture) section below

---

## Abstract

Dork Labs proposes to build and deploy a pilot institutional term funding and repo market on the Canton Network. The system will enable regulated financial participants to borrow stablecoin liquidity, post tokenized collateral, and execute repo-style credit agreements that settle programmatically on Canton. All core contracts and DAML templates produced will be open-source and reusable by the broader Canton ecosystem. The pilot targets $5M–$15M in transaction volume across 7–30 day short-duration funding windows. Dork Labs has identified Circle, Ondo Finance, and Anchorage Digital as target pilot participants, with existing contacts at each organization.

---

## Specification

### 1. Objective

Institutional capital markets require programmable, privacy-preserving infrastructure for collateralized lending. Today, repo agreements between regulated counterparties involve manual settlement, bilateral negotiation, and fragmented custody. Canton's privacy model and multi-party workflow capabilities make it the natural platform for this use case.

The objective is to build a production-grade, open-source repo market system on Canton and run a live pilot with institutional counterparties. Successful delivery will produce reusable infrastructure that any Canton participant can deploy for similar use cases.

Dork Labs brings relevant production experience: we operate DorkFi (dork.fi), a live overcollateralized lending protocol on two blockchain networks with active markets, a native stablecoin (WAD), and a governance token (UNIT). Our CTO has deep experience in Haskell and functional contract modeling, directly applicable to DAML development.

### 2. Implementation Mechanics

The system consists of four components, each delivered as open-source DAML contracts and supporting tooling:

**Repo Agreement Contracts**
DAML contracts governing loan issuance, collateral posting, repayment schedules, and automated settlement. Each contract defines principal, interest rate, collateral amount, maturity date, and counterparty identities. Contracts are visible only to authorized participants per Canton's privacy model.

**Collateral Vaults**
Vault contracts hold tokenized collateral (US Treasuries, tokenized money market instruments). Vaults enforce loan-to-value thresholds, margin requirements, and liquidation conditions. Integration with Anchorage Digital custody provides off-chain collateral verification.

**Funding Pools**
Liquidity providers (Circle) deposit stablecoins into funding pools. Borrowers draw liquidity via repo contracts. Interest rates are configurable and respond to utilization.

**Settlement Engine**
At maturity, borrowers repay principal plus interest, collateral unlocks automatically, and lender yield is distributed — all programmatically on Canton with no manual intervention.

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

**Pilot Workflow (5-step lifecycle):**
1. Collateral deposited — Ondo tokenized treasury assets placed in Anchorage custody
2. Repo contract created — DAML multi-party contract defines terms and obligations
3. Funding issued — Circle USDC distributed to borrower via pool
4. Lifecycle monitoring — Canton coordinates contract state, collateral conditions, participant permissions
5. Settlement — borrower repays; collateral released or transferred on default

### 3. Architectural Alignment

This proposal directly leverages Canton's core architectural strengths:

- **Privacy:** Borrowing positions, collateral allocations, and loan sizes remain confidential between counterparties. The Canton privacy model enables this without compromising settlement integrity.
- **Multi-party workflows:** Repo markets involve collateral issuers, liquidity providers, custodians, and borrowers. Canton's atomic multi-party transaction model is uniquely suited to coordinate these participants.
- **Regulated asset infrastructure:** Tokenized assets and stablecoins require controlled access, permissioned participation, and verifiable identity. Canton provides this natively.
- **DAML contract modeling:** Repo agreements are financial obligations with precise lifecycle rules. DAML's type system and workflow primitives are well-matched to this domain.

This work aligns with the fund's stated priorities around institutional DeFi infrastructure and reference implementations.

### 4. Backward Compatibility

No backward compatibility impact. This is new infrastructure. All contracts will be deployed under isolated namespaces and will not affect existing Canton deployments.

---

## Milestones and Deliverables

### Milestone 1: System Architecture and Contract Specification
- **Estimated Delivery:** Month 1
- **Focus:** Design and specification
- **Deliverables / Value Metrics:**
  - Repo market system design document (open-source)
  - DAML contract specifications for repo agreements, collateral vaults, and funding pools
  - Workflow documentation covering all counterparty interactions
  - Architectural alignment document with Canton privacy and multi-party models

### Milestone 2: Core Protocol Development
- **Estimated Delivery:** Month 2
- **Focus:** DAML contract implementation and unit testing
- **Deliverables / Value Metrics:**
  - Fully implemented and tested DAML repo agreement contracts
  - Collateral vault contracts with LTV enforcement and liquidation logic
  - Funding pool contracts with configurable interest rate model
  - Test suite with documented coverage

### Milestone 3: Integration and Testnet Deployment
- **Estimated Delivery:** Month 3
- **Focus:** Counterparty integration and Canton testnet deployment
- **Deliverables / Value Metrics:**
  - Integration with Circle USDC liquidity flow
  - Integration with Ondo Finance tokenized treasury collateral
  - Anchorage Digital custody verification integration
  - Live deployment on Canton testnet with documented end-to-end transactions
  - Settlement engine operational with automated maturity processing

### Milestone 4: Mainnet Pilot and Documentation
- **Estimated Delivery:** Month 4
- **Focus:** Live pilot execution and open-source release
- **Deliverables / Value Metrics:**
  - Minimum 3 executed repo transactions on Canton mainnet
  - Minimum $5M in aggregate pilot transaction volume
  - Full open-source release of all contracts and tooling under permissive license
  - Developer documentation, deployment guide, and integration reference
  - Public case study co-authored with Canton Foundation

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- All DAML contract code delivered as open-source under a permissive license
- Demonstrated end-to-end repo lifecycle (create → fund → monitor → settle) on Canton testnet by Milestone 3
- Minimum 3 live repo transactions executed on Canton mainnet with documented counterparty participation
- Minimum $5M aggregate transaction volume across pilot period
- Developer documentation sufficient for an independent team to deploy the system
- Public case study published in coordination with the Canton Foundation

---

## Funding

**Total Funding Request:** 2,000,000 CC (~$300,000 USD at $0.15/CC, fixed at submission date)

### Payment Breakdown by Milestone
- Milestone 1 — System Architecture: 400,000 CC upon committee acceptance
- Milestone 2 — Core Protocol Development: 600,000 CC upon committee acceptance
- Milestone 3 — Integration and Testnet Deployment: 600,000 CC upon committee acceptance
- Milestone 4 — Mainnet Pilot and Documentation: 400,000 CC upon final release and acceptance

### Volatility Stipulation
Project duration is under 6 months. Should the timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility.

---

## Co-Marketing

Upon completion of the mainnet pilot, Dork Labs will collaborate with the Canton Foundation on:

- Joint announcement of the pilot results and open-source release
- Co-authored technical blog post covering the repo market architecture and DAML implementation
- Case study documenting the counterparty workflow, transaction volume, and settlement mechanics
- Presentation at a Canton ecosystem event or developer forum (if invited)

---

## Motivation

Institutional repo markets represent one of the largest and most liquid segments of traditional finance — trillions of dollars in daily volume globally. Bringing this workflow to Canton demonstrates a concrete, high-value use case for the network's privacy and multi-party capabilities.

A live, open-source repo market implementation on Canton serves as a reference for other institutional participants considering the platform. It reduces the activation energy for the next team building similar infrastructure. The counterparty relationships established during the pilot — with Circle, Ondo Finance, and Anchorage Digital — further legitimize Canton as a serious institutional platform.

DorkFi's existing production lending infrastructure on two other networks provides direct evidence of Dork Labs' capability to deliver this type of system. We are not approaching this as a greenfield experiment. We are porting proven lending mechanics into a new, more capable environment.

---

## Rationale

The repo pilot approach (Option 1) was chosen over a broader institutional credit engine scope because:

- Shorter duration (7–30 days) reduces counterparty risk and simplifies the DAML contract lifecycle
- Repo agreements are close to existing institutional workflows, lowering integration friction
- A narrower scope produces faster, more verifiable results for the committee
- The open-source deliverables from a focused pilot are more reusable than outputs from a broader, longer engagement

The modular architecture (separate contracts for repo agreements, vaults, pools, and settlement) ensures each component can be independently adopted or extended by future Canton developers.
