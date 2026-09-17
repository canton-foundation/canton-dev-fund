## Development Fund Proposal: Canton Builder Capstone Kits and Autograder

**Author:** Srikanth ( BitDynamics )
**Status:** Submitted
**Created:** 2026-03-21

---

## Abstract

This proposal requests funding for an open-source capstone and evaluation framework for Daml 3 and Canton learning programs.

If the Canton ecosystem wants to attract more application developers, it cannot stop at documentation and lecture-style training. Developers commit to an ecosystem when they can go from reading concepts to successfully shipping a realistic first project. Today that step is still too manual. Workshops, internal enablement efforts, hackathons, and training programs repeatedly rebuild the same starter repositories, acceptance checks, grading scripts, and instructor guidance.

The Canton ecosystem increasingly needs repeatable, hands-on project environments that let learners prove they can apply Daml 3 concepts in realistic workflows, and that let instructors, maintainers, and certification operators evaluate those outcomes consistently. A shared capstone layer reduces friction between learning and building, shortens time-to-first-useful-project, and makes it easier for new developers to stay engaged long enough to become real ecosystem contributors.

The proposed project, **Canton Builder Capstone Kits and Autograder**, provides:

- reusable starter repositories for guided Daml 3 and Canton capstone projects
- a deterministic autograder and validation harness
- machine-readable and human-readable scoring reports
- CI-friendly grading flows suitable for workshops, training programs, and certification support
- instructor and learner documentation for running, extending, and evaluating capstones

In practical terms, this proposal funds a broader reusable package rather than a thin grading script: three fully implemented reference capstone repositories, a broader scaffolded expansion library, a deterministic evaluator engine, rubric and scoring design, migration-specific validation rules, GitHub Action and CI integration, instructor workflows, reference submission fixtures, cross-environment execution hardening, pilot cohort validation, polished documentation and release packaging, and the catalog/scaffolding plus documentation-coverage layer needed to scale the library well beyond the first three kits.

The goal is not to replace curriculum design or create a full LMS. The goal is to provide the missing execution and assessment infrastructure that makes hands-on learning, workshops, and future certification programs much easier to run.

---

## Specification

### 1. Objective

The objective is to make hands-on Daml 3 and Canton learning environments easier to launch, easier to evaluate, and easier to reuse across the ecosystem.

The broader ecosystem objective is to improve developer conversion: move more learners from passive familiarity to confident project delivery, and make high-quality hands-on learning assets reusable enough that every new program does not start from zero.

The intended outcome is that a Canton educator, DevRel team, workshop lead, or certification operator can:

- start from a working capstone repository instead of creating exercises from scratch
- evaluate learner submissions with deterministic checks instead of manual inspection alone
- generate reviewable score reports for learners and maintainers
- reuse the same kits across training cohorts, hackathons, and contributor enablement efforts
- evolve the capstones incrementally as Daml 3 and Canton patterns change

This proposal is explicitly framed as **assessment infrastructure** and **hands-on developer enablement tooling**, not as a training-content replacement.

### 1.1 Why This Is Infrastructure, Not a Thin Grading Script

This proposal should not be read as a request to fund a small wrapper around `daml build` and `daml test`. A thin grading script would have limited ecosystem value and would not solve the real adoption problem.

The useful asset here is the full reusable package around evaluation:

- realistic Daml 3 capstone repositories that learners can actually build on
- rubric contracts and submission schemas that make grading portable across programs
- deterministic rule families for structure, build, test, migration, and deprecated-pattern validation
- JSON and Markdown scoring outputs suitable for both CI systems and human review
- instructor and learner workflows so the kits are usable outside the original implementing team
- CI integration, pilot validation, and release packaging so the framework can be adopted repeatedly

In other words, the value is not just that submissions can be checked. The value is that Canton programs get a reusable, open, operational assessment layer that can sit underneath workshops, training cohorts, migration exercises, and future certification-style efforts without every team starting from zero.

### 2. Implementation Mechanics

The project will be delivered as:

- three fully implemented reusable capstone starter repositories in v1
- a broader scaffolded expansion library aligned to the same grading architecture
- a Python CLI-based autograder and evaluator harness
- GitHub Action and CI integration examples
- a pinned evaluator container or equivalent reproducible runtime package
- a reference submission corpus and failing-fixture regression set
- a kit catalog and scaffolding workflow for scaling to additional capstones
- an official-doc mirroring and coverage-reporting workflow for measuring expansion against DAML/Canton docs
- instructor and learner guides
- maintainer and rubric-authoring guides
- rubric contracts, grading schemas, and scoring outputs
- pilot validation and release packaging for reuse across programs

#### A. Starter Kit Scope

The first release will include a bounded set of capstone kits:

- **Foundations Capstone Kit**
  - basic multi-party Daml application
  - templates, choices, signatories, observers
  - Daml Script validation and starter tests

- **Application Developer Capstone Kit**
  - integration-oriented project using current Daml 3 application patterns
  - API-facing or service-facing project structure
  - realistic failure and validation paths

- **Migration Capstone Kit**
  - intentionally outdated or partially migrated project scaffold
  - learner must bring it to a current Daml 3-compatible state
  - checks for removed tooling and deprecated integration patterns

- **Architecture / Design Capstone Kit** (optional in v1, or included as a lighter track)
  - repo scaffold plus structured design deliverables
  - multi-synchronizer or privacy-aware design reasoning
  - rubric-based validation rather than full runtime grading

The v1 delivery remains intentionally focused on three implemented reference kits so quality stays high. In parallel, the project will include a broader scaffolded expansion library plus a kit catalog, docs-coverage map, and authoring/scaffold workflow that can support a larger library over time, potentially in the 30-40 kit range across multiple tracks, without every new kit becoming a from-scratch engineering effort.

That distinction matters:

- the implemented kits are the production-quality reference deliverables for v1
- the scaffolded expansion library is the scale-up layer that makes broader coverage tractable
- the catalog and docs-coverage workflow make that broader expansion measurable instead of aspirational

Future expansion is not framed as "one documentation page equals one kit." Instead, the project will map official docs topics into a few reusable delivery models:

- code-first Daml capstones where the current autograder architecture is a good fit
- integration labs for API, SQL, codegen, and external-system workflows
- operational or architecture runbooks for topics that are not best taught as pure `daml build` exercises

Coverage expansion is intended to improve throughout the life of the project rather than appear only at the end of the initial implementation window. As new official documentation versions are released, contributors should be able to open pull requests that add the mirrored docs snapshot, update the coverage catalog, and identify newly uncovered topics. Once reviewed and merged, those new-version docs become part of the tracked backlog for follow-on kit, lab, or runbook expansion.

#### B. Autograder Model

The autograder will evaluate capstone submissions using a deterministic layered approach:

- repository structure checks
- build and test execution
- required artifact presence
- forbidden or deprecated pattern detection
- scenario-specific output validation
- isolated execution diagnostics for local and CI environments
- replayable regression checks against reference and failing submissions
- rubric scoring and feedback generation

The first implementation will use a real Daml 3 SDK project setup rather than simulated repository structures, so the framework validates actual build, test, and migration workflows that developers will encounter in practice.

The evaluator output will be produced in:

- JSON for CI and automated processing
- Markdown or HTML for human review

#### C. Grading Philosophy

The grader is not intended to replace expert review entirely. It is designed to:

- reduce repetitive manual validation
- catch common technical mistakes early
- make pass/fail and rubric expectations more explicit
- create reusable baseline evaluation for workshops, trainings, and certification support

#### D. Safety and Scope Boundaries

The first release is intentionally constrained:

- no LMS platform
- no proctoring infrastructure
- no broad credential-issuance system
- no hosted grading service
- no requirement that every capstone be fully auto-gradable

This keeps the project focused on reusable developer infrastructure rather than broad education operations.

### 3. Architectural Alignment

This proposal aligns with Canton ecosystem priorities because it creates reusable developer infrastructure rather than one-time content.

It supports the ecosystem by:

- making it easier for new developers to become productive builders rather than passive readers
- improving the practical usefulness of training and workshops
- making Daml 3 onboarding more hands-on and measurable
- creating repeatable assessment artifacts for future certification or enablement programs
- reducing duplicated work across teams building workshops, labs, and training tracks
- shortening the path from training investment to real application-building capacity

