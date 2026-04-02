# Development Fund Proposal: Canton Fee Estimator

## Pre-Submission Transaction Cost Intelligence for Canton Developers and Applications

**Author:** Jalaj Nagar
**GitHub:** [@jalajnagar88-stack](https://github.com/jalajnagar88-stack)
**Repository:** [jalajnagar88-stack/canton-fee-estimator](https://github.com/jalajnagar88-stack/canton-fee-estimator)
**Status:** Draft
**Created:** 2026-04-02

---

## Abstract

Canton Fee Estimator is an open-source developer SDK and API that provides accurate, pre-submission transaction cost estimates for Canton Network applications. The tool gives Canton developers a programmatic answer to the question every builder asks on day one: *"How much will this transaction cost before I submit it?"*

Development is already underway. The core repository at [jalajnagar88-stack/canton-fee-estimator](https://github.com/jalajnagar88-stack/canton-fee-estimator) contains working scaffolding for the estimation engine, TypeScript SDK, and simulation backend. This proposal requests funding to complete and maintain it as a public good for the Canton ecosystem.

Canton currently has no fee estimation primitive. Ethereum has `eth_estimateGas`. Solana has `getFeeForMessage`. Cosmos has the `simulate` endpoint. Every major blockchain infrastructure layer treats fee estimation as a first-class developer tool. Canton does not — and every application developer, DeFi protocol, and NaaS provider building on Canton pays for this gap daily in the form of failed transactions, hard-coded buffers, and broken CI pipelines.

This proposal requests **400,000 CC** across 3 milestones plus a bounded maintenance window to deliver the Canton Fee Estimator as a fully open-source, self-hostable SDK and API that benefits every current and future Canton developer.

---

## Motivation

Canton Network has 980+ active validators, 20+ funded Dev Fund projects, and institutional participants including Goldman Sachs, HSBC, BNP Paribas, and Broadridge building on its ledger. Every single application developer, DeFi protocol, and NaaS provider working on Canton faces the same invisible wall on day one: **there is no way to know what a transaction will cost before submitting it**.

**Key problems Canton Fee Estimator addresses:**

- **No pre-submission cost primitive:** Every other major blockchain — Ethereum (`eth_estimateGas`), Solana (`getFeeForMessage`), Cosmos (`simulate`), Polkadot (`paymentInfo`) — has a first-class fee estimation API. Canton does not. Developers either submit blind or write custom simulation scripts.
- **Duplicated estimation hacks across every project:** Review any funded Dev Fund proposal with DeFi or financial logic — ACME, Alpend, Cantex, Hecto, Edel Finance — and each has its own hard-coded fee buffer. When Canton upgrades its fee model, every one of those apps breaks independently.
- **No CI/CD integration point for cost regression:** Developers cannot gate their deployment pipelines on fee cost changes. A Canton upgrade can silently increase transaction costs 3x with no automated detection.
- **No fee visibility for end users of dApps:** Every user-facing Canton application that wants to show "estimated cost: X CC" before a transaction must write their own estimation logic from scratch. The result is inconsistent UX across the ecosystem.
- **No production alerting for fee anomalies:** NaaS providers and institutional operators have no automated way to detect when transaction costs spike unexpectedly — a critical gap for SLA management.

---

## Specification

### 1. Objective

Deliver the Canton Fee Estimator as a fully open-source, developer-facing SDK and API that becomes the canonical fee estimation standard for Canton Network — the same role `eth_estimateGas` plays on Ethereum. Build it once, maintained as a public good, usable by every current and future Canton application.

### 2. Work Already In Progress

Unlike proposals for products that don't exist yet, Canton Fee Estimator is actively under development. The repository at [jalajnagar88-stack/canton-fee-estimator](https://github.com/jalajnagar88-stack/canton-fee-estimator) already contains:

- Core project scaffolding and repository structure
- Initial simulation engine design and Canton Ledger API integration layer
- TypeScript SDK skeleton with `estimate()` and `estimateBatch()` method signatures
- FastAPI backend with `/estimate`, `/stats`, and `/health` endpoint stubs
- PostgreSQL schema for historical fee storage
- Docker Compose configuration for local development

This grant funds completion, hardening, documentation, and ongoing maintenance of work that has already begun — reducing execution risk compared to proposals starting from scratch.

### 3. Implementation Plan

**Estimation Engine:** Wraps the Canton Ledger API simulation endpoint. Accepts a Daml command description, runs a dry simulation against a shadow node, returns fee estimate as a structured range with p50/p75/p95 confidence bands. Falls back to historical percentile data when simulation is unavailable.

**TypeScript + Python SDKs:** Thin client wrappers. Developers call `estimate(command)` before `submit(command)`. No changes to existing Canton Ledger API workflows required. Ships as `npm install @canton/fee-estimator` and `pip install canton-fee-estimator`.

**Web Calculator:** Browser-based tool for developers exploring fee structures without writing code. Accepts contract type, party count, payload size, network. Returns breakdown with percentile context. Shareable estimate links for team review.

**Historical Fee Database:** Background worker ingesting confirmed transaction fees from public Scan API endpoints. Powers the estimation engine's prior distributions and percentile API.

**Fee Anomaly Alerting:** Production monitoring for Canton applications. Configurable thresholds per application, delivery via webhook, email, or Telegram. Catches fee spikes before users are impacted.

### 4. Architectural Alignment

- **Backend:** FastAPI (Python), PostgreSQL, Redis — standard, self-hostable stack
- **SDKs:** Native ESM/CJS TypeScript, async Python — no new dependencies required in consuming apps
- **Frontend:** Next.js 14+, Tailwind CSS, shadcn/ui — consistent with Canton ecosystem tooling
- **Deployment:** Docker Compose for self-hosting; hosted public instance for free use
- **License:** Apache 2.0 — unrestricted use by Foundation, validators, and developers

### 5. Out of Scope

- Rewards estimation (CC Tools covers this)
- Validator operations tooling (Validator Portal covers this)
- Block exploration (CantonScan covers this)
- Custom per-application fee models (consulting scope)

---

## Milestones and Deliverables

### Milestone 1: Estimation Engine, TypeScript SDK & Web Calculator

| Detail | Description |
|--------|-------------|
| **Estimated Delivery** | Month 1–2 from grant approval |
| **Focus** | Core estimation engine, TypeScript SDK, basic web UI |
| **Funding** | 120,000 CC |

**Deliverables:**

- Fee estimation API (`/estimate`, `/estimate/batch`, `/estimate/history`) deployed against DevNet, TestNet, and MainNet
- TypeScript SDK (`@canton/fee-estimator`) published to npm with `estimate()`, `estimateBatch()`, `getHistoricalFees()` methods
- Web calculator UI: contract type selector, network toggle, fee breakdown with percentile context, shareable links
- Integration with 3+ public Scan API endpoints for historical data ingestion
- Estimation accuracy test suite: ≥90% of estimates within ±10% of confirmed fees on TestNet

**Acceptance Criteria:**

- TypeScript SDK installable via `npm install @canton/fee-estimator` with working types
- Web calculator live and functional against TestNet and MainNet
- At least 1 Canton DeFi protocol (ACME, Alpend, Cantex, or Hecto) able to integrate the SDK for pre-submission cost checks
- Estimation accuracy report published showing real vs. estimated fee comparison on 100+ TestNet transactions

---

### Milestone 2: Python SDK, Historical Database & Documentation

| Detail | Description |
|--------|-------------|
| **Estimated Delivery** | Month 3–4 from grant approval |
| **Focus** | Python SDK, percentile API, developer documentation |
| **Funding** | 120,000 CC |

**Deliverables:**

- Python SDK (`canton-fee-estimator`) published to PyPI with full feature parity to TypeScript SDK
- Historical fee database with 30-day rolling data, per-contract-type breakdowns, p50/p75/p95 percentile API
- Developer documentation portal: integration guide, API reference, quickstart for TypeScript and Python, architecture docs
- Example integrations for 3 Canton application patterns: DeFi swap fee modeling, multi-party settlement cost estimation, KYC attestation cost display
- OpenAPI specification published for all estimation endpoints

**Acceptance Criteria:**

- Python SDK installable via `pip install canton-fee-estimator` with working async and sync interfaces
- Percentile API returning real data from at least 30 days of historical fees
- At least 3 Dev Fund-funded project teams have reviewed the SDK and confirmed integration feasibility
- Documentation site publicly accessible with working code examples

---

### Milestone 3: Anomaly Alerting, Production Hardening & Self-Hosting

| Detail | Description |
|--------|-------------|
| **Estimated Delivery** | Month 5–6 from grant approval |
| **Focus** | Production reliability, anomaly alerting, self-hosting, API hardening |
| **Funding** | 60,000 CC |

**Deliverables:**

- Fee anomaly alerting system: configurable thresholds per application, webhook/email/Telegram delivery
- Rate limiting, API key management, and abuse protection on hosted instance
- Load testing report demonstrating 500+ requests/minute sustained throughput
- Self-hosting guide: Docker Compose deployment with PostgreSQL + Redis, one-command setup
- Web calculator upgraded: historical percentile charts, embed code for documentation sites

**Acceptance Criteria:**

- At least one production Canton application or NaaS provider using anomaly alerting in a live deployment
- Self-hosting documentation tested by at least one external team
- Hosted instance uptime ≥ 99% during milestone period (monitored via UptimeRobot or equivalent)

---

### Ongoing: Maintenance (Post-Grant)

- Scan API compatibility updates as Canton upgrades its ledger and fee model
- SDK version management with clear deprecation policy
- Bug fixes, security patches, dependency updates
- Community feedback integration
- Funded by: hosted instance API subscriptions (free tier + paid tier for higher volume)

---

## Acceptance Criteria (Global)

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone
- All features deployed and accessible on a public hosted instance (not staging)
- Demonstrated estimation accuracy with real Canton transaction data
- SDKs published to npm and PyPI and installable by any developer
- All code released as open source under Apache 2.0 license
- Documentation enabling a new Canton developer to integrate fee estimation in under 10 minutes

---

## Funding

**Total Funding Request: 400,000 CC**

| Milestone | Description | Amount |
|-----------|-------------|--------|
| Milestone 1 | Estimation engine + TypeScript SDK + web calculator | 120,000 CC |
| Milestone 2 | Python SDK + historical database + documentation | 120,000 CC |
| Milestone 3 | Anomaly alerting + production hardening + self-hosting | 60,000 CC |
| Milestone 4 | 12-month post-launch maintenance window | 100,000 CC |
| **Total** | | **400,000 CC** |

**Volatility Stipulation:** The grant duration is 6 months. The grant is denominated in fixed Canton Coin. Should significant USD/CC price volatility occur during the grant period, milestones may be renegotiated to ensure deliverability.

---

## Co-Marketing

Upon completion of each milestone, Canton Fee Estimator will collaborate with the Foundation on:

- Announcement coordination via Canton Network developer channels and community calls
- Technical blog post: "How Fee Estimation Works on Canton — Under the Hood"
- Live integration demo with at least one existing Dev Fund project (DeFi or settlement application)
- Developer onboarding video: first fee estimate in under 5 minutes from a fresh Canton environment
- Documentation listing Canton Fee Estimator as the recommended fee estimation approach for new builders

---

## Rationale

Canton Fee Estimator is the right grant because:

- **Work already started, not speculative:** The repository has existing commits, architecture decisions made, and scaffolding in place. This grant funds completion, not exploration — reducing the committee's execution risk.
- **Fills a verified infrastructure gap:** Fee estimation is not a nice-to-have. It is a prerequisite for any Canton application that manages budgets, displays costs to users, or runs in production CI/CD. The gap is real and documented across community channels.
- **Ecosystem multiplier, not a point solution:** Every funded Dev Fund project — DeFi, identity, custody, developer tools — benefits from a shared estimation standard. This is not a single application; it is infrastructure that makes every other application better.
- **Direct impact on Canton DeFi adoption:** ACME, Alpend, Cantex, Hecto, and Edel Finance are all building DeFi on Canton. Every DeFi protocol requires accurate fee modeling for margin calculations, liquidation thresholds, and user-facing cost display. They all need this SDK.
- **Prevents long-term ecosystem fragmentation:** Without a standard, each project builds its own estimation shim. When Canton upgrades its fee model, every app breaks. One maintained standard prevents years of technical debt across the ecosystem.
- **Revenue path toward sustainability:** A free tier for individual developers, paid tier for higher API volume, and self-hosting option for enterprises provides a sustainability path beyond grant funding.

---

## Competitive Landscape

| Feature | CantonScan | CCTools | Canton Wallet | **Fee Estimator** |
|---|---|---|---|---|
| Pre-submission cost estimate | ✗ | ✗ | Wallet-only | ✓ (SDK + API) |
| TypeScript SDK | ✗ | ✗ | ✗ | ✓ |
| Python SDK | ✗ | ✗ | ✗ | ✓ |
| Historical fee percentiles | Partial | ✗ | ✗ | ✓ |
| Web calculator | ✗ | Rewards only | ✗ | ✓ |
| Fee anomaly alerting | ✗ | ✗ | ✗ | ✓ |
| Batch estimation | ✗ | ✗ | ✗ | ✓ |
| Multi-network (DevNet/TestNet/MainNet) | ✓ | ✗ | ✗ | ✓ |
| Open source + self-hostable | ✗ | ✗ | ✗ | ✓ |

Canton Fee Estimator is **additive to every existing tool**. It does not replace CantonScan for exploration, CCTools for community analytics, or the Canton Wallet for user transactions. It adds the missing developer cost-intelligence layer that none of those tools provide.

---

## Team

| Name | Role | Background |
|------|------|------------|
| Jalaj Nagar | Lead Developer | Full-stack developer with experience building SDK libraries, developer tooling, and API services. Familiar with Canton Network architecture, Ledger API, and Scan API data structures. Active Canton ecosystem contributor. Repository: [jalajnagar88-stack/canton-fee-estimator](https://github.com/jalajnagar88-stack/canton-fee-estimator) |
| TBD | Part-time Developer | Backend and SDK development support. To be engaged for Milestone 2 Python SDK and documentation work. |

---

*Canton Fee Estimator — Pre-submission cost intelligence for Canton Network*
*github.com/jalajnagar88-stack/canton-fee-estimator*
