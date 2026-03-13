## Development Fund Proposal: Canton ClearSign -- External-Party Onboarding, Explainable Signing, and Operator Conformance

**Author:** Srikanth (Bitdynamics)  
**Implementing Entity:** Bitdynamics  
**Status:** Draft  
**Created:** 2026-03-13  

---

## Abstract

This proposal requests funding to harden and release an open-source Canton wallet platform for self-custodial users and operator-managed participants. It focuses on the place where Canton's architecture is most visible to real users: party-owned signing keys, participant-hosted execution, topology-backed onboarding, and domain-aware transaction routing.

The proposal is intentionally complementary to the broader wallet-connectivity efforts already under discussion. It does **not** try to become a universal multi-wallet discovery standard or replace general dApp SDK work. Instead, it targets a more operationally urgent gap: there is still no strong open-source reference wallet for custom/operator-managed Canton environments that makes external-party onboarding, explainable signing, and operator-readiness first-class concerns.

The funded outputs are designed to be concrete, reusable, and easy to evaluate:

- a production-hardened self-custodial wallet for real Canton environments
- an external-party onboarding wizard with explicit topology review
- explainable signing with local transaction-hash verification
- JWT, rights, package, and route diagnostics for custom nodes
- an MV3 browser extension plus wallet-local provider/SDK/React surfaces
- an operator conformance harness and deployment guides

If approved, the result will be more than a wallet UI. It will be a reference platform for safe Canton self-custody, trustworthy transaction authorization, and operator compatibility on real infrastructure.

---

## Specification

### 1. Objective

Current wallet-related proposals in the ecosystem primarily target dApp connectivity, wallet discovery, provider abstractions, and generalized SDK layers. Those are important and this proposal is intended to interoperate with that direction. However, they do not fully solve a separate and increasingly important problem faced by users and operators today:

- a self-custodial user needs external-party onboarding that matches real Canton topology rules
- a signer must be able to understand what a prepared transaction will actually do before authorizing it
- an operator needs objective tooling to verify that JWT configuration, user rights, package vetting, topology propagation, and routeability are all correct
- an app team targeting a specific participant deployment needs a real reference wallet to test against, not only an abstract integration library

This proposal addresses that gap.

The intended outcome is an open-source wallet platform that demonstrates how to do the following correctly:

- generate and protect keys locally
- onboard users through either local-party or external-party flows
- guide external-party topology setup and approval
- connect to custom Canton JSON API and Scan API endpoints
- present balances, supported actions, and failure reasons per connected domain or synchronizer
- explain a prepared transaction in human-readable form and verify its hash locally before signing
- diagnose rights, JWT, package, and topology failures without operator guesswork
- allow applications to request connection through a real wallet extension approval flow

The primary success condition is not "another SDK exists." The success condition is that a user and operator can run the wallet against a real Canton environment, complete onboarding safely, inspect and authorize a transaction confidently, and understand what is or is not possible on the connected participant/domain set.

### 2. Implementation Mechanics

The implementation starts from an existing TypeScript monorepo prototype with a Next.js web application, browser-side ED25519 key generation, encrypted local key storage, import/export flows, participant-backed party allocation, network/domain stores, and Canton JSON API / Scan API client layers.

The funded work will harden that prototype into a reusable public reference platform with the following package layout:

- `packages/types`
- `packages/core`
- `packages/provider`
- `packages/sdk`
- `packages/react`
- `packages/conformance`
- `packages/plugins/splice`
- `apps/web`
- `apps/extension`
- `apps/example-dapp`

Inside `packages/core`, the primary modules will be:

- `signers/`
- `routing/`
- `topology/`
- `explain/`
- `diagnostics/`
- `preflight/`

The funded scope is organized around six technical workstreams.

**A. Dual-Mode Onboarding**

- Support both `local-party` and `external-party` onboarding modes.
- Treat `external-party` onboarding as the signature self-custodial path of this proposal.
- Support operator-managed `local-party` onboarding for deployments where a participant-hosted party model is the preferred operational choice.
- Support provisional identities only in explicitly labeled local-development mode.
- Add production-mode restrictions so provisional or unregistered parties cannot transact.

**B. Signer Abstraction and Secure Local Custody**

- Introduce a `SignerAdapter` abstraction instead of coupling flows directly to one browser key manager.
- Ship `LocalKeySigner` and `MnemonicSigner` in the funded scope.
- Define placeholder interfaces for `WebAuthnSigner` and `KmsSigner` so future signers do not require re-architecture.
- Keep private keys client-side only, with encrypted persistent state and short-lived in-memory unlock sessions.

**C. Route Planning, Diagnostics, and Preflight**

