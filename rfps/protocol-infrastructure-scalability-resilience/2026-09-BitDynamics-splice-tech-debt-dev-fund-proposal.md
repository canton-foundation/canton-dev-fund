# Splice - Targeted High Value Tech Debt Removal

## Development Fund Proposal

**Organization:** Bit Dynamics  
**Author / Primary Contact:** BitDynamics  
**Status:** Submitted  
**Created:** 2026-09-16  
**Proposal Type:** RFP-aligned  
**RFP / Roadmap Area:** [RFP 06 — Continuous Resilience & Scaling Improvements on the Global Synchronizer](../../2026-2028-strategic-roadmap.md)  
**Champion:** Wayne  
**Total Funding Request:** 1,200,000 CC  
**Project Duration:** 6 months  
**Label:** `node-deployment-operations` (proposed)  
**Category:** Protocol, Infrastructure, Scalability & Resilience

---

## Abstract

BitDynamics requests 1,200,000 CC for targeted improvements to Splice, with the scope developed in collaboration with the Splice maintainers.

Delivery is organized into two milestones, with contributions submitted upstream to canton-network/splice.

---

## Specification

### 1. Objective

The work covers:

* Delayed Development Fund coupon payouts;
* CC burns and burns of unused CC minting allowances through SV governance;
* traffic-cost measurement and calibration;
* traffic purchase through token standard APIs;
* scalable Super Validator onboarding;
* removal of migration-ID requirements from Scan APIs and internal APIs, including documentation;
* running SVs without BFT sequencer connections.

### 2. Implementation Mechanics

#### Implementation Approach

Depending on the issue, the work may involve Daml, Scala services and automation, Token Standard integration, Scan APIs, frontend changes, and integration tests.

Larger changes will be split into smaller PRs where that makes review easier.

#### Scope

##### 1. Delayed Development Fund Coupon Payout

