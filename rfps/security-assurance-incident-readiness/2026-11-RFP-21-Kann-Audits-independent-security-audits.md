## Development Fund Proposal

**Organization:** Kann Audits
**Author / Primary Contact:** Erkan Alaydinov, Founder and CEO (@0xKann, contact@kannaudits.com)
**Status:** Submitted
**Created:** 2026-11-14
**Proposal Type:** RFP-aligned
**RFP / Roadmap Area:** RFP 21, Security, Assurance & Incident Readiness: independent security assessments ([Dev Fund PR 410](https://github.com/canton-foundation/canton-dev-fund/pull/410))
**Champion:** `Needs Champion`
**Total Funding Request:** No new allocation. Each audit is paid from the third-party auditor budget already approved in PR 410 (up to 350,000 CC per audit), at the quote Kann Audits submits through the PR 410 RFQ.
**Project Duration:** December 2026 to Q1 2027, following the PR 410 schedule
**Label:** canton-protocol-multi-synchronizer

---

## Abstract

PR 410 funds eleven independent third-party audits of core Canton Network components and selects each auditor through an RFQ. Kann Audits applies to perform the audits that are still open: the Ledger and JSON API, the Daml Engine together with Smart Contract Upgrading, the Validator and Super Validator Kubernetes deployments, and Scan. Each audit is run by two researchers for two weeks, in the slots the core team has set, during European business hours so that the core team in Zurich can work with the researchers the same day. More qualified auditors with free capacity help the Security subcommittee keep the PR 410 schedule and compare quotes.

---

## Specification

### 1. Objective

Deliver independent third-party audits for the open PR 410 milestones, each with a report, a review of the fixes and a public summary, inside the schedule and budget PR 410 already defines.

### 2. Implementation Mechanics

**Engagement workflow.** Each audit follows PR 410's process from step 4 onwards:

1. Kickoff with the core engineers: scope, frozen commit, updated threat model and documentation.
2. Independent review: each researcher reviews the component alone first, so findings are not anchored on one view.
3. Joint sessions on the highest-risk paths, with the core team available for questions.
4. Validation: every finding has an impact statement, a severity, a proof of concept or exact reproduction steps, and a recommended fix.
5. Report to the Tech & Ops Security subcommittee, then one round of fix review against the remediation commit, included in the quote.
6. Public summary through the Canton Foundation only after critical issues are fixed and the network is upgraded, as PR 410 step 7 requires. Detailed findings stay with the subcommittee.

**Focus per component.**

| PR 410 milestone | Issue | Slot set by the core team | Review focus |
|---|---|---|---|
| Ledger and JSON API (LAPI) | [#504](https://github.com/canton-foundation/canton-dev-fund/issues/504) | From 30 Nov 2026, 2 weeks | Authentication and authorization, interactive submission, paged interfaces, self-administration mode, input handling in the JSON variant |
| Daml Engine (DAMLe) | [#505](https://github.com/canton-foundation/canton-dev-fund/issues/505) | From 1 Feb 2027, 2 weeks | Daml-LF interpretation boundaries, authorization checks, package and contract state assumptions |
| Smart Contract Upgrading (SCU) | [#506](https://github.com/canton-foundation/canton-dev-fund/issues/506) | From 15 Feb 2027, 2 weeks, same team as DAMLe | Compile-time and upload-time upgrade checks, Topology Aware Package Selection, protocol and API changes |
| Validator K8 deployment (VALK8) | [#507](https://github.com/canton-foundation/canton-dev-fund/issues/507) | Not yet scheduled | Secrets, network policies, RBAC, container and image supply chain, insecure defaults |
| Super Validator K8 deployment (SVK8) | [#508](https://github.com/canton-foundation/canton-dev-fund/issues/508) | Not yet scheduled | Same as VALK8, plus the controls specific to Super Validator operations |
| Scan | [#509](https://github.com/canton-foundation/canton-dev-fund/issues/509) | Not yet scheduled | Public API attack surface before IP whitelisting is removed: input validation, data exposure, denial of service |

Kann Audits is also available for the Topology Protocol audit ([#503](https://github.com/canton-foundation/canton-dev-fund/issues/503)) and for later PR 410 batches.

**Team.** Two named researchers per audit, confirmed in the RFQ response. Every Kann Audits researcher has 50+ valid bugs and $50,000+ earned from bug bounties and audit contests.

**Relevant experience.** Kann Audits has audited DLT, L1/L2 and off-chain infrastructure, including a central limit order book (CLOB) trading system and wallet integrations. Its 66 completed audits also cover DeFi protocols, cross-chain bridges and messaging, privacy systems (ZK and FHE), and off-chain services such as relayers, keepers and Kafka-based pipelines. The languages it reviews include Daml, Rust, Go, Solidity, Move, Circom and TypeScript. Public reports, with every finding, its severity, its status and the team's response, are at [kannaudits.com/audits](https://kannaudits.com/audits) and [github.com/Kann-Audits](https://github.com/Kann-Audits/Kann-Audits).

### 3. Architectural Alignment

This proposal responds to RFP 21 and supplies auditor capacity for PR 410, which the Tech & Ops Committee approved. It does not change the Canton architecture.

### 4. Backward Compatibility

*No backward compatibility impact.*

---

## Milestones and Deliverables

### Milestone 1: _Ledger and JSON API audit (#504)_
- **Committed Date:** Two weeks from the slot start (earliest 30 Nov 2026), report within one week after
- **Focus:** LAPI and JSON API, with emphasis on the functionality added since the 2025 review
- **Deliverables / Value Metrics:** Audit report to the Security subcommittee; fix review; public summary after remediation

### Milestone 2: _Daml Engine and Smart Contract Upgrading audits (#505, #506)_
- **Committed Date:** February to March 2027, following the two slots
- **Focus:** DAMLe and SCU by one team, as the core team requested
- **Deliverables / Value Metrics:** Two audit reports; fix review; public summaries after remediation

### Milestone 3: _Validator and Super Validator deployment audits (#507, #508)_
- **Committed Date:** Q1 2027, at the slot the core team sets
- **Focus:** Standard Kubernetes deployments used by Validator and Super Validator operators
- **Deliverables / Value Metrics:** Audit reports; hardening recommendations that operators can apply; fix review; public summaries

### Milestone 4: _Scan audit (#509)_
- **Committed Date:** Q1 2027, at the slot the core team sets
- **Focus:** Scan API and backend before IP whitelisting is removed
- **Deliverables / Value Metrics:** Audit report; fix review; public summary

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- The audit report delivered to the Security subcommittee for each audit performed
- Fix review completed for all high-severity findings, so the core team can meet PR 410's acceptance criteria
- A public summary published through the Canton Foundation once critical issues are remediated and the network is upgraded
- Network value: public endpoints and standard deployments that Validator operators run hardened against the issues found

---

## Funding

**Total Funding Request:** No new allocation.

### Payment Breakdown by Milestone
- Each audit is paid from PR 410's third-party auditor budget (up to 350,000 CC per audit), at the quote Kann Audits submits through the PR 410 RFQ and the Security subcommittee approves. Payment upon acceptance of that audit.

### Volatility Stipulation
Quotes are fixed in CC at selection. Should an audit slot move beyond six months from selection at the committee's request, the quote may be renegotiated to account for USD/CC price volatility.

---

## Co-Marketing

Upon each public summary, Kann Audits will coordinate the announcement with the Foundation and can publish a technical write-up of the review approach, without disclosing details the Security subcommittee keeps confidential.

---

## Motivation

PR 410 needs eleven independent audits within about six months, each by two auditors for two weeks. Every Validator operator, application and institution on the network depends on these components, and the public summaries are what institutions ask for before deeper engagement. A larger pool of qualified auditors with free capacity reduces schedule risk and lets the Security subcommittee compare quotes.

---

## Rationale

The two-researcher, two-week format matches Kann Audits' standard engagement: independent review first, joint review of the riskiest paths second, and a proof for every finding. Working European business hours lets the researchers work with the Zurich core team during its day, one of PR 410's selection criteria. Applying through RFP 21 makes our capability and track record visible to the community, while pricing goes privately to the Security subcommittee through the RFQ, as PR 410 defines.

---

## About Kann Audits

Kann Audits is a Web3 security audit company. It provides manual expert security audits, AI security scans with Kann AI (its own security model), formal verification, security consultation and incident response. Track record: $2B+ in TVL secured, 66 audits completed, 57K+ nSLOC audited and 390+ vulnerabilities found, including private engagements. Kann Audits is a Certified Member of the Circle Alliance Program. Website: [kannaudits.com](https://kannaudits.com).
