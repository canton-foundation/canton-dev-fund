## Development Fund Proposal

**Author:** Block Infrastructure (Richard Beverley, Kurtis Wright, Joshan Mahmud, Suhumar Karur)
**Status:** v1.0 BlockID Canton Development Fund Submission (Public Version)
**Created:** 2026-03-20

---

## Abstract

BlockID is a network-based approach to identity verification and data sharing for financial and digital ecosystems.

It introduces a model where verified identity information can be reused across participants, reducing duplication and improving consistency in compliance processes.

The system is designed to:

- Enable more efficient verification workflows
- Support controlled data sharing between participants
- Align with evolving regulatory expectations around interoperability and data usage

Note: This document is intentionally high-level and omits all proprietary implementation details.

---

## Specification

### 1. Objective

Identity verification today is:

- Repetitive across institutions
- Operationally expensive
- Fragmented across jurisdictions
- Limited in cross-participant visibility

BlockID explores a model where:

- Verification outcomes may be reused (subject to permissions)
- Participants can interact through a shared framework
- Data remains controlled and privacy-aware

The goal is to reduce duplication while improving overall consistency of compliance processes.

### 2. Conceptual Model

The system can be understood through four high-level concepts:

**2.1 Reusable Verification Records**

Verification outputs can be represented in a reusable format that allows:

- Discovery by other authorised participants
- Controlled access under predefined conditions
- Reduced need for repeated verification

No assumptions are made about:

- Data structure
- Storage mechanisms
- Underlying infrastructure

**2.2 Controlled Access Framework**

Access to verification outputs is governed by:

- Predefined rules or agreements
- Participant permissions
- Context-specific conditions

The details of how these controls are implemented are not disclosed.

**2.3 Event-Based Updates**

The model supports the concept of:

- Ongoing updates to verification status
- Notification of relevant changes
- Continuous rather than point-in-time processes

**2.4 External Evaluation Layer**

An external evaluation capability may be applied to:

- Interpret verification data
- Identify potential risk indicators
- Support decision-making processes

The methods used are intentionally abstracted.

### 3. DAML and Canton Network Technical Approach

The Canton Network provides the core infrastructure for how KYC tokens are minted, issued, transferred, and burned within the BlockID network. The following describes how DAML and Canton's architectural properties are leveraged at a technical level.

**Privacy Model and Dual-Token Architecture**

The privacy properties of DAML are central to the BlockID design. For every verified identity, the system creates two tokens:

- **Public token** — a hash of the core KYC data, visible to all parties within a synchronisation domain. This enables discoverability and proof-of-verification without exposing underlying personal data.
- **Private token** — visible only to the issuing institution, serving as a cache of the raw KYC data. Canton's sub-transaction privacy model ensures that this token is never visible to other network participants.

This dual-token approach means that any party on the network can verify that a KYC check has been performed (by inspecting the public token hash), while the sensitive underlying data remains strictly controlled by the issuer.

**Secure Data Exchange via DAML Privacy**

When a network participant requests access to KYC data held by another party, DAML's privacy model is used to facilitate a secure, controlled exchange. The requesting party submits a request through a DAML contract, and the Canton coin allocation process is used as the payment mechanism for the data transfer. At no point is the underlying KYC data broadcast to the wider network — only the parties directly involved in the exchange can observe the transaction.

**Token Lifecycle Management**

When KYC data is transferred or updated, the privacy properties of DAML enable a secure burn-and-mint cycle. The existing token (both the public and private components) is burned, and a new token pair is minted reflecting the updated state. This ensures a clean audit trail while maintaining data integrity across the token lifecycle.

**Integration Layer and Ledger API**

DAML templates within BlockID are invoked by an integration layer that sits between native institutional KYC systems and the BlockID system. This integration layer communicates via API with the institution's existing KYC infrastructure, and interfaces with the Canton Ledger API to exercise contracts and choices on-ledger. This means institutions do not need to replace their existing KYC systems — they connect to BlockID through a standard API interface, and the integration layer handles all DAML contract interactions.

**Active Contract Service (ACS) Monitoring**

BlockID monitors the Active Contract Service (ACS) to identify when requests for KYC data have been submitted by other network participants. By inspecting the ACS, the system can detect pending data requests, trigger the appropriate workflows (including compliance checks and payment verification via Canton coin allocation), and respond with the correct contract exercise to fulfil or reject the request.

