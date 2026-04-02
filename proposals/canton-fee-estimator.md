## Canton Fee Estimator: Pre-Submission Transaction Cost Intelligence for Canton Network

**Author:** Jalaj Nagar (jalajnagar88@gmail.com)
**GitHub:** [@jalajnagar88-stack](https://github.com/jalajnagar88-stack)
**Repository:** [jalajnagar88-stack/canton-fee-estimator](https://github.com/jalajnagar88-stack/canton-fee-estimator)
**Status:** Submitted
**Created:** 2026-04-02

---

## Abstract

Canton Fee Estimator is an open-source developer SDK and API that provides accurate, pre-submission transaction cost estimates for Canton Network applications. It gives Canton developers a programmatic answer to the question every builder faces on day one: *"How much will this transaction cost before I submit it?"*

Canton currently has no fee estimation primitive. Ethereum has `eth_estimateGas`. Solana has `getFeeForMessage`. Cosmos has the `simulate` endpoint. Every major blockchain infrastructure layer treats fee estimation as a first-class developer tool. Canton does not — and every application developer, DeFi protocol, and NaaS provider building on Canton pays for this gap in the form of hard-coded buffers, inconsistent UX, and silent cost regressions across CI pipelines.

The repository at [jalajnagar88-stack/canton-fee-estimator](https://github.com/jalajnagar88-stack/canton-fee-estimator) is already active. The initial work includes: a working TypeScript SDK skeleton, a FastAPI backend with estimation endpoint stubs, a Scan API integration layer that reads confirmed transaction fees from Canton TestNet, and a PostgreSQL schema for historical fee storage. This proposal requests **340,000 CC** across 3 milestones to complete, harden, and maintain the Canton Fee Estimator as a permanent public good for the ecosystem.

---

## Motivation

Canton Network has 980+ active validators and institutional participants including Goldman Sachs, HSBC, BNP Paribas, and Broadridge building on its ledger. Every single application developer, DeFi protocol, and NaaS provider working on Canton faces the same infrastructure gap on day one: **there is no way to know what a transaction will cost before submitting it.**

### What I observed building on Canton TestNet

During development of this tool, I connected to Canton TestNet and began querying the public Scan API to understand how fee data is structured. Key findings:

- The Scan API exposes completed transaction metadata including fee amounts, party counts, and contract identifiers. This is sufficient to build a robust historical percentile estimation model.
- Fee amounts vary meaningfully by contract type, party count, and payload size — patterns that can be modelled from historical data with useful accuracy.
- There is no existing tooling to surface this data to developers before transaction submission. Every project I reviewed in the funded Dev Fund queue — ACME, Alpend, Cantex, Hecto — hard-codes fee buffers independently. When Canton's fee model changes, each breaks separately.
- The Ledger API (v2) does not expose a public dry-run simulation endpoint comparable to Cosmos `simulate`. The estimation approach in this proposal therefore uses **historical percentile distribution from Scan API data combined with transaction attribute modelling** — a more practical and equally reliable approach given Canton's actual API surface.

These observations are documented in the repository's [`LEARNINGS.md`](https://github.com/jalajnagar88-stack/canton-fee-estimator/blob/main/LEARNINGS.md), which records TestNet connection attempts, Scan API response structures, and fee pattern observations across 50+ transactions.

### Problems this tool directly solves

- **No pre-submission cost primitive:** Canton developers submit blind or maintain custom estimation scripts. Ethereum has `eth_estimateGas`. Solana has `getFeeForMessage`. Canton has nothing. This proposal fills that gap with a single maintained standard.
- **Duplicated estimation hacks across every funded project:** Each funded DeFi project writes its own fee buffer. One shared SDK means Canton upgrades break one tool, not twenty.
- **No CI/CD cost regression detection:** Developers cannot gate deployment pipelines on fee changes. A silent 3× fee increase goes undetected until users notice.
- **No user-facing cost display primitive:** Every Canton dApp that wants to show "estimated cost: X CC" before a transaction must build its own logic. The result is inconsistent UX across the ecosystem.
- **No production alerting for fee anomalies:** NaaS providers and institutional operators have no automated way to detect fee spikes — a critical gap for SLA management.

---

## Specification

### 1. Objective

Deliver the Canton Fee Estimator as a fully open-source, developer-facing SDK and API that becomes the canonical fee estimation standard for Canton Network. Build it once, maintained as a public good, usable by every current and future Canton application.

### 2. What Is Already Built

The repository at [jalajnagar88-stack/canton-fee-estimator](https://github.com/jalajnagar88-stack/canton-fee-estimator) currently contains:

- **Scan API integration:** Working TypeScript module that queries Canton TestNet's public Scan API, parses confirmed transaction fee records, and stores structured fee observations in PostgreSQL. The module has been run against TestNet and has collected fee samples across multiple contract types.
- **Historical fee database schema:** PostgreSQL schema with tables for `fee_observations`, `fee_percentiles`, and `estimation_requests`. Migration scripts included.
- **TypeScript SDK skeleton:** `estimate()` and `estimateBatch()` method signatures with typed inputs and outputs. Internal fee lookup against historical percentile table is stubbed and being wired to real data.
- **FastAPI backend:** `/estimate`, `/estimate/batch`, `/stats`, and `/health` endpoint stubs. Request validation and response serialisation implemented; estimation logic in progress.
- **CLI interface:** `canton-estimate` CLI that accepts a contract description and outputs a fee range. Wraps the API.
- **Docker Compose configuration:** Local development environment with PostgreSQL, Redis, and the FastAPI backend.
- **LEARNINGS.md:** Documented Canton TestNet observations, Scan API response structures, and fee pattern findings.

This grant funds completion, hardening, documentation, and ongoing maintenance — not greenfield exploration.

### 3. Estimation Approach

**Primary method — historical percentile distribution:**
The estimation engine ingests confirmed transaction fees from Canton's public Scan API, grouped by contract type, party count, and payload size bucket. Given a new transaction description, it looks up the matching historical distribution and returns p50/p75/p95 fee estimates with a confidence band. This approach does not require a simulation endpoint — it works with Canton's actual public API surface today.

**Fallback method — attribute-based modelling:**
For contract types with insufficient historical data, the engine uses a lightweight regression model trained on the observable relationship between payload size, party count, and fees in the historical dataset. This provides useful estimates even for newly deployed contracts.

**Accuracy target:** ≥90% of estimates within ±15% of confirmed fees on TestNet, measured across a 100+ transaction validation dataset published with Milestone 1.

### 4. Components

**TypeScript + Python SDKs:** Thin client wrappers. Developers call `estimate(command)` before `submit(command)`. No changes to existing Canton Ledger API workflows required. Ships as `npm install @canton/fee-estimator` and `pip install canton-fee-estimator`.

**Web Calculator:** Browser-based tool for developers exploring fee structures without writing code. Accepts contract type, party count, payload size, and network selection. Returns fee breakdown with percentile context and shareable estimate links.

**Historical Fee Database:** Background worker ingesting confirmed transaction fees from public Scan API endpoints. Powers the estimation engine's prior distributions and percentile API. 30-day rolling retention on hosted instance; self-hosters retain indefinitely.

**Fee Anomaly Alerting:** Production monitoring for Canton applications. Configurable thresholds per application, delivery via webhook, email, or Telegram. Catches fee spikes before users are impacted.

### 5. Architectural Alignment

| Layer | Technology | Notes |
|---|---|---|
| Backend | FastAPI (Python), PostgreSQL, Redis | Standard self-hostable stack |
| SDKs | TypeScript (ESM/CJS), Python (async + sync) | No new dependencies in consuming apps |
| Frontend | Next.js 14+, Tailwind CSS, shadcn/ui | Consistent with Canton ecosystem tooling |
| Data source | Canton Scan API (public) | No privileged access required |
| Deployment | Docker Compose | One-command self-hosting |
| License | Apache 2.0 | Unrestricted use by Foundation, validators, developers |

### 6. Out of Scope

- Rewards estimation (CCTools covers this)
- Validator operations tooling (Validator Portal covers this)
- Block exploration (CantonScan covers this)
- Custom per-application fee models (consulting scope)

---

## Milestones and Deliverables

### Milestone 1: Estimation Engine, TypeScript SDK & Web Calculator

| | |
|---|---|
| **Estimated Delivery** | Month 1–2 from grant approval |
| **Focus** | Core estimation engine, TypeScript SDK, live fee data, web UI |
| **Funding** | 100,000 CC |

**Deliverables:**

- Fee estimation API (`/estimate`, `/estimate/batch`, `/estimate/history`) deployed against TestNet and MainNet, returning real p50/p75/p95 estimates from historical Scan API data
- TypeScript SDK (`@canton/fee-estimator`) published to npm with `estimate()`, `estimateBatch()`, `getHistoricalFees()` methods and full TypeScript types
- Web calculator UI: contract type selector, network toggle, party count input, fee breakdown with percentile context, shareable estimate links
- Scan API ingestion worker running continuously against TestNet and MainNet, storing structured fee observations
- Estimation accuracy validation report: 100+ TestNet transactions, real vs. estimated fee comparison, published as a public artifact in the repository

**Acceptance Criteria:**

- `npm install @canton/fee-estimator` installs successfully with working TypeScript types
- Web calculator is live and publicly accessible against TestNet and MainNet
- Estimation accuracy report demonstrates ≥90% of estimates within ±15% of confirmed TestNet fees
- At least 1 Canton DeFi protocol team (ACME, Alpend, Cantex, or Hecto) has reviewed the SDK and confirmed integration feasibility

---

### Milestone 2: Python SDK, Historical Database & Documentation

| | |
|---|---|
| **Estimated Delivery** | Month 3–4 from grant approval |
| **Focus** | Python SDK, percentile API, developer documentation, ecosystem integrations |
| **Funding** | 100,000 CC |

**Deliverables:**

- Python SDK (`canton-fee-estimator`) published to PyPI with full feature parity to TypeScript SDK, including async and sync interfaces
- Historical fee database with 30-day rolling data, per-contract-type breakdowns, and a public percentile API endpoint
- Developer documentation portal: integration guide, API reference, TypeScript and Python quickstart, architecture documentation
- Example integrations for 3 Canton application patterns: DeFi swap fee modelling, multi-party settlement cost estimation, KYC attestation cost display
- OpenAPI specification published for all estimation endpoints

**Acceptance Criteria:**

- `pip install canton-fee-estimator` installs successfully with working async and sync interfaces
- Percentile API returns real data derived from at least 30 days of continuous historical fee ingestion
- At least 3 Dev Fund-funded project teams have reviewed the SDK and confirmed integration feasibility in writing (GitHub comment or documented communication)
- Documentation site is publicly accessible with working, copy-pasteable code examples

---

### Milestone 3: Anomaly Alerting, Production Hardening & Self-Hosting

| | |
|---|---|
| **Estimated Delivery** | Month 5–6 from grant approval |
| **Focus** | Production reliability, anomaly alerting, self-hosting, API hardening |
| **Funding** | 40,000 CC |

**Deliverables:**

- Fee anomaly alerting system with configurable thresholds per application and delivery via webhook, email, and Telegram
- Rate limiting, API key management, and abuse protection on the hosted public instance
- Load testing report demonstrating ≥500 requests/minute sustained throughput
- Self-hosting guide: Docker Compose deployment with PostgreSQL + Redis, tested end-to-end by at least one external team
- Web calculator upgrade: historical percentile charts, embed code for documentation sites

**Acceptance Criteria:**

- At least one production Canton application or NaaS provider is using anomaly alerting in a live deployment
- Self-hosting documentation has been tested and confirmed working by at least one external team
- Hosted instance uptime ≥99% during the milestone period, monitored via UptimeRobot or equivalent (public status page linked)

---

### Ongoing: Maintenance (Post-Grant)

- Scan API compatibility updates as Canton upgrades its ledger and fee model
- SDK version management with clear deprecation policy (semver, changelog maintained)
- Bug fixes, security patches, dependency updates
- Community feedback integration via GitHub Issues
- Sustainability: hosted instance free tier for individual developers, paid tier for high-volume API consumers, self-hosting option for enterprises

---

## Acceptance Criteria (Global)

The Tech & Ops Committee will evaluate completion based on:

- All milestone deliverables deployed and accessible on a public hosted instance (not staging)
- Demonstrated estimation accuracy against real Canton transaction data, published as a reproducible report
- SDKs published to npm and PyPI and installable by any developer without additional configuration
- All code released as open source under Apache 2.0 license in the public repository
- Documentation enabling a new Canton developer to make their first fee estimate in under 10 minutes from a blank environment

---

## Funding

**Total Funding Request: 340,000 CC**

| Milestone | Description | Amount |
|---|---|---|
| Milestone 1 | Estimation engine + TypeScript SDK + web calculator | 100,000 CC |
| Milestone 2 | Python SDK + historical database + documentation | 100,000 CC |
| Milestone 3 | Anomaly alerting + production hardening + self-hosting | 40,000 CC |
| Maintenance | 12-month post-launch maintenance window | 100,000 CC |
| **Total** | | **340,000 CC** |

**Volatility Stipulation:** This grant is denominated in fixed Canton Coin. Should significant USD/CC price volatility occur during the 6-month grant period, individual milestone scopes may be renegotiated in good faith with the committee to ensure deliverability without scope reduction.

---

## Competitive Landscape

| Feature | CantonScan | CCTools | Canton Wallet | Canton Fee Estimator |
|---|---|---|---|---|
| Pre-submission cost estimate | ✗ | ✗ | Wallet-only | ✓ (SDK + API) |
| TypeScript SDK | ✗ | ✗ | ✗ | ✓ |
| Python SDK | ✗ | ✗ | ✗ | ✓ |
| Historical fee percentiles | Partial | ✗ | ✗ | ✓ |
| Web calculator | ✗ | Rewards only | ✗ | ✓ |
| Fee anomaly alerting | ✗ | ✗ | ✗ | ✓ |
| Batch estimation | ✗ | ✗ | ✗ | ✓ |
| Multi-network support | ✓ | ✗ | ✗ | ✓ |
| Open source + self-hostable | ✗ | ✗ | ✗ | ✓ |

Canton Fee Estimator is additive to every existing tool. It does not replace CantonScan for block exploration, CCTools for community analytics, or the Canton Wallet for user transactions. It adds the missing developer cost-intelligence layer that none of those tools provide.

---

## Co-Marketing

Upon completion of each milestone, Canton Fee Estimator will collaborate with the Foundation on:

- Announcement coordination via Canton Network developer channels and community calls
- Technical blog post: "How fee estimation works on Canton — under the hood" (covering the Scan API data pipeline, percentile modelling approach, and SDK integration)
- Live integration demo with at least one existing Dev Fund project (DeFi or settlement application), recorded and published
- Developer onboarding video: first fee estimate in under 5 minutes from a fresh Canton environment
- Documentation listing Canton Fee Estimator as the recommended fee estimation approach for new Canton builders

---

## Rationale

**Fee estimation is infrastructure, not a feature.** Every Canton application that manages budgets, displays costs to users, or runs in CI/CD needs this. The gap is real, it is documented in the Scan API data I have already collected, and it is felt by every developer in the ecosystem.

**Ecosystem multiplier, not a point solution.** Every funded Dev Fund project — DeFi, identity, custody, developer tooling — benefits from a shared estimation standard. This is not a single application; it is infrastructure that makes every other application better. When Canton's fee model changes, one tool is updated, not twenty.

**Work is already underway with demonstrated Canton learning.** The repository has active commits, a working Scan API integration, real TestNet fee data in the database, and documented observations about Canton's fee structures. This is not an exploration grant; it is a completion grant.

**Direct impact on Canton DeFi adoption.** ACME, Alpend, Cantex, Hecto, and Edel Finance are all building DeFi on Canton. Every DeFi protocol requires accurate fee modelling for margin calculations, liquidation thresholds, and user-facing cost display. They all need this SDK.

**Prevents long-term ecosystem fragmentation.** Without a standard, each project builds its own estimation shim with its own assumptions. One maintained standard prevents years of technical debt across the ecosystem.

---

## Team

| Name | Role | Background |
|---|---|---|
| Jalaj Nagar | Lead Developer | Full-stack developer with experience building SDK libraries, developer tooling, and API services. Has connected to Canton TestNet, explored the Scan API and Ledger API (v2), and documented Canton fee structures during pre-grant development. Active repository: [jalajnagar88-stack/canton-fee-estimator](https://github.com/jalajnagar88-stack/canton-fee-estimator). |
| [To be confirmed] | Backend Engineer | Backend and SDK development support for Milestone 2 Python SDK and documentation work. Candidate with prior API and SDK development experience. Name and GitHub to be confirmed prior to Milestone 2 commencement; will be added as a public repository contributor before any Milestone 2 funding is released. |

---

*Canton Fee Estimator — Pre-submission cost intelligence for Canton Network*
*github.com/jalajnagar88-stack/canton-fee-estimator*
