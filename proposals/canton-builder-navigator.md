## Development Fund Proposal: Canton Builder Navigator -- Public-Good Tool Discovery and Onboarding Infrastructure

- **Author:** Deepthi
- **Status:** Submitted
- **Created:** 2026-03-19


---

## Abstract

This proposal requests funding for an open-source discovery and onboarding layer for Canton public-good tooling, proposal-linked projects, and reference implementations.

As the ecosystem grows, the problem is no longer only "build more tools." It is also "help builders quickly find the right tools, understand how they help, and assemble a practical starting path." Today that discovery work is fragmented across proposal PRs, GitHub repositories, documentation sites, release notes, and community memory. That slows onboarding and reduces reuse of open-source ecosystem outputs.

The proposed project, **Canton Builder Navigator**, provides:

- a structured catalog of public-good Canton tools and proposal-linked projects
- machine-readable manifests for each catalog entry
- deterministic search, filters, and workflow guides
- explainable recommendations showing how a tool helps and what it does not solve
- a tightly bounded free-text query layer built only on top of the structured catalog

The goal is not to build a marketplace, a generalized chatbot, or a grant-scoring system. The goal is to make Canton public-good tooling easier to discover, compare, and adopt.

The implementation is intentionally low-overhead: repository-backed manifests, generated indexes, static hosting where possible, and a discovery experience that remains useful even if the free-text layer is disabled. That makes the project easier to verify, easier to maintain, and better aligned with milestone-based funding.

---

## Specification

### 1. Objective

The objective is to reduce developer onboarding friction and improve the practical reuse of Canton public-good tooling.

The intended outcome is that a new developer can describe what they are trying to do, for example:

- "I need local auth and CI-friendly test tokens"
- "I am building a wallet-enabled dapp"
- "I need help validating package rollout safety"

and receive:

- a small shortlist of relevant Canton tools and proposal-linked projects
- clear reasons those tools match the use case
- guidance on where each tool fits in the workflow
- explicit notes about what each tool does not solve
- direct links to canonical source repositories, documentation, and proposal context

This proposal treats ecosystem discovery as shared infrastructure for public-good outputs rather than as a private directory product.

### 2. Implementation Mechanics

The project will be delivered as:

- a manifest schema for catalog entries
- a repository-backed catalog of public-good tools and proposal-linked projects
- a deterministic discovery UI plus machine-readable JSON export
- a narrow free-text query layer built on top of the structured catalog

#### A. Catalog Scope

To keep the project focused and defensible, the initial catalog scope is intentionally limited to:

- Canton public-good developer tools
- reference implementations and reusable infrastructure
- proposal-linked projects with public repositories or release artifacts
- official documentation links where needed for onboarding context

Each catalog entry will include structured fields such as:

- project name
- category
- problem solved
- intended users
- lifecycle stage
- network or environment support
- open-source status
- maintenance status
- repository link
- documentation link
- proposal link where applicable
- compatibility notes
- related tools

Entries will live as version-controlled manifests so they can be reviewed and updated through normal GitHub contribution flows. The navigator will always point back to canonical sources rather than trying to replace them.

#### B. Deterministic Discovery Layer

The deterministic catalog experience is the core product and does not depend on any AI feature.

It will provide:

- keyword search
- category, lifecycle, maintenance, and environment filters
- starter-path views for common developer workflows
- related-tool navigation
- "how this helps" and "what this does not solve" summaries derived from structured metadata
- direct links to repositories, docs, releases, and proposal context

This deterministic layer ensures the project remains useful even if the free-text query layer is unavailable.

#### C. Free-Text Query Layer

The free-text layer will sit on top of the structured catalog and remain tightly bounded.

It will:

- interpret a developer's short natural-language request
- map that request onto catalog categories, workflows, and filters
- retrieve a small shortlist of likely matches
- produce explainable output showing why the shortlist was chosen

Important constraints:

- it will operate only on the curated catalog
- it will not behave like a general Canton copilot
- it will not browse arbitrary repositories or the open web
- it will clearly separate structured facts from generated guidance

#### D. Explicitly Out of Scope