### 4. Integration Approach

BlockID is designed to integrate in an additive and non-disruptive manner:

- Existing systems remain unchanged
- Participants can adopt incrementally
- Integration occurs through standard interfaces

The model supports multiple environments and participant types.

### 5. Design Principles

**Privacy-Aware by Design**

Sensitive data is not unnecessarily exposed or distributed.

**Interoperability**

Supports interaction across different systems and participant types.

**Flexibility**

Allows adaptation to different regulatory and operational contexts.

**Reusability**

Encourages reuse of verification outputs where appropriate.

---

## Open-Source .NET Canton Bindings

As part of this project, Block Infrastructure will develop and open-source a standalone .NET library suite that provides idiomatic C# access to Canton's Ledger API v2 and type-safe C# bindings generated from compiled Daml packages. The project includes a CLI code-generation tool that reads compiled `.dar` files and emits strongly-typed C# classes for Daml templates, choices, records, and variants, as well as an ergonomic client library wrapping Canton's gRPC Ledger API.

While this tooling is used within BlockID's integration layer, it is an independent, general-purpose project that will be contributed to the Canton community under an open-source licence. By providing production-grade .NET tooling, this lowers the barrier for organisations whose technology stacks are built on .NET — a significant segment of financial services — to integrate with and build on the Canton Network.

---

## Milestones (High-Level)

### Phase 1 — Foundational Capabilities

- Define reusable verification constructs
- Establish integration patterns
- Demonstrate basic participant interaction

### Phase 2 — Expanded Evaluation

- Introduce broader evaluation capabilities
- Support multi-party scenarios
- Validate operational performance

### Phase 3 — Network Expansion

- Enable wider participant access
- Demonstrate cross-sector applicability
- Validate commercial interaction models

### Phase 4 — Production Readiness

- Complete testing and validation
- Prepare for broader deployment
- Align with regulatory expectations

---

## Compatibility

The framework is designed to be:

- Backward compatible with existing systems
- Optional to adopt
- Non-disruptive to current workflows

---

## Funding

Funding requirements will be determined in collaboration with stakeholders.

---

## Motivation

Identity verification remains one of the most resource-intensive processes in financial services.

Current approaches:

- Duplicate effort across institutions
- Create inconsistent outcomes
- Limit visibility across ecosystems

BlockID explores a model where:

- Verification processes are more connected
- Data usage is more efficient
- Outcomes are more consistent

---

## Rationale (High-Level)

**Why shared frameworks?**

To reduce duplication and improve coordination across participants.

**Why reusable verification?**

To increase efficiency while maintaining appropriate controls.

**Why privacy-aware models?**

To align with regulatory expectations and user protection principles.

---

## Go To Market Strategy

**Phase 1 — Proving the model by gaining institutional buy-in.**

In this phase we will seek partners, establishing a reciprocal sharing agreement between 2 or more financial institutions based in the UK, and running a POC Pilot to demonstrate data sharing.

**Phase 2 — Expanding participants on the network.**

In this phase we will start to scale the network and the jurisdictions which it services. We will onboard 2 or more additional jurisdictions that we are currently engaged with. We will support Canton with its own growth and geographical scaling ambitions.

**Phase 3 — Supporting existing Canton participants.**

In this phase we will position BlockID as the identity layer for institutional digital asset markets. Delivering a value-added proposition to the existing Canton participants, through providing a native KYC/KYB token layer for all counterparties — enabling compliant onboarding into tokenised asset markets, reusable identity across protocols and participants, and atomic compliance alongside settlement.

**Phase 4 — Expansion into adjacent segments.**

In this phase Block Infrastructure will expand into adjacent business segments such as insurance, telecoms, healthcare, etc., as well as into adjacent verticals such as Credit.

---

## Important Notice

This is a public, redacted version of the proposal.

It intentionally excludes:

- Technical architecture
- Data models and schemas
- Processing logic and workflows
- AI methodologies
- Commercial mechanics
- Performance characteristics
- Proprietary innovations

This document is intended for conceptual understanding only and does not provide sufficient detail to replicate or infer the underlying system. For access to the full non-redacted version please contact Block Infrastructure via the email address info@block-infrastructure.com
