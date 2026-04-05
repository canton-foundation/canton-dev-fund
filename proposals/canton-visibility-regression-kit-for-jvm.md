## Development Fund Proposal: Canton Visibility Regression Kit for JVM

- **Author:** Deepthi  
- **Status:** Submitted  
- **Created:** 2026-03-23  

---

## Abstract

This proposal requests funding for an open-source **visibility regression toolkit for Canton applications**, built around a **JVM core** with a **CI-facing integration layer**.

Canton’s value is not only that workflows execute correctly. It is that they execute correctly **with controlled visibility**. In the Daml ledger model, one of the core questions is **“who sees which changes and data”**. Canton documentation likewise emphasizes **data minimization** and sharing on a **need-to-know basis**. That privacy boundary is one of Canton’s most important differentiators, and one of the easiest things for application teams to get wrong unintentionally.

In practice, teams can introduce privacy regressions through stakeholder creep, accidental observer carry-forward, workflow refactors, helper contracts, or handoff transitions that broaden visibility beyond what the business process intended. These defects are often invisible to ordinary functional testing. A workflow may be operationally correct while still revealing data to the wrong parties.

The proposed project, **Canton Visibility Regression Kit for JVM**, will provide:

- JUnit-friendly visibility assertions for Canton workflows
- regression tooling for signatory, observer, and stakeholder-set changes
- reusable test harnesses for party-specific query and visibility expectations
- machine-readable and human-readable visibility reports for CI
- a CI-facing integration layer so non-JVM projects can use the same checks through a stable command-line and report interface
- reference examples demonstrating privacy-preserving workflow testing patterns

The goal is not to redefine Canton privacy semantics, not to replace application integration tests, and not to become a general formal verification platform. The goal is to make Canton’s privacy model something teams can continuously assert, regress-test, and enforce in CI.

---

## Specification

### 1. Objective

The objective is to reduce privacy-modeling mistakes in Canton applications by giving teams a reusable regression-testing toolkit focused on contract visibility, party-set correctness, and privacy-policy drift.

The intended outcome is that a Canton team can:

- assert which parties can and cannot observe contracts after each workflow step
- detect unexpected stakeholder-set or observer-set changes in CI
- prove that a workflow transition did not accidentally broaden contract visibility
- produce reviewable reports when privacy expectations fail
- reuse the same privacy checks across multiple applications and test environments
- enforce privacy regressions as a build or CI failure condition
- use the toolkit either as a JVM testing library or through a CI-facing interface from any project stack

This proposal is explicitly framed as **ecosystem infrastructure** and **privacy-correctness testing tooling**. It is not a workflow engine, not a native SDK for every language, and not a formal methods proposal.

### 2. Why This Matters Now

Privacy correctness is not optional in Canton. It is part of the platform’s core value proposition.

The Daml ledger model treats **“who sees which changes and data”** as a first-class concern. Canton documentation describes privacy as **data minimization** and sharing on a **need-to-know basis**. Teams adopt Canton precisely because workflows can be shared selectively instead of disclosed universally.

But that advantage creates a practical engineering challenge. Application teams must preserve intended privacy boundaries across every archive/create transition, handoff, attestation, role shift, and terminal-state convergence. Ordinary functional tests can confirm that a workflow succeeds. They usually do not confirm that it remains visible only to the correct parties.

Today, many teams still rely on:

- ad hoc test helpers
- manual query inspection
- late-stage code review
- visual spot-checking of workflow behavior

to determine whether a workflow reveals too much to the wrong parties.

That gap is risky because privacy regressions are easy to introduce and expensive to detect late. A workflow can be functionally correct and still violate the privacy model it was supposed to preserve. As more Canton applications move from prototypes to real multi-party systems, the ecosystem needs shared infrastructure that makes privacy boundaries testable on every change.

### 3. Implementation Mechanics

The project will be delivered as:

- a JVM testing library for Canton visibility assertions
- party-scoped query helpers and fixture support
- CI-friendly regression reporting
- a thin CI-facing integration layer for non-JVM projects
- reference test suites and documentation for common workflow patterns

#### A. Visibility Assertion Toolkit

The toolkit will provide assertions for:

- contract visible to expected parties only
- contract hidden from specified parties
- stakeholder and observer drift across workflow transitions
- unexpected visibility broadening between baseline and candidate workflow versions
- policy-level violations such as observer carry-forward and unintended party-set drift

The design target is developer ergonomics familiar to JVM teams: JUnit integration, assertion helpers, and readable failure output.

#### B. Workflow Regression Model

The implementation will support testing patterns such as:

- single-step contract visibility
- archive/create transitions with changed party sets
- bilateral-to-novated workflow transitions
- local attestation or signal contract visibility
- terminal-state convergence visibility
- predecessor/successor transition checks for privacy-policy evaluation

This allows teams to test Canton-native choreography and privacy boundaries without reinventing their own assertion layer.

#### C. CI and Reporting

The toolkit will produce:

- structured JSON reports for CI
- human-readable Markdown or console summaries
- diffs of expected versus actual visibility sets
- failure explanations that identify the parties and contracts involved
- clear pass/fail outcomes that can be used to fail builds on privacy regressions

#### D. CI Layer and Language-Agnostic Integration

Although the core implementation is JVM-based, the project will include a thin CI-facing interface so privacy checks can be adopted from any project stack.

This layer exposes the existing visibility engine through stable command-line operations and machine-readable inputs and outputs. A TypeScript, Python, Go, Rust, or shell-based project will be able to:

- capture a visibility snapshot before a workflow step
- run its normal application workflow or integration tests in its own language
- capture a visibility snapshot after the workflow step
- diff the snapshots and evaluate privacy-policy violations
- emit the same JSON and Markdown reports
- fail the build when privacy regressions are detected

This approach keeps the technical scope disciplined. The project remains one core implementation, but it becomes useful beyond JVM codebases through a CI and automation surface rather than through multiple native ports.

#### E. Reference Scenarios

The project will include reference test suites covering:

- a bilateral workflow
- a multi-party handoff workflow
- a visibility regression case showing an accidental observer leak
- a CI-layer example showing the toolkit invoked from a non-JVM workflow pipeline

These examples help teams understand how to adapt the toolkit to real applications and real review pipelines.

#### Explicitly Out of Scope

To keep the proposal narrow and technically credible, the following are out of scope:

- changing Canton privacy semantics
- formal verification of arbitrary smart contracts
- frontend testing
- hosted privacy-audit services
- building native SDK ports for every language
- broad workflow execution tooling outside visibility testing

### 4. Architectural Alignment

This proposal aligns directly with Canton’s defining architectural property: privacy-partitioned workflows with controlled visibility.

Canton already provides the execution model. What the ecosystem still lacks is shared infrastructure that verifies whether application workflows continue to honor that model over time. This project fills that missing enforcement layer.

It delivers shared public-good value by:

- making privacy regressions easier to catch before deployment
- reducing repeated custom visibility test logic across teams
- giving reviewers and maintainers clearer evidence that a workflow preserves intended privacy boundaries
- strengthening trust in Canton-native multi-party application design
- making privacy checks usable in both JVM-native tests and language-agnostic CI pipelines

It complements rather than replaces:

- workflow reference implementations
- generic test frameworks
- application functional tests
- static reasoning or formal verification efforts

### 5. How This Differs from Similar Proposals

This proposal focuses on a specific correctness problem that adjacent testing and workflow proposals do not target directly.

- Compared with workflow reference implementations, this proposal focuses on **verifying privacy and visibility outcomes**, not defining workflow primitives or orchestration patterns.
- Compared with test coverage or fuzzing efforts, this proposal focuses on **party visibility and stakeholder-boundary regressions**, not general test completeness or randomized exploration.
- Compared with formal-specification and model-checking proposals, this proposal focuses on **practical CI-grade regression testing** that ordinary teams can adopt without introducing a separate formal methods workflow.
- Compared with static reasoning tools, this proposal focuses on **runtime workflow visibility evidence** captured from actual workflow execution and evaluated as regression checks.

