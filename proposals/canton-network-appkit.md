## Development Fund Proposal

**Author:** Justin Kennedy, Moonsong Labs
**Status:** Submitted
**Created:** 2026-03-19

---

## Abstract

Canton AppKit is a shared developer toolkit for application teams integrating deployed Daml contracts into frontend and backend applications on Canton.

The proposal addresses recurring ecosystem friction identified in Canton developer research: manual identifier handling across environments, missing client-library patterns for application integration, and repeated custom work around signing and transaction submission. AppKit provides a TypeScript-first base client library, typed binding generation from Daml package metadata, identifier resolution across environments, and wallet integration patterns with reference applications.

The result is a reusable open-source integration layer that reduces custom glue code, makes integration from Daml package artifacts more reliable, and gives Canton teams a clearer path from package artifacts to working application code.

---

## Specification

### 1. Objective

The objective is to make Canton application integration substantially easier and more consistent for teams building user interfaces and backend services on top of deployed
Daml contracts.

Today, application teams repeatedly rebuild the same integration layer:

- wrapping the existing `dpm codegen-js` output, which extracts package and template identifiers into opaque hashes, emits CommonJS modules with deeply nested namespace paths for basic types, and relies on runtime JSON validation rather than compile-time type safety, producing bindings that are difficult to read, maintain, and review without
manually re-mapping identifiers into application code
- building custom wrappers around participant-facing APIs
- defining wallet or signing flows separately in each project
- rebuilding example integrations, documentation, and environment mapping conventions

AppKit packages that repeated work into a shared open-source toolkit, including a modern TypeScript code generation layer that wraps or replaces the current `dpm codegen-js`
output with idiomatic, well-typed, human-readable bindings.

Primary target users are:

- frontend developers integrating Canton applications into web clients
- backend engineers building services that read contract state and submit transactions
- platform engineers maintaining shared integration libraries, templates, and CI workflows
- security and integration engineers reviewing signing boundaries and identity mapping
- teams integrating external transaction signing via the Interactive Submission API

The intended outcome is an open-source toolkit that gives those teams a repeatable application integration layer built around a base client library, typed bindings generated
from Daml package metadata, environment-aware identifier resolution, reusable wallet adapter patterns, and reference integration materials.

### 2. Implementation Mechanics

AppKit will be delivered as an open-source toolkit composed of:

- a TypeScript-first client and SDK generator, including a base client library for browser clients and Node services, typed bindings generated from Daml package metadata, and identifier resolution helpers with configuration conventions for environment mapping
- a wallet adapter layer for browser and external signing workflows
- reference integrations that demonstrate end-to-end use in real application flows

AppKit focuses on standardizing how applications interact with deployed Daml contracts on Canton. For v1, the runtime client surface will target the HTTP JSON API methods used by the reference application and minimal web client: `query` for the documented read flow and `exercise` for the documented submit flow. 

The reference integrations assume the participant-facing HTTP JSON API is already exposed behind the environment's existing bearer-token auth model. Metadata inputs for binding generation and identifier resolution in v1 are limited to a local DAR path or a checked-in metadata manifest exported from a target environment. Live participant metadata queries are not required for milestone acceptance.

A representative v1 environment-mapping config shape is:

```yaml
environments:
  dev:
    participant:
      api: http-json
      url: <http://localhost:7575>
    packageSource:
      type: dar
      path: .daml/dist/app.dar
  test:
    participant:
      api: http-json
      url: <https://participant.test.example>
    packageSource:
      type: manifest
      path: ./metadata/finance-app.test.json
bindings:
  output: ./generated/canton
```

For signing and submission, v1 will demonstrate repeatable application-side signing and submission flows through the wallet adapter and reference integrations. AppKit will support MetaMask signing and external signing flows in the example integrations, with clear boundaries between application code, signing surfaces, and participant submission paths.

Reference integrations will demonstrate how signed application flows connect to the documented HTTP JSON API submission path using the environment’s existing bearer-token auth model. These examples are intended to clarify integration boundaries and signing patterns for application teams, not to define a production signing service.

The delivery approach is iterative and verifiable: define the integration boundaries and v1 targets early, ship working increments with reference examples, harden generation and documentation before broader rollout, and validate real workflows with external ecosystem developers before final adoption sign-off.

To keep scope realistic and avoid overlap with adjacent efforts, v1 does not include:

- operation of production infrastructure
- custody products or managed key storage
- hosted signing or transaction submission services
- protocol changes to Canton
- an end-user wallet application
- a standalone auth platform or local auth harness product

AppKit may consume discovery metadata or documentation outputs from DevKit or equivalent tooling where available, but discovery crawling and documentation extraction are not deliverables of this proposal.

### 3. Architectural Alignment

This work aligns with Canton architecture and with the Development Fund’s focus on shared ecosystem tooling.

- It addresses shared developer-tooling gaps identified by recent Canton developer research.
- It improves the application integration layer around deployed Daml contracts without changing protocol behavior.
- It targets concrete Canton integration surfaces in v1: HTTP JSON API runtime workflows plus package artifact or checked-in metadata manifest inputs for generation and identifier resolution.
- It produces reusable open-source outputs rather than private application code.
- It includes reference implementations and documentation intended for multiple ecosystem teams.

AppKit is an application integration toolkit, not a protocol or custody proposal. It complements broader wallet and SDK efforts by focusing on the layer between Daml artifacts, participant APIs, and application code.

This proposal does not require a new Canton protocol CIP. It is aligned with the Development Fund's common-good tooling goals under CIP-0082 and the governance and review structure defined by CIP-0100.

### 4. Backward Compatibility

No backward compatibility impact.

This is an external developer toolkit. Teams can adopt it incrementally, module by module, or ignore it entirely.

---

## Milestones and Deliverables

### **Milestone 1: TypeScript Client, Binding Generator, and Wallet Interfaces**

- **Estimated Delivery:** 4 weeks
- **Focus:** Deliver the TypeScript-first foundations for AppKit, including typed binding generation, identifier resolution scaffolding, and wallet adapter design
- **Deliverables / Value Metrics:**
    - TypeScript base client package implementing the selected v1 API surface for the reference integrations
    - Binding generator that produces a single consumable TypeScript package, including typed bindings, from Daml package artifacts or checked-in metadata manifests
    - Checked-in reference Daml package used as fixtures for generation and CI
    - Checked-in appkit.config.yaml example covering dev and test environments and identifier resolution without hardcoded package IDs
    - Wallet adapter interface and signing threat model covering MetaMask and external signing
    - Fixture test that regenerates bindings from the reference package and fails on diff against committed output

### **Milestone 2: Reference Integrations and TypeScript Workflow Generation**

- **Estimated Delivery:** 4 weeks
- **Focus:** Deliver end-to-end integration flows and generate TypeScript workflows derived from Daml scripts for reference packages
- **Deliverables / Value Metrics:**
    - Minimal example clients that read contract state and submit one documented reference choice using AppKit libraries and generated bindings
    - Identifier resolution helpers that switch the reference integration between dev and test using the checked-in config
    - MetaMask signing flow demonstrated through the wallet adapter in a minimal example web client
    - External signing flow demonstrated in a minimal example web client, showing sign-outside-the-node-environment submission through the wallet adapter
    - Script porting tooling that translates selected Daml scripts into TypeScript workflow implementations using the generated bindings
    - Initial developer documentation for setup and integration steps for the reference integrations

### **Milestone 3: AI Refinement, Test Generation, and Release Readiness**

- **Estimated Delivery:** 4 weeks
- **Focus:** Make AppKit stable, improve TypeScript ergonomics with AI-assisted refinement, and validate generated outputs through a sandbox-driven test gate
- **Deliverables / Value Metrics:**
    - AI-powered SDK refinement tooling that improves TypeScript ergonomics for the generated SDK package
    - Test generation tooling plus a repeatable sandbox test runner, with passing tests used as the validation gate for generated outputs
    - GitHub Actions workflow running generation, unit, and integration tests on ubuntu-latest and macos-latest
    - CI job that regenerates bindings from the checked-in reference package and fails on diff
    - Compatibility and versioning policy for AppKit libraries and generated bindings
    - Documented error cases for missing package IDs, stale bindings, and signing failures, with corresponding test coverage
    - Developer documentation, quickstarts, and integration runbooks suitable for ecosystem reuse

### **Milestone 4: Adoption, Enablement, and Ecosystem Rollout**

