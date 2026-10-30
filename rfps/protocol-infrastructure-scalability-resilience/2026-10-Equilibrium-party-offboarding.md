# Party Offboarding: offline ACS cleanup for departed parties

| Field | Value |
| :---- | :---- |
| Organization | Equilibrium ([equilibrium.co](https://equilibrium.co/)) |
| Author / Primary Contact | Olli Tiainen <olli@equilibrium.co> |
| Status | Draft |
| Created | 2026-10-26 |
| Updated | 2026-10-26 |
| Proposal Type | RFP-aligned |
| RFP / Roadmap Area | RFP 1: Enable frictionless party hosting |
| SIG | Party Portability & Data Resilience |
| Champion | Heslin Kim, Zenith ([@heslin-zenith](https://github.com/heslin-zenith)) |
| Total Funding Request | Up to 1,330,000 CC base across four milestones (580,000 CC engineering, 750,000 CC adoption priced per event); renewable maintenance at 60,000 CC per quarter, accepted separately and outside the base |
| Project Duration | ~2.5 months engineering (hard deadline at ~month 3); adoption window open for 9 months from Milestone 3 acceptance |
| RFP Maximum Amount / Duration | N/A. No maximum amount or duration is stated for RFP 1 in the published roadmap |
| Label | party-portability-data-resilience |

---

## Table of Contents

- [Abstract](#abstract)
- [Motivation](#motivation)
- [Specification](#specification)
  - [Objective](#objective)
  - [What ships](#what-ships)
  - [Reading contracts state](#reading-contracts-state)
  - [The purge rule](#the-purge-rule)
  - [Scope is per (party, node, synchronizer)](#scope-is-per-party-node-synchronizer)
  - [Preconditions](#preconditions)
  - [Deactivation and physical deletion](#deactivation-and-physical-deletion)
  - [The scope preview](#the-scope-preview)
  - [The offboarding receipt](#the-offboarding-receipt)
  - [Verifying a receipt](#verifying-a-receipt)
  - [The daemon's queue](#the-daemons-queue)
  - [Connecting to a node](#connecting-to-a-node)
- [Architectural alignment](#architectural-alignment)
- [Backward compatibility and open-source terms](#backward-compatibility-and-open-source-terms)
- [Milestones and Deliverables](#milestones-and-deliverables)
- [Acceptance Criteria](#acceptance-criteria)
- [Funding](#funding)
  - [Volatility](#volatility)
- [Maintenance and Sustainability](#maintenance-and-sustainability)
- [Adoption and Go-to-Market](#adoption-and-go-to-market)
- [Co-Marketing](#co-marketing)
- [Rationale](#rationale)
- [Why Equilibrium](#why-equilibrium)

## Abstract

When a party leaves a node, all its active contracts stay in the participant's
Active Contract Store. They cannot be pruned, even though the party can no longer
act on them.

Equilibrium proposes `canton-offboard`, an Apache-2.0 tool that cleans those
copies out of the ACS.

The tool is a command-line program with four subcommands:

- `scope` previews a run: it lists the departed party's active contracts and sorts them into what is safe to remove and what must stay
- `apply` re-checks those contracts during a maintenance window and deactivates the ones that are safe to remove
- `verify` re-checks a finished receipt against the node that produced it
- `daemon` watches for parties unhosting from the node and stages their cleanup

The tool's main audience is node operators. The intended workflow is to keep a
running daemon, which listens to topology transactions per synchronizer, runs
`scope` automatically on each unhosting, and captures the unhosting transaction.
The daemon stores a record for every party that left the node with active
contracts still behind. Alternatively, `scope` can be run by hand, case by case.

Then, during a maintenance break, an operator cleans up the stranded contracts by
running `apply`. `apply` checks the scoped preview, but reads the party's contracts
again to account for any topology changes since the preview, and decides from that
read which ones are safe to remove. It produces
a receipt listing the deactivated and retained contracts together with the
unhosting topology transaction, which carries the participant's and the party's
signatures, unless the unhosting was forced. That receipt can be fed into `verify`
so the operator can re-check everything, or handed to the party. An operator may also sign
the receipt as its own attestation.

`apply` only deactivates the contracts; the actual removal is done by pruning.
Once the node is back up, the contracts get pruned when they fall below the pruning
floor. An operator may also ask `apply` to prune right away: it computes the
smallest pruning target that removes those contracts within a safe pruning offset,
and prunes up to that height at once.

Only contracts where the departed party was the only stakeholder hosted on this
participant can be safely deactivated. If any other party hosted here still has
rights on a contract, it stays. Since the departed party is no longer hosted on
this participant, no one here can act on its contracts anymore. Other nodes
hosting that party stop exchanging ACS commitments for its contracts once the
unhosting topology transaction takes effect, so the network stays healthy.
For a party that shed all its rights and obligations before leaving,
the tool is effectively a no-op.

---

## Motivation

A party with existing rights and obligations should not off-board a participant node
without taking care of them first. This is best handled at the application layer,
since it requires case-by-case treatment, e.g. transferring ownership, or exercising
or removing the contracts.

If it is unhosted with contracts still active, those contracts will be stranded on the
given participant forever. The party can no longer interact with them, and the
participant can never prune them, because pruning only runs for archived contracts.
To prevent that, an attempt to unhost a party with active contracts returns the error
`TOPOLOGY_DISABLE_PARTY_WITH_ACTIVE_CONTRACTS`, unless it is explicitly forced with
`ForceFlags`.

If that was the party's only host, this may mean a loss of funds, or locking
multi-signatory contracts where the party is a stakeholder. However, if the party was
hosted on another participant with submission rights, it can still manage its
obligations from there. Departing from just one participant out of many means the
party likely still wants to keep all its contracts, which leaves that one participant
with unprunable and unusable contracts in its ACS forever.

Those leftover contracts can and should be deactivated with the `repair.purge` admin
command and later pruned. If they are not, then re-onboarding the party that left, or
any other party that shared a contract with it, may not work, due to ACS divergence.
The problem is that these are last-resort commands, "dangerous under normal
operation", and today nothing automates the steps for safe execution and stops when a
precondition fails. All the needed tools already exist, but are under-documented and
require caution.

While party onboarding and offline party replication get the full treatment,
offboarding gets left behind. `canton-offboard` is meant to correct that by providing
a safe way to perform offline party cleanup, to better support co-validation and
multi-hosting.

---

## Specification

### Objective

Ship and maintain a tool that removes a departed party's contract state from a
participant, per synchronizer, safely and repeatably, and that produces a receipt the
right audience can re-check.

### What ships

`canton-offboard` is a Rust binary and library built over the participant's admin and
ledger gRPC APIs. It has four subcommands.

**`scope`** reads the departed party's active contracts and previews a run. It sorts
the read into the copies that may be purged and the copies that must be retained, names
the reason each one is retained, and lists any contracts caught mid-reassignment as
diagnostics. `scope` is read-only and needs no downtime. Its output is a preview
for an operator to decide whether it wants to run `apply`.

**`apply`** is the one command that takes a maintenance window. It re-reads the departed
party's active contracts at the current ledger end, sorts them against current topology,
and deactivates the purgeable copies
with `repair.purge`. Physical deletion with `prune` is opt-in. It emits the
offboarding receipt that can be further shared with a party. It is idempotent and resumable:
a run interrupted mid-run can be restarted to reach the same end state.

**`verify`** re-checks a finished receipt against the participant that produced it. It is read
only, for an operator or auditor with node access, and needs no downtime.

**`daemon`** runs one instance per participant. It subscribes to the Ledger-API update
stream and, on each unhosting, runs `scope`, captures the unhosting topology transaction,
and parks a pending offboarding in a small durable local store for a human to review and
`apply`. It acts on `ParticipantAuthorizationRevoked` events only, ignoring permissions
changes from `ParticipantAuthorizationChanged`.

### Reading contracts state

`scope` and `apply` read the departed party's contracts through the Ledger-API
`GetActiveContracts`, filtered by the party, with the created-event blob included. The
response splits contracts into three buckets:

- `active_contract`: the contract is settled and active on this synchronizer. It is a
  purge or retain candidate.
- `incomplete_unassigned`: the contract has been unassigned and has left this
  synchronizer. It is not in the active set, so there is nothing to purge here. The tool
  records it as a diagnostic.
- `incomplete_assigned`: the contract is arriving from a reassignment. Once it settles, it
  also appears as `active_contract`, and the tool handles it there. On its own, it is never
  a purge target.

`GetActiveContracts` doesn't require the party to still be hosted. An operator with an admin
or read-as-any-party claim can read the departed party's contracts after it has unhosted.

`apply` takes this read at the current ledger end, so it is complete at apply time. A clean
unhost does not freeze the party's contract set: a party that left this node but is still
hosted elsewhere can co-sign a new contract there, and if a stakeholder still hosted here is
on it, that contract propagates back, and the read returns it. Such a contract always has a
local backer, so it can only be a retain, never a purge, but a preview-scoped re-check would
miss it. So `apply` treats the parked preview and the prior receipt as cross-checks, and the
head read as the source of truth.

We read through `GetActiveContracts` rather than the admin `export_acs` because
`export_acs` keeps only the settled-active case and silently drops the incomplete-
reassignment entries. A tool that read `export_acs` could not see a contract caught
mid-reassignment, and, as the next rule shows, such a contract must never be purged.

### The purge rule

> Purge a contract only if it appears in the `active_contract` stream
> and no stakeholder hosted on this node still backs it.

All three permissions, Submission, Confirmation, and Observation, place a full copy of the
contract in the node's active contracts set, so an observer still needs its copy. For this
reason, the departed party's own hostings are in scope for cleaning under any permission.

Keying the purge on `active_contract` presence is what keeps a mid-reassignment contract
safe. A contract that has been unassigned is no longer active on this synchronizer, so it
never appears in the `active_contract` stream and is never selected. This matters because
purging such a contract is not harmless. `repair.purge` on an already-unassigned contract
re-assigns it and then archives, which can later cause ACS commitment mismatches.

A contract that came from another synchronizer by reassignment can appear in both the
`active_contracts` stream and the `incomplete_assigned` stream. Only the former is taken
into account, the latter is just a diagnostic, so such a contract will be purged just once.

Incomplete entries are never purge targets. They are recorded for the operator, with their
reassignment id, source, target, and counter. A genuinely stuck in-transit reassignment is
resolved out of band: it completes on its own at the assignment-exclusivity timeout once a
participant still hosts a stakeholder on the target, or the operator rolls it back with
`repair.rollback_unassignment`. A later run then sees the contract either gone or settled
and active, and handles it by the rule above.

### Scope is per (party, node, synchronizer)

A run names which party is leaving which node, on which synchronizer. A party hosted on
several nodes can rotate off one of them while it stays live on the rest, so a run purges
only on the node named in the scope and leaves the party's copies on its other nodes
untouched. The active-contract set is held per participant and synchronizer, `repair.purge`
takes a synchronizer alias, and a stranded copy is stranded on one specific synchronizer.
`daemon` watches topology changes on each synchronizer the node is connected to
and maintains records per each.

### Preconditions

`apply` enforces four preconditions before it mutates.

| Precondition | What it reads | Stops when |
| --- | --- | --- |
| `disconnected` | the participant's connection status for the synchronizer | the participant is connected |
| `inflight_requests` | the participant's status for the synchronizer | any request is inflight |
| `unhosting_effective` | the `PartyToParticipant` mapping for the party on this node | the unhosting is not yet effective, so the party still backs its own copies and nothing is purgeable |
| `index_drained` | the Ledger-API ledger end against the ACS head | the indexer has not caught up, so an `active_contract` read could disagree with the ACS |

`disconnected` and `inflight_requests` are `repair.purge`'s own requirements: it rejects the
call while any synchronizer is still connected, and it refuses while the repair record time has
not cleared the inflight-request watermark. `repair.purge` also needs repair commands enabled
through `features.enable-repair-commands`, so `apply` enables them for the window and disables
them again once the call returns. Ideally, `manualConnect` should be set to `true` so that the
node doesn't attempt to reconnect during maintenance break, but `repair.purge` and connecting
are sequenced, so at the worst case, `apply` will stop at precondition not met.

`index_drained` is required because while `repair.purge` operates on the ACS directly, the
tool uses `GetActiveContracts`. The latter goes through the ledger index, which can lag slightly
behind the ACS. To make both synchronized, the index must catch up with the ACS.
Otherwise a committed but not-yet-indexed unassign could still read as `active_contract`
while the ACS already says the contract has left, leading to purging a contract in
`incomplete_unassigned` state.

### Deactivation and physical deletion

Deletion has two layers, and the tool keeps them apart.

Deactivation is local. `repair.purge` marks a copy inactive and allows it to be pruned,
but it doesn't delete it physically. Pruning removes the rows for the whole node, so it
is not triggered by default. When the operator opts in, `apply` computes the smallest
`prune_up_to` offset that just covers the purge and prunes no further.

### The scope preview

`scope` writes its preview as a partition of the read:

```json
{
  "party": "alice::1220ab9f2c3d4e5f…",
  "node": "participant2::1220e4f0a1b2c3…",
  "synchronizer": "global",
  "unhosting_effective": true,
  "active_at_offset": 918100,
  "active_contract_count": 417,
  "purge": ["00a1b2c3", "00c3d4e5"],
  "purge_count": 412,
  "retain": [
    {
      "contract_id": "00ff0011",
      "backed_by": [
        { "party": "carol::1220cd88a1…", "permission": "Observation" }
      ]
    }
  ],
  "retain_count": 5,
  "incomplete_reassignments": [
    {
      "contract_id": "00dd2200",
      "entry": "incomplete_unassigned",
      "source": "global",
      "target": "global2",
      "reassignment_counter": 4
    }
  ]
}
```

Each `retain` entry names every locally hosted stakeholder that backs the contract, with its
permission, so the keep decision is auditable. Each `incomplete_reassignments` entry is a
diagnostic and never a purge target.

The party may separately capture its own active contracts through `GetActiveContracts` while it
is still hosted, and keep that capture as erasure evidence. Contract ids are global, so the same
contract carries the same id on every node, and the party can later compare its capture against
the receipt's `purged` and `retained` id lists to confirm which contracts were removed. This
capture is optional and party-side, and it is never one of the tool's commands.

### The offboarding receipt

`apply` emits the offboarding receipt:

```json
{
  "party": "alice::1220ab9f2c3d4e5f…",
  "node": "participant2::1220e4f0a1b2c3…",
  "synchronizer": "global",
  "unhosting": {
    "mapping": "PartyToParticipant",
    "serial": 7,
    "effective_at": "2026-09-14T10:22:31Z",
    "initiated_by": "party_and_operator",
    "party_signed": true
  },
  "active_at_offset": 918100,
  "active_contract_count": 417,
  "result": {
    "purged": ["00a1b2c3", "00c3d4e5", "00e5f6a7"],
    "retained": [
      {
        "contract_id": "00ff0011",
        "backed_by": [
          { "party": "carol::1220cd88a1…", "permission": "Observation" }
        ]
      }
    ],
    "incomplete_reassignments": [
      {
        "contract_id": "00dd2200",
        "entry": "incomplete_unassigned",
        "source": "global",
        "target": "global2",
        "reassignment_counter": 4
      }
    ],
    "pruned_to_offset": null
  }
}
```

The receipt has two audiences. The `unhosting` block is the anchor the party checks on its own: it
co-signed that topology transaction, so it confirms the anchor offline with its own key and, if it
kept one, compares its own capture against the `purged` and `retained` id lists. The `result` is what
anyone with node access re-checks, which is what `verify` does.

The `result` records the end state of the party's local copies. `purged` lists the sole-local
copies that are gone at the end of the run, whether this run archived them or a prior one did.
`retained` lists the copies still present because another locally hosted stakeholder backs them.
`incomplete_reassignments` records the mid-reassignment copies left for later. Anchoring `purged`
on what is absent at the end, not on what this one invocation touched, is what lets a re-run
reproduce the same lists.

A forced offboarding is the case where the participant unhosts the party on its own, with no party
signature. Only the `unhosting` block changes: `party_signed` is false and `initiated_by` is
`participant`.

```json
{
  "unhosting": {
    "mapping": "PartyToParticipant",
    "serial": 7,
    "effective_at": "2026-09-14T10:22:31Z",
    "initiated_by": "participant",
    "party_signed": false
  }
}
```

The rest of the receipt is unchanged: the node still did the work and can still re-check the
`result`.

### Verifying a receipt

`canton-offboard verify` first confirms the node's id with the one from the receipt. It then
reads the participant's current active set for the party and its topology, and checks the receipt
against them. It confirms the end state: every `purged` id is no longer active, every `retained`
id is still active and still backed by a locally hosted stakeholder, and the `unhosting` anchor
matches the signed topology transaction:

```bash
$ canton-offboard verify --receipt offboarding-receipt.json --config canton.conf --participant participant2
node                      participant2::1220e4f0a1b2c3…  ok (matches receipt)
unhosting                 PartyToParticipant serial 7, effective 2026-09-14T10:22:31Z  ok (initiated_by=party_and_operator, party_signed=true)
purged                    412 ids  ok (absent for alice on participant2)
retained                    5 ids  ok (each still backed by a locally hosted stakeholder)
incomplete_reassignments    1      diagnostic (reproducible only as-of offset 918100)
verdict: ok
```

A party that was off-boarded from the node is no longer allowed to list its contracts on it.
It can only check the `unhosting` topology transaction and compare the receipt's `purged` and
`retained` lists versus its own `GetActiveContracts` capture if it kept one. It has to trust
the participant that contracts were removed, it cannot run `verify` to ensure that.

### The daemon's queue

One daemon runs per participant. On each `ParticipantAuthorizationRevoked` event it runs `scope`,
captures the unhosting transaction, and parks a scoped, pending offboarding in a small durable local
store, keyed by the topology update id, so a restart replays idempotently and resumes where it
stopped. The parked offboardings are listable and inspectable, and `apply` selects one off that queue.
Nothing is deleted until an operator picks it up.

### Connecting to a node

`scope`, `apply`, `verify`, and `daemon` all reach a participant over its admin-API and
ledger-API gRPC endpoints, each with its own TLS and auth. The operator supplies the
connection one of two mutually exclusive ways:

- **From a config.** `--config <file>` points at the operator's Canton HOCON config, the same
  `-c` the console takes and repeatable the same way, and `--participant <name>` picks that
  participant out of it by name. The endpoints, TLS, and auth all come from the config. This is
  the path for an operator who already runs the node from a Canton config.
- **From endpoint flags.** `--admin-endpoint <host:port>` and `--ledger-endpoint <host:port>`
  name the two APIs directly, each with its own `--admin-tls-ca` / `--ledger-tls-ca` (plus a
  client cert and key for mutual TLS) and, for the ledger API, `--ledger-token <file>`.

---

## Architectural alignment

Operators host parties for other people, and in that model membership rotates over a party's life. The
multi-hosted topology is what strands state. Five North, which built the Loop wallet before the two
became separate brands, [said on 2026-07-22](https://forum.canton.network/t/8988) that "Loop is the
first and only wallet on Canton where every participant is onboarded not just to 5N, but simultaneously
to two co-validator nodes." Every customer migration or co-validator rotation in that shape leaves a
node holding contracts for a party it no longer hosts. Three roles there each use a different part of
this deliverable: the operator running the nodes runs the cleanup, the Loop wallet uses the receipt to
tell a user that the old node is clear, and a custody partner like MPCH keeps that receipt as proof.

The trend runs the same way.
[CIP-0120](https://github.com/canton-foundation/cips/blob/main/cip-0120/cip-0120.md), a proposed Canton
improvement titled "Traffic-Based Validator Rewards and Confirming Validator Incentives", would reward
validators for confirming-only hosting, aiming at a network where more than 90% of transactions run
between multi-hosted parties. It is not adopted yet, but in that topology every change of host is an
offboarding event.

Three dev-fund efforts already sit next to this work, and each stops at the cleanup boundary:

- **Digital Asset's Party Mobility** (`#810`, Phase 1: Online Party Replication) supports online party
  replication to other nodes, with its replication Ledger API shipping Early Access then general
  availability behind a feature flag (admin command `get_remote_acs`). It mentions protocol-level party
  offboarding but defers it to Phase 2; with Phase 1 estimated at 16 months, that is a long way to go.
- **BitSafe's Decentralization Manager** (`#530`, approved 2026-07-29 at 13,040,000 CC) delivers
  multi-host external-party onboarding with remove-member as a first-class operation and "a unilateral,
  audited unhosting path for compliance", and states that "ACS cleanup - purging the party's contract
  state from the departing node - is out of scope for this milestone".
- **Canton CRO** (`#573`, open) orchestrates the documented party replication procedure and "does not
  attempt party offboarding".

Unhosting a party and cleaning up after it are different steps. Digital Asset owns the protocol path and
the Decentralization Manager owns the unhosting path; this proposal is the cleanup, and the offboarding
receipt is consumable by either an unhosting path or a replication flow. It changes no interface and no
protocol: it sequences admin-API and ledger-API commands Canton already ships, with `repair.purge` to
deactivate the local copy and `prune` to physically delete it node-wide. Until protocol-level offboarding
lands, this gives operators a clean offline procedure.

---

## Backward compatibility and open-source terms

There are no interface changes, so there is no compatibility surface to break. The offboarding receipt is
additive and separately versioned: a published field is never repurposed, and a schema change lands as a
new version with the prior one kept. `canton-offboard` and the receipt schema are Apache-2.0, in public
repositories from the first commit.

---

## Milestones and Deliverables

Dates run from grant approval. A single developer executes Milestones 1 through 3, checked against
published artifacts run in public CI against LocalNet's three participants. Milestone 4 pays for
independent adoption. The three engineering milestones follow the three paths: Milestone 1 builds the
read path, Milestone 2 the mutate path, Milestone 3 the proof path. The daemon is engineering-funded
inside Milestone 1's read path.

### Milestone 1: Read path (230,000 CC)

**Estimated delivery:** week 4. **Hard deadline:** week 5. **Effort:** ~20 person-days.

Ships: `scope` with contracts selection, the `daemon` observe-and-park loop, the reviewable
parked-offboarding queue `apply` draws from, and a pruning-safety status read (`GetSafePruningOffset`).

| Drill | Passes when |
| --- | --- |
| Observer-backed retention | a copy an observer-only local stakeholder still backs lands in `retain`, never `purge` |
| Partial rotation | removing a multi-hosted party from one node leaves its copies on the nodes that still host it untouched |
| Inert departed | a cleanly departed party's leftover copy drops out of commitment computation and stalls nothing |
| Incomplete reassignment | a contract caught mid-reassignment to another synchronizer is recorded as a diagnostic, never placed in `purge` |
| Daemon park | a `ParticipantAuthorizationRevoked` event parks a scoped, pending offboarding for a human to `apply` |


### Milestone 2: Mutate path (175,000 CC)

**Estimated delivery:** week 7. **Hard deadline:** week 9. **Effort:** ~15 person-days.

Ships: `apply`, which enforces its four preconditions in the operator's maintenance window and deactivates
purgeable copies with `repair.purge`; opt-in `prune` to the smallest `prune_up_to` offset a
`GetSafePruningOffset` read certifies safe; and an off-by-default, operator-authorized escalation flag for a
dark counterparty.

| Drill | Passes when |
| --- | --- |
| Index-drain safety | with the synchronizer disconnected, `apply` confirms the ledger end reflects every committed ACS change before trusting the read, and a just-unassigned contract is absent from it before any purge |
| In-transit never purged | a reassigned-away contract never appears in `active_contract`, so `apply` never selects it, and `repair.purge` never reassigns and archives it |
| Prune stall deferred | a dark-but-active counterparty holds back commitments and `GetSafePruningOffset` returns no safe offset, `apply` flags that; a re-run finishes once it clears |
| Interrupted and resumable | a run interrupted mid-window resumes cleanly and achieves the same end state; a re-run of a completed `apply`, given its receipt, is a no-op that reproduces it |

### Milestone 3: Proof path (175,000 CC)

**Estimated delivery:** week 10. **Hard deadline:** week 13. **Effort:** ~15 person-days.

Ships: the offboarding receipt (the `unhosting` anchor the party checks, plus the `result`
anyone with node access re-checks) and `verify`. An operator may sign the receipt; signing is not a function
of the tool, and the tool manages no keys.

| Drill | Passes when |
| --- | --- |
| Forced offboarding | a participant-initiated unhosting with no party signature yields a receipt whose `unhosting` block is marked participant-initiated and unsigned |

### Milestone 4: Independent operator adoption (750,000 CC)

**Opens:** on Milestone 3 acceptance. **Window:** 9 months. The window opens at
acceptance rather than approval because adoption is only observable once the deliverable is accepted.

- **The adoption bar.** One adoption event is a distinct organization outside Equilibrium publishing an
  offboarding receipt that `canton-offboard` produced against a node it runs, for its own party set.
  A non-production topology is enough, a production run counts the same.
- **Priced per event, floor of one.** One qualifying organization is the floor; each further one pays at the
  same rate, to five in total, and an organization counts once however many nodes it runs. Partial adoption pays
  partially.
- **Verification.** The evidence is the operator's own published offboarding receipt. An operator that ran the
  tool but will not publish it can confirm privately to the Foundation instead.

---

## Acceptance Criteria

One check per criterion, each with its own denominator.

| Milestone | Criterion | Check |
| --- | --- | --- |
| 1 | The scope partition is complete | Every contract `GetActiveContracts` lists as `active_contract` for the departing party appears in the `scope` partition exactly once, as a `purge` target or as a `retain` entry naming every locally hosted stakeholder and permission that backs it |
| 1 | Incomplete reassignments are classified, not purged | A contract caught mid-reassignment is listed in `incomplete_reassignments` as a diagnostic and never appears in `purge` |
| 1 | The daemon parks without deleting | The `daemon` runs `scope` and captures the unhosting transaction on a `ParticipantAuthorizationRevoked` event, and leaves a scoped, pending entry in the queue that nothing deletes until `apply` selects it |
| 2 | Deactivation is idempotent | Given its prior receipt and no further activity on the party's contracts, re-running a completed `apply` issues no new `repair.purge` and reproduces the same `purged` and `retained` lists: every purged id is confirmed absent, and the current active set still equals `retained` |
| 2 | An in-transit contract is never purged | A reassigned-away contract is absent from the `active_contract` read, so `apply` never selects it, and `repair.purge` never reassigns and archives it |
| 2 | A pruning stall is deferred, not waived | When `GetSafePruningOffset` reports no safe offset, `apply` leaves the physical deletion unfinished rather than waiving the commitment wait, and a re-run finishes once the operator clears it |
| 2 | The preconditions are enforced | Each of the 4 preconditions `apply` enforces has a test that makes it fail and shows the run stopping |
| 3 | The receipt is verifiable | `canton-offboard verify` confirms a committed receipt against the node the receipt names: every `purged` id absent, every `retained` id present and still locally backed, and the `unhosting` anchor matching the signed topology transaction |
| 3 | A forced offboarding is recorded faithfully | A participant-initiated unhosting produces a receipt whose `unhosting` block is marked participant-initiated and unsigned by the party, with `result` and the topology anchor equally verifiable |
| 4 | Independent adoption | At least 1 organization outside Equilibrium publishes an offboarding receipt `canton-offboard` produced against a node it runs, for its own party set |
| 4 | Breadth premium | Each additional organization beyond the first, to a total of 5, publishing a receipt |

Milestones 1 to 3 are committable at filing: each criterion is satisfied by an artifact we produce, on a
topology we run, with no third party in the path. Milestone 4's criteria are not, by design, which is why its
payment is priced per event.

---

## Funding

1,330,000 CC in total. Engineering is 580,000 CC across the three delivery milestones. Adoption is 750,000 CC
for Milestone 4.

| Milestone | Share | CC |
| --- | --- | --- |
| 1 | ~17.3% | 230,000 |
| 2 | ~13.2% | 175,000 |
| 3 | ~13.2% | 175,000 |
| 4 | ~56.4% | 750,000, at 150,000 CC per operator publishing an offboarding receipt, five in total |

Adoption (Milestone 4) carries the larger share of the envelope, 750,000 CC against 580,000 CC for engineering.
Adoption is the real value signal for a public-good tool, which is why it carries the majority. Milestone 4 is
priced per event with a floor of one, so the weighting is not all-or-nothing: each operator that publishes a
receipt pays 150,000 CC on its own.

### Volatility

Engineering is scoped at about two and a half months, with a hard deadline at month three. The adoption milestone opens at
Milestone 3 acceptance and pays per qualified organization over a nine-month window. Should the engineering
timeline extend beyond six months due to Committee-requested scope changes, any remaining milestones will be
renegotiated to account for USD/CC price volatility. Milestone 4 and Maintenance run beyond six months: their
amounts are denominated in Canton Coin against the CC/USD reference price stated at approval, and re-evaluated
at each payment.

---

## Maintenance and Sustainability

Maintenance is a renewable quarterly unit at 60,000 CC per quarter, covering up to 10 person-days, starting
after Milestone 3 and renewed quarter on quarter. CIP-0100 provides for a maintenance milestone that applies
quarter on quarter after initial delivery. This sits outside the 1,330,000 CC above.

Per quarter: a version-compatibility matrix in CI across the Canton minor releases Digital Asset maintains,
published as our own list of the versions `canton-offboard` is tested against, because repair-command
signatures, their preconditions, the `GetActiveContracts` response format, and the Ledger-API
update-stream and topology-event format the daemon depends on all move between releases; tracking changes to
the pruning and commitment-waiting configuration; keeping the gates aligned with the topology rejections Canton
adds; and security patching and releases.

---

## Adoption and Go-to-Market

Distribution is a released binary plus a library, with the receipt schema as a plain versioned file an operator
can read with a JSON parser and no dependency on us.

An operator adopts alone. The node losing a hosting cleans its own state on its own node. The `daemon` can be
left running to watch for unhosting events and stage each cleanup, or run `scope` and `apply` by hand. Either
path ends in a per-party receipt.

We will publish the drill receipts and the runbook under our own name, link the Foundation as the funder, and
welcome the Foundation to republish any of it. We will present the tool in the relevant SIG channel and on the
forum threads where operators report this condition, because a receipt that a departed node no longer holds a
customer's state is the kind of artifact an operator can show a customer.

---

## Co-Marketing

Upon release, Equilibrium will collaborate with the Foundation on:

- **Announcement coordination.** A release announcement timed and cross-linked with the
  Foundation, naming the tool and the Foundation as its funder.
- **Case study or technical blog.** One technical write-up of the offboarding procedure and
  the receipt, worked against LocalNet, which the Foundation is welcome to republish.
- **Operator promotion.** A walkthrough for node operators who hit this condition, presented
  to the Party Portability & Data Resilience SIG.

---

## Rationale

A Digital Asset engineer's [guidance on the Canton forum](https://forum.canton.network/t/deleting-a-party-with-existing-contracts-on-the-ledger/5943)
is that offboarding is best done "at the application level, where the semantics of the contract
ownership are well-known". While the party is still hosted, that is the right place
for it. The party can act on its own contracts through its application, and the application knows what each
contract means. Offboarding from a one of many nodes however means that the party wants to keep its contracts
and still use them, it just no longer does it from that one node. The contracts copies stay active, in node's
storage, and aren't subject to pruning.

Whether to remove the leftover state is the operator's decision, taken under a driver: a data-minimization or
erasure request, storage pressure, or giving a departing customer confirmation that its old node is clear.
Keeping the state is an equally valid choice. An operator under a legal hold keeps it, and it does no harm. The
tool makes removal safe and attestable when the operator chooses it, and leaves the choice itself to the operator.

Keeping the state is harmless while the party stays unhosted here, but re-onboarding the same party on this node
isn't necessarily safe. With no party hosted, the node no longer receives updates related to it. When the node
restarts exchanging ACS commitments about the same party, any contract that was archived or reassigned elsewhere
during the gap now disagrees with the network. The party's ACS import cannot clear it, because import only adds
contracts and never removes the stale ones.

---

## Why Equilibrium

Equilibrium builds, secures, and funds verifiable systems for finance and AI. We're a global team of 30 engineers,
cryptographers and economists ([company team page](https://equilibrium.co/who-we-are)).

Relevant previous work includes:

- **Canton and Daml engineering.** We are building a proof-of-concept SVM execution layer on Canton for Zenith,
  mapping Solana's account and runtime model onto Canton. We also maintain
  [awesome-daml](https://github.com/equilibriumco/awesome-daml/), an openly licensed guide to Daml and the
  Canton developer ecosystem.
- **Node specification and protocol testing.** With Ziggurat, our P2P network-testing framework, we've
  reverse-engineered the network layers of Solana, Zcash [(write-up)](https://forum.zcashcommunity.com/t/ziggurat-3-0/43350/46),
  XRP [(blog)](https://xrpl.org/blog/2022/ziggurat) and Algorand into a published specification
  (e.g. [Solana's spec](https://github.com/solana-foundation/specs/blob/main/gossip/gossip-protocol-spec.md))
  and automated test catalogue.
- **Production node engineering and operation.** We built and long maintained [Pathfinder](https://github.com/software-mansion/pathfinder),
  the open-source Rust full node for Starknet. We are long-standing contributors to
  [snarkOS](https://github.com/ProvableHQ/snarkOS), Aleo's P2P node software and consensus, and
  [snarkVM](https://github.com/ProvableHQ/snarkVM), its zkVM, alongside Aleo's core engineering team.
  We also operate our own Aleo validator, with publicly verifiable uptime
  ([explorer](https://aleoscan.io/address?a=aleo1cxk6pkrucemg7fmxhhrxymus9vnr00mtmgzvx95nkcwpdj5qhsrswgdgfr)).
  Other node infrastructure work includes [Lumina](https://github.com/celestiaorg/lumina), the Rust Celestia light node,
  [Strawberry](https://github.com/eigerco/strawberry), a full Go implementation of the Polkadot JAM protocol,
  [zkSync state reconstruction](https://github.com/equilibriumco/zksync-state-reconstruct) tooling,
  which rebuilds zkSync Era state from Ethereum L1 data and verifies it against on-chain commitments.
- **Regulated finance engineering.** We incubated and provided engineering for Membrane Finance, acquired by
  Paxos in 2025, the company behind [EUROe](https://euroe.com), the first EU-regulated euro stablecoin.
