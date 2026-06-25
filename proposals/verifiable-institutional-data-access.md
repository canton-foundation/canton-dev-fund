## Development Fund Proposal

**Author:** Zhi Zhang (zhi@edgeandnode.com)  
**Status:** Submitted  
**Created:** 2026-02-22  

---

## Abstract
This proposal seeks to design and implement a verifiable, analytics-ready data export layer for Canton, enabling structured outputs (CSV, flat files, Parquet, streaming datasets, etc.) suitable for institutional analytics, BI systems, compliance workflows, and quantitative research.

Today, Canton’s architecture optimizes for privacy, composability, and enterprise-grade transaction integrity. However, there is no standardized pathway for producing structured, reproducible, and cryptographically verifiable datasets consumable by data warehouses, regulatory systems, or institutional research environments.

This project introduces:
- A canonical data extraction and normalization framework
- Verifiable export pipelines aligned with Canton’s privacy guarantees
- A reproducible data specification for analytics consumers

The result is foundational data infrastructure that accelerates ecosystem maturity, institutional onboarding, regulatory transparency, and application-layer analytics.

---

## Specification

### 1. Objective
Canton’s permissioned architecture enables privacy-preserving smart contract execution across participants. However:
- There is no standardized analytics schema
- Data extraction today is node-specific and ad hoc
- Institutional users lack reproducible export pipelines
- Compliance teams require structured, auditable outputs
- BI and research teams require flat-file or warehouse-ready datasets

Without structured exports, Canton risks:
- Slower enterprise adoption
- Increased integration friction
- Redundant, inconsistent data engineering across participants
- Reduced ecosystem transparency for governance and oversight

Intended outcome:
Deliver a canonical, verifiable structured data export framework that:
- Produces analytics-grade datasets
- Preserves privacy constraints
- Maintains cryptographic verifiability
- Enables integration into Snowflake, BigQuery, Databricks, Tableau, Power BI, etc.
- Supports compliance and audit workflows
- Serves as the base layer for ecosystem data products

### 2. Implementation Mechanics
The implementation consists of five core components:

##### A. Canonical Data Model Layer  
The Canonical Data Model Layer defines a standardized, analytics-ready schema for Canton ledger data, covering transaction metadata, contract state transitions, event logs, participant-scoped views, privacy-preserving redactions, and settlement states. It transforms protocol-native data into deterministic, structured outputs suitable for institutional analytics and compliance workflows. Exports are standardized into versioned parquet, CSV, optional streaming JSON, and snapshot archives, with full documentation and governance to ensure consistency and forward compatibility.

##### B. Verifiable Extraction Engine  
The Verifiable Extraction Engine is a deterministic pipeline that connects to Canton nodes, extracts ledger state transitions, and normalizes them into the canonical data schema. It generates cryptographic commitments (e.g., hash trees or Merkle proofs) alongside each dataset, allowing downstream consumers to independently verify integrity and provenance. This guarantees reproducibility, ensures outputs are provably derived from ledger state, and provides enterprises with audit-grade assurance.

##### C. Privacy-Preserving Filters  
The Privacy-Preserving Filters enforce Canton’s permissioned visibility model at the data extraction layer, ensuring all exports respect participant-level access boundaries. Redaction rules are deterministically applied before dataset generation, and export artifacts are scoped strictly by authorization. Optional anonymized aggregate views can be provided for ecosystem-level analytics, without weakening Canton’s underlying privacy guarantees.

##### D. Analytics Connectors  
The Analytics Connectors provide integration-ready artifacts and reference pipelines for common enterprise data environments, including Snowflake, BigQuery, Redshift, Databricks, Tableau, Power BI and Iceberg-based lakehouses. They also support on-premise enterprise systems and compliance archival infrastructure. Optional open-source reference connectors will be provided to accelerate adoption and standardize integration patterns across the ecosystem.

##### E. Operational Tooling  
The Operational Tooling component delivers production-grade support infrastructure, including deployment scripts, CI-based reproducibility tests, and dataset validation utilities. It provides comprehensive integrator documentation and performance benchmarks to ensure reliability, auditability, and operational readiness across enterprise environments.

### 3. Architectural Alignment
This work aligns with Canton’s architecture in the following ways:
- Preserves privacy at the Canton protocol boundary
- Respects participant-scoped data visibility
- Does not alter consensus or ledger mechanics
- Operates as a deterministic read-layer extension to server analytics and other needs of enterprise consumers

If applicable, this proposal can evolve into:
- A formal Canton Data Export CIP
- A standardized analytics interface specification
- A canonical ecosystem reporting format

