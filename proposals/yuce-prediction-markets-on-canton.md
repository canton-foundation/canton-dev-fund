# Proposal: YUCE Prediction Markets on Canton

Author: YUCE Team

Status: Draft

Created: 2026-03-18

# **Abstract**

YUCE is a prediction market platform built on Canton Network, centered around two core market types: Price Prediction and Event Prediction. The platform allows users to participate in markets based on price movements or event outcomes, and upon settlement, complete actions such as viewing results, claiming rewards, and managing funds.

This proposal requests development funding in the form of CC equivalent to USD 250,000 to support YUCE’s initial product buildout and market launch. The project will first launch a complete product loop for BTC-based price prediction, then expand to additional timeframes and additional predictable assets, followed by the launch of event prediction markets, with product value validated through real user participation, trading activity, and market operation results.

The milestones covered by this proposal focus on YUCE’s near-term deliverable stages. These stages do not represent the full scope of YUCE’s ultimate goals, but rather the first execution path within its long-term vision. YUCE’s broader long-term direction is to evolve from price prediction and event prediction into a prediction finance platform and future decision infrastructure serving markets, projects, and institutions.

Upon completion, YUCE will provide the Canton ecosystem with an operational, configurable, and sustainably extensible prediction market infrastructure, creating a new interaction layer and application scenario for ecosystem assets, project events, and user participation behavior, while also demonstrating Canton’s capabilities in supporting persistent applications, market-based interactions, and operational product structures.

# **Specification**

**1. Objective**

The objective of this project is to launch a prediction market platform within the Canton ecosystem with a complete business loop, enabling users to participate around price movements and event outcomes and complete the full journey from browsing, decision-making, and participation to waiting for settlement, viewing results, claiming rewards, and managing funds.

The key priorities of this phase include:

- Establishing a complete BTC-based price prediction market loop
- Building the foundational capabilities required for user participation, including account, security, rewards, and wallet
- Expanding price prediction markets to more timeframes and more assets
- Launching event prediction markets to form a dual-market structure
- Establishing the necessary operational and configuration capabilities to support continuous market operations

This proposal is not only concerned with product launch, but also with actual post-launch usage results, including user growth, trading activity, market settlement operations, and participation depth.

**2. Implementation Mechanics**

YUCE will be built across the user-facing product, business processing logic, and backend operations and configuration capabilities, forming a coherent product and operational loop.

On the user side, the platform will provide an account and security system, price prediction markets, event prediction markets, as well as rewards, wallet, history, settings, and rules modules, enabling users to complete the full process from prediction participation to result handling and fund management.

On the backend side, the platform will provide event operation capabilities and platform-level configuration capabilities, enabling operators to manage event creation and settlement flows, and administrators to manage assets, fees, event categories, security policies, and related rule parameters.

The overall product design emphasizes the following principles:

- Configuration-driven
- Clear states
- Executable interactions
- Security-first
- Sustainable operations

**3. Architectural Alignment**

YUCE’s alignment with the Canton ecosystem is reflected in several key aspects.

First, YUCE introduces an application form characterized by continuous participation. Prediction markets inherently involve continuous updates, continuous participation, and continuous feedback, which can help bring a more stable rhythm of user engagement to the ecosystem.

Second, YUCE provides new mechanisms for expression and participation around ecosystem assets, projects, and events. Price movements, project progress, governance outcomes, and other verifiable events can all become objects of user participation and judgment, thereby generating new application-layer activity and interaction scenarios.

Third, YUCE is not a single-page or single-point feature. It is a complete business system covering account security, state transitions, result processing, reward claiming, wallet interactions, and backend operations. Products of this kind better demonstrate Canton’s ability to support complex, persistent applications.

Over the longer term, YUCE aims to leverage Canton’s privacy-preserving architecture, compliance-oriented foundation, and ecosystem scalability to gradually extend from a prediction market application into broader prediction finance and decision validation scenarios, allowing market mechanisms to serve not only as tools for expressing views, but also as mechanisms for higher-quality risk pricing, expectation management, and future path validation.

This proposal focuses on application-layer product development. It does not involve modifications to underlying protocol rules, nor does it require mandatory changes to existing network behavior.

**4. Backward Compatibility**

No backward compatibility impact.

This project introduces new application capabilities and does not impose mandatory compatibility changes on existing systems, current integration flows, or current ecosystem applications.

# **Milestones and Deliverables**

**Milestone 1: BTC Price Prediction Launch and Initial Market Validation**

Estimated Delivery: Within 2 months after proposal approval

Focus:

Complete the launch of the core BTC price prediction loop and generate initial real user participation and market settlement data.

Deliverables:

- Launch the core BTC price prediction market functionality
- Build the foundational capabilities required for user participation, including account, security, rewards, wallet, and records loop
- Complete the necessary first-phase platform configuration capabilities
- Achieve stable operation and settlement of the initial price prediction rounds

Value Metrics:

- 500+ registered users
- 150+ valid users who complete security setup and actively participate in prediction
- 1,500+ cumulative prediction participation transactions
- 50+ settled BTC price prediction rounds
- $50,000+ cumulative prediction participation value

**Milestone 2: Multi-Asset, Multi-Period Price Prediction Expansion and Activity Growth**

Estimated Delivery: Within 2 months after Milestone 1 acceptance

Focus:

Expand price prediction from a single BTC market to multi-asset, multi-timeframe markets, and validate higher levels of user activity and trading speed.

Deliverables:

- Expand price prediction markets to multiple timeframes
- Expand to multiple predictable assets
- Improve market configuration capabilities, market quantity, and participation depth
- Enhance filtering, display, and continuous operational capabilities for price prediction markets

Value Metrics:

- 1,500+ cumulative registered users
- 400+ cumulative valid participating users
- 6,000+ cumulative prediction participation transactions
- 200+ cumulative settled price prediction rounds
- 3+ active prediction assets
- 3+ active timeframes
- $150,000+ cumulative prediction participation value

**Milestone 3: Event Prediction Market Launch and Dual-Market Validation**

Estimated Delivery: Within 3 months after Milestone 2 acceptance

Focus:

Launch event prediction markets and validate dual-market activity and operational capacity under the parallel operation of price prediction and event prediction.

Deliverables:

- Launch the core event prediction market functionality
- Establish operational workflows for event creation, result publication, and settlement triggering
- Complete integration between event prediction and the account, rewards, wallet, and history systems
- Validate real usage results and operational feasibility under a dual-market structure

Value Metrics:

- 3,000+ cumulative registered users
- 800+ cumulative valid participating users
- 12,000+ cumulative platform participation transactions
- 12+ launched and settled event markets
- 400+ cumulative settled price prediction rounds
- $250,000+ cumulative platform participation value
- Continuous operation of both price prediction and event prediction markets

# **Acceptance Criteria**

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone
- Demonstrated functionality or operational readiness
- Documentation and knowledge transfer provided
- Alignment with stated value metrics

Additional project-specific acceptance conditions:

1. Users must be able to complete the full process from account creation, market participation, and waiting for settlement to viewing results, claiming rewards, and managing funds
2. All sensitive operations must pass security verification before execution
3. The platform’s main market state transitions must be demonstrable in practice
4. The platform must have the corresponding operational and configuration capabilities to support continuous market operation
5. In addition to feature launch, each stage of acceptance must also take into account user participation, trading activity, or market operation results
6. Necessary documentation and knowledge transfer materials must be provided upon delivery to support acceptance and subsequent operations
7. Metrics involving participation volume may be evaluated in USD terms based on the CC reference price used at the time of acceptance

# **Funding**

Total Funding Request: CC equivalent to USD 250,000

**Payment Breakdown by Milestone**

- Milestone 1 (BTC Price Prediction Launch and Initial Market Validation): CC equivalent to USD 75,000, payable upon committee acceptance
- Milestone 2 (Multi-Asset, Multi-Period Price Prediction Expansion and Activity Growth): CC equivalent to USD 87,500, payable upon committee acceptance
- Milestone 3 (Event Prediction Market Launch and Dual-Market Validation): CC equivalent to USD 87,500, payable upon final release and acceptance

**Volatility Stipulation**

If the project timeline extends beyond 6 months due to scope adjustments requested by the committee, the remaining milestone CC amount should be renegotiated based on the then-current reference price to reflect the impact of significant price volatility.

# **Co-Marketing**

Upon release, the implementing entity will collaborate with the Foundation on:

- Announcement coordination
- Case study or technical blog
- Ecosystem promotion
- Product demonstration materials suitable for ecosystem-facing communication

# **Motivation**

YUCE’s value to the Canton ecosystem is primarily reflected across three levels.

First, it adds an application form characterized by continuous participation. Prediction markets naturally feature continuous updates, continuous participation, and continuous feedback, which can introduce higher-frequency user interactions and richer behavioral data to the ecosystem.

Second, it provides new participation and expression mechanisms for assets, projects, and events within the ecosystem. Price movements, project progress, specific events, and ecosystem topics can all become objects of user participation, judgment, and validation, thereby generating new application-layer activity and interaction scenarios.

