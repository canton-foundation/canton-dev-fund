# Development Fund Proposal

**Author:** LynoBridge (mehmet@lynobridge.com)
**Status:** Draft
**Created:** 2025-03-28

---

## Abstract

LynoBridge is a cross-chain bridge and DeFi suite that connects EVM-compatible Layer 2 networks directly to the Canton Network, enabling any L2 user to convert USDC into USDCx without routing through Ethereum mainnet. With 12,000+ pre-registered users and an active Canton mainnet validator node, LynoBridge delivers immediate transaction volume, new liquidity, and a full DeFi layer bridge, DEX/swap, staking, and lending built natively on Canton.

---

## Specification

### 1. Objective

Today, the only path to bring USDC onto the Canton Network is through Ethereum mainnet. This leaves the entire EVM Layer 2 ecosystem Base, Arbitrum, Optimism, and others without a direct entry point into Canton. Users on these networks must either bridge to Ethereum first, incurring significant cost and friction, or remain outside the Canton ecosystem entirely.

LynoBridge eliminates this barrier by turning every major EVM L2 into a direct on-ramp to Canton. Any user on any supported L2 can bridge their assets into Canton as USDCx without touching Ethereum mainnet directly. Beyond the bridge, LynoBridge delivers the first native Canton DeFi layer: an on-chain DEX, staking mechanism, and lending protocol all built in DAML.

### 2. Implementation Mechanics

LynoBridge uses a two-layer architecture:

**Layer 1 CCTP:** Circle's Cross-Chain Transfer Protocol moves USDC from any EVM L2 (currently Base) through Ethereum mainnet to the Canton xReserve contract, minting USDCx on Canton.

**Layer 2 Relay Link:** Handles token swaps on the EVM side, enabling users who hold non-USDC assets to bridge by first swapping into USDC before initiating the CCTP transfer. This makes any EVM token bridgeable to Canton.

**Canton Integration:**
- Ledger API for party provisioning, ACS queries, and command submission via gRPC
- Embedded custodial wallet using AWS KMS for signing key encryption (envelope encryption pattern)
- xReserve for USDCx minting and redemption
- CIP-0056 wallet provider requirements in progress

**Backend Stack:**
- Node.js / TypeScript / Express
- PostgreSQL on AWS RDS (eu-central-1)
- Email OTP authentication

**Bridge Flow:**
```
User EVM Wallet
  → Approve USDC on Base
  → (Optional) Relay Link swap for non-USDC input tokens
  → Circle CCTP burn on Base
  → Circle attestation service
  → CCTP mint on Ethereum mainnet
  → xReserve deposit
  → USDCx credited to Canton party
  → LynoBridge wallet displays balance
```

**DEX / AMM Architecture:**
- Phase 1: Fixed-price liquidity pools (standing offer model)
- Phase 2: Dynamic AMM with constant product formula (x·y=k), sharded across multiple pool contracts to mitigate contention under Canton's contract consumption model

**Lending Protocol:**
- Utilization-based interest rate model
- Collateralization and liquidation logic for undercollateralized positions
- CC staking with reward distribution logic

### 3. Architectural Alignment

| CIP / Standard | Alignment |
|---|---|
| CIP-0056 (Wallet Provider) | In progress; embedded wallet working through provider requirements |
| xReserve / USDCx | Uses canonical Canton stablecoin primitive exclusively |
| Circle CCTP | Institutionally audited infrastructure; no novel bridge mechanism |
| CIP-0082 | This proposal seeks support from the 5% CC emission allocation |
| CIP-0100 | Proposal structured per Development Fund governance requirements |

### 4. Backward Compatibility

No backward compatibility impact. LynoBridge is a new application built on top of existing Canton primitives (xReserve, Ledger API). It does not modify any protocol-level components.

---

## Milestones and Deliverables

### Milestone 1: Bridge Launch

- **Estimated Delivery:** April–May 2025
- **Focus:** Production bridge live on Canton mainnet; embedded wallet; user onboarding
- **Deliverables / Value Metrics:**
  - Production bridge deployed and available for demo upon request
  - Base → Canton CCTP bridge flow operational
  - Embedded custodial wallet with AWS KMS key management
  - Email OTP authentication and user onboarding flow
  - Bridge transaction tracking and status dashboard
  - Target: 1,000 active bridge users within 30 days of launch
  - Target: ≥ 100 successful bridge transactions within 14 days of launch
  - Uptime ≥ 99% over first 30 days

### Milestone 2: DEX / Swap & Security Audit

