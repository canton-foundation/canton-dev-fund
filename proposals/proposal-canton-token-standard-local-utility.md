# Development Fund Proposal: Canton Token Standard Local Utility & Test Harness

**Author:** NODEJUMPER (https://nodejumper.io/)  
**Status:** Submitted  
**Created:** 2026-05-06  
**Label:** daml-tooling
**Champion:** Canton Foundation

---

## Abstract

This proposal requests **650,000 CC** to build the **Canton Token Standard Local Utility & Test Harness** — an open-source developer utility for running deterministic Token Standard-style workflows locally and in CI.

The project addresses a practical developer gap: teams building token-based applications on Canton need a repeatable way to seed test instruments, create test balances, run transfers, check holdings, reset fixture state, and validate the same flow automatically before depending on DevNet/TestNet Utility infrastructure.

This is the type of small but important infrastructure that mature developer ecosystems need: a local, deterministic token workflow layer that lets builders move from idea to working integration faster.

The intended high-level local developer experience is expected to be similar to:

```bash
docker compose up -d
ctsu fixture seed --profile basic-token
ctsu scenario run first-transfer --from Alice --to Bob --symbol tUSD --amount 100
ctsu assert holdings --party Bob --symbol tUSD --amount 100
ctsu fixture reset
```

These commands are illustrative examples of the intended local developer ergonomics, not a finalized CLI contract. Exact command names, argument shapes, and supported local workflow boundaries will be finalized during Milestone 1 as part of the architecture, scope, and compatibility work.

The project will deliver:

1. **Daml fixture models** for local Token Standard-style scenarios.
2. **A Java/Spring Boot local utility service** for fixture setup, workflow execution, holdings checks, and reset.
3. **A thin TypeScript CLI wrapper and GitHub Actions support** for local use and CI automation.
4. **Reference examples and documentation** for application, wallet, SDK, QA, and education teams.

This proposal is forward-looking. It does not request retroactive funding and does not assume a completed pre-submission product. Milestone 1 is scoped to produce the public architecture, local skeleton, supported/deferred compatibility matrix, and first golden-path prototype.

All software artifacts will be released under the **Apache 2.0** open-source license.

---

## Why NODEJUMPER

NODEJUMPER is a trusted Proof-of-Stake validator and blockchain infrastructure provider active since early 2022. We run secure, self-managed infrastructure with 24/7 monitoring, high availability standards, incident response processes, and a security-first operational approach.

Our team currently supports services across **20+ networks** and has built practical experience in:

- validator operations;
- infrastructure monitoring and automation;
- reliable deployment workflows;
- open-source tooling;
- onboarding guides and community resources;
- developer-facing infrastructure.

NODEJUMPER has maintained a strong operational record, including consistently high uptime and no slashing events across its validator operations.

This proposal is aligned with what we already do well: building reliable, practical infrastructure that lowers barriers for builders and operators. The project is not a speculative application or a private product. It is shared developer infrastructure that requires operational discipline, reproducible environments, deterministic CI flows, clear documentation, and long-term maintainability.

For Canton, NODEJUMPER intends to contribute beyond validator operation by building useful open-source tooling that helps application teams, wallet builders, SDK maintainers, QA engineers, and DevRel teams test token workflows locally before moving to live environments.

---

## Motivation

Canton's Token Standard creates a common foundation for tokenized assets, wallets, custody providers, and applications. This is critical for interoperability, but it also creates a real developer experience challenge: before a team can build a useful application flow, it often needs a working token environment.

For many teams, the first meaningful milestone is not a MainNet deployment. It is the ability to repeatedly run a simple local workflow:

1. seed or create a test instrument;
2. seed or mint balances for local parties;
3. retrieve holdings;
4. transfer tokens between parties;
5. assert expected balances;
6. reset fixture state;
7. run the same workflow in CI.

Without a shared local fixture harness, teams must either assemble this themselves or rely on external DevNet/TestNet infrastructure earlier than necessary. That adds onboarding friction, slows SDK examples, makes QA more brittle, and creates duplicated local testing logic across the ecosystem.

The value of this project is straightforward: it gives Canton builders a common local token workflow target.

---

## Specification

### 1. Objective

The objective of this grant is to deliver a reusable local/test utility layer for Canton Token Standard-style development.

A successful v1 release should allow an external developer or reviewer to:

- clone the repository;
- start the local environment;
- seed a local test instrument;
- seed or mint a test balance;
- transfer tokens between local parties;
- assert holdings;
- reset fixture state;
- run the same flow in CI;
- understand which parts of the local profile are supported, simulated, or deferred.

### Success looks like

- Developers can complete a first local token transfer from a fresh checkout.
- Application teams can reuse the same token workflow in GitHub Actions or equivalent CI.
- SDK and wallet teams can test examples against deterministic local token fixtures.
- Documentation clearly separates local fixture behavior from production Utility infrastructure.
- The repository provides a versioned v1.0.0 release with examples, changelog, compatibility matrix, and a maintenance plan.

---

## Implementation Mechanics

This proposal covers four workstreams that together provide a complete local Token Standard-style testing experience.

### Workstream A — Local Token Fixture Profile

**What it is**

A minimal Daml fixture profile for local Token Standard-style workflows.

The profile will include:

- local instrument metadata;
- test issuer/admin role;
- holdings representation;
- seed or mint-style balance setup;
- burn-style workflow for test assets;
- direct transfer workflow;
- deterministic seed data;
- resettable fixture state;
- optional allocation-style scenario useful for settlement examples.

**Why it matters**

Builders need predictable token states for local development and CI. A reusable fixture profile prevents every team from rebuilding its own local model for instruments, balances, transfers, and assertions.

---

### Workstream B — Java/Spring Boot Local Utility Service

**What it is**

A local service that connects to a local Canton-compatible ledger environment and exposes a documented REST/OpenAPI interface for local token workflows.

Planned API groups:

- `/parties`
- `/fixtures`
- `/instruments`
- `/holdings`
- `/transfers`
- `/assertions`
- `/health`
- `/compatibility`

The service will:

- connect to a local Canton participant or compatible local ledger;
- provide package-loading and local setup helpers where supported;
- allocate or discover local parties;
- execute local workflow commands using generated Java bindings where practical;
- return structured errors for CLI and CI usage;
- support fixture reset and snapshot/restore;
- expose health and compatibility endpoints.

**Why it matters**

The service provides a stable local target for applications, SDK examples, QA suites, and CI pipelines. It keeps the project focused on token workflow fixtures rather than becoming another general SDK or CLI.

---

### Workstream C — Thin TypeScript CLI Wrapper and CI Harness

**What it is**

A thin CLI wrapper around the Java service plus reusable CI workflow examples.

Illustrative commands may include:

```bash
docker compose up -d
ctsu fixture seed --profile basic-token
ctsu scenario run first-transfer --from Alice --to Bob --symbol tUSD --amount 100
ctsu assert holdings --party Bob --symbol tUSD --amount 100
ctsu fixture reset
ctsu fixture snapshot ./fixtures/demo.json
ctsu fixture restore ./fixtures/demo.json
```

The CLI will be scriptable, deterministic, and CI-friendly. It will not attempt to become a general-purpose Canton CLI.

**Why it matters**

Developers and CI systems need simple commands that fail clearly, produce predictable output, and can be copied into test workflows. The CLI is a convenience layer, not the core product.

---

### Workstream D — Documentation, Examples, and External Validation

**What it is**

Developer-facing documentation and examples that make the utility easy to adopt.

Deliverables include:

- quickstart guide;
- supported/deferred compatibility matrix;
- troubleshooting guide;
- Java/Spring reference example;
- TypeScript/NestJS reference example;
- external validation checklist;
- v1.0.0 release notes and changelog.

**Why it matters**

For developer infrastructure, usability is part of the product. The output should be easy to run, easy to understand, and easy for other teams to evaluate.

---

## Architectural Alignment

This project aligns with Canton architecture and ecosystem priorities by strengthening the application development layer around Token Standard workflows.

- **Token Standard adoption:** provides local workflows that help teams understand token concepts before live deployments.
- **Developer experience:** reduces time to first working token scenario.
- **Interoperability:** gives SDKs, wallets, and applications a shared local test target.
- **CI reproducibility:** enables token workflow testing independent of live-network availability.
- **Operational clarity:** publishes explicit supported, simulated, and deferred behavior so local testing is not confused with production Utility infrastructure.

This project is intentionally conservative. It does not claim production parity with live Utility Registry behavior. It provides a documented local development profile for early integration, examples, and automated testing.

---


## Feasibility Posture

This proposal is intentionally shaped to stay narrow, practical, and easy to verify.

It asks for one focused local Token Standard-style fixture and CI assertion harness, not a full token platform. The first funded release is limited to:

- one local fixture profile;
- one Java/Spring Boot utility service;
- one thin TypeScript CLI wrapper;
- one GitHub Actions-compatible CI path;
- two reference examples;
- one supported/deferred compatibility matrix;
- one v1 release and 90-day post-release maintenance period.

The proposal avoids hosted services, production registry operation, wallet flows, broad framework matrices, general Canton lifecycle management, and MainNet deployment work. This makes the outputs concrete, testable, and suitable for milestone-based review.

## Scope Boundaries and Non-Overlap

This proposal is designed to complement existing and proposed ecosystem tooling.

It is **not**:

- a new Canton SDK;
- a wallet SDK;
- a browser dApp SDK;
- a wallet discovery layer;
- a general-purpose Canton developer CLI;
- a project scaffolding tool;
- a DAML build/test/deploy lifecycle tool;
- a LocalNet manager;
- a token faucet product;
- a production Utility Registry replacement;
- a Token Standard Registry API client;
- a typed workflow SDK or command builder;
- a general-purpose indexer;
- a Token Standard V2 implementation;
- a rewards or traffic analytics tool;
- an auth harness;
- a JWT/OIDC test-token generator;
- a formal verification framework;
- a MainNet deployment project.

The output is a local development and CI fixture/assertion harness for Token Standard-style workflows. Existing SDKs, dApp tools, wallets, LocalNet tools, and application frameworks should be able to use this harness as a shared testing target rather than compete with it.

| Area | Adjacent ecosystem work | Non-overlap position |
| --- | --- | --- |
| Local environment tooling | DevKit, Cantool, cn-quickstart-style environments | This project does not manage LocalNet lifecycle. It provides Token Standard-style fixture scenarios and CI assertions that can run against an existing local environment. |
| General developer CLI | Cantool, dpm-related tooling | This project does not provide project scaffolding, build/test/deploy lifecycle commands, MCP, or plugin infrastructure. The CLI is only a thin wrapper around token fixture workflows. |
| SDKs and typed tooling | Go/Python/.NET/TypeScript SDKs, codegen, app SDKs | This project does not build another SDK. It provides local token scenarios that SDKs and applications can test against. |
| Registry / Utility infrastructure | Utility Registry and live environment services | This project is not a production registry. It provides local-only fixtures and documents supported, simulated, and deferred behavior. |
| Auth and verification tooling | Auth harnesses, JWT/OIDC tools, formal verification frameworks | This project does not provide auth, identity, model checking, trace generation, or formal verification. |
| Rewards / traffic tooling | Traffic-based rewards and app-provider self-check tooling | This project does not analyze rewards, traffic, or Featured App/App Provider economics. |

---

## Required Access and Dependencies

The baseline implementation does **not** require privileged MainNet, TestNet, or DevNet access. It is designed to run against a local Canton-compatible environment.

Baseline dependencies:

- local Canton or compatible local ledger environment;
- Daml tooling for fixture package development;
- Java/Spring Boot for the local utility service;
- Node.js/TypeScript for the CLI wrapper;
- Docker Compose for reproducible local setup;
- GitHub Actions or equivalent CI for smoke tests.

Optional dependencies for later compatibility testing:

- access to CN Quickstart artifacts, if the team chooses to align a reference example with that setup;
- Utility Registry DARs, if available for compatibility-mode experiments;
- DevNet/TestNet validator access, if available, for non-blocking smoke tests.

Live-network smoke tests are not required for v1 acceptance. If access is available, they will be treated as an optional validation profile.

---

## Milestones and Deliverables

### Milestone 1: Architecture, Scope Definition, and Local Skeleton

- **Payment:** 120,000 CC
- **Estimated Delivery:** 1 month after approval
- **Focus:** Establish the public repository, architecture, local development profile, and initial working skeleton.

**Deliverables / Value Metrics:**

- Public repository under Apache 2.0 license.
- Architecture document.
- Supported/deferred Token Standard-style workflow matrix.
- Initial Daml fixture package.
- Docker Compose skeleton for local development.
- Initial Java/Spring Boot service skeleton.
- Initial thin CLI wrapper skeleton.
- Basic CI that builds Daml, Java, and TypeScript packages.
- Initial validation checklist for external reviewers.

### Milestone 2: Core Local Token Workflow Service

- **Payment:** 180,000 CC
- **Estimated Delivery:** 2 months after approval
- **Focus:** Implement the core local token workflows.

**Deliverables / Value Metrics:**

- Test instrument fixture workflow.
- Party bootstrap helpers.
- Test balance seed/mint workflow.
- Burn-style workflow for local test assets.
- Holdings retrieval endpoint.
- Direct transfer workflow.
- Structured error model.
- Integration test suite.

### Milestone 3: Fixture Profiles, Local API Surface, and CI Harness

- **Payment:** 155,000 CC
- **Estimated Delivery:** 3 months after approval
- **Focus:** Make the utility reusable for application teams and automated CI environments.

**Deliverables / Value Metrics:**

- Local fixture API profile for supported workflows.
- Deterministic fixture seed data.
- Fixture reset capability.
- Snapshot and restore support.
- GitHub Action or reusable CI workflow.
- Compose-based smoke test.
- Compatibility matrix.

### Milestone 4: CLI Wrapper, Examples, and Developer Documentation

- **Payment:** 110,000 CC
- **Estimated Delivery:** 3.5 months after approval
- **Focus:** Package the utility for external developer usage.

**Deliverables / Value Metrics:**

- Thin TypeScript CLI wrapper with documented commands.
- Java/Spring reference example.
- TypeScript/NestJS reference example.
- Quickstart guide.
- Troubleshooting guide.
- Demo walkthrough.
- Release packaging for Docker image, Java service artifact, and CLI package.

### Milestone 5: External Validation, Hardening, and v1 Release

- **Payment:** 85,000 CC
- **Estimated Delivery:** 4 months after approval
- **Focus:** Validate the project with external users, harden the release, and define maintenance.

**Deliverables / Value Metrics:**

- External validation checklist.
- Feedback round with at least two external reviewers or teams.
- Internal security and configuration review.
- Final v1 compatibility matrix.
- Final release notes and changelog.
- 90-day post-release maintenance plan.
- Roadmap for future live DevNet/TestNet compatibility mode.

---


## Potential Ecosystem Beneficiaries

This proposal is intended as public-good developer infrastructure for teams building or testing token-based workflows on Canton.

The primary beneficiaries are expected to be:

- application teams building tokenized payments, settlement flows, fund flows, or asset-management applications;
- wallet and custody teams that need predictable local holdings and transfer scenarios;
- SDK and tooling maintainers that need deterministic token fixtures for examples and regression tests;
- QA and DevOps teams that need CI-safe token workflows independent of live-network availability;
- DevRel, hackathon, and education teams that need a fast path from local setup to first token transfer.

The project is designed to make existing ecosystem tooling more useful by giving it a shared local token workflow target.

## Acceptance Criteria

The Tech & Ops Committee can evaluate milestone completion based on the following evidence:

- **M1:** Fresh checkout builds successfully in CI; the Daml fixture package compiles; the Java service starts locally; the CLI can call the service health endpoint; documentation explains scope, non-goals, architecture, and local setup; the supported/deferred matrix is explicit enough to prevent confusion with production Utility infrastructure.
- **M2:** End-to-end local flow works: seed/create instrument → seed/mint test balance → retrieve holdings → transfer → assert updated holdings; at least 30 automated tests cover core workflows; OpenAPI specification is published; demo script runs successfully from clean local state; logs and errors are structured enough for CI troubleshooting.
- **M3:** GitHub Action runs a full local token scenario; fixture reset produces deterministic state; snapshot/restore works for at least one documented demo scenario; compatibility matrix clearly marks supported, simulated, and deferred functionality; CI produces artifacts/logs useful for debugging failed token flows; the API profile is documented as local/development-only and does not claim production registry parity.
- **M4:** A new developer can complete first local token transfer from documentation; CLI supports the golden-path fixture/scenario/assert/reset commands; at least two reference examples run against the local utility; public documentation includes setup, workflow examples, troubleshooting, and known limitations; release artifacts are published with versioned tags.
- **M5:** At least two external reviewers or teams complete the validation checklist or provide structured feedback; v1.0.0 release tag is published; critical/high issues identified during internal review are resolved or documented with rationale; maintenance and issue triage plan is published; final report summarizes delivered functionality, limitations, feedback, and next steps.

---

## Funding

This request is for a grant of **650,000 Canton Coin (CC)**.

| Milestone | Description | Payment | % of Total |
| --- | --- | ---: | ---: |
| M1 | Architecture, scope definition, and local skeleton | 120,000 CC | 18.46% |
| M2 | Core local token workflow service | 180,000 CC | 27.69% |
| M3 | Fixture profiles, local API surface, and CI harness | 155,000 CC | 23.85% |
| M4 | CLI wrapper, examples, and developer documentation | 110,000 CC | 16.92% |
| M5 | External validation, hardening, and v1 release | 85,000 CC | 13.08% |
| **Total** |  | **650,000 CC** | **100%** |

This funding structure is milestone-driven and forward-looking. No retroactive funding is requested. Each milestone has observable deliverables and acceptance criteria.

Payments are expected after milestone completion and acceptance by the Tech & Ops Committee.

After the v1 release, NODEJUMPER will provide 90 days of post-release issue triage, compatibility clarification, and minor fix support as part of the M5 maintenance plan.


### Funding Rationale

- **M1** funds the first reproducible architecture and skeleton: enough structure for reviewers and developers to see the local-only scope, supported/deferred matrix, and first golden-path prototype.
- **M2** funds the core utility value: local test instruments, seeded balances, holdings checks, transfers, structured errors, and automated tests.
- **M3** funds repeatability: deterministic fixtures, reset/snapshot behavior, CI workflows, compatibility documentation, and smoke-test execution.
- **M4** funds adoption readiness: the thin CLI wrapper, Java and TypeScript examples, quickstart, troubleshooting, demo walkthrough, and release packaging.
- **M5** funds external validation and release hardening: reviewer feedback, final compatibility matrix, v1 release, changelog, and post-release maintenance plan.

The payment structure keeps most of the funding tied to concrete implementation and repeatability outcomes, while reserving a final milestone for external validation and release quality.

### Post-Release Maintenance Commitment

No recurring maintenance funding or hosted-service budget is requested in this proposal.

After v1 release, NODEJUMPER will provide **90 days of post-release issue triage, compatibility clarification, and minor fix support** for documented flows. The repository will publish a maintenance plan covering issue labels, support expectations, version compatibility notes, and release/changelog practices.

### Volatility Stipulation

If the project duration extends beyond 6 months due to Committee-requested scope changes, remaining milestones should be renegotiated for material CC/USD volatility.

### Cost Basis

The requested amount covers implementation, integration testing, documentation, release packaging, external validation coordination, and a short post-release maintenance period.

Estimated effort:

| Role | Responsibility | Estimated Effort |
| --- | --- | ---: |
| Technical Lead / Daml Architect | Token workflow model, architecture, scope control, milestone acceptance | 2.0 person-months |
| Senior Java / Spring Boot Engineer | Utility service, ledger integration, OpenAPI, integration tests | 2.5 person-months |
| TypeScript / DevEx Engineer | Thin CLI wrapper, GitHub Action, examples, developer workflow | 1.5 person-months |
| QA / CI Engineer | CI harness, smoke tests, reproducibility, release validation | 1.5 person-months |
| Documentation / DevRel Support | Quickstart, examples, troubleshooting, external validation coordination | 0.75 person-months |
| Project / Release Coordination | Planning, changelog, issue triage, milestone reporting | 0.75 person-months |

**Estimated total effort:** approximately 9.0 person-months.

The funding request is not based only on raw implementation time. It also covers integration risk, release engineering, compatibility documentation, external validation, and 90 days of post-v1 issue triage.

---

## Co-Marketing

Upon milestone completion and v1 release, the team will coordinate with the Foundation and interested ecosystem contributors on:

- release announcement;
- technical walkthrough;
- demo video;
- quickstart article;
- example integration repositories;
- feedback session with application and SDK teams.

---

## Ecosystem Value

These deliverables are valuable to the Canton ecosystem because they:

- reduce onboarding time for teams building token-based applications;
- give SDKs and wallets a reusable local token workflow target;
- improve CI reproducibility for token scenarios;
- reduce duplicated local fixture work across teams;
- make Token Standard-style workflows easier to document, test, and teach.

In practice, this infrastructure helps builders move faster by giving them a deterministic local path before live-network dependencies are required.

---

## Rationale

Funding this local fixture and CI assertion harness is an efficient way to support Token Standard adoption without duplicating existing SDK, registry, wallet, DevKit, or CLI efforts.

The project is intentionally small in surface area and broad in utility: it provides reusable token scenarios, assertions, examples, and compatibility documentation that other ecosystem tools can use. It strengthens the developer workflow around Canton without replacing any core component.

After the v1 release and 90-day post-release maintenance period, any further expansion should be evaluated as a continuation or renewal grant based on demonstrated usage, issue volume, requested compatibility updates, and adoption by application or SDK teams.

---

## References

- Canton Development Fund README and proposal requirements: https://github.com/canton-foundation/canton-dev-fund
- Development Fund Proposal Review Process: https://github.com/canton-foundation/canton-dev-fund/blob/main/Development%20Fund%20Proposal%20Review%20Process.md
- CIP-0056 Token Standard: https://github.com/canton-foundation/cips/blob/main/cip-0056/cip-0056.md
- Digital Asset Token Standard Integration documentation: https://docs.digitalasset.com/utilities/devnet/overview/registry-user-guide/token-standard.html
- Digital Asset Registry Utility holdings example: https://docs.digitalasset.com/utilities/devnet/how-tos/registry/holding/retrieve.html
