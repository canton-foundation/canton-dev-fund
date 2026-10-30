## Canton DevKit Extension: Multi-Synchronizer Tooling, Declarative LocalNets and DevNet/TestNet Workflows

**Organization:** BitDynamics
**Author / Primary Contact:** Srikanth (BitDynamics)
**Status:** Submitted
**Created:** 2026-09-23
**Proposal Type:** RFP-aligned
**RFP / Roadmap Area:**

- RFP #5: Multi-synchronizer support for protocol, application development and operations
- RFP #18: Integration into SDLCs
- RFP #19: DPM Components and Extension Ecosystem

**Champion:** Needs Champion
**Total Funding Request:** 4,800,000 CC

**Project Duration:** 6 months
**Label:** canton-protocol-multi-synchronizer

---

## Abstract

Canton developers need a reproducible way to test applications across configurable multi-synchronizer LocalNets and use consistent package workflows as they move from LocalNet to DevNet and TestNet. This DevKit extension adds declarative LocalNet setup, multi-synchronizer topology and reassignment helpers, synchronizer-aware DAR workflows, remote Linux host support for running LocalNet on a cheap VPS over SSH, and CI improvements. It aims to reduce environment setup and testing friction for Canton teams while making multi-synchronizer application development more accessible.

---

## Specification

### 1. Objective

The objective of this proposal is to extend Canton DevKit so users can test their applications in multi-synchronizer LocalNets, launch pre-seeded test environments quicker, and have smoother experience promote their packages onto DevNet and TestNet environment. It is to address the following improvements identified in recent Splice releases, Canton Network roadmap update and DevKit user feedbacks:

- Multi-synchronizer LocalNet support and helper features. It includes launching LocalNet with a customizable multi-synchronizer topology, selecting validator-to-synchronizer connections, contract reassignment with diagnosis support, and topology visibility in both the CLI and Web UI.
- Declarative LocalNet setup with topology support. Teams can define LocalNet topology, pre-created parties, pre-uploaded packages, token balances and per-synchronizer vetting in one config file and bootstrap the network into that state in a single command.
- Remote Linux LocalNet host. Teams can point DevKit at a user-provided Linux machine (for example a low-cost Hetzner or similar VPS), bootstrap that host over SSH with the Docker and OS prerequisites DevKit needs, then launch, inspect and tear down LocalNet on the remote machine through the same CLI and Web UI workflows used for a laptop LocalNet. SSH port forwarding will expose published LocalNet services on the developer machine so existing helpers keep working, and optional API ingress will let a remote LocalNet be shared with others.
- DevNet and TestNet helpers. Users can register authorized DevNet and TestNet validators in DevKit and use consistent DAR and contract workflows across environments. Remote DAR upload and vetting will reuse the `canton-deploy` DPM component funded under #322, integrated into the DevKit workflow.
- Application testing with PQS and external parties. An optional PQS profile will support SQL queries over the configured participant's visible ledger data. A supplied example will demonstrate external-party onboarding and the prepare, sign, execute and confirmation steps for a sample transaction using the upstream Wallet SDK.
- CI/CD performance optimization and documentation improvement. BitDynamics will optimize environments bootstrap and resource re-use between sessions to reduce the CI/CD pipeline running time. We will also create more examples, tutorials, and documentation to help users test their applications using LocalNet and DevKit.

### 2. Implementation Mechanics

The work covers declarative LocalNet configuration, remote Linux LocalNet hosts over SSH, multi-synchronizer helpers, DevNet/TestNet workflows, application-testing integrations and a reusable CI pack. PQS integration and the external-party example build on the LocalNet configuration.

#### Declarative LocalNet Support

We will extend the DevKit container management engine to support LocalNet configuration from a YAML configuration file, in addition to the existing CLI command parameters. From that file DevKit will bootstrap a LocalNet with matching topology, connect validators to the declared synchronizers, upload and vet packages, apply init, and verify observed state matches the file. When DevKit is launched via `dpm` from a Daml project, the current `daml.yaml` / `multi-package.yaml` DARs are used by default (`packages: project` or omit `packages`); explicit package entries remain available for overrides and external DARs.

