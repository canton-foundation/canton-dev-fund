## Development Fund Proposal

**Title:** Canton Agent Execution Layer (CAEL): Open-Source Policy-Driven Execution, Skills Infrastructure, and Agent Payment Protocol for Canton
**Author:** Sumplus (j@sumplus.xyz)
**Status:** Submitted
**Created:** 2026-03-23
**Updated:** 2026-06-17
**Proposed SIG / Labels:** `financial-workflows-composability` (primary), `canton-apis`, `wallet-apps`, `dapp-integration`

---

## Abstract

CAEL is an open-source toolkit for running AI-agent workflows on Canton. It covers three operations agents need in production: executing Canton workflows, calling onchain skills, and paying for services on their own. The work breaks into three open-source components. **Maria on Canton** runs policy-gated execution and writes audit evidence. **Arsenal Canton Skills** puts Canton skills behind the existing Arsenal interface so other agents can call them. **Canton 402** is a Daml-based pay-and-call flow, modeled on HTTP 402/x402. All three are Apache-2.0 and reusable by other Canton teams, not tied to Sumplus products.

---

## Specification

### 1. Objective

Agent traffic is already showing up in onchain products, but Canton does not yet have a common execution path for agent-initiated workflows. Canton is a strong fit for these workflows because it combines party-level privacy with Daml-based multi-party settlement. The missing piece is a standard way for agents to:
- Execute Canton workflows with policy enforcement and audit trails
- Discover and call Canton-native skills and services
- Pay for onchain services atomically without manual intermediaries

This proposal funds those three pieces as open-source Canton infrastructure.

---

### 2. Technical Approach

#### 2.1 Maria on Canton: Policy-Driven Agent Execution

Maria is an execution agent purpose-built for onchain finance. On Canton, Maria provides:

- The agent never holds private keys. Maria prepares each transaction and requests signatures through a policy layer, so keys stay with the wallet or custody provider. See "Wallet and Custody Integration" below.
- Policy checks run as Daml contracts before any action reaches the ledger: counterparty allowlists, per-transaction value caps, daily limits, and operation-type restrictions.
- Every workflow is dry-run against Canton Sandbox before it goes live, so failures surface before they touch mainnet.
- Each execution emits a privacy-preserving evidence bundle: intent, which policy checks passed or failed, the result, and who can disclose what.

**Wallet and Custody Integration.** Maria's production deployments outside Canton already run this separation: all keys are held by a third-party wallet infrastructure provider, and the agent obtains signatures through policy-gated API calls. CAEL implements the same pattern using Canton's native primitives, so institutions keep their existing custody arrangements:

- Agent parties are allocated as Canton external parties, so keys never reside on the participant node. Transaction preparation and submission follow Canton's documented external signing flow.
- Maria connects through the open-source Canton Wallet Gateway (canton-network/wallet), which forwards signing requests to the operator's configured signing provider. A reference integration against the open-source Splice / Canton Coin wallet stack ships as a CAEL deliverable (M1–M2), with reproducible setup instructions.
- Through the Wallet Gateway's signing-provider interface, CAEL targets custody infrastructure already live on Canton: Fireblocks, Blockdaemon, and Dfns. All three ship as signing drivers in the Wallet Gateway repository today, and Dfns has announced custody and wallet infrastructure on Canton. Institutions using HSM- or MPC-based custody can connect their existing providers without code changes to CAEL.
- Maria runs in production with users on other chains today, and an early Canton integration (Maria and Arsenal running against Canton) already works in Sumplus's internal environment. No Canton client exists yet; this grant takes the integration from an internal environment to a public repo with Wallet Gateway custody integration, reproducible setup, and external pilots. Pilot integrations are an explicit M4 adoption KPI, with candidates drawn from Maria and Arsenal's existing user base extending to Canton, plus institutional introductions.

**Tech stack:** Daml (policy contracts + audit templates), Canton Ledger API (Java/TypeScript), Canton Wallet Gateway + external-party signing, Canton Sandbox (simulation), Maria execution engine (TypeScript)

#### 2.2 Arsenal Canton Skills: Open Skills Marketplace

Arsenal is an open marketplace of callable skills and tools for AI agents. Canton-specific skills published via CAEL include:

- Token transfer: Canton token standard compliant transfers with pre-flight checks
- DvP settlement: atomic Delivery-versus-Payment using Canton's native multi-party model
- Balance and yield queries: read-only Canton ledger reads for positions, balances, and yield rates
- Skill Registry contract: an onchain registry of available skills with versioning, permissions, and call history

Skills are exposed through the standard `/invoke` interface (REST, MCP-compatible), callable by Maria and by third-party agents. Arsenal already has 100+ live skills across 15+ chains (independently verifiable at arsenal.sumplus.xyz/api/stats); Canton skills extend this to institutional workflows.

**Tech stack:** Daml (Skill Registry contract), Canton Ledger API, Arsenal `/invoke` REST interface, MCP adapter

#### 2.3 Canton 402: Agent-Native Payment Protocol

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
  │  Atomic settlement: payment and service delivery committed together
  │  or both rolled back (no partial fills)
  ▼