- **Estimated Delivery:** Week 16
- **Focus:** Publish enablement assets and run structured rollout activities that support AppKit adoption
- **Deliverables / Value Metrics:**
    - publish 1 written case study covering a full AppKit workflow, from typed binding generation through identifier resolution and transaction submission using the wallet adapter
    - record and publish 1 demo featuring a walkthrough of the reference workflow, including MetaMask signing and external signing flows
    - conduct 2 live developer workshops focused on integrating a frontend or backend service with AppKit
    - host weekly “office hours” sessions for pilot teams and ecosystem dvelopers adopting AppKit; to be designed as 1-hour sessions held each week for 4 weeks
    - publish 1 technical content piece with a goal to be co-marketed by the Canton Foundation and/or other ecosystem partners

### Post-Completion: Ongoing Maintenance

Given the role of AppKit as shared developer infrastructure, we expect maintenance to become important as the Canton ecosystem evolves. Although ongoing maintenance is not in scope for this proposal, Moonsong Labs would be available to provide ongoing maintenance and would recommend revisiting this as a separate agreement should there be a demonstration of clear adoption by the ecosystem per Milestone 4.

---

## Acceptance Criteria

Project-specific acceptance conditions:

- Developers can generate contract-specific typed bindings on top of the AppKit client libraries from Daml package artifacts or participant metadata using a repeatable workflow
- Applications can resolve required package IDs and template identifiers without manual extraction from build outputs
- A reference application can read contract state and submit contract interactions using AppKit libraries and generated bindings
- A minimal example web client can:
    - sign and submit transactions using MetaMask through the wallet adapter
    - sign outside the node environment and submit transactions through the wallet adapter
- SDK generation and builds behave consistently across developer machines and CI pipelines

---

## Funding

**Total Funding Request:** 1,575,000 CC

### Payment Breakdown by Milestone

- Milestone 1 *(TypeScript Client, Binding Generator, and Wallet Interfaces)*: 450,000 CC
- Milestone 2 *(Reference Integrations and TypeScript Workflow Generation)*: 450,000 CC
- Milestone 3 *(AI Refinement, Test Generation, and Release Readiness)*: 450,000 CC
- Milestone 4 *(Adoption, Enablement, and Feedback Integration)*: 225,000 CC

---

## Co-Marketing

Co-marketing will be aligned with Milestone 4 (Adoption, Enablement, and Ecosystem Rollout) and will focus on coordinated promotion of all produced assets and activities across Moonsong Labs, Canton Foundation, and ecosystem channels.

Specific commitments:

- joint promotion of the written case study and technical content piece covering a full AppKit workflow, including typed binding generation, identifier resolution, and wallet-based transaction submission
- coordinated distribution of the recorded demo / walkthrough, including MetaMask and external signing flows
- co-marketing of the two live developer workshops focused on integrating frontend and backend services with AppKit
- co-promotion of weekly office hours sessions to drive engagement from pilot teams and ecosystem developers
- coordinated promotion of all supporting adoption assets, including the quickstart, environment mapping guide, CI template, and reference workflow materials

---

## Motivation

This proposal matters because it addresses a recurring ecosystem integration problem, not a one-off application need.

Canton application teams repeatedly lose time on contract-to-application glue work, especially around identifier management, environment mapping, missing client-library conventions, and bespoke signing paths. That slows delivery, produces inconsistent integration patterns, and increases the chance of fragile upgrades and hardcoded values reaching production code.

AppKit addresses that as shared infrastructure for developer teams. The expected ecosystem value is lower integration cost for new Canton applications, faster onboarding for frontend and backend engineers, more consistent identifier and environment-handling patterns, reusable signing and submission patterns, and reference examples that other teams can adapt instead of rebuilding from scratch.

The expected adoption path is developer-team adoption rather than end-user growth. The proposal therefore includes an adoption milestone focused on external validation, guides, reference integrations, and iteration based on feedback.

---

## Rationale

This is the right approach because it focuses on the missing application integration layer without trying to become every adjacent tool at once.

A narrower proposal would only address code generation or identifier extraction. A broader proposal would move toward a full wallet platform, hosted infrastructure, or a multi-language SDK surface that is harder to verify and more likely to overlap with other funded efforts. AppKit instead focuses on the shared integration layer between Daml artifacts, participant APIs, and application code, which keeps the scope specific enough to be verifiable without drifting into adjacent platform work.

The milestone structure is also intentional: early milestones fund objectively verifiable product delivery, hardening is separated from MVP delivery so release-readiness can be reviewed explicitly, and adoption is its own milestone so the proposal includes a clear distribution and usage plan. This keeps the proposal tied to concrete deliverables while also showing how the toolkit can be used beyond the initial implementation.

