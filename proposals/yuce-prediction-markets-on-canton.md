# Proposal: Open-Source Shared Market and Liquidity Framework for Prediction Markets on Canton

Author: YUCE Team

Status: Draft

Created: 2026-03-23

## 1. Abstract

This proposal requests support from the Canton Development Fund to develop an open-source shared market and liquidity framework for prediction markets on Canton.

The project is designed as reusable application-layer infrastructure that enables multiple prediction market builders, market-facing frontends, and partner operators to create, synchronize, and operate around a common market framework rather than building isolated market systems independently. The framework will provide standardized market definitions, lifecycle management, settlement rules, integration interfaces, and shared participation structures, reducing duplicated infrastructure work and improving composability across the ecosystem.

The implementation will begin with price prediction markets as the first reference use case. In the initial phase, YUCE will act as the first market creator and reference implementation, while partner platforms will be able to discover and synchronize into the same underlying markets. In later phases, market creation capabilities will be opened through public APIs, allowing external partners to create markets within the same framework. The framework will then be extended to event prediction markets.

The primary output of this project is not a standalone consumer application, but an open, reusable, and extensible framework, together with public APIs, technical documentation, integration guides, and a working reference implementation that can support broader ecosystem adoption.

## 2. Objective

The objective of this project is to deliver a reusable open-source framework for shared prediction markets and shared liquidity on Canton, with the following goals:

- provide a common market infrastructure layer for prediction market applications;
- reduce repeated development of market lifecycle, settlement, and integration systems;
- enable multiple platforms to participate around the same underlying markets rather than operating fragmented parallel markets;
- support standardized market creation, synchronization, and settlement workflows;
- expose public APIs that allow ecosystem partners to integrate with and build on top of the framework; and
- validate the framework through a working reference implementation.

## 3. Problem Statement

Prediction market applications commonly face two structural limitations.

First, key infrastructure is repeatedly rebuilt. Teams typically need to implement their own market models, market lifecycle logic, settlement rules, result handling flows, configuration systems, frontend integration patterns, and operational tooling. This creates unnecessary duplication, increases development cost, and slows ecosystem expansion.

Second, markets and liquidity are fragmented. Even when multiple teams target similar use cases, they usually operate separate market instances, separate participation pools, and separate settlement structures. As a result, liquidity is split across isolated products, market depth is weakened, and each new platform must bootstrap its own market activity from scratch.

What is currently missing is not merely another prediction market application, but a reusable infrastructure layer that supports shared markets, shared liquidity, unified lifecycle rules, and cross-platform integration. Such a layer would allow multiple platforms to coordinate around the same underlying market structures instead of reproducing disconnected systems.

## 4. Proposed Solution

This project proposes an open-source shared market and liquidity framework for prediction markets on Canton.

Under this framework, markets are defined through standardized structures and managed through unified lifecycle and settlement rules. Multiple market-facing applications can connect to the same underlying markets, and user participation across integrated platforms can be aggregated within the same shared market structure. Rather than each platform creating separate market instances for similar use cases, platforms can discover, synchronize, and present common market objects through public interfaces.

The framework will initially support price prediction markets and later expand to event prediction markets. It will provide:

- standardized market definitions;
- lifecycle and settlement modules;
- shared market access and synchronization mechanisms;
- public APIs for discovery, creation, and result retrieval;
- reusable integration patterns for partner platforms; and
- a working reference implementation to validate practical deployment.

The project is intended to function as ecosystem infrastructure rather than a closed application stack.

## 5. Project Positioning

This project is positioned as an **open-source application-layer framework for shared prediction markets and shared liquidity on Canton**.

It should not be understood as funding for a single consumer-facing prediction market product. Instead, it is intended as a reusable infrastructure layer that future market operators, frontend builders, vertical applications, and ecosystem partners can integrate with or build upon.

YUCE will act as the first reference implementation and first market creator within the framework. Its role is to validate the design in a live product context and provide a concrete integration example. However, the long-term value of the project lies in enabling broader ecosystem participation beyond a single product.

## 6. Scope of Work

