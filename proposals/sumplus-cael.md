## Development Fund Proposal

**Title:** Canton Agent Execution Layer (CAEL): Open-Source Policy-Driven Execution, Skills Infrastructure, and Agent Payment Protocol for Canton
**Author:** Sumplus (j@sumplus.xyz)
**Status:** Submitted
**Created:** 2026-03-23

---

## Abstract

CAEL is an open-source toolkit that makes it safe and practical for AI agents to operate on Canton — executing workflows, accessing onchain skills, and paying for services autonomously. It delivers three public-good layers: (1) **Maria on Canton**, a policy-driven agent execution engine with audit trails; (2) **Arsenal Canton Skills**, an open skills marketplace callable by any agent on Canton; and (3) **Canton 402**, Canton's first agent-native payment protocol inspired by HTTP 402/x402, enabling atomic pay-and-call settlement in Daml. All components are open-source, reusable by any Canton builder, and not specific to Sumplus products.

---

## Specification

### 1. Objective

AI agents are becoming primary users of onchain infrastructure. Canton's institutional-grade privacy, composability, and settlement finality make it the right chain for high-value agentic workflows — but today there is no standard, safe way for agents to:
- Execute Canton workflows with policy enforcement and audit trails
- Discover and call Canton-native skills and services
- Pay for onchain services atomically without manual intermediaries

CAEL solves all three, shipping as open-source public infrastructure for the Canton ecosystem.

---

### 2. Implementation Mechanics

#### 2.1 Maria on Canton — Policy-Driven Agent Execution

Maria is an execution agent purpose-built for onchain finance. On Canton, Maria provides:

- **Agent wallet management** via Canton Ledger API — agent-controlled wallets with defined permissions and spending limits
- **Policy hooks** — pre-execution checks written as Daml contracts that intercept any action before it reaches the ledger: counterparty allowlists, per-transaction value caps, daily limits, operation type restrictions
- **Deterministic simulation** — every workflow is dry-run against Canton Sandbox before live execution, catching failures before they touch mainnet
- **Audit trail generation** — each execution emits a structured, privacy-preserving evidence bundle: intent, policy checks passed/failed, execution result, and who can disclose what

**Tech stack:** Daml (policy contracts + audit templates), Canton Ledger API (Java/TypeScript), Canton Sandbox (simulation), Maria execution engine (TypeScript)

#### 2.2 Arsenal Canton Skills — Open Skills Marketplace

Arsenal is an open marketplace of callable skills and tools for AI agents. Canton-specific skills published via CAEL include:

- **Token transfer skill** — Canton token standard compliant transfer with pre-flight checks
- **DvP settlement skill** — atomic Delivery-versus-Payment using Canton's native multi-party model
- **Balance and yield query skill** — read-only Canton ledger queries (positions, balances, yield rates)
- **Skill Registry Daml contract** — onchain registry of available skills with versioning, permissions, and call history

Skills are exposed via a standard `/invoke` interface (REST, MCP-compatible) so any agent — not just Maria — can call them. Arsenal already has 36 live skills across DeFi protocols; Canton skills extend this to institutional workflows.

**Tech stack:** Daml (Skill Registry contract), Canton Ledger API, Arsenal `/invoke` REST interface, MCP adapter

#### 2.3 Canton 402 — Agent-Native Payment Protocol

Canton 402 is the first agent payment protocol built natively on Canton, inspired by Coinbase's x402 (HTTP 402-based agent payments). It enables any AI agent to autonomously discover, pay for, and use onchain Canton services in a single atomic transaction.

**Architecture:**

```
Agent
  │  HTTP request with payment header
  ▼
Canton 402 HTTP Gateway
  │  Validates payment header
  │  Constructs Daml atomic transaction:
  │    PaymentObligation + ServiceDelivery in one ledger commit
  ▼
Canton Ledger
  │  Atomic settlement — payment and service delivery committed together
  │  or both rolled back (no partial fills)
  ▼
Service Provider (Arsenal skill / any Canton service)
```

**Daml contract suite:**
- `PaymentObligation` — defines the payment terms between agent and service provider
- `PaymentReceipt` — immutable onchain receipt generated on successful settlement
- `PaidService` — template any Canton protocol can implement to gate access behind Canton 402 payment
- `AgentPermissionFramework` — standardized Daml templates for managing agent access rights across Canton services

**HTTP 402 Gateway:** Standard HTTP interface — any agent sends a signed payment header with its request; the gateway handles Daml transaction construction and submission. No Canton SDK required on the agent side.

**Maria integration:** Built-in Canton 402 signing with policy controls (per-tx limits, daily caps, approved service whitelist). Maria agents can pay for Canton services autonomously within defined policy bounds.

**Tech stack:** Daml (payment contracts), Canton Ledger API, HTTP gateway (TypeScript/Java), Maria payment module

---

### 3. Architectural Alignment

