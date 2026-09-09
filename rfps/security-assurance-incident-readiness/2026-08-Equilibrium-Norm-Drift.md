# Canton Validator Reliability Suite: Norm + Drift

| Field | Value |
| :---- | :---- |
| Organization | Equilibrium ([equilibrium.co](https://equilibrium.co/)) |
| Author / Primary Contact | Olli Tiainen <olli@equilibrium.co> |
| Status | Published |
| Created | 2026-08-31 |
| Proposal Type | RFP-aligned |
| RFP / Roadmap Area | RFP #23: Validator and Shared Infrastructure Security and Resilience |
| Champion | Heslin Kim, Zenith ([@heslin-zenith](https://github.com/heslin-zenith)) |
| Total Funding Request | Up to 865,000 CC |
| Project Duration | ~5 months, then quarterly maintenance |
| Label | node-deployment-operations |

---

## Table of Contents

- [Abstract](#abstract)
- [Motivation](#motivation)
- [Specification](#specification)
  - [1. Objective](#1-objective)
  - [2. Implementation Mechanics](#2-implementation-mechanics)
  - [3. Architectural Alignment](#3-architectural-alignment)
  - [4. Backward Compatibility](#4-backward-compatibility)
- [Milestones and Deliverables](#milestones-and-deliverables)
- [Acceptance Criteria](#acceptance-criteria)
- [Funding](#funding)
- [Co-Marketing](#co-marketing)
- [Rationale](#rationale)
- [Why Equilibrium](#why-equilibrium)

## Abstract

Canton's ambition is to grow to 10,000 validators while making each one secure, resilient, and increasingly straightforward to operate. Much of the knowledge required already exists, but it is spread across deployment defaults, monitoring rules, documentation, source code, release guidance, and expert support rather than being directly verifiable by the operator running the node. As Canton scales, that knowledge needs to become executable: an operator should be able to determine whether a validator is configured appropriately for its network and release, performing its intended role, and capable of recovering from the failures it is expected to survive.

The **Canton Validator Reliability Suite** turns that knowledge into something an operator can run: one command, `canton-reliability`, that checks a running validator against explicit, versioned references and reports each departure with its consequence. It is read-only and safe to run against a production node. Its three modules cover configuration (Canton Norm + Canton Drift), runtime health (Canton Vitals) and recoverability (Canton Reentry), each proposed separately.

**This proposal delivers the configuration module, Canton Norm + Canton Drift.** Canton Norm states what a validator's configuration should be: thirteen items keyed by Splice release and deployment shape, most read straight out of the artifacts Splice ships, the rest documented or derived with the reasoning stated. Canton Drift reads a running node and reports, item by item, where its effective configuration has departed and what that departure costs. Where an input it needs is missing, the report says so instead of assuming a value.

The work is delivered as two Apache-2.0 artifacts, with support for both Kubernetes and Docker Compose deployments:

| Deliverable | What it is | An operator adopts it by |
| :--- | :--- | :--- |
| `canton-reliability drift` | A read-only check. One line per item: the observed value, the reference value, where the observation came from, and a verdict | Running it against a node |
| `norm.yaml` | Canton Norm itself: the module's thirteen items, declared so anyone can add one. Per item: what to observe, the reference value, the comparison, where the reference comes from, and what departing from it costs | Reading it, extending it, or consuming it in their own tooling |

Engineering is scoped at five months; adoption pays per qualified organisation until month 12, and quarterly maintenance follows. The base grant assigns 70 percent to engineering and 30 percent to adoption; the amounts are set under [Funding](#funding).

---

## Motivation

### Six of twelve forum failures were configuration

On 6 May 2026 a MainNet validator operator [reported a participant crash-looping](https://forum.canton.network/t/splice-validator-participant-1-keeps-restarting-during-reconnect-participants-on-mainnet-v0-5-18/8624) on an 8 vCPU, 16 GB host: CPU spiking to ~785%, RSS growing to ~4.3 GB, and the participant dying about six minutes after startup with no ERROR-level logs. The day before, [another operator](https://forum.canton.network/t/help-me-fix/8621) reported the same failure with the crash visible, and was told: "it will OOM again under the same conditions and no explicit heap flags are set."

The Helm charts Splice ships for the [validator](https://github.com/canton-network/splice/blob/main/cluster/helm/splice-validator/values-template.yaml) and the [participant](https://github.com/canton-network/splice/blob/main/cluster/helm/splice-participant/values-template.yaml) set exactly the heap options these deployments lacked, and so does the [Compose bundle](https://github.com/canton-network/splice/tree/main/cluster/compose/validator). Both deployments had departed from a configuration that already shipped in the artifacts they were deployed from.

We searched the Canton Network Forum across twenty operator-failure queries for topics since January 2025. Of 48 distinct topics, twelve are validator operational-failure reports. Six of those twelve are configuration failures: in each, the condition was present and readable on the node before the failure. Six reports, five incidents, because one operator reported theirs in two threads.

| Incident | The condition, readable beforehand | The `norm.yaml` item that covers it |
| :--- | :--- | :--- |
| [Participant crash-looping](https://forum.canton.network/t/splice-validator-participant-1-keeps-restarting-during-reconnect-participants-on-mainnet-v0-5-18/8624) on 8 vCPU / 16 GB, diagnosed as a JVM out-of-memory kill during initial ACS commitment reconciliation | No JVM heap flags in force, and container CPU uncapped | `participant.jvm.heap_options` |
| [The same failure the day before](https://forum.canton.network/t/help-me-fix/8621), with the crash visible: `Aborting due to java.lang.OutOfMemoryError: Java heap space` | The same | `participant.jvm.heap_options` |
| [`readyz` returning 503 indefinitely](https://forum.canton.network/t/mainnet-validator-boots-participant-is-healthy-but-api-validator-readyz-stays-at-503/8576) on a healthy participant whose bootstrap had completed | Connection breadth below the threshold the Foundation stated in reply: the "default configuration requires access to at least 2/3 of the SVs for both scan and sequencer connections to achieve BFT integrity" | `validator.scan_client.scan_type` |
| [Sequencer endpoints timing out](https://forum.canton.network/t/sequencer-endpoints-timing-out-during-devnet-validator-onboarding-gke/8562) during DevNet onboarding | Live connection configuration named migration id 0 while the network had moved to 1 | `validator.synchronizer.migration_id` |
| [Stuck in Vet Packages](https://forum.canton.network/t/validator-stuck-during-vet-packages-after-upgrade-from-0-5-10-to-0-6-7-mainnet-lsu/8824) after missing the 27 June MainNet LSU on 0.5.10, across two threads with no resolution recorded | Version behind a [dated, published obligation](https://forum.canton.network/t/update-mainnet-validators-to-version-0-6-5-or-later-before-the-june-27-2026-lsu-topology-freeze/8803) to be on 0.6.5 or later | `node.version` |

One of the six reached a confirmed public resolution. Three were answered without the reporter confirming, and two received only an explicitly unconfirmed diagnosis three to four weeks later.

Both answers are facts about a validator's correct configuration: the two-thirds-of-SVs rule, and the heap remedy. The people who answer forum threads know them. They are stated in each reply, and not in any artifact a node can be checked against. Canton Norm encodes those rules as checks that can be run before a failure occurs.

We searched for symptoms and procedures rather than for settings, so the forum probably holds more configuration failures than the six we found. And six threads say nothing about how many validators are misconfigured today. That number comes from the fleet measurement in Milestone 2.

### The reference is spread across existing artifacts

The reference is spread across the chart defaults, a shared profile library, a JSON schema, the Compose bundle and two documentation pages, with no page that joins them.

| What | Where | Reaches validator operators |
| :--- | :--- | :--- |
| JVM options, container requests and limits, `disableAuth: false`, `failOnAppVersionMismatch: true` | Validator and participant [chart defaults](https://github.com/canton-network/splice/blob/main/cluster/helm/splice-validator/values-template.yaml) | Defaults, if the operator does not override them |
| `runAsNonRoot`, `allowPrivilegeEscalation: false`, `capabilities: drop: [ALL]`, `seccompProfile: RuntimeDefault` | Shared [security-context profiles](https://github.com/canton-network/splice/blob/main/cluster/helm/splice-util-lib/security-profiles.yaml) | Defaults on the Helm path only |
| Shape validation: types, required keys, nine conditional rules | Chart [`values.schema.json`](https://github.com/canton-network/splice/blob/main/cluster/helm/splice-validator/values.schema.json) | An install-time error, for shape and never for policy |
| Memory and CPU limits, the same JVM options, one published port bound to localhost | [Compose bundle](https://github.com/canton-network/splice/tree/main/cluster/compose/validator) | Defaults, without the capability, privilege-escalation and seccomp settings above. Both paths run non-root, because the published images end on `USER nonroot` |
| Ingress requirement of none, egress on 443 to all SVs, hardware figures per activity level | [Networking](https://github.com/canton-network/splice/blob/main/docs/src/validator_operator/validator_networking.rst) and [hardware](https://github.com/canton-network/splice/blob/main/docs/src/validator_operator/validator_hardware_requirements.rst) documentation | Two guidance pages |

A comment in the chart values points to a related hardening opportunity: "add static guards so that new charts don't forget to add security contexts."

### Gaps between the reference and a running node

**Heap is sized from the container limit, and nothing checks that limit against the host.** Splice sizes heap as a percentage of the container limit rather than of real memory, so a limit the host cannot honour produces a heap the machine cannot back. The published guidance and shipped defaults use different capacity figures: the hardware requirements give 8 GB for a low-activity production validator, counting the validator and participant containers together, while the shipped defaults ask for 28 GB under Compose and 40 Gi under Helm.

**The existing memory checks leave both heap failure modes uncovered.** Canton ships a [startup memory check](https://github.com/canton-network/splice/blob/main/canton/community/common/src/main/scala/com/digitalasset/canton/environment/MemoryConfigChecker.scala) on the rule that a container should have "at least 2x the -Xmx value" available. Splice's [container image disables it](https://github.com/canton-network/splice/blob/main/cluster/images/common/parameters.conf), because Splice sets heap to 75% of container memory, where that rule can never pass at any host size. So heap too large for its container goes unreported for every operator. Heap too small, or absent entirely, is checked by nothing we found, and both crash loops came from that direction.

**Trust configuration is set in two mechanisms at once.** `synchronizer.connectionType` and `scanClient.scanType` each take `trust-single`, `bft` or `bft-custom` in the [chart schema](https://github.com/canton-network/splice/blob/main/cluster/helm/splice-validator/values.schema.json). On `trust-single` the validator depends on one Super Validator, and on `bft` that dependence is spread across a quorum. The [chart template](https://github.com/canton-network/splice/blob/main/cluster/helm/splice-validator/templates/validator.yaml) still honours the older booleans `nonSvValidatorTrustSingleScan` and `useSequencerConnectionsFromScan` alongside them, resolved by branch precedence, so an operator cannot read their own trust configuration off their own values file.

The example values file warned at 0.5.10 that "you depend on that single SV and if it is broken or malicious you will be unable to use the network". By 0.7.3 the warning is gone and the capability remains.

### Every validator operator benefits

As of March 2026, roughly 980 validators were mapped by community tooling; onboarding caps are rising toward 3,000 through September 2026, against a 2028 target of 10,000 validator nodes.

The same software runs with two different container security postures. Docker Compose is [documented as not recommended for production MainNet](https://docs.canton.network/global-synchronizer/deployment/deployment-options), operators run it anyway, and it drops no capabilities, disables no privilege escalation and sets no seccomp profile. Both shapes are in scope here, at reporting parity. Items are per-node, so one Node-as-a-Service provider adopting the check covers every validator in its fleet.

---

## Specification

### 1. Objective

**A Canton validator operator can see how their running node's effective configuration differs from a stated reference configuration, and which of those differences has a known consequence.**

### 2. Implementation Mechanics

**`canton-reliability drift`.** Reports, item by item, how a running node's effective configuration differs from the reference for its Splice release and deployment shape, and what each difference costs. It resolves the reference, makes the observation, applies the comparison, and prints one line per item. It reads the running deployment rather than a values file. It writes nothing, which is what makes it safe to point at a production validator on the first try.

**`norm.yaml`.** Thirteen items, keyed by Splice release and by deployment shape. An item enters only where departing from it has a consequence traceable to a source. Two of the thirteen, as declared:

```yaml
# `reference` resolves per Splice release and per deployment shape. `provenance`
# says where the reference comes from: shipped in the deployment artifacts,
# documented on a guidance page, or derived by us with the reasoning stated.

- item: participant.jvm.heap_options
  class: availability
  shape: [helm, compose]
  observe: process_args(participant)
  reference: ["-XX:+UseG1GC", "-XX:MaxRAMPercentage=75", "-XX:InitialRAMPercentage=75", "-XX:+HeapDumpOnOutOfMemoryError"]
  compare: contains_all
  provenance: shipped        # splice-participant chart defaults for the release
  consequence: >
    With no options in force the JVM falls back to its own default heap ceiling,
    which was insufficient for initial ACS commitment reconciliation and
    crash-looped the participant twice, one of them on MainNet.

- item: validator.scan_client.scan_type
  class: security
  shape: [helm, compose]
  observe: effective_config(validator, "scanClient.scanType")
  reference: bft
  compare: equals
  provenance: derived        # the Foundation's stated rule, quoted in Motivation
  consequence: >
    trust-single, or bft-custom below the BFT threshold, makes the node depend on
    one Super Validator for both liveness and integrity. BFT integrity requires
    access to at least two thirds of the SVs, for scan and sequencer connections
    alike.
```

Every field except `consequence` is machine-evaluable, so `norm.yaml` is a catalogue `canton-reliability drift` consumes rather than a checklist a person walks. An item whose reference the node cannot carry declares the input it needs and `on_unknown_input: not_determined`, which is how `node.version` reaches the report as `not determined` rather than as a guess.

| Item | Class | Reference | A departure means |
| :--- | :--- | :--- | :--- |
| `participant.jvm.heap_options` | availability | Chart and Compose defaults for the installed release | An OOM kill during initial ACS commitment reconciliation |
| `participant.container.memory_limit` | availability | Canton's rule: twice `-Xmx` available | A heap sized above what the container can back |
| `deployment.limits_within_host_capacity` | availability | The host's real capacity | A heap the host cannot back, whatever the container limit declares |
| `validator.synchronizer.connection_type` | **security** | `bft` | Dependence on one Super Validator for liveness and integrity |
| `validator.scan_client.scan_type` | **security** | `bft` | The same, on the scan side, whether set through `scanType` or the legacy `nonSvValidatorTrustSingleScan` |
| `validator.auth.enabled` | **security** | `disableAuth: false` | An unauthenticated ledger and admin API. A `compose-disable-auth.yaml` override ships in the bundle |
| `deployment.declared_exposure` | **security** | The documented ingress requirement, which is none | A declared admin surface, where the documentation states that no ingress is required |
| `deployment.container_security_context` | **security** | Capabilities dropped, privilege escalation disabled, seccomp profile set | The same software runs with a weaker posture on one of its two documented paths |
| `node.version` | availability | A supplied schedule of dated obligations | Missing a required upgrade before an LSU leaves the node unable to complete initialization; the forum threads show that lasting weeks |
| `images.digests_pinned` | **security** | The release's published digests | The version string is a label nothing ties to an artifact, and components split across releases are invisible. Helm supports pinning and ships it unset; Compose has no mechanism |
| `validator.synchronizer.migration_id` | availability | The migration id [`DsoRules`](https://github.com/canton-network/splice/blob/main/daml/splice-dso-governance/daml/Splice/DSO/DecentralizedSynchronizer.daml) currently publishes | Querying a retired migration, which presents as sequencer endpoints timing out |
| `participant.pruning.schedule` | availability | A configured schedule | Unbounded participant database growth |
| `deployment.credentials_changed` | **security** | Anything other than the Compose `.env` default | A known database credential |

Seven of the thirteen are security-class.

**Each item gets one line in the report.** Each line carries the observed value, the reference it was compared against, where the observation came from, and one of three verdicts:

| Verdict | When |
| :--- | :--- |
| `matches` | The observed value satisfies `compare` against `reference`. |
| `departs` | It does not. The `consequence` is printed alongside. |
| `not determined` | A required input is absent, or the surface does not carry the value. The report names which. |

```
$ canton-reliability drift --release 0.7.3 --shape compose

item                                    observed      reference          from              verdict
participant.jvm.heap_options            none          4 options          process_args      departs: JVM falls back to its default heap ceiling
deployment.limits_within_host_capacity  28g declared  host 16g           supplied          departs: heap is sized from a limit the host cannot back
validator.synchronizer.connection_type  bft           bft                effective_config  matches
validator.scan_client.scan_type         trust-single  bft                effective_config  departs: one SV for liveness and integrity
node.version                            0.7.3         not supplied       image tag         not determined: no required-version schedule supplied
images.digests_pinned                   by tag        published digests  image ids         departs: no digest mechanism on this path
```

The report follows two rules:

- **Never report an item as `matches` on the strength of a value it had to assume.** Where the required-version schedule is unavailable, `node.version` reads `not determined`, and the installed version is still reported, since the image tag carries it.
- **Never produce a composite score, or a pass/fail for the node.** A single figure lets a node read as broadly healthy while it depends on one Super Validator for scan. The report separates the seven security-class items instead of totalling them.
We will submit the following changes upstream. None is a precondition for delivery: if all are declined, `norm.yaml` still ships and the check still works.

- **Re-parameterise Canton's startup memory check** against the heap fraction the deployment actually uses, so it can be armed rather than ignored. That closes the heap-too-large direction for every operator, funded or not. It would not have caught either crash loop, where no heap flags were in force and Canton's rule was satisfied.
- **Add policy constraints to the chart schema.** It validates shape but not policy: require container resources whenever the JVM options set a RAM percentage, and give `imageDigests` a real per-component shape instead of the untyped object it carries. It reaches Helm at install time only, never a Compose deployment or a running node.
- **Resolve two documentation contradictions.** The hardware-requirements table contradicts the shipped defaults. Our reading is that the table has fallen behind, and we will confirm that with the maintainers before submitting. The trust guidance present at 0.5.10 is absent by 0.7.3, and we propose restoring it.

Two missing ecosystem inputs affect what the check can verify. One is a machine-readable statement of which version the network requires, by date. None exists today: the long-term schedule is a Google Doc per network, while dated obligations arrive as forum announcements. `node.version` therefore compares the installed version against a schedule the operator supplies, and reads `not determined` when they have none. Each such result also provides evidence for publishing the schedule in machine-readable form.

The other is signed build provenance. Every [image in the 0.7.3 release](https://github.com/orgs/digital-asset/packages?repo_name=decentralized-canton-sync) already carries a provenance statement, and it cannot currently be verified because the statement is unsigned and names no builder. `canton-reliability drift` therefore compares image digests instead. That establishes that the running artifact matches the published one, but not that the published artifact itself is trustworthy.

#### Data and privacy

`canton-reliability drift` needs privileged access to the deployment. Its limits:

| Concern | How `canton-reliability drift` handles it |
| :--- | :--- |
| What it reads | A Kubernetes context or the Docker socket, for resolved configuration, process arguments and cgroup limits. The participant and validator admin APIs. The registry, for the digests published for the installed release |
| What the operator supplies | The host's real capacity, which a cgroup limit does not carry. The required-version schedule, where they have one. Their deployment inputs, where they want the credentials item checked |
| What it writes | Nothing. It mutates nothing on the node and never rewrites an operator's configuration |
| Egress | The registry read is anonymous and egress-only, which suits a deployment whose documented ingress requirement is none and which already requires egress on 443 to every SV. Where an environment forbids it, the published digests are supplied as an input and the item is reported as declared |
| Credentials | Never extracted from a running node, never tested against a live service. Canton's own dump excludes them (*"we do not want to serialize the password to JSON, e.g., as part of a config dump"*) and the same discipline applies. The credentials item runs only against deployment inputs the operator points `canton-reliability drift` at, and reads `not determined` otherwise |
| Reachability | Declared exposure is read from the deployment: Kubernetes `Service` and `Ingress` objects, or Compose port publications and their bind addresses. Reachability from outside the network is not tested, and the report says so rather than reporting the weaker check as the stronger one |
| What leaves the node | Nothing. The aggregate figures in the milestones come only from operators who choose to send us a result |
| What the fleet figures need | A result-sharing format and an anonymisation rule, delivered under Milestone 0. Operators choosing to share results is measured under Milestone 4 |

### 3. Architectural alignment

Everything runs against existing interfaces. Licensed Apache-2.0, matching Splice, with all upstream contributions going to `canton-network/splice` through its own review process. `canton-reliability drift` remains outside the operator's critical path and never rewrites configuration.

The module uses and extends existing Canton and Splice components where possible:

- **Canton's `MemoryConfigChecker`** is re-parameterised rather than reimplemented, so no second too-large-heap check exists alongside a disabled upstream one
- **The chart schema** is extended rather than duplicated, and its `imageDigests` map is populated rather than replaced
- **`health.dump()`** is consumed where it fits, and its secret-redaction discipline is adopted rather than worked around
- **The validator and participant admin APIs, and `DsoRules` through Scan**, are consumed as they are

**Canton Drift is designed to work alongside existing infrastructure and security tooling:**

| Existing work | What it covers | What `canton-reliability drift` adds |
| :--- | :--- | :--- |
| [kube-bench](https://github.com/aquasecurity/kube-bench), [Docker Bench for Security](https://github.com/docker/docker-bench-security), [Trivy](https://github.com/aquasecurity/trivy), [Polaris](https://github.com/FairwindsOps/polaris) | Generic cluster and container posture, which we do not intend to rebuild | The Canton layer: heap sized against ACS commitment reconciliation, a migration id matching what `DsoRules` publishes, a release name mapping to specific image digests. A pod spec does not mark `scanClient.scanType` as a security setting |
| Digital Asset's Scalability, Performance and Robustness grant | CILR, a continuous 16-synchronizer / 600-validator environment testing every release for regressions | The configuration of one operator's production node, which a test environment does not observe |
| Digital Asset's proposed security-review grant, Q1 2027 | A review and hardening of the Kubernetes validator deployment tooling | Whether a running node still conforms to it. Whatever the review changes in the charts becomes the reference `norm.yaml` reads for that release |

**The Canton Validator Reliability Suite has three modules**, each proposed separately:

| Module | Checks | Proposed under |
| :--- | :--- | :--- |
| **Canton Norm + Canton Drift** (this proposal) | configuration | RFP #23 |
| Canton Vitals | runtime health | RFP #27 |
| Canton Reentry | recoverability | RFP #23 |

All three modules share a common frame:

- **The runner**, which evaluates a check catalogue against a node
- **The report format**, with `not determined` as the verdict every module shares
- **The provenance label** on every reference value
- **The result-sharing format and anonymisation rule**
- **The contribution guide**

The common frame ships with whichever module the Foundation funds first, as that proposal's Milestone 0.

The modules cover different aspects of validator reliability. Canton Drift asks whether the node's configuration matches the reference Splice ships, and Canton Vitals asks what its metrics say right now. Canton Drift and Canton Reentry both read two of the same values off the node: the participant's pruning schedule and the migration id. Drift asks whether they match the reference; Reentry asks whether the backups fit inside them. That is the whole overlap between the two modules.

Anyone in the ecosystem can add a check to the Suite. Most checks can be added as a YAML entry: what to read, when the condition holds, and what happens when it does not. Checks that need code land as modules through the same repository.

Once 5 contributors from outside Equilibrium have landed checks, or 50 operators are running it, the repository moves to a neutral ecosystem home, such as the Node Deployment & Operations SIG or the `canton-network` organisation. Equilibrium stays on as the named maintainer.


### 4. Backward Compatibility

*The proposal has no backward compatibility impact.* `canton-reliability drift` is an external, read-only consumer of the deployment and of existing APIs, and `norm.yaml` is a new artifact. The proposed change to Canton's startup memory check alters only whether a warning is logged, remains configurable through the existing reporting-level setting, and lands through Splice's own review.

---

## Milestones and Deliverables

### Milestone 0: The Suite frame

- **Estimated Delivery:** ~1 month from grant start. Closed at approval where a Suite module has already shipped
- **Focus:** The `canton-reliability` command and the parts every module shares: the runner, the report format with `not determined` as its third verdict, the provenance label, the result-sharing format and anonymisation rule, and the contribution guide. Scheduled operation lands in Milestone 2 and fleet mode in Milestone 3.
- **Deliverables / Value Metrics:**
  - `canton-reliability` published Apache-2.0, with the contribution guide: how a check is added as a YAML entry, and how a check that needs code is added as a module
  - The result-sharing format and anonymisation rule published

### Milestone 1: The configuration module shipped, covering the field failures

- **Estimated Delivery:** ~2 months from grant start
- **Focus:** `norm.yaml` for the current Splice release, and `canton-reliability drift` shipped Apache-2.0. Seven items: the three resourcing items, the two trust types, the migration id and the required-version check. Between them they cover every configuration incident in the forum sweep above.
- **Deliverables / Value Metrics:**
  - `canton-reliability drift` published Apache-2.0, reporting the three resourcing items, both trust types, the migration id and version currency, at reporting parity on Kubernetes and Docker Compose
  - `norm.yaml` published for the current Splice release, with each item's reference traced to the artifact it was read from

### Milestone 2: Full item coverage and the upstream contributions

- **Estimated Delivery:** ~4 months from grant start
- **Focus:** The remaining six items: authentication, declared exposure, container security posture, running image digests, pruning schedule and default credentials. The three upstream contributions submitted. Scheduled operation, so the check runs on an interval rather than once.
- **Deliverables / Value Metrics:**
  - `canton-reliability drift` published Apache-2.0, reporting the three resourcing items, both trust types, the migration id and the required-version check, at reporting parity on Kubernetes and Docker Compose
  - Scheduled operation shipped: `canton-reliability drift` runs on an interval, with `systemd` timer and Kubernetes `CronJob` examples
  - The three upstream contributions merged, or a documented maintainer decision against each: Canton's startup memory check re-parameterised, the schema policy constraints, and the two documentation corrections

### Milestone 3: Canton Norm tracks releases, and handover

- **Estimated Delivery:** ~5 months from grant start
- **Focus:** `norm.yaml` republished for every Splice release, so departures are visible in both directions: a node moving away from the reference, and the reference moving under a node that has not changed. Fleet mode shipped. Establishing who maintains the module after the grant.
- **Deliverables / Value Metrics:**
  - `norm.yaml` published for each Splice release within 14 days of it shipping, with changed items and that release's published image digests called out
  - Fleet mode shipped: the same report over many nodes, rolled up per item
  - Integration path documented for at least one node-management platform
  - A published maintenance plan naming Equilibrium as maintainer-of-record, the release process, and the conditions under which the repository moves to a neutral ecosystem home

### Milestone 4: Adoption

- **Opens:** on Milestone 3 acceptance. **Deadline:** 12 months from grant approval.
- **Focus:** Verified adoption of Canton Norm + Canton Drift by the operators and organisations it is built for, per the table below. This milestone carries 30 percent of the base grant. Partial adoption earns partial payment.
- **Payment structure:** the adoption pool is 20 percent of the base: 10 percent for the first Super Validator running Canton Drift, and 2.5 percent per further qualified organisation for up to four organisations. The completion tranche is 10 percent of the base. It is payable only after at least one pool organisation qualifies and every bundled completion criterion is met.
- **Deliverables and tranches:**

| Deliverable | Acceptance criteria | Tranche payout |
| :--- | :--- | :--- |
| Super Validator adoption | One Super Validator running `canton-reliability drift` on its own nodes. Evidence: a public statement by the Super Validator, or its attestation to the Foundation, naming the Splice release checked | 10% of base |
| Organisation adoption | Each further qualified organisation: a Node-as-a-Service provider running it across the validators it operates, or a consumer of `norm.yaml` other than `canton-reliability drift` itself (a node-management platform, a provider's internal tooling, or Splice itself). Evidence: for an open-source consumer, the public code consuming `norm.yaml`; otherwise the organisation's public statement or attestation to the Foundation, naming what it runs and across how many validators | 2.5% of base per organisation, up to 10% of base |
| Milestone completion | All of: `canton-reliability drift` in use by 10 distinct validator operators across both deployment shapes; 5 of those running it on a schedule rather than ad hoc; 3 operators having supplied the required-version schedule after a `not determined` report; a published count of departures found and corrected out of the shared results it is drawn from, with at least 3 corrected, 2 of them on heap options; 3 Compose-based operators having brought container posture to parity with the Helm reference; 10 operators choosing to share a result, with the published figure for the share departing on at least one item and the share running below the BFT threshold for scan or sequencer connections; and 2 checks contributed from outside Equilibrium, merged. Evidence: operator attestations to the Foundation for usage, scheduled runs and corrections; the shared results themselves for the published figures; the merged pull requests for the contributed checks | 10% of base |
| **Milestone 4 maximum** | | **244,000 CC** (30% of the base) |

- **Verification:** attestations go to the Foundation directly rather than through Equilibrium, and shared results identify a node only as far as the Milestone 0 anonymisation rule allows.

### Maintenance: the module tracks Splice, quarter on quarter

- **Estimated Delivery:** Quarterly, from the quarter after Milestone 3, for 4 quarters
- **Focus:** `norm.yaml` kept current for every Splice release, contributed checks reviewed, and the Suite frame kept working. Equilibrium is maintainer-of-record, scoped so that the core contributors or the SIG could pick it up at this level of funding if Equilibrium stopped: most checks are a YAML entry, and the repository is bound for a neutral home.
- **Deliverables / Value Metrics:**
  - `norm.yaml` current for every Splice release shipped in the quarter, within 14 days of each
  - Every contributed check reviewed, and merged or declined with a stated reason
  - The Suite frame working against the current Splice release

---

## Acceptance Criteria

Each milestone is accepted against the capabilities and acceptance checks stated under that milestone, with the published artifacts providing the evidence.

- **Milestones 0 through 3:** the named artifacts are published and accepted by the committee.
- **Milestone 4:** the Foundation receives the evidence named in the adoption table. Pool payments pay per qualified organisation; the completion tranche also requires at least one qualified organisation and every bundled criterion. Partial adoption earns partial payment.
- **Maintenance:** each quarter's deliverables are published as specified.

Every release must satisfy the following conditions:

- **No item is ever reported `matches` on the strength of a value `canton-reliability drift` had to assume.** Where a required input is absent, every release reports `not determined` and names the reason.
- **`canton-reliability drift` never mutates node state or rewrites an operator's configuration.** It reads the running deployment and writes nothing.

Upstream outcomes do not gate payment beyond their stated form: the three upstream contributions count as delivered when merged, or when a documented maintainer decision goes against each.

---

## Funding

**Total Funding Request:** Up to 865,000 CC. The base assigns 70 percent to engineering across Milestones 1–3 and 30 percent to adoption in Milestone 4. Maintenance is priced separately.

### Payment Breakdown by Milestone

- Milestone 0 (The Suite frame): 0 CC.
- Milestone 1 (The configuration module shipped, covering the field failures): **280,000 CC** upon committee acceptance (~32% of the base)
- Milestone 2 (Full item coverage and the upstream contributions): **225,000 CC** upon committee acceptance (~26% of the base)
- Milestone 3 (Canton Norm tracks releases, and handover): **100,000 CC** upon final release and acceptance (~12% of the base)
- Milestone 4 (Adoption): up to **260,000 CC** (30% of the base), paid as a per-organisation adoption pool (20%) plus a completion tranche (10%), per the Milestone 4 table
- Maintenance (the module tracks Splice, quarter on quarter): **57,000 CC** per quarter, for 4 quarters, upon quarterly acceptance

### Volatility Stipulation

Engineering is scoped at five months; the adoption milestone opens at Milestone 3 acceptance and pays per qualified organisation until its 12-month deadline. Should the engineering timeline extend beyond six months due to Committee-requested scope changes, any remaining milestones will be renegotiated to account for USD/CC price volatility. The maintenance milestone runs beyond six months: its quarterly amount is denominated in Canton Coin against the CC/USD reference price stated at approval, and is re-evaluated at each quarterly acceptance.

---

## Co-Marketing

Upon release, Equilibrium will collaborate with the Foundation on:

- Announcement coordination, timed to a Splice release so `norm.yaml` lands with a version it describes
- Publication of `norm.yaml`
- A technical write-up of the fleet measurement, from the operators who share a result: how far deployed validators sit from the configuration Splice ships. We found no published equivalent
- An operator walkthrough aimed at new validator operators during onboarding, where the cost of getting these settings wrong is highest
- Publication of the account of the startup memory check, since the reason it is currently disabled is discoverable only by reading the image configuration

---

## Rationale

Canton Drift reads the running deployment instead of the files used to deploy the node. Those files do not always describe the configuration that is in force. Helm combines chart defaults with operator values, Compose applies override files, and environment variables can change the result again. In the forum crash loops, the important fact was that no heap flags were active on the running participant. Documentation, or a check on the values file, would not have shown that. Canton's `health.dump()` does not include the JVM arguments or the container limits, so it cannot answer the resourcing items either.

The reference value for each of the thirteen items lives in `norm.yaml` rather than inside the checker, so the reference is not tied to one implementation. Most of those values are currently spread across chart defaults, shared security profiles, the Compose bundle and two documentation pages. Collecting them in one file gives Canton Drift a single reference to compare against, and other tooling can read the same file. The file is keyed by Splice release, so the reference can change with each release without changing the checker.

Each of the thirteen reference values comes from an artifact shipped by Splice. We do not derive or infer them. When Splice releases a new version, we update the reference by reading those artifacts again for that release.

Canton Drift also avoids duplicating checks Canton already performs. The startup memory check is the exception: Canton includes the check, but Splice disables it in its container image because the heap is set to 75 percent of container memory, which means the check can never pass. As a result, the condition that check is meant to catch goes unreported on every node. Canton Drift checks it for that reason.

Canton Drift sits outside Splice and changes nothing on the node it checks. When we find an improvement that belongs in an existing Splice component, we submit it upstream as a separate contribution. Delivery does not depend on those contributions being accepted. Generic infrastructure scanners still cover cluster and container posture. Canton Drift covers the Canton-specific settings those tools do not interpret.

## Why Equilibrium

Equilibrium builds, secures, and funds verifiable systems for finance and AI. We're a global team of 30 engineers, cryptographers and economists ([company team page](https://equilibrium.co/who-we-are)). 

Relevant previous work includes:

- **Canton and Daml engineering.** We are building a proof-of-concept SVM execution layer on Canton for Zenith, mapping Solana's account and runtime model onto Canton. We also maintain [awesome-daml](https://github.com/equilibriumco/awesome-daml/), an openly licensed guide to Daml and the Canton developer ecosystem.

- **Node specification and protocol testing.** With Ziggurat, our P2P network-testing framework, we've reverse-engineered network layer's of Solana, Zcash [(write-up)](https://forum.zcashcommunity.com/t/ziggurat-3-0/43350/46), XRP [(blog)](https://xrpl.org/blog/2022/ziggurat) and Algorand into a published specification (e.g. [Solana's spec](https://github.com/solana-foundation/specs/blob/main/gossip/gossip-protocol-spec.md)) and automated test catalogue.

- **Production node engineering and operation.** We've built and continue to maintain [Pathfinder](https://github.com/eqlabs/pathfinder), the open-source Rust full node for Starknet. We are long-standing contributors to [snarkOS](https://github.com/ProvableHQ/snarkOS), Aleo's P2P node software and consensus, and [snarkVM](https://github.com/ProvableHQ/snarkVM), its zkVM, alongside Aleo's core engineering team. We also operate our own Aleo validator, with publicly verifiable uptime ([explorer](https://aleoscan.io/address?a=aleo1cxk6pkrucemg7fmxhhrxymus9vnr00mtmgzvx95nkcwpdj5qhsrswgdgfr)). Other node infrastructure work includes [Lumina](https://github.com/celestiaorg/lumina), the Rust Celestia light node, [Strawberry](https://github.com/eigerco/strawberry), a full Go implementation of the Polkadot JAM protocol, [zkSync state reconstruction](https://github.com/equilibriumco/zksync-state-reconstruct) tooling, which rebuilds zkSync Era state from Ethereum L1 data and verifies it against on-chain commitments.

- **Regulated finance engineering.** We incubated and provided engineering for Membrane Finance, acquired by Paxos in 2025, the company behind [EUROe](https://euroe.com), the first EU-regulated euro stablecoin.
