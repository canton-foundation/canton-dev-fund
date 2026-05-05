## Development Fund Proposal: Reference Implementation of Settlement Pattern and Reference DEX Implementation for Canton

- **Author:** Srikanth
- **Status:** Submitted
- **Created:** 2026-03-19

-----

## Abstract

This proposal requests funding to build, open-source, document, and operate a
reference implementation of a token-standard-native settlement pattern and a
reference DEX on Canton.

The goal is not to recreate all of Uniswap V2 or V3, and it is not to build a
hosted exchange business. The goal is to give the ecosystem a production-shaped
open-source reference that shows how to build trading and liquidity workflows
directly on top of:

- Token Standard V2 holdings, allocations, and settlement
- registry-backed `InstrumentConfiguration`
- Canton’s native multi-synchronizer support

The reference implementation will demonstrate:

- matched OTC / RFQ settlement using the Token Standard V2 trading pattern
- prefunded orders backed by `V2.Allocation`
- liquidity pools whose funds are also represented by `V2.Allocation`
- an LP token issued as a normal tradable instrument
- a public testnet deployment that external teams can inspect and use

This proposal is intentionally workflow-first. The main contribution is not AMM
branding or UI polish; it is a set of Daml workflows, contracts, tests,
operator guidance, and builder documentation that show:

- a reusable settlement pattern for trading applications on Canton
- a concrete reference DEX built on that settlement pattern

---

## Specification

### 1. Problem Statement

Canton has strong primitives for multi-synchronizer applications and the Token
Standard is rapidly becoming the canonical asset interface. What the ecosystem
needs is a clear open-source reference for how to build an exchange
directly on those primitives.

Today, builders can find:

- token-standard API and validation examples
- settlement-oriented examples such as `TradingAppV2`

But they still do not have a public, production-shaped reference that answers
questions such as:

- how should bids and asks be modeled on-ledger?
- how should reserved funds be represented?
- how should liquidity-pool funds be represented?
- how should LP tokens be issued?
- how should rich instruments trade without custom settlement paths?
- what should the Daml workflow boundaries actually look like?

That gap slows down Defi on Canton including DEXs, AMMs, trading venues, and other exchange-like
applications on Canton.

### 2. Objective

The objective is to publish a practical reference implementation that lowers the
barrier for teams building trading applications on Canton.

The intended outcome is that any team can:

- run a working settlement-pattern reference and reference DEX locally and on
  testnet
- understand the Daml workflow design for trades, orders, pools, and LP tokens
- see how `V2.Allocation` is used for both reserved order funds and pool funds
- understand how `InstrumentId` and registry-backed instrument configuration
  fit into trading flows
- reuse parts of the code and docs while being clear about the reference
  boundary

This project is explicitly positioned as public ecosystem infrastructure, not a
hosted venue, not a standards proposal, and not a full-featured replacement for
existing AMMs.

### 3. Proposed Solution

The proposed deliverable is a token-standard-native settlement-pattern reference
and reference DEX with four core workflow families.

#### A. Pair and instrument workflows

- list arbitrary trading pairs of `InstrumentId`
- integrate with registry-backed instrument configuration
- show how lifecycle-rich assets still fit the same trading model

#### B. Matched trade workflows

- support OTC / RFQ settlement as the first runnable path
- use the `TradingAppV2` style allocation-request and batch-settlement pattern
- document cancellation, expiry, and recovery flows

#### C. Order workflows

- represent bids and asks as DEX contracts backed by prefunded allocations
- show partial fill, full fill, cancel, and expiry behavior
- keep the order contract as market state and the allocation as funds state

#### D. Pool workflows

- implement a constant-product pool as the first AMM surface
- represent pool funds using committed and iterated allocations
- mint and burn an LP token as a normal token-standard instrument
- support add liquidity, remove liquidity, and single-hop swaps with slippage
  bounds

The first public version will be intentionally simpler than Uniswap of ETH Ecosystem:

- no concentrated liquidity
- no tick math
- no NFT LP positions
- no multi-hop routing
- no permissionless pool factory

That is deliberate. The hard part here is getting the Daml workflow model right,
not maximizing AMM feature count.

### 4. Why This Is Canton-Native

The proposal is aligned with current Canton direction because it makes the
token-standard path the headline story rather than treating it as an adapter.

Specifically:

- trades settle through token-standard allocation and settlement interfaces
- pools use token-standard allocations for liquidity, not custom escrow wrappers
- assets are identified by `InstrumentId` and explained through registry-backed
  configuration
- the app relies on Canton’s native multi-synchronizer support rather than
  presenting manual reassignment choreography as the product story

In other words, the reference implementation is designed to demonstrate how
exchange logic can be application-owned while settlement remains
standard-native.

### 5. Current Status and Dependency Assumptions

The main funded work is to implement and publish the reference in a form the ecosystem can run and learn from.

The design is grounded in:

- the Token Standard V2 trading example (`TradingAppV2`)
- registry workflow guidance around `InstrumentConfiguration`
- the proposed allocation extensions discussed in Splice PR 5333, especially:
  - iterated settlement
  - committed allocations
  - `Allocation_Adjust`
  - next-iteration allocation roll-forward

This project does not require protocol changes from Canton itself. It does, however, assume that the reference will build against either:

- the landed Token Standard V2 allocation API, or
- a branch/fork that includes the PR-5333-style semantics if upstream timing
  requires it

That dependency will be documented explicitly in the repository and milestone
acceptance criteria.

### 6. Out of Scope

Out of scope for this proposal:

- Uniswap style V3 parity
- concentrated liquidity and tick math
- permissionless pool factories and multi-hop routing
- a hosted mainnet exchange business
- a generic settlement framework
- wrapper-first architecture
- bespoke integrations for proprietary third-party custody platforms
- formal standards authorship beyond practical feedback from implementation

### 7. Architectural Alignment

This proposal aligns with Canton priorities because it delivers:

- a public reference application built directly on the token standard
- reusable Daml workflows for exchange builders
- a practical example of how registry, token standard, and app contracts fit
  together
- a production-shaped public instance that external teams can evaluate

It also helps with developer onboarding. Many teams understand AMM or order-book
products conceptually, but do not yet know what a clean Canton-native
implementation should look like.

### 8. Backward Compatibility

*No backward compatibility impact.*

This project is additive. It introduces a new public reference application and
docs without requiring changes to existing Canton core behavior.

---

## Milestones and Deliverables

### Milestone 1: Public Release and Initial Ecosystem Adoption

- **Estimated Delivery:** 4 weeks from project start
- **Focus:** Publish the settlement-pattern reference and reference DEX baseline
  in a form external builders can run and evaluate.
- **Deliverables / Value Metrics:**
  - public Apache 2.0 repository for the settlement-pattern reference and
    reference DEX
  - Daml modules for pair listing and OTC / RFQ settlement baseline
  - tests showing matched trade settlement using Token Standard V2 patterns
  - workflow documentation explaining pair, trade, order, pool, and LP flows
  - local dev environment and run instructions for external builders
  - at least two concrete ecosystem feedback loops completed
    - example: committee review, builder review, or partner evaluation
  - at least one public walkthrough or demo session delivered

### Milestone 2: Public Testnet and Builder Adoption

- **Estimated Delivery:** 6 weeks after Milestone 1
- **Focus:** Deliver the first production-shaped AMM surface and operate a
  public testnet instance that external teams can actually evaluate.
- **Deliverables / Value Metrics:**
  - constant-product pool implementation
  - add liquidity, remove liquidity, and single-hop swap workflows
  - LP token issued as a token-standard instrument
  - pool funds represented by committed / iterated allocations
  - public testnet deployment operated by the team
  - operator notes covering deployment, recovery, and observability
  - at least two external teams or ecosystem builders actively evaluating the
    public testnet or codebase
  - documented feedback from those evaluations incorporated into the reference

