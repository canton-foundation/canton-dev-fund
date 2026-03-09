## Development Fund Proposal

**Author:** Praecise LTD
**Status:** Submitted
**Created:** 2026-03-04

---

## Abstract

This proposal requests a grant from the Development Fund to support Praecise LTD in building the **Praecise Trust Layer** — a privacy-preserving decentralized identity and compliance layer for the Canton Network. The protocol combines zero-knowledge proofs, AI-powered KYC verification, hardware-backed security via Trusted Execution Environments (TEE), and a TEE-based cross-chain bridge enabling secure interoperability between Canton and external blockchain networks.

The Praecise team are co-founders of Tenzro Labs, builders of Canton developer tools including the DAML Studio AI coding platform, with hands-on experience writing DAML contracts and shipping live applications on the Canton Network. Praecise LTD brings this deep Canton expertise to the identity and compliance domain.

Canton's sub-transaction privacy model makes it uniquely suited for institutional finance, but the ecosystem currently lacks a native identity and compliance layer that preserves user privacy while meeting regulatory requirements (eIDAS 2.0, MiCA, Travel Rule). The Praecise Trust Layer fills this gap by enabling verifiable credentials, privacy-preserving KYC, and cross-chain asset movement — all without exposing personally identifiable information on-chain.

---

## Specification

### 1. Objective

Deliver a production-ready identity, compliance, and interoperability protocol for Canton consisting of four integrated components:

**Self-Sovereign Identity (SSI) Layer**
- W3C DID-compliant decentralized identifiers anchored on Canton via DAML contracts
- WebAuthn/FIDO2 passkey authentication with hardware-backed key material (Face ID, Touch ID, security keys)
- DID Document generation with JsonWebKey2020 verification methods
- Tiered access control system mapping identity credentials to asset class permissions
- DAML templates for on-chain identity records, verifiable credentials, and access grants

**Zero-Knowledge KYC System**
- Privacy-preserving identity verification using Groth16 proofs (BN128 curve)
- All document processing (OCR, face matching, liveness detection) performed exclusively inside Trusted Execution Environments (AMD SEV-SNP / Intel TDX) — raw PII never stored or transmitted
- Poseidon hash commitments bind identity attributes without revealing them
- Nullifier-based Sybil resistance prevents duplicate identity creation
- Credential types: Liveness, Personhood, Residency, KYC Basic, KYC Enhanced, Institutional
- MPC threshold signing (2-of-3) for credential issuance — no single party can forge credentials

**AI-Powered Verification Engine**
- Document authenticity analysis using computer vision models for passport, national ID, and driver's license verification
- Biometric liveness detection to prevent spoofing (photo/video replay attacks)
- Face matching with configurable confidence thresholds (minimum 0.75, recommended 0.80–0.85)
- Continuous monitoring and anomaly detection for ongoing compliance
- MRZ (Machine Readable Zone) parsing for automated data extraction

**TEE-Based Cross-Chain Bridge**
- Multi-TEE support: AMD SEV-SNP and Intel TDX Confidential Computing nodes with vTPM 2.0 attestation
- Hardware-attested bridge validators — signing keys bound to verified TEE environments via TPM quotes
- FROST threshold signatures (2-of-3) for cross-chain transaction authorization
- Support for EVM chains (Ethereum, Base, Arbitrum, Polygon) and Solana
- Atomic settlement coordination between Canton DAML contracts and external chain execution
- gRPC with mutual TLS for secure communication between bridge components

### 2. Implementation Mechanics

Development roadmap across 3 months:

- **Weeks 1–4: Identity Foundation + ZK-KYC Core**
  W3C DID implementation on Canton via DAML contracts. WebAuthn/passkey registration and authentication flow. Groth16 circuit design for identity commitments (Circom + snarkjs). TEE-based document processing pipeline (AMD SEV-SNP / Intel TDX). Poseidon hash commitment generation and on-chain verification. Credential issuance with MPC threshold signing. Tiered access control DAML templates.

- **Weeks 5–8: AI Verification + Cross-Chain Bridge**
  AI document verification and liveness detection models. Face matching pipeline with TEE isolation. TEE bridge validator deployment on GKE Confidential Nodes. FROST key generation ceremony and threshold signing service. Cross-chain message passing for EVM and Solana. Atomic settlement coordination with Canton DAML contracts. vTPM attestation and hardware binding for bridge validators.

- **Weeks 9–12: Integration Testing + Security Audit + Public Release**
  End-to-end integration testing across identity, KYC, and bridge components. Third-party security audit of ZK circuits, TEE attestation, and MPC signing. Performance optimization and load testing. Documentation, SDK, and developer guides. Public release with Canton Devnet deployment.

