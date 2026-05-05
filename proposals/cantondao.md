## Development Fund Proposal

**Author:** [web34ever](https://lighthouse.cantonloop.com/validators/web34ever%3A%3A122050f896a953422a6745ce77a4a1537e4b869f939f0eb8cb8cfdb189e2acaa7218)

**Status:** Submitted

**Created:** 2026-03-10 (revised 2026-05-05)

---

## Abstract

SyncVotes is an open-source on-chain governance platform for Canton Network — live at [syncvotes.com](https://syncvotes.com). Organizations create DAOs, submit typed proposals, vote, and manage on-ledger CC treasuries via Daml smart contracts deployed on Canton MainNet. The platform is operational today: a v1 Daml package is live on MainNet, a Go backend submits to the Canton Ledger API, a React/Vite frontend renders real ledger data, and external wallets integrate via CIP-0103. **Milestone 1 is delivered.** This proposal funds the v3 economic engine and the open-source SDK: per-DAO treasury sponsorship under CIP-0073 MintingDelegations, a bounded refund pipeline with fraud detection, typed proposals with deposit-and-slash anti-spam, token-based and membership-based DAO models, MultisigProposal flows, SubDAO hierarchies, third-party security audit, and a reusable `canton-governance-sdk`. 700,000 CC across 3 milestones.

---

## Specification

### 1. Objective

Canton has 200+ institutional participants managing $6T+ in tokenized assets. When these organizations need to govern shared processes — treasury allocations, supply chain decisions, standards ratification — there is no Canton-native tool for it.

Super Validator governance handles network-level parameter changes. SyncVotes addresses a different layer: letting any organization create its own DAO for its own decisions, with the privacy guarantees, contract-key uniqueness, and signatory/observer model that only Daml on Canton provides.

Existing DAO platforms (Snapshot, Tally, Aragon, OpenZeppelin Governor, DAODAO) target EVM or Cosmos chains with off-chain signatures or single-shard execution. They cannot model Canton's sub-transaction privacy, Daml authorization, institutional participant roles, or per-DAO on-ledger CC treasuries.

SyncVotes delivers:

- A platform where organizations create DAOs, submit typed proposals, vote, and execute on-ledger
- Two voting models: token-based (held + staked/locked, with unlock cooldown to prevent vote-trade-unlock arbitrage) and membership-based (one-member-one-vote or admin-assigned weights)
- SubDAO hierarchies, public or private DAOs, configurable quorum and threshold, time-bounded voting with optional early close
- Daml smart contracts enforcing the full Create / Vote / Finalize / Execute lifecycle
- Per-DAO on-ledger CC treasury that sponsors member transaction fees via CIP-0073 MintingDelegations — members never spend CC directly
- Bounded reward refund formula `min(0.85·r, 0.95·c)` returning the majority of CIP-0104 reward back to the originating DAO while preserving a strict net-loss-to-DAO invariant
- External wallets only at launch (Canton Loop, Nightly, Console Wallet, Bron via CIP-0103) — SyncVotes ships zero wallet code and holds no user keys
- An open SDK (`canton-governance-sdk`) so any Canton app can embed governance

### 2. Implementation Mechanics

**Architecture** (per [Canton app architecture guidelines](https://docs.digitalasset.com/build/3.4/sdlc-howtos/system-design/daml-app-arch-design.html), Section 3.1 — App Provider Operates the Backend):

**Stack:**

- **Frontend:** React + Vite — production UI with real Canton ledger data, dark-first design system, governance flows for create / vote / finalize / execute, treasury and quota dashboards
- **Backend:** Go + Fiber — write and read path via Canton gRPC Ledger API (go-daml SDK), command construction, multi-party authorization, invite-gated access, refund-batch automation
- **Smart contracts:** Daml — `DAO`, `DaoMembership`, `Treasury`, `GovernanceProposal`, `ProposalDeposit`, `VoteRecord`, `MultisigProposal`, `UserRegistration` templates compiled to `.dar` and deployed on Canton MainNet
- **Read path:** Canton PQS for indexed read queries; direct `GetActiveContracts` over gRPC for active contract streaming
- **Write path:** Canton gRPC Ledger API — command submission via the `syncvotes-operator` party using CIP-0073 `MintingDelegations`, with traffic fees billed to the originating DAO's `Treasury` contract
- **FA party split:** `syncvotes-app-provider` holds the `FeaturedAppRight` and is confirmer-only on every governance envelope (no other on-ledger role); `syncvotes-operator` is the sole submitter and never holds reward weight. Both parties already allocated and verifiable via the Canton participant Ledger API
- **Reward attribution:** CIP-0104 (Traffic-Based App Rewards) — no `FeaturedAppActivityMarker` contracts created; reward weight accrues automatically in proportion to traffic burn on envelopes confirmed by the app-provider party
- **Auth:** Invite-code system via on-ledger `UserRegistration`; Daml choices reject any unregistered party

**Current state — [syncvotes.com](https://syncvotes.com):**

The platform is fully operational on Canton MainNet:

- v1 governance Daml package deployed on MainNet; both FA parties (`syncvotes-app-provider`, `syncvotes-operator`) allocated and operational
- Real-time contract data served from Canton Ledger API
- Proposal creation, member voting, finalize, execute — end-to-end on-chain
- DAO detail pages with member lists, proposal history, vote tallies, configurable visibility
- External wallet integration via CIP-0103 (Canton Loop, Console Wallet, Bron, Nightly)
- Invite-only onboarding with on-ledger `UserRegistration` enforcement
- Sentry error tracking, structured logging, runtime monitoring, alerting

**Feature roadmap:**

| Feature | M1 | M2 | M3 |
|---|---|---|---|
| Live demo + open-source repo | ✓ delivered | | |
| React/Vite production frontend | ✓ delivered | | |
| Go backend (Fiber + Ledger API + go-daml) | ✓ delivered | | |
| Daml v1 package on MainNet (`DAO`, `DaoMembership`, `GovernanceProposal`, `VoteRecord`) | ✓ delivered | | |
| External wallets via CIP-0103 (Loop, Console Wallet, Bron) | ✓ delivered | | |
| Two-party FA split (`syncvotes-app-provider` confirmer-only, `syncvotes-operator` submitter) | ✓ delivered | | |
| Invite-gated onboarding with on-ledger `UserRegistration` | ✓ delivered | | |
| Multi-DAO governance, public/private DAOs (basic) | ✓ delivered | | |
| Per-DAO `Treasury` contract + CIP-0073 MintingDelegations sponsorship | | ✓ | |
| `ProposalDeposit` escrow with slash-on-low-participation | | ✓ | |
| Refund pipeline (2-week batch + fraud detection v1) | | ✓ | |
| Per-DAO immutable quotas + proposer cooldowns + 3-DAO wallet lifetime cap | | ✓ | |
| Typed proposals (AddMember, RemoveMember, ChangeConfig, TransferAdmin, TreasuryAction) | | ✓ | |
| `FeaturedAppRight` activation via DSO governance | | ✓ | |
| Token-based voting (held + staked/locked, unlock cooldown) | | | ✓ |
| `MultisigProposal` template (M-of-N treasury approvals) | | | ✓ |
| `CustomAction` (passing proposals exercise arbitrary Daml choices) | | | ✓ |
| SubDAO hierarchies | | | ✓ |
| Fraud detection v2 (wallet age vs activity, burst patterns, cross-DAO correlation) | | | ✓ |
| Quorum enforcement + automatic finalization | | | ✓ |
| Governance analytics dashboard | | | ✓ |
| Hardware-wallet support (Ledger, Cypherock) via CIP-0103 adapters | | | ✓ |
| `canton-governance-sdk` (Daml templates + Go + TypeScript clients) | | | ✓ |
| Third-party security audit (Quantstamp + CredShields) | | | ✓ |

### 3. Architectural Alignment

- **Daml smart contracts** — governance logic on-chain as Daml templates with strict signatory / observer separation: `signatory founder` on DAO, `signatory proposer` on `GovernanceProposal`, `signatory voter` on `VoteRecord` (one-vote-per-member enforced by Daml contract key), `Treasury` controlled by DAO members via `MultisigProposal` choices
- **Canton Ledger API as read and write path** — direct `GetActiveContracts` over gRPC for real-time active contract streaming; gRPC command submission with multi-party authorization; clean read/write separation
- **Privacy model** — DAO observer set scoped by `visibility` field; for Private DAOs the `syncvotes-operator` is removed from the observer set and Canton sub-transaction privacy makes the contract invisible to it
- **Canton Coin (CC)** — unit of fee burn, denomination of CIP-0104 rewards, and settlement asset for treasury balances and DAO creation fees
- **CIP-0073** — `MintingDelegations` mechanism is load-bearing: traffic fees on every governance transaction are billed to the originating DAO's on-ledger `Treasury` rather than to individual members
- **CIP-0098** — every envelope sized below the $1.50 per-transaction reward cap; aggregate operations on very large DAOs are decomposed into per-member transactions by the Daml templates themselves, so envelope size remains bounded by membership-contract granularity rather than total DAO size
- **CIP-0103** — external wallet support only; SyncVotes ships zero wallet code
- **CIP-0104** — Traffic-Based App Rewards; reward weight accrues automatically via the `FeaturedAppRight` on the confirmer-only `syncvotes-app-provider` party, no markers created

### 4. Backward Compatibility

No impact. SyncVotes reads from Canton Ledger API and writes via gRPC command submission. No protocol, CIP, or infrastructure modifications.

---

## Milestones and Deliverables

### Milestone 1: Production Platform — ✅ Delivered

- **Focus:** Live platform with real Canton ledger connectivity, full governance flow, FA party infrastructure
- **Delivered:**
  - [syncvotes.com](https://syncvotes.com) live on Canton MainNet; [api.syncvotes.com](https://api.syncvotes.com) operational
  - v1 governance Daml package deployed on MainNet
  - React/Vite production frontend with dark-first design system
  - Go/Fiber backend connected to Canton Ledger API via gRPC (go-daml SDK)
  - Two-party FA split: `syncvotes-app-provider` (confirmer-only, holds `FeaturedAppRight` upon activation) and `syncvotes-operator` (submitter via `MintingDelegations`) — both allocated and verifiable
  - External wallet integration via CIP-0103 (Canton Loop, Console Wallet, Bron, Nightly)
  - Invite-only onboarding with on-ledger `UserRegistration` contract
  - Multi-DAO governance, public/private DAOs (basic visibility)
  - Proposal creation, voting, finalize, execute end-to-end on-chain
  - Sentry error tracking, structured logging, alerting

### Milestone 2: Treasury Sponsorship + Refund Pipeline + FA Activation (Weeks 1–8 from approval)

- **Focus:** v3 economic engine — treasury-sponsored fees with bounded refund, anti-spam infrastructure, typed proposals, public open-source release, FA activation
- **Deliverables:**
  - Per-DAO `Treasury` Daml template; founder-deposit capitalization sized to declared quotas; member-replenishable
  - CIP-0073 `MintingDelegations` integration: every member transaction billed to the originating DAO's `Treasury`, not the member's wallet
  - `ProposalDeposit` Daml template: anti-spam deposit refunded on ≥20% participation, slashed to the DAO treasury otherwise
  - Refund pipeline: 2-week batch automation that returns `min(0.85·r, 0.95·c)` of earned CIP-0104 reward to the originating DAO `Treasury`, with first-pass fraud detection (wallet age vs activity slope, burst patterns, vote-distribution anomalies)
  - Per-DAO immutable quotas: `maxMembers`, `maxProposalsPerEpoch`, `maxVotesPerEpochPerMember`, `proposalCooldownRounds`; refund-gated, not ledger-blocked
  - Per-wallet 3-DAO lifetime cap on `UserRegistration`
  - Typed proposals: `AddMember`, `RemoveMember`, `ChangeConfig`, `TransferAdmin`, `TreasuryAction`
  - Bounded subsidy invariant `refund ≤ 0.95·c` enforced both in Daml templates and in the refund-batch backend
  - `FeaturedAppRight` activation request to DSO governance (Featured App application separately submitted to Tokenomics Committee)
  - Public GitHub repository (MIT license) with README, CONTRIBUTING.md, deployment docs
  - Backend rate limiting on party allocation endpoints (anti-spam at the participant layer)

### Milestone 3: Advanced Governance + Open SDK + Audit (Weeks 9–24 from approval)

- **Focus:** Long-tail governance features, fraud detection v2, hardware wallet support, open SDK, third-party audit
- **Deliverables:**
  - Token-based voting model: voting power = held + staked/locked balances, with unlock cooldown to prevent vote-trade-unlock arbitrage
  - `MultisigProposal` Daml template (M-of-N treasury approvals)
  - `CustomAction` proposal type: a passing proposal exercises arbitrary Daml choices on other contracts
  - `PauseDAO` / `UnpauseDAO` typed actions
  - SubDAO hierarchies (parent-child DAO relationships with delegated authority)
  - Fraud detection v2: cross-DAO correlation, proposal-substance heuristics, wallet-graph analysis; flagged activity excluded from refund batch
  - Quorum enforcement and automatic proposal finalization
  - Delegation and proxy voting via Daml choices
  - Governance analytics dashboard (per-DAO and aggregate)
  - Hardware-wallet support (Ledger, Cypherock) via CIP-0103 adapters
  - `canton-governance-sdk` — Daml templates package + Go client + TypeScript client + reference implementation; published on GitHub and registered in Canton Foundation app catalog
  - Developer documentation and integration guide
  - Third-party security audit of the v3 governance contracts (`Treasury`, `ProposalDeposit`, `MultisigProposal`, refund pipeline) by Quantstamp and CredShields; remediation of any findings before final release
  - Final release tagged

---

## Acceptance Criteria

- **M1:** ✅ [syncvotes.com](https://syncvotes.com) publicly accessible; v1 Daml package live on Canton MainNet; real proposal creation, voting, finalize, execute via UI; both FA parties operational; external-wallet-only access via CIP-0103
- **M2:** Per-DAO `Treasury` operational on MainNet; `MintingDelegations` sponsorship live for member transactions; refund pipeline producing weekly batches that obey `refund ≤ 0.95·c`; typed proposals deployed; per-DAO quotas and per-wallet cap enforced on-ledger; public repo published (MIT); FA application submitted
- **M3:** Token-based voting and `MultisigProposal` live on MainNet; SubDAO hierarchies operational; SDK published with Daml + Go + TypeScript clients; third-party audit completed by Quantstamp and CredShields with all critical findings remediated; analytics dashboard public; final release tagged

---

## Funding

**Total Funding Request:** 700,000 CC

### Payment Breakdown

- Milestone 1 (delivered): **100,000 CC**
- Milestone 2: **250,000 CC** upon committee acceptance
- Milestone 3: **350,000 CC** upon final release and acceptance

### Scope and Pricing Note

The scope of this proposal has expanded materially since the first draft to include the v3 economic engine — per-DAO `Treasury` contracts under CIP-0073 sponsorship, the bounded refund pipeline with fraud detection, typed proposals with deposit-and-slash anti-spam, token-based voting, `MultisigProposal`, SubDAO hierarchies, hardware-wallet support, and a third-party audit by Quantstamp and CredShields. Comparable on-chain governance suites in other ecosystems (DAODAO on Cosmos, Aragon on EVM, OpenZeppelin Governor implementations) are funded at materially higher levels for narrower feature sets and without Canton's privacy and contract-key requirements. The 700,000 CC total reflects the full v3 deliverable set; M1 has already been delivered at the author's expense.

### Volatility Stipulation

Project duration is under 6 months from this submission. Should the timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones will be renegotiated to account for significant USD/CC price volatility.

---

## Co-Marketing

- **M1:** Announcement across Canton Foundation channels (delivered)
- **M2:** Technical blog post — on-chain governance with Daml, Canton privacy, and the bounded-subsidy economic model
- **M3:** Joint case study + presentation at a Canton Foundation event; SDK launch announcement; PostHuman migration case study

---

## Motivation

Canton's 200+ institutional participants need to govern shared processes — treasury, standards, supply chain — but have no Canton-native governance tool. Super Validator governance covers network parameters. SyncVotes covers everything else: any organization creating its own DAO for its own decisions, with the privacy and Daml authorization that only Canton can provide.

- **Accessibility:** Launch a DAO without building custom infrastructure, without engaging dedicated wallet engineering, and without paying per-vote fees out of member wallets
- **Transparency:** On-chain, auditable, Daml-enforced governance with one-vote-per-member contract-key uniqueness
- **Composability:** Open SDK for embedding governance into any Canton app
- **Sustainability:** Bounded refund formula keeps every DAO at a strict net loss of at least 5% of its burn, preventing reward farming and preserving Burn/Mint equilibrium
- **Adoption:** First committed migration partner is PostHuman Decentralized Validator, currently running its DAOs and SubDAOs on Cosmos/DAODAO and migrating its full governance stack to SyncVotes — bringing hundreds of governance-active wallets and ongoing proposal traffic

The platform is not a proposal for future work — it is operational today. This grant funds the v3 engine and the open-source publication of the full governance suite.

---

## Rationale

**Why not existing DAO tools?** Snapshot/Tally/Aragon target EVM with off-chain signatures or single-shard execution. DAODAO is Cosmos-native. None of them can model Canton's sub-transaction privacy, Daml signatory/observer authorization, contract-key uniqueness, or the per-DAO on-ledger CC treasury under CIP-0073 sponsorship that SyncVotes is built around.

**Why React/Vite + Go?** React's component model handles complex multi-step governance flows (create / vote / finalize / execute / treasury approval / multisig signing) with the correctness guarantees needed for a governance UI. Go's static binary compilation, zero-dependency deployment, and `go-daml` SDK make it the right choice for the Canton-connected backend; the Go ecosystem also produces the only fully-working gRPC bindings against Canton's Ledger API today.

**Why direct Ledger API?** `GetActiveContracts` over gRPC gives real-time active contract streaming directly from the participant node. For a governance platform where contract state is the source of truth, direct ledger connectivity is more reliable and lower-latency than a separate read replica.

**Why external wallets only?** Wallet engineering is a separate discipline with its own threat model, audit requirements, and key-management responsibilities. By integrating CIP-0103 wallets (Canton Loop, Console Wallet, Bron, Nightly) instead of shipping our own, SyncVotes inherits the security posture of dedicated wallet vendors, holds zero user keys, and keeps the platform's attack surface narrow. This is also a load-bearing pillar of the v3 economic model: a farmer cannot bypass the invite gate by submitting transactions outside our backend without losing the CIP-0104 attribution they were trying to extract.

**Why bounded refund instead of full pass-through?** The `min(0.85·r, 0.95·c)` formula has two bounds doing two different jobs. The 0.95·c bound guarantees the DAO always burns strictly more than it receives back — no member is ever net-paid for transacting, in any network regime. The 0.85·r bound preserves a 15% gross margin for SyncVotes when the network reward multiplier is depressed. Both apply simultaneously; the binding bound is whichever yields the smaller refund, and the `min()` selects it automatically. The result is that farming has negative expected value by construction, and the platform's revenue line is stable across the full range of network conditions.

**Why open-source the SDK?** Multiplies grant impact. Any Canton participant embeds governance without starting from zero, and the SDK is the natural distribution channel for the v3 economic primitives that make sponsored governance work on Canton at all.

**Why now?** The Canton ecosystem is building. Governance infrastructure is foundational. The platform is already live, the v3 model is specified, and the first migration partner is committed. This grant funds the finish line.
