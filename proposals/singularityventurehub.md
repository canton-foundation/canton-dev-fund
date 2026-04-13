## Development Fund Proposal

**Author:** Amaury | Singularity Venture Hub  
**Status:** Submitted  
**Created:** 2026-04-12  
**Label:** financial-workflows-composability

**Champion:** Need Champion

---

## Abstract

The Canton Signal Exchange is a confidential on-chain marketplace where AI-derived market intelligence can be published, purchased, and verified with full provenance — all settling atomically in Daml smart contracts on the Canton Network.

Signal producers publish source datasets, derived analytics, and actionable signals as on-ledger listings. Buyers discover and purchase access through atomic settlement (payment + entitlement in one workflow) and receive private updates visible only to entitled parties. Curators compose upstream feeds into higher-order products with full lineage tracking. Every signal carries verifiable provenance — source lineage, model version, freshness, and confidence — inspectable by buyers and auditors without exposing the underlying data.

This grant funds core R&D infrastructure for Canton. The Canton Signal Exchange is a reference implementation that demonstrates capabilities unique to Canton's architecture and cannot be replicated on any other distributed ledger.

**Total grant request: $135,000 across 4 milestones — delivered in 6–8 weeks.**

---

## Specification

### 1. Objective

**Problem:** Canton lacks a confidential, provenance-verified data marketplace. As AI protocols and autonomous agents proliferate on-chain, there is no infrastructure for producers to monetize signals with privacy guarantees, and no trusted mechanism for consumers — including AI agents — to purchase and verify the data they need.

**Outcome:** A fully functional Canton Signal Exchange — reference implementation with 7 Daml contract templates, a TypeScript/Node.js backend, React frontend, and a live demonstration environment — delivered open-source and under a perpetual, non-exclusive license to Canton.

Success looks like:

- A producer can list a confidential signal feed on-chain and publish private updates visible only to entitled buyers
- A buyer can purchase access atomically (payment + entitlement in one transaction) and inspect full provenance
- A curator can compose a derived product from upstream feeds with on-chain lineage
- Non-entitled parties see nothing — enforced at the protocol level, not in application middleware
- The full flow completes in a live demo in under 5 minutes

### 2. Implementation Mechanics

The Canton Signal Exchange follows a strict separation between on-ledger state and off-ledger computation. Heavy AI inference and data processing stay off-chain; rights, workflow state, and integrity anchors live on Canton.

**On-Ledger (Daml on Canton)**

Seven Daml contract templates govern the entire marketplace lifecycle:

- **SignalListing** — Product metadata, pricing, visibility rules, category, cadence, and allowed buyer policies. Supports status lifecycle (Draft → Active → Suspended).
- **PurchaseOffer + SettlementReceipt** — Atomic purchase workflow. The `SettleAndIssueEntitlement` choice creates both the settlement receipt and the subscription entitlement in a single transaction — no partial state possible.
- **SubscriptionEntitlement** — Buyer access rights with time bounds, usage rights, and status lifecycle (Active → Expired/Revoked).
- **SignalUpdateHeader** — On-chain metadata for each signal update (payload hash, confidence, freshness expiry, model version). The `visibleTo` observer array enforces Canton's sub-transaction privacy.
- **ProvenanceRecord** — Immutable lineage: source listing IDs, input hash set, output hash, compute job ID, model version, and timestamp.
- **RevenueSplit** — Producer, curator, and marketplace fee shares with on-chain enforcement.

**Off-Ledger (TypeScript/Node.js + React)**

- **Backend (Express 5)** — RESTful API layer integrating with Canton's Ledger API via gRPC. Handles listing management, purchase orchestration, update publication, query services, and connector orchestration.
- **AI/Data connectors** — Pluggable sentiment, risk, and opportunity model services. POC ships with mock connectors; production connectors are drop-in replacements via environment configuration.
- **Provenance pipeline** — Deterministic SHA-256 hashing of all model inputs and outputs, with signed artifacts stored off-ledger and hash references anchored on-chain.
- **React frontend (Vite)** — Six-page application: marketplace catalog, listing detail with purchase flow, buyer dashboard, producer console, provenance inspector, and role-based onboarding.

**End-to-End Demo Flow**

1. Producer A lists a Sentiment Pulse Feed (hourly cadence, $125/month) as a `SignalListing` contract on Canton.
2. Producer B lists a Vault Risk Feed (hourly, $180/month) as a separate on-ledger listing.
3. Curator C creates a derived product — the Vault Opportunity Composite ($300/month) — referencing both upstream feeds in its `sourceListingIds`. The lineage is on-chain.
4. Buyer D purchases the Composite. The `SettleAndIssueEntitlement` choice executes atomically: payment instruction, settlement receipt, and subscription entitlement are created in one transaction.
5. Curator C publishes a private update. The `SignalUpdateHeader` is created with Buyer D in the `visibleTo` array. Non-entitled parties cannot see the payload.
6. Buyer D inspects provenance: source feed lineage, model version, freshness timestamp, confidence level, input/output hashes — all verifiable without exposing the full data to anyone else.

