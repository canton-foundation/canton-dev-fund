# Development Fund Proposal: CCTools

**Author:** João Matheus Camargo Gouveia (contact@cctools.network)
**Status:** Submitted
**Created:** 2026-03-31
**Champion:** Evan Varsamis (Temple Digital Group)
**Website:** https://cctools.network
**Twitter:** https://x.com/cantontools

---

## Abstract

CCTools is the all-in-one community toolkit for Canton Network. It provides an ecosystem directory with 380+ projects and 980 validators, portfolio tracker with real on-chain rewards, governance explorer, earn hub, rewards calculator, and gamification system. Launched on March 20, 2026, CCTools reached 11,000+ registered users and 3,000+ followers on X within 12 days, becoming the most active community platform on Canton Network.

This proposal requests funding to maintain and expand CCTools over 6 months across 3 milestones + ongoing maintenance: infrastructure scaling, DeFi dashboard, mobile experience, public API, and operational support for community curation.

---

## Motivation

Canton Network has a rapidly growing ecosystem of validators, featured apps, DeFi protocols, and institutional participants. However, the community lacks a unified platform to discover projects, track portfolio performance, understand governance, and find earning opportunities.

**Key problems CCTools addresses:**

- **Fragmented information:** Users need to visit multiple tools (CantonScan, CC Explorer, CC View, The Tie) to get a complete picture. Project information is scattered across Discord channels, governance forums, and individual project websites.
- **No community-driven ecosystem directory:** The official Canton ecosystem page and Canton Wiki list projects but lack engagement features. CCTools is the only directory with upvotes, algorithmic scoring, compare tools, project badges, and community submissions.
- **No free portfolio tracker:** Existing analytics tools (Coin Metrics, Sync Insights, Kaiko) are enterprise-grade and paid. No free tool exists for retail users and small validators to track their real on-chain rewards, transfers, and P&L.
- **No DeFi dashboard:** Canton is not listed on DefiLlama. No platform aggregates TVL, APY, and pool data across Canton DeFi protocols (ACME, Alpend, Cantex, Hecto, Edel Finance, Temple). CCTools will partner with Canton protocols to centralize DeFi data. Temple Digital Group will provide endpoints for liquidity and volume tracking.
- **No earn aggregator:** Incentive opportunities (staking rewards, exchange campaigns, grants, learn-to-earn programs) are announced in separate channels. CCTools aggregates them in a single hub with community submissions.

---

## Specification

### 1. Objective

Maintain and expand CCTools as the primary community intelligence platform for Canton Network. Deliver infrastructure scaling, new data products (DeFi dashboard, asset tracking), mobile experience, public API, and operational capacity for community curation.

### 2. Current Platform (Already Live)

CCTools launched on March 20, 2026, and is fully operational with the following features:

- **Ecosystem Directory:** 380+ projects and 980 validators mapped with algorithmic scoring, upvotes, compare tool, project badges (22 automated badges), trending section, share cards, analytics per project, and community submit/edit system.
- **Portfolio Tracker:** Real on-chain rewards from Canton Scan and Lighthouse APIs. Multi-wallet support (up to 3 free, 10 pro). Daily rewards chart, transfer history, P&L tracking, CSV export.
- **Governance Explorer:** All 309 DSO proposals with status, votes, deadlines. 13 Super Validators with weight and voting data. Real-time CC price votes with spread stats. Network config with issuance curves and fee schedules.
- **Earn Hub:** Aggregator for every Canton incentive. Staking, exchange campaigns, grants, learn-to-earn. Community-driven submissions with admin review. Analytics per opportunity (views, clicks, interests).
- **Rewards Calculator:** Three calculators for app builders (15.96M CC/day share), validators (3.3M CC/day, APY 10-15%), and investors (APY 5-20%, price targets $0.2-$1.0).
- **Gamification System:** XP for every action. 70+ badges across 7 categories. Daily check-in streaks with milestones. 50 levels from Newcomer to Canton OG. Referral system with codes. Public leaderboard for users and projects. Level 4 requirement for badges and upvotes (anti-bot protection).
- **CC Token Overview:** Price charts, burn/mint ratio, halving countdown, tokenomics (38B circulating, 100B 10-year cap).
- **Network Stats:** Live metrics including CC price, validator count, daily transactions, featured apps, total parties.
- **Sponsored System:** Paid/featured placements for projects on ecosystem and earn pages. First sponsored client (Temple Digital Group) confirmed.
- **Authentication:** Google OAuth, email signup, two-factor authentication (email + TOTP). Wallet connection on signup to be enforced for portfolio tracking.

**Traction (12 days post-launch):**

- 11,000+ registered users
- 3,000+ X followers
- 380+ projects mapped
- 980 validators tracked
- 8,000+ upvotes
- 7,000+ earn interests
- 33+ GA4 custom events
- First sponsored client confirmed

### 3. Implementation Plan