- **Canton token standards:** Arsenal skills and Maria execution are built on Canton's native token-standard workflow patterns (DvP, transfer, multi-party authorization)
- **Daml-native:** All policy enforcement, audit trails, skill registry, and payment contracts are implemented in Daml — no off-chain workarounds
- **Canton privacy model:** Audit evidence bundles respect Canton's need-to-know privacy; only disclosed to parties with explicit viewing rights
- **Global Synchronizer:** Canton 402's atomic settlement leverages Canton's Global Synchronizer for cross-party finality
- **CIP alignment:** Canton 402 is positioned as a candidate for a future CIP, establishing a standard agent payment interface for the Canton ecosystem
- **No upstream changes required:** CAEL is fully external tooling; optional upstream contributions require explicit maintainer alignment

---

### 4. Backward Compatibility

No backward compatibility impact. CAEL is additive external tooling. Existing Canton applications and contracts are unaffected.

---

## Milestones and Deliverables

### Milestone 1: Maria on Canton + Arsenal Skills
- **Estimated Delivery:** 2026-06-30 (Q2 2026)
- **Focus:** Deploy Maria on Canton with full policy-driven execution capabilities and publish open-source Canton skills callable by any agent.
- **Deliverables / Value Metrics:**
  - Public architecture spec: Canton integration design, threat model, policy hook interfaces (open GitHub)
  - Maria on Canton: agent wallet management via Canton Ledger API, Daml policy contracts (transfer limits, counterparty allowlists, operation restrictions), deterministic simulation harness, audit trail generation
  - Arsenal Canton skills (open-source, callable via `/invoke`): token transfer, DvP settlement pattern, balance/yield query
  - Quickstart documentation with reproducible environment setup (Canton Sandbox + Maria)

### Milestone 2: Onchain Daml Contracts
- **Estimated Delivery:** 2026-09-30 (Q3 2026)
- **Focus:** Move policy enforcement, audit trails, skill registry, and multi-party authorization fully onchain in Daml.
- **Deliverables / Value Metrics:**
  - Execution audit trail Daml contracts: every Maria action generates an immutable, privacy-preserving onchain record (intent, policy checks, execution result)
  - Policy contracts in Daml: agent spending limits, counterparty allowlists, and operation constraints as verifiable onchain contracts
  - Skill Registry Daml contracts: Arsenal skills registered onchain with version, permission, and call history
  - Multi-party authorization flow: large-value operations require multi-signer approval via Canton's native multi-party model
  - Independent Daml contract audit (third-party, budget included)

### Milestone 3: Canton 402 — Agent Payment Protocol
- **Estimated Delivery:** 2026-12-31 (Q4 2026)
- **Focus:** Build Canton's first agent-native payment protocol, enabling AI agents to autonomously discover, pay for, and use onchain Canton services.
- **Deliverables / Value Metrics:**
  - Daml payment contract suite: `PaymentObligation`, `PaymentReceipt`, `PaidService`, `AgentPermissionFramework` templates
  - HTTP 402 Gateway: standard HTTP interface for any agent to pay-and-call Canton services
  - Maria payment integration: built-in Canton 402 signing with policy controls
  - Arsenal paid skill settlement: paid Arsenal skills settled via Canton 402 with onchain receipts
  - Canton 402 spec published as candidate CIP

### Milestone 4: Ecosystem Pilots + Maintenance Handoff
- **Estimated Delivery:** 2027-03-31 (Q1 2027)
- **Focus:** Validate ecosystem adoption with real Canton participants and establish long-term sustainability.
- **Deliverables / Value Metrics:**
  - Two external integration pilots (non-Sumplus) using Maria, Arsenal, or Canton 402 (letters of support or public references)
  - Cross-protocol atomic skills: Arsenal skills leveraging Canton's Global Synchronizer for multi-protocol atomic execution
  - Developer workshops (recording + walkthroughs)
  - Maintainer-ready documentation: contribution guide, governance/triage process, release policy
  - Maintenance handoff plan with optional quarterly continuation milestone

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:
- Deliverables completed as specified per milestone
- Demonstrated functionality via runnable demos and reproducible builds
- Documentation and knowledge transfer provided
- Alignment with stated value metrics and adoption KPIs

Project-specific conditions:
- All milestone deliverables include reproducible build/test instructions
- Any reported security findings have documented remediation or rationale for deferral
- Adoption milestone requires evidence of external usage (pilot confirmations or public integration references)

---

## GTM Strategy and Distribution

### Target Users

| Segment | Use case |
|---|---|
| Canton app developers | Use Maria + Arsenal skills to add agentic execution to existing Canton apps without building policy/audit infrastructure from scratch |
| Institutional builders on Canton | Use Canton 402 to monetize Canton services and gate access for agent clients |
| AI agent developers (non-Canton) | Access Canton's RWA liquidity via Arsenal's `/invoke` interface and MCP adapter — no Canton SDK required |
| DAML development studios | Reference implementation and SDK as foundation for client projects (IntellectEU, Obsidian, 5North, Launchnodes) |

### Distribution Approach

**Open-source first.** All CAEL components ship on GitHub (Apache-2.0) with reproducible builds and public CI. The Canton ecosystem's existing developer community is the primary distribution channel.

**Canton Foundation co-marketing.** Upon each milestone release, coordinate with the Foundation on:
- Developer blog post / technical case study
- Announcement in Canton developer channels and grants-discuss list
- Joint workshop session for Canton builders