### 3. Architectural Alignment

The Canton Signal Exchange is purpose-built to demonstrate Canton's unique architectural advantages:

- **Sub-transaction privacy** — Canton is the only production DLT where contract observers are enforced at the protocol level. Signal payloads are visible exclusively to entitled parties — not to validators, not to other network participants, not to anyone outside the entitlement contract. This is architecturally impossible on Ethereum, Solana, or any public chain.
- **Atomic multi-party workflows** — Daml's choice mechanism allows purchase, settlement receipt creation, and entitlement issuance to execute as a single atomic transaction. There is no intermediate state where payment exists without entitlement, or entitlement without payment.
- **Composable smart contracts with lineage** — Daml contracts can reference other contracts by ID, enabling derived signal products that formally link back to their upstream sources. This creates an auditable, on-chain dependency graph — a provenance chain that is immutable and verifiable without revealing the actual data.
- **Institutional-grade identity model** — Canton's party-based identity system maps directly to real-world entities (producers, buyers, curators, auditors, operators). Access control is enforced by the ledger itself, not by application-layer middleware.

Per CIP-0082, the fund targets "core R&D, dev tools, security, audits, reference implementations, DeFi app(s), critical infra." The Canton Signal Exchange qualifies on multiple dimensions: it is a core R&D demonstration, a complete open-source reference implementation, critical infrastructure for AI agents and DeFi protocols on Canton, and a DeFi application in its own right.

### 4. Backward Compatibility

_No backward compatibility impact._ The Canton Signal Exchange is a new, standalone reference implementation with no dependency on existing Canton deployments or contracts.

---

## Milestones and Deliverables

### Milestone 1: Daml Contracts Delivered and Tests Passing

- **Estimated Delivery:** Weeks 1–6 from project start
- **Focus:** On-ledger contract layer — all 7 Daml contract templates, full test suite, and contract documentation
- **Deliverables / Value Metrics:**
  - All 7 Daml contract templates: `SignalListing`, `PurchaseOffer`, `SubscriptionEntitlement`, `SignalUpdateHeader`, `ProvenanceRecord`, `SettlementReceipt`, `RevenueSplit`
  - Full Daml Script test suite covering all choices, lifecycle transitions, and error conditions
  - Integration test scenarios (multi-party atomic workflows, privacy enforcement, lineage tracking)
  - Contract documentation and architecture notes

### Milestone 2: Backend Delivered

- **Estimated Delivery:** ~Weeks 4–5 (parallel to Daml work, released after M1)
- **Focus:** Off-ledger API layer — Express 5 backend, Ledger API integration, provenance pipeline, mock connectors
- **Deliverables / Value Metrics:**
  - Express 5 backend with RESTful API endpoints for: catalog discovery, listing management, atomic purchase orchestration, signal update publication, provenance queries, connector health monitoring
  - Ledger API integration via gRPC
  - Idempotency layer and dead-letter queue for failed operations
  - Mock AI/data connectors (sentiment, Vault risk, opportunity model) with deterministic SHA-256 provenance hashing pipeline
  - Structured error handling and API documentation

### Milestone 3: Front End Delivered

- **Estimated Delivery:** ~Weeks 5–7
- **Focus:** React web application — full six-page UI, seeded demo data, and end-to-end scenario runner
- **Deliverables / Value Metrics:**
  - React web application (6 pages): marketplace catalog with filtering, listing detail page with purchase flow, buyer dashboard (entitlements, freshness warnings, confidence scores), producer console (create listings, publish updates, manage status), provenance inspector (lineage graph, hashes, model versions), role-based onboarding
  - Seeded demo data and scripted end-to-end scenario runner
  - Non-entitled visibility test (UI demonstrates that non-entitled users see nothing)

### Milestone 4: Docs, CI/CD, Demo Hardened

- **Estimated Delivery:** Weeks 6–8 (final gate)
- **Focus:** Production hardening — CI/CD pipeline, full documentation, live demo environment with timed runbook
- **Deliverables / Value Metrics:**
  - GitHub Actions workflows: secret scanning (Gitleaks), dependency audit, build, test, deploy
  - Makefile automation and deployment scripts
  - Full architecture guide and API reference documentation
  - Live demonstration environment with runbook
  - Full demo completing in under 5 minutes (timed)

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone
- Demonstrated functionality or operational readiness
- Documentation and knowledge transfer provided
- Alignment with stated value metrics

**Milestone 1 — specific conditions:**

- All Daml Script tests pass in CI
- A committee member or delegate can review contract source and verify the `SettleAndIssueEntitlement` atomic choice creates both `SettlementReceipt` and `SubscriptionEntitlement` in a single transaction
- Non-entitled party visibility test passes: a party not in `visibleTo` cannot observe `SignalUpdateHeader` contracts

