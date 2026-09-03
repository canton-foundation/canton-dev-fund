# Canton Carbon Asset Standard

## Abstract

Carbon markets are a large, institutional asset class. Yet they remain fragmented, opaque, and operationally inefficient, 
with limited integration into modern digital infrastructure. Blockchain-based carbon systems have demonstrated technical 
feasibility, but adoption has stalled in the absence of institutional alignment and standardised infrastructure for representing 
carbon assets on-chain.

This proposal establishes a Canton-native infrastructure layer for carbon markets, delivering four interoperable components: 
a contract-based standard for representing carbon credits, a registry-aligned integration framework, a verifiable retirement
mechanism, and a lightweight reference marketplace for price discovery. Together these form the foundational layer required
for carbon market activity on Canton, enabling ecosystem participants to build applications, workflows, and financial integrations on top.

Defining this standard early reduces the risk of fragmentation seen in both traditional carbon markets and prior on-chain 
ecosystems (Polygon, Base, Celo). Canton is uniquely positioned to address those failure modes. Its privacy model preserves the bilateral pricing 
confidentiality that keeps OTC trading dominant today; its institutional custody model is native to the chain rather than retrofitted; and 
registry alignment is built into the standard from day one rather than negotiated after tokenisation has already occurred.

## Specification

### 1. Objective

Canton currently lacks a standard for representing and managing carbon credits as on-ledger assets.

Without this, carbon market activity cannot be meaningfully deployed on the network.

The objective of this proposal is to define and implement a reference infrastructure layer for carbon asset lifecycle management, enabling:
* representation of verified carbon credits on-ledger
* retirement of carbon credits with verifiable outputs (i.e. “retirement certificates”) synced with carbon registry infrastructure offchain.
* basic price discovery and access mechanisms

The system addresses core limitations in today’s carbon market:

* fragmented and bilateral over-the-counter (OTC) trading structures
* limited transparency and standardisation
* low inventory velocity
* lack of integration into digital workflows

The outcome is a reusable, Canton-native standard that enables carbon credits to function as programmable assets within institutional workflows.

### 2. Implementation Mechanics

The implementation consists of four core components.

**A. Carbon Asset Standard**
Carbon credits will be represented as contract-based assets, defined using Daml. Key characteristics:
* associated with structured metadata (methodology, registry, vintage, permanence)
* owned by a party (user or custodian)
* governed by lifecycle rules (transfer, retirement)

The data structure developed for tokenized carbon credits on Canton will afford unique opportunities for creating unique product aggregations for the market, 
for example fungible units representing a class of carbon credits, or structured products representing a number of different carbon credits. 

Initial class definitions will follow established approaches for representing carbon onchain, and will be designed for iteration over time.

Assets will be wallet-compatible, meaning they can be held by user-controlled parties, while also supporting custody-based flows for institutional onboarding.

Daml is the natural fit for this work as its contract-based model including explicit signatories and party-level visibility, maps directly onto how 
carbon credits already function in the real world, where issuance authority sits with the registry, and transfer and retirement rights sit with the holder. 
Not every transaction needs to be visible to every market participant.

**B. Registry Integration Framework**
The system will define a framework for integrating with external carbon registries. One carbon registry will be invited to participate in the proposal as a 
pilot implementation partner. 

This includes:

* validation of credit authenticity
* mapping registry data to on-ledger representations and vice versa (e.g. logging retirements)
* alignment with registry terms and requirements, including defining how onchain systems will sync with legacy systems. 

Initial implementation will focus on onboarding at least one carbon credit registry partner as part of the pilot.

**C. Retirement Framework**

A standardised retirement mechanism will be implemented, enabling:
* irreversible consumption of carbon credits
* generation of verifiable retirement outputs
* alignment with registry-side retirement records

Each retirement will produce:
* an on-ledger proof of execution
* a standardised retirement certificate or equivalent output

This component defines how carbon is consumed onchain, ensuring auditability and integrity.

**D. Reference Marketplace**

A minimal marketplace layer will be implemented to enable:
* Managing transfers of carbon credits from offchain carbon registries to an account on Canton
* listing of carbon assets at fixed prices
* simple buyer acceptance of listings
* basic price discovery

This is intentionally limited in scope:
* no automated market making
* no order books
* no complex trading logic

The purpose is to demonstrate how carbon assets can be tokenized and accessed to create the foundation for a Canton-enabled carbon market -- not create a full trading venue. 

The proposed model mirrors how the OTC carbon market actually works today (bilateral, negotiated and often fixed-price). The reference implementation therefore maps 
directly to current institutional behavior rather than forcing new trading patterns. 

**System Model**

Assets are held by parties on Canton, controlled either:
* directly by users (wallet-compatible model)
* or via custodial arrangements (for institutional flows)
*
Carbonmark will act as:
* builder of the standard
* provider of the reference implementation

### 3. Architectural Alignment

This proposal aligns closely with Canton’s architecture and ecosystem goals.

Carbon markets require:
* coordination across multiple independent parties (registries, suppliers, buyers)
* selective disclosure of transaction data
* verifiable lifecycle events, particularly retirement

Canton provides:
* privacy-preserving data sharing
* role-based access and permissions
* deterministic, auditable state transitions

This makes it particularly well suited for representing real-world assets such as carbon credits.

The proposal also aligns with ecosystem priorities:
* creation of reusable, application-layer infrastructure
* expansion into real-world asset use cases
* enabling institutional participation onchain

This work provides a foundational layer upon which additional applications can be built, including marketplaces, retirement platforms, and financial integrations.

### 4. Backward Compatibility

No backward compatibility impact.

