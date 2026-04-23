# Development Fund Proposal


| Field | Detail |
|---|---|
| **Author** | Maranda Harris, Founder — CompliLedger |
| **Email** | maranda@compliledger.com |
| **Status** | Draft |
| **Created** | 2026-04-17 |
| **Labels** | regulatory-compliance · financial-workflows-composability · token-asset-standards |
| **Champion** | Need Champion |
| **Repository** | https://github.com/Compliledger/canton_tokenproof |
| **Architecture Reference** | https://github.com/Compliledger/canton_tokenproof/blob/main/docs/architecture.md |

---

## Abstract

Today, every RWA workflow on Canton relies on off-chain compliance checks that are not enforceable, not verifiable, and introduce race conditions between evaluation and settlement. Compliance state is checked via an API call, then a separate transaction is submitted to Canton — and if compliance status changes in that interval, the transfer executes without valid compliance with no audit trail.

TokenProof is a shared compliance infrastructure primitive for the Canton Network. A working proof-of-concept is implemented and publicly available today: DAML contracts (`ComplianceProof`, `ComplianceGuard`, `EvaluationRequest`), a CIP-0056 gated transfer reference implementation, an atomic DvP workflow, a deterministic Python/FastAPI classification engine, and a Canton Ledger API adapter are all present in the open-source repository at https://github.com/Compliledger/canton_tokenproof under Apache 2.0.

This proposal does not ask the Canton Dev Fund to fund an idea. It asks the Dev Fund to fund the productionisation of a demonstrated proof-of-concept — hardening it to ecosystem standard, completing the TypeScript SDK and React dashboard, deploying to DevNet, TestNet, and MainNet, and formally contributing it as a reusable compliance primitive that any Canton participant, token issuer, or settlement workflow can adopt without bespoke implementation.

Without a shared on-ledger compliance primitive, Canton participants must build bespoke off-chain compliance orchestration — resulting in duplicated engineering, inconsistent audit trails, and systemic settlement risk. What Canton is missing is a shared, reusable compliance oracle that CIP-0056 token implementations can reference atomically during transfer and settlement.

Regulators are no longer asking whether compliance exists. They are asking whether it is enforceable, verifiable, and auditable in real time. TokenProof addresses this shift directly, on the only institutional blockchain platform where it can be done atomically and privately.

**TokenProof is immediately usable by:**
- Token issuers implementing CIP-0056 who need atomic compliance enforcement on transfers
- Settlement workflows performing DvP that require compliance state verified inside the same transaction
- Stablecoin issuers operating under GENIUS Act classification requirements
- TokenProof is not proposed as a standalone framework. It is designed to be immediately integrated into existing Canton token and settlement workflows — including CIP-0056 reference implementations, DvP settlement patterns, and stablecoin issuance flows already operating on Canton.

The compliance primitive is built. This grant makes it ecosystem standard.

**Total Funding Request: $80,000 USD, denominated in Canton Coin at the prevailing USD/CC rate at each milestone acceptance.**

---

## Specification

### 1. Objective

TokenProof is already implemented as a working DAML-based compliance primitive. This proposal focuses on production hardening, ecosystem integration, and open-source standardisation on Canton.

**What the proof-of-concept has demonstrated:**

The existing repository at https://github.com/Compliledger/canton_tokenproof demonstrates all core components working together on a local Canton ledger with an end-to-end validated flow: `evaluate → anchor → query → verify`.

- A `ComplianceProof` DAML template anchoring classification outcomes, proof hashes, and lifecycle state as on-ledger contracts with party-scoped privacy — issuer and evaluator as co-signatories, regulator as Optional Party observer
- A `ComplianceGuard` DAML interface providing a `getComplianceStatus` method any CIP-0056 token can integrate as a transfer or mint precondition to enforce atomic compliance gating
- A `TokenBond` reference CIP-0056 implementation whose `Transfer` choice fetches the current `ComplianceProof` by key, asserts `Active`, and only then executes — with `submitMustFail` confirming transfers block when the proof is `Revoked`
- An atomic DvP workflow (`DvPWorkflow.daml`) demonstrating CC payment + compliance check + bond transfer in a single Canton transaction — the settlement pattern validated at the DTCC/FINOS hackathon through SettlementGuard, now generalised as a reusable primitive
- A deterministic Python/FastAPI classification engine with three policy packs (`GENIUS_v1`, `CLARITY_v1`, `SEC_CLASSIFICATION_v1`) and six asset classification buckets
- A `canton_adapter.py` interacting with the Canton JSON Ledger API (port 7575) — Algorand dependency fully removed

