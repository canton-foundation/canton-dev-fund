## Development Fund Proposal

**Author:** Matthieu Le Berre (Peaceful Studio)
**Status:** Submitted
**Created:** 2026-03-05

---

## Abstract

This proposal seeks funding from the CIP-0082 Development Fund to open-source, document, and maintain a production-ready **C# / .NET SDK** for Canton Network. The SDK includes:

1. **Daml Codegen for C#** – Generates strongly-typed C# classes from Daml packages (.dar files), enabling type-safe contract creation, exercise, and querying.
2. **gRPC Ledger API Client** – A native C# client for the Canton Participant Node's Ledger API (both gRPC and JSON API v2 compatibility layer).
3. **JSON API v2 Client** – HTTP-based client following the OpenAPI specification for the JSON Ledger API v2.

This work directly addresses the fund's mandate for **"dev tools, reference implementations"** and expands Canton's reach to the massive .NET developer ecosystem—an underserved population in the current SDK landscape.

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
| **JSON API v2 Client** | HTTP client generated from OpenAPI spec + manual ergonomic wrappers |
| **Streaming Support** | Async streams (IAsyncEnumerable) for transaction/completion subscriptions |
| **Authentication Helpers** | OAuth2/JWT token handling for participant node authentication |
| **Sample Applications** | Console app + ASP.NET Core integration example |
| **Documentation** | README, API docs (XML docs + DocFX site) |

**Out of Scope:**
- Wallet/dApp API integration (covered by CIP-0103; could be Phase 2)
- Canton admin/topology APIs (considered for future work)
- GUI tooling

### 2. Implementation Mechanics

**Codegen Architecture:**
```
.dar file → Daml-LF parser (protobuf) → AST transformation → C# Roslyn code emitter → .cs files
```

The codegen will leverage:
- Daml-LF protobuf definitions (publicly available)
- Roslyn source generators for compile-time integration (optional advanced feature)
- Standard .NET conventions (nullable reference types, `IAsyncEnumerable`, `System.Text.Json`)

**Client Architecture:**
```
Application Code
       ↓
C# SDK (strongly-typed)
       ↓
  ┌────┴────┐
  │         │
gRPC     HTTP/JSON
  │         │
  └────┬────┘
       ↓
Canton Participant Node
```

**Quality Assurance:**
- Unit tests: ≥80% code coverage on codegen logic and client serialization
- Integration tests: Against Canton LocalNet (CI) and Canton Network devnet (nightly)
- Static analysis: Roslyn analyzers, nullable reference type enforcement
- Benchmarks: Performance regression tests for streaming throughput

**Open Source Practices:**
- All development in public from day one
- Issues and roadmap tracked via GitHub Projects
- Contribution guidelines and code of conduct
- Semantic versioning with clear deprecation policy

### 3. Architectural Alignment

This proposal aligns directly with the CIP-0082 Development Fund mandate for **"dev tools, reference implementations"** and the Canton Foundation's goal of expanding the developer ecosystem.

The SDK is a **standalone consumer** of existing Canton infrastructure:
- Published Daml-LF protobuf definitions
- Canton Ledger API (gRPC and JSON) as documented
- OpenAPI specification for JSON Ledger API v2

**This proposal requires NO changes to Canton, Daml, or Splice core repositories.** This independence simplifies approval and avoids blocking on OSS maintainer review cycles.

Canton 3.4 stabilized the Ledger API and JSON API v2 with OpenAPI specs—making this the ideal time to build language bindings that will remain stable across future releases. With Canton 3.5 on the horizon, the API surface is mature.

Relevant CIPs:
- **CIP-0082:** Development Fund establishment
- **CIP-0100:** Development Fund governance
- **CIP-0103:** dApp API standard (potential future integration point)

### 4. Backward Compatibility

*No backward compatibility impact.* The SDK is a new, standalone library that consumes existing public APIs without modifying them.

---

## Milestones and Deliverables

All milestones are designed to be ≤ 1 quarter in duration with clear acceptance criteria.

### Milestone 1: Open-Source Release & Core Infrastructure
- **Estimated Delivery:** 6 weeks from funding approval
- **Focus:** Bootstrap the project — open-source existing code, CI/CD, NuGet publishing, codegen MVP
- **Deliverables / Value Metrics:**