- Replace simple domain resolution with a real `RoutePlanner`.
- Support explicit synchronizer/domain selection and route validation.
- Return precise failure reasons such as `NO_COMMON_SYNCHRONIZER` and `NO_SYNCHRONIZER_FOR_SUBMISSION`.
- Add `AuthDiagnostics` for missing/expired JWTs, wrong audience/scope, and insufficient `actAs` / `readAs` rights.
- Add `PackagePreflight` to detect missing package vetting, incompatible package/template expectations, and optional DAR validation.

**D. External-Party Topology Wizard**

- Provide a topology onboarding wizard that makes the external-party trust model explicit.
- Guide the user through key generation/import, party mode selection, validator/synchronizer choice, topology bundle creation, local review, signing, submission, and propagation checks.
- Make required topology relationships visible rather than implicit, including `PartyToParticipant`, `ParticipantToParty`, and party key mappings.

**E. Explainable Signing**

- Decode prepared transactions into a human-readable explanation.
- Show creates, exercises, archives, pinned contract IDs, synchronizer/domain, expiry, and command identifiers.
- Recompute the transaction hash locally and compare it before enabling signing.
- Persist the explanation alongside the signed submission for auditability.

**F. Delivery Surfaces and Operator Readiness**

- Expose ClearSign's own wallet-local provider, SDK, React layer, and extension as the integration surfaces for this platform.
- Dogfood those surfaces by migrating the web wallet to use them internally.
- Ship an MV3 extension with per-origin approval and encrypted local/session state.
- Ship an operator conformance harness with CLI, machine-readable JSON output, and optional HTML reporting.
- Publish a local sandbox guide, a custom-node/operator guide, and a reference dApp.

Phase 2 functionality such as reward-claim assistance, multi-CPN read quorum, threshold-signing UX, and KMS/WebAuthn/hardware signers is intentionally left outside the requested funding scope except for architectural placeholders and plugin boundaries.

Because official Canton documentation currently notes that external-party submissions are limited to a single root node and a single submitting party, and that multi-synchronizer participant setups remain a preview feature rather than general production guidance, Phase 1 of this proposal will treat multi-domain support as a controlled production rollout with explicit route validation rather than unconstrained "works everywhere" claims.

### 3. Delivery Readiness

This work is not starting from zero. The current prototype already includes:

- a working TypeScript monorepo and web wallet shell
- browser-side ED25519 key generation and encrypted local storage
- import/export flows for wallet material
- Canton JSON API and Scan API client layers
- participant-backed party allocation attempts
- network and domain state management
- initial send/receive activity flows and wallet UX

That existing baseline reduces zero-to-one risk significantly. The funded work is primarily about hardening, restructuring, and proving the platform across realistic Canton deployment patterns rather than inventing the product from scratch.

The implementing team is therefore positioned to deliver:

- a coherent package architecture rather than a one-off app
- a reference wallet that dogfoods its own provider/SDK surfaces
- a practical operator toolchain rather than UI-only deliverables

### 4. Risks and Mitigations

This proposal takes on technically meaningful work, so the delivery approach explicitly accounts for the main risks.

- **External-party constraints:** external-party submissions currently have important platform limits. The wallet will encode those limits directly in UX, route validation, and documentation rather than hiding them.
- **Multi-domain production posture:** because multi-synchronizer participant setups remain preview-oriented in current documentation, the project positions Phase 1 as a controlled production rollout with explicit route planning and unsupported-path rejection.
- **Operator auth diversity:** real deployments vary widely in JWT issuance, audience configuration, and rights assignment. The funded diagnostics and conformance workstreams are intended to reduce integration ambiguity here.
- **Chrome MV3 lifecycle complexity:** the extension will be designed around ephemeral service-worker behavior from the beginning, with encrypted persistent state, session-backed unlock state, and approval-focused initial scope.
- **Scope breadth:** the sequence of milestones intentionally reduces risk by building and dogfooding the shared core before broadening to the extension and conformance layers.

### 5. Architectural Alignment

This work aligns with Canton architecture and ecosystem goals in a straightforward way.

- It consumes existing Canton interfaces instead of modifying protocol internals.
- It improves the safety and usability of participant onboarding and wallet operation without changing ledger semantics.
- It supports multi-domain environments by making domain state visible to end users instead of hiding it behind opaque UX.
- It is a shared public-good reference implementation that can be reused by operators, app teams, and wallet builders.

Relevant architectural alignment points:

- **CIP-56 alignment:** the wallet focuses on CIP-56-style asset holding and transfer flows where available.
- **External-party alignment:** the project treats external parties as the signature self-custodial model and designs around their real onboarding and signing requirements.
- **Local-party alignment:** participant-backed party allocation remains supported for operator-managed deployments where a participant-hosted party model is operationally preferred.
- **Custom-node compatibility:** the wallet is designed to work with operator-managed JSON API / Scan API endpoints rather than assuming a single hosted environment.
- **Operator-readiness:** package vetting, rights diagnostics, and conformance testing are aligned with how Canton environments are actually operated.

