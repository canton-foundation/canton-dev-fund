## Objective and Scope

**Objective:** Build the first production-grade indexing infrastructure for Canton Network — a three-tier system that makes public network data and private contract state queryable, streamable, and auditable for any Canton application.

**Problem:** Canton's sub-transaction privacy model means there is no global state to scrape. Each participant node holds only a party-specific projection of the virtual ledger. No general-purpose indexer (The Graph, SubQuery, Goldsky, Ponder, Envio, Subsquid) supports any privacy-preserving blockchain. A survey of six privacy chains (Aztec, Aleo, Zcash, Namada, Secret Network, Mina) confirms that every one of them has built custom indexing infrastructure. Canton must do the same.

**Why it matters:** Without a shared indexer, every application team building on Canton — tokenized assets, DvP settlement platforms, institutional DeFi, fund administration, regulatory reporting tools — is forced to independently rebuild the same data pipeline on top of PQS and the Ledger API. This duplicated effort slows ecosystem growth, raises the barrier to entry for new builders, and leads to inconsistent data access patterns across the network. The indexer eliminates this by providing a standardized, reusable data layer that any Canton application can plug into.

**Who benefits:**

- **Application developers** — fast lookups on active holdings, contract history, cross-template joins, and real-time event subscriptions without building custom ingestion pipelines.
- **Financial institutions** — audit-ready contract lifecycle trails, party activity timelines, and point-in-time queries for compliance and regulatory reporting.
- **Regulators and auditors** — controlled read access to contract data via Daml observer patterns and RBAC-enforced query layers, without requiring direct participant node access.
- **Ecosystem tooling** (dashboards, analytics, portfolio views, explorers) — a standardized query surface (GraphQL + SQL) instead of ad-hoc Ledger API integrations.
- **New builders** — dramatically lower barrier to entry. Query indexed data via GraphQL instead of implementing gRPC streaming, offset tracking, and Daml-LF deserialization from scratch.

**In scope:**

- Public network data indexing (Canton Coin, governance, validator metrics) via Scan API
- Party-scoped private contract indexing (contract lifecycle, ACS, audit trails) via Ledger API / PQS
- Cross-party aggregation with RBAC for multi-party organizations and regulatory views
- GraphQL query API with real-time subscriptions, REST endpoints, SQL-direct access
- Docker Compose and Kubernetes deployment packages
- Open-source release under Apache 2.0

**Out of scope:**

- Custom Daml smart contract development for specific applications
- Hosting or operating the indexer as a managed service for third parties
- Modifications to Canton protocol, PQS, or Ledger API internals
- Cross-chain indexing (other networks beyond Canton)

## Technical Approach

### Architecture: Three-Tier Design

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

**Tier 1 — Public Network Indexer.** Consumes the unauthenticated Scan API from Super Validator nodes. Indexes globally visible data: Canton Coin transfers and balances, minting/burning round economics, validator rewards, governance proposals, and network topology. Stored in PostgreSQL with TimescaleDB hypertables for time-series metrics.

**Tier 2 — Party-Scoped Private Indexer (core).** Connects to a participant node's gRPC Ledger API authenticated via JWT with party-scoped `readAs` claims. Built on PQS (scribe.jar) as the ingestion foundation, writing contract lifecycle events to PostgreSQL as JSONB. Extended with a post-processor that materializes template-specific views, party activity timelines, and audit trails.

**Tier 3 — Cross-Party Aggregation.** Aggregates Tier 2 data across multiple parties within an organization. Enforces role-based access control so API consumers only query data from parties they are authorized to access. Enables regulatory/audit views and cross-template joins.

### Ingestion Pipeline

```
Canton Participant Node
        │
        │  gRPC SubscribeUpdates (streaming, JWT auth)
        ▼
   PQS (scribe.jar)  ──────►  PostgreSQL (JSONB + offsets)
                                      │
                                      │  pg_notify
                                      ▼
                               Post-Processor
                                ┌─────┼─────┐
                                ▼     ▼     ▼
                          contract  party  template
                          _state    _act.  mat.views
```

### Key Design Decisions

**PQS as ingestion foundation (not custom gRPC client).** PQS already solves the hardest parts: Ledger API streaming, offset tracking, Daml-LF value serialization, crash recovery, and handling API evolution across Canton versions (3.3 → 3.4 → 3.5 deprecations). Rebuilding from scratch adds weeks and introduces bugs Digital Asset has already fixed. Custom ingestion justified only at extreme scale (>1000 tx/s).

**Event sourcing over state snapshots.** The raw event stream (offsets) is the source of truth. All materialized views are projections that can be rebuilt. This aligns with Canton's append-only transaction model and is required for financial institution workloads where audit trails are non-negotiable.

**eUTXO-style schema.** Canton's contract model (contracts created and archived, never mutated) maps to a UTXO lifecycle schema: creation event → active state → archival event. The Active Contract Set is a derived view.

**GraphQL as primary query API.** GraphQL's type system maps naturally to Daml templates. Nested resolvers handle cross-template joins. Subscriptions over WebSocket provide real-time contract events. REST endpoints for simple lookups (health, latest offset, contract by ID). SQL-direct access via PQS functions for power users and analytics.

