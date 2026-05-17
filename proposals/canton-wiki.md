## Development Fund Proposal: Canton Wiki

- **Proposal Title:** Canton Wiki: A Neutral, Multilingual, Onchain-Verifiable Knowledge Layer for the Canton Network
- **Author:** Autonomous Finance / Canton Wiki Team
- **Status:** Draft
- **Created:** 2026-05-14
- **Label:** dapp-integration
- **Related SIGs:** daml-tooling, canton-apis, node-deployment-operations, financial-workflows-composability, regulatory-compliance
- **Champion:** Need Champion
- **Website:** https://canton.wiki

---

## Requested Funding

- **Core Grant:** 1,500,000 CC for a six-month buildout
- **Optional Maintenance Extension:** 400,000 CC for twelve months of post-grant operations

The core grant funds the buildout of Canton Wiki as public knowledge infrastructure. The optional maintenance extension covers editorial operations, translation maintenance, data quality, API support, verifier maintenance, security upkeep, and public transparency reporting. The extension is separable from the core buildout so the Committee can evaluate delivery of the primary milestones before committing to long-term operational support.

---

## Executive Summary

Canton Wiki is institutional-grade public knowledge infrastructure for the Canton Network. Its mission is to provide a neutral, source-backed, multilingual, machine-readable, and onchain-verifiable reference layer that can scale with the ecosystem.

Canton coordinates composable workflows across segregated privacy domains. Because the network supports complex, high-stakes operations, from institutional application logic to validator and Super Validator operations, its public knowledge layer should match the rigor of the protocol around it. Developers, operators, institutions, and downstream tools need a reference layer that is auditable, structured, and reusable.

Today, Canton ecosystem information is fragmented across GitHub repositories, project websites, explorers, dashboards, governance proposals, Discord channels, social posts, and AI-generated summaries. This creates friction: developers face steeper onboarding, institutions struggle to verify current public claims, and AI systems can repeat outdated or incomplete information. Projects can be discovered through visibility rather than verifiable accuracy.

Canton Wiki removes this friction by turning an already active public site into a structured knowledge layer. The buildout will deliver a canonical ecosystem registry, source manifests, editorial review states, project attestations, onchain provenance tooling, a multilingual Canton Academy, and robust API/export surfaces.

Canton Wiki is not a speculative engagement product, portfolio tracker, or sponsored marketplace. It is a public good: the knowledge layer that helps the ecosystem present itself accurately and lets builders reuse verified metadata with confidence.

---

## Current Baseline: Proven Traction

