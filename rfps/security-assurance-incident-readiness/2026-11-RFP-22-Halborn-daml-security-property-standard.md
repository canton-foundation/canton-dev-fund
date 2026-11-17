## Development Fund Proposal

**Organization:** Halborn  
**Author / Primary Contact:** Gabi Urrutia  
**Status:** Submitted  
**Created:** 2026-11-17  
**Proposal Type:** RFP-aligned  
**RFP / Roadmap Area:** RFP-22, Daml Security Standards and Secure Development (Security, Assurance & Incident Readiness)  
**Champion:** Needs Champion  
**Total Funding Request:** 3,500,000 CC  
**Project Duration:** 12 months (6 months of delivery, then adoption milestones at months 8 and 12)  
**Label:** daml-tooling

---

## Abstract

Canton has no shared, machine-checkable definition of what a secure Daml application is. Security rests on point-in-time audits, and each auditor and each tool uses its own vocabulary for what counts as a vulnerability.

We propose an open security property standard for Daml applications and the open tooling to check it before a package is deployed or vetted:

- Six falsifiable security properties, each defined so that a violation is a concrete transaction outcome on a ledger.
- A public conformance corpus of seeded-bug fixtures and clean counterparts.
- Reference oracles: deterministic checkers that grade an executed outcome against a property.
- A conformance runner with a baseline attack generator that needs no language model, and an open adapter so that any other source of candidate attacks can be checked by the same oracles.

Everything funded is released under Apache-2.0 and is usable without any Halborn product. Forty percent of the funding is released only on evidence of independent adoption.

---

## Specification

### 1. Objective

Give Daml developers, auditors, and package vetters one shared definition of six application-layer security properties, and one open tool that checks a Daml package against them on a local ledger before it is deployed.

Out of scope and not funded: Halborn's commercial attack-discovery engine (LIMES), its attack-pattern library, and its managed service.

### 2. Implementation Mechanics

**The six properties.** Each is stated as the violation it rules out.

| ID | Violation |
| :---- | :---- |
| AUTH-1 | Value moves without the authority of every party that must consent. |
| PRIV-1 | Private contract data is retained by a party that should have lost visibility. |
| PRIV-2 | A non-stakeholder witnesses private data in a transaction it is party to. |
| INTEG-1 | A transfer mints value, with outputs exceeding inputs. |
| FEES-1 | A fee is charged off the schedule the contract declares. |
| GOV-1 | A governed parameter changes outside its authorized governance path. |

**Oracles.** An oracle reads the outcome of a transaction that executed on a ledger and grades it against one property using fixed rules. No model takes part in the verdict, so anyone who replays the same commands gets the same result. The oracles read only what the standard Ledger API exposes: executed outcomes and observer sets.

Two properties depend on intent. A governance timelock (GOV-1) and a visibility-retention expectation (PRIV-1) cannot be judged without knowing what the author intended, so their oracles require a short policy declared by the application team. An oracle that guessed the intended policy would report violations that are not real.

**Conformance corpus.** At least five seeded-bug variants and clean counterparts per property, at least 30 fixtures in total. Every seeded fixture must grade as a violation and every clean counterpart as no violation. The corpus is the test set for the oracles and for any other tool that adopts the property definitions.

**Baseline attack generator.** Deterministic, with no language model. Pointed at a compiled Daml package on a Canton LocalNet, it enumerates every choice and applies the standard pattern for each property:

- It exercises each choice as every party that is not a declared controller.
- It compares value in and value out on every choice that moves value.
- It compares the fee charged with the fee schedule the contract declares.
- It compares the witnesses of each transaction with its stakeholders.
- For GOV-1 and PRIV-1 it checks the outcome against the declared policy.

This finds single-step instances of the six violation classes in applications nobody has written a scenario for. It does not find multi-step or novel attack chains.

**Hypothesis adapter.** A documented interface through which any other source of candidate attacks feeds the runner: hand-written scenarios, counterexamples from a static analyzer, or a language model of the user's choice. Every candidate is executed and graded by the same oracles.

**Conformance runner.** One command-line tool that packages the generator, the adapter, and the oracles, and returns a per-property report. It is built to run in a continuous integration pipeline or in an audit engagement.

**Evidence today.** Halborn has a working prototype of the oracles and of one fixture per property. The evidence is narrow and we state it as such.

