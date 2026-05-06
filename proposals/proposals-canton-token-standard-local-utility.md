# Development Fund Proposal: Canton Token Standard Local Utility & Test Harness

**Author:** Dima K
**GitHub:** akameoww
**Status:** Submitted  
**Created:** 2026-05-06  
**Suggested SIG Alignment:** Token Asset Standards, Daml Tooling, Developer Experience  
**Requested Funding:** 800,000 CC  
**Timeline:** 6 months  
**License:** Apache-2.0 for software artifacts  

---

## Abstract

This proposal requests **800,000 CC** to build the **Canton Token Standard Local Utility & Test Harness**, an open-source developer utility that helps Canton application teams develop, test, and validate Token Standard-style workflows locally and in CI.

The project will provide:

- a local token workflow fixture profile;
- Daml fixture models for local development;
- a Java/Spring Boot utility service;
- a TypeScript CLI;
- Docker-based local setup;
- GitHub Actions support;
- deterministic token scenarios;
- documentation and reference examples.

The intended developer workflow is simple and reproducible:

```bash
ctsu up
ctsu create-instrument --symbol tUSD
ctsu mint --party Alice --symbol tUSD --amount 1000
ctsu transfer --from Alice --to Bob --symbol tUSD --amount 100
ctsu assert-balance --party Bob --symbol tUSD --amount 100
```

The goal is to reduce friction for teams building token-based applications, wallet-facing flows, settlement demos, SDK examples, QA suites, and developer education workflows on Canton by giving them a reusable local environment for token setup, minting, holdings, transfers, fixture reset, and CI validation without requiring immediate dependency on DevNet/TestNet Utility infrastructure.

This is a **forward-looking proposal**. It does not request retroactive funding and does not assume a completed pre-submission product. The first milestone is intentionally scoped to produce the initial public architecture, local skeleton, and working golden-path prototype.

---

## Problem Statement

Canton's Token Standard creates a common interface for tokenized assets, wallets, custody providers, and applications. This is critical for ecosystem interoperability, but it also introduces practical development complexity.

Application teams often need to test token workflows before they have access to a live validator environment, configured IAM, installed Utility DARs, registered instruments, valid business-user tokens, or real token issuers. For many teams, the first useful development milestone is not a production deployment; it is simply being able to run a local token flow repeatedly:

1. create or register a test instrument;
2. mint test balances;
3. retrieve holdings;
4. transfer tokens between parties;
5. reset fixtures;
6. run the same flow automatically in CI.

Today, teams building wallets, tokenized asset applications, settlement flows, SDK examples, and backend services must assemble these local workflows themselves or rely on external DevNet/TestNet infrastructure earlier than necessary. This increases onboarding time, makes examples harder to reproduce, and creates duplicated local testing infrastructure across the ecosystem.

The proposed project fills this gap by providing a shared local utility and test harness for Token Standard development.

---

## Ecosystem Need

The Canton ecosystem is already investing in SDKs, dApp integrations, wallet standards, token standards, local development environments, and production infrastructure. These projects become more useful when developers can test realistic token workflows locally and repeatably.

Mature smart-contract ecosystems generally provide local developer environments where teams can create test assets, seed accounts, execute transfers, and run automated tests without depending on public test networks. Canton developers building token-based applications need an equivalent workflow for Token Standard scenarios.

This project benefits several groups:

- **Application developers** building tokenized payment, invoice, settlement, fund, or asset-management applications.
- **Wallet and custody teams** that need predictable local holdings and transfer scenarios.
- **SDK and tooling contributors** that need reusable token fixtures for examples and regression tests.
- **Hackathon and education teams** that need a fast path from local setup to first token transfer.
- **QA and DevOps teams** that need CI-safe token workflows independent of live-network availability.
- **DevRel and documentation teams** that need reproducible examples for Token Standard education.

The output is intended as shared ecosystem infrastructure rather than a private product.

---

## Proposed Solution

The proposal funds an open-source local utility and test harness with four major components:

1. **Local token fixture profile** for Token Standard-style development scenarios, including instruments, holdings, mint/burn, transfers, optional allocation-style examples, and deterministic demo data.
2. **Java/Spring Boot utility service** that mediates local ledger interactions and exposes a documented REST/OpenAPI interface for local token workflows.
3. **TypeScript CLI and GitHub Action** that make the utility easy to use in local development and CI.
4. **Documentation and examples** showing how application teams can use the harness to test token workflows from a fresh checkout.

The project will focus on a practical v1 local development profile. It will publish a clear compatibility matrix explaining which Token Standard concepts are supported directly, which are simulated for local development, and which are deferred.

The project will not claim full production parity with live Utility infrastructure in v1. Instead, it will provide a clearly documented local test profile that developers can use to validate application logic, examples, SDK behavior, and CI workflows before moving to DevNet/TestNet or production environments.

---

## Objective

The objective is to deliver a reusable local/test utility layer for Canton Token Standard development that allows developers to reach a successful local token transfer quickly and then reuse the same flow in CI.

A successful v1 release should allow an external developer or reviewer to:

- clone the repository;
- start the local environment;
- create a local test instrument;
- mint a test balance;
- transfer tokens between local parties;
- assert holdings;
- reset fixture state;
- run the same flow in CI;
- understand which parts of the local profile are production-like, simulated, or deferred.

---

## Technical Specification

### 1. Local Token Fixture Model

The Daml layer will provide a minimal but useful local token workflow profile:

- local instrument metadata;
- test issuer/admin role;
- holdings representation;
- mint and burn workflows for test assets;
- direct transfer workflows;
- optional allocation-style workflow useful for settlement application examples;
- deterministic seed data;
- resettable fixture state.

The goal is not to replace production Utility Registry behavior. The goal is to provide a local developer test profile that is useful, reproducible, and clearly documented.

### 2. Java / Spring Boot Utility Service

The core utility service will be implemented as a Java/Spring Boot application. It will:

- connect to a local Canton participant or compatible local ledger environment;
- provide package-loading and local setup helpers where supported by the target local environment;
- allocate or discover local parties;
- expose REST/OpenAPI endpoints for local token workflow operations;
- execute ledger commands using generated Java bindings where practical;
- return structured errors suitable for CLI and CI usage;
- provide fixture reset and snapshot/restore capabilities;
- expose health and compatibility endpoints.

Planned API groups:

- `/parties`
- `/instruments`
- `/mint`
- `/burn`
- `/holdings`
- `/transfers`
- `/fixtures`
- `/health`
- `/compatibility`

### 3. TypeScript CLI

The CLI will be a developer-facing wrapper around the Java service. It will support commands such as:

```bash
ctsu up
ctsu down
ctsu reset
ctsu seed demo
ctsu party create Alice
ctsu create-instrument --symbol tUSD
ctsu mint --party Alice --symbol tUSD --amount 1000
ctsu holdings --party Alice
ctsu transfer --from Alice --to Bob --symbol tUSD --amount 100
ctsu assert-balance --party Bob --symbol tUSD --amount 100
ctsu snapshot ./fixtures/demo.json
ctsu restore ./fixtures/demo.json
```

The CLI will be scriptable, CI-friendly, and designed around deterministic output.

For clarity, `ctsu up` is scoped to starting the utility's local Docker Compose profile and documented dependencies. It is not intended to become a general-purpose Canton LocalNet manager.

### 4. CI Harness

The CI harness will allow projects to run token workflow tests in GitHub Actions or equivalent CI systems.

The reference CI flow will:

1. start local services;
2. build Daml packages;
3. start the Java utility service;
4. seed parties and instruments;
5. mint test balances;
6. execute transfer scenarios;
7. assert final holdings;
8. publish logs and test reports.

### 5. Reference Examples

The repository will include examples such as:

- a minimal Java/Spring usage example;
- a TypeScript/NestJS backend example;
- optional integration notes for Go or other SDK users;
- a documented “first local token transfer” walkthrough.

---

## Architecture Overview

