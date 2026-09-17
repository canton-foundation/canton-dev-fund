# Sigli.ai: Daml Automated Workflow Evaluator (DAWE) for Canton

**Champion:** 5North

## Abstract
Sigli.ai is building the on-chain neobank for autonomous AI agents on Canton: programmable identities, wallets, compliance guardrails, and financial execution infrastructure for machines. For the identity, wallet, and payment layers, we are building on existing infrastructure, including Tenzro's agent identity, MPC wallet, and settlement components, rather than rebuilding primitives from scratch.

Daml already has the primitives needed to test that a ledger rejects an invalid submission. `submitMustFail` asserts that a submission fails, and Splice's test utilities add checked variants that assert a specific error identifier or failure status. What the ecosystem does not have is a maintained, shared convention for how a security test suite for a financial Daml workflow should be structured: what the adversarial cases are, how the multi-party and policy fixtures are set up, what the post-rejection state assertions look like, and what evidence the run produces for a security review.

Every team building a complex Daml application today assembles that scaffolding themselves. The primitives are shared; the practice around them is not.

This proposal seeks 487,000 CC (approximately $50,000 USD) to build and open-source the Daml Automated Workflow Evaluator (DAWE): a security scenario convention, a reusable fixture library, three worked financial test suites, and a CI reporting adaptor for Daml applications on Canton. The scenarios are ordinary Daml Script tests built on the existing testing facilities. The contribution is that they are reusable, documented, and produce evidence output a security reviewer can read.

## Background
AI agents are financially homeless. They can execute code, manage complex workflows, and interact with services autonomously, but they cannot hold money, receive payment, or transact without a human approving every step. That is not automation.

Sigli.ai is building the neobank for AI agents on Canton: identity, wallets, payments, compliance, and yield, built for machines rather than humans. The target customer is an enterprise: a bank, asset manager, treasury desk, or financial infrastructure provider that wants to deploy financially autonomous agents in a way that satisfies governance committees, internal security reviews, and regulatory requirements.

For the underlying infrastructure, we are building on what already exists:
- **Agent identity and wallets**: Tenzro provides W3C DID-based agent identity with auto-provisioned MPC wallets, threshold-signed by network validators and portable across chains. We plan to use these components for Sigli's identity and custody layer rather than rebuilding them on Canton from scratch.
- **Agentic payments**: Tenzro natively supports x402, MPP, Visa TAP, and Mastercard Agent Pay. Where applicable, Sigli will integrate Tenzro's payment stack for agent-to-agent and agent-to-service payment flows.
- **Financial settlement**: Tenzro's financial settlement infrastructure supports atomic multi-chain settlement and runs Daml smart contracts with unified settlement alongside EVM and SVM. We plan to use this as the settlement substrate for Sigli's neobank.
- **Daml development environment**: Tenzro's DAML Studio provides an AI-assisted Canton development environment for building, testing, and deploying Daml contracts. We are building on top of this toolchain.

Tenzro is our current preferred provider for these components. Where any component is unavailable or does not meet requirements, we will substitute equivalent infrastructure, whether from Canton's own emerging standards or from alternative providers. The DAWE grant deliverable itself has no dependency on Tenzro or any specific third-party infrastructure.

The gap we are addressing sits above all of these layers, and it is a gap in shared practice rather than in language capability.

## Prior Art and Relationship to Existing Daml Testing Facilities
This section sets out what DAWE is not, before what it is.

**What already exists and works.** Daml Script provides `submitMustFail`, which submits a command, requires the ledger to reject it, and lets the script continue. This is the correct and intended way to test that an unauthorised party cannot exercise a choice, that a policy assertion fires, or that an archived contract cannot be re-exercised. Splice's public test utilities go further, with checked variants that assert an expected error identifier or failure status so that a test does not pass because the submission failed for an unrelated reason. Daml Script runs against Canton Sandbox through `dpm script`, so integration-level scenarios need no new runner.

