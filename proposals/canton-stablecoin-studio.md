## Development Fund Proposal

**Author:** [Varmeta](https://var-meta.com)
**Status:** Draft
**Created:** 2026-03-12

---

## Abstract
Canton Stablecoin Studio is a platform for creating and managing stablecoins natively on Canton Network. It provides a common toolkit covering stablecoin creation, token operations, compliance, proof of reserve, fee management, and token settings - delivered as smart contracts, an SDK, and a web application.

---

## Specification

### 1. Objective
Canton Network currently lacks a turnkey platform for stablecoin issuance. Institutions seeking to issue regulated stablecoins need compliant, privacy-preserving infrastructure that integrates with existing financial workflows. Canton Stablecoin Studio fills this gap by providing a complete toolkit for the stablecoin lifecycle - from creation and minting through compliance enforcement and reserve management.

### 2. Implementation Mechanics
The platform delivers six core capabilities:

- **Create Stablecoin** - Factory-based creation with configurable parameters (name, symbol, supply limits, reserve mode, compliance settings). Multi-tenant: each issuer operates independently with full privacy isolation.
- **Operations** - Full token lifecycle: mint (cash-in), burn, wipe, transfer (direct and preapproval), escrow holds (create/execute/release/reclaim), and on-ledger multi-signature proposals with threshold-based auto-execution.
- **Compliance** - On-ledger KYC status with external provider integration points. Account-level freeze/unfreeze. Token-level pause/unpause. KYC enforcement on minting and transfers.
- **Proof of Reserve** - Four reserve modes: Internal (admin-managed), External (oracle-fed from bank/auditor), CrossChain (bridge oracle aggregating locked balances), and NoReserve. Staleness enforcement prevents minting against stale reserve data.
- **Fee Configuration** - Fixed and fractional fee schedules per stablecoin. Role-based fee management.
- **Token Settings** - 11-role access control system (admin, cashin, burn, wipe, freeze, pause, delete, KYC, rescue, custom fees, hold creator). Supplier minting allowances. Max supply enforcement.

Delivery format:
- DAML smart contracts on Canton Network
- Dual-target TypeScript SDK (browser + Node.js)
- React web application with real-time updates

### 3. Architectural Alignment
- Built natively on Canton using DAML smart contracts (no EVM/Solidity dependency)
- Compliant with CIP-0056 (Token Standard) and CIP-0103 (dApp-Wallet protocol)
- Leverages Canton's built-in privacy model and multi-party authorization
- Frontend-first architecture - no backend coordinator required

### 4. Backward Compatibility
*No backward compatibility impact.* This is a greenfield project with no dependencies on existing Canton applications or workflows.

---

## Milestones and Deliverables

### Milestone 1: Issuer MVP
- **Estimated Delivery:** Week 3
- **Focus:** Factory-based stablecoin creation, mint (cash-in), burn, wipe, transfer, escrow holds, multi-signature proposals, and supplier allowances - delivered as DAML smart contracts, TypeScript SDK, and React web application.
- **Deliverables / Value Metrics:** A stablecoin issuer can create a new stablecoin and perform all core token operations end-to-end through the web application. First working product demonstrating Canton's viability for institutional stablecoin issuance.

### Milestone 2: Regulatory Readiness
- **Estimated Delivery:** Week 6
- **Focus:** On-ledger KYC with external provider integration, account freeze/unfreeze, token pause/unpause, 11-role access control, four proof-of-reserve modes (Internal, External, CrossChain, NoReserve) with staleness enforcement, and configurable fee schedules.
- **Deliverables / Value Metrics:** The platform meets the compliance and transparency requirements for regulated stablecoin issuance - KYC-gated operations, granular role-based permissions, verifiable reserves, and fee management. Ready for institutional adoption in regulated environments.

### Milestone 3: Production Release
- **Estimated Delivery:** Week 8
- **Focus:** End-to-end test suite, API documentation, deployment guide, and CIP-0056/CIP-0103 conformance verification.
- **Deliverables / Value Metrics:** Production-ready platform with full test coverage, comprehensive documentation, and verified standard compliance. Ready for go-live on Canton Network.

---

## Acceptance Criteria
The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone
- Demonstrated functionality or operational readiness
- Documentation and knowledge transfer provided
- Alignment with stated value metrics

Project-specific conditions:
- **M1:** Live demo of end-to-end stablecoin creation and all token operations via the web application; SDK functional for all operations; automated contract tests passing
- **M2:** KYC enforcement demonstrated on mint and transfer; freeze/pause controls verified; all 11 roles tested with correct permission boundaries; at least two reserve modes validated with staleness rejection; fee collection demonstrated on transfers
- **M3:** E2E test suite passing across isolated issuer environments; API reference and deployment guide reviewed and accepted; CIP-0056 and CIP-0103 conformance verified

---

## Funding

**Total Funding Request:** 120,000 CC

### Payment Breakdown by Milestone
- Milestone 1 (Issuer MVP): 40,000 CC upon committee acceptance
- Milestone 2 (Regulatory Readiness): 60,000 CC upon committee acceptance
- Milestone 3 (Production Release): 20,000 CC upon final release and acceptance

### Volatility Stipulation
If the project duration is **greater than 6 months**:  
The grant is denominated in fixed Canton Coin and will require a re-evaluation at the 6-month mark.

If the project duration is **under 6 months**:  
Should the project timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility.

---

## Co-Marketing
Upon release, the implementing entity will collaborate with the Foundation on:

- Announcement coordination
- Technical blog post or case study on Canton stablecoin infrastructure
- Developer and ecosystem promotion through workshops or documentation showcases

---

## Motivation

- Regulated stablecoin issuance is a foundational use case for any financial blockchain network
- Enables institutions to issue and manage compliant stablecoins without building custom infrastructure from scratch
- Attracts institutional issuers to Canton Network
- Demonstrates Canton's capabilities for production-grade financial infrastructure
- Establishes a reusable toolkit that accelerates future tokenization projects across the ecosystem

---

## Rationale

- **DAML-native approach** — leverages Canton's built-in privacy model and multi-party authorization
- **Frontend-first architecture** (no backend coordinator) — reduces operational complexity and attack surface for issuers
- **Abstract oracle interface** for proof of reserve — supports all reserve models (internal, external, cross-chain) without requiring architecture changes
- **Modular toolkit design** — allows issuers to adopt only the capabilities they need, enabling reuse across different stablecoin use cases and regulatory regimes
