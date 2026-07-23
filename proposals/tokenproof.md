# Development Fund Proposal


| Field | Detail |
|---|---|
| **Author** | Maranda Harris, Founder — CompliLedger |
| **Email** | maranda@compliledger.com |
| **Status** | Submitted |
| **Created** | 2026-04-17 |
| **Labels** | regulatory-compliance · financial-workflows-composability · token-asset-standards |
| **Champion** | Need Champion |
| **Repository** | https://github.com/Compliledger/canton_tokenproof |
| **Architecture Reference** | https://github.com/Compliledger/canton_tokenproof/blob/main/docs/architecture.md |

---
## Abstract

Organizations today spend significant time and money determining which requirements apply, gathering evidence, evaluating controls, producing reports, conducting audits, and demonstrating outcomes across internal controls, governance programs, contractual obligations, industry standards, and regulatory frameworks.

These activities are often manual, fragmented, expensive, and difficult to verify independently.

TokenProof is an open-source proof infrastructure primitive for the Canton Network.

The platform transforms requirements, controls, and evidence into machine-verifiable proof.

TokenProof determines applicability, identifies required controls, orchestrates evidence collection, evaluates controls against evidence, generates proof, preserves privacy, and publishes independently verifiable proof artifacts through a standardized proof architecture.

The result is operational proof.

Proof enables verification.

Verification enables confidence.

Confidence is earned because proof exists.

TokenProof is regulation agnostic. The platform supports internal controls, governance requirements, contractual obligations, asset registry controls, custodian controls, industry standards, and regulatory frameworks through a common proof-generation architecture.

By automating applicability determination, evidence collection, control evaluation, proof generation, and verification, TokenProof reduces manual effort, lowers audit costs, improves consistency, and eliminates the need for every organization to build proof infrastructure independently.

Rather than requiring every issuer, tokenization platform, custodian, transfer agent, asset registry, and settlement application to build its own evidence, evaluation, and proof infrastructure, TokenProof provides a reusable Canton-native primitive that can be adopted across the ecosystem.

The proposal requests funding to production-harden the existing proof-of-concept into an ecosystem-ready proof infrastructure primitive through security review, SDK delivery, dashboard development, ecosystem validation, and DevNet/TestNet/MainNet deployment.

Total Funding Request: $180,000 USD, denominated in Canton Coin at the prevailing USD/CC rate at each milestone acceptance.
---

## Specification

### 1. Objective
The objective of TokenProof is to create a reusable proof infrastructure primitive for governed programmable asset workflows on Canton.

Organizations today face three fundamental challenges:

1. Determining which requirements and controls apply.
2. Gathering and validating the evidence required to satisfy those controls.
3. Demonstrating outcomes in a way that can be independently verified.

These activities are often performed manually using documents, spreadsheets, emails, reports, attestations, APIs, and disconnected systems.

TokenProof automates this process.

The platform transforms requirements, controls, and evidence into machine-verifiable proof.

By automating applicability determination, evidence collection, control evaluation, proof generation, and verification, TokenProof reduces manual effort, lowers audit costs, improves consistency, and eliminates the need for every organization to build proof infrastructure independently.
The objective of TokenProof is to create a reusable proof infrastructure primitive for regulated programmable asset workflows on Canton.

The architecture:

- Determines applicability
- Selects the relevant controls
- Identifies required evidence
- Collects and normalizes evidence
- Evaluates controls
- Generates proof
- Produces independently verifiable proof artifacts

TokenProof is regulation agnostic.

The architecture does not begin with a specific regulatory framework. It begins with requirements.

Applicable requirements may originate from:

* Internal organizational controls
* Governance policies
* Asset registry requirements
* Custodian requirements
* Issuer-defined controls
* Counterparty obligations
* Industry standards
* Regulatory frameworks

The project is not intended to replace identity systems, asset registries, issuer platforms, custodians, legal determinations, auditors, or compliance teams.

Those systems remain the source of truth.

TokenProof provides the proof infrastructure layer that transforms requirements, controls, and evidence from those systems into independently verifiable proof.

Requirements may originate from:

- Internal organizational controls
- Governance policies
- Asset registry requirements
- Custodian requirements
- Issuer-defined controls
- Counterparty obligations
- Industry standards
- Regulatory frameworks

Examples of regulatory frameworks may include GENIUS, CLARITY, MiCA, DORA, SEC, CFTC, NYDFS, or other jurisdiction-specific requirements.

TokenProof determines which requirements apply and then evaluates the relevant controls and evidence accordingly.

The project is not intended to replace identity systems, asset registries, issuer platforms, custodians, legal determinations, auditors, or compliance teams.

Those systems remain the source of truth.

TokenProof provides the proof infrastructure layer that transforms information from those systems into independently verifiable proof.

**What this grant funds:**

The proof-of-concept establishes that the core proof architecture is correct and that the foundational primitives operate successfully on Canton.

The grant funds the transition from a working demonstration to production-grade proof infrastructure for the Canton ecosystem.

Specifically, the grant funds:

1. Production hardening of the proof-generation architecture, including applicability evaluation, control evaluation, proof lifecycle management, and adversarial test coverage
2. Hardening of the evaluation engine, Canton adapter, proof generation engine, and independent proof verification capabilities
3. Productionization of ComplianceGuard and the CIP-0056 reference implementation as reusable proof infrastructure primitives deployable on DevNet
4. Delivery of the @tokenproof/canton-sdk, React dashboard, and CIP-0103 integrations to simplify ecosystem adoption
5. Security review, ecosystem validation, performance benchmarking, and MainNet deployment on the Canton Global Synchronizer

The objective is not to build a standalone compliance application.

The objective is to establish a reusable proof infrastructure primitive that allows Canton participants to automate applicability determination, evidence evaluation, proof generation, and independent verification without building these capabilities independently.

This budget reflects that the core architecture and proof-of-concept are already complete. Funding is focused on production hardening, ecosystem adoption, operational readiness, and validation rather than greenfield development.

### Core primitives introduced by TokenProof

| Primitive | Purpose | Ecosystem Value |
|---|---|---|
| ComplianceProof | On-ledger proof record containing applicable control set, policy version, decision status, proof hash, lifecycle state, timestamp, and authorized visibility | Creates deterministic, auditable, independently verifiable proof evidence |
| ComplianceGuard | DAML interface that token implementations can call inside Transfer, Mint, or settlement choices | Enables proof-gated execution without modifying Canton protocol or CIP-0056 |
| EvaluationRequest | Workflow primitive for requesting, resolving, and anchoring proof evaluations | Supports composable proof-generation workflows across issuers, evaluators, custodians, asset registries, auditors, and regulators |

