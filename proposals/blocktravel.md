## Development Fund Proposal

**Author:** Block Infrastructure (Richard Beverley, Kurtis Wright, Joshan Mahmud, Suhumar Karur)
**Status:** v1.0 BlockTravel Canton Development Fund Submission (Public Version)
**Created:** 2026-03-19

---

## Abstract

BlockTravel is a transaction compliance framework designed for digital asset, stablecoin, and cross-border payment environments.

At a high level, the system introduces the concept of compliance checks occurring before transaction finalisation, rather than after. This enables financial participants to better align transaction processing with regulatory expectations.

When integrated into distributed ledger environments, BlockTravel acts as an external decisioning service that determines whether a transaction may proceed based on defined compliance criteria.

Note: This public version intentionally omits implementation details, internal logic, and proprietary methodologies.

---

## Specification

### 1. Objective

Digital asset markets continue to expand, but compliance approaches remain inconsistent across participants.

Common industry challenges include:

- Fragmented compliance tooling and standards
- Variability in regulatory interpretation across jurisdictions
- Operational complexity when coordinating multi-party transactions
- Delays introduced by post-event compliance processes

BlockTravel is designed to explore a different model:

- Conditional checks before execution
- Consistent decision outcomes across participants
- Reduced operational ambiguity in transaction handling

This proposal focuses on enabling a standardised interface for compliance decisioning within distributed systems.

### 2. Conceptual Model

At a conceptual level, the system introduces three high-level components:

**2.1 Transaction Gating Interface**

A generic interface that allows applications to:

- Submit a transaction request for evaluation
- Receive a binary or structured decision outcome
- Proceed or halt execution based on that outcome

No assumptions are made about:

- Data structure
- Internal evaluation logic
- Underlying infrastructure

**2.2 External Decisioning Service**

A separate service evaluates transaction requests against:

- Regulatory considerations
- Risk parameters
- Participant-defined policies

The exact mechanisms used to generate decisions are not disclosed.

**2.3 Off-System Data Handling**

Sensitive data is not exposed within shared environments.

Instead:

- References or identifiers may be used
- Data processing occurs outside shared execution layers
- Only minimal outcome data is returned

### 3. DAML and Canton Network Technical Approach

As part of the FATF requirements to exchange Travel Rule data, BlockTravel acts as an abstraction layer that facilitates the exchange of this data and screens transactions. The following describes how DAML and Canton's architectural properties are leveraged at a technical level.

**Smart Contract Compliance Gating on Canton**

When the transacting parties are participants on the Canton Network, compliance can be baked directly into the smart contract workflow. DAML contracts enforce that compliance checks have taken place before any value transfer can proceed. For example, a contract such as `ComplianceRequested` would be created where the BlockTravel party acts as an observer or signatory, responsible for performing all compliance checks off-chain (Travel Rule data exchange, VASP policy rule verification, sanctions screening) and writing back a new contract with the compliance outcome. The transaction workflow cannot advance until this compliance outcome contract exists on-ledger.

**Compliance as a Conditional to Canton Coin Allocation**

The Splice contracts used for Canton coin allocation can be preceded by BlockTravel compliance contracts, with rules enforcing that allocations cannot take place without compliance being completed. This means that at a DAML contract level, the coin allocation choice cannot be exercised until a valid `ComplianceCompleted` contract is present — effectively making regulatory compliance a hard, enforceable condition to settlement rather than an optional or advisory check.

**Oracle Node Architecture**

BlockTravel operates as an Oracle Node within the Canton Network. In this role, the Oracle monitors the ledger for compliance request contracts, triggers the BlockTravel system to initiate Travel Rule data exchange and any required screening (sanctions, AML, blockchain analytics, policy evaluation), and upon completion creates a `ComplianceCompleted` contract to the ledger. The Oracle is a required signatory on the completion contract, ensuring the compliance outcome cannot be fabricated or bypassed. This two-phase model (on-chain request, off-chain processing, on-chain result) keeps all sensitive data off-ledger while providing a cryptographically verifiable compliance decision on-chain.

**Privacy and Multi-Domain Compliance**