- For AUTH-1, PRIV-1, PRIV-2, INTEG-1, and GOV-1, a deterministic control builds the attack against a seeded-bug fixture and submits it to the ledger. Each oracle graded its seeded bug as a violation in three of three runs and graded its clean control as no violation.
- FEES-1 is validated in a different form: its control grades a transfer against the declared fee schedule and confirms that the observed fee equals the predicted one. A seeded-bug control in the same form as the other five is part of milestone 2.
- One full cycle on November 7, 2026 enumerated 196 work items across 36 contract surfaces of the real Amulet contracts on a sandboxed ledger and reported no violation. We do not present this as a false-positive rate: the run did not record how many candidate attacks reached the ledger.

Zero false positives is the design goal. The funded work measures the rate and publishes the data behind it (milestones 2 and 4).

### 3. Architectural Alignment

The work operates at the Daml application layer: Amulet, Splice, and the applications deployed on top. It assumes the Canton protocol is correct and does not touch consensus, the synchronizer, or participant internals. It uses the standard Ledger API and a Canton LocalNet, with no privileged access and no protocol change.

It answers RFP-22 directly: a security standard, a testing methodology, automated analysis, common vulnerability patterns, and CI/CD integration, all aimed at finding weaknesses before a package is deployed or vetted. The property definitions are written so that they can later be proposed as a CIP if the Security SIG considers that useful.

### 4. Backward Compatibility

*No backward compatibility impact.*

---

## Milestones and Deliverables

Dates are counted from approval.

### Milestone 1: Property Standard v1
- **Committed Date:** Month 2
- **Focus:** The written standard.
- **Deliverables / Value Metrics:** A specification of the six properties, published as a tagged release. Each property has a definition, a threat model, a falsifiability criterion, and a link to an executable fixture. A 14-day public comment period, with every comment answered in the repository.

### Milestone 2: Corpus, reference oracles, and false-positive evaluation
- **Committed Date:** Month 3
- **Focus:** The test set, the checkers, and the first measured evaluation.
- **Deliverables / Value Metrics:** At least 30 seeded fixtures with clean counterparts. The six oracles as a standalone Apache-2.0 library. An evaluation report over the real Amulet contracts with the number of candidate attacks generated, the number that executed, the number flagged, and the classification of each flag, with raw logs. Public continuous integration.

### Milestone 3: Conformance runner with baseline generator and adapter
- **Committed Date:** Month 5
- **Focus:** The tool a developer or auditor runs.
- **Deliverables / Value Metrics:** The runner as a tagged release with documentation and worked examples. Run with no model and no access to fixture labels, the baseline generator finds at least 12 of the 30 seeded fixtures across at least four of the six properties, and the detection rate per property is published. Two working adapter examples: a hand-written scenario file and a language model reached through a public API.

### Milestone 4: Independent validation on external applications
- **Committed Date:** Month 6
- **Focus:** Results on code Halborn did not write.
- **Deliverables / Value Metrics:** A list of at least five external open-source Daml applications, agreed with the reviewing SIG at kickoff. A published conformance report for each. Every flag triaged in a public issue and classified by the application's maintainers or an independent reviewer. The count of confirmed false positives published.

### Milestone 5: Adoption, first tranche
- **Committed Date:** Month 8
- **Focus:** Independent use.
- **Deliverables / Value Metrics:** At least three entities independent of Halborn run the conformance runner on their own Daml application, in continuous integration or in an audit workflow. Each provides a public attestation or a public repository link that shows the integration.

### Milestone 6: Adoption, second tranche, and governance handover
- **Committed Date:** Month 12
- **Focus:** Wider use and neutral governance.
- **Deliverables / Value Metrics:** At least six independent entities in total meet the milestone 5 test. The repositories sit under a neutral organization agreed with the Foundation. At least one maintainer with merge rights is not a Halborn employee. An external contributor has used the process for proposing a new property or fixture at least once.

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone
- Demonstrated functionality or operational readiness
- Documentation and knowledge transfer provided
- Alignment with stated value metrics

Project-specific conditions:

- Every delivery criterion in milestones 1 to 4 can be checked by a reviewer without Halborn's involvement. From a clean checkout, one documented command on a Canton LocalNet reproduces the published verdict table.
- The repositories build and pass with no dependency on Halborn proprietary code. A dependency manifest shows this.
- Milestones 5 and 6 are accepted only on attestations from entities independent of Halborn. They carry 40 percent of the funding.

---

## Funding

**Total Funding Request:** 3,500,000 CC

### Payment Breakdown by Milestone
- Milestone 1 (Property Standard v1): 350,000 CC upon committee acceptance
- Milestone 2 (Corpus, reference oracles, and false-positive evaluation): 525,000 CC upon committee acceptance
- Milestone 3 (Conformance runner with baseline generator and adapter): 875,000 CC upon committee acceptance
- Milestone 4 (Independent validation on external applications): 350,000 CC upon committee acceptance
- Milestone 5 (Adoption, first tranche): 700,000 CC upon committee acceptance
- Milestone 6 (Adoption, second tranche, and governance handover): 700,000 CC upon final acceptance