Together, these primitives allow requirements, controls, and evidence to be transformed into machine-verifiable proof that can be used directly by Canton applications and workflows.

### 2. Implementation Mechanics

#### 2.1 DAML contract layer — PoC to production

The DAML contracts in the proof-of-concept implement the correct architecture. Production hardening addresses test coverage depth, adversarial scenario validation, and documentation quality — not architectural changes.

Core contract design (already implemented in PoC):

daml
template ComplianceProof
  with
    assetId        : Text
    issuer         : Party         -- signatory
    evaluator      : Party         -- signatory
    regulator      : Optional Party -- observer; scoped read-only
    classification : Text          -- e.g. "payment_stablecoin"
    policyVersion  : Text          -- e.g. "GENIUS_v1"
    decisionStatus : DecisionStatus -- Active | Suspended | Revoked
    proofHash      : Text          -- SHA-256 of evaluation snapshot
    timestamp      : Time
  where
    signatory issuer, evaluator
    observer  regulator
    key (assetId, evaluator) : (Text, Party)
    maintainer key._2

The ComplianceProof contract represents a machine-verifiable proof record.

The proof record contains:

- applicable control set
- policy version
- decision status
- proof hash
- lifecycle state
- timestamp
- authorized visibility

The proof record is the canonical on-ledger representation of the outcome generated by the TokenProof architecture.

The `(assetId, evaluator)` key design enables `fetchByKey @ComplianceProof` from any third-party `Transfer` choice without additional context — making TokenProof a drop-in compliance component for any Canton token implementation.

`DecisionStatus` is a sealed sum type. Status transitions are monotonically downgrading: `Active → Suspended → Revoked`. `Revoked` is terminal. `ReEvaluate` creates a new proof version and archives the current contract.

Production hardening of the DAML layer covers:

- Complete Daml Script test suite: all lifecycle transitions, `submitMustFail` on `Revoked` and `Suspended` transfers, duplicate key rejection, signatory enforcement, multi-party scenarios with distinct participant nodes
- GDPR lifecycle: proof archival, participant node pruning, right-to-be-forgotten documented and validated
- `daml.yaml` pinned to `sdk-version: 3.4.x` with `daml-prim`, `daml-stdlib`, `daml-script`
- `dpm build` and `dpm test` passing in CI with public badge on every push to `main`

#### 2.2 Applicability Evaluation and Proof Generation Engine — PoC to production

The Python/FastAPI evaluation engine is responsible for applicability determination, control evaluation, decision generation, and proof generation.

The engine transforms requirements, controls, and evidence into machine-verifiable proof.

Applicable control sets may originate from:

- Internal organizational controls
- Governance policies
- Asset registry requirements
- Custodian requirements
- Issuer-defined controls
- Counterparty obligations
- Industry standards
- Regulatory frameworks

Example control packs currently demonstrated in the proof-of-concept include:

- Internal Controls
- GENIUS-aligned controls
- CLARITY-aligned controls

These examples demonstrate the architecture's flexibility and are not intended to represent the full scope of supported requirements.

Six asset buckets: `payment_stablecoin`, `digital_security`, `digital_commodity`, `digital_tool`, `digital_collectible`, `mixed_or_unclassified`.

Worst-of aggregation: one failing control → `mixed_or_unclassified`. Deterministic — identical inputs always produce identical outputs. Not AI-assisted classification: determinism is a regulatory requirement, not a convenience preference. Independent recomputation of the proof hash (`SHA-256(assetId + classification + policyVersion + controlResults + timestamp)`) by any party — including regulators — is a core design property.

Production hardening adds: CIP-0056 `TokenMetadata` schema validation (replacing Algorand ASA format), representative test vectors for all six asset buckets across all three policy packs, and `POST /verify` endpoint supporting independent proof hash recomputation.

#### 2.3 Canton Ledger API adapter — PoC to production

`canton_adapter.py` in the proof-of-concept already replaces the Algorand adapter entirely and uses the Canton JSON Ledger API (port 7575). No deprecated tooling is present: no `daml-assistant`, no `@daml/ledger`, no `daml ledger` CLI commands.

Production hardening adds: idempotency (duplicate proof creation returns existing `contractId`), retry logic and error handling for transient node failures, finalised JWT party authentication, and gRPC event stream (port 6866) for real-time `SuspendProof`/`RevokeProof`/`ReEvaluate` events consumed by the TypeScript SDK.

Party allocation uses `POST /v2/parties/allocate` — not the deprecated `daml ledger allocate-parties`. Commands use `POST /v2/commands/submit-and-wait`. ACS queries use `POST /v2/state/active-contracts`.

#### 2.4 ComplianceGuard and CIP-0056 reference — adoption-ready standard

The `ComplianceGuard` interface and `TokenBond` reference implementation are working in the proof-of-concept. Productionising them for adoption means:

The atomic enforcement property — already demonstrated in the PoC's `DvPWorkflow.daml`:

Canton transaction (one two-phase commit):
  Step 1: Buyer allocates CC payment
  Step 2: fetchByKey @ComplianceProof → assertMsg (status == Active)
  Step 3: Seller transfers tokenized bond

If Step 2 fails: entire transaction reverts. No partial execution. No race condition.

Production deliverable: `ComplianceGuard` documented and tested at the level required for a third-party Canton token implementation to fork `TokenBond.daml`, replace the asset fields with their own, and have a compliance-gated token with no additional work. The integration guide target is 30 minutes from cold start to running compliance-gated transfer on `dpm sandbox`.

The DvP workflow has been validated in a settlement context through prior work on SettlementGuard (developed during a FINOS/DTCC hackathon), where compliance gating was applied within deterministic settlement workflows on Canton. TokenProof generalises this pattern into a reusable compliance primitive applicable across any Canton-based token or settlement implementation. This production deliverable brings that validated pattern to ecosystem-standard quality.

#### 2.5 TypeScript SDK — new deliverable

`@tokenproof/canton-sdk` is scaffolded in the PoC but not published. Production deliverable:

- npm package using `@c7/ledger` (not deprecated `@daml/ledger`)
- DAML bindings from `dpm codegen-alpha-typescript`
- Methods: `evaluateAsset`, `getProofStatus`, `verifyProof`, `addRegulatorObserver`, `streamProofEvents`
- CIP-0103 dApp SDK integration: proof status visible in any compliant Canton wallet via the Discovery Component