**Schema-per-party isolation.** Each party (or party group) gets its own PostgreSQL schema namespace. This prevents cross-party data leakage at the database level, even if the query-layer access control has a bug.

### Consistency and Reliability

PQS's watermark mechanism is the consistency boundary. The watermark is the most recent contiguous offset where all data is fully committed — no partial transactions. The indexer exposes a health endpoint returning `{latest_offset, watermark_offset, lag_seconds}`. Clients can request data "as of offset N" for point-in-time consistency.

Idempotent writes: the post-processor uses `offset` as a natural idempotency key via `INSERT ... ON CONFLICT (offset, contract_id) DO NOTHING`. On restart, the indexer resumes from `last_committed_offset + 1`.

### Security Model

- JWT tokens with party-scoped `actAs`/`readAs` claims at every API layer
- mTLS between indexer services and participant node
- Schema-per-party PostgreSQL isolation for multi-tenant deployments
- RBAC matrix at Tier 3 aggregation layer mapping users to authorized party sets
- Compatible with Canton's pruning and crypto-shredding for GDPR compliance

### Data Visibility

| Data Element | Stakeholders | Non-stakeholder | Sequencer | Mediator | Validators |
| --- | --- | --- | --- | --- | --- |
| Contract payload | Full | None | Encrypted | Encrypted | None |
| TX tree structure | Own views | None | None | Shape only | None |
| Party identities | Full | None | None | Informees | None |
| CC transfers | Public | Public | Public | Public | Public |

## Architectural Alignment

The indexer is designed to work entirely within Canton's existing architecture and privacy guarantees, not against them.

**Leverages existing Canton infrastructure.** PQS (scribe.jar) is the officially supported data ingestion tool maintained by Digital Asset. The Ledger API (gRPC) and Scan API (REST) are stable, documented interfaces. No modifications to Canton protocol internals, participant nodes, or sync domain operators are required.

**Respects the sub-transaction privacy model.** The indexer never attempts to reconstruct a global view of all transactions. Tier 2 connects to a specific participant node and sees only what that participant's authorized parties can see — by design. Cross-party aggregation (Tier 3) operates only within organizational boundaries with explicit RBAC.

**Mirrors proven privacy-chain patterns.** The three-tier architecture mirrors the dual-indexer pattern independently discovered by Namada (general indexer + MASP indexer), Aztec (public explorer + client-side PXE), and Zcash (transparent indexer + lightwalletd for shielded data). Canton's implementation is more developer-friendly than all of these: the participant node automatically filters and decrypts relevant data, eliminating the client-side trial decryption overhead that plagues Zcash and Aleo.

**Supports Canton's regulatory design.** The Daml observer pattern allows regulators to be added as observers to specific contract templates, granting them read visibility. The indexer's Tier 3 aggregation layer materializes this into queryable views with access control, enabling audit and compliance workflows without circumventing Canton's privacy model.

**Compatible with Canton versioning and evolution.** By building on PQS's SQL API functions (the stable interface) rather than PQS internal tables (subject to change), the indexer survives PQS upgrades. The post-processor consumes PQS output, not Ledger API events directly, insulating it from the rapid API deprecation pace in Canton 3.x releases.

## Tech Stack

| Component | Technology | Rationale |
| --- | --- | --- |
| Ingestion | PQS (scribe.jar) | Official DA tool; handles gRPC streaming, offset tracking, crash recovery |
| Post-processor | Scala / Kotlin on JVM | JVM for Daml SDK interop; functional stream processing |
| Storage | PostgreSQL 17 | PQS requires it; JSONB for flexible payloads; mature partitioning |
| Time-series | TimescaleDB | Tier 1 round-by-round CC economics and network metrics |
| Query API | GraphQL (Apollo Server) | Maps to Daml type system; subscriptions for real-time |
| Cache | Redis 7 | Hot contract state, rate limiting |
| Streaming | pg_notify + GraphQL Subscriptions | Low operational overhead for most deployments |
| Deployment | Docker Compose → Kubernetes | Docker Compose for MVP; K8s for production scaling and HA |
| Monitoring | Prometheus + Grafana | Canton/Splice already expose Prometheus metrics |

## Milestones, Deliverables, and Acceptance Criteria

### Milestone 1 — MVP Indexer (Weeks 1–6)

**Deliverables:**

- PQS deployed against a Canton participant node, authenticated with party JWT, writing to PostgreSQL
- GraphQL API layer reading from PQS SQL API functions (`active()`, `creates()`, `archives()`, `exercises()`)
- JWT authentication at GraphQL layer mapping users to party `readAs` rights
- 2–3 template-specific materialized views for the most queried contract types
- Health endpoint with watermark lag monitoring
- Docker Compose deployment package
- Documentation: setup guide, API reference, configuration parameters

**Acceptance criteria:**

