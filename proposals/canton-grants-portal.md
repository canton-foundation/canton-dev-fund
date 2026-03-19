## Development Fund Proposal: Canton Grants Portal -- Governance Workflow and Transparency Infrastructure

**Author:** Deepthi  
**Status:** Submitted  
**Created:** 2026-03-19  

---

## Abstract

This proposal requests funding for an open-source governance operations platform that helps the Canton Development Fund scale without losing transparency, auditability, or review quality.

Today, proposals are submitted through GitHub Pull Requests, which is the right source of truth for public discussion and proposal history. The problem begins after submission: as the fund grows across multiple cycles, the committee must coordinate structured reviews, voting, milestone verification, and payment tracking across a growing portfolio of grants. Without purpose-built workflow support, proposals wait too long for decisions, milestone reviews become inconsistent, payment approvals become harder to audit, and community visibility declines.

The Canton Grants Portal is designed to solve that operational scaling problem while keeping GitHub at the center of the process.

The project will provide:

- automatic sync of proposal PRs from the fund repository
- structured committee review workflows and scorecards
- formal voting support with quorum tracking and public decision records
- milestone verification and payment-ledger tracking for funded projects
- a public transparency dashboard for funded projects and program activity

The goal is not to replace GitHub, create a private grants back office, or automate governance decisions away from humans. The goal is to provide the missing workflow and reporting layer that a public, milestone-based grant program needs once proposal volume becomes large.

This proposal treats grant operations as ecosystem infrastructure. If the Development Fund cannot scale its review and milestone process, external contributors experience slower decisions, weaker transparency, and lower trust in the program. Solving that problem benefits every current and future builder who depends on the fund.

Because governance workflow tools are used continuously rather than once, the proposal also includes a bounded 12-month post-launch maintenance window focused on reliability, issue resolution, and compatibility updates during the first full operating year.

---

## Specification

### 1. Objective

The objective is to make the Canton Development Fund operationally scalable, auditable, and transparent as proposal volume and active grants increase.

The intended outcome is that the Tech and Ops Committee can:

- review a large queue of proposals through a consistent scorecard process
- track who has reviewed what and what still needs action
- run formal voting with clear quorum and decision records
- convert approved proposals into tracked projects with milestone timelines
- verify milestone submissions against acceptance criteria
- record payment approvals with an auditable trail
- publish current funded-project status and program metrics to the community

This proposal is not framed as internal convenience software. It is governance workflow infrastructure for a public grant program.

### 2. Implementation Mechanics

The platform will be delivered as a web application and supporting sync services that read from GitHub and mirror governance outcomes back into GitHub.

#### A. Core Design Principles

- GitHub remains the source of truth for proposal content and public discussion
- proposers continue to submit through GitHub and do not need portal accounts
- committee actions are mirrored back to GitHub as public comments or status updates
- workflow support helps humans make decisions; it does not replace committee judgment
- transparency is a first-class output, not an afterthought

#### B. System Architecture

- **Frontend:** Next.js application for committee workspace and public dashboard
- **Backend:** Next.js API routes or lightweight service layer backed by PostgreSQL
- **Authentication:** GitHub OAuth for committee members and approved operations users
- **Integration:** GitHub Webhooks plus GitHub API sync for proposal metadata, comments, labels, and status updates
- **Notifications:** limited email and in-app reminders for assigned reviews, pending votes, milestone submissions, and overdue actions
- **Deployment:** single deployable application, self-hosted or managed cloud deployment

#### C. Functional Modules

**1. Proposal Sync and Normalization**

- sync existing and new PRs from `canton-foundation/canton-dev-fund`
- parse structured proposal data such as title, author, category, funding request, milestones, and acceptance criteria
- create normalized records for committee workflow without modifying the original proposal source

**2. Review Workspace**

- assign reviewers
- collect structured scorecards aligned to the fund rubric
- track review completion state
- generate a review summary that can be posted back to the GitHub PR

The scorecard will stay aligned with the current fund criteria:

- ecosystem impact and value
- protocol or governance alignment
- scope and feasibility
- cost effectiveness
- security or operational risk
- milestone clarity and verifiability

**3. Voting and Decision Trail**

- move review-complete proposals into a vote queue
- record approve, reject, or abstain votes
- track quorum and final decision status
- publish a clear decision summary back to GitHub

Important constraint:

- the platform will not auto-merge or auto-close proposals by default
- repository actions can be exposed as optional committee-confirmed actions after manual approval