#### 2.6 React dashboard — new deliverable

No dashboard exists in the PoC. Production deliverable: asset submission, proof lifecycle management, regulator observer onboarding (party provisioning, scoped JWT), CIP-0103 wallet integration.

#### 2.7 Regulator observer pattern

The regulator observer is implemented at contract level in the PoC (`regulator : Optional Party` observer on `ComplianceProof`). Production hardening adds the full operational flow: party provisioning via `POST /v2/parties/allocate`, scoped JWT with `canReadAs` only, dashboard onboarding flow, and documented privacy boundaries verifying the observer receives exactly the specified contracts and no others.

#### 2.8 Applicability Evaluation Engine

Before evidence is collected or controls are evaluated, TokenProof determines which requirements apply to the asset, workflow, participant, or institution.

The Applicability Evaluation Engine maps submitted requirements to an applicable control set.

This prevents unnecessary evaluation and allows TokenProof to support internal controls, governance requirements, industry standards, contractual obligations, and regulatory frameworks through a common architecture.

#### 2.9 Evidence Collection and Normalization

TokenProof supports evidence collection through an Evidence Source Registry and Evidence Connector Layer.

Collected evidence is normalized into a Canonical Evidence Package.

This package becomes the input to control evaluation and proof generation.

The architecture is designed to support multiple evidence sources while producing deterministic proof outputs.

### 3. Architectural Alignment

#### Alignment with approved Canton Dev Fund investments

