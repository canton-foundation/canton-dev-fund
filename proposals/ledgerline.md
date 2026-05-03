# Development Fund Proposal: LedgerLine

**Author:** Alex / LedgerLine project team  
**Status:** Draft — internal working draft, not yet submitted  
**Created:** 2026-05-02  
**Label:** financial-workflows-composability  
**Champion:** need Champion  
**Website / Demo:** https://ledgerlinehq.com / https://ledgerlinehq.com/dashboard  
**Reference Implementation Repository:** https://github.com/brk275/ledgerline-reference (Apache-2.0). If still private during early Draft review, access can be provided to reviewers on request; public release remains part of Milestone 1 acceptance.

---

## Abstract

LedgerLine is a reference implementation for private receivables finance workflows on Canton. It demonstrates how suppliers, buyers, lenders, settlement agents, and auditors can coordinate invoice onboarding, lender review, advance approval, settlement, exception handling, and audit visibility while preserving participant-scoped disclosure.

The project will deliver an open-source Canton/Daml reference package, executable lifecycle scenarios, a builder-facing demo dashboard, and documentation for privacy-preserving trade finance and private credit patterns. The objective is to give Canton builders a reusable implementation pattern for a high-value institutional finance workflow that depends on shared state, role-specific visibility, and auditable lifecycle transitions.

---

## Specification

### 1. Objective

Create a reusable Canton reference implementation for private receivables finance workflows.

The objective is intentionally narrow: model the lifecycle of an invoice receivable from submission through lender review, advance, repayment, settlement, late payment, dispute, and resolution. The output should help other Canton builders understand how to structure multi-party commercial finance workflows with scoped disclosure, participant-specific responsibilities, and auditable state transitions.

LedgerLine is not proposed as funding for a private SaaS product. The funded output should be a public-good reference implementation and documentation package that other teams can inspect, run, adapt, and extend for trade finance, private credit, invoice financing, and related financial workflows.

### 2. Implementation Mechanics

The implementation will consist of four layers:

1. **Canton/Daml reference model**
   - Daml templates for `Receivable`, `AdvanceAgreement`, and `SettlementRecord`.
   - Choices for lifecycle transitions such as `SubmitReceivable`, `ReviewReceivable`, `AdvanceReceivable`, `MarkSettled`, `MarkLate`, `MarkDisputed`, and `ResolveException`.
   - Daml Script flows for happy-path and exception-path receivables.
   - A privacy-oriented template decomposition that separates shared lifecycle state from sensitive commercial terms where appropriate.

2. **Executable scenario and test layer**
   - Sample invoice fixtures and lifecycle scenarios.
   - Unit tests for state transitions, role-scoped views, economics, and exception handling.
   - CLI scenario runner that prints happy-path, exception-path, invalid-transition, and role-view examples from JSON fixtures.
   - Daml compile/test instructions and CI validation where feasible.
   - Scenario runner or walkthrough for builders to reproduce the workflow locally.

3. **Builder-facing demo dashboard**
   - Public static demo showing a receivables desk, participant role switching, selected-record details, state-dependent actions, timestamped evidence trail, and advance model.
   - Dashboard data generated from the same JSON invoice fixtures and scenario-runner results used by the CLI/tests, so the public demo and repo tell the same lifecycle story.
   - Dashboard is illustrative and does not connect to production money movement, real invoices, or live counterparty data.
   - The demo is intended to help reviewers and builders understand the workflow before reading the Daml package.

4. **Documentation and handoff package**
   - Architecture guide.
   - Privacy model and participant visibility matrix.
   - Developer walkthrough.
   - Acceptance criteria and implementation notes.
   - Extension guidance for trade finance, private credit, and receivables servicing variants.

Current seed work already exists privately: a live demo site, a Daml reference skeleton, Python lifecycle tests, example data, and green CI. The funded work would harden this into a public, documented, Canton-native reference implementation.

### 3. Architectural Alignment

LedgerLine aligns with Canton architecture and ecosystem priorities in several ways:

- **Financial workflows & composability:** Receivables finance is a multi-party workflow involving suppliers, buyers, lenders, settlement agents, and auditors. Canton is well suited because each participant needs a consistent view of shared state without receiving every sensitive commercial field.
- **Reference implementations:** The proposal produces reusable templates, scenarios, and documentation that other teams can adapt for trade finance, invoice financing, private credit, or receivables servicing.
- **App building and developer experience:** The implementation gives builders a concrete example of how to model business processes on Canton rather than only token movements.
- **Regulatory and audit use cases:** The workflow includes evidence trails, exception states, and auditor-specific visibility, helping demonstrate how regulated participants can reason about lifecycle events without broad disclosure.
- **Public-good value:** The output is intended to become an Apache-2.0 reference implementation, not proprietary application code.

Relevant SIG alignment:

- Primary: financial-workflows-composability
- Secondary: daml-tooling
- Secondary: regulatory-compliance
- Secondary: dapp-integration

