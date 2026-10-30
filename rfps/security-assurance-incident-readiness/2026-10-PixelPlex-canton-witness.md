## Development Fund Proposal

**Organization:** PixelPlex  
**Author / Primary Contact:** Semyon Protas, Yury Korzun (PixelPlex)  
**Status:** Draft  
**Created:** 2026-10-28  
**Proposal Type:** RFP-aligned  
**RFP / Roadmap Area:** Security, Assurance & Incident Readiness. RFP 22 Daml Security Standards and Secure Development: "testing methodologies, automated analysis … and CI/CD integration", so that developers "identify and prevent security weaknesses before Daml packages are deployed or vetted". Secondary: RFP 19 DPM Components and Extension Ecosystem, since the tool ships as a `dpm` component.  
**Champion:** `Needs Champion`  
**Total Funding Request:** 1,120,000 CC  
**Project Duration:** 9 months (delivery in 22 weeks; adoption payments until month 9)  
**Label:** daml-tooling  

---

## Abstract

A Daml test can check that a party cannot query a contract, but not that the party never received it. For example, bob is a choice observer on alice's choice, and inside it alice reads her `Secret`. Bob now holds the secret's contents, and no query bob can run shows it. Nothing in the toolchain reports this, and nothing fails a build when a code change gives more parties such access, including when the change sits in a shared helper library that `upgrade-check` does not compare.

We propose **Canton Witness**, a `dpm` component. It turns the transaction trees that `dpm test` already produces into a disclosure report: which role received which contract, through which channel, and because of which node. It diffs that report between two versions of a package and fails a CI build when the set of receiving parties grows. Milestone 1 runs it over the shipped token-standard test scenarios and publishes the result. Milestone 3 moves the data upstream, so the tool reads a supported output instead of HTML, and adds the helper case to `upgrade-check`. 57% of the request is paid only for use by teams outside PixelPlex. Everything is Apache-2.0.

The companion implementation draft, [`2026-10-PixelPlex-canton-witness-implementation-draft.md`](./2026-10-PixelPlex-canton-witness-implementation-draft.md), has the report object, role resolution, matching rules, the gate, the validation corpus and the reproductions (Appendix A).

---

## Specification

### 1. Objective

Give a Daml team a CI check that fails when a change widens who receives its contracts, including through divulgence and witnessing.

Three gaps, each reproduced at Daml SDK 3.5.2. The minimal code and commands are in the implementation draft, Appendix A.

1. **Two channels are invisible to party-scoped queries.** In a scenario where alice's choice fetches her `Secret` and creates a `Child`, with bob as choice observer, every party-scoped read form in Daml Script (`query`, `queryFilter`, `queryContractId`, `queryDisclosure`, `queryInterface`, `queryInterfaceContractId`) returns nothing as bob for either contract. `dpm test --table-output` marks bob `D Divulged` on `Secret` and `W Witness` on `Child`, and also `D` on the `Bridge` contract the choice was exercised on. The same shape is in the token standard: `EventLog_HoldingsChange` in `splice-api-token-transfer-events-v2` is a non-consuming choice with `observer observers`, and `splice-token-standard-utils` fills `observers` with `accountParties` for every transfer, allocation and holding change it logs. This is by design: the event log exists so that account parties learn about changes. Every party in that list that is not already a stakeholder of the event-log contract gets `D` on it, and what else it receives depends on what the implementation fetches or creates inside the choice. A report lists that set, so a team notices when it grows.
2. **A change behind a helper is invisible to `upgrade-check`.** If only a helper changes (`obs _ = []` to `obs t = [t.other]`) and the template's `observer obs this` stays byte-identical, `dpm upgrade-check --compiler v1.dar v2.dar` prints nothing and exits 0; with `--both` it reports that the upgrade typechecks. The same holds when the helper is in a separate package and the application is rebuilt against its new version. Changing the `observer` expression in the template itself does give a warning ("Expression is structurally different"), which `dpm build` with `upgrades:` can raise to an error through `-Werror=upgraded-template-expression-changed`; the helper case has no warning to raise. The V2 test token shipped with the standard (`splice-test-token-v2`) uses this pattern: its holding's signatories come from `accountParties` in `splice-token-standard-utils`. Milestone 3 includes an `upgrade-check` patch that compares the referenced definitions.
3. **Nothing turns this into an artifact.** `--transactions-output` and `--table-output` write HTML for one test run. There is no machine-readable form, no comparison between runs and nothing a build can fail on. Canton's runtime check compares recomputed signatories and observers only for an existing contract when it is used, and only those two sets.

