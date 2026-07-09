## Development Fund Proposal — Rust SDK for Canton Network

**Author:** NODEJUMPER (https://nodejumper.io/)  
**Status:** Approved
**Approved:** 2026-07-08
**Created:** 2026-06-02
**Label:** canton-apis  
**Champion:** srikanth-bitdynamics

---

## Abstract

**Canton has no Rust SDK today.** Digital Asset's funded language roadmap is TypeScript, Java, and Python; the community has shipped SDKs for Go and Python (#38) and C#/.NET (#46), and the TypeScript dApp SDK (#69). Rust is the one unfilled quadrant, and it is the language of the cohort that sits closest to the network: indexers, validators, oracle relays, and market-making engines. Those teams either drop to raw gRPC/JSON and re-implement the Ledger API, command de-duplication, code generation, and CIP-56 choice-context handling per project, or depend on a partial community crate with no codegen, conformance guarantees, or maintainer.

This proposal funds a **production-grade, open-source Rust SDK for Canton**: an async (tokio) Ledger API client over gRPC and JSON, type-safe code generation from DAR packages built on the official `daml-lf-archive` and Smart-Contract-Upgrade-aware, built-in token-standard support covering both CIP-56 (V1) and the newly ratified Token Standard V2 (CIP-0112), JWT/OIDC authentication, and a "DAR - crate" distribution model that publishes pre-built bindings for the Splice protocol DARs as `canton-splice-*` crates on crates.io. Codegen ships as a `dpm` component so it integrates with the standard toolchain rather than competing with it. Everything is Apache-2.0.

The SDK is built to **Digital Asset's Ledger Client Standard** — the reference capability set DA defines for Canton client libraries — so it converges with how DA expects a client to behave rather than inventing its own surface. v1 (this grant) delivers the core client surface; the remaining Standard capabilities are an explicit post-v1 roadmap.

**Why this matters.** Canton's institutional and infrastructure adopters increasingly run Rust services next to the network. A Rust team integrating Canton Coin or the Token Standard today writes the same wrapper layer the C#, Go, and TypeScript teams already wrote. This SDK removes that duplicated work and rounds out Canton's language coverage.

**Current status.** This proposal funds development from a defined design, with a working end-to-end PoC delivered at Milestone 1 (a real transaction submitted and read on DevNet). We are a GSF-sponsored Canton validator and will maintain the SDK long-term, which is the part that matters most for a language binding.

---

## Specification

### 1. Objective

**Full delivery of this proposal will result in:**

- An idiomatic, async Rust client for the Canton Ledger API (gRPC and JSON transports), published on crates.io, with TLS (mutual and server-side), error classification (retriable vs non-retriable), retry, command de-duplication and recovery, resilient/resumable streams, and OpenTelemetry tracing and metrics.
- A DAR → Rust code generator that produces type-safe bindings for templates, choices, interfaces, and contract keys, built on `daml-lf-archive` and aware of Smart Contract Upgrade (SCU).
- Built-in token-standard support for both CIP-56 (V1) and Token Standard V2 (CIP-0112): holdings, transfer instruction, allocations, choice-context, disclosed contracts, plus the V2 additions (account structures, allocation/executor settlement, committed allocations and iterated settlement, and the V2 `EventLog`/transfer-event parsing).
- JWT/OIDC authentication with presets for common identity providers.
- The Admin API surface every integrator and operator hits: party allocation and management (`PartyManagementService`) and topology *read* (inspecting party-to-participant mappings, namespace delegations, and vetted packages via `TopologyManagerReadService`). Topology *write* (constructing/signing/submitting topology transactions) is roadmapped — see below.
- Pre-built `canton-splice-*` crates for the protocol DARs (amulet, wallet, token-standard V1 and V2, validator-lifecycle, dso-governance), refreshed on each Canton/Splice release.
- Integration with `dpm` as a `dpm codegen-rust` component.
- A reference application, a conformance test suite verified against the Ledger Client Standard, an independent security review, and documentation.

**Out of scope for v1 (roadmapped, not excluded):**

- Some Ledger Client Standard capabilities are deliberately deferred past v1 rather than dropped: the in-memory ACS component (PQS is the default in v1), multi-synchronizer *management* (listing, per-synchronizer vetting, target selection — distinct from the multi-synchronizer *event handling* v1 does cover), topology *write* and the remaining Admin API surface (see below), and topology-event subscription, command batching, pending-set tracking, cross-participant HA de-duplication, stream HA failover, and node-health monitoring.
- **Admin API — split between v1 and roadmap.** v1 covers the Admin API surface every integrator and operator actually hits: party allocation/management and topology *read* (party-to-participant mappings, namespace delegations, vetted packages). Deferred to the requirement-driven roadmap is topology *write* and the heavier administration surface — constructing, signing, and submitting topology transactions (namespace delegations, party-to-participant mappings, decentralized namespaces, external-party onboarding) and package administration — delivered as scoped, named modules driven by design-partner demand, so the pieces a given adopter needs can be pulled forward first. Deferring the write path is low-risk and additive rather than a separate foundation: topology transactions already surface on the Ledger API update stream (which v1 reads), and external-party topology signing reuses the same hash-signing machinery v1 builds for interactive submission, so it extends the v1 client rather than rebuilding it.

**Out of scope entirely:**

- A new smart-contract language (Daml remains the contract language).
- A wallet, an indexer service, a DEX, or any application product.

### 2. Implementation Mechanics

#### Two source-of-truth lanes

The SDK has two inputs, each from an authoritative source:

1. **The Ledger API surface** comes from the published Canton Ledger API v2 gRPC `.proto` files. gRPC is the primary transport (lowest overhead for high-throughput infra services); the JSON Ledger API is supported for simpler HTTP backends and the few admin/health endpoints.
2. **Contract types** come from compiled DARs, read through the official `daml-lf-archive` decoder, not a bespoke DAR parser. This keeps codegen correct as Daml/LF evolves and ties generated types to package versions.

#### Codegen architecture (DAR → Rust)

`canton-codegen` reads Daml-LF via `daml-lf-archive`, walks the package, and emits idiomatic Rust:

- Templates become structs with typed fields; choices become typed exercise builders.
- Interfaces are data-first: the codegen emits the typed view (decoded via `InterfaceFilter` / `includeInterfaceView`) and the typed choice argument/result types (exercised by setting the interface id as the command's `template_id`), plus a `toInterface` contract-id conversion on templates that implement the interface. This mirrors the Java codegen's interface companion: the client consumes interface I/O and view data.
- Package dependencies are generated transitively: `daml-lf-archive` returns the main package plus its dependency closure, so a DAR that references types from other packages produces bindings for the whole graph rather than failing on missing references.
- Contract keys are generated as typed key types, so consumers can exercise choices by key and prefetch keys for accelerated execution, per the Ledger Client Standard.
- Generated types carry package id and version plus the PackageMap, so consumers resolve the correct template version under Smart Contract Upgrade. A version bump regenerates the bindings rather than breaking silently.
- Generated objects expose both JSON and gRPC (proto) codecs, matching the serialization the Ledger API's JSON and gRPC endpoints require: JSON via derived `serde` impls (following the Daml-LF JSON encoding) and gRPC via `prost`.
- Codegen is invoked through `dpm codegen-rust` (see Integration with `dpm`).

To be precise about where Smart Contract Upgrade lives: `daml-lf-archive` is used to *decode* LF and recover package id/hash, version, and the PackageMap — it does not itself perform upgrade-compatibility checking. The authoritative SCU compatibility checks run at three points owned by Daml/Canton, not by any client: at `daml build` (compile time, against the `upgrades:` target), at DAR upload to the participant node (the final say, against the participant's package store), and at runtime (the participant selects the target template version on submit/fetch). The SDK consumes the *result* of those checks (resolved, version-tagged packages) and never re-implements compatibility logic of its own.

#### Shared AST / codegen family

DA maintains a generic JVM library that reads DARs into an in-memory AST, with existing back-ends for Java, Scala, and TypeScript. Where that library is available for external use, `canton-codegen` will consume it and contribute a Rust back-end, so Rust codegen becomes a member of the same family: one shared AST representation, upstream LF/SCU fixes inherited automatically, and no divergent DAR parser to maintain. Until then it reads LF directly through `daml-lf-archive`, the same decoder Canton itself uses, so the migration is a back-end swap rather than a rewrite. We will coordinate with the DA codegen maintainers on this.

#### Daml-LF → Rust type mapping

The mapping is documented in full and covers: `Int64` → `i64`; `Numeric n` → a fixed-precision decimal type (`rust_decimal`/`bigdecimal`) preserving scale; `Text` → `String`; `Bool` → `bool`; `Party`/`ContractId a` → newtypes; `Time` → `chrono::DateTime<Utc>` and `Date` → `chrono::NaiveDate` (preserving Daml's microsecond / day precision; the `time` crate available behind a feature flag); records → structs; variants → enums; enums → enums; `List a` → `Vec<T>`; `Optional a` → `Option<T>`; `TextMap`/`GenMap` → typed maps. Edge cases (high-precision `Numeric`, nested generics) are specified in the docs so behavior is predictable.

#### Client architecture

The client targets the thin-client-plus-ergonomics layer: typed wrappers over the gRPC and JSON Ledger APIs, streaming-first (`Stream`/`futures`), and an opt-in retry pipeline (tower/backoff) that preserves `command_id` across attempts so ledger-side de-duplication behaves correctly. Command de-duplication uses the change ID (the `user_id` + `act_as` + `command_id` triple) per the Ledger API contract.

Following the Ledger Client Standard, the client layer also covers the cross-cutting concerns a production library needs:
- **Transport security.** Mutual and server-side TLS on both gRPC and JSON connections.
- **Error handling.** Parsing of both gRPC and JSON Ledger API errors into a typed model that classifies errors as retriable vs non-retriable and exposes the structured details (error code, message, request/error info), so retries fire only on retriable errors with timeouts and a max-attempt bound.
- **Command recovery.** After a participant crash, client crash, lost connection, or timeout, pending command state is recovered through the command-completion endpoint rather than blindly re-submitting.
- **Resilient streams.** ACS and update subscriptions resume after an interruption from the last known position (offset / record-time vector / continuation token) instead of restarting from zero.
- **Observability.** OpenTelemetry tracing (trace-id injection/extraction across gRPC and JSON, spans reported to an OTLP server) and OpenTelemetry metrics (request/response counts, success/error and per-endpoint breakdown), plus structured logging of requests/responses that carries trace-ids, logs Ledger API errors verbosely for diagnosis, and is configurable in level, format, and destination.

The update stream exposes each Ledger API event as a distinct typed case. Reassignment is modelled faithfully as **two** separate events — `Unassigned` (on the source synchronizer) and `Assigned` (on the target synchronizer) — rather than collapsed into a single "reassign" event, so multi-synchronizer flows are represented correctly for consumers that track contracts across synchronizers.

For v1, the SDK's typed view of active contracts is the PQS client (below) rather than an in-process cache: the participant node owns authoritative state and PQS exposes it queryably, so the common case is served without risking a divergent cache. The Ledger Client Standard's in-memory ACS component — a parameterized, filterable in-process copy of the Active Contract Set kept current off the update stream — is a post-v1 item for latency-sensitive consumers; v1 ships the streaming and PQS primitives it would build on.

#### Target platforms

The v1 supported and CI-tested matrix is native Tier-1 Rust: Linux, macOS, and Windows on both `x86_64` and `aarch64` (all "guaranteed to work" Tier-1 targets), plus `x86_64-unknown-linux-musl` for static, container-friendly infra binaries. On these the SDK runs the full surface — gRPC over HTTP/2 (`tonic`) and the JSON transport — which matches where the audience runs (indexers, validators, oracle relays, settlement services).

WASM is handled by design rather than as a v1 commitment, split along the same codegen/client line as the rest of the SDK:

- The generated bindings are plain Rust (`serde`/`prost`) with no native dependencies, so they compile to `wasm32` and are usable from WASM contexts as-is. This is part of v1.
- Browser transport is a roadmap item, not a v1 deliverable. In the browser, unary JSON Ledger API calls work over the Fetch API (reqwest's wasm backend), JSON streaming runs over WebSocket (`web-sys`), and gRPC requires gRPC-web through a proxy (e.g. `tonic-web-wasm-client`) since native HTTP/2 is unavailable there. That path serves the front-end / dApp cohort (the TypeScript SDK's lane) and pulls in a gRPC-web proxy plus a separate browser test matrix, so it is demand-gated rather than v1, which keeps the tested matrix honest.

#### PQS client (typed, no hand-written SQL)

PQS is Digital Asset's PostgreSQL projection of ledger state, with contract payloads stored as JSONB. Without a typed wrapper, application code reaches in via stringly-typed JSONB navigation with no compile-time checks. The Rust PQS client consumes the codegen-emitted types and lets callers express queries through typed predicates compiled to parameterized JSONB path queries, preserving Postgres types end to end.

#### Token standard (CIP-56 V1 and CIP-0112 V2)

`canton-token` wraps the registry off-ledger API to resolve `factoryId`, `choiceContextData`, and `disclosedContracts`, fetches ledger-derived `createdEventBlob` via the active-contracts query with `includeCreatedEventBlob=true` when needed (cached by contract id), and exercises `TransferFactory_Transfer` and allocation choices through the normal command path. It covers the full token-standard flow set the Ledger Client Standard enumerates: one-step transfers (sender-initiated, settled in a single command where the receiver has pre-approved), transfer pre-approvals (creating and using `TransferPreapproval` so a receiver can accept inbound transfers without a per-transfer step), the two-step allocate path, and instrument inspection (reading instrument/registry metadata and admin state). It reuses the existing token-standard mechanism; it does not fake or hand-serialize `createdEventBlob`.

The crate covers both major versions of the standard. CIP-56 (V1) is what is deployed on mainnet today and remains fully supported. Token Standard V2 (CIP-0112), ratified June 2026, is a backward-compatible evolution adding the `splice-api-token-*-v2` packages, the `splice-api-token-standard-utils` shared/cross-version types, and `splice-api-token-transfer-events-v2` parsing. `canton-token` exposes V2's additions where they matter to Rust integrators: the `Account` data structure (replacing a bare `Party` as transfer source/destination, including the special accounts for mint/burn); the allocation/`executor` settlement path for venues that settle off-chain authority; `committed` allocations and iterated settlement (the primitive for prefunded trading and an off-chain order book settled on-chain); and the V2 `EventLog`/transfer-event parser as the typed source for ingest. Because V2 ships as new package versions and the SDK resolves versions through the SCU-aware codegen, V1 and V2 assets are both addressable from the same client — version selection is data-driven, not a fork in the API.

#### External / interactive submission

Support for the Interactive Submission Service so external-party (CIP-0103) flows can prepare, sign, and submit transactions (`prepare` / `execute` / `executeAndWait`). Signing is pluggable and covers the modes the Ledger Client Standard calls for — KMS-backed signers, file-provided keys, and the signing algorithms Canton supports. An HSM/KMS-backed signer is supplied by the integrator; the SDK does not hold raw keys.

#### Integration with `dpm`

Codegen is distributed as a `dpm` component (`dpm codegen-rust`) per the dpm-components model, so Rust codegen runs through the same toolchain entry point as the rest of the ecosystem rather than as a competing standalone CLI.

#### Key dependencies

`tonic`/`prost` (gRPC), `tokio`, `reqwest` (JSON transport), `daml-lf-archive` (LF decoding, via a thin JVM helper), `rust_decimal`/`bigdecimal`, `serde`, `sqlx` (PQS Postgres client), OpenTelemetry.

**On the LF decoder choice.** `daml-lf-archive` is a JVM library, so codegen wraps it through a thin JVM helper rather than re-implementing LF decoding natively in Rust. This is deliberate: LF decoding and version dispatch are non-trivial, change with each LF release, and have an authoritative implementation in `daml-lf-archive`; wrapping it is materially less risky than maintaining a hand-written Rust LF parser that would drift from the spec. The JVM step is build-time tooling, not a runtime dependency — consumers of the pre-built `canton-splice-*` crates need no JVM at all, and the helper is invoked only when a developer generates bindings from their own custom DAR.

#### Proof-of-Concept status

Milestone 1 delivers a working PoC: a real transaction submitted and read on LocalNet/DevNet through the async client, open-source and CI-green, with a recorded demo. This retires the "can it be built?" risk before later milestones.

**What the PoC does not cover (and what the grant funds):** full Ledger API coverage, the SCU-aware codegen, the PQS client, token-standard support (CIP-56 V1 and CIP-0112 V2), external signing, the `canton-splice-*` crate distribution, conformance testing, the security review, and documentation.

#### Quality assurance

Unit tests, integration tests against LocalNet/DevNet, a conformance suite (codegen output compiles and round-trips against real DARs; submit → observe → query verified on both transports), CI on the supported Canton release matrix, and an independent security review at Milestone 3.

#### Open-source practices

Apache-2.0, semantic versioning, published crates on crates.io, public CI, contribution guide, and full rustdoc plus a docs site.

#### Alignment with the Ledger Client Standard

The SDK is scoped against Digital Asset's **Ledger Client Standard**, the reference capability set for Canton client libraries. v1 (this grant) delivers the core client surface — codegen and bindings (templates, choices, interfaces, contract keys, dependency closure; JSON + gRPC codecs; PQS), the transport/infrastructure layer (TLS, OAuth/JWT auth, retriable error classification, retry, command recovery, OpenTelemetry tracing and metrics, configurable structured logging, signing), commands and streams over both transports (including resilient/resumable streams and multi-synchronizer event handling), party allocation/management and topology read over the Admin API, and token standard (CIP-56 V1 + CIP-0112 V2, covering one-step transfers, pre-approvals, allocate/transfer, and instrument inspection). The heavier Admin API write path (topology transaction construction/signing/submission, package administration) is the explicit post-v1 roadmap.

### 3. Architectural Alignment — Extending Daml / Canton into the Rust Ecosystem

The default approach is to extend what exists rather than introduce parallel infrastructure. This proposal does so at two layers.

**Layer 1 — Tooling.** The SDK consumes the existing Canton public API surface unchanged: the Ledger API v2 `.proto` files for the gRPC client, the JSON Ledger API for HTTP backends, and `daml-lf-archive` for DAR-reading codegen. No changes to Canton, Daml, or Splice core repositories are requested. It is a downstream consumer that fills the empty Rust quadrant.

**Layer 2 — Distribution: any DAR - a Rust crate.** The headline user story is broad, not Splice-specific: any DAR can be turned into a typed Rust crate via `dpm codegen-rust`. The Splice protocol DARs (`splice-amulet`, `splice-wallet`, the token-standard packages for both V1 and the CIP-0112 V2 set, `splice-validator-lifecycle`, `splice-dso-governance`, and shared utilities) are published as pre-built `canton-splice-*` crates, refreshed on each Canton/Splice release, so a Rust developer integrating Canton Coin or the Token Standard runs `cargo add canton-splice-wallet` instead of vendoring and building DARs by hand. This DAR-as-a-crate distribution model does not yet exist for the Rust ecosystem.

**Why this matters.** Infrastructure and institutional teams operate dependency-management and supply-chain-review workflows where "clone this repo and build it yourself" is a real adoption hurdle. Turning any DAR into a `cargo add` dependency changes the integration shape and compounds across every future Rust Canton integration.

**Integration with the existing developer surface.** Codegen plugs into `dpm`; runtime crates sit alongside the Go, C#, and TypeScript SDKs as the Rust member of the set. Foundation buy-in for a `canton-*` crates.io namespace is a Milestone 1 deliverable; until confirmed, a `nodejumper-canton-*` working namespace is used.

**Token Standard V2 (CIP-0112).** V2 was ratified in June 2026 as a backward-compatible evolution of CIP-56. The SDK supports CIP-56 V1 as deployed on mainnet today, so there is no hard dependency on the V2 rollout; at the same time it targets V2 as a first-class surface rather than a later add-on. Notably, the V2 features map onto exactly the cohort this SDK serves — indexers, market-making engines, and oracle relays — and each lands naturally in a typed binding:
- **Standalone holding events for indexers.** V2's `EventLog` interface emits side-effect-free `EventLog_HoldingsChange` events (ERC-20-style) instead of requiring full transaction-tree traversal with a metadata fallback. The `splice-api-token-transfer-events-v2` parser turns these into a typed update stream — a direct win for the indexers that are this SDK's primary audience, who today hand-decode transaction trees.
- **Committed allocations & iterated settlement for trading infra.** V2 adds `committed` allocations (locked until settle/cancel/expiry) and iterated settlement — an off-chain order book settled on-chain with no custom Daml. That is the exact primitive for the market-making and oracle-relay services this SDK targets; the SDK exposes it as typed allocation/settlement calls.
- **Account structures** (`{ owner, provider, id }`) become a generated type the codegen emits like any other record, so multi-tier / custody-chain holdings and the special mint/burn accounts (for delivery-vs-mint/burn) are addressable directly.
- **Allocation / `executor` settlement path** is exercised through the normal command flow, giving venues that settle off-chain authority a typed entry point.
- Because V2 ships as **new package versions with cross-version compatibility**, the SCU-aware codegen resolves V1 and V2 from the same toolchain, so a Rust integrator targets whichever version an asset uses without a separate code path.

V1 remains fully supported for assets that have not migrated, so V2 is an upgrade to the SDK's coverage rather than a precondition.

**Coordination with the DA SDK team.** DA's funded SDK roadmap is TypeScript / Java / Python; Rust is outside it. This proposal does not duplicate or pre-empt internal DA work; it fills a quadrant DA has not staffed. We will engage the DA SDK team and the authors of the existing community crate so the ecosystem converges rather than forks.

**Relationship to other proposals.** #38 (Go + Python), #46 (C#/.NET), and #69 (TypeScript dApp SDK) are the parity precedent; this is the same category for Rust. #74 (DAR-to-TypeScript codegen) is the TypeScript codegen analogue; ours is the Rust counterpart on the same `daml-lf-archive` foundation. The existing `DLC-link/canton-lib` community crate is a useful low-level partial (some ledger calls and registry/wallet helpers) with no codegen, conformance, or maintenance guarantee; we consolidate that surface into a complete, versioned, maintained SDK.

### 4. Backward Compatibility

No backward compatibility impact. The SDK is a client-side library and codegen. It adds no protocol, ledger-contract, or standard changes and works against the current Ledger API v2, Daml-LF, and the token standard (CIP-56 V1 and CIP-0112 V2) as they are. V2 is itself a backward-compatible evolution of CIP-56, so supporting it is additive — V1 assets and integrations keep working unchanged. Generated code depends on `daml-lf-archive` decoding semantics, so it continues to compile against any LF version the archive can read.

---

## Milestones and Deliverables

### Milestone 1: Core Ledger API Client, Auth & PoC
- **Estimated delivery:** Month 1.5 · **Hard deadline:** 2 months from grant approval.
- **Estimated effort:** ~40 person-days.
- **Deliverables:**
  - `canton-ledger` async client (gRPC + JSON): command submission (`submit` / `submitAndWait`) and completion, ACS and update streaming and paging, reverse-order queries, event query, with correct change-ID de-duplication, command recovery via the completion endpoint, resilient/resumable streams, retriable-vs-non-retriable error classification, and TLS (mutual + server-side).
  - OpenTelemetry tracing **and** metrics plus trace-id-aware structured logging across both transports.
  - `canton-auth` JWT/OIDC (client-credentials, token refresh, JWT injection) with provider presets.
  - `canton-admin` (initial slice): party allocation/management (`PartyManagementService`) and topology *read* (`TopologyManagerReadService`) — party-to-participant mappings, namespace delegations, and vetted packages.
  - First crates.io release; quickstart; working PoC submitting and reading a transaction on LocalNet/DevNet.
  - `canton-*` namespace confirmation with the Foundation.
- **Verification:** committee or delegate confirms crates install, tests pass, and the PoC submits and reads a transaction end to end.

### Milestone 2: Codegen via daml-lf-archive (SCU-aware) + dpm component
- **Estimated delivery:** Month 3 · **Hard deadline:** 4 months from grant approval.
- **Estimated effort:** ~65 person-days (the heaviest engineering milestone).
- **Deliverables:**
  - `canton-codegen` generating typed Rust from DARs through `daml-lf-archive`, SCU/PackageMap-aware, covering templates, choices, interfaces, and contract keys, with JSON and gRPC codecs on the generated types.
  - `dpm codegen-rust` component integration.
  - Documented Daml-LF → Rust type mapping; first `canton-splice-*` reference crates; sample app using generated bindings.
- **Verification:** demonstrate codegen → submit command → observe transaction → query ACS on both gRPC and JSON paths; an SCU version bump regenerates compatible code.

### Milestone 3: Token Standard (CIP-56 V1 + CIP-0112 V2), External Signing, PQS Client, Conformance & Security Review
- **Estimated delivery:** Month 4.5 · **Hard deadline:** 6 months from grant approval.
- **Estimated effort:** ~70 person-days plus the external audit window (V2 support — the `Account` model, allocation/executor settlement, and V2 transfer-event parsing — is absorbed here, since it lands largely through the M2 codegen; the total request is unchanged).
- **Deliverables:**
  - `canton-token` covering CIP-56 V1 and CIP-0112 V2: holdings, transfer instruction, allocations, choice-context, disclosed-contract / `createdEventBlob` handling, plus the V2 `Account` model, allocation/executor settlement, and V2 transfer-event parsing.
  - Interactive Submission with a pluggable signer (HSM/KMS-compatible).
  - `canton-pqs` typed PQS client (typed predicates compiled to parameterized JSONB queries, no hand-written SQL).
  - End-to-end token-standard transfer examples for both V1 (CIP-56) and V2 (CIP-0112 — an `Account`-based transfer/allocation); remaining `canton-splice-*` crates.
  - Conformance/integration test suite mapped to the **Ledger Client Standard** (each v1 capability has a corresponding conformance check) plus a published **compatibility matrix** (Rust toolchain versions × supported Canton / Daml-LF ranges × supported target platforms, and the token-standard versions V1/V2 each crate targets), exercised in CI (codegen output compiles and round-trips against real DARs; submit → observe → query verified on both gRPC and JSON transports).
  - Independent security review of the client, codegen, and token crates; the auditor and audit scope are agreed with the Tech & Ops security subcommittee and the scope document published before the review begins.
- **Verification:** a V1 (CIP-56) transfer settles end to end on DevNet, and a V2 (CIP-0112) `Account`-based transfer/allocation is exercised against the V2 reference token (and Canton Coin's V2 path as it lands on DevNet); conformance suite green on the supported matrix; security-review critical/high findings remediated and a remediation summary published.

### Milestone 4: Adoption & Production Deployment
- **Opens:** on Milestone 3 acceptance.
- **Deadline:** 12 months from grant approval — an explicit exception to the 9-month default (see *Deadline rationale* in §Funding). Production deployment of infrastructure services (indexers, validators, oracle relays, settlement services) runs on a longer cycle than developer-tooling adoption.
- **Focus:** Real production usage of the SDK on Canton mainnet, plus the adoption-enabling deliverables (reference application, documentation site, maintenance plan). This milestone carries the majority of the grant by design (70%), so payout tracks demonstrated adoption rather than delivery alone.
- **Payment structure:** per-event tranches for each Featured App in production on mainnet, plus a completion tranche gated on quantitative adoption metrics. Partial adoption pays partially rather than forfeiting the whole milestone.
- **Deliverables / Value Metrics:**

| Deliverable | Acceptance Criteria | Tranche payout |
|-------------|---------------------|----------------|
| Featured App on mainnet | Each independent application that uses the Rust SDK to submit transactions in production on Canton **mainnet**. Up to 5 apps credited. Evidenced by party IDs and on-chain submission, or by private attestation to the Canton Foundation under confidentiality. | **150,000 CC per app (up to 750,000 CC)** |
| Reference application | A reference app (indexer or settlement service) built entirely on the SDK, open-source, running against DevNet/mainnet | bundled in completion tranche |
| Documentation & maintenance plan | Docs site live and linked from Canton developer docs; documented long-term maintenance plan published | bundled in completion tranche |
| Adoption-completion gate | ≥1,000 crates.io downloads across ≥3 unique organisations; ≥5 external GitHub issues or PRs; ≥3 community-reported issues triaged through to resolution | 160,000 CC |
| **Milestone 4 maximum** | | **910,000 CC** |

- **Verification:** Featured Apps evidenced by party IDs + on-chain mainnet submission (public roster with adopter consent) or private attestation to the Foundation under NDA (Foundation confirms to the committee); completion gate evidenced by crates.io statistics, GitHub insights, and triaged-issue links; reference app and docs by their public artefacts. Adopting teams and the proposal champion are invited to confirm milestone completion to the committee, so acceptance is corroborated by real users rather than self-reported alone.

### Post-grant maintenance (separate, not part of the 1,300,000 CC)
Following M4, Nodejumper proposes ongoing quarterly maintenance under a separate maintenance grant subject to committee review. The reason this is credible is operational, not contractual: we already run a monitored, 24/7 validator fleet with incident response and no slashing history, and the SDK is maintained with that same discipline rather than as a side commitment.
- **Compatibility cadence:** because we track Canton / Splice / Daml-LF releases for our own nodes already, the crates and codegen are refreshed against each release as part of the same upgrade cycle, with the compatibility matrix kept current.
- **Upgrade playbook:** a documented procedure for moving the crates to a new Canton / Daml-LF / protobuf version, so the work does not depend on a single person.
- **Issue handling:** integration-blocking defects are triaged on the same priority track as our node incidents; security-relevant issues are patched first.
- **Release hygiene:** semantic versioning, changelogs, and migration notes on every release.

---

## Acceptance Criteria

Evaluated on ecosystem value, not artifact delivery:

- A developer adds the crate, points at a participant, and submits a first transaction; generated bindings compile against a real DAR.
- The token-standard transfer examples settle end to end on DevNet (demonstrated, not mocked): a V1 (CIP-56) transfer, and a V2 (CIP-0112) `Account`-based transfer/allocation against the V2 reference token.
- Codegen reads Daml-LF via `daml-lf-archive` and handles an SCU version bump correctly.
- Crates are published on crates.io and codegen runs as a `dpm` component.
- Independent Featured Apps run the SDK in production on Canton mainnet, evidenced by party IDs and on-chain submission or by private attestation to the Foundation; the Milestone 4 per-event tranches pay against those deployments.
- The Milestone 4 adoption gate is met (crates.io downloads across multiple organisations, external GitHub engagement, community issues triaged).
- Documentation, tests, security-review results, and a maintenance plan are published under Apache-2.0.

---

## Funding

**Total Funding Request:** 1,300,000 CC

The request is weighted **70% toward adoption** (910,000 CC) and 30% toward engineering delivery (390,000 CC), directly reflecting committee guidance that funding should track demonstrated ecosystem usage rather than delivery alone. The engineering portion covers a roughly six-month build of a multi-crate SDK plus DAR codegen, a PQS client, token-standard support (CIP-56 V1 and CIP-0112 V2), external signing, the `canton-splice-*` distribution, and a conformance suite. The adoption portion pays out against real production deployments on Canton mainnet. The total is sized for efficient delivery by an existing validator team and a deliberately adoption-heavy structure.

### Payment Breakdown by Milestone

| Milestone | Payment | % of total |
|---|---|---|
| M1 — Core client, auth, PoC | 90,000 CC upon committee acceptance | ~7% |
| M2 — Codegen (daml-lf-archive, SCU) + dpm component | 150,000 CC upon committee acceptance | ~11.5% |
| M3 — Token standard (V1 + V2), external signing, PQS client, conformance | 150,000 CC upon committee acceptance | ~11.5% |
| M4 — Adoption & Production Deployment | up to 910,000 CC, per-event + completion tranches | 70% |
| **Total** | **1,300,000 CC** | **100%** |

**Engineering (M1–M3): 390,000 CC (30%).** Front-loaded so the committee evaluates quality at each acceptance before the adoption-weighted tranche opens. M2 and M3 carry the heaviest engineering — LF decoding, SCU, and type mapping in M2, then token-standard support (CIP-56 V1 and CIP-0112 V2), external signing, the PQS client, and conformance in M3.

**Adoption (M4): up to 910,000 CC (70%).**
- **150,000 CC per Featured App in production on Canton mainnet — up to 5 apps = 750,000 CC.** This is the dominant line in the proposal by design: the largest share of the grant is paid only when independent teams run the SDK in production on mainnet.
- **160,000 CC completion tranche** on the quantitative adoption gate (≥1,000 crates.io downloads across ≥3 organisations, ≥5 external GitHub issues/PRs, ≥3 community issues triaged), bundled with the adoption-enabling deliverables (reference app, docs site, maintenance plan).

Per-event payouts make adoption proportional to demonstrated usage rather than gated on a single binary trigger: if three of five Featured Apps ship, three tranches pay. The adoption-enabling deliverables (reference app, docs, maintenance plan) are committed under M4 and are not contingent on the per-event tranches firing.

### Security review (pass-through, separate from the 1,300,000 CC base)
The independent security review at Milestone 3 is budgeted as a pass-through cost of roughly 120,000–150,000 CC, paid alongside M3 acceptance, outside the engineering/adoption base above (the 1,300,000 CC). The vendor scope is agreed and published before the review begins.

### Deadline rationale
The engineering milestones (M1–M3) complete in approximately six months. Milestone 4 opens on M3 acceptance and runs to a 12-month deadline from grant approval — an explicit exception to the 9-month default. The adopter set for this SDK (indexers, validators, oracle relays, settlement services) deploys to mainnet on production-hardening cycles that routinely exceed nine months; a 9-month adoption deadline against that profile would forfeit the adoption tranches the 70% weighting is designed to reward.

### Volatility Stipulation
The engineering scope is scoped to complete in under six months. The grant is denominated in fixed Canton Coin and is re-evaluated at the standard 6-month review point, with a second review at the 12-month mark to cover the extended M4 adoption window, per the standard template clause. Should scope change at Committee request, remaining milestones are renegotiated at the same review points to account for USD/CC volatility.

### Target use cases
- **Indexers and data services.** Rust indexers ingesting Ledger API streams with typed events instead of hand-decoded JSONB.
- **Validators and node tooling.** Operators building monitoring, reconciliation, and automation in Rust against their own participant.
- **Oracle relays and market-making.** Latency-sensitive services that need direct, in-process Canton access rather than a sidecar in another language.
- **Token-standard integrations.** Any Rust service moving Canton Coin or token-standard assets, on CIP-56 (V1) or CIP-0112 (V2).

### The opportunity
Canton's language coverage is converging; Rust is the remaining gap and serves the infrastructure cohort that operates closest to the network. Closing it lets those teams build natively instead of crossing language or process boundaries.

### Risk mitigation
- **Build risk** is retired by the Milestone 1 PoC.
- **Overlap risk** is addressed by consolidating the existing community crate and shipping codegen through `dpm`.
- **Adoption risk** is addressed structurally: the `canton-splice-*` crates make integration a single `cargo add`, the reference application proves the surface, and 70% of the grant is paid only against Featured Apps running in production on mainnet, so funding tracks real usage rather than delivery alone.
- **Maintenance risk** is addressed by Nodejumper's standing-validator commitment and the post-grant maintenance model.

---

## Co-Marketing

Upon release, Nodejumper will collaborate with the Foundation on:

- An announcement and a "first Rust app on Canton in 10 minutes" walkthrough.
- A reference-application case study (indexer or settlement service).
- Developer enablement: quickstart, examples, and office hours.

---

## Ecosystem Demand & Adoption Path

**Demand signal.** The 2026 Canton Developer Survey flags "typed SDKs & language bindings" as a high-priority tooling gap, and Rust is the one major language with no maintained binding. The cohort that feels this most is the infrastructure tier — indexers, validators, oracle relays, and market-making engines — which disproportionately builds in Rust and today drops to raw gRPC/JSON per project.

**Adoption path.** Adoption is staged so the bar stays realistic: teams begin on a DevNet / production-pilot integration and graduate to mainnet, at which point they are credited as Featured Apps under Milestone 4. We will invite early adopters to comment on this PR and to help the committee verify milestone completion, following the pattern established by prior SDK grants.

**How success is measured.** Success is ecosystem-level, not package-level: the headline metric is independent applications running the SDK in production on mainnet (the Featured-App tranches). crates.io downloads and GitHub engagement are secondary, supporting signals — not the primary target.

---

## Rust Adoption & Market Demand
**As a language.** Rust has moved well past early-adopter status. Around 2.3M developers worked in it over the past year, ~700K of them as their primary language; commercial use is up roughly 69% in three years; and about 45% of organisations now make non-trivial use of it. It is consistently ranked the language developers most want to keep using, which matters for a binding meant to be maintained for years rather than abandoned after the grant.

**On-chain.** In crypto the concentration is even sharper. Rust is the dominant language for high-performance ledgers — Solana, Polkadot/Substrate, NEAR, Aptos, and Sui all build their core protocol in Rust, and on Ethereum the highest-performance clients and the leading contract-dev tooling are Rust too. By active-developer count, Solana now leads every chain, with Polkadot and Sui in the top tier, all Rust-based, and Solana's developer base is up ~60% over two years. This is the infrastructure cohort that sits closest to a ledger - and the one language quadrant Canton has not yet filled.

---

## Rationale

### Why Rust
Rust is the language of performance-sensitive, infrastructure-adjacent services: indexers, validators, oracle relays, and market-making engines. These teams need direct, typed, in-process access to Canton, and today they have no maintained SDK. It is the one unfilled language quadrant after Go, C#, TypeScript, and Python.

### Why this approach
A real SDK is more than transport stubs. The reusable value is correct de-duplication, DAR-versioned typed bindings (SCU-aware), CIP-56 handling, auth, and idiomatic async, maintained together and tested for conformance. Shipping codegen as a `dpm` component keeps it in the standard toolchain instead of fragmenting it. The DAR-as-a-crate distribution model turns integration into a single `cargo add`.

### Long-term sustainability
- **Current model.** Nodejumper is the primary steward; maintenance is funded via a separate quarterly grant (post-M4) subject to committee review.
- **If adoption grows.** Apache-2.0 from day one enables community contributions; growth broadens the maintainer pool rather than reducing stewardship.
- **Stewardship-transfer triggers.** Nodejumper initiates a transfer conversation only if its capacity to maintain at the committed cadence is impaired, or by mutual agreement with the Foundation; repository and crates.io ownership move to the `canton-foundation` org under that model.
- **If maintenance funding is not renewed.** The SDK keeps working against stable Canton APIs; published crates remain available; generated code keeps compiling against any LF version `daml-lf-archive` can read. Comprehensive docs and test coverage keep the bus factor low.

### Comparison with existing SDKs
Go and Python (#38), C#/.NET (#46), and TypeScript (#69) cover their languages; this is the Rust member of that set, built on the same official `daml-lf-archive` foundation and integrated through `dpm`. The `DLC-link/canton-lib` community crate is consolidated into a complete, maintained SDK with codegen and conformance.

---

## Why Nodejumper

Nodejumper is a Proof-of-Stake validator and infrastructure provider, active since early 2022. We operate secure self-managed infrastructure across 20+ networks with 24/7 monitoring, no slashing history, and high uptime. We are a GSF-sponsored Canton Network validator, and our team are working software engineers who ship open-source tools and managed services for the networks we operate. This proposal lands where our two strengths meet: running Canton infrastructure and building reusable developer tooling for it.

- **Proven production Rust.** We have shipped production Rust systems spanning async backend services, WebAssembly smart contracts, and reusable SDK cores — exactly the surface this grant builds. The directly relevant work includes:
  - **Async Ledger/transaction clients.** Rust backends for transaction planning and construction, command submission, and lifecycle/settlement tracking against a node — the same layer an async Ledger API client provides.
  - **Finality-aware on-chain indexing.** Streaming chain events into typed, queryable read layers (indexer + GraphQL), with reusable decoders and event-ingest pipelines — mirroring the SDK's update-stream and typed event handling.
  - **Typed binary protocols & codegen-adjacent tooling.** Strongly typed domain models and binary (SCALE-style) encode/decode across program boundaries, plus build-time codegen steps — the core skill behind DAR→Rust typed bindings.
  - **`no_std` Rust → WebAssembly.** Smart contracts compiled to WASM under constrained runtimes, with deterministic, gas-aware execution and explicit state machines — Rust under exactly the discipline a ledger client demands.
  - **Portable, reusable client cores.** One validated Rust core shared across backend, mobile FFI, and WebAssembly — i.e., the multi-target, reusable-crate shape this SDK distributes.
  - **Conformance-style testing.** Integration suites that exercise real compiled artifacts end to end, including failure paths — the same approach as the SDK's conformance suite.
  - …and more Rust builds shipping.
- **What this means for the SDK.** Across this work we have built actor-style cross-program communication, ownership-based state isolation, checked arithmetic, idempotency, backpressure, and failure recovery in Rust — the precise engineering an async Ledger API client and `daml-lf-archive`-based codegen demand.
- **We are the cohort this SDK is for.** We run validators and node tooling, which is exactly the Rust-adjacent infrastructure (indexers, validators, oracle relays) this SDK serves, so we build it for a user we understand first-hand: ourselves and operators like us.
- **Proven multi-network reliability.** 20+ mainnets since 2022 with no slashing and automated monitoring and incident response, the operational track record needed to ship and maintain a binding teams depend on.
- **Hands-on Canton / CIP-56 / Ledger API depth.** We work directly with the token-standard registry APIs, `choiceContextData`, `disclosedContracts`, and ledger-derived `createdEventBlob`, which are the exact mechanics this SDK wraps. Our prior Canton dev-fund work (Canton Token Standard Local API Compatibility & CI Harness) shows that.
- **Open-source track record.** We build and maintain reusable tooling, bots, onboarding guides, and dashboards under open licenses, the same kind of public-good work this grant funds.
- **Correctness handled by construction.** Codegen reads Daml-LF through the official `daml-lf-archive` and is SCU-aware, and a conformance suite proves generated code and CIP-56 flows behave correctly. Correctness is verified by tests, not assumed.

A language binding lives on its maintenance. As a standing Canton validator with a long-term stake in the network, we will maintain the SDK against new Daml/LF, Ledger API, and CIP-56 releases beyond the grant, and work with the Foundation on stewardship.

---

## Appendix A — What Canton Development Looks Like in Rust

Illustrative ergonomics, not a final API contract.

### A.1 — Connect and submit a command
```rust
let client = CantonClient::connect(Config {
    ledger_host: "https://participant.example.com".into(),
    auth: Auth::oidc(keycloak_preset),
}).await?;

let result = client
    .submit(Commands::new(party.clone())
        .create(Iou { issuer: party.clone(), owner: bob, amount: dec!(100) }))
    .await?;
```

### A.2 — Type-safe choice exercise (generated bindings)
```rust
let outcome = client
    .exercise(&iou_cid, Iou::Transfer { new_owner: carol })
    .await?;
```

### A.3 — Streaming transactions
```rust
let mut updates = client.updates(party.clone(), offset).await?;
while let Some(tx) = updates.next().await {
    handle(tx?);
}
```

### A.4 — Token-standard transfer (CIP-56 V1 and CIP-0112 V2)
```rust
// V1 (CIP-56): party-to-party transfer
let transfer = token.transfer(TransferRequest {
    sender, receiver, instrument, amount: dec!(100),
}).await?; // resolves factory + disclosedContracts, submits, returns instruction

// V2 (CIP-0112): Account-based transfer using the generated Account type
let transfer = token.v2().transfer(TransferRequestV2 {
    from: Account { owner: alice, provider: custodian, id: "ACC-001".into() },
    to:   Account { owner: bob,   provider: custodian, id: "ACC-002".into() },
    instrument, amount: dec!(100),
}).await?;
```

### A.5 — Typed PQS query (no SQL)
```rust
let ious = pqs.query::<Iou>()
    .filter(|x| x.owner == alice)
    .fetch().await?;
```

### A.6 — External / interactive submission with a pluggable signer
```rust
let prepared = client.prepare(commands).await?;
let signed = my_hsm_signer.sign(prepared)?;     // SDK never holds the key
let result = client.submit_signed(signed).await?;
```

---

## Appendix B — Why a generic gRPC/OpenAPI generator is not enough

Running `protoc`/`tonic-build` against the Ledger API protos, or an OpenAPI generator against the JSON spec, produces transport stubs, not an SDK. What that leaves the developer to build, per project:

- **Command de-duplication semantics** (the change-ID triple preserved across retries).
- **DAR-bound typed contracts** with Smart Contract Upgrade versioning, which require reading Daml-LF via `daml-lf-archive`, not the wire protos.
- **CIP-56 choice-context and disclosed-contract handling**, including ledger-derived `createdEventBlob`.
- **Typed PQS access** instead of stringly-typed JSONB.
- **Idiomatic async ergonomics, structured errors, retries, and tracing.**

This is the multi-week, per-team wrapper layer that every existing language SDK was funded to remove; the Rust quadrant is the one still open.

---

## Appendix C — Security review

An independent security review is scheduled at Milestone 3, covering the gRPC and JSON clients, the codegen output path, the token crate, and the signing integration. It is commissioned proactively (rather than on committee request) so findings are remediated against the API surface adopters will actually consume, ahead of the Milestone 4 launch. The auditor and the audit scope are agreed with the Tech & Ops security subcommittee, and the scope document is published before the review begins. Nodejumper commits to remediating all critical and high findings and to documenting any accepted/deferred medium and low findings with rationale, followed by a published remediation summary. It is budgeted as a pass-through cost separate from the engineering and adoption tranches (see §Funding), roughly 120,000–150,000 CC against an independent vendor quote; if final code volume materially exceeds the estimate, the delta is raised at the standard re-evaluation point per the Volatility Stipulation rather than mid-review.
