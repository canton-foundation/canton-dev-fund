# Proposal: Canton Network Indexer

**Champion:** Canton Foundation

## Objective and Scope

We want to build a production indexer for Canton. Right now one doesn't exist, and it can't be solved by plugging in The Graph or SubQuery — Canton's sub-transaction privacy model breaks every assumption those tools make. There's no global state to scrape. Each participant node only sees contracts where its hosted parties are stakeholders, and everything else is encrypted.

We've looked at how six other privacy chains handle this (Aztec, Aleo, Zcash, Namada, Secret Network, Mina). None of them are supported by any general-purpose indexer either. Every single one built custom infrastructure. Canton needs the same.

The indexer is a three-tier system:
- **Tier 1** indexes public network data (CC transfers, minting rounds, validators, governance) from the Scan API
- **Tier 2** indexes party-scoped private contracts (lifecycle events, ACS, audit trails) from the Ledger API via PQS
- **Tier 3** aggregates across parties within an organization, with RBAC for regulatory and audit views

Without this, every team building on Canton — tokenized assets, DvP settlement, fund admin, regulatory reporting — ends up rebuilding the same ingestion pipeline from scratch on top of PQS. That's wasted effort across the entire ecosystem.

**In scope:** public + private indexing, GraphQL/REST/SQL query layer, JWT party-scoped auth, Docker Compose and K8s deployment, Apache 2.0 open source.

**Out of scope:** custom Daml app development, managed hosting, changes to Canton internals, cross-chain indexing.

## Technical Approach

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                   CANTON NETWORK INDEXER                        │
├─────────────────────┬───────────────────────┬───────────────────┤
│  TIER 1: PUBLIC     │  TIER 2: PRIVATE      │  TIER 3: CROSS-   │
│                     │  (core)               │  PARTY            │
│  Source: Scan API   │  Source: Ledger API   │  Source: Tier 2    │
│  Auth:   None       │  Auth:   Party JWT    │  Auth:   RBAC JWT  │
│  Store:  PG+TS      │  Store:  PQS -> PG    │  Store:  Mat.Views │
│  Query:  REST       │  Query:  GraphQL+SQL  │  Query:  GraphQL   │
│                     │                       │                    │
│  CC transfers       │  Contract lifecycle   │  Multi-party views │
│  Minting rounds     │  ACS per party        │  Regulatory audit  │
│  Validator metrics  │  Template views       │  Cross-template    │
│  Governance         │  Party timelines      │  Retention policy  │
│  Network topology   │  Audit trails         │  GDPR compliance   │
└─────────────────────┴───────────────────────┴───────────────────┘
```

### Ingestion pipeline

```
Participant Node ──gRPC──> PQS (scribe.jar) ──> PostgreSQL (JSONB)
                                                      │
                                                  pg_notify
                                                      │
                                                Post-Processor ──> contract_state
                                                                   party_activity
                                                                   template mat.views
