## Development Fund Proposal

**Author:** Sebastian Motelay, Token Terminal
**Status:** Draft  
**Created:** 2026-03-10

---

## Abstract

Token Terminal proposes to build a comprehensive, institutionally-credible Canton data layer covering 24+ financial, usage, technical, validator, and ecosystem metrics. This brings Canton in line with the data depth and coverage that Token Terminal provides for other leading L1 networks including Ethereum, Avalanche, and Solana. The integration will make Canton data freely accessible via Token Terminal's public explorer, API and MCP. As a result, Canton data is also made available to our data partners including Bloomberg, Messari, Coingecko, Binance, Nansen, and Flipside. This closes the institutional data visibility gap that currently limits Canton's ability to attract capital allocators and enterprise participants.

---

## Specification

### 1. Objective

Canton Network processes $3-4 trillion per month in collateral across institutions including Goldman Sachs, BNP Paribas, and Tradeweb. It operates 765 validator nodes and 39 Super Validators, and is one of the most significant real-world financial infrastructure deployments in our industry. Yet from the perspective of institutional analytics, Canton is heavily underrepresented.

Token Terminal is a widely used financial data platform for institutional participants in the crypto and digital assets space, trusted by firms including Bitwise, 21Shares, Franklin Templeton, Standard Chartered, Morgan Stanley, VanEck, and Grayscale. Token Terminal currently shows only a limited Canton dashboard with aggregate-level metrics derived from limited APIs. Institutional due diligence teams and asset managers cannot benchmark Canton against its peers using the standardised frameworks they rely on daily. Metrics that comparable networks publish routinely, such as daily fees, active users, transaction volumes, and validator economics, are either unavailable for Canton or scattered across Canton-specific tooling that institutional audiences do not monitor.

This proposal delivers a production-grade Canton data integration that covers 24+ metrics across five categories: financial, market, usage, technical, and validator/ecosystem. The final metric set will be confirmed during the technical alignment phase and may be subject to minor changes based on data availability. Upon completion, any market participant, researcher, or institution evaluating Canton will be able to access standardised, comparable, and continuously maintained data directly on Token Terminal, and through our data partners. Canton will be directly comparable to peers including Ethereum, Avalanche, and Solana within the same analytical framework used by the institutions above.

### 2. Implementation Mechanics

The integration is structured in two sequential build phases, with a third ongoing maintenance commitment:

**Phase 1: Core Network Metrics (Weeks 2-3)**

Build the foundational Canton data pipeline covering network-level financial and usage metrics pulled from available Canton API endpoints. Where Super Validator access is required to unlock specific data, Token Terminal will confirm the required access with the Digital Asset technical team prior to kickoff.

Metrics delivered in Phase 1:

| #   | Metric                          | Category  |
| --- | ------------------------------- | --------- |
| 1   | Fees                            | Financial |
| 2   | Revenue                         | Financial |
| 3   | Circulating supply              | Financial |
| 4   | Price                           | Market    |
| 5   | Fully diluted market cap        | Market    |
| 6   | Circulating market cap          | Market    |
| 7   | Token trading volume            | Market    |
| 8   | Active users (daily)            | Usage     |
| 9   | Active users (weekly)           | Usage     |
| 10  | Active users (monthly)          | Usage     |
| 11  | Active addresses (daily)        | Usage     |
| 12  | Active addresses (weekly)       | Usage     |
| 13  | Active addresses (monthly)      | Usage     |
| 14  | Average fees per user (AFPU)    | Usage     |
| 15  | Average revenue per user (ARPU) | Usage     |
| 16  | Transaction count               | Technical |
| 17  | Transactions per second         | Technical |
| 18  | Average transaction fee         | Technical |
| 19  | Median transaction fee          | Technical |

**Phase 2: Validator & Ecosystem Metrics (Weeks 4-5)**

Extend coverage to Canton-specific validator economics and app-layer activity. All metrics in this phase are contingent on the relevant data being accessible via Canton API endpoints confirmed during the scope alignment call.