DAWE does not replace any of this, does not wrap it in a new abstraction, and does not claim that Daml lacks negative-testing primitives. Every DAWE scenario is an ordinary Daml Script test calling these existing functions.

**What DAWE adds.** Five things, none of which is a new ledger mechanism:

1. **A scenario convention.** A documented structure for a security scenario: fixture setup, the valid preceding submissions, the single adversarial submission, and the post-rejection state assertions. Today every team invents this shape independently.
2. **A reusable fixture library.** Multi-party setup, policy configuration, time and lifecycle fixtures, and workflow construction helpers, so that a team writing its fourth adversarial case is not rewriting party allocation and contract setup for the fourth time.
3. **Three worked financial suites.** Treasury rebalancing, RWA settlement, and compliance monitoring, each with named adversarial cases. These are the reference material a team adapts rather than starts from.
4. **Documented application bindings.** A pattern for binding the scenario set to a team's own policy or guardrail implementation, with the specific policy action and expected rejection named per integration.
5. **CI-friendly evidence output.** An external runner that executes the scenario set, preserves per-scenario outcome with target and SDK version metadata, and emits JSON or JUnit. This is the artifact that goes into a security review pack.

The value is in making the adversarial cases, the setup, the assertions, and the evidence output reusable across teams. It is not in inventing a new way to assert a rejection.

**Where an exact failure reason matters**, DAWE composes the existing primitives rather than introducing its own. In a Splice-based test that means the checked `submitMustFail` variant with an expected error identifier or failure status, following the pattern in Splice's own test utilities. The documentation will state, per scenario, which checks depend on a stable error identifier or status and which assert only rejection plus post-state invariants, so that a team knows which of its tests are coupled to error-code stability across SDK versions.

## The Problem
The consequences of the missing convention are concrete and they show up at procurement, not at compile time.

In our own experience preparing Sigli's first enterprise pilots, assembling the security verification documentation required by a prospective institutional client took several weeks of manual effort: hand-written test scripts, narrative descriptions of what each script was testing, screenshots of Sandbox output, and custom formatting to match the client's internal security review template. The tests themselves were not the hard part. Deciding which adversarial cases counted as complete coverage, and turning a passing test run into something a risk committee would accept as evidence, was the hard part. None of that work was reusable for the next client.

Teams in the Canton ecosystem we have spoken with report the same pattern. One RWA issuer preparing for a third-party security audit estimated that bespoke test documentation accounted for six to eight weeks of their deployment timeline. Another team deploying a compliance monitoring contract delayed their mainnet launch by over a month while preparing evidence packs for their legal and risk committees.

The result across the ecosystem is uneven adversarial coverage, security assumptions that live in one engineer's head rather than in a named test, and verification evidence rebuilt from scratch for every client engagement. A shared convention and a shared fixture library fix the first two. A reporting adaptor fixes the third.

Sigli needs this solved to ship its own product. This grant is about building it properly and releasing it as a public good.

## What the Grant Funds
The grant deliverable is a two-part open-source framework, plus the reference workflow applications needed to demonstrate it against realistic financial use cases.

### Grant deliverable 1: Security scenario suite, fixture library, and CI report adaptor
The core of the grant. A set of Daml Script scenario conventions and reusable fixtures that let any Canton team write a security suite for a multi-step financial workflow without rebuilding the scaffolding. Named scenario classes cover correct-path execution, policy violation rejection, unauthorised controller access attempts, replay attempts against archived workflows, and boundary conditions at spend limits, velocity thresholds, counterparty allowlists, and time window expiry.

An external runner executes the scenario set and emits structured, machine-readable results with per-scenario outcome, target environment, and SDK version, suitable as input for change-control documentation, security review evidence packs, and regulatory audit workflows. The runner is a standard test runner and CI adaptor. It is not an on-ledger contract.

