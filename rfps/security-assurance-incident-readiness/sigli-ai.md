# Sigli.ai: Daml Automated Workflow Evaluator (DAWE) for Canton

| Field | Value |
|---|---|
| Organization | Sigli.ai |
| Author / Primary Contact | Ayan Uali (@ayanuali) |
| Champion | 5North |
| Proposal Type | RFP-aligned proposal |
| Primary RFP | **RFP 22 Daml Security Standards and Secure Development** (Security, Assurance & Incident Readiness) |
| Secondary RFP areas | RFP 18 Integration into SDLCs; RFP 27 Security Monitoring, Auditability and Evidence |
| SIG | daml-tooling |
| Total Funding Request | 487,000 CC |
| Project Duration | 16 weeks build + 10-week adoption window (6 months total) |
| License | MIT |

---

## RFP Alignment

DAWE responds to **RFP 22, Daml Security Standards and Secure Development**, in the *Security, Assurance & Incident Readiness* area of the [2026-2028 Strategic Roadmap](https://github.com/canton-foundation/canton-dev-fund/blob/main/2026-2028-strategic-roadmap.md#requests-for-proposals).

RFP 22 asks for "security standards, best practices, tooling, and reference materials for the secure design, development, testing, and deployment of Daml applications", and states the goal: to help application developers "consistently identify and prevent security weaknesses before Daml packages are deployed or vetted." DAWE is scoped to that goal. The table maps each RFP item in DAWE's scope to what this grant delivers. Security-focused linting and static analysis are left to static tools such as the CCTools package analyzer, which DAWE complements (see below).

| RFP 22 item | DAWE deliverable | Milestone |
|---|---|---|
| Testing methodologies | The DAWE scenario convention: fixture setup, valid preceding submissions, one adversarial submission, post-rejection state assertions. Built on `submitMustFail` and Splice's checked variants. | M1 |
| Common vulnerability patterns | The Daml Security Pattern catalogue (DSP-01 to DSP-10, below). Each pattern has a description, a vulnerable example, a fixed example, and at least one reference scenario that catches it. | M1 (first 5), M2 (all 10) |
| Threat models | A per-suite threat model for each of the three reference workflows, plus the threat table in this proposal | M1, M2 |
| Review checklists | A security review checklist that maps each catalogue pattern to the scenarios a reviewer should expect to see, plus a definition of a "DAWE-conformant" suite | M2 |
| Reference implementations | Three reference financial workflows (treasury rebalancing, RWA settlement, compliance monitoring), each with an adversarial suite | M1, M2 |
| CI/CD integration | External runner and CI adaptor that emits JSON and JUnit, plus a GitHub Actions template. Documented for `dpm script` against Canton Sandbox and Testnet | M1, M2 |
| Automated analysis | A regression runner that re-executes all suites against a named SDK version and reports which scenarios changed behaviour | M2 |

**Secondary alignment.**
- **RFP 18, Integration into SDLCs.** The runner and CI template put adversarial Daml testing into an existing CI/CD pipeline with no new infrastructure.
- **RFP 27, Security Monitoring, Auditability and Evidence.** The run report (scenario IDs, expected and actual outcomes, SDK version, target environment, timestamps) is a compliance-evidence artifact that preserves Canton's privacy model: it is produced by the team from its own test ledger, and it discloses no production data.
- **Roadmap vision.** The roadmap states that "validator operators and users alike can easily evaluate applications." A public, standard evidence report attached to a package release gives a party deciding whether to vet a package something concrete to check.

**Relationship to funded and proposed work.** DAWE is complementary to these and does not duplicate them:
- **CCTools Daml package analyzer** (RFP 3, [2026-03 proposal](https://github.com/canton-foundation/canton-dev-fund/blob/main/proposals/2026-03-Certora-daml_package_analyzer_proposal%20.md)). That tool does static analysis of cross-package authority in a `.dar`. DAWE does dynamic, scenario-based testing of workflow behaviour on a running ledger. A reviewer uses the analyzer to find where authority crosses packages, and DAWE scenarios to show that the unauthorised exercise is actually rejected.
- **Independent security assessments** (RFP 21, [PR #410](https://github.com/canton-foundation/canton-dev-fund/pull/410)). An audit is a point-in-time review. DAWE produces repeatable evidence a team can re-run on every release, and gives auditors a standard artifact to start from.
- **Daml training** (RFP 15). The DAWE catalogue and tutorial are security-specific material that existing training programmes can link to.

---

## Abstract

Daml already has the primitives to test that a ledger rejects an invalid submission. `submitMustFail` asserts that a submission fails, and Splice's test utilities add checked variants that assert a specific error identifier or failure status. What the ecosystem lacks is a maintained, shared *practice* on top of those primitives: a catalogue of the security weaknesses Daml financial workflows actually have, a standard way to write a test for each one, reusable fixtures so teams don't rebuild the setup, and evidence output a security reviewer or risk committee will accept.

Every team shipping a financial Daml application to institutions builds this scaffolding on its own, decides alone what "adequate adversarial coverage" means, and rebuilds the evidence pack from scratch for every client and every audit. The primitives are shared. The practice is not.

This proposal requests 487,000 CC to build and open-source DAWE:
1. a Daml Security Pattern catalogue,
2. a scenario convention and reusable fixture library,
3. three worked financial reference suites,
4. a CI runner that emits reviewer-ready evidence, and
5. a review checklist that defines what a conformant suite covers.

Every scenario is an ordinary Daml Script test built on the existing facilities. DAWE's contribution is making them reusable, documented, and legible to a security reviewer.

---

## Ecosystem Need: Who Benefits and How It Drives Adoption

### The problem

The roadmap's target is capital markets at scale: more than 1,000 applications transacting across synchronizers, and institutions moving treasuries, repo, settlement, and tokenized assets on-chain. Each of those applications has to get through an institutional security review before it goes live, and security review is where Canton deployments stall today.

- **Coverage is uneven and implicit.** Whether a team tests unauthorised-controller access, replay against archived contracts, time-window expiry, or over-disclosure to observers depends on the individual engineer. Security assumptions live in people's heads rather than in named tests.
- **Evidence is rebuilt for every engagement.** Preparing Sigli's first enterprise pilots, we spent several weeks turning passing tests into documentation a client's security review would accept: hand-written scripts, a narrative for each test, screenshots of Sandbox output, and reformatting to fit the client's template. None of it carried over to the next client. Other Canton teams we have spoken with report the same thing. One RWA issuer preparing for a third-party audit estimated that bespoke test documentation took six to eight weeks of its deployment timeline. Another team delayed a compliance-monitoring mainnet launch by more than a month to prepare evidence packs for its legal and risk committees.
- **There is no shared vocabulary.** A buyer or auditor cannot ask "has this workflow been tested against the standard adversarial cases?" because no standard exists.

### Who benefits

| Beneficiary | What they get from DAWE | Adoption effect for Canton |
|---|---|---|
| **Application developers and Featured App teams** | A pattern catalogue and fixture library, so adversarial coverage is a checklist rather than guesswork. Writing a basic suite takes about a day instead of weeks. | Faster, safer path from prototype to MainNet, and fewer vulnerable packages deployed |
| **Institutional integrators and systems integrators** | A reusable evidence artifact for client security reviews, where test documentation is often a contractual deliverable | Shorter institutional sales and onboarding cycles, which is the main bottleneck for capital-markets volume on Canton |
| **Security auditors and reviewers** | A standard starting point: named scenarios mapped to known patterns, run against a stated SDK version | Audits focus on novel risk instead of re-deriving basic coverage. Audit budgets (including Foundation-funded ones) go further. |
| **Validator operators and parties vetting packages** | A published evidence report alongside a package release, giving them something checkable before vetting | Supports the roadmap goal that operators and users "can easily evaluate applications" |
| **Risk committees and compliance functions at institutions** | A machine-readable, versioned record of what was tested, against what, and when | Lowers the governance bar for an institution to approve a Canton deployment |
| **Canton Foundation and the Dev Fund** | A security baseline that funded applications can be asked to meet | Raises the security floor across the application layer without central review |

### How it drives adoption

Institutional adoption of Canton is gated on institutions signing off on applications, not on protocol capability. Every week an application spends assembling security evidence is a week it isn't generating transactions, traffic, and Canton Coin burn. DAWE shortens that path for every team that adopts it, and the effect compounds: each new pattern, fixture, and binding contributed back makes the next team's suite cheaper to write.

The mechanism is standardisation. Once "DAWE-conformant" has a specific, checkable meaning (M2), it can appear in RFPs, procurement questionnaires, audit scopes, and Featured App applications. At that point the convention spreads through the demand side (buyers and reviewers asking for it) as well as the supply side (developers choosing it).

---

## Prior Art and Relationship to Existing Daml Testing Facilities

**What already exists and works.** Daml Script provides `submitMustFail`, which submits a command, requires the ledger to reject it, and lets the script continue. It is the correct, intended way to test that an unauthorised party cannot exercise a choice, that a policy assertion fires, or that an archived contract cannot be re-exercised. Splice's public test utilities go further, with checked variants that assert an expected error identifier or failure status, so a test cannot pass because the submission failed for an unrelated reason. Daml Script runs against Canton Sandbox through `dpm script`, so integration-level scenarios need no new runner.

DAWE does not replace any of this, does not wrap it in a new abstraction, and does not claim that Daml lacks negative-testing primitives. Every DAWE scenario is an ordinary Daml Script test that calls these existing functions.

**What DAWE adds.** None of the following is a new ledger mechanism:
1. **A vulnerability-pattern catalogue**: the security weaknesses specific to Daml financial workflows, each with an example and a test.
2. **A scenario convention**: a documented structure for a security scenario, so every team's suite has the same shape and a reviewer can read any of them.
3. **A reusable fixture library**: multi-party, policy, time, and lifecycle fixtures.
4. **Three worked financial suites**: reference material a team adapts rather than starts from scratch.
5. **Documented application bindings**: a pattern for pointing the scenario set at a team's own policy or guardrail implementation.
6. **CI-friendly evidence output and a review checklist**: the artifacts that go into a security review pack.

**Where an exact failure reason matters**, DAWE composes the existing primitives. In a Splice-based test, that means the checked `submitMustFail` variant with an expected error identifier or failure status, following the pattern in Splice's own test utilities. The documentation states, per scenario, which checks depend on a stable error identifier or status and which assert only rejection plus post-state invariants. That way a team knows which tests are coupled to error-code stability across SDK versions.

---

## What the Grant Funds

### Deliverable 1: Daml Security Pattern catalogue

A public, versioned catalogue of security weaknesses common to multi-party financial Daml workflows. Each entry has a description, a vulnerable snippet, a corrected snippet, the scenario class that detects it, and whether detection depends on a stable error identifier. The initial catalogue:

| ID | Pattern | Example of what the reference scenario verifies |
|---|---|---|
| DSP-01 | Over-broad controller authorization | A non-controller, or a party passed in as a choice argument, cannot exercise a sensitive choice |
| DSP-02 | Missing or weak preconditions | Amounts above a limit, zero or negative values, and invalid states are rejected by `ensure` or `assert` |
| DSP-03 | Replay and double execution | An archived or completed workflow cannot be re-exercised, and nonconsuming choices cannot repeat a value transfer |
| DSP-04 | Time-window violations | Actions outside a valid ledger-time window (expiry, cut-off, settlement deadline) are rejected |
| DSP-05 | Over-disclosure | A party that should not see a contract cannot fetch or query it (checked as a visibility assertion, not a rejection) |
| DSP-06 | Propose/accept authority gaps | Only the intended counterparty can accept, and a proposer cannot unilaterally complete a bilateral step |
| DSP-07 | Numeric boundary and precision | Rounding, overflow-adjacent values, and boundary amounts behave as specified |
| DSP-08 | Lifecycle state-machine violations | Actions are rejected in the wrong workflow state (paused, completed, aborted) |
| DSP-09 | Policy and guardrail bypass | A command violating an on-ledger policy (spend limit, allowlist, velocity) is rejected even when the client skips its own pre-check |
| DSP-10 | Upgrade regression | A new package or SDK version does not change the outcome of a previously passing adversarial scenario (via the regression runner) |

The catalogue is open to community contribution through the RFC process described under Standardization Path.

### Deliverable 2: Scenario convention, fixture library, and CI runner

A set of Daml Script scenario conventions and reusable fixtures that let any Canton team write a security suite for a multi-step financial workflow without rebuilding the scaffolding. Named scenario classes follow the catalogue.

An external runner executes the scenario set and emits structured, machine-readable results: per-scenario outcome, target environment, and SDK version. These are suitable as input to change-control documentation, security review evidence packs, and audit workflows. The runner is a standard test runner and CI adaptor, not an on-ledger contract. A GitHub Actions workflow template is included.

### Deliverable 3: Policy binding layer (PolicyConfig.daml)

A test-fixture and application-binding interface that connects a scenario suite to whichever identity or guardrail implementation a team has deployed: a Canton identity or credential standard, a KYA implementation, or a custom enterprise implementation. It lets the same scenario shape be pointed at a different policy implementation without rewriting the suite.

This layer does not normalise different guardrail systems into one universal enforcement semantics. Each binding states the specific policy action it exercises and the specific rejection it expects. Where an implementation exposes a stable error identifier or status, the binding declares it and the scenario asserts it. Where it does not, the binding says so, and the scenario asserts rejection plus post-state invariants only.

### Deliverable 4: Reference workflows and review checklist

Three reference Daml workflows serve as the subject matter the scenarios run against (see Reference Test Suites). They are open-sourced as scaffolding.

The **security review checklist** maps each catalogue pattern to the scenarios a reviewer should expect to see. It also defines a **DAWE-conformant suite**: every applicable catalogue pattern either has at least one passing scenario or is explicitly marked not applicable with a reason. This gives a claim like "this application's adversarial cases were verified using DAWE" a specific, checkable meaning.

---

## Technical Architecture

### Reference workflow (the contract under test)

```daml
-- WorkflowAction, WorkflowContext, PolicyConfig, checkPolicy, and
-- executeAction are defined in companion modules (Types.daml, Policy.daml)
data WorkflowStatus = Pending | Running | Paused | Completed | Failed
  deriving (Eq, Show)

data WorkflowStep = WorkflowStep
  with
    stepId      : Text
    description : Text
    action      : WorkflowAction   -- Tagged sum: Allocate | Settle | Monitor | etc.
  deriving (Eq, Show)

template WorkflowAgent
  with
    operator    : Party
    workflowId  : Text
    steps       : [WorkflowStep]
    currentStep : Int
    policyRef   : ContractId PolicyConfig
    status      : WorkflowStatus
  where
    signatory operator

    choice AdvanceStep : ContractId WorkflowAgent
      with context : WorkflowContext
      controller operator
      do
        assertMsg "Workflow is not in Running state" (status == Running)
        let step = steps !! currentStep
        policy <- fetch policyRef
        assertMsg "Policy violation" (checkPolicy policy context)
        executeAction step.action context
        create this with
          currentStep = currentStep + 1
          status      = if currentStep + 1 >= length steps
                        then Completed else Running

    choice PauseWorkflow : ContractId WorkflowAgent
      controller operator
      do create this with status = Paused

    choice AbortWorkflow : ()
      controller operator
      do return ()
```

**Key design decisions:**
- **Policy is checked on-ledger at each step.** `checkPolicy` runs against the fetched PolicyConfig contract before any action executes, so the ledger rejects an invalid command rather than an optional client-side pre-check declining it. An orchestrator that skips its own validation still cannot advance a step that violates policy (DSP-09).
- **Steps are tagged actions, not external contract calls.** This keeps the reference implementation simple to build and test against.
- **Human override is always present.** `PauseWorkflow` and `AbortWorkflow` give operators circuit-breaker control, and lifecycle scenarios verify that a paused workflow cannot advance (DSP-08).
- **Identity and wallet are optional extensions.** Teams can add Canton identity or wallet references without changing the scenario conventions.

### Execution model

Each named scenario is a top-level `Script ()` test, run independently. A multi-step scenario makes a separate submission for each valid state transition. The adversarial action is then its own expected-failure submission, and the scenario asserts the post-rejection state afterwards.

A rejected transaction commits nothing, by design. Nothing about a failed scenario is persisted on-ledger, and no result contract is created or returned. Pass and fail live in the test runner, and the evidence artifact is produced off-ledger.

| Layer | Responsibility | Where the result lives |
|---|---|---|
| Contract and Canton ledger | Enforce authorization, policy, and lifecycle constraints; reject invalid submissions | A rejected transaction commits no result, by design |
| Daml Script scenario | Set up state; make the valid and expected-invalid submissions; check error status where the integration exposes one; assert state invariants | Pass or fail of the independently run scenario |
| External runner and CI adaptor | Run the scenario set; record per-scenario outcome with target and SDK version metadata; emit JSON or JUnit | CI artifact, not a ledger contract |

### Scenario shape

```daml
module Scenarios.Treasury.SpendLimit where

import Daml.Script
import DA.Assert
import Fixtures.Treasury   -- shared party, policy, and workflow fixtures

-- DSP-09: an allocation above the per-transaction spend limit
-- must be rejected by the ledger, and the workflow must not advance.
spendLimitRejected : Script ()
spendLimitRejected = do
  fx <- setupTreasuryFixture defaultPolicy

  -- valid preceding step, its own submission
  wf1 <- submit fx.operator do
    exerciseCmd fx.workflow AdvanceStep with context = fx.monitorContext

  -- the adversarial submission, on its own
  let overLimit = fx.allocateContext with amount = fx.policy.perTxLimit + 1.0
  submitMustFail fx.operator do
    exerciseCmd wf1 AdvanceStep with context = overLimit

  -- post-rejection invariants: the workflow did not advance
  Some wf <- queryContractId fx.operator wf1
  wf.currentStep === 1
  wf.status === Running
```

Where the integration under test exposes a stable error identifier or failure status, the scenario uses the checked `submitMustFail` variant from Splice's test utilities in place of the bare form, so the test fails if the submission was rejected for the wrong reason. The scenario documentation records which form each case uses and why.

The same shape covers the unauthorised-controller case (DSP-01: the adversarial submission comes from a party that is not the controller) and the replay case (DSP-03: the adversarial submission re-exercises a choice on an archived contract). Over-disclosure (DSP-05) uses a visibility assertion instead: the scenario queries as the unauthorised party and asserts the contract is not visible.

### Output format

The runner reports at two levels:
- **Suite level:** overall pass or fail, count of scenarios passed, the list of any that failed, catalogue coverage (which DSP patterns have passing scenarios), and the target environment and SDK version.
- **Scenario level:** for each scenario, its DSP pattern ID, expected outcome, actual outcome, and the submission where the run diverged.

A developer seeing a failure knows which scenario failed and at which submission without reading raw Sandbox logs. Output is JSON or JUnit. Passing runs produce a summary with scenario identifiers, environment, and timestamps, giving a reviewer a record of what was tested, against what, and when.

---

## Reference Test Suites

- **Treasury rebalancing suite**: a workflow that monitors balances, detects idle capital above a threshold, and allocates into approved instruments. Adversarial scenarios: allocation to a non-allowlisted counterparty (DSP-09), per-transaction spend-limit violation (DSP-02/09), re-submission of an executed allocation step (DSP-03), and advancing a paused workflow (DSP-08).
- **RWA settlement suite**: a multi-party settlement workflow through proposal, acceptance, and settlement steps with timeout and rollback. Adversarial scenarios: settlement attempted by an unauthorised party (DSP-01), acceptance by the wrong counterparty (DSP-06), replay of an already-settled workflow (DSP-03), settlement after the deadline (DSP-04), and settlement detail visible to a non-stakeholder (DSP-05).
- **Compliance monitoring suite**: a workflow that scans active contracts against a policy ruleset and writes an on-chain audit record. Adversarial scenarios: ruleset manipulation by a non-authorised party (DSP-01), re-execution of a completed monitoring cycle against an archived contract (DSP-03), and boundary values in threshold rules (DSP-07).

Taken together, the three suites cover every catalogue pattern with at least one scenario. DSP-10 is covered by the regression runner. The suites also show that the convention holds across different kinds of workflow, not one curated case.

---

## Integration Path for Existing Canton Teams

1. **Add the DAWE fixture library as a Daml package dependency.** It is a standard package added to `daml.yaml`, with no changes to existing contract logic.
2. **Write scenario modules against the checklist.** Walk the catalogue, and for each applicable pattern write a scenario (fixtures, valid submissions, adversarial submission, post-state assertions) or mark it not applicable with a reason. Annotated reference scenarios for all three workflow types are included. A developer familiar with Daml Script can write a basic suite in a day.
3. **Run it in CI.** Scenarios execute through `dpm script` against Canton Sandbox, and the report adaptor turns the run into a JSON or JUnit artifact. A GitHub Actions template is provided. Testnet runs follow the same pattern with updated participant configuration.

The policy binding connects the suite to the team's existing identity and guardrail implementation. A reference binding against a generic credential or KYA interface is included. Teams with a custom implementation follow a documented pattern (typically a few hours of work) and declare the specific policy action and expected rejection their binding tests.

---

## Security Architecture and Threat Model

The scenarios assume that off-chain components are not fully trusted and that the Canton ledger is the authoritative security boundary.

| Threat | Mitigation, and what the scenarios verify |
|--------|------------|
| Orchestrator skips or misconfigures its own validation | Policy enforcement is on-ledger via PolicyConfig. Scenarios submit the invalid command directly, bypassing any client-side pre-check, and require the ledger to reject it (DSP-09). |
| Unauthorised controller access | Daml's authorization model restricts choice exercise to the designated controller. Scenarios submit as a non-controller party and require rejection (DSP-01). |
| Policy bypass via malformed input | Malformed inputs, boundary conditions, and out-of-range values are named scenario classes, not ad hoc tests (DSP-02, DSP-07). |
| Replay against completed workflows | Completed workflow contracts are archived and cannot be re-exercised. Explicit replay scenarios in all three suites (DSP-03). |
| Unintended disclosure | Visibility scenarios assert that non-stakeholders cannot see contracts they should not see (DSP-05). |
| Controller key compromise | `PauseWorkflow` and `AbortWorkflow` provide circuit-breaker control. The adopter guide covers HSM key management and rotation. |
| Test environment contamination | Scenarios run against Canton Sandbox or Testnet with dedicated test parties, isolated from production state. |
| SDK or package upgrade introduces a regression | The regression runner re-runs every suite after any SDK or package change and records SDK version and target, so a regression is attributable to a specific upgrade. Scenarios that depend on a stable error identifier are flagged, since those are the ones an error-code change will break (DSP-10). |

**Scope statement.** A passing DAWE run is evidence that named adversarial cases were executed and rejected as expected. It is not a proof of contract correctness and not a substitute for an audit. The documentation says so explicitly, so teams do not present it as more than it is.

---

## Milestones

The project is delivered in three milestones: two build milestones over 16 weeks, and an adoption milestone that ties the final payment to use by teams other than Sigli.

### Milestone 1 (Weeks 1-6): Catalogue v0, conventions, and treasury suite on Canton Sandbox

**Deliverables:**
1. Open-source repository containing the scenario conventions, shared fixture library, policy binding interface, and CI report adaptor
2. Daml Security Pattern catalogue v0 with at least five patterns fully documented (DSP-01, 02, 03, 08, 09), each with vulnerable and fixed examples
3. Reference treasury workflow and treasury rebalancing suite (at least four adversarial scenarios) running on Canton Sandbox
4. GitHub Actions CI template
5. Combined guide covering setup, scenario authoring, and the evidence output

**Acceptance Criteria:**
1. The treasury suite compiles and runs to completion against Canton Sandbox via `dpm script`, and the report adaptor emits a machine-readable result.
2. The runner reports per-scenario pass or fail, DSP pattern ID, target, and SDK version.
3. At least one policy-violation scenario, run against Canton Sandbox as an independent `Script ()` test, attempts an invalid command that the ledger rejects. Where the integration under test exposes a stable error identifier or failure status, the scenario asserts that reason. The scenario then verifies that workflow state did not advance, and the runner emits a machine-readable result.
4. At least one unauthorised-controller scenario makes its adversarial submission as a non-controller party. The ledger rejects it, and the scenario asserts that no prohibited effect occurred.
5. The CI template runs the suite on a public GitHub Actions run and publishes the report artifact.
6. A reviewer following the guide can go from a fresh clone to a report artifact with no undocumented prerequisites.

### Milestone 2 (Weeks 7-16): Full catalogue, remaining suites, Testnet, review checklist

**Deliverables:**
1. Catalogue v1.0 with all ten patterns (DSP-01 to DSP-10) documented
2. RWA settlement and compliance monitoring suites running on Canton Testnet against their reference workflows
3. Regression runner that re-executes all suites and produces a structured compatibility report for a given SDK version
4. Testnet run of the settlement suite across two organisations
5. Security review checklist and published definition of a DAWE-conformant suite
6. Adopter guide: infrastructure requirements, HSM key management, and a security-review documentation template teams can use with their own auditors
7. Public tutorial covering scenario authoring through to the evidence report

**Acceptance Criteria:**
1. The RWA settlement and compliance monitoring suites run and pass on Canton Testnet.
2. Across the three suites, every catalogue pattern DSP-01 to DSP-09 has at least one passing reference scenario, and DSP-10 is exercised by the regression runner.
3. The regression runner re-executes all three suites and produces a compatibility report naming the SDK version and target.
4. The RWA settlement suite executes on Canton Testnet across two parties hosted by two separate organisations. The counterparty is operated by a pilot team or the champion organisation, not by Sigli, so the authorization boundary under test sits between parties that do not share an operator and cannot sign for one another. The unauthorised-party and partial-execution scenarios run across that boundary. If no external counterparty is secured by the milestone date, Sigli will run the two parties on separately administered participant nodes with independent operator keys, and will state that substitution and its limitations in the milestone report.
5. Each new suite contains at least two adversarial scenarios in which the ledger rejects the adversarial submission and the scenario asserts post-rejection state, using the checked failure-status form wherever the integration exposes a stable identifier.
6. The checklist, conformance definition, tutorial, and adopter guide are published in the repository and submitted to the Canton Foundation for review.

### Milestone 3 (Weeks 17-26): External adoption

This milestone pays only on use of DAWE by teams other than Sigli, and is paid per adopter, following the adoption-milestone structure of previously approved grants (e.g. BitSafe Decentralization Manager, Kaiko Data Standard).

**Deliverables:**
1. Onboarding support for external Canton teams writing DAWE suites for their own Daml packages
2. v1.x release that incorporates adopter feedback (new fixtures, bindings, or catalogue entries contributed back)
3. A public adoption report
4. A live demo at a Canton developer office hour or community call

**Acceptance Criteria:**
1. Each per-adopter payment (48,700 CC, up to two) is released when a Canton team other than Sigli has run a DAWE suite against its own Daml packages, evidenced by a public CI configuration, a public report artifact, or written confirmation posted to this PR.
2. For the second payment: at least one external contribution (fixture, binding, scenario, or catalogue entry) has been merged.
3. For the second payment: the adoption report is published, covering teams onboarded, patterns exercised, issues found, and changes made in response.

---

## Adoption Metrics

| Metric | End of M2 (week 16) | End of M3 (week 26) |
|---|---|---|
| Catalogue patterns documented with a passing reference scenario | 10 | 10+ (community additions) |
| Reference adversarial scenarios | 12+ | 15+ |
| External Canton teams running DAWE on their own packages | 1 (Testnet counterparty) | 3 |
| External contributions merged | — | 2 |
| Public CI runs producing DAWE reports (outside the DAWE repo) | — | 3 |
| Audits or security reviews that used a DAWE report as input | — | 1 |

Metrics will be published in the repository and reported in each milestone submission.

---

## Funding

**Total:** 487,000 CC

| Milestone | Payment | Share | Timing |
|---|---|---|---|
| M1: Catalogue v0, conventions, treasury suite | 194,800 CC | 40% | On acceptance of M1 (week 6) |
| M2: Full catalogue, suites, Testnet, checklist | 194,800 CC | 40% | On acceptance of M2 (week 16) |
| M3: External adoption | 97,400 CC | 20% | 48,700 CC per verified external adopter, up to 2 (by week 26) |

*Volatility stipulation: the CC amount is fixed regardless of CC/USD exchange-rate movements from the date of this submission.*

---

## Post-Milestone Maintenance Plan

We will run the regression suite within 14 days of any major Daml SDK release and publish a compatibility report, including any scenario whose expected error identifier changed. When Canton identity or credential CIPs are ratified, we will update the policy binding hooks within 30 days. The repository will run a public triage process with a 10-day response SLA on bug reports, and a published security-disclosure channel.

Maintenance is funded by Sigli's commercial use: every Sigli workflow is verified against these suites before deployment, so keeping them current with the SDK is work Sigli does regardless of the grant.

## Standardization Path

1. **Versioning.** Packages follow semantic versioning tied to the Daml SDK release cycle. Each release documents compatible SDK and CIP versions, and which scenarios depend on a stable error identifier. The regression runner validates and publishes this after each release.
2. **Governance.** The repository runs a public RFC process for breaking changes to the scenario conventions, the policy binding interface, or the catalogue. After M2, the Canton Foundation is invited to nominate a community maintainer. Sigli holds one vote, the Foundation-nominated maintainer holds one vote, and community contributors with two or more merged PRs hold one vote collectively. No single party can change an interface other teams have built against.
3. **Conformance.** The DAWE-conformant definition (M2) gives "verified with DAWE" a specific, checkable meaning that can be referenced in procurement questionnaires, audit scopes, and Featured App reviews. We will offer the catalogue to the daml-tooling SIG and any Foundation security working group as input to any Foundation-level Daml security standard.

---

## Team

- **Ayan Uali**, CTO at Sigli.ai. Serial CTO with 13+ years of engineering experience, including engineering and CTO roles at Fidelity Investments, Philip Morris International, and JTI. Named CTO of the Year 2025 by Yandex Kazakhstan.

## About Sigli.ai and Why We Are Building This

Sigli.ai is building financial infrastructure for autonomous AI agents on Canton: programmable identities, wallets, compliance guardrails, and execution infrastructure, sold to enterprises (banks, asset managers, treasury desks). Our customers require security evidence before any workflow goes live. That is why we need DAWE ourselves, and why we are well placed to build it against real institutional review requirements rather than hypothetical ones.

For identity, wallet, and payment layers, Sigli builds on existing infrastructure (currently Tenzro's agent identity and MPC wallet components, and Canton's emerging standards) rather than rebuilding primitives. **The DAWE grant deliverable has no dependency on Tenzro, on Sigli's product, or on any third-party infrastructure.** It is plain Daml and Daml Script, and it runs against any Canton Sandbox or network.

Sigli's commercial layer (hosted workflow automation, managed compliance monitoring, enterprise SLAs) sits on top of the open-source suites. Open-sourcing the testing layer gives nothing away. It makes the ecosystem's security practice stronger, which is what our enterprise customers need to see before they commit to Canton.

**Distribution.** After M1 we will approach three groups directly:
1. RWA issuers and tokenisation teams facing recurring audit cycles
2. Systems integrators building Canton applications for institutional clients, where test documentation is a contractual deliverable
3. Agent-orchestration projects on Canton, for which DAWE provides the verification layer

**Foundation asks:** introductions to engineering or security leads at two or three active RWA issuers or integrators, and a slot at one developer office hour or community call to demo the suites and evidence output (supports M3).

## Backward Compatibility

Fully additive. No changes to the Canton protocol, the Daml language, or any existing application contract.

## Open-Source Commitment

All code, the catalogue, the checklist, and the documentation are released under the MIT License.

---

SIG: daml-tooling
