# Development Fund Proposal: Upstreaming and Integrating the K2F Labs' Rust SDK for Canton

**Author:** K2F Labs (https://k2flabs.com) — Kevin Ko (kko@k2flabs.com)
**Status:** Draft
**Created:** 2026-07-10
**Label:** canton-apis
**Champion:** need Champion

---

## Abstract

K2F Labs has been a Canton Foundation participant for over a year and operates production applications on Canton mainnet, including Walley, a self-custodial wallet (walley.cc). They run on a comprehensive Rust SDK we built early in our work on Canton. The SDK covers the ledger client, DAR code generation, a typed Daml runtime, value transcoding, and a Splice application layer for the token standard registry, Scan, and wallet flows, and it processes thousands of production transactions.

This proposal funds three things:

1. **Open-sourcing** the SDK under Apache-2.0, hardened for general use, with documentation, CI, and published crates.
2. **Upstreaming** it into the ecosystem's published standards: conformance against Digital Asset's Ledger Client Standard, a documented Daml-LF to Rust type mapping, and contributions to DA-owned components where applicable.
3. **Integrating** it with the official toolchain: distribution through `dpm` and a release process that tracks the Canton/Daml/Splice release cadence.

The result is a production-proven Rust stack available to the ecosystem immediately, maintained long term by a team whose own infrastructure depends on it.

---

## Specification

### 1. Objective

Turn K2F's existing production Rust SDK into a public, standards-aligned ecosystem asset. One objective, three workstreams: open-source release, standards alignment, and toolchain integration, followed by an adoption milestone gated on external usage.

**Out of scope:**

- Building a new SDK from scratch. Everything in this proposal starts from code running in production today.
- Any application product (wallet, DEX, indexer service). Our applications are evidence of the SDK's maturity, not deliverables.
- Protocol, ledger-contract, or standard changes.

### 2. Implementation Mechanics

The SDK is organized as two Rust workspaces, mirroring the layering of the Canton stack itself.

**`canton-sdk`: protocol and ledger layer**

| Crate | What it does |
|-------|--------------|
| `daml` | Runtime for generated code: `Template`, `Interface`, `Record`, `EventDecoder` traits; `Contract`, `Created`, `Exercised`, `Transaction`, `Update` types; JSON and value codecs; error handling |
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

**Hardening for general use (funded work, priced honestly).** The workspaces were built for K2F's needs and carry internal assumptions: git submodules for proto sources, a sibling-checkout requirement for codegen, bundled DAR sets, and workspace-specific build paths. Milestone 1 removes these: self-contained builds, public CI, crates.io publication, quickstarts, and API documentation.

**Standards alignment.** All upstreaming targets are published, DA-owned artifacts:

- A conformance mapping of the SDK's capabilities against **Digital Asset's Ledger Client Standard**, published as a capability matrix with test coverage per capability.
- A documented **Daml-LF to Rust type mapping**, covering numerics, time types, records, variants, optionals, and maps, reconciled against the LF specification.
- Codegen alignment with the **`daml-lf-archive`** decoding foundation so generated bindings stay correct as LF evolves.
- Token standard flows verified against **CIP-56**, with **CIP-0112 (Token Standard V2)** coverage tracked as the packages roll out.

**Toolchain integration.**

- Codegen distributed as a `dpm` component so DAR to Rust generation runs through the standard toolchain entry point.
- A release process keyed to the Canton/Daml/Splice release cadence: crates and generated bindings refreshed and re-verified against each release, with a published compatibility matrix. K2F already performs this tracking for its own production upgrades; this work makes the output public.

### 3. Architectural Alignment

The SDK is a downstream consumer of the existing Canton public surface: the Ledger API v2 protos, the JSON Ledger API, the token standard CIPs, and the Splice APIs. No changes to Canton, Daml, or Splice are requested.

The work aligns directly with the **App Building and Developer Experience** priority area: reduced developer friction, interoperability across wallets and assets, token standards, and lower total cost of ownership. It also carries a provenance argument no greenfield tooling grant can make: every crate in this proposal is already exercised by production applications on Canton mainnet.

### 4. Backward Compatibility

No backward compatibility impact. The SDK is a client-side library and code generator. It adds no protocol or standard changes and works against the current Ledger API v2, Daml-LF, and token standard as published.

---

## Milestones and Deliverables

### Milestone 1: Open-Source Release (partially retroactive)
- **Estimated Delivery:** Month 2
- **Focus:** Publish the existing SDK as a public good and harden it for use outside K2F.
- **Deliverables / Value Metrics:**
  - `canton-sdk` and `splice-sdk` published under Apache-2.0 with public CI.
  - Internal assumptions removed: self-contained builds, no sibling-checkout or bundled-DAR requirements, documented codegen workflow.
  - Crates published to crates.io with quickstart documentation and a runnable example (connect, submit a command, stream updates, decode events).
  - This milestone recognizes the delivered, production-validated SDK alongside the release work, consistent with prior grants that open-sourced existing production SDKs (see Rationale).

### Milestone 2: Upstreaming and Standards Alignment
- **Estimated Delivery:** Month 4
- **Focus:** Make the SDK verifiably conformant with published ecosystem standards.
- **Deliverables / Value Metrics:**
  - Published capability matrix against the Ledger Client Standard, with conformance tests per covered capability.
  - Documented Daml-LF to Rust type mapping.
  - Codegen alignment with the `daml-lf-archive` foundation; CIP-56 token standard flows covered by conformance tests.
  - Upstream contributions opened against DA-owned repositories where gaps or fixes are identified during alignment.

### Milestone 3: Toolchain Integration and Splice Application Layer
- **Estimated Delivery:** Month 6
- **Focus:** Integrate with the official toolchain and generalize the application-layer crates.
- **Deliverables / Value Metrics:**
  - Codegen available as a `dpm` component.
  - Release process tracking the Canton/Daml/Splice cadence with a published compatibility matrix, exercised across at least one real upstream release during the milestone.
  - Registry, Scan, wallet-flow, and ledger-indexing crates generalized for external consumers, each with documentation and a worked example.

### Milestone 4: External Adoption
- **Opens:** on Milestone 3 acceptance. **Deadline:** 12 months from grant approval.
- **Focus:** Independent teams using the SDK in production. K2F's own applications are standing evidence and are excluded from adoption payouts.
- **Deliverables / Value Metrics:**

| Deliverable | Acceptance Criteria | Tranche |
|-------------|---------------------|---------|
| External production adopter | An independent organization using the crates in a service submitting transactions on Canton mainnet, evidenced publicly or by attestation to the Foundation. Up to 3 credited. | 75,000 CC per adopter (up to 225,000 CC) |
| Adoption completion gate | crates.io downloads across at least 3 distinct organizations; at least 5 external GitHub issues or PRs; community-reported issues triaged to resolution | 75,000 CC |

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on ecosystem value:

- A developer outside K2F can add the crates, generate bindings from their own DAR, and submit a first transaction using only public documentation.
- The Ledger Client Standard capability matrix is published and its conformance tests pass in public CI.
- Codegen runs through `dpm`, and the crates are re-verified against a real Canton/Splice release during the grant period.
- Independent organizations run the SDK in production on mainnet (Milestone 4 tranches pay against those deployments, not against K2F's own usage).
- Documentation, examples, and the compatibility matrix are public.

---

## Funding

**Total Funding Request: 1,000,000 CC**

### Payment Breakdown by Milestone

| Milestone | Payment | % of total |
|---|---|---|
| M1: Open-source release (partially retroactive) | 300,000 CC upon committee acceptance | 30% |
| M2: Upstreaming and standards alignment | 200,000 CC upon committee acceptance | 20% |
| M3: Toolchain integration and Splice application layer | 200,000 CC upon committee acceptance | 20% |
| M4: External adoption | up to 300,000 CC, per-adopter and completion tranches | 30% |
| **Total** | **1,000,000 CC** | **100%** |

The request is sized below comparable SDK grants, reflecting that the core engineering is already complete and validated in production. The funded work is what makes that engineering an ecosystem asset: hardening for general use, standards alignment, toolchain integration, and demonstrated external adoption.

### Security Review (optional pass-through, outside the base)

If the committee requires an independent security review, it is budgeted as a pass-through cost of approximately 120,000 CC with the vendor and scope agreed with the Tech & Ops security subcommittee before the review begins.

### Post-Grant Maintenance: self-funded

K2F requests no maintenance funding. Our production applications run on these crates, so maintenance against new Canton, Daml-LF, and Splice releases is part of our own operational upgrade cycle and will continue regardless of grant status. Semantic versioning, changelogs, and public issue triage are committed as part of that.

### Volatility Stipulation

Engineering milestones (M1 to M3) complete within 6 months. The grant is denominated in fixed Canton Coin and follows the standard re-evaluation at the 6-month mark, with the extended Milestone 4 adoption window reviewed at the 12-month mark.

---

## Co-Marketing

Upon release, K2F Labs will collaborate with the Foundation on:

- A joint announcement of the open-source release.
- A technical case study: a production wallet (Walley) built on the SDK, covering architecture and transaction volumes.
- Developer enablement: quickstarts, worked examples, and participation in ecosystem developer channels.

---

## Motivation

Rust is built for the systems that run against a financial ledger. It combines native-code performance with predictable latency (no garbage collector pauses), memory safety enforced at compile time, and a type system and ownership model that eliminate data races and whole classes of defects before the code runs. For services that hold or move funds, these properties translate directly into throughput, correctness, and lower operational risk, which is why trading systems are written in Rust. Canton developers do not have a maintained, production-proven Rust stack today; teams building indexers, settlement and trading services, and wallet backends write raw gRPC/JSON wrappers per project. This proposal gives them a stack already proven at exactly that job: the same crates power production applications, including a self-custodial wallet, processing thousands of transactions on Canton mainnet.

Two properties distinguish this from funding new tooling:

- **Immediacy.** The code exists. Milestone 1 puts a working, production-validated Rust stack in the ecosystem's hands within two months, rather than at the end of a development cycle.
- **Alignment insurance.** K2F depends on these crates commercially, which is the strongest available guarantee that they remain maintained, current with Canton releases, and free. The alternative for us is maintaining private infrastructure that slowly diverges from the ecosystem; this proposal is how we avoid that outcome for everyone.

We estimate the beneficiary set as every Rust-first team integrating Canton: based on ecosystem language distribution among infrastructure operators, a substantial share of new indexer, market-making, and wallet-backend integrations.

---

## Rationale

**Why this approach.** The template's guidance is to extend what exists, and that is precisely the design: the SDK consumes the published Canton surface unchanged, aligns to DA-owned standards (Ledger Client Standard, `daml-lf-archive`, `dpm`, the token standard CIPs), and contributes upstream where alignment work identifies gaps. Nothing in the proposal forks or replaces an existing ecosystem component.

**Cost effectiveness.** The engineering behind this SDK was carried out and validated in production at K2F's own expense over the past year. The grant therefore delivers a mature stack to the ecosystem at well below greenfield cost: the request funds the work that turns internal software into a public good (hardening, documentation, standards conformance, and toolchain integration), and it ties the largest single share to externally verified adoption. Milestone 1 recognizes the delivered SDK itself alongside the open-sourcing work, consistent with how the fund has treated prior open-source releases of existing production SDKs (#38).

**Relationship to other proposals.** Go and Python (#38), C#/.NET (#46), and the TypeScript dApp SDK (#69) established the pattern of funding language coverage. An approved proposal (#407) funds a greenfield Rust SDK; this proposal is independent of it: it open-sources an existing production-proven stack now, anchors all milestones to published DA standards rather than to any in-flight work, and adds the Splice application layer (registry, Scan, wallet flows, indexing) that no current grant covers as working client code. We are open to collaboration with all ecosystem Rust efforts, and standards conformance work in Milestone 2 is precisely what makes eventual convergence cheap.

**Sustainability.** Maintenance is self-funded because it is inseparable from operating our own products. If K2F's stewardship capacity ever becomes impaired, repository and crates.io ownership transfer to the Foundation by mutual agreement.
