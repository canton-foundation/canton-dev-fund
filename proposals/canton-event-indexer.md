## Development Fund Proposal

**Author:** Dhruv Sharma
**Status:** Submitted
**Created:** 2026-03-04
**Label:** dapp-integration

**[Champion](https://github.com/canton-foundation/canton-dev-fund/blob/main/sig-directory.md):** need Champion

---

## Abstract

The Canton Event Indexer is an open-source application API + notification layer above participant-local event data. It exposes OpenAPI/Swagger REST APIs, GraphQL APIs, webhook delivery, and typed PostgreSQL projections to dApp teams.

The indexer is deliberately positioned **above** the validator indexer layer covered by PR #67 ("Open Sourcing Grant of a Validator Indexer (PQS)"). Once open-source PQS is available, the indexer consumes PQS as its preferred upstream data source and contributes the application-facing surface — REST/GraphQL, webhooks, typed projections, and integration patterns — that #67's motivation explicitly identifies as the next layer ("higher level services like auto-generated API middlewares"). A direct Ledger API consumer is shipped as a transitional and fallback ingestion path during the PQS open-sourcing window, and for environments that cannot run PQS.

A proof of concept has been built and verified against a live cn-quickstart network, demonstrating sub-second indexing, crash recovery with zero data loss, HMAC-signed webhook delivery, and typed projection analytics. The POC source code and demo video are available for review.

**POC source code:** https://github.com/illegalcall/canton-indexer-poc
**Demo video:** https://www.loom.com/share/87fcd6ad0f664ba0a0422270d2b97422

---

## Specification

### 1. Objective

**Single Objective:** Deliver a production-ready, open-source application API and notification layer above participant-local event data — one deployable system that exposes REST, GraphQL, webhook, and typed-projection access for dApp teams. The milestones below are progressive delivery of this single product (core ingestion + REST/webhooks → GraphQL + typed projections + PQS-source adapter → packaging and handoff). They are not independent objectives bundled together; each milestone extends the same codebase, the same deployment artifact, and the same target user (dApp teams that need an HTTP query/notification surface around their participant's events).

**Problem.** PQS provides participant-local SQL query access and is on a path to open source under #67. PQS does not, however, provide HTTP/REST/GraphQL APIs, push-based webhook delivery, application-facing typed projections, or the integration patterns that consuming dApp teams need at the application layer. Today every dApp team rebuilds those pieces by hand on top of either PQS or the Ledger API directly — typically several engineering weeks of duplicate work per application.

**Intended Outcome.** A deployable, open-source service that:
1. Consumes participant-local event data from a pluggable upstream source: **PQS adapter** (preferred, once open-source PQS is available per #67) or **direct Ledger API consumer** (transitional, and supported for environments that cannot run PQS).
2. Persists creates / archives in Milestone 1 and exercise-event enrichment in Milestone 2 into PostgreSQL.
3. Exposes a REST + GraphQL query API over the indexed data.
4. Delivers webhooks to registered endpoints on matching contract events.
5. Generates typed PostgreSQL projection tables for **operator-selected templates / interfaces from allowlisted `.dar` packages**, within configured table-count, column-count, and storage budgets, with additive SQL migrations and dry-run migration plans by default.
6. Handles crash recovery, reconnection, and offset management with durable checkpoints and deterministic resume behavior.
7. Is packaged as Docker images and Helm charts.

### 2. Implementation Mechanics

#### Core Architecture

The service runs in four layers:
- **Source Adapter (pluggable):** Either the **PQS adapter** (preferred, once open-source PQS is available per #67), which subscribes to PQS's relational output, or the **Ledger API adapter**, which streams `UpdateService` events directly via gRPC. Both feed the same downstream layers behind a stable internal interface.
- **Ingestion:** Atomic offset/checkpoint commit, deterministic resume, exponential reconnect.
- **Storage:** PostgreSQL event/state tables plus optional typed projection tables.
- **Access / Delivery:** REST, GraphQL, and webhook delivery endpoints over indexed data.

#### Technology Stack

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| Language | Scala, Java 21 | Strong JVM ecosystem support, performance, and long-term maintainability; aligned with Canton’s JVM/Scala implementation model |
| gRPC Client | `com.daml:bindings-java` + `io.grpc:grpc-netty-shaded` | Typed Ledger API access with production-ready gRPC transport |
| HTTP Framework | Tapir + Apache Pekko HTTP | Typed endpoints, streaming support, and first-class OpenAPI generation |
| GraphQL | Sangria | Scala-native GraphQL implementation for the project's read/query layer in Milestone 2 |
| Database | PostgreSQL 16+ | Mature relational engine with strong indexing and JSON support for event workloads |
| DB Driver | Slick 3.5 + HikariCP | Type-safe query access plus reliable connection pooling and transaction handling |
| Migration Tooling | Flyway + `flyway-database-postgresql` | Reviewable, repeatable schema migration workflow for production operations |
| Webhook Client | sttp client3 (`pekko-http-backend`) | Stable JVM HTTP client with timeout/retry control and observability hooks |
| Packaging | Docker + Helm | Standard cloud-native and on-premise deployment |

#### Ingestion Engine

1. **Bootstraps** via `StateService.GetActiveContracts()` to snapshot the current active contract set
2. **Streams** via `UpdateService.GetUpdates()` for creates/archives, plus transaction-tree enrichment for exercise details in Milestone 2
3. **Configures party scope** via auto-discovery from the participant HTTP API or explicit allowlist mode, using `filters_by_party` (no super-reader requirement)
4. **Checkpoints atomically** — events and offset committed in a single database transaction for deterministic resume behavior
5. **Reconnects** with exponential backoff on gRPC disconnection

Processing semantics: at-least-once ingestion, effectively-once persistence via idempotent writes, and at-least-once webhook delivery.

#### Runtime Target (JVM) and POC Note

This proposal funds a **JVM-first production implementation** (Scala codebase on Java 21 runtime) and all milestone acceptance is tied to that runtime.

The existing Python proof of concept is pre-grant validation work used to rapidly test ingestion semantics, crash recovery behavior, and projection UX. It is included as evidence of feasibility, not as the funded production runtime commitment.

#### `.dar`-Based Typed Schema Generation

The indexer includes opt-in `.dar`-based typed schema generation. Raw upstream payloads are nested structures stored as JSONB. Schema-aware indexing extracts type information from compiled `.dar` files and generates typed PostgreSQL tables for **operator-selected templates and interfaces drawn from explicitly allowlisted `.dar` packages**, within configured budgets. Auto-discovery and "all templates everywhere" generation are not the default and are not supported.

Raw event/state tables remain the immutable source of truth. Schema evolution follows a safety-first policy: additive changes are automated; non-additive changes are emitted as **dry-run migration plans by default** for explicit review and controlled cutover.

For major model refactors, rebuild/reindex from raw event/state tables remains available as an operational fallback.

**Without schema generation** (raw JSONB):
```sql
SELECT SUM(
  ((payload->'fields'->0->'value'->>'numeric')::numeric) *
  ((payload->'fields'->1->'value'->>'numeric')::numeric)
) AS aum
FROM contracts
WHERE template_id LIKE '%FundShare' AND is_active = TRUE;
```

**With schema generation** (typed projection):
```sql
SELECT SUM(share_amount * nav) AS aum FROM proj_fundshare WHERE is_active = TRUE;
```

This query pattern is shorter and index-friendly.

> **Current POC status:** One manually configured projection (`proj_fundshare`) is implemented and computes AUM from typed columns in real time. Full `.dar` parser and migration generation are in Milestone 2 scope.

**Resource Bounds and DoS Controls.** Schema generation is opt-in. Operators provide an explicit `.dar` allowlist (auto-discovery is not the default), and configuration enforces per-package limits on generated projection tables, projection-column counts per template, and storage budgets. Limits are validated at migration-plan generation time, before any DDL runs. Generated projections inherit the indexer's connection-pool, statement-timeout, and write-rate caps, so an oversized or malformed `.dar` cannot exhaust database connections or saturate write throughput. The benchmark profile includes a stress validation against a 100-template package set under steady-state ingestion to verify these bounds.

#### Webhook Delivery

When an event matches a subscription filter, the indexer signs the payload (HMAC-SHA256), delivers it to the configured endpoint, retries failures with backoff (1s, 5s, 30s), and logs all attempts.

#### Security and Privacy Controls

- **Authentication modes:** JWT/OIDC (issuer + JWKS + audience validation) for API consumers, with optional mTLS mode for restricted internal deployments.
- **Participant API permissions:** Read-only for party discovery (or explicit allowlist mode); no topology/admin write permissions.
- **Party-scoped authorization:** Requests are enforced against party claims; cross-party access is rejected.
- **Webhook integrity/replay:** HMAC-SHA256 signatures with timestamp replay-window checks.
- **Webhook SSRF controls:** HTTPS-only targets, allowlist support, private-network/IP blocking.
- **Secret management:** Encrypted-at-rest secrets (KMS or equivalent) with rotation/revocation.
- **Security observability:** Auth, secret, and webhook security events are logged with retention controls.

### 3. Architectural Alignment

**Canton Privacy Model Compliance.** The indexer is participant-local. It connects to a single participant and indexes only events where that participant's hosted parties are informees. It does not attempt a global view and does not bridge participant privacy boundaries.

**One Indexer Per Participant — No Cross-Participant Consistency Contract.** Each participant runs its own indexer instance. The upstream source (PQS or Ledger API) and the offsets it produces are validator-local and are not globally ordered across the network. The indexer therefore explicitly does not provide:

- a global ordering across participants,
- an "as-of network offset" or cross-validator snapshot semantics,
- any cross-participant consistency contract or reconstructed transaction order.

Cross-participant correlation is left to the application layer via explicitly shared business identifiers, never via offsets — this is the only correlation strategy that survives the move to vector-clock-based multi-synchronizer ordering when those primitives are exposed at the API level.

Multi-synchronizer behavior is treated as an evolving compatibility surface, not a settled one. Reassignment, topology-change, and cross-domain visibility cases are tracked as a dedicated CI compatibility suite that is updated as the relevant APIs stabilize. Where the upstream emits ordinary `created` / `archived` events for a visibility change, the indexer absorbs them without architectural change; where new primitives are required, the source-adapter interface gives a single place to add them.

**Authorization and JWT Party-Claim Alignment.** API authorization is designed to align with the participant's own party-claim model rather than introducing a parallel one. Two operating modes are supported:

- **Aligned-issuer mode (default):** The indexer trusts the same OIDC issuer / JWKS / audience as the connected participant. Party claims in the JWT are interpreted exactly as the participant interprets them, so a token that authorizes a party at the participant authorizes the same party at the indexer.
- **Mapped-claims mode:** Where the indexer is fronted by a different identity provider, claims are mapped to participant parties via an explicit allowlist or by calling the participant's `UserManagementService` to resolve user-to-party rights. Cached resolutions are TTL-bounded.

In both modes, stale or revoked party rights are negative-tested in CI: a user whose right to a party has been revoked at the participant must be denied at the indexer within a bounded propagation window.

**Relevant CIPs.**
- **CIP-0082** (Development Fund) — this project builds open-source common-good infrastructure funded by the Development Fund.
- **CIP-0056** (Token Standard) — the indexer captures CIP-56 token lifecycle events as ordinary contract events, giving wallet and analytics consumers a query and notification surface over them without each rebuilding ingestion.

**Complementary to Existing Tools.** Read-only consumer of upstream event data (PQS or Ledger API); does not modify ledger state or participant protocol behavior. The "Ecosystem Fit" subsection in Rationale enumerates the existing and pending tools considered and explains why this proposal layers above PQS rather than parallel to it.

### 4. Backward Compatibility

*No protocol or platform backward-compatibility impact.* The Canton Event Indexer is a new, standalone service that reads from the existing Ledger API. It does not modify any Canton components, participant configuration, or Daml models.

The indexer supports package upgrades by indexing events across template package versions; version information remains queryable through template identifiers.

API evolution policy: REST is path-versioned (for example, `/v1`), GraphQL follows additive-by-default changes, and breaking changes ship only in a new major version with deprecation notice and migration guidance.

---

## Milestones and Deliverables

### Milestone 1: Production-Grade Core (9 weeks)
- **Estimated Delivery:** 9 weeks from approval
- **Focus:** Deliver a production-ready core with Docker packaging
- **Deliverables / Value Metrics:**
  - Production-hardened ingestion engine with configurable backoff, connection pooling, and graceful shutdown
  - PostgreSQL schema with BRIN indexes, partitioning support, and migration tooling
  - Full REST API with OpenAPI 3.1 specification, pagination, filtering by template/type/party/offset/time
  - Webhook system with HMAC-SHA256 signing, configurable retry policy, dead-letter queue
  - Security baseline: JWT/OIDC authn (plus optional mTLS mode), party-scoped authorization, webhook replay protection, and SSRF baseline controls for webhook targets
  - `canton-index.yaml` declarative configuration support
  - Docker image published to GitHub Container Registry (ghcr.io)
  - Test suite: unit tests (>80% coverage), integration tests against Canton sandbox
  - CI pipeline (GitHub Actions)
  - Indexing latency: <1s mean | API response: <100ms p95 | Crash recovery: <5s with checkpoint-consistent resume

### Milestone 2: Advanced Features (9 weeks)
- **Estimated Delivery:** 18 weeks from approval
- **Focus:** GraphQL API, `.dar`-based typed schema generation, and advanced query capabilities
- **Deliverables / Value Metrics:**
  - GraphQL API (JVM implementation): query + subscription types, cursor-based pagination
  - WebSocket subscriptions for real-time event push
  - Exercise-event enrichment (transaction-tree details) exposed in REST/GraphQL responses
  - PQS source adapter (preferred): consume open-source PQS output as the upstream source where available
  - `.dar` file parser extracting Daml-LF template and interface definitions
  - CLI command `canton-indexer schema generate --dar <path> --templates <selector>` producing reviewable SQL migrations
  - Typed PostgreSQL tables generated for **operator-selected templates and interfaces from allowlisted `.dar` packages**, within configured table-count, column-count, and storage budgets
  - Dual-write pipeline (configurable): raw JSONB + typed projection tables simultaneously; raw-only mode supported
  - Schema evolution: additive migrations automated; non-additive changes emitted as **dry-run migration plans by default** (no destructive DROP/CREATE without explicit review)
  - Prometheus metrics exporter + Grafana dashboard templates
  - Typed projection query speedup target: >5x vs raw JSONB | Sustained throughput target: >100 events/second (under benchmark profile)

### Milestone 3: Production Packaging & Community Handoff (6 weeks)
- **Estimated Delivery:** 24 weeks from approval
- **Focus:** Helm charts, documentation, community onboarding, Foundation ownership transfer
- **Deliverables / Value Metrics:**
  - Helm chart for Kubernetes deployment (validated on K8s 1.28+, EKS, GKE, AKS)
  - Production deployment guide: single-participant and high-availability reference topology; multi-cloud deployment patterns documented as non-blocking appendix guidance
  - Developer guide, API reference, webhook integration guide
  - Example webhook consumers in TypeScript, Python, and Go
  - Tutorial: "Index your first Canton dApp in 10 minutes"
  - Two public reference integrations completed (backend consumer + frontend consumer), with implementation notes and lessons learned
  - Repository transfer package delivered (maintainer docs, handover checklist, ownership transfer request)

### Milestone 4: Adoption Report (90 days post-M3)
- **Estimated Delivery:** 90 days after Milestone 3 acceptance
- **Focus:** Demonstrate real external adoption or serious integration attempts after release
- **Deliverables / Value Metrics:**
  - Public adoption report covering installations, integration attempts, adopter feedback, support load, unresolved blockers, and the open-issue roadmap
  - At least one external evidence item from a team outside the proposer group: written adopter attestation, public PR consuming the indexer, third-party reference integration, or usage telemetry from a non-team installation
  - Supplemental distribution metrics tracked separately, including GitHub stars, forks, container pulls, and Helm chart pulls; these are useful signals but not sufficient evidence on their own

---

## Benchmark Methodology

Performance acceptance criteria are evaluated using a reproducible benchmark profile:

- **Environment profile:** App service and PostgreSQL each on dedicated instances (minimum 4 vCPU, 16 GB RAM, SSD storage), single participant connection.
- **Dataset profile:** At least 1,000,000 indexed events across 20+ templates, with mixed create/archive traffic and realistic payload sizes.
- **Load profile:** Steady-state and burst scenarios, including ingestion throughput, API concurrent reads, and webhook dispatch under retry conditions.
- **Measurement profile:** p50/p95/p99 latency, sustained events/second, recovery time after forced restart, and error rate.
- **Reproducibility:** Benchmark scripts, environment configuration, and result artifacts are published in the repository for committee verification.

This methodology is stricter than typical proposal-level metrics and is designed to make milestone acceptance objective and repeatable.

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone
- Demonstrated functionality or operational readiness
- Documentation and knowledge transfer provided
- Alignment with stated value metrics

**Project-specific conditions:**

**Milestone 1:**
- Indexer connects to a Canton participant and streams events without manual intervention
- All REST API endpoints respond within 100ms p95 (50 concurrent requests)
- Webhook delivery >99% success rate over a 1-hour continuous test
- Crash recovery: kill mid-stream, restart — resumes from checkpoint within 5s with checkpoint-consistent resume behavior
- Authorization boundary tests pass: cross-party access attempts are rejected (negative test coverage required)
- JWT/OIDC validation tests pass (issuer/JWKS/audience/claim checks), with optional mTLS smoke test for restricted deployments
- Webhook security baseline validated: signature verification + replay-window tests pass
- SSRF baseline validated: localhost/private-network webhook targets are blocked by policy
- Docker: `docker compose up` to working indexer in under 5 minutes
- Test suite >80% line coverage

**Milestone 2:**
- `canton-indexer schema generate --dar <path> --templates <selector>` produces valid SQL for the **operator-selected** templates / interfaces from allowlisted `.dar` packages, within configured budgets, and rejects requests that exceed budget at plan time
- PQS source adapter validated end-to-end against the open-source PQS release (or its release candidate) once available; Ledger API adapter validated as transitional/fallback path against Canton sandbox
- Additive schema changes are applied via generated SQL migrations; non-additive changes produce dry-run migration plans by default for controlled cutover
- Typed projection queries >5x faster than JSONB path queries under benchmark profile (benchmarked with EXPLAIN ANALYZE)
- Indexer sustains >100 events/second under benchmark profile
- Secret rotation and revocation workflow demonstrated with audit log coverage
- KMS-backed (or equivalent) secret storage integration demonstrated for production profile
- Prometheus metrics scrapeable and Grafana dashboards render correctly
- Benchmark report published with environment profile, scripts, and raw result artifacts

**Milestone 3:**
- Helm chart deploys on Kubernetes 1.28+
- All API endpoints and configuration options documented
- Tutorial enables a new developer to complete a working setup
- Two public reference integrations demonstrate end-to-end query + webhook consumption

**Milestone 4:**
- Adoption report is published within 90 days of Milestone 3 acceptance
- Report includes at least one external evidence item: written adopter attestation, public PR in another repository consuming the indexer, reference integration shipped by a team other than the proposer group, or usage telemetry from a non-team installation
- GitHub stars, forks, container pulls, and Helm pulls are reported only as supplemental signals and are not sufficient evidence on their own

**Overall:**
- All source code open-source under Apache 2.0
- Demonstrated against a live Canton network (not just sandbox)

**Value-Based Acceptance Targets (Ecosystem Adoption):**

The acceptance criteria above include artifact-level checks that protect production quality. The following ecosystem-value targets are committed in addition, in line with the Tech & Ops guidance that acceptance be evaluated on value to the ecosystem rather than artifact delivery alone:

- **By Milestone 2 acceptance:** Indexer is integration-tested against at least 2 candidate consumer projects drawn from the Infrastructure Multiplier table (e.g., #68, #69, #270, #109, #18). Test repositories, written feedback, and any required adapter changes are committed to this proposal's repository. (The commitment is on this team's side: we engage the candidates and integrate; landing depends on them but evidence of the integration work itself is fully under our control.)
- **By Milestone 3 acceptance:** At least 2 public reference integrations published by this team (one backend consumer, one frontend consumer) demonstrating end-to-end query and webhook flows on a live network.
- **By Milestone 4 acceptance:** Publish a 90-day adoption report with at least one external evidence item from the list above. The bar is intentionally achievable: it makes post-release adoption work a funded commitment without requiring broad adoption volume before the ecosystem has had time to integrate.

**Coordination Outcomes (non-blocking for technical completion):**
- Ownership transfer request opened to the Canton Foundation GitHub organization
- Joint launch/announcement timeline aligned with Foundation communications process

---

## Funding

**Total Funding Request: 400,000 CC**

### Payment Breakdown by Milestone
- Milestone 1 (Production-Grade Core): 150,000 CC upon committee acceptance
- Milestone 2 (Advanced Features): 170,000 CC upon committee acceptance
- Milestone 3 (Packaging & Handoff): 60,000 CC upon release and acceptance
- Milestone 4 (Adoption Report): 20,000 CC upon committee acceptance of the 90-day adoption report

### Volatility Stipulation

Milestones 1-3 complete the funded implementation and handoff in 24 weeks. Milestone 4 adds a 90-day adoption/reporting holdback, so final acceptance is expected approximately 36 weeks after approval. Because the full grant period is therefore greater than 6 months, the grant is denominated in fixed Canton Coin and the remaining unaccepted milestone amount may be re-evaluated at the 6-month mark in line with the Development Fund template.

---

### Budget Assumptions

At a planning reference of **0.15 USD/CC**, the request corresponds to approximately **$60,000 USD**.

Execution model: Dhruv is the full-time lead engineer for the project. Two additional engineers are available on a part-time, milestone-driven basis and are brought in strategically for focused delivery workstreams (API surface, schema tooling, testing/hardening).

- Team compensation (6 months, reduced early compensation model):
  - Lead Engineer (Dhruv): $2,500/month x 6 = $15,000
  - Engineer 2 (part-time): $2,000/month x 6 = $12,000
  - Engineer 3 (part-time): $1,500/month x 6 = $9,000
  - **Subtotal:** $36,000
- Infrastructure, CI/CD, staging environments, observability: **$5,000**
- External security penetration test after feature-complete build: **$8,000**
- Operations overhead (artifact hosting, compliance/legal/admin, backups): **$3,000**
- Contingency reserve: **$8,000**
- **Total:** **$60,000** (approximately 400,000 CC at 0.15 USD/CC)

Milestone 4 does not increase the total funding request. It holds back 20,000 CC from the packaging milestone so that a small final tranche is paid only after post-release adoption evidence is published.

---

## Co-Marketing

Co-marketing commitments:

1. **Milestone 1:** Joint announcement of the open-source Canton Event Indexer with demo video showing real-time event indexing and webhook delivery against a live Canton network.
2. **Milestone 2:** Technical blog post covering GraphQL API, WebSocket subscriptions, and `.dar`-based typed schema generation with performance benchmarks.
3. **Milestone 3:** Launch announcement with developer guide, tutorial video, and call for community contributions, including publication of the repository handover package and transfer request.
4. **Community Support:** Best-effort participation in Canton community calls and support in Canton Discord/Forum during the grant and 12-month maintenance window.

---

## Maintenance and Ownership Plan

Post-release, Dhruv Sharma remains the primary maintainer for **12 months after Milestone 3 acceptance**. The Milestone 4 adoption report is delivered inside that support window and does not extend it.

- **Support window:** 12 months from Milestone 3 acceptance.
- **Severity SLA:**
  - **P1** (security issue / production outage): acknowledge <4 hours, mitigation <24 hours.
  - **P2** (major functional regression): acknowledge <1 business day, patch <5 business days.
  - **P3** (normal bug / enhancement): acknowledge <3 business days, scheduled in next planned release.
- **Release cadence:** regular patch and minor releases based on issue volume and security needs.
- **Compatibility policy:** maintain compatibility matrix for supported Canton/Daml versions, with upgrade notes for every release.
- **Security process:** coordinated vulnerability disclosure workflow and emergency patch path for critical findings.
- **Ownership continuity:** if maintenance demand exceeds grant assumptions, a continuation maintenance grant can be proposed with usage metrics and support load evidence.

---

## Motivation

### Why a Layer Above PQS Now

Other major ecosystems publish open-source query and notification infrastructure on top of their indexer layer. With #67 merged, Canton will have the indexer layer (PQS, open-source). What it still does not have is the application-facing layer above it: HTTP APIs (REST/OpenAPI, GraphQL), push-based webhook delivery, application-tuned typed projections, and integration patterns. Today every dApp team rebuilds those pieces by hand on top of either PQS or the Ledger API directly.

### Quantified Ecosystem Benefit

Application APIs and notification surfaces are a near-universal need for dApp teams: any dApp that surfaces user-facing data, sends notifications, or runs analytics needs them above whatever indexer it uses. Concrete sizing of who benefits:

- **Direct beneficiaries:** dApp teams that consume their participant's events through application code — estimated at **60–70% of independent Development Fund dApp proposals submitted to date**, based on observed reliance on bespoke HTTP / query / webhook plumbing in PRs in this repository (the pattern persists whether teams use PQS or the Ledger API today).
- **Adjacent beneficiaries:** Wallet, frontend-library, and developer-tooling proposals (e.g., #68, #69, #109, #270) that explicitly need an HTTP query and event-notification surface to deliver their own user value.
- **Long-tail beneficiaries:** Future ecosystem teams that, with this layer in place, no longer rebuild HTTP/REST query, webhook delivery, and typed-projection plumbing per application — an estimated **4–8 engineering weeks per dApp** of duplicate work avoided.

**Conservative adoption target:** within 12 months of Milestone 3 acceptance, at least **30% of new community Canton dApps** consume the indexer for their HTTP query or notification layer rather than rebuilding it. Early progress is reported in the paid Milestone 4 adoption report; the 12-month target remains a longer-term ecosystem outcome rather than a prerequisite for Milestone 4 acceptance.

### Infrastructure Multiplier — Active Open PRs That Map to This Indexer

The indexer is a read/notification substrate that other Development Fund proposals can adopt instead of rebuilding their own. The mapping below uses currently open PRs in this repository (as of late April 2026), with concrete consumption points rather than generic adjacency:

| Open PR | How this indexer plugs in |
|---|---|
| **#68 — Canton Participant Workbench** | Workbench is an explicit PQS-to-UI layer building its own `pqs-connector` and `pqs-decoder`. The indexer offers an open-source backend for the same need without an enterprise PQS license; Workbench can consume REST/GraphQL/webhooks instead of maintaining a connector. |
| **#69 — Canton dApp SDK** | dApp SDK consumers need a typed read and notification surface over their own contracts. The indexer is the participant-side data layer the SDK can document as a recommended read backend. |
| **#270 — c7-digital `/ledger` and `/react` libraries** | TypeScript JSON Ledger API client + React hooks need a server-side aggregate to query and a webhook source to drive UI updates; the indexer is the natural counterpart. |
| **#109 — Wallet Gateway Reference Implementation** | Wallet activity feeds, balance views, and transaction-status notifications map directly to indexer queries plus webhook subscriptions. |
| **#18 — Canton DevKit** | DevKit advertises integrated observability dashboards over LocalNet; those dashboards need an event tail, which is what the indexer provides. |
| **#225 — Pinned External Data Fetches** | External attestors observing burns and replays on counterparty participants need a durable, queryable event tail to trigger their signing flows. |
| **#262 — OpenZeppelin Canton Stack** | OpenZeppelin reference DeFi implementations need a canonical read backend to match its audited-library promise. |
| **#267 — Jubilee Privacy-Native NFT Marketplace** | Marketplace listings, offers, royalty distribution, and activity feeds all need indexed event access. |
| **#266 — Canton DeFi SafeVault Framework** | Vault state, allocation approvals, redemption queues, and risk dashboards consume indexed event streams. |
| **#261 — Canton Carbon Infrastructure** | Registry views, retirement audit logs, and price-discovery feeds are indexed-data products. |

Proposals not in this table that share the pattern (any user-facing dashboard, notification flow, analytics view, or compliance audit trail) can adopt the indexer on the same terms. The intent is not exclusivity; the indexer's value scales with how many of these proposals adopt it instead of rebuilding ingestion in-house.

> **Peer / boundary note (#176, Verifiable Institutional Data Access):** #176 targets analytics-ready data outputs (CSV/Parquet) for institutional consumers — a different audience and output format. The two proposals can co-exist: this indexer feeds online application traffic (REST/GraphQL/webhooks) while #176 produces offline analytics extracts. If the Committee prefers consolidation, the participant-local event store proposed here can serve as the upstream source for #176's extract pipeline.

### POC Validates Feasibility

A working proof of concept is built and live-tested:

| Metric | POC Result |
|--------|-----------|
| Indexing latency | 546ms mean |
| API response time | 12-64ms observed range |
| Webhook delivery | 17ms mean |
| Crash recovery | 2.53s, no observed data loss in POC test runs |
| Live events ingested | 19,000+ across 19 Daml templates |
| Typed projection | FundShare AUM computed in real-time |

**Demo video:** https://www.loom.com/share/87fcd6ad0f664ba0a0422270d2b97422
**POC source:** https://github.com/illegalcall/canton-indexer-poc — 29 Python modules + React/TypeScript dashboard (39 frontend files), 11 passing API/database smoke tests, and a PQS adapter design sketch.

---

## Rationale

### Ecosystem Fit (Why a New Component vs Extending Existing)

The proposal-template guidance is clear that the default approach should be to extend existing tooling, and that a proposal must explain why it cannot. The following review of existing and pending Canton tooling explains why a new participant-local component is the lowest-cost path to the stated objective:

| Existing / Pending Tool | How This Proposal Relates |
|---|---|
| **PQS — open-sourcing covered by #67 (merged)** | **Upstream source of truth, not a competitor.** #67 funds Digital Asset to enhance and open-source PQS as a participant-local SQL indexer; its motivation explicitly notes that PQS *"can form the basis for others to build higher level services (like auto-generated API middlewares) on top."* This proposal delivers exactly that layer: the REST/OpenAPI + GraphQL + webhook + typed-projection surface that PQS does not provide. Where open-source PQS is available, the indexer's PQS source adapter consumes it; where not yet available, the Ledger API adapter is a transitional path. The proposal does not duplicate any deliverable inside #67. |
| **Daml Ledger Client Libraries** (Java/JS bindings) | Low-level transport layer; provide raw Ledger API access but no storage, no query layer, no webhook delivery, and no typed projections. Used internally by the Ledger API adapter; insufficient on their own for application teams. |
| **Splice SDK / Daml SDK** | Application-development frameworks; they do not include indexing, persistent storage, or notification components and are not designed to be extended into one. |
| **The Graph, SubQuery, generic blockchain indexers** | Do not support Canton's sub-transaction privacy model and participant-local visibility boundaries. Adapting them would be a larger engineering effort than purpose-built. |
| **Pending: Canton Network Indexer (#138, zpoken)** | Different scope and audience. #138 emphasizes a three-tier architecture including cross-party aggregation with RBAC. This proposal targets per-application developer consumption (REST/GraphQL/webhook surface) on a strictly participant-local basis. The two can coexist; consolidation, if the Committee prefers it, would position this proposal's participant-local query and webhook layer above an agreed cross-party aggregator. |

**Architectural Alignment with #67 (Open-Source PQS).** The motivation in #67 calls out "auto-generated API middlewares" as the natural layer above an open-source PQS. This proposal *is* that layer. Concretely, the indexer's source-adapter interface is designed so that:

- **PQS adapter is the preferred upstream** once #67's M1 lands (open-source PQS release, expected ~3 months after #67 approval).
- **Ledger API adapter is the transitional/fallback path** for the open-sourcing window and for environments that cannot run PQS.
- **No deliverable in this proposal duplicates a deliverable in #67.** Specifically, this proposal does not enhance PQS internals, does not add features to PQS's SQL surface, and does not propose maintaining an alternative validator-indexer codebase.

The milestone sequencing is deliberate. Milestone 1 can ship against the direct Ledger API adapter while #67 completes the open-source PQS release. Milestone 2 then adds the PQS adapter after the expected PQS release window, so this proposal does not block on #67 for initial delivery and does not force a parallel validator-indexer stack once PQS is available. If PQS timing slips, the Ledger API adapter remains the supported fallback and the PQS adapter is validated against the first available open-source release or release candidate.

This alignment is not retrofitted; the architecture is structured around it from Milestone 1 (the Ledger API adapter is built behind the same interface that the PQS adapter slots into in Milestone 2).

### Why JVM for the Funded Implementation

The funded implementation is JVM-first (Scala on Java 21) to match Canton's runtime and the operating environments of institutional deployments. The Python POC was pre-grant validation work used to de-risk ingestion semantics and projection UX; it is not part of the funded delivery and is included only as feasibility evidence.

### Why REST + GraphQL API Surface

The indexer provides two first-class API surfaces. REST (OpenAPI/Swagger) gives stable HTTP contracts, generated clients, and predictable policy controls without direct database credentials. GraphQL provides flexible query composition for complex application views. Teams can use either interface or both, depending on integration requirements.

### Why Participant-Local Deployment

This service is designed for participant-local operation (one indexer per participant node). That matches Canton's privacy model and operational boundaries, and avoids assumptions that require global visibility or cross-participant state aggregation.

### Why Webhooks

Most existing Canton tooling is pull-oriented. Webhooks add push-based integration for real-time downstream workflows without polling.

### Why `.dar`-Based Schema Generation

Type information already exists in compiled `.dar` files. Reusing compiler metadata avoids parallel manual schema definitions and follows established tooling patterns (Prisma, SQLAlchemy, TypeORM). The implementation automates additive evolution while requiring explicit review for non-additive changes, balancing speed with production safety.

### Alternatives Considered

| Alternative | Why Not Chosen |
|-------------|---------------|
| Contribute to PQS directly (overlap with #67) | #67 (merged) already covers PQS open-sourcing, feature parity, and CI/CD. This proposal addresses a different layer — the application-facing REST/GraphQL/webhook surface above PQS — and explicitly avoids duplicating any #67 deliverable. |
| Build only on PQS, no Ledger API adapter | Open-source PQS is not yet released; #67's M1 is ~3 months post-approval. A PQS-only design has no path during the open-sourcing window and excludes environments that cannot run PQS. The two-adapter design covers both phases without architectural disruption. |
| Build only on the Ledger API, no PQS adapter | Misaligned with #67's stated direction of PQS as the participant-local indexer. Ignoring PQS would force every consuming dApp to choose between PQS (no HTTP API) and this indexer (parallel ingestion stack), which is the duplication #67 is trying to prevent. |
| Build funded delivery in Python runtime first | Lower alignment with JVM-focused Canton operating environments and institutional deployment standards. |

---

## Risks and Mitigations

- **Risk: Ledger API or Canton version changes impact ingestion behavior.**
  - **Mitigation:** Version compatibility matrix, integration tests against pinned versions, and documented upgrade playbook.
- **Risk: Webhook abuse or destination misconfiguration.**
  - **Mitigation:** HMAC signatures, replay-window validation, retries with backoff/dead-letter queue, and SSRF baseline controls (HTTPS-only + private-network blocking + allowlist).
- **Risk: Typed schema migration complexity for evolving Daml models.**
  - **Mitigation:** Immutable raw event/state store, additive migrations by default, migration review workflow for non-additive changes, and rollback-tested migration scripts with reindex fallback.
- **Risk: Throughput/latency regressions under production load.**
  - **Mitigation:** Benchmark suite in CI, profiling gates before release, and conservative backpressure controls.
- **Risk: Multi-synchronizer evolution introduces ordering or visibility semantics not yet exposed at the API level.**
  - **Mitigation:** Indexer is participant-local by design and indexes only what `UpdateService` emits for the connected participant. It never aggregates offsets across participants, so visibility changes that arrive as ordinary `created`/`archived` events on a participant's stream are absorbed without architectural change. Compatibility against pre-GA multi-synchronizer builds is tracked in CI as the API evolves, and any required adjustments are flagged before downstream consumers are affected.
- **Risk: `.dar`-driven schema generation creates a Postgres DoS surface (table explosion, connection exhaustion, write storms).**
  - **Mitigation:** Schema generation is opt-in with explicit per-package allowlist (no auto-discovery by default). Configuration enforces table-count, column-count, and storage-budget limits validated at migration-plan time, before any DDL runs. Generated projections inherit connection-pool and statement-timeout caps. The benchmark profile includes a 100-template stress validation under steady-state ingestion to verify these bounds.
- **Risk: No external adopter evidence materializes within the 90-day Milestone 4 window.**
  - **Mitigation:** Milestone 2 requires integration testing against at least two candidate consumer projects, and Milestone 3 requires two public reference integrations. That means Milestone 4 outreach starts from warm design-partner and reference-integration leads rather than cold post-release discovery. If no external team can publish evidence by then, the adoption report still documents blockers, failed integration attempts, and roadmap changes, but the 20,000 CC holdback is only claimable once the required external evidence exists.
- **Risk: Lean budget constraints limit execution velocity.**
  - **Mitigation:** Strict milestone scope control, defined contingency allocation, and renegotiation triggers in the volatility stipulation.

## Assumptions

- Tech & Ops review feedback is provided within agreed milestone windows.
- Access to representative Canton test environments is available for verification.
- The required Ledger API surfaces remain available or deprecate with documented migration paths.
- External pentest vendor availability aligns with the final hardening window.

## Out of Scope

- Running a hosted multi-tenant SaaS by default.
- Constructing cross-participant global views beyond participant-local visibility boundaries.
- Modifying Canton core protocol components.
- Unlimited custom integrations for third-party systems during this grant term.