```text
Developer / CI Environment

┌────────────────────────────────────────────┐
│ TypeScript CLI / GitHub Action              │
│ - ctsu create-instrument                    │
│ - ctsu mint                                 │
│ - ctsu transfer                             │
│ - ctsu assert-balance                       │
└──────────────────────┬─────────────────────┘
                       │ REST / OpenAPI
                       ▼
┌────────────────────────────────────────────┐
│ Java / Spring Boot Local Utility Service    │
│ - party bootstrap                           │
│ - local package/setup helpers               │
│ - token workflow orchestration              │
│ - fixture reset / snapshot                  │
│ - structured errors                         │
└──────────────────────┬─────────────────────┘
                       │ Ledger API / local APIs
                       ▼
┌────────────────────────────────────────────┐
│ Local Canton / Local Ledger Environment     │
│ - Daml fixture contracts                    │
│ - instruments                               │
│ - holdings                                  │
│ - mint / burn / transfer choices            │
└────────────────────────────────────────────┘
```

---

## Alignment with Canton and Token Standard

This project aligns with Canton ecosystem priorities in four ways:

1. **Developer experience:** it reduces the time required to run the first meaningful token workflow locally.
2. **Token Standard adoption:** it helps application teams understand and test token workflow concepts before moving to live environments.
3. **Interoperability:** it creates a shared local test target that SDKs, apps, wallet teams, and examples can reuse.
4. **Lower integration cost:** it removes repeated local fixture work and provides reproducible CI scenarios.

The project is designed around the Token Standard development surface, but it is intentionally conservative: v1 will publish a supported/deferred matrix and will not claim full production parity with live Utility infrastructure.

---

## Non-Overlap Statement

This project is intentionally scoped to avoid overlap with existing Canton ecosystem work.

It is **not**:

- a new Canton SDK;
- a wallet SDK;
- a browser dApp SDK;
- a wallet discovery layer;
- a LocalNet manager;
- a production Utility Registry replacement;
- a general-purpose indexer;
- a Token Standard V2 implementation;
- a rewards or traffic analytics tool;
- a MainNet deployment project.

It is a local development and CI utility for Token Standard workflows. Existing SDKs, dApp tools, wallets, LocalNet tools, and application frameworks should be able to use this harness as a shared testing target rather than compete with it.

### Relationship to Adjacent Work

| Area | Adjacent ecosystem work | Non-overlap position |
| --- | --- | --- |
| SDKs | Go SDKs, Python DAZL work, C#/.NET SDK proposal, TypeScript SDK/codegen proposals | This project does not build another client SDK. It provides a local token workflow target that SDKs can test against. |
| dApp / wallet standards | dApp SDK, wallet discovery, wallet gateway proposals | This project does not implement wallet connectivity, browser provider APIs, or wallet discovery. |
| LocalNet / DevKit tooling | Canton DevKit, Cantool, local environment managers | This project does not manage the full Canton lifecycle. It runs alongside local environments and focuses only on token workflow fixtures. |
| Registry / Utility | Utility Registry and live environment infrastructure | This project is not a production registry. v1 is local-only and documents simulated vs production-like behavior. |
| Rewards / traffic | Traffic-based rewards and app-provider self-check tooling | This project does not analyze rewards, traffic, or Featured App/App Provider economics. |
| Indexing | PQS and validator indexer work | This project does not build a general-purpose indexer. Any PQS integration is optional and limited to local examples. |

---

## Implementation Mechanics

The repository will be organized as a monorepo:

```text
canton-token-standard-local-utility/
  daml/
    src/
    daml.yaml
  java/
    service/
    integration-tests/
  cli/
    src/
    package.json
  docker/
    compose.local.yml
  openapi/
    local-utility-v1.yaml
  docs/
    architecture.md
    quickstart.md
    compatibility-matrix.md
    supported-vs-deferred.md
  examples/
    java-spring/
    typescript-nest/
  .github/
    workflows/
      ci.yml
      smoke.yml
```

The initial implementation will focus on a local golden path. Later milestones will harden the service, add CI packaging, improve compatibility documentation, and validate usability with external reviewers.

---

## Required Access and Dependencies

