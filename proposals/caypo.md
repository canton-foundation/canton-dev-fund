# Development Fund Proposal

**Author:** Anıl Karaçay - anil@cayvox.com (Canton Catalyst 2026 #1 place)
**Status:** Submitted
**Created:** 2026-03-21

## Abstract

CAYPO brings the Machine Payments Protocol (MPP) to Canton Network as open-source infrastructure — a complete set of TypeScript packages that enable any Canton developer to build agent payment applications with USDCx. MPP is the open payment standard by Stripe and Tempo, already integrated with Visa, Lightning, Solana, and Sui. Canton is among the leading institutional blockchains yet to integrate with MPP — CAYPO aims to address this gap.

Milestones 1–2 are already completed and live. We are requesting **2,000,000 CC** across 4 milestones (M1–M2 retroactive, M3–M4 forward-looking).

**Live deliverables:** [caypo.xyz](https://caypo.xyz) · [mpp.caypo.xyz](https://mpp.caypo.xyz) · [npm @caypo](https://www.npmjs.com/org/caypo) · [GitHub](https://github.com/anilkaracay/Caypo) · [mpp-specs PR #198](https://github.com/tempoxyz/mpp-specs/pull/198)

All five CAYPO packages are open-source under Apache 2.0 / MIT dual license. Any Canton developer can use @caypo/mpp-canton and @caypo/canton-sdk as building blocks to create their own agent payment applications, deploy custom gateways with their own service endpoints, or extend the MCP tool set for domain-specific use cases. CAYPO is not a closed product — it is open payment infrastructure that any team in the Canton ecosystem can build on.

## Specification

### 1. Objective

**Problem:** The agentic economy represents a $3–5 trillion opportunity that Canton is well-positioned to participate in with the right infrastructure in place

McKinsey projects agentic commerce will mediate **$3 trillion to $5 trillion** in global commerce by 2030. Morgan Stanley estimates **$190–$385 billion** in US e-commerce from agentic shoppers by 2030. The agentic payment infrastructure market is projected to grow from **$7 billion to $93 billion by 2032** — a 13× expansion.

A growing number of major ecosystems are already exploring or adopting MPP:

| Chain | MPP Integration | Status | Link |
|-------|----------------|--------|------|
| **Tempo** | Native (Stripe × Tempo) | ✅ Live | [mpp.dev/payment-methods/tempo](https://mpp.dev/payment-methods/tempo) |
| **Stripe** | Fiat rails (card, bank) | ✅ Live | [mpp.dev/payment-methods/stripe](https://mpp.dev/payment-methods/stripe) |
| **Visa** | Intelligent Commerce tokens | ✅ Live | [mpp.dev/payment-methods/card](https://mpp.dev/payment-methods/card) |
| **Lightning** | Bitcoin via Lightspark/Spark | ✅ Live | [mpp.dev/payment-methods/lightning](https://mpp.dev/payment-methods/lightning) |
| **Sui** | t2000 — full agent banking platform | ✅ Live | [t2000.ai](https://t2000.ai) |
| **Sui** | Community charge intent spec | PR open | [mpp-specs PR #195](https://github.com/tempoxyz/mpp-specs/pull/195) |
| **Solana** | Solana Foundation official SDK | In dev | [github.com/solana-foundation/mpp-sdk](https://github.com/solana-foundation/mpp-sdk) |
| **Solana** | Community charge intent spec | PR open | [mpp-specs PR #188](https://github.com/tempoxyz/mpp-specs/pull/188) |
| **Whop** | Platform payments | PR open | [mpp-specs PR #197](https://github.com/tempoxyz/mpp-specs/pull/197) |
| **Stellar** | Stellar charge intent spec | PR open | [mpp-specs PR #199](https://github.com/tempoxyz/mpp-specs/pull/199) |
| **Canton** | **CAYPO** — USDCx via CIP-56 | PR open | [mpp-specs PR #198](https://github.com/tempoxyz/mpp-specs/pull/198) |

Canton is currently among the few institutional-focused blockchains exploring MPP integration, with Caypo leading this effort. Expanding Canton’s MPP support would help capture a share of emerging agent payment flows that are currently developing across multiple ecosystems

**Intended outcome:** Canton becomes a first-class MPP payment method — recognized alongside Tempo, Stripe, Visa, and Lightning — with an open-source gateway framework, comprehensive SDK, and production mainnet deployment The entire stack ships as open-source building blocks: any Canton developer can compose these packages into their own agent payment products without depending on us.

### 2. Implementation Mechanics

CAYPO is an open-source agent finance toolkit consisting of 5 npm packages:

- **@caypo/mpp-canton** — Canton payment method for MPP. Implements charge intent using CIP-56 TransferFactory.Transfer with USDCx. Zod schema validation, full error handling.
- **@caypo/canton-sdk** — Core SDK. Canton JSON Ledger API v2 client, USDCx operations (Holding queries, transfer, merge), encrypted wallet (AES-256-GCM, PBKDF2), safeguards (per-tx and daily limits), traffic management, MPP auto-pay client. String-based decimal arithmetic — no floating point.
- **@caypo/canton-cli** — 36 commands. Agent wallet management, USDCx transfers, MPP auto-pay, MCP server installation, savings, credit, exchange, investment operations.
- **@caypo/canton-mcp** — MCP server. 35 tools + 20 prompts. Compatible with Claude Desktop, Cursor, Windsurf, and any MCP-compatible AI assistant.
- **@caypo/canton-gateway** — Open-source MPP gateway framework (Hono). Handles HTTP 402 payment verification against Canton ledger, service catalog management, and upstream API proxying. Ships with example service configurations. Any developer can fork and deploy their own gateway with their own service endpoints and API keys.

**Technology stack:** TypeScript, pnpm monorepo, Turborepo, Vitest, Zod, Hono, Node.js. Canton JSON Ledger API v2 (gRPC/HTTP). CIP-56 Token Standard (TransferFactory, TransferPreapproval).


### 3. Architectural Alignment

**CIP-0082 — "dev tools":** CAYPO provides the first Canton SDK designed for agent developers. 35 MCP tools, 36 CLI commands, comprehensive TypeScript API.

**CIP-0082 — "reference implementations":** CAYPO is the reference implementation for MPP on Canton. The Canton method spec ([mpp-specs PR #198](https://github.com/tempoxyz/mpp-specs/pull/198)) establishes Canton as an officially recognized payment method.

**CIP-0082 — "critical infra":** The open-source gateway framework enables any Canton developer to deploy their own MPP-compatible gateway. Built-in /llms.txt and /api/services endpoints provide standardized agent discovery.

**CIP-56 — Token Standard:** All USDCx operations use CIP-56 TransferFactory.Transfer with TransferPreapproval for 1-step automated payments.

**Upstream contribution:** Canton method specification submitted to [tempoxyz/mpp-specs](https://github.com/tempoxyz/mpp-specs/pull/198), positioning Canton alongside Tempo, Stripe, and Visa in the MPP ecosystem.

### 4. Backward Compatibility

No backward compatibility impact. CAYPO is a new application-layer product built on top of existing Canton infrastructure (JSON Ledger API v2, CIP-56 Token Standard, Global Synchronizer). It does not modify any protocol-level components.

## Milestones and Deliverables

### Milestone 1: MPP Payment Method + Core SDK (COMPLETED)

* **Estimated Delivery:** Completed (March 2026)
* **Focus:** Core MPP payment method, Canton SDK, CLI, test suite, upstream spec contribution
* **Deliverables / Value Metrics:**
  - @caypo/mpp-canton npm package — published, charge intent working
  - @caypo/canton-sdk — CantonClient (JSON API v2), USDCxService, Keystore (AES-256-GCM), SafeguardManager
  - @caypo/canton-cli — init, balance, send, pay, address commands
  - Canton method spec PR submitted to tempoxyz/mpp-specs (#198)
  - 14 E2E tests passing against live Canton DevNet (Splice v0.5.12)
  - 312 unit tests, 100% pass rate
  - Open-source repo (Apache 2.0 / MIT) on GitHub

### Milestone 2: Agent Platform + Gateway Framework (COMPLETED)

* **Estimated Delivery:** Completed (March 2026)
* **Focus:** MCP server, gateway deployment, 5 account types, landing page, documentation
* **Deliverables / Value Metrics:**
  - @caypo/canton-mcp — 35 tools + 20 prompts, works with Claude Desktop
  - @caypo/canton-gateway framework — HTTP 402 payment gate, service catalog system, upstream proxy logic. Published on npm with example configurations.
  - 5 account types: Checking, Savings, Credit, Exchange, Investment — full SDK implementation
  - CLI expanded to 36 commands
  - 10 agent skills for Claude Code, Codex, Copilot
  - Landing page (caypo.xyz), docs (caypo.xyz/docs), gateway page (caypo.xyz/gateway)
  - Agent discovery endpoints live: /llms.txt, /api/services

### Milestone 3: Canton Mainnet Integration + Session Intent

* **Estimated Delivery:** 8 weeks after M2 acceptance
* **Focus:** Production mainnet deployment, streaming payments, Python SDK, analytics
* **Deliverables / Value Metrics:**
  - Mainnet USDCx transfers — end-to-end payment flow verified on Canton mainnet using TIFA-validator-1
  - TransferPreapproval deployment — gateway party accepting live payments on mainnet
  - Session intent — streaming payments (pay-per-token) for LLM inference, new MPP intent spec submitted upstream
  - Payment analytics dashboard — caypo.xyz/analytics with real-time transaction volume and service breakdown
  - Python SDK — @caypo/canton-sdk-python for LangChain, CrewAI, AutoGen agent frameworks
  - Mainnet E2E test suite with CI/CD pipeline
  - Developer migration guide (DevNet → Mainnet) published in docs

* **Adoption Criteria:**
  - npm downloads: 250+ cumulative across all 5 packages
  - At least 1 external developer or teams using @caypo/mpp-canton or @caypo/canton-sdk in their own projects
  - Python SDK published with at least 1 example integration

### Milestone 4: Ecosystem Tooling + Developer Adoption

* **Estimated Delivery:** 8 weeks after M3 acceptance
* **Focus:** Gateway expansion, agent-to-agent protocol, SDK v1.0, developer onboarding
* **Deliverables / Value Metrics:**
  - Gateway expansion to 30+ services (Replicate, Hugging Face, Stability AI, Deepgram, AssemblyAI, etc.)
  - Agent-to-agent payment protocol — escrow contracts, multi-step settlement, conditional payments in Canton DAML
  - Treasury management module — validator traffic auto-purchase, CC balance monitoring
  - SDK v1.0 stable release — semver 1.0 with backward compatibility guarantees
  - Developer onboarding program — tutorials, video walkthroughs, 5+ example applications
  - Multi-language MCP support — Python MCP server alongside TypeScript
  - Rust SDK — @caypo/canton-sdk-rust for LangChain, CrewAI, AutoGen agent frameworks
  - Canton agent template — open-source "Start accepting USDCx payments in 5 minutes" repo

  * **Adoption Criteria:**
  - npm downloads: 500+ cumulative
  - At least 2 external developers or teams using CAYPO packages (documented via GitHub issues, forks, or integrations)
  - Rust SDK published with at least 1 example integration

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

* Deliverables completed as specified for each milestone
* Demonstrated functionality or operational readiness
* Documentation and knowledge transfer provided
* Alignment with stated value metrics

**Project-specific acceptance conditions:**

* **M1:** npm packages published and installable. 312+ tests passing. Canton method spec PR submitted to tempoxyz/mpp-specs. ✅ Already met.
* **M2:** Gateway live at mpp.caypo.xyz returning 200 on /health. 35 MCP tools registered. Landing page and docs deployed. ✅ Already met.
* **M3:** Successful mainnet USDCx transfer via CAYPO SDK. Python SDK published on PyPI with example integration. 250+ npm downloads cumulative. At least 1 external developer using CAYPO packages.
* **M4:** Agent-to-agent escrow contract deployed on Canton. SDK v1.0.0 published with semver guarantees. 500+ npm downloads cumulative.

## Funding

**Total Funding Request:** 2,000,000 CC

### Payment Breakdown by Milestone

* **Milestone 1** (MPP Payment Method + Core SDK): **500,000 CC** upon committee acceptance — *completed*
* **Milestone 2** (Agent Platform + Live Gateway): **500,000 CC** upon committee acceptance — *completed*
* **Milestone 3** (Mainnet Integration + Session Intent): **500,000 CC** upon committee acceptance
* **Milestone 4** (Platform Expansion + Ecosystem Tooling): **500,000 CC** upon final release and acceptance

### Volatility Stipulation

The total project duration is under 6 months. All milestone amounts are fixed in Canton Coin per CIP-0100. Should the timeline extend beyond 6 months due to Committee-requested scope changes, remaining milestones will be renegotiated to account for USD/CC price volatility.

## Co-Marketing

Upon release, Cayvox Labs will collaborate with the Foundation on:

* Joint announcement of Canton as an MPP-supported payment method
* Technical blog post: "How Canton's Privacy Model Enables Institutional Agent Payments"
* Developer walkthrough: "Accept USDCx Payments in 5 Minutes with CAYPO"
* Presentation at Canton ecosystem events and Catalyst showcases
* Social media promotion across Canton, MPP, and agentic AI communities

## Motivation

Canton Network is backed by the world's largest financial institutions — DTCC, Goldman Sachs, JPMorgan, BNP Paribas — and is uniquely positioned to play a meaningful role in the fastest-growing segment of the digital economy: agentic payments. With CAYPO, we aim to unlock this opportunity for the Canton ecosystem.

McKinsey projects **$3–5 trillion** in global agentic commerce by 2030. The agentic payment infrastructure market alone is projected to reach **$93 billion by 2032**. Google, Mastercard, Visa, Stripe, and Tempo have all launched dedicated agent payment infrastructure. Sui and Solana already have MPP integrations with live gateways and SDKs.

Agentic payment infrastructure is growing rapidly across multiple ecosystems. By funding open-source MPP tooling for Canton, the Development Fund helps ensure Canton developers have the same building blocks already available on Sui, Solana, and other chains preventing Canton from falling behind in this emerging category.
The scale of this opportunity is significant: if Canton captures just 10% of the $93B agentic payment market, that represents $9.3B in transaction volume flowing through the network generating CC traffic fees and ecosystem activity.

## Rationale

**Why MPP?** MPP is the open standard by Stripe and Tempo, backed by Visa, Paradigm, and Lightspark. It uses HTTP 402 — the same web infrastructure that powers the entire internet. 100+ services are already integrated. MPP is to agent payments what HTTPS is to web security — the emerging default.

**Why MPP over x402?** MPP is rail-agnostic — it works with any blockchain, fiat rail, or payment network. Canton's non-EVM architecture (DAML, gRPC Ledger API) makes EVM-native protocols like x402 less suitable, as they are primarily designed for EVM-based environments, whereas Canton’s architecture differs significantly. MPP's extensible method system (`Method.from()`) was designed exactly for chains like Canton that have unique settlement mechanics. Additionally, MPP's session intent enables streaming micropayments — critical for pay-per-token LLM billing — which x402 does not natively support.

**Why a full toolkit, not just a payment method?** A payment method alone is a library. A toolkit is an ecosystem enabler. Agents don't just need to pay — they need to manage funds, enforce spending limits, discover services, and interact through natural language. CAYPO delivers the open-source building blocks: encrypted wallets with AES-256-GCM, per-transaction and daily safeguards, 35 MCP tools for AI assistant integration, a deployable gateway framework, and CLI tooling for DevOps. Any Canton developer can compose these packages into their own agent payment applications.

**Why open-source building blocks?**  A proprietary payment SDK creates a single point of dependency. Open-source infrastructure creates an ecosystem. By publishing every package under Apache 2.0 / MIT, CAYPO enables Canton developers to fork the gateway and serve only their own API endpoints, import @caypo/mpp-canton into their own DeFi protocol for agent-native USDCx settlement, extend the 35 MCP tools with domain-specific agent skills, and build competing or complementary products on top of the same Canton payment primitives.

## Team

**Cayvox Labs** — Canton Network mainnet validator operator. Canton Catalyst 2026 #1 place.

## Open Source

All code is open-source under Apache 2.0 / MIT dual license.

- **Repository:** [github.com/anilkaracay/Caypo](https://github.com/anilkaracay/Caypo)
- **npm:** [npmjs.com/org/caypo](https://www.npmjs.com/org/caypo)
- **Website:** [caypo.xyz](https://caypo.xyz)
- **Docs:** [caypo.xyz/docs](https://www.caypo.xyz/docs)
- **Upstream:** [tempoxyz/mpp-specs PR #198](https://github.com/tempoxyz/mpp-specs/pull/198)

## Contact

- **Email:** anil@cayvox.com
- **Website:** [caypo.xyz](https://caypo.xyz)
- **Gateway:** [mpp.caypo.xyz](https://mpp.caypo.xyz)
