## Development Fund Proposal

**Author:** Eric Mann, Displace Technologies LLC  
**Status:** Submitted  
**Created:** 2026-03-12  
**Updated:** 2026-05-18  

---

## Abstract

**Cantool** is an open-source Go CLI for Canton application developers. v0.1.0 shipped on April 1, 2026 as a self-funded alpha validating the architecture: project scaffolding, an MCP server proof of concept, and a plugin system proof of concept — all as a single statically-linked binary with zero runtime dependencies.

This proposal funds four Cantool capabilities focused on application-layer developer workflows:

1. **Opinionated scaffolding and community templates** — versioned templates, reference templates and authoring conventions for community contribution, starter library for common Canton app patterns
2. **MCP server** — full Ledger API tool coverage, resource definitions, Streamable HTTP transport, multi-tool integration testing, AI assistant integration
3. **Plugin system** — full lifecycle management, reference SDK, documented conventions for community plugin authoring, lifecycle hooks, reference plugin
4. **OCI component for dpm integration** - Cantool published as both a standalone binary and as an OCI-distributed component compatible with dpm's component model, providing a single entry point for users who prefer dpm's CLI namespace while preserving Cantool's independent release cycle.

Canton application developers today assemble ad-hoc scripts, manually extract template IDs from `.dar` files, and write one-off test harnesses. Cantool addresses the application-layer workflow gaps around project scaffolding, AI-assisted development workflows, and ecosystem integration.

---

## Current Status

