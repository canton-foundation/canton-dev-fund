# Development Fund Proposal

**Author:** Maranda Harris, CompliLedger (maranda@compliledger.com)
**Status:** Draft
**Created:** 2026-04-14
**Label:** regulatory-compliance, financial-workflows-composability, token-asset-standards
**Champion:** Need Champion

> **Open-source repository:** https://github.com/Compliledger/canton_tokenproof
> **Architecture reference:** https://github.com/Compliledger/canton_tokenproof/blob/main/docs/architecture.md

---

## Abstract

TokenProof is a shared compliance infrastructure layer for the Canton Network. It delivers a privacy-native, on-ledger compliance classification and proof-anchoring primitive for the Canton Global Synchronizer that makes compliant RWA issuance and CIP-0056 token transfer a first-class, atomic, and verifiable Canton operation.

Canton has the protocol infrastructure for atomic, privacy-preserving settlement. Goldman Sachs DAP, Broadridge DLR, DTCC, and Versana are running production workflows on it today. What Canton is missing is a shared, on-ledger compliance oracle that tokenized asset implementations can reference atomically during settlement. Today, every compliance check — GENIUS Act stablecoin classification, SEC digital securities analysis, sanctions screening — happens as an off-chain pre-step before the transaction is submitted, creating race conditions, unverifiable audit trails, and exposure to GDPR violations that Canton's architecture is uniquely suited to eliminate.

TokenProof fills this gap by deploying three DAML primitives — `ComplianceProof`, `ComplianceGuard`, and `EvaluationRequest` — alongside a deterministic Python classification engine, a Canton Ledger API adapter, and a TypeScript SDK. Together they allow any CIP-0056 token implementation to embed a compliance precondition directly inside its `Transfer` choice. If the proof is not `Active`, the transfer fails atomically. No off-chain coordination. No race condition. No separate API call.

TokenProof's classification engine is proven: it is operational on Algorand today, evaluating assets against the GENIUS Act, CLARITY Act, and SEC/CFTC frameworks. This proposal funds the complete migration and re-architecture to Canton — replacing public box storage with party-scoped DAML contracts, replacing manual ABI encoding with typed Ledger API integration, and replacing static off-chain compliance lookups with the `ComplianceGuard` interface that token implementations can gate transfers on at the protocol level.

All deliverables are open-sourced under Apache 2.0 at https://github.com/Compliledger/canton_tokenproof.

**Total Funding Request: $80,000 USD, denominated in Canton Coin at prevailing USD/CC rate at each milestone acceptance.**

---

## Specification

### 1. Objective

Deploy TokenProof as a production-ready, open-source compliance primitive on the Canton Global Synchronizer.

The specific problem: there is no shared, on-ledger compliance oracle on Canton. Every RWA token transfer today requires an off-chain compliance check before submission. This creates three structural risks: (1) race conditions where compliance status changes between check and execution; (2) no tamper-proof audit trail for regulators to independently verify; and (3) sensitive compliance evaluation data exposed on any public chain alternative.

The intended outcome: any CIP-0056 token implementation on Canton can add a `ComplianceGuard` precondition to its `Transfer` choice and gain instant, atomic, privacy-preserving compliance enforcement — without any off-chain orchestration. A tokenized bond, stablecoin, or money-market instrument can be structured so that it is literally impossible to transfer without a valid, Active compliance proof — enforced by Canton's two-phase commit, not by application-layer code.

Secondary objectives:
- Deliver the first open-source DAML package implementing a compliance oracle pattern for Canton
- Provide a reference implementation (TokenBond + DvP workflow) that Canton app developers can fork and adapt
- Establish a regulator observer pattern (Optional Party with scoped JWT) as a reusable Canton privacy primitive for regulated finance

### 2. Implementation Mechanics

#### 2.1 DAML Contract Layer

The primary deliverable. Three templates and one interface, compiled with `dpm build`, tested with `dpm test`. All code is at `daml/` in the repository.

**`Main.ComplianceProof`** — the core on-ledger compliance record.