**4. Funded Project Tracking**

- convert approved proposals into active projects
- display milestones, due dates, status, and evidence links
- allow committee reviewers to verify milestone submissions against acceptance criteria
- preserve the public link between proposal, review record, approval, and milestone outcomes

**5. Payment Ledger**

- record approved milestone payouts in CC
- track payment approval state and transaction references
- preserve an auditable history of payment decisions and releases

The ledger is a workflow and reporting layer only. It does not custody funds and does not perform on-chain payments directly.

**6. Public Transparency Dashboard**

- show funded projects, milestone progress, and program-level summaries
- show allocated versus disbursed CC totals
- publish quarterly summary data without exposing internal committee-only notes

#### D. Explicitly Out of Scope

To keep the proposal focused and reviewer-friendly, this project does not include:

- replacing GitHub as the proposal source of truth
- requiring proposers to use a new portal for submission
- private messaging or CRM features
- treasury custody or automated on-chain disbursement
- a generalized DAO governance product
- automated approval or rejection without human committee action
- a broad foundation ERP or finance system

### 3. Architectural Alignment

This proposal directly aligns with the Development Fund governance model and its public-good mandate.

- It operationalizes the review, voting, milestone, and payment workflow described in the fund process.
- It supports the public and transparent process described in the repository README and CIP-0100.
- It strengthens the reliability of milestone-based funding by making milestone verification and payout history auditable.
- It preserves GitHub-centered transparency instead of moving decisions into private spreadsheets or disconnected tools.
- It creates reusable governance infrastructure that can support future grant rounds, RFP programs, and other structured ecosystem funding workflows.

This is ecosystem infrastructure because the quality of fund operations directly affects every external builder who depends on fair review, timely decisions, and visible milestone accountability.

### 4. Backward Compatibility

No backward compatibility impact.

The platform is additive. Proposal submission remains GitHub-based. The portal can be adopted incrementally, beginning with sync and review workflows, then expanded into milestone and payment tracking without changing how contributors submit proposals.

---

## Milestones and Deliverables

### Milestone 1: Proposal Sync and Committee Review Workspace

- **Estimated Delivery:** 5 weeks
- **Focus:** create the GitHub-connected committee workspace for structured review
- **Deliverables / Value Metrics:**
  - GitHub OAuth login and role-based access for committee users
  - sync of all existing and new proposal PRs from the fund repository
  - parsed proposal detail view with funding, milestones, and acceptance criteria
  - committee dashboard with search, filters, reviewer assignment, and review status tracking
  - structured scorecard aligned to the fund rubric
  - generated review summary suitable for posting back to GitHub
  - value metric: the committee can manage the full active proposal queue from one workspace without duplicating proposal content outside GitHub

### Milestone 2: Voting Workflow and Public Decision Transparency

- **Estimated Delivery:** 5 weeks
- **Focus:** add formal decision support and a visible public decision trail
- **Deliverables / Value Metrics:**
  - voting queue for review-complete proposals
  - approve, reject, and abstain vote recording with quorum tracking
  - decision summary generator for GitHub PR comments
  - public transparency dashboard showing proposal outcomes, funded projects, and aggregate program metrics
  - in-app and email reminders for pending reviews and votes
  - optional committee-confirmed repository action hooks for merge or close workflows
  - value metric: each decision has a complete, reviewable trail from proposal ingest through review completion and vote outcome

### Milestone 3: Milestone Verification, Payment Ledger, and Launch Readiness

- **Estimated Delivery:** 6 weeks
- **Focus:** support the post-approval lifecycle for funded grants
- **Deliverables / Value Metrics:**
  - project workspace for approved grants with milestone timelines
  - milestone submission and verification workflow using evidence links and acceptance-criteria checks
  - CC-denominated payment ledger with approval states and transaction references
  - overdue milestone and reassessment reminders
  - admin guide, setup guide, and operational runbook
  - value metric: funded projects can be tracked from approval through milestone completion and payment release with a complete audit trail

### Milestone 4: First-Year Maintenance and Reliability Window

- **Estimated Delivery:** 12 months after launch
- **Focus:** keep the platform reliable through the first full operating year without expanding scope into a broader grants SaaS
- **Deliverables / Value Metrics:**
  - bug fixes for issues found during live committee use
  - security patches and dependency updates
  - GitHub API, webhook, and auth compatibility updates as needed
  - limited in-scope workflow refinements based on committee feedback
  - quarterly maintenance summaries covering incidents, fixes shipped, open issues, and operating notes
  - value metric: the portal remains operational and review-ready across one full funding cycle with a documented maintenance history