### Grant deliverable 2: Policy binding layer (PolicyConfig.daml)
A test-fixture and application-binding interface that connects a scenario suite to whichever identity or guardrail implementation the team has deployed, whether Tenzro's identity components, an emerging Canton KYA CIP, or a custom enterprise implementation. Its purpose is to let the same scenario shape be pointed at a different policy implementation without rewriting the suite.

This layer does not normalise different guardrail systems into one universal enforcement semantics, and this proposal makes no such claim. Different implementations reject differently, and that difference is real. Each binding must state the specific policy action it exercises and the specific rejection it expects. Where an implementation exposes a stable error identifier or status, the binding declares it and the scenario asserts it. Where it does not, the binding says so and the scenario asserts rejection plus post-state invariants only.

### Reference Workflow Implementation (WorkflowAgent.daml)
To demonstrate the scenarios against realistic conditions, we are building a reference Daml workflow implementation: a standardised multi-step workflow pattern with precondition validation, conditional branching, human override, and on-ledger audit trail. This is the subject matter the scenarios run against. The reference workflow is open-sourced alongside the suites as a usable scaffold for any Canton team.

## Technical Architecture

### WorkflowAgent.daml (the contract under test)

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
- **Steps are tagged actions, not external contract calls**: each step carries its action inline as a tagged sum type. No external StepExecutor contracts or contract key lookups are needed, keeping the reference implementation straightforward to build and test against.
- **Policy is checked on-ledger at each step**: `checkPolicy` runs against the fetched PolicyConfig contract before any action executes, so an invalid command is rejected by the ledger rather than declined by an optional client-side pre-check. An orchestrator that skips its own pre-flight validation still cannot advance a step that violates policy.
- **Every step is auditable**: workflow state is on-chain and immutable. Enterprises have a complete, tamper-proof record of every autonomous agent action for governance and regulatory reporting.
- **Identity and wallet are optional extensions**: the reference implementation is kept minimal. Teams can extend it with Canton identity or wallet contract references via additional fields without modifying the scenario conventions.
- **Human override is always present**: PauseWorkflow and AbortWorkflow give operators immediate circuit-breaker control, satisfying institutional governance requirements.

### Execution model
Each named scenario is a top-level `Script ()` test, run independently. A multi-step scenario makes a separate submission for each valid state transition. The adversarial action is then its own expected-failure submission, and the scenario asserts the post-rejection state afterwards.

A rejected transaction commits nothing, by design. Nothing is therefore persisted on-ledger about a failed scenario, and no result contract is created or returned. Pass and fail live in the test runner, and the evidence artifact is produced outside the ledger.

| Layer | Responsibility | Where the result lives |
|---|---|---|
| Contract and Canton ledger | Enforce authorization, policy, and lifecycle constraints; reject invalid submissions | A rejected transaction commits no result, by design |
| Daml Script scenario | Set up state; make the valid and the expected-invalid submissions; check error status where the integration exposes one; assert state invariants | Pass or fail of the independently run scenario |
| External runner and CI adaptor | Run the scenario set, preserve per-scenario outcome with target and SDK version metadata, emit JSON or JUnit | CI artifact, not a ledger contract |

### Scenario shape

```daml
module Scenarios.Treasury.SpendLimit where

import Daml.Script
import DA.Assert
import Fixtures.Treasury   -- shared party, policy, and workflow fixtures

-- Adversarial scenario: an allocation above the per-transaction spend limit
-- must be rejected by the ledger, and the workflow must not advance.
spendLimitRejected : Script ()
spendLimitRejected = do
  fx <- setupTreasuryFixture defaultPolicy

  -- valid preceding step, its own submission
  wf1 <- submit fx.operator do
    exerciseCmd fx.workflow AdvanceStep with context = fx.monitorContext

  -- the adversarial submission, on its own
  submitMustFail fx.operator do
    exerciseCmd wf1 AdvanceStep with
      context = fx.allocateContext with
        amount = fx.policy.perTxLimit + 1.0

  -- post-rejection invariants: the workflow did not advance
  Some wf <- queryContractId fx.operator wf1
  wf.currentStep === 1
  wf.status === Running
```