---

## Addendum

### **1. Architecture and Components**

AppKit is delivered as a client library plus a typed binding generator, with wallet integration patterns and reference applications showing how clients and services connect to Canton participant APIs.

1.2 Typed SDK Generation

AppKit provides a base client library plus a generator that produces contract-specific typed bindings from Daml package metadata, sourced from package artifacts or a target environment.

The generated bindings provide:

- Type definitions for templates, payloads, and choice arguments
- Convenience methods for reading contract state and submitting transactions through the base library
- Stable handling of templates and package identifiers across environments, without hardcoding values in application code
- First-class support for Daml Finance interfaces (accounts, holdings, instruments) with proper generic constraints
- A single coherent TypeScript package, replacing the current daml codegen js output of scattered, hash-named intermediary packages with no usable code

1.2.1 AI-Powered SDK Refinement & Test Generation

An AI skill improves the generated SDK through iterative refinement and validation:

- SDK improvement: Reads Daml source alongside generated TypeScript to enhance ergonomics: idiomatic builder patterns for complex payloads, discriminated unions for variants, and convenience helpers derived from common contract interaction patterns
- Script porting: Translates Daml scripts (setup, mint, transfer, deposit, redeem) into TypeScript workflow implementations using the SDK, converting multi-party submit/exerciseCmd sequences into typed ledger calls that serve as reference code for developers
- Test generation: Generates unit tests for each contract template and workflow, then runs them against a Canton sandbox, using test execution as a binary signal to iteratively fix both SDK wrappers and tests until the full suite passes

1.3 Identifier Resolution

AppKit standardizes how the client library and binding generator resolve package and template identifiers across environments.

It includes:

- Environment mapping conventions for participant endpoints and package sources
- Package ID and template identifier resolution used by generated bindings
- Optional local caching guidance where teams need reproducible builds

1.4 Wallet Adapter Layer

The wallet adapter layer standardizes how frontend applications sign and submit Canton transactions.

It includes:

- A common adapter interface that applications integrate once, with clear boundaries between app code, signing surfaces, and participant submission paths
- Native MetaMask support for browser-based signing flows
- External signing support, create an unsigned transaction payload, sign outside the node environment, then submit

Validation items for Phase 0:

- Confirm the current Canton Ledger app integration surface and MetaMask compatibility
- Confirm external signing support with the Canton Ledger app
- Decide whether WalletConnect is in scope, this may depend on third-party constraints

1.5 Reference Integrations

Reference integrations provide working examples that demonstrate:

- Querying contract state using AppKit client libraries and generated bindings
- Submitting contract interactions using AppKit client libraries and generated bindings
- A minimal example web client demonstrating MetaMask signing and external signing flows
- Environment mapping conventions for package IDs and participant endpoints across dev and test setups

### **2. Why Moonsong Labs**

Moonsong Labs engineers have shipped production systems across Polkadot, Ethereum, zkSync, Solana, and other ecosystems. This includes building developer-facing integration layers, typed client tooling, and secure transaction submission patterns used by external teams.

Work relevant to this package includes:

- Canton Network demo application, compliant stablecoin plus yield vault, used to validate Daml Finance composition patterns and Canton privacy. The work included a devcontainer for one-click setup, plus AI skills that generate TypeScript SDKs from Daml models and scaffold React UI components
    
    Case study: https://moonsonglabs.com/casestudy/demonstrating-a-baseline-for-building-advanced-financial-applications-on-canton/
    
    Repo: https://github.com/Moonsong-Labs/canton-apps
    
- ZKsyncOS Foundry and related developer tooling, Rust-based tooling derived from the Foundry stack to support Ethereum development workflows on ZKsyncOS, plus testing utilities for Foundry ZKsync
    
    https://github.com/Moonsong-Labs/zksync-os-foundry
    
    https://github.com/Moonsong-Labs/forge-zksync-std
    
- Moonbeam tooling and utilities, which supported large developer ecosystems with reusable integration tooling and scripts
    
    https://github.com/Moonsong-Labs/moonbeam-tools
    
- Glacis, which provided standardized connector interfaces and routing policies across multiple providers, requiring clear integration boundaries and stable developer APIs
    
    https://github.com/glacislabs/v1-core
    

These projects show experience building integration layers that reduce glue code and make security boundaries explicit. That is directly relevant to the Canton ecosystem’s need for standard SDK and wallet integration tooling.