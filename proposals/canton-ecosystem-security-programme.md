# Development Fund Proposal: Canton Ecosystem Security Programme
**Author:** Eamonn (Founder, Procur3) (info@procur3.io)
**Status:** submitted
**Created:** 2026-05-26
**Updated:** 2026-07-28
**Champion:** _[Tech & Ops Committee member organisation — to confirm]_
**Website:** https://procur3.io
**Twitter:** https://x.com/procur3

---

## Abstract

This proposal establishes the **Canton Ecosystem Security Programme** — a pilot audit-subsidy programme that removes audit cost as a launch barrier for teams building on Canton, built on a framework the Foundation owns permanently.

The proposal is deliberately separated into three layers so incentives are legible:

1. **An exclusive $500,000 ecosystem audit subsidy fund** covering up to **70% of audit cost** for qualifying Canton builders. This capital is held and disbursed by the Foundation, paid directly to auditors, and is never held or touched by Procur3.
2. **A Canton-owned programme framework** — auditor whitelist criteria, application and review workflow, project scoring rubric, cohort process, and reporting templates. Procur3 designs, builds, and validates it live on the pilot cohort, then transfers it to the Foundation. This is the durable public good.
3. **Free Procur3 marketplace access for the entire Canton ecosystem** — RFP posting, competitive quoting, and vendor due diligence, extended to every Canton builder at no cost, with optional paid upgrades for teams that want them.

Procur3 charges a fixed operator fee of **(405,405 CC)** to build the framework, onboard firms and projects, run the pilot cohort, and transfer the framework to the Foundation. Procur3 takes **no percentage of the subsidy fund and no commission on subsidised audits**.

All programme methodology, criteria, and documentation are transferred to the Foundation at pilot completion and may be operated independently or continued with Procur3 thereafter. The primary public good is a **reusable, open security programme framework** that removes the cost barrier preventing serious teams from deploying on Canton — directly driving protocol adoption, developer activity, and on-chain user growth. The pilot targets **10+ completed subsidised audits**.

---

## Motivation

Security audit costs are one of the most consistent barriers preventing serious teams from building on or expanding to a new chain, and audit coordination is a recurring operational cost for the Foundation.

**Cost.** A quality audit for a Daml-based application runs **$15,000–$80,000** depending on codebase complexity, with an average Canton deal size of approximately **$25,000** based on live Procur3 quote data. For early-stage teams this cost is often the deciding factor between deploying on Canton and choosing a chain where the financial burden is lower or subsidised.

**Coordination.** Even where budget exists, running audits ad hoc means sourcing firms, comparing quotes, verifying competence, scoping, tracking delivery, and reporting outcomes — once per project, every time. A framework the Foundation owns solves this permanently.

**This is not a hypothetical concern.** Procur3 has supported 100+ protocol teams across numerous blockchains to search, compare, and procure their security needs from vetted audit firms. The marketplace was built to foster competition between audit firms and drive down the cost of security reviews by up to 40%. Procur3 has worked with Parth (ecosystem BD Director, Canton Foundation) to import and onboard existing Daml security audit firms, and is **already supporting live teams building on Canton, including Mystic Finance and TermMax**, with additional teams preparing to post pre-launch RFPs. This demonstrates clear, present demand from Canton builders. The programme is demand-led, not speculatively supplied.

---

## Specification

### 1. Objective

Deliver a pilot of the Canton Ecosystem Security Programme that:

- Subsidises up to **70% of qualifying audit costs** for Canton projects, with a minimum **30% co-pay** from projects to ensure genuine commitment and filter out low-quality demand.
- Produces an **open, reusable programme framework** — auditor whitelist criteria, application forms, review process, scoring rubric, milestone tracking, and reporting templates — fully transferable to the Foundation at pilot end.
- Extends **free Procur3 marketplace access** to every Canton builder for security RFP posting, competitive quoting, and vendor due diligence beyond smart contract security.
- Drives measurable increases in Canton protocol deployments and on-chain activity by removing the security cost barrier at the earliest builder decision point.
- Delivers a **data-backed scaling recommendation** at pilot end for the Foundation's forward planning.

