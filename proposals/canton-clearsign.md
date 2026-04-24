## Development Fund Proposal: Canton ClearSign -- External-Party Onboarding, Explainable Signing, and Operator Conformance

**Author:** Srikanth (Bitdynamics)  
**Implementing Entity:** Bitdynamics  
**Status:** Submitted  
**Created:** 2026-03-13  

---

## Abstract

This proposal requests funding to harden, validate, and release an open-source Canton reference wallet and operator toolkit for self-custodial users and operator-managed participants. It focuses on the place where Canton's architecture is most visible to real users: party-owned signing keys, participant-hosted execution, topology-backed onboarding, and domain-aware transaction routing.

The proposal is intentionally complementary to the broader wallet-connectivity efforts already under discussion. It does **not** try to become a universal multi-wallet discovery standard or replace general dApp SDK work. Instead, it targets a more operationally urgent gap: there is still no strong open-source reference wallet for custom/operator-managed Canton environments that makes external-party onboarding, explainable signing, and operator-readiness first-class concerns.

The funded outputs are designed to be concrete, reusable, and easy to evaluate:

- a release-grade self-custodial reference wallet for real Canton environments
- an external-party onboarding wizard with explicit topology review
- explainable signing with completed local transaction-hash recomputation and verification
- first-class transaction history and activity views with lifecycle-aware status tracking
- JWT, rights, package, and route diagnostics for custom nodes
- an MV3 browser extension plus CIP-103-compatible wallet-local provider/SDK/React surfaces
- official DA wallet transport alignment and interoperable dApp-facing surfaces
- an operator conformance harness and deployment guides

If approved, the result will be more than a wallet UI. It will be a reference wallet and compatibility toolkit for safe Canton self-custody, trustworthy transaction authorization, and operator readiness on real infrastructure.

This proposal is also not starting from a blank slate. It builds on an existing TypeScript prototype and monorepo that already includes working wallet flows, key handling, provider/SDK/React package surfaces, an MV3 extension shell, a reference dApp, a conformance CLI, Canton API client layers, and network/domain state management. The funded work is therefore primarily about hardening, restructuring, live-environment validation, and closing the remaining safety-critical gaps rather than inventing the product from zero.

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
- expose a standards-aligned dApp-facing provider surface that interoperates with official Canton/DA SDK consumers
- show transaction history and activity with lifecycle-aware views for pending, incoming, outgoing, deposit, and settled states
- explain a prepared transaction in human-readable form, recompute the signable hash locally, and block signing when verification cannot be proved
- diagnose rights, JWT, package, and topology failures without operator guesswork
- allow applications to request connection through a real wallet extension approval flow

The primary success condition is not "another SDK exists." The success condition is that a user and operator can run the wallet against a real Canton environment, complete onboarding safely, inspect and authorize a transaction confidently, and understand what is or is not possible on the connected participant/domain set.

### Who This Is For

The intended users of ClearSign are:

- operators exposing custom participant, JSON API, and Scan API environments
- teams that need a real reference wallet for external-party onboarding and transaction authorization against those environments
- application teams that want an extension-backed wallet and reference dApp to test against in operator-managed Canton deployments
- wallet providers, exchanges, and integrators that want a reference implementation aligned with the official DA wallet transport and Canton dApp-facing standards

This proposal is strongest in settings where generic wallet connectivity is not enough and the operational questions are specifically Canton-shaped: topology-backed onboarding, rights and package diagnostics, synchronizer-aware route validation, and explainable prepared submissions.

### What V1 Does Not Claim

This proposal does **not** claim:

- a universal Canton wallet discovery or connection standard
- uniform feature parity across all Canton networks or hosted wallet APIs
- unconstrained production multi-synchronizer wallet support
- a generic provider or React standard for every Canton wallet

Instead, V1 is explicitly a ClearSign-specific reference wallet and operator toolkit for custom environments, with controlled multi-synchronizer discovery and route validation where the connected environment supports it.

### Relationship to Existing Wallet Surfaces

ClearSign is not intended to replace the existing Splice Amulet validator wallet or broader validator stack.

Instead, it is positioned as a complementary self-custodial layer for external parties and other users who are not themselves operating validator infrastructure. Where a deployment already exposes Scan, hosted app-wallet, validator-wallet, or Splice gateway surfaces, ClearSign will integrate with those capabilities rather than attempting to duplicate or silently replace them.

