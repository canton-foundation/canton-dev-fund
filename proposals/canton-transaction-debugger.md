## Development Fund Proposal — Canton Transaction Debugger

**Author:** Jitin Jain (InfraSingularity)
**Status:** Draft
**Created:** 2026-05-04
**Label:** `daml-tooling`
**Champion:** TBD

---

## Abstract

A Canton-native Transaction Debugger that converts failed Ledger API submissions into a deterministic, human-readable diagnosis and a sanitized, shareable **debug bundle**. It builds on Canton's existing rejection-payload and correlation-ID surface — it does not fork or replace any participant, ledger, or runtime component — and gives application teams, infra/support teams, and CI owners a portable artifact for root-cause analysis. Optional, tightly-scoped localnet replay is included as a bounded follow-on milestone.

---

## Specification

### 1. Objective

Reduce time-to-root-cause for failed Canton transactions in privacy- and authorization-heavy scenarios from hours to minutes, by producing a **deterministic decoded diagnosis** and a **sanitized, shareable debug bundle** for every failed submission.

Single objective: build the debugger and its bundle artifact. Replay is a small, bounded follow-on (Milestone 6) for a clearly listed category — not a competing objective, and not gating MVP value.

### 2. Implementation Mechanics

Four components, all sitting on top of the existing Canton Ledger API surface:

- **Trace Collector** — ingests rejection payloads and structured client/gateway markers keyed by a client-supplied correlation ID; assembles a normalized Trace Artifact; applies redaction and TTL.
- **Decoding Engine** — rules-based and deterministic. A registry of decoders maps Canton/Daml rejection families (auth/scope, act-as/read-as, disclosure/visibility, malformed command, missing choice args, package vetting drift, environment drift) to a primary diagnosis sentence + 2–5 ranked next checks. Unknown cases return `insufficient signal` — the engine never fabricates a category. No LLM dependency for correctness.
- **Debugger UI / API** — opens a Debug Session by correlation ID and shows the decoded diagnosis, a sanitized payload viewer, a stage timeline (only **observed** stages; missing stages are explicitly labeled "not observable"), and a one-click bundle export. Tenant-scoped permalinks with access checks.
- **Replay CLI (scoped follow-on)** — consumes a Debug Bundle and replays a small set of supported categories on localnet (e.g. malformed command, scope/header issues, package-id mismatch). Unsupported categories are deterministically refused with a clear reason.

**Signal contract — grounded in what Canton actually exposes:**

- *Guaranteed (Ledger API):* completion status, error codes / rejection payloads, client-supplied correlation ID, environment metadata.
- *Optional (best-effort, only if the deployment exposes it):* gateway markers, participant logs.
- *Out of scope:* participant-internal execution traces and any inferred stage markers from undocumented internals.

**Bundle format:** versioned JSON with checksum, sanitized request inputs, environment metadata (packages, party topology pointers, client version), error payloads, and decoded category. Storage is encrypted-at-rest, tenant-partitioned, with a strict default TTL.

**Daml-aware decoding:** bundles capture template ID, choice name (including interface choices), and act-as/read-as parties from the client submission context, so decoders map to Daml/Canton rejection families directly (e.g. "missing controller authority", "contract not found / not visible", "package drift / vetting mismatch").

### 3. Architectural Alignment

- Builds on the **Canton Ledger API** (rejection payloads, completions) — the stable, public signal surface — rather than depending on participant internals. Works across all Canton deployments.
- **Correlation ID propagation** follows existing Canton command submission patterns; the proposal contributes a propagation spec and reference instrumentation, not a new transport.
- **Open, versioned debug bundle schema** — other tools (CI runners, ticketing integrations, IDE extensions) can consume it without a dependency on this project's UI.
- Aligned with **CIP-0082** (Development Fund allocation) and **CIP-0100** (governance and review process).
- Relevant SIGs: **Daml Language & Developer Tooling**, **Canton APIs (Ledger API, SQL API, Admin API)**, **dApp Integration**.

### 4. Backward Compatibility

*No backward compatibility impact.* The debugger is a net-new developer-tooling layer. It does not modify Canton protocol, node, ledger, or Daml runtime behavior. Adopting it requires only adding a correlation ID to client submissions — a non-breaking change for existing integrations.

---

## Milestones and Deliverables

All week numbers are relative to grant acceptance (T+0).

### Milestone 1: Foundations — schemas, correlation IDs, redaction

- **Estimated Delivery:** Week 2
- **Focus:** Versioned Trace Artifact + Debug Bundle schemas; correlation ID propagation spec; deterministic redaction policy; decoder fixture corpus + CI test harness.
- **Deliverables / Value Metrics:** Schemas published with changelog; correlation ID round-trips end-to-end (client → collector → stored artifact → exported bundle); redaction is deterministic and tested on fixtures; any team instrumenting against this spec can produce a valid bundle.

