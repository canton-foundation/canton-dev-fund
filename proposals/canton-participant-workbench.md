## Development Fund Proposal

**Author:** Nick Sawinyh
**Status:** Draft
**Created:** 2026-03-10
**Proposal type:** Developer tooling and ecosystem infrastructure
**Contact:** nsawinyh@gmail.com
**Tech & Ops Committee Champion:** [To be confirmed]

---

## Summary

Canton Participant Workbench is an open-source PQS-to-UI layer that translates raw Daml contract data into human-readable views for compliance officers, auditors, and operations staff — the non-technical institutional users who currently have no way to act on their private ledger data without engineering support. The fund deliverables are two reusable npm libraries (`@canton-workbench/pqs-connector` and `@canton-workbench/pqs-decoder`), a published compliance export schema, and a production-ready reference frontend that any Canton participant or node operator can deploy against their own PQS in under an hour. By shipping open source software rather than a single-institution integration, this proposal lowers the cost of building compliant Canton applications for every future developer in the ecosystem. The team intends to build a hosted commercial product on top of these open-source components; that work is entirely separate from and out of scope for this proposal.

---

## Abstract

We are building the Canton Participant Workbench: an open-source PQS-to-UI layer that gives non-technical participants — compliance officers, operations leads, auditors — human-readable visibility into their private ledger data across all Canton applications they are connected to.

A working frontend demo is available for review at https://canton-prism.vercel.app/. It uses mocked PQS data but demonstrates the complete UX across all pages described in the proposal. The decoder library design, component architecture, and contract visualization approach are all visible in the demo. The transition from mocked to live PQS is a connector integration, not a UI rebuild. Approximately 5–7 weeks of engineering effort are already invested and provided at no cost to the Fund.

The fund deliverable is a shared open-source software package: a Daml contract decoder library (`@canton-workbench/pqs-decoder`), a typed PQS connector (`@canton-workbench/pqs-connector`), a published compliance export schema, and a reference frontend implementation. Any Canton participant, node operator, or application provider can deploy these components against their own PQS without restriction. All components are MIT licensed.

### Working Demo — Screenshots

The following screenshots are taken from the live demo at https://canton-prism.vercel.app/ (mock PQS data).

**Dashboard — party-scoped contract summary and live network metrics**
![Dashboard](assets/canton-participant-workbench/01-dashboard.png)

**Active Contracts — cross-template contract set with filtering**
![Active Contracts](assets/canton-participant-workbench/02-contracts.png)

**Contract Detail — decoded business view, authorization section, raw JSON toggle**
![Contract Detail](assets/canton-participant-workbench/03-contract-detail.png)

**Transaction History — full event timeline with advanced filters**
![Transaction History](assets/canton-participant-workbench/04-transactions.png)

**Contract Lifecycle Graph — React Flow DAG of contract events**
![Event Graph](assets/canton-participant-workbench/05-event-graph.png)

**Stakeholder Groups — network topology graph showing canton chain visibility across parties**
![Stakeholder Groups](assets/canton-participant-workbench/08-stakeholder-groups.png)

**Compliance Export — party-scoped PDF audit package generation**
![Compliance Export](assets/canton-participant-workbench/06-compliance-export.png)

**Node Health — sequencer delay, PQS backlog, validator connections**
![Node Health](assets/canton-participant-workbench/07-node-health.png)

---

## Specification

### 1. Objective

Canton has crossed the infrastructure threshold. Over $6 trillion in tokenized assets. $280 billion in daily Treasury repo. 600+ nodes. The participants are here. The problem that emerges at this scale is operational, not architectural.

Every Canton participant can already query their private ledger data via the Participant Query Store. In practice, the people who need to act on that data — compliance officers generating audit packages, operations leads monitoring settlement exposure, auditors reviewing counterparty positions — cannot. Their only options are:

- Ask an engineer to write a PQS SQL query against a Postgres database
- Use Daml Shell, a developer terminal application
- Read Grafana infrastructure dashboards built for node operators, not financial professionals

A raw Daml JSON contract payload contains a hex contract ID, a package-hash template reference, party IDs in cryptographic fingerprint format, and field values without display context. A compliance officer cannot determine from it which counterparty owes what, whether the contract is settled, or whether it should appear in a regulatory report. That translation currently requires a Daml-trained engineer every time.