### 2. Implementation Mechanics

**Input.** `dpm test --transactions-output` writes a tree per scenario in which each contract carries `disclosed to` and `divulged to` lines and each fetch is a child of the exercise that performed it. `--table-output` writes a contract-by-party matrix with the codes `S`, `O`, `D`, `W`. Until Milestone 3 lands an upstream output, the reader parses this HTML behind one interface, with golden-file tests per supported SDK version.

**The report.** Per scenario: package names, versions and hashes; SDK and tool versions; one row per contract instance; per role, the code it holds and the node that established it. Parties are replaced by roles resolved from the scenario's allocations, so reports compare across runs. If the tool cannot resolve a scenario's allocations, it refuses the scenario and writes no report for it.

**The diff.** Rows are matched on template, creating exercise and role. A loop can create several contracts of one template in one exercise; for such a group the diff still tracks how many contracts there are and which role holds which code on which contract. A role that gains a code is an addition, and a role that loses one is a removal. Both are reported with the node on each side. An ambiguous match is marked inconclusive, and the gate counts it as a failure.

**The gate.** On a pull request the Action builds the baseline from the pull request's base commit with the same tool version; a CI artifact is only a cache. The gate fails on any addition and on any inconclusive result, and the published Action has no override. Changes to the scenarios or the role map are listed in a separate category of the diff.

A change the team intends is accepted by an entry in `witness-accept.json`, reviewed with the pull request: an addition as (scenario, template, role, code, count), and an inconclusive result or an added or removed scenario by its own entry. Rows of an added scenario are reported in full, so the reviewer sees what the new test discloses. An entry that no longer matches anything gives a warning, and a scheduled job proposes its removal. The accept file and the workflow come from the pull request itself, so the protection sits in the branch rules: Code Owners for the accept file, the scenarios, the role map, `.github/` and CODEOWNERS, with "Require review from Code Owners" and approval of the most recent push. Milestone 4 counts an organization only if these rules are in place. The gate stays a required check, and nobody needs an admin bypass. Details are in the implementation draft, §5.

**Delivery.** A `dpm` component (`dpm witness report | diff | gate`) that runs on top of `dpm test`, a GitHub Action that wraps it, and the reader as a library with a published report schema.

**What we consume.** At Splice 0.9.4 four of the five token-standard test packages (`splice-test-token-v1-test`, `splice-test-token-v2-test`, `splice-token-standard-v1-test`, `splice-token-standard-v2-test`) contain 161 top-level `Script ()` definitions that `dpm test` runs. The fifth, `splice-token-standard-utils-test`, holds unit tests of the utils and is out of scope. They are Apache-2.0 and are consumed by source copy, as the `daml.yaml` of `splice-token-standard-v1-test` and `-v2-test` requires. Building them also needs DARs from outside `token-standard/`: `splice-amulet`, `splice-util` and `splice-util-token-standard-wallet`.

**Measuring a package one does not own.** The measured package can be a data dependency of a scenario package; its templates resolve by package hash, which we verified against a package whose sources were deleted. Definitions hidden by a module export list are reachable with `--ignore-data-deps-visibility=yes`. The limit is off-ledger inputs: a workflow that needs a choice context, a disclosed contract or another value the vendor computes off-ledger cannot be driven without reimplementing that part of its backend. This grant builds the tool for a team measuring its own application, which has those inputs in its own tests. Third-party measurement is not a deliverable of this proposal.