- Active contract queries return correct results for any indexed template within 200ms p95
- Contract lifecycle history (create → exercises → archive) is queryable by `contract_id`
- Real-time GraphQL subscriptions deliver new contract events within 2 seconds of Ledger API emission
- Health endpoint accurately reports watermark lag
- Deployment reproducible from documentation on a clean environment
- All code open-source under Apache 2.0

### Milestone 2 — Multi-Party Support and Tier 1 Public Indexer (Weeks 7–10)

**Deliverables:**

- Schema-per-party isolation in PostgreSQL
- Post-processor service populating `contract_state`, `party_activity`, and template materialized views via `pg_notify`
- Scan API consumer for Tier 1 public data: CC transfers, minting rounds, validator rewards, governance
- REST API for Tier 1 public dashboard queries
- TimescaleDB hypertables for round-by-round CC economics

**Acceptance criteria:**

- Multi-party deployment where party A cannot query party B's contracts through the API
- Tier 1 endpoints return CC transfer history, minting round data, and validator metrics
- Post-processor materialized views refresh within 5 seconds of PQS writes
- Schema isolation verified via automated test suite

### Milestone 3 — Tier 3 Aggregation and Production Hardening (Weeks 11–16)

**Deliverables:**

- Cross-party aggregation layer with RBAC access control matrix
- Regulatory/audit view support (read access to contracts where regulator party is Daml observer)
- Cross-template join queries via GraphQL nested resolvers
- Kubernetes deployment manifests (Helm charts)
- Prometheus metrics and Grafana dashboard templates
- Redis caching layer for hot contract state
- Automated materialized view generation from DAR files
- Pruning policy configuration aligned with Canton's data retention model
- Full documentation: architecture guide, operations runbook, API reference
- Contributor guide and template-view plugin system for ecosystem self-service

**Acceptance criteria:**

- Aggregation layer correctly enforces RBAC — users see only data from authorized party sets
- Cross-template queries execute within 500ms p95 for typical financial workloads
- Kubernetes deployment passes load test at 100 tx/s sustained for 24 hours
- Monitoring dashboards show indexer health, lag, throughput, and error rates
- Pruning operations execute without data corruption or consistency gaps
- Complete test suite with >80% code coverage

## Funding Request

**Total requested: 625,000 CC**

Funding is structured per milestone, released upon acceptance by the Tech & Ops Committee.

| Milestone | Scope | Duration | Funding (CC) |
| --- | --- | --- | --- |
| Milestone 1 | MVP Indexer (PQS + GraphQL + JWT + Docker Compose) | Weeks 1–6 | 200,000 |
| Milestone 2 | Multi-party isolation + Tier 1 public indexer | Weeks 7–10 | 175,000 |
| Milestone 3 | Tier 3 aggregation + K8s + monitoring + production hardening | Weeks 11–16 | 250,000 |
| **Total** |  | **16 weeks (~4 months)** | **625,000** |

## Team

**Zpoken** is a recognized cryptography and blockchain infrastructure company with a proven track record of delivering production-grade protocol-level systems for some of the most prominent networks in the industry. With 50+ blockchain projects shipped, Zpoken brings deep expertise in protocol engineering, zero-knowledge cryptography, and decentralized infrastructure development.

Zpoken has earned its reputation as a trusted core contributor across the blockchain ecosystem through sustained, high-impact engagements:

- **Wormhole** — awarded Contributor by Wormhole Foundation to build trustless ZK light clients enabling the first zero-knowledge Ethereum-to-NEAR corridor. Recognized alongside Lurk as one of Wormhole's core ZK engineering contributors, advancing cross-chain message verification without centralized trust assumptions.
- **NEAR Protocol** — developed the NEAR ZK Light Client, a foundational piece of NEAR's cross-chain bridging infrastructure that underpins the official NEAR–Ethereum bridge.
- **Polygon** — contributed to ZK cryptography and infrastructure work within the Polygon ecosystem.
- **Gonka AI** — contributed to decentralized AI compute infrastructure built on a novel Proof of Work 2.0 consensus mechanism, optimizing computational resource allocation for AI model training and inference.
- **Neon EVM, Starkware, Stellar, zkSync, Linea** — delivered engineering contributions across multiple protocol ecosystems spanning L1s, L2s, and cross-chain infrastructure.

Zpoken has recently become a Contributor to the Canton Network ecosystem, deploying an [REvidentia.fi](http://REvidentia.fi) - an RWA tokenization project on Canton and conducting in-depth research into Canton's infrastructure layer — including the Ledger API, PQS, the sub-transaction privacy model, validator node architecture, and DevNet deployment. 

## Long-Term Maintenance

- Track Canton release notes for Ledger API changes (services deprecated across 3.3 → 3.5 at rapid pace) and maintain compatibility with at least two Canton minor versions simultaneously
- PQS version upgrades as Digital Asset releases new versions
- Community-driven template view contributions (new Daml templates → new materialized views via the plugin system)
- Security patches and dependency updates on quarterly cadence
- Bug fixes and performance tuning based on production telemetry
- Contributor guide and template-view plugin system to enable ecosystem self-service, reducing long-term maintenance burden by distributing template-specific work to application teams

##
