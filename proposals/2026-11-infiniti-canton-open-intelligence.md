# Development Fund Proposal: Canton Open Intelligence — Open Ecosystem Data API, Developer SDK & Public Intelligence Infrastructure

**Organization:** Infiniti Markets LLC (operator and publisher of Canton Signals)  
**Author / Primary Contact:** Bryan Feinberg, authorized signatory, Infiniti Markets LLC — zephyr@w3ai.io  
**Status:** Draft  
**Created:** 2026-11-23  
**Proposal Type:** Individual Initiative  
**RFP / Roadmap Area:** N/A — complementary to the roadmap's developer tooling, indexing and observability priorities, but **not** a proposal to implement the Canton Ledger API or network indexer RFP  
**Champion:** Needs Champion — formal Tech & Ops Committee sponsorship to be confirmed  
**Total Funding Request:** **2,400,000 CC**  
**Project Duration:** **90 calendar days from written authorization / start notice**  
**Label:** `canton-apis` (provisional; validate classification with SIG, as the proposal exposes *ecosystem intelligence* rather than the Canton protocol's Ledger/Admin/SQL APIs)  
**Reference Implementation:** https://canton.w3ai.io  
**Public Teaser / Walkthrough URLs:** https://canton.w3ai.io/video (60-second teaser) and https://canton.w3ai.io/deepdive (full walkthrough)  
**Public API Documentation:** https://canton.w3ai.io/api-docs  
**Proposed Open-Source License:** Apache-2.0 for grant-funded software; CC BY 4.0 or equivalent for original shareable documentation/metadata where legally permissible, with third-party rights separately preserved.

---

## Abstract

The Canton ecosystem is difficult to discover and evaluate from a single reliable, reusable source. Project identities, developer activity, documentation, launches, and governance notices are distributed across websites, repositories and publications, with inconsistent identifiers, update frequencies and provenance. Teams building directories, wallets, research tools and institutional onboarding experiences repeatedly reconstruct that public information.

**Canton Open Intelligence** will expose a **privacy-preserving, source-attributed public ecosystem dataset** through a versioned read-only API, an open-source TypeScript client, documented schemas, and reusable integrations. The existing Canton Signals terminal will act as a reference implementation and publicly accessible discovery interface, **not the sole beneficiary of the grant**. Grant outputs will be available to other builders independently of Infiniti's proprietary services. The 90-day grant will produce measurable third-party use, public operational metrics, repeatable data exports, and a documented maintenance and handover plan.

The requested **2,400,000 CC** is divided into **three 800,000 CC acceptance-based milestones**. No closed-source commercial features, sponsored ranking, trading services, token issuance, or general corporate overhead are proposed as grant-funded deliverables.

**Existing product demonstration:** The [60-second teaser](https://canton.w3ai.io/video) and the [full deep-dive walkthrough](https://canton.w3ai.io/deepdive) give reviewers an introduction to the public-facing reference interface, and the [published API documentation](https://canton.w3ai.io/api-docs) shows the shape of the interface this grant would open up. It is evidence of the existing presentation and product direction, not proof that the proposed grant-funded open API, SDK, dataset export or third-party adoption milestones have already been delivered.

---

## Specification

### 1. Objective

**Single objective:** Establish and demonstrate adoption of a reusable, publicly accessible, provenance-aware **off-chain ecosystem intelligence API and developer toolkit** for Canton projects and ecosystem information, using the existing Canton Signals data work as a foundation.

A developer should be able to resolve a Canton ecosystem project's canonical identity, retrieve its public links and tagged sources, inspect time-bounded public repository/activity metadata, and embed or query the results with documented, stable interfaces rather than building a bespoke crawler.

**Within scope:** public ecosystem project directory; canonical project identifiers and deduplication; source attribution, licensing flags and last-checked times; public repository/activity summaries; API/SDK/docs; sample integrations; governance/privacy-safe source handling; independently measurable use; a demonstration interface, observability, and a limited funded transition to documented maintenance.

**Outside scope:** changes to the Canton protocol, synchronizers, validators, Ledger API or confidential transactions; collection of non-public ledger data; promises of complete network activity; automated investment advice; paid research subscriptions; CIPX index-token issuance; proprietary trading features; a new full-featured rewards marketplace; broad product expansion unrelated to the shared data layer. Optional terminal-only presentation improvements will be self-funded unless they directly demonstrate the grant-funded API.

### 2. Implementation Mechanics

#### A. Data ingestion, canonicalization and provenance

1. **Approved public sources:** Registry/listings, published project sites, public code hosting, official release notes, governance material, and public event notices; source connectors must comply with access terms and available licenses.
2. **Canonical entity model:** stable `project_id`; name, aliases, description, category, publicly documented links, source IDs, timestamps, verification status, data license, and optional publicly asserted relationships. Names and aliases are **not** proof of an entity's on-chain party identity.
3. **Controlled ingest:** change detection, incremental queues, retry/backoff, duplicate detection, correction history, and source-specific freshness indicators.
4. **Evidence provenance:** record-level links, `observed_at`, `last_verified_at`, type of evidence, and clear status values (e.g. verified source / source-reported / inferred / unverified). Never describe inference as independently verified fact.
5. **Quality and rights:** machine-readable data quality reports, removal/correction requests, attribution, permissions checks and suppression of personal or confidential information. Preserve source copyrights and applicable API terms.
6. **No universal activity inference:** GitHub counts and public commits are indicators of visible development activity, not proof of Canton deployment, financial transactions, validator status or confidential on-chain events.

#### B. Versioned public API

Read-only HTTPS JSON API with an OpenAPI 3.1 specification, predictable pagination, filtering, request quotas, typed errors and stable identifiers. The current public API documentation is at https://canton.w3ai.io/api-docs; the grant-funded work versions, documents and opens that surface rather than starting from nothing. Illustrative paths (final names to be documented before Milestone 1 acceptance):

```
GET /v1/projects?category=...
GET /v1/projects/{project_id}
GET /v1/projects/{project_id}/sources
GET /v1/projects/{project_id}/repos
GET /v1/projects/{project_id}/activity?period=30d
GET /v1/changes?since=...
GET /v1/health
GET /v1/datasets/metadata
```

Initial public read access will not require a login, subject to published fair-use limits and abuse controls. Include response caching, ETags where appropriate, explicit null/missing-value semantics, schema versioning and a deprecation policy. Publish a bulk export of **redistributable** fields, allowing downstream researchers to reproduce basic ecosystem counts independently of hosted access.

No privileged connection to private Canton ledgers is requested. Any future consent-based private-data integration would require a separate security design and is not included in this grant.

#### C. Open-source SDK and reference integrations

Build and publish a TypeScript client with typed entities, pagination, retries, usage examples and automated compatibility tests. Provide at least two small, reusable reference experiences using the public API: (1) a project directory/search embed and (2) a public activity/source-attribution card. The Canton Signals interface is a reference consumer, not a dependency for other adopters. Publish examples showing integration in a third-party site or application.

#### D. Source-grounded intelligence

Expose structured provenance and public update/change feeds first. Any optional natural-language research example must return source identifiers, timestamps and explicit uncertainty, and must not be a gating dependency for the underlying API. An agent answering a question cannot be treated as an independently verified record. AI model outputs, prompts and inference costs will be separately metered and excluded from acceptance unless explicitly agreed in writing.

#### E. Operations and resilience

Deploy API monitoring, error budgets, availability checks, basic security controls, rate limiting, key rotation for upstream services, encrypted backups, restore rehearsals, operational runbooks, basic cost attribution and a publicly visible status/history page. Publish monthly cost and usage summaries to the Committee for funded infrastructure. A sustainable exit strategy must include public repository ownership/maintenance contacts, API stewardship, data-rights policy, and operational continuity options.

#### F. Security and privacy

The service **does not read confidential ledger data** and will not imply that private Canton transactions are publicly observable. All input is considered untrusted; enforce outbound-fetch controls, URL validation, secret handling, access segmentation, dependency scanning, and abuse protections. Third-party content and GitHub metadata are used only within applicable terms. Data owners may request corrections or removal where justified. Publish security contact and vulnerability-reporting process.

### 3. Architectural Alignment

Canton's architecture is built around privacy and selective disclosure. This proposal operates off-ledger, indexing **publicly authorized information about ecosystem organizations, projects and open-source development**. It avoids protocol-level metadata assumptions, cross-party disclosure, and attempts to infer confidential on-chain events. It supports developer discovery, reuse of public metadata and onboarding without changing any Daml package or Canton ledger component.

The grant complements, but does not replace, official Canton documentation, the Dev Hub, existing registries, native SDKs or network indexers. If a maintained canonical service already exposes a field, the project should integrate or cross-link it rather than compete with it. Before implementation, project sponsors will seek feedback from the relevant **Canton APIs, Identity & Metadata, and Daml / Developer Tooling SIGs**, and document overlaps, interfaces, and constraints.

**Relevant governance:** Development Fund CIP-0082 and CIP-0100 inform the funding process, not the API's technical behavior. No claim is made that the proposed public ecosystem API is a Canton Ledger API, an approved CIP, or endorsed by the Foundation.

### 4. Backward Compatibility

**No backward compatibility impact on the Canton protocol, Daml contracts, wallets or existing Canton APIs.** The new service will version its own API at `/v1/`, publish migration notes for incompatible changes, and avoid silently repurposing entity identifiers. The existing Canton Signals interface may continue independently, with new features consuming the grant-funded API.

---

## Milestones and Deliverables

**Start rule:** Day 0 is the written grant start authorization, not the PR submission date. Dates below are relative to Day 0 and should be converted into calendar dates after authorization.

### Milestone 1: Public Dataset, Provenance Standard and API Alpha

- **Committed Date:** Day 30
- **Focus:** Make a legally shareable, independently queryable baseline dataset available with reproducible source/provenance semantics.
- **Deliverables:** Published canonical schema and data dictionary; source register and rights policy; reproducible dataset export (rights-cleared fields); API `/v1/projects`, `/v1/projects/{id}`, and source endpoints; OpenAPI documentation; health/uptime dashboard; independently testable data-quality and completeness reports; two integration walkthroughs.
- **Value metrics / acceptance:** Third-party reviewers can query **at least 200 deduplicated, source-backed project records** through a public endpoint and independently reproduce published totals from the dataset export; at least **2 external teams** complete a documented API evaluation, evidenced by consented feedback or repository issues. The 200-record floor is conditional on confirming legal reuse rights and validated coverage; any gap is disclosed before approval, not hidden.
- **Payment:** **800,000 CC**, only after Committee acceptance.

### Milestone 2: TypeScript SDK and Independent Ecosystem Integrations

- **Committed Date:** Day 60
- **Focus:** Ensure third parties can use the API without special access to the Canton Signals site.
- **Deliverables:** Public Apache-2.0 SDK repository; package release; typed API client; end-to-end examples; two embeddable/reference components; public activity metadata where available and lawful; correction/change-log flow; developer guides and basic integration tests.
- **Value metrics / acceptance:** At least **5 independently controlled third-party projects or teams** demonstrate a real API or SDK use case (prototype, staging or production), evidenced by public links or consented integration demonstrations. Publish adoption methodology; usage by Infiniti-owned domains does not count toward the external-team target.
- **Payment:** **800,000 CC**, only after Committee acceptance.

### Milestone 3: Production Hardening, Measured Adoption and Handover

- **Committed Date:** Day 90
- **Focus:** Deliver a reliable public ecosystem utility with demonstrable recurring usage and a sustainable maintenance plan.
- **Deliverables:** Production API and versioned docs; public status/availability and freshness indicators; bulk export update mechanism; security and restore test summaries; 90-day cost and usage report; issue triage/maintenance policy; prioritized backlog agreed with SIG feedback; integration showcase; Foundation/Dev Hub-friendly technical materials and launch case study.
- **Value metrics / acceptance:** At least **10 distinct third-party teams** have used the service for an independently verifiable application, internal proof-of-concept or external research workflow; API achieves **at least 99.5% availability during the final 30-day measurement window**, excluding Committee-approved scheduled maintenance (measurement method and exclusions disclosed beforehand); publish a rolling freshness report and remediation for stale sources. Provide public or consented verification evidence without revealing private analytics or customer information.
- **Payment:** **800,000 CC**, only after final Committee acceptance.

**Metric integrity:** Targets above are proposed commitments, **not existing deployments**. To make adoption commitments credible, secure design-partner interest before final submission, document what counts as an independently controlled integration, and negotiate feasibility with the Committee. Acceptance is based on external utility, not simply on the existence of code artifacts.

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone
- Demonstrated functionality or operational readiness
- Documentation and knowledge transfer provided
- Alignment with stated value metrics

**Project-specific acceptance conditions.** In addition, the Technology & Operations Committee may independently verify:

1. **Open access:** documented, working read-only API without compulsory registration for baseline public use; clear quotas, licensing and service limits.
2. **Reproducibility:** published, rights-cleared dataset export, reproducible project counts, source attribution, timestamps and correction history.
3. **Reusable implementation:** Apache-2.0 SDK/source, integration samples and repeatable public tests; no required proprietary runtime/client SDK.
4. **Evidence of ecosystem benefit:** third-party integrations evaluated against a published counting standard, with independent links or consented proof; affiliated domains excluded.
5. **Privacy-safe design:** no unauthorized disclosure or presumed visibility into Canton private ledger events; responsible source access and data rights handling.
6. **Reliability and stewardship:** monitored service, incident response, backup recovery evidence, usage/cost summary and documented maintenance owner.
7. **Knowledge transfer:** public documentation and a demonstration available to Foundation reviewers and ecosystem developers.

Metrics are measured from the relevant go-live date. Known blockers, upstream licensing restrictions and external dependency failures will be reported transparently and reviewed for scope adjustments rather than being represented as satisfied commitments.

---

## Funding

**Total Funding Request: 2,400,000 CC.** CC-denominated grant; milestone releases only after formal acceptance.

### Payment Breakdown by Milestone

| Milestone | Target | Funding | Share |
|---|---:|---:|---:|
| M1 — Public Dataset and API Alpha | Day 30 | 800,000 CC | 33.333% |
| M2 — SDK and External Integrations | Day 60 | 800,000 CC | 33.333% |
| M3 — Hardening, Adoption and Handover | Day 90 | 800,000 CC | 33.333% |
| **Total** | **90 days** | **2,400,000 CC** | **100%** |

### Proposed Cost Allocation — to validate before Committee review

The grant is not a request for unrestricted company financing. Each workstream should be backed by named staffing, hourly rates, expected hours, cloud/vendor quotations, committed co-funding where relevant, and a CC/USD conversion assumption dated near the application. Suggested allocation framework:

| Workstream | Proposed allocation | Funding |
|---|---:|---:|
| Data engineering, canonicalization, provenance and connectors | 30% | 720,000 CC |
| API, SDK and reference integrations | 30% | 720,000 CC |
| Security, quality assurance and operational resilience | 15% | 360,000 CC |
| Infrastructure, ingestion and observability during grant | 10% | 240,000 CC |
| Developer documentation and third-party integration support | 10% | 240,000 CC |
| Risk reserve, subject to committee-approved use | 5% | 120,000 CC |
| **Total** | **100%** | **2,400,000 CC** |

These allocations are **planning estimates, not documented incurred costs**, and should be replaced or supported by a bottom-up budget. Avoid claiming 2.4 million CC represents a verified market-rate cost until the USD equivalent and rate assumptions are evidenced. Distinguish existing sunk costs and self-funded features from incremental grant expenses. Unspent reserve should not be treated as automatically earned.

### Volatility Stipulation

The project duration is **under six months**. Should Committee-requested scope changes extend delivery beyond six months from commencement, the parties will renegotiate outstanding milestones to address significant CC/USD price movements, consistent with the Foundation's template. No unilateral conversion or repricing is assumed.

---

## Co-Marketing

Upon release, the implementing entity will collaborate with the Foundation on:

- Announcement coordination
- Case study or technical blog
- Developer or ecosystem promotion

**Specific commitments.** Subject to Foundation coordination and approval, Infiniti Markets commits to:

- **Joint launch communication** identifying the open API, licensing, available code and how independent developers can participate, without implying Foundation endorsement before approval.
- **Technical implementation article** with architecture diagram, API examples, data-provenance approach, privacy boundaries and integration walkthroughs.
- **Dev Hub contribution or listing request** featuring SDK links, documentation, tested examples and maintainer contact, subject to the Dev Hub's own review.
- **Ecosystem distribution** using Canton Signals' public Signal Feed, documentation, community channels and project showcase to promote the open utility rather than paid products.
- **Public developer demonstration** and a 30-day post-release community feedback summary.

Performance will be assessed by attributable developer visits, external integration inquiries, qualified integrations and issue resolution rather than promotional impressions alone.

---

## Motivation

Canton's privacy-first design makes it especially important to distinguish **observable public ecosystem information** from confidential network activity. Developers seeking integration partners or understanding the available software ecosystem should not have to maintain independent scrapers for basic directory data. Institutions and analysts also need visible provenance, update dates, and clear distinctions between source-reported claims and verified facts.

The shared benefit arises when a project directory or public activity record can be queried and reused by any Canton-related application, independent researcher, wallet, explorer or community service. Rather than asserting that all Canton participants necessarily benefit, the proposal will target an initial cohort of **10 distinct third-party adopters within 90 days** and publish evidence of how their workflows improved. A defensible market-sizing denominator (relevant current applications/teams) will be added after a date-stamped registry audit, so no unverified percentage of total ecosystem adoption is claimed.

The grant's durable output is **a common, source-attributed public data interface and open client**, not exclusive traffic to canton.w3ai.io. Wider adoption should reduce duplicate integration work, improve discoverability and foster interoperability among public ecosystem services.

---

## Rationale

**Extend rather than replace.** The first implementation decision is to reuse existing official directory data, maintained APIs, and approved public source feeds where available. The funded work adds canonicalization, cross-source provenance, open developer access and a stable integration surface; it does not recreate official network infrastructure or claim ownership of third-party datasets.

**Why not a proprietary terminal-only enhancement?** A dedicated research website is useful but creates dependence on one publisher. A read-only public API, export and Apache-2.0 client allow independent builders to integrate or migrate and make value externally verifiable.

**Why not a ledger indexer?** Canton protects private contract and transaction data. This grant intentionally excludes privileged ledger indexing and focuses on legitimately public off-chain information. That narrows the data rights, security and protocol-risk burden and makes a credible 90-day delivery possible.

**Why now?** An existing public reference interface and data-collection groundwork reduce initial build time, but current coverage and metrics still need auditable evidence. The API-first approach transforms that work into reusable public infrastructure. The implementation should include overlap checks against existing Foundation-funded and commercial tools to prevent duplicate development.

**Future stewardship:** Infiniti will identify code maintainers and an incident owner, publish issue handling and deprecation rules, and present a 12-month operating plan. Continued hosted service beyond the grant is **not** implicitly guaranteed by this 90-day award; any ongoing subsidy, SLA or multi-year support arrangement requires separate approval and budget.

---

## Supporting Materials

Linked rather than embedded, so this pull request stays reviewable as text. All seven resolve without a login.

| Material | Link | What it shows |
|---|---|---|
| Reference implementation | https://canton.w3ai.io | The live Canton Signals terminal this proposal builds its open API from. |
| Teaser (60s) | https://canton.w3ai.io/video | One-minute introduction to the reference interface. |
| Deep-dive walkthrough (4m 16s) | https://canton.w3ai.io/deepdive | Longer guided tour of the terminal, its sources and its surfaces. |
| API documentation | https://canton.w3ai.io/api-docs | The existing public API surface this proposal would version, document and open. |
| Ecosystem overview infographic | https://canton.w3ai.io/canton/img/canton-signals-overview.jpeg | Single-page picture of the sources, pipeline and surfaces described in Implementation Mechanics. |
| Canton Index Protocol whitepaper | https://canton.w3ai.io/app/whitepapers/canton-index-protocol | Background on Infiniti's prior public research work on Canton. |
| Canton Signals deck | https://canton.w3ai.io/app/deck | Interactive deck: why Canton matters, the Map, Pulse and Intel surfaces, the Canton Index, and the community grant. |

**Scope note.** The whitepaper sets out the CIPX index-token research published separately by Infiniti Markets, and the deck includes a section on the Canton Index. Both are supplied as evidence of prior public work on Canton ecosystem data only. **No part of the CIPX index, token issuance or trading economics is proposed for grant funding** — see the *Outside scope* list in Objective. Where the deck's framing differs from this document, this document governs.

---

## Supporting Evidence and Pre-Submission Diligence

The following must be attached or completed before making quantitative, adoption or budget claims to reviewers:

- **Coverage reconciliation:** date-stamped export defining what counts as a registry project, how many are deduplicated, which links/repositories are actually Canton-related, and source rights. The currently published 764-project headline and an on-page description of “close to 400” projects should be reconciled before quotation. The previous draft said 765.
- **Repository metric audit:** methodology for the displayed 16k+ tracked repositories; distinguish discovered, indexed, active and relevant repositories, with false-positive checks.
- **Source and agent audit:** confirm 400+ verified sources and 300+ agents are operationally meaningful, and define verification and agent categories.
- **Existing system demonstration:** accessible screenshots or recorded walkthrough, data-refresh logs, example sourced records and source correction logs, with zero implication of prior Foundation approval. **Teaser URLs for reviewers:** https://canton.w3ai.io/video (60s) and https://canton.w3ai.io/deepdive (full walkthrough) — both confirmed playable to an anonymous visitor on 2026-11-25; note that neither is muted, so most browsers will require one click on play.
- **Baseline analytics:** anonymized API/website traffic, uptime, query latency, coverage and current third-party integrations, clearly separated from targets.
- **Adoption validation:** written expressions of interest or scoped integrations from at least 3–5 unaffiliated Canton teams, with permissions to disclose the evidence.
- **Bottom-up budget:** named roles, rates, hours, infrastructure bills/quotes, allocation of existing vs incremental costs, FX assumptions and funding runway.
- **Open-source/IP plan:** title and license of code to be open-sourced, confirmation that Infiniti has the rights to license it, third-party code and content review, and public repo link.
- **Governance:** contact an appropriate SIG, record feedback, and secure a formal Champion. SIG membership or feedback by itself is not Champion authorization.
- **Classification review:** verify whether an individual initiative is the best path; do not represent an off-chain ecosystem metadata SDK as a Canton Ledger API SDK to force RFP alignment.
- **Actual start date:** replace Day 0 relative milestones with calendar dates only after grant commencement is agreed.

### Useful references

- Grant proposal template: https://github.com/canton-foundation/canton-dev-fund/blob/main/proposals/_template.md
- Submission PR template: https://github.com/canton-foundation/canton-dev-fund/blob/main/.github/pull_request_template.md
- Development Fund README: https://github.com/canton-foundation/canton-dev-fund/blob/main/README.md
- Roadmap: https://github.com/canton-foundation/canton-dev-fund/blob/main/2026-2028-strategic-roadmap.md
- SIG directory: https://github.com/canton-foundation/canton-dev-fund/blob/main/sig-directory.md
- Canton Signals reference interface: https://canton.w3ai.io
- Canton Signals public teaser (60s): https://canton.w3ai.io/video
- Canton Signals deep-dive walkthrough: https://canton.w3ai.io/deepdive
- Canton Signals public API documentation: https://canton.w3ai.io/api-docs
- Canton Signals deck: https://canton.w3ai.io/app/deck