**Issue:** [#6722 — Delayed collection of DevFund coupons](https://github.com/canton-network/splice/issues/6722)

Development Fund coupons should not become immediately mintable after allocation. A configurable delay gives SVs time to react if a coupon is unexpected or incorrect.

##### 2. Support CC and CC Minting Allowance Burns

###### CC Burns

**Issue:** [#6990 — Allow CC holders to burn CC using a TSv1 or TSv2 transfer](https://github.com/canton-network/splice/issues/6990)

Provides a direct burn workflow and avoids workarounds that can unintentionally generate new rewards.

###### CC Minting Allowance Burns

**Issue:** [#7254 — Support burn from unclaimed activity record pool via SV vote](https://github.com/canton-network/splice/issues/7254)

Add an SV governance path for removing unused minting allowances when the CC is no longer intended to be minted.

##### 3. Automatic Traffic Calibration

Canton protocol changes can alter serialized transaction size and therefore change traffic consumption even when the underlying operation has not changed.

###### DvP Settlement Traffic Measurement

**Issue:** [#6991 — Make DvP settlement test fail on traffic cost changes](https://github.com/canton-network/splice/issues/6991)

The DvP tests now track expected traffic consumption and detect material drift.

###### Preapproved CC Transfer Traffic Measurement

**Issue:** [#6993 — Measure and monitor traffic cost of preapproved CC transfer](https://github.com/canton-network/splice/issues/6993)

Adds traffic-cost measurement for a TSv2 preapproved CC transfer across participants.

##### 4. Scalable SV Onboarding

**Issue:** [#2872 — Make SV onboarding work with large ACS and topology sizes](https://github.com/canton-network/splice/issues/2872)

Improve SV onboarding so it continues to work reliably as the Global Synchronizer and its state grow. Current onboarding endpoints return full ACS and sequencer topology snapshots, which become expensive at scale and fail under timeouts and non-incremental retries.

The exact implementation will follow maintainer guidance on this issue and may touch onboarding, state transfer, or the interaction between Splice and Canton.

##### 5. Traffic Purchase Through Token Standard APIs

**Issue:** [#7255 — Support traffic purchase through token standard v1 compat mode](https://github.com/canton-network/splice/issues/7255)

Enable traffic purchase via Token Standard transfer APIs (v1 compatibility mode), so wallets and apps can buy member traffic through the same transfer path used for CC, rather than only through the dedicated BuyMemberTraffic flow.

##### 6. Migration-ID Removal from Scan APIs and Internal APIs

**Implementation issue:** [#598 — Make migration id optional in scan update and ACS APIs](https://github.com/canton-network/splice/issues/598)

**Documentation issue:** [#5930 — cleanup the migration id from the docs](https://github.com/canton-network/splice/issues/5930)

Make migration ID optional (or unnecessary) for Scan update and ACS APIs, and clean related documentation. Follow-on work for remaining internal APIs will be confirmed with Splice maintainers as needed.

##### 7. Run SVs Without BFT Sequencer Connections

**Issue:** [#6336 — Run SVs without BFT sequencer connections by default](https://github.com/canton-network/splice/issues/6336)

Align SV defaults with production practice by running without BFT sequencer connections (and likely removing support for enabling them), so local and test setups match the incentive model used on the Global Synchronizer.

### 3. Architectural Alignment

Changes will be made directly against canton-network/splice and follow the existing Splice architecture and contribution process.


### 4. Backward Compatibility

Changes will preserve existing integrations and workflows where possible. The scope includes intentional behavior changes to coupon mintability, burn and traffic-purchase workflows, migration-ID handling and SV sequencer-connection defaults. Any compatibility impact or required operator action will be reviewed with the Splice maintainers and documented alongside the relevant change.

---

## Milestones and Deliverables

The proposed delivery windows include allowance for implementation, upstream review and MainNet release coordination. They are confirmed with the Splice maintainers before submission.

### Milestone 1 — Tokenomics Safety & Traffic Calibration

**Estimated Delivery:** 2 months after grant approval  
**Focus:** Tokenomics Safety & Traffic Calibration  
**Funding:** 600,000 CC

#### Deliverables / Value Metrics

**Scope**

* Delayed Development Fund coupon payout — [#6722](https://github.com/canton-network/splice/issues/6722)
* Support CC and CC minting allowance burns — [#6990](https://github.com/canton-network/splice/issues/6990) and [#7254](https://github.com/canton-network/splice/issues/7254)
* Automatic traffic calibration — [#6991](https://github.com/canton-network/splice/issues/6991) and [#6993](https://github.com/canton-network/splice/issues/6993)
* Traffic purchase through token standard APIs — [#7255](https://github.com/canton-network/splice/issues/7255)
* Run SVs without BFT sequencer connections — [#6336](https://github.com/canton-network/splice/issues/6336)

### Milestone 2 — Scalability & API Improvements

**Estimated Delivery:** 4 months after Milestone 1 completion (target: 6 months after grant approval)  
**Focus:** Scalability & API Improvements  
**Funding:** 600,000 CC

#### Deliverables / Value Metrics

**Scope**

* Scalable SV onboarding — [#2872](https://github.com/canton-network/splice/issues/2872)
* Migration-ID removal from Scan APIs and internal APIs, including adjusting documentation — [#598](https://github.com/canton-network/splice/issues/598); documentation [#5930](https://github.com/canton-network/splice/issues/5930)

**Deliverables:** Implementation, tests and documentation for the agreed issues.

---

## Acceptance Criteria

Each milestone is complete when its in-scope pull requests are reviewed and accepted by the Splice maintainers.

### Scope Changes

Any pause for a material scope change must be mutually agreed and recorded by BitDynamics and the Splice maintainers, with Tech & Ops Committee agreement on changes to grant commitments. The agreement will identify the affected work and when the timeline pauses and resumes. Ordinary review iterations and corrections needed to meet the agreed scope remain included. New requirements or architectural rework beyond that scope will be agreed separately before the affected work resumes.

---

## Funding

**Total Funding Request:** 1,200,000 CC

### Payment Breakdown by Milestone

| Milestone | Proposed delivery after grant approval | Funding |
| ----- | ----- | ----- |
| Milestone 1 — Tokenomics Safety & Traffic Calibration | 2 months | 600,000 CC |
| Milestone 2 — Scalability & API Improvements | 6 months (4 months after Milestone 1 completion) | 600,000 CC |
| Total | 6 months | 1,200,000 CC |

Each milestone payment is due upon Voting Committee acceptance of the corresponding milestone against the acceptance criteria above.

### Retroactive Funding

The request includes retroactive funding for contributions BitDynamics has already delivered and that have been merged upstream: Development Fund coupon controls (#6722, PRs #6793 and #6944); DvP traffic-cost monitoring (#6991, PR #7268); and preapproved CC transfer traffic-cost monitoring (#6993, PR #7286).

These contributions are included within Milestone 1’s 600,000 CC allocation. The total request covers both this completed work and the remaining agreed scope.

The grant is denominated in CC. The funding covers implementation, testing, review iterations, documentation and coordination for the agreed scope, including the delivered contributions identified above.

### Volatility Stipulation

The grant is denominated in fixed Canton Coin. Should Committee-requested scope changes extend the project beyond 6 months after grant approval, any remaining milestone funding must be renegotiated to account for significant USD/CC price volatility.

---

## Co-Marketing

BitDynamics will coordinate release communications with the Splice maintainers where useful, using the accepted upstream pull requests, accompanying documentation and Splice release notes to explain the delivered improvements.

---

## Motivation

The work improves shared Splice functionality used by SV operators, validators, wallets and applications. Coupon controls and burn workflows address tokenomics safety, traffic-cost measurement helps detect consumption changes, and Token Standard traffic purchases give wallets and applications a familiar integration path.

Scalable SV onboarding and simpler Scan APIs address operational and integration friction as the Global Synchronizer grows. Delivering these changes upstream makes the improvements available through Splice's existing release and maintenance processes rather than through separate tooling.

---

## Rationale

### Delivery

BitDynamics will submit contributions through the normal Splice pull-request process, including the tests and documentation required for each issue.

Before publication, BitDynamics will confirm the complete issue list and its technical implications with the Splice maintainers. The confirmed issues will define the delivery scope and acceptance expectations.

Material additions or changes to the agreed scope will be discussed with the maintainers and agreed separately.

---

## Team

BitDynamics will own implementation and delivery.


## Maintenance

Contributions will become part of Splice’s normal release, CI, upgrade and maintenance processes. BitDynamics intends to remain an active upstream contributor and will collaborate with the maintainers to address defects or omissions identified in its delivered changes, including after merge.
