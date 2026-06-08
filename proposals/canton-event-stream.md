**Author:** Anand <anand@qasara.ai>, Qasara
**Status:** Submitted
**Created:** 2026-05-05
**Label:** canton-apis
**Champion:** 

---

# Canton Event Stream — Real-Time Ledger Events via WebSocket & SSE

> Canton Development Fund Proposal
> Funding request: 300,000 CC across 3 milestones (9 weeks)

---

## Abstract

Canton Event Stream is an open-source, MIT-licensed, self-hostable Node.js service that connects to any Canton participant node and delivers classified, party-authorized ledger events to application clients over WebSocket and Server-Sent Events (SSE). Canton already provides a native push *transport* (the JSON Ledger API WebSocket channels and gRPC `UpdateService.GetUpdates`); Canton Event Stream is the **application-edge layer above it** — it takes one upstream subscription, re-enforces Canton's per-party visibility at the streaming edge, classifies raw events into a stable application vocabulary, and fans them out to many clients without each client connecting to the participant or holding a ledger token. The core implementation already exists and runs against Canton DevNet inside Qasara's commercial Canton Gateway; this proposal extracts and open-sources it as a standalone package, complementing PQS (CIP-0100, the pull/SQL layer) on the same validator without overlap.

---

## Specification

### 1. Objective

Provide every Canton application team with a maintained, open-source application-edge layer over Canton's native push transport — classifying ledger events into named application events (`transfer.executed`, `transfer.rejected`, etc.), re-enforcing per-party authorization at the streaming edge, and exposing the result over WebSocket and SSE so that browsers, mobile apps, and reactive backends can subscribe without each team rebuilding the same classification, authorization, fanout, and reconnection plumbing from scratch — and without each client connecting directly to the participant.

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
3. Events are routed by extracting `signatories`, `observers`, `witnessParties`, and `actingParties` across event types, then fanned out to subscribers via per-party Redis Pub/Sub channels. Subscribers are authorized per party at subscribe time — a client may only stream parties its credential is entitled to, re-establishing at the edge the per-party visibility boundary the participant enforces natively (and that is otherwise lost once clients are decoupled from the node for fanout).
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

### Milestone 1: Standalone Package + Edge Authorization + Replay
- **Estimated Delivery:** Week 3
- **Focus:** Extract core ingester from Qasara's commercial gateway into a self-contained MIT-licensed package; build per-subscriber party authorization at the streaming edge; add reconnection replay.
- **Deliverables / Value Metrics:**
  - npm package decoupled from Qasara's auth, API key, and database systems
  - Standalone configuration via environment variables only (no Prisma, no external DB dependency)
  - Multi-auth support: sandbox HMAC, DevNet OAuth2 ClientCredentials, configurable per deployment
  - **Per-subscriber party authorization** — a client may only stream parties its credential is authorized for, enforced at subscribe time; re-establishes the node's per-party visibility boundary at the streaming edge
  - `lastEventId` replay on reconnect (5-minute buffer window)
  - Docker image published to GitHub Container Registry
  - Unit tests (≥80% coverage on ingester and event classification logic)
  - GitHub Actions CI: lint, test, Docker build on every PR

### Milestone 2: Integration Tests + AsyncAPI Spec
- **Estimated Delivery:** Week 6
- **Focus:** Production-grade test coverage and developer-facing API documentation.
- **Deliverables / Value Metrics:**
  - End-to-end integration test suite against Canton Quickstart in CI:
    - WebSocket connect, subscribe, receive events, disconnect
    - SSE connect, receive events, disconnect
    - Stream token issue/use-once/reject-second-use
    - `lastEventId` replay after disconnect
    - Invalid token rejection
    - Multi-party subscription routing
  - AsyncAPI 3.0 specification for the classified event API (WebSocket and SSE), published and rendered as documentation — distinct from Canton's native AsyncAPI spec, which documents the raw-event transport; ours documents the application-level classified-event vocabulary and the subscribe/authorize handshake
  - `docker-compose.yml` for local development (redis + canton-event-stream + Canton Quickstart)
  - Published developer quickstart guide: zero-to-events in under 10 minutes

### Milestone 3: Production Hardening + Community Onboarding
- **Estimated Delivery:** Week 9
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

