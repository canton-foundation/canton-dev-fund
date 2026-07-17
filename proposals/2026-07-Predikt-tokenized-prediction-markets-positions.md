# Development Fund Proposal

## Predikt Protocol Canton Integration: Tokenized Prediction Market Positions on Canton
| Field | Value |
| :---- | :---- |
| Author | Predikt by 4 Point O Labs |
| Status | Open |
| Created | 2026-07-17 |
| Label | defi-protocols |

## Project Links

| Resource | Link |
| :---- | :---- |
| Website | https://predikt.gg; https://4pto.io |
| Twitter | https://x.com/predikt_gg |
| Beta Platform | https://predikt.market |
| Demo Video | https://youtu.be/aPLVnOcc9ek |

# Abstract
Predikt is building infrastructure that turns fragmented prediction market exposure into **tokenized, composable DeFi assets**.

Prediction markets are one of the fastest-growing categories in event-driven finance, but today they remain fragmented across venues, chains, and isolated execution environments. Users can trade positions on platforms such as Polymarket, Kalshi, and Limitless, but those positions are generally trapped inside the venue where they were created. Liquidity cannot flow freely, and prediction market exposure is not easily usable across DeFi.

Predikt Protocol solves this by unifying access to prediction markets and tokenizing executed positions on the user’s source chain. Once represented as on-chain assets, prediction market positions can become portable financial primitives that may be traded, routed, collateralized, structured, or integrated into future yield strategies.

The proposed Canton integration would make Canton a supported source chain inside Predikt. Canton users would be able to access external prediction market liquidity while receiving Canton-native tokenized position representations created through Daml contracts. This gives Canton applications a new asset class to build around: event-based financial positions backed by external prediction market execution.

Predikt already supports Solana and Sui and EVM in beta, demonstrating market aggregation, AI-based market matching, execution, synthetic position representation, buy/sell flows, and redemption logic. The beta platform is live at https://predikt.market and includes a user-facing terminal where users can see how Predikt works today.

Extending this model to Canton would bring prediction market access and tokenized event-based assets into the Canton ecosystem, allowing Canton users to access a large and growing market category while enabling Canton projects to integrate these assets through Predikt’s API/SDK.

To deliver this integration, Predikt requests **468,800 Canton Coin (CC)** to design, implement, test, and prepare for beta rollout Canton support inside the existing Predikt Protocol architecture.

The goal is not to build a new prediction market on Canton. The goal is to make Canton a home for **tokenized prediction market positions** and enable a path from:

**Prediction Markets → Tokenized Positions → DeFi Composability**

# Specification
## 1. Objective
The objective of this proposal is to integrate Canton into Predikt Protocol as a supported source chain and enable Canton-native tokenized representations of external prediction market positions.

This integration will allow Canton users to:

- Connect a Canton-compatible wallet to Predikt
- View aggregated prediction market data from Polymarket, Kalshi, Limitless, and future venues
- Compare matched markets and best execution opportunities
- Initiate external prediction market positions from Canton
- Receive Canton-native tokenized representations of executed positions
- Track position state, market resolution, and redemption status
- Use tokenized prediction market positions as a foundation for future DeFi composability on Canton.
- Provide other Canton defi and consumer facing apps out of the box access to Prediction markets.
- Grow native Prediction Market use cases on Canton.

The first version will focus on:

- **Execution support:** Polymarket and Limitless
- **Data support:** Polymarket, Limitless, and Kalshi
- **Canton-native representation:** Daml contracts for tokenized prediction market positions
- **Developer access:** API/SDK support for Canton applications
- **Frontend support:** Canton wallet flow inside the Predikt beta terminal

This proposal intentionally focuses on tokenized position representation and cross-venue access. It does not attempt to build a new Canton-native prediction market, order book, or market creation protocol.

## 2. Current Predikt System
Predikt is currently live in beta at:

**https://predikt.market**

The beta platform includes a terminal where users can see how Predikt works today with supported source chains such as **Solana** and **Sui** *plus Arbitrum and Hyperliquid launching soon.*

The beta demonstrates:

- Aggregated markets from multiple prediction venues
- AI-matched markets across platforms
- Best odds and execution path calculation
- Cross-chain betting from supported source chains
- Synthetic position representation
- Position tracking
- Buy, sell, and redeem flows
- Market charts and analytics