The second compounding problem: a participant operating across multiple Canton applications has no unified view. They log into separate application UIs — one for tokenized holdings, one for repo, one for collateral — each showing a fragment of their total Canton position. There is no cross-application aggregation layer.

The Participant Workbench removes both constraints. It is the translation layer that makes Canton's private ledger data legible to the people who are operationally responsible for it.

### System Architecture

```mermaid
graph TB
    subgraph node["Participant Node (private infrastructure)"]
        PQS[(PQS\nPostgreSQL)]
    end

    subgraph libs["Open-Source Libraries — Fund Deliverables"]
        CON["@canton-workbench/pqs-connector\nTyped query layer · connection pooling\nPQS version compatibility · pagination"]
        DEC["@canton-workbench/pqs-decoder\nDaml LF payload → DecodedContract\nTemplate registry · Party resolver\nField formatting · Auth structure"]
    end

    subgraph app["Reference Frontend — Fund Deliverable"]
        UI["Next.js 15 Application\nActive contracts · Contract detail\nEvent graph · Transaction history\nCounterparty directory · Stakeholder groups\nNode health · Compliance export PDF/CSV"]
    end

    subgraph users["Non-Technical Institutional Users"]
        CO["Compliance Officer\nAudit packages · Regulatory reports"]
        OL["Operations Lead\nSettlement exposure · Position monitoring"]
        AU["Auditor\nContract lifecycle · Counterparty review"]
    end

    PQS -->|"JSONB queries\n(party-scoped)"| CON
    CON --> DEC
    DEC -->|"DecodedContract[]"| UI
    UI --> CO
    UI --> OL
    UI --> AU
```

### 2. Implementation Mechanics

**Component 1 — Daml Contract Decoder Library (`@canton-workbench/pqs-decoder`)**

A TypeScript/JavaScript library that accepts a raw PQS JSON payload and returns a fully typed, human-readable contract representation. The library:

- Resolves template IDs (package hash + module + entity) to human display names via a configurable template registry
- Resolves cryptographic Party IDs (e.g. `Party::1220a4b9...`) to human-readable institution names (e.g. "Acme Bank") via a configurable party directory populated at deployment
- Maps `createArgument` fields to typed, formatted values (monetary amounts with currency, dates in ISO 8601, boolean flags as status labels)
- Surfaces authorization structure explicitly: signatories, observers, and by inference which named parties cannot observe the contract
- Produces a normalized `DecodedContract` type that any frontend can consume without Daml expertise

The translation the decoder performs — from raw PQS payload to human-readable representation:

```mermaid
graph LR
    subgraph raw["Raw PQS JSON (what exists today)"]
        R["contractId: 00fa3b...\ntemplateId: abc123#Daml.Finance.Holding:Fungible\ncreateArgument.owner: Party::1220a4b9...\ncreateArgument.amount.quantity: 1000000\ncreateArgument.amount.unit: USD"]
    end
    subgraph decoded["DecodedContract (what the Workbench produces)"]
        D["template: Fungible Holding\nowner: Acme Bank\namount: $1,000,000 USD\nstatus: Active\nsignatories: [Acme Bank, CustodianX]\nobservers: [Asset Manager Y]\nnon-observers: [all other parties]"]
    end
    raw -->|"@canton-workbench/pqs-decoder"| decoded
```

Ships with built-in decoders for all Daml Finance standard templates (Holding, Instrument, Account, Settlement, Batch), Canton Utilities layer templates, and CIP-56 token standard assets. New template types are added via a typed configuration schema — a JSON/YAML file mapping template IDs to field display configurations — so application builders can extend the library without modifying its core. The registry is designed to accept Daml interface types, extending naturally to any future template types that conform to Daml Finance interfaces.

**Component 2 — PQS Connector (`@canton-workbench/pqs-connector`)**

A typed query layer that wraps raw PQS PostgreSQL access with a structured API:

```typescript
// Active contract set for a party
const contracts = await pqs.getActiveContracts({ party, templateFilter, dateRange });

// Full event history
const events = await pqs.getTransactionHistory({ party, eventTypes, counterparty });

// Contract lifecycle (for event graph rendering)
const lifecycle = await pqs.getContractLifecycle({ contractId });
```