Strategic alignment:
- Supports institutional adoption
- Enables regulated entity onboarding
- Facilitates audit-readiness
- Increases ecosystem data portability
- Strengthens governance transparency

### 4. Backward Compatibility
No backward compatibility impact.
This solution operates as a read-layer extension and does not modify:
- Consensus
- Contract semantics
- Node execution logic
- Existing workflows
All components are explicitly additive.

---

## Milestones and Deliverables

### Milestone 1: Architecture & Data Specification
- **Estimated Delivery:** Month 1 - 2
- **Focus:** Define canonical schema and extraction architecture
- **Deliverables / Value Metrics:**
  - Published Data Schema v1.0
  - Privacy model mapping document
  - Extraction architecture specification
  - Security & verifiability design document
  - Stakeholder technical review session
  - Canton foundation approval of schema
  - Architecture sign-off

### Milestone 2: Core Extraction Engine (MVP)
- **Estimated Delivery:** Month 3
- **Focus:** Deterministic export engine with verifiable outputs
- **Deliverables / Value Metrics:**
  - Working extraction engine
  - CSV/Parquet export capability
  - Reproducibility test suite
  - Demo using test network
  - Successful reproducible dataset verification
  - Performance benchmark published

### Milestone 3: Privacy Filters & Enterprise Connectors
- **Estimated Delivery:** Month 4 - 5
- **Focus:** Authorization-aware exports and analytics integrations
- **Deliverables / Value Metrics:**
  - Participant-scoped export capability
  - Warehouse ingestion templates
  - Sample compliance workflow integration
  - Reference deployment documentation
  - End-to-end demo into warehouse
  - Institutional feedback session completed

### Milestone 4: Production Hardening & Documentation
- **Estimated Delivery:** Month 6 - 7
- **Focus:** Operational readiness
- **Deliverables / Value Metrics:**
  - Production deployment guide
  - Performance optimization
  - Full documentation
  - Governance & upgrade strategy
  - Public release
  - Foundation committee sign-off
  - Public release announcement

---

## Acceptance Criteria
The Tech & Ops Committee will evaluate completion based on:
- Deliverables completed as specified for each milestone
- Demonstrated functionality or operational readiness
- Documentation and knowledge transfer provided
- Alignment with stated value metrics

Project-specific conditions:
- Dataset reproducibility validated by independent review
- No protocol-layer modifications required
- Clear upgrade/versioning strategy defined

---

## Funding

**Total Funding Request:** 18M CC

### Payment Breakdown by Milestone
- Milestone 1 Architecture & Data Specification: 3M CC upon committee acceptance
- Milestone 2 Core Extraction Engine (MVP): 3M CC upon committee acceptance
- Milestone 3 Privacy Filters & Enterprise Connectors: 3M CC upon final release and acceptance
- Milestone 4 Production Hardening & Documentation: 9M CC upon final release and acceptance

### Volatility Stipulation
If the project duration is **greater than 6 months**:
The grant is denominated in fixed Canton Coin and will require a re-evaluation at the 6-month mark.

If the project duration is **under 6 months**:
Should the project timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility.

---

## Co-Marketing
Upon release, the implementing entity will collaborate with the Foundation on:
- Announcement coordination
- Case study or technical blog
- Developer or ecosystem promotion

Upon release, the implementing entity will collaborate with the Foundation on:
- Joint technical announcement
- Architecture deep-dive blog post
- Developer-facing documentation launch
- Conference presentation or ecosystem demo
- Case study with early institutional integrator

---

## Motivation
Why is this valuable to the Canton ecosystem?
Describe the ecosystem impact, expected adoption, or strategic importance.

Canton positions itself as institutional-grade infrastructure. Institutional adoption requires:
- Structured reporting
- Audit-readiness
- Data reproducibility
- Warehouse integration
- Regulatory alignment
Without analytics-grade exports, Canton remains operationally isolated.

This proposal:
- Reduces integration friction
- Enables enterprise BI
- Facilitates compliance workflows
- Encourages ecosystem application builders
- Creates the base layer for future data-native products
It transforms Canton from a secure execution network into a data-operational platform.

---

## Rationale
Why is this the right approach to deliver that value?
Explain design decisions, alternatives considered, and why this solution is preferred.
This proposal stikes the optimal balance between 
- Privacy
- Verifiability
- Analytics usability
- Architectural non-intrusiveness

Alternative approaches considered:
- Ad hoc participant-built export pipelines: Leads to fragmentation, inconsistent schemas, duplicated effort
- Direct node query access only: Not scalable for analytics workflows
- Centralized indexer without verifiability: Misaligned with institutional trust requirements