**Relationship to Existing Proposal Areas**

This proposal is intentionally designed to complement the wallet-connectivity proposals already under discussion.

It does **not** primarily seek to deliver:

- a universal multi-wallet discovery layer
- a new ecosystem-wide wallet connection standard
- a generic provider standard for all Canton wallets
- a generic React wrapper for all wallets
- a broad dApp starter kit for the full CIP-103 ecosystem
- a backend/server wallet SDK

Instead, it delivers a concrete and more specialized platform that broader connectivity efforts can interoperate with:

- a self-custodial wallet for real operator-managed environments
- an external-party onboarding and explainable-signing reference flow
- an operator diagnostics and conformance layer
- a plugin-ready base for network-specific workflows without polluting the generic core

### 6. Backward Compatibility

*No backward compatibility impact.*

The proposal introduces an external wallet implementation and supporting docs. It does not require protocol changes, participant changes, or contract migrations.

---

## Milestones and Deliverables

### Milestone 1: Spec Freeze and Wallet Core
- **Estimated Delivery:** 6 weeks
- **Focus:** lock the platform interfaces and build the generic wallet core
- **Deliverables / Value Metrics:**
  - provider RPC namespace for this wallet platform
  - type definitions for `PartyMode`, `HostingRole`, `RoutePlan`, `RouteFailureReason`, `PreparedOnboardingBundle`, `ExplainedTransaction`, `AuthDiagnostic`, `PackageCompatibilityReport`, and `ConformanceReport`
  - `SignerAdapter`, `LocalKeySigner`, and `MnemonicSigner`
  - `RoutePlanner`, `DomainRegistry`, `AuthDiagnostics`, and `PackagePreflight`
  - explicit documentation of current external-party and multi-synchronizer constraints
  - value metric: the web app can run on the new core package structure and surface route, auth, and package failures deterministically

### Milestone 2: External-Party Onboarding and Explainable Signing
- **Estimated Delivery:** 8 weeks
- **Focus:** make safe external-party usage a first-class user flow
- **Deliverables / Value Metrics:**
  - onboarding wizard for local-party and external-party modes
  - topology-bundle review flow with local signing and propagation polling
  - human-readable transaction explanation view showing creates, exercises, archives, pinned contract IDs, synchronizer/domain, and expiry
  - local transaction-hash recomputation and verification before signing
  - persisted explanation and audit record for signed submissions
  - value metric: a user can onboard an external party and complete a prepare -> explain -> hash-verify -> sign -> submit flow in the demo environment using published docs

### Milestone 3: ClearSign Integration Surfaces and Extension
- **Estimated Delivery:** 8 weeks
- **Focus:** ship ClearSign's own integration surfaces and use them in the wallet itself
- **Deliverables / Value Metrics:**
  - ClearSign-specific `provider`, `sdk`, and `react` packages used by the reference wallet and example dApp
  - migration of `apps/web` to consume the new packages
  - `apps/example-dapp` as the first external consumer
  - Chrome MV3 extension initial release with side-panel UI, content-script bridge, per-origin approvals, and wallet-local approval flows for connect/sign/submit
  - encrypted `chrome.storage.local` state and `chrome.storage.session` unlock state
  - value metric: the example dApp can connect to the extension-backed wallet and complete a documented end-to-end flow against a configured Canton environment

### Milestone 4: Operator Conformance Harness and Deployment Guides
- **Estimated Delivery:** 4 weeks
- **Focus:** turn the platform into an operator-ready reference implementation
- **Deliverables / Value Metrics:**
  - `packages/conformance` CLI with JSON output and optional HTML report
  - checks for JSON API reachability, JWT acceptance, user rights sufficiency, synchronizer reachability, package vetting, topology propagation, route planning, and end-to-end external signing viability
  - local sandbox demo with at least two participant/domain scenarios
  - operator guide for custom-node deployment and compatibility testing
  - value metric: an operator can run the harness against a deployment and receive a reproducible report explaining compatibility and failure causes

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- all milestone deliverables shipped under an open-source license
- demonstrated local-party and external-party onboarding flows in the released wallet
- documented prevention of production transactions from provisional or unregistered identities
- functioning transaction explainability and local hash verification
- functioning route diagnostics, auth diagnostics, and package preflight reporting
- functioning extension approval flow for connect/sign/submit for the reference dApp
- functioning conformance harness output against the demo environment
- published setup documentation for both local sandbox and custom-node/operator environments

Project-specific acceptance conditions:

- the project must remain explicitly out of scope for universal multi-wallet standardization
- the local demo must be reproducible from repository documentation without private infrastructure
- the reference dApp must exercise at least one success path and one clearly rejected unsupported-capability path
- external-party support must explicitly respect documented Canton limitations in the released UX and documentation

---

## Funding

