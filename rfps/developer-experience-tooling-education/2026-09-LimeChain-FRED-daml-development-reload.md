# Development Fund Proposal: FRED, Daml Development Reload

**Organization:** [LimeChain](https://limechain.tech)<br>
**Authors / Primary Contacts:** Georgi Radev ([georgi.radev@limechain.tech](mailto:georgi.radev@limechain.tech)), Ivaylo Bakalov, Veselin Mihaylov<br>
**Status:** Submitted<br>
**Created:** 2026-09-14<br>
**Proposal Type:** RFP-aligned<br>
**RFP / Roadmap Area:** Developer Experience, Tooling & Education. RFP 19 (DPM Components and Extension Ecosystem), secondary RFP 18 (Integration into SDLCs)<br>
**Champion:** Curtis Hrischuk, Digital Asset ([hrischuk-da](https://github.com/hrischuk-da))<br>
**Total Funding Request:** 3,310,000 Canton Coin (CC)<br>
**Project Duration:** ~29 weeks of development, a six-month adoption window after M4 and a 12-month maintenance term starting at M4 acceptance<br>
**Label:** daml-tooling<br>

## Abstract

In a developer’s local code-test-debug loop, a breaking change to their model, such as changing a field's type, forces a restart of the developer’s participant. That restart destroys every created party and contract, and re-running `setup` returns different party IDs, so anything holding the old ones breaks. We propose Fast Reload of Evolving DARs (Fred), a DPM component that replaces the continuous code restart during testing with an in-place, fast reload: archive the affected contracts, upload the rebuilt DAR unvetted, swap the vetted package set in one topology transaction on each synchronizer, then run setup, and continue testing. The participant keeps running and every party ID survives, though contracts are archived and recreated, so contract IDs change. Rough estimates are that Fred can save 40% of the time for a sandbox test cycle and we expect a better saving on a LocalNet test cycle. Fred ships first as a CLI command, then as a supervisor like Vite’s dev server. Fred is open source, licensed under Apache-2.0 in a public Git repository. We proved the reload sequence on stock Canton 3.5.12 with no Canton change and no force flag, and published a machine-checked log for every claim.

## Motivation

The code-test-debug cycle is where Daml developers spend their time, and when the code changes, the corresponding contracts need to be updated. The real cost is not the restart, which takes seconds, but repairing every script, configuration file and test fixture that held the old party IDs. The session is awkward too: `dpm sandbox` holds a terminal, so a developer backgrounds it and loses its output.

The Foundation's [2026 developer-experience survey](https://forum.canton.network/t/canton-network-developer-experience-and-tooling-survey-analysis-2026/8412) says that: 41% of respondents named environment setup and node operations as the task that took them the longest.

Our FRED prototype found a 40% reduction in restart time, going from 31 seconds to 19 seconds. LocalNet would remove a stop and start cycle of 129 seconds. Because the prototype is a set of shell scripts, every reload has to start a Canton console twice and wait for it to load each time. That waiting sits inside the measurement even though it is not part of the reload, so componentizing this would make it even faster. The component will hold a single connection from its own process, so the real figure should be better than 40%. The appendix maps every claim in this proposal to the log behind it.

The LocalNet cycle was measured on macOS running Docker Desktop, 28 September 2026. The cycle is start plus stop: 15:16:08 start begins, 15:18:08 up (120 seconds), 15:18:17 stopped (9 seconds), total 129 seconds.

## Rationale

The standalone command is developed first and the supervisor builds on that. The supervisor is what makes it an autonomous development loop.

FRED will support the three operating systems used for development. Developers work on Windows, macOS and Linux, so Fred has to run on all three. To support this, a new dpm component provides the functionality with nothing else to install.

**The autonomous developer loop we are aiming at:**

1. The developer starts Fred.
2. Fred reads `daml.yaml` and `multi-package.yaml` to find every DAR dependency and where it lives.
3. Fred starts the sandbox and runs the Daml Script that configures it.
4. Fred uploads the relevant DARs and vets them on every synchronizer the participant is connected to.
5. The developer tests, debugs, changes code and rebuilds.
6. Fred detects that all the DARs compile successfully and at least one has changed, and waits until no further changes arrive for a short debounce period. If the code changes again while Fred is in steps 7–9, Fred completes the current update and then repeats from step 6 with the latest DARs.
7. Fred archives the contracts on the old package.
8. Fred replaces the old package with the new one in one topology transaction per synchronizer, unvetting and vetting together.
9. Fred or the developer reruns the test setup Daml Script.
10. Cycle back to step 5.

## Specification

### 1. Objective

By the end of this grant a Daml developer will work through breaking model changes without restarting anything. Party IDs hold across every reload, so scripts, configuration and connected applications keep working. It runs on Windows, macOS and Linux and installs with `dpm add component`.

The reload sequence is proven and needs nothing from Canton.

### 2. Implementation Mechanics

The reload is four steps:

1. Archive the contracts of the changed packages, using the signatory authority the developer holds because they allocated the parties.
1. Upload the rebuilt DAR unvetted.
1. Remove the old package IDs and add the new ones in one topology transaction per connected synchronizer, each against that synchronizer's store.
1. Run setup, the project's own Daml Script that recreates the contracts the developer tests against on the new packages. Fred allocates the parties once from static configuration and passes them to the script, so rerunning the script doesn’t create new parties. If the script allocates its own parties, it must be idempotent.

On each synchronizer, step 3 has to be one transaction to avoid a `KNOWN_PACKAGE_VERSION` error. Doing both at once avoids that, and is why no force flag is needed. If you do this manually, there are three ways to get it wrong, and none of them throws an error. You just end up in a bad state.

The first is the sneakiest: the topology call can succeed without doing anything. By default, it targets a store where the change is computed against an empty set, so it writes a first entry there, never touches the synchronizer, and reports success anyway. Fred targets the synchronizer store explicitly and then checks that the serial actually advanced.

The other two come down to ordering. The old contracts have to be archived before the swap, because once the old package is unvetted, no choice that includes Archive can be exercised, and those contracts are stranded for good. Fred keeps a copy of the old build on disk and replaces it only after a reload has verified.

**Multiple synchronizers.** Package vetting is per synchronizer, so Fred uploads unvetted and vets explicitly on each connected synchronizer. Swaps run one at a time so Fred can verify the serial and record progress after each one.

Until a synchronizer is swapped, the old package remains usable there, so new contracts can still be created against it. Fred therefore runs nothing between swaps, repeats the no-old-contracts check before each one, and runs setup only after all swaps complete. If an affected contract is mid-reassignment, Fred completes the reassignment before archiving to avoid stranding it on a synchronizer where the package is no longer vetted.

Progress is tracked per synchronizer, so interrupted reloads resume where they left off. We tested this on Canton 3.5.12 with one participant connected to two synchronizers, with no force flag; see the appendix.

**The four hooks**. Fred cannot know which contracts belong to a project's changed package, how to archive them or what test data to recreate afterwards. That is project specific, so each project provides four Daml Scripts in a configuration file at its root. A hook is simply a point where Fred stops and runs one of those scripts.

- `discover` returns the contracts in scope and the signatories each one requires.
- `archive` archives them, acting as those signatories
- `setup` recreates the working state after the swap
- `verify` is an optional postcondition, checked before Fred replaces its saved copy of the old build

These are Daml Scripts rather than plugin code because the project already has a script package and that package already has the signatory authority this technique depends on, because the developer allocated the parties. The script package also stays out of the vetting set because `dpm script --upload-dar` defaults to false, so it is never part of the closure being swapped. In the future, Fred can further automate this to reduce the need for these scripts but that is a different grant proposal.

Fred never infers a migration. If the new schema needs data the old shape cannot supply, that is setup's problem and the developer's decision.

The design note linked in the appendix specifies the hooks in full.

The dpm command `fred reload` performs the four steps once and exits, against a participant the developer started. It is what Milestone 1 delivers, and it stays available whenever Fred does not own the participant.

**The supervisor `fred`** runs for the length of a session:

1. Starts the sandbox.
1. Runs setup.
1. Watches the DARs for changes.
1. Classifies each change with `dpm upgrade-check` before touching the ledger.
1. On a compatible change, uploads and vets the new DAR. Existing contracts are kept.
1. On a breaking change, applies the archive policy and then runs the same four steps as fred reload.

The policy decides what happens at step 6, and is set on the command line or in project configuration:

- `fred --on-change confirm` is the default. It asks before archiving.
- `fred --on-change notify` reports the change and waits.
- `fred --on-change auto` runs without prompting.

Both paths read the same baseline.

To support reloading in projects that use PQS as their query side (CQRS), this approach needs to be extended to PQS. PQS indexes the ledger into Postgres so developers can query it with SQL. On a breaking change, Fred archives the old contracts and PQS records them as archived history. Fred then prunes that history with PQS's own prune function, up to the last archive, while PQS keeps running. Live contracts are untouched. On an SCU-compatible change, nothing is archived, so nothing is pruned: PQS loads the new version by itself and old contracts stay readable under their original version. Recreating the PQS database is part of a reset only.

A reload disturbs it in two ways.

The first is history. A re-ingest replays transactions that reference the old package. After the old DAR is removed, the participant still serves those events, but PQS can no longer decode them, so a fresh re-ingest fails. Fred therefore keeps old DARs while PQS is attached.

The second is contracts left on the old package. Before the swap, Fred checks that no active contracts remain on the old package. If any remain, Fred does not swap, so no contracts are ever left on an unvetted package. If Fred runs against a participant it did not start and finds such contracts, it stops and the developer resets.

Fred also waits for PQS to catch up before reporting a reload as verified, so a query run straight afterwards sees the new shape.

**LocalNet**, and CN QuickStart. [CN QuickStart](https://github.com/digital-asset/cn-quickstart) is the scaffold many teams start from, and it runs on Splice LocalNet under Docker Compose. Uploading a rebuilt DAR handles a compatible change. A breaking change is different. The old package stays vetted, so today the only practical option is to restart the network (the 129-second cycle noted above) and onboard again before testing can resume. **Fred** acts on the participant rather than on the deployment, so the same four steps apply and the network stays up. Fred also prunes each attached PQS as described above. Milestone 4 establishes whether that holds across LocalNet's participants, and QuickStart is the fixture we intend to use for it.

**When something goes wrong,** Fred runs every check it can before it changes anything, so a failed check leaves the ledger exactly as it was. Some failures can't be caught in advance, though. The archive, the upload and the swap can still fail partway through.

If that happens, Fred stops reacting to file changes. It will not start another reload until the developer resets, because applying more changes on top of a half-finished one makes the state harder to recover, not easier. The record of the incomplete reload is written to disk, so restarting Fred does not clear it, and Fred refuses to watch again until it is dealt with.

The hook declarations live in the project and are committed with it, so everyone runs the same discover, archive, setup and verify scripts. Everything else is settings: project configuration sets the defaults, and command-line flags and environment variables override them. Personal choices, such as whether you want to be asked before archiving, stay on your machine rather than in the repository.

Fred prints the configuration it is actually using when it starts, so a setting that archives without asking is visible before it does anything. You can turn this off if you don't need it.

Fred keeps a local reload log at `.fred/reloads.jsonl`. Each reload records time, an anonymised developer hash, reload duration, last measured restart duration, package count and outcome. `fred report` summarises one log and `fred report --merge` combines several developers' summaries.

The log stays local, is never uploaded, and can be disabled. It is used only for usage reporting; archive decisions always come from ledger state.

A reload or a reset can be triggered from inside a running session without stopping Fred. A reset starts the sequence over from the beginning. Unlike a reload it discards party IDs, recreates the PQS database and Fred says so before it does it.

### 3. Architectural Alignment

Fred ships as a dpm component with no operating-system-specific scripts, so the component is all a developer installs. Fred will run on all supported platforms: macOS, Linux, Windows.

No Canton change, no protocol change, no Ledger API change and no compiler change. Fred uses only APIs shipping in Canton 3.5 or newer, alters nothing about Smart Contract Upgrades or production vetting. DPM already owns the surrounding pieces: build with dependency ordering, the sandbox, script execution and upgrade checking. The work aligns with RFP 19 and RFP 18.

### 4. Backward Compatibility

No backward compatibility impact. Fred is additive and opt-in. It does not change existing Daml applications, Canton nodes, Ledger API semantics, package upload or package vetting. It operates on a development participant it owns or has detected to be idle.

## Milestones and Deliverables

### Milestone 1: The Reload Command

**Estimated Delivery:** 7 weeks

`fred reload` performs a breaking-change reload against a participant the developer is already running. Real Daml projects are several packages, and compiled Daml embeds the package ID of its dependencies, so changing one leaves its dependents no longer fitting. The command handles the whole closure. This is what everything else is built on, and it remains the fallback once the supervisor exists.

**Deliverables:**

- The component source, in a public GitHub repository under Apache-2.0 from the first release.
- The built artifact, published to an OCI registry and installable with `dpm add component`.
- The four Daml Script project hooks (discover, archive, setup and verify) and Fred's implementation of calling each at the right point with the right authority.
- The saved copy of the old DAR, kept on disk and replaced only after a reload verifies.
- The preflight and commit sequence, with serial and authority verification and checkpointed resume.
- Closure computation: dependents rebuilt in dependency order and archived in reverse, with every add and remove for the whole closure in a single topology transaction.
- **Multi-synchronizer support:** per-synchronizer vetting and swaps with serial verification, completion of in-flight reassignments before archival, a no-old-contracts check before each swap and per-synchronizer resume.
- A diagnosis naming the package that must be rebuilt.
- Documentation with a worked multi-package example.

**Acceptance Criteria:**

- A developer makes a breaking change to a project that is not the proof of concept and completes a reload. The participant process is never restarted, every party ID the project declared is unchanged, and no contracts remain on the old package.
- A multi-package project reloads its whole dependency closure in one operation, and a choice on a dependent package succeeds immediately afterwards without a further reload.
- On a participant connected to two synchronizers, a breaking reload completes without a force flag. Afterwards, the old package is unvetted on both and no contracts remain on it, including one that was mid-reassignment when the reload started. An interrupted reload resumes on the synchronizer not yet swapped.
- When a project leaves a dependent package out of the closure, Fred names every missing package and exits before changing anything.
- A reviewer nominated by the Committee, outside our team, reproduces the single-package and multi-package reloads using only the published documentation.
- The component works on Windows, macOS and Linux.
- The source is public under Apache-2.0, and the artifact installs from the registry with `dpm add component`.
- A reload is at least 30% faster than a restart, measured as the median of at least ten alternating runs of each from a clean ledger, with the restart baseline re-measured on the same machine.
- Failures injected at five points (before the archive, partway through the archive, after the archive and before the swap, after the swap and before setup, and during setup) either stop with nothing destroyed or resume and finish correctly.

### Milestone 2: The Live Sandbox

**Estimated Delivery:** 4 weeks

Fred runs for the length of a session, so the developer runs one thing in one terminal.

**Deliverables:**

- Sandbox startup and setup, and DAR watching.
- The archive policy, with its confirm, notify and auto settings, in project and user configuration.
- The reload triggered from the watcher, sharing Milestone 1's core and baseline.
- Reset from the session.
- A local reload log with `fred report` for reload count, date range, developer count, and reload versus restart time, plus `fred report --merge` for combining team summaries.

**Acceptance Criteria:** A developer starts Fred, edits a model, rebuilds, and keeps working without restarting the participant, on Windows, macOS and Linux.

- On the first run, with no configuration, the archive policy defaults to confirm.
- A compatible change causes no archival and no topology transaction.
- A breaking change changes nothing on the ledger until the developer confirms it.
- After a failed reload, Fred acts on no further file change until the developer resumes or resets.
- Restarting Fred while a reload is incomplete does not clear it. Fred refuses to watch until the reload is resumed or reset.
- The supervisor runs against a sandbox connected to two synchronizers.
- Fred reports the configuration it is using at startup.
- A reset warns that party IDs will be discarded before it discards them.
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
- After a breaking reload, Fred records the last archive offset, waits for PQS to move past it, then dry-runs and prunes to that point. Pruning follows the archive confirmation policy and is safe to retry.
- Old DARs are kept while PQS is attached, so a re-ingest can still decode old events.

**Acceptance Criteria:**

- After a breaking reload with PQS attached, a SQL query returns the new schema and no rows from the old package and PQS stays running.
- After an SCU-compatible reload, PQS ingests the new version without a restart. Contracts created under the old version stay readable.
- Fred only reports a reload as verified once PQS has caught up with the ledger.
- After any reset, Fred never reports a stale PQS as synchronised. This includes checking that PQS holds no rows for parties the participant doesn't know.
- Fred refuses to proceed when a complete re-ingest is impossible.
- The behaviour that applies is documented with the component.
- A breaking reload with PQS attached passes on a sandbox connected to two synchronizers.
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

**Estimated Delivery:** 11 weeks

Everything above runs against a participant Fred owns alone, connected to one or more synchronizers. Multi-synchronizer support for that participant is delivered in Milestone 1. On LocalNet, several participants may share one or more synchronizers and hold contracts with each other, so the swap must run on every participant hosting a stakeholder, across every synchronizer it is connected to, with PQS handled on each attached instance.

This milestone adds that coordination, extends the supervisor to deployments Fred did not start and determines where unilateral archival is safe.

Our published evidence covers a single participant on one or two synchronizers and lists multi-participant behaviour as untested. A manual check on a three-participant deployment has since shown that cross-participant archival works without a commitment mismatch and that the swap fails unless every hosting participant has vetted the package.

That was a manual test, not a recorded one with logs, so we do not treat it as proof. This milestone does it properly.

**Deliverables:**

- Fred exercised on a CN QuickStart LocalNet deployment across at least two of its three participants, carrying at least three contracts whose stakeholders span both, and the reload run on the participant Fred owns.
- A record of what the remote participant observes, covering whether it still sees the shared contract, whether the vetting change reaches it, and whether its view diverges from ours.
- A record of what the validators and the synchronizer observe, and whether unilateral archival produces a commitment mismatch between participants.
- Coordination of the swap across every participant hosting a stakeholder, since a package vetted on only one participant fails with `PACKAGE_SELECTION_FAILED`.
- Detection and refusal, so that where Fred cannot reach every participant hosting a stakeholder, or the project's templates offer no choice Fred's parties can exercise, it names the reason and exits before changing anything.
- The validation report, published whatever it finds.
- Fred watches a LocalNet deployment it did not start and reloads on change, using the same archive policy as the sandbox supervisor. If reload is safe on LocalNet, we deliver it.
- PQS across LocalNet participants: prune every PQS instance attached to a participant in the swap, each with its own participant's offset. After a reset, Fred re-grants the PQS users' rights and restarts PQS before new contracts are created.

**Acceptance Criteria:**

- A report is published. For each configuration tested, it states whether the reload completed, what the other participant observed, and what the commitment check showed.
- Refusal is demonstrated on a configuration identified as unsafe in advance. Afterwards, the vetting serial, the vetted package set and the contracts on the ledger are all unchanged.
- The milestone is accepted on the question being answered, whether unilateral archival is safe when a second participant holds contracts with the first, and on the guard being enforced. It is not accepted on the reload working on LocalNet. If it does not work there, the report says so.
- Where reload is safe on LocalNet, a developer can point Fred at a running CN QuickStart deployment, edit a model, rebuild, and keep working without restarting the network.
- After a LocalNet reload, each attached PQS instance returns the new shape and none reports stale state as synchronised.

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

- Each quarterly report lists the SDK, Canton and PQS versions tested, compatibility results, issues handled, fixes released, and any remaining issues and their status.
- The documented reload workflow passes on the supported versions, with fixes or documented workarounds for any blocking issues.
- Code and documentation updates are published. Acceptance of each quarterly report releases one quarter of the maintenance allocation.

**After the maintenance term.** Fred remains Apache-2.0 in a public repository, with its design note and evidence published. Maintenance can then transfer to the Foundation or another maintainer. LimeChain will continue maintaining it under a renewed agreement if the Foundation wishes.

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion on ecosystem outcomes rather than artifacts: independent teams using Fred in their regular workflow and reporting a measurably shorter code-test-debug cycle on their own projects, with a target of five teams including at least two Featured App teams, the workflow submitted to the Canton and Daml developer documentation and Fred submitted for listing in the dpm component catalogue. Every milestone is verified on all three operating systems, and all software is released under Apache-2.0 before any payment.

## Funding

**Total Funding Request:** 3,310,000 CC

LimeChain allocation: 2,855,000 CC

Digital Asset allocation: 455,000 CC

### Payment Breakdown by Milestone

| Milestone | Funding (CC) | LimeChain / Digital Asset split (CC) |
|---|---|---|
| M1: The Reload Command | 260,000 | 215,000 LC / 45,000 DA |
| M2: The Live Sandbox | 185,000 | 145,000 LC / 40,000 DA |
| M3: PQS | 300,000 | 250,000 LC / 50,000 DA |
| M4: LocalNet | 425,000 | 355,000 LC / 70,000 DA |
| M5: Adoption | 1,460,000 | 1,210,000 LC / 250,000 DA |
| M6: Maintenance | 680,000 | 680,000 LC / 0 DA |
| **TOTAL** | **3,310,000** | **2,855,000 LC / 455,000 DA** |

Payments are released on Tech & Ops Committee acceptance of the relevant milestone deliverables. DA’s share is included in each M1–M5 payment, not added on top; M6 is entirely payable to LimeChain. DA provides technical interactions, help and reviews.

M5: Adoption is paid at 20% per verified team (up to five teams) to allow partial payouts and balance risk.

M6: Four equal quarterly payments of 170,000 CC to LimeChain after Committee acceptance of the maintenance report. The twelve-month term starts at M4 acceptance, alongside adoption.

### Volatility Stipulation

If Committee-requested scope changes extend the agreed delivery schedule, the remaining un-minted CC allocations for affected, unstarted work will be renegotiated to reflect significant USD/CC volatility. Either party may also request renegotiation if the 30-day average CC/USD price moves 25% or more from USD 0.095/CC (Coinmarketcap, 27.10.2026). A review also takes place six months after project start, including unpaid maintenance instalments. M1 remains fixed; changes apply only to unstarted work or future maintenance quarters and require written agreement of the affected parties and Tech & Ops Committee approval. There is no automatic repricing; paid or earned amounts remain unchanged.

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

Several participants across several synchronizers are covered by Milestone 4.