Canton Wiki is already live at [canton.wiki](https://canton.wiki). Current public surfaces include ecosystem mapping, learning resources, project discovery, comparison pages, network data, reward data, project submissions, search, and an initial [llms.txt](https://canton.wiki/llms.txt) file for AI ingestion.

At the time of drafting, the platform has:

- [Ecosystem Map](https://canton.wiki/ecosystem-map): 150+ projects indexed across 17 categories
- [Learn](https://canton.wiki/learn): 67 learning guides published

This proposal does not fund an idea from scratch. It funds the next step for an active platform: moving Canton Wiki into maintained ecosystem infrastructure with transparent source records, stable entity IDs, public data exports, multilingual education, and Canton-native provenance tooling.

---

## Problem Statement: The Need for Ecosystem Memory

To reach global scale, the Canton ecosystem needs a shared reference layer that is neutral, source-backed, reusable, and auditable. A standard website or traditional wiki is not enough for a rapidly maturing financial network. Ecosystem knowledge changes quickly; without explicit review and provenance, pages go stale, translations drift from source text, project claims become difficult to verify, and AI agents scrape and propagate information without the necessary source context.

Canton Wiki makes verification explicit. For critical ecosystem records, the infrastructure will answer:

- What sources back this claim?
- When was it last reviewed?
- Has the project attested to its factual metadata?
- Is a correction or dispute open?
- Is the page revision or source manifest verifiable onchain?

This is the move from a content repository to ecosystem memory. Canton Wiki will preserve and expose the metadata required for developers, institutions, researchers, projects, and downstream AI tools to know what is known, where it came from, and how it has changed.

---

## Specification

### 1. Objective

Build Canton Wiki into a neutral, multilingual, onchain-verifiable knowledge infrastructure layer for Canton.

The funded buildout will deliver:

- canonical public registry of Canton ecosystem entities
- source-backed profiles for projects, validators, organizations, applications, wallets, infrastructure, and concepts
- claim graph for important factual statements and supporting sources
- editorial review, project attestation, correction, and dispute workflows
- Daml provenance templates and onchain anchoring for selected hashes and metadata
- multilingual Canton Academy with translation memory and staleness tracking
- public APIs, JSON exports, structured data, sitemaps, RSS/change feeds, and `llms.txt`
- Canton Answer Benchmark for search and LLM retrieval quality
- integration documentation for CCTools, explorers, wallets, bots, dashboards, and developer portals

### 2. Explicitly Out of Scope

Canton Wiki is not a portfolio tracker, rewards calculator, upvote directory, sponsored listing marketplace, or private marketing site.

Out of scope:

- portfolio tracking, user P&L, rewards calculators, and earn campaign aggregation
- sponsored placement, paid ranking, upvote rankings, XP systems, leaderboards, or learn-to-earn rewards
- DeFi TVL dashboards as a core deliverable
- tokenized incentives for content creation
- financial advice or private proprietary data products

Project facts can be attested, corrected, sourced, and disputed. They cannot be bought.

### 3. Relationship to CCTools

Canton Wiki and CCTools should be complementary.

- CCTools is useful for activity, dashboards, rewards, governance exploration, and ecosystem engagement.
- Canton Wiki is useful for learning, verification, citation, translation, correction, and reuse of source-backed ecosystem information.
- CCTools is centered on metrics, activity, rewards, dashboards, and engagement.
- Canton Wiki is centered on claims, sources, revisions, attestations, translations, and review status.

In short: CCTools shows what is active; Canton Wiki proves what is known.

### 4. Implementation Mechanics

**Canonical Ecosystem Registry**

- stable entity records for projects, validators, Super Validators, applications, wallets, explorers, DeFi protocols, tokenized asset platforms, custody providers, developer tools, standards, CIPs, governance proposals, organizations, Daml libraries, academy modules, and glossary terms
- persistent IDs such as `cw:project:cantonscan`, `cw:concept:global-synchronizer`, and `cw:academy:daml-introduction`
- profile metadata: official links, source manifest, review status, attestation status, last reviewed date, related entities, correction link, machine-readable metadata, and optional onchain verification record

**Claim Graph and Source Manifests**

- structured claims such as "Project X is a Canton wallet", "Organization Y operates validator Z", or "Translation C is based on English revision D"
- claim metadata: sources, source type, last checked date, review status, confidence or dispute status, and optional onchain proof
- source manifests for canonical pages and academy modules covering official docs, repositories, project sites, governance proposals, explorer data, public APIs, archived pages, and relevant third-party data

**Editorial Review and Project Attestation**

- visible review states: Draft, Source-backed, Editor-reviewed, Technical-reviewed, Project-attested, Translation-reviewed, Onchain-verified, Disputed, Historical
- project attestations limited to factual metadata such as official name, website, GitHub, docs, contact channels, category, status, public validator identity, supported integrations, and organization data
- no project control over editorial notes, historical context, dispute records, source quality labels, page placement, search placement, or academy references

**Onchain Provenance**

- hashes and metadata anchored on Canton instead of full articles stored onchain
- proposed Daml templates: `WikiPage`, `WikiRevision`, `SourceManifest`, `KnowledgeClaim`, `ProjectProfile`, `ProjectAttestation`, `EditorialReview`, `TranslationRevision`, `CorrectionCase`, `AcademyModule`, `AcademyCompletion`, `PublicExportSnapshot`
- public verifier for page hashes, source manifest hashes, translation source revisions, project attestation status, correction status, and export snapshots

**Multilingual Canton Academy**

- learning tracks for Canton fundamentals, Daml development, validators and operations, Canton Coin economics, tokenized assets, privacy/compliance, wallets, and contributor onboarding
- initial languages: English, German, French, Spanish, Portuguese, Japanese, Korean, Chinese
- translation lineage showing canonical source page, source revision, reviewer, last reviewed date, current/stale status, machine-translation disclosure where applicable, and human review status
- translation memory and staleness alerts when canonical pages change

**Search, AI Discovery, and Public Data**

- canonical URLs, structured data, XML sitemaps, `hreflang`, `llms.txt`, JSON knowledge graph exports, machine-readable page summaries, source-backed FAQs, glossary definitions, RSS/change feeds, correction feeds, and API exports
- Canton Answer Benchmark for questions such as "What is Canton Network?", "What is the Global Synchronizer?", "What is Daml?", "What is Canton Coin?", "What is a Canton validator?", and "How can a developer start building?"
- benchmark entries include canonical short/long answers, source manifests, supported languages, related academy lessons, related entity IDs, and retrieval status

### 5. Technical Approach

- **Content and data layer:** Markdown/MDX content, entity records, claim records, source manifests, translations, review metadata, academy modules, glossary records, API schemas, export snapshots
- **Editorial layer:** submissions, reviewer assignment, source validation, project attestation, translation review, correction handling, dispute states, public changelog, visible review status
- **Onchain layer:** Daml-based anchoring for revisions, source manifests, attestations, reviews, translation lineage, correction records, academy records where appropriate, and export snapshots
- **Machine-readable layer:** JSON-LD, XML sitemaps, `hreflang`, `llms.txt`, RSS feeds, public JSON exports, REST API, OpenAPI docs, knowledge graph snapshots, monthly reports

No backward compatibility impact. Canton Wiki is an external public knowledge layer and does not require protocol changes.

---

## Milestones and Deliverables

### Milestone 1: Governance, Neutrality, and Canonical Schema

- **Estimated Delivery:** Month 1
- **Funding:** 200,000 CC
- **Focus:** governance documents, neutrality policy, editorial workflow, schema foundation
- **Deliverables / Value Metrics:**
  - Neutrality Charter, No Paid Ranking Policy, No Paid Editorial Control Policy, Conflict of Interest Policy
  - Editorial Review Handbook, Project Attestation Policy, Correction and Dispute Policy, Translation Review Policy
  - open content and open data licenses
  - canonical entity schema, claim graph schema, source manifest schema
  - public contribution workflow and issue tracker
- **Acceptance Criteria:**
  - governance documents and schemas published
  - No Paid Ranking Policy visible on Canton Wiki
  - correction workflow live
  - 25 existing pages migrated into review status system
  - 5 reviewers/contributors onboarded with declared roles
  - 3 project profiles processed through attestation workflow

### Milestone 2: Canonical Registry, Claim Graph, and Source Manifests

- **Estimated Delivery:** Months 1 to 2
- **Funding:** 325,000 CC
- **Focus:** registry, entity IDs, claim graph, source manifests, API foundation
- **Deliverables / Value Metrics:**
  - canonical entity registry and persistent Canton Wiki IDs
  - claim graph data model and source manifest generator
  - public project profile, glossary, and academy metadata formats
  - entity pages with visible review states
  - source-backed project profiles
  - public JSON export and OpenAPI documentation
- **Acceptance Criteria:**
  - 250 canonical entity records live
  - 100 glossary or concept records live
  - 150 source manifests created
  - 50 project profiles marked Source-backed
  - 15 project profiles marked Project-attested
  - public JSON export and API docs live
  - canonical profiles show source status, last reviewed date, and correction link

### Milestone 3: Onchain Provenance and Public Verifier

- **Estimated Delivery:** Months 2 to 4
- **Funding:** 350,000 CC
- **Focus:** Daml provenance templates, hash anchoring, attestations, verifier API/UI
- **Deliverables / Value Metrics:**
  - Daml templates for wiki pages, revisions, source manifests, knowledge claims, project attestations, editorial reviews, translation revisions, correction cases, and export snapshots
  - public verification page and verification API
  - developer/auditor documentation
  - open-source verification tooling
- **Acceptance Criteria:**
  - 200 canonical revisions anchored
  - 100 source manifests anchored
  - 25 project attestations anchored
  - 50 translation revision records anchored
  - verifier checks page hash, source manifest hash, and attestation status
  - Daml templates published in open repository
  - one independent developer/reviewer reproduces verification from docs
  - onchain-verified pages show verification panels

### Milestone 4: Multilingual Canton Academy and Translation Memory

- **Estimated Delivery:** Months 3 to 5
- **Funding:** 425,000 CC
- **Focus:** academy tracks, translation system, review workflow, multilingual discoverability
- **Deliverables / Value Metrics:**
  - Canton Academy v1 with 8 structured tracks
  - lessons with prerequisites, summaries, quizzes, glossary links, and source manifests
  - translation memory, staleness alerts, reviewer workflows, language-specific URLs, `hreflang`, multilingual sitemaps, translation status badges
  - optional onchain-verifiable academy completion records
- **Acceptance Criteria:**
  - 80 academy lessons live
  - 120 translated pages live
  - 40 high-priority pages translated into at least 3 non-English languages
  - translated pages link to canonical source revisions and display Current/Stale/Review Needed status
  - 10 translation reviewers/contributors onboarded
  - `hreflang` and multilingual sitemaps live
  - 250 academy completions or quiz completions recorded
  - 25 academy pages marked Source-backed and Editor-reviewed

### Milestone 5: Search, AI Discovery, and Ecosystem Integrations

- **Estimated Delivery:** Months 5 to 6
- **Funding:** 200,000 CC
- **Focus:** machine-readable exports, structured data, answer benchmark, integrations
- **Deliverables / Value Metrics:**
  - `llms.txt` v2 and public Canton Knowledge Graph export
  - machine-readable page summaries
  - structured data for articles, organizations, software projects, courses, glossary entries, FAQs, and datasets
  - XML sitemaps, RSS feeds, Canton Answer Benchmark, visibility report
  - integration documentation for CCTools, explorers, wallets, bots, dashboards
  - at least 3 external integration pilots
- **Acceptance Criteria:**
  - 500 canonical pages, entity records, claims, or profiles included in exports
  - structured data implemented for supported page types
  - `llms.txt` updated automatically from canonical records
  - Canton Answer Benchmark includes 100 questions
  - 3 third-party projects/tools consume Canton Wiki data, API, feeds, or exports
  - one integration path documented for CCTools
  - monthly report covers indexability, crawl issues, structured data errors, translation coverage, correction volume, benchmark status
  - 95 percent of canonical public pages indexable unless intentionally blocked

---

## Acceptance Criteria

Project-wide acceptance conditions:

- no paid ranking and no paid editorial control
- open schemas, open data exports, and open-source provenance templates
- public correction workflow
- visible review status and source manifests on canonical pages
- onchain verification for canonical revisions
- translation lineage for multilingual pages
- public API and knowledge graph exports
- at least 25 project attestations
- at least 3 third-party integrations
- at least 80 academy lessons
- at least 120 translated pages
- at least 500 canonical pages, profiles, claims, or entity records
- public monthly transparency reporting
- clear separation between project-attested facts and editorially reviewed context

---

## Funding

**Total Funding Request:** 1,500,000 CC over six months

- Milestone 1 - Governance, Neutrality, and Canonical Schema: 200,000 CC
- Milestone 2 - Registry, Claim Graph, and Source Manifests: 325,000 CC
- Milestone 3 - Onchain Provenance and Public Verifier: 350,000 CC
- Milestone 4 - Multilingual Academy and Translation Memory: 425,000 CC
- Milestone 5 - Search, AI Discovery, and Integrations: 200,000 CC

**Optional maintenance extension:** 400,000 CC for twelve months of editorial, translation, data, API, verifier, security, and reporting maintenance.

If the timeline extends due to Committee-requested scope changes or dependencies outside the team's control, remaining milestones should be renegotiated for material CC/USD volatility.

### Funding Rationale

The request is larger than a normal content grant because the deliverable is not only writing pages. The funded work combines product engineering, data modeling, editorial operations, translation systems, Daml provenance templates, public verifier tooling, API/export infrastructure, search/AI discovery surfaces, and ecosystem integration support.

The milestones are structured so the Committee can evaluate value incrementally:

- Milestone 1 proves governance, neutrality, and schema discipline before broad content migration.
- Milestone 2 proves the registry, source manifests, and API/export foundation.
- Milestone 3 proves the Canton-native provenance layer and public verification path.
- Milestone 4 proves multilingual education and translation maintenance.
- Milestone 5 proves downstream reuse through exports, structured data, answer benchmarks, and integrations.

The optional maintenance extension is separated from the buildout to avoid bundling long-term operations into the initial acceptance decision.

---

## Backward Compatibility and Dependencies

No backward compatibility impact. Canton Wiki is an external public knowledge layer and does not require changes to Canton protocol behavior, validator internals, existing Daml applications, or existing ecosystem tools.

The onchain provenance layer anchors hashes and metadata rather than full article bodies. If committee feedback changes the preferred anchoring pattern, the offchain source manifests, entity registry, review states, translations, and public exports remain useful and deliverable.

The proposal does not assume Foundation ownership of Canton Wiki, CCTools integration, or mandatory adoption by any specific ecosystem project. Third-party integrations and project attestations are adoption targets, not hidden dependencies for the core registry, source manifest, academy, and verifier deliverables.

---

## Adoption and Distribution

Canton Wiki adoption will be driven through:

- project attestation campaign targeting 25 attested profiles by grant completion, 50 within six months after completion, and 100 within twelve months if maintenance is funded
- ecosystem integrations with CCTools, explorers, wallets, developer portals, community bots, research dashboards, and educational resources
- Canton Academy onboarding for users, developers, validators, institutions, analysts, translators, and contributors
- search and AI discovery through structured, source-backed, multilingual, machine-readable information
- monthly transparency reports covering pages, corrections, disputes, attestations, translation status, API usage, verifier usage, search visibility, and academy completions

---

## Sustainability

Canton Wiki should not monetize through paid rankings or paid editorial placement. The trust model depends on refusing that.

Long-term sustainability will combine:

- Development Fund support for public-good infrastructure
- open-source contributor participation
- community editorial and translation programs
- optional donations with no editorial rights
- institutional sponsorships under strict neutrality rules
- service contracts for custom research or integrations that do not affect canonical pages
- future maintenance grants for open data, translation, and verification infrastructure

The governing principle is simple: money can support the infrastructure, but money cannot buy the record.

---

## Risks and Mitigations

- **Perceived duplication with CCTools:** keep the scope boundary explicit; CCTools can consume Canton Wiki metadata.
- **Editorial neutrality questioned:** publish neutrality, conflict, correction, review, and attestation policies; separate project-attested facts from editorial context.
- **Translation quality inconsistent:** use translation memory, source revision tracking, stale translation alerts, reviewer attribution, and status badges.
- **Onchain storage inefficient:** store full articles offchain and anchor only hashes, metadata, manifests, attestations, lineage, correction records, and export snapshots.
- **Search and AI claims become speculative:** avoid ranking promises; measure crawlability, indexability, structured data validation, `llms.txt`, public exports, answer benchmark quality, and external integrations.
- **Contributor submissions lower quality:** route submissions through visible review states: Draft, Source-backed, Editor-reviewed, Technical-reviewed, Project-attested, Translation-reviewed, Onchain-verified, Disputed, Historical.
- **Scope too large for six months:** sequence milestones independently and reserve ongoing operations for optional maintenance extension.

---

## Team and Relevant Track Record

Autonomous Finance has direct experience building ecosystem-facing products, high-value infrastructure, developer tooling, and education for a new decentralized compute environment.

Public Autonomous Finance work in the AO ecosystem includes [AO Link](https://www.ao.link/), Botega, Dexi, CoinMaker, and DataOS, as listed in the [Autonomous Finance product overview](https://www.autonomous.finance/products). The team also built AO bridge infrastructure that secured over $800M at peak according to internal/onchain metrics, and built [Permaindex](https://docs.autonomous.finance/core-financial-infrastructure/permanent-index-pi), an autonomous yield-delegation, index, and launch-support system for AO.

The relevant experience is the team's repeated work turning unfamiliar infrastructure into usable developer surfaces: AO Link for inspecting process and message state, deployment and testing workflows for AO applications, reusable primitives for common app authority patterns, and educational material that explains agents, data-driven finance, and AO's execution model to new builders.

This track record is relevant because Canton Wiki is not only a website. It is an ecosystem knowledge operation: translating protocol-specific concepts into usable references, maintaining project and tooling data, building public discovery surfaces, and producing durable educational material for a developer ecosystem.

---

## Rationale

Canton Wiki is a strong Development Fund candidate because it creates shared infrastructure around the network's public understanding. It helps developers learn faster, helps projects represent themselves accurately, helps institutions evaluate the ecosystem, helps validators and operators find reliable references, helps translators expand access without breaking accuracy, helps search engines and LLMs retrieve better Canton information, helps community tools avoid duplicating stale project data, and helps the network preserve its public memory.

This is not a request to fund a content site. It is a request to fund the knowledge infrastructure around Canton.

---

## Co-Marketing

Upon release, Autonomous Finance will collaborate with the Canton Foundation on:

- announcement coordination for milestone releases
- public notes explaining the Canton Wiki knowledge model and source policy
- monthly ecosystem report distribution
- developer content explaining how to consume API, exports, and AI-readable corpus
- educational content for new Canton users and builders

---

## External References

- [Canton Wiki](https://canton.wiki)
- [Canton Wiki Ecosystem Map](https://canton.wiki/ecosystem-map)
- [Canton Wiki Learn](https://canton.wiki/learn)
- [Canton Wiki llms.txt](https://canton.wiki/llms.txt)
- [Google Search Central: Intro to Structured Data](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data)
- [Google Search Central: Localized Versions](https://developers.google.com/search/docs/advanced/crawling/localized-versions)
- [Google Search Central: Managing Multi-Regional and Multilingual Sites](https://developers.google.com/search/docs/advanced/crawling/managing-multi-regional-sites)
- [Autonomous Finance Products](https://www.autonomous.finance/products)
- [Permaindex](https://docs.autonomous.finance/core-financial-infrastructure/permanent-index-pi)