| Approved Canton Investment | TokenProof Relationship |
|---|---|
| Token Standard V2 (#97) | TokenProof provides a reusable proof infrastructure layer on top of CIP-0056. ComplianceGuard is additive and allows token implementations to consume independently verifiable proof without modifying token standards. |
| Logical Synchronizer Upgrades (#76) | ComplianceProof records are sync-domain-native. As synchronizers scale, proof generation, verification, and lifecycle management remain compatible without architectural changes. |
| ISS-Based BFT (#53) | Stronger consensus and finality improve the reliability of proof records, proof verification, and proof lifecycle transitions. |
| Daml Package Analyzer (#130) | TokenProof provides a real-world DAML package containing applicability logic, proof lifecycle management, verification workflows, and machine-verifiable invariants suitable for analysis tooling. |
| Canton Payment Streams (in review) | Streaming workflows can consume proof state as a precondition, allowing proof-gated issuance, settlement, redemption, vesting, payroll, and other programmable workflows. |

TokenProof introduces a reusable proof infrastructure primitive that can be consumed by tokenized asset, settlement, issuance, and governance workflows across the Canton ecosystem.

TokenProof is the first reusable proof infrastructure primitive on top of CIP-0056.

#### CIP Alignment

| CIP | Alignment |
|---|---|
| CIP-0056 — Canton Token Standard | ComplianceGuard complements Holding and TransferInstruction primitives by allowing token implementations to consume independently verifiable proof during workflow execution. |
| CIP-0103 — dApp SDK / Wallet API | Dashboard and SDK expose proof status, proof lifecycle state, verification results, and proof metadata through standard Canton wallet experiences. |
| CIP-0076 — Minting Delegations | Proof state can be used as a precondition before minting delegation execution, demonstrating how issuance workflows can consume independently verifiable proof. |

TokenProof is designed as a reusable proof layer that can be integrated into existing and future Canton standards without modifying the standards themselves.

#### Why Canton — and only Canton

TokenProof relies on three Canton capabilities that are particularly valuable for proof infrastructure and regulated programmable asset workflows:

- Atomic multi-party execution — proof validation and workflow execution can occur inside the same Canton transaction. If required proof conditions are not satisfied, the workflow can fail deterministically with no partial execution.
- Privacy-preserving visibility — each participant sees only the contracts where they are authorized as signatory or observer. Proof records, evidence references, and evaluation outcomes remain visible only to authorized parties, while the Global Synchronizer sees encrypted routing metadata rather than payload content.
- Deterministic workflow coordination — Canton’s DAML authorization and multi-party execution model ensures that proof generation, proof verification, and workflow execution occur within a synchronized and deterministic framework.

These properties make Canton particularly well-suited for proof infrastructure.

TokenProof is not simply generating proof. It is generating proof that can participate directly in regulated workflows while preserving privacy, auditability, and deterministic execution.

As tokenized markets mature, organizations increasingly need a way to transform requirements, controls, and evidence into independently verifiable proof that can be consumed by issuers, custodians, registries, auditors, regulators, counterparties, and applications.

Canton provides the coordination, privacy, and execution guarantees that allow TokenProof to operate as shared proof infrastructure rather than a standalone reporting system.

#### Canton Privacy Model and Proof Visibility

| Party | Sees |
|---|---|
| Issuer | Proof records, applicable controls, workflow state, and assets where they are an authorized participant |
| Evaluator | Proof records they evaluate, proof lifecycle events, and associated evaluation metadata |
| Asset Registry / Custodian | Proof records and evidence references explicitly shared with them through authorized visibility rules |
| Auditor / Regulator | Proof records where they are designated observers, together with the authorized evidence and metadata required for verification |
| Counterparty | Proof state and verification information explicitly disclosed to support the workflow |
| Global Synchronizer | Encrypted routing metadata only — never payload content |
| All other participants | Nothing |

TokenProof leverages Canton’s privacy model to ensure that proof records, evidence references, and verification outcomes are visible only to authorized participants.

This allows organizations to generate independently verifiable proof while preserving confidentiality, minimizing unnecessary disclosure, and maintaining compliance with privacy, contractual, and governance requirements.

### 4. Why This Matters for Canton

Canton enables privacy-preserving, synchronized, multi-party financial workflows.

As tokenized markets mature, participants increasingly need more than transaction execution.

They need a reliable way to determine applicability, evaluate controls, validate evidence, generate proof, and independently verify outcomes across the lifecycle of assets and workflows operating on the network.

Today, every application that requires these capabilities must build its own:

- applicability logic
- control mapping
- evidence collection
- evidence validation
- proof generation
- proof verification
- audit infrastructure

This creates duplicated engineering effort, fragmented implementations, inconsistent verification practices, and significant operational overhead across the ecosystem.

TokenProof provides a reusable Canton-native primitive that standardizes this process.

Applications can inherit:

- applicability determination
- control evaluation
- evidence validation
- proof generation
- proof verification
- auditability

without building these capabilities independently.

This reduces implementation costs, lowers operational overhead, improves consistency, and accelerates adoption by providing a shared proof infrastructure layer for programmable asset workflows.

The value of TokenProof is not limited to compliance.

The same proof architecture can support:

- internal controls
- governance requirements
- contractual obligations
- asset registry requirements
- custodian requirements
- industry standards
- regulatory frameworks

through a common applicability, evidence, and proof-generation model.

TokenProof is not a compliance application.

It is reusable proof infrastructure for Canton.

Instead of every participant independently building evidence collection, control evaluation, proof generation, and verification capabilities, TokenProof provides a common foundation that can be shared across the ecosystem.

### 5. Backward Compatibility

TokenProof introduces entirely new DAML packages and a new Canton participant node deployment. No existing Canton protocol behavior, CIP-0056 implementations, or validator operations are modified.

ComplianceGuard is purely additive. Existing CIP-0056 token implementations continue to function without modification. Implementations that want proof-gated execution, independently verifiable proof records, and reusable proof infrastructure can opt in by implementing the interface.

TokenProof does not require changes to existing Canton standards, token contracts, settlement workflows, or participant operations.

No backward compatibility impact on Canton.

---
### 6. Adoption Signals and Ecosystem Integration

TokenProof is being actively evaluated through discussions with ecosystem participants operating real tokenized asset, issuer, settlement, and institutional workflows.

The objective of these engagements is not to validate the underlying technology, but to determine whether a reusable proof infrastructure primitive solves a meaningful operational problem for the Canton ecosystem.

Current discussions and architecture reviews include tokenization platforms, issuer workflow operators, institutional participants, and Canton ecosystem contributors evaluating how proof generation, proof verification, evidence automation, and governed workflow execution could be standardized rather than independently implemented by each participant.

These engagements help validate both the utility of the category and the practical integration paths for adoption across the Canton ecosystem.

TokenProof is designed for immediate integration into existing and emerging Canton-based workflows. The following demonstrates concrete adoption paths, integration evidence, and developer accessibility.

#### 6.1 Immediate Adoption Targets

CIP-0056 token implementations

Any token issuer implementing CIP-0056 can integrate TokenProof through ComplianceGuard with minimal changes: importing the interface and requiring valid proof before workflow execution.

The TokenBond reference implementation demonstrates this pattern end-to-end with dpm test passing and serves as a fork-ready template for Canton developers.

daml proof <- fetchByKey @ComplianceProof (assetId, evaluatorParty)  assertMsg "Execution blocked: proof not Active"   (proof.decisionStatus == Active) 

Target time to integration: under 30 minutes for a developer familiar with DAML.

Rather than implementing applicability logic, evidence validation, proof generation, and proof verification independently, applications can consume reusable proof infrastructure through a common interface.

---

DvP settlement workflows

TokenProof has already been validated in a settlement context through SettlementGuard (FINOS / DTCC hackathon), where proof-gated execution was applied within deterministic settlement workflows on Canton.

The atomic DvP pattern (DvPWorkflow.daml) — CC payment + proof validation + asset transfer in a single Canton transaction — is live in the repository and CI-verified.

Any DvP workflow on Canton can integrate proof-gated execution without architectural changes.

This allows proof state to participate directly in settlement workflows rather than requiring external orchestration, manual verification, or disconnected audit processes.

---

Issuers, tokenization platforms, custodians, and asset registries

TokenProof is designed to support requirement-driven workflows.

Applicable requirements may originate from:

- Internal organizational controls
- Governance policies
- Asset registry requirements
- Custodian requirements
- Issuer-defined controls
- Counterparty obligations
- Industry standards
- Regulatory frameworks

The architecture determines applicability, evaluates evidence, generates proof, and produces independently verifiable proof artifacts.

This allows issuers, tokenization platforms, custodians, and asset registries to automate evidence validation and proof generation without building bespoke proof infrastructure independently.

Regulatory frameworks such as GENIUS and CLARITY are supported as examples of applicable control sets, but the architecture is not dependent on any specific framework.

#### 6.2 Integration with Existing Canton Ecosystem Components

| Canton Component | TokenProof Integration | Status |
|---|---|---|
| CIP-0056 Token Standard | ComplianceGuard enables proof-gated execution by allowing token workflows to consume independently verifiable proof | Demonstrated in TokenBond.daml — CI-verified |
| DvP / Settlement Workflows | Proof validation can participate directly in settlement execution, enabling proof-gated DvP workflows | Demonstrated in DvPWorkflow.daml — CI-verified |
| Issuance / Minting Workflows | Proof state can be consumed as a precondition before issuance, minting, redemption, or lifecycle transitions | Demonstrated in proof-of-concept examples — CI-verified |
| CIP-0103 dApp SDK | Proof status, proof lifecycle state, and verification outcomes visible through Canton wallet experiences | Milestone 4 deliverable |
| Canton Payment Streams | Streaming workflows can consume proof state as a precondition for execution | Natural composability — minimal integration effort |
| Governance & Control Workflows | Internal controls, governance requirements, and policy-driven workflows can generate and consume proof artifacts | Supported through the applicability and proof-generation architecture |

TokenProof will additionally be validated against the Canton Token Standard reference implementation during Milestone 3 to confirm ecosystem compatibility beyond the proof-of-concept.

The objective is not to create a standalone compliance workflow, but to provide a reusable proof infrastructure primitive that can be integrated into token issuance, settlement, governance, custody, registry, and asset lifecycle workflows across the Canton ecosystem.

#### 6.3 Developer Adoption Path

TokenProof is designed for rapid adoption with minimal friction.

The objective is to allow Canton developers to consume proof infrastructure without implementing applicability determination, evidence validation, proof generation, proof verification, or audit logic themselves.

Steps to integrate TokenProof into a CIP-0056 token implementation:

1. Import the ComplianceGuard interface
2. Add a proof validation check inside the relevant workflow choice (Transfer, Mint, settlement, redemption, or other execution path)
3. Deploy — no modifications to the underlying token standard are required

Example:

daml id="vq7m6y" proof <- fetchByKey @ComplianceProof (assetId, evaluatorParty)  assertMsg "Execution blocked: proof not Active"   (proof.decisionStatus == Active) 

By integrating TokenProof, developers can inherit:

- applicability determination
- control evaluation
- evidence validation
- proof generation
- proof verification
- proof lifecycle management
- auditability

without building these capabilities independently.

Quickstart target: under 30 minutes from cold start to running proof-gated execution on dpm sandbox.

This target will be validated by at least one external Canton community developer during Milestone 3 acceptance.

Full integration documentation:

https://github.com/Compliledger/canton_tokenproof/blob/main/docs/architecture.md

#### 6.4 Open Source and Ecosystem Availability

- Apache 2.0 licensed — all DAML packages, backend services, SDKs, and dashboard components
- No proprietary runtime dependencies
- Designed as shared proof infrastructure rather than vendor-controlled software
- Any Canton participant can fork, adapt, deploy, and extend the platform without CompliLedger involvement
- All proof-generation, proof-verification, and integration patterns are documented and available to the ecosystem
- Reference implementations provided for token issuance, transfer, settlement, and proof-gated workflow integration

The objective is to establish a reusable proof infrastructure primitive that can be adopted across the Canton ecosystem rather than creating a proprietary compliance platform.

By publishing TokenProof as open-source infrastructure, issuers, custodians, tokenization platforms, registries, settlement applications, and ecosystem developers can adopt a common proof-generation and verification model instead of building bespoke implementations independently.

#### 6.5 Adoption Risk and Mitigation

The primary adoption risk is not technical feasibility. The proof-of-concept already demonstrates the core architecture, proof lifecycle, proof verification model, and Canton integration patterns.

The primary adoption risk is ecosystem understanding and category adoption.

Proof infrastructure is an emerging category. Many organizations are familiar with compliance systems, audit systems, attestations, and reporting processes, but less familiar with reusable proof-generation and verification infrastructure.

TokenProof mitigates this risk through:

- Reference implementations (TokenBond.daml, DvPWorkflow.daml, stablecoin-genius-act/) serving as fork-ready templates
- Developer documentation and quickstart guides with a target integration time of under 30 minutes
- TypeScript SDK (@tokenproof/canton-sdk) published to npm (Milestone 4)
- React dashboard for non-DAML integrators (Milestone 4)
- Direct engagement with Canton ecosystem contributors through #gsf-global-synchronizer-appdev, grants-discuss, and ecosystem working groups
- Validation against Canton Token Standard reference implementations
- Architecture collaboration with tokenization, issuer, and institutional workflow participants
- Public examples demonstrating applicability determination, evidence evaluation, proof generation, and proof verification
- External developer validation confirming successful integration into Canton workflows

The objective is to demonstrate that proof infrastructure can become a reusable ecosystem primitive rather than requiring every participant to independently build evidence collection, control evaluation, proof generation, and verification capabilities.

As adoption increases, the value of a shared proof infrastructure layer compounds because proof artifacts, verification patterns, and integration models become reusable across multiple participants and workflows.
---

## Milestones and Deliverables

### Milestone 1: Proof Lifecycle and DAML Primitive Hardening

- Estimated Delivery: Month 1–2 from approval
- Focus: Harden the existing TokenProof DAML primitives and proof lifecycle architecture to production quality through complete test coverage, validated invariants, adversarial testing, and CI validation.

- Deliverables / Value Metrics:
  - ComplianceProof, ComplianceGuard, and EvaluationRequest hardened from proof-of-concept to production quality
  - Complete Daml Script test suite (dpm test passes) covering:
    - proof lifecycle transitions
    - proof creation
    - proof suspension
    - proof revocation
    - proof re-evaluation
    - proof state integrity
    - multi-party visibility scenarios
    - adversarial test cases
    - GDPR lifecycle validation
  - Proof hash integrity validation and proof record consistency checks
  - Duplicate key rejection and signatory enforcement validation
  - submitMustFail coverage for invalid proof states (Revoked, Suspended)
  - dpm build and dpm test passing in CI with public badge on every push to main
  - Canton sandbox demo (dpm sandbox) demonstrating proof lifecycle creation, verification, suspension, revocation, and workflow consumption
  - Architecture documentation updated to reflect the production proof lifecycle model

- Gate Metric:
  - CI badge green
  - dpm build passes
  - dpm test passes
  - Proof lifecycle transitions validated
  - Proof hash integrity verification successful

### Milestone 2: Applicability Evaluation, Evidence Processing, and Proof Generation Engine

- Estimated Delivery: Month 2–3

- Focus: Productionize the TokenProof evaluation engine responsible for applicability determination, evidence processing, control evaluation, decision generation, proof generation, and independent proof verification.

- Deliverables / Value Metrics:
  - Applicability Evaluation Engine hardened to production quality
  - Canton Ledger API adapter (canton_adapter.py) hardened with idempotency, retry logic, structured error handling, and finalized JWT authentication
  - Control set evaluation framework supporting:
    - internal controls
    - governance controls
    - asset registry controls
    - custodian controls
    - issuer-defined controls
    - regulatory control examples
  - Evidence normalization and Canonical Evidence Package generation
  - Deterministic control evaluation and decision generation
  - Canonical Proof Package generation
  - Canonical Proof Hash generation
  - Independent proof verification capability through POST /verify
  - CIP-0056 TokenMetadata schema validation replacing Algorand ASA formats
  - Representative test vectors covering internal controls, governance controls, issuer-defined controls, and regulatory control examples
  - POST /evaluate, GET /proof/{assetId}, and POST /verify endpoints finalized and documented
  - End-to-end integration tests covering:
    - applicability determination
    - evidence evaluation
    - proof generation
    - proof verification
    - proof hash recomputation
  - Integration tests validated against local dpm sandbox

- Gate Metric:
  - Applicability engine successfully determines control applicability
  - Canonical Proof Package generated deterministically
  - Independent proof hash recomputation produces identical proof hash
  - All API endpoints operational and documented
  - End-to-end proof generation and verification demonstrated on Canton sandbox

### Milestone 3: Proof-Gated Workflow Integration and DevNet Deployment

- Estimated Delivery: Month 3–4

- Focus: Productionize the ComplianceGuard interface and CIP-0056 reference implementation, enabling Canton applications to consume independently verifiable proof within issuance, transfer, settlement, and asset lifecycle workflows. Deploy to DevNet.

- Deliverables / Value Metrics:
  - ComplianceGuard interface and TokenBond reference implementation refactored into an adoption-ready standard suitable for direct use by Canton developers
  - Proof-gated workflow execution demonstrated across token issuance, transfer, and settlement workflows
  - Atomic DvP validated on DevNet: CC payment + proof validation + bond transfer executed within a single Canton transaction, with publicly verifiable transaction hash
  - Regulator, auditor, and observer onboarding flow operational on DevNet, including party provisioning, scoped JWT access, and proof visibility controls
  - Integration guide: “How to add TokenProof to a CIP-0056 token in under 30 minutes”
  - GDPR lifecycle documented and validated
  - DevNet deployment with public demonstration environment
  - At least one external Canton developer successfully integrates ComplianceGuard using the quickstart guide and completes proof-gated execution in under 30 minutes on dpm sandbox
  - TokenProof validated against the Canton Token Standard reference implementation
  - Demonstration of independently verifiable proof consumption by at least one workflow beyond the reference implementation

- Gate Metric:
  1. Atomic DvP workflow executed on DevNet with publicly verifiable transaction hash.
  2. External developer integration completed in under 30 minutes.
  3. Token Standard compatibility validated.
  4. Proof successfully consumed by an independent Canton workflow.

### Milestone 4: TypeScript SDK, Dashboard, and Ecosystem Onboarding

- Estimated Delivery: Month 4–5

- Focus: Deliver the @tokenproof/canton-sdk npm package and React dashboard — the primary developer and operator surfaces that make TokenProof a reusable proof infrastructure primitive.

- Deliverables / Value Metrics:
  - @tokenproof/canton-sdk published to npm using @c7/ledger, with full TypeScript types and DAML bindings generated through dpm codegen-alpha-typescript
  - SDK methods:
    - evaluateAsset
    - getProofStatus
    - verifyProof
    - addRegulatorObserver
    - streamProofEvents
  - React dashboard supporting:
    - asset submission
    - applicability evaluation visibility
    - proof lifecycle management
    - proof verification
    - regulator and auditor access control
    - proof status monitoring
  - CIP-0103 dApp SDK and Discovery Component integration
  - OpenAPI specification with interactive explorer
  - Example integration walkthroughs demonstrating:
    - internal control evaluation
    - tokenized asset issuance
    - DvP settlement workflow
    - proof-gated execution patterns
  - @tokenproof/canton-sdk used to integrate TokenProof into at least one complete end-to-end application demonstrating proof generation, proof verification, and workflow consumption
  - TestNet deployment

- Gate Metric:
  1. SDK published and documented.
  2. Dashboard demonstrates proof generation, proof verification, and proof lifecycle management.
  3. SDK integration demonstrated in at least one working end-to-end application.
  4. TestNet deployment operational.

### Milestone 5: Security Hardening, Ecosystem Validation, and MainNet Deployment

- Estimated Delivery: Month 5–6

- Focus: Security review, ecosystem validation, independent proof verification, operational readiness, and MainNet deployment.

- Deliverables / Value Metrics:
  - Comprehensive threat model and adversarial test suite
  - Review by experienced DAML/Canton ecosystem contributors with material findings remediated before MainNet release
  - Performance benchmarks covering:
    - proof generation throughput
    - proof verification latency
    - ACS query latency
    - multi-party scalability
  - DAML package upgrade path documented (schema v1 → v2)
  - MainNet deployment on the Canton Global Synchronizer
  - Production runbooks covering:
    - deployment
    - key rotation
    - proof migration
    - disaster recovery
  - Quickstart validated: under 30 minutes from cold start to running proof-gated execution on dpm sandbox
  - At least one third-party Canton ecosystem participant independently verifies a proof by recomputing the proof hash from the Canonical Proof Package and receiving an identical result
  - At least one third-party ecosystem participant validates proof consumption within a real Canton workflow
  - Public documentation of proof verification, proof reproducibility, and proof lifecycle management

- Gate Metric:
  1. TokenProof participant node live on the Canton Global Synchronizer.
  2. Independent proof hash recomputation successfully reproduces the canonical proof hash and is publicly documented.
  3. At least one Canton developer or ecosystem participant confirms successful MainNet integration.
  4. Independent proof verification demonstrated using published proof artifacts.
---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on the successful delivery of the milestones and the demonstration of production-grade proof infrastructure capabilities.

### DAML Correctness

All invariants must be verified through the Daml Script test suite.

- dpm build and dpm test pass in CI at every milestone
- No signatory violations
- No unauthorized proof modifications
- Proof lifecycle transitions validated
- Adversarial proof validation scenarios pass successfully

### Proof Lifecycle Integrity

The proof lifecycle must operate deterministically.

- Proof creation, suspension, revocation, and re-evaluation function correctly
- Invalid proof states prevent proof-gated workflow execution
- Proof state transitions are auditable and reproducible
- Proof hash integrity remains preserved across lifecycle events

### Proof-Gated Execution

A Canton workflow consuming TokenProof must fail deterministically when required proof conditions are not satisfied.

- A CIP-0056 Transfer, issuance workflow, or settlement workflow fails when proof state is invalid
- Verified through submitMustFail in Daml Script
- Verified through transaction traces on DevNet and TestNet

### Applicability and Control Evaluation

The Applicability Evaluation Engine must correctly determine applicable controls and generate deterministic evaluation outcomes.

- Applicable control sets generated consistently
- Internal controls, governance controls, and example regulatory controls evaluated correctly
- Identical inputs produce identical outputs
- Decision generation remains deterministic

### Independent Proof Verification

Proof artifacts must be independently verifiable.

- Canonical Proof Package generated successfully
- Canonical Proof Hash generated deterministically
- Third parties can recompute proof hashes from published proof packages
- Independent verification produces identical proof hashes

### Drop-In Usability

An external Canton developer with no prior TokenProof context follows docs/quickstart.md and integrates proof-gated execution on dpm sandbox in under 30 minutes.

Validated by at least one external Canton ecosystem participant.

### Privacy Enforcement

Proof records, evidence references, and verification metadata must follow Canton’s privacy model.

- Each participant receives only contracts where they are signatory or observer
- Regulator, auditor, or observer visibility functions correctly
- Global Synchronizer receives no payload content
- Multi-party visibility scenarios validated

### API Completeness

All REST APIs must be operational and documented.

- OpenAPI specification published
- POST /evaluate operational
- GET /proof/{assetId} operational
- POST /verify operational
- Proof verification and proof hash recomputation supported

### Toolchain Currency

No deprecated Canton tooling.

- No daml-assistant
- No @daml/ledger
- No deprecated daml ledger CLI usage
- Entire project remains dpm based and Canton SDK 3.4 compatible

### Open Source Availability

- All DAML packages, backend services, SDKs, and dashboard components released under Apache 2.0
- No proprietary runtime dependencies

### MainNet Deployment

- TokenProof participant node live on the Canton Global Synchronizer
- At least one third-party ecosystem participant independently verifies a proof package on MainNet
- Independent proof hash recomputation successfully reproduces the published proof hash
- At least one Canton workflow successfully consumes proof generated by TokenProof
---

## Funding

Total Funding Request: $180,000 USD

Payments will be denominated in Canton Coin using the prevailing USD/CC rate at the time of each milestone acceptance.

The original estimate reflected a conservative production-hardening scope. Following deeper implementation planning, ecosystem integration analysis, security review requirements, and benchmarking against comparable Canton ecosystem infrastructure projects, the revised budget reflects the full scope required to deliver TokenProof as production-grade, reusable proof infrastructure for the Canton ecosystem.

The core architecture and proof-of-concept are already complete.

Funding is focused on:

- applicability evaluation hardening
- evidence processing and normalization
- proof generation and verification
- adversarial testing
- DevNet, TestNet, and MainNet deployment
- SDK and dashboard delivery
- ecosystem validation
- security review
- operational readiness
- developer adoption and integration support

TokenProof is not being funded as a standalone compliance application.

The funding supports the transition from a working proof-of-concept into reusable proof infrastructure capable of transforming requirements, controls, and evidence into independently verifiable proof for Canton-based workflows.

### Budget at a Glance

| Category | USD | Share | What it covers |
|---|---:|---:|---|
| Team salaries & contractor fees | $117,000 | 65.0% | DAML engineering, applicability evaluation, proof generation, backend hardening, SDK development, dashboard engineering, DevNet/TestNet/MainNet deployment, integration engineering |
| Infrastructure & Canton node operations | $18,000 | 10.0% | Canton participant node, GCP hosting, DevNet/TestNet/MainNet infrastructure, monitoring, CI/CD, storage, networking |
| Security review, QA & adversarial testing | $24,000 | 13.3% | Independent DAML/Canton security review, adversarial testing, proof integrity validation, GDPR lifecycle validation, proof verification testing |
| Ecosystem onboarding & developer adoption | $9,000 | 5.0% | Integration guides, SDK onboarding, ecosystem walkthroughs, developer documentation, adoption support |
| Contingency & milestone continuity buffer | $12,000 | 6.7% | Delivery continuity during milestone review windows, infrastructure reserve, unplanned remediation |
| Total | $180,000 | 100% | |

> Final Canton Coin amounts will be calculated using the prevailing USD/CC rate at each milestone acceptance.

### Payment Breakdown by Milestone

| Milestone | Focus | Amount |
|---|---|---|
| M1 — Proof Lifecycle and DAML Primitive Hardening | Proof lifecycle hardening, adversarial testing, proof integrity validation, CI validation, sandbox demonstration | $35,000 USD in CC upon acceptance |
| M2 — Applicability Evaluation, Evidence Processing, and Proof Generation Engine | Applicability determination, evidence processing, proof generation, proof verification APIs, Canton adapter hardening | $35,000 USD in CC upon acceptance |
| M3 — Proof-Gated Workflow Integration and DevNet Deployment | ComplianceGuard productionization, proof-gated execution, DevNet deployment, external developer validation | $40,000 USD in CC upon acceptance |
| M4 — TypeScript SDK, Dashboard, and Ecosystem Onboarding | SDK publication, proof lifecycle dashboard, TestNet deployment, integration walkthroughs, ecosystem onboarding | $35,000 USD in CC upon acceptance |
| M5 — Security Hardening, Ecosystem Validation, and MainNet Deployment | Security review, proof verification validation, production runbooks, MainNet deployment, ecosystem validation | $35,000 USD in CC upon final acceptance |

### Funding Rationale

TokenProof is not a greenfield proposal.

The core architecture, DAML primitives, applicability evaluation framework, proof generation model, Canton adapter, CI pipeline, and proof-gated workflow patterns are already implemented and functioning on a local Canton ledger.

The requested funding supports the transition from proof-of-concept to production-grade ecosystem infrastructure.

The largest budget category — engineering and contractor support — reflects the complexity of productionizing institutional-grade proof infrastructure, including:

- DAML hardening
- applicability evaluation
- evidence processing and normalization
- proof generation
- proof verification
- adversarial testing
- SDK development
- dashboard engineering
- ecosystem integrations
- MainNet operational readiness
- deployment automation
- documentation
- external validation

Security and QA allocation is materially larger than the original estimate because proof infrastructure requires:

- adversarial testing
- proof integrity validation
- proof lifecycle validation
- privacy-boundary validation
- multi-party workflow testing
- independent proof verification
- DAML/Canton security review

Infrastructure funding supports:

- Canton participant node operations
- DevNet, TestNet, and MainNet deployment
- CI/CD infrastructure
- monitoring
- operational observability
- proof event streaming
- proof verification services

Ecosystem onboarding funding supports:

- integration documentation
- SDK onboarding
- developer walkthroughs
- proof verification examples
- external validation
- ecosystem adoption support

The revised funding request reflects the full productionization scope required to establish TokenProof as reusable Canton-native proof infrastructure rather than a standalone proof-of-concept.

The objective is to provide a shared proof infrastructure primitive that allows Canton participants to automate applicability determination, evidence evaluation, proof generation, and independent verification rather than building these capabilities independently.

### Volatility Stipulation

If approved scope changes, milestone modifications, or Committee-requested delivery requirements materially extend the project timeline beyond six months, the remaining milestone scope, timeline, and payment schedule may be reviewed collaboratively with the Committee.

Any review would consider significant USD/CC exchange-rate volatility, additional delivery requirements, and the operational impact of approved scope changes to ensure the project remains deliverable and aligned with the original objectives.
---

## Co-Marketing

Upon MainNet deployment (Milestone 5), CompliLedger will collaborate with the Canton Foundation on:

- Announcement Coordination — joint ecosystem announcement covering the first production, open-source proof infrastructure primitive for Canton
- Technical Blog Post — deep-dive on the TokenProof architecture, applicability evaluation, proof generation, proof verification, and the Canton privacy model supporting independently verifiable proof
- Case Study — proof-gated DvP settlement workflow demonstrating how requirements, controls, and evidence are transformed into machine-verifiable proof within Canton workflows
- Developer Community Engagement — AMA sessions on Canton Discord and Slack (#gsf-global-synchronizer-appdev), SDK walkthroughs, and proof infrastructure integration workshops for Canton developers
- grants-discuss Post — architectural overview and integration guide published to grants-discuss@lists.sync.global to gather ecosystem feedback and encourage adoption
- Ecosystem Validation Post — public documentation of at least one external Canton developer successfully integrating TokenProof into a workflow, demonstrating proof generation and verification capabilities
- Token Standard Compatibility Report — published findings from Milestone 3 validation against the Canton Token Standard reference implementation
- Proof Verification Demonstration — public demonstration showing independent proof verification and proof hash recomputation from a Canonical Proof Package
- Forum Post — architecture overview, integration patterns, and proof infrastructure use cases published on forum.canton.network

Outcome: A joint ecosystem announcement covering the first production, open-source proof infrastructure primitive on Canton and demonstrating how reusable proof generation and verification can be shared across tokenized asset workflows.
---
## Motivation

The first phase of tokenization focused on digitizing ownership and enabling programmable workflows.

The next phase requires proof infrastructure.

Institutional participants do not only need tokens.

They need evidence.

Evidence that:

- requirements were identified correctly
- controls were applied correctly
- evidence was collected correctly
- governance conditions were satisfied
- obligations were met
- outcomes can be independently verified

Today, these activities are largely manual.

Organizations rely on:

- PDFs
- spreadsheets
- screenshots
- reports
- attestations
- emails
- APIs
- disconnected databases

to gather evidence, evaluate controls, and demonstrate outcomes.

This creates significant operational overhead, duplicated effort, inconsistent verification practices, and fragmented audit trails.

Every organization builds its own processes for:

- determining applicability
- collecting evidence
- evaluating controls
- generating reports
- preparing for audits
- producing proof
- verifying outcomes

As tokenized markets mature, this approach becomes increasingly difficult to scale.

Issuers, custodians, tokenization platforms, asset registries, settlement applications, auditors, and regulators all require confidence in the information supporting digital assets and workflows.

TokenProof standardizes and automates this process.

The platform transforms requirements, controls, and evidence into independently verifiable proof.

By automating applicability determination, evidence collection, control evaluation, proof generation, and proof verification, TokenProof reduces manual effort, lowers operational costs, improves consistency, and strengthens auditability.

Instead of every participant building its own proof infrastructure independently, TokenProof provides a reusable primitive that can be adopted across tokenized asset workflows, institutional processes, governance programs, contractual obligations, industry standards, and regulated digital markets.

Proof enables verification.

Verification enables confidence.

Confidence is earned because proof exists.

## CompliLedger's Credentials

| Credential | Detail |
|---|---|
| Prior Canton Work | SettlementGuard — proof-gated execution and deterministic settlement workflows on Canton, validated through the FINOS / DTCC hackathon |
| Proof Infrastructure Development | Creator of TokenProof, a proof infrastructure architecture that transforms requirements, controls, and evidence into independently verifiable proof |
| Regulatory & Governance Engagement | Active engagement with NIST, Digital Chamber working groups, policymakers, and industry participants on digital asset governance, controls, verification, and proof infrastructure |
| Open-Source Track Record | Builder of open-source governance, control evaluation, and proof-generation tooling, including CompliGuard and related digital asset infrastructure projects |
| Multi-Chain Experience | Experience building governance, control, and proof-oriented infrastructure across multiple blockchain ecosystems including Canton, Hedera, Algorand, Ethereum, XRP Ledger, and XDC |
| Ecosystem Validation | Active discussions with tokenization platforms, issuer workflow operators, institutional participants, and Canton ecosystem contributors evaluating TokenProof and proof infrastructure use cases |
| Canton Foundation Engagement | Direct engagement with Canton Foundation participants and ecosystem contributors supporting proposal refinement, architecture review, and ecosystem alignment |
---

## Rationale

The TokenProof architecture reflects a series of deliberate design decisions. This section explains the reasoning behind those choices.

### Why a DAML interface (ComplianceGuard) rather than a direct contract dependency?

ComplianceGuard decouples proof consumption from proof generation.

Any CIP-0056 token, issuance workflow, settlement workflow, or application can consume proof without depending on TokenProof's internal implementation.

Applications integrate a stable interface rather than a specific backend architecture.

This allows multiple proof providers, evaluation engines, or workflow implementations to remain compatible while preserving a common proof consumption model.

This property is what allows TokenProof to function as shared ecosystem infrastructure rather than a vendor-controlled dependency.

### Why party-scoped DAML contracts rather than a shared on-chain registry?

Proof records frequently contain information derived from controls, evidence, governance requirements, contractual obligations, operational data, or regulatory requirements.

A shared registry visible to all participants would expose information to parties with no legitimate access, violating Canton’s privacy model and potentially creating confidentiality concerns.

Party-scoped DAML contracts allow proof records, evidence references, and verification outcomes to be visible only to authorized participants.

This is not a limitation of the design.

It is one of the primary reasons TokenProof is well suited for regulated and institutional workflows.

### Why deterministic evaluation rather than AI-driven decision making?

TokenProof is designed to generate independently verifiable proof.

Independent verification requires determinism.

Given the same requirements, controls, evidence, and evaluation logic, the system must produce the same outcome and the same proof hash every time.

This allows auditors, regulators, counterparties, and ecosystem participants to independently recompute and verify proof artifacts.

AI-assisted decision making cannot provide this guarantee.

AI may be used to assist humans in interpreting requirements or generating explanations, but proof generation, control evaluation, and proof verification remain deterministic.

### Why applicability evaluation?

Not every requirement applies to every asset, workflow, institution, or participant.

Traditional compliance and governance programs spend significant effort determining which controls actually apply before evaluation begins.

TokenProof incorporates applicability determination as a first-class architectural component.

This allows the platform to support:

- internal controls
- governance requirements
- contractual obligations
- asset registry requirements
- custodian requirements
- industry standards
- regulatory frameworks

through a common proof-generation architecture.

### Why this approach rather than existing compliance or reporting tools?

Most existing approaches focus on documents, attestations, reports, spreadsheets, or workflow-specific implementations.

Organizations independently build processes for:

- applicability determination
- evidence collection
- control evaluation
- proof generation
- verification

This creates duplicated effort, fragmented implementations, and inconsistent verification practices.

TokenProof standardizes these capabilities through a reusable proof infrastructure primitive.

Rather than requiring every issuer, custodian, tokenization platform, registry, settlement application, or institution to build its own proof infrastructure, TokenProof provides a common architecture for transforming requirements, controls, and evidence into independently verifiable proof.

This is the gap TokenProof is designed to address.
---

> > Disclaimer: TokenProof generates deterministic proof artifacts from requirements, controls, and evidence. The platform does not provide legal advice, regulatory opinions, or legal certifications. Proof outputs represent the application of machine-readable controls and evaluation logic to supplied inputs and evidence. Responsibility for legal interpretation remains with the relevant organization, regulator, auditor, or advisor.
