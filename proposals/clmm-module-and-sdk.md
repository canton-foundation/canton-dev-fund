---
title: Canton CLMM Module & SDK
author: blackthornlover <h@bitdynamics.me>, Zhe Li <zhe@bitdynamics.me>, Srikanth Yeleswarapu <srikanth@bitdynamics.me>
status: Submitted
created: 2026-02-24
---

# Canton CLMM Module & SDK

## Abstract

Canton CLMM Module & SDK delivers a reusable, Canton-native concentrated liquidity AMM primitive (Uniswap v3–style model) plus a production-ready developer SDK for building DEXes, liquidity vaults, and routing applications on Canton. The goal is to provide a shared public good that avoids every DeFi builder having to re-implement CLMM math, pool management, fee accounting, and integration plumbing—while staying aligned with Canton's privacy-first, regulated-finance posture via optional permissioned/controlled pools and audit-capable reporting.

## Specification

### 1. Objective

DeFi on Canton is early, but multiple teams are already proposing DEX, market, settlement, and liquidity concepts. Today, builders must either:

- re-implement concentrated liquidity mechanics from scratch, or
- fall back to simpler pool models that don't meet institutional requirements (capital efficiency, fee control, and consistent accounting).

This proposal aims to standardize the core CLMM logic and tooling as a reusable module and SDK, enabling:

- consistent pool economics and accounting across apps
- faster development cycles for DEXes and vaults
- safer integrations (shared battle-tested math/tests)
- a credible path toward institutional adoption

### 2. Implementation Mechanics

The project ships in two major components:

#### 2.1 CLMM Module (DAML / Canton Contracts & Libraries)

- Pool definition supporting configurable tick spacing, fee tiers, and pool parameters
- Position representation (range-based liquidity positions) with minted shares/claims
- Swap execution with fee accrual, price movement, and tick crossing
- Liquidity operations (add/remove) with correct pro-rata accounting and fee claims
- Oracle hooks (TWA/TWAP hooks, snapshotting, adapters for external price feeds)
- Optional: permissioned pool mode (KYC/allowlist) + selective disclosure reporting blueprint

#### 2.2 Developer SDK (TypeScript + Rust bindings, where feasible)

- Transaction builders for swaps, add/remove liquidity, fee collection
- Event indexing helpers and normalized pool state readers
- LocalNet integration helpers for testing
- Reference UI flows and code examples for DEX frontends and bot integrations
- Upgrade/migration patterns (pool upgrades, parameter changes, new tick spacing)

#### Relationship to Existing Tooling (Complementary, not duplicative)

The CLMM Module & SDK is designed to fit into existing Canton developer workflows:

- Does not replace DAML tooling (build/test/codegen)
- Does not change Canton protocol behavior
- Does provide a consistent DeFi primitive that other projects can safely adopt

## Milestones and Deliverables

### Milestone 1: CLMM Core Module (Contracts + Math Library)

**Estimated Delivery:** Month 3
**Focus:** core pool/position/swap mechanics with foundational test coverage

**Deliverables / Value Metrics:**

- Core CLMM contracts: pool creation, add/remove liquidity, swap, collect fees
- Extensive unit tests for tick math, fee accounting, liquidity accounting
- Basic oracle integration hooks and sample adapter
- Documentation: pool lifecycle, invariants, expected outcomes, state diagrams
- "Hello CLMM" sample app on LocalNet (swap + provide liquidity demo)

### Milestone 2: Developer SDK (TS + Rust bindings)

**Estimated Delivery:** Month 6
**Focus:** developer productivity and integration consistency

**Deliverables / Value Metrics:**

- SDK transaction builder utilities for core operations
- Event/state readers with normalized data structures
- LocalNet harness for automated tests (CLI/CI-friendly)
- Reference DEX frontend snippets (swap form, position management)
- Integration guide for external services (routing, bots, analytics)

### Milestone 3: Reference DEX Integration + Institutional Enhancements

**Estimated Delivery:** Month 9
**Focus:** showcase production-ready integration and institutional features

**Deliverables / Value Metrics:**

- Reference DEX MVP using the CLMM module
- Optional permissioned pool flow (allowlists) + selective disclosure reporting blueprint
- Operational documentation: monitoring, risk controls, failure modes, upgrade paths
- Security review plan + patching loop (based on findings)
- Public release: docs, examples, templates for ecosystem adoption

### Milestone 4: Maintenance & Adoption Support

**Estimated Delivery:** Month 12
**Focus:** stability, compatibility, and ecosystem onboarding

**Deliverables / Value Metrics:**

- Compatibility updates as Canton toolchain evolves
- 2 workshops/office-hours sessions for teams adopting the module/SDK
- 1 technical blog/case study showcasing integration patterns

## Acceptance Criteria

The Tech & Ops Committee evaluates completion based on:

- Milestone-by-milestone delivery as specified
- Passing test suite covering:
  - tick math edge cases and rounding
  - fee accrual correctness across swaps and multiple positions
  - liquidity operations correctness during tick crossing
- Working LocalNet demo:
  - pool deploy + liquidity provision
  - swap execution across price ranges
  - fee collection aligned with expected outcomes
- SDK usability:
  - developer integration with minimal boilerplate
  - reference UI flows compile and run against LocalNet
- Documentation sufficient for onboarding new teams

## Funding

**Total Funding Request: 2,100,000 CC over 12 months**

### Payment Breakdown by Milestone

| Milestone | Amount |
|-----------|--------|
| Milestone 1 | 700,000 CC upon acceptance |
| Milestone 2 | 700,000 CC upon acceptance |
| Milestone 3 | 700,000 CC upon acceptance |
| Milestone 4 | 0 CC (costs covered by earlier milestones) |

Funding is denominated in CC and milestone-based, consistent with CIP-100.

### Volatility Stipulation

- Grant denominated in fixed CC amounts as above
- Re-evaluation at the 6-month checkpoint for material volatility
- Scope changes or delays beyond the original plan will be mutually renegotiated

### Co-Marketing

Upon release, the implementing entity collaborates with the Canton Foundation on:

- ecosystem announcements highlighting CLMM as shared DeFi infrastructure
- technical blog posts and integration guides
- workshops/office hours supporting early adopters and bootstrap liquidity venues

## Motivation

Concentrated liquidity is the dominant capital-efficient market-making primitive across major DeFi ecosystems. Canton needs a reusable, credible implementation to:

- bootstrap DEXes and liquidity markets
- enable vaults and other capital pools to deploy liquidity safely
- provide institutions with predictable accounting and integration patterns

Without a shared primitive, the ecosystem fragments into multiple inconsistent AMMs with duplicated risk and slower adoption.

## Rationale

A shared CLMM module and SDK delivers maximum leverage:

- one core implementation
- one test suite and invariant library
- one integration layer for teams to build on

This is the fastest path to a vibrant DeFi ecosystem on Canton while keeping standards high and onboarding friction low.