---

## Acceptance Criteria

The Tech and Ops Committee will evaluate completion based on:

- deliverables completed as specified for each milestone
- demonstrated functionality and operational readiness
- documentation and knowledge transfer provided
- alignment with stated value metrics

Project-specific acceptance conditions:

- all proposal content continues to originate from GitHub rather than a separate submission system
- committee review and vote outcomes can be mirrored back to GitHub in a clear public format
- the platform supports the current proposal backlog and is designed for at least 250 proposals and 75 active funded projects
- funded-project tracking preserves a visible link between original proposal, approval decision, milestone state, and payment record
- public dashboard data excludes private committee-only notes while preserving meaningful transparency
- repository state changes remain manual or committee-confirmed, not silently automated
- first-year maintenance remains bounded to reliability, compatibility, security, and minor in-scope workflow improvements rather than new product expansion
- the platform is released as open source

---

## Funding

**Total Funding Request:** 330,000 CC + 250,000 CC for 1 year support

### Payment Breakdown by Milestone

- Milestone 1 _(Proposal Sync and Committee Review Workspace)_: 110,000 CC upon committee acceptance
- Milestone 2 _(Voting Workflow and Public Decision Transparency)_: 110,000 CC upon committee acceptance
- Milestone 3 _(Milestone Verification, Payment Ledger, and Launch Readiness)_: 110,000 CC upon final release and acceptance
- Milestone 4 _(First-Year Maintenance and Reliability Window)_: 250,000 CC across four quarterly acceptance checkpoints during the 12-month maintenance window

Indicative maintenance equivalent: **20,800 CC per month (~3300 USD) for 12 months for one Developer to support all Bugs reported**, paid in quarterly milestone tranches rather than as an open-ended monthly services contract. If Canton want to continue maintenance after 12 months it will be added as new proposal.

### Volatility Stipulation

The grant is denominated in fixed Canton Coin and will require a re-evaluation at the 6-month mark to account for significant CC/USD volatility.

No maintenance funding beyond this 12-month window is requested in this initial proposal.

The maintenance window is intentionally bounded. It covers reliability, issue resolution, compatibility, and limited in-scope workflow improvements during the first operating year. If the platform proves useful after that period and the fund requires continued support, a separate follow-on maintenance proposal can be evaluated based on real usage and concrete operating data rather than speculation.

---

## Co-Marketing

Upon release, the implementing entity will collaborate with the Foundation on:

- announcement coordination
- a technical write-up describing the GitHub-centered governance workflow
- one public walkthrough of the transparency dashboard and grant lifecycle model

Specific commitments:

- publish an admin and operator guide for committee use
- publish a short explanation of how public review, voting, milestone, and payment data are surfaced to the community

---

## Motivation

The Development Fund already has a meaningful proposal backlog, and that is only the beginning. As the fund grows across future cycles, the hard problem is no longer only collecting proposals. The hard problem is operating the program well at scale.

If review assignment is inconsistent, decisions slow down. If voting records are fragmented, governance becomes harder to audit. If milestone verification is informal, payouts become harder to justify. If funded-project status is difficult to inspect, community trust weakens.

Those failures do not stay internal. They directly affect builders waiting for decisions, grantees waiting for milestone approval, and the broader ecosystem trying to assess whether the fund is working.

That is why this proposal should be treated as governance infrastructure rather than internal convenience software. It improves the reliability, transparency, and scalability of a public program that external contributors depend on.

---

## Rationale

This is the right scope because it solves the actual scaling problem without trying to become a full grants SaaS platform.

Why this approach is strong:

1. it keeps GitHub as the public submission and discussion layer
2. it adds structured workflow only where GitHub is weak: review tracking, voting, milestone verification, and payment audit trails
3. it avoids over-automation by keeping final governance actions human-controlled
4. it delivers transparency as a product output, not just an internal ops feature
5. it is reusable for future fund rounds and related ecosystem grant programs

Alternative approaches such as GitHub Projects, spreadsheets, or private no-code tools fail on at least one critical dimension: structured review quality, public traceability, milestone/payment auditability, or long-term scalability.

The result is a focused, defensible public-good proposal: a workflow and transparency layer that helps the Canton Development Fund scale without sacrificing openness or accountability.
