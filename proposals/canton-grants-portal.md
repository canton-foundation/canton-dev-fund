# Development Fund Proposal: Canton Grants Portal  
## Governance Workflow and Transparency Infrastructure

- **Author:** Deepthi  
- **Status:** Submitted  
- **Created:** 2026-03-19  

---

## Abstract

This proposal requests funding for the Canton Grants Portal: an open-source workflow and transparency platform for the Canton Development Fund.

GitHub works well as the public submission layer for proposals. The scaling problem begins after submission: reviewer assignment, structured evaluation, voting, milestone verification, payment tracking, reporting, and public visibility all become harder to manage as proposal volume and active grants increase. If these workflows remain spread across GitHub comments, spreadsheets, and manual coordination, the result is slower decisions, weaker auditability, inconsistent milestone review, and lower trust from builders who depend on the fund.

The Canton Grants Portal adds the missing operational layer while preserving GitHub as the public source of truth. It provides proposal sync, structured committee review, formal voting support, project and milestone tracking, payment-ledger visibility, notifications, audit logs, and a public dashboard.

This is not a treasury product, a private back office, or automated governance. It is open-source operational infrastructure that helps Canton run a public, milestone-based grant program more reliably, transparently, and at greater scale.

A working v2 implementation already Implemented past few weeks. This proposal is therefore for completion, hardening, launch readiness, and a bounded 12-month post-launch maintenance window.

In my opinion 

GitHub Project view = intake and triage
This portal = decisioning, execution, and transparency

---

## Why This Is Useful For Canton

This platform gives Canton one operational system for the full grants lifecycle: proposal sync, structured reviews, quorum-based voting, milestone verification, payment controls, reporting, and public transparency. In practice, that means less manual coordination, better proposal quality, stronger governance records, cleaner milestone and payout audit trails, and much better visibility into funded project progress and program health.

---

## Scope

The platform will provide:

- GitHub sync for proposal PRs from `canton-foundation/canton-dev-fund`
- structured reviewer assignment and scorecards
- voting workflow with quorum tracking and decision records
- proposal-to-project conversion for approved grants
- milestone submission and verification workflow
- payment ledger with approval state and transaction references
- public dashboard for funded projects, progress, and program metrics
- notifications, audit logs, and operator reporting

### Design Principles

- GitHub remains the source of truth for proposal content and public discussion
- workflow support helps humans make decisions; it does not replace committee judgment
- transparency is a first-class output
- repository actions remain manual or committee-confirmed
- the platform is additive and open source

### Out of Scope

- replacing GitHub as the proposal source of truth
- requiring proposers to use a new submission system
- automated on-chain disbursement or treasury custody
- private CRM / messaging tooling
- automated approval or rejection without human review
- a generalized grants SaaS or ERP system

---

## Deliverables

## Milestones and Deliverables

### Milestone 1: Public Alpha for Committee Review Workflow

The committee can review the active proposal queue in one GitHub-connected workspace without duplicating proposal content outside GitHub.

### Milestone 2: External Committee-Style Evaluation

At least one real or simulated committee workflow completes review, voting, and public decision reporting and records usability gaps.

### Milestone 3: Hardened Approval-to-Payment Workflow

Milestone verification, payment ledger, reminders, and runbooks are refined based on that evaluation and support a full funded-project lifecycle.

### Milestone 4: First-Year Reliability Window

---

**Value metric:** the portal remains operational and review-ready across one full funding cycle with documented maintenance history.

---

## Potential Ecosystem Beneficiaries

This proposal is intended as public-good governance infrastructure for the wider Canton ecosystem, with the primary direct beneficiary being the Canton Development Fund committee and the operational workflow around proposal review, voting, milestone verification, and payment tracking.

It is also well aligned with organizations that participate in, depend on, or build around the Development Fund process, because stronger review and milestone operations improve predictability, transparency, and trust for all proposers and funded teams.

More broadly, this project is useful for any ecosystem grant program or governance workflow that needs to keep GitHub as the source of truth while adding structured review coordination, public decision trails, milestone verification, and auditable payment tracking.


## Acceptance Criteria

Completion will be evaluated based on:

- delivery of milestone scope as described
- demonstrated functionality and operational readiness
- alignment with stated value metrics

Project-specific conditions:

- proposal content continues to originate from GitHub
- committee review and vote outcomes can be mirrored back to GitHub in a clear public format
- the platform supports at least 250 proposals and 75 active funded projects
- funded-project tracking preserves a visible link between proposal, approval, milestone state, and payment record
- public dashboard data excludes private committee-only notes while preserving meaningful transparency
- repository state changes remain manual or committee-confirmed
- the platform is released as open source

---

## Funding

**Total Funding Request:** 330,000 CC for build and launch, plus 330,000 CC for a bounded 12-month post-launch reliability and maintenance window and bug fix support.

### Payment Breakdown

- **Milestone 1:** 110,000 CC upon acceptance
- **Milestone 2:** 110,000 CC upon acceptance
- **Milestone 3:** 110,000 CC upon final release and acceptance
- **Milestone 4:** 330,000 CC across four quarterly acceptance checkpoints during the 12-month maintenance window

Indicative maintenance equivalent: **27,500 CC per month (~3800 USD)** for one developer covering bug response, reliability, compatibility, and security updates, paid quarterly rather than as an open-ended monthly contract.

## Team Background

Strong product engineering experience building scalable software systems in large enterprise environments, including work with Fortune 100 organizations such as Accenture. This background includes delivering high-scale products, working across structured operational workflows, and translating complex business processes into dependable software systems.

### Volatility Stipulation

The grant is denominated in fixed Canton Coin and should be re-evaluated at the 6-month mark if CC/USD volatility materially affects delivery assumptions.

---

## Why This Proposal Should Be Approved

The Development Fund’s challenge is no longer only collecting proposals. The real challenge is operating the program well as volume and complexity grow. If review assignment is inconsistent, decisions slow down. If milestone verification is informal, payouts become harder to justify. If reporting is fragmented, public trust weakens.

The Canton Grants Portal solves that operational problem directly. It gives the Canton team one GitHub-connected system for review, voting, milestone tracking, payment records, reporting, and public transparency. That improves decision quality, reduces administrative overhead, and strengthens accountability for every funded project.

A working v2 implementation already exists, which makes this proposal lower risk than a typical greenfield build.

GitHub Project view = intake and triage
This portal = decisioning, execution, and transparency

---

## Co-Marketing

Upon release, the implementing entity will collaborate with the Foundation on:

- announcement coordination
- a technical write-up on the GitHub-centered governance workflow
- one public walkthrough of the transparency dashboard and grant lifecycle model
- published admin/operator guidance for committee use