This existing infrastructure gives Predikt a strong foundation for adding Canton as a new supported source chain. The Canton integration would extend the current chain adapter model and introduce Canton-specific Daml contracts for tokenized prediction market position representation.

# Predikt as a Public Good
Predikt’s value to Canton extends beyond the users of the Predikt platform itself. By creating shared infrastructure for accessing, executing, and representing prediction market positions, Predikt provides capabilities that can be reused across the Canton ecosystem rather than rebuilt separately by every application.

## Public Good for End Users
Prediction markets are fragmented across different venues, chains, wallets, and settlement environments. Predikt abstracts this complexity and gives Canton users a unified way to access this growing market category.

For end users, Predikt provides:

- **Broader market access:** Users can discover and compare markets from Polymarket, Limitless, Kalshi, and future supported venues through a single Canton-based experience.
- **Simplified participation:** Users do not need to independently navigate multiple chains, assets, wallets, and venue-specific interfaces.
- **Better market visibility:** Matched markets and pricing information allow users to compare available opportunities rather than viewing each venue in isolation.
- **Canton-native ownership:** Externally executed positions are represented through Daml contracts, giving users a clear and trackable position within Canton.
- **A foundation for additional utility:** Tokenized positions may later be supported by Canton wallets, portfolio tools, analytics products, and DeFi applications beyond Predikt.

The result is easier access to prediction markets without requiring users to understand or manage the full technical complexity behind each venue.

## Public Good for Integrators
Without shared infrastructure, every Canton application seeking to offer prediction market access would need to independently build market ingestion, normalization, matching, routing, execution, resolution tracking, and position-management systems.

Predikt gives integrators a reusable foundation through:

- **Unified market data:** A normalized view of markets from multiple prediction market venues.
- **Reusable execution infrastructure:** Access to venue-specific and cross-chain execution flows without rebuilding each integration from the ground up.
- **A shared Daml position model:** A consistent structure for representing ownership, exposure, execution details, resolution status, and redemption rights.
- **Opensourced API and SDK access:** A practical path for wallets, financial applications, dashboards, and consumer products to integrate prediction market functionality.
- **Documentation and reference materials:** Shared technical knowledge that reduces development time and lowers the barrier to experimentation.

This allows Canton developers to focus on the products and user experiences they want to create rather than repeatedly solving the same underlying infrastructure problems.

## Public Good for the Canton Ecosystem
Predikt brings more than an individual application to Canton. It introduces the infrastructure and asset representation needed for prediction markets to become a broader ecosystem primitive.

For Canton as a whole, the integration:

- **Introduces a new asset class:** Event-based financial positions become Canton-native programmable assets through Daml.
- **Connects Canton to existing liquidity:** Canton can access established external prediction market venues without first having to bootstrap a new market and liquidity base from zero.
- **Reduces duplicated development:** Shared infrastructure prevents multiple ecosystem teams from independently building and maintaining the same venue integrations.
- **Enables permissionless product innovation:** Canton applications can build new interfaces and financial products around the position model without Predikt needing to develop every use case itself.
- **Expands Canton’s utility:** Tokenized prediction market positions can support future analytics, portfolio management, institutional workflows, structured products, collateral systems, and other event-driven financial applications.
- **Liquidity Retention:** Upon completion of an execution loop (Buy Position -> Sell/Redemption) the liquidity is guaranteed to return to Canton Network.

Predikt’s role is therefore not to own every prediction market experience on Canton. Its role is to provide the common infrastructure that allows users, integrators, and ecosystem projects to access and build around prediction markets more efficiently.

# Implementation Mechanics
## 1. Canton Chain Adapter
Predikt will implement a Canton-specific chain adapter that allows the backend to communicate with Canton infrastructure and support Canton as a source chain.

This adapter will handle:

- Canton network connectivity
- Wallet and party identification flow
- Transaction preparation and submission
- Reading Daml contract state
- Tracking tokenized position lifecycle
- Coordinating settlement updates with Predikt’s backend

The adapter will fit into Predikt’s existing multi-chain infrastructure, which already supports Solana and Sui.

Canton is technically distinct from Predikt’s existing supported chains because of its Daml-based smart contract model. The implementation will therefore include a focused Canton-specific workstream rather than treating Canton as a standard EVM-style integration.

