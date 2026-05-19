## Development Fund Proposal

**Author:** ChainSafe Systems / Daml Autopilot Team  
**Status:** Draft  
**Created:** 2026-03-24  
**Label:** daml-tooling

**Champion:** Need Champion

---

## Abstract

AI coding tools can generate Daml smart contracts from plain English in seconds. The authorization flaws, incorrect party rights, and business logic inconsistencies they introduce do not surface at compile time. Catching them requires expert review that is scarce, expensive, and does not scale.

Daml Autopilot is a live MCP server that closes this gap. It exposes `daml_reason`, callable from any AI-assisted development environment or autonomous agent, combining static safety analysis with semantic retrieval against a corpus of production-verified Daml patterns. The result is a structured verdict: a confidence score, prioritised issues with severity ratings, and direct references to the canonical patterns the code was compared against. The server is deployed and operational on a Canton-connected node. This proposal funds the next stage: systematic corpus coverage across the full Daml taxonomy, CI/CD pipeline integration, and institutional licensing infrastructure.

---

## Specification

### 1. Objective

**The problem:** There is currently no systematic, automated quality gate for Daml smart contracts. AI-assisted coding tools can generate Daml that compiles correctly but contains subtle authorization flaws, incorrect party relationships, or business logic inconsistencies that only manifest in production. When they do, the consequences involve real financial obligations on a live ledger. Human code review catches some of these issues but is inconsistent, expensive, and does not scale as autonomous agent-driven Daml generation becomes more common.

**The intended outcome:** A production-grade correctness gate that:

- Analyses any Daml code submission against a systematically maintained corpus of production-verified patterns
- Identifies authorization flaws, business logic inconsistencies, and deviations from canonical patterns with a calibrated confidence score and traceable basis
- Integrates into the IDE (VS Code / Cursor), CI/CD pipelines, and the Canton developer workflow as a standard quality checkpoint
- Provides honest, calibrated uncertainty by explicitly signalling when corpus coverage is insufficient rather than producing false confidence
- Is licensed for production use, creating a sustainable basis for ongoing corpus maintenance and tooling development

### 2. Implementation Mechanics

**Current implementation (live since March 2026):** The MCP server is deployed on a production Canton-connected node and exposes two tools: `daml_reason` for correctness analysis and `daml_automater` for CI/CD automation. Authentication uses Ed25519 cryptographic challenge-response, meaning every request is tied to a verified Canton party identity. Billing is fully operational: `ChargeReceipt` and `CreditReceipt` contracts are created on the Canton ledger for every tool call and top-up, providing a live on-chain audit trail. The hard infrastructure problems are solved. This funding buys corpus depth, benchmark tooling, and the integrations that make the gate a standard part of the Daml deployment workflow.

**`daml_reason` output:** When invoked with a business intent and Daml code, the tool returns a structured JSON response consumable inside Cursor or any MCP-compatible environment:

| Field | Description |
|---|---|
| **Action recommendation** | `approve`, `suggest_edits`, or `delegate` |
| **Validity assessment** | Overall correctness verdict |
| **Confidence score** | Weighted score combining rule results and retrieval similarity |
| **Issues** | Prioritised list of identified problems with severity ratings |
| **LLM insights** | Generated analysis of detected patterns and risks |
| **Canonical references** | Direct links to the production-verified patterns the code was compared against |

**Core gate engine (to be hardened):** The gate is implemented as a Python FastAPI service exposing an MCP-compatible interface. It combines a rule-based static safety checker covering authorization anti-patterns, party rights violations, and business logic consistency; semantic retrieval via ChromaDB over a curated corpus of production Daml patterns using vector embeddings; and a confidence scoring layer that weights rule violations and retrieval similarity into a single structured output.

**Corpus engineering (primary deliverable of this proposal):** The gate is only as good as its corpus. The corpus is currently operational but small, with uneven taxonomy coverage: reliable on basic asset transfer and simple authorization patterns, low-confidence on novel multi-party workflows, governance, and upgrade scenarios. This proposal funds systematic build-out across the full Daml taxonomy:

- Authorization and party rights patterns
- Asset lifecycle patterns (creation, archival, transfer, atomic DvP)
- Multi-party workflow patterns (propose-accept, approval chains, conditional execution)
- Error handling and safety invariants
- Contract governance and upgrade patterns
- Integration patterns
- Known failure modes as verified negative examples

Corpus management follows a structured editorial discipline: taxonomy-driven gap identification, benchmark query sets per taxonomy node, embedding space coverage visualisation, and production confidence monitoring as an automatic feedback loop. Full methodology is documented in the project's `CORPUS_ENGINEERING.md`.

