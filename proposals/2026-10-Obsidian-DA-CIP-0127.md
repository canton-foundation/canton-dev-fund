# CIP-0127: Implement on-chain enforcement of SV and FA locking

| Field | Value |
| :---- | :---- |
| Organization | Digital Asset and Obsidian Systems |
| Author / Primary Contact | Wayne Collier, Digital Asset, wayne.collier@digitalasset.com. Frank Gruber, Obsidian Systems, frank.gruber@obsidian.systems |
| Status | Draft |
| Created | 2026-09-15 |
| Proposal Type | RFP-aligned (implements SV-approved [CIP-0105](https://github.com/canton-foundation/cips/blob/main/cip-0105/cip-0105.md) and [CIP-0116](https://github.com/canton-foundation/cips/blob/main/cip-0116/cip-0116.md) as described in [CIP-0127 - On-Chain Enforcement of FA and SV Locking (Implementation of CIP-0116 and CIP-0105)](https://github.com/canton-foundation/cips/blob/main/cip-0127/cip-0127.md)) |
| RFP / Roadmap Area | 8, Canton Coin Tokenomics. CIP co-requirement met by CIP-0105 and CIP-0116. |
| Champion | Wayne Collier (Digital Asset), @waynecollier-da |
| Total Funding Request | 9,500,000 CC |
| Label | Tokenomics |

## Abstract

CIP-0105 and CIP-0116 are SV-approved standards for on-chain enforcement of Super Validator and Featured Application locking. Their design specification is given in [CIP-0127](https://github.com/canton-foundation/cips/blob/main/cip-0127/cip-0127.md). This proposal funds (a) the implementation of CIP-0105 and CIP-0116 in Splice and deployment to MainNet in an incremental fashion as defined in CIP-0127 and (b) Obsidian’s ongoing maintenance for the code delivered to implement CIP-0127.

## Specification

### 1. Objective

Deliver on-chain enforcement of FA and SV locking in Splice per CIP-0127 so that lock creation, maintenance and termination as well as FA and SV underlock enforcement are managed on-chain for every SV and FA, with a defined migration path for existing positions.

### 2. Implementation Mechanics

Obsidian and Digital Asset implement all increments defined in CIP-0127 in Splice and ship them to MainNet. The delivery of the increments is organized into the following four milestones:

1. **Compatibility Mode** (Increments 1 and 2)
   1. Implement all operations of the compatibility mode for managing SV and FA locks using the TSv1 APIs. Locks must always lock an SV determined minimal amount of CC.
   2. Implement support for provisional FA locks; and add SV automation to convert provisional into full FA locks once the corresponding featured app right is created.
2. **FA Staking Enablement** (Increments 3 to 4)
   1. Support SV and FA locks with custom controllers; and add an API for wallets and staking apps to support all operations on such locks.
   2. Automatic enforcement of FA underlocking after the seven-day grace period.
3. **Automate SV Locking** (Increment 5)
   1. Support for minting SV rewards directly into locks.
   2. SV lock top-up automation.
4. **SV Underlock Enforcement** (Increment 6)
   1. **Depends on:** implementation of IEU’s [proposed CIP for on-ledger SV weights](https://github.com/canton-foundation/cips/pull/273) in Splice `main`
   2. Automatic on-chain enforcement of SV underlocking.

Each increment ships with tests, documentation and a migration note.

### 3. Architectural Alignment

The architecture is documented in CIP-0127, which was designed jointly with the long-term architects of Splice and a Rewards Locking working group coordinated by the Canton Foundation, representing interested Super Validators and application providers. See the Rationale and Technical Specification section in CIP-0127 for details.

### 4. Backward Compatibility

This work only adds new functionality, so it is backwards compatible with the other code in Splice by default. Furthermore, the work adds a compatibility mode for managing locks, so that funds owners can use their existing TSv1 wallets to manage their own locks.

## Milestones and Deliverables

Please see [CIP-0127](https://github.com/canton-foundation/cips/blob/main/cip-0127/cip-0127.md) for the detailed definitions of the increments and their specification.

Each milestone is complete when its code is complete and merged into `main` or an equivalent release branch by the stated date, and is paid when that code is included in a Splice release.

The milestone deadlines are relative to SV acceptance of the proposed CIP-0127 and this grant proposal. If acceptance is delayed or the proposal changes substantially, Digital Asset and Obsidian submit an amendment.

| Milestone | Deadline (relative to both CIP-0127 acceptance and grant approval) |
| :---- | :---- |
| 1. Compatibility Mode | +2 months |
| 2. FA Staking Enablement | +6 months |
| 3. Automate SV Locking | +8 months |
| 4. SV Underlock Enforcement | the larger of: +10 months after CIP-0127 acceptance and grant approval; +4 months after [the implementation of on-ledger SV weights](https://github.com/canton-foundation/canton-dev-fund/blob/main/rfps/governance-identity-network-coordination/2026-07-IEU-sv-weights-ledger.md) is merged to Splice `main` |

## Acceptance Criteria

The Tech and Ops Committee evaluates each milestone based on the following. All code for the milestone’s increments is complete, integrated and included in a Splice release. Documentation and migration notes are published for each increment.

## Funding

| Milestone | Amount (CC) | Paid upon |
| :---- | :---- | :---- |
| 1. Compatibility Mode | 1,200,000: Digital Asset. 1,200,000: Obsidian Systems | Code included in a Splice release |
| 2. FA Staking Enablement | 1,300,000: Digital Asset. 1,300,000: Obsidian Systems | Code included in a Splice release |
| 3. Automate SV Locking | 450,000: Digital Asset. 450,000: Obsidian Systems | Code included in a Splice release |
| 4. SV Underlock Enforcement | 1,300,000: Digital Asset. 1,300,000: Obsidian Systems | Code included in a Splice release |
| Maintenance tranche | 1,000,000: Obsidian Systems | 250,000 CC quarterly from MainNet deployment, renewing annually |
| Total (year one) | 9,500,000. Digital Asset 4,250,000. Obsidian Systems 5,250,000 | |

Digital Asset and Obsidian Systems split each milestone 50/50. The maintenance tranche is paid to Obsidian Systems.

Minting rights are emitted directly to Digital Asset and Obsidian Systems separately, so that each recipient self-mints the CC as specified above.

**Volatility stipulation:** Project duration exceeds 6 months. The grant is denominated in fixed Canton Coin and will require a re-evaluation at the 6-month mark.

## Maintenance

Obsidian maintains the code it delivers under this grant on an ongoing basis, including fixing defects and test flakes, and reserves engineering capacity for that work. The tranche pays 1,000,000 CC yearly, reassessed quarterly against the CC price. It renews annually until an Obsidian Splice maintenance grant replaces it.

## Co-marketing

Obsidian will coordinate announcements with the Foundation, publish a technical blog on the enforcement design, and support ecosystem promotion through the migration.

## Motivation

Locking underpins CC reward integrity for every Super Validator and Featured Application, and today it rests on convention and manual SV votes. Roadmap Area 8 asks that offchain governance decisions be limited in time and scope, and on-chain enforcement does exactly that by making locking protocol-checked. The SVs voted on the standards and reviewed the design. This proposal makes them real.

## Rationale

See the “Rationale” section of CIP-0127.

## Constraints, Limitations and Out of Scope

Splice release scheduling is governed by the Splice release process, not by this grant.

Wallet-side user experience beyond providing the integration points from CIP-0127 is out of scope.

MainNet deployment timing depends on SV votes outside the control of Digital Asset and Obsidian.