## 2. Daml Position Token Contracts
A dedicated Daml contract layer will be implemented to represent external prediction market positions on Canton.

When a user initiates a prediction market bet from Canton and the external execution is completed, Predikt will create a Canton-native tokenized position representation.

These position contracts should include:

- User party or owner
- External venue identifier
- Market identifier
- Outcome side, such as Yes or No
- Position size
- Execution price or odds metadata
- Market resolution status
- Redeemable claim state
- Position lifecycle state
- Optional metadata for future composability

The initial Daml workstream will stay narrow and reviewable. It will not attempt to implement a full Canton-native prediction market protocol. The goal is to represent externally executed positions as Canton-native assets.

This is the core Canton-specific innovation of the proposal.

## 3. Market Data and Aggregation Integration
Predikt will expose aggregated prediction market data to Canton users through the existing Predikt data and aggregation layer.

The Canton-facing interface will include:

- Polymarket market data
- Limitless market data
- Kalshi market data for odds and comparison
- AI-matched markets across venues
- Best odds and execution path information
- Market metadata, volume, liquidity, and status

For the initial scope, execution will be enabled for Polymarket and Limitless, while Kalshi will be included at the data and aggregation level.

This gives Canton users visibility into broader prediction market pricing while keeping the first execution scope technically manageable.

## 4. Cross-Chain Execution and Asset Bridging Flow
Predikt’s infrastructure coordinates trade execution across supported external venues while maintaining Canton as the primary source chain for the user.

The execution sequence for the Canton integration follows these steps:

- User initiates a position from the Predikt terminal using a Canton session
- The protocol prepares the required execution request
- Internal routing logic identifies the optimal destination venue
- Capital is bridged from Canton to the target execution environment
- Trade execution is finalized on the external prediction market platform
- Confirmed execution triggers the creation of a Canton-native tokenized position via Daml
- User monitors and manages the asset directly from their Canton party

Execution occurs on external networks where deep liquidity is established, specifically **Polygon for Polymarket** and **Base for Limitless**. This architecture necessitates a robust and secure bridging pathway between Canton and these external execution environments.

The outbound routing from Canton to Polygon or Base follows this path:

- Canton USDCx
- Burn or withdrawal via Circle xReserve
- Release of Ethereum native USDC
- Transfer through CCTP or Circle Gateway
- Receipt of Polygon/Base native USDC

Potential optimizations through xReserve forwarding could further streamline this process. If supported, the protocol could trigger direct USDC releases on Polygon or Base immediately following a Canton burn, reducing friction in the end-to-end user experience.

The inbound return path to Canton is structured as follows:

- Polygon/Base native USDC
- Transfer through CCTP or Circle Gateway
- Receipt of Ethereum native USDC
- Deposit into Circle xReserve
- Minting of USDCx on Canton

This flow routes capital back through Ethereum into xReserve, allowing market proceeds, sell actions, and settlement payouts to be represented as native assets on Canton.

This design prioritizes Canton as the coordination hub while leveraging established global liquidity pools. By utilizing Daml position contracts, Predikt creates portable, Canton-native representations of event-based exposure without the immediate need for a native prediction market venue.

## 5. Resolution and Claim Flow
When an external prediction market resolves, Predikt will track the result through the venue’s existing resolution mechanisms.

The Canton integration will support:

- Market resolution tracking
- Updating Canton position state
- Claim eligibility
- User-facing claim flow
- Position closure after redemption

The initial implementation will focus on correctness and transparency rather than complex secondary market features.

Future phases may extend this foundation into more advanced DeFi functionality once tokenized position assets are live on Canton.

## 6. Canton Wallet and Frontend Integration

Predikt will extend the frontend to support Canton wallet connection and Canton-based user flows.

This includes:

- Canton wallet connection
- User party identification
- Market browsing from a Canton user session
- Buy flow from Canton
- Display of Canton-native tokenized positions
- Position status tracking
- Claim or redeem flow after market resolution

The goal is to make Canton feel like a native source chain inside Predikt, rather than a separate or manually managed workflow.

# Architectural Alignment with Canton
This proposal aligns with the Canton ecosystem in several ways.

