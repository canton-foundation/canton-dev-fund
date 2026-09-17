## Development Fund Proposal

**Author:**  BlockyDevs
**Status:** Submitted
**Created:** 2026-03-12  

---

## Abstract
Canton already has strong foundational integration primitives, including the approved CIP-0103 dApp standard, the Splice Wallet Kernel, the dApp SDK, and the Wallet SDK. What is still missing is a dedicated open-source **agent SDK** that exposes Canton functionality as structured, AI-framework-compatible tools rather than only low-level wallet, ledger, and transaction primitives.

**Canton Agent Kit** will fill that gap with an open-source TypeScript SDK that allows developers to build AI agents which can **read Canton state and execute Canton transactions** through tool interfaces compatible with modern AI frameworks. The first release will focus on a wallet-agnostic developer experience built around Canton’s **external-party** transaction model, with two execution modes: **AUTONOMOUS**, where the SDK controls the signing flow for an onboarded external party, and **RETURN_BYTES**, where it prepares and returns the transaction payload and signing material for external execution.

The initial first-party tools will cover Canton Coin balance reads, token balance reads, Canton Coin transfers, token-standard asset transfers, and direct ledger-query helpers. The project will also establish a plugin architecture for third-party community extensions from v1, allowing the Canton ecosystem to publish its own tools on top of a shared foundation.

BlockyDevs is well positioned to deliver this project. We operate as a long-term R&D partner for blockchain ecosystems and developer tooling initiatives, and we are the team behind the current **Hedera Agent Kit** work and the **Hedera x402 integration**, along with multiple other ecosystem-facing SDK, reference implementation, and developer experience initiatives. That experience directly translates into the design and delivery of an agent SDK for Canton.
---


## Specification

### 1. Objective

The objective of **Canton Agent Kit** is to make Canton usable inside modern agentic application stacks by providing a reusable SDK that exposes Canton operations as AI-agent-friendly tools.

Today, Canton developers can build against the Wallet SDK, dApp SDK, Ledger API, and the approved CIP-0103 dApp standard, but they still need to translate Canton-specific reads, transfers, signing flows, and execution semantics into framework-specific tool abstractions on a per-project basis. CIP-0103 solves wallet-to-dApp interoperability, but it does not itself provide a dedicated agent-tooling layer for AI frameworks.

Canton Agent Kit is intended to solve that gap. It will provide a high-quality public-goods SDK that lets developers quickly build AI agents compatible with popular frameworks such as **Vercel AI SDK, LangChain, MCP-based tooling, and Google ADK**, without rebuilding the same Canton integration layer for every application.

The SDK will package common Canton read and transaction workflows into composable tools, document safe execution patterns, and establish a stable plugin surface for ecosystem contributors. The goal is not to replace existing Canton integration primitives, but to make them dramatically easier to use inside AI-native and agentic applications.

### 2. Implementation Mechanics

The project will be implemented as an open-source **TypeScript** SDK initially developed in a BlockyDevs repository and designed for later transfer to a foundation- or ecosystem-owned repository.

The initial package set will include:

- `canton-agent-kit`

The core package will contain:

- the SDK core
- the tool and plugin interfaces
- execution-context abstractions
- first-party Canton tools
- built-in integrations and compatibility layers for supported AI frameworks
- example implementations
- plugin authoring documentation
- release-quality API and usage documentation

The project will be released under **Apache-2.0**.

The initial version will keep everything inside `canton-agent-kit` to reduce packaging complexity, simplify adoption, and speed up iteration during the first release cycle. If the project gains traction and the ecosystem would benefit from more granular package boundaries, framework-specific adapters can be split into separate packages in a later phase without changing the core architecture.

#### Team and Delivery Structure

The project will be delivered by a focused engineering team from BlockyDevs consisting of:

- **1 Tech Lead / Senior Engineer** – responsible for architecture design, Canton integration, SDK core development, and framework compatibility
- **1 Mid-Level Developer** – responsible for SDK implementation, framework integrations, examples, testing, and documentation

This structure is intentionally lean. The scope of the project focuses on a well-defined SDK and a limited set of first-party tools, which allows the team to move quickly while maintaining high implementation quality.

BlockyDevs will also provide additional oversight through its R&D leadership to ensure architectural alignment with the Canton ecosystem and to support long-term maintainability of the project.

#### Maintenance and Sustainability

The requested funding covers the initial design, implementation, documentation, examples, release hardening, and a short post-launch bugfix support window.

