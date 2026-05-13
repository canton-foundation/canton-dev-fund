# Development Fund Proposal: CCTools

**Author:** João Matheus Camargo Gouveia (contact@cctools.network)
**Status:** Submitted
**Created:** 2026-03-31
**Updated:** 2026-04-09
**Champion:** Evan Varsamis (Temple Digital Group)
**Website:** https://cctools.network
**Twitter:** https://x.com/cantontools

---

## Abstract

CCTools is the all-in-one community toolkit for Canton Network. It provides an ecosystem directory with 380+ projects and 980 validators, portfolio tracker with real on-chain rewards, governance explorer, earn hub, rewards calculator, and gamification system. Launched on March 20, 2026, CCTools reached 20,000+ registered users and 6,400+ followers on X within 19 days, becoming the most active community platform on Canton Network.

This proposal requests funding to maintain and expand CCTools over 5 months across 3 milestones: a learn-to-earn and discovery platform, infrastructure scaling with DeFi dashboard, and a public API with mobile experience.

---

## Motivation

Canton Network has a rapidly growing ecosystem of validators, featured apps, DeFi protocols, and institutional participants. However, the community lacks a unified platform to discover projects, track portfolio performance, understand governance, and find earning opportunities.

**Key problems CCTools addresses:**

- **Fragmented information:** Users need to visit multiple tools (CantonScan, CC Explorer, CC View, The Tie) to get a complete picture. Project information is scattered across Discord channels, governance forums, and individual project websites.
- **No community-driven ecosystem directory:** The official Canton ecosystem page and Canton Wiki list projects but lack engagement features. CCTools is the only directory with upvotes, algorithmic scoring, compare tools, project badges, and community submissions.
- **No free portfolio tracker:** Existing analytics tools (Coin Metrics, Sync Insights, Kaiko) are enterprise-grade and paid. No free tool exists for retail users and small validators to track their real on-chain rewards, transfers, and P&L.
- **No DeFi dashboard:** Canton is not listed on DefiLlama. No platform aggregates TVL, APY, and pool data across Canton DeFi protocols (ACME, Alpend, Cantex, Hecto, Edel Finance, Temple). CCTools will partner with Canton protocols to centralize DeFi data. Some projects have already confirmed providing endpoints for liquidity and volume tracking.
- **No earn aggregator:** Incentive opportunities (staking rewards, exchange campaigns, grants, learn-to-earn programs) are announced in separate channels. CCTools aggregates them in a single hub with community submissions.
- **No educational platform:** There is no structured way for Canton users to learn about the ecosystem, understand DeFi protocols, or discover featured apps with curated data. CCTools will provide learning paths and quests that educate users while driving real engagement with Canton projects.

---

## Specification

### 1. Objective

Maintain and expand CCTools as the primary community intelligence and discovery platform for Canton Network. Deliver a learn-to-earn educational system, infrastructure scaling, new data products (DeFi dashboard, asset tracking), reputation system, mobile experience, and public API.

### 2. Current Platform (Already Live)

CCTools launched on March 20, 2026, and is fully operational with the following features:

- **Ecosystem Directory:** 380+ projects and 980 validators mapped with algorithmic scoring, upvotes, compare tool, project badges (90+ automated badges), trending section, share cards, analytics per project, and community submit/edit system.
- **Portfolio Tracker:** Real on-chain rewards from Canton Scan and Lighthouse APIs. Multi-wallet support (up to 3 free, 10 pro). Daily rewards chart, transfer history, P&L tracking, CSV export.
- **Governance Explorer:** All 331 DSO proposals with status, votes, deadlines. 13 Super Validators with weight and voting data. Real-time CC price votes with spread stats. Network config with issuance curves and fee schedules.
- **Earn Hub:** Aggregator for every Canton incentive. Staking, exchange campaigns, grants, learn-to-earn. Community-driven submissions with admin review. Analytics per opportunity (views, clicks, interests).
- **Rewards Calculator:** Three calculators for app builders (15.96M CC/day share), validators (3.3M CC/day, APY 10-15%), and investors (APY 5-20%, price targets $0.2-$1.0).
- **Gamification System:** XP for every action. 70+ badges across 7 categories. Daily check-in streaks with milestones. 50 levels from Newcomer to Canton OG. Referral system with codes. Public leaderboard for users and projects. Level 4 requirement for badges and upvotes (anti-bot protection). Important: the gamification system does not distribute any token rewards or airdrops. There is no CCTools token and no plans for one. XP and levels serve as engagement and anti-bot mechanisms. Higher levels unlock access to exclusive partner campaigns (e.g., earn campaigns with Canton projects), learn-to-earn quests, and community recognition. The value comes from curated access and participation, not from token speculation. Think GitHub contribution graphs, Reddit karma, or Duolingo streaks: the goal is to make exploring and learning about Canton engaging and fun. In the future, partner projects may run campaigns targeting users above a certain level, but the core gamification is about retention and education, not financial incentives.
- **CC Token Overview:** Price charts, burn/mint ratio, halving countdown, tokenomics (38B circulating, 100B 10-year cap).
- **Network Stats:** Live metrics including CC price, validator count, daily transactions, featured apps, total parties.
- **Sponsored System:** Paid/featured placements for projects on ecosystem and earn pages. First sponsored client (Temple Digital Group) confirmed.
- **Authentication:** Google OAuth, email signup, two-factor authentication (email + TOTP). Wallet connection on signup to be enforced for portfolio tracking.

**Traction (19 days post-launch):**

- 20,000+ registered users
- 6,400+ X followers
- ~1M total platform views
- 382 projects mapped
- 980 validators tracked
- 99,000+ upvotes
- 98,000+ earn interests
- 33+ GA4 custom events
- First sponsored client confirmed (Temple Digital Group)

### 3. Implementation Plan

The proposed work is divided into 3 milestones over 5 months. Each milestone builds on the previous and delivers independently valuable features. Detailed deliverables and acceptance criteria are specified in the Milestones and Deliverables section below.

**Milestone 1 (Month 1):** Learn-to-Earn & Discovery Platform — educational content, featured apps pages, enhanced validators directory, ecosystem redesign, scoring methodology, governance analytics.

**Milestone 2 (Month 2-3):** Infrastructure, DeFi Dashboard & Portfolio — dedicated infrastructure, paid API integrations, DeFi data aggregation, portfolio upgrades, reputation system.

**Milestone 3 (Month 4-5):** Public API, Asset Tracker & Mobile — public REST API with validator free tier, asset tracking, mobile PWA, developer documentation and SDK.

### 4. Architectural Alignment

CCTools aligns with Canton Network priorities in the following ways:

- **Ecosystem growth:** The directory, earn hub, learn-to-earn system, and gamification directly drive user acquisition and retention for Canton Network. 380+ projects mapped, community submissions, and project badges incentivize projects to engage with the ecosystem.
- **Education:** The learn-to-earn platform helps onboard new users by providing structured educational content about Canton. This reduces the learning curve and increases the quality of ecosystem participants.
- **Developer onboarding:** The rewards calculator helps developers estimate earnings before building on Canton. The DeFi dashboard and public API provide data infrastructure other developers can build on.
- **Transparency:** Governance explorer and governance analytics make DSO proposals and Super Validator voting accessible and analyzable by the community.
- **Canton Coin utility:** Portfolio tracker, rewards calculator, and CC token overview all center around CC utility. The burn/mint visualization and halving countdown educate users about Canton tokenomics.
- **Validator support:** Free API access for validators ensures they have the data they need to operate effectively and build tools on top of CCTools data.

### 5. Backward Compatibility

No backward compatibility impact. All proposed features are additions to the existing live platform. Existing users, data, and integrations will not be affected. The public API will be versioned (v1) to ensure stability for consumers.

---

## Milestones and Deliverables

### Milestone 1: Learn-to-Earn & Discovery Platform

| Detail | Description |
|--------|-------------|
| **Estimated Delivery** | Month 1 from grant approval |
| **Focus** | Educational platform, featured apps, advanced data integrations, governance analytics |
| **Funding** | 200,000 CC |

This milestone is prioritized first to establish CCTools as an educational and discovery hub for Canton Network. The platform should be the go-to destination for any user who wants to explore, understand, and learn about Canton. Learn-to-earn content drives genuine engagement with the ecosystem and creates a monetizable product (project-sponsored quests).

