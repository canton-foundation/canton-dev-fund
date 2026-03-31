# Development Fund Proposal: Canton Validator Portal

## Unified Operations, Analytics & Communication Infrastructure for Canton Validators

- **Author:** Kinjal Jain
- **Status:** Draft
- **Created:** 2026-03-31

---

## Abstract

This proposal requests funding for the **Canton Validator Portal**: an open-source, unified operations platform purpose-built for Canton Network's 950+ validators and 13 super validators.

Today, Canton validator operators manage their infrastructure through a fragmented patchwork of tools: Google Sheets for tracking validator performance, Telegram and Slack groups for coordination, manual email for incident reporting, and individual Scan API endpoints for reward data. There is no unified system for validator operators to monitor node health, track rewards, communicate with the Foundation, coordinate network upgrades, or manage their hosted parties — all in one place.

The Canton Grants Portal proposal (660,000 CC) addresses the governance workflow gap for the Development Fund committee. The Validator Portal addresses a structurally identical gap — but for the 575+ organizations that actually **run the network**. Validators are Canton's core infrastructure. They store contract data, execute smart contract code, validate transactions, and earn Canton Coin for keeping the network alive. Yet they have no dedicated operational platform.

The Canton Validator Portal provides: real-time node health monitoring with alerting, historical reward tracking and analytics, a structured communication channel between validators and the Foundation, network upgrade coordination workflows, hosted party management visibility, multi-environment dashboards (DevNet/TestNet/MainNet), and a public validator leaderboard with uptime and performance metrics.

This is not a block explorer (CantonScan exists), not a general analytics dashboard (The Tie exists), not a rewards calculator (CC Tools exists). It is **operational infrastructure for the people who run Canton's nodes** — the missing layer between raw Scan API data and professional validator management.

---

## The Problem: Why This Matters Now

### Current State of Validator Operations

Canton Network has grown from 24 validators at launch (July 2024) to **575+ active validators** by October 2025, including 26 super validators powering the Global Synchronizer. This 24x growth happened without any corresponding investment in validator operational tooling.

Here is how validators currently manage their operations:

| Operation | Current Tool | Problem |
|-----------|-------------|---------|
| Performance tracking | Google Sheets (manual) | No automation, stale data, inconsistent formats |
| Reward monitoring | Individual Scan API queries | Requires technical expertise, no historical trends |
| Foundation communication | Telegram + Slack + Email | Unstructured, no audit trail, messages get lost |
| Upgrade coordination | Slack announcements + email | No acknowledgment tracking, no readiness verification |
| Incident reporting | 24/7 shared email inbox | No ticket tracking, no SLA visibility |
| Uptime monitoring | Self-hosted or third-party | Fragmented across providers, no network-wide view |
| Party hosting management | Canton Console (CLI) | Technical barrier, no visual interface |
| DevNet/TestNet/MainNet sync | Manual per-environment checks | Error-prone, version mismatches missed |

### Why This Cannot Scale

The Canton Foundation's validator requirements state that providers must demonstrate operation for at least 15 continuous days, with fewer than 50 rounds missed and all upgrades performed correctly. Providers must designate technical contacts and maintain a 24/7 shared inbox for incident reporting. As the network grows toward 1,000+ validators, enforcing and tracking these requirements through Google Sheets and chat groups becomes untenable.

The validator set now includes institutional operators (Goldman Sachs, HSBC, BNP Paribas, Circle), Node-as-a-Service providers (Kiln, P2P.org, IntellectEU, Obsidian Systems), crypto infrastructure firms (Binance.US, Crypto.com, Gemini, Kraken), and independent operators. These organizations expect professional operational tooling, not chat groups.

### What Exists Today (and What's Missing)

| Existing Tool | What It Does | What It Doesn't Do |
|--------------|-------------|-------------------|
| CantonScan | Block explorer, transaction search | No validator-specific operations dashboard |
| The Tie Dashboard | Network analytics, reward breakdowns | Read-only analytics, no operational actions |
| CC Tools | Rewards calculator, governance tracking | No node health monitoring, no communication |
| Canton Monitor | Basic uptime monitoring + alerts | No reward analytics, no Foundation communication |
| Canton Foundation Site | Validator application forms, documentation | No operational portal, no ongoing management |

**The gap is clear**: every tool above is either a read-only analytics view or a one-time application form. None of them provide an **operational workspace** where validators manage their day-to-day operations, communicate with the Foundation, coordinate upgrades, and track their performance over time.

---

## Solution: The Canton Validator Portal

### Core Modules

#### Module 1: Node Health & Performance Dashboard

A real-time monitoring dashboard for each validator showing:

- **Liveness status**: Connected/disconnected to Global Synchronizer, rounds participated vs missed
- **Uptime tracking**: Historical uptime percentage (daily, weekly, monthly, all-time)
- **Missed rounds counter**: Current streak and historical missed rounds against the <50 threshold
- **Multi-environment view**: Side-by-side status for DevNet, TestNet, and MainNet nodes
- **Version tracking**: Current Canton/Splice version running vs latest available
- **Alerting**: Configurable alerts (email, webhook, Telegram bot) for downtime, missed rounds, version mismatch

Data sources: Scan API endpoints from super validators, validator node health endpoints.

#### Module 2: Rewards Analytics & Tracking

Historical and real-time reward data:

- **Reward history**: Daily/weekly/monthly CC earnings with charts
- **Reward breakdown**: Validator liveness rewards vs app provider rewards vs super validator rewards
- **Comparative analytics**: Validator's performance vs network average
- **Projected earnings**: Based on current mint rate and halving schedule
- **Export**: CSV/PDF export for accounting and tax reporting
- **Multi-validator support**: Operators running multiple validators see aggregate and per-node views

#### Module 3: Foundation Communication Hub

A structured, auditable communication channel replacing Telegram/Slack:

- **Announcement feed**: Foundation announcements with read receipts and acknowledgment tracking
- **Upgrade notifications**: Formal upgrade notices with version details, breaking changes, and timelines
- **Ticket system**: Submit and track support requests to Foundation (replaces 24/7 email inbox)
- **Upgrade readiness**: Validators confirm upgrade readiness; Foundation sees completion percentage
- **Incident reports**: Structured incident submission with severity, timeline, and resolution tracking
- **Audit trail**: Every communication timestamped and archived (not lost in chat scrollback)

#### Module 4: Validator Profile & Compliance

Public and private validator information management:

- **Public profile**: Validator name, organization, website, description, uptime stats (for the public leaderboard)
- **Compliance tracker**: Status against Foundation requirements (15-day continuous operation, <50 missed rounds, upgrade completion)
- **NaaS provider profiles**: Node-as-a-Service providers can showcase their offering and track client validators
- **Party hosting inventory**: Visual overview of parties hosted on the validator, their activity levels
- **Key management status**: Last key rotation date, key security posture (KMS vs local)

#### Module 5: Public Validator Leaderboard

A public-facing page showing network health through validator performance:

- **Validator rankings**: By uptime, rewards earned, longevity, hosted party count
- **Network health metrics**: Total validators, super validators, aggregate uptime, missed rounds rate
- **Geographic distribution**: Where validators are hosted (cloud region, country)
- **Growth trends**: New validators joining over time, active vs inactive

This serves dual purposes: public transparency (anyone can see network health) and competitive motivation (validators want to rank well).

---

## Why This Should Be Approved

### The Grants Portal Precedent

The Canton Grants Portal proposal requests **660,000 CC** (330,000 build + 330,000 maintenance) for governance workflow infrastructure serving the Development Fund committee — a group of perhaps 10-20 reviewers managing grant proposals.

The Validator Portal serves **575+ organizations** that physically operate the network's infrastructure. These are the entities that:
- Validate $6 trillion in tokenized assets
- Process $280 billion in daily repo volume
- Maintain 600,000+ daily transactions
- Include Goldman Sachs, HSBC, BNP Paribas, Circle, Binance.US, and hundreds more

If governance tooling for a committee of 20 is worth 660,000 CC, operational tooling for 575+ infrastructure operators handling trillions in assets is worth significantly more — not because the technology is more complex, but because the impact surface is 30-50x larger.

### Direct Ecosystem Benefits

**For Validators**: Professional operational tooling reduces monitoring overhead, prevents missed rounds (protecting reward earnings), streamlines upgrade coordination, and provides clear compliance tracking. Operators spend less time in spreadsheets and chat groups, more time ensuring node reliability.

**For the Canton Foundation**: Structured communication replaces informal channels. Upgrade rollouts become trackable. Compliance verification becomes automated rather than manual. Incident response has proper ticket tracking instead of email threads.

**For Node-as-a-Service Providers**: A standardized client dashboard for showing hosted validator performance to institutional clients. Currently, providers like Kiln, P2P.org, and IntellectEU build their own custom dashboards — duplicated effort that a shared platform eliminates.

**For the Network**: Better operational tooling → higher average uptime → fewer missed rounds → more reliable transaction processing → stronger institutional confidence in Canton as production infrastructure.

**For Transparency**: A public leaderboard gives the broader Canton community (token holders, app developers, institutions considering joining) visibility into who runs the network and how well they do it.

---

