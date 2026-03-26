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

### Milestone 1: Public Alpha for Structured Tool Discovery

The catalog launches with the initial entries, schema, filters, and canonical links so a user can complete basic tool discovery without free-text.

### Milestone 2: External Onboarding Evaluation

At least one evaluator uses the starter paths and workflow views to find tools for real developer intents and records where discovery breaks down.

### Milestone 3: Hardened Discovery Release

Free-text matching, shortlist explanations, and contributor documentation are improved from that feedback and released publicly.

### Milestone 4: Freshness and Stewardship Window

The navigator stays current through the initial maintenance period with documented fixes, metadata refreshes, and bounded in-scope improvements.

---

## Potential Ecosystem Beneficiaries

This proposal is positioned as public-good onboarding infrastructure for the Canton ecosystem.

The core problem it addresses is discovery friction: developers often spend too much time figuring out which tools, examples, and public-good projects are relevant before they can make real progress.Especially after the Dev Grant program where you will have 100s of projects it is essential to give new projects sense of what is in already. 

Few Projects who are very keen to use this are `Lumens.fi`, and `BitDynamics AB`. 

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

### Evidence of Ecosystem Demand

Builder discovery in the Canton ecosystem is currently fragmented across official documentation, GitHub repositories, quickstarts, grant proposals, and community guidance. While these resources are individually valuable, they do not provide one normalized discovery workflow for answering practical builder questions such as: which starter is current, which tool is maintained, which version it targets, and whether it is reference-grade, experimental, or ecosystem-specific.

The demand for a builder navigator comes from this fragmentation rather than from the absence of raw information. The problem is not that resources do not exist; it is that the cost of discovering, comparing, and trusting them remains too high for new teams and still non-trivial for experienced builders. I approached few Ecosystem projects who are keen to use this to discover their workflow integrations once grant is on the move. 

### Adoption and Success Expectations

The primary users are new Canton builders evaluating where to start, ecosystem contributors publishing reusable tooling, and technical reviewers or maintainers who need a structured way to route developers toward current resources.

Success for the first release is not just initial usage. It means:
- a curated catalog with clear metadata and compatibility fields
- recurring external contributions to manifests
- repeated usage as a first-stop discovery workflow
- measurable freshness and review discipline over time

### Maintenance and Governance Model

Catalog quality will be sustained through a repository-based contribution model rather than ad hoc manual curation. Each entry will be backed by a structured manifest with required metadata such as ownership, repository link, status, compatibility range, and last-reviewed date.

Contributions will be proposed through pull requests, reviewed by maintainers against a documented schema, and published with explicit status markers such as maintained, experimental, deprecated, or unverified. The project will also include a periodic freshness review process so stale entries can be flagged rather than silently remaining in the catalog.

Current Active builders who are on Validators and FA's will be choosen as approvers and only Grant approved projects are pulled via scripts so manual intervention will be minimal. 

### Differentiation from Existing Resources

The Builder Navigator is not intended to replace official documentation, GitHub search, or community support channels.

- Official docs explain Canton concepts and workflows.
- GitHub discovery exposes repositories, but not normalized maintenance, compatibility, or task-routing metadata.
- Community channels help interactively, but are not durable or structured discovery systems.

The Navigator is intended to become the primary workflow for “where should I start?” and “which resource matches my use case and stack?” by adding a structured catalog layer above existing ecosystem resources rather than duplicating them.


## Team Background

Strong product engineering experience building scalable software systems in large enterprise environments, including work with Fortune 100 organizations such as Accenture. This background includes delivering high-scale products, working across structured operational workflows, and translating complex business processes into dependable software systems.


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