The core differentiator is that this project turns Canton’s privacy model into something teams can continuously test and enforce, rather than only reason about informally or analyze statically.

### 6. Delivery Feasibility

This proposal is intentionally practical and bounded:

- one JVM core assertion and regression engine
- one reporting model
- one thin CI-facing integration layer
- a small set of reference scenarios
- one reusable privacy regression workflow

The CI layer is feasible because it is not a new engine. It is a narrow front door over the same existing visibility core, reporting model, and privacy-policy evaluation logic. That makes the cross-language adoption benefit large while keeping the implementation scope controlled.

### 7. Risks and Mitigations

- **Too narrow risk:** the project includes reusable reporting, privacy-policy evaluation, and a CI-facing integration layer, not just a few assertions.
- **Too broad risk:** the project avoids native SDK ports for every language and instead exposes a thin CI surface over one core implementation.
- **Environment sensitivity:** the toolkit will ship with fixtures, reference scenarios, and CI examples to reduce ambiguity.
- **Overclaiming formal guarantees:** the project is positioned as regression testing infrastructure, not formal proof.
- **Adoption risk:** reports, examples, and CI usage patterns are included so the toolkit is immediately useful in real pipelines, not only as a low-level library.

### 8. Backward Compatibility

No backward compatibility impact is intended.

This project is additive. It introduces a testing toolkit, reporting layer, and CI-facing integration path without changing Canton protocol behavior or application semantics.

---

## Milestones and Deliverables

### Milestone 1: Ecosystem-Usable MVP for Privacy Regression Testing

- **Focus:** deliver a usable MVP that proves Canton privacy boundaries can be asserted and reviewed as part of normal testing
- **Deliverables / Adoption Evidence:**
  - toolkit is usable in a JVM test suite by a Canton application team without custom assertion scaffolding
  - bilateral reference workflow demonstrates visibility assertions, hidden-party assertions, and readable failure output
  - generated reports are understandable enough for a reviewer to identify which party gained or lost visibility and why
  - documentation shows a first end-to-end workflow from snapshot to assertion to report

### Milestone 2: CI Adoption Path and Language-Agnostic Integration

- **Focus:** make the toolkit usable as a CI gate rather than only as a developer library
- **Deliverables / Adoption Evidence:**
  - toolkit can be run in CI to fail a build when visibility-policy violations are detected
  - JSON and Markdown reports are emitted in a format suitable for CI review
  - thin CLI or equivalent CI-facing interface is available for snapshot and check operations
  - one non-JVM integration example demonstrates the toolkit invoked from an external workflow pipeline without importing JVM classes into application code
  - documentation shows how a TypeScript, Python, or shell-based project can use the toolkit as a privacy regression gate

### Milestone 3: Multi-Party Workflow Relevance Proven

- **Focus:** prove the toolkit is useful for real Canton-native multi-party workflows, not just simple contract checks
- **Deliverables / Adoption Evidence:**
  - multi-party handoff scenario is covered end to end
  - attestation and terminal-state visibility scenarios are covered
  - intentional observer-leak scenario is detected and reported as a failing privacy regression
  - workflow transition examples demonstrate predecessor/successor visibility reasoning rather than only isolated contract checks
  - adoption guidance shows how teams can adapt the toolkit to their own workflow models

### Milestone 4: Release Readiness and Reuse by Other Teams

- **Focus:** ensure the project is genuinely reusable ecosystem infrastructure
- **Deliverables / Adoption Evidence:**
  - open-source release is published with documentation, examples, and license
  - reports, CLI/CI usage, and JVM assertion ergonomics are polished enough for repeated team use
  - pilot-user or reviewer feedback is incorporated into documentation and usability improvements
  - release materials demonstrate how the toolkit complements functional tests and workflow design reviews rather than replacing them