The connector handles PQS schema differences across Canton versions, manages connection pooling, and provides a pagination interface suitable for large datasets. It is the typed abstraction that application builders use instead of writing raw JSONB queries against PQS.

**Component 3 — Compliance Export Schema (open standard)**

A defined JSON schema and PDF layout specification for Canton participant audit packages. The schema specifies:

- Required fields for a compliant contract listing (template type, parties, value, status, contract ID, created timestamp)
- Event attestation record format (event type, timestamp, transaction ID, parties involved)
- Attestation statement structure with timestamp and node identifier

Publishing this as an open standard means audit packages generated by different tools — the Workbench, an application-specific interface, a bespoke bank integration — are structurally consistent. A regulator receiving a Canton audit package from two different institutions can apply the same review process to both.

**Component 4 — Reference Frontend Implementation**

A complete, deployable Next.js 15 application demonstrating all three components working together against a real PQS instance. This is production-quality code that a node operator can fork, configure with their participant's PQS connection string, and deploy in under an hour.

The reference implementation includes:

- Cross-application active contract set with filtering and search (grid and table views)
- Contract detail view: decoded business representation, raw JSON toggle, authorization section (signatories / observers / non-observers)
- Transaction history: full event type coverage (CREATE, EXERCISE, ARCHIVE, DIVULGENCE), advanced filters, CSV export
- Contract lifecycle event graph (React Flow directed acyclic graph, minimum 5 distinct lifecycles)
- Counterparty directory with shared contract summary
- Stakeholder Groups — network topology graph showing the Canton chain visibility subgraph for each group: which parties are co-signatories, which are observers, and the contractual relationships between them
- Compliance export workflow: PDF and CSV generation conforming to the open schema
- Node health dashboard: sequencer delay, PQS backlog, validator connections, sync status, 24-hour historical charts
- Multi-party view: switch between parties hosted on the same participant node; all data views update correctly

The repository includes full documentation, a local development environment using the Canton Quickstart LocalNet with seeded contract data, and a "how to add a new contract type" guide requiring no code changes to the core library.

**Tech stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS + shadcn/ui, Zustand (party-scope state), SWR (polling), React Flow (event graph), Recharts (health charts), jsPDF + html2canvas (export).

### 3. Scale and Performance Targets

The Workbench is designed to operate at realistic institutional participant scale, with an upper bound targeting the largest Canton deployments:

- **Active contract set:** Up to 10,000,000 active contracts per participant node, with sub-second query response for filtered views (≤100ms p95 for paginated queries of 50 contracts)
- **Database size:** Tested against PQS databases up to 500 GB (approximately 40 million historical events), with pagination and cursor-based fetching to avoid full-table scans
- **Throughput:** Handles PQS ingestion rates of up to 1,000 transactions/second without UI degradation; SWR polling intervals are configurable (default 5s) to balance freshness against PQS load
- **Concurrent users:** The reference frontend supports 50+ concurrent browser sessions against a single deployment; horizontal scaling via standard Next.js deployment patterns (Vercel, Docker, Kubernetes)
- **Compliance export:** PDF/CSV generation for audit packages covering up to 100,000 contracts completes within 60 seconds

**Search and filtering at scale.** At 10 million active contracts, full-text search across raw JSONB fields is not viable via simple `WHERE` clause filters. The connector implements a two-tier approach: (1) PostgreSQL `tsvector` indexes on key decoded fields (template name, party display names, contract status, and configurable business fields) for sub-second filtered queries; (2) cursor-based pagination with server-side filtering to avoid full result-set materialization. For deployments exceeding 5 million contracts where search latency requirements are stricter, the connector architecture supports pluggable search backends — an operator can substitute an external search index (e.g. OpenSearch) without modifying the decoder or frontend layers. The reference implementation ships with the PostgreSQL `tsvector` approach as the default, validated at the 10M contract target.

These targets reflect the upper bound of current Canton Network participant deployments running tokenized asset and repo applications. The local development environment includes a seeded dataset at 1% of these limits to validate performance during development.

### 4. Architectural Alignment

**Privacy model.** The Workbench does not aggregate data across participants, create cross-participant data pipelines, or expose any data beyond what the participant's PQS already contains. Each deployment is isolated to a single participant node. The authorization section — showing which parties cannot observe a contract — surfaces Canton's privacy model to non-technical users rather than obscuring it.

