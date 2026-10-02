# Canton zkTLS Proposal
## Development Fund Proposal

**Organization:** Primus Labs and HashCloak Inc.  
**Author / Primary Contact:** Xiang Xie, Primus Labs; Mikerah Quintyne-Collins, HashCloak Inc.  
**Status:** Draft  
**Created:** 2026-09-21  
**Proposal Type:** RFP-aligned  
**RFP / Roadmap Area:** Financial Markets, Standards & Verification — Public verifiability  
**Champion:** Needs Champion  
**Total Funding Request:** 1,303,500 CC  
**Project Duration:** 14 weeks  
**Label:** frp-11:public-verifiability

---

## Abstract

Primus Labs and HashCloak propose to develop an open-source zero-knowledge verification layer for Canton. HashCloak will implement Groth16 and UltraHonk proof verification in Daml, including the finite-field, extension-field, elliptic-curve, pairing, transcript, serialization, testing, and benchmarking components required by those verifiers. Primus will then integrate the UltraHonk verifier into its zkTLS system and deliver a reference workflow in which a Canton application can verify a claim derived from private TLS data without receiving the underlying data or relying on Primus to attest to the result. The project will give Canton developers reusable verification components and a working zkTLS integration that advances the roadmap goal of publicly verifiable information without sacrificing the privacy of source transactions or off-chain data.

---

## Specification

### 1. Objective

The objective is to enable Canton applications to verify zero-knowledge claims derived from private off-chain data through reusable Daml verifiers and an end-to-end Primus zkTLS reference integration. Today, Primus can produce proofs about data obtained through TLS sessions, but Canton does not provide the Daml cryptographic components needed to verify the resulting Groth16 or UltraHonk proofs within an application workflow. This limits the ability of Canton applications to consume privacy-preserving proofs without introducing an external verification service or trusted attestor.

The intended outcome is a reusable verification layer that accepts a proof, public inputs, and verification key data; evaluates the proof in Daml; and exposes the verification result to a Canton application. The Primus integration will demonstrate this capability with a zkTLS claim, allowing an application to verify a statement about authenticated private web data while keeping the underlying session data confidential.

### 2. Implementation Mechanics

HashCloak will first establish the Daml representations and arithmetic needed for proof verification. Because the verifier requires values larger than Daml's ordinary integer types, this work will include serialization and limb encoding for 256-bit values, base-field and scalar-field operations, extension-field arithmetic over Fp2, Fp6, and Fp12, and G1 and G2 group operations. The implementation will include addition, subtraction, negation, multiplication, squaring, inversion, point addition and doubling, scalar multiplication, affine and projective conversions, and on-curve and subgroup checks.

On that foundation, HashCloak will implement the Miller loop and final exponentiation required for pairing checks, followed by a Groth16 verifier. HashCloak will then implement the Fiat-Shamir transcript and UltraHonk verifier required by Primus' Noir proof pipeline. The transcript will use the Keccak-256 functionality available in Canton 3.4. Tests and benchmarks will be developed throughout the implementation to evaluate correctness and determine whether the arithmetic and verifier workloads are practical within the Daml execution environment.

Primus will integrate the UltraHonk verifier with its existing zkTLS proof pipeline. In the reference workflow, Primus' system will generate an UltraHonk proof for a statement derived from an authenticated TLS session. A Canton application will submit or receive the proof and its public inputs, invoke the Daml verifier, and use the verification result as a condition within the application workflow. The integration will include an example application flow, test vectors, integration tests, and developer documentation describing proof generation, encoding, submission, and verification.

The work will be delivered as reusable open-source Daml components rather than logic restricted to a single application. The Groth16 verifier will provide a second commonly used proof-system interface for Canton developers, while the Primus integration will validate the UltraHonk path against a concrete public-verifiability use case.

### 3. Architectural Alignment

This work directly addresses the roadmap's Public verifiability RFP and its call for zero-knowledge proofs of private data. Canton intentionally restricts the disclosure of transaction details, while many financial applications require verifiable facts derived from private activity or external data. A Daml-native verification layer allows an application to act on a proven statement without requiring the application, its users, or the wider network to receive the underlying private data.

