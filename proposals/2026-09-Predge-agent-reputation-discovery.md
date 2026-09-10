## Development Fund Proposal

**Organization:** Predge
**Author / Primary Contact:** Amir Latypov — amirlat007@gmail.com · linkedin.com/in/alatipov · Telegram @latcom
**Status:** Submitted
**Created:** 2026-09-10
**Proposal Type:** Individual Initiative
**RFP / Roadmap Area:** N/A (Individual initiative) — App Building & Developer Experience, Scaling the Network (agent trust and discovery)
**Champion:** Cantor8 (Reni Achkar) — endorsement to follow on this PR
**Total Funding Request:** 700,000–900,000 CC (milestone-based; see Funding)
**Project Duration:** ~3 months
**Label:** canton-apis

---

## Abstract

p402 (proposal #484) gives Canton the agent-payment primitives — Agent Role Contract, Service Request, and a Service Record capturing each interaction's outcome and metrics. But it stops at raw records: no aggregation, no reputation score, no discovery. This proposal builds the layer directly on top, turning p402's Service Records into a **privacy-preserving reputation and discovery layer for agents on Canton**, and feeds it with real cross-chain agent demand via an x402 on-ramp from public chains. It completes p402's own Service Record Registry vision and gives regulated institutions the auditable-but-confidential agent trust that public reputation ledgers (ERC-8004, x402 scorers) cannot provide.

---

## Specification

### 1. Objective

p402's Service Record stores per-interaction outcome attestations (Success, Partial, Failure) and metrics (latencyMs, accuracyPct, slaConformance), but they sit as disconnected data points with no cumulative trust attribution. There is no scoring, no ranking, and no way to discover a trustworthy agent. This project delivers the missing layer: (a) aggregate attested Service Records into a privacy-preserving reputation score per agent, and (b) a discovery and query API that ranks agents by that score, fed by a cross-chain on-ramp that routes public x402 agent demand into Canton and writes the corresponding Service Records.

Single focus: **agent reputation and discovery over p402**, with the on-ramp as its data feeder. Out of scope: rebuilding the x402 facilitator (delivered by #78) or the p402 primitives (delivered by #484).

### 2. Implementation Mechanics

**Phase 1 — Cross-chain on-ramp (enabler).** An agent already paying x402 on Base or Solana has its payment routed and settled into Canton (USDCx), and a p402 Service Record written as the trust and audit handoff. This consumes the already-approved Canton x402 facilitator (#78) and MPP work (#116); it does not rebuild them. Ships an open client SDK and an "integrate in 30 minutes" developer guide (the public developer surface p402 lacks today).

**Phase 2 — Reputation and discovery (headline).** Aggregate attested Service Records per Agent Role Contract into a privacy-preserving trust score with selective disclosure: auditable to a counterparty, confidential to the network. Expose a discovery and query API over Agent Role Contracts (capabilities plus endpoint) ranked by that score. Built on p402's Daml interfaces (Agent Role Contract, Service Request, Service Record) as defined in #484.

### 3. Architectural Alignment

Builds on p402 (#484) and consumes the x402 facilitator (#78) and MPP (#116) rather than duplicating them. Aligns with Canton's selective-disclosure privacy model (trust that is auditable but confidential, impossible on public chains). Advances CIP-0082 dev-fund priorities: App Building and Developer Experience, and Scaling the Network. Serves as the Canton, institution-grade analog of ERC-8004's Reputation Registry.

### 4. Backward Compatibility

No backward compatibility impact. The reputation and discovery layer is additive: it reads existing p402 Service Records and Agent Role Contracts, introduces no protocol changes, and requires no modification to p402 or the x402 facilitator.

---

## Milestones and Deliverables

### Milestone 1: On-ramp + p402 write + SDK
- **Estimated Delivery:** ~4 weeks from start
- **Focus:** cross-chain x402-to-Canton settlement that writes a p402 Service Record; open client SDK and docs
- **Deliverables / Value Metrics:** working on-ramp (Base/Solana → Canton USDCx → Service Record); MIT-licensed SDK; integration guide; demo. Value metric: end-to-end settlements writing real Service Records.

### Milestone 2: Reputation scoring
- **Estimated Delivery:** ~8 weeks from start
- **Focus:** aggregation and a privacy-preserving trust score over attested Service Records
- **Deliverables / Value Metrics:** scoring specification and implementation; a per-Agent-Role-Contract score with selective disclosure. Value metric: agents scored from real Service Record history (adoption-gated).

### Milestone 3: Discovery API + public release
- **Estimated Delivery:** ~12 weeks from start
- **Focus:** ranked discovery and query API; hardened public release
- **Deliverables / Value Metrics:** discovery and query API (agents by capability and trust score); hardened MIT release with guide and video. Value metric: external builders integrating the layer (adoption-gated).

---

## Acceptance Criteria

Evaluated on ecosystem value and adoption, not artifact delivery:

- Real cross-chain settlements writing p402 Service Records
- Agents scored from genuine settlement history
- External builders adopting the open SDK and discovery API
- All deliverables open-source (MIT) and reusable network-wide

---

## Funding

**Total Funding Request:** 700,000–900,000 CC

### Payment Breakdown by Milestone
- Milestone 1 (On-ramp + p402 write + SDK): ~200,000 CC upon committee acceptance
- Milestone 2 (Reputation scoring): ~250,000 CC upon committee acceptance (adoption-gated: agents scored)
- Milestone 3 (Discovery API + public release): ~250,000–450,000 CC upon final release and acceptance (adoption-gated: external-builder threshold)

### Volatility Stipulation
Project duration is under 6 months. Amounts are denominated in fixed Canton Coin. Should the timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones will be renegotiated to account for significant USD/CC price volatility.

---

## Co-Marketing

Upon release, the implementing entity will collaborate with the Foundation on:

- Announcement coordination — a joint announcement with Cantor8 on launch
- Case study or technical blog — the first cross-chain agent settlements landing in Canton with p402 reputation
- Developer and ecosystem promotion — ongoing representation of Canton and p402 at industry events (the author speaks publicly and attends Token2049 and Consensus)

---

## Motivation

The public agent economy already runs at scale (75M+ x402 transactions on public chains). None of it reaches Canton today, and p402 has no external demand or reputation flowing into it. This layer routes that demand in and populates p402 with real trust history, turning p402 from a record store into a reputation asset. Institutions legally cannot use public reputation ledgers (ERC-8004, SolvScore, ACHIVX); they need auditable-but-confidential trust, which only Canton plus p402 can provide. Adoption is the success metric.

---

## Rationale

Agent reputation from settlement history is already proven necessary on public chains (ERC-8004's Reputation Registry on Ethereum mainnet; scorers such as SolvScore and ACHIVX). This is not a copy of those: it brings the same primitive to institutions that cannot use a public ledger, built on p402's confidential, audit-grade Service Records. Alternatives considered: (a) a public reputation ledger, rejected as incompatible with institutional privacy; (b) rebuilding an x402 facilitator, rejected because it is already delivered by #78. Building on p402 and consuming #78 and #116 keeps the work additive and composable, and completes Cantor8's own stated Service Record Registry vision, which is why it maps to a Cantor8 champion.
