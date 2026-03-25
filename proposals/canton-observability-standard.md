## Development Fund Proposal: Canton Observability Standard (COS) — Metrics, Traces, and Alerts Reference Specification

**Author:** blackthornlover <h@bitdynamics.me>, Zhe Li <zhe@bitdynamics.me>, Srikanth <srikanth@bitdynamics.me>
**Implementing Entity:** Bitdynamics
**Status:** Submitted
**Created:** 2026-03-25

---

## Abstract

This proposal requests funding for an open-source Canton Observability Standard (COS): a community specification and reference implementation that defines canonical metric names, trace span conventions, and production-grade alert rules for Canton node and application deployments.

Every team operating a Canton node today faces the same problem from scratch: there is no shared vocabulary for what to measure, no agreed span naming for distributed traces, and no baseline set of alert rules that operators can trust out of the box. The result is that each team builds a private, incompatible observability layer. Dashboards cannot be shared. Runbooks diverge. Alert fatigue is high because thresholds are guessed rather than derived from documented Canton semantics.

The proposed project, **Canton Observability Standard (COS)**, will provide:
- a versioned open specification for Canton node and application-layer metrics, trace spans, and alert rules
- reference exporters for Prometheus and OpenTelemetry that implement the specification
- a reference dashboard pack for Grafana and a reference alert pack compatible with Alertmanager and equivalent backends
- integration documentation and an operator guide targeting production deployments

The goal is not to replace Canton's existing internal instrumentation, not to build a hosted monitoring SaaS, not to dictate a single observability backend, and not to cover every possible Canton deployment topology on day one. The goal is to give the Canton ecosystem a shared, open, versioned observability vocabulary that reduces duplicated work, makes operator knowledge transferable, and lowers the cost of running Canton reliably in production.

---

## Specification

### 1. Objective

The objective is to reduce the observability cost of operating Canton nodes and multi-synchronizer applications by publishing a concrete, versioned specification and reference implementation that teams can adopt without building their own instrumentation vocabulary from scratch.

The intended outcome is that a Canton operator can:
- deploy the reference exporter alongside a Canton node and immediately expose a well-named, semantically documented metric set
- attach the reference dashboard pack to an existing Grafana or compatible instance and have a meaningful operational view without bespoke configuration
- enable the reference alert pack and receive actionable, low-false-positive alerts for the conditions most likely to indicate degraded node health
- contribute a Canton application that emits traces using the COS span naming convention and have those traces be legible in any OpenTelemetry-compatible backend without proprietary translation
- point a new operator at the operator guide and have that operator understand the signal landscape without reverse-engineering private dashboards

This proposal is explicitly framed as **ecosystem infrastructure** and a **shared open standard**, not a hosted monitoring product, not a Canton core protocol change, and not a SaaS observability platform.

### 2. Implementation Mechanics

The project will be delivered as:
- a versioned COS specification document covering metrics naming, label conventions, trace span naming, and alert rule semantics
- a reference Prometheus exporter and OpenTelemetry collector configuration implementing the specification
- a reference Grafana dashboard pack and Alertmanager-compatible alert rule pack
- an operator integration guide and contribution documentation

#### A. Scope Selection Guide

The standard is designed to occupy a well-defined layer in the Canton operational stack and to avoid overlapping with adjacent concerns.

Use **Canton's existing internal JVM and gRPC metrics** (already emitted by Canton nodes) as the raw instrumentation substrate. COS does not replace these signals. It names them canonically, documents their semantics, and groups them into actionable views.

Use **COS metric definitions** when:
- you need a stable, human-readable metric name that will not change with Canton internal refactors
- you need a documented semantic guarantee about what a counter, gauge, or histogram represents in Canton operational terms
- you need a shared vocabulary so that runbooks, dashboards, and alert rules written by one team can be understood and reused by another

Use **COS trace span conventions** when:
- a Canton application emits spans and you need those spans to be legible across participants and backends
- you need to correlate Ledger API request spans with synchronizer-level sequencing spans without custom translation

Use **COS alert rules** when:
- you need a production-grade starting point for node health alerting that encodes documented Canton operational semantics rather than generic infrastructure thresholds

This proposal therefore does **not** present COS as a replacement for Canton's raw instrumentation, Canton core telemetry decisions, or an operator's right to extend and customize for their own deployment. It presents COS as the shared naming and semantics layer that makes Canton observability transferable.

#### B. Reference Specification Scope

