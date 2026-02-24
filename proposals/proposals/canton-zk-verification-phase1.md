## Development Fund Proposal

**Author:** Cem Sel  
**Status:** Submitted  
**Created:** 2026-02-24  

---

## Abstract

This proposal funds Phase 1 of a native Zero-Knowledge (ZK) verification and anchoring framework for the Daml on Canton ecosystem. The project will deliver a Groth16 verifier integration, reusable Daml templates, and a developer SDK enabling confidential off-chain computations to be verified and anchored on Canton without revealing underlying private data. The goal is to provide shared, open-source infrastructure that strengthens Canton’s institutional privacy positioning and reduces duplicated cryptographic effort across builders.

---

## Specification

### 1. Objective

Canton enables privacy-preserving, multi-party coordination using Daml smart contracts. However, there is currently no standardized infrastructure for integrating zero-knowledge proof verification directly into Daml workflows.

The objective of Phase 1 is to:

- Implement a Groth16 proof verification framework compatible with Daml on Canton
- Provide reusable Daml templates for anchoring verified proofs
- Deliver an SDK that abstracts proof generation and Daml transaction construction
- Ensure deterministic and secure verification behavior within Canton’s execution model

This proposal focuses strictly on delivering core infrastructure, not an application-layer product.

---

### 2. Implementation Mechanics

The architecture follows a **library-based approach** and does not require modification of Canton node software or the Daml interpreter.

#### Off-Chain Layer (Prover)

- Supported proof system: Groth16
- Curve: BN254 (Phase 1 scope)
- Proofs generated using Arkworks or Circom-compatible tooling
- Public inputs and proof elements serialized deterministically

#### SDK Layer

- TypeScript SDK package
- Constructs Daml command payloads
- Encodes:
  - Verification key
  - Proof elements
  - Public inputs
- Handles deterministic serialization and transaction submission

#### On-Ledger Layer (Daml)

The following templates will be implemented:

- `VerificationKey`
- `ProofSubmission`
- `ProofAnchored`

Workflow:

1. Verification key stored via `VerificationKey` template.
2. Prover generates proof off-chain.
3. SDK submits proof using `ProofSubmission`.
4. Verification logic executed deterministically.
5. If valid → `ProofAnchored` contract created.
6. If invalid → transaction fails.

Phase 1 verification will be implemented using deterministic verification logic consistent with Daml interpreter constraints. No consensus-layer or protocol modifications are required.

---

### 3. Architectural Alignment

This proposal aligns with Canton’s architecture in the following ways:

- Respects Daml’s fine-grained data visibility model
- Enables confidential proof anchoring without exposing private data to unauthorized parties
- Preserves multi-party atomic transaction guarantees
- Avoids external chain dependencies
- Requires no changes to Canton protocol or node software

Alignment with CIP-0082:
- Core R&D advancing ecosystem capabilities
- Shared developer tooling
- Reusable infrastructure

Alignment with CIP-0100:
- Milestone-gated funding
- Open-source outputs
- Transparent reporting commitment

---

### 4. Backward Compatibility

No backward compatibility impact.

This proposal introduces new Daml templates and SDK tooling without modifying existing contracts or protocol behavior.

---

## Milestones and Deliverables

### Milestone 1: Architecture & Technical Specification

- **Estimated Delivery:** Month 1  
- **Focus:** Formal specification and architecture design  
- **Deliverables / Value Metrics:**
  - Published technical specification
  - Defined proof system (Groth16, BN254)
  - Daml integration design
  - Threat model and cost estimation
  - Public GitHub repository

Funding: 150,000 CC upon acceptance

---

### Milestone 2: Groth16 Verifier & Daml Integration

- **Estimated Delivery:** Month 2–3  
- **Focus:** Functional implementation  
- **Deliverables / Value Metrics:**
  - Daml templates:
    - `VerificationKey`
    - `ProofSubmission`
    - `ProofAnchored`
  - TypeScript SDK
  - End-to-end demo
  - Open-source publication

Acceptance demonstration:
- Valid proof → transaction succeeds and anchors
- Invalid proof → deterministic transaction failure
- At least 1 external integration or formal integration commitment

Funding: 250,000 CC upon acceptance

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Milestones delivered as specified
- Deterministic verification behavior
- Successful demonstration of proof anchoring
- Code published under open-source license
- Documentation sufficient for third-party reuse

---

## Funding

**Total Funding Request:** 400,000 Canton Coin (CC)

### Payment Breakdown by Milestone

- Milestone 1: 150,000 CC  
- Milestone 2: 250,000 CC  

### Volatility Stipulation

The project duration is under 6 months.  
Funding is denominated in fixed Canton Coin.  
If scope changes extend the project beyond 6 months, funding terms may be renegotiated to account for significant USD/CC price volatility.

---

## Co-Marketing

Upon release, the implementing entity will collaborate with the Foundation on:

- Coordinated announcement
- Technical blog or documentation post
- Developer-facing walkthrough

---

## Motivation

Canton’s institutional positioning emphasizes privacy-preserving coordination. Zero-knowledge verification infrastructure enhances this capability by enabling:

- Confidential compliance attestations
- Verifiable off-chain computation
- Private asset proofs
- Privacy-preserving settlement triggers

Providing shared infrastructure reduces duplication and lowers the barrier for builders to integrate advanced cryptographic functionality.

---

## Rationale

Groth16 over BN254 was selected for Phase 1 due to:

- Maturity and ecosystem support
- Efficient verification cost profile
- Compatibility with existing tooling

A library-based architecture was chosen instead of protocol modification to:

- Minimize execution risk
- Preserve backward compatibility
- Accelerate adoption
- Reduce governance overhead

Future phases may extend support to additional proof systems (e.g., PLONK) or performance optimizations, but are intentionally excluded from Phase 1 to maintain scoped delivery.