### 2. Implementation Mechanics

The implementation starts from an existing TypeScript monorepo prototype with a Next.js web application, browser-side ED25519 key generation, encrypted local key storage, import/export flows, participant-backed party allocation, provider/SDK/React package surfaces, an MV3 extension shell, a reference dApp, a conformance CLI, network/domain stores, and Canton JSON API / Scan API client layers.

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

The ledger communication layer will be structured around an internal transport abstraction so the reference wallet can use the official `@canton-network/wallet-sdk` as the preferred ledger backend while retaining a direct JSON Ledger API fallback for zero-dependency environments such as sandboxes, demos, and selected conformance checks. The dApp-facing provider layer will align to the CIP-103 JSON-RPC surface and remain consumable from the extension, example dApp, and ecosystem tooling built against the official SDK stack.

The funded scope is organized around eight technical workstreams.

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
- Treat CIP-56 holdings and transfers as the default asset path, with capability-aware network-specific alternatives where a connected environment requires them.

**D. External-Party Topology Wizard**

- Provide a topology onboarding wizard that makes the external-party trust model explicit.
- Guide the user through key generation/import, party mode selection, validator/synchronizer choice, topology bundle creation, local review, signing, submission, and propagation checks.
- Complete the participant-aware submission path so selected confirming participants, observing participants, and thresholds are reflected in the generated topology rather than being only a UI review surface.
- Make required topology relationships visible rather than implicit, including `PartyToParticipant`, `ParticipantToParty`, and party key mappings.

**E. Explainable Signing**

- Decode prepared transactions into a human-readable explanation.
- Show creates, exercises, archives, pinned contract IDs, synchronizer/domain, expiry, and command identifiers.
- Complete a true local transaction-hash recomputation path and compare it to the participant-provided prepared hash before enabling signing.
- Persist the explanation alongside the signed submission for auditability.

**F. Delivery Surfaces and Operator Readiness**

- Expose ClearSign's own wallet-local provider, SDK, React layer, and extension as the integration surfaces for this platform, while aligning those surfaces with CIP-103 where practical.
- Continue dogfooding those surfaces by migrating and stabilizing the web wallet against them internally.
- Harden the MV3 extension with per-origin approval and encrypted local/session state.
- Ship an operator conformance harness with CLI, machine-readable JSON output, and optional HTML reporting, then validate it against real deployments rather than only synthetic or demo scenarios.
- Publish a local sandbox guide, a custom-node/operator guide, and a reference dApp.

**G. Standards Alignment, Activity History, and Ecosystem Integration**

- Introduce a `LedgerApiPort` transport boundary so the released core can run against the official `@canton-network/wallet-sdk` while preserving a documented direct-API fallback.
- Align the dApp-facing provider surface to CIP-103 and ensure the extension-backed wallet remains interoperable with dApps built against the official `@canton-network/dapp-sdk` / wallet SDK expectations.
- Make transaction history a first-class wallet feature, including paginated activity, lifecycle-aware buckets, pending proposal tracking, and transaction detail / receipt views.
- Treat CIP-56 holdings and transfers as the default path, with capability-aware alternatives such as Splice CC gateway flows where the connected network requires them.
- Document and support the relationship between ClearSign and existing Scan, hosted app-wallet, validator-wallet, and Splice Amulet / CC gateway surfaces so the reference implementation is clearly complementary rather than replacement-oriented.

**H. Security Assurance and Forward Compatibility**

- Commission an independent external security audit of the key-management and signing path before final release sign-off.
- Publish a remediation summary for material findings and track any deferred low-severity issues transparently.
- Keep explicit extension points for multi-synchronizer routing, hosted-wallet capability discovery, proposal/preapproval flows, and evolving Canton / DA SDK interfaces.
- Include a funded 12-month maintenance and support window covering security updates, dependency updates, compatibility fixes, release management, and documentation corrections after audited release.

Important scope boundary:

- the funded provider, SDK, and React surfaces are ClearSign-specific reference integration layers for this wallet platform
- where practical they will align to CIP-103 and official DA/Canton SDK expectations, but they are not proposed as universal Canton wallet standards or ecosystem-wide governance interfaces in this grant

