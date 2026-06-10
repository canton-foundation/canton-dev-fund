## Development Fund Proposal

**Title:** Canton Agent Execution Layer (CAEL): Open-Source Policy-Driven Execution, Skills Infrastructure, and Agent Payment Protocol for Canton
**Author:** Sumplus (j@sumplus.xyz)
**Status:** Submitted
**Created:** 2026-03-23
**Updated:** 2026-06-11
**Proposed SIG / Labels:** `financial-workflows-composability` (primary), `canton-apis`, `wallet-apps`, `dapp-integration`

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

### 2. Technical Approach

#### 2.1 Maria on Canton — Policy-Driven Agent Execution

Maria is an execution agent purpose-built for onchain finance. On Canton, Maria provides:

- **Custody-agnostic agent execution** — the agent never holds private keys. Maria prepares transactions and requests signatures through a policy layer; keys remain with the wallet or custody provider at all times. See "Wallet and Custody Integration" below.
- **Policy hooks** — pre-execution checks written as Daml contracts that intercept any action before it reaches the ledger: counterparty allowlists, per-transaction value caps, daily limits, operation type restrictions
- **Deterministic simulation** — every workflow is dry-run against Canton Sandbox before live execution, catching failures before they touch mainnet
- **Audit trail generation** — each execution emits a structured, privacy-preserving evidence bundle: intent, policy checks passed/failed, execution result, and who can disclose what

**Wallet and Custody Integration.** Maria's production deployments outside Canton already run this separation: all keys are held by a third-party wallet infrastructure provider, and the agent obtains signatures through policy-gated API calls. CAEL implements the same pattern using Canton's native primitives, so institutions keep their existing custody arrangements:

- **External-party signing** — agent parties are allocated as Canton external parties; keys never reside on the participant node. Transaction preparation and submission follow Canton's documented external signing flow.
- **Wallet Gateway integration** — Maria connects through the open-source Canton Wallet Gateway (canton-network/wallet), which forwards signing requests to the operator's configured signing provider. A reference integration against the open-source Splice / Canton Coin wallet stack ships as a CAEL deliverable (M1–M2), with reproducible setup instructions.
- **Custody provider targets** — through the Wallet Gateway's signing-provider interface, CAEL targets custody infrastructure already live on Canton: Fireblocks, Blockdaemon, and Dfns — all three ship as signing drivers in the Wallet Gateway repository today, and Dfns additionally provides announced institutional custody and wallet infrastructure on Canton. Institutions using HSM- or MPC-based custody can connect their existing providers without code changes to CAEL.
- **Institutional pilot** — Maria runs in production with users on other chains today, and an early Canton integration (Maria and Arsenal running against Canton) already works in Sumplus's internal environment. No Canton client exists yet; this grant takes the integration from internal environment to production-grade, custody-integrated, externally adopted open-source infrastructure. Pilot integrations are therefore an explicit M4 adoption KPI, with candidates drawn from Maria and Arsenal's existing user base extending to Canton, plus institutional introductions.

**Tech stack:** Daml (policy contracts + audit templates), Canton Ledger API (Java/TypeScript), Canton Wallet Gateway + external-party signing, Canton Sandbox (simulation), Maria execution engine (TypeScript)

#### 2.2 Arsenal Canton Skills — Open Skills Marketplace

Arsenal is an open marketplace of callable skills and tools for AI agents. Canton-specific skills published via CAEL include:

- **Token transfer skill** — Canton token standard compliant transfer with pre-flight checks
- **DvP settlement skill** — atomic Delivery-versus-Payment using Canton's native multi-party model
- **Balance and yield query skill** — read-only Canton ledger queries (positions, balances, yield rates)
- **Skill Registry Daml contract** — onchain registry of available skills with versioning, permissions, and call history

Skills are exposed via a standard `/invoke` interface (REST, MCP-compatible) so any agent — not just Maria — can call them. Arsenal already has 100+ live skills across 15+ chains (independently verifiable at arsenal.sumplus.xyz/api/stats); Canton skills extend this to institutional workflows.

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

Each milestone defines two layers: **Deliverables** (what ships) and **Adoption KPIs** (evidence of external usage the committee can verify). Adoption KPIs are the primary acceptance signal; deliverables exist to make the adoption possible.