The proposed work includes the following components.

### 6.1 Core framework layer

- standardized market definition models;
- market lifecycle and state transition logic;
- support for price prediction markets;
- support for event prediction markets;
- settlement and result handling modules;
- participation and position data structures;
- shared market architecture;
- shared liquidity architecture; and
- market abstraction and configuration modules.

### 6.2 Public API and integration layer

- market discovery APIs;
- market detail and status APIs;
- market synchronization APIs;
- price prediction market creation APIs;
- event prediction market creation APIs;
- result and settlement query APIs; and
- integration guides and developer-facing documentation.

### 6.3 Reference implementation layer

- a working reference application built on the framework;
- end-to-end validation of price prediction workflows;
- end-to-end validation of event prediction workflows;
- validation of multi-platform synchronization patterns; and
- reference integration examples for external builders.

### 6.4 Public outputs

- open-source release of the core framework;
- public technical architecture documentation;
- lifecycle and state transition documentation;
- API documentation;
- integration documentation;
- reusable sample implementations; and
- reference implementation materials.

## 7. Out of Scope

This proposal does not include:

- modifications to the underlying Canton protocol;
- mandatory changes to other Canton ecosystem applications;
- bespoke private development that is not reusable at the ecosystem level; or
- long-term product expansion beyond the phased framework delivery described in this proposal.

## 8. Why Canton

This project is designed at the application layer and aligns with Canton’s strengths in supporting structured, stateful, and long-running business workflows.

Prediction markets require clearly defined market states, controlled transitions, explicit settlement paths, persistent records, and reliable operational handling across multiple actors. These characteristics fit well with an infrastructure-oriented environment where lifecycle integrity, controlled state evolution, and multi-party coordination are important.

The proposed framework does not require protocol changes. Its value comes from standardizing reusable application-layer components and exposing them in a way that supports ecosystem composability.

## 9. Public Good and Ecosystem Value

This project is intended to create ecosystem-level value in several ways.

### 9.1 Reducing duplicated infrastructure work

By providing reusable market lifecycle, settlement, synchronization, and integration modules, the project lowers the cost for future teams to launch prediction market applications.

### 9.2 Supporting shared markets and shared liquidity

Instead of encouraging isolated market systems, the framework enables multiple platforms to operate around common underlying markets. This can reduce fragmentation and improve the efficiency of market participation.

### 9.3 Enabling cross-platform market collaboration

Through public APIs and standardized integration patterns, one platform can create markets that others can discover and synchronize. Over time, this supports a collaborative market network rather than disconnected applications.

### 9.4 Providing a real open-source reference implementation

Ecosystem adoption is often easier when documentation is paired with a working implementation. The reference application will help external builders understand practical integration patterns and validate the framework more easily.

### 9.5 Creating reusable primitives beyond a single use case

Although the framework is initially focused on prediction markets, elements of its lifecycle, settlement, and event-driven coordination model may also inform adjacent application designs that require structured result-based workflows.

## 10. Intended Users

The framework is intended for several categories of ecosystem participants:

- teams building new prediction market products;
- operators serving asset-specific, event-specific, or community-specific market use cases;
- frontend applications that want to present and distribute access to shared markets; and
- ecosystem projects that can benefit from reusable market lifecycle and settlement primitives.

## 11. Technical Approach

### 11.1 Shared market model

Within this framework, a shared market is not a duplicated market template deployed separately by each platform. It is a common underlying market object that can be discovered and presented by multiple integrated platforms.

Each market is defined by a standardized set of parameters, including market type, time structure, participation rules, settlement rules, and result source. Integrated platforms do not independently recreate the market logic. Instead, they connect to and present the same underlying market through common interfaces.

### 11.2 Shared participation structure

User participation originating from different integrated platforms is aggregated into the same underlying market structure. Market locking, settlement, and result handling follow unified rules, rather than being separately implemented by each participating platform.

### 11.3 Public API model

The framework will expose APIs for market discovery, synchronization, creation, status retrieval, and result access. In the initial phase, market creation will be limited to the reference implementation. In later phases, creation capabilities will be opened to external partners under the same standardized framework.