**PQS as a canonical interface.** The connector and decoder use PQS as their sole data source, consistent with Canton's recommended read path for application UIs. No custom Canton node protocol is involved.

**Composability.** The decoder library is shared infrastructure for the Canton application ecosystem. Any Canton application builder who uses `@canton-workbench/pqs-decoder` avoids rebuilding the same translation layer. This reduces duplication and creates a consistent user experience across Canton applications.

**CIP alignment.** The decoder library's template registry is designed to accept Daml interface types, remaining compatible with any future CIP that standardizes PQS query patterns or Daml LF decoding. The compliance export schema will be published under a versioned open schema and shared with the Canton developer community; whether it eventually becomes a formal CIP is a community decision that this proposal does not try to predetermine.

**Complements existing tooling without duplicating it.** CantonScan, The Tie, and CC Explorer serve public network data. The Noves Data App serves technical users via API. The Workbench serves non-technical institutional staff with private ledger data. Different audiences, different data sources, different use cases — no meaningful overlap.

### 5. Backward Compatibility

No backward compatibility impact. The Workbench is a pure read-path application. It does not modify Canton nodes, PQS, or any existing Canton tooling. A mock data mode is always retained, so the application remains demonstrable without a live PQS connection. No Canton node configuration changes are required.

---

## Milestones and Deliverables

### Milestone 1: Foundation (Weeks 1–6)

- **Estimated Delivery:** 6 weeks from grant approval
- **Focus:** Open-source library release — PQS connector, decoder library, local dev environment
- **Deliverables / Value Metrics:**
  - `@canton-workbench/pqs-connector` v1.0 published to npm, MIT licensed
  - `@canton-workbench/pqs-decoder` v1.0 with built-in decoders for all Daml Finance standard templates (Holding, Instrument, Account, Settlement, Batch), Canton Utilities layer templates, and CIP-56 token standard assets
  - Decoder configuration schema documented with worked examples for CIP-56 token standard assets
  - Local development environment: docker-compose using Canton Quickstart LocalNet with seeded contract data covering all supported template types
  - Unit test suite with ≥90% coverage on decoder library; integration tests against LocalNet
  - README quickstart: PQS connection string → decoded contract output in ≤10 lines of code

### Milestone 2: Reference Frontend (Weeks 7–14)

- **Estimated Delivery:** 8 weeks after Milestone 1 acceptance
- **Focus:** Production-quality reference frontend demonstrating all components against a real Canton PQS
- **Deliverables / Value Metrics:**
  - Reference Next.js application, MIT licensed, with all pages: active contracts, contract detail, transaction history, event graph, counterparty directory, stakeholder groups network topology, node health, and compliance export
  - Tested against Canton Network TestNet / DevNet and MainNet; all supported template types render correctly
  - Multi-party support verified: switching parties updates all data views correctly including stakeholder group topology
  - CSV export generates a valid, correctly formatted file for any filtered transaction history view
  - Deployment guide verified: a reviewer with no prior codebase knowledge can deploy a running instance from the guide alone, within one hour
  - "How to add a new contract type" guide: end-to-end walkthrough using only the configuration schema, no code changes
  - Joint technical blog post with Canton Foundation

### Milestone 3: Compliance Export Standard and Documentation (Weeks 15–18)

- **Estimated Delivery:** 4 weeks after Milestone 2 acceptance
- **Focus:** Open compliance standard, ecosystem integration guide, Canton developer docs contribution
- **Deliverables / Value Metrics:**
  - Open compliance export schema v1.0: JSON Schema definition for Canton audit packages (contract listings + event attestation records), with field definitions, rationale, and example output for each supported template type; published to GitHub under MIT license
  - PDF export in the reference frontend conforming to the schema; passes JSON Schema validation
  - Integration guide for Canton application builders: how to use `@canton-workbench/pqs-decoder` and `@canton-workbench/pqs-connector` in an existing Canton application frontend; published alongside the schema with a community feedback period of at least 2 weeks before milestone claim
  - PR to canton.network developer docs adding the Participant Workbench libraries to the developer tooling section (merged or confirmed in review)

