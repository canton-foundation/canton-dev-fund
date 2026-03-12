## Development Fund Proposal

**Author:** Nam Quoc
**Status:** Draft
**Created:** 2026-03-12

---

## Abstract
Canton Stablecoin Studio is a platform for creating and managing stablecoins natively on Canton Network. It provides a common toolkit covering stablecoin creation, token operations, compliance, proof of reserve, fee management, and token settings — delivered as smart contracts, an SDK, and a web application.

---

## Specification

### 1. Objective
Canton Network currently lacks a turnkey platform for stablecoin issuance. Institutions seeking to issue regulated stablecoins need compliant, privacy-preserving infrastructure that integrates with existing financial workflows. Canton Stablecoin Studio fills this gap by providing a complete toolkit for the stablecoin lifecycle — from creation and minting through compliance enforcement and reserve management.

### 2. Implementation Mechanics
The platform delivers six core capabilities:

- **Create Stablecoin** — Factory-based creation with configurable parameters (name, symbol, supply limits, reserve mode, compliance settings). Multi-tenant: each issuer operates independently with full privacy isolation.
- **Operations** — Full token lifecycle: mint (cash-in), burn, wipe, transfer (direct and preapproval), escrow holds (create/execute/release/reclaim), and on-ledger multi-signature proposals with threshold-based auto-execution.
- **Compliance** — On-ledger KYC status with external provider integration points. Account-level freeze/unfreeze. Token-level pause/unpause. KYC enforcement on minting and transfers.
- **Proof of Reserve** — Four reserve modes: Internal (admin-managed), External (oracle-fed from bank/auditor), CrossChain (bridge oracle aggregating locked balances), and NoReserve. Staleness enforcement prevents minting against stale reserve data.
- **Fee Configuration** — Fixed and fractional fee schedules per stablecoin. Role-based fee management.
- **Token Settings** — 11-role access control system (admin, cashin, burn, wipe, freeze, pause, delete, KYC, rescue, custom fees, hold creator). Supplier minting allowances. Max supply enforcement.

Delivery format:
- DAML smart contracts on Canton Network
- Dual-target TypeScript SDK (browser + Node.js)
- React web application with real-time updates

### 3. Architectural Alignment
- Built natively on Canton using DAML smart contracts (no EVM/Solidity dependency)
- Compliant with CIP-0056 (Token Standard) and CIP-0103 (dApp-Wallet protocol)
- Leverages Canton's built-in privacy model and multi-party authorization
- Frontend-first architecture — no backend coordinator required

### 4. Backward Compatibility
*No backward compatibility impact.* This is a greenfield project with no dependencies on existing Canton applications or workflows.

---

## Milestones and Deliverables

### Milestone 1: Stablecoin Creation & Basic Operations
- **Estimated Delivery:** 2 weeks from project start
- **Focus:** Factory-based stablecoin creation, mint, transfer, and balance queries
- **Deliverables / Value Metrics:** Working stablecoin creation flow end-to-end across contracts, SDK, and web app; users can create a stablecoin and perform basic token operations

### Milestone 2: Full Token Operations & Multi-Sig
- **Estimated Delivery:** Week 4
- **Focus:** Burn, wipe, hold escrow lifecycle, and multi-signature proposal system
- **Deliverables / Value Metrics:** Complete token operations suite with escrow holds and threshold-based multi-sig proposals; all operations accessible via SDK and web app

### Milestone 3: Compliance & Access Control
- **Estimated Delivery:** Week 6
- **Focus:** KYC integration, freeze/unfreeze, pause/unpause, and 11-role access control system
- **Deliverables / Value Metrics:** Compliance-ready stablecoin with enforceable KYC, account/token-level controls, and granular role-based permissions

### Milestone 4: Proof of Reserve & Fees
- **Estimated Delivery:** Week 8
- **Focus:** Four reserve modes (Internal, External, CrossChain, NoReserve), staleness enforcement, fee configuration, and supplier allowances
- **Deliverables / Value Metrics:** Reserve verification across all modes with staleness checks; configurable fee schedules; supplier minting within allowance limits

### Milestone 5: Integration & Documentation
- **Estimated Delivery:** Week 10
- **Focus:** Multi-tenant end-to-end testing, API documentation, and deployment guide
- **Deliverables / Value Metrics:** Production-ready platform with comprehensive test coverage, complete API reference, and step-by-step deployment documentation

---

## Acceptance Criteria
The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone
- Demonstrated functionality or operational readiness
- Documentation and knowledge transfer provided
- Alignment with stated value metrics

Project-specific conditions:
- **M1:** Working demo of stablecoin creation and basic operations; automated tests passing
- **M2:** All token operations and multi-sig flows demonstrated; SDK coverage for new operations
- **M3:** Compliance controls enforced on-ledger; role-based access verified across all 11 roles
- **M4:** Reserve modes validated with staleness enforcement; fee collection demonstrated
- **M5:** Multi-tenant E2E test suite passing; API docs and deployment guide reviewed and complete

---

## Funding

**Total Funding Request:** 52,000 CC

### Payment Breakdown by Milestone
- Milestone 1 (Stablecoin Creation & Basic Operations): 10,000 CC upon committee acceptance
- Milestone 2 (Full Token Operations & Multi-Sig): 12,000 CC upon committee acceptance
- Milestone 3 (Compliance & Access Control): 12,000 CC upon committee acceptance
- Milestone 4 (Proof of Reserve & Fees): 10,000 CC upon committee acceptance
- Milestone 5 (Integration & Documentation): 8,000 CC upon final release and acceptance

### Volatility Stipulation
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
Regulated stablecoin issuance is a foundational use case for any financial blockchain network. Canton Stablecoin Studio enables institutions to issue and manage compliant stablecoins without building custom infrastructure from scratch. This attracts institutional issuers to Canton Network, demonstrates Canton's capabilities for production-grade financial infrastructure, and establishes a reusable toolkit that accelerates future tokenization projects across the ecosystem.

---

## Rationale
A DAML-native approach leverages Canton's built-in privacy model and multi-party authorization — capabilities that would need to be rebuilt from scratch on EVM-based alternatives. The frontend-first architecture (no backend coordinator) reduces operational complexity and attack surface for issuers. An abstract oracle interface for proof of reserve supports all reserve models (internal, external, cross-chain) without requiring architecture changes. The modular toolkit design allows issuers to adopt only the capabilities they need, enabling reuse across different stablecoin use cases and regulatory regimes.
