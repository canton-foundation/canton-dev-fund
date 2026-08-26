## Development Fund Proposal: Open-Source, Node-Agnostic Programmable Revenue Allocation Infrastructure

| **Author:**  | Christopher Lopez, Milo Smith, Ajay Rath, Yasmin Lopez |
| ------------ | ------------------------------------------------------ |
| **Org:**     | MPCH                                                   |
| **Status:**  | Submitted                                              |
| **Created:** | 2026-08-25                                             |
| **Label:**   | financial-workflows-composability                      |

---

## Abstract

This proposal requests funding to open source and productionize the core reward allocation engine already in production within MPCH’s mpch-coin-distribution service. This engine is a reusable, node-agnostic Canton infrastructure component that converts verified off-chain activity from any Canton node or service into on-chain reward attribution, including configurable multi-party distribution for Canton Coin rewards. While the current implementation uses Featured Application activity markers as one way to verify activity, the engine is designed to support many attestation methods. The proposed work addresses a key ecosystem gap: moving coin distribution from manual, opaque off-chain processes to a programmable, auditable, protocol-native engine that anyone can reuse.

The requested funding amount is 300,000 Canton Coin, structured around milestone-based delivery consistent with the Canton grants and Development Fund model. The intended output is an open-source reference implementation and operator-ready package that other Canton infrastructure providers can reuse and extend.

---

## Problem Statement

A meaningful share of infrastructure work on Canton occurs off-chain - inside validator nodes, HSMs, KMS gateways, policy engines, and other authenticated private services, so the ledger does not directly observe the activity that secures and enables the network. The Splice Featured Application mechanism allows trusted applications to attest to real usage on-chain, but there remains a practical gap between internal service telemetry and reusable open infrastructure for reliable marker submission and reward allocation.

This gap creates a critical distribution problem for infrastructure operators and ecosystem contributors. While value creation is real, continuous, and measurable, current mechanisms for handling complex financial flows – such as customer revenue sharing, marketplace payouts, partner commissions, validator incentives - remain bespoke, difficult to audit, and hard to reuse across parties. Consequently, the network lacks a standard way to solve this ecosystem-wide gap. The Canton Foundation grants program and Development Fund both emphasize open infrastructure, ecosystem tooling, and projects that increase utility and value for the broader network, making this a strong fit for support.

---

### Objective and Scope

The objective is to deliver an open-source, node-agnostic reusable allocation engine that accepts trusted activity telemetry from any Canton node or service, resolves the applicable on-chain attestation contract (such as a FeaturedAppRight where relevant), and routes configurable beneficiary weights into the Canton reward flow. This aligns with the Development Fund’s stated support for open development that strengthens the Canton ecosystem.

The scope of funded work includes:
- Open-sourcing the existing reward distribution service implementation and deployment assets.
- Generalizing beneficiary configuration so reward splits can be defined per deployment and per usage model.
- Producing documentation, operator guides, examples, and security hardening guidance for ecosystem adoption.
- Delivering a tested release suitable for self-hosting by Canton participants and infrastructure operators.

Out of scope are proprietary MPCH backend systems unrelated to reward attribution and distribution, and any customer-specific closed integrations that do not create reusable ecosystem value.

---

### Proposed Solution

The project will release an open-source, node-agnostic service that bridges off-chain infrastructure activity to on-chain attestation by polling verified activity telemetry from any supported Canton node or service, authenticating to the Canton-facing API, resolving the relevant on-chain attestation contract state, and submitting the corresponding on-chain commands on a regular scheduler. In its current form, the implementation already operates as a daemon and submits attestations every 60 seconds using a deterministic cycle with idempotent command handling and point-in-time ledger consistency checks; the Stronghold KMS Gateway is one example deployment among the node types the service supports.

The key ecosystem improvement is to make the beneficiary model reusable and operator configurable so Canton Coin distribution can be shared programmatically across multiple Canton parties without a payment intermediary or manual settlement process. That allows the same pattern to support validator operator revenue sharing, client incentive programs, and partner commission models using the beneficiary list already supported in the attestation payload.

---

### Technical Approach

The open-source release will package the current architecture into a generic, node-agnostic reference implementation of the allocation engine, composed of a scheduler loop, an authentication client, a ledger interaction client, and a beneficiary resolver. These components operate with a clear separation of concerns across event sensing, policy framework application, point-in-time contract lookup, and on-chain submission. The current design already uses a 60-second scheduler, token caching with early refresh, explicit ledger-end anchoring, and submit-and-wait semantics to improve correctness and resilience. 

Planned engineering work includes: 
- Refactoring the service into a generic, node-agnostic public implementation with pluggable telemetry input adapters for any supported Canton node or service type. 
- Externalizing beneficiary mapping and weighting logic into a documented configuration model. 
- Adding reproducible container deployment, environment variable templates, and example configurations for self-hosted operators. 
- Expanding automated tests for attestation submission flow, failure recovery, duplicate prevention, and beneficiary split validation. 
- Publishing operator documentation covering security posture, secrets handling, observability, and adoption patterns.

