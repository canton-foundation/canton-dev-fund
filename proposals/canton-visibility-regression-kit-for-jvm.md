## Development Fund Proposal: Canton Visibility Regression Kit for JVM

**Author:** Deepthi
**Status:** Submitted  
**Created:** 2026-03-23  

---

## Abstract

This proposal requests funding for an open-source **JVM test toolkit for privacy and visibility regression detection** in Canton applications.

Canton’s privacy-partitioned ledger model is one of its most valuable properties, but it is also one of the easiest areas for application teams to model incorrectly. Over-disclosure through stakeholder creep, accidental observer carry-forward, and unintended visibility changes across workflow transitions are hard to catch with ordinary functional testing. These mistakes often surface late, after workflows have already been designed around the wrong privacy boundaries.

The proposed project, **Canton Visibility Regression Kit for JVM**, will provide:

- JUnit-friendly visibility assertions for Canton workflows
- regression tooling for signatory, observer, and stakeholder-set changes
- reusable test harnesses for party-specific query and visibility expectations
- machine-readable and human-readable visibility reports for CI
- reference examples demonstrating privacy-preserving workflow testing patterns

The goal is not to redefine Canton privacy semantics, not to replace application integration tests, and not to become a general formal verification platform. The goal is to give teams a practical, reusable, open-source toolkit for catching privacy regressions early and repeatedly.

---

## Specification

### 1. Objective

The objective is to reduce privacy-modeling mistakes in Canton applications by giving JVM teams a reusable regression-testing toolkit focused on contract visibility and party-set correctness.

The intended outcome is that a Canton team can:

- assert which parties can and cannot observe contracts after each workflow step
- detect unexpected stakeholder-set changes in CI
- prove that a workflow transition did not accidentally broaden contract visibility
- produce reviewable reports when privacy expectations fail
- reuse the same visibility assertions across multiple applications and test environments

This proposal is explicitly framed as **ecosystem infrastructure** and a **testing toolkit**, not as a formal methods proposal and not as a replacement for application-specific functional tests.

### 2. Why This Matters Now

Privacy correctness is not optional in Canton. It is one of the main reasons teams choose the platform in the first place.

Today, many teams still rely on:

- ad hoc test helpers
- manual query inspection
- late-stage code review
- visual spot-checking of workflows

to decide whether a workflow reveals too much to the wrong parties.

That gap is dangerous because visibility regressions are easy to introduce and hard to detect later. As more multi-party Canton applications move from prototypes to serious workflows, the ecosystem needs a reusable way to test privacy boundaries with the same rigor that teams already expect for business logic and API behavior.

### 3. Implementation Mechanics

The project will be delivered as:

- a JVM testing library for Canton visibility assertions
- party-scoped query helpers and fixture support
- CI-friendly regression reporting
- reference test suites and documentation for common workflow patterns

#### A. Visibility Assertion Toolkit

The toolkit will provide assertions for:

- contract visible to expected parties only
- contract hidden from specified parties
- stakeholder and observer drift across workflow transitions
- unexpected visibility broadening between baseline and candidate workflow versions

The design target is developer ergonomics familiar to JVM teams: JUnit integration, assertion helpers, and readable failure output.

#### B. Workflow Regression Model

The implementation will support testing patterns such as:

- single-step contract visibility
- archive/create transitions with changed party sets
- bilateral-to-novated workflow transitions
- local attestation or signal contract visibility
- terminal-state convergence visibility

This allows teams to test Canton-native choreography and privacy boundaries without reinventing their own assertion layer.

#### C. CI and Reporting

The toolkit will produce:

- structured JSON reports for CI
- human-readable Markdown or console summaries
- diffs of expected versus actual visibility sets
- failure explanations that identify the parties and contracts involved

#### D. Reference Scenarios

The project will include reference test suites covering:

- a bilateral workflow
- a multi-party handoff workflow
- a visibility regression case showing an accidental observer leak

These examples help teams understand how to adapt the toolkit to real applications.

#### Explicitly Out of Scope

To keep the proposal narrow and technically credible, the following are out of scope:

- changing Canton privacy semantics
- formal verification of arbitrary smart contracts
- frontend testing
- hosted privacy-audit services
- broad workflow execution tooling outside visibility testing

### 4. Architectural Alignment

This proposal aligns directly with Canton’s most important differentiator: privacy-partitioned workflows with controlled visibility.

It delivers shared public-good value by:

- making privacy regressions easier to catch before deployment
- reducing repeated custom test logic across teams
- giving reviewers and maintainers clearer evidence that a workflow preserves intended visibility boundaries
- strengthening trust in Canton-native multi-party application design

It complements rather than replaces:

- workflow reference implementations
- generic test frameworks
- application functional tests

### 5. How This Differs from Similar Proposals

This proposal focuses on a specific correctness problem that other testing and workflow proposals do not target directly.

- Compared with workflow reference implementations, this proposal focuses on **verifying privacy and visibility outcomes**, not defining workflow primitives or orchestration patterns.
- Compared with test coverage or fuzzing efforts, this proposal focuses on **party visibility and stakeholder-boundary regressions**, not general test completeness or randomized state exploration.
- Compared with formal-specification and model-checking proposals, this proposal focuses on **practical CI-grade regression testing** that ordinary JVM teams can adopt without introducing a separate formal methods workflow.

The core differentiator is that this project turns Canton’s privacy model into something teams can assert and regress-test continuously, rather than only reasoning about it informally in code review.

