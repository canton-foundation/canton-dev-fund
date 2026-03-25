## Development Fund Proposal: Canton Featured App Provider Self-Check Kit -- Provider-Side Verification for CIP-0104 Rewards

**Author:** Srikanth  
**Implementing Entity:** Bitdynamics  
**Status:** Submitted  
**Created:** 2026-03-19  

---

## Abstract

This proposal requests funding for an open-source verification and diagnostics toolkit for featured app providers operating under `CIP-0104` traffic-based app rewards on the Global Synchronizer.

The core `CIP-0104` implementation changes how app rewards are computed, moving from marker-based activity to traffic-based attribution derived from Canton and Scan data. That improves fairness, but it also creates a new practical problem for app providers: they need a reliable way to understand, replay, and verify how their observed traffic, confirmer participation, threshold effects, and published reward outputs relate to one another.

The proposed project, **Featured App Provider Self-Check Kit**, provides:

- a CLI for replaying and verifying round-level provider reward outcomes from published data
- diagnostics for confirmer attribution, reward eligibility, and threshold burn effects
- provider-facing reports for expected versus published reward outputs
- reference documentation for app teams adapting to `CIP-0104`

The goal is not to compute canonical rewards for the network, modify Canton or Splice reward logic, or replace the main `CIP-0104` implementation. The goal is to give app providers and ecosystem participants an open-source self-check and debugging toolkit that improves transparency, reduces support burden, and increases confidence in the new reward model.

---

## Specification

### 1. Objective

The objective is to make traffic-based app rewards understandable and independently verifiable for featured app providers.

The intended outcome is that a featured app provider can:

- inspect the activity and reward data relevant to a mining round
- estimate how much activity was attributed to its provider party
- understand why rewards were reduced, burned, or omitted
- compare expected provider-level outcomes against published reward outputs
- detect configuration or workflow issues that reduce reward efficiency

This proposal is explicitly scoped as **provider-side observability and verification tooling**. It does not change the reward protocol, reward formulas, consensus workflow, or coupon creation mechanism.

### 2. Implementation Mechanics

The project will be delivered as:

- a CLI: `canton-app-rewards`
- a small reusable TypeScript library for replay and verification logic
- optional static report generation for round-level diagnostics
- documentation and example workflows for featured app providers

#### A. Data Sources

The toolkit will operate only on published and supported data sources, such as:

- Scan API endpoints exposing activity and reward-related data
- round metadata and configuration visible to app providers
- public or operator-shared information needed to interpret round outcomes

The toolkit is designed to consume published data, not privileged internal data, direct node access, or private databases.

#### B. Core Commands

The initial CLI surface is expected to include:

- `canton-app-rewards round <round-id>`
- `canton-app-rewards provider <party-id>`
- `canton-app-rewards verify <round-id> <party-id>`
- `canton-app-rewards explain-threshold <round-id>`
- `canton-app-rewards doctor`

The final command names are illustrative and may change during implementation.

#### C. What the Toolkit Will Do

The toolkit will provide:

- round-level replay of featured app provider reward attribution from published data
- provider-centric summaries of:
  - attributed activity
  - estimated reward totals
  - published reward outputs
  - rewards lost to threshold burn
- diagnostics for common causes of reward mismatch or confusion, including:
  - no featured app right at relevant round boundary
  - no qualifying confirmer participation
  - threshold-related reward burn
  - missing or delayed round data
  - differences between expected and published totals
- documentation helping app teams interpret reward outcomes under `CIP-0104`

#### D. Explicitly Out of Scope

To keep the scope clear and non-overlapping, this proposal does **not** include:

- Canton node changes
- Scan reward computation changes
- SV trigger or Daml reward workflow changes
- protocol or CIP authorship work
- any canonical or authoritative reward decision logic replacing the network
- hosted dashboards or ongoing managed analytics services

### 3. Relationship to CIP-0104

This proposal is complementary to `CIP-0104`, not a substitute for it.

It does **not** implement traffic-based app rewards themselves. Instead, it helps ecosystem participants understand and verify the outcomes of the traffic-based app reward system once those outcomes are observable through the published data surface.

That distinction is important:

- `CIP-0104` implementation changes how rewards are computed and emitted
- this proposal helps app providers inspect, replay, and explain those results

### 4. Architectural Alignment

This proposal aligns well with Canton and Development Fund priorities because it:

- improves transparency for app providers
- reduces ecosystem support burden during and after reward-system transition
- encourages trust in a more objective reward mechanism
- gives featured app providers a public-good verification tool rather than forcing each team to build private analytics

