# Development Fund Proposal: Open-Sourcing the K2F Labs Rust SDK for Canton

**Author:** K2F Labs (https://k2flabs.com), Kevin Ko (kko@k2flabs.com)
**Status:** Draft
**Created:** 2026-07-10
**Label:** canton-apis
**Champion:** to be determined

---

## Abstract

K2F Labs runs a production Rust SDK for Canton. Its core, `canton-sdk`, is an async Ledger API client with DAR code generation, a typed Daml runtime, and value transcoding, and it processes thousands of transactions in production on Canton mainnet, including behind Walley, a self-custodial wallet ([walley.cc](https://walley.cc)). A second workspace, `splice-sdk`, adds a Splice application layer for the token registry, Scan, and wallet flows.

This proposal funds turning that production stack into a public ecosystem asset:

1. **Open-sourcing** the SDK under Apache-2.0, hardened for general use, with documentation, CI, and published crates.
2. **Upstreaming** it into the published standards: conformance against Digital Asset's Ledger Client Standard, a documented Daml-LF to Rust type mapping, and contributions to DA-owned components where applicable.
3. **Integrating** it with the official toolchain: distribution through `dpm` and a release process that tracks the Canton/Daml/Splice release cadence.

The SDK is comprehensive, spanning the ledger protocol layer through the Splice application clients, and its implementation very closely follows the official Java client bindings, keeping it maintainable against upstream releases and verifiable against a reference implementation. It is production-proven, powering real applications that have processed a high volume of transactions on Canton mainnet. And it is immediately available to open-source, maintained by a team whose own infrastructure depends on it.

---

## Specification

### 1. Objective

Turn K2F's existing production Rust SDK into a public, standards-aligned ecosystem asset. The grant open-sources the SDK, aligns it to the published Ledger Client Standard, integrates it with the official toolchain, and supports adoption by independent teams.

**Out of scope:**

- Building a new SDK from scratch. Everything in this proposal starts from code running in production today.
- Any application product (wallet, DEX, indexer service). Our applications are evidence of the SDK's maturity, not deliverables.
- Protocol, ledger-contract, or standard changes.

### 2. Implementation Mechanics

The SDK is organized as 2 Rust workspaces, mirroring the layering of the Canton stack itself.

**`canton-sdk`: protocol and ledger layer**

| Crate | What it does |
|-------|--------------|
| `daml` | Runtime for generated code: traits (`Template`, `Interface`, `Record`, `EventDecoder`), types (`Contract`, `Created`, `Exercised`, `Transaction`, `Update`), JSON and value codecs, and error handling |
| `daml-derive` | Procedural macros, including `#[derive(Event)]` for event decoding and filtering on user-defined event enums |
| `daml-codegen` | CLI generating typed Rust from `.dar` files, including transitive package dependencies |
| `daml-transcoder` | Transcoding between Daml-LF value representations and wire formats |
| `daml-lf-proto`, `ledger-proto` | Generated types from the Daml-LF and Ledger API v2 `.proto` definitions, regenerated from the canonical Canton sources |
| `ledger-client` | Async gRPC Ledger API client: typed transaction queries, command submission (`submit_and_wait`, `submit_and_wait_for_transaction`), active contract queries, party management |

**`splice-sdk`: Splice and token standard application layer**

| Crate | What it does |
|-------|--------------|
| `splice-core`, `splice-ledger`, `splice-db` | Splice-specific command submission and queries, OIDC auth, and Postgres persistence (`sqlx`) for indexed ledger state |
| `registry-client`, `registry-core`, `registry-ledger` | Token registry API client (OpenAPI-generated) with business logic and caching for allocation instruction flows, plus ledger-side integration |
| `scan-client`, `scan-proxy-client`, `scan-ledger` | Scan and scan-proxy API clients with ledger-side integration for chain queries |
| `splice-daml` | Typed bindings generated from the Splice DARs via `daml-codegen` |

**Hardening for general use.** The workspaces were built for K2F's needs and carry internal assumptions: git submodules for proto sources, a sibling-checkout requirement for codegen, bundled DAR sets, and workspace-specific build paths. Milestone 1 removes these: self-contained builds, public CI, crates.io publication, quickstarts, and API documentation.

**Standards alignment.** All upstreaming targets are published, DA-owned artifacts:

- A conformance mapping of the SDK's capabilities against **Digital Asset's Ledger Client Standard**, published as a capability matrix with test coverage per capability.
- A documented **Daml-LF to Rust type mapping**, covering numerics, time types, records, variants, optionals, and maps, reconciled against the LF specification.
- Codegen alignment with the **`daml-lf-archive`** decoding foundation so generated bindings stay correct as LF evolves.
- Token standard flows verified against **CIP-56**, with **CIP-0112 (Token Standard V2)** coverage tracked as the packages roll out.

**Toolchain integration.**

- Codegen distributed as a `dpm` component so DAR to Rust generation runs through the standard toolchain entry point.
- A release process keyed to the Canton/Daml/Splice release cadence: crates and generated bindings refreshed and re-verified against each release, with a published compatibility matrix. K2F already performs this tracking for its own production upgrades, and this work makes the output public.

### 3. Architectural Alignment

The SDK is a downstream consumer of the existing Canton public surface: the Ledger API v2 protos, the JSON Ledger API, the token standard CIPs, and the Splice APIs. No changes to Canton, Daml, or Splice are requested.

The work aligns directly with the **App Building and Developer Experience** priority area: reduced developer friction, interoperability across wallets and assets, token standards, and lower total cost of ownership. Every crate in this proposal is already exercised by production applications on Canton mainnet, so the ecosystem receives a client whose maturity is established rather than projected.

### 4. Backward Compatibility

No backward compatibility impact. The SDK is a client-side library and code generator. It adds no protocol or standard changes and works against the current Ledger API v2, Daml-LF, and token standard as published.

---

## Milestones and Deliverables

### Milestone 1: Open-Source Release (partially retroactive)
- **Estimated Delivery:** Month 3
- **Focus:** Publish the production SDK as a public good, hardened, documented, and conformant to the published standards.
- **Deliverables / Value Metrics:**
  - A developer outside K2F can add the crates, generate bindings from their own DAR, and submit a first transaction using only public documentation.
  - `canton-sdk` and `splice-sdk` published under Apache-2.0 with public CI, self-contained builds, and no sibling-checkout or bundled-DAR requirements.
  - Crates published to crates.io with quickstart documentation and a runnable example (connect, submit a command, stream updates, decode events).
  - A published capability matrix against the Ledger Client Standard with conformance tests per capability, a documented Daml-LF to Rust type mapping, and codegen aligned with the `daml-lf-archive` foundation, so an external team can determine and verify the SDK's coverage.
  - The Splice application-layer crates (registry, Scan, wallet flows, indexing) generalized for external consumers, each with documentation and a worked example.
  - Upstream contributions opened against DA-owned repositories where gaps or fixes are identified.
  - This milestone recognizes the delivered, production-validated SDK alongside the release work, consistent with prior grants that open-sourced existing production SDKs (see Rationale).

### Milestone 2: Toolchain Integration
- **Estimated Delivery:** Month 5
- **Focus:** Integrate code generation with the official toolchain and track the release cadence.
- **Deliverables / Value Metrics:**
  - An external team generates Rust bindings from its own DAR through the standard `dpm` toolchain.
  - Codegen distributed as a `dpm` component where the toolchain's plugin mechanism supports it. If that mechanism is not yet available, codegen ships as a standalone entry point and integrates once it lands, with the dependency documented.
  - A release process tracking the Canton/Daml/Splice cadence with a published compatibility matrix, exercised across at least 1 real upstream release.

### Milestone 3: External Adoption
- **Opens:** on Milestone 2 acceptance. **Deadline:** 12 months from grant approval.
- **Focus:** Independent teams using the SDK in production. K2F's own applications are standing evidence and are excluded from adoption payouts.
- **Deliverables / Value Metrics:**

| Deliverable | Acceptance Criteria | Tranche |
|-------------|---------------------|---------|
| External production adopter | An independent organization using the crates in a service submitting transactions on Canton mainnet, evidenced publicly or by attestation to the Foundation. Up to 3 credited. | 100,000 CC per adopter (up to 300,000 CC) |
| Adoption completion gate | crates.io downloads across at least 3 distinct organizations, at least 5 external GitHub issues or PRs, and community-reported issues triaged to resolution | 50,000 CC |

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on ecosystem value:

- A developer outside K2F can add the crates, generate bindings from their own DAR, and submit a first transaction using only public documentation (Milestone 1).
- The Ledger Client Standard capability matrix is published so an external team can determine and verify the SDK's coverage (Milestone 1).
- An external team generates Rust bindings through `dpm`, and the crates are re-verified against a real Canton/Splice release during the grant period (Milestone 2).
- Independent organizations run the SDK in production on mainnet, and the Milestone 3 tranches pay against those deployments, not against K2F's own usage.
- Documentation, examples, and the compatibility matrix are public.

---

## Funding

**Total Funding Request: 1,000,000 CC**

### Payment Breakdown by Milestone

| Milestone | Payment | % of total |
|---|---|---|
| M1: Open-source release (partially retroactive) | 500,000 CC upon committee acceptance | 50% |
| M2: Toolchain integration | 150,000 CC upon committee acceptance | 15% |
| M3: External adoption | up to 350,000 CC, per-adopter and completion tranches | 35% |
| **Total** | **1,000,000 CC** | **100%** |

The request is sized below the approved greenfield Rust SDK, reflecting that the core engineering is already complete and validated in production. The engineering base (Milestones 1 and 2, 650,000 CC) pays for delivering the release, standards conformance, toolchain integration, and the Splice application layer that no current grant covers. The remaining 35% is contingent on demonstrated external adoption, so the fixed share pays for concrete deliverables and the contingent share rewards independent teams actually adopting the SDK.

### Basis for Payment

Milestone 1 delivers an existing, production-validated SDK alongside the work to make it a public good:

- **Already built, recognized by this milestone:** the `canton-sdk` and `splice-sdk` crates (the Daml runtime and code generator, value transcoder, async Ledger API client, and the Splice application layer for the token registry, Scan, and wallet flows), running in production powering Walley on Canton mainnet.
- **New work funded by this milestone:** hardening for general use (self-contained builds, removing the sibling-checkout and bundled-DAR requirements), public CI, crates.io publication, quickstart, and documentation.

### Retroactive Compensation

Milestone 1 is partially retroactive. It recognizes the delivered SDK above, built and validated in production before this grant, following the fund's established pattern of open-sourcing existing production SDKs (the Go, C#/.NET, and TypeScript language grants). Where a deliverable was met and verifiable before the grant's effective date, K2F requests the Foundation authorize retroactive payment for it. Verification rests on dated evidence: the project's git history with commit and tag dates predating approval, the published crates, and the Walley production deployment record. The new Milestone 1 work (hardening, public CI, crates.io publication, documentation) is delivered after approval. Milestone 1 is payable upon committee acceptance.

### Security Review (optional pass-through, outside the base)

If the committee requires an independent security review, it is budgeted as a pass-through cost of approximately 120,000 CC with the vendor and scope agreed with the Tech & Ops security subcommittee before the review begins.

### Post-Grant Maintenance: self-funded

K2F requests no maintenance funding. Our production applications run on these crates, so maintenance against new Canton, Daml-LF, and Splice releases is part of our own operational upgrade cycle and will continue regardless of grant status. Semantic versioning, changelogs, and public issue triage are committed as part of that.

### Volatility Stipulation

Engineering milestones (M1 and M2) complete within 6 months. The grant is denominated in fixed Canton Coin and follows the standard re-evaluation at the 6-month mark, with the extended Milestone 3 adoption window reviewed at the 12-month mark.

---

## Co-Marketing

Upon release, K2F Labs will collaborate with the Foundation on:

- A joint announcement of the open-source release.
- A technical case study: a production wallet (Walley) built on the SDK, covering architecture and transaction volumes.
- Developer enablement: quickstarts, worked examples, and participation in ecosystem developer channels.

---

## Motivation

Rust offers native-code performance, predictable latency without garbage-collection pauses, and compile-time memory safety, which matter for services that hold and move funds. Teams building indexers, settlement and trading services, and wallet backends on Canton today write raw gRPC and JSON wrappers per project, because there is no maintained, production-proven Rust stack. This proposal provides that stack. The same crates power production applications, including a self-custodial wallet, processing thousands of transactions on Canton mainnet.

This differs from funding new tooling because the code already exists. Milestone 1 puts a production-validated Rust stack in the ecosystem's hands in month 3 rather than at the end of a build cycle, and because K2F depends on these crates commercially, they stay maintained and current with Canton releases regardless of grant status.

The beneficiaries are Rust-first teams integrating Canton, indexers, market-making and settlement services, and wallet backends, plus any team that wants the Splice application layer (registry, Scan, wallet flows) as working client code rather than building it from the APIs.

---

## Rationale

**Why this approach.** The template's guidance is to extend what exists, and that is precisely the design. The SDK consumes the published Canton surface unchanged, aligns to DA-owned standards (Ledger Client Standard, `daml-lf-archive`, `dpm`, the token standard CIPs), and contributes upstream where alignment work identifies gaps. Nothing in the proposal forks or replaces an existing ecosystem component.

**Cost effectiveness.** The engineering behind this SDK was carried out and validated in production at K2F's own expense over the past year. The grant delivers a mature stack to the ecosystem at well below greenfield cost. It funds the work that turns internal software into a public good (hardening, documentation, standards conformance, and toolchain integration), with 35% of the request contingent on externally verified adoption. Milestone 1 recognizes the delivered SDK itself alongside the open-sourcing work, consistent with how the fund has treated prior open-source releases of existing production SDKs (#38).

**Relationship to other proposals.** Go and Python (#38), C#/.NET (#46), and the TypeScript dApp SDK (#69) established the pattern of funding language coverage. An approved proposal (#407) funds a greenfield Rust SDK. This proposal is complementary to it in 3 concrete ways. First, provenance and immediacy. #407 is a greenfield build, while this SDK already runs in production on mainnet, so the ecosystem gets a working Rust client now. Second, a second conformant implementation. 2 independent implementations aligned to the Ledger Client Standard make the standard more robust, and the Milestone 1 conformance work is shared ecosystem value regardless of which client a team picks. Third, the Splice application layer (registry, Scan, wallet flows, indexing), which no current grant covers as working client code. To keep the ecosystem converging rather than forking, K2F will coordinate crate namespaces with the greenfield effort and contribute to a shared conformance suite. Both proposals are independent, and neither depends on the other's approval.

**Sustainability.** Maintenance is self-funded because it is inseparable from operating our own products. If K2F's stewardship capacity ever becomes impaired, repository and crates.io ownership transfer to the Foundation by mutual agreement.