_Note: the metric list across both phases represents a planned scope based on current data access knowledge. Final metrics will be confirmed during the technical alignment phase and minor changes may apply depending on Canton API availability and data structure._

| #   | Metric                                                                       | Category  |
| --- | ---------------------------------------------------------------------------- | --------- |
| 20  | Total Super Validators                                                       | Validator |
| 21  | Total Validator Nodes                                                        | Validator |
| 22  | Validator reward split by role (Validator / App / Super Validator) over time | Validator |
| 23  | 30-day Validator leaderboard                                                 | Validator |
| 24  | Top applications by total rewards                                            | Ecosystem |

**Ongoing: Maintenance & Distribution (12-month period)**

This grant covers the full integration build plus a 12-month maintenance period from the date of grant approval. Token Terminal will maintain the Canton data pipeline throughout this period, including monitoring for data source changes, supporting historical backfill where data becomes available, and propagating Canton data downstream to Token Terminal's integrated partners including Bloomberg, Messari, Nansen, CoinGecko, Binance, Flipside, and Focal where applicable.

Token Terminal is additionally committed to prioritising RWA coverage for Canton within our Tokenized Assets section as RWA activity on Canton matures and the required data access is confirmed in a structured, machine-readable format compatible with daily refresh and historical backfill.

### 3. Architectural Alignment

Token Terminal is already an active Canton validator, participating directly in the network. This proposal builds on that existing relationship and on sustained technical collaboration with the Digital Asset team to understand Canton's data architecture and validator API capabilities.

The integration aligns with the Canton Development Fund's stated priorities in the following ways:

**Critical ecosystem infrastructure.** Token Terminal's Canton page will serve as the canonical, third-party-verified reference for Canton's network health and economic performance. It is freely accessible to all market participants and not dependent on any single operator's continued involvement.

**Institutional data distribution as a prerequisite for capital formation.** Token Terminal's data is directly integrated into platforms including Bloomberg, Messari, Nansen, CoinGecko, Flipside, Binance, Focal, and CF Benchmarks, collectively reaching a large portion of the institutional participants active in digital assets. Canton data flowing through this distribution stack connects the network to the institutional audiences its technology is designed to serve.

**Validator economics layer unique to Canton.** The reward split data (Validator / App / Super Validator) and leaderboard infrastructure built in Phase 2 has no equivalent on any other chain. It becomes the canonical reference for understanding Canton's economic model, a public good that benefits every participant in the ecosystem.

This proposal is consistent with CIP-0082's scope of "core R&D, dev tools, security, audits, reference implementations, DeFi app(s) liquidity seeding, critical infra" as interpreted to include shared analytics infrastructure that the ecosystem relies on. It does not propose changes to Canton's protocol, consensus, or smart contract layer.

### 4. Backward Compatibility

No backward compatibility impact. This proposal adds a new external data integration and public-facing data dashboards on Token Terminal and our data partners. It does not modify any Canton protocol components, smart contracts, validator configurations, or existing integrations.

---

## Milestones and Deliverables

### Milestone 1: Integration Kickoff & Technical Alignment

- **Estimated Delivery:** Within 2 weeks of grant approval
- **Focus:** Confirm API access scope, data pipeline architecture, and engineering timeline. Formal work begins
- **Deliverables / Value Metrics:**
  - Signed-off scope alignment between Token Terminal and Canton Foundation / Digital Asset technical teams
  - Confirmed API access for Phase 1 metrics
  - Engineering kickoff completed and timeline locked

### Milestone 2: Full 24-Metric Dashboard Live + Joint Announcement