Phase 2 functionality such as reward-claim assistance, multi-CPN read quorum, threshold-signing UX, and additional signer types remains outside the requested first-release scope except for architectural placeholders and plugin boundaries. However, the funded architecture will explicitly preserve forward-compatibility for multi-synchronizer routing, hosted-wallet capability discovery, proposal/preapproval flows, and standards-aligned SDK/provider evolution so the reference implementation remains useful as the Canton Network surface matures.

Because official Canton documentation currently notes that external-party submissions are limited to a single root node and a single submitting party, and that multi-synchronizer participant setups remain a preview feature rather than general production guidance, Phase 1 of this proposal will treat multi-synchronizer support as a controlled production rollout with explicit route validation rather than unconstrained "works everywhere" claims.

### 3. Delivery Readiness

This work is not starting from zero. The current prototype already includes:

- a working TypeScript monorepo and web wallet shell
- browser-side ED25519 key generation and encrypted local storage
- import/export flows for wallet material
- shared `provider`, `sdk`, and `react` package surfaces
- an MV3 browser extension shell with approval/session plumbing
- a reference dApp that already consumes the shared wallet surfaces
- a conformance CLI with JSON and HTML reporting paths
- a transport abstraction with an initial official SDK-backed ledger adapter path
- Canton JSON API and Scan API client layers
- external-party topology generation/allocation flows and validator setup approval wiring
- network and domain state management
- send/receive/activity flows, lifecycle-aware wallet UX, and network-specific integration hooks

That existing baseline reduces zero-to-one risk significantly. The funded work is primarily about hardening, restructuring, and proving the platform across realistic Canton deployment patterns rather than inventing the product from scratch.

### Current Proof Today

The current repository already proves several important pieces of the proposal:

- a working wallet shell with local key custody, import/export, and network/domain state management
- shared `provider`, `sdk`, `react`, and `conformance` package surfaces already wired into the monorepo
- a reference dApp consuming the shared wallet surfaces
- an initial official SDK-backed ledger transport adapter coexisting with the direct API path
- a live browser proof for real external-party onboarding against the checked-in local multi-synchronizer stack
- activity/history flows and hosted wallet / Splice integration work that already go beyond the originally written proposal text
- live conformance runners for JSON API reachability, JWT acceptance, rights checks, synchronizer reachability, onboarding viability, and related compatibility checks

The implementing team is therefore positioned to deliver:

- a coherent package architecture rather than a one-off app
- a reference wallet that dogfoods its own provider/SDK surfaces
- a practical operator toolchain rather than UI-only deliverables
- a hardening-oriented release plan grounded in already-running code rather than speculative greenfield milestones

### 4. Risks and Mitigations

This proposal takes on technically meaningful work, so the delivery approach explicitly accounts for the main risks.

- **External-party constraints:** external-party submissions currently have important platform limits. The wallet will encode those limits directly in UX, route validation, and documentation rather than hiding them.
- **Multi-domain production posture:** because multi-synchronizer participant setups remain preview-oriented in current documentation, the project positions Phase 1 as a controlled production rollout with explicit route planning and unsupported-path rejection.
- **Operator auth diversity:** real deployments vary widely in JWT issuance, audience configuration, and rights assignment. The funded diagnostics and conformance workstreams are intended to reduce integration ambiguity here.
- **Chrome MV3 lifecycle complexity:** the extension will be designed around ephemeral service-worker behavior from the beginning, with encrypted persistent state, session-backed unlock state, and approval-focused initial scope.
- **Scope breadth:** the sequence of milestones intentionally reduces risk by building and dogfooding the shared core before broadening to the extension and conformance layers.
- **Standards-alignment drift:** the official SDK and CIP-103-facing surfaces may continue to evolve. The transport abstraction, backward-compatible aliases, and standards-alignment workstream are intended to keep ClearSign interoperable without forcing a rewrite.
- **Security assurance expectations:** because this is a reference wallet handling network assets, audit expectations are appropriately higher than for a prototype. The revised proposal includes an external audit before final sign-off rather than treating audit as a post-adoption extra.

### 5. Architectural Alignment

This work aligns with Canton architecture and ecosystem goals in a straightforward way.