Third, it validates Canton’s suitability for complex application structures. YUCE is not a single-point interface, but a complete business system covering account security, state management, result processing, reward claiming, wallet interactions, operations backend, and configuration management, better demonstrating Canton’s ability to support operational and extensible applications.

From a longer-term perspective, the account system, state system, reward system, and market structure established by YUCE will also provide a foundation for richer future prediction applications and ecosystem collaboration scenarios.

# **Rationale**

This proposal adopts an approach of “phased product development with funding unlocked progressively based on usage results,” because this structure is more aligned with the practical nature of prediction market products.

For products of this type, judging funding solely based on whether functionality has been deployed is insufficient. What truly demonstrates product value is not only whether the features are live, but also whether users participate, whether markets are active, whether transactions occur, whether settlement is stable, and whether the platform develops the capacity for ongoing operation.

Accordingly, this proposal preserves a clear staged product path: first establishing the BTC price prediction loop, then expanding price prediction markets, and finally launching event prediction markets. However, in terms of funding unlock, it places greater emphasis on results related to actual adoption and velocity, including valid users, participation transactions, participation value, and market operation performance.

At the same time, it should be made clear that the milestones in this proposal focus on YUCE’s near-term execution path rather than its full boundary. This phased breakdown is intended to first deliver the clearest, most executable, and most easily verifiable stages of product value, and then continue to expand from there. The near-term milestones solve the problem of “getting the core markets running,” while the long-term vision is “making prediction markets a higher-order information and decision infrastructure.”

# **Core Team and Advisory Strength**

YUCE is supported by a team and advisor network with deep experience across financial infrastructure, trading systems, institutional operations, crypto investment, ecosystem strategy, and emerging market development.

This combination gives YUCE a practical advantage: it is not being built merely as a conceptual prediction product, but as a platform with operational, technical, and strategic foundations that can expand simultaneously toward both crypto-native and institutional-grade scenarios.

**1. Core Advisors**

Joe Eagon

CEO and Co-Founder of Anagram, and former President of Polychain Capital. Joe brings deep experience in crypto investment, market structure, and the long-term evolution of digital asset ecosystems.

Nick White

COO of Celestia Labs, one of the earliest teams to propose modular blockchain architecture. Nick brings broad ecosystem insight in blockchain infrastructure, growth strategy, and network development.

AlexD

CEO and Co-Founder of AZ DAG, and also an advisor to the Vietnam fintech ecosystem. He brings valuable perspectives in emerging market fintech adoption, regulation-oriented innovation, and regional ecosystem development.

Agnes Budzyn

CEO and Co-Founder of Autonomy; former Managing Director at ConsenSys, former executive at BlackRock, and board member of the Biden Institute. Agnes brings strong cross-sector experience spanning institutional finance, Web3 strategy, policy, and governance.

Jeff Pan

Partner at SoftBank China and founding member of Alibaba’s strategic investment division. Jeff has extensive experience in strategic investment, ecosystem expansion, and identifying high-growth technology opportunities.

Jefferson Chen

Partner at GSR Venture and CEO and Co-Founder of Advance AI, which has scaled to Series D. Jefferson brings substantial experience in fintech infrastructure, entrepreneurship, and scaling technology companies in Asia.

Justin Huang

CEO and Co-Founder of Asymmetries, a crypto hedge fund managing approximately USD 500 million. Justin provides important perspectives in institutional crypto investing, risk management, and market strategy.

Madao

Founder of YIN Finance, Co-Founder of Grap Finance, and YFII multisig key owner. He has long been active on-chain and is also a white-hat hacker, with hands-on experience in DeFi mechanisms, protocol security, and crypto-native market behavior.

**2. Core Team**

Lionel — Co-Founder

Currently CEO and Founder of Desyn. Desyn is one of the leading on-chain liquidity infrastructure platforms, supporting approximately USD 1.8 billion in trading volume / value flow across multiple chains and protocols. Lionel also previously served as Group COO and China CEO of Lightnet Group, backed by Thailand’s Charoen Pokphand Group; CSO and Partner at the public company Yeahmobi; and previously worked at Baidu, BlackRock, and Tudor Investment. Lionel has also been an advisor to and investor in crypto social trading platforms such as Kikitrade and BingX.

His background combines institutional finance, operational management, trading-related business experience, global growth capability, and hands-on crypto market experience, providing YUCE with strong execution in strategy, partnerships, commercialization, and ecosystem expansion.

Donnie — Co-Founder

Former CTO of Bluestone Securities, Founder of Blockchain Vibe Tech, former CTO of Formax Fintech, and previously a senior architect at major technology companies including Tencent and Xunlei. He was also a core builder of the first-generation forex copy trading system at Formax and the first-generation crypto copy trading system at BingX.

