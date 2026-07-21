## Development Fund Proposal

| Field | Value |
| :---- | :---- |
| Author | Matthieu Le Berre |
| Org | Peaceful Studio |
| Status | Approved |
| Created | 2026-03-05 |
| Approved | 2026-05-21 |
| PR | [#46](https://github.com/canton-foundation/canton-dev-fund/pull/46) | 

----

## Abstract

**Canton Network is effectively unreachable from C# / .NET today.** Digital Asset's previous bindings (`daml-net`) were archived in January 2025 without ever publishing NuGet packages. The current Canton Ledger API v2 (gRPC + JSON, OpenAPI-specified, stable since Canton 3.4) cannot be consumed from .NET without weeks of bespoke integration work per team: pointing a generic OpenAPI generator (NSwag, Kiota, `openapi-generator-cli`) at the published JSON spec produces a client with eleven empty-object classes (`Empty` plus `Empty1`–`Empty10`), three independent `HashingSchemeVersion` enums, and `object`-typed DAML payload fields — none of it a generator bug, all of it baked into the spec. We catalogued four structural defects, summarised in [Appendix B](#appendix-b--why-a-generic-openapi-generator-is-not-enough). Every team that has integrated to date has written the same wrapper layer.

**This matters because Canton's institutional target market is Microsoft-first.** TradFi institutions — banks, asset managers, custodians, exchange operators — run their back-office, trading, settlement, and reconciliation stacks on .NET on Windows. The Canton-adjacent engineering teams inside those institutions are not going to swap to Java or TypeScript to integrate Canton; in many cases they cannot, because internal supply-chain, build-toolchain, and security-review processes are tuned to the Microsoft ecosystem. .NET is the gap in Canton's language coverage that most named institutional adopters either cross internally with bespoke bridges or route around. Marcin Ziolek (Senior Product Architect, Digital Asset SDK team) confirmed on 2026-04-27 that DA's roadmap remains TypeScript / Java / Python; the .NET quadrant will not be closed by an internal effort.

**This proposal seeks funding from the CIP-0082 Development Fund to open-source, harden, and bring to production-readiness an existing C# / .NET SDK** that makes Canton consumable from .NET via NuGet — including pre-built bindings for every Splice DAR distributed as `Canton.Splice.*` NuGet packages. The underlying building blocks (codegen, gRPC client, PQS client, authentication, runtime library) have already been built as proofs of concept and are actively used in development by Peaceful Studio against Canton LocalNet and DevNet. This proposal funds open-source release, hardening, full API surface coverage, the Splice NuGet distribution layer, documentation, and community adoption — not greenfield development.

The SDK will include:

1. **Daml Codegen for C#** – Generates strongly-typed C# classes from Daml packages (.dar files), enabling type-safe contract creation, exercise, and querying.
2. **gRPC Ledger API Client** – A native C# client for the Canton Participant Node's Ledger API over gRPC.
3. **PQS Client** – A PostgreSQL Query Store client for active contract queries with typed payload filtering.
4. **JSON API v2 Client** – HTTP-based client following the OpenAPI specification for the JSON Ledger API v2.
5. **Pre-built Splice bindings as NuGet packages** – `Canton.Splice.Amulet`, `Canton.Splice.Wallet`, `Canton.Splice.TokenStandard`, `Canton.Splice.ValidatorLifecycle`, `Canton.Splice.DsoGovernance` and shared utility packages, maintained as proof points that the codegen pipeline produces a usable C# object model from real-world DARs and refreshed on every Canton / Splice release.

These five components form a single cohesive product: codegen is unusable without a client; clients are useless without codegen; the Splice NuGet packages are the proof points that demonstrate the pipeline works end-to-end against the protocol DARs every Canton application depends on. Splitting them — per the framework in PR #258 — would force developers to wait for partial deliverables that do not enable a single Canton integration. The single objective is **"make Canton consumable from C# / .NET in production"**.

This work directly addresses the fund's mandate for **"dev tools, reference implementations"** and extends Canton into the .NET dependency-management surface — the default approach of "extend what exists" applied to one of Canton's most underserved platforms.

**Current status:** The codegen, gRPC client, PQS client, and authentication are functional and used daily in development against Canton LocalNet. The primary risk of "can this be built?" has already been retired — what remains is hardening, full API surface coverage, NuGet distribution infrastructure, documentation, and community launch.

----

## Specification

### 1. Objective

**Full delivery of this proposal will result in:**

A production-grade, open-source C# SDK published to NuGet that enables .NET developers to:
- Generate type-safe C# code from any Daml package
- Connect to Canton participant nodes via gRPC or HTTP
- Submit commands, query contracts, and stream transactions
- Build dApps on Daml whose client applications are written entirely in C#

| Component | Description |
|-----------|-------------|
| **Daml Codegen CLI** | Command-line tool that reads `.dar` files and generates C# classes for templates, choices, and data types |
| **Codegen Runtime Library** | Supporting types for serialization, contract IDs, party handling, timestamps, etc. |
| **gRPC Ledger API Client** | Full implementation of the Canton Ledger API v2 in C# using Grpc.Net.Client |
| **PQS Client** | PostgreSQL Query Store client for active contract queries with typed payload filtering |
| **JSON API v2 Client** | HTTP client generated from OpenAPI spec + manual ergonomic wrappers |
| **Streaming Support** | Async streams (IAsyncEnumerable) for transaction/completion subscriptions |
| **Authentication** | OAuth2/JWT token handling for participant node authentication |
| **Sample Applications** | CLI smoke-test (M1) + ASP.NET Core web API — cn-quickstart equivalent (M4) |
| **Documentation** | README, API docs (XML docs + DocFX site) |

**Out of Scope:**
- Front-end / browser dApp UI — see [§3 — Integration with the existing developer surface](#integration-with-the-existing-developer-surface). A basic ASP.NET Core sample with autogenerated Swagger / Scalar pages ships under M4 to demonstrate a clean architecture; a Blazor or TypeScript front-end is not part of this proposal but could be added later if the ecosystem demands it.
- Wallet/dApp API integration (covered by CIP-0103; could be Phase 2)
- Canton admin / topology APIs — topology transactions are converging into the Ledger API itself, so a dedicated admin-API client surface would add little durable value
- GUI tooling for the SDK itself (e.g. contract inspectors)

### 2. Implementation Mechanics

#### Two source-of-truth lanes

The SDK depends on two distinct proto-defined surfaces. Being precise about which definition feeds which lane matters because they have different evolution and ownership models.

| Lane | Wire format | Semantic rules | Codegen approach |
|---|---|---|---|
| **Canton Ledger API** (runtime calls to a participant node — gRPC + JSON) | The `.proto` files in `canton/community/ledger-api-proto/...` | Server-side. The client just sends and receives. | Generate the C# client surface directly from the `.proto` files via `Grpc.Tools` + `Google.Protobuf`. JSON / OpenAPI is a downstream artefact and lossy for our purposes — see [Appendix B](#appendix-b--why-a-generic-openapi-generator-is-not-enough) for the four concrete structural defects we catalogued in the published spec. |
| **Daml-LF** (the format inside `.dar` files that codegen reads) | The `daml_lf_X_Y.proto` files | **Client-side.** The reader interprets structure, types, package hashes, and per-LF-version dispatch. (SCU compatibility is decided upstream at `daml build` / participant upload — not at codegen.) | Depend on `daml-lf-archive`'s decoding semantics, not raw LF proto parsing. See "Codegen architecture" below. |

#### Codegen architecture (DAR → C#)

```
.dar file
   │
   ▼
JVM helper tool   ─────►   daml-lf-archive
   │                       (decodes per LF version into a canonical Ast,
   │                        package-hash + DAR structure — entry point Decode.scala)
   ▼
Intermediate AST  (JSON or protobuf-serialised)
   │
   ▼
C# codegen        ─────►   Roslyn-emitted .cs files
   │
   ▼
NuGet package    (`Canton.Splice.*`, or any user-built DAR — see §3)
```

The codegen reads the LF inside a `.dar` through the same library Canton itself uses to read it — [`daml-lf-archive`](https://github.com/digital-asset/canton/tree/main/community/daml-lf/archive/src/main/scala/com/digitalasset/daml/lf/archive), entry point `Decode.scala`. The library's responsibilities — per-LF-version decoders that normalise into a single canonical `Ast.Package` (the same one `daml codegen java/ts`, the script engine, and the participant's package validator consume), package-hash computation, and DAR-level structure (main package + dependencies, returned as `Dar[Ast.Package]`) — are not derivable from the LF `.proto` definitions alone. The proto says what bytes are on the wire; the archive library defines what those bytes *mean*. Direct proto parsing in C# would mean re-implementing one `Decode` per LF version (and keeping pace with new ones) plus the DAR zip / manifest reader — each a chance for the C# output to disagree with what every other Daml tool sees in the same DAR. **Smart Contract Upgrade (SCU)** compatibility itself is enforced upstream of the SDK — at compile time by `daml build`'s DAR comparison, and at upload time by the participant node — not at codegen.

A small JVM helper tool wraps `daml-lf-archive` and emits an **intermediate AST** — a structured representation of the parsed package, serialised either as JSON or protobuf. The C# codegen then consumes the AST and emits idiomatic C# types via Roslyn. This split has two deliberate consequences:

- **End-user runtime is pure .NET.** Applications consuming `Canton.Splice.*` NuGet packages — or any package built from a user's own DARs — have no JDK dependency. The pre-generated code is plain `.cs` files.
- **Only the codegen toolchain itself touches the JVM.** The JVM helper runs in CI when a Canton / Splice release tag appears (or when a developer regenerates locally) and produces NuGet packages. `Canton.Splice.*` consumers never invoke it; application developers running `dpm codegen-cs` against their own DAR invoke it at codegen time only — never at application runtime.

The "why not reimplement `Decode.scala` in C#" decision is deliberate: LF decoding and version dispatch are non-trivial, change with LF, and have an authoritative implementation in `daml-lf-archive`. Wrapping the existing implementation is materially less risky than translating it, and in the case of common Splice DARs, the one-time cost — a small JVM build step in CI — is paid by Peaceful Studio once rather than by every consumer. DA has [discussed publishing](https://github.com/canton-foundation/canton-dev-fund/pull/46#discussion_r3249844143) a JVM library that exposes the canonical Ast directly; if that lands inside the M1 window, the helper switches to consuming it directly rather than maintaining a `daml-lf-archive` wrapper.

#### Daml LF → C# type mapping

The intermediate AST is mapped to C# along the following rules. The mapping is documented in the SDK reference (repo README from M1) and is exercised by the M2 integration tests across the full Splice DAR set plus a synthetic test DAR.

| Daml LF construct | C# representation | Notes |
|---|---|---|
| `record` | `sealed record` | Field order preserved; all fields read-only via primary constructor parameters. |
| `variant` | `sealed record` hierarchy with a closed `switch` surface (cf. [§A.4](#a4--multi-party-workflow-from-an-application-in-development) `ExerciseOutcome`) | Daml's discriminated union. Each constructor becomes a nested `record` case. |
| `enum` | `enum` | One C# enum per Daml enum — no per-endpoint duplication (the failure mode the proto path avoids; see [Appendix B](#appendix-b--why-a-generic-openapi-generator-is-not-enough), defect 3). |
| `Text` | `string` | UTF-8 round-trip preserved. |
| `Int` (Int64) | `long` | |
| `Numeric N` (including legacy `Decimal` = `Numeric 10`) | `DamlNumeric` (SDK-provided struct: `BigInteger` mantissa + scale) | `.NET decimal` tops out at ~28–29 significant digits; LF `Numeric` allows up to 38. The SDK type matches LF precision so values survive round-trip; `ToDecimal()` returns `decimal?` (null when outside .NET range), `ToString()` is exact. Same reason the Java codegen uses `BigDecimal`. |
| `Date` | `DateOnly` | |
| `Time` (Timestamp) | `DateTimeOffset` (UTC, microsecond precision) | `DateTimeOffset` rather than `DateTime` so UTC is type-enforced rather than convention-tagged on the `.Kind` property. |
| `Bool` | `bool` | |
| `Unit` | `Unit` (zero-size struct) | Avoids `void`, which can't be a generic type argument. |
| `Party` | `Party` (zero-allocation `readonly record struct`) | See A.1. Implicit conversion to `string`; explicit conversion from `string` to force intentional construction at the boundary. |
| `ContractId T` | `ContractId<T>` (or codegen-emitted `T.{Template}ContractId`) | See A.1, A.3. |
| `List T` | `IReadOnlyList<T>` | |
| `TextMap V` | `IReadOnlyDictionary<string, V>` | |
| `GenMap K V` | `DamlGenMap<K, V>` (SDK-provided sorted map under LF built-in value ordering) | LF `GenMap` is a sorted associative map keyed by the LF built-in value order (`SValue.SMap` is a `TreeMap[SValue, SValue]` with `svalue.Ordering` — same total order the rest of the LF runtime uses). Keys must be LF-orderable — functions, type abstractions, partially-applied builtins, and updates are rejected; hashability is not required and not used. `IReadOnlyDictionary<K, V>` is wrong on both axes: it is hash-keyed and iteration is unordered. The SDK type carries an LF-ordering `IComparer<K>` emitted by codegen, so iteration order matches what every other Daml tool sees for the same value. |
| `Optional T` | `T?` (nullable reference) for reference types; `Nullable<T>` for value types | Aligned with .NET nullable reference type conventions. |
| Daml `interface` | C# marker interface implementing `IDamlInterface`; concrete templates implement it | See A.8. Enables `ContractId<Holding>` to dispatch over participant-computed interface views. |
| Package versioning / SCU | Each generated NuGet package is pinned to a Canton-release-tagged LF package set, and the codegen emits assembly-level `[assembly: DamlPackageVersion(...)]` metadata (package id, version, hash) so applications can introspect which DAR they were built against at runtime. | SCU compatibility itself is decided upstream of the SDK — at `daml build` time and on participant-node upload — not at codegen. The assembly metadata is for application-level introspection / runtime logging, not a replacement for those checks. |

#### Client architecture

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

**Abstraction level.** The SDK targets the **"thin client + ergonomics + opt-in resilience"** layer: typed wrappers over the gRPC and JSON Ledger APIs (codegen-aware, authenticated, streaming-first via `IAsyncEnumerable<T>`), structured error handling (see [§A.6](#a6--structured-outcome-handling)), an opt-in [Polly](https://www.pollydocs.org/strategies/retry.html)-based retry pipeline that preserves `command_id` across attempts so ledger-side deduplication behaves correctly, and OpenTelemetry instrumentation across all three transports so distributed traces flow end-to-end from caller code through the Ledger API's existing OTel emission (deliverable detail in [M2](#milestone-2-full-ledger-api-coverage-pqs-client-json-api--remaining-splice-packages)). **It deliberately does not maintain an in-process Active Contract Set or pending-set.** The participant node owns authoritative state and PQS exposes it queryably; an SDK-side cache would risk divergence on archive/create reconciliation, restart recovery, and multi-synchronizer reassignment events. The PQS client described below is the Canton-native answer to "give me a typed view of active contracts" without putting stateful caches into the SDK's responsibility surface.

The gRPC client is generated directly from the Canton Ledger API `.proto` files via `Grpc.Tools` + `Google.Protobuf` — the standard .NET gRPC stack, MSBuild-integrated, and already in production use in `peacefulstudio/canton-ledger-api-csharp`.

The HTTP / JSON path covers the small set of admin / health endpoints that have no gRPC equivalent, plus optional REST-style integration for teams that prefer JSON. We do **not** run a generic OpenAPI generator (NSwag, Kiota, `openapi-generator-cli`) against the published JSON Ledger API spec: we audited that spec (8,707 lines, version `3.5.1-SNAPSHOT`) and catalogued four structural defects — numbered duplicate schemas (`Empty1`–`Empty10`, two `DeduplicationPeriod`s, etc.), single-key `oneOf` wrappers without discriminators, inline-duplicated enums, and untyped DAML payload fields. Faithful generators reproduce these defects verbatim, producing a C# client that compiles but is hostile to use. Full breakdown and the case for protos as the source of truth: see [Appendix B](#appendix-b--why-a-generic-openapi-generator-is-not-enough). The SDK therefore uses the protos as the source of truth and hand-writes thin clients for the handful of JSON-only endpoints.

**What the PQS client adds.** PQS itself is Digital Asset's denormalised PostgreSQL projection of ledger state — contract payloads land as JSONB. Without a typed wrapper, application code reaches in via stringly-typed JSONB navigation (`payload->>'amount'` cast to numeric, no compile-time check that `amount` is even a field on the template, no IDE help, no rename safety). The C# SDK's PQS client consumes the codegen-emitted record types (see the [LF→C# mapping table](#daml-lf--c-type-mapping) above) and lets callers express the same query through `Filter.Field<Iou>(x => x.Amount, value)`-style predicates — expression trees compiled to parameterised JSONB path queries that preserve Postgres types. Same wire path as DA's PQS, typed end-to-end. Worked example in [§A.9](#a9--querying-active-contracts-via-pqs-typed-no-sql).

#### Integration with `dpm`

The SDK is distributed as a `dpm` component (see [the `dpm` component model](https://docs.digitalasset.com/build/3.4/dpm/dpm-components.html)): `codegen-cs` is resolvable from any `dpm` project by adding it to the project config (`components: { codegen-cs: { version: x.y.z } }`), with no prior knowledge required from `dpm` itself — `dpm codegen-cs` then runs the codegen pipeline. This is the single supported distribution path. A `dotnet tool`-native distribution (`dotnet tool install -g daml-cs`) is **out of scope** for this proposal: bundling the JVM helper inside a `dotnet tool` would require per-RID packaging, JRE detection / first-run extraction, and its own support and test matrix — a substantial workstream in its own right, not a thin wrapper. If `.NET`-native distribution becomes a documented adopter requirement, it would be scoped as a separate piece of work. Coordination with the `dpm` maintainers is part of M1.

#### Key dependencies

- `Grpc.Tools` + `Google.Protobuf` — Canton Ledger API gRPC client generation.
- `daml-lf-archive` (Scala) — invoked via the JVM helper at codegen time only; not a runtime dependency of generated code or applications.
- Roslyn (`Microsoft.CodeAnalysis`) — used for emitting C# from the AST in an idiomatic style.
- `System.Text.Json` — the runtime JSON serializer for the HTTP path.
- Standard .NET conventions throughout: nullable reference types, `IAsyncEnumerable`, primary constructors, records.

#### Proof-of-Concept Status

The proposer has built proof-of-concept implementations to validate the core technical approach:

| Component | PoC Status | What the PoC Validates |
|-----------|-----------|----------------------|
| **Daml Codegen CLI** | Prototype working | Direct Daml-LF protobuf parsing from `.dar` inputs, AST transformation, Roslyn-based C# emission, type mapping for core Daml types — confirms end-to-end DAR-to-C# generation on a smoke-test DAR. The PoC does **not** wrap `daml-lf-archive`; migrating to the JVM-helper architecture described above (for inherited per-LF-version decoders and DAR-level structure handling) is an architectural change delivered under M1 / M2, not something the PoC has already validated. |
| **Codegen Runtime Library** | Prototype working | ContractId, Party, Timestamp, Optional, List, Map, Variant, Record, Enum — type representation and serialization |
| **gRPC Ledger API Client** | Prototype working | Connection management, command submission, transaction parsing |
| **Authentication (OAuth2/JWT)** | Prototype working | Bearer token injection, Keycloak integration |
| **PQS Client** | Early prototype | Active contract queries with JSON payload filtering via PostgreSQL |

These prototypes confirm that the approach is sound — the Daml-LF wire format can be mapped to idiomatic C# types, the Ledger API can be consumed from .NET, and codegen produces usable output.

**What the prototypes do NOT cover** (and what the grant funds):

- **Codegen migration to the `daml-lf-archive` JVM-helper architecture** — the current codegen PoC parses the Daml-LF protobuf directly. This validates DAR-to-C# generation but inherits none of the per-LF-version decoders or DAR-level structure handling that live in `daml-lf-archive`. The architecture described in [§2](#2-implementation-mechanics) (JVM helper → canonical Ast → Roslyn emitter) replaces the direct proto path under M1 / M2 so the SDK tracks LF releases without bespoke C# reimplementation. (SCU compatibility itself is enforced upstream at `daml build` / participant upload — not at codegen.)
- **JSON API v2 client** — not yet built. Full HTTP transport layer covering the OpenAPI specification.
- **Async streaming** — not yet built. Real-time transaction/completion subscriptions with backpressure, cancellation, and fault tolerance.
- **Comprehensive test coverage and CI/CD** — the prototypes have ad-hoc tests sufficient for internal use. A production SDK needs ≥80% unit test coverage, integration tests running in CI against Canton LocalNet, and automated NuGet publishing.
- **Cross-platform validation against the production targets** — the prototypes were developed on macOS ARM64 (Apple Silicon). The production targets, derived from how TradFi institutions actually run .NET workloads, are **Windows x64** (the dominant developer and back-office environment for the institutions Canton targets) and **Linux Arm64** (the typical container-runtime target for cost-efficient cloud deployments). macOS is supported as a developer experience — CI runs the test suite on macOS Arm64 so Peaceful Studio's own toolchain stays usable — but is not a production support target. This requires expanding the CI matrix accordingly and validating the full test suite on each combination.
- **Robustness and error handling** — prototypes handle the happy path. A production SDK must handle connection failures, authentication token refresh, partial responses, malformed payloads, version mismatches, and concurrent usage patterns gracefully.
- **Full API surface coverage** — the prototypes cover the endpoints needed for one application. A production SDK must cover the full Ledger API v2 surface (~40 endpoints across gRPC and HTTP), including endpoints not yet exercised.
- **Documentation and onboarding** — internal code needs no documentation. An open-source SDK needs a full API reference, quickstart guides, and sample applications.
- **Sample applications and community launch** — none of this exists.

The proof-of-concept work de-risks the proposal by confirming the approach is viable. The funding covers the engineering required to reach production quality, cross-platform reliability, and ecosystem adoption.

#### Quality Assurance

- Unit tests: ≥80% code coverage on codegen logic and client serialization
- Integration tests: Against Canton LocalNet (CI), on the production targets (Windows x64, Linux Arm64) plus macOS Arm64 as a developer-experience target
- Static analysis: Roslyn analyzers, nullable reference type enforcement
- Benchmarks: Performance regression tests for streaming throughput

#### Open Source Practices

- All development in public from day one
- Issues and roadmap tracked via GitHub Projects
- Contribution guidelines and code of conduct
- Semantic versioning with clear deprecation policy

### 3. Architectural Alignment — Extending Daml / Canton into the .NET Ecosystem

**The default approach is to extend what exists** (per the template guidance in PR #258). This proposal does so at two layers:

**Layer 1 — Tooling.** The SDK consumes the existing Canton public API surface unchanged: the Canton Ledger API v2 `.proto` files (for the gRPC client), the JSON Ledger API for the handful of admin / health endpoints with no gRPC equivalent, and the existing `daml-lf-archive` library (for DAR-reading codegen — see [§2](#2-implementation-mechanics)). No changes to Canton, Daml, or Splice core repositories are requested. The SDK is a downstream consumer that fills a known empty quadrant rather than duplicating internal DA work — see "Coordination with the DA SDK team" below.

**Layer 2 — Distribution: any DAR → a C# NuGet package.** The headline user-story is deliberately broad, not Splice-specific:

> *As a dApp developer I want to be able to convert any DAR into a C# object representation so that I can easily write a C# application while keeping the application stack in place, using my IDE better (e.g., intellisense), and have type safety.*

The codegen pipeline ([§2](#2-implementation-mechanics)) takes any `.dar` — whether it ships from the Canton / Splice ecosystem, comes from a third-party Daml application, or was built by the developer's own Daml team that morning — and produces a versioned, IDE-friendly C# NuGet package:

```bash
dotnet add package <YourCompany>.<YourDaml>.<Component> --version <version>
```

…and the developer immediately has type-safe C# bindings to call into the underlying Daml model. `dpm codegen-cs` is the supported tooling (see [§2 — Integration with `dpm`](#integration-with-dpm)); producing and maintaining downstream NuGet packages from user DARs is the user's responsibility, on the same model as `daml codegen java`.

**Splice DARs as the published reference implementations.** Peaceful Studio maintains pre-built bindings for the protocol DARs every Canton application interacts with — `splice-amulet`, `splice-wallet`, `splice-token-standard`, `splice-validator-lifecycle`, `splice-dso-governance`, and the shared utility DARs — distributed as `Canton.Splice.*` NuGet packages, automatically refreshed on every Canton / Splice release. A C# developer integrating with Canton Coin or the Token Standard runs:

```bash
dotnet add package Canton.Splice.Wallet --version 3.4.x
dotnet add package Canton.Splice.TokenStandard --version 3.4.x
```

…and gets type-safe C# bindings without having to `git clone splice && make build && daml codegen && cross-compile && vendor`. These packages serve two purposes simultaneously: they remove that one-time onboarding cost for every C# team integrating with Splice, and they act as **proof points that the codegen pipeline produces a clean, usable C# object model from real-world DARs at scale**. Splice exercises the bulk of the Daml LF surface area, so a clean Splice run is strong evidence that an arbitrary user DAR — custom-built or third-party — will produce clean output too. Splice NuGet maintenance is part of M5+; user DARs stay user-maintained.

**This pattern does not yet exist for any Canton language ecosystem.** Java users today must run `daml codegen java` against locally-built Splice DARs themselves; TypeScript users hand-roll bindings or depend on `@daml/types`. The .NET side pioneers the *DAR-as-a-NuGet-package* distribution model, with the pattern transferable to other languages once validated.

**Why this matters.** Institutional adopters typically operate dependency-management and supply-chain-review workflows in which a "clone-this-repo-and-build-it-yourself" integration pattern is a material adoption hurdle — every dependency must be vendored, signed, scanned, and versioned through internal package feeds. **The grant funds the infrastructure that turns any DAR into a `dotnet add package` dependency** — a change in distribution shape that compounds across every future C# Canton integration, with the Splice NuGets demonstrating that the pipeline is production-ready on real protocol DARs.

**Operational implication, captured under M1 / M2 acceptance criteria:** every Canton minor / Splice release triggers automated codegen + NuGet publish, with versioning aligned to Canton release tags. Ongoing publication is part of the M5+ quarterly maintenance milestone.

#### Integration with the existing developer surface

This proposal builds on top of the existing Daml/Splice SDK surface; it does not replace or uplift any existing component. Concretely:

- **Relationship to existing codegen.** A net-new C# emitter sits alongside the existing Java, TypeScript and JavaScript codegens — no replacement. The codegen is distributed as a `dpm` component, invoked as `dpm codegen-cs` — see [§2 — Integration with `dpm`](#integration-with-dpm) for the resolution mechanism.
- **LocalNet positioning.** Unchanged. The C# SDK consumes any Canton instance — LocalNet, DevNet, TestNet, MainNet — using the existing Ledger API surface. The M1 quickstart references the current LocalNet onboarding rather than introducing a parallel one.
- **Getting-started flow on `docs.canton.network`.** Additive: we ask the Foundation to add "C# / .NET" alongside Java and TypeScript under "Language SDKs", linking to the SDK quickstart. A developer arriving at the official getting-started page sees the same entry points plus a new language option — no replacement, no fork.
- **Quickstart integration.** A small C# quickstart ships in M1 — a README walkthrough plus a CLI smoke-test program that exercises codegen + command submission + ACS query end-to-end against LocalNet. The full `cn-quickstart` equivalent — an ASP.NET Core sample with Swagger / Scalar — ships under M4 alongside the public launch. `cn-quickstart` itself stays unchanged. If `dpm` gains a C# template family, the quickstart can be packaged as a `dpm` template at that point.
- **Front-end / browser dApp UI.** Out of scope — for the same reason it sits outside the Java SDK's scope. Front-end browser dApps and wallet UIs are a TypeScript / JavaScript ecosystem concern; server-side SDKs (Java today, this C# SDK going forward) deliberately do not deliver a front-end framework. A .NET service built on this SDK exposes state to a separate TS / JS front-end via REST or gRPC-Web.

**Foundation namespace coordination.** The `Canton.*` NuGet namespace requires Canton Foundation buy-in; M1 includes a deliverable to confirm and provision that namespace. Until namespace ownership is finalised, a `PeacefulStudio.Canton.*` working namespace is used.

#### Multi-synchronizer readiness (design intent — not yet implemented)

Canton's multi-synchronizer surface is becoming consumer-visible through 2026: reassignment events will appear in update streams as staged upgrades roll out, and Canton 3.5 changes the `synchronizer_id` wire format. **Multi-synchronizer is treated as a v1 design constraint, not a v2 retrofit** — the commitments below are funded by this proposal and not yet implemented in the proof-of-concept code.

The four design commitments are:

- **Reassignment as a first-class case in typed streams.** Reassignment surfaces on the ledger as two distinct events — an `Unassigned` on the source synchronizer and an `Assigned` on the target synchronizer. `ContractEvent<T>` will gain both variants alongside `Created` and `Archived`, so consumers handle "this contract just left the visible synchronizer" and "this contract just arrived from another synchronizer" as typed branches (see [§A.7](#a7--typed-subscription-streams)) rather than as silently dropped or unexplained contracts. To be designed and implemented under M2.
- **Synchronizer scoping on the ledger surface.** Stream and query results will carry the originating synchronizer (alongside `ContractId<T>` or via an event-level field), so callers can filter or route by synchronizer rather than assume a single global view. The exact representation is a v1 design decision deliberately not pre-empted here.
- **Tracking the Canton 3.5 `synchronizer_id` format change.** The 3.5 wire-format change is acknowledged as an upcoming breaking change rather than discovered at integration time. Compatibility against both the 3.4 and 3.5 formats is added to the cross-version compatibility matrix whenever Canton 3.5 lands — under whichever milestone is current at that point.
- **Ergonomic refinement — multi-sync errors fit the [§A.6](#a6--structured-outcome-handling) typed-outcome story.** Failure modes specific to multi-synchronizer (for example, "the requested party has no standing on the target synchronizer") flow through the same `ExerciseOutcome.DamlError` categorisation shown in [§A.6 below](#a6--structured-outcome-handling), not as opaque gRPC error strings. This is the existing typed-error story applied to a new failure surface, not a separate commitment.

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

----

## Milestones and Deliverables

All milestones are designed to be ≤ 1 quarter in duration with clear acceptance criteria combining both delivery and ecosystem adoption indicators.

### Milestone 1: Open-Source Release & First Reference NuGets
- **Estimated Delivery:** 8 weeks from funding approval
- **Focus:** Open-source existing code, CI/CD, NuGet publishing, codegen MVP (any DAR → C# NuGet) on the new JVM-helper / `daml-lf-archive` architecture ([§2](#2-implementation-mechanics)), `dpm codegen-cs` component publication, quickstart, **and the first two Splice reference NuGets (`Canton.Splice.Amulet`, `Canton.Splice.Wallet`) as proof points that the pipeline produces a clean object model from real-world protocol DARs**. Most of the runtime and API-client code already exists; the codegen toolchain itself is being migrated from the PoC's direct-LF-protobuf path to the JVM helper, and the milestone bundles that migration with the packaging and publishing work. The 8-week estimate (vs. the 6 weeks initially scoped) reflects that the codegen architecture migration to `daml-lf-archive` is materially larger than the open-source-release work it ships alongside.
- **Deliverables / Value Metrics:**

| Deliverable | Acceptance Criteria |
|-------------|---------------------|
| Repository published under Canton Foundation GitHub org (or approved location) | Public repo with Apache 2.0 license |
| CI/CD pipeline (GitHub Actions) | Automated build, test, and NuGet publish on release tags. **Automated codegen + publish triggered by Canton / Splice release tag.** |
| **JVM codegen helper (`daml-lf-archive` integration)** | **Small JVM tool wrapping `daml-lf-archive` (entry point `Decode.scala`) that reads a `.dar` and emits the canonical Ast consumed by the C# codegen — see [§2](#2-implementation-mechanics). Replaces the PoC's direct LF-protobuf parsing path so the SDK inherits per-LF-version decoders, package-hash computation, and DAR-level structure handling (`Dar[Ast.Package]`) from the upstream library (SCU compatibility itself is decided at `daml build` / participant upload — not at codegen). Runs in CI and locally; not a runtime dependency of generated NuGets or applications.** |
| Daml Codegen CLI (any DAR → C# NuGet) | Successfully generates a usable C# NuGet package from (a) a Splice/Amulet `.dar`, (b) a synthetic test `.dar` exercising the full LF type surface, and (c) a third-party / user-supplied `.dar`. Codegen CLI consumes the JVM helper's intermediate AST and emits C# via Roslyn. Documented end-to-end in the quickstart. |
| **`dpm codegen-cs` component publication** | **Codegen pipeline published as a `dpm` component, resolvable from any `dpm` project via `components: { codegen-cs: { version: x.y.z } }`. `dpm codegen-cs --dar <path>` invokes the M1 pipeline end-to-end. Coordination with the `dpm` maintainers confirmed.** |
| Codegen runtime library | NuGet package published; supports core Daml types (ContractId, Party, Timestamp, Optional, List, Map, Variant, Record) |
| gRPC client foundation | Can connect to participant node, submit commands, and parse transaction results |
| Authentication | OAuth2/JWT token injection working (already implemented, packaged for open-source release) |
| **First Splice reference NuGets** | **`Canton.Splice.Amulet` and `Canton.Splice.Wallet` published to public NuGet, version-aligned with current Canton mainnet release. A developer can run `dotnet add package Canton.Splice.Wallet` and call wallet operations against LocalNet without cloning the Splice repo. These packages double as proof points for the any-DAR codegen pipeline — see [§3, Layer 2](#3-architectural-alignment--extending-daml--canton-into-the-net-ecosystem).** |
| Quickstart documentation + CLI smoke-test | README walkthrough that a developer can follow end-to-end, plus a small CLI smoke-test program demonstrating codegen + command submission + ACS query against LocalNet; architecture overview |
| **Ecosystem gate** | At least 2 developers outside Peaceful Studio complete the quickstart, with at least one issue or PR opened on the SDK repo |

**Verification:** Tech & Ops committee or delegate confirms code compiles, tests pass, packages installable from NuGet (including the two Splice packages), and quickstart feedback collected.

### Milestone 2: Full Ledger API Coverage, PQS Client, JSON API & Remaining Splice Packages
- **Estimated Delivery:** 10 weeks after M1 acceptance
- **Focus:** Complete gRPC and HTTP API surface (~40 endpoints across two transports), PQS client, async streaming, integration testing against LocalNet, **remaining Splice NuGet packages**
- **Deliverables / Value Metrics:**

| Deliverable | Acceptance Criteria |
|-------------|---------------------|
| Complete gRPC Ledger API v2 client | All endpoints implemented: Command submission, Active Contract Set queries, Transaction streams, Completions, Package service, Party management |
| PQS Client | NuGet package published; active contract queries with typed payload filtering via PostgreSQL |
| JSON API v2 client | HTTP client covering equivalent functionality for teams preferring REST |
| **OpenTelemetry instrumentation (end-to-end)** | **W3C trace-context propagation across all three transports — gRPC client via `Grpc.Net.Client` instrumentation, HTTP/JSON client via `HttpClient` + `traceparent` header, PQS client via Npgsql's OpenTelemetry integration (database semantic conventions: `db.system=postgresql`, `db.statement`, `db.name`). A single `ActivitySource` exposed for caller-side spans on command submission, retry attempts, stream consumption, and PQS query execution — so distributed traces flow end-to-end from application code through the Ledger API's existing OTel emission.** |
| Async streaming | `IAsyncEnumerable<T>` support for transaction and completion streams |
| **Remaining Splice reference NuGets** | **`Canton.Splice.TokenStandard`, `Canton.Splice.ValidatorLifecycle`, `Canton.Splice.DsoGovernance`, plus shared utility packages, published to public NuGet and version-aligned with current Canton mainnet release — using the same automated codegen + publish trigger as M1. Demonstrates the any-DAR codegen pipeline ([§3](#3-architectural-alignment--extending-daml--canton-into-the-net-ecosystem)) on the full Splice surface area.** |
| Integration tests | Test suite running against Canton LocalNet, exercising codegen output for both the Splice DARs and a user-supplied custom DAR |
| **Ecosystem gate** | End-to-end demo published and announced; at least 1 community member successfully integrates the SDK into their own project. We accept either path as evidence: (a) consuming a `Canton.Splice.*` package directly, or (b) running the codegen against the team's own DAR and shipping the resulting NuGet — either demonstrates the distribution model. |

**Verification:** Demonstrate end-to-end flow: codegen → submit command → observe transaction → query ACS, on both gRPC and HTTP paths. Community integration attempt documented.

### Milestone 3: Stabilisation, Audit & Compatibility Verification
- **Estimated Delivery:** 7 weeks after M2 acceptance (covers the Cure53 audit window, remediation of critical/high findings landed in parallel with the audit, and cross-version compatibility verification)
- **Focus:** Pre-launch hardening, cross-version compatibility verification, and hosting the Cure53 security audit window
- **Deliverables / Value Metrics:**

| Deliverable | Acceptance Criteria |
|-------------|---------------------|
| Cross-version compatibility verification | Cross-version compatibility matrix (built in M2) exercised in CI and reported in release notes; passes against every Canton release live at M3 acceptance — 3.4.x today, plus 3.5 if released by M3 acceptance |
| Pre-launch hardening | Final release engineering — version pinning, NuGet signing, release-notes generation, package metadata; residual bug-fix work surfaced during M2 integration testing closed before public release |

The Cure53 security audit window sits in M3 between M2 acceptance and M3 acceptance — the fee is held outside the M1–M4 engineering envelope as a pass-through line ([Appendix C](#appendix-c--security-audit-cure53)) and remediation engineering is absorbed within the M1–M3 envelope per the severity-tiered turnaround commitments in the same appendix. The audit is therefore a milestone event, not a billable deliverable.

**Verification:** Cross-version compatibility matrix passing in CI against every Canton release live at M3 acceptance; Cure53 audit completed with findings remediated or documented per Appendix C.

### Milestone 4: Adoption & Ecosystem Integration
- **Opens:** on M3 acceptance.
- **Deadline:** **18 months from grant approval** — explicit exception to the standard 9-month default. See *Deadline rationale* below.
- **Focus:** Adoption-enabling deliverables (DocFX API reference site, ASP.NET Core sample, coordinated public launch) plus structured engagement with regulated TradFi adopters and active community engagement. The deliverables are built and shipped under M4 because they exist to enable adoption events — for the adopter, not for the SDK to be functionally complete. The SDK itself is feature-complete at M2 acceptance and stabilised, audited, and cross-version-verified through M3.
- **Payment structure:** decomposed into deliverable tranches and per-event tranches at a fixed 100,000 CC per adoption event, plus a conditional +20% acceleration bonus on early full completion (see *Acceleration bonus* below). Partial adoption success translates into partial payout rather than a binary forfeit of the whole milestone. Full breakdown in *Payment Breakdown by Milestone* below.
- **Deliverables / Value Metrics:**

| Deliverable | Acceptance Criteria | Tranche payout |
|-------------|---------------------|----------------|
| Comprehensive API documentation | XML docs on all public types; DocFX-generated static site deployed and linked from Canton developer docs | bundled in completion tranche |
| Sample: ASP.NET Core integration — C# equivalent of cn-quickstart | Web API that exposes Canton contract data via REST endpoints, with an autogenerated Swagger / Scalar page demonstrating a clean architecture for service-side .NET dApps, and a Token Standard interface example. A browser front-end (Blazor or a TypeScript SPA) is intentionally out of scope; the sample shows how a downstream front-end would consume the same surface, but does not ship one. Built and published as a deliverable — not gated on adoption events. | bundled in completion tranche |
| Coordinated public launch | Blog post / dev announcement coordinated with Canton Foundation marketing | bundled in completion tranche |
| External-developer validation gate | At least 1 developer outside Peaceful Studio completes the ASP.NET Core sample end-to-end against LocalNet and reports back via a GitHub issue or short write-up | bundled in completion tranche |
| Adopting TradFi institution | Each regulated TradFi institution (bank, custodian, exchange operator, asset manager) integrating the SDK against a Canton network. Up to 3 institutions credited. | 100,000 CC per institution (up to 300,000 CC) |
| External application on mainnet | Each application built outside Peaceful Studio that uses the SDK to submit transactions on Canton mainnet. Up to 2 applications credited. | 100,000 CC per application (up to 200,000 CC) |
| Milestone completion | All of: DocFX site live, ASP.NET Core sample published, external-developer validation gate met, public launch coordinated; ≥500 NuGet downloads across ≥3 unique organisations; ≥5 external GitHub issues or PRs; ≥3 community-reported issues triaged through to resolution. | 250,000 CC |
| Conference/meetup presentation (optional) | Present SDK at a Canton or .NET community event if opportunity arises. | — |
| **M4 maximum (base)** | | **750,000 CC** |

**Acceleration bonus.** A +20% bonus of **150,000 CC** is added to the M4 payout if all M4 gates above — adoption-enabling deliverables, per-event tranches, and the milestone-completion criteria — are paid in full within **15 months of grant approval**. That is three months ahead of the 18-month deadline, leaving roughly nine months of M4 runtime after M3 acceptance (~6 months in, per §Volatility Stipulation) to close adoption events. This follows the convention in merged dev-fund grants (Token Standard V2 +20%, ISS-BFT +20%, LSU +10/20%, PQS +20%, Traffic-Based App Rewards +15%), most of which attach the acceleration clause to a final or adoption milestone rather than to the engineering delivery phase. The bonus pays only if the full base M4 tranche is paid in full — partial M4 completion does not produce a partial bonus. Maximum M4 with acceleration: **900,000 CC**. Maximum M1–M4 total (engineering + Cure53 audit + acceleration): **2,855,000 CC** — see [§Funding](#funding) for the breakdown.

**Deadline rationale.** The dev-fund standard is ≤9 months from grant approval. M4 here targets adoption among **regulated TradFi institutions** whose procurement and integration cycles routinely run 9–18 months for the first conversation alone — a structurally slower adopter set than the developer-tooling adopters typical of other dev-fund grants. A 9-month M4 deadline against this adopter profile is near-certain to forfeit the adoption tranche the proportionality-of-payout-to-adoption principle (raised in PR review) was designed to reward. The 18-month deadline is the shortest window in which multiple TradFi institutions can realistically be expected to close integration, and is requested as an explicit exception to the 9-month default with this rationale.

**Foundation collaboration.** Peaceful Studio leads all engineering and integration work and does not condition M4 acceptance on Foundation action. Realistic TradFi adoption against an 18-month deadline does, however, depend on relationship-building that materially benefits from Foundation cooperation. Peaceful Studio requests:
- Direct introductions to Canton-member institutions with .NET-heavy engineering stacks
- Inclusion of the SDK in SIG and Foundation-member communications and developer announcements
- Joint outreach where the Foundation runs institutional-developer programmes

This is a good-faith collaboration ask, not a precondition.

**Verification.** Adopter institutions are evidenced either publicly (named in a roster with their consent, corroborated by repo/press references) or privately (attestation to the Canton Foundation under confidentiality; Foundation confirms to the committee). The private path accommodates TradFi adopters that cannot publicly disclose their stack. Mainnet applications are evidenced by party IDs and on-chain submission. Adoption-enabling deliverables (DocFX site, ASP.NET Core sample, public launch) are evidenced by their public artefacts (deployed docs site, sample repo, dated launch announcement). Completion tranche: NuGet stats, GitHub insights, triaged-issue links.

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

----

## Acceptance Criteria

**Per the template framework introduced in PR #258, acceptance is based on demonstrated ecosystem value, not artifact delivery alone.** Each milestone above is bound to a measurable adoption gate (external developer feedback, NuGet downloads, named external integrations, GitHub engagement) — not a CI-passing or feature-complete checkbox.

The Tech & Ops Committee will evaluate completion based on:

- **Ecosystem-value gates met for each milestone** (see per-milestone deliverables — each ties funding to measurable adoption)
- Deliverables completed as specified for each milestone
- Demonstrated functionality and operational readiness
- Documentation and knowledge transfer provided

**Project-specific ecosystem-value conditions:**
- All code published as open source under Apache 2.0 license
- NuGet packages published and installable from the public NuGet feed — including the codegen tooling itself and pre-built `Canton.Splice.*` reference bindings for the published Splice DARs
- Integration tests passing against Canton LocalNet
- API documentation site deployed and accessible
- M4 ecosystem gates — adoption among regulated TradFi institutions (banks, custodians, exchange operators, asset managers) and external Canton applications using the SDK on mainnet — assessed per the deliverable + per-event tranche structure in M4 above

----

## Funding

**Total Funding Request:**

- **2,500,000 CC (~$375,000 USD) M1–M4 base**, split as:
  - 1,750,000 CC engineering — M1–M3 (open-source release, codegen migration, `Canton.Splice.*` NuGet packages, full Ledger + PQS API, cross-version compatibility verification by M3 acceptance, general hardening, Cure53 audit-remediation engineering)
  - up to 750,000 CC adoption — M4 (~30% of the base, mixing deliverable tranches for the adoption-enabling outputs — DocFX site, ASP.NET Core sample, public launch — with per-event tranches against TradFi-institution and external-application gates)
- **205,000 CC (~$30,700 USD)** — Cure53 security-audit line, held outside the M1–M4 envelope as a pass-through cost (see [Appendix C](#appendix-c--security-audit-cure53))
- **+150,000 CC (+20% on the M4 base)** — conditional acceleration bonus if all M4 gates are met within 15 months of grant approval (see §M4 *Acceleration bonus*)
- **300,000 CC per quarter (~$45,000 USD)** — ongoing maintenance under M5+

The M1–M4 base is sized at **0.5% of the Development Fund's annual allocation** (500M CC per CIP-0082). With the audit line and the M4 acceleration bonus both included, the **maximum M1–M4 total is 2,855,000 CC (~$428,250 USD)**.

### Cost Basis

The funding is structured as fixed-price milestones, scoped by deliverable complexity rather than time-and-materials. Each milestone includes engineering, infrastructure, testing, documentation, open-source compliance, and community engagement costs:

| Milestone | Engineering | Infrastructure & Tooling | Community & Adoption | Total |
|-----------|-------------|--------------------------|---------------------|-------|
| M1 | **JVM helper + codegen architecture migration to `daml-lf-archive` ([§2](#2-implementation-mechanics))**, SDK packaging, test hardening, NuGet publishing, auth packaging, **first two `Canton.Splice.*` packages with automated codegen pipeline** ($54K) | CI/CD pipeline, cloud CI runners, **NuGet org and namespace coordination, signing infrastructure, automated Splice-release-triggered publish** ($22K) | Quickstart docs, external developer onboarding for ecosystem gate, Foundation coordination ($14K) | **~$90K** |
| M2 | ~40 API endpoints across gRPC + HTTP, PQS client packaging, async streaming, **remaining `Canton.Splice.*` packages**, multi-synchronizer design commitments ([§3](#3-architectural-alignment--extending-daml--canton-into-the-net-ecosystem)) within the existing envelope ($55K) | Integration test environment (LocalNet, including a multi-synchronizer topology), API compatibility matrix, performance benchmarks ($22K) | End-to-end demo, community outreach, developer integration support ($17K) | **~$94K** |
| M3 | Cross-version compatibility verification by M3 acceptance (3.4.x today; 3.5 if released by M3 acceptance), pre-launch hardening & release engineering (signing, version pinning, NuGet metadata, release notes), Cure53 audit-remediation engineering ($58K) | Cross-version CI matrix exercised at M3 acceptance, release infrastructure ($13K) | Foundation coordination on launch readiness ($8K) | **~$79K** |
| M4 | DocFX API reference site, ASP.NET Core sample (Swagger / Scalar + Token Standard interface example), integration support for adopting institutions (up to $40K) | Adoption analytics & reporting infrastructure, sample-app hosting (up to $10K) | 18-month institutional outreach, launch coordination with Foundation marketing, adoption tracking and reporting, external-developer onboarding for the M4 validation gate, conference presence, Foundation co-engagement (up to $62K) | **up to ~$112K** (deliverable + per-event tranches; see §M4) |
| M5+ | Protocol compatibility updates, security patches, dependency maintenance, **automated Splice NuGet republish on every Canton/Splice release** ($26K) | CI/CD maintenance, test infrastructure ($9K) | Issue triage, PR reviews, quarterly adoption report ($10K) | **~$45K/quarter** |

**Partially-built versus net-new per milestone (addresses prior reviewer ask on cost-vs-scope):**

| Milestone | Partially built (PoC exists in private code) | Net-new (this grant funds it) |
|---|---|---|
| M1 | Codegen prototype (single-DAR happy path, direct LF-protobuf parsing), gRPC client foundation, OAuth2/JWT authentication, runtime library covering core Daml types | Open-source release, CI/CD across the production targets, NuGet publishing infrastructure, automated Splice-release-triggered codegen + publish, **JVM helper wrapping `daml-lf-archive` (replaces the PoC's direct-proto parsing — [§2](#2-implementation-mechanics))**, `dpm codegen-cs` component publication, quickstart documentation + small CLI smoke-test |
| M2 | A subset of the gRPC and JSON endpoints exercised by Peaceful Studio's own application; an early PQS prototype | Full ~40-endpoint gRPC + JSON API surface, full PQS client with typed payload filtering, async streaming with backpressure / cancellation / fault tolerance, multi-synchronizer typed-event handling, integration tests against LocalNet |
| M3 | None | Cross-version compatibility verification by M3 acceptance (3.4.x today; 3.5 if released by M3 acceptance), pre-launch hardening & release engineering, Cure53 audit hosted in this window |
| M4 | None | DocFX-driven API reference site, ASP.NET Core sample (C# equivalent of cn-quickstart, with a Token Standard interface example), coordinated public launch, 18-month TradFi-institution outreach + integration support, community engagement |
| M5+ | None | Ongoing protocol-compatibility tracking, security patches, dependency maintenance, automated Splice republish, quarterly reporting |

**Other notes:**
- The proof-of-concept prototypes de-risk the proposal by confirming the technical approach is sound. The funding covers the substantial engineering required to reach production quality: full API coverage, reliability on the production targets (Windows x64 and Linux Arm64) with macOS Arm64 covered for developer experience, comprehensive test coverage, robust error handling, documentation, sample applications, and community adoption.
- Engineering costs reflect the niche intersection of C#/.NET expertise, distributed ledger protocol engineering, and Canton/Daml-specific domain knowledge. The proposer has 15+ years of C#/.NET experience in capital markets and fintech, a proven track record of team and project leadership with 6 years as a CTO of a digital exchange, and direct Canton development experience since mid-2025.
- Infrastructure costs include cloud CI runners across multiple platforms and architectures, participant node access, documentation hosting, and testing environments.
- Community & adoption costs increase in later milestones as the focus shifts from building to ecosystem engagement.

### Cost Comparison with Similar Proposals

| Proposal | Scope | Funding |
|----------|-------|---------|
| Go SDKs + Python DAZL (#38, Noders) | Go gRPC client + codegen + wallet SDK + Python patches + Cure53 security audit. | 2,260,000 CC |
| **This C# SDK (#46)** | **C# codegen + gRPC + JSON API + PQS + cn-quickstart equivalent + cross-platform CI + cross-version compatibility verification + adoption + Cure53 security audit.** | **2,500,000 CC engineering + 205,000 CC audit = 2,705,000 CC all-in** |
| DAR-to-TypeScript Codegen (#74) | Single-purpose codegen tool (TypeScript only) | 330,000 CC |
| Canton dApp SDK (#69, Digital Asset) | TypeScript dApp-to-wallet SDK (CIP-0103), different stack layer | 8,170,000 CC |

This proposal delivers broader scope than the Go SDK (additional JSON API client, PQS client, production-target CI matrix) for a comparable total cost, with funding tied to per-milestone ecosystem-adoption gates. The Cure53 security audit is budgeted at **205,000 CC (~$30,700 USD)** and is held as a separate audit-cost line outside the M1–M4 engineering envelope — see [Appendix C](#appendix-c--security-audit-cure53). The NODERS Go SDK audit precedent under #38 came in at ~160,000 CC / $24K; the ~28% uplift here reflects both the broader application scope being audited (full client surface across gRPC, JSON API, and PQS, plus the JVM helper) and a deliberate 2 PD buffer over Cure53's nominal effort estimate to absorb scope adjustments and code growth between quote and audit start.

### Payment Breakdown by Milestone

| Milestone | Payment | % of M1–M4 |
|---|---|---|
| M1 — Open-Source Release & Core | 600,000 CC upon committee acceptance | 24% |
| M2 — Full API Coverage + PQS | 625,000 CC upon committee acceptance | 25% |
| M3 — Stabilisation, Audit & Compatibility Verification | 525,000 CC upon committee acceptance | 21% |
| M4 — Adoption & Ecosystem Integration | up to 750,000 CC, mixing deliverable + per-event tranches | up to 30% |
| **Total M1–M4 engineering (base)** | **2,500,000 CC** | **100%** |
| Cure53 security audit (pass-through, see Appendix C) | 205,000 CC paid alongside M3 acceptance | (separate) |
| M4 acceleration bonus (conditional, see §M4) | +150,000 CC if all M4 gates met within 15 months of grant approval | (+6% of M1–M4 engineering base) |
| **Maximum total M1–M4 (engineering + audit + acceleration)** | **up to 2,855,000 CC** | — |
| M5+ — Quarterly Maintenance | 300,000 CC per quarter upon committee acceptance | (separate) |

**Milestone 1 (24%) — 600,000 CC upon committee acceptance.** *Establishes the open-source project, CI/CD across platforms, NuGet publishing, and migrates the codegen toolchain onto the `daml-lf-archive` JVM-helper architecture so the SDK inherits per-LF-version decoders, package-hash computation, and DAR-level structure handling from the upstream library. Foundational infrastructure that de-risks all subsequent milestones.*

**Milestone 2 (25%) — 625,000 CC upon committee acceptance.** *Heaviest single-engineering milestone — full Ledger API surface across both gRPC and JSON protocols, PQS client, async streaming. Engineering scope unchanged from the prior revision; the modest reduction reflects amortization with the M1 codegen-toolchain foundation, with the JVM helper and `Canton.Splice.*` packaging in place after M1 the per-endpoint marginal effort drops.*

**Milestone 3 (21%) — 525,000 CC upon committee acceptance.** *Stabilisation, audit, and compatibility verification — the gate between "the SDK is feature-complete" (M2) and "the SDK is ready for adoption" (M4). Delivers cross-version compatibility verification against every Canton release live at M3 acceptance (3.4.x today; 3.5 if released by acceptance) and pre-launch release engineering (signing, version pinning, NuGet metadata, release notes). M3 also hosts the Cure53 security audit window between M2 acceptance and M3 acceptance — see [Appendix C](#appendix-c--security-audit-cure53). Adoption-enabling outputs (DocFX site, ASP.NET Core sample, public launch) sit in M4 with the adoption events they exist to enable.*

**Milestone 4 (up to 30%) — up to 750,000 CC, mixing deliverable and per-event tranches:**
- **100,000 CC** per regulated TradFi institution integrating the SDK against a Canton network — up to 3 institutions = **300,000 CC**
- **100,000 CC** per external application using the SDK on Canton mainnet — up to 2 applications = **200,000 CC**
- **250,000 CC** on full milestone completion — bundles the adoption-enabling deliverables (DocFX site live, ASP.NET Core sample published, external-developer validation gate met, public launch coordinated) with the secondary adoption gates (≥500 NuGet downloads across ≥3 unique organisations, ≥5 external GitHub issues/PRs, ≥3 community-reported issues triaged through to resolution)

*Per-event count (3 TradFi institutions + 2 applications) follows the adoption-gate framing raised in PR review. Per-event payouts ensure that payouts are proportional to demonstrated adoption rather than gated on a single binary trigger that risks forfeiting the entire M4 tranche if one named adopter doesn't close in time. The 250,000 CC completion tranche bundles the adoption-enabling deliverables (DocFX site, ASP.NET Core sample, public launch, external-developer validation gate) with the secondary adoption gates (NuGet downloads, GitHub engagement, community-issue triage) into a single committee-acceptance event. The adoption-enabling deliverables are built and shipped as M4 commitments — not contingent on the per-event adoption tranches firing. Deadline, Foundation-collaboration framing, and acceleration bonus in §M4.*

**Milestone 5+ — 300,000 CC per quarter upon committee acceptance.** *SDKs without active maintenance become liabilities. Covers protocol compatibility, security patches, dependency updates, and community support.*

> *Context: The base M1–M4 engineering ask of 2,500,000 CC is unchanged from the prior revision and represents 0.5% of the Development Fund's annual allocation of 500M CC (per CIP-0082). With the 205,000 CC Cure53 audit line and the conditional M4 acceleration bonus both included, the maximum reaches 2,855,000 CC (≈0.57% of annual allocation). The internal split (M1 24% / M2 25% / M3 21% / M4 up to 30%) is computed against the 2,500,000 CC engineering base and is reweighted toward the adoption milestone in line with recent dev-fund decisions on comparable SDK grants. The Cure53 audit sits outside that split as a pass-through cost. USD equivalents are based on a CC/USD rate of $0.15 as of May 2026; the audit line additionally references EUR/USD = 1.18 against Cure53's €26,000 budgeted ceiling (see [Appendix C](#appendix-c--security-audit-cure53)).*

### Volatility Stipulation

M1–M3 engineering delivery spans approximately 6 months from grant approval. M4 then opens on M3 acceptance and runs with an 18-month deadline from grant approval per §M4. The grant is denominated in fixed Canton Coin and will require a re-evaluation at the 6-month mark per the standard template clause — which falls at approximately M3 acceptance — and a second re-evaluation at the 12-month mark to cover the extended M4 window. The quarterly maintenance milestone (M5+) is re-evaluated each quarter by default at the then-current CC/USD rate. The Cure53 audit line additionally carries an EUR exposure — the 205,000 CC figure is locked at signing against Cure53's €26,000 budgeted ceiling at EUR/USD = 1.18, and any drift between signing and Cure53 invoicing is reconciled at the same standard review points rather than mid-audit. The re-evaluation points also cover scope reality: if the multi-synchronizer surface or the Canton 3.5 transition demands materially more engineering than envelope-priced, that is raised at the same review.

**Schedule contingency.** Estimated delivery windows in the milestone definitions above are engineering best-effort estimates, not contract deadlines. M3 in particular carries audit-driven calendar variability — security findings that require structural fixes cannot be compressed into a fixed window without compromising remediation quality, so M3 acceptance can land later than the 7-week estimate without that constituting a milestone breach. M1–M3 base payments are tied to committee acceptance of the deliverables specified in §Milestones, not to specific calendar dates. The only hard deadline in this proposal is the 18-month M4 deadline (per §M4); the 15-month M4 acceleration target is a conditional bonus, and missing it forfeits the bonus only — not the base M4 tranche, and not any prior milestone.

----

## Co-Marketing

Upon release, the implementing entity will collaborate with the Foundation on:

- **Announcement inclusion** in the quarterly Development Fund achievements report
- **Link placement** in official Canton developer documentation under "Language SDKs"
- **Social media amplification** of the launch announcement
- **Featured project status** on the Canton Foundation grants/ecosystem page
- **Joint webinar** (optional) introducing the SDK to the .NET developer community

----

## Motivation

### The Gap

Canton Network currently provides official SDKs for TypeScript/JavaScript (dApp SDK, wallet integrations), Java/Scala (via the Daml SDK and codegen), and Python (limited, community-driven). There is **no official or community C# / .NET SDK** — the language quadrant that Canton's institutional target market depends on most.

- **TradFi institutions are Microsoft-first.** Banks, asset managers, custodians, exchange operators and the back-office / settlement systems integrating with them run on .NET on Windows. Their engineering organisations are organised around Microsoft tooling — Visual Studio, MSBuild, NuGet, Active Directory / Entra ID, SQL Server, .NET on Windows Server in production, with .NET on Linux containers as the cost-efficient deployment target. Providing a first-class C# / .NET toolchain directly speeds the movement of these institutions onto Canton Network; expecting them to rebuild around Java or TypeScript does not.
- **.NET sits in the top six GitHub languages.** [Octoverse 2025](https://octoverse.github.com/) — Python, JavaScript, TypeScript, Java, C# and C++ together cover nearly 80% of new repositories, and ASP.NET Core is used by [~21% of professional developers](https://survey.stackoverflow.co/2025/technology) (Stack Overflow 2025).
- **Windows is the critical platform for TradFi.** The proposal therefore treats Windows x64 as the primary production target (with Linux Arm64 as the cost-efficient cloud-runtime target), rather than aligning the CI matrix around developer-laptop platforms.

Digital Asset previously maintained C# bindings ([`daml-net`](https://github.com/digital-asset/daml-net)) with contributions from Canton ecosystem participants including Calastone, but **archived the project in January 2025** without ever publishing NuGet packages — leaving the .NET ecosystem entirely unserved. That project targeted the pre-Canton Daml SDK 1.x API surface, which has since been superseded by the Canton 3.x Ledger API. This proposal offers a **more complete solution** — full codegen against the modern LF semantics, a dual-protocol client (gRPC + JSON), PQS support, and OAuth2/JWT authentication — built from scratch against the Canton 3.x API.

### Quantitative Ecosystem Benefit

Per the template guidance in PR #258, a benefit estimate calls for *"the portion of the ecosystem that benefits"*. We provide a layered estimate, separating what is sourced from what is reasoned:

**Sourced data points:**

- The [2026 Canton Developer Survey](https://forum.canton.network/t/canton-network-developer-experience-and-tooling-survey-analysis-2026/8412) (41 respondents) identifies **"typed SDKs & language bindings"** as a high-priority gap. **83% of respondents come from TradFi or Hybrid backgrounds.**
- DA's archived `daml-net` project received contributions from **Calastone engineers** — direct evidence that an institutional Canton Foundation founding member actively sought .NET tooling and contributed engineering time when the option was available.

**Reasoned estimate:**

- Canton's named institutional adopters include **HSBC** (Orion tokenized bonds), **Goldman Sachs** (GS DAP), **BNP Paribas** (Neobonds), **Calastone** (fund tokenization, founding member), and **Broadridge** (founding member). .NET is broadly used across capital-markets back-office, trading, and integration workloads at firms of this profile, so it is plausible that some share of their Canton-adjacent engineering teams are .NET-primary — but we do not have per-firm stack disclosures and are not in a position to quantify that share.
- For any team whose primary stack is .NET, the absence of a NuGet-distributed Canton SDK forces a choice between standing up a Java/TypeScript bridge or hand-rolling JSON-API clients. We have encountered this friction first-hand (see "Direct experience" below) and it is consistent with the survey's "typed SDKs & language bindings" gap; we cannot, however, generalise from our own experience to a population-level estimate.
- The Foundation has not published a per-respondent language breakdown of the 41-respondent developer survey. We commit to publishing an updated benefit estimate at M1 once the SDK has shipped and adoption signals (NuGet downloads, named integrations) are observable.

**What this proposal expects to enable:** every C# / .NET integration with the Splice ecosystem (Canton Coin transfers, Token Standard interactions, validator-lifecycle operations, DSO governance) goes from *days of vendoring DARs and hand-rolling clients* to *a single `dotnet add package Canton.Splice.Wallet`*. The benefit compounds across every future C# Canton integration — measured not as "X% of dApps" but as a meaningful reduction in the integration cost faced today by any team whose primary stack is .NET.

**Direct experience and named blocked teams.** The proposer has first-hand experience of the friction this SDK eliminates: as CTO at **Trakx** (a Canton validator operator with a C#/.NET back-office stack), the team had to reverse-engineer the JSON Ledger API by capturing Java SDK traffic, manually translate payloads to C# types, and hand-model every Daml record / variant / contract-ID type. Trakx is now one of two Canton validator deployments **Peaceful Studio** runs for institutional clients on C#/.NET stacks; the other client faces the same friction today, and a further C#/.NET-shop integration is queued behind the public release of this SDK. Concrete artefact-level evidence of the work already done privately is the [`peacefulstudio/canton-ledger-api-csharp`](https://github.com/peacefulstudio/canton-ledger-api-csharp) gRPC client, in production use against Canton LocalNet and DevNet — this proposal funds bringing that and the four other private building blocks (codegen, PQS client, auth, runtime library) to a public, supported, full-coverage SDK rather than letting each new C# integration repeat the same wrapper layer. References for both client deployments are available to the committee on request.

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
| Daml-LF format changes | Codegen wraps `daml-lf-archive` rather than reimplementing LF parsing in C# (see [§2](#2-implementation-mechanics)) — per-LF-version decoders, package-hash computation, and DAR-level structure handling are inherited from the upstream library Canton itself uses, so an LF change is a JVM-helper update rather than an SDK rewrite. |
| Canton API breaking changes | Close collaboration with OSS maintainers; early access to release candidates; cross-version compatibility matrix exercised in CI |
| **Multi-synchronizer surface evolution** | Treated as a v1 design constraint ([§3](#multi-synchronizer-readiness-design-intent--not-yet-implemented)): typed `Unassigned` and `Assigned` events surfaced as distinct cases (per the Ledger API), synchronizer scoping on stream / query metadata, and 3.5 `synchronizer_id` format compatibility added to the cross-version test matrix whenever Canton 3.5 lands. Multi-synchronizer scenarios join the M2 integration-test target. |
| Low adoption | Adoption milestones with ecosystem gates ensure funding is tied to real usage, not just delivery |
| Maintainer availability | Maintenance milestone ensures ongoing commitment; documentation enables community takeover if needed |
| Cross-platform issues | CI matrix covers the production targets (Windows x64, Linux Arm64) plus macOS Arm64 as a developer-experience target, exercised from M1 |
| Security defects in client-side code paths | Independent third-party security audit (Cure53) — quote received, budgeted at 20 PD / €26,000 / 205,000 CC (includes 2 PD buffer over nominal scope), scheduled into M3 — see [Appendix C](#appendix-c--security-audit-cure53) |

----

## Rationale

### Why C# / .NET

.NET on Windows is the dominant platform for the TradFi institutions Canton is built to serve — banking, asset management, custody, settlement, exchange operations. The Canton-adjacent teams inside those institutions are organised around the Microsoft toolchain (Visual Studio, MSBuild, NuGet, Entra ID, SQL Server, .NET on Windows Server / Linux containers). For those teams the absence of a native SDK is not a tooling-preference question — it is a hard adoption hurdle, because internal package-feed, signing, security-scan, and supply-chain-review processes are wired around NuGet and the .NET runtime. A first-class C# SDK removes that hurdle; expecting these teams to rebuild around Java or TypeScript does not.

### Why This Approach

The SDK uses **the protos as the source of truth, not the OpenAPI spec**. The Canton Ledger API is defined in `.proto` files; the JSON Ledger API is a downstream tapir-generated artefact, and pointing a generic OpenAPI generator at it produces a client riddled with structural defects (numbered duplicate schemas, single-key `oneOf` wrappers without discriminators, inline-duplicated enums, untyped DAML payload fields — full evidence in [Appendix B](#appendix-b--why-a-generic-openapi-generator-is-not-enough)). The gRPC client is therefore the primary path, generated directly from the protos via `Grpc.Tools` + `Google.Protobuf`. A thin HTTP / JSON path covers the small set of admin / health endpoints that have no gRPC equivalent — this is *not* a redundant second client surface; it is a hand-written supplement for the handful of endpoints that exist only in the JSON spec. The PQS client adds a third query path on top of DA's PQS, replacing stringly-typed JSONB navigation with rename-safe expression-tree predicates over the codegen-emitted record types — mechanism in [§2 — What the PQS client adds](#client-architecture), worked example in [§A.9](#a9--querying-active-contracts-via-pqs-typed-no-sql). The codegen-first design (DAR → C# via `daml-lf-archive`, see [§2](#2-implementation-mechanics)) mirrors the proven Java SDK pattern, giving .NET developers the same type-safe experience. Publishing to NuGet — the standard .NET package manager — ensures frictionless adoption via `dotnet add package`.

### Why This Proposer

This SDK was born from direct need — the proposer needed C#/.NET tooling to build Canton applications and no SDK existed. The proposer has 15+ years of C#/.NET experience in capital markets and fintech (SocGen, UBS, Credit Suisse, Bluecrest), 6 years as CTO of a digital exchange, and has been an active Canton Network participant deploying validators and building applications on Canton since mid-2025.

GitHub: [github.com/monsieurleberre](https://github.com/monsieurleberre)

### Long-Term Sustainability

**Current model:** Peaceful Studio maintains the SDK as the primary steward, with maintenance funded via quarterly grants (M5+, 300,000 CC/quarter) subject to committee review.

**If adoption grows:** The SDK is open-source (Apache 2.0) from day one, enabling community contributions from the start. Growing adoption is an argument for *broadening the maintainer pool*, not for Peaceful Studio stepping back — the natural responses to scale are admitting community co-maintainers under the Canton Foundation's governance, expanding the test matrix, and tightening the release cadence, all of which keep Peaceful Studio in place as primary steward.

**Stewardship-transfer triggers.** Peaceful Studio commits to initiating a stewardship-transfer conversation only when Peaceful Studio's capacity to maintain the SDK at the committed cadence is impaired — acquisition, change of strategic direction, or key-person departure without a credible internal succession plan — or by mutual agreement with the Foundation. The transfer model mirrors PQS / DA-originated-tools handover: repository ownership moved to the `canton-foundation` GitHub org, NuGet org admin rights co-managed during a transition quarter, and the M5+ maintenance-grant beneficiary updated to whichever entity the Foundation designates as steward.

**If maintenance funding is not renewed:** The SDK remains fully functional as a standalone library consuming stable Canton APIs (Ledger API v2, JSON API v2). Published NuGet packages remain available indefinitely. The codegen depends on `daml-lf-archive`'s decoding semantics (see [§2](#2-implementation-mechanics)), so existing generated code continues to compile and run against any LF version the underlying archive can read. Comprehensive XML docs, the DocFX site, and ≥80% test coverage reduce the bus factor ("what if the author gets hit by a bus?"), enabling any experienced .NET developer to maintain the SDK. In short: the SDK degrades gracefully without active maintenance — it doesn't break, it just doesn't track new Canton releases.

### Comparison with Existing SDKs

| Feature | Java SDK | TypeScript SDK | This C# SDK |
|---------|----------|----------------|-------------|
| Codegen | ✅ | ✅ | ✅ |
| gRPC client | ✅ | ❌ | ✅ |
| JSON API client | ✅ | ✅ | ✅ |
| Typed PQS client¹ | ❌ | ❌ | ✅ |
| Streaming | ✅ | ✅ (WebSocket) | ✅ (IAsyncEnumerable) |
| Pre-built Splice packages | ❌ | ❌ | ✅ (`Canton.Splice.*` NuGet) |

¹ PQS (Participant Query Store) is a separate Digital Asset tool, not part of any official language SDK; the C# SDK is the only one shipping a typed client wrapper for it.

----

## Appendix A — What Canton Development Looks Like in C#

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

No magic strings, no raw JSON, no separate command-builder step — the call site is a single typed method invocation that returns a structured outcome (see [§A.6](#a6--structured-outcome-handling)).

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

**Reassignment (multi-synchronizer, design intent under M2 — see [§3 — Multi-synchronizer readiness](#multi-synchronizer-readiness-design-intent--not-yet-implemented)).** Reassignment surfaces on the ledger as two distinct events: an `Unassigned` on the source synchronizer and an `Assigned` on the target. `ContractEvent<T>` will gain both as typed cases alongside `Created` and `Archived`:

```csharp
case ContractEvent<Iou>.Unassigned(var cid, var sourceSync, var offset):
    await OnIouLeftSynchronizer(cid, sourceSync);
    await PersistOffset(offset);
    break;

case ContractEvent<Iou>.Assigned(var cid, var iou, var targetSync, var offset):
    await OnIouArrivedFromOtherSynchronizer(cid, iou, targetSync);
    await PersistOffset(offset);
    break;
```

This shape lets consumers handle "the contract just left the visible synchronizer" and "the contract just arrived from another synchronizer" as typed branches rather than as silently dropped or unexplained contracts. The cases land under M2; the API shape above is design intent, not shipped capability.

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

## Appendix B — Why a generic OpenAPI generator is not enough

The Canton JSON Ledger API ships an OpenAPI 3.0.3 document, so in principle one could point `openapi-generator-cli`, NSwag, or Kiota at it and get a C# client. We did exactly that as a feasibility check against the published spec (8,707 lines, version `3.5.1-SNAPSHOT`). The spec carries four specific structural defects — all artefacts of the proto → tapir-JSON → OpenAPI translation pipeline — that any generic generator faithfully reproduces and hands to the consumer. The result is a client that compiles but is hostile to use.

**1. Numbered duplicate schemas from name collisions.** Forty-plus types appear with `1` / `2` / `3` suffixes that have no semantic meaning — duplicates of the same logical type, kept distinct because the underlying proto messages collide once the proto namespace is flattened for JSON. Examples include `Empty1` … `Empty10` (eleven copies of the empty object, every one identical: `title: Empty`, `type: object`, no properties), `DeduplicationPeriod1` and `DeduplicationPeriod2` (same shape, distinguished only by referencing different numbered duration variants), `Command1`, `Reassignment1`, `Update1`, `Completion1`, `OffsetCheckpoint1` / `2` / `3`, `WildcardFilter1`, `TemplateFilter1`, `InterfaceFilter1`, `AssignCommand1`, `UnassignCommand1`, and a long tail. A C# generator emits these verbatim — consumers have no way to tell from the type name which endpoint expects which numbered variant. This is not a generator bug; it is the spec asking for it.

**2. Single-key `oneOf` wrappers around discriminated unions.** Eighteen `oneOf` sites in the spec follow the same anti-pattern: each branch is an object with exactly one required property whose name is the discriminator (a JSON envelope shape that emulates protobuf `oneof` over the wire — `{"DeduplicationDuration": {...}}`). They carry no `discriminator` keyword, so the C# generators in common use (NSwag, Kiota, `openapi-generator-cli`) fall back to "try each branch" deserialisation — brittle when branches share field names, and surfaced as `OneOf<A, B, C>` envelopes or hand-rolled `JsonConverter`s rather than a clean discriminated union. The runtime cost is negligible against IO; the issue is the C# type the consumer ends up writing against. The proto `oneof` it descends from maps directly to a generated `WhichCase` enum and accessor pattern in `Google.Protobuf` — no wrapper class, no fallback parsing.

**3. Inline enums duplicated across endpoints.** Enums are not extracted into named schemas; they are inlined at every use site. `HASHING_SCHEME_VERSION_UNSPECIFIED / V2 / V3` appears inline inside one request schema, then again inside a different request schema. The same is true for `PARTICIPANT_PERMISSION_*`, `SIGNING_ALGORITHM_SPEC_*`, `PACKAGE_STATUS_*`, and a long list of others spread across the 370 `type: string` declarations in the file. A C# generator emits one enum *per occurrence*, so the consumer ends up with `HashingSchemeVersionEnum`, `HashingSchemeVersionEnum2`, `HashingSchemeVersionEnum3` — none of which are mutually assignable, even though they hold the same values. The proto source has one enum definition and one generated C# enum.

**4. Untyped DAML payload fields.** Where the proto uses `google.protobuf.Value`-shaped structured records for DAML payloads, the OpenAPI translation drops the type entirely. `CreateAndExerciseCommand.createArguments` and `CreateAndExerciseCommand.choiceArgument` are declared with a `description:` only — no `type:`, no `$ref:`. OpenAPI generators emit these as `object` / `System.Text.Json.JsonElement` / `Newtonsoft.Json.Linq.JToken`. The DAML-codegen-emitted record cannot flow into the call without a hand-written adapter at every site. In the proto path, the same field is a typed `Value` record that pairs naturally with the codegen output.

### What this means for any generic OpenAPI generator

`openapi-generator-cli`, NSwag, and Kiota are all faithful: they reproduce what the spec says. Pointed at this document they yield a client that has eleven `Empty` classes, two `DeduplicationPeriod` classes, three independent `HashingSchemeVersion` enums, and `object`-typed DAML payloads — wrapped in a deserialisation strategy that has to fall back to "try each branch" for every `oneof`. The author of every consumer application then writes the same wrapper layer to make it usable. A funded SDK that ships *that* surface to .NET developers would fail the "what is this adding over a generic generator?" question by design.

### Why protos are the better source of truth

1. **The protos are the source of truth; the OpenAPI is a downstream artifact.** Canton's API is defined in `.proto` files; the JSON Ledger API is a tapir-generated HTTP wrapper. Every defect listed above is damage introduced by the proto → JSON → OpenAPI translation, not present in the original schema. Generating from the proto skips an entire stage of lossy translation.
2. **Protobuf's type system maps cleanly to C#.** `oneof` becomes a discriminated union with a proper `WhichOneofCase` enum — no fragile single-key JSON detection. `enum` becomes a single C# enum per definition. `int64` is `long`, `bytes` is `byte[]`, `map<K,V>` preserves key types. Schema evolution rules (field numbers, reserved tags) are enforced by the compiler.
3. **The codegen story is mature and already in use.** `Grpc.Tools` + `Google.Protobuf` is the standard .NET gRPC stack — battle-tested, integrated into MSBuild, generates both client and server stubs. Peaceful Studio already maintains `peacefulstudio/canton-ledger-api-csharp` doing exactly this.
4. **Streaming is first-class.** Transaction streams, ACS streams, completion streams — all of these are gRPC server-streaming RPCs. Over JSON HTTP you get a long-polling-ish chunked response that the OpenAPI spec can barely describe. Over gRPC you get `IAsyncEnumerable<T>` with proper backpressure, deadlines, and cancellation.
5. **Wire efficiency matters at validator scale.** Protobuf encoding is 3–10× smaller than equivalent JSON, parsing is faster, and HTTP/2 multiplexes streams over a single connection. For a participant node sustaining hundreds of TPS, the JSON path is a real CPU and bandwidth tax.
6. **Deadlines and cancellation propagate.** A gRPC deadline set on `submitAndWait` flows through to every downstream call and cleanly cancels the chain on timeout. The JSON Ledger API can't express this — you wire up your own `CancellationToken`-to-HTTP-timeout plumbing and hope it works under load.
7. **The DAML payload story is actually better in proto.** The OpenAPI fields (`createArguments`, `choiceArgument`) are completely untyped — generators emit `object`. In proto, the equivalent fields are `google.protobuf.Value`-style structured records — still dynamic, but with a defined shape that pairs naturally with the DAML codegen output.

### Honest counter-arguments

- **Browsers can't speak gRPC.** True; for a SPA you need grpc-web + a proxy. Not relevant for validator / back-office integration, which is the target.
- **Debugging is harder over gRPC.** No `curl`; the equivalents are `grpcurl` or `buf curl`. Worth the tradeoff once a team learns the tools.
- **A handful of admin / health endpoints exist only in the JSON Ledger API.** Acknowledged. The SDK hand-writes thin clients for those rather than running OpenAPI codegen across the full surface.

### Bottom line

Generate the C# Ledger API client from the protos. The codegen pipeline already exists in `peacefulstudio/canton-ledger-api-csharp`; validator infrastructure is exactly the workload where streaming and wire efficiency matter; and the OpenAPI spec is materially worse than what `Grpc.Tools` produces from the same upstream definitions. The only reason to touch the JSON Ledger API is for the handful of endpoints that don't exist in gRPC — and for those, a hand-written thin client beats running OpenAPI codegen.

### Postscript — preferred future direction (upstream fix), with the protos-primary plan as the backup

After drafting the appendix above we ran a working experiment: a small upstream PR to `digital-asset/canton` adding `google.api.http` annotations to the v2 service protos makes the OpenAPI regenerable cleanly from the proto source, eliminating all four defects at the root. Side-by-side render on SwaggerHub: [before](https://app.swaggerhub.com/apis/peacefulstudio/json-ledger-api-http-endpoints/3.5.1-SNAPSHOT-oas3) vs [after](https://app.swaggerhub.com/apis/peacefulstudio/canton-http-annotations/1.0). Branches and write-up:

- [`peacefulstudio/canton#1`](https://github.com/peacefulstudio/canton/pull/1) — `CommandService` proof-of-concept (3 RPCs), with reproducible flow and burden-of-evidence artefacts.
- [`peacefulstudio/canton#2`](https://github.com/peacefulstudio/canton/pull/2) — full-coverage attempt across the v2 service surface. Currently open, not yet defect-free for every endpoint.
- Companion write-up: [`openApi/upstream-fork-experiment.md`](openApi/upstream-fork-experiment.md).

**If those PRs land upstream in time**, the SDK's JSON HTTP client switches to Kiota-generated off the regenerated clean OpenAPI, with a small (~30 line) `JsonSerializerOptions` adapter for two residual wire-format details (`int64`-as-string per proto-JSON, oneof envelope encoding). This is the preferred future direction.

**If they do not land in time** — or if open issues from PR #2 take longer to resolve than the SDK's delivery window — the proposal as written above remains the plan: protos as source of truth, gRPC primary, hand-written thin clients for the handful of JSON-only endpoints. The SDK ships either way; the upstream fix is a Canton-ecosystem improvement we contribute opportunistically, not a delivery dependency.

----

## Appendix C — Security audit (Cure53)

The Go SDK proposal (#38) had a third-party security audit by Cure53 added during committee review. The same reasoning applies here: an SDK that TradFi institutions will integrate against Canton on .NET on Windows must clear independent security review before any regulated counterparty can ship it into production. This appendix preempts the request.

**Scope communicated.** A quote request was sent to `hello@cure53.de` on the 12th of May 2026 covering codegen, gRPC and JSON API clients, PQS client, authentication, and the JVM helper — approximately 13,000 LOC of production C# across `peacefulstudio/canton-ledger-api-csharp` (~3,600 LOC) and `peacefulstudio/daml-codegen-csharp` (~9,000 LOC), plus the Scala JVM helper wrapping `daml-lf-archive` delivered under M1/M2.

**Quote received (12 May 2026).** Cure53 returned a budgeted effort ceiling of **20 person-days at €26,000** (≈$30,700 USD ≈ **205,000 CC** at CC/USD = $0.15 and EUR/USD = 1.18; ECB closing rate on 11 May 2026: 1.1765), structured into four white-box pen-test + code-audit work packages plus admin / fix verification, with 2 PD reserved as a buffer to absorb scope adjustments and code growth between quote and audit start:

| Work package | Scope | Effort |
|---|---|---|
| WP1 | Canton .NET codegen and DAR parsing (including the Scala JVM helper wrapping `daml-lf-archive`) | ~5 PD |
| WP2 | Canton .NET gRPC client and authentication | ~4 PD |
| WP3 | Canton .NET HTTP / JSON client and PQS | ~4 PD |
| WP4 | Canton .NET runtime and bindings | ~3 PD |
| — | Project admin, report writing, fix verification | ~2 PD |
| — | Reserved buffer (scope adjustments / code growth between quote and audit start) | ~2 PD |

The budgeted ceiling sits ~28% above the NODERS Go SDK Cure53 precedent (~$24,000 USD / 160,000 CC under proposal #38). The uplift covers two distinct effects: (a) the broader application scope being audited here — full client surface across gRPC, JSON API, and PQS, plus the JVM helper — versus the Go envelope; and (b) the 2 PD safety buffer Cure53 added on top of the 18 PD nominal scope to keep the audit fee fixed in the face of M2/M3 code-surface growth between signing and audit start. The work packages map onto the M1–M3 deliverables of this proposal end-to-end, with no gap and no overlap.

**Quoting against scope that is still being written.** A meaningful share of the M1–M3 surface — full JSON API coverage, the PQS client, and the JVM helper — only reaches its audited form at M2/M3 completion, so the quote necessarily covers planned scope and LOC estimates rather than a final code drop. This is intentional, not an oversight: waiting until M3 to commission the audit would push the audit itself past the M3 window and defer the security review that institutional adopters expect. The 2 PD safety buffer Cure53 added on top of the 18 PD nominal scope is sized precisely to absorb that movement, and is held within the 205,000 CC envelope rather than billed separately. If the final code surface materially exceeds the LOC estimate above and consumes the buffer, the delta is raised at the standard re-evaluation point per §Volatility Stipulation rather than mid-audit.

**How the audit fits into this proposal.**

- **Remediation engineering — absorbed within the existing envelope, with severity-tiered turnaround.** Fixing findings from a Cure53 review is the same hardening work the M1–M3 Cost Basis already funds: test hardening (M1), defensive validation across the full ~40-endpoint API surface (M2), and authentication and serialisation paths (M1/M2). Peaceful Studio commits to landing all audit remediation within the M1–M3 engineering base of 1,750,000 CC, with the following turnaround relative to Cure53 report delivery:
  - **Critical / High-severity findings:** patched within **30 days**, prioritised over in-flight engineering work; security advisory published in the same window.
  - **Medium-severity findings:** remediated within **60 days**.
  - **Low / Informational findings:** rolled into the next scheduled minor release within the M5+ maintenance window.

  No new milestone, no scope cut on §M1–§M3 deliverables, no shifted M1 or M2 dates.
- **Cure53 vendor fee — 205,000 CC, separate audit-cost line.** The fee is a pass-through cost held outside the M1–M4 engineering envelope and outside the M4 acceleration calculation. It is paid alongside M3 acceptance against Cure53's invoice. The CC amount is locked at signing using the standard $0.15/CC rate and an EUR/USD reference of 1.18 against Cure53's €26,000 budgeted ceiling (20 PD = 18 PD nominal + 2 PD scope/code-growth buffer).

**Timing.** The audit slots into M3, between M2 acceptance (full API coverage shipped) and M3 acceptance, ahead of the M4 public launch — so findings are remediated against the API surface institutions will actually consume rather than a moving target.

**Why proactively.** Asking for the audit ourselves rather than waiting for committee request accelerates the timeline (removing the back-and-forth that delayed #38), lets us coordinate scope with Cure53 directly rather than inheriting a scope written by someone less familiar with the codebase, and signals that institutional security-review expectations are being met from the start.

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
- [ECB euro reference exchange rate — USD](https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/eurofxref-graph-usd.en.html) — source for the EUR/USD closing rate (1.1765 on 11 May 2026) underpinning the Cure53 audit-line FX lock in §Funding and Appendix C

----

*This proposal is submitted for consideration under the CIP-0100 Development Fund governance process.*
