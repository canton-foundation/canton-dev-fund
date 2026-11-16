# Tenderly for Canton: Transaction Simulation, Debugging, and SDLC Integration

**Author:** Tenderly  
**Updated:** 30 October 2026  
**Proposal type:** Canton Foundation Development Fund  
**Roadmap alignment:** #20 Indexers (Debugging & Observability) and #18 Integration into SDLCs  
**Duration:** 24 months (12 months development and adoption, followed by 12 months maintenance)  
**Year 1 request:** $281,013.75 (2,913,569 CC as of October 30, 2026)  
**Year 2 request:** $140,506.88 (1,456,785 CC as of October 30, 2026)  
**Total funding request:** $421,520.63 (4,370,354 CC as of October 30, 2026)  
**Champion:** TBD

---

## Abstract

RFP #20 of the Canton Foundation's 2026–2028 Roadmap cites "transaction simulation / dry-run tooling (Tenderly-equivalent)" as a repeated request in the Q1 and Q2 DevRel surveys, where Transaction Debugging & Observability was the lowest-rated area (2.55 in Q1, tied lowest at 3.26 in Q2).

Tenderly will bring its transaction simulation and debugging to Daml on Canton in two workstreams:

1. **Simulation, debugging, and observability (RFP #20).** Execute Daml commands against controlled copies of authorized ledger state; inspect transaction trees, contract-state changes, and failures.
2. **SDLC integration (RFP #18).** An API, CLI, and CI/CD integrations for regression tests against versioned state snapshots and pre-release checks of candidate Daml packages.

Year 1 builds, launches, and validates adoption through Tenderly's hosted platform, a self-hosted option, and an Apache-2.0 Canton integration. Tenderly will also operate a standard Validator node (not a Super Validator) as a reference environment for integration testing. Year 2 funds maintenance of the open-source components and the hosted service as two separately accepted commitments.

Funding is tied to verifiable deliverables, adoption outcomes, and maintenance evidence. Amounts are denominated in USD to preserve the original June 2026 valuation (see Section 8).

---

## 1. Problem and Opportunity

### 1.1 Understanding transaction execution

Before submitting a transaction, developers need to know whether it will succeed against current state, which contracts it creates, archives, or references, which parties must authorize it, what each participant will see, and, when it fails, why and how to reproduce it.

Today that means combining Daml Script tests, participant logs, Ledger API queries, and application-specific tooling. Canton's privacy model adds a constraint: there is no global transaction state, so debugging tools must work on each application's authorized ledger projection. Tenderly will give developers one place to simulate, inspect, and understand execution within those boundaries.

### 1.2 Testing against production-derived state

Synthetic test fixtures rarely reflect what applications meet in production: existing contracts, older package versions, complex authorizations, and interactions with other applications. For settlement, custody, lending, and tokenized-asset workflows, developers need to test changes against controlled snapshots of real state without touching the live ledger.

### 1.3 Integration into existing development workflows

Teams already ship through GitHub, GitLab, Jenkins, or Buildkite. A team should be able to open a pull request, run a simulation suite against representative ledger state, review behavioral changes, and block a release when a critical check fails, alongside existing Daml tests rather than in a separate process.

### 1.4 What exists today, and what is still missing

Canton already offers ways to preview and inspect transactions. This proposal builds on them rather than replacing them.

| Existing tool | What it does well | What it does not cover |
| --- | --- | --- |
| **Ledger API interactive submission (`PrepareSubmission`)** | Interprets a command on a real participant against its current state, without committing. | Runs only against *current* live state, so results drift and can't be reproduced later. Uses only packages already uploaded and vetted on that participant, so a candidate DAR can't be tested without changing the production node. Requires the submitting parties to be hosted there with matching Ledger API rights. Doesn't apply effects, so multi-step scenarios can't be chained. Every call runs on the live participant. |
| **Walnut `dpm trace`** (approved grant) | CLI and visualizer for committed, prepared, and failed transactions on a live participant, including prepared-vs-actual diffs. | Same live-participant limits. No forked or versioned state, regression suites, or candidate-package testing. |
| **`PrepareSubmission`-based preview tools** (e.g., the open cantonsim proposal) | Pre-submission previews and prerequisite checks against a live participant. | Same live-participant limits. |
| **Daml Script / `dpm test`** | Fast, local, unit-level tests. | Hand-built synthetic state, not the real ACS an application runs on. |

The remaining gap is execution against a **controlled, versioned copy of real application state**, detached from the live participant:

- **Reproducible:** the same fixture gives the same result in every CI run and bug reproduction.
- **Candidate packages:** test a new DAR against production-derived state before uploading or vetting it anywhere.
- **Chained scenarios:** run step two against the state produced by step one.
- **Authorization mocking:** exercise multi-party workflows without holding every counterparty's Ledger API rights.
- **No production load:** CI-scale simulation doesn't run on the operator's node.

Tenderly's Virtual Participant (Section 3) provides this. For viewing committed and prepared transactions on a live participant, Tenderly will interoperate with existing tooling rather than build a parallel viewer (A2).

---

## 2. Proposed Solution

### Workstream A: Simulation, Debugging, and Observability (RFP #20)

**A1. Pre-submission simulation.** Developers submit Daml commands to an isolated environment loaded with their authorized state. Nothing is submitted to the ledger. Results include:

- **Transaction tree:** root exercises, nested operations, creates, archives, and dependencies.
- **Contract-state diff:** contracts created, archived, or unchanged.
- **Authorization analysis:** required authorizers and deterministic authorization failures.
- **Per-party views:** what each party would see, bounded by the workspace's permitted data access.
- **Failure diagnostics:** readable explanations of supported deterministic failures.
- **Shareable artifacts:** reproducible inputs and results for authorized team members.

Simulation is preflight validation, not a guarantee of commit: concurrency, state changes, package vetting, and protocol-level conditions can still change the live outcome (see the execution boundary in 3.1).

**A2. Failure reproduction and replay.** Starting from an application request and its completion or rejection information, the debugger rebuilds the execution in the Virtual Participant against the matching state fixture, so developers can step through it and test fixes off-ledger. Deterministic replay is supported when original inputs, compatible packages, and sufficient historical state are available; state at a past offset exists only if the participant hasn't pruned it. Otherwise the tool reports the diagnostics it has, without claiming a reconstruction.

Tenderly will not build another viewer for committed or prepared transactions; the approved `dpm trace` grant covers that. Tenderly will coordinate with its maintainers on a shared trace format, so a transaction inspected in `dpm trace` can be replayed in Tenderly and a simulated one viewed in `dpm trace`.

**A3. Simulation and CI observability.** A workspace-scoped dashboard over the activity this tooling produces: simulation and replay history, regression results and behavioral changes across CI runs, failure categories over time, frequently failing templates and choices, and links between reproduced production failures and the tests covering them. It is not a network explorer and doesn't duplicate PQS or indexers.

**A4. Hosted and self-hosted.** Hosted users connect authorized participant data or upload fixtures. Institutions that can't send contract data outside their environment run the execution harness and supporting services in their own infrastructure.

**A5. Reference Validator node.** Tenderly will operate a standard Canton Validator node (not a Super Validator) for its own parties, used to test against a real participant and Ledger API, validate ingestion and inspection, run end-to-end compatibility tests across Canton releases, and host reproducible examples. It starts on DevNet/TestNet and moves to MainNet after the required onboarding approvals. It is separate from the Virtual Participant, is not a data source for customer simulations, and exposes only data authorized to Tenderly's parties. Tenderly is not requesting Super Validator status or operating sequencer, mediator, or governance infrastructure.

### Workstream B: SDLC Integration (RFP #18)

**B1. API and CLI.** Simulation and regression testing through an API and a `tenderly-canton` CLI for local use, scripts, and CI:

```bash
tenderly-canton simulate --commands transfer.json --state snapshot-001
tenderly-canton test --suite regression.yaml --state snapshot-001
tenderly-canton upgrade-check --dar candidate.dar --state snapshot-001
```

Commands use the Ledger API v2 command format accepted by `PrepareSubmission`, so existing commands run without translation. Packaging as a DPM component will also be evaluated.

**B2. Regression testing against snapshots.** Versioned fixtures created from authorized state, loadable into isolated environments for PR testing, bug reproduction, and upgrade validation. Scenarios assert on success or failure, created and archived contracts, exercised choices, state changes, authorization requirements, and error classes. Production-derived fixtures are access-controlled; public examples use synthetic or sanitized data.

**B3. CI/CD integrations.** A GitHub Action, GitLab CI example, container image for other CI systems, machine-readable results, human-readable reports, and example repositories, so simulation results can serve as required release checks.

**B4. Package upgrade validation.** Run candidate DARs against representative fixtures before release and report failed scenarios, behavioral and authorization differences, and state changes. This complements existing package-validation and vetting mechanisms.

Multi-synchronizer scenarios will be added only where behavior can be validated against supported Canton releases (Section 3.4).

---

## 3. Technical Architecture

### 3.1 Virtual Participant

The Virtual Participant is an isolated execution harness. It is not a Canton validator, doesn't take part in synchronizer protocols, and never submits to the ledger.

**Engine integration.** It embeds the open-source Daml-LF engine from `digital-asset/daml` (Apache-2.0), the same engine a Canton participant uses to interpret commands. Tenderly does not reimplement Daml semantics.

The engine runs as a JVM service behind Tenderly's API and CLI. When evaluation needs a contract or a package, the engine pauses and asks its host. A Canton participant answers from its stores; the Virtual Participant answers from the hydrated fixture:

| Engine request | Answered from |
| --- | --- |
| Contract by ID | The fixture's ACS snapshot, plus any explicitly disclosed contracts supplied with the simulation |
| Package | The fixture's DARs, plus any candidate DAR under test |
| Contract by key | Not applicable on Canton 3.x today; enabled once contract keys are reintroduced (see 3.3) |

Each simulation is configured with:

- **Submitting and reading parties** (`actAs` / `readAs`), which set the authorization context the engine checks. Authorization mocking means choosing this set without holding those parties' Ledger API rights.
- **Package resolution:** the vetted-package set and package preference captured with the fixture, or overridden with a candidate DAR. This reproduces how a participant selects package versions under smart-contract upgrades, which is what makes `upgrade-check` meaningful.
- **Ledger time and submission seed,** fixed per simulation so execution is deterministic.

The engine returns the transaction tree. The harness derives the state diff, per-party views (from each node's informees and witnesses), and authorization and failure reports. Chained scenarios apply each result to the fixture before the next step.

**Execution boundary.** The Virtual Participant reproduces the *interpretation* step of a submission. Checks Canton performs afterwards are reported as "not simulated" rather than assumed to pass:

- Contention with concurrent transactions and conflict detection by the synchronizer
- Confirmation by counterparties' participants and the mediator verdict
- Topology checks: party hosting and package vetting on counterparties' participants
- Ledger-time bounds against the synchronizer clock
- Traffic and fee accounting

This boundary is published in the repository at M1 and is what the parity suite tests.

### 3.2 State ingestion

| Mode | Description |
| --- | --- |
| Self-hosted | Execution stays within the institution's infrastructure |
| Authorized participant access | Read-only Ledger API v2 access: ACS via `StateService.GetActiveContracts`, packages via `PackageService`, using a Ledger API user with `CanReadAs` rights only (no `CanActAs`) |
| Snapshot upload | Developer-provided authorized state fixture |

No mode requires global transaction visibility.

### 3.3 Execution parity

Tenderly will maintain a public suite comparing simulation results with equivalent Canton TestNet executions.

- **Pass condition:** a case passes when its transaction-tree structure, resulting state changes, and errors or authorization outcomes match TestNet. Contract IDs and other seed-derived values are compared structurally, since they legitimately differ between runs.
- **Pass requirement:** every published case passes, or is listed as a known limitation with a documented root cause. Any other failure blocks acceptance of the milestone that introduced it.
- **Coverage:** creates; consuming and non-consuming exercises; exercise by interface; fetches; authorization patterns; explicit disclosure; package upgrades; deterministic failures; resulting state changes. Contract-key operations are added once keys are reintroduced under Digital Asset's approved contract-keys proposal.

The suite documents supported versions, assumptions, and known limitations. It is the acceptance mechanism in Year 1 and the compatibility regression suite in Year 2.

### 3.4 Multi-synchronizer support

Multi-synchronizer execution may need protocol context beyond the interpretation step. Initial support preserves relevant context and flags unsupported scenarios. Additional cases are introduced only after they are validated against TestNet.

### 3.5 Alternatives considered

- **Reimplementing Daml semantics.** Rejected. Any divergence from Canton's interpreter would make results untrustworthy. Embedding the engine makes interpretation parity structural; the suite tests the harness around it.
- **A full Canton participant per simulation.** Rejected as the default. It brings synchronizer connectivity, storage, and topology management simulation doesn't need, and makes per-request isolation and fast startup impractical.
- **Building only on `PrepareSubmission`.** Rejected for the reasons in 1.4. It remains the reference for sanity-checking live behavior.

---

## 4. Privacy, Security, and Data Dependencies

The system operates only on data authorized to the requesting application or participant.

| Data | Source | Purpose |
| --- | --- | --- |
| Active Contract Set | Authorized node-local data or application fixture | Execution starting state |
| Daml packages | Authorized package source | Contract logic |
| Commands | Application-provided | Simulation inputs |
| Transaction updates | Authorized Ledger API | Inspection and replay |
| Submission metadata | Application-provided and available completion records | Failure investigation |
| Execution configuration | Application-provided | Execution context |

- It does not depend on Mediator messages or publicly exposed involved-party metadata, so it is unaffected if that metadata stops being public.
- Simulation authority is distinct from permission to access contract data.
- Trace sharing uses scoped access, expiry, and audit logging.
- Hosted deployments use encryption, isolated execution, least-privilege credentials, and explicit retention settings for fixtures and saved artifacts.

---

## 5. Ecosystem Adoption

Tenderly will target teams building tokenized assets, settlement, custody, lending, and other institutional workflows. Representative use cases (not confirmed partner commitments):

- Mint and redemption simulation for tokenized assets
- Authorization validation for settlement workflows
- Regression testing of lending and collateral operations
- Pre-upgrade checks for custody applications
- Debugging of submission failures
- CI/CD checks for infrastructure providers

Adoption will be driven through direct onboarding, example applications, documentation, workshops, Foundation-sponsored events, and Tenderly's developer channels.

---

## 6. Year 1: Development, Launch, and Adoption

**Months 1–12 · $281,013.75.** CC equivalents for each milestone are in Section 8. Operating software released in Year 1 is covered by Year 1 milestones; Year 2 maintenance is separate.

### M1: Execution Integration and Core Simulation

**Weeks 1–12 · $56,952.12 · RFP #20**

Deliverables: Daml-LF engine integration (3.1); published execution boundary; authorized ACS ingestion; transaction-tree visualization; state diff; deterministic failure diagnostics; Simulation API v0; public repository with initial parity suite; validator deployment plan.

Acceptance:

- End-to-end simulation against a TestNet-derived fixture
- ≥30 published parity cases, all passing or documented as known limitations with root cause
- Documented version support and limitations
- Canton integration code public under Apache-2.0

### M2: Debugging and Validation

**Weeks 13–20 · $40,465.98 · RFP #20**

Deliverables: expanded debugging interface; authorization and per-party diagnostics; failure reproduction from submission and completion data; supported replay; controlled trace sharing; shared trace format coordinated with `dpm trace` maintainers; expanded parity suite.

Acceptance:

- ≥80 published parity cases, all passing or documented as known limitations with root cause
- Demonstrated reproduction of a failed TestNet submission in the Virtual Participant
- Documented replay conditions
- Trace sharing restricted to workspace scope

### M3: SDLC Integration and Public Beta

**Weeks 21–32 · $59,949.60 · RFP #18 and #20**

Deliverables: public beta of dashboard and API; CLI v1; GitHub Actions and GitLab CI integrations; container image; versioned fixtures and scenario assertions; initial upgrade validation; public documentation and examples; integration tests against Tenderly's TestNet validator.

Acceptance:

- Public beta live by Week 26
- ≥5 onboarded teams, including ≥2 external CI-integrated teams
- ≥500 external pilot simulations and ≥150 inspected debugging traces
- ≥2 partners committed to continued technical evaluation
- Demonstrated integration against Tenderly's TestNet validator

### M4a: Production Readiness and Year 1 Operations

**Weeks 33–52 · $44,962.20 · RFP #18 and #20**

Deliverables: continued hosted operation; self-hosted distribution; simulation and CI observability GA; compatibility updates for the supported release baseline; security and reliability work; pilot support; validator operation, including MainNet after approval; final Year 1 technical report.

Acceptance:

- Self-hosted core delivered by Week 44
- ≥99.5% monthly Simulation API availability
- Upstream releases assessed within 30 days
- Published issue and security-reporting process
- Quarterly usage and operations reports
- TestNet and MainNet validator status documented, including outstanding approvals
- Two pilot technical case studies (anonymized if necessary)

### M4b: Adoption Tranches

**$56,202.75 total**

| Gate | Amount | Targets |
| --- | --- | --- |
| Month 9 | $22,481.10 | ≥10 teams onboarded; ≥3 CI-integrated teams; ≥2,000 cumulative external simulations; ≥1 pilot partner in sustained monthly use |
| Month 12 | $33,721.65 | ≥20 teams onboarded; ≥6 CI-integrated teams; ≥5,000 cumulative external simulations; ≥8 monthly active teams; ≥2 sustained-use pilot partners; ≥1 real release review using upgrade validation |

A monthly active team runs ≥20 simulations in a calendar month. Sustained use means meeting that threshold in consecutive complete months.

### Year 1 Contingency

**$22,481.10.** For unforeseen technical requirements or approved scope changes; released only with Committee approval.

---

## 7. Year 2: Maintenance and Continued Operation

**Months 13–24 · $140,506.88 (50% of Year 1)**

Canton, Daml, Ledger API, and package-handling changes will keep affecting the integration, and teams relying on it in CI need it kept current. Year 2 adds no major new features. It funds two commitments, accepted independently, so a shortfall in one doesn't invalidate the other.

### M5a: Open-Source Integration Maintenance

**$56,202.75 · four quarterly tranches of ~$14,050.69**

Covers the Virtual Participant harness, integration layer, ingestion interfaces, CLI, CI integrations, fixture and scenario formats, parity suite, documentation, and self-hosted artifacts.

Scope: tracking Canton and Daml releases and keeping a public compatibility matrix; a public issue tracker, with priority on correctness, privacy boundaries, and test reliability; dependency updates and a vulnerability-disclosure channel; maintaining the CLI, GitHub Action, GitLab template, and container image; regression tests for every confirmed compatibility bug; docs, examples, and review of community contributions.

Acceptance (quarterly):

- Every relevant upstream release assessed within 30 days and reflected in the compatibility matrix
- Critical security issues handled under the published security policy
- Reproducible critical defects resolved or covered by an approved remediation plan
- Automated tests passing on documented supported configurations
- Quarterly report on releases, open issues, compatibility, and security work

Excludes new major features, unrelated integrations, and versions outside the support policy.

### M5b: Hosted Service and Validator Maintenance

**$84,304.13 · four quarterly tranches of ~$21,076.03**

Covers continued operation of the hosted simulation, debugging, and observability service, so developers can use it without running infrastructure, and of Tenderly's Validator node.

Scope: compute, storage, and orchestration; validator upgrades, monitoring, key management, backups, and recovery; monitoring, alerting, incident response, and a public status page; capacity management for the agreed Foundation-supported usage; tenant isolation, encryption, patching, and retention; keeping the hosted API and dashboard compatible with maintained integration releases; developer onboarding and support.

Acceptance (quarterly):

- ≥99.5% monthly Simulation API availability
- Validator operational and upgraded per the release policy, subject to network-access approvals
- Published incident-response procedures
- Foundation-supported developer access available throughout
- Quarterly report on availability, usage, incidents, validator status, and infrastructure costs

**Funding boundary.** Covers shared Canton infrastructure, Tenderly's validator, and the agreed level of ecosystem developer access. It does not cover validators for commercial customers, dedicated or bespoke enterprise deployments, or usage paid for under commercial contracts. Foundation-supported hosting costs are accounted for separately so the Foundation never pays for usage customers already pay for.

### Year 2 Governance

Before Year 2 begins, Tenderly and the Technology & Operations Committee will agree on the supported version policy, initial maintenance backlog, Foundation-supported usage allocation, validator reporting, availability and incident definitions, reporting format, acceptance mechanics, and the CC/USD conversion mechanism. Year 2 approval and disbursement can be contingent on Year 1 acceptance. At Month 24, Tenderly delivers separate final reports for each commitment.

---

## 8. Funding

All amounts are requested in USD. CC equivalents are indicative, at $0.09645 per CC on October 30, 2026, rounded to whole CC.

**Valuation.** The original Year 1 request was 1,875,000 CC on June 22, 2026, when CC was $0.149874, which is $281,013.75. CC has since fallen about 35.65%. Denominating in USD preserves that original budget. Year 2 is 50% of Year 1, split 40% open-source and 60% hosted.

| Milestone | USD | CC equivalent |
| --- | ---: | ---: |
| M1: Execution integration and simulation core | $56,952.12 | 590,483 |
| M2: Debugging and validation | $40,465.98 | 419,554 |
| M3: SDLC integration and public beta | $59,949.60 | 621,561 |
| M4a: Production readiness, validator, Year 1 operations | $44,962.20 | 466,171 |
| M4b: Adoption tranches (Month 9 + Month 12) | $56,202.75 | 582,714 |
| Year 1 contingency | $22,481.10 | 233,086 |
| **Year 1 total** | **$281,013.75** | **2,913,569** |
| M5a: Open-source maintenance | $56,202.75 | 582,714 |
| M5b: Hosted service and validator maintenance | $84,304.13 | 874,071 |
| **Year 2 total** | **$140,506.88** | **1,456,785** |
| **Total** | **$421,520.63** | **4,370,354** |

**Disbursement.** Tranches may be paid in CC, with the amount equal to the approved USD value at the agreed conversion rate and time, so the CC amount varies with market price. Year 2 is approved and evaluated separately from Year 1.

---

## 9. Open Source

Released under Apache-2.0:

- Core execution harness
- State-ingestion interfaces
- Replay components
- CLI and CI integrations
- Fixture and scenario formats
- Public parity suite
- Documentation and examples
- Self-hosted deployment configurations

These components have documented interfaces and work on their own for core simulation and regression testing. Tenderly's proprietary hosted platform and dashboard are outside the open-source scope, as is the operation of Tenderly's validator. Tenderly is maintainer of record for both funded years.

---

## 10. Post-Grant Sustainability

The Canton offering becomes part of Tenderly's commercial platform: free developer access within defined limits, paid hosted plans for higher usage and team features, and institutional arrangements for dedicated or self-hosted deployments.

Commercial revenue may not cover maintenance from day one, which is why Year 2 is funded explicitly. During Year 2, Tenderly will track adoption, commercial demand, infrastructure and validator costs, and upstream and support effort, and before Month 24 will publish a sustainability assessment covering the post-grant operating model, supported versions, open-source maintenance, and hosted access. Further Foundation funding would require a separate request.

If Tenderly discontinues the hosted Canton offering, it will give at least six months' notice, publish migration guidance, and support a transition to interested maintainers.

---

## 11. Responsibilities

| Responsibility | Tenderly | Canton Foundation |
| --- | --- | --- |
| Core simulation development | Responsible | Technical feedback |
| Debugging and observability | Responsible | Advisory |
| SDLC integrations | Responsible | Advisory |
| Open-source publishing | Responsible | Review |
| Validator operation | Responsible | Onboarding coordination where applicable |
| Year 1 hosted operation | Responsible | Milestone review |
| Year 2 maintenance (both commitments) | Responsible | Maintenance acceptance |
| Version compatibility tracking | Responsible | Release coordination |
| Security and bug maintenance | Responsible | Advisory |
| Pilot partner onboarding | Responsible | Ecosystem introductions |
| Usage and maintenance reporting | Responsible | Review |
| Grant disbursements | Provides evidence | Decision maker |

---

## 12. Risks and Mitigations

| Risk | Mitigation |
| --- | --- |
| Not every live outcome can be reproduced off-ledger | Published execution boundary (3.1); parity suite with a pass-or-documented requirement; out-of-boundary conditions reported as "not simulated" |
| Inputs or historical state for replay may be unavailable | Deterministic replay limited to cases with sufficient data |
| Confidential institutional data | Self-hosted execution, least-privilege ingestion, tenant isolation, authorization-aware access |
| Upstream Canton changes | Public version policy, automated regression tests, dedicated Year 2 maintenance |
| Validator onboarding and operations | Start on DevNet/TestNet; begin onboarding early; document approval dependencies; maintain upgrade, backup, and incident procedures |
| Hosted costs grow with adoption | Defined Foundation-funded capacity, separate cost reporting, commercial pricing beyond the allocation |
| CC price volatility | USD denomination with dated CC equivalents and an agreed conversion mechanism |
| Adoption doesn't materialize | Year 1 adoption tranches paid only on measured onboarding and usage |
| Revenue doesn't yet cover maintenance | Explicit Year 2 budget and a published sustainability assessment before Month 24 |

---

## 13. Co-Marketing

- **Joint launch:** Canton Foundation and Tenderly announcement with a walkthrough and example application.
- **Developer workshops:** simulation, inspection, regression testing, and CI integration.
- **Case studies:** institutional workflows with consenting pilot partners.

Materials are kept up to date through Year 2.

---

## 14. Expected Outcome

By Month 12, Canton developers have simulation, debugging, and CI integration for supported Daml workflows, with adoption evidence from real pipelines. By Month 24, the open-source integration, hosted service, and reference validator have been maintained against current Canton releases, with a published plan for operating beyond the grant.

---

## References

- [Canton Foundation 2026–2028 Strategic Roadmap and RFPs](https://github.com/canton-foundation/canton-dev-fund/blob/main/2026-2028-strategic-roadmap.md)
- Canton Foundation: Validators
- Canton Network: Validator Overview
- Canton Validator Onboarding Documentation
- [Tenderly Transaction Simulator](https://tenderly.co/transaction-simulator)
- [Safe: Transaction Simulation Case Study](https://blog.tenderly.co/case-studies/safe/)
- [Instadapp: Transaction Simulation Case Study](https://blog.tenderly.co/case-studies/instadapp/)
- [Enso: Transaction Simulation Case Study](https://blog.tenderly.co/case-studies/enso/)
- Digital Asset: Ledger API Reference
- Digital Asset: Smart Contract Upgrades
- [Walnut: DPM Trace Transaction Visualization (approved grant)](https://github.com/canton-foundation/canton-dev-fund/blob/main/proposals/2026-08-Walnut-dpm-trace-visualization.md)
- [Digital Asset: Reintroducing Contract Keys (approved grant)](https://github.com/canton-foundation/canton-dev-fund/blob/main/proposals/2026-03%20-DA-ProposalContractKeys.md)
- [PixelPlex: cantonsim proposal (PR #879)](https://github.com/canton-foundation/canton-dev-fund/pull/879)
