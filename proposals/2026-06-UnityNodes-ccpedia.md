# Development Fund Proposal

**Author:** Unity Nodes
**Status:** Submitted
**Created:** 2026-06-04
**Label:** daml-tooling
**Champion:** Digital Asset

---

## Abstract

ccpedia ([ccpedia.xyz](https://ccpedia.xyz)) is Canton's knowledge infrastructure: a live, unified corpus of 50,000+ records from 15 sources, 37,000+ RAG chunks, and 22 MCP tools already running in production (record counts independently verifiable at `ccpedia.xyz/api/v1/sources`). This proposal funds Phase 2: expanding to 60 MCP tools across 17 data sources, including ten cross-source synthesis tools that are only possible because of ccpedia's unique unified corpus. By month 9, ccpedia is open-sourced under Apache 2.0, expanded to 60 tools across 17 sources, and in verified active use by independent Canton teams.

---

## Specification

### 1. Objective

Canton developers lack a unified, always-current knowledge layer. Finding answers requires searching docs, forum posts, GitHub issues, CIPs, proposals, and videos separately, often returning contradictory or outdated results. Without a unified solution, AI coding assistants (Claude, Cursor, Windsurf) remain blind to Canton's living ecosystem: no single MCP-accessible layer synthesizes all sources into one coherent whole.

ccpedia solves this today: a single MCP server aggregating, syncing, and semantically searching 15 Canton knowledge sources in production. Phase 2 expands the existing 22 live tools to 60 tools across 17 sources, adding cross-source synthesis capabilities that are fundamentally impossible without ccpedia's unified corpus.

**Single objective:** Expand ccpedia from a working tool to the canonical Canton developer knowledge infrastructure, open-sourced under Apache 2.0, with verified external adoption.

### 2. Implementation Mechanics

The work is structured across three milestones, each building on the previous.

**M1: Open-Source Release of Live Production Infrastructure (upon grant approval)**

M1 releases live production infrastructure as a Canton ecosystem public good under Apache 2.0:
- 22 MCP tools in production, 15 live data sources, sync infrastructure running continuously
- Open-source release at `github.com/UnityNodes/ccpedia` (Apache 2.0): MCP server, all tools, database schema, sync pipelines, source connectors
- 45 Canton YouTube videos indexed and searchable via the existing `search` and `get_video` tools
- All 22 existing tools documented with usage examples

**M2: Phase 2 Technical Delivery (Month 3)**

38 new MCP tools total: 22 per-source, 10 synthesis, and 6 new-source across 2 new data sources.

22 new per-source MCP tools targeting HIGH/MEDIUM developer demand, including:
- `diagnose_error(error_text)`: searches 4,100+ forum topics and 3,100+ GitHub issues for matching errors and community workarounds
- `get_breaking_changes(from_sdk, to_sdk)`: what breaks when upgrading between SDK versions (440+ versions indexed)
- `get_sdk_changelog(version)`: detailed per-version changelog
- `search_community(query)`: semantic search across forum, mailing list, blog, and discussions in one call
- `search_github_issues(query)`: full-text search across 3,100+ GitHub issues from 15+ repos
- `search_talks(query)`: semantic search across 45 YouTube videos with automated transcripts
- `find_known_issues(description)`, `get_faq(topic)`, `find_cip_for_feature(feature)`, `get_cip_implementation_status(cip_number)`, `get_latest_release(package)`, `search_release_notes(feature)`, `find_security_patches()`, `get_npm_packages(query)`, `find_similar_projects(description)`, `search_mailing_list(query)`, `find_maintainer_guidance(topic)`, `get_issue_status(issue_number)`, `find_code_examples(topic)`, `get_funding_landscape(category)`, `get_proposal_milestones(id)`, `get_ecosystem_gaps()`

10 cross-source synthesis tools requiring ccpedia's unified corpus (no individual source supports these):
- `detect_builder_overlap(idea)`: identifies who is building something similar across 410+ proposals and 180+ ecosystem projects; manual research takes 3+ hours, this tool takes 10 seconds
- `proposal_success_predictor(draft_text)`: heuristic scoring against funded vs. unfunded attributes of all 410+ historical proposals; the manual cross-proposal analysis that this tool will automate was itself applied when writing this proposal
- `full_context(topic)`: single query across docs, forum, proposals, CIPs, blog, and GitHub simultaneously
- `community_consensus(topic)`: synthesizes what the Canton community actually believes, not just the last forum reply
- `find_expert(topic)`: algorithmic expert ranking by forum reputation, GitHub contributions, and proposal authorship
- `detect_drift(topic)`: finds contradictions between docs, forum, and GitHub (for example, docs say one thing, forum says another, and explains why)
- `learning_path(goal)`: structured onboarding path from whitepaper through docs, forum, proposals, and videos
- `outdated_guidance_detector(query)`: flags stale 2023 advice and surfaces the current equivalent
- `ecosystem_dependency_graph(topic)`: maps 180+ projects to SDK versions, repos, and proposals
- `find_collaboration_opportunities(project)`: surfaces projects with complementary capabilities

2 new live data sources:
- **Featured Apps via Scan API (16th source):** `list_featured_apps`, `get_app_metrics`, `find_apps_by_pattern`
- **SV Operations Calendar (17th source):** Canton Foundation ICS feed (`sv-cal.canton.foundation/schedule.ics`, auto-updates every 12 hours) with `get_sv_schedule(environment)`, `get_upcoming_operations(days)`, `get_recent_deployments()`

External code review and penetration test of the `ccpedia` MCP server, a read-only HTTP API/RAG service. Threat model scope: prompt injection protection, rate limiting, data leakage, query sanitization. This is not a smart contract audit (ccpedia holds no keys, executes no contracts, manages no funds). Public docs at `ccpedia.xyz/docs`, developer onboarding guide for Claude/Cursor/Windsurf, 20 curated Canton design patterns with code examples.

**M3: Ecosystem Adoption (6-month window after M2 acceptance)**

Verified adoption of ccpedia by independent Canton teams. Unity Nodes runs an active promotion campaign (Discord, Slack, Forum, X) and direct outreach to Canton builder teams. Gate: at least 3 independent Canton teams publicly document active use of ccpedia via Canton forum post, GitHub issue/PR, published case study, or written statement shared with the committee.

**Technical stack:** SQLite with sqlite-vec for RAG (vector similarity search chosen for zero-dependency local vector search without an external managed service), Next.js API layer, MCP protocol for tool exposure, incremental sync pipelines (5 min / 15 min / 6 hr / daily per source).

### 3. Architectural Alignment

- **MCP standard:** MCP tooling for Canton is an active area of committee engagement. ccpedia focuses on knowledge access; existing MCP implementations in the ecosystem focus on action-execution or DAML code analysis. These are complementary layers with no functional overlap.
- **Apache 2.0 open-source:** Consistent with the open-source direction of the Canton Dev Fund.
- **CIP alignment:** Makes 120+ CIPs semantically searchable with cross-references, implementation status, and related proposals. Directly supports developers implementing CIP-compliant applications.
- **Extension, not replacement:** Phase 2 extends the live 22-tool system. No existing Canton tool or service is replaced or duplicated.
- **Canton Wiki differentiation:** ccpedia is a live, semantically searchable corpus with 22 MCP tools, not a static wiki or registry.

### 4. Backward Compatibility

No backward compatibility impact. ccpedia is a read-only service layer that queries existing Canton data sources (forum, GitHub, docs, CIPs) without modifying them. The MCP server is purely additive infrastructure. The existing 22 tools remain unchanged; Phase 2 adds tools alongside them.

---

## Milestones and Deliverables

### Milestone 1: Open-Source Release of Live Production Infrastructure

- **Estimated Delivery:** Upon grant approval
- **Payment:** 185,000 CC, paid at grant approval
- **Focus:** Open-source release of live production infrastructure as a Canton ecosystem public good
- **Deliverables / Value Metrics:**
  - Phase 1 work already delivered: 22 MCP tools in production, 15 live data sources, sync infrastructure running continuously
  - Dedicated open-source repository (MCP server, sync pipelines, schema) published under Apache 2.0 at `github.com/UnityNodes/ccpedia`
  - 45 Canton YouTube videos indexed and searchable via the existing `search` and `get_video` tools
  - All 22 existing tools documented with at least 1 usage example each

### Milestone 2: Phase 2 Technical Delivery

- **Estimated Delivery:** Month 3
- **Payment:** 140,000 CC upon committee acceptance
- **Focus:** Full Phase 2 technical build: 38 new tools (22 per-source, 10 synthesis, 6 new-source), 2 new data sources, code review, docs
- **Deliverables / Value Metrics:**
  - 22 new per-source MCP tools operational and documented
  - 10 cross-source synthesis tools live and demonstrably functional via live demo
  - 6 new-source tools live (Featured Apps: 3, SV Calendar: 3)
  - 2 new data sources live and syncing (Featured Apps via Scan API, SV Operations Calendar)
  - External code review completed, findings remediated, full report publicly accessible
  - `ccpedia.xyz/docs` live with tool reference and integration guides for Claude / Cursor / Windsurf
  - 20 Canton design patterns published at `ccpedia.xyz/docs`

### Milestone 3: Ecosystem Adoption

- **Estimated Delivery:** 6-month window after M2 acceptance
- **Payment:** Tiered based on verified adoption: 300,000 CC (3 teams) / 450,000 CC (5 teams) / 605,000 CC (7+ teams)
- **Focus:** Verified adoption of ccpedia by independent Canton teams
- **Deliverables / Value Metrics:**
  - Active promotion campaign run by Unity Nodes (Forum, X, Discord, Slack, direct outreach to builder teams)
  - Independent Canton teams (not affiliated with Unity Nodes) publicly document active use of ccpedia in their development workflow
  - Evidence accepted: Canton forum post, GitHub issue/PR, published case study, or written statement shared with the committee
- **Gate (tiered):**
  - 3 independent Canton teams publicly document active use → 300,000 CC
  - 5 independent Canton teams publicly document active use → 450,000 CC
  - 7+ independent Canton teams publicly document active use → 605,000 CC

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Demonstrated Canton developer adoption (documented external users, public repos, case studies) rather than CI/CD test results
- Live data sources syncing continuously at stated cadences with verifiable record freshness
- Open-source repository publicly accessible under Apache 2.0 with working setup instructions

The acceptance criteria is to be based on value to the ecosystem and not delivery of an artifact. M1 delivers the OSS release of already-running infrastructure. M2 delivers the full Phase 2 technical scope. M3 demonstrates that ccpedia is genuinely used by independent Canton teams.

**M1 gate:** Open-source repository publicly accessible at `github.com/UnityNodes/ccpedia` under Apache 2.0; Phase 1 tools documented

**M2 gate:** 38 new tools operational (22 per-source, 10 synthesis, 6 new-source for Featured Apps/SV Calendar); 2 new data sources syncing; code review report public; `ccpedia.xyz/docs` live

**M3 gate (tiered):** Independent Canton teams publicly document active use via forum post, GitHub issue/PR, published case study, or written statement shared with the committee: 3 teams → 300,000 CC / 5 teams → 450,000 CC / 7+ teams → 605,000 CC

---

## Funding

**Total Funding Request:** 325,000 CC guaranteed + up to 605,000 CC adoption-based (tiered) = maximum 930,000 CC

| Milestone | CC | When | Basis |
|---|---|---|---|
| M1: OSS Release of Live Infrastructure | 185,000 | Upon grant approval | Live production infrastructure published as Apache 2.0 public good |
| M2: Phase 2 Technical Delivery | 140,000 | Month 3, upon committee acceptance | Delivery of 38 new tools, 2 sources, code review, docs |
| M3: Ecosystem Adoption | 300,000–605,000 | 6-month window after M2 | Tiered: 3 teams (300k) / 5 teams (450k) / 7+ teams (605k) |
| **Maximum total** | **930,000** | | 20% OSS release / 15% technical / up to 65% adoption |

---

## Co-Marketing

Upon release of each milestone, Unity Nodes will collaborate with the Foundation on:

- Announcement coordination for the Apache 2.0 open-source release (M1)
- Technical blog post documenting ccpedia architecture, MCP integration patterns, and RAG pipeline design
- Developer guide "Using ccpedia with Claude / Cursor / Windsurf" published at ccpedia.xyz/docs and submitted to Canton developer resources
- Case study documenting how manual cross-proposal analysis, the research approach that `proposal_success_predictor` will automate, was applied when writing this proposal; published at `ccpedia.xyz/docs` after M2 delivery
- Upon M2 completion, Unity Nodes will build and open-source a Discord/Slack bot that exposes ccpedia MCP tools in community channels, including a daily Canton digest (new CIPs, proposals, SDK releases) and interactive Q&A via ccpedia tools. The bot will be available for self-hosting by the Foundation or any community member. If requested, Unity Nodes can assist with deployment in official Canton community spaces.

---

## Motivation

Canton developers waste dozens of hours monthly solving the same problems repeatedly: "What broke in this SDK upgrade?" "Who is already building this?" "What does the community actually think about X?" Each answer requires searching 4-6 separate sources, reconciling contradictions, and hoping the answer is not in a 2023 forum post that references a deprecated API.

ccpedia already solves this for the 15 sources it covers today. Phase 2 extends the coverage and adds synthesis: the ability to answer questions that require reasoning across the entire corpus simultaneously.

**Ecosystem reach:** Canton developers using AI coding assistants (Claude, Cursor, Windsurf); grant proposal teams doing due-diligence on existing work; new developers needing a structured onboarding path; grant committee members verifying overlap between proposals.

**Proof of work before asking for funding:** 50,000+ live records from 15 sources, 37,000+ RAG chunks, 22 MCP tools in production, all sustained by Unity Nodes without a grant. Phase 2 is not a promise; it is an extension of something already running.

---

## Rationale

**Why ccpedia rather than extending an existing tool?** No existing Canton tool provides unified semantic search across multiple live sources with MCP exposure. ccpedia extends what exists without replacing anything.

**Why these 38 new tools specifically?** The 22 new per-source tools (M2) were selected by mapping which Canton developer questions take the most time today: error diagnosis, SDK upgrade planning, and community consensus queries. The 10 synthesis tools (M2) were selected by identifying which queries require the entire corpus simultaneously (cross-source synthesis is impossible per-source). The 6 new-source tools for Featured Apps and SV Operations Calendar (M2) were selected based on confirmed public availability and developer demand for live dApp metrics and network operations scheduling. Additional tool candidates are deferred to a subsequent grant based on real-world Phase 2 adoption data.

**Why code review and not a full security audit (M2)?** ccpedia is a read-only HTTP API and RAG search service. It holds no keys, executes no smart contracts, and manages no user funds. The threat model is prompt injection, data leakage, and query sanitization, which is appropriate for a code review and penetration test scope. A full smart contract audit would be disproportionate to the actual risk surface and would consume budget better spent on adoption-driving productization.

**Why Apache 2.0 open-source in M1, and why is M1 paid upon grant approval?** Unity Nodes invested significant time and resources building Phase 1 (22 tools, 15 live data sources, production infrastructure) without prior grant funding. M1 funds the OSS release of infrastructure already running in Canton, documenting and licensing it for public reuse, converting this investment into a permanent public Canton ecosystem asset. The entire Canton community gains the ability to verify, fork, and self-host ccpedia independently of Unity Nodes. The software is open-source under Apache 2.0; the managed data service (indexed corpus, live sync pipelines, and RAG layer) remains operated by Unity Nodes. The repository will be published at `github.com/UnityNodes/ccpedia`.

**Why this funding amount?** The 930,000 CC maximum reflects three distinct scopes of work: M1 (185,000 CC) funds the OSS release of Phase 1 infrastructure (22 tools, 15 sources, production sync pipelines) as a Canton ecosystem public good; M2 (140,000 CC) funds 38 new tools, 2 new data sources, external code review, and public documentation over 3 months of active development; M3 (up to 605,000 CC) is tiered based on verified external adoption: 300,000 CC for 3 teams, 450,000 CC for 5 teams, 605,000 CC for 7+ teams — aligning ccpedia's financial upside directly with ecosystem outcome. The structure is 20% OSS release / 15% technical delivery / up to 65% adoption-based: the adoption tranche scales with the number of independent Canton teams that publicly document active use.

**Why Apache 2.0 specifically?** Apache 2.0 includes a patent grant clause that protects users and contributors from patent litigation. It matches the license of upstream Canton dependencies (canton, daml, splice are all Apache 2.0), eliminating license compatibility friction for downstream integrators.

**Why a performance-based M3?** Unity Nodes can demonstrate that ccpedia tools work. Only the Canton developer community can demonstrate that ccpedia tools are actually used. The M3 structure (verified external teams with publicly documented use) aligns ccpedia's financial upside with the outcome that matters to the ecosystem.