Where the integration under test exposes a stable error identifier or failure status, the scenario uses the checked `submitMustFail` variant from Splice's test utilities in place of the bare form, so that the test fails if the submission was rejected for the wrong reason. The scenario documentation records which form each case uses and why.

The same shape covers the unauthorised-controller case (the adversarial submission is made by a party that is not the controller) and the replay case (the adversarial submission re-exercises a choice on an archived contract).

### Output format
The external runner produces results at two levels:
- **Suite level**: overall pass or fail, count of scenarios passed, list of those that failed, plus the target environment and SDK version the run executed against
- **Scenario level**: for each scenario, the expected outcome, the actual outcome, and which submission the run diverged at

A developer seeing a failure knows which scenario failed and at which submission, without reading raw Sandbox logs. Output is JSON or JUnit, consumable by a CI system or passed into a team's own reporting tooling. Passing runs produce a summary with scenario identifiers, environment, and timestamps, giving a security reviewer a record of what was tested, against what, and when.

## Reference Test Suites
The suites ship as the primary reference material. The example workflows they run against are open-sourced as scaffolding for any Canton team to use.

- **Treasury rebalancing suite**: a workflow that monitors asset balances, detects idle capital above a threshold, and allocates into approved instruments. Adversarial scenarios: allocation to a non-allowlisted counterparty, per-transaction spend limit violation, and re-submission of an already-executed allocation step.
- **RWA settlement suite**: a multi-party settlement workflow through proposal, acceptance, and settlement steps with timeout and rollback. Adversarial scenarios: settlement attempted by an unauthorised party, replay of an already-settled workflow, and partial execution under timeout.
- **Compliance monitoring suite**: a workflow that scans active contracts against a policy ruleset and writes an on-chain audit record. Adversarial scenarios: ruleset manipulation attempts and re-execution of a completed monitoring cycle against an archived contract.

Each suite produces the structured output described above, demonstrating that the conventions hold across qualitatively different workflow types rather than a single curated case.

## Integration Path for Existing Canton Teams
A Canton team with existing Daml contracts can adopt the conventions in three steps:

1. **Add the DAWE fixture library as a Daml package dependency**. It is a standard Daml package added to `daml.yaml` alongside existing contracts, with no changes to existing contract logic.
2. **Write a scenario module**. A scenario module defines the parties, the fixture setup, the valid submissions, the adversarial submission, and the post-state assertions. Reference scenarios for all three workflow types are included as annotated starting points. A developer familiar with Daml Script can write a basic suite in a day.
3. **Run against Canton Sandbox and in CI**. Scenarios execute through `dpm script` against the team's existing Sandbox. The report adaptor turns the run into a JSON or JUnit artifact. No new infrastructure is required for Milestone 1. Testnet integration follows the same pattern with updated participant configuration.

The policy binding connects the suite to the team's existing identity and guardrail implementation. A reference binding against a generic Canton KYA interface is included. Teams using a custom implementation follow a documented pattern, typically a few hours of work, and declare the specific policy action and expected rejection their binding tests.

## Security Architecture and Threat Model
The DAWE scenarios are written on the assumption that off-chain components are not fully trusted and that the Canton ledger is the authoritative security boundary. The table below sets out the threats the scenarios exercise and how each is addressed.

