# Canton Validator Reliability Suite: Vitals

| Field | Value |
| :---- | :---- |
| Organization | Equilibrium ([equilibrium.co](https://equilibrium.co/)) |
| Author / Primary Contact | Olli Tiainen <olli@equilibrium.co> |
| Status | Published |
| Created | 2026-08-31 |
| Proposal Type | RFP-aligned |
| RFP / Roadmap Area | RFP #27: Security Monitoring, Auditability and Evidence |
| Champion | Heslin Kim, Zenith ([@heslin-zenith](https://github.com/heslin-zenith)) |
| Total Funding Request | Up to 700,000 CC |
| Project Duration | ~3 months engineering, adoption window to month 12, quarterly maintenance |
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

Canton's ambition is to grow to 10,000 validators while making each one secure, resilient, and increasingly straightforward to operate. Much of the knowledge required already exists, but it is spread across deployment defaults, monitoring rules, documentation, source code and expert support rather than being verifiable by the operator running the node.

The **Canton Validator Reliability Suite** turns that knowledge into something an operator can run: one command, `canton-reliability`, that checks a running validator against explicit, versioned references and reports each departure with its consequence. It is read-only and safe to run against a production node. Its three modules cover configuration (Canton Norm + Canton Drift), runtime health (Canton Vitals) and recoverability (Canton Reentry), each proposed separately.

**This proposal delivers the runtime health module, Canton Vitals.** It checks the ten metrics a validator depends on against a healthy range, and for each value outside its range it states what breaks and whether that is a security problem or a performance one. The ranges are the ones Digital Asset already operates its own clusters against. Today they sit in Digital Asset's internal deployment configuration, where operators never see them; Canton Vitals publishes them and keeps them current for every Splice release. Each metric also declares which labels it carries, because some Splice metrics embed a party identifier and are not safe to export off the node.

The work is delivered as three Apache-2.0 artifacts

| Deliverable | What it is | An operator adopts it by |
| :--- | :--- | :--- |
| `canton-reliability vitals` | A read-only check. One line per metric: observed value, healthy range, verdict | Running it against a node |
| `vitals.yaml` | The catalogue behind both. Per metric: the query, the healthy range, what breaks when the value leaves it, where the number came from, and which labels it carries. Anyone can add a metric | Reading it, extending it, or consuming it in their own tooling |
| `vitals-alerts.yaml` | The `vitals.yaml` ranges as ready-to-import Grafana alert rules | Importing one file |

Engineering is scoped at three months, adoption pays per qualified adopter until month 12, and quarterly maintenance follows. The base grant assigns ~70 percent to engineering and ~30 percent to adoption; the amounts are set under [Funding](#funding).

---

## Motivation

### Healthy ranges are not published with the dashboards

An operator who imports the Grafana dashboards Digital Asset ships can watch a metric called sequencer client delay climb to 140 seconds with nothing to compare it against. By Digital Asset's own standards that node is in trouble: their alert for this metric fires at 90 seconds. The operator never sees that alert, because the rules behind it are not part of any release.

The [observability documentation](https://docs.sync.global/deployment/observability/index.html) explains how to expose metrics and how to import dashboards. Across the whole metrics surface it states an expected value for exactly one of them: ingestion lag, for a validator collecting liveness rewards, *"should expect your lag to never go above 20min."* Every other graph an operator sees is a number with no stated meaning.

### The values already exist in deployment configuration

DA's repository holds 54 alert rules over roughly thirty thresholds, many with the reasoning attached ("Usually every 30min, we allow up to 1h to avoid false positives"). These are the values DA uses in its own clusters. They live in deployment configuration, where they are assembled into alert rules alongside Super Validator consensus rules, load-test rates and cloud quotas rather than packaged as part of the validator release. A working alert needs three parts: a query (what to measure and how to compare it), a threshold (the number that separates healthy from not), and a consequence (what happens when the number is crossed). All three already exist, but they are distributed across different artifacts:

| What | Where | Reaches validator operators |
| :--- | :--- | :--- |
| The queries and comparisons (PromQL) | [`grafana-alerting/`](https://github.com/canton-network/splice/tree/main/cluster/pulumi/observability/grafana-alerting), 54 rules across 26 files | No. Not staged into the release bundle |
| The threshold values, with the reasoning as comments | [`configs/shared/base.yaml`](https://github.com/canton-network/splice/blob/main/cluster/configs/shared/base.yaml) | No. Deployment configuration for Digital Asset's own clusters |
| The consequences: what breaks when a threshold is crossed | [`NETWORK_HEALTH.md`](https://github.com/canton-network/splice/blob/main/network-health/NETWORK_HEALTH.md), a 360-line operations runbook | Only in the Super Validator bundle (`sv-grafana-dashboards/docs`), not to validator operators |

`NETWORK_HEALTH.md` describes six layers of quorums, and two of those layers are about validators. In plain terms: a validator holds connections to several sequencers and needs a minimum number of them working (the runbook calls this quorum "f+1") to keep processing transactions, and it needs the same kind of quorum among the Scan services it reads network data from. In the runbook's own words:

- *"for each validator f+1 need to work for its participant to advance"*
- *"Scan (f+1 need to work for each validator to be able to read data through explicit disclosure and perform amulet operations)"*

Either quorum can degrade quietly. An operator whose node has slipped below the minimum still believes they are protected, and no dashboard says otherwise. The runbook also ties thresholds to mechanisms: acknowledgement lag over a minute *"will mean that this participant is unable to confirm transactions because it sees the confirmation only after the configured `confirmationResponseTimeout`."*

The query, threshold and consequence are currently split across separate artifacts. `vitals.yaml` publishes them together.

### The existing dashboard manifest

[`validator-dashboards.yaml`](https://github.com/canton-network/splice/blob/main/cluster/pulumi/observability/grafana-dashboards/validator-dashboards.yaml) is an explicit manifest ("Dashboards included in the validator-grafana-dashboards bundle") listing 18 include globs, six of which map one-to-one onto validator-relevant alert families: participant pruning, sequencer client, sequencer connection pool, validator scan connections, automations, and JVM.

The release bundle already uses this pattern for dashboards. We propose the same packaging pattern for alert rules, so validator operators can import the existing rules directly. Canton Vitals adds the information the manifest itself does not carry: what each breach means for the operator, whether it is security-relevant, where each value came from, and which labels each metric carries.

### Operator and ecosystem applicability

As of March 2026, roughly 980 validators were mapped by community tooling. Onboarding caps are rising toward 3,000 through September 2026, and the 2028 target is 10,000 validator nodes.

They benefit whether or not they ever run `canton-reliability vitals`. An operator running Prometheus and Grafana gets working alerts by importing one file. The thresholds should therefore see wider adoption than the check itself.

The outputs are also useful beyond individual validator operators. Node-as-a-Service providers can use one shared definition of healthy across their fleet, while monitoring tools can consume the published ranges directly rather than maintaining a separate set of thresholds.

The initial catalogue contains ten metrics, and external contributors can add more as plain YAML entries through pull requests without changing the runner.

---

## Specification

### 1. Objective

**An operator can tell whether their validator is healthy, in numbers, and whether each problem found is a security problem or a performance one.**

The existing operational values provide inputs, but not a validator-health specification. This proposal selects and validates the metric set, defines the healthy ranges and consequences, classifies the security-relevant cases, confirms metric and label behaviour against running nodes, renders the catalogue into executable checks and rules, and maintains it across releases.

### 2. Implementation Mechanics

**`canton-reliability vitals`.** Prints one line per metric: the observed value, the healthy range, the verdict, and the consequence when the value is outside that healthy range. Output is JSON plus a terminal table. It reads metrics in one of two ways: directly from the node's own `/metrics` endpoints on port 10013, or from the operator's Prometheus. A direct read sees only the present moment, and some checks are defined over a time window (queries using `delta` or `histogram_quantile`); the automation failure rate, for example, is measured over ten minutes. In direct mode those checks report `not determined` rather than a guess. Against Prometheus, which stores the history, every check is evaluated in full. The tool writes nothing to the node and needs no credentials, admin API or deployment access.

**`vitals-alerts.yaml`.** The same thresholds as importable Grafana alert rules, because Prometheus and Grafana are what the ecosystem and Digital Asset's own tooling already run. Rules built on `histogram_quantile` or `histogram_avg` need a Prometheus feature (native histograms, the `-enable-feature=native-histograms` flag) that is off by default. This is why the shipped dashboards' histogram panels sit empty on a default Prometheus. Each rule states its prerequisite, and where a rule can be written against classic histograms instead, it is.

**`vitals.yaml`.** Ten metrics, keyed by Splice release. A metric makes the list only if leaving its healthy range has a consequence we can trace to a source. Each entry in the file is one metric's complete definition: the query to run, the healthy range, how long the value must stay outside that range before it counts, the consequence when it does, where the value came from, and which labels the metric carries. Two examples are shown below: a security-class check for sequencer reachability, and the reward-collection automation metric, whose label set includes a `party` identifier.

```yaml
# A party identifier under `labels` means the metric is not safe to export
# beyond the operator's own boundary.

- metric: daml_sequencer_client_sequencer_connection_pool_connection_health
  class: security
  query: max by (connection, namespace, job) (daml_sequencer_client_sequencer_connection_pool_connection_health)
  reduce: last
  healthy_when: { op: ">=", value: 2 }
  for: 1m
  provenance: operational      # Digital Asset runs this; not published as guidance
  labels: [connection, namespace, job]
  consequence: >
    A degraded connection shrinks the set of sequencers the node can actually
    reach, and a validator needs f+1 working for its participant to advance.

- metric: splice_trigger_completed_total
  class: operational
  query: >
    100 * sum by (namespace, node_type, trigger_name, migration) (delta(splice_trigger_completed_total{outcome="failure"}[10m]))
    / sum by (namespace, node_type, trigger_name, migration) (delta(splice_trigger_completed_total[10m]))
  reduce: avg
  healthy_when: { op: "==", value: 0 }    # percent of trigger runs failing
  for: 5m
  provenance: operational
  labels: [namespace, node_type, node_name, job, trigger_name, migration, outcome, party]
  consequence: >
    Validator app automation is failing, so rewards are not collected and
    stores do not advance. Digital Asset escalates severity above 50%.
```

Every field except `consequence` is machine-evaluable. `canton-reliability vitals` runs the query, reduces the series, and applies the comparison. `vitals-alerts.yaml` is those same fields rendered as Grafana provisioning, so the rules an operator imports and the check they run cannot disagree.

The initial metric set is:

| Metric | Class | A value outside its range means |
| :--- | :--- | :--- |
| Sequencer connection pool health | **security** | Fewer reachable sequencers than the f+1 a validator needs for its participant to advance |
| Active subscriptions, against the pool's own published threshold | **security** | Fewer live subscriptions than the node's own configuration requires |
| Scan responses disagreeing with BFT consensus | **security** | A Scan the node reads is faulty or dishonest, and the node is trusting it |
| Store ingestion lag | operational | The node is not ingesting, and liveness rewards stop |
| Sequencer client delay | operational | The participant is behind its sequencer |
| Acknowledgement lag | operational | The participant sees confirmations too late to confirm transactions |
| ACS commitment progress, across three measures | operational | Commitment reconciliation is stalling. Insufficient heap here is the documented mechanism behind two participant crash loops |
| Automation health and trigger failures | operational | Validator app automation is failing, so rewards are not collected and stores do not advance |
| Participant pruning age, against configured retention | operational | Pruning is not keeping up, and the participant database grows without bound |
| Volume fullness | operational | The node is filling toward disk exhaustion |

Classifying the metrics is also part of the work. This RFP asks for security monitoring specifically, yet no published artifact says which validator metrics are security-relevant and which only affect performance. Canton Vitals classifies each metric accordingly.

Thresholds live in a named, versioned reference set that the tool resolves at run time; we publish the default set. Each value carries a `provenance` label saying where it came from:

- **documented**: it reaches operator documentation today.
- **operational**: Digital Asset runs it against their own clusters, verified across the five scratch networks in the repository, and it is not published as guidance.
- **derived**: we propose it, and the reasoning is stated.

Digital Asset's deployment configuration covers five scratch networks, not MainNet or TestNet, so Canton Vitals presents these values as what Digital Asset runs rather than claiming they transfer to every network. Operators can override any single value, because disagreeing with one tolerance should not mean giving up the other nine. And because values live in the reference set rather than in code, a wrong value can be corrected without a release.

Each metric gets one line in the report, with one of three verdicts:

| Verdict | When |
| :--- | :--- |
| `inside` | The observed value satisfies `healthy_when`. |
| `outside` | It does not. The consequence is printed alongside. |
| `not determined` | The metric is absent, metrics are disabled, or a required Prometheus feature is missing. The report names which. |

It comes out as JSON keyed by `vitals.yaml`'s own field names, with a terminal table for reading, so an operator's CI or dashboard consumes a verdict without parsing text.

```
$ canton-reliability vitals --metrics http://validator:10013/metrics --release 0.7.3

metric                                                          class        observed   healthy_when   verdict
daml_sequencer_client_sequencer_connection_pool_connection_health security     1          >= 2           outside: fewer reachable sequencers than the f+1 the participant needs
daml_pruning_max_event_age                                      operational  12d        <= 30d         inside
splice_store_last_ingested_record_time_ms (lag)                 operational  4m 12s     <= 20m         inside
daml_sequencer_client_handler_last_sequencing_time_micros (delay) operational  140s       <= 90s         outside: the participant is behind its sequencer
splice_trigger_completed_total (failure %)                      operational  n/a        == 0           not determined: needs a window; direct-scrape mode has one sample
```

The report follows two rules:

- **Never report a metric as `inside` when its value could not be read.** Metrics are off by default in the Helm chart (`metrics.enable: false`), the deployment path documented for production, and on by default in the Compose bundle. Silent nodes are therefore common. Silence reads as `not determined`, and the report names the setting to change.
- **Never produce a composite score, or a pass/fail for the node.** A Scan result disagreeing with consensus and a slow ACS snapshot are different kinds of problem, and adding them into one number produces a score that looks authoritative and means nothing. Security-class items are reported separately instead.

We will also submit the following upstream contributions. Neither is a precondition for delivery.

- **A `validator-alerts.yaml` manifest** in Splice's repository, staged by the same bundle task that already stages `validator-dashboards.yaml`. This closes the gap at its source, for every operator, whether or not they adopt anything of ours.
- **The validator-facing half of `NETWORK_HEALTH.md`**, contributed as operator documentation, so the f+1 quorum facts reach the operators they describe.

#### Threats, scope, data sources and privacy

The security scope is loss of effective BFT protection at the validator. A participant needs f+1 reachable sequencers to advance, and a Scan's answers are only worth acting on while they agree with consensus. Either condition can degrade without being obvious to the operator. The three security-class metrics above are where that degradation becomes visible. The other seven tell an operator whether their node is working, which matters but is not threat detection.

| Question this RFP asks | Answer |
| :--- | :--- |
| Whether the scope is at the entity or network level | Entity. `canton-reliability vitals` reads one operator's own node and reports to that operator. Nothing aggregates across operators, and no network-wide view is produced or needed |
| Which data the proposal requires | Prometheus-format metrics from the node's own endpoints, or an equivalent query against the operator's Prometheus |
| Whether it is node-local, application-provided, or publicly observable | Entirely node-local. No protocol messages, no party metadata, no transaction contents, nothing from the Global Synchronizer |
| How it functions if involved-party metadata stops being publicly available | Unaffected. It reads no party metadata, and the Foundation has said protocol-level exposure of it may change |
| How privacy, access control and selective disclosure are handled | Nothing leaves the node. `canton-reliability vitals` runs where the operator runs it and transmits nothing, ever. The aggregate figures in the milestones come only from operators who choose to send us a result. Access control is whatever already governs their metrics endpoint |
| What the fleet figures need | A result-sharing format, an anonymisation rule, and operators willing to use them. The format and the rule are Milestone 0 deliverables, so the dependency is planned for rather than discovered mid-grant |

Digital Asset's own automation rules group by `party` and by `store_party`, so at least two Splice metric families carry a party identifier as a label. Metrics feel like anonymous counters, and where a label carries a party identifier they are not. That matters because operators are encouraged to ship telemetry to collectors and hosted monitoring services. The published operator material does not identify which metrics carry party-scoped labels. very item in Canton Vitals therefore states its label set. Confirming a metric's label set requires only a scrape, and the result is recorded in the catalogue.

Selective disclosure of findings to a third party is out of scope: defining what a counterparty is entitled to rely on is a different problem from measuring a node.

### 3. Architectural alignment

Canton Vitals proposes no protocol change and consumes metrics exactly as the node already exposes them (OpenTelemetry-derived, Prometheus-formatted).

The work builds on the existing observability stack. The dashboard manifest gains a matching rules manifest. Digital Asset's threshold values are carried forward with their provenance. `NETWORK_HEALTH.md` is used as a source, and its validator-facing half is contributed back. Prometheus, Grafana and Alertmanager continue to provide collection, evaluation and delivery.

The Canton Validator Reliability Suite has three modules, each proposed separately:

| Module | Checks | Proposed under |
| :--- | :--- | :--- |
| Canton Norm + Canton Drift | configuration | RFP #23 |
| **Canton Vitals** (this proposal) | runtime health | RFP #27 |
| Canton Reentry | recoverability | RFP #23 |

All three modules share a common frame:

- **The runner**, which evaluates a check catalogue against a node
- **The report format**, with `not determined` as the verdict every module shares
- **The provenance label** on every reference value
- **The result-sharing format and anonymisation rule**
- **The contribution guide**

The common frame ships with whichever module the Foundation funds first, as that proposal's Milestone 0.

The modules cover different aspects of validator reliability. Canton Drift and Canton Reentry check what a node declares and Canton Vitals checks what it does: a node can be configured for BFT and be reaching one sequencer, and a pruning schedule can be configured and not be keeping up.

Anyone in the ecosystem can add a check to the Suite. Most checks can be added as a YAML entry: what to read, when the condition holds, and what happens when it does not. Checks that need code land as modules through the same repository.

Once 5 contributors from outside Equilibrium have landed checks, or 50 operators are running it, the repository moves to a neutral ecosystem home, such as the Node Deployment & Operations SIG or the `canton-network` organisation. Equilibrium stays on as the named maintainer.

### 4. Backward Compatibility

*The proposal has no backward compatibility impact.* The check is read-only and `vitals.yaml` is a new artifact. The proposed upstream manifest is additive (one new file and one additional staged directory) and changes nothing about how existing dashboards are built or imported.

---

## Milestones and Deliverables

### Milestone 0: The Suite frame

- **Estimated Delivery:** ~1 month from grant start. Closed at approval where a Suite module has already shipped
- **Focus:** The `canton-reliability` command and the parts every module shares: the runner, the report format with `not determined` as its third verdict, the provenance label, the result-sharing format and anonymisation rule, and the contribution guide. Scheduled operation and fleet mode land in Milestones 2 and 3, where they are first measured.
- **Deliverables / Value Metrics:**
  - `canton-reliability` published Apache-2.0, with the contribution guide: how a check is added as a YAML entry, and how a check that needs code is added as a module
  - The result-sharing format and anonymisation rule published

### Milestone 1: Canton Vitals published, security items first

- **Estimated Delivery:** ~1 month from grant start
- **Focus:** `vitals.yaml` for the current Splice release, covering the three security-class items and every item with a documented consequence behind it. Importable alert rules. `canton-reliability vitals` reporting a node against `vitals.yaml`.
- **Deliverables / Value Metrics:**
  - `canton-reliability vitals` and `vitals-alerts.yaml` published Apache-2.0, with `vitals.yaml` for the current Splice release
  - Label sets published for every metric this milestone covers, each confirmed by a scrape rather than inferred, so an operator can tell what is safe to export off-node

### Milestone 2: Full coverage, and the rules land upstream

- **Estimated Delivery:** ~2 months from grant start
- **Focus:** The remaining items to ten, with Compose and Kubernetes at reporting parity. `validator-alerts.yaml` and bundle staging proposed upstream. Validator-facing health documentation contributed. Native-histogram prerequisites resolved per rule. Scheduled operation, so the check runs on an interval rather than once.
- **Deliverables / Value Metrics:**
  - `vitals.yaml` covering all ten metrics, each rule's histogram prerequisite stated, at reporting parity on both deployment shapes
  - Scheduled operation shipped: `canton-reliability vitals` runs on an interval, with `systemd` timer and Kubernetes `CronJob` examples
  - `validator-alerts.yaml` merged into Splice, or a documented maintainer decision against it
  - Validator-facing health documentation merged upstream

### Milestone 3: Canton Vitals tracks releases, and handover

- **Estimated Delivery:** ~3 months from grant start
- **Focus:** Canton Vitals republished for every Splice release, with changed metrics, rules and values enumerated, so drift is visible in both directions: a node moving outside the thresholds, and the thresholds moving under a node that has not changed. Fleet mode shipped. Establishing who maintains the module after the grant.
- **Deliverables / Value Metrics:**
  - Fleet mode shipped: the same report over many nodes, rolled up per item
  - `vitals.yaml` published for each Splice release within 14 days of it shipping, with changed items called out
  - A published maintenance plan naming Equilibrium as maintainer-of-record, the release process, and the conditions under which the repository moves to a neutral ecosystem home

### Milestone 4: Adoption

- **Opens:** on Milestone 3 acceptance. **Deadline:** 12 months from grant approval.
- **Focus:** Verified adoption of Canton Vitals by the operators and organisations it is built for, per the table below. This milestone carries 30 percent of the base grant. Partial adoption earns partial payment.
- **Payment structure:** the adoption pool is 30 percent of the base: 10 percent for the first Super Validator running Canton Vitals, and 2.5 percent per further qualified organisation for up to four organisations. The completion tranche is 10 percent of the base. It is payable only after at least one pool organisation qualifies and every bundled completion criterion is met.
- **Deliverables and tranches:**

| Deliverable | Acceptance criteria | Tranche payout |
| :--- | :--- | :--- |
| Super Validator adoption | One Super Validator running `canton-reliability vitals` on its own nodes. Evidence: a public statement by the Super Validator, or its attestation to the Foundation, naming the Splice release checked | 10% of base |
| Organisation adoption | Each further qualified organisation: a Node-as-a-Service provider running it across the validators it operates, or a consumer of `vitals.yaml` other than our own check (a monitoring tool, a provider's internal tooling, or Splice itself). Evidence: for an open-source consumer, the public code consuming `vitals.yaml`; otherwise the organisation's public statement or attestation to the Foundation, naming what it runs and across how many validators | 2.5% of base per organisation, up to 10% of base |
| Milestone completion | All of: the alert rules in use by 10 distinct validator operators across both deployment shapes; 5 operators running them on a schedule rather than ad hoc; 3 operators having enabled `metrics.enable` after a `not determined` report; a published count of problems found and corrected out of the shared results it is drawn from, with at least 3 corrected and security-class items reported separately; 10 operators choosing to share a result, with the published figure for how many came back `outside` on at least one security-class metric; and 2 checks contributed from outside Equilibrium, merged. Evidence: operator attestations to the Foundation for rules in use, scheduled runs and `metrics.enable` fixes; the shared results themselves for the corrected count and the security figure; and the merged pull requests for the contributed checks | 10% of base |
| **Milestone 4 maximum** | | 30% of the base |

- **Verification:** attestations go to the Foundation directly rather than through Equilibrium, and shared results identify a node only as far as the Milestone 0 anonymisation rule allows.

### Maintenance: the module tracks Splice, quarter on quarter

- **Estimated Delivery:** Quarterly, from the quarter after Milestone 3, for 4 quarters
- **Focus:** `vitals.yaml` kept current for every Splice release, contributed checks reviewed, and the Suite frame kept working. Equilibrium is maintainer-of-record, scoped so that the core contributors or the SIG could pick it up at this level of funding if Equilibrium stopped: every check is a YAML entry, and the repository is bound for a neutral home.
- **Deliverables / Value Metrics:**
  - `vitals.yaml` current for every Splice release shipped in the quarter, within 14 days of each
  - Every contributed check reviewed, and merged or declined with a stated reason
  - The Suite frame working against the current Splice release

---

## Acceptance Criteria

Each milestone is accepted against the capabilities and acceptance checks stated under that milestone, with the published artifacts providing the evidence.

- **Milestones 0 through 3:** the named artifacts are published and accepted by the committee.
- **Milestone 4:** the Foundation receives the evidence named in the adoption table. Pool payments pay per qualified organisation; the completion tranche also requires at least one qualified organisation and every bundled criterion. Partial adoption earns partial payment.
- **Maintenance:** each quarter's deliverables are published as specified.

Every release must satisfy the following conditions:

- **No metric is ever reported `inside` when its value could not be read.** Where metrics are disabled or a required Prometheus feature is missing, every release of `canton-reliability vitals` reports `not determined` and names the reason.
- **Every metric in `vitals.yaml` carries a label set confirmed by a scrape.**

Upstream outcomes do not gate payment beyond their stated form: `validator-alerts.yaml` and the validator-facing health documentation count as delivered when merged, or when a documented maintainer decision goes against them.

---

## Funding

**Total Funding Request:** Up to 700,000 CC. The base assigns 70 percent to engineering across Milestones 1–3 and up to 30 percent to adoption in Milestone 4. Maintenance quarters are priced separately.

### Payment Breakdown by Milestone

- Milestone 0 _(The Suite frame)_: 0 CC.
- Milestone 1 _(Canton Vitals published, security items first)_: **240,000 CC** upon committee acceptance (~34% of the base)
- Milestone 2 _(Full coverage, and the rules land upstream)_: **150,000 CC** upon committee acceptance (~21% of the base)
- Milestone 3 _(Canton Vitals tracks releases, and handover)_: **100,000 CC** upon final release and acceptance (~14% of the base)
- Milestone 4 _(Adoption)_: up to **210,000 CC** (30% of the base), paid as a per-organisation adoption pool (20%) plus a completion tranche (10%), per the Milestone 4 table
- Maintenance _(the module tracks Splice, quarter on quarter)_: **57,000 CC** per quarter, per quarter, for 4 quarters, upon quarterly acceptance

### Volatility Stipulation

Engineering is scoped at three months; the adoption milestone opens at Milestone 3 acceptance and pays per qualified organisation until its 12-month deadline. Should the timeline extend beyond six months due to Committee-requested scope changes, any remaining milestones will be renegotiated to account for USD/CC price volatility. The maintenance milestone runs beyond six months: its quarterly amount is denominated in Canton Coin against the CC/USD reference price stated at approval, and is re-evaluated at each quarterly acceptance.

---

## Co-Marketing

Upon release, Equilibrium will collaborate with the Foundation on:

- Announcement coordination, timed to a Splice release so Canton Vitals lands with a version it describes
- A technical write-up on Canton Vitals: what the values are, where they come from, and which metrics carry party labels
- Publication of the aggregate measurement from Milestone 4, for which we found no published equivalent: how shared validator nodes sit against these values
- Presentation to the Node Deployment & Operations and Security SIGs

---

## Rationale

Two parts of this proposal had a simpler version available.

The first is `vitals.yaml`. We could have published the thresholds only as Grafana alert rules. An operator running Grafana would still get an alert. But a Grafana rule has two real fields: a query and a threshold. Everything else it carries is free text. There is no structured place in it for where the number came from, what breaks when the threshold is crossed, which labels the metric carries, or whether the problem is a security one. Those details matter to the operator receiving an alert. Furthermore, a rule-based approach only reaches operators who run Grafana. Providers and monitoring tools that would use those values in their own way would have to source them manually. So we publish the catalogue as its own file, and generate the Grafana rules from it.

The second is where the work is published. We could have proposed all of it into Splice, so that it ships with the release bundle. We do propose the parts that fit there. But Splice decides what it merges and when, so we cannot make a funded milestone depend on that decision. The catalogue is therefore published separately, and the upstream contributions are made in addition to it.

## Why Equilibrium

Equilibrium builds, secures, and funds verifiable systems for finance and AI. We're a global team of 30 engineers, cryptographers and economists ([company team page](https://equilibrium.co/who-we-are)). 

Relevant previous work includes:

- **Canton and Daml engineering.** We are building a proof-of-concept SVM execution layer on Canton for Zenith, mapping Solana's account and runtime model onto Canton. We also maintain [awesome-daml](https://github.com/equilibriumco/awesome-daml/), an openly licensed guide to Daml and the Canton developer ecosystem.

- **Node specification and protocol testing.** With Ziggurat, our P2P network-testing framework, we've reverse-engineered network layer's of Solana, Zcash [(write-up)](https://forum.zcashcommunity.com/t/ziggurat-3-0/43350/46), XRP [(blog)](https://xrpl.org/blog/2022/ziggurat) and Algorand into a published specification (e.g. [Solana's spec](https://github.com/solana-foundation/specs/blob/main/gossip/gossip-protocol-spec.md)) and automated test catalogue.

- **Production node engineering and operation.** We've built and continue to maintain [Pathfinder](https://github.com/eqlabs/pathfinder), the open-source Rust full node for Starknet. We are long-standing contributors to [snarkOS](https://github.com/ProvableHQ/snarkOS), Aleo's P2P node software and consensus, and [snarkVM](https://github.com/ProvableHQ/snarkVM), its zkVM, alongside Aleo's core engineering team. We also operate our own Aleo validator, with publicly verifiable uptime ([explorer](https://aleoscan.io/address?a=aleo1cxk6pkrucemg7fmxhhrxymus9vnr00mtmgzvx95nkcwpdj5qhsrswgdgfr)). Other node infrastructure work includes [Lumina](https://github.com/celestiaorg/lumina), the Rust Celestia light node, [Strawberry](https://github.com/eigerco/strawberry), a full Go implementation of the Polkadot JAM protocol, [zkSync state reconstruction](https://github.com/equilibriumco/zksync-state-reconstruct) tooling, which rebuilds zkSync Era state from Ethereum L1 data and verifies it against on-chain commitments.

- **Regulated finance engineering.** We incubated and provided engineering for Membrane Finance, acquired by Paxos in 2025, the company behind [EUROe](https://euroe.com), the first EU-regulated euro stablecoin.