### Milestone 1: Maria on Canton + Arsenal Skills
- **Estimated Delivery:** 2026-09-30 (Q3 2026)
- **Focus:** Deploy Maria on Canton with full policy-driven execution capabilities and publish open-source Canton skills callable by any agent.
- **Deliverables:**
  - Public architecture spec: Canton integration design, threat model, policy hook interfaces (open GitHub)
  - Maria on Canton: custody-agnostic execution via external-party signing and Wallet Gateway, Daml policy contracts (transfer limits, counterparty allowlists, operation restrictions), deterministic simulation harness, audit trail generation
  - Arsenal Canton skills (open-source, callable via `/invoke`): token transfer, DvP settlement pattern, balance/yield query
  - Quickstart documentation with reproducible environment setup (Canton Sandbox + Maria)
- **Adoption KPIs:**
  - Quickstart independently reproduced by 3+ external (non-Sumplus) developers, evidenced via public GitHub issues or discussion threads
  - Architecture spec reviewed by 2+ Canton ecosystem organizations (champion organization and at least one Daml studio or app team), review notes public
  - Time-to-first-demo under 30 minutes from a clean machine, externally verified

### Milestone 2: Onchain Daml Contracts
- **Estimated Delivery:** 2026-12-31 (Q4 2026)
- **Focus:** Move policy enforcement, audit trails, skill registry, and multi-party authorization fully onchain in Daml.
- **Deliverables:**
  - Execution audit trail Daml contracts: every Maria action generates an immutable, privacy-preserving onchain record (intent, policy checks, execution result)
  - Policy contracts in Daml: agent spending limits, counterparty allowlists, and operation constraints as verifiable onchain contracts
  - Skill Registry Daml contracts: Arsenal skills registered onchain with version, permission, and call history
  - Multi-party authorization flow: large-value operations require multi-signer approval via Canton's native multi-party model
  - Reference wallet integration live: Maria executing on Canton DevNet/TestNet through the Wallet Gateway against the open-source Splice wallet stack
  - Independent Daml contract audit (third-party, budget included)
- **Adoption KPIs:**
  - 2+ external (non-Sumplus) teams running the policy or audit trail contracts in their own test environment, confirmed by public reference or written confirmation
  - All published Arsenal Canton skills registered in the onchain Skill Registry, with call-history evidence of external test invocations from 2+ independent parties
  - External code review feedback on the contract suite from at least one ecosystem reviewer, addressed in a tagged release

### Milestone 3: Canton 402 — Agent Payment Protocol
- **Estimated Delivery:** 2027-03-31 (Q1 2027)
- **Focus:** Build Canton's first agent-native payment protocol, enabling AI agents to autonomously discover, pay for, and use onchain Canton services.
- **Deliverables:**
  - Daml payment contract suite: `PaymentObligation`, `PaymentReceipt`, `PaidService`, `AgentPermissionFramework` templates
  - HTTP 402 Gateway: standard HTTP interface for any agent to pay-and-call Canton services
  - Maria payment integration: built-in Canton 402 signing with policy controls
  - Arsenal paid skill settlement: paid Arsenal skills settled via Canton 402 with onchain receipts
  - Canton 402 spec published as candidate CIP
- **Adoption KPIs:**
  - 2+ external (non-Sumplus) service providers implementing the `PaidService` template on DevNet/TestNet
  - 1,000+ cumulative atomic pay-and-call settlements executed end-to-end on DevNet/TestNet, including calls originating from external implementers
  - Candidate CIP submitted with documented ecosystem feedback (public discussion thread with 3+ participating organizations)

### Milestone 4: Ecosystem Pilots + Maintenance Handoff
- **Estimated Delivery:** 2027-06-30 (Q2 2027)
- **Focus:** Validate ecosystem adoption with real Canton participants and establish long-term sustainability.
- **Deliverables:**
  - Cross-protocol atomic skills: Arsenal skills leveraging Canton's Global Synchronizer for multi-protocol atomic execution
  - Developer workshops (recording + walkthroughs)
  - Maintainer-ready documentation: contribution guide, governance/triage process, release policy
  - Maintenance handoff plan with optional quarterly continuation milestone
- **Adoption KPIs:**
  - Two external integration pilots (non-Sumplus) using Maria, Arsenal, or Canton 402, each with 30+ days of sustained usage in a test or controlled environment (letters of support or public references)
  - At least one pilot running with an institutional custody or wallet provider through the Wallet Gateway integration
  - 20+ Canton builders onboarded through workshops, measured by attendance and completed quickstarts
  - Usage metrics published per pilot (workflow executions, skill calls, settled Canton 402 payments) on a public dashboard or report

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:
- Adoption KPIs met as specified per milestone, with externally verifiable evidence (public GitHub activity, onchain call history, named references, or written confirmations)
- Deliverables completed as specified per milestone
- Demonstrated functionality via runnable demos and reproducible builds
- Documentation and knowledge transfer provided

