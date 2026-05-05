**Author:** Anand <anand@qasara.ai>, Qasara
**Status:** Submitted
**Created:** 2026-05-05
**Label:** canton-apis
**Champion:** Jatin <jatin@canton.foundation>

---

# Canton Event Stream — Real-Time Ledger Events via WebSocket & SSE

> Canton Development Fund Proposal
> Funding request: 300,000 CC across 3 milestones (6 weeks)

---

## Abstract

Canton Event Stream is an open-source, MIT-licensed, self-hostable Node.js service that connects to any Canton participant node and delivers classified, party-routed ledger events to application clients over WebSocket and Server-Sent Events (SSE). It fills the missing push layer in the Canton ecosystem — the infrastructure between the raw JSON Ledger API stream and the live UIs, deposit detectors, and reactive backends that real applications need. The core implementation already exists and runs against Canton DevNet inside Qasara's commercial Canton Gateway; this proposal extracts and open-sources it as a standalone package, complementing PQS (CIP-0100, the pull/SQL layer) on the same validator without overlap.

---

## Specification

### 1. Objective

Provide every Canton application team with a maintained, open-source push layer for ledger events — classified into named application events (`transfer.executed`, `transfer.rejected`, etc.), routed by party, and exposed over WebSocket and SSE so that browsers, mobile apps, and reactive backends can subscribe directly without each team rebuilding the same classification, fanout, and reconnection plumbing from scratch.

The intended outcome: within 12 months of M1 release, building a real-time Canton dApp UI requires running a single Docker container alongside a validator — not designing and operating bespoke event-routing infrastructure.

### 2. Implementation Mechanics

**Architecture:**

```
Canton Participant Node
     │
     │  JSON Ledger API (WebSocket)
     │  subscribeToUpdates({ interfaceIds: [...Splice CIPs...] })
     ▼
┌─────────────────────────────────┐
│       Ledger Ingester           │
│  - Splice interface subscription│
│  - Event classification         │
│  - Batch pub to Redis pipeline  │
│  - Exponential backoff reconnect│
└──────────────┬──────────────────┘
               │  Redis Pub/Sub
               │  channel: party:<partyId>
               │  buffer:  eventbuf:<eventId> (5-min TTL)
               ▼
┌─────────────────────────────────┐
│      Event Stream Server        │
│  - WebSocket endpoint           │
│  - SSE endpoint                 │
│  - Multi-party subscription     │
│  - Reconnect replay from buffer │
│  - Token-based auth             │
└──────────────┬──────────────────┘
               │
     ┌─────────┴──────────┐
     ▼                    ▼
WebSocket clients     SSE clients
(browser dApps,    (server backends,
 mobile apps)       monitoring tools)
```

**Workflow:**

1. The Ledger Ingester connects to a Canton participant's JSON Ledger API and subscribes to ledger updates using Splice interface IDs (CIP-0056 token holdings + transfer instructions), with fallback to template-based subscription on nodes that do not yet support interface filtering.
2. Raw DAML contract events are classified by parsing `templateId` and exercised choice names into human-readable typed events (`transfer.pending`, `transfer.executed`, `transfer.accepted`, `transfer.rejected`, `transfer.withdrawn`, `contract.created`, `contract.archived`).
3. Events are routed by extracting `signatories`, `observers`, `witnessParties`, and `actingParties` across event types, then fanned out to subscribers via per-party Redis Pub/Sub channels.
4. Events are buffered for 5 minutes to support reconnection replay via `lastEventId` — clients reconnect and request all buffered events since a given event ID without losing data.
5. Application clients (browsers, mobile, server backends) connect to the Event Stream Server's WebSocket or SSE endpoint with a party-scoped token; they never connect to the participant node directly.
6. The whole service ships as a single Docker image deployable alongside any Canton node, with Redis as its only persistent dependency.

**Event format** — all events follow a consistent schema regardless of source:

```json
{
  "eventId": "1220abc...def-uuid",
  "partyId": "alice::1220...",
  "type": "transfer.executed",
  "timestamp": "2026-04-07T12:00:00.000Z",
  "data": {
    "contractId": "00abc...",
    "templateId": "Splice.Amulet:Amulet",
    "choice": "Transfer",
    "consuming": true,
    "updateId": "1220...",
    "effectiveAt": "2026-04-07T12:00:00.000Z"
  }
}
```

**Event types:**

| Type | Trigger |
|---|---|
| `transfer.pending` | TransferInstruction contract created |
| `transfer.executed` | Transfer/Execute choice exercised |
| `transfer.accepted` | Accept choice exercised |
| `transfer.rejected` | Reject choice exercised |
| `transfer.withdrawn` | Withdraw choice exercised |
| `contract.created` | Any non-transfer contract created |
| `contract.archived` | Any contract archived |

**Splice interface support** — interface-based subscription rather than template-based, making the ingester forward-compatible with new CIP-0056 token implementations without code changes:

- `#splice-api-token-holding-v1:Splice.Api.Token.HoldingV1:Holding`
- `#splice-api-token-transfer-instruction-v1:Splice.Api.Token.TransferInstructionV1:TransferInstruction`

**Stack:** TypeScript / Node.js, `@canton-network/wallet-sdk` for ledger access, Redis for fanout and replay buffer, single Docker image (~150 MB), Helm chart for Kubernetes deployment.

### 3. Architectural Alignment

**Ecosystem Infrastructure**: Real-time event delivery is foundational. Wallet UIs, exchange deposit detection, DeFi liquidation triggers, RFQ negotiation, and compliance monitoring all depend on reliable push notifications from the ledger.

**Developer Experience**: Today every team solves this independently. A single, well-maintained open-source solution eliminates duplicate engineering and reduces the surface area for subtle bugs in each custom implementation.

**Complementary to PQS (CIP-0100)**: PQS is the pull layer (offset-paged SQL queries against a materialized Postgres ODS). Canton Event Stream is the push layer. Production applications need both. PQS exposes no LISTEN/NOTIFY, no change feed, no subscription primitive — it is exclusively offset-paged query functions. (Detailed comparison in Rationale below.)

**CIP-0056 alignment**: Interface-based subscription means the ingester works with any CIP-0056 compliant token without modification, supporting the Canton multi-asset future.

**Canton 3.5 alignment**: The compatibility matrix (M3) targets Canton 3.5+ explicitly, in line with the mid-June 2026 protocol upgrade.

### 4. Backward Compatibility

No backward compatibility impact. Canton Event Stream is additive infrastructure that subscribes to the existing JSON Ledger API; it does not modify Canton, Splice, or any existing client interface. Validators electing to deploy it run a new sidecar Docker container — no changes to their participant node, no schema migrations, no client breakage.

---

## Milestones and Deliverables

### Milestone 1: Standalone Package + Replay
- **Estimated Delivery:** Week 2
- **Focus:** Extract core ingester from Qasara's commercial gateway into a self-contained MIT-licensed package; add reconnection replay.
- **Deliverables / Value Metrics:**
  - npm package decoupled from Qasara's auth, API key, and database systems
  - Standalone configuration via environment variables only (no Prisma, no external DB dependency)
  - Multi-auth support: sandbox HMAC, DevNet OAuth2 ClientCredentials, configurable per deployment
  - `lastEventId` replay on reconnect (5-minute buffer window)
  - Docker image published to GitHub Container Registry
  - Unit tests (≥80% coverage on ingester and event classification logic)
  - GitHub Actions CI: lint, test, Docker build on every PR