### Milestone 4: Adoption, Maintenance & Ecosystem Integration (90 days post-M3)

- **Estimated Delivery:** 90 days after Milestone 3 acceptance
- **Focus:** Sustained maintenance, ecosystem adoption, and community engagement
- **Deliverables / Value Metrics:**
  - 90-day maintenance window completed: all critical bugs resolved within 5 business days, non-critical within 15
  - Canton SDK compatibility verified against each stable release published during the maintenance window (patch release within 30 days)
  - At least 10 GitHub issues triaged and resolved — including issues surfaced through proactive community outreach, user testing sessions, and pilot participant feedback
  - At least one documented third-party deployment (may be anonymized for institutional privacy)
  - At least 2 patch or minor releases published during the maintenance window addressing bugs, compatibility, or community feedback
  - Community engagement: published responses to all schema feedback received during the Milestone 3 community feedback period
  - CI/CD maintainability runbook published covering build pipeline, deployment, test suite, dependency update cadence, and release process

### Delivery Timeline

```mermaid
gantt
    title Canton Participant Workbench — Delivery Schedule
    dateFormat  YYYY-MM-DD
    axisFormat  %b %d

    section Milestone 1 · Foundation
    PQS Connector npm package          :m1a, 2026-04-14, 3w
    Decoder library + Daml Finance decoders :m1b, after m1a, 3w

    section Milestone 2 · Reference Frontend
    Active contracts + contract detail  :m2a, after m1b, 4w
    Event graph + history + node health :m2b, after m2a, 2w
    Compliance export + deployment docs :m2c, after m2b, 2w

    section Milestone 3 · Compliance Schema
    JSON Schema v1.0 + PDF conformance  :m3a, after m2c, 2w
    Integration guide + developer docs PR :m3b, after m3a, 2w

    section Milestone 4 · Maintenance
    90-day maintenance window           :m4a, after m3b, 13w
```

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone
- Demonstrated functionality or operational readiness
- Documentation and knowledge transfer provided
- Alignment with stated value metrics

**Project-specific acceptance conditions:**

- **M1:** Both npm packages installable and functional against a live PQS; all Daml Finance standard templates, Canton Utilities layer templates, and CIP-56 token standard assets decoded correctly end-to-end; all tests pass against Canton SDK current stable release
- **M2:** Application connects to Canton Network TestNet / DevNet and MainNet PQS and renders correctly for all supported template types; deployment guide independently verified by a reviewer with no prior codebase knowledge within one hour
- **M3:** Compliance export schema passes JSON Schema validation; PDF export structurally consistent with schema; integration guide published with evidence of a minimum 2-week community feedback period (forum post, Discord announcement, or equivalent); Canton developer docs PR merged or confirmed in review
- **M4:** 90-day maintenance window completed with all SLA targets met; Canton SDK compatibility verified for each stable release during the window; minimum 10 external GitHub issues triaged and resolved; at least one documented third-party deployment; CI/CD maintainability runbook published

**External dependencies:** Milestones 2–4 require access to Canton Network TestNet / DevNet and MainNet PQS instances with representative contract data for integration testing and acceptance verification. The project team requests that Digital Asset or the Canton Foundation provision this access upon grant approval. Milestone delivery timelines assume access is available within 2 weeks of each milestone start; delays in provisioning do not count toward late delivery thresholds.

---

## Funding

**Total Funding Request:** 2,000,000 CC

Canton's pilot reports identify real-time visibility, auditability, and reconciliation as the operational capabilities that drive institutional adoption. DTCC built a proprietary tool to capture these capabilities for itself. This proposal delivers them to every Canton participant as open-source shared infrastructure. The request is sized against the ecosystem value of removing the operational friction that slows institutional Canton adoption — not against engineering hours. Every Canton participant that needs compliance reporting, operations monitoring, or audit trail access currently faces a build-or-wait decision. The Workbench eliminates that decision across the entire network. A single institution building an equivalent internal tool — as DTCC did with LedgerScan — would invest comparable resources for a proprietary result that benefits no one else.

### Payment Breakdown by Milestone