In these configurations, the Global Synchronizer refers to the SV-operated local synchronizer provided by Splice LocalNet. DevKit retains this local synchronizer as the base of each supported topology; dedicated synchronizers are additional instances.

Example YAML configuration (proposed structure only. subjected to changes):

```yaml
version: 1
# LocalNet instance name
name: localnet-1

# Splice version
splice: 0.8.3

# Base host port for published LocalNet services
basePort: 6000

# Optional: run this LocalNet on a user-provided Linux host over SSH
# (for example a Hetzner or similar VPS). Omit to run on the local machine.
# remote:
#   host: 203.0.113.10
#   user: ubuntu
#   identityFile: ~/.ssh/id_ed25519 Optional, use default ssh key if not specified

# This DevKit configuration retains Splice LocalNet's SV-operated
# local synchronizer, which represents the Global Synchronizer.
# Declare additional dedicated synchronizers below.
# Omit this section to run without additional dedicated synchronizers.
dedicated-synchronizers:
  private-sync-1:
    # optional; defaults to the map key
    alias: private-sync-1

validators:
  - name: validator-1 # validator name
    # Additional dedicated-synchronizer connections.
    # This configuration also connects each validator to the local Global Synchronizer.
    synchronizers:
      - name: private-sync-1
        priority: 10 # vs global (default 0) for automatic routing
    parties:
      - hint: alice
        amulets: 1000
      - hint: bob

  - name: validator-2 # validator name
    # Additional dedicated-synchronizer connections.
    # This configuration also connects each validator to the local Global Synchronizer.
    synchronizers:
      - name: private-sync-1
        priority: 10
    parties:
      - hint: charlie

packages:
   # location to daml.yaml / multi-package.yaml
   - project: .
     # by default the dar will be uploaded and vet to all validators
     # on every connected synchronizer. Keep an explicit list only
     # for overrides or extra DARs.
     uploadTo: [validator-1]           # optional override
     vet:
       private-sync-1: [validator-1]
   - dar: deps/token-standard.dar      # external DAR
     uploadTo: [validator-1, validator-2]
```

#### Remote Linux LocalNet host

We will extend DevKit so a LocalNet defined in YAML or launched from the CLI/Web UI can run on a user-provided Linux host reached over SSH. The operator supplies an existing machine (a cheap VPS such as Hetzner is a typical target); DevKit registers the host, bootstraps it, and manages LocalNet there.

DevKit will provision the server over SSH and verify the environment so the host ready to run Canton LocalNet remotely. Lifecycle commands (`up`, `down`, status/check, package upload and init) will execute against the remote Docker engine so that the declarative config and multi-synchronizer profiles behave the same as on a laptop.

For day-to-day development, DevKit will forward the published LocalNet ports (JSON Ledger API, admin and related services for the active topology) to localhost over SSH, so the CLI, Web UI and application clients on the developer machine talk to the remote stack without changing their usual endpoints. DevKit will also support adding ingress to those APIs on the remote host so a LocalNet can be shared with other developers. Documentation will cover recommended VPS sizing, SSH key and firewall practice for an SSH-reachable development host, ingress configuration for shared access, and how to tear down or re-bootstrap the remote LocalNet cleanly.

#### Multi-synchronizer LocalNet support features

We will add support for contract reassignment, a topology view (validators, synchronizers, connections, vetting matrix, contracts by synchronizer), and multi-synchronizer updates to existing `dar`, `token`, `contracts` commands. DevKit will ship with two default topology profiles:

- LocalNet with the SV-operated local synchronizer representing the Global Synchronizer (default)
- LocalNet with the same local Global Synchronizer and one additional dedicated synchronizer

The `contracts reassign` helper will use Canton's normal Ledger API unassign/assign workflow.

