## Development Fund Proposal

**Author:** [web34ever](https://lighthouse.cantonloop.com/validators/web34ever%3A%3A122050f896a953422a6745ce77a4a1537e4b869f939f0eb8cb8cfdb189e2acaa7218)

**Status:** Submitted

**Created:** 2026-03-10

---

## Abstract

CantonDAO is an open-source platform for creating and managing DAOs on Canton Network. An interactive demo is live at [cantondao.com](https://cantondao.com). This proposal funds the production system: Daml smart contracts, a Rust backend connected to Canton's Ledger API and PQS, a SvelteKit frontend, and an open-source governance SDK.

---

## Specification

### 1. Objective

Canton has 200+ institutional participants managing $6T+ in tokenized assets. When these organizations need to govern shared processes — treasury allocations, supply chain decisions, standards ratification — there's no Canton-native tool for it.

Super Validator governance handles network-level parameter changes. CantonDAO addresses a different layer: letting any company or consortium create its own DAO for its own governance needs.

Existing DAO platforms (Snapshot, Tally, Aragon) target EVM chains with off-chain signature voting. They can't model Canton's privacy guarantees, Daml contract structure, or institutional participant roles.

CantonDAO delivers:

- A platform where companies create DAOs, submit proposals, and vote on-chain
- Multi-DAO support — treasury councils, working groups, supply chain consortiums
- Daml smart contracts handling the full proposal lifecycle
- Privacy by default via Canton's confidentiality model
- An open SDK so any Canton app can embed governance

### 2. Implementation Mechanics

**Architecture** (per [Canton app architecture guidelines](https://docs.digitalasset.com/build/3.4/sdlc-howtos/system-design/daml-app-arch-design.html), Section 3.1 — App Provider Operates the Backend):

**Stack:**

- **Frontend:** SvelteKit — production UI replacing the current Next.js demo
- **Backend:** Rust (Axum + sqlx + reqwest) — write path via JSON Ledger API, read path via PQS (PostgreSQL), command deduplication, retry logic
- **Smart contracts:** Daml — `Proposal`, `VoteRecord`, `DAORegistry` templates compiled to `.dar`, deployed on our existing validator/participant node
- **Read path:** PQS — Canton's recommended read path for app UIs, SQL queries with application-specific indexing
- **Write path:** JSON Ledger API — command submission with crash-fault tolerance
- **Auth:** Participant node IAM integration, access controls enforced at backend API layer

**Current state — [cantondao.com](https://cantondao.com):**

The live site is an interactive demo built in Next.js with mock data. It shows the product vision: DAO browsing, proposal lifecycle, member management, activity feeds, DAO creation. It has no backend, no ledger connectivity, no real Daml contracts. ~4 weeks of engineering already invested at no cost to the Fund.

**Feature roadmap:**

| Feature | M1 | M2 | M3 |
|---|---|---|---|
| Interactive demo (Next.js) + open-source repo | ✓ | | |
| SvelteKit production frontend | | ✓ | |
| Rust backend (Axum + PQS + Ledger API) | | ✓ | |
| Daml `Proposal` + `VoteRecord` + `DAORegistry` | | ✓ | |
| Proposal creation + wallet-signed voting | | ✓ | |
| Multi-DAO governance | | ✓ | |
| Delegation + proxy voting | | | ✓ |
| Quorum enforcement + finalization | | | ✓ |
| Analytics dashboard | | | ✓ |
| `canton-governance-sdk` | | | ✓ |

### 3. Architectural Alignment

- **Daml smart contracts** — governance logic on-chain as Daml templates using the Propose-and-Accept pattern
- **PQS as read path** — active contract set queries, vote tallies, proposal history via application-specific SQL indices
- **JSON Ledger API as write path** — command deduplication and retry behavior per Canton guidelines
- **Privacy model** — vote visibility scoped to Daml contract signatories/observers; end-user access controls at backend API layer
- **Canton Coin (CC)** — stake-weighted voting aligned with the network's role hierarchy

### 4. Backward Compatibility

No impact. CantonDAO reads from PQS and writes via JSON Ledger API. No protocol, CIP, or infrastructure modifications.

---

## Milestones and Deliverables

### Milestone 1: Interactive Demo & Open Source (Weeks 1–4)

- **Estimated Delivery:** 4 weeks from approval
- **Focus:** Publish demo as open-source, document architecture
- **Deliverables:**
  - [cantondao.com](https://cantondao.com) live — Home, DAOs, DAO detail + members, Proposals, Proposal detail, Activity, Create DAO
  - Open-source repository (MIT license)
  - Design system documentation
  - Architecture docs: system design, Daml model overview, backend API spec, PQS query patterns
  - Wallet connection UI (mock mode)

### Milestone 2: Production Stack & Live Governance (Weeks 5–16)

- **Estimated Delivery:** 12 weeks after M1 acceptance
- **Focus:** SvelteKit frontend, Rust backend, Daml contracts, live ledger connectivity
- **Deliverables:**
  - `Proposal`, `VoteRecord`, `DAORegistry` Daml templates — Daml Script tests, deployed to testnet then mainnet
  - Rust backend: Axum API, PQS/sqlx read path, reqwest/Ledger API write path, command deduplication
  - SvelteKit frontend with real ledger data
  - Proposal creation with Daml contract instantiation
  - Real-time vote tallying from PQS
  - Wallet-signed vote submission
  - Multi-DAO support
  - Security review of Daml contracts
  - First live on-chain governance transaction via CantonDAO

### Milestone 3: Full Governance Suite & Open SDK (Weeks 17–24)

- **Estimated Delivery:** 8 weeks after M2 acceptance
- **Focus:** Delegation, analytics, SDK
- **Deliverables:**
  - Delegation and proxy voting (stake-weighted) via Daml choices
  - Quorum enforcement and automatic proposal finalization
  - Governance analytics dashboard
  - `canton-governance-sdk` — Daml templates + Rust client + TypeScript client
  - Developer documentation and integration guide

---

## Acceptance Criteria

- **M1:** [cantondao.com](https://cantondao.com) publicly accessible; GitHub repo public (MIT); architecture docs published
- **M2:** Daml templates on Canton mainnet; Rust backend operational against live PQS; SvelteKit frontend serving real data; at least one proposal created and voted on via UI; security review completed
- **M3:** SDK published to npm/crates.io; delegation and analytics on mainnet; developer docs published; final release tagged

---

## Funding

**Total Funding Request:** 700,000 CC

### Payment Breakdown

- Milestone 1: **100,000 CC**
- Milestone 2: **350,000 CC**
- Milestone 3: **250,000 CC**

### Cost Breakdown

| Category | Hours | Rate | Cost |
|---|---|---|---|
| Demo finalization + open-source + arch docs | ~100 | $120/hr | ~$12,000 |
| Daml templates (3) + Daml Script tests | ~200 | $175/hr | ~$35,000 |
| Rust backend (Axum + PQS + Ledger API) | ~160 | $150/hr | ~$24,000 |
| SvelteKit production frontend | ~120 | $130/hr | ~$15,600 |
| SDK extraction + publish + docs | ~100 | $140/hr | ~$14,000 |
| Delegation + analytics + testing | ~120 | $140/hr | ~$16,800 |
| Security review of Daml contracts | fixed | — | ~$15,000 |
| Infrastructure / CI / deployment | ~50 | $120/hr | ~$6,000 |
| **Total** | **~850** | | **~$101,500** |

### Volatility Stipulation

24-week duration, under the 6-month threshold. Extension beyond 6 months due to Committee-requested scope changes triggers renegotiation for USD/CC volatility.

---

## Co-Marketing

- **M1:** Announcement across Canton Foundation channels
- **M2:** Technical blog post — governance with Daml, Rust, and Canton
- **M3:** Joint case study + presentation at a Canton Foundation event

---

## Motivation

Canton's 200+ institutional participants need to govern shared processes — treasury, standards, supply chain — but have no Canton-native governance tool. Super Validator governance covers network parameters. CantonDAO covers everything else: any organization creating its own DAO for its own decisions.

- **Accessibility:** Launch a DAO without building custom infrastructure
- **Transparency:** On-chain, auditable, Daml-enforced governance
- **Composability:** Open SDK for embedding governance into any Canton app
- **Adoption:** More on-chain governance activity = more network utility

---

## Rationale

**Why not existing DAO tools?** Snapshot/Tally/Aragon target EVM with off-chain signatures. Can't model Canton's privacy, Daml contracts, or institutional roles.

**Why SvelteKit?** Smaller bundle, faster runtime, better reactivity for real-time vote updates than Next.js. The demo proved the UX; production needs better performance.

**Why Rust?** The backend is the trust boundary to the Canton ledger. Memory safety, no GC pauses, type-safe PQS queries via sqlx, production-grade HTTP via Axum.

**Why PQS + JSON Ledger API?** Canton's recommended architecture. PQS for reads (SQL over ledger data), JSON Ledger API for writes (HTTP, any language). Clean read/write separation.

**Why open-source the SDK?** Multiplies grant impact. Any Canton participant embeds governance without starting from zero.

**Why now?**  The ecosystem is building. Governance infrastructure is foundational.
