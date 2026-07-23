## Development Fund Proposal — Canton Transaction Debugger

**Author:** Jitin Jain (InfraSingularity)  
**Status:** Draft (amended)  
**Created:** 2026-05-04  
**Updated:** 2026-07-23  
**Label:** `daml-tooling`  
**Champion:** TBD

---

## Abstract

A Canton-native failure-diagnosis layer that converts failed or rejected Ledger API submissions into a deterministic, human-readable diagnosis and a sanitized, shareable **debug bundle**. It builds on Canton's existing rejection-payload and correlation-ID surface — it does not fork or replace any participant, ledger, or runtime component — and gives application teams, infra/support teams, and CI owners a portable artifact for root-cause analysis. It is scoped to **complement DPM Trace (PR #327)**, not duplicate it: DPM Trace provides interactive inspection, diffing, and source-linking of transactions; this proposal provides the **failure-classification engine** and the **governed, privacy-aware bundle** that DPM Trace does not. The bundle schema, redaction policy, and rejection-family taxonomy are contributed as **open, versioned components** so DPM Trace and other tooling can consume them directly. Transaction replay and a bespoke inspection UI, included in the original submission, are removed from scope (see §5).

---

## Specification

### 1. Objective

Reduce time-to-root-cause for failed Canton transactions in privacy- and authorization-heavy scenarios from hours to minutes, by producing a **deterministic decoded diagnosis** and a **sanitized, shareable debug bundle** for every failed or rejected submission.

Single objective: build the failure-classification engine and its governed bundle artifact, and publish the schemas and taxonomy that underpin them as open components. Presentation, navigation, and diffing are explicitly out of scope — that is DPM Trace's domain (see §5).

### 2. Implementation Mechanics

The work divides into **open components** (contributed, so DPM Trace and other tools can build on them) and a **funded deliverable** (built and operated by InfraSingularity). All of it sits on top of the existing Canton Ledger API surface.

**Open components (published under Apache-2.0):**