### 2. Technical Approach

**Programme infrastructure built by Procur3.** The Procur3 platform is adapted for the Canton programme across four workstreams:

- **Application and intake system.** A dedicated Canton programme intake form is built on the Procur3 platform with Canton-specific fields: Daml version and architecture details, Canton participant configuration, TVL projections, funding history, and team on-chain track record. The form outputs a structured application packet for review-committee evaluation.
- **Review committee workflow.** Using the Foundation's existing grant-review workflow, standardised security templates are populated by project founders with Procur3's support for review by the committee.
- **Auditor whitelisting system.** A Canton-specific auditor capability registry is built on Procur3, tracking Daml audit experience, Canton participant deployment experience, and availability. Auditor-project matching is done by the project prior to grant submission.
- **Milestone tracking and disbursement recommendation.** Procur3 tracks audit progress against defined milestones (kickoff, mid-review, final report). At each milestone, Procur3 generates a disbursement recommendation for the Foundation. The Foundation disburses directly to the auditing firm; **Procur3 holds no funds**.

**Auditor whitelist criteria (open, published):**

- Demonstrated track record of completed audits on DLT or enterprise blockchain infrastructure (minimum 3 published reports).
- Demonstrated track record on protocol types anticipated to apply for the subsidy (e.g., borrowing/lending protocols, stablecoin issuers).
- Daml or Canton smart contract environment experience, or a documented upskilling path within the pilot period.
- Clean conflict-of-interest declaration relative to Canton ecosystem projects.
- Published audit reports available for public review.

All criteria are published openly. Any firm meeting the criteria can apply to join the whitelist.

**Proposed security subsidy tiers (70% coverage):**

| Tier      | Audit cost range | Foundation covers (70%) | Project co-pay (min 30%) | Target profile                           |
|-----------|------------------|-------------------------|--------------------------|------------------------------------------|
| Seed      | Up to $15,000    | Up to $10,500           | From $4,500              | Pre-launch, early architecture           |
| Growth    | $15,000–$40,000  | Up to $28,000           | From $4,500              | Live or imminent deployment              |
| Strategic | $40,000–$80,000  | Up to $56,000           | From $12,000             | High TVL potential, complex architecture |

Per-project subsidy is capped so the fund spreads across many teams rather than concentrating in a few. Tier placement is recommended by Procur3 based on submitted application materials and approved by the Foundation's review committee.

### 3. Architectural Alignment

Canton is differentiated by its institutional-grade privacy model, Daml smart contract language, and privacy-first participant architecture. These properties make it attractive for financial services, regulated industries, and high-stakes applications — precisely the contexts where security audit rigour is non-negotiable and audit costs are most likely to be a deployment barrier.

The programme reflects this. Auditor whitelist criteria specifically require **Daml and Canton experience (or a documented upskilling path)** rather than accepting EVM-based audit credentials as equivalent. Application intake captures Canton-specific architecture details that generic security grant programmes do not address.

The programme also supports the Foundation's role as a neutral facilitator. Procur3 sits between the Foundation and individual auditors as the operational layer, carrying relationship management and quality oversight, while the **Foundation retains approval authority** on all programme parameters, auditor whitelist changes, and individual project approvals. Final approval of which projects receive subsidy sits with a Foundation-side review committee, guided by the scoring rubric; Procur3 does not unilaterally decide who receives funds.

### 4. Free Marketplace Access For The Canton Ecosystem

Separately from the framework, Procur3 extends **free access to its marketplace to every Canton builder** as a standing contribution to the ecosystem:

- **RFP posting** — a builder posts an audit requirement once and receives competitive quotes from Procur3's vetted firms.
- **Competitive quoting** — multiple firms bid, surfacing market-rate pricing that typically lands well below single-firm direct engagement.
- **Vendor due diligence** — access to Procur3's vetting on 60+ security firms across 25 ecosystems, so builders are not selecting auditors blind.