First, it brings a fast-growing external use case, prediction markets, into the Canton application environment. Canton users gain access to global prediction market liquidity without requiring each Canton application to build its own venue-specific integrations.

Second, it uses Daml for the Canton-native portion of the system. External prediction market positions are represented through Daml contracts, allowing Canton to become the source chain and position environment for event-based assets.

Third, it supports composability. Once prediction market positions are represented on Canton, future Canton applications can be built around them. This could include dashboards, portfolio tooling, structured products, risk products, lending markets, or other DeFi applications.

Fourth, it extends Canton’s role as a coordination and settlement environment for real-world event-based financial activity. Prediction market positions are naturally tied to real-world outcomes, and Canton’s architecture is well-suited for applications that require structured state, clear ownership, and controlled workflows.

In short, the integration gives Canton both:

- access to external prediction market liquidity today
- a foundation for tokenized event-based DeFi assets tomorrow

# Explicit Non-Goals
This proposal is intentionally scoped to a Canton integration for Predikt Protocol’s existing product architecture.

It does not include:

- Building a new prediction market protocol on Canton
- Creating user-generated markets
- Building a full Canton-native order book for prediction markets
- Supporting every prediction market venue at launch
- Implementing leverage, copy trading, pools, or advanced structured products in the first scope
- Building a full lending or yield protocol for tokenized prediction market positions in this grant
- Fully open-sourcing the entire Predikt product stack

These are potential future directions, but they are intentionally excluded from this proposal to keep the first Canton integration focused and deliverable.

# Milestones and Deliverables
The project is scoped for delivery within approximately **8 weeks**. Each milestone is narrowly defined to keep the work focused, reviewable, and practical for a Canton integration.

## Milestone 1: Canton Integration Design and Daml Position Contract Specification
|  |  |
| :---- | :---- |
| **Timeline** | Weeks 1–2 |
| **Estimated Cost** | $9,400 |
| **Funding Equivalent** | 75,200 CC |

#### Resource Allocation
- **Week 1:** 1 FTE
  - 1x BE / Blockchain Engineer
- **Week 2:** 2 FTE
  - 1x BE / Blockchain Engineer
  - 1x Backend Engineer

### Focus
Define the Canton integration architecture and finalize the Daml contract model for tokenized prediction market positions.

### Deliverables
- Canton integration architecture document
- Daml contract specification for tokenized prediction market positions
- Definition of the position lifecycle, including creation, active state, resolution state, and redemption state
- Mapping between external prediction market execution and Canton-native position contracts
- Backend and frontend integration plan for Canton support
- Risk review covering execution, settlement, position accounting, and user state management
- Initial DeFi composability considerations for future Canton applications

### Value Metrics
- Clear implementation plan for Canton support
- Reviewable Daml contract model
- Narrow and practical first-scope integration design
- Alignment with Predikt’s existing multi-chain architecture
- Clear separation between initial tokenized position support and future DeFi composability extensions

## Milestone 2: Daml Contracts, Canton Backend Adapter, and Wallet Flow
|  |  |
| :---- | :---- |
| **Timeline** | Weeks 3–5 |
| **Estimated Cost** | $21,600 |
| **Funding Equivalent** | 172,800 CC |

#### Resource Allocation
- **Weeks 3–4:** 2 FTE
  - 1x BE / Blockchain Engineer
  - 1x Backend Engineer
- **Week 5:** 3 FTE
  - 1x BE / Blockchain Engineer
  - 1x Backend Engineer
  - 1x Frontend Engineer

### Focus
Implement the core Canton infrastructure required to support tokenized prediction market positions and Canton user interaction.

### Deliverables
- Daml implementation of tokenized position contracts
- Unit tests for position creation, state updates, and redemption logic
- Canton backend adapter integrated into Predikt’s chain abstraction layer
- Backend support for reading and writing Canton contract state
- Canton wallet connection flow in the Predikt frontend
- User party identification and Canton session handling
- Internal test environment for Canton-originated prediction market flow

### Value Metrics
- Canton is supported as a source chain inside Predikt’s backend architecture
- Tokenized prediction market positions can be created and tracked on Canton
- Canton users can connect to Predikt and browse supported markets
- Contract behavior is validated through tests
- Backend can reliably communicate with Canton infrastructure

