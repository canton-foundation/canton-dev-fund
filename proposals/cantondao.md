## Development Fund Proposal

**Author:** [web34ever](https://lighthouse.cantonloop.com/validators/web34ever%3A%3A122050f896a953422a6745ce77a4a1537e4b869f939f0eb8cb8cfdb189e2acaa7218)

**Status:** Submitted

**Created:** 2026-03-10 (revised 2026-05-05; progress update 2026-07-15)

---

## Abstract

SyncVotes is an open-source on-chain governance platform for Canton Network — live at [syncvotes.com](https://syncvotes.com) on two networks: MainNet (invite-only) and TestNet (invite-free public demo at [app.syncvotes.com](https://app.syncvotes.com)). Organizations create DAOs, submit typed proposals, vote, and execute — fully on-ledger via Daml contracts (`governance-v3` v0.7.1 on both networks).

**Milestone 1 is delivered**, and a substantial slice of the original M2/M3 scope has since shipped at the author's expense (see *Progress since submission*): typed proposals, quorum with early close, snapshot-weighted voting verified at a 2,700-voter electorate, a per-party privacy read path over participant `auth-services`, and wallet challenge-response authentication.

This proposal funds the remaining v3 economic engine and the open SDK: per-DAO treasury sponsorship (CIP-0073 MintingDelegations), a bounded refund pipeline with fraud detection, deposit-and-slash anti-spam, token-based voting, `MultisigProposal`, SubDAO hierarchies, a third-party audit, and a reusable `canton-governance-sdk`. **700,000 CC across 3 milestones.**

---

## Specification

### 1. Objective

Canton has 200+ institutional participants managing $6T+ in tokenized assets. When these organizations need to govern shared processes — treasury allocations, supply chain decisions, standards ratification — there is no Canton-native tool for it.

Super Validator governance handles network-level parameters. SyncVotes addresses a different layer: any organization creating its own DAO for its own decisions, with the privacy and Daml authorization model that only Canton provides. Existing DAO platforms (Snapshot, Tally, Aragon, DAODAO) target EVM or Cosmos and cannot model Canton's sub-transaction privacy, Daml signatory/observer authorization, or per-DAO on-ledger CC treasuries.

SyncVotes delivers:

- DAO creation, typed proposals, voting, on-ledger execution — **live on both networks today**
- Voting models: one-member-one-vote (✓ shipped); operator-attested **snapshot-weighted electorates** with latest-ballot-wins revoting (✓ v0.7.0, verified at 2,700 voters with O(1) ballot size); token-based (funded scope)
- Public or private DAOs, configurable quorum and threshold, per-proposal voting windows and early close (✓ shipped); SubDAO hierarchies (funded)
- Full Create / Vote / Finalize / Execute lifecycle with a permanent record: vote rationale, document digests, `finalizedBy/At`, `executedBy/At`, terminal records for withdrawn proposals (✓ v0.7.0)
- Per-DAO on-ledger CC treasury sponsoring member fees via CIP-0073 — members never spend CC directly (funded)
- Bounded refund `min(0.85·r, 0.95·c)`: the majority of CIP-0104 reward returns to the originating DAO under a strict net-loss invariant (funded)
- Wallets via **CIP-0103 exclusively** for production keys: dApp SDK picker integrated, self-hosted Canton Wallet Gateway running against our own validator, WalletConnect transport wired. A clearly-labeled browser **dev wallet** exists for evaluation only — see *Rationale*
- An open `canton-governance-sdk` so any Canton app can embed governance

### 2. Implementation Mechanics

**Architecture** (per [Canton app architecture guidelines](https://docs.digitalasset.com/build/3.4/sdlc-howtos/system-design/daml-app-arch-design.html), §3.1 — App Provider Operates the Backend):

- **Frontend:** React + Vite — production UI, light/dark theme, full governance flows incl. weighted ballots
- **Backend:** Go + Fiber — writes via Canton gRPC Ledger API (go-daml), command construction, multi-party authorization
- **Smart contracts:** Daml — `DAO`, `GovernanceProposal`, `VoteRecord`, `WeightSnapshot` (`governance-v3` v0.7.1, both networks) + `WalletRegistration` (`wallet` v0.2.0, both networks); `Treasury`, `ProposalDeposit`, `MultisigProposal` in funded scope
- **Read path:** gRPC `GetActiveContracts` streaming for the public catalogue; **JSON Ledger API with per-request `actAs=[member]` JWTs** for Private-DAO reads — members read private state only under their own authorization
- **FA party split:** `syncvotes-app-provider` holds the `FeaturedAppRight` (application **approved by the FAV Committee**, July 2026) and is **signatory on every Public envelope** (v0.6.1 — CIP-0104 pays confirmers, not observers); `syncvotes-operator` is the sole submitter and holds no reward weight
- **Reward attribution:** CIP-0104 traffic-based — no `FeaturedAppActivityMarker` contracts; weight accrues from burn on envelopes confirmed by the app-provider
- **Auth:** participant `auth-services` live on MainNet (X.509 + JWT); wallet challenge-response (Ed25519 over a server nonce vs the on-ledger `WalletRegistration` key → HTTP-only session cookie); invite gate on MainNet writes

**Current state (July 2026):**

- `governance-v3` v0.7.1 on MainNet + TestNet via SCU lineage upgrades — no teardowns across v0.5.0 → v0.7.1
- Full lifecycle on-ledger: weighted and unweighted voting, early-close finalize, execute, withdraw-with-record, rationale, attachment digests
- Scale-verified at the migration partner's production shape: 2,700-entry `WeightSnapshot` (~323 KB once per epoch), flat ~2.3 KB per ballot — vs ~211 KB per vote on the naive path
- Public docs at [docs.syncvotes.com](https://docs.syncvotes.com): user guide, API reference, FAQ, step-by-step how-tos
- Survived the network-wide Canton 3.5 upgrade (June 2026) with a same-day fix
- Sentry, structured logging, monitoring, alerting

**Feature roadmap:**

| Feature | M1 | Interim (shipped) | M2 | M3 |
|---|---|---|---|---|
| Live platform + Daml package on MainNet | ✓ v1 | ✓ v3 0.7.1, both networks | | |
| External wallets via CIP-0103 | ✓ dApp SDK | ✓ self-hosted gateway + WalletConnect | | |
| Two-party FA split | ✓ | ✓ v0.6.1 signatory fix; FAV approval | | |
| Invite-gated onboarding | ✓ | ✓ challenge-response wallet auth | | |
| Public/private DAOs | ✓ basic | ✓ strict-Private + per-party JWT reads | | |
| Typed proposals (AddMember, RemoveMember, ChangeConfig, TransferAdmin, UnpauseDAO, CustomAction) | | ✓ v0.5.x–0.6.0 | | |
| Quorum enforcement + early-close finalization | | ✓ | | |
| Weighted voting + revote (2,700-voter scale) | | ✓ v0.7.0 | | |
| Governance record (rationale, attachments, withdraw, per-proposal windows) | | ✓ v0.7.0–0.7.1 | | |
| Per-DAO `Treasury` + CIP-0073 sponsorship | | | ✓ | |
| `ProposalDeposit` escrow + slash | | | ✓ | |
| Refund pipeline + fraud detection v1 | | | ✓ | |
| Per-DAO quotas + wallet lifetime cap | | | ✓ | |
| Public GitHub repository (MIT) | | | ✓ | |
| Token-based voting | | | | ✓ |
| `MultisigProposal` (M-of-N) | | | | ✓ |
| SubDAO hierarchies | | | | ✓ |
| Fraud detection v2 | | | | ✓ |
| Analytics dashboard | | | | ✓ |
| Hardware wallets (Ledger, Cypherock) via CIP-0103 | | | | ✓ |
| `canton-governance-sdk` (Daml + Go + TS) | | | | ✓ |
| Third-party audit (Quantstamp + CredShields) | | | | ✓ |

### 3. Architectural Alignment

- **Daml** — strict signatory/observer separation: `signatory admin` on DAO, `signatory proposer` on proposals, `signatory voter` on ballots; duplicates rejected on-contract; weighted tallies pinned to an operator-attested `WeightSnapshot`
- **Privacy (shipped, v0.5.0)** — Private DAOs are observed by `members` **only**: both platform parties are excluded at the ledger, so private contracts are invisible even to the platform itself. Members read them via per-request `actAs` JWTs over participant `auth-services` — the approach validated in the [Canton forum thread](https://forum.canton.network/t/enabling-auth-services-on-a-running-mainnet-participant-for-party-scoped-private-contract-queries/) from this PR's review discussion, now live on MainNet. Trade-off by design: Private DAOs forgo CIP-0104 attribution. Multi-hosted parties (BitSafe Decentralization Manager, #298) are the complementary institutional layer, planned as an M3 integration
- **CIP-0073** — M2 treasury billing: traffic fees on governance transactions billed to the DAO's `Treasury`, not to members
- **CIP-0098** — envelopes stay under the per-transaction reward cap; the weighted-voting design is the proof point (flat ~2.3 KB ballots at any electorate size)
- **CIP-0103** — the only production key path; the reference Canton Wallet Gateway is self-hosted against our own validator
- **CIP-0104** — v0.6.1 aligned contracts with the confirmer rule (observers earn nothing); no markers, attribution from confirmed traffic burn only

### 4. Backward Compatibility

No impact — reads and writes go through the Canton Ledger API only. All upgrades to date (v0.5.0 → v0.7.1) shipped as SCU lineage upgrades: no teardowns, no forced migrations.

---

## Milestones and Deliverables

### Milestone 1: Production Platform — ✅ Delivered

[syncvotes.com](https://syncvotes.com) + [api.syncvotes.com](https://api.syncvotes.com) live on MainNet: v1 Daml package, React/Vite frontend, Go/Fiber backend over gRPC, both FA parties allocated, CIP-0103 dApp SDK integration, invite-only onboarding, multi-DAO governance with basic visibility, full proposal lifecycle on-chain, monitoring.

### Progress since submission — v0.5.0 → v0.7.1 (May–July 2026, at the author's expense)

- **Privacy track (v0.5.0, May):** `auth-services` on the running MainNet participant; strict-Private observer model (members only — both platform parties out); per-party JSON Ledger API reads; challenge-response wallet auth. Cross-isolation verified on MainNet: an authenticated non-member reads nothing
- **Typed proposals (v0.5.x–v0.6.0):** AddMember / RemoveMember / TransferAdmin / ChangeConfig / UnpauseDAO / CustomAction; admin emergency pause; sensitive actions auto-strengthen to SuperMajority + 50% quorum floors
- **CIP-0104 fix (v0.6.1, Jul 14, pkg `abc70a99…`):** app-provider promoted observer → **signatory** on Public envelopes (the CIP pays confirmers only). Same rule applied to onboarding: `wallet` v0.2.0 (pkg `9529bc92…`) co-signs every `WalletRegistration`
- **Weighted voting + record (v0.7.0, Jul 14, pkg `90afe20c…`):** per-epoch `WeightSnapshot`, nonconsuming ballots with latest-wins revote, early-close `FinalizeWeighted`, withdraw-with-record, rationale, attachment digests, full finalize/execute audit trail. **Load-verified at 2,700 voters: ~2.3 KB per ballot vs ~211 KB on the naive path**
- **v0.7.1 (Jul 14, pkg `b2912c68…`):** per-proposal voting windows (SCU-additive); weighted revote in the UI; 18/18 Daml tests
- **Also:** full stack live on TestNet as an invite-free demo; public docs site; light/dark theme; survived Canton 3.5; **FA application approved by the FAV Committee**

### Milestone 2: Treasury Sponsorship + Refund Pipeline (Weeks 1–8 from approval)

- Per-DAO `Treasury` template; founder-deposit capitalization; member-replenishable
- CIP-0073 `MintingDelegations`: member transactions billed to the DAO `Treasury`, not member wallets
- `ProposalDeposit`: refunded on ≥20% participation, slashed to the treasury otherwise
- Refund pipeline: 2-week batches returning `min(0.85·r, 0.95·c)` of CIP-0104 reward to the originating `Treasury`; fraud detection v1 (wallet age vs activity, burst patterns, vote-distribution anomalies)
- Per-DAO immutable quotas (`maxMembers`, `maxProposalsPerEpoch`, `maxVotesPerEpochPerMember`, cooldowns) — refund-gated; per-wallet 3-DAO lifetime cap
- Subsidy invariant `refund ≤ 0.95·c` enforced in Daml and in the batch backend
- `FeaturedAppRight` activation (application already approved; activation sequenced with treasury launch)
- Public GitHub repository (MIT) with docs; rate limiting on party-allocation endpoints

### Milestone 3: Advanced Governance + Open SDK + Audit (Weeks 9–24 from approval)

- Token-based voting: power = held + staked/locked with unlock cooldown (depends on the Canton token primitive — Splice Amulet — being generally available to third-party apps)
- `MultisigProposal` (M-of-N treasury approvals); SubDAO hierarchies; delegation and proxy voting
- Fraud detection v2: cross-DAO correlation, proposal-substance heuristics, wallet-graph analysis
- Governance analytics dashboard; hardware-wallet support (Ledger, Cypherock) via CIP-0103
- Multi-validator story for institutional DAOs: integration scoping with BitSafe's Decentralization Manager (#298)
- `canton-governance-sdk`: Daml templates + Go + TypeScript clients + reference implementation; registered in the Canton Foundation app catalog
- Third-party audit (Quantstamp + CredShields) of `Treasury`, `ProposalDeposit`, `MultisigProposal`, refund pipeline; critical findings remediated; final release tagged

---

## Acceptance Criteria

- **M1:** ✅ platform live on MainNet; full proposal lifecycle via UI; both FA parties operational; CIP-0103 integration
- **Interim (verifiable today):** v0.7.1 on both networks; typed proposals, quorum + early close, weighted voting, withdraw-with-record, rationale and attachments — all exercisable on the invite-free TestNet demo; Private-DAO isolation demonstrable; FAV Committee approval
- **M2:** `Treasury` + `MintingDelegations` live on MainNet; refund batches obeying `refund ≤ 0.95·c`; quotas and caps enforced; public MIT repo; `FeaturedAppRight` activated
- **M3:** token voting + `MultisigProposal` + SubDAOs live; SDK published (Daml + Go + TS); audit completed with critical findings remediated; analytics public; final release tagged

---

## Funding

**Total Funding Request:** 700,000 CC

- Milestone 1 (delivered): **100,000 CC**
- Milestone 2: **250,000 CC** upon committee acceptance
- Milestone 3: **350,000 CC** upon final release and acceptance

### Scope and Pricing Note

A material share of the total is carrying cost, not engineering: operating as a Featured App requires a **5,000,000 CC lock** under CIP-0116. The author does not hold 5M CC — the lock is rented on the open market at current rates of 5–6.25% APR, i.e. **250,000–310,000 CC per year** before any development work. Together with the third-party audit and the remaining M2/M3 engineering, 700,000 CC is tight rather than generous.

Comparable governance suites in other ecosystems (DAODAO, Aragon, OpenZeppelin Governor) are funded at materially higher levels for narrower feature sets. Since the May revision a substantial portion of the originally-funded scope (typed proposals, quorum, weighted voting, the privacy track, the CIP-0104 correction) has **already been delivered at the author's expense** — the request total is unchanged.

### Volatility Stipulation

Project duration is under 6 months from this submission. Should the timeline extend beyond 6 months due to Committee-requested scope changes, remaining milestones will be renegotiated for USD/CC volatility.

---

## Co-Marketing

- **M1:** Announcement across Canton Foundation channels (delivered)
- **M2:** Technical blog post — on-chain governance with Daml, Canton privacy, and the bounded-subsidy model
- **M3:** Joint case study + Canton Foundation event presentation; SDK launch; PostHuman migration case study

---

## Motivation

Canton's institutional participants need to govern shared processes — treasury, standards, supply chain — and have no Canton-native tool. SyncVotes covers everything below Super Validator governance: any organization running its own DAO with real ledger-level privacy.

- **Accessibility:** launch a DAO without custom infrastructure or per-vote fees from member wallets
- **Transparency:** every decision carries its full on-ledger record — ballots, rationale, attachment digests, who finalized/executed and when
- **Composability:** open SDK for embedding governance in any Canton app
- **Sustainability:** the bounded refund keeps every DAO at a strict net loss ≥5% of burn — farming has negative expected value
- **Adoption:** first committed migration partner — PostHuman Decentralized Validator, moving its DAOs and SubDAOs from Cosmos/DAODAO. The v0.7.0 weighted-voting release was built and load-verified against exactly that migration's production shape (2,700 voters)

The platform is operational today, and the delivery record since May — five shipped releases, two networks, a survived network-wide Canton upgrade — is public and verifiable. This grant funds the v3 economic engine and the open-source release.

---

## Rationale

**Why not existing DAO tools?** Snapshot/Tally/Aragon target EVM with off-chain signatures; DAODAO is Cosmos-native. None can model Canton's sub-transaction privacy, Daml authorization, or per-DAO on-ledger CC treasuries under CIP-0073.

**Why React/Vite + Go?** React handles complex multi-step governance flows; Go + `go-daml` provides the only fully-working gRPC bindings against Canton's Ledger API today, with static-binary deployment.

**Why direct Ledger API?** `GetActiveContracts` streams contract state straight from the participant, and the JSON Ledger API gives per-party reads under the member's own `actAs` authorization — which is what makes Private-DAO isolation real rather than a backend promise.

**Why CIP-0103 for wallets — and what exists today, honestly.** Wallet engineering has its own threat model and audit burden, so production keys are CIP-0103 exclusively: dApp SDK picker integrated, a self-hosted instance of the reference Canton Wallet Gateway (`hyperledger-labs/splice-wallet-kernel`) running against our own validator, WalletConnect transport wired — consumer Canton wallets connect the day vendors ship CIP-0103 support. Because that ecosystem is still ramping, a clearly-labeled built-in **dev wallet** exists for evaluation (keys generated and AES-GCM-encrypted client-side; the server never sees key material) — we deliberately do not market it as production custody, and the funded roadmap replaces it with external-key parties and hardware-wallet adapters. CIP-0104 attribution is also a structural anti-farming control: submitting outside our backend forfeits the attribution a farmer would be trying to extract.

**Why bounded refund instead of full pass-through?** `min(0.85·r, 0.95·c)`: the `0.95·c` bound guarantees every DAO burns strictly more than it gets back — nobody is net-paid to transact in any network regime; the `0.85·r` bound preserves the platform's margin when network rewards are depressed. Farming has negative expected value by construction.

**Why open-source the SDK?** Multiplies grant impact — any Canton team embeds governance without starting from zero, and the SDK distributes the v3 economic primitives.

**Why now?** The platform is live on two networks, the delivery record since submission is public, the FA application is approved, and the first migration partner's production shape is already load-verified. This grant funds the finish line.