To keep the initial specification technically credible and reviewable, the reference scope is limited to:
- Canton participant node health and liveness signals
- Ledger API request latency, error rates, and throughput
- Synchronizer connectivity and sequencing lag
- Contract store depth and pruning state
- JVM resource signals relevant to Canton operational health (heap, GC pause, thread pool saturation)
- OpenTelemetry span naming conventions for Ledger API operations and Canton automation workflows

The project will prove one complete, internally consistent signal vocabulary rather than claim coverage of every possible Canton deployment topology, plugin architecture, or experimental feature flag.

#### C. Metric Naming Convention and Label Schema

The reference specification will define an explicit naming convention so that metrics from different Canton deployments are immediately comparable.

Metric names will follow the pattern:

```
canton_<subsystem>_<signal>_<unit>
```

where `<subsystem>` is one of `participant`, `synchronizer`, `ledger_api`, `sequencer`, `mediator`, or `automation`; `<signal>` describes the measured quantity; and `<unit>` follows Prometheus base-unit conventions (seconds, bytes, total).

Standard labels across all COS metrics will include, at minimum:
- `node_id` — stable identifier for the Canton node instance
- `synchronizer_id` — synchronizer identity where relevant
- `version` — Canton node version string
- `cos_version` — COS specification version the exporter implements

Additional per-metric labels will be defined in the specification with explicit cardinality guidance to prevent label explosion in high-cardinality deployments.

#### D. Trace Span Convention

The OpenTelemetry span convention will define:
- root span names for Ledger API operations (`canton.ledger_api.submit`, `canton.ledger_api.query`, etc.)
- child span names for sequencer submission and confirmation phases
- attribute names for `synchronizer_id`, `workflow_id`, `command_id`, and `party_id` where applicable
- span status and error attribute conventions aligned with OpenTelemetry semantic conventions

The goal is that a Canton application instrumented with COS span names produces traces that are legible in Jaeger, Zipkin, Grafana Tempo, and any other OpenTelemetry-compatible backend without proprietary translation or post-processing.

#### E. Alert Rule Semantics and Threshold Rationale

The reference alert pack will include rules for:
- participant node availability and Ledger API error rate
- synchronizer connectivity loss and reconnection delay
- sequencing lag relative to a configurable SLA threshold
- contract store pruning backlog exceeding a documented safe depth
- JVM heap and GC pause thresholds calibrated to Canton's known memory allocation patterns

Each alert rule in the specification will include:
- the metric expression and threshold
- a documented rationale explaining why the threshold is meaningful in Canton operational terms rather than an arbitrary default
- a severity classification (`critical`, `warning`, `info`)
- a suggested runbook link placeholder and escalation guidance

The design goal is low false-positive rate by default, with explicit tuning guidance for operators who need to tighten or relax thresholds for their deployment profile.

#### F. Reference Exporter and Dashboard Implementation

The reference Prometheus exporter will:
- expose all COS-specified metrics at a documented scrape endpoint
- implement label cardinality controls specified in the COS metric definitions
- ship as a single deployable artifact with documented configuration options
- include a compatibility matrix documenting which COS metric subsets are available for each supported Canton version range

The reference Grafana dashboard pack will:
- provide one overview dashboard covering participant health, Ledger API throughput, and synchronizer connectivity
- provide one detailed dashboard per major COS subsystem
- use only COS-specified metric names so dashboards are portable across any COS-compliant exporter deployment
- ship as versioned JSON files importable directly into Grafana without proprietary plugins

#### G. Explicitly Out of Scope

To keep the project feasible and non-overlapping, the following are explicitly out of scope:
- changes to Canton's internal instrumentation or core metric emission
- a hosted monitoring or alerting service
- a proprietary observability backend or storage system
- coverage of Canton experimental or preview features in the initial release
- bespoke enterprise integration adapters beyond Prometheus and OpenTelemetry
- security event monitoring or SIEM integration
- log aggregation or structured log schema standardization
- frontend application-layer business metrics beyond Canton node and Ledger API signals

### 3. Architectural Alignment

This proposal aligns with Canton's network-of-networks philosophy because operational transparency is a precondition for running interconnected Canton nodes reliably and for giving participants confidence that their counterparties' infrastructure is healthy.

It is aligned with Development Fund priorities because it delivers:
- shared infrastructure that reduces duplicated operational work across every Canton deployment
- a public-good specification that makes operator knowledge and tooling transferable
- a concrete reference implementation that other proposals can build on top of (reference applications, chaos testing frameworks, and HA failover tooling all depend on having a coherent observability layer)
- lower barriers to entry for new Canton operators who currently face a blank-slate instrumentation problem

