# Development Fund Proposal

**Author:** LynoBridge
**Status:** Submitted
**Created:** 2026-03-28

---

## Abstract

LynoBridge is a cross-chain bridge and DeFi suite that connects EVM-compatible Layer 2 networks to the Canton Network, enabling users to transfer any liquid EVM token as USDCx to Canton. Through Relay Link integration, any token with sufficient liquidity on supported L2 networks is automatically converted to USDC before the CCTP transfer, eliminating the requirement for users to hold USDC prior to bridging. The Ethereum mainnet transit is handled automatically at the protocol level and abstracted from the user experience.

LynoBridge materially reduces the friction of entering the Canton ecosystem from EVM L2 networks. A closed DevNet simulation with 23 users produced 850+ bridge transactions in 3 days, demonstrating an early demand signal and technical readiness. With 12,000+ pre-registered users, an active Canton mainnet validator node, and a Featured App application submitted to the Canton Foundation Tokenomics Committee, LynoBridge is positioned to deliver measurable early network impact. Pre-registration data and analytics are available upon request.

This proposal requests Development Fund support across three milestones: bridge launch, DEX/swap with security audit, and staking and lending primitives. All DAML contracts will be published under the Apache 2.0 license, providing reusable infrastructure for the broader Canton developer ecosystem.

---

## Specification

### 1. Objective

Today, the primary route for bringing USDC onto the Canton Network requires manual interaction with Ethereum mainnet. This leaves users on EVM Layer 2 networks, including Base, Arbitrum, Optimism, and others, without a streamlined entry point into Canton. Users must either navigate Ethereum mainnet independently, incurring significant cost and latency, or remain outside the Canton ecosystem.

LynoBridge materially reduces this barrier by enabling users across supported L2 networks to transfer any liquid EVM token into Canton as USDCx without any manual Ethereum mainnet interaction. Through the Relay Link integration, tokens are automatically converted to USDC on the EVM side prior to the CCTP transfer, removing the requirement to hold USDC before bridging. Beyond the bridge, LynoBridge extends Canton's DeFi layer to EVM L2 users through an on-chain DEX, staking mechanism, and lending protocol, all built in DAML.

The intended outcome is threefold: bring new users and liquidity into Canton, generate sustained on-chain transaction volume, and provide open-source DAML primitives that other Canton developers can build on.

### 2. Implementation Mechanics

**Architecture Overview**

LynoBridge uses a two-layer architecture:

**Layer 1 - CCTP:** Circle's Cross-Chain Transfer Protocol moves USDC from any EVM L2 (currently Base) through Ethereum mainnet to the Canton xReserve contract, minting USDCx on Canton.

**Layer 2 - Relay Link:** Handles token swaps on the EVM side, enabling users to bridge any token with sufficient liquidity on supported L2 networks. Tokens are automatically converted to USDC before the CCTP transfer is initiated, removing the prerequisite of holding USDC prior to bridging.

This design relies on Circle's institutionally audited infrastructure rather than novel bridge mechanisms, minimizing incremental attack surface on the EVM side.

**Canton Integration:**
- Ledger API for party provisioning, ACS queries, and command submission via gRPC
- Embedded non-custodial wallet using Canton Wallet SDK
- xReserve for USDCx minting and redemption
- CIP-0056 wallet provider requirements in progress

**Backend Stack:**
- Node.js / TypeScript / Express
- PostgreSQL on AWS RDS (eu-central-1)
- Email OTP authentication

