# CIP-0105 and CIP-0116 Implementation: On-Chain Enforcement Through Mainnet Deployment

**Author:** Obsidian Systems LLC  
**Status:** Draft  
**Created:** 2026-05-26  
**Implements:** CIP-0105 and CIP-0116
**Champion:** Ali Abrar @ali-abrar

---

## Relationship to Design Phase Proposal

This proposal is the second of a two-proposal sequence covering CIP-0105 Phase 2 and CIP-0116 on-chain enforcement. The first, **CIP-0105 Implementation: Phase 2 Design + Initial Daml Model** (the "Design Phase" proposal), funds production of a technical design doc and an initial draft Daml model, leading to written sign-off from the Splice maintainer team.

This Implementation Phase proposal cannot begin until the Design Phase proposal completes and the Splice maintainer team has provided written sign-off on the design and initial Daml model. The milestone schedule, acceptance criteria, and team plan in this proposal are predicated on that design having been settled.

This sequencing addresses two specific concerns raised by the Splice maintainer team: (1) the risk of deployed Daml contradicting the approved CIP, and (2) milestone pressure forcing suboptimal implementation choices. With the design and initial Daml model settled under the Design Phase proposal, this Implementation Phase proposal commits to implementation, Mainnet deployment, and post-Mainnet ownership against a known technical baseline.

## Abstract

CIP-0105 was approved on March 2, 2026 and CIP-0116 (Featured App Locking) was approved on May 20, 2026. Phase 1 of CIP-0105 (off-chain transitional enforcement) is active. Phase 2 (on-chain enforcement) for CIP-0105 and the on-chain locking enforcement for CIP-0116 both remain unimplemented.

The CIP-0105 Working Group has produced a comprehensive functional requirements document (Section A) covering the CC Locking Primitive needed by both CIP-0105 (SV Locking) and CIP-0116 (Featured App Locking). These requirements define the state model, authorization model, tier evaluation, lock substitution, and observability functionality. A CIP memorializing these requirements is in draft and is expected to be submitted on the week of May 25, 2026.

This proposal funds Obsidian Systems to build, deploy, and maintain the Phase 2 on-chain enforcement layer for both CIP-0105 and CIP-0116 as a Splice contribution, satisfying the Working Group's functional requirements. The work is based on the technical design and initial Daml model delivered under the Design Phase proposal. Obsidian will lead development and own delivery outcomes; Working Group members who have active contributions will receive part of the allocation of this grant.

## Motivation

CIP-0105 establishes the framework by which Super Validators cryptographically commit to Canton through locked capital. Without on-chain enforcement, four problems persist:

- **Replace reputation-based trust with cryptographic proof.** Phase 1 tracks SV lock status via spreadsheets and off-chain disclosures. Standing is asserted rather than proven. The CIP's core thesis of publicly observable, cryptographically enforced validator commitment cannot be satisfied without on-chain contracts.

- **Eliminate manual disclosure and off-chain verification.** SVs self-report locked positions across self-custody wallets, custodians, and third-party providers and DA manually reconciles. The arrangement is operationally brittle, does not scale, and creates credibility risk when institutions evaluate Canton as production infrastructure.

- **Make validator commitment publicly observable and enforceable.** SV weight in governance and traffic rewards does not automatically reflect lock status. A validator below tier threshold continues to receive full weight until DA intervenes manually. Phase 2 closes this gap with automatic weight adjustment, a defined cure period, and permanent removal of excess weight on cure expiry.

- **Reduce centralized governance overhead.** Phase 1 enforcement does not scale as the SV set grows. Phase 2 moves enforcement to the protocol layer, decentralizing operational governance load consistent with Canton Foundation direction for Splice.

CIP-0116 introduces objective on-chain criteria for Featured App designation, replacing manual Foundation governance with on-chain verifiable commitment. This resolves the same manual verification problems as SV locking Phase 1 but in the Featured App locking context. CIP-0116 shares the underlying CC Locking primitive with CIP-0105 Phase 2, which is why a single implementation effort covers both.

## Specification

### Functional Requirements