### 11.4 Price prediction first, event prediction next

The implementation will begin with price prediction markets in order to validate the architecture with a narrower and more standardized market type. Once the common market infrastructure is validated, the framework will be extended to support event prediction markets with corresponding result publication and settlement flows.

## 12. Delivery Phases

### Phase 1: Shared price market alpha

In Phase 1, YUCE will act as the initial market creator and reference implementation. Standardized price prediction markets will be created and exposed through public interfaces. External platforms will be able to discover and synchronize into these markets and present them to their users.

The purpose of this phase is to validate that:

- standardized price markets can be created under a common framework;
- external platforms can synchronize into those markets;
- participation across multiple platforms can be aggregated into the same market structure; and
- unified settlement logic can operate successfully across shared market access points.

### Phase 2: Open price market creation beta

In Phase 2, the framework will open public APIs that allow partner platforms to create price prediction markets within the same standardized structure. Markets created by external partners can then be discovered and synchronized by other platforms.

The purpose of this phase is to validate that:

- market creation can be opened externally through public interfaces;
- multiple creators can operate within the same framework;
- markets created by different partners remain interoperable within a common structure; and
- the framework can support broader ecosystem participation beyond the reference implementation.

### Phase 3: Open event market creation and ecosystem release

In Phase 3, the framework will be extended to event prediction markets. Partner platforms will be able to create event markets through public APIs, and other platforms will be able to synchronize them within the same shared market framework.

The purpose of this phase is to validate that:

- the framework is not limited to one market type;
- event-based markets can operate through the same reusable infrastructure pattern;
- public APIs and integration materials are sufficient for external adoption; and
- the project can be released as a broader ecosystem-facing framework.

## 13. Open-Source Plan

The project will open-source the framework components that constitute its reusable ecosystem value. Planned open-source outputs include:

- market lifecycle and market definition modules;
- reusable framework components for price and event prediction markets;
- market synchronization and shared market access logic;
- public API definitions and sample implementations;
- integration examples and developer documentation;
- architecture documentation; and
- reusable parts of the reference implementation that directly support external understanding and integration.

The open-source plan is centered on reusable infrastructure and public interfaces rather than product-specific branding or non-generalized business configuration.

## 14. Milestones and Deliverables

### Milestone 1: Shared Price Market Alpha

**Objective**

Deliver the first working version of shared price prediction markets, with YUCE acting as the initial market creator and reference implementation.

**Deliverables**

- core market lifecycle module v1;
- standardized price market creation module v1;
- market discovery and synchronization API v1;
- unified settlement and result handling module v1;
- shared market and shared liquidity base module v1;
- reference application integration version v1;
- technical architecture and developer documentation v1; and
- first open-source release of the framework core.

**Acceptance Criteria**

- standardized price prediction markets can be created for predefined assets and time intervals;
- external platforms can discover and synchronize target markets through APIs;
- participation from multiple platforms can enter the same underlying market structure;
- unified locking, result handling, and settlement flows function correctly; and
- the first open-source release and documentation package are published.

**Adoption Indicators**

- at least 20 standardized price markets are available through public interfaces;
- at least 800 cumulative registered users;
- at least 300 cumulative participations across the shared market network;
- at least USD 30,000 equivalent in cumulative participation volume; and
- at least 1 partner integration or sandbox-level synchronization demonstration.

### Milestone 2: Open Price Market Creation Beta

**Objective**

Open price prediction market creation capabilities to external partners through public APIs.

**Deliverables**

- price market creation API v1;
- multi-creator market support module v1;
- market management and operational configuration module v2;
- integration documentation and sandbox examples v2;
- external builder integration workflow materials;
- second open-source framework release; and
- reference demonstration materials for potential partners.

**Acceptance Criteria**

- partner platforms can create price prediction markets through public APIs;
- other platforms can discover and synchronize those markets;
- markets created by multiple creators can operate within a unified framework;
- third parties can complete sandbox-level integration from the documentation; and
- at least 1 external design-partner or reference integration demonstration is completed.