- It consumes existing Canton interfaces and official SDK layers instead of modifying protocol internals.
- It improves the safety and usability of participant onboarding and wallet operation without changing ledger semantics.
- It supports controlled multi-synchronizer discovery and route validation where the connected environment exposes the necessary capabilities, rather than hiding domain state behind opaque UX.
- It integrates with existing Scan, validator-wallet, hosted app-wallet, and Splice gateway surfaces where they already exist, rather than attempting to replace them.
- It is a shared public-good reference implementation that can be reused by operators, app teams, and wallet builders.

Relevant architectural alignment points:

- **CIP-56 alignment:** CIP-56 holdings and transfers are treated as the default asset path, with capability-aware network-specific alternatives used only where required.
- **CIP-103 alignment:** the extension/provider layer will align to the Canton dApp-facing JSON-RPC surface so dApps targeting the standard can interoperate with the wallet.
- **Official SDK alignment:** the core transport layer will support the official `@canton-network/wallet-sdk` as the preferred ledger backend while retaining a documented fallback where appropriate.
- **External-party alignment:** the project treats external parties as the signature self-custodial model and designs around their real onboarding and signing requirements.
- **Local-party alignment:** participant-backed party allocation remains supported for operator-managed deployments where a participant-hosted party model is operationally preferred.
- **Custom-node compatibility:** the wallet is designed to work with operator-managed JSON API / Scan API endpoints rather than assuming a single hosted environment.
- **Ecosystem integration:** ClearSign is positioned as a complementary self-custodial layer that can work with existing validator/app-wallet/Splice surfaces instead of replacing them.
- **Operator-readiness:** package vetting, rights diagnostics, and conformance testing are aligned with how Canton environments are actually operated.
- **Future compatibility:** the architecture keeps explicit extension points for multi-synchronizer routing, hosted-wallet capabilities, and evolving network features instead of treating future support as an afterthought.

**Relationship to Existing Proposal Areas**

This proposal is intentionally designed to complement the wallet-connectivity proposals already under discussion.

It does **not** primarily seek to deliver:

- a universal multi-wallet discovery layer
- a new ecosystem-wide wallet connection standard
- a generic provider standard for all Canton wallets
- a generic React wrapper for all wallets
- a broad end-to-end dApp starter kit beyond the wallet/provider surface itself
- a backend/server wallet SDK

Instead, it delivers a concrete and more specialized platform that broader connectivity efforts can interoperate with, while aligning to shared standards where that improves adoption:

- a self-custodial wallet for real operator-managed environments
- an external-party onboarding and explainable-signing reference flow
- an operator diagnostics and conformance layer
- a plugin-ready base for network-specific workflows without polluting the generic core

### 6. Backward Compatibility

*No backward compatibility impact.*

The proposal introduces an external wallet implementation and supporting docs. It does not require protocol changes, participant changes, or contract migrations.

---

## Milestones and Deliverables

### Milestone 1: Public Alpha for Wallet Core, SDK Alignment, and Routing Diagnostics

The released alpha can run the wallet on the stabilized core, expose a documented transport abstraction with the official SDK-backed path, and deterministically surface route, auth, and package failures.

### Milestone 2: External-Party Onboarding, Explainable Signing, and Activity History

At least one evaluator completes the onboarding and explainable-signing flow, and the released wallet exposes first-class activity/history views with lifecycle-aware transaction states.

### Milestone 3: Hardened Wallet, Extension, and Ecosystem Interoperability Release

The shared provider, SDK, and React layers, example dApp, and extension-backed flow are hardened based on evaluation feedback, aligned to CIP-103 where practical, and documented with clear ecosystem-integration boundaries.

### Milestone 4: Operator Conformance, Security Audit, and Deployment Readiness

An operator can run the conformance harness against a real or demo deployment and get a reproducible compatibility report plus deployment guidance, and the project reaches audited release readiness before final sign-off.

---

## Potential Ecosystem Beneficiaries

This proposal is intended as public-good infrastructure for the wider Canton ecosystem, and I have identified a few ecosystem teams that are well aligned with the feature set and have expressed interest in this kind of capability, including `Gateway`, `Lumens.fi`, and `Hashrupt`.

These features address recurring onboarding, signing, and operator-conformance pain that teams in this category face when building or operating Canton-based systems, especially where external parties need safe, understandable wallet interactions.

