## Development Fund Proposal

**Author:** Maranda Harris — Founder, CompliLedger  
**Status:** Submitted  
**Created:** 2026-09-08  
**Label:**  Pick 1 below
- dapp-integration
- wallet-apps
- attestor-pools-daos-multisig
- defi-liquidity
- party-portability-data-resilience
- token-asset-standards
- tokenomics
- onchain-governance
- daml-tooling
- dar-app-management
- canton-protocol-multi-synchronizer
- canton-apis
- node-deployment-operations
- global-synchronizer-scaling
- financial-workflows-composability
- regulatory-compliance

**Champion:** Need Champion

---

## Abstract

Institutional assurance remains heavily manual, fragmented, periodic, and document-driven, with point-in-time assessments repeatedly assembled for audits, regulators, counterparties, and operational workflows. Meanwhile, financial infrastructure is becoming digital, tokenized, programmable, interconnected, and increasingly automated. Assurance must therefore do more than report a past condition: it must respond when the requirements, evidence, or operational conditions supporting a decision change.

CompliLedger is AI-Powered Proof Infrastructure. It brings requirements, target, context, and operational state into a continuous process that determines applicable controls, orchestrates and validates evidence, evaluates evidence sufficiency, and produces deterministic assessments and decisions. AI assists interpretation and evidence orchestration; machine-readable controls and deterministic evaluation logic produce consequential decisions, without forcing a satisfaction judgment when evidence is insufficient. Portable Decision Packages and Canonical Proof Packages make these outputs consumable and machine-verifiable, supporting independent verification and continuously updated assurance.

CompliLedger changes assurance from a periodic reporting exercise into continuously maintained operational assurance. Material changes trigger refreshed evidence and reassessment, producing updated decisions and assurance states that distinguish current support from stale, insufficient, or no-longer-satisfied conditions. Remediation triggers further evaluation rather than leaving an earlier result in place. This shifts manual work toward AI-native processes, periodic assessments toward continuous evaluation, and point-in-time reports toward real-time or near-real-time assurance within defined operating conditions. Ongoing audit readiness and machine-verifiable proof replace repeated audit preparation and static reporting as the intended operating model. Proof is not the entire product: it is the independently verifiable output of a broader process that maintains reusable assurance as conditions change.

Canton is particularly relevant to institutional multi-party financial workflows where privacy, authorization, selective information sharing, deterministic coordination, and composability matter. The proposed application-layer integration connects the assurance supporting financial value with the workflows through which that value moves, allowing authorized parties to consume and independently verify relevant decisions alongside financial activity. Sensitive underlying evidence remains in appropriate protected systems rather than being broadly published to a ledger. CompliLedger complements Canton and authoritative enterprise systems; it does not replace the protocol, systems of record, auditors, or regulators.

CompliLedger already exists as a functioning platform, with an existing limited-control proof of concept, and ProofSync is built. The complete reusable Canton-native implementation does not yet exist. The Development Fund project therefore funds neither the invention of CompliLedger nor the entire private commercial platform. It funds the Canton-native implementation, integration, productionization, security validation, deployment, ecosystem adoption, and post-launch maintenance needed to make its assurance capabilities consumable across Canton. Existing commercial capabilities remain distinct from the new shared integration layer.

The funded output combines reusable Canton-native assurance/proof architecture and continuous reassessment integration with Portable Decision Packages, Canonical Proof Packages, independent verification, and governed workflow consumption. One primary developer SDK, documented interfaces, schemas, and Canton-specific integration for ProofSync, AuditSync, RegSync, and DevSync provide developer and stakeholder access without rebuilding unrelated portal foundations. Two reusable references—Institutional Continuous Assurance and Tokenized RWA / Settlement—will demonstrate changing assurance and reuse of the same infrastructure across institutional workflows. A bounded agentic financial-governance extension will demonstrate authority, delegation, human approval, and execution lineage within that common infrastructure, not as a separate product or the primary project justification.

Canton receives more than a proof format: it gains reusable infrastructure through which participants can consume CompliLedger's AI-native continuous assurance capabilities. Internal teams, clients, counterparties, auditors, regulators, developers, financial applications, and appropriately governed automated workflows can access authorized decisions, proof, and assurance updates. Rather than every participant independently implementing applicability logic, evidence orchestration, continuous evaluation, decision generation, assurance lifecycle management, audit preparation, proof generation, and verification, shared components and interfaces make those capabilities reusable without exposing the private reasoning implementation. Authorized third parties should be able to integrate the supported components, consume packages, verify supported properties, and follow lifecycle changes without a proprietary portal or bespoke employee assistance. Reuse remains conditional on applicability, freshness, context, authorization, and stakeholder requirements; no proof automatically satisfies every regulation or stakeholder.

**Total Funding Request: $385,000 USD.** Based on bottom-up delivery costing, the working program spans approximately 15 months: approximately nine months through accepted production launch, followed by six complete months of bounded post-launch maintenance and ecosystem adoption support. The funded delivery includes external security review, remediation and retesting, production-readiness testing, staged production deployment, documentation, external developer validation, and onboarding. Production launch remains subject to verified Canton deployment requirements and the approved topology. The six-month support period begins only after accepted production launch and is not consumed by implementation delays.

---

## Specification

### 1. Objective

The objective is to address a structural gap between institutional assurance and the financial workflows it supports. Assurance is commonly assembled through manual, fragmented, periodic, and document-driven processes, with evidence and determinations reconstructed for different stakeholders. Requirements arise from regulation and guidance, internal governance, contracts, industry standards, and security, operational, asset, or counterparty conditions. Organizations must determine what applies to a target and context, which controls are required, what evidence is sufficient, whether conditions are currently satisfied, and whether an earlier determination remains valid after circumstances change. The problem extends beyond audit efficiency: periodic assurance can leave decision-makers without a current basis for consequential actions.

Evidence is distributed across enterprise systems, APIs, infrastructure, financial and identity systems, security platforms, blockchains, and other authoritative sources. As financial workflows become digital, tokenized, programmable, interconnected, and increasingly automated, a point-in-time report cannot necessarily establish that its supporting conditions still hold at a later issuance, transfer, settlement, or governance action. This is a reusable institutional infrastructure need, not a claim that every Canton workflow has the same deficiency. The intended end-state is assurance maintained as operational conditions change and available when authorized consumers need to assess a proposed action.

CompliLedger is AI-Powered Proof Infrastructure. Its intended assurance model begins with requirements, target, context, and operational state; determines applicability and applicable controls; identifies evidence requirements; and automates evidence orchestration, validation, and normalization. Evidence sufficiency precedes deterministic control evaluation, assessment, and a concrete decision. Portable Decision Packages and Canonical Proof Packages make those results and relevant provenance available for authorized consumption and independent verification, with continuous reassessment maintaining their assurance context. Decisions must answer defined questions, such as whether a control is currently satisfied or whether applicable settlement conditions are met, rather than assert unqualified compliance.

AI supports interpretation, orchestration, and contextual work; consequential control evaluation and decisions remain grounded in machine-readable rules and versioned inputs. Identical deterministic inputs, evidence state, control definitions, and rule versions should yield reproducible assessment and decision results. Insufficient, stale, conflicting, or incomplete evidence must not be converted into unsupported satisfaction. Where a determination cannot be supported, the assurance state must communicate that limitation or the need for review. Authorized third parties must be able to independently verify supported properties rather than rely solely on CompliLedger's assertion.

Continuous assurance is a core capability of the shared Canton infrastructure; the reference implementations validate and demonstrate it. Current assurance must respond to material change through refreshed or newly evaluated evidence, reassessment, an updated deterministic decision, and updated assurance and proof state. Remediation, where applicable, leads to new evidence and further reassessment, producing restored or otherwise updated assurance. Historical lineage must preserve the meaning of earlier determinations while distinguishing current assurance from superseded, stale, expired, insufficient, or otherwise changed states. The objective is to replace manual reconstruction and periodic snapshots with AI-native continuous evaluation and maintained audit-ready information. Real-time or near-real-time responsiveness remains subject to defined operating conditions and later approved measurable thresholds. Proof is the independently verifiable output of that maintained process, not the entire objective.

