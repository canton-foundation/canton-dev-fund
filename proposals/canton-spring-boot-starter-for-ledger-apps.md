## Development Fund Proposal: Canton Spring Boot Starter for Ledger Apps

**Author:** Deepthi
**Status:** Submitted  
**Created:** 2026-03-23  

---

## Abstract

This proposal requests funding for an open-source **Spring Boot starter and backend integration toolkit** for Canton-connected ledger applications.

Many institutional teams evaluating Canton are Java and Spring-first. Today, those teams still need to assemble a large amount of service integration glue themselves: participant-facing client wiring, auth token handling, health checks, configuration management, projection checkpoints, retry boundaries, idempotent submission patterns, and realistic local integration testing. That repeated work slows adoption and produces inconsistent backend quality across teams.

The proposed project, **Canton Spring Boot Starter for Ledger Apps**, will provide:

- Spring Boot auto-configuration for Canton-connected services
- reusable client and auth wiring for participant-facing APIs
- projection checkpointing, replay-safe processing, and idempotent submission helpers
- Spring Actuator health indicators, metrics, and configuration conventions
- JUnit and Testcontainers-based local integration testing support
- reference backend services and operator-friendly documentation

The goal is not to build a hosted platform, not to redefine Canton APIs, and not to replace frontend or wallet-focused SDK work. The goal is to give Java backend teams a production-grade, reusable, open-source starting point for Canton-connected services.

---

## Specification

### 1. Objective

The objective is to reduce Java backend adoption friction for Canton by publishing a reusable integration layer that helps teams go from "Canton-compatible idea" to "working Spring service" faster and with fewer custom mistakes.

The intended outcome is that a Java team can:

- bootstrap a Spring Boot service with Canton-specific auto-configuration
- connect to participant-facing APIs with less handwritten plumbing
- consume ledger events with checkpointed and replay-safe processing
- submit commands with clearer idempotency and retry boundaries
- expose health, metrics, and readiness checks using familiar Spring patterns
- run realistic local integration tests without building a custom harness from scratch

This proposal is explicitly framed as **ecosystem infrastructure** and a **backend integration starter**, not as a hosted application platform and not as a replacement for wallet, frontend, or generic dApp SDK work.

### 2. Why This Matters Now

Java backend adoption is one of the most practical paths for Canton growth, especially for institutional teams already standardized on Spring Boot and JVM service patterns.

Without a Spring-native starting point, every backend team repeats the same work:

- wiring participants and auth into service startup
- defining retry and idempotency boundaries by hand
- deciding how to checkpoint ledger projections
- inventing health, readiness, and metrics conventions
- building local test scaffolding from scratch

This is not high-value differentiation for individual teams. It is repeated ecosystem tax. The result is slower adoption, more fragile backend services, and more time spent rebuilding infrastructure that should already exist as a reusable public-good layer.

### 3. Implementation Mechanics

The project will be delivered as:

- a Spring Boot starter for Canton-connected backend services
- a JVM integration library for projection and submission patterns
- JUnit/Testcontainers support for local integration workflows
- reference backend services and deployment/testing documentation

#### A.1 V1 Support Boundary

To keep the first release practical and reviewable, v1 will target a narrow, explicit support envelope:

- **Java 21**
- **Spring Boot 3.4.x**
- one primary participant-facing runtime path via the **Ledger API gRPC Java bindings**
- one documented checkpoint persistence strategy based on **Spring JDBC with PostgreSQL**
- one documented local integration environment path based on **Testcontainers plus a cn-quickstart-backed local environment**

This proposal does **not** claim universal compatibility across all possible Canton deployment models, all Java frameworks, or all JVM service architectures in its first funded release.

The first release should optimize for:

- one clearly documented happy path
- one realistic local development and CI workflow
- one projection-oriented service archetype
- one command/submission-oriented service archetype

This makes milestone acceptance clearer and reduces the risk of over-promising framework coverage too early.

#### B. Spring Boot Starter Layer

The starter will provide:

- property-based configuration conventions for participant endpoints and auth
- auto-configured Canton client beans
- sane defaults for connection pooling, retry boundaries, and timeouts
- Spring Actuator health indicators for ledger connectivity and projection state
- environment-aware configuration profiles for dev, test, and deployed services

#### C. Projection and Submission Toolkit

The core runtime library will provide:

- checkpointed projection consumption patterns
- replay-safe event processing helpers
- idempotent command submission helpers with documented boundaries
- error classification for common Canton integration failures
- typed hooks for application-specific handler logic

The aim is not to hide Canton semantics, but to package the recurring backend patterns that most services need.

#### D. Testing and Local Development Support

The project will include:

- JUnit integration helpers
- Testcontainers-based local environment support
- reference test fixtures for DAR upload, party provisioning, and happy-path workflows
- baseline smoke tests for service startup, projection replay, and submission handling

This lowers one of the biggest barriers to enterprise backend adoption: repeatable local testing that feels familiar to Java teams.

#### E. Reference Applications

