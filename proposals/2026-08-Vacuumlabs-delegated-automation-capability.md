# Development Fund Proposal for Delegated Automation Capability
- **Author:** Uroš Kočišević
- **Org:** Vacuumlabs
- **Status:** Draft
- **Created:** 2026-08-06
- **Label:** `daml-tooling`
- **Champion:** need Champion

## Abstract

This proposal requests funding to validate and deliver an open source reference implementation and standards candidate for authorization, delegation, and automation of smart contract interactions for Canton applications. A user will be able to create an authorization grant that permits a party to exercise one typed application action under ledger constraints, such as expiration, maximum number of executions, cooldown period between executions and other application level constraints.
The deliverables include a reusable Daml authorization interface, supporting interfaces for authorization scope, triggers, and request payloads, three reference adapter templates, a TypeScript automation runner, a reference TestNet deployment evaluated by at least two external Canton application teams or ecosystem builders, and a normative specification suitable for consideration as a Canton Improvement Proposal.
The runner will act only as its own operator party. It will not receive the user's keys or actAs rights. Application authority will be granted through Daml contracts and will remain constrained, visible, revocable, and auditable on ledger.
## Specification
### 1. Objective
The single objective is to prove and deliver a reusable, privacy preserving method for Canton users to authorize bounded automated execution of application actions without giving an automation service possession of the user's signing credentials.
Today, an application that needs a scheduled or state triggered action generally has to choose among three incomplete approaches:
- require the user to sign every action manually;
- keep broad user credentials available to an application backend; or
- design and maintain an application specific delegation contract and scheduler.
The intended outcome is a shared authorization and runner pattern that application teams can adopt through a small typed adapter instead of rebuilding the security model, retry logic, job storage, and operational controls for each application.
### 2. Implementation Mechanics
#### 2.1 Daml Authorization package

The project will publish a Daml Package for the Authorization interface and supporting interfaces for authorization scope, triggers, and request payloads, finalized by the end of Milestone 2.

Each app specific authorization template that implements the interface will expose a common view containing at least:
- Principal party;
- Operator party;
- Authorization identifier and version;
- Valid from and expiry time;
- Maximum execution count and Executions used;
- Last execution timestamp and cooldown time period;
- typed target summary;
- human readable constraint summary; and
- optional auditor or application operator visibility.
The app specific authorization template will hold the typed target contract identifiers and action arguments required by that application. The common interface will not attempt to encode arbitrary method names or dynamically typed arguments.
Each authorization will provide two core operations:
- Execute, controlled by the Operator, which checks all on ledger constraints and invokes the typed target action; and
- Revoke, controlled by the Principal, which terminates the authorization by archiving the contract.
The principal will be a signatory of the authorization contract and the operator will be an observer and the controller of Execute. Milestone 1 will validate the exact Daml authorization path for nested target exercises. The authorization cannot bypass any authority required from other target contract parties.
Execute will be consuming. When additional executions remain, the choice will create the next authorization state with updated execution count and next eligible time. This makes the active authorization contract version the concurrency and replay boundary.
The initial release will use one authorization per typed action, for a single party operator and single party principal. It will not use one broad contract containing an arbitrary list of unrelated methods. This keeps grants inspectable, revocable, and compatible with Daml's static type system.
#### 2.2 Reference automation runner
A TypeScript reference runner will use the supported Canton Ledger API to:
- subscribe to authorization contracts visible to its operator party;
- register declarative jobs for those authorizations;
- evaluate time based schedules and ledger visible state or event conditions;
- submit the typed Execute choice as the operator party;
- apply command deduplication, retry, randomized backoff, and stale state handling; and
- expose structured logs, metrics, and a job status API.
The runner will use an embedded SQLite store in the reference deployment and a documented storage abstraction for other implementations. The store will contain wake up schedules, checkpoints, and operational history. It will not contain authority that is absent from the active on ledger authorization contract.
The reference runner credential will have actAs for the automation operator only. It will not have actAs for any principal.
The design does not require a single shared operator across authorization grants. Different users and organizations may use different operator parties and runner deployments. The reference runner can be self hosted by an organization, operated by an application provider, or provided as a third party service. In all cases, the runner acts only as its designated operator party and does not require the principal's actAs rights.
#### 2.3 Supported triggers
The first release will support:
- interval and cron style time triggers; and
- conditions derived from contracts and events visible to the automation operator on the same synchronizer.
Runner wake up time is advisory. The authorization contract will enforce time limits using ledger transaction time at execution.
External web data, price oracles, cross synchronizer coordination, and arbitrary user supplied code execution are outside this proposal.
#### 2.4 Visibility
The runner can read only contracts visible to its operator party. It will not assume that it can read every contract visible to the principal.
An app adapter must therefore make the minimum target context visible to the operator or place the required context in the authorization contract.
The reference TestNet deployment will use directly visible target state so that the runner can construct and submit the required transactions using only contracts visible to the operator.
#### 2.5 Reference adapters
The project will include three independently testable adapters:
- A bounded recurring state update with maximum executions and minimum interval.
- An amount capped value action that rejects execution above an on ledger limit.
- A nested application choice that requires authority derived from the principal's authorization grant and demonstrates that the operator does not need the principal's Ledger API rights.
#### 2.6 UI Dashboard