This is ecosystem tooling, not private infrastructure.

### 5. Delivery Feasibility

This proposal is intentionally narrow enough to be delivered credibly:

- it consumes published data rather than modifying the protocol
- it focuses on one user group: featured app providers
- it delivers one verification library, one CLI, and one documentation set
- it avoids hosted infrastructure and production service ownership

The initial release will support one main workflow well: verifying and explaining provider-level reward outcomes for traffic-based rewards on the Global Synchronizer.

### 6. Backward Compatibility

No backward compatibility impact.

This project is additive. App providers can adopt it incrementally or ignore it entirely.

---

## Milestones and Deliverables

### Milestone 1: Public Alpha for Provider Reward Replay

A provider can run the replay engine for a sample round and get a deterministic explanation of its attributed reward outcome.

### Milestone 2: External Provider Evaluation

At least one provider or evaluator completes a documented verification run and records whether the outputs meaningfully explain threshold burn, eligibility, and mismatch cases.

### Milestone 3: Hardened Provider Diagnostics Release

The CLI, reports, and documentation are hardened from that feedback so a provider can verify a round outcome from scratch without custom scripts.

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- the toolkit can ingest published reward-related data from supported APIs
- provider-level replay results are deterministic for documented sample rounds
- the CLI can explain at least the common cases of:
  - attributed activity present
  - reward below threshold
  - no qualifying reward output
  - mismatch between expected and published totals
- documentation clearly distinguishes advisory verification output from the network’s canonical reward workflow
- the project is released as open source

Project-specific acceptance conditions:

- the toolkit must remain advisory and diagnostic, not claim authority over canonical reward outcomes
- the project must not require changes to Canton, Scan, SV apps, or Daml reward contracts
- the project must operate on published supported data only, without direct node or private database access
- the first release must stay focused on `CIP-0104` provider verification rather than expanding into a broader analytics platform

---

## Funding

**Total Funding Request:** 620,000 CC

### Payment Breakdown by Milestone

- Milestone 1 _(Reward Replay and Verification Core)_: 240,000 CC upon committee acceptance
- Milestone 2 _(CLI and Diagnostics)_: 220,000 CC upon committee acceptance
- Milestone 3 _(Provider Documentation and Example Reports)_: 160,000 CC upon final release and acceptance

### Funding Rationale

- Milestone 1 funds the main technical value of the proposal: deterministic replay and provider-level verification logic.
- Milestone 2 funds the practical ecosystem usability layer: CLI commands, diagnostics, and report output.
- Milestone 3 funds adoption and self-serve support: documentation, examples, and release packaging.
- No recurring maintenance or hosted-service budget is requested in this proposal.

## Team Background

### BitDynamics

BitDynamics brings deep experience in building and operating blockchain infrastructure. The team has worked across Ethereum client infrastructure, validator operations, and production-grade hosting systems supporting validator infrastructure securing more than 2 billion AUD in assets. This background is directly relevant to building reliable, auditable, and security-conscious public infrastructure for a grants program. Team is also building actively on Canton. 


### Volatility Stipulation

If the project duration extends materially due to committee-requested scope changes, remaining milestones should be renegotiated for significant CC/USD volatility.

---

## Co-Marketing

Upon release, the implementing entity will collaborate with the Foundation on:

- announcement coordination
- a short technical write-up explaining how providers can verify traffic-based rewards
- one ecosystem-facing walkthrough or demo

Specific commitments:

- publish a provider guide for understanding traffic-based app reward outputs
- publish at least one sample round verification walkthrough

---

## Motivation

`CIP-0104` improves fairness by tying app rewards to actual network traffic burn. But fairness alone is not enough if app providers cannot understand, verify, and debug the resulting numbers.

Without a shared verification toolkit, every featured app provider will face the same questions privately:

- why was this activity attributed to me?
- why was my reward lower than expected?
- did the threshold burn my round reward?
- how do I compare my traffic cost to my reward result?

An open-source self-check toolkit turns those repeated questions into a reusable public-good asset, reduces support burden on the ecosystem, and increases confidence in the reward system during and after the transition to traffic-based rewards.

---

## Rationale

This proposal is intentionally narrower than the core `CIP-0104` implementation work.

That is a strength:

- it has low overlap with protocol and reward-engine changes
- it serves a real need created by the move to traffic-based rewards
- it is easy to verify and much cheaper than core infrastructure changes
- it helps app providers adapt without creating new governance or protocol complexity

The result is a high-leverage ecosystem tool: provider-side transparency and verification for a major reward-system transition, delivered without modifying the underlying reward protocol itself.
