## Development Fund Proposal

### MeterKit for Canton

Pluggable metering, ledger reconciliation, and reference reward policies for application builders

Author: Auther Liu  
Status: Draft  
Created: 2026-04-18  
Label: tokenomics  

*(Alternative secondary tags for discovery: `canton-apis`, `dapp-integration`.)*

Proposed SIG alignment (for review routing per the [Proposal Review Process](../Development%20Fund%20Proposal%20Review%20Process.md)): primarily application developers (SDK, dApp backends, reconciliation); node operators may additionally be a natural fit for collector deployment and runbook content. The author welcomes reassignment if the Tech & Ops Committee prefers a different primary SIG.

Champion: Need Champion  

Per the [Development Fund README](../README.md), external contributors must have a Champion. The author will work with the Canton Foundation and relevant SIGs to identify a Champion before moving the proposal from Draft to Submitted. Until then, this field remains Need Champion.

---

## Champion & Pilot Recruitment

Champion: A Champion is an ecosystem participant who helps refine milestones, scope, and acceptance criteria and supports the proposal through review—not a funder and not necessarily a co-implementer. The author requests Foundation facilitation to match the proposal with a Champion aligned with tokenomics and application-building priorities.

Pilot sourcing: Milestone 2 requires two integrated applications (distinct entities or clearly separate codebases). Target pilot profiles include:

- API-backed B2B applications with measurable request volume  
- Consumer-facing dApps where privacy-preserving aggregates are acceptable  
- Operator-adjacent services that already maintain internal SLAs  

If signed pilot agreements are delayed, the author may request a schedule variance (not a scope increase) while continuing reconciliation hardening against committee-approved staged load that satisfies the same technical acceptance gates.

Author-controlled perimeter (for adoption metrics): repositories under the Lead’s personal GitHub user and any GitHub organization where the Lead is the sole maintainer or is listed as the primary maintainer in the milestone report. Dependencies that appear only inside this perimeter do not satisfy the “external repository” metric in Milestone 2; integrators outside that perimeter must own the importing repository.

---

## Abstract

Application builders on Canton need a repeatable, low-friction pattern for traffic accounting and for participating in application reward programs without re-implementing fragile ad-hoc telemetry, reconciliation, and on-chain settlement logic on every project.

This proposal delivers an open-source toolkit consisting of: (1) a pluggable metering SDK for application runtimes; (2) documented event schemas and on-chain / off-chain reconciliation samples; (3) reference Daml illustrating reward allocation policies that are composable with common Canton patterns; and (4) documentation and operational guidance suitable for auditors and integrators.

The toolkit is explicitly designed as shared public infrastructure: it does not prescribe a single commercial rewards operator, and it remains compatible with evolving network-level guidance on application rewards.

Success is measured by adoption: documented integrations, metering event volume from pilot applications, and sustained usage after the grant period under a clear maintenance model.

---

## Specification

### 1. Objective

Problem: The Canton ecosystem prioritizes simplified traffic accounting and application rewards as part of scaling application building and developer experience. Today, teams implement metering and rewards differently—often duplicating effort, producing inconsistent metrics, and making reconciliation against ledger activity costly or error-prone.

Outcome: Provide a standardized, optional toolkit that:

- Lowers time-to-integration for metering at the application boundary (HTTP/gRPC services, workers, and dApp backends).  
- Makes off-chain metered activity explainable and reconcilable with on-chain choices, disclosures, and reward distribution workflows where applicable.  
- Supplies reference contracts and tests that demonstrate policy-driven reward allocation without locking the ecosystem into proprietary schemas.

Non-goals: The toolkit does not replace Canton protocol semantics, does not mandate a specific commercial rewards marketplace, and does not guarantee eligibility for any particular network incentive program—those remain subject to network governance and operator policies.

### 1a. Scope Boundary: Network Application Rewards vs. This Toolkit

Network-level application reward parameters, eligibility rules, and disbursement authorities are defined by governance and operators, not by this grant. MeterKit provides neutral developer infrastructure: schemas for metering batches and reconciliation records, reference code for joining off-chain signals to ledger-derived facts, and reference Daml for policy-shaped payouts. It does not assert that any integrator qualifies for a specific incentive program, whitelist applications, or replace official network specifications. If public guidance evolves (e.g., required fields for reward claims), the toolkit will document optional extensions and versioned schema migrations.

### 2. Implementation Mechanics

A. Pluggable metering SDK (primary deliverable)

