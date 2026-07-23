## Development Fund Proposal — Canton Failure-Classification Engine

**Author:** Jitin Jain (InfraSingularity)  
**Status:** Draft (amended)  
**Created:** 2026-05-04  
**Updated:** 2026-07-23  
**Label:** `daml-tooling`  
**Champion:** TBD

---

## Abstract

A Canton-native, **community-extensible failure-classification engine** that turns failed or rejected Ledger API submissions into a deterministic, categorized root cause with ranked next checks — and lets any team contribute new decoders and diagnoses to a shared, versioned **knowledge base** without engine access. Seeded from real production Canton failures and grown by the ecosystem, it aims to move time-to-root-cause on covered failures from hours to minutes. The extensibility layer is designed to be robust by construction: decoders are declarative data (not code), every contribution is fixture-gated and regression-checked in CI, resolution is deterministic, and decoders are version-gated against Canton's evolution so the knowledge base does not rot. It **complements DPM Trace (PR #327)**: DPM Trace inspects, navigates, and diffs transactions; this engine classifies *why a submission failed and what to check*, and exposes the taxonomy, decoder format, and evaluation harness as open components DPM Trace and other tooling can consume. The governed multi-tenant bundle store, shareable escalation bundles, transaction replay, and bespoke UI from the original submission are out of scope (see Scope Boundaries).

---

## Specification

### 1. Objective

Reduce time-to-root-cause for failed Canton submissions from hours to minutes, by producing a **deterministic, categorized diagnosis with ranked next checks**, delivered as a reference engine plus an **open, community-extensible knowledge base** of decoders that the ecosystem can grow safely.

Single objective: the failure-classification engine and the mechanisms that let the community add to its knowledge base and diagnoses. Presentation, navigation, diffing, and any shareable-artifact layer are out of scope (Scope Boundaries).

### 2. Implementation Mechanics

The work divides into **open components** (contributed, so the community and other tools build on them) and a **funded reference deliverable** (built and operated by InfraSingularity). All of it consumes the existing Canton Ledger API surface.

**Open components (published under Apache-2.0):**

