# Development Fund Proposal: PartyLayer — Application-Layer Developer Experience Framework for Canton

**Author:** Cayvox Labs — Anil Karacay
**Status:** Submitted for Committee Review
**Created:** 2026-02-20
**Revised:** 2026-05-22

---

## Abstract

PartyLayer is an open-source application-layer developer experience framework for Canton dApps. It helps application teams build production-ready wallet experiences through framework-native hooks, themed UI primitives, state management, multi-wallet UX, transaction lifecycle tooling, and Canton-specific dApp patterns.

CIP-0103 and the Canton dApp SDK provide the canonical foundation for wallet connectivity and protocol-level interoperability. PartyLayer is designed to sit above that foundation, turning the base connectivity layer into a more productive and reusable application development experience.

This positioning reflects a pattern proven in other ecosystems. In Ethereum, EIP-1193 and viem define the wallet provider interface and transport, yet most production dApps are built on top of higher-level libraries such as wagmi (data and state layer) and RainbowKit (UI components). Similarly, CIP-0103 and the Canton dApp SDK define the connectivity foundation in Canton, while PartyLayer operates one layer above as the application-layer developer experience framework.

PartyLayer is designed and being aligned to build on `@canton-network/dapp-sdk` as the canonical lower-level connectivity layer, rather than reimplementing it. It is already built, released, and publicly adopted: six wallet adapters (Console, Send, Loop, Cantor8, Nightly, Bron) plus native CIP-0103 wallet auto-detection via `window.canton.*`, full CIP-0103 method coverage, and a React integration layer with conformance testing tooling. Fully open-source under the MIT license with no proprietary dependencies — a permanent public good for the Canton ecosystem.

The current six wallet adapters (Console, Send, Loop, Cantor8, Nightly, Bron) are transitional bridges for pre-CIP-0103 wallets and will be sunset within two months of this proposal's approval, as wallets migrate to native CIP-0103 support through `@canton-network/dapp-sdk`.