For Canton, the intended outcome is shared assurance that can be consumed within authorized institutional multi-party workflows, not merely a CompliLedger deployment. Participants and their authorized stakeholders should receive relevant current decisions, proof, lifecycle information, and verification access according to their roles and purposes. Internal teams, clients, counterparties, auditors, regulators, and applications need not receive the same information. Sensitive underlying evidence remains in appropriate protected systems, with privacy and authorization governing disclosure and consumption.

CompliLedger already exists as a functioning platform, with a limited-control proof of concept and a built ProofSync portal. The complete reusable Canton-native implementation does not yet exist. The Development Fund objective is to create the shared Canton integration and ecosystem infrastructure that makes the mature assurance model usable within Canton, not to rebuild the private commercial platform or imply an existing Canton production deployment.

Success should reduce duplicated engineering of applicability integration, evidence and assurance interfaces, continuous lifecycle handling, decision portability, proof packaging, verification, and stakeholder consumption. External developers should be able to integrate these shared capabilities through documented interfaces without bespoke employee assistance or a proprietary portal. Reuse remains conditional on applicability, evidence freshness, context, authorization, requirement and control versions, intended purpose, and stakeholder requirements; a decision or proof does not automatically satisfy another obligation or counterparty. The institutional assurance and bounded RWA/settlement references must demonstrate this common infrastructure across different workflow classes rather than separate bespoke implementations.

Agentic financial workflows are a bounded future-facing use case, not the primary objective. The same infrastructure can support governed consequential autonomous actions by evaluating identity and authority, bounded delegation, applicable requirements, context, evidence, and approval requirements before execution, with human authorization where required and verifiable execution lineage afterward.

### 2. Implementation Mechanics

#### 2.1 Implementation Boundary

The implementation separates CompliLedger's intelligence and deterministic reasoning from the reusable Canton integration. The existing platform is responsible for requirements interpretation, applicability and control determination, evidence requirement mapping, authorized evidence orchestration and collection, validation, normalization, sufficiency assessment, deterministic evaluation, assessments, decisions, continuous reassessment, and proof generation capabilities. A limited-control proof of concept exists and ProofSync is built; this does not establish that every mature capability is production-hardened or implemented on Canton. An initial readiness inventory will identify available interfaces, supported outputs, and prerequisites. General commercial-platform prerequisites remain CompliLedger's responsibility; additional work specifically required for the shared Canton layer will undergo explicit scope review.

The funded layer will implement Canton/DAML integration components, assurance and package representations, proof commitments, lifecycle/version state, privacy and authorization patterns, request/result interfaces, governed consumption, independent verification, developer interfaces, portal integration, references, and operational tooling. Exact component boundaries are subject to Canton-native design; a conceptual capability need not become a separate service or contract. The private reasoning implementation is not automatically open-sourced, and Canton is not treated merely as a hash-anchoring service.

#### 2.2 End-to-End Assurance Workflow

A request identifies requirements, target, context, and relevant operational state. Applicability determination selects the applicable control set and evidence requirements. AI-assisted orchestration locates authorized sources and collects evidence; validation and normalization produce a Canonical Evidence Package. Sufficiency assessment determines whether that package supports deterministic control evaluation. Evaluation produces an assessment and a decision addressing the requested question, with explicit limitations where the evidence cannot support a determination.

The decision is packaged for authorized downstream consumption as a Portable Decision Package and represented in a Canonical Proof Package. The Canton layer publishes or associates the appropriate assurance/proof representation, enabling supported independent verification and workflow consumption. Relevant changes return the process to evidence refresh and reassessment, including renewed applicability evaluation when needed. Versioned request/result interfaces will correlate these stages, expose processing errors separately from assurance outcomes, and support idempotent submission, event handling, replay, reconciliation, and recovery without treating an interrupted request as successful assurance.

#### 2.3 Requirements and Applicability

The integration will not hard-code a single regulatory regime or asset class. Requirements may originate from regulation or guidance, internal policy and governance, contracts, industry standards, security and operational requirements, or asset and counterparty conditions. CompliLedger evaluates each requirement against the target, context, relevant jurisdiction, operating model, activity, and current operational state. The output identifies the applicable controls and corresponding evidence requirements, preserving relevant versions and applicability context. This permits reuse across institutional workflow classes without assuming that every requirement applies to every participant or target.

#### 2.4 AI-Assisted Evidence Orchestration

AI may assist with interpreting and decomposing requirements, identifying evidence needs, locating appropriate sources, selecting authorized connectors, structuring information, contextual analysis, and explanation. Evidence may come from authorized enterprise systems and APIs, identity platforms, infrastructure/cloud systems, financial and custody systems, security and governance platforms, blockchain networks, and other authoritative sources. Connector use remains bounded by granted access; AI assistance does not confer authority to access a source or override evaluation rules. Sensitive source evidence remains in appropriate protected systems unless an explicitly authorized workflow requires otherwise, rather than being broadly published to Canton.

#### 2.5 Evidence Validation, Normalization, and Sufficiency

Collected evidence is not immediately treated as proof. Validation checks source provenance and relevant authenticity, freshness, and completeness properties; normalization transforms supported evidence into a stable Canonical Evidence Package while retaining source references and transformation lineage. Sufficiency is then evaluated against the applicable evidence requirements, separately from whether a control is satisfied.

Evidence results must distinguish sufficient, partial, insufficient, stale, conflicting, and manual-review-required conditions. These findings constrain the subsequent determination: absent or inadequate support cannot become a satisfied control merely because collection completed. The package will carry the evidence state, relevant observation times, and versions required for repeatable evaluation, without implying that normalization establishes the truth of every source assertion.

#### 2.6 Deterministic Control Evaluation and Decisions

Applicable machine-readable controls execute against validated evidence under versioned evaluation rules. AI does not independently decide that a regulated or governed condition is satisfied. Reproducibility applies to assessment and decision results for identical deterministic inputs, evidence state, and rule versions; run-specific timestamps and correlation identifiers will be distinguished from deterministic result content.

Assessments will preserve relevant requirement/control identifiers and versions, evidence references, reason codes, status, target/context references, timestamps, and correlation/provenance information. Decisions answer concrete questions: whether a control is satisfied, evidence is sufficient, an action is permitted, additional approval is required, or assurance remains current. Governed execution may use APPROVED, DENIED, or REQUIRE_APPROVAL; other assurance questions may require different structured outcomes. A decision will retain its scope and limitations rather than assert general compliance.

#### 2.7 Portable Decision Package

The Portable Decision Package bridges reasoning and downstream consumption without requiring unrestricted access to the private reasoning system. Its versioned specification will define the supported decision identifier, target, action or purpose, outcome/status, reason codes, applicable requirement/control references and versions, evidence references or commitments, decision timestamp, validity/freshness conditions, relevant authorization context, provenance, successor relationships, and verification metadata. These are design inputs, not a prematurely fixed schema.

Authorized compatible workflows can consume the package without unnecessarily repeating the complete reasoning process. Consumption remains subject to applicability, authorization, context, freshness, purpose, and permitted reuse; possession of a valid package alone does not establish permission to execute an action.

#### 2.8 Canonical Proof Package

The Canonical Proof Package represents the machine-verifiable output of the assurance process. Its specification will define how a decision package or its commitment relates to relevant evidence commitments/references, assessment information, requirement/control versions, provenance, timestamps, and lifecycle information. Canonical encoding and deterministic commitment rules will identify exactly which content is protected; associated verification metadata will specify the supported checks. The design must avoid an ambiguous or self-referential hashing definition.

The precise Canton-native representation will be established during architecture work. A package's recorded lifecycle context will be distinguished from subsequent lifecycle changes. Sensitive evidence need not accompany a package onto Canton, and a matching hash establishes integrity of the committed content, not the truth or continued applicability of the underlying assessment.

#### 2.9 Canton-Native Assurance Representation

The funded design will determine the appropriate division between protected information and Canton-consumable state. Raw sensitive evidence, proprietary control logic, confidential enterprise information, credentials/secrets, and unrestricted reasoning details remain in protected systems. Subject to final Canton-native design, authorized assurance state, decision/package representations or references, proof commitments, versions, validity information, provenance references, and workflow-consumption state may be made available through the Canton integration where appropriate.