This proposal complements, rather than replaces:

- curriculum and training efforts
- workshops and hackathons
- Daml 3 migration guidance
- developer enablement initiatives

### 4. Backward Compatibility

No backward compatibility impact.

The project is additive. It introduces reusable starter kits and evaluation tooling without changing Canton protocol behavior or existing application workflows.

### 5. Delivery Feasibility

This proposal is intentionally practical and buildable:

- starter repositories are standard open-source deliverables
- the autograder is primarily CLI and CI tooling
- grading rules can be bounded to deterministic checks for v1
- the same infrastructure can support multiple programs without needing a custom platform

The hardest parts are not protocol work. They are:

- designing realistic capstones
- keeping checks deterministic
- balancing strict validation with good learner feedback

### 5.1 Implementation Plan

If development started immediately, the work would be organized into a structured four-phase program over approximately 24 weeks.

**Phase 1: Evaluation Framework and Capstone Blueprinting (Weeks 1-5)**

- finalize the first release scope for capstone kits
- define grading rubric categories and evaluation contract
- define JSON score schema, Markdown review output, and submission format
- design deprecated-pattern and migration-validation rule families
- define instructor workflow, learner workflow, and cohort reset flow

**Phase 2: Capstone Repository Production (Weeks 6-13)**

- build Foundations Capstone Kit
- build Application Developer Capstone Kit
- build Migration Capstone Kit
- optionally build a lighter Architecture / Design Kit if scope remains healthy
- add starter code, seed data, instructions, hidden and visible checks, and instructor guides
- build reference submissions and failing fixtures for regression validation
- publish the first catalog/scaffold workflow for follow-on kit creation

**Phase 3: Autograder and CI Pipeline Work (Weeks 14-19)**

- implement evaluator CLI
- implement deterministic rule engine
- execute build/test/structure/pattern checks
- emit JSON and Markdown grading reports
- publish GitHub Action integration and CI examples
- publish pinned runtime packaging for reproducible grading environments
- build regression coverage for reference and failing submission variants
- publish the first official-doc coverage baseline and mirrored-doc expansion workflow
- validate repeatability across multiple learner submission variants

**Phase 4: Trial Cohorts, Refinement, and Release Packaging (Weeks 20-24)**

- run internal rehearsal cohorts
- run external pilot validation with selected learners or instructors
- refine scoring feedback and grading tolerances
- publish release packaging, maintainer docs, and operator guides
- publish rubric-authoring guidance for third-party kit extension
- package artifacts for reuse in workshops, training, and certification-style programs

### 6. Risks and Mitigations

- **Capstones too broad:** the first release is limited to a small number of tightly scoped kits.
- **Autograder too brittle:** deterministic checks are prioritized over subjective evaluation in v1.
- **Too much overlap with curriculum proposals:** this project is framed as execution and assessment infrastructure, not a course rewrite.
- **Maintenance burden:** kits are modular and can be updated independently as Daml 3 patterns change.
- **Version drift as docs evolve:** the mirrored-doc workflow and documented pull-request path make new-version ingestion incremental and reviewable instead of requiring a single large rewrite each time.
- **Certification ambiguity:** the project supports certification-style evaluation but does not attempt to become a full certification platform in v1.

### 7. Implementation Readiness

The technical implementation is straightforward relative to protocol-facing proposals. The main design challenge is educational product quality rather than low-level systems feasibility.

Confidence in delivery:

- MVP starter kits and evaluator harness: high
- fully polished ecosystem-standard grading framework: medium-high

---

## Milestones and Deliverables

### Milestone 1: Public Alpha for One Real Capstone and Grading Contract

One capstone kit, rubric contract, and working autograder flow are usable by a new evaluator from documentation alone.

**Deliverables Structure:**

| Stage | Weeks | Description |
|-------|-------|-------------|
| 1a. Evaluation Contract | 1-2 | Define rubric, score schema, submission contract, and acceptance rules |
| 1b. Capstone Blueprinting | 3-4 | Finalize starter-kit scope, learner tasks, instructor workflow, and grading checkpoints |
| 1c. Validation Review | 5-6 | Internal dry-run review of grading design and finalization of implementation package |


