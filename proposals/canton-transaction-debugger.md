## Development Fund Proposal — Canton Transaction Debugger

**Author:** Jitin Jain (InfraSingularity)
**Status:** Draft
**Created:** 2026-05-04
**Label:** `daml-tooling`
**Champion:** @v9n

---

## Abstract

A Canton-native Transaction Debugger that converts failed Ledger API submissions into a deterministic, human-readable diagnosis and a sanitized, shareable **debug bundle**. It builds on Canton's existing rejection-payload and correlation-ID surface — it does not fork or replace any participant, ledger, or runtime component — and gives application teams, infra/support teams, and CI owners a portable artifact for root-cause analysis. Optional, tightly-scoped localnet replay is included as a bounded follow-on milestone.

---

## Specification

### 1. Objective

Reduce time-to-root-cause for failed Canton transactions in privacy- and authorization-heavy scenarios from hours to minutes, by producing a **deterministic decoded diagnosis** and a **sanitized, shareable debug bundle** for every failed submission.

Single objective: build the debugger and its bundle artifact. Replay is a small, bounded inclusion within Milestone 3 for a clearly listed category — not a competing objective, and not gating MVP value.

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

### 3. Unique Solutions

The mechanics below are the novel, differentiating elements of the build. They elaborate on the components in §2 and map directly to the milestones; they are stated at the technical level reviewers need to assess feasibility.

**1. Failure-first diagnosis engine.**
The inputs are the artifacts a rejected submission actually produces: (a) the synchronous gRPC error returned by the Command / CommandSubmission service, and (b) the asynchronous `Completion` from the completion stream (`/v2/commands/completions`), whose `google.rpc.Status` carries the Canton error code, its numeric `ErrorCategory`, retryability metadata, and — where present — the OpenTelemetry trace id, alongside the **client-supplied correlation ID** that is the spine of every bundle. The Decoding Engine (Milestone 3) parses the self-describing error code (`error-id` + `ErrorCategory` + retryable flag) and deterministically resolves the (code, category, context) tuple against the decoder registry, mapping each covered rejection family — authorization / act-as / read-as, disclosure / visibility, malformed command / missing choice args, package-vetting drift, environment drift — to a primary plain-language cause, the responsible processing phase **where observable**, and 2–5 ranked next checks. Unknown inputs return `insufficient signal`; the engine never fabricates a category, and correctness carries no LLM dependency. Output is the inference itself, not a raw dump.

**2. Trace-id log correlation across nodes (best-effort, observed-only).**
Canton propagates OpenTelemetry trace context (trace-id / span-id) through the request lifecycle and emits it in structured (JSON / logback) logs on participant and synchronizer (sequencer, mediator) nodes. **Where a deployment exposes these logs — an optional, best-effort signal, never assumed** — the tool filters by the trace id taken from the completion, orders the spans causally, and reconstructs as much of the lifecycle (submission → confirmation request → confirmation responses → mediator verdict → completion) as is **actually observable**; any stage absent from the available signal is labelled "not observable" rather than inferred. This keeps the feature consistent with the Signal Contract in §2: node logs are never a hard dependency. The correlation logic is built against the log artifacts production Canton validators actually emit, drawn from InfraSingularity's live operation, not from assumed formats.

**3. Privacy-aware, shareable debug bundles.**
Under Canton's sub-transaction privacy model each participant holds only the projection (its sub-views) of a transaction it is a stakeholder or witness to; the mediator sees confirmation results, not view contents. A bundle is therefore assembled **per party** from locally available data and redacted before it leaves the host: contract arguments, observer / party identifiers, and any payload the holder is not authorized to disclose are stripped or one-way hashed, leaving a shareable skeleton — error code, `ErrorCategory`, processing phase, template ID / choice name at redacted granularity, ordered timestamps, and the shared correlation / trace id — stored encrypted-at-rest, tenant-partitioned, under a strict default TTL. Because the correlation id is common across parties, two participants with different visibility can exchange their respective redacted bundles and align on the same failure without either side leaking private state. No general-purpose or chain-agnostic debugger addresses this, because the constraint is specific to Canton's privacy architecture.

**4. Prepared-vs-failed diff for interactive submissions** *(additive future extension — not a funded milestone; out of scope for M1–M6).*
For externally-signed / interactive submissions prepared via the interactive submission service (prepare / execute), the bundle schema can be extended to also capture the prepared transaction and its hash, so a later extension can diff the prepared transaction against the failed execution to localize where execution diverged from what was prepared and signed — for example, a contract that went inactive between prepare and execute, or an authorization that no longer held. This item is listed for architectural completeness and forward-compatibility of the bundle schema only; it is explicitly **not** part of the funding or deliverables in this proposal.