This is ecosystem infrastructure, not a private monitoring product.

### 4. Delivery Readiness

The initial specification scope is bounded by deliberate choices. The reference implementation is restricted to:
- Prometheus and OpenTelemetry as the two dominant open observability backends
- Grafana as the dashboard target, given its near-universal adoption among Canton operators
- the participant node, Ledger API, and synchronizer connectivity subsystems as the first signal tier
- a single Canton version range (current stable and one prior) for exporter compatibility

This keeps the first deliverable reviewable and makes the early milestones easy to verify against observable outputs.

### 5. Delivery Feasibility

This proposal is intentionally narrow enough to be built and verified:
- one versioned specification document covering naming, labels, traces, and alert semantics
- one reference Prometheus exporter
- one OpenTelemetry collector configuration
- one Grafana dashboard pack with subsystem breakdowns
- one Alertmanager-compatible alert rule pack with documented thresholds
- one operator guide and contribution documentation

The implementation is technically meaningful but bounded. It does not attempt to solve all Canton operational concerns, cover every possible backend, or produce an enterprise-grade monitoring product.

### 6. Risks and Mitigations

- **Specification drift from Canton internals:** the spec will be versioned and will include a documented compatibility matrix. When Canton internal metric names change, the exporter layer absorbs the translation rather than requiring operators to update dashboards. The spec version and Canton version compatibility will be tracked explicitly.
- **Label cardinality explosion:** each metric definition in the spec will include explicit cardinality guidance. The reference exporter will implement configurable cardinality controls with safe defaults.
- **Alert fatigue from poorly calibrated thresholds:** each alert rule will include a documented operational rationale and a tuning guide rather than arbitrary defaults. The initial set will be biased toward lower false-positive rate over completeness, with the expectation that the community will extend it.
- **Adoption without contribution:** the spec will be published under an open license with a documented contribution process. The versioning model will be designed to allow community extensions without forking the canonical namespace.
- **Backend fragmentation:** by targeting Prometheus and OpenTelemetry as the two primary output formats, COS covers the overwhelming majority of production Canton deployments without committing to a proprietary backend.
- **Scope creep:** the initial release is explicitly limited to the participant node, Ledger API, and synchronizer connectivity signal tiers. Additional subsystems can be added in follow-on releases under the same versioned namespace.

### 7. Backward Compatibility

No backward compatibility impact on Canton itself. This project is entirely additive. The specification and reference exporter introduce no changes to Canton protocol behavior, core Canton data structures, or existing Canton node configuration.

Operators who adopt the exporter alongside an existing private dashboard setup can run both in parallel. The COS metric namespace is prefixed with `canton_` and uses the COS label schema, which does not conflict with Canton's existing internal metric names.

---

## Milestones and Deliverables

### Milestone 1: Specification Published and First Adopter Validated
- **Estimated Delivery:** 4 weeks
- **Adoption Goal:** At least one Canton operator team has reviewed the specification, provided written feedback incorporated into the final document, and confirmed the metric naming and label schema are legible in their existing stack without translation overhead.
- **Deliverables / Adoption Criteria:**
  - a versioned COS specification document covering metric naming conventions, standard label schema, per-metric semantic definitions, cardinality guidance, and unit conventions for the participant node, Ledger API, and synchronizer connectivity subsystems
  - a compatibility matrix documenting which COS metric subsets apply to each targeted Canton version
  - a contribution guide and amendment process that at least one external reviewer has used to submit a comment or improvement
  - written confirmation from at least one Canton operator that the specification is legible and maps cleanly to their deployment without requiring proprietary translation

### Milestone 2: Exporter Deployed and Emitting in a Live Environment
- **Estimated Delivery:** 5 weeks
- **Adoption Goal:** At least one Canton operator has deployed the reference Prometheus exporter or OpenTelemetry configuration against a real (non-sandbox) Canton node and confirmed that COS-specified metrics are appearing in their scrape target or trace backend with no manual remapping required.
- **Deliverables / Adoption Criteria:**
  - a reference Prometheus exporter implementing all Milestone 1 metric definitions, deployed and confirmed working against a live Canton participant node
  - a reference OpenTelemetry collector configuration validated against a real Canton Ledger API trace stream
  - a deployment guide covering Canton version compatibility, label tuning, and cardinality controls, reviewed by at least one operator who has followed it end to end
  - at least one operator-confirmed scrape or trace capture demonstrating COS metrics appearing correctly in a non-sandbox environment