**Adoption Indicators**

- at least 50 price prediction markets are created through public APIs;
- at least 2,000 cumulative registered users;
- at least 500 cumulative participations across the shared market network;
- at least USD 50,000 equivalent in cumulative participation volume;
- at least 1 external partner demonstration of API-based market creation; and
- at least 2 markets initiated by different creators.

### Milestone 3: Open Event Market Creation and Ecosystem Release

**Objective**

Extend the framework to event prediction markets and complete a broader ecosystem release.

**Deliverables**

- event market creation API v1;
- event result handling and settlement module v1;
- complete shared market framework release v1;
- full reference application demonstration;
- developer, operational, and integration documentation v3;
- ecosystem release materials; and
- adoption guidance for external builders.

**Acceptance Criteria**

- partner platforms can create event prediction markets through public APIs;
- external platforms can synchronize event markets;
- both price prediction and event prediction markets operate on the shared framework;
- documentation is sufficient for external builders to understand integration and market creation workflows; and
- the open-source release and reference materials are complete and publicly accessible.

**Adoption Indicators**

- at least 80 total markets are created through public APIs across both market types;
- at least 10 of those are event prediction markets;
- at least 2,000 cumulative registered users;
- at least 1,000 cumulative participations across the shared market network;
- at least USD 100,000 equivalent in cumulative participation volume; and
- at least 1 external partner or design-partner integration demonstrations

## 15. Evaluation Criteria

The success of this project can be evaluated through the following questions:

- Does it deliver reusable infrastructure rather than only a single application?
- Does it support shared markets, shared liquidity, and unified settlement across multiple platforms?
- Are the public APIs and integration materials practical and understandable?
- Are the open-source outputs complete enough to support external adoption?
- Does the reference implementation demonstrate real feasibility?
- Is there a credible path for ecosystem reuse and partner integration?

## 16. Funding Request

### 16.1 Total Request

The total funding request is **Canton Coin (CC) equivalent to USD 250,000**.

### 16.2 Allocation by Milestone

- Milestone 1: CC equivalent to USD 75,000
- Milestone 2: CC equivalent to USD 85,000
- Milestone 3: CC equivalent to USD 90,000

### 16.3 Use of Funds

Funding will primarily support:

- development of the open-source framework;
- development of shared market and shared liquidity components;
- development of public APIs and integration modules;
- building and operating the reference implementation;
- technical, operational, and integration documentation;
- security, stability, and production-readiness work; and
- ecosystem release and partner integration support.

## 17. Long-Term Maintenance

The project is intended as sustainable infrastructure rather than a one-time demonstration. Long-term maintenance priorities include:

- continued stability and reliability of core framework modules;
- iterative improvement of synchronization and shared liquidity mechanisms;
- updates to APIs and documentation as integration needs evolve;
- support for additional ecosystem participants and use cases; and
- continued operation of the reference implementation as a practical adoption anchor.

## 18. Why This Proposal Fits the Development Fund

This proposal is aligned with the goals of ecosystem development funding for several reasons.

First, it focuses on reusable open-source infrastructure rather than a closed single-product deployment.

Second, it addresses a genuine ecosystem problem: duplicated market infrastructure and fragmented liquidity.

Third, it provides concrete public outputs, including framework components, APIs, documentation, and a reference implementation.

Fourth, it offers a phased delivery path with measurable milestones and adoption indicators.

Finally, it creates a credible foundation for broader ecosystem participation in prediction-market-related applications on Canton.

## 19. Conclusion

This proposal requests support to build an open-source shared market and liquidity framework for prediction markets on Canton.

The project is intended to provide reusable infrastructure that allows multiple builders, operators, and market-facing applications to coordinate around common markets, common settlement structures, and public integration interfaces. By doing so, it aims to reduce repeated development effort, improve composability, and support the emergence of a broader shared market network within the ecosystem.

YUCE will serve as the first reference implementation and initial market creator, but the long-term value of the project lies in establishing an open and reusable infrastructure layer that can support participants beyond a single application.