The baseline implementation does **not** require privileged MainNet, TestNet, or DevNet access. It is designed to run against a local Canton-compatible environment.

Baseline dependencies:

- local Canton or compatible local ledger environment;
- Daml tooling for fixture package development;
- Java/Spring Boot for the local utility service;
- Node.js/TypeScript for the CLI;
- Docker Compose for reproducible local setup;
- GitHub Actions or equivalent CI for smoke tests.

Optional dependencies for later compatibility testing:

- access to CN Quickstart artifacts, if the team chooses to align a reference example with that setup;
- Utility Registry DARs, if available for compatibility-mode experiments;
- DevNet/TestNet validator access, if available, for non-blocking smoke tests.

Live-network smoke tests are explicitly **not required** for v1 acceptance. If access is available, they will be treated as an optional validation profile.

---

## Milestones and Deliverables

### Milestone 1: Architecture, Scope Definition, and Local Skeleton

**Payment:** 150,000 CC  
**Deadline:** 1 month after grant approval

**Focus:** Establish the public repository, architecture, local development profile, and initial working skeleton.

**Deliverables:**

- Public repository under Apache 2.0 license.
- Architecture document.
- Supported/deferred Token Standard workflow matrix.
- Initial Daml fixture package.
- Docker Compose skeleton for local development.
- Initial Java/Spring Boot service skeleton.
- Initial CLI skeleton.
- Basic CI that builds Daml, Java, and TypeScript packages.
- Initial validation checklist for external reviewers.

**Acceptance Criteria:**

- Fresh checkout builds successfully in CI.
- Daml fixture package compiles.
- Java service starts locally.
- CLI can call service health endpoint.
- Documentation explains scope, non-goals, architecture, and local setup.
- The supported/deferred matrix is explicit enough to prevent confusion with production Utility infrastructure.

---

### Milestone 2: Core Local Token Utility Service

**Payment:** 220,000 CC  
**Deadline:** 2.5 months after grant approval

**Focus:** Implement the core local token workflows.

**Deliverables:**

- Instrument creation workflow.
- Party bootstrap helpers.
- Mint workflow for local test assets.
- Burn workflow for local test assets.
- Holdings retrieval endpoint.
- Direct transfer workflow.
- Structured error model.
- Integration test suite.

**Acceptance Criteria:**

- End-to-end local flow works: create instrument → mint → retrieve holdings → transfer → assert updated holdings.
- At least 30 automated tests cover core workflows.
- OpenAPI specification is published.
- Demo script runs successfully from clean local state.
- Logs and errors are structured enough for CI troubleshooting.

---

### Milestone 3: Local API Profile, Fixtures, and CI Harness

**Payment:** 190,000 CC  
**Deadline:** 4 months after grant approval

**Focus:** Make the utility reusable for application teams and automated CI environments.

**Deliverables:**

- Local registry-like development API profile for supported workflows.
- Deterministic fixture seed data.
- Fixture reset capability.
- Snapshot and restore support.
- GitHub Action or reusable CI workflow.
- Compose-based smoke test.
- Compatibility matrix.

**Acceptance Criteria:**

- GitHub Action runs a full local token scenario.
- Fixture reset produces deterministic state.
- Snapshot/restore works for at least one documented demo scenario.
- Compatibility matrix clearly marks supported, simulated, and deferred functionality.
- CI produces artifacts/logs useful for debugging failed token flows.
- The API profile is documented as local/development-only and does not claim production registry parity.

---

### Milestone 4: CLI, Examples, and Developer Documentation

**Payment:** 140,000 CC  
**Deadline:** 5 months after grant approval

**Focus:** Package the utility for external developer usage.

**Deliverables:**

- TypeScript CLI with documented commands.
- Java/Spring reference example.
- TypeScript/NestJS reference example.
- Quickstart guide.
- Troubleshooting guide.
- Demo walkthrough.
- Release packaging for Docker image, Java service artifact, and CLI package.

**Acceptance Criteria:**

- A new developer can complete first local token transfer from documentation.
- CLI supports the golden-path commands.
- At least two reference examples run against the local utility.
- Public documentation includes setup, workflow examples, troubleshooting, and known limitations.
- Release artifacts are published with versioned tags.