- **Estimated Delivery:** 8 weeks post-M1
- **Focus:** On-chain DEX with AMM; professional security audit of all contracts to date
- **Deliverables / Value Metrics:**
  - USDCx ↔ CC on-chain swap contracts (DAML)
  - Phase 1 fixed-price pools and Phase 2 dynamic AMM (x·y=k)
  - Swap UI integrated into LynoBridge wallet
  - Liquidity provider deposit/withdrawal interface
  - Professional security audit: bridge logic, DEX AMM, backend API, KMS key management
  - Published audit report (public)
  - All critical and high severity findings resolved prior to report publication
  - Open-sourced DEX contract code and documentation
  - Target: ≥ 500 swap transactions within 30 days of DEX launch

### Milestone 3: Staking and Lending

- **Estimated Delivery:** 16 weeks post-M1
- **Focus:** Native Canton lending protocol and CC staking; security audit extension
- **Deliverables / Value Metrics:**
  - USDCx lending pool contracts (DAML) with utilization-based interest rate model
  - CC staking mechanism with reward distribution logic
  - Collateralization and liquidation logic
  - Risk parameter documentation (LTV ratios, liquidation thresholds)
  - Security audit extension covering lending and staking contracts
  - Open-sourced contract code
  - Target: ≥ $100,000 equivalent TVL within 60 days of lending launch

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone
- Demonstrated functionality or operational readiness
- Documentation and knowledge transfer provided
- Alignment with stated value metrics

Project-specific conditions:
- Bridge: ≥ 100 mainnet transactions within 14 days of launch; zero critical security incidents
- DEX: ≥ 500 swap transactions within 30 days; audit report publicly published; all critical/high findings resolved
- Lending: ≥ $100,000 TVL within 60 days; contracts open-sourced; risk parameters reviewed by external Canton developer or auditor

---

## Funding

**Total Funding Request: 900,000 CC**

### Payment Breakdown by Milestone

- **Milestone 1 (Bridge Launch): 200,000 CC upon committee acceptance**
- **Milestone 2 (DEX / Swap & Security Audit): 500,000 CC upon committee acceptance**
- **Milestone 3 (Staking and Lending): 200,000 CC upon final release and acceptance**

### Volatility Stipulation

The total project duration is approximately 16 weeks from M1 launch, which is under 6 months. Should the timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones will be renegotiated to account for significant USD/CC price volatility.

---

## Co-Marketing

Upon each milestone release, LynoBridge will collaborate with the Canton Foundation on:

- Announcement coordination for bridge launch, DEX launch, and lending launch
- Technical blog post covering Canton Ledger API integration patterns and DAML AMM design
- Developer documentation published openly for ecosystem reuse
- Promotion through LynoBridge's community channels (12,000+ registered users)

---

## Motivation

The Canton Network's growth depends on accessible liquidity entry points. Today, EVM L2 users representing the largest active segment of the DeFi market have no direct path into Canton. LynoBridge removes this barrier entirely.

Beyond the bridge, there is no native Canton DeFi layer for retail participants. No on-chain DEX, no lending protocol, no staking primitive accessible to non-institutional users. LynoBridge builds all of these, creating the conditions for sustained organic transaction volume and TVL growth on Canton.

With 12,000+ pre-registered users, an active mainnet validator node, and a Featured App application submitted to the Canton Foundation Tokenomics Committee, LynoBridge is positioned to generate immediate and measurable impact on Canton Network activity from day one.

---

## Rationale

**Why CCTP over a custom bridge?** Circle CCTP is an institutionally audited protocol used for USDC transfers across chains. Building on CCTP eliminates the need to secure a novel bridge mechanism, significantly reducing smart contract risk and audit scope.

**Why Relay Link for EVM swaps?** Relay Link is an audited swap aggregator that handles the EVM-side token conversion. Using a proven third-party integration allows LynoBridge to support any EVM token without building and maintaining a custom swap router.

**Why combine DEX and security audit in M2?** The audit naturally follows the completion of the bridge and DEX contracts. Bundling them in a single milestone ensures the audit covers both components together, reducing gaps and simplifying the review process.

**Why DAML for the AMM?** Canton's contract consumption model requires careful design to avoid contention. The sharded AMM approach distributing liquidity across multiple pool contracts is the most suitable pattern for Canton's architecture and has been designed with Canton's concurrency model in mind.

**Open source commitment:** All DAML contracts (DEX, lending, staking) and audit reports will be open-sourced upon milestone acceptance, providing reusable primitives for the broader Canton developer ecosystem.

---

## References

- CIP-0056: Wallet Provider requirements
- CIP-0082: Development Fund allocation
- CIP-0100: Development Fund governance
- Circle CCTP: https://developers.circle.com/stablecoins/cctp-getting-started
- LynoBridge: https://lynobridge.com