The proposed work is divided into 3 milestones over 6 months + ongoing maintenance. Each milestone builds on the previous and delivers independently valuable features.

**Deliverables:**

- **Infrastructure:** Dedicated server infrastructure with PostgreSQL, Redis caching, automated backups, and improved reliability. Integration of paid APIs for on-chain historical data, social metrics, and multi-coin price feeds. This infrastructure enables the Pro tier to offer extended data as a premium feature and supports large-scale campaigns without degradation.
- **DeFi Dashboard:** First aggregated DeFi dashboard for Canton. TVL tracking across ACME, Alpend, Cantex, Hecto, Edel Finance, Temple. APY comparison, active pools, liquidity trends. Canton is currently not listed on DefiLlama, making this the only source of aggregated Canton DeFi data. Temple Digital Group will provide endpoints for liquidity and volume. CCTools will request API access from all Canton DeFi protocols to centralize data.
- **Portfolio Upgrades:** Extended historical rewards charts (30d, 90d, 1y via paid APIs), detailed P&L breakdown, multi-asset tracking (CC, CBTC), performance over time visualization, improved export formats.
- **Asset Tracker:** Supply, circulation, and holder data for CIP-56 tokens (CBTC and future tokens). Visual dashboard showing token ecosystem health.
- **Public API:** REST API with documentation for third parties to consume CCTools data. Free tier with rate limits, paid tier for higher volume. This creates an additional revenue stream and makes CCTools data composable for other builders. Endpoints include:
  - Ecosystem directory (projects list, search, filter, detail)
  - Project scores and rankings (algorithmic score, upvotes, views, badges)
  - Project analytics (clicks, views, trends)
  - Earn opportunities (active listings, interests, clicks)
  - Leaderboard data (user rankings, XP, badges)
- **Mobile PWA:** Progressive Web App optimized for mobile with push notifications (daily check-in reminders, price alerts, new earn opportunities). Full feature parity with desktop.
- **Platform Improvements:** Canton wallet login for native sign-in using Canton wallets. Frontend performance optimization, improved responsiveness, campaign-specific tools (custom landing pages, dedicated tracking and metrics per campaign).

### 4. Architectural Alignment

CCTools aligns with Canton Network priorities in the following ways:

- **Ecosystem growth:** The directory, earn hub, and gamification system directly drive user acquisition and retention for Canton Network. 380+ projects mapped, community submissions, and project badges incentivize projects to engage with the ecosystem.
- **Developer onboarding:** The rewards calculator helps developers estimate earnings before building on Canton. The DeFi dashboard and public API provide data infrastructure other developers can build on.
- **Transparency:** Governance explorer makes DSO proposals and Super Validator voting accessible to the community.
- **Canton Coin utility:** Portfolio tracker, rewards calculator, and CC token overview all center around CC utility. The burn/mint visualization and halving countdown educate users about Canton tokenomics.

### 5. Backward Compatibility

No backward compatibility impact. All proposed features are additions to the existing live platform. Existing users, data, and integrations will not be affected. The public API will be versioned (v1) to ensure stability for consumers.

---

## Milestones and Deliverables

### Milestone 1: Infrastructure, DeFi Dashboard & Portfolio

| Detail | Description |
|--------|-------------|
| **Estimated Delivery** | Month 1-2 from grant approval |
| **Focus** | Infrastructure scaling, paid APIs, DeFi data aggregation, portfolio enhancements |
| **Funding** | 200,000 CC |

**Deliverables:**

- Dedicated server infrastructure with PostgreSQL, Redis, and automated daily backups
- Integration of paid APIs: on-chain historical data provider, social metrics API, multi-coin price feeds
- Pro tier enhanced with paid API data (extended charts, historical data, additional wallet slots)
- DeFi dashboard (/defi) with aggregated TVL across Canton protocols (Temple, ACME, Alpend, Cantex, Hecto, Edel Finance)
- APY comparison table, active pools listing, liquidity trend charts
- Portfolio tracker upgrades: historical rewards charts (30d, 90d, 1y), detailed P&L breakdown, multi-asset tracking, performance over time
- Improved export: additional formats, compatibility documentation for Koinly and CoinTracker import
- Canton wallet login integration (once WalletConnect equivalent is live)
- Frontend performance improvements: optimized loading, responsiveness, mobile-first layouts
- Campaign infrastructure: cache layer, robust rate limiting, user-based deduplication

**Acceptance Criteria:**

- Platform running on reliable dedicated infrastructure with documented deployment process
- At least 1 paid API integration live and serving data to Pro users
- DeFi dashboard live with TVL data from at least 3 Canton DeFi protocols
- Portfolio showing historical data beyond 7 days for Pro users
- User growth milestone: target user count during milestone period

### Milestone 2: Public API, Asset Tracker & Mobile

| Detail | Description |
|--------|-------------|
| **Estimated Delivery** | Month 3-4 from grant approval |
| **Focus** | Public API, asset tracking, mobile experience, campaign tools |
| **Funding** | 175,000 CC |