Canton/DAML components will implement the selected state and workflow patterns rather than simply publish public hashes. The design will specify which parties may issue, consume, update, or inspect relevant information, and how off-ledger packages remain associated with their authorized Canton records. Disclosure of references and metadata will also be considered in the privacy model. No universal public state access or exact DAML contract structure is assumed. Persistence, history access, and lifecycle/version handling will be validated against the selected supported Canton interfaces before production commitments are finalized.

#### 2.10 Continuous Assurance and Reassessment

Continuous assurance will be implemented as a shared lifecycle capability. Material triggers may include evidence expiry or freshness thresholds, operational/configuration changes, requirement/control changes, identity or authority changes, governance changes, security findings, risk changes, and relevant Canton workflow/state events. Event-driven processing and scheduled checks, where appropriate, will initiate evidence refresh or new collection, reassess applicability when necessary, reevaluate controls, and produce updated decisions and assurance/proof state.

Remediation may trigger new evidence and further reassessment, restoring assurance or recording a different supported outcome. Earlier packages retain their historical meaning rather than being silently rewritten. Successor/version relationships and authorized lifecycle queries or events will distinguish current, superseded, stale, expired, insufficient, revoked/suspended where applicable, and otherwise changed assurance. Failure to obtain a current state must be reported as a limitation, not silently replaced with an older favorable result. Replay/recovery and reconciliation tests will address interrupted updates and duplicate events. Freshness and reassessment latency thresholds will be established for defined operating conditions and measured later; no undefined real-time guarantee is assumed.

#### 2.11 Governed Canton Workflow Consumption

Reusable consumption patterns will support issuance, transfer, settlement, redemption, asset/counterparty eligibility, custody conditions, governance approvals, operational requirements, and human approval where appropriate. Advisory consumption retrieves current assurance to inform a workflow decision. Execution-gated consumption permits a consequential action only when the required current decision and assurance state satisfy the declared policy. Applications are not required to adopt execution gating universally.

Where appropriate, consumption will be bound to the target, intended action/purpose, authorized actor, applicable versions, freshness/validity conditions, and permitted reuse. The implementation will define how those conditions are checked at the point of use and how pending approval, unavailable assurance, or changed conditions affect execution. This addresses stale or misapplied decisions without assuming a particular atomic enforcement mechanism before the Canton design is validated. Reusable components and examples will cover these patterns, not bespoke integrations for every workflow class.

#### 2.12 Governed Agentic Financial Workflows

The same consumption architecture will support a bounded agentic extension. A proposed consequential action is evaluated against identity, authority, permissions, bounded delegation, target, intent, applicable requirements, evidence, limits, and approval conditions. Governed outcomes may be APPROVED, DENIED, or REQUIRE_APPROVAL. Where human authorization is required, execution must wait for appropriately authorized approval; an approval cannot substitute for missing authority or override unrelated policy conditions.

Agent-to-agent delegation will be checked against the delegating authority, delegated scope, receiving-agent permissions, applicable time/transaction limits, and revocation state. Following authorized execution, the integration will capture the attempted action, authority context, decision, approval lineage, execution outcome, action-integrity result, resulting assurance state, and proof. Action-integrity validation compares the supported execution evidence with the approved action; unavailable confirmation must remain distinguishable from verified execution. This is an extension of CompliLedger's shared governance infrastructure, not a standalone autonomous-finance product.

#### 2.13 Three-Level Independent Verification

The verifier will expose three distinct levels and identify which properties were checked, failed, or could not be verified:

- **Level 1 — Package Integrity:** Validate supported canonical structure and encoding, recompute the deterministic commitment/hash, and detect tampering. Successful integrity verification does not prove that all original evidence was true.
- **Level 2 — Provenance and Canton State:** Where authorized and technically supported, verify authorized origin, the relevant Canton record/state, lifecycle state, versions, timestamps, and provenance. This requires a supported access path and does not assume universal public Canton access or reproduce the underlying assessment.
- **Level 3 — Assessment Reproduction Where Supported:** For disclosed deterministic controls and authorized evidence or reference fixtures, rerun the assessment and compare the reproduced result with the recorded assessment/decision represented by the proof. Reproduction is not available where required rules, evidence, or access are missing.

Missing prerequisites must produce an explicit limitation rather than unconditional verification success. Trust assumptions will identify the sources and authorizations on which each check depends. A standalone library, CLI or equivalent, and verification API will support use without ProofSync or another proprietary portal. Valid, tampered, malformed, and unavailable-data fixtures will document and test these behaviors.

#### 2.14 Stakeholder Consumption

All four portals consume the same underlying CompliLedger assurance infrastructure according to role and authorization; the grant funds their Canton-specific integration, not unrelated portal reconstruction:

- **ProofSync:** Client-facing live assurance and proof visibility, including authorized control/evidence status, decisions, proof lifecycle, verification, assurance changes, and history/lineage. It does not perform applicability evaluation, evidence orchestration, deterministic reasoning, or proof generation.
- **AuditSync:** Governed auditor access to authorized assessments, evidence lineage, decisions, proof, verification, assurance history, and audit-ready artifacts.
- **RegSync:** Governed regulator access to relevant assurance, decisions, proof, verification, and lineage/history within privacy and disclosure boundaries.
- **DevSync:** Developer access to APIs, SDK, schemas, documentation, reference implementations, proof consumption, and verification integration.

Shared query/event interfaces and permission mapping will keep stakeholder views associated with the relevant assurance versions and lifecycle updates. Portal or export access will not imply unrestricted evidence access. Missing general commercial portal prerequisites will be identified separately from funded Canton-specific work.

#### 2.15 Developer and Reusability Model

Subject to final licensing and distribution terms, the reusable layer will provide Canton/DAML integration components, package specifications, schemas, lifecycle/provenance structures, authorization patterns, one primary SDK, APIs, the verifier, conformance tests, synthetic fixtures, reference workflows, and developer documentation. The primary SDK technology and supported Canton/API/DAML versions remain subject to technical validation; multiple SDK languages are not included.

Quickstarts, authentication examples, sample integrations, lifecycle/error handling, event interfaces where appropriate, and release/version guidance will support clean-environment integration. An authorized third-party developer should be able to consume supported packages, verify supported properties, and follow lifecycle updates without bespoke CompliLedger employee assistance. Dependencies on credentials, protected evidence, or commercial reasoning services will be documented. Reusable integration artifacts do not imply free access to proprietary services, release of private reasoning code, or unrestricted disclosure of customer data.

#### 2.16 Reference Implementations

**Institutional Continuous Assurance** will demonstrate State A: current/satisfied assurance; a material operational or evidence change leading to refreshed evidence and reassessment; State B: changed, stale, insufficient, or not-satisfied assurance; and remediation with new evidence and reassessment leading to State C: restored or otherwise updated assurance. The reference will use the shared decision, proof, lifecycle, verification, SDK, and portal infrastructure so authorized consumers can observe the change. Project Atlas may inform this internal validation approach but is not an external customer or Canton adopter.

**Tokenized RWA / Settlement** will use the same infrastructure in a bounded privacy-preserving multi-party workflow, testing freshness, authorization, governed consumption, and multi-party verification. Assets, parties, requirements, and evidence will be synthetic unless an external integration is separately approved. The reference does not assert legal or regulatory compliance. The bounded agentic scenario adds approved, denied, and approval-required actions, authorized human approval, agent-to-agent delegation, attempted authority/delegation violation, action-integrity checks, and verifiable execution lineage. It is an additional reuse demonstration, not a third full reference implementation. Shared dependency manifests and tests will distinguish common infrastructure from workflow-specific configuration and adapters.

#### 2.17 Security and Operational Approach

Productionization will include threat modeling, external Canton/DAML and security review, privacy/authorization testing, adversarial testing, API security review, remediation, and retesting. Review will cover the reusable Canton layer and relevant integration boundaries, not an unlimited audit of every private CompliLedger capability. It will address protected data, tenant isolation where applicable, least privilege, secrets/key management, proof integrity, stale/replayed decisions, and unauthorized workflow consumption.