**Cantool v0.1.0 alpha** was published on April 1, 2026 ([release](https://github.com/DisplaceTech/Cantool/releases/tag/v0.1.0)). The alpha ships as a Go-based single statically-linked binary with zero runtime dependencies.

The v0.1.0 alpha validates the architecture for the three command groups that the grant deepens into production-ready capabilities:

| Command | v0.1.0 Status | Funded Milestone |
|---|---|---|
| `cantool init` | Basic project scaffolding with embedded templates | M1 — Template system, community conventions, starter library |
| `cantool mcp serve` | Proof of concept (stdio transport) | M2 — Full Ledger API tools, resources, Streamable HTTP |
| `cantool plugin list` | Plugin discovery (JSON-RPC over stdio) | M3 — Full lifecycle, SDK, hooks, authoring conventions |

The alpha was self-funded to demonstrate execution capability and validate the architecture. It is a **proof of architecture**, not a production release — significant hardening, documentation, and feature work remains before the funded capabilities are production-ready.

This self-funded work establishes the working foundation from which the funded milestones below proceed.

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

#### Funded Greenfield Capabilities

**Project Scaffolding and Community Templates (`cantool init`)** — Generates a buildable Canton project structure with opinionated defaults: DAML source directories, application code scaffold (Go initially, with extension points for additional language templates), Docker Compose configuration for cn-quickstart, CI/CD templates, and environment-specific configuration via direnv. The funded scope deepens this into a full template system: versioned template spec, `cantool init --from <github-url>` for fetching community-hosted templates, template validation, a starter library of templates covering common Canton app patterns (token, marketplace, multi-party workflow), and a documented convention for authoring and sharing community templates. The deliverable is patterns, reference templates, and best-practices documentation — not a hosted registry or marketplace.

**MCP Server (`cantool mcp`)** — Exposes Canton development capabilities through the Model Context Protocol, enabling AI coding assistants to scaffold projects, query contract state, manage parties, and inspect participant-visible package metadata needed for application workflows. The v0.1.0 proof of concept provides stdio transport; funded work delivers full Ledger API tool coverage (contract queries, party management, participant-visible package metadata), resource definitions for contracts/parties/packages, Streamable HTTP transport for remote and browser-based integration, multi-tool integration testing, and documentation for AI assistant integration.

**Plugin System (`cantool plugin`)** — Cantool's plugin system uses JSON-RPC over stdio — a language-agnostic protocol that allows plugins written in any language to extend the CLI. The v0.1.0 proof of concept provides plugin discovery; funded work delivers full lifecycle management (`cantool plugin list/install/remove`), a reference plugin SDK (Go + one additional language), documented conventions for plugin authoring and distribution, lifecycle hooks (pre-build, post-deploy, etc.), and a reference plugin demonstrating the full interface. As with templates, the deliverable is patterns and documentation for community plugin authors — not a hosted plugin registry.

**OCI Component for dpm Integration** (`cantool` as dpm component) — Cantool published as an OCI-distributed component compatible with dpm's component manifest schema, enabling users to access Cantool's capabilities through dpm's command namespace. The OCI component wraps the same Cantool binary distributed through standalone channels (Homebrew, GitHub Releases, `go install`), giving users a single entry point through dpm while preserving Cantool's independent release cycle, governance, and contribution model. The v0.1.0 binary architecture supports this packaging; funded work delivers the component manifest, OCI publishing pipeline, integration testing against dpm, and end-user documentation covering both usage patterns.

#### Technology Stack

- **Language**: Go (single binary, strong gRPC support for Ledger API, Cobra CLI framework)
- **Canton Integration**: Ledger API (gRPC), PQS (PostgreSQL)
- **Authentication**: Keycloak, Google OAuth, JWT
- **Local Environment**: Docker/Docker Compose (cn-quickstart)
- **Configuration**: direnv, YAML/TOML manifests
- **MCP**: Model Context Protocol SDK for Go

#### Relationship to Existing Tooling

Cantool is **complementary** to existing and proposed Canton tools. Each tool owns a distinct domain; there is no overlapping scope. The diagram below shows the relationship between tools and the boundaries of each tool's responsibility.

##### Ecosystem positioning

![Canton ecosystem — Cantool, dpm, and DevKit each cover a distinct developer surface with no overlapping scope](./cantool_ecosystem.svg)

##### Comparison with existing and proposed tooling

| Existing / Proposed Tool | What it does | Cantool relationship |
|---|---|---|
| **dpm** (Digital Asset) | SDK management, Daml build/test/codegen, single-process sandbox (`dpm sandbox`), SDK version management, Daml Studio | No overlapping scope. SDK version management, Daml compilation, code generation, testing, and IDE integration are entirely **dpm**'s domain. Cantool covers capabilities dpm does not provide: scaffolding, MCP, and plugins. Cantool will additionally publish as an OCI-distributed component compatible with dpm's component model, giving dpm users a single entry point to Cantool's capabilities. |
| **Canton DevKit** ([PR #18](https://github.com/canton-foundation/canton-dev-fund/pull/18)) | LocalNet lifecycle management (Splice Docker stack), version pinning, named instances, snapshot/restore, observability dashboards, Web UI, CIP-56 token tooling | No overlapping scope. DevKit manages the **Splice LocalNet Docker stack** as an infrastructure product. Cantool's scope is scaffolding, MCP, and plugins — not LocalNet management. |
| **dpm DevKit** ([PR #105](https://github.com/canton-foundation/canton-dev-fund/pull/105)) | Additive extensions to **dpm**: Cargo-style dependency management with lockfiles and version pinning, package and interface discovery against running Canton environments, documentation extraction from DAR metadata, transaction tracing and diagnostics, and AI-assisted debugging skills operating on **dpm** trace outputs | No overlapping scope. PR #105 extends **dpm** with dependency management (`dpm pkg discover`, `dpm docs`, `dpm trace`), lockfile conventions, and built-in AI diagnostic skills that analyze trace outputs. Cantool provides project scaffolding, an MCP server for external AI assistants, and a plugin system. Where Cantool surfaces package metadata, it is only participant-visible metadata needed inside application workflows and AI integrations, not dependency management, lockfiles, or package discovery as a product surface. |
| **Daml Code Assistant** ([PR #10](https://github.com/canton-foundation/canton-dev-fund/pull/10)) | AI/ML fine-tuned models for Daml code generation | No overlapping scope. The Code Assistant helps developers **write Daml**. Cantool helps developers **scaffold, configure, and operate application workflows** that consume compiled Daml packages — different lifecycle stages. Cantool's MCP server could serve as an integration surface for future Code Assistant capabilities. |

### 3. Architectural Decisions

Cantool's architecture reflects deliberate choices optimized for Canton's institutional user base:

**Single Binary, Zero Runtime Dependencies (Go)**  
Canton's target users — regulated financial institutions, government agencies, and enterprise IT departments — operate in environments with locked-down package managers, restricted network access, and air-gapped deployment zones. A single statically-linked Go binary with zero runtime dependencies can be deployed by copying a file. No Python virtualenvs, no Node.js version managers, no JVM classpaths. This is not a convenience — it is a deployment requirement for institutional environments where installing a toolchain dependency requires a security review.

**Native MCP Server**  
Cantool is the first Canton development tool to integrate the [Model Context Protocol](https://modelcontextprotocol.io/), enabling AI coding assistants to scaffold projects, query contract state, manage parties, and inspect participant-visible package metadata through a standardized protocol interface. As AI-assisted development becomes standard practice, native MCP support positions Canton's toolchain alongside ecosystems that already offer programmatic tool access.

**Plugin Architecture (JSON-RPC over stdio)**  
Cantool's plugin system uses JSON-RPC over stdio — a language-agnostic protocol that allows plugins written in any language to extend the CLI. This architecture was baked into v0.1.0 rather than bolted on after the fact. Plugins run as separate processes with well-defined interfaces, enabling third-party extensions without requiring changes to the core binary or coordination with the core maintainer.

**Dual Distribution (Standalone + OCI Component)**
Cantool ships as a standalone statically-linked binary and as an OCI-distributed component compatible with dpm's component model. The standalone binary remains the canonical artifact for users who prefer Cantool as an independent tool; the OCI component provides a single entry point for users who prefer dpm's command namespace. Both surfaces wrap the same binary and follow the same release cycle. This dual distribution model addresses ecosystem coherence concerns about tool fragmentation while preserving Cantool's independent architecture, governance, and release timing.

### 4. Architectural Alignment

Cantool is designed around Canton's architectural properties as described in the [Canton Network White Paper](https://canton.network/publications/canton-network-whitepaper.pdf):

- **Party-centric operations**: Commands operate in the context of a configured party identity, reflecting Canton's party-centric ledger model.
- **Sub-transaction privacy**: Test assertions respect visibility boundaries — tests verify that parties see only what they should see.
- **UTXO-style contract model**: The testing framework provides helpers for contract lifecycle (create → exercise → archive), not state mutation.
- **PQS for reads, Ledger API for writes**: Cantool separates query patterns (PQS) from command submission (Ledger API), encoding the canonical Canton data access pattern.

This proposal addresses the "developer tools" funding category defined in [CIP-0082](https://github.com/canton-foundation/cips/blob/main/cip-0082/cip-0082.md) and aligns with the milestone-based, CC-denominated funding model in [CIP-0100](https://github.com/canton-foundation/cips/blob/main/cip-0100/cip-0100.md).

### 5. Backward Compatibility

Cantool is a client-side development tool. It does not modify Canton protocol behavior, DAML semantics, or existing deployments. No backward compatibility impact.

---

## Milestones and Deliverables

### Milestone Validation Process

Each milestone will follow a three-stage validation process to ensure Cantool is not only functionally complete, but usable by the broader Canton ecosystem:

| Stage | Purpose | Validation Method |
|---|---|---|
| **Stage A: Delivery Review** | Confirm the milestone deliverables are implemented, documented, and released. | Source review, CI results, command demos, and documentation review. |
| **Stage B: External Beta Validation** | Confirm the workflow is usable by external developers in realistic conditions. | Structured feedback from external developers across at least 2 organizations, with follow-up revisions implemented before milestone close. |
| **Stage C: Completion Verification** | Confirm the revised workflow can be completed end-to-end without author intervention. | Re-run of the milestone workflow by external developers using the published docs and released binaries. |

To avoid milestone stalls, external feedback will be collected within a 2-week review window. If at least 3 external developer responses are received within that period, the milestone may proceed. The Canton Foundation or Tech & Ops Committee will be asked to help recruit external developers from the ecosystem; the grantee will coordinate the testing process, collect structured feedback, implement agreed revisions, and publish a short validation summary for each milestone. Each validation summary will include specific upstream issues filed against relevant Canton ecosystem repositories (`cn-quickstart`, `dpm`, `docs.canton.network`, etc.) for bugs, missing documentation, or workflow inconsistencies discovered during implementation.

### Alpha Release (Self-Funded, Complete)

- **Delivered:** April 1, 2026
- **Status:** Complete
- **Funding:** Self-funded
- **Deliverables:**
  - Cantool v0.1.0 alpha release: core command groups (`init`, `mcp serve`, `plugin list`).
  - Go single-binary architecture validated.
  - Apache 2.0 licensed repository with CI pipeline.
  - MCP server proof of concept (stdio transport).
  - Plugin system proof of concept (JSON-RPC over stdio).

### Milestone 1: Scaffolding and Community Templates

- **Estimated Delivery:** Month 1-2 (Weeks 1–8)
- **Funding:** 250,000 CC
- **Focus:** Deepening `cantool init` into a production-grade scaffolding system with versioned templates, documented conventions for community template authoring, and a starter library of Canton app patterns.
- **Sub-Milestones:**

| Stage | Timeframe | Description |
|---|---|---|
| **1A. Template Engine and Versioned Spec** | Weeks 1–3 | Refactor embedded templates into a versioned template specification. Implement template validation (schema checks, required files, metadata). Support parameterized templates with user prompts (project name, party names, target SDK version). |
| **1B. Community Template Conventions and Starter Library** | Weeks 4–7 | `cantool init --from <github-url>` fetches, validates, and scaffolds from community-hosted template repositories. Template discovery conventions (README badges, topic tags). Template authoring guide and contributor documentation. Starter template library: token contract, marketplace, multi-party workflow. |
| **1C. Validation and Release Hardening** | Weeks 7-8 | External developer validation of scaffolding workflows. Integration test suite for template engine. CI pipeline hardened: cross-platform builds (macOS, Linux, Windows), integration test gate, release automation. Milestone 1 validation summary. |

- **Deliverables:**
  - Versioned template specification with schema validation and metadata requirements.
  - Template engine supporting parameterized scaffolding (project name, party configuration, SDK version targeting).
  - `cantool init --from <github-url>` — community template fetching with validation against the template spec.
  - Starter template library: token contract scaffold, marketplace scaffold, multi-party workflow scaffold — each producing a buildable project with DAML source, application code, Docker Compose config, and CI/CD templates.
  - Template authoring guide: how to create, validate, and publish community templates.
  - Template discovery conventions: GitHub topic tags, README badges, and listing format for community templates.
  - Integration test suite for the template engine running against real Canton sandbox environments.
  - CI pipeline hardened: cross-platform builds, integration test gate, release automation.
  - Milestone 1 validation summary based on external developer testing, including upstream issues or documentation gaps discovered during implementation.
- **Acceptance Criteria:**
  - `cantool init` scaffolds a buildable project from each starter template (token, marketplace, multi-party workflow) that compiles with `dpm build` without modification.
  - `cantool init --from <github-url>` successfully fetches and scaffolds from a community template repository, with validation errors reported for non-conforming templates.
  - Template spec is versioned and documented; a third-party developer can author a conforming template using only the published guide.
  - Integration test suite passes against a real Canton sandbox — no mocked Canton services in the critical path.
  - At least 3 external developers complete the scaffolding workflow (including community template usage) without author intervention, and their structured feedback is summarized with resulting revisions.
  - Any ecosystem bugs, missing docs, or workflow inconsistencies uncovered during implementation are filed as issues against the relevant upstream repositories and referenced in the milestone report.

### Milestone 2: MCP Server

- **Estimated Delivery:** Month 2-3 (Weeks 9–16)
- **Funding:** 350,000 CC
- **Focus:** Deepening the v0.1.0 MCP proof of concept into a production-grade MCP server with full Ledger API tool coverage, resource definitions, Streamable HTTP transport, and AI assistant integration documentation.
- **Sub-Milestones:**

| Stage | Timeframe | Description |
|---|---|---|
| **2A. Full Ledger API Tool Coverage** | Weeks 9-12 | MCP tools for contract queries (active contracts, contract history, template filtering), party management (allocate, list, describe), and participant-visible package metadata needed for application workflows (list packages exposed by a connected participant, extract template IDs, DAR metadata where available). Structured tool schemas with typed inputs/outputs. |
| **2B. Resources, Transport, and Integration Testing** | Weeks 12-15 | MCP resource definitions for contracts, parties, and packages. Streamable HTTP transport for remote and browser-based AI assistant integration. Multi-tool integration test suite verifying tool composition (e.g., scaffold → inspect → query workflow via MCP). PQS integration for efficient contract state queries. |
| **2C. Documentation and Validation** | Weeks 15-16 | Integration guide for AI coding assistants (Claude, Cursor, Codex) using Cantool's MCP server. Agent-driven end-to-end test: single natural-language prompt completes scaffold → connect → query workflow. External developer validation. Milestone 2 validation summary. |

- **Deliverables:**
  - MCP tools for contract queries: active contract listing, contract history, template-based filtering, contract detail retrieval.
  - MCP tools for party management: party allocation, listing, description, and party-scoped queries.
  - MCP tools for participant-visible package metadata: package listing from connected participants, template ID extraction, and DAR metadata inspection where exposed by the underlying APIs.
  - MCP resource definitions: contracts, parties, and packages exposed as MCP resources with appropriate URIs and metadata.
  - Streamable HTTP transport for the MCP server, enabling remote and browser-based AI assistant integration alongside the existing stdio transport.
  - PQS integration for efficient contract state queries via MCP tools.
  - Multi-tool integration test suite verifying tool composition across at least two AI coding assistants.
  - Integration guide for AI coding assistants (Claude, Cursor, Codex) with worked examples and configuration templates.
  - Agent-driven end-to-end validation: transcript demonstrating a single natural-language prompt completing the full scaffold → connect → query workflow via MCP tools.
  - Milestone 2 validation summary based on external developer and agent-driven testing.
  - Milestone 2 validation summary, including upstream issues found while building MCP integration against the Ledger API.
- **Acceptance Criteria:**
  - MCP server exposes contract query, party management, and participant-visible package metadata tools — verified by integration tests with at least two AI coding assistants.
  - MCP server supports both stdio and Streamable HTTP transports.
  - MCP resource definitions for contracts, parties, and packages resolve correctly and return structured data consistent with direct Ledger API queries.
  - PQS queries return contract state consistent with Ledger API for a reference test suite.
  - Given a single natural-language prompt, an AI coding assistant completes the full scaffold → connect → query workflow via MCP tools without further human input, and the transcript/results are summarized in the milestone report.
  - Integration guide is end-to-end executable: a developer can configure an AI assistant to use Cantool's MCP server by following the published guide without undocumented steps.
  - At least 3 external developers complete the MCP integration guide and verify tool functionality, with feedback incorporated before milestone close.

### Milestone 3: Plugin System

- **Estimated Delivery:** Month 4-5 (Weeks 17–20)
- **Funding:** 250,000 CC
- **Focus:** Deepening the v0.1.0 plugin proof of concept into a production-grade plugin system with full lifecycle management, a Go reference SDK, documented authoring conventions, lifecycle hooks, and a reference plugin.
- **Sub-Milestones:**

| Stage | Timeframe | Description |
|---|---|---|
| **3A. Plugin Lifecycle and Authoring Conventions** | Weeks 17-18 | `cantool plugin install <url>` / `cantool plugin remove <name>` — full lifecycle management. Documented conventions for plugin naming, versioning, and GitHub-based distribution. Plugin manifest spec (capabilities, hooks, dependencies). Plugin sandboxing and permission model. |
| **3B. Go SDK, Hooks, and Reference Plugin** | Weeks 18-19 | Reference plugin SDK in Go. Lifecycle hooks: pre-build, post-build, pre-deploy, post-deploy, pre-test, post-test. Reference plugin demonstrating the full interface (e.g., a deployment notification plugin or a custom linter plugin). Plugin authoring guide and contributor documentation. |
| **3C. Validation and Release Hardening** | Weeks 19-20 | External developer validation of plugin authoring and installation workflows. Plugin packaging and install flow hardened. Milestone 3 validation summary. |

- **Deliverables:**
  - `cantool plugin install <url>` / `cantool plugin remove <name>` — full plugin lifecycle management with version pinning.
  - Documented conventions for plugin authoring and distribution: naming conventions, versioning scheme, GitHub-based discovery patterns, and best-practices guide.
  - Plugin manifest specification: declared capabilities, lifecycle hook subscriptions, dependency requirements, and compatibility constraints.
  - Plugin sandboxing and permission model: plugins declare required permissions; Cantool enforces boundaries.
  - Reference plugin SDK in Go: scaffolding, JSON-RPC handler generation, hook registration, and testing utilities.
  - Lifecycle hooks: pre-build, post-build, pre-deploy, post-deploy, pre-test, post-test — plugins can subscribe to any combination.
  - Reference plugin demonstrating the full interface: manifest, hooks, permissions, and hook invocation.
  - Plugin authoring guide: how to create, test, publish, and version plugins using the Go SDK.
  - Published reference plugin exercising the full plugin interface.
  - Milestone 3 validation summary based on external developer testing.
  - Milestone 3 validation summary includes any upstream issues found while building the plugin system.
- **Acceptance Criteria:**
  - `cantool plugin install <url>` installs a plugin and `cantool plugin remove <name>` cleanly uninstalls it, with version pinning respected.
  - A third-party developer can author a plugin using only the published SDK and authoring guide, without reading Cantool's source code.
  - Lifecycle hooks fire correctly: a plugin subscribed to pre-deploy and post-deploy hooks receives invocations at the correct points in the deployment workflow.
  - The reference plugin passes its own test suite and demonstrates manifest declaration, hook subscription, permission enforcement, and invocation through the Go SDK.
  - The reference plugin is published and installable via `cantool plugin install`.
  - At least 3 external developers complete the plugin authoring workflow, and their structured feedback is summarized with resulting revisions.

### Milestone 4: OCI Component and dpm Integration

- **Estimated Delivery:** Month 6 (weeks 21-24)
- **Funding:** 150,000 CC
- **Focus:** Packaging Cantool as an OCI-distributed component compatible with dpm's component model, enabling users to access Cantool capabilities through dpm's command namespace while preserving Cantool's independent release cycle.
- **Sub-Milestones:**

| Stage | Timeframe | Description |
|---|---|---|
| **4A. Component Manifest and OCI Packaging** | Weeks 21-22 | Author `component.yaml` declaring Cantool's command surface for dpm exposure. Build OCI publishing pipeline (GitHub Actions workflow) to produce versioned component artifacts from the same source as the standalone binary. Establish versioning conventions that track standalone Cantool releases. |
| **4B. Integration Testing and Documentation** | Weeks 23-24 | Integration test suite verifying the component installs and operates correctly within dpm against multiple dpm versions. End-user documentation covering both standalone Cantool usage and Cantool-via-dpm usage, including configuration guidance for users who want to invoke Cantool through dpm's namespace. Coordination with dpm maintainers as needed to verify compatibility. |

- **Deliverables:**
  - Published OCI component (e.g., `ghcr.io/displacetech/cantool:v1.0.0`) compatible with dpm's component manifest schema, distributed via GitHub Container Registry.
  - `component.yaml` declaring Cantool's commands for dpm namespace exposure, with versioning aligned to standalone Cantool releases.
  - OCI publishing pipeline integrated with Cantool's existing release process, so each Cantool release produces both standalone and component artifacts.
  - Integration test suite running against dpm component invocation, verifying command parity between standalone and dpm-namespaced invocation.
  - End-user documentation covering installation, configuration, and usage of Cantool both standalone and through dpm.
  - Milestone 4 validation summary based on external developer testing of both usage patterns.
- **Acceptance Criteria:**
  - A dpm user can install the Cantool OCI component and invoke Cantool commands through dpm's namespace without separate Cantool installation steps.
  - Cantool capabilities are at parity between standalone and dpm-namespaced invocation (commands, flags, behavior).
  - The OCI component is independently versioned and released by Displace Technologies, with release artifacts published to a publicly accessible OCI registry.
  - End-user documentation is end-to-end executable for both installation paths.
  - At least 3 external developers verify both usage patterns and provide structured feedback.

### Post-Milestone Maintenance

Following delivery of Milestone 4, ongoing maintenance — bug fixes, Canton SDK compatibility updates, and security patches — is estimated at ~100,000 CC/quarter. A maintenance proposal will be submitted separately after Milestones 1–4 are complete, informed by the actual support burden observed during the funded period.

---

## Acceptance Criteria

In addition to the per-milestone criteria above, the Tech & Ops Committee will evaluate overall completion based on:

- All funded CLI commands work against both local Canton sandbox and remote Canton participant endpoints.
- Test suite passes in CI across macOS, Linux, and Windows.
- Documentation is sufficient for a developer to install Cantool and complete a Canton project from scaffolding through a participant-connected workflow without external support.
- Each milestone includes a published validation summary covering external tester feedback, revisions made, and any upstream issues or documentation gaps identified during delivery.
- Validation summaries will be published as part of the milestone deliverables and made available to the Tech & Ops Committee before milestone payment is triggered.

---

## Funding

**Base Funding Request:** 1,000,000 CC (~$150,000 USD at $0.15/CC)  
**Early Completion Bonus:** 100,000 CC (~$15,000 USD) if all four milestones are delivered and accepted within 16 weeks (4 months)  
**Maximum Total:** 1,100,000 CC (~$165,000 USD at $0.15/CC)

### Payment Breakdown by Milestone

| Milestone | CC | USD Equivalent | Timeframe | Status |
|---|---|---|---|---|
| Alpha: Architecture Validation (self-funded) | — | — | Complete | ✓ Complete |
| M1: Scaffolding and Community Templates | 250,000 CC | $37,500 | Weeks 1–8 | Funded |
| M2: MCP Server | 350,000 CC | $52,500 | Weeks 9-16 | Funded |
| M3: Plugin System | 250,000 CC | $37,500 | Weeks 17–20 | Funded |
| M4: OCI Component and dpm Integration | 150,000 CC | $22,500 | Weeks 21–24 | Funded |
| **Base total (funded)** | **1,000,000 CC** | **$150,000** | **6 months** | |

### Early Completion Bonus

An additional **100,000 CC** bonus is requested if **all four funded milestones are delivered and accepted within 16 weeks (4 months)** of grant approval. This reflects the value of accelerated ecosystem availability and is consistent with the early completion incentive structure approved in [PR #53](https://github.com/canton-foundation/canton-dev-fund/pull/53) (20% bonus) and [PR #76](https://github.com/canton-foundation/canton-dev-fund/pull/76) (10–20% bonus). The 100,000 CC bonus represents a 10% acceleration premium against the base ask.

### Budget Justification

Milestone budgets reflect senior engineering delivery on a per-deliverable basis, including design, build, validation, documentation, and release engineering. Displace Technologies may engage contract engineers to accelerate delivery; total spend across the engagement reflects market rates for senior Canton and Go consulting work, with appropriate margin for principal oversight, CC/USD volatility risk over the delivery period, and ecosystem coordination activities (committee communication, external developer validation, milestone reporting).

### Volatility Stipulation

The grant is denominated in fixed Canton Coin. If the CC/USD exchange rate changes by more than 30% in either direction from the rate at the time of approval prior to milestone payment, remaining milestone amounts may be renegotiated by mutual agreement between the recipient and the Tech & Ops Committee.

---

## Co-Marketing

Upon release of major components, the implementing entity will collaborate with the Canton Foundation on:

- Coordinated announcement for each milestone release.
- Technical blog post or case study on Canton developer experience improvements.
- Lightweight release amplification through existing Canton Foundation channels when appropriate.

---

## Motivation

The [Canton Network Developer Experience and Tooling Survey (2026)](https://discuss.daml.com/t/canton-network-developer-experience-and-tooling-survey-analysis-2026/8412) makes the case directly: developers spend their time fighting infrastructure instead of building applications, and the survey's authors explicitly encourage builders to submit Development Fund proposals to address these gaps.

Mature smart contract ecosystems demonstrate that unified developer tooling is a prerequisite for ecosystem growth. Ethereum's application ecosystem accelerated after [Hardhat](https://hardhat.org/) and [Foundry](https://www.getfoundry.sh/) reduced the friction of building, testing, and deploying contracts. Solana saw similar effects with [Anchor](https://www.anchor-lang.com/). Canton's protocol is production-ready, but the application developer experience lags behind — and 80% of the current developer base arrived in the last 12 months. The onboarding window is now.

Cantool supports the Development Fund's mandate under [CIP-0082](https://github.com/canton-foundation/cips/blob/main/cip-0082/cip-0082.md) to fund "dev tools" as a common good for the Canton ecosystem.

---

## Rationale

**Why a focused CLI tool?** Fragmented scripts create integration burden and inconsistent application workflows. Cantool provides a shared configuration model and Canton client library for the specific application-layer tasks it owns: scaffolding, AI integration, and extensibility. It is intentionally narrower than an ecosystem-wide front door.

**Why Go?** Single static binary with no runtime dependencies. Strong gRPC support for Ledger API. Mature CLI framework (Cobra). Cross-platform distribution (macOS, Linux, Windows) is trivial.

**Why MCP?** The [Model Context Protocol](https://modelcontextprotocol.io/) is the emerging standard interface between AI coding assistants and development tools. Exposing Cantool's capabilities via MCP means any compatible agent can scaffold projects, inspect participant-connected state, and drive application workflows against running Canton environments. No other Canton tool provides this.

**Why not extend existing tools?** **dpm** covers Daml compilation, SDK workflows, and a single-process sandbox; [PR #105](https://github.com/canton-foundation/canton-dev-fund/pull/105) proposes **dpm**-native dependency lockfiles, discovery, docs, and trace-driven diagnostics. DevKit ([PR #18](https://github.com/canton-foundation/canton-dev-fund/pull/18)) covers Splice LocalNet orchestration. None of these address the same application-developer surface Cantool targets: opinionated scaffolding with community template conventions, a native MCP server for AI-assisted development, or a language-agnostic plugin system.

Notably, **dpm**'s migration from the Daml Assistant explicitly removed several developer-facing commands — including `upload-dar`, `allocate-parties`, `list-parties`, and `start` — directing users instead to raw gRPC, JSON API, or Canton Console calls. These removals were appropriate for **dpm**'s scope as an SDK management tool, but they left gaps in the application developer workflow. Cantool addresses that gap at the application layer by standardizing participant-connected operations and AI-facing workflow integration without taking ownership of SDK management, dependency resolution, or LocalNet orchestration.

Keeping each tool focused on its own domain — SDK management (dpm), infrastructure orchestration (DevKit), dependency and diagnostics ([PR #105](https://github.com/canton-foundation/canton-dev-fund/pull/105)), and application developer workflow (Cantool) — avoids the bloat that comes from folding unrelated UX into tools built for different layers. Cantool's OCI component publishing model gives dpm users a single command entry point to Cantool's capabilities, preserving the user-facing convergence benefit of integrated tooling while keeping the codebases, governance, and release cycles independent. Separate tools, shared user experience.

---

## Applicant Background

**Eric Mann** is a senior engineer with production Canton application development experience spanning Ledger API v2 gRPC integrations, PQS-backed application queries, cn-quickstart Docker environments, Canton Enterprise deployments, DAML smart contract development, JWT and Keycloak-based authentication flows, Go/Temporal service architecture, and HSM-backed key management (GCP KMS with P-256/ECDSA) for institutional systems. He has already built internal Canton CLI tooling covering Ledger API operations, DAML package management, authentication, configuration, and environment management; Cantool is a productization of working patterns from that code, not a speculative design.

This experience mirrors the findings of the 2026 Canton developer survey: a disproportionate amount of early project time is spent fighting infrastructure, environment setup, and bespoke scripting before application work begins. Cantool is designed to remove exactly those sources of friction by turning proven internal workflows into reusable public tooling.

**Displace Technologies LLC** is a registered Oregon LLC serving as the contracting entity. This is a solo-engineer engagement; the budget assumes and is sized for one senior engineer. If unforeseen circumstances require additional capacity, Displace Technologies can engage contract engineers at its own expense. All deliverables will be released under Apache 2.0 license.

---

## Security and Scalability Implications

- **No custody of funds**: Cantool never holds or transacts with CC or any digital assets.
- **Authentication**: Delegates to the Canton participant's identity provider. Stores only session tokens locally with appropriate file permissions.
- **Supply chain security**: Go module system with checksum database. All dependencies audited and pinned.
- **No network risk**: Client to existing Canton infrastructure. MCP server is localhost-only by default; Streamable HTTP transport is opt-in.

---

## Long-Term Maintenance

- **Funded milestones (M1–M4)**: Bug fixes, compatibility updates, and stabilization are incorporated into each milestone's delivery period.
- **Post-milestone maintenance**: Ongoing maintenance (bug fixes, SDK compatibility, security patches) estimated at ~100,000 CC/quarter, to be proposed separately after Milestones 1–4 are complete.
- **Post-grant commitment**: 6-month post-grant maintenance for critical bug fixes and compatibility updates.
- **Community governance**: Apache 2.0 license ensures the tool remains open and forkable regardless of the author's continued involvement.
- **Extensibility**: Documented extension points and the plugin architecture (JSON-RPC over stdio) enable third-party command extensions, reducing long-term maintenance burden by keeping protocol-specific functionality in separate repositories. Should the original maintainer become unavailable, the documented codebase and extension architecture allow the Core Contributors Group to continue maintenance at the funded level.

---

## Distribution

- **Homebrew tap**, GitHub Releases (prebuilt binaries for macOS/Linux/Windows), Docker image, `go install`
- GSF Application Developer Slack, Canton Foundation channels, GitHub Discussions
- Release notes, demos, and concise documentation updates for each milestone