**IDE integration:** The gate is exposed as an MCP tool natively consumable inside Cursor and any MCP-compatible environment. Invocation is on-demand: the developer passes their Daml code and business intent, and receives a structured assessment. Integration work focuses on making that invocation frictionless and the output maximally useful in the IDE context.

**CI/CD integration:** A GitHub Actions plugin and a generic webhook interface that runs gate analysis on every pull request touching Daml files. Teams set a minimum confidence score required to merge; below-threshold results block the merge with a structured report.

### 3. Architectural Alignment

Daml Autopilot operates at the application layer of the Canton ecosystem. It does not modify the Canton protocol, the ledger, or any existing Canton infrastructure. It is a pre-deployment verification service that sits between the developer's environment and the Canton ledger.

**Alignment with Canton ecosystem priorities:**

- **Developer experience:** Lowers the barrier to safe Daml development, particularly for teams new to the Canton model or using AI-assisted code generation
- **Production safety:** Addresses a real gap in the tooling available to teams deploying Daml to production Canton networks
- **Ecosystem growth:** A quality gate that reduces deployment risk makes it safer for institutions to commit to building on Canton. It removes a category of risk that currently requires expensive manual expertise.
- **Autonomous agent readiness:** As AI agents increasingly generate Daml code, a deterministic, corpus-grounded correctness gate becomes critical infrastructure. Daml Autopilot is positioned as the verification layer those agents route through.

The on-chain billing model uses Canton Coin and the Canton ledger directly, demonstrating a practical metered-service use case for the network. This being said, agent-initiated payments are possible and working, but onboarding and offramping still adds serious friction which need to be addressed in other research work. This area is explicitly not part of this proposal.

### 4. Backward Compatibility

*No backward compatibility impact.* Daml Autopilot is an independent service. It does not modify, wrap, or depend on any existing Canton production contracts or infrastructure. It reads Daml source code as input and returns a structured JSON assessment. Integration is entirely opt-in at the developer or team level.

---

## Milestones and Deliverables

### Milestone 1: Corpus Foundation and Benchmark Infrastructure
- **Estimated Delivery:** Week 6
- **Focus:** Build corpus coverage sufficient for reliable production use across the core Daml taxonomy and establish the benchmark infrastructure that keeps it honest.
- **Deliverables / Value Metrics:**
  - Corpus covering all taxonomy nodes with minimum 5 verified documents per node
  - Benchmark query suite with at least 3 positive and 1 negative query per taxonomy node
  - Automated benchmark runner with pass/fail reporting
  - Embedding space visualisation tooling and corpus coverage audit script
  - Benchmark results showing retrieval quality above 0.75 confidence on 90% of benchmark queries
  - `CORPUS_ENGINEERING.md` methodology document (complete)

### Milestone 2: MCP Integration and Developer Experience
- **Estimated Delivery:** Week 10
- **Focus:** Production-harden the `daml_reason` MCP tool and make the on-demand invocation experience as clear and actionable as possible inside Cursor and other MCP-compatible environments.
- **Deliverables / Value Metrics:**
  - Production-hardened `daml_reason` MCP tool with stable interface and response schema
  - Configurable confidence threshold settable per project
  - Quick-start guide and integration documentation for Canton developers
  - At least 3 Canton community developers using the tool in active Daml development with documented feedback

### Milestone 3: CI/CD Pipeline Integration
- **Estimated Delivery:** Week 16
- **Focus:** Make the gate a standard checkpoint in the Daml deployment pipeline, blocking below-threshold code from reaching production automatically.
- **Deliverables / Value Metrics:**
  - GitHub Actions plugin published and documented
  - Generic webhook interface for non-GitHub CI systems
  - Configurable merge threshold with structured failure reports
  - Integration guide for Canton-connected development teams
  - Demonstrated integration in at least one active Canton project's pipeline

### Milestone 4: Production Hardening and Licensing Infrastructure
- **Estimated Delivery:** Week 22
- **Focus:** Production-grade reliability, the annual licensing model, and the operational monitoring required to sustain corpus quality over time.
- **Deliverables / Value Metrics:**
  - SLA-grade uptime and response time for gate API
  - Annual license management infrastructure
  - Production confidence monitoring dashboard with weekly reporting
  - Corpus update process with change control and benchmark gate
  - First 3 paying institutional licenses signed
  - Public case study or technical blog post on correctness gate methodology

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone
- Demonstrated functionality: gate correctly identifies known-flawed Daml samples from a test set with consistent confidence scores
- Corpus benchmark suite passing at the specified threshold (90% of queries above 0.75 retrieval confidence)
- CI/CD integration demonstrated in a live Canton project pipeline
- Documentation available at project end

---

## Funding

**Total Funding Request:** 621,000 CC

