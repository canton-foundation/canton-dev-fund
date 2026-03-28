# LynoBridge — EVM-to-Canton Cross-Chain Bridge & DeFi Suite

**Proposal file:** `proposals/lynobridge.md`

---

## Summary

LynoBridge is a production-ready cross-chain bridge that connects EVM-compatible Layer 2 networks to the Canton Network, enabling users to convert USDC into USDCx via Circle's Cross-Chain Transfer Protocol (CCTP). With over 12,000 pre-registrations and an active Canton mainnet validator node, LynoBridge is positioned to become the primary on-ramp for retail users entering the Canton ecosystem.

This proposal requests Development Fund support across three milestones: bridge launch, DEX/swap with security audit, and staking and lending primitives. The team defers to the Tech & Ops Committee on appropriate CC denomination for each milestone, and welcomes a scoping discussion prior to formal review.

---

## Problem Statement

Today, the only way to bring USDC onto the Canton Network is through Ethereum mainnet. This leaves the entire EVM Layer 2 ecosystem — Base, Arbitrum, Optimism, and others — without a path into Canton. Users on these networks must either bridge to Ethereum first, incurring significant cost and friction, or remain outside the Canton ecosystem entirely.

This fragmentation limits Canton's addressable market and restricts the flow of new users and liquidity into the network.

LynoBridge turns every major EVM L2 into a direct on-ramp to Canton. Any user on any supported L2 can bridge their assets into Canton as USDCx without touching Ethereum mainnet directly.

---

## Technical Approach

### Architecture Overview

LynoBridge uses a two-layer architecture:

**Layer 1 — CCTP:** Circle's Cross-Chain Transfer Protocol moves USDC from any EVM L2 (currently Base) through Ethereum mainnet to the Canton xReserve contract, minting USDCx on Canton.

**Layer 2 — Relay Link:** Handles token swaps on the EVM side, enabling users who hold non-USDC assets to bridge by first swapping into USDC before initiating the CCTP transfer.

This design is modular and auditable. It relies on Circle's institutionally audited infrastructure rather than novel bridge mechanisms, minimizing smart contract risk on the EVM side.

### Canton Integration

- **Ledger API:** Party provisioning, ACS queries, and command submission via gRPC
- **Embedded Wallet:** Custodial wallet using AWS KMS for signing key encryption (envelope encryption pattern); CIP-0056 wallet provider requirements in progress
- **xReserve:** USDCx minting and redemption via canonical Canton stablecoin primitive
- **Validator Node:** LynoBridge operates `lynobridge-validator-1` on Canton mainnet

### Backend Stack

- Node.js / TypeScript / Express
- PostgreSQL on AWS RDS (eu-central-1)
- Email OTP authentication via Resend

### Bridge Flow

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

---

## Ecosystem Value

| Benefit | Detail |
|---|---|
| New liquidity on-ramp | First permissionless retail path for USDC → USDCx |
| Transaction volume | 12,000+ pre-registered users; each bridge is a Canton transaction generating CC-eligible activity |
| Featured App status | Application submitted to Canton Foundation Tokenomics Committee |
| Validator participation | Active mainnet validator contributing to network health and decentralization |
| DeFi primitives | DEX and lending layers create native Canton DeFi activity and TVL |
| Open outputs | DAML contracts and Ledger API integration patterns documented for ecosystem reuse |

---

## Milestones and Deliverables

### Milestone 1 — Bridge Launch
**Target:** April–May 2025
**Status:** In development

**Deliverables:**
- Base → Canton CCTP bridge flow operational
- Embedded custodial wallet with AWS KMS key management
- Email OTP authentication and user onboarding flow
- Bridge transaction tracking and status dashboard
- Initial user cohort onboarded (target: 1,000 active bridge users within 30 days of launch)

**Acceptance Criteria:**
- ≥ 100 successful bridge transactions on mainnet within 14 days of launch
- Zero critical security incidents at launch
- Ledger API party provisioning operational for all registered users
- Uptime ≥ 99% over first 30 days

---

### Milestone 2 — DEX / Swap & Security Audit
**Target:** 8 weeks post-M1

