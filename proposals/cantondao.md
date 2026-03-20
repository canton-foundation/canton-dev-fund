## Development Fund Proposal

**Author:** [web34ever](https://lighthouse.cantonloop.com/validators/web34ever%3A%3A122050f896a953422a6745ce77a4a1537e4b869f939f0eb8cb8cfdb189e2acaa7218)

**Status:** Submitted

**Created:** 2026-03-10

---

## Abstract

CantonDAO is an open-source governance platform for Canton Network — live at [cantondao.com](https://cantondao.com). Organizations create DAOs, submit proposals, and vote on-chain via Daml smart contracts deployed on Canton MainNet. The platform is operational: Daml governance contracts are live, a Go backend connects to Canton's Ledger API, a React/Vite frontend serves real ledger data, and a built-in non-custodial wallet handles Canton party management. This proposal funds completion of the full governance suite: delegation, quorum enforcement, analytics, and an open-source SDK.

---

## Specification

### 1. Objective

Canton has 200+ institutional participants managing $6T+ in tokenized assets. When these organizations need to govern shared processes — treasury allocations, supply chain decisions, standards ratification — there is no Canton-native tool for it.

Super Validator governance handles network-level parameter changes. CantonDAO addresses a different layer: letting any company or consortium create its own DAO for its own governance needs.

Existing DAO platforms (Snapshot, Tally, Aragon) target EVM chains with off-chain signature voting. They cannot model Canton's privacy guarantees, Daml contract structure, or institutional participant roles.

CantonDAO delivers:

- A platform where companies create DAOs, submit proposals, and vote on-chain
- Multi-DAO support — treasury councils, working groups, supply chain consortiums
- Daml smart contracts enforcing the full proposal lifecycle
- Privacy by default via Canton's confidentiality model
- A built-in non-custodial wallet with passkey and mnemonic support
- An open SDK so any Canton app can embed governance

### 2. Implementation Mechanics

**Architecture** (per [Canton app architecture guidelines](https://docs.digitalasset.com/build/3.4/sdlc-howtos/system-design/daml-app-arch-design.html), Section 3.1 — App Provider Operates the Backend):

**Stack:**

- **Frontend:** React + Vite — production UI with real Canton ledger data, dark-first design system, built-in non-custodial wallet (Ed25519, BIP-39 mnemonic, passkey/PRF or PBKDF2 encryption, IndexedDB storage)
- **Backend:** Go + Fiber — write and read path via Canton gRPC Ledger API (go-daml SDK), command submission, multi-party authorization, invite-gated access
- **Smart contracts:** Daml — `Proposal`, `VoteRecord`, `DAORegistry`, `Multisig`, `FeaturedApp` templates compiled to `.dar`, deployed on Canton MainNet
- **Read path:** Direct `GetActiveContracts` via Canton gRPC Ledger API — active contract streaming with custom proto decoding
- **Write path:** Canton gRPC Ledger API — command submission with multi-party actAs, operator role pattern for contract cleanup
- **Auth:** Invite-code system, party allocation per wallet, operator party for governance contract management

**Current state — [cantondao.com](https://cantondao.com):**

The platform is fully operational on Canton MainNet:

- DAOs, Proposals, and VoteRecords exist as live Daml contracts on-chain
- Real-time contract data served from Canton Ledger API
- Built-in wallet: generate or restore keypair, encrypt with passkey (WebAuthn PRF) or password, allocate Canton party, sign and submit transactions — all non-custodial, keys stay on device
- Multi-wallet manager: create multiple vaults, switch active wallet, named party hints (`dao-{name}::fingerprint`)
- Invite-only onboarding
- Member voting with on-chain VoteRecord creation
- DAO detail pages with member lists, proposal history, vote tallies
- External wallet support (CIP-0103 Canton Wallet extension)
- Sentry error tracking, unified design system

**Feature roadmap:**

| Feature | M1 | M2 | M3 |
|---|---|---|---|
| Live demo + open-source repo | ✓ delivered | | |
| React/Vite production frontend | ✓ delivered | | |
| Go backend (Fiber + Ledger API) | ✓ delivered | | |
| Daml `Proposal` + `VoteRecord` + `DAORegistry` on MainNet | ✓ delivered | | |
| Proposal creation + wallet-signed voting | ✓ delivered | | |
| Built-in non-custodial wallet (passkey + mnemonic) | ✓ delivered | | |
| Multi-wallet manager | ✓ delivered | | |
| Multi-DAO governance | ✓ delivered | | |
| Invite-only access control | ✓ delivered | | |
| Daml `Multisig` template | ✓ delivered | | |
| Multi-sig Treasury UI | | ✓ | |
| Delegation + proxy voting | | | ✓ |
| Quorum enforcement + auto-finalization | | | ✓ |
| Analytics dashboard | | | ✓ |
| `canton-governance-sdk` | | | ✓ |

### 3. Architectural Alignment

- **Daml smart contracts** — governance logic on-chain as Daml templates: `signatory admin` on DAORegistry, `signatory proposer` on Proposal, `signatory voter` + `observer operator` on VoteRecord; operator role for contract lifecycle management
- **Canton Ledger API as read and write path** — `GetActiveContracts` for active contract streaming, gRPC command submission with multi-party authorization; clean read/write separation via operator role pattern
- **Privacy model** — vote visibility scoped to Daml contract signatories/observers; member access enforced at backend API layer via party-based filtering
- **Canton Coin (CC)** — FeaturedApp activity markers integrated in Daml, ready for `FeaturedAppRight` activation upon DSO approval
- **CIP-0103** — External Canton Wallet support via browser extension standard

### 4. Backward Compatibility

No impact. CantonDAO reads from Canton Ledger API and writes via gRPC command submission. No protocol, CIP, or infrastructure modifications.

---

## Milestones and Deliverables

### Milestone 1: Production Platform — ✅ Delivered

- **Focus:** Live platform with real Canton ledger connectivity, built-in wallet, full governance flow
- **Delivered:**
  - [cantondao.com](https://cantondao.com) live on Canton MainNet
  - Open-source repository (MIT license)
  - React/Vite production frontend with dark-first design system
  - Go backend connected to Canton Ledger API via gRPC
  - Daml `Proposal`, `VoteRecord`, `DAORegistry`, `Multisig`, `FeaturedApp` — deployed on MainNet
  - Built-in non-custodial wallet: BIP-39 mnemonic, Ed25519 keys, passkey (WebAuthn PRF) + password encryption, IndexedDB vault storage
  - Multi-wallet manager with named party hints (`dao-{name}::fingerprint`)
  - Proposal creation and wallet-signed voting — end-to-end on-chain
  - Member management with on-chain party verification
  - Invite-only access control
  - CIP-0103 external wallet support
  - Operator role pattern for governance contract management
  - Error tracking (Sentry), unified design system

### Milestone 2: Treasury + Enhanced Governance (Weeks 1–6 from approval)

- **Focus:** Multi-sig treasury, rate limiting, repo publication
- **Deliverables:**
  - Multi-sig treasury UI: propose, approve, M-of-N progress tracking (`/treasury`)
  - Backend: `POST /api/treasury/propose`, `POST /api/treasury/:id/approve`, `GET /api/treasury`
  - Rate limiting on `/api/wallet/allocate` (prevent party spam on participant)
  - FeaturedApp activity marker emission on vote/propose (pending `FeaturedAppRight` from DSO)
  - README, LICENSE (MIT), CONTRIBUTING.md — public GitHub repository
  - Featured App application submitted to DSO governance

### Milestone 3: Full Suite & Open SDK (Weeks 7–16 from approval)

- **Focus:** Delegation, analytics, SDK
- **Deliverables:**
  - Delegation and proxy voting via Daml choices
  - Quorum enforcement and automatic proposal finalization
  - Governance analytics dashboard
  - `canton-governance-sdk` — Daml templates + Go client + TypeScript client
  - Developer documentation and integration guide
  - Final release tagged, SDK published

---

## Acceptance Criteria

- **M1:** ✅ [cantondao.com](https://cantondao.com) publicly accessible; Daml contracts on Canton MainNet; real proposal creation and voting via UI; built-in wallet operational
- **M2:** Multi-sig treasury functional on MainNet; rate limiting operational; repository public (MIT); Featured App application submitted
- **M3:** SDK published; delegation and analytics on MainNet; developer docs published; final release tagged

---

## Funding

**Total Funding Request:** 490,000 CC

### Payment Breakdown

- Milestone 1 (delivered): **70,000 CC**
- Milestone 2: **175,000 CC** upon committee acceptance
- Milestone 3: **245,000 CC** upon final release and acceptance

### Volatility Stipulation

Project duration is under 6 months from this submission. Should the timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones will be renegotiated to account for significant USD/CC price volatility.

---

## Co-Marketing

- **M1:** Announcement across Canton Foundation channels
- **M2:** Technical blog post — on-chain governance with Daml and Canton
- **M3:** Joint case study + presentation at a Canton Foundation event

---

## Motivation

Canton's 200+ institutional participants need to govern shared processes — treasury, standards, supply chain — but have no Canton-native governance tool. Super Validator governance covers network parameters. CantonDAO covers everything else: any organization creating its own DAO for its own decisions.

- **Accessibility:** Launch a DAO without building custom infrastructure
- **Transparency:** On-chain, auditable, Daml-enforced governance
- **Composability:** Open SDK for embedding governance into any Canton app
- **Adoption:** More on-chain governance activity — more network utility

The platform is not a proposal for future work — it is operational today. This grant funds the remaining features and open-source publication of the full governance suite.

---

## Rationale

**Why not existing DAO tools?** Snapshot/Tally/Aragon target EVM with off-chain signatures. They cannot model Canton's privacy, Daml contracts, or institutional roles.

**Why React/Vite?** Optimal for Canton wallet integration — the built-in non-custodial wallet uses WebAuthn PRF (passkey), SubtleCrypto, and IndexedDB, all deeply tied to browser APIs. React's component model handles the complex multi-step wallet flow (mnemonic display, confirmation, vault management) with the correctness guarantees needed for a security-sensitive UI.

**Why Go?** The only available SDK with working Canton gRPC Ledger API bindings is `go-daml`. Go's static binary compilation, zero-dependency deployment, and straightforward gRPC/proto handling make it the right choice for a Canton-connected backend.

**Why direct Ledger API?** `GetActiveContracts` over gRPC gives real-time active contract streaming directly from the participant node. For a governance platform where contract state is the source of truth, direct ledger connectivity is more reliable and lower-latency than a separate read replica.

**Why open-source the SDK?** Multiplies grant impact. Any Canton participant embeds governance without starting from zero.

**Why now?** The ecosystem is building. Governance infrastructure is foundational. The platform is already live — this grant funds the finish line.