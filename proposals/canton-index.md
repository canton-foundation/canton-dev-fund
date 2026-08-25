# Canton Index

**Development Fund Proposal**

**Author:** InfraDAO (The Graph Foundation)  
**Status:** Draft  
**Created:** 2026-04-23  
**Label:** canton-apis  
**Champion:** Bernhard Elsner, CPO at Digital Asset


---

### Abstract

We propose Canton Index, an open-source indexing and query engine for Canton Network. It sits alongside a validator that runs PQS (the Participant Query Store), reads ledger events from PQS using developer-defined filter specifications, transforms those events into application-ready documents, and serves the results through a document-query API. Phase 2 will add Scan as a second source for network-level data, cross-validator views, and historical periods that local PQS may have pruned.

The goal is to reduce the time from "I have a validator" to "I can query my data" from weeks to minutes.

Today, a developer building on Canton has the data available through PQS but still has to write complex JSONB SQL to answer simple questions like "how much CC did I burn in fees in the last hour?". The current path requires understanding PQS's row shape, hand-rolling JSONB navigation across deeply nested Daml records, and building custom middleware before any application logic can run. Canton Index closes this gap with a purpose-built filter, transform, and query pipeline that consumes PQS as its source of truth, informed by the experience of building The Graph's indexing infrastructure across multiple ecosystems and adapted to Canton's privacy-first, participant-local architecture.

---

### Motivation

Canton Network's developer experience has a critical gap between data availability and data usability. The data exists in PQS, but transforming raw projected JSONB rows into application-ready, queryable data requires building significant custom infrastructure for every team that ships on Canton. Today, every DEX, lending protocol, and token project on Canton has to either build their own JSONB SQL pipelines or make do with a worse developer experience. That work duplicates across teams and pulls engineering hours away from actual application logic.

Canton's privacy model means a global indexer is not possible, unlike Ethereum, where public state can be indexed once and served to everyone. Each participant needs local indexing infrastructure. The right answer is a shared, reusable primitive that every validator operator can deploy alongside their node, rather than a per-team custom build.

**Intended Ecosystem Impact:**

- Directly addresses Q2 priority of simplified traffic accounting and improved developer experience
- Reduces developer onboarding time from weeks to minutes for data access
- Enables rapid proof of value development and rapid time-to-market for small dev teams and innovators
- Creates a shared, open-source primitive that benefits all Canton builders

### About the Grantee