- Milestone 1 _(Foundation)_: 300,000 CC upon committee acceptance
- Milestone 2 _(Reference Frontend)_: 500,000 CC upon committee acceptance
- Milestone 3 _(Compliance Export Standard and Documentation)_: 400,000 CC upon committee acceptance
- Milestone 4 _(Adoption, Maintenance & Ecosystem Integration)_: 800,000 CC upon committee acceptance after a 90-day maintenance window following Milestone 3

Milestone 4 — representing 40% of the total grant — is payable only after the libraries and reference implementation have been maintained in production for 90 days post-Milestone 3 acceptance. This structure ensures the Foundation pays the largest tranche only after sustained delivery, not on initial code drop.

### Milestone 4 — Acceptance Criteria

- 90-day maintenance window completed: all critical bugs resolved within 5 business days, non-critical within 15
- Canton SDK compatibility verified against each stable release published during the maintenance window (patch release within 30 days)
- At least 10 GitHub issues triaged and resolved — including issues surfaced through proactive community outreach, user testing sessions, and pilot participant feedback
- At least one documented third-party deployment (may be anonymized for institutional privacy)
- At least 2 patch or minor releases published during the maintenance window addressing bugs, compatibility, or community feedback
- Community engagement: published responses to all schema feedback received during the Milestone 3 community feedback period
- CI/CD maintainability runbook published covering build pipeline, deployment, test suite, dependency update cadence, and release process

### Early Delivery Bonus / Late Delivery Adjustment

- **Acceleration bonus:** 10% additional CC awarded per milestone delivered and accepted ≥2 weeks ahead of the scheduled delivery date
- **Late delivery adjustment:** 10% reduction per milestone delivered ≥4 weeks past the scheduled delivery date
- Scheduled delivery dates are calculated from grant approval, with 2 weeks of contingency buffer added to each milestone beyond the base timeline
- Delays caused by Committee review cycles or Committee-requested scope changes do not count toward the late delivery threshold

### Volatility Stipulation

Project duration is approximately 22 weeks plus the 90-day maintenance window. Should the project timeline extend beyond 9 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility. All milestone amounts are denominated in fixed CC as stated above.

### Pre-Grant Contribution Note

Approximately 5–7 weeks of engineering effort have already been invested in the existing working demo (full frontend, party-switching architecture, contract visualization, compliance export, node health dashboard). This work is provided at no cost to the Fund and is not reflected in the funding request. The grant funds the incremental work required to produce open-source production libraries, a live-PQS reference implementation, an open compliance standard, and a 90-day post-delivery maintenance commitment.

---

## Co-Marketing

Upon release, the implementing entity will collaborate with the Canton Foundation on:

- Announcement coordination at Milestone 1 (public npm package launch)
- Listing in the Canton tooling / ecosystem partner directory
- Joint technical blog post at Milestone 2 (PQS integration deep-dive)
- Demo video published on Canton channels at Milestone 1
- Publication and community promotion of the compliance export schema at Milestone 3
- Conference or community presentation at Milestone 3 (developer SDK and schema launch)

---

## Motivation

In our conversations with Canton participants and application builders, the most consistent friction point after the Daml learning curve has been operational visibility for non-technical staff. A compliance officer who cannot generate a regulatory report from their Canton node without engaging an engineer is a compliance officer whose institution is slower to expand its Canton footprint.

Every Canton participant can already query their private ledger data via PQS. The problem is that the people who need to act on that data — in compliance, operations, audit — have no interface that speaks their language. The Workbench removes that constraint directly and at the right level of the stack: shared infrastructure that every Canton application builder and every node operator can deploy, rather than a one-off integration at a single institution.

The second lever is developer velocity. Every new Canton application that launches today requires its own PQS translation layer, its own contract display logic, its own compliance export implementation. The decoder library and PQS connector eliminate that duplication across the ecosystem. Every future application builder who uses the open-source components avoids weeks of re-implementation. The compliance export schema, once published as an open standard, creates interoperability between applications and the compliance workflows that operate across them.

---

## Rationale

**Why open-source shared libraries rather than an application?** A single application helps one deployment. Shared libraries help every Canton application builder and every node operator.

**Why does the team's commercial product strengthen rather than weaken this proposal?** The committee's biggest risk with any ecosystem grant is funding software that dies after the last milestone payment. A commercial product built on the same open-source libraries means the team has a direct financial incentive to keep them current with every Canton SDK release — not out of goodwill, but because their revenue depends on it. The grant funds the open-source extraction once. The commercial product funds perpetual maintenance indefinitely — at zero ongoing cost to the Foundation.

