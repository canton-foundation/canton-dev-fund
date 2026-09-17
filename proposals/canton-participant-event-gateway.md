## Development Fund Proposal

**Author:** Dhruv Sharma
**Status:** Submitted
**Created:** 2026-03-04
**Updated:** 2026-05-30
**Label:** dapp-integration

**[Champion](https://github.com/canton-foundation/canton-dev-fund/blob/main/sig-directory.md):** need Champion

---

## Abstract

Canton Participant Event Gateway is an open-source, participant-local application event delivery service for Canton dApps. It connects directly to a Canton participant through the Ledger API, lets app teams define interface-aware event subscriptions, and delivers those events through authenticated REST replay APIs and reliable webhooks.

This revision makes one explicit architectural decision:

**The funded core works end-to-end without PQS. Direct Ledger API ingestion is the canonical source.**

PQS and Canton Index remain complementary infrastructure, but they are not required dependencies and are not part of this funded scope. The gateway is not a validator indexer, not a general SQL/document query engine, and not a PQS replacement. It is the application delivery layer that dApp backends need when they want interface-aware event routing, webhook delivery, replay, audit logs, and party-scoped API access without each team rebuilding that plumbing.

The design treats Daml `interfaces` as first-class selectors. Template-specific subscriptions are supported for apps that need them, but the default model is "subscribe to this business interface and deliver matching creates, archives, exercises, and replay events to my app."

**POC source code:** https://github.com/illegalcall/canton-indexer-poc
**Demo video:** https://www.loom.com/share/87fcd6ad0f664ba0a0422270d2b97422

The current POC was built before this gateway-focused revision, but it already validates the hard parts this proposal keeps: Ledger API event ingestion, durable checkpointing, crash recovery, REST access, HMAC-signed webhook delivery, and typed application-side event handling.

---

## Specification

### 1. Objective

Deliver a production-ready, open-source participant event gateway that app teams can deploy beside their Canton participant to receive and replay the events their application cares about.

The funded system provides:

1. Direct Ledger API ingestion from one participant.
2. Interface-first and template-aware event subscription configuration.
3. A durable participant-local event log for replay, delivery audit, and webhook recovery.
4. REST/OpenAPI endpoints for event history, replay, subscription management, and delivery status.
5. Reliable webhook delivery with signatures, retries, dead-letter queues, and replay.
6. Party-scoped JWT/OIDC authorization aligned with the connected participant.
7. Docker and Helm packaging, operational docs, and reference integrations.

The single product outcome is: a dApp team can declare the Daml interfaces and parties it cares about, start the gateway, and receive signed, replayable application events without building its own Ledger API ingestion loop, offset store, retry system, webhook delivery system, or party-authorization layer.

### 2. Problem

Most Canton application teams eventually need the same backend plumbing:

- subscribe to participant-local ledger updates,
- filter events by party and business type,
- expose recent event history to app services,
- trigger downstream workflows when contracts are created, archived, or exercised,
- retry failed deliveries,
- let operators inspect delivery failures,
- preserve replayability after outages,
- enforce party-scoped access for app APIs.

Today those pieces are typically rebuilt inside each app backend. PQS solves a different problem: it gives operators a SQL operational data store. Canton Index also targets a different layer: it consumes PQS and materializes developer-defined document queries. This proposal deliberately takes the other path suggested in review: build the application event delivery layer end-to-end on the Ledger API, without requiring PQS.

### 3. Scope Boundaries

This proposal is deliberately narrow.

**In scope:**

- participant-local event ingestion from the Ledger API,
- interface-aware subscription and delivery,
- webhook delivery and replay,
- REST/OpenAPI event history and operational APIs,
- party-scoped auth,
- deployment packaging,
- reference integrations with app/tooling teams.

**Out of scope:**

- general-purpose SQL analytics,
- a document-query engine,
- GraphQL as a core funded deliverable,
- network-wide or cross-participant indexing,
- replacing or modifying PQS,
- modifying Canton core protocol components,
- building a hosted multi-tenant SaaS.

### 4. Relationship to PQS, Canton Index, and Existing Tools

| Tool / Proposal | Layer | Relationship |
|---|---|---|
| **PQS / #67** | Participant-local SQL operational data store | Complementary. PQS is the right SQL/indexer layer and has already been funded as a common good. This gateway does not duplicate PQS internals or its SQL query surface. |
| **Canton Index / #319** | PQS-based document projection and query API | Complementary but adjacent. Canton Index turns PQS rows into queryable documents. This gateway focuses on Ledger API event delivery, webhook reliability, replay, and party-scoped application integration. |
| **Ledger API client libraries** | Low-level transport | Used by this gateway. They do not provide durable delivery, replay, webhook signing, dead-letter handling, or application-facing operational APIs. |
| **dApp SDK / wallet tooling** | App integration and wallet connectivity | Potential consumers. They still need participant-side event delivery and replay for app-specific backend workflows. |
| **LocalNet / dev tooling** | Development environment | Potential consumer. The gateway can provide event fixtures and webhook workflows for local demos and integration tests. |

This separation is intentional. Canton now has strong movement around the base data layer. The missing common-good component for app teams is the event delivery layer above a participant, not another query/indexing stack.

### 5. Implementation Mechanics

#### Core Architecture

The service runs in five layers:

1. **Ledger API Source:** Connects to `StateService` and `UpdateService` for active-contract bootstrap and update streaming.
2. **Selector Engine:** Applies party, interface, template, choice, and event-kind filters from declarative subscription configuration.
3. **Durable Event Log:** Stores normalized event envelopes, raw payload references, offsets, subscription matches, and delivery state in PostgreSQL.
4. **Delivery Runtime:** Signs webhook payloads, performs retries/backoff, records delivery attempts, and routes failures to a dead-letter queue.
5. **Application API:** Exposes REST/OpenAPI endpoints for replay, event history, subscription management, delivery inspection, and operational health.

#### Technology Stack

| Component | Technology | Rationale |
|---|---|---|
| Language | Scala, Java 21 | Canton-aligned JVM runtime, strong typed APIs, production operations fit |
| Ledger API client | `com.daml:bindings-java` + gRPC Netty | Typed Ledger API access and mature gRPC transport |
| HTTP framework | Tapir + Apache Pekko HTTP | Typed REST endpoints and OpenAPI generation |
| Database | PostgreSQL 16+ | Durable event log, delivery ledger, replay, and operational inspection |
| DB access | Slick 3.5 + HikariCP | Type-safe queries, connection pooling, transaction control |
| Migrations | Flyway | Reviewable and repeatable schema migration workflow |
| Webhook client | sttp client3 | Timeout, retry, and observability support |
| Packaging | Docker + Helm | Standard deployment path for app teams and validators |

#### Ledger API Ingestion

The gateway:

1. Bootstraps active state through `StateService.GetActiveContracts()` where a subscription requires active-state replay.
2. Streams updates through `UpdateService.GetUpdates()`.
3. Uses explicit party scope from configuration or participant user/party discovery where available.
4. Commits received events and checkpoint offsets atomically.
5. Resumes deterministically after restart.
6. Applies idempotent writes so retrying a batch cannot duplicate event records.

Processing semantics:

- at-least-once ingestion,
- effectively-once persistence through idempotent writes,
- at-least-once webhook delivery,
- replay APIs for application-level recovery.

#### Interface-First Subscription Model

Subscriptions are written around business interfaces where possible:

```yaml
subscriptions:
  - name: payment-stream-lifecycle
    parties:
      - ${APP_PARTY}
    interfaces:
      - package: splice-payment-streams
        module: Splice.Payment.Stream
        entity: StreamView
    eventKinds:
      - created
      - archived
      - exercised
    webhook:
      url: https://app.example.com/canton/events
      signingSecretRef: payment-stream-webhook-secret
```

Template-level selectors remain available for apps that intentionally target a concrete template:

```yaml
subscriptions:
  - name: treasury-transfer-events
    parties:
      - ${TREASURY_PARTY}
    templates:
      - package: splice-api-token-holding-v1
        module: Splice.Api.Token.HoldingV1
        entity: Holding
    eventKinds:
      - created
      - archived
```

The implementation treats interface selectors as first-class configuration. Where the Ledger API exposes interface views or interface identifiers directly, the gateway uses them. Where the current API surface requires template-level filtering, the gateway resolves interface-to-template mappings from allowlisted `.dar` metadata and records that mapping in the subscription audit log. If a selector cannot be resolved safely, configuration validation fails before the gateway starts.

This explicitly addresses the review concern that Daml `interfaces` should not be secondary to templates.

#### REST/OpenAPI Surface

The API surface is operational and event-delivery focused, not a general query engine.

Initial endpoints:

- `GET /v1/events` - paginated event history for authorized parties and subscriptions.
- `POST /v1/events/replay` - replay a bounded range of events to a webhook or return them to the caller.
- `GET /v1/subscriptions` - list configured subscriptions and selector status.
- `GET /v1/deliveries` - inspect webhook delivery attempts and failures.
- `POST /v1/deliveries/{id}/retry` - retry a failed delivery.
- `GET /v1/health` and `GET /v1/metrics` - health and observability.

The REST API is intentionally narrower than GraphQL or a document-query system. It answers application delivery questions: "what events matched my subscription?", "what failed?", "can I replay this range?", and "which party/subscription is authorized to see this?"

#### Webhook Delivery

When an event matches a subscription, the gateway:

1. Builds a normalized event envelope.
2. Signs it with HMAC-SHA256.
3. Includes timestamp and idempotency headers.
4. Delivers to the configured HTTPS endpoint.
5. Retries failures with bounded backoff.
6. Records every attempt.
7. Moves exhausted deliveries to a dead-letter queue.
8. Allows authorized replay.

Payloads include enough metadata for downstream idempotency:

- participant ID,
- synchronizer/domain metadata where available,
- offset,
- event ID,
- contract ID,
- interface/template identifier,
- event kind,
- party scope,
- subscription name,
- payload,
- signature timestamp.

#### Security and Privacy Controls

- **Participant-local boundary:** One gateway connects to one participant and indexes only events visible to that participant's hosted parties.
- **Party-scoped authorization:** API requests are checked against party claims and subscription scope.
- **JWT/OIDC:** Issuer, JWKS, and audience validation.
- **Mapped-claims mode:** Optional mapping to participant parties via explicit allowlist or participant user-management lookup where available.
- **Webhook integrity:** HMAC signatures, timestamp replay-window checks, and idempotency keys.
- **Webhook SSRF controls:** HTTPS-only targets, private-network/IP blocking, and optional destination allowlists.
- **Secret storage:** KMS or equivalent encrypted-at-rest secret references with rotation support.
- **Audit log:** Subscription changes, authorization failures, delivery attempts, replay requests, and secret changes are logged.

### 6. Architectural Alignment

**Canton privacy model.** The gateway is participant-local. It does not attempt to reconstruct global state and does not cross participant privacy boundaries.

**No cross-participant consistency claim.** Each deployment sees only its participant's event stream. The gateway does not provide global ordering, global snapshots, or cross-validator reconstruction.

**Multi-synchronizer compatibility.** Offsets and synchronizer metadata are stored as emitted by the Ledger API. The gateway does not infer network-wide ordering from local offsets. Application correlation uses explicit business identifiers and party-visible events, not offset ordering across participants.

**CIP alignment.**

- **CIP-0082 / CIP-0100:** open-source common-good infrastructure funded by the Development Fund.
- **CIP-0056 / token standard workflows:** token lifecycle events are natural gateway subscriptions.
- **CIP-0103 / dApp connectivity:** dApps and wallets need reliable participant-side event delivery to complete user-facing workflows.

### 7. Backward Compatibility

This is a new standalone service. It does not modify Canton nodes, participant configuration, Daml models, PQS, Scan, or Splice components.

The REST API is path-versioned under `/v1`. Additive event fields are allowed within a major version. Breaking API changes require a new major path, deprecation notes, and a migration guide.

Subscription configuration is versioned separately so operators can validate and migrate configuration files before rollout.

## Milestones and Deliverables

### Milestone 1: Core Participant Event Gateway (8 weeks)

- **Funding:** 120,000 CC
- **Focus:** Direct Ledger API ingestion, durable event log, interface-first subscriptions, and basic REST/webhook delivery.
- **Deliverables / Value Metrics:**
  - Scala/JVM Ledger API ingestion service.
  - Durable PostgreSQL event log with atomic offset checkpointing.
  - Declarative subscription configuration for parties, interfaces, templates, choices, and event kinds.
  - Interface selector validation using Ledger API/package metadata and allowlisted `.dar` files.
  - REST/OpenAPI event history endpoint.
  - Basic webhook delivery with HMAC signatures.
  - Docker image published to GitHub Container Registry.
  - Unit tests with >80% line coverage.
  - Integration tests against Canton sandbox or cn-quickstart.
  - Crash recovery test: kill mid-stream, restart, resume without event loss or duplicate persisted records.

### Milestone 2: Production Delivery and Security (8 weeks)

- **Funding:** 120,000 CC
- **Focus:** Make event delivery reliable and operationally safe.
- **Deliverables / Value Metrics:**
  - Retry/backoff policy and dead-letter queue.
  - Authorized replay API for bounded event ranges.
  - Delivery inspection and manual retry endpoints.
  - JWT/OIDC party-scoped authorization.
  - Webhook timestamp replay protection and idempotency headers.
  - Webhook SSRF controls: HTTPS-only, private-network blocking, and optional allowlists.
  - Secret rotation workflow and audit logging.
  - Prometheus metrics and Grafana dashboard.
  - Load profile: sustain >100 matched events/second under benchmark conditions.
  - Webhook delivery success >99% over a 1-hour controlled test with retryable failures.

### Milestone 3: Packaging, Documentation, and Reference Integrations (6 weeks)

- **Funding:** 60,000 CC
- **Focus:** Make the gateway easy to adopt and prove it against app-like workflows.
- **Deliverables / Value Metrics:**
  - Helm chart validated on Kubernetes 1.28+.
  - Production deployment guide for a single participant.
  - Developer guide, REST API reference, webhook integration guide, and security guide.
  - Example webhook consumers in TypeScript and Go.
  - Tutorial: "Subscribe to your first Canton interface event in 10 minutes."
  - Two public reference integrations:
    - one backend workflow using webhook delivery and replay,
    - one frontend/backend workflow using REST event history.
  - Repository handoff package: maintainer docs, release checklist, support process, and ownership-transfer request.

### Milestone 4: Adoption Validation (90 days after M3)

- **Funding:** 100,000 CC
- **Focus:** Tie a meaningful portion of payment to external validation, not only artifact delivery.
- **Deliverables / Value Metrics:**
  - Public adoption report covering installs, integration attempts, feedback, support load, unresolved blockers, and roadmap changes.
  - At least two external integration attempts with teams outside the proposer group, documented publicly or with written confirmation that can be shared with the committee.
  - At least one external evidence item:
    - public PR consuming the gateway,
    - written adopter attestation,
    - public reference integration by a team outside the proposer group,
    - or non-team usage telemetry for a real installation.
  - Distribution metrics reported separately: GitHub stars, forks, container pulls, Helm pulls, and open issues. These are supplemental only and do not satisfy adoption evidence by themselves.

Milestone 4 intentionally holds back 25% of the total request. If external adoption does not materialize, the implementation can still be useful open source, but the final adoption tranche is not claimable until the external evidence threshold is met.

---

## Acceptance Criteria

The Tech & Ops Committee can evaluate completion based on:

- all milestone deliverables completed,
- working demo against a live Canton environment or representative LocalNet,
- reproducible test and benchmark artifacts,
- public source code under Apache 2.0,
- security controls tested,
- documentation sufficient for a new app team to integrate,
- adoption evidence for Milestone 4.

**Milestone 1 acceptance:**

- Gateway streams events from a Canton participant through the Ledger API.
- Interface and template selectors validate before runtime.
- Matched events are persisted with checkpoint-consistent offsets.
- REST event history works with pagination.
- Webhooks are signed and delivered.
- Crash recovery resumes from the last committed checkpoint.

**Milestone 2 acceptance:**

- Failed webhook deliveries enter retry and then dead-letter state.
- Authorized replay can resend a bounded event range.
- Cross-party API access attempts are rejected.
- JWT/OIDC validation tests pass.
- Webhook replay-window and signature tests pass.
- SSRF baseline tests pass.
- Metrics are scrapeable and dashboard renders.

**Milestone 3 acceptance:**

- Docker and Helm deployment paths work.
- Docs cover configuration, security, replay, and operations.
- Two reference integrations are published with source code and setup instructions.

**Milestone 4 acceptance:**

- Adoption report is published.
- Two external integration attempts are documented.
- At least one external adoption evidence item is provided.

---

## Benchmark Methodology

Performance acceptance is evaluated with a reproducible benchmark profile:

- **Environment:** app service and PostgreSQL on dedicated instances, minimum 4 vCPU, 16 GB RAM, SSD storage.
- **Dataset:** at least 1,000,000 stored event envelopes across 20+ templates/interfaces.
- **Load:** steady and burst event streams, concurrent REST reads, webhook retries, and replay requests.
- **Measurements:** p50/p95/p99 ingestion latency, delivery latency, replay latency, API latency, error rate, and restart recovery time.
- **Artifacts:** benchmark scripts, environment config, and raw results published in the repository.

Targets:

- mean matched-event persistence latency <1s under benchmark profile,
- REST event-history p95 <150ms for indexed party/subscription queries,
- sustained >100 matched events/second,
- restart recovery <5s after process kill under controlled test,
- webhook delivery success >99% over a controlled 1-hour run with retryable failures.

---

## Funding

**Total Funding Request: 400,000 CC**

At a planning reference of **0.15 USD/CC**, this corresponds to approximately **60,000 USD**.

### Payment Breakdown

| Milestone | Funding |
|---|---:|
| M1: Core Participant Event Gateway | 120,000 CC |
| M2: Production Delivery and Security | 120,000 CC |
| M3: Packaging, Documentation, and Reference Integrations | 60,000 CC |
| M4: Adoption Validation | 100,000 CC |
| **Total** | **400,000 CC** |

### Budget Assumptions

Execution model: Dhruv is the full-time lead engineer. Two additional engineers are available part-time for focused workstreams: API surface, security hardening, integration testing, and packaging.

- Lead engineer: 6 months x 2,500 USD/month = 15,000 USD
- Engineer 2 part-time: 6 months x 2,000 USD/month = 12,000 USD
- Engineer 3 part-time: 6 months x 1,500 USD/month = 9,000 USD
- Infrastructure, CI, staging, observability = 5,000 USD
- External security review / penetration test = 8,000 USD
- Operations, legal/admin, backups, artifact hosting = 3,000 USD
- Contingency reserve = 8,000 USD
- **Total:** 60,000 USD

Milestone 4 is not extra funding. It moves a meaningful portion of the total request into an adoption-gated tranche.

### Volatility Stipulation

The funded implementation is expected to complete in approximately 22 weeks, with Milestone 4 delivered 90 days after Milestone 3. Because the full acceptance window can exceed 6 months, the grant is denominated in fixed Canton Coin and any unaccepted milestone amount may be reviewed at the 6-month mark under the Development Fund process if material price volatility or committee-requested scope changes occur.

---

## Maintenance and Ownership Plan

Dhruv Sharma remains the primary maintainer for **12 months after Milestone 3 acceptance**.

- **P1 security issue / production outage:** acknowledge within 4 hours, mitigation within 24 hours.
- **P2 major functional regression:** acknowledge within 1 business day, patch within 5 business days.
- **P3 normal bug / enhancement:** acknowledge within 3 business days and schedule into a planned release.
- **Compatibility policy:** maintain a compatibility matrix for supported Canton/Daml versions.
- **Release cadence:** patch and minor releases based on issue volume and compatibility needs.
- **Security process:** coordinated vulnerability disclosure and emergency patch path.
- **Continuity:** if maintenance demand exceeds grant assumptions, a continuation maintenance proposal can be submitted with usage and support-load evidence.

---

## Co-Marketing

1. **M1:** demo video showing Ledger API ingestion, interface subscription, REST history, and webhook delivery.
2. **M2:** technical post on reliable webhooks, replay, party-scoped auth, and operational lessons.
3. **M3:** launch announcement with tutorial, reference integrations, and call for design partners.
4. **M4:** adoption report summarizing real integration attempts and open blockers.

---

## Motivation

### Why This Direction

The earlier proposal tried to preserve two directions: a PQS-facing API/query layer and a standalone application event layer. Review feedback correctly identified that this made the architecture harder to evaluate and risked overlap with the emerging PQS ecosystem.

This revision chooses one design:

**Build the participant-local application event gateway end-to-end without PQS.**

That choice avoids:

- requiring app teams to run PQS just to receive webhooks,
- storing everything twice by default,
- competing with PQS or Canton Index,
- overloading the proposal with both query-engine and delivery-system claims.

The result is narrower and more useful to application teams that need event delivery, replay, and backend integration.

### App Developer Use Cases

Concrete workflows this gateway supports:

- A wallet backend receives token holding and transfer events and updates user-facing activity feeds.
- A payment-streaming app receives stream-created, stream-withdrawn, and stream-archived events and triggers notifications.
- An x402 facilitator receives payment settlement events and replays missed webhook ranges after downtime.
- A data-standard consumer subscribes to oracle publication interfaces and drives off-ledger risk checks.
- A LocalNet/devkit demo uses gateway webhooks to show real app lifecycle events without writing a custom ingestion loop.

These are application workflows, not analytics workflows. That distinction is why this proposal should not be evaluated as another indexer.

### Quantified Ecosystem Benefit

The duplicated work avoided per app includes:

- Ledger API update stream wiring,
- offset persistence,
- reconnect and crash recovery,
- event filtering,
- webhook signing,
- retry/dead-letter handling,
- replay APIs,
- delivery observability,
- party-scoped authorization.

For a typical app team, this is plausibly 3-6 engineering weeks of backend infrastructure before they can focus on application logic. The gateway turns that into deployable shared infrastructure.

### Target Design Partners

The proposal will seek feedback from adjacent app/tooling proposals where event delivery and replay are directly relevant:

| Proposal | Why feedback matters |
|---|---|
| #46 C# / .NET SDK | Enterprise .NET app developers need a backend event delivery pattern. |
| #69 dApp SDK and wallet tooling | Wallet/dApp workflows need participant-side event delivery and replay. |
| #78 x402 Canton integration | Payment settlement and API monetization flows need reliable event callbacks. |
| #94 Canton Payment Streams | Stream lifecycle events are a direct webhook/replay use case. |
| #113 Data Standard | Interface-aware oracle publication events are a direct subscription use case. |
| #18 / #318 LocalNet/dev tooling | Demos and integration tests need event fixtures and webhook workflows. |

Milestone 3 and Milestone 4 turn this outreach into acceptance criteria rather than treating it as marketing.

---

## Rationale

### Why Not Build On PQS

PQS is valuable, but it is not required for this product. For webhook delivery and application replay, the Ledger API is the more direct source:

- fewer components for small app teams to operate,
- fewer default storage layers,
- no dependency on PQS release timing,
- no ambiguity with PQS or Canton Index scope,
- clearer party/participant alignment.

PQS compatibility can be revisited later if adopters specifically ask for it, but it is deliberately outside this funded core.

### Why Not GraphQL In Core Scope

GraphQL is useful for flexible querying, but that moves the proposal back toward a general query engine and closer to Canton Index. The funded core focuses on REST replay and webhook delivery because those are the differentiated application-integration needs.

### Why Interface-First

Canton applications increasingly use Daml interfaces to express business-level interoperability. If the gateway forced teams to subscribe only to templates, it would encode implementation detail into app integration. Interface-first selectors let teams subscribe to business events even as implementations evolve.

### Why Store Events If This Is Not An Indexer

The durable store exists for delivery correctness, replay, audit, and operational visibility. It is not intended as a general analytical warehouse. The schema is optimized for event envelopes, delivery attempts, subscriptions, and replay ranges.

---

## Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Interface filtering support varies across Ledger API/package metadata surfaces | Validate selectors before runtime; use allowlisted `.dar` metadata for interface-to-template resolution where needed; fail closed if mappings are ambiguous. |
| The proposal is still perceived as an indexer | Rename, remove PQS dependency, remove general query-engine claims, and state non-goals clearly. |
| Webhook abuse or misconfiguration | HMAC signatures, replay windows, HTTPS-only destinations, private-network blocking, allowlists, retries, and dead-letter queue. |
| App teams do not adopt quickly enough | Hold back 25% of funding for external validation and require public integration evidence. |
| Canton API changes affect ingestion | Maintain compatibility matrix, integration tests against supported versions, and documented upgrade path. |
| Multi-synchronizer semantics evolve | Store synchronizer metadata as emitted, avoid global-ordering claims, and keep application correlation based on business identifiers. |
| Lean budget creates delivery pressure | Narrow scope, remove GraphQL/PQS/query-engine work from core, and reserve M4 for adoption rather than additional platform features. |

---

## Assumptions

- The connected participant exposes the required Ledger API services for the configured parties.
- App teams can provide webhook endpoints and party-scoped credentials for integration testing.
- Reviewer feedback is provided in time to incorporate before milestone acceptance.
- Representative LocalNet or DevNet environments are available for verification.

## Out of Scope

- Hosted SaaS operation.
- PQS adapter implementation.
- GraphQL endpoint.
- General-purpose document query language.
- Typed analytical projections.
- Cross-participant or global network index.
- Canton protocol changes.
- Unlimited third-party custom integrations.