The project will also ship a UI tool for viewing:

- The list of authorizations granted to and granted by the party logging in.
- Transaction hashes, Request summaries.
- Authorization grants info, list of grant info including cooldown time, expiration timestamp etc.
- List of all Execute calls, transaction details etc.
- Button to revoke the authorization grant.

The dashboard allows users to inspect authorization grants, review execution history, and revoke active grants.
#### 2.7 Security and operational controls
The implementation will include:
- principal controlled revocation;
- validity windows, execution count limits, interval limits, and typed app limits;
- no arbitrary code execution or method name dispatch;
- consuming state transitions to prevent two successful executions from the same authorization version;
- command deduplication and idempotent retry behavior;
- stale contract handling and transaction failure classification;
- least privilege Ledger API configuration;
- documented incident procedure for suspected operator credential compromise, covering suspension of runner submissions, identification of affected authorizations, revocation or invalidation of affected grants, and restoration of service using a replacement operator;
- metrics for job lag, attempts, failures, retries, and successful executions; and
- a public threat model covering credential theft, replay, job database tampering, malicious adapters, privacy leakage, liveness failure, and revocation races.
The implementation must provide a practical recovery path from operator credential compromise without requiring principal signing credentials to be transferred to the replacement operator.
#### 2.8 Standards output
The project will publish a normative specification covering the authorization interface, required semantics, security invariants, runner behavior, versioning, and adapter conformance tests.
After the external evaluations, the project will present the specification and implementation evidence to the relevant SIGs. If the SIGs and champion agree that the evidence supports ecosystem standardization, the project team will prepare and submit the specification as a Canton Improvement Proposal. Governance approval of the CIP is not required for completion of this grant.
#### 2.9 Explicit non goals
This proposal does not fund:
- arbitrary calls on unchanged application contracts;
- custody of principal credentials by an automation service;
- a permissionless keeper marketplace;
- a validator reward or Canton Coin emission mechanism;
- operator compensation and tokenomics;
- a validator native sidecar requirement;
- protocol or core Canton repository changes;
- external oracle infrastructure;
- automated trading strategies; or
- Mainnet production deployment.
### 3. Architectural Alignment
The proposal aligns with CIP 0082 because it delivers developer tooling, a reusable reference implementation, security analysis, and shared ecosystem infrastructure.
It follows CIP 0100 by defining one objective, incremental milestones, independently testable acceptance criteria and a concrete maintenance approach.
CIP 0064 provides an operational precedent for automated Canton submissions, including multiple actors attempting eligible work, randomized delay, retry, staleness checks, and metrics. This proposal addresses a different layer. CIP 0064 concerns designated Super Validator governance actions implemented in the SV application. This proposal concerns user authorized, app defined actions expressed through reusable Daml contracts and typed adapters.
The design extends existing Daml concepts rather than requesting a language or protocol feature. It uses signatories, observers, choice controllers, consuming choices, interfaces, the established delegation pattern, and Ledger API party rights.
The primary review path should be the Daml Language and Developer Tooling SIG, with dApp Integration SIG review for adapter usability and external evaluation.
No changes to Canton, Daml, Splice, or other Foundation maintained core repositories are required by the base proposal.
### 4. Backward Compatibility

