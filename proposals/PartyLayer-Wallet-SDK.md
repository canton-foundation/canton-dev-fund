## Development Fund Proposal: PartyLayer — Application-Layer Interoperability Infrastructure for Canton

**Author:** Cayvox Labs — Anil Karacay  
**Status:** Submitted for Committee Review 
**Created:** 2026-02-20  

---

## Abstract

As the Canton wallet ecosystem expands, integration complexity increases proportionally. Without a shared execution layer, decentralized applications must independently implement wallet discovery, provider negotiation, session lifecycle handling, and transaction orchestration. While each implementation may function correctly in isolation, the absence of a common integration surface introduces duplicated engineering effort and long-term fragmentation risk at the application boundary.

CIP-0103 defines the standard interface. PartyLayer operationalizes it.

PartyLayer is a CIP-0103–native wallet abstraction and registry coordination layer that is already built, released, and publicly adopted. It is fully open-source under the MIT license with no proprietary dependencies, no vendor lock-in, and no usage restrictions — a permanent public good for the Canton ecosystem. It integrates five wallet adapters (Console, Loop, Cantor8, Nightly, and Bron), implements full CIP-0103 method coverage, supports native `window.canton.*` auto-discovery, and provides a React integration layer with conformance testing tooling.

| Evidence | Link |
|---|---|
| Live Product (2,500+ unique visitors) | https://partylayer.xyz |
| GitHub (49 commits, 13 releases) | https://github.com/PartyLayer/PartyLayer |
| NPM (200+ installs) | https://www.npmjs.com/package/@partylayer/sdk |
| Documentation | https://partylayer.xyz/docs/introduction |
| X (Twitter) | https://x.com/partylayerkit |

This proposal requests **300,000 CC**, delivered across three milestones over a 4–5–5 week structure, to mature PartyLayer into a hardened, production-grade interoperability backbone. The scope focuses on disciplined developer tooling, traffic observability aligned with CIP-0104, and production hardening with observability infrastructure — while preserving protocol semantics and wallet authority boundaries.

---

## Specification

### 1. Objective

Canton's wallet connectivity layer is operational. The remaining constraint lies in execution discipline at the application layer.

Today, developers repeatedly implement wallet discovery logic, connection handling, provider orchestration, and transaction lifecycle management. These patterns are replicated across projects, increasing maintenance overhead and introducing subtle semantic variance over time.

The issue is not the absence of standards. The issue is the absence of a shared integration layer.

PartyLayer addresses this by providing a neutral, open-source abstraction framework that reduces repeated wallet integration work while preserving protocol-defined trust boundaries. It does not reinterpret, extend, or compete with any CIP. Instead, it imports the official Canton SDKs as dependencies and wraps them with structured execution patterns that improve consistency and developer ergonomics.

The intended outcome is ecosystem efficiency: faster onboarding for builders, stable interoperability as wallet diversity grows, and reduced application-layer fragmentation.

### 2. Implementation Mechanics

PartyLayer operates strictly at the application integration boundary. It never holds private keys, never signs on behalf of wallets, and never alters authorization semantics. Wallet authority remains fully enforced by wallet implementations.

The funded work advances PartyLayer along three structured dimensions: developer tooling, traffic observability, and production hardening.

**Developer Tooling (Milestone 1)**

This phase focuses on reducing integration friction and establishing a reliable onboarding baseline. It introduces scaffolding, lightweight testing primitives, and structured documentation that allow builders to integrate wallets in minutes rather than days.

**Traffic Observability & Framework Expansion (Milestone 2)**

With the approval of CIP-0104, Canton's app reward model has transitioned from manual activity markers to automatic traffic-based measurement. App rewards are now computed from actual traffic spent on confirmation requests, measured at the sequencer and mediator level. FeaturedAppActivityMarkers are no longer created.

This shift eliminates the need for SDK-level marker construction — but introduces a new requirement: application-layer visibility into traffic costs and reward attribution. CIP-0104 exposes this data through new Scan API endpoints, but no existing SDK provides structured access to it.

PartyLayer will bridge this gap by providing developer-facing utilities for traffic cost observation, pre-transaction cost estimation, and reward attribution monitoring — all operating as read-only consumers of the Scan API without modifying protocol-level reward logic or traffic accounting.

This milestone also expands framework coverage through a Vue.js integration library and formalizes an adapter development framework for third-party wallet teams.

**Production Hardening, Observability & MainNet Readiness (Milestone 3)**

This phase matures PartyLayer from a functional connectivity layer into production-grade infrastructure suitable for MainNet deployment. It introduces three technical components — a production observability layer, structured logging hooks, and a standardized error taxonomy — alongside mobile support, performance optimization, and a documented MainNet migration pathway.

The observability layer operates exclusively at the application integration boundary. It emits structured, machine-readable events across wallet lifecycle phases (connect, authorize, request, response, error) without capturing network-level telemetry, user-identifying information, or centralized tracking data. The architecture is vendor-neutral by design: applications may optionally forward events to external monitoring tools (e.g. OpenTelemetry, Sentry, Datadog) through documented adapter interfaces, but no external dependency is required for baseline operation.

The error taxonomy normalizes heterogeneous wallet-level error responses into a canonical SDK error surface. It classifies CIP-0103 response failures into stable, documented error categories that applications can handle programmatically. This is additive abstraction — it structures error information for developer consumption without altering the underlying CIP-0103 response semantics or reinterpreting protocol-defined error codes.

The objective is operational confidence: applications built on PartyLayer can transition from DevNet to MainNet with observable, diagnosable, and repeatable integration behavior.

### 3. Architectural Alignment

