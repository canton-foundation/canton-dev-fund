## Development Fund Proposal

**Author:** Eric Mann, Displace Technologies LLC  
**Status:** Submitted  
**Created:** 2026-03-12  

---

## Abstract

**Cantool** is a proposed open-source CLI tool for Canton application development: project scaffolding, DAML package management, integration testing, deployment automation, and an MCP server for AI-assisted development.

Canton application developers today assemble ad-hoc scripts, manually extract template IDs from `.dar` files, and write one-off test harnesses. There is no unified tool covering the workflow from project creation to deployment. Cantool fills that gap, adapted to Canton's party-centric, sub-transaction privacy model.

---

## Specification

### 1. Objective

The [Canton Network Developer Experience and Tooling Survey](https://discuss.daml.com/t/canton-network-developer-experience-and-tooling-survey-analysis-2026/8412) (41 active developers, January 20 – February 4, 2026) identified the following:

- **Local Development Frameworks were rated the most critical gap** — the highest-urgency rating in any tooling category surveyed.
- **41% cited Environment Setup & Node Operations as the task that took the longest to "get right."** The survey concludes that developers are "forced to be 'Infrastructure Engineers' before they can be 'Product Builders.'"
- **71% of respondents come from an EVM background** and expect mature toolchains with no Canton equivalent.
- **Respondents mentioned CLI, Hardhat, or Anchor more than 11 times** in open-ended responses, asking for a single tool to handle scaffolding, testing, and deployment.
- **80% of respondents joined the ecosystem within the last 12 months**, making onboarding friction an immediate growth constraint.

The survey explicitly identifies a "Unified CLI Toolchain (Hardhat/Anchor)" as a top missing tool, and separately calls out a "Typed Client SDK & Code Generator" and a "Daml Dependency & Package Manager" as additional gaps.

These findings align with the author's production experience building Canton applications. Canton's architecture is fundamentally different from EVM chains — no global shared state, UTXO-style contract lifecycle, sub-transaction privacy (see [Canton Protocol White Paper](https://canton.network/publications/canton-protocol-whitepaper.pdf), Section 2). Developer tooling cannot be ported from Ethereum; it must be purpose-built for Canton's model.

### 2. Implementation Mechanics

Cantool is a single Go binary with two operational modes:

1. **CLI mode** (`cantool <command>`) — Interactive developer workflows
2. **MCP server mode** (`cantool mcp`) — Programmatic access for AI coding assistants (Claude, Cursor, Codex) via the [Model Context Protocol](https://modelcontextprotocol.io/)

Both modes share a core Canton client library handling Ledger API communication (gRPC), PQS queries, authentication (JWT/OAuth2), and configuration management.

#### Core Components

**Project Scaffolding (`cantool init`)** — Generates a buildable Canton project structure: DAML source directories, application code scaffold (Go initially, with extension points for additional language templates), Docker Compose configuration for cn-quickstart, CI/CD templates, and environment-specific configuration via direnv.

**Package Management (`cantool package`)** — Wraps `dpm` for DAML compilation, then handles `.dar` file inspection, template ID extraction, dependency resolution, and package upload to participant nodes. Cantool does not reimplement DAML compilation — it invokes `dpm build` and manages the artifacts. Provides a declarative manifest tracking which packages are deployed to which environments.

**Testing Framework (`cantool test`)** — Deploys `.dar` packages to a running Canton environment and executes integration test suites with helpers for contract creation, choice exercise, event assertion, and party management. Supports headless CI execution and interactive local development. For local environment lifecycle (`cantool up` / `cantool down`), Cantool delegates to Canton DevKit ([PR #18](https://github.com/canton-foundation/canton-dev-fund/pull/18)) as the primary backend when available. If DevKit is not installed, Cantool falls back to minimal cn-quickstart Docker management — sufficient to run tests, but not intended to replicate DevKit's full feature set (named instances, snapshots, observability, Web UI).

**Deployment Automation (`cantool deploy`)** — Declarative deployment with state tracking (what's deployed where), package versioning, and upgrade workflows. Supports multiple target environments (local, devnet, testnet, mainnet) with per-environment configuration.

**MCP Server (`cantool mcp`)** — Exposes CLI capabilities through the Model Context Protocol, enabling AI coding assistants to scaffold projects, deploy packages, exercise choices, and query contract state. This is a protocol interface exposing deterministic CLI operations, not an AI model.

#### Technology Stack

- **Language**: Go (single binary, strong gRPC support for Ledger API, Cobra CLI framework)
- **Canton Integration**: Ledger API (gRPC), PQS (PostgreSQL), `dpm` (DAML compilation)
- **Authentication**: Keycloak, Google OAuth, JWT
- **Local Environment**: Docker/Docker Compose (cn-quickstart); delegates to DevKit when available
- **Configuration**: direnv, YAML/TOML manifests
- **MCP**: Model Context Protocol SDK for Go

#### Relationship to Existing Tooling

| Existing / Proposed Tool | What It Does | Cantool Relationship |
|---|---|---|
| **DPM** (`dpm`) | SDK management, Daml build/test/codegen, single-process sandbox (`dpm sandbox`) | Cantool wraps `dpm` for DAML compilation — it does not reimplement it. `cantool package build` invokes `dpm build` under the hood. `dpm sandbox` provides a single-process sandbox; Cantool's test harness manages multi-participant cn-quickstart topologies for integration testing. |
| **Canton DevKit** ([PR #18](https://github.com/canton-foundation/canton-dev-fund/pull/18)) | LocalNet lifecycle management (Splice Docker stack), version pinning, named instances, snapshot/restore, observability dashboards, Web UI, CIP-56 token tooling | DevKit manages the **Splice LocalNet Docker stack** as a full-featured infrastructure product. Cantool's funded scope is scaffolding, package management, testing framework, deployment automation, and MCP — not LocalNet management. For local environment lifecycle, **Cantool delegates to DevKit as its primary backend** when installed. If DevKit is not available, Cantool falls back to minimal cn-quickstart Docker management sufficient to run integration tests — not a replacement for DevKit's capabilities. |
| **Daml Code Assistant** ([PR #10](https://github.com/canton-foundation/canton-dev-fund/pull/10)) | AI/ML fine-tuned models for DAML code generation | The Code Assistant helps developers **write DAML**. Cantool helps developers **build, test, and deploy applications** that consume compiled DAML packages. Different lifecycle stages. |

### 3. Architectural Alignment

Cantool is designed around Canton's architectural properties as described in the [Canton Network White Paper](https://canton.network/publications/canton-network-whitepaper.pdf):

- **Party-centric operations**: Commands operate in the context of a configured party identity, reflecting Canton's party-centric ledger model.
- **Sub-transaction privacy**: Test assertions respect visibility boundaries — tests verify that parties see only what they should see.
- **UTXO-style contract model**: The testing framework provides helpers for contract lifecycle (create → exercise → archive), not state mutation.
- **PQS for reads, Ledger API for writes**: Cantool separates query patterns (PQS) from command submission (Ledger API), encoding the canonical Canton data access pattern.

This proposal addresses the "developer tools" funding category defined in [CIP-0082](https://github.com/canton-foundation/cips/blob/main/cip-0082/cip-0082.md) and aligns with the milestone-based, CC-denominated funding model in [CIP-0100](https://github.com/canton-foundation/cips/blob/main/cip-0100/cip-0100.md).

### 4. Backward Compatibility

Cantool is a client-side development tool. It does not modify Canton protocol behavior, DAML semantics, or existing deployments. No backward compatibility impact.

---

## Milestones and Deliverables

### Milestone Validation Process

Each milestone will follow a three-stage validation process to ensure Cantool is not only functionally complete, but usable by the broader Canton ecosystem:

| Stage | Purpose | Validation Method |
|---|---|---|
| **Stage A: Delivery Review** | Confirm the milestone deliverables are implemented, documented, and released. | Source review, CI results, command demos, and documentation review. |
| **Stage B: External Beta Validation** | Confirm the workflow is usable by external developers in realistic conditions. | Structured feedback from external developers across at least 2 organizations where feasible, with follow-up revisions implemented before milestone close. |
| **Stage C: Completion Verification** | Confirm the revised workflow can be completed end-to-end without author intervention. | Re-run of the milestone workflow by external developers using the published docs and released binaries. |

To avoid milestone stalls, external feedback will be collected within a 2-week review window. If at least 3 external developer responses are received within that period, the milestone may proceed. The Canton Foundation or Tech & Ops Committee will be asked to help recruit external developers from the ecosystem; the grantee will coordinate the testing process, collect structured feedback, implement agreed revisions, and publish a short validation summary for each milestone.

### Milestone 1: Core Library, Scaffolding & Package Management

- **Estimated Delivery:** Month 3
- **Estimated Effort:** ~230 hours (~18 hrs/week × 13 weeks)
- **Focus:** Core Canton client library, project scaffolding, and DAML package management.
- **Sub-Milestones:**

| Stage | Timeframe | Description |
|---|---|---|
| **1A. Core Library** | Weeks 1-6 | Ledger API client, transaction submission/streaming, PQS queries, auth plumbing, and configuration management. |
| **1B. CLI Commands** | Weeks 7-10 | `cantool init`, `cantool config`, and `cantool package build/upload/inspect` with CI/CD and packaging. |
| **1C. Validation & Feedback** | Weeks 11-13 | External developer validation, feedback incorporation, and first Canton Developer Experience Report. |
- **Deliverables:**
  - Core Canton client library: Ledger API gRPC client, command submission, transaction streaming, PQS query support.
  - `cantool init` — Project scaffolding with Go templates, DAML project structure, Docker Compose configs for cn-quickstart, CI/CD templates (GitHub Actions). Extension points for additional language scaffolds (e.g., TypeScript) in future releases.
  - `cantool config` — Multi-environment configuration management (local/devnet/testnet/mainnet profiles).
  - `cantool package build` / `upload` / `inspect` — Wraps `dpm build` for compilation; adds `.dar` inspection, template ID extraction, and package upload to participant nodes.
  - Apache 2.0 licensed repository with CI/CD pipeline, README, and contributor guide.
  - Unit and integration test suite targeting >80% coverage on core library.
  - Milestone 1 validation summary based on external developer testing.
  - Canton Developer Experience Report #1, including any upstream issues or documentation gaps discovered in `cn-quickstart`, `dpm`, or `docs.canton.network`.
- **Acceptance Criteria:**
  - On a clean machine with documented prerequisites, `cantool init myproject && cd myproject && cantool package build` produces a compiled `.dar` file without manual intervention.
  - `cantool package upload` successfully deploys a `.dar` to a running cn-quickstart participant and confirms the upload via Ledger API query.
  - `cantool package inspect` outputs template IDs, choice signatures, and party roles for a given `.dar`.
  - Test suite passes in CI. Core library coverage ≥80%.
  - At least 3 external developers use the published instructions to scaffold and build a project with Cantool, and their structured feedback is summarized with any resulting revisions.
  - Any ecosystem bugs, missing docs, or workflow inconsistencies uncovered during implementation are filed upstream where appropriate and referenced in the milestone report.

### Milestone 2: Integration Testing Framework

- **Estimated Delivery:** Month 6
- **Estimated Effort:** ~230 hours
- **Focus:** Integration testing framework with local environment orchestration as a test harness.
- **Sub-Milestones:**

| Stage | Timeframe | Description |
|---|---|---|
| **2A. Test Harness** | Weeks 14-18 | `cantool up`, `cantool down`, `cantool status`, and core integration test runtime. |
| **2B. Test Patterns** | Weeks 19-23 | Contract lifecycle helpers, cookbook scenarios, CI execution, and parallel test isolation. |
| **2C. Validation & Feedback** | Weeks 24-26 | External test workflow validation, revisions, and second Developer Experience Report. |
- **Deliverables:**
  - `cantool test` — Integration testing framework with contract lifecycle helpers (create, exercise, archive, assert), party management, and event stream assertions.
  - `cantool up` / `cantool down` — Test harness environment management. Delegates to DevKit as primary backend when installed; falls back to minimal cn-quickstart Docker management otherwise.
  - `cantool status` — Environment health check (participant status, sync domain connectivity, PQS availability).
  - Test cookbook with 10+ example patterns: basic CRUD, multi-party workflows, authorization verification, non-consuming choices, error handling.
  - Milestone 2 validation summary based on external developer testing.
  - Canton Developer Experience Report #2, including upstream issues or documentation gaps found while standardizing integration testing workflows.
- **Acceptance Criteria:**
  - `cantool up` starts a multi-participant environment and `cantool status` reports all services healthy.
  - `cantool test` executes a sample suite that creates contracts, exercises choices, and verifies outcomes — with zero manual intervention after `cantool test run`.
  - Test cookbook scenarios all pass against a reference cn-quickstart environment in CI.
  - Testing framework supports parallel execution with isolated party namespaces, demonstrated by running 3+ test suites concurrently without interference.
  - At least 3 external developers run the integration testing workflow against a sample project and provide structured feedback on setup time, usability, and missing capabilities.
  - The milestone report includes a comparison of time-to-first-test using Cantool versus ad-hoc project scripting for the validation cohort.

### Milestone 3: Deployment Automation & MCP Server

- **Estimated Delivery:** Month 9
- **Estimated Effort:** ~230 hours
- **Focus:** Declarative deployment with state tracking and MCP integration.
- **Sub-Milestones:**

| Stage | Timeframe | Description |
|---|---|---|
| **3A. Deployment Workflows** | Weeks 27-31 | `cantool deploy`, environment state tracking, package versioning, and auth flows. |
| **3B. MCP Integration** | Weeks 32-36 | `cantool mcp`, agent-facing tools, inspection workflows, and integration testing with supported clients. |
| **3C. Validation & Feedback** | Weeks 37-39 | External validation of deployment and AI-assisted workflows, revisions, and third Developer Experience Report. |
- **Deliverables:**
  - `cantool deploy` — Declarative deployment with state tracking, package versioning, environment-specific configuration. Detects no-op redeploys.
  - `cantool mcp` — MCP server exposing scaffolding, package management, testing, and deployment as MCP tools.
  - `cantool inspect` — ACS viewer and transaction tree display respecting party visibility.
  - `cantool auth` — JWT/OAuth2 authentication flows for remote Canton participant access.
  - Milestone 3 validation summary based on external developer and agent-driven testing.
  - Canton Developer Experience Report #3, including any upstream issues or missing ecosystem affordances discovered while automating deployment and MCP workflows.
- **Acceptance Criteria:**
  - `cantool deploy` tracks deployed packages per environment, detects no-op redeploys, and persists state across invocations.
  - MCP server passes integration tests with Claude Desktop and Cursor: an AI agent can scaffold a project, build a package, and deploy it via MCP tools.
  - `cantool inspect` displays contract state and transaction trees filtered by party visibility.
  - `cantool auth` completes OAuth2 flow against a Keycloak instance and caches tokens for subsequent commands.
  - At least 3 external developers execute the documented deployment workflow and provide structured feedback on environment configuration, deployment clarity, and failure recovery.
  - At least one end-to-end MCP workflow is completed by an AI coding assistant from scaffold to build to deploy with zero human intervention after initial prompt setup, and the transcript/results are summarized in the milestone report.

### Milestone 4: Maintenance, Compatibility & Documentation

- **Estimated Delivery:** Month 12
- **Estimated Effort:** ~180 hours
- **Focus:** Compatibility with new Canton releases, documentation, and community onboarding.
- **Sub-Milestones:**

| Stage | Timeframe | Description |
|---|---|---|
| **4A. Compatibility & Hardening** | Weeks 40-44 | Release compatibility work, bug triage, and stabilization based on months 1-9 findings. |
| **4B. Docs & Tutorials** | Weeks 45-49 | Documentation site, command reference, tutorials, and plugin developer guide. |
| **4C. Validation & Follow-up Survey** | Weeks 50-52 | External tutorial walkthroughs, adoption follow-up survey, and final ecosystem report. |
- **Deliverables:**
  - Compatibility updates for Canton releases shipped during months 1–9. At least 2 verified compatibility updates.
  - Comprehensive documentation site: installation, quickstart, command reference, architecture guide.
  - Tutorial series: "Build Your First Canton App with Cantool" (3-part, scaffolding → testing → deployment).
  - Plugin extension points: documented architecture and hooks for third-party command extensions, with a developer guide for creating plugins.
  - Bug backlog triage: resolve or document all issues opened during months 1–9.
  - Tutorial series walkthrough-tested by at least 3 external developers.
  - Canton Developer Experience Report #4 summarizing friction removed, remaining gaps, and upstream ecosystem recommendations.
  - Lightweight Cantool user follow-up survey measuring whether the original developer-experience pain points were reduced for adopters.
- **Acceptance Criteria:**
  - Cantool passes its full test suite against the latest Canton release available at month 12.
  - Documentation site is published and covers all commands with examples.
  - Tutorial series is end-to-end executable: a committee reviewer can follow the tutorial from step 1 to a deployed application without undocumented steps.
  - Plugin developer guide describes extension points and includes a skeleton example.
  - At least 3 external developers complete the tutorial series end-to-end using published docs and binaries, with feedback incorporated into the final release.
  - The final report summarizes survey responses, external developer feedback, and the specific developer-experience improvements achieved over the grant period.

---

## Acceptance Criteria

In addition to the per-milestone criteria above, the Tech & Ops Committee will evaluate overall completion based on:

- All CLI commands work against both local cn-quickstart and remote Canton participant endpoints.
- Test suite passes in CI across macOS, Linux, and Windows.
- Documentation is sufficient for a developer to install Cantool and complete a Canton project from scaffolding to deployment without external support.
- Each milestone includes a published validation summary covering external tester feedback, revisions made, and any upstream issues or documentation gaps identified during delivery.

---

## Funding

**Total Funding Request:** 1,875,000 CC (~$300,000 USD at $0.16/CC)

### Payment Breakdown by Milestone

| Milestone | CC | USD Equivalent |
|---|---|---|
| M1: Core Library, Scaffolding & Packages | 531,250 CC | $85,000 |
| M2: Integration Testing Framework | 531,250 CC | $85,000 |
| M3: Deployment & MCP | 500,000 CC | $80,000 |
| M4: Maintenance, Compat & Docs | 312,500 CC | $50,000 |
| **Total** | **1,875,000 CC** | **$300,000** |

### Budget Justification

The grant funds a 12-month senior contractor engagement at $25,000/month — inclusive of LLC overhead, self-employment taxes, health insurance, equipment, and risk buffer. This is the full cost of the engagement; there are no employer benefits, team coordination overhead, or institutional margin.

If the Tech & Ops Committee prefers staged approval, the project can also be funded in two phases: M1-M2 as the initial implementation tranche, with M3-M4 continuing after the committee reviews adoption evidence, external developer feedback, and the maturity of the delivered foundation.

| Category | Approximate Cost |
|---|---|
| Senior contractor engagement (12 months at ~$25K/month) | $260,000 |
| Infrastructure (CI/CD, hosting, test environments) | $15,000 |
| Documentation, design, and community | $25,000 |
| **Total** | **$300,000** |

### Volatility Stipulation

The grant is denominated in fixed Canton Coin. As the project duration exceeds 6 months, the proposal will be subject to re-evaluation at the 6-month mark to account for material CC/USD price volatility, in line with CIP-0100 governance guidelines. If the CC/USD exchange rate changes by more than 30% in either direction from the rate at the time of approval, remaining milestone amounts may be renegotiated by mutual agreement between the recipient and the Tech & Ops Committee.

---

## Co-Marketing

Upon release of major components, the implementing entity will collaborate with the Canton Foundation on:

- Coordinated announcement for each milestone release.
- Technical blog post or case study on Canton developer experience improvements.
- Participation in developer-focused promotion: workshops, hackathons, or webinars.

---

## Motivation

The [Canton Network Developer Experience and Tooling Survey (2026)](https://discuss.daml.com/t/canton-network-developer-experience-and-tooling-survey-analysis-2026/8412) makes the case directly: developers spend their time fighting infrastructure instead of building applications, and the survey's authors explicitly encourage builders to submit Development Fund proposals to address these gaps.

Mature smart contract ecosystems demonstrate that unified developer tooling is a prerequisite for ecosystem growth. Ethereum's application ecosystem accelerated after [Hardhat](https://hardhat.org/) and [Foundry](https://www.getfoundry.sh/) reduced the friction of building, testing, and deploying contracts. Solana saw similar effects with [Anchor](https://www.anchor-lang.com/). Canton's protocol is production-ready, but the application developer experience lags behind — and 80% of the current developer base arrived in the last 12 months. The onboarding window is now.

Cantool supports the Development Fund's mandate under [CIP-0082](https://github.com/canton-foundation/cips/blob/main/cip-0082/cip-0082.md) to fund "dev tools" as a common good for the Canton ecosystem.

---

## Rationale

**Why a single CLI tool?** Fragmented tools create integration burden and inconsistent workflows. A unified tool with a shared configuration model and Canton client library ensures commands compose naturally — the pattern that succeeded for Hardhat, Anchor, and Foundry.

**Why Go?** Single static binary with no runtime dependencies. Strong gRPC support for Ledger API. Mature CLI framework (Cobra). Cross-platform distribution (macOS, Linux, Windows) is trivial.

**Why MCP?** The [Model Context Protocol](https://modelcontextprotocol.io/) is the emerging standard interface between AI coding assistants and development tools. Exposing Cantool's capabilities via MCP means any compatible agent can scaffold, test, and deploy Canton applications. No other Canton tool provides this.

**Why not extend existing tools?** DPM covers DAML compilation and a single-process sandbox. DevKit ([PR #18](https://github.com/canton-foundation/canton-dev-fund/pull/18)) covers Splice LocalNet orchestration. Neither addresses the application-level lifecycle: scaffolding, package management with dependency resolution, multi-participant integration testing, declarative deployment with state tracking, or MCP. A new tool that delegates to existing tools where appropriate is cleaner than forcing architectural changes onto tools built for different purposes.

---

## Applicant Background

**Eric Mann** is a senior engineer with production Canton application development experience spanning Ledger API v2 gRPC integrations, PQS-backed application queries, cn-quickstart Docker environments, Canton Enterprise deployments, DAML smart contract development, JWT and Keycloak-based authentication flows, Go/Temporal service architecture, and HSM-backed key management (GCP KMS with P-256/ECDSA) for institutional systems. He has already built internal Canton CLI tooling covering Ledger API operations, DAML package management, authentication, configuration, and environment management; Cantool is a productization of working patterns from that code, not a speculative greenfield design.

This experience mirrors the findings of the 2025 Canton developer survey: a disproportionate amount of early project time is spent fighting infrastructure, environment setup, and bespoke scripting before application work begins. Cantool is designed to remove exactly those sources of friction by turning proven internal workflows into reusable public tooling.

**Displace Technologies LLC** is a registered Oregon LLC serving as the contracting entity. This is a solo-engineer engagement; the budget assumes and is sized for one senior engineer. If unforeseen circumstances require additional capacity, Displace Technologies can engage contract engineers at its own expense. All deliverables will be released under Apache 2.0 license.

---

## Security and Scalability Implications

- **No custody of funds**: Cantool never holds or transacts with CC or any digital assets.
- **Authentication**: Delegates to the Canton participant's identity provider. Stores only session tokens locally with appropriate file permissions.
- **Supply chain security**: Go module system with checksum database. All dependencies audited and pinned.
- **No network risk**: Client to existing Canton infrastructure. MCP server is localhost-only by default.

---

## Long-Term Maintenance

- **Funded maintenance (M4)**: Milestone 4 explicitly covers compatibility updates, bug triage, and ongoing Canton release support through month 12.
- **Post-grant commitment**: 6-month post-grant maintenance for critical bug fixes and compatibility updates.
- **Community governance**: Apache 2.0 license ensures the tool remains open and forkable regardless of the author's continued involvement.
- **Extensibility**: Documented extension points enable third-party command plugins, reducing long-term maintenance burden by keeping protocol-specific functionality in separate repositories. Should the original maintainer become unavailable, the documented codebase and extension architecture allow the Core Contributors Group to continue maintenance at the funded level.

---

## Distribution

- **Homebrew tap**, GitHub Releases (prebuilt binaries for macOS/Linux/Windows), Docker image, `go install`
- GSF Application Developer Slack, Canton Foundation channels, GitHub Discussions
- Launch blog post, tutorial series, demo videos for each milestone