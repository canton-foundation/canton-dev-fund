## Development Fund Proposal — Rust SDK for Canton Network

**Author:** NODEJUMPER (https://nodejumper.io/)  
**Status:** Submitted  
**Created:** 2026-06-02  
**Label:** canton-apis  
**Champion:** Canton Foundation

---

## Abstract

**Canton has no Rust SDK today.** Digital Asset's funded language roadmap is TypeScript, Java, and Python; the community has shipped SDKs for Go and Python (#38) and C#/.NET (#46), and the TypeScript dApp SDK (#69). Rust is the one unfilled quadrant, and it is the language of the cohort that sits closest to the network: indexers, validators, oracle relays, and market-making engines. Those teams either drop to raw gRPC/JSON and re-implement the Ledger API, command de-duplication, code generation, and CIP-56 choice-context handling per project, or depend on a partial community crate with no codegen, conformance guarantees, or maintainer.

This proposal funds a **production-grade, open-source Rust SDK for Canton**: an async (tokio) Ledger API client over gRPC and JSON, type-safe code generation from DAR packages built on the official `daml-lf-archive` and Smart-Contract-Upgrade-aware, built-in CIP-56 token-standard support, JWT/OIDC authentication, and a "DAR → crate" distribution model that publishes pre-built bindings for the Splice protocol DARs as `canton-splice-*` crates on crates.io. Codegen ships as a `dpm` component so it integrates with the standard toolchain rather than competing with it. Everything is Apache-2.0.

**Why this matters.** Canton's institutional and infrastructure adopters increasingly run Rust services next to the network. A Rust team integrating Canton Coin or the Token Standard today writes the same wrapper layer the C#, Go, and TypeScript teams already wrote. This SDK removes that duplicated work and rounds out Canton's language coverage.

**Current status.** This proposal funds development from a defined design, with a working end-to-end PoC delivered at Milestone 1 (a real transaction submitted and read on DevNet). We are a GSF-sponsored Canton validator and will maintain the SDK long-term, which is the part that matters most for a language binding.

---

## Specification

### 1. Objective

**Full delivery of this proposal will result in:**

- An idiomatic, async Rust client for the Canton Ledger API (gRPC and JSON transports), published on crates.io.
- A DAR → Rust code generator that produces type-safe bindings for templates, choices, and interfaces, built on `daml-lf-archive` and aware of Smart Contract Upgrade (SCU).
- Built-in CIP-56 token-standard support (holdings, transfer instruction, allocations, choice-context, disclosed contracts).
- JWT/OIDC authentication with presets for common identity providers.
- Pre-built `canton-splice-*` crates for the protocol DARs (amulet, wallet, token-standard, validator-lifecycle, dso-governance), refreshed on each Canton/Splice release.
- Integration with `dpm` as a `dpm codegen-rust` component.
- A reference application, a conformance test suite, an independent security review, and documentation.

**Out of scope:**

- A new smart-contract language (Daml remains the contract language).
- A wallet, an indexer service, a DEX, or any application product.
- Admin/topology tooling beyond what the Ledger API exposes (topology will move to the LAPI; we do not duplicate it).

### 2. Implementation Mechanics

#### Two source-of-truth lanes

The SDK has two inputs, each from an authoritative source:

1. **The Ledger API surface** comes from the published Canton Ledger API v2 gRPC `.proto` files. gRPC is the primary transport (lowest overhead for high-throughput infra services); the JSON Ledger API is supported for simpler HTTP backends and the few admin/health endpoints.
2. **Contract types** come from compiled DARs, read through the official `daml-lf-archive` decoder, not a bespoke DAR parser. This keeps codegen correct as Daml/LF evolves and ties generated types to package versions.

#### Codegen architecture (DAR → Rust)

`canton-codegen` reads Daml-LF via `daml-lf-archive`, walks the package, and emits idiomatic Rust:

- Templates become structs with typed fields; choices become typed exercise builders.
- Interfaces and views are generated as traits/types.
- Generated types carry package id and version plus the PackageMap, so consumers resolve the correct template version under Smart Contract Upgrade. A version bump regenerates compatible code rather than breaking silently.
- Codegen is invoked through `dpm codegen-rust` (see Integration with `dpm`).

#### Daml-LF → Rust type mapping

The mapping is documented in full and covers: `Int64` → `i64`; `Numeric n` → a fixed-precision decimal type (`rust_decimal`/`bigdecimal`) preserving scale; `Text` → `String`; `Bool` → `bool`; `Party`/`ContractId a` → newtypes; `Time`/`Date` → typed wrappers; records → structs; variants → enums; enums → enums; `List a` → `Vec<T>`; `Optional a` → `Option<T>`; `TextMap`/`GenMap` → typed maps. Edge cases (high-precision `Numeric`, nested generics) are specified in the docs so behavior is predictable.

#### Client architecture

The client targets the thin-client-plus-ergonomics layer: typed wrappers over the gRPC and JSON Ledger APIs, streaming-first (`Stream`/`futures`), structured error handling, and an opt-in retry pipeline (tower/backoff) that preserves `command_id` across attempts so ledger-side de-duplication behaves correctly. Command de-duplication uses the change ID (the `user_id` + `act_as` + `command_id` triple) per the Ledger API contract. OpenTelemetry instrumentation flows traces end to end through the Ledger API's existing OTel emission.

The SDK deliberately does not maintain an in-process Active Contract Set cache; the participant node owns authoritative state and PQS exposes it queryably. The optional PQS client (below) is the Canton-native answer to "give me a typed view of active contracts" without a divergent cache.

#### PQS client (typed, no hand-written SQL)

PQS is Digital Asset's PostgreSQL projection of ledger state, with contract payloads stored as JSONB. Without a typed wrapper, application code reaches in via stringly-typed JSONB navigation with no compile-time checks. The Rust PQS client consumes the codegen-emitted types and lets callers express queries through typed predicates compiled to parameterized JSONB path queries, preserving Postgres types end to end.

#### CIP-56 token standard

`canton-token` wraps the registry off-ledger API to resolve `factoryId`, `choiceContextData`, and `disclosedContracts`, fetches ledger-derived `createdEventBlob` via the active-contracts query with `includeCreatedEventBlob=true` when needed (cached by contract id), and exercises `TransferFactory_Transfer` and allocation choices through the normal command path. It reuses the existing token-standard mechanism; it does not fake or hand-serialize `createdEventBlob`.

#### External / interactive submission

Support for the Interactive Submission Service so external-party (CIP-0103) flows can prepare, sign, and submit transactions. Signing is pluggable: an HSM/KMS-backed signer can be supplied by the integrator. The SDK does not hold raw keys.

#### Integration with `dpm`

Codegen is distributed as a `dpm` component (`dpm codegen-rust`) per the dpm-components model, so Rust codegen runs through the same toolchain entry point as the rest of the ecosystem rather than as a competing standalone CLI.

#### Key dependencies

`tonic`/`prost` (gRPC), `tokio`, `reqwest` (JSON transport), `daml-lf-archive` (LF decoding, via a thin JVM helper where required), `rust_decimal`/`bigdecimal`, `serde`, OpenTelemetry.

#### Proof-of-Concept status

Milestone 1 delivers a working PoC: a real transaction submitted and read on LocalNet/DevNet through the async client, open-source and CI-green, with a recorded demo. This retires the "can it be built?" risk before later milestones.

**What the PoC does not cover (and what the grant funds):** full Ledger API coverage, the SCU-aware codegen, the PQS client, CIP-56 support, external signing, the `canton-splice-*` crate distribution, conformance testing, the security review, and documentation.

#### Quality assurance

Unit tests, integration tests against LocalNet/DevNet, a conformance suite (codegen output compiles and round-trips against real DARs; submit → observe → query verified on both transports), CI on the supported Canton release matrix, and an independent security review at Milestone 3.

#### Open-source practices

Apache-2.0, semantic versioning, published crates on crates.io, public CI, contribution guide, and full rustdoc plus a docs site.

### 3. Architectural Alignment — Extending Daml / Canton into the Rust Ecosystem

The default approach is to extend what exists (per the template guidance in PR #258). This proposal does so at two layers.

**Layer 1 — Tooling.** The SDK consumes the existing Canton public API surface unchanged: the Ledger API v2 `.proto` files for the gRPC client, the JSON Ledger API for HTTP backends, and `daml-lf-archive` for DAR-reading codegen. No changes to Canton, Daml, or Splice core repositories are requested. It is a downstream consumer that fills the empty Rust quadrant.

**Layer 2 — Distribution: any DAR → a Rust crate.** The headline user story is broad, not Splice-specific: any DAR can be turned into a typed Rust crate via `dpm codegen-rust`. The Splice protocol DARs (`splice-amulet`, `splice-wallet`, `splice-token-standard`, `splice-validator-lifecycle`, `splice-dso-governance`, and shared utilities) are published as pre-built `canton-splice-*` crates, refreshed on each Canton/Splice release, so a Rust developer integrating Canton Coin or the Token Standard runs `cargo add canton-splice-wallet` instead of vendoring and building DARs by hand. This DAR-as-a-crate distribution model does not yet exist for the Rust ecosystem.

**Why this matters.** Infrastructure and institutional teams operate dependency-management and supply-chain-review workflows where "clone this repo and build it yourself" is a real adoption hurdle. Turning any DAR into a `cargo add` dependency changes the integration shape and compounds across every future Rust Canton integration.

**Integration with the existing developer surface.** Codegen plugs into `dpm`; runtime crates sit alongside the Go, C#, and TypeScript SDKs as the Rust member of the set. Foundation buy-in for a `canton-*` crates.io namespace is a Milestone 1 deliverable; until confirmed, a `nodejumper-canton-*` working namespace is used.

**Coordination with the DA SDK team.** DA's funded SDK roadmap is TypeScript / Java / Python; Rust is outside it. This proposal does not duplicate or pre-empt internal DA work; it fills a quadrant DA has not staffed. We will engage the DA SDK team and the authors of the existing community crate so the ecosystem converges rather than forks.

**Relationship to other proposals.** #38 (Go + Python), #46 (C#/.NET), and #69 (TypeScript dApp SDK) are the parity precedent; this is the same category for Rust. #74 (DAR-to-TypeScript codegen) is the TypeScript codegen analogue; ours is the Rust counterpart on the same `daml-lf-archive` foundation. The existing `DLC-link/canton-lib` community crate is a useful low-level partial (some ledger calls and registry/wallet helpers) with no codegen, conformance, or maintenance guarantee; we consolidate that surface into a complete, versioned, maintained SDK.

### 4. Backward Compatibility

No backward compatibility impact. The SDK is a client-side library and codegen. It adds no protocol, ledger-contract, or standard changes and works against the current Ledger API v2, Daml-LF, and CIP-56 as they are. Generated code depends on `daml-lf-archive` decoding semantics, so it continues to compile against any LF version the archive can read.

---

## Milestones and Deliverables

### Milestone 1: Core Ledger API Client, Auth & PoC
- **Estimated Delivery:** Month 1.5
- **Deliverables:**
  - `canton-ledger` async client (gRPC + JSON): command submission, completion, update/transaction streaming, ACS, event query, with correct change-ID de-duplication.
  - `canton-auth` JWT/OIDC with provider presets.
  - First crates.io release; quickstart; working PoC submitting and reading a transaction on LocalNet/DevNet.
  - `canton-*` namespace confirmation with the Foundation.
- **Verification:** committee or delegate confirms crates install, tests pass, and the PoC submits and reads a transaction end to end.

### Milestone 2: Codegen via daml-lf-archive (SCU-aware) + dpm component
- **Estimated Delivery:** Month 3
- **Deliverables:**
  - `canton-codegen` generating typed Rust from DARs through `daml-lf-archive`, SCU/PackageMap-aware.
  - `dpm codegen-rust` component integration.
  - Documented Daml-LF → Rust type mapping; first `canton-splice-*` reference crates; sample app using generated bindings.
- **Verification:** demonstrate codegen → submit command → observe transaction → query ACS on both gRPC and JSON paths; an SCU version bump regenerates compatible code.

### Milestone 3: CIP-56 Token Standard, External Signing & Security Audit
- **Estimated Delivery:** Month 4.5
- **Deliverables:**
  - `canton-token`: holdings, transfer instruction, allocations, choice-context, disclosed-contract / `createdEventBlob` handling.
  - Interactive Submission with a pluggable signer (HSM/KMS-compatible).
  - End-to-end CIP-56 transfer example; remaining `canton-splice-*` crates.
  - Independent security review of the client, codegen, and token crates.
- **Verification:** CIP-56 transfer settles end to end on DevNet; audit findings remediated.

### Milestone 4: Reference App, Conformance, Adoption & Launch
- **Estimated Delivery:** Month 6
- **Deliverables:**
  - A reference application built entirely on the SDK (e.g. an indexer or settlement service).
  - Conformance/integration test suite and CI on the supported Canton release matrix.
  - At least two independent teams (indexer / validator / oracle / market-making) building on the SDK.
  - Documentation site and a documented long-term maintenance plan.
- **Verification:** reference app runs against DevNet; two external adoptions confirmed; docs and maintenance plan published.

### Post-grant maintenance (separate, not part of the 1,500,000 CC)
Following M4, Nodejumper proposes ongoing quarterly maintenance (codegen refresh on each Canton/Splice release, dependency and security updates, issue triage) under a separate maintenance grant subject to committee review, mirroring the model used for other DA-originated and community tooling.

---

## Acceptance Criteria

Evaluated on ecosystem value, not artifact delivery:

- A developer adds the crate, points at a participant, and submits a first transaction; generated bindings compile against a real DAR.
- The CIP-56 transfer example settles end to end on DevNet (demonstrated, not mocked).
- Codegen reads Daml-LF via `daml-lf-archive` and handles an SCU version bump correctly.
- Crates are published on crates.io and codegen runs as a `dpm` component.
- At least two independent teams have adopted the SDK by Milestone 4.
- Documentation, tests, security-review results, and a maintenance plan are published under Apache-2.0.

---

## Funding

**Total Funding Request:** 1,500,000 CC

The amount reflects a roughly six-month build of a multi-crate SDK plus DAR codegen, a PQS client, CIP-56 support, external signing, the `canton-splice-*` distribution, a reference application, an independent security review, and documentation. At 1,500,000 CC this is roughly 60% of the comparable C#/.NET (#46, 2,500,000 CC base) and Go (#38, 2,260,000 CC) SDK grants for an equivalent class of work, reflecting efficient delivery by an existing validator team. Each tranche is sized to its engineering scope.

### Payment Breakdown by Milestone
- Milestone 1 (Core client, auth, PoC): 400,000 CC upon committee acceptance.
- Milestone 2 (Codegen + dpm component): 450,000 CC upon committee acceptance. The highest-engineering component (LF decoding, SCU, type mapping).
- Milestone 3 (CIP-56, external signing, security audit): 400,000 CC upon committee acceptance. Includes the independent security review (budgeted at roughly 150,000–200,000 CC within this tranche).
- Milestone 4 (Reference app, conformance, adoption, launch): 250,000 CC upon final release and acceptance.

### Volatility Stipulation
The project is scoped to complete in under six months. Should the timeline extend beyond six months due to Committee-requested scope changes, remaining milestones will be renegotiated to account for USD/CC price volatility.

### Target use cases
- **Indexers and data services.** Rust indexers ingesting Ledger API streams with typed events instead of hand-decoded JSONB.
- **Validators and node tooling.** Operators building monitoring, reconciliation, and automation in Rust against their own participant.
- **Oracle relays and market-making.** Latency-sensitive services that need direct, in-process Canton access rather than a sidecar in another language.
- **CIP-56 integrations.** Any Rust service moving Canton Coin or token-standard assets.

### The opportunity
Canton's language coverage is converging; Rust is the remaining gap and serves the infrastructure cohort that operates closest to the network. Closing it lets those teams build natively instead of crossing language or process boundaries.

### Risk mitigation
- **Build risk** is retired by the Milestone 1 PoC.
- **Overlap risk** is addressed by consolidating the existing community crate and shipping codegen through `dpm`.
- **Adoption risk** is addressed by the `canton-splice-*` crates (zero-to-integration in one `cargo add`) and the reference application.
- **Maintenance risk** is addressed by Nodejumper's standing-validator commitment and the post-grant maintenance model.

---

## Co-Marketing

Upon release, Nodejumper will collaborate with the Foundation on:

- An announcement and a "first Rust app on Canton in 10 minutes" walkthrough.
- A reference-application case study (indexer or settlement service).
- Developer enablement: quickstart, examples, and office hours.

---

## Rationale

### Why Rust
Rust is the language of performance-sensitive, infrastructure-adjacent services: indexers, validators, oracle relays, and market-making engines. These teams need direct, typed, in-process access to Canton, and today they have no maintained SDK. It is the one unfilled language quadrant after Go, C#, TypeScript, and Python.

### Why this approach
A real SDK is more than transport stubs. The reusable value is correct de-duplication, DAR-versioned typed bindings (SCU-aware), CIP-56 handling, auth, and idiomatic async, maintained together and tested for conformance. Shipping codegen as a `dpm` component keeps it in the standard toolchain instead of fragmenting it. The DAR-as-a-crate distribution model turns integration into a single `cargo add`.

### Why this proposer
Nodejumper operates the exact infrastructure this SDK serves (validators, node tooling across 20+ networks since 2022, no slashing), builds open-source tooling, and has hands-on Canton/CIP-56 depth from prior dev-fund work. A language binding lives on its maintenance; as a standing Canton validator we have a durable reason to keep it current.

### Long-term sustainability
- **Current model.** Nodejumper is the primary steward; maintenance is funded via a separate quarterly grant (post-M4) subject to committee review.
- **If adoption grows.** Apache-2.0 from day one enables community contributions; growth broadens the maintainer pool rather than reducing stewardship.
- **Stewardship-transfer triggers.** Nodejumper initiates a transfer conversation only if its capacity to maintain at the committed cadence is impaired, or by mutual agreement with the Foundation; repository and crates.io ownership move to the `canton-foundation` org under that model.
- **If maintenance funding is not renewed.** The SDK keeps working against stable Canton APIs; published crates remain available; generated code keeps compiling against any LF version `daml-lf-archive` can read. Comprehensive docs and test coverage keep the bus factor low.

### Comparison with existing SDKs
Go and Python (#38), C#/.NET (#46), and TypeScript (#69) cover their languages; this is the Rust member of that set, built on the same official `daml-lf-archive` foundation and integrated through `dpm`. The `DLC-link/canton-lib` community crate is consolidated into a complete, maintained SDK with codegen and conformance.

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

### A.4 — CIP-56 transfer (token standard)
```rust
let transfer = token.transfer(TransferRequest {
    sender, receiver, instrument, amount: dec!(100),
}).await?; // resolves factory + disclosedContracts, submits, returns instruction
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

An independent security review is scheduled at Milestone 3, covering the gRPC and JSON clients, the codegen output path, the token crate, and the signing integration. It is commissioned proactively (rather than on committee request) so findings are remediated against the API surface adopters will actually consume, ahead of the Milestone 4 launch. The review is budgeted within the Milestone 3 tranche (roughly 150,000–200,000 CC); if final code volume materially exceeds the estimate, the delta is raised at the standard re-evaluation point per the Volatility Stipulation rather than mid-review.