Donnie brings deep expertise in trading infrastructure, exchange-grade system architecture, fintech engineering, and large-scale technical execution, forming a strong foundation for YUCE’s market engine and future platform expansion.

**3. Why This Matters for YUCE**

YUCE sits at the intersection of prediction markets, financial infrastructure, crypto-native participation, institutional usability, and long-term ecosystem integration. Building such a platform requires more than product design capability. It also requires:

- Deep market understanding
- Strong trading and settlement system capabilities
- Ecosystem resources and partnership leverage
- Institutional-level credibility
- Experience across both traditional finance and crypto-native environments

The combined strength of YUCE’s advisors and core team will help the platform not only execute effectively in its early product delivery stage, but also gain advantages in longer-term projectization, institutionalization, and infrastructure-scale expansion.

# **Long-Term Vision and Future Roadmap Context**

The three milestones in this proposal cover YUCE’s clearest and most executable near-term stages: first establishing the price prediction loop, then expanding to multi-asset, multi-timeframe price prediction, and then launching event prediction markets. The purpose of this sequencing is to prove product usability, market operability, and user willingness to participate through the shortest verifiable path.

However, in the long term, YUCE’s goal is not limited to a price prediction or event prediction application.

YUCE’s broader vision is to gradually build a decentralized, compliant, and privacy-preserving Global Awareness Layer. In this layer, distributed judgments, expectations, and collective intelligence are not only expressed, but are continuously quantified, validated, and accumulated through market mechanisms, ultimately transforming into higher-quality forward-looking signals and decision-support capabilities.

Within this long-term framework, YUCE will gradually explore and advance the following directions:

**1. From Single-Outcome Markets to Conditional Prediction Markets**

YUCE’s long-term direction is not only to answer “whether something will happen,” but also “if something happens, what will happen next.” This means the platform can gradually move toward conditional prediction, causal expression, and more complex result-structure markets.

**2. From Trading Scenarios to Project and Institutional Scenarios**

YUCE is intended not only to serve individual users making judgments about prices and events, but also to serve project teams, communities, funds, market makers, and ecosystem partners. In the future, the platform can provide higher-value market-based validation tools around project milestones, governance expectations, strategic execution, and ecosystem collaboration.

**3. From Product Features to Platform Capabilities**

As price prediction and event prediction mature, YUCE can further extend into broader platform capabilities, including:

- Milestone Futures
- Governance Prediction
- Conditional Vesting Markets
- Launch-stage / Growth-stage / Maturity-stage Prediction Tools
- Open APIs
- Data Services
- White-label / Dedicated Deployments

These directions are not part of the near-term delivery scope of this proposal, but they form YUCE’s longer-term platform evolution path.

**4. From Application-Layer Participation to Decision Validation Infrastructure**

YUCE’s long-term goal is not merely to allow users to express opinions on outcomes, but to make prediction markets into a higher-order information and decision validation infrastructure. In this system, prediction markets are no longer just tools for trading outcomes, but mechanisms that help projects, institutions, and ecosystems obtain market-based feedback earlier, conduct risk pricing, and validate future pathways.

In other words, the near-term milestones in this proposal are the first executable implementation phase of YUCE’s long-term blueprint, while YUCE’s broader long-term ambition is to evolve from prediction markets into a prediction finance platform for future outcomes, risk pricing, and decision validation.

# **Long-Term Sustainability Plan**

YUCE’s long-term sustainability will be built on the platform’s eventual market activity, product expansion capabilities, and potential service revenues. As price prediction and event prediction markets mature, the platform can further develop a sustainable path around market operations, feature expansion, and ecosystem partnerships.

From a business model perspective, YUCE’s long-term revenue streams may gradually include:

- Market transaction-related revenue
- Advanced features and professional market service revenue
- Market creation and operational support revenue from projects and partners
- Data subscription, research analysis, and probability signal distribution revenue
- Future API, white-label deployment, and customized solution revenue

This proposal supports the initial stage of product infrastructure development, with the goal of first establishing an operational and extensible prediction market infrastructure to lay the foundation for long-term growth.

# **Additional Information**

**Dependencies / Risks**

The following dependencies and risks may arise during project execution:

- Market launch timing and operational readiness
- Stability of price and event result processing workflows
- Balance between user-side security processes and user experience
- Configuration and operational complexity during multi-asset and multi-timeframe expansion
- Quality of continuous operations after the launch of event prediction markets

**Release / Delivery Notes**

The focus of this stage is to establish the first operational version and the dual-market foundation, rather than attempting to cover all long-term expansion directions at once. More advanced capabilities will be progressively developed only after the first stage has stabilized.