```

PQS handles the hard parts: gRPC streaming, offset tracking, Daml-LF serialization, crash recovery. We don't want to rewrite that. Instead we extend PQS output with a post-processor that populates indexer-specific tables (contract lifecycle state, per-party activity timelines, template-specific materialized views).

### Key decisions

**PQS as foundation, not a custom gRPC client.** PQS is maintained by Digital Asset. It already deals with Ledger API evolution (services got removed between 3.3 and 3.5). Building a custom ingester means tracking all of that ourselves. Not worth it unless we're past 1000 tx/s.

**Event sourcing.** The raw offset stream is the source of truth. Materialized views are projections you can rebuild. This is the right model for financial workloads where audit trails aren't optional.

**eUTXO schema.** Canton contracts get created and archived, never mutated. The schema tracks the full lifecycle: create → active → archive. The ACS is a derived view.

**GraphQL primary, REST + SQL secondary.** GraphQL's type system maps well to Daml templates. Subscriptions handle real-time. REST for simple lookups. SQL direct access for power users.

**Schema-per-party isolation.** Each party gets its own postgres schema. Even if there's a bug in the query layer, party A's data can't leak to party B at the database level.

### Consistency

PQS watermark = consistency boundary. All data at or below the watermark is fully committed — no partial transactions visible. The indexer exposes watermark lag via health endpoint. Clients can query "as of offset N".

Idempotent writes via `INSERT ... ON CONFLICT (offset, contract_id) DO NOTHING`. Post-processor resumes from last checkpoint on restart.

### Security

- JWT with `readAs`/`actAs` party claims at every API layer
- mTLS between indexer and participant node
- Schema-per-party postgres isolation
- RBAC matrix for Tier 3 cross-party access
- Compatible with Canton pruning and crypto-shredding (GDPR)

## Architectural Alignment

The indexer works within Canton's architecture, not around it.

**Uses existing infrastructure.** PQS, Ledger API, Scan API — all official, documented, maintained by Digital Asset. We don't modify Canton internals.

**Respects the privacy model.** Tier 2 connects to one participant node and sees what that participant's parties can see. Nothing more. Tier 3 aggregation stays within organizational boundaries.

**Same pattern other privacy chains landed on.** Namada has a general indexer + MASP indexer. Aztec has a public explorer + client-side PXE. Zcash has lightwalletd. Canton's version is actually easier to build because the participant node already pre-filters and decrypts for authorized parties — no client-side trial decryption needed.

**Supports Canton's regulatory model.** Regulators added as Daml observers on specific templates get visibility through Tier 3's audit views. The indexer materializes this into something queryable without breaking the privacy model.

**Survives Canton version changes.** We build on PQS's SQL API functions (the stable interface), not its internal tables. When PQS internals change in the next release, the indexer keeps working.

## Tech Stack

| Component | Tech | Why |
| --- | --- | --- |
| Ingestion | PQS (scribe.jar) | Official, handles gRPC + offset tracking + crash recovery |
| Post-processor | Scala/Kotlin (JVM) | Daml SDK interop, functional streaming |
| Storage | PostgreSQL 17 | PQS requires it, JSONB for flexible payloads |
| Time-series | TimescaleDB | Tier 1 round-by-round metrics |
| Query API | GraphQL (Apollo) | Maps to Daml types, subscriptions for real-time |
| Cache | Redis 7 | Hot contract state |
| Deployment | Docker Compose → K8s | Compose for dev, K8s for production |
| Monitoring | Prometheus + Grafana | Canton already exposes prom metrics |

---

## Roadmap

```
WEEK  1    2    3    4    5    6    7    8    9   10   11   12   13   14   15   16
      ├────────────────────────────┤├──────────────────┤├────────────────────────────┤
              MILESTONE 1                 MILESTONE 2            MILESTONE 3
          MVP Party-Scoped Indexer     Multi-Party + Tier 1   Aggregation + Production
```

### Milestone 1 — MVP (Weeks 1–6)

Ship a working party-scoped indexer: PQS ingesting from a Canton participant, GraphQL query layer with JWT auth, real-time subscriptions.

**Week 1–2: Ingestion + schema.** Deploy PQS against DevNet. Set up the extension tables: `contract_state`, `transaction_log`, `party_activity`, `exercise_log`, `offset_checkpoint`. Get PQS writing events and verify watermark is advancing.

Core schema (implemented and tested in our PoC):

```sql
CREATE TABLE contract_state (
    contract_id    TEXT PRIMARY KEY,
    template_id    TEXT NOT NULL,
    status         TEXT NOT NULL CHECK (status IN ('active', 'archived')),
    payload        JSONB NOT NULL DEFAULT '{}',
    signatories    TEXT[] NOT NULL DEFAULT '{}',
    observers      TEXT[] NOT NULL DEFAULT '{}',
    created_offset BIGINT NOT NULL,
    created_at     TIMESTAMPTZ,
    archived_offset BIGINT,
    archived_at    TIMESTAMPTZ
);
CREATE INDEX idx_cs_tmpl_status ON contract_state (template_id, status);
CREATE INDEX idx_cs_sig ON contract_state USING GIN (signatories);
CREATE INDEX idx_cs_obs ON contract_state USING GIN (observers);
```

Daml-LF maps to JSONB with some gotchas: Int64 and Decimal come as strings (precision), Date as days-since-epoch, Timestamp as microseconds. Queries on numeric fields need explicit casts: `(payload->>'amount')::numeric`.

**Week 3–4: GraphQL + auth.** Apollo Server reading from extension tables. JWT validation extracts `readAs` parties, every query is filtered:

```sql
SELECT * FROM contract_state
WHERE template_id = $1 AND status = 'active'
  AND (signatories && $2::text[] OR observers && $2::text[])