**5. Non-invasive integration.**
The build consumes only signals that exist on the network today. It requires no compiler change to deliver its core value, forks no participant, synchronizer, or Daml-runtime component, and emits an open, versioned bundle that downstream committed-transaction inspection, CI, ticketing, and visualization tools can consume directly — complementing those layers rather than duplicating them.

### 4. Architectural Alignment

- Builds on the **Canton Ledger API** (rejection payloads, completions) — the stable, public signal surface — rather than depending on participant internals. Works across all Canton deployments.
- **Correlation ID propagation** follows existing Canton command submission patterns; the proposal contributes a propagation spec and reference instrumentation, not a new transport.
- **Open, versioned debug bundle schema** — other tools (CI runners, ticketing integrations, IDE extensions) can consume it without a dependency on this project's UI.
- Aligned with **CIP-0082** (Development Fund allocation) and **CIP-0100** (governance and review process).
- Relevant SIGs: **Daml Language & Developer Tooling**, **Canton APIs (Ledger API, SQL API, Admin API)**, **dApp Integration**.

### 5. Backward Compatibility

*No backward compatibility impact.* The debugger is a net-new developer-tooling layer. It does not modify Canton protocol, node, ledger, or Daml runtime behavior. Adopting it requires only adding a correlation ID to client submissions — a non-breaking change for existing integrations.

---

## Milestones and Deliverables

All week numbers are relative to grant acceptance (T+0).

### Milestone Overview & Funding Breakdown

| Milestone | Duration (cumulative) | CC Requested | Focus | Key Team Effort |
| --- | --- | --- | --- | --- |
| **M1** | Weeks 1–3 | **350,000** | Planning, Privacy Architecture & Core Bundle/Decoding Engine | 2.5 engineer-weeks (Amit lead + Vitesh) |
| **M2** | Weeks 4–7 | **400,000** | Decoding Engine + Privacy-Aware Bundles + Initial UI/Visualizer | 3 engineer-weeks (Amit + Vitesh full) |
| **M3** | Weeks 8–11 | **450,000** | Replay Feature, Polish, Testing, Security Review + Initial Docs | 3 engineer-weeks (full team + Ankit docs) |
| **M4** | Weeks 12–15 | **700,000** | Public Launch, Adoption Campaign & Impact Measurement (major chunk) | 3.5–4 engineer-weeks (Ankit DevRel heavy + full support) |
| **Total** | **~15 weeks** | **1,900,000 CC** | — | — |

---

### Milestone 1 – Foundation & Core Engine (350k CC)

- **Estimated Delivery:** End of Week 3
- **Focus:** Requirements finalisation, privacy-safe debug bundle format, core decoding engine.
- **Deliverables:** Architecture doc + CIP alignment, working decoding prototype, privacy design review.
- **Acceptance Criteria:** Internal demo + peer review passed; privacy model validated against survey pain points.

### Milestone 2 – Engine + Visualization (400k CC)

- **Estimated Delivery:** End of Week 7
- **Focus:** Full decoding + privacy bundles + basic UI/visualizer for authorized views.
- **Deliverables:** Functional CLI + early web UI, prepare/compare capability, basic tests.
- **Acceptance Criteria:** Successful internal + one beta test run; 80%+ code coverage on core engine.

### Milestone 3 – Advanced Features & Polish (450k CC)

- **Estimated Delivery:** End of Week 11
- **Focus:** Optional replay, full polish, security review, comprehensive documentation.
- **Deliverables:** Replay functionality, automated tests, security audit complete, initial user guide.
- **Acceptance Criteria:** All critical paths tested; documentation sufficient for self-onboarding; ready for public beta.

### Milestone 4 – Adoption, Launch & Ecosystem Validation (700k CC)

**Estimated Delivery:** 3–4 weeks after Milestone 3 acceptance

**Estimated Effort:** 3.5–4 engineer-weeks (heavy DevRel + support from full team) plus dedicated adoption-support window

**Focus:** Prove meaningful adoption and productivity impact among real Canton ecosystem developers and institutions, directly addressing the high-priority debugging and observability gaps identified in Canton's own 2026 Developer Experience Survey.

**Note:** This milestone is a direct by-product of the **Canton Network Developer Experience and Tooling Survey (Feb 2026)** in which 41 developers explicitly called for Tenderly-style visual debugging tools and complained about "parsing cryptic log files" for privacy-constrained transactions. We are already in advanced discussions with **three organizations actively building on Canton** (including a team from Goldman Sachs) who have expressed strong interest in piloting the tool and sharing feedback. Additional high-quality pilots will draw from our institutional NaaS clients and waiting list.