Reproducible builds and automated tests will support performance and lifecycle-scale testing, multi-party validation, failure/recovery exercises, and supported upgrade testing. Deployment automation, monitoring, a compatibility matrix, runbooks, and incident/recovery procedures will support operational handover. Final review and retesting must cover the integrated release and material subsequent changes. Security severity policies, performance thresholds, and supported compatibility obligations remain to be approved rather than inferred here. External developer exercises and independent verification will test the documented integration path and feed corrections into the release and onboarding guidance.

#### 2.18 Deployment and Maintenance Approach

Deployment will progress from local development/testing to shared Canton development/test environments where applicable, then production using the verified and approved topology. Architecture work will establish applicable hosting, participant, onboarding, sponsorship, allowlisting, access, and operating requirements from authoritative sources. No final topology, network access, or unconditional production date is assumed. Production release will follow security remediation, readiness validation, deployment checks, and operational handover under that approved architecture.

After accepted production launch, six complete months of bounded maintenance and adoption support will cover corrective fixes, security updates, compatibility updates within the supported policy, SDK/documentation upkeep, issue triage, developer/integration support, reference maintenance, and adoption measurement. The period is not consumed by implementation delays and does not imply a 24/7 SLA, unlimited managed services, bespoke integrations, broad new connectors, new regulatory frameworks, or major architectural expansion. Support capacity, response policy, operating ownership, and adoption targets will be agreed separately; release records, support/issue logs, integration feedback, and adoption reporting will document the work delivered.

### 3. Architectural Alignment

#### 3.1 Application-Layer Role

CompliLedger is proposed as application-layer assurance and proof infrastructure for Canton, not a change to the Canton protocol or a replacement for synchronizers, participant nodes, token standards, identity providers, custodians, systems of record, auditors, or regulators. Canton coordinates multi-party workflows; the shared CompliLedger layer will make applicable assurance conditions available as deterministic decisions, Portable Decision Packages, Canonical Proof Packages, lifecycle state, and supported independent verification. This contributes a reusable application implementation rather than asserting that Canton has a protocol-level assurance deficiency.

#### 3.2 Fit with Institutional Multi-Party Architecture

Canton's multi-party application model combines privacy and authorization with workflow coordination and application composability. These characteristics fit assurance exchanges in which parties collaborate around a financial action but retain distinct information-access rights. CompliLedger's deterministic decisions are intended to inform or govern those coordinated workflows, while selective sharing allows relevant assurance to be consumed without requiring every participant to receive the same underlying information. The specific mapping to supported Canton interfaces and synchronized workflows will be verified during technical design; no particular disclosure or synchronization mechanism is presumed here. Canton is a suitable institutional environment for this architecture, not the only technically possible one.

#### 3.3 Privacy-Preserving Assurance

Proof portability does not require evidence publicity. Enterprise, identity, financial, custody, and security systems, protected CompliLedger storage, and other authoritative sources may retain sensitive evidence while authorized consumers receive the decision, proof, provenance, and lifecycle information appropriate to their purpose. The intended stakeholder views are:

- **Participant/client:** Current operational assurance and proof through ProofSync.
- **Auditor:** Authorized assessments, evidence lineage, decisions, proof, and history through AuditSync.
- **Regulator:** Governed assurance, decision, verification, and permitted lineage access through RegSync.
- **Developer/application:** Authorized SDK/API consumption and verification integration through DevSync and the shared interfaces.

These are differentiated views of the same assurance infrastructure, not separate determinations or an assumption of universal access. Exact Canton disclosure patterns remain subject to verification, including the confidentiality of package references and provenance metadata.

#### 3.4 Lifecycle-Aware Assurance

Programmable financial workflows need to distinguish a historical determination from assurance that remains applicable at the point of use. The proposed shared layer will maintain current assurance through material change, reassessment, updated decisions, and updated assurance/proof state, preserving historical lineage rather than attaching a static attestation indefinitely to an asset or transaction. Potentially changing conditions include asset or counterparty eligibility, governance approval, operational or custody conditions, applicable reserve-related conditions, security controls, authority/delegation, and settlement readiness. Canton applications can therefore be designed to consume current assurance and its limitations, not simply verify that a historical proof exists. This is an application-layer lifecycle capability, not a claim that network coordination establishes the truth of external evidence.

#### 3.5 Composability Across Workflow Classes

The same decision-consumption, lifecycle, freshness, authorization, proof-verification, and human-approval patterns are intended to support multiple application classes without a separate assurance architecture for each. Potential consumers include issuance, transfer, settlement, redemption, tokenized RWA and money, custody, collateral, governance, institutional controls, and governed automated execution. These are architectural reuse opportunities, not commitments to production integrations across every category. The funded demonstrations remain the two approved institutional references and bounded agentic extension. Reuse must preserve applicability, version, purpose, freshness, authorization, and stakeholder requirements; composability does not make a determination universally acceptable.

#### 3.6 Shared Canton Ecosystem Infrastructure

Subject to final licensing and distribution decisions, the ecosystem layer will provide reusable Canton/DAML components, Portable Decision Package and Canonical Proof Package specifications, assurance/lifecycle/provenance schemas, authorization patterns, APIs, one primary SDK, an independent verifier, conformance tests, synthetic fixtures, reference workflows, developer documentation, and deployment/integration guidance. These shared artifacts distinguish the project from a private connection usable only by CompliLedger.

An authorized third-party Canton developer should be able to integrate supported components, consume supported packages, independently verify supported properties, and follow lifecycle updates without bespoke CompliLedger employee assistance or a proprietary portal. This independence applies to the shared integration and supported verification functions; it does not imply that the entire private reasoning platform becomes open source or that commercial services are available without agreed access terms.

#### 3.7 Participant Integration Value

Applications needing assurance may otherwise separately implement applicability consumption, evidence-state interfaces, deterministic decision consumption, lifecycle/freshness handling, proof packaging, verification, stakeholder access, and developer integration. The shared layer is intended to reduce this duplicated integration effort without assuming that every Canton participant currently builds all of these functions. It connects reusable interfaces to CompliLedger's AI-assisted evidence and deterministic reasoning capabilities rather than requiring participants to reconstruct an equivalent platform.

The intended operational shift is from manual and periodic assurance assembly toward AI-native continuous evaluation, from point-in-time reports toward real-time or near-real-time updates within defined and measured operating conditions, and from repeated audit preparation toward maintained audit-ready information. Machine-verifiable proof and reusable decisions support that process; they do not replace continuous operational assurance. No cost-saving percentage, response-time guarantee, or automatic stakeholder acceptance is assumed.

#### 3.8 Institutional Tokenization and External Conditions

The proposed architecture fits institutional tokenization and asset-mobility use cases, including tokenized real-world assets and money, settlement, custody, collateral, asset servicing, and regulated financial applications. For a given workflow, relevant conditions may include organizational authority, approvals, asset eligibility, contractual obligations, governance, operational state, and evidence held in enterprise systems rather than on the ledger. CompliLedger's role is to translate applicable conditions into deterministic, lifecycle-aware, independently verifiable assurance that an authorized Canton application can consume. It does not replace asset records, custody responsibilities, or legal determinations, and it makes no claim about specific customers, market share, or regulatory compliance.

#### 3.9 Bounded Governance for Emerging Agentic Finance

Automated and agentic financial workflows are a future-facing reuse case for the same assurance layer. Autonomous execution does not imply unrestricted authority: identity and authority context, bounded delegation, applicable requirements, action/transaction limits, and human-approval conditions can define a governance boundary before execution. Action-integrity checks, execution lineage, and machine-verifiable governance proof can make the resulting activity inspectable afterward. The funded extension remains bounded and secondary to institutional continuous assurance; it is not a separate product or a claimed Canton Foundation priority. Specific ecosystem experimentation and project relationships are reserved for later verification before any named examples are included.

#### 3.10 Complementing Existing Canton Infrastructure

The proposal is intended to complement existing work across protocol infrastructure, token/asset standards, developer tooling, application infrastructure, and financial workflow composability. Protocol and token infrastructure define how supported assets and workflows operate; CompliLedger adds application-layer assurance about applicable conditions that those workflows may consume. Its package specifications, verifier, and integration interfaces are intended to work with supported ecosystem surfaces rather than establish competing token standards or replace participant infrastructure. Specific compatibility and funded-project relationships will require verification; none is presumed by this architectural positioning.

