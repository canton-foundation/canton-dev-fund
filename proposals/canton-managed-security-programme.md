# Development Fund Proposal: Canton Managed Security Programme

**Author:** Eamonn (Founder, Procur3) (info@procur3.io)
**Status:** submitted
**Created:** 2026-05-26
**Updated:** 2026-06-02
**Website:** https://procur3.io
**Twitter:** https://x.com/procur3

---

## Abstract

This proposal establishes the **Canton Managed Security Programme** — a Foundation-operated, subsidy-based framework that covers up to **90% of audit costs** for qualifying projects building on Canton Network. Procur3, a web3 security marketplace, designs, builds, and operates the programme infrastructure for a **7-month pilot**: auditor whitelist criteria, application and review workflow, quality standards, and monthly reporting.

All programme methodology, criteria, and documentation are transferred to the Foundation at pilot completion and may be operated independently or continued with Procur3 thereafter. The primary public good delivered is a **reusable, open security programme framework** that removes the cost barrier preventing serious teams from deploying on Canton — directly driving protocol adoption, developer activity, and on-chain user growth.

---

## Motivation

Security audit costs are one of the most consistent barriers preventing serious teams from building on / expanding to new chains. A quality audit for a DAML-based application runs **$15,000–$80,000** depending on codebase complexity. For early-stage teams this cost is often the deciding factor between deploying on Canton and choosing a chain where the financial burden is lower or subsidised.

**This is not a hypothetical concern.** Procur3 has supported 80+ protocol teams across numerous blockchains to search, compare and procure any security needs from vetted audit firms. The security marketplace was built to foster competition between audit firms and drive down the cost of security reviews by up to 40%.

Procur3 has worked with Parth — ecosystem BD Director, Canton Foundation team — to import and onboard some of the existing DAML security audit firms. In addition to this, we have already supported a soon-to-launch lending protocol to identify a security partner for their DAML audits, along with 2 others about to post their RFP for pre-launch security reviews. The demonstrates a clear demand from teams building on Canton. 

Within many community Discords and Telegram chats, we've witnessed developers requesting such support from the foundation teams of the blockchains they are building on. Evidence of such programmes and their success can be seen across web3 — Arbitrum's $10 million security grant programme and Optimism Superchain audit grants. Subsidised audits attract builders, builders bring TVL, TVL attracts more builders and users. **This pilot tests that model at a Canton-appropriate scale** before a larger allocation.

---

## Specification

### 1. Objective

Deliver a 7-month pilot of the Canton Managed Security Programme that:

- Subsidises up to **90% of qualifying audit costs** for Canton projects, with a minimum 10% co-pay from projects to ensure genuine commitment.
- Produces an **open, reusable programme framework** — auditor whitelist criteria, application forms, review process, quality standards, milestone tracking, and reporting templates — fully transferable to the Foundation at pilot end.
- Drives measurable increases in Canton protocol deployments and on-chain activity by removing the security cost barrier at the earliest builder decision point.
- Delivers a **data-backed scaling recommendation** at the end of Q4 2026 for the Foundation's 2027 planning.

### 2. Technical Approach

**Programme infrastructure built by Procur3.** The Procur3 platform will be adapted specifically for the Canton programme. This covers four technical workstreams:

- **Application and intake system.** A dedicated Canton programme intake form is built on the Procur3 platform with Canton-specific fields: DAML version and architecture details, Canton participant configuration, TVL projections, funding history, and team on-chain track record. The form outputs a structured application packet for voting committee review.
- **Voting committee workflow.** Using the existing workflow for reviewing grant applications at https://github.com/orgs/canton-foundation/projects/3/views/1. The standardised security templates will be populated by the project founders with the support of Procur3 for review by the voting committee.
- **Auditor whitelisting system.** A Canton-specific auditor capability registry is built on Procur3 tracking: DAML audit experience, Canton participant deployment experience, and availability. Auditor-project matching is done by the project themselves, prior to grant submission.
- **Milestone tracking and disbursement recommendation.** Procur3 tracks audit progress against defined milestones (kickoff, mid-review, final report). At each milestone, Procur3 generates a disbursement recommendation for the Foundation. The Foundation disburses directly to the auditing firm; **Procur3 holds no funds**.

