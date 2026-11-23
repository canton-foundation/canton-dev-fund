## Development Fund Proposal

**Organization:** Individual  
**Author / Primary Contact:** Maheswaran Velmurugan, GitHub [@soloking1412](https://github.com/soloking1412), member of the Daml Language & Developer Tooling SIG  
**Status:** Submitted  
**Created:** 2026-11-24  
**Proposal Type:** RFP-aligned  
**RFP / Roadmap Area:** Security, Assurance & Incident Readiness. RFP 22, Daml Security Standards and Secure Development (primary). RFP 19, DPM Components and Extension Ecosystem (secondary).  
**Champion:** `Needs Champion`  
**Total Funding Request:** 700,000 CC, of which 350,000 CC is paid only for independent adoption  
**Project Duration:** 4 months of delivery, then an adoption window to month 9  
**Label:** daml-tooling  
**License:** Apache-2.0  
**Prototype:** https://github.com/soloking1412/dpm-disclose (public since 2026-08-07, 44 tests)  

---

## RFP Alignment and Ecosystem Need

RFP 22 asks for "automated analysis, security-focused linting or static analysis" and "CI/CD integration" that help developers "identify and prevent security weaknesses before Daml packages are deployed or vetted." This proposal is a static analysis of one weakness class, unintended disclosure, that runs on a `.dar` before it is deployed or vetted and fails CI when an upgrade widens it. RFP 19 applies because it ships as a `dpm` component.

**Who benefits.**

- **Application teams.** They get a reviewed file that says who may see each contract, and a build that fails when a change contradicts it.
- **Validator operators and parties deciding whether to vet a package.** They can diff two DARs and see which parties gain visibility, with no source code and no test suite.
- **Auditors.** They get the signatory and observer table they currently build by hand, generated and re-checkable.

**Why it matters for adoption.** Privacy is the reason institutions choose Canton, and smart contract upgrades now make a new package version apply to contracts that already exist. A widening that ships in an upgrade applies to live contracts, and it cannot be rolled back after the parties have seen the data.

---

## Abstract

Which parties learn a contract is decided by the signatory, observer, controller and choice observer clauses of its template, and by what each choice fetches, creates and exercises. Nothing in the toolchain reports that set for a package, and nothing fails a build when it grows.

The concrete failure:

```diff
  template Trade
    with
      buyer : Party
      seller : Party
+     broker : Party
      notional : Decimal
    where
      signatory buyer, seller
+     observer broker
```

The broker now sees the notional on every `Trade`. Because a consuming exercise informs the contract's observers, the broker also sees every `Settle`. In review this reads as a field addition.

`dpm-disclose` computes, for every template and choice in a package, the parties that can receive the contract and everything the choice touches. It checks that against a declared `disclosure.yaml` and exits non-zero when a new version widens it. The working prototype reads Daml source and resolves 84% of the 1,236 nodes in six public packages, including Splice and Daml Finance. This grant moves it to Daml-LF, adds what a choice body discloses, and ships the gate as a `dpm` component. Half the request is paid only if teams outside this project use it.

---

## Specification

### 1. Objective

One static check, run on a `.dar`, that answers "who can see this contract and what it touches", compares the answer with what the team declared, and fails the build when an upgrade widens it.

The prototype's measurements against public packages are published with the packages pinned to commits and the script included, so anyone can rerun them: [2026-08 public package sweep](https://github.com/soloking1412/dpm-disclose/blob/main/docs/2026-08-public-package-sweep.md).

| Package | Templates | Nodes | Resolved from source |
|---|---:|---:|---:|
| daml-finance | 184 | 270 | 45% |
| daml-finance-app | 123 | 503 | 99% |
| OpenZeppelin canton-token-template, canton-stablecoin, canton-contracts | 23 | 50 | 100% |
| splice (includes the token standard) | 85 | 413 | 88% |
| **Total** | **415** | **1,236** | **84%** |

Three quarters of the unresolved nodes go through one helper, `Disclosure.flattenObservers`. Three Splice templates resolve to no party at all from source. `Subscription` in `splice-wallet-payments` is the clearest case: the signatory clause calls a helper, defined two lines below in the same file, that returns `[sender, receiver, provider]`. Source scanning cannot follow the call. Daml-LF analysis can.

### 2. Implementation Mechanics

**The rules.** A create node informs its signatories and observers. An exercise node informs the signatories, the controllers and the choice observers. A consuming exercise also informs the contract's observers. Every informee of an exercise also witnesses the whole subtree under it: the contracts the choice fetches, the contracts it creates, and the choices it exercises, recursively. The prototype implements the first three rules in `analyse()` in `src/disclose/ledger.py`. This grant adds the fourth.

**Daml-LF front end.** Templates, choices, party expressions and choice bodies are read from the compiled package through the published Daml-LF archive protobuf definitions rather than a new parser. Party expressions are resolved symbolically over the template's fields, following helper functions and dependencies, so `account.owner` becomes a field path and `Disclosure.flattenObservers observers` becomes the set it can return.

**What a choice touches.** Each choice body is walked for `fetch`, `create` and `exercise`, including through called functions and nested exercises. Each choice gets the set of templates its informees witness. This is the case where bob, a choice observer on alice's choice, receives the contents of a `Secret` that alice fetches inside it. It is found from the package alone, with no test that exercises the path.

**Limits.** The analysis over-approximates. Every branch counts, so the result is what a choice *can* disclose, not what one run did. Three cases are reported as inconclusive instead of guessed:

- a party set that depends on ledger state;
- an interface call whose implementations are not in the analyzed packages;
- a Daml-LF version the tool does not know.

An inconclusive node fails the gate unless `disclosure.yaml` records a reviewed answer for it, so nothing passes silently.

**Declared disclosure.** `disclosure.yaml` states, per template and choice, which roles may receive the contract and what the choice may disclose. It is meant to be reviewed by people who do not read Daml, such as a compliance function. `disclose check` proves the package against it or names the party, node and rule that break it.

**Upgrade gate.** `disclose diff v1.dar v2.dar` lists every role that gained visibility, with the node and the rule on each side. Widening exits non-zero, and narrowing is reported but passes. It compares the resolved party sets, not the expressions. `dpm upgrade-check` does not report a change made inside a helper while the template text stays identical (reproduced by PixelPlex in #946). This catches that case.

**Distribution.**

- A `dpm` component: `dpm disclose report | check | diff`.
- A GitHub Action.
- A JSON report schema, plus SARIF output so scanners such as damlisk can include the findings.

### 3. Architectural Alignment and Related Work

The default should be to extend what exists, so here is where each nearby tool stops.

| Work | What it does | Relationship |
|---|---|---|
| `dpm upgrade-check` | type compatibility, structural warnings on changed expressions | Says an expression changed, not whether the party set grew. Silent when the change is inside a helper. |
| #130 Certora Daml Package Analyzer (approved) | authority between packages | Different question: who can act across packages, not who receives what. |
| #262 OpenZeppelin stack (approved) | conservation, arithmetic, temporal faults | No informee analysis. |
| #1070 damlisk (open, RFP 22) | pattern detectors on Daml-LF; its M3 flags changed signatory, observer and controller expressions for review | Detectors flag patterns, but disclosure is not a pattern: an observer clause is not a defect, and only the application's designer knows who should see a contract. damlisk can consume this tool's SARIF output. |
| #971 DamlSec (open, RFP 22) | symbolic execution for security properties | Looks for bugs with no declared intent. `disclosure.yaml` is the intent a privacy check needs. |
| #946 Canton Witness (open, RFP 22) | disclosure observed in `dpm test` runs, including divulgence, gated on change | Complementary. Witness reports what the tests disclosed. This reports what the package can disclose, with no tests, on a DAR from a third party, against a declared policy. Every party Witness observes should be inside the static set, so the two cross-check each other. |
| #400 DAWE, #52 DamlFuzz | adversarial scenarios, fuzzing with privacy invariants | Their over-disclosure assertions need an expected set. This produces it. |
| #91 upgrade and vetting planner | mechanics of an upgrade: order, vetting, rollback | Disclosure change is outside its plan output. The JSON report can feed it. |
| #124 visibility regression kit (closed) | JVM assertions at the Ledger API | Closed pending named adopters and validation on Splice or the token standard. Both are addressed here. |
| #945 Canton Disclose (open) | exporting past transactions to auditors | Unrelated, despite the similar name. |

**Why not Daml Script assertions.** Daml Script can check what a party sees in a scenario someone wrote. A static report covers every template and choice without anyone writing a scenario, works on a DAR whose source you do not have, and is what a diff between two versions needs. Teams that do write scenarios can use the report as the expected value in them.

### 4. Backward Compatibility

No impact. The tool reads packages and writes reports. It changes no protocol behaviour, ledger state or interface. Projects without a `disclosure.yaml` are unaffected.

---

## Milestones and Deliverables

Dates assume a start on 2027-01-04. If the start moves, every date moves by the same amount. The dates are committed. A milestone not delivered by its date forfeits its funds, unless the Committee approves an amendment.

### Milestone 1: Daml-LF analysis, measured

- **Estimated Delivery:** 2027-03-01 (week 8)
- **Focus:** Daml-LF front end, symbolic resolution through helpers and dependencies, what a choice touches.
- **Deliverables / Value Metrics:** Measured by rerunning the published sweep script over the same packages at the same commits, with each package built to a DAR.

| Measure | Today | Target |
|---|---:|---:|
| Nodes fully resolved, all six packages | 84% | 95% |
| Nodes fully resolved, daml-finance | 45% | 95% |
| Nodes fully resolved, splice | 88% | 95% |
| Templates resolving to no party | 3 | 0 |

- `Subscription` reports sender, receiver and provider, and `Disclosure.flattenObservers` resolves.
- Every node still unresolved is listed with the reason it cannot be decided statically.
- **Cross-check:** the token-standard test scenarios are run with `dpm test --table-output`. Every party marked as signatory, observer, divulged or witness on a contract must be inside the static set for that template. Any miss is a bug in this tool. Each miss is fixed or published.
- The disclosure maps for these packages are published and reviewed with the Daml Tooling SIG.

### Milestone 2: Declared disclosure, the gate and the `dpm` component

- **Estimated Delivery:** 2027-04-26 (week 16)
- **Focus:** `disclosure.yaml`, `check`, `diff`, packaging.
- **Deliverables / Value Metrics:**
  - `dpm disclose` released, with the GitHub Action and the JSON and SARIF schemas.
  - A public mutation corpus that `diff` must fail on: an added observer, a widened choice observer, a helper whose return set grows, a fetch moved into a choice with a wider audience, and a change in a dependency's helper. The gate fails on every mutation and on every unreviewed inconclusive node.
  - A demonstration on a public pull request where a change to a stakeholder helper fails the build.
  - Documentation of the rules applied, so a reader can check the tool rather than trust it.

### Milestone 3: Independent adoption

- **Estimated Delivery:** adoption window from Milestone 2 acceptance to 2027-09-30
- **Focus:** use by teams outside this project.
- **Deliverables / Value Metrics:** 100,000 CC per independent organization, up to three, plus 50,000 CC for third-party schema use. An organization counts when all of the following hold:
  1. Its repository builds a Daml package that is vetted on MainNet by a participant the author does not operate. The organization gives the package ID, and the author checks the vetting and publishes the check.
  2. `disclose check` or `disclose diff` runs as a required check on its pull requests for at least 8 consecutive weeks.
  3. The evidence is public CI history, or run logs shared with the Committee.
  4. A representative confirms on this proposal's pull request that they intend to keep it.
  5. It is a distinct entity, not affiliated with the author and not paid from this grant. Entities of one group count once.

  The 50,000 CC is paid when another tool or an audit firm consumes the published schema in a public release or a published audit. Any part of Milestone 3 not earned by 2027-09-30 is not paid and stays with the fund.

---

## Acceptance Criteria

- **Reproducible.** Milestone 1 is measured, not judged. The baseline, the commits and the script are already public. Milestones 1 and 2 are accepted after a reviewer named by the Committee or the champion reruns the published commands and the mutation corpus, and confirms the result on this proposal's pull request.
- **Correctness before coverage.** Reported sets match a manual reading on a sample the reviewer picks. Disagreements are documented and resolved.
- **No silent passes.** The tool states where it cannot resolve a party. An unreviewed inconclusive node fails the gate.
- **Adoption is real.** Milestone 3 counts only organizations meeting the five conditions.
- **Open.** All code, schemas, reports and documentation are public under Apache-2.0 from the first commit.

---

## Funding

**Total Funding Request:** 700,000 CC

### Payment Breakdown by Milestone

- Milestone 1 (Daml-LF analysis, measured): 200,000 CC upon committee acceptance
- Milestone 2 (Declared disclosure, the gate and the `dpm` component): 150,000 CC upon committee acceptance
- Milestone 3 (Independent adoption): up to 350,000 CC, 100,000 CC per qualifying organization up to three, and 50,000 CC for third-party schema use

| | Paid regardless of adoption | Paid only for adoption |
|---|---:|---:|
| Milestones 1–2 | 350,000 | |
| Milestone 3 | | 350,000 |
| **Total** | **350,000 (50%)** | **350,000 (50%)** |

### Effort basis

The plan is one engineer full time for 16 weeks of delivery, plus about 3 weeks of integration support for adopters during the window. At a reference rate of $0.10 per CC, the full request is about $70,000. The 350,000 CC paid regardless of adoption is about 22,000 CC per engineer-week, below the 32,000 CC per engineer-week used as a planning rate in other RFP 22 proposals. No audit or other third-party cost is included.

| Milestone | Engineer-weeks | Work |
|---|---:|---|
| 1 | 8 | Daml-LF reader, symbolic resolution, what a choice touches, sweep rerun, token-standard cross-check |
| 2 | 8 | `disclosure.yaml`, `check`, `diff`, mutation corpus, `dpm` component, Action, SARIF, docs |
| 3 | about 3, over the window | integration support for adopting teams |

### Volatility Stipulation

The amounts are fixed in CC, and no repricing is requested. The project closes at month 9.

---

## Adoption and Distribution

**Adopters.** None are confirmed at the time of submission. I am asking in the Daml tooling and security SIGs and directly, and teams can confirm on this pull request. Any team that wants to see the output first can send me a package, and I will run the prototype on it and send them the report.

Distribution runs through tools developers already use: the `dpm` component, the GitHub Action, and SARIF output that drops into existing code scanning. The first adopters to approach are teams whose packages others build on, such as token, settlement and wallet packages. A disclosure regression there is inherited by everyone downstream, so their Milestone 1 disclosure maps are the opening for that conversation.

---

## Maintenance and Sustainability

- 12 months of maintenance after Milestone 3 at the author's cost:
  - support for each new SDK and Daml-LF version within 30 days of release;
  - all Daml-LF 2.x versions in active use supported at once;
  - issue triage within five business days.
- An unknown Daml-LF version is reported as inconclusive. It never passes.
- The rules come from the ledger model, not from any release, so the part that needs ongoing work is the front end.
- Everything is Apache-2.0, and the rules are documented. If someone else becomes the better maintainer, a handover is a bounded piece of work, and the repository can move to the Foundation.

---

## Co-Marketing

- A technical write-up of the Milestone 1 disclosure maps for Splice and Daml Finance.
- A SIG session demonstrating the gate on a real pull request.
- A short guide for adding `disclosure.yaml` to an existing codebase.

---

## Motivation

Canton's privacy model is why institutions are here, and it has very little tooling behind it. Upgrades make it urgent. Under smart contract upgrades a new version takes effect for existing contracts, so a widening that ships in an upgrade discloses data on contracts that already exist. That cannot be rolled back. The check has to happen before the package is vetted, on the package itself.

---

## Rationale

**Why a declared specification rather than inferred intent.** A privacy tool that guesses will be ignored the first time it is wrong. Writing down who may see a contract is work a team should be doing anyway, and the file is readable by people who cannot read Daml.

**Why static.** It covers every template and choice without anyone writing tests. It runs on a third party's DAR. It is cheap enough to run on every pull request. Dynamic tools such as #946 are the right complement: they show what a run actually did, and every party they observe should be inside the static set.

**Why the source prototype first.** It was the fastest way to test whether the model gives useful answers before committing to the Daml-LF work. It does, and it also showed its own ceiling within a day of running against Daml Finance. The grant is scoped to remove exactly that ceiling.
