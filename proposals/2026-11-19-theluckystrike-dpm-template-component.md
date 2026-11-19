## Development Fund Proposal

**Organization:** Individual contributor
**Author / Primary Contact:** Michael Lip ([@theluckystrike](https://github.com/theluckystrike))
**Status:** Submitted
**Created:** 2026-11-19
**Proposal Type:** RFP-aligned
**RFP / Roadmap Area:** RFP 19 — DPM Components and Extension Ecosystem
**Champion:** `Needs Champion`
**Total Funding Request:** 180,000 Canton Coin
**Project Duration:** 10 weeks
**Label:** dar-app-management

---

## Abstract

I will build a DPM template component. A new Canton developer will run `dpm template new token-dapp` and get a project that builds, tests and deploys on LocalNet in one command. The component reads a public template index. The index is a repository of project templates that the community can extend with pull requests. Every template ships with Daml sources, Daml Script tests, a frontend stub, a README and a CI workflow that proves the template still compiles against the current SDK.

This is the first item on the Foundation DevRel list of DPM component use cases. There is no open proposal for it.

---

## Specification

### 1. Objective

**Problem.** `dpm component init` gives a working component directory, but it does not give a working application. A new team must write `daml.yaml`, pick an SDK version, write a first Daml model, write test scripts, add a frontend stub, and repeat this work on every new project. The result is duplicated setup work across the ecosystem and small differences in project layout that slow down support.

**Outcome.** One command creates a Canton application project that compiles, passes its tests on LocalNet, and carries a README that states the next step. A public index of templates makes this a shared asset, not a private scaffold.

### 2. Implementation Mechanics

The component follows the existing DPM component contract. It ships `component.yaml` with `apiVersion: digitalasset.com/v1` and `kind: Component`, and it declares its commands under `spec.commands`. It installs with `dpm install` and runs with `dpm template ...`. I do not fork DPM and I do not change DPM command dispatch.

Commands:

- `dpm template list` — shows the templates in the configured index with a one-line description and the Daml SDK version each one targets.
- `dpm template info <name>` — shows the template README, the contract layout and the test commands.
- `dpm template new <name> --package <name>` — copies the template, rewrites the package name, party hints and project title, then runs `dpm build` and the test suite. The command reports failure if the new project does not build.
- `dpm template update` — moves an existing project to a newer template revision with a three-way merge and reports the files it could not merge.

Template index:

- A public Git repository holds `templates.json` (name, version, SDK range, path, digest) and one directory per template.
- The component verifies the digest of each template before it copies files.
- The index supports any Git URL, so a Canton Foundation member or an ecosystem team can host a private index with the same format.

Each template contains:

- `daml.yaml` pinned to a supported SDK line, with a documented upgrade path.
- Daml source for the business case. The first two templates are an empty contract skeleton and a CIP-0056 style token holding.
- `daml-script` tests that run against a LocalNet party set.
- A frontend stub. The first version uses a TypeScript client that calls the JSON Ledger API, plus a minimal page that lists contracts.
- A README with prerequisites, run steps and a "next change" exercise.
- A CI workflow that runs build and tests, so a template that stops compiling fails the index CI, not the user's first hour.

### 3. Architectural Alignment

The work extends the DPM component mechanism that already exists in `digital-asset/dpm` and uses the published component schema. It supports the roadmap goal of reduced developer friction and lower total cost of ownership. It also supports the LocalNet-first development flow and keeps the JSON Ledger API as the integration surface for the frontend stub.

### 4. Backward Compatibility

*No backward compatibility impact.* The component is additive and opt-in. It does not change existing DPM commands, file formats or build behaviour.

---

## Milestones and Deliverables

### Milestone 1: Component and index (week 3)
- **Committed Date:** 2026-12-10
- **Focus:** Working `dpm template list`, `info` and `new`, a published index format and two templates.
- **Deliverables / Value Metrics:**
  - Public component repository with the `component.yaml` manifest and a release artifact.
  - `templates.json` schema, digest verification and index CI.
  - Two templates: empty contract skeleton, CIP-0056 style token holding.
  - A recorded run that shows `dpm template new token-dapp` from an empty directory to passing tests on LocalNet.

### Milestone 2: Templates, update path and documentation (week 7)
- **Committed Date:** 2027-01-07
- **Focus:** Breadth, the upgrade path and the documentation that makes the component usable without support.
- **Deliverables / Value Metrics:**
  - Five templates total, each with frontend stub, tests and README.
  - `dpm template update` with a three-way merge and a clear conflict report.
  - Documentation page for docs.canton.network, submitted as a pull request.
  - At least one template contributed by someone other than me, accepted through the index pull request process.

### Milestone 3: Adoption and maintenance handover (week 10)
- **Committed Date:** 2027-01-28
- **Focus:** Real use by real teams, and a maintenance position that survives the grant period.
- **Deliverables / Value Metrics:**
  - Three ecosystem teams report that they created a project with the component. I will collect written confirmation in the index repository.
  - The docs page is merged and linked from the DPM documentation.
  - A maintenance note that lists the release process, the SDK upgrade process and the review duty for index pull requests.

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- The commands work as specified, on a clean machine, against a current Daml SDK and LocalNet.
- The index CI rejects a template that does not build or does not pass its tests.
- Adoption evidence exists: three teams with a created project and one community template merged.
- Documentation is merged, not only drafted.

---

## Funding

**Total Funding Request:** 180,000 Canton Coin

### Payment Breakdown by Milestone
- Milestone 1 (Component and index): 40,000 CC upon committee acceptance
- Milestone 2 (Templates, update path and documentation): 60,000 CC upon committee acceptance
- Milestone 3 (Adoption and maintenance handover): 80,000 CC upon final acceptance

The third milestone carries the largest share because adoption is the value that matters. Delivery alone does not meet the bar.

### Volatility Stipulation

The project duration is under 6 months. Should the project timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility.

---

## Co-Marketing

I will work with the Foundation on:

- A short technical blog post that shows a project from empty directory to a running LocalNet test.
- A demo recording for the developer documentation.
- Promotion to the Canton developer community channels that the Foundation selects.

---

## Motivation

New developers spend their first hours on project setup, not on Daml. That cost repeats for every team and every new project. A shared template index converts that repeated cost into one maintained asset.

Adoption estimate: every team that starts a Canton application needs a project skeleton. If the index is linked from the DPM documentation, I expect most new projects to start from a template, in the same way that most new TypeScript projects start from a framework template. The measurable target for this grant is three teams in the first quarter after release.

The Foundation DevRel team already lists this component first in its DPM use case document. The demand is stated, not assumed.

---

## Rationale

**Extend, do not replace.** DPM already defines a component contract. A separate generator tool would drift from DPM releases and would need its own install path. The component uses `dpm install`, the published schema and the existing command surface.

**Index in Git, not a hosted service.** A Git index has no hosting cost, no availability risk and a review process that the community already understands. The digest check gives integrity without a central service.

**Alternatives considered.**
- Documentation-only quickstart: cheap, but it decays and cannot prove that the project still builds.
- A standalone Yeoman-style generator: rejected, because it duplicates DPM and adds a second toolchain.
- Templates inside the DPM repository: rejected for the first phase, because index changes would then need a DPM release.

**Maintenance.** I will maintain the component for 12 months after the grant period. That includes SDK upgrades, index pull request review and release notes. The maintenance note in Milestone 3 makes the duty explicit and transferable.

---

## Why me

- Merged change in `digital-asset/dpm`: PR #334, process cancellation handling, merged 2026-11-16 by a DPM maintainer. I have read the component code path and the manifest schema.
- 308 merged pull requests across 102 GitHub organizations, mostly tooling, CLI and documentation work.
- I build and operate developer tooling as a solo engineer, so the delivery plan has no staffing risk.

I am one engineer, not a team. The scope is sized for that: one component, one index, five templates and a documented update path.