### Milestone 2: External Cohort or Instructor Evaluation

At least one instructor, learner cohort, or evaluator run validates the first three kits and records grading clarity, realism, and difficulty calibration.

**Deliverables Structure:**

| Stage | Weeks | Description |
|-------|-------|-------------|
| 2a. Starter Repo Delivery | 7-11 | Build and document the first three starter kits |
| 2b. Evaluator Delivery | 12-14 | Implement evaluator CLI, rule engine, and grading outputs |
| 2c. Internal Trial Validation | 15 | Run internal rehearsal against representative learner submissions |

### Milestone 3: Hardened Reusable Assessment Release

Feedback is incorporated into the kits, grading outputs, CI runtime, maintainer documentation, and expansion workflow so another program can reuse the package directly.

**Deliverables Structure:**

| Stage | Weeks | Description |
|-------|-------|-------------|
| 3a. CI and Packaging | 16-19 | Deliver GitHub Action, CI examples, and packaging model |
| 3b. Pilot Cohort and Revision | 20-22 | Run pilot use, collect feedback, refine grading clarity and kit ergonomics |
| 3c. Final Release | 23-24 | Publish final starter kits, evaluator, maintainer docs, and release artifacts |

---

## Potential Ecosystem Beneficiaries

This proposal is intended as public-good infrastructure for the wider Canton ecosystem, and I have identified a few ecosystem teams that are well aligned with the feature set and have expressed interest in this kind of capability, including `Gateway`, `Lumens.fi`, and `Hashrupt`.

These features address recurring training and developer enablement pain that teams in this category face when building or operating Canton-based systems, especially where hands-on learning, realistic builder exercises, and repeatable evaluation are needed.

More broadly, this project is useful for all teams onboarding developers to Daml and Canton, running internal training programs or hackathons, and standardizing capstone-style assessment workflows.

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- starter kits are delivered as open-source repositories
- evaluator CLI produces deterministic grading outputs
- three fully implemented reference capstone kits are available in v1
- the release includes a scaffolded expansion library plus catalog/coverage workflow for future kit growth
- grading reports are available in machine-readable and human-readable formats
- CI integration is documented and demonstrated
- deterministic reruns against reference and failing submissions produce stable results
- a reproducible grading runtime is published for CI or local operator use
- maintainer documentation covers CI operation and authoring a new capstone kit
- official DAML/Canton docs can be mirrored locally and compared against the kit catalog using a documented coverage workflow
- future official docs versions can be brought into that workflow through a documented pull-request path
- the framework is usable without any proprietary hosted service

Project-specific acceptance conditions:

- the project must remain assessment infrastructure, not broaden into a full LMS
- at least one capstone must validate current Daml 3 migration or integration patterns
- the evaluator must detect at least a defined set of forbidden or deprecated patterns

---

## Funding

**Total Funding Request:** 2,350,000 CC

**Indicative USD Basis:** approximately $329,000 USD at a working valuation of $0.14 per CC

### Payment Breakdown by Milestone

- Milestone 1 _(Evaluation Contract and Core Capstone Design)_: 550,000 CC
- Milestone 2 _(Starter Kits and Autograder Core)_: 1,150,000 CC
- Milestone 3 _(CI Integration, Pilot Cohorts, and Release Packaging)_: 650,000 CC

### Funding Rationale

- This request is intentionally sized below a full curriculum rebuild. It funds a narrower but still reusable deliverable set: three fully implemented reference capstone kits, a broader scaffolded expansion library, a deterministic evaluator, migration-validation rules, a reference-submission regression corpus, reproducible runtime packaging, documentation, pilot validation, and the scaffolding/catalog plus docs-coverage layer for future kit expansion.
- Using a working valuation of $0.14 per CC, consistent with the valuation logic used in the recently approved Daml 3 training program proposal, the request is approximately $329,000 USD. That places the proposal in a proportionate range for a six-month infrastructure project that combines Daml kit authoring, Python tooling, schema and reporting design, release engineering, documentation, pilot hardening, and cross-environment execution validation.
- Milestone 1 funds the design and contract layer that makes the rest of the project reusable rather than ad hoc: rubric contracts, submission formats, scoring rules, migration-validation families, and capstone blueprints.
- Milestone 2 is the largest because it includes the main implementation body of the work: the three implemented starter kits, the initial scaffolded expansion library, evaluator CLI, rule engine, grading outputs, hidden/visible validation logic, the reference/failing submission corpus used for regression coverage, and the first reusable scaffold flow for adding more kits.
- Milestone 3 funds the adoption and hardening layer: CI integration, reproducible runtime packaging, pilot cohorts, release packaging, maintainer and rubric-authoring documentation, cataloging for future kit families, a mirrored-doc coverage workflow for tracking expansion against official docs, a documented new-version pull-request path, and feedback-driven refinement needed for real reuse across workshops and training programs.

