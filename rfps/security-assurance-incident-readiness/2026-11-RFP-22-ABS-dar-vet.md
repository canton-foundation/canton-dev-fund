## Development Fund Proposal

**Organization:** ABS - Alternative Bold Solutions UG (haftungsbeschränkt), Göttingen, Germany
**Author / Primary Contact:** Abdallah Abdelnaby (@abdallah-abdelnaby), contact@absolution-gmbh.com
**Status:** Submitted
**Created:** 2026-11-15
**Proposal Type:** RFP-aligned
**RFP / Roadmap Area:** Security, Assurance & Incident Readiness - RFP 22, Daml Security Standards and Secure Development. Secondary: RFP 3, Automated Application Management.
**Champion:** `Needs Champion`
**Total Funding Request:** 450,000 CC
**Project Duration:** 4 months
**Label:** daml-tooling

---

## Abstract

A new version of a Daml package runs on contracts created under the old version as soon as it is vetted. The SDK upgrade check warns when a controller, observer, signatory or `ensure` expression is written differently in the template. It does not warn about new choices on existing templates, new ledger effects, removed checks, or changes made inside the helper functions those expressions call.

dar-vet is an open-source (Apache-2.0) tool that compares two compiled versions of a package and reports **what the upgrade changes about who can do what**, most severe first, with a source diff for each finding. A working prototype exists: it finds all six changes in our test package, of which the SDK warns about one, and it has been run on 101 consecutive Splice releases. This grant turns it into a maintained `dpm` component and CI check, and publishes a diff for every new Splice release.

---

## Specification

### 1. Objective

Make the authority changes of every Daml package upgrade visible in one short report, before the upgrade is released or vetted.