| Evidence                             | Link                                                                                           |
| ------------------------------------ | ---------------------------------------------------------------------------------------------- |
| Live Product (5000+ unique visitors) | [https://partylayer.xyz](https://partylayer.xyz)                                               |
| GitHub (100+ commits, 26 releases)     | [https://github.com/PartyLayer/PartyLayer](https://github.com/PartyLayer/PartyLayer)           |
| NPM (500+ installs)                  | [https://www.npmjs.com/package/@partylayer/sdk](https://www.npmjs.com/package/@partylayer/sdk) |
| Documentation                        | [https://partylayer.xyz/docs/introduction](https://partylayer.xyz/docs/introduction)           |
| X (Twitter)                          | [https://x.com/partylayerkit](https://x.com/partylayerkit)                                     |

This proposal requests **300,000 CC**, delivered across three milestones in a 3–3–3 week structure, to mature PartyLayer into a production-grade application-layer framework: framework-native hooks and themed UI primitives above the dApp SDK, multi-framework reach (React, Vue, and React Native), Canton-specific developer patterns (privacy-aware queries, multi-party flows, synchronizer-aware operations), a lightweight CIP-0104 cost-visibility helper using existing ledger API fields, and production observability infrastructure. The work is intentionally complementary to the Canton dApp SDK proposal, focusing on a different layer of the developer stack.

---

## Architectural Positioning

PartyLayer sits at a specific layer of the Canton developer stack:

```text
Canton dApp stack:

┌──────────────────────────────────────────┐
│ dApp                                     │  ← built by app teams
├──────────────────────────────────────────┤
│ PartyLayer UI / DX layer                 │  ← RainbowKit-like primitives
├──────────────────────────────────────────┤
│ PartyLayer data / state layer            │  ← wagmi-like hooks and state
├──────────────────────────────────────────┤
│ Canton dApp SDK                          │  ← transport, discovery, base SDK
├──────────────────────────────────────────┤
│ CIP-0103                                 │  ← wallet connectivity standard - EIP1193-like
└──────────────────────────────────────────┘
```

PartyLayer's role is to provide the application-layer developer experience above the canonical SDK — framework-native hooks with reactive caching and state, themed UI primitives for transaction lifecycle and wallet UX, Canton-specific dApp patterns, and multi-framework reach (React, Vue, and React Native). It does not duplicate the transport, discovery, compliance, or wallet connectivity layers — those are the dApp SDK's canonical responsibilities, and PartyLayer is being aligned to build on that foundation rather than reimplement it.

### Adoption Flexibility

PartyLayer is intentionally modular. dApp teams can adopt it in different shapes depending on what they need:

| Pattern | What you use | What you get |
|---|---|---|
| **dApp SDK only** | `@canton-network/dapp-sdk` | Canonical wallet connectivity, no PartyLayer |
| **Data layer only** | dApp SDK + `@partylayer/react` hooks | Reactive cache + state management, your own UI |
| **UI layer only** | dApp SDK + `@partylayer/react/ui` components | Themed UI primitives, your own state management |
| **Full stack** | dApp SDK + `@partylayer/react` (hooks + UI) | wagmi + RainbowKit-style end-to-end experience |

This mirrors the Ethereum pattern where viem (transport), wagmi (data/state), and RainbowKit (UI) are independent layers that can be used together or separately. The Canton dApp SDK is the canonical foundation in every configuration. PartyLayer adds opt-in convenience layers above it — never replaces or hides the underlying SDK.

---

## Specification

### 1. Objective

Canton's wallet connectivity layer is now well-defined: CIP-0103 specifies the protocol, and `@canton-network/dapp-sdk` provides the canonical implementation. The remaining gap lies one layer above — at the application-layer developer experience that turns the connectivity layer into productive dApp development.

Today, application teams independently rebuild patterns around the base SDK: typed reactive hooks with caching and refetching, optimistic transaction states, wallet-switch-safe state management, themed UI primitives, multi-framework bindings, and Canton-specific patterns like privacy-aware queries, multi-party transaction flows, and synchronizer-aware operations.

These are application-layer concerns, not transport-layer ones. PartyLayer addresses them by providing a framework-native developer experience layer above the dApp SDK — closer in spirit to wagmi and RainbowKit in the Ethereum ecosystem than to a competing connectivity SDK. The intended outcome is faster dApp onboarding, more consistent application UX, and reduced fragmentation at the application boundary, while wallet authority and protocol semantics remain fully enforced by the dApp SDK and CIP-0103 below.

### 2. Implementation Mechanics

PartyLayer operates strictly at the application integration boundary. It never holds private keys, never signs on behalf of wallets, and never alters authorization semantics. Wallet authority remains fully enforced by wallet implementations.

The funded work advances PartyLayer along three structured dimensions: application-layer developer tooling, framework expansion with a narrow CIP-0104 cost helper, and production hardening with Canton-specific patterns.

**Application-Layer Developer Tooling (Milestone 1)**

This phase focuses on application-layer developer ergonomics that complement the dApp SDK's base capabilities. PartyLayer-specific scaffolding wires up framework-native hooks, themed UI primitives, and orchestration patterns out of the box, so teams building on the dApp SDK do not have to rebuild these patterns themselves. Testing primitives target adapter authoring and application-layer integration validation, complementing the dApp SDK's wallet compliance test suite rather than duplicating it.

**Framework Expansion & CIP-0104 Cost Helper (Milestone 2)**

This phase expands PartyLayer's framework reach beyond React and adds a thin developer-experience helper around CIP-0104 cost data.

The primary focus is multi-framework expansion: Vue 3 composables with parity to the React bindings, targeting Canton dApps built on Nuxt or other Vue-based frontends where Canton currently has no idiomatic SDK presence. Alongside Vue expansion, this milestone modernizes the existing React bindings to a TanStack Query–based architecture, establishing a consistent reactive cache and state model across all PartyLayer framework integrations.

The CIP-0104 helper is deliberately narrow. With the post-0.6 changes, traffic cost is exposed directly on the transaction object (`paid_traffic_cost`) and cost estimation is part of the interactive submission workflow (`CostEstimation`). PartyLayer surfaces these existing ledger API fields to dApp UI through framework-native hooks — letting an application show users the expected cost before signing and the actual cost after execution. This is a lightweight UX helper around existing protobuf fields, not a separate observability pipeline or reward attribution component. Reward computation lives at the validator and SV-app layer and is out of scope for PartyLayer.

**Production Hardening, Canton-Specific Patterns & Observability (Milestone 3)**

This phase matures PartyLayer's application-layer surface for production deployment, introducing structured observability hooks, error normalization, Canton-specific developer patterns, and mobile reach through React Native bindings.

The observability layer operates exclusively at the application integration boundary. It emits structured, machine-readable events across the application-layer lifecycle (connect, authorize, prepare, submit, confirm, error) without capturing network-level telemetry, user-identifying information, or centralized tracking data. The architecture is vendor-neutral by design: applications may optionally forward events to external monitoring tools (e.g. OpenTelemetry, Sentry, Datadog) through documented adapter interfaces, but no external dependency is required for baseline operation.

The error taxonomy normalizes heterogeneous wallet-level error responses into a canonical SDK error surface. It classifies CIP-0103 response failures into stable, documented error categories that applications can handle programmatically. This is additive abstraction — it structures error information for developer consumption without altering the underlying CIP-0103 response semantics or reinterpreting protocol-defined error codes.

Canton-specific developer patterns package higher-level patterns around Canton's unique features — privacy-aware queries, multi-party transaction flows, CIP-0056 token standard interactions (FoP and DvP-style workflows), explicit contract disclosure helpers, and synchronizer-aware operations — so every dApp team does not need to rediscover them independently. React Native bindings extend the application-layer reach to mobile environments, complementing existing React and Vue support.

### 3. Architectural Alignment

PartyLayer reinforces Canton's architectural principles: separation of trust domains, wallet-enforced authorization, and minimal interoperable surfaces. It is designed to build on the canonical Canton dApp SDK rather than fork, replace, or redefine it. All abstractions are additive.

Alignment with relevant CIPs is strictly operational:

* **CIP-0103**: used as the canonical wallet connectivity standard, with PartyLayer aligned around the dApp SDK foundation and without semantic modification
* **CIP-0104**: read-only consumption of `paid_traffic_cost` (on transaction object) and `CostEstimation` (on interactive submission response) — exposing these existing ledger API fields to dApp UI through framework hooks, with no modification of traffic accounting, reward distribution logic, or activity record computation
* **CIP-0056 (Canton Network Token Standard)**: helper patterns for the standard's APIs (holdings, transfer instruction, allocation), enabling dApps to build FoP and DvP-style workflows on top of CIP-0056-compliant tokens without protocol-level modification
* **Explicit contract disclosure** (Daml/Canton ledger feature, not a CIP): auto-attach helpers for `disclosed_contracts` on Ledger API commands, building on existing SDK support

PartyLayer does not participate in reward distribution logic, activity record computation, traffic measurement, or wallet authority enforcement.

### 4. Backward Compatibility

PartyLayer introduces no protocol changes and does not modify wallet implementations. It operates entirely at the application-integration layer and remains version-pinned to upstream SDKs.

No backward compatibility impact.

---

## Adoption & Success Metrics

PartyLayer is already live and in active use within the Canton ecosystem. The primary goal of this proposal is to expand real-world adoption and validate its role as a shared application-layer developer experience framework.

### Current Adoption

Publicly verifiable indicators:

* Published and installable via npm across the core SDK, React bindings, and six wallet adapters
* 100+ commits and 26 public releases on GitHub, reflecting continuous iteration driven by real integration feedback
* Live product deployed at partylayer.xyz with complete documentation, working examples, and an interactive playground
* CIP-0103 conformance runner included and passing for all adapters
* Fully open-source under the MIT license with zero proprietary dependencies
* Active integration work with 2 Canton applications known to us and technical discussions with 4 additional teams across DeFi, token infrastructure, and application-layer protocols. As PartyLayer is fully open-source, additional integrations may exist beyond our direct visibility.

### Target Success Metrics

While milestone acceptance is tied strictly to technical deliverables (public npm releases, GitHub artifacts, DevNet demonstrations, CIP compliance validation), the following adoption indicators are tracked alongside each milestone as ecosystem health signals:

* Integration with multiple Canton-based applications across different stages of development
* Increasing developer usage of the SDK through npm installs and active development environments
* Reduction in integration time for wallet connectivity and transaction flows
* Real-world validation of higher-level flows such as multi-wallet interactions, transaction lifecycle, and cost visibility
* Feedback-driven iteration based on actual integration challenges encountered by teams
* Multi-framework adoption (React and Vue) across different dApp segments

Adoption is expected to grow progressively across milestones, moving from early-stage integrations toward more production-oriented usage patterns.

---

## Milestones and Deliverables

Each milestone is sized at approximately 3 weeks of full-team engineering effort, with a balanced allocation between implementation, testing, documentation, and integration validation. The equal CC distribution across milestones reflects comparable engineering depth rather than time-on-task.

## Milestone 1 — Application-Layer Developer Tooling

**Estimated Delivery:** 3 weeks | **Funding:** 100,000 CC

**Effort Rationale:** Approximately 3 weeks of full-team engineering effort distributed across `@partylayer/session` lifecycle and resilience layer (~25%), multi-framework CLI scaffolding (~20%), `@partylayer/testing` mock provider and harness implementation (~20%), PartyLayer Studio interactive workbench (~20%), and Pattern Cookbook authoring (~15%). The funding allocation reflects implementation effort weighted toward developer-facing artifacts that establish a reliable onboarding baseline for the application-layer surface, anchored by the session resilience foundation that subsequent milestones build upon.

### Deliverables:

**`@partylayer/session` — Session Lifecycle & Resilience Layer**

A production-grade session management layer that sits above the Canton dApp SDK's transport primitives, handling the stateful concerns every Canton dApp currently rebuilds independently:

- Persistent session restore across page reloads via encrypted storage (Web Crypto API AES-GCM, localStorage and IndexedDB backends)
- Multi-tab synchronization via BroadcastChannel — disconnect in one tab propagates to all open tabs of the same dApp
- Party-switch detection — when the user changes the primary party in their wallet, dApp state is invalidated and re-fetched automatically
- Network and synchronizer change handling with cache invalidation and reconnect orchestration
- Automatic reconnect with exponential backoff and configurable retry policies for transient network failures
- Session expiry detection and graceful re-authentication flows that preserve in-flight transaction state
- `useSession`, `useAccount`, `useAccountEffect` hooks for React and equivalent composables for Vue, providing reactive access to session, primary account, and lifecycle events
- Session schema migration helpers for backward-compatible storage upgrades across SDK versions
- Origin-bound session isolation preventing cross-site session leakage

This layer operates strictly above `@canton-network/dapp-sdk`, consuming its `connect`, `disconnect`, `status`, and `statusChanged` primitives and adding the stateful resilience patterns that wallet-side transport does not provide.

**`npx create-partylayer-app` — Multi-Framework Application Scaffolder**

Four framework-aware boilerplates, each pre-wired with PartyLayer's application-layer patterns:

- React + Vite template — PartyLayer Provider, TanStack Query Client, pre-configured hooks, themed components wired
- Next.js App Router template — Server Components hydration via cookieStorage SSR pattern, route-level wallet gates, server-side party fetching
- Vue 3 + Nuxt 3 template — composables with API parity to React hooks, Pinia store integration, SSR hydration
- Vanilla JS template — framework-agnostic core for legacy frontends or progressive enhancement

Each template ships with a working transaction lifecycle UI, mock wallet setup from `@partylayer/testing`, session resilience pre-configured via `@partylayer/session`, and CIP-0103 conformance test integration.

**`@partylayer/testing` v1.0 — Application-Layer Testing Harness**

- Mock CIP-0103 wallet provider with configurable response scenarios (connect rejection, insufficient traffic, synchronizer error, transaction timeout)
- Simulated transaction lifecycle with controllable phase transitions for testing `isPreparing → isSubmitting → isConfirming → isFinalized` states
- Session lifecycle simulation utilities (forced session expiry, party-switch events, multi-tab disconnect propagation, reconnect scenarios)
- TanStack Query test utilities for asserting cache state, query invalidation, and optimistic update rollback
- Offline integration test utilities — no DevNet dependency required for unit tests

**PartyLayer Studio — Interactive Pattern Workbench**

An in-browser sandbox built on Sandpack that runs PartyLayer code without local installation:

- Live code editor with PartyLayer types pre-loaded — IntelliSense for all hooks, composables, and components
- Mock wallet driver integrated — simulate any CIP-0103 method response without a real wallet
- Embedded React Query DevTools showing live cache state, query keys, invalidations, and refetch triggers
- Transaction lifecycle stepper with pause/resume controls for walking through state transitions and rollback simulation
- Session resilience scenarios — multi-tab sync demonstration, party-switch invalidation walkthrough, reconnect-after-expiry replay
- Framework toggle — switch the same example between React, Vue, and Vanilla JS variants
- Scenario library — pre-built scenarios for multi-wallet switching, optimistic update rollback, CIP-0104 cost preview, synchronizer failover

**PartyLayer Pattern Cookbook**

Pattern-oriented cookbook of runnable patterns for common application-layer problems:

- Persistent session restore on page reload via `@partylayer/session`
- Multi-tab synchronization via BroadcastChannel
- Wallet-switch-safe state with `useAccountEffect`-style flow
- Automatic reconnect with exponential backoff after network interruption
- Optimistic transaction states with rollback (`useChoice` + `onMutate` snapshot/restore)
- Query invalidation tied to update stream events
- SSR hydration in Next.js App Router via cookieStorage
- CIP-0104 cost preview before signing
- Multi-party transaction composition with typed `actAs`/`readAs` accessors
- Suspense-driven loading boundaries via `useSuspenseQuery`

Each entry includes a runnable Studio scenario, code snippet, and "when not to use this pattern" guidance.

Updated npm releases and documentation publishing.

### Acceptance Criteria:

- `@partylayer/session` v1.0 published to npm with encrypted persistent storage, multi-tab BroadcastChannel synchronization, party-switch detection, automatic reconnect with exponential backoff, session expiry handling, and `useSession`/`useAccount`/`useAccountEffect` hooks for React and equivalent composables for Vue, validated through integration tests covering at least eight session lifecycle scenarios
- `npx create-partylayer-app` CLI published to npm with semantic versioning, supporting React + Vite, Next.js App Router, Vue 3 + Nuxt 3, and Vanilla JS templates
- All four scaffolded templates produce a working PartyLayer integration that passes the CIP-0103 conformance runner and ships with pre-wired TanStack Query Client, Pinia integration where applicable, SSR cookieStorage configuration, and `@partylayer/session` resilience layer
- `@partylayer/testing` v1.0 published to npm with mock wallet provider supporting configurable failure scenarios, simulated transaction lifecycle, session lifecycle simulation utilities, and TanStack Query test utilities
- PartyLayer Studio deployed publicly with Sandpack-based code editor, embedded React Query DevTools, transaction lifecycle stepper, framework toggle, and a minimum of six pre-built scenarios including at least two session resilience walkthroughs
- Pattern Cookbook published in the documentation site with at least eight runnable pattern entries linked to corresponding Studio scenarios
- All deliverables open-source on GitHub under the MIT license, with versioned releases and reproducible build instructions
---

### Milestone 2 — Framework Expansion & CIP-0104 Cost Helper

**Estimated Delivery:** 3 weeks
**Funding:** 100,000 CC

**Effort Rationale:** Approximately 3 weeks of full-team engineering effort distributed across Vue.js framework parity implementation (~40%), `@partylayer/react` v2.0 modernization to a TanStack Query–based architecture (~30%), CIP-0104 cost visibility helper (~15%), and CIP-0104 Live Reference (~15%). The primary focus is framework expansion — Vue parity together with React modernization establishing a consistent reactive cache model across frameworks — with the CIP-0104 helper included as a narrow application-layer UX utility.

**Deliverables:**

* **`@partylayer/vue` v1.0 — Vue 3 Composables with React Parity**

  * Vue 3 composables with API parity to React bindings (`useWallet`, `usePartyState`, `useTransactionCost`, `useDamlContract`, `useChoice`)
  * Component bindings for `<TransactionToast />`, `<CostPreview />`, `<PartyAvatar />`, `<SynchronizerSwitcher />`
  * Nuxt 3 SSR compatibility with server-side party fetching and hydration
  * Pinia store integration option for centralized state management
  * Suspense-ready composables for declarative loading boundaries
  * Validated against the same CIP-0103 conformance runner as React bindings

* **`@partylayer/react` v2.0 — Modernized React Bindings**

  Modernization of the existing React integration layer to align with current frontend ecosystem standards and establish a consistent reactive cache model that Vue composables and future framework bindings mirror:

  * TanStack Query v5 integration as a peer dependency, replacing the current context-based state model
  * `useQuery`/`useMutation` standard adopted across all hooks (`useWallet`, `usePartyState`, `useDamlContract`, `useChoice`, `useTransactionCost`)
  * `useSuspenseQuery` support via a dedicated `@partylayer/react/query` entrypoint for declarative loading boundaries
  * Server Components compatibility for Next.js App Router (RSC-safe imports, server-side party prefetching)
  * `cookieStorage` SSR pattern support for hydrating wallet and party state across server and client boundaries
  * `onMutate` snapshot/restore patterns baked into mutation hooks for optimistic transaction states with automatic rollback on error
  * Documented v1.x → v2.0 migration guide with codemod-friendly mappings
  * Validated against the same CIP-0103 conformance runner; backward-compatible exports preserved for one minor cycle

* **CIP-0104 Cost Visibility Helper**

  * `useTransactionCost` React hook and Vue composable
  * Pre-submission `CostEstimation` reading (`confirmation_request_traffic_cost_estimation`, `confirmation_response_traffic_cost_estimation`, `total_traffic_cost_estimation`)
  * Post-execution `paid_traffic_cost` reading from the transaction object
  * `<CostPreview />` UI component for displaying expected cost before signing and actual cost after execution
  * Documentation on integrating cost visibility into production dApp UI

  *Lightweight UX layer around existing ledger API fields (`paid_traffic_cost` on `transaction.proto`, `CostEstimation` on `interactive_submission_service.proto`). No reward attribution, no observability pipeline, no traffic accounting modification.*

* **CIP-0104 Cost Visibility Live Reference**

  Minimal, single-page, embeddable demonstration of the CIP-0104 cost helper running against DevNet:

  * Shows exact protobuf field reading (`paid_traffic_cost`, `confirmation_request_traffic_cost_estimation`, `total_traffic_cost_estimation`) in a working dApp
  * Provides a pattern reference wallet teams can point users to when explaining transaction costs
  * Serves as a regression target for CIP-0104 changes

**Acceptance Criteria:**

* `@partylayer/vue` v1.0 published to npm with API parity to React bindings, Nuxt 3 SSR support, Pinia integration, and validation against the same CIP-0103 conformance runner
* `@partylayer/react` v2.0 published to npm with TanStack Query v5 integration, `useSuspenseQuery` support via `@partylayer/react/query`, Server Components compatibility, `cookieStorage` SSR pattern, and a documented v1.x → v2.0 migration guide
* CIP-0104 Cost Visibility Helper published to npm with `useTransactionCost` hook/composable reading existing protobuf fields, accompanied by `<CostPreview />` UI component for React and Vue
* CIP-0104 Live Reference deployed publicly demonstrating pre-submission `CostEstimation` and post-execution `paid_traffic_cost` reading in a working DevNet dApp
* All Milestone 2 packages tagged on GitHub with versioned releases and reproducible build instructions

---

### Milestone 3 — Production Hardening, Canton-Specific Patterns, Observability & Mobile

**Estimated Delivery:** 3 weeks
**Funding:** 100,000 CC

**Effort Rationale:** Approximately 3 weeks of full-team engineering effort distributed across vertical-specific dApp templates (~25%), Canton-specific developer patterns (~20%), application-layer UI primitives and theme system (~15%), production observability layer and structured logging (~15%), React Native bindings (~10%), error taxonomy design and integration (~10%), and PartyLayer Production Migration Checklist with performance optimization (~5%). The vertical templates serve as integration vehicles that exercise and validate the application-layer patterns, UI primitives, and Canton-specific helpers established in earlier deliverables, reducing redundant implementation work. This milestone carries the highest production-readiness burden, balanced by reusing patterns and primitives established in earlier milestones.

**Deliverables:**

* **Canton-Specific Developer Patterns**

  * Privacy-aware query helpers (view decomposition handling, witness filtering)
  * Multi-party transaction flow patterns (multi-confirmer workflows, atomic settlement coordination)
  * CIP-0056 token standard interaction helpers (holdings queries, transfer instruction submission, allocation flows for FoP and DvP-style workflows)
  * Explicit contract disclosure helpers (auto-attach `disclosed_contracts` on Ledger API commands, leveraging Daml's explicit disclosure feature)
  * Synchronizer-aware operation utilities (multi-synchronizer party operations)

* **Vertical-Specific dApp Templates**

  Reference dApp templates that compose PartyLayer's application-layer surface — framework-native hooks, UI primitives, Canton-specific patterns, and CIP-0104 cost visibility — in production-oriented examples of real Canton use cases. These are not reference implementations of the base Canton dApp SDK; they are application-layer references that demonstrate how teams can build production-grade Canton dApps on top of the canonical SDK foundation.

  * **Tokenization Template** — issuance, transfer, and holdings management flows built on the CIP-0056 token standard
    * Issuer dashboard with mint, freeze, and supply management UI
    * User-facing holdings view via `useHoldings` and `<PartyAvatar />`
    * Transfer flow using CIP-0056 transfer instructions with `<TransactionToast />` lifecycle UI
    * CIP-0104 cost preview before signing via `<CostPreview />`
    * Multi-party demonstration (issuer party + user party) with wallet-switch-safe state
    * Typed Daml contract reads via `useDamlContract` with generated DAR types

  * **DvP Settlement Template** — atomic delivery-versus-payment flows between two parties, exercising the deepest set of Canton-specific patterns
    * Two-party UI (buyer + seller) with multi-confirmer transaction workflow
    * Atomic settlement coordination via CIP-0056 allocation flow (proposed → counter-signed → executed → settled lifecycle states)
    * Explicit contract disclosure auto-attach for cross-party visibility
    * Privacy-aware queries demonstrating per-party witness filtering
    * Synchronizer-aware operations with `<SynchronizerSwitcher />` for multi-synchronizer settlements
    * CIP-0104 cost preview per settlement leg

  Each template ships as an open-source GitHub repository with a working DevNet deployment, README with documented user flows, and deployment instructions. Templates are reference quality — they demonstrate composition patterns and exercise PartyLayer's stack end-to-end — and are explicitly not production-audited integrations.

* **Application-Layer UI Primitives**

  * `<TransactionToast />` — transaction lifecycle UI (preparing → submitted → confirmed → finalized → failed states)
  * `<CostPreview />` — CIP-0104 cost visualization component (built in M2, extended here with theme integration)
  * `<PartyAvatar />` — party identity display with metadata resolution
  * `<SynchronizerSwitcher />` — multi-synchronizer selection modal
  * Theme system (light / dark / Canton variants with configurable accent color, border radius, font stack)

* **Production Observability Layer**

  * Application-level event emission across integration lifecycle phases (connect, authorize, prepare, submit, confirm, error)
  * Vendor-neutral adapter interfaces for optional integration with external monitoring tools (OpenTelemetry, Sentry, Datadog)
  * No network-level telemetry, no centralized tracking, no user-identifying data collection

* **Structured Logging Hooks**

  * Standardized, machine-readable log events for each application-layer interaction phase
  * Configurable verbosity levels (debug, info, warn, error)
  * Correlation identifiers for tracing multi-step wallet operations

* **Standardized Error Taxonomy**

  * Canonical error classification aligned with CIP-0103 response categories
  * Stable, documented error codes for programmatic handling
  * User-friendly error message mapping for common cases (rejected signature, insufficient traffic, unsupported method, synchronizer errors)
  * Additive normalization layer — no modification of underlying CIP-0103 semantics

* **`@partylayer/react-native` v1.0**

  * Mobile wallet connectivity for React Native applications
  * React Native compatibility layer that consumes the same shared framework-agnostic core as React and Vue
  * Demonstration on at least one mobile-compatible wallet adapter

* **PartyLayer Production Migration Checklist**

  PartyLayer-specific operational checklist for moving applications from DevNet to TestNet to MainNet:

  * Bundle size regression checklist with per-framework targets (React, Vue, React Native), tree-shaking validation, lazy loading boundaries
  * Cache configuration for production — TanStack Query `staleTime`, `gcTime`, `refetchOnWindowFocus` tuning per data type (ACS snapshots vs party state vs cost estimates)
  * Production error boundary setup with Sentry/Datadog adapter configuration
  * Observability event schema with production sampling rates and PII filtering verification
  * Synchronizer failover patterns — `<SynchronizerSwitcher />` production configuration, retry policies
  * CIP-0104 cost preview accuracy monitoring — `CostEstimation` vs `paid_traffic_cost` drift tracking
  * SSR/Server Components production setup — `cookieStorage` configuration, edge runtime compatibility, cache headers
  * Multi-framework consistency tests ensuring React, Vue, and React Native behave identically in production scenarios

* **Performance Optimization**

  * Bundle size analysis and reduction
  * Caching strategies and lazy loading

**Acceptance Criteria:**

* Canton-specific developer patterns published with documented hooks/utilities for privacy-aware queries, multi-party flows, CIP-0056 token standard interactions (holdings, transfer instructions, allocations), explicit contract disclosure helpers, and synchronizer-aware operations
* Two vertical-specific dApp templates (Tokenization Template, DvP Settlement Template) published as open-source GitHub repositories, each deployed to a live DevNet demo URL, accompanied by a README documenting at least five user flows per template and exercising the full application-layer surface (hooks, UI primitives, Canton-specific patterns, CIP-0104 cost visibility)
* Application-layer UI primitives (`<TransactionToast />`, `<CostPreview />`, `<PartyAvatar />`, `<SynchronizerSwitcher />`) published with theme system supporting light, dark, and Canton variants
* Production observability layer published with documented event schema across connect, authorize, prepare, submit, confirm, and error lifecycle phases
* Vendor-neutral adapter interfaces shipped with at least one working reference adapter for external monitoring tools (OpenTelemetry, Sentry, or Datadog)
* Structured logging hooks published with configurable verbosity levels and correlation identifiers for multi-step operation tracing
* Standardized error taxonomy documented with stable error codes mapped to CIP-0103 response categories, validated through integration tests
* `@partylayer/react-native` v1.0 published to npm with mobile wallet connectivity demonstrated on at least one mobile-compatible wallet adapter
* PartyLayer Production Migration Checklist published with documented DevNet → TestNet → MainNet path and PartyLayer-specific production-readiness verification steps
* Bundle size analysis published with measurable reduction targets achieved
* All deliverables open-source on GitHub under the MIT license, with versioned releases and reproducible build instructions

---

## Funding

**Total Funding Request: 300,000 CC**

| Milestone                                                                           | Target Deadline | Funding    |
| ----------------------------------------------------------------------------------- | --------------- | ---------- |
| Milestone 1: Application-Layer Developer Tooling                                    | End of Week 3   | 100,000 CC |
| Milestone 2: Framework Expansion & CIP-0104 Cost Helper                             | End of Week 6   | 100,000 CC |
| Milestone 3: Production Hardening, Canton-Specific Patterns, Observability & Mobile | End of Week 9   | 100,000 CC |

**Total projected duration:** 9 weeks (3–3–3 structure).

---

## Post-Grant Maintenance & Sustainability

PartyLayer is published under the MIT license and operated as a permanent public good for the Canton ecosystem. After grant delivery, the project will continue to be maintained as a long-term commitment.

**Maintenance Owner:** Cayvox Labs will remain the primary maintainer of PartyLayer and continue ongoing development, compatibility updates, and ecosystem support beyond the grant period.

**Commitment Horizon:** Cayvox Labs commits to active maintenance of PartyLayer for a minimum of 12 months following the completion of Milestone 3, with the intention of continuing maintenance as part of its long-term Canton ecosystem operations.

**Funding Model:** Post-grant maintenance is self-sustained through Cayvox Labs' operational budget. No additional ecosystem funding is requested for ongoing maintenance.

**Maintenance Scope:** Ongoing work after grant delivery includes:

* Bug fixes and security patches
* Dependency upgrades, including alignment with new versions of `@canton-network/dapp-sdk`
* CIP-compliance updates
* Wallet adapter updates
* Review and triage of community issues and pull requests

**Expected Ongoing Burden:** Approximately 1–2 engineering days per month for routine maintenance, with larger ecosystem-driven updates handled through public roadmap planning.

**Repository Health Commitments:**

* Issue triage within 5 business days
* Security patches addressed within 7 days of disclosure
* Public changelog and release notes maintained for each version
* Automated dependency monitoring enabled on all packages

**Continuity Plan:** All deliverables remain MIT-licensed and freely forkable. If active maintenance is ever reduced, the project can continue through community contributors, wallet teams, or ecosystem participants without licensing or governance restrictions.

---

## Volatility Stipulation

If Committee-requested scope changes extend beyond six months, remaining milestone terms may be revisited to address material CC volatility.

---

## Co-Marketing

Upon release, the implementing entity will collaborate with the Foundation on milestone announcements, technical blog publications, participation in developer working groups, and publication of open-source reference applications demonstrating multi-wallet UX, multi-framework support, cost visibility, and production deployment patterns.

The interactive playground delivered in Milestone 1 will serve as a persistent, zero-friction demonstration of Canton's application-layer developer experience.

---

## Motivation

Canton's economic model rewards application-layer utility, and application growth depends on developer velocity. Connectivity is now well-defined through CIP-0103 and the Canton dApp SDK. The remaining productivity gap sits at the application layer above — in framework-native hooks, reactive state management, themed UI primitives, multi-framework reach, and Canton-specific dApp patterns that turn the connectivity layer into a productive developer experience.

CIP-0104's post-0.6 changes have made traffic cost data directly available on the ledger API. Surfacing that data to dApp UI in a developer-friendly way still requires application-layer hooks, but the underlying transport is already in place. PartyLayer provides this thin developer-experience layer — letting applications show users transaction costs before signing and after execution — without reimplementing transport, modifying reward logic, or duplicating the dApp SDK's connectivity work.

Funding PartyLayer strengthens the application-layer developer experience above the canonical Canton SDK. Every reusable application-layer pattern reduces ecosystem fragmentation and accelerates dApp development without competing with the foundational connectivity layer below.

---

## Rationale

PartyLayer is not a competing SDK. It is the application-layer developer experience framework above the Canton dApp SDK — analogous to wagmi and RainbowKit above viem and EIP-1193 in the Ethereum ecosystem. It is designed to build on the canonical Canton SDK foundation, preserve wallet authority and protocol semantics fully, and operate exclusively at the application boundary.

This proposal extends proven infrastructure rather than initiating speculative development. PartyLayer builds on the canonical Canton SDK foundation, preserves wallet authority, and operates exclusively at the application boundary. It is and will remain fully open-source under the MIT license — all funded deliverables are public, auditable, and available to every participant in the Canton ecosystem without restriction.

It is not a competing standard. It is the application-layer developer experience framework that turns the canonical Canton dApp SDK into a productive dApp development environment.
