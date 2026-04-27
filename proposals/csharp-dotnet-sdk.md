## Development Fund Proposal

**Author:** Matthieu Le Berre (Peaceful Studio)<br>
**Status:** Submitted<br>
**Created:** 2026-03-05<br>
**Last Revised:** 2026-03-31

---

## Abstract

This proposal seeks funding from the CIP-0082 Development Fund to deliver a **production-grade, open-source C# / .NET SDK** for Canton Network. The proposer has built proof-of-concept implementations of the core components — validating the technical approach against Canton LocalNet — and this proposal funds the engineering required to transform those prototypes into a robust, cross-platform, enterprise-ready SDK suitable for ecosystem-wide adoption.

The SDK will include:

1. **Daml Codegen for C#** – Generates strongly-typed C# classes from Daml packages (.dar files), enabling type-safe contract creation, exercise, and querying.
2. **gRPC Ledger API Client** – A native C# client for the Canton Participant Node's Ledger API over gRPC.
3. **PQS Client** – A PostgreSQL Query Store client for active contract queries with typed payload filtering.
4. **JSON API v2 Client** – HTTP-based client following the OpenAPI specification for the JSON Ledger API v2.
5. **AI-Assisted Developer Onboarding** – Machine-readable SDK documentation optimized for agentic discovery, enabling AI coding assistants to guide developers through Canton integration.

This work directly addresses the fund's mandate for **"dev tools, reference implementations"** and expands Canton's reach to the massive .NET developer ecosystem — an underserved population in the current SDK landscape.

**Current status:** Proof-of-concept prototypes for the codegen, gRPC client, PQS client, and authentication have been built to validate the technical approach and confirm feasibility. These prototypes are functional against Canton LocalNet and have been invaluable for understanding the Daml-LF wire format, the Ledger API surface, and the edge cases in type mapping between Daml and C#. However, internal prototypes and production-grade open-source SDKs are fundamentally different artifacts — the gap between "works on my machine" and "enterprise teams can depend on this" is where the bulk of the engineering effort lies.

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
- Wallet/dApp API integration (covered by CIP-0103; could be Phase 2)
- Canton admin/topology APIs (considered for future work)
- GUI tooling

### 2. Technical Feasibility (Proof-of-Concept)

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

### 3. Implementation Mechanics

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

**Quality Assurance:**
- Unit tests: ≥80% code coverage on codegen logic and client serialization
- Integration tests: Against Canton LocalNet (CI), across Windows + Linux + macOS, ARM64 + x64
- Static analysis: Roslyn analyzers, nullable reference type enforcement
- Benchmarks: Performance regression tests for streaming throughput

**Open Source Practices:**
- All development in public from day one
- Issues and roadmap tracked via GitHub Projects
- Contribution guidelines and code of conduct
- Semantic versioning with clear deprecation policy

### 4. Architectural Alignment

This proposal aligns directly with the CIP-0082 Development Fund mandate for **"dev tools, reference implementations"** and the Canton Foundation's goal of expanding the developer ecosystem.

The SDK is a **standalone consumer** of existing Canton infrastructure:
- Published Daml-LF protobuf definitions
- Canton Ledger API (gRPC and JSON) as documented
- OpenAPI specification for JSON Ledger API v2

**This proposal requires NO changes to Canton, Daml, or Splice core repositories.** This independence simplifies approval and avoids blocking on OSS maintainer review cycles.

Canton 3.4 stabilized the Ledger API and JSON API v2 with OpenAPI specs — making this the ideal time to build language bindings that will remain stable across future releases. With Canton 3.5 on the horizon, the API surface is mature.

Relevant CIPs:
- **CIP-0082:** Development Fund establishment
- **CIP-0100:** Development Fund governance
- **CIP-0103:** dApp API standard (potential future integration point)

### 5. Relationship to Other Proposals

This proposal is **complementary** to other SDK and tooling proposals, not competing:

| Proposal | Relationship |
|----------|-------------|
| **Go SDKs (Noders, #38)** | Different language ecosystem. Go SDK serves blockchain infrastructure teams; C# SDK serves enterprise application teams. Together they expand Canton's multi-language coverage. |
| **DAR-to-TypeScript Codegen (#74)** | Single-purpose codegen tool. Our codegen is part of a full SDK (codegen + client + runtime). Different language targets. |
| **dApp SDK (Digital Asset, #69)** | Different layer entirely. The dApp SDK handles CIP-0103 wallet-to-dApp connectivity (TypeScript). Our SDK handles application-to-participant-node connectivity (C#). A C# application would use our SDK to talk to Canton, and could later use a C# CIP-0103 client to connect to wallets. |

Canton's developer ecosystem benefits from **multi-language SDK coverage** — the same way Ethereum has ethers.js, web3.py, Nethereum (C#), and go-ethereum. Each language SDK unlocks a different developer population.

### 6. Backward Compatibility

*No backward compatibility impact.* The SDK is a new, standalone library that consumes existing public APIs without modifying them.

---

## Milestones and Deliverables

All milestones are designed to be ≤ 1 quarter in duration with clear acceptance criteria combining both delivery and ecosystem adoption indicators.

### Milestone 1: Open-Source Release & Core Infrastructure
- **Estimated Delivery:** 6 weeks from funding approval
- **Focus:** Set up the open-source project, CI/CD across platforms, NuGet publishing, codegen hardening, and quickstart documentation. Transform the proof-of-concept code into a publishable foundation.
- **Deliverables / Value Metrics:**

| Deliverable | Acceptance Criteria |
|-------------|---------------------|
| Repository published under Canton Foundation GitHub org (or approved location) | Public repo with Apache 2.0 or CC0 license |
| CI/CD pipeline (GitHub Actions) | Automated build, test, and NuGet publish on release tags. CI matrix covering Windows + Linux + macOS on both ARM64 and x64. |
| Daml Codegen CLI | Successfully generates C# from Splice/Amulet `.dar` and a custom test `.dar` |
| Codegen runtime library | NuGet package published; supports core Daml types (ContractId, Party, Timestamp, Optional, List, Map, Variant, Record) |
| gRPC client foundation | Can connect to participant node, submit commands, and parse transaction results |
| Authentication | OAuth2/JWT token injection packaged for open-source release |
| Quickstart documentation | README with quickstart that a developer can follow end-to-end; architecture overview |
| **Ecosystem gate** | At least 2 developers outside Peaceful Studio complete the quickstart and provide feedback |

**Verification:** Tech & Ops committee or delegate confirms code compiles, tests pass on all CI matrix targets, packages installable from NuGet, and quickstart feedback collected.

### Milestone 2: Full Ledger API Coverage, PQS Client & JSON API
- **Estimated Delivery:** 9 weeks after M1 acceptance
- **Focus:** Complete gRPC and HTTP API surface (~40 endpoints across two transports), PQS client, async streaming, integration testing against LocalNet
- **Deliverables / Value Metrics:**

| Deliverable | Acceptance Criteria |
|-------------|---------------------|
| Complete gRPC Ledger API v2 client | All endpoints implemented: Command submission, Active Contract Set queries, Transaction streams, Completions, Package service, Party management |
| PQS Client | NuGet package published; active contract queries with typed payload filtering via PostgreSQL |
| JSON API v2 client | HTTP client covering equivalent functionality for teams preferring REST |
| Async streaming | `IAsyncEnumerable<T>` support for transaction and completion streams |
| Integration tests | Test suite running against Canton LocalNet, passing on all CI matrix targets |
| **Ecosystem gate** | End-to-end demo published and announced; at least 1 community member successfully integrates the SDK into their own project |

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
| NuGet adoption | ≥500 downloads within 12 weeks of stable release |
| Real ecosystem usage | At least 2 applications outside Peaceful Studio use the SDK to submit transactions on Canton Network |
| GitHub engagement | ≥5 external issues or PRs (indicates real usage and feedback loops) |
| Feedback incorporation | At least 3 community-reported issues resolved |
| Compatibility verification | Tested against Canton 3.4.x and upcoming 3.5 release |
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

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone
- Demonstrated functionality or operational readiness
- Documentation and knowledge transfer provided
- Alignment with stated value metrics
- **Ecosystem gates met** — each milestone ties funding to measurable adoption, not just delivery

**Project-specific conditions:**
- All code published as open source under Apache 2.0 or CC0 license
- NuGet packages published and installable
- Integration tests passing against Canton LocalNet across all CI matrix targets (Windows + Linux + macOS, ARM64 + x64)
- API documentation site deployed and accessible

---

## Funding

**Total Funding Request:** 2,500,000 CC (~$375,000 USD) for initial delivery (M1–M4), plus 300,000 CC per quarter (~$45,000 USD) for ongoing maintenance. The initial ask is sized at **0.5% of the Development Fund's annual allocation** (500M CC per CIP-0082).

### Cost Basis

The funding is structured as fixed-price milestones, scoped by deliverable complexity rather than time-and-materials. Each milestone includes engineering, infrastructure, testing, documentation, open-source compliance, and community engagement costs:

| Milestone | Engineering | Infrastructure & Tooling | Community & Adoption | Total |
|-----------|-------------|--------------------------|---------------------|-------|
| M1 | Codegen hardening, gRPC client robustness, error handling, test coverage, cross-platform validation ($32K) | CI/CD pipeline with multi-platform matrix (Windows/Linux/macOS × ARM64/x64), cloud CI runners, NuGet org setup, participant node access ($18K) | Quickstart docs, external developer onboarding for ecosystem gate, Foundation coordination ($14K) | **~$71K** |
| M2 | ~40 API endpoints across gRPC + HTTP, PQS client, async streaming with backpressure/cancellation ($75K) | Integration test environment (LocalNet), API compatibility matrix, performance benchmarks, cross-platform validation ($25K) | End-to-end demo, community outreach, developer integration support ($20K) | **~$128K** |
| M3 | DocFX API reference site, AI-optimized SDK reference, 2 sample apps (console, ASP.NET Core) ($48K) | Documentation hosting, sample app infrastructure ($10K) | Launch coordination with Foundation marketing, agentic discovery validation ($22K) | **~$85K** |
| M4 | Compatibility testing (Canton 3.4.x → 3.5), bug fixes from community feedback ($36K) | Testing infrastructure across Canton versions ($10K) | Community support, adoption tracking and reporting ($38K) | **~$91K** |
| M5+ | Protocol compatibility updates, security patches, dependency maintenance ($24K) | CI/CD maintenance, test infrastructure ($8K) | Issue triage, PR reviews, quarterly adoption report ($10K) | **~$45K/quarter** |

**Notes:**
- The proof-of-concept prototypes de-risk the proposal by confirming the technical approach is sound. The funding covers the substantial engineering required to reach production quality: full API coverage, cross-platform reliability (Windows + x64), comprehensive test coverage, robust error handling, documentation, sample applications, and community adoption.
- Engineering costs reflect the niche intersection of C#/.NET expertise, distributed ledger protocol engineering, and Canton/Daml-specific domain knowledge. The proposer has 15+ years of C#/.NET experience in capital markets and fintech, a proven track record of team and project leadership with 6 years as a CTO of a digital exchange, and direct Canton development experience since mid-2025.
- Infrastructure costs include cloud CI runners across multiple platforms and architectures, participant node access, documentation hosting, and testing environments.
- Community & adoption costs increase in later milestones as the focus shifts from building to ecosystem engagement.
- The AI-optimized SDK reference (M3) represents a novel approach to developer onboarding that justifies the investment: by enabling agentic discovery, the SDK becomes self-documenting for the AI-assisted development workflows that are rapidly becoming the norm. This lowers the adoption barrier significantly — a developer using Copilot or Claude can query the SDK's capabilities conversationally rather than reading documentation linearly.

### Cost Comparison with Similar Proposals

| Proposal | Scope | Funding |
|----------|-------|---------|
| Go SDKs + Python DAZL (#38, Noders) | Go gRPC client + codegen + wallet SDK + Python patches. Mostly retroactive for already-shipped code. | 2,100,000 CC |
| **This C# SDK (#46)** | **C# codegen + gRPC + JSON API + PQS + AI docs + samples + cross-platform CI + adoption. Forward-looking delivery.** | **2,500,000 CC** |
| DAR-to-TypeScript Codegen (#74) | Single-purpose codegen tool (TypeScript only) | 330,000 CC |
| Canton dApp SDK (#69, Digital Asset) | TypeScript dApp-to-wallet SDK (CIP-0103), different stack layer | 8,170,000 CC |

This proposal delivers broader scope than the Go SDK (additional JSON API client, PQS client, AI-optimized documentation, cross-platform CI matrix) for a comparable total cost, with the key difference that funding is tied to forward delivery and adoption gates rather than retroactive recognition.

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

> *Context: The total M1–M4 ask of 2,500,000 CC represents 0.5% of the Development Fund's annual allocation of 500M CC (per CIP-0082). USD equivalents are based on a CC/USD rate of $0.15 as of March 2026.*

### Volatility Stipulation

The initial delivery (M1–M4) spans ~33 weeks (~8 months). For milestones >6 months from approval, funding will be adjusted based on CC price fluctuations per CIP-0100 guidelines. Specific adjustment mechanism: if the CC price changes by >25% from proposal acceptance, milestone funding will be recalculated at the then-current CC/USD rate to maintain equivalent USD value. The quarterly maintenance milestone is re-evaluated each quarter by default.

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
- [Consistently top-6 on GitHub](https://octoverse.github.com/) — used in nearly 80% of new repositories alongside Python, JavaScript, TypeScript, Java, and C++ (Octoverse 2025)
- [Used by ~30% of professional developers](https://survey.stackoverflow.co/2025/technology) year after year (Stack Overflow 2023-2025)

Digital Asset previously maintained C# bindings ([`daml-net`](https://github.com/digital-asset/daml-net)) with contributions from Canton ecosystem participants including Calastone, but **archived the project in January 2025** without ever publishing NuGet packages — leaving the .NET ecosystem entirely unserved. That project targeted the pre-Canton Daml SDK 1.x API surface, which has since been superseded by the Canton 3.x Ledger API. This proposal offers a **more complete solution** — full codegen, dual-protocol client, PQS support, authentication, and AI-assisted onboarding — built from scratch against the modern Canton API.

### Ecosystem Demand

**Direct experience from Canton development in C#/.NET:**

The proposer has first-hand experience with the friction this SDK eliminates. While serving as CTO at a Canton Network participant operating a production validator — a digital exchange with a C#/.NET back-office stack — the team needed to integrate Canton functionality into their existing infrastructure. No SDK existed. The development process required:

- **Reverse-engineering the wire format:** Understanding what messages to send over the HTTP JSON API meant debugging existing Java/TypeScript SDK traffic, capturing the payloads, and manually translating them into equivalent C# types.
- **No type safety:** Without codegen, every contract interaction was hand-coded against raw JSON — a process that was slow, error-prone, and required constant cross-referencing with Daml model definitions.
- **No Daml bindings:** There was no way to generate strongly-typed C# classes from `.dar` packages. Every Daml type (records, variants, contract IDs, party references) had to be manually modeled and serialized.

What took weeks of trial-and-error per integration point would become a single `dotnet tool run daml-codegen` invocation with this SDK.

The proposer has also deployed Canton validators for two additional organizations whose technology stacks are built on C#/.NET. Both teams have encountered — or will encounter as they deepen their Canton integration — the exact same friction: no codegen, no type-safe client, manual wire format reverse-engineering. These teams represent immediate adoption candidates for the SDK upon release. References can be provided to the committee on request.

**Broader ecosystem signals:**

- The [2026 Canton Developer Survey](https://forum.canton.network/t/canton-network-developer-experience-and-tooling-survey-analysis-2026/8412) (41 respondents) identified **"typed SDKs & language bindings"** as a high-priority gap. **83% of respondents come from TradFi or Hybrid backgrounds** — precisely the demographic where .NET is the dominant platform.
- Major Canton Network participants are known .NET-heavy organizations: **HSBC** (Orion tokenized bonds), **Goldman Sachs** (GS DAP), **BNP Paribas** (Neobonds), **Calastone** (fund tokenization, Canton Foundation founding member), and **Broadridge** (Canton Foundation founding member).
- DA's archived `daml-net` project received contributions from **Calastone engineers** — demonstrating that institutional Canton participants have actively sought .NET tooling.

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
| Canton API breaking changes | Close collaboration with OSS maintainers; early access to release candidates |
| Low adoption | Adoption milestones with ecosystem gates ensure funding is tied to real usage, not just delivery |
| Maintainer availability | Maintenance milestone ensures ongoing commitment; documentation enables community takeover if needed |
| Cross-platform issues | CI matrix covers Windows + Linux + macOS across ARM64 and x64 from M1 |

---

## Rationale

### Why C# / .NET

Canton's institutional target market (banking, insurance, asset management) overwhelmingly uses .NET as a primary development platform. Without a native SDK, these teams face polyglot friction — either wrapping Java/TypeScript or building custom integrations from raw gRPC/HTTP. A first-class C# SDK removes this barrier entirely.

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
| PQS client | ❌ | ❌ | ✅ |
| Streaming | ✅ | ✅ (WebSocket) | ✅ (IAsyncEnumerable) |
| AI-optimized docs | ❌ | ❌ | ✅ |
| Packaged library | ❌ | N/A | ✅ |
| Native types | ❌ | N/A | ✅ |

---

## Appendix: What Canton Development Looks Like in C#

The following examples illustrate the developer experience this proposal delivers. They are based on the proof-of-concept codegen output and client API design.

### A.1 — Type-safe contracts from Daml codegen

Given this Daml template:

```daml
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

### A.2 — Creating a contract (type-safe from the start)

```csharp
var alice = new Party("Alice");
var bob = new Party("Bob");
var iou = new Iou(Issuer: alice, Owner: bob, Currency: "USD", Amount: 1000.00m);
var contractId = await ledgerClient.CreateAsync(iou, actAs: alice);
```

Passing a contract ID where a party is expected — or vice versa — is a compile error.

### A.3 — Exercising a choice (fully type-safe)

```csharp
var contractId = new Iou.IouContractId("00abc123");
var charlie = new Party("Charlie");
var exerciseCmd = contractId.ExerciseTransfer(newOwner: charlie);
await ledgerClient.ExerciseAsync(exerciseCmd, actAs: bob);
```

No magic strings, no raw JSON — the developer only interacts with generated types and named methods.

### A.4 — Multi-party workflow (from an application in development)

This example shows an offer acceptance workflow from a Canton application currently in development at Peaceful Studio:

```csharp
// Accept an offer — type-safe choice exercise with generated method
var exerciseCommand = offerContractId.ExerciseAccept(new Offer.AcceptArgument());

var submission = CommandsSubmission
    .Single(exerciseCommand, counterpartyParty)
    .WithActAs(counterpartyParty);

var transaction = await ledgerClient.SubmitAndWaitForTransactionAsync(submission, ct);
var agreementCid = FindContract<Agreement>(transaction).ContractId;
```

### A.5 — Building a command submission with multi-party authorization

```csharp
var submission = CommandsSubmission.Single(CreateCommand.For(offer), platformParty)
    .WithActAs(platformParty, initiatorParty)
    .WithWorkflowId("my-workflow");

var tx = await ledgerClient.SubmitAndWaitForTransactionAsync(submission, ct);
```

`WithActAs` accepts `Party` values — the compiler prevents accidentally passing a workflow ID or contract ID as a party.

### A.6 — Querying active contracts via PQS (typed, no SQL)

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

### A.7 — Service registration and health checks (one-liners)

```csharp
// Program.cs — register Canton clients from configuration
services.AddLedgerClient(config.GetSection("Canton:Ledger"));  // gRPC commands
services.AddPqsClient(config.GetSection("Canton:Pqs"));        // PQS queries

// Health checks provided by the Canton packages
builder.Services.AddHealthChecks()
    .AddPqsClient(tags: ["ready"])
    .AddLedgerClient(tags: ["ready"]);
```

### A.8 — Putting it all together: a complete controller

```csharp
[ApiController]
[Route("api/v1/ious")]
public class IouController(IouQueries queries, IouCommands commands) : ControllerBase
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
        var party = new Party(Request.Headers["X-Party-Id"].First()!);
        var cid = new Iou.IouContractId(contractId);
        var newOwner = new Party(req.NewOwner);
        var newCid = await commands.TransferAsync(cid, newOwner, actAs: party, ct);
        return Ok(new { contractId = newCid });
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