### Milestone 3: Dashboards and Alerts Replacing at Least One Private Setup
- **Estimated Delivery:** 4 weeks
- **Adoption Goal:** At least one Canton operator team has imported the reference Grafana dashboard pack and Alertmanager alert rules into their production or staging environment, replacing or supplementing a previously private dashboard, and has confirmed the alerts are actionable with an acceptable false-positive rate.
- **Deliverables / Adoption Criteria:**
  - a reference Grafana dashboard pack imported and confirmed working by at least one operator in a non-sandbox Canton environment
  - an Alertmanager-compatible alert rule pack with all thresholds reviewed and adjusted by at least one operator for their deployment profile, with feedback incorporated into the published tuning guide
  - a reference alert runbook template that at least one operator has followed during a real or simulated alert condition
  - written operator confirmation that the shipped alerts are actionable and do not require immediate suppression due to false-positive noise

### Milestone 4: Standard Adopted by Multiple Independent Teams and Publicly Released
- **Estimated Delivery:** 3 weeks
- **Adoption Goal:** At least three independent Canton operator or application teams have adopted some portion of COS (specification, exporter, dashboards, or alert rules) and the project has been publicly released with documented adoption evidence, so that future teams can start from a validated baseline rather than a blank slate.
- **Deliverables / Adoption Criteria:**
  - at least three independent adoption confirmations documented in the public repository (operator testimonials, linked deployments, or recorded integration walkthroughs)
  - the full COS stack — specification, exporter, dashboard pack, alert pack, and operator guide — released as open source under a permissive license
  - a recorded end-to-end walkthrough demonstrating COS deployed against a multi-node Canton environment, from exporter through dashboard and alert, usable as an onboarding reference for future operators
  - at least one community contribution (issue, amendment, or extension) submitted and addressed through the published contribution process, demonstrating that the standard is live and extensible

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:
- a versioned COS specification document covering metric naming, label schema, trace span conventions, and alert rule semantics for the participant node, Ledger API, and synchronizer connectivity subsystems
- a reference Prometheus exporter that emits all specified metrics correctly, validated by at least one operator against a live Canton node
- a reference OpenTelemetry collector configuration implementing the COS trace span convention, validated by a working trace capture in a real Canton environment
- a reference Grafana dashboard pack confirmed working in at least one non-sandbox operator environment
- an Alertmanager-compatible alert rule pack with documented operational rationale for every rule and at least one operator-confirmed tuning review
- an operator guide covering deployment, configuration, and tuning for all shipped artifacts
- at least three independent adoption confirmations documented in the public repository
- the full project released as open source

Project-specific acceptance conditions:
- the specification must be versioned and include a documented process for community amendments
- the reference exporter must implement configurable cardinality controls rather than unbounded label sets
- all alert rules must include documented threshold rationale rather than undocumented numeric defaults
- the dashboard pack must use only COS-specified metric names so it is portable across any COS-compliant exporter deployment without modification
- the documentation must clearly state that COS is additive and does not require changes to Canton core instrumentation

---

## Funding

**Total Funding Request:** 1,600,000 CC

### Payment Breakdown by Milestone
- Milestone 1 _(Specification Published and First Adopter Validated)_: 350,000 CC upon committee acceptance
- Milestone 2 _(Exporter Deployed and Emitting in a Live Environment)_: 550,000 CC upon committee acceptance
- Milestone 3 _(Dashboards and Alerts Replacing at Least One Private Setup)_: 450,000 CC upon committee acceptance
- Milestone 4 _(Standard Adopted by Multiple Independent Teams and Publicly Released)_: 250,000 CC upon final release and acceptance

### Funding Rationale
- Milestone 1 is smaller because it produces a specification document and a first adopter validation rather than running software, but it is the most critical dependency: every subsequent artifact is only as good as the naming and semantics it implements.
- Milestone 2 is the largest because it requires both a deployable exporter and a validated OpenTelemetry configuration, each of which must be confirmed working against a real Canton node in an operator environment rather than a sandbox.
- Milestone 3 is substantial because dashboards and alert rules calibrated to Canton operational semantics — and confirmed actionable by a real operator — require genuine domain knowledge, iteration, and adoption effort to get right.
- Milestone 4 is smaller because it packages and documents the now-proven, operator-validated stack for the broader community rather than introducing a new technical layer.
- No hosted-service budget is requested in this proposal.

### Volatility Stipulation

If the project duration extends beyond 6 months due to Committee-requested scope changes, remaining milestones should be renegotiated for material CC/USD volatility. No hosted monitoring service budget is requested in this proposal. If a later stage justifies a broader specification covering additional Canton subsystems, a follow-on proposal can extend the COS namespace under the same versioning model.

---

## Maintenance and Evolution

The initial grant funds the specification, reference implementation, dashboards, alert rules, and public release. After release, the project will be maintained in the open through repository-based contribution workflows, issue tracking, and versioned releases.

The COS specification is designed to be versioned from day one so that breaking changes to metric names or label schemas can be managed through a documented deprecation cycle rather than silent incompatibility. The compatibility matrix will be updated with each Canton release that affects the emitted metric substrate.

The intended long-term path is to keep the specification aligned with Canton's evolving internal instrumentation as Canton matures. If appropriate, the specification may be adopted as a Foundation-endorsed standard and the reference exporter may be upstreamed into a broader ecosystem tooling repository. If that path is not immediately appropriate, the project will remain in a public standalone repository with versioned releases, contribution guidelines, and clear Canton version compatibility documentation so that external teams and operators can adopt and extend it with minimal friction.

### High-Level Architecture

COS is designed as a narrow standard with three layers:
- a versioned specification layer defining metric names, label schemas, trace span conventions, and alert rule semantics
- a reference implementation layer consisting of the Prometheus exporter, OpenTelemetry configuration, Grafana dashboard pack, and Alertmanager alert rule pack
- an operator documentation layer covering deployment, integration, and tuning for all shipped artifacts

At a high level, a Canton operator deploys the reference exporter alongside their Canton node. The exporter translates Canton's internal instrumentation into COS-specified metric names at the scrape endpoint. Grafana consumes those metrics using the portable dashboard pack. The Alertmanager alert rules fire against the same COS metric names. Canton applications can emit OpenTelemetry traces using the COS span naming convention and have those traces be legible in any compatible backend without custom translation.

The initial release covers participant nodes, Ledger API, and synchronizer connectivity. Additional subsystems can be added in follow-on releases without breaking the established namespace.

## Co-Marketing

Upon release, the implementing entity will collaborate with the Foundation on:
- announcement coordination
- a short technical write-up explaining the COS naming model, the alert calibration approach, and the correct extension process for community contributors
- one operator-facing walkthrough or demo

Specific commitments:
- publish integration guidance for teams building Canton applications who want to emit COS-compliant traces
- publish at least one end-to-end example showing a Canton node deployment instrumented with the full COS stack, from exporter through dashboard and alert

---

## Motivation

Canton's value proposition depends on networks of independently operated nodes reaching reliable, predictable outcomes together. But reliability is not observable by default. If every team operating a Canton node must independently decide what to measure, how to name it, and what thresholds are meaningful, then the operational cost of running Canton reliably is permanently higher than it needs to be — and the knowledge accumulated by experienced operators cannot be shared.

An open observability standard would give the Canton ecosystem:
- a common operational vocabulary that makes dashboards, runbooks, and alert rules transferable between teams and deployments
- a public-good baseline that new Canton operators can adopt on day one rather than spending weeks building private instrumentation
- a foundation for other ecosystem tooling — chaos testing frameworks, HA failover controllers, and automated health checks — to emit and consume signals in a consistent, interoperable way
- lower operational risk for the network as a whole, because degraded node conditions that are currently invisible until they cause failures become detectable earlier

This makes COS a strong candidate for Development Fund support because it is ecosystem infrastructure with compounding returns: every additional Canton deployment that adopts the standard increases the value of every other team's operational knowledge.

---

## Rationale

This proposal is intentionally scoped as a specification and reference implementation rather than a hosted monitoring product or a Canton core instrumentation effort. That discipline matters for three reasons:
- if Canton's internal metric emission changes, the specification and exporter absorb the translation rather than requiring all operators to update their dashboards simultaneously
- if teams need to extend the standard for proprietary deployment-specific signals, the versioned namespace and contribution process allow that without fragmenting the canonical core
- if the Foundation later decides to adopt COS as an endorsed standard, the versioned, open-source, reference-implementation-first approach makes that adoption path straightforward

The project is therefore designed to give Canton operators and application builders a shared observability foundation without claiming to solve every monitoring concern, cover every possible deployment topology, or produce a production-grade commercial monitoring product in one proposal.