### Why This Request Is Sized This Way

- This is not a thin grading script request. It is reusable assessment infrastructure: reference kits, an expansion library scaffold, a deterministic evaluator, regression fixtures, reproducible execution, and the operator-facing documentation needed to reuse the system across workshops, training cohorts, and future certification-style programs.
- The proposal is materially smaller than a full institutional training rebuild because it does not include video production, lecture content, a broad LMS-style platform, hosted grading infrastructure, or an open-ended delivery retainer.
- The higher ask is justified by the hardening layer needed for repeated real-world use: runtime packaging, regression replay fixtures, CI/operator documentation, pilot feedback cycles, maintainable kit-authoring workflows, and a measurable docs-coverage process that makes a future 30-40 kit library realistic instead of aspirational.
- The contribution model strengthens that value: new DAML/Canton docs versions should be incorporable through ordinary pull requests, so coverage can improve continuously and transparently rather than depending on occasional centralized rewrites.
- The 24-week duration is long enough to require real engineering and pilot-hardening effort, but still short enough that the funding ask should stay meaningfully below a broad curriculum or certification program.

No hosted-service budget or open-ended maintenance retainer is requested in this proposal.

## Team Background

### BitDynamics

BitDynamics brings deep experience in building and operating blockchain infrastructure. The team has worked across Ethereum client infrastructure, validator operations, and production-grade hosting systems supporting validator infrastructure securing more than 2 billion AUD in assets. This background is directly relevant to building reliable, auditable, and security-conscious public infrastructure for a grants program. Team is also building actively on Canton. 


### Volatility Stipulation

This project is expected to complete within approximately 24 weeks. If the timeline extends beyond 6 months due to Committee-requested scope changes, any remaining unpaid milestones should be re-evaluated to account for material USD/CC price volatility.

---

## Co-Marketing

Upon release, the implementing team will collaborate with the Foundation on:

- announcement coordination for the public release
- a technical blog post or written case study describing the capstone framework and evaluator design
- developer-facing promotion of the starter kits and grading workflow through workshops, demos, or ecosystem channels

---

## Motivation

This proposal addresses a practical gap in the Canton developer journey: moving from reading documentation to successfully delivering a realistic first project. Documentation and API references help developers understand concepts, but they do not by themselves provide reusable project scaffolds, assessment workflows, or repeatable signals that a learner can apply Daml 3 concepts correctly.

Reusable capstone kits and deterministic grading infrastructure create ecosystem leverage. A single open package can support internal enablement, public workshops, hackathons, certification-style evaluation, and future training programs without each team rebuilding the same exercise repositories and review logic from scratch. That makes the proposal strategically valuable even though it is smaller than a full training initiative.

---

## Rationale

The proposal is deliberately framed as developer infrastructure rather than courseware. That makes the scope more maintainable, easier to reuse across multiple programs, and more aligned with the type of durable ecosystem asset the Development Fund should support.

The chosen implementation approach balances realism and feasibility:

- real Daml SDK projects instead of toy file-only exercises
- deterministic checks instead of subjective grading heuristics
- machine-readable and human-readable outputs so the same framework works in CI and in instructor review
- modular kits so Foundations, Application Developer, and Migration tracks can evolve independently as Daml 3 and Canton patterns change

Alternative approaches such as a hosted grading platform or a broad LMS-style system would add significant operational complexity without increasing the near-term value to Canton developers. This proposal therefore focuses on a narrower package that can be built, adopted, and iterated on quickly.