**The Graph** is the leading indexing and query protocol for blockchain data solutions, serving tens of thousands of developers with real-time access to onchain data since 2018. The Graph has pioneered and continues to advance multiple high-performance indexing systems. These solutions include [Subgraphs](https://thegraph.com/subgraphs/) (a widespread standard for onchain indexing used by thousands of web3 developers) and [Substreams](https://thegraph.com/substreams/) (a high-throughput streaming solution for real-time and historical blockchain data). Canton Index applies the same architectural primitives (i.e. declarative filter modules, materialized document tables, a queryable API) to Canton's participant-local data model.

**InfraDAO** is a global team of infrastructure experts operating as The Graph's infrastructure arm. The team is focusing on several core initiatives in The Graph ecosystem, including: 

- **Chain integrations:** Since 2023, InfraDAO has led testing and onboarding for 20+ blockchains joining The Graph Network, across both EVM and non-EVM architectures, covering integration, tooling, documentation, and performance and data-integrity validation.
- **Tooling:** InfraDAO builds and maintains production indexing tools used across The Graph Network, including a declarative strategy-based operations tool, a performance measurement framework, and an end-to-end test suite.
- **Protocol work.** InfraDAO spearheads end-to-end testing of major protocol upgrades, including Horizon, which transformed The Graph into a modular data services platform. InfraDAO also led testing on the rewards eligibility oracle, which enforces a minimum service level for indexing, and the timeline aggregation protocol for payment settlements.
- **Network-critical infrastructure:** InfraDAO operates several components of The Graph Network's critical infrastructure.

The architectural patterns The Graph and InfraDAO have been running in production for years (declarative filter modules, materialized document tables, an HTTP query layer) map directly onto Canton Index. The design is adapted for Canton's privacy-first, participant-local reality: filters operate on the Daml-LF JSON that PQS already produces, the privacy boundary is inherited from PQS rather than reimplemented, and the document model fits Canton's JSONB-based data shape.

### Specification

**1. Objective**

The objective is to eliminate the middleware gap between PQS and application developers by providing:

1. A **declarative filter specification** (`jq`-inspired expressions for selecting and reshaping Daml-LF JSON payloads).
2. **A transform pipeline** that polls PQS for new events, applies filters, and produces application-ready documents.
3. A **document store** that persists the projected output with proper indexing.
4. **An HTTP document-query API** to filter, sort, and paginate already-materialized documents.

Phase 1 is scoped to **stateless projections**: each PQS row maps to zero or one output document via a per-record filter and a `select` projection. Cross-event roll-ups, running aggregates, and stateful processing are explicitly out of scope for this grant and are addressed in the post-grant roadmap as a separate milestone.

The target user is a small team (5-20 people) running their own validator with PQS, building apps on Canton such as DEXs, lending protocols, token projects, and RWA platforms, who need fast queryable access to ledger data without building custom infrastructure.

This directly addresses the Q2 ecosystem priority of **simplified traffic accounting and developer experience** by enabling developers to query traffic costs, reward collection, and token operations through a single API rather than building custom PQS SQL pipelines.

**2. Implementation Mechanics**

**Language:** Rust was chosen for performance, safety, and low resource footprint alongside a validator node.

**Architecture:** The general architecture for Canton Index aligns with the following outline.

```
┌─────────────────────────────────────────────────────────┐
│                     Canton Index                        │
│                                                         │
│  ┌──────────┐    ┌──────────────┐    ┌───────────────┐  │
│  │  PQS     │───▶│  Filter     │───▶│  Document     │  │
│  │  Reader  │    │  Pipeline    │    │  Store        │  │
│  └──────────┘    └──────────────┘    └───────┬───────┘  │
│       ▲                                      │          │
│       │                                      ▼          │
│  ┌────┴──────┐                        ┌──────────────┐  │
│  │ PQS DB    │                        │  Query API   │  │
│  │ (your     │                        │  (HTTP)      │  │
│  │ validator)│                        └──────────────┘  │
│  └───────────┘                                          │
└─────────────────────────────────────────────────────────┘
```

**PQS Reader:** This component polls the validator's Participant Query Store using its documented SQL API: `creates(name, from, to)`, `exercises(name, from, to)`, `archives(name, from, to)`, and `active(name, at_offset)`. The PQS Reader tracks its own progress cursor by ledger offset to know what has already been processed. PQS itself handles the upstream Ledger API subscription, reconnection, backpressure, and pruning, so Canton Index inherits those guarantees rather than reimplementing them. PQS is assumed to be available on validators (the Canton Foundation's separately-funded "PQS as common good" work brings PQS into the open-source surface for all operators).

**Filter Specification:** A small file format that defines, per index target: which PQS table function to read, which template or choice qualified name to match, a `where` expression for selection, a `select` expression for projection, and a target document type. Filter expressions use a `jq`-inspired syntax over the friendly Daml-LF JSON payloads PQS already emits. The examples below illustrate the intent; exact syntax is not yet finalized.

