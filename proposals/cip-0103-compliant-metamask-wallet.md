## Development Fund Proposal

**Author:** Adam Platt (<adam@nodefortress.io>)
**Status:** Submitted
**Created:** 2026-03-25

---

## Abstract

Node Fortress proposes to implement CIP-0103 compliance within an operational multi-asset wallet deployed on Canton MainNet. This work will standardize wallet interaction workflows and enable vendor-neutral interoperability between decentralized applications (dApps) and wallets.

The wallet is implemented as a MetaMask Snap, enabling Canton interaction through a widely adopted wallet interface familiar to developers and users across blockchain ecosystems. This approach reduces onboarding friction by allowing Canton-based applications to integrate with wallet workflows that are already widely understood.

The wallet supports signing, transaction execution, and ledger interaction workflows, including movement of Canton Coin and CIP-0056 tokenized assets such as USD and BTCX. External beta testing was conducted to validate successful signing and transaction execution workflows prior to production deployment. The implementation is maintained as an open-source project at:

<https://github.com/nodefortress/cc-snap>

Funding will support implementation of CIP-0103-compliant interfaces, publication of developer-facing documentation, and production infrastructure hardening to ensure operational reliability under sustained usage.

---

## Specification

### 1. Objective

The Canton ecosystem originally required decentralized applications (dApps) to implement wallet-specific connection logic, signing workflows, and transaction handling mechanisms. This resulted in duplicated engineering effort and inconsistent integration behavior across applications.

CIP-0103 defines a standardized dApp API that decouples wallet implementations from application logic, enabling vendor-neutral interoperability between dApps and wallets. Reliable implementations of this standard are required to support consistent integration workflows across the ecosystem.

The objective of this proposal is to implement CIP-0103 compliance within the Node Fortress wallet and deliver a production-grade, open-source implementation capable of supporting standardized wallet interoperability across Canton-based applications.

Node Fortress currently operates a multi-asset wallet architecture supporting signing, transaction execution, and ledger interaction workflows, including movement of Canton Coin and CIP-0056 tokenized assets. External beta validation confirmed successful transaction workflows. This proposal standardizes those workflows according to CIP-0103 interface requirements.

The intended outcomes of this work are:

- Delivery of a production-grade CIP-0103-compliant wallet implementation
- Strengthening standardized wallet integration pathways for Canton dApps
- Reduced development friction through consistent interface behavior
- Improved reliability and operational readiness of wallet infrastructure
- Availability of open-source implementation resources supporting developer adoption

---

### 2. Implementation Mechanics

Implementation will proceed through three coordinated workstreams: CIP-0103 standard implementation, developer enablement, and production infrastructure hardening.

#### Workstream A — CIP-0103 Standard Implementation

This workstream delivers compliance with the CIP-0103 dApp API specification by aligning the existing wallet architecture with standardized provider methods, event handling requirements, and transaction lifecycle workflows.

Key implementation components include:

- Implementation of required CIP-0103 Provider interface methods including:
  - connect and disconnect session workflows
  - account discovery and primary account selection
  - signing workflows for transaction authorization
  - transaction preparation and execution lifecycle handling
  - standardized event emission for transaction state changes
  - standardized error response handling

- Multi-asset transaction compatibility validation involving Canton Coin and CIP-0056 tokenized assets

- Functional validation testing confirming standardized request-response behavior

- Public release of updated implementation code reflecting CIP-0103 compliance work

Validation will be performed against applicable synchronous or asynchronous CIP-0103 workflows based on the deployment model.

---

#### Workstream B — Developer Enablement and Documentation

Developer-facing documentation will be produced to support standardized wallet integration workflows.

Deliverables include:

- Developer integration guide describing standardized wallet interaction workflows
- API usage documentation aligned with CIP-0103 method structures
- Example transaction and signing workflow documentation
- Deployment configuration and operational documentation
- Public documentation publication alongside open-source implementation

The Node Fortress wallet repository will remain publicly available to support transparency and ecosystem reuse.

---

#### Workstream C — Production Infrastructure Hardening

Infrastructure improvements will be implemented to support operational reliability under sustained production workloads.

The current deployment model utilizes hybrid infrastructure combining cloud-based services with bare-metal infrastructure hosted in colocation environments. This model is specifically chosen to achieve cost savings, operational efficiency, and fault tolerance for sustained production workloads. Services are deployed as containerized workloads managed through container orchestration platforms supporting automated deployment, scaling, and failover operations.

Infrastructure work will include:

- Deployment redundancy across hybrid infrastructure environments
- Cross-region failover capability validation
- Monitoring and observability system deployment
- Load testing under simulated production workloads to validate system stability and resource scaling behavior
- Logging and diagnostics pipeline validation
- Reliability validation across infrastructure failure scenarios

---

### 3. Architectural Alignment

This project aligns with Canton ecosystem architectural priorities focused on standardized interoperability and modular wallet integration.

The primary alignment is with **CIP-0103**, which defines a standardized dApp API enabling vendor-neutral interaction between decentralized applications and wallet implementations.

Node Fortress also supports **CIP-0056** tokenized asset workflows in addition to Canton Coin, enabling standardized multi-asset transaction capabilities.

