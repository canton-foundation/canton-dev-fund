## Development Fund Proposal

**Author:** Jason Tucker-Feltham, Stableport  
**Status:** Draft 
**Created:** 2026-03-10  

---

## Abstract
The Canton Bilateral Discovery Library (CBDL) is an open-source Logic SDK that standardizes the private negotiation and Atomic Settlement of any CIP-56 asset. By providing a unified protocol for Indications of Interest (IOIs), it eliminates fragmented discovery silos and removes systemic Herstatt risk (settlement risk) across the Canton Network. The library serves as a foundational logic layer that enables any application to conduct private price discovery and deterministic settlement without leaking market-moving intent to the broader network.

---

## Specification

### 1. Objective
Currently, the Canton Network lacks a standardized mechanism for counterparties to bilaterally discover and negotiate trades, forcing developers to build proprietary, non-interoperable logic. The CBDL provides a "public good" logic layer that standardizes the pre-trade handshake. The intended outcome is to provide a standardized backend for any financial application, allowing any two participants to negotiate trades privately and settle them atomically across diverse asset classes like tokenized deposits, bonds, or private equity.

### 2. Implementation Mechanics
The solution will be implemented as a modular Daml Logic SDK:

- **Encrypted IOI Workflow:** Utilizes Daml’s sub-transaction privacy to facilitate encrypted bilateral negotiations where trade volume and intent remain invisible to all parties except the two counterparties.
- **Standardized Oracle Interface:** The library will feature a standardized adapter for a primary price oracle (e.g., Chainlink). This allows institutions to easily map their own oracle contracts into the discovery flow to facilitate Zero-Impact midpoint pricing.
- **Deterministic Atomic Swaps:** A specialized operational workflow that binds the delivery of any CIP-56 asset to its payment leg in a single, indivisible transaction, ensuring T+0 finality.

### 3. Architectural Alignment
- **CIP-56 Universal:** Built as a generic standard for all tokenized assets following the Canton Improvement Proposal 56.
- **Reference Application:** The library’s utility will be demonstrated via a functional Reference Implementation integrated into a sample atomic swap interface, proving the library's ability to power complex financial front-ends.
- **Catalyst Distribution:** Designed for deployment via the Catalyst Package Manager (CPM), allowing institutions to instantly add "Discovery Logic" to their node infrastructure.

### 4. Backward Compatibility
*No backward compatibility impact.*

---

## Milestones and Deliverables

### Milestone 1: Technical Specification & Security Modeling
- **Estimated Delivery:** Month 2 
- **Focus:** Defining the privacy-preserving architectural patterns for bilateral negotiation and mapping the interface for automated midpoint pricing. 
- **Deliverables / Value Metrics:** Formal technical specification and security threat model approved by the Tech & Ops Committee.

### Milestone 2: Alpha SDK & Reference Integration
- **Estimated Delivery:** Month 4 
- **Focus:** Development of the core Logic SDK and the standardized oracle interface. 
- **Deliverables / Value Metrics:** Public GitHub repository containing the SDK and a functional demo showcasing a private atomic swap between independent nodes using the library. 

### Milestone 3: Security Audit & Registry Publication
- **Estimated Delivery:** Month 6 
- **Focus:** Formal third-party security review and ecosystem distribution. 
- **Deliverables / Value Metrics:** Completed security audit report and official listing on the Catalyst Package Manager registry under an Apache 2.0 open-source license. This ensures that the library remains a perpetual, non-proprietary "Public Good" that any member of the Canton Network can audit, fork, or integrate without incurring licensing fees or relying on proprietary software.

---

## Acceptance Criteria
The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone  
- Demonstrated functionality or operational readiness  
- Documentation and knowledge transfer provided  
- Alignment with stated value metrics 
- Successful demonstration of an atomic swap between two independent participant nodes using the CBDL

---

## Funding

**Total Funding Request:** 650,000 Canton Coin (CC) 

### Payment Breakdown by Milestone
- **Milestone 1 - Technical Specification & Security Modeling:** 200,000 CC upon committee acceptance  
- **Milestone 2 - Alpha SDK & Reference Integration:** 250,000 CC upon committee acceptance  
- **Milestone 3 - Security Audit & Registry Publication:** 200,000 CC upon final release and acceptance  

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

---

## Motivation
The institutional adoption of DLT requires standardized infrastructure that reduces the "integration burden" for new participants. By funding the CBDL, the Foundation provides a critical "public good" that allows any developer to build interoperable financial applications, which in turn brings liquidity and volume to the network. This ensures that the library becomes a battle-tested engine for production-ready institutional trades.

---

## Rationale
Building the CBDL as a decentralized Logic SDK is the right approach because it leverages Canton's unique privacy features to meet Tier-1 institutional requirements. By standardizing application-layer logic for secure trade negotiation, the CBDL enables diverse participants to interact safely on the Global Synchronizer. This solution is preferred because it integrates directly with the Catalyst suite, providing a seamless path from trade discovery to final execution.