```

No valid token = empty results, not an error. Subscriptions via `pg_notify` — post-processor fires notifications, GraphQL server pushes to WebSocket clients after checking party auth.

Queries we ship: `activeContracts`, `contract`, `contractLifecycle`, `partyActivity`, `exercises`, `templateStats`, `health`.

**Week 5–6: Hardening + docs.** Integration tests against DevNet (submit Daml commands via Ledger API, verify they show up in GraphQL). Performance targets: activeContracts <200ms p95, subscriptions <2s latency. Docker Compose packaging. Setup guide, API reference, config docs.

### Milestone 2 — Multi-party + Tier 1 (Weeks 7–10)

**Week 7–8: Schema isolation + post-processor.** Each party gets its own postgres schema. PQS instances per party, routing layer maps JWT → schema. Post-processor service (JVM) watches PQS tables, populates extension tables, fires pg_notify. Processing loop runs inside a single postgres transaction — either the whole batch commits or nothing does.

Template-specific materialized views, e.g.:

```sql
CREATE MATERIALIZED VIEW mv_token_positions AS
SELECT contract_id, payload->>'owner' AS owner,
       (payload->>'amount')::numeric AS amount
FROM contract_state
WHERE template_id = 'tokenlib:Token.Holding:Holding' AND status = 'active';
```

Refreshed concurrently by the post-processor.

**Week 9–10: Scan API consumer.** Separate service polling the Scan Bulk Data API. Writes to Tier 1 tables: `cc_transfers`, `minting_rounds` (TimescaleDB hypertable for time-series queries), `validator_metrics`, `governance_proposals`, `network_topology`. REST endpoints for public dashboard queries.

### Milestone 3 — Aggregation + production (Weeks 11–16)

**Week 11–12: Tier 3 RBAC.** Cross-party aggregation for multi-party orgs. RBAC tables: `organizations`, `roles`, `role_parties`, `user_roles`. User → resolve party set → query across authorized schemas with UNION ALL. Regulatory audit views scoped to observer visibility only.

**Week 13–14: K8s + monitoring.** Helm charts for all services. Prometheus metrics: `indexer_postproc_lag_seconds`, `indexer_graphql_request_duration_seconds`, `indexer_watermark_offset`. Grafana dashboards for ingestion throughput, watermark lag, query latency, error rates.

**Week 14–15: Caching + DAR schema generator.** Redis for hot contract state (TTL matched to watermark advance rate). CLI tool reads compiled DAR files, generates materialized view DDL + GraphQL types + resolvers per template. Published as npm package.

**Week 15–16: Pruning + load test + docs.** Time-based partition pruning aligned with Canton retention policies. Load test: 100 tx/s for 24h, 50 queries/sec, pass criteria: lag <10s, p95 <500ms, zero data loss. Full doc set: architecture guide, ops runbook, API reference, contributor guide.

## Milestones and Acceptance Criteria

### Milestone 1 — MVP (Weeks 1–6)

**Delivers:**
- PQS connected to a Canton participant node, writing to postgres
- Extension schema: contract_state, transaction_log, party_activity, exercise_log, offset_checkpoint
- GraphQL API: activeContracts, contract, contractLifecycle, partyActivity, exercises, templateStats, health
- Subscriptions: contractEvents, partyEvents via pg_notify
- JWT auth with party-scoped filtering
- 2–3 template materialized views
- Docker Compose package
- Docs: setup, API reference, config

**Acceptance:**
- Active contract queries correct within 200ms p95
- Lifecycle queries return create → exercise → archive chain
- Subscriptions deliver within 2s of Ledger API event
- Party A cannot see party B's contracts
- No-token requests get empty results
- Reproducible deployment from docs on clean env
- Apache 2.0 on GitHub

### Milestone 2 — Multi-party + Tier 1 (Weeks 7–10)

**Delivers:**
- Schema-per-party isolation with automated provisioning
- Post-processor service populating extension tables
- Scan API consumer for CC transfers, minting rounds, validators, governance
- REST API for Tier 1 queries
- TimescaleDB hypertables

**Acceptance:**
- Cross-party isolation verified: party A's queries never return party B's data
- Tier 1 endpoints return correct CC transfer history, round data, validator metrics
- Post-processor refreshes views within 5s of PQS writes
- Automated isolation test suite

### Milestone 3 — Production (Weeks 11–16)

**Delivers:**
- Tier 3 cross-party aggregation with RBAC
- Regulatory audit views
- Cross-template joins
- Helm charts (K8s)
- Prometheus metrics + Grafana dashboards
- Redis caching
- DAR-based schema generator
- Pruning configuration
- Full docs + contributor guide

**Acceptance:**
- RBAC correctly restricts cross-party queries
- Cross-template queries <500ms p95
- K8s deployment handles 100 tx/s for 24h
- Monitoring shows health, lag, throughput, errors
- Pruning runs without data corruption
- Test suite >80% coverage

## Funding Request

**Total: 625,000 CC** — milestone-based, released on acceptance.

| Milestone | Scope | Duration | CC |
| --- | --- | --- | --- |
| 1 | MVP indexer | Weeks 1–6 | 200,000 |
| 2 | Multi-party + Tier 1 | Weeks 7–10 | 175,000 |
| 3 | Aggregation + production | Weeks 11–16 | 250,000 |
| **Total** | | **16 weeks** | **625,000** |

**Breakdown:** ~70% engineering, ~15% infra/DevOps, ~10% docs, ~5% project management.

The indexer is a full-stack infrastructure project: JVM backend, postgres schema design, GraphQL API, real-time streaming, Kubernetes deployment. The budget covers a dedicated team of blockchain infrastructure engineers for 4 months.

## Team

**Zpoken** is a cryptography and blockchain infrastructure company that's been building protocol-level systems for years. 50+ blockchain projects delivered, $1.5B+ TVL in shipped products, 45-person team.

We're known for our work on:

- **Wormhole** — Wormhole Foundation awarded us a Contributor Grant to build ZK light clients for the first trustless Ethereum-to-NEAR corridor. We're one of Wormhole's core ZK engineering contributors alongside Lurk.
- **NEAR** — we built the NEAR ZK Light Client that underpins the official NEAR-Ethereum bridge.
- **Polygon** — ZK cryptography and infrastructure contributions.
- **Gonka AI** — contributed to their decentralized AI compute infrastructure (Proof of Work 2.0 consensus for AI workloads).
- **Neon EVM, Starkware, Stellar, zkSync, Linea** — protocol engineering across L1s, L2s, and cross-chain infra.

We recently became a Canton contributor. We deployed an RWA tokenization project on Canton and spent significant time digging into the infrastructure — Ledger API, PQS, the sub-transaction privacy model, validator nodes, DevNet deployment. That research is what led directly to this indexer design. We understand the privacy model not from reading docs but from actually building on it.

## Go-to-Market and Adoption Strategy

### Approach

The most effective adoption strategies for blockchain indexers share a common pattern: the product gets embedded into the default developer workflow, and early users emerge from teams that were already looking for the solution. The Graph reached 15K+ active subgraphs primarily through embedding into the standard developer toolchain (scaffold-eth, starter kits) and shipping pre-built subgraphs for popular protocols. SubQuery grew by providing ready-to-use indexed datasets for ecosystem projects. Neither relied on outbound marketing as the primary driver.

Our strategy follows the same logic. Most of the adoption work is a natural extension of how we're building the indexer — the key is structuring development so that each milestone produces usable artifacts, not just internal deliverables.

### Phase 1: Reference deployments through internal and partner use (Months 1–2)

**Zpoken's RWA deployment as first production user.** We have an active RWA tokenization project on Canton. The indexer will run against our own participant node from Milestone 1 onward, and our application layer will consume the GraphQL API directly. This serves a dual purpose: it validates the developer experience under real conditions, and it produces a working reference deployment we can point other teams to. There is no additional GTM effort here — we're building the indexer to use it ourselves.

**Engagement with Canton data consumers.** Teams already building on Scan API data (CC Explorer, analytics dashboards) are natural early consumers of the Tier 1 public endpoints. During Milestone 2 development, we will share the API specification with these teams and incorporate feedback on query patterns. This is lightweight — a few conversations to validate we're building the right endpoints, not a formal partnership program.

### Phase 2: Ecosystem integration (Months 2–3)

**cn-quickstart integration.** We will submit a PR to the cn-quickstart repository adding the indexer as an optional docker compose service. This is a single PR, but it has outsized impact: cn-quickstart is the standard Canton onboarding path, so every new developer sees the indexer as available tooling from day one. The Graph achieved significant organic discovery through the same mechanism (embedding in starter templates).

**Pre-built template views shipped with the indexer.** The Milestone 2 and 3 deliverables already include template-specific materialized views. Rather than treating these as internal test fixtures, we package them as ready-to-use modules covering common Canton contract patterns: CC token holdings, basic asset transfers, standard RWA contract types. New teams can query indexed data immediately without writing any configuration. This is not additional work — it's a packaging decision on deliverables we're already building.

**DAR-based schema generator as developer workflow tool.** The CLI tool that generates GraphQL types and materialized views from compiled DAR files (Milestone 3 deliverable) doubles as an adoption mechanism. Once a team integrates this into their build process, the indexer becomes part of their development workflow rather than a separate infrastructure dependency. We publish this as an npm package for easy installation.

### Phase 3: Discoverability and ecosystem presence (Month 3–4)

**Canton Foundation ecosystem listing.** We will coordinate with the Canton Foundation to list the indexer on the official Canton Apps and ecosystem tools page. This is the primary discovery surface for organizations evaluating Canton infrastructure.

**Documentation structured as applied guides.** The documentation we produce for Milestone 3 will be organized around practical use cases (querying bond positions, building activity dashboards, adding audit queries) rather than abstract API reference. This is a framing decision on documentation we're already writing, not a separate content program.

**Open-source contribution path.** The template-view plugin system (Milestone 3) allows external teams to contribute materialized views for their own Daml templates without modifying indexer core. We document this contribution path clearly and review incoming PRs. As template coverage grows, the indexer serves more use cases, which attracts more teams, which contribute more views. We seed this with the initial 10–15 template views shipped as part of the milestones.

**Availability for Canton hackathons.** If Canton hackathons are organized during or after the delivery period, we will make the indexed data and GraphQL endpoint available to participants. This requires no active effort beyond keeping the public deployment running — hackathon teams self-serve.

### Adoption metrics

| Metric | Target (6 months post-launch) |
| --- | --- |
| Teams querying the API (unique JWT subjects/week) | 5+ |
| Template coverage (materialized views shipped) | 15+ |
| Tier 1 API consumers (unique IPs on public REST endpoints) | 10+ |
| cn-quickstart integration | Merged |
| External template view contributions | 2–3 |

### Distribution

- Open-source under Apache 2.0 on GitHub
- Docker images in a public container registry
- npm package for the DAR schema generator
- Integrated into cn-quickstart as optional service
- Listed on Canton Foundation ecosystem page

## Long-Term Maintenance

- Track Canton releases for Ledger API changes (they deprecated a lot between 3.3 and 3.5) and keep compat across at least two minor versions
- PQS upgrades as DA ships new versions
- Quarterly security patches and dependency updates
- Community template contributions via the plugin system (new Daml template → generate materialized view + GraphQL types)
- The DAR-based schema generator lets app teams self-serve without touching indexer core

## Proof of Concept

We've already built a working PoC to validate the architecture. It's not a mockup — it's real code with a real database, real queries, and real test suite.

**What's implemented:**
- Full core schema (contract_state, transaction_log, party_activity, exercise_log) — 3 DDL files covering all three tiers
- GraphQL API with JWT party-scoped auth, pg_notify subscriptions, health endpoint
- Demo data simulating PQS output: token holdings, DvP trades, tokenized bonds, archived contracts
- Smoke test suite: 24 tests covering party isolation, lifecycle queries, observer access, unauthenticated rejection

**Test results (24/24 pass):**

```
canton-indexer smoke tests