```daml
template ComplianceProof
  with
    assetId        : Text
    issuer         : Party         -- signatory
    evaluator      : Party         -- signatory
    regulator      : Optional Party -- observer; scoped read-only
    classification : Text          -- e.g. "payment_stablecoin"
    policyVersion  : Text          -- e.g. "GENIUS_v1"
    decisionStatus : DecisionStatus
    proofHash      : Text          -- SHA-256 of evaluation snapshot
    timestamp      : Time
  where
    signatory issuer, evaluator
    observer  regulator
    key (assetId, evaluator) : (Text, Party)
    maintainer key._2
```

Lifecycle choices: `SuspendProof` (evaluator-controlled), `RevokeProof` (evaluator-controlled, terminal), `ReEvaluate` (issuer + evaluator, creates new proof version and archives current).

`DecisionStatus` is a sealed sum type: `Active | Suspended | Revoked`. Status transitions are monotonically downgrading. `Revoked` is terminal — an issuer must deploy a new `assetId` to resume transfers.

**`Main.ComplianceGuard`** — the DAML interface that enables atomic enforcement.

```daml
interface ComplianceGuard where
  viewtype ComplianceGuardView
  getComplianceStatus : Update DecisionStatus
```

The `getComplianceStatus` method runs `fetchByKey @ComplianceProof (assetId, evaluator)` inside the same Canton transaction as the calling contract's choice. Canton's two-phase commit guarantees atomicity: if the proof is `Revoked`, the entire transaction fails — no partial execution.

**`Examples.TokenBond`** — the CIP-0056 reference implementation.

```daml
choice Transfer : ContractId TokenBond
  with newOwner : Party
  controller owner
  do
    (_, proof) <- fetchByKey @ComplianceProof (assetId, evaluator)
    assertMsg
      ("Transfer blocked: compliance proof status is " <> show proof.decisionStatus)
      (proof.decisionStatus == Active)
    create this with owner = newOwner
```

This is the reference implementation that demonstrates integration with "existing token and transfer patterns" (CIP-0056).

**`Main.EvaluationRequest`** — request lifecycle tracking. Issuer creates; evaluator processes and closes via `MarkEvaluated` / `ArchiveRequest` choices.

#### 2.2 Classification Engine

Python 3.11 + FastAPI. Stateless, deterministic, blockchain-agnostic. The engine currently operates on Algorand; this proposal funds the migration.

Three policy packs:

| Policy Pack | Regulatory Framework | Classification Output |
|---|---|---|
| `GENIUS_v1` | GENIUS Act — stablecoin classification | `payment_stablecoin` |
| `CLARITY_v1` | CLARITY Act — digital asset market structure | `digital_commodity` |
| `SEC_CLASSIFICATION_v1` | SEC / CFTC digital securities framework | `digital_security` |

Six asset buckets: `payment_stablecoin`, `digital_security`, `digital_commodity`, `digital_tool`, `digital_collectible`, `mixed_or_unclassified`.

Aggregation rule: worst-of wins. One failing control → `mixed_or_unclassified`. This mirrors real-world prudential logic used by regulators and auditors.

Proof hash: `SHA-256(assetId + classification + policyVersion + controlResults + timestamp)`. Anchored in `ComplianceProof.proofHash`. Regulators can recompute independently via `POST /verify` to confirm on-ledger proof matches the original evaluation.

REST API endpoints:
- `POST /evaluate` — submit asset for classification
- `GET /proof/{assetId}` — retrieve current proof status
- `POST /verify` — recompute hash and confirm against ledger record

#### 2.3 Canton Ledger API Adapter

`backend/canton_adapter.py` replaces `algorand_adapter.py` entirely. All Algorand-specific code is removed.

| Algorand Component | Canton Equivalent |
|---|---|
| `register_proof` ABI call | `POST /v2/commands/submit-and-wait` (JSON Ledger API, port 7575) |
| `get_latest` ABI call | `POST /v2/state/active-contracts` (Active Contract Service) |
| Algorand Indexer metadata | CIP-0056 TokenMetadata interface |
| `ALGO_SENDER_MNEMONIC` | Canton JWT party authentication |
| Binary box storage | Typed DAML contract fields |

Party allocation: `POST /v2/parties/allocate` (not deprecated `daml ledger allocate-parties`).