#### 3.11 CIP Alignment — Pending Verification

**Drafting note — CIP alignment:** Relevant Canton Improvement Proposals governing token interfaces, application integration, wallet/dApp interaction, authorization, or other applicable integration surfaces will be mapped during the dedicated technical verification pass before submission. The mapping will distinguish required dependencies from optional interoperability opportunities and record verified identifiers, status, and applicability to the selected design. No CIP number, implementation dependency, or conformance claim is asserted at this stage.

#### 3.12 Architectural Outcome

The intended result is a reusable assurance layer through which authorized Canton applications can consume continuously maintained deterministic decisions and independently verifiable proof alongside financial workflows. Sensitive evidence need not be broadly disclosed, each application need not build an equivalent assurance architecture, and stakeholders need not rely solely on static reports or proprietary portals for supported verification. Canton provides the workflow environment; CompliLedger makes the assurance supporting those workflows continuously evaluable, portable, and independently verifiable within explicit privacy, applicability, and authorization boundaries.

### 4. Backward Compatibility

The proposed CompliLedger Canton integration is additive and opt-in. It introduces reusable application-layer components, interfaces, schemas, one primary SDK, verification tooling, and optional assurance-consumption patterns; it is not intended to require changes to existing Canton protocol behavior. The proposal does not require replacing synchronizers, participant nodes, token standards, identity providers, custodians, or systems of record. This position does not imply that adoption has no deployment or integration dependencies.

Applications may choose to consume current assurance, deterministic decisions, Portable Decision Packages, Canonical Proof Packages, verification results, and lifecycle updates, or adopt governed or execution-gated workflows. Adopters may need supported SDK/API integration, authorization configuration, decision/proof consumption, lifecycle and freshness handling, verification, and upgrade handling. Execution gating may deliberately change an adopting application's behavior under its declared policy; it is not imposed on applications that do not adopt it. Canton-specific ProofSync, AuditSync, RegSync, and DevSync integration will likewise be designed as additions to the existing portals, not replacements for unrelated portal foundations.

The funded layer will use explicit versioning for schemas, decision and proof packages, APIs, the SDK, DAML packages/components where applicable, and lifecycle/event structures. Documented compatibility rules will allow consumers to identify the format and semantics they support rather than silently interpret an unfamiliar version. Previously issued decisions and proof packages must retain their historical meaning. New assessments and lifecycle changes will use explicit successor or superseded relationships, preserving auditability and verification while distinguishing historical results from current assurance.

Productionization will include compatibility and upgrade testing, supported-version documentation, migration guidance where necessary, regression testing of both reference workflows, and validation of lifecycle behavior across supported upgrades. The compatibility policy will describe supported combinations and any required consumer migration rather than promise compatibility with every past or future version. Exact requirements depend on the selected Canton/DAML/API versions, package design, deployment topology, integration surfaces, and supported upgrade policy; these will be established during funded architecture work and validated before production acceptance. No particular Canton upgrade mechanism or unconditional compatibility guarantee is assumed.

No mandatory backward compatibility impact is expected for Canton applications that do not adopt the CompliLedger integration: they should not need to change their workflows solely because the infrastructure exists. Applications that opt in will follow the versioned integration interfaces and upgrade requirements defined and tested by the funded implementation.

---

## Milestones and Deliverables

Development periods overlap; acceptance dependencies remain sequential: **M1 → M2 → M3 → M4 → M5 → M6 → M7**. Work may proceed in parallel and is not required to wait for the preceding milestone payment. Acceptance depends on completed deliverables and reproducible evidence, not elapsed time. Each submission will identify the evaluated revision, artifacts, environment, and mandatory test results. Unresolved technical prerequisites and policies must be recorded and approved before the affected acceptance gate; thresholds and adoption targets must not be selected retrospectively.

### Milestone 1: Canton-Native Foundation

- **Estimated Delivery:** Months 1–2.
- **Focus:** Establish the reusable Canton-native architecture, executable foundation, readiness baseline, and technical dependencies.
- **Deliverables / Value Metrics:**
  - Readiness inventory distinguishing existing CompliLedger capabilities, commercial prerequisites, and Canton-funded work; approved scope boundaries mapped to traceable deliverables, with blocking prerequisites identified and assigned in a technical dependency register.
  - Canton/DAML architecture and initial reusable integration components covering assurance state, deterministic decision representation where appropriate, Portable Decision Package and Canonical Proof Package representations, request/result interfaces, and lifecycle/version models.
  - Privacy/visibility and authorization models, protected/off-ledger evidence boundary, architecture decision records, and initial threat model.
  - CI/build/test foundation, documented clean-environment setup, initial automated tests, and conformance fixtures covering valid inputs, deliberately invalid inputs, and positive/negative authorization cases.
  - Deployment/onboarding investigation recording evidence for verified assumptions and explicitly identifying unresolved dependencies. Final production topology selection is not required at this milestone.
  - **Ecosystem value:** A reusable, executable integration foundation and explicit dependency baseline reduce duplicated Canton assurance architecture work.
  - **Gate metric:** All mandatory foundation/conformance and authorization tests pass; valid fixtures are accepted and deliberately invalid fixtures rejected; a clean supported environment reproduces build/test results; scope traceability and prerequisite ownership are recorded; deployment assumptions are verified or marked unresolved.

### Milestone 2: Continuous Assurance and Deterministic Integration

- **Estimated Delivery:** Months 2–4.
- **Focus:** Integrate existing CompliLedger reasoning with the Canton layer and demonstrate changing assurance as conditions change.
- **Deliverables / Value Metrics:**
  - Requirements/target/context integration exposing applicability, applicable controls, evidence requirements/state and sufficiency, deterministic assessments and decisions, and Canton request/result processing.
  - Lifecycle synchronization covering evidence freshness/expiry, material-change triggers, reassessment, successor/version lineage, stale/superseded handling, and remediation/retest; event-driven and scheduled reassessment where appropriate.
  - Idempotency, replay/recovery, reconciliation, and a runnable continuous-assurance integration harness.
  - Reproducible lifecycle demonstration: **State A** — current evidence supports the applicable control, producing a deterministic decision and current assurance; **material change/expiry** — evidence refresh or insufficiency detection triggers reassessment and **State B**, reflecting changed, stale, insufficient, or not-satisfied assurance; **remediation** — new evidence and reassessment produce **State C**, restored or otherwise updated assurance. Preserve historical/successor lineage and distinguish current from superseded/expired assurance for consumers.
  - Negative cases showing that stale, insufficient, conflicting, or manual-review-required evidence does not become unsupported satisfaction; determinism cases showing identical deterministic inputs and rule versions reproduce deterministic result content, distinguished from run-specific metadata.
  - Duplicate/replayed-event tests showing no contradictory current state, interrupted-processing tests demonstrating recovery to consistent state, and measurements of reassessment latency and synchronization lag under a documented workload. Final performance thresholds remain subject to approval before the applicable performance acceptance test.
  - **Ecosystem value:** Shared assurance changes with operational conditions rather than remaining a static proof or periodic report.
  - **Gate metric:** All mandatory lifecycle, sufficiency, determinism, idempotency, and recovery cases pass, with reproducible State A → State B → State C evidence and documented latency/lag measurements.

### Milestone 3: Portable Decisions, Proof Infrastructure, and Independent Verification

- **Estimated Delivery:** Months 3–5.
- **Focus:** Deliver portable decisions, machine-verifiable proof, and independent verification without dependence on a proprietary portal.
- **Deliverables / Value Metrics:**
  - Portable Decision Package and Canonical Proof Package implementations, canonical encoding, deterministic commitment/hash specification, Canton-native assurance/proof association, and lifecycle/provenance/version references.
  - Independent verifier library, standalone CLI or equivalent, verification API, and verification documentation describing trust assumptions and limitation/error semantics.
  - **Level 1 — Package Integrity:** Validate supported structure, canonical encoding, and commitment/hash; detect tampering and reject malformed packages. Integrity success must not be represented as proof of underlying evidence truth.
  - **Level 2 — Authorized Provenance and Canton State:** Demonstrate the supported authorized Canton-state access path and supported origin, association/state, lifecycle, version, timestamp, and provenance checks.
  - **Level 3 — Assessment Reproduction Where Supported:** Rerun selected disclosed deterministic reference assessments using authorized evidence/reference fixtures, reproduce deterministic results, and compare them with recorded decisions/proof.
  - Valid, tampered, malformed, stale, and unavailable-data fixtures. Unsupported properties or unavailable rules, evidence, state, or authorization produce explicit limitations rather than unconditional success.
  - Clean-environment verifier execution without ProofSync or another proprietary portal.
  - **Ecosystem value:** Authorized ecosystem participants can independently verify supported package properties and disclosed assessments.
  - **Gate metric:** All mandatory verification vectors pass; every result identifies the verification level, applicable versions, properties verified or failed, and unavailable/unsupported properties. All three supported levels and portal-independent execution have reproducible evidence.