- **Rejection-family taxonomy + declarative decoder format** — the open catalog of failure families and a versioned, schema-validated rule format (match on error code / rejection family / structured payload fields → primary diagnosis + 2–5 ranked next checks + playbook) that anyone can author **without touching engine internals**.
- **Public, versioned knowledge base** — taxonomy, decoders, and playbooks in a public repository with a changelog; extended by community pull requests.
- **Contribution + review pipeline** — every submitted decoder ships with fixtures and an expected classification, schema-validated and then run in **CI against the evaluation harness**; lightweight acceptance via the Daml tooling SIG keeps the canonical knowledge base coherent as it grows.
- **Public decoder corpus + evaluation harness** — the labeled ground-truth set the classifier is measured against. Labels come from **fault injection** (deterministic true labels — e.g. a deliberately missing controller has a known class) and **blind adjudication of real production rejections** (labeled without sight of the engine's output), split into a training set and a **frozen held-out set** contributors do not tune against. The harness computes the precision/coverage (risk-coverage) curve, the per-family confusion matrix, and confidence calibration, and runs on every contributed decoder.

**Funded reference deliverable:**

- **Reference classification engine** — deterministic and rules-based. It loads decoders from the knowledge base (plugin/registry model) and maps a rejection to a primary diagnosis + ranked next checks. Below its confidence threshold it returns `insufficient signal` and the observed facts — it never fabricates a category, and there is no LLM dependency for correctness. Ships with a **seed set of 6–8 decoders** across the named families, exposed via **API + CLI**. Its output (category, ranked next checks, decoded context) is returned to the requesting team for their own analysis.
- **Daml-aware decoding** — decoders read template ID, choice name (including interface choices), and act-as/read-as parties from the rejection and the client submission context, so they map to Daml/Canton rejection families directly (e.g. "missing controller authority", "contract not found / not visible", "package drift / vetting mismatch").

**Signal contract — grounded in what Canton actually exposes:**

- *Guaranteed (Ledger API):* completion status, error codes / rejection payloads, environment metadata; a client-supplied correlation ID where the client chooses to set one.
- *Optional (best-effort, only if the deployment exposes it):* gateway markers, participant logs.
- *Out of scope:* participant-internal execution traces and any inferred stage markers from undocumented internals.

**Extensibility & knowledge-base governance:**

The knowledge base is designed so the community can extend it **safely, deterministically, and without engine access**. Adding a diagnosis is a pull request; the mechanisms below close the gaps that would otherwise let community contributions degrade correctness or determinism:

- **Decoders are declarative data, not code.** A decoder is a versioned, schema-validated document — matcher predicates over the rejection (error code, family, structured payload fields) mapping to a category, confidence, ranked next checks, and a playbook. The engine interprets decoders; no contributed code executes in it, so community contributions carry no arbitrary-code-execution risk.
- **Fixture-gated, regression-proof contributions.** Every decoder ships positive fixtures (rejections it must classify) and negative fixtures (rejections it must not match). CI schema-validates, then runs the decoder against the frozen evaluation corpus: it must be correct on its fixtures and must not lower any existing family's measured precision. A contribution that regresses the corpus is rejected automatically.
- **Deterministic conflict resolution.** When several decoders match one rejection, resolution is deterministic — most-specific matcher first, ties broken by declared priority then confidence; irreducible ambiguity is surfaced as `ambiguous` rather than silently resolved. The same rejection + the same knowledge-base version always yields the same diagnosis.
- **Version-gating against Canton evolution.** Each decoder declares the Canton protocol / LF / error-code versions it applies to; the engine only applies a decoder to matching rejections, so decoders do not misfire as Canton changes and error codes evolve. Deprecation and supersession are first-class lifecycle states, so the knowledge base does not rot.
- **Namespacing: canonical / experimental / org-private.** Community-reviewed decoders form the canonical set; unreviewed contributions live in an experimental namespace (usable, clearly marked, never counted toward canonical precision); organizations keep private packs for internal or proprietary families without forking. Every diagnosis reports which namespace produced it.
- **Governed acceptance.** Promotion into the canonical set follows a documented rubric (has fixtures; no regression; actionable diagnosis; correct next checks; version-gated) reviewed via the Daml tooling SIG, with CODEOWNERS — lightweight but not ad hoc.
- **Versioned format + provenance.** The decoder-format schema is itself semver'd with a compatibility layer, so existing decoders keep working as the format evolves; each decoder records author, origin, date, and version applicability for auditability.
- **Optional, payload-free feedback loop.** Teams may opt in to report whether a diagnosis was correct on a real failure — aggregate signal only, no payloads or party data — to refine confidence calibration and flag decoders for review. Off by default; nothing leaves without explicit action.
- **Local reproducibility.** The full validation harness runs locally, so a contributor verifies a decoder end-to-end before opening a pull request.

### 3. Architectural Alignment

- Consumes the **Canton Ledger API** (rejection payloads, completions) — the stable, public signal surface. It does not fork the participant, the Daml runtime, or the synchronizer, and works across Canton deployments.
- **Open, versioned taxonomy, decoder format, and knowledge base** — the community and other tools (DPM Trace, CI runners, ticketing/IDE integrations) can consume and extend them without depending on this project's engine.
- **Complements DPM Trace (PR #327).** DPM Trace owns interactive inspection, navigation, diffing, and source-linking; this engine supplies the failure-classification layer and the community knowledge base it does not provide, and contributes the taxonomy, decoder format, and evaluation harness as open components DPM Trace can consume.
- Aligned with **CIP-0082** (Development Fund allocation) and **CIP-0100** (governance and review process).
- Relevant SIGs: **Daml Language & Developer Tooling**, **Canton APIs (Ledger API, SQL API, Admin API)**, **dApp Integration**.

### 4. Backward Compatibility

*No backward compatibility impact.* The engine is a net-new developer-tooling component — a library/CLI/API that takes a rejection and returns a diagnosis. It does not modify Canton protocol, node, ledger, or Daml runtime behavior, and requires no changes to existing submission flows to adopt.

### 5. Scope Boundaries

The following are explicitly **out of scope**, to keep the grant focused on ecosystem-general value:

- **A governed multi-tenant bundle store** (encrypted/tenant-partitioned storage, TTL, permalinks, cross-tenant isolation). *Rationale:* for a failed submission there is no cross-party information asymmetry to resolve — the submitting client already holds the fullest relevant view of the rejection, and preparation-stage errors are visible only to the submitter, so a "share across validators" store solves a problem that does not exist. (Present in the original submission; removed.)
- **Shareable / escalation diagnostic bundles** (cross-party sharing, submitter-to-counterparty pointers, cross-environment bundle comparison, ticket-attachment artifacts). *Rationale:* for a rejection the submitter already holds the fullest relevant view, so a shared artifact does not unlock information the requesting party lacks; these use cases were explored and set aside. The engine's diagnosis output serves the requesting team's own analysis; no shareable-bundle layer is built.
- **A bespoke web inspection / debugger UI.** DPM Trace and existing tooling provide presentation and navigation and consume the open components.
- **Transaction / localnet replay.** May be proposed separately if demand emerges.
- **Participant-internal execution tracing or a compiler debug-info format.** Not exposed as a stable API; not attempted.
- **Source-level line mapping.** Maps to *failure families*, not source spans; source-linking is DPM Trace's domain.

---

## Milestones and Deliverables

All week numbers are relative to grant acceptance (T+0).

### Milestone 1: Taxonomy, Decoder Format, Governance Rules & Evaluation Harness

- **Estimated Delivery:** Week 3
- **Focus:** Rejection-family taxonomy; declarative decoder-format schema + schema validation; the governance rules that make contribution robust — **deterministic conflict-resolution spec, version-gating scheme (Canton/LF/error-code applicability + deprecation lifecycle), and namespacing scheme (canonical / experimental / org-private)**; labeled decoder corpus (fault injection + blind-labeled real production rejections, with a frozen held-out split); evaluation harness that computes the precision/coverage curve, per-family confusion matrix, and calibration. All published under Apache-2.0.
- **Deliverables / Value Metrics:** A third party can author a schema-valid decoder against the published format without engine internals; the conflict-resolution, version-gating, and namespacing rules are specified and testable; the corpus and harness are consumable and runnable in CI by others; a **measured precision/coverage baseline** is published on the frozen held-out corpus, so M2's numeric target is set from what Canton's real rejection payloads support rather than asserted up front.
- **Staffing:** 2.0 FTE engineering × 3 weeks.

### Milestone 2: Reference Engine + Seed Decoders

- **Estimated Delivery:** Week 6
- **Focus:** Reference classification engine implementing **deterministic conflict resolution, version-gating, namespacing, and plugin/registry loading**; `insufficient signal` first-class; seed set of 6–8 decoders + per-family playbooks; API + CLI.
- **Deliverables / Value Metrics:** Each decoder ships with matcher rules, positive/negative fixtures, and unit tests in CI; the engine is deterministic (same rejection + same KB version → same diagnosis) and applies decoders only within their declared version range; on the frozen held-out corpus the engine hits the **committed point on the risk-coverage curve** — **macro-averaged precision ≥ 90% on emitted diagnoses, no covered family below 80%**, at a coverage (non-abstain rate) fixed at M1 from the baseline (floor ≥ 50% of covered-family failures) — with the per-family confusion matrix and confidence calibration published; a team using a decoder + playbook reaches a diagnosis without escalating to Canton experts on covered categories.
- **Staffing:** 2.0 FTE engineering × 3 weeks.

### Milestone 3: Contribution Pipeline, Docs, Validation & Community Launch — Complete

- **Estimated Delivery:** Week 10
- **Focus:** Full contribution + review pipeline (PR → schema-validate → CI run against the harness with no-regression gate → SIG rubric acceptance → engine loads it); experimental namespace + org-private packs + provenance; optional, payload-free feedback loop; local reproducibility of the full validation harness; golden-path docs + decoder-authoring guide + starter repo; validation on InfraSingularity's own production Canton failures; lean observability.
- **Deliverables / Value Metrics:** The contribution pipeline is demonstrated **end-to-end** — a new decoder is authored, schema-validated, CI-checked against the harness with no regression, accepted under the rubric, and loaded by the engine — proving the knowledge base is genuinely community-extensible with the loophole-closing guarantees enforced; docs + starter repo let a new team run a diagnosis and author a decoder; the engine is **validated on real rejection payloads from InfraSingularity's own production Canton operations** (confirmed-correct diagnoses on real failures). Independent uptake and external decoder contributions are pursued and **reported as a target (aim: 3 teams / contributors)**, not a release condition.
- **Staffing:** 1.5 FTE engineering + 0.25 FTE technical writer/DevRel × 4 weeks.

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on **ecosystem value**, not artifact delivery alone:

- **Community extensibility (loophole-closed):** a third party can add a decoder to the knowledge base **without forking the engine**, demonstrated end-to-end, with the robustness guarantees enforced — declarative (no contributed code executes in the engine), fixture-gated with an automated no-regression check, deterministic conflict resolution, version-gated against Canton/LF/error-code applicability, and namespaced (canonical / experimental / org-private) with governed acceptance via the SIG rubric. External contributions are pursued and reported as a target (aim: 3), not a gate.
- **Adoption & real-world function:** the committed criterion is that the engine is **validated on real rejection payloads from InfraSingularity's own production Canton operations**, with confirmed-correct diagnoses on real failures. **Independent adoption is a reported target, not a gate** — with no design partners committed and a short usable window, payment is not held against external teams' timelines. Consumption by DPM Trace is an explicit target where timelines align.
- **Diagnostic effectiveness (selective classification):** measured on a **frozen held-out corpus** labeled by **fault injection** and **blind adjudication of real production rejections**. On emitted (non-abstain) diagnoses: **macro-averaged precision ≥ 90%**, **no covered family below 80%**, at a **coverage fixed at M1** from the baseline (committed floor ≥ 50% of covered-family failures). Below threshold the engine returns `insufficient signal`. The **precision/coverage curve, per-family confusion matrix, and confidence calibration** are published; precision is reported per confidence bucket. (Precision is the internal build-quality gate; extensibility and adoption are the ecosystem-value measures.)
- **Time-to-root-cause:** measured on real failure cases (including InfraSingularity's own production operations, plus any participating teams), **median time from failed submission to identified root cause for covered categories drops below 30 minutes**.
- **Support load:** on covered categories, a measurable reduction in "send me your logs" round-trips is reported (own operations, and any participating teams).
- **Open artifacts:** taxonomy, decoder format, decoders, fixtures, evaluation harness, governance rules, and playbooks published under **Apache-2.0** (proposal text under **CC0-1.0**).

---

## Funding

**Total Funding Request: 720,000 CC**

### Payment Breakdown by Milestone

| Milestone | Scope | Amount (CC) |
| --- | --- | --- |
| M1 | Taxonomy, Decoder Format, Governance Rules & Evaluation Harness | 180,000 |
| M2 | Reference Engine + Seed Decoders | 280,000 |
| M3 | Contribution Pipeline, Docs, Validation & Community Launch | 260,000 |
| **Total** | | **720,000** |

Each milestone is paid only upon committee acceptance.

### Payment Structure — Delivery vs Verified Outcome

Each milestone's payment is split 50% on delivery of the artifacts and 50% on an independently verifiable outcome, so that **half of the total (360,000 CC) is gated on measured value** rather than artifact delivery.

| Milestone | Amount (CC) | Delivery tranche | Outcome tranche (release condition) |
| --- | --- | --- | --- |
| M1 | 180,000 | 130,000 | 50,000 — measured precision/coverage baseline published on the frozen held-out corpus; taxonomy/format/governance-rules/corpus consumed by ≥ 1 external tool or validated in CI |
| M2 | 280,000 | 130,000 | 150,000 — on the frozen held-out corpus: **macro precision ≥ 90% on emitted diagnoses**, no covered family below 80%, at the M1-fixed coverage (≥ 50% floor); determinism and version-gating verified; risk-coverage curve + confusion matrix + calibration published |
| M3 | 260,000 | 100,000 | 160,000 — contribution pipeline demonstrated end-to-end (decoder authored → schema-validated → CI no-regression → SIG-accepted → loaded); engine validated on **real production failures from InfraSingularity's own Canton operations** (confirmed-correct diagnoses) with median TTRC **< 30 min**. Independent uptake / external contributions reported as a target (aim: 3), not a release condition |
| **Total** | **720,000** | **360,000 (50%)** | **360,000 (50%)** |

### Volatility Stipulation

Project duration is **under 6 months** (10 weeks). Should the timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility.

---

## Co-Marketing

Upon release, InfraSingularity will collaborate with the Foundation on:

- Announcement coordination at **feature-complete (Week 6)** and at **community launch (Week 10)**
- A **technical case study** showing before/after time-to-root-cause on at least one real failure class
- A **contribution guide and "call for decoders"** inviting the community to extend the knowledge base
- Conference / community talk submissions to relevant Canton and Daml developer venues

---

## Motivation

**Why is this valuable to the Canton ecosystem?**

Developer-velocity tooling is a force multiplier for Canton adoption. Failed transactions on Canton are uniquely hard to diagnose because root cause depends on Canton-specific context (parties, act-as/read-as, disclosure/visibility, package vetting, environment drift) that no single log line surfaces — and today there is **no shared, growing knowledge base of these failure modes**. Every team re-learns the same rejections from scratch. A community-extensible classification engine turns that tacit, repeatedly-relearned knowledge into a versioned, machine-checkable asset that compounds as the ecosystem contributes to it.

**Estimated portion of the ecosystem that benefits:**

- **~100% of dApp teams building on Canton** hit at least one targeted failure category during integration and on every environment promotion. Direct beneficiaries.
- **~80% of infra / support teams** spend material time triaging Canton-specific failures; a categorized diagnosis with ranked next checks directly replaces that guesswork.
- **CI pipelines** for any team running Canton integration tests can classify a failure automatically on a failed run.
- **Tooling authors (including DPM Trace) and operators** consume the open taxonomy, decoder format, and knowledge base rather than each rebuilding failure-diagnosis logic.

Adoption is expected to start with teams already shipping on Canton and to compound as the knowledge base grows through community contributions.

---

## Rationale

**Why is this the right approach?**

This proposal **extends the existing Canton ecosystem** rather than replacing any component:

- Consumes the **Canton Ledger API** (completions, rejection payloads) — the stable, public surface. It does not fork the participant, the Daml runtime, or the synchronizer.
- **Complements existing observability** (logs, metrics, tracing) by adding a Canton-aware diagnosis layer on top, rather than competing with logging or APM tooling.
- **Complements DPM Trace (PR #327) rather than duplicating it.** The two overlap only on decoding a transaction against DAR metadata. Beyond that they do different jobs: DPM Trace is an interactive inspector (navigation, diffing, source-linking); this is a classification engine plus a community knowledge base (categorized root cause with ranked next checks at a measured, published precision/coverage). The classification engine and the extensible knowledge base have no counterpart in #327.
- **Community-extensible by design, and robust by construction.** The taxonomy, decoder format, knowledge base, evaluation harness, and governance rules are open and versioned, so the ecosystem — not just InfraSingularity — grows diagnostic coverage; and the loophole-closing guarantees (declarative decoders, fixture-gated no-regression CI, deterministic resolution, version-gating, namespacing, governed acceptance) keep quality and determinism intact as it grows. This is what makes it ecosystem infrastructure rather than a single vendor's tool.

---

## Copyright

This proposal text is licensed under **CC0-1.0**. All code and published artifacts (taxonomy, decoder format, decoders, fixtures, evaluation harness, governance rules, playbooks) are licensed under **Apache-2.0**.