- **Estimated Delivery:** Within 5-6 weeks of grant approval
- **Focus:** All 24+ metrics live on Token Terminal public explorer, API and MCP. Joint public announcement published
- **Deliverables / Value Metrics:**
  - All 24+ metrics live and queryable on Token Terminal public explorer
  - Canton data available via Token Terminal API and MCP to institutional subscribers and downstream partners
  - Joint announcement published by Token Terminal and Canton Foundation across owned channels
  - Canton data pipeline propagated to downstream distribution partners including Bloomberg, Messari, Nansen, CoinGecko, Binance, Flipside, and Focal

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- All metrics (per the finalised scope confirmed at kickoff) live and publicly accessible on Token Terminal's Canton dashboard
- All metrics queryable via Token Terminal API and MCP
- Data pipeline confirmed operational with daily refresh and maintained for 12 months from grant approval
- Validator reward split and leaderboard data (Metrics 22-24, subject to final scope confirmation) live and accurate against onchain data
- Joint public announcement published by both Token Terminal and Canton Foundation
- Downstream distribution to partners including Bloomberg, Messari, Nansen, CoinGecko, Binance, Flipside, and Focal confirmed active where applicable
- Documentation of data sources, pipeline architecture, and metric definitions provided to the Canton Foundation

---

## Funding

**Total Funding Request:** $120,000 USD (denominated and paid in Canton Coin / CC)

### Payment Breakdown by Milestone

- Milestone 1 (Integration Kickoff & Technical Alignment): 25%, $30,000 in CC upon committee acceptance
- Milestone 2 (Full Dashboard Live + Joint Announcement): 75%, $90,000 in CC upon final release and acceptance

### Volatility Stipulation

The project duration is **under 6 months** (estimated 5–6 weeks to Milestone 2 completion). Should the project timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility.

---

## Co-Marketing

Upon completion of Milestone 2, Token Terminal and the Canton Foundation will collaborate on:

- Coordinated announcement across Token Terminal and Canton Foundation owned channels (Twitter/X, LinkedIn, blog)
- Canton feature placement within Token Terminal's ecosystem content and distribution (including protocol spotlights and chart of the week format)
- Ongoing research of Canton network as the dataset scales

---

## Motivation

Canton Network is one of the most significant real-world financial infrastructure deployments in our industry. Its institutional participant base, collateral volumes, and validator economics are without peer in the industry. Yet it remains effectively invisible to the institutional analytics ecosystem that drives capital allocation and enterprise adoption decisions.

Token Terminal is a widely used financial data platform trusted by institutional investors, asset managers, and research firms evaluating blockchain networks, including Bitwise, 21Shares, Franklin Templeton, Standard Chartered, Morgan Stanley, VanEck, and Grayscale. Building a comprehensive Canton integration on Token Terminal closes the gap between Canton's real-world impact and its perceived institutional profile.This directly enables the enterprise adoption that the network is positioned to attract.

The integration also creates a durable public good: a freely accessible, third-party-verified, continuously maintained Canton data layer that any market participant can rely on, not locked behind a paywall, and not dependent on any single team's continued involvement. The grant covers the full build plus a 12-month maintenance period, ensuring the data layer remains accurate and operational well beyond the initial launch.

---

## Rationale

Token Terminal is the natural and most effective partner for this integration for three reasons:

**Existing infrastructure.** Token Terminal already covers 100+ blockchain networks using a standardised financial metrics framework. The data pipeline, normalisation layer, and institutional distribution stack required to serve Canton already exist. This proposal funds the Canton-specific engineering work to connect Canton's data architecture to that infrastructure, not a greenfield build.

**Existing relationship.** Token Terminal is an active Canton validator. We have an established technical relationship with the Digital Asset team and a shared understanding of Canton's data architecture.

**Distribution reach.** Token Terminal's data flows downstream to partners including Bloomberg, Messari, Nansen, CoinGecko, Binance, Flipside, and Focal, platforms that Canton cannot reach directly through its own tooling. No other data provider offers equivalent distribution breadth to the institutional audiences that Canton is designed to serve.

Alternative approaches, such as Canton building its own analytics tooling or working with a less established data provider, would not achieve the same institutional credibility or distribution reach, and would create a proprietary rather than public good outcome.
