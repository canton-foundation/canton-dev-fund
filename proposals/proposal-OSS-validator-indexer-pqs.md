# CIP-0100 Open Sourcing Grant of a Validator Indexer (PQS)

**Author:**: Digital Asset
**Status:** Submitted
**Created:** 2026-03-10

## **Abstract**

This proposal outlines a grant for Digital Asset to: (1) enhance PQS to be current with Canton Network dApp feature requests and recent Ledger API enhancements and (2) open-source the Participant Query Store (PQS) and transfer its governance to the Canton Foundation.[^1]

PQS acts as a local indexer for individual validators. It overcomes the limited query capabilities of the validator’s standard Ledger API—which is optimized for asynchronous event streaming, not complex relational querying—by providing a general query capability based on industry-standard SQL. PQS represents 3 years of continuous R\&D and is in use by at least 10 Canton Network applications.

PQS provides an Operational Data Store (ODS) to support back-office integration, compliance, and real-time audit reporting for Traditional Finance (TradFi) institutions and DeFi apps alike. By natively supporting Canton 3.x protocol upgrades and allowing institutions to execute standard SQL queries across external data stores, it reduces TradFi developer integration overhead by directly mapping decentralized ledger states into existing Web2 risk infrastructure and reporting infrastructure.

This request is for a grant of 7,800,000 Canton Coin (CC) for feature enhancements and making PQS a public good for the Canton ecosystem. It does not request funding for ongoing operational maintenance which would be included in the *2026-Maintenance Grant for Daml Open Source*.

Major architectural upgrades and new feature development (e.g., multi-synchronizer feature enablement) are out of scope and will be proposed in separate CIPs.

## Motivation

Data access and back-office integration are critical prerequisites for production applications on any blockchain network. The standard Canton Ledger API is optimized for transaction submission and asynchronous event streaming; it lacks the native capability to efficiently execute complex, paginated queries, aggregations, and historical data filtering. Public explorers and APIs can offer aggregated and indexed data, but only on public data. PQS solves this problem by translating private ledger state into an Operational Data Store (ODS) queryable via industry-standard SQL.

Indexers for private data are a critical infrastructure requirement, evidenced by the 10+ Canton Network applications currently utilizing PQS.  With PQS, builders on Canton are able to write standard SQL joins across assets and external databases, satisfying their internal audit requirements without building their own aggregation middleware. By providing an Open Source SQL query layer, developers can build complex dApps and eliminate the engineering required to build and maintain custom infrastructure. Making PQS into a common good is inline with the purpose of the ecosystem development fund and standardizes these indexing capabilities across the network. 