**Auditor whitelist criteria (open, published):**

- Demonstrated track record of completed audits on DLT or enterprise blockchain infrastructure (minimum 5 published reports).
- Demonstrated track record of completed audits on relevant protocols that are anticipated to apply for the security subsidy (e.g., borrowing / lending protocols, stablecoin issuers).
- DAML or Canton smart contract environment experience, or a documented upskilling path within the pilot period.
- Clean conflict-of-interest declaration relative to Canton ecosystem projects.
- Published audit reports available for public review.

All criteria are published openly. Any firm meeting the criteria can apply to join the whitelist.

**Proposed security subsidy tiers:**

| Tier | Audit cost range | Foundation covers (90%) | Project co-pay (min 10%) | Target profile |
|------|------------------|-------------------------|--------------------------|----------------|
| Seed | Up to $15,000 | Up to $13,500 | From $1,500 | Pre-launch, early architecture |
| Growth | $15,000–$40,000 | Up to $36,000 | From $1,500 | Live or imminent deployment |
| Strategic | $40,000–$80,000 | Up to $72,000 | From $4,000 | High TVL potential, complex architecture |

Tier placement is recommended by Procur3 based on submitted application materials and approved by the Foundation's voting committee.

### 3. Architectural Alignment

Canton is differentiated by its institutional-grade privacy model, DAML smart contract language, and privacy-first participant architecture. These properties make it attractive for financial services, regulated industries, and high-stakes applications — precisely the contexts where security audit rigour is non-negotiable and audit costs are most likely to be a deployment barrier.

The programme is designed to reflect this. Auditor whitelist criteria specifically require **DAML and Canton experience (or similar)** rather than accepting EVM-based audit credentials as equivalent. Application intake captures Canton-specific architecture details that generic security grant programmes do not address.

The programme also supports the Foundation's role as a neutral facilitator. Procur3 sits between the Foundation and individual auditors as the operational layer, carrying relationship management and quality oversight, while the **Foundation retains approval authority** on all programme parameters, auditor whitelist changes, and individual project approvals.

### 4. Backward Compatibility

No backward compatibility impact. The programme is an additive Foundation operation that augments — and does not replace — existing builder support, grant pipelines, or Foundation processes. All artefacts produced (auditor whitelist, intake form, committee workflow, runbook) are transferred to the Foundation and may be operated independently or continued with Procur3 post-pilot.

---

## Milestones and Deliverables

### Milestone 1: Programme Infrastructure and Launch Operations

| Detail | Description |
|--------|-------------|
| **Estimated Delivery** | Month 1 from grant approval |
| **Focus** | Build and launch the programme infrastructure, onboard initial auditor cohort, announce programme, prepare for day 1 of intake forms for the fllowing 60 days |
| **Funding** | $CC 240,000 |
| **Person-hours** | ~1,200 (1 × FTE Manager, 0.5 × FTE Developer, 1 × FTE Admin) |

**Hours breakdown:** 400 hours per month over 3 months — 400 for programme infrastructure setup (month 1) and 400 per month for ongoing management and support (launch months 1 & 2).

**Deliverables:**

- Canton-specific application intake form live on the Procur3 platform, covering all required fields for voting committee review.
- Auditor whitelist criteria published openly; initial Canton-qualified auditor cohort identified, onboarded, and listed.
- Programme terms, eligibility criteria, and grant tier definitions documented and approved by the Foundation.
- Audit progress tracker live and operational for milestone tracking (related to approved audit engagements).
- Programme publicly announced via coordinated launch with the Foundation, approved auditors, and Canton-focused news outlets / pages.

**Acceptance Criteria:**

- Application intake form accessible at a public URL and confirmed functional by a Foundation reviewer.
- Voting committee workflow confirmed by at least one Foundation committee member.
- Auditor whitelist published with a minimum of **5 qualified firms**.
- Public programme announcement live across Procur3 and Foundation channels.

---

### Milestone 2: Continued Active Programme Operations (months 3 - 6)

| Detail | Description |
|--------|-------------|
| **Estimated Delivery** | Month 3–4 from grant approval |
| **Focus** | Active intake, review, and audit engagements; ongoing programme operations and reporting |
| **Funding** | $CC 240,000 |
| **Person-hours** | ~1,200 |