Maintenance beyond the initial development milestones is not included in the requested funding. However, BlockyDevs intends to continue maintaining Canton Agent Kit after the initial release as part of our broader commitment to developer tooling and ecosystem infrastructure.

As a long-term R&D partner working with blockchain ecosystems, BlockyDevs regularly maintains SDKs, developer tools, and reference implementations beyond their initial delivery. The goal of Canton Agent Kit is to become a durable public-good developer tool for the Canton ecosystem, not a one-off prototype.

The project will therefore be designed with long-term sustainability in mind, including:
- clear documentation
- a modular architecture
- a plugin-based extension model
- support for community contributions
- a structure that allows future ecosystem-led stewardship if appropriate

#### Execution Model


The v1 SDK will support two execution modes:

- **AUTONOMOUS**  
  The SDK is configured with controlled signing material for an onboarded external party and performs the Canton transaction lifecycle directly: prepare, sign, and submit. This mode assumes the SDK consumer has the necessary validator and ledger connectivity, as well as controlled key management. It is not a browser-wallet flow. It is an SDK-native external-party execution flow.

- **RETURN_BYTES**  
  The SDK prepares the transaction and returns the unsigned transaction payload and related data required for external signing and submission, without signing or submitting the transaction itself. This allows any external party, wallet, or execution system to sign, submit, and execute the transaction independently, while preserving a framework-friendly tool interface.

This execution model is intentionally close to the approach proven in the Hedera Agent Kit, where developers can choose between direct execution and transaction-payload-return patterns depending on their custody and UX requirements.

#### Core Tooling Scope

The first-party v1 tool surface will include:

- Canton Coin balance queries
- token balance queries
- Canton Coin transfer initiation
- token-standard asset transfer initiation
- direct Ledger API query and read helpers
- amount-limit policy controls for write tools

The token-standard asset support is intended to cover broadly reusable transfer flows, including assets such as **USDCx**, which already fit the Canton token-standard model.

The scope is intentionally focused on the most reusable and widely needed primitives for agent developers. The goal of v1 is to provide a high-confidence core that solves the most common transaction and query needs first.

#### Plugin Architecture

The SDK will be designed for **third-party community plugins from v1**.

This is a crucial part of the value proposition. The purpose of Canton Agent Kit is not only to ship a fixed set of first-party tools, but to establish a stable shared foundation that other ecosystem teams can extend. Community developers should be able to package and publish their own Canton-specific tools on top of the same interfaces, execution modes, and framework adapters.

The project will therefore include:

- a plugin registration model
- third-party plugin authoring guidance
- recommended publishing conventions
- documentation for building compatible community plugins

#### Relevant Implementation Experience

BlockyDevs is not approaching this as a first experiment in agent tooling.

We operate as a long-term R&D partner for blockchain ecosystems and have direct experience building developer tooling, reference implementations, ecosystem integrations, and agent infrastructure. Most importantly for this proposal, our team is behind the current **Hedera Agent Kit** work and the **Hedera x402 integration**, which gives us practical implementation experience in:

- designing AI-framework-compatible blockchain tools
- building plugin-based agent SDKs
- defining direct-execution and payload-return execution modes
- supporting MCP-compatible interfaces
- packaging developer-facing abstractions over chain-specific transaction models
- delivering public-goods ecosystem tooling intended for third-party extension

This reduces execution risk significantly. Canton Agent Kit is not a speculative category for our team; it is an ecosystem adaptation of a tooling pattern we are already building and evolving in production-grade settings.

#### Explicitly Out of Scope for v1 Milestones

The following items are explicitly out of scope for v1 milestones:

- CIP-0103 wallet-provider adapter implementation
- token creation workflows
- NFT creation workflows
- transfer-preapproval automation
- advanced receive-side acceptance and rejection automation
- app-specific or bridge-specific utility workflows

These are valid future extension points, but they are not necessary to deliver a strong and useful first public release.

### 3. Architectural Alignment

This proposal is aligned with Canton’s current architecture and ecosystem direction because it builds **on top of** existing Canton primitives instead of attempting to replace them.

The Splice Wallet Kernel already provides the Wallet Gateway, dApp SDK, Wallet SDK, and shared core modules. The approved CIP-0103 standard defines a vendor-neutral dApp API with a minimal surface for ledger reads, transaction submission, and message signing. Canton Agent Kit is intentionally positioned as an **agent-developer layer above these primitives**, not as a replacement for CIP-0103 or the dApp SDK.

The proposal is also aligned because it uses the correct Canton execution model for its first version. Canton distinguishes between internal parties and external parties, and the external-party model is the right fit for an SDK that needs both **AUTONOMOUS** and **RETURN_BYTES** execution modes inside the SDK itself. This makes a direct external-party backend the right foundation for v1.