### Milestone 3: Reuse Proof Points, Builder Guide, and Integration Readiness

- **Estimated Delivery:** 4 weeks after Milestone 2
- **Focus:** Extend the reference from pool-only trading to prefunded orders
  and turn it into something builders can realistically adopt or extend.
- **Deliverables / Value Metrics:**
  - order placement, match, partial fill, and cancel workflows backed by
    `V2.Allocation`
  - builder guide explaining workflow choices and Daml contract boundaries
  - guide for adding a new trading pair
  - guide for issuing a new LP token or lifecycle-rich instrument
  - architecture note explaining what is intentionally not included in the
    reference and why
  - at least one concrete reuse proof point
    - example: external integration, external fork, or documented partner pilot
  - a published summary of ecosystem feedback and resulting design changes

### Milestone 4: Audit, Production Hardening, and 12 Months of Maintenance
- **Estimated Delivery:** begins after Milestone 3 and covers the following 12 months
- **Focus:**- take the reference DEX and settlement-pattern implementation from integration-ready to operationally maintainable, with external audit, remediation, and sustained support for adopters.
- **Deliverables / Value Metrics:**
  - third-party security audit commissioned once Milestone 3 scope is stable and deployment-critical workflows are frozen
  - published audit summary and remediation status
  - closure or accepted-risk disposition for all critical and high-severity findings
  - production hardening pass across the reference workflows
  - examples: authorization review, cancellation paths, failure handling, replay/idempotency checks, and operator recovery procedures
  - maintenance and support for 12 months after audit release
  - security fixes
  - compatibility updates for supported Canton / SDK / token-standard changes
  - bug fixes for the published reference workflows
  - public maintenance log or release notes covering fixes, upgrades, and workflow-impacting changes
  - operator runbook for deployment, monitoring, upgrade, and incident handling
  - documented support for external adopters using or evaluating the reference

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- deliverables completed as specified for each milestone
- demonstrated functionality for the published trading flows
- documentation and knowledge transfer provided
- alignment with the stated public-good scope

Project-specific acceptance conditions:

- the reference implementation is released publicly under Apache 2.0
- the published code includes runnable Daml packages, tests, and a local dev
  environment
- the repo clearly documents the token-standard and registry dependencies
- Milestone 1 demonstrates at least one end-to-end OTC / RFQ settlement flow
- Milestone 2 demonstrates add liquidity, remove liquidity, and pool swap on a
  public testnet deployment
- Milestone 2 includes concrete evidence of external evaluation or adoption
- Milestone 2 documents whether it is running against landed upstream V2 APIs
  or a PR-5333-compatible branch
- Milestone 3 demonstrates prefunded order placement and settlement using
  allocation-backed order state
- Milestone 3 includes at least one concrete reuse proof point from outside the
  core implementing team
- Milestone 4 includes Audit from a reputable audit firm and maintaenance covering 12 months from the date of delivery
- documentation clearly distinguishes:
  - app logic
  - token-standard logic
  - registry / instrument logic
- the builder guide is sufficient for an external team to understand the
  workflow model and adapt the reference

If upstream Token Standard V2 semantics shift before Milestone 2 or 3, the
acceptance criterion is not literal field-name stability. The acceptance
criterion is preservation of the same design intent on the best available V2
surface.

---

## Funding

**Total Funding Request:** 1,100,000 CC

### Payment Breakdown by Milestone

- Milestone 1 _(Public Release and Initial Ecosystem Adoption)_:
  250,000 CC upon committee acceptance
- Milestone 2 _(Public Testnet and Builder Adoption)_:
  350,000 CC upon committee acceptance
- Milestone 3 _(Reuse Proof Points, Builder Guide, and Integration Readiness)_:
  300,000 CC upon committee acceptance