The test suite validates the full lifecycle and enforcement path: proof creation, suspension, revocation, re-evaluation, transfer gating, atomic DvP flow, and regulatory minting examples. `submitMustFail` is the key assertion proving the compliance gate blocks execution, not just reads status.

**What this grant funds:**

The proof-of-concept establishes that the architecture is correct and the primitives work. The grant funds the remaining path from working demonstration to ecosystem standard:

1. Complete Daml Script test suite with full adversarial coverage and CI green badge
2. Classification engine and Canton adapter hardened to production quality
3. `ComplianceGuard` and CIP-0056 reference implementation refined to adoption-ready standard, deployed on DevNet
4. TypeScript SDK (`@tokenproof/canton-sdk`) published; React dashboard built; CIP-0103 integration completed
5. Security review, ecosystem team validation, and MainNet deployment on the Canton Global Synchronizer

This budget reflects that core architecture and proof-of-concept are already complete; funding is focused on production hardening, not greenfield development.

### 2. Implementation Mechanics

#### 2.1 DAML contract layer — PoC to production

The DAML contracts in the proof-of-concept implement the correct architecture. Production hardening addresses test coverage depth, adversarial scenario validation, and documentation quality — not architectural changes.

Core contract design (already implemented in PoC):

```daml
template ComplianceProof
  with
    assetId        : Text
    issuer         : Party         -- signatory
    evaluator      : Party         -- signatory
    regulator      : Optional Party -- observer; scoped read-only
    classification : Text          -- e.g. "payment_stablecoin"
    policyVersion  : Text          -- e.g. "GENIUS_v1"
    decisionStatus : DecisionStatus -- Active | Suspended | Revoked
    proofHash      : Text          -- SHA-256 of evaluation snapshot
    timestamp      : Time
  where
    signatory issuer, evaluator
    observer  regulator
    key (assetId, evaluator) : (Text, Party)
    maintainer key._2
```

The `(assetId, evaluator)` key design enables `fetchByKey @ComplianceProof` from any third-party `Transfer` choice without additional context — making TokenProof a drop-in compliance component for any Canton token implementation.

`DecisionStatus` is a sealed sum type. Status transitions are monotonically downgrading: `Active → Suspended → Revoked`. `Revoked` is terminal. `ReEvaluate` creates a new proof version and archives the current contract.

Production hardening of the DAML layer covers:

- Complete Daml Script test suite: all lifecycle transitions, `submitMustFail` on `Revoked` and `Suspended` transfers, duplicate key rejection, signatory enforcement, multi-party scenarios with distinct participant nodes
- GDPR lifecycle: proof archival, participant node pruning, right-to-be-forgotten documented and validated
- `daml.yaml` pinned to `sdk-version: 3.4.x` with `daml-prim`, `daml-stdlib`, `daml-script`
- `dpm build` and `dpm test` passing in CI with public badge on every push to `main`

#### 2.2 Classification engine — PoC to production

The Python/FastAPI classification engine is working in the proof-of-concept. Production hardening covers:

Policy packs already implemented:

| Policy Pack | Regulatory Framework | Classification Output |
|---|---|---|
| `GENIUS_v1` | GENIUS Act — stablecoin classification | `payment_stablecoin` |
| `CLARITY_v1` | CLARITY Act — digital asset market structure | `digital_commodity` |
| `SEC_CLASSIFICATION_v1` | SEC / CFTC digital securities framework | `digital_security` |

Six asset buckets: `payment_stablecoin`, `digital_security`, `digital_commodity`, `digital_tool`, `digital_collectible`, `mixed_or_unclassified`.

Worst-of aggregation: one failing control → `mixed_or_unclassified`. Deterministic — identical inputs always produce identical outputs. Not AI-assisted classification: determinism is a regulatory requirement, not a convenience preference. Independent recomputation of the proof hash (`SHA-256(assetId + classification + policyVersion + controlResults + timestamp)`) by any party — including regulators — is a core design property.

Production hardening adds: CIP-0056 `TokenMetadata` schema validation (replacing Algorand ASA format), representative test vectors for all six asset buckets across all three policy packs, and `POST /verify` endpoint supporting independent proof hash recomputation.

#### 2.3 Canton Ledger API adapter — PoC to production

`canton_adapter.py` in the proof-of-concept already replaces the Algorand adapter entirely and uses the Canton JSON Ledger API (port 7575). No deprecated tooling is present: no `daml-assistant`, no `@daml/ledger`, no `daml ledger` CLI commands.

Production hardening adds: idempotency (duplicate proof creation returns existing `contractId`), retry logic and error handling for transient node failures, finalised JWT party authentication, and gRPC event stream (port 6866) for real-time `SuspendProof`/`RevokeProof`/`ReEvaluate` events consumed by the TypeScript SDK.