```yaml
# Example 1: Extract traffic purchase events from PQS exercise rows

source: exercises
where: |
  .choice_fqn            == "splice-amulet:Splice.AmuletRules:AmuletRules_BuyMemberTraffic"
  and .argument.memberId == "{{MY_VALIDATOR}}"
select:
  contract_id:   .contract_id
  traffic:       .argument.trafficAmount
  synchronizer:  .argument.synchronizerId
  migration_id:  .argument.migrationId
  provider:      .argument.provider
  record_time:   .exercised_effective_at
  offset:        .exercised_at_offset
as: my_traffic_purchases

# Example 2: Project active CIP-0056 token holdings into a queryable table

source: active
where: |
  .template_fqn      == "splice-api-token-holding-v1:Splice.Api.Token.HoldingV1:Holding"
  and .payload_type  == "interface"
  and .payload.owner == "{{MY_PARTY}}"
select:
  contract_id:       .contract_id
  instrument_admin:  .payload.instrumentId.admin
  instrument_id:     .payload.instrumentId.id
  amount:            .payload.amount
  is_locked:         (.payload.lock != null)
  lock_expires_at:   .payload.lock.expiresAt
  created_at:        .created_effective_at
as: my_active_holdings
```

Identifiers in `source` follow PQS's `<package>:<module>:<entity>` grammar. The package is the Daml package's name from its `daml.yaml` (`splice-amulet` in the examples above). The module is the dotted Daml module path inside the package (`Splice.AmuletRules` corresponds to `daml/Splice/AmuletRules.daml`). The entity is a template, choice, or interface name. Partially qualified forms (module-and-entity, or entity-alone if unambiguous) are accepted by PQS, but the proposal will use fully qualified names so filters cannot be misread when more than one package defines the same module path. See [How to query contracts and transactions using SQL](https://docs.digitalasset.com/build/3.4/sdlc-howtos/applications/develop/pqs/index.html) for the full grammar and worked examples.

The filter format supports: field selection, filtering, renaming, nested JSON path access, numeric coercion for `Int64` and `Decimal` values (which PQS encodes as strings to preserve precision), computed fields, and matching by template or choice qualified name. Filter files are loaded at startup, one per index target. Templates are matched by `package_name + module + entity` so filters survive Daml package upgrades, mirroring how Splice's own Scan store handles versioning today.

**Filter Pipeline:** The filter pipeline evaluates filter expressions against PQS rows:

- Polls PQS for new offsets using the table functions above.
- Applies the `where` expression to discard non-matching rows.
- Applies the `select` projection to produce typed documents.
- Batches writes to the document store and advances the cursor on success.

**Document Store:** A document store persists transformed documents in PostgreSQL (JSONB):

- One table per extraction target (e.g., `traffic_purchases`, `token_transfers`)
- Automatic index creation
- Tracks source offset per document for consistency
- Supports pruning by age or offset to keep tables lean

**Query API:** HTTP document-query API over materialized documents:

```
POST /query/traffic_purchases

{
  "filter": {
    "member": "PAR::alice::1220...",
    "timestamp": { "$gte": "2026-04-01T00:00:00Z" }
  },
  "sort": { "timestamp": -1 },
  "limit": 100
}
```

The Query API supports `$eq`, `$ne`, `$gt`, `$gte`, `$lt`, `$lte`, `$in`, `$exists`, `$and`, `$or` for filtering, plus `sort`, `limit`.

The query engine enforces operational limits that protect the indexer from misbehaving clients, including maximum filter depth, maximum result-set size, request timeout, and no `$regex` operator (that avoids ReDoS by construction).

**3. Architectural Alignment**

- **Runs alongside validators:** No modifications to Canton nodes. Reads from PQS, which is already a documented and supported component of the Canton stack. Designed for the validator-operator persona that Canton targets.
- **Respects privacy model:** Only indexes data the participant is entitled to see. PQS already enforces the same privacy boundary as the Ledger API, which Canton Index will inherit.
- **Built on PQS:** Uses PQS's documented SQL API as its source of truth. PQS handles the streaming subscription, reconnection, pruning, and offset model upstream. Canton Index focuses on the missing layers above PQS: filter specifications, projected document storage, and the developer-facing query API. 

    Canton Index also handles full drop-and-reread from genesis, and a reset-to-offset that rewinds PQS to a specific ledger offset. In both cases, Canton Index detects that its tracked cursor is ahead of PQS, prunes downstream documents back to the new PQS frontier, and resumes ingestion from there. This keeps the document store consistent with PQS without operator intervention.
- **Open source:** Apache 2.0 licensed. Built to be a shared ecosystem primitive.
- **CIP-0056 aware.** Ships with example filters for Canton Network Token Standard contracts (token transfers, allocations, holdings) so developers can plug them in without authoring filters from scratch.

**4. Backward Compatibility**

No backward compatibility impact. Canton Index is an additive, read-only component that does not modify any Canton node or protocol behavior.

### Rationale

**Why build on PQS rather than extend it?** 

PQS is the right source layer for participant-local data. It already handles the streaming subscription to the Ledger API, the privacy boundary, the offset model, and persistence. What is missing on top of PQS is an opinionated way to declare what application-ready documents you want, and a query API to consume them. Canton Index fills that gap. The two components are complementary: PQS provides raw projected ledger data, Canton Index provides developer-facing filters and query.

**Why not extend Scan?** 

Scan is purpose-built for Splice's own apps (Canton Coin, Amulet, ANS) and its schema reflects that. Teams indexing their own templates cannot reuse it. Canton Index fills that gap as a general primitive, and adopts Scan's template-versioning approach where it applies. Phase 2 brings the two together by adding Scan as a second source alongside PQS (see [Roadmap](#roadmap-post-grant)).

**Why Rust?** 

Performance (critical for evaluating filters at high event rates), safety (no runtime panics in production), and low memory footprint (runs alongside a validator without competing for resources).

**Why `jq`-inspired filter expressions rather than SQL or GraphQL?** 

The core problem is selecting and reshaping nested Daml-LF JSON payloads. `jq` syntax is purpose-built for this and is already familiar to most developers. SQL requires upfront table definitions before any filter is written. GraphQL requires Daml type generation. 

**Why document-query syntax rather than GraphQL?** 

As discussed with the DA team, starting with weakly-typed document queries is the pragmatic first step for Canton's JSONB-based data. Strongly-typed GraphQL generated from Daml codegen is a future evolution once the filter and storage layers are proven (see Phase 4 in the [Roadmap](#roadmap-post-grant)).

**Why defer aggregations and roll-ups to a later phase?** 

Aggregations push significant complexity into the ETL process: state has to be persisted across events, schemas need to be designed up front, and the runtime has to handle ordering, idempotence, and recomputation. Doing this well requires real usage data on which patterns matter and how operators want to express them. 

Shipping Phase 1 first lets us collect that usage data from operators running real workloads, then build the aggregation runtime in Phase 3 against patterns that have actually emerged. Designing it before the data layer is in production is how you end up with the wrong abstractions baked in.

### Milestones and Deliverables

**Milestone 1: Filter Specification & Authoring Tools**

- **Estimated Delivery:** 4 weeks from start (310 eng-hours)
- **Focus:** The filter format, the embedded `jq` evaluator, and the authoring CLI.
- **Deliverables / Value Metrics:**
    - Filter specification reference document with syntax, semantics, and examples.
    - Rust filter loader and validator (parses filter files, type-checks against the configured PQS source kind).
    - CLI tool to validate and test filters against sample Daml-LF JSON payloads, including a recorded fixture set.
    - Unit test suite covering all expression operators, coercion helpers, and template matching rules.
    - At least 5 example filters covering common Canton patterns: traffic purchases (`splice-amulet:Splice.AmuletRules:AmuletRules_BuyMemberTraffic`), reward collection, CC transfers, ANS operations, and a CIP-0056 token transfer.
    - **Design review checkpoint:** filter format and example filters shared with DA engineering (Curtis Hrischuk) for feedback before proceeding to Milestone 2.

**Milestone 2: PQS Reader & Filter Pipeline**

- **Estimated Delivery:** 4 weeks after Milestone 1 (310 eng-hours)
- **Focus:** End-to-end pipeline from PQS poll to projected document.
- **Deliverables / Value Metrics:**
    - PQS reader using the documented SQL table functions (`creates`, `exercises`, `archives`, `active`), with per-filter ledger-offset cursor tracking.
    - Filter pipeline that loads compiled filters at startup, evaluates them against PQS rows, and produces projected documents.
    - Batched writer to PostgreSQL (JSONB) with cursor advancement on successful commit.
    - Checkpoint and resume support (crash recovery without reprocessing or duplication).
    - Error recovery and backoff for transient PQS unavailability.
    - Privacy and missing-field handling baked into the pipeline (null defaults, drop-on-missing predicates).
    - Integration tests against a local cn-quickstart deployment running PQS.
    - **Feedback checkpoint:** filter format may be revised based on real-event testing before committing to storage and query layers.

**Milestone 3: Document Store & Indexing**

- **Estimated Delivery:** 3 weeks after Milestone 2 (190 eng-hours)
- **Focus:** Persistent storage with automatic indexing and management
- **Deliverables / Value Metrics:**
    - Automatic table creation per extraction target
    - Index management (auto-create indexes on filtered fields)
    - Offset-aware document lifecycle (insert, update, prune by age)
    - Admin API for store inspection (list targets, document counts, lag from source)
    - Pruning/retention configuration
    - Observability: structured logs and operational metrics

**Milestone 4: Query API & Developer Experience**

- **Estimated Delivery:** 4 weeks after Milestone 3 (310 eng-hours)
- **Focus:** HTTP query endpoint, documentation, packaging, and end-to-end performance improvement based on observations from M2 and M3.
- **Deliverables / Value Metrics:**
    - HTTP query API with document-query filter/sort/limit syntax over materialized documents.
    - Query engine safeguards: max filter depth, max result-set size and request timeout
    - OpenAPI specification for the query endpoint.
    - Docker image for one-command deployment alongside a validator.
    - User-facing documentation site that consolidates the filter specification reference (shipped in M1), getting started guide, and query API reference.
    - End-to-end demo: Canton quickstart to Canton Index to live queryable data in under 30 minutes.
    - Cross-stage profiling report covering PQS poll, filter evaluation, write path, and query path, with identified bottlenecks and a prioritized follow-up backlog.
    - Operator-facing tuning guide covering any tunables or operational guidance surfaced during profiling.
    - Design partner engagement: at least one third-party application (validator operator or app developer from the Canton ecosystem) actively using Canton Index against their own data.

### Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- All deliverables completed as specified for each milestone
- Open-source repository with CI, tests, and documentation
- Demonstrated functionality against a live Canton network (DevNet or LocalNet)
- Docker-based deployment validated alongside the cn-quickstart template
- Filter specification covers at least 5 common Canton data patterns
- Documentation takes developers from deployment to querying in production

### Risks

| **Risk** | **Mitigation** |
| --- | --- |
| Filter format needs usability improvements based on real-world use | Design review with DA engineering after M1. Feedback checkpoint after M2 allows revision before storage and query layers commit to it. Format leans on `jq`-inspired syntax, which most developers already know. |
| Test coverage benefits from access to a running DevNet validator with real participant data | LocalNet (cn-quickstart) covers functional and integration testing for all features. We apply for DevNet allowlist access at project start. DA team contacts (Curtis Hrischuk, Shreyas Kutty) can help fast-track access if the standard 2-7 day window stretches. |
| Daml package upgrades that rename templates, choices, or fields can break filters silently | The runtime emits a structured warning when a filter produces zero matches over a polling window. The CLI tool added in M1 supports a diff mode that compares a filter against newly uploaded packages and flags missing fields or renamed entities before a filter is deployed. |
| Design partner availability is required for the adoption deliverable in Milestone 4. Without an engaged partner, validation feedback and demonstrated adoption are weakened. | Canton Devrel is connecting us with one or more community design partners, drawing on developer survey signal. We engage from M1 so they have time to integrate, then iterate with the partner(s) through M2–M4. |

### Sustainability

InfraDAO commits to maintaining Canton Index for **6 months after Milestone 4 delivery**, funded as Milestone 5 in the funding section. Coverage:

- Bug fixes and security patches
- Compatibility updates for Canton SDK releases (targeting same-week response for breaking changes)
- Community issue triage and PR review
- Filter / extraction template updates for new CIPs

The maintenance budget is sized at ~0.22 FTE (~9 hrs/week, 230 hours over 6 months). Quarterly progress reports document patches shipped, issues triaged, and SDK compatibility coverage.

After the 6-month maintenance period, the project will either:

- Transition to a recurring maintenance grant (similar to DA's Canton OSS maintenance model), or
- Be adopted by a SIG or community maintainer group, or
- Continue as community-maintained open source with InfraDAO providing best-effort support

The team will engage with DA engineering (Curtis Hrischuk's SDK team) to coordinate on API compatibility and ensure Canton Index is tested against pre-release Canton SDK versions.

**Licensing**: All code will be released under the **Apache 2.0 license** in a public GitHub repository, consistent with Canton's own licensing approach.

### Funding

**Total Funding Request: USD-equivalent $175,000 (delivery plus 6-month maintenance), priced in CC at the prevailing CC/USD rate at approval.**

Two engineers over 15 weeks of delivery, plus a 6-month post-launch maintenance period. Hours are estimated per milestone based on scope complexity. M1 to M4 deliver the product. M5 funds compatibility patches, security fixes, and community triage during the stabilization window.

**Payment Breakdown by Milestone**

| **Milestone** | **Duration** | **Effort** | **USD-equiv.** | **Trigger** |
| --- | --- | --- | --- | --- |
| 1. Filter Specification & Authoring Tools | 4 weeks | 310 eng-hours | $40,000 | Committee acceptance of deliverables |
| 2. PQS Reader & Filter Pipeline | 4 weeks | 310 eng-hours | $40,000 | Committee acceptance of deliverables |
| 3. Document Store & Indexing | 3 weeks | 190 eng-hours | $25,000 | Committee acceptance of deliverables |
| 4. Query API & Developer Experience | 4 weeks | 310 eng-hours | $40,000 | Final release and committee acceptance |
| **Delivery subtotal** | **15 weeks** | **1,120 eng-hours** | **$145,000** |  |
| 5. Post-Launch Maintenance | 6 months after M4 | 230 eng-hours | $30,000 | Quarterly progress report + final report at month 6 |
| **Grand total** |  | **1,350 eng-hours** | **$175,000** |  |

**Cost Basis**

| **Item** | **Detail** |
| --- | --- |
| Engineering rate | $130/hr (blended senior) |
| Team size | 2 engineers (delivery), ~0.22 FTE rotating (maintenance) |
| Delivery capacity | 2 × 15 weeks × 40 hrs/week = 1,200 hours (1,120 budgeted, ~7% slack) |
| Maintenance capacity | 6 months × ~9 hrs/week = ~230h |
| USD equivalent | $175,000 total ($145,000 delivery + $30,000 maintenance) |
| CC conversion | Computed at approval against the prevailing CC/USD rate. Once approved, denominated in fixed CC per the volatility stipulation. |

The CC amount will be locked at approval based on the prevailing CC/USD rate. Worked examples for reference:

| **CC/USD reference rate** | **Total CC ask** |
| --- | --- |
| $0.10 | 1,750,000 CC |
| $0.15 | 1,166,667 CC |
| $0.20 | 875,000 CC |

**Volatility Stipulation**

The grant is denominated in fixed Canton Coin, locked at the prevailing CC/USD rate at approval. The delivery milestones (M1 to M4) are not subject to rebasing. The maintenance milestone (M5) is paid approximately 9-10 months after approval; if significant USD/CC price movement occurs in that window, or if Committee-requested scope changes extend the timeline, the un-minted M5 tranche must be renegotiated by mutual agreement between InfraDAO and the Committee.

The USD-equivalent figures above are presented for transparency on how the CC ask was sized; once approved, the contract is denominated in fixed Canton Coin.

### Roadmap (Post-Grant)

This proposal delivers the foundation: PQS as source, filter pipeline, document store, query API. Future work is subject to separate proposals or community contribution. Phases 2 through 4 are scoped at a high level to outline the architectural direction. Each will require its own scoping, timeline, and funding through follow-up grant proposals, informed by Phase 1 usage and design partner feedback.

| **Phase** | **Scope** | **Dependency** |
| --- | --- | --- |
| **Phase 1 (this proposal)** | Filter specification, PQS reader, filter pipeline, document store, query API. Stateless projections only. | PQS available on the validator. |
| **Phase 2** | Scan connector. A second source adapter that ingests from a Scan instance using the same filter and document model as the PQS reader. Covers network-level data, cross-validator views (e.g. transactions submitted through other validators in external signing flows), and historical periods that local PQS or the validator's ledger may have pruned. Opens up use cases that participant-local PQS can't serve, from network-wide analytics and audit completeness to historical backfill. | Phase 1 shipped. |
| **Phase 3** | Stateful filter runtime. WASM-based SDK (AssemblyScript or Rust) for filter modules with explicit handlers per event type, a host-provided storage API for entities, and support for incremental aggregations and roll-ups computed during ingestion. Required for use cases like running balances, top-K holders, round-by-round summaries, and cross-template joins. Mirrors The Graph's Subgraph model adapted for Canton. | Phase 1 shipped. |
| **Phase 4** | Strongly-typed GraphQL API generated from Phase 3 entity definitions. | Phase 3 shipped. |

Phase 2 brings Scan in as a second source. PQS is participant-local by design, which means a Canton Index instance only sees what its connected validator has submitted and retained. Scan complements that with a network-level view, opening up use cases that participant-local PQS can't serve on its own: network-wide analytics, audit and reconciliation completeness, historical reconstruction when the local PQS or the validator's ledger has been pruned, and cross-validator views for applications whose users span multiple validators (for example, traffic attribution when a user prepares a transaction on one validator but submits through another). The connector reuses the Phase 1 filter and document model, so existing filters can target Scan with minimal change.

Phase 3 is where roll-ups, aggregations, and stateful event processing land. The right answer for these is a real programming model with persisted entities and explicit handlers, not query-time SQL aggregations over JSONB. That runtime is substantial work in its own right and is best scoped as a separate milestone informed by Phase 1 and Phase 2 usage data.

Phase 4 aligns with DA CPO Bernhard Elsner's stated vision of a GraphQL endpoint for Canton data. The entities defined by Phase 3's filter modules become the natural GraphQL schema source.

### Co-Marketing & Distribution

Upon release, InfraDAO / The Graph Foundation will collaborate with the Canton Foundation on:

**Marketing**: 

- Joint announcement across The Graph and Canton channels
- Technical blog post: "From Raw Ledger to Queryable API in 30 Minutes"
- Developer tutorial and video walkthrough
- Presentation at Canton community call or developer event
- Case study on indexing patterns for Canton DeFi applications

**Distribution:**

- Docker image published to a public container registry
- Integration guide for cn-quickstart (deploy Canton Index alongside the quickstart validator)
- Listing on Canton ecosystem page and developer documentation
- Announcement in Canton developer Slack/Discord channels
- DA DevRel (Shreyas Kutty) to assist with developer outreach and onboarding support

*Adoption metrics (design partner engagement, validator operator testing) are tracked under Milestone 4 deliverables.*