**Milestone 2 — specific conditions:**

- Purchase endpoint triggers atomic `SettleAndIssueEntitlement` on Canton and returns both settlement receipt and entitlement IDs in one response
- Provenance query endpoint returns full lineage graph for a given listing

**Milestone 3 — specific conditions:**

- Full end-to-end flow (list → purchase → deliver → inspect → derive) completes in a UI walkthrough
- Provenance inspector displays source lineage, model version, freshness, confidence, and hash chain

**Milestone 4 — specific conditions:**

- CI pipeline passes on clean checkout (all Daml, backend, and E2E tests green)
- Live demo completes full scenario (list → purchase → deliver → inspect → derive) in under 5 minutes before the committee

---

## Funding

**Total Funding Request: $135,000**

### Payment Breakdown by Milestone

| Milestone   | Deliverable                                | Grant Release                             |
| ----------- | ------------------------------------------ | ----------------------------------------- |
| Milestone 1 | Daml contracts delivered and tests passing | $65,000 upon committee acceptance         |
| Milestone 2 | Backend delivered                          | $25,000 upon committee acceptance         |
| Milestone 3 | Front end delivered                        | $30,000 upon committee acceptance         |
| Milestone 4 | Docs, CI/CD, demo hardened                 | $15,000 upon final release and acceptance |
| **TOTAL**   | **6–8 weeks**                              | **$135,000**                              |

Funding is denominated in USD, payable in Canton Coin per CIP-0100.

### Volatility Stipulation

The project duration is under 6 months. Should the project timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility. Milestones 2 and 3 are additionally subject to renegotiation if CC/USD moves ±40% during delivery.

---

## Co-Marketing

Upon release, SVH will collaborate with the Foundation on:

- **Announcement coordination** — Coordinated social media campaign from SingularityNET, ASI Alliance, Fetch.ai, Cudos, and Intellistake, positioning Canton as the first institutional DeFi network with a confidential, provenance-verified data marketplace.
- **Case study or technical blog** — Web3 AI community outreach to showcase how the Signal Exchange opens new use cases on Canton, from confidential signal monetization to composable intelligence products.
- **Developer or ecosystem promotion** — Data marketplace workshops with Canton-selected projects to understand their data needs and what signals or datasets they can contribute. Recurring builder office hours walking Canton participants through listing creation, signal publication, provenance setup, and data pipeline integration.
- **PR & Media** — Intellistake (publicly listed company in Canada) will lead press outreach and generate coverage in Web3 media outlets. Milestone-based PR waves will trigger at data volume, active listings, and transaction volume milestones, creating a sustained narrative of growth.

---

## Motivation

**Why This Is Core R&D for Canton**

The Canton Signal Exchange is not just another marketplace — it is a purpose-built demonstration of Canton's unique architectural advantages that no other distributed ledger can offer today. Sub-transaction privacy enforced at the protocol level, combined with atomic multi-party Daml workflows and on-chain composable lineage, cannot be replicated on any public chain.

**Why a Data Marketplace Specifically?**

AI scalability on Canton depends on data access. As autonomous agents and AI protocols proliferate on-chain, they need reliable, verifiable data feeds from other Canton participants. The Signal Exchange is the infrastructure layer that makes this possible — in a privacy-preserving, atomically settled way that only Canton can provide. This is especially critical for agent-to-agent transactions, where autonomous systems need provenance-verified data inputs to act without requiring a human in the loop.

Risk scores, opportunity signals, and sentiment analytics published on the Exchange provide the decision-grade intelligence that DeFi protocols and institutional participants need. More data products drive better decision-making, which drives more transactions on Canton.

---

## Rationale

**Why SVH?**

Singularity Venture Hub is the venture and integration hub of the ASI ecosystem, working directly with SingularityNET, ASI Alliance, Fetch.ai, and Cudos to bring ASI's technology to new networks and verticals. This provides direct access to AI/data engineering talent and a mandate to drive real-world adoption of decentralized AI products.

Our engineering team has deep expertise in meTTa, the functional programming language developed at SingularityNET. Daml and meTTa share the same core paradigm — both are functional languages with similar type-theoretic foundations and contract logic patterns — making the transition to Daml development natural and fast for our developers. The team is already comfortable reasoning about contract state machines, choice-based workflows, and composable logic, which maps directly to Daml's programming model.

To further strengthen delivery confidence, SVH is in active talks with Intellect EU, a team with established Daml expertise within the Canton ecosystem. Should an agreement be reached, they would support code review, provide technical guidance on Canton-specific Daml patterns, and help validate contract architecture.

Beyond delivery, SVH will serve as the ongoing go-to-market engine and facilitator for the product on Canton — driving usage, integration support, developer education, and hands-on assistance for Canton participants who want to list, consume, or build on top of the marketplace.
