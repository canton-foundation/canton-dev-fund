## Canton StreamPay: Project-Level Vesting & Contributor Rewards Engine

**Author:** Jayson  
**Status:** Draft  
**Created:** 2026-04-02  

---

## Abstract

This proposal introduces **Canton StreamPay**, an autonomous, non-custodial financial infrastructure designed for projects and development teams within the Canton ecosystem. As projects secure development funding and grow their teams, they face a critical operational gap: there are no chain-native tools to manage the *internal* distribution of those funds. Teams resort to manual bank transfers, off-chain spreadsheets, and trust-based arrangements — all of which are error-prone, non-transparent, and incompatible with the privacy standards of professional financial operations.

StreamPay solves this by enabling projects to automate **Linear Vesting**, **Contributor Rewards Streaming**, **Bug Bounty Distributions**, and **Internal Milestone Unlocking** through Daml-native smart contracts. By shifting from ad-hoc lump-sum disbursements to programmable, per-second release curves, teams achieve contributor retention, treasury predictability, and milestone-enforced compliance — all while leveraging Canton's sub-transaction privacy to keep sensitive compensation data strictly confidential between the involved parties.

---

## Specification

### 1. Objective

Building a professional project on Canton requires mature treasury management. Currently, teams often manage internal disbursements manually, leading to operational friction and trust risks — a grant recipient cannot programmatically prove to their contributors that funds are committed, and contributors cannot be certain of payment beyond personal trust.

**Canton StreamPay** provides a "Treasury-in-a-Box" for teams, focusing on four core pillars:

1.  **Autonomous Team Vesting**: Programmatic, cliff-based linear release of tokens to founders and early contributors. Vesting schedules are cryptographically enforced, not just promised — making StreamPay ideal for investor relations and early-hire retention.
2.  **Internal Milestone Unlocking (Sub-Grants)**: Enables project leads to decompose a grant or investment into locked sub-budgets for specific workstreams (e.g., Frontend, Security Audit, Protocol Integration). Funds are released into a stream only upon multi-party verification of the sub-deliverable, providing internal accountability without requiring trust.
3.  **Contributor Rewards Streaming**: Streaming incentive distributions for open-source maintainers, part-time contributors, and community developers. Rather than opaque lump-sum awards, contributors accrue CC continuously as they deliver work, providing real-time alignment between effort and reward — without requiring a traditional employment relationship.
4.  **Bug Bounty Management**: A structured streaming distribution for security researchers. Rather than paying bounties as a single large transfer (which risks immediate liquidation pressure), projects stream bounties over a defined period — aligning researcher incentives with long-term protocol health and reducing sudden market impact.

### 2. Implementation Mechanics

**Smart Contract Layer (Daml)**

- `VestingVault` — Supports multi-period release logic combining an optional [Cliff Duration] with a mandatory [Linear Streaming Duration]. Once the Cliff period elapses, the stream activates automatically and funds accrue per-second. Ensures non-custodial security: the `Sender` cannot recover the funds without a verified multi-sig `Recall` action.
- `CollaborativeStream` — The workhorse contract for sub-grants and bug bounties. Supports a three-stage lifecycle: `Propose` (project owner proposes the stream terms), `Accept` (recipient confirms), and `Activate` (optionally triggered by a designated `Verifier` upon milestone completion). This creates an auditable, on-ledger record of deliverables.
- `BatchDisbursementTemplate` — A factory pattern enabling a single ledger command to initialize reward distributions for an entire contributor cohort. Accepts structured metadata (Party ID, allocation, start date, duration) per recipient for full operational automation.
- `EmergencyControls` — Administrative template enabling `Pause`, `Resume`, and `Recall` actions. Recall is gated by M-of-N multi-sig to prevent unilateral misuse. Paused streams accumulate no new accrual, protecting project treasuries during dispute resolution.

**Operational Workflows**

- **Onboarding a long-term contributor**: Owner creates a `VestingVault` for the contributor's Canton Party ID with a configurable cliff and linear release period. The contract is instantiated on-ledger immediately. The recipient can independently verify the stream parameters without relying on the owner's word.
- **Distributing a sub-grant**: Owner proposes a `CollaborativeStream` with a `MilestoneGate`. The stream remains inactive until the project marks the milestone complete, at which point the stream activates and the sub-contractor starts accruing CC.
- **Distributing contributor incentives**: Owner uploads a CSV with Party IDs and allocated CC amounts for a cohort of open-source contributors. The `BatchDisbursementTemplate` converts these into individual streams in a single atomic transaction, replacing manual and error-prone off-chain distributions.

