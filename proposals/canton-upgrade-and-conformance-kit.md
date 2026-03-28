## Development Fund Proposal

**Author:** Charles Dusek / Merged.One (@cgdusek)
**Status:** Draft
**Created:** 2026-03-27

---

## Abstract

We propose **Canton Upgrade & Conformance Kit**, an open-source Scala + sbt native toolkit for **upgrade-readiness qualification, version compatibility testing, and reproducible conformance reporting** for Canton deployments and reference applications.

The project addresses a shared ecosystem gap: today, teams can run local or staging deployments, but there is no common, reusable, open qualification layer that lets operators and developers answer practical questions such as: *Is this environment healthy enough to qualify?*, *Did a target upgrade preserve expected behavior?*, and *Can we produce a standard machine-readable report that reviewers and operators can trust?*

The initial funded scope is intentionally narrow and practical. It starts with live environment qualification and scenario-driven conformance execution against real Canton-based reference environments, and then extends that foundation toward upgrade-path validation, compatibility matrix support, and standardized certification-style outputs. The result is a public-good reliability and qualification toolchain that multiple Canton participants can use, inspect, and extend.

---

## Specification

### 1. Objective

The objective is to provide the Canton ecosystem with a shared, reusable toolkit for **qualifying change safely**.

The specific problem is that Canton teams currently lack a standard open-source mechanism to:

- qualify whether a target environment is healthy and conformant before additional testing or rollout
- execute a standard scenario pack against a real deployment and capture deterministic results
- generate structured pass/fail outputs that can be reused in CI, release review, and operator workflows
- extend qualification from basic environment readiness into upgrade and compatibility validation over time

The intended outcome is that a Canton builder or operator can point the toolkit at a supported environment, run a known scenario, and receive:

- machine-readable result artifacts
- human-readable qualification summaries
- clear failure attribution
- a repeatable workflow suitable for local, CI, staging, and release qualification contexts

This proposal is explicitly framed as **shared ecosystem tooling and reliability infrastructure**, not a private support service, not bespoke consulting, and not a hosted product.

### 2. Implementation Mechanics

The project will be implemented as an open-source toolkit with a **Scala + sbt** native core and a scenario-driven execution model.

#### A. Core Architecture

The toolkit will consist of:

- a Scala CLI entrypoint
- a scenario definition format for qualification and conformance checks
- endpoint and service validation logic
- invariant evaluation
- structured result capture
- JSON and Markdown report generation
- Docker-based reproducible execution flows for reference environments
- CI-friendly invocation paths

The initial implementation focuses on the smallest credible real execution path:
- start or attach to a real Canton-related reference environment
- load a declared scenario
- execute real checks
- evaluate invariants
- generate reports
- exit nonzero on failure

#### B. Initial Scope

The first funded phase focuses on **environment qualification and conformance**, not broad protocol verification.

The initial supported scenario family is:

- qualification of a Quickstart-style or comparable reference environment
- readiness and endpoint health validation for declared services
- deterministic result emission
- failure attribution to specific checks/endpoints
- report generation from actual observed execution

This scope is deliberately narrow so that the project can deliver a real, reviewable, and reusable foundation quickly.

#### C. Scenario Model

Scenarios will be declarative and versioned. Each scenario will define:

- environment metadata
- target endpoints or checks
- expected status or pass conditions
- timeout and retry behavior
- invariant mappings
- output behavior

This makes the system extensible without coupling all future work to one hardcoded execution path.

#### D. Invariant Catalog

The initial invariant catalog will be compact and operationally meaningful.

Initial example classes include:

- required endpoints are reachable
- readiness checks succeed before the environment is marked conformant
- result generation is deterministic and machine-readable
- failures identify the specific failed check
- report contents reflect the actual observed run

This layer is intentionally practical. It exists to define what the harness is checking and how a reviewer should interpret the result.

#### E. Reporting

Every scenario run will produce:

- structured JSON output for downstream tooling and CI
- human-readable Markdown output for reviewers and operators

Reports will capture:
- scenario identity
- execution metadata
- individual check results
- invariant pass/fail status
- summary outcome
- diagnostics for failed checks

#### F. Reference Environment Integration

The initial implementation will integrate with real Canton-related reference environments rather than mocked services.

The purpose is to ensure that:
- the toolkit is grounded in actual Canton workflows
- milestone outputs are objectively testable
- the adoption path is credible for real ecosystem users

#### G. Explicitly Out of Scope

To keep the proposal bounded, the following are out of scope for the initial funded phase:

- full formal verification of Canton
- protocol redesign
- private one-off integrations for single operators
- hosted SaaS qualification services
- support for every workflow type in the ecosystem
- broad UI/dashboard product development
- full ledger or application semantic verification in phase one

### 3. Architectural Alignment

This project aligns with Canton architecture and ecosystem priorities because it operates at the shared tooling and operational confidence layer.

It is aligned because it provides:

- shared developer and operator tooling
- reliability and qualification infrastructure
- reference implementation value
- objectively verifiable outputs
- reusable, open-source artifacts that benefit multiple participants

It also complements the broader ecosystem well:
- indexers, wallets, applications, observability, and reference workflows all benefit from a standard qualification layer
- release and upgrade workflows become more trustworthy when scenario execution and reporting are standardized
- operators gain reusable evidence rather than ad hoc local checks

This proposal is intentionally additive and ecosystem-facing.

### 4. Backward Compatibility

*No backward compatibility impact.*

This project is entirely additive. It does not modify Canton protocol behavior, change existing Canton node semantics, or require changes to current Canton deployments in order to exist.

Teams can adopt it incrementally alongside their existing workflows.

---

## Milestones and Deliverables

### Milestone 1: Qualification Foundation and Scenario Model
- **Estimated Delivery:** 4 weeks from project start
- **Focus:** Establish the toolkit architecture, initial invariant catalog, scenario format, and report schema
- **Deliverables / Value Metrics:**
  - repository structure and public project documentation
  - initial scenario model and versioned schema
  - initial invariant catalog
  - report schema for JSON and Markdown outputs
  - architecture documentation sufficient for technical review
  - at least one invariant-to-scenario-to-output traceability example

### Milestone 2: Live Conformance Harness v0.1
- **Estimated Delivery:** 5 weeks from Milestone 1 acceptance
- **Focus:** Deliver the Scala/sbt CLI harness and execute a real live qualification scenario against a supported reference environment
- **Deliverables / Value Metrics:**
  - Scala CLI harness
  - scenario loader
  - real check execution against a live environment
  - retry/timeout behavior
  - invariant evaluation
  - JSON and Markdown report generation
  - nonzero failure behavior
  - documentation for local execution

### Milestone 3: CI and Reproducible Reference Integration
- **Estimated Delivery:** 4 weeks from Milestone 2 acceptance
- **Focus:** Make the execution flow reproducible, documented, and suitable for CI and reference-environment usage
- **Deliverables / Value Metrics:**
  - reproducible Docker-based or documented reference execution path
  - CI integration example
  - smoke validation workflow
  - troubleshooting guide
  - sample generated reports from actual execution
  - installation and usage documentation for external users

### Milestone 4: Upgrade Qualification Extension
- **Estimated Delivery:** 4 weeks from Milestone 3 acceptance
- **Focus:** Extend the toolkit from basic environment qualification toward actual upgrade-readiness workflows
- **Deliverables / Value Metrics:**
  - upgrade-oriented scenario definitions
  - upgrade preflight checks
  - compatibility-oriented result reporting
  - known caveat and breakpoint reporting format
  - at least one documented upgrade qualification example against a supported target environment