To keep the project reviewer-friendly, this proposal does **not** include:

- a commercial marketplace
- paid placement or ranking
- package or project hosting
- generalized chat assistant behavior
- proposal scoring or grant-decision support
- continuous crawling of arbitrary GitHub repositories
- private or proprietary ecosystem indexing

#### E. Relationship to Existing Tooling

This proposal complements existing and future Canton tools rather than competing with them:

- it does **not** replace the tools it catalogs
- it does **not** act as a wallet, SDK, deployment platform, or IDE
- it does **not** duplicate proposal hosting on GitHub
- it does provide a discovery and onboarding layer that helps public-good outputs become easier to find and adopt

### 3. Operational Model and Maintenance

The project is designed to stay useful without becoming an operational burden.

- the catalog can be published as a static site with generated JSON indexes
- entries can be updated through pull requests
- schema validation, link checks, and freshness checks can run in CI
- deterministic search remains usable even without the free-text layer enabled
- the stewardship milestone is bounded to maintenance, catalog freshness, compatibility updates, and minor in-scope improvements

This operating model is important to the proposal: the value should remain with the ecosystem without requiring a proprietary backend or a broader hosted service model.

### 4. Architectural Alignment

This proposal aligns with the Development Fund in a straightforward way:

- it improves the practical reuse of public-good ecosystem outputs
- it reduces onboarding friction for new builders
- it creates a shared discovery layer rather than a private directory
- it increases the visibility of proposal-linked projects, reference implementations, and reusable tooling

This is ecosystem infrastructure. It does not change Canton protocol behavior, but it can materially improve adoption of shared developer tooling and reduce repeated discovery effort across teams.

### 5. Delivery Feasibility

This proposal is intentionally scoped to be modest and easy to verify:

- it does not require protocol changes or validator-side deployment
- it can be implemented with repository-backed manifests, generated indexes, and a lightweight web frontend
- it does not depend on arbitrary web crawling, proprietary backends, or large data-ingestion systems
- the deterministic catalog remains useful on its own

That makes the project a better fit for milestone-based funding: each phase produces a usable public-good artifact that can be reviewed independently.

### 6. Risks and Mitigations

- **Stale catalog data:** entries will include maintenance status, last-verified metadata, and canonical source links so users can quickly confirm the latest state.
- **Weak recommendation quality:** deterministic search and starter-path workflows remain the primary user path; the free-text layer is additive rather than critical.
- **Scope creep toward marketplace or chatbot features:** those areas are explicitly out of scope, and milestone acceptance is tied to catalog quality, workflow usefulness, and contribution readiness instead of platform expansion.

### 7. Backward Compatibility

No backward compatibility impact.

This is an external discovery and onboarding layer. Teams can adopt it incrementally.

---

## Milestones and Deliverables

### Milestone 1: Catalog Schema and Discovery Core

- **Estimated Delivery:** 4 weeks  
- **Focus:** build the structured catalog foundation  
- **Deliverables / Value Metrics:**  
  - machine-readable manifest schema for public-good tools, reference implementations, and proposal-linked projects  
  - schema validation tooling and contribution guidelines  
  - initial catalog population with at least 20 entries across at least 4 categories  
  - deterministic search and filter UI  
  - direct repo, docs, and proposal links from catalog entries  
  - machine-readable JSON export for catalog data  

### Milestone 2: Workflow Guides and Onboarding Layer

- **Estimated Delivery:** 4 weeks  
- **Focus:** make the catalog useful for real developer onboarding flows  
- **Deliverables / Value Metrics:**  
  - at least 4 starter-path views for common developer workflows  
  - lifecycle-stage and use-case views  
  - related-tool navigation  
  - "how this helps" and "what this does not solve" summaries for catalog entries  
  - benchmark query set with at least 15 curated developer intents for evaluation  
  - documentation for adding, reviewing, and maintaining manifests  

### Milestone 3: Free-Text Matching, Hardening, and Public Release