Existing applications can integrate with the authorization layer by implementing a compatible authorization adapter or interface for the actions they choose to make automatable. Existing application authorization requirements remain authoritative.

## Milestones and Deliverables
### Milestone 1: Architecture Validation and Threat Model
**Estimated Duration:** 3 weeks
**Focus:** Validate the authorization, authority, visibility, concurrency, recovery, and integration architecture before full implementation.
**Deliverables / Value Metrics:**
- Public Apache 2.0 repository with a reproducible Canton local environment.
- Contracts - Reusable interfaces and models for Authorization entrypoint, Authorization grant specific templates, payloads for function Execution
- Positive tests proving execution, revocation, expiry, execution count, interval, and amount limits.
- Negative tests for wrong operator, expired grant, revoked grant, excessive amount, exhausted count, stale contract identifier, unavailable target visibility, and two concurrent attempts.
- TypeScript runner spike that uses actAs for the operator only.
- Architecture decision record comparing per action grants, a broader session contract, and app specific delegation.
- Initial threat model and privacy data flow.
- Public architecture validation report documenting the validated authorization path, visibility model, concurrency behavior, operator recovery approach, integration boundary, and any design refinements identified during the milestone.
- Reference dashboard prototype supporting party login, active authorization grant details, principal controlled revocation, and historical execution viewing.
**Ecosystem value:** Validates the core architecture and security boundaries before full implementation, while publishing reusable threat analysis, design decisions, and architecture evidence that other Canton teams can evaluate independently.

### Milestone 2: Open Source Authorization Package and Reference Runner
**Estimated Duration:** 6 weeks
**Focus:** Deliver the reusable package, runner, conformance suite, and integration documentation.
**Deliverables / Value Metrics:**
- Versioned Daml package containing the common authorization interfaces and utilities, together with three reference adapter implementations, code comments, and developer documentation.
- TypeScript reference runner with cron and ledger visible triggers, SQLite job storage, retries, deduplication, randomized backoff, metrics, and operator runbook.
- Documented storage abstraction for alternative runner persistence implementations.
- Adapter conformance test kit covering authorization, visibility, time, count, value limits, revocation, replay, and stale state.
- Reproducible local and TestNet deployment instructions.
- Integration guide showing how an existing application adds one typed adapter without granting principal Ledger API rights to the runner.
- Draft normative specification and versioning policy.
- Public walkthrough for Canton application developers.
- Reference dashboard refinement and backend integration.
**Ecosystem value:** Provides Canton application teams with an open-source, reusable authorization package, reference runner, conformance suite, and integration guidance that reduce the effort and security risk of adding bounded automation without granting principal Ledger API rights to an off-ledger operator.

### Milestone 3: TestNet Validation and Independent Evaluation
**Estimated Duration:** 5 weeks
**Focus:** Demonstrate sustained TestNet operation and validate the reference implementation with independent Canton application teams and ecosystem builders.
**Deliverables / Value Metrics:**
- Public TestNet deployment of the reference implementation.
- Configure and validate representative automation jobs covering both scheduled and ledger visible triggers.
- Operate the reference deployment on TestNet for at least seven consecutive days and collect execution evidence.
- Validate revocation and at least one execution rejected by an on ledger authorization constraint.
- At least two external Canton application teams or ecosystem builders actively evaluate the public TestNet deployment or codebase.
- Collect documented feedback from those evaluations covering the authorization model, adapter integration boundary, visibility requirements, and operational usability.
- Incorporate applicable evaluation findings into the implementation, documentation, and specification, with dispositions recorded for feedback not incorporated.
**Ecosystem value:** Provides independent evidence that Canton builders can evaluate the authorization and automation model against real application workflows without requiring them to complete an application integration as a condition of this grant.