This access is how the programme runs efficiently in practice: subsidised audits are sourced and quoted through the marketplace. Teams that want more — continuous coverage mapping, an audit report vault, security-posture tracking, agreements tooling — can upgrade to Procur3's paid tiers. Those upgrades are optional and independent of the subsidy programme. The marketplace is Procur3's product, not a grant deliverable, and is not transferred; the public good Canton owns is the **framework**.

### 5. Backward Compatibility

No backward compatibility impact. The programme is an additive Foundation operation that augments — and does not replace — existing builder support, grant pipelines, or Foundation processes. All artefacts produced (auditor whitelist, intake form, committee workflow, scoring rubric, runbook) are transferred to the Foundation and may be operated independently or continued with Procur3 post-pilot.

---

## Milestones and Deliverables

Each milestone delivers a piece of the transferable framework and proves it on live activity. Funding releases on committee acceptance. The operator fee is split **65% delivery / 35% adoption** — delivery pays for building and handing over the framework; adoption releases only when the programme actually produces audits and onboards teams.

### Milestone 1: Programme Infrastructure and Launch

| Detail | Description |
|--------|-------------|
| **Estimated Delivery** | Month 1 from grant approval |
| **Focus** | Build and launch the programme infrastructure, onboard the initial auditor cohort, announce the programme, and open intake |
| **Funding** | $21,000 (141,892 CC) — delivery only |

**Deliverables:**

- Canton-specific application intake form live on the Procur3 platform, covering all required fields for review-committee evaluation.
- Auditor whitelist criteria published openly; initial Canton-qualified auditor cohort identified, onboarded, and listed.
- Project scoring rubric, programme terms, eligibility criteria, and subsidy tier definitions documented and approved by the Foundation.
- Audit progress tracker live and operational for milestone tracking.
- Free Procur3 marketplace access enabled for Canton builders.
- Programme publicly announced via coordinated launch with the Foundation, approved auditors, and Canton-focused channels.

**Acceptance Criteria:**

- Application intake form accessible at a public URL and confirmed functional by a Foundation reviewer.
- Review committee workflow confirmed by at least one Foundation committee member.
- Auditor whitelist published with a minimum of **5 qualified firms**.
- Public programme announcement live across Procur3 and Foundation channels.

---

### Milestone 2: Active Programme Operations

| Detail | Description |
|--------|-------------|
| **Estimated Delivery** | Months 2–4 from grant approval |
| **Focus** | Active intake, review, and audit engagements; ongoing programme operations and reporting |
| **Funding** | $18,000 (121,622 CC) — $12,000 delivery / $6,000 adoption |

**Deliverables:**

- Live operation of the full framework: intake, scoring, review-committee approval, auditor matching, and subsidy processing.
- Milestone tracking active for all approved engagements, with disbursement recommendations issued to the Foundation on completion of each milestone.
- Community moderation active across Canton builder channels — responding to programme enquiries, surfacing the programme to new teams, and supporting applicants.
- Mid-programme case study featuring an early participant, for Foundation amplification.
- Reporting templates delivered and populated with real cohort data.

**Acceptance Criteria:**

- At least **15 total applications submitted**.
- At least **5 audits approved and in engagement**, confirmed by the Foundation.
- Reporting templates in use and delivered to the Foundation.

---

### Milestone 3: Completion, Knowledge Transfer, and Final Report

| Detail | Description |
|--------|-------------|
| **Estimated Delivery** | Pilot close (months 5-6 from grant approval) |
| **Focus** | Close out the pilot, transfer the full framework to the Foundation, publish findings, and deliver a scaling recommendation |
| **Funding** | $21,000 (141,892 CC) — $6,000 delivery / $15,000 adoption |

**Deliverables:**

