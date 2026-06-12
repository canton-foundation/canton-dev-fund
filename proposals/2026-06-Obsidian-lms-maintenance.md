
# LMS Maintenance — Renewable Annual Stewardship

**Author:** Frank Gruber  **Status:** Submitted  **Date:** 2026-06-12

## Abstract

Obsidian Systems proposes a renewable annual stewardship grant for the Canton/Daml developer Learning Management System (LMS), transferring operations from Digital Asset to Obsidian with multi-year continuity subject to annual Foundation renewal. Year One covers operating the LMS, evaluating a named platform shortlist and delivering a migration plan, producing release-aligned short courses tied to Daml releases, public quarterly certification reporting, and a transferable runbook. Renewal cadence follows the Daml OSS Maintenance Grant and Splice management grant (PR #47, 1,000,000 CC/month recurring) precedent: Year One review and Year Two renewal proposal at Month 10, Foundation governance review through Month 12, ≥3-year Obsidian commitment subject to renewal approval.

## Objective

The LMS is the public certification surface for the Canton developer ecosystem, operated by Digital Asset outside any grant. It has no committed long-term steward, no published runbook for a successor, and no assessment of the platform's fit for multi-year certification growth. This proposal establishes Obsidian as the Foundation's long-term LMS steward over a renewable annual term.

Year One outcomes:

- Clean handoff from Digital Asset within Month 1, with parallel shadowing and runbook published to a Foundation-accessible repository.
- Platform evaluation across a named shortlist + migration plan delivered to the Foundation.
- Release-aligned short courses produced alongside Daml releases.
- Public quarterly certification reporting to the Foundation and ecosystem.
- Month 10 Year One review and Year Two renewal proposal enabling a Month 12 renewal decision.

## Implementation Mechanics

Stewardship is operational, evaluative, and content-aligned across four areas:

**Day-to-day operations.** User reactivations, coupon issuance, platform health monitoring, certification-pipeline support. Volumes today (per Digital Asset, April 2026) run at single-digit reactivations and coupons per month, growing modestly with new course releases under the Daml Training grant.

**Platform evaluation (Year One only).** Obsidian evaluates alternatives to TalentLMS across a named three platform shortlist plus three cost-and-fit comparators. TalentLMS's per-seat pricing penalizes a developer population that goes inactive and reactivates on its own cadence, forcing recurring account cleanup.

| Rank | Platform | Pricing model | Why on shortlist |
|---|---|---|---|
| 1 | Open edX (self-hosted via Tutor) | Self-host infrastructure + ops labor; no per-learner license | Open-source, stewarded by Axim Collaborative (Harvard/MIT nonprofit). IBM Developer Skills Network precedent. Structural fit for Foundation open-stewardship ethos. |
| 2 | Skilljar (by Gainsight) | Annual platform fee + MAU tiers | Institutional-grade SaaS reference for developer certification. AWS, Stripe, Twilio installed base. |
| 3 | Intellum | Active-learner subscription, enterprise tier | Reference customers Meta, Google, Pinterest. Multi-audience future-proofing. |
| Comparator | Thought Industries | Active-learner subscription, tiered | Feature comparator (native certification, ILT/vILT). |
| Comparator | LearnUpon | Transaction-based, registered-user tiers | Mid-market developer-certification comparable; transaction-based pricing avoids the active-user account-cleanup churn. |
| Comparator | Docebo | Enterprise SaaS, MAU tiers | Enterprise-scale comparator with strong external-learning installed base. |

Pricing-model axis: transaction-based and flat-tier pricing avoid the active user account cleanup churn. The Year One evaluation tests both pricing structures across the shortlist on total cost of operation over a multi-year horizon.

**Release-aligned short courses.** A short explainer course alongside each Daml release posted to the LMS. Cadence assumed at 4–6 releases per year; depth scoped to a brief "what's new" explainer.

**Reporting and governance.** Monthly internal ops metrics to the CF liaison; public quarterly certification reports; Year One operational review and Year Two renewal proposal at Month 10; Foundation governance review window Months 10–12.

**Team.** Ops Owner (~0.25 FTE Year One; ~0.15 FTE renewal years): daily operations, monthly/quarterly reporting, platform evaluation, renewal proposal preparation. Content Liaison (~0.1 FTE, shared with Daml Training grant): coordinates release-aligned short courses.

## Milestones

| M | Deliverable | Timeline | Amount (CC) |
|---|---|---|---|
| M1 | Credential and access transfer from DA initiated; runbook drafting underway; parallel shadowing underway (paced to DA's handoff); first monthly ops report; platform evaluation initiated against the named shortlist. | Month 1 | 100,000 |
| M2 | Runbook published to Foundation-accessible repository and parallel shadowing complete; steady-state operations engaged; first and second public quarterly certification reports (Months 3, 6); platform evaluation and migration plan delivered to the Foundation; release-aligned short courses produced for Daml releases shipping in period. | Months 2–6 | 150,000 |
| M3 | Steady-state operations continuing; third public quarterly certification report (Month 9); release-aligned short courses continue; Foundation feedback from earlier milestones incorporated. | Months 7–9 | 100,000 |
| M4 | Year One operational review document; Year Two renewal proposal submitted Month 10; Foundation governance review window Months 10–12; renewal decision at Month 12; fourth public quarterly certification report; final monthly ops report. | Months 10–12 | 150,000 |
| **Total** | | ~12 months | **500,000 CC** |

## Acceptance Criteria

Each deliverable is accepted when it meets the standard below:

- Runbook is sufficient for a successor steward to operate the LMS unaided (transferability test, verified on publication)
- Each quarterly certification report follows the Foundation-confirmed format and is published by its due date.
- Operational requests (reactivations, coupons, health issues) resolved within the agreed response target.
- Platform evaluation delivers a comparison of viable platform options on cost and fit, and Obsidian's selected platform.
- Release-aligned short courses produced in line with the Daml release cadence.
- Year One operational review and Year Two renewal proposal delivered by Month 10, sized on actual operational data.

## Budget

Year One ask: 500,000 CC. Year One carries one-time scope (platform evaluation, migration plan, runbook authoring, parallel shadowing, ramp on release courses) on top of steady-state operations. Renewal years step down to ops-only scope; the Year Two renewal CC ask is set in the Month 10 renewal proposal based on actual Year One operational data. Cost buildup reflects the staffing in Implementation Mechanics plus platform/tooling overhead.

## Constraints + Limitations

External dependencies affecting milestone timing:

- **DA cooperation during handoff.** Month 1 assumes cooperative handoff (credential transfer, parallel shadowing, in-flight inventory). If materially delayed, deliverables shift accordingly and are not held against operational targets.
- **Foundation liaison cadence.** Quarterly report formats, monthly ops channels, and renewal review windows depend on Foundation responsiveness.
- **Daml Training grant cadence.** Release-aligned short courses depend on the Daml Training team producing release notes and curriculum hooks.
- **Platform vendor changes.** Vendor outages, product changes, and pricing changes remain the vendor's responsibility per the vendor's SLA.
- **Volume assumptions.** Modest growth absorbed within proposed FTE. If sustained volume exceeds 2x current baseline, scope and CC ask adjusted at the next renewal boundary.

## Architectural Alignment

- **Renewable stewardship of public Canton infrastructure.** Follows Daml OSS Maintenance Grant (PR #67 reference) and Splice management grant (PR #47, 1,000,000 CC/month recurring) precedent.
- **Foundation priority alignment.** Stewardship of public Canton developer infrastructure — stability, maintainability, and operational simplicity.
- **Continuity with the Daml Training grant** (approved, started 2026-04-20). Complementary, single accountable owner of the developer education stack.
- **Quarterly certification transparency.** Operationalizes the April 2026 quarterly certification reporting requirement.
- **Open-licensed, transferable artifacts.** Runbook, metrics and report templates, platform evaluation, migration plan, and Year One review released under Apache 2.0 or equivalent. Obsidian asserts no proprietary claim, and all artifacts transfer to any future steward.

No Canton protocol, Daml language, or application-level changes. No Daml contracts produced or modified; SCU compatibility therefore not applicable.

## Motivation

The Daml LMS has grown into shared Canton developer infrastructure. As the Daml 3 Training grant ramps, new modules and certification tracks will land on it over the coming quarters, increasing volume and operational surface. A quarterly certification reporting requirement was introduced in April 2026 without a dedicated operational owner, and the current platform's fit for multi-year certification at scale is itself an open question (addressed by the Year One platform evaluation). As this infrastructure scales, it benefits from durable, Foundation-aligned stewardship under a single accountable owner rather than remaining informally operated without a committed long-term steward. Establishing that stewardship now, while volumes are still modest, is materially less expensive than after the program scales.

## Rationale

A renewable annual structure fits operational stewardship better than a multi-year fixed-term grant. Operational stewardship is recurring, but the Foundation is best served by reviewing it annually with operational data in hand. The renewable structure forces an explicit renewal conversation against actual volumes, target-window performance, ecosystem feedback, and platform changes. This follows Foundation precedent (Daml OSS Maintenance Grant; Splice management grant PR #47).

The proposal names the candidate platforms at submission rather than revealing them only during the Year One evaluation, so the Foundation sees the evaluation's full scope up front. The Year One deliverable is a comparison matrix and migration plan. Obsidian selects the platform, with migration execution scoped to a renewal year. The Foundation is kept informed of recurring cost implications.

LMS operations are scoped separately from training content development. Content development is project-shaped (modules, capstones, exams). LMS operations are continuous (response performance, monthly reporting, quarterly certification reporting, platform stewardship). Bundling obscures both and ties renewal of either to the other.

## Design Alternatives

- **Status quo (informal continuation).** No institutional steward, no dedicated quarterly report owner, no durable operational accountability as volume grows.
- **Foundation hires staff directly.** Inconsistent with Foundation operational model (Foundation funds work, does not operate services).
- **Bundle into Daml Training grant.** Mixes project-shaped content with continuous ops, blurs accountability.
- **Distributed stewardship across multiple contributors.** Fragments accountability, re-creates the no clear owner state.
- **One-shot fixed-term grant.** Does not match recurring shape, no renewal cadence governance review.
- **Pre-commit to a replacement platform now.** Locks in choice without operational data or TCO modeling.

## Assumptions

- LMS account governance (Foundation-owned or Obsidian-owned on the Foundation's behalf) resolved prior to grant start.
- 4–6 Daml release cadence per year, each as a brief explainer rather than a full updated certification module.
- Continuous access to platform admin, certification system of record, and vendor support channels required to operate at the targets proposed.
- Certification records, user account data, and any PII remain under Foundation governance throughout this grant and any successor arrangement.

## Why Obsidian Systems

Obsidian is building the Daml 3 Training program (approved, started 2026-04-20). The team operating the platform is the team producing the content that flows through it. Ryan Trinkle on the Canton Foundation board; Obsidian holds active seats on five Canton Network committees. Active Canton delivery on the DTCC program (via Digital Asset) and B3 (Brazil's national exchange). Active Splice contributor (CIP-0104 delivery; Divam Narula co-authored PR #107 with Wayne Collier). Multi-year stewardship commitment (≥3 years subject to renewal approval).

## Out of Scope

- Curriculum development, module updates, certification exam authoring (covered under Daml 3 Training grant).
- Migration execution beyond the Year One migration plan.
- Translation/localization of LMS interface or training content.
- Certification exam proctoring beyond platform-native.
- Instructor-led or live-cohort training delivery.
- Vendor-side product fixes (escalated per vendor SLA; product-level fixes remain the vendor's responsibility).

## Co-Marketing

Public announcement of the LMS stewardship transition; quarterly publication of the certification report through Foundation channels and Obsidian's developer community channels; annual publication of the Year One operational review and Year Two renewal proposal; coordinated announcement of release-aligned short courses alongside Daml releases.

## References

- **Daml OSS Maintenance Grant.** Referenced in PR #67 (PQS); dedicated CF maintenance vehicle; structural precedent for renewable stewardship.
- **Splice management grant (PR #47).** Digital Asset, 1,000,000 CC/month recurring; structural precedent for recurring stewardship of public Canton infrastructure.
- **Daml Training grant (approved, started 2026-04-20).** Complementary content grant.
- **CIP-0082.** Establish 5% Development Fund; funding vehicle.
- **PR #107 (Traffic-Based App Rewards).** Format precedent; co-authored by Wayne Collier and Obsidian's Divam Narula.

---

*Submitted by Obsidian Systems for consideration by the Canton Foundation Development Fund Grants Committee.*