| Threat | Mitigation, and what the scenarios verify |
|--------|------------|
| Orchestrator skips or misconfigures its own validation | Policy enforcement is on-ledger via PolicyConfig. Scenarios submit the invalid command directly, bypassing any client-side pre-check, and require the ledger to reject it. |
| Unauthorised controller access | Daml's signatory model restricts choice exercise to the designated operator party. Scenarios make the adversarial submission as a non-controller party and require rejection. |
| Policy bypass via malformed input | Malformed inputs, type boundary conditions, and out-of-range values are covered as named scenario classes rather than left to ad hoc testing. |
| Replay against completed workflows | Completed workflow contracts are archived and cannot be re-exercised. The settlement suite includes an explicit replay scenario. |
| Controller key compromise | PauseWorkflow and AbortWorkflow provide immediate circuit-breaker control. HSM key management and rotation guidance is included in the mainnet readiness guide. Tenzro's MPC wallet architecture further mitigates key compromise risk for Sigli's own deployments. |
| Test environment contamination | Scenarios run against Canton Sandbox or Testnet with dedicated test parties, isolated from production ledger state. |
| SDK or CIP upgrade introduces regression | The suite is designed to be re-run after any SDK or CIP change. The runner records SDK version and target in every report, so a regression is attributable to a specific upgrade. Scenarios that depend on a stable error identifier are documented as such, since those are the ones an error-code change will break. |

A note on scope: a passing DAWE run is evidence that named adversarial cases were executed and rejected as expected. It is not a proof of contract correctness and not a substitute for audit. The documentation states this explicitly so that teams do not present it as more than it is.

## Why Sigli Is Building This
Sigli is building the DAWE because we need it to ship our own product. Every financial workflow in Sigli's neobank (yield allocation, settlement chains, treasury rebalancing, compliance monitoring) will be verified against these suites before mainnet deployment. The evidence they produce is what we use to satisfy enterprise customers' procurement and audit requirements.

The grant scope is the open-source conventions, fixtures, reference suites, and report adaptor that make this usable by other teams.

The commercial advantage Sigli is building is in the hosted infrastructure, managed compliance services, and enterprise SLAs that Canton institutions will pay for. Open-sourcing the testing layer does not give that away. It establishes Sigli as a Canton contributor and creates ecosystem adoption of the convention the managed product sits on top of.

## GTM Strategy
**Institutional and enterprise teams**
The primary audience is an enterprise development team or systems integrator building on behalf of a bank, asset manager, or financial infrastructure provider. These teams need both workflow automation and reproducible security verification evidence for internal sign-off.

Initial pilot targets, three categories of early adopter we intend to approach directly after Milestone 1:
1. RWA issuers on Canton running live or near-live tokenisation workflows who face recurring audit and security review cycles. These teams have an immediate need for reproducible security evidence and are the primary targets for the treasury rebalancing suite. Broadridge, 21Shares, and Black Manta Capital Partners are named targets.
2. Systems integrators building Canton applications on behalf of institutional clients, where test documentation is a contractual deliverable. These teams have the strongest incentive to adopt a shared convention and are the fastest route to external validation.
3. Tenzro DAML Studio users already building Canton contracts in a toolchain we are building alongside. We will position the DAWE as the default testing convention for Daml applications built using the Tenzro stack.

Distribution through Canton's enterprise developer channels, direct outreach to the above, and co-presentation with the Foundation at enterprise events.

**AgenticLedger integration**
AgenticLedger handles agent creation and orchestration. The DAWE covers workflow security testing. The two are complementary. We will propose a formal integration, positioning the DAWE suites as the verification convention for any AgenticLedger agent driving multi-step Daml workflows.

**RWA issuers via treasury suite**
The treasury rebalancing suite is a direct starting point for RWA issuers running manual treasury operations on Canton. We will present it as a free, ready-to-run suite covering the most common security boundaries these teams need to demonstrate to auditors and risk committees.

**Foundation asks**
Introductions to engineering and security leads at two to three active RWA issuers, and a slot at one Canton developer office hour or enterprise-facing community event to demonstrate the suites and their evidence output. We handle all follow-up independently.

## Standardization Path
Positioning the DAWE as a community convention requires more than open-sourcing code. We are approaching it in three stages:

1. **Versioning**: the packages follow semantic versioning tied to the Daml SDK release cycle. Each version documents which SDK versions and which CIP revisions it is compatible with, and which scenarios depend on a stable error identifier. The regression runner validates and publishes this compatibility information after each release.
2. **Governance**: the GitHub repository operates with a public RFC process for breaking changes to the scenario conventions or the policy binding interface. Canton Foundation is invited to nominate a maintainer from the community after Milestone 2 is accepted. Sigli holds one vote; the Foundation-nominated maintainer holds one vote; community contributors with two or more merged PRs hold one vote collectively. This keeps the convention open and prevents any single party from unilaterally changing an interface other teams have built against.
3. **Adoption path**: after Milestone 2, we publish an integration guide and a stated definition of what a DAWE-conformant suite covers, so that a claim of the form "this application's adversarial cases were verified using the DAWE suite" has a specific and checkable meaning for institutional buyers and auditors.

## Differentiation From Other Canton Proposals
Other teams are building identity, wallet, and KYA primitives. Sigli is using those and Tenzro's infrastructure where they fit, not competing with them. The DAWE sits at a different layer again: it is the shared testing practice that makes those primitives demonstrably safe to deploy in an enterprise environment, built on Daml's existing test facilities rather than alongside them.

| | Identity / Wallet / KYA proposals | Tenzro components | Daml Automated Workflow Evaluator (DAWE) |
|---|---|---|---|
| **What it builds** | On-chain financial primitives | Agent identity, MPC wallets, payment stack, settlement | Security scenario conventions, fixtures, reference suites, and CI evidence output for Daml workflows |
| **Sigli's relationship** | Building on top | Using as infrastructure where applicable | Building and open-sourcing for production use |
| **Who else benefits** | Canton developers broadly | Tenzro ecosystem developers | Any Canton team deploying Daml contracts in an enterprise context |
| **What it unlocks for enterprise** | Necessary foundation | Custody, payments, settlement | Security review evidence, audit documentation, governance sign-off |

## Milestones
The project will be delivered in two phases over 16 weeks.

### Milestone 1 (Weeks 1-6): Scenario conventions and treasury suite on Canton Sandbox
**Deliverables:**
1. Open-source repo with the scenario conventions, the shared fixture library, the policy binding interface, and the CI report adaptor
2. Reference workflow implementation (WorkflowAgent.daml) as open-source scaffold for other teams to test against
3. Treasury rebalancing scenario suite, including at least two adversarial scenarios, running against the reference workflow on Canton Sandbox
4. Documentation: a single combined guide covering setup, scenario authoring, and the evidence output

**Acceptance Criteria:**
1. The treasury suite compiles and runs to completion against Canton Sandbox via `dpm script`, and the report adaptor emits a machine-readable result for the run
2. The suite contains both correct-path and adversarial scenarios, and the runner reports per-scenario pass or fail with target and SDK version metadata
3. At least one policy-violation scenario, executed against Canton Sandbox as an independent `Script ()` test, attempts an invalid command that the ledger rejects. Where the integration under test exposes a stable error identifier or failure status, the scenario asserts that expected reason. The scenario then verifies that the workflow state did not advance, and the external runner emits a machine-readable result.
4. At least one unauthorised-controller scenario makes its adversarial submission as a non-controller party, the ledger rejects that submission, and the scenario asserts that no prohibited effect occurred
5. A reviewer following the combined guide can go from repo clone to a report artifact with no undocumented prerequisites

### Milestone 2 (Weeks 7-16): Remaining suites, Testnet, and mainnet readiness
**Deliverables:**
1. RWA settlement and compliance monitoring suites, each including at least two adversarial scenarios, running against their respective reference workflows on Testnet
2. Regression runner: re-executes all suites and produces a structured compatibility report against a given SDK version
3. Testnet deployment with the settlement suite executed across two organisations
4. Mainnet readiness guide for adopting teams: infrastructure requirements, HSM key management, and a security review documentation template teams can use with their own auditors
5. Public tutorial covering scenario authoring and evidence output

