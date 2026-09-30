## Development Fund Proposal

**Author:** Tenzro (lead), with Minima and Furcate
**Status:** Submitted
**Created:** 2026-07-31
**Label:** dapp-integration
**[Champion](https://github.com/canton-foundation/canton-dev-fund/blob/main/sig-directory.md):** need Champion

---

## Abstract

Canton enables institutional-grade financial workflows with privacy-preserving settlement and composable smart contract logic, but there is no reusable infrastructure for consuming cryptographically verified real-world data from physical devices, industrial systems, and edge AI environments.

This proposal delivers the **Edge Data Toolkit**: an open-source, Apache 2.0 licensed toolkit that lets any Canton participant consume hardware-verified edge data through standard Daml workflows with minimal integration effort. It standardizes ingestion of IoT, industrial sensor, logistics, ESG, and on-device AI data while preserving Canton's privacy model, unlocking Canton participation for industrial and physical infrastructure operators across RWA collateral, parametric insurance, and supply chain finance use cases.

The work is delivered by a consortium combining edge blockchain runtime (Minima), on-device AI inference and hardware attestation (Furcate), and Canton-native integration and Daml tooling (Tenzro).

---

## Specification

### 1. Objective

Canton enables institutional-grade financial workflows with privacy-preserving settlement and composable smart contract logic. However, there is a lack of reusable infrastructure for consuming cryptographically verified real-world data from physical devices, industrial systems, and edge AI environments.

**Objective**: Deliver an open-source Edge Data Toolkit that allows any Canton participant to consume hardware-verified edge data through standard Daml workflows with minimal integration effort.

**Scope**: The toolkit standardizes ingestion of IoT, industrial sensor, logistics, ESG, and on-device AI data while preserving Canton's privacy model. It targets industrial and physical infrastructure operators, enabling them to participate securely in Canton's ecosystem for RWA collateral, parametric insurance, supply chain finance, and related use cases.

This project directly addresses the gap between edge-generated physical data and Canton's institutional privacy architecture.

### 2. Implementation Mechanics

The solution consists of four layers:

**Layer 1 — Edge Inference & Automation (Furcate)**: On-device AI inference in Trusted Execution Environments (TEE), with signed records (model hash, input fingerprint, output, confidence score, hardware attestation). No raw data leaves the device.

**Layer 2 — Edge Anchoring (Minima)**: Embedded blockchain node for TxPoW-based anchoring of inference records, providing device identity binding and immutable provenance.

**Layer 3 — Settlement Bridge (Tenzro)**: Rust + TypeScript middleware that subscribes to Minima streams, verifies TEE signatures and proofs, and submits verified events as Canton Ledger API commands. Maintains an Edge Oracle Participant node with replay protection.

**Layer 4 — Canton Network Integration**: Daml contracts consume `EdgeDataReport` objects using observer permissions and sub-transaction privacy for atomic composition with existing workflows.

**Core Components**:

- Edge Oracle Daml Package (DAR)
- Provenance Bridge Service
- TypeScript + Go SDK Extensions
- Reference Applications & Operator Toolkit

All components will be released under Apache 2.0.

### 3. Architectural Alignment

The toolkit is fully compatible with existing Canton oracle patterns and VerifierConfig systems, while focusing on hardware-generated physical/operational data (distinct from traditional financial oracles).

It leverages Canton's core strengths:

- Sub-transaction privacy and observer-based access control
- Ledger API integration
- Participant node model
- Daml contract composability

The design enables industrial operators (e.g., via Minima's partnerships with Siemens, ABB, Volvo and Furcate's deployed edge AI projects) to contribute verified data without exposing sensitive raw information, aligning with Canton's institutional-grade privacy and "network of networks" philosophy.

### 4. Backward Compatibility

*No backward compatibility impact.*

All deliverables are additive. The Edge Oracle Daml package is a new DAR that existing applications opt into by referencing it; the Provenance Bridge runs as a separate service against a dedicated Edge Oracle Participant node; and the SDK work extends the existing TypeScript and Go SDKs rather than modifying their current surface. No changes are required to existing synchronizers, participant nodes, Daml packages, or integrations for them to continue operating unchanged.

---

## Milestones and Deliverables

### Milestone 1: Edge Attestation Package

- **Estimated Delivery:** ~6-8 weeks
- **Focus:** On-device inference attestation and edge anchoring foundations.
- **Deliverables / Value Metrics:** Edge inference SDK, Minima anchoring module, attestation schema, device test suite, open-source release.

### Milestone 2: Provenance Bridge

- **Estimated Delivery:** ~8-10 weeks
- **Focus:** Verified delivery of edge events onto Canton via the Ledger API.
- **Deliverables / Value Metrics:** Minima event subscriber, verification pipeline, Canton Ledger API integration, sandbox deployment.

### Milestone 3: Daml Package & SDK

- **Estimated Delivery:** ~8-10 weeks
- **Focus:** Making edge data consumable from Daml applications through standard tooling.
- **Deliverables / Value Metrics:** `EdgeDataReport` DAR package, TypeScript + Go SDKs, reference Daml workflows (parametric insurance, supply chain, RWA), security audit.

### Milestone 4: Operator Toolkit & Pilot

- **Estimated Delivery:** ~6-8 weeks
- **Focus:** Operator adoption, live pilot, and community handover.
- **Deliverables / Value Metrics:** Documentation, Canton Participant config templates, Docker guides, live pilot with at least one Canton operator, community handover.

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone
- Demonstrated functionality or operational readiness
- Documentation and knowledge transfer provided
- Alignment with stated value metrics

Project-specific acceptance conditions, by milestone:

**Milestone 1 — Edge Attestation Package**
Code published in public repo(s), documentation complete, successful testing on ≥2 hardware platforms in sandbox, community review passed.

**Milestone 2 — Provenance Bridge**
Bridge successfully processes end-to-end test events with verification <500ms, replay protection demonstrated, deployed and operational in Canton sandbox environment.

**Milestone 3 — Daml Package & SDK**
DAR package compiles and deploys cleanly, SDKs support subscription to `EdgeDataReport` contracts with working examples, independent security audit completed with findings addressed.

**Milestone 4 — Operator Toolkit & Pilot**
Time-to-first-integration demonstrated <2 hours, ≥1 live pilot generating `EdgeDataReport`s, comprehensive documentation and onboarding materials published, code and docs handed over to community maintainers.

Ecosystem-value outcomes targeted across the grant (see Success Metrics below): ≥3 operators onboarded, ≥10,000 `EdgeDataReport`s generated in pilot, ≥3 supported hardware platforms, and ≥1 live industrial/RWA workflow activated on Canton.

---

## Funding

**Total Funding Request:** 3.06m CC (≈ $500,000 USD equivalent at time of submission)

### Payment Breakdown by Milestone

Funding will be disbursed in Canton Coin (CC) upon successful completion and acceptance of each milestone by the Tech & Ops Committee.

- Milestone 1 *(Edge Attestation Package)*: 600k CC upon committee acceptance
- Milestone 2 *(Provenance Bridge)*: 850k CC upon committee acceptance
- Milestone 3 *(Daml Package & SDK)*: 850k CC upon committee acceptance
- Milestone 4 *(Operator Toolkit & Pilot)*: 760k CC upon final release and acceptance

### Volatility Stipulation

The aggregate milestone timeline (~28-36 weeks) is **greater than 6 months**. The grant is denominated in fixed Canton Coin and will require a re-evaluation at the 6-month mark.

The team is open to re-evaluating amounts in case of material CC price volatility or timeline extension, per Development Fund guidance.

---

## Co-Marketing

Upon release, the implementing entity will collaborate with the Foundation on:

- Announcement coordination
- Case study or technical blog
- Developer or ecosystem promotion

Specific commitments:

- A technical blog post and reference walkthrough covering end-to-end edge-to-Canton data flow, published alongside the open-source release
- A joint case study on the Milestone 4 pilot with the participating Canton operator
- Developer-facing onboarding material (quickstart, Docker deployment guide) suitable for Foundation distribution channels
- Coordination with the Foundation on announcements involving consortium industrial partners

---

## Motivation

Canton's growth depends on expanding the set of participants and asset classes it can serve. Today, workflows that depend on physical-world state — RWA collateral monitoring, parametric insurance triggers, supply chain finance milestones, ESG reporting — cannot source that state in a form Canton applications can trust. Each team that needs verified device data must build its own attestation, anchoring, verification, and Ledger API integration stack, which is prohibitive for industrial operators who are not Canton-native engineering organizations.

**Ecosystem impact.** The toolkit turns that per-team integration burden into shared infrastructure. Any Canton application whose logic depends on real-world state becomes addressable: the target is time-to-first-integration under 2 hours against a documented DAR and SDK, versus a bespoke build today.

**Expected adoption.** The beneficiary segment is the subset of Canton dApps whose workflows are triggered by physical or operational events rather than purely financial ones — RWA, insurance, supply chain, and ESG applications. We do not claim this is a majority of dApps today; it is precisely the segment that is currently underserved because the infrastructure does not exist. Within the grant period we target ≥3 operators onboarded, ≥1 live industrial/RWA workflow activated, and ≥2 external integrations contributed post-launch, with the SDK extensions delivered for both TypeScript and Go to cover the dominant Canton client languages.

**Strategic importance.** Canton's differentiator is institutional-grade privacy. Physical-world data is exactly the category where privacy matters most: operators cannot expose raw sensor, production, or logistics data, but can attest to derived facts. By anchoring the derived fact and keeping raw data on-device, the toolkit lets industrial operators participate without surrendering commercially sensitive information — a capability that generic oracle infrastructure on transparent ledgers cannot offer.

---

## Rationale

**Extend, don't replace.** The toolkit is designed to fit alongside existing Canton oracle patterns and VerifierConfig systems rather than substitute for them. Traditional financial oracles solve price and reference-data distribution; they assume a trusted publisher and do not address device identity, hardware attestation, or provenance of physical measurements. Rather than fork or reimplement those patterns, the Edge Data Toolkit adds the missing layer beneath them — hardware-rooted attestation and anchoring — and surfaces the result through the same Daml contract and observer-permission mechanisms Canton applications already use. `EdgeDataReport` is consumed like any other Daml contract, so it composes atomically with existing workflows without new primitives.

**Why hardware attestation plus anchoring, rather than a signed API feed.** A signed feed from an operator's server proves only that the operator's server asserted something. The failure modes that block institutional adoption of physical-world data are device spoofing and post-hoc data revision. TEE-based inference with a signed record (model hash, input fingerprint, output, confidence, hardware attestation) binds the claim to specific hardware running specific code, and TxPoW anchoring on Minima makes subsequent revision detectable. Neither layer alone is sufficient: attestation without anchoring permits silent replacement of history, and anchoring without attestation immutably records an unverified claim.

**Why keep raw data off-ledger and off-chain.** Submitting raw sensor or production data — even to a privacy-preserving ledger — is a non-starter for the industrial operators this targets, and would inflate ledger state without benefit. Deriving the fact on-device and transmitting only the attested result preserves both commercial confidentiality and Canton's performance characteristics, and is what makes Canton's sub-transaction privacy model the right settlement venue rather than an obstacle.

**Why a dedicated Edge Oracle Participant node.** Running the bridge against its own participant node isolates the trust boundary and failure domain of external data ingestion from application participants, and lets replay protection and verification be enforced at a single auditable point before anything reaches the ledger.

**Alternatives considered.** Building this as application-specific integration inside a single dApp was rejected because it produces no reusable ecosystem asset and repeats the cost for every subsequent team. Extending an existing financial oracle framework to carry attestation metadata was rejected because those frameworks assume publisher trust and would require changing their trust model rather than extending their surface — the opposite of a compatible extension. Delivering only the Daml package without the bridge and operator toolkit was rejected because the integration cost, not the contract schema, is the actual barrier to adoption.

**Consortium structure.** The three layers require genuinely different expertise — TEE and on-device inference, edge blockchain runtime, and Canton-native integration. Each is contributed by the party that already operates production systems in that domain, rather than by a single team learning two of the three during the grant.

---

## Consortium Capabilities & Team

- **Tenzro**: Active in the Canton ecosystem since early 2025, with experience in validators, Daml tooling, and Ledger API integrations.
- **Minima**: Production edge blockchain with close partnerships including Siemens, ABB, and Volvo.
- **Furcate**: Deployed real-world on-device AI inference projects globally, with hardware attestation expertise.

This consortium combines Canton-native integration experience with proven industrial and edge deployment track records.

---

## Success Metrics & Adoption Plan

- Operators onboarded: ≥ 3
- `EdgeDataReport`s generated (pilot): ≥ 10,000
- Supported hardware platforms: ≥ 3
- Time-to-first integration: < 2 hours
- External contributions post-launch: ≥ 2 integrations
- Pilot industrial/RWA workflows activated: ≥ 1

**Adoption Plan**: Open-source release on GitHub, Docker-based deployment, sandbox environment, documentation, and direct engagement with existing Canton operators and industrial partners.

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Device spoofing | Hardware-bound identity + TEE |
| Data tampering | Minima anchoring |
| Bridge/node issues | Redundant architecture + replay protection |

All outputs are designed for long-term maintainability and community contributions.

---

## Conclusion

The Edge Data Toolkit fills a critical gap in Canton's infrastructure, enabling secure integration of verified physical-world data and broadening participation to industrial operators. All deliverables are open-source, verifiable, and built for immediate ecosystem reuse.
