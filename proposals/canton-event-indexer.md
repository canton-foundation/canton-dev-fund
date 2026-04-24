## Development Fund Proposal

**Author:** Dhruv Sharma
**Status:** Submitted
**Created:** 2026-03-04

---

## Abstract

The Canton Event Indexer is an open-source service that connects to a Canton participant's Ledger API via gRPC, indexes transaction events into PostgreSQL, and exposes OpenAPI/Swagger REST APIs and GraphQL APIs with webhook delivery. It is a community indexer that complements existing enterprise tooling.

A proof of concept has been built and verified against a live cn-quickstart network, demonstrating sub-second indexing, crash recovery with zero data loss, HMAC-signed webhook delivery, and typed projection analytics. The POC source code and demo video are available for review.

**POC source code:** https://github.com/illegalcall/canton-indexer-poc
**Demo video:** https://www.loom.com/share/87fcd6ad0f664ba0a0422270d2b97422

---

## Specification

### 1. Objective

**Problem:** Community developers need an accessible event store and push-notification layer for Canton. PQS serves enterprise deployments as an enterprise component, leaving many open-source teams without an alternative path.

As a result, teams repeatedly reimplement gRPC consumers, offset checkpointing, recovery logic, materialized views, and notification dispatch (typically several engineering weeks of duplicate work per application).

**Intended Outcome:** A deployable, open-source service that:
1. Connects to any Canton participant's Ledger API
2. Indexes participant-visible contract events into PostgreSQL (creates/archives in Milestone 1, exercise-event enrichment in Milestone 2)
3. Exposes a REST + GraphQL query API over the indexed data
4. Delivers webhooks to registered endpoints on matching contract events
5. Generates typed PostgreSQL projection tables for all templates in supplied `.dar` packages, with additive SQL migrations
6. Handles crash recovery, reconnection, and offset management with durable checkpoints and deterministic resume behavior
7. Is packaged as Docker images and Helm charts

### 2. Implementation Mechanics

#### Core Architecture

The service runs in three layers:
- **Ingestion:** Ledger API stream consumer with atomic offset checkpointing.
- **Storage:** PostgreSQL event/state tables plus typed projection tables.
- **Access/Delivery:** REST, GraphQL, and webhook delivery endpoints over indexed data.

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

The indexer includes `.dar`-based typed schema generation. Raw Ledger API payloads are nested protobuf structures stored as JSONB. Schema-aware indexing extracts type information from compiled `.dar` files and generates typed PostgreSQL tables for all templates in configured `.dar` packages.

Raw event/state tables remain the immutable source of truth. Schema evolution follows a safety-first policy: additive changes are automated, while non-additive changes are handled through reviewed migration plans and controlled cutover.

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

**Canton Privacy Model Compliance:** The indexer is participant-local. It connects to a single participant and sees only events where that participant's hosted parties are informees. It never attempts to construct a global view and respects the participant's privacy boundary.

**One Indexer Per Participant:** Following PQS's deployment model, each participant runs its own indexer instance. No global ordering assumptions are made across participants; cross-system correlation should rely on explicitly shared business identifiers.

**Relevant CIPs:**
- **CIP-0082** (Development Fund) — this project builds open-source common-good infrastructure funded by the Development Fund
- **CIP-0100** (Governance) — proposal follows the Tech & Ops Committee evaluation framework
- **CIP-0056** (Token Standard) — the indexer captures CIP-56 token lifecycle events, enabling wallets and analytics tools to build on indexed data
- **CIP-0047** (Activity Markers) — the indexer captures activity-related contract events that CIP-47 tracking depends on
- **CIP-0103** (Wallet Protocol) — wallet applications can consume the indexer's REST/GraphQL API and webhook notifications instead of implementing raw gRPC consumers