**Deliverables:**

- Public API v1: REST endpoints for ecosystem data, project scores, validator rankings, rewards data, governance proposals, CC token metrics, earn opportunities. Versioned, documented, with OpenAPI specification
- API tiers: free (rate-limited) and paid (higher volume)
- Asset tracker: supply, circulation, holder distribution for CC, CBTC, and future CIP-56 tokens
- Mobile PWA: push notifications, full feature parity with desktop, optimized touch interactions
- Campaign-specific tools: custom tracking per campaign, dedicated metrics dashboard, configurable landing pages for sponsored campaigns

**Acceptance Criteria:**

- Public API documented and accessible with at least 5 endpoints
- Asset tracker showing data for CC and CBTC
- PWA installable on mobile with working push notifications
- At least one campaign partner using the campaign tracking tools

### Milestone 3: Community Operations & Growth

| Detail | Description |
|--------|-------------|
| **Estimated Delivery** | Month 5-6 from grant approval |
| **Focus** | Community curation, social media, engagement growth, developer support |
| **Funding** | 125,000 CC |

**Deliverables:**

- Social media management: consistent posting schedule on @cantontools, community engagement, partnership communications
- Community curation: review and approval of project submissions, edit suggestions, earn opportunity suggestions, spam/bot rejection
- Part-time developer support: bug fixes, minor features, maintenance, security patches
- Partner metrics reports: monthly reports for sponsored partners with views, clicks, engagement data
- Community channels: management of Discord, Telegram, and X interactions

**Acceptance Criteria:**

- Engagement metrics: minimum reach per week for 8 consecutive weeks, documented with screenshots
- Monthly metrics reports delivered to all sponsored partners

### Ongoing: Maintenance (Post-Grant)

- Continued bug fixes, security patches, and platform stability
- Community curation and social media management
- API maintenance and uptime
- Funded by Pro tier revenue, sponsored listings, and API subscriptions

---

## Acceptance Criteria (Global)

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone
- All features deployed and accessible on cctools.network
- Demonstrated functionality with real users (not staging/test environment)
- Documentation provided for API, infrastructure, and operational processes
- Platform uptime above 95% during the grant period
- Continued growth in user engagement metrics

---

## Funding

**Total Funding Request: 500,000 CC**

| Milestone | Description | Amount |
|-----------|-------------|--------|
| Milestone 1 | Infrastructure, DeFi Dashboard & Portfolio | 200,000 CC |
| Milestone 2 | Public API, Asset Tracker & Mobile | 175,000 CC |
| Milestone 3 | Community Operations & Growth | 125,000 CC |
| **Total** | | **500,000 CC** |

**Volatility Stipulation:** The grant duration is 6 months. The grant is denominated in fixed Canton Coin. Should significant USD/CC price volatility occur, milestones may be renegotiated to ensure deliverability.

---

## Co-Marketing

Upon completion of each milestone, CCTools will collaborate with the Canton Foundation on:

- Announcement coordination via @cantontools (3,000+ followers) and @0xScoutr
- Technical blog posts detailing features built and data insights discovered
- Case studies on ecosystem engagement metrics (upvotes, project submissions, user growth)
- Developer-focused content about the public API and integration possibilities
- Inclusion of Canton Foundation branding on CCTools as grant recipient

---

## Rationale

CCTools is the right approach for this grant because:

- **Already live with proven traction:** Unlike proposals for products that don't exist yet, CCTools is fully operational with 11,000+ users in 12 days. The grant accelerates an existing product, reducing execution risk.
- **Unique positioning:** No other platform combines ecosystem directory, portfolio tracker, governance explorer, earn hub, rewards calculator, and gamification in one place for Canton. CCTools fills a gap that no existing tool addresses.
- **Community-driven:** The submit/edit system, upvotes, project badges, and gamification create a self-sustaining loop where users contribute data and engagement. This is not a top-down directory but a community platform.
- **Revenue path:** Sponsored listings (first client confirmed), Pro tier, and future API subscriptions provide a path to sustainability beyond grant funding. Active partnership discussions with Cantex, OneSwap, and Send for sponsored campaigns and ecosystem integrations.
- **Ecosystem multiplier:** Every feature built benefits the entire Canton ecosystem. The DeFi dashboard helps all DeFi protocols. The public API enables other builders. The earn hub drives users to every listed project.

---

## Team

| Name | Role | Background |
|------|------|------------|
| João Matheus Camargo Gouveia | Founder & Lead Developer | 4 years of web development (Next.js, React, TypeScript). Built and launched CCTools in 2 weeks, scaling to 11,000+ users in 12 days. Full-stack development, infrastructure, and product design. |
| TBD | Part-time Developer | To be hired. Backend/API development support. |
| TBD | Community Manager (Part-time) | To be hired. Project curation, social media, partner communications. |

---

*CCTools — Canton Network Toolkit*
*cctools.network · @cantontools · contact@cctools.network*