## Milestone 3: Canton Execution Flow, Resolution, Documentation, and Beta Readiness
|  |  |
| :---- | :---- |
| **Timeline** | Weeks 6–8 |
| **Estimated Cost** | $27,600 |
| **Funding Equivalent** | 220,800 CC |

#### Resource Allocation
- **Weeks 6–8:** 3 FTE
  - 1x BE / Blockchain Engineer
  - 1x Backend Engineer
  - 1x Frontend Engineer

### Focus
Complete the end-to-end user flow from Canton into external prediction market venues and prepare the integration for beta testing.

### Deliverables
- Canton-originated execution flow into Polymarket
- Canton-originated execution flow into Limitless
- Aggregated market data access for Canton users, including Polymarket, Limitless, and Kalshi
- Display of matched markets and best execution information inside the Predikt interface
- Creation of Canton-native tokenized positions after external execution
- Transaction status tracking and error handling
- Market resolution tracking and redeem/claim flow
- End-to-end demo showing Canton users accessing and executing prediction market positions
- Developer and user-facing documentation
- Rollout plan for beta release and ecosystem announcement

### Value Metrics
- At least **20 successful Canton-originated test executions**
- Successful creation of Canton-native tokenized position representations after external execution
- Users can complete the flow from market discovery to execution to position tracking
- Resolved positions can be claimed or closed
- No critical fund safety or position accounting failures in test flows
- Canton integration is ready for beta rollout inside Predikt

## Timeline Summary
| **Milestone**                                                              | **Timeline**  | **Duration** |
|----------------------------------------------------------------------------|---------------|--------------|
| Milestone 1: Design and Daml Contract Specification                        | Weeks 1–2     | 2 weeks      |
| Milestone 2: Daml Contracts, Backend Adapter, and Wallet Flow              | Weeks 3–5     | 3 weeks      |
| Milestone 3: Execution Flow, Resolution, Documentation, and Beta Readiness | Weeks 6–8     | 3 weeks      |
| **Total**                                                                  | **Weeks 1–8** | **8 weeks**  |

# Acceptance Criteria
Completion will be evaluated based on:

- Delivery of milestone-specific artifacts
- Demonstrated Canton wallet and user flow
- Working Daml position contract implementation
- Successful integration of Canton into Predikt’s backend chain adapter framework
- Successful market discovery and aggregation for Canton users
- Successful execution from Canton into supported prediction market venues
- Correct representation of external positions on Canton
- Successful resolution and claim flow
- Documentation and demo materials provided

Project-specific acceptance criteria include:

- Canton users can connect to Predikt
- Canton users can view matched prediction markets across venues
- Canton users can initiate execution into at least Polymarket and Limitless
- Canton-native tokenized positions are created after execution
- Position state is visible in the Predikt interface
- Resolved positions can be claimed or closed
- The integration is documented for future maintenance and extension
- Canton applications can understand and reference the position representation model for future SDK/API integrations

## Resource Allocation and Budget Assumptions
The project budget is based on the following staffing plan and rate assumptions:

| **Resource**             | **Allocation** | **Rate**  | **Weekly Hours** |
|--------------------------|----------------|-----------|------------------|
| BE / Blockchain Engineer | Weeks 1–8      | $80/hour | 40 hours/week    |
| Backend Engineer         | Weeks 2–8      | $75/hour | 40 hours/week    |
| Frontend Engineer        | Weeks 5–8      | $75/hour | 40 hours/week    |

### Weekly Cost Breakdown
| **Week**  | **Resources**                      | **Weekly Cost** |
|-----------|------------------------------------|-----------------|
| Week 1    | 1x BE / Blockchain                 | $3,200         |
| Week 2    | 1x BE / Blockchain + 1x BE         | $6,200         |
| Week 3    | 1x BE / Blockchain + 1x BE         | $6,200         |
| Week 4    | 1x BE / Blockchain + 1x BE         | $6,200         |
| Week 5    | 1x BE / Blockchain + 1x BE + 1x FE | $9,200         |
| Week 6    | 1x BE / Blockchain + 1x BE + 1x FE | $9,200         |
| Week 7    | 1x BE / Blockchain + 1x BE + 1x FE | $9,200         |
| Week 8    | 1x BE / Blockchain + 1x BE + 1x FE | $9,200         |
| **Total** |                                    | **$58,600**    |

## Funding