---

### Milestone 5: External Validation, Hardening, and v1 Release

**Payment:** 100,000 CC  
**Deadline:** 6 months after grant approval

**Focus:** Validate the project with external users, harden the release, and define maintenance.

**Deliverables:**

- External validation checklist.
- Feedback round with at least two external reviewers or teams.
- Internal security and configuration review.
- Final v1 compatibility matrix.
- Final release notes and changelog.
- 90-day post-release maintenance plan.
- Roadmap for future live DevNet/TestNet compatibility mode.

**Acceptance Criteria:**

- At least two external reviewers or teams complete the validation checklist or provide structured feedback.
- v1.0.0 release tag is published.
- Critical/high issues identified during internal review are resolved or documented with rationale.
- Maintenance and issue triage plan is published.
- Final report summarizes delivered functionality, limitations, feedback, and next steps.

---

## Funding

**Total Funding Request:** 800,000 CC

| Milestone | Description | Payment | % of Total |
| --- | --- | ---: | ---: |
| M1 | Architecture, scope definition, and local skeleton | 150,000 CC | 18.75% |
| M2 | Core local token utility service | 220,000 CC | 27.50% |
| M3 | Local API profile, fixtures, and CI harness | 190,000 CC | 23.75% |
| M4 | CLI, examples, and developer documentation | 140,000 CC | 17.50% |
| M5 | External validation, hardening, and v1 release | 100,000 CC | 12.50% |
| **Total** |  | **800,000 CC** | **100%** |

This funding structure is milestone-driven and forward-looking. No retroactive funding is requested. Each milestone has observable deliverables and acceptance criteria.

Payments are expected to be released after milestone completion and acceptance, following the standard Development Fund milestone-based process.

### Cost Basis

The requested amount covers implementation, integration testing, documentation, release packaging, external validation coordination, and a short post-release maintenance period.

Estimated effort:

| Role | Responsibility | Estimated Effort |
| --- | --- | ---: |
| Technical Lead / Daml Architect | Token workflow model, architecture, scope control, milestone acceptance | 2.5 person-months |
| Senior Java / Spring Boot Engineer | Utility service, ledger integration, OpenAPI, integration tests | 3.0 person-months |
| TypeScript / DevEx Engineer | CLI, GitHub Action, examples, developer workflow | 2.0 person-months |
| QA / CI Engineer | CI harness, smoke tests, reproducibility, release validation | 2.0 person-months |
| Documentation / DevRel Support | Quickstart, examples, troubleshooting, external validation coordination | 1.0 person-month |
| Project / Release Coordination | Planning, changelog, issue triage, milestone reporting | 1.0 person-month |

**Estimated total effort:** approximately 11.5 person-months.

The funding request is not based only on raw implementation time. It also covers integration risk, release engineering, compatibility documentation, external validation, and 90 days of post-v1 issue triage.

---

## Team Composition

The project will be delivered by a small implementation team with focused responsibilities:

- Technical Lead / Daml Architect
- Senior Java / Spring Boot Engineer
- TypeScript / DevEx Engineer
- QA / CI Engineer
- Documentation / DevRel Support
- Project / Release Coordination

The team may adjust staffing across milestones while preserving the milestone deliverables and acceptance criteria.

---

## Adoption Strategy

Adoption will be driven through practical developer workflows rather than marketing claims.

Planned adoption activities:

- Publish a quickstart that gets a developer to first local token transfer.
- Provide GitHub Actions examples that teams can copy into their own projects.
- Provide Java and TypeScript examples for common backend integration patterns.
- Invite feedback from SDK, wallet, and app teams building token workflows.
- Maintain a public issue tracker with tagged beginner issues and integration requests.
- Publish a final v1 release report summarizing external feedback and known limitations.

Success will be measured by:

- reproducibility of the golden-path local token flow;
- CI usage by external teams or reviewers;
- feedback from at least two external teams/reviewers;
- clarity of the compatibility matrix;
- ability for SDKs or applications to use the harness as a local test target.