Acceptance is evaluated on **value demonstrated to the ecosystem**, per Canton Development Fund guidance — each milestone is judged by a working, usable capability, with artifacts (tests, images, docs) as supporting evidence rather than the criterion itself. Targets are scoped so value can be demonstrated directly — including via Qasara's own Canton Gateway (reference integration) and MainNet validator (reference deployment) — rather than depending on third-party adoption on a fixed schedule.

### Milestone 1 — A usable, privacy-correct event layer exists
- A developer outside the core team stands up the service from the published README and receives **classified** events from Canton Quickstart — and a client requesting a party its credential is not authorized for is **rejected at subscribe time**, demonstrated live. *(Supporting evidence: ≥80%-coverage unit suite green in CI; package runs with zero Qasara dependencies; image on npm/GHCR.)*
- Qasara's Canton Gateway runs against the standalone package as the first reference integration, demonstrating the extraction is real and consumable.

### Milestone 2 — A newcomer can adopt it quickly
- An external tester with no prior Canton experience reaches a working event stream by following only the quickstart guide, **unassisted**. *(Design target: ~10 minutes of hands-on time once base images are pulled; the acceptance gate is unassisted success, not a stopwatch.)*
- The documented API behaves as specified: the published AsyncAPI spec renders in standard tooling, and the integration suite — WS/SSE lifecycle, stream-token single-use, `lastEventId` replay, invalid-token and unauthorized-party rejection, multi-party routing — passes in CI as the evidence.

### Milestone 3 — It runs in production and is community-maintainable
- ≥1 production-track deployment running alongside a validator — **Qasara's own MainNet validator as the reference deployment** — verifiable live by the committee.
- Operational readiness demonstrated: Helm deploy on a real multi-node cluster; Prometheus metrics + Grafana dashboard; and a published compatibility matrix across the listed environments (Canton Quickstart, Canton 3.5+ DevNet, MainNet validator, Splice 0.5.x/0.6.x).
- Community-ready: security checklist submitted for committee review; contributor guide published; documented 12-month maintenance commitment (SECURITY.md, release/versioning policy).

Broader external adoption — multiple third-party integrations and production deployments — is the longer-horizon measure of success; it is tracked and reported transparently after M3 (see Motivation for the 12-month projection) and is not a milestone payment gate.

---

## Funding

**Total Funding Request:** 300,000 CC

### Payment Breakdown by Milestone
- Milestone 1 (Standalone Package + Replay): **120,000 CC** upon committee acceptance
- Milestone 2 (Integration Tests + AsyncAPI Spec): **100,000 CC** upon committee acceptance
- Milestone 3 (Production Hardening + Community Onboarding): **80,000 CC** upon final release and acceptance

### Volatility Stipulation

Project duration is **under 6 months** (9 weeks planned). Should the project timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility.

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