More broadly, this project is useful for all teams building Canton wallet experiences, self-custodial user flows, external-party onboarding journeys, and operator-managed signing workflows.

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- all milestone deliverables shipped under an open-source license
- demonstrated local-party and external-party onboarding flows in the released wallet
- documented prevention of production transactions from provisional or unregistered identities
- functioning transaction explainability and true local hash recomputation/verification
- functioning transaction history / activity views with lifecycle-aware state tracking
- functioning route diagnostics, auth diagnostics, and package preflight reporting
- functioning extension approval flow for connect/sign/submit for the reference dApp
- a documented CIP-103-compatible dApp-facing provider surface exercised by the reference dApp
- an official `@canton-network/wallet-sdk` transport path available in the released core, with documented fallback behavior where applicable
- functioning conformance harness output against the demo environment
- published setup documentation for both local sandbox and custom-node/operator environments
- completed independent security audit of the key-management and signing path before final sign-off

Project-specific acceptance conditions:

- the project must remain explicitly out of scope for universal multi-wallet standardization
- the local demo must be reproducible from repository documentation without private infrastructure
- the reference dApp must exercise at least one success path and one clearly rejected unsupported-capability path
- external-party support must explicitly respect documented Canton limitations in the released UX and documentation
- selected confirming/observing participants and threshold choices must be reflected in the actual onboarding submission path where the connected environment supports them
- the funded provider, SDK, and React layers must remain ClearSign-specific reference surfaces rather than being presented as generic ecosystem standards
- the released documentation must clearly explain how ClearSign integrates with Scan, validator/app-wallet, and Splice Amulet / CC gateway surfaces
- the audited release must begin a committed 12-month maintenance and support window

---

## Funding

**Base Implementation Funding Request:** 900,000 CC

### Payment Breakdown by Milestone
- Milestone 1 _Public Alpha for Wallet Core, SDK Alignment, and Routing Diagnostics_: 250,000 CC upon committee acceptance
- Milestone 2 _External-Party Onboarding, Explainable Signing, and Activity History_: 300,000 CC upon committee acceptance
- Milestone 3 _Hardened Wallet, Extension, and Ecosystem Interoperability Release_: 200,000 CC upon committee acceptance
- Milestone 4 _Operator Conformance, Security Audit, and Deployment Readiness_: 150,000 CC upon final audited release and committee acceptance

### Additional Budget Items

- External security audit: approximately **USD 30,000**. The final quote may land below or above this estimate depending on the firms engaged and the final agreed scope. I will keep the Committee informed before engagement and if the estimate changes materially.
- Post-release maintenance and support for 12 months:  **484,000 CC**. This covers security updates, dependency updates, Canton / CIP-103 / DA SDK compatibility fixes, release management, issue triage, and documentation corrections during the first year after audited release.

### Funding Rationale

- Milestone 1 funds stabilization of the core package boundaries and the highest-risk architectural hardening work: signer abstraction, routing, auth diagnostics, package preflight, and the generic wallet core that all later flows depend on.
- Milestone 2 funds the main user-safety work: external-party onboarding, participant-aware topology submission, transaction explainability, and completed local hash verification.
- Milestone 3 funds platform dogfooding and reference integration proof: hardened provider surfaces, the extension, standards-aligned dApp interoperability, and the example dApp used to validate the wallet against realistic application flows.
- Milestone 4 funds the operator-facing validation layer: reproducible conformance checks, live compatibility testing where available, deployment guides, and the work required to reach audited release readiness.
- The external audit line item funds independent assurance for the key-management and signing path before final sign-off.
- The maintenance/support line item funds the first 12 months of keeping the reference implementation secure, compatible, and usable after release.

### Volatility Stipulation

The base implementation grant is denominated in fixed Canton Coin and will require a re-evaluation at the 6-month mark to account for significant USD/CC price volatility.

The audit and maintenance/support line items are stated in USD because they depend on external vendor quotations and post-release operating costs more naturally expressed in fiat terms. Their final CC-equivalent can be normalized with the Committee during contracting or milestone planning, and I will keep the Committee informed if those estimates move materially.

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

## Team Background

### BitDynamics

BitDynamics brings deep experience in building and operating blockchain infrastructure. The team has worked across Ethereum client infrastructure, validator operations, and production-grade hosting systems supporting validator infrastructure securing more than 2 billion AUD in assets. This background is directly relevant to building reliable, auditable, and security-conscious public infrastructure for a grants program. Team is also building actively on Canton. 

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
