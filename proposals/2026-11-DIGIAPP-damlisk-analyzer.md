# Development Fund Proposal: damlisk, a Daml Language Analyzer for Secure Development and CI

**Organization:** DIGIAPP LLC<br>
**Authors / Primary Contacts:** TBD<br>
**Status:** Draft<br>
**Created:** 2026-11-19<br>
**Proposal Type:** RFP-aligned<br>
**RFP / Roadmap Area:** RFP 22 (Daml Security Standards and Secure Development), with RFP 18 (Integration into SDLCs) and RFP 19 (DPM Components and Extension Ecosystem)<br>
**Champion:** Curtis Hrischuk, Digital Asset (@hrischuk-da)<br>
**Total Funding Request:** 800,000 Canton Coin (CC) for M1–M4; maintenance (M5) TBD<br>
**Project Duration:** 16 weeks, followed by maintenance (TBD)<br>
**Label:** daml-tooling<br>

## Abstract

DIGIAPP proposes to turn [damlisk](https://github.com/DIGIAPP-LLC/damlisk),
an existing open-source static analyzer for Daml, into a production-grade
security analyzer that application teams run locally and in CI before a
package is deployed or vetted.

Today damlisk reads the compiled Daml-LF inside a `.dar` (the same artifact
that is uploaded to a participant), builds an index of templates, choices,
interfaces and helper functions, and runs detectors over that intermediate
representation. It ships 36 detectors in eight categories, a `scan` command
with JSON output and a CI exit code, and a `report` command that scans a
folder of DARs into a Markdown report.

This grant adds a second layer: a Daml language parser that turns `.daml`
source into a syntax tree linked to the Daml-LF layer. The source layer gives exact source spans, inline suppressions
and checks on what the compiler erases, such as comments and annotations.
The Daml-LF layer keeps the analysis aligned with what the ledger executes.

The grant then funds CI/CD integration, deeper data-flow analysis with
measured precision, and upgrade checks between package versions. It ends with
a public release and independent adoption. Maintenance is TBD.

## Specification

### Objective

RFP 22 asks for "automated analysis, security-focused linting or static
analysis, common vulnerability patterns ... and CI/CD integration" that
"help application developers consistently identify and prevent security
weaknesses before Daml packages are deployed or vetted."

Today a Daml team that wants this has few options. Manual review does not
scale with release frequency. Source-level linters cannot see code generated
by `damlc`, helper functions or dependencies. And the analysis that exists is
not connected to CI.

**Outcome:** a maintained analyzer that:

1. Analyzes Daml at two levels: the `.daml` source through a Daml language
   parser, and the compiled Daml-LF in the `.dar`, with every finding linked
   across both.
2. Still works on a `.dar` alone, so validators and auditors can check the
   exact package they are asked to vet without its source.
3. Reports findings with an exact source span, an impact and confidence
   rating, a documented rationale and a recommended fix.
4. Runs in CI with SARIF output, baselines and suppressions, so teams see only
   new findings on each change.
5. Checks upgrade compatibility between package versions.

### Existing library and current state

damlisk is Apache-2.0, published on PyPI as `damlisk`, and built on
[dazl](https://github.com/digital-asset/dazl-client) for decoding Daml-LF.
It was built before this proposal, and this grant extends it. It does not fund
the work from scratch.

| Area | Current state |
| --- | --- |
| Input | `.dar` files, main package plus dependencies, Daml-LF 2.x (SDK 3.x). |
| Analysis | Package index of templates, choices, interfaces and top-level values. AST traversal with variable-use and helper resolution, so `damlc`-generated helpers (for example `create` and `archive` wrappers) are followed. |
| Detectors | 36 detectors in eight categories: authorization (5), assets (2), contracts (3), validation (12), time (2), loops (2), hygiene (9) and upgrade (1). Examples: `controller-from-argument`, `unprotected-archive`, `delegated-authority-leak`, `unchecked-fetch`, `stale-fetch`, `nonconsuming-create`, `value-to-arbitrary-party`, `untrusted-interface-exercise`, `weak-randomness` and `ledger-op-in-loop`. |
| CLI | `scan` (text or JSON, `--detect` and `--exclude`, `--fail-on` exit code), `report` (folder of DARs to Markdown pages), `info` and `list-detectors`. |
| Documentation | One page per category, with a description, an exploit scenario and a recommendation for each detector. |
| Examples | One vulnerable Daml project per detector, built with `dpm` in CI and checked by tests. |
| Tests and CI | 932 tests, lint and license checks. A manual CI workflow uses Nix and `dpm`, and a tag-triggered workflow publishes to PyPI only after the tests pass. |
| Corpus | All 246 Splice DARs from the official `canton-network/splice` repository load and scan with no errors. |

Our corpus scan shows what this grant must fix. The full Splice run produces
4,556 raw findings that have not been triaged. Many come from low-confidence
and informational detectors. That number is too noisy for CI. Exact source
spans and suppressions (M1), baselines (M2) and measured precision (M3) are
in the plan for that reason.

### What this grant adds

| Gap today | Delivered by |
| --- | --- |
| No source-level view: comments, annotations and exact spans are lost in Daml-LF | M1 Daml language parser |
| Findings point to Daml-LF definitions, not exact source spans | M1 source linking |
| No inline suppressions | M1 |
| No SARIF output, configuration file or baselines, and no ready-made CI templates | M2 CI/CD |
| Not available as a `dpm` component | M2 |
| Checks in user-written helpers or dependency packages are not followed | M3 data flow across functions and packages |
| Some documented vulnerability patterns not yet implemented | M3 new detectors |
| Unmeasured false-positive rate on real code | M3 labeled corpus and precision targets |
| No comparison between two package versions | M3 upgrade checks |

## Dev Fund 2.0 Alignment

**RFP mapping.** The main fit is
[RFP 22 (Daml Security Standards and Secure Development)](https://github.com/canton-foundation/canton-dev-fund/blob/main/2026-2028-strategic-roadmap.md?plain=1#L238),
which covers automated analysis, static analysis, vulnerability patterns and
CI/CD integration. CI templates and baselines address
[RFP 18 (Integration into SDLCs)](https://github.com/canton-foundation/canton-dev-fund/blob/main/2026-2028-strategic-roadmap.md?plain=1#L204).
The `dpm` component addresses
[RFP 19 (DPM Components and Extension Ecosystem)](https://github.com/canton-foundation/canton-dev-fund/blob/main/2026-2028-strategic-roadmap.md?plain=1#L207).

**Ecosystem need and beneficiaries.**

- Daml application developers catch security weaknesses before review.
- Auditors get a first pass over a package and its dependencies.
- Validator and node operators get a check they can run on a DAR before
  vetting it, without access to the source.

**Adoption.** M4 requires three independent organizations to run damlisk on
their own packages. Two of them must confirm useful findings, and one must run
it in its CI.

## Milestones and Deliverables

Each milestone takes 4 weeks. Two engineers work in parallel during M1 and
M3, and one engineer during M2 and M4, with support from the DIGIAPP team for
adoption. That is 24 engineer-weeks over 16 weeks. M5 maintenance is TBD.
These are planning estimates. Work is accepted against the milestone
criteria, not hours worked.

### Milestone 1: Daml language parser

**Estimated Delivery:** 4 weeks from start

**Estimated Effort:** 8 engineer-weeks (2 engineers for 4 weeks).

M1 adds a source layer next to the existing Daml-LF layer and links the two.

**Daml grammar and parser.** Existing Haskell grammars do not accept Daml.
In our tests, a standard Haskell parser reported syntax errors in 34 of 35
example source files and in 141 of 146 Splice source files, because Daml adds
its own layout-sensitive declarations: `template`, `with`, `where`,
`signatory`, `observer`, `ensure`, `key`, `maintainer`, `choice`,
`controller`, `interface` and `interface instance`. M1 delivers a Daml grammar
that extends Haskell syntax with these constructs, and a parser built from
it.

**Source model.** On top of the syntax tree, M1 builds a typed source model of
modules, templates, choices, fields, clauses and functions, with exact spans.

**Linking source and Daml-LF.** Each template, choice and top-level value in
the source model is linked to its Daml-LF definition by module, name and the
source locations stored in the DAR. Every finding from a Daml-LF detector
then carries an exact source span. Code that `damlc` generates is reported at
the source construct it came from. When source is not available, damlisk
falls back to the Daml-LF layer and marks the finding as such.

**Checks that need the source.** Some information never reaches Daml-LF. M1
uses the source layer for:

- Inline suppressions (`-- damlisk: ignore <detector> <reason>`), with a
  required reason. Suppressions are listed in the report.
- Security annotations (`-- @security controller=issuer`) checked against
  the controllers actually found in Daml-LF.
- Unicode control characters in comments, which the existing `rtlo`
  detector cannot see in Daml-LF.

**Project input.** `damlisk scan` accepts a Daml project folder. It reads
`daml.yaml`, uses the built `.dar` (or builds it with `dpm`) and loads the
sources next to it.

**Acceptance Criteria:**

- The parser accepts every `.daml` file in the example projects and in the
  public Splice source tree without syntax errors. Files that fail to parse
  are reported, not skipped silently.
- Every finding on the example projects shows the correct file and span. A
  finding in code generated by `damlc` points to the source construct it
  came from.
- Inline suppressions and security annotations work on dedicated examples,
  and a mismatched annotation is reported.
- A scan of a `.dar` without source still produces all Daml-LF findings, as
  it does today.

### Milestone 2: CI/CD integration

**Estimated Delivery:** 4 weeks after Milestone 1 acceptance

**Estimated Effort:** 4 engineer-weeks (1 engineer for 4 weeks).

M2 makes damlisk part of the normal CI/CD loop, using the exact source spans
from M1.

- **SARIF 2.1.0 output.** Findings appear as code-scanning alerts on the exact
  Daml source spans in GitHub, GitLab and other SARIF consumers.
- **Configuration file.** A `damlisk.toml` file sets the enabled detectors,
  severity thresholds, path filters and file-level suppressions.
- **Baselines.** `damlisk baseline` records the current findings. On later
  scans, `scan --baseline` reports only new findings, which lets existing
  projects adopt damlisk without first fixing every finding.
- **CI templates.** A GitHub Action and a GitLab CI template build the project
  with `dpm`, scan it, upload SARIF and fail on new findings at or above a
  configured impact.
- **dpm component.** damlisk is packaged as a `dpm` component (`dpm damlisk`),
  subject to coordination with the `dpm` maintainers. Standalone PyPI use
  remains supported.

**Acceptance Criteria:**

- On a sample repository, a pull request that introduces a vulnerability
  shows an inline alert on the changed Daml line. The fix clears the alert.
- `--baseline` hides existing findings and reports only new ones. A
  suppressed finding is listed with its reason and does not fail the build.
- Exit codes are documented and stable: 0 for pass, 1 for findings at or
  above the threshold, 2 for a tool error. A DAR that cannot be loaded never
  passes silently.
- The GitHub Action and GitLab template run from a clean checkout with
  documented configuration.

### Milestone 3: Deeper analysis, new detectors, measured precision and upgrade checks

**Estimated Delivery:** 4 weeks after Milestone 2 acceptance

**Estimated Effort:** 8 engineer-weeks (2 engineers for 4 weeks).

M1 and M2 make findings visible in source and CI. M3 makes them more
complete and more trustworthy, and adds checks between package versions. It has four
deliverables.

#### 3.1 Data flow across functions and packages

Today most detectors look inside a single choice body, plus the helpers that
`damlc` generates. Some follow simple user-written helpers in the same
package, but not consistently, and none follow calls into another package.
For example:

```daml
choice Transfer : ContractId Holding
  with newOwner : Party
  controller owner
  do
    validate newOwner          -- check lives in a helper function
    create this with owner = newOwner
```

If `validate` is defined in a dependency package, damlisk cannot see today
that `newOwner` is checked, and may report a false positive or miss a real
issue. M3 lets the analysis follow
values (choice arguments, parties, fetched contracts and contract IDs)
through:

- user-written helper functions and `let` bindings,
- interface methods and interface choices,
- functions and choices in dependency packages.

Existing detectors that depend on this, such as `unchecked-fetch`,
`controller-from-argument` and `value-to-arbitrary-party`, use the new data
flow and report fewer false positives and fewer missed cases.

#### 3.2 New detectors

M3 implements the remaining vulnerability patterns from our detector catalog
that are not covered yet. Each new detector ships with a vulnerable example,
a fixed example and a documentation page.

#### 3.3 Labeled corpus and measured precision

A detector is only useful in CI if most of what it reports is real. M3
publishes a labeled corpus with three parts:

- The vulnerable examples, each labeled with the findings it should produce.
- A fixed version of each example, which should produce no findings.
- A sample of findings from the public Splice DARs, each reviewed by hand and
  labeled as a real issue or a false positive.

A script runs damlisk over the corpus and reports precision for each
detector (the share of reported findings that are real) and missed cases.
Detectors that do not reach the target are rated lower or turned off by
default, so CI runs stay quiet by default.

#### 3.4 Upgrade checks between versions

Canton uses smart contract upgrades (SCU): a new package version must stay
compatible with contracts created by the old one. `damlisk diff old.dar
new.dar` compares two versions and reports:

| Change | Type |
| --- | --- |
| Template, choice or field removed or renamed | Breaks upgrade |
| Field type changed | Breaks upgrade |
| Non-optional field added to an existing record | Breaks upgrade |
| Choice return type changed | Breaks upgrade |
| Signatories, observers or controllers changed | Behavior change, needs review |
| `ensure` clause changed | Behavior change, needs review |

The output is available as text, JSON and SARIF, and can run in CI against
the previous release.

**Acceptance Criteria:**

- **Data flow:** an example where the check lives in a helper in another
  module, and one where it lives in a dependency package, are both
  recognized as checked. The same examples with the check removed are
  reported.
- **Detectors:** each new detector has a vulnerable example that is
  reported, a fixed example that is not, and a documentation page.
- **Precision:** the labeled corpus and the measurement script are public.
  Every High-impact detector reaches at least 80% precision on the corpus.
  Detectors below target are rated lower or disabled by default, with the
  reason documented.
- **Upgrades:** for two versions of an example package, `diff` reports each
  seeded change with the right type and nothing for unchanged parts.
  Running `diff` on consecutive public Splice releases completes and produces
  a reviewed report.

### Milestone 4: Public release, adoption and ecosystem validation

**Estimated Delivery:** 4 weeks after Milestone 3 acceptance

**Estimated Effort:** 4 engineer-weeks (1 engineer, with adoption support
from the DIGIAPP team).

M4 delivers the 1.0 release with installation instructions, a
getting-started guide, a CI guide and a public catalog of Daml vulnerability
patterns. In the catalog, each detector has a description, an example, a fix
and its measured precision.

We publish a scan report for public Splice DARs, triaged with the labeled
corpus. Any security-relevant finding in a third-party package is disclosed
privately to its maintainers before publication.

DIGIAPP will support independent teams using damlisk on their own packages,
collect false positives and missed issues, and fix adoption blockers.
Adoption evidence will not require publication of private code or findings.

**Acceptance Criteria:**

- At least three independent organizations run damlisk on their own packages.
- At least two confirm that it found issues relevant to their review.
- At least one runs the CI check in its own pipeline.
- Critical blocking issues are fixed or have a documented workaround.
  Installation and examples work from a clean environment with the listed
  prerequisites.

### Milestone 5: Maintenance

**Duration, effort and funding:** TBD, to be agreed with the committee
before Milestone 4 acceptance.

The expected scope is compatibility with new Daml SDK and Daml-LF releases,
grammar updates for new Daml syntax, bug and false-positive fixes, issue
triage, and updates to the labeled corpus and the vulnerability catalog.

## Architectural Alignment

### Integration and dependencies

damlisk runs offline and needs no participant, ledger access or changes to
Canton or the Daml SDK. It decodes Daml-LF with
[dazl](https://github.com/digital-asset/dazl-client), parses Daml source with
its own Daml grammar (M1), and uses `dpm` to build projects and, from M2, as
a distribution channel.

The two layers have different strengths:

- **Daml-LF** is what the ledger runs. It includes code generated by `damlc`,
  covers dependencies that ship without source and works on DARs submitted
  for vetting.
- **Source** keeps what the compiler erases: comments, annotations, layout and
  exact spans. Developers act on findings in source.

Linking the two gives findings that are both accurate and actionable.

### Related work

Three tools in the Development Fund are close to this proposal:

- [CCTools Daml package analyzer](../../proposals/2026-03-Certora-daml_package_analyzer_proposal%20.md),
  approved in [PR #130](https://github.com/canton-foundation/canton-dev-fund/pull/130).
- [OpenZeppelin daml-lint](https://github.com/OpenZeppelin/daml-lint), existing
  tooling referenced in the approved
  [OpenZeppelin Canton Ecosystem Stack proposal](../../proposals/2026-04-OpenZeppelin-canton-ecosystem-stack.md),
  [PR #262](https://github.com/canton-foundation/canton-dev-fund/pull/262).
- [Hacken Canton monitor (Extractor)](../../proposals/hacken_proposal.md),
  [PR #302](https://github.com/canton-foundation/canton-dev-fund/pull/302).

| | damlisk | CCTools package analyzer (#130) | OpenZeppelin daml-lint (#262) | Hacken Canton monitor (#302) |
| --- | --- | --- | --- | --- |
| Purpose | Find vulnerability patterns | Map which packages can call which | Find vulnerability patterns | Detect anomalies at runtime |
| Phase | Before deployment and before vetting | Before deployment | Before deployment | After deployment |
| Input | Compiled `.dar` (Daml-LF), plus `.daml` source from M1 | Compiled `.dar` | `.daml` source files | Ledger API of a running participant |
| Works without source code | Yes | Yes | No | Yes |
| Sees dependencies and `damlc`-generated code | Yes | Yes (cross-package calls) | No | Not applicable |
| Source parsing | Full Daml grammar and syntax tree, linked to Daml-LF (M1) | Not applicable | Line-based text patterns | Not applicable |
| Security detectors | 36, in 8 categories | None (interaction graph) | 7 | Runtime rules |
| Upgrade checks between versions | M3 | No | No | No |
| License | Apache-2.0 | Apache-2.0 | AGPL-3.0 | Open source |

**CCTools package analyzer (#130).** It answers a different question. It lists
every place where one package exercises a choice or uses a template from
another package, and draws that as a graph for auditors. It does not judge
whether an interaction is unsafe. damlisk reports vulnerabilities inside and
across packages. The two are complementary: the graph shows where to look,
and damlisk checks what happens there.

**OpenZeppelin daml-lint (#262).** It is the closest tool. It is a Rust
linter, marked experimental, that ships seven detectors, mostly about missing
bounds and guards (for example a missing `ensure` on Decimal fields and
division without a non-zero check). It already has SARIF output, `--fail-on`
and inline allow annotations. damlisk differs in four ways:

- **It analyzes both the source and what the ledger runs.** daml-lint extracts
  templates and choices from source with line-based text patterns. damlisk
  parses Daml with a full grammar and links the syntax tree to the compiled
  Daml-LF, where the typechecker and desugaring have already run. It
  follows `damlc`-generated helpers, `let` bindings and helper functions, and
  works on DARs submitted for vetting and on dependencies that ship without
  source.
- **It covers more and different risks.** Its 36 detectors focus on
  authorization and asset flow: controllers taken from choice arguments,
  unprotected archives, leaked delegated authority, unchecked and stale
  fetches, non-consuming creates, value sent to arbitrary parties, untrusted
  interface exercises, weak randomness, time manipulation and unbounded
  loops. A text linter cannot check these reliably because they need data
  flow.
- **It is tested on the real network packages.** It scans all 246 public
  Splice DARs with no load errors, and each detector has a vulnerable Daml
  example built with `dpm` in CI.
- **It has a permissive license.** It is Apache-2.0, like the Daml SDK.
  daml-lint is AGPL-3.0, which some teams cannot adopt inside their build
  tooling.

damlisk adds the CI features daml-lint already has: inline suppressions in
M1 and SARIF in M2, where it also adds baselines. Both tools can feed the
same SARIF pipeline.

**Hacken Canton monitor (#302).** It watches a running participant through the
Ledger API and alerts on behavior after deployment. damlisk works before
deployment, on the package itself, so issues are fixed before they reach the
ledger. The two cover opposite ends of the lifecycle.

**Daml compiler warnings.** These are language-level warnings. damlisk focuses
on security and business-logic patterns that the compiler accepts.

### Backward compatibility

There is no impact on existing Daml applications or Canton APIs. The JSON and
SARIF outputs are versioned. Consumers ignore unknown fields within a
supported major version.

## Proof of Concept Implementation

The existing library is the proof of concept and is public under Apache-2.0:

- Repository: [DIGIAPP-LLC/damlisk](https://github.com/DIGIAPP-LLC/damlisk)
- Package: [`damlisk` on PyPI](https://pypi.org/project/damlisk/)

It already provides the analysis core, 36 detectors with documentation and
vulnerable examples, JSON output, the `--fail-on` CI exit code, the folder
`report` command and a scan of all 246 public Splice DARs.

## Acceptance Criteria

Acceptance requires the milestone criteria above, reproducible examples,
documented prerequisites and Apache-2.0 deliverables. M4 additionally
requires independent adoption evidence.

## Funding

**Total Funding Request:** 800,000 Canton Coin (CC) for Milestones 1–4.
Maintenance (Milestone 5) is TBD and not included in this amount.

### Payment Breakdown by Milestone

- Milestone 1: 250,000 CC upon committee acceptance.
- Milestone 2: 150,000 CC upon committee acceptance.
- Milestone 3: 250,000 CC upon committee acceptance.
- Milestone 4: 150,000 CC upon committee acceptance of the release and
  adoption criteria.
- Milestone 5: TBD.

The milestone amounts are open to negotiation with the committee.

### Volatility Stipulation

Delivery and adoption are scheduled for 16 weeks. The grant is denominated in
fixed Canton Coin. If delivery extends beyond six months because of
committee-requested scope changes, remaining milestones must be renegotiated
to account for USD/CC price volatility.

## Co-Marketing

DIGIAPP will coordinate release announcements with the Canton Foundation and
publish three things:

- A guide to Daml vulnerability patterns.
- A CI setup walkthrough.
- A write-up of the public Splice corpus scan, after any disclosures are
  resolved.

## Motivation

Daml removes whole classes of smart-contract bugs, but not authorization,
validation and business-logic mistakes. Examples are controllers taken from
choice arguments, unchecked fetches, assets sent to arbitrary parties,
archives that anyone can trigger and unsafe upgrades. These mistakes are
found today mostly by manual review.

An analyzer that runs on the deployed artifact and fails CI on new issues
moves these checks earlier. It also gives operators a way to check a package
before vetting it.

## Rationale

The analyzer and its corpus run already exist. The grant therefore funds
precision, integration and new analysis on a working base, not research
toward a first prototype.

Analyzing Daml-LF keeps the analyzer aligned with what the ledger executes,
and the source layer makes its findings actionable in source. The
same tool serves developers, who have the source, and auditors and operators,
who may only have the DAR. SARIF and
`dpm` reuse the CI and tooling that teams already have.

## Non-Goals

- Symbolic execution, attack generation or formal verification. These are
  candidates for a follow-up proposal based on the M3 data-flow engine.
- Interface-instance and token-standard (CIP-56) conformance checks. These
  build on the M1 source model and the M3 data-flow engine and are planned
  for a follow-up proposal.
- Runtime monitoring or ledger access.
- Guaranteeing the absence of vulnerabilities. damlisk reports patterns and
  does not replace an audit.
- Daml-LF 1.x packages (SDK 2.x), beyond best-effort loading.