**Deliverables:**

- Minimum **7 projects applied and reviewed** and at least **2 approved for subsidy** through the programme in the last 60 days.
- Milestone tracking active for all approved engagements with disbursement recommendations issued to the Foundation on completion of each milestone.
- Community moderation active across Canton builder channels — responding to programme enquiries, surfacing the programme to new teams, supporting applicants through the process.
- Three monthly progress reports delivered to the Foundation: active audits, disbursements recommended, new applicants reviewed, auditor performance notes.
- Awareness campaigns running across Canton builder community channels.

**Acceptance Criteria:**

- At minimum **2 projects with active audit engagements** confirmed by the Foundation.
- **Three monthly progress reports** delivered on schedule and acknowledged by the Foundation.
- Disbursement recommendations issued for all completed milestones, verifiable against Foundation payment records.

---

### Milestone 3: Programme Completion, Knowledge Transfer, and Final Report

| Detail | Description |
|--------|-------------|
| **Estimated Delivery** | End of Month 7 (Mid-December, Q4 2026) |
| **Focus** | Close out Season 1, transfer full programme framework to the Foundation, publish report with findings, deliver scaling recommendation |
| **Funding** | $CC 99,000 |
| **Person-hours** | ~400 |

**Deliverables:**

- Closing out of Season 1 of the security programme.
- All active audit engagements tracked to completion, with final disbursement recommendations issued.
- **Full programme documentation package transferred to the Foundation:** auditor whitelist criteria, application form specifications, voting committee workflow documentation, milestone tracking methodology, report quality standards, and operational runbook — sufficient for the Foundation to operate the programme independently or continue with Procur3 into 2027.
- **Final programme report** covering: total projects audited, total grant capital deployed, TVL of participating projects at audit completion, protocol retention on Canton post-audit, auditor performance summary, builder feedback summary.
- Minimum of **20 applications submitted** by projects building on Canton, with a minimum of **6 granted a security audit subsidy**.
- **Scaling recommendation document** for the Foundation's 2027 planning: recommended pool size, structural improvements, and programme expansion options.
- Update of the procur3.io/auditors dashboard of the whitelisted DAML audit firms — updating their verified audit statistics and connecting audit reports for investor and community visibility.

**Acceptance Criteria:**

- Final programme report delivered and accepted by the Foundation.
- Knowledge transfer documentation package confirmed complete by the Foundation champion.
- Scaling recommendation document delivered.
- All pending disbursement recommendations submitted.
- High ecosystem participation with **20 submissions and 6 accepted applications** at minimum.

---

## Acceptance Criteria (Global)

The Foundation's voting committee will evaluate completion based on:

- Deliverables completed as specified for each milestone.
- Public availability of the programme intake form, auditor whitelist, and progress tracker.
- Documentation provided for auditor criteria, committee workflow, milestone tracking, quality standards, and operational runbook.
- Demonstrated builder participation with real applications, approvals, and active audit engagements.
- Monthly reporting delivered on schedule and acknowledged by the Foundation.
- Full transfer of the programme framework to the Foundation at pilot end.

---

## Funding

**Total Funding Request: $CC 579,000**

| Milestone | Description | Amount |
|-----------|-------------|--------|
| Milestone 1 | Programme Infrastructure and Launch Operations | $CC 240,000 |
| Milestone 2 | Continued Active Programme Operations (months 3 - 6) | $CC 240,000 |
| Milestone 3 | Programme Completion, Knowledge Transfer, and Final Report | $CC 99,000 |
| **Total** | | **$CC 579,000** |

The $CC 579,000 funding request covers Procur3's cost of designing, building, and operating the programme for seven months and producing the transferable programme framework. The Foundation's **audit subsidy pool is a separate budget line**, disbursed directly by the Foundation to auditing firms per Procur3's milestone confirmations.

**Volatility Stipulation:** The grant duration is 7 months. The grant is denominated in fixed Canton Coin. Should significant USD/CC price volatility occur, milestones may be renegotiated to ensure deliverability.

---

## Sustainability

The programme is designed to be **Foundation-owned from the start**. Procur3 builds the infrastructure and operates the pilot; the Foundation owns the output.