Diagnostics will check relevant stakeholder hosting and participant connectivity, required confirmation permissions and topology for signatories, and package vetting. Each stakeholder must have a participant hosting it on both the source and target under Canton's reassignment rules; this does not require every participant hosting that party to be connected to both. The helper will report observed prerequisite failures and distinguish rejected unassignment, pending assignment and confirmed assignment.

After successful unassignment, the contract is unavailable for transactions until assignment on the target completes. The helper will report the reassignment as complete only after assignment is confirmed; no fixed completion time is assumed.

#### DevNet and TestNet support and management

Canton DevKit will extend its existing `dar` and `contracts` workflows to authorized DevNet and TestNet validators. For supported remote DAR upload and vetting operations, DevKit will integrate the `canton-deploy` DPM component funded under [proposal #322](https://github.com/canton-foundation/canton-dev-fund/pull/322) through its documented DPM commands.

#### GitHub-related CI improvement, performance optimization, documentation and more examples

We will optimize the LocalNet bootstrap time and resource reusability between CI pipeline stages, so that team can have shorter feedback loops. The current suggestion is to introduce caching + snapshots into a new public LocalNet GitHub Action so developers can just integrate directly.

We will also introduce/improve the CI-related command output so that the result and LocalNet status is more clear in the GitHub Action page, without having to go to the log details.

On the documentation and example side, more content will be added around tutorial and real-life use cases in application development, as well as best practices on the infrastructure and CI/CD setup.

### 3. Architectural Alignment

Canton's 2026–2028 roadmap describes a Network of Networks: the Global Synchronizer as the default public coordination plane, plus many dedicated synchronizers for scale, isolation, and consortium governance, with applications able to transact across synchronizers for capacity and redundancy. However the ecosystem support for multi-synchronizer is still in its early phase, and the Canton dev fund roadmap is calling for contribution in relevant developer tooling, including multi-sync sandboxes, and documentation. Our proposal answers that ask by making multi-synchronizer a first-class feature in Canton DevKit.

### 4. Backward Compatibility

Users can still create LocalNet using the command line or web UI just like before. LocalNets created using old container management engine will be migrated to the newer architecture and they will not work with older versions of canton-devkit.

---

## Milestones and Deliverables

The project is divided into three milestones over six months. Delivery dates are measured from grant approval.

### Milestone 1: Declarative LocalNet Support

**Estimated Delivery:** Month 3 after approval
**Focus:** Reproducible YAML-driven LocalNet setup, including multi-synchronizer topology and initial state.

**Deliverables / Value Metrics:**

- A versioned YAML configuration format with JSON Schema validation for validators, synchronizers, parties, initial LocalNet balances, packages, vetting and initialization settings, including an optional remote-host block for SSH target, user and identity.
- Project DAR discovery when launched through `dpm`, together with explicit project and external-DAR overrides, as described in the Specification.
- Two default topology profiles, including a `multi-sync` profile, and selection of named validators in the relevant existing commands.
- Reproducible example configurations (including a remote-VPS walkthrough sized for a cheap Linux cloud machine such as Hetzner), setup documentation and compatibility tests for the documented supported releases.

### Milestone 2: Multi-synchronizer Helpers and CI Pack

**Estimated Delivery:** Month 5 after approval
**Focus:** Application testing across synchronizers, reassignment diagnostics, remote-host developer access and reusable CI environments.

**Deliverables / Value Metrics:**

- `contracts reassign` using the normal Ledger API unassign/assign workflow, with prerequisite checks, assignment-progress reporting and diagnostics for documented failure scenarios, plus examples of explicit reassignment and supported automatic reassignment.
- CLI and Web UI topology views showing validators, synchronizers, connections, package-vetting state and contract locations; machine-readable status output; and synchronizer-aware updates to the existing `dar`, `token` and `contracts` commands.
- SSH bootstrap of a user-provided Linux host, then runs the same LocalNet lifecycle (`up`, `down`, status/check) on that host.
- SSH port-forwarding / tunnel support so published LocalNet services on a remote Linux host are available on localhost for the CLI, Web UI and application clients, plus optional API ingress so a remote LocalNet can be shared with others, with documented diagnostics for SSH and Docker connectivity failures.
- A public LocalNet GitHub Action with an example workflow, readable job summaries and CI check output in JSON/JUnit formats.
- LocalNet caching and snapshot/restore for documented compatible versions and configurations.

### Milestone 3: Application Integrations, DevNet/TestNet Helpers and Adoption

**Estimated Delivery:** Month 6 after approval
**Focus:** PQS integration, an external-party signing example, retained CI diagnostics, integration of existing deployment tooling into authorized remote workflows, final release and verified external adoption.

**Deliverables / Value Metrics:**

- An opt-in PQS profile, reproducible external-party LocalNet example using the upstream Wallet SDK, Extensions to existing log access and the public GitHub Action to collect service logs and diagnostic status before cleanup and retain a downloadable failure artifact. The documented collection procedure will also work locally.
- Registration, listing and status inspection of DevNet and TestNet validators, with documented authentication and permission requirements.
- Remote DAR management, including listing, upload, vetting and `dar sync` with dry-run, together with supported contract inspection and readiness checks consistent with LocalNet workflows.
- A published release with documentation covering supported versions, environment-specific limitations and the workflow from LocalNet to DevNet/TestNet.
- A workshop or recorded walkthrough, one written case study based on a demonstrated workflow, and integration support during the project period.
- At least four external projects use a delivered DevKit YAML LocalNet configuration or multi-synchronizer profile in their own development, application testing or CI, evidenced as defined below.

---

## Acceptance Criteria

The Tech & Ops Committee will assess each milestone against its listed deliverables and the criteria below. Each submission will include the relevant source-code version, documentation and reproducible evidence, such as test results, CI runs or a demonstration.

### Milestone 1

- A supplied YAML example successfully bootstraps a LocalNet with at least two validators, the SV-operated local synchronizer representing the Global Synchronizer and at least one additional dedicated synchronizer, using the declared connections.
- Configured parties, initial LocalNet balances, package uploads, vetting and supported initialization settings are applied and checked against observed state.
- Validation reports useful errors for an invalid configuration. The documented setup workflow can be reproduced.
- Compatibility checks pass for the agreed supported versions.

### Milestone 2

- A documented example reassigns a contract using the normal Ledger API unassign/assign workflow, distinguishes the pending-assignment state and confirms assignment on the target. The helper does not report completion before assignment is confirmed.
- A documented invalid reassignment attempt caused by missing stakeholder hosting on the target or missing package vetting produces a useful diagnostic.
- Topology views and synchronizer-aware command output reflect the demonstrated environment.
- A documented walkthrough bootstraps a clean user-provided Linux host over SSH and brings up a LocalNet on that host using the same YAML configuration; `status`/`check` against the remote instance matches observed state.
- With a remote Linux LocalNet running, the documented SSH tunnel makes the published JSON Ledger API (and other documented ports) reachable on localhost so a CLI helper or application client on the developer machine completes a sample call.
- The published GitHub Action runs the supplied application checks and produces readable results and machine-readable test output.
- A supported LocalNet snapshot is restored and used to run the example checks.

### Milestone 3

- LocalNet runs successfully with PQS Enabled & Disabled.
- Demonstrate the integrated DevKit workflow for remote registration, status, DAR management, dry-run and contract inspection on authorized DevNet and TestNet validators running supported versions.
- Provide the release, documentation, workshop or recorded walkthrough, case study and integration-support materials.
- At least four projects operated by teams independent of BitDynamics successfully use Devkit for their LocalNet configuration or multi-synchronizer profile in their own development, testing or CI workflow.
- For each project, a written confirmation from the external team identifying the capability used and task completed is sufficient evidence.

### Review and Scope

- Supported versions and test configurations will be documented and agreed with the Committee at the start of delivery. Additional version coverage or material scope changes require agreement on the corresponding schedule and funding.
- Review feedback should identify the unmet deliverable or acceptance criterion. A consolidated response is requested within 15 business days of each milestone submission.
- Defects that prevent the required workflows from functioning must be resolved before acceptance. Minor issues that do not prevent those workflows may be recorded with an agreed correction plan.
- Where external access, network availability or upstream dependencies block a required technical demonstration, BitDynamics will document the blocker and agree an alternative validation method or revised schedule with the Committee.
- Milestones 1 and 2 can be accepted independently of Milestone 3. If adoption evidence requires more time, an extension may be agreed; the Milestone 3 payment remains conditional on the adoption requirement.

---

## Funding

**Total Funding Request:** 4,800,000 CC

### Payment Breakdown by Milestone

| Milestone | Estimated Delivery | Share | Payment | Payment Trigger |
| --- | --- | --- | --- | --- |
| Milestone 1: Declarative LocalNet Support | Month 3 | 20% | 960,000 CC | Committee acceptance of Milestone 1 deliverables and criteria |
| Milestone 2: Multi-synchronizer Helpers and CI Pack | Month 5 | 25% | 1,200,000 CC | Committee acceptance of Milestone 2 deliverables and criteria |
| Milestone 3: DevNet/TestNet Helpers and Adoption | Month 6 | 55% | 2,640,000 CC | Committee acceptance of the final release, Milestone 3 technical deliverables and verified adoption by at least four external projects |
| **Total** | **6 months** | **100%** | **4,800,000 CC** | |

**55% of the total grant is tied to verified external adoption.** Completing the technical work or publishing onboarding materials alone does not trigger the Milestone 3 payment.

Payments for accepted Milestones 1 and 2 are not conditional on subsequent adoption or completion of Milestone 3. Any material expansion of the agreed scope requires written agreement on the associated funding and delivery schedule.

### Volatility Stipulation

The grant is denominated in a fixed total of 4,800,000 CC for the agreed scope and six-month delivery period. If an agreed extension beyond six months results from Committee-requested scope changes or documented delays outside BitDynamics's reasonable control, BitDynamics and the Committee will review the remaining milestone amounts in light of significant USD/CC price movements.

Any adjustment to funding, scope or schedule requires written agreement. Previously accepted milestones and their agreed payments will not be repriced, and an extension does not remove the adoption requirement for Milestone 3.

---

## Co-Marketing

Upon release, BitDynamics will collaborate with the Foundation on:

- Announcement coordination
- Case study or technical blog
- Developer or ecosystem promotion

---

## Rationale

Splice LocalNet provides an SV-operated local synchronizer representing the Global Synchronizer, with an optional additional private synchronizer enabled through the `multi-sync` profile. Customizing the topology beyond the supplied profiles requires changes to Docker Compose files, Canton HOCON configuration and bootstrap scripts. Canton already provides reassignment APIs and console commands; this proposal brings topology configuration, reassignment diagnostics and repeatable application tests into a consistent DevKit workflow.

We also observe a need for a declarative LocalNet/topology configuration file. The flags and parameters work in daily development workflow, but they are less efficient when you need a reproducible environment, such as in CI/CD pipeline.

LocalNet is resource-heavy for a developer laptop. Teams already use cheap Linux VPS hosts (for example Hetzner) to keep the stack on a remote machine and reach it over SSH. Folding host bootstrap, remote lifecycle management and localhost port forwarding into DevKit lets the same declarative YAML and helpers run either locally or on a user-provided VPS without a separate stack.

Finally, we anticipate that most team will benefits from a unified workflow across all environments. And to be able to re-use the same commands and helpers for DevNet and TestNet, just like in LocalNet, will make the transition between stages more seamless.

---

## Team Experience

BitDynamics is an Infra company building tooling across Canton ecosystem. Team has launched a non custodial wallet Sable and has onboarded multiple clients already.  Team also delivered 2 Dev fund projects and launched multiple ecosystem tools. Team is also contributing to the Splice code base actively.