The proposal extends Canton's existing Daml application model and Canton 3.4 Keccak-256 support. Verification occurs within the application workflow, and only the proof and explicitly selected public inputs need to be disclosed. The verifier components will be reusable by issuers, applications, and attestor-based workflows that need to validate Groth16 or UltraHonk proofs. The Primus integration provides a reference for bringing authenticated external data into Canton while preserving the confidentiality of the TLS session.

No CIP dependency has been identified for this application-level implementation. If implementation testing identifies a required change to Daml or Canton protocol behavior, that dependency will be documented separately rather than assumed within this grant's scope.

### 4. Backward Compatibility

No backward compatibility impact. The verifier libraries and Primus reference integration will be additive. Existing Daml applications and Primus workflows will not be required to adopt the new verification path.

---

## Milestones and Deliverables

### Milestone 1: Daml Cryptographic Foundations

- **Estimated Delivery:** End of week 4
- **Focus:** Establish the numeric representations and cryptographic arithmetic required by the proof verifiers.
- **Deliverables / Value Metrics:**
  - Open-source Daml serialization and limb encoding for 256-bit values.
  - Base-field, scalar-field, Fp2, Fp6, and Fp12 arithmetic with unit and cross-implementation test vectors.
  - G1 and G2 point arithmetic, affine/projective conversion, and validity checks with test coverage.
  - Initial benchmarks documenting the cost of core arithmetic in the target Canton environment and an evidence-based feasibility checkpoint for the remaining verifier work.

### Milestone 2: Groth16 and UltraHonk Verification in Daml

- **Estimated Delivery:** End of week 10
- **Focus:** Implement reusable proof verification components on top of the Daml cryptographic foundation.
- **Deliverables / Value Metrics:**
  - Pairing implementation, including the Miller loop and final exponentiation, with compatibility test vectors.
  - Groth16 verifier supporting proof, public-input, and verification-key validation.
  - Keccak-256-based Fiat-Shamir transcript and UltraHonk verifier compatible with the Primus Noir proof pipeline.
  - End-to-end positive and negative verification tests, benchmarks, and documented constraints.
  - Public interfaces and documentation sufficient for a Canton application developer to invoke either verifier without rebuilding the underlying arithmetic.

### Milestone 3: Primus zkTLS Integration

- **Estimated Delivery:** End of week 13
- **Focus:** Connect Primus' zkTLS proof pipeline to the Daml UltraHonk verifier and demonstrate a Canton application consuming a privacy-preserving claim.
- **Deliverables / Value Metrics:**
  - Encoding and integration layer between Primus-generated UltraHonk proofs and the Daml verifier.
  - Reference Canton workflow that verifies a claim derived from an authenticated TLS session without disclosing the underlying private session data.
  - Integration tests and reproducible test vectors covering valid proofs, invalid proofs, malformed inputs, and public-input binding.
  - A runnable example that demonstrates independent verification without a Primus-signed attestation being used as the source of trust.

### Milestone 4: Validation, Documentation, and Release

- **Estimated Delivery:** End of week 14
- **Focus:** Validate the combined implementation and make it reusable by Canton ecosystem developers.
- **Deliverables / Value Metrics:**
  - Consolidated benchmark report covering verifier execution characteristics and practical operating constraints.
  - Developer documentation for building, testing, and integrating the Daml verifiers and Primus zkTLS reference flow.
  - Architecture notes and a recorded or live technical walkthrough for Canton developers.
  - Public release of the source code, tests, example integration, and documentation under an open-source license.

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone
- Demonstrated functionality or operational readiness
- Documentation and knowledge transfer provided
- Alignment with stated value metrics
- A Canton application can verify valid Groth16 and UltraHonk test proofs and reject invalid or malformed proofs using the delivered Daml interfaces.
- The Primus reference workflow demonstrates that a Canton application can verify a zkTLS-derived claim without access to the private TLS session data and without treating a Primus signature as the source of trust.
- The verifier components, test vectors, documentation, and reference integration are publicly available and reusable by Canton ecosystem developers.
- Benchmarks clearly document the supported execution profile and any practical limitations discovered in the target Canton environment.

