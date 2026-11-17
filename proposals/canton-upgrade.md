## Development Fund Proposal

**Author:** Shanu | LYNC<br/>
**Status:** Draft <br/>
**Created:** 2026-11-02<br/>
**Label:** daml-tooling<br/>

**Champion:** TBD

---

## Abstract

This proposal outlines a grant to build **canton-upgrade**, a DPM component invoked as `dpm canton-upgrade`, that covers the part of a Daml release that comes after the first deploy: moving a package from v1 to v2 on a live Canton participant and its counterparties.

Today two tools touch this, and neither answers the operational questions. `dpm upgrade-check` answers whether two DAR files are compatible with each other. The Canton console and Admin API answer everything else, one Scala snippet or curl at a time. What nobody answers in one place is: will my participant accept v2, who else has it vetted, which version will my backend actually run, how many contracts are still on v1, and is it safe to unvet v1?

**canton-upgrade** closes that gap with eight commands: `validate`, `rehearse`, `vet-status`, `pin`, `status`, `migrate`, `unvet` and `gate`. It follows the operational sequence in the official Upgrade Deployment and Smart Contract Upgrades in Production guides, and turns the production checklist into commands a developer can run and a CI pipeline can block on.

It is the companion to `canton-deploy` (Daml Deployment Toolkit, PR #322): `canton-deploy` handles the first deploy, `canton-upgrade` handles every release after it. It is implemented as a Node.js/TypeScript DPM component (Node.js 18+), published to an OCI registry and installed via `dpm install package`.

**Out of scope:** `dpm upgrade-check` remains the static compatibility check and is not wrapped. `damlc` remains the compiler, `daml-script` the script engine, DPM the package manager. The component never uploads or vets on a real network, only `rehearse` uploads, and only on a local sandbox.

Total request: **220,000 CC** across three milestones over approximately one month.

---

## Specification

### 1. Objective

The primary objective is to deliver an open-source DPM component that makes a Daml smart contract upgrade on Canton a documented, repeatable sequence of commands instead of a hand-walked checklist: validate the new DAR against the live participant, rehearse it locally, confirm counterparty vetting, pin package ids for backends, count and migrate old contracts, and unvet the old version safely. It works with one package or several, walking them in dependency order, the same order as `multi-package.yaml`.

### 2. Implementation Mechanics

#### What an upgrade is

A new DAR does not replace the old one. Both stay on the ledger. A contract keeps the package version that created it until a choice archives it. The ledger runs the new choice code against old contracts only when the change is a legal smart contract upgrade. There is no bulk migration and no way to delete an uploaded package.

#### The operational sequence

The sequence follows the Upgrade Deployment and Smart Contract Upgrades in Production guides:

1. Confirm v2 is upgrade-compatible with v1 with `dpm upgrade-check`. This component does not wrap that command.
2. Validate v2 against the packages already vetted on the participant, before upload. Validation does not persist the DAR.
3. Upload v2 without vetting it, and send the DAR to counterparties.
4. Vet v2 on the switch-over date, once every counterparty is ready.
5. Point backends at a specific package id so the ledger cannot pick a different version.
6. Migrate contracts that must carry v2 data by exercising an `Upgrade` choice.
7. Unvet v1 only after no v1 contracts remain.

#### Dependencies

| Dependency                      | Why it is needed                                                        | Install                              |
| ------------------------------- | ----------------------------------------------------------------------- | ------------------------------------ |
| **DPM**                         | Host for the component, resolves and runs `dpm canton-upgrade`          | Bundled with the Daml SDK            |
| **Node.js** ≥ 18                | Runtime for the component                                               | nodejs.org or package manager        |
| **`damlc`** DPM component       | Compiles the `setup` script against the old and new DARs during `rehearse` | Installed via `dpm install package`  |
| **`daml-script`** DPM component | Runs the `setup` script during `rehearse`                               | Installed via `dpm install package`  |
| **A Canton participant**        | Target for every command except `rehearse`, Ledger and/or Admin API reachable | LocalNet via `dpm sandbox`, or a managed validator |

Network profiles, ports, TLS and token resolution follow the same conventions as `canton-deploy`, so a project that already deploys with `canton-deploy` can upgrade with the same configuration.

---

### What Goes Wrong Today

1. A command can run under a package version the client was not built for, and the error does not say that.
2. There is no simple way to see which participants have vetted a DAR.
3. The safe upload order (check, then upload, then confirm) is not obvious. Teams learn it by asking.
4. A production upgrade is still a checklist someone walks through by hand.

Forum threads and docs for each are listed in [Motivation](#motivation).

---

### Supported Commands

### `dpm canton-upgrade validate`

Checks whether the participant would accept the new DAR, without saving it.

```
dpm canton-upgrade validate --network devnet
```

`dpm upgrade-check` only compares two files on your machine. It does not look at what the participant has already vetted, so a passing check does not mean the participant will accept the new DAR. On current Canton that check also happens when a package is vetted: a bad DAR can be uploaded with vetting turned off and fail later.

`validate` asks the participant to check each new DAR, in package order, and prints ok or the error. It uploads nothing. The answer is only true for that participant, at that moment, so `dpm upgrade-check` still runs alongside it.

### `dpm canton-upgrade rehearse`

Practices the upgrade on a sandbox on your own machine.

```
dpm canton-upgrade rehearse --network localnet
```

It creates contracts, so it only runs when `--network` is `localnet`. The developer starts that sandbox with `dpm sandbox`. DevNet and MainNet are for the other commands.

The developer writes one script, `setup`, that creates a few contracts. `rehearse` uses it in three steps:

1. Uploads the old DAR and runs `setup` built against that DAR. The contracts it creates are the old version, because the new DAR is not on the ledger yet.
2. Uploads the new DAR and runs `setup` built against that DAR. If this fails to build, the script still uses a field or a shape the new version does not allow.
3. Runs `setup` once more, still built against the old DAR, with no package pin, and prints the package id of the contracts this run creates.

A plain `createCmd` does not send a package id. Once the new DAR is vetted, the participant resolves the package name to the highest vetted version, so the contracts from this run are the new version. `rehearse` prints that id. It does not fail on it. Staying on the old version takes `createExactCmd` or `packagePreference` in the script. `dpm script` has no flag for that. There is no second script to write. Several packages follow the same three steps, dependencies first.

The sandbox starts empty. A pass means the upgrade worked for the contracts the script created, it says nothing about contracts already on DevNet. Those are what `validate`, `status` and `migrate` are for.

### `dpm canton-upgrade vet-status`

Shows who has the new DAR, and which version a real submission would use.

```
dpm canton-upgrade vet-status --network devnet
```

For each package it prints two things. First, for every named counterparty: new version vetted, missing, or only the old version. Second, the package id the network would actually pick for those parties, or why no version is vetted by all of them.

Today the way to answer "who has my DAR" is a console loop. This prints the same answer as a table, and also answers the follow-up: not only whether they uploaded it, but which version the network would choose. It only sees what the operator's participant sees.

### `dpm canton-upgrade pin`

Writes down the exact package ids a backend should send, so the ledger cannot pick a different version.

```
dpm canton-upgrade pin --network devnet
```

It writes `upgrade-pin.json`. For each package the file has the old and new package ids, the template ids that include the package id, and the preference list a client sends when it submits by package name. The ids come from the same lookup as `vet-status`.

With no preference, the participant uses the highest vetted version. A client built for the old version can then run the new one, or the other way around, and only fail later. Putting the ids in a file means the backend does not copy them by hand.

Pinning is for the switch-over window. A client stuck on the old package id fails once new contracts have the new field filled in, so clients move forward after that. The file does nothing until the backend reads it.

### `dpm canton-upgrade status`

Counts how many active contracts are still on each version.

```
dpm canton-upgrade status --network devnet
```

For every old and new DAR it groups active contracts by template and package id. It only reads.

A contract stays on the version that created it until something archives it. Nothing moves contracts automatically, so before a migration or an unvet the operator needs the count. The production guide shows this as a PQS query over the database. This command reads the ledger instead, and the count is only the contracts visible to the parties the token can read. `migrate`, `unvet` and `gate` all use this number.

### `dpm canton-upgrade migrate`

Moves old contracts to the new version by exercising the project's `Upgrade` choice.

```
dpm canton-upgrade migrate --network devnet --dry-run
dpm canton-upgrade migrate --network devnet
```

It finds active contracts created by the old DAR and exercises the `Upgrade` choice on each one, in dependency order when there are several packages. `--dry-run` lists the contracts and submits nothing. A failure is reported per contract, and the command can be run again.

The docs say to walk the active contracts and exercise `Upgrade` by hand. This is that loop, with a dry run and a failure report per package.

The `Upgrade` choice has to already exist on the old template. The command can only act as parties its token can act as. It submits one exercise per contract, batching several contracts into one choice is a decision made in the Daml model.

### `dpm canton-upgrade unvet`

Removes vetting of the old DAR once no old contracts are left.

```
dpm canton-upgrade unvet --network devnet
```

It unvets the old DAR of each package, in order. If `status` still shows contracts for a package, it stops, unless `--force` is passed.

On Canton 3.4 and later a higher compatible version can stay vetted, and old contracts can still be exercised through it, so Canton will unvet the old DAR even while old contracts remain. This command checks `status` first and stops when that count is above zero, because in-flight workflows that still need the old version can get stuck. It reports how many contracts are left, across every package in the list, without a console session.

### `dpm canton-upgrade gate`

One pass or fail for CI.

```
dpm canton-upgrade gate --network devnet --require-vetted --require-migrated
```

It runs `validate` and `vet-status` for every package. With `--require-migrated` it also runs `status` and fails if any old contract is left. It never uploads, vets, migrates or unvets.

The production guide is a checklist: compatibility passed, counterparties confirmed. `gate` turns those two checks into an exit code a pipeline can block on. `dpm upgrade-check` stays a separate step in front of it.

---

### Release Sequence

```
dpm upgrade-check --both old.dar new.dar
dpm canton-upgrade validate --network devnet
dpm canton-upgrade rehearse --network localnet
# upload the new DAR with vetting turned off
dpm canton-upgrade vet-status --network devnet
dpm canton-upgrade pin --network devnet
# vet the new DAR on the switch-over date
dpm canton-upgrade migrate --network devnet --dry-run
dpm canton-upgrade migrate --network devnet
dpm canton-upgrade gate --network devnet --require-vetted --require-migrated
dpm canton-upgrade unvet --network devnet
```

---

### Assumptions

- Vetting rules changed in Canton 3.4. The component will publish a stated list of Canton versions it is tested on.
- `rehearse` is only as good as the `setup` script the developer writes.
- `vet-status` and `pin` only see what the operator's participant sees.

---

### 3. Architectural Alignment

This proposal aligns with Canton priorities because:

- Smart Contract Upgrades are Canton's mechanism for evolving live applications, and the official guides describe the production process as a manual checklist. This component turns that checklist into tooling.
- Recurring forum threads (listed in References) show developers hitting the same upgrade questions repeatedly: wrong package version at runtime, who has vetted a DAR, safe upload order, and when the old DAR can be unvetted.
- The work aligns with CIP-0082's named targets of "dev tools" and "critical infra" as common-good investments, and extends the deployment tooling already funded under the Daml Deployment Toolkit.

### 4. Backward Compatibility

No backward compatibility impact. The component is additive, read-only on real networks except for `migrate` and `unvet`, and never uploads or vets outside a local sandbox.

---

## Milestones and Deliverables

### Milestone 1: *(Read-only upgrade commands on LocalNet and DevNet)*

- **Estimated Delivery:** 10 days from project start
- **Focus:** MVP of the read-only commands that answer the operational questions before an upgrade: `validate`, `vet-status`, `pin` and `status`, with single and multi-package support. Verified against LocalNet and a self-hosted DevNet validator.
- **Deliverables / Value Metrics:**
  - Public release on GitHub of the MVP component, runnable from any Daml project root.
  - `validate`, `vet-status`, `pin` and `status` working end-to-end on LocalNet and DevNet, in dependency order for multi-package projects.
  - `upgrade-pin.json` format documented.
  - Value metric: at least one external Canton-builder team (outside LYNC) running the MVP against their own upgrade by milestone end.

### Milestone 2: *(Full upgrade lifecycle, Documentation, OCI Distribution)*

- **Estimated Delivery:** 1 week after milestone 1
- **Focus:** Add the commands that act: `rehearse`, `migrate`, `unvet` and `gate`. `rehearse` verified on LocalNet. `migrate` and `unvet` verified on all four networks, using a package created for this proof. `validate`, `vet-status`, `pin`, `status` and `gate` verified on all four.
- **Deliverables / Value Metrics:**
  - `rehearse` on a fresh LocalNet sandbox: upload the v1 DAR, then the v2 DAR. When a `setup` script is configured, run it against each DAR and print the package id the participant selected for an unpinned create. DevNet, TestNet and MainNet reject `rehearse`.
  - `migrate` with `--dry-run`, per-contract failure reporting and safe re-runs, verified on all four against a package created for this proof.
  - `unvet` with the active-contract check and `--force`, verified on all four after `status` shows no v1 contracts left for that package.
  - `gate` returning stable exit codes for CI, with an example pipeline.
  - Release sequence from v1 to v2 verified on all four. Upload and vet in that sequence stay on `canton-deploy`. `rehearse` runs on LocalNet only.
  - Published list of tested Canton versions, including 3.4 vetting behaviour.
  - Public OCI registry release of the component, versioned against Canton SDKs with a documented release process.
  - Complete developer documentation: installation, configuration, every command, the release sequence, writing a `setup` script and an `Upgrade` choice, and CI usage. Hosted at [docs.lync.world](https://docs.lync.world/) and at a Foundation-approved location.
  - Repo published under Apache 2.0.
  - Value metric: at least one Canton application provider using the component for a real upgrade on TestNet or MainNet by milestone end.

### Milestone 3: *(GTM and Ecosystem Adoption)*

- **Estimated Delivery:** 2 weeks after milestone 2
- **Focus:** Go-to-market for the completed upgrade component.
- **Deliverables / Value Metrics:**
  - Announcement coordination via @lyncworld (74K+ followers) and @bhushanvishwas (17.7K followers).
  - Inclusion of Canton Foundation branding within the component as a grant recipient.
  - "Upgrade your Daml package on Canton without downtime" tutorial with an example repository holding a v1 and v2 package, a `setup` script and an `Upgrade` choice.
  - Tutorial video walking through the full release sequence from `validate` to `unvet`, published on YouTube and embedded in the documentation.
  - Replies on the forum threads listed in Motivation pointing to the relevant command.
  - Submission for inclusion in Canton's developer resources directory and the Smart Contract Upgrade docs.

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone.
- Demonstrated functionality: a committee member or delegate can install the component, follow the published documentation, and complete the milestone-specific upgrade flow end-to-end.
- Each milestone's documentation is sufficient for an independent Canton developer to use the relevant features.

Project-specific acceptance conditions:

- All code released in a public GitHub repository before any milestone payment.
- OCI component release (at Milestone 2) and docs published.
- Canton SDK compatibility: the component will track the latest Canton SDK major within 60 days of any new release during the grant period.

---

## Funding

**Total Funding Request:** 220,000 CC (Canton Coin).

### Payment Breakdown by Milestone

- Milestone 1 *(Read-only upgrade commands on LocalNet and DevNet)*:  50,000 CC upon committee acceptance
- Milestone 2 *(Full upgrade lifecycle, Documentation, OCI Distribution)*:  50,000 CC upon committee acceptance
- Milestone 3 *(GTM and Ecosystem Adoption)*: 120,000 CC upon acceptance

### Volatility Stipulation

The grant duration is 1 month. The grant is valued at $20,000 USD. Funding will be disbursed in Canton Coin, with the CC amount for each milestone calculated using the prevailing USD/CC exchange rate at the time of that disbursement, so that the total value received across the grant equals the USD value regardless of CC price movement during the funding period.

## Co-Marketing

Upon release, LYNC will collaborate with the Foundation on:

- Announcement coordination across Foundation and LYNC channels at each milestone.
- A technical blog post and video walking developers through a full v1 to v2 upgrade with the component.
- Documentation inclusion: submission to Canton's official Smart Contract Upgrade documentation and developer onboarding channels.
- Co-marketing on X: launch announcement coordinated across LYNC and Canton Foundation X accounts, with cross-amplification on major release.

---

## Motivation

Every Daml application that lives long enough ships a v2. The Smart Contract Upgrade model makes this possible without downtime, but the operational side is left to the team: both DARs stay on the ledger, contracts stay on the version that created them, counterparties must vet before switch-over, backends can silently run a version they were not built for, and unvetting the old DAR while workflows still need it can strand those workflows even after Canton 3.4 allows the unvet.

The forum shows the cost: a by-name submission that ran a package version the client was not built for, a console loop as the only way to see who has vetted a DAR, and DevRel explaining the validate, upload, verify order thread by thread.

- [Client runs under a package version it was not compiled against](https://forum.canton.network/t/scu-a-command-can-run-under-a-package-version-the-client-was-not-compiled-against/9213) (Oct 2026): the two DARs were a valid upgrade, and a by-name submission still ran the newer version. → `pin`, `rehearse`
- [Upload earlier versions of SCU-compatible DARs?](https://forum.canton.network/t/distribute-and-upload-earlier-versions-of-scu-compatible-dars/8649) (May 2026): which versions to vet, and when v1 can go. → `vet-status`, `unvet`
- [Deterministic Settlement Confirmation Blocker](https://forum.canton.network/t/deterministic-settlement-confirmation-blocker/8992) (Jul 2026): DevRel lays out validate, then upload, then verify. → `validate`, `vet-status`
- [Changing a field from mandatory to Optional](https://forum.canton.network/t/upgrading-a-template-by-changing-a-field-from-being-mandatory-to-optional/8634) (May 2026): a type change falls outside SCU, so contracts need an explicit migration. → `validate`, `migrate`

After building `canton-deploy` for the first deploy, upgrades were the next wall we hit on our own Canton products. `canton-upgrade` solves it for everyone.

---

## Rationale

**Why a separate component instead of extending `canton-deploy`?**

Deploying and upgrading are different jobs with different risk. `canton-deploy` uploads and vets. `canton-upgrade` deliberately never uploads or vets on a real network, so it can run in CI and against MainNet as a checker without the power to change topology. Keeping them separate keeps that guarantee simple.

**Why not wrap `dpm upgrade-check`?**

It already does its job well, and it answers a different question: whether two files are compatible. `canton-upgrade` answers what the live network will do. The release sequence keeps `upgrade-check` as the first step.

**Why DPM components instead of npm packages?**

- Canton developers already run DPM, adding npm globals is friction the ecosystem does not need.
- Components declared in `daml.yaml` are pinned per project and tied to the SDK the project compiles against.
- Canton developers find first-party tooling through DPM components.

### Maintenance & Support

LYNC will provide maintenance and support for canton-upgrade for 6 months following final delivery. This covers bug fixes, compatibility updates, including Canton SDK compatibility within 60 days of new SDK releases per the acceptance criteria, and minor improvements based on Committee or community feedback. Beyond this window, continued maintenance will be scoped and proposed separately, so the Committee can evaluate ongoing funding based on real-world adoption.