Party allocation uses `POST /v2/parties/allocate` — not the deprecated `daml ledger allocate-parties`. Commands use `POST /v2/commands/submit-and-wait`. ACS queries use `POST /v2/state/active-contracts`.

#### 2.4 ComplianceGuard and CIP-0056 reference — adoption-ready standard

The `ComplianceGuard` interface and `TokenBond` reference implementation are working in the proof-of-concept. Productionising them for adoption means:

The atomic enforcement property — already demonstrated in the PoC's `DvPWorkflow.daml`:

```
Canton transaction (one two-phase commit):
  Step 1: Buyer allocates CC payment
  Step 2: fetchByKey @ComplianceProof → assertMsg (status == Active)
  Step 3: Seller transfers tokenized bond

If Step 2 fails: entire transaction reverts. No partial execution. No race condition.
```

Production deliverable: `ComplianceGuard` documented and tested at the level required for a third-party Canton token implementation to fork `TokenBond.daml`, replace the asset fields with their own, and have a compliance-gated token with no additional work. The integration guide target is 30 minutes from cold start to running compliance-gated transfer on `dpm sandbox`.

The DvP workflow has been validated in a settlement context through prior work on SettlementGuard (developed during a FINOS/DTCC hackathon), where compliance gating was applied within deterministic settlement workflows on Canton. TokenProof generalises this pattern into a reusable compliance primitive applicable across any Canton-based token or settlement implementation. This production deliverable brings that validated pattern to ecosystem-standard quality.

#### 2.5 TypeScript SDK — new deliverable

`@tokenproof/canton-sdk` is scaffolded in the PoC but not published. Production deliverable:

- npm package using `@c7/ledger` (not deprecated `@daml/ledger`)
- DAML bindings from `dpm codegen-alpha-typescript`
- Methods: `evaluateAsset`, `getProofStatus`, `verifyProof`, `addRegulatorObserver`, `streamProofEvents`
- CIP-0103 dApp SDK integration: proof status visible in any compliant Canton wallet via the Discovery Component

#### 2.6 React dashboard — new deliverable

No dashboard exists in the PoC. Production deliverable: asset submission, proof lifecycle management, regulator observer onboarding (party provisioning, scoped JWT), CIP-0103 wallet integration.

#### 2.7 Regulator observer pattern

The regulator observer is implemented at contract level in the PoC (`regulator : Optional Party` observer on `ComplianceProof`). Production hardening adds the full operational flow: party provisioning via `POST /v2/parties/allocate`, scoped JWT with `canReadAs` only, dashboard onboarding flow, and documented privacy boundaries verifying the observer receives exactly the specified contracts and no others.

### 3. Architectural Alignment

#### Alignment with approved Canton Dev Fund investments