### 4. Backward Compatibility

No backward compatibility impact.

This proposal adds a standalone reference implementation and documentation. It does not require changes to Canton protocol behavior, existing APIs, wallets, validators, or existing applications.

---

## Milestones and Deliverables

### Milestone 1: Public reference seed and Daml baseline

| Detail | Description |
|--------|-------------|
| **Estimated Delivery** | 3 weeks from approval |
| **Focus** | Public release of baseline reference implementation, Daml compile path, and reviewer-ready documentation |
| **Funding** | USD 20,000 equivalent in CC |

**Deliverables:**

- Public Apache-2.0 repository for the LedgerLine reference implementation.
- Daml package containing baseline templates for `Receivable`, `AdvanceAgreement`, and `SettlementRecord`.
- Daml Script happy path: Draft → Submitted → Reviewed → Advanced → Settled.
- Daml Script exception path: Draft → Submitted → Reviewed → Advanced → Late → Disputed → Resolved.
- CI or documented local command that validates the Daml package and scenario tests.
- Public demo dashboard linked from the README.
- Reviewer walkthrough that lets a SIG participant or prospective Champion inspect the workflow quickly.
- Documentation for architecture, setup, and current limitations.

**Value Metrics:**

- At least one SIG/champion walkthrough completed with feedback recorded in the repository.
- At least one external Canton builder can run or review the reference package using the documented quickstart.
- The reference implementation is publicly available under an ecosystem-appropriate open-source license.

---

### Milestone 2: Privacy and participant-disclosure reference patterns

| Detail | Description |
|--------|-------------|
| **Estimated Delivery** | 4 weeks after Milestone 1 acceptance |
| **Focus** | Canton-native scoped disclosure model for sensitive receivables fields |
| **Funding** | USD 22,000 equivalent in CC |

**Deliverables:**

- Refined Daml model separating lifecycle state, advance terms, settlement records, and audit evidence into templates/views with narrower disclosure.
- Participant visibility matrix covering supplier, buyer, lender, settlement agent, and auditor.
- Examples showing which fields are visible or scoped for each participant.
- Tests or scripts demonstrating permitted and forbidden lifecycle transitions.
- Documentation describing how production implementations should avoid over-disclosure of buyer identity, invoice value, buyer tier, lender economics, and dispute evidence.

**Value Metrics:**

- Privacy model reviewed by at least one Canton/Daml expert or relevant SIG participant.
- At least two workflow variants documented: standard invoice advance and exception/dispute resolution.
- Builders can identify which template boundaries to reuse for their own private credit or trade finance application.

---

### Milestone 3: Builder walkthrough, scenario runner, and dashboard hardening

| Detail | Description |
|--------|-------------|
| **Estimated Delivery** | 4 weeks after Milestone 2 acceptance |
| **Focus** | Make the reference implementation usable as a learning and prototyping asset |
| **Funding** | USD 20,000 equivalent in CC |

**Deliverables:**

- Step-by-step developer walkthrough from local setup through happy path and exception path.
- Scenario runner or scripted validation for sample invoice fixtures.
- Expanded demo dashboard showing role switching, selected-record detail, state-dependent actions, evidence trail, and advance model.
- Documentation mapping dashboard behavior to Daml templates and choices.
- Example extension notes for trade finance, supply-chain finance, and private credit variants.

**Value Metrics:**

- At least three external reviewers/builders complete the walkthrough or provide structured feedback.
- Dashboard and docs clearly explain the lifecycle without requiring prior knowledge of the codebase.
- Scenario fixtures and tests remain reproducible from the repository quickstart, and the CLI runner produces human-readable lifecycle output for reviewers.

---

### Milestone 4: Ecosystem handoff and publication

| Detail | Description |
|--------|-------------|
| **Estimated Delivery** | 3 weeks after Milestone 3 acceptance |
| **Focus** | Final release, ecosystem education, and maintainability |
| **Funding** | USD 8,000 equivalent in CC |

**Deliverables:**

- Final public release tag.
- Maintainer notes and roadmap for future community extensions.
- Short technical walkthrough or recorded demo.
- Final report summarizing reusable patterns and known limitations.
- Co-marketing-ready summary for Canton Foundation channels, subject to Foundation review.

**Value Metrics:**

- Public release is discoverable and documented.
- At least one ecosystem discussion, SIG review, or developer walkthrough session completed.
- The project has clear maintainer ownership after grant completion.

---

## Acceptance Criteria

The Tech & Ops Committee should evaluate completion based on ecosystem value, not only artifact delivery. Proposed project-specific acceptance conditions:

- The implementation is released under an open-source license appropriate for ecosystem reuse, preferably Apache-2.0.
- A Canton/Daml developer can understand and run the reference workflow using the README and walkthrough.
- The lifecycle model demonstrates at least two complete receivables paths: standard settlement and late/dispute/resolution.
- The documentation explains how Canton participant-specific disclosure applies to receivables finance.
- The reference model is reviewed by at least one relevant SIG participant or Champion.
- The final package includes enough examples that another team could adapt it for a related financial workflow without starting from scratch.
- The work remains scoped to a reusable public-good reference implementation rather than proprietary product development.

