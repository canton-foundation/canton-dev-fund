# Ledger Snapshot DPM Component

**Author:** CoBuilders  
**Status:** Draft  
**Created:** 2026-07-19  
**Label:** daml-tooling  
**Champion:** [Need Champion](https://github.com/canton-foundation/canton-dev-fund/blob/main/sig-directory.md)

---

## Abstract

This proposal requests funding to build a **Ledger Snapshot** **Plugin** (`dpm ledger-snapshot`). Our goal is to provide an open-source DPM component that brings Hardhat-style **named save/restore** to Canton **local** development.

Today, developers on Sandbox or LocalNet repeat an expensive bootstrap before every meaningful test pass: start the environment, upload DARs, allocate parties, run setup scripts, then run tests. When tests mutate ledger state, the next suite usually needs that whole bootstrap again. Ethereum teams use `evm_snapshot` and `evm_revert`; Canton has no equivalent packaged as a first-class DPM workflow.

**Ledger Snapshot** closes that gap for **local environments**. Developers initialize once, `save` a named baseline, run tests, `restore`, and run again without re-running the full bootstrap. The component guarantees an **equivalent ledger state** (parties, packages, Active Contract Set) visible to developers, although not an exact copy, since offsets and contract IDs cannot be matched.

Ledger Snapshot is complementary to other projects such as Canton DevKit and to the DPM Ledger Operations suite. Those tools help you start LocalNet, inspect ledger state, and run or record tests; Ledger Snapshot restores a saved baseline to be used during testing workflows.

This grant funds the completion of save, restore, and snapshot management and configuration, conformance checks, LocalNet support, OCI distribution, documentation, and ecosystem adoption. A video showing basic functionality of our PoC against Sandbox can be found [**at this link**](https://drive.google.com/file/d/1ZiQQXU-M8DvTxPqwTSGzpA74y-AJk5GI/view?usp=sharing).

Total request: **549,000 CC** across four milestones; Milestones 1–3 span a total of **9 weeks**, with Milestone 4 covering adoption and 12 months of maintenance.

---

## Specification

### 1. Objective

The primary objective of this proposal is to deliver a single, documented, open-source DPM component — `dpm ledger-snapshot` — that lets Canton developers **save and restore named local ledger checkpoints** for deterministic testing on `Sandbox` and **`LocalNet`**, with one consistent CLI, clear equivalence guarantees, and post-restore conformance reporting.

#### Scope

The ledger-snapshot component makes local Canton test environments resettable without repeating full bootstrap. In scope:

- `Sandbox` and `LocalNet` (persistent / Postgres-backed configurations).
- Named save / restore of developer-visible state (parties, DAR packages, ACS, and target-specific local metadata such as participant ledger or LocalNet DB state as required).
- Configuration, status, list / describe / delete, conformance check, and test hook.
- Single DPM CLI with `-target sandbox|local` (implementation may differ per backend).

### 2. Implementation Mechanics

Ledger Snapshot is implemented as a thin **DPM CLI component** that orchestrates existing local Canton tooling. At runtime, it talks to a reachable local environment (`Sandbox` or `LocalNet`) over the HTTP JSON / Ledger APIs, captures or restores developer-visible state (parties, packages, ACS, and target-specific local metadata), and stores named checkpoints on disk under `.ledger-snapshots/`. Sandbox restore rebuilds state after a restart: it re-uploads DARs, re-creates parties, and re-creates contracts from the snapshot. LocalNet restore, for supported setups that use Postgres, pauses writing, restores the database or volumes, then starts services again.

Operators install the component via DPM (path or OCI), configure connection settings through flags, env vars, the `daml.yaml` file or an optional `.ledger-snapshot.yaml`, and drive the workflow with `status` → bootstrap once → `save` → mutate → `restore` / `test`, with post-restore **conformance** checks. The subsections below detail packaging, dependencies, snapshot artifacts, backends, and the command surface.

#### Example workflow

```text
1. Start Sandbox or LocalNet
2. Upload DARs
3. Allocate parties
4. Create initial contracts
5. Save snapshot baseline
6. Run test suite A
7. Restore snapshot baseline
8. Run test suite B
9. Restore snapshot baseline
10. Run integration tests
```

#### Packaging and install

Ledger Snapshot is a **DPM component** (based on [Reference-DPM-Component](https://github.com/canton-network-devs/Reference-DPM-Component)).

```yaml
# Consumer daml.yaml (no sdk-version alongside components)
components:
  - oci://ghcr.io/<org>/components/ledger-snapshot:0.x.x
```

```bash
dpm install package
dpm ledger-snapshot --help
```

**Implementation language:** Our PoC is implemented using Bash (thin CLI orchestrating HTTP JSON API + local process/DB coordination). If ACS restore or conformance logic becomes too complex for shell, those internal modules may be rewritten in other languages; users continue to call the same `dpm ledger-snapshot` commands and flags.

Dependencies:

| Dependency                            | Why it is needed                                                 |
| ------------------------------------- | ---------------------------------------------------------------- |
| **DPM** ≥ 1.0.14                      | Host for the component; resolves `dpm ledger-snapshot`           |
| `canton-open-source` (sandbox)        | Local ledger for sandbox target                                  |
| `curl` (PoC) / HTTP client            | JSON API probes and capture                                      |
| **Running local environment**         | Sandbox or LocalNet must be reachable                            |
| **Docker / Postgres** (LocalNet path) | Safe dump/restore of participant Postgres after stopping writers |

#### What a snapshot is

A named directory under `.ledger-snapshots/<name>/` (configurable) containing:

| Artifact                 | Purpose                                                                    |
| ------------------------ | -------------------------------------------------------------------------- |
| `manifest.json`          | Schema version, target, host/ports used, content hashes, equivalence notes |
| `parties.json`           | Allocated parties                                                          |
| `packages.json`          | Known / vetted package set                                                 |
| `acs.json`               | Active Contract Set capture (party-scoped / best-effort → full in grant)   |
| `dars/` _(Milestone 1+)_ | DAR bytes required for restore (or resolvable project paths)               |

**Guarantee:** an **equivalent developer-visible ledger state** — the same parties, uploaded DAR packages, Active Contract Set (ACS), and other application-visible ledger contents required for deterministic testing. From the perspective of a Daml application or integration test, the restored environment behaves as though it had been freshly bootstrapped to the same initial state.

**Does not guarantee:** identical timestamps, ledger offsets, or other runtime metadata not required for functional testing (including contract IDs after logical sandbox rebuild).

#### Architecture: one CLI, two backends

```text
dpm ledger-snapshot <cmd>
        │
        ▼
   Config layer
   (CLI flags > env > .ledger-snapshot.yaml > daml.yaml > defaults)
        │
   ┌────┴─────┐
   ▼          ▼
Sandbox     LocalNet
backend     backend
   │          │
   ▼          ▼
.ledger-snapshots/<name>/
```

| Target   | `--target` | Restore strategy (grant)                                                                                                                                 |
| -------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sandbox  | `sandbox`  | **Logical rebuild:** pause/restart sandbox → re-upload/vet DARs → re-allocate parties → recreate ACS from snapshot → conformance                         |
| LocalNet | `local`    | **Infra restore:** require persistent Postgres → stop writers → restore DB/volumes (documented layout) → restart → optional PQS reset hook → conformance |

#### Basic functionality (command surface)

| Capability                   | Command(s)                                                | Purpose                                                                       |
| ---------------------------- | --------------------------------------------------------- | ----------------------------------------------------------------------------- |
| **Save**                     | `save <name> --target sandbox\|local`                     | Capture the current local ledger state under a named snapshot.                |
| **Restore**                  | `restore <name> --target sandbox\|local`                  | Roll the local environment back to that named snapshot.                       |
| **List / Describe / Delete** | `list`, `describe <name>`, `delete <name>`                | Inspect or remove snapshots stored on disk.                                   |
| **Status**                   | `status --target sandbox\|local`                          | Detect the environment and report whether snapshot save/restore is available. |
| **Conformance Check**        | `conformance <name>`                                      | Compare live parties, packages, and ACS against the snapshot.                 |
| **Test Hook**                | `test --target sandbox\|local --snapshot <name> -- <cmd>` | Restore the snapshot automatically, then run the given test command.          |

**Additional:** `config` — persist or show connection settings (`daml.yaml` or `.ledger-snapshot.yaml`).

**Connection precedence:**

1. **CLI flags** (`-host`, `-json-port`, `-ledger-port`, …)
2. Environment variables (e.g., `LEDGER_SNAPSHOT_PORT`)
3. `.ledger-snapshot.yaml`
4. **defaults** (`127.0.0.1`, JSON `6864`, Ledger `6865` for current `dpm sandbox`).

#### Example commands

```bash
# Status
dpm ledger-snapshot status --target local
dpm ledger-snapshot status --target sandbox

# Save a snapshot
dpm ledger-snapshot save baseline --target local
dpm ledger-snapshot save baseline --target sandbox

# Restore a snapshot
dpm ledger-snapshot restore baseline --target local
dpm ledger-snapshot restore baseline --target sandbox

# List / describe / delete
dpm ledger-snapshot list
dpm ledger-snapshot describe baseline
dpm ledger-snapshot delete baseline

# Conformance
dpm ledger-snapshot conformance baseline

# Run a test using a snapshot
dpm ledger-snapshot test --target sandbox --snapshot baseline -- <test command>
dpm ledger-snapshot test --target local --snapshot baseline -- <test command>
```

Public PoC under development demonstrates:

- Installation as a DPM component: `dpm ledger-snapshot`
- `status` — checks that the local sandbox is reachable
- `config` — sets host and ports for the project
- `save` — writes a named snapshot ( manifest, parties, packages, ACS placeholder)
- `restore` — restores parties only (packages and ACS still in progress)

A video of the PoC demo can be found [**at this link**](https://drive.google.com/file/d/1ZiQQXU-M8DvTxPqwTSGzpA74y-AJk5GI/view?usp=sharing).

#### Challenges and mitigations

| Challenge                                | Why it matters                                                      | Proposed direction                                                                                                        |
| ---------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **Supporting both Sandbox and LocalNet** | Developers use both environments.                                   | Provide a single DPM interface, i.e., `--target sandbox\|local`                                                           |
| **Sandbox is primarily in-memory**       | Restarting clears state but does not support reusable checkpoints.  | Persistable / restart-coordinated snapshot workflow: logical rebuild (re-upload DARs, re-allocate parties, recreate ACS). |
| **LocalNet persistence**                 | LocalNet commonly relies on PostgreSQL-backed participants.         | Support persistent LocalNet configurations; `status` clearly detects unsupported environments.                            |
| **Snapshot consistency**                 | Restored environments should behave predictably.                    | Validate parties, packages, and ACS after every restore (`conformance`).                                                  |
| **Tool synchronization**                 | External components such as PQS may become stale after restoration. | Optional hooks for rebuilding or refreshing dependent services.                                                           |
| **Safety**                               | Restoring while services continue writing could corrupt state.      | Require restore while local services are quiescent; refuse remote networks.                                               |
| **Future compatibility**                 | Local runtime implementations evolve over time.                     | Stable developer-facing behavior and versioned `manifest.json`; keep backend details flexible.                            |

### 3. Architectural Alignment

Ledger Snapshot extends Canton’s developer tooling layer by orchestrating existing `Sandbox` and `LocalNet` infrastructure, without new ledger APIs, consensus behavior, or synchronizer changes. It ships as a DPM-native component (`components:` in `daml.yaml`, OCI install), matching how Canton developers already acquire tools, and targets the Hardhat-like local development gap highlighted in the [Canton Network developer experience survey analysis](https://forum.canton.network/t/canton-network-developer-experience-and-tooling-survey-analysis-2026/8412). That focus fits CIP-0082-style common-good / dev-tools investments while staying composable with DAR deploy CLIs, testing and debugging tools, and full LocalNet platforms. Those tools help set up or inspect the ledger; Ledger Snapshot restores a known starting state between test runs.

### 4. Backward Compatibility

_No backward compatibility impact._

The component is additive. It does not modify Canton protocol, Daml language, or existing DPM commands. Projects that do not install the component are unaffected. Snapshot directory format is versioned (`schemaVersion` in `manifest.json`) so future formats can evolve without breaking older snapshots silently.

---

## Milestones and Deliverables

### Milestone 1: Sandbox restore implementation

- **Estimated Delivery:** 3 weeks from project start
- **Focus:** Complete the sandbox vertical: reliable save → restore → conformance on `dpm sandbox`, building on the existing PoC.
- **Deliverables / Value Metrics:**
  - Public GitHub repository with Apache-2.0 (or Foundation-approved) license.
  - Public **alpha** of `dpm ledger-snapshot` that supports **`Sandbox` only**;
  - Commands working end-to-end on sandbox with `-target sandbox`: `status`, `save`, `restore`, `list`, `describe`, `delete`, `conformance` (plus `config` for connection settings).
  - Restore implements logical rebuild (restart coordination + DAR re-upload/vet + party re-allocation + ACS recreate).
  - After `save`, a developer can `restore` and get the same packages back on sandbox **without** re-running app setup scripts, either because the snapshot kept the `.dar` files or because restore resolves them from the project’s `.daml/dist/`.
  - Conformance report compares parties, packages, and ACS fingerprint after restore.
  - README + architecture notes documenting equivalence guarantees and non-guarantees.
  - Engage **at least three external teams** as early alpha testers to obtain written feedback that includes issues, notes, or a short evaluation.

### Milestone 2: (LocalNet backend + OCI distribution)

- **Estimated Delivery:** 4 weeks after Milestone 1
- **Focus:** Complete the LocalNet vertical (`-target local`) for persistent configurations; harden ACS capture; publish OCI component; expand docs.
- **Deliverables / Value Metrics:**
  - `-target local` implemented for **one documented Persistent LocalNet layout** (compose + Postgres); `status` fails clearly when persistence/layout is unsupported.
  - Public **alpha** of `dpm ledger-snapshot` that supports **`Sandbox` and `LocalNet`**;
  - **Offline restore path:** stop LocalNet writers → restore database/volume state → restart, with safety checks.
  - Optional post-restore hook for PQS / dependent services (document default recommendation).
  - `dpm ledger-snapshot test --target sandbox|local --snapshot <name> -- <cmd>` test hook.
  - LocalNet commands parity with sandbox: `status` / `save` / `restore` / `list` / `describe` / `delete` / `conformance` with `-target local`.
  - OCI publish of the component with versioned tags; install via `dpm install package` from registry (plus local-path install for contributors).
  - Full command reference, config precedence, sandbox vs LocalNet restore semantics, CI usage examples.
  - Continue our engagement with **at least three external teams** as early alpha testers to obtain written feedback on both `sandbox` and `LocalNet` environments.

### Milestone 3: Production Release and GTM

- **Estimated Delivery:** 2 weeks after Milestone 2
- **Focus:** Ship `v1.0.0` and make the component discoverable through docs, tutorials, and Foundation co-marketing.
- Reach out to as many as possible of the 41 teams that completed the Canton developer survey, and recruit a pilot group to evaluate our component.
- **Deliverables / Value Metrics:**
  - Production release: tagged **`v1.0.0`** of `dpm ledger-snapshot` (sandbox + documented LocalNet path), installable via OCI (`dpm install package`), with release notes covering equivalence guarantees and known limits.
  - **Quickstart tutorial** + **example repository** that a new developer can complete from public docs alone.
  - **Article and video tutorial**: install → sandbox save/restore (LocalNet path optional). Publish in English and Spanish.
  - **Discoverability:** submit for inclusion in Canton developer resources / DPM component directories where appropriate; coordinate at least one Foundation co-marketing artifact (technical blog, case study, or video).
  - Blocking feedback from M1/M2 alpha testing is fixed or documented with workarounds in the `v1.0.0` release notes.

### Milestone 4: Adoption and Maintenance

- **Estimated Delivery:** starts after Milestone 3; maintenance commitment runs **12 months after Milestone 3 completion**
- **Focus:** Convert early testers into verified external users, prove real-world use, and keep the component compatible with the Canton SDK.
- **Deliverables / Value Metrics:**
  - **Alpha conversion:** at least **two** of the M1/M2 early testers validate `v1.0.0` against the quickstart (sandbox required; LocalNet optional where they have a supported layout) and confirm restore removes the need to re-run full bootstrap between suites.
  - **Adoption:** Document that at least 7 teams from the Canton developer survey have used our component. The main evidence will be a short written confirmation from each team that the committee can verify. Optionally, they can also provide a public link to their `daml.yaml`, CI config, or a public forum post. Package download counts (e.g. OCI/GHCR pulls) may be reported as a secondary signal only.
  - **Maintenance / SDK compatibility:** keep `dpm ledger-snapshot` working with the current Canton SDK major for **12 months after finishing Milestone 3**. During that window, adapt to new SDK majors within **30 days** of each release.
  - Public support during the maintenance window: triage issues, ship compatibility releases, and keep docs aligned with supported SDK versions.
- Co-Marketing: CoBuilders will coordinate with the Foundation on community support and maintenance visibility: shared announcements when external teams adopt the tool or when compatibility releases ship; short community posts (X / forums) highlighting real usage; and Canton Development Fund acknowledgment in the README and release notes.

---

## Acceptance Criteria

Project-specific criteria:

- All code in a **public** GitHub repository under an Apache-2.0 (or Foundation-approved) license before any milestone payment.
- Explicit documentation that restore provides **ACS / party / package equivalence**, not identical contract IDs or offsets.
- **Milestone 1 value:** at least three external teams provide written alpha feedback on the sandbox path.
- **Milestone 2 value:** those engagements continue with written feedback covering sandbox and LocalNet where applicable; OCI install path is publicly usable.
- **Milestone 3 value:** `v1.0.0` is discoverable via public docs/tutorials (EN/ES) and at least one Foundation co-marketing or directory submission; blocking M1/M2 feedback is fixed or documented in release notes.
- **Milestone 4:** Document and provide evidence that at least 7 of the 41 teams from the Canton developer survey have used our component in their local workflows.

---

## Funding

**Total Funding Request:** 549,000 CC across four milestones.

### Team Dedication per Milestone

- Milestone 1 (3 weeks): Technical Lead (0.5 FTE) and Engineer (1 FTE)
- Milestone 2 (4 weeks): Technical Lead (0.5 FTE) and Engineer (1 FTE)
- Milestone 3 (2 weeks): Technical Lead (0.5 FTE) and Engineer (1 FTE)
- Milestone 4: Engineer (0.1 FTE average, demand-driven) and Technical Lead (on demand); effort concentrated on post-release adopter onboarding and evidence collection, SDK-major compatibility windows, and issue triage

### Payment Breakdown by Milestone

- Milestone 1 - Sandbox restore implementation: **135,000 CC** upon committee acceptance
- Milestone 2 - LocalNet backend + OCI distribution: **180,000 CC** upon committee acceptance
- Milestone 3 - Production Release and GTM: **90,000 CC** upon committee acceptance
- Milestone 4 - Adoption and Maintenance: **144,000 CC**, split as **72,000 CC** upon committee acceptance of the maintenance and support deliverables, and **72,000 CC** contingent on verified achievement of the adoption target defined in Milestone 4; this tranche may be paid proportionally if the adoption target is partially achieved

### Volatility Stipulation

The grant duration is greater than 6 months. The grant is denominated in fixed Canton Coin, and Milestone 4 will require a re-evaluation at the 6-month mark.

---

## Motivation

We are proposing Ledger Snapshot to contribute directly to Canton developer adoption and ecosystem growth by reducing the friction of local testing, enabling more builders to iterate faster, stay on the network, and ship reliable applications.

Every local Canton test loop that mutates ledger state pays a tax: re-upload DARs, re-allocate parties, re-run setup scripts. That tax grows with suite size and with CI parallelism. Ethereum developers arriving on Canton (a large share of survey respondents) expect Hardhat-style snapshot/revert; its absence is a concrete DX gap in **Local Development Frameworks**, repeatedly rated among the most urgent tooling needs according to the Canton’s [Tooling Survey Analysis](https://forum.canton.network/t/canton-network-developer-experience-and-tooling-survey-analysis-2026/8412) and the [DPM Component Use Cases](https://docs.google.com/document/d/1TCkM0Cq4bxIct55wvfZLmr720yhiUCXskN3AKX99lcY/edit?tab=t.0) proposed by the Canton Foundation.

Ledger Snapshot benefits:

- **Application teams** iterating on Daml models and integration tests (sandbox daily, LocalNet for multi-party topologies).
- **CI pipelines** that need deterministic fixtures without rebuilding the world each job step.
- **Tooling authors** who can compose checkpointing with deploy/debug components instead of reinventing bootstrap.

According to Canton’s Testing Pyramid, developers should use `Sandbox` and `LocalNet` for [**integration testing against a live ledger**](https://docs.canton.network/appdev/modules/m5-testing-strategies). Any team with more than one mutating test suite benefits from named save/restore, which resets a known baseline between runs without repeating full bootstrap. We expect early adopters among teams already running LocalNet CI and developers who want a first-class local snapshot/revert workflow.

---

## Rationale

**Why a Ledger Snapshot DPM Component?**

Named save/restore is the proven pattern for local smart-contract test isolation. Canton cannot copy `evm_snapshot` as a protocol RPC; the right place for this UX is a **local orchestration layer** that respects sandbox (logical rebuild) and LocalNet (persistent DB) realities while presenting one developer workflow.

**Why a DPM component instead of a standalone npm/Homebrew tool?**

- Canton developers already use DPM; components pin per project and track SDK generations.
- Install and discovery match other first-party and community tools (`dpm install package`, OCI refs).
- Avoids introducing a parallel global toolchain.

**Why not only extend Canton Console or an existing LocalNet platform proposal?**

Console is an operator REPL, not a CI-friendly CLI. Broader LocalNet platforms solve topology/bootstrap; this proposal does **one job** — checkpoints — and remains composable. Extending those platforms would couple release cadence and scope; a focused DPM component can ship and be adopted independently.

**Why sandbox and LocalNet?**

Developers use both: sandbox for day-to-day work, LocalNet for multi-party and CI setups. Supporting only one would leave the other workflow behind. We implement one CLI to cover both; the restore method differs under the hood, but the developer experience stays the same.

**Default approach:** extend the existing DPM ecosystem with a new component; do not replace `dpm script`, `damlc`, or Canton itself.

**Why not only extend an existing proposal?**

A ledger snapshot component is explicitly required in the [DPM Component Use Cases List](https://docs.google.com/document/d/1TCkM0Cq4bxIct55wvfZLmr720yhiUCXskN3AKX99lcY/edit?tab=t.0) for the community. Our proposal is complementary to other projects such as [Canton DevKit](https://github.com/canton-foundation/canton-dev-fund/pull/18/changes), not a competing `LocalNet` platform. DevKit focuses on starting, managing, observing, and testing against Splice LocalNet. Ledger Snapshot focuses on Hardhat-style named save/restore of a developer's visible ledger state (i.e., parties, packages, and ACS) on both `sandbox` and `LocalNet`, with explicit equivalence guarantees, post-restore conformance, and a test hook, so developers can reset without re-running full bootstrap. While DevKit’s snapshot/restore is a LocalNet convenience for demos and workshops, we deliver a dedicated checkpointing workflow that works the same way on **sandbox and LocalNet**, filling the sandbox gap that DevKit does not cover.

This proposal is also complementary to the [DPM Ledger Operations and Reproducible Testing Suite (PR #520)](https://github.com/canton-foundation/canton-dev-fund/pull/520). That suite targets the post-deployment layer: scriptable query and submission, fee estimation, and table-driven tests whose runs are recorded in a journal for exact replay. It explicitly dropped its own ledger snapshot milestone in favor of integrating with environment-level snapshot and restore where available. Ledger Snapshot supplies that missing checkpoint layer (named save and restore of parties, packages, and ACS on sandbox and LocalNet), so their test suites can reset the ledger between runs without redoing full bootstrap. At the same time, we do not duplicate their query, estimate, or journal tools.

## Why Us

CoBuilders is a Web3 studio that builds and runs experienced, blockchain-native, interdisciplinary teams that help the most impactful decentralized finance projects turn their vision into reality. We have delivered work for and alongside teams like **Arbitrum, the Nomic Foundation, OpenZeppelin, CoW Protocol, Tools for Humanity (World), and ZetaChain, among others**. More about us at [cobuilders.xyz](https://www.cobuilders.xyz/).

The track record most relevant to this proposal:

- **Hardhat plugin suite for Arbitrum Stylus** ([`@cobuilders/hardhat-arbitrum-stylus`](https://www.npmjs.com/package/@cobuilders/hardhat-arbitrum-stylus), live on npm). A Hardhat 3 plugin suite that brings the full Stylus lifecycle (local node, compile, deploy, test) into Hardhat: four composable plugins, automatic EVM vs WASM contract detection, and cross-VM testing in a single project. Built with support from the Arbitrum Stylus Sprint. **This is the direct precedent for Ledger Snapshot**: an ecosystem-native plugin that packages a missing local development workflow into the toolchain developers already use. [Repo](https://github.com/CoBuilders-xyz/hardhat-arbitrum-stylus) \| [Docs](https://cobuilders-xyz.github.io/hardhat-arbitrum-stylus/)
- **Hardhat 3 migration work with the Nomic Foundation.** This proposal ports a Hardhat pattern (`evm_snapshot` / `evm_revert`) to Canton. We know that pattern from inside the Hardhat ecosystem, as plugin authors and through migration work with Hardhat's creators.

Proposed team:

- Augusto Collerone, CTO and Co-Founder: [LinkedIn](https://www.linkedin.com/in/augusto-collerone/) [GitHub](https://github.com/augustocollerone)
- Ignacio Fernandez, Technical Lead: [LinkedIn](https://www.linkedin.com/in/ignacio-fq/) [GitHub](https://github.com/nachfq)
- Gimer Cervera, Ph.D., Blockchain Engineer: [LinkedIn](https://www.linkedin.com/in/gimercervera/) [GitHub](https://github.com/Gimer0x)