---

### Ecosystem Value

This project creates a common-good building block for infrastructure teams that contribute measurable off-chain work to Canton but need a trusted and reusable path into on-chain reward attribution. By open-sourcing the service, the ecosystem gains a reusable allocation primitive and standardized approach to beneficiary handling, allowing other products and operators to adopt a proven implementation rather than rebuilding the logic privately. 

Expected ecosystem benefits include: 
- Elimination of redundant engineering. Removes the need for each Canton application to independently implement beneficiary-splitting logic. 
- Standardized beneficiary handling. Provides a consistent, protocol-native way to manage multi-party splits across the network. 
- Lower integration cost for new Canton nodes, applications, and infrastructure operators of any type by providing a ready-to-use solution. 
- Transparent and auditable reward distribution routing for validators, service providers, and partners. 

---

### Milestones and Deliverables

| Milestone                                        | Description                                                                                                                                             | Deliverables                                                                                                | Acceptance Criteria                                                                                                                                                                  | Funding    |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------- |
| 1. Open-source extraction and packaging          | Convert the current implementation into a clean public repository suitable for external use.                                                            | Public repo, license, build instructions, Docker assets, environment templates, baseline architecture docs. | Repository is public, reproducible, documented, and deployable by an external reviewer using provided instructions.                                                                  | 90,000 CC  |
| 2. Reusable Revenue Allocation Engine            | Generalize beneficiary weighting and adapter inputs so the service works across any Canton node or service type, not just the current deployment model. | Configurable beneficiary engine, adapter interface, example integrations, automated tests.                  | An external operator can configure at least one non-MPCH deployment pattern with documented beneficiary splits and successful test execution on two independent Canton applications. | 105,000 CC |
| 3. Security hardening and operator readiness     | Deliver production-ready security guidance and operational resilience improvements.                                                                     | Threat model, secrets guidance, audit logging guidance, failure-mode documentation, observability runbook.  | Security-sensitive configuration is documented, failure recovery is demonstrated, and operational procedures are reviewable by the committee.                                        | 45,000 CC  |
| 4. Ecosystem documentation and reference release | Publish a full, node-agnostic reference implementation and adoption package for the Canton community.                                                   | Versioned release, architecture guide, deployment walkthrough, example use cases, maintainer plan.          | A tagged public release exists with complete documentation and clear instructions for reuse by other Canton builders.                                                                | 60,000 CC  |

Total funding requested: 300,000 Canton Coin.

---

### Acceptance Criteria

The proposal should be considered complete when the following conditions are met: 
- The software is available under an open-source license in a public repository, and submission materials are structured in line with the Development Fund process. 
- An external technical reviewer can deploy the service from the published documentation and successfully submit on-chain reward attestations from at least one non-KMS node type in a Canton-compatible environment using the provided configuration model. 
- Beneficiary-based reward distribution is configurable and documented for multi-party allocation patterns. 
- Security and operations documentation is sufficient for another team to assess, run, and maintain the service responsibly. 
- The resulting artifact is clearly reusable beyond MPCH and benefits the wider ecosystem rather than only a private deployment. 

---

### Risks and Mitigations 

- Narrow applicability if the implementation remains too tightly coupled to MPCH-specific telemetry or to any single node type (such as KMS gateways); mitigation is to define a generic, node-agnostic adapter layer and include at least one portable example on a non-KMS node type beyond the current deployment model. 
- Security sensitivity around authentication, secrets, and infrastructure telemetry; mitigation is to preserve the existing zero-secrets-in-source model and provide explicit hardening guidance. 
- Limited ecosystem adoption without operator guidance; mitigation is to ship deployment documentation, example beneficiary scenarios, and a reference release oriented to external builders. 
- Concern that the proposal is too proprietary; mitigation is to keep the funded scope strictly focused on the reusable open-source infrastructure layer with explicit ecosystem-wide applicability. 

---

### Maintenance and Sustainability 

The repository will be maintained during the funded delivery period with a maintainer guide covering issue handling, release practices, and configuration support boundaries. The architecture is intentionally lightweight, modular, and containerized, which reduces maintenance burden while making extension to other Canton-integrated services practical. 

The long-term value of the project comes from reuse: once the pattern is open and documented, other infrastructure teams can adopt the same attestation and distribution flow instead of creating fragmented private implementations. That supports the program goal of increasing utility and value for the network at large through open development. 

---

### Funding Request 

This proposal requests 300,000 Canton Coin to deliver the four milestones defined above. The request is structured to provide objectively reviewable outputs at each stage and to match the milestone-based expectations of the Canton grants process. 

---

### Attached Technical Basis 

The core service design described in the attached MPCH technical report already includes the scheduler, Auth0-based authentication flow, ledger-end consistency checks, beneficiary payload support, and continuous marker submission pattern, which materially reduces delivery risk because the funded work centers on open-sourcing, generalizing, hardening, and documenting an existing architecture rather than inventing it from scratch. 
