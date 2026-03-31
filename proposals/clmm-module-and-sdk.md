## Development Fund Proposal

**Author:** blackthornlover <h@bitdynamics.me>, Zhe Li <zhe@bitdynamics.me>, Srikanth Yeleswarapu <srikanth@bitdynamics.me>
**Implementing Entity:** Bitdynamics
**Status:** Submitted
**Created:** 2026-02-24

---

## Abstract

This proposal requests funding to build and harden an open-source **Canton-native concentrated liquidity reference implementation** with an invariant-tested core module, a thin TypeScript SDK, permissioned-pool support, LocalNet and integration harnesses, and a year-long compatibility and adoption runway.

The goal is not to fund a single DEX product. The goal is to deliver **shared DeFi infrastructure** that multiple future teams can adopt instead of each privately re-implementing concentrated-liquidity math, fee accounting, position accounting, and integration glue. That aligns directly with the Development Fund's support for **reference implementations**, **critical ecosystem infrastructure**, and **DeFi liquidity seeding where required for early utility**.

This 12-month version keeps the infrastructure framing, but uses the longer runway to make the output more credible for ecosystem adoption:

- a reusable CLMM core module for Canton
- a rigorous invariant and edge-case test harness
- a thin TypeScript SDK and integration toolkit
- permissioned-pool baseline support for regulated environments
- release hardening, compatibility work, and adoption support for early integrators

It does **not** seek to fund a full DEX business, routing engine, liquidity mining program, or a broad application platform in this proposal.

---

## Specification

### 1. Objective

If Canton DeFi is going to have early utility, it will need credible shared liquidity primitives.

Today, every team exploring DEXes, liquidity vaults, routing, or market infrastructure faces the same problem:

- re-implement concentrated-liquidity math and tick logic from scratch
- rebuild fee and position accounting privately
- create custom integration helpers and demos for every project
- absorb correctness and maintenance risk independently

That is exactly the kind of duplicated ecosystem cost a development fund should reduce.

This proposal therefore focuses on one narrow objective:

**Deliver a reusable CLMM reference implementation for Canton that reduces duplicated risk and gives future DeFi builders a shared base layer.**

This proposal does not assume that Canton DeFi is already mature. It argues the opposite: because DeFi is early, the ecosystem benefits more from one well-tested shared primitive than from several inconsistent private implementations.

### 2. Implementation Mechanics

The project will be delivered in four tightly scoped parts.

#### A. CLMM Core Module (DAML / Canton Contracts + Math Library)

The core module will provide:

- pool creation with configurable fee tier and tick spacing
- position management for bounded-range liquidity
- swap execution with fee accrual and tick crossing
- liquidity add/remove flows with correct accounting
- fee collection for positions
- oracle hook interface for future extensions
- optional permissioned-pool baseline for allowlisted environments

The design goal is not to maximize feature count. The design goal is to make the accounting model, position behavior, and invariants explicit and testable.

#### B. Thin TypeScript SDK

The SDK will stay intentionally small. It will provide:

- transaction builders for core CLMM actions
- normalized state readers for pool and position views
- typed helper utilities for integration code
- LocalNet-friendly fixtures and test helpers

The SDK is not intended to become a full application framework, wallet layer, router, analytics platform, or emissions engine.

#### C. Reference Integration and Validation Harness

The project will include:

- a LocalNet demo flow showing pool creation, liquidity provision, swap, and fee collection
- invariant and edge-case test suites
- integration documentation for future builders
- operational documentation covering limitations, failure modes, and upgrade considerations
- compatibility validation against evolving Canton toolchains during the funded period

#### D. Hardening and Adoption Support

The longer funding window is intended to make the shared primitive more usable by others, not to expand into unrelated product work. It will fund:

- structured hardening passes
- pre-release security/design review preparation and follow-up fixes
- compatibility maintenance as Canton/Splice tooling evolves during the funded period
- adopter-facing examples, walkthroughs, and integration support materials

#### Explicitly Out of Scope

To keep the proposal realistic and reviewer-friendly, this proposal does **not** include:

- a production DEX product
- routing or aggregator logic
- liquidity mining or emissions design
- vault strategies
- broad Rust or multi-language SDK expansion
- hosted infrastructure
- claims of unaudited production readiness for mainnet deployment

#### Relationship to Existing Tooling

This proposal is designed to complement existing Canton tooling:

- It does **not** replace DAML build/test/codegen flows.
- It does **not** replace wallet tooling.
- It does **not** modify Canton protocol behavior.
- It does provide a reusable DeFi primitive that multiple future teams can safely build on.

### 3. Architectural Alignment

This proposal aligns with the Development Fund in four direct ways:

- it is a **reference implementation**
- it is **critical ecosystem infrastructure** usable by multiple teams
- it contributes to early **DeFi utility** as a reusable common-good building block
- it remains open-source and reusable rather than tied to one private venue

It also fits Canton technically:

- no protocol changes are required
- contract logic remains external to Canton core
- privacy and permissioning concerns can be reflected through permissioned-pool mode and reporting hooks
- future builders can integrate it incrementally instead of rewriting the primitive

### 4. Backward Compatibility

No backward compatibility impact.

This is an external module and SDK. Teams may adopt it gradually or not at all.

---

## Milestones and Deliverables

### Milestone 1: CLMM Core Module and Invariant Harness

- **Estimated Delivery:** Month 3
- **Adoption Goal:** At least one Canton DeFi builder team has reviewed the core CLMM contracts and invariant harness, confirmed that the accounting model and pool lifecycle are legible and applicable to their liquidity use case, and provided written feedback incorporated into the published implementation.
- **Deliverables / Adoption Criteria:**
  - CLMM core contracts for pool creation, add/remove liquidity, swap, and fee collection, reviewed by at least one external Canton DeFi developer who confirmed the accounting model is correct and usable for their purposes
  - tick math and accounting library with deterministic unit coverage confirmed by at least one reviewer who has run the test suite and validated edge-case behavior against their own expectations
  - invariant and edge-case test harness reviewed and confirmed comprehensive by at least one external Canton developer who has contributed or suggested at least one additional test case
  - LocalNet "Hello CLMM" demo confirmed reproducible by at least one developer following the published documentation without prior knowledge of the implementation
  - written confirmation from at least one Canton DeFi builder that the pool lifecycle documentation is sufficient to evaluate integration without reverse-engineering the contracts

### Milestone 2: Thin TypeScript SDK and Integration Toolkit

- **Estimated Delivery:** Month 6
- **Adoption Goal:** At least one Canton DeFi team has integrated the TypeScript SDK into their own application or prototype, confirmed that it removes repetitive transaction plumbing, and provided feedback incorporated into the published SDK.
- **Deliverables / Adoption Criteria:**
  - thin TypeScript SDK with transaction builders for core CLMM operations, adopted by at least one external Canton developer who confirmed it eliminates hand-written transaction plumbing in their integration
  - normalized pool and position readers confirmed correct by at least one developer who has used them in a real or prototype application against the CLMM core module
  - LocalNet integration helpers and fixtures confirmed CI-reproducible by at least one external developer who has integrated them into their own test environment
  - written confirmation from at least one Canton DeFi builder that the SDK upgrade and migration notes are clear and actionable for their development workflow

### Milestone 3: Permissioned Pool Baseline, Hardening, and Release Candidate

- **Estimated Delivery:** Month 9
- **Adoption Goal:** At least one regulated or institutional Canton application team has reviewed the permissioned-pool baseline, confirmed that the allowlist-style access controls are sufficient for their compliance or counterparty-management requirements, and provided feedback incorporated into the published release candidate.
- **Deliverables / Adoption Criteria:**
  - optional permissioned-pool baseline reviewed and confirmed fit-for-purpose by at least one Canton team operating in a regulated or counterparty-controlled environment
  - hardening pass findings reviewed by at least one external developer who confirmed the documented limitations and edge cases match their operational expectations
  - pre-release security and design review checklist with publicly documented findings and work items confirmed reviewed by at least one external Canton developer
  - release-candidate documentation and example templates confirmed usable by at least one prospective adopter who has followed them to evaluate integration

### Milestone 4: Compatibility, Adoption Support, and Public Release