This covers six months of fully-loaded team costs to reach first license revenue: one senior ML engineer with production RAG and Daml domain expertise ($150,000/year), 0.5 FTE DevOps (€48,000/year), and AI tooling (€6,000/year), totalling approximately $90,000 over the project duration. CC amounts are calculated at the rate prevailing at submission ($0.145 USD/CC).

### Payment Breakdown by Milestone

| Milestone | Deliverable | USD | CC Payment |
|---|---|---|---|
| Milestone 1 | Corpus foundation and benchmark infrastructure | ~$24,300 | 168,000 CC |
| Milestone 2 | MCP integration and developer experience | ~$16,200 | 112,000 CC |
| Milestone 3 | CI/CD pipeline integration | ~$24,300 | 168,000 CC |
| Milestone 4 | Production hardening and licensing | ~$24,300 | 173,000 CC |
| **Total** | | **~$89,100** | **621,000 CC** |

Milestone USD amounts are weighted proportionally to timeline duration (6 / 4 / 6 / 6 weeks). Minor rounding variance absorbed in Milestone 4.

### Volatility Stipulation

The project duration is under 6 months. The grant is denominated in fixed Canton Coin at the rate prevailing at submission. Should the CC/USD rate decline materially before remaining milestones are paid out, the real value of those payments may be insufficient to cover the stated team costs. In that event, the implementing entity reserves the right to request renegotiation of remaining milestone amounts to reflect actual costs. Should the project timeline extend beyond 6 months due to committee-requested scope changes, all remaining milestones must be renegotiated regardless of rate movement.

---

## Co-Marketing

Upon release of Milestone 4, the implementing entity will collaborate with the Foundation on:

- Announcement coordination timed to the production release
- Technical blog post on the correctness gate methodology and corpus engineering approach, written for a Daml developer audience
- Developer ecosystem promotion targeting Canton-connected institutions and the broader Daml developer community
- Case study documenting the gate's performance on real Daml patterns, with specific examples of flaws caught, subject to appropriate anonymisation

---

## Motivation

The Canton ecosystem faces two compounding pressures. Institutions are deploying increasingly sophisticated Daml contracts like multi-party workflows, novel financial instruments, or complex integration layers. Simultaneously, AI-assisted code generation is accelerating the volume of Daml reaching production review. Neither trend is slowing. The tooling gap they expose is not theoretical: authorization flaws and business logic inconsistencies do not surface at compile time, expert Daml reviewers are scarce and expensive, and there is currently no automated gate that fills that space.

A correctness gate embedded into the standard Daml workflow changes the economics of this problem. It does not replace expert review. However, it does make expert review more targeted. Issues are surfaced and structured before a human reviewer sees the code. For teams without in-house Daml expertise, it provides a baseline of correctness assurance that is otherwise simply unavailable.

There is a second benefit that is less obvious but worth naming explicitly. Twelve years of Daml documentation, SDK changelogs, reference implementations, and legacy integration guides exist in a form that is technically complete but practically unnavigable. New developers onboarding to the network today face a documentation surface too large to read and too poorly indexed to search effectively. This is a real barrier to ecosystem growth that no amount of additional documentation resolves.

Building the corpus addresses this as a direct consequence of the work. Curating production-verified Daml patterns into a semantically searchable vector index is, by definition, the act of distilling twelve years of accumulated knowledge into something a developer can actually query in 2026. Every gap identified in the corpus is a gap in accessible Daml knowledge. Every document added is a piece of that knowledge made findable. The correctness gate and the developer knowledge base are the same artifact.

The result is tooling that every serious Daml developer and every institution deploying to production will naturally reach for in the same way TypeScript, ESLint, and formal verifiers became defaults in their respective ecosystems. That is the position this proposal builds toward.

---

## Rationale

**Why a corpus-grounded approach rather than pure rule-based static analysis?**

Rule-based analysis catches known anti-patterns but cannot assess whether code correctly implements a given business intent. A contract can pass all rule checks and still model the wrong thing. Corpus-grounded semantic retrieval allows the gate to compare submitted code against known-correct implementations of similar patterns, surfacing deviations that rules alone cannot detect.

**Why not use a frontier language model directly?**

Frontier models have seen Daml code during training, but undifferentiated from broken examples, outdated patterns, and forum posts where someone was asking why their code was wrong. They have no ground truth. The corpus is exclusively production-verified, correct Daml. Every retrieval is grounded in something known to be right. This produces calibrated confidence scores that a frontier model cannot provide, and honest low-confidence signals when the corpus does not cover a case rather than false confidence.

**Why the MCP interface?**

MCP (Model Context Protocol) is the emerging standard for tool integration in AI-assisted developer environments. Implementing the gate as an MCP server means it integrates natively with Cursor, Claude, and any other MCP-compatible environment without custom integration work. It also means the gate is callable by autonomous agents running in those environments, positioning it correctly as verification infrastructure for agent-generated code.