1. health
  ✓ responds       ✓ has status    ✓ has offset    ✓ has lag    ✓ version

2. graphql schema
  ✓ introspection

3. alice scope
  ✓ sees own holding    ✓ cannot see bob

4. bob scope
  ✓ sees own holding    ✓ cannot see alice

5. no auth
  ✓ empty without token

6. contract lifecycle
  ✓ found    ✓ archived    ✓ has create    ✓ has archive    ✓ choice = Transfer

7. party activity
  ✓ has events    ✓ includes creates    ✓ includes archives

8. regulator (observer)
  ✓ sees bonds via observer

9. template stats
  ✓ returned    ✓ active > 0    ✓ archived > 0    ✓ exercises > 0

24 passed, 0 failed
```

**Sample query output — active contracts (alice's JWT, party-scoped):**

```json
{
  "activeContracts": [{
    "contractId": "00ab01",
    "status": "active",
    "payload": {"owner": "party::alice::1220aa", "amount": "50000.00", "tokenId": "CC"},
    "signatories": ["party::alice::1220aa", "party::dso::1220dd"]
  }]
}
```

Alice sees her holding. Bob's holding is filtered out at SQL level.

**Contract lifecycle (archived contract — create → Transfer → archive):**

```json
{
  "contractLifecycle": {
    "contractId": "00ab03",
    "currentStatus": "archived",
    "events": [
      {"eventType": "create", "offset": "1003", "choiceName": null},
      {"eventType": "archive", "offset": "1050", "choiceName": "Transfer"}
    ]
  }
}
```

**What's left for Milestone 1:** connecting PQS to a live participant node instead of seed data, building the post-processor service, and performance testing under real throughput.

PoC code: https://github.com/zpoken/canton-network-indexer

## Checklist

- [x] Proposal delivers a shared benefit / common good for the Canton ecosystem
- [x] Deliverables can be objectively verified at each milestone
- [x] Outputs are open-source and reusable
- [x] Realistic timeline and scope
- [x] Evidence of technical capability provided (PoC with 24/24 passing tests)
- [x] Go-to-market plan included
- [x] Long-term maintenance plan included
- [x] Working proof of concept submitted
