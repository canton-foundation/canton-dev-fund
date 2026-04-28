## Development Fund Proposal: Quanton (post-QUANtum cryptography on canTON)

**Author:** Soundness Labs (soundness.xyz)  
**Status:** Draft  
**Created:** 2026-04-15  
**Label:** canton-protocol-multi-synchronizer  
**Champion:** Need Champion  

---

## Abstract

Quanton (post-QUANtum cryptography on canTON) implements native verification of post-quantum digital signatures on Canton Network. The project covers the three NIST-standardized schemes relevant to blockchain today: ML-DSA (FIPS 204), SLH-DSA (FIPS 205), and FN-DSA upon finalization. This gives Canton the cryptographic infrastructure to authenticate transactions against quantum-capable adversaries, and sets up the subsequent phase: key migration without address changes.

---

## Specification

### 1. Objective

Canton secures tokenized institutional assets across regulated financial markets. Its transaction authentication relies on ECDSA and Ed25519, both vulnerable to Shor's algorithm. When a cryptographically relevant quantum computer (CRQC) exists, an adversary derives the private key from any exposed on-chain public key and forges transaction authorizations. No physical access to key material is needed.

Quanton solves this by delivering efficient, standards-compliant verification of post-quantum digital signatures within Canton's execution environment. Each scheme is benchmarked against Canton's transaction processing model, validated against NIST Known Answer Test (KAT) vectors, and exposed through a clean interface callable from Daml workflows.

### 2. Implementation Mechanics

**Post-quantum signature schemes**

Post-quantum signatures are digital signature algorithms whose security does not depend on problems solvable by Shor's algorithm (integer factorization, discrete logarithm). The three NIST-standardized families cover the full spectrum of security assumptions relevant to institutional blockchains:

**ML-DSA (FIPS 204), lattice-based.** Formerly Dilithium. Fast verification, moderate signature sizes (2-4 KB depending on security level). NIST's primary general-purpose recommendation and the most commonly deployed post-quantum signature scheme in production blockchain systems today. Verification complexity is comparable to Ed25519 in practical benchmarks.

**SLH-DSA (FIPS 205), hash-based.** Formerly SPHINCS+. Security rests entirely on hash function collision resistance, with no lattice or number-theoretic assumptions. Larger signatures (8-50 KB) but the strongest diversity hedge against future cryptanalytic advances targeting lattice constructions. Recommended by several regulatory bodies as a secondary scheme alongside ML-DSA. Relevant for Canton participants with long-term compliance horizons.

**FN-DSA (forthcoming FIPS), NTRU-lattice-based.** Formerly Falcon. Compact signatures (~1 KB), fast verification, based on NTRU lattices rather than module lattices. The smallest post-quantum signature scheme in the NIST portfolio, with emerging deployments in custody and key management systems.

**Implementation scope per scheme:**

1. Core verification arithmetic: polynomial and matrix operations for ML-DSA; Merkle tree traversal, WOTS+, and FORS for SLH-DSA; NTT-based polynomial verification for FN-DSA.
2. Verification cost benchmarked against Canton's transaction processing model: computational overhead, latency per security level, signature size impact.
3. Hash function comparison (SHA-3/SHAKE vs. Keccak-256) to identify the optimal tradeoff for Canton, drawing on prior work we conducted for Stellar and Soroban.
4. Clean verification interface callable from Daml workflows via Canton's extension points.
5. NIST KAT validation across all parameter sets for all three schemes.

**Migration pathway.** The verification library built here is the prerequisite for Soundness Labs' key migration construction: a mechanism that enables Canton participants to bind existing ECDSA and Ed25519 accounts to post-quantum keys without address changes or asset transfers. That construction is described in our paper accepted at Financial Cryptography 2026 (eprint 2025/1368). A separate proposal covering the migration phase will follow upon completion of Milestone 2.

### 3. Architectural Alignment

Verification operates at the participant node level within encrypted message flows. Sub-transaction privacy is fully preserved. The verification interface integrates with Daml's existing authorization framework without changes to its semantics. This proposal falls within CIP-0082 and CIP-0100 scope under core R&D, security, and critical infrastructure.

### 4. Backward Compatibility

No backward compatibility impact. The library is purely additive.

---

## Milestones and Deliverables

### Milestone 1: ML-DSA Verification
- **Estimated Delivery:** T+2 months
- **Focus:** Lattice-based signature verification, hash function optimization, Canton benchmarking
- **Deliverables / Value Metrics:**
  - Open-source ML-DSA verification library compatible with Canton participant nodes
  - Benchmark report: latency, computational cost, and signature size across NIST levels 1, 3, and 5
  - Hash function comparison (SHAKE vs. Keccak-256) with deployment recommendation for Canton
  - NIST KAT validation across all parameter sets, 95%+ test coverage