### Milestone 2: Artifact Pipeline — ingestion, secure storage, export

- **Estimated Delivery:** Week 5
- **Focus:** Collector / ingestion API with correlation-ID indexing; encrypted, tenant-partitioned storage with TTL; bundle export (UI + API) with checksum.
- **Deliverables / Value Metrics:** A failed submission produces a stored, retrievable artifact by correlation ID; cross-tenant access is blocked (positive/negative tests); TTL enforced; exported bundle checksum verifies; first ecosystem teams can attach bundles to tickets.

### Milestone 3: Decoding Engine + Playbooks

- **Estimated Delivery:** Week 8
- **Focus:** Decoder registry + 6–8 decoders (auth/scope, act-as/read-as, disclosure/visibility, malformed command, missing choice args, package/vetting drift, env drift); per-category playbooks (symptoms, checks, escalation data).
- **Deliverables / Value Metrics:** Each decoder ships with matcher rules, fixtures, and unit tests in CI; "unknown / insufficient signal" is a first-class outcome; teams using the decoder + playbook reach a diagnosis without escalating to Canton experts on covered categories.

### Milestone 4: Debugger UI — sessions, bundle viewer, export

- **Estimated Delivery:** Week 10
- **Focus:** Debug Session page (decoded diagnosis + sanitized payload + observed-only timeline); tenant-scoped permalinks with access checks; bundle viewer + export from UI.
- **Deliverables / Value Metrics:** From a correlation ID, an authorized user reaches an exported bundle in ≤ 2 clicks; unauthorized access is blocked; timeline never fabricates stages.

### Milestone 5: Hardening, Docs, Adoption — MVP Complete

- **Estimated Delivery:** Week 12
- **Focus:** Security/privacy review (threat model, redaction review, access checklist); golden-path docs (instrument → capture → diagnose → share); CI integration example; starter repo / sample app instrumentation.
- **Deliverables / Value Metrics:** A new team can integrate correlation IDs and produce a bundle using docs + starter repo; review comments closed out (accept/reject documented); **at least 3 ecosystem teams adopt the bundle format** during the grant period.

### Milestone 6: Scoped Replay + Reliability Hardening — funded follow-on

- **Estimated Delivery:** Week 14
- **Focus:** Replay CLI for one supported category end-to-end (e.g. malformed command / missing choice args); metrics dashboards (bundle creation rate, decode success rate, p95 latency, error breakdown); backpressure and spike handling; load test plan and incident runbook.
- **Deliverables / Value Metrics:** Replay CLI deterministically refuses unsupported categories with a clear reason; SLO targets documented and measured under load; runbook covers top operational failure modes.

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on **ecosystem value**, not artifact delivery alone:

- **Adoption:** at least **3 independent Canton ecosystem teams** integrate the debugger and produce bundles within the grant period.
- **Diagnostic effectiveness:** for the 6–8 covered failure categories, decoders return a correct primary diagnosis on a published fixture corpus with **≥ 90% precision**, with explicit "unknown" outcomes for everything else (no fabricated categories).
- **Time-to-root-cause:** measured on participating teams, **median time from failed submission to identified root cause for covered categories drops below 30 minutes** (from a multi-hour baseline).
- **Support load:** participating teams report a measurable reduction in "send me your logs" round-trips on covered categories.
- **Privacy posture:** redaction policy review signed off; cross-tenant access tests pass; TTL enforcement verified.
- **Open artifacts:** bundle schema, decoder rules, fixtures, and playbooks published under **Apache-2.0** (proposal text under **CC0-1.0**).

---

## Funding

**Total Funding Request: 1,430,000 CC**

### Payment Breakdown by Milestone

| Milestone | Scope | Amount (CC) |
| --- | --- | --- |
| M1 | Foundations | 150,000 |
| M2 | Artifact Pipeline | 260,000 |
| M3 | Decoding Engine + Playbooks | 240,000 |
| M4 | Debugger UI | 230,000 |
| M5 | Hardening, Docs, Adoption (MVP complete) | 160,000 |
| M6 | Scoped Replay (190k) + Reliability Hardening (200k) | 390,000 |
| **Total** | | **1,430,000** |

Each milestone is paid only upon committee acceptance. M5 marks MVP completion; M6 is a separately scoped reliability and replay layer that delivers production-grade operational characteristics on top of MVP.

### Volatility Stipulation

Project duration is **under 6 months** (14 weeks). Should the project timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility.

---

## Co-Marketing

Upon release, InfraSingularity will collaborate with the Foundation on:

- Announcement coordination at **MVP completion (Week 12)** and at the end of the follow-on hardening (Week 14)
- A **technical case study** showing before/after time-to-root-cause on at least one real participating team
- A **developer walkthrough** (post + short demo) covering integration, bundle anatomy, and the decoder playbook flow
- Conference / community talk submissions to relevant Canton and Daml developer venues

