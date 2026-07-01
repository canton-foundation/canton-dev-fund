## Development Fund Proposal

Author: AR Technology LLC  
Status: Draft  
Created: 2026-06-21  
Label: defi-liquidity

[Champion](https://github.com/canton-foundation/canton-dev-fund/blob/main/sig-directory.md): need Champion

----------

## Abstract

AR Technology LLC proposes to build a non-custodial RFQ-based DEX aggregator for the Canton ecosystem.

The aggregator will allow users, wallets, dApps, and institutional applications to request swap quotes across Canton-based DEXs and liquidity venues, compare available execution routes, and execute accepted swaps atomically on Canton. The service will not custody user funds. Users will review and sign the final transaction, and execution will be handled through Canton smart contracts written in Daml.

The project is designed as reusable liquidity infrastructure for the Canton ecosystem. It will improve liquidity discovery, reduce integration complexity for application developers, and provide a foundation for future DeFi, trading, and institutional liquidity workflows on Canton.

The proposed development period is 8 months, with a total funding request of 20,000,000 CC.

----------

## Specification

### 1. Objective

The objective of this proposal is to build a non-custodial RFQ-based DEX aggregator for Canton that enables efficient liquidity discovery and atomic swap execution across integrated Canton liquidity venues.

The problem being solved is liquidity fragmentation. As the Canton ecosystem grows, liquidity may exist across multiple DEXs, applications, participants, and liquidity providers. Without an aggregation layer, users and developers may need to manually compare venues or build separate integrations for each liquidity source. This creates friction, lowers execution quality, increases integration costs, and slows the development of user-facing DeFi applications.

The intended outcome is a reusable aggregation layer that allows a user or application to:

1.  Select an asset pair and swap amount.
    
2.  Request executable RFQ quotes from supported Canton liquidity venues.
    
3.  Compare quotes based on price, fees, slippage, quote lifetime, and execution conditions.
    
4.  Select the best available route.
    
5.  Sign the final transaction.
    
6.  Execute the swap atomically on Canton without the aggregator taking custody of user funds.
    

This proposal has a single objective: to deliver an RFQ-based DEX aggregation and execution layer for Canton.

### 2. Implementation Mechanics

The solution will be implemented as a combination of backend infrastructure, Daml smart contract logic, frontend client application, integration APIs, indexing components, analytics, monitoring, and documentation.

The high-level flow is:

1.  A user or application submits a trading pair and amount.
    
2.  The backend RFQ engine sends quote requests to integrated DEXs and liquidity venues.
    
3.  The backend receives quote responses and normalizes them into a common format.
    
4.  The routing engine compares available quotes based on execution price, fees, slippage, quote expiration, venue reliability, and execution constraints.
    
5.  The best executable quote or route is returned to the user.
    
6.  The user reviews the quote and signs the transaction.
    
7.  A Daml smart contract validates the accepted quote parameters.
    
8.  The swap is executed atomically on Canton.
    
9.  The backend stores non-sensitive trade metadata, quote history, execution results, and analytics.
    

The aggregator will not custody user funds. It will coordinate quote discovery, route selection, transaction preparation, analytics, and integration APIs, while the final transaction remains user-approved and non-custodial.

#### Backend RFQ Engine

The backend will be responsible for quote discovery, route selection, analytics, venue integration, and API access.

Planned backend functions include:

-   Receiving quote requests from frontend clients, wallets, dApps, and API users
    
-   Sending RFQ requests to supported DEXs and liquidity venues
    
-   Normalizing quote responses into a common internal format
    
-   Calculating the best route based on price, fees, slippage, quote lifetime, and execution reliability
    
-   Rejecting stale or expired quotes
    
-   Falling back to the next available venue when the selected quote expires or becomes unavailable
    
-   Storing quote history, trade history, venue metadata, and analytics
    
-   Providing APIs for wallets, dApps, liquidity venues, and institutional applications
    
-   Supporting future integrations with additional Canton-based liquidity venues
    

The initial backend stack is expected to be:

-   TypeScript with Bun as the preferred initial runtime
    
-   PostgreSQL for quote history, trade history, venue metadata, and analytics
    
-   Canton/Daml integration libraries where applicable
    
-   Potential future evaluation of Rust or Go for performance-critical routing components
    

Because Canton privacy settings may prevent a generic aggregator from reading all real-time DEX state directly from Canton, the system will not assume universal public state access. Instead, the aggregator will rely on direct RFQ integrations with participating DEXs and liquidity providers, plus an indexing layer for venue-provided market data where appropriate.

Quote validity will be time-limited. The RFQ engine will track quote TTL, reject stale quotes, and support fallback logic if a quote is no longer executable when the user attempts to accept it.

#### Daml Smart Contract Execution Layer

The on-chain execution layer will be implemented in Daml.

The smart contract layer will be responsible for:

-   Representing accepted quote terms
    
-   Verifying that execution parameters match the user-approved quote
    
-   Enforcing quote expiration
    
-   Coordinating swap execution
    
-   Preventing partial or invalid execution
    
-   Supporting atomic settlement on Canton
    
-   Providing a foundation for future integrations with multiple venues and asset types
    

The first implementation will focus on safe RFQ execution and practical non-custodial swap settlement. Advanced multi-venue route splitting may require additional coordination with participating venues and synchronizer compatibility.

A key technical consideration is that all venues involved in an atomic multi-DEX route may need to be available in a compatible Canton execution environment and potentially on a common synchronizer. The MVP will therefore prioritize single-venue executable RFQ swaps first, while documenting the requirements and roadmap for more advanced multi-venue atomic routes.

Before any production deployment with meaningful value, the Daml smart contract logic should undergo a dedicated external audit.

#### Frontend Client Application

The project will include a frontend client application to demonstrate and validate the end-to-end user flow.

The frontend will allow users to:

-   Select an asset pair
    
-   Enter a swap amount
    
-   Request quotes
    
-   View the best available route
    
-   Review quote details, including venue, expected output, fees, slippage, and expiration
    
-   Accept the quote
    
-   Sign the transaction
    
-   Track transaction status and execution result
    

The frontend will be built in TypeScript and connected to the backend RFQ engine and Daml execution flow.

#### APIs and Integrations

The project will expose APIs so that Canton wallets, dApps, DEXs, liquidity providers, and institutional applications can integrate with the aggregator.

Planned API surfaces include:

-   Quote request API
    
-   Quote response API
    
-   Route selection API
    
-   Trade history API
    
-   Execution status API
    
-   Venue integration API
    
-   Analytics API
    

The project will include integration documentation, example requests, response schemas, and implementation examples.

#### Operational Approach

The project will include:

-   Development and testing environments
    
-   Monitoring and logging
    
-   Quote and execution analytics
    
-   Deployment documentation
    
-   Security review preparation
    
-   Incident response planning
    
-   Public documentation for ecosystem participants
    
-   Partner onboarding materials for DEXs and liquidity providers
    

The system is intended to become reusable infrastructure for the Canton ecosystem, not a private single-purpose application.

### 3. Architectural Alignment

This proposal aligns with Canton’s architecture and ecosystem priorities in several ways.

First, the project is designed around non-custodial execution. The aggregator does not hold user funds and does not act as a custodian. Users remain in control of the final transaction approval.

Second, the project is built around atomic workflows. The accepted quote should be validated and executed through Canton smart contract logic so that partial or invalid execution can be prevented.

Third, the project respects Canton’s privacy-aware architecture. The aggregator does not assume that all venue state is globally readable. Instead, it uses RFQ flows, direct venue integrations, and venue-provided data/indexing where needed.

Fourth, the project improves financial workflow composability. By providing a shared RFQ and routing layer, wallets, dApps, and institutional applications can integrate swap functionality without building venue-specific integrations from scratch.

Fifth, the project creates reusable DeFi liquidity infrastructure. It can support future integrations with DEXs, liquidity providers, wallets, dApps, asset issuers, and institutional participants.

The proposal is primarily aligned with the following ecosystem categories:

-   defi-liquidity
    
-   financial-workflows-composability
    
-   canton-apis
    
-   dapp-integration
    
-   regulatory-compliance, where institutional RFQ and non-custodial execution workflows are relevant
    

The initial proposal does not depend on a specific numbered CIP. If relevant CIPs around token standards, APIs, synchronizers, portability, or financial workflows become applicable during development, the implementation will be aligned with them and documented accordingly.

### 4. Backward Compatibility

No backward compatibility impact.

This project introduces a new aggregation and execution layer. It does not require changes to existing Canton applications, existing DEXs, wallets, or participant infrastructure.

Existing venues may integrate with the aggregator voluntarily through RFQ APIs or venue-provided data feeds. Existing wallets and dApps may integrate with the aggregator APIs if they want to add swap functionality, but no existing workflow is required to change.

----------

## Milestones and Deliverables

### Milestone 1: Architecture, Research, and Technical Specification

-   Estimated Delivery: Month 1
    
-   Focus: Define the complete technical architecture, RFQ lifecycle, execution model, integration assumptions, and 8-month delivery roadmap.
    
-   Deliverables / Value Metrics:
    

-   Full technical architecture document
    
-   RFQ lifecycle specification
    
-   Backend architecture and data model
    
-   Daml smart contract execution design
    
-   Frontend application design
    
-   API specification for wallets, dApps, DEXs, and liquidity venues
    
-   Venue integration model
    
-   Synchronizer and atomic execution assumptions
    
-   Initial threat model and security assumptions
    
-   Development roadmap for the full 8-month program
    
-   Value metric: at least 3 potential ecosystem participant profiles are mapped, such as wallet, dApp, DEX, liquidity provider, or institutional application
    

### Milestone 2: Backend RFQ Engine MVP

-   Estimated Delivery: Month 2
    
-   Focus: Build the initial backend RFQ engine capable of receiving quote requests, requesting quotes from mock venues, normalizing responses, and selecting the best available quote.
    
-   Deliverables / Value Metrics:
    

-   Initial backend RFQ service
    
-   Quote request API
    
-   Quote response normalization
    
-   Mock venue integrations
    
-   PostgreSQL schema for quotes, trades, venues, and analytics
    
-   Basic routing engine for best quote selection
    
-   Quote TTL handling
    
-   Initial fallback logic for expired or unavailable quotes
    
-   Backend unit tests
    
-   API documentation draft
    
-   Value metric: external reviewers can test the quote request and quote response flow using documented API examples
    

### Milestone 3: Advanced Routing, Indexing, and Analytics Layer

-   Estimated Delivery: Month 3
    
-   Focus: Improve routing quality and add indexing and analytics needed for real venue readiness.
    
-   Deliverables / Value Metrics:
    

-   Advanced routing logic using price, fees, slippage, TTL, and venue reliability
    
-   Venue data indexing layer
    
-   Quote comparison history
    
-   Execution quality metrics
    
-   Venue performance tracking
    
-   Improved fallback and retry logic
    
-   Analytics API endpoints
    
-   Trade and quote history API endpoints
    
-   Test suite for routing scenarios
    
-   Value metric: the system can compare multiple venue responses and produce a transparent route selection result that can be reviewed by integrators
    

### Milestone 4: Daml Smart Contract Execution Prototype

-   Estimated Delivery: Month 4
    
-   Focus: Build the Daml execution layer for accepted quote validation and non-custodial swap execution.
    
-   Deliverables / Value Metrics:
    

-   Daml contract prototype for accepted quote execution
    
-   Quote validation logic
    
-   Quote expiration enforcement
    
-   User-approved execution flow
    
-   Atomic swap execution prototype
    
-   Error handling for expired, invalid, or mismatched quotes
    
-   Test scenarios for successful and failed execution
    
-   Documentation of execution assumptions
    
-   Documentation of synchronizer and venue compatibility requirements
    
-   Value metric: reviewers can observe a test environment flow where an accepted quote is validated and either executed or rejected according to defined rules
    

### Milestone 5: Frontend Client Application and User Flow

-   Estimated Delivery: Month 5
    
-   Focus: Build a frontend application that demonstrates the user-facing quote-to-acceptance flow.
    
-   Deliverables / Value Metrics:
    

-   Frontend demo application
    
-   Asset pair and amount input
    
-   Quote request interface
    
-   Best-route display
    
-   Quote details including venue, expected output, fees, slippage, and expiration
    
-   User acceptance flow
    
-   Transaction status display
    
-   Connection to backend RFQ engine
    
-   Initial connection to Daml execution flow
    
-   Frontend documentation
    
-   Value metric: a non-technical ecosystem reviewer can use the demo interface to request a quote, review the best route, and understand the execution flow
    

### Milestone 6: End-to-End Integration and Partner Venue Readiness

-   Estimated Delivery: Month 6
    
-   Focus: Connect backend, frontend, and Daml components into a complete quote-to-execution demo and prepare the framework for real venue integrations.
    
-   Deliverables / Value Metrics:
    

-   End-to-end backend, frontend, and Daml integration
    
-   Full quote-to-execution demo flow
    
-   Partner venue integration framework
    
-   Venue onboarding documentation
    
-   API documentation for DEXs and liquidity providers
    
-   API documentation for wallets and dApps
    
-   Integration examples
    
-   Testing deployment environment
    
-   Monitoring and logging setup
    
-   Value metric: at least 2 integration profiles are documented in detail, such as wallet integration and liquidity venue integration
    

### Milestone 7: Security Hardening, Audit Preparation, and Production Readiness

-   Estimated Delivery: Month 7
    
-   Focus: Harden the system and prepare the backend and Daml components for external technical review and future production deployment.
    
-   Deliverables / Value Metrics:
    

-   Security hardening of backend and Daml logic
    
-   Expanded threat model
    
-   Non-custodial execution review
    
-   Quote manipulation risk analysis
    
-   Quote expiration and replay protection review
    
-   Access control review
    
-   Infrastructure security review
    
-   External audit preparation package
    
-   Production deployment plan
    
-   Incident response and monitoring plan
    
-   Value metric: the project reaches external audit readiness with documented risks, mitigations, and review scope
    

### Milestone 8: Final Documentation, Ecosystem Launch, and Adoption Support

-   Estimated Delivery: Month 8
    
-   Focus: Publish final documentation, prepare ecosystem adoption materials, and make the project ready for next-stage production deployment and partner integrations.
    
-   Deliverables / Value Metrics:
    

-   Final technical report
    
-   Public documentation
    
-   API integration guide
    
-   Venue integration guide
    
-   Wallet and dApp integration examples
    
-   Deployment guide
    
-   Demo environment
    
-   Final roadmap for production launch
    
-   Ecosystem adoption plan
    
-   Support plan for additional Canton participants
    
-   Final presentation for Canton Foundation and reviewers
    
-   Value metric: at least 3 ecosystem participant categories have clear integration paths, such as wallets, dApps, DEXs, liquidity providers, or institutional applications
    

----------

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

-   Deliverables completed as specified for each milestone
    
-   Demonstrated functionality or operational readiness
    
-   Documentation and knowledge transfer provided
    
-   Alignment with stated value metrics
    

Project-specific acceptance conditions:

-   The aggregator must demonstrate a complete RFQ flow from quote request to quote comparison.
    
-   The system must show how quotes are normalized and selected based on price, fees, slippage, quote lifetime, and execution conditions.
    
-   The system must demonstrate non-custodial execution logic where the user approves the final transaction.
    
-   The Daml execution prototype must validate accepted quote parameters and reject expired or mismatched quotes.
    
-   The project must document Canton-specific privacy, venue integration, and synchronizer assumptions.
    
-   The project must provide clear API documentation for wallets, dApps, DEXs, and liquidity providers.
    
-   The project must include a practical demo that shows the quote-to-execution flow.
    
-   The project must include an adoption plan with clear integration paths for multiple Canton ecosystem participant categories.
    
-   The project must include a security review package and external audit scope before any production use with meaningful value.
    

The acceptance criteria are based on value to the ecosystem rather than only delivery of artifacts. The expected ecosystem value is that Canton wallets, dApps, DEXs, liquidity providers, and institutional applications have a reusable path to integrate RFQ-based swap functionality without building their own aggregation and execution layer from scratch.

----------

## Funding

Total Funding Request: 20,000,000 CC

### Payment Breakdown by Milestone

-   Milestone 1 Architecture, Research, and Technical Specification: 1,500,000 CC upon committee acceptance
    
-   Milestone 2 Backend RFQ Engine MVP: 2,000,000 CC upon committee acceptance
    
-   Milestone 3 Advanced Routing, Indexing, and Analytics Layer: 2,500,000 CC upon committee acceptance
    
-   Milestone 4 Daml Smart Contract Execution Prototype: 3,000,000 CC upon committee acceptance
    
-   Milestone 5 Frontend Client Application and User Flow: 2,500,000 CC upon committee acceptance
    
-   Milestone 6 End-to-End Integration and Partner Venue Readiness: 3,000,000 CC upon committee acceptance
    
-   Milestone 7 Security Hardening, Audit Preparation, and Production Readiness: 3,000,000 CC upon committee acceptance
    
-   Milestone 8 Final Documentation, Ecosystem Launch, and Adoption Support: 2,500,000 CC upon final release and acceptance
    

### Volatility Stipulation

The project duration is greater than 6 months.

The grant is denominated in fixed Canton Coin and will require a re-evaluation at the 6-month mark.

----------

## Co-Marketing

Upon release, the implementing entity will collaborate with the Foundation on:

-   Announcement coordination
    
-   Case study or technical blog
    
-   Developer or ecosystem promotion
    

Specific commitments from AR Technology LLC:

-   Provide a technical blog post explaining the RFQ aggregator architecture and Canton-specific execution model
    
-   Provide a demo walkthrough for Canton ecosystem participants
    
-   Participate in a public or ecosystem-focused technical session if requested by the Foundation
    
-   Share integration documentation for wallets, dApps, DEXs, and liquidity providers
    
-   Support announcement coordination around major milestone completion or final release
    
-   Provide a final project summary that can be used by the Foundation for ecosystem education
    

----------

## Motivation

This proposal is valuable to the Canton ecosystem because liquidity access is a core requirement for useful financial applications.

As more assets, DEXs, liquidity providers, wallets, and institutional workflows come to Canton, liquidity may become fragmented. Without an aggregation layer, each application would need to build its own venue integrations, quote comparison logic, execution flow, and analytics. This creates duplicated work across the ecosystem.

A shared RFQ-based DEX aggregator can reduce this duplication and provide a reusable foundation for Canton-based DeFi and financial workflows.

Expected ecosystem impact includes:

-   Improved liquidity discovery for Canton users
    
-   Better execution quality through quote comparison
    
-   Reduced integration cost for wallets and dApps
    
-   Easier onboarding for DEXs and liquidity providers
    
-   A reusable RFQ API for ecosystem builders
    
-   A reference architecture for non-custodial swap execution on Canton
    
-   A foundation for future institutional RFQ and trading workflows
    
-   Increased utility for Canton-based assets
    

The portion of the ecosystem that could benefit is broad. Any Canton wallet, dApp, liquidity venue, tokenized asset application, or institutional workflow that needs swap execution or liquidity discovery could potentially use this infrastructure.

A reasonable target is that, after production readiness and partner integrations, a meaningful share of Canton DeFi-facing applications and wallets could either use the aggregator directly or reuse its API patterns and documentation. The project also benefits DEXs and liquidity providers by giving them a standardized path to receive RFQ flow from users and applications.

----------

## Rationale

The RFQ-based aggregator model is the right approach for Canton because it respects Canton’s privacy-aware architecture while still enabling efficient liquidity discovery.

A purely public-state AMM aggregator model assumes that all relevant venue state is globally readable and can be queried directly from the chain. That assumption may not be appropriate for Canton in all cases because privacy settings can limit access to real-time DEX state. RFQ-based quote discovery is better aligned with this environment because participating venues and liquidity providers can respond directly with executable quotes.

The proposed architecture separates quote discovery from settlement:

-   The backend coordinates RFQ requests, quote comparison, routing, analytics, and APIs.
    
-   The user remains responsible for reviewing and signing the accepted transaction.
    
-   The Daml execution layer validates accepted quote terms and coordinates atomic settlement.
    
-   The aggregator does not custody funds.
    

This separation improves safety, clarity, and modularity.

Several alternatives were considered:

1.  Direct wallet-to-DEX integrations only  
    This would avoid building an aggregator but would require every wallet or dApp to integrate separately with every liquidity venue. That creates repeated work and slows ecosystem adoption.
    
2.  A public-state-only aggregator  
    This may work in ecosystems where all DEX state is publicly readable, but it is less suitable for Canton’s privacy-aware architecture. It may also fail to support institutional RFQ workflows.
    
3.  A custodial trading service  
    This could simplify execution but would introduce custody risk, regulatory complexity, and trust assumptions. It is not the preferred approach for reusable ecosystem infrastructure.
    
4.  A backend-only quote comparison tool  
    This would help users compare quotes but would not solve execution. The proposed approach includes Daml-based execution logic so the flow can move from quote discovery to atomic settlement.
    

The preferred approach is therefore a non-custodial RFQ aggregator with Daml execution logic.

This proposal is designed to extend the Canton ecosystem rather than replace existing components. DEXs, liquidity providers, wallets, and dApps can integrate voluntarily. The aggregator can serve as shared infrastructure and documentation for liquidity workflows while allowing individual venues to keep their own execution models and business logic.

AR Technology LLC is also open to collaboration with Canton ecosystem participants and is interested in supporting the network through both technical development and operational infrastructure services.
