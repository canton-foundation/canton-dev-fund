## Development Fund Proposal: Canton Builder Navigator -- Ecosystem Discovery and AI-Assisted Tool Matching

**Author:** Deepthi
**Status:** Draft  
**Created:** 2026-03-14  

---

## Abstract

This proposal requests funding for an open-source **ecosystem discovery and onboarding layer** for Canton developer tooling, public-good projects, and reference implementations.

As the Canton ecosystem grows, the problem is no longer only “build more tools.” It is also “help new developers quickly find the right tools, understand how they help, and combine them into a working build path.” This proposal addresses that gap by creating a single place where useful proposals, repositories, SDKs, infra tools, and reference implementations can be discovered, searched, and explained. That makes onboarding easier and gives developers a clearer starting point when deciding what to use.

The proposed project, **Canton Builder Navigator**, will provide:

- a structured open catalog of ecosystem tools, reference implementations, and proposal-linked projects
- machine-readable project manifests
- searchable and filterable discovery UI
- AI-assisted intent matching for natural-language developer queries
- explainable recommendations showing **how each tool helps** and **where it fits**

The goal is not to build a marketplace or a generalized chatbot. The goal is to make Canton’s open-source tooling easier to discover, understand, and adopt.

The implementation is intentionally low-overhead: repository-backed manifests, generated search indexes, static hosting where possible, and AI used only as a narrow retrieval-and-explanation layer. That keeps the proposal cost-effective, testable, and community-maintainable after release.

---

## Specification

### 1. Objective

The objective is to reduce developer onboarding friction and improve the practical reuse and discoverability of Canton ecosystem tools.

The intended outcome is that a new developer can describe what they are trying to build, for example:

- “I need local auth and CI-friendly test tokens”
- “I’m building a wallet-enabled dapp”
- “I need help validating package rollout safety”

and the system will return:

- the most relevant Canton tools, repos, and proposal-linked projects
- why they match the stated need
- how they help in the development workflow
- what they do **not** solve
- links to source code, docs, and proposal context

This proposal treats ecosystem discovery as shared infrastructure for public-good tools, not as a commercial directory product.

### 2. Implementation Mechanics

The project will be delivered as:

- a project manifest schema
- a validated repository-backed catalog of tools and projects
- a searchable frontend and machine-readable export/API
- an AI-assisted recommendation layer built on top of the structured catalog

#### A. Structured Catalog

Each catalog entry will include machine-readable metadata such as:

- project name
- category
- problem solved
- who it helps
- lifecycle stage
- network / environment support
- open-source status
- funded / not funded
- maintained / inactive
- repo link
- access / download link
- docs link
- proposal link
- compatibility notes
- related tools

This structured catalog is the foundation of the project.

Entries will be stored in version-controlled manifests so the catalog can be reviewed, extended, and maintained through normal GitHub contribution workflows. Source links will always point developers back to the canonical repository, docs, and proposal pages rather than trying to replace them.

#### B. Deterministic Discovery Layer

The catalog UI and API will support:

- keyword search
- category filters
- lifecycle-stage filters
- funded/open-source/maintained badges
- starter-path and use-case views
- linked related-tool views
- “how this helps” summaries derived from structured metadata
- direct open/download access to repository and documentation links

This deterministic layer ensures the project remains useful even without the AI feature enabled.

#### C. AI-Assisted Recommendation Layer

The AI layer will sit **on top of** the structured catalog and will be intentionally narrow.

It will:

- interpret a developer’s natural-language intent
- map the request to structured categories and needs
- retrieve likely matching tools from the catalog
- generate explainable recommendations showing:
  - why a tool matches
  - how it helps
  - where it fits in the workflow
  - what it does not cover

As funded projects are approved and released, their proposal metadata, repository links, documentation links, and compatibility notes can be added to the catalog so new dapp teams can search by idea or workflow need rather than by project name alone.

The AI layer will not be positioned as a general Canton copilot or agent platform. It will rely on retrieved catalog data and source summaries, and it will clearly separate structured facts from generated guidance.