### Milestone 4: Security Review & Standards Candidate
**Estimated Duration:** 5 weeks, plus independent security review and remediation if needed
**Focus:** Independently validate and harden the security model and prepare the abstraction for ecosystem standardization.
**Deliverables / Value Metrics:**
- Prepare codebase, architecture, threat model, tests, and supporting material for independent review.
- Support the independent security reviewer: technical walkthroughs, questions, reproductions, and review coordination.
- Address review findings and update tests/documentation.
- Finalize threat model, incident runbook, compatibility matrix, operator guide, and conformance documentation.
- Update the normative standards candidate with security-review, TestNet, and external evaluation findings.
- Finalize and present the standards candidate to the relevant SIGs.
- If supported, prepare and submit the initial CIP pull request.
- Address reasonable CIP editor, SIG, and community technical feedback received during the funded project period.
**Ecosystem value:** Converts implementation, TestNet, and external evaluation evidence into an independently reviewed, reusable standards candidate that the Canton ecosystem can evaluate for broader adoption.
- Independent security review: The reviewer or firm and the review scope must be approved by the Committee. The external review cost will be paid separately against a Committee approved quote once the implementation scope is stable. The review will cover the Daml authorization package, reference adapters, runner authority and credential model, replay and concurrency handling, visibility assumptions, revocation races, and operational failure modes.

### Milestone 5: Maintenance and Compatibility Support
**Estimated Duration:** 12 months following Milestone 4 acceptance
**Focus:** Maintain the public reference implementation after delivery and preserve compatibility with the documented supported Canton and Daml versions.
**Deliverables / Value Metrics:**
- Maintain the public repository, issue tracker, release process, and vulnerability reporting channel throughout the maintenance period.
- Address security vulnerabilities, critical defects, and compatibility issues affecting the documented supported Canton and Daml versions.
- Publish maintenance releases and release notes when fixes are required.
- Maintain and update the supported Canton and Daml version compatibility matrix.
- Keep operator, deployment, and integration documentation current when maintenance changes affect documented behavior.
- Publish maintenance reports at months 3, 6, 9, and 12 summarizing issues received, resolution status, releases published, compatibility updates, documentation changes, and known unresolved limitations. The month 12 report will also serve as the final maintenance report.
**Ecosystem value:** Provides a defined post delivery maintenance period so ecosystem users can evaluate and adopt the reference implementation without depending on an unmaintained grant artifact.

## Indicative Delivery Schedule
- Weeks 1–3: Milestone 1
- Weeks 4–9: Milestone 2
- Weeks 10–14: Milestone 3
- Weeks 15–19: Milestone 4
- Months 1–12 following Milestone 4 acceptance: Milestone 5
The project therefore has an expected 19 week implementation schedule, excluding external evaluator availability, security review scheduling, remediation, and variable SIG or CIP feedback.
## Acceptance Criteria
The Tech & Ops Committee will evaluate completion based on:
- Deliverables completed as specified for each milestone.
- Demonstrated functionality and operational readiness.
- Documentation and knowledge transfer provided.
- Alignment with the stated value metrics.
Project-specific acceptance conditions are:
- The runner submits commands only as its operator party and does not require actAs rights for any principal.
- Revocation, expiry, execution count, minimum interval, and app-specific value constraints are enforced on-ledger rather than only in the runner.
- The implementation contains no arbitrary method-name dispatch or execution of user-supplied code.
- Two concurrent attempts against the same active authorization version cannot both produce a successful state transition.
- The three reference adapter implementations and specified positive, negative, and conformance tests pass on the supported Canton and Daml versions documented by the project.
- The reference implementation demonstrates end to end operation on TestNet over at least seven consecutive days using both scheduled and ledger visible triggers, including retry, deduplication, revocation, stale state handling, and at least one execution rejected by an on ledger authorization constraint.
- Documented technical evaluations are obtained from at least two external Canton application teams or ecosystem builders, covering the public TestNet deployment or codebase. Evaluation feedback is incorporated into the implementation, documentation, or specification, or dispositioned with rationale.
- The independent security review has no unresolved Critical or High severity findings at final acceptance, unless explicitly accepted by the Committee.
- Source code, tests, specification, documentation, and issue tracking are publicly available under Apache 2.0 or a Committee-approved equivalent.
- The standards candidate is presented to the relevant Canton Foundation SIGs. If the SIGs and champion support CIP submission, the project team prepares and submits the initial CIP pull request.
- Milestone 5 is accepted after completion of the 12 month maintenance period and delivery of the required quarterly maintenance reports, including the final month 12 report, provided the repository, supported version matrix, vulnerability reporting process, and in scope maintenance obligations have been maintained throughout the period.