- **Debug Bundle interchange schema** — versioned JSON with checksum; defines sanitized request inputs, environment metadata, error payloads, and decoded category.
- **Redaction policy specification** — deterministic rules for what is stripped, masked, or pointer-referenced, so redaction is reproducible and auditable.
- **Rejection-family taxonomy + decoder interface** — the open catalog of failure families and the schema for a decoder rule and its categorized output (category, confidence, ranked next checks, `insufficient signal`).
- **Public decoder corpus + evaluation harness** — the labeled ground-truth set the classifier is measured against. Labels come from **fault injection** (deterministic true labels — e.g. a deliberately missing controller has a known class) and **blind adjudication of real production rejections** (labeled by an engineer without sight of the engine's output), split into a training set and a **frozen held-out set** the decoder authors do not tune against. The harness computes the precision/coverage (risk-coverage) curve, the per-family confusion matrix, and confidence calibration. Both corpus and harness are consumable by third parties to validate their own decoders.

**Funded deliverable:**

- **Trace Collector** — ingests rejection payloads and structured client/gateway markers keyed by a client-supplied correlation ID; assembles a normalized Trace Artifact; applies redaction and TTL.
- **Decoding / Classification Engine** — rules-based and deterministic. A registry of decoders maps Canton/Daml rejection families (auth/scope, act-as/read-as, disclosure/visibility, malformed command, missing choice args, package vetting drift, environment drift) to a primary diagnosis sentence + 2–5 ranked next checks. Unknown cases return `insufficient signal` — the engine never fabricates a category. No LLM dependency for correctness.
- **Governed Artifact Store & Access Layer** — encrypted-at-rest, tenant-partitioned storage with a strict default TTL; access checks and cross-tenant isolation; bundle export and tenant-scoped permalinks. Exposed via **API + CLI** (no bespoke web UI — see §5).

**Signal contract — grounded in what Canton actually exposes:**

- *Guaranteed (Ledger API):* completion status, error codes / rejection payloads, client-supplied correlation ID, environment metadata.
- *Optional (best-effort, only if the deployment exposes it):* gateway markers, participant logs.
- *Out of scope:* participant-internal execution traces and any inferred stage markers from undocumented internals.

**Bundle format:** versioned JSON with checksum, sanitized request inputs, environment metadata (packages, party topology pointers, client version), error payloads, and decoded category. Storage is encrypted-at-rest, tenant-partitioned, with a strict default TTL.

**Daml-aware decoding:** bundles capture template ID, choice name (including interface choices), and act-as/read-as parties from the client submission context, so decoders map to Daml/Canton rejection families directly (e.g. "missing controller authority", "contract not found / not visible", "package drift / vetting mismatch").

### 3. Architectural Alignment

- Builds on the **Canton Ledger API** (rejection payloads, completions) — the stable, public signal surface — rather than depending on participant internals. Works across all Canton deployments.
- **Correlation ID propagation** follows existing Canton command submission patterns; the proposal contributes a propagation spec and reference instrumentation, not a new transport. Because the join key is a client-supplied correlation ID captured at submission time, a submission that is **rejected before it commits** (and therefore has no `update-id`) is still captured and retrievable.
- **Open, versioned debug bundle schema** — other tools (CI runners, ticketing integrations, IDE extensions) can consume it without a dependency on this project's API.
- **Complements DPM Trace (PR #327).** DPM Trace owns interactive inspection, navigation, diffing, and source-linking of transactions; this proposal supplies the failure-classification and governed-bundle layer it does not provide, and contributes the schema, taxonomy, and redaction policy as open components DPM Trace can consume.
- Aligned with **CIP-0082** (Development Fund allocation) and **CIP-0100** (governance and review process).
- Relevant SIGs: **Daml Language & Developer Tooling**, **Canton APIs (Ledger API, SQL API, Admin API)**, **dApp Integration**.

### 4. Backward Compatibility

*No backward compatibility impact.* The layer is a net-new developer-tooling component. It does not modify Canton protocol, node, ledger, or Daml runtime behavior. Adopting it requires only adding a correlation ID to client submissions — a non-breaking change for existing integrations.

### 5. Scope Boundaries

To avoid duplicating DPM Trace (PR #327) and to right-size the grant, the following are explicitly **out of scope**:

- **A bespoke web inspection / debugger UI.** DPM Trace and existing tooling provide the presentation and navigation layer and consume the open bundle schema. (Present in the original submission as Milestone 4; removed.)
- **Transaction / localnet replay.** Removed from the funded scope; may be proposed separately once classification and governed sharing are in use. (Present in the original submission as part of Milestone 6; removed.)
- **Participant-internal execution tracing or a compiler debug-info format.** Not exposed by the platform as a stable API; not attempted here.
- **Source-level line mapping.** This proposal maps to *failure families*, not source spans; source-linking is DPM Trace's domain.

---

## Milestones and Deliverables

All week numbers are relative to grant acceptance (T+0).

### Milestone 1: Open Interchange Specs & Reference Library

- **Estimated Delivery:** Week 2
- **Focus:** Versioned Debug Bundle schema; deterministic redaction policy specification; rejection-family taxonomy + decoder interface; labeled decoder corpus (fault injection + blind-labeled real production rejections, with a frozen held-out split) + evaluation harness that computes the precision/coverage curve, per-family confusion matrix, and calibration — all published under Apache-2.0.
- **Deliverables / Value Metrics:** Schemas and taxonomy published with changelog; redaction is deterministic and tested on fixtures; the decoder interface and corpus are consumable by third-party tooling (including DPM Trace) without a dependency on this service; any team can validate a decoder against the corpus in CI. A **measured precision/coverage baseline** is published on the frozen held-out corpus, so M2's numeric target is set from what Canton's real rejection payloads actually support rather than asserted up front.
- **Staffing:** 2.0 FTE engineering × 2 weeks.

### Milestone 2: Failure-Classification Engine + Playbooks

- **Estimated Delivery:** Week 5
- **Focus:** Decoder registry + 6–8 decoders (auth/scope, act-as/read-as, disclosure/visibility, malformed command, missing choice args, package/vetting drift, env drift); per-category playbooks (symptoms, checks, escalation data); classification exposed via API + CLI.
- **Deliverables / Value Metrics:** Each decoder ships with matcher rules, fixtures, and unit tests in CI; `insufficient signal` (abstention below a confidence threshold) is a first-class outcome; on the frozen held-out corpus the registry hits the **committed point on the risk-coverage curve** — **macro-averaged precision ≥ 90% on emitted diagnoses, no covered family below 80%**, at a coverage (non-abstain rate) fixed at M1 from the baseline (floor ≥ 50% of covered-family failures) — with the per-family confusion matrix and confidence calibration published; teams using the decoder + playbook reach a diagnosis without escalating to Canton experts on covered categories.
- **Staffing:** 2.0 FTE engineering × 3 weeks.

### Milestone 3: Governed Artifact Store & Privacy Layer

- **Estimated Delivery:** Week 8
- **Focus:** Collector / ingestion keyed by client correlation ID (captures pre-commit rejections); encrypted, tenant-partitioned storage with TTL; access checks and cross-tenant isolation; bundle export (API + CLI) with checksum; tenant-scoped permalinks.
- **Deliverables / Value Metrics:** A failed or rejected submission produces a stored, retrievable, redacted artifact by correlation ID; cross-tenant access is blocked (positive/negative tests); TTL enforced; exported bundle checksum verifies; first ecosystem teams can attach a sanitized bundle to a ticket across a support boundary.
- **Staffing:** 2.0 FTE engineering × 3 weeks.

### Milestone 4: Security Review, Docs, Adoption & Lean Ops — Complete

- **Estimated Delivery:** Week 10
- **Focus:** Security/privacy review (threat model, redaction review, access checklist) with external sign-off; golden-path docs (instrument → capture → diagnose → share); CI integration example; starter repo / sample app instrumentation; lean observability (bundle creation rate, decode success rate, p95 latency, error breakdown), backpressure baseline, and incident runbook.
- **Deliverables / Value Metrics:** A new team can integrate correlation IDs and produce a bundle using docs + starter repo; review comments closed out (accept/reject documented); redaction sign-off complete; the engine is **validated on real rejection payloads from InfraSingularity's own production Canton operations** (confirmed-correct diagnoses on real failures — the in-our-control evidence of real-world function). Independent uptake is pursued and **reported as a target (aim: 3 independent teams)**, but is not a release condition for this milestone.
- **Staffing:** 1.5 FTE engineering + 0.25 FTE security reviewer + 0.25 FTE technical writer/DevRel × 2 weeks.

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on **ecosystem value**, not artifact delivery alone:

- **Adoption & real-world function:** the committed criterion is that the engine is **validated on real rejection payloads from InfraSingularity's own production Canton operations**, with confirmed-correct diagnoses on real failures — the primary, in-our-control evidence that it works in the wild rather than only on curated fixtures. **Independent adoption is a reported target, not a gate**: InfraSingularity will actively recruit independent Canton teams during the grant and report actual uptake (aim: 3 teams, each obtaining a confirmed-correct real-case diagnosis and exercising the governed bundle across a boundary) — but with no design partners committed and a ~2-week usable window after M3, payment is not held against external teams' timelines. Consumption by DPM Trace is an explicit target where timelines align.
- **Diagnostic effectiveness (selective classification):** measured on a **frozen held-out corpus** whose labels come from **fault injection** and **blind adjudication of real production rejections**. On emitted (non-abstain) diagnoses: **macro-averaged precision ≥ 90%**, with **no covered failure family below 80%**, at a **coverage (non-abstain rate) fixed at M1** from the measured baseline and committed to be **no lower than 50%** of covered-family failures. Below its confidence threshold the engine returns `insufficient signal` rather than a guess. The full **precision/coverage curve, per-family confusion matrix, and confidence calibration** are published, and precision is reported per confidence bucket. (Precision is the internal build-quality gate; adoption and time-to-root-cause are the ecosystem-value measures.)
- **Time-to-root-cause:** measured on real failure cases (including InfraSingularity's own production Canton operations, plus any participating teams), **median time from failed submission to identified root cause for covered categories drops below 30 minutes** (from a multi-hour baseline).
- **Support load:** on covered categories, a measurable reduction in "send me your logs" round-trips is reported (measured on InfraSingularity's own operations, and on any participating teams).
- **Privacy posture:** redaction policy review signed off; cross-tenant access tests pass; TTL enforcement verified.
- **Open artifacts:** bundle schema, decoder rules, fixtures, taxonomy, and playbooks published under **Apache-2.0** (proposal text under **CC0-1.0**).

---

## Funding

**Total Funding Request: 950,000 CC**

### Payment Breakdown by Milestone

| Milestone | Scope | Amount (CC) |
| --- | --- | --- |
| M1 | Open Interchange Specs & Reference Library | 150,000 |
| M2 | Failure-Classification Engine + Playbooks | 300,000 |
| M3 | Governed Artifact Store & Privacy Layer | 260,000 |
| M4 | Security Review, Docs, Adoption & Lean Ops | 240,000 |
| **Total** | | **950,000** |

Each milestone is paid only upon committee acceptance.

### Payment Structure — Delivery vs Verified Outcome

Each milestone's payment is split 50% on delivery of the artifacts and 50% on an independently verifiable outcome, so that **half of the total (475,000 CC) is gated on measured ecosystem value** rather than artifact delivery.

| Milestone | Amount (CC) | Delivery tranche | Outcome tranche (release condition) |
| --- | --- | --- | --- |
| M1 | 150,000 | 120,000 | 30,000 — measured precision/coverage baseline published on the frozen held-out corpus (fault injection + blind-labeled real rejections); schema/corpus consumed by ≥ 1 external tool or validated in CI |
| M2 | 300,000 | 120,000 | 180,000 — on the frozen held-out corpus: **macro precision ≥ 90% on emitted diagnoses**, no covered family below 80%, at the M1-fixed coverage (≥ 50% floor); risk-coverage curve + confusion matrix + calibration published |
| M3 | 260,000 | 150,000 | 110,000 — cross-tenant isolation tests pass and TTL enforcement independently confirmed |
| M4 | 240,000 | 85,000 | 155,000 — security sign-off complete; engine validated on **real production failures from InfraSingularity's own Canton operations** (confirmed-correct diagnoses) with median TTRC **< 30 min**. Independent uptake reported as a target (aim: 3), not a release condition |
| **Total** | **950,000** | **475,000 (50%)** | **475,000 (50%)** |

### Volatility Stipulation

Project duration is **under 6 months** (10 weeks). Should the project timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility.

---

## Co-Marketing

Upon release, InfraSingularity will collaborate with the Foundation on:

- Announcement coordination at **feature-complete (Week 8)** and at **adoption (Week 10)**
- A **technical case study** showing before/after time-to-root-cause on at least one real participating team
- A **developer walkthrough** (post + short demo) covering integration, bundle anatomy, and the decoder playbook flow
- Conference / community talk submissions to relevant Canton and Daml developer venues

---

## Motivation

**Why is this valuable to the Canton ecosystem?**

Developer-velocity tooling is a force multiplier for Canton adoption. Failed transactions on Canton are uniquely hard to diagnose because root cause depends on Canton-specific context (parties, act-as/read-as, disclosure/visibility, package vetting, environment drift) that no single log line surfaces. Rejected submissions are the hardest case: rejected before they commit, they have no `update-id`, and the signal lives only in the completion's rejection payload. Today this cost is paid by every dApp team, every infra/support team, and every escalation back-and-forth — and there is no safe, categorized artifact to share across an organizational boundary.

**Estimated portion of the ecosystem that benefits:**

- **~100% of dApp teams building on Canton** hit at least one of the targeted failure categories (auth/scope, party authorization, disclosure, package drift) during integration and on every environment promotion. Direct beneficiaries.
- **~80% of infra / support teams** spend material time stitching client and node logs together to triage cross-team failures; the debug bundle directly replaces that workflow.
- **CI pipelines** for any team running Canton integration tests gain an attachable failure artifact per failed run — a generic primitive every team can use.
- **Wallet apps and validator operators** benefit from shareable, sanitized escalation artifacts when responding to user-reported failures.

We expect adoption to start with teams already shipping on Canton (dApp integration, wallet apps, validator operators) and to spread as the bundle schema becomes a standard escalation artifact across SIGs.

---

## Rationale

**Why is this the right approach?**

This proposal **extends the existing Canton ecosystem** rather than replacing any component:

- Builds **on top of the Canton Ledger API** (completions, rejection payloads) — the stable, public surface that already exists. It does not fork the participant, the Daml runtime, or the synchronizer.
- **Reuses Canton's existing correlation-ID submission pattern**; the proposal contributes a propagation spec and reference instrumentation, not a new transport.
- **Complements existing observability** (logs, metrics, distributed tracing) by adding a Canton-aware diagnosis-and-bundle layer on top, rather than competing with logging or APM tooling.
- **Complements DPM Trace (PR #327) rather than duplicating it.** The two overlap on one layer only — both decode a Canton transaction against DAR metadata and both can export a bundle. Beyond that they do different jobs: DPM Trace is an interactive inspector (navigation, diffing across prepared/committed/failed states, source-linking); this proposal is a failure-classification and governed-escalation layer (categorized root cause with ranked next checks at a measured, published precision/coverage, plus a redacted, tenant-partitioned, TTL-governed bundle). The classification engine and the governed-sharing/privacy model have no counterpart in #327.
- The **bundle schema, redaction policy, and rejection-family taxonomy are open and versioned**, so existing tools — DPM Trace, CI runners, ticketing systems, IDEs — can consume them directly, with no lock-in to this project's API.

**Chosen structure — split, not merge or withdrawal.** DPM Trace is DPM-native and already owns the inspection and diff UX. The right structure is therefore a split: the classification taxonomy, decoder interface, bundle schema, and redaction policy are delivered as open components DPM Trace and other tooling can consume, while the populated classification engine and the operated governed store are the funded deliverable here. Exact component boundaries to be agreed with the Walnut team.

**Alternatives considered:**

- *Fold entirely into DPM Trace.* Rejected as the primary path: the governed multi-tenant store and the operated classification service are larger than a toolchain plugin should carry. The open components are contributed to DPM Trace instead.
- *Withdraw in favor of #327.* Rejected: #327 covers none of the failure-classification, measured-accuracy, or governed-sharing scope; withdrawing would leave those ecosystem gaps unfilled.
- *Build a parallel inspection / debugger UI.* Rejected: this would duplicate #327's presentation and navigation layer. Removed from scope (see §5).
- *Wait for a participant-internal "deep trace" API.* Rejected: no such universally available API exists today, timelines are unclear, and it would not solve sharing or redaction. This approach delivers value on the signal that already exists, and can incorporate richer signals additively if they appear later.

---

## Copyright

This proposal text is licensed under **CC0-1.0**. All code and published artifacts (bundle schema, decoder rules, fixtures, taxonomy, playbooks) are licensed under **Apache-2.0**.