### Milestone 2: Integration Tests + AsyncAPI Spec
- **Estimated Delivery:** Week 4
- **Focus:** Production-grade test coverage and developer-facing API documentation.
- **Deliverables / Value Metrics:**
  - End-to-end integration test suite against Canton Quickstart in CI:
    - WebSocket connect, subscribe, receive events, disconnect
    - SSE connect, receive events, disconnect
    - Stream token issue/use-once/reject-second-use
    - `lastEventId` replay after disconnect
    - Invalid token rejection
    - Multi-party subscription routing
  - AsyncAPI 3.0 specification covering both WebSocket and SSE endpoints, published and rendered as documentation
  - `docker-compose.yml` for local development (redis + canton-event-stream + Canton Quickstart)
  - Published developer quickstart guide: zero-to-events in under 10 minutes

### Milestone 3: Production Hardening + Community Onboarding
- **Estimated Delivery:** Week 6
- **Focus:** Make the service safely runnable on production validators and ready for community adoption.
- **Deliverables / Value Metrics:**
  - Helm chart for Kubernetes deployment with configurable replicas, resource limits, and Redis connection settings
  - Prometheus metrics endpoint (`/metrics`): active connections, events/sec, Redis publish latency, reconnect count
  - Grafana dashboard JSON
  - Structured JSON logging with configurable log level
  - Compatibility matrix: Canton Quickstart, Canton 3.5+ DevNet, MainNet validator (Canton 3.5+), Splice 0.5.x and 0.6.x
  - Security checklist: stream token entropy, WebSocket connection limits, Redis ACL configuration guide
  - Contributor guide and governance documentation
  - 12-month maintenance commitment: security patches, Splice/SDK version compatibility updates, issue triage

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion against ecosystem-value metrics for each milestone, supported by underlying artifact evidence.

### Milestone 1 — Adoption-readiness
- ≥1 external developer (non-Qasara) successfully connects to Canton Quickstart and receives classified events using only the published README — no Qasara-specific guidance required
- Reconnection replay verified end-to-end: client disconnects mid-stream and recovers all events within the 5-minute buffer using `lastEventId`
- Package and Docker image publicly available on npm and GHCR; install from a fresh machine reaches a working event stream in a single `docker compose up`
- Unit test suite passes in CI

### Milestone 2 — Developer onboarding velocity
- ≥3 external teams (validators or app builders) confirm successful local setup using the quickstart guide and provide written feedback
- AsyncAPI spec published and renderable in standard tooling (e.g., AsyncAPI Studio)
- An external tester with no prior Canton experience reaches a working event stream within 10 minutes of opening the guide
- Integration test suite passes in CI against Canton Quickstart

### Milestone 3 — Production deployment readiness
- ≥2 external production-track deployments running canton-event-stream alongside their validator (DevNet or MainNet), OR ≥1 Canton Foundation-recognized reference deployment
- Helm chart deployed and verified on a real Kubernetes cluster (not a single-node test rig)
- Compatibility matrix published with passing test results across all listed environments
- Security checklist reviewed and signed off by a Canton Foundation Tech & Ops Committee member
- ≥1 external contributor PR successfully merged following the contributor guide

---

## Funding

**Total Funding Request:** 300,000 CC

### Payment Breakdown by Milestone
- Milestone 1 (Standalone Package + Replay): **120,000 CC** upon committee acceptance
- Milestone 2 (Integration Tests + AsyncAPI Spec): **100,000 CC** upon committee acceptance
- Milestone 3 (Production Hardening + Community Onboarding): **80,000 CC** upon final release and acceptance

### Volatility Stipulation

Project duration is **under 6 months** (6 weeks planned). Should the project timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility.

---

## Co-Marketing

Upon release, Qasara will collaborate with the Canton Foundation on:

- **Announcement coordination** — joint blog post and Canton Foundation channel announcements at M1 (npm release) and M3 (production-ready release)
- **Technical case study** — a published deep-dive on the architecture, the PQS-vs-push-layer design rationale, and lessons from running this in production at Qasara
- **Reference integration** — make Qasara's Canton Gateway integration with canton-event-stream a public reference example for other dApp builders

---

## Motivation

