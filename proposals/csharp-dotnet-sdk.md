## Development Fund Proposal

**Author:** Matthieu Le Berre (Peaceful Studio)<br>
**Status:** Submitted<br>
**Created:** 2026-03-05<br>
**Last Revised:** 2026-04-30<br>
**[Champion](https://github.com/canton-foundation/canton-dev-fund/blob/main/sig-directory.md):** need Champion

---

## Abstract

**Canton Network is unreachable from C# / .NET today.** Digital Asset's previous bindings (`daml-net`) were archived in January 2025 without ever publishing NuGet packages. The current Canton Ledger API v2 (gRPC + JSON, OpenAPI-specified, stable since Canton 3.4) cannot be consumed from .NET without a multi-week reverse-engineering effort per integration — and .NET is widely used across the back-office, trading, and integration workloads of the institutions Canton targets. Marcin Ziolek (Senior Product Architect, Digital Asset SDK team) confirmed on 2026-04-27 that DA's roadmap remains TypeScript / Java / Python; the .NET quadrant will not be closed by an internal effort.

**This proposal seeks funding from the CIP-0082 Development Fund to open-source, harden, and bring to production-readiness an existing C# / .NET SDK** that makes Canton consumable from .NET via NuGet — including pre-built bindings for every Splice DAR distributed as `Canton.Splice.*` NuGet packages. Five of the underlying building blocks (codegen, gRPC client, PQS client, authentication, runtime library) have already been built as proofs of concept and are actively used in development by Peaceful Studio against Canton LocalNet and DevNet. This proposal funds open-source release, hardening, full API surface coverage, the Splice NuGet distribution layer, documentation, and community adoption — not greenfield development.

The SDK will include:

1. **Daml Codegen for C#** – Generates strongly-typed C# classes from Daml packages (.dar files), enabling type-safe contract creation, exercise, and querying.
2. **gRPC Ledger API Client** – A native C# client for the Canton Participant Node's Ledger API over gRPC.
3. **PQS Client** – A PostgreSQL Query Store client for active contract queries with typed payload filtering.
4. **JSON API v2 Client** – HTTP-based client following the OpenAPI specification for the JSON Ledger API v2.
5. **Pre-built Splice bindings as NuGet packages** – `Canton.Splice.Amulet`, `Canton.Splice.Wallet`, `Canton.Splice.TokenStandard`, `Canton.Splice.ValidatorLifecycle`, `Canton.Splice.DsoGovernance` and shared utility packages, automatically refreshed on every Canton / Splice release.
6. **AI-Assisted Developer Onboarding** – Machine-readable SDK documentation optimized for agentic discovery, enabling AI coding assistants to guide developers through Canton integration.

These six components form a single cohesive product: codegen is unusable without a client; clients are useless without codegen; the Splice NuGet packages are the deliverable that demonstrates both work end-to-end against the protocol DARs every Canton application depends on. Splitting them — per the framework in PR #258 — would force developers to wait for partial deliverables that do not enable a single Canton integration. The single objective is **"make Canton consumable from C# / .NET in production"**.

This work directly addresses the fund's mandate for **"dev tools, reference implementations"** and extends Canton into the .NET dependency-management surface — the default approach of "extend what exists" applied to one of Canton's most underserved platforms.

**Current status:** The codegen, gRPC client, PQS client, and authentication are functional and used daily in development against Canton LocalNet. The primary risk of "can this be built?" has already been retired — what remains is hardening, full API surface coverage, NuGet distribution infrastructure, documentation, and community launch.

---

## Specification

### 1. Objective

**Full delivery of this proposal will result in:**

A production-grade, open-source C# SDK published to NuGet that enables .NET developers to:
- Generate type-safe C# code from any Daml package
- Connect to Canton participant nodes via gRPC or HTTP
- Submit commands, query contracts, and stream transactions
- Build Canton-native applications entirely in C#

| Component | Description |
|-----------|-------------|
| **Daml Codegen CLI** | Command-line tool that reads `.dar` files and generates C# classes for templates, choices, and data types |
| **Codegen Runtime Library** | Supporting types for serialization, contract IDs, party handling, timestamps, etc. |
| **gRPC Ledger API Client** | Full implementation of the Canton Ledger API v2 in C# using Grpc.Net.Client |
| **PQS Client** | PostgreSQL Query Store client for active contract queries with typed payload filtering |
| **JSON API v2 Client** | HTTP client generated from OpenAPI spec + manual ergonomic wrappers |
| **Streaming Support** | Async streams (IAsyncEnumerable) for transaction/completion subscriptions |
| **Authentication** | OAuth2/JWT token handling for participant node authentication |
| **Sample Applications** | Console app + ASP.NET Core web API example |
| **Documentation** | README, API docs (XML docs + DocFX site), AI-optimized SDK reference for agentic discovery |

**Out of Scope:**
- Front-end / browser dApp UI — front-end remains the TypeScript / JavaScript ecosystem's domain (see §3 "Integration with the existing developer surface")
- Wallet/dApp API integration (covered by CIP-0103; could be Phase 2)
- Canton admin/topology APIs (considered for future work)
- GUI tooling for the SDK itself (e.g. contract inspectors)

### 2. Implementation Mechanics

**Codegen Architecture:**
```
.dar file → Daml-LF parser (protobuf) → AST transformation → C# Roslyn code emitter → .cs files
```

The codegen leverages:
- Daml-LF protobuf definitions (publicly available)
- Roslyn source generators for compile-time integration (optional advanced feature)
- Standard .NET conventions (nullable reference types, `IAsyncEnumerable`, `System.Text.Json`)

**Client Architecture:**
```
Application Code
       ↓
C# SDK (strongly-typed)
       ↓
  ┌────┴────┬────────┐
  │         │        │
gRPC     HTTP/JSON   PQS
  │         │        │
  └────┬────┘        │
       ↓             ↓
Canton Participant  PostgreSQL
      Node         Query Store
```

#### Proof-of-Concept Status

The proposer has built proof-of-concept implementations to validate the core technical approach:

| Component | PoC Status | What the PoC Validates |
|-----------|-----------|----------------------|
| **Daml Codegen CLI** | Prototype working | Daml-LF protobuf parsing, AST transformation to C#, type mapping for core Daml types |
| **Codegen Runtime Library** | Prototype working | ContractId, Party, Timestamp, Optional, List, Map, Variant, Record, Enum — type representation and serialization |
| **gRPC Ledger API Client** | Prototype working | Connection management, command submission, transaction parsing |
| **Authentication (OAuth2/JWT)** | Prototype working | Bearer token injection, Keycloak integration |
| **PQS Client** | Early prototype | Active contract queries with JSON payload filtering via PostgreSQL |

These prototypes confirm that the approach is sound — the Daml-LF wire format can be mapped to idiomatic C# types, the Ledger API can be consumed from .NET, and codegen produces usable output.

**What the prototypes do NOT cover** (and what the grant funds):

- **JSON API v2 client** — not yet built. Full HTTP transport layer covering the OpenAPI specification.
- **Async streaming** — not yet built. Real-time transaction/completion subscriptions with backpressure, cancellation, and fault tolerance.
- **Comprehensive test coverage and CI/CD** — the prototypes have ad-hoc tests sufficient for internal use. A production SDK needs ≥80% unit test coverage, integration tests running in CI against Canton LocalNet, and automated NuGet publishing.
- **Cross-platform and cross-architecture validation** — the prototypes were developed on macOS ARM64 (Apple Silicon). A production SDK must work reliably on **Windows** (where most enterprise .NET teams work), on **AMD64/x86-64** (where most CI pipelines and production servers run), and across all supported .NET runtimes. This requires expanding the CI matrix to cover Windows + Linux + macOS across both ARM64 and x64, and validating the full test suite on each combination.
- **Robustness and error handling** — prototypes handle the happy path. A production SDK must handle connection failures, authentication token refresh, partial responses, malformed payloads, version mismatches, and concurrent usage patterns gracefully.
- **Full API surface coverage** — the prototypes cover the endpoints needed for one application. A production SDK must cover the full Ledger API v2 surface (~40 endpoints across gRPC and HTTP), including endpoints not yet exercised.
- **Documentation and onboarding** — internal code needs no documentation. An open-source SDK needs a full API reference, quickstart guides, sample applications, and AI-optimized documentation for agentic discovery.
- **Sample applications and community launch** — none of this exists.

The proof-of-concept work de-risks the proposal by confirming the approach is viable. The funding covers the engineering required to reach production quality, cross-platform reliability, and ecosystem adoption.

#### Quality Assurance

- Unit tests: ≥80% code coverage on codegen logic and client serialization
- Integration tests: Against Canton LocalNet (CI), across Windows + Linux + macOS, ARM64 + x64
- Static analysis: Roslyn analyzers, nullable reference type enforcement
- Benchmarks: Performance regression tests for streaming throughput

#### Open Source Practices

- All development in public from day one
- Issues and roadmap tracked via GitHub Projects
- Contribution guidelines and code of conduct
- Semantic versioning with clear deprecation policy

### 3. Architectural Alignment — Extending Splice into the .NET Ecosystem

**The default approach is to extend what exists** (per the template guidance in PR #258). This proposal does so at two layers:

**Layer 1 — Tooling.** The SDK consumes the existing Canton public API surface unchanged: published Daml-LF protobuf definitions, the Canton Ledger API v2 (gRPC + JSON), and the OpenAPI specification for JSON Ledger API v2. No changes to Canton, Daml, or Splice core repositories are requested. The SDK is a downstream consumer that fills a known empty quadrant rather than duplicating internal DA work — see "Coordination with the DA SDK team" below.

**Layer 2 — Distribution.** Every Splice DAR — `splice-amulet`, `splice-wallet`, `splice-token-standard`, `splice-validator-lifecycle`, `splice-dso-governance`, and shared utility DARs — is published as a versioned `Canton.Splice.*` NuGet package containing the pre-generated C# bindings plus embedded DAR contents for upload / test scenarios. A C# developer integrating with Canton Coin or the Token Standard runs:

```bash
dotnet add package Canton.Splice.Wallet --version 3.4.x
dotnet add package Canton.Splice.TokenStandard --version 3.4.x
```

…and immediately has type-safe C# bindings to call Splice protocol functions. No `git clone splice && make build && daml codegen && cross-compile && vendor`.

**This pattern does not yet exist for any Canton language ecosystem.** Java users today must run `daml codegen java` against locally-built Splice DARs themselves; TypeScript users hand-roll bindings or depend on `@daml/types`. The .NET side pioneers the *Splice-as-a-package-feed* distribution model, with the pattern transferable to other languages once validated.

**Why this matters.** Institutional adopters typically operate dependency-management and supply-chain-review workflows in which a "clone-this-repo-and-build-it-yourself" integration pattern is a material adoption hurdle — every dependency must be vendored, signed, scanned, and versioned through internal package feeds. **The grant funds the infrastructure that turns Splice from a "you build it yourself" repo into a `dotnet add package` dependency** — a change in distribution shape that compounds across every future C# Canton integration.

**Operational implication, captured under M1 / M2 acceptance criteria:** every Canton minor / Splice release triggers automated codegen + NuGet publish, with versioning aligned to Canton release tags. Ongoing publication is part of the M5+ quarterly maintenance milestone.

#### Integration with the existing developer surface

This proposal builds on top of the existing Daml/Splice SDK surface; it does not replace or uplift any existing component. Concretely:

- **Relationship to existing codegen.** A net-new C# emitter sits alongside the existing Java, TypeScript and JavaScript codegens — no replacement. The CLI ships standalone in v1; integration into `dpm` (as a `dpm codegen csharp` plugin) is open to coordination with the dpm maintainers but not a v1 dependency.
- **LocalNet positioning.** Unchanged. The C# SDK consumes any Canton instance — LocalNet, DevNet, TestNet, MainNet — using the existing Ledger API surface. The M1 quickstart references the current LocalNet onboarding rather than introducing a parallel one.
- **Getting-started flow on `docs.canton.network`.** Additive: we ask the Foundation to add "C# / .NET" alongside Java and TypeScript under "Language SDKs", linking to the SDK quickstart. A developer arriving at the official getting-started page sees the same entry points plus a new language option — no replacement, no fork.
- **Quickstart integration.** A net-new C# quickstart ships in M1, scoped to the same end-to-end loop as `cn-quickstart` but in C#. `cn-quickstart` itself stays unchanged. If `dpm` gains a C# template family, the quickstart can be packaged as a `dpm` template at that point.
- **Front-end / browser dApp UI.** Out of scope — for the same reason it sits outside the Java SDK's scope. Front-end browser dApps and wallet UIs are a TypeScript / JavaScript ecosystem concern; server-side SDKs (Java today, this C# SDK going forward) deliberately do not deliver a front-end framework. A .NET service built on this SDK exposes state to a separate TS / JS front-end via REST or gRPC-Web.

**Foundation namespace coordination.** The `Canton.*` NuGet namespace requires Canton Foundation buy-in; M1 includes a deliverable to confirm and provision that namespace. Until namespace ownership is finalised, a `PeacefulStudio.Canton.*` working namespace is used.

#### Multi-synchronizer readiness (design intent — not yet implemented)

Canton's multi-synchronizer surface is becoming consumer-visible through 2026: reassignment events will appear in update streams as staged upgrades roll out, and Canton 3.5 changes the `synchronizer_id` wire format. **Multi-synchronizer is treated as a v1 design constraint, not a v2 retrofit** — the commitments below are funded by this proposal and not yet implemented in the proof-of-concept code.

The four design commitments are:

- **Reassignment as a first-class case in typed streams.** `ContractEvent<T>` is intended to gain a `Reassigned` variant alongside `Created` and `Archived`, so consumers handle "this contract just left the visible synchronizer" as a typed branch rather than as a silently dropped contract. To be designed and implemented under M2.
- **Synchronizer scoping on the ledger surface.** Stream and query results will carry the originating synchronizer (alongside `ContractId<T>` or via an event-level field), so callers can filter or route by synchronizer rather than assume a single global view. The exact representation is a v1 design decision deliberately not pre-empted here.
- **Tracking the Canton 3.5 `synchronizer_id` format change.** The 3.5 wire-format change is acknowledged as an upcoming breaking change rather than discovered at integration time. Compatibility against both the 3.4 and 3.5 formats is added to the cross-version compatibility matrix whenever Canton 3.5 lands — under whichever milestone is current at that point.
- **Ergonomic refinement — multi-sync errors fit the A.6 typed-outcome story.** Failure modes specific to multi-synchronizer (for example, "the requested party has no standing on the target synchronizer") flow through the same `ExerciseOutcome.DamlError` categorisation shown in A.6, not as opaque gRPC error strings. This is the existing typed-error story applied to a new failure surface, not a separate commitment.

Validation of the points above lands under M2 — reassignment handling and the multi-sync error categorisation extension join the integration-test target, with the 3.5 `synchronizer_id` format compatibility introduced whenever Canton 3.5 ships. The points are design intent, not shipped capability.

**Coordination with the DA SDK team.** Marcin Ziolek (Senior Product Architect, Digital Asset SDK team) confirmed in a direct exchange on 2026-04-27 that DA's internal SDK roadmap remains TypeScript / Java / Python; the .NET quadrant is explicitly outside DA's plan. This proposal therefore does not duplicate or pre-empt internal DA work — it fills a quadrant DA has chosen not to staff.

Relevant CIPs:
- **CIP-0082:** Development Fund establishment
- **CIP-0100:** Development Fund governance
- **CIP-0103:** dApp API standard (potential future integration point)

#### Relationship to Other Proposals

This proposal is **complementary** to other SDK and tooling proposals, not competing:

| Proposal | Relationship |
|----------|-------------|
| **Go SDKs + Python DAZL (Noders, #38)** | Different language ecosystem. Go SDK serves blockchain infrastructure teams; C# SDK serves enterprise application teams. Together they expand Canton's multi-language coverage. |
| **DAR-to-TypeScript Codegen (#74)** | Single-purpose codegen tool. Our codegen is part of a full SDK (codegen + client + runtime). Different language targets. |
| **dApp SDK (Digital Asset, #69)** | Different layer entirely. The dApp SDK handles CIP-0103 wallet-to-dApp connectivity (TypeScript). Our SDK handles application-to-participant-node connectivity (C#). A C# application would use our SDK to talk to Canton, and could later use a C# CIP-0103 client to connect to wallets. |
| **BlockID / BlockTravel (#189 / #190, Block Infrastructure)** | Both proposals include a paragraph committing to a standalone .NET library suite (C# bindings + DAR-reading CLI codegen + gRPC client wrapper) as a side-deliverable to their compliance / travel-rule products. Funding is listed as TBD; no .NET-specific milestone schedule or public code. We read this as additional ecosystem signal — independent teams arriving at the same .NET gap conclusion. Coordination would be welcome: Block Infrastructure consuming `Canton.Splice.*` packages rather than re-implementing codegen + client would be a more efficient outcome for both. |

Canton's developer ecosystem benefits from **multi-language SDK coverage** — the same way Ethereum has ethers.js, web3.py, Nethereum (C#), and go-ethereum. Each language SDK unlocks a different developer population.

### 4. Backward Compatibility

*No backward compatibility impact.* The SDK is a new, standalone library that consumes existing public APIs without modifying them.

---

## Milestones and Deliverables

All milestones are designed to be ≤ 1 quarter in duration with clear acceptance criteria combining both delivery and ecosystem adoption indicators.

### Milestone 1: Open-Source Release & First Splice Packages
- **Estimated Delivery:** 6 weeks from funding approval
- **Focus:** Open-source existing code, CI/CD, NuGet publishing, codegen MVP, **first two Splice NuGet packages (`Canton.Splice.Amulet`, `Canton.Splice.Wallet`)**, quickstart. The core code already exists — this milestone is primarily packaging, distribution-pipeline, and publishing work.
- **Deliverables / Value Metrics:**

| Deliverable | Acceptance Criteria |
|-------------|---------------------|
| Repository published under Canton Foundation GitHub org (or approved location) | Public repo with Apache 2.0 license |
| CI/CD pipeline (GitHub Actions) | Automated build, test, and NuGet publish on release tags. **Automated codegen + publish triggered by Canton / Splice release tag.** |
| Daml Codegen CLI | Successfully generates C# from Splice/Amulet `.dar` and a custom test `.dar` |
| Codegen runtime library | NuGet package published; supports core Daml types (ContractId, Party, Timestamp, Optional, List, Map, Variant, Record) |
| gRPC client foundation | Can connect to participant node, submit commands, and parse transaction results |
| Authentication | OAuth2/JWT token injection working (already implemented, packaged for open-source release) |
| **First Splice NuGet packages** | **`Canton.Splice.Amulet` and `Canton.Splice.Wallet` published to public NuGet, version-aligned with current Canton mainnet release. A developer can run `dotnet add package Canton.Splice.Wallet` and call wallet operations against LocalNet without cloning the Splice repo.** |
| Quickstart documentation | README with quickstart that a developer can follow end-to-end; architecture overview |
| **Ecosystem gate** | At least 2 developers outside Peaceful Studio complete the quickstart, with at least one issue or PR opened on the SDK repo |

**Verification:** Tech & Ops committee or delegate confirms code compiles, tests pass, packages installable from NuGet (including the two Splice packages), and quickstart feedback collected.

### Milestone 2: Full Ledger API Coverage, PQS Client, JSON API & Remaining Splice Packages
- **Estimated Delivery:** 9 weeks after M1 acceptance
- **Focus:** Complete gRPC and HTTP API surface (~40 endpoints across two transports), PQS client, async streaming, integration testing against LocalNet, **remaining Splice NuGet packages**
- **Deliverables / Value Metrics:**

| Deliverable | Acceptance Criteria |
|-------------|---------------------|
| Complete gRPC Ledger API v2 client | All endpoints implemented: Command submission, Active Contract Set queries, Transaction streams, Completions, Package service, Party management |
| PQS Client | NuGet package published; active contract queries with typed payload filtering via PostgreSQL |
| JSON API v2 client | HTTP client covering equivalent functionality for teams preferring REST |
| Async streaming | `IAsyncEnumerable<T>` support for transaction and completion streams |
| **Remaining Splice NuGet packages** | **`Canton.Splice.TokenStandard`, `Canton.Splice.ValidatorLifecycle`, `Canton.Splice.DsoGovernance`, plus shared utility packages, published to public NuGet and version-aligned with current Canton mainnet release — using the same automated codegen + publish trigger as M1.** |
| Integration tests | Test suite running against Canton LocalNet |
| **Ecosystem gate** | End-to-end demo published and announced; at least 1 community member successfully integrates the SDK into their own project — preferably consuming a `Canton.Splice.*` package as the demonstration of the distribution model. |

**Verification:** Demonstrate end-to-end flow: codegen → submit command → observe transaction → query ACS, on both gRPC and HTTP paths. Community integration attempt documented.

### Milestone 3: Documentation, Samples & Community Launch
- **Estimated Delivery:** 6 weeks after M2 acceptance
- **Focus:** Developer documentation, AI-optimized SDK reference, sample applications, coordinated public launch
- **Deliverables / Value Metrics:**

| Deliverable | Acceptance Criteria |
|-------------|---------------------|
| Comprehensive API documentation | XML docs on all public types; DocFX-generated static site |
| AI-optimized SDK reference | Machine-readable documentation enabling AI coding assistants (Copilot, Claude, Cursor) to guide developers through Canton integration — structured examples, annotated patterns, and agentic discovery metadata |
| Sample: Console application | CLI tool demonstrating codegen + command submission + ACS query |
| Sample: ASP.NET Core integration | Web API that exposes Canton contract data via REST endpoints |
| Announcement & launch | Blog post / dev announcement coordinated with Canton Foundation marketing |
| **Ecosystem gate** | At least 1 developer successfully uses the AI-optimized reference to build a Canton integration without prior SDK experience |

**Verification:** Samples run successfully against LocalNet; documentation site deployed and linked from Canton developer docs. Validation feedback provided.

### Milestone 4: Adoption & Ecosystem Integration
- **Estimated Delivery:** 12 weeks after M3 acceptance (overlaps with maintenance)
- **Focus:** Active community engagement, compatibility testing, feedback incorporation
- **Deliverables / Value Metrics:**

| Deliverable | Acceptance Criteria |
|-------------|---------------------|
| NuGet adoption | ≥500 downloads across at least 3 unique organisations within 12 weeks of stable release |
| Real ecosystem usage | At least 2 applications outside Peaceful Studio use the SDK to submit transactions on Canton Network |
| GitHub engagement | ≥5 external issues or PRs (indicates real usage and feedback loops) |
| Feedback incorporation | At least 3 community-reported issues resolved |
| Compatibility verification | Tested against the latest Canton release — 3.4.x today, 3.5 whenever it lands |
| Conference/meetup presentation (optional) | Present SDK at a Canton or .NET community event if opportunity arises |

**Verification:** NuGet download stats, GitHub insights, resolved issue links, and evidence of external applications using the SDK provided to committee.

### Milestone 5+ (Ongoing): Quarterly Maintenance
- **Estimated Delivery:** Ongoing, quarterly renewal
- **Focus:** Protocol compatibility, security patches, community support
- **Deliverables / Value Metrics:**

| Deliverable | Acceptance Criteria |
|-------------|---------------------|
| Protocol compatibility | SDK updated within 4 weeks of each Canton minor release |
| Security patches | Critical vulnerabilities patched within 72 hours of disclosure |
| Dependency updates | .NET LTS version support maintained |
| Community support | Issues triaged within 1 week; PRs reviewed within 2 weeks |
| Quarterly changelog | Published release notes summarizing changes |
| **Ongoing adoption** | Quarterly report showing download trends, active issues, and community contributions |

**Verification:** Release tags demonstrating compatibility with latest Canton version; issue response times auditable via GitHub; quarterly adoption report submitted.

---

## Acceptance Criteria

**Per the template framework introduced in PR #258, acceptance is based on demonstrated ecosystem value, not artifact delivery alone.** Each milestone above is bound to a measurable adoption gate (external developer feedback, NuGet downloads, named external integrations, GitHub engagement) — not a CI-passing or feature-complete checkbox.

The Tech & Ops Committee will evaluate completion based on:

- **Ecosystem-value gates met for each milestone** (see per-milestone deliverables — each ties funding to measurable adoption)
- Deliverables completed as specified for each milestone
- Demonstrated functionality and operational readiness
- Documentation and knowledge transfer provided

**Project-specific ecosystem-value conditions:**
- All code published as open source under Apache 2.0 license
- NuGet packages published and installable from the public NuGet feed — including pre-built `Canton.Splice.*` bindings for the published Splice DARs
- Integration tests passing against Canton LocalNet
- API documentation site deployed and accessible
- At least 2 external Canton applications (outside Peaceful Studio) using the SDK to submit transactions on Canton Network within 12 weeks of stable release (M4 ecosystem gate)

---

## Funding

**Total Funding Request:** 2,500,000 CC (~$375,000 USD) for initial delivery (M1–M4), plus 300,000 CC per quarter (~$45,000 USD) for ongoing maintenance. The initial ask is sized at **0.5% of the Development Fund's annual allocation** (500M CC per CIP-0082).

### Cost Basis

The funding is structured as fixed-price milestones, scoped by deliverable complexity rather than time-and-materials. Each milestone includes engineering, infrastructure, testing, documentation, open-source compliance, and community engagement costs:

| Milestone | Engineering | Infrastructure & Tooling | Community & Adoption | Total |
|-----------|-------------|--------------------------|---------------------|-------|
| M1 | SDK packaging, test hardening, NuGet publishing, auth packaging, **first two `Canton.Splice.*` packages with automated codegen pipeline** ($35K) | CI/CD pipeline, cloud CI runners, **NuGet org and namespace coordination, signing infrastructure, automated Splice-release-triggered publish** ($22K) | Quickstart docs, external developer onboarding for ecosystem gate, Foundation coordination ($14K) | **~$71K** |
| M2 | ~40 API endpoints across gRPC + HTTP, PQS client packaging, async streaming, **remaining `Canton.Splice.*` packages**, multi-synchronizer design commitments (§3) within the existing envelope ($83K) | Integration test environment (LocalNet, including a multi-synchronizer topology), API compatibility matrix, performance benchmarks ($25K) | End-to-end demo, community outreach, developer integration support ($20K) | **~$128K** |
| M3 | DocFX API reference site, AI-optimized SDK reference, 2 sample apps (console, ASP.NET Core) ($54K) | Documentation hosting, sample app infrastructure ($10K) | Launch coordination with Foundation marketing, agentic discovery validation ($22K) | **~$86K** |
| M4 | Compatibility testing (Canton 3.4.x → 3.5), bug fixes from community feedback ($42K) | Testing infrastructure across Canton versions ($10K) | Community support, adoption tracking and reporting ($38K) | **~$90K** |
| M5+ | Protocol compatibility updates, security patches, dependency maintenance, **automated Splice NuGet republish on every Canton/Splice release** ($26K) | CI/CD maintenance, test infrastructure ($9K) | Issue triage, PR reviews, quarterly adoption report ($10K) | **~$45K/quarter** |

**Notes:**
- The proof-of-concept prototypes de-risk the proposal by confirming the technical approach is sound. The funding covers the substantial engineering required to reach production quality: full API coverage, cross-platform reliability (Windows + x64), comprehensive test coverage, robust error handling, documentation, sample applications, and community adoption.
- Engineering costs reflect the niche intersection of C#/.NET expertise, distributed ledger protocol engineering, and Canton/Daml-specific domain knowledge. The proposer has 15+ years of C#/.NET experience in capital markets and fintech, a proven track record of team and project leadership with 6 years as a CTO of a digital exchange, and direct Canton development experience since mid-2025.
- Infrastructure costs include cloud CI runners across multiple platforms and architectures, participant node access, documentation hosting, and testing environments.
- Community & adoption costs increase in later milestones as the focus shifts from building to ecosystem engagement.
- The AI-optimized SDK reference (M3) represents a novel approach to developer onboarding that justifies the investment: by enabling agentic discovery, the SDK becomes self-documenting for the AI-assisted development workflows that are rapidly becoming the norm. This lowers the adoption barrier significantly — a developer using Copilot or Claude can query the SDK's capabilities conversationally rather than reading documentation linearly.

### Cost Comparison with Similar Proposals

| Proposal | Scope | Funding |
|----------|-------|---------|
| Go SDKs + Python DAZL (#38, Noders) | Go gRPC client + codegen + wallet SDK + Python patches. | 2,100,000 CC |
| **This C# SDK (#46)** | **C# codegen + gRPC + JSON API + PQS + AI docs + samples + cross-platform CI + adoption.** | **2,500,000 CC** |
| DAR-to-TypeScript Codegen (#74) | Single-purpose codegen tool (TypeScript only) | 330,000 CC |
| Canton dApp SDK (#69, Digital Asset) | TypeScript dApp-to-wallet SDK (CIP-0103), different stack layer | 8,170,000 CC |

This proposal delivers broader scope than the Go SDK (additional JSON API client, PQS client, AI-optimized documentation, cross-platform CI matrix) for a comparable total cost, with funding tied to per-milestone ecosystem-adoption gates.

### Payment Breakdown by Milestone

- **Milestone 1** (Open-Source Release & Core): **475,000 CC** upon committee acceptance
  *Rationale: Establishes the open-source project, CI/CD across platforms, NuGet publishing, hardens the codegen and gRPC client for external use. Foundational infrastructure that de-risks all subsequent milestones.*

- **Milestone 2** (Full API Coverage + PQS): **850,000 CC** upon committee acceptance
  *Rationale: Heaviest engineering milestone — full Ledger API surface across both gRPC and JSON protocols, PQS client, plus async streaming. The dual-protocol approach effectively doubles the client surface area compared to a single-transport SDK.*

- **Milestone 3** (Docs, Samples, Launch): **575,000 CC** upon committee acceptance
  *Rationale: Documentation and samples turn a library into an adoptable SDK. Delivers a full API reference site, AI-optimized agentic discovery documentation, sample applications, and coordinated community launch.*

- **Milestone 4** (Adoption & Ecosystem Integration): **600,000 CC** upon committee acceptance
  *Rationale: Adoption requires active investment — community engagement, compatibility testing, and responsive issue resolution over 12 weeks.*

- **Milestone 5+** (Quarterly Maintenance): **300,000 CC per quarter** upon committee acceptance
  *Rationale: SDKs without active maintenance become liabilities. Covers protocol compatibility, security patches, dependency updates, and community support.*

> *Context: The total M1–M4 ask of 2,500,000 CC represents 0.5% of the Development Fund's annual allocation of 500M CC (per CIP-0082). USD equivalents are based on a CC/USD rate of $0.15 as of April 2026.*

### Volatility Stipulation

The initial delivery (M1–M4) spans ~33 weeks (~8 months) — i.e. the project duration is **greater than 6 months**. The grant is denominated in fixed Canton Coin and will require a re-evaluation at the 6-month mark, per the standard template clause. The quarterly maintenance milestone (M5+) is re-evaluated each quarter by default at the then-current CC/USD rate. The 6-month re-evaluation also covers scope reality: if the multi-synchronizer surface or the Canton 3.5 transition demands materially more engineering than envelope-priced, that is raised at the same review point.

---

## Co-Marketing

Upon release, the implementing entity will collaborate with the Foundation on:

- **Announcement inclusion** in the quarterly Development Fund achievements report
- **Link placement** in official Canton developer documentation under "Language SDKs"
- **Social media amplification** of the launch announcement
- **Featured project status** on the Canton Foundation grants/ecosystem page
- **Joint webinar** (optional) introducing the SDK to the .NET developer community

---

## Motivation

### The Gap

Canton Network currently provides official SDKs for TypeScript/JavaScript (dApp SDK, wallet integrations), Java/Scala (via the Daml SDK and codegen), and Python (limited, community-driven). There is **no official or community C# / .NET SDK**, despite .NET being:

- The dominant framework for enterprise software development (banking, insurance, healthcare)
- [In the top six languages on GitHub](https://octoverse.github.com/) — together with Python, JavaScript, TypeScript, Java, and C++, the top six cover nearly 80% of new repositories (Octoverse 2025)
- [Used by ~21% of professional developers via ASP.NET Core](https://survey.stackoverflow.co/2025/technology) (Stack Overflow 2025)

Digital Asset previously maintained C# bindings ([`daml-net`](https://github.com/digital-asset/daml-net)) with contributions from Canton ecosystem participants including Calastone, but **archived the project in January 2025** without ever publishing NuGet packages — leaving the .NET ecosystem entirely unserved. That project targeted the pre-Canton Daml SDK 1.x API surface, which has since been superseded by the Canton 3.x Ledger API. This proposal offers a **more complete solution** — full codegen, dual-protocol client, PQS support, authentication, and AI-assisted onboarding — built from scratch against the modern Canton API.

### Quantitative Ecosystem Benefit

Per the template guidance in PR #258, a benefit estimate calls for *"the portion of the ecosystem that benefits"*. We provide a layered estimate, separating what is sourced from what is reasoned:

**Sourced data points:**

- The [2026 Canton Developer Survey](https://forum.canton.network/t/canton-network-developer-experience-and-tooling-survey-analysis-2026/8412) (41 respondents) identifies **"typed SDKs & language bindings"** as a high-priority gap. **83% of respondents come from TradFi or Hybrid backgrounds.**
- DA's archived `daml-net` project received contributions from **Calastone engineers** — direct evidence that an institutional Canton Foundation founding member actively sought .NET tooling and contributed engineering time when the option was available.
- Marcin Ziolek (Senior Product Architect, Digital Asset SDK team) confirmed on 2026-04-27 that DA's roadmap remains TypeScript / Java / Python; .NET is not on DA's plan. This means *no other source* will produce an official C# SDK for the Canton 3.x API surface.

**Reasoned estimate:**

- Canton's named institutional adopters include **HSBC** (Orion tokenized bonds), **Goldman Sachs** (GS DAP), **BNP Paribas** (Neobonds), **Calastone** (fund tokenization, founding member), and **Broadridge** (founding member). .NET is broadly used across capital-markets back-office, trading, and integration workloads at firms of this profile, so it is plausible that some share of their Canton-adjacent engineering teams are .NET-primary — but we do not have per-firm stack disclosures and are not in a position to quantify that share.
- For any team whose primary stack is .NET, the absence of a NuGet-distributed Canton SDK forces a choice between standing up a Java/TypeScript bridge or hand-rolling JSON-API clients. We have encountered this friction first-hand (see "Direct experience" below) and it is consistent with the survey's "typed SDKs & language bindings" gap; we cannot, however, generalise from our own experience to a population-level estimate.
- The Foundation has not published a per-respondent language breakdown of the 41-respondent developer survey. We commit to publishing an updated benefit estimate at M1 once the SDK has shipped and adoption signals (NuGet downloads, named integrations) are observable.

**What this proposal expects to enable:** every C# / .NET integration with the Splice ecosystem (Canton Coin transfers, Token Standard interactions, validator-lifecycle operations, DSO governance) goes from *days of vendoring DARs and hand-rolling clients* to *a single `dotnet add package Canton.Splice.Wallet`*. The benefit compounds across every future C# Canton integration — measured not as "X% of dApps" but as a meaningful reduction in the integration cost faced today by any team whose primary stack is .NET.

**Direct experience.** The proposer has first-hand experience of the friction this SDK eliminates: as CTO at Trakx (a Canton validator operator with a C#/.NET back-office stack), the team had to reverse-engineer the JSON Ledger API by capturing Java SDK traffic, manually translate payloads to C# types, and hand-model every Daml record / variant / contract-ID type. Two additional Canton validator deployments managed by Peaceful Studio use C#/.NET stacks and face the same friction. References available to the committee on request.

### Target Use Cases

This SDK targets three concrete use case categories:

**Back-office integration and compliance reporting:** .NET is the dominant platform for financial back-office systems. Institutions operating Canton validators need to query ledger state, reconcile positions, and generate compliance reports from their existing .NET infrastructure. Today this requires raw gRPC/HTTP integration from scratch. The SDK — particularly the PQS client and codegen — turns this into a standard NuGet dependency.

**Trading systems and settlement workflows:** Capital markets firms building settlement or DvP (delivery-vs-payment) workflows on Canton typically have existing .NET-based trading systems. The SDK enables these teams to submit commands, exercise choices, and stream transactions from their existing architecture without introducing Java or TypeScript dependencies.

**Canton application development in C#:** Teams that want to build full Canton applications in C# — rather than mixing languages — currently cannot. The SDK provides the complete stack: codegen for type-safe contract interaction, dual-protocol clients for flexibility, and streaming for real-time event processing.

### The Opportunity

By providing first-class .NET support, Canton Network can unlock adoption by traditional enterprise developers who standardize on Microsoft stacks, enable integration into existing .NET microservices architectures without polyglot friction, and lower the barrier for fintech teams already building with C# (e.g., trading systems, back-office tools).

### Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Daml-LF format changes | SDK uses versioned Daml-LF protobuf; codegen supports multiple LF versions |
| Canton API breaking changes | Close collaboration with OSS maintainers; early access to release candidates; cross-version compatibility matrix exercised in CI |
| **Multi-synchronizer surface evolution** | Treated as a v1 design constraint (§3): typed `Reassigned` events, synchronizer scoping on stream / query metadata, and 3.5 `synchronizer_id` format compatibility added to the cross-version test matrix whenever Canton 3.5 lands. Multi-synchronizer scenarios join the M2 integration-test target. |
| Low adoption | Adoption milestones with ecosystem gates ensure funding is tied to real usage, not just delivery |
| Maintainer availability | Maintenance milestone ensures ongoing commitment; documentation enables community takeover if needed |
| Cross-platform issues | CI matrix covers Windows + Linux + macOS across ARM64 and x64 from M1 |

---

## Rationale

### Why C# / .NET

.NET is one of the dominant platforms in Canton's institutional target market (banking, insurance, asset management), particularly for back-office and integration workloads. For teams whose primary stack is .NET, the absence of a native SDK means polyglot friction — either wrapping Java/TypeScript or building custom integrations from raw gRPC/HTTP. A first-class C# SDK removes that barrier for those teams.

### Why This Approach

The dual-protocol approach (gRPC + JSON API) ensures the SDK serves both high-performance backend services (gRPC) and lightweight integrations (HTTP/JSON). The PQS client adds a third query path for teams running the PostgreSQL Query Store. The codegen-first design mirrors the proven Java SDK pattern, giving .NET developers the same type-safe experience. Publishing to NuGet — the standard .NET package manager — ensures frictionless adoption via `dotnet add package`.

The **AI-optimized SDK reference** is a deliberate investment in lowering the adoption barrier. Modern developers increasingly rely on AI coding assistants (GitHub Copilot, Claude, Cursor) to learn new SDKs. By structuring documentation for agentic discovery — with machine-readable examples, annotated patterns, and contextual metadata — the SDK becomes accessible to developers who would otherwise never read traditional documentation. This approach is novel in the Canton ecosystem and directly addresses the survey finding that developer onboarding is a key friction point.

### Why This Proposer

This SDK was born from direct need — the proposer needed C#/.NET tooling to build Canton applications and no SDK existed. The proposer has 15+ years of C#/.NET experience in capital markets and fintech (SocGen, UBS, Credit Suisse, Bluecrest), 6 years as CTO of a digital exchange, and has been an active Canton Network participant deploying validators and building applications on Canton since mid-2025.

GitHub: [github.com/monsieurleberre](https://github.com/monsieurleberre)

### Long-Term Sustainability

**Current model:** Peaceful Studio maintains the SDK as the primary steward, with maintenance funded via quarterly grants (M5+, 300,000 CC/quarter) subject to committee review.

**If adoption grows:** The SDK is open-source (Apache 2.0) from day one, enabling community contributions from the start. If the SDK reaches sufficient adoption to warrant broader governance, we propose transitioning stewardship to the Canton Foundation — following the same model being applied to PQS and other DA-originated tools.

**If maintenance funding is not renewed:** The SDK remains fully functional as a standalone library consuming stable Canton APIs (Ledger API v2, JSON API v2). Published NuGet packages remain available indefinitely. The codegen targets versioned Daml-LF protobuf definitions, which are backward-compatible — existing generated code continues to work. The AI-optimized documentation and comprehensive test coverage reduce the bus factor ("what if the author gets hit by a bus?"), enabling any experienced .NET developer to maintain the SDK. In short: the SDK degrades gracefully without active maintenance — it doesn't break, it just doesn't track new Canton releases.

### Comparison with Existing SDKs

| Feature | Java SDK | TypeScript SDK | This C# SDK |
|---------|----------|----------------|-------------|
| Codegen | ✅ | ✅ | ✅ |
| gRPC client | ✅ | ❌ | ✅ |
| JSON API client | ✅ | ✅ | ✅ |
| Typed PQS client¹ | ❌ | ❌ | ✅ |
| Streaming | ✅ | ✅ (WebSocket) | ✅ (IAsyncEnumerable) |
| AI-optimized docs | ❌ | ❌ | ⏳ (M3) |
| Pre-built Splice packages | ❌ | ❌ | ✅ (`Canton.Splice.*` NuGet) |

¹ PQS (Participant Query Store) is a separate Digital Asset tool, not part of any official language SDK; the C# SDK is the only one shipping a typed client wrapper for it.

---

## Appendix: What Canton Development Looks Like in C#

The following examples illustrate the developer experience this proposal delivers. They are based on the proof-of-concept codegen output and client API design.

### A.1 — Type-safe contracts from Daml codegen

Given this Daml template:

```haskell
template Iou
  with
    issuer: Party
    owner: Party
    currency: Text
    amount: Decimal
  where
    signatory issuer
    observer owner
    choice Transfer: ContractId Iou
      with newOwner: Party
      controller owner
      do create this with owner = newOwner
```

The codegen produces a strongly-typed C# record. Daml `Party` fields become the dedicated `Party` value type — not bare strings:

```csharp
public sealed record Iou(
    Party Issuer,
    Party Owner,
    string Currency,
    decimal Amount) : ITemplate
{
    public sealed record IouContractId(string contractId) : ContractId<Iou>(contractId)
    {
        // Generated method — no magic strings in application code
        public ExerciseCommand ExerciseTransfer(Party newOwner) =>
            Transfer.Exercise(this, new TransferArgument(newOwner));
    }
}
```

The `Party` type is a zero-allocation `readonly record struct` with implicit conversion to `string` (for logging, headers, etc.) and explicit conversion from `string` (forces intentional construction at the boundary):

```csharp
public readonly record struct Party(string Id)
{
    public static implicit operator string(Party p) => p.Id;
    public static explicit operator Party(string id) => new(id);
}
```

### A.2 — Creating a contract (type-safe + outcome-typed)

```csharp
var alice = new Party("Alice");
var bob = new Party("Bob");
var iou = new Iou(Issuer: alice, Owner: bob, Currency: "USD", Amount: 1000.00m);

// `TryCreateAsync` returns `ExerciseOutcome<ContractId<Iou>>` — never throws on
// expected ledger failures (see A.6). `alice` implicitly converts to `SubmitterInfo`
// for the single-party case.
var outcome = await ledgerClient.TryCreateAsync(iou, alice);
```

Passing a contract ID where a party is expected — or vice versa — is a compile error. The codegen can also emit `Iou.CreateAsync(client)` overloads that derive signatories directly from payload fields (`iou.Issuer`), removing the explicit `actAs` argument for the common case.

### A.3 — Exercising a choice (typed extension method)

The codegen emits one `<Choice>Async` extension per Daml choice, on the contract ID itself:

```csharp
var contractId = new Iou.IouContractId("00abc123");
var charlie = new Party("Charlie");

// Returns `ExerciseOutcome<ContractId<Iou>>` — Daml's `Transfer` choice creates a single
// successor Iou, so the typed result is just the new contract ID.
var outcome = await contractId.TransferAsync(ledgerClient, newOwner: charlie, actAs: bob);
```

No magic strings, no raw JSON, no separate command-builder step — the call site is a single typed method invocation that returns a structured outcome (see A.6).

### A.4 — Multi-party workflow (from an application in development)

This example shows an offer acceptance workflow from a Canton application currently in development at Peaceful Studio. It demonstrates type-safe choice exercise, codegen-emitted typed result projection, and outcome-typed error handling:

```csharp
// Accept an offer — typed `<Choice>Async` extension. `AcceptResult` is a codegen-emitted
// record with one strongly-typed `ContractId<T>` per template the choice creates.
var outcome = await offerContractId.AcceptAsync(ledgerClient, counterpartyParty);

switch (outcome)
{
    case ExerciseOutcome<AcceptResult>.Created(var result):
        var agreementCid = result.Agreement;          // typed ContractId<Agreement>
        var auditCid    = result.AgreementRecord;     // typed ContractId<AgreementRecord>
        // continue with typed CIDs — no JSON walking, no template-id matching
        break;

    case ExerciseOutcome<AcceptResult>.DamlError { ErrorId: "OFFER_EXPIRED" }:
        return Conflict("Offer has expired");

    case ExerciseOutcome<AcceptResult>.InfraError { StatusCode: var status }:
        return StatusCode(503, $"Ledger unavailable: {status}");
}
```

### A.5 — Multi-party submissions and `readAs`

For multi-principal workflows (a delegate signing on behalf of two principals, a platform co-signing alongside a user), `SubmitterInfo` carries both `actAs` and `readAs` party sets:

```csharp
var submitter = new SubmitterInfo(
    actAs: new HashSet<Party> { platformParty, initiatorParty },
    readAs: new HashSet<Party> { observerParty });

var submission = CommandsSubmission
    .Single(CreateCommand.For(offer))
    .WithSubmitter(submitter)
    .WithWorkflowId("my-workflow");

var outcome = await ledgerClient.TrySubmitAndWaitForTransactionAsync(submission, ct);
```

Single-party calls remain ergonomic — `Party` and `string` both implicitly convert to `SubmitterInfo`. The compiler prevents accidentally passing a workflow ID or contract ID as a party.

### A.6 — Structured outcome handling

`ExerciseOutcome<T>` is a discriminated record — every command-submitting method returns it instead of throwing on expected failure modes. Callers `switch` on the outcome:

```csharp
ExerciseOutcome<ContractId<Iou>> outcome = await ledgerClient.TryCreateAsync(iou, alice);

return outcome switch
{
    // Happy path — typed CID lifted out
    ExerciseOutcome<ContractId<Iou>>.Created(var cid) => Ok(cid.Value),

    // Daml-level error: structured Canton error category + Daml-defined error id + metadata
    ExerciseOutcome<ContractId<Iou>>.DamlError { Category: ContentionOnSharedResources } =>
        StatusCode(409, "ledger contention — retry"),

    ExerciseOutcome<ContractId<Iou>>.DamlError e =>
        Problem(detail: e.Message, statusCode: 400, type: e.ErrorId),

    // Infrastructure error: gRPC status not interpreted by Daml
    ExerciseOutcome<ContractId<Iou>>.InfraError { StatusCode: Aborted } =>
        StatusCode(503, "ledger unavailable"),

    _ => Problem("unexpected outcome")
};
```

`DamlError.Category` is a closed enum mirroring Canton's documented error categories; `ErrorId` is the Daml-defined error id from `failWithStatus` (or a Canton built-in such as `CONTRACT_NOT_FOUND`); `Metadata` carries the gRPC `ErrorInfo` trailers verbatim. No more catching `RpcException` and pattern-matching on string messages.

### A.7 — Typed subscription streams

Active-contract and update streams expose typed `IAsyncEnumerable<ContractEvent<T>>` instead of raw gRPC events:

```csharp
// Stream every Iou involving Alice, starting from the offset she last persisted.
await foreach (var contractEvent in ledgerClient.SubscribeAsync<Iou>(
    submitter: alice,
    fromOffset: lastSeenOffset,
    ct))
{
    switch (contractEvent)
    {
        case ContractEvent<Iou>.Created(var cid, var iou, var offset):
            await OnIouCreated(cid, iou);
            await PersistOffset(offset);
            break;

        case ContractEvent<Iou>.Archived(var cid, var offset):
            await OnIouArchived(cid);
            await PersistOffset(offset);
            break;

        case ContractEvent<Iou>.StreamError(var status, var msg):
            // surfaced in-band — no try/catch needed for transient stream failures
            log.Warning("Stream error {Status}: {Message}", status, msg);
            return;
    }
}
```

Cancellation tears down the underlying gRPC stream cleanly. Offset checkpointing is the consumer's responsibility (the SDK does not persist offsets on the consumer's behalf).

### A.8 — Daml interfaces and Token Standard

Daml interfaces are first-class — the codegen emits an `IDamlInterface` marker per Daml interface, and contract IDs typed against the interface dispatch correctly at runtime over the participant-computed interface views:

```csharp
// `Holding` is a Splice Token Standard interface. The concrete implementing template
// (CantonCoin.Holding, Stablecoin.Holding, etc.) is irrelevant to the caller.
ContractId<Holding> holding = activeContracts.Single<Holding>();

// Exercise an interface choice — same call shape as a template choice.
var outcome = await holding.TransferAsync(
    ledgerClient,
    newOwner: bob,
    actAs: alice);
```

This is what enables `Canton.Splice.TokenStandard` to ship as a single NuGet package: every concrete holding contract on every validator can be exercised through the interface without naming the concrete type.

### A.9 — Querying active contracts via PQS (typed, no SQL)

The PQS client provides LINQ-style lambda filters over active contracts. No raw SQL, no JSON parsing — just strongly-typed property access:

**Find all IOUs where Alice is involved:**

```csharp
var alice = new Party("Alice");

var contracts = await pqsClient.QueryAsync<Iou>(
    Filter.Or(
        Filter.Field<Iou>(i => i.Issuer, alice),
        Filter.Field<Iou>(i => i.Owner, alice)),
    ct);

// Each result has .Id (ContractId) and .Data (the typed Iou record)
var ious = contracts.Select(c => c.Data).ToList();
```

**Fetch a single contract by ID:**

```csharp
var contract = await pqsClient.FetchByIdAsync(new ContractId<Iou>(contractId), ct);
var iou = contract?.Data;  // null if archived or not found
```

**Combine filters with AND:**

```csharp
var contract = await pqsClient.QueryOneAsync<Iou>(
    Filter.And(
        Filter.Field<Iou>(i => i.Issuer, alice),
        Filter.Field<Iou>(i => i.Owner, bob)),
    ct);
```

### A.10 — Service registration and health checks (one-liners)

```csharp
// Program.cs — register Canton clients from configuration
services.AddLedgerClient(config.GetSection("Canton:Ledger"));  // gRPC commands
services.AddPqsClient(config.GetSection("Canton:Pqs"));        // PQS queries

// Health checks provided by the Canton packages
builder.Services.AddHealthChecks()
    .AddPqsClient(tags: ["ready"])
    .AddLedgerClient(tags: ["ready"]);
```

### A.11 — Putting it all together: a complete controller

```csharp
[ApiController]
[Route("api/v1/ious")]
public class IouController(IouQueries queries, ILedgerClient ledger) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetMyIous(CancellationToken ct)
    {
        // Party constructed once at the API boundary from the auth header
        var party = new Party(Request.Headers["X-Party-Id"].First()!);
        var ious = await queries.GetIousByPartyAsync(party, ct);
        return Ok(ious);
    }

    [HttpPost("{contractId}/transfer")]
    public async Task<IActionResult> Transfer(
        string contractId, TransferRequest req, CancellationToken ct)
    {
        var party    = new Party(Request.Headers["X-Party-Id"].First()!);
        var cid      = new Iou.IouContractId(contractId);
        var newOwner = new Party(req.NewOwner);

        // Typed extension on the contract ID + structured outcome (see A.3, A.6).
        var outcome = await cid.TransferAsync(ledger, newOwner, actAs: party, ct);

        return outcome switch
        {
            ExerciseOutcome<ContractId<Iou>>.Created(var newCid) =>
                Ok(new { contractId = newCid.Value }),

            ExerciseOutcome<ContractId<Iou>>.DamlError e =>
                Problem(detail: e.Message, statusCode: 400, type: e.ErrorId),

            ExerciseOutcome<ContractId<Iou>>.InfraError e =>
                StatusCode(503, e.Message),

            _ => Problem("unexpected outcome")
        };
    }
}
```

These examples demonstrate: **no raw JSON, no string-based APIs, full type safety, idiomatic C# patterns** (records, async/await, value types, nullable reference types). The SDK aims to make Canton feel as natural to .NET developers as Entity Framework feels for SQL databases.

----

## References

- [CIP-0082: Development Fund establishment](https://github.com/canton-foundation/cips/blob/main/cip-0082/cip-0082.md)
- [CIP-0100: Development Fund governance](https://github.com/canton-foundation/cips/blob/main/cip-0100/cip-0100.md)
- [CIP-0103: dApp API standard](https://github.com/canton-foundation/cips/blob/main/cip-0103/cip-0103.md)
- [Canton Ledger API documentation](https://docs.digitalasset.com)
- [Canton Developer Survey 2026](https://forum.canton.network/t/canton-network-developer-experience-and-tooling-survey-analysis-2026/8412)
- [digital-asset/daml-net (archived)](https://github.com/digital-asset/daml-net)
- [Stack Overflow Developer Survey 2025](https://survey.stackoverflow.co/2025/technology)
- [GitHub Octoverse 2025](https://octoverse.github.com/)

---

*This proposal is submitted for consideration under the CIP-0100 Development Fund governance process.*