PartyLayer reinforces Canton's architectural principles: separation of trust domains, wallet-enforced authorization, and minimal interoperable surfaces. It consumes official SDKs rather than forking or replacing them. All abstractions are additive.

The registry layer remains neutral and read-only. It introduces no governance authority, no curation gatekeeping, and no dependency for native auto-discovery.

Alignment with relevant CIPs is strictly operational:

- **CIP-0103:** consumed as defined, without semantic modification
- **CIP-0104:** read-only Scan API consumption for traffic cost and reward observability — no modification of traffic accounting or reward distribution logic

PartyLayer does not participate in reward distribution logic, economic evaluation, or incentive amplification.

### 4. Backward Compatibility

PartyLayer introduces no protocol changes and does not modify wallet implementations. It operates entirely at the integration layer and remains version-pinned to upstream SDKs.

*No backward compatibility impact.*

---

## Milestones and Deliverables

### Milestone 1 — Developer Tooling Foundation

- **Estimated Delivery:** 3 weeks
- **Funding:** 100,000 CC
- **Deliverables:**
  - `npx create-partylayer-app` CLI
    - React template
    - Next.js template
    - Vue template
    - Vanilla JS template
  - `@partylayer/testing` v1.0
    - Mock wallet provider
    - Simulated transaction lifecycle
    - Offline integration test utilities
  - Enhanced interactive playground with live code editor and multi-scenario walkthroughs
    - Zero-install browser environment
    - Wallet connection demo
    - Transaction demo
    - Editable live code examples
  - Step-by-step tutorial series (distinct from existing API reference documentation)
    - First dApp tutorial
    - Multi-wallet integration guide
    - Testing workflow guide
  - Updated npm releases and documentation publishing

### Milestone 2 — Traffic Observability & Framework Expansion

- **Estimated Delivery:** 3 weeks
- **Funding:** 100,000 CC
- **Deliverables:**
  - CIP-0104 traffic observability utilities
    - Scan API integration for per-app traffic cost monitoring
    - Pre-transaction cost estimation helpers
    - Reward attribution dashboard data layer (read-only, no reward logic modification)
    - Documentation on view decomposition optimization for app providers
  - DevNet reference application
    - Demonstration of traffic cost observation and reward monitoring
    - Public repository example
  - `@partylayer/vue` v1.0
    - Vue composables
    - Component bindings
    - API parity with React library
  - Wallet Adapter SDK framework
    - Adapter scaffolding template
    - Documentation for third-party wallet teams
    - Conformance-runner validation integration

### Milestone 3 — Production Hardening, Observability & MainNet Readiness

- **Estimated Delivery:** 3 weeks
- **Funding:** 100,000 CC
- **Deliverables:**
  - Production observability layer
    - Application-level event emission across wallet lifecycle phases (connect, authorize, request, response, error)
    - Vendor-neutral adapter interfaces for optional integration with external monitoring tools (OpenTelemetry, Sentry, Datadog)
    - No network-level telemetry, no centralized tracking, no user-identifying data collection
  - Structured logging hooks
    - Standardized, machine-readable log events for each wallet interaction phase
    - Configurable verbosity levels (debug, info, warn, error)
    - Correlation identifiers for tracing multi-step wallet operations
  - Standardized error taxonomy
    - Canonical error classification aligned with CIP-0103 response categories
    - Stable, documented error codes for programmatic handling
    - Additive normalization layer — no modification of underlying CIP-0103 semantics
  - `@partylayer/react-native` v1.0
    - Mobile wallet connectivity
    - React Native compatibility layer
  - MainNet deployment guide
    - DevNet → TestNet → MainNet migration path
    - Production checklist
  - Performance optimization
    - Bundle size analysis and reduction
    - Caching strategies and lazy loading

---

## Acceptance Criteria

Completion will be evaluated through: public npm releases corresponding to each milestone, GitHub repository updates reflecting deliverables, DevNet demonstrations of functionality, CIP compliance validation against relevant standards, and published documentation and benchmark artifacts.

---

## Funding

**Total Funding Request:** 300,000 CC

- **Milestone 1:** 100,000 CC
- **Milestone 2:** 100,000 CC
- **Milestone 3:** 100,000 CC

Total projected duration: 9 weeks (3–3–3 structure).

### Volatility Stipulation

If Committee-requested scope changes extend beyond six months, remaining milestone terms may be revisited to address material CC volatility.

---

## Co-Marketing

Upon release, the implementing entity will collaborate with the Foundation on milestone announcements, technical blog publications, participation in developer working groups, and publication of open-source reference applications demonstrating wallet connectivity, traffic observability, and production deployment patterns.

The interactive playground delivered in Milestone 1 will serve as a persistent, zero-friction demonstration of Canton's developer experience.

---

## Motivation

Canton's economic model rewards application-layer utility. Application growth depends on developer velocity. Connectivity is functional; disciplined execution remains the limiting factor.

With the transition to traffic-based app rewards under CIP-0104, app providers gain automatic reward attribution but lose visibility into the mechanics driving their earnings. No existing SDK provides structured access to traffic cost data or reward estimation at the application layer. PartyLayer fills this gap while maintaining its core function as wallet connectivity infrastructure.

Funding PartyLayer strengthens production efficiency and interoperability at scale. Every structured integration reduces ecosystem fragmentation risk and improves long-term coherence.

---

## Rationale

This proposal extends proven infrastructure rather than initiating speculative development. PartyLayer wraps official SDKs, preserves wallet authority, and operates exclusively at the application boundary. It is and will remain fully open-source under the MIT license — all funded deliverables are public, auditable, and available to every participant in the Canton ecosystem without restriction.

It is not a competing standard.  
It is execution discipline infrastructure.
