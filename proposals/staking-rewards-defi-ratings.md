## Development Fund Proposal

**Author:** Staking Rewards (stakingrewards.com)
**Status:** Draft
**Created:** 2026-03-24

---

## Abstract

Staking Rewards wants to bring independent DeFi risk ratings to Canton. We will apply our AAA-to-D rating framework to five Canton-native yield protocols (lending markets, liquid staking, vaults) and publish the results openly on stakingrewards.com and via our API. The goal is simple: give users and institutions a clear, comparable view of how safe each protocol actually is.

Canton is at an inflection point. Zenith is bringing EVM compatibility, institutional money is entering through tokenized Treasuries and RWA lending, and new yield protocols are going live. But there is no independent risk layer yet. No standardized way for a fund manager or retail user to compare the safety of Alpend vs. ACME Lend vs. EA Finance. We want to fix that.

Each rating covers roughly 90 risk dimensions across smart contract quality, oracle dependencies, liquidation mechanics, governance setup, and financial backstops. Everything rolls up into a single letter grade. The methodology is open-standard, built with the DeFi Risk Alliance, and already live across Ethereum, Solana, and Base. Rated protocols also get specific feedback on what to improve, so the whole ecosystem levels up over time.

---

## Specification

### 1. Objective

**Problem:** Canton's DeFi ecosystem is growing fast. Protocols like Alpend, ACME Lend, and EA Finance are offering lending, borrowing, and yield products. But institutional participants, who are Canton's core audience, need rigorous third-party risk assessments before they commit capital. Right now, no standardized risk framework exists for Canton DeFi. That creates information asymmetry, slows adoption, and concentrates risk in ways that are hard to see.

**Outcome:** Five comprehensive DeFi risk ratings for Canton yield protocols, published on stakingrewards.com and available through the Staking Rewards API. This gives Canton its first independent risk transparency layer.

### 2. Implementation Mechanics

The project has four phases:

**Phase 1: Ecosystem Mapping and Protocol Selection (Weeks 1 to 3)**
- Map all active Canton-native yield protocols (lending, liquid staking, vaults, structured products)
- Evaluate each on maturity, TVL, user base, and documentation quality
- Select five protocols together with the Canton Foundation Tech & Ops Committee
- Set up communication channels with each protocol team for data collection

**Phase 2: Deep-Dive Risk Assessment (Weeks 4 to 10)**
- Run the full Staking Rewards DeFi Rating Framework on each protocol, covering:
  - **Strategy Design:** mechanism complexity, dependency chains, yield source sustainability
  - **Smart Contract and Oracle Risk:** audit status, upgradeability, oracle diversity, admin key exposure
  - **Liquidity and Liquidation Dynamics:** collateral depth, liquidation robustness, withdrawal friction
  - **Governance and Permissions:** multisig setup, timelocks, emergency powers, decentralization path
  - **Financial Backstops:** insurance funds, reserve buffers, bad debt socialization