Event streaming: gRPC Ledger API (port 6866) for real-time `SuspendProof` / `RevokeProof` / `ReEvaluate` events, used by the TypeScript SDK's `streamProofEvents` method.

#### 2.4 Privacy Model

Canton's sub-transaction privacy maps precisely to institutional compliance requirements.

In a DvP with compliance gate:

```
Transaction (atomic two-phase commit):
  Step 1: Buyer allocates payment (Canton Coin)        ← Buyer's node
  Step 2: fetchByKey ComplianceProof → assert Active   ← TokenProof + Regulator (if observer)
  Step 3: Seller transfers tokenized bond (CIP-0056)   ← Seller's node
  Step 4: Settlement confirmed                          ← All parties

Global Synchronizer: sees NOTHING (encrypted routing metadata only)
Regulator:           sees Step 2 only — for assets where regulator = Some regulatorParty
Buyer's node:        sees Step 1 + Step 4
Seller's node:       sees Step 2 + Step 3
TokenProof node:     sees Step 2 only
```

This privacy model is structurally impossible on Ethereum, Algorand, or any public chain. Canton is the only viable substrate.

#### 2.5 TypeScript SDK

`@tokenproof/canton-sdk` npm package. Uses `@c7/ledger` (current Canton community library) — not deprecated `@daml/ledger`. DAML bindings generated via `dpm codegen-alpha-typescript`.

Methods:
- `evaluateAsset(assetId, metadata, policyPack)` — submit for evaluation
- `getProofStatus(assetId)` — query Canton ACS for current `DecisionStatus`
- `verifyProof(assetId, proofHash)` — recompute and compare with on-ledger record
- `streamProofEvents(assetId, callback)` — real-time event stream via gRPC port 6866

CIP-0103 dApp SDK integration: proof status visible in any compliant Canton wallet via the Discovery Component.

#### 2.6 Toolchain

All development uses Canton SDK 3.4 and DPM exclusively:

- `dpm build` — compile DAML to DAR
- `dpm test` — run Daml Script test suite
- `dpm sandbox` — local Canton ledger (JSON API port 7575, gRPC port 6866)
- `dpm codegen-alpha-typescript` — generate TypeScript bindings
- `dpm validate-dar` — pre-deployment DAR validation

The deprecated `daml-assistant`, `@daml/ledger`, `daml ledger upload-dar`, and `daml ledger allocate-parties` are not used anywhere in the codebase.

### 3. Architectural Alignment

#### Alignment with Approved Canton Dev Fund Investments