**Treasury Dashboard (To B)**

- **Project Owner Dashboard**: Real-time tracking of total treasury committed, claimable amounts per stream, upcoming cliff expirations, and overall burn-rate projections.
- **Contributor & Researcher Portal**: Per-second balance ticker, one-click claim interface, and full claim history. Mobile-responsive for contributors accessing from any device.
- **Batch Rewards Import Tool**: CSV/JSON upload for bulk contributor reward stream creation with validation and preview before ledger submission.

### 3. Architectural Alignment

**Daml Native Privacy and Security**  
Internal project finances — who earns what, what milestones are gate-kept by what conditions — constitute highly sensitive commercial data. StreamPay leverages Canton's sub-transaction privacy model to ensure that stream details are visible only to the `Sender`, the `Receiver`, and any explicitly designated `Auditor` parties. Unlike public-by-default streaming protocols on other chains, StreamPay is the only implementation that provides payment streaming with professional-grade confidentiality.

**CIP-56 (Canton Fungible Token) Compliance**  
Fully composable with Canton Coin (CC) and any other token issued under the CIP-56 standard. StreamPay does not hard-code any specific token — the same contract templates can manage future ecosystem assets without modification.

**Canton Ledger API Integration**  
StreamPay consumes data and executes actions through standard Canton APIs (Ledger API, JSON API), ensuring compatibility with current and future Canton protocol versions. No protocol-level modifications are required.

### 4. Backward Compatibility

*No backward compatibility impact.*

StreamPay is a standalone infrastructure layer. It does not modify any on-chain state, protocol behavior, or existing contracts. Teams can adopt it incrementally — starting with a single contributor reward stream — without any disruption to their current operations.

---

## Milestones and Deliverables

### Milestone 1: Core Contract Layer & Security Framework
- **Estimated Delivery:** 3 weeks from approval
- **Focus:** Daml contract development for vesting, sub-grant, contributor rewards, and bug bounty streaming logic.
- **Deliverables / Value Metrics:**
  - `VestingVault`, `CollaborativeStream`, and `BatchDisbursementTemplate` Daml templates, fully implemented and tested.
  - M-of-N multi-sig administrative controls for `Pause` and `Recall` actions.
  - Comprehensive unit test suite covering cliff transitions, partial claims, emergency recalls, and edge cases.
  - Integration scenario tests: contributor vesting, sub-grant milestone unlock, bulk rewards distribution, bug bounty stream activation.
  - Deployed and verified on Canton Devnet with simulated project-lifecycle scenarios.

### Milestone 2: Treasury Dashboard & Batch Tooling
- **Estimated Delivery:** 4 weeks from Milestone 1 acceptance
- **Focus:** Professional-grade Treasury Dashboard and high-efficiency batch operational tools.
- **Deliverables / Value Metrics:**
  - **Project Owner Dashboard**: Real-time multi-stream management UI with burn-rate projection and milestone status tracking.
  - **Batch Rewards Module**: CSV/JSON bulk stream creation supporting 50+ recipients with pre-submission validation and preview.
  - **Contributor Claim Portal**: Mobile-responsive real-time accrual counter with full claim history and export.
  - Webhook notifications for stream lifecycle events (activated, claimed, paused, completed).
  - Deployed and functional on Canton Testnet with end-to-end contributor rewards and vesting scenarios.

### Milestone 3: StreamPay SDK, Integration Guides & Production
- **Estimated Delivery:** 3 weeks from Milestone 2 acceptance
- **Focus:** Ecosystem developer tooling and Mainnet production launch.
- **Deliverables / Value Metrics:**
  - **StreamPay TypeScript/JavaScript SDK**: Typed library for other Canton applications to programmatically create and manage streams.
  - **Integration Playbook**: Step-by-step guide for setting up vesting, contributor rewards, sub-grants, and bug bounties with StreamPay, including sample code for all four core workflows.
  - Mainnet production deployment with verified Ledger API connectivity.
  - Open-source release of all Daml templates and SDK under Apache 2.0 license.

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone
- Demonstrated functionality or operational readiness
- Documentation and knowledge transfer provided
- Alignment with stated value metrics

**Project-specific acceptance conditions:**

- All streaming calculations must be verified using time-advance contract tests spanning multiple release periods to ensure zero rounding loss exceeding 1 microCC across all supported stream durations.
- The Batch Creation tool must successfully handle at least 50 simultaneous stream initializations in a single atomic ledger transaction.
- Privacy verification: a third-party Canton party outside of a bilateral stream must be demonstrably unable to read stream amounts or terms through standard Ledger API access.
- Emergency `Recall` must be executable only upon 2-of-3 multi-sig authorization, verified through integration tests on Testnet.
- SDK must include working code examples for all four core use cases: Team Vesting, Internal Sub-Grants, Contributor Rewards Streaming, and Bug Bounty distribution.

