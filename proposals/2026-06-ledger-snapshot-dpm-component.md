# Ledger Snapshot DPM Component

**Author:** CoBuilders

**Status:** Draft

**Created:** 2026-07-19

**Revised:** 2026-10-01

**Label:** daml-tooling

**Proposal type:** RFP-aligned

**RFP / Roadmap area:** [Developer Experience, Tooling & Education: RFP 19, DPM Components and Extension Ecosystem](https://github.com/canton-foundation/canton-dev-fund/blob/main/2026-2028-strategic-roadmap.md#requests-for-proposals); secondary: RFP 18, Integration into SDLCs

**Champion:** [Need Champion](https://github.com/canton-foundation/canton-dev-fund/blob/main/sig-directory.md)

---

## Abstract

CoBuilders proposes `dpm ledger-snapshot`, an open-source DPM component that adds named checkpoints and managed save/restore to a PostgreSQL-backed Canton Sandbox. The default `dpm sandbox` stores state in memory and loses it on shutdown. The component uses Canton’s existing PostgreSQL storage support with an instance supplied by the developer.

Developers prepare a ledger fixture once, save it, and restore that baseline between integration or upgrade scenarios, preserving full party IDs, package IDs, and the IDs of contracts active at save. Persisted state also lets them resume work after a reboot.

The component manages Sandbox shutdown and restart so that database capture and restore happen while it is stopped. Restore uses the saved database state without re-uploading DARs, reallocating parties, or recreating contracts.

**Total request: 378,000 CC across three milestones.** Implementation and release take **6 weeks**, followed by adoption and **12 months of maintenance**.

The component responds to RFP 19 and brings the “Ledger Snapshot Plugin” use case from its linked [DPM use-case list](https://docs.google.com/document/d/1TCkM0Cq4bxIct55wvfZLmr720yhiUCXskN3AKX99lcY/edit?tab=t.0) to Sandbox. LocalNet is excluded because [Canton DevKit](https://bitdynamics-ab.github.io/canton-devkit/) already provides LocalNet snapshot and restore.

---

## Specification

### 1. Objective

Deliver `dpm ledger-snapshot`, an open-source DPM component for saving and restoring named snapshots of a Canton Sandbox ledger, with documented commands, explicit compatibility checks, and read-only verification of restored state. Section 2 specifies the commands.

#### Scope

In scope:

- Management of one local PostgreSQL-backed Canton Sandbox through `init`, `start`, `stop`, and `status`.
- Named snapshot save/restore, read-only verification of restored state, and a test hook.
- DPM/OCI distribution, documentation, and two runnable reference workflows: repeated upgrade testing, and a CI job that prepares a fixture once and restores its baseline before each suite.
- Adoption and maintenance.

Out of scope:

- LocalNet, shared or remote networks, production backup, and disaster recovery.
- PostgreSQL installation; checkpointing PQS, Splice services, wallets, application databases, or client processes.
- Host-clock rewind or simulated-time orchestration, package hot-swapping, and automatic migration to arbitrary future runtimes.

### 2. Implementation mechanics

Ledger Snapshot configures one managed Canton Sandbox to use Canton’s existing PostgreSQL storage support. It coordinates offline capture and restore of four stores: participant (`sandbox`), sequencer (`sequencer1`), the reference sequencer’s block store, and mediator (`mediator1`). Developers supply the PostgreSQL instance; the component does not install it or require Docker.

`init` checks that the selected Canton runtime can connect to and use the developer-provided PostgreSQL instance, creates the four databases if needed, and records the managed instance’s configuration and databases. On the first `start`, the component launches Sandbox using `dpm sandbox --config <file>` against empty databases. On subsequent starts, including restarts after `save` and `restore`, the component launches the same DPM-provided Canton runtime in daemon mode with the complete Sandbox configuration, without rerunning `bootstrap.canton`. On the tested Canton 3.5.6 configuration, rerunning the bootstrap on persisted stores exits with `TOPOLOGY_MAPPING_ALREADY_EXISTS`, the failure SyncVotes also reports (Motivation).

`save` and `restore` operate only on the Sandbox registered by `init`, using local endpoints. If the Sandbox uses in-memory storage, its running process does not match the instance record, or the configured databases belong to another Canton instance, `status` reports save/restore as unavailable, and both commands refuse to proceed.

`save` and `restore` require exclusive use of the managed Sandbox and its four dedicated databases. Before either command, the developer must stop application writers and administrative changes, wait for outstanding work to finish, and keep those clients stopped until the command completes. The component serializes its own lifecycle operations with an instance lock.

`save` enumerates parties and packages and reads the full ACS at one ledger offset; that offset applies only to the ACS. Before any database dump or replacement, the component gracefully stops the entire managed Canton process, waits for it to exit, and checks that no other client sessions remain on the four databases. If the process does not exit or unexpected sessions remain, the operation is aborted. Canton remains stopped throughout the database operation, following the consistency requirements described in [Canton’s backup and restore guide](https://docs.canton.network/global-synchronizer/production-operations/node-backup-restore).

`save` captures the four stores using `pg_dump`. `restore` validates all required dumps and checksums before replacing any database using `pg_restore`. It does not re-upload DARs, reallocate parties, or recreate contracts.

| Command | When it returns |
| --- | --- |
| `save` | The snapshot is finalized and the same Sandbox is restarted without bootstrap, ready for submissions. A restart failure is reported even if the snapshot is valid. |
| `restore` | The saved databases are restored, Sandbox is restarted without bootstrap, and read-only verification passes. Sandbox is ready for submissions. |
| `test --snapshot NAME -- CMD` | `CMD` runs only after restore and verification succeed. The command returns when `CMD` finishes. |

If restore fails after database replacement begins, the component leaves the Sandbox stopped and does not run the test command.

`conformance` compares full party IDs, package id, name, and version, and the contracts that were active at save. It submits no commands.

`start` and `stop` use the recorded instance. `list`, `describe`, and `delete` manage snapshots on disk. `config` shows or stores connection and storage settings. Precedence is CLI flags, then `LEDGER_SNAPSHOT_*`, then `.ledger-snapshot.yaml`, then `daml.yaml`, then defaults (`127.0.0.1`, JSON API `6864`, Ledger API `6865`).

A snapshot is a directory `.ledger-snapshots/NAME/`. `stores/` is what `restore` applies. `manifest.json` records the schema version, the four-store layout, component and runtime versions, the config hash, the capture offset, the clock mode, and checksums. `parties.json`, `packages.json`, and `acs.json` are used only to verify the restored state.

The snapshot excludes external services such as PQS. Connected applications may retain later changes in their own databases, caches, or saved stream positions. Developers must reset or rebuild that application state to match the restored checkpoint before resuming; restarting the connection alone is insufficient. See the [backup and restore guide](https://docs.canton.network/global-synchronizer/production-operations/node-backup-restore). Restore is limited to tested, compatible runtime versions. Host time is not rewound.

Packaging follows [Reference-DPM-Component](https://github.com/canton-network-devs/Reference-DPM-Component) and needs DPM 1.0.17 or newer, which is where `components:` is documented. The consumer `daml.yaml` pins `canton-open-source` and this component and does not set `sdk-version` beside `components:`. The proof of concept is Bash. If dump, restore, or conformance outgrows shell, the commands stay the same. A [recording](https://youtu.be/1b8ppTOEdAA) demonstrates the proof of concept.

### 3. Architectural alignment

Ledger Snapshot extends Canton's developer tooling layer by orchestrating the existing Sandbox lifecycle. It ships as a DPM-native component (`components:` in `daml.yaml`, OCI install), matching how Canton developers already acquire tools, and targets the Hardhat-like local development gap highlighted in the [Canton Network developer experience survey analysis](https://forum.canton.network/t/canton-network-developer-experience-and-tooling-survey-analysis-2026/8412) (Motivation). That focus fits CIP-0082-style common-good / dev-tools investments while staying composable with DAR deploy CLIs and with testing and debugging tools. Those tools help set up or inspect the ledger; Ledger Snapshot restores a known Sandbox baseline between test runs, using the documented Canton Postgres backup/restore path (Section 2).

### 4. Backward compatibility

No change to the Daml language, the Canton protocol, or existing DPM commands. Projects that do not install the component are unaffected. `schemaVersion` in `manifest.json` keeps a later snapshot format from being restored as if it were this one.

---

## Milestones and Deliverables

### Milestone 1: Sandbox state restore

- **Estimated delivery:** 4 weeks from project start.
- **Funding:** 180,000 CC.
- **Focus:** Implement the Section 2 path on the persistent Sandbox, from the proof of concept ([recording](https://youtu.be/1b8ppTOEdAA)).
- **Deliverables / value metrics:**
    - Public GitHub repository under an Apache-2.0 (or Foundation-approved) license.
    - Public alpha of `dpm ledger-snapshot` for that path, including `init` and the instance record.
    - Automated tests cover initial setup with `init` and at least two subsequent restores; refusal of snapshot operations on an in-memory Sandbox; failure reporting for missing, corrupt, or partial dumps, or a nonzero `pg_restore` exit code; acceptance of new commands and preservation of baseline IDs after `save`; client submissions after a standalone `restore` without an additional unpause step; removal of contracts created after `save` and reactivation of baseline contracts archived after `save`; successful submission of a command using a saved contract ID after restore, followed by another restore to return to the saved baseline; and refusal of operations when the instance record is stale.
    - README for Sections 1–4.

### Milestone 2: Stable Sandbox release and go-to-market

- **Estimated delivery:** 2 weeks after Milestone 1.
- **Funding:** 90,000 CC.
- **Focus:** Release `v1.0.0` for Sandbox development and CI, including the two reference workflows in Scope.
- **Deliverables / value metrics:**
    - Tagged `v1.0.0`, installable with `dpm install` from OCI and from a local path for contributors. Release notes list the tested OS, architecture, DPM, and Canton versions, which older snapshots that release can still restore, and save/restore time on the example fixture against a fresh start plus equivalent fixture setup (Motivation).
    - Both Scope workflows runnable from the public docs: a repeated upgrade scenario, and a CI job that prepares the fixture once, saves a baseline, and restores it before each suite.
    - Quickstart and example repository, including the PostgreSQL overlay, that a new developer can finish from the docs alone.
    - Article and video tutorial in English and Spanish.
    - The Milestone 2 items in Co-Marketing. A request there does not commit the Foundation.
    - Blocking issues from the Milestone 1 alpha fixed, or documented with a workaround, in the release notes.

### Milestone 3: Adoption and maintenance

- **Estimated delivery:** starts after M2; adoption within 90 days, maintenance for 12 months.
- **Funding:** 108,000 CC: 36,000 for adoption and 72,000 for maintenance.
- **Focus:** Verified recurring use on Sandbox, then 12 months of compatibility. Amounts and payment rules stay in Funding.
- **Deliverables / value metrics:**
    - **Recurring use.** An external team restores a baseline it saved, in its own repeated Sandbox workflow, and confirms in writing that full party IDs and the contract IDs active at save still resolve. At most three teams count toward the adoption payment (Funding).
    - **Written evaluations.** Two of those confirmations are short evaluations of the quickstart. The first adoption payment requires both (Funding).
    - **Maintenance.** For 12 months after Milestone 2, keep the component working with the current Canton SDK major, and adapt to a new SDK major within 30 days of its release. Each compatibility release states which snapshot formats and Canton runtimes it can still restore. Support is issue triage, those releases, and docs kept aligned with Sections 1–4.
    - One quarterly report per maintenance payment (Funding): compatibility work done, open issues, and any team confirmed that quarter.
    - The Milestone 3 items in Co-Marketing.

---

## Acceptance criteria

- The repository is public and Apache-2.0 (or Foundation-approved) before any milestone payment.
- The only restore path is Section 2.
- Milestone 1 is accepted when its tests pass on the documented overlay.
- Milestone 2 is accepted when `v1.0.0`, both reference workflows, and the quickstart are public.
- Milestone 3 is accepted when adoption and maintenance match that milestone and the Funding section.

---

## Funding

**Total funding request: 378,000 CC across three milestones** 

### Team dedication

- **M1:** 4 weeks; Technical Lead (Ignacio Fernandez) 0.5 FTE + Engineer (Gimer Cervera) 1 FTE ≈ 240 hours.
- **M2:** 2 weeks; same team ≈ 120 hours.
- **M3:** About 8 engineering hours per month for maintenance (96 hours, 72,000 CC), plus up to 48 hours of onboarding support (16 per adopting team, 36,000 CC).

### Payment breakdown

- **M1:** 180,000 CC upon committee acceptance.
- **M2:** 90,000 CC upon committee acceptance.
- **M3 maintenance:** 18,000 CC per accepted quarterly report, four payments totaling 72,000 CC.
- M3 adoption: the committee releases 12,000 CC to CoBuilders for each external team that meets the recurring-use criterion, covering up to 16 hours of onboarding support for that team. At most three teams are paid (36,000 CC). The first of these payments also requires the two written evaluations.

### Volatility stipulation

Funding is denominated in fixed Canton Coin. Review the remaining maintenance/adoption commitment with the committee at six months; no automatic repricing is assumed.

---

## Co-Marketing

CoBuilders will collaborate with the Foundation. Nothing in this list is a commitment by the Foundation.

At the Milestone 2 release:

- Coordinate an announcement on Foundation and CoBuilders channels.
- Request one technical blog post or short video: install via DPM, prepare a Sandbox fixture, `save`, then `restore` between suites.
- Submit the component for Canton developer documentation and DPM component directories where those lists exist.

During Milestone 3:

- A short community post when an external team adopts the component or a compatibility release ships.
- A Canton Development Fund acknowledgment in the README and release notes.

---

## Motivation

Canton’s [testing guidance](https://docs.canton.network/appdev/modules/m5-testing-strategies#test-isolation) suggests reusing a running instance with unique parties and users to reduce setup overhead and support parallel tests. The default [`dpm sandbox`](https://docs.canton.network/sdks-tools/development-tools/sandbox), however, stores its ledger in memory and loses that state on shutdown. 

- **Re-running upgrade tests from a prepared first-version state.** Canton rejects a second package with the same name and version as one already vetted when the content differs ([`KNOWN_PACKAGE_VERSION`](https://github.com/digital-asset/canton/blob/c548c9ba15d1f22f820ec2409d972b2b9e04a73b/community/base/src/main/scala/com/digitalasset/canton/topology/TopologyManagerError.scala#L1345-L1365)); the [Daml upgrade guide](https://github.com/digital-asset/daml/blob/1913ae3cf595c7e37ae03b075307621d534f02ec/sdk/docs/manually-written/sdk/sdlc-howtos/smart-contracts/upgrade/smart-contract-upgrades.rst?plain=1#L1649-L1658) documents restart and version changes as workarounds. Restarting an in-memory Sandbox also discards the prepared fixture. Changing a candidate’s version or replacing its vetting can permit another iteration, but neither recovers first-version contracts consumed by the preceding test. A checkpoint taken after preparing the v1 fixture and before uploading v2 restores the contracts, packages and vetting together. Each revised candidate can then be tested at the same intended v2 version against the original v1 contracts, with the v1 contract IDs unchanged.
- **Keeping a development ledger across sessions.** SyncVotes configured its SDK 3.4.11 Sandbox to retain parties and contracts in a local H2 database, then documented that restarting persisted state on SDK 3.5.7 failed with `TOPOLOGY_MAPPING_ALREADY_EXISTS` and described its local Sandbox as a scratch ledger ([configuration](https://github.com/SYNCVOTES/syncvotes/blob/807deefabeef8c2b3175556fa31178a001c73287/canton.conf#L1-L4), [restart report](https://github.com/SYNCVOTES/syncvotes/blob/0a52898998c8815115ae4fe4e599edcb8d1e94c6/README.md?plain=1#L160-L162)). This illustrates why a storage overlay alone is insufficient. The component manages persistent Sandbox storage and resumes initialized nodes without repeating the Sandbox bootstrap, allowing developers to continue from their prepared ledger after shutdown.

**Who benefits.** Application teams using Sandbox for development and integration testing, with PostgreSQL available locally or in CI. For suites that already start fresh on every run, we will publish restore timings against a fresh start plus equivalent fixture setup. The IDE ledger used by `dpm test`, and LocalNet, are outside scope.

**How it supports adoption.** The [2026 developer survey](https://forum.canton.network/t/canton-network-developer-experience-and-tooling-survey-analysis-2026/8412) identified local development frameworks as the most critical tooling gap. This component addresses one concrete part of that gap through the DPM workflow developers already use. The published upgrade-testing example and CI workflow (Milestone 2)  will give teams practical starting points for using checkpoints in their own projects.

---

## Rationale

**Why state restore.** Rebuilding a fixture by uploading DARs and creating contracts again does not keep party and contract IDs, and it can fail vetting with `KNOWN_PACKAGE_VERSION` (Motivation). This proposal does not include that rebuild. The only path is the stopped-store restore in Section 2, which does not hot-swap packages or bypass smart contract upgrade.

**Why a DPM component under RFP 19.** Named checkpoints are not a ledger API. RFP 19 asks for reusable DPM components with documentation, examples, and a maintenance plan. The CI workflow and the test hook also match RFP 18. The funded artifact is the component, so the proposal is classified under RFP 19, with RFP 18 secondary, as in the header.

**Why a component rather than a one-off script?** Canton can already run scripts headlessly. This component is the reusable checkpoint: the instance record and command boundaries in Section 2, plus a test hook, so a project does not write its own dump and restart sequence. That value does not depend on the current bootstrap issue (Motivation): if a future Sandbox bootstrap tolerates a persisted store, the restart step gets simpler, but a consistent capture of all four stores with writers stopped, a verified restore, and conformance are still needed. It does not replace `dpm script` or Canton Console.

---

## Why us

CoBuilders is a Web3 engineering studio. We have delivered work for and alongside **Arbitrum, the Nomic Foundation, OpenZeppelin, CoW Protocol, Tools for Humanity (World), and ZetaChain**. More at [cobuilders.xyz](https://www.cobuilders.xyz/).

The track record most relevant here:

- **Hardhat plugin suite for Arbitrum Stylus** ([`@cobuilders/hardhat-arbitrum-stylus`](https://www.npmjs.com/package/%40cobuilders/hardhat-arbitrum-stylus), live on npm). A Hardhat 3 plugin suite that brings the Stylus lifecycle (local node, compile, deploy, test) into Hardhat: four composable plugins, automatic EVM vs WASM detection, and cross-VM testing in one project. Built with support from the Arbitrum Stylus Sprint. It is the same pattern as this proposal: a missing local workflow added to the toolchain developers already use. [Repo](https://github.com/CoBuilders-xyz/hardhat-arbitrum-stylus) | [Docs](https://cobuilders-xyz.github.io/hardhat-arbitrum-stylus/)
- **Direct work with the Nomic Foundation**. We have provided technical capacity directly to the team behind Hardhat. Working with Hardhat’s creators is strong evidence of our fit for this proposal.

Proposed team:

- Augusto Collerone, CTO and Co-Founder: [LinkedIn](https://www.linkedin.com/in/augusto-collerone/) | [GitHub](https://github.com/augustocollerone)
- Ignacio Fernandez, Technical Lead: [LinkedIn](https://www.linkedin.com/in/ignacio-fq/) | [GitHub](https://github.com/nachfq)
- Gimer Cervera, Ph.D., Blockchain Engineer: [LinkedIn](https://www.linkedin.com/in/gimercervera/) | [GitHub](https://github.com/Gimer0x)