- Score roughly 90 structured questions across 3 categories and 12 sub-categories into a composite letter grade (AAA through D)
- Calibrate the methodology for Canton-specific architecture (Daml smart contracts, selective disclosure, Canton's privacy model)

**Phase 3: Publication and Integration (Weeks 11 to 14)**
- Publish all five ratings on stakingrewards.com with full methodology transparency
- Make ratings available through the Staking Rewards Ratings REST API so Canton ecosystem apps can pull them programmatically
- Deliver a Canton Ecosystem Risk Report covering cross-protocol findings, systemic risk patterns, and recommendations
- Share concrete improvement feedback with each rated protocol

**Phase 4: Knowledge Transfer and Ecosystem Enablement (Weeks 15 to 16)**
- Publish a Canton DeFi Risk Methodology Addendum covering Canton-specific rating considerations (Daml contracts, privacy-preserving architecture, institutional compliance patterns)
- Host a public webinar or Twitter/X Space to present findings to the Canton community
- Hand over all documentation and raw assessment data to the Canton Foundation

### 3. Architectural Alignment

This proposal maps directly to several Canton ecosystem priorities:

- **Security and Audits:** DeFi ratings work as continuous, structured security assessments. They complement one-time code audits by adding ongoing risk monitoring across economic design, governance, and operational dimensions that code reviews do not cover.

- **Critical Ecosystem Infrastructure:** An independent risk layer is table-stakes infrastructure for institutional DeFi. Canton targets regulated financial institutions, and for them, standardized risk transparency is not a nice-to-have. It is a prerequisite for deploying real capital.

- **Canton's Institutional Identity:** Canton's value proposition centers on institutional-grade DeFi with privacy, compliance, and auditability. Independent risk ratings back up that claim with concrete, verifiable evidence that Canton protocols meet high standards.

- **Common Good / Shared Benefit:** The ratings are freely accessible. Users get decision-making tools, protocols get improvement feedback, and the Foundation gets an independent quality signal for the ecosystem.

- **Zenith and EVM Expansion:** As Zenith opens Canton to EVM-native DeFi protocols, having a risk rating framework already in place sets a quality bar for incoming projects and protects Canton's institutional credibility.

### 4. Backward Compatibility

No impact. This proposal adds an informational layer without touching any existing protocol, contract, or infrastructure.

---

## Milestones and Deliverables

### Milestone 1: Ecosystem Mapping and Protocol Selection
- **Estimated Delivery:** Week 3
- **Focus:** Full catalogue of Canton yield protocols; selection of 5 for rating
- **Deliverables:**
  - Canton DeFi landscape document covering all active yield protocols
  - Confirmed list of 5 selected protocols with selection rationale
  - Data-sharing agreements established with each protocol team
  - Methodology calibration plan for Canton-specific architecture

### Milestone 2: Risk Assessments Complete
- **Estimated Delivery:** Week 10
- **Focus:** Finished risk analysis for all 5 protocols
- **Deliverables:**
  - 5 completed DeFi risk rating assessments (roughly 90 dimensions each)
  - Individual protocol reports with letter grades and detailed scoring breakdowns
  - Improvement recommendations delivered to each protocol
  - Draft Canton Ecosystem Risk Report identifying systemic patterns

### Milestone 3: Publication, API Integration and Knowledge Transfer
- **Estimated Delivery:** Week 16
- **Focus:** Public release, API availability, ecosystem knowledge transfer
- **Deliverables:**
  - All 5 ratings live on stakingrewards.com
  - Ratings accessible via Staking Rewards REST API
  - Final Canton Ecosystem Risk Report published
  - Canton-specific DeFi Rating Methodology Addendum published
  - Public webinar or presentation to Canton community
  - All documentation and data delivered to Canton Foundation

---

## Acceptance Criteria

The Tech & Ops Committee evaluates completion based on:

- All 5 protocol ratings published with full methodology transparency on stakingrewards.com
- Ratings available programmatically via the Staking Rewards Ratings API
- Canton Ecosystem Risk Report delivered with cross-protocol findings and systemic risk analysis
- Canton-specific methodology addendum published and shared with the Foundation
- Each rated protocol has received concrete improvement feedback
- Public presentation completed (webinar, Twitter Space, or equivalent)
- All deliverables are publicly accessible and serve as common-good infrastructure

---

## Funding

**Total Funding Request:** 50,000 USD equivalent in Canton Coin (CC)

### Payment Breakdown by Milestone

- **Milestone 1** (Ecosystem Mapping and Protocol Selection): **10,000 USD equiv. in CC** upon committee acceptance
- **Milestone 2** (Risk Assessments Complete): **25,000 USD equiv. in CC** upon committee acceptance
- **Milestone 3** (Publication, API Integration and Knowledge Transfer): **15,000 USD equiv. in CC** upon final acceptance

### Cost Justification

The funding covers:
- Senior analyst time for 5 deep-dive protocol assessments (roughly 90 risk dimensions each)
- Methodology adaptation for Canton's architecture (Daml, selective disclosure)
- API integration and ongoing hosting of Canton ratings
- Report writing, documentation, and community presentation
- Coordination with 5 protocol teams for data collection and feedback

For context, a single institutional-grade DeFi risk assessment typically runs $10,000 to $20,000 on the open market. This proposal delivers five assessments plus ecosystem-wide infrastructure (API access, methodology addendum, ecosystem report) at a rate well below market to maximize value for Canton.

### Volatility Stipulation

The project runs under 6 months (16 weeks). If the timeline extends beyond 6 months due to Committee-requested scope changes, remaining milestones would need to be renegotiated to account for USD/CC price movement.

---

## Co-Marketing

On release, Staking Rewards will work with the Canton Foundation on:

- Joint announcement across Staking Rewards and Canton social channels (combined reach: 200K+ crypto-native followers)
- Technical blog post on stakingrewards.com featuring Canton ecosystem ratings
- Canton protocols included in Staking Rewards DeFi ratings marketing and PR
- Joint Twitter/X Space or webinar presenting findings to the broader DeFi and institutional community
- Ongoing visibility as Canton ratings stay live on stakingrewards.com

---

## Motivation

Canton sits at the intersection of institutional finance and DeFi. That positioning demands a higher bar for risk transparency than what exists on most chains today. Here is why independent DeFi ratings matter for Canton right now:

**1. Institutional capital needs risk clarity.** Canton's core users are financial institutions, asset managers, and regulated entities. They cannot allocate to yield strategies without standardized risk assessments. Unlike retail DeFi, institutional mandates require documented risk analysis. Independent ratings are what unlocks that capital.

**2. Fast ecosystem growth creates blind spots.** Zenith is bringing EVM compatibility and new yield protocols are launching quickly. Without a risk framework, users have no reliable way to tell a well-designed protocol from one carrying hidden risks. DeFi history (Terra/Luna, FTX, countless exploits) shows what happens when that information gap goes unaddressed.

**3. No other institutional chain has this.** Standardized, independent DeFi risk ratings do not exist on any other institutional blockchain. Building this infrastructure now positions Canton as the most transparent chain for institutional yield. That is a real competitive edge.

**4. Ecosystem health depends on it.** When users lose funds to a poorly designed protocol, the whole ecosystem takes the reputational hit. Proactive risk transparency helps prevent those events and builds lasting confidence in Canton DeFi.

**5. Ratings create a feedback loop.** Every rating includes specific recommendations. That gives Canton protocols a concrete path to improve, which raises the security and quality bar across the board over time.

---

## Rationale

**Why Staking Rewards?**

Staking Rewards is the most widely used independent platform for staking and DeFi data, with over 1 million monthly users and integrations across institutional platforms globally. Our DeFi Rating Framework, built in partnership with the DeFi Risk Alliance, already covers 25+ protocols on Ethereum, Solana, and Base with grades ranging from A (Aave) to CCC (higher-risk protocols). What we bring:

- A proven, open-standard methodology covering roughly 90 risk dimensions across 12 sub-categories
- A public API already used by wallets, exchanges, and institutional platforms for risk data
- Deep expertise in staking and DeFi risk analysis with a dedicated research team
- Independence: we do not operate protocols, so our assessments are unbiased by design

**Why this approach?**

- **Ratings over audits alone:** Code audits check implementation at a point in time. DeFi ratings cover the full risk surface including economic design, governance, liquidity, and oracle dependencies. That is a more complete picture for capital allocation.
- **Public and API-accessible:** Making ratings free and API-available maximizes ecosystem benefit. Wallets, dashboards, and aggregators can integrate risk signals natively.
- **Five protocols, not one:** Rating multiple protocols enables cross-protocol comparison and systemic risk analysis, which is far more useful than isolated assessments.
- **Canton-specific calibration:** We will adapt the methodology for Canton's unique properties (Daml, selective disclosure, privacy-preserving architecture) and publish the addendum so future ratings can be done faster.

**Alternatives considered:**

- *Protocol self-assessment:* Not independent. Institutional participants need third-party validation.
- *Traditional audit firms:* Code-focused only. More expensive per protocol. Results usually not public or API-available.
- *Building a new rating system:* Unnecessary. Staking Rewards' framework is already live, peer-reviewed, and trusted by the market.