### Milestone 2: SLH-DSA Verification
- **Estimated Delivery:** T+4 months
- **Focus:** Hash-based signature verification with diversity hedge against lattice cryptanalysis
- **Deliverables / Value Metrics:**
  - Open-source SLH-DSA verification library compatible with Canton participant nodes
  - Benchmark report: latency, computational cost, and signature size across NIST levels 1, 3, and 5
  - Hash function comparison (SHAKE vs. Keccak-256) with deployment recommendation for Canton
  - NIST KAT validation across all parameter sets, 95%+ test coverage

### Milestone 3: FN-DSA Integration and Documentation
- **Estimated Delivery:** T+6 months
- **Focus:** NTRU-lattice-based compact signatures, cross-scheme benchmarking, developer enablement
- **Deliverables / Value Metrics:**
  - FN-DSA verification module (upon NIST finalization)
  - Full benchmark suite across all three schemes
  - Developer documentation and integration guide for Canton node operators and Daml developers
  - Technical blog post co-authored with the Canton Foundation

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- All implementations pass NIST KAT vectors for all schemes and parameter sets
- ML-DSA verification overhead below 15% at NIST Level 3 under Canton's transaction processing baseline
- All code open-source and published to the Canton Foundation repository
- Documentation and knowledge transfer provided per milestone
- Demonstrated functionality within Canton's execution environment

---

## Funding

**Total Funding Request: $210,000 USD**

This proposal implements NIST PQC primitives inside Canton's execution environment. The three milestones reflect the cost of cryptographic expertise with live PQ deployments across multiple chains. This scope requires direct primitive implementation, not framework development.

### Payment Breakdown by Milestone

- Milestone 1 (ML-DSA Verification): $70,000 CC upon committee acceptance
- Milestone 2 (SLH-DSA Verification): $70,000 CC upon committee acceptance
- Milestone 3 (FN-DSA & Documentation): $70,000 CC upon final release and acceptance

### Volatility Stipulation

The project duration is 6 months. Should the project timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility.

---

## Co-Marketing

Upon release, Soundness Labs will collaborate with the Foundation on:

- Canton announced as the first institutional blockchain with native post-quantum signature verification
- Joint technical publication: architecture overview and benchmark results
- Developer workshop on PQ verification for Canton application builders

---

## Motivation

On March 31, 2026, Google Research published updated resource estimates for breaking ECDLP-256. Their circuits require fewer than 1,200 logical qubits and 90 million Toffoli gates, executable in minutes on a system with under 500,000 physical qubits. This is a 20-fold reduction from prior public estimates. Google has set 2029 as their internal migration deadline.

Regulatory mandates are closing in. NIST finalized its post-quantum signature standards in August 2024. CISA published PQC migration categories in January 2026. CNSA 2.0 targets 2035; the ASD targets 2030. Canton participants operating under these frameworks carry regulatory exposure today, regardless of when a CRQC materializes.

**Why signatures before encryption.** Store-now-decrypt-later risk applies to encrypted data: an attacker collects ciphertext today and decrypts it once a CRQC is available. Signatures offer no equivalent grace period. A transaction signed with ECDSA is forgeable the moment a CRQC exists. There is no retroactive protection. Canton's on-chain public keys are already exposed.

*On encryption scope.* This proposal addresses the signature layer. TLS session keys, encrypted transaction payloads, and participant key agreement are equally important and technically complementary. We remain open to extending scope to cover encryption primitives within a follow-on milestone or a parallel track, in coordination with the Engineering and Tech & Ops teams.

---

## Rationale

**Three schemes, not one.** ML-DSA, SLH-DSA, and FN-DSA address different regulatory preferences and risk profiles across jurisdictions. Providing all three is the minimum credible offering for a regulated institutional network operating across multiple regulatory environments.

**Verification-first.** Signing stays within participant nodes and their KMS or HSM infrastructure. No participant sovereignty tradeoffs are introduced.

**Team.** Soundness Labs is built by a team combining deep cryptographic research and institutional execution. The founders bring 10+ years of experience across zero-knowledge proofs, MPC, threshold cryptography, and distributed systems, alongside a proven track record in scaling global crypto infrastructure sales.

**Alternatives rejected.** Transport-layer PQC only leaves transaction signatures unprotected. Single-scheme implementations fail multi-jurisdictional regulatory requirements. Deferring to the core team compounds timeline risk as mandates accumulate.