**Total Funding Request:** 700,000 CC

### Payment Breakdown by Milestone
- Milestone 1 _Spec Freeze and Wallet Core_: 150,000 CC upon committee acceptance
- Milestone 2 _External-Party Onboarding and Explainable Signing_: 200,000 CC upon committee acceptance
- Milestone 3 _ClearSign Integration Surfaces and Extension_: 200,000 CC upon committee acceptance
- Milestone 4 _Operator Conformance Harness and Deployment Guides_: 150,000 CC upon final release and acceptance

### Volatility Stipulation

The grant is denominated in fixed Canton Coin and will require a re-evaluation at the 6-month mark to account for significant USD/CC price volatility.

No ongoing maintenance funding is requested in this proposal. If ecosystem adoption justifies it, maintenance can be proposed separately after the initial release proves utility.

No dedicated third-party audit budget is requested in this proposal either. If the shipped platform demonstrates meaningful adoption, operational use, or reviewer-requested security scope beyond the funded milestones, Bitdynamics may return with a follow-on proposal for a scoped independent security review and/or ongoing maintenance support.

---

## Co-Marketing

Upon release, the implementing entity will collaborate with the Foundation on:

- announcement coordination
- a technical blog describing explainable self-custody and external-party onboarding for Canton custom nodes
- developer and operator promotion for the reference wallet, extension, and demo environment

Specific commitments:

- publish a walkthrough showing local-party, external-party, and custom-node/operator flows
- host at least one public demo or workshop focused on external-party onboarding, explainable signing, and operator conformance
- publish the reference dApp and demo scripts used for milestone acceptance

---

## Motivation

This proposal is valuable because it addresses the most operationally sensitive part of the Canton wallet stack: the point where a user-controlled signing key, a participant-controlled execution environment, and a topology-governed trust model all meet.

Much of the current ecosystem discussion is rightly focused on connectivity standards and SDKs. But a user still needs to answer harder questions:

- how do I onboard an external party correctly?
- what exactly am I signing?
- why is this validator rejecting my request?
- is this node really ready for production self-custodial usage?

Those are not generic wallet questions. They are specifically Canton questions.

An open-source platform for explainable self-custody and operator conformance delivers shared value in several ways:

- it reduces the amount of bespoke onboarding, signing, and diagnostics logic each operator must build
- it gives the ecosystem a reusable example of safe external-party flows
- it improves trust by making transaction effects visible before signing
- it gives operators an objective compatibility and readiness tool rather than ad hoc debugging
- it creates a clean place for future network-specific plugins without forcing those workflows into the generic core

Because the work is open-source and reference-oriented, the benefit is shared rather than private, while still solving a problem that real users and operators face immediately.

It also gives the ecosystem something that is currently missing in a single public package: not just a wallet surface, but a reference flow for explainable self-custody and a practical way for operators to verify compatibility before users ever see a confusing failure.

---

## Rationale

This is the right approach because it stays tightly scoped to a real gap while still feeling ambitious and distinctive.

Alternative directions were considered:

- proposing a universal wallet connector SDK
- proposing a generic provider standard
- proposing a broad React integration toolkit
- proposing a backend/server wallet SDK

Those directions are either already being pursued by other proposals or are better handled by broader standards-focused efforts.

By contrast, this proposal combines three things that fit together naturally and are currently under-served:

- a wallet
- an explainable external-signing reference flow
- an operator conformance and diagnostics toolkit

That combination makes the proposal more useful than a wallet UI alone, while remaining more disciplined than a whole-ecosystem standards effort.

It is also technically well matched to the current state of Canton:

1. external parties are the strongest self-custodial model, so the proposal leans into them
2. external-party limits are real, so the proposal encodes them explicitly instead of hiding them behind vague promises
3. multi-domain support is useful, but must be routed and validated carefully under current platform constraints
4. operator trust depends as much on diagnostics and conformance as on UI polish

The project follows a sound delivery sequence:

1. freeze interfaces and core constraints first
2. make onboarding and signing safe second
3. dogfood the provider surfaces in the wallet itself third
4. turn the result into an operator-ready reference platform fourth

That ordering reduces risk, makes milestones easy to verify, and gives the proposal a clearer identity than existing connectivity-focused submissions.

---

## Why Bitdynamics Can Deliver This

Bitdynamics is already building the underlying prototype in an active TypeScript monorepo rather than proposing from a blank slate. That matters for feasibility.

The current implementation already demonstrates:

- client-side key generation and encryption
- wallet import/export flows
- participant-backed party allocation attempts
- domain/network modeling
- Canton API integration layers
- a functioning wallet UI shell that can be migrated to the new provider stack

This means the requested funding is aimed at hardening, restructuring, and proving the platform in realistic Canton scenarios, not at speculative invention. The proposal is ambitious, but it is grounded in code that already exists and can be demonstrated.