**Complementary to Existing Tools:**
- Consumes the Ledger API as a read-only indexing layer
- Does not modify ledger state or participant protocol behavior
- Targets open-source community deployment while remaining compatible with enterprise operating models
- Adds webhook delivery, typed projections, and application-facing APIs
- Complements the Canton DevKit (#18), frontend libraries (#25), wallet SDKs (#4, #9), and other proposals that need an indexed data backend

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
  - `.dar` file parser extracting Daml-LF template definitions
  - CLI command `canton-indexer schema generate --dar <path>` producing reviewable SQL migrations
  - Auto-generated typed PostgreSQL tables for all templates in supplied `.dar` packages
  - Dual-write pipeline (default-enabled, configurable): raw JSONB + typed projection tables simultaneously; raw-only mode supported
  - Schema evolution: additive migrations automated; non-additive changes emitted as reviewable migration plans (not destructive DROP/CREATE)
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
- `canton-indexer schema generate --dar` produces valid SQL for all templates in the supplied `.dar` package set
- Additive schema changes are applied via generated SQL migrations; non-additive changes produce reviewable migration plans for controlled cutover
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

**Overall:**
- All source code open-source under Apache 2.0
- Demonstrated against a live Canton network (not just sandbox)

**Coordination Outcomes (non-blocking for technical completion):**
- Ownership transfer request opened to the Canton Foundation GitHub organization
- Joint launch/announcement timeline aligned with Foundation communications process

---

## Funding

**Total Funding Request: 400,000 CC**

### Payment Breakdown by Milestone
- Milestone 1 (Production-Grade Core): 150,000 CC upon committee acceptance
- Milestone 2 (Advanced Features): 170,000 CC upon committee acceptance
- Milestone 3 (Packaging & Handoff): 80,000 CC upon final release and acceptance

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

This budget emphasizes delivery and security validation within a founder-led execution model.

---

## Co-Marketing

Co-marketing commitments:

1. **Milestone 1:** Joint announcement of the open-source Canton Event Indexer with demo video showing real-time event indexing and webhook delivery against a live Canton network.
2. **Milestone 2:** Technical blog post covering GraphQL API, WebSocket subscriptions, and `.dar`-based typed schema generation with performance benchmarks.
3. **Milestone 3:** Launch announcement with developer guide, tutorial video, and call for community contributions, including publication of the repository handover package and transfer request.
4. **Community Support:** Best-effort participation in Canton community calls and support in Canton Discord/Forum during the grant and 12-month maintenance window.

---

## Maintenance and Ownership Plan

Post-grant, Dhruv Sharma remains the primary maintainer for **12 months** after final milestone acceptance.

- **Support window:** 12 months from final acceptance.
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

### The Gap is Real

Major ecosystems already provide open-source indexing infrastructure (for example: Ethereum, Solana, Polkadot, and Cosmos). Canton currently lacks a broadly adopted open-source equivalent. PQS indicates the need for this infrastructure, and this proposal provides an open-source path for teams outside enterprise licensing.

### Infrastructure Multiplier

The indexer can provide reusable infrastructure for other Development Fund projects. **Potential integration candidates** and **adjacent beneficiaries** include:

| Proposal | Benefit |
|----------|---------|
| Credix (#39) | Aligns with a PQS-style read architecture for lending workflows |
| Cast (#14) | Submission API generation can pair with a query/indexing backend for full-stack dApp flows |
| Nexus Framework (#15) | Query-centric frontend data layer can integrate with indexed read APIs |
| Framework-Agnostic Frontend (#25) | Svelte/Vue adapters can consume indexed REST/GraphQL data for app UX |
| Canton DevKit (#18), PartyLayer (#9) | Adjacent ecosystem tooling that can optionally integrate indexed data for richer DX |

This enables downstream teams to integrate query and notification capabilities without rebuilding ingestion internals.

### Adoption Signals and Utility Commitments

This proposal includes adoption-oriented outcomes in addition to technical delivery:

- Publish two integration playbooks by Milestone 2 (wallet/app backend and frontend consumption patterns).
- Publish two public reference integrations by Milestone 3.
- Publish a short adoption report at Milestone 3 (integrations completed, usage feedback, and open issues roadmap).

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
**POC source:** https://github.com/illegalcall/canton-indexer-poc — 29 Python modules + React/TypeScript dashboard (39 frontend files), 11 passing end-to-end tests.

### Developer Experience

Without shared infrastructure, teams build and maintain ingestion/query pipelines per application. With this indexer, teams can start from packaged deployment (`docker compose up`) and consume REST APIs via OpenAPI 3.1 / Swagger and GraphQL APIs, plus webhooks, directly.

---

## Rationale

### Why Open-Source Delivery in the Development Fund

The Development Fund (CIP-0082) is intended for common-good infrastructure. An open-source indexer broadens developer access and reduces repeated integration work. It complements enterprise products rather than replacing them.

### Why JVM for Funded Delivery (with Python POC Context)

- The funded implementation in this proposal is JVM-first (Scala codebase on Java 21 runtime) for alignment with Canton runtime and institutional deployment standards.
- The Python POC was pre-grant validation work to quickly de-risk core ingestion semantics and projection UX.
- This keeps milestone scope explicit while preserving prior feasibility evidence.

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
| Contribute to PQS directly | Enterprise-licensed; does not solve open-source access for the target audience. |
| Build a PQS-to-GraphQL bridge | Assumes PQS access, which the target audience lacks. |
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
- **Risk: Lean budget constraints execution velocity.**
  - **Mitigation:** Lean compensation model, strict milestone scope control, and contingency allocation.

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