This creates a structural alignment that pure open-source grants cannot match:

- **Free perpetual maintenance.** The Foundation pays for the library extraction and reference implementation once. The team keeps the libraries current because their own product breaks if they don't. Canton gets maintained infrastructure without funding maintenance.
- **Adoption infrastructure.** Every institutional participant that deploys the Workbench — whether the open-source reference or the commercial product — is a stickier Canton user. Compliance officers who can self-serve audit reports don't push back when their institution expands its Canton footprint. The commercial product actively sells Canton adoption to enterprises.
- **Ecosystem proof point.** A viable commercial product built on Canton's open-source stack signals to other builders that Canton is a platform worth investing in. It is the difference between "Canton has libraries" and "Canton has businesses."
- **No downside risk.** Everything funded by this grant is MIT licensed. If the team disappears, the Foundation has the code, the maintainability runbook, and the right to fork. If the team succeeds commercially, Canton gets a self-funded evangelist maintaining shared infrastructure. The Foundation wins in both scenarios.

The first customer of the open-source libraries is the team that built them. That is the strongest quality signal the ecosystem can get.

**Why Next.js 15?** Institutional application teams building on Canton are predominantly React shops. Next.js 15 with App Router is the dominant production framework in this segment. Server Components allow PQS queries to run server-side, eliminating CORS exposure and simplifying auth token handling — a meaningful security improvement over a pure client-side approach.

**Why PQS as the sole data interface?** PQS is Canton's recommended read path for application UIs. Building against PQS ensures the libraries and reference implementation remain compatible with Canton's evolution and avoids coupling to internal node APIs.

**Why a compliance export schema as an open standard?** Without a shared schema, a compliance officer receiving Canton audit packages from two different institutions must apply two different review processes. A regulator receiving them encounters structural inconsistency. Solving this at the standard level is more durable than solving it inside any single application.

**Alternatives considered:**
- *Adapting Hyperledger Explorer:* Not compatible with Canton's privacy architecture; would require deep modification with uncertain outcome.
- *Building a generic PQS SQL UI:* A generic SQL interface exposes raw Daml JSON with no decoding — identical to the status quo for non-technical users.
- *Each application builder solving this independently:* The current situation. Produces inconsistent results, duplicates effort, raises the bar for new entrants.

---

## Long-Term Maintenance Plan

The open-source components will be maintained as long as the team operates a commercial product built on top of them — and the team's business model depends on exactly that. The commercial product adds what open-source intentionally doesn't: managed hosting, enterprise auth, and paid support. The libraries and reference implementation remain fully functional standalone. Every Canton SDK release that changes PQS schema or Daml Finance template types requires the team to update the decoder and connector for their own product to keep functioning. Those same updates flow directly to the open-source packages. The maintenance incentive is structural and revenue-driven, not voluntary or grant-dependent. The Foundation gets continuously maintained infrastructure without funding continuous maintenance.

For Canton SDK version compatibility: the connector and decoder will be tested against each Canton SDK stable release within 30 days of release. Breaking changes to PQS schema or Daml Finance template types will be addressed in a patch release. The compliance export schema will be versioned independently (minor version for backward-compatible additions; major version with migration guide for breaking changes).

### Maintainability Runbook

All repositories will ship with a CI/CD runbook — a single document covering everything a new maintainer needs to keep the project operational without the original team:

- **Build pipeline:** CI configuration, build steps, environment variables, and artifact publishing (npm release flow)
- **Deployment process:** Step-by-step instructions for deploying the reference frontend from a clean checkout, including Docker and Kubernetes configurations
- **Test suite:** How to run unit, integration, and end-to-end tests locally and in CI; how to add tests for new template types
- **Dependency update cadence:** Schedule and process for Canton SDK compatibility updates, npm dependency audits, and security patches
- **Release process:** Versioning convention, changelog format, and npm publish workflow

This runbook ensures the Canton Foundation or any community maintainer can fork, build, test, deploy, and release updates independently. The project does not become unmaintainable if the original team steps away.

