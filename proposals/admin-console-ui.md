## Development Fund Proposal

**Author:** [Noders LLC](https://noders.team/)
**Status:** Submitted  
**Created:** 2026-03-09

---

## Abstract

This proposal requests funding for an open-source operational tool for Canton node management: a **UI wrapper over the Canton CLI and node administration workflows** that simplifies day-to-day interaction with validator and participant infrastructure.

We already have an MVP that supports **adding, removing, and managing accounts, users, rights, and parties**, as well as **validator management and validator parameter configuration**. Over the next 3 months, we want to evolve this MVP into a broader ecosystem-grade operations tool with support for **DAR deployment and version management, OIDC authentication, identity backups, REST API, and logging/monitoring**.

The value to the Canton ecosystem is straightforward: many node and participant operations are operationally important but still too dependent on low-level CLI usage and custom internal scripts. This proposal turns those workflows into a reusable, open-source admin layer that can reduce operator error, improve usability, and make Canton infrastructure easier to manage for technical teams.

---

## Specification

### 1. Objective

**Problem:** Canton node and participant operations still require a high level of operational familiarity with CLI commands, internal procedures, and manual workflow coordination. In practice, this creates several recurring problems:
- high operational overhead for routine admin tasks;
- dependency on low-level CLI knowledge for participant and validator management;
- greater risk of human error when performing identity, permission, party, and validator operations;
- fragmented internal tooling across teams, with the same operational UI/API layer being rebuilt multiple times;
- lack of a reusable operational interface for broader ecosystem adoption.

There is also an ecosystem adoption problem: operating infrastructure is easier and safer when teams have a consistent management layer instead of relying on handwritten scripts and direct CLI interaction. A UI/admin wrapper does not replace the Canton CLI — it makes it more accessible, more auditable, and easier to integrate into real operational workflows.

**Outcome:** Provide an open-source operations tool that gives teams a practical management layer above the Canton CLI and node administration workflows:
- UI-based management for accounts, users, rights, and parties;
- validator management and parameter configuration;
- a roadmap toward contract deployment management, identity safety, auth, observability, and automation-friendly APIs.

**Success looks like:**
- Operators can manage routine Canton node workflows through a safer and more structured interface.
- Teams reduce reliance on custom internal scripts for common participant and validator operations.
- The tool becomes a reusable open-source operational layer for Canton deployments.
- Over time, the tool supports a broader operational lifecycle: auth, contract deployment, backups, APIs, and monitoring.

---

### 2. Implementation Mechanics

This proposal covers the completion and expansion of an existing MVP into an ecosystem-grade operational tool.

The current MVP already includes:
- adding, removing, and managing **accounts**;
- adding, removing, and managing **users**;
- managing **rights/permissions**;
- managing **parties**;
- managing **validators and validator parameters**.

This means the proposal is not speculative: the core UI/admin layer already exists and has proven the operational value of wrapping common Canton CLI workflows into a more usable interface.

---

#### Workstream A — Core Node Administration UI

**What it is**

A UI-based operational wrapper above Canton CLI / admin workflows for common participant and validator tasks.

**What is already delivered in MVP**
- Account management
- User management
- Rights/permission management
- Party management
- Validator management
- Validator parameter configuration

**Why it matters**
These are among the most common and operationally sensitive node workflows. Exposing them through a structured interface reduces manual friction and makes operational procedures easier to execute consistently.

**Why it needs funding**
The MVP proves the concept, but it still needs hardening, packaging, access control, broader workflow coverage, and ecosystem-facing documentation before it can serve as a shared open-source admin tool.

---

#### Workstream B — Contract / DAR Lifecycle Management

**What it is**

A management layer for deploying and operating DAML/DAR packages through the same admin tool.

**Planned scope**
- DAR upload and deployment workflows
- contract/package status visibility
- package version visibility and lifecycle tracking
- safer contract deployment management for operational teams

**Why it matters**
Contract/package deployment is one of the most important operational workflows around Canton nodes, and today it is often still handled via direct commands and ad hoc operator knowledge. Bringing this into the tool makes node operations more complete and much easier to manage.

---

#### Workstream C — Operational Safety, Access, and Observability

**What it is**

A broader set of features that make the tool production-ready and easier to adopt in real infrastructure environments.

**Planned scope**
- **OIDC authentication**
- **identity backups**
- **REST API**
- **logging and monitoring**

**Why it matters**
Without auth, backups, observability, and automation-friendly APIs, an admin interface remains an internal utility rather than a reusable ecosystem tool. These features move the project from useful MVP to operational infrastructure.

---

### 3. Architectural Alignment

This proposal aligns with Canton architecture by improving the operator-facing layer around participant and validator administration:

- **CLI-backed operational interface:** the tool builds on existing Canton operational capabilities rather than replacing them, giving teams a safer and more accessible management surface.
- **Participant and validator administration:** accounts, users, rights, parties, and validator parameters are core parts of real Canton node operations.
- **Contract lifecycle operations:** DAR deployment and version/status visibility connect operational tooling with the contract/package lifecycle.
- **Operational safety:** authentication, backups, and observability improve the safety and maturity of node administration workflows.
- **Ecosystem reuse:** by open-sourcing the tool, the proposal reduces the need for each team to build its own internal admin wrapper around the Canton CLI.

Together, these improvements create a practical operational layer that complements the existing Canton admin model and makes infrastructure easier to manage in real environments.

---

### 4. Backward Compatibility

- The tool will remain aligned with the underlying Canton CLI and administration workflows.
- As Canton operational commands and admin surfaces evolve, compatibility updates will be delivered through normal release and maintenance cycles.
- Any breaking UI/API changes introduced by the tool itself will be versioned and documented with migration notes where appropriate.

**Expected impact:** minimal disruption; the tool acts as an operator-facing layer on top of existing Canton administration capabilities and will evolve alongside them.

---

## Milestones and Deliverables

> Note: Since an MVP already exists, the milestones below focus on expanding it into an ecosystem-grade open-source operations tool over a 3-month development window.

### Milestone 1: Open-Source MVP Hardening + Core Admin Flows
- **Estimated Delivery:** 2026-04-15
- **Focus:** Turn the current MVP into a usable and shareable open-source operational tool.
- **Deliverables / Value Metrics:**
  - Open-source release of the current tool with clear repository structure and setup instructions.
  - Hardening of existing account/user/rights/party/validator workflows.
  - Documentation for the current operational model and supported workflows.
  - Initial packaging/deployment guide.
  - Improved UX consistency for core node administration actions.

### Milestone 2: DAR / Contract Lifecycle Management + REST API
- **Estimated Delivery:** 2026-05-15
- **Focus:** Expand the tool from identity/admin operations into contract/package lifecycle operations and integration-friendly access.
- **Deliverables / Value Metrics:**
  - DAR upload and deployment workflows.
  - Contract/package status visibility.
  - Package version visibility and version-tracking support.
  - Initial **REST API** for automation and integrations.
  - Documentation and examples for contract/package management flows.

### Milestone 3: Security, Reliability, and Node Operations Expansion
- **Estimated Delivery:** 2026-06-15
- **Focus:** Make the tool safer and more production-ready for broader ecosystem use.
- **Deliverables / Value Metrics:**
  - **OIDC authentication**
  - **Identity backup** workflows
  - **Logging and monitoring**
  - Final operational documentation, release notes, and roadmap recommendations

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:
- delivery of the milestone features described above;
- demonstrated usability for operational Canton node workflows;
- documentation and setup guidance sufficient for external teams to use the tool;
- evidence that the tool reduces reliance on direct CLI usage for common administrative workflows.

Project-specific conditions:
- The tool should be released as an open-source project.
- Core workflows must be clearly documented.
- Operationally sensitive features (auth, backup) should include usage guidance and limitations.
- REST API scope should be documented clearly enough for ecosystem teams to integrate against it.

---

## Funding

**Total Funding Request:** 460,000 CC

### Payment Breakdown by Milestone
- Milestone 1 (Open-Source MVP Hardening + Core Admin Flows): **160,000 CC** upon committee acceptance
- Milestone 2 (DAR / Contract Lifecycle Management + REST API): **150,000 CC** upon committee acceptance
- Milestone 3 (Security, Reliability, and Node Operations Expansion): **150,000 CC** upon final release and acceptance

### Volatility Stipulation
If the project duration is **under 3 months**:  
Should the project timeline extend beyond 3 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility.

---

## Co-Marketing

Upon milestone completion / release, the implementing entity will collaborate with the Foundation on:
- announcement coordination for major releases and open-source availability;
- a technical blog post or case study on operational management of Canton participants and validators;
- developer/operator enablement materials such as setup guides, demos, workshops, or walkthrough sessions, if desired by the Foundation.

---

## Motivation

These deliverables are valuable to the Canton ecosystem because they:
- reduce the operational burden of managing participants and validators;
- lower the risk of human error in routine administrative workflows;
- provide a reusable open-source alternative to ad hoc internal admin tooling;
- make Canton infrastructure easier to operate for technical teams;
- extend operational tooling beyond identities and validators into package lifecycle management, auth, backups, APIs, and observability.

In practice, this tool can make real Canton deployments easier to manage, easier to standardize, and easier to adopt.

---

## Rationale

Funding this work is valuable because it converts an already useful MVP into a broader ecosystem operational tool:

- **The need is real.** Teams operating Canton infrastructure repeatedly need a management layer above raw CLI workflows.
- **The MVP already exists.** This is not a speculative build; the initial admin workflows have already been implemented.
- **Open-source leverage matters.** Without a shared tool, each team is likely to build its own internal wrapper and repeat the same work.
- **Operational maturity matters.** Features such as auth, backups, REST APIs, and monitoring are what turn a useful utility into infrastructure-grade tooling.

This approach helps create a reusable operational standard for Canton node administration rather than leaving each team to solve the same UX and operations problem independently.