Rather than starting a new indexer project from scratch, Open Sourcing PQS provides an existing, 3-year-tested codebase to the ecosystem at large. Once open sourced, PQS can form the basis for others to build higher level services (like auto-generated API middlewares) on top. For example, the grant proposal [Add Canton Network Indexer](https://github.com/canton-foundation/canton-dev-fund/pull/45/changes#diff-ccc48a7426e280f20b19b24f0889d4c569f3e63b0705fb79a15e8d4c5a56f774) would use PQS in its solution. [Canton Participant Workbench](https://github.com/canton-foundation/canton-dev-fund/pull/68) is another grant proposal leveraging PQS. Without a base component like PQS, such services would need to engineer the entire validator indexing architecture from scratch.

This proposal also forms the basis of the proposal "Open Sourcing Grant for a Ledger Investigation Tool (Daml Shell)".

## Specification

### Objective

The objective of this grant is two-fold:

1. **PQS Enhancements for Canton Network:** PQS requires enhancements for parity with current Canton Network validator features and to fulfill specific dApp integration requirements. These enhancements will be backward compatible. The enhancements are:
   1. **Zero-Downtime New DAR Ingestion:** To function as a continuously operating ODS, PQS must operate without intervention during network upgrades, party additions, or DAR uploads. This enhancement will dynamically detect new Daml Archive (DAR) uploads, ingesting the package, and generating necessary SQL tables without halting the indexing pipeline. The current DAR ingestion architecture requires manual service restarts.
   2. **Single-Writer Concurrency Control:** Enterprise Kubernetes environments frequently rely on horizontal auto-scaling, which can corrupt a standard indexing database if multiple pods attempt to write simultaneously. A PQS instance cannot be auto-scaled so this feature introduces strict database-level locking. This ensures that only a single PQS instance can execute writes to eliminate the risk of state corruption.
   3. **Orphaned Package Decoding:** Enterprise audit trails require historical fidelity. PQS is enhanced to decode contract payloads even if the creation package has been unvetted and is no longer available.
   4. **Canton 3.x Ledger API Protocol Support:**
   5. **Support Input Contracts**:  Upgrade PQS to natively support the ingestion of Input Contracts
   6. **Validator Helm Chart/Docker Compose Integration:** Delivery of a Helm chart, integrated as an opt-in deployment flag within the standard Canton Validator infrastructure suite, enabling node operators to provision a configured ODS environment.
   7. **Smart Contract Upgrade & Interface Lineage**: Ensuring Smart Contract Upgrades and Acquired Interfaces (InterfaceView.implementation\_package\_id) are relationally mapped.
2. **PQS functionality as a common good to the ecosystem:** standardized SQL read access without proprietary lock-in or licensing risk, for public and general use.  This includes a transition to Open-Source licensing and possibly eventual governance by the Canton Foundation in line with the transition of the Daml SDK. The Canton Foundation thereby provides the ecosystem with a SQL querying indexer for private ledger data. Proprietary dependencies are removed and the PQS codebase is released under the Apache 2.0 License. 
   1. **PQS Release:** Public release of the PQS repository under an Open Source license.
   2. **CI/CD builds:** Verifiable CI/CD pipeline execution passing 100% of participant-level integration tests.
   3. **Dual-Repository Handover:** Transfer of the sanitized PQS repository to canton-foundation if and when Daml SDK transitions.
      
### Milestones and Deliverables

**M1: PQS functionality as a common good**

* **Start Date:** March 2026
* **Estimated Delivery:** 3 months after approval
* **Focus:** Codebase sanitization, decoupling from proprietary dependencies, PQS release, and public deployment.
* **Deliverables / Value Metrics:**
  * **PQS Release**
  * **CI/CD builds**

**M2: PQS enhancements Part I**

* **Estimated Delivery:** 3 months after M1
* **Deliverables / Value Metrics:**
  * **Zero-Downtime New DAR Ingestion**
  * **Orphaned Package Decoding**
  * **Single-Writer Concurrency Control**

**M3: PQS enhancements Part II**

* **Estimated Delivery:** 3 months after M2
* **Deliverables / Value Metrics:**
  * **Validator Helm Chart Integration**
  * **Smart Contract Upgrade & Interface Lineage**
  * **Support Input Contracts**

This proposal does not request funding for ongoing operational maintenance. Upon the successful completion of M1, the day-to-day maintenance of the PQS repository (including security SLAs, bug fixes, CI/CD pipeline management, and external PR reviews) will transition to the purview of the *2026-Maintenance Grant for Daml Open Source*.

#### **Acceptance Criteria**

The Tech & Ops Committee (or the Core Contributor Group) can evaluate the completion of this milestone based on the following evidence:

* **M1 (PQS functionality as a common good):** The PQS and repositories are public under an Open Source license, free of proprietary dependencies, pass 100% of integration tests in a public CI pipeline, and fully prepared to be transitioned to the Canton Foundation GitHub namespace in conjunction with the rest of the Daml SDK.
* **M2 (Enhancements I):**
  * **Zero-Downtime New DAR Ingestion:** Validated by two MainNet dApps demonstrating that a new DAR can be uploaded without dropping, halting, or duplicating any active event ingestion streams.
  * **Orphaned Package Decoding:** Successful execution in a test environment proving that PQS decodes contracts independent of active package vetting status.
  * **Single-Writer Concurrency Control:** Successful execution of concurrent write attempts to the PQS database in a simulated scaling event, verifying that only a single writer is permitted and zero data corruption occurs
* **M3 (Enhancements II):**
  * **Validator Helm Chart Integration:**  Successful deployment and operational connection of PQS to a fresh validator node using the provided Helm charts.
  * **Smart Contract Upgrade & Interface Lineage:** A successful demonstration that Smart Contract Upgrades and Acquired Interfaces (InterfaceView.implementation\_package\_id) are relationally mapped.
  * **Support Input Contracts:**  Successful demonstration that PQS stores input contracts in the \_\_contracts table on processing the transaction.

### Funding

This request is for a grant of 7,800,000 Canton Coin (CC).
**Milestone 1 (PQS functionality as a common good):** 3,900,000 CC (50%) upon committee acceptance of deliverables.

**Milestone 2 (PQS enhancements Part I):** 1,950,000 CC (25%) upon committee acceptance of deliverables.

**Milestone 3 (PQS enhancements Part II):** 1,950,000 CC (25%) upon committee acceptance of deliverables.

**Volatility Stipulation:**

As this project is expected to complete within 9 months, the grant is denominated in fixed Canton Coin. Should the project timeline extend beyond 9 months due to requested scope changes by the Committee, the remaining un-minted milestones must be renegotiated to account for any significant USD/CC price volatility.

**Timeline Risk Management:**

* **Acceleration Bonus:** Delivery of Milestone 3 more than 1 month early (by Month 8 after approval) triggers a \+20% bonus on the final milestone payout.
* **SLA Penalty:** A 10% reduction in the respective milestone payment will be applied for every full month of delay beyond the original estimated delivery date.  If a milestone is more than 3 full months delayed then the terms of this agreement will be revisited.

## Milestone Fulfillment and Retroactive Compensation

The Canton Foundation acknowledges that certain technical milestones outlined in this proposal may have been finalized prior to the formal approval of this grant to maintain network development velocity. 
In instances where a milestone’s "Definition of Done" and associated success criteria have been met and verified prior to the grant’s effective date, the Foundation agrees to authorize retroactive payment 
for said deliverables. Verification shall be based on the timestamped completion of the specific GitHub Pull Requests, technical documentation, protocol upgrades or adoption metrics referenced in the milestone delivery plan.

### Co-Marketing

There are no co-marketing needs or requests associated with this proposal.

[^1]:  To be timed with the transition of the Daml SDK to Canton Foundation.
