## Development Fund Proposal

**Author:** Amaury | Singularity Venture Hub  
**Status:** Submitted  
**Created:** 2026-04-12  
**Label:** financial-workflows-composability

**Champion:** Canton Foundation (Bo Zhang)

---

## Abstract

Canton has no reference implementation for **on-chain data provenance, composable product lineage, or multi-party revenue distribution**. As AI agents and data-driven DeFi protocols proliferate on Canton, builders need reusable contract patterns for verifying where data came from, tracking how derived products relate to their upstream sources, and splitting revenue across a composition chain — all while preserving Canton's sub-transaction privacy.

This proposal delivers these missing patterns as an open-source Canton Signal Exchange — a focused reference implementation that extends existing Canton tooling (cn-quickstart, Canton Utilities) with three contract modules that do not exist in the ecosystem today:

1. **Provenance tracking** — An immutable on-chain record linking outputs to inputs, model versions, and timestamps, verifiable without exposing underlying data.
2. **Composable product lineage** — A contract-level dependency graph where derived products formally reference their upstream sources, creating an auditable composition chain.
3. **Multi-party revenue splits** — On-chain enforcement of fee distribution between original producers, curators, and the marketplace when derived products are purchased.

These patterns are wrapped in a working demo application with a lightweight UI and backend, enabling Canton builders to see, test, and reuse the contracts in their own projects.

**Total grant request: $100,000 across 3 milestones — delivered in 6–8 weeks.**

---

## Specification

### 1. Objective

**Problem:** Canton's existing reference implementations (cn-quickstart, da-marketplace, Canton Utilities) cover atomic settlement, time-bounded subscriptions, and token lifecycle management. However, none address the contract patterns required for data commerce — specifically provenance verification, derived product composition with lineage, and revenue distribution across a multi-party supply chain. These are the patterns institutional data consumers and AI agents need before they can transact confidently on Canton.

**Outcome:** Three reusable Daml contract modules — provenance, lineage, and revenue splits — integrated into a working Signal Exchange demo application with a TypeScript backend and lightweight React frontend. Delivered open-source under a perpetual, non-exclusive license to Canton.

Success looks like:

- A producer can publish a data feed and push private updates visible only to entitled buyers (using Canton's observer model)
- A curator can create a derived product that formally references upstream feeds, with on-chain lineage
- When a buyer purchases a derived product, revenue splits automatically to upstream producers, the curator, and the marketplace — enforced by the contract
- A buyer or auditor can inspect full provenance: source lineage, model version, freshness, confidence, and input/output hashes — without seeing the underlying data
- All patterns are documented and tested for reuse by other Canton builders

### 2. Implementation Mechanics

The Canton Signal Exchange follows a strict separation between on-ledger state and off-ledger computation.

**On-Ledger (Daml on Canton)**

The implementation builds on existing Canton patterns where they exist and introduces new contract templates where they don't.

_Leveraging existing patterns (not claiming novelty):_

- **SignalListing** — Product metadata, pricing, visibility rules, and status lifecycle. Follows the listing pattern established in da-marketplace and cn-quickstart, adapted for data products with signal-specific fields (cadence, confidence thresholds, allowed buyer policies).
- **PurchaseOffer + SettlementReceipt** — Atomic purchase workflow. The `SettleAndIssueEntitlement` choice creates both a settlement receipt and a subscription entitlement in a single transaction. Builds on the atomic settlement pattern from cn-quickstart's `LicenseRenewalRequest` / `AllocationRequest` integration, extended with an explicit on-chain receipt artifact for audit purposes.
- **SubscriptionEntitlement** — Buyer access rights with time bounds, usage rights, and status lifecycle. Extends the time-bounded access pattern from cn-quickstart's License contract.

_Novel contract modules (the core contribution):_

- **SignalUpdateHeader** — On-chain metadata for each signal update (payload hash, confidence, freshness expiry, model version). The `visibleTo` observer array enables a recurring private content delivery pattern — producers push updates to entitled subscribers, with per-update visibility control. This continuous delivery workflow has no equivalent in existing Canton tooling.
- **ProvenanceRecord** — Immutable lineage record: source listing IDs, input hash set, output hash, compute job ID, model version, and timestamp. Creates a verifiable dependency DAG on-chain. No existing Canton reference implementation covers this pattern.
- **RevenueSplit** — Producer, curator, and marketplace fee shares with on-chain enforcement. When a derived product is purchased, revenue distributes automatically to all upstream contributors based on contract-defined splits. No existing Canton tooling handles multi-party, composition-aware revenue distribution.

**Off-Ledger (TypeScript/Node.js + React)**

- **Backend (Express 5)** — RESTful API layer integrating with Canton's Ledger API via gRPC. Handles listing management, purchase orchestration, update publication, provenance queries, and connector orchestration. The backend is intentionally lightweight — it demonstrates integration patterns, not production infrastructure.
- **AI/Data connectors** — Mock sentiment, risk, and opportunity model services with deterministic SHA-256 provenance hashing. Designed as pluggable interfaces for future replacement with real data sources.
- **React frontend (Vite)** — Focused on demonstrating the novel contract patterns: provenance inspector (lineage graph, hashes, model versions), revenue split visualization, and the recurring update delivery flow. Marketplace catalog and purchase flow included for end-to-end demo completeness.

**End-to-End Demo Flow**

1. Producer A lists a Sentiment Pulse Feed as a `SignalListing` contract on Canton.
2. Producer B lists a Vault Risk Feed as a separate on-ledger listing.
3. Curator C creates a derived product — the Vault Opportunity Composite — referencing both upstream feeds in its `sourceListingIds`. The lineage is on-chain via `ProvenanceRecord`.
4. Buyer D purchases the Composite. The `SettleAndIssueEntitlement` choice executes atomically: settlement receipt and subscription entitlement created in one transaction. `RevenueSplit` distributes revenue to Producers A, B, Curator C, and the marketplace.
5. Curator C publishes a private update. The `SignalUpdateHeader` is created with Buyer D in the `visibleTo` array. Non-entitled parties cannot see the payload.
6. Buyer D inspects provenance: source feed lineage, model version, freshness timestamp, confidence level, input/output hashes — all verifiable without exposing the full data.

### 3. Architectural Alignment

This proposal targets three gaps in Canton's reference ecosystem:

- **Provenance verification** — Canton's sub-transaction privacy means provenance must be verifiable without revealing the underlying data. The `ProvenanceRecord` pattern demonstrates this: buyers and auditors can inspect the full lineage chain (source IDs, hashes, model versions) while the actual data remains private to entitled parties. This is architecturally impossible on public chains where all contract state is visible.
- **Composable contracts with lineage** — Daml contracts can reference other contracts by ID, but no existing reference implementation demonstrates a multi-layer composition chain with formal lineage tracking. This proposal fills that gap.
- **Multi-party atomic workflows** — Canton's choice mechanism enables atomic multi-party settlement, but existing references are limited to bilateral transactions. The `RevenueSplit` pattern extends this to N-party distribution within a single atomic transaction.

Per CIP-0082, the fund targets "core R&D, dev tools, security, audits, reference implementations, DeFi app(s), critical infra." This proposal delivers reusable reference patterns for the Canton ecosystem.

### 4. Backward Compatibility

_No backward compatibility impact._ The Canton Signal Exchange is a new, standalone reference implementation with no dependency on existing Canton deployments or contracts.

---

## Milestones and Deliverables

### Milestone 1: Novel Daml Contracts and Test Suite

- **Estimated Delivery:** Weeks 1–4 from project start
- **Focus:** The three novel contract modules (`ProvenanceRecord`, `RevenueSplit`, `SignalUpdateHeader`) plus the adapted patterns (`SignalListing`, `PurchaseOffer`, `SettlementReceipt`, `SubscriptionEntitlement`), with full test suite
- **Deliverables / Value Metrics:**
  - All Daml contract templates with full Daml Script test suite covering all choices, lifecycle transitions, and error conditions
  - Integration test scenarios: multi-party atomic workflows, privacy enforcement, lineage tracking, revenue split distribution
  - Non-entitled party visibility test: a party not in `visibleTo` cannot observe `SignalUpdateHeader` contracts
  - Contract documentation explicitly identifying which patterns are novel vs. adapted from existing tooling

### Milestone 2: Backend, Frontend, and End-to-End Demo

- **Estimated Delivery:** Weeks 3–6 (parallel start, released after M1)
- **Focus:** Off-ledger integration layer, lightweight React UI focused on demonstrating novel patterns, seeded demo data, and scripted end-to-end scenario
- **Deliverables / Value Metrics:**
  - Express 5 backend with Ledger API integration via gRPC
  - Mock AI/data connectors with deterministic SHA-256 provenance hashing pipeline
  - React web application: provenance inspector (lineage graph, hashes, model versions), revenue split visualization, marketplace catalog, purchase flow, buyer dashboard, producer console
  - Seeded demo data and scripted end-to-end scenario runner
  - Full demo completing list → purchase → revenue split → deliver → inspect provenance → derive flow

### Milestone 3: Documentation, CI/CD, and Demo Hardening

- **Estimated Delivery:** Weeks 5–8 (final gate)
- **Focus:** Production hardening, documentation, live demo environment
- **Deliverables / Value Metrics:**
  - GitHub Actions workflows: secret scanning, dependency audit, build, test, deploy
  - Architecture guide explicitly documenting reusable patterns for other Canton builders
  - API reference documentation
  - Live demonstration environment with runbook, completing in under 5 minutes
  - Pattern reuse guide: how to extract and adapt `ProvenanceRecord`, `RevenueSplit`, and `SignalUpdateHeader` for other Canton applications

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone
- Demonstrated functionality or operational readiness
- Documentation and knowledge transfer provided
- Alignment with stated value metrics

**Milestone 1 — specific conditions:**

- All Daml Script tests pass in CI
- A committee member or delegate can review contract source and verify: `SettleAndIssueEntitlement` atomic choice creates both `SettlementReceipt` and `SubscriptionEntitlement` in a single transaction; `ProvenanceRecord` correctly links derived products to upstream source listing IDs with hash verification; `RevenueSplit` distributes funds to all upstream contributors in a single atomic transaction
- Non-entitled party visibility test passes: a party not in `visibleTo` cannot observe `SignalUpdateHeader` contracts

**Milestone 2 — specific conditions:**

- Full end-to-end flow (list → purchase → revenue split → deliver → inspect provenance → derive) completes in a UI walkthrough
- Provenance inspector displays source lineage, model version, freshness, confidence, and hash chain
- Revenue split visualization shows correct distribution across producers, curator, and marketplace

**Milestone 3 — specific conditions:**

- CI pipeline passes on clean checkout (all Daml, backend, and E2E tests green)
- Live demo completes full scenario in under 5 minutes before the committee
- Pattern reuse guide reviewed and confirmed usable by a committee member or delegate

---

## Funding

**Total Funding Request: $100,000**

### Payment Breakdown by Milestone

| Milestone   | Deliverable                        | Grant Release           |
| ----------- | ---------------------------------- | ----------------------- |
| Milestone 1 | Daml contracts and test suite      | $40,000 upon acceptance |
| Milestone 2 | Backend, frontend, end-to-end demo | $35,000 upon acceptance |
| Milestone 3 | Docs, CI/CD, demo hardened         | $25,000 upon acceptance |
| **TOTAL**   | **6–8 weeks**                      | **$100,000**            |

Funding is denominated in USD, payable in Canton Coin per CIP-0100.

### Volatility Stipulation

The project duration is under 6 months. Should the project timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility. Milestones 2 and 3 are additionally subject to renegotiation if CC/USD moves ±40% during delivery.

---

## Co-Marketing

Upon release, SVH will collaborate with the Foundation on:

- **Announcement coordination** — Coordinated social media campaign from SingularityNET, ASI Alliance, Fetch.ai, Cudos, and Intellistake, positioning Canton as infrastructure for confidential, provenance-verified data commerce.
- **Case study or technical blog** — Technical deep-dive on the novel contract patterns (provenance, lineage, revenue splits) and how Canton builders can reuse them.
- **Developer workshops** — Hands-on sessions with Canton-selected projects walking through pattern reuse, signal publication, provenance setup, and data pipeline integration.

---

## Motivation

**Why These Patterns Matter for Canton**

Canton's existing reference implementations cover atomic settlement, time-bounded subscriptions, and token lifecycle. But as AI agents and data-driven DeFi protocols arrive on Canton, builders need patterns the ecosystem doesn't have yet: verifiable data provenance, composable product lineage, and multi-party revenue distribution.

These are not niche requirements. Any application where one party produces data, another curates or enriches it, and a third consumes it — risk analytics, compliance scoring, market intelligence, oracle feeds — needs exactly these patterns. Building them once as a reusable reference saves every subsequent Canton builder from reinventing them.

The Signal Exchange wraps these patterns in a working demo application, so builders can see them in context, test them end-to-end, and extract the contracts for their own projects.

**Why a Data Marketplace Specifically**

A data marketplace is the simplest application that exercises all three novel patterns simultaneously: provenance (where did the data come from?), lineage (what was it derived from?), and revenue splits (who gets paid when derived products sell?). It serves as a natural integration test for the patterns, not just an isolated contract library.

---

## Rationale

**Why SVH?**

Singularity Venture Hub is the venture and integration hub of the ASI ecosystem, working directly with SingularityNET, ASI Alliance, Fetch.ai, and Cudos. This provides direct access to AI/data engineering talent and a distribution network that can bring Canton visibility in the Web3 AI community.

SVH's engineering team has deep expertise in meTTa, a functional programming language with similar type-theoretic foundations to Daml. To strengthen Daml-specific delivery confidence, SVH will engage Daml-experienced engineering support for contract architecture review and validation.

Beyond delivery, SVH will serve as a go-to-market facilitator for the Signal Exchange on Canton — driving developer education, integration support, and ecosystem activation through its ASI network.

**Why This Scope**

This proposal intentionally builds on existing Canton patterns (cn-quickstart for subscriptions, Canton Utilities for settlement) rather than rebuilding them from scratch. The budget and scope are focused on the novel contract modules — provenance, lineage, and revenue splits — that don't exist in the ecosystem today. The demo application provides just enough context to make the patterns usable, without duplicating infrastructure Canton already has.