---

## Funding

**Total Funding Request:** USD 70,000 equivalent, denominated in Canton Coin at the Committee-approved conversion approach.

This request is intentionally scoped to a reference implementation, not a production receivables application, validator operation, or mainnet service. The baseline deliverables are designed to be completed with local/devnet Daml tooling, tests, documentation, and a static public demo dashboard.

LedgerLine will not commit to running its own validator or paying third-party validator/provider fees as part of this proposal. Current public research shows that many real validator/NaaS offerings are contact-sales or quote-based; committing to unquoted operations would create delivery and budget risk that is not necessary for a reusable reference implementation.

If the Champion or Committee wants live network validation, that should be handled separately through one of the following paths:

- reviewer-provided or Foundation-provided testnet access,
- a short-lived environment operated by an existing ecosystem participant,
- a separate explicitly approved operations budget outside this reference-implementation scope.

The funded LedgerLine scope remains: Daml reference implementation, privacy model, reproducible local scenarios, documentation, and demo dashboard.

### Payment Breakdown by Milestone

- Milestone 1 — Public reference seed and Daml baseline: USD 20,000 equivalent in CC upon committee acceptance.
- Milestone 2 — Privacy and participant-disclosure reference patterns: USD 22,000 equivalent in CC upon committee acceptance.
- Milestone 3 — Builder walkthrough, scenario runner, and dashboard hardening: USD 20,000 equivalent in CC upon committee acceptance.
- Milestone 4 — Ecosystem handoff and publication: USD 8,000 equivalent in CC upon final release and acceptance.
### Network and Traffic Cost Guardrail

Canton documentation indicates that validator operation has infrastructure requirements and that Daml transactions submitted to the Global Synchronizer consume validator traffic. A certain amount of traffic is free, while additional traffic has to be bought with Canton Coin. Public provider research indicates that full validator/NaaS pricing is often quote-based; available public pricing may describe RPC/API access rather than full validator tenancy.

LedgerLine will not include validator operation, third-party provider subscriptions, mainnet service availability, or uncapped traffic purchases in this proposal. For baseline delivery, LedgerLine will target a locally runnable and documented reference implementation. Any live network validation must be separately approved and supplied by a reviewer/Foundation environment, an existing ecosystem participant, or a future operations-specific budget.

### Volatility Stipulation

The proposed project duration is under 6 months. Should the project timeline extend beyond 6 months due to Committee-requested scope changes, remaining milestones should be renegotiated to account for significant USD/CC price volatility.

---

## Co-Marketing

Upon release, the implementing team can collaborate with the Foundation on:

- Technical blog or case study describing privacy-preserving receivables workflows on Canton.
- Developer walkthrough for the Financial Workflows & Composability SIG.
- Demo dashboard link and repository announcement once public release is ready.
- Short recorded walkthrough explaining the reference implementation.

---

## Motivation

Receivables finance is a real-world institutional workflow where Canton’s architectural strengths are directly relevant. Suppliers, buyers, lenders, settlement agents, and auditors need to coordinate around shared facts, but each party should only see the information necessary for its role.

Today, many blockchain examples focus on token issuance, transfers, custody, or simple DeFi primitives. LedgerLine would broaden the set of Canton examples by showing how to model an operational finance process with private commercial terms, evidence trails, exception states, and role-scoped disclosure.

Expected ecosystem benefit:

- Builders working on trade finance, private credit, invoice finance, supply-chain finance, and receivables servicing get a concrete starting point.
- Daml developers get a multi-party workflow example that is more domain-specific than generic token examples.
- Institutional reviewers can see how Canton applies to commercial finance workflows beyond public token movement.
- The Financial Workflows & Composability SIG gains a reusable reference artifact for discussion and extension.

---

## Rationale

The proposed approach starts with a focused receivables lifecycle because it is narrow enough to implement clearly while still demonstrating Canton’s differentiated value.

Alternative approaches considered:

- **Build a full commercial receivables product:** Rejected for Development Fund scope. That would primarily benefit one application rather than the ecosystem.
- **Only publish a website/demo:** Rejected because it would not provide enough reusable technical value.
- **Only publish Daml templates without a dashboard or walkthrough:** Rejected because builders and reviewers need an understandable workflow narrative and runnable scenarios.
- **Model broader private credit generally:** Rejected as too broad for a first reference implementation.

The selected approach combines a Daml reference model, executable scenarios, privacy documentation, and a demo dashboard. This gives the ecosystem both technical artifacts and an understandable institutional finance example.

The default posture is to extend existing Canton practices rather than create new standards. LedgerLine should be a reference implementation and learning asset, not a competing standard or protocol change.