**Deliverables:**
- On-chain Canton swap contracts (DAML): USDCx ↔ CC trading pairs
- Phase 1: Fixed-price liquidity pools (standing offer model)
- Phase 2: Dynamic AMM with constant product formula (x·y=k), sharded across multiple pool contracts to mitigate contention under Canton's contract consumption model
- Swap UI integrated into LynoBridge wallet
- Liquidity provider deposit/withdrawal interface
- Professional security audit of all DAML contracts (bridge logic, DEX AMM)
- Backend API and authentication flow security review
- AWS KMS key management and envelope encryption review
- Published audit report (public)
- Remediation of all critical and high severity findings prior to report publication
- Open-sourced contract code and documentation

**Acceptance Criteria:**
- ≥ 500 swap transactions within 30 days of DEX launch
- AMM pool contracts open-sourced on GitHub
- Slippage and price impact calculations verifiable on-ledger
- Audit completed by a recognized security firm
- Audit report publicly published
- All critical and high severity findings resolved and verified by auditor

---

### Milestone 3 — Staking and Lending
**Target:** 16 weeks post-M1

**Deliverables:**
- USDCx lending pool contracts (DAML) with utilization-based interest rate model
- CC staking mechanism with reward distribution logic
- Collateralization and liquidation logic for undercollateralized positions
- Risk parameter documentation (LTV ratios, liquidation thresholds)
- Open-sourced contract code
- Security audit extension covering lending and staking contracts

**Acceptance Criteria:**
- ≥ $100,000 equivalent TVL within 60 days of lending launch
- Lending contracts open-sourced on GitHub
- Risk parameters reviewed by at least one external Canton developer or auditor
- No critical contract vulnerabilities identified during internal review

---

## Funding Request

**Total Funding Request: 900,000 CC**

### Payment Breakdown by Milestone

- **Milestone 1 _(Bridge Launch)_: 200,000 CC upon committee acceptance**
- **Milestone 2 _(DEX / Swap & Security Audit)_: 500,000 CC upon committee acceptance**
- **Milestone 3 _(Staking and Lending)_: 200,000 CC upon committee acceptance**

Cost components across all milestones include:

- Engineering compensation (3 full-time contributors across 16 weeks)
- Infrastructure: VPS, AWS RDS, AWS KMS (ongoing operational costs)
- Third-party security audit engagements (Milestones 2 and 3)
- Liquidity seeding for initial DEX pools (Milestone 2)

We welcome a scoping call with the Tech & Ops Committee prior to formal review.

---



## Architectural Alignment

| CIP / Standard | Alignment |
|---|---|
| CIP-0056 (Wallet Provider) | In progress; embedded wallet working through provider requirements |
| xReserve / USDCx | Uses canonical Canton stablecoin primitive exclusively |
| Circle CCTP | Institutionally audited infrastructure; no novel bridge mechanism |
| CIP-0082 | This proposal seeks support from the 5% CC emission allocation |
| CIP-0100 | Proposal structured per Development Fund governance requirements |

---

## Long-Term Maintenance Plan

LynoBridge is a revenue-seeking protocol. Post-grant sustainability is planned through:

- Optional premium features for institutional and high-volume users
- Protocol fee mechanism post-audit (governance-controlled, not active at launch)
- Validator node CC rewards from transaction activity on Canton mainnet

The bridge and DeFi contracts will remain open-source. LynoBridge commits to maintaining compatibility with Canton Network upgrades for a minimum of 24 months following grant completion.

---

## Open Source Commitment

| Component | Released at Milestone |
|---|---|
| Ledger API integration reference implementation | M1 |
| Security audit report (bridge + DEX) | M2 |
| AMM DEX DAML contracts | M2 |
| Lending pool and staking DAML contracts + audit extension | M3 |

The backend wallet service (KMS integration, user authentication) will remain proprietary for operational security reasons, consistent with how custodial wallet providers operate across the industry.

---

## Note on Tech & Ops Committee Champion

As an external contributor team, LynoBridge is actively seeking a Tech & Ops Committee champion to support this proposal through the review process, per program requirements. We welcome outreach from Committee members familiar with our validator operations or Featured App application, and are happy to provide any additional technical documentation to facilitate that conversation.

Contact: **mehmet@lynobridge.com**

---

## References

- CIP-0056: Wallet Provider requirements
- CIP-0082: Development Fund allocation (5% of future CC emissions)
- CIP-0100: Development Fund governance
- Circle CCTP: https://developers.circle.com/stablecoins/cctp-getting-started
- LynoBridge: https://lynobridge.com
