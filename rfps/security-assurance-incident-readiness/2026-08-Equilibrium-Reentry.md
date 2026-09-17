# Canton Validator Reliability Suite: Reentry

| Field | Value |
| :---- | :---- |
| Organization | Equilibrium ([equilibrium.co](https://equilibrium.co/)) |
| Author / Primary Contact | Olli Tiainen <olli@equilibrium.co> |
| Status | Published |
| Created | 2026-08-31 |
| Proposal Type | RFP-aligned |
| RFP / Roadmap Area | RFP #23: Validator and Shared Infrastructure Security and Resilience |
| Champion | Heslin Kim, Zenith ([@heslin-zenith](https://github.com/heslin-zenith)) |
| Total Funding Request | Up to 1,000,000 CC |
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

Canton's ambition is to grow to 10,000 validators, while making each one secure, resilient, and increasingly straightforward to operate. Much of the knowledge required already exists, but it is spread across deployment defaults, monitoring rules, documentation, source code and expert support rather than being verifiable by the operator running the node.

The **Canton Validator Reliability Suite** turns that knowledge into something an operator can run: one command, `canton-reliability`, that checks a running validator against explicit, versioned references and reports each departure with its consequence. It is read-only and safe to run against a production node. Its three modules cover configuration (Canton Norm + Canton Drift), runtime health (Canton Vitals) and recoverability (Canton Reentry), each proposed separately.

**This proposal delivers the recoverability module, Canton Reentry.** It checks conditions recovery depends on, reading them straight off a running node and the operator's own backup artifacts. For each Super Validator it computes a recovery runway, and reports the soonest one: if the node stopped right now, how much time is left before that SV disables it. When the input behind that runway is missing, the report says so instead of guessing.

The work is delivered as three Apache-2.0 artifacts, with support for both Kubernetes and Docker Compose deployments:

| Deliverable | What it is | An operator adopts it by |
| :--- | :--- | :--- |
| `canton-reliability reentry preflight` | Read-only, safe against a production node. Twelve conditions evaluated against live node state and the operator's real backup artifacts, plus the recovery runway against the soonest SV | Running it against a node |
| `canton-reliability reentry restore-test` | Loads the operator's real dumps into a throwaway Postgres, boots a participant against them with no synchronizer connection, reports whether they load and agree, and destroys both | Pointing it at a backup |
| `reentry.yaml` | The module's twelve conditions, declared so anyone can add one. Per condition: what to observe, when it holds, the input it needs, and what violating it costs | Reading it, extending it, or consuming it in their own tooling |

Engineering is scoped at five months; adoption pays per qualified organisation until month 12, and quarterly maintenance follows. The base grant assigns 70 percent to engineering and 30 percent to adoption; the amounts are set under [Funding](#funding).

---

## Motivation

### Validator failure reports

On 21 April 2026, a validator operator [lost an AWS region](https://forum.canton.network/t/participant-memberdisabled-after-aws-uae-region-outage-need-re-enable/8549) and brought the node back with its data intact, only to find every sequencer reporting it `MemberDisabled`. The node had simply been offline too long, and there was no way for them to know a limit existed.

We searched the Canton Network Forum across twenty operator-failure queries for topics since January 2025. Of 48 distinct topics, twelve are validator operational-failure reports. The region-outage incident is one of them:

> "Due to the recent AWS UAE region outage, our Canton validator went down and has been offline for an extended period... Good news is all our postgres data migrated successfully. Bad news is our participant is now showing MemberDisabled on all sequencers... Node is fully running, data intact, just can't reconnect because the participant got disabled during the downtime. Is there anyone from GSF or another SV who can help re-enable our participant?"

It received no reply.

The remaining reports had the following outcomes:

| Count | Outcome |
| :--- | :--- |
| 4 | Got a reply the reporter never confirmed worked |
| 2 | Reached a confirmed public resolution (one of them by a peer suggesting a version downgrade rather than by an official answer) |
| 2 | Redirected to the Foundation's private Slack. One is a [request for the complete server-migration procedure](https://forum.canton.network/t/migration-the-validator-from-one-server-to-another/8559) that a second operator seconded with "same question" |
| 2 | Answered only with an explicitly unconfirmed diagnosis, three to four weeks later, after the operator [missed the 27 June MainNet LSU](https://forum.canton.network/t/validator-stuck-during-vet-packages-after-upgrade-from-0-5-10-to-0-6-7-mainnet-lsu/8824) |
| 1 | Self-answered by the operator who asked |

The reports show recovery conditions becoming visible only during or after an incident.

### Where the recovery conditions live

The recovery conditions are documented in prose; they are not currently evaluated against live node state.

| What | Where | Reaches validator operators |
| :--- | :--- | :--- |
| Backup conditions: identities and every Postgres instance, four-hour cadence, snapshot ordering, spacing against pruning retention, retention across logical synchronizer upgrades | [validator backups](https://docs.canton.network/global-synchronizer/production-operations/validator-backups) | Yes, as prose read once at install |
| Recovery routes, and what re-onboarding does not migrate: users, multi-hosted parties, external parties | [validator disaster recovery](https://docs.canton.network/global-synchronizer/production-operations/validator-disaster-recovery) | Yes, except the Kubernetes restore step itself, which the page states is "not documented here" |
| The trigger that enforces the deadline | [`SequencerPruningTrigger`](https://github.com/canton-network/splice/blob/main/apps/sv/src/main/scala/org/lfdecentralizedtrust/splice/sv/automation/singlesv/SequencerPruningTrigger.scala) | No. Behaviour of SV-side automation |
| `retentionPeriod` itself | Per-SV Helm configuration, authoritative on the sequencer administration API | No. Not modelled in Daml, so not DSO-governed and not readable through Scan |

These conditions can be violated without an immediate failure signal.

### `retentionPeriod` and recovery runway

The last two rows together determine whether the validator is still within its recovery window.

Each Super Validator enforces its own deadline for absence. [`SequencerPruningTrigger`](https://github.com/canton-network/splice/blob/main/apps/sv/src/main/scala/org/lfdecentralizedtrust/splice/sv/automation/singlesv/SequencerPruningTrigger.scala) computes `now − retentionPeriod`, disables every member whose acknowledgement is older than that, and only then prunes: a node never loses data to pruning, only membership. 

Splice's [SV pruning guidance](https://github.com/canton-network/splice/blob/main/docs/src/sv_operator/sv_pruning.rst) treats this as normal operation, not an edge case: it tells SV operators to configure participants to prune despite missing ACS commitments, because otherwise "pruning will essentially never run on mainnet as validators get shut down relatively frequently."

The same (`retentionPeriod`) is involved in two different failure modes:

| Cause | Error |
| :---- | :---- |
| The node was absent longer than `retentionPeriod`, so an SV disabled it | `MemberDisabled` |
| The node is enabled and acknowledging, but was restored to a point the sequencer has legitimately pruned | `EventsUnavailableForTimestamp` |

Calculating recovery runway requires each SV's `retentionPeriod`, which is not currently available to the validator.

### Use across validator operators and fleets

As of March 2026, roughly 980 validators were mapped by community tooling; onboarding caps are rising toward 3,000 through September 2026, against a 2028 target of 10,000 validator nodes. At that scale the recovery conditions have to be answerable from the node, rather than by asking.

The conditions are per-node, so one Node-as-a-Service provider adopting `canton-reliability reentry` covers every validator in its fleet. Self-operated and hosted validators read the same twelve conditions off the same interfaces.

---

## Specification

### 1. Objective

**A Canton validator operator can determine whether their node can rejoin after a failure, how much recovery time remains, and what the recovery process would not restore.**

### 2. Implementation Mechanics

**`canton-reliability reentry preflight`.** Evaluates all twelve conditions against the running node and the operator's backup artifacts, and computes the recovery runway against each SV where the retention input allows, reporting the soonest one. It performs no restore and mutates nothing on the production node.

`retentionPeriod` reaches the report as one of three states, and the report never assumes a value it wasn't given. (The `SequencerConfig` field that would make it `published` is one of this proposal's upstream contributions, covered below.)

| State | Source | Effect |
| :--- | :--- | :--- |
| `published` | Read from `SequencerConfig`, once the field exists | The runway is computed and labelled `published` |
| `declared` | Supplied by the operator, typically from their SV sponsor | The runway is computed and labelled `declared`, with its source recorded |
| `unknown` | Not supplied | The runway is **not computed**. The report names the missing input and why it cannot be obtained |

**`canton-reliability reentry restore-test`.** Loads the dumps into a throwaway Postgres rather than the operator's node, and verifies that they restore successfully. It boots a participant against the restored database with no synchronizer connection, and destroys both afterwards. The test checks:

1. The dumps load to completion.
2. They are mutually consistent: they load into one instance and agree on participant id and party set.
3. The participant initializes against the migration the dumps belong to.

A truncated or incomplete dump can still carry a valid archive header, so the dump itself has to be restored to verify that it loads. Run after `preflight`, `restore-test` verifies that the dump loads cleanly and that its restore point falls within the retained history allowed by the current retention value. It cannot confirm that the node would rejoin the network, because the test does not connect to it.

**`reentry.yaml`.** Twelve conditions. A condition enters only where a source states it: eleven come from the operator documentation, and one from `SequencerPruningTrigger`. Two entries, one of each kind:

```yaml
# A condition enters because a source requires it, or because the implementation
# enforces it. `runway` is present where the condition has time left to report.

- condition: acknowledgement_age_within_retention
  group: timing
  provenance: derived        # SequencerPruningTrigger, not documentation
  observe:
    metric: splice_store_last_ingested_record_time_ms{store="participant"}
    reduce: last
    as: acknowledged_at
  input:
    name: sequencer_retention_period
    per: sv
    states: [published, declared, unknown]
  holds_when: "now - acknowledged_at < sequencer_retention_period"
  runway: "sequencer_retention_period - (now - acknowledged_at)"
  on_unknown_input: not_determined
  consequence: >
    Each SV's SequencerPruningTrigger disables every member whose acknowledgement
    is older than now - retentionPeriod, then prunes. The node loses membership
    with its data intact, and the documented route back is full re-onboarding.

- condition: users_since_backup
  group: node
  provenance: documented
  observe:
    node: user list
    artifact: users recorded in the validator-app dump
    as: [live_users, dump_users]
  input:
    name: backup_location
    states: [declared, unknown]
  holds_when: "count(live_users - dump_users) == 0"
  on_unknown_input: not_determined
  consequence: >
    Users onboarded after the backup point are not restored by it, and the
    documentation requires them to be re-onboarded by hand.
```

Every field except `consequence` is machine-evaluable, so `reentry.yaml` is a catalogue consumed by `canton-reliability reentry`.

| Condition | Read from | Provenance |
| :--- | :--- | :--- |
| `identities_backed_up` | The operator's secret store, against live identity from the validator admin API `/v0/admin/participant/identities` | documented |
| `postgres_cadence` | Backup artifacts, at least every four hours | documented |
| `snapshot_ordering` | Dump archive headers: the validator-app snapshot strictly earlier than the participant's | documented |
| `historical_spacing` | Artifacts, against the participant's effective pruning retention | documented |
| `lsu_retention` | Artifacts, and the dump's migration id against the node's current migration | documented |
| `restore_point_within_retained_history` | The dump's restore point, against the retention input | documented |
| `old_synchronizer_reachable` | Where a backup predates a logical synchronizer upgrade, the migration id and network state | documented |
| `pruning_schedule_configured` | Participant admin API `GetParticipantSchedule` | documented |
| `recovery_route_available` | Artifacts and KMS reachability, since an identities dump holding only `KmsKeyId` references needs the KMS | documented |
| `users_since_backup` | Node user list against dump contents | documented |
| `parties_not_migrated` | Topology `ListPartyToParticipant`, for parties hosted on several participants and external parties | documented |
| `acknowledgement_age_within_retention` | `splice_store_last_ingested_record_time_ms`, against the retention input, per SV | derived |

Each condition is reported on one line, with the observed value, reference, and one of three verdicts:

| Verdict | When |
| :--- | :--- |
| `holds` | The observed state satisfies `holds_when`. Where the condition carries a `runway`, the time printed is the soonest across every SV, naming that SV and the provenance of the retention input |
| `violated` | It does not. The `consequence` is printed alongside |
| `not determined` | An `input` is `unknown`, or the node and artifacts do not carry the value. The report names which |

```
$ canton-reliability reentry preflight --backups s3://ops-backups/validator/ --retention 30d@sv-sponsor

condition                             observed          reference          verdict
identities_backed_up                  2026-08-24 03:11  fresher than node  holds
postgres_cadence                      no timestamp      within 4h          not determined: plain-SQL dumps carry no timestamp
snapshot_ordering                     no timestamp      strict ordering    not determined: plain-SQL dumps carry no timestamp
pruning_schedule_configured           retention 48h     configured         holds
users_since_backup                    3 users           0                  violated: 3 users need manual re-onboarding
acknowledgement_age_within_retention  42s               30d (declared)     holds: 29d 23h 59m runway before sv-1 disables this node
```

Both modes follow these rules:

- **Never report a condition as `holds` from a value it had to assume.** `snapshot_ordering` reads `not determined` against plain-SQL dumps rather than trusting the filename.
- **Never print one verdict for the node, or the words "recovery verified".** `preflight` holding does not mean the dumps would load, and `restore-test` passing does not mean the node would rejoin. Neither result covers the other, so there is no line that can carry both. Telling an operator they are recoverable does not fix the condition that will lock them out.

We will also submit the following upstream contributions. None is a precondition for delivery; if all are declined, `canton-reliability reentry` still works and reports `not determined` where required.

- **A retention field on `SequencerConfig`** in [`DsoRules`](https://github.com/canton-network/splice/blob/main/daml/splice-dso-governance/daml/Splice/DSO/DecentralizedSynchronizer.daml), which already carries `migrationId`, `sequencerId`, `url` and `availableAfter` per SV on-ledger. `availableAfter` tells a participant *when it may subscribe*; the new field is its mirror image, telling it *how long it may be absent*, so the runway can be computed from a published value rather than a declared one. Every `unknown` in a shared result is evidence for the field.
- **The custom-format dump (`pg_dump -Fc`) in the backup documentation.** A `-Fc` archive records `Archive created at` in its header, with the source database name, unlike the plain-SQL dumps documented today. We verified three things about it. It survives copying and a forged file mtime. It reads offline with no server running. It marks the moment `pg_dump` was invoked, not the moment it finished. That is what makes `snapshot_ordering` and `postgres_cadence` verifiable from the artifact at all.
- **The Kubernetes restore procedure**, whose load step currently reads that restoring storage and databases "depends on the storage and DBs used by the components, and is not documented here". Restoring those databases is what `canton-reliability reentry restore-test` does, so writing the step down is a byproduct of building the mode.
- **A warning against restoring a backup onto the live network to test it.** Two copies of one identity on the same sequencers make the live node lose data it still needs, and neither the backup nor the disaster-recovery page says so today.

#### Data and privacy

Both modes run where the operator runs them and transmit nothing.

| Concern | How `canton-reliability reentry` handles it |
| :--- | :--- |
| What it reads | `preflight`: the validator and participant admin APIs, `SequencerConfig` through Scan, and the operator's own backup location. `restore-test`: the operator's dumps, loaded into a throwaway instance it creates and destroys |
| What it writes | Nothing. Neither mode mutates node state, and neither connects a second node to the network |
| Key material | The identities dump holds either private keys or `KmsKeyId` references. Only the dump's `id` and key set are compared against live node identity, to establish freshness and which recovery route exists. Key material is never copied, printed, or transmitted |
| Backup artifacts | Left where the operator put them. Read for their archive headers, their restore points, and the users the validator-app dump records |
| What leaves the node | Nothing. The aggregate figures in the milestones come only from operators who choose to send us a result |
| What the fleet figures need | A result-sharing format and an anonymisation rule, delivered under Milestone 0. Operators choosing to share results is measured under Milestone 4 |

### 3. Architectural alignment

Everything runs against existing interfaces: the validator admin API, the participant admin `PruningService` and topology read service, Scan, and the Prometheus metrics Splice already exposes. No protocol change is required, and the one on-ledger change we propose is a single optional field on an existing record. Licensed Apache-2.0, matching Splice, with the documentation contributions and the `SequencerConfig` change going upstream to `canton-network/splice`.

The proposal also uses outputs from existing funded work. Digital Asset's Scalability, Performance and Robustness grant operates release-regression testing at network scale, and adds per-sequencer availability metrics. That work is network-level and DA-run; this proposal is per-operator and runs on the operator's own node. DA's sequencer health data is one more input `preflight` can consume. Denex's Localnet grant is building declarative multi-node orchestration, which is what any end-to-end restore drill needs, so we do not build a second orchestrator.

Catalyst Blockchain Manager creates and restores validator identity dumps. The material we could retrieve covers performing backup and restore; whether it also verifies them is unconfirmed, and the two read as complementary either way. We never take over an operator's backup path in any case.

The Canton Validator Reliability Suite has three modules, each proposed separately:

| Module | Checks | Proposed under |
| :--- | :--- | :--- |
| Canton Norm + Canton Drift | configuration | RFP #23 |
| Canton Vitals | runtime health | RFP #27 |
| **Canton Reentry** (this proposal) | recoverability | RFP #23 |

All three modules share a common frame:

- **The runner**, which evaluates a check catalogue against a node
- **The report format**, with `not determined` as the verdict every module shares
- **The provenance label** on every reference value
- **The result-sharing format and anonymisation rule**
- **The contribution guide**

The common frame ships with whichever module the Foundation funds first, as that proposal's Milestone 0.

The modules cover different aspects of validator reliability. Canton Drift asks whether the node's configuration matches the reference Splice ships, and Canton Vitals asks what its metrics say right now. Canton Drift and Canton Reentry read two of the same values off the node: the participant's pruning schedule and the migration id. Drift checks those two values against that reference. Reentry checks whether the operator's backups fall inside the window they define. Nothing else is shared between the two modules.

Anyone in the ecosystem can add a check to the Suite. Most checks can be added as a YAML entry: what to read, when the condition holds, and what happens when it does not. Checks that need code land as modules through the same repository.

Once 5 contributors from outside Equilibrium have landed checks, or 50 operators are running it, the repository moves to a neutral ecosystem home, such as the Node Deployment & Operations SIG or the `canton-network` organisation. Equilibrium stays on as the named maintainer.


### 4. Backward Compatibility

*The proposal has no backward compatibility impact.* Both modes consume existing APIs from outside and write nothing to the node or the network. The proposed `SequencerConfig` field is optional, and a validator reading a record without it behaves exactly as it does today.

---

## Milestones and Deliverables

### Milestone 0: The Suite frame

- **Estimated Delivery:** ~1 month from grant start. Closed at approval where a Suite module has already shipped
- **Focus:** The `canton-reliability` command and the parts every module shares: the runner, the report format with `not determined` as its third verdict, the provenance label, the result-sharing format and anonymisation rule, and the contribution guide. Scheduled operation lands in Milestone 2 and fleet mode in Milestone 3.
- **Deliverables / Value Metrics:**
  - `canton-reliability` published Apache-2.0, with the contribution guide: how a check is added as a YAML entry, and how a check that needs code is added as a module
  - The result-sharing format and anonymisation rule published

### Milestone 1: The recoverability module shipped, preflight first

- **Estimated Delivery:** ~2 months from grant start
- **Focus:** `canton-reliability reentry preflight` and `reentry.yaml`, published Apache-2.0, the check covering all twelve conditions on Kubernetes and Docker Compose alike. The `SequencerConfig` retention field submitted upstream.
- **Deliverables / Value Metrics:**
  - `canton-reliability reentry preflight` published Apache-2.0, covering all twelve conditions on both deployment shapes
  - `reentry.yaml` published, with each of the twelve conditions traced to the source that states it
  - The `SequencerConfig` retention field submitted upstream, or a documented maintainer decision against it

### Milestone 2: Restore testing and the documentation contributions

- **Estimated Delivery:** ~4 months from grant start
- **Focus:** `canton-reliability reentry restore-test`, confirming an operator's real dumps load in isolation. The three documentation contributions: the custom-format dump recommendation, the undocumented Kubernetes restore procedure, and the warning against restoring onto the live network. Scheduled operation, so the check runs on an interval rather than once.
- **Deliverables / Value Metrics:**
  - Scheduled operation shipped: `canton-reliability reentry preflight` runs on an interval, with `systemd` timer and Kubernetes `CronJob` examples
  - `canton-reliability reentry restore-test` published Apache-2.0, executing the restore of an operator's real dumps in isolation
  - Documentation contributions merged into `canton-network/splice`, or a documented maintainer decision against them

### Milestone 3: Sustained operation and handover

- **Estimated Delivery:** ~5 months from grant start
- **Focus:** `reentry.yaml` republished for every Splice release, with changed conditions called out. Fleet mode shipped. Establishing who maintains the module after the grant.
- **Deliverables / Value Metrics:**
  - `reentry.yaml` published for each Splice release within 14 days of it shipping, with changed conditions called out
  - Fleet mode shipped: the same report over many nodes, rolled up per item
  - Integration path documented for at least one node-management platform
  - A published maintenance plan naming Equilibrium as maintainer-of-record, the release process, and the conditions under which the repository moves to a neutral ecosystem home

### Milestone 4: Adoption

- **Opens:** on Milestone 3 acceptance. **Deadline:** 12 months from grant approval.
- **Focus:** Verified adoption of Canton Reentry by the operators and organisations it is built for, per the table below. This milestone carries 30 percent of the base grant. Partial adoption earns partial payment.
- **Payment structure:** the adoption pool is 30 percent of the base: 10 percent for the first Super Validator running Canton Reentry, and 5 percent per further qualified organisation for up to four organisations. The completion tranche is 10 percent of the base. It is payable only after at least one pool organisation qualifies and every bundled completion criterion is met.
- **Deliverables and tranches:**

| Deliverable | Acceptance criteria | Tranche payout |
| :--- | :--- | :--- |
| Super Validator adoption | One Super Validator running `canton-reliability reentry preflight` on its own nodes. Evidence: a public statement by the Super Validator, or its attestation to the Foundation, naming the Splice release checked | 10% of base |
| Organisation adoption | Each further qualified organisation: a Node-as-a-Service provider running it across the validators it operates, or a consumer of `reentry.yaml` other than our own check. Evidence: for an open-source consumer, the public code consuming `reentry.yaml`; otherwise the organisation's public statement or attestation to the Foundation, naming what it runs and across how many validators | 2.5% of base per organisation, up to 10% of base |
| Milestone completion | All of: `canton-reliability reentry preflight` in use by 10 distinct validator operators across both deployment shapes; 5 of those running it on a schedule rather than ad hoc; 3 operators having supplied the retention input after a `not determined` report; 10 operators having verified real backup artifacts with `restore-test` rather than assumed them sound, 3 of those finding a backup defect they were previously unaware of; a published count of conditions found violated and corrected out of the shared results it is drawn from, with at least 3 corrected; 10 operators choosing to share a result, with the published share reporting the retention input as `unknown`; and 2 checks contributed from outside Equilibrium, merged. Evidence: operator attestations to the Foundation for usage, scheduled runs and corrections; the shared results themselves for the corrected count; the merged pull requests for the contributed checks | 10% of base |
| **Milestone 4 maximum** | | **300,000 CC** (30% of the base) |

- **Verification:** attestations go to the Foundation directly rather than through Equilibrium, and shared results identify a node only as far as the Milestone 0 anonymisation rule allows.

### Maintenance: the module tracks Splice, quarter on quarter

- **Estimated Delivery:** Quarterly, from the quarter after Milestone 3, for 4 quarters
- **Focus:** `reentry.yaml` kept current for every Splice release, contributed checks reviewed, and the Suite frame kept working. Equilibrium is maintainer-of-record, scoped so that the core contributors or the SIG could pick it up at this level of funding if Equilibrium stopped: most checks are a YAML entry, and the repository is bound for a neutral home.
- **Deliverables / Value Metrics:**
  - `reentry.yaml` current for every Splice release shipped in the quarter, within 14 days of each
  - Every contributed check reviewed, and merged or declined with a stated reason
  - The Suite frame working against the current Splice release

---

## Acceptance Criteria

Each milestone is accepted against the capabilities and acceptance checks stated under that milestone, with the published artifacts providing the evidence.

- **Milestones 0 through 3:** the named artifacts are published and accepted by the committee.
- **Milestone 4:** the Foundation receives the evidence named in the adoption table. Pool payments pay per qualified organisation; the completion tranche also requires at least one qualified organisation and every bundled criterion. Partial adoption earns partial payment.
- **Maintenance:** each quarter's deliverables are published as specified.

Every release must satisfy the following conditions:

- **No condition is ever reported `holds` when the input behind it is `unknown`.** Where the retention input is missing, every release of `canton-reliability reentry preflight` reports `not determined` and names the reason.
- **`restore-test` never touches the live synchronizer or the operator's production node.** It runs the restore in a throwaway instance it creates and destroys, and connects to nothing.

Upstream outcomes do not gate payment beyond their stated form: the documentation contributions and the `SequencerConfig` retention field count as delivered when merged, or when a documented maintainer decision goes against them.

---

## Funding

**Total Funding Request:** Up to 1,000,000 CC. The base assigns 70 percent to engineering across Milestones 1–3 and 30 percent to adoption in Milestone 4. Maintenance is priced separately.

### Payment Breakdown by Milestone

- Milestone 0 (The Suite frame): 0 CC. Its cost is spread across this proposal's paid milestones; each Suite proposal carries one third of it
- Milestone 1 (The recoverability module shipped, preflight first): **370,000 CC** upon committee acceptance (~37% of the base)
- Milestone 2 (Restore testing and the documentation contributions): **295,000 CC** upon committee acceptance (~30% of the base)
- Milestone 3 (Sustained operation and handover): **35,000 CC** upon final release and acceptance (~4% of the base)
- Milestone 4 (Adoption): up to **300,000 CC** (30% of the base), paid as a per-organisation adoption pool (20%) plus a completion tranche (10%), per the Milestone 4 table
- Maintenance (the module tracks Splice, quarter on quarter): **68,000 CC** per quarter, for 4 quarters, upon quarterly acceptance

### Volatility Stipulation

Engineering is scoped at five months; the adoption milestone opens at Milestone 3 acceptance and pays per qualified organisation until its 12-month deadline. Should the engineering timeline extend beyond six months due to Committee-requested scope changes, any remaining milestones will be renegotiated to account for USD/CC price volatility. The maintenance milestone runs beyond six months: its quarterly amount is denominated in Canton Coin against the CC/USD reference price stated at approval, and is re-evaluated at each quarterly acceptance.

---

## Co-Marketing

Upon release, Equilibrium will collaborate with the Foundation on:

- Announcement coordination
- A technical write-up of the baseline findings: how many validators satisfy every recovery condition, from the operators who share a result. We found no published figure like it
- Developer and operator promotion, including a walkthrough aimed at new validator operators during onboarding
- Publication of the disablement model, since it is currently established only by reading `SequencerPruningTrigger`

---

## Rationale

Two of the choices in this proposal had easier alternatives available. We rejected all of them.

The first is the recovery runway. We looked for cheaper ways to get it, ones that don't need each SV's `retentionPeriod`:

- One is to probe the sequencers: ask for old timestamps and see where `EventsUnavailableForTimestamp` starts. But that means deliberately causing errors on other operators' infrastructure just to read a config value.
- Another is to assume 30 days for everyone. But every SV sets its own value, so a convention isn't the setting.
- A third is Scan's `/v0/backfilling/migration-info RecordTimeRange`, which looks like the number we want but isn't: it reports how far back Scan has indexed, not how far back the sequencer still keeps history.

None of the three gives us the value the deadline is actually computed from. This is why we propose publishing it on `SequencerConfig` instead.

The second is how a backup gets tested. We considered the most direct test of all: restore the backup onto the live network and see if it works. But the restored copy and the real node would be running as the same validator, both connected to the same sequencers. Then the copy could potentially acknowledge messages in the real node's name, causing the sequencer to treat those messages as delivered and thus prune them. Result: the real node comes back after the test missing history it's supposed to have. This is why `restore-test` restores into a throwaway instance and doesn't connect.


## Why Equilibrium

Equilibrium builds, secures, and funds verifiable systems for finance and AI. We're a global team of 30 engineers, cryptographers and economists ([company team page](https://equilibrium.co/who-we-are)). 

Relevant previous work includes:

- **Canton and Daml engineering.** We are building a proof-of-concept SVM execution layer on Canton for Zenith, mapping Solana's account and runtime model onto Canton. We also maintain [awesome-daml](https://github.com/equilibriumco/awesome-daml/), an openly licensed guide to Daml and the Canton developer ecosystem.

- **Node specification and protocol testing.** With Ziggurat, our P2P network-testing framework, we've reverse-engineered network layer's of Solana, Zcash [(write-up)](https://forum.zcashcommunity.com/t/ziggurat-3-0/43350/46), XRP [(blog)](https://xrpl.org/blog/2022/ziggurat) and Algorand into a published specification (e.g. [Solana's spec](https://github.com/solana-foundation/specs/blob/main/gossip/gossip-protocol-spec.md)) and automated test catalogue.

- **Production node engineering and operation.** We've built and continue to maintain [Pathfinder](https://github.com/eqlabs/pathfinder), the open-source Rust full node for Starknet. We are long-standing contributors to [snarkOS](https://github.com/ProvableHQ/snarkOS), Aleo's P2P node software and consensus, and [snarkVM](https://github.com/ProvableHQ/snarkVM), its zkVM, alongside Aleo's core engineering team. We also operate our own Aleo validator, with publicly verifiable uptime ([explorer](https://aleoscan.io/address?a=aleo1cxk6pkrucemg7fmxhhrxymus9vnr00mtmgzvx95nkcwpdj5qhsrswgdgfr)). Other node infrastructure work includes [Lumina](https://github.com/celestiaorg/lumina), the Rust Celestia light node, [Strawberry](https://github.com/eigerco/strawberry), a full Go implementation of the Polkadot JAM protocol, [zkSync state reconstruction](https://github.com/equilibriumco/zksync-state-reconstruct) tooling, which rebuilds zkSync Era state from Ethereum L1 data and verifies it against on-chain commitments.

- **Regulated finance engineering.** We incubated and provided engineering for Membrane Finance, acquired by Paxos in 2025, the company behind [EUROe](https://euroe.com), the first EU-regulated euro stablecoin.
