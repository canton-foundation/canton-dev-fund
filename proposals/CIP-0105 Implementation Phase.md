# CIP-0105 and CIP-0116 Implementation: On-Chain Enforcement Through Mainnet Deployment


**Author:** Obsidian Systems LLC

**Status:** Draft - submitted for committee review

**Created:** 2026-05-26

**Updated**: 2026-06-18

**Implements:** CIP-0105 and CIP-0116

**Champion:** Wayne Collier @waynecollier-da (Digital Asset)

---

> **Note for reviewers.** This Implementation Phase proposal is posted in parallel with continued review of the Phase 2 technical design we are producing under the Design Phase proposal (* [CIP-0105 Implementation: Phase 2 Design + Initial Daml Model](https://github.com/canton-foundation/canton-dev-fund/blob/main/proposals/2026-04-Obsidian-CIP-0105.md)). The design is in active development and undergoing review with the Splice maintainer team, Working Group members from Helix Labs and Avro Digital, and Foundation representatives. Obsidian is conducting twice-weekly working sessions with interested parties.
>
>  Partial requirements sign-off from the Splice maintainer team is in progress at the time of posting (see *Community Engagement* below for more detail). This proposal commits Obsidian to delivering against the **final** design as it is when approved by the Splice maintainer team. Sections of the design covering implementation-level detail (Proposed Changes, API Change Table, Impact Areas, error codes, NFRs, test coverage) are M1 deliverables of this Implementation Phase by design.

## Relationship to Design Phase Proposal

This proposal is the second of a two-proposal sequence covering CIP-0105 Phase 2 and CIP-0116 on-chain enforcement. The first, **[CIP-0105 Implementation: Phase 2 Design + Initial Daml Model](https://github.com/canton-foundation/canton-dev-fund/blob/main/proposals/2026-04-Obsidian-CIP-0105.md)** (the "Design Phase" proposal), funds production of a technical design doc and an initial draft Daml model, leading to written sign-off from the Splice maintainer team.

This Implementation Phase proposal cannot begin until the Design Phase proposal completes and the Splice maintainer team has provided written sign-off on the design and initial Daml model. The milestone schedule, acceptance criteria, and team plan in this proposal are predicated on the design phase completing and the design having been settled and approved.

This sequencing addresses two specific concerns raised by the Splice maintainer team: (1) the risk of deployed Daml contradicting the approved CIP, and (2) milestone pressure forcing suboptimal implementation choices. With the design and initial Daml model settled under the Design Phase proposal, this Implementation Phase proposal commits to implementation, Mainnet deployment, and post-Mainnet ownership of a reviewed, agreed-upon scope.

## Abstract

CIP-0105 was approved on March 2, 2026 and CIP-0116 (Featured App Locking) was approved on May 20, 2026. Phase 1 of CIP-0105 (off-chain transitional enforcement) is active. Phase 2 (on-chain enforcement) for CIP-0105 and the on-chain locking enforcement for CIP-0116 both remain unimplemented.

The CIP-0105 Working Group has produced a comprehensive functional requirements document (Section A) covering the CC Locking Primitive needed by both CIP-0105 (SV Locking) and CIP-0116 (Featured App Locking). These requirements define the state model, authorization model, tier evaluation, lock substitution, and observability functionality. A CIP memorializing these requirements is in draft and is expected to be submitted on the week of May 25, 2026.

This proposal funds Obsidian Systems to build, deploy, and maintain the Phase 2 on-chain enforcement layer for both CIP-0105 and CIP-0116 as a Splice contribution, satisfying the Working Group's functional requirements. The work proceeds against the technical design produced under the Design Phase proposal, which is currently in active community review with the Splice maintainer team and WG members. Obsidian will lead development and own delivery outcomes; Working Group members who have active contributions will receive part of the allocation of this grant.

## Motivation

CIP-0105 establishes the framework by which Super Validators cryptographically commit to Canton through locked capital. Without on-chain enforcement, four problems persist:

- **Replace reputation-based trust with cryptographic proof.** Phase 1 tracks SV lock status via spreadsheets and off-chain disclosures. Standing is asserted rather than proven. The CIP's core thesis of publicly observable, cryptographically enforced validator commitment cannot be satisfied without on-chain contracts.

- **Eliminate manual disclosure and off-chain verification.** SVs and Featured App providers self-report locked positions across self-custody wallets, custodians, and third-party providers to the Canton Foundation. The Foundation shares this information with two dashboard providers, which calculate and track locking status and alert the Foundation when an entity falls below a CIP-0105 or CIP-0116 threshold. The Foundation then initiates an on-chain SV vote to revoke SV weight or Featured App status. The arrangement is operationally brittle, does not scale, and creates credibility risk when institutions evaluate Canton as production infrastructure.

- **Make locking compliance publicly observable and enforceable.** SV weight in governance and traffic rewards does not automatically reflect lock status. A Super Validator or Featured App below tier threshold continues to receive full weight until the Super Validators intervene manually. Phase 2 closes this gap with automatic weight adjustment, a defined cure period, and permanent removal of excess weight on cure expiry.

- **Reduce centralized governance overhead.** Phase 1 enforcement does not scale as the SV set grows. Phase 2 moves enforcement to the smart contract layer, decentralizing operational governance load consistent with Canton Foundation direction for Splice.

CIP-0116 introduces objective on-chain criteria for Featured App designation, replacing manual Foundation governance with on-chain verifiable commitment. This resolves the same manual verification problems as SV locking Phase 1 but in the Featured App locking context. CIP-0116 shares the underlying CC Locking primitive with CIP-0105 Phase 2, which is why a single implementation effort covers both.

## Specification

### Functional Requirements

This proposal implements the functional requirements defined by the CIP-0105 Working Group (Section A, as of 2026-04-29 revision) along with CIP-0116-specific requirements, with allowance made for modifications made as part of the passage process in the forthcoming locking CIP. The Working Group requirements are the product of community input from Helix Labs, Avro Digital, Cashen, Obsidian Systems, and Digital Asset, with endorsement from Wayne Collier (DA).

The technical design doc enumerates these requirements as numbered functional requirements (FR-1 through FR-39 in the current revision, subject to refinement during continued review) organized into Super Validator requirements, Featured App requirements, Aggregated Locking requirements, Vesting Unlock process, Substitution, and Onboarding/Migration. The tables below restate the same requirement set in a sources-traced form, mapping each capability to its origin in the CIPs, DA's Phase 2 capability decomposition, the WG document, the #4841 community discussion, and the existing Splice PRs.

The requirements below are traced to five sources beyond the CIPs themselves:

- **DA Phase 2 Capabilities**: Wayne Collier (DA) decomposed CIP-0105 Phase 2 into [six implementation capabilities](https://github.com/canton-network/splice/issues/4842): lock declarations, mutual enforcement, weight evaluation, delegated locking, explicit unlocking state, and vesting enforcement.
- **WG Document**: The Working Group's [CC Locking Module: Requirements and Implementation Approaches](https://docs.google.com/document/d/13zl8ILEWq6CvSALk2LA79I2rE1PHfni1EFf5ywr-Aik/edit?tab=t.0) (Section A, as of 2026-04-29 revision).
- **Issue #4841 Discussion**: An [extended community discussion](https://github.com/canton-network/splice/issues/4841) on the Phase 2 capability set, with contributions from Helix Labs, Cashen, Avro Digital, and Digital Asset.
- **Splice PR #4848** (Helix): [Locking declarations and delegated locking](https://github.com/canton-network/splice/pull/4848), capabilities #1 and #4.
- **Splice PR #4898** (Avro): [Lock-derived SV weight evaluation](https://github.com/canton-network/splice/pull/4898), capability #3.

These sources inform the tables below. The first table covers shared CC Locking primitive requirements (CIP-0105 and CIP-0116 both); the second table covers CIP-0116-specific Featured App requirements layered on top.

#### Shared CC Locking Primitive Requirements

| Feature                                                       | CIP-0105                                                     | DA Phase 2 Caps | WG Doc                                                          | #4841                                              | Notes                                                                                                                                                                                     |
| ------------------------------------------------------------- | ------------------------------------------------------------ | --------------- | --------------------------------------------------------------- | -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Two lock states (Liquid/Locked)                               | §2 "only actively locked CC counts"                          | -               | A.1.1                                                           | -                                                  | Foundation of state model                                                                                                                                                                 |
| Paired state transitions (lock, unlock, withdraw, substitute) | §2 "must be withdrawn through the vesting process"           | -               | A.1.2                                                           | -                                                  | Enforced at contract level                                                                                                                                                                |
| Deterministic vesting derivation                              | §2 "1/365.25 vests each day"                                 | #6              | A.1.3                                                           | -                                                  | No mutation required; computed from immutable fields                                                                                                                                      |
| Multiple vest schedules (365.25d SV, 60d FA)                  | §2 (SV rate)                                                 | -               | A.1.4                                                           | Avro: configurable unlock policy                   | FA rate from CIP-116 §2.1                                                                                                                                                                 |
| Lock declarations                                             | §8 "only on-chain locked CC counts"                          | #1              | A.1.1, A.1.2                                                    | -                                                  | Party informs network of lock                                                                                                                                                             |
| Mutual enforcement (CC provably frozen)                       | §8 "on-chain enforcement"                                    | #2              | A.1.2 (enforce)                                                 | Cashen: lock state as token attribute              | Token non-transferable while locked                                                                                                                                                       |
| Lock-derived SV weight evaluation                             | §5 (tier schedule)                                           | #3              | A.4.1, A.4.2                                                    | Avro: composition with SV Accountability Framework | Continuous per-round evaluation                                                                                                                                                           |
| Delegated locking                                             | Operational guidelines only                                  | #4              | A.3 (supported by auth model)                                   | Avro: pooled multi-SV delegation                   | Non-SV locks CC for SV's benefit                                                                                                                                                          |
| Explicit unlocking state                                      | §2 "only the fully locked (non-vesting) portion counts"      | #5              | A.1.2, A.1.3                                                    | Cashen: vesting as network-native primitive        | VestingLockContext as distinct state                                                                                                                                                      |
| Vesting enforcement                                           | §2 "1/365.25 per day"                                        | #6              | A.1.3, A.1.4                                                    | -                                                  | On-chain enforcement of vesting rate                                                                                                                                                      |
| Lock Substitution (atomic)                                    | §2 "sole exception" (one sentence)                           | -               | A.5.1–A.5.6                                                     | Cashen: atomic state exchange                      | Replaces Phase 1 24-hour manual swap                                                                                                                                                      |
| Partial substitution                                          | -                                                            | -               | A.5.3                                                           | -                                                  | Split lock across two holders atomically                                                                                                                                                  |
| Substitution across locked AND vesting states                 | -                                                            | -               | A.5.1, A.5.4                                                    | Cashen: substitution across both states            | Foundational for secondary market                                                                                                                                                         |
| Substitution attribute inheritance                            | -                                                            | -               | A.5.2                                                           | -                                                  | Beneficiary, vest schedule, originatedAt preserved                                                                                                                                        |
| Vesting substitution with atomic withdraw                     | -                                                            | -               | A.5.4                                                           | -                                                  | Available balance withdrawn to outgoing holder                                                                                                                                            |
| Per-lock beneficiary attribution                              | §4 "locking is evaluated across the SV's aggregate position" | -               | A.2.1                                                           | -                                                  | PartyId as beneficiary identifier                                                                                                                                                         |
| SV vs. FA beneficiary type                                    | -                                                            | -               | A.2.2                                                           | Avro: beneficiary parameterization                 | Different evaluation rules per type                                                                                                                                                       |
| Only Active locks count toward aggregation                    | §2 "only the fully locked (non-vesting) portion"             | -               | A.2.3                                                           | -                                                  | Vesting positions excluded immediately                                                                                                                                                    |
| Aggregate balance queryable per beneficiary                   | §7 "lock from multiple wallets...in aggregate"               | -               | A.2.4                                                           | -                                                  | Cross-PartyId aggregation                                                                                                                                                                 |
| Holder identity tracked per lock                              | §7 "self-custody wallets, institutional custodians"          | -               | A.3.1                                                           | -                                                  | Separate from beneficiary                                                                                                                                                                 |
| Application-level unlock authorization                        | -                                                            | -               | A.3.3                                                           | Cashen: third-party unlock authorization           | Counterparty agreement check at application layer; not encoded in base contract layer                                                                                                     |
| Configurable withdraw authorization                           | -                                                            | -               | A.3.7                                                           | -                                                  | May include holder, custodian, DSO                                                                                                                                                        |
| Configurable substitution authorization                       | -                                                            | -               | A.3.6                                                           | -                                                  | Incoming holder sets fresh auth sets                                                                                                                                                      |
| Lock creation unilateral by holder                            | -                                                            | -               | A.3.5                                                           | -                                                  | No additional party required                                                                                                                                                              |
| No double-locking invariant                                   | -                                                            | -               | -                                                               | Avro: contract-level enforcement                   | Same CC cannot lock for two beneficiaries                                                                                                                                                 |
| Multi-custody aggregation                                     | §7 "multiple wallets, custodians, and PartyIds"              | -               | A.2.4                                                           | Helix: multi-wallet as first-class                 | Canonical SV identity across wallets/participants                                                                                                                                         |
| Tier evaluation per-round (continuous)                        | §8 "SV Weight updates continuously"                          | #3              | A.4.2                                                           | -                                                  | Replaces Phase 1 weekly evaluation                                                                                                                                                        |
| Underlock event emission                                      | §6 "removed from the active SV pool within 7 days"           | #2              | A.4.3                                                           | -                                                  | Observable threshold crossing                                                                                                                                                             |
| Restoration event emission                                    | §6 "restore its lock and return to the higher tier"          | -               | A.4.4                                                           | -                                                  | Observable return above threshold                                                                                                                                                         |
| Under-lock penalty enforcement                                | §6 (7-day/30-day/permanent)                                  | #2              | A.4.3                                                           | Avro: breach lifecycle parameterization            | Full breach lifecycle; configurable per beneficiary type                                                                                                                                  |
| Scan bulk API exposes underlying state                        | -                                                            | -               | A.6 (supersedes A.6.1–A.6.3 specific event-emission per design) | Helix: SV-facing UX continuity                     | All underlying state exposed via SV scan bulk API; supports lifecycle visibility, historical reconciliation, SV automation decisions, and dashboard query patterns for external consumers |
| Reconciliation against beneficiary_totals                     | -                                                            | -               | -                                                               | Helix: deterministic reconciliation                | Avoid BUG-028-class compute mismatches                                                                                                                                                    |
| Phase 1 → Phase 2 migration                                   | §8 "activates upon deployment"                               | -               | -                                                               | Helix: migration continuity                        | Attestation-to-declaration on-ramp                                                                                                                                                        |
| Compliance compute layer                                      | -                                                            | -               | -                                                               | Helix: derived values above primitives             | Tier status, cure state, vesting projection                                                                                                                                               |
| Minimize taxable events                                       | -                                                            | -               | -                                                               | Cashen: architectural constraint                   | Attribute-swap over transfer patterns                                                                                                                                                     |
| Direct rewards locking commitment                             | -                                                            | -               | Per ongoing design (FR-3, FR-4)                                 | -                                                  | SV commits on-chain to direct-lock a fraction of incoming rewards into Aggregate Lock; invariant that an increased lock obligation cannot leave the corresponding locked fraction missing from the effective locked total                  |
| Ghost SV tier inheritance and reward-locking constraints      | -                                                            | -               | Per ongoing design (FR-7, FR-8, FR-9)                           | -                                                  | Ghost SVs (associated with milestone rewards) inherit owning SV's tier; owner may lock a fraction of accumulated ghost rewards on receipt; transfer from ghost to owner blocked unless the transfer locks the highest-tier fraction the ghost operated under, or the owner already satisfies that tier post-receipt |
| Reward attribution                                            | -                                                            | -               | A.7 (WIP)                                                       | -                                                  | Design phase; WG has not finalized                                                                                                                                                        |

#### CIP-0116-Specific Featured App Requirements

| Requirement                                        | CIP-0116                                             | WG Doc       | Notes                                           |
| -------------------------------------------------- | ---------------------------------------------------- | ------------ | ----------------------------------------------- |
| Non-Issuer FA locking: 5,000,000 CC per PartyId    | §2.1                                                 | A.1.4, A.2.2 | Fixed threshold (not percentage-based like SV)  |
| Asset Issuer FA locking: 25,000,000 CC per PartyId | §2.1                                                 | A.1.4, A.2.2 | Higher tier for issuers                         |
| 60-day vest period (1/60 per day)                  | §2.1                                                 | A.1.4        | Shorter than SV's 365.25-day vest               |
| Continuous enforcement                             | §3 "must be satisfied continuously"                  | A.4.2        | Same per-round cadence as SV                    |
| Immediate FA status removal on breach              | §3 "immediately removed"                             | -            | No cure period (unlike SV's 7-day/30-day model) |
| Rapid-response SV unfeaturing process              | §3 "within 30 minutes"                               | -            | SVs must respond to unfeature proposals rapidly |
| Lock-gated voting for new FAs                      | §2.2 "vote gated on proving sufficient locked token" | -            | On-chain vote requires proof of lock            |
| Existing FA 30-day compliance window               | §2.3 "30 days from CIP approval"                     | -            | Deadline ~June 19, 2026                         |
| PartyId separation enforcement                     | §2.4                                                 | -            | Foundation enforces proper separation           |
| FA beneficiary type distinction                    | -                                                    | A.2.2        | Shared primitive, different evaluation rules    |
| Governance-updatable thresholds and durations      | §4                                                   | -            | Via SV vote with public notice                  |
| Pre-FA-status Aggregate Lock creation              | -                                                    | Per ongoing design (FR-14)                 | Aggregate Lock supporting a potential FA can be created before FA status is granted, and referenced from off-chain FA application processes |
| Immediate unlock on FA application rejection       | -                                                    | Per ongoing design (FR-15, FR-26)          | Upon rejection of an FA application, the associated Aggregate Lock is configured to permit immediate unlocks bypassing the 60-day vesting process |

In total, this proposal covers the full end-to-end locking lifecycle for both SV and FA beneficiaries: from lock creation and delegated locking, through continuous weight evaluation and enforcement, to vesting, unlock, and withdrawal. This proposal includes the atomic Lock Substitution primitive needed for lender swaps, the authorization model for custodial and multi-party arrangements, the observability surface for compliance dashboards, and the Phase 1 to Phase 2 migration path. DA's Phase 2 capabilities and all finalized WG Section A requirements are in scope, alongside the CIP-0116 Featured App-specific requirements. The proposal additionally covers items currently being finalized in the ongoing design: SV direct rewards locking, ghost SV mechanics for milestone-reward attribution, pre-status Aggregate Lock creation for FA applicants, and immediate unlock on FA application rejection. These are tracked as design FRs and subject to refinement during continued community review.

### Design Process Findings

The two-proposal sequencing was structured to surface critical implementation questions in public deliberation, before committing an implementation to the splice codebase. The four substantive items that have been surfaced in the working sessions (covered in the *Community Engagement* section) that were not explicit in the original CIP-0105 / CIP-0116 specifications, and that this proposal now incorporates, are:

- **SV direct rewards locking (FR-3, FR-4).** SVs commit on-chain to direct-locking a fraction of incoming rewards into their Aggregate Lock. This closes an invariant gap where the lock obligation could increase due to a reward before the corresponding locked fraction landed in the effective locked total. This is a gap that the original Phase 1 enforcement model handled procedurally rather than structurally.
- **Ghost Super Validator mechanics (FR-7, FR-8, FR-9).** Ghost SVs associated with milestone rewards inherit the owning SV's tier; owner-side reward-locking constraints on receipt from the ghost (and the transfer-blocking conditions that gate that receipt) prevent tier circumvention via ghost-routed rewards. The original CIP did not address this case directly.
- **Pre-FA-status Aggregate Lock creation (FR-14).** FA applicants can create an Aggregate Lock before being granted FA status, allowing it to be referenced from off-chain application processes. Without this, applicants would have no way to demonstrate readiness in support of their application.
- **Immediate unlock on FA application rejection (FR-15, FR-26).** On rejection, the Aggregate Lock is configured to allow immediate unlock, bypassing the 60-day vesting process. Without this provision, rejected applicants would be stuck on speculatively-locked capital, an outcome that would chill FA applications generally.

The committee should expect additional refinements of this kind to emerge as design review continues and concludes, and Obsidian's commitment with this proposal is to deliver against the final design as approved by the Splice maintainer team, including refinements not yet visible at the time of posting.

### Out of Scope

**Time-based locking.** Locking semantics beyond the linear vesting unlock process specified by the WG requirements (e.g., date-anchored expiration, cliff schedules, non-linear vesting curves) are explicitly out of scope for this Implementation Phase. Applications requiring such behavior implement it at the dApp application layer on top of the locking primitive delivered here.

**SV Accountability Framework composition.** Composition of the lock-tier multiplier with the SV Accountability Framework's `baseWeight` is out of scope for this proposal until the Accountability Framework itself is implemented and available for integration. If the AF lands during this Implementation Phase's timeline, composition is candidate scope for a follow-on proposal rather than a milestone within this one.

### Architectural Direction

The technical design produced under the Design Phase proposal governs this implementation. There are four architectural pillars or commitments in the Design Phase that we carry through here:

**Interface package first.** A new `splice-api-locking-*` interface package defines the contract surface (templates, choices, interfaces) before `splice-dso-governance` implementation. Wallet operators and custodians must not depend on core Splice packages. Depending on technical feedback and feasibility, Obsidian will incorporate parts of the existing Splice PRs (#4848, #4898), which were implemented directly in `DsoRules` and require additional work to bring to conclusion.

**`ExternalPartyAmuletRules` pattern.** The locking primitive is an external-party interaction: holders lock, unlock, substitute, and withdraw CC from their own wallets. Custom locking functionality (authorize lock, unlock, substitution) is built on top of the V2 token standard. The implementation follows the `ExternalPartyAmuletRules` pattern established in Splice.

**Parameterized for SV and FA.** A single contract suite supports both SV locking (365.25-day vest, multi-tier percentage thresholds, 7-day/30-day cure) and FA locking (60-day vest, fixed CC threshold, immediate removal) through configuration rather than separate contracts. FA-specific workflows are delivered as baseline scope within the milestones below.

**Prior work assessed, not blindly inherited.** Two Splice PRs exist ([#4848](https://github.com/canton-network/splice/pull/4848) by Helix, [#4898](https://github.com/canton-network/splice/pull/4898) by Avro). Both made valuable contributions to the requirements process. We will work to align them with the interface-package-first architecture either via updates or incorporation. This proposal takes an approach informed by those contributions but may not necessarily build directly on top of them. Obsidian will take ownership of driving the functionality in those PRs to completion.

### Existing Work and Working Group Contributions

| Work                                                                                                                                                             | Relationship                                                                                                                       |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| [Splice PR #4848](https://github.com/canton-network/splice/pull/4848) (Helix: lock declarations, delegated locking)                                             | Obsidian takes ownership of driving to completion; 150,000 CC allocated from this grant                                            |
| [Splice PR #4898](https://github.com/canton-network/splice/pull/4898) (Avro: weight evaluation)                                                                 | Obsidian takes ownership of driving to completion; 150,000 CC allocated from this grant                                            |
| [WG Requirements Document](https://docs.google.com/document/d/13zl8ILEWq6CvSALk2LA79I2rE1PHfni1EFf5ywr-Aik/edit?tab=t.0) (Section A, as of 2026-04-29 revision) | Adopted as functional requirements basis                                                                                           |
| Forthcoming Locking CIP                                                                                                                                          | Obsidian to implement this CIP as passed/updated and fall back to WG document if CIP is not passed within implementation timeframe |
| [Issue #4841](https://github.com/canton-network/splice/issues/4841) community discussion                                                                         | Community requirements (Helix, Cashen, Avro) incorporated into featureset                                                          |
| Helix ComplianceVault (Catalyst MainNet)                                                                                                                         | Product reference for compliance compute and dashboard patterns                                                                    |
| [PR #223](https://github.com/canton-foundation/canton-dev-fund/pull/223) (Avro: SV Governance dApp)                                                             | This is complementary work focusing on UI/UX rather than on-chain enforcement, for which integration points are defined in design. |

### Backward Compatibility and SCU Compatibility

New Daml contracts and SV-app-side automation. No Canton protocol changes are required. The design preserves Phase 1 functionality during the migration window: SVs continue to operate under spreadsheet-based attestation until they declare their lock on-chain, at which point Phase 2 enforcement takes effect for that beneficiary.

All contracts are subject to Smart Contract Upgrade (SCU) compatibility as the Daml schema evolves. Obsidian's commitments:

- All contracts conform to SCU at `Mainnet` deployment.
- Future Daml schema upgrades are accompanied by upgrade definitions and migration paths consistent with SCU patterns established by CIP-0104 and the Splice contributor framework.
- Upgrades affecting the locking lifecycle or weight calculations require SV governance vote; minor schema upgrades follow standard Splice contributor practice.

## Community Engagement

Obsidian is using a structured, public community engagement process around the Phase 2 technical design and requirements, which forms the basis of this Implementation Phase proposal. Highlights as of the date of the most recent update to this document:

- **Twice-weekly Working Group sync sessions.** Obsidian convenes SV Locking Sync working sessions on a regular Monday/Wednesday cadence (11:30 AM EST). Four sessions have been held to date with regular attendance from the Splice maintainer team, Working Group members from Helix Labs and Avro Digital, and Foundation representatives. Sessions are working sessions, not status meetings; each surfaces and resolves specific design and requirements questions in real time, with Obsidian engineering present and contributing.

- **Public design review with measurable burn-down.** The technical design has accumulated 78 review comments since publication, 41 of which have been resolved as of the date of posting. Remaining comments are either tracked as agenda items for upcoming working sessions or pending Splice Team review of completed changes. Comment resolution has proceeded at a pace consistent with partial requirements sign-off from the Splice maintainer team within one week, with parallel code-level POC work beginning on items as they pass sign-off.

- **Dedicated community channel.** The `sv-locking-dashboard` Slack channel hosts post-meeting summaries, technical discussion threads, and milestone announcements. Several announcements have been posted to date with active community participation in the resulting threads, including Obsidian engineering responses to technical questions raised by Working Group members and other dependent teams.

- **Inclusive Working Group composition.** The CIP-0105 Working Group has incorporated meaningful contributions from Helix Labs, Avro Digital, Cashen, Digital Asset, and Obsidian Systems. Existing Splice PRs from Helix (#4848) and Avro (#4898) are recognized in the *Funding* section. The forthcoming locking CIP, which memorializes the Working Group's requirements, has been drafted with input from this same cross-section.

This engagement model is designed to:

1. **Surface design decisions in public**, keeping the Splice maintainer team in the loop as decisions are made. Our objective here is to directly address the Splice team's concern about deployed Daml contradicting an approved design: the design is part of the public deliberation, being done in collaboration with the parties who will sign off on it.
2. **Sequence requirements sign-off ahead of implementation**. This is the same concern that motivates the two-proposal sequencing described in the *Relationship to Design Phase Proposal* section. The requirements that are settled in working sessions will become the firm acceptance criteria for the milestones below.
3. **Real-time visibility for dependent dApp teams**. Many community members are interested in this functionality (custodians, dashboard providers like CC View, Lighthouse, and Helix ComplianceVault, and lender ecosystems). We are aiming to reduce integration risk by ensuring no group is surprised by a contract, interface, or workflow late in the implementation cycle.

The engagement model will continue through implementation. Working sessions will continue to be the venue for design refinement, with the community Slack channel and milestone artifacts (devnet deployments, dashboard previews, contract test coverage, observability surfaces) providing ongoing visibility. Obsidian commits to maintaining this cadence through M1 and M2, and scaling it appropriately as the design stabilizes and operational concerns take over from technical design concerns in M3 and M4.

## Milestones and Deliverables

### M1: Contract Suite + Governance Foundations

**Timeline:** Months 1–2
**Focus:** Full contract suite implementing the WG Section A requirements; governance automation foundations in place.

**Deliverables:**

- All Daml templates, services, and choices implementing Section A requirements (state model, beneficiary attribution, authorization model, Lock Substitution, vesting)
- Multi-custody aggregation functional against representative custody profiles
- Penalty enforcement state machine (breach > 7-day removal > 30-day cure > permanent penalty) with explicit state transitions and test coverage
- Governance automation stubs: scan APIs, trigger interfaces ready for M2
- SCU compatibility verification
- dryRun mode functional for pre-deployment validation

**Acceptance criteria:**

- Test coverage and code quality meets Splice contribution standards
- Governance automation stubs reviewed by DA Splice team, which gates M2 entry

**Estimated amount:** 1,500,000 CC

### M2: Governance Automations + Observability + Compliance (with CIP-0116 FA Work)

**Timeline:** Months 3–4
**Focus:** Automation, observability, and compliance surfaces making the M1 contract suite usable in operations; CIP-0116 FA-specific work delivered as baseline scope.

**Deliverables:**

- Continuous weight evaluation trigger (replaces Phase 1 weekly off-chain process)
- Under-lock penalty trigger, cure countdown automation, threshold monitoring
- Observability layer: SV scan bulk API exposing all underlying lock state, lifecycle, and historical reconciliation data (per WG A.6)
- Compliance dashboard (per-SV lock status, tier standing, weight impact, vesting projection, cure-period countdown)
- Dashboard query patterns designed for external consumers (Helix, CC View, Lighthouse)
- CIP-0116 FA-specific threshold evaluation, breach lifecycle (immediate removal), FA beneficiary registration, lock-gated voting workflow, existing FA migration

**Acceptance criteria:**

- Automations live on devnet with end-to-end test coverage (breach, cure, permanent penalty, substitution)
- Compliance dashboard reviewed by SV representatives and DA governance staff
- Observability surface validated against Phase 1 Live Metrics requirements

**Estimated amount:** 2,500,000 CC

### M3: Mainnet Deployment (Governance-Vote Gated)

**Timeline:** Month 5
**Focus:** Production deployment gated on SV governance vote.

**Deliverables:**

- Governance vote passed; Mainnet deployment per voted scope
- Wallet-app lock/unlock integration
- Operator documentation published
- Phase 1-to-2 migration executed for participating SVs
- Production handoff documentation

**Acceptance criteria:**

- Successful Mainnet deployment with all functionality live
- Governance vote recorded
- DA Splice team and SV representatives acknowledge production handoff

**Estimated amount:** 500,000 CC

### M4: Six-Month Post-Mainnet Ownership

**Timeline:** Months 6–11
**Focus:** Bug fixes, SV feedback, incident response, iterative refinements.

**Deliverables:**

- Bug fix releases as needed
- Iterative refinements based on SV and dashboard-provider feedback
- Incident response and operational support
- End-of-period report: operational experience, open items, recommended follow-on scope, framework wind-down planning (CIP-0105 terminates 30 days after late-2029 halving)

**Acceptance criteria:**

- No unresolved critical bugs
- SV feedback log maintained and acted upon
- End-of-period report delivered

**Estimated amount:** 1,000,000 CC

## Funding

| Line item                                                              | Amount           |
| ---------------------------------------------------------------------- | ---------------- |
| M1: Contract suite + governance foundations                            | 1,500,000 CC     |
| M2: Automations + observability + compliance (incl. CIP-0116 FA work)  | 2,500,000 CC     |
| M3: Mainnet deployment                                                 | 500,000 CC       |
| M4: Post-Mainnet ownership (6 months)                                  | 1,000,000 CC     |
| **Base total (CIP-0105 + CIP-0116)**                                   | **5,500,000 CC** |
| Early completion bonus (M2 accepted by end of month 3)                 | 1,000,000 CC     |
| **Total with bonus**                                                   | **6,500,000 CC** |

Of the base total, the following amounts are allocated to contributing parties:

- **Helix Labs:** 150,000 CC in recognition of Working Group contributions, ComplianceVault product reference, and existing Splice PR #4848
- **Avro Digital:** 150,000 CC in recognition of Working Group organization, Issue #4841 tracker, and existing Splice PR #4898
- **Digital Asset:** 150,000 CC scoped for SV node debugging access during M2/M3 and SV coordination support

Obsidian takes ownership of driving all functionality to completion; no additional implementation obligation on these contributors in exchange for these payments.

**Payment schedule:** Paid on milestone acceptance. M4 invoiced in two tranches (months 8 and 11) to align with ongoing support delivery.

**Volatility structure:** Fixed Canton Coin denomination throughout. Volatility stipulation: re-evaluation at 6-month mark per CIP-100 guidelines.

**Early completion bonus:** 1,000,000 CC if M2 is accepted by end of month 3 (one month ahead of schedule). This triggers on engineering completion, not Mainnet deployment, because M3 depends on a governance vote and SV coordination outside Obsidian's control. Follows precedent of PR #107 (Traffic-Based App Rewards).

**Licensing:** All deliverables released under Splice's contribution license (Apache 2.0), consistent with CIP-0104.

**Co-marketing:** Obsidian and the Canton Foundation jointly announce delivery of each milestone through standard Splice contributor channels.

## Maintenance Plan

CIP-105 / CIP-0116 maintenance falls into three time horizons:

- **In-build (Months 1–5).** Bug fixes and design refinements absorbed within milestone scope. Test coverage and SCU compatibility maintained as build-time obligations.
- **Post-Mainnet ownership (Months 6–11, M4).** Obsidian retains direct operational responsibility (bug fixes, SV feedback, incident response) closing with the recommended follow-on scope deliverable.
- **Long-run (Month 12 onward).** Three candidate paths, confirmed at the close of M4 based on observed maintenance load and DA / Foundation direction:
  - **Maintenance absorbed by an existing or future Splice maintenance arrangement.** If alignment with DA and the Foundation exists at M4 close and maintenance load is modest, no incremental CIP-105 funding may be required.
  - **Separate stewardship CIP.** A renewable annual stewardship grant sized to actual observed maintenance load.
  - **Refresh proposal.** A one-shot proposal for a specific protocol-evolution refresh, if maintenance is bounded and episodic rather than continuous.

The long-run path is recommended in the M4 end-of-period report based on operational data from the first six months of Mainnet.

Long-run scope must also account for framework auto-termination, which the spec mandates 30 days after the late 2029 halving. At termination, the on-chain enforcement contracts wind down. The wind-down deliverable is a candidate for the post-Mainnet refresh proposal path noted above.

## Why Obsidian Systems

- **Active Splice contributor.** Obsidian is delivering CIP-0104 and works actively with DA's Splice engineering team. Obsidian's Divam Narula is co-author on PR #107 (Traffic-Based App Rewards) alongside Wayne Collier and a member of the Splice core contributors group.
- **Working group coordination.** Obsidian has been coordinating with the CIP-0105 Working Group since its formation. Avro proposed Obsidian as implementation lead; Helix agreed and scoped their areas of interest. The WG has converged on Obsidian leading development. Obsidian convenes and chairs the regular SV Locking Sync working sessions through which design and requirements decisions are surfaced and resolved with the Splice maintainer team, Helix, Avro, and Foundation representatives (see *Community Engagement*).
- **Canton Foundation governance presence.** Obsidian sits on the Canton Foundation board; Obsidian holds active seats on several Canton Network committees.
- **Proven implementation partner.** Trusted by prominent network participants as an end-to-end implementation partner for demanding Canton deployments, solving both organizational and technical problems.
- **Super Validator.** Obsidian operates a Super Validator and is subject to CIP-0105 enforcement, a structural alignment between governance accountability and implementation quality.

## Team

| Phase            | Composition                                         |
| ---------------- | --------------------------------------------------- |
| M1 (Months 1–2)  | Senior Daml engineer + mid-level Daml engineer      |
| M2 (Months 3–4)  | Senior Daml engineer + 1–2 mid-level Daml engineers |
| M3 (Month 5)     | Senior Daml engineer + mid-level Daml engineer      |
| M4 (Months 6–11) | Support ownership capacity (Daml engineer(s))       |

## References

- **CIP-0105 specification:** [canton-foundation/cips](https://github.com/canton-foundation/cips/blob/main/cip-0105/cip-0105.md)
- **CIP-0116 specification:** [canton-foundation/cips](https://github.com/canton-foundation/cips/blob/main/cip-0116/cip-0116.md)
- **CIP-0105: SV Locking Technical Design (Obsidian Systems):** [link](https://docs.google.com/document/d/1VGtgNSNHrHnSLggqxlvhCTFrMPgaeCs2OLEJ8Fq9Ar4/edit?tab=t.0). In active community review with the Splice maintainer team and WG members as of June 18, 2026; available on request to Committee reviewers
- **WG Requirements Document:** [CC Locking Module: Requirements and Implementation Approaches](https://docs.google.com/document/d/13zl8ILEWq6CvSALk2LA79I2rE1PHfni1EFf5ywr-Aik/edit?tab=t.0) (Section A, as of 2026-04-29 revision)
- **SV Locking Operational Guidelines:** [canton-foundation/configs](https://github.com/canton-foundation/configs/blob/main/Super%20Validator%20Operational%20Processes/SV-Locking-Process.md)
- **DA Phase 2 Capabilities (Issue #4842):** [canton-network/splice](https://github.com/canton-network/splice/issues/4842)
- **Phase 2 Tracker (Issue #4841):** [canton-network/splice](https://github.com/canton-network/splice/issues/4841)
- **Splice PR #4848 (Helix: lock declarations, delegated locking):** [canton-network/splice](https://github.com/canton-network/splice/pull/4848)
- **Splice PR #4898 (Avro: weight evaluation):** [canton-network/splice](https://github.com/canton-network/splice/pull/4898)
- **PR #107 (precedent):** Traffic-Based App Rewards, co-authored by Wayne Collier and Obsidian's Divam Narula
- **PR #223 (Avro: SV Governance dApp):** [canton-foundation/canton-dev-fund](https://github.com/canton-foundation/canton-dev-fund/pull/223)
- **CIP-0104:** Protocol-level work, Obsidian delivering separately; SCU patterns reused

---

*Drafted May 26, 2026. Updated June 18, 2026 to reflect substantial progress on the Phase 2 technical design and key requirement decisions reached in community review. Prepared by Obsidian Systems for Canton Foundation Development Fund Grants Committee review.*