| Deliverable | Acceptance Criteria |
|-------------|---------------------|
| Repository published under Canton Foundation GitHub org (or approved location) | Public repo with Apache 2.0 or CC0 license |
| CI/CD pipeline (GitHub Actions) | Automated build, test, and NuGet publish on release tags |
| Daml Codegen CLI MVP | Successfully generates C# from Splice/Amulet `.dar` and a custom test `.dar` |
| Codegen runtime library | NuGet package published; supports core Daml types (ContractId, Party, Timestamp, Optional, List, Map, Variant, Record) |
| gRPC client foundation | Can connect to participant node and call `GetLedgerIdentity` |
| Basic documentation | README with quickstart, architecture overview |

**Verification:** Tech & Ops committee or delegate confirms code compiles, tests pass, packages installable from NuGet.

### Milestone 2: Full Ledger API Coverage & JSON API Client
- **Estimated Delivery:** 9 weeks after M1 acceptance
- **Focus:** Complete gRPC and HTTP API surface, async streaming, authentication
- **Deliverables / Value Metrics:**

| Deliverable | Acceptance Criteria |
|-------------|---------------------|
| Complete gRPC Ledger API v2 client | All endpoints implemented: Command submission, Active Contract Set queries, Transaction streams, Completions, Package service, Party management |
| JSON API v2 client | HTTP client covering equivalent functionality for teams preferring REST |
| Async streaming | `IAsyncEnumerable<T>` support for transaction and completion streams |
| Integration tests | Test suite running against Canton LocalNet (local) and Canton Network devnet |
| Authentication | JWT/OAuth2 token injection; configurable token refresh |

**Verification:** Demonstrate end-to-end flow: codegen → submit command → observe transaction → query ACS, on both gRPC and HTTP paths.

### Milestone 3: Documentation, Samples & Community Launch
- **Estimated Delivery:** 6 weeks after M2 acceptance
- **Focus:** Developer documentation, sample applications, coordinated public launch
- **Deliverables / Value Metrics:**

| Deliverable | Acceptance Criteria |
|-------------|---------------------|
| Comprehensive API documentation | XML docs on all public types; DocFX-generated static site |
| Sample: Console application | CLI tool demonstrating codegen + command submission + ACS query |
| Sample: ASP.NET Core integration | Web API that exposes Canton contract data via REST endpoints |
| Sample: Blazor dashboard (optional stretch) | Simple UI showing live contract state |
| Migration guide | Document mapping Java SDK patterns → C# SDK equivalents |
| Announcement & launch | Blog post / dev announcement coordinated with Canton Foundation marketing |

**Verification:** Samples run successfully against testnet; documentation site deployed and linked from Canton developer docs.

### Milestone 4: Adoption & Community Feedback
- **Estimated Delivery:** 12 weeks after M3 acceptance (overlaps with maintenance)
- **Focus:** Active community engagement, compatibility verification, feedback incorporation
- **Deliverables / Value Metrics:**

| Deliverable | Acceptance Criteria |
|-------------|---------------------|
| NuGet download target | ≥500 downloads within 12 weeks of stable release |
| GitHub engagement | ≥20 stars, ≥5 external issues or PRs (indicates real usage) |
| Feedback incorporation | At least 3 community-reported issues resolved |
| Compatibility verification | Tested against Canton 3.4.x and upcoming 3.5 release |
| Conference/meetup presentation (optional) | Present SDK at a Canton or .NET community event |

**Verification:** NuGet download stats, GitHub insights, resolved issue links provided to committee.

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

**Verification:** Release tags demonstrating compatibility with latest Canton version; issue response times auditable via GitHub.

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone
- Demonstrated functionality or operational readiness
- Documentation and knowledge transfer provided
- Alignment with stated value metrics

**Project-specific conditions:**
- All code published as open source under Apache 2.0 or CC0 license
- NuGet packages published and installable
- Integration tests passing against Canton LocalNet and devnet
- API documentation site deployed and accessible

---

## Funding

**Total Funding Request:** 2,500,000 CC (~$391,000 USD) for initial delivery (M1–M4), plus 300,000 CC per quarter (~$47,000 USD) for ongoing maintenance. The initial ask is sized at **0.5% of the Development Fund's annual allocation** (500M CC per CIP-0082), reflecting the scope of delivering a full production SDK — codegen, dual-protocol client, documentation, samples, and adoption — for an entirely new language ecosystem.

### Payment Breakdown by Milestone

- **Milestone 1** (Open-Source Release & Core): **475,000 CC** upon committee acceptance
  *Rationale: Bootstraps the entire project — open-sourcing existing code, CI/CD, NuGet publishing, protobuf integration, and codegen MVP. Foundational infrastructure investment that de-risks all subsequent milestones.*