**Infrastructure stack (GCP):**
- GKE Confidential Nodes (AMD SEV-SNP / Intel TDX) for TEE workloads and bridge validators
- Standard GKE cluster for API services and frontend
- PostgreSQL for credential metadata and audit trails
- Valkey for session management, challenge storage, and circuit breaker state

**Technology stack:**
- DAML 3.x smart contracts for on-chain identity and settlement
- Rust for MPC signer service (FROST/CGGMP24 protocols)
- snarkjs + Circom for Groth16 zero-knowledge proof generation
- TypeScript/Node.js for API layer and WebAuthn integration
- gRPC with mTLS for inter-service communication

### 3. Architectural Alignment

The Praecise Trust Layer directly addresses Canton's institutional finance positioning. Canton's sub-transaction privacy model ensures that identity data is only visible to authorized parties, making it the ideal settlement layer for privacy-preserving credentials. The protocol aligns with Canton's architecture in several ways:

- **Privacy by design**: ZK proofs and TEE processing ensure no raw PII touches the ledger — only cryptographic commitments and proofs are recorded on Canton, complementing Canton's sub-transaction privacy guarantees
- **DAML-native**: All identity contracts are implemented as DAML templates with proper authorization patterns (signatory/observer), supporting Canton's Smart Contract Upgrade (SCU) rules for forward compatibility
- **Interoperability**: The TEE-based bridge extends Canton's reach to external ecosystems (EVM, Solana) with hardware-attested security, enabling institutional users to move assets across chains with verifiable identity compliance
- **Regulatory alignment**: Tiered KYC credentials map directly to regulatory requirements (eIDAS 2.0, MiCA, Travel Rule), enabling Canton participants to prove compliance without duplicating verification across counterparties

### 4. Backward Compatibility

The protocol introduces new DAML templates and does not modify existing Canton contracts or infrastructure. Identity credentials are opt-in — existing Canton participants can adopt the protocol incrementally. All new DAML template fields use Optional types to support Smart Contract Upgrades.

---

## Milestones and Deliverables

### Milestone 1: Identity Foundation + ZK-KYC Core
- **Estimated Delivery:** +4 weeks (end of Week 4)
- **Focus:** On-chain identity system and privacy-preserving KYC verification.
- **Deliverables / Value Metrics:**
  - W3C DID implementation with DAML identity contracts deployed on Canton Devnet
  - WebAuthn/passkey authentication operational
  - Groth16 ZK circuits for identity commitments (proof generation and verification)
  - TEE-based document processing pipeline (AMD SEV-SNP / Intel TDX)
  - Poseidon hash commitment system with nullifier-based Sybil resistance
  - MPC threshold credential issuance (2-of-3)
  - Tiered access control DAML templates (4 tiers)
  - Unit and integration tests passing