- Milestone 4 _(Audit and maintenance for 12 months )_:
  200,000 CC upon committee acceptance + Audit cost which will be submitted for approval once Milestone 3 is completed


### Audit Funding

Formal audit funding is intentionally not included in this request.

If the reference progresses successfully toward Milestone 3 and the scope is
stable enough for external review, audit funding will be requested separately
based on third-party quotes obtained closer to that milestone.


### Volatility Stipulation

If the project timeline extends beyond 6 months due to Committee-requested
scope changes or upstream API timing outside the team’s control, any remaining
milestones should be renegotiated to account for material CC/USD volatility.
---

## Team Background

BitDynamics brings deep experience in blockchain infrastructure, validator
operations, and production-grade operational systems. That background is
directly relevant to shipping public reference infrastructure that is not only
correct in code, but also runnable and teachable for other teams.

The team is also actively building on Canton and is already working through the
specific workflow questions that exchange builders face when moving from EVM
mental models to Daml and Canton.

---

## Potential Ecosystem Beneficiaries

This proposal is intended as public-good infrastructure for the wider Canton
ecosystem.

The strongest fit is for:

- DEXs and AMMs
- trading venues and RFQ platforms
- tokenized securities and bond platforms
- wrapped-asset and bridge projects
- custody and settlement applications
- teams building lifecycle-rich instruments that still need standard trading
  surfaces

More broadly, the project is intended to benefit:

- teams that want a Canton-native exchange reference instead of starting from
  scratch
- builders who understand DeFi product concepts but need help mapping them into
  Daml workflows
- application teams that want to trade arbitrary `InstrumentId` pairs rather
  than hardcoding asset-specific settlement paths

## Adoption and Reuse Boundary

The project is meant to be reused as both code and blueprint.

Teams should be able to reuse:

- selected Daml workflow modules
- tests and example flows
- deployment and operator notes
- builder documentation and architecture guidance

At the same time, the repo will be explicit about what remains reference scope:

- it is not a hosted exchange product
- it is not a complete AMM feature superset
- it is not a generic settlement layer for every possible asset model

## Co-Marketing

Upon release, the implementing entity will collaborate with the Foundation on:

- announcement coordination
- a technical blog post or written walkthrough
- at least one developer-facing demo or workshop session

Specific commitments:

- publish at least one end-to-end walkthrough of a trade flow
- publish at least one end-to-end walkthrough of a pool flow
- publish integration notes for teams evaluating adoption of the reference

---

## Motivation

If the Canton ecosystem wants more trading applications, it needs more than
asset standards and isolated examples. It needs a public reference showing how
those pieces become an actual exchange.

Right now, too many exchange builders still have to answer the same questions
from scratch:

- where should order state live?
- where should reserved funds live?
- what is the boundary between app contracts and settlement contracts?
- how should LP tokens be modeled?
- how should lifecycle-rich assets remain tradable?

A good public settlement-pattern reference and reference DEX would give the
ecosystem:

- a concrete starting point for exchange builders
- a realistic testnet system to study and evaluate
- a reusable workflow model for Daml applications
- a better bridge from DeFi product concepts to Canton-native implementation

That makes this a strong candidate for Development Fund support as reusable
open-source ecosystem infrastructure.

---

## Rationale

This proposal is intentionally scoped as a reference implementation of a
settlement pattern and reference DEX with a public testnet instance rather than
a broad trading platform business.

That is the right scope because:

- the ecosystem needs a practical example more urgently than a maximally broad
  feature set
- the main technical challenge is workflow design, which is best shared as open
  public infrastructure
- a constant-product plus prefunded-order baseline is enough to be credible
  without drifting into AMM feature sprawl
- a public testnet instance makes the work far more useful than docs alone

The `1,100,000 CC` request prices the project as public ecosystem infrastructure:
code, workflows, tests, docs, and a public reference deployment that others can
run and learn from, while deferring formal audit funding until the scope is
stable enough to quote properly.