### Milestone 4: Developer Platform and Stakeholder Portals

- **Estimated Delivery:** Months 4–6.
- **Focus:** Make the reusable Canton assurance infrastructure consumable by external developers and authorized stakeholders.
- **Deliverables / Value Metrics:**
  - One primary SDK, APIs, schemas, appropriate DAML bindings/components, authentication integration, decision/package consumption, independent verification integration, lifecycle/error handling, and an event/streaming interface where appropriate. SDK language and supported technical baseline will be established through verified technical decisions.
  - Quickstart, runnable sample integration, supported-environment instructions, release/version guidance, and developer documentation.
  - **ProofSync:** Canton-specific current assurance, decision, proof, verification, lifecycle, and history consumption.
  - **AuditSync:** Governed assessment, evidence-lineage, decision, proof, verification, and audit-oriented access.
  - **RegSync:** Authorized assurance, decision, proof, verification, and permitted lineage access.
  - **DevSync:** SDK/API/schema/documentation/reference access.
  - Portal work is limited to Canton-specific integration with the shared assurance infrastructure, not rebuilding portal foundations or attributing reasoning/proof generation to portals. Positive and negative authorization tests cover appropriate stakeholder paths.
  - A non-author evaluator completes documented setup, authentication, supported decision/package consumption, independent verification, and lifecycle-update processing from a clean supported environment without bespoke code changes, undocumented steps, or bespoke live employee assistance. Standard documented credential provisioning is permitted. Required interventions are recorded, corrected in tooling/documentation where applicable, and affected validation rerun.
  - **Ecosystem value:** Developers can integrate the shared infrastructure reproducibly, while stakeholders consume role-appropriate assurance.
  - **Gate metric:** All mandatory SDK/interface/lifecycle/error/authorization tests pass; all four portal integrations have reproducible functional evidence; the non-author clean-environment journey succeeds through documented steps.

### Milestone 5: Reference Workflows and Reusable Governance

- **Estimated Delivery:** Months 5–7.
- **Focus:** Demonstrate reuse of the same shared infrastructure across materially different institutional workflows.
- **Deliverables / Value Metrics:**
  - Reusable governed-consumption patterns for applicable issuance, transfer, settlement, eligibility, approvals, custody/operational conditions, and human authorization. These are reusable patterns, not commitments to production-integrate every workflow class.
  - **Reference Implementation 1 — Institutional Continuous Assurance:** Demonstrate State A → material change → State B → remediation → State C through evidence refresh, sufficiency handling, deterministic reassessment, updated decisions/packages, successor lineage, and authorized stakeholder visibility.
  - **Reference Implementation 2 — Tokenized RWA / Settlement:** Use synthetic assets, parties, requirements, and evidence unless an approved external integration becomes available. Demonstrate a privacy-preserving multi-party workflow, freshness, authorization, governed consumption, and multi-party verification using the same SDK, lifecycle model, Portable Decision Package, Canonical Proof Package, and verifier. This demonstration does not establish legal/regulatory compliance.
  - **Bounded Agentic Financial Governance Scenario:** Demonstrate APPROVED, DENIED, REQUIRE_APPROVAL, appropriately authorized human approval, bounded agent-to-agent delegation, an attempted authority/delegation violation, action-integrity validation, execution lineage, and resulting machine-verifiable proof. Required human approval cannot be bypassed and delegated authority cannot be exceeded in tested cases. This is a bounded scenario, not a third full reference implementation or standalone autonomous-finance product.
  - Dependency/version manifests and a reuse matrix showing both references and the bounded scenario use the accepted shared assurance, package, lifecycle, SDK/interface, verification, and applicable authorization components rather than separate bespoke proof engines, lifecycle implementations, verification systems, or authorization mechanisms.
  - **Ecosystem value:** The same infrastructure supports different workflow classes without duplicating assurance and verification implementations.
  - **Gate metric:** Two full reference implementations and one bounded agentic scenario are delivered; all mandatory lifecycle, privacy, authorization, freshness, governance, and delegation cases pass; manifests and reuse matrix demonstrate shared-component reuse.

### Milestone 6: Security, Production Readiness, Ecosystem Validation, and Production Deployment

- **Estimated Delivery:** Months 6–9; production acceptance remains subject to verified Canton deployment prerequisites.
- **Focus:** Review, harden, externally validate, and deploy the integrated M1–M5 release.
- **Deliverables / Value Metrics:**
  - Independent Canton/DAML/security review of the delivered integrated release, privacy and authorization reviews, API/security review, adversarial testing, remediation, and independent retesting where scoped.
  - Performance, multi-party, lifecycle-scale, failure/recovery, and supported upgrade testing against representative documented workloads and pre-approved performance/recovery/compatibility thresholds.
  - Deployment automation, monitoring, operational runbooks, incident/recovery procedures, compatibility matrix, and exercised recovery/upgrade procedures.
  - External developer validation of the agreed integration journey, independent third-party verification of supported packages and rejection of invalid fixtures, onboarding materials, and initial adoption evidence. Adoption definitions, targets, counting rules, and measurement windows must be approved before the relevant gate; evidence distinguishes internal testing, external evaluation, test integration, and active integration without unsupported adoption counts.
  - Accepted production deployment using the verified and approved Canton architecture, with release/environment identification, deployment and monitoring evidence, authorized end-to-end assurance lifecycle validation, supported verification, and completed operational handover. Deployment prerequisites and topology must be resolved authoritatively before the production gate; a sandbox-only demonstration does not satisfy production acceptance.
  - Critical/high findings under the agreed severity model are remediated and retested before production acceptance; lower residual findings receive documented disposition.
  - **Ecosystem value:** The integrated infrastructure is independently reviewed, hardened, externally validated, and available through an accepted production deployment.
  - **Gate metric:** All mandatory production-readiness tests pass; no unresolved critical/high findings remain under the agreed severity model; pre-approved performance/recovery/compatibility thresholds are met; required external validation exercises are complete; production acceptance and operational handover evidence are recorded.

### Milestone 7: Six-Month Maintenance and Ecosystem Adoption

- **Estimated Delivery:** Six complete months beginning after accepted production launch; nominally Months 10–15 only if launch is accepted in Month 9. A delayed production launch moves the entire maintenance period; implementation delays do not consume it.
- **Focus:** Demonstrate sustained usability, security maintenance, bounded support, ecosystem engagement, and post-grant sustainability.
- **Deliverables / Value Metrics:**
  - Six months of bounded maintenance/support, including corrective releases and security patches where required, supported compatibility updates, SDK/documentation maintenance, reference implementation upkeep, issue triage, and bounded developer/integration support.
  - Supported integration/reference tests remain passing; vulnerabilities and issues are handled under the approved policy; documentation remains aligned with supported interfaces and releases.
  - Adoption measurement, ecosystem feedback, and implementation guidance updates against pre-approved definitions and targets. Evidence distinguishes internal testing, external evaluation, test integration, and active integration; downloads, internal tests, or internally generated proofs alone do not establish external adoption.
  - Six monthly evidence reports plus a final consolidated maintenance/adoption report recording releases, security dispositions, compatibility, support activity, adoption outcomes, unresolved issues, and continuing ownership.
  - Post-funded-period ownership/sustainability handover documenting remaining responsibilities and supported boundaries. Support is bounded and does not imply unlimited integration assistance or 24/7 managed-service support.
  - **Ecosystem value:** The production integration remains usable and maintained while external adoption and continuing ownership are evidenced after launch.
  - **Gate metric:** Six complete post-acceptance months are evidenced by six monthly reports and the final consolidated report; maintained release and supported integration/reference tests pass; support/adoption results are measured against pre-approved definitions and targets; no unresolved release-blocking issue lacks an approved disposition; sustainability handover is complete. Elapsed time alone is insufficient for acceptance.

