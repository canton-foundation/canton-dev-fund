## Development Fund Proposal

**Organization:** Individual  
**Author / Primary Contact:** Maheswaran Velmurugan, GitHub [@soloking1412](https://github.com/soloking1412), member of the Daml Language & Developer Tooling SIG  
**Status:** Submitted  
**Created:** 2026-11-24  
**Proposal Type:** RFP-aligned  
**RFP / Roadmap Area:** Security, Assurance & Incident Readiness. RFP 22, Daml Security Standards and Secure Development (primary). RFP 19, DPM Components and Extension Ecosystem (secondary).  
**Champion:** `Needs Champion`  
**Total Funding Request:** 200,000 CC, of which 100,000 CC is paid only for independent adoption  
**Project Duration:** 12 weeks  
**Label:** daml-tooling  
**License:** Apache-2.0  
**Prototype:** https://github.com/soloking1412/dpm-disclose (public since 2026-08-07, 44 tests)  

---

## RFP Alignment and Ecosystem Need

RFP 22 asks for "automated analysis, security-focused linting or static analysis" and "CI/CD integration" that help developers "identify and prevent security weaknesses before Daml packages are deployed or vetted." This proposal covers one weakness, a package disclosing contracts to more parties than intended. The tool runs on a `.dar` before it is deployed or vetted, and fails CI when an upgrade widens disclosure. RFP 19 applies because it ships as a `dpm` component.

The people it helps:

- Application teams get a reviewed file that says who may see each contract, and a build that fails when a change contradicts it.
- Validator operators, and anyone deciding whether to vet a package, can diff two DARs and see which parties gain visibility. They need no source code and no test suite to do it.
- Auditors get the signatory and observer table they build by hand today, generated and checkable again on every change.

Privacy is why institutions pick Canton. With smart contract upgrades, a new package version also applies to contracts that already exist. So a widening that ships in an upgrade reaches live contracts, and once a party has seen the data it can't be taken back.

---

## Abstract

Which parties see a contract is decided by the signatory, observer, controller and choice observer clauses of its template. Nothing in the toolchain reports that set for a package, and nothing fails a build when it grows.

A small example:

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

The broker now sees the notional on every `Trade`. A consuming exercise informs the contract's observers, so the broker also sees every `Settle`. In review this looks like a field addition.

`dpm-disclose` works out, for every template and choice in a package, which parties are informed. It checks that against a `disclosure.yaml` the team writes, and exits non-zero when a new version widens it. The prototype reads Daml source. It resolves 84% of the 1,236 nodes in six public packages, including Splice and Daml Finance. This grant moves it to Daml-LF, so it works on a compiled package with no source, and ships it as a `dpm` component with a GitHub Action. Half of the request is paid only when teams outside this project use it.

---

## Specification

### 1. Objective

One static check, run on a `.dar`, that answers "who can see this contract", compares the answer with what the team declared, and fails the build when an upgrade widens it.

The prototype's results on public packages are published with each package pinned to a commit, together with the script that produced them, so anyone can run them again: [2026-08 public package sweep](https://github.com/soloking1412/dpm-disclose/blob/main/docs/2026-08-public-package-sweep.md).

| Package | Templates | Nodes | Resolved from source |
|---|---:|---:|---:|
| daml-finance | 184 | 270 | 45% |
| daml-finance-app | 123 | 503 | 99% |
| OpenZeppelin canton-token-template, canton-stablecoin, canton-contracts | 23 | 50 | 100% |
| splice (includes the token standard) | 85 | 413 | 88% |
| **Total** | **415** | **1,236** | **84%** |

Three quarters of the unresolved nodes go through one helper, `Disclosure.flattenObservers`. Three Splice templates resolve to no party at all from source. `Subscription` in `splice-wallet-payments` is the clearest one. Its signatory clause calls a helper defined two lines further down the same file, which returns `[sender, receiver, provider]`. Reading source text, the tool can't follow that call. Reading Daml-LF, it can.

### 2. Implementation Mechanics

**Rules.** The rules come from the Daml ledger model:

- A create node informs its signatories and observers.
- An exercise node informs the contract's signatories, the choice's controllers and its choice observers.
- A consuming exercise also informs the contract's observers.

The prototype applies these in `analyse()` in `src/disclose/ledger.py`, which is about twenty lines.

**Daml-LF front end.** Templates, choices and party expressions are read from the compiled package through the published Daml-LF archive protobuf definitions, not a new parser. Party expressions are resolved over the template's fields, following helper functions and dependencies. So `account.owner` becomes a field path, and `Disclosure.flattenObservers observers` becomes the set of parties it can return.

**Unresolved parties.** Some party sets can't be decided statically, for example one that depends on ledger state or on an interface implemented outside the analyzed packages. The tool reports these as inconclusive instead of guessing. An inconclusive node fails the gate unless `disclosure.yaml` records a reviewed answer for it, so nothing passes silently.

**Declared disclosure.** `disclosure.yaml` lists, for each template and choice, which roles may see the contract. It is short enough for someone who doesn't read Daml, such as a compliance reviewer, to check. `disclose check` either passes or names the party, node and rule that break the declaration.

**Upgrade gate.** `disclose diff v1.dar v2.dar` lists every role that gained visibility, with the node and rule on each side. Widening exits non-zero. Narrowing is reported but passes. The diff compares resolved party sets, not expression text, so it also catches a change made inside a helper while the template text stays the same. `dpm upgrade-check` does not report that case (PixelPlex reproduced this in #946).

**Distribution.** A `dpm` component (`dpm disclose report | check | diff`), a GitHub Action, and a documented JSON report format other tools can read.

**Out of scope.** Divulgence, meaning what an informee learns from the fetches and creates inside a choice body, is not part of this grant. It is a property of whole workflows, and it is a bigger piece of work. If this grant lands and the tool gets used, I will propose that separately.

### 3. Architectural Alignment and Related Work

| Work | What it does | How this differs |
|---|---|---|
| `dpm upgrade-check` | type compatibility, warnings on changed expressions | Says an expression changed, not whether the set of parties grew. Silent when the change is inside a helper. |
| #130 Certora Daml Package Analyzer (approved) | authority between packages | Answers who can act across packages, not who sees a contract. |
| #262 OpenZeppelin stack (approved) | conservation, arithmetic and timing faults | No informee analysis. |
| #1070 damlisk (open, RFP 22) | pattern detectors on Daml-LF; its M3 flags changed signatory, observer and controller expressions | An observer clause isn't a defect, so disclosure can't be caught as a pattern. Only the team knows who should see a contract, which is why this tool checks against a declaration. damlisk could read this tool's JSON. |
| #971 DamlSec (open, RFP 22) | symbolic execution for security properties | Looks for bugs without a declared intent. `disclosure.yaml` is that intent for privacy. |
| #946 Canton Witness (open, RFP 22) | disclosure seen in `dpm test` runs, including divulgence | Witness needs test scenarios and covers what the tests exercise. This needs no tests, runs on a third-party DAR, and checks against a declared policy. On the same package their signatory and observer results should agree, so each is a check on the other. |
| #124 visibility regression kit (closed) | JVM assertions at the Ledger API | Closed pending named adopters and testing on Splice or the token standard. The sweep above covers Splice and the token standard. Adopters are below. |
| #945 Canton Disclose (open) | exporting past transactions to auditors | Unrelated, despite the name. |

**Why not Daml Script assertions.** Daml Script checks what a party sees in a scenario someone wrote. A static report covers every template and choice without anyone writing a scenario. It also works on a DAR you don't have the source for, and it is what a diff between two versions needs. Teams that do write scenarios can take the expected values from the report.

### 4. Backward Compatibility

None. The tool reads packages and writes reports. It changes no protocol behaviour, ledger state or interface, and projects without a `disclosure.yaml` are unaffected.

---

## Milestones and Deliverables

Dates assume a start on 2027-01-04. If the start moves, every date moves with it. The dates are committed: a milestone not delivered by its date forfeits its funds unless the Committee approves an amendment.

### Milestone 1: Daml-LF analysis

- **Estimated Delivery:** 2027-02-15 (week 6)
- **Focus:** Daml-LF front end, resolving party expressions through helpers and dependencies, `check` and `diff` working on DARs.
- **Deliverables / Value Metrics:** Measured by running the published sweep script again over the same packages at the same commits, with each package built to a DAR.

| Measure | Today | Target |
|---|---:|---:|
| Nodes fully resolved, all six packages | 84% | 95% |
| Nodes fully resolved, daml-finance | 45% | 95% |
| Nodes fully resolved, splice | 88% | 95% |
| Templates resolving to no party | 3 | 0 |

- `Subscription` reports sender, receiver and provider, and `Disclosure.flattenObservers` resolves.
- Every node still unresolved is listed with the reason it can't be decided statically.
- The resulting disclosure maps for these packages are published for the Daml Tooling SIG to review.

### Milestone 2: The gate and the `dpm` component

- **Estimated Delivery:** 2027-03-08 (week 9)
- **Focus:** final `disclosure.yaml` format, packaging, CI.
- **Deliverables / Value Metrics:**
  - `dpm disclose` released as a component, with a GitHub Action and the JSON report format documented.
  - A public set of test cases that `diff` must fail on: an added observer, a wider choice observer, a helper that returns more parties, and the same change inside a dependency. The gate fails on all of them, and on any inconclusive node nobody has reviewed.
  - A public pull request showing the build failing when a stakeholder helper is widened.
  - Documentation of the rules, so a reader can check the tool instead of trusting it.

### Milestone 3: Independent adoption

- **Estimated Delivery:** 2027-03-29 (week 12)
- **Focus:** use by teams outside this project.
- **Deliverables / Value Metrics:** 50,000 CC for each independent organization, up to two. An organization counts when:
  1. its repository builds a Daml package deployed to TestNet or MainNet;
  2. `disclose check` or `disclose diff` has run in CI on its pull requests for at least four consecutive weeks;
  3. the CI history is public, or the run logs are shared with the Committee;
  4. someone from the organization confirms on this pull request that they plan to keep using it;
  5. it is not affiliated with the author and is not paid from this grant.

  Teams can start using it as soon as Milestone 1 is delivered, which leaves up to six weeks for this. Any part of Milestone 3 not earned by week 12 is not paid and stays with the fund.

---

## Acceptance Criteria

- Milestone 1 is measured, not judged. The baseline, commits and script are already public. A reviewer named by the Committee or the champion runs them again and confirms the numbers on this pull request.
- Reported party sets match a manual reading of a sample the reviewer picks. Any disagreement is documented and resolved.
- The tool says where it can't resolve a party. An inconclusive node nobody has reviewed fails the gate.
- Milestone 3 counts only organizations that meet all five conditions.
- All code, documentation and reports are public under Apache-2.0 from the first commit.

---

## Funding

**Total Funding Request:** 200,000 CC

### Payment Breakdown by Milestone

- Milestone 1 (Daml-LF analysis): 60,000 CC upon committee acceptance
- Milestone 2 (The gate and the `dpm` component): 40,000 CC upon committee acceptance
- Milestone 3 (Independent adoption): up to 100,000 CC, 50,000 CC per qualifying organization, up to two

Half the request, 100,000 CC, is paid only if outside teams use the tool.

The work is one engineer for 12 weeks. At about $0.10 per CC the whole request is roughly $20,000. There are no audit or other third-party costs in it.

### Volatility Stipulation

The amounts are fixed in CC and no repricing is requested. The project ends at week 12.

---

## Adoption and Distribution

**Adopters.** None are confirmed yet. I'm asking in the Daml tooling and security SIGs and contacting teams directly, and teams can confirm on this pull request. If a team wants to see the output first, they can send me a package and I'll run the prototype on it and send the report back.

The tool reaches developers through things they already use: the `dpm` component and a GitHub Action. I'll start with teams whose packages others build on, such as token, settlement and wallet packages. A disclosure change there is inherited by everyone downstream, and the Milestone 1 maps of those packages give a concrete reason to talk to them.

---

## Maintenance and Sustainability

- I will maintain it for 12 months after Milestone 3 at my own cost. That covers support for each new SDK and Daml-LF version within 30 days of its release, and triage of reported issues within five business days.
- A Daml-LF version the tool doesn't know is reported as inconclusive and never passes.
- The rules come from the ledger model, which doesn't change between releases. The part that needs upkeep is the Daml-LF reader.
- Everything is Apache-2.0 and the rules are documented. If someone else turns out to be a better maintainer, handing it over is straightforward, and the repository can move to the Foundation.

---

## Co-Marketing

- A write-up of the Milestone 1 disclosure maps for Splice and Daml Finance.
- A demo of the gate on a real pull request at a SIG session.
- A short guide to adding `disclosure.yaml` to an existing project.

---

## Motivation

Canton's privacy model is why institutions are here, and very little tooling checks it. Upgrades make this more pressing. A new package version takes effect for existing contracts, so a widening in an upgrade discloses data on contracts that already exist. That can't be undone afterwards, which is why the check needs to happen on the package itself, before it is vetted.

---

## Rationale

**A declared policy, not inferred intent.** A privacy tool that guesses will be ignored the first time it's wrong. Writing down who may see a contract is something a team should do anyway, and people who don't read Daml can review the file.

**Static analysis.** It covers every template and choice without anyone writing tests, it runs on someone else's DAR, and it is cheap enough to run on every pull request. Tools that watch test runs, such as #946, are a good complement because they show what actually happened in a run.

**A small first grant.** The source prototype showed the approach works, and it also showed its limit within a day of running against Daml Finance. This grant removes that limit and puts the tool in front of real teams. Divulgence and workflow-level analysis can follow if this one proves useful.