This proposal introduces new application-layer infrastructure and does not modify existing Canton systems or integrations.

### Milestones and Deliverables

**Milestone 1: Carbon Asset Model and Specification**
**Estimated Delivery:** Month 1
**Focus:** Define carbon asset standard and lifecycle model
**Deliverables / Value Metrics:**
* Daml contract specification for carbon assets
* carbon class framework definition
* lifecycle model (mint, transfer, retire)
* architecture documentation

**Milestone 2: Registry Integration Framework**
**Estimated Delivery:** Months 2–3
**Focus:** Enable onboarding of verified carbon supply
**Deliverables / Value Metrics:**
* registry integration templates
* validation and onboarding flow
* at least one registry integration initiated
* test cases for asset creation

**Milestone 3: Retirement Framework**
**Estimated Delivery:** Months 2 - 3
**Focus:** Implement verifiable retirement mechanism
**Deliverables / Value Metrics:**
* retirement contract logic
* proof generation
* certificate output format
* end-to-end retirement test flows

**Milestone 4: Reference Marketplace and Workflows**
**Estimated Delivery:** Month 4 - 5
**Focus:** Enable asset access and price discovery
**Deliverables / Value Metrics:**
- fixed-price listing mechanism
- buyer interaction flow
- at least two end-to-end workflows demonstrated e.g. retail buyer offsetting and bulk institutional retirement
* initial external evaluator feedback

**Milestone 5: Documentation and Public Release**
**Estimated Delivery:** Month 6
**Focus:** Ecosystem enablement
**Deliverables / Value Metrics:**
- open-source contract library
- integration documentation
- example implementations
- developer onboarding materials

**Acceptance Criteria**
The Tech & Ops Committee will evaluate completion based on:
* Deliverables completed as specified for each milestone
* Demonstrated functionality or operational readiness
* Documentation and knowledge transfer provided
* Alignment with stated value metrics
* At least one registry integration completed

Additional conditions:
* carbon assets must follow defined standard
* registry integration must be functional with provider buy-in
* retirement must be irreversible and verifiable
* reference workflows must be reproducible
* system must be usable by external teams

### Funding
**Total Funding Request: 700,000 CC** 

Funding Breakdown: 
* Engineering: 75%
* Registry Integration: 10%
* Security Audits: 5%
* Legal Fees: 5%
* Ecosystem-building: 5%

Payment Breakdown by Milestone
* Milestone 1: 100,000 CC
* Milestone 2: 150,000 CC
* Milestone 3: 175,000 CC
* Milestone 4: 175,000 CC
* Milestone 5: 100,000 CC

**Volatility Stipulation** 

The project is not expected to exceed 6 months. If the project timeline extends beyond 6 months due to Committee-requested scope changes, 
remaining milestones will be renegotiated to account for price volatility.

**Risks and Mitigations**

We have identified the most key risks and developed risk mitigation strategies based on our experience with similar projects: 
| Risk | Mitigation |
|------|------------|
| Delays in securing a registry partner | Engage multiple registries in parallel to reduce dependency on a single counterparty |
| Canton adoption risk and low initial demand | Target institutional participants and position Canton as a reference model through active engagement and marketing |
| Availability of Daml engineering resources | Pre-identified Daml developers with relevant experience are available to support delivery |
| Changes in carbon market infrastructure | Align with established registry standards and retirement frameworks to ensure forward compatibility 

### Co-Marketing

Carbonmark has an in-house marketing team that will closely work with Canton on content creation and marketing strategies. Upon release, 
Carbonmark will collaborate with the Foundation on:
* announcement coordination
* technical blog or architecture write-up
* developer walkthrough sessions
* demonstrations to carbon market stakeholders (including to supply-side and demand-side users)
* Attendance at ecosystem events to showcase the standard

### Motivation

This proposal enables Canton to support carbon markets as a new real-world asset class.

Without a standard for representing and managing carbon credits on-ledger, meaningful carbon market activity cannot occur on the 
network – or, if it occurs, it will likely be fragmented.

By defining this infrastructure layer, Canton gains:
* a new category and set of standards for an institutional use case
recurring, non-speculative transaction activity
* a bridge to a growing global market

This positions Canton as infrastructure not just for financial assets, but for environmental markets.

### Rationale

This approach focuses on foundational infrastructure rather than a full application stack.

It prioritises:
* standardisation over product development
* interoperability over vertical integration
* simplicity over premature optimisation

By delivering a carbon asset standard, registry integration framework, retirement mechanism, and reference workflows, the proposal creates the minimum viable 
foundation required for ecosystem growth.

More advanced systems, including full marketplaces or protocol layers, can be built on top once the underlying infrastructure is in place.

Carbonmark brings to this proposal the specific combination of expertise that Canton needs to establish credible carbon market infrastructure: 
deep operational experience running an at-scale onchain carbon marketplace, direct working relationships with the registries whose buy-in is 
the critical path for Milestones 2 and 3, and first-hand knowledge of where prior tokenization efforts on other chains succeeded and where they fragmented. 
Equally important, Carbonmark has lived through the institutional, registry, and regulatory pushback that earlier blockchain-based carbon initiatives encountered, 
and has built its current product, registry partnerships, and Direct Credit Issuance workflow around resolving those exact frictions. 

This means the Canton-native standard proposed here will not be designed from a whitepaper outwards, but from the ground truth of what registries, 
suppliers, corporate buyers, and software integrators have actually required in production. By porting these hard-won design decisions into a 
Canton-native standard from day one, this proposal materially reduces the risk of repeating the fragmentation that has limited carbon market 
adoption on other blockchains, and gives Canton a credible foundation for institutional-grade carbon market activity.
