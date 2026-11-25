# CIP-0104 Amendment Implementation: Traffic-Based App Rewards

| Field | Value |
| :---- | :---- |
| Organization | Digital Asset and Obsidian Systems |
| Author / Primary Contact | Wayne Collier, Digital Asset, wayne.collier@digitalasset.com. Frank Gruber, Obsidian Systems, frank.gruber@obsidian.systems |
| Status | Draft |
| Created | 2026-10-05 |
| Proposal Type | RFP-aligned (implements the proposed [CIP-0104 Amendment](https://lists.sync.global/g/cip-discuss/topic/amend_cip_0104_to_align_with/121897265)) |
| RFP / Roadmap Area | 8, Canton Coin Tokenomics. CIP co-requirement met by the [CIP-0104 amendment](https://lists.sync.global/g/cip-discuss/topic/amend_cip_0104_to_align_with/121897265), which is pending SV acceptance |
| Champion | Wayne Collier (Digital Asset) |
| Total Funding Request | 5,850,000 CC |
| Project Duration | Approximately six months from SV acceptance of the TBAR v1.1 |
| Label | tokenomics |

## Abstract

CIP-0104 is the SV-approved standard for traffic-based app rewards (TBAR). Digital Asset and Obsidian built it in Splice and Canton under an earlier Dev Fund grant, [Traffic-Based App Rewards on the Global Synchronizer](https://github.com/canton-foundation/canton-dev-fund/blob/main/proposals/2026-02-DA-Traffic-Based-App-Rewards.md) (the original TBAR grant).

The activity record and reward computation from the original CIP-0104 proposal was fully implemented in Splice, but never enabled on MainNet due to concerns from the Tokenomics committee that it would create the wrong incentives. The Tokenomics committee has since [published and approved](https://lists.sync.global/g/tokenomics-announce/message/397) the [Featured App Guidance 2.0](https://docs.google.com/document/d/1pLDUen2wpEcfS2pdPtF8u8DNWVHtgb6GIDpgAeiuWGE/edit?tab=t.0#heading=h.22k6ymijl3pg), which fixes the incentives. The [CIP-0104 Amendment](https://lists.sync.global/g/cip-discuss/topic/amend_cip_0104_to_align_with/121897265) aligns the CIP-0104 with this new guidance. This proposal funds the implementation of that amendment in Splice, its deployment to MainNet, and Obsidian's ongoing maintenance of the code it delivers.

## Specification

### 1. Objective

Deliver the CIP-0104 Amendment (called **TBAR v1.1** in the remainder of the document) in Splice and enable it on MainNet.

### 2. Implementation Mechanics

Obsidian and Digital Asset implement all changes in the Specification section of TBAR v1.1 in Splice, including its new configuration parameters with their specified defaults, and ship them to MainNet. Each change ships with tests and documentation.

### 3. Architectural Alignment

TBAR v1.1 amends the existing CIP-0104 computation rather than adding a separate mechanism. The changes are in the Daml and the Scan app, plus SV vote support for the new parameters. The SV app’s reward processing, already tested on DevNet and in dry-run mode on MainNet, stays largely unchanged.

### 4. Backward Compatibility

Existing featured app rights take the defaults that TBAR v1.1 specifies. These are general featured apps, no operations parties and an app composition weight of 1.0. The Daml changes extend featured app rights and the Amulet configuration and ship as Smart Contract Upgrades.

## Milestones and Deliverables

Please see [TBAR v1.1 for the specification](https://github.com/meiersi-da/cips/blob/meiersi/cip104-amendment/cip-0104/cip-0104.md).

This proposal has one milestone, paid in two parts. The milestone is complete when all code for TBAR v1.1 is complete and integrated by the stated date on Splice `main`. The first payment is made when that code is included in a Splice release. The final payment follows enablement on MainNet, meaning TBAR v1.1 is active for MainNet reward rounds.

The milestone is conditional on SV acceptance of TBAR v1.1. If TBAR v1.1 changes substantially before acceptance, Digital Asset and Obsidian submit a grant amendment.

| Milestone | Deadline (relative to both TBAR v1.1 acceptance and grant approval) |
| :---- | :---- |
| 1. TBAR v1.1 | +5 months |

## Acceptance Criteria

The Tech and Ops Committee evaluates the milestone on the following. All code for TBAR v1.1 is complete, integrated and included in a Splice release. Documentation is published on [https://docs.canton.network/](https://docs.canton.network/). For the final payment, TBAR v1.1 must be active for MainNet reward rounds.

## Funding

| Payment | Amount (CC) | Paid upon |
| :---- | :---- | :---- |
| Milestone 1, first payment | 1,600,000: Digital Asset. 2,000,000: Obsidian Systems | Code included in a Splice release |
| Milestone 1, final payment | 750,000: Digital Asset. 750,000: Obsidian Systems | Enablement on MainNet |
| Maintenance tranche | 750,000: Obsidian Systems | 187,500 CC per quarterly report from MainNet enablement |
| Total (year one) | 5,850,000. Digital Asset 2,350,000. Obsidian Systems 3,500,000 |  |

The maintenance tranche is paid to Obsidian Systems alone.

Payment modalities: Minting rights are to be emitted directly to Digital Asset and Obsidian Systems separately so that each grant recipient can self-mint the CC as specified above.

Volatility stipulation: As this project is expected to complete within six months, the grant is denominated in fixed Canton Coin.

## Maintenance

Obsidian maintains the code it delivers under this grant on an ongoing basis, including fixing defects and test flakes, and reserves engineering capacity for that work. The tranche pays 750,000 CC yearly, reassessed quarterly against the CC price. It renews annually until an Obsidian Splice maintenance grant replaces it.

## Co-Marketing

Upon release, Obsidian coordinates announcements with the Foundation.

## Motivation

Roadmap Area 8 asks for "incentives for featured application providers that reduce the overhead of featured application governance and limit malicious or counterproductive behavior by application providers." TBAR v1.1 brings app rewards in line with the Tokenomics committee's [Featured App Guidance v2.0b](https://docs.google.com/document/d/1pLDUen2wpEcfS2pdPtF8u8DNWVHtgb6GIDpgAeiuWGE/edit?tab=t.0#heading=h.22k6ymijl3pg), so that rewards follow the apps and assets that create network activity and SVs fine-tune the incentives by vote. See the Motivation and Rationale sections of TBAR v1.1.

## Rationale

See the Rationale section of TBAR v1.1, including Alternatives Considered.

## Constraints, Limitations and Out of Scope

- The Splice release schedule, posted at [https://sv-cal.canton.foundation/](https://sv-cal.canton.foundation/), governs when the code reaches DevNet, TestNet and MainNet.
- MainNet enablement timing depends on SV votes outside the control of Digital Asset and Obsidian.
