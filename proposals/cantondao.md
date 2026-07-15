## Development Fund Proposal

**Author:** [web34ever](https://lighthouse.cantonloop.com/validators/web34ever%3A%3A122050f896a953422a6745ce77a4a1537e4b869f939f0eb8cb8cfdb189e2acaa7218)

**Status:** Submitted

**Created:** 2026-03-10 (revised 2026-05-05; progress update 2026-07-15)

---

## Abstract

SyncVotes is an open-source on-chain governance platform for Canton Network — live at [syncvotes.com](https://syncvotes.com) (app: [app.syncvotes.com](https://app.syncvotes.com)). Organizations create DAOs, submit typed proposals, vote, and manage on-ledger CC treasuries via Daml smart contracts deployed on Canton MainNet. The platform is operational today on **two networks** — Canton MainNet (invite-only) and Canton TestNet (invite-free demo): the `governance-v3` Daml package (v0.7.1) is live on both, a Go backend submits to the Canton Ledger API, a React/Vite frontend renders real ledger data, and external wallets integrate via CIP-0103. **Milestone 1 is delivered**, and a substantial slice of the originally-M2/M3 scope has since shipped as interim releases at the author's expense (see *Progress since submission*): typed proposals, quorum enforcement with early close, snapshot-weighted voting verified at a 2,700-voter electorate, per-party privacy reads over participant `auth-services`, and wallet challenge-response authentication. This proposal funds the remaining v3 economic engine and the open-source SDK: per-DAO treasury sponsorship under CIP-0073 MintingDelegations, a bounded refund pipeline with fraud detection, deposit-and-slash anti-spam, token-based DAO models, MultisigProposal flows, SubDAO hierarchies, third-party security audit, and a reusable `canton-governance-sdk`. 700,000 CC across 3 milestones.

---

## Specification

### 1. Objective

Canton has 200+ institutional participants managing $6T+ in tokenized assets. When these organizations need to govern shared processes — treasury allocations, supply chain decisions, standards ratification — there is no Canton-native tool for it.

Super Validator governance handles network-level parameter changes. SyncVotes addresses a different layer: letting any organization create its own DAO for its own decisions, with the privacy guarantees and signatory/observer model that only Daml on Canton provides.

Existing DAO platforms (Snapshot, Tally, Aragon, OpenZeppelin Governor, DAODAO) target EVM or Cosmos chains with off-chain signatures or single-shard execution. They cannot model Canton's sub-transaction privacy, Daml authorization, institutional participant roles, or per-DAO on-ledger CC treasuries.

SyncVotes delivers:

- A platform where organizations create DAOs, submit typed proposals, vote, and execute on-ledger — **live on MainNet and TestNet today**
- Voting models: membership-based one-member-one-vote (✓ shipped), operator-attested **snapshot-weighted electorates** with latest-ballot-wins revoting (✓ shipped, v0.7.0 — verified at a 2,700-voter electorate with O(1) per-vote transaction size), and token-based (held + staked/locked, with unlock cooldown) as funded scope
- SubDAO hierarchies, public or private DAOs, configurable quorum and threshold, time-bounded voting with per-proposal voting windows (✓ shipped, v0.7.1) and early close (✓ shipped)
- Daml smart contracts enforcing the full Create / Vote / Finalize / Execute lifecycle, with a permanent on-ledger governance record: vote rationale, document attachments (content digests bound to the decision), `finalizedBy/At`, `executedBy/At`, and terminal records for withdrawn proposals (✓ shipped, v0.7.0)
- Per-DAO on-ledger CC treasury that sponsors member transaction fees via CIP-0073 MintingDelegations — members never spend CC directly
- Bounded reward refund formula `min(0.85·r, 0.95·c)` returning the majority of CIP-0104 reward back to the originating DAO while preserving a strict net-loss-to-DAO invariant
- Wallets via **CIP-0103 exclusively** for production keys: the dApp SDK wallet picker is integrated, a self-hosted Canton Wallet Gateway (from `hyperledger-labs/splice-wallet-kernel`) is deployed against our own validator, and the WalletConnect transport is wired so consumer Canton wallets connect the day their vendors ship CIP-0103 support. A clearly-labeled built-in **dev wallet** (keys generated and encrypted client-side in the browser; the server never sees key material) exists for evaluation only and is not marketed as production custody — see *Rationale*
- An open SDK (`canton-governance-sdk`) so any Canton app can embed governance

### 2. Implementation Mechanics

**Architecture** (per [Canton app architecture guidelines](https://docs.digitalasset.com/build/3.4/sdlc-howtos/system-design/daml-app-arch-design.html), Section 3.1 — App Provider Operates the Backend):

**Stack:**

- **Frontend:** React + Vite — production UI with real Canton ledger data, light/dark theme, governance flows for create / vote / finalize / execute, weighted-ballot views, treasury and quota dashboards
- **Backend:** Go + Fiber — write path via Canton gRPC Ledger API (go-daml SDK), command construction, multi-party authorization, invite-gated access, refund-batch automation
- **Smart contracts:** Daml — `DAO`, `GovernanceProposal`, `VoteRecord`, `WeightSnapshot`, `WalletRegistration` templates live on MainNet and TestNet (`governance-v3` v0.7.1); `Treasury`, `ProposalDeposit`, `MultisigProposal` in funded scope
- **Read path:** gRPC `GetActiveContracts` streaming for the operator-scoped catalogue, plus the **Canton JSON Ledger API for per-party reads** — the backend mints a per-request JWT with `actAs=[memberPartyId]`, so Private-DAO contracts are only ever read with the member's own authorization
- **Write path:** Canton gRPC Ledger API — command submission via the `syncvotes-operator` party; CIP-0073 `MintingDelegations` treasury billing in funded scope
- **FA party split:** `syncvotes-app-provider` holds the `FeaturedAppRight` (application **approved by the FAV Committee**, July 2026) and is **confirmer (signatory) on every Public governance envelope** — v0.6.1 made it a signatory rather than an observer because CIP-0104 pays confirmers only; `syncvotes-operator` is the sole submitter and never holds reward weight
- **Reward attribution:** CIP-0104 (Traffic-Based App Rewards) — no `FeaturedAppActivityMarker` contracts created; reward weight accrues automatically in proportion to traffic burn on envelopes confirmed by the app-provider party
- **Auth:** participant `auth-services` enabled on the MainNet participant (X.509 + JWT); wallet **challenge-response authentication** — Ed25519 signature over a server nonce, verified against the party's on-chain `WalletRegistration` public key, issuing an HTTP-only session cookie; invite-code gating on MainNet writes

**Current state — [app.syncvotes.com](https://app.syncvotes.com):**

The platform is fully operational on Canton MainNet and Canton TestNet (July 2026):

- `governance-v3` v0.7.1 deployed on **both networks** via SCU lineage upgrades (no teardown across v0.5.0 → v0.7.1); both FA parties allocated and operational; FA application approved by the FAV Committee
- Real-time contract data served from the Canton Ledger API; per-party JSON Ledger API reads for Private DAOs
- Proposal creation, member voting (weighted and unweighted), finalize with early close, execute, withdraw — end-to-end on-chain, with the full audit record (`finalizedBy/At`, `executedBy/At`, rationale, attachment digests)
- Scale verification at the committed migration partner's production shape: a 2,700-entry `WeightSnapshot` (~323 KB, once per epoch) with flat ~2.3 KB per weighted ballot — versus ~211 KB per vote on the naive consuming path
- TestNet is an invite-free public demo with a seeded DAO catalogue; MainNet is invite-only
- Survived the network-wide Canton 3.5 upgrade (June 2026) with a same-day fix (package-name template addressing), documented publicly
- Sentry error tracking, structured logging, runtime monitoring, alerting

**Feature roadmap:**

| Feature | M1 | Interim (shipped since submission) | M2 | M3 |
|---|---|---|---|---|
| Live demo + open-source repo | ✓ delivered | | | |
| React/Vite production frontend | ✓ delivered | | | |
| Go backend (Fiber + Ledger API + go-daml) | ✓ delivered | | | |
| Daml governance package on MainNet | ✓ delivered (v1) | ✓ v3 0.7.1 on MainNet + TestNet | | |
| External wallets via CIP-0103 | ✓ dApp SDK integration | ✓ self-hosted Canton Wallet Gateway + WalletConnect transport | | |
| Two-party FA split (confirmer-only app-provider) | ✓ delivered | ✓ v0.6.1: app-provider promoted to signatory on Public envelopes (CIP-0104 pays confirmers, not observers) | | |
| Invite-gated onboarding | ✓ delivered | ✓ challenge-response wallet auth (Ed25519 vs on-ledger `WalletRegistration`) | | |
| Multi-DAO governance, public/private DAOs | ✓ delivered (basic) | ✓ strict-Private observer model: `members` only — operator AND app-provider excluded at the ledger; per-party JWT read path; participant `auth-services` live | | |
| Typed proposals (AddMember, RemoveMember, ChangeConfig, TransferAdmin, UnpauseDAO, CustomAction) | | ✓ shipped (v0.5.x–v0.6.0) | | |
| Quorum enforcement + early-close finalization | | ✓ shipped | | |
| Snapshot-weighted voting + latest-wins revote (2,700-voter scale) | | ✓ shipped (v0.7.0) | | |
| Governance record: rationale, attachments (digests), withdraw with terminal record, per-proposal voting windows | | ✓ shipped (v0.7.0–v0.7.1) | | |
| `FeaturedAppRight` — FAV Committee approval | | ✓ application approved (July 2026); activation sequenced with treasury launch | | |
| Per-DAO `Treasury` contract + CIP-0073 MintingDelegations sponsorship | | | ✓ | |
| `ProposalDeposit` escrow with slash-on-low-participation | | | ✓ | |
| Refund pipeline (2-week batch + fraud detection v1) | | | ✓ | |
| Per-DAO immutable quotas + proposer cooldowns + 3-DAO wallet lifetime cap | | | ✓ | |
| Public GitHub repository (MIT) | | | ✓ | |
| Token-based voting (held + staked/locked, unlock cooldown) | | | | ✓ |
| `MultisigProposal` template (M-of-N treasury approvals) | | | | ✓ |
| SubDAO hierarchies | | | | ✓ |
| Fraud detection v2 (wallet age vs activity, burst patterns, cross-DAO correlation) | | | | ✓ |
| Governance analytics dashboard | | | | ✓ |
| Hardware-wallet support (Ledger, Cypherock) via CIP-0103 adapters | | | | ✓ |
| `canton-governance-sdk` (Daml templates + Go + TypeScript clients) | | | | ✓ |
| Third-party security audit (Quantstamp + CredShields) | | | | ✓ |

### 3. Architectural Alignment

- **Daml smart contracts** — governance logic on-chain as Daml templates with strict signatory / observer separation: `signatory admin` on DAO, `signatory proposer` on `GovernanceProposal`, `signatory voter` on `VoteRecord`; duplicate votes rejected on-contract; weighted ballots tallied against an operator-attested `WeightSnapshot` pinned at proposal creation
- **Canton Ledger API as read and write path** — gRPC `GetActiveContracts` streaming plus per-party JSON Ledger API reads; gRPC command submission with multi-party authorization; clean read/write separation
- **Privacy model (shipped, v0.5.0)** — Private DAOs scope observers to `members` **only**: both platform parties (`syncvotes-operator` and `syncvotes-app-provider`) are excluded at the ledger, so Canton sub-transaction privacy makes Private contracts invisible even to the platform itself. Members read their Private DAOs through the JSON Ledger API with a per-request `actAs=[member]` JWT over participant `auth-services` (the approach validated in the [Canton forum thread](https://forum.canton.network/t/enabling-auth-services-on-a-running-mainnet-participant-for-party-scoped-private-contract-queries/) referenced in this PR's review discussion — now live on the MainNet participant). Trade-off is explicit and by design: Private DAOs forgo CIP-0104 attribution in exchange for real privacy. Multi-hosted parties (per the review discussion with @waynecollier-da and BitSafe's Decentralization Manager, PR #298) remain the complementary next layer for institutional DAOs and are planned as an integration, not a reimplementation
- **Canton Coin (CC)** — unit of fee burn, denomination of CIP-0104 rewards, and settlement asset for treasury balances and DAO creation fees
- **CIP-0073** — `MintingDelegations` mechanism is load-bearing for M2: traffic fees on every governance transaction are billed to the originating DAO's on-ledger `Treasury` rather than to individual members
- **CIP-0098** — every envelope sized below the per-transaction reward cap; the v0.7.0 weighted-voting design is the proof point: per-ballot transactions stay flat (~2.3 KB) regardless of electorate size because the electorate lives in one per-epoch snapshot contract, not in every vote
- **CIP-0103** — the only production key path; SyncVotes additionally self-hosts the reference Canton Wallet Gateway against its own validator so wallet traffic stays inside the app-provider's infrastructure
- **CIP-0104** — Traffic-Based App Rewards; v0.6.1 aligned the contracts with the CIP's confirmer rule (*"parties that are only contract observers or choice observers do not receive app rewards"*) by making the app-provider a signatory on Public envelopes — no markers created, reward weight accrues from confirmed traffic burn only

### 4. Backward Compatibility

No impact. SyncVotes reads from the Canton Ledger API and writes via gRPC command submission. No protocol, CIP, or infrastructure modifications. All package upgrades to date (v0.5.0 → v0.7.1) shipped as SCU lineage upgrades with older contracts kept serving — no teardowns, no migrations forced on users.

---

## Milestones and Deliverables

### Milestone 1: Production Platform — ✅ Delivered

- **Focus:** Live platform with real Canton ledger connectivity, full governance flow, FA party infrastructure
- **Delivered:**
  - [syncvotes.com](https://syncvotes.com) live on Canton MainNet; [api.syncvotes.com](https://api.syncvotes.com) operational
  - v1 governance Daml package deployed on MainNet
  - React/Vite production frontend
  - Go/Fiber backend connected to Canton Ledger API via gRPC (go-daml SDK)
  - Two-party FA split: `syncvotes-app-provider` (confirmer, holds `FeaturedAppRight` upon activation) and `syncvotes-operator` (submitter) — both allocated and verifiable
  - External wallet integration via the CIP-0103 dApp SDK
  - Invite-only onboarding
  - Multi-DAO governance, public/private DAOs (basic visibility)
  - Proposal creation, voting, finalize, execute end-to-end on-chain
  - Sentry error tracking, structured logging, alerting

### Progress since submission — interim releases v0.5.0 → v0.7.1 (May–July 2026, delivered at the author's expense)

Originally-M2/M3 scope that has already shipped, plus work that emerged from the review discussion on this PR:

- **Privacy track (v0.5.0, May 10–11):** participant `auth-services` enabled on the running MainNet participant (X.509 + JWT — the exact approach from the forum thread linked in this PR's comments); strict-Private observer model (Private DAO contracts visible to members only — both platform parties excluded at the ledger); per-party JSON Ledger API read path with `actAs=[member]` JWTs; wallet challenge-response authentication (Ed25519 signature over a server nonce verified against the on-ledger `WalletRegistration` public key, HTTP-only session cookie). Cross-isolation verified on MainNet: an authenticated non-member cannot read another party's Private DAO
- **Typed proposals + governance config (v0.5.x–v0.6.0):** `AddMember`, `RemoveMember`, `TransferAdmin`, `ChangeConfig`, `UnpauseDAO`, `CustomAction`; admin emergency pause; sensitive actions auto-strengthen to SuperMajority + 50% quorum floors
- **CIP-0104 attribution correction (v0.6.1, July 14, pkg `abc70a99…`):** the CIP pays confirmers, not observers — app-provider promoted from observer to **signatory** on Public DAO / proposal / vote envelopes; Private stays members-only (privacy > rewards by design); SCU lineage upgrade on both ledgers
- **Weighted voting + governance record (v0.7.0, July 14, pkg `90afe20c…`):** operator-attested `WeightSnapshot` electorate per epoch; nonconsuming `CastVoteV2` ballots with latest-ballot-wins revoting; `FinalizeWeighted` with early close; `Withdraw` leaving a terminal on-ledger record; vote rationale; document attachments as content digests; `finalizedBy/At`, `executedBy/At`. **Scale-tested at the migration partner's production shape: 2,700-entry snapshot (~323 KB once per epoch), flat ~2.3 KB per ballot — vs ~211 KB per vote on the consuming path**
- **Per-proposal voting windows + QA pass (v0.7.1, July 14, pkg `b2912c68…`):** optional `votingDurationSeconds` on `CreateProposal` (SCU-additive); weighted revote in the UI; 18/18 Daml test suite
- **Second network:** full stack live on Canton TestNet as an invite-free public demo with a network switcher — evaluators can try the complete governance loop without an invite
- **Operational maturity:** survived the network-wide Canton 3.5 upgrade (June 30) with a same-day fix; light/dark theme; the FA application was **approved by the FAV Committee** (July 2026)

### Milestone 2: Treasury Sponsorship + Refund Pipeline (Weeks 1–8 from approval)

- **Focus:** v3 economic engine — treasury-sponsored fees with bounded refund, anti-spam infrastructure, public open-source release
- **Deliverables:**
  - Per-DAO `Treasury` Daml template; founder-deposit capitalization sized to declared quotas; member-replenishable
  - CIP-0073 `MintingDelegations` integration: every member transaction billed to the originating DAO's `Treasury`, not the member's wallet
  - `ProposalDeposit` Daml template: anti-spam deposit refunded on ≥20% participation, slashed to the DAO treasury otherwise
  - Refund pipeline: 2-week batch automation that returns `min(0.85·r, 0.95·c)` of earned CIP-0104 reward to the originating DAO `Treasury`, with first-pass fraud detection (wallet age vs activity slope, burst patterns, vote-distribution anomalies)
  - Per-DAO immutable quotas: `maxMembers`, `maxProposalsPerEpoch`, `maxVotesPerEpochPerMember`, `proposalCooldownRounds`; refund-gated, not ledger-blocked
  - Per-wallet 3-DAO lifetime cap
  - Bounded subsidy invariant `refund ≤ 0.95·c` enforced both in Daml templates and in the refund-batch backend
  - `FeaturedAppRight` activation (application already approved by the FAV Committee; activation is sequenced with treasury launch so attributed traffic exists from day one)
  - Public GitHub repository (MIT license) with README, CONTRIBUTING.md, deployment docs
  - Backend rate limiting on party allocation endpoints (anti-spam at the participant layer)

### Milestone 3: Advanced Governance + Open SDK + Audit (Weeks 9–24 from approval)

- **Focus:** Long-tail governance features, fraud detection v2, hardware wallet support, open SDK, third-party audit
- **Deliverables:**
  - Token-based voting model: voting power = held + staked/locked balances, with unlock cooldown to prevent vote-trade-unlock arbitrage (depends on the Canton token primitive — Splice Amulet holdings — reaching general availability for third-party apps)
  - `MultisigProposal` Daml template (M-of-N treasury approvals)
  - SubDAO hierarchies (parent-child DAO relationships with delegated authority)
  - Fraud detection v2: cross-DAO correlation, proposal-substance heuristics, wallet-graph analysis; flagged activity excluded from refund batch
  - Delegation and proxy voting via Daml choices
  - Governance analytics dashboard (per-DAO and aggregate)
  - Hardware-wallet support (Ledger, Cypherock) via CIP-0103 adapters
  - Multi-validator story for institutional DAOs: integration scoping with BitSafe's Decentralization Manager (PR #298) for multi-hosted parties, per the review discussion on this PR
  - `canton-governance-sdk` — Daml templates package + Go client + TypeScript client + reference implementation; published on GitHub and registered in Canton Foundation app catalog
  - Developer documentation and integration guide
  - Third-party security audit of the v3 governance contracts (`Treasury`, `ProposalDeposit`, `MultisigProposal`, refund pipeline) by Quantstamp and CredShields; remediation of any findings before final release
  - Final release tagged

---

## Acceptance Criteria

- **M1:** ✅ [syncvotes.com](https://syncvotes.com) publicly accessible; v1 Daml package live on Canton MainNet; real proposal creation, voting, finalize, execute via UI; both FA parties operational; CIP-0103 wallet integration
- **Interim (verifiable today):** `governance-v3` v0.7.1 live on MainNet and TestNet; typed proposals, quorum + early close, weighted voting, withdraw-with-record, rationale and attachments all exercisable end-to-end on the invite-free TestNet demo; Private-DAO isolation demonstrable (platform parties excluded at the ledger; per-party authenticated reads); FAV Committee approval of the FA application
- **M2:** Per-DAO `Treasury` operational on MainNet; `MintingDelegations` sponsorship live for member transactions; refund pipeline producing batches that obey `refund ≤ 0.95·c`; per-DAO quotas and per-wallet cap enforced; public repo published (MIT); `FeaturedAppRight` activated
- **M3:** Token-based voting and `MultisigProposal` live on MainNet; SubDAO hierarchies operational; SDK published with Daml + Go + TypeScript clients; third-party audit completed by Quantstamp and CredShields with all critical findings remediated; analytics dashboard public; final release tagged

---

## Funding

**Total Funding Request:** 700,000 CC

### Payment Breakdown

- Milestone 1 (delivered): **100,000 CC**
- Milestone 2: **250,000 CC** upon committee acceptance
- Milestone 3: **350,000 CC** upon final release and acceptance

### Scope and Pricing Note

The scope of this proposal has expanded materially since the first draft to include the v3 economic engine — per-DAO `Treasury` contracts under CIP-0073 sponsorship, the bounded refund pipeline with fraud detection, deposit-and-slash anti-spam, token-based voting, `MultisigProposal`, SubDAO hierarchies, hardware-wallet support, and a third-party audit by Quantstamp and CredShields. Comparable on-chain governance suites in other ecosystems (DAODAO on Cosmos, Aragon on EVM, OpenZeppelin Governor implementations) are funded at materially higher levels for narrower feature sets and without Canton's privacy requirements. The 700,000 CC total reflects the full v3 deliverable set. Note that since the May revision, a substantial portion of the originally-funded scope (typed proposals, quorum enforcement, weighted voting, the privacy track, and the CIP-0104 attribution correction) has **already been delivered at the author's expense** — the request total is unchanged; the remaining funded work is correspondingly de-risked.

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
- **Transparency:** On-chain, auditable, Daml-enforced governance — every decision carries its full record: ballots, rationale, attachment digests, who finalized and executed, and when
- **Composability:** Open SDK for embedding governance into any Canton app
- **Sustainability:** Bounded refund formula keeps every DAO at a strict net loss of at least 5% of its burn, preventing reward farming and preserving Burn/Mint equilibrium
- **Adoption:** First committed migration partner is PostHuman Decentralized Validator, currently running its DAOs and SubDAOs on Cosmos/DAODAO and migrating its governance stack to SyncVotes. The v0.7.0 weighted-voting release was built and load-verified specifically against this migration's production shape — a 2,700-voter electorate — on Canton TestNet

The platform is not a proposal for future work — it is operational today, and the delivery record between the May revision and this update (five shipped releases, two networks, a survived network-wide Canton upgrade) is public and verifiable. This grant funds the v3 economic engine and the open-source publication of the full governance suite.

---

## Rationale

**Why not existing DAO tools?** Snapshot/Tally/Aragon target EVM with off-chain signatures or single-shard execution. DAODAO is Cosmos-native. None of them can model Canton's sub-transaction privacy, Daml signatory/observer authorization, or the per-DAO on-ledger CC treasury under CIP-0073 sponsorship that SyncVotes is built around.

**Why React/Vite + Go?** React's component model handles complex multi-step governance flows (create / vote / finalize / execute / treasury approval / multisig signing) with the correctness guarantees needed for a governance UI. Go's static binary compilation, zero-dependency deployment, and `go-daml` SDK make it the right choice for the Canton-connected backend; the Go ecosystem also produces the only fully-working gRPC bindings against Canton's Ledger API today.

**Why direct Ledger API?** `GetActiveContracts` over gRPC gives real-time active contract streaming directly from the participant node, and the JSON Ledger API gives per-party reads under the member's own `actAs` authorization — which is what makes the Private-DAO isolation real rather than a backend promise. For a governance platform where contract state is the source of truth, direct ledger connectivity is more reliable and lower-latency than a separate read replica.

**Why CIP-0103 for wallets — and what exists today, honestly.** Wallet engineering is a separate discipline with its own threat model, audit requirements, and key-management responsibilities. The production key path for SyncVotes is CIP-0103 exclusively: the dApp SDK picker is integrated, a self-hosted instance of the reference Canton Wallet Gateway (`hyperledger-labs/splice-wallet-kernel`) runs against our own validator so wallet traffic stays inside the app-provider's infrastructure, and the WalletConnect transport is wired — consumer Canton wallets connect the day their vendors ship CIP-0103 support, with no changes on our side. Because the consumer Canton wallet ecosystem is still ramping, the platform also ships a clearly-labeled built-in **dev wallet** for evaluation: keys are generated and AES-GCM-encrypted client-side in the browser (passkey or password unlock) and never leave the device — but we deliberately do not market it as production custody, and the funded roadmap replaces it with external-key parties (Canton interactive submission) and hardware-wallet adapters. The CIP-0104 attribution model is also a structural anti-farming control: a farmer cannot extract reward attribution by submitting outside our backend, because attribution accrues only on envelopes confirmed by the app-provider party.

**Why bounded refund instead of full pass-through?** The `min(0.85·r, 0.95·c)` formula has two bounds doing two different jobs. The 0.95·c bound guarantees the DAO always burns strictly more than it receives back — no member is ever net-paid for transacting, in any network regime. The 0.85·r bound preserves a 15% gross margin for SyncVotes when the network reward multiplier is depressed. Both apply simultaneously; the binding bound is whichever yields the smaller refund, and the `min()` selects it automatically. The result is that farming has negative expected value by construction, and the platform's revenue line is stable across the full range of network conditions.

**Why open-source the SDK?** Multiplies grant impact. Any Canton participant embeds governance without starting from zero, and the SDK is the natural distribution channel for the v3 economic primitives that make sponsored governance work on Canton at all.

**Why now?** The Canton ecosystem is building. Governance infrastructure is foundational. The platform is live on two networks, the delivery record since submission is public, the FA application is approved, and the first migration partner's production shape is already load-verified. This grant funds the finish line.