---

## Acceptance Criteria

The Tech & Ops Committee can evaluate completion based on:

- visibility assertions correctly identify which parties can and cannot observe contracts in reference scenarios
- regression reports show expected vs actual party visibility differences
- privacy-policy violations such as observer carry-forward are surfaced clearly in reports
- CI-friendly outputs are published and demonstrated
- the CI-facing integration layer can be invoked from a non-JVM workflow pipeline
- multi-party reference scenarios are included, not just trivial bilateral examples
- the project is released as open source

Project-specific acceptance conditions:

- the project must remain focused on visibility regression and privacy correctness
- reporting must clearly identify party-set drift and observer-leak style regressions
- documentation must show how the toolkit complements, rather than replaces, broader workflow and application testing
- the language-agnostic CI path must remain a thin layer over the same core engine rather than expanding into multi-language SDK maintenance

---

## Funding

**Total Funding Request:** 850,000 CC

### Payment Breakdown by Milestone

- Milestone 1 _(Core Assertion Toolkit)_: 180,000 CC upon committee acceptance
- Milestone 2 _(Regression Diffing, CI Reports, and CI Layer)_: 230,000 CC upon committee acceptance
- Milestone 3 _(Multi-Party Reference Scenarios)_: 250,000 CC upon committee acceptance
- Milestone 4 _(Documentation, Hardening, and Open-Source Release)_: 190,000 CC upon final release and acceptance

### Funding Rationale

This proposal is narrower than a workflow framework, but broader than a handful of test helpers.

The funding is justified by four meaningful deliverable areas:

- a reusable JVM assertion and fixture library
- CI-grade regression diffing and report generation
- a thin CI-facing integration layer that makes the toolkit usable beyond JVM projects without creating multiple SDK maintenance burdens
- realistic multi-party reference scenarios that prove the toolkit matters for actual Canton privacy workflows
- polished documentation and release packaging that make adoption practical

The largest milestone funds the multi-party reference scenarios because that is what turns the toolkit from generic assertions into Canton-specific infrastructure that teams can trust in real review and CI pipelines.

The ask remains disciplined because the project does not include hosted services, formal methods research, or open-ended language-port maintenance. It is a focused public-good testing asset aimed at one of Canton’s highest-value correctness concerns.

### Volatility Stipulation

If the project duration extends materially due to committee-requested scope changes, remaining milestone amounts should be renegotiated for material CC/USD volatility.

---

## Co-Marketing

Upon release, the implementing entity will collaborate with the Foundation on:

- announcement coordination
- one technical write-up on testing privacy regressions in Canton applications
- one developer-facing demo or walkthrough of the toolkit in CI
- one example showing privacy regression enforcement from a non-JVM project pipeline

---

## Team Background

Strong product engineering experience building scalable software systems in large enterprise environments, including work with Fortune 100 organizations such as Accenture. This background includes delivering high-scale products, working across structured operational workflows, and translating complex business processes into dependable software systems.

---

## Motivation

Many teams still rely on ad hoc tests and manual inspection to decide whether a workflow reveals too much to the wrong parties.

That is not enough for a platform whose core value proposition depends on controlled visibility. A reusable testing toolkit lowers that risk for every future multi-party application built on Canton, gives reviewers a clearer and repeatable way to verify privacy boundaries, and helps move privacy correctness from intuition into automation.

---

## Rationale

This is the right scope because it targets a highly Canton-specific problem with a concrete and reusable testing artifact.

It is attractive for the ecosystem because:

- it protects Canton’s privacy differentiator
- it gives teams reusable confidence-building infrastructure
- it fits naturally into JVM and CI workflows
- it extends to non-JVM teams through a thin language-agnostic CI layer
- it helps move privacy correctness from informal review into repeatable automated testing