Real-time event delivery is foundational infrastructure for the Canton dApp ecosystem. Wallet UIs, exchange deposit detection, DeFi liquidation triggers, RFQ negotiation, and compliance monitoring all depend on reliable push notifications from the ledger. Today every team solves this independently — duplicating engineering effort, multiplying the surface area for subtle bugs, and slowing dApp time-to-market.

**The raw JSON Ledger API is not the answer for application clients.** It exposes a WebSocket stream — but what that stream delivers is raw DAML contract events:

```json
{
  "update": {
    "value": {
      "updateId": "1220abc...",
      "effectiveAt": "2026-04-08T...",
      "events": [
        {
          "contractId": "00abc...",
          "templateId": "#splice-amulet-0.1.9:Splice.Amulet:Amulet",
          "signatories": ["alice::1220..."],
          "observers": [],
          "createdAt": "2026-04-08T...",
          "createdEventBlob": "CgYI..."
        }
      ]
    }
  }
}
```

To turn this into something an application can act on, every team must build event classification, party routing, multi-subscriber fanout, reconnection-with-replay, and a client-facing WebSocket/SSE server (so browsers and mobile apps don't connect to the participant node directly). This abstraction layer does not exist as a shared, maintained open-source component anywhere in the Canton ecosystem.

**Ecosystem portion benefited:** We estimate **~70% of new Canton dApp development happens on Node.js / TypeScript stacks** — the Canton Wallet SDK is TypeScript-native, and the dApp/fintech developer mainstream is Node.js. Of those teams, **all that need real-time event delivery are addressable** — every wallet UI, every exchange integration, every reactive backend. We conservatively expect **≥10 production integrations within 12 months** of M3 release, and a measurable reduction in time-to-first-event for new Canton applications. The remaining ~30% (JVM-stack teams) can still consume the WebSocket/SSE endpoints from any language; they simply gain less from the TypeScript-native implementation.

**Strategic importance:** Approving PQS (CIP-0100) without a complementary push layer leaves every Canton application team to rebuild that push layer independently — exactly the duplication a foundational push component eliminates. PQS makes ledger state queryable and historically auditable; Canton Event Stream makes ledger events deliverable to live UIs and reactive backends. Production applications need both layers.

---

## Rationale

### Why a new component, not an extension of PQS

CIP-0100 (PR #67, merged 2026-04-23) approved Digital Asset's grant to open-source PQS — the Participant Query Store — under Apache 2.0. PQS and Canton Event Stream serve different layers of the same stack and cannot be folded into one another:

| Dimension | PQS (offset-paged SQL ODS) | Canton Event Stream (push) |
|---|---|---|
| **Consumer-facing interface** | SQL API: `active()`, `creates()`, `archives()`, `exercises()` | WebSocket and Server-Sent Events |
| **Wire protocol** | PostgreSQL JDBC | WebSocket / HTTP SSE |
| **Client topology** | Server-side only (browsers cannot speak Postgres) | Browser, mobile, and server clients |
| **Authentication** | PostgreSQL roles | App-layer party-scoped tokens |
| **Event shape** | Decoded contracts in JSONB; clients implement classification | Pre-classified app events (`transfer.executed`, `transfer.rejected`, etc.) |
| **Hot-path latency** | Ledger API → PQS write → Postgres → poll | Ledger API → Redis pub/sub → WebSocket push (no DB write in the hot path) |
| **Reconnection model** | Client tracks Postgres offset; bespoke replay logic | `lastEventId` against a 5-minute event buffer, designed for browser reconnect |
| **Footprint** | JVM (4 GB / 4 cores min.) plus Postgres (8 GB / 8 cores min.) | Node.js (~150 MB image), Redis only |

The [PQS SQL API documentation](https://docs.digitalasset.com/build/3.5/component-howtos/pqs/references/sql-api.html) confirms the consumer-facing interface is exclusively offset-paged query functions — no LISTEN/NOTIFY, no change feed, no subscription primitive. Adding push to PQS would require building exactly this proposal inside a JVM project, which forces a JVM dependency on every dApp consumer (the very dependency many builders are trying to avoid).

### Why TypeScript / Node.js

Existing Canton event indexing work in the ecosystem is JVM-based (Scala). The Canton SDK itself is TypeScript-native (`@canton-network/wallet-sdk`). For teams already running a Node.js application stack — the majority of dApp and fintech developers — a TypeScript implementation:

- Eliminates a JVM dependency from their infrastructure
- Uses the same SDK they are already familiar with
- Produces a smaller Docker image (~150 MB vs ~400 MB+ JVM)
- Shares package ecosystem with the Canton Wallet SDK

JVM-stack consumers are not excluded — the WebSocket and SSE endpoints are language-neutral wire protocols, so any client (Java, Python, Rust, Go) connects without a Node.js runtime on its side.

### Why interface-based subscription

Building this on top of template-based subscription would lock the ecosystem into per-token rewrites every time a new asset launches; building on Splice interfaces (CIP-0056) means the ingester works with any compliant token without modification, supporting the Canton multi-asset future. The fallback to empty-template subscription preserves compatibility with nodes that do not yet support interface filtering.

### Coexistence on the same validator

PQS and Canton Event Stream are independent of one another and can run on the same validator without interaction. Canton Event Stream subscribes to the Canton Ledger API directly and uses Redis as its only persistent state — it does not depend on Postgres or share any infrastructure with PQS. Validators electing to run both gain queryable historical state from PQS and live event delivery from Canton Event Stream without integration work between the two.

### Alternatives considered

- **Recommend each team builds their own push layer over the JSON Ledger API.** Status quo; results in fragmented, inconsistent event semantics, duplicated bugs in classification and reconnection logic, and slow dApp time-to-market. Rejected as the explicit problem this proposal solves.
- **Add push to PQS.** Forces a JVM dependency on every consumer and changes PQS's architectural identity from a query store into a hybrid push+query system. Better served by an independent, lightweight push component.
- **Standardize on the gRPC streaming Ledger API.** gRPC streaming is excellent for server-to-server but not consumable by browsers or mobile clients without a translation proxy — exactly the proxy this proposal builds, only the WebSocket/SSE-facing version of it is broadly consumable.

---

## Maintenance Plan

- MIT license, hosted at `github.com/qasara/canton-event-stream`
- 12-month post-launch maintenance: security patches, Splice/SDK version compatibility updates
- Semantic versioning with a documented breaking-change policy
- Issues triaged weekly; critical fixes within 48 hours
- Compatibility tested against each major Splice and Canton release
- After 12 months: proposal to transfer stewardship to Canton Foundation or a community SIG if formation is possible

---

## Notes for Reviewers

1. **Core implementation exists today.** This is not a design proposal. The ledger ingester (Splice interface subscription, exponential backoff reconnect), Redis Pub/Sub fanout with batch pipeline, WebSocket endpoint, and SSE endpoint are all implemented and running in our DevNet environment as part of the Qasara Canton Gateway. The milestones deliver: extracting this into a standalone open-source package, decoupling it from Qasara's auth and API key system, adding the `lastEventId` replay query on reconnect, and adding production hardening (Helm chart, metrics, standalone Docker image). The hard engineering is done — what remains is packaging, decoupling, and documentation.

2. **TypeScript choice is intentional.** The Canton Wallet SDK is TypeScript-native. Most dApp developers are TypeScript-first. A JVM-free event stream reduces the operational complexity for the majority of Canton builders, while the language-neutral wire protocols (WebSocket + SSE) keep JVM consumers fully supported.

3. **Commercial relationship.** Qasara operates a hosted version of this infrastructure as part of our commercial Canton Gateway API. The open-source version does not include our API key management, rate limiting, or billing tier logic — those remain part of the commercial product. This is analogous to Uniswap publishing open-source contracts while running a commercial interface.

4. **Champion endorsement.** Endorsed by Parth (parth@canton.foundation), Canton Foundation.