---

## Motivation

**Why is this valuable to the Canton ecosystem?**

Developer-velocity tooling is a force multiplier for Canton adoption. Failed transactions on Canton are uniquely hard to diagnose because root cause depends on Canton-specific context (parties, act-as/read-as, disclosure/visibility, package vetting, environment drift) that no single log line surfaces. Today this cost is paid by every dApp team, every infra/support team, and every escalation back-and-forth.

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
- The **bundle schema is open and versioned**, so existing tools (CI runners, ticketing systems, IDEs) can consume it directly — no lock-in to this project's UI.

**Alternatives considered:**

- *Wait for a participant-internal "deep trace" API.* Rejected: no such universally available API exists today, timelines are unclear, and it would not solve sharing or redaction. Our approach delivers value on the signal that already exists, and can incorporate richer signals additively if they appear later.
- *Generic logging / APM (Datadog, OpenTelemetry alone).* Rejected as a complete solution: these are excellent for transport but do not understand Canton/Daml rejection semantics, do not produce sanitized portable bundles, and cannot translate "missing controller authority" into an actionable next check. We **integrate** with these rather than replace them.
- *An LLM-only "explain my error" tool.* Rejected as the core: non-deterministic, unauditable, and weak on privacy. Decoding must be deterministic and testable; LLMs can later layer on top of bundles for natural-language summarization without being load-bearing.
- *A multi-tier "easy / harder / much harder" scope (deep replay, full simulation, etc.).* Rejected per the Tech & Ops Committee guidance: this proposal has a **single objective** — the debugger and bundle artifact. Scoped replay is included only as a small, bounded follow-on with explicitly listed supported categories.

---

## Team

Built by **InfraSingularity** — combines hands-on Daml contract development and production Canton operations: the two competencies needed to build a privacy-aware Canton Transaction Debugger. We have shipped Daml-based projects (Prediction Market, Temple SDK) and operate institutional-grade Canton validator infrastructure with secure deployment patterns, upgrade discipline, and monitoring.

- GitHub: [infrasingularity/Prediction-market](https://github.com/infrasingularity/Prediction-market)
- GitHub: [infrasingularity/Temple-sdk](https://github.com/infrasingularity/Temple-sdk)

| Role | Name | LinkedIn | Location |
| --- | --- | --- | --- |
| Product Lead / CEO | Jitin Jain | [linkedin.com/in/jitinjain1](https://www.linkedin.com/in/jitinjain1/) | USA |
| Tech Lead / Backend | Amit Pandey | [linkedin.com/in/amit-pandey-00231a200](https://www.linkedin.com/in/amit-pandey-00231a200/) | India |
| Full-stack / UI Engineering | Vitesh Malhotra | [linkedin.com/in/viteshmalhotra](https://www.linkedin.com/in/viteshmalhotra/) | India |
| DevRel / Docs + Playbooks | Ankit Malhotra | [linkedin.com/in/ankitmalhotra-](https://www.linkedin.com/in/ankitmalhotra-/) | India |
| Security / Privacy Reviewer | In progress (Milestone 5, bounded) | — | USA (Canton-affiliated firm) |

**Staffing assumptions (mapped to milestones):**

- Tech Lead / Backend: ~1.0 FTE across Weeks 1–10 (Milestones 1–4)
- Full-stack / UI: ~1.0 FTE across Weeks 3–10 (Milestones 2–4)
- DevRel / Docs: ~0.5 FTE across Weeks 6–12 (Milestones 3–5)
- Security / Privacy reviewer: bounded engagement (Milestone 5, 2 cycles)

**1.0 FTE** = ~40 focused hrs/week of project time; **0.5 FTE** = ~20 focused hrs/week. The grant pays only for allocated project hours at project billing rates (loaded cost, specialized expertise premium, overhead, tools, security review cycles).

---

## Risks & Mitigations

| Risk | Mitigation |
| --- | --- |
| Privacy / sensitive data exposure | Strict redaction, minimization, encryption-at-rest, tenant partitioning, short default TTL |
| Signal limitations (no deep participant trace) | Build on Ledger API + correlation IDs; "not observable" is a first-class UI state; richer signals are additive when they appear |
| Replay fidelity | Localnet-first; explicit supported categories; deterministic refusal otherwise; replay is a follow-on, not MVP-gating |
| Adoption | Ship starter repo, CI example, and per-category playbooks alongside MVP; partner with 3+ ecosystem teams during Milestones 4–5 |

---

## Open Questions

- Minimum viable signal set we can rely on from participant / ledger side across Canton deployments (reason codes, optional stage markers).
- Default retention window the ecosystem is comfortable with for stored artifacts.
- Which categories qualify as "supported for replay" in MVP versus decode-only.

---

## License

This proposal is dedicated to the public domain under [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/). Any software artifacts produced under this grant will be licensed under **Apache-2.0**.