Service Provider (Arsenal skill / any Canton service)
```

**Daml contract suite:**
- `PaymentObligation`: defines the payment terms between agent and service provider
- `PaymentReceipt`: immutable onchain receipt generated on successful settlement
- `PaidService`: template any Canton protocol can implement to gate access behind Canton 402 payment
- `AgentPermissionFramework`: standardized Daml templates for managing agent access rights across Canton services

**HTTP 402 Gateway:** Standard HTTP interface. Any agent sends a signed payment header with its request; the gateway handles Daml transaction construction and submission. No Canton SDK required on the agent side.

**Maria integration:** Built-in Canton 402 signing with policy controls (per-tx limits, daily caps, approved service whitelist). Maria agents can pay for Canton services autonomously within defined policy bounds.

**Tech stack:** Daml (payment contracts), Canton Ledger API, HTTP gateway (TypeScript/Java), Maria payment module

---

### 3. Architectural Alignment

- **Canton token standards:** Arsenal skills and Maria execution are built on Canton's native token-standard workflow patterns (DvP, transfer, multi-party authorization)
- **Daml-native:** All policy enforcement, audit trails, skill registry, and payment contracts are implemented in Daml, with no off-chain workarounds
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

### Milestone 3: Canton 402 Agent Payment Protocol
- **Estimated Delivery:** 2027-03-31 (Q1 2027)
- **Focus:** Implement a Canton-native HTTP 402-style payment flow so agents can discover, pay for, and use onchain Canton services in one atomic transaction.
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
- Each milestone includes its own adoption evidence; the committee does not need to wait until M4 to verify external usage. Adoption KPIs are listed per milestone above and are the primary acceptance signal
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
| AI agent developers (non-Canton) | Access Canton's RWA liquidity via Arsenal's `/invoke` interface and MCP adapter, no Canton SDK required |
| Daml development studios | Reference implementation and SDK as foundation for client projects |

### Distribution Approach

**Open-source first.** All CAEL components ship on GitHub (Apache-2.0) with reproducible builds and public CI. The Canton ecosystem's existing developer community is the primary distribution channel.

**Canton Foundation co-marketing.** Upon each milestone release, coordinate with the Foundation on:
- Developer blog post / technical case study
- Announcement in Canton developer channels and grants-discuss list
- Joint workshop session for Canton builders

**Arsenal distribution.** Arsenal already has 100+ live skills across 15+ chains. Publishing Canton skills there gives existing agent users a place to discover and test Canton services without a separate directory.

**Daml studio channel.** Daml development studios build on Canton for clients and can incorporate CAEL reference implementations into their work, making them a natural distribution channel. Outreach for M4 pilot partners is planned ahead of M3 completion.

**Canton 402 adoption path.** If a service provider implements the `PaidService` template, Canton 402-compatible agents can call it through the same payment flow. The first target is a small set of DevNet/TestNet providers, then a candidate CIP once implementer feedback is public.

**Developer onboarding target:** Any Canton builder can run the M1 quickstart demo in under 30 minutes from a clean machine.

---

## Funding

**Total Funding Request:** 1,623,000 CC

**CC/USD Reference Rate:** $0.1616/CC (public market data, 2026-06-17)

### Payment Breakdown by Milestone

| Milestone | Amount (CC) | USD-equivalent | Payment Condition |
|---|---:|---:|---|
| M1: Maria on Canton + Arsenal Skills | 310,000 CC | ~$50,096 | Upon committee acceptance |
| M2: Onchain Daml Contracts | 370,000 CC | ~$59,792 | Upon committee acceptance |
| M3: Canton 402 Agent Payment Protocol | 393,000 CC | ~$63,509 | Upon committee acceptance |
| M4: Ecosystem Pilots + Maintenance Handoff | 550,000 CC | ~$88,880 | Upon final release and acceptance |
| **Total** | **1,623,000 CC** | **~$262,277** | |

### Volatility Stipulation

Project duration exceeds 6 months. The grant is denominated in fixed Canton Coin. At the 6-month mark (end of Q4 2026), remaining milestone CC amounts will be re-evaluated by Tech & Ops using a trailing 30-day average CC/USD rate, consistent with CIP-0100 guidance.

---

## Co-Marketing

For each accepted milestone, Sumplus will provide release notes, a runnable demo, and a short technical write-up for Foundation channels (for example, "Policy-driven agent execution on Canton"), plus a developer workshop through Foundation developer relations. For Canton 402, Sumplus will separately coordinate the CIP draft and its public discussion thread.

---

## Motivation

Canton is a strong venue for institutional RWA workflows, but it has no shared infrastructure for agents to act on Canton under policy controls. If Canton teams start exposing services to agents, they will each face the same plumbing: prepare a transaction, check policy, log it, find skills, settle payment. CAEL builds that plumbing once, in open-source form, instead of leaving each team to rebuild it. The deliverables are reusable Canton components: Daml contracts, service interfaces, gateway code, and docs that other teams can run without depending on Sumplus products.

x402 has settled over 100 million agentic payment transactions on Base alone since mid-2025 (Chainalysis, 2026). Canton does not yet have an equivalent payment pattern for Daml-based services. Canton 402 tests whether the same pay-and-call model works on Canton's atomic settlement, and it would be the first agent payment protocol native to Canton.

---

## Rationale

- **Reusable components:** Apache-2.0 repos, generic adapters, and docs that are not tied to Sumplus-hosted services
- **Daml implementation:** policy checks, audit records, registry entries, and payment contracts live in Daml rather than a side database
- **Delivery evidence:** each milestone includes runnable software, docs, and external verification targets
- **Distribution:** Arsenal gives Canton skills an initial agent-facing directory; Daml studios provide a path to pilots
- **Standardization path:** Canton 402 will be written up as a candidate CIP after DevNet/TestNet implementer feedback

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
