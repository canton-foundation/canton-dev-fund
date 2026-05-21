## Development Fund Proposal

**Title:** Canton Agent Automation Kit: Safe Offchain Agents for Canton Applications

**Author:** Autonomous Finance

**Status:** Draft

**Created:** 2026-05-21

**Label:** dapp-integration

**Related SIGs:** daml-tooling, canton-apis, node-deployment-operations, financial-workflows-composability, regulatory-compliance

**Champion:** Need Champion / to be confirmed

---

## TLDR

Autonomous Finance proposes to build the **Canton Agent Automation Kit**, an open-source reference framework for running bounded offchain agents around Canton and Daml applications.

The kit will include:

- Daml patterns for automation tasks, leases, receipts, failures, pauses, and manual review.
- A TypeScript runner SDK for observing authorized party state, claiming work, submitting commands, verifying outcomes, and emitting audit events.
- Reference agents for market resolution, round settlement, oracle evidence, recurring actions, and failure handling.
- Deployment guides, security checklists, tutorials, and workshops for Canton builders.

The work will be validated through Autonomous Finance applications including [Nous](https://nousprotocol.ai/) and [Upline](https://upline.cc). Nous requires broader prediction-market settlement ingestion, while Upline requires short-interval market resolution and settlement for 5-minute up/down rounds.

This proposal does not add agent execution to validators, does not introduce arbitrary AI execution inside Canton, and does not require changes to Canton core, Splice, wallets, or validator internals. Daml contracts define workflow state and authorization boundaries; offchain agents observe party-visible state and submit authorized commands through Canton APIs.

**Total Funding Request:** 1,500,000 CC over approximately 20 weeks.

---

## Motivation

Canton applications need automation for scheduled settlement, oracle-driven resolution, recurring transfers, DCA-style actions, reward or operator reconciliation, compliance checks, stale workflow recovery, and manual review paths.

Today, teams usually build these as one-off workers or scripts. Those workers mix credentials, command construction, retry logic, business rules, network assumptions, and logging. That makes it hard to reason about party authority, allowed templates and choices, duplicate execution, retry limits, external-data conflicts, traffic cost, and what evidence is visible to operators or designated auditors.

The Canton Agent Automation Kit turns those recurring design problems into reusable patterns, code, examples, and education.

---

## Canton Fit

Canton automation must respect Canton's privacy and authorization model.

- Daml authorization is party-scoped.
- Participants only see contract state they are entitled to see.
- Commands are constrained by packages, templates, choices, disclosed contracts, signatories, controllers, and participant visibility.
- Public inspection is not global by default; auditability comes through stakeholder visibility, observers, explicit disclosure, and application logs.
- Traffic has real economic cost.
- Validators should not become arbitrary agent runtimes.

This proposal follows that model.

Daml records automation intent, workflow state, constraints, receipts, failures, and review states. The Daml package does not magically grant authority outside the application's contract model. Authority still comes from the acting party, app-specific controllers, disclosed contracts, and credentials configured by the operator.

Offchain agents run outside validators. They observe party-visible state through the Ledger API, participant JSON API, PQS/indexed queries, wallet/validator APIs, Scan-style APIs, or mocks where available. They submit only policy-approved commands through configured adapters. Receipts and failures are written back to the application workflow where the relevant stakeholders or observers can inspect them.

---

## Scope

The kit has four components.

### 1. Daml Automation Patterns

The Daml package will provide reusable templates and examples for application-controlled automation.

Initial patterns:

- `AutomationGrant`: records app-level automation intent, limits, expiry, and permitted task types. It does not override Daml authorization.
- `ScheduledTask`: represents work executable at or after a timestamp.
- `EventTask`: represents work created by application state changes.
- `TaskLease`: supports single-worker claiming through consuming choices, contract keys, or app-specific idempotency.
- `ExecutionReceipt`: records successful execution, command metadata, evidence hashes, update ids, and runner identity.
- `ExecutionFailure`: records failed attempts, retry policy, reason codes, and escalation state.
- `AutomationPause`: lets an authorized operator pause a task class.
- `ManualReview`: moves sensitive or ambiguous workflows out of autonomous execution.

These are reference patterns, not a new Canton protocol standard. App teams can copy, extend, or import them depending on their own templates and authority model.

### 2. TypeScript Runner SDK

The runner SDK will provide the offchain execution layer that app teams can reuse.

Core capabilities:

- network profiles for mock, local, devnet, testnet, and production-like environments
- adapters for Ledger API, participant JSON API, wallet/validator APIs, Scan-style APIs, and PQS/indexed reads where available
- explicit capability detection for environments with different exposed APIs
- party and credential configuration
- task discovery scoped to the runner's authorized visibility
- task claiming and idempotency helpers
- command-planning helpers
- policy checks before live submission
- retry and backoff support
- receipt and failure submission
- dry-run mode
- structured audit events and metrics

The SDK will fail explicitly when a required capability is unavailable instead of silently changing behavior.

### 3. Reference Agents

The proposal will ship a small set of concrete reference agents rather than a broad agent platform.

**Market Resolution and Oracle Evidence Agent**

- Reads configured data sources such as Polymarket, Pyth, or app-provided data feeds.
- Records source URLs, timestamps, observed values, confidence where available, hashes, signatures where available, resolver identity, and dispute state.
- Supports Upline-style 5-minute up/down rounds.
- Supports Nous-style ingestion of broader resolved market outcomes beyond short-interval markets.

**Round Settlement Agent**

- Watches application-visible round contracts.
- Detects rounds ready for resolution.
- Claims a task lease.
- Submits settlement commands under configured party authority.
- Writes execution receipts or failure records.

**Recurring Action / DCA Agent**

- Demonstrates recurring, policy-constrained actions such as a bounded transfer or DCA-style flow.
- Uses spend limits, frequency limits, expiry, recipient allowlists, dry-run planning, and update verification.

**Failure and Review Agent**

- Detects stale tasks, missing oracle data, conflicting sources, repeated failures, or unsafe retry conditions.
- Pauses or escalates workflows to manual review rather than forcing autonomous execution.

### 4. Education, Deployment, and Best Practices

The kit will include:

- implementation guide for Daml automation patterns
- runner setup guide
- Docker and Kubernetes deployment examples
- security checklist for keys, party authority, credentials, and secrets
- monitoring and alerting guide
- tutorial for scheduled settlement
- tutorial for oracle-driven resolution
- tutorial for receipts, failures, and manual review
- guide for using bounded agents from backend services
- guide for safely exposing Canton actions to AI coding agents during development
- public technical article or workshop for Canton builders

---

## Non-Goals

The kit will not:

- custody end-user funds
- silently spend user funds
- replace wallets or end-user consent flows
- provide a general-purpose CLI wallet
- provide a hosted runtime
- run arbitrary AI code inside validators
- define a new Canton protocol
- require Canton core, validator, Splice, or wallet changes
- scan all Canton state globally

Applications remain responsible for credentials, parties, deployment, business logic, user consent, and production operations.

---

## Prior Art and Ecosystem Fit

This proposal builds on existing Canton and Daml patterns:

- **Daml Triggers:** showed the value of ledger-reactive automation but are deprecated and are not the recommended base for new production applications.
- **Daml Script:** useful for setup, demos, tests, and administrative flows, but not a production long-running agent runtime.
- **Ledger API and JSON API clients:** production apps already use offchain services to read party-visible state and submit authorized commands.
- **PQS and indexed reads:** useful when app teams need structured queries over state visible to their participant.
- **Splice automations:** demonstrate practical validator-adjacent and application-adjacent automation, but are often tied to Splice-specific services, stores, and assumptions.

The Canton Agent Automation Kit adapts the useful pattern for application developers: Daml-defined workflow state plus offchain runners with explicit authority, receipts, failures, and operational controls.

---

## Deliverables

The grant will produce:

- public open-source repository with a Daml automation package, TypeScript runner SDK, adapter interfaces, mock adapter, local examples, and docs
- task discovery, lease, idempotency, command planning, receipt, failure, policy, audit-event, and metric flows
- adapter examples for Ledger API, JSON API, Scan-style APIs, wallet/validator APIs, and PQS/indexed reads where available
- reference agents for market resolution, oracle evidence, round settlement, recurring/DCA-style actions, and failure review
- Docker/Kubernetes deployment guidance, security checklist, threat model, Nous/Upline validation notes, and public article or workshop material

This is not a request for a narrow code sample. The funded work combines Daml package design, runner SDK implementation, adapter work across uneven Canton API surfaces, production-grade safety documentation, reference agents, internal dogfooding, external review, deployment material, and developer education.

---

## Milestones

### Milestone 1: Architecture, Daml Patterns, and Threat Model

- **Delivery:** 4 weeks after kickoff
- **Funding:** 250,000 CC

Deliverables:

- public repository
- architecture document
- Daml package draft with automation intent, tasks, leases, receipts, failures, pause, and manual review
- threat model covering credentials, party authority, duplicate execution, replay, retries, traffic cost, privacy, and operator pause
- deterministic mock example
- runnable scheduled-settlement example
- review with at least one Canton champion or SIG member
- feedback summary from at least two Canton ecosystem reviewers or app teams

### Milestone 2: Runner SDK and Execution Receipts

- **Delivery:** 8 weeks after kickoff
- **Funding:** 350,000 CC

Deliverables:

- TypeScript runner SDK
- network profile and capability detection system
- adapter interfaces for Ledger API, JSON API, wallet/validator APIs, Scan-style APIs, PQS/indexed reads, and mocks
- task discovery, lease claiming, command submission, receipt submission, and failure submission flows
- policy checks before live submission
- structured audit events and metrics
- local development environment
- documentation showing how an app team can add a new task type and runner handler

### Milestone 3: Reference Agents and Dogfood Integrations

- **Delivery:** 14 weeks after kickoff
- **Funding:** 500,000 CC

Deliverables:

- market resolution and oracle evidence agent
- round settlement agent for Upline-style short-interval rounds
- recurring action / DCA agent
- failure and review agent
- public demo showing at least two workflows from Daml task creation to runner execution to receipt or review state
- Nous validation note for broader market settlement ingestion
- Upline validation note for 5-minute market resolution and settlement
- implementation report documenting gaps found and changes made to the reusable kit

### Milestone 4: Education, Deployment, and Ecosystem Release

- **Delivery:** 20 weeks after kickoff
- **Funding:** 400,000 CC

Deliverables:

- public documentation site or docs folder
- Docker and Kubernetes deployment guides
- operator security checklist
- tutorials for scheduled settlement, oracle resolution, receipts/failures, and recurring actions
- guide for safe AI-agent use during development
- public technical article or recorded walkthrough
- at least two named adopter conversations, integrations, or pilots beyond the internal validation path
- adoption and feedback report summarizing external reviews, issues filed, example usage, and recommended next steps

---

## Acceptance Criteria

The proposal should be accepted as complete when:

- the repository is public and open source
- Daml templates and examples are documented
- a developer can run a local scheduled-settlement example from task creation to receipt
- the runner demonstrates task discovery, lease claiming, idempotency, command submission, receipt writing, and failure handling
- live actions are policy-checked before submission
- unsafe or unsupported actions fail before network submission
- party visibility and credential assumptions are documented for each adapter
- at least three reference agents are runnable or demonstrated
- Upline demonstrates a short-interval market resolution and settlement flow using the kit
- Nous demonstrates broader market settlement ingestion using the same patterns
- security documentation covers key custody, scoped authority, traffic budget, replay protection, audit events, and manual review
- external reviewer feedback is reflected in public issues, docs, or release notes

---

## Funding

**Total Funding Request:** 1,500,000 CC

Payment breakdown:

- Milestone 1: 250,000 CC
- Milestone 2: 350,000 CC
- Milestone 3: 500,000 CC
- Milestone 4: 400,000 CC

The request reflects the goal of producing reusable ecosystem infrastructure rather than a single application worker. Milestone 1 validates the architecture and safety model before larger implementation work proceeds. Milestone 2 funds the reusable runner layer and adapter surface. Milestone 3 funds the production-relevant reference agents and dogfood integrations through Nous and Upline. Milestone 4 funds the documentation, deployment, adopter feedback, and release work required for other Canton builders to use the kit without relying on Autonomous Finance.

The project is expected to complete within approximately 20 weeks after kickoff. If Committee-requested scope changes materially extend the project, remaining milestone scope and payment timing should be renegotiated.

---

## Risks and Mitigations

- **"Agent" is interpreted as unrestricted autonomous execution:** define agents as bounded offchain workers constrained by Daml workflow state, manifests, policies, parties, and explicit submissions.
- **Daml patterns are mistaken for protocol-level authority:** document that templates record app-level intent and constraints; they do not override Daml authorization or credentials.
- **Canton privacy model is misunderstood:** agents only see party-visible state, and receipts are visible to relevant stakeholders, observers, or disclosed verification surfaces, not globally by default.
- **Duplicate or unsafe execution occurs:** use consuming choices, contract keys, idempotency keys, race-condition tests, traffic-budget estimates, policy checks, pause controls, and manual review paths.
- **External data sources are unavailable or conflicting:** record evidence, failure states, and review paths instead of forcing settlement.
- **Scope creeps into wallet, hosted runtime, or harness work:** keep the grant focused on Daml patterns, runner SDK, reference agents, deployment guidance, and education.

---

## Relationship to Canton Wiki

This proposal is independent from Canton Wiki, but the workstreams reinforce each other. Canton Wiki can explain Daml Triggers, Daml Script, Ledger API clients, PQS, and Splice-style automation, and can catalog tutorials, reference agents, and public examples. The kit can later dogfood against Canton Wiki operations such as stale-source checks or review queues, but those wiki automations are not acceptance requirements.

---

## Team

Autonomous Finance has built agentic and data-intensive financial applications, developer tooling, high-value infrastructure, and education in the AO ecosystem.

Relevant public work includes [Nous](https://nousprotocol.ai/), [Upline](https://upline.cc), Botega, Dexi, CoinMaker, [AO Link](https://www.ao.link/), AOForm, and reusable AO packages. The team also built AO bridge infrastructure that secured over $800M at peak according to internal/onchain metrics, and built [Permaindex](https://docs.autonomous.finance/core-financial-infrastructure/permanent-index-pi), an autonomous yield-delegation, index, and launch-support system for AO.

This experience is relevant because the proposal combines agent-oriented financial workflows, safety boundaries, high-value operations, developer tooling, and education for a technically unfamiliar application platform. The Canton implementation will be Canton/Daml-specific and validated through Nous, Upline, public examples, and external reviewer feedback.

---

## Co-Marketing

Upon release, Autonomous Finance will collaborate with the Foundation on announcement coordination, a technical article, a developer walkthrough or workshop, and case studies based on Upline's short-interval resolution workflow and Nous settlement-outcome ingestion.

---

## External References

- [Canton Network Docs: Privacy Model Explained](https://docs.canton.network/overview/learn/privacy-model)
- [Canton Network Docs: Smart Contract Consensus](https://docs.canton.network/overview/reference/smart-contract-consensus)
- [Daml Triggers Deprecated](https://docs.daml.com/triggers/index.html)
- [Daml Off-Ledger Automation Overview](https://docs.daml.com/daml-off-ledger.html)
- [Messari: Understanding Canton Network](https://messari.io/report/understanding-canton-network-a-comprehensive-overview)