Language scope for the reference implementation:

- TypeScript (Node.js + browser-safe core where feasible) as the first-class SDK.  
- Optional Java adapter interfaces and a minimal reference binding if pilot participants require JVM services (scope gated by Milestone 2 pilot selection).

Design properties:

- Transport-agnostic core: counters, histograms, and signed metering batches with stable JSON (or protobuf) schemas.  
- Pluggable exporters: stdout, OTLP-compatible hooks, file spool, and a reference HTTP ingest for application operators who self-host a collector.  
- Identity hooks: map application sessions/users to Party IDs or application-defined pseudonyms in a privacy-preserving way (configuration-driven; no PII stored in reference defaults).  
- Integrity: optional signing keys for batches to support non-repudiation in reconciliation pipelines.

B. On-chain / off-chain reconciliation samples

Deliverables include:

- A reference reconciliation job (batch-oriented) that joins metering exports with ledger-derived facts available through supported Canton integration patterns (e.g., Participant Query Store patterns, JSON Ledger API v2 usage sketches—exact wiring documented with version pins).  
- Dispute handling guidance: idempotency keys, late arrivals, clock skew bounds, and reprocessing semantics.  
- Test vectors and golden files so integrators can validate their deployments.

C. Reference Daml: reward allocation policies

Apache-2.0 reference packages demonstrating:

- Policy interfaces separating *measurement claims* from *payout execution*.  
- Example strategies: pro-rata by verified score, tiered caps, minimum activity thresholds, and cooldown windows.  
- Safety: explicit authorization, upgrade-friendly interfaces, and tests using Daml Script.

D. Documentation

Includes integration cookbook, threat model (metering fraud, replay, inflated client claims), data minimization guidance, and a migration appendix for teams with existing bespoke telemetry.

E. Operations

Reference Helm/Kubernetes manifests or docker-compose for the collector component (non-normative but accelerates pilots), plus SLO guidance for operators.

### 3. Architectural Alignment

This work aligns with Canton ecosystem priorities under App Building and Developer Experience, specifically simplified traffic accounting and application rewards, and supports interoperability by using stable, documented schemas that multiple wallets, apps, and analytics pipelines can consume.

Architecturally, the toolkit respects:

- Privacy partitioning defaults: sensitive contract payloads are not required for metering; references show aggregated and attested patterns rather than exfiltrating private contract state.  
- Participant-side integration: metering runs in application infrastructure the builder controls; on-chain linkage is explicit and policy-bound.  
- Open evolution: schemas versioned with backward-compatible rules where possible.