---

## Acceptance Criteria

The Tech &amp; Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone  
- Demonstrated functionality or operational readiness  
- Documentation and knowledge transfer provided  
- Alignment with stated value metrics  

The following cross-cutting conditions supplement, rather than replace, milestone-specific deliverables and gates. They apply to the funded CompliLedger Canton implementation at the applicable acceptance stage. Unresolved technical baselines, prerequisites, thresholds, and policies must be documented and approved before the affected gate; they must not be treated as satisfied by omission.

### 1. Traceability and Reproducible Validation

- Every funded deliverable must map to its approved requirement/scope, source revision, artifact/version, test or validation procedure, acceptance evidence, and applicable milestone. Each submission must identify the exact release and environment evaluated.
- Documented build/setup procedures must reproduce the build from a clean supported environment. All mandatory automated tests, conformance fixtures, and supported integration/reference tests must pass; deliberately invalid fixtures must produce their expected failures. The supported technical baseline and tooling versions will be established during architecture work.
- Screenshots and demonstrations may supplement, but must not replace, reproducible artifacts, procedures, and test results.

### 2. Continuous Assurance, Evidence Safety, and Determinism

- **Mandatory lifecycle demonstration:** **State A — Current Assurance:** current, sufficient evidence supports the applicable determination. **Material Change:** a relevant operational/evidence condition changes or expires. **State B — Updated Assurance:** evidence is refreshed or insufficiency identified, reassessment occurs, and the deterministic decision and assurance state change appropriately; previous assurance is no longer represented as current. **Remediation:** the condition is corrected, new evidence is collected and validated, and reassessment occurs. **State C — Restored or Otherwise Updated Assurance:** a new deterministic decision, assurance state, and proof/package state are produced as appropriate, preserving historical and successor lineage.
- The implemented model must functionally distinguish current, superseded, stale, expired, insufficient, and changed/not-satisfied assurance, plus suspended/revoked states where used. Equivalent terminology is permitted; loss of the applicable functional distinctions is not.
- Negative tests must show that stale, insufficient, conflicting, or manual-review-required evidence does not automatically produce a satisfied determination. Unavailable sufficient deterministic evidence must yield an explicit limitation, not fabricated certainty.
- Identical deterministic inputs, applicable control definitions, rule versions, and relevant evidence state must reproduce deterministic assessment/decision content. Run-specific timestamps, execution IDs, and correlation IDs may differ but must be distinguished from that content. AI-assisted interpretation or orchestration must not silently replace deterministic consequential control evaluation.
- Duplicate/replayed events and interrupted processing must not leave contradictory current assurance; tested recovery and reconciliation must restore consistent lifecycle state.

### 3. Portable Packages and Independent Verification

- Portable Decision Packages and Canonical Proof Packages must conform to their accepted schemas/versions. Canonical encoding and commitments/hashes must be reproducible; tampering must be detected and malformed packages rejected. Lifecycle/version information and applicable successor/superseded relationships must remain explicit. Historical packages must retain their historical meaning rather than be silently rewritten.
- Acceptance requires reproducible evidence for all three approved verification levels:
  - **Level 1 — Package Integrity:** independently validate supported package structure, canonical encoding, and commitment/hash, and detect tampering. Integrity success must not be represented as proof that all underlying evidence was true.
  - **Level 2 — Authorized Provenance and Canton State:** where authorized and technically supported, validate supported origin, relevant Canton association/state, lifecycle, versions, timestamps, and provenance. Demonstrate the final supported Canton access mechanism.
  - **Level 3 — Assessment Reproduction Where Supported:** rerun disclosed deterministic reference controls against authorized evidence/reference fixtures, reproduce the deterministic assessment result, and compare it with the recorded decision/proof.
- Verification results must identify the level, applicable versions, properties checked, failures, trust assumptions, and limitations. Unavailable rules, evidence, state, authorization, or unsupported properties must produce explicit limitations instead of unconditional success.
- Supported verification must run independently through the delivered standalone verifier/library/CLI/API interfaces, without requiring ProofSync, AuditSync, RegSync, DevSync, or another proprietary portal.

### 4. Privacy, Authorization, and Governed Consumption

- Positive and negative authorization tests must demonstrate that authorized consumers receive only role-permitted information and unauthorized consumers do not receive protected assurance/evidence information through tested interfaces. Consuming assurance/proof must not broadly disclose sensitive underlying evidence. Stakeholder portal access and workflow consumption must follow the approved authorization model; privacy claims must remain bounded by the tested and verified implementation.
- Governed workflow tests must demonstrate consumption of current authorized decisions, accepted-policy handling of stale/expired/superseded decisions, appropriate target/action/purpose binding, and rejection of unauthorized actors. Required human approval must not be bypassable in tested workflows. Execution-gated patterns must not treat unavailable current assurance as automatic approval; execution gating is not required for every Canton workflow.

### 5. Shared References and Bounded Agentic Governance

- Deliver the Institutional Continuous Assurance reference implementation, Tokenized RWA / Settlement reference implementation, and bounded agentic financial-governance scenario. A reuse matrix and dependency/version manifests must demonstrate use of the same accepted shared assurance model, lifecycle, Portable Decision Package, Canonical Proof Package, SDK/interfaces, verifier, and authorization patterns where applicable. Separate bespoke proof engines, lifecycle systems, or verification implementations must not substitute for shared infrastructure.
- The bounded agentic scenario must demonstrate APPROVED, DENIED, REQUIRE_APPROVAL, appropriately authorized human approval, bounded agent-to-agent delegation, attempted authority/delegation violation, action-integrity validation, execution lineage, and machine-verifiable proof. Required human approval must not be bypassable, and a delegated agent must not exceed its tested delegated authority. This gate applies only to the funded bounded scenario, not a general autonomous-finance platform.

### 6. Developer Usability and Stakeholder Consumption

- A non-author evaluator must complete documented setup, authentication, supported decision/package consumption, independent verification, and lifecycle-update processing from a clean supported environment without undocumented steps, bespoke code changes, or bespoke live CompliLedger employee assistance for the supported path. Documented credential provisioning is permitted. Any required intervention must be recorded, corrected in tooling/documentation where applicable, and the affected validation rerun. Acceptance depends on reproducibility and independence, not an arbitrary integration-time target.
- Reproducible functional and authorization evidence must cover Canton-specific capabilities for all four portals:
  - **ProofSync:** client-facing current assurance, decisions, proof, lifecycle, verification, and history.
  - **AuditSync:** governed auditor access to authorized assessments, evidence lineage, decisions, proof, verification, and assurance history.
  - **RegSync:** governed regulator access to authorized assurance, decisions, proof, verification, and permitted lineage/history.
  - **DevSync:** developer access to the supported SDK, APIs, schemas, documentation, reference assets, and verification integration.
- Portals consume the shared CompliLedger assurance infrastructure according to stakeholder role; acceptance must not attribute reasoning or proof generation to the portals.

### 7. Security, Performance, and Operational Readiness

- Provide a documented threat model, independent Canton/DAML/security review, privacy/authorization review, API/security testing, adversarial testing, remediation evidence, and retesting where scoped. Under the final approved severity policy, no unresolved release-blocking critical/high findings may remain at production acceptance; residual findings require documented disposition. The existing Milestone 6 requirement for no unresolved critical/high findings remains applicable and is not relaxed by this section.
- Performance, multi-party, lifecycle-scale, failure/recovery, and supported upgrade tests must pass against approved criteria. Measure reassessment latency, synchronization/update lag, verification performance, representative multi-party workload behavior, failure recovery, and supported upgrade behavior.
- Final numerical performance/recovery/compatibility thresholds must be documented against representative workloads and approved before the applicable acceptance test, not selected retrospectively after results are known.
- Demonstrate deployment automation, monitoring, operational runbooks, incident/recovery procedures, compatibility documentation, and exercised supported recovery/upgrade procedures.