**Deliverables:**

- **Learn-to-Earn System:** Structured learning paths covering Canton fundamentals, DeFi concepts, ecosystem exploration, and advanced topics. Each path contains multiple quests with educational modules, quizzes, and knowledge checks. Users earn XP and exclusive badges upon completion. Projects can sponsor quests to educate users about their product while driving real understanding.
  - Learning paths: Canton Fundamentals, DeFi on Canton, Ecosystem Explorer, Advanced Topics
  - Quest system with modules, questions, and completion verification
  - XP rewards and exclusive Learn badges (First Lesson, Canton Scholar, DeFi Graduate, Ecosystem Expert, Canton Master)
  - Project-sponsored quest framework (monetizable: projects pay to create educational content about their product)
- **Featured Apps Pages:** Dedicated pages for each Canton Featured App with on-chain data linked to their party addresses. Real-time rewards tracking, transaction activity, and performance metrics pulled directly from the Global Synchronizer. Curated project profiles with team information, FAQ, and comparison tools. Mapping of on-chain identities to ecosystem projects for seamless discovery.
- **Enhanced Validators Directory:** Improved validator pages linking on-chain party addresses to ecosystem project profiles. Validator performance metrics, reward history, uptime tracking, and commission data. Super Validator governance participation and voting patterns. Visual mapping of which projects operate which validators.
- **Advanced Data Integrations:** Partnership with data providers (CantonScan, CC View) for structured on-chain data. Integration of third-party APIs to enrich ecosystem directory with real-time metrics, transaction volumes, and activity data. On-chain identity resolution connecting party addresses to known projects and validators.
- **Ecosystem Directory Redesign:** Rebuilt ecosystem experience with improved project pages, richer filtering, category navigation, and enhanced project analytics. Better discovery flow for new users to find and compare projects across categories. Improved submission and edit workflows for community contributions.
- **Project Scoring Methodology (public and transparent):** The current scoring system uses algorithmic and AI evaluation based on project metadata: description, team, funding, documentation, social presence, and network roles. It scores five dimensions (transparency, activity, community, documentation, maturity) and combines the AI result (60%) with a deterministic completeness bonus (40%) based on filled fields. This produces a 0-100 score per project. The upgraded scoring will integrate real on-chain signals from Canton Network: active validators, featured app status, and accumulated rewards will directly influence the score. Projects running validators or featured apps on Canton will receive higher activity and maturity scores based on verifiable on-chain data, not self-reported information. Users will be able to click on any project's score to open a detailed breakdown modal explaining exactly how the score was calculated, which dimensions contributed, and what on-chain data was considered. A public methodology page will document the scoring criteria, data sources, and weighting so anyone can understand and verify the ratings. This addresses the need for editorial transparency and objective quality signals in the ecosystem directory.
- **Governance Analytics:** Enhanced proposal tracking with historical voting patterns, validator participation rates, voting trend analysis, and proposal outcome statistics. Visual dashboards for governance health metrics.

**Acceptance Criteria:**

- Learn-to-earn system live with at least 3 learning paths and 10+ quests
- Featured Apps pages live with on-chain data linked to party addresses
- Enhanced validators directory live with project-to-validator mapping
- Redesigned ecosystem directory live with improved discovery and filtering
- Project scoring methodology page live with public documentation of criteria, and score breakdown modal accessible on every project page
- At least 1 data provider integration active and serving enriched data
- Governance analytics dashboard live with historical data
- User engagement: measurable increase in daily active users interacting with Learn content

---

### Milestone 2: Infrastructure, DeFi Dashboard & Portfolio

| Detail | Description |
|--------|-------------|
| **Estimated Delivery** | Month 2-3 from grant approval |
| **Focus** | Infrastructure scaling, paid APIs, DeFi data aggregation, portfolio enhancements, reputation system |
| **Funding** | 175,000 CC |

**Deliverables:**