## Funding
**Total Funding Request:** 2,050,000 CC for Milestones 1 through 5, plus independent security review funding against a Committee approved quote.
The funding request covers implementation, TestNet validation, external evaluation, security review preparation and remediation, standards work, and 12 months of maintenance and compatibility support.
The independent security review cost is not included in the amount above. The reviewer, review scope, and actual quote will be submitted to the Committee for approval once the implementation scope is stable.
### Payment Breakdown by Milestone
#### Milestone 1: Architecture Validation and Threat Model
**Funding:** 370,000 CC
Payment upon Committee acceptance of the Milestone 1 deliverables and architecture validation report.
#### Milestone 2: Open Source Authorization Package and Reference Runner
**Funding:** 740,000 CC
Payment upon Committee acceptance of the Milestone 2 implementation, tests, documentation, deployment instructions, and standards draft.
#### Milestone 3: TestNet Validation and Independent Evaluation
**Funding:** 370,000 CC
Payment upon Committee acceptance of the TestNet validation evidence, external technical evaluations, and documented dispositions of evaluation feedback.
#### Milestone 4: Security Review and Standards Candidate
**Funding:** 370,000 CC
Payment upon Committee acceptance of the Milestone 4 deliverables, including remediation of review findings, final security and operational documentation, standards candidate presentation, and CIP submission if supported by the relevant SIGs and champion.
**Independent security review funding:** separate Committee approved quote.
#### Milestone 5: Maintenance and Compatibility Support
**Total Funding:** 200,000 CC
The Milestone 5 funding will be paid in four quarterly tranches during the 12 month maintenance period:
- Month 3 maintenance tranche: 50,000 CC
- Month 6 maintenance tranche: 50,000 CC
- Month 9 maintenance tranche: 50,000 CC
- Month 12 maintenance tranche: 50,000 CC

Each quarterly tranche is payable following delivery of the corresponding maintenance report and completion of the maintenance obligations for that period. The final tranche also requires delivery of the end of maintenance report.
### Volatility Stipulation
Because Milestone 5 extends beyond six months, unpaid Milestone 5 tranches scheduled more than six months after Milestone 4 acceptance may be renegotiated to account for significant USD/CC price volatility. The same applies to remaining milestone payments if the project timeline is extended beyond six months due to Committee requested scope changes.

## Co-Marketing
Upon release, the implementing entity will collaborate with the Foundation on:
- Announcement coordination.
- A technical blog explaining the security model and lessons from TestNet operation and external evaluation.
- A public summary of external evaluation feedback and resulting design changes, with evaluator attribution only where approved.
- Promotion through the relevant SIGs and Canton developer channels.