**Bridge Flow:**
```
User EVM Wallet (any supported L2)
  → (Optional) Relay Link swap: any liquid token to USDC
  → Approve USDC on source L2
  → Circle CCTP burn on source L2
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

**Evidence of Technical Capability:**

LynoBridge has completed a closed DevNet simulation in which 23 users generated 850+ bridge transactions over 3 days. Bridge transactions are currently operational on Canton mainnet. A live demonstration or demo video is available upon request. The team operates an active Canton mainnet validator node (`lynobridge-validator-1`) and holds Provider status on the network. A Featured App application has been submitted to the Canton Foundation Tokenomics Committee.

**Security Model:**
- Runtime monitoring and alerting for bridge and contract activity
- Circuit breaker and pause mechanism for emergency bridge suspension
- Per-transaction and daily withdrawal limits to contain exposure
- Bug bounty program to be launched at M1 mainnet deployment
- Incident response plan covering contract vulnerability, key compromise, and bridge halt scenarios
- Two independent security audit engagements across all milestones

### 3. Architectural Alignment

| CIP / Standard | Alignment |
|---|---|
| CIP-0056 (Wallet Provider) | In progress; embedded wallet working through provider requirements |
| CIP-0104 (Traffic-Based App Rewards) | LynoBridge transactions generate direct traffic burn on Canton; bridge, DEX, and lending layers naturally produce confirmer-attributed traffic without requiring activity markers |
| xReserve / USDCx | Uses canonical Canton stablecoin primitive exclusively |
| Circle CCTP | Institutionally audited infrastructure; minimizes incremental attack surface |
| CIP-0082 | This proposal seeks support from the 5% CC emission allocation |
| CIP-0100 | Proposal structured per Development Fund governance requirements |

### 4. Backward Compatibility

No backward compatibility impact. LynoBridge is a new application built on top of existing Canton primitives (xReserve, Ledger API). It does not modify any protocol-level components.

---

## Milestones and Deliverables

### Milestone 1: Bridge Launch

- **Estimated Delivery:** April - May 2026
- **Focus:** Production bridge on Canton mainnet; embedded wallet; user onboarding
- **Deliverables / Value Metrics:**
  - Production bridge deployed and available for demo upon request
  - Base to Canton CCTP bridge flow operational
  - Embedded non-custodial wallet using Canton Wallet SDK
  - Email OTP authentication and user onboarding flow
  - Bridge transaction tracking and status dashboard
  - Ledger API integration reference implementation open-sourced on GitHub (Apache 2.0)
  - Target: 1,000 active bridge users within 30 days of launch
  - Target: 100+ successful bridge transactions within 14 days of launch
  - Uptime 99%+ over first 30 days

### Milestone 2: DEX / Swap & Security Audit

- **Estimated Delivery:** August - September 2026
- **Focus:** On-chain DEX with AMM; professional security audit of all contracts to date
- **Deliverables / Value Metrics:**
  - USDCx to CC on-chain swap contracts (DAML)
  - Phase 1 fixed-price pools and Phase 2 dynamic AMM (x·y=k)
  - Swap UI integrated into LynoBridge wallet
  - Liquidity provider deposit/withdrawal interface
  - Professional security audit by a recognized security firm covering bridge logic, DEX AMM, and backend API
  - Published audit report (public)
  - All critical and high severity findings resolved prior to report publication
  - AMM DEX DAML contracts open-sourced on GitHub (Apache 2.0)
  - Target: 500+ swap transactions within 30 days of DEX launch

### Milestone 3: Staking and Lending

- **Estimated Delivery:** November - December 2026
- **Focus:** Native Canton lending protocol and CC staking; security audit extension
- **Deliverables / Value Metrics:**
  - USDCx lending pool contracts (DAML) with utilization-based interest rate model
  - CC staking mechanism with reward distribution logic
  - Collateralization and liquidation logic
  - Risk parameter documentation (LTV ratios, liquidation thresholds)
  - Security audit extension covering lending and staking contracts
  - Lending and staking DAML contracts open-sourced on GitHub (Apache 2.0)
  - Target: $100,000+ equivalent TVL within 60 days of lending launch

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone
- Demonstrated functionality or operational readiness
- Documentation and knowledge transfer provided
- Alignment with stated value metrics

Project-specific conditions:

- **Bridge:** 100+ mainnet transactions within 14 days of launch; zero critical security incidents; Ledger API reference implementation published
- **DEX:** 500+ swap transactions within 30 days; audit report publicly published; all critical and high severity findings resolved; DAML contracts open-sourced
- **Lending:** $100,000+ TVL within 60 days; contracts open-sourced; risk parameters reviewed by external Canton developer or auditor; audit extension completed

---

## Funding

**Total Funding Request: 900,000 CC**

### Payment Breakdown by Milestone

- **Milestone 1 (Bridge Launch): 200,000 CC upon committee acceptance**
- **Milestone 2 (DEX / Swap & Security Audit): 500,000 CC upon committee acceptance**
- **Milestone 3 (Staking and Lending): 200,000 CC upon final release and acceptance**

### Cost Breakdown

| Category | Milestone | Detail | Estimated Cost |
|---|---|---|---|
| Development Costs | M1, M2, M3 | Personnel and software expenses across all milestones | ~200,000 CC |
| Bridge, DEX, Staking & Lending | M1, M2, M3 | Full development, integration, and deployment across all product milestones | ~240,000 CC |
| Security Audit | M2, M3 | Two independent audit engagements; market rate for DeFi bridge + DEX scope is $50,000-$100,000 USD per engagement | ~350,000 CC |
| DEX | M2 | Initial pool capital required to seed USDCx/CC liquidity at launch; without seed capital the DEX cannot function at launch | ~105,000 CC |
| Backend Costs | M1, M2, M3 | Infrastructure, hosting, and operational expenses (24 weeks) | ~5,000 CC |
| **Total** | | | **900,000 CC** |

### Why M2 carries the largest allocation

Milestone 2 combines the most capital-intensive deliverables in the project. DEX development requires building and deploying two AMM phases in DAML, a frontend swap interface, and a liquidity provider system, in addition to the first full security audit engagement covering bridge logic, DEX contracts, and backend API. Professional DeFi audit firms charge $50,000-$100,000 USD for this scope. DEX liquidity seeding requires upfront capital to make the pools functional at launch. These three costs, development, audit, and liquidity, converge in M2, justifying the higher allocation relative to M1 and M3.

### Volatility Stipulation

The total project duration is approximately 8 months from M1 launch. Per CIP-0100 guidelines, the grant is denominated in fixed Canton Coin and will require a re-evaluation at the 6-month mark.

---

## Co-Marketing

Upon each milestone release, LynoBridge will collaborate with the Canton Foundation on:

- Announcement coordination for bridge launch, DEX launch, and lending launch across LynoBridge community channels (12,000+ registered users)
- Technical blog post covering Canton Ledger API integration patterns and DAML AMM design for the developer community
- Educational content and tutorials for users transferring assets from EVM L2 networks to Canton
- Participation in Canton ecosystem events and developer meetups
- Developer documentation published openly for ecosystem reuse
- Promotion through LynoBridge Telegram and social media channels

---

## Motivation

Canton's growth depends on expanding its accessible liquidity entry points and extending its DeFi layer to new user segments. LynoBridge addresses two specific gaps: the absence of a streamlined EVM L2 entry path, and the lack of a bridge-integrated DeFi experience for users entering Canton from outside the ecosystem.

**The access problem:** Users on EVM L2 networks currently have no streamlined path into Canton. The available route requires manual Ethereum mainnet interaction, imposing significant cost and limiting accessibility. LynoBridge conducted a closed DevNet simulation in which 23 users generated 850+ bridge transactions in 3 days, with bridge transactions now operational on Canton mainnet. The platform has 12,000+ pre-registered users awaiting full access. Pre-registration data and analytics are available upon request.

**The DeFi layer problem:** While DeFi primitives exist within the Canton ecosystem, they are not currently accessible within the same experience for users entering from EVM L2 networks. LynoBridge integrates bridge, DEX, lending, and staking into a single platform, extending the reach of Canton's existing DeFi infrastructure to this user segment.

**The ecosystem tooling problem:** Open-source reference implementations for EVM-to-Canton bridge integration and DAML-based AMM design are currently limited. LynoBridge's open-source outputs, including the Ledger API integration reference and DAML AMM contracts published under Apache 2.0, will provide reusable primitives for any Canton developer building similar applications.

**CIP-0104 alignment:** LynoBridge is architecturally aligned with the traffic-based app reward system specified in CIP-0104. Every bridge, swap, and lending interaction generates direct traffic burn attributed to LynoBridge's featured app party, with no reliance on activity markers.

**Expected network impact:** Based on DevNet simulation results and pre-registration data, LynoBridge projects 1,000 to 1,500 active users generating sustained Canton transaction volume within the first 6 months post-launch.

**Competitive positioning:** Among Canton entry points currently available, LynoBridge is the only solution providing direct EVM L2 access with a bridge-integrated DeFi layer in a single platform. Existing paths require users to interact with Ethereum mainnet independently and use separate applications for DeFi activity.

---

## Rationale

**Why CCTP over a custom bridge?**
Circle CCTP is an institutionally audited protocol used for USDC transfers across chains. Building on CCTP eliminates the need to secure a novel bridge mechanism, reducing smart contract risk and audit scope. The EVM-side risk is absorbed by Circle's existing audit coverage (ChainSecurity, Halborn, OtterSec).

**Why Relay Link for EVM swaps?**
Relay Link is an audited swap aggregator (Spearbit, Certora) that handles EVM-side token conversion. Using a proven third-party integration allows LynoBridge to support any EVM token without building and maintaining a custom swap router, keeping the audit surface minimal.

**Why combine DEX and security audit in M2?**
The audit naturally follows the completion of bridge and DEX contracts. Bundling them ensures both components are covered together, reducing gaps and simplifying the review process. Separating them would leave the bridge unaudited during the DEX development period.

**Why DAML for the AMM?**
Canton's contract consumption model requires careful design to avoid contention. The sharded AMM approach distributes liquidity across multiple pool contracts, which is the most suitable pattern for Canton's architecture. This design will be open-sourced as a reference for other Canton DeFi projects.

**Why open-source the DAML contracts?**
The Development Fund supports work that is a common good for the ecosystem. LynoBridge's DAML contracts for DEX, lending, and staking are general-purpose primitives that any Canton application can build on. All contracts will be published under the Apache 2.0 license on GitHub.

---

## Appendix: Evidence Summary

| Item | Detail |
|---|---|
| DevNet simulation | 23 users, 850+ bridge transactions, 3 days |
| Mainnet status | Bridge transactions operational on Canton mainnet |
| Validator node | `lynobridge-validator-1`, active, Provider status |
| Pre-registrations | 12,000+ users; data and analytics available upon request |
| Featured App | Application submitted to Canton Foundation Tokenomics Committee |
| Demo availability | Live demonstration or video available upon request |

---

## References

- CIP-0056: Wallet Provider requirements
- CIP-0082: Development Fund allocation (5% of future CC emissions)
- CIP-0100: Development Fund governance
- CIP-0104: Traffic-Based App Rewards
- Circle CCTP: https://developers.circle.com/stablecoins/cctp-getting-started
- LynoBridge: https://lynobridge.com
- Contact: contact@lynobridge.com