- Dedicated server infrastructure with PostgreSQL, Redis caching, and automated daily backups
- Integration of paid APIs: on-chain historical data provider, social metrics API, multi-coin price feeds
- Pro tier enhanced with paid API data (extended charts, historical data, additional wallet slots)
- DeFi dashboard (/defi) with aggregated TVL across Canton protocols (Temple, ACME, Alpend, Cantex, Hecto, Edel Finance)
- APY comparison table, active pools listing, liquidity trend charts
- Portfolio tracker upgrades: historical rewards charts (30d, 90d, 1y via paid APIs), detailed P&L breakdown, multi-asset tracking, performance over time
- Improved export: additional formats, compatibility documentation for Koinly and CoinTracker import
- Canton wallet login integration (once WalletConnect equivalent is live)
- Frontend performance improvements: optimized loading, responsiveness, mobile-first layouts
- **Reputation System:** Separate from XP, reputation measures quality of community contributions. Reputation score based on curation accuracy (approved submissions, helpful edits, quality upvotes). Public user profiles (/u/username) showcasing badges, reputation, contributions, and activity. Weighted community votes based on reputation tier (subtle, internal weighting 1.0x-2.0x).

**Acceptance Criteria:**

- Platform running on reliable dedicated infrastructure with documented deployment process
- At least 1 paid API integration live and serving data to Pro users
- DeFi dashboard live with TVL data from at least 3 Canton DeFi protocols
- Portfolio showing historical data beyond 7 days for Pro users
- Reputation system live with public user profiles accessible via shareable URL
- User growth milestone: target user count during milestone period

---

### Milestone 3: Public API, Asset Tracker & Mobile

| Detail | Description |
|--------|-------------|
| **Estimated Delivery** | Month 4-5 from grant approval |
| **Focus** | Public API with validator access, asset tracking, mobile experience, developer documentation |
| **Funding** | 125,000 CC |

**Deliverables:**

- **Public API v1:** REST endpoints documented with OpenAPI specification. Versioned (v1) for stability.
- **API Tiers:**
  - Free tier: rate-limited (100 requests/min), API key required
  - **Validator tier: free for 12 months, no rate limits**, available to all Canton validators
  - Paid tier: higher volume, priority support, additional endpoints

**API Endpoints (detailed specification):**

**Ecosystem Directory**

- `GET /api/v1/ecosystem/projects` — List all projects with pagination, search, category/status filters
  - Response: `{ projects: [{ slug, name, category, tagline, score, likes, views, status, tags, logo_url }], total, page }`
- `GET /api/v1/ecosystem/projects/:slug` — Project detail with full metadata
  - Response: `{ slug, name, description, category, score, likes, views, team, faq, social_links, badges, campaigns, metrics }`
- `GET /api/v1/ecosystem/trending` — Top 20 projects by score + engagement
- `GET /api/v1/ecosystem/categories` — List of all categories with project counts

**Project Scores & Rankings**

- `GET /api/v1/ecosystem/rankings` — All projects ranked by algorithmic score
  - Parameters: `sort_by` (score, likes, views), `category`, `limit`, `offset`
- `GET /api/v1/ecosystem/projects/:slug/analytics` — Project engagement data
  - Response: `{ views_7d, views_30d, likes_total, clicks_total, trend }`

**Public Profiles**

- `GET /api/v1/users/:username` — Public user profile with level, XP, reputation, streak, badge count
  - Response: `{ username, level, xp, reputation, streak, badges_count, rank, joined_at, contributions_count }`
- `GET /api/v1/users/:username/badges` — All badges earned by user with rarity and category
  - Response: `{ badges: [{ slug, name, description, rarity, category, icon, earned_at }] }`
- `GET /api/v1/users/:username/contributions` — User submissions, edits, and curation activity
  - Response: `{ submissions: [...], edits: [...], total_upvotes, total_contributions }`
- `GET /api/v1/users/:username/activity` — Recent activity feed (views, upvotes, earn interests)
  - Parameters: `limit`, `offset`

**Earn Opportunities**

- `GET /api/v1/earn` — Active earn opportunities with filters
  - Parameters: `type`, `difficulty`, `status`, `limit`, `offset`
- `GET /api/v1/earn/:slug` — Opportunity detail with engagement metrics

**Leaderboard**

- `GET /api/v1/leaderboard` — Top users by XP
  - Parameters: `period` (weekly, monthly, all-time), `limit`