- **Estimated Delivery:** 4 weeks  
- **Focus:** add bounded free-text matching and prepare the project for public release  
- **Deliverables / Value Metrics:**  
  - free-text query experience grounded in catalog metadata  
  - explainable shortlist output showing why entries were selected  
  - evaluation set demonstrating at least one relevant result in the top three for at least 80% of benchmark intents, based on manual review against the published benchmark set  
  - public release docs and walkthrough  
  - contribution guide for ecosystem maintainers  

### Milestone 4: Stewardship and Catalog Freshness Window

- **Estimated Delivery:** 12 months after launch  
- **Focus:** keep the navigator current and reliable during the initial adoption window without expanding into a broader platform  
- **Deliverables / Value Metrics:**  
  - catalog freshness updates, metadata corrections, and canonical link maintenance  
  - bug fixes for UI, filters, and free-text matching issues found during live use  
  - compatibility updates for dependencies and build tooling as needed  
  - limited in-scope workflow refinements based on user feedback  
  - quarterly maintenance summaries covering fixes shipped, stale entries corrected, and open issues  
  - value metric: the navigator remains operational and the catalog remains current through the initial adoption window with a documented maintenance history  

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- a validated manifest schema for catalog entries
- at least 20 initial catalog entries across at least 4 categories
- deterministic search and filters working against the catalog
- each entry exposing the documented metadata fields
- each entry exposing direct canonical repo, docs, and proposal links where available
- at least 4 starter-path or workflow views published
- the navigator clearly showing how a matched tool helps and what it does not solve
- the free-text layer returning grounded shortlist results for benchmark developer intents
- deterministic search remaining usable without the free-text layer enabled
- documentation and contribution guidance being complete
- the project being released as open source

Project-specific acceptance conditions:

- the project must remain a catalog and onboarding layer, not a marketplace
- the free-text layer must remain grounded in structured catalog data
- generated guidance must be distinguishable from structured facts
- the catalog must continue pointing users back to canonical project sources rather than replacing them
- the stewardship window must remain bounded to freshness, maintenance, compatibility, and minor in-scope improvements rather than product expansion

---

## Funding

**Total Funding Request:** 426,000 CC

### Payment Breakdown by Milestone

- Milestone 1 _(Catalog Schema and Discovery Core)_: 90,000 CC upon committee acceptance  
- Milestone 2 _(Workflow Guides and Onboarding Layer)_: 90,000 CC upon committee acceptance  
- Milestone 3 _(Free-Text Matching, Hardening, and Public Release)_: 90,000 CC upon final release and acceptance  
- Milestone 4 _(Stewardship and Catalog Freshness Window)_: 156,000 CC across four quarterly acceptance checkpoints during the 12-month window  

Indicative stewardship equivalent: **13,000 CC per month for 12 months**, paid in quarterly milestone tranches rather than as an open-ended monthly services contract.

### Volatility Stipulation

If the project duration extends beyond 6 months due to Committee-requested scope changes, remaining milestones should be renegotiated for material CC/USD volatility.

No funding beyond this bounded 12-month stewardship window is requested in this initial proposal.

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

Right now, much of that discovery burden still falls on proposal browsing, manual GitHub exploration, scattered documentation, and community memory. A shared navigator gives developers one place to find relevant tools, understand how they help, and access them quickly.

This is valuable even before every proposal reaches a final funded state, because the catalog can organize proposal-linked projects, open-source repositories, and reference implementations from the start, then enrich those entries as projects are approved, released, or maintained over time.

---

## Rationale

This proposal is intentionally framed as ecosystem infrastructure, not as a marketplace.

Why this scope is stronger than the earlier draft:

1. it keeps the deterministic catalog as the core product
2. it narrows the free-text layer to a small, explainable helper instead of making AI the center of the proposal
3. it replaces open-ended stewardship language with a bounded fourth milestone
4. it is objectively testable through schema, search, workflow, and benchmark acceptance criteria
5. it creates a reusable discovery layer for public-good outputs without trying to become a broader ecosystem platform

The result is a disciplined, lower-risk proposal that helps developers find the right tools faster and gives the ecosystem a practical discovery layer for open-source investments, proposal-linked projects, and reference tooling.