Relevant governance context includes [CIP-0100](https://github.com/canton-foundation/cips/blob/main/cip-0100/cip-0100.md) (Development Fund process) and the public-good intent of [CIP-0082](https://github.com/canton-foundation/cips/blob/main/cip-0082/cip-0082.md) funding—this proposal is scoped as common-good developer infrastructure, not a proprietary rewards engine.

### 4. Backward Compatibility

*No backward compatibility impact on Canton protocol or ledger behavior.* The toolkit is optional application-layer software. Reference Daml packages are namespaced and versioned to avoid colliding with application package IDs.

---

## Milestones and Deliverables

### Milestone 1: Foundations — SDK v0, Schemas, and Local Dev Kit

- Estimated delivery: 8 weeks from project start  
- Focus: Establish the metering core, schemas, signing hooks, local collector, and minimal Daml reference modules with Daml Script tests.  
- Deliverables / value metrics:  
  - Open-source repo (Apache-2.0) with CI, semantic versioning from `0.x`.  
  - Metering SDK (TypeScript) with pluggable exporters and documented public API.  
  - Schema registry (versioned JSON Schema or protobuf definitions) for metering batches and reconciliation records.  
  - `COMPATIBILITY.md` (or an equivalent README section) stating minimum tested versions for the Daml SDK / `dpm`, JSON Ledger API v2 usage, and PQS-oriented reconciliation paths, updated as pins change across milestones.  
  - Local end-to-end sample: synthetic traffic → batch export → reconciliation dry-run against a local/dev ledger configuration documented in the repo.  
  - CI job that executes the reference reconciliation path against checked-in fixtures (no live external network required), so regressions are caught automatically.  
  - Value metric: ≥ 3 independent example integrations in-repo (e.g., Express middleware, worker loop, browser beacon with privacy notes).

### Milestone 2: Pilots — Two Real Applications + Reconciliation Hardening

- Estimated delivery: 10 weeks after Milestone 1 acceptance  
- Focus: Integrate with two pilot applications (distinct legal entities or clearly separate codebases) chosen with Canton Foundation facilitation; harden reconciliation and operational docs.  
- Deliverables / value metrics:  
  - Pilot integration reports (architecture diagrams, measured latency overhead, data minimization checklist).  
  - Reconciliation samples upgraded to pilot-shaped workloads (including idempotency and replay tests).  
  - Expanded reference Daml for at least two allocation strategies beyond Milestone 1.  
  - Value metrics:  
    - ≥ 2 pilot apps each producing ≥ 100k deduplicated metering records/month (counted after batch ingest using stable `batch_id` / idempotency keys per published schema v1) for ≥ 21 consecutive days during the milestone window, *or* equivalent staged load with committee-approved equivalence criteria if pilots cannot publish production volumes publicly. Pilot reports share schema version, UTC aggregation window, and top-line counts only—no confidential counterparty payloads.  
    - ≥ 1 external GitHub repository outside the author-controlled perimeter (see above) importing the SDK as a dependency with a documented integration path.

### Milestone 3: Production-Grade Toolkit, Mainnet-Class Pilot Path, and Handover

- Estimated delivery: 10 weeks after Milestone 2 acceptance  
- Focus: Security review pass, performance benchmarks, runbooks, and mainnet-class pilot readiness (where “mainnet-class” means the pilot’s production deployment topology and governance approvals—not protocol changes).  
- Deliverables / value metrics:  
  - Security documentation: threat model v1, abuse cases, and mitigations; dependency audit workflow and CI-based scanning. Security review pass here means documented self-assessment plus the above automation—not, by default, a full third-party penetration test. A lightweight external security review (e.g., focused on collector and signing paths) may be added only if the Committee recommends it and scope/CC are adjusted by mutual written agreement.  
  - Operator runbooks: dashboards/alerts for collector health, backlog, and data quality SLOs.  
  - Release 1.0 of the SDK with stability guarantees for core APIs; migration guide from `0.x`.  
  - Mainnet-class pilot evidence: at least one pilot operating in a production environment approved by that pilot’s own governance (letter or public post acceptable), with 30-day summarized metrics shared in the milestone report (aggregated; no confidential counterparty data).  
  - Maintenance plan executed: documented 6-month post-grant maintainer commitment with issue SLAs and release cadence.  
  - Value metric: ≥ 5 total GitHub dependents or documented deployments (counting Milestone 2 pilots plus additional integrators) using the published packages. Trivial or empty packages created solely to inflate counts do not count; the milestone report summarizes evidence (repo links, integration notes, or deployment descriptions) for the Committee to verify good-faith use.

---

## Acceptance Criteria

The Tech & Ops Committee may accept milestones when:

- Deliverables are publicly available under Apache-2.0 (or CC-BY-4.0 for prose-only artifacts, if any) with clear licensing in-repo.  
- Tests and docs required by each milestone are present and runnable from the README with pinned toolchain versions.  
- Value metrics for Milestones 2–3 are met or a written variance is approved (scope-preserving adjustments only).  
- Pilot participation is evidenced by named applications (or anonymized with committee visibility), integration artifacts, and metric summaries consistent with privacy commitments.  
- Maintenance responsibilities, repositories, and contact paths are published before final milestone payment.

---

## Funding

Total funding request: 2,200,000 Canton Coin (CC)

### Payment Breakdown by Milestone

- Milestone 1 (Foundations — SDK v0, Schemas, Local Dev Kit): 550,000 CC upon committee acceptance  
- Milestone 2 (Pilots — Two Applications + Reconciliation Hardening): 700,000 CC upon committee acceptance  
- Milestone 3 (Production-Grade Toolkit + Mainnet-Class Pilot Path + Handover): 950,000 CC upon final release and acceptance  

### Volatility Stipulation

The estimated calendar duration is approximately 7 months from start through Milestone 3 (8 + 10 + 10 weeks plus integration buffers). Because this exceeds 6 months, the grant is denominated in fixed CC and includes a 6-month checkpoint with the Tech & Ops Committee to confirm schedule, pilot health, and—if needed—renegotiate remaining milestone amounts for significant USD/CC volatility, per program norms.

If the Committee requests material scope changes that extend delivery, remaining milestones may be renegotiated consistent with [CIP-0100](https://github.com/canton-foundation/cips/blob/main/cip-0100/cip-0100.md) guidance.

---

## Co-Marketing

Upon milestone releases, the implementing team will collaborate with the Canton Foundation on:

- Coordinated announcement and developer blog describing integration patterns and security considerations  
- Workshop-friendly sample apps suitable for meetups / hackathons  
- Listing in ecosystem developer resource pages where applicable  

---

## Motivation

Traffic accounting and application rewards are cross-cutting needs: they touch tokenomics, application UX, operator compliance, and analytics. A shared toolkit reduces duplicated engineering, improves auditability of reward claims, and accelerates good-faith participation in incentive programs—without centralizing control in a single vendor.

If successful, the toolkit becomes a neutral reference layer that wallets, analytics providers, and application teams can align on, improving transparency and reducing integration risk across the Canton Network.

---

## Rationale

#### Why a toolkit instead of a single hosted service?

A hosted SaaS could help demos, but it concentrates trust and operational cost. A library-first approach with an optional self-hosted collector matches Canton’s multi-operator reality and preserves builder autonomy.

#### Why include Daml reference policies?

Off-chain metering alone cannot answer “what happened on-ledger.” Reference contracts show safe linkage patterns between claims and payouts, which is where many projects fail today.

#### Why staged pilots with hard adoption metrics?

The Development Fund emphasizes adoption-driven delivery. Metering without usage is not a public good outcome; milestones therefore gate funding on measurable integration and sustained event throughput (with an approved equivalence path if public metrics are sensitive).

#### Differentiation from generic observability (e.g., OpenTelemetry-only stacks)

- Ledger-shaped reconciliation: reference jobs join metering exports to Participant Query Store / JSON Ledger API v2 patterns with pinned versions, not just service graphs.  
- Canton identity defaults: Party-scoped and pseudonymous hooks aligned with privacy partitioning; no contract payload exfiltration in defaults.  
- Reward policy surface: reference Daml separates claims vs payout execution—OTel does not model on-chain settlement.  
- Evolving network guidance: optional schema fields reserved for documented application-reward claim formats as specifications stabilize.

#### Alternatives considered

- Rely on generic OpenTelemetry only: insufficient for Canton-specific reconciliation and reward policy examples.  
- Protocol changes: out of scope, slower, and unnecessary for an application-layer MVP.  
- Single proprietary rewards platform: misaligned with public-good requirements and ecosystem neutrality.

---

## Open Source

All reference code and schemas will be released under the Apache-2.0 license. Documentation will be licensed to encourage reuse (Apache-2.0 for examples embedded in code; CC-BY-4.0 for standalone long-form guides if needed).

---

## Team & Operations

Lead: Auther Liu  

Capacity (planning basis): Roughly 10–12 person-months of engineering are budgeted across the three milestones (SDK, collectors, reconciliation jobs, Daml references, docs, and pilot support), delivered by the Lead as primary implementer. That estimate scopes effort against the milestone deliverables; it is not an implied CC wage rate and does not bind the Committee’s valuation of outcomes.

Maintenance after grant: The final milestone includes a published MAINTAINERS.md, release cadence (target: monthly patch releases for 6 months), and a security contact. If maintenance must transition, a handover PR and repository permission transfer plan will be delivered in Milestone 3.

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Pilots cannot share production metrics publicly | Committee-approved equivalence criteria (staging load + signed attestation). |
| Metering becomes a privacy footgun | Data minimization defaults, explicit PII prohibitions in samples, redaction tooling in collector. |
| Fraudulent client-side metrics | Document client/server split, signing, rate limits, and on-chain attestation patterns; position SDK as honest reporting helper, not a cryptographic proof of global traffic by itself. |
| API drift (Canton / Daml) | Pinned versions, compatibility matrix, and semver policy for SDK `1.x`. |
| Collector trust boundary misconfiguration | Document who deploys the collector, who holds signing keys, rotation procedures, and separate dev/prod configs; reference manifests use least-privilege defaults. |
| Retention / compliance (e.g., GDPR-sensitive pilots) | Configurable TTL and export deletion hooks; pilot integration checklist calls out jurisdiction-specific log minimization. |
| DoS / backlog on ingest | Max batch size, rate limits, backpressure in collector, and operator alerts for sustained queue growth (see Milestone 3 runbooks). |

---

## Contact

For questions about this proposal: autherliu8@gmail.com (update if a team mailing list is established).