The project is additionally aligned with Canton’s current asset model. The v1 focus on Canton Coin transfers, token-standard transfers, and ledger queries directly matches the kinds of reusable operations developers need most often, while leaving more specialized issuance and app-specific workflows for later extensions.

Finally, this proposal is aligned with the broader ecosystem roadmap because it complements rather than duplicates adjacent efforts:

- it is **not** a wallet discovery or WalletConnect proposal
- it is **not** a CIP-0103 compliance or dApp SDK productionization proposal
- it is **not** a general-purpose Canton copilot or multi-channel assistant proposal

Instead, it fills a distinct gap: an **AI-agent SDK** for developers building agentic applications on Canton.

### 4. Backward Compatibility

*No backward compatibility impact.*

All deliverables are additive open-source packages, documentation, and examples. Existing Canton applications, wallet providers, validators, and CIP-0103 implementations will continue to function unchanged.


---

## Milestones and Deliverables

### Milestone 1: Core SDK and Execution Backend
- **Estimated Delivery:** May 2026
- **Focus:** Establish the SDK foundation, plugin architecture, and direct external-party execution model.
- **Deliverables / Value Metrics:**
  - initial open-source repository under BlockyDevs
  - `canton-agent-kit` core package scaffold
  - core tool schema and plugin registration model
  - execution-context implementation for `AUTONOMOUS` and `RETURN_BYTES`
  - direct external-party integration backend for prepare, sign, and submit flows
  - LocalNet-based integration harness and CI
  - initial developer documentation covering configuration, key-management assumptions, and security boundaries

### Milestone 2: Framework Integrations, Examples, and Plugin Authoring
- **Estimated Delivery:** June 2026
- **Focus:** Make the SDK practical across major AI developer stacks and open it to ecosystem extension.
- **Deliverables / Value Metrics:**
  - framework integrations inside `canton-agent-kit` for LangChain, AI SDK, and MCP
  - Google ADK-compatible example integration
  - example agents for each included integration
  - plugin authoring guide
  - plugin publishing conventions and package structure guidance
  - public documentation bundle

### Milestone 3: Canton Query and Transfer Tooling
- **Estimated Delivery:** July 2026
- **Focus:** Deliver the first useful first-party Canton tools for agent builders.
- **Deliverables / Value Metrics:**
  - Canton Coin balance tool
  - token balance tool
  - Canton Coin transfer tool
  - token-standard asset transfer tool
  - direct ledger query and read helper tools
  - amount-limit guardrails for write tools
  - integration tests for the above tools
  - developer documentation for balances, reads, and transfers
  - usable beta SDK capable of powering at least one end-to-end agent flow in LocalNet
  - pre-release publication of `canton-agent-kit` to npm



### Milestone 4: Release Hardening and Ecosystem Launch
- **Estimated Delivery:** Agust 2026
- **Focus:** Stabilize, publish, document, and launch the SDK as a public-goods ecosystem artifact.
- **Deliverables / Value Metrics:**
  - stable v1.0 release of all first-party packages
  - API polish and bug fixing
  - short post-launch bugfix support window
  - end-to-end demo walkthrough
  - launch announcement assets
  - technical blog draft or case study content
  - workshop or live developer demo session
  - handover and transfer-readiness plan for future ecosystem-owned repository stewardship

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone
- Demonstrated functionality or operational readiness
- Documentation and knowledge transfer provided
- Alignment with stated value metrics

Project-specific acceptance conditions:

- `canton-agent-kit` and first-party adapter packages are published and installable
- The SDK demonstrates both `AUTONOMOUS` and `RETURN_BYTES` flows in working examples
- First-party tools for Canton Coin balance, token balance, Canton Coin transfer, token-standard transfer, and ledger reads are functional and documented
- Plugin authoring documentation is published and sufficient for third parties to build compatible plugins
- The final release clearly documents that direct execution assumes an onboarded external party and controlled key management
- A public demo or workshop is delivered as part of launch readiness

---

## Funding

**Total Funding Request:** 900,000 CC (at 0.145$ = 130,500 usd)

### Payment Breakdown by Milestone

- Milestone 1 _(Core SDK and Execution Backend)_: 225,000 CC upon committee acceptance
- Milestone 2 _(Framework Adapters, Examples, and Plugin Authoring)_: 225,000 CC upon committee acceptance
- Milestone 3 _(Canton Query and Transfer Tooling)_: 225,000 CC upon committee acceptance
- Milestone 4 _(Release Hardening and Ecosystem Launch)_: 225,000 CC upon final release and acceptance