Out of scope, because others cover it: upgrade type compatibility (SDK `upgrade-check`), cross-package interaction graphs (Certora daml-analyzer), path-sensitive bug finding (Dedaub DamlSec, PR #971), rollout and vetting-state planning (Upgrade and Vetting Planner, PR #91), source-to-DAR provenance (Obsidian package registry).

### 2. Implementation Mechanics

**Prototype (public):** https://github.com/ABS-gmbh/dar-vet. Results: `RESULTS.md` in the repository.

**Input.** Two DARs (old and new version of a package). Planned: a package ID fetched from the operator's own participant instead of the old DAR.

**Load.** Both versions are decoded with Digital Asset's Daml-LF reader (`com.daml:daml-lf-archive`), so new Daml-LF versions are supported as the SDK releases them. Analysis uses Daml-LF only. Bundled source is used only to show diffs.

**Canonical form.** Every template, choice and helper function is put into a form that is stable across releases: source locations, package IDs, call-stack records and compiler-generated helper names (`$$sc_...`) are removed, and calls into the package's own functions are replaced by a hash of the called function. A change deep inside a helper changes every expression that calls it; an untouched function compares equal. Calls into dependencies are compared separately, so a change in a dependency is reported once, as such.

**Comparison.** For each template and choice present in both versions dar-vet reports, most severe first:

| Kind | Severity | SDK upgrade check today |
|---|---|---|
| Controller changed | HIGH | warns only if written directly in the choice |
| New choice on an existing template | HIGH | no warning |
| New interface instance | HIGH | separate warning |
| Non-consuming choice that now creates contracts | HIGH | no warning |
| Ledger effects changed (creates, exercises, fetches) | MEDIUM | no warning |
| Choice observers, signatories, observers, key, `ensure` changed | MEDIUM | warns only if written directly |
| Fewer assertions or aborts in a choice | MEDIUM | no warning |
| Behaviour changed only through dependency code | MEDIUM/LOW | no warning |
| Other body changes | LOW | no warning |

Each finding names the helper functions whose code changed and shows a line diff. dar-vet reports facts, not verdicts: a changed controller can be an intended fix.

**Output.** Markdown for people and JSON for tools today. In this grant: SARIF for GitHub code scanning, and a policy file that sets which kinds fail the run (`--fail-on` exists today).

**Distribution.** A `dpm` component following DPM component conventions, a GitHub Action, a release JAR, and a public page with the dar-vet report for each Splice and utility DAR release.

### 3. Architectural Alignment

- Works on Daml-LF, the artifact that validators vet and Canton executes, using Digital Asset's own reader.
- Read-only. No protocol, Ledger API or node changes.
- RFP 22: "automated analysis" and "CI/CD integration" to "identify and prevent security weaknesses before Daml packages are deployed or vetted". RFP 3: "review & security analysis" before "approval, installation and upgrading".
- Complements the SDK upgrade check (types and directly written expressions), daml-analyzer (cross-package edges) and the Upgrade and Vetting Planner (rollout).

### 4. Backward Compatibility

*No backward compatibility impact.* The tool only reads packages.

---

## Milestones and Deliverables

### Milestone 1: Accuracy and coverage
- **Committed Date:** start + 6 weeks
- **Focus:** a labelled test set, fixing known noise, and the remaining Daml-LF cases.
- **Deliverables / Value Metrics:**
  - A public labelled test set of upgrade cases (at least 40, covering every finding kind) with measured precision and recall per kind, published in the repository.
  - Noise from recursive helper functions removed: Splice releases with unchanged source give zero findings (prototype: 13 LOW across 27 such releases).
  - Package-ID input (fetching the old version from a participant), interfaces and contract keys fully covered.

### Milestone 2: Integration
- **Committed Date:** start + 11 weeks
- **Focus:** SARIF, policy file, `dpm` component, GitHub Action, public report page.
- **Deliverables / Value Metrics:**
  - `dpm` component and GitHub Action released, with a guide for application teams (CI) and one for validator operators (before vetting).
  - Public page live with reports for all past Splice and utility releases and each new release within 5 working days.

### Milestone 3: Adoption
- **Committed Date:** start + 16 weeks
- **Focus:** use in real release and vetting workflows.
- **Deliverables / Value Metrics:**
  - 5 application teams run dar-vet in CI on their own upgrades (public repositories or written confirmation).
  - 3 validator operators or Super Validators use dar-vet reports when reviewing upgrades (written confirmation or public statement).
  - Public summary of findings and of feedback addressed.

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone
- Published precision and recall per finding kind, and published Splice reports
- Documentation for application teams and operators
- **Milestone 3 is accepted on adoption only:** the stated number of teams and operators using the tool in CI or upgrade review.

---

## Funding

**Total Funding Request:** 450,000 CC

### Payment Breakdown by Milestone
- Milestone 1 Accuracy and coverage: 135,000 CC (30%) upon committee acceptance
- Milestone 2 Integration: 135,000 CC (30%) upon committee acceptance
- Milestone 3 Adoption: 180,000 CC (40%) upon final release and acceptance

### Volatility Stipulation
The project duration is under 6 months. Should the timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility.

### Maintenance
ABS will maintain dar-vet for 12 months after Milestone 3: support for new Daml-LF and SDK releases, the public report page, and fixes for reported issues.

---

## Co-Marketing

Upon release, ABS will collaborate with the Foundation on:

- Announcement coordination
- A technical blog post walking through real Splice upgrades
- A demo for the Daml Language & Developer Tooling SIG

---

## Motivation

Upgrades are the moment when the rules of existing contracts can change. The Smart Contract Upgrade documentation allows a new version to change a choice's controller, its observers and its body, change `ensure`, change interface instance implementations, and add choices. We tested what the SDK upgrade check (SDK 3.7.1) says about this:

| Change in v2 of a test package | SDK warning | dar-vet |
|---|---|---|
| Controller changed inside a helper function | none | HIGH, names the helper |
| New choice that lets the issuer take the asset | none | HIGH |
| Non-consuming choice now creates a contract | none | HIGH |
| Assertion removed | none | MEDIUM |
| Choice observers changed in the choice | warning | MEDIUM |
| Recipient of a new contract changed inside a helper | none | LOW, names the helper |

On a Canton 3.7.1 sandbox we confirmed that these new rules apply to existing contracts: after v2 was uploaded, an issuer transferred an asset created under v1 without the owner, which v1 did not allow.

On 101 consecutive releases of five Splice packages, the prototype reported 77 new choices on existing templates, 17 new interface instances and 104 changes to ledger effects (57 of them inside helper functions), none of which the SDK warns about. One example: in splice-amulet 0.1.15 the non-consuming choice `AmuletRules_MiningRound_StartIssuing` started creating `UnclaimedDevelopmentFundCoupon` contracts through a change in the helper `computeIssuingRoundParameters`. These look like intended changes. The point is that every reviewer and every vetting operator should see such changes in one page, without reading the full source diff.

Who benefits: every application team that ships upgrades, every validator that vets third-party upgrades, and the Super Validators who approve Splice upgrades. Security and auditing tools were rated "important" or "critical" by 75% of respondents in the Canton Network Developer Experience and Tooling Survey.

---

## Rationale

**Why Daml-LF and not a source diff.** A source diff is not ordered by security relevance, does not show which choices a helper change affects, and relies on source that is not checked against the package. dar-vet traces each change to the choices it affects.

**Why not inside an existing tool.** The SDK upgrade check compares the expressions written in a template, not the functions they call, and does not look at new choices or effects. Certora daml-analyzer reports cross-package interactions; it does not model who controls a choice. dar-vet uses the same Daml-LF reader as both, and we will offer upstream contributions where maintainers prefer one tool; the deliverables and adoption targets stay the same.

**Why facts and not verdicts.** Whether a change is intended is a human decision. Reporting every authority change in a fixed order, with a policy file, keeps the tool predictable.

### Team

- **Abdallah Abdelnaby** - project lead and architecture, including the prototype. Software engineer and PhD candidate in Computer Science, University of Göttingen.
- **Salaheldin Soliman** - security and compiler lead. About 3.5 years on Hyperledger Solang, including leading the Soroban target work for the Stellar Development Foundation.
- **Imran Shaikh** - core engineer; core engineer of SORDEC.

Relevant work:
- **dar-vet prototype**: https://github.com/ABS-gmbh/dar-vet
- **SORDEC**, a decompiler for Stellar Soroban smart contracts (WASM to Rust), funded by a Stellar Community Fund #41 Build Award: https://github.com/Imran-S-heikh/sordec
- **Hyperledger Solang** compiler, Soroban target (SCF Public Goods): https://github.com/hyperledger-solang/solang