**Deliverables / Value Metrics:**

- Public v1.0 release of the Canton Transaction Debugger (privacy-aware debug bundles, decoding engine, UI visualizer, optional replay) with clear installation instructions for common setups (local Canton, participant nodes, Kubernetes NaaS).
- Comprehensive getting-started guide + advanced privacy-debug workflows (including bundle export, partial-view visualization, prepare/compare, and replay examples).
- Two short professional demo videos (one "from pain to solution" highlighting survey pain points + one hands-on walkthrough).
- Targeted outreach to survey participants, Canton/DAML maintainers, forum, and ecosystem channels, supported by our Canton All Scrapper/Notion tracker for visibility.
- Hands-on pilots and structured feedback from **at least 5 independent organizations/teams** (including institutional builders and serious dApp developers).
- Collection of anonymized + attributable testimonials from users (with emphasis on time savings and solved privacy-debug friction).
- Rapid fixes or documented workarounds for any adoption-blocking issues discovered during the window.
- Final **Adoption & Impact Report** (public) summarizing pilots, quantitative outcomes, direct quotes from ecosystem devs and institutions, and recommended next steps.

**Acceptance Criteria:**

The Tech & Ops Committee will evaluate completion based on verifiable ecosystem value, including:

- At least **5 independent organizations/teams** successfully execute key workflows (privacy bundle analysis, visualization of authorized views, prepare/compare, or replay) on their own Canton/DAML projects and confirm the tool accelerated debugging of privacy, authorization, or complex transaction issues.
- At least **3–4 structured testimonials** (can be anonymized where requested) from users explicitly referencing productivity impact and the survey pain points, e.g., "This finally replaces the cryptic log parsing highlighted in the Canton DevEx Survey — reduced a 3-day debug cycle to under 4 hours" or similar feedback from anonymous ecosystem devs and institutional teams.
- The getting-started materials enable a new or intermediate Canton developer to independently generate, visualize, and gain actionable insight from their **first meaningful trace** without any assistance from Infrasingularity.
- Publication of a transparent **Adoption & Impact Report** containing:
    - List of participating organizations (anonymized where needed) and workflows tested
    - Quantitative metrics (e.g., average reported debug-time reduction, satisfaction score)
    - Verifiable evidence (GitHub activity, public mentions, shared case snippets, or issue/PR links)
    - Direct quotes from both anonymous devs and named institutional pilots
- Any critical usability or happy-path blocking issue discovered during the adoption window is either fixed in v1.0/v1.1 or explicitly documented with a clear workaround in the public guide.

Ecosystem value will be measured by real adoption signals, productivity testimonials tied to the official Canton survey gaps, and concrete next-step recommendations that benefit the broader community.

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

**Total Funding Request: 1,900,000 CC**

### Payment Breakdown by Milestone

| Milestone | Scope | Amount (CC) |
| --- | --- | --- |
| M1 | Foundation & Core Engine | 350,000 |
| M2 | Engine + Visualization | 400,000 |
| M3 | Advanced Features & Polish (public-beta ready) | 450,000 |
| M4 | Adoption, Launch & Ecosystem Validation | 700,000 |
| **Total** |  | **1,900,000** |

Each milestone is paid only upon committee acceptance. M3 marks MVP / public-beta readiness; M4 covers the public launch, adoption campaign, and ecosystem validation window.

### Volatility Stipulation

Project duration is **under 6 months** (~15 weeks). Should the project timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility.

---

## Co-Marketing

Upon release, InfraSingularity will collaborate with the Foundation on:

- Announcement coordination at **MVP / public-beta readiness (end of Week 11)** and at the public launch milestone (Week 15)
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

- GitHub: infrasingularity/Prediction-market
- GitHub: infrasingularity/Temple-sdk

| Role | Name | LinkedIn | Location |
| --- | --- | --- | --- |
| Product Lead / CEO | Jitin Jain | linkedin.com/in/jitinjain1 | USA |
| Tech Lead / Backend | Amit Pandey | linkedin.com/in/amit-pandey-00231a200 | India |
| Full-stack / UI Engineering | Vitesh Malhotra | linkedin.com/in/viteshmalhotra | India |
| DevRel / Docs + Playbooks | Ankit Malhotra | linkedin.com/in/ankitmalhotra- | India |
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

This proposal is dedicated to the public domain under CC0-1.0. Any software artifacts produced under this grant will be licensed under **Apache-2.0**.