- **Total Funding Request:** $58,600
- **Canton Coin Assumption:** 1 CC = $0.125
- **Total Funding Request in Canton Coin:** 468,800 CC

The request reflects:

- Canton and Daml integration work
- Backend adapter development
- Frontend wallet and user flow implementation
- External execution coordination
- Testing and validation
- Documentation and rollout preparation
- Design work required to represent external prediction market positions as Canton-native tokenized assets

## Payment Breakdown by Milestone
| **Milestone**                                                              | **USD Amount** | **CC Equivalent** | **Trigger**                                            |
|----------------------------------------------------------------------------|----------------|-------------------|--------------------------------------------------------|
| Milestone 1: Integration Design and Daml Contract Specification            | $9,400         | 75,200 CC          | Delivery of architecture and contract specification    |
| Milestone 2: Daml Contracts and Backend Adapter                            | $21,600        | 172,800 CC         | Contract implementation and backend adapter validation |
| Milestone 3: Execution Flow, Resolution, Documentation, and Beta Readiness | $27,600        | 220,800 CC         | Full lifecycle demo and rollout package                |
| **Total**                                                                  | **$58,600**    | **468,800 CC**     | **Completion of 8-week Canton integration scope**      |

# Team and Relevant Experience: [4 Point O Labs](https://www.4pto.io/)
Predikt is developed by **4 Point O Labs**, a Web3 product and engineering house out of EU focused on infrastructure, DeFi, cross-chain systems, and non-EVM ecosystems.

4 Point O Labs has worked with several foundations, infrastructure teams, and ecosystem projects as a technical delivery partner. This work typically includes supporting teams with protocol integrations, product development, ecosystem tooling, wallet integrations, cross-chain infrastructure, and grant-aligned technical execution.

The team has contributed across multiple ecosystems, including **NEAR Protocol, Solana, Sui Network, Stellar, Aptos, Chainlink, Wormhole, Axelar, Dfinity**, and others. While 4 Point O Labs has experience across EVM ecosystems, a significant part of the team’s work has focused on **non-EVM environments**, where execution models, wallet flows, smart contract languages, and infrastructure patterns differ meaningfully from standard Solidity-based development.

This background is directly relevant to Canton. Canton’s Daml-based smart contract model is distinct from EVM-style development and benefits from teams that are comfortable working with strongly typed, deterministic, functional contract paradigms. 4 Point O Labs has prior experience with functional-programming-based smart contract environments, including:

- **Kadena / Pact** — development of Pact-based DeFi and cross-chain infrastructure
- **Aeternity / Sophia** — work with a smart contract language influenced by the OCaml/ML functional programming family
- **Daml / DAML-adjacent readiness** — Daml follows a Haskell-inspired functional programming model, with strong typing, declarative contract logic, and deterministic execution principles

While Pact, Sophia, and Daml are different languages, this experience reduces the learning curve for Canton-specific development because the team is already familiar with functional smart contract design, explicit state transitions, strongly typed workflows, and non-EVM execution assumptions.

Relevant public examples of prior work include:

- **Aeternity MetaMask Snap** — enabling wallet interaction with the Aeternity ecosystem
  https://snaps.metamask.io/snap/npm/aeternity-snap/plugin/

- **Karbon** — a Pact-based perpetual DEX built on Kadena
  https://github.com/4-point-0/karbon

- **Hyperlane integration for Kadena** — Pact-based relayer and validator signing work
  https://github.com/4-point-0/hyperlane-monorepo

- **Kinesis Bridge** — cross-chain infrastructure connecting Kadena with external networks

More broadly, the 4 Point O Labs team has experience building complex DeFi and infrastructure systems, including DEXs, perpetuals, lending protocols, vault architectures, RFQ-based trading systems, wallet infrastructure, and cross-chain execution infrastructure.

This experience is particularly relevant to the Canton integration because the proposed work combines several areas where 4 Point O Labs has existing delivery depth:

- Non-EVM chain integration
- Functional smart contract development
- Cross-chain execution coordination
- Tokenized position representation
- Wallet and user flow integration
- DeFi-oriented product architecture
- Developer-facing API and SDK support

For Canton, this makes 4 Point O Labs well-positioned not only to deliver the Predikt integration, but also to support future Canton ecosystem teams that may want to build around tokenized prediction market positions, Daml-based financial contracts, RFQ-style liquidity systems, or other programmable market structures.

