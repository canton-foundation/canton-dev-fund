## Development Fund Proposal

**Organization:** Kann Audits
**Author / Primary Contact:** Erkan Alaydinov, Founder and CEO (@0xKann, contact@kannaudits.com)
**Status:** Submitted
**Created:** 2026-11-14
**Proposal Type:** RFP-aligned
**RFP / Roadmap Area:** RFP 22, Security, Assurance & Incident Readiness: Daml Security Standards and Secure Development
**Champion:** `Needs Champion`
**Total Funding Request:** CC equivalent of 45,000 USD
**Project Duration:** 9 months
**Label:** daml-tooling

---

## Abstract

Kann Audits will fine-tune Kann AI, its own security model, to find security weaknesses in Daml code, and give every team building on Canton three months of free access. Each protocol's first scan is reviewed by a Kann Audits researcher. The work also produces an open catalogue and benchmark of Daml weaknesses, and a CI integration in Kann Audits' open-source Model Alpha client, so teams catch issues before their packages are deployed or vetted.

---

## Specification

### 1. Objective

Give Canton application teams automated security analysis of their Daml code during development, measured on a public benchmark, with free access for every team for three months.

### 2. Implementation Mechanics

**Daml weakness catalogue and benchmark (open source).** A public repository of labelled vulnerable and fixed Daml examples, at least 100 cases across at least 10 categories, including:
- authorization: signatories, observers, controllers and choice observers
- consuming and nonconsuming choices, archival and double use of a contract
- contract keys and fetch-by-key assumptions
- disclosure, divulgence and privacy leaks
- interface implementations and upgrade (SCU) compatibility
- Numeric precision and rounding
- ledger time assumptions and `ensure` clauses

The benchmark has a held-out set, so detection and false-positive rates can be checked by anyone.

**Fine-tuned model.** Kann AI today maps Solidity call graphs and flags function-level risks for expert validation. We will fine-tune it on Daml code and the catalogue. The open-source Model Alpha client (MIT) gets a Daml front end: it splits a Daml project into templates and choices, with the parties that can exercise each choice, and sends each unit to the hosted model. Each finding has a location, a severity, an explanation and a suggested fix.

**CI integration.** A command-line step and a GitHub Action run the scan on every pull request and report findings in SARIF, so they appear in GitHub code scanning.

**Free access program.**
- **Who:** any team building a Canton application on MainNet, TestNet or DevNet, verified by its GitHub organization or app listing. One seat per protocol.
- **What:** three months of free scans from activation, under a fair-use limit on scans per month, including the CI integration.
- **Human review:** the first scan of each protocol is triaged by a Kann Audits researcher, who removes false positives and explains the real findings.
- **Data handling:** code is processed only to run the scan. It is never used for training unless the team opts in, and findings are visible only to the team.
- **After three months:** continued access at a discount for program teams.

### 3. Architectural Alignment

RFP 22 asks for automated analysis, common vulnerability patterns, review checklists and CI/CD integration that help developers find security weaknesses before Daml packages are deployed or vetted. This proposal delivers all four. It complements existing approved work: Certora's package analyzer maps cross-package authority, and IntellectEU's Daml code assistant helps write code. This proposal looks for vulnerabilities in the logic teams write.

### 4. Backward Compatibility

*No backward compatibility impact.* The scanner reads Daml source and needs no change to Canton, Daml or existing projects.

---

## Milestones and Deliverables

### Milestone 1: _Open Daml weakness catalogue and benchmark_
- **Committed Date:** Approval + 6 weeks
- **Focus:** Catalogue and benchmark as described above
- **Deliverables / Value Metrics:** Public repository with at least 100 labelled cases across at least 10 categories, shared with the daml-tooling SIG for review

### Milestone 2: _Kann AI for Daml and CI integration_
- **Committed Date:** Approval + 3 months
- **Focus:** Fine-tuned model, Daml front end in Model Alpha, GitHub Action
- **Deliverables / Value Metrics:** Hosted scanner live; detection and false-positive rates per category published on the held-out benchmark

### Milestone 3: _Free access program: first 10 teams_
- **Committed Date:** Approval + 5 months
- **Focus:** Onboarding Canton application teams
- **Deliverables / Value Metrics:** 10 Canton application teams onboarded and scanned, each first scan triaged by a researcher; anonymised summary of the weakness categories found

### Milestone 4: _25 teams and State of Daml Security report_
- **Committed Date:** Approval + 9 months
- **Focus:** Adoption and shared learning
- **Deliverables / Value Metrics:** 25 Canton application teams onboarded in total; public anonymised report on the weaknesses found and fixed; catalogue updated with the new patterns

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Ecosystem adoption: 10 teams by Milestone 3 and 25 teams by Milestone 4 using the scanner on their own Daml code
- Published benchmark results that anyone can reproduce with the open catalogue
- The catalogue and the Daml front end of Model Alpha published under the MIT license
- The public State of Daml Security report, so teams that did not join also learn from the findings

---

## Funding

**Total Funding Request:** CC equivalent of 45,000 USD

### Payment Breakdown by Milestone
- Milestone 1 _(Catalogue and benchmark)_: CC equivalent of 10,000 USD upon committee acceptance
- Milestone 2 _(Kann AI for Daml and CI)_: CC equivalent of 15,000 USD upon committee acceptance
- Milestone 3 _(First 10 teams)_: CC equivalent of 10,000 USD upon committee acceptance
- Milestone 4 _(25 teams and report)_: CC equivalent of 10,000 USD upon final acceptance

### Volatility Stipulation
USD amounts are converted to CC at approval and then fixed in CC. The project runs longer than 6 months, so it will be re-evaluated at the 6-month mark.

---

## Co-Marketing

Upon release, Kann Audits will coordinate with the Foundation on:

- Announcing the free access program to Canton builders
- A technical blog post on the benchmark results
- Promoting the State of Daml Security report

---

## Motivation

Most Canton application teams cannot afford a full audit at every stage of development, and the network expects many more applications by 2028. A scanner they can run on every pull request catches common weaknesses before a package is deployed or vetted, and makes the later manual audit cheaper and more focused. The free period removes the cost barrier for new teams, and the open benchmark lets every tool in the ecosystem measure itself on the same cases.

---

## Rationale

The proposal extends tools that already exist: Kann AI is in production for Solidity, and Model Alpha is an open-source client. Many Daml weaknesses depend on business logic and authorization intent, which fixed rules express poorly; a model trained on labelled cases can flag them, and researcher triage keeps false positives out of the team's way. Publishing the benchmark makes every accuracy claim checkable, rather than relying on our word.

**Sustainability.** After the grant, Kann Audits keeps operating Kann AI for Daml as part of Kann AI, and maintains the open catalogue and the Model Alpha Daml front end, adding patterns from its audits.

---

## About Kann Audits

Kann Audits is a Web3 security audit company. It provides manual expert security audits, AI security scans with Kann AI (its own security model), formal verification, security consultation and incident response. It has audited DLT, L1/L2 and off-chain infrastructure, including a central limit order book (CLOB) trading system and wallet integrations. Track record: $2B+ in TVL secured, 66 audits completed and 390+ vulnerabilities found. Every researcher has 50+ valid bugs and $50,000+ earned from bug bounties and audit contests. In the DODO benchmark, Kann AI detected all five High-severity findings. Public reports: [kannaudits.com/audits](https://kannaudits.com/audits).
