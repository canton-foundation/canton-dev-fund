# Canton Development Fund Proposal

## Denex Developer Toolkit: Type-Safe SDKs, Code Generation, and Local Development Frameworks for the Canton Network

---

## 1. Executive Summary

We propose the continued development and open-source release of the **Denex
Developer Toolkit**: an integrated suite of three purpose-built tools that
directly address the Canton Network's most critical developer experience gaps as
identified in the
[2026 Developer Experience and Tooling Survey](https://discuss.daml.com/t/canton-network-developer-experience-and-tooling-survey-analysis-2026/8412):

1. **adz**: A Daml-to-TypeScript code generator that produces Zod schemas and
   typed package descriptors from Daml source, eliminating the need for manual
   type definitions or reliance on deprecated codegen tooling.
2. **Denex SDK**: A type-safe, high-level TypeScript SDK for interacting with
   Canton ledger APIs, built on OpenAPI-generated clients and augmented with
   Zod-driven runtime type safety, delivering the ergonomic,
   "batteries-included" developer experience the community has been requesting.
3. **Denex Localnet**: A configurable local Canton network manager that replaces
   the current approach of hardcoded, multi-file configuration with a single
   declarative configuration file, programmatic API, and CLI for orchestrating,
   inspecting, and modifying running local networks.

These three tools map directly to the survey's top-priority categories: **Typed
Client SDKs & Code Generators**, **Typed SDKs & Language Bindings**, and **Local
Development Frameworks**, with the latter being the single highest-rated
"Critical" need across all respondents.

**Funding Requested:** 25,000,000 CC **Timeline:** 9 months **Team:** 8
developers

---

## 2. Problem Statement

The Canton Network's 2026 Developer Experience Survey paints a clear picture:
**developers are spending more time fighting infrastructure and tooling gaps
than building applications.** Three findings stand out:

### 2.1 Environment Setup Is the #1 Bottleneck

41% of respondents cited environment setup and node operations as the task that
took the longest to "get right." Developers are forced to be **infrastructure
engineers before they can be product builders**. The existing Splice LocalNet
and CN Quickstart approaches require navigating 80-120+ configuration files
spread across Docker Compose fragments, environment files, HOCON configs,
Makefiles, Gradle tasks, and Keycloak realm exports, with hardcoded party hints,
port numbers, OAuth client IDs, and user identifiers scattered throughout.

### 2.2 No Production-Ready Typed SDK Exists

The survey explicitly called out the need for **Typed SDKs & Language Bindings**
and **Typed Client SDKs & Code Generators**. The current TypeScript landscape is
fragmented:

- Digital Asset's own `@daml/ledger` package has not been updated for the
  current Canton architecture, and DA's documentation no longer recommends it.
- The official TypeScript tutorial directs developers to use raw `openapi-fetch`
  with manually constructed commands, providing functionality but untyped at the
  Daml payload level.
- The community tools page lists `@c7/ledger` and `@c7/react` as replacements
  for `@daml/ledger`, with no explanation of why a replacement is needed and
  minimal adoption (1 GitHub star).
- The Splice Wallet Kernel SDK, while comprehensive for wallet provider
  integrations, does not provide a clear story for a typical dApp backend's
  interaction with its own ledger.

### 2.3 The Hardhat/Foundry/Anchor Gap

The survey's highest-urgency rating went to **Local Development Frameworks**,
where developers specifically name-dropped Hardhat, Foundry, and Anchor as the
standard they expect. They want a single tool to handle scaffolding, testing,
local network management, and deployment. Currently, they are "cobbling
together" scripts.

---

## 3. Proposed Solution

### 3.1 adz: Daml-to-TypeScript Code Generator

**Category:** Typed Client SDK & Code Generator

**What it does:** adz parses Daml source files using a custom Tree-sitter
grammar and generates:

- **Zod schema files** (one per Daml module) for all data types, templates,
  interfaces, and choices
- **Package descriptor files** that map the module/template/choice hierarchy to
  typed schemas, ready for use with the Denex SDK's `createPackageContext`

**Key technical features:**

- **Source-level parsing** via embedded Tree-sitter WASM, without requiring to
  run `daml compile` for codegen (DARs are used only for cross-package
  dependency resolution)
- **Single-file distribution** as a self-contained Deno bundle with grammar
  embedded
- **Comprehensive Daml construct support:** records, variants, enums, templates
  with choices (consuming and non-consuming), interfaces with views,
  cross-module imports
- **Precise type mapping:** Daml primitives -> `Daml.*` Zod helpers; `Optional`
  -> `Daml.Optional`; `ContractId T` -> `Daml.ContractIdOf("Module.Template")`;
  `Map`/`Set` -> appropriate containers; recursive types -> `z.lazy`; tuples ->
  structured objects
- **Transitive dependency resolution** across multi-package Daml projects via
  DAR inspection
- **Graceful degradation** for unsupported or exotic types (`z.any()` with
  comments), where generation never fails silently

**Impact:** Eliminates the manual process of extracting package IDs from `.dar`
files and hand-coding TypeScript types that the survey identified as a multi-day
friction point. Provides the codegen story that developers from EVM ecosystems
(71% of respondents) expect as table stakes.

### 3.2 Denex SDK: Type-Safe Canton Ledger API Bindings

**Category:** Typed SDKs & Language Bindings

**What it does:** A TypeScript monorepo providing high-level, type-safe access
to Canton ledger, scan, validator, and token standard APIs. Built on
`openapi-fetch` and `openapi-typescript` for the low-level REST layer, augmented
with Zod schemas for runtime type safety at the Daml payload level.

**Key technical features:**

- **High-level `Ledger` API** with `submit`, `query`, `queryInterface`,
  `queryContractId`, and pagination primitives, providing a curated, ergonomic
  surface rather than raw HTTP path construction
- **Command builder pattern** with type-safe `create`, `exercise`, `archive`
  operations that validate payloads against Zod schemas at compile time and
  runtime
- **Fluent contract wrappers:** `Counter.create({ owner, count, tag })` -> typed
  contract instance with `.increment()`, `.decrement()`, `.archive()` methods
  and `.asCommand()` for batching
- **Automatic choice name normalization:** Daml's `Offer_Accept` convention ->
  `.accept()` method with original name preserved for ledger submission
- **Explicit `Ledger` vs `ClientLedger` split** enforcing disclosure access
  rules at the type level so that server-side code gets `$disclosure()`, while
  client-side code does not
- **Built-in pagination utilities:** `paginate`, `filter`, `collect`, `reduce`
  as async iterables
- **Canton token standard support:** Amulet, Splice, transfer registry,
  allocation, and token metadata queries built into the Ledger interface
- **Full auth stack:** OIDC discovery + client credentials with token caching
  (`authlib`), browser OAuth via `better-auth` (`web-connector`), session cookie
  support for UI apps
- **React integration:** `web-connector-react` with `DenexProvider`,
  `useDenexContext`, typed error handling
- **NPM-publishable:** Deno-first development with `dnt` build pipeline for NPM
  distribution
- **CIP-0056 compliant** with a roadmap to CIP-0103 compliance

**Impact:** Replaces the current workflow of manually constructing JSON commands
against untyped `unknown` payloads with a fully typed, IntelliSense-driven
development experience. The fluent API for contract interaction
(`counter.increment({ amount: 2n })`) mirrors the ergonomics of ethers.js and
Anchor that 71% of respondents are accustomed to.

### 3.3 Denex Localnet: Configurable Local Canton Network Manager

**Category:** Local Development Framework

**What it does:** A tool to run, configure, and control Canton local networks
for development and testing, with a single-file declarative configuration model
and both CLI and programmatic APIs.

**Key technical features:**

- **Single-file configuration** for the entire localnet topology: number of
  participants/validators, party and user onboarding, authentication mode, and
  network ports, all existing in one file with straightforward syntax
- **Programmatic API** for configuring and modifying local networks from
  application code and test suites
- **CLI tool** for managing running localnets: start, stop, modify topology,
  onboard parties, inspect state
- **Runtime state inspection:** Query a running localnet for active users,
  ports, parties, and configuration, enabling programmatic integration without
  hardcoding parameters
- **Dynamic modification:** Add/remove participants, onboard users and parties
  to a running network without restart
- **Test integration:** `test-utils` package with `setupSandbox` for automated
  integration testing with party allocation and ledger lifecycle management

**Impact:** Directly addresses the #1 survey finding. Transforms the current
experience of navigating 80-120+ files across Splice LocalNet and CN Quickstart
into a single, readable configuration. Developers can bring up a customized
Canton network in minutes rather than hours, and integrate it programmatically
into their test suites and CI/CD pipelines.

---

## 4. Comparison with Existing Solutions

A fair evaluation of this proposal requires addressing the existing tooling
landscape. We believe the Denex Developer Toolkit is complementary to existing
solutions while filling specific, critical gaps they do not address.

### 4.1 Denex SDK vs. Splice Wallet Kernel SDK

The [Splice Wallet Kernel](https://github.com/nickkatsios/splice-wallet-kernel)
is a comprehensive monorepo targeting **wallet provider integrations** via the
CIP-0103 dApp API standard. We recognize its value and do not propose to replace
it. Rather, the Denex SDK addresses a different, and currently unserved,
developer persona: **the dApp backend developer who needs to interact with their
own participant node's ledger.**

| Dimension                      | Splice Wallet Kernel                                                                                                                         | Denex SDK                                                                                                                                                 |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Primary audience**           | Wallet providers, exchanges, dApp frontends connecting to wallets                                                                            | dApp backends, frontends and full-stack developers, automation builders                                                                                                 |
| **Core abstraction**           | CIP-0103 JSON-RPC protocol between dApps and wallets; `DappClient` proxies ledger calls through wallet gateway                               | Direct ledger interaction via `Ledger` API with typed commands, queries, and contract wrappers                                                            |
| **Type safety at Daml layer**  | OpenAPI-generated types for HTTP paths and JSON-RPC schemas; **Daml payload types are `unknown`** unless manually typed via `Ops.*` generics | Zod schemas (hand-written or adz-generated) provide **compile-time and runtime type validation** for all contract payloads, choice arguments, and results |
| **Contract interaction model** | `createArguments` as untyped objects with string `templateId`; developers must manually construct command JSON matching Daml schemas         | Fluent wrappers: `Counter.create({ owner, count })`, `counter.increment({ amount: 2n })`, `counter.archive()`, all type-checked                           |
| **Codegen integration**        | OpenAPI + OpenRPC + protobuf codegen for transport layer; **no Daml source -> TypeScript codegen**                                           | Designed for adz integration: package descriptors feed directly into `createPackageContext` for end-to-end type safety from Daml source to TypeScript     |
| **API surface**                | Two parallel SDK APIs (`WalletSDKImpl` + v1 `Sdk` namespaces) with overlapping but different patterns                                        | Single `Ledger`/`ClientLedger` interface with consistent patterns across server and client                                                                |
| **Disclosure model**           | Handled within wallet gateway; not exposed as typed API                                                                                      | Explicit `$disclosure()` on `Ledger` (server) with type-level exclusion on `ClientLedger` (browser)                                                       |
| **CIP compliance**             | CIP-0103 (dApp <-> wallet)                                                                                                                   | CIP-0056 today, CIP-0103 on roadmap                                                                                                                       |

**Why both should exist:** The Splice Wallet Kernel solves the **wallet
connectivity** problem, "how do dApps discover and communicate with user
wallets?" The Denex SDK solves the **ledger interaction** problem, "how does
backend code create, query, and exercise contracts with type safety and
ergonomic APIs?" These are complementary layers in a full-stack Canton
application. A dApp will typically use the Denex SDK on its backend to interact
with its own participant node, and may additionally use the Splice dApp SDK on
its frontend to connect to user wallets via CIP-0103.

**On the current TypeScript codegen landscape:** Digital Asset's
JavaScript/TypeScript codegen (`daml2js`) depends on the `@daml/ledger` package,
which has not been updated to support the current Canton architecture. DA's own
documentation no longer recommends this path; the
[current TypeScript tutorial](https://docs.digitalasset.com/build/3.5/tutorials/json-api/canton_and_the_json_ledger_api_ts.html)
instead directs developers to use `openapi-fetch` with `openapi-typescript`,
generating types from the JSON Ledger API's OpenAPI specification. While this
provides typed HTTP paths, Daml contract payloads remain `unknown` in the
OpenAPI schema, which is the fundamental gap that adz + Denex SDK closes.

DA's
[community tools page](https://docs.digitalasset.com/build/3.4/overview/community_tools.html)
lists `@c7/ledger` and `@c7/react` as "replacements for `@daml/ledger` and
`@daml/react`" without elaboration on why replacements are needed or how they
differ. The `@c7/ledger` repository has minimal community adoption (1 GitHub
star, 0 forks) and describes itself as a "TypeScript wrapper around Canton V2
JSON API", acting as a thin wrapper without the high-level abstractions, codegen
integration, or type-safe contract interaction model that the survey respondents
are requesting.

**Our commitment to standards:** The Denex SDK is already CIP-0056 compliant. As
part of this grant, we will implement CIP-0103 compliance, ensuring that Denex
SDK applications can participate in the standard dApp <-> wallet protocol while
retaining the ergonomic, type-safe ledger interaction layer that distinguishes
our approach.

### 4.2 Denex Localnet vs. CN Quickstart / Splice LocalNet

The [Canton Network Quickstart](https://github.com/digital-asset/cn-quickstart)
(CN Quickstart) is an excellent reference architecture that demonstrates a full
Canton application stack (Spring Boot backend, React frontend, Daml contracts)
running on Splice LocalNet. We do not propose to replace it as a reference
application. Rather, the Denex Localnet addresses the **underlying
infrastructure management problem** that makes CN Quickstart difficult to
customize and integrate into automated workflows.

| Dimension                  | CN Quickstart / Splice LocalNet                                                                                                                                                                             | Denex Localnet                                                                                                               |
|----------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------|
| **Configuration model**    | **80–120+ files** across Docker Compose fragments, `.env` files (37+), HOCON configs (27+), Makefiles, Gradle tasks, Keycloak realm exports, nginx configs, and shell scripts                               | **Single declarative configuration file** with straightforward syntax for topology, parties, users, auth, and ports          |
| **Topology customization** | Fixed 3-role topology (SV, App Provider, App User); adding or removing participants requires editing multiple compose files, env files, HOCON configs, and potentially Keycloak realm data                  | Configurable number of participants/validators with parties and users specified declaratively                                |
| **Port management**        | Hardcoded port conventions (`4xxx` = SV, `3xxx` = App Provider, `2xxx` = App User) spread across compose files, env, and nginx configs                                                                      | Ports configurable in one place; introspectable at runtime                                                                   |
| **Party/user identity**    | `PARTY_HINT` env var with strict format validation; full party IDs resolved at runtime via `splice-onboarding` writing to shared Docker volumes; user IDs hardcoded in Keycloak realm exports and env files | Parties and users declared in config; resolvable at runtime via API or CLI without hardcoding                                |
| **Authentication**         | Two modes (`oauth2`/`shared-secret`) selected via `AUTH_MODE`; OAuth requires Keycloak with pre-configured realms, client IDs, and secrets across multiple env files                                        | Auth mode configurable in the single config file                                                                             |
| **Runtime inspection**     | No programmatic way to query active topology, parties, ports, or users; developers must read env files, Docker volume mounts, or navigate web UIs manually                                                  | **CLI and programmatic API** to inspect running network state, such as query active parties, ports, users, and configuration |
| **Runtime modification**   | Requires stopping the network, editing config files, and restarting                                                                                                                                         | **Modify a running network**: onboard parties/users, adjust topology via API or CLI                                          |
| **Integration testing**    | No built-in test harness; developers must manually ensure the network is running and hardcode connection parameters                                                                                         | `test-utils` with `setupSandbox` for automated lifecycle management, party allocation, and teardown                          |
| **Prerequisites**          | Docker >= 27, Compose >= 2.27, direnv, Java 21, Node.js, >= 8 GB RAM; Gradle/Make orchestration                                                                                                             | Docker, Deno/Node.Js, memory requirements vary on requested network size                                                     |


**Why the difference matters:** Consider a developer who wants to test a
multi-party workflow with 4 participants. With CN Quickstart, they would need
to:

1. Understand the Makefile -> Compose file merge chain
2. Create new compose service definitions for additional participants
3. Add corresponding HOCON configuration files for Canton and Splice
4. Create new env files for each participant's auth configuration
5. Update nginx routing for any new web UIs
6. Potentially modify Keycloak realm exports for new OAuth clients
7. Hardcode the new party IDs and ports into their application code

With Denex Localnet, they would:

1. Add entries to their single configuration file
2. Query the running network for the resolved party IDs and ports

This is the **Hardhat/Foundry/Anchor** experience the survey respondents are asking for.

---

## 5. Development Roadmap

### Phase 1: Open-Source Release

| Milestone; Deadline | Deliverable             | Category           | Requested Funding (CC) | Description                                                                                                                                                                                                                    |
| ---------------------- | ----------------------- | -------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1.1; Approval + 3 months | adz initial release     | adz       | 1,000,000 | Daml source code parser and TypeScript code generator producing Zod schemas and typed package descriptors from Daml projects |
| 1.2; Approval + 3 months | SDK initial release     | Denex SDK | 500,000 |  Collection of Typescript packages providing high-level, type-safe access to Canton ledger, scan, validator using Zod schemas for runtime type safety at the Daml payload level.  Publish `@denex/*` packages to public npm registry. | 
| 1.3; Approval + 3 months | Token standard fluent API | Denex SDK | 500,000 |  Higher-level fluent wrappers for CIP-0056 token standard operations (transfer, allocation, settlement) built on top of the existing schema and query layer |
| 1.4; Approval + 3 months | Localnet initial release | Denex Localnet | 1,000,000 |  Command line utility to manage local Canton network                                               |

**Phase 1 Funding Requested: 3,000,000 CC**

### Phase 2: Ecosystem Integration

| Milestone; Deadline | Deliverable                | Category           | Requested Funding (CC) | Description                                                                                                                                                                                                                 |
| ---------------------- | ----------------------- | -------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 2.1; Approval + 6 months | adz distribution      | adz            | 1,000,000 | Self-contained single file distribution                                      |
| 2.2; Approval + 6 months | localnet distribution | Denex Localnet | 1,000,000 | Self-contained single file distribution for cli tool                                  |
| 2.3; Approval + 6 months | Documentation         | All            | 1,000,000 | Unified documentation site; additional examples covering common patterns (DeFi workflows, tokenization, multi-party coordination); 

**Phase 2 Funding Requested: 3,000,000 CC**

### Phase 3: Hardening

| Milestone; Deadline | Deliverable              | Category           | Requested Funding (CC) | Description                                                                                                                                                                           |
| ---------------------- | ----------------------- | -------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 3.1; Approval + 9 months | adz hardening releases   | adz            | 1,000,000 | Broaden test coverage, improve diagnostic output for unresolved types                                                                                                                 |
| 3.2; Approval + 9 months | SDK hardening releases   | Denex SDK      | 1,000,000 | Harden SDK APIs based on real-world usage; improve error handling and edge case coverage across ledger query, command submission, and pagination paths; expand integration test suite |
| 3.3; Approval + 9 months | Localnet hardening releases | Denex Localnet | 1,000,000 | Harden configuration validation, lifecycle management, and runtime state inspection; improve error reporting and expand integration test coverage                                  |

**Phase 3 Funding Requested: 3,000,000 CC**

---

## 6. Funding & Resources

**Total Canton Coins requested**: 25,000,000 CC

| Phase / Commitment; Deadline                    | Amount (CC) | Trigger                               |
|----------------------------------------------------|-------------|---------------------------------------|
| Phase 1; Approval + 3 months                       | 3,000,000   | Committee acceptance of deliverables  |
| Phase 2; Approval + 6 months                       | 3,000,000   | Committee acceptance of deliverables  |
| Phase 3; Approval + 9 months                       | 3,000,000   | Committee acceptance of deliverables  |
| Acceleration of Phases 1-3; Approval + 6 months    | 1,000,000   | Committee acceptance of deliverables  |
| Adoption of Developer Toolkit                      | 15,000,000  | 1,000,000 CC per instance of repo used by a production-scale or representative Canton deployment; maximum of 15,000,000 CC or 15 instances |

## Adoption Requirements

This milestone focuses on validating the tools with real-world Canton app development and ensuring its usability across diverse applications. Denex will:
- Collaborate with the Canton Foundation and ecosystem to onboard 15 member companies or representative Canton deployments
- Support these teams in running the tool on their codebases
- Collect feedback and refine the tool’s output and usability
- Attestation of participation or usage of the tool
- Evidence of successful runs across participating projects

### Team Composition (8 developers)

| Role                            | Count | Focus                                                               |
| ------------------------------- | ----- | ------------------------------------------------------------------- |
| Senior TypeScript/SDK Engineers | 3     | Denex SDK core, CIP-0103 implementation, React integration          |
| Compiler/Tooling Engineers      | 2     | adz code generator, Tree-sitter grammar, IDE integration            |
| Infrastructure/DevOps Engineers | 2     | Denex Localnet, Docker orchestration, CI/CD                         |
| Technical Writer / DX Engineer  | 1     | Documentation, tutorials, sample applications, developer onboarding |

### Resource requirements

Engineering team (8 developers) Infrastructure & tooling (CI/CD, hosting,
testing) Documentation, design & community feedback Contingency & open-source
maintenance buffer

## Volatility Stipulation

This grant is denominated in fixed Canton Coin. Should the project timeline extend beyond 6 months, the remaining un-minted milestones will be renegotiated to account for any significant USD/CC price volatility.

---

## 7. Timeline & Scope Risk Management

Denex explicitly assumes the financial risk of executing engineering phases (Phases 1-3) parallel to incorporating community feedback. 
Should the community discussion change the scope presented in the above Phases, Denex absorbs the wasted work of working against an in-flux specification without requesting supplemental Foundation funds. 
Only if major scope is added to the proposal as part of the community discussion will the delivery milestone rewards be revisited.

---

## 8. Team Qualifications

The Denex team has been building on the Canton Network since its early days,
with deep experience across the Daml/Canton stack:

- **Active builders:** We are the developers behind the Denex platform, the
  creator of the Denex Gas Station and provider of Canton application hosting
  infrastructure. Our tools are born from solving real problems in production.
- **Ecosystem contributors:** We have first-hand experience with the developer
  pain points identified in the survey; our tools were built because we
  encountered these gaps ourselves.
- **TypeScript and tooling expertise:** Our team includes engineers with
  backgrounds in compiler tooling (Tree-sitter, code generation), TypeScript SDK
  design (OpenAPI, Zod, tRPC), and infrastructure automation (Docker,
  Kubernetes).
- **Existing, working code:** Unlike a speculative proposal, we are presenting
  **functional, tested tools** with integration test suites running against
  Canton sandboxes. This grant funds maturation and open-source release, not
  greenfield R&D.

---

## 9. Open-Source Commitment

All tools developed under this grant will be released under the **Apache 2.0**
license:

- **adz:** https://github.com/denex-io/adz
- **Denex SDK:** https://github.com/denex-io/denex-sdk
- **Denex Localnet:** https://github.com/denex-io/denex-localnet

---

## 10. Alignment with Canton Network Priorities

This proposal directly addresses the Canton Network's stated priorities from the
2026 Developer Experience and Tooling Survey:

| Survey Priority                                                        | Denex Toolkit Component      | Alignment                                                                                |
| ---------------------------------------------------------------------- | ---------------------------- | ---------------------------------------------------------------------------------------- |
| **Local Development Frameworks** (rated "Critical" or highest urgency) | Denex Localnet               | Single-file config, CLI, programmatic API (the "Hardhat for Canton")                     |
| **Typed SDKs & Language Bindings**                                     | Denex SDK                    | Type-safe ledger API with fluent contract wrappers and Zod validation                    |
| **Typed Client SDK & Code Generator**                                  | adz                          | Daml -> TypeScript + Zod codegen, eliminating manual type extraction                     |
| **Conceptual Paradigm Shift** (EVM -> Canton learning curve)           | Denex SDK                    | Familiar ethers.js-like ergonomics (`.create()`, `.increment()`, `.archive()`)           |
| **Integration Friction** (Package ID discovery, frontend integration)  | adz + Denex SDK              | Automatic package ID embedding in generated descriptors; web-connector for browser dApps |
| **Standardized Wallet Adapter**                                        | Denex SDK (CIP-0103 roadmap) | Standards-compliant wallet interaction alongside ergonomic direct ledger access          |

---

_Submitted by the Denex Team for consideration by the Canton Development Fund
Grants Committee._