### 6. Delivery Feasibility

This proposal is intentionally practical and bounded:

- one JVM assertion toolkit
- one CI and reporting model
- a small set of reference scenarios
- one reusable visibility regression workflow

Privacy assertions and reports are packaged in a way that is both correct and pleasant for teams to use repeatedly.

### 7. Risks and Mitigations

- **Too narrow risk:** the project includes reusable reporting and regression workflows, not just a few assertions.
- **Environment sensitivity:** the toolkit will ship with fixtures and reference scenarios to reduce ambiguity.
- **Overclaiming formal guarantees:** the project is positioned as regression testing infrastructure, not formal proof.
- **Adoption risk:** reports and reference scenarios are included so the toolkit is immediately useful in CI, not just as a low-level library.

### 8. Backward Compatibility

No backward compatibility impact is intended.

This project is additive. It introduces a testing toolkit and reporting layer without changing Canton protocol behavior or application semantics.

---

## Milestones and Deliverables

### Milestone 1: Public Alpha for Visibility Assertions

A new team can add party-scoped visibility assertions to a bilateral reference workflow and get readable failures.

### Milestone 2: External CI Evaluation

At least one evaluator uses the diffing and CI reports against a non-trivial workflow and confirms the toolkit catches real party-set drift.

### Milestone 3: Hardened Multi-Party Scenario Release

Reference scenarios, observer-leak regressions, and documentation are refined from evaluator feedback and published as reusable CI-grade tooling.

### Milestone 4: Adoption-Ready Privacy Regression Package

The toolkit remains usable after a second rerun or follow-up evaluation cycle and clearly complements broader workflow testing.

---


## Potential Ecosystem Beneficiaries

This proposal is intended as public-good testing infrastructure for the wider Canton ecosystem. Early conversations indicate that this kind of privacy-correctness tooling is relevant to ecosystem teams building privacy-sensitive Canton applications, including teams such as `Gateway` `Lumens.fi` and `BitDynamics AB`

The feature set addresses a common Canton-specific failure mode: multi-party workflows are often easy to make functionally correct while still getting privacy boundaries wrong through observer leaks, stakeholder creep, or unintended visibility changes.

More broadly, the project is useful for teams building wallet, gateway, trading, payment, and other multi-party Canton workflows who need practical CI-grade checks for party visibility, workflow transitions, and regression detection around access boundaries.


## Acceptance Criteria

The Tech & Ops Committee can evaluate completion based on:

- visibility assertions correctly identify which parties can and cannot observe contracts in reference scenarios
- regression reports show expected vs actual party visibility differences
- CI-friendly outputs are published and demonstrated
- multi-party reference scenarios are included, not just trivial bilateral examples
- the project is released as open source

Project-specific acceptance conditions:

- the project must remain focused on visibility regression and privacy correctness
- reporting must clearly identify party-set drift and observer-leak style regressions
- documentation must show how the toolkit complements, rather than replaces, broader workflow and application testing

---

## Funding

**Total Funding Request:** 850,000 CC

### Payment Breakdown by Milestone

- Milestone 1 _(Core Assertion Toolkit)_: 180,000 CC upon committee acceptance
- Milestone 2 _(Regression Diffing and CI Reports)_: 230,000 CC upon committee acceptance
- Milestone 3 _(Multi-Party Reference Scenarios)_: 250,000 CC upon committee acceptance
- Milestone 4 _(Documentation, Hardening, and Open-Source Release)_: 190,000 CC upon final release and acceptance

### Funding Rationale

This proposal is narrower than a full workflow framework, but broader than a handful of test helpers.

The funding is justified by four meaningful deliverable areas:

- a reusable JVM assertion and fixture library
- CI-grade regression diffing and report generation
- realistic multi-party reference scenarios that prove the toolkit matters for actual Canton privacy workflows
- polished documentation and release packaging that make adoption practical

The largest milestone funds the multi-party reference scenarios because that is what turns the toolkit from generic assertions into Canton-specific infrastructure that teams can trust in real review and CI pipelines.

The ask remains disciplined because the project does not include hosted services, formal methods research, or open-ended maintenance. It is a focused public-good testing asset aimed at one of Canton’s highest-value correctness concerns.

### Volatility Stipulation

If the project duration extends materially due to committee-requested scope changes, remaining milestone amounts should be renegotiated for material CC/USD volatility.

---

## Co-Marketing

Upon release, the implementing entity will collaborate with the Foundation on:

- announcement coordination
- one technical write-up on testing privacy regressions in Canton applications
- one developer-facing demo or walkthrough of the toolkit in CI

---

## Team Background

Strong product engineering experience building scalable software systems in large enterprise environments, including work with Fortune 100 organizations such as Accenture. This background includes delivering high-scale products, working across structured operational workflows, and translating complex business processes into dependable software systems.

---

## Motivation

Many teams still rely on ad hoc tests and manual inspection to decide whether a workflow reveals too much to the wrong parties.

That is not enough for a platform whose core value proposition depends on controlled visibility. A reusable testing toolkit lowers that risk for every future multi-party application built on Canton and gives reviewers a clearer, repeatable way to verify privacy boundaries.

---

## Rationale

This is the right scope because it targets a highly Canton-specific problem with a concrete and reusable testing artifact.

It is attractive for the ecosystem because:

- it protects Canton’s privacy differentiator
- it gives teams reusable confidence-building infrastructure
- it fits naturally into JVM and CI workflows
- it helps move privacy correctness from informal review into repeatable automated testing