- **Estimated Delivery:** Month 12
- **Adoption Goal:** At least three independent Canton DeFi or application teams have adopted or integrated some portion of the CLMM module — core contracts, SDK, or permissioned-pool baseline — and the project has been publicly released with documented adoption evidence so that future teams can start from a validated, community-reviewed base layer.
- **Deliverables / Adoption Criteria:**
  - compatibility updates for relevant Canton/Splice changes confirmed working by at least one adopter who has upgraded their integration during the funded period
  - at least three independent adoption confirmations documented in the public repository (team testimonials, linked integrations, or recorded walkthroughs)
  - adopter guide reviewed and confirmed actionable by at least one external Canton DeFi builder who has followed it to evaluate integration for a DEX, vault, or market-infrastructure use case
  - at least two public walkthroughs, workshops, or office-hours sessions completed with confirmed external attendees
  - the full package — CLMM module, SDK, examples, and docs — released as open source under a permissive license, with at least one issue or improvement submitted by a community contributor during the funded period

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- milestone-by-milestone delivery as specified
- passing deterministic test coverage for:
  - tick math edge cases and rounding
  - fee accrual correctness across swaps and multiple positions
  - liquidity accounting during tick crossing
- working LocalNet demo showing:
  - pool deploy and initialization
  - liquidity provision and removal
  - swap execution across price ranges
  - fee collection aligned with expected outcomes
- TypeScript SDK usability:
  - builders and readers compile and run in the reference integration
  - integration code removes repetitive hand-written transaction plumbing
- documentation sufficient for a new team to evaluate and integrate the module
- compatibility maintenance demonstrated against the Canton/Splice versions released during the funded period

Project-specific acceptance conditions:

- the project must remain scoped to a reusable CLMM primitive and thin SDK
- the project must be released as open source
- the release must document known limitations and must not claim unaudited mainnet readiness
- the reference integration must be reproducible from repository documentation on LocalNet

---

## Funding

**Total Funding Request:** 1,600,000 CC over 12 months

### Payment Breakdown by Milestone

- Milestone 1 _(CLMM Core Module and Invariant Harness)_: 600,000 CC upon committee acceptance
- Milestone 2 _(Thin TypeScript SDK and Integration Toolkit)_: 400,000 CC upon committee acceptance
- Milestone 3 _(Permissioned Pool Baseline, Hardening, and Release Candidate)_: 500,000 CC upon committee acceptance
- Milestone 4 _(Compatibility, Adoption Support, and Public Release)_: 200,000 CC upon final release and acceptance

### Volatility Stipulation

Because the project duration is expected to extend to 12 months, the grant should be re-evaluated at the 6-month mark to account for material CC/USD volatility.

No hosted service budget is requested in this proposal. The longer timeline is intended to fund engineering, hardening, compatibility work, and ecosystem adoption support for a shared open-source infrastructure module.

---

## Co-Marketing

Upon release, the implementing entity will collaborate with the Foundation on:

- announcement coordination for major milestone releases
- one technical write-up explaining the CLMM architecture and invariants
- one public case study or walkthrough on integrating the primitive into a DeFi application
- workshops or office hours supporting early adopters

Specific commitments:

- publish onboarding documentation for future adopters
- publish at least one example integration flow for a Canton DeFi builder

---

## Motivation

The fund README explicitly recognizes **critical ecosystem infrastructure**, **reference implementations**, and **DeFi liquidity seeding where required for early utility** as valid areas of support.

This proposal fits that mandate best when understood as infrastructure, not as a single application.

If early Canton DeFi is going to exist at all, teams will need a shared liquidity primitive that is:

- reusable
- testable
- easier to integrate than a fresh greenfield build
- more credible than a collection of private one-off AMMs

Without that, the ecosystem risks fragmentation:

- multiple incompatible AMMs
- duplicated correctness risk
- slower onboarding for future DeFi teams
- weaker institutional confidence in the quality of shared primitives

This proposal addresses that gap by funding the base layer that later venues, vaults, and market applications can build on.

---

## Rationale

This 12-month version keeps the infrastructure framing but uses the larger budget to fund **credibility and durability**, not product sprawl.

Why the longer form is defensible:

1. DeFi infrastructure is unusually sensitive to accounting and correctness risk.
2. A shared primitive only becomes ecosystem infrastructure if others can realistically adopt it.
3. Compatibility, hardening, examples, and early-adopter support matter more here than in a small throwaway prototype.
4. The cost is easier to justify when the funded outcome is a hardened public reference implementation with a meaningful adoption runway.

That said, the scope remains intentionally constrained:

- one shared CLMM primitive
- one thin SDK
- one reproducible integration path
- one funded year of hardening and ecosystem adoption support

This keeps the proposal aligned with the fund's README while making the larger ask more intelligible.