Architectural components include:

- MetaMask Snap interface providing user interaction and signing workflows
- Containerized backend services managing transaction orchestration
- Hybrid infrastructure deployment across cloud and colocation environments
- Orchestrated service deployment supporting redundancy and scalability

This architecture supports standardized integration workflows and production-scale reliability.

---

### 4. Backward Compatibility

*No backward compatibility impact.*

This project introduces standardized interfaces and infrastructure enhancements without modifying existing ledger protocols, applications, or token standards.

---

## Milestones and Deliverables

### Milestone 1: CIP-0103 Compliance Implementation

- **Estimated Delivery:** Month 3
- **Focus:** Implementation of standardized CIP-0103 provider interfaces and transaction lifecycle workflows

**Deliverables / Value Metrics:**

- Implementation of required CIP-0103 Provider interface methods
- Standardized connection and account workflows
- Signing and transaction lifecycle workflows aligned with specification
- Event emission and standardized error handling implementation
- Multi-asset transaction compatibility validation
- Functional validation testing confirming standardized behavior
- Public release of updated implementation code

---

### Milestone 2: Developer Enablement and Reference Documentation

- **Estimated Delivery:** Month 5
- **Focus:** Publication of developer-facing documentation

**Deliverables / Value Metrics:**

- Developer integration guide publication
- API usage documentation aligned with CIP-0103 workflows
- Example signing and transaction workflow documentation
- Deployment configuration documentation
- Public availability of integration resources

---

### Milestone 3: Production Hardening and Operational Readiness

- **Estimated Delivery:** Month 6
- **Focus:** Infrastructure scalability and reliability

**Deliverables / Value Metrics:**

- Cross-region failover capability validation
- Monitoring and observability system deployment
- Load testing under simulated production workloads
- Logging and diagnostics validation
- Infrastructure reliability validation

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone
- Demonstrated functionality of standardized CIP-0103 workflows
- Documentation and integration guidance provided
- Successful execution of load testing and redundancy validation
- Operational readiness demonstrated under simulated workload conditions

Additional acceptance conditions:

- Successful execution of signing and transaction workflows using standardized interfaces
- Validation of multi-asset transaction handling involving Canton Coin and CIP-0056 tokenized assets
- Demonstrated cross-region failover capability

---

## Funding

**Total Funding Request:** 5,000,000 Canton Coin (estimated $750,000 USD equivalent)

Funding supports engineering development, documentation production, infrastructure reliability improvements, and operational readiness validation over a six-month delivery period.

### Payment Breakdown by Milestone

- Milestone 1 (CIP-0103 Compliance Implementation): 500,000 CC upon committee acceptance
- Milestone 2 (Developer Enablement and Documentation): 400,000 CC upon committee acceptance
- Milestone 3 (Production Hardening and Operational Readiness): 400,000 CC upon final release and acceptance

### Volatility Stipulation

If the project duration is **greater than 6 months**:
The grant is denominated in fixed Canton Coin and will require a re-evaluation at the 6-month mark.

If the project duration is **under 6 months**:
Should the project timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility.

---

## Co-Marketing

Upon release, Node Fortress will collaborate with the Foundation on:

- Announcement coordination
- Technical case study publication
- Developer-facing technical documentation
- Ecosystem promotion of standardized wallet interoperability

---

## Motivation

Standardized wallet interfaces are necessary to reduce fragmentation across Canton-based decentralized application ecosystems. Without standardized interaction workflows, developers must repeatedly implement wallet-specific integration logic, increasing engineering complexity and reducing interoperability.

CIP-0103 establishes a standardized dApp API that enables consistent interaction between applications and wallet implementations. Reliable production implementations of this standard are required to enable practical ecosystem adoption.

Node Fortress contributes to this effort by implementing CIP-0103 within an operational multi-asset wallet architecture capable of supporting Canton Coin and CIP-0056 tokenized assets. This work enables standardized wallet interaction workflows and reduces integration complexity for developers building Canton-based applications.

The wallet is implemented as a MetaMask Snap, enabling Canton interaction through a widely adopted wallet interface familiar to both developers and users. Supporting Canton workflows within an established wallet environment reduces onboarding friction and improves accessibility for users interacting with Canton-based applications.

Infrastructure hardening ensures that standardized functionality is delivered within an environment capable of supporting production workloads and cross-region resilience.

---

## Rationale

This proposal follows a production-first implementation strategy that minimizes technical risk by building upon existing operational wallet functionality.

Rather than developing isolated reference components, CIP-0103 compliance will be implemented within a working multi-asset wallet architecture. This approach ensures that standardized workflows are validated in real operational conditions.

The use of the MetaMask Snap architecture provides a practical pathway for integrating Canton functionality into a widely recognized wallet interface. Leveraging an established wallet interaction model reduces the need for custom client implementations and accelerates familiarity with Canton transaction workflows among developers and users.

Open-source implementation supports transparency, enables independent validation, and promotes reuse of integration patterns across the ecosystem.

This approach balances implementation feasibility with ecosystem alignment, ensuring delivery of standardized wallet functionality capable of supporting long-term Canton ecosystem growth.