Canton's sub-transaction privacy model ensures that compliance contract events are visible only to the direct parties involved — the requesting DApp, the BlockTravel Oracle, and any configured regulator observers — not to the broader Canton participant set. Canton's multi-synchronisation domain model further allows compliance flows to be partitioned by jurisdiction, applying the correct regulatory framework and thresholds for each domain.

### 4. Integration Approach

The system is designed to integrate in a non-intrusive, additive manner:

- Existing applications can optionally invoke compliance checks
- No changes to core transaction logic are required
- The model supports multiple implementation environments

The goal is to provide a plug-in style compliance layer, rather than a replacement for existing infrastructure.

### 5. Design Principles

**Privacy-Aware Design**

Sensitive information should not be broadly distributed or exposed unnecessarily.

**Deterministic Outcomes**

Transactions should have clear, unambiguous outcomes based on pre-defined criteria.

**Interoperability**

The model should support multiple systems, standards, and participant types.

**Extensibility**

The framework should allow for future adaptation without requiring structural redesign.

---

## Open-Source .NET Canton Bindings

As part of this project, Block Infrastructure will develop and open-source a standalone .NET library suite that provides idiomatic C# access to Canton's Ledger API v2 and type-safe C# bindings generated from compiled Daml packages. The project includes a CLI code-generation tool that reads compiled `.dar` files and emits strongly-typed C# classes for Daml templates, choices, records, and variants, as well as an ergonomic client library wrapping Canton's gRPC Ledger API.

While this tooling is used within BlockTravel's Canton Oracle implementation, it is an independent, general-purpose project that will be contributed to the Canton community under an open-source licence. By providing production-grade .NET tooling, this lowers the barrier for organisations whose technology stacks are built on .NET — a significant segment of financial services — to integrate with and build on the Canton Network.

---

## Milestones (High-Level)

### Phase 1 — Foundational Interfaces

- Define generic compliance request/response patterns
- Establish integration examples
- Demonstrate basic transaction gating

### Phase 2 — Expanded Evaluation Capabilities

- Support broader categories of compliance checks
- Demonstrate multi-party interaction scenarios
- Validate performance under controlled conditions

### Phase 3 — Observability & Reporting

- Introduce visibility mechanisms for authorised observers
- Demonstrate auditability of decisions
- Ensure alignment with privacy expectations

### Phase 4 — Production Readiness

- Validate system robustness
- Conduct external testing and review
- Prepare for wider adoption

---

## Compatibility

The framework is designed to be:

- **Backward compatible** with existing systems
- **Optional to adopt**
- **Non-disruptive** to current workflows

No breaking changes are introduced.

---

## Funding

Funding requirements will be determined in collaboration with relevant stakeholders based on scope and deliverables.

---

## Motivation

The evolution of digital financial systems requires greater coordination between transaction execution and compliance processes.

Current approaches often treat compliance as:

- A separate function
- A delayed process
- A reactive control

This proposal explores a model where compliance becomes a pre-condition to execution, improving clarity and operational alignment.

---

## Rationale (High-Level)

**Why compliance checks?**

To ensure transaction compliance, reduce ambiguity in transaction outcomes and align execution with predefined conditions.

**Why a shared interface?**

To reduce duplication of effort across participants and systems.

**Why external decisioning?**

To allow flexibility in how compliance logic is defined and maintained.

---

## Go To Market Strategy

**Phase 1 — Proving the Technology.**

This phase will test: core integrations (including native interaction with the Canton Network), regulatory screening (sanctions, AML/CTF, PEPs), and institution-specific screening.

**Phase 2 — Expansion across the Canton Network.**

With the technology proven, Block Infrastructure will present the working solution to additional Canton Network participants, positioning BlockTravel as a compliance oracle for all digital asset transactions.

**Phase 3 — Adjacent Verticals.**

Once established within digital assets, BlockTravel will expand across adjacent asset classes operating on the Canton Network.

---

## Important Notice

This document is a public, redacted version of the full proposal.

It intentionally excludes:

- Technical architecture
- Data models
- Processing logic
- Decisioning methodologies
- Performance characteristics
- Proprietary innovations

Its purpose is to provide conceptual visibility only, not implementation guidance. For access to the full non-redacted version please contact Block Infrastructure via the email address info@block-infrastructure.com