### Milestone 2: AI Verification + Cross-Chain Bridge
- **Estimated Delivery:** +8 weeks (end of Week 8)
- **Focus:** AI-powered verification and hardware-attested cross-chain bridge.
- **Deliverables / Value Metrics:**
  - AI document verification (passport, national ID, driver's license)
  - Biometric liveness detection and face matching in TEE
  - TEE bridge validators deployed on GKE Confidential Nodes
  - FROST threshold signing service with vTPM attestation
  - Cross-chain transfers operational for EVM (Ethereum, Base, Arbitrum) and Solana
  - Atomic settlement coordination between Canton and external chains
  - gRPC mTLS communication between all bridge components

### Milestone 3: Security Audit + Public Release
- **Estimated Delivery:** +12 weeks (end of Week 12)
- **Focus:** Security hardening, audit, and public launch.
- **Deliverables / Value Metrics:**
  - Third-party security audit of ZK circuits, TEE attestation, and MPC signing
  - All critical and high-severity findings remediated
  - Performance benchmarks published (proof generation time, bridge latency, signing throughput)
  - Developer SDK and documentation
  - Public release deployed on Canton Devnet
  - Open-source ZK circuits and DAML contract templates

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone
- Demonstrated functionality or operational readiness
- Documentation and knowledge transfer provided
- Alignment with stated value metrics

**Project-specific acceptance conditions:**

- **Milestone 1:** DID creation and credential issuance complete end-to-end on Canton Devnet; ZK proof generation completes in < 10 seconds; proof verification succeeds on-chain; WebAuthn registration and authentication functional across Chrome, Safari, and Firefox; all 6 credential types issuable.
- **Milestone 2:** AI document verification achieves > 95% accuracy on standard test sets; face match false acceptance rate < 0.1%; bridge transfers complete successfully between Canton and at least 2 EVM chains + Solana; TEE attestation verifiable by external parties; bridge latency < 30 seconds for cross-chain transfers.
- **Milestone 3:** Independent security audit completed with no unresolved critical/high findings; SDK documentation covers all public APIs; ZK circuits and DAML templates published as open source; system sustains 100+ concurrent credential verifications.

---

## Funding

**Total Funding Request:** 762,000 CC (approximately $120,000 USD at 0.1575 USD/CC).

### Payment Breakdown by Milestone

- **Milestone 1** (Identity Foundation + ZK-KYC Core): 317,500 CC upon committee acceptance
  - Personnel (4 FTE × 4 weeks): ~266,700 CC (≈ $42,000)
  - TEE Infrastructure (GKE Confidential Nodes, AMD SEV-SNP / Intel TDX): ~31,700 CC (≈ $5,000)
  - ZK Circuit Development (Circom tooling, proving key generation): ~19,100 CC (≈ $3,000)

- **Milestone 2** (AI Verification + Cross-Chain Bridge): 317,500 CC upon committee acceptance
  - Personnel (4 FTE × 4 weeks): ~266,700 CC (≈ $42,000)
  - AI Model Training & Inference (document verification, liveness detection): ~31,700 CC (≈ $5,000)
  - Bridge Infrastructure (multi-chain RPC, validator nodes): ~19,100 CC (≈ $3,000)

- **Milestone 3** (Security Audit + Public Release): 127,000 CC upon committee acceptance
  - Third-Party Security Audit: ~95,200 CC (≈ $15,000)
  - Personnel (2 FTE × 4 weeks, remediation + docs): ~19,000 CC (≈ $3,000)
  - Contingency (~10%): ~12,800 CC (≈ $2,000)

### Payment Schedule

- Upon approval / start: 381,000 CC (50%)
- Upon Milestone 2 completion: 190,500 CC (25%)
- Upon Milestone 3 completion & public release: 190,500 CC (25%)

### Volatility Stipulation

The grant is denominated in fixed Canton Coin (CC). Should the project timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility.

### Budget Assumptions

- **Team Composition** (4-person full-time sprint team for 3 months):
  - 1 × Cryptography / ZK Engineer (Circom circuits, Groth16 proving systems, Poseidon hashing)
  - 1 × Rust / Security Engineer (MPC signer, FROST protocol, TEE attestation, bridge validators)
  - 1 × Full-Stack / AI Engineer (WebAuthn, KYC pipeline, document verification models)
  - 1 × DAML / Canton Engineer (identity contracts, settlement coordination, Ledger API integration)
- **Personnel Rate:** Blended hourly rate of $180/hour per team member (includes base salary, benefits, taxes, and overhead).
- **Security Audit:** Estimated at $15,000 for focused audit of ZK circuits, TEE attestation flow, and MPC signing (scope limited to cryptographic components).
- **Contingency:** ~10% buffer for audit remediation and scope adjustments.
- **Transparency:** Full timesheets, infrastructure billing exports, and audit reports available upon request.

---

## Co-Marketing

Upon release, Praecise LTD will collaborate with the Foundation on:

- Joint announcement highlighting Canton as the first institutional blockchain with native privacy-preserving identity
- Technical blog post and whitepaper on ZK-KYC architecture for institutional compliance
- Developer workshop demonstrating identity credential issuance and cross-chain bridge usage

**Additional Asks:**
- Canton Devnet access for development and testing
- Technical review of DAML contract design from Canton core team
- Inclusion in Canton's identity and compliance documentation

---

## Motivation

Institutional adoption of blockchain networks is fundamentally gated by identity and compliance. Financial institutions cannot transact on networks where counterparty identity is unverifiable, and regulators increasingly require verifiable KYC across jurisdictions (eIDAS 2.0, MiCA, Travel Rule). Canton's privacy model makes it uniquely positioned for institutional finance, but without a native identity layer, each participant must build bespoke KYC infrastructure — creating fragmentation, duplicated effort, and inconsistent compliance standards.

The Praecise Trust Layer provides a shared, privacy-preserving identity and compliance layer that enables any Canton participant to verify counterparty credentials without accessing raw PII. Combined with a hardware-attested cross-chain bridge, the protocol extends Canton's institutional guarantees to assets originating on external chains — a requirement for real-world asset tokenization and multi-chain DeFi participation.

---

## Rationale

Zero-knowledge proofs are the only cryptographic primitive that enables regulatory compliance without privacy compromise — a party can prove they are KYC-verified without revealing their identity documents. Combining ZK proofs with TEE-based processing ensures that even the verification step is hardware-isolated, eliminating trust in any single operator.

The TEE-based bridge architecture is chosen over MPC-only bridges because hardware attestation provides a verifiable root of trust — bridge validators can prove they are running correct code on genuine hardware, a property that pure software MPC cannot guarantee. This is critical for institutional users who require auditable security guarantees for cross-chain asset movement.

DAML smart contracts provide the authorization and workflow layer, leveraging Canton's sub-transaction privacy to ensure identity data visibility follows the need-to-know principle. The result is a compliance infrastructure that is cryptographically sound, privacy-preserving, and natively integrated with Canton's settlement model.