Project-specific conditions:
- Every milestone carries adoption evidence, not only the final one; adoption KPIs are listed per milestone above and are the primary acceptance signal
- All milestone deliverables include reproducible build/test instructions
- Any reported security findings have documented remediation or rationale for deferral
- Where an adoption KPI depends on third parties (external reproductions, pilot usage), evidence consists of public references or written confirmations from those parties

---

## GTM Strategy and Distribution

### Target Users

| Segment | Use case |
|---|---|
| Canton app developers | Use Maria + Arsenal skills to add agentic execution to existing Canton apps without building policy/audit infrastructure from scratch |
| Institutional builders on Canton | Use Canton 402 to monetize Canton services and gate access for agent clients |
| AI agent developers (non-Canton) | Access Canton's RWA liquidity via Arsenal's `/invoke` interface and MCP adapter — no Canton SDK required |
| Daml development studios | Reference implementation and SDK as foundation for client projects |

### Distribution Approach

**Open-source first.** All CAEL components ship on GitHub (Apache-2.0) with reproducible builds and public CI. The Canton ecosystem's existing developer community is the primary distribution channel.

**Canton Foundation co-marketing.** Upon each milestone release, coordinate with the Foundation on:
- Developer blog post / technical case study
- Announcement in Canton developer channels and grants-discuss list
- Joint workshop session for Canton builders

**Arsenal network effect.** Arsenal already has 100+ live skills used by AI agents across 15+ chains. Canton skills added to Arsenal are immediately discoverable by Arsenal's existing agent user base — no separate marketing required.

**Daml studio channel.** Daml development studios build on Canton for clients and can incorporate CAEL reference implementations into their work, making them a natural distribution channel. Outreach for M4 pilot partners is planned ahead of M3 completion.

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

Project duration exceeds 6 months. The grant is denominated in fixed Canton Coin. At the 6-month mark (end of Q4 2026), remaining milestone CC amounts will be re-evaluated by Tech & Ops using a trailing 30-day average CC/USD rate, consistent with CIP-0100 guidance.

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

The Canton 402 payment protocol is a unique opportunity: x402 has processed over 100 million agentic payment transactions on Base alone since mid-2025 (Chainalysis, 2026). A Canton-native equivalent, built on Daml's atomic settlement guarantees, would be the first institutional-grade agent payment standard — a meaningful differentiator for Canton's ecosystem.

---

## Rationale

- **Public goods framing:** open-source, reusable by any Canton builder, not Sumplus-specific
- **Daml-native:** policy, audit, registry, and payments in Daml — no off-chain workarounds, full Canton composability
- **Incremental delivery:** each milestone ships working software, not just specs
- **Ecosystem leverage:** Arsenal's existing 100+ skill network + agent user base accelerates Canton skill adoption from day one
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
| Ecosystem adoption slower than expected | Arsenal's existing agent user base provides immediate distribution; Daml studio outreach provides M4 pilot pipeline |

---

## Appendix: IP / Licensing

- License: Apache-2.0
- Open development: public repo, public issues, tagged releases, reproducible CI
- No proprietary lock-in: adapters are generic; reference implementations are reusable patterns

---

## Appendix: Supporting Materials

- CAEL public GitHub: https://github.com/sumplus-real/cael
- Arsenal skills marketplace: https://arsenal.sumplus.xyz (live stats: https://arsenal.sumplus.xyz/api/stats)
- Sumplus: https://sumplus.xyz
- Contact: j@sumplus.xyz

---

## Appendix: References

Wallet and custody integration:
- Canton Wallet Gateway (open-source, Apache-2.0; includes Fireblocks, Blockdaemon, and Dfns signing drivers): https://github.com/canton-network/wallet
- Canton external-party signing flow (Digital Asset documentation): https://docs.digitalasset.com/integrate/devnet/preparing-and-signing-transactions/index.html
- Canton external party / wallet creation (Digital Asset documentation): https://docs.digitalasset.com/integrate/devnet/party-management/index.html
- Dfns institutional custody and wallet infrastructure on Canton (Canton Network announcement): https://www.canton.network/blog/introducing-dfns-institutional-grade-custody-and-wallet-infrastructure-on-canton-network
- Canton guide to wallets, exchanges, and custody providers: https://www.canton.network/blog/a-guide-to-wallets-exchanges-and-custody-providers

Agent payments context:
- Chainalysis, "Inside x402: 100M Agentic Payments on Base" (2026): https://www.chainalysis.com/blog/x402-agentic-payments-adoption/