### 3. Architectural Alignment

- Changes nothing in Canton or in the measured application, and nothing runs beside a participant.
- Follows DPM component conventions and is invoked as `dpm witness`, next to `dpm test`.
- Runs the shipped token-standard test packages as they are.
- Every report names the SDK and tool versions that produced it; CI pins two SDK releases.

### 3a. Relationship to adjacent proposals

| Adjacent work | Overlap | Boundary we commit to |
| --- | --- | --- |
| [#327](https://github.com/canton-foundation/canton-dev-fund/pull/327) dpm trace (merged 2026-08-06) | `dpm` component; transaction-tree visualization; event-tree and field diffs between prepared, committed and failed transactions | #327 reads one transaction from a participant's Ledger API and shows it to a developer. We read test runs, aggregate disclosure per role across a scenario suite, and compare package versions in CI. We build no visualizer and no Ledger API client. We will publish the report schema so `dpm trace` can open a Witness report, and propose that integration to its authors; none has been agreed |
| [#124](https://github.com/canton-foundation/canton-dev-fund/pull/124) Canton Visibility Regression Kit (closed 2026-04-15, 850,000 CC) | the same problem; baseline-versus-candidate diffs, JSON and Markdown reports, a CI layer | closed after the Committee asked for 2–3 teams that would use it and for validation against Splice or the Token Standard. Its assertions used party-scoped queries, which do not see `D` or `W`. A DA reviewer suggested extending `submitResultAndTree` with witness information: "the UX is much better if the visibility assertions are close to the actual code and don't exist separately in a CI step which requires to maintain multiple data dependencies spread across multiple tools." Milestone 3 puts that data into the toolchain as JSON output of `dpm test`, which such assertions could later build on. The report and gate stay a thin layer over it with no extra dependencies. We keep the CI step because an assertion checks only what its author expected, while a report diff also catches channels nobody wrote an assertion for. We credit #124 as prior art |
| [#400](https://github.com/canton-foundation/canton-dev-fund/pull/400) Sigli.ai DAWE (open, RFP 22) | security scenarios in Daml Script, an over-disclosure pattern (DSP-05), upgrade regression (DSP-10), a CI runner | DAWE checks over-disclosure as an assertion that a party cannot fetch or query a contract, which passes for `D` and `W` (implementation draft, Appendix A). Witness adds no scenario catalogue and asserts nothing; it reports what a run disclosed and fails a build when that grows. A DAWE suite is a valid input to `dpm witness`; we will offer its authors the report schema and a joint run over their DSP-05 scenarios. Nothing has been agreed |
| [#879](https://github.com/canton-foundation/canton-dev-fund/pull/879) cantonsim (PixelPlex, open) | recipients of a transaction per node; `dpm` component with a CI mode | cantonsim takes one command against a live participant and its topology and computes which participants and parties receive which view before submission. Witness needs no participant, reads test runs, and compares disclosure across package versions. No shared code or deliverable; if both are funded, they share the report schema |
| [#856](https://github.com/canton-foundation/canton-dev-fund/pull/856) Canton Transaction Profiler (open) | `dpm` component; CI regression checks over Daml Script runs | it measures transaction size and traffic cost; we measure who receives which contract. No shared deliverable; the report schema is open to it |
| [#192](https://github.com/canton-foundation/canton-dev-fund/pull/192) Privacy Workflow Simulator & Auditor (closed 2026-10-22, Dev Fund 2.0 transition) | per-node privacy audit, CI plugin | a hosted simulator with a policy engine that flags and fixes disclosure; we run the team's own `dpm test` scenarios, state no policy and gate only on change |
| [#335](https://github.com/canton-foundation/canton-dev-fund/pull/335) Token Standard Local API Compatibility & CI Harness (closed 2026-06-02) | testing token-standard implementations | closed for overlap with active proposals, with the author's agreement, after a reviewer asked what it added to `splice-token-standard-test`. We do not replace that harness; we run it and report what it discloses |
| [#145](https://github.com/canton-foundation/canton-dev-fund/pull/145) Canton Upgrade & Conformance Kit (closed 2026-10-22) | upgrade preflight | environment qualification against a deployment; we read test-run transaction trees |
| [#786](https://github.com/canton-foundation/canton-dev-fund/pull/786) Koschei Sentinel (open) | security evidence, selective-disclosure rules | operational evidence for incident and assurance work; ours is a build-time check on one application. No shared deliverable |
| [#12](https://github.com/canton-foundation/canton-dev-fund/pull/12) B-Method Formal Verification (open) | reasoning about Daml correctness | we prove nothing about the code; we record what a run disclosed |
| [#788](https://github.com/canton-foundation/canton-dev-fund/pull/788) LedgerShield (open), [#810](https://github.com/canton-foundation/canton-dev-fund/pull/810) Party Mobility (open) | API-boundary audit; data retained after a party moves | out of scope here: we read no live API and do not cover hosting migration |

Canton also ships visibility conformance suites (`DivulgenceIT`, `TransactionServiceVisibilityIT`, `ExplicitDisclosureIT`). They test the ledger implementation against fixed models, not an application's own DAR.

### 4. Backward Compatibility

No impact on anything deployed. The tool reads DARs and test output and defines no on-ledger object. The report schema is versioned.

---

## Milestones and Deliverables

Two senior engineers from the PixelPlex Daml audit team, authors of the draft Standard Package Validation CIP (cips PR #168), who validate and audit Daml packages. Milestones 1 to 3 take 22 weeks from the project start. Milestone 4 is the adoption window, closing at month 9.

### Milestone 1: Report, reader and the token-standard disclosure map
- **Estimated Delivery:** week 8
- **Estimated Effort:** 10 engineer-weeks
- **Focus:** the report schema, the reader, role resolution, provenance, and a validation corpus; then the first disclosure map.
- **Deliverables / Value Metrics:**
  - Reports for every token-standard test scenario (161 at Splice 0.9.4) at the Splice release current at the start of the milestone, regenerable with one published command. Any scenario the tool refuses is listed with the reason.
  - A disclosure map of the V2 test token shipped with the standard (`splice-test-token-v2`): for each account shape (basic, with provider, special accounts), which roles receive a holding and through which channel, compared with what `accountParties` documents; and which roles receive what through `EventLog_HoldingsChange`. The map describes intended behaviour; it reports no defects. We open an issue in `canton-network/splice` with it and discuss it in the Token Standards SIG; the published map links that discussion.
  - A cross-check against a running ledger: a subset of the token-standard scenarios, run on a local `dpm sandbox`. For each created contract, the parties the report marks `S`, `O` or `W` are compared with `witness_parties` of its create event in the ledger-effects stream, and every mismatch is published and explained. `D` has no Ledger API counterpart, because the event stream has no fetch events, so it is checked only on the IDE ledger.
  - The query comparison published as a finding: for each scenario, what the party-scoped query forms return against what the report shows.
  - Feasibility gate, published either way: the validation corpus listed in the implementation draft §10 passes. It has a known-answer scenario for each code, and six mutations that must be detected: a recipient swapped inside a group, two recipients exchanged across roles, a fetch added inside a choice with a wider audience (new `D`), a create moved under an exercise with an extra choice observer (new `W`), a choice observer added on a non-consuming choice (new `D` on the exercised contract), and observer logic moved into a helper and then changed. An unsupported construct must be refused, never reported as clean. Any mutation the tool cannot detect by the end of the milestone is published as a stated limit, and the gate treats that case as inconclusive and fails.

### Milestone 2: Diff, gate and `dpm` component
- **Estimated Delivery:** week 15
- **Estimated Effort:** 9 engineer-weeks
- **Focus:** the diff with conservative matching, the gate with a base-commit baseline and an accept file, packaging as `dpm witness`, the GitHub Action, documentation.
- **Deliverables / Value Metrics:** `dpm witness report | diff | gate` released; the gate fails on every mutation in the corpus and on every inconclusive match; a demonstration on a public pull request in which a change to a stakeholder helper fails the build while `upgrade-check` passes; getting-started and CI integration guides.

### Milestone 3: Upstream data source
- **Estimated Delivery:** PR opened by week 22; payment on merge
- **Estimated Effort:** 7 engineer-weeks
- **Focus:** replacing the HTML parser with a supported output, and closing the helper gap in `upgrade-check`.
- **Deliverables / Value Metrics:** a pull request to `digital-asset/daml` that gives `dpm test` a machine-readable output, as requested in [digital-asset/daml#16371](https://github.com/digital-asset/daml/issues/16371) (open since 2023). With a new option, `dpm test` writes the transaction tree and the contract-by-party matrix as JSON under a published schema, next to the HTML: per node the `disclosed to` and `divulged to` parties, fetch nodes, and the `S`, `O`, `D`, `W` codes. The data is already in `damlc`, where the HTML is rendered from it; the change adds the serialization and its tests. We open the issue for the design in week 1 of Milestone 1.

  A second pull request to `digital-asset/daml` makes `upgrade-check` compare the definitions a stakeholder or observer expression refers to, including across a dependency's versions, and warn under its own diagnostic name, so teams can enable it separately from `upgraded-template-expression-changed`. The pull request comes with a design note (implementation draft §9.1) and the number of warnings the patch gives on consecutive Splice releases. We open it as an issue in week 1 of Milestone 1, so the maintainers can take it themselves if they prefer; in that case its share of this milestone is not paid.

  **Payment on merge.** Milestone 3 is paid in two parts: 85,000 CC on merge of the data-source pull request, and 35,000 CC on merge of the `upgrade-check` pull request. After merge, the reader switches to the new output once an SDK release contains it, as part of maintenance if that release comes after month 9. The HTML parser then remains only as the fallback for older SDKs.

  **Deadline.** A Milestone 3 part is paid only if its pull request is merged by month 9, or by a later date the Committee sets at the Milestone 2 review. An unmerged part is not paid. If the maintainers implement the JSON output themselves, that part is not paid either, as for the `upgrade-check` patch.

### Milestone 4: Independent adoption
- **Estimated Delivery:** adoption window from Milestone 2 acceptance until month 9
- **Estimated Effort:** 5 engineer-weeks of integration support over the window
- **Focus:** use in CI by teams other than PixelPlex.
- **Deliverables / Value Metrics:** up to **4 organizations**, paid per organization. An organization counts when all of the following hold:
  1. the repository builds a Daml package that is vetted on MainNet by at least one participant not operated by PixelPlex. The organization gives the package ID, and we check the vetting in the synchronizer's topology state and publish the check;
  2. the `dpm witness` gate runs on every pull request to that repository for **at least 8 consecutive weeks**, over **at least 10 scenarios**;
  3. the evidence is either a public CI history, or CI run logs shared with the Committee together with a comment from the organization on this proposal's pull request;
  4. a representative of the organization confirms in that pull request that it intends to keep the gate;
  5. the protected branch requires review from Code Owners and approval of the most recent push, and CODEOWNERS covers `witness-accept.json`, the scenarios, the role map, `.github/` and CODEOWNERS itself. The evidence is the Action's log line for rulesets, or, for classic branch protection, the setting shown to the Committee reviewer.

  The Committee resolves disputes. A short adoption report is published at the end of the window.

Project management, SIG coordination and release work across milestones: 4 engineer-weeks.

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone
- Demonstrated functionality or operational readiness
- Documentation and knowledge transfer provided
- Alignment with stated value metrics

Project-specific conditions:

- Functionality is demonstrated on `dpm test` runs with the local SDK and on the gate running in a public repository's CI. The tool reads test runs only and does not connect to a Canton node or DevNet; the Milestone 1 cross-check uses a local `dpm sandbox`.
- Milestones 1 and 2 are accepted after a reviewer named by the Committee or a design partner reruns the published commands and the mutation corpus and confirms the result on this proposal's pull request.
- A report is accepted only if it is regenerable: a reviewer runs the published command on the published inputs and obtains the same report.
- A reported code is accepted only if it names the transaction node that established it.
- The gate is accepted only if every mutation in the published corpus fails the build, and every inconclusive match without an accept entry fails it.
- An organization counts for Milestone 4 only if it meets the five conditions listed there, and only if it is a distinct legal entity, is not affiliated with PixelPlex, and is not a PixelPlex audit client; entities of one group count once.
- All code, schemas, reports and documentation are public under Apache-2.0 for the whole project, not only at the end.
- If a channel proves observable through a supported interface we did not account for, the finding is published and the report states it.

---

## Funding

**Total Funding Request:** 1,120,000 CC

### Payment Breakdown by Milestone
- Milestone 1 (Report, reader and token-standard disclosure map): 190,000 CC upon committee acceptance
- Milestone 2 (Diff, gate and `dpm` component): 170,000 CC upon committee acceptance
- Milestone 3 (Upstream data source and `upgrade-check`): 120,000 CC, 85,000 CC on merge of the data-source pull request and 35,000 CC on merge of the `upgrade-check` pull request
- Milestone 4 (Independent adoption): up to 640,000 CC, 160,000 CC per independent organization meeting the Milestone 4 condition, up to four, upon final acceptance

| | Paid regardless of adoption | Paid only for independent adoption |
| --- | --- | --- |
| Milestones 1–3 | 480,000 | |
| Milestone 4 | | 640,000 |
| **Total** | **480,000 (43%)** | **640,000 (57%)** |

A Milestone 3 part whose pull request is not merged by the deadline in Milestone 3 is not paid. If the Daml maintainers decline the JSON output, the data-source part (85,000 CC) is not paid and the reader keeps the HTML parser with its golden-file tests. Switching the reader to a merged output that ships in an SDK release after month 9 is part of maintenance, at our cost. If no one outside PixelPlex uses the gate, PixelPlex delivers Milestones 1–3 for 43% of the price. The 160,000 CC per organization is the part of the price of Milestones 1–3 that we hold back until the tool is in use, rather than a price for the Milestone 4 support work.

### Effort basis

**35 engineer-weeks**, priced at 32,000 CC per engineer-week. This is a planning assumption, not a quoted rate. The 480,000 CC paid regardless of adoption covers Milestones 1–3 and project management, 30 engineer-weeks, about 16,000 CC per engineer-week. The 5 engineer-weeks of adoption support are spent only if adopters appear.

| Milestone | Engineer-weeks | Effort |
| --- | --- | --- |
| 1 | 10 | schema, reader, role resolution, provenance, validation corpus, building and running the token-standard packages, the disclosure map, the sandbox cross-check |
| 2 | 9 | diff and matching, gate and base-commit baseline, `dpm` component and GitHub Action, guides, the public demonstration |
| 3 | 7 | the upstream data-source change in `damlc` or Daml Script, the `upgrade-check` patch, their review cycles |
| 4 | 5 | integration support for independent teams during the adoption window |
| across | 4 | project management, SIG coordination, releases |

### Volatility Stipulation
The grant is denominated in fixed Canton Coin and will require a re-evaluation at the 6-month mark.

### Maintenance
PixelPlex commits to 12 months of maintenance after the last milestone at its own cost: compatibility with each new SDK release within 30 days, regeneration of the published token-standard reports per Splice release, security fixes, and issue triage within 5 business days. Third-party measurement of packages one does not own, and any live Ledger API mode, are not included and would be proposed separately.

---

## Co-Marketing

Upon release, the implementing entity will collaborate with the Foundation on:

- Announcement coordination for each milestone
- A technical write-up of the token-standard disclosure map and of the `upgrade-check` reproduction
- A walkthrough of `dpm witness` in CI for the Daml developer community
- Listing in the ecosystem directory alongside the developer tooling

---

## Motivation

A Daml team can test that a party cannot query a contract, but it cannot test that the party did not receive it. Disclosure usually grows in ways only the second test would catch: a fetch moves into a choice with a wider audience, a create moves under an exercise with more informees, or someone edits a stakeholder helper in a dependency. Today the only way to see what a change shows to whom is to read the Daml by hand.

The helper case is common in application code. Teams compute stakeholder lists in functions shared by several templates and choices. A refactor of such a function changes who sees every contract built through it, and the reviewer of the pull request sees no changed `observer` line. `upgrade-check` says nothing (§1, gap 2). Canton's runtime check catches it only when an existing contract is used, and never for contracts the new version creates.

The token standard uses the same pattern: `accountParties` in `splice-token-standard-utils` sets the observers of event-log entries, and in the V2 test token also the signatories of the holding and the allocation. Those utils are versioned and reviewed together with the standard, so we do not count them as the risk. We use the standard's shipped scenarios as the first test corpus because they are public and large, and they use this pattern.

**Who benefits.** Teams whose Daml packages build on `splice-token-standard-utils` or compute stakeholders in helpers; auditors and reviewers of those packages; Featured Application teams that need to show what a package upgrade discloses before it is vetted; the token-standard maintainers, who get the Milestone 1 disclosure map of the standard's own test token and event log.

**How many.** In Splice 0.9.4, 17 packages declare `splice-token-standard-utils` as a data dependency, 5 of them outside tests (`splice-amulet`, `splice-dso-governance`, `splice-wallet`, `splice-wallet-payments`, `splice-util-token-standard-wallet`). Every V2 registry or application built on the standard's utils joins that set. Our planning assumption is that 4 independent teams adopt the gate within the window, which is the number Milestone 4 pays for.

**How this drives adoption.** The tool ships as `dpm witness` next to `dpm test` and runs on the scenarios a team already has. Adopting it means adding one CI step, which fails a pull request when a role starts receiving more. 57% of the grant is paid only when independent teams keep the gate running in CI on packages vetted on MainNet.

---

## Rationale

**Why a report and not only assertions.** An assertion checks what its author thought of. A report lists every code the run produced, including channels nobody wrote an assertion for.

**Why the transaction tree.** The party-scoped query forms return nothing for `D` and `W`. The Ledger API's ledger-effects stream reports a witnessed create through `witness_parties`, but it has no fetch nodes. So it misses divulgence, and it also needs a running participant.

**Why upstream in this grant.** Milestones 1–2 parse another tool's HTML, which is the main maintenance risk; a DA reviewer on #124 asked for this data in the toolchain instead. Milestone 3 does that and is paid only on merge, so the Foundation pays nothing if the maintainers decline. The `upgrade-check` patch closes the static half of the gap that the Milestone 2 demonstration shows; we file it as an issue first, and it is paid (35,000 CC) only if we write it and it is merged.

**Why the name.** The tool records who witnessed an application's data in the everyday sense, through any of the four codes. The Ledger API field `witness_parties` and the report code `W` use the word in a narrower, technical sense.

**Why a `dpm` component.** Developers already run `dpm test`, so the gate sits next to it. RFP 19 asks for this kind of extension.

**Alternatives considered.** Extending `upgrade-check` to compare the definitions a stakeholder expression refers to would catch the helper case, and Milestone 3 does that. It still cannot see `D` and `W`, which come from workflows rather than templates, and it produces no party sets to compare. Instrumenting a participant would observe production, but it needs a modified node and is outside RFP 22's "before Daml packages are deployed".

**About PixelPlex.** PixelPlex operates a Canton validator, four Featured Applications and an asset issuer, builds CC View, Console Wallet and CC Tag, co-authored CIP-0103 and authored the draft Standard Package Validation CIP (cips PR #168). About a third of its 100 engineers work on Canton and Daml.