To make the library usable rather than theoretical, the project will include at least:

- one projection-oriented backend reference service with persisted checkpoint handling
- one command/submission-oriented backend reference service with documented idempotency-key handling
- documentation showing how to adapt the starter to a real service architecture

These reference services are the design target for the starter from the beginning of the project. They are not included as toy samples after the fact; they are the concrete service archetypes used to prove that the starter solves real backend integration work rather than only wrapping APIs abstractly.

#### Explicitly Out of Scope

To keep the proposal focused, the following are out of scope:

- frontend wallet connectivity
- browser SDKs
- production hosting or managed infrastructure
- redefining participant APIs
- broad code generation or package discovery work outside the needs of the starter
- replacing general-purpose SDKs, DevKit-style workflows, or environment-management CLIs

### 4. Architectural Alignment

This proposal aligns with Canton ecosystem priorities because it reduces backend adoption friction for one of the most common institutional development stacks: Java plus Spring Boot.

It delivers shared public-good value by:

- lowering the cost of building backend services on Canton
- reducing repeated custom integration glue across teams
- improving consistency in health checks, replay handling, and submission boundaries
- making Canton more accessible to enterprise engineering teams that expect Spring-native patterns

It complements rather than replaces:

- frontend and dApp SDK efforts
- generic developer tooling
- app-specific backend code

### 5. How This Differs from Similar Proposals

This proposal is more backend-specific than other developer-tooling efforts in the ecosystem.

- Compared with broader developer toolkits such as `DevKit`, this proposal focuses on **runtime service integration**, not dependency management, package discovery, or documentation extraction.
- Compared with client-side integration efforts such as `AppKit` or wallet and dApp SDK proposals, this proposal focuses on **Spring Boot backend services**, not frontend bindings, wallet connectivity, or signing flows.
- Compared with language SDK proposals, this proposal focuses on **application-service conventions and infrastructure patterns** for JVM teams rather than general-purpose client coverage for a programming language.

The core differentiator is that this project packages the **backend service-runtime layer** that enterprise Java teams still need after a base SDK exists:

- Spring bean lifecycle and environment wiring
- Actuator health, readiness, and metrics conventions
- projection checkpoint persistence and replay boundaries
- idempotent submission boundaries inside long-running services
- JUnit/Testcontainers integration patterns for backend teams

These are framework-bound concerns, not generic SDK concerns. They are best packaged as a Spring-native starter rather than pushed into broader, framework-agnostic toolkits where they would either:

- become optional edge modules with weak ownership, or
- force broader proposals to absorb framework-specific complexity that is not central to their own goals.

The intended relationship is therefore **compositional, not competitive**:

- this starter should be able to consume or sit beside broader SDK work
- it should use existing Canton participant-facing APIs rather than inventing new ones
- it should complement DevKit/Auth/AppKit-style efforts instead of duplicating them

The standalone value of this proposal is that it turns a recurring, framework-specific institutional adoption problem into a reusable public-good package for one of the most common enterprise backend stacks.

### 5.1 What Reviewers Should Expect This Project To Reuse

To keep the overlap boundary clear, the project is expected to reuse adjacent ecosystem work where practical rather than rebuild it:

- package discovery, dependency workflows, and broader environment tooling should remain the concern of general developer-tooling efforts
- auth harnesses and token-fixture workflows should remain the concern of dedicated auth-development tooling
- frontend bindings, wallet connectivity, and signing flows should remain the concern of AppKit / wallet / dApp SDK efforts

The Spring Boot starter is valuable precisely because it sits **after** those building blocks and standardizes how a JVM backend service uses them.

### 6. Delivery Feasibility

This proposal is intentionally practical and buildable because:

- Spring Boot starter patterns are well-understood
- the value lies in packaging repeated integration patterns rather than inventing new protocol behavior
- reference services and tests make milestone acceptance objective

The hardest parts are:

- defining good replay and idempotency boundaries
- packaging test workflows cleanly
- choosing a starter surface that is useful without over-abstracting Canton

### 7. Risks and Mitigations

- **Scope creep into a full backend framework:** the first release is limited to starter wiring, projection/submission helpers, tests, and reference services.
- **Over-abstraction risk:** the starter exposes documented extension points and does not try to hide Canton semantics completely.
- **Integration drift across environments:** the project includes test fixtures and reference configuration patterns to reduce ambiguity.
- **Adoption risk:** the inclusion of reference services and local testing support makes the toolkit easier for teams to evaluate quickly rather than treating it as a thin wrapper library.

### 8. Backward Compatibility

No backward compatibility impact is intended.

This project is additive. It introduces a reusable backend integration layer without changing Canton protocol behavior or existing application semantics.

---

## Milestones and Deliverables

### Milestone 1: Public Alpha for Spring-Based Canton Service Bootstrapping

A new JVM team can boot a reference Canton-connected service using the starter and documented v1 support matrix.

### Milestone 2: External Evaluator Run for Runtime Patterns

At least one evaluator validates projection, submission, and logging behavior in a real sample backend workflow.

