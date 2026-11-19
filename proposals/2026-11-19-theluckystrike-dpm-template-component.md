## Development Fund Proposal

**Organization:** Individual contributor
**Author / Primary Contact:** Michael Lip ([@theluckystrike](https://github.com/theluckystrike))
**Status:** Submitted
**Created:** 2026-11-19
**Proposal Type:** RFP-aligned
**RFP / Roadmap Area:** RFP 19 — DPM Components and Extension Ecosystem ([2026-2028-strategic-roadmap.md](https://github.com/canton-foundation/canton-dev-fund/blob/main/2026-2028-strategic-roadmap.md))
**Champion:** `Needs Champion` — I have asked the DAR Package Management and App Lifecycle SIG (Curtis Hrischuk, `hrischuk-da`) and the Tech and Ops Committee for a champion under CIP-0100.
**Total Funding Request:** 180,000 Canton Coin (about 14,940 USD at 0.083 USD per CC, 2026-11-19)
**Project Duration:** 10 weeks
**Label:** daml-tooling

---

## Abstract

I will build a DPM template component. A new Canton developer will run `dpm template new token-app` and get a project that builds, tests and deploys on LocalNet in one command. The component reads a public template index. The index is a repository of project templates that the community can extend with pull requests. Every template ships with Daml sources, Daml Script tests, a frontend stub, a README and a CI workflow that proves the template still compiles against the current SDK.

RFP 19 asks for "custom project templates, scaffolding tools" that "follow DPM component conventions, be broadly reusable, include documentation and examples, and include a clear maintenance plan". This proposal meets all four points. RFP 19 also records "No prior grant examples" for this area.

The Foundation DevRel list of DPM use cases, which RFP 19 links as `[External] DPM Plugin & Component Use Cases`, lists "Custom Daml Template Plugin" as its first item and describes the same artefact: "Each template ships with a Daml scaffold, frontend stub, and README. These can be fetched from Canton Network Devs org and the community can add templates via PR in the repo." ([source document](https://docs.google.com/document/d/1TCkM0Cq4bxIct55wvfZLmr720yhiUCXskN3AKX99lcY/edit?usp=sharing), linked from RFP 19). No open pull request in this repository proposed a template or scaffold component as of 2026-11-19.

---

## Specification

### 1. Objective

**Problem.** `dpm component init` gives a working component directory, but it does not give a working application. A new team must write `daml.yaml`, pick an SDK version, write a first Daml model, write test scripts, add a frontend stub, and repeat this work on every new project. The result is duplicated setup work across the ecosystem and small differences in project layout that slow down support.

**Outcome.** One command creates a Canton application project that compiles, passes its tests on LocalNet, and carries a README that states the next step. A public index of templates makes this a shared asset, not a private scaffold.

**Position against approved work.** Two approved components already cover the period after a project exists: Canton DevKit (BitDynamics) covers LocalNet lifecycle, DAR upload, contract and transaction exploration, and token flows; `dpm trace` (Walnut) covers transaction trace visualisation. This proposal covers the first hour, before either of them applies: the project itself, its test harness and its CI. It is complementary, and it uses the same component mechanism.

### 2. Implementation Mechanics

The component follows the existing DPM component contract. It ships `component.yaml` with `apiVersion: digitalasset.com/v1` and `kind: Component`, and it declares its commands under `spec.commands`.

**Distribution follows the DPM contract.** The component is built and published to an OCI registry with the existing publish path (`dpm publish component`, "Publish a component to an OCI registry"), and a user adds `oci://<registry>/component:<version>` to the `components` section of `daml.yaml` and runs `dpm install package`. I do not fork DPM and I do not change DPM command dispatch.

**The template index is data, not an installer.** The index is read at command runtime by `dpm template list/info/new/update`. It never takes part in component installation. The index format is a Git repository with `templates.json` and one directory per template, hosted in the Canton Network Devs organisation, as the Foundation use case document describes. Any team can host a private index with the same format.

**No change to DPM core is requested.** If maintainers decide that a first-class template-index mechanism belongs in DPM itself, I will open an issue in `digital-asset/dpm` and implement it there as a separate, additive change with maintainer agreement.

Commands:

- `dpm template list` — shows the templates in the configured index with a one-line description and the Daml SDK version each one targets.
- `dpm template info <name>` — shows the template README, the contract layout and the test commands.
- `dpm template new <name> --package <name>` — copies the template, rewrites the package name, party hints and project title, then runs `dpm build` and the test suite. The command reports failure if the new project does not build.
- `dpm template update` — moves an existing project to a newer template revision with a three-way merge and reports the files it could not merge.

Index controls:

- `templates.json` holds name, version, SDK range, path and digest for each template.
- The component verifies the digest of each template before it copies files.
- Index CI builds every template and runs its tests on LocalNet, so a template that stops compiling fails the index, not the user's first hour.

Each template contains:

- `daml.yaml` pinned to a supported SDK line, with a documented upgrade path.
- Daml source for the business case. The first two templates are an empty contract skeleton and a token holding. The token template targets CIP-0112, the current token standard; the older CIP-0056 style is not taught.
- `daml-script` tests that run against a LocalNet party set.
- A frontend stub. The first version uses a TypeScript client that calls the JSON Ledger API, plus a minimal page that lists contracts.
- A README with prerequisites, run steps and a "next change" exercise.

### 3. Architectural Alignment

The work extends the DPM component mechanism that already exists in `digital-asset/dpm` and uses the published component schema. It supports the roadmap goal of reduced developer friction and lower total cost of ownership. It also supports the LocalNet-first development flow and keeps the JSON Ledger API as the integration surface for the frontend stub.

### 4. Backward Compatibility

*No backward compatibility impact.* The component is additive and opt-in. It does not change existing DPM commands, file formats or build behaviour.

---

## Milestones and Deliverables

### Milestone 1: Component and index (week 3)
- **Committed Date:** 2026-12-10
- **Focus:** Working `dpm template list`, `info` and `new`, a published OCI component, and two templates.
- **Deliverables / Value Metrics:**
  - Public component repository with the `component.yaml` manifest and a versioned OCI release, installed with `dpm install package` on a clean machine.
  - `templates.json` schema, digest verification and index CI.
  - Two templates: empty contract skeleton, and a CIP-0112 token holding.
  - A recorded run that shows `dpm template new token-app` from an empty directory to passing tests on LocalNet.

### Milestone 2: Templates, update path and documentation (week 7)
- **Committed Date:** 2027-01-07
- **Focus:** Breadth, the upgrade path and the documentation that makes the component usable without support.
- **Deliverables / Value Metrics:**
  - Five templates total, each with frontend stub, tests and README.
  - `dpm template update` with a three-way merge and a clear conflict report.
  - Documentation page for docs.canton.network, opened as a pull request and reviewed. If maintainers decline the page, the same content is published on a public site and linked from the index README.

### Milestone 3: Adoption evidence and maintenance handover (week 10)
- **Committed Date:** 2027-01-28
- **Focus:** Real use by real teams, and a maintenance position that survives the grant period.
- **Deliverables / Value Metrics:**
  - An outreach log with at least 12 direct invitations to Canton teams and builders, sent through the Foundation channels, and at least 3 written confirmations that a team created a project with the component. If fewer than 3 confirmations arrive, I deliver the full outreach log and each blocker, and the committee judges that evidence.
  - A maintenance note that lists the release process, the SDK upgrade process and the review duty for index pull requests.
  - A stretch goal, not an acceptance criterion: at least one template contributed by someone other than me through the index pull request process.

---

## Acceptance Criteria

The Tech and Ops Committee will evaluate completion based on:

- The commands work as specified, on a clean machine, against a current Daml SDK and LocalNet.
- The component installs from its OCI reference with `dpm install package`.
- The index CI rejects a template that does not build or does not pass its tests.
- Adoption evidence exists: the outreach log and the written confirmations listed in Milestone 3.
- Documentation is submitted for review, and merged or published under the fallback stated in Milestone 2.

Each criterion is deliverable by me alone. No criterion depends on a third party's approval, except the documentation review, which has a stated fallback.

---

## Funding

**Total Funding Request:** 180,000 Canton Coin (about 14,940 USD at 0.083 USD per CC, 2026-11-19)

### Payment Breakdown by Milestone
- Milestone 1 (Component and index): 40,000 CC upon committee acceptance
- Milestone 2 (Templates, update path and documentation): 60,000 CC upon committee acceptance
- Milestone 3 (Adoption evidence and maintenance handover): 80,000 CC upon final acceptance

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

The demand is stated in the Foundation's own use case document, which lists this plugin first and describes its contents. It is not my assumption.

---

## Rationale

**Extend, do not replace.** DPM already defines a component contract. A separate generator tool would drift from DPM releases and would need its own install path. The component uses the existing OCI install path, the published schema and the existing command surface.

**Index in Git, not a hosted service.** A Git index has no hosting cost, no availability risk and a review process that the community already understands. The digest check gives integrity without a central service.

**Alternatives considered.**
- Documentation-only quickstart: cheap, but it decays and cannot prove that the project still builds.
- A standalone Yeoman-style generator: rejected, because it duplicates DPM and adds a second toolchain.
- Templates inside the DPM repository: rejected for the first phase, because index changes would then need a DPM release.

**Maintenance.** I will maintain the component for 12 months after the grant period. That includes SDK upgrades, index pull request review and release notes. The maintenance note in Milestone 3 makes the duty explicit and transferable.

---

## Why me

- Merged change in `digital-asset/dpm`: [PR #334](https://github.com/digital-asset/dpm/pull/334), process cancellation handling, merged 2026-11-16 by a DPM maintainer. I have read the component code path and the manifest schema.
- 308 merged pull requests across 102 GitHub organisations, mostly tooling, CLI and documentation work ([profile](https://github.com/theluckystrike)).
- I build and operate developer tooling as a solo engineer, so the delivery plan has no staffing risk.

I am one engineer, not a team. The scope is sized for that: one component, one index, five templates and a documented update path.

---

## References

- RFP 19: `2026-2028-strategic-roadmap.md`, section "DPM Components and Extension Ecosystem".
- Foundation use case document (linked from RFP 19): [DPM Plugin & Component Use Cases](https://docs.google.com/document/d/1TCkM0Cq4bxIct55wvfZLmr720yhiUCXskN3AKX99lcY/edit?usp=sharing).
- DPM component schema and publish path: `cmd/dpm/cmd/component/init/manifests/component.yaml`, `cmd/dpm/cmd/publish/component`.
- CIP-0100 (Development Fund process, champion requirement).
- CIP-0112 (token standard, current).
