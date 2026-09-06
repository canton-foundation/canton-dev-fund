# Proposal: B-Method Formal Verification Models for Canton DAML Standards (CIP‑0056, CIP‑0047)

## Summary
TKNFRA proposes to deliver a machine-checked, B‑Method-based formal verification model for key Canton Network DAML standards:
(1) CIP‑0056 (Canton Network Token Standard) and (2) CIP‑0047 (Featured App Activity Markers).
The output will be an open, reproducible set of formal specifications, invariants, and proof/model-check artifacts tied to specific released versions of the reference DAML packages (Splice), improving assurance and implementability across the ecosystem.

## Objective and Scope

### Objective
Create a reusable, maintainable, and ecosystem-facing **formal specification + verification evidence** for the most widely reused Canton DAML standards, starting with token interoperability (CIP‑0056) and featured-app reward attribution markers (CIP‑0047).

### In Scope (Standards / Contract Packages)
1) **CIP‑0056 — Canton Network Token Standard (Daml layer)**
   - Model the six standard APIs and their core workflows (portfolio/holdings view semantics at the contract level; FOP transfer instruction workflow; DvP allocation + settlement workflow).
   - Align with the published interfaces and the Splice reference implementation location:
     - CIP‑0056 text: https://github.com/canton-foundation/cips/blob/main/cip-0056/cip-0056.md
     - Reference implementation pointer (token-standard/ in Splice): https://github.com/hyperledger-labs/splice/tree/main/token-standard
     - Token standard docs: https://docs.dev.sync.global/app_dev/token_standard/index.html

2) **CIP‑0047 — Featured App Activity Markers**
   - Model marker creation semantics, split/weights constraints, and conversion semantics to reward coupons as described by the CIP.
   - CIP‑0047 text: https://github.com/canton-foundation/cips/blob/main/cip-0047/cip-0047.md
   - Splice Daml API docs (Featured App Activity Markers API): https://docs.sync.global/app_dev/daml_api/index.html

