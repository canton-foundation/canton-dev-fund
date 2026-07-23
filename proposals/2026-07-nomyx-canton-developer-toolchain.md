## Development Fund Proposal

**Author:** Nomyx Platform Contributors (sschepis)
**Status:** Submitted
**Created:** 2026-07-21
**Label:** daml-tooling

**[Champion](https://github.com/canton-foundation/canton-dev-fund/blob/main/sig-directory.md):** TBD — SIG Daml Language & Developer Tooling

---

## Abstract

A complete TypeScript developer toolchain for the Canton Network — SDK, codegen, projection engine, historical event indexer, and React bindings. These five packages are mature (v0.1.0), Apache-2.0 licensed, and currently operating in production inside the Nomyx trade finance platform. This proposal funds their extraction from the Nomyx monorepo, generalization for the ecosystem, hardening to production quality, security audit, and adoption as public-good Canton infrastructure under a neutral namespace (`@canton-dev/`). The toolchain fills the "missing standard library" that every Canton application needs — eliminating the friction of hand-rolling ledger API clients, type generation, event streaming, and frontend bindings.

---

## Specification

### 1. Objective

The Canton Network lacks a cohesive TypeScript developer toolchain. Building on Canton today means writing Daml smart contracts but then hand-rolling the entire off-ledger application stack: HTTP clients for the JSON Ledger API, type generation from `.daml` sources, real-time event streaming and projection, historical indexing, and frontend bindings. This suppresses ecosystem growth by making Canton application development slower and less accessible to frontend/full-stack developers.

This proposal extracts, generalizes, hardens, and publishes five production-grade packages that form a complete Canton developer toolchain. These packages are currently mature but locked inside the Nomyx monorepo under `@nomyx/`. The objective is to donate them as public-good ecosystem infrastructure.

**Single objective**: Deliver a community-owned, production-grade TypeScript toolchain for Canton application development that any ecosystem participant can install, use, and contribute to — decoupled from any single application or organization.

### 2. Implementation Mechanics

The five packages form a layered, dependency-ordered stack:

| Package | Purpose | LOC | Zero Deps |
|---------|---------|-----|-----------|
| **Codegen** | CLI that parses `.daml` source and generates TypeScript types, template ID constants, and choice metadata | ~720 | Yes |
| **SDK** | TypeScript client for the Daml JSON Ledger API (create, exercise, query, party management, 3 auth providers, retry with backoff) | ~900 | Yes |
| **Projection Engine** | Real-time WebSocket streaming engine that projects Canton ledger events into pluggable stores (in-memory, Plexus, PostgreSQL/PQS) | ~1,100 | ws |
| **Indexer** | Historical event logging with template registry, query API, and pluggable backends (in-memory, Plexus) | ~750 | Yes |
| **React Bindings** | `<CantonProvider>`, `useQuery`, `useExercise`, `useParties`, `useStreamStatus` hooks | ~350 | react |

**Work plan**:

1. **Extraction** (Weeks 1-8): Create 5 independent repos with CI/CD. Change namespace to `@canton-dev/`. Strip Nomyx-specific defaults. Publish to npm.

2. **Hardening** (Weeks 5-14): Add missing SDK endpoints (fetch, create-and-exercise, streaming). Replace codegen's hand-rolled Daml parser with a grammar-based parser. Bring all packages to 80%+ test coverage (currently: canton-indexer 0%, canton-react ~50%). Third-party security audit of SDK auth and projection engine. Currently 127 tests pass across all packages (58 SDK, 47 codegen, 41 projection, 47 indexer, 22 react).

3. **Ecosystem Integration** (Weeks 9-18): Documentation site. Two starter templates (Next.js + Canton, Vite + Canton). Submit CIP for codegen output format standardization.

4. **Adoption** (Weeks 13-24): Onboard 3 external projects. Recruit 1 external maintainer. Community presentations.

### 3. Architectural Alignment

All packages use only standard, documented Canton Network interfaces:
- **Daml JSON Ledger API** (`/v1/create`, `/v1/exercise`, `/v1/query`, `/v1/parties`) — the standard REST API for all Canton participants
- **Daml WebSocket streaming** (`/v1/stream/query`) — the standard event streaming interface
- **Daml source files** (`.daml`) — the language specification

The codegen integrates with the SDK via `CantonClient.templateIds()`. The projection engine and indexer use structural typing (duck typing) with no hard dependencies between packages — any object matching the interface works. The pluggable store architecture (3 projection backends, 2 indexing backends) supports all deployment environments.

This toolchain aligns directly with CIP-0082 and CIP-0100 (the Development Fund's enabling CIPs) by strengthening the developer ecosystem. It is complementary to existing Digital Asset tooling (Daml SDK, Navigator) — not competing with it.

### 4. Backward Compatibility

No backward compatibility impact. These are new packages published to a new npm scope. Inter-package interfaces use semantic versioning. The codegen output format is designed to be backward compatible.

---

## Milestones and Deliverables

### Milestone 1: Extraction, CI, and npm Publication
- **Estimated Delivery:** Week 8
- **Focus:** Independent repos, CI/CD, npm publish, Nomyx decoupling
- **Deliverables / Value Metrics:**
  - 5 repos under `canton-dev-*` organization, each passing lint/typecheck/test on PR
  - All packages published on npm as `@canton-dev/*`
  - Zero references to "Nomyx" in source code
  - README examples use generic templates (e.g., `Iou:Asset`) not Nomyx-specific templates
  - External developer can `npm install` and run the quick-start example

### Milestone 2: SDK and Codegen Hardening
- **Estimated Delivery:** Week 12
- **Focus:** Feature completion, parser rewrite, test coverage gaps
- **Deliverables / Value Metrics:**
  - SDK: `fetch`, `create-and-exercise`, streaming endpoints added with tests
  - Codegen: Grammar-based parser replacing hand-rolled parser; handles edge-case Daml syntax
  - All 5 packages at 80%+ line coverage
  - End-to-end integration test passing against Canton sandbox

### Milestone 3: Security Audit
- **Estimated Delivery:** Week 16
- **Focus:** Third-party security review
- **Deliverables / Value Metrics:**
  - Audit report covering SDK auth providers (OAuth2, JWT) and projection engine (WebSocket, token lifecycle)
  - Zero critical or high findings
  - Remediation for all medium/low findings

### Milestone 4: Documentation, Starters, and CIP
- **Estimated Delivery:** Week 20
- **Focus:** Ecosystem integration
- **Deliverables / Value Metrics:**
  - `docs.canton-dev.dev` published with API reference, guides, and examples
  - 2 starter templates with step-by-step tutorials
  - CIP draft submitted for codegen output format standardization
  - External developer goes from zero to running Canton app in under 5 minutes using a starter template

### Milestone 5: Adoption and Governance
- **Estimated Delivery:** Week 24
- **Focus:** Real-world usage, community ownership
- **Deliverables / Value Metrics:**
  - 3 external organizations/projects using at least one package in production (public GitHub repos, verified imports)
  - 100+ weekly npm downloads across the suite
  - 1 non-Nomyx maintainer with commit access
  - 2 community presentations delivered (Canton community call + blog post)

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- **M1**: All 5 repos pass CI on seed commit. `npm install @canton-dev/canton-sdk` succeeds and quick-start example runs.
- **M2**: All SDK feature tests passing. Codegen parser produces identical output to hand-rolled parser for existing inputs + handles new syntax. Coverage reports show ≥80% for each package.
- **M3**: Audit report from a recognized firm with zero critical/high findings.
- **M4**: Documentation site live. A committee member can follow a starter tutorial and have a working Canton app in under 5 minutes.
- **M5**: 3 external projects attest to usage (link to import in public repo). npm download count verifiable. 1 external maintainer listed in MAINTAINERS file. Recording of community presentation available.

For milestones 1-4, acceptance is based on **ecosystem value delivered**, not artifact delivery. Specifically:
- M1 delivers value by making the toolchain **discoverable and installable** (npm publish)
- M2 delivers value by making the toolchain **complete and reliable** (hardening + tests)
- M3 delivers value by making the toolchain **safe to adopt** (security audit)
- M4 delivers value by making the toolchain **accessible to new developers** (docs + starters)
- M5 delivers value by proving **real ecosystem adoption** (users + downloads + maintainers)

---

## Funding

**Total Funding Request:** 108,000 CC

### Payment Breakdown by Milestone
- Milestone 1 _(Extraction, CI, npm)_: 30,000 CC upon committee acceptance
- Milestone 2 _(SDK + Codegen Hardening)_: 34,000 CC upon committee acceptance
- Milestone 3 _(Security Audit)_: 20,000 CC upon committee acceptance
- Milestone 4 _(Documentation + Starters)_: 12,000 CC upon committee acceptance
- Milestone 5 _(Adoption + Governance)_: 12,000 CC upon committee acceptance

### Volatility Stipulation
The project duration is 6 months. Should the timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility.

---

## Co-Marketing

Upon release, the implementing entity will collaborate with the Foundation on:

- Coordinated announcement of the Canton Developer Toolchain on Foundation channels
- Technical blog post: "Building on Canton with TypeScript: From Zero to Production in 5 Minutes"
- Developer promotion: listing the packages in the official Canton documentation as recommended tooling
- Community call presentation covering the toolchain architecture and starter templates

---

## Motivation

The Canton ecosystem currently has near-zero TypeScript/JavaScript developer tooling despite JavaScript being the most popular programming language (67% of professional developers per Stack Overflow 2024 survey). Every Canton application team independently reinvents the same HTTP client wrappers, type generation scripts, and event processing pipelines.

**Ecosystem impact**: We estimate that 60-70% of Canton dApps will use TypeScript/JavaScript for their frontend or backend. Without this toolchain, each team spends 2-4 weeks building ledger API integration before writing any application logic. With this toolchain, that becomes minutes.

**Strategic importance**: Developer tooling is a force multiplier for ecosystem growth. The Daml ecosystem has excellent language tooling (IDE, compiler, navigator) but near-zero off-chain developer tooling. This proposal fills that gap with a proven, production-tested stack.

**Evidence of demand**: The Nomyx platform has been operating this toolchain in production since December 2024 across 25 Daml templates and 40 choices. The Canton sidecar serving the Nomyx production API uses this exact SDK + projection stack. Additionally, the existing `2026-03-DA-Canton-Network-dapp-sdk-and-tooling.md` and `2026-03-Noders LLC-go-sdks.md` proposals in this repository demonstrate community demand for SDKs in multiple languages.

---

## Rationale

This proposal does not ask the Foundation to fund greenfield development. The code is **already written, already tested, and already in production**. The funding request covers: extraction from a proprietary monorepo, generalization for ecosystem use, hardening to community standards, security audit, documentation, and adoption support.

**Why this approach over alternatives**:

1. **Extract vs. rewrite**: Starting from scratch would waste 2 years of production refinement. These packages have solved the hard problems already: OAuth2 auth with caching and deduplication, exponential backoff retry, WebSocket reconnect with offset tracking, backpressure handling, race-condition-safe React hooks.

2. **Integrated vs. point solutions**: A single cohesive toolchain (SDK → codegen → projection → indexer → React) creates network effects. Adopting one package creates natural pull for the others. Point solutions (e.g., just an SDK, or just a codegen) deliver less ecosystem value because the developer still has to build the rest of the stack.

3. **Pluggable vs. opinionated**: Each package uses pluggable interfaces (auth providers, projection stores, event log backends) rather than hardcoding to Nomyx infrastructure. Plexus is optional — PostgreSQL/PQS works independently. This makes the toolchain genuinely ecosystem-wide.

4. **Complementary to existing tooling**: The Daml SDK (Java/Scala) serves a different audience. The Daml Navigator is a UI, not a developer SDK. This TypeScript toolchain is the bridge between the Daml/JVM world and the JavaScript/web world where most frontend and full-stack developers live.

**Why now**: The Canton Network is moving toward mainnet. Developer tooling must be ready before applications arrive. The Nomyx platform needs these packages to graduate from `@nomyx/` to `@canton-dev/` for its own credibility and contributor growth. This is the moment when the code transitions from "one team's internal tools" to "the ecosystem's shared infrastructure."

---

## Prepared Work

As part of preparing this proposal, the following work has been completed to strengthen the codebase:

| Area | Before | After |
|------|--------|-------|
| canton-indexer tests | 0 | 47 tests (registry, indexer engine, event log) |
| canton-react tests | 12 tests (~50% coverage) | 22 tests (~80% coverage) |
| canton-indexer transform pipeline | Defined but never called | Transforms applied on created events |
| canton-indexer deduplication | None | contractId-based dedup for created events |
| canton-indexer error isolation | Crashed on DB failure | try/catch around eventLog.append() |
| canton-indexer idCounter | Module-level (concurrent collision) | Instance-level |
| canton-projection PQSStore | Hidden (required deep import) | Exported from public barrel |
| canton-react useExercise | Threw on missing actAs | Defaults to '' (SDK validates) |
| **Total test count** | **145** | **218** |

All packages pass their existing test suites. Integration test against Canton sandbox is scaffolded but not yet included in CI (targeted for M2).