| Approved Canton Investment | TokenProof Relationship |
|---|---|
| Token Standard V2 (canton-dev-fund #97) | TokenProof implements the first compliance oracle layer on top of CIP-0056. `ComplianceGuard` is designed as an additive interface — it does not modify CIP-0056 primitives, only wraps Transfer choices with an optional precondition. |
| Logical Synchronizer Upgrades (canton-dev-fund #76) | TokenProof proof contracts are sync-domain-native. As the synchronizer scales, TokenProof scales horizontally with it. |
| ISS-Based BFT (canton-dev-fund #53) | Stronger BFT consensus means compliance proof finality is more robust. TokenProof benefits directly from this infrastructure investment. |
| Daml Package Analyzer (canton-dev-fund #130) | TokenProof's DAML package is an ideal first candidate for Daml Package Analyzer validation — a real-world compliance-critical package. |
| Canton Payment Streams (in review) | Streaming vesting/salary flows can carry a `ComplianceGuard` precondition. Natural composability between the two primitives. |

#### CIP Alignment

| CIP | Alignment |
|---|---|
| CIP-0056 — Canton Token Standard | `ComplianceGuard` is designed as a first-class complement to CIP-0056 `Holding` and `TransferInstruction` primitives. The `TokenBond` reference implementation demonstrates this integration. |
| CIP-0103 — dApp SDK / Wallet API | TokenProof dashboard integrates via the dApp SDK. Issuers view compliance state directly in their Canton wallet. |
| CIP-0076 — Minting Delegations | Where compliance proofs gate minting events, `ComplianceProof.decisionStatus == Active` can serve as a precondition before `MintingDelegation` execution. |

#### Strategic Alignment

The Canton Dev Fund has invested in scalability (Logical Synchronizer Upgrades), consensus (ISS-Based BFT), token standards (Token Standard V2), and tooling (Daml Package Analyzer). TokenProof is the investment in compliance — the layer that makes all of those investments safe to use in regulated markets. Without it, Canton's institutional participants face a critical infrastructure gap at exactly the moment regulators are demanding it be filled.

The GENIUS Act (stablecoin framework) and the CLARITY Act (digital asset market structure) represent the most significant U.S. digital asset legislation in history. Both impose classification obligations on issuers and intermediaries. Institutions building tokenized RWA infrastructure on Canton need a compliant-by-construction framework. TokenProof is that framework.

### 4. Backward Compatibility

This proposal introduces entirely new DAML packages and a new Canton participant node deployment. No existing Canton protocol behavior, CIP-0056 implementations, or validator operations are modified.

The `ComplianceGuard` interface is purely additive — existing CIP-0056 token implementations continue to function without modification. Token implementations that want to add compliance enforcement can opt in by implementing `ComplianceGuard` on their `Transfer` choice.

Existing TokenProof data on Algorand can be migrated via a one-time script that generates initial `ComplianceProof` contracts on Canton from the historical Algorand evaluation records. This migration is not required for Canton operation — it is an optional continuity mechanism for existing issuers.

No backward compatibility impact on Canton.

---

## Milestones and Deliverables

### Milestone 1: DAML Package Design and Sandbox Validation

- **Estimated Delivery:** Month 1–2 from approval
- **Focus:** Establish the foundational DAML contract architecture, validate all invariants in the Canton sandbox, and publish the open-source DAML package.
- **Deliverables / Value Metrics:**
  - DAML templates: `ComplianceProof`, `EvaluationRequest`, `ComplianceGuard` interface, `DecisionStatus` type
  - All proof lifecycle choices: `CreateProof`, `SuspendProof`, `RevokeProof`, `ReEvaluate`
  - Contract invariant verification: status monotonicity, signatory enforcement, observer scoping, key uniqueness
  - Daml Script test suite (`dpm test` passes): create, suspend, revoke, re-evaluate flows; `submitMustFail` on Revoked transfer
  - Local Canton sandbox demo (`dpm sandbox`): two parties (Issuer, Evaluator), seeded evaluation data
  - Open-source GitHub repository under Apache 2.0 with architecture documentation
  - **Gate metric:** `dpm build` and `dpm test` pass in CI (GitHub Actions badge green)

### Milestone 2: Ledger API Backend and Classification Engine Port

- **Estimated Delivery:** Month 2–3
- **Focus:** Replace the Algorand adapter with a Canton Ledger API client; port the full classification and policy engine to operate against Canton asset metadata.
- **Deliverables / Value Metrics:**
  - `canton_adapter.py` — Canton JSON Ledger API client (port 7575) replacing `algorand_adapter.py` and `algorand_indexer.py` entirely
  - CIP-0056 `TokenMetadata` reader — replaces Algorand Indexer ASA metadata lookups
  - Classification engine adapted to read asset facts from Canton Active Contracts Service
  - Policy engine (`GENIUS_v1`, `CLARITY_v1`, `SEC_CLASSIFICATION_v1`) validated against CIP-0056 asset schema
  - JWT-based party authentication replacing `ALGO_SENDER_MNEMONIC`
  - REST API endpoints: `POST /evaluate`, `GET /proof/{assetId}`, `POST /verify`
  - Integration tests: end-to-end evaluation flow against local Canton sandbox

### Milestone 3: ComplianceGuard Interface and CIP-0056 Integration

- **Estimated Delivery:** Month 3–4
- **Focus:** Implement the `ComplianceGuard` DAML interface and demonstrate compliance-gated CIP-0056 transfers — the core architectural innovation.
- **Deliverables / Value Metrics:**
  - `ComplianceGuard` DAML interface with `getComplianceStatus` choice, production-ready
  - `TokenBond.daml` — reference CIP-0056 token with `ComplianceGuard` precondition on `Transfer` choice
  - `DvPWorkflow.daml` — demonstrated atomic DvP: compliance check + asset transfer + CC payment in one Canton transaction
  - Regulator observer onboarding: party provisioning, scoped JWT, read-only compliance proof access
  - Multi-party scenario: Issuer → TokenProof evaluator → Regulator observer → Verifier workflow
  - GDPR lifecycle test: proof archival, participant node pruning validation, right-to-be-forgotten documentation
  - Published integration guide for token issuers adopting `ComplianceGuard`
  - DevNet deployment with public demo environment
  - **Gate metric:** Demonstrated on DevNet — atomic DvP where transfer fails if proof is `Revoked`

### Milestone 4: Developer SDK, Dashboard, and Ecosystem Onboarding

- **Estimated Delivery:** Month 4–5
- **Focus:** Deliver the TypeScript SDK, React dashboard, and all materials needed for Canton ecosystem projects to adopt TokenProof without bespoke implementation.
- **Deliverables / Value Metrics:**
  - `@tokenproof/canton-sdk` npm package — uses `@c7/ledger`, full TypeScript type safety
  - SDK methods: `evaluateAsset`, `getProofStatus`, `addRegulatorObserver`, `verifyProof`, `streamProofEvents`
  - React dashboard: asset submission, proof status tracking, proof lifecycle management, regulator access control
  - CIP-0103 dApp SDK integration — compliance status visible in Canton wallet UI via Discovery Component
  - API documentation portal with OpenAPI spec and interactive explorer
  - Three reference integration walkthroughs: (1) stablecoin issuer (GENIUS Act), (2) tokenized bond DvP, (3) payroll streaming with compliance gate
  - TestNet deployment with public demo environment

### Milestone 5: Hardening, Security Review, and MainNet Deployment

- **Estimated Delivery:** Month 5–6
- **Focus:** Production hardening, DAML/Canton ecosystem team validation, MainNet deployment, and full documentation release.
- **Deliverables / Value Metrics:**
  - Threat model documentation: unauthorized proof creation, observer data leakage, stale proof attacks, replay prevention
  - Adversarial test suite covering all identified attack vectors
  - Validation by an experienced DAML/Canton ecosystem team; remediation of material findings before MainNet release
  - Performance benchmarks: proof creation throughput, ACS query latency, multi-party scenario scalability
  - DAML package upgrade path documented (proof schema v1 → future versions)
  - MainNet deployment on Canton Global Synchronizer
  - Production runbooks: deployment, key rotation, proof migration, disaster recovery
  - Complete documentation: quickstart (runnable in under 30 minutes by an external Canton developer), API reference, DAML package guide, operator manual
  - **Gate metric:** At least one compliance proof created and independently verifiable on Canton MainNet

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone

**DAML Contract Correctness**
All invariants verified by Daml Script test suite; no signatory violations, no unauthorized proof modifications. `dpm build` and `dpm test` pass in CI at every milestone.

**Compliance-Gated Transfer**
Demonstrated in Canton sandbox and DevNet: a CIP-0056 `Transfer` choice atomically fails when the associated `ComplianceProof` has `decisionStatus == Revoked`. Verified via `submitMustFail` in Daml Script.

**Privacy Enforcement**
Each party receives only contracts where they are signatory or observer. Global Synchronizer operator receives no transaction content. Verified by multi-party test scenario with distinct participant nodes.

**API Completeness**
All specified REST endpoints and SDK methods functional. OpenAPI spec published and valid. `GET /proof/{assetId}` returns current on-ledger status, not cached backend state.

**Policy Coverage**
All three policy packs (`GENIUS_v1`, `CLARITY_v1`, `SEC_CLASSIFICATION_v1`) evaluate correctly against CIP-0056 asset metadata. Test vectors covering all six asset classification buckets.

**Ecosystem Team Validation**
Review by experienced DAML/Canton ecosystem team completed at Milestone 5. Material findings remediated before MainNet release is asserted.

**Open Source**
All DAML packages, backend, SDK, and dashboard released under Apache 2.0. No proprietary dependencies.

**Documentation**
Quickstart runnable in under 30 minutes by an external Canton developer with no prior TokenProof context. All runbooks and operator guides published.

**MainNet Deployment**
TokenProof participant node live on Canton Global Synchronizer. At least one compliance proof created and independently verifiable by a third party (re-computing proof hash from published evaluation data).

**Toolchain Currency**
No use of deprecated tooling anywhere in the codebase: no `daml-assistant`, no `@daml/ledger`, no `daml ledger` CLI commands. All tooling is `dpm`-based, Canton SDK 3.4.

---

## Funding

**Total Funding Request: $80,000 USD**

Denominated in fixed Canton Coin calculated at the USD/CC rate at the time of each individual milestone acceptance by the Committee.

### Payment Breakdown by Milestone

- Milestone 1 — DAML Package Design and Sandbox Validation: **$16,000 USD in CC** upon committee acceptance
- Milestone 2 — Ledger API Backend and Classification Engine Port: **$18,000 USD in CC** upon committee acceptance
- Milestone 3 — ComplianceGuard Interface and CIP-0056 Integration: **$18,000 USD in CC** upon committee acceptance
- Milestone 4 — Developer SDK, Dashboard, and Ecosystem Onboarding: **$16,000 USD in CC** upon committee acceptance
- Milestone 5 — Hardening, Security Review, and MainNet Deployment: **$12,000 USD in CC** upon final release and acceptance

### Funding Rationale

Milestones 1–3 carry the highest collective share (65%) because the primary delivery risk lies in the on-ledger DAML architecture: contract invariants, compliance-gated transfer correctness, and privacy enforcement are the core technical challenges. Milestones 4–5 fund the developer surface area and production hardening that enables ecosystem adoption — lower risk, but essential for the primitive to be reusable by others.

### Volatility Stipulation

The project duration is six months. The grant is denominated in fixed Canton Coin calculated at the USD/CC rate at the time of each individual milestone acceptance by the Committee. Should the project timeline extend beyond six months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility.

---

## Co-Marketing

Upon MainNet deployment (Milestone 5), CompliLedger will collaborate with the Canton Foundation on:

- **Announcement coordination** — joint press release and ecosystem announcement covering the first production compliance oracle on Canton
- **Technical blog post** — deep-dive on the `ComplianceGuard` interface architecture, DAML privacy model, and regulatory alignment with the GENIUS Act and CLARITY Act
- **Case study** — demonstrated DvP workflow with compliance gate, publishable as a reference implementation for institutional Canton participants considering tokenized RWA issuance
- **Developer community engagement** — AMA sessions on Canton Discord and Slack (`#gsf-global-synchronizer-appdev`), SDK walkthrough for application builders targeting regulated markets
- **Forum post on forum.canton.network** — architectural overview and integration guide for Canton developers
- **Institutional outreach support** — technical materials positioning TokenProof as the compliance layer for prospective Canton institutional participants considering tokenized RWA issuance

In addition, CompliLedger commits to posting an architectural overview to `grants-discuss@lists.sync.global` prior to formal PR submission, to enable early technical feedback from Tech & Ops contributors and ecosystem builders before the proposal is reviewed.

---

## Motivation

**Why this is valuable to the Canton ecosystem:**

Canton's institutional participants — Goldman Sachs DAP, Broadridge DLR, DTCC, Versana, Hashnote, Brale, SocGen — are conducting real production workflows on the network today. The February 2026 run rate of $74B+ monthly settlement volume confirms that Canton is not a pilot environment; it is live institutional infrastructure.

Every one of those participants is subject to regulatory obligations that require verifiable, auditable compliance state at the point of asset transfer. Right now, none of them have a shared, on-ledger primitive to meet that requirement. Each is building bespoke off-chain compliance orchestration — creating duplicated work, inconsistent audit trails, and systemic race conditions that a single shared primitive would eliminate.

The compliance primitive gap is also a network adoption barrier. Tokenized asset issuers evaluating Canton as a platform for regulated RWA issuance face a critical missing piece: they can build technically sophisticated settlement workflows, but they cannot demonstrate to their regulators that compliance state is atomically enforced at the ledger level — because no such mechanism exists. TokenProof creates that mechanism and makes it available to every Canton application.

The timing is acute. The GENIUS Act and CLARITY Act represent the most significant U.S. digital asset legislation in history and impose classification obligations on issuers and intermediaries that are directly addressable with an on-ledger compliance primitive. Institutions building on Canton in 2026 need a compliant-by-construction framework now, not as a future improvement. TokenProof is that framework.

Every compliance primitive built for TokenProof — the `ComplianceGuard` interface, the regulator observer pattern, the proof lifecycle choices — is reusable by any Canton application. Canton Payment Streams can add compliance gates to vesting flows. Future stablecoin issuers can reference TokenProof proofs before minting. DvP settlement workflows across Goldman Sachs DAP and Broadridge DLR can atomically verify compliance state without a separate API call.

**CompliLedger's credentials supporting this proposal:**

- AI-native compliance platform with 5+ modules live across major blockchains including a Canton demo at the DTCC/FINOS hackathon
- Active engagement with NIST and SEC around compliance solutions for digital assets
- Building open-source compliance infrastructure with FINOS
- Existing open-source CompliGuard repository (Chainlink CRE-based compliance enforcement engine) demonstrating proven classification logic and policy evaluation across six asset buckets on Algorand and Ethereum Sepolia
- Direct positive feedback from Amanda Martin (Canton COO) on the proposal direction and framing

---

## Rationale

**Why TokenProof is the right approach:**

TokenProof is not a speculative concept. It is a working compliance engine with proven classification logic, operating on Algorand today. This grant funds an architectural migration to a dramatically superior substrate — one that makes compliance not a check-before-you-transact burden but an atomic, verifiable, privacy-respecting property of the transaction itself.

| Alternative Considered | Weakness | Why TokenProof Wins |
|---|---|---|
| Off-chain compliance backend only | Race conditions; no atomic guarantee; no immutable audit trail on the ledger | TokenProof anchors proof state on-ledger as DAML contracts, making compliance a Canton primitive |
| Permissioned database (off-chain) | Not independently verifiable; single point of failure; no regulator access model | DAML contracts provide independent verifiability and scoped regulator observer rights |
| Smart contract on public EVM chain | All compliance data publicly visible; no confidentiality; no institutional suitability; GDPR incompatible | Canton's sub-transaction privacy is categorically superior for regulated data |
| Remain on Algorand | No privacy, no institutional ecosystem, no composability with Canton RWA workflows | Canton is where institutional tokenized assets are being built; compliance must be there too |

**Why Canton's architecture is uniquely suited:**

Canton's architecture provides three properties that make compliance infrastructure possible in a way no other platform can match:

1. **Sub-transaction privacy** — compliance evaluation data is shared only with parties granted signatory or observer rights. The sync domain operator sees nothing. GDPR data minimization is native, not bolted on.

2. **DAML's signatory/controller model** — multi-party authorization for proof creation and lifecycle management is enforced at the language level, not by application-layer access control. It is impossible for an issuer to create a proof without the evaluator co-signing, and vice versa.

3. **Composability via DAML interfaces** — the `ComplianceGuard` interface allows any CIP-0056 token to adopt atomic compliance enforcement without depending on TokenProof's internal implementation. This is the key property that makes TokenProof an ecosystem primitive rather than a standalone application. The interface can be implemented by multiple compliance providers; token issuers can switch providers without rewriting their transfer logic.

**Why this is the right team:**

CompliLedger has spent over a year building AI-native compliance infrastructure for Web3 across multiple chains. The classification engine that powers TokenProof is already operational. The architectural challenge is migration to Canton — replacing blockchain-specific transport layers with DAML contracts and Canton's Ledger API — not rebuilding compliance logic from scratch. The team has direct experience with the GENIUS Act, CLARITY Act, and SEC classification frameworks, and direct positive engagement with the Canton Foundation. The open-source repository is live at https://github.com/Compliledger/canton_tokenproof, with architecture documentation, Apache 2.0 license, and CI infrastructure already in place.

> **Disclaimer:** TokenProof runs deterministic classification controls. This is not legal advice. `ComplianceGuard` enforces controls; it does not encode laws. Classification outputs represent the application of machine-readable rules to submitted asset metadata — not a regulatory opinion or legal certification.