No adoption claims are made before delivery. External validation is included as a milestone deliverable rather than assumed upfront.

---

## Long-Term Sustainability

The project will be maintained through:

- Apache 2.0 open-source licensing;
- public issue tracking;
- contribution guidelines;
- compatibility matrix updates;
- release tags and changelogs;
- 90 days of post-v1 issue triage after Milestone 5;
- a documented roadmap for future maintenance or continuation funding if ecosystem demand justifies it.

After the initial 6-month grant, future work should be evaluated based on actual usage, issue volume, requested compatibility updates, and adoption by application or SDK teams.

Potential future extensions may include:

- broader Token Standard workflow coverage;
- optional DevNet/TestNet smoke-test adapter;
- deeper PQS integration profile;
- additional language examples;
- expanded fixture scenarios for settlement or DVP-style workflows.

These extensions are intentionally out of scope for the initial v1 grant unless explicitly included in a later continuation proposal.

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Scope expands into a full production registry replacement | Delivery risk and overlap with existing Utility infrastructure | Keep v1 local-only and publish supported/deferred matrix |
| Token Standard or Utility APIs evolve during implementation | Compatibility drift | Pin tested versions and publish compatibility matrix |
| Live DevNet/TestNet access is unavailable | Cannot validate live adapter | Make live adapter optional and non-blocking for v1 acceptance |
| Local fixture model is mistaken for production parity | Developer confusion | Clearly document simulated vs production-like behavior |
| Query requirements become too broad | Risk of accidentally building an indexer | Keep MVP query surface narrow and avoid general-purpose indexing |
| External teams are slow to validate | Adoption milestone risk | Use reviewers as fallback validators and collect structured feedback |
| Security expectations are unclear for a local-only tool | Review friction | Publish local-only threat boundaries and perform an internal configuration/security review before v1 |

---

## Acceptance Criteria Summary

By the end of the grant, the project will deliver:

- public Apache-2.0 repository;
- local Daml token fixture profile;
- Java/Spring Boot utility service;
- REST/OpenAPI interface;
- TypeScript CLI;
- Docker Compose local setup;
- GitHub Action / CI harness;
- deterministic seed data;
- create instrument, mint, burn, holdings, and transfer workflows;
- Java and TypeScript reference examples;
- compatibility matrix;
- external validation feedback;
- v1.0.0 release tag;
- 90-day post-release maintenance plan.

---

## Co-Marketing and Community Support

Upon milestone completion and v1 release, the team will coordinate with the Foundation and interested ecosystem contributors on:

- release announcement;
- technical walkthrough;
- demo video;
- quickstart article;
- example integration repositories;
- feedback session with application and SDK teams.

---

## Rationale

The Canton ecosystem is investing in SDKs, wallet interoperability, dApp tooling, token standards, and production infrastructure. A local Token Standard utility and test harness complements this work by solving a practical developer bottleneck: teams need a repeatable way to test token workflows locally before depending on live environments.

The proposed tool is deliberately scoped as shared developer infrastructure. It does not replace existing SDKs, wallets, registries, LocalNet tools, or protocol work. Instead, it provides a common local testing target that makes all of those efforts easier to adopt, test, document, and demonstrate.

This is why the project is well-suited for Development Fund support: it reduces integration friction, improves developer experience, supports Token Standard adoption, and creates reusable open-source infrastructure for the broader Canton ecosystem.

---

## References

- Canton Development Fund README and proposal requirements: https://github.com/canton-foundation/canton-dev-fund
- Development Fund Proposal Review Process: https://github.com/canton-foundation/canton-dev-fund/blob/main/Development%20Fund%20Proposal%20Review%20Process.md
- CIP-0056 Token Standard: https://github.com/canton-foundation/cips/blob/main/cip-0056/cip-0056.md
- Digital Asset Token Standard Integration documentation: https://docs.digitalasset.com/utilities/devnet/overview/registry-user-guide/token-standard.html
- Digital Asset Registry Utility holdings example: https://docs.digitalasset.com/utilities/devnet/how-tos/registry/holding/retrieve.html