To turn this into something an application can act on, every team must build event classification, per-party authorization at the fanout edge, multi-subscriber fanout, reconnection-with-replay, and a client-facing WebSocket/SSE server (so browsers and mobile apps don't connect to the participant node directly). This application-edge layer — distinct from Canton's native raw-event transport — does not exist as a shared, maintained open-source component anywhere in the Canton ecosystem.

**Ecosystem portion benefited:** The **majority of new Canton dApp and fintech development happens on Node.js / TypeScript stacks** — the Canton Wallet SDK is TypeScript-native, and the dApp/fintech developer mainstream is Node.js. Every team in that segment that needs real-time event delivery is addressable — wallet UIs, exchange integrations, reactive backends. JVM-stack teams are not excluded: the WebSocket and SSE endpoints are language-neutral wire protocols, so any client (Java, Python, Rust, Go) consumes them without a Node.js runtime; they simply gain less from the TypeScript-native implementation itself. We expect a measurable reduction in time-to-first-event for new Canton applications as adoption grows.

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

### Relationship to Canton's native push layer (JSON WS and gRPC streaming)

Canton already ships a native push *transport* in two forms: the gRPC `UpdateService.GetUpdates` server-stream, and the JSON Ledger API v2 WebSocket channels (`/v2/updates`, `/v2/state/active-contracts`, `/v2/commands/completions`), documented with an AsyncAPI specification. Canton Event Stream does not replace this transport — it consumes the JSON WS channel upstream. It is the application-edge layer on top of it, and the delta is the part the transport intentionally does not provide:

The native transport enforces privacy **at the node**: a subscription's token read-rights bound which parties it may filter for, so a consumer physically cannot subscribe to a party it is not authorized to see. This is correct and robust — but it is a *per-client* model. Every browser, mobile app, or microservice opens its own node subscription, holds a Ledger API token, and receives raw `Created`/`Archived`/`Exercised` primitives it must classify itself.

The moment an application introduces a fanout tier to serve many clients from one upstream subscription — which it must, to avoid exposing the participant to every client and handing every client a ledger token — **the node's per-party authorization boundary is removed from the downstream path.** Something has to re-establish it, or one party's events leak to another. A generic WebSocket fanout (Centrifugo, socket.io + Redis) cannot: it has no concept of a Canton party or of who is entitled to see whose events. Re-enforcing per-party authorization at the streaming edge is the Canton-specific, security-critical work that makes a purpose-built event gateway necessary rather than off-the-shelf pub/sub — and it is an explicit deliverable of this proposal (M1).

| Dimension | Native push (gRPC GetUpdates / JSON WS) | Canton Event Stream (application edge) |
|---|---|---|
| **Role** | Raw event transport | Edge gateway consuming that transport |
| **Privacy enforcement** | At the node, per subscription | Re-enforced at the edge, per subscriber — preserves the node's guarantee across fanout |
| **Client topology** | One node subscription per client; each holds a ledger token | One upstream subscription; many clients, none touching the node |
| **Event shape** | Raw `Created`/`Archived`/`Exercised` | Classified CIP-0056 vocabulary (`transfer.executed`, …) |
| **Participant exposure** | Every client connects to the participant | Only the gateway connects to the participant |
| **Reconnection** | Client tracks offset / `OffsetCheckpoint`s | `lastEventId` against a 5-minute buffer (no client-side offset persistence) |

In short: the native WS/gRPC layer is the origin transport; Canton Event Stream is the reverse-proxy/edge above it — classification, per-party-authorized fanout, and a participant-shielding boundary. It composes with the native layer the same way it composes with PQS on the pull side. It only ever delivers events for parties an operator is authorized to read; by Canton's authorization model it cannot expose third-party private events.

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
- **Consume the native push transport directly (gRPC streaming or the JSON Ledger API WebSocket).** Both are excellent transports, and Canton Event Stream uses the JSON WS upstream. But consuming them directly means every client opens its own node subscription, holds a Ledger API token, and classifies raw events itself — and any fanout tier added to fix that strips the node's per-party authorization boundary unless it is re-enforced at the edge. This proposal builds exactly that edge layer (classification + per-party-authorized fanout + participant shielding), not a bare protocol translator. See "Relationship to Canton's native push layer" above.

---

## Maintenance Plan

- MIT license, hosted at `github.com/Qasara-Labs-Pvt-Ltd/canton-event-stream`
- 12-month post-launch maintenance: security patches, Splice/SDK version compatibility updates
- Semantic versioning with a documented breaking-change policy
- Issues triaged weekly; critical fixes within 48 hours
- Compatibility tested against each major Splice and Canton release
- After 12 months: proposal to transfer stewardship to Canton Foundation or a community SIG if formation is possible

---

## Notes for Reviewers

1. **Core transport implementation exists today; edge authorization is the net-new build.** This is not a greenfield design proposal. The ledger ingester (Splice interface subscription, exponential backoff reconnect), Redis Pub/Sub fanout with batch pipeline, WebSocket endpoint, and SSE endpoint are all implemented and running in our DevNet environment as part of the Qasara Canton Gateway. The one piece of genuinely new engineering this grant funds is **per-subscriber party authorization at the streaming edge** (M1) — re-establishing, outside the participant, the per-party visibility boundary the node enforces natively; in the commercial gateway this is currently coupled to Qasara's API-key system, and the open-source version requires a clean, credential-agnostic implementation. The remaining milestone work is packaging, decoupling from Qasara's auth/DB systems, the `lastEventId` replay query, and production hardening (Helm chart, metrics, standalone Docker image). In short: the transport and classification are proven; the authorization layer and the productionization are what the milestones build.

2. **TypeScript choice is intentional.** The Canton Wallet SDK is TypeScript-native. Most dApp developers are TypeScript-first. A JVM-free event stream reduces the operational complexity for the majority of Canton builders, while the language-neutral wire protocols (WebSocket + SSE) keep JVM consumers fully supported.

3. **Commercial relationship.** Qasara operates a hosted version of this infrastructure as part of our commercial Canton Gateway API. The open-source version does not include our API key management, rate limiting, or billing tier logic — those remain part of the commercial product. This is analogous to Uniswap publishing open-source contracts while running a commercial interface.