| Approved Canton Investment | TokenProof Relationship |
|---|---|
| Token Standard V2 (#97) | TokenProof is the first reusable compliance oracle on top of CIP-0056. `ComplianceGuard` is additive — no modification to CIP-0056 primitives. Token implementations opt in by implementing the interface on their `Transfer` choice. |
| Logical Synchronizer Upgrades (#76) | `ComplianceProof` contracts are sync-domain-native. Horizontal scalability is architecturally guaranteed — no design change required as the synchronizer scales. |
| ISS-Based BFT (#53) | Stronger BFT consensus means compliance proof finality is more robust. The atomic enforcement of `ComplianceGuard` depends on transaction finality reliability. |
| Daml Package Analyzer (#130) | TokenProof's DAML package is an ideal first candidate — a real-world, compliance-critical package with well-defined invariants. |
| Canton Payment Streams (in review) | Streaming vesting or salary flows can carry a `ComplianceGuard` precondition. Natural composability: a payment stream gated on a live compliance proof is a two-line change for any implementation using both primitives. |

#### CIP alignment

| CIP | Alignment |
|---|---|
| CIP-0056 — Canton Token Standard | `ComplianceGuard` complements `Holding` and `TransferInstruction` primitives. The `TokenBond` reference implementation demonstrates this integration with working, tested DAML code. |
| CIP-0103 — dApp SDK / Wallet API | Dashboard integrates via the dApp SDK. Compliance state visible in any compliant Canton wallet. |
| CIP-0076 — Minting Delegations | `proof.decisionStatus == Active` as a precondition before `MintingDelegation` execution — demonstrated in the stablecoin GENIUS Act example already present in the PoC. |

#### Why Canton — and only Canton

TokenProof relies on three properties that are unique to Canton and unavailable on any public blockchain:

- **Atomic multi-party transactions** — compliance check and asset transfer execute inside a single two-phase commit. If the proof is not `Active`, the entire transaction reverts. On Ethereum, these would be two separate calls with a gap between them.
- **Privacy-preserving contract visibility** — each party sees only the contracts where they are signatory or observer. The Global Synchronizer sees only encrypted routing metadata — never payload content. Compliance evaluation data is never exposed to participants without authorisation.
- **Deterministic settlement guarantees** — Canton's DAML authorization model enforces multi-party consent at the language level, not at the application layer. Compliance enforcement cannot be bypassed by application code.

This compliance model cannot be implemented on public blockchains without sacrificing either privacy or atomicity. It is structurally Canton-only.

#### Canton privacy model in a compliance-gated DvP

| Party | Sees |
|---|---|
| Issuer node | Their `ComplianceProof`, their token holdings |
| Evaluator node | `ComplianceProof` co-signed, proof lifecycle events |
| Regulator node | `ComplianceProof` records where `regulator = Some regulatorParty` — and nothing else |
| Global Synchronizer | Encrypted routing metadata only — never payload content |
| All other participants | Nothing |

### 4. Why This Matters for Canton

Canton enables privacy-preserving, multi-party financial workflows — but it does not yet provide a shared, reusable compliance enforcement layer.

TokenProof fills this gap by introducing a compliance primitive that:

- **Anchors regulatory state on-ledger** — compliance classification outcomes and proof hashes are stored as DAML contracts on participant nodes, not in off-chain databases
- **Enforces compliance at execution time** — `ComplianceGuard` fires inside the same Canton transaction as the asset movement; enforcement is atomic, not a pre-check
- **Enables independent verification of compliance decisions** — any party can recompute the `proofHash` from published evaluation data and confirm it matches the on-ledger record

This allows any Canton application — token issuance, settlement, or DeFi workflow — to inherit compliance guarantees without building bespoke infrastructure. Every new application that implements `ComplianceGuard` gets atomic, privacy-preserving, independently verifiable compliance enforcement for free.

TokenProof is not a compliance product. It is a compliance primitive — a shared building block for the Canton ecosystem.

### 5. Backward Compatibility

TokenProof introduces entirely new DAML packages and a new Canton participant node deployment. No existing Canton protocol behavior, CIP-0056 implementations, or validator operations are modified.

`ComplianceGuard` is purely additive. Existing CIP-0056 token implementations continue to function without modification. Implementations that want atomic compliance enforcement opt in by implementing the interface.

*No backward compatibility impact on Canton.*

---
### 6. Adoption Signals and Ecosystem Integration

TokenProof is designed for immediate integration into existing and emerging Canton-based workflows. The following demonstrates concrete adoption paths, integration evidence, and developer accessibility.

#### 6.1 Immediate adoption targets

**CIP-0056 token implementations**

Any token issuer implementing CIP-0056 can integrate TokenProof via `ComplianceGuard` with two changes: importing the interface and adding a `Transfer` precondition. The `TokenBond` reference implementation in the repository demonstrates this pattern end-to-end with `dpm test` passing — it serves as a fork-ready template for any Canton developer.

```daml
-- Integration requires only this inside Transfer:
proof <- fetchByKey @ComplianceProof (assetId, evaluatorParty)
assertMsg "Transfer blocked: compliance proof not Active" 
  (proof.decisionStatus == Active)
```

Target time to integration: under 30 minutes for a developer familiar with DAML.

**DvP settlement workflows**

TokenProof has already been validated in a settlement context through SettlementGuard (FINOS / DTCC hackathon), where compliance gating was applied within deterministic settlement workflows on Canton. The atomic DvP pattern (`DvPWorkflow.daml`) — CC payment + compliance check + asset transfer in one Canton transaction — is live in the repository and CI-verified.

Any DvP workflow on Canton can integrate compliance enforcement with no architectural changes. The compliance check becomes part of transaction execution, eliminating the need for external orchestration.

**Stablecoin and RWA issuers**

TokenProof directly addresses requirements emerging from the GENIUS Act (stablecoin reserves and issuance controls) and CLARITY Act (asset classification). The `examples/stablecoin-genius-act/` example — live in the repository and CI-verified — demonstrates GENIUS Act classification gating on stablecoin minting. `proof.decisionStatus == Active` as a precondition before `MintingDelegation` execution is demonstrated against the PoC.

#### 6.2 Integration with existing Canton ecosystem components

| Canton Component | TokenProof Integration | Status |
|---|---|---|
| CIP-0056 Token Standard | `ComplianceGuard` as additive `Transfer` precondition | Demonstrated in `TokenBond.daml` — CI-verified |
| DvP / Settlement workflows | Atomic compliance check inside transaction | Demonstrated in `DvPWorkflow.daml` — CI-verified |
| Stablecoin / minting flows | `proof.decisionStatus == Active` before `MintingDelegation` | Demonstrated in `stablecoin-genius-act/` — CI-verified |
| CIP-0103 dApp SDK | Proof status visible in compliant Canton wallet | Milestone 4 deliverable |
| Canton Payment Streams | `ComplianceGuard` precondition on streaming flows | Natural composability — two-line change |

TokenProof will additionally be validated against the Canton Token Standard reference implementation during Milestone 3 to confirm ecosystem compatibility beyond the PoC.

#### 6.3 Developer adoption path

TokenProof is designed for rapid adoption with minimal friction:

**Steps to integrate ComplianceGuard into any CIP-0056 token:**
1. Import `ComplianceGuard` interface
2. Add `fetchByKey @ComplianceProof` assertion inside `Transfer` choice
3. Deploy — no changes to existing token logic required

**Quickstart target:** under 30 minutes from cold start to running compliance-gated transfer on `dpm sandbox`. This will be validated by at least one external Canton community developer during Milestone 3 acceptance.

Full integration documentation at: https://github.com/Compliledger/canton_tokenproof/blob/main/docs/architecture.md

#### 6.4 Open source and ecosystem availability

- Apache 2.0 — all DAML packages, backend, SDK, and dashboard
- No proprietary dependencies
- Designed as shared infrastructure, not vendor-controlled software
- Any Canton participant can fork, adapt, and deploy without CompliLedger involvement

#### 6.5 Adoption risk and mitigation

The primary risk to adoption is ecosystem awareness, not technical feasibility. This is mitigated through:

- Reference implementations (`TokenBond.daml`, `DvPWorkflow.daml`, `stablecoin-genius-act/`) serving as fork-ready templates
- Developer documentation and quickstart guide (30-minute integration target)
- TypeScript SDK (`@tokenproof/canton-sdk`) published to npm — Milestone 4
- React dashboard for non-DAML integrators — Milestone 4
- Direct engagement with Canton ecosystem contributors via `#gsf-global-synchronizer-appdev` and grants-discuss
- Validation against Canton Token Standard reference implementations — Milestone 3
---

## Milestones and Deliverables

### Milestone 1: DAML contracts — PoC to production standard

- **Estimated Delivery:** Month 1–2 from approval
- **Focus:** Harden the existing PoC DAML contracts to production quality — complete test suite, validated invariants, CI green.
- **Deliverables / Value Metrics:**
  - `ComplianceProof`, `ComplianceGuard`, `EvaluationRequest` hardened from PoC to production
  - Complete Daml Script test suite (`dpm test` passes): all lifecycle transitions, `submitMustFail` on `Revoked`/`Suspended` transfers, multi-party scenarios, adversarial cases, GDPR lifecycle
  - `dpm build` and `dpm test` passing in CI — public badge green on every push to `main`
  - Canton sandbox demo (`dpm sandbox`): end-to-end compliance gate demonstrated
  - Architecture documentation updated to reflect production contract design
  - **Gate metric:** CI badge green. `dpm build` and `dpm test` both pass.

### Milestone 2: Classification engine and Canton adapter — production port

- **Estimated Delivery:** Month 2–3
- **Focus:** Harden the existing classification engine and Canton Ledger API adapter to production quality.
- **Deliverables / Value Metrics:**
  - `canton_adapter.py` hardened: idempotency, retry logic, full error handling, finalised JWT auth
  - CIP-0056 `TokenMetadata` schema validation replacing Algorand ASA format
  - Policy packs validated against representative test vectors for all six classification buckets
  - `POST /evaluate`, `GET /proof/{assetId}`, `POST /verify` finalised and documented
  - Integration tests: end-to-end evaluation and proof creation against local `dpm sandbox`

### Milestone 3: ComplianceGuard and CIP-0056 reference — adoption-ready, DevNet deployed

- **Estimated Delivery:** Month 3–4
- **Focus:** Productionise the `ComplianceGuard` interface and CIP-0056 reference implementation already demonstrated in the PoC. Deploy to DevNet.
- **Deliverables / Value Metrics:**
  - `ComplianceGuard` interface and `TokenBond` refactored to reference standard — suitable for direct adoption by Canton developers
  - Atomic DvP validated on DevNet: CC payment + compliance check + bond transfer in one Canton transaction, with verifiable transaction hash
  - Regulator observer onboarding: party provisioning, scoped JWT, read-only proof access — operational on DevNet
  - Integration guide: "How to add ComplianceGuard to your CIP-0056 token in under 30 minutes"
  - GDPR lifecycle documented and tested
  - DevNet deployment with public demo environment
  - At least one external Canton developer validates `ComplianceGuard` integration using the quickstart guide — completing integration in under 30 minutes on `dpm sandbox`
  - TokenProof validated against Canton Token Standard reference implementation — integration confirmed
  - **Gate metric:** (1) Atomic DvP on DevNet with publicly verifiable transaction hash. (2) External developer integration confirmed in under 30 minutes. (3) Token Standard compatibility validated.

### Milestone 4: TypeScript SDK, dashboard, and ecosystem onboarding

- **Estimated Delivery:** Month 4–5
- **Focus:** Deliver the `@tokenproof/canton-sdk` npm package and React dashboard — the developer surface that makes TokenProof a drop-in compliance component.
- **Deliverables / Value Metrics:**
  - `@tokenproof/canton-sdk` published to npm — `@c7/ledger`, full TypeScript types, DAML bindings from `dpm codegen-alpha-typescript`
  - Methods: `evaluateAsset`, `getProofStatus`, `verifyProof`, `addRegulatorObserver`, `streamProofEvents`
  - React dashboard: asset submission, proof lifecycle management, regulator access control
  - CIP-0103 dApp SDK + Discovery Component integration
  - OpenAPI spec with interactive explorer
  - Three integration walkthroughs: stablecoin issuer (GENIUS Act), tokenized bond DvP, payroll streaming with compliance gate
  - `@tokenproof/canton-sdk` used to integrate TokenProof into at least one complete example application (stablecoin or DvP workflow) — end-to-end integration demonstrated via SDK
  - **Gate metric addition:** SDK integration demonstrated in at least one working end-to-end application, not just published to npm.
  - TestNet deployment

### Milestone 5: Security hardening, ecosystem validation, and MainNet deployment

- **Estimated Delivery:** Month 5–6
- **Focus:** Security review, ecosystem team validation, MainNet deployment, complete documentation.
- **Deliverables / Value Metrics:**
  - Threat model and adversarial test suite
  - Review by experienced DAML/Canton ecosystem team; material findings remediated before MainNet release
  - Performance benchmarks: proof throughput, ACS query latency, multi-party scalability
  - DAML package upgrade path documented (schema v1 → v2)
  - MainNet deployment on Canton Global Synchronizer
  - Production runbooks: deployment, key rotation, proof migration, disaster recovery
  - Quickstart validated: under 30 min cold-start to running compliance-gated transfer on `dpm sandbox`
  - At least one third-party Canton ecosystem participant independently verifies a compliance proof on MainNet by recomputing the proof hash from published evaluation data
  - **Gate metric:** (1) TokenProof participant node live on Canton Global Synchronizer. (2) Third-party proof hash recomputation successful and publicly documented. (3) At least one Canton developer or ecosystem participant confirms MainNet integration.
---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone

**DAML correctness:** All invariants verified by Daml Script test suite. `dpm build` and `dpm test` pass in CI at every milestone. No signatory violations. No unauthorised proof modifications.

**Compliance-gated transfer enforcement:** A CIP-0056 `Transfer` choice atomically fails when `ComplianceProof.decisionStatus` is `Revoked` or `Suspended`. Verified via `submitMustFail` in Daml Script and via on-chain transaction trace on DevNet and TestNet.

**Drop-in usability:** An external Canton developer with no prior TokenProof context follows `docs/quickstart.md` and runs a compliance-gated `Transfer` on `dpm sandbox` in under 30 minutes. Validated by at least one external Canton community developer.

**Privacy enforcement:** Each party receives only contracts where they are signatory or observer. Global Synchronizer operator receives no payload content. Verified by multi-party scenario with distinct participant nodes; regulator observer receives exactly the specified contracts.

**API completeness:** All REST endpoints functional; OpenAPI spec valid and published; `GET /proof/{assetId}` returns current on-ledger status from the Active Contract Service — not a cached backend value.

**Policy coverage:** All three policy packs evaluate correctly against CIP-0056 asset metadata. Classification outputs are deterministic across identical inputs.

**Toolchain currency:** No deprecated Canton tooling anywhere: no `daml-assistant`, no `@daml/ledger`, no `daml ledger` CLI. All tooling is `dpm`-based, Canton SDK 3.4.

**Open source:** All DAML packages, backend, SDK, and dashboard under Apache 2.0. No proprietary dependencies.

**MainNet deployment:** TokenProof participant node live on Canton Global Synchronizer. At least one compliance proof independently verifiable on MainNet.

---

## Funding

**Total Funding Request: $80,000 USD (528,000 CC)**

Denominated in fixed Canton Coin calculated at the USD/CC rate at the time of each individual milestone acceptance.

This budget reflects that core architecture and proof-of-concept are already complete; funding is focused on production hardening, not greenfield development.

### Budget at a glance

| Category | USD | CC | Share | What it covers |
|---|---|---|---|---|
| Team salaries & contractor fees | $55,840 | 368,544 | 69.8% | 4 core roles + Senior DAML Reviewer (Security Auditor in Research line) |
| Infrastructure & Canton node | $7,800 | 51,480 | 9.8% | Canton node, GCP, DevNet/TestNet, monitoring, CI, domain/CDN |
| Research, QA, legal & security | $9,000 | 59,400 | 11.3% | Legal review, DAML QA, ComplianceGuard review, GDPR validation, security audit ($4,500) |
| Community, adoption & co-marketing | $2,000 | 13,200 | 2.5% | Integration guide, workshops, walkthroughs, adoption tracking, co-marketing |
| Contingency & milestone gap buffer | $5,360 | 35,376 | 6.7% | Team continuity during milestone payment verification windows (~1 week × 4 gaps) |
| **Total** | **$80,000** | **528,000** | **100%** | |

> CC conversion computed at the reference rate used for this proposal. Final CC amounts at each milestone are fixed at the USD/CC rate on the date of committee acceptance.

### Payment breakdown by milestone

| Milestone | Focus | Amount |
|---|---|---|
| M1 — DAML contracts, PoC to production | DAML hardening, CI green, sandbox demo | $16,000 USD in CC upon acceptance |
| M2 — Classification engine and Canton adapter | Production port, policy packs validated | $18,000 USD in CC upon acceptance |
| M3 — ComplianceGuard and CIP-0056 reference | Adoption-ready, DevNet deployed | $18,000 USD in CC upon acceptance |
| M4 — TypeScript SDK, dashboard, ecosystem onboarding | SDK published, dashboard live, TestNet | $16,000 USD in CC upon acceptance |
| M5 — Security hardening, ecosystem validation, MainNet | Security review, production runbooks, MainNet | $12,000 USD in CC upon final acceptance |

### Funding rationale

Milestones 1–3 carry 65% of the total because the hardening of the DAML contract layer, the CIP-0056 reference implementation, and DevNet deployment represent the primary production risk. The classification engine and Canton adapter are already working in the PoC — M2 is hardening cost, not build cost. Milestones 4–5 fund the developer surface and MainNet deployment that convert a working primitive into an adopted ecosystem standard.

The largest budget category — team salaries and contractor fees at 69.8% — reflects that the primary work is engineering labour: DAML contract hardening, test suite completion, SDK development, and security review. Infrastructure (9.8%) covers the Canton participant node, GCP hosting, DevNet/TestNet deployment, CI, and monitoring required to run a production-grade open-source project. Research, QA, and security (11.3%) includes the dedicated DAML security audit ($4,500), GDPR lifecycle validation, and legal review of the policy pack framing. The contingency buffer (6.7%) covers team continuity during the ~1-week milestone payment verification windows between the four inter-milestone gaps.

### Volatility stipulation

The project duration is six months. Should the timeline extend beyond six months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility.

---

## Co-Marketing

Upon MainNet deployment (Milestone 5), CompliLedger will collaborate with the Canton Foundation on:

- **Announcement coordination** — joint ecosystem announcement covering the first production, open-source compliance oracle on Canton
- **Technical blog post** — deep-dive on the `ComplianceGuard` interface pattern, the Canton privacy model applied to regulatory access, and the evolution from SettlementGuard (DTCC/FINOS hackathon) to TokenProof as an ecosystem primitive
- **Case study** — the atomic DvP with compliance gate as a publishable reference implementation for Canton participants evaluating tokenized RWA issuance
- **Developer community engagement** — AMA sessions on Canton Discord and Slack (`#gsf-global-synchronizer-appdev`); SDK walkthrough for Canton developers building on regulated-asset workflows
- **grants-discuss post** — architectural overview and integration guide at `grants-discuss@lists.sync.global` prior to formal PR submission, to surface technical feedback from Tech & Ops contributors before committee review
- **Ecosystem validation post** — public documentation of at least one external Canton developer completing TokenProof integration, posted to forum.canton.network and grants-discuss as adoption evidence
- **Token Standard compatibility report** — published findings from Milestone 3 validation of TokenProof against the Canton Token Standard reference implementation
- **Forum post** — architecture and integration overview on `forum.canton.network`

---

## Motivation

Every RWA settlement workflow on Canton today faces the same structural problem: compliance state is checked off-chain before the transaction is submitted, but it is not verified inside the transaction itself. The race condition this creates — compliance valid at check time, invalid at execution time — is not a theoretical edge case. It is a systemic settlement risk that exists in every off-chain compliance orchestration pattern.

Canton participants operating production workflows need verifiable, auditable compliance state at the point of asset transfer. None of them has a shared, on-ledger compliance primitive to meet that requirement today. Each is building bespoke off-chain compliance orchestration — duplicating engineering effort, creating inconsistent audit trails, and introducing the race condition independently.

TokenProof makes compliance state a property of the Canton ledger itself, enforced by Canton's two-phase commit. The race condition is architecturally eliminated, not mitigated.

The timing is acute. The GENIUS Act and CLARITY Act impose classification obligations on issuers and intermediaries that are directly implementable as on-ledger compliance primitives. Regulators are no longer satisfied with periodic compliance reporting — they are demanding real-time enforceability, verifiability, and audit trail integrity. Canton participants need this capability at production quality, available as shared infrastructure, now.

TokenProof's compliance-gating pattern has been validated in a real settlement context. SettlementGuard, developed during a FINOS/DTCC hackathon, demonstrated compliance gating within deterministic settlement workflows on Canton. TokenProof generalises that validated pattern into a reusable compliance primitive that any Canton application can adopt. The proof-of-concept demonstrates it works. The grant makes it ecosystem standard.

The alternative — leaving each Canton participant to build their own off-chain compliance orchestration — produces a fragmented ecosystem where audit trails are incompatible, regulator access is inconsistent, and the race condition is present in every RWA workflow independently. A shared compliance primitive, built once and contributed under Apache 2.0, is categorically better for every participant and for the network's institutional credibility.
TokenProof is not proposed as a standalone framework. It is designed to be immediately integrated into existing Canton token and settlement workflows — the same workflows that Canton's institutional participants are operating in production today.

**CompliLedger's credentials:**

| Credential | Detail |
|---|---|
| Prior Canton work | SettlementGuard — compliance gating in deterministic settlement workflows, validated at FINOS/DTCC hackathon |
| Regulatory engagement | Active engagement with NIST and SEC around digital asset compliance infrastructure |
| Open-source track record | Building open-source compliance tooling with FINOS; CompliGuard repository with proven classification logic on Algorand and Ethereum Sepolia |
| Multi-chain experience | AI-native compliance platform with 5+ modules live across major blockchains |
| Canton Foundation engagement | Direct positive engagement with Canton COO confirming framing and proposal direction |

---

## Rationale

The proof-of-concept design reflects deliberate choices. This section explains the reasoning to the Tech & Ops Committee.

**Why a DAML interface (`ComplianceGuard`) rather than a contract dependency?**

An interface decouples the enforcement mechanism from the compliance provider. Any CIP-0056 token can integrate `ComplianceGuard` without depending on TokenProof's internal implementation. Multiple compliance providers could offer compatible implementations. Token issuers switch providers without rewriting their `Transfer` logic. This is the property that makes TokenProof a shared ecosystem primitive rather than a vendor dependency.

**Why party-scoped DAML contracts rather than a shared on-chain registry?**

A shared registry visible to all participants exposes compliance evaluation data to parties with no legitimate access — violating Canton's privacy model and GDPR. Party-scoped DAML contracts with explicit signatory and observer assignments mean each participant sees only what they are authorised to see. This is not a constraint of the design. It is the design's primary value for regulated institutional use.

**Why deterministic policy packs rather than AI-assisted classification?**

Determinism is a regulatory requirement. The proof hash in `ComplianceProof.proofHash` can be independently recomputed by any party — including regulators — by rerunning the same classification inputs through the same deterministic rules and comparing outputs. An AI-assisted classification system cannot provide this guarantee. AI is used in CompliLedger's other compliance tooling for human-readable explanation only — never for decisional compliance classification.

**Why this approach, rather than building on existing on-chain compliance tools?**

No equivalent compliance primitive exists on Canton today. The Canton Dev Fund has invested in the protocol layer (Logical Synchronizer Upgrades, ISS-Based BFT), the token standard layer (Token Standard V2), and the tooling layer (Daml Package Analyzer). TokenProof is the application layer complement to those investments — the compliance infrastructure that allows them to serve regulated institutional markets. Without it, every RWA workflow on Canton is missing an atomic compliance guarantee that the protocol is architecturally capable of providing but that no shared implementation currently supplies.

---

> **Disclaimer:** TokenProof runs deterministic classification controls. This is not legal advice. `ComplianceGuard` enforces controls; it does not encode laws. Classification outputs represent the application of machine-readable rules to submitted asset metadata — not a regulatory opinion or legal certification.