Predikt itself reflects this broader technical thesis. The product is being built as a cross-chain liquidity and execution layer for prediction markets, designed to aggregate fragmented event-based liquidity, identify matched markets across venues, route execution efficiently, and represent resulting positions as composable on-chain assets.

Within Canton, this creates a strong fit: Predikt can bring access to external prediction market liquidity while Canton’s Daml model can provide a structured environment for representing event-based financial positions, programmable workflows, and future DeFi composability.

# Co-Marketing
Upon successful completion, Predikt will collaborate with the Canton Foundation on:

- Announcement of Canton support inside Predikt
- Technical blog explaining how Canton users can access external prediction market liquidity
- Demo video showing Canton-originated prediction market execution
- Educational content around tokenized prediction market positions
- Ecosystem distribution through Canton community channels
- Partner outreach to Canton applications that may want to integrate Predikt’s Canton-supported prediction market access
- Case study on how external prediction market positions can become Canton-native assets

# Motivation
Prediction markets are growing quickly, but their current architecture limits their broader financial utility.

Most prediction market positions today are trapped inside the platform where they are created. Even when the market itself is liquid, the resulting position is not easily portable or composable. A user can buy, sell, or redeem inside the original venue, but cannot easily use that position elsewhere in DeFi.

This is the same limitation DeFi solves for many other assets: once an asset becomes tokenized, programmable, and composable, new financial applications can be built around it.

Predikt applies this logic to prediction markets.

By integrating Canton, Predikt would allow external prediction market exposure to be represented as Daml-based position contracts. This gives Canton users access to prediction market liquidity today, while creating the foundation for a broader DeFi layer around event-based assets tomorrow.

The motivation is therefore twofold:

1.  Bring Canton users access to a large and rapidly growing prediction market industry.
2.  Introduce tokenized prediction market positions as a new composable primitive for Canton applications.

This makes the integration valuable beyond simple trading access. It creates infrastructure for future Canton-native financial products built on top of real-world event exposure.

# Rationale
The key design choice is to avoid building a new prediction market on Canton and instead connect Canton to existing venues where liquidity already exists.

This reduces liquidity bootstrapping risk and allows Canton users to access established prediction markets immediately. At the same time, the Canton-specific component remains meaningful: external positions are represented through Daml contracts, making them visible, trackable, and composable inside Canton.

The architecture separates responsibilities clearly:

- Predikt’s data layer aggregates and matches prediction markets
- Predikt’s execution layer coordinates external venue execution
- Canton acts as the source chain and position representation environment
- Daml contracts represent the user’s prediction market exposure
- Canton applications can build around these tokenized positions through SDK/API access

This approach keeps the grant scope focused while still delivering a strategically important outcome: bringing prediction market exposure into Canton as a new DeFi primitive.

In the short term, users gain access to external prediction markets.
In the long term, Canton gains a foundation for event-based DeFi applications.

# Maintenance and Sustainability
Predikt will maintain the Canton integration as part of its ongoing product roadmap. The integration will become part of Predikt’s supported chain infrastructure alongside Solana and Sui.

Future extensions may include:

- Additional prediction market venues
- More advanced routing logic
- Canton-native composability for tokenized positions
- Integrator API support for Canton applications
- Expanded buy, claim, sell, and position management flows
- Yield products around tokenized prediction market positions
- Lending or collateral use cases for resolved or active positions
- Structured products built around event-based exposure

The project is commercially sustainable because Canton support increases Predikt’s addressable market and gives Canton users and applications access to prediction market liquidity through a product that is already being developed and maintained.

# Summary
Predikt Protocol brings prediction markets into DeFi by turning externally executed market positions into tokenized, composable assets.

For Canton, this proposal creates a clear path to:

- Give Canton users access to global prediction market liquidity
- Represent external prediction market positions through Daml contracts
- Introduce a new class of event-based assets into the Canton ecosystem
- Allow Canton applications to integrate prediction market access through Predikt’s SDK/API
- Establish the foundation for future DeFi use cases around prediction market positions

**Markets are fragmented. Liquidity cannot flow. Predikt unifies access and turns prediction market positions into DeFi-native assets.**
