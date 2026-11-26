# Development Fund Proposal: FRED, Daml Development Reload

**Organization:** [LimeChain](https://limechain.tech)<br>
**Authors / Primary Contacts:** Georgi Radev ([georgi.radev@limechain.tech](mailto:georgi.radev@limechain.tech)), Ivaylo Bakalov, Veselin Mihaylov<br>
**Status:** Submitted<br>
**Created:** 2026-09-14<br>
**Proposal Type:** RFP-aligned<br>
**RFP / Roadmap Area:** Developer Experience, Tooling & Education. RFP 19 (DPM Components and Extension Ecosystem), secondary RFP 18 (Integration into SDLCs)<br>
**Champion:** Curtis Hrischuk, Digital Asset ([hrischuk-da](https://github.com/hrischuk-da))<br>
**Total Funding Request:** 4,000,000 Canton Coin (CC)<br>
**Project Duration:** ~29 weeks of development, a six-month adoption window after M4 and a 12-month maintenance term starting at M4 acceptance<br>
**Label:** daml-tooling<br>

## Abstract

In a developer’s local code-test-debug loop, a breaking change to their model, such as changing a field's type, forces a restart of the developer’s network: the sandbox, or every node of a multi-node setup such as LocalNet. On LocalNet that restart takes close to two minutes before onboarding and setup can even begin. We propose Fast Reload of Evolving DARs (Fred), a DPM component that replaces the restart with an in-place reload while the nodes keep running. On a single sandbox participant Fred archives the affected contracts. On several nodes, such as an app-provider node and an app-user node, Fred runs a coordinated sequence: it pauses new confirmation requests on each synchronizer, waits for in-flight transactions to resolve, removes the old contracts on every hosting node with the participant repair service, swaps the vetted package set in one topology transaction per node and synchronizer, restores the rate and reruns setup. Contracts are recreated, so contract IDs change. Fred ships first as a CLI command, then as a supervisor like Vite’s dev server. Fred is open source, licensed under Apache-2.0 in a public Git repository. We proved both sequences on stock Canton 3.5.12 and on CN QuickStart LocalNet with no Canton change and no force flag, and published a log for every claim: on LocalNet the reload takes 37 seconds against 110 seconds for a restart.

## Motivation

The code-test-debug cycle is where Daml developers spend their time, and when the code changes, the corresponding contracts need to be updated. Today a breaking change means tearing the environment down and starting it again. On a single sandbox that is tens of seconds; on LocalNet, the multi-node environment CN QuickStart runs on, it is minutes of startup, several gigabytes of memory and a reset that only works by removing volumes, followed by onboarding and setup again. The session is awkward too: `dpm sandbox` holds a terminal, so a developer backgrounds it and loses its output. Fred's value is that nothing restarts. Setup scripts should look parties up and allocate them only when missing (find-or-create), so they work the same way after a reload or a restart.

The Foundation's [2026 developer-experience survey](https://forum.canton.network/t/canton-network-developer-experience-and-tooling-survey-analysis-2026/8412) says that: 41% of respondents named environment setup and node operations as the task that took them the longest.

Our prototype measured both cases, as the median of ten alternating trials from a clean state, each ending with the new version's test contracts in place:

| Environment | Reload | Restart | Saving |
|---|---|---|---|
| Single sandbox participant (archive) | 19 s | 31 s | 40% |
| CN QuickStart LocalNet, two app nodes, default synchronizer timeouts (30 s / 30 s) | 88 s | 110 s | 20% |
| CN QuickStart LocalNet, two app nodes, development timeouts (5 s / 5 s) | 37 s | 110 s | 66% |

On several nodes the reload's cost is almost entirely the wait for in-flight transactions to resolve, which is bounded by the synchronizer's confirmation and mediator timeouts. Fred therefore sets short timeouts on the development networks it manages. On a bare two-node Canton topology, which restarts in about 18 seconds, the coordinated reload is slower than a restart; that is the case where the restart is cheap, and we do not claim a saving there. Each prototype reload also starts a Canton console JVM (about 8 seconds on LocalNet) that the component, holding its own connection, will not pay. The appendix maps every claim in this proposal to the log behind it.

## Rationale

The standalone command is developed first and the supervisor builds on that. The supervisor is what makes it an autonomous development loop.

FRED will support the three operating systems used for development. Developers work on Windows, macOS and Linux, so Fred has to run on all three. To support this, a new dpm component provides the functionality with nothing else to install.

The loop we target is develop Daml, test it with Daml Script, and keep the applications that talk to the ledger (backends, UIs and PQS) running across the change, on a single sandbox and on multi-node development networks such as LocalNet with an app-provider node, an app-user node and one or more synchronizers.

**The autonomous developer loop we are aiming at:**

1. The developer starts Fred.
2. Fred reads `daml.yaml` and `multi-package.yaml` to find every DAR dependency and where it lives.
3. Fred starts the development topology (or attaches to one the developer runs) and runs the Daml Script that configures it.
4. Fred uploads the relevant DARs and vets them on every node and every synchronizer those nodes are connected to.
5. The developer tests, debugs, changes code and rebuilds.
6. Fred detects that all the DARs compile successfully and at least one has changed, and waits until no further changes arrive for a short debounce period. If the code changes again while Fred is in steps 7–9, Fred completes the current update and then repeats from step 6 with the latest DARs.
7. Fred removes the contracts on the old package: by archiving them on a single participant, or by a coordinated purge on every hosting node when there are several.
8. Fred replaces the old package with the new one in one topology transaction per node and synchronizer, unvetting and vetting together.
9. Fred or the developer reruns the test setup Daml Script.
10. Cycle back to step 5.

## Specification

### 1. Objective

By the end of this grant a Daml developer will work through breaking model changes without restarting anything, on a single sandbox or on a multi-node development network. Nodes, users and connections stay up across every reload, so connected applications keep working. It runs on Windows, macOS and Linux and installs with `dpm add component`.

The reload sequence is proven and needs nothing from Canton.

### 2. Implementation Mechanics

**On a single participant** the reload is four steps:

1. Archive the contracts of the changed packages, using the signatory authority the developer holds because they allocated the parties.
1. Upload the rebuilt DAR unvetted.
1. Remove the old package IDs and add the new ones in one topology transaction per connected synchronizer, each against that synchronizer's store.
1. Run setup, the project's own Daml Script that recreates the contracts the developer tests against on the new packages. Setup must be idempotent: it finds its parties and allocates only those that are missing.

**On several nodes** archiving does not work, because the signatories of a shared contract are hosted on different participants and no single submission can act for all of them (we reproduced this as `NO_SYNCHRONIZER_ON_WHICH_ALL_SUBMITTERS_CAN_SUBMIT`). Removing contracts on one node only is not an option either: the nodes' ACS commitments then disagree, which we reproduced on bare Canton and on LocalNet. Fred therefore removes the contracts on every hosting node in a coordinated sequence:

1. Upload the rebuilt DAR unvetted on every node.
1. Record the synchronizers' current `confirmationRequestsMaxRate` in a durable checkpoint, then set it to 0 on every synchronizer. New transactions are rejected at the sequencer; transactions already accepted continue.
1. Wait out the drain bound, the synchronizer's confirmation response timeout plus its mediator reaction timeout plus a margin, then check that the active contract set is stable. Every accepted request has then either committed or timed out. Ledger end is not a usable signal, because it keeps advancing at rate 0.
1. On each node in turn: disconnect from every synchronizer, purge the old-package contracts with `repair.purge`, reconnect. Purge requires that the node is disconnected from all synchronizers and that it uses database storage.
1. Swap the vetted packages on every node and synchronizer, one topology transaction each. Topology changes are not rate-limited, so this runs inside the quiet window.
1. Restore the recorded rate and run setup.

Changing the rate needs the synchronizer owner's authority. On a sandbox Fred starts that is Fred itself; on LocalNet it is the super-validator participant, whose admin API is open on LocalNet. Fred never changes a synchronizer it has no owner rights on, so it refuses DevNet, TestNet and shared synchronizers. On LocalNet the Splice applications' own automation is rejected while the rate is 0 and retries afterwards; with development timeouts the window is about 25 seconds and nothing was rejected in our runs.

On each synchronizer, step 3 has to be one transaction to avoid a `KNOWN_PACKAGE_VERSION` error. Doing both at once avoids that, and is why no force flag is needed. If you do this manually, there are three ways to get it wrong, and none of them throws an error. You just end up in a bad state.

The first is the sneakiest: the topology call can succeed without doing anything. By default, it targets a store where the change is computed against an empty set, so it writes a first entry there, never touches the synchronizer, and reports success anyway. Fred targets the synchronizer store explicitly and then checks that the serial actually advanced.

The other two come down to ordering. On a single participant the old contracts have to be archived before the swap, because once the old package is unvetted, no choice that includes Archive can be exercised, and those contracts are stranded for good. Purge does not exercise a choice, so the coordinated sequence does not depend on this ordering. Fred keeps a copy of the old build on disk and replaces it only after a reload has verified.

**Multiple synchronizers.** Package vetting is per synchronizer, so Fred uploads unvetted and vets explicitly on each connected synchronizer. Swaps run one at a time so Fred can verify the serial and record progress after each one.

Until a synchronizer is swapped, the old package remains usable there, so new contracts can still be created against it. Fred therefore runs nothing between swaps, repeats the no-old-contracts check before each one, and runs setup only after all swaps complete. If an affected contract is mid-reassignment, Fred completes the reassignment before archiving to avoid stranding it on a synchronizer where the package is no longer vetted.

Progress is tracked per node and per synchronizer in a checkpoint on disk, so interrupted reloads resume where they left off. The checkpoint also holds the original rate, so a crash while the network is paused never leaves it paused: the next run restores the rate first. We tested this on Canton 3.5.12 with one participant on two synchronizers, and the coordinated sequence with two participants on two synchronizers and on LocalNet, with no force flag; see the appendix.

**The hooks**. Fred cannot know what test data to recreate after a reload, or, on a single participant, how to archive a project's contracts. That is project specific, so each project provides Daml Scripts in a configuration file at its root. A hook is simply a point where Fred stops and runs one of those scripts.

- `discover` (optional) narrows the contracts in scope; by default Fred finds them itself by querying the active contracts on the old package IDs.
- `archive` archives them on a single participant, acting as their signatories. It is not needed on several nodes, where Fred purges.
- `setup` recreates the working state after the swap, finding or creating its parties.
- `verify` is an optional postcondition, checked before Fred replaces its saved copy of the old build.

These are Daml Scripts rather than plugin code because the project already has a script package, and on a single participant that package already has the signatory authority archiving depends on. The script package also stays out of the vetting set because `dpm script --upload-dar` defaults to false, so it is never part of the closure being swapped. In the future, Fred can further automate this to reduce the need for these scripts but that is a different grant proposal.

Fred never infers a migration. If the new schema needs data the old shape cannot supply, that is setup's problem and the developer's decision.

The design note linked in the appendix specifies the hooks in full.

The dpm command `fred reload` performs the reload once and exits, against a sandbox or a multi-node network the developer started. It is what Milestone 1 delivers, and it stays available whenever Fred does not own the participant.

**The supervisor `fred`** runs for the length of a session:

1. Starts the sandbox or the multi-node development topology.
1. Runs setup.
1. Watches the DARs for changes.
1. Classifies each change with `dpm upgrade-check` before touching the ledger.
1. On a compatible change, uploads and vets the new DAR. Existing contracts are kept.
1. On a breaking change, applies the removal policy and then runs the same sequence as fred reload.

The removal policy decides what happens at step 6, and is set on the command line or in project configuration:

- `fred --on-change confirm` is the default. It asks before removing contracts.
- `fred --on-change notify` reports the change and waits.
- `fred --on-change auto` runs without prompting.

Both paths read the same baseline.

To support reloading in projects that use PQS as their query side (CQRS), this approach needs to be extended to PQS. PQS indexes the ledger into Postgres so developers can query it with SQL. On a breaking change, Fred archives or purges the old contracts and PQS records them as archived history; we checked that a purge reaches PQS as an archive. Fred then prunes that history with PQS's own prune function, up to the last archive, while PQS keeps running. Live contracts are untouched. On an SCU-compatible change, nothing is archived, so nothing is pruned: PQS loads the new version by itself and old contracts stay readable under their original version. Recreating the PQS database is part of a reset only.

A reload disturbs it in two ways.

The first is history. A re-ingest replays transactions that reference the old package. After the old DAR is removed, the participant still serves those events, but PQS can no longer decode them, so a fresh re-ingest fails. Fred therefore keeps old DARs while PQS is attached.

The second is contracts left on the old package. Before the swap, Fred checks that no active contracts remain on the old package on any node. If any remain, Fred does not swap, so no contracts are ever left on an unvetted package. If Fred runs against a participant it did not start and finds such contracts, it stops and the developer resets.

Fred also waits for PQS to catch up before reporting a reload as verified, so a query run straight afterwards sees the new shape.

**LocalNet**, and CN QuickStart. [CN QuickStart](https://github.com/digital-asset/cn-quickstart) is the scaffold many teams start from, and it runs on Splice LocalNet under Docker Compose. Uploading a rebuilt DAR handles a compatible change. A breaking change is different. The old package stays vetted, so today the only practical option is to restart the network (110 seconds median in our runs) and onboard again before testing can resume. **Fred** runs the coordinated sequence across the app-provider and app-user nodes, pausing the synchronizer through the super-validator participant, so the network stays up. We have run it on LocalNet in both directions, with commitments matching afterwards. Fred also prunes each attached PQS as described above.

**When something goes wrong,** Fred runs every check it can before it changes anything, so a failed check leaves the ledger exactly as it was. Some failures can't be caught in advance, though. The removal, the upload and the swap can still fail partway through, and Fred itself can be killed while the network is paused.

If that happens, Fred stops reacting to file changes. It will not start another reload until the developer resumes or resets, because applying more changes on top of a half-finished one makes the state harder to recover, not easier. The record of the incomplete reload is written to disk, so restarting Fred does not clear it, and Fred refuses to watch again until it is dealt with.

The hook declarations live in the project and are committed with it, so everyone runs the same hook scripts. Everything else is settings: project configuration sets the defaults, and command-line flags and environment variables override them. Personal choices, such as whether you want to be asked before contracts are removed, stay on your machine rather than in the repository.

Fred prints the configuration it is actually using when it starts, so a setting that archives without asking is visible before it does anything. You can turn this off if you don't need it.

Fred keeps a local reload log at `.fred/reloads.jsonl`. Each reload records time, an anonymised developer hash, reload duration, last measured restart duration, package count and outcome. `fred report` summarises one log and `fred report --merge` combines several developers' summaries.

The log stays local, is never uploaded, and can be disabled. It is used only for usage reporting; removal decisions always come from ledger state.

A reload or a reset can be triggered from inside a running session without stopping Fred. A reset starts the sequence over from the beginning. Unlike a reload it discards the ledger, including parties, recreates the PQS database and Fred says so before it does it.

### 3. Architectural Alignment

Fred ships as a dpm component with no operating-system-specific scripts, so the component is all a developer installs. Fred will run on all supported platforms: macOS, Linux, Windows.

No Canton change, no protocol change, no Ledger API change and no compiler change. Fred uses only APIs shipping in Canton 3.5 or newer: package upload and vetting, and on several nodes the dynamic synchronizer parameters and the participant repair service, both only on development synchronizers Fred has owner rights on. It alters nothing about Smart Contract Upgrades or production vetting. DPM already owns the surrounding pieces: build with dependency ordering, the sandbox, script execution and upgrade checking. The work aligns with RFP 19 and RFP 18.

### 4. Backward Compatibility

No backward compatibility impact. Fred is additive and opt-in. It does not change existing Daml applications, Canton nodes, Ledger API semantics, package upload or package vetting. It operates only on development nodes and synchronizers it owns or has been pointed at with owner rights. The coordinated sequence needs database-backed participants, because purge refuses in-memory storage.

## Milestones and Deliverables

### Milestone 1: The Reload Command

**Estimated Delivery:** 9 weeks

`fred reload` performs a breaking-change reload against a sandbox or multi-node network the developer is already running. Real Daml projects are several packages, and compiled Daml embeds the package ID of its dependencies, so changing one leaves its dependents no longer fitting. The command handles the whole closure. This is what everything else is built on, and it remains the fallback once the supervisor exists.

**Deliverables:**

- The component source, in a public GitHub repository under Apache-2.0 from the first release.
- The built artifact, published to an OCI registry and installable with `dpm add component`.
- The Daml Script project hooks (discover, archive, setup and verify) and Fred's implementation of calling each at the right point with the right authority.
- **Multi-node support:** the coordinated sequence (checkpointed rate 0, bounded drain with an ACS stability check, per-node disconnect, purge and reconnect, swaps on every node and synchronizer, rate restored) across N participants and the synchronizers they share, and a development topology with an app-provider node, an app-user node and two synchronizers that Fred can start with short synchronizer timeouts.
- The saved copy of the old DAR, kept on disk and replaced only after a reload verifies.
- The preflight and commit sequence, with serial and authority verification and checkpointed resume.
- Closure computation: dependents rebuilt in dependency order and archived in reverse, with every add and remove for the whole closure in a single topology transaction.
- **Multi-synchronizer support:** per-synchronizer vetting and swaps with serial verification, completion of in-flight reassignments before archival, a no-old-contracts check before each swap and per-synchronizer resume.
- A diagnosis naming the package that must be rebuilt.
- Documentation with a worked multi-package example.

**Acceptance Criteria:**

- A developer makes a breaking change to a project that is not the proof of concept and completes a reload. No node is restarted, the parties setup finds are the same before and after, and no contracts remain on the old package.
- A multi-package project reloads its whole dependency closure in one operation, and a choice on a dependent package succeeds immediately afterwards without a further reload.
- On the development topology (two participants, two synchronizers), a breaking reload of contracts shared between parties on both nodes completes without a force flag. Afterwards no contracts remain on the old package on either node, the confirmation rate is back to its original value, and the ACS commitments between the nodes match.
- On a participant connected to two synchronizers, a breaking reload completes without a force flag. Afterwards, the old package is unvetted on both and no contracts remain on it, including one that was mid-reassignment when the reload started. An interrupted reload resumes on the synchronizer not yet swapped.
- When a project leaves a dependent package out of the closure, Fred names every missing package and exits before changing anything.
- A reviewer nominated by the Committee, outside our team, reproduces the single-package and multi-package reloads using only the published documentation.
- The component works on Windows, macOS and Linux.
- The source is public under Apache-2.0, and the artifact installs from the registry with `dpm add component`.
- A reload is at least 30% faster than a restart on a single sandbox participant and on CN QuickStart LocalNet with the timeouts Fred sets, measured as the median of at least ten alternating runs of each from a clean ledger, with the restart baseline re-measured on the same machine.
- Failures injected at each step (before removal, after the rate is set to 0, partway through the purge with one node disconnected, after removal and before the swap, after the swap and before setup, and during setup) either stop with nothing destroyed or resume and finish correctly, and the confirmation rate is always restored.

### Milestone 2: The Live Sandbox

**Estimated Delivery:** 4 weeks

Fred runs for the length of a session, so the developer runs one thing in one terminal.

**Deliverables:**

- Sandbox startup and setup, and DAR watching.
- The removal policy, with its confirm, notify and auto settings, in project and user configuration.
- The reload triggered from the watcher, sharing Milestone 1's core and baseline.
- Reset from the session.
- A local reload log with `fred report` for reload count, date range, developer count, and reload versus restart time, plus `fred report --merge` for combining team summaries.

**Acceptance Criteria:** A developer starts Fred, edits a model, rebuilds, and keeps working without restarting the participant, on Windows, macOS and Linux.

- On the first run, with no configuration, the removal policy defaults to confirm.
- A compatible change causes no archival and no topology transaction.
- A breaking change changes nothing on the ledger until the developer confirms it.
- After a failed reload, Fred acts on no further file change until the developer resumes or resets.
- Restarting Fred while a reload is incomplete does not clear it. Fred refuses to watch until the reload is resumed or reset.
- The supervisor runs against the two-node, two-synchronizer development topology.
- Fred reports the configuration it is using at startup.
- A reset warns that the ledger, including parties, will be discarded before it discards it.
- A reload is at least 30% faster than a restart, measured by the Milestone 1 protocol.
- Each reload is logged automatically. `fred report` summarises the log and `fred report --merge` combines developers’ summaries. Logging can be disabled.

### Milestone 3: PQS

**Estimated Delivery:** 7 weeks

PQS indexes the ledger into Postgres for SQL queries. A reload leaves it holding rows for contracts that no longer exist.

**Deliverables:**

- PQS lifecycle, started after vetting and stopped on shutdown when configured.
- Handling for contracts left on an unvetted package. Before the swap, Fred checks that no active contracts remain on the old package and does not swap if any do. If Fred runs against a participant it did not start with and finds such contracts, it stops with a clear error message that lists the affected templates and contract IDs and tells the developer to reset.
- Synchronisation, where Fred waits for PQS to catch up before reporting a reload verified.
- A PQS interface layer that keeps Fred independent of PQS internals. Behind the interface, each implementation covers a range of PQS versions, and Fred uses the one that matches the PQS version in use.
- The PQS version is set in Fred config or, if not set, detected automatically. Config overrides detection.
- A command for listing the supported PQS versions.
- A version check before any change. If the PQS version is known to be incompatible, Fred refuses. If the registry does not know the version, Fred warns on every reload and continues with its newest interface implementation.
- A remote PQS registry, from which Fred retrieves at runtime the supported PQS versions, the interface implementation each one uses, and the data that implementation needs, without updating the installed Fred.
- Validation that confirms PQS holds the correct data after a reload, with a setting for how thorough it is.
- `fred reset --pqs`, which drops and recreates the PQS database. A full reset always includes it.
- After a breaking reload, Fred records the last archive offset, waits for PQS to move past it, then dry-runs and prunes to that point. Pruning follows the removal confirmation policy and is safe to retry.
- Old DARs are kept while PQS is attached, so a re-ingest can still decode old events.

**Acceptance Criteria:**

- After a breaking reload with PQS attached, a SQL query returns the new schema and no rows from the old package and PQS stays running.
- After an SCU-compatible reload, PQS ingests the new version without a restart. Contracts created under the old version stay readable.
- Fred only reports a reload as verified once PQS has caught up with the ledger.
- After any reset, Fred never reports a stale PQS as synchronised. This includes checking that PQS holds no rows for parties the participant doesn't know.
- Fred refuses to proceed when a complete re-ingest is impossible.
- The behaviour that applies is documented with the component.
- A breaking reload with PQS attached passes on the two-node, two-synchronizer development topology, with a PQS on each node.
- A fresh PQS re-ingest with the old DARs kept is demonstrated against a real PQS deployment, followed by a prune that leaves only the current version.
- When a PQS version is set in config, Fred uses it. Otherwise, Fred uses the version reported by the running PQS instance.
- After a new PQS version is published to the registry, Fred supports that version without being updated.
- When the registry is unreachable, Fred uses its cached data and reports that it is doing so.
- Fred never applies a new version that is not correctly signed.
- The listing command shows the PQS versions held in the registry.
- Fred uses the interface implementation that matches the PQS version in use.
- A breaking reload with PQS attached passes on every PQS version Fred supports.
- Fred refuses to proceed when the PQS version is known to be incompatible with every interface implementation.

### Milestone 4: LocalNet

**Estimated Delivery:** 9 weeks

Milestone 1 delivers the coordinated sequence across several nodes. This milestone takes it to CN QuickStart LocalNet as a supported, documented target, extends the supervisor to deployments Fred did not start and handles PQS on every node.

Our prototype already runs the coordinated reload on LocalNet's app-provider and app-user nodes, pausing the synchronizer through the super-validator participant, with commitments matching afterwards and a one-sided purge detected as a mismatch. What is not yet covered: more than two app nodes, LocalNet with more than one synchronizer, the supervisor and PQS on each node.

**Deliverables:**

- Fred attaches to a running CN QuickStart LocalNet, discovers its app nodes and the synchronizer owner, and sets development timeouts through the super-validator participant.
- The coordinated reload across every app node hosting a stakeholder, verified by the nodes' ACS commitments after the next commitment period.
- Setup on LocalNet: the development ledger user is granted act and read rights on the parties setup finds or creates.
- Detection and refusal, so that where Fred cannot reach every node hosting a stakeholder, or has no owner rights on a synchronizer, it names the reason and exits before changing anything.
- Fred watches a LocalNet deployment it did not start and reloads on change, using the same removal policy as the sandbox supervisor.
- PQS across LocalNet nodes: prune every PQS instance attached to a node in the swap, each with its own node's offset. After a reset, Fred re-grants the PQS users' rights and restarts PQS before new contracts are created.
- A validation report covering every configuration tested, published whatever it finds.

**Acceptance Criteria:**

- A developer points Fred at a running CN QuickStart deployment, edits a model, rebuilds, and keeps working without restarting the network.
- After a LocalNet reload, the ACS commitments between every pair of nodes match for the period that contains the reload.
- Refusal is demonstrated on a configuration identified as unsafe in advance. Afterwards, the confirmation rate, the vetting serial, the vetted package set and the contracts on the ledger are all unchanged.
- After a LocalNet reload, each attached PQS instance returns the new shape and none reports stale state as synchronised.
- The report states, for each configuration tested, whether the reload completed, what each node observed and what the commitment check showed.

### Milestone 5: Adoption

**Adoption Window:** up to 6 months after Milestone 4 acceptance

Adoption opens when the complete tool ships at Milestone 4, so teams evaluate the finished product rather than a partial one. Each adopting team's tranche is paid when that team's use is verified, so partial adoption produces partial payment.

**Definition of regular use.** A team counts as adopted when: (1) its Fred hook configuration is committed to the project’s main branch, (2) at least two developers have used Fred for four consecutive weeks, (3) the team shares the output of `fred report`, covering the number of reloads, the dates they span, the number of distinct developers, and reload time against restart time and (4) it confirms in writing whether reload replaced restart in its workflow. Fred collects no telemetry. The summary comes from the reload log Fred keeps on each developer's machine.

**Deliverables:**

- A quickstart with an example repository.
- Submission of the workflow for Canton and Daml developer documentation, and a presentation to the Daml Language and Developer Tooling SIG.
- Hands-on sessions with independent teams recruited through that SIG and the Canton Network forum.
- **What the adoption record contains:** iteration times, package counts, and whether reload replaced a restart. It excludes contract payloads, party identifiers, and project-specific template or module names unless the team chooses to include them. Each team reviews its entry before publication and results can be reported without naming the project.
- Submission of Fred for listing in the dpm component catalogue, and a pull request adding Fred to CN QuickStart.

**Acceptance Criteria:**

Adoption programme:

- The quickstart and example repository are published, and a developer new to Fred, recruited outside our team, completes the quickstart using only the published documentation.
- The workflow is submitted to the Canton and Daml developer documentation, Fred is submitted for listing in the dpm component catalogue, and a pull request adding Fred to CN QuickStart is opened.
- Fred is presented to the Daml Language & Developer Tooling SIG, and hands-on sessions are run with teams recruited through the SIG and the Canton Network forum.

**Adoption outcome (target 5 teams, 20% per verified team, up to the full amount of M5):**

- Each independent team that uses Fred in its regular workflow, as defined above, releases one tranche. A team is independent if it is not part of LimeChain and its project is not one LimeChain is paid to build. The target is five independent teams using Fred in their regular workflow, as defined above, including at least two Featured App teams and at least one multi-package project. Each verified team releases 20% of the total CC for M5, paid independently once that team is verified. Payment is capped at five teams.
- At the end of the adoption window, the adoption report compiles each team’s reload record summary and written account. Each team reviews its entry before publication and may remain anonymous in the published report, but is named to the Committee for verification.

### Milestone 6: Maintenance

**Estimated Delivery:** 12 months (5 weeks per quarter)

New dpm-sdk and Canton releases may change APIs Fred depends on. This milestone covers compatibility work, defect triage and ongoing ownership for the first year after Milestone 4, running alongside the adoption window.

**Deliverables:**

- Compatibility with each new dpm-sdk and Canton release, restored within 60 days.
- Triage of defects reported by adopting teams, with an initial response within five business days.
- A maintenance report at the end of each three-month period.
- Compatibility with each new PQS release, restored within 60 days, by publishing its metadata to the registry or, if the release breaks the existing interface implementations, adding a new one.

**Acceptance Criteria:**

- Each quarterly report lists the SDK, Canton, Splice and PQS versions tested, compatibility results, issues handled, fixes released, and any remaining issues and their status.
- The documented reload workflow passes on the supported versions, with fixes or documented workarounds for any blocking issues.
- Code and documentation updates are published. Acceptance of each quarterly report releases one quarter of the maintenance allocation.

**After the maintenance term.** Fred remains Apache-2.0 in a public repository, with its design note and evidence published. Maintenance can then transfer to the Foundation or another maintainer. LimeChain will continue maintaining it under a renewed agreement if the Foundation wishes.

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion on ecosystem outcomes rather than artifacts: independent teams using Fred in their regular workflow and reporting a measurably shorter code-test-debug cycle on their own projects, with a target of five teams including at least two Featured App teams, the workflow submitted to the Canton and Daml developer documentation and Fred submitted for listing in the dpm component catalogue. Every milestone is verified on all three operating systems, and all software is released under Apache-2.0 before any payment.

## Funding

**Total Funding Request:** 4,000,000 CC

LimeChain allocation: 3,370,000 CC

Digital Asset allocation: 630,000 CC

### Payment Breakdown by Milestone

| Milestone | Funding (CC) | LimeChain / Digital Asset split (CC) |
|---|---|---|
| M1: The Reload Command | 310,000 | 250,000 LC / 60,000 DA |
| M2: The Live Sandbox | 250,000 | 200,000 LC / 50,000 DA |
| M3: PQS | 360,000 | 290,000 LC / 70,000 DA |
| M4: LocalNet | 510,000 | 410,000 LC / 100,000 DA |
| M5: Adoption | 1,750,000 | 1,400,000 LC / 350,000 DA |
| M6: Maintenance | 820,000 | 820,000 LC / 0 DA |
| **TOTAL** | **4,000,000** | **3,370,000 LC / 630,000 DA** |

Payments are released on Tech & Ops Committee acceptance of the relevant milestone deliverables. DA’s share is included in each M1–M5 payment, not added on top; M6 is entirely payable to LimeChain. DA provides technical interactions, help and reviews.

M5: Adoption is paid at 20% per verified team (up to five teams) to allow partial payouts and balance risk.

M6: Four equal quarterly payments of 205,000 CC to LimeChain after Committee acceptance of the maintenance report. The twelve-month term starts at M4 acceptance, alongside adoption.

### Volatility Stipulation

If Committee-requested scope changes extend the agreed delivery schedule, the remaining un-minted CC allocations for affected, unstarted work will be renegotiated to reflect significant USD/CC volatility. Either party may also request renegotiation if the 30-day average CC/USD price moves 25% or more from USD 0.075/CC (Coinmarketcap, 24.11.2026). A review also takes place six months after project start, including unpaid maintenance instalments. M1 remains fixed; changes apply only to unstarted work or future maintenance quarters and require written agreement of the affected parties and Tech & Ops Committee approval. There is no automatic repricing; paid or earned amounts remain unchanged.

## Co-Marketing

As part of Milestone 4, LimeChain will create and publish the release assets below in close co-marketing collaboration with both the Canton Foundation and Digital Asset (DA) to establish FRED as part of the ecosystem's official developer tooling catalog:

- A technical article co-authored with Canton Foundation and DA, "Changing a Daml model without restarting Canton, and why it needs no force flag," explaining the developer problem, safety model, implementation boundaries, and supporting evidence to position FRED in the official catalog.
- Guides and examples produced alongside Canton Foundation and DA marketing teams in the form of articles, tutorials, or short videos exemplifying how FRED can be used with existing Global Synchronizers and plugged into cn-quickstart as official tooling.
- A joint recorded walkthrough with DA and Canton Foundation showing a complete reload, pre-flight and failure-safety checks, recovery behavior, and the resulting developer workflow within the official catalog ecosystem.
- A live co-hosted walkthrough and Q&A for the Daml Language & Developer Tooling SIG with Canton Foundation and DA representatives, with recordings or slides published officially where permitted.
- A joint documentation contribution for the official developer tooling catalog covering installation, supported scenarios, limitations, and troubleshooting, plus a post-release update summarizing repository activity, user feedback, and adoption evidence gathered during Milestone 5.

## About the Team

LimeChain, founded in 2017, brings experience relevant to Daml Development Reload: SDK/CLI maintenance, local development, testing, package workflows, releases and documentation.

Canton Network: LimeChain members were named among Canton’s inaugural Community Tech Partners. For this proposal, LimeChain built and published an evidence-backed development-reload prototype tested on Canton 3.5.12 and dpm-sdk 3.5.5. Related work includes Daml package-registry/toolchain R&D and Canton client projects.

Comparable evidence includes five-plus years as a key Hedera development partner; Solana Foundation-backed Zest, Gimlet and a merged Surfpool contribution; NEAR SDK and security work; the Polkadot-funded Fruzhin host; and Stylus Toolkit and Matchstick.

The prototype also demonstrated evidence discipline: LimeChain corrected a test-setup defect, added a control, reran the matrix, published the logs and documented six toolchain defects.

One senior engineer will lead delivery with protocol and tooling reviewers. LimeChain owns implementation, testing, releases, documentation, adoption support, Committee reporting and twelve months of maintenance. Acceptance requires clean installation, independent execution and the defined adoption evidence.

## Appendix: Mechanism and Evidence

Public repository: [https://github.com/LimeChain/canton-dev-reload](https://github.com/LimeChain/canton-dev-reload) (Apache-2.0), pinned at [`harness-v27`](https://github.com/LimeChain/canton-dev-reload/tree/harness-v27). Tags in the repository are immutable, so this is the stable reference; `main` should not be cited.

**Evidence from the harness.** The repository contains fourteen committed runs covering the same basic sequence: archive, upload an unvetted package, issue one `propose_delta` against the synchronizer store to remove the old package IDs and add the new ones, then run setup.

The unforced swap works when contracts are archived first. A control pair confirms that the harness distinguishes the two force settings, so the result is testable rather than inferred from a single successful path. Leaving a dependent package unrecompiled causes the swap to fail. Rebuilding the full dependency closure allows the change to complete in one transaction. Party IDs are preserved. The runs also show that operation ordering matters: changing the order can leave contracts stranded.

Each log includes a provenance header and assertions that exit non-zero when an expected condition is not met.

**Remaining work and limitations.** These runs cover the underlying reload mechanism, but not the full milestone. The hook interface, durable baseline, checkpointed resume, cross-platform behaviour and both thresholds still need to be implemented and tested. The supervisor and file-watching pieces are also outside the current evidence.

PQS was tested separately against real PQS deployments: versions 3.5.1, 3.5.7 and 3.6.2, a sandbox connected to two synchronizers, and a full CN QuickStart. Pruning archived history removes the old version's rows while PQS keeps running, with 50,000 archived contracts pruned in under half a second. A reset with a version filter fails, because PQS subscribes by package name and the replay delivers versions it can no longer decode. The runs are under [`evidence/pqs/`](https://github.com/LimeChain/canton-dev-reload/tree/harness-v27/evidence/pqs), produced at `harness-v26` by `scripts/73-pqs.sh`.

[evidence/INDEX.md](https://github.com/LimeChain/canton-dev-reload/blob/harness-v27/evidence/INDEX.md) maps the individual claims to their corresponding logs and records the limits of the evidence. [docs/design-note.md](https://github.com/LimeChain/canton-dev-reload/blob/harness-v27/docs/design-note.md) describes the reload core, baseline lifecycle and hook contract.

Multi-synchronizer evidence covers one participant connected to two synchronizers on Canton 3.5.12. Upload with vetting fails unless a synchronizer is named (`PACKAGE_SERVICE_CANNOT_AUTODETECT_SYNCHRONIZER`), a swap on one synchronizer leaves the other unchanged, both swaps succeed without a force flag, the old package remains usable on the unswapped synchronizer, and a contract left mid-reassignment is stranded after the swap. The run is [`evidence/20261021T132713Z__MS1__multisync.log`](https://github.com/LimeChain/canton-dev-reload/blob/harness-v27/evidence/20261021T132713Z__MS1__multisync.log), produced at `harness-v24` by `scripts/72-multisync.sh`.

**Multi-node evidence** ([`evidence/INDEX.md`](https://github.com/LimeChain/canton-dev-reload/blob/harness-v28/evidence/INDEX.md), pinned at [`harness-v28`](https://github.com/LimeChain/canton-dev-reload/tree/harness-v28), test plan and results in [`docs/test-plan-multinode-purge.md`](https://github.com/LimeChain/canton-dev-reload/blob/harness-v28/docs/test-plan-multinode-purge.md)). On Canton 3.5.12 with two database-backed participants on two synchronizers: archiving a contract whose signatories are on different nodes fails; a confirmation rate of 0 blocks new submissions while accepted ones resolve within the drain bound; purge requires every synchronizer to be disconnected and refuses in-memory storage; a purge on one node only produces `ACS_COMMITMENT_MISMATCH`; the full coordinated sequence passes with no mismatch (three runs each); a `kill -9` while the rate is 0 is recovered from the checkpoint; and a purge reaches PQS as an archive, so the existing prune applies. On CN QuickStart LocalNet (Splice 0.6.11): only the super-validator participant can change the rate, and the Splice applications leave it alone; the coordinated reload passes in both directions; commitments match after it and mismatch after a one-sided purge; and ten alternating trials give the timings in the Motivation. These runs are exploratory: they were made from the working tree that `harness-v28` commits, not from a clean checkout of the tag. Not yet covered: a crash during purge, more than two app nodes, and LocalNet with two synchronizers.