**Acceptance Criteria:**
1. The RWA settlement and compliance monitoring suites run and pass on Canton Testnet against their reference workflows
2. The regression runner re-executes all three suites and produces a structured compatibility report naming the SDK version and target
3. The RWA settlement suite executes on Canton Testnet across two parties hosted by two separate organisations, with the counterparty operated by a pilot team or the champion organisation rather than by Sigli, so that the authorisation boundary under test sits between parties that do not share an operator and cannot sign for one another. The suite's unauthorised-party and partial-execution scenarios run across that boundary. If no external counterparty is secured by the milestone date, Sigli will run the two parties on separately administered participant nodes with independent operator keys, and will state that substitution and its limitations explicitly in the milestone report.
4. Each of the two new suites contains at least two adversarial scenarios in which the ledger rejects the adversarial submission and the scenario asserts the post-rejection state, with the checked failure-status form used wherever the integration exposes a stable identifier
5. The tutorial and documentation cover all steps from scenario authoring to report artifact, with no undocumented prerequisites
6. Mainnet readiness guide completed and submitted to Canton Foundation for review

## Post-Milestone Maintenance Plan
We will run the regression suite within 14 days of any major Daml SDK release and publish a compatibility report, including any scenario whose expected error identifier changed. When Canton identity or wallet CIPs are ratified, we will update the policy binding hooks within 30 days. The GitHub repository will maintain a public triage process with a 10-day response SLA on bug reports and prompt response to security disclosures.

Sigli's commercial roadmap builds directly on this foundation: hosted workflow automation, managed compliance monitoring, and enterprise SLAs for Canton institutions. The open-source suites remain community-owned. The commercial layer sustains long-term upstream contribution.

## Backward Compatibility
Fully additive. No changes to the Canton core protocol, consensus layer, or any existing application contract.

## Open-Source Commitment
All code released under the MIT License.

## Ecosystem Impact
- **A shared security testing practice for Daml workflows**: teams building for institutional clients get a documented convention, a fixture library, and worked adversarial suites, instead of deciding independently what adequate coverage looks like and rebuilding the scaffolding each time.
- **Production-pattern reference implementations** for common institutional workflows, with adversarial suites included, ready to fork and adapt.
- **Evidence output that survives procurement**: security review and audit documentation is one of the main friction points slowing institutional deployments. A machine-readable run report with environment and version metadata is the artifact those reviews actually need.
- **Ecosystem alignment**: identity and custody from Tenzro and Canton's emerging standards, security verification practice from the DAWE, commercial product from Sigli. Layered rather than duplicative.

**Adoption metrics we will track and report:**

| Metric | 3-month target |
|---|---|
| Canton teams using the suites | 2 pilot teams |
| Daml workflows tested with the suites | 3 (reference suites) |
| Security scenario suites run | 3 reference + pilot runs |
| GitHub stars/forks | 5 |

*These metrics will be published within a 3-month window or as soon as achieved.*

## Funding
**Total**: 487,000 CC (approximately $50,000 USD)

| Milestone | Payment | Timing |
|---|---|---|
| M1 | 243,500 CC | On acceptance of Milestone 1 |
| M2 | 243,500 CC | On acceptance of Milestone 2 |

*Volatility stipulation: Project duration is approximately 16 weeks. The CC amount is fixed regardless of CC/USD exchange rate movements from the date of this submission.*

## Conclusion
Sigli.ai is building the neobank for AI agents on Canton, with enterprise institutions as the primary customer. For the foundational infrastructure, we are building on what already exists: Tenzro's agent identity, MPC wallets, payment stack, and settlement infrastructure where applicable, and Canton's emerging community standards for everything else.

The DAWE is the testing practice layer. Daml supplies the mechanism for asserting that a ledger rejects an invalid submission. This grant supplies the convention, the fixtures, the worked financial suites, and the evidence output that make that mechanism reusable across teams and legible to a security reviewer.

The suites are something we are building because we cannot ship Sigli's neobank to enterprise clients without them. The grant covers the open-source release and the reference material that makes them immediately usable by other Canton teams. The neobank is the product. The testing practice is the ecosystem contribution.

SIG: daml-tooling