### Milestone 5: Public Release, Adoption Package, and Maintenance Plan
- **Estimated Delivery:** 3 weeks from Milestone 4 acceptance
- **Focus:** Prepare the toolkit for wider ecosystem use with documentation, examples, and stewardship guidance
- **Deliverables / Value Metrics:**
  - public release
  - maintainer guide
  - operator guide
  - contribution and extension guide
  - roadmap for future scenario families
  - at least two example report artifacts published
  - community-facing walkthrough/demo materials

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone
- Demonstrated functionality or operational readiness
- Documentation and knowledge transfer provided
- Alignment with stated value metrics

Project-specific acceptance conditions:

- the toolkit must execute at least one live scenario against a real Canton-related reference environment
- reports must be generated from actual observed execution, not static templates
- failures must identify the failed check or endpoint clearly
- the CLI must support reproducible invocation from documented commands
- JSON output must be structured and reusable by downstream tooling
- the project must remain open-source and usable by multiple ecosystem participants
- the initial release must be clearly scoped and documented, including explicit non-goals

---

## Funding

**Total Funding Request:** **450,000 CC**

### Payment Breakdown by Milestone
- **Milestone 1 _(Qualification Foundation and Scenario Model)_: 70,000 CC upon committee acceptance**
- **Milestone 2 _(Live Conformance Harness v0.1)_: 110,000 CC upon committee acceptance**
- **Milestone 3 _(CI and Reproducible Reference Integration)_: 95,000 CC upon committee acceptance**
- **Milestone 4 _(Upgrade Qualification Extension)_: 105,000 CC upon committee acceptance**
- **Milestone 5 _(Public Release, Adoption Package, and Maintenance Plan)_: 70,000 CC upon final release and acceptance**

### Volatility Stipulation

If the project duration is **under 6 months**:
Should the project timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility.

---

## Co-Marketing

Upon release, the implementing entity will collaborate with the Foundation on:

- announcement coordination
- a technical write-up describing the scenario model, invariant model, and qualification workflow
- a recorded walkthrough or live demo of the toolkit against a real reference environment
- developer or ecosystem promotion

Specific commitments:
- publish example report outputs
- publish setup and execution guidance for external adopters
- present the project as shared ecosystem infrastructure rather than a private product

---

## Motivation

Canton needs a practical, reusable way to qualify environments and changes with confidence.

As more teams build tooling, workflows, and applications around Canton, ecosystem value increasingly depends on **safe, reviewable change velocity**. Shared infrastructure that makes qualification more repeatable benefits many categories of contributors at once: operators, app developers, auditors, reviewers, and future tooling teams.

This proposal is valuable because it creates:
- a reusable qualification layer
- standard result artifacts
- a clearer path from local execution to CI and release workflows
- a foundation for future upgrade and compatibility testing work

It is a strong fit for the Development Fund because it is common-good infrastructure with compounding value rather than private work for a single team.

---

## Rationale

This is the right approach because it starts with a **small real execution wedge** instead of an over-broad assurance platform.

Alternative approaches were considered implicitly and rejected for phase one:
- a broad formal-methods-heavy proposal would be harder to review and easier to perceive as sprawling
- a private support/audit model would not fit the fund mandate
- a purely theoretical compatibility framework without a working harness would be weaker evidence of feasibility
- a UI-first product would distract from the shared infrastructure problem

By contrast, this proposal:
- begins with real execution against a real environment
- uses a native Scala + sbt implementation approach
- produces objective artifacts
- is narrow enough to ship
- still opens a credible path toward richer upgrade and compatibility support later

A live demo repository already exists at [merged-one/canton-upgrade-conformance-kit-demo](https://github.com/merged-one/canton-upgrade-conformance-kit-demo), demonstrating the core scenario model, invariant evaluation, and report generation against a real Canton-based reference environment. This working prototype directly de-risks Milestones 1 and 2 by providing evidence that the proposed architecture, execution model, and reporting pipeline are technically feasible and already producing real outputs.

The design favors execution credibility first, then extension.