Tech stack:

Catalog + Discovery Core — Next.js + Tailwind, MeiliSearch with facets/typo-tolerance, GitHub auto-fetch script, 25+ entries
Recommendation + Workflows — Developer journeys, lifecycle views, related-tool graph, 20+ benchmark intents
AI-Assisted Search — Local embedding service, hybrid search (keyword + vector), explainable output, 80%+ benchmark pass rate

#### Explicitly Out of Scope

To keep the project realistic and reviewer-friendly, this proposal does **not** include:

- a commercial marketplace
- paid listings or ranking
- package hosting
- project hosting
- generalized chat assistant behavior
- grant decision support or proposal scoring
- continuous crawling of arbitrary GitHub repositories
- private/proprietary ecosystem indexing

#### Relationship to Existing Tooling

This proposal is intended to complement existing and future ecosystem tools, not compete with them:

- it does **not** replace the tools it catalogs
- it does **not** act as a wallet, SDK, or deployment platform
- it does **not** duplicate proposal hosting on GitHub
- it does **not** require maintainers to publish anywhere except the source repo and the catalog manifest
- it does provide a missing adoption and discovery layer for public-good outputs

### 3. Operational Model and Maintenance

The project is designed to be useful without becoming an operational burden.

- the catalog can be published as a static site with generated JSON indexes
- project entries can be contributed and updated through pull requests
- schema validation and link checks can run automatically in CI
- deterministic search remains available even if no AI provider is configured
- the ecosystem can continue maintaining entries after the initial release without needing a proprietary backend

This operating model is important to the proposal: the value should remain with the ecosystem even if active feature development slows after release.

### 4. Architectural Alignment

This proposal aligns with the Development Fund in a straightforward way:

- it increases the practical reuse of existing open-source outputs
- it improves onboarding for new developers
- it creates a shared catalog rather than a private directory
- it creates a reusable discovery layer that can highlight proposal-linked projects, funded releases when available, open-source tooling, and reference implementations in one place

This is a form of ecosystem infrastructure. It does not change Canton protocol behavior, but it can materially improve tool adoption and reduce duplicate effort.

### 5. Delivery Feasibility

This proposal is intentionally designed to be technically modest and easy to verify:

- it does not require protocol changes, validator changes, or network-side deployment
- it can be implemented with repository-backed manifests, generated indexes, and a lightweight web frontend
- it does not depend on continuous crawling, proprietary infrastructure, or custom data ingestion pipelines
- the deterministic catalog remains useful on its own, which means the project delivers value even before the AI layer is added

That makes the proposal a better fit for milestone-based funding: each step produces a usable public-good artifact that can be reviewed independently.

### 6. Risks and Mitigations

- **Stale catalog data:** manifests will be validated in CI, and entries will carry maintenance status plus canonical source links so users can verify the latest state quickly.
- **AI overreach or hallucination:** deterministic search remains the fallback, and AI output must be grounded in retrieved manifest data with facts and generated guidance clearly separated.
- **Scope creep toward marketplace or chatbot features:** those areas are explicitly out of scope, and milestone acceptance is tied to catalog quality, recommendation quality, and contribution workflows rather than platform expansion.

### 7. Backward Compatibility

No backward compatibility impact.

This is an external catalog and recommendation layer. Teams can adopt it incrementally.

---

## Milestones and Deliverables

### Milestone 1: Catalog Schema and Discovery Core

- **Estimated Delivery:** 4 weeks  
- **Focus:** Build the structured catalog foundation  
- **Deliverables / Value Metrics:**  
  - machine-readable manifest schema for ecosystem tools, proposal-linked projects, and reference implementations  
  - schema validation tooling and contribution guidelines  
  - initial catalog population with at least 25 entries across at least 5 categories  
  - deterministic search and filter UI  
  - direct repo/docs/proposal access from catalog entries  
  - machine-readable export/API for catalog data  