- All active audit engagements tracked to completion, with final disbursement recommendations issued.
- **Full programme documentation package transferred to the Foundation:** auditor whitelist criteria, application form specifications, review committee workflow documentation, scoring rubric, milestone tracking methodology, report quality standards, and operational runbook — sufficient for the Foundation to operate the programme independently or continue with Procur3.
- Operational learnings from the cohort folded back into the handed-over framework.
- **Final programme report** covering: total projects audited, total subsidy capital deployed, TVL of participating projects at audit completion, protocol retention on Canton post-audit, auditor performance summary, and builder feedback summary.
- **Scaling recommendation document** for the Foundation's forward planning: recommended pool size, structural improvements, and expansion options.
- Update of the procur3.io/auditors dashboard for whitelisted Daml audit firms — verified audit statistics and linked reports for investor and community visibility.
- Handover session so Foundation staff can operate the framework independently, or extension into a longer-term collaboration targeting broader ecosystem security programmes.

**Acceptance Criteria:**

- At least **10 audits subsidised and completed** (or in final delivery).
- Complete framework transferred, Foundation-owned, and published; knowledge transfer package confirmed complete by the Foundation champion.
- Final programme report delivered and accepted by the Foundation.
- Scaling recommendation document delivered.
- All pending disbursement recommendations submitted.

---

## Acceptance Criteria (Global)

The Foundation's review committee will evaluate completion based on:

- Deliverables completed as specified for each milestone.
- Public availability of the programme intake form, auditor whitelist, and progress tracker.
- Documentation provided for auditor criteria, committee workflow, scoring rubric, milestone tracking, quality standards, and operational runbook.
- Demonstrated builder participation with real applications, approvals, and active audit engagements.
- Reporting delivered on schedule and acknowledged by the Foundation.
- Full transfer of the programme framework to the Foundation at pilot end.

---

## Funding

Two separate pools. They are never combined.

### 1. Ecosystem Audit Subsidy Fund

| Item | Amount |
|------|--------|
| Subsidy fund (pays auditors, held by Foundation) | **$500,000 (3,378,378 CC)** |

- Covers up to **70%** of audit cost per qualifying project.
- Held and disbursed by the **Foundation**, paid **directly to auditors**. No escrow. Procur3 never takes custody and takes **no percentage** of this fund.
- Supports approximately **10-20 audits**, targeting **10+ completed** in the pilot.

### 2. Procur3 Operator Fee

Paid to Procur3 to build the framework, onboard firms and projects, run the pilot cohort, and transfer the framework to the Foundation.

**Total operator fee: $60,000 (405,405 CC).**

| Milestone | Description | Amount |
|-----------|-------------|----------|
| Milestone 1 | Programme Infrastructure and Launch | **$21,000 (141,892 CC)** |
| Milestone 2 | Active Programme Operations | **$18,000 (121,622 CC)** |
| Milestone 3 | Completion, Knowledge Transfer, Final Report | **$21,000 (141,892 CC)** |
| **Total** |  **$60,000 (405,405 CC)** |

The operator fee covers Procur3's cost of designing, building, and operating the programme and producing the transferable framework. It is a fixed build-and-run cost, **not a percentage of the subsidy fund**, and carries no commission on subsidised audits. The audit subsidy pool is a separate budget line, disbursed directly by the Foundation to auditing firms per Procur3's milestone confirmations.

**Denomination and volatility:** Funding is denominated in USD and paid in Canton Coin. CC amounts shown use a reference CC/USD price of $0.148; the CC amount for each milestone is computed by dividing the fixed USD value by the 30-day moving-average CC/USD price (Coingecko) at the start of the quarter in which the milestone is delivered, and will be recalculated upon committee approval. This locks the USD-equivalent value of each milestone and limits volatility exposure to a single quarter.

---

## Sustainability

The programme is designed to be **Foundation-owned from the start**. Procur3 builds the infrastructure and operates the pilot; the Foundation owns the output.

At Milestone 3, Procur3 delivers a complete knowledge transfer package — auditor criteria, application specifications, committee workflow documentation, scoring rubric, quality standards, and an operational runbook. The Foundation can continue the programme independently or re-engage Procur3 using the same infrastructure.