At Milestone 3, Procur3 delivers a complete knowledge transfer package — auditor criteria, application specifications, committee workflow documentation, quality standards, and an operational runbook. The Foundation can continue the programme independently or re-engage Procur3 using the same infrastructure.

Post-engagement, Procur3 will continue to run as a **free security marketplace for builders on Canton**. Regardless of security subsidy acceptance, teams can still procure any security related service using the platform.

---

## GTM and Adoption Strategy

**Target users:** Canton Network builders — protocol teams, dApp developers, and DeFi projects building on Canton who face audit cost as a barrier to launch or expansion.

**Discovery channels:**

- Canton developer community channels (Telegram, Discord, forums). Procur3 maintains active community moderation throughout the pilot as part of the programme operations.
- Foundation announcement and co-marketing at programme launch.
- Direct outreach to the Canton Network project pipeline. The Foundation's existing relationships with builders under development are the primary early-cohort source.
- The Procur3 marketplace has 50+ security firms already on the platform, engaging with builders across Base, Solana, Ethereum, and 14 other blockchains. This creates organic inbound interest from projects seeking audits. The Canton programme subsidy is surfaced to these projects at the point of enquiry.

**Initial adoption target:** 2 projects in active audit engagements by end of Month 3 (Milestone 2 acceptance criteria). This is deliberately conservative given the 7-month pilot window and the expectation that programme awareness compounds over time.

**Signals of existing demand:** In just 2 weeks, we are already engaging **3 protocol teams** who are in need of smart contract auditors for their DAML contracts prior to launch.

---

## Co-Marketing

Upon programme launch (Milestone 1), Procur3 will coordinate with the Canton Foundation on:

- Joint programme announcement across Procur3 and Foundation channels.
- Ongoing promotion of approved projects and completed audits throughout the pilot.
- A mid-programme case study (Month 3) featuring an early participant for Foundation amplification.
- A final programme wrap-up post with outcome data, published jointly at Q4 2026 close.

---

## Rationale

The Canton Managed Security Programme is the right approach for this grant because:

- **Removes the deciding-factor cost barrier.** Audit cost is one of the most consistent reasons serious teams choose another chain. A 90% subsidy with a meaningful 10% co-pay flips the calculus at the earliest builder decision point.
- **Operator with a track record.** Procur3 has supported 80+ protocol teams across 17+ chains and has already worked with the Canton Foundation BD team to onboard some of the existing DAML audit firms — and is actively supporting 3 Canton teams pre-launch.
- **Foundation owns the output.** The pilot delivers a transferable programme framework, not a vendor lock-in. The Foundation can continue independently or with Procur3 in 2027.
- **Proven model at other ecosystems.** Arbitrum's $10M security grant programme and Optimism Superchain audit grants have demonstrated the directional insight: subsidised audits attract builders, builders bring TVL, TVL attracts more builders and users. This pilot tests the model at a Canton-appropriate scale before a larger allocation.
- **Canton-native, not EVM-retrofitted.** Auditor whitelist criteria and intake forms are built around DAML and Canton participant architecture — generic EVM security programmes do not address this.
- **Procur3 holds no funds.** The Foundation disburses directly to auditing firms per Procur3's milestone confirmations, preserving Foundation control and reducing operational and counterparty risk.
- **Transparency.** The findings of the programme allows Procur3 and the Canton foundation to provide builders with evidence-based pricing ranges for their security needs, verified statistics of auditor track record and a standard for sourcing security services.

---

## Team

| Name | Role | Background |
|------|------|------------|
| Eamonn | Founder, Procur3 | Builder of the Procur3 web3 security marketplace. Has supported 80+ protocol teams across Base, Solana, Ethereum, and 14+ other chains to search, compare, and procure security audits. Saving teams over $250,000 in security spend. Previously VP Sales at 3 Web3 security audit firms, 1 Regtech Saas (Acquired) & over a decade of GTM and consulting experience.
| Sarah | Programme Operations manager | dedicated to the Canton pilot — covering intake, review support, auditor onboarding, milestone tracking, community moderation, and reporting. |
| Radoslev | Lead Developer | Worked at several DAO's as a developer as well as a security researcher

---

*Procur3 — Web3 Security Marketplace*
*procur3.io · @eprocur3 · info@procur3.io*