**Arsenal network effect.** Arsenal already has 36 live skills used by AI agents across DeFi protocols. Canton skills added to Arsenal are immediately discoverable by Arsenal's existing agent user base — no separate marketing required.

**DAML studio partnerships.** The leading DAML development studios (IntellectEU, Obsidian, 5North, Launchnodes) are direct distribution partners — they build on Canton for clients and will incorporate CAEL reference implementations into their work. Outreach underway for M4 pilot partners.

**Canton 402 as ecosystem standard.** Publishing Canton 402 as a candidate CIP creates a network effect: any Canton service provider that implements the `PaidService` template becomes immediately accessible to all Canton 402-compatible agents. The standard grows with every new adopter.

**Developer onboarding target:** Any Canton builder can run the M1 quickstart demo in under 30 minutes from a clean machine.

---

## Funding

**Total Funding Request:** 1,623,000 CC

**CC/USD Reference Rate:** $0.154/CC (public market data, 2026-03-16)

### Payment Breakdown by Milestone

| Milestone | Amount (CC) | USD-equivalent | Payment Condition |
|---|---:|---:|---|
| M1: Maria on Canton + Arsenal Skills | 227,000 CC | ~$34,958 | Upon committee acceptance |
| M2: Onchain Daml Contracts | 552,000 CC | ~$85,008 | Upon committee acceptance |
| M3: Canton 402 Agent Payment Protocol | 519,000 CC | ~$79,926 | Upon committee acceptance |
| M4: Ecosystem Pilots + Maintenance Handoff | 325,000 CC | ~$50,050 | Upon final release and acceptance |
| **Total** | **1,623,000 CC** | **~$249,942** | |

### Volatility Stipulation

Project duration exceeds 6 months. The grant is denominated in fixed Canton Coin. At the 6-month mark (end of Q3 2026), remaining milestone CC amounts will be re-evaluated by Tech & Ops using a trailing 30-day average CC/USD rate, consistent with CIP-0100 guidance.

---

## Co-Marketing

Upon each milestone release, Sumplus will collaborate with the Foundation on:
- Announcement coordination for CAEL releases
- Technical blog / case study: "Policy-driven agent execution on Canton"
- Developer workshops and onboarding sessions via Foundation developer relations channels
- Canton 402 CIP co-authorship and ecosystem promotion

---

## Motivation

Canton is the most credible chain for institutional-grade RWA workflows — but today there is no standard infrastructure for AI agents to operate on Canton safely. As agents become primary users of onchain products, Canton needs shared tooling that makes agentic execution safe, auditable, and interoperable. CAEL provides this as a public good, compounding value for every Canton builder who uses it rather than building their own policy/audit/payment stack.

The Canton 402 payment protocol is a unique opportunity: x402 has processed 115M+ transactions on EVM chains. A Canton-native equivalent, built on Daml's atomic settlement guarantees, would be the first institutional-grade agent payment standard — a meaningful differentiator for Canton's ecosystem.

---

## Rationale

- **Public goods framing:** open-source, reusable by any Canton builder, not Sumplus-specific
- **Daml-native:** policy, audit, registry, and payments in Daml — no off-chain workarounds, full Canton composability
- **Incremental delivery:** each milestone ships working software, not just specs
- **Ecosystem leverage:** Arsenal's existing 36-skill network + agent user base accelerates Canton skill adoption from day one
- **Canton 402 differentiation:** no equivalent agent payment protocol exists on Canton today; positions Canton as the institutional standard for autonomous agent finance

---

## Appendix: Team

| Name | Role | Relevant background |
|---|---|---|
| Jakob | Founder / Strategy | Product strategy, ecosystem partnerships, grant coordination |
| Anray | CTO | Daml and Canton smart contract development; blockchain infrastructure |
| [Engineering] | Backend / Daml dev | Canton Ledger API, TypeScript, smart contract implementation |
| [Engineering] | Agent systems | Maria execution engine, Arsenal skills, MCP/invoke interface |
| [DevRel] | Developer relations | Documentation, workshops, ecosystem onboarding |

---

## Appendix: Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Proposal perceived as product subsidy | Open-source deliverables; generic adapters; reusable reference implementations; explicit "not a token incentive program" posture |
| Technical complexity of Daml contracts | CTO has existing Daml and Canton expertise; M1 includes threat model and architecture review before contract implementation begins |
| CC price volatility | Explicit 6-month re-evaluation mechanism with documented reference price methodology |
| Ecosystem adoption slower than expected | Arsenal's existing agent user base provides immediate distribution; DAML studio partnerships provide M4 pilot pipeline |

---

## Appendix: IP / Licensing

- License: Apache-2.0
- Open development: public repo, public issues, tagged releases, reproducible CI
- No proprietary lock-in: adapters are generic; reference implementations are reusable patterns

---

## Appendix: Supporting Materials

- CAEL public GitHub: https://github.com/sumplus-real/cael
- Arsenal skills marketplace: https://arsenal.sumplus.xyz
- Sumplus: https://sumplus.xyz
- Contact: j@sumplus.xyz