The Canton Foundation is welcome to fork any component under the MIT license if the project team ceases maintenance. The reference implementation, all documentation, and the maintainability runbook will remain publicly accessible.

---

## Adoption and Distribution Plan

**npm publication:** Both packages published to npm under a public scope upon library release. Announced to the Canton developer community via the official developer forum and Discord. Submitted to the Canton Foundation's partner/app directory.

**Designed-in adoption:** The "how to add a new contract type" guide is designed so that any Canton application builder can extend the decoder for their own templates in under an hour. The compliance export schema is published as a versioned open standard — not mandatory, but a shared reference that creates interoperability across tools and audit workflows.

**Node operator distribution:** The reference frontend is deployable by any node-as-a-service provider as a white-labeled participant dashboard. The deployment guide targets this audience explicitly. Node operators who add the Workbench to their service offering give their institutional clients operational visibility that no other Canton tooling currently provides.

**Target early adopters:** Participants operating across multiple Canton applications (cross-app aggregation); compliance teams preparing for their first regulator review of Canton activity; node operators looking to differentiate their managed node service.

---

## Ecosystem Positioning

Canton's own pilot reports — the Euroclear Gilts, Eurobonds and Gold pilot (27 participants, 500+ transactions) and the DTCC US Treasuries pilot (26 participants, 100+ transactions) — identify the operational capabilities that drive institutional adoption of tokenized assets on the Canton Network:

> "Data synchronization enhances visibility. Participants get real time information on collateral pledged, received and moved."

> "A single golden source of data removes layers of time-consuming reconciliation throughout the transaction chain."

> "Transparency and auditability allow for the market-wide regulatory oversight necessary to further adoption of digital assets."

> "The transfer of ownership over the asset is fully traceable and auditable on Canton Network and can stand up in a court of law."

These are not aspirational statements — they describe proven protocol capabilities. The gap is that no participant-facing tool exists to deliver them. The data is on the ledger. The visibility, reconciliation, and audit trail capabilities are in the protocol. But the compliance officer, operations lead, and auditor at each participating institution have no interface to access any of it without engineering support.

**DTCC recognized this gap and built LedgerScan** — a proprietary tool that "observes the transaction streams from traditional and digital ledgers to produce a real time market scale accounting record of ownership, encumbrance and risk management metrics." LedgerScan solves the problem for DTCC. Every other Canton participant — the 27 organizations in the Euroclear pilot, the 26 in the DTCC pilot, and every institution joining the network after them — has no equivalent.

The Participant Workbench delivers to every Canton participant the same category of operational visibility that DTCC built LedgerScan to provide at the market infrastructure level — real-time ownership tracking, encumbrance status, and auditability — scoped to the participant's own private ledger data via PQS. Where LedgerScan serves a single FMI's market-wide view, the Workbench serves every participant's institutional view. The operational need is the same; the deployment model is open-source shared infrastructure rather than a proprietary platform.

**No direct overlap with any current proposal.** The active proposals cover BFT protocol upgrades (Digital Asset), formal verification tooling (Informal Systems, Quantstamp), identity and party resolution (Freename AG), a C# SDK (Peaceful Studio), a visual contract builder (Canton Flow), a gamification SDK (Tap Ants), an AI agent layer (Chris Huang), indexers targeting developer/API consumers (Zpoken, illegalcall), and a node management console (Noders). None address the institutional operations user. None combine a PQS decoder library with a compliance-grade UI.

**Complementary to the indexer proposals.** The Zpoken and illegalcall indexers are backend infrastructure for developers — they surface raw event data via REST/GraphQL. The Workbench is a UI layer for non-technical institutional staff. Different layers of the stack, different users. If the committee funds both, they compose naturally.

**Complementary to Digital Asset's PQS open-sourcing (PR #67).** The Workbench assumes PQS is available and focuses entirely on the application layer above it. If PQS open-sourcing accelerates PQS adoption across participants, the Workbench's addressable deployment base grows.

**Addresses the user population that determines whether institutions expand their Canton footprint.** Every other proposal targets developers, validators, or protocol operators. The compliance officer generating a regulatory report, the operations lead monitoring settlement exposure, the auditor reviewing counterparty positions — these are the people whose friction determines whether an institution goes from pilot participant to production deployment. Canton's own reports name their needs. No other proposal serves them.
