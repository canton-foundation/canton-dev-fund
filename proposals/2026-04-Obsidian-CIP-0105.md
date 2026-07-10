# CIP-0105 Implementation: Phase 2 Design + Initial Daml Model


| Field | Value |
| :---- | :---- |
| Author | cardenaso11 |
| Org | Obsidian Systems |
| Status | Approved |
| Created | 2026-04-20 |
| Approved | 2026-05-27 |
| PR | [#269](https://github.com/canton-foundation/canton-dev-fund/pull/269) | 
| Implements | CIP-0105 (Phase 2 design only) |

---

## Abstract

CIP-0105 was approved on March 2, 2026. Phase 1 (off-chain transitional enforcement) is active. Phase 2 (on-chain enforcement) remains unimplemented.

This proposal funds the **design phase** of Phase 2: production of a technical design doc and an initial draft Daml model for the CC Locking primitive, leading to written sign-off from the Splice maintainer team. The deliverables of this proposal are the basis on which milestone dates and acceptance criteria for the subsequent implementation work can be committed with confidence.

A follow-on **Implementation Phase** proposal covering the full contract suite, governance automations, Mainnet deployment, and post-Mainnet ownership for both CIP-0105 and CIP-0116 will be submitted separately and is sequenced to begin only after this Design Phase concludes with Splice maintainer sign-off. See the *Relationship to Implementation Phase Proposal* section below for more on this.

## Motivation

CIP-0105 establishes the framework by which Super Validators cryptographically commit to Canton through locked capital. Without on-chain enforcement, four problems persist:

- **Replace reputation-based trust with cryptographic proof.** Phase 1 tracks SV lock status via spreadsheets and off-chain disclosures. Standing is asserted rather than proven. The CIP's core thesis of publicly observable, cryptographically enforced validator commitment cannot be satisfied without on-chain contracts.

- **Eliminate manual disclosure and off-chain verification.** SVs self-report locked positions across self-custody wallets, custodians, and third-party providers and DA manually reconciles. The arrangement is operationally brittle, does not scale, and creates credibility risk when institutions evaluate Canton as production infrastructure.

- **Make validator commitment publicly observable and enforceable.** SV weight in governance and traffic rewards does not automatically reflect lock status. A validator below tier threshold continues to receive full weight until DA intervenes manually. Phase 2 closes this gap with automatic weight adjustment, a defined cure period, and permanent removal of excess weight on cure expiry.

- **Reduce centralized governance overhead.** Phase 1 enforcement does not scale as the SV set grows. Phase 2 moves enforcement to the protocol layer, decentralizing operational governance load consistent with Canton Foundation direction for Splice.

In earlier versions of this proposal, design and implementation were combined. What this proposal funds is the design and initial Daml model that make the implementation tractable.

## Specification

### Functional Requirements

The design produced under this proposal must satisfy the functional requirements defined by the CIP-0105 Working Group (Section A) with allowance made for modifications made as part of the passage process in the forthcoming locking CIP. The Working Group requirements are the product of community input from Helix Labs, Avro Digital, Cashen, Obsidian Systems, and Digital Asset, with endorsement from Wayne Collier (DA).

The requirements below are traced to five sources beyond the CIP itself:

- **DA Phase 2 Capabilities**: Wayne Collier (DA) decomposed CIP-0105 Phase 2 into [six implementation capabilities](https://github.com/canton-network/splice/issues/4842) — lock declarations, mutual enforcement, weight evaluation, delegated locking, explicit unlocking state, and vesting enforcement.
- **WG Document**: The Working Group's [CC Locking Module: Requirements and Implementation Approaches](https://docs.google.com/document/d/13zl8ILEWq6CvSALk2LA79I2rE1PHfni1EFf5ywr-Aik/edit?tab=t.0) (Section A requirements).
- **Issue #4841 Discussion**: An [extended community discussion](https://github.com/canton-network/splice/issues/4841) on the Phase 2 capability set, with contributions from Helix Labs, Cashen, Avro Digital, and Digital Asset.
- **Splice PR #4848** (Helix): [Locking declarations and delegated locking](https://github.com/canton-network/splice/pull/4848) — capabilities #1 and #4.
- **Splice PR #4898** (Avro): [Lock-derived SV weight evaluation](https://github.com/canton-network/splice/pull/4898) — capability #3.

These sources inform the table below, which maps each requirement to its source. Note that not all requirements are directly specified in CIP-0105 (hence the need for an additional CIP).

| Feature                                                       | CIP-0105                                                     | DA Phase 2 Caps | WG Doc                        | #4841                                              | Notes                                                    |
| ------------------------------------------------------------- | ------------------------------------------------------------ | --------------- | ----------------------------- | -------------------------------------------------- | -------------------------------------------------------- |
| Two lock states (Liquid/Locked)                               | §2 "only actively locked CC counts"                          | —               | A.1.1                         | —                                                  | Foundation of state model                                |
| Paired state transitions (lock, unlock, withdraw, substitute) | §2 "must be withdrawn through the vesting process"           | —               | A.1.2                         | —                                                  | Enforced at contract level                               |
| Deterministic vesting derivation                              | §2 "1/365.25 vests each day"                                 | #6              | A.1.3                         | —                                                  | No mutation required; computed from immutable fields     |
| Multiple vest schedules (365.25d SV, 60d FA)                  | §2 (SV rate)                                                 | —               | A.1.4                         | Avro: configurable unlock policy                   | FA rate from CIP-116 §2.1                                |
| Lock declarations                                             | §8 "only on-chain locked CC counts"                          | #1              | A.1.1, A.1.2                  | —                                                  | Party informs network of lock                            |
| Mutual enforcement (CC provably frozen)                       | §8 "on-chain enforcement"                                    | #2              | A.1.2 (enforce)               | Cashen: lock state as token attribute              | Token non-transferable while locked                      |
| Lock-derived SV weight evaluation                             | §5 (tier schedule)                                           | #3              | A.4.1, A.4.2                  | Avro: composition with SV Accountability Framework | Continuous per-round evaluation                          |
| Delegated locking                                             | Operational guidelines only                                  | #4              | A.3 (supported by auth model) | Avro: pooled multi-SV delegation                   | Non-SV locks CC for SV's benefit                         |
| Explicit unlocking state                                      | §2 "only the fully locked (non-vesting) portion counts"      | #5              | A.1.2, A.1.3                  | Cashen: vesting as network-native primitive        | VestingLockContext as distinct state                     |
| Vesting enforcement                                           | §2 "1/365.25 per day"                                        | #6              | A.1.3, A.1.4                  | —                                                  | On-chain enforcement of vesting rate                     |
| Lock Substitution (atomic)                                    | §2 "sole exception" (one sentence)                           | —               | A.5.1–A.5.6                   | Cashen: atomic state exchange                      | Replaces Phase 1 24-hour manual swap                     |
| Partial substitution                                          | —                                                            | —               | A.5.3                         | —                                                  | Split lock across two holders atomically                 |
| Substitution across locked AND vesting states                 | —                                                            | —               | A.5.1, A.5.4                  | Cashen: substitution across both states            | Foundational for secondary market                        |
| Substitution attribute inheritance                            | —                                                            | —               | A.5.2                         | —                                                  | Beneficiary, vest schedule, originatedAt preserved       |
| Vesting substitution with atomic withdraw                     | —                                                            | —               | A.5.4                         | —                                                  | Available balance withdrawn to outgoing holder           |
| Per-lock beneficiary attribution                              | §4 "locking is evaluated across the SV's aggregate position" | —               | A.2.1                         | —                                                  | PartyId as beneficiary identifier                        |
| SV vs. FA beneficiary type                                    | —                                                            | —               | A.2.2                         | Avro: beneficiary parameterization                 | Different evaluation rules per type                      |
| Only Active locks count toward aggregation                    | §2 "only the fully locked (non-vesting) portion"             | —               | A.2.3                         | —                                                  | Vesting positions excluded immediately                   |
| Aggregate balance queryable per beneficiary                   | §7 "lock from multiple wallets...in aggregate"               | —               | A.2.4                         | —                                                  | Cross-PartyId aggregation                                |
| Holder identity tracked per lock                              | §7 "self-custody wallets, institutional custodians"          | —               | A.3.1                         | —                                                  | Separate from beneficiary                                |
| Configurable unlock authorization                             | —                                                            | —               | A.3.3                         | Cashen: third-party unlock authorization           | Alternative authorization sets per lock                  |
| Configurable withdraw authorization                           | —                                                            | —               | A.3.7                         | —                                                  | May include holder, custodian, DSO                       |
| Configurable substitution authorization                       | —                                                            | —               | A.3.6                         | —                                                  | Incoming holder sets fresh auth sets                     |
| Lock creation unilateral by holder                            | —                                                            | —               | A.3.5                         | —                                                  | No additional party required                             |
| No double-locking invariant                                   | —                                                            | —               | —                             | Avro: contract-level enforcement                   | Same CC cannot lock for two beneficiaries                |
| Multi-custody aggregation                                     | §7 "multiple wallets, custodians, and PartyIds"              | —               | A.2.4                         | Helix: multi-wallet as first-class                 | Canonical SV identity across wallets/participants        |
| Tier evaluation per-round (continuous)                        | §8 "SV Weight updates continuously"                          | #3              | A.4.2                         | —                                                  | Replaces Phase 1 weekly evaluation                       |
| Underlock event emission                                      | §6 "removed from the active SV pool within 7 days"           | #2              | A.4.3                         | —                                                  | Observable threshold crossing                            |
| Restoration event emission                                    | §6 "restore its lock and return to the higher tier"          | —               | A.4.4                         | —                                                  | Observable return above threshold                        |
| Under-lock penalty enforcement                                | §6 (7-day/30-day/permanent)                                  | #2              | A.4.3                         | Avro: breach lifecycle parameterization            | Full breach lifecycle; configurable per beneficiary type |
| State-transition events                                       | —                                                            | —               | A.6.1                         | —                                                  | Every Liquid↔Locked transition                           |
| LockContext lifecycle events                                  | —                                                            | —               | A.6.2                         | —                                                  | Every create/archive                                     |
| Historical aggregate queries (35-day window)                  | —                                                            | —               | A.6.3                         | —                                                  | Audit and dashboard support                              |
| Cheap dashboard query patterns                                | —                                                            | —               | A.6                           | Helix: SV-facing UX continuity                     | Reads must be poll-able, not signing-only                |
| Reconciliation against beneficiary_totals                     | —                                                            | —               | —                             | Helix: deterministic reconciliation                | Avoid BUG-028-class compute mismatches                   |
| Phase 1 → Phase 2 migration                                   | §8 "activates upon deployment"                               | —               | —                             | Helix: migration continuity                        | Attestation-to-declaration on-ramp                       |
| Compliance compute layer                                      | —                                                            | —               | —                             | Helix: derived values above primitives             | Tier status, cure state, vesting projection              |
| Minimize taxable events                                       | —                                                            | —               | —                             | Cashen: architectural constraint                   | Attribute-swap over transfer patterns                    |
| SV Accountability Framework composition                       | —                                                            | —               | —                             | Ian: baseWeight integration                        | Lock-tier multiplier must compose with AF                |
| Reward attribution                                            | —                                                            | —               | A.7 (WIP)                     | —                                                  | Design phase; WG has not finalized                       |

In total, the design produced under this proposal covers the full end-to-end locking lifecycle: from lock creation and delegated locking, through continuous weight evaluation and enforcement, to vesting, unlock, and withdrawal. The design includes the atomic Lock Substitution primitive needed for lender swaps, the authorization model for custodial and multi-party arrangements, the observability surface for compliance dashboards, and the Phase 1 to Phase 2 migration path. DA's Phase 2 capabilities and all finalized WG Section A requirements are in scope of the design.

### Architectural Direction

The design doc will translate the above functional requirements into a technical design approved by the Splice maintainer team. The following architectural commitments inform that design:

**Interface package first.** The `splice-api-*` interface package will be designed before `splice-dso-governance` implementation. Wallet operators and custodians must not depend on core Splice packages. Depending on technical feedback and feasibility, Obsidian will incorporate parts of the existing Splice PRs (#4848, #4898), which were implemented directly in `DsoRules` and require additional work to bring to conclusion.

**`ExternalPartyAmuletRules` pattern.** The locking primitive is an external-party interaction — holders lock, unlock, substitute, and withdraw CC from their own wallets. The implementation follows the `ExternalPartyAmuletRules` pattern established in Splice.

**Parameterized for CIP-116.** The primitive supports both SV locking (365.25-day vest, multi-tier percentage thresholds, 7-day/30-day cure) and FA locking (60-day vest, fixed CC threshold, immediate removal) through configuration rather than separate contracts. CIP-0116 scope is delivered by the follow-on Implementation Phase proposal; the design produced here is parameterized to support both from the outset.

**Prior Work.** Two Splice PRs exist ([#4848](https://github.com/canton-network/splice/pull/4848) by Helix, [#4898](https://github.com/canton-network/splice/pull/4898) by Avro). Both made valuable contributions to the requirements process. The design will assess alignment with the interface-package-first architecture either via updates or incorporation. This proposal takes an approach informed by those contributions but may not necessarily build directly on top of them. Obsidian will take ownership of driving the functionality in those PRs to completion through the Implementation Phase proposal.

### Existing Work and Working Group Contributions

| Work                                                                                                                                 | Relationship                                                                                                                       |
| ------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| [Splice PR #4848](https://github.com/canton-network/splice/pull/4848) (Helix — lock declarations, delegated locking)                 | Design assesses incorporation; Obsidian takes ownership of driving to completion under the Implementation Phase proposal           |
| [Splice PR #4898](https://github.com/canton-network/splice/pull/4898) (Avro — weight evaluation)                                     | Design assesses incorporation; Obsidian takes ownership of driving to completion under the Implementation Phase proposal           |
| [WG Requirements Document](https://docs.google.com/document/d/13zl8ILEWq6CvSALk2LA79I2rE1PHfni1EFf5ywr-Aik/edit?tab=t.0) (Section A) | Adopted as functional requirements basis                                                                                           |
| Forthcoming Locking CIP                                                                                                              | Obsidian to design against this CIP as passed/updated and fall back to WG document if CIP is not passed within design timeframe    |
| [Issue #4841](https://github.com/canton-network/splice/issues/4841) community discussion                                             | Community requirements (Helix, Cashen, Avro) incorporated into featureset                                                          |
| Helix ComplianceVault (Catalyst MainNet)                                                                                             | Product reference for compliance compute and dashboard patterns                                                                    |
| [PR #223](https://github.com/canton-foundation/canton-dev-fund/pull/223) (Avro — SV Governance dApp)                                 | This is complementary work focusing on UI/UX rather than on-chain enforcement, for which integration points will be defined in M1. |

### Backward Compatibility and SCU Compatibility

The design specifies new Daml contracts and SV-app-side automation. No Canton protocol changes are required.

All contracts produced from the design will be subject to Smart Contract Upgrade (SCU) compatibility as the Daml schema evolves. Obsidian's design-phase commitments:

- The design conforms to SCU at the intended `Mainnet` deployment point.
- The design accommodates future Daml schema upgrades with upgrade definitions and migration paths consistent with SCU patterns established by CIP-0104 and the Splice contributor framework.
- The design identifies which upgrades will require SV governance vote (locking lifecycle or weight calculations) vs. standard Splice contributor practice (minor schema upgrades).

## Milestones and Deliverables

### M1: Technical Design + Splice Maintainer Sign-Off

**Timeline:** Months 1–3

**Focus:** Produce a technical design doc, a complete implementation plan, and an initial draft Daml model that together satisfy the WG functional requirements within Splice architecture and win maintainer buy-in.

**Deliverables:**

- Design doc specifying: `splice-api-*` interface package surface, contract templates, trigger topology, authorization model, multi-custody aggregation approach, Phase 1-to-2 migration path, implementation path decisions and refinement, devnet/testnet strategy
- Interface package specification reviewed by Splice maintainers
- Draft Daml PR with core locking primitive templates and passing unit tests
- Community review allowing WG members to review design doc and provide input before finalization
- SV alignment workshop with representative cross-section of custody profiles
- Governance vote scope defined for the eventual Mainnet deployment (executed under the Implementation Phase proposal)

**Acceptance criteria:**

- Written sign-off from DA Splice team on the design doc
- Community review completed (WG member feedback addressed or documented)
- Unit tests passing in CI for the M1 Daml PR

**Estimated amount:** 2,000,000 CC

## Funding

| Line item                               | Amount           |
| --------------------------------------- | ---------------- |
| M1 — Technical design + Splice sign-off | 2,000,000 CC     |
| **Total**                               | **2,000,000 CC** |

Of the total, the following amount is allocated to a contributing party:

- **Digital Asset:** 150,000 CC — scoped for Splice maintainer design review during M1

Obsidian takes ownership of driving the design to completion; no additional design obligation on DA in exchange for this payment.

**Payment schedule:** Paid on milestone acceptance.

**Volatility structure:** Fixed Canton Coin denomination throughout. Volatility stipulation: re-evaluation at 6-month mark per CIP-100 guidelines.

**Licensing:** All deliverables released under Splice's contribution license (Apache 2.0), consistent with CIP-0104.

**Co-marketing:** Obsidian and the Canton Foundation jointly announce delivery of the milestone through standard Splice contributor channels.

A note on maintenance: this proposal funds design only and does not carry a maintenance obligation. The maintenance plan for the on-chain enforcement deliverables (in-build maintenance, post-Mainnet ownership, and long-run stewardship) is scoped under the follow-on Implementation Phase proposal.

## Why Obsidian Systems

- **Active Splice contributor.** Obsidian is delivering CIP-0104 and works actively with DA's Splice engineering team. Obsidian's Divam Narula is co-author on PR #107 (Traffic-Based App Rewards) alongside Wayne Collier and a member of the Splice core contributors group.
- **Working group coordination.** Obsidian has been coordinating with the CIP-0105 Working Group since its formation. Avro proposed Obsidian as implementation lead; Helix agreed and scoped their areas of interest. The WG has converged on Obsidian leading development.
- **Canton Foundation governance presence.** Obsidian sits on the Canton Foundation board; Obsidian holds active seats on several Canton Network committees.
- **Proven implementation partner.** Trusted by prominent network participants as an end-to-end implementation partner for demanding Canton deployments, solving both organizational and technical problems.
- **Super Validator.** Obsidian operates a Super Validator and is subject to CIP-0105 enforcement — structural alignment between governance accountability and implementation quality.

## Team

| Phase           | Composition                      |
| --------------- | -------------------------------- |
| M1 (Months 1–3) | Senior Daml engineer + architect |

## Relationship to Implementation Phase Proposal

This Design Phase proposal is the first of a two-proposal sequence covering CIP-0105 Phase 2 and CIP-0116 on-chain enforcement. The follow-on proposal, **CIP-0105 and CIP-0116 Implementation: On-Chain Enforcement Through Mainnet Deployment**, covers what was previously framed as M2–M5 (renumbered as M1–M4 within that proposal):

- Contract Suite + Governance Foundations
- Automations + Observability + Compliance (with CIP-0116 FA-specific work as baseline scope, not optional)
- Mainnet Deployment (governance-vote gated)
- Six-Month Post-Mainnet Ownership

The Implementation Phase proposal will not begin until this Design Phase proposal completes and the Splice maintainer team has provided written sign-off on the design and initial Daml model. This sequencing addresses two specific concerns raised by the Splice maintainer team: (1) the risk of deployed Daml contradicting the approved CIP, and (2) milestone pressure forcing suboptimal implementation choices.

## References

- **CIP-0105 specification:** [canton-foundation/cips](https://github.com/canton-foundation/cips/blob/main/cip-0105/cip-0105.md)
- **CIP-0116 specification:** [canton-foundation/cips](https://github.com/canton-foundation/cips/blob/main/cip-0116/cip-0116.md)
- **WG Requirements Document:** [CC Locking Module: Requirements and Implementation Approaches](https://docs.google.com/document/d/13zl8ILEWq6CvSALk2LA79I2rE1PHfni1EFf5ywr-Aik/edit?tab=t.0) (Section A)
- **SV Locking Operational Guidelines:** [canton-foundation/configs](https://github.com/canton-foundation/configs/blob/main/Super%20Validator%20Operational%20Processes/SV-Locking-Process.md)
- **DA Phase 2 Capabilities (Issue #4842):** [canton-network/splice](https://github.com/canton-network/splice/issues/4842)
- **Phase 2 Tracker (Issue #4841):** [canton-network/splice](https://github.com/canton-network/splice/issues/4841)
- **Splice PR #4848 (Helix — lock declarations, delegated locking):** [canton-network/splice](https://github.com/canton-network/splice/pull/4848)
- **Splice PR #4898 (Avro — weight evaluation):** [canton-network/splice](https://github.com/canton-network/splice/pull/4898)
- **PR #107 (precedent):** Traffic-Based App Rewards, co-authored by Wayne Collier and Obsidian's Divam Narula
- **PR #223 (Avro — SV Governance dApp):** [canton-foundation/canton-dev-fund](https://github.com/canton-foundation/canton-dev-fund/pull/223)
- **CIP-0104:** Protocol-level work, Obsidian delivering separately; SCU patterns reused

---

*Updated May 26, 2026. Prepared by Obsidian Systems for Canton Foundation Development Fund Grants Committee review.*