## Motivation
Scheduled and state triggered operations occur across recurring payments, allocation and governance workflows, order expiry and recovery, collateral operations, treasury administration, and other long lived Canton processes. Daml supports delegation as a contract design pattern, but there is no broadly adopted package, adapter contract, conformance suite, and operational runner that application teams can reuse.
The lack of shared infrastructure creates three ecosystem costs:
- app teams repeatedly design sensitive authorization logic;
- users face either repeated manual signing or broader backend key access than the action requires; and
- each app must independently build scheduling, retries, deduplication, monitoring, revocation handling, and incident procedures.
The public value is not a hosted automation business. It is a reusable security boundary and reference implementation that any Canton application or organization can self host, operate through its application infrastructure, or use through a service provider according to its privacy and operational requirements.
There is no reliable public census from which to claim a percentage of Canton applications that require automation. This proposal therefore avoids an unsupported market share estimate and uses verifiable TestNet operation and independent external evaluation instead. The funded target is a sustained reference TestNet deployment evaluated by at least two independent Canton application teams or ecosystem builders, together with a public package that additional teams can evaluate without one off implementation support.
## Rationale
This proposal operates at a different abstraction layer from application-specific automation standards such as deferred settlement. It standardizes bounded delegation and execution of typed application actions, rather than defining the business semantics of a particular workflow such as token transfer, vesting, escrow, or settlement. Such application-specific standards could use the authorization and runner pattern defined here where appropriate.
Why typed authorization adapters
Daml choices and their arguments are statically typed. A safe general layer cannot discover an arbitrary contract, accept a text method name, and invoke an unknown choice on behalf of a user. Existing applications also have distinct authority, visibility, and business constraints.
A small typed adapter is therefore the minimum honest integration boundary. It lets the application define exactly which action is automatable while the shared package standardizes expiry, revocation, counts, intervals, operator identity, observability, and runner behavior.
Why the operator does not impersonate the principal
Giving a hosted runner the principal's signing rights would solve scheduling by increasing custody risk. The proposed model keeps the operator as a separate party. The principal grants only the authority represented by the active authorization contract, and the application contract still enforces all other required parties and business rules.
Why constraints are on ledger
A cron database can be corrupted, misconfigured, or operated by an attacker. Limits that exist only off ledger cannot protect the principal. The authorization contract is therefore the source of truth, and the runner is treated as potentially faulty or compromised within the bounded authority granted to it.
Why one operator per grant
A multi operator permissionless network introduces duplicate execution, fee competition, failover, privacy, service discovery, and reward allocation problems. One operator per grant is enough to validate the application and authorization model. Operator replacement can be handled through revoke and recreate.
Why operator economics are out of scope
There is no evidence yet for average job cost, failure rate, required redundancy, expected Canton traffic, or user willingness to pay. Introducing a reward design would add economic and governance complexity without helping prove the delegated authorization model.
Why the standard follows external evaluation
A design pattern should become a standard only after its assumptions have been tested against distinct external application contexts. The project therefore produces a standards candidate, subjects the implementation to independent evaluation by Canton application teams and ecosystem builders, and asks the SIGs whether the resulting evidence warrants a CIP. This avoids standardizing the first implementation's assumptions prematurely.
Alternatives considered
Application specific delegation only: feasible, but it preserves duplicated security and operations work.
Backend with principal credentials: operationally simple, but incompatible with the least privilege objective.
Protocol level generic automation: broader than needed and not justified before the application level architecture has been validated in practice.
Validator sidecar: unnecessarily couples application automation to validator operations and rewards.
Permissionless keeper market: adds economic and privacy complexity before the core authorization abstraction is proven.
External relayer only: submits transactions but does not define the Daml authority, constraints, revocation, and typed app integration required here.
## Maintenance and ownership
The implementing entity will maintain the repository through public issues and releases during delivery and throughout Milestone 5. Maintenance covers security vulnerabilities, critical defects, and compatibility issues affecting the documented supported Canton and Daml versions. The package will use semantic versioning and maintain a supported version compatibility matrix.
At Milestone 4 acceptance, the project will publish an ownership and continuity note covering maintainer access, release credentials, vulnerability reporting, and the option to transfer the repository to a neutral organization if the original team cannot continue.
## References
- [Development Fund proposal template](https://github.com/canton-foundation/canton-dev-fund/blob/main/proposals/_template.md)
- [CIP 0082](https://github.com/canton-foundation/cips/blob/main/cip-0082/cip-0082.md)
- [CIP 0100](https://github.com/canton-foundation/cips/blob/main/cip-0100/cip-0100.md)
- [CIP 0064](https://github.com/canton-foundation/cips/blob/main/cip-0064/cip-0064.md)
- [Development Fund review process](https://github.com/canton-foundation/canton-dev-fund/blob/main/Development%20Fund%20Proposal%20Review%20Process.md)
- [Daml delegation pattern](https://archived.docs.digitalasset.com/build/3.4/sdlc-howtos/smart-contracts/develop/patterns/delegation.html)
- [Daml interfaces](https://archived.docs.digitalasset.com/build/3.4/reference/daml/interfaces.html)
- [Daml parties and authority](https://archived.docs.digitalasset.com/build/3.4/tutorials/smart-contracts/parties.html)