### 8. Production Deployment and Knowledge Transfer

- Final production acceptance requires an accepted deployment using the verified and approved Canton architecture/topology, with release/version and environment identification, deployment and monitoring evidence, authorized end-to-end assurance lifecycle validation, supported verification, and operational handover. A sandbox-only demonstration is insufficient.
- Deployment prerequisites and topology must be authoritatively resolved before the production gate. No MainNet access, sponsor requirement, allowlisting arrangement, participant topology, or hosting model is assumed here.
- Documentation and knowledge-transfer materials must correspond to the accepted release and cover applicable architecture, APIs, SDK, schemas, integration, verification, lifecycle, authorization, deployment, operations, recovery, supported versions, reference implementations, and known limitations.

### 9. External Validation, Adoption, and Six-Month Maintenance

- Provide evidence of the approved external developer validation, independent verification, onboarding, integration exercises, and ecosystem feedback. Adoption definitions, targets, counting rules, measurement windows, and distinctions between internal testing, external evaluation, test integration, and active integration must be approved before the relevant gate. Downloads, internally generated proofs, or internal tests alone must not be presented as external adoption.
- Maintenance acceptance requires six complete months of bounded support beginning after accepted production launch. Implementation delays move the start of this period and must not consume it; elapsed time alone is insufficient.
- Evidence must cover corrective/security releases where required, supported compatibility maintenance, SDK/documentation upkeep, issue triage, bounded developer/integration support, reference implementation upkeep, and adoption measurement. Supported integration/reference tests must remain passing, with issue and vulnerability handling evidenced against the approved policy.
- Submit six monthly evidence reports, a final consolidated maintenance/adoption report, and a post-funded-period ownership/sustainability handover identifying continuing responsibilities and supported boundaries.

### 10. Acceptance Scope Boundary

Acceptance does not require rebuilding the entire private CompliLedger platform, open-sourcing proprietary reasoning implementation, broad new regulatory or connector libraries, multiple SDK languages, rebuilding unrelated portal foundations, customer-specific production applications, a standalone autonomous-finance product, unlimited integration support, or 24/7 managed-service support unless separately approved through formal scope change.

---

## Funding

**Total Funding Request:** $385,000 USD, payable in fixed Canton Coin under the Foundation-approved conversion methodology.

The request is the bottom-up USD cost basis for the approved scope: implementation and Canton/DAML specialist work; integration and continuous assurance; independent verification and developer tooling; four Canton-specific portal integrations; two full reference implementations and a bounded agentic-governance scenario; external security review, remediation/retesting, production readiness and deployment; and ecosystem adoption with six complete months of post-launch maintenance/adoption support.

### Cost Basis

| Category | USD |
| --- | ---: |
| Expected direct delivery cost | $332,400 |
| Embedded delivery risk allowance | $49,860 |
| Rounding / program headroom | $2,740 |
| **Total** | **$385,000** |

The delivery risk allowance is embedded within the milestone budgets. It is not a separate milestone and does not create payment independent of accepted deliverables. It addresses integration, remediation, deployment, and delivery uncertainty; it is not a currency hedge or guaranteed protection against CC/USD movement. Neither the allowance nor program headroom creates a separate automatic payment entitlement or authorizes transfers between milestone allocations.

### Payment Breakdown by Milestone

- **M1 — Canton-Native Foundation:** USD reference allocation **$40,000**; Canton Coin payment: **Fixed CC amount to be established under the approved conversion methodology**, payable upon Committee acceptance.
- **M2 — Continuous Assurance and Deterministic Integration:** USD reference allocation **$63,500**; Canton Coin payment: **Fixed CC amount to be established under the approved conversion methodology**, payable upon Committee acceptance.
- **M3 — Portable Decisions, Proof Infrastructure, and Independent Verification:** USD reference allocation **$28,000**; Canton Coin payment: **Fixed CC amount to be established under the approved conversion methodology**, payable upon Committee acceptance.
- **M4 — Developer Platform and Stakeholder Portals:** USD reference allocation **$58,000**; Canton Coin payment: **Fixed CC amount to be established under the approved conversion methodology**, payable upon Committee acceptance.
- **M5 — Reference Workflows and Reusable Governance:** USD reference allocation **$70,500**; Canton Coin payment: **Fixed CC amount to be established under the approved conversion methodology**, payable upon Committee acceptance.
- **M6 — Security, Production Readiness, Ecosystem Validation, and Production Deployment:** USD reference allocation **$84,000**; Canton Coin payment: **Fixed CC amount to be established under the approved conversion methodology**, payable upon Committee acceptance of the production deployment and corresponding deliverables.
- **M7 — Six-Month Maintenance and Ecosystem Adoption:** USD reference allocation **$41,000**; Canton Coin payment: **Fixed CC amount to be established under the approved conversion methodology**, payable upon final Committee acceptance of the maintenance/adoption deliverables and required evidence.
- **Total:** USD reference allocation **$385,000**; **Fixed total CC award to be established at grant approval**.

Each milestone payment is conditional on Committee acceptance of the corresponding milestone deliverables and required evidence, following the approved acceptance dependencies. The overlapping development schedule does not create payment entitlement. Payment is tied to accepted deliverables—not elapsed time. The USD allocations are cost references and do not guarantee a particular USD value of the CC received.

### Volatility Stipulation

If the project duration is **greater than 6 months**:  
The grant is denominated in fixed Canton Coin and will require a re-evaluation at the 6-month mark.

The approximately 15-month program—approximately nine months through accepted production launch followed by six complete months of maintenance/adoption support—therefore requires a formal six-month funding review. The grant effective date and corresponding review date must be established with the Foundation before final grant execution.

The review will consider, as applicable, milestones accepted and in progress; remaining deliverables; payment status, including accepted-but-unpaid milestones; remaining fixed-CC allocations; material CC/USD movement; actual and forecast infrastructure/network costs; security-review and remediation costs; verified deployment requirements; approved scope changes; the production-launch forecast; and remaining M7 maintenance obligations.

**The six-month re-evaluation is mandatory. Adjustment is not automatic.** Any proposed change to remaining CC amounts, milestone allocations, scope, acceptance conditions, or payment structure requires the applicable Foundation/Committee approval under the governing grant process and must be documented before taking effect. Review alone does not amend the award. This proposal creates no automatic repricing right or USD true-up, does not guarantee USD purchasing power, and does not assign all currency risk automatically to either party.

### Grant-Execution Mechanics

The full grant and all seven milestone allocations will be fixed in CC at grant approval under the Foundation-approved conversion methodology, subject only to subsequently approved amendments. Before final grant execution, the Foundation and CompliLedger must establish the approved CC/USD rate source, measurement/averaging window if applicable, fixing date, precision, rounding methodology, resulting fixed total CC award, and resulting fixed CC allocation for each milestone. These are grant-execution mechanics, not unresolved product-design decisions.

### M7 Funding Treatment

Milestone 7 begins only after accepted production launch under Milestone 6. Its six-month delivery period is separate from the grant’s mandatory six-month funding re-evaluation. If production launch moves, M7’s full six-month maintenance period moves with it; implementation delays do not shorten the maintenance obligation.

The **$41,000 USD reference allocation** remains associated with M7 unless an approved amendment changes it. M7 payment remains subject to acceptance of the maintenance/adoption deliverables and required evidence, including six monthly reports and the final consolidated report under the approved acceptance criteria. Elapsed time alone is insufficient. Monthly reporting does not create automatic monthly payment entitlement.

### Program Delay and Change Control

Material Committee-requested scope changes, deployment-access changes, approved architecture changes, or funding amendments that affect remaining milestones must be documented through the applicable grant change/re-evaluation process and receive the required approvals. Changes to timing do not themselves reprice milestones, transfer allocations, or reduce the full post-launch maintenance period.

---

## Co-Marketing

Upon production release, CompliLedger will collaborate with the Canton Foundation on:

- Announcement coordination.
- A technical blog or case study focused on reusable AI-native continuous assurance and proof infrastructure on Canton.
- Developer/ecosystem promotion of the reusable SDK, verification tooling, reference implementations, and integration guidance.

Public materials will distinguish demonstrated capabilities from planned capabilities. They will not disclose protected customer, enterprise, or evidence information.