Post-engagement, Procur3 continues to run as a **free security marketplace for builders on Canton**. Regardless of subsidy acceptance, teams can still procure any security-related service through the platform. Procur3's continuing interest is disclosed openly: participating firms and projects become familiar with the marketplace, and teams may choose to upgrade to paid tiers — both optional and dependent on Procur3 delivering value, not on any lock-in. Procur3 would like to continue working with the Canton Foundation post-pilot on a longer-term partnership; the handover is in place should the Foundation not wish to continue the programme itself.

---

## GTM and Adoption Strategy

**Target users:** Canton builders — protocol teams, dApp developers, and DeFi projects facing audit cost as a barrier to launch or expansion.

**Discovery channels:**

- Canton developer community channels (Telegram, Discord, forums). Procur3 maintains active community moderation throughout the pilot.
- Foundation announcement and co-marketing at programme launch.
- Direct outreach to the Canton project pipeline — the Foundation's existing builder relationships are the primary early-cohort source.
- Procur3 marketplace inbound: 60+ security firms across 25 ecosystems create organic inbound from projects seeking audits; the Canton subsidy is surfaced at point of enquiry.

**Adoption target:** 25+ applications and a minimum of 10+ completed subsidised audits by pilot end, deliberately conservative for the window, with the framework built to scale beyond the pilot once Foundation-owned.

**Signals of existing demand:** Procur3 is already supporting live teams building on Canton, including Mystic Finance and TermMax, with further teams preparing pre-launch RFPs.

---

## Co-Marketing

Upon programme launch (Milestone 1), Procur3 will coordinate with the Canton Foundation on:

- Joint programme announcement across Procur3 and Foundation channels.
- Ongoing promotion of approved projects and completed audits throughout the pilot.
- A mid-programme case study featuring an early participant for Foundation amplification.
- A final programme wrap-up report with outcome data, published jointly at pilot close.

---

## Rationale

The Canton Ecosystem Security Programme is the right approach for this grant because:

- **Removes the deciding-factor cost barrier.** Audit cost is one of the most consistent reasons serious teams choose another chain. A 70% subsidy with a meaningful 30% co-pay flips the calculus at the earliest builder decision point while keeping builders' skin in the game.
- **Operator with a track record.** Procur3 has supported 100+ protocol teams, has worked with the Canton Foundation BD team to onboard Daml audit firms, and is already supporting live Canton teams including Mystic Finance and TermMax.
- **Foundation owns the output.** The pilot delivers a transferable programme framework, not a vendor lock-in. The Foundation can continue independently or with Procur3.
- **Lean, outcome-linked ask.** The operator fee is a fixed $60,000, separated entirely from the subsidy pool, with 35% tied to adoption outcomes rather than shipped documents.
- **Canton-native, not EVM-retrofitted.** Auditor whitelist criteria and intake forms are built around Daml and Canton participant architecture — generic EVM security programmes do not address this.
- **Procur3 holds no funds.** The Foundation disburses directly to auditing firms per Procur3's milestone confirmations, preserving Foundation control and reducing operational and counterparty risk.
- **Transparency.** Programme findings let Procur3 and the Foundation give builders evidence-based pricing ranges, verified auditor track records, and a standard for sourcing security services.

---

## Team

| Name | Role | Background |
|------|------|------------|
| Eamonn | Founder, Procur3 | Built the Procur3 Web3 security marketplace; has supported 100+ protocol teams across 25 ecosystems to search, compare, and procure security audits, saving teams over $250,000 in security spend. Previously VP Sales at three Web3 security audit firms, onboarding clients totalling $10 billion in TVL, with over a decade of GTM and consulting experience. |
| Sarah | Programme Operations Manager (contractor) | Dedicated to the Canton pilot — intake, review support, auditor onboarding, milestone tracking, community moderation, and reporting. |

---

*Procur3 — Web3 Security Procurement*
*procur3.io · @procur3 · info@procur3.io*