The acceptance criteria are based on ecosystem value: Canton developers will gain reusable verification components for two widely used proof systems and a working reference for applying those components to private, authenticated external data.

---

## Funding

**Total Funding Request:** 1,303,500 CC. This is approximately USD 150,000 using a reference rate of USD 0.115076 per CC on 2026-09-21.

### Payment Breakdown by Milestone

- Milestone 1 _Daml Cryptographic Foundations_: 260,700 CC upon committee acceptance
- Milestone 2 _Groth16 and UltraHonk Verification in Daml_: 608,300 CC upon committee acceptance
- Milestone 3 _Primus zkTLS Integration_: 325,900 CC upon committee acceptance
- Milestone 4 _Validation, Documentation, and Release_: 108,600 CC upon final release and acceptance

### Volatility Stipulation

Should the project timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility.

---

## Co-Marketing

Upon release, Primus Labs and HashCloak will collaborate with the Foundation on:

- Announcement coordination
- A joint technical case study or blog explaining the Daml verifier architecture and zkTLS reference workflow
- A developer-facing demonstration or technical walkthrough
- Promotion of the open-source verifier components and integration documentation to Canton application developers

---

## Motivation

Canton's privacy model is suited to financial workflows in which transaction details and source data cannot be made broadly public. The same confidentiality, however, makes it difficult for other applications or market participants to verify selected facts without trusting the party publishing them. Zero-knowledge proofs address this gap by allowing a party to disclose a verifiable statement while withholding the underlying data.

The proposed Daml verifiers create shared infrastructure for that pattern. Groth16 is used across many existing zero-knowledge systems, while UltraHonk is part of the Noir ecosystem and the proof pipeline used by Primus. Supporting both gives Canton developers a reusable foundation for proofs produced by established toolchains rather than limiting the work to a proprietary proof format or one application.

Primus' zkTLS integration demonstrates how that foundation can connect Canton applications to private, authenticated web data. This can support workflows that need to establish facts about external financial or identity data without copying the source data on-chain. The immediate beneficiary is the Primus reference integration, but the reusable verifier interfaces can benefit any Canton application that needs to consume compatible Groth16 or UltraHonk proofs. Because there is not yet a reliable basis for estimating ecosystem-wide adoption, this proposal uses public availability, independent reproducibility, and successful end-to-end integration as its initial value measures rather than asserting an unsupported adoption percentage.

---

## Rationale

The proposal extends Canton's existing application framework by implementing proof verification in Daml. This keeps the verification decision within the same application workflow that consumes the result and avoids introducing a separate trusted verification service. It also preserves Canton's privacy model because the verifier requires only the proof and the public inputs selected by the proof statement.

The main alternatives are to disclose the underlying data, rely on an issuer or Primus to publish a signed attestation, or verify proofs in an external service and relay the result to Canton. Direct disclosure is incompatible with many private financial and identity workflows. Signed attestations and external verification services can be useful, but they shift trust to the operator and do not provide independent cryptographic verification inside the application. A Daml-native verifier provides the stronger trust model targeted by the Public verifiability RFP.

The implementation begins with reusable arithmetic and pairing components because Daml does not currently expose the full set of primitives required by Groth16 and UltraHonk verification. Building these components once and exposing stable verifier interfaces is preferable to embedding application-specific verification logic in the Primus integration. The Groth16 implementation broadens compatibility with existing proof producers, while UltraHonk provides a direct path to the Primus Noir-based zkTLS system.

The work is technically ambitious because verifier arithmetic may be expensive under Daml interpretation. For that reason, benchmarking and feasibility validation begin with the foundational milestones and continue throughout delivery. If testing identifies execution limits, the project will document them and optimize the verifier within the existing Canton and Daml architecture before considering any separate protocol or language change. This staged approach produces reusable components and concrete performance evidence while keeping the grant focused on a single outcome: privacy-preserving proof verification for Canton applications.