---

## Funding

**Total Funding Request:** 1,500,000 CC

### Payment Breakdown by Milestone
- Milestone 1 (Core Contract Layer): **450,000 CC** upon committee acceptance
- Milestone 2 (Treasury Dashboard & Batch Tools): **600,000 CC** upon committee acceptance
- Milestone 3 (SDK, Integration & Production): **450,000 CC** upon final release and acceptance

### Volatility Stipulation
The project duration is **under 6 months** (estimated 10 weeks total).

Should the project timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility.

---

## Co-Marketing

Upon release, the implementing entity will collaborate with the Foundation on:

- **Joint Announcement**: Official PR and blog post positioning StreamPay as the recommended treasury management solution for Canton-funded projects.
- **Daml Use-Case Study**: A technical article demonstrating how Canton's sub-transaction privacy enables confidential contributor compensation and vesting at the project level.
- **Developer Workshops**: Hosted sessions showing grant recipients how to configure StreamPay for their own internal team operations.
- **Ecosystem Promotion**: Collaborative social media campaign targeting B-side project owners and distributed teams building on Canton.

---

## Motivation

As the Canton ecosystem matures, it faces a critical operational gap that every professional network encounters at scale: the "last-mile" fund management problem. Ecosystem grants and investments successfully reach project treasuries, but the internal distribution of those funds to contributors, sub-contractors, and security researchers is still handled through manual, off-chain processes. This introduces accountability risks, trust dependencies, and administrative overhead that limit the quality of teams that Canton can attract.

**Canton StreamPay** empowers teams to "Automate their Integrity":

- **Align Incentives in Real Time**: A contributor accruing CC per-second as they deliver work is aligned with the project's success in a way that a quarterly lump-sum payment simply cannot replicate. Streaming turns "trust me, I'll pay you" into "watch your balance grow."
- **Fair Vesting**: Founders and investors gain cryptographic certainty that lock-up commitments are enforced on-chain. This elevates the credibility of Canton projects in the eyes of external investors.
- **Secure Bug Bounties**: Streaming bounty releases reduce the one-time liquidity shock that large payouts create and extend researcher engagement over the active duration of their vulnerability disclosure.
- **Milestone Accountability**: Sub-grants with on-ledger milestone gates create an auditable, immutable record of project deliverables — directly improving the governance quality of grant-funded teams.
- **Operational Efficiency**: Teams can batch-configure contributor reward streams in minutes rather than days, eliminating manual off-chain distributions and freeing founder bandwidth for product development.

By providing this as open-source, shared infrastructure, the Foundation demonstrates that the Canton network can support the full lifecycle of a professional software project — from grant application through contributor incentivization — entirely on-chain.

---

## Rationale

**Why focus on project-level treasury management?**  
While official network emissions and the Development Fund address the flow of CC into project treasuries, there is currently no standardized infrastructure for managing what happens *next*. Every team individually solves this problem with manual transfers and external tools. StreamPay standardizes and upgrades this process for the entire ecosystem simultaneously.

**Why Daml-native over an off-chain solution?**  
An off-chain rewards processor would require project teams to trust the operator, would introduce operational complexity, and severs the auditability chain. By encoding all logic in Daml contracts on the Canton ledger, StreamPay inherits Canton's core guarantees: atomic execution, verifiable state transitions, and sub-transaction privacy. The Foundation can audit the contract code directly rather than trusting operational promises.

**Why streaming over milestone-only disbursements?**  
Pure milestone-based payments create financial discontinuities — contributors face long periods of zero income between deliverables, which induces financial stress and incentivizes gaming of milestone definitions. Continuous per-second streaming eliminates this dynamic while preserving milestone accountability through optional gating layers.

**Alternatives considered:**

- *Manual off-chain transfers*: Lacks on-ledger accountability, requires off-chain trust, and cannot scale to distributed global contributor communities.
- *Third-party crypto reward services*: Generic tools are incompatible with Canton's privacy model and expose sensitive distribution details publicly.
- *Simple time-locked contracts*: Lacks the flexibility of MilestoneGating, streaming granularity, and the emergency controls required for professional treasury management.

StreamPay is the purpose-built, minimum viable treasury infrastructure that Canton teams need to operate as professional organizations.