### Milestone 2: Recommendation and Workflow Layer

- **Estimated Delivery:** 4 weeks  
- **Focus:** Make the catalog useful for real onboarding flows  
- **Deliverables / Value Metrics:**  
  - starter-path views for common developer journeys  
  - lifecycle-stage and use-case views  
  - related-tool graph  
  - “how this helps” and “what this does not solve” summaries  
  - benchmark developer-intent set with at least 20 curated example queries for recommendation evaluation  
  - docs for adding and maintaining project manifests  

### Milestone 3: AI-Assisted Search and Public Release

- **Estimated Delivery:** 4 weeks  
- **Focus:** Add natural-language intent matching on top of the catalog  
- **Deliverables / Value Metrics:**  
  - AI-assisted search experience for free-text developer queries  
  - explainable recommendation output grounded in catalog data  
  - evaluation set demonstrating at least one relevant result in the top three recommendations for at least 80% of benchmark intents, based on manual review against the published benchmark set  
  - public release docs and walkthrough  
  - contribution guide for ecosystem maintainers  

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- a validated manifest schema for project entries
- at least 25 initial catalog entries across at least 5 categories
- deterministic search and filters working against the catalog
- each entry exposing the documented metadata fields
- each entry exposing direct repo/docs/proposal or access links where available
- the recommendation layer showing how a matched tool helps and where it fits
- AI-assisted search returning grounded recommendations for benchmark developer intents
- deterministic search remaining usable without an AI provider configured
- documentation and contribution guidance being complete
- the project being released as open source

Project-specific acceptance conditions:

- the project must remain a catalog and recommendation layer, not a commercial marketplace
- the AI layer must be grounded in structured catalog data
- recommendations must clearly distinguish between facts from metadata and generated guidance
- the catalog must continue pointing users back to canonical project sources rather than replacing them

---

## Funding

**Total Funding Request:** 280,000 CC + 13000 CC/ Month for Stewardship for initial 9 months

### Payment Breakdown by Milestone

- Milestone 1 _(Catalog Schema and Discovery Core)_: 100,000 CC upon committee acceptance  
- Milestone 2 _(Recommendation and Workflow Layer)_: 100,000 CC upon committee acceptance  
- Milestone 3 _(AI-Assisted Search and Public Release)_: 80,000 CC upon final release and acceptance  

### Volatility Stipulation

If the project duration extends beyond 6 months due to Committee-requested scope changes, remaining milestones should be renegotiated for material CC/USD volatility.

---

## Co-Marketing

Upon release, the implementing entity will collaborate with the Foundation on:

- announcement coordination
- a short technical write-up
- one ecosystem onboarding walkthrough or demo

Specific commitments:

- publish contribution instructions for ecosystem maintainers
- publish at least one new-developer onboarding example using the navigator

---

## Motivation

The Development Fund exists to create shared benefit for the Canton ecosystem. That benefit is strongest when useful tools and public-good outputs are easy to discover, understand, and adopt.

Right now, much of that discovery burden still falls on proposal browsing, manual GitHub exploration, documentation links, and community memory. A shared builder-navigation layer creates one place where developers can find relevant tools, understand how they help, and access them quickly.

This is valuable even before every proposal reaches a final funded state, because the catalog can organize proposal-linked projects, open-source repos, and reference implementations from the start, then enrich those entries as projects are approved, released, or maintained over time.

---

## Rationale

This proposal is intentionally framed as ecosystem infrastructure, not as a marketplace.

Why this scope is strong:

1. it increases the practical adoption of proposal-linked and open-source public goods by making them easier to find and access
2. it is clearly reusable by the whole ecosystem
3. it is objectively testable through schema, search, and recommendation benchmarks
4. it keeps AI as a narrow recommendation layer instead of making the project dependent on vague chatbot claims

The result is a disciplined, low-overhead proposal that helps developers find the right tools faster and gives the ecosystem a central discovery layer for open-source investments, proposal-linked projects, and reference tooling.