### Milestone 3: Hardened Team-Adoptable Backend Toolkit

Testcontainers and JUnit support and reference services are refined from feedback and demonstrate restart-safe projections and idempotent submissions.

### Milestone 4: Release and Pilot-Backed Hardening

Versioned artifacts, example repository, migration documentation, and hardening notes are published after a documented pilot evaluation run.

---

## Acceptance Criteria

The Tech & Ops Committee can evaluate completion based on:

- Spring Boot starter successfully boots a reference Canton-connected service
- projection toolkit supports checkpointed replay in a reference workflow
- submission toolkit demonstrates documented idempotency boundaries
- local integration testing works via JUnit/Testcontainers support in a reference environment
- reference services and documentation are published as open source
- the released documentation includes a clear v1 support boundary covering the supported Java/Spring baseline, integration path, and test environment assumptions
- the projection reference service demonstrates persisted checkpoint recovery on restart
- the command reference service demonstrates idempotency-key or equivalent duplicate-submission protection in a documented workflow
- the starter/runtime modules are published as versioned JVM artifacts in a documented package registry and accompanied by a CI-usable example repository
- at least one documented pilot evaluation run is completed using a defined feedback checklist, and its findings are reflected in the final hardening notes

Project-specific acceptance conditions:

- the project must remain backend and Spring-focused
- the release must include both runtime helpers and test/integration support
- documentation must clearly explain extension points and Canton-specific boundaries rather than pretending the starter replaces application design

---

## Funding

**Total Funding Request:** 900,000 CC

### Payment Breakdown by Milestone

- Milestone 1 _(Spring Boot Starter Foundation)_: 200,000 CC upon committee acceptance
- Milestone 2 _(Projection and Submission Toolkit)_: 260,000 CC upon committee acceptance
- Milestone 3 _(Test Harness and Reference Services)_: 260,000 CC upon committee acceptance
- Milestone 4 _(Documentation, Hardening, and Open-Source Release)_: 180,000 CC upon final release and acceptance

### Funding Rationale

This proposal funds a real backend integration package, not a thin wrapper around existing APIs.

The requested amount is justified by four substantial deliverable areas:

- a production-oriented Spring Boot starter layer
- a reusable projection and submission runtime toolkit
- a local integration-testing harness with JUnit and Testcontainers
- reference services and documentation that make adoption realistic for actual teams

The largest milestones are the runtime layer and the test/reference-service layer because they create the bulk of reusable engineering value. This is also where most of the integration correctness work sits: replay safety, checkpointing, idempotency boundaries, and realistic local test environments.

The ask is intentionally narrower than broader multi-surface SDK or platform proposals because this proposal stays focused on one high-value developer segment: JVM backend services. No hosted-service budget, frontend budget, or open-ended maintenance retainer is requested.

The reduced ask also reflects an approval-oriented scope choice:

- one explicit v1 support matrix rather than broad framework coverage
- one primary runtime integration path
- two concrete reference-service archetypes rather than a large starter catalog
- one documented pilot evaluation run rather than a broad adoption program

### Volatility Stipulation

If the project duration extends materially due to committee-requested scope changes, remaining milestone amounts should be renegotiated for material CC/USD volatility.

---

## Co-Marketing

Upon release, the implementing entity will collaborate with the Foundation on:

- announcement coordination
- one backend-focused technical write-up on Spring Boot service patterns for Canton
- one developer walkthrough or demo of the starter and local test workflows

---

## Team Background

Strong product engineering experience building scalable software systems in large enterprise environments, including work with Fortune 100 organizations such as Accenture. This background includes delivering high-scale products, working across structured operational workflows, and translating complex business processes into dependable software systems.

---

## Motivation

Java backend teams are one of the most natural institutional developer audiences for Canton, but the ecosystem still asks them to assemble too much custom integration plumbing before they can get productive.

Without a Spring-native starting point, every team repeats the same work around auth, projection checkpoints, health checks, retries, configuration, and local test harnesses. That slows adoption and reduces consistency across real backend services.

This proposal turns those repeated integration problems into reusable public-good infrastructure and shortens the path from evaluation to real backend deployment.

---

## Rationale

This is the right scope because it targets a specific, high-value developer audience with a concrete and reusable infrastructure layer.

It is attractive for the ecosystem because:

- it lowers adoption friction for enterprise Java teams
- it creates reusable backend patterns rather than one-off application code
- it complements broader SDK work by focusing on the service-runtime layer teams still need to build
- it is practical, testable, and likely to become a durable ecosystem asset

### Additional Reviewer-Friendly Success Conditions

To make the value legible to reviewers, the project should be judged not just by library publication but by whether it reduces repeated backend setup work in a concrete way.

Strong signs of success include:

- a new JVM team can stand up a reference service without writing custom startup/auth/health boilerplate first
- the starter works cleanly with at least one realistic local integration environment
- projection replay and submission helper boundaries are documented clearly enough that teams do not have to rediscover them privately
- the reference services feel like real backend archetypes rather than toy demos