### Basis of the request

The work is 140 person-days of senior security engineering: 17 days for milestone 1, 38 for milestone 2, 45 for milestone 3, 15 for milestone 4, 12 for milestone 5, and 13 for milestone 6. About 20 of the 140 days package the existing prototype. The rest is new work: the baseline generator, the adapter, the expanded corpus, the false-positive evaluation, and the external validation.

At the 30-day average price of USD 0.096 per CC as of November 16, 2026, 3,500,000 CC is about USD 336,000, an effective rate of about USD 2,400 per day. This is below Halborn's standard advisory rate. Halborn carries the difference and has already paid for the prototype. No funding is requested for work already completed.

### Volatility Stipulation

The project duration is greater than 6 months. The grant is denominated in fixed Canton Coin and will require a re-evaluation at the 6-month mark.

---

## Co-Marketing

Upon release, Halborn will collaborate with the Foundation on:

- Announcement coordination
- A technical blog post on the property standard and how to run the conformance runner
- A walkthrough session for developers and auditors

---

## Motivation

Every Daml application team and every auditor answers the same question today with private checklists: can value move without consent, can value be minted, can private data reach a party that should not see it. A finding from one audit cannot be replayed by another tool, and a developer has no way to check these properties in a pipeline before deployment.

A shared property standard with executable oracles changes that in three ways. Developers get a check they can run on every change. Auditors and other tools get a common vocabulary and a common test set. Package vetters get a reproducible report instead of a statement of opinion.

Portion of the ecosystem that benefits: AUTH-1 and PRIV-2 apply to every Daml application. INTEG-1 and FEES-1 apply to every application that moves value or charges fees. Four of the six properties need no input from the application team. We therefore expect the baseline run to be usable by essentially every team that builds a Daml application that moves value, and we commit to demonstrated use by at least six independent teams within 12 months.

Halborn will seek letters of intent from application teams, auditors, and validators during the review period and add them to this pull request as they arrive.

Maintenance: Halborn commits to maintain the standard, the corpus, the oracles, and the runner for 24 months from the release of version 1, whether or not its commercial service succeeds. If Halborn stops maintaining them for any reason, the repositories stay under the neutral organization with their Apache-2.0 license and their external maintainers, so any party can continue the work. Maintenance beyond the 24 months will either be carried by Halborn or proposed to the fund as a separate maintenance grant, and that choice will be made in the open before the commitment ends.

---

## Rationale

**Why oracles on executed outcomes.** A property that is checked by executing a transaction and reading the ledger gives a verdict that anyone can reproduce and that cannot report an unreachable path. The cost is that a violation is found only if some candidate attack triggers it. That is why the proposal pairs the oracles with a baseline generator and an open adapter instead of shipping checkers alone.

**Why the generator has no model.** A deterministic generator gives the same result on every run and costs nothing to operate, which is what a pipeline check needs. Teams that want deeper coverage connect a stronger source through the adapter.

**How it fits existing tooling.** The work extends what exists. It uses the Ledger API, Daml packages as compiled today, and a Canton LocalNet, and it complements the other security work in the fund:

- OpenZeppelin Canton Ecosystem Stack (approved) builds a contracts library and reference implementations and audits its own code. It does not define network-wide properties or check third-party applications. Its open library and reference implementations are proposed as conformance targets in milestone 4.
- The Daml package analyzer by CCTools (approved) maps cross-package authority statically. It answers a different question and does not overlap.
- DamlSec (PR 194) is a static analyzer based on symbolic execution over compiled packages. It covers some of the same violation classes. Static analysis explores paths without running them; the oracles here grade only outcomes that executed. Through the adapter, a static counterexample can be replayed and confirmed or rejected on a ledger. We will publish a mapping between the property definitions here and its detection rules.
- DAWE (PR 400) is a convention for writing security scenarios in Daml Script on top of the existing must-fail tests. Those tests show that an unauthorized action is rejected. The oracles here address the other case: a transaction that succeeds and still violates a property. DAWE scenarios are a valid source for the adapter, and the corpus fixtures here can be used as inputs to DAWE suites.

None of these defines the property standard or provides ledger-grounded oracles, and each becomes more useful with a shared definition of what counts as a violation.

**Alternative considered.** Funding only the standard and the corpus, with no generator, would be cheaper. We rejected it because the deliverables would then validate predefined scenarios and nothing else, and a developer with no scenarios would get no result.

---

## Licensing

All software and technical artifacts are released under Apache-2.0.