- **Milestone 2** (Full API Coverage): **850,000 CC** upon committee acceptance
  *Rationale: Heaviest engineering milestone — full Ledger API surface across both gRPC and JSON protocols, plus async streaming. Covers ~40 API endpoints across two transport layers, each requiring serialization logic, error handling, retry policies, and comprehensive integration testing. The dual-protocol approach effectively doubles the client surface area compared to a single-transport SDK.*

- **Milestone 3** (Docs, Samples, Launch): **575,000 CC** upon committee acceptance
  *Rationale: Documentation and samples turn a library into an adoptable SDK. Delivers a full DocFX API reference site, three sample applications, a Java-to-C# migration guide, and a coordinated community launch. Quality developer documentation is typically the single biggest factor in SDK adoption.*

- **Milestone 4** (Adoption & Feedback): **600,000 CC** upon committee acceptance
  *Rationale: Adoption requires active investment — community engagement, conference presentations, compatibility testing across Canton releases, and responsive issue resolution. The 12-week duration reflects real developer adoption cycles.*

- **Milestone 5+** (Quarterly Maintenance): **300,000 CC per quarter** upon committee acceptance
  *Rationale: SDKs without active maintenance become liabilities. Each Canton release requires compatibility verification, API migration, dependency updates, and security patching. The 72-hour SLA on security vulnerabilities and 4-week protocol compatibility window require dedicated, ongoing attention.*

> *Context: The total M1–M4 ask of 2,500,000 CC represents 0.5% of the Development Fund's annual allocation of 500M CC (per CIP-0082). USD equivalents are based on the CC/USD rate of $0.156 as of March 2026.*

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

### The Opportunity

By providing first-class .NET support, Canton Network can unlock adoption by traditional enterprise developers who standardize on Microsoft stacks, enable integration into existing .NET microservices architectures without polyglot friction, and lower the barrier for fintech teams already building with C# (e.g., trading systems, back-office tools).

### Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Daml-LF format changes | SDK uses versioned Daml-LF protobuf; codegen supports multiple LF versions |
| Canton API breaking changes | Close collaboration with OSS maintainers; early access to release candidates |
| Low adoption | Adoption milestone incentivizes active marketing and community engagement |
| Maintainer availability | Maintenance milestone ensures ongoing commitment; documentation enables community takeover if needed |

---

## Rationale

### Why C# / .NET

Canton's institutional target market (banking, insurance, asset management) overwhelmingly uses .NET as a primary development platform. Without a native SDK, these teams face polyglot friction — either wrapping Java/TypeScript or building custom integrations from raw gRPC/HTTP. A first-class C# SDK removes this barrier entirely.

### Why This Approach

The dual-protocol approach (gRPC + JSON API) ensures the SDK serves both high-performance backend services (gRPC) and lightweight integrations (HTTP/JSON). The codegen-first design mirrors the proven Java SDK pattern, giving .NET developers the same type-safe experience. Publishing to NuGet — the standard .NET package manager — ensures frictionless adoption via `dotnet add package`.

### Comparison with Existing SDKs

| Feature | Java SDK | TypeScript SDK | This C# SDK |
|---------|----------|----------------|-------------|
| Codegen | ✅ | ✅ | ✅ |
| gRPC client | ✅ | ❌ | ✅ |
| JSON API client | ✅ | ✅ | ✅ |
| Streaming | ✅ | ✅ (WebSocket) | ✅ (IAsyncEnumerable) |
| NuGet package | ❌ | N/A | ✅ |
| .NET native types | ❌ | N/A | ✅ |

### Team & Qualifications

**Matthieu Le Berre — Peaceful Studio** — 15+ years C#/.NET in capital markets and fintech (SocGen, UBS, Credit Suisse, Bluecrest, Trakx). Founder of Peaceful Studio, an active Canton Network participant operating multiple validator deployments (Trakx, Peaceful Studio, Artex GM in progress) since July 2025, and building CTI tokenization on Canton.

GitHub: [github.com/monsieurleberre](https://github.com/monsieurleberre)

---

## References

- [CIP-0082: Development Fund establishment](https://github.com/canton-foundation/cips/blob/main/cip-0082/cip-0082.md)
- [CIP-0100: Development Fund governance](https://github.com/canton-foundation/cips/blob/main/cip-0100/cip-0100.md)
- [CIP-0103: dApp API standard](https://github.com/canton-foundation/cips/blob/main/cip-0103/cip-0103.md)
- [Canton Ledger API documentation](https://docs.digitalasset.com)
- [Stack Overflow Developer Survey 2025](https://survey.stackoverflow.co/2025/technology)
- [GitHub Octoverse 2025](https://octoverse.github.com/)

---

*This proposal is submitted for consideration under the CIP-0100 Development Fund governance process.*
