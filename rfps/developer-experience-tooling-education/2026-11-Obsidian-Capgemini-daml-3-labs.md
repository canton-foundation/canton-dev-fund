# Daml 3 Labs for Capital-Markets Integrators

## Development Fund Proposal

**Organization:** Obsidian Systems and Capgemini  
**Author / Primary Contact:** Frank Gruber, Obsidian Systems. frank.gruber@obsidian.systems.  
**Status:** Submitted  
**Created:** 2026-11-24  
**Proposal Type:** RFP-aligned  
**RFP / Roadmap Area:** [15. Canton 3.x Training and Documentation](https://github.com/canton-foundation/canton-dev-fund/blob/main/2026-2028-strategic-roadmap.md)  
**Champion:** Needs Champion  
**Total Funding Request:** 4,460,000 CC  
**Project Duration:** 24 weeks  
**Label:** daml-tooling

---

## Abstract

Obsidian Systems and Capgemini propose four open-source Daml 3 labs for engineers who connect banks and asset managers to Canton. The labs are a reference setup, a deposit token, a bond and a fund settlement. Each lab is a working multi-party application with exercises, tests and a guide. Obsidian writes the Daml and the guides. Capgemini engineers co-author the integration exercises and form the first cohort. The grant funds both organizations. Part of the grant pays as integrators at five outside organizations complete a lab.

## Specification

### 1. Objective

The labs cut the time an institutional integrator needs to deliver a first capital-markets workflow on Canton 3. The Daml 3 Training Modernization Program ([PR #32](https://github.com/canton-foundation/canton-dev-fund/pull/32)) has no module on deposit tokens, bonds or fund settlement. [Daml Finance](https://github.com/digital-asset/daml-finance) modeled bonds and equities in Daml 2. Its README says it "is not actively maintained."

### 2. Implementation Mechanics

Each lab is a public repository under the Apache-2.0 license. It holds Daml templates, Daml Script tests, graded exercises with solutions, a guide and a CI pipeline that runs `dpm test` on each stable Daml 3.x SDK and Splice release. For the reference setup it runs the setup scripts on LocalNet. Every lab runs on the Splice LocalNet at the current release.

- **Reference setup.** A guide and deployment checklist take a team from a LocalNet node to a custody wallet and first transfer. The custody step uses external signing through the Wallet SDK. The checklist lists the added steps for DevNet and TestNet.
- **Deposit token lab.** Two banks issue a deposit token and transfer it between their customers. The token implements the Canton Network Token Standard holding and transfer interfaces. An integration exercise connects a stub bank ledger to Canton through the JSON Ledger API.
- **Bond lab.** An issuer creates a fixed-coupon bond, pays coupons in the deposit token and redeems it at maturity. An upgrade exercise ships version 2 of the bond package under Smart Contract Upgrades.
- **Fund settlement lab.** An investor subscribes to and redeems fund units against the deposit token. Delivery versus payment settles both legs atomically through Token Standard allocations.

**Roles.** Obsidian writes and reviews all Daml, tests and guides. A Capgemini lead engineer co-authors each integration exercise. Capgemini engineers run each lab and log gaps. Obsidian fixes each gap before it submits the milestone. Capgemini engineers produce the cohort test evidence for Milestones 1 to 4.

### 3. Architectural Alignment

RFP #15 asks for "sample applications" and "exercises" for "institutional integrators." The deposit token and fund labs implement Token Standard V2 ([CIP-0112](https://github.com/canton-foundation/cips/blob/main/cip-0112/cip-0112.md)). [cn-quickstart](https://github.com/digital-asset/cn-quickstart) vendors an older pinned copy of this LocalNet. QuickStart Uplift ([PR #926](https://github.com/canton-foundation/canton-dev-fund/pull/926)) will update it. The labs do not depend on #926.

### 4. Backward Compatibility

No backward compatibility impact. The labs are new repositories. Every lab package follows Smart Contract Upgrade rules. The bond lab's upgrade exercise tests that version 1 contracts keep working under version 2.

---

## Milestones and Deliverables

Weeks count from grant approval.

### Milestone 1: Reference Setup

- **Estimated Delivery:** Week 4
- **Focus:** Joint design of the integration exercises in weeks 1 and 2. Node to custody wallet to first transfer
- **Deliverables / Value Metrics:** Capgemini engineers who did not write the guide stand up the setup from it alone on a cloud host that Obsidian provides. The guide, checklist and scripts are operational and open for outside use.

### Milestone 2: Deposit Token Lab

- **Estimated Delivery:** Week 6
- **Focus:** Issuance and interbank transfer, with the bank integration exercise
- **Deliverables / Value Metrics:** Capgemini engineers who did not write the lab complete every exercise from the guide alone. The lab is operational and open for outside use.

### Milestone 3: Bond Lab

- **Estimated Delivery:** Week 9
- **Focus:** Coupons, redemption and a package upgrade
- **Deliverables / Value Metrics:** As Milestone 2

### Milestone 4: Fund Settlement Lab

- **Estimated Delivery:** Week 12
- **Focus:** Subscription and redemption with delivery versus payment
- **Deliverables / Value Metrics:** As Milestone 2

### Milestone 5: Adoption and Upkeep

- **Estimated Delivery:** Week 24
- **Focus:** Outside organizations complete the labs. Obsidian keeps them current at about 12 hours a week.
- **Deliverables / Value Metrics:** Five outside organizations qualify. All four labs stay operational on each stable Daml 3.x and Splice release published in weeks 13 to 24. Obsidian answers each issue on the lab repositories within five business days.

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone
- Demonstrated functionality or operational readiness
- Documentation and knowledge transfer provided
- Alignment with stated value metrics

**Cohort test.** For Milestones 1 to 4, engineers who did not write the lab complete it from its guide alone. Obsidian links the cohort's run log and the closed gap issues in the milestone issue. The test shows an integrator can deliver the workflow without the authors.

**Qualifying organization.** An organization qualifies when two of its engineers complete the deposit token, bond or fund lab with every test passing. Obsidian, Capgemini and any cohort substitute do not count. The Committee verifies it from a public repository, an issue on a lab repository or written confirmation to the Committee. Each carries the passing test output and the two engineers' names. The window runs from Milestone 2 acceptance to week 24.

**Must-haves, in order.** Tests pass on the current stable release. Engineers who did not write a lab complete it from its guide. Five outside organizations qualify.

**Funnel.** The week 24 report counts organizations that forked or opened an issue on each lab, and those that qualified.

---

## Funding

**Total Funding Request:** 4,460,000 CC

### Payment Breakdown by Milestone

- Milestone 1 (Reference Setup): 885,000 CC upon committee acceptance
- Milestone 2 (Deposit Token Lab): 765,000 CC upon committee acceptance
- Milestone 3 (Bond Lab): 1,000,000 CC upon committee acceptance
- Milestone 4 (Fund Settlement Lab): 1,000,000 CC upon committee acceptance
- Milestone 5 (Adoption and Upkeep): 310,000 CC upon committee acceptance of upkeep. 100,000 CC for each qualifying organization, up to 500,000 CC.

If fewer than five organizations qualify by week 24, Obsidian receives 100,000 CC for each that did. The rest is not paid. The Foundation pays each milestone to Obsidian Systems.

### Volatility Stipulation

Should the project timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility. Capgemini contracts in USD under its corporate policy. If the CC price falls more than 25% below its price on the submission date, Obsidian and Capgemini ask the Committee to reprice the remaining milestones.

---

## Co-Marketing

Upon release, the implementing entity will collaborate with the Foundation on:

- Announcement coordination
- Case study or technical blog
- Developer or ecosystem promotion

Obsidian and Capgemini announce the grant jointly. Capgemini runs two public workshops on the labs in weeks 13 to 24.

---

## Motivation

The 2026-2028 roadmap lists cash, fixed income and equities as the asset classes moving to Canton. The labs cover cash and fixed income. Integrators at banks and consultancies build those workflows. QuickStart Uplift (#926) reports that builders in the Q2 DevRel survey asked for "end-to-end sample projects." The labs give integrators that sample for deposits, bonds and fund settlement. Obsidian expects integrators at five or more outside organizations to complete a lab by week 24. Capgemini plans to use the labs with its client teams.

---

## Rationale

The labs extend existing material. They start where PR #32's Application Developer path ends, run on the Splice LocalNet and implement the Token Standard.

| **Alternative** | **Strength** | **Why not** |
| :---- | :---- | :---- |
| Extend QuickStart (#926) | One starter app for everyone | QuickStart is a general application. Capital-markets flows would widen its scope. |
| Port Daml Finance | Mature instrument models | Built for Daml 2 and not maintained |
| [OpenZeppelin Canton Token Template](https://github.com/OpenZeppelin/canton-token-template) | Ready token registry | Licensed AGPL-3.0. Its copyleft obligations would follow lab code into client pilots. |
| More PR #32 modules | Fits the LMS | Labs run a full multi-party workflow for one asset. |
| Canton Asset Servicing ([PR #944](https://github.com/canton-foundation/canton-dev-fund/pull/944)) | Corporate actions standards under RFP 12 | It proposes servicing standards. The bond lab teaches the flow and links it if funded. |

---

## Constraints, Limitations and Out of Scope

- **Scale ceiling.** Each lab models up to five parties on one synchronizer. A lab that needs a second synchronizer, a sixth party or a fifth workflow becomes a new proposal.
- **Re-scope trigger.** A release that breaks the tests of two or more labs in one cycle triggers a re-scope with the Committee.
- **Cohort.** If the Capgemini cohort cannot run a lab within four weeks of receiving it, another organization's engineers run the cohort test.
- **Out of scope.** Video, LMS hosting, grading, sandboxes, security audits and production hardening. The labs are training code.

---

## Maintenance

Obsidian maintains the labs through week 24 under Milestone 5. After week 24, Obsidian proposes adding the four labs to the renewal of LMS Maintenance - Renewable Annual Stewardship ([PR #459](https://github.com/canton-foundation/canton-dev-fund/pull/459)). If that renewal does not fund them, Obsidian tags the last tested release in each guide. Obsidian transfers the repositories to the Foundation on request. Anyone can contribute by pull request. A new lab follows the same repository layout, tests and CI.