## Scope

### In Scope

- Real-time validator health monitoring with alerting
- Historical reward tracking and analytics with export
- Structured Foundation-to-validator communication hub
- Upgrade coordination with readiness tracking
- Validator compliance dashboard
- Public validator leaderboard
- Multi-environment support (DevNet, TestNet, MainNet)
- Multi-validator support for operators running several nodes
- Open-source codebase (MIT or Apache 2.0 license)

### Design Principles

- **Data from existing APIs**: Uses Scan API, validator health endpoints, and Foundation data — no new on-chain contracts required
- **Canton Foundation alignment**: Built in coordination with Foundation operational needs
- **Validator-first UX**: Designed for the daily workflow of a node operator, not a casual viewer
- **Progressive disclosure**: Basic monitoring for all validators, advanced analytics for those who want depth
- **Open source**: Any validator or NaaS provider can self-host or contribute

### Out of Scope

- Replacing CantonScan as a block explorer
- General-purpose network analytics (The Tie covers this)
- Rewards calculation modeling (CC Tools covers this)
- Validator node deployment or management (Kiln, Obsidian, IntellectEU cover this)
- On-chain governance voting (separate concern)
- Canton Coin trading or exchange features

---

## Deliverables & Milestones

### Milestone 1: Core Dashboard & Monitoring (Weeks 1-6)

**Deliverables:**
- Node health dashboard with liveness, uptime, and missed rounds tracking
- Multi-environment view (DevNet/TestNet/MainNet)
- Basic alerting (email + webhook) for downtime and missed rounds
- Validator authentication (Ed25519 key-based, same identity model as Canton)
- Public validator directory (basic listing)

**Value metric:** 10+ validators actively using the dashboard for daily monitoring.

### Milestone 2: Rewards Analytics & Communication Hub (Weeks 7-12)

**Deliverables:**
- Historical reward tracking with daily/weekly/monthly charts
- Reward breakdown by type (liveness, app, super validator)
- CSV/PDF export for accounting
- Foundation announcement feed with acknowledgment tracking
- Support ticket system replacing email inbox
- Upgrade notification workflow with readiness confirmation

**Value metric:** Foundation uses the portal for at least one upgrade coordination cycle.

### Milestone 3: Compliance, Leaderboard & NaaS Features (Weeks 13-18)

**Deliverables:**
- Compliance tracker against Foundation requirements
- Public validator leaderboard with rankings
- NaaS provider profiles and client validator views
- Party hosting inventory visualization
- Hardened security, performance optimization, documentation

**Value metric:** Portal supports 100+ registered validators with public leaderboard live.

### Milestone 4: 12-Month Maintenance & Reliability Window

**Deliverables:**
- Bug fixes, security patches, dependency updates
- Scan API compatibility maintenance as Canton upgrades
- Feature refinements based on validator feedback
- Uptime SLA for hosted instance (99.5%+)

**Value metric:** Portal remains operational and adopted across one full year with documented maintenance history.

---

## Technical Architecture

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **Charts**: Recharts for reward analytics, real-time updates via WebSocket
- **Auth**: Ed25519 key-based authentication (consistent with Canton identity model)

### Backend
- **Framework**: FastAPI (Python) or Express (Node.js)
- **Database**: PostgreSQL for historical data, Redis for real-time caching
- **Data ingestion**: Polling Scan APIs from super validators on configurable intervals
- **Alerting**: Email (SMTP), webhooks, Telegram Bot API

### Data Sources
- **Scan API**: Validator liveness, reward data, network state (publicly available from SV endpoints)
- **Canton Foundation API**: Announcements, upgrade schedules, compliance requirements (to be coordinated)
- **Validator self-reported**: Profile information, contact details, NaaS offerings

### Deployment
- **Hosted instance**: Foundation-operated or community-operated deployment
- **Self-hostable**: Docker Compose for NaaS providers who want private instances
- **Open source**: Full codebase on GitHub under permissive license

---

## Funding

**Total Funding Request:** 450,000 CC for build and launch, plus 300,000 CC for a bounded 12-month post-launch maintenance window.

### Payment Breakdown

| Milestone | Amount | Trigger |
|-----------|--------|---------|
| Milestone 1: Core Dashboard & Monitoring | 150,000 CC | Delivery + acceptance |
| Milestone 2: Rewards & Communication Hub | 150,000 CC | Delivery + acceptance |
| Milestone 3: Compliance, Leaderboard, NaaS | 150,000 CC | Delivery + acceptance |
| Milestone 4: 12-month maintenance | 300,000 CC | Quarterly (75,000 CC × 4) |
| **Total** | **750,000 CC** | |

