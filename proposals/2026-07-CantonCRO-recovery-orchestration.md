## Development Fund Proposal

**Author:** [Canton CRO team](github.com/canton-cro)
**Status:** Draft
**Created:** 2026-07-16
**Label:** node-deployment-operations

**Champion:** open to any Tech & Ops Committee member organization (e.g., Digital Asset, IntellectEU, Cumberland); determined during committee review

---

## Abstract

Party and participant recovery on Canton is a documented but fully manual procedure: offline party replication alone is 13 ordered console steps, and a mistake mid-import can leave a participant in a broken state ([Canton Operate 3.5, party replication](https://docs.digitalasset.com/operate/3.5/howtos/operate/parties/party_replication.html)). Canton CRO is an open-source CLI that turns this procedure into a safe, repeatable, provable operation: plan, live preflight, apply, resume, and recovery drills.

Working implementation with published evidence. The tool exists and its core claims are proven against real Canton 3.5.8: all 13 replication steps execute end to end, preflight probes the live environment and blocks a dead one, and a fault drill corrupts a real ACS snapshot, receives a genuine Canton error, stops safely, restores, and completes the replication on resume. The full break-and-recover cycle runs in CI on every push ([live run log](https://github.com/canton-cro/canton-cro/blob/main/docs/manual-baseline-run-log.md), [CI workflow](https://github.com/canton-cro/canton-cro/actions/workflows/localnet-drill.yml)). CRO never touches key material. Apache-2.0.

---

## Specification

### 1. Objective

Make the documented party/participant recovery procedure on Canton safe, repeatable and provable for node operators.

One objective, with explicit boundaries. CRO is not a wallet, not a dashboard, not a key management tool. It does not attempt party offboarding (unsupported by the protocol) and does not touch synchronizer-level migration (addressed by Logical Synchronizer Upgrades). The scope wall is documented in the [threat model](https://github.com/canton-cro/canton-cro/blob/main/docs/threat-model.md).

### 2. Implementation Mechanics

Delivered and running today:

- **Orchestration core.** A step state machine executes the 13 documented replication steps in order. Every step records state to disk (`runs/<id>/state.json`, `events.jsonl`), a second `apply` is an idempotent no-op, and `resume` continues from the exact failed step. On failure the tool performs a safe stop: later steps stay pending, the target is never reconnected after a failed import, and a structured `diagnosis.json` records the real error lines plus recovery actions ([sample from a real failed import](https://github.com/canton-cro/canton-cro/blob/main/localnet/out/fault-a8-diagnosis.json)).
- **Canton adapter.** Long-lived Canton nodes run as a daemon; each step executes as a short-lived remote console script over the Admin and Ledger APIs. Cross-step values such as the pre-activation ledger offset are carried through the run state. All console command signatures were verified live against Canton 3.5.8 and are recorded step by step in the [run log](https://github.com/canton-cro/canton-cro/blob/main/docs/manual-baseline-run-log.md).
- **Live preflight.** Before apply, one console run probes the real environment: participant health, cross-participant ping, party hosting on source and target, DAR presence, synchronizer connection, and the party ACS. Probed facts are merged over operator-declared facts and persisted with a probe stamp ([example](https://github.com/canton-cro/canton-cro/blob/main/localnet/out/live-a7-facts.json)). The design is fail-safe: if the console is unreachable, every probed fact defaults to false and apply is blocked. A dead environment never looks green.
- **Recovery drills.** The fault drill copies the exported snapshot to a pristine rollback artifact, deterministically corrupts the live file, and lets Canton reject the import with a genuine error (observed: `PROTO_DESERIALIZATION_FAILURE`). It then proves the target is clean, restores the snapshot, and completes the replication via resume. A simulated drill variant runs with no Canton at all for fast rehearsal. One honest limit is documented rather than papered over: a partial import cannot be produced deterministically on a real ledger, so `partial-acs-import` is simulation-only.
- **Operator documentation.** A [threat model](https://github.com/canton-cro/canton-cro/blob/main/docs/threat-model.md) (exact touched surface, never-touched list, trust model) and an [operator runbook](https://github.com/canton-cro/canton-cro/blob/main/docs/runbook.md) (including the 7-step failed-import recovery procedure) ship with the repo.

To be built under this grant (Milestones 2 and 3):

- **External party support.** The proven flow covers participant-hosted parties. Wallet users hold their own signing keys as external parties, and the documented external-party replication variant differs (hosting authorization requires the party's own signature). CRO will orchestrate that variant without ever handling the key itself: the tool prepares the topology transaction and the party signs with their existing setup.
- **Real database backup and restore.** On the H2 localnet the backup step is a documented no-op. Production participants run Postgres, so CRO will integrate pg_dump/pg_restore into the `backup_target` step, add backup freshness to preflight, and extend the drill matrix with a restore-from-database-backup scenario, including the branch where a failed import leaves the target not clean.
- **Environment coverage.** Validation on a Splice validator localnet (cn-quickstart), Windows parity in CI (initial Windows fixes are already merged), and a version compatibility matrix so console signature drift across Canton releases is caught by CI rather than by operators.

### 3. Architectural Alignment

- The orchestration follows the official Canton Operate 3.5 procedure exactly. CRO adds no privilege: anyone with Admin API access can perform every action manually, and the tool only removes ordering and bookkeeping mistakes.
- Logical Synchronizer Upgrades removed the need for synchronizer-level hard migrations. Party-level recovery tooling remains manual and does not appear in Splice release notes. CRO fills that specific gap.
- The work maps directly to the published ecosystem priorities of stability and resilience, operational simplicity, and lower total cost of ownership for node operators.

### 4. Backward Compatibility

No backward compatibility impact. CRO is a client-side tool using existing Admin and Ledger APIs through the standard console. No protocol, Splice, or node changes are required.

---

## Milestones and Deliverables

### Milestone 1: Foundation (delivered at submission)

- **Estimated Delivery:** Complete. Verifiable today.
- **Focus:** The orchestration core, real Canton adapter, live preflight, real fault drill with full recovery loop, CI, threat model and runbook, as described above.
- **Deliverables / Value Metrics:** Any reviewer can verify the value in under an hour: run `bash cli/scripts/live-drill.sh` (13 real steps, idempotency proof, target ACS assertion) and `bash cli/scripts/live-fault-drill.sh` (real break, diagnosis, clean-target proof, restore, resume) against an auto-provisioned localnet, and inspect the [green CI runs](https://github.com/canton-cro/canton-cro/actions/workflows/localnet-drill.yml). This milestone carries zero execution risk for the committee and is presented as an accelerator: the committee funds a working tool, not a promise.

### Milestone 2: Production-grade recovery

- **Estimated Delivery:** approximately 8 weeks after grant approval.
- **Focus:** External party replication support, real Postgres backup and restore integration with an extended drill matrix, Splice localnet validation, Windows parity in CI, and a Canton version compatibility matrix.
- **Deliverables / Value Metrics:** An operator can rehearse recovery for the party types their users actually have (including external parties) and restore from a real database backup, not only from a snapshot file. All new scenarios run as repeatable CI drills with published evidence, in the same style as the existing run log.

### Milestone 3: Adoption and handover

- **Estimated Delivery:** approximately 8 weeks after Milestone 2.
- **Focus:** Independent operator adoption, packaging, and long-term stewardship.
- **Deliverables / Value Metrics:** At least 2 independent validator or node-as-a-service operators run a replication or recovery drill on their own infrastructure and confirm it publicly (issue or attestation in the repo). Operator feedback is triaged and addressed. The CLI is published as a package for standard installation. The team commits to 12 months of maintenance after the grant ends, tracking Canton minor releases through the version matrix in CI.

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Milestone 1: independent reviewer reproduction of both live drills and green CI on the main branch
- Milestone 2: external party and Postgres restore scenarios running as repeatable drills with published evidence, verified on Splice localnet and Windows
- Milestone 3: public confirmations from at least 2 independent operators who ran CRO on their own infrastructure, plus the published package and the written maintenance commitment

Acceptance is based on demonstrated operator value, not artifact delivery. "The drill passed on a third operator's infrastructure" counts. "Our own CI is green" alone does not.

---

## Funding

**Total Funding Request:** to be finalized with the confirmed champion during review.

The team deliberately defers the amount rather than anchoring a number before champion input. The request will be sized to Milestones 2 and 3 (Milestone 1 is already delivered) and split across milestones with the final tranche gated on the adoption criteria above. The band under discussion is well below the scale of recent infrastructure grants in this repository.

### Payment Breakdown by Milestone

- Milestone 1 (Foundation): share to be agreed with champion, upon committee acceptance of the delivered work
- Milestone 2 (Production-grade recovery): share to be agreed with champion, upon committee acceptance
- Milestone 3 (Adoption and handover): share to be agreed with champion, upon final release and acceptance

### Volatility Stipulation

Planned project duration is under 6 months. Should the timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones will be renegotiated to account for significant USD/CC price volatility.

---

## Co-Marketing

Upon release, the implementing entity will collaborate with the Foundation on:

- Announcement coordination
- A technical blog post on the recovery drill approach (the fault drill has already caught a real orchestration bug in our own resume logic, which makes a concrete story about why drills matter)
- Developer and operator promotion through the project site ([canton-cro.xyz](https://www.canton-cro.xyz)) and a demo video following the break-restore-resume cycle

---

## Motivation

Every organization that runs a participant faces the same two moments: migrating a party to new infrastructure, and recovering after a failure. Today both are manual console procedures. The proportion of the ecosystem that benefits is therefore not a niche: it is every current and future participant operator, and every institution whose compliance requirements include a tested disaster recovery procedure rather than an untested document.

Two concrete findings from building CRO illustrate the operational risk that motivates it:

- Memory-backed participants reject ACS import entirely (`IMPORT_ACS_ERROR`, "Use db persistence"). An operator discovers this at step 10 of a manual run. CRO preflight surfaces it before step 1. The finding and the exact error are recorded in the [run log](https://github.com/canton-cro/canton-cro/blob/main/docs/manual-baseline-run-log.md).
- Our own first recovery loop re-injected the fault it was recovering from, because resume read stale configuration. The fault drill caught it. Procedures that are never rehearsed fail in exactly this way, which is why the drill harness is part of the tool rather than an afterthought.

---

## Rationale

The default approach should be to extend what exists. Here there is nothing to extend: the Canton documentation provides the primitives and a manual runbook, and no orchestration layer for party-level recovery exists in the ecosystem or in Splice release notes. CRO builds directly on the documented commands rather than replacing anything.

Differentiation from adjacent proposals in this repository:

- **COOT (#433)** proposed a broad validator operations and observability toolkit. CRO is deliberately narrow: recovery orchestration only, no dashboards, no metrics stack, and it arrives with the core already working and proven rather than as a plan.
- **Canton Migration Lens (#34)** covers snapshot validation as a standalone check. CRO embeds validation inside an end-to-end orchestration with safe stop, diagnosis and resume, which is where validation actually pays off for an operator mid-procedure.
- **Decentralization Manager (#298, #530)** addresses threshold governance and membership lifecycle for decentralized parties. CRO addresses single party/participant disaster recovery. The two are neighbors and do not overlap.
- **Hard Domain Migration Platform (#294)** became unnecessary when Logical Synchronizer Upgrades landed. CRO deliberately targets the party level, where no equivalent protocol feature exists and the procedure remains manual.

Design decisions worth noting: the console-script adapter was chosen over a reimplemented gRPC client so that CRO stays exactly aligned with the documented commands (macro behavior included), and the fail-safe preflight default (unreachable environment means blocked apply) was chosen because a recovery tool that can be fooled by a dead environment is worse than no tool.