### Volatility Stipulation

Should the project timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility.

---

## Co-Marketing

Upon release, the implementing entity will collaborate with the Foundation on:

- announcement coordination
- case study or technical blog
- developer or ecosystem promotion
- a public workshop or live demo session
- post-launch sharing of adoption signals such as npm package publication status, package downloads, and ecosystem plugin activity where available

---

## Motivation

Canton now has a credible foundation for wallet integrations, dApp interoperability, external signing, and token-standard asset support. What the ecosystem still lacks is a dedicated **agent-first SDK** that packages these capabilities into reusable tools for modern AI frameworks.

Without that layer, every team that wants to build agentic products on Canton must repeatedly translate Canton reads, transfers, signing flows, and execution semantics into custom tool definitions. That duplication slows adoption, increases integration cost, and makes Canton harder to use in the emerging generation of AI-native applications.

This proposal is valuable because the industry is moving toward applications where LLMs and agent runtimes orchestrate user intent through structured tools rather than one-off API wrappers. Hedera Agent Kit already demonstrates the usefulness of that pattern in practice: a plugin-based toolkit with execution modes, framework examples, MCP support, and a path for third-party plugins. Canton should have an equivalent open-source public-good asset tailored to its own architecture and execution model.

Canton Agent Kit would reduce developer friction, shorten time-to-first-agent, and make Canton materially easier to adopt for:

- AI-native applications
- internal copilots and workflow automations
- transaction assistants
- treasury and operations tooling
- future commerce and payment applications
- ecosystem-specific protocol and application plugins

This proposal is also strategically useful because it complements rather than duplicates the broader wallet-provider and dApp-interoperability work already happening around Canton. CIP-0103 is the right abstraction for vendor-neutral wallet-provider interoperability. Canton Agent Kit is the missing abstraction for **AI-agent developer ergonomics**.

Finally, BlockyDevs brings strong execution credibility to this work. We operate as a long-term R&D partner for blockchain ecosystems, have hands-on experience building ecosystem-facing developer tooling, and are already delivering in closely related categories such as Hedera Agent Kit and the Hedera x402 integration. This matters because the proposal is not only asking the Foundation to fund a useful idea, but to back a team that already knows how to turn chain capabilities into framework-compatible, developer-friendly agent tooling.

---

## Rationale

The core design choice in this proposal is to make the first release **wallet-agnostic at the SDK surface, but not CIP-0103-dependent at the core execution layer**.

This is the right approach because the main differentiator of the project is not browser-wallet interoperability. It is the ability to expose Canton transactions as framework-compatible tools with both **AUTONOMOUS** and **RETURN_BYTES** execution modes.

A CIP-0103-first design would optimize for wallet-provider interoperability, but it would make the first release less direct for the specific execution patterns that agent developers need most. By contrast, the external-party transaction model maps naturally to the desired SDK behavior:

- prepare, sign, and submit for direct execution
- prepare and return payload or signing material for external execution
- clear custody boundaries
- deterministic tool behavior inside the SDK

That makes it the right foundation for v1.

At the same time, this proposal does **not** reject CIP-0103. CIP-0103 is approved, important, and strategically useful for Canton. It simply addresses a different layer. That is why this proposal treats a CIP-0103 adapter as a logical future extension rather than a v1 prerequisite.

The scope is also intentionally narrow around balances, transfers, and reads. That is deliberate. Token creation, NFT creation, and bespoke asset-issuance flows are valid future features, but they often depend on application-specific workflows rather than a single universal primitive. Including them in v1 would increase complexity, create avoidable delivery risk, and weaken the clarity of the first release. A cleaner first version with high-confidence, broadly reusable tools will deliver more value to the ecosystem than a broader but riskier initial scope.

The TypeScript-first approach is also the right delivery choice. The immediate target frameworks in scope — AI SDK, LangChain, MCP-based tooling, and Google ADK compatibility — fit naturally into a TypeScript-first package strategy. The project can create the most ecosystem value fastest by focusing on one high-quality language/runtime first rather than splitting scope across multiple SDKs in v1.

Finally, this is the right team and the right time for this work. BlockyDevs has direct experience operating as a long-term R&D partner for ecosystem teams and already works in adjacent categories of agent tooling, framework adapters, execution abstractions, and chain-specific developer experience. Canton Agent Kit is therefore not only a strategically useful public good, but also a tractable and execution-ready initiative.