This proposal implements the functional requirements defined by the CIP-0105 Working Group (Section A) along with CIP-0116-specific requirements, with allowance made for modifications made as part of the passage process in the forthcoming locking CIP. The Working Group requirements are the product of community input from Helix Labs, Avro Digital, Cashen, Obsidian Systems, and Digital Asset, with endorsement from Wayne Collier (DA).

The requirements below are traced to five sources beyond the CIPs themselves:

- **DA Phase 2 Capabilities**: Wayne Collier (DA) decomposed CIP-0105 Phase 2 into [six implementation capabilities](https://github.com/canton-network/splice/issues/4842) — lock declarations, mutual enforcement, weight evaluation, delegated locking, explicit unlocking state, and vesting enforcement.
- **WG Document**: The Working Group's [CC Locking Module: Requirements and Implementation Approaches](https://docs.google.com/document/d/13zl8ILEWq6CvSALk2LA79I2rE1PHfni1EFf5ywr-Aik/edit?tab=t.0) (Section A requirements).
- **Issue #4841 Discussion**: An [extended community discussion](https://github.com/canton-network/splice/issues/4841) on the Phase 2 capability set, with contributions from Helix Labs, Cashen, Avro Digital, and Digital Asset.
- **Splice PR #4848** (Helix): [Locking declarations and delegated locking](https://github.com/canton-network/splice/pull/4848) — capabilities #1 and #4.
- **Splice PR #4898** (Avro): [Lock-derived SV weight evaluation](https://github.com/canton-network/splice/pull/4898) — capability #3.

These sources inform the tables below. The first table covers shared CC Locking primitive requirements (CIP-0105 and CIP-0116 both); the second table covers CIP-0116-specific Featured App requirements layered on top.

#### Shared CC Locking Primitive Requirements

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

#### CIP-0116-Specific Featured App Requirements

| Requirement                                        | CIP-0116                                             | WG Doc       | Notes                                           |
| -------------------------------------------------- | ---------------------------------------------------- | ------------ | ----------------------------------------------- |
| Non-Issuer FA locking: 5,000,000 CC per PartyId    | §2.1                                                 | A.1.4, A.2.2 | Fixed threshold (not percentage-based like SV)  |
| Asset Issuer FA locking: 25,000,000 CC per PartyId | §2.1                                                 | A.1.4, A.2.2 | Higher tier for issuers                         |
| 60-day vest period (1/60 per day)                  | §2.1                                                 | A.1.4        | Shorter than SV's 365.25-day vest               |
| Continuous enforcement                             | §3 "must be satisfied continuously"                  | A.4.2        | Same per-round cadence as SV                    |
| Immediate FA status removal on breach              | §3 "immediately removed"                             | —            | No cure period (unlike SV's 7-day/30-day model) |
| Rapid-response SV unfeaturing process              | §3 "within 30 minutes"                               | —            | SVs must respond to unfeature proposals rapidly |
| Lock-gated voting for new FAs                      | §2.2 "vote gated on proving sufficient locked token" | —            | On-chain vote requires proof of lock            |
| Existing FA 30-day compliance window               | §2.3 "30 days from CIP approval"                     | —            | Deadline ~June 19, 2026                         |
| PartyId separation enforcement                     | §2.4                                                 | —            | Foundation enforces proper separation           |
| FA beneficiary type distinction                    | —                                                    | A.2.2        | Shared primitive, different evaluation rules    |
| Governance-updatable thresholds and durations      | §4                                                   | —            | Via SV vote with public notice                  |

In total, this proposal covers the full end-to-end locking lifecycle for both SV and FA beneficiaries: from lock creation and delegated locking, through continuous weight evaluation and enforcement, to vesting, unlock, and withdrawal. This proposal includes the atomic Lock Substitution primitive needed for lender swaps, the authorization model for custodial and multi-party arrangements, the observability surface for compliance dashboards, and the Phase 1 to Phase 2 migration path. DA's Phase 2 capabilities and all finalized WG Section A requirements are in scope, alongside the CIP-0116 Featured App-specific requirements.

### Architectural Direction

The technical design produced under the Design Phase proposal governs this implementation. The following architectural commitments — settled by that design — apply:

**Interface package first.** The `splice-api-*` interface package is designed before `splice-dso-governance` implementation. Wallet operators and custodians must not depend on core Splice packages. Depending on technical feedback and feasibility, Obsidian will incorporate parts of the existing Splice PRs (#4848, #4898), which were implemented directly in `DsoRules` and require additional work to bring to conclusion.

**`ExternalPartyAmuletRules` pattern.** The locking primitive is an external-party interaction — holders lock, unlock, substitute, and withdraw CC from their own wallets. The implementation follows the `ExternalPartyAmuletRules` pattern established in Splice.

**Parameterized for SV and FA.** The primitive supports both SV locking (365.25-day vest, multi-tier percentage thresholds, 7-day/30-day cure) and FA locking (60-day vest, fixed CC threshold, immediate removal) through configuration rather than separate contracts. FA-specific workflows are delivered as baseline scope within the milestones below.

**Prior Work.** Two Splice PRs exist ([#4848](https://github.com/canton-network/splice/pull/4848) by Helix, [#4898](https://github.com/canton-network/splice/pull/4898) by Avro). Both made valuable contributions to the requirements process. We will work to align them with the interface-package-first architecture either via updates or incorporation. This proposal takes an approach informed by those contributions but may not necessarily build directly on top of them. Obsidian will take ownership of driving the functionality in those PRs to completion.

### Existing Work and Working Group Contributions

| Work                                                                                                                                 | Relationship                                                                                                                       |
| ------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| [Splice PR #4848](https://github.com/canton-network/splice/pull/4848) (Helix — lock declarations, delegated locking)                 | Obsidian takes ownership of driving to completion; 150,000 CC allocated from this grant                                            |
| [Splice PR #4898](https://github.com/canton-network/splice/pull/4898) (Avro — weight evaluation)                                     | Obsidian takes ownership of driving to completion; 150,000 CC allocated from this grant                                            |
| [WG Requirements Document](https://docs.google.com/document/d/13zl8ILEWq6CvSALk2LA79I2rE1PHfni1EFf5ywr-Aik/edit?tab=t.0) (Section A) | Adopted as functional requirements basis                                                                                           |
| Forthcoming Locking CIP                                                                                                              | Obsidian to implement this CIP as passed/updated and fall back to WG document if CIP is not passed within implementation timeframe |
| [Issue #4841](https://github.com/canton-network/splice/issues/4841) community discussion                                             | Community requirements (Helix, Cashen, Avro) incorporated into featureset                                                          |
| Helix ComplianceVault (Catalyst MainNet)                                                                                             | Product reference for compliance compute and dashboard patterns                                                                    |
| [PR #223](https://github.com/canton-foundation/canton-dev-fund/pull/223) (Avro — SV Governance dApp)                                 | This is complementary work focusing on UI/UX rather than on-chain enforcement, for which integration points are defined in design. |

### Backward Compatibility and SCU Compatibility

New Daml contracts and SV-app-side automation. No Canton protocol changes are required.

All contracts are subject to Smart Contract Upgrade (SCU) compatibility as the Daml schema evolves. Obsidian's commitments:

- All contracts conform to SCU at `Mainnet` deployment.
- Future Daml schema upgrades are accompanied by upgrade definitions and migration paths consistent with SCU patterns established by CIP-0104 and the Splice contributor framework.
- Upgrades affecting the locking lifecycle or weight calculations require SV governance vote; minor schema upgrades follow standard Splice contributor practice.

## Milestones and Deliverables

### M1 — Contract Suite + Governance Foundations

**Timeline:** Months 1–2  
**Focus:** Full contract suite implementing the WG Section A requirements; governance automation foundations in place.

**Deliverables:**

- All Daml templates, services, and choices implementing Section A requirements (state model, beneficiary attribution, authorization model, Lock Substitution, vesting)
- Multi-custody aggregation functional against representative custody profiles
- Penalty enforcement state machine (breach -> 7-day removal -> 30-day cure -> permanent penalty) with explicit state transitions and test coverage
- Governance automation stubs: scan APIs, trigger interfaces ready for M2
- SCU compatibility verified
- dryRun mode functional for pre-deployment validation

**Acceptance criteria:**

- Test coverage meets Splice contribution standards
- Governance automation stubs reviewed by DA Splice team, which gates M2 entry

**Estimated amount:** 1,500,000 CC

### M2 — Governance Automations + Observability + Compliance (with CIP-0116 FA Work)

**Timeline:** Months 3–4  
**Focus:** Automation, observability, and compliance surfaces making the M1 contract suite usable in operations; CIP-0116 FA-specific work delivered as baseline scope.

**Deliverables:**

- Continuous weight evaluation trigger (replaces Phase 1 weekly off-chain process)
- Under-lock penalty trigger, cure countdown automation, threshold monitoring
- Observability layer: state-transition events, LockContext lifecycle events, historical aggregate queries (per WG A.6)
- Compliance dashboard (per-SV lock status, tier standing, weight impact, vesting projection, cure-period countdown)
- Dashboard query patterns designed for external consumers (Helix, CC View, Lighthouse)
- CIP-0116 FA-specific threshold evaluation, breach lifecycle (immediate removal), FA beneficiary registration, lock-gated voting workflow, existing FA migration

**Acceptance criteria:**

- Automations live on devnet with end-to-end test coverage (breach, cure, permanent penalty, substitution)
- Compliance dashboard reviewed by SV representatives and DA governance staff
- Observability surface validated against Phase 1 Live Metrics requirements

**Estimated amount:** 2,500,000 CC

### M3 — Mainnet Deployment (Governance-Vote Gated)

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

### M4 — Six-Month Post-Mainnet Ownership

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

| Line item                                              | Amount           |
| ------------------------------------------------------ | ---------------- |
| M1 — Contract suite + governance foundations           | 1,500,000 CC     |
| M2 — Automations + observability + compliance (incl. CIP-0116 FA work) | 2,500,000 CC     |
| M3 — Mainnet deployment                                | 500,000 CC       |
| M4 — Post-Mainnet ownership (6 months)                 | 1,000,000 CC     |
| **Base total (CIP-0105 + CIP-0116)**                   | **5,500,000 CC** |
| Early completion bonus (M2 accepted by end of month 3) | 1,000,000 CC     |
| **Total with bonus**                                   | **6,500,000 CC** |

Of the base total, the following amounts are allocated to contributing parties:

- **Helix Labs:** 150,000 CC — recognition of Working Group contributions, ComplianceVault product reference, and existing Splice PR #4848
- **Avro Digital:** 150,000 CC — recognition of Working Group organization, Issue #4841 tracker, and existing Splice PR #4898
- **Digital Asset:** 150,000 CC — scoped for SV node debugging access during M2/M3 and SV coordination support

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
  - **Maintenance absorbed by an existing or future Splice maintenance arrangement** — if alignment with DA and the Foundation exists at M4 close and maintenance load is modest, no incremental CIP-105 funding may be required.  
  - **Separate stewardship CIP** — a renewable annual stewardship grant sized to actual observed maintenance load.  
  - **Refresh proposal** — a one-shot proposal for a specific protocol-evolution refresh, if maintenance is bounded and episodic rather than continuous.

The long-run path is recommended in the M4 end-of-period report based on operational data from the first six months of Mainnet.

Long-run scope must also account for framework auto-termination, which the spec mandates 30 days after the late 2029 halving. At termination, the on-chain enforcement contracts wind down. The wind-down deliverable is a candidate for the post-Mainnet refresh proposal path noted above.

## Why Obsidian Systems

- **Active Splice contributor.** Obsidian is delivering CIP-0104 and works actively with DA's Splice engineering team. Obsidian's Divam Narula is co-author on PR #107 (Traffic-Based App Rewards) alongside Wayne Collier and a member of the Splice core contributors group.
- **Working group coordination.** Obsidian has been coordinating with the CIP-0105 Working Group since its formation. Avro proposed Obsidian as implementation lead; Helix agreed and scoped their areas of interest. The WG has converged on Obsidian leading development.
- **Canton Foundation governance presence.** Obsidian sits on the Canton Foundation board; Obsidian holds active seats on several Canton Network committees.
- **Proven implementation partner.** Trusted by prominent network participants as an end-to-end implementation partner for demanding Canton deployments, solving both organizational and technical problems.
- **Super Validator.** Obsidian operates a Super Validator and is subject to CIP-0105 enforcement — structural alignment between governance accountability and implementation quality.

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

*Drafted May 26, 2026. Prepared by Obsidian Systems for Canton Foundation Development Fund Grants Committee review.*