**Additional Deliverables:**

- **Asset Tracker:** Supply, circulation, holder distribution for CC, CBTC, and future CIP-56 tokens. Visual dashboard showing token ecosystem health.
- **Mobile PWA:** Progressive Web App optimized for mobile with push notifications (daily check-in reminders, price alerts, new earn opportunities). Full feature parity with desktop, optimized touch interactions.
- **API Documentation Portal:** Interactive documentation with endpoint explorer, code examples (JavaScript, Python, cURL), authentication guide, and rate limit documentation.
- **Developer SDK:** Lightweight JavaScript/TypeScript SDK for consuming the CCTools API. Published to npm for easy integration.

**Acceptance Criteria:**

- Public API documented and accessible with all specified endpoints
- Validator free tier active with at least 5 validators using the API
- Asset tracker showing data for CC and CBTC
- PWA installable on mobile with working push notifications
- API documentation portal live with interactive endpoint explorer
- At least one third-party integration consuming the API

---

### Ongoing: Maintenance (Post-Grant)

- Continued bug fixes, security patches, and platform stability
- Community curation and social media management (self-funded)
- API maintenance and uptime
- Funded by Pro tier revenue, sponsored listings, learn-to-earn sponsored quests, and API subscriptions

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
| Milestone 1 | Learn-to-Earn & Discovery Platform | 200,000 CC |
| Milestone 2 | Infrastructure, DeFi Dashboard & Portfolio | 175,000 CC |
| Milestone 3 | Public API, Asset Tracker & Mobile | 125,000 CC |
| **Total** | | **500,000 CC** |

**Volatility Stipulation:** The grant duration is 5 months. The grant is denominated in fixed Canton Coin. Should significant USD/CC price volatility occur, milestones may be renegotiated to ensure deliverability.

---

## Co-Marketing

Upon completion of each milestone, CCTools will collaborate with the Canton Foundation on:

- Announcement coordination via @cantontools (6,400+ followers) and @0xScoutr
- Technical blog posts detailing features built and data insights discovered
- Case studies on ecosystem engagement metrics (upvotes, project submissions, user growth)
- Developer-focused content about the public API and integration possibilities
- Inclusion of Canton Foundation branding on CCTools as grant recipient

---

## Rationale

CCTools is the right approach for this grant because:

- **Already live with proven traction:** Unlike proposals for products that don't exist yet, CCTools is fully operational with 20,000+ users in 19 days. The grant accelerates an existing product, reducing execution risk.
- **Educational positioning:** The learn-to-earn platform positions CCTools as a tool that adds genuine value to the ecosystem. Users learn about Canton, understand protocols, and engage meaningfully. This is not an airdrop farming platform but a discovery and education hub.
- **Unique positioning:** No other platform combines ecosystem directory, portfolio tracker, governance explorer, earn hub, rewards calculator, learn-to-earn, and gamification in one place for Canton. CCTools fills a gap that no existing tool addresses.
- **Community-driven:** The submit/edit system, upvotes, project badges, and gamification create a self-sustaining loop where users contribute data and engagement. This is not a top-down directory but a community platform.
- **Revenue path:** Sponsored listings (first client confirmed), Pro tier, learn-to-earn sponsored quests, and future API subscriptions provide a path to sustainability beyond grant funding.
- **Ecosystem multiplier:** Every feature built benefits the entire Canton ecosystem. The DeFi dashboard helps all DeFi protocols. The public API enables other builders. The earn hub drives users to every listed project. The learn-to-earn system educates users about all Canton projects.
- **Validator support:** Free API access ensures validators have the data infrastructure they need, directly supporting Canton Network operations.

---

## Team

| Name | Role | Background |
|------|------|------------|
| João Matheus Camargo Gouveia | Founder & Lead Developer | 4 years of web development (Next.js, React, TypeScript). Built and launched CCTools in 2 weeks, scaling to 20,000+ users in 19 days. Full-stack development, infrastructure, and product design. |
| TBD | Part-time Developer | To be hired. Backend/API development support. |

---

*CCTools — Canton Network Toolkit*
*cctools.network · @cantontools · contact@cctools.network*