### Explicit Non‑Goals
- A "universal Daml→B translator" for arbitrary Daml codebases (this proposal focuses on *standards* and their reference packages).
- Formalizing synchronizer consensus, topology, or privacy guarantees (we rely on Canton's correctness for synchronization/authorization; we model contract/workflow correctness at the Daml application layer).
- Certifying every third‑party registry implementation of CIP‑0056. (We will, however, define a conformance contract that registry implementers can optionally use.)

## Ecosystem Value

### CIP‑0056 is ecosystem-critical
CIP‑0056 standardizes how wallets and apps interoperate with Canton tokens via a fixed set of APIs and workflows (including FOP transfers and DvP allocations/settlement). It is implemented in Splice and intended as a common base for tokens and wallet/app compatibility.
A formal model for CIP‑0056 reduces ambiguity, increases confidence for integrators, and provides a stable "ground truth" for reasoning about upgrades and edge cases.

### CIP‑0047 affects incentive integrity
CIP‑0047 introduces FeaturedAppActivityMarker creation and conversion into reward coupons, with constraints such as weight splitting summing to 1.0 and governance-defined marker value. Formalizing these invariants helps prevent subtle economic/accounting bugs and improves auditability.

## Architectural Alignment with Canton and DAML

### Canton / DAML execution model implications
- In Canton, Daml contracts correspond to UTXO-like ledger objects; workflows consume/archive and create contracts, with explicit stakeholders and authorization.
- CIP‑0056 explicitly discusses UTXO access patterns and off-ledger endpoints used to fetch the necessary contract inputs for constructing valid transactions.
- These characteristics match B‑Method's strengths: explicit state variables, invariant-centric design, and rigor around state transitions.

### Verification strategy choice: B‑Method
We will use the B‑Method (classical B and/or Event‑B style) to:
- Specify abstract state machines for standard workflows.
- Prove invariant preservation across operations.
- Provide refinement layers (where feasible) from "CIP‑level semantics" → "reference-implementation-aligned semantics".

Tooling choice will prioritize *reproducibility and openness* (e.g., model checking + proof artifacts that can be run by reviewers in CI).

## Technical Approach

### 1) Formal model structure
We will publish a repository containing:
- `spec/` — B machines (and refinement chain where used)
- `properties/` — invariant catalog and threat-model notes (plain English + formal statements)
- `proof/` — proof obligations, discharged proofs, model-check configs
- `traceability/` — mapping tables from:
  - CIP clauses → formal operations/invariants
  - Daml interface choices/templates → formal operations/state variables
  - Splice package version / DAR hash → verification artifact version

### 2) Modeling CIP‑0056 (Token Standard)
We will model:
- Core entities as abstract sets and relations:
  - Parties, InstrumentIds, Holding contracts, TransferInstruction contracts, Allocation contracts, Settlement identifiers, deadlines/time.
- Operations corresponding to the standard workflows:
  - Create/accept/execute/abort transfer instruction (FOP)
  - Request allocation / create allocation / withdraw allocation (DvP pre-state)
  - Execute settlement (atomic multi-leg transfer using allocations)
- "Interface-level" semantics: what clients can assume about the outcomes of exercising standard choices, independent of registry-specific internal steps.

#### Proposed property/invariant set (initial)
Examples (exact formal statements will be provided in Milestone 1):
- **Conservation**: Transfers and settlements preserve per-instrument total quantity (modulo explicitly modeled mint/burn hooks, which are out of scope unless the standard/reference requires them).
- **Non-negativity**: No holding/allocation results in negative balances.
- **No double-spend under locks**: Allocated/locked quantities cannot simultaneously be spent by other operations until expiry/withdrawal.
- **Atomic settlement**: A settlement either executes all legs or none (modeled as single operation with preconditions).
- **Deadline safety**: After deadlines, allocations become withdrawable / ineffective in a way that restores spendability.

### 3) Modeling CIP‑0047 (Featured App Activity Markers)
We will model:
- Marker creation by featured app rights holder.
- Split markers:
  - Weight list constraints (sum-to-1, non-negative).
  - Provider/beneficiary integrity.
- Conversion semantics:
  - Markers convert into reward-coupon-like records with governance-defined value.
  - Marker is consumed exactly once in conversion.
  - Beneficiary attribution is preserved.

#### Proposed property/invariant set (initial)
- **Split correctness**: weights sum to 1.0; each marker's value is proportional to weight.
- **Authorization**: only a valid featured app right can create markers.
- **No duplication**: no marker can be converted twice.
- **Accounting consistency**: total coupon value created equals governance-defined marker amount (subject to rounding rules if any are normative).

### 4) "Conformance Contract" deliverable
We will publish, for each standard, a clear conformance layer:
- Minimal assumptions required from an implementation
- Observable behaviors that must hold
- How to use the formal model to validate changes (review checklist + regression model checking)

This is designed to support both:
- maintainers of the reference implementation (Splice), and
- third-party token registries implementing CIP‑0056.

## Deliverables

### Public deliverables (open source)
- B‑Method specifications for CIP‑0056 and CIP‑0047.
- Proof / model-check artifacts that can be run in CI.
- A "Verification Report" per standard:
  - scope and assumptions,
  - invariants proven / checked,
  - known gaps (if any),
  - how to reproduce verification.

### Practical adoption deliverables
- Traceability matrix (CIP clause ↔ B model ↔ Daml element).
- A reviewer guide: "How to use the model in PR review for upgrades".

## Milestones, Funding, and Acceptance Criteria

> Note: Milestones are sized to be independently reviewable and "no larger than one quarter" of the delivery plan.

### Milestone 1 — Scoping + Formal Invariant Catalog + Model Skeleton (CIP‑0056 & CIP‑0047)
**Funding requested:** 75,000 CC
**Deliverables:**
- Repo initialized with structure (`spec/`, `proof/`, `traceability/`, `reports/`).
- Formal data model skeleton (sets/relations) for both CIPs.
- First-pass invariant catalog (English + formal form), reviewed with at least one ecosystem stakeholder (Tech & Ops / contributor group feedback captured in issues).
- Traceability draft: mapping CIP sections to model components.
**Acceptance criteria:**
- Reviewers can clone repo and run a single command/script to:
  - parse/check the model files (syntax/type correctness),
  - run an initial model-check on bounded configurations (sanity).
- Invariants are explicitly enumerated and linked to CIP clauses.

### Milestone 2 — CIP‑0056: Core Workflow Formalization + Machine-Checked Evidence
**Funding requested:** 130,000 CC
**Deliverables:**
- Complete formal operations for:
  - FOP transfer instruction workflow (create → progress/execute → abort)
  - DvP allocation lifecycle (request/allocation/withdraw/expiry semantics at interface level)
  - Settlement operation (atomic multi-leg)
- Machine-checked evidence:
  - invariant preservation proofs and/or model-check coverage report for bounded instances.
- "CIP‑0056 Verification Report v1".
**Acceptance criteria:**
- CI runs on every PR and produces:
  - proof status summary (discharged/remaining) and/or model-check pass report,
  - artifact bundle attached to release tag.
- Verification report includes explicit limitations and assumptions.

### Milestone 3 — CIP‑0047: Full Marker Model + Proof/Check + Accounting Consistency
**Funding requested:** 130,000 CC
**Deliverables:**
- Complete formal operations for marker creation, splitting, and conversion semantics.
- Proof/model-check evidence for invariants:
  - split correctness, no duplication, authorization constraints.
- "CIP‑0047 Verification Report v1".
**Acceptance criteria:**
- Reproducible verification run in CI.
- Clear mapping from CIP‑0047 details section to formal operations and invariants.

### Milestone 4 — Reference-Implementation Alignment + Upgrade/Regression Playbook
**Funding requested:** 75,000 CC
**Deliverables:**
- Bind the formal model to **specific released versions** of the reference packages:
  - record Splice package versions / DAR hashes used as reference points.
- Provide a "Regression Playbook" for maintainers:
  - when CIP text changes or Splice interfaces change,
  - what to update in the model,
  - how to interpret proof/model-check diffs.
- Optional (if feasible within milestone): a lightweight trace extraction from the Splice Daml Script test harness scenarios into a comparable trace format for bounded cross-checking (not a generic translator; just for the standards harness).
**Acceptance criteria:**
- A maintainer can follow the playbook to re-run verification against the pinned reference points.
- Traceability artifacts show which standard interfaces/templates/choices are covered and what remains out of scope.

### Total funding requested (initial): 410,000 CC

## Risks and Mitigations
- **Risk: Scope creep into "generic Daml verification tooling".**
  - Mitigation: strict scope to CIP‑0056 and CIP‑0047 and their published interfaces; any generalization requires a separate proposal.
- **Risk: Misalignment between CIP text and actual reference implementations.**
  - Mitigation: explicit traceability, pinned versions, and reporting of any divergence as issues with recommended remediation paths.
- **Risk: Proof complexity for unbounded state spaces.**
  - Mitigation: combine (a) proof where feasible and (b) systematic bounded model checking plus refinement layers that isolate complexity.

## Team and Capabilities
TKNFRA will staff:
- Formal methods lead (B‑Method/Event‑B spec + proof)
- DAML/Canton engineer (interfaces/workflow semantics; Splice package navigation)
- Reviewer liaison (coordinates feedback with Tech & Ops / contributors)

## Licensing / IP
All deliverables will be open source under a permissive license compatible with Canton Foundation OSS norms (e.g., Apache‑2.0), unless the Foundation requests otherwise.

## References
- CIP‑0056: https://github.com/canton-foundation/cips/blob/main/cip-0056/cip-0056.md
- Token standard implementation (Splice): https://github.com/hyperledger-labs/splice/tree/main/token-standard
- Token standard docs: https://docs.dev.sync.global/app_dev/token_standard/index.html
- CIP‑0047: https://github.com/canton-foundation/cips/blob/main/cip-0047/cip-0047.md
- Splice Daml APIs: https://docs.sync.global/app_dev/daml_api/index.html