### Justification

The Grants Portal serves ~20 committee reviewers at 660,000 CC. The Validator Portal serves 575+ operators who run Canton's infrastructure. The per-beneficiary cost is dramatically lower, and the operational impact on network reliability is direct and measurable.

Maintenance equivalent: ~25,000 CC per month (~$4,800 at current rates) for one senior developer covering bug response, Scan API compatibility, security updates, and feature refinements.

### Volatility Stipulation

The grant is denominated in fixed Canton Coin. Milestones should be re-evaluated at the 6-month mark if CC/USD volatility materially affects delivery assumptions.

---

## Team Background

[Your team description here — emphasize:]
- Experience building operational dashboards and monitoring tools
- Familiarity with Canton Network architecture and Scan API
- Experience with institutional-grade infrastructure tooling
- Track record of open-source contributions
- Existing engagement with Canton ecosystem (validator operation, app development, etc.)

---

## Competitive Landscape & Differentiation

| Feature | CC Tools | Canton Monitor | The Tie | **Validator Portal** |
|---------|----------|---------------|---------|---------------------|
| Node health monitoring | ✗ | ✓ (basic) | ✗ | ✓ (comprehensive) |
| Reward analytics | Calculator only | ✗ | ✓ (read-only) | ✓ (per-validator, exportable) |
| Foundation communication | ✗ | ✗ | ✗ | ✓ |
| Upgrade coordination | ✗ | ✗ | ✗ | ✓ |
| Compliance tracking | ✗ | ✗ | ✗ | ✓ |
| Multi-environment view | ✗ | ✗ | ✗ | ✓ |
| Public leaderboard | Partial | ✗ | ✓ (analytics) | ✓ (operational) |
| Ticket system | ✗ | ✗ | ✗ | ✓ |
| NaaS provider dashboard | ✗ | ✗ | ✗ | ✓ |
| Open source | ✗ | ✗ | ✗ | ✓ |

The Validator Portal is **additive** to existing tools. It doesn't replace CantonScan for exploration, The Tie for analytics, or CC Tools for calculations. It adds the missing **operational layer** for validators.

---

## Acceptance Criteria

Completion will be evaluated based on:

- Delivery of milestone scope as described
- Demonstrated functionality with real validator data from DevNet/TestNet/MainNet
- Adoption by at least 50 validators within 3 months of launch

Project-specific conditions:

- Data sourced from public Scan API endpoints (no proprietary data dependencies)
- Foundation communication features coordinated with GSF operational team
- Portal supports at least 1,000 validators and 50 NaaS provider profiles
- Public leaderboard data preserves validator privacy preferences (opt-in to detailed visibility)
- The platform is released as open source under a permissive license
- Self-hosting documentation enables NaaS providers to run private instances

---

## Co-Marketing

Upon release, the implementing team will collaborate with the Foundation on:

- Announcement coordination via Canton Network channels
- Technical write-up on validator operational best practices enabled by the portal
- Public walkthrough of the monitoring dashboard and communication hub
- Validator onboarding guide for the portal
- Presentation at a Canton community event or validator call

---

## Appendix: Research & Supporting Data

### Canton Validator Growth

- July 2024: 24 validators at network launch
- October 2025: 575+ active validators, 26 super validators
- Growth rate: ~24x in 15 months
- Projection: 1,000+ validators by end of 2026

### Institutional Validators (Partial List)

Goldman Sachs, HSBC, BNP Paribas, Circle, Chainlink, Binance.US, Crypto.com, Gemini, Kraken, Coin Metrics, P2P.org, Kiln, IntellectEU, Obsidian Systems, Bitcoin Suisse, BitGo, Taurus, Copper, DRW, Tradeweb.

### Network Activity (as of late 2025)

- $6 trillion+ in tokenized assets on-chain
- $280 billion daily U.S. Treasury repo volume
- 600,000+ daily transactions
- 15 million+ monthly settlements in Canton Coin

### Comparable Ecosystem Precedents

| Network | Validator Portal | Notes |
|---------|-----------------|-------|
| Ethereum | beaconcha.in, rated.network | Mature validator monitoring with staking analytics |
| Solana | stakewiz.com, validators.app | Comprehensive validator performance and commission tracking |
| Cosmos | mintscan.io, smartstake.io | Multi-chain validator analytics with governance integration |
| Polkadot | polkadot.js, subscan.io | Validator nomination and performance dashboards |
| **Canton** | **Nothing equivalent exists** | This is the gap the Validator Portal fills |

Every major proof-of-stake network has dedicated validator operational tooling. Canton, despite having $6T in assets and 575+ validators, has none. This proposal addresses that gap directly.
