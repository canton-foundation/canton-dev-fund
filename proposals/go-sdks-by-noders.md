## Development Fund Proposal

**Author:** [Noders LLC](https://noders.team/)  
**Status:** Submitted  
**Created:** 2026-03-03

---

## Abstract

This proposal requests **retroactive funding** for three infrastructure contributions already delivered to the Canton ecosystem, plus ongoing maintenance work as Canton, DAML-LF, and related APIs evolve.

This proposal explicitly asks the Committee to recognize the value of the work that has **already been delivered and adopted**. We are requesting **1,500,000 CC** for the infrastructure work already completed, plus **100,000 CC per month for the next 6 months** to maintain, harden, document, and evolve these libraries in step with the Canton ecosystem. After this 6-month maintenance window, the grant should be **reviewed and reassessed** based on ecosystem adoption, roadmap needs, and the volume of ongoing compatibility work.

The delivered work consists of:

1. **Go DAML SDK** (`noders-team/go-daml`) — a comprehensive Go SDK for interacting with DAML/Canton ledgers, including a full Ledger API + Admin/Topology client layer and a production-ready **type-safe code generator** for `.dar` packages.

2. **Go Wallet SDK (DAML)** (`noders-team/go-wallet-daml`) — a Go library for building wallet / application backends on Canton, aligned with emerging Canton wallet / dApp interoperability patterns (including initial “DApp API support”), and designed to work with Token Standard and ledger RPCs.

3. **Upstream Python contributions to Digital Asset’s DAZL client** (`digital-asset/dazl-client`) — two merged PRs adding:
   - **protobuf “v3” / newer LF parsing support**
   - **OpenAPI/JSON API client generation + sandbox JSON API support**

   These contributions enable Python developers to integrate with newer Canton/Splice interfaces with less friction.

Although the grant program opened after the bulk of development was completed, the ecosystem need is ongoing: **these libraries must be maintained** (compatibility, security, CI/test matrices, documentation, bugfixes, and upstream coordination) so that teams can reliably build applications on Canton without re-implementing low-level integrations.

---

## Specification

### 1. Objective

**Problem:** Canton application teams repeatedly face integration overhead caused by:
- rapid evolution of **DAML-LF / protobuf schemas**, SDK versions, and ledger interfaces;
- operational complexity around **Ledger API + Admin API + Topology Manager**;
- fragmented tooling across languages (Go and Python), plus differences between gRPC-based APIs and JSON/OpenAPI-based APIs.

There is also a practical ecosystem adoption problem: Canton adoption improves when teams can integrate it from the language stack they already use for infrastructure and backend systems. In blockchain, Go is already a proven infrastructure language rather than an experimental one: the Cosmos SDK is Go-based and used by 200+ production chains, Geth is the official Go implementation of Ethereum, and Chainlink’s core node is also built as Go-based infrastructure. This is highly relevant to Canton, because most ecosystem work around a ledger does not happen only in contracts — it happens in SDKs, wallet backends, relayers, admin tooling, CLIs, indexers, and API services. Supporting Go therefore lowers integration friction for blockchain teams and makes Canton easier to adopt without forcing them into an unfamiliar implementation stack.

**Outcome:** Provide (and maintain) a stable, well-documented, well-tested set of **core developer building blocks**:
- A Go SDK and code generator that lets developers build type-safe Canton/DAML integrations quickly.
- A Go wallet/dApp backend library aligned with the Canton wallet interoperability direction.
- Upstream Python client improvements that keep DAZL compatible with newer LF/protobuf versions and enable JSON/OpenAPI workflows.

**Success looks like:**
- Developers can start new Canton integrations faster (codegen + higher-level services).
- Fewer ecosystem regressions when Canton / DAML-LF versions advance.
- Clear versioning, compatibility matrix, and reproducible CI coverage.
- Ongoing maintenance with predictable cadence and response times.
- Continued enablement of teams that prefer to build backend and infrastructure components in Go instead of having to adopt an unfamiliar language stack.
- Public educational materials, examples, and developer events that help new teams onboard faster.

---

### 2. Implementation Mechanics

This proposal covers three workstreams that together provide multi-language, end-to-end developer enablement.

These workstreams are not theoretical or speculative. **Based on our current observations, approximately 4–5 teams, including our own, are already using the Go SDK and Go Wallet SDK** in their development workflows. While this is still early adoption, it is already a meaningful signal that the tooling fills a real ecosystem need and merits ongoing maintenance as shared infrastructure.

---

#### Workstream A — Go DAML SDK + Code Generator (`noders-team/go-daml`)

**What it is**

A modular Go SDK with:
- a full gRPC **Ledger API client** with connection management, auth/TLS, and service routing;
- **dual-connection support** (ledger + admin endpoints);
- higher-level **service abstractions** for ledger/admin/topology workflows;
- a robust `.dar` **code generator** producing type-safe Go structs and JSON (de)serialization for DAML types.

**Key components (as implemented)**

- Public SDK packages under `pkg/` (`client`, `service`, `model`, `auth`, `codec`, `errors`, `types`), designed for application developers.
- Code generator under `internal/codegen/`:
  - parses DAML-LF binaries extracted from `.dar` archives;
  - supports multiple DAML-LF versions (v2 and v3) with automatic version detection;
  - generates Go structs and JSON serialization helpers for complex DAML constructs (Records, Variants, Enums, etc.);
  - embeds Package ID / metadata where needed for safe runtime usage.
- Cross-platform build and distribution approach (Linux/macOS/Windows; amd64/arm64).

**Delivered updates (“all updates” summary based on tagged releases)**

- **v0.2.0 (28 Nov)**
  - subscribe interfaces + filter test work
  - codegen name de-duplication
  - use `pkgname` in generation
- **v0.3.0 (15 Dec)**
  - updated `getActiveContracts`
  - added admin topology functionality
- **v0.4.0 (16 Jan)**
  - replaced internal maps approach
  - extended tuple support
  - exported `ToMap()` in codegen
  - bug fixes
- **v0.5.0 (16 Jan)**
  - hot-fix around maps
- **v0.6.0 (16 Jan)**
  - fixed Timestamp bug
  - added “vetted” package functionality
- **v0.6.1 (02 Feb)**
  - added `WithGRPCDialOptions` for custom gRPC dial options
  - updated Go version baseline

**Why it needs maintenance**

This SDK touches the most change-sensitive layers: ledger APIs, admin APIs, topology workflows, and the DAML-LF schema/codegen pipeline. Maintenance scope includes:
- tracking Canton/DAML-LF upgrades (protobuf schema changes, ledger API evolution);
- keeping codegen stable and deterministic;
- maintaining CI compatibility matrix (Go versions + supported Canton/DAML-LF ranges);
- quickly responding to bugs that block ecosystem teams.

---

#### Workstream B — Go Wallet SDK (DAML) (`noders-team/go-wallet-daml`)

**What it is**

A Go “wallet / application backend” library for Canton/DAML that focuses on:
- a **Wallet SDK** layer aligned with Canton wallet needs (including Token Standard integration);
- API surface suitable for dApp/backend usage (initial “DApp API support”);
- operational scaffolding: auth handling, portability, and integration-friendly structure.

**What was delivered**

- Token-standard-aware SDK primitives and structure intended for Canton wallet backends.
- Release cadence with incremental improvements:
  - **v0.1.0 (16 Jan)** — initial release
  - **v0.2.0 (23 Jan)** — **dApp support**
  - **v0.3.0 (04 Feb)** — support for **custom gRPC dial options**
  - **v0.4.0 (16 Feb)** — environment cleanup / operational hygiene improvements

**Why it needs maintenance**

Wallet/backend integrations are highly sensitive to:
- changes in token standard workflows and endpoint conventions;
- security expectations (auth, transport, secret handling patterns);
- evolving ecosystem patterns for wallet–dApp interoperability.

Maintenance scope includes:
- stabilizing and documenting DApp API patterns and examples;
- compatibility work as ledger/admin APIs evolve;
- test harness improvements for realistic developer workflows.

---

#### Workstream C — Upstream Python DAZL contributions (`digital-asset/dazl-client` PRs #541 and #543)

**What it is**

Two merged upstream contributions to improve the Python DAZL client so it remains usable with newer Canton/DAML-LF ecosystems and newer API modalities.

##### PR #541 — “python: v3 support” (merged Nov 20, 2025)

Adds support for newer protobuf / LF parsing requirements (described in the PR as “newest protobuf lf_2 version (i.e. 3.3.0+)”), including:
- parser factory architecture (`parse_base`) to merge legacy parsing paths;
- migration of legacy parsing into a dedicated module;
- introduction of a v2 parsing module and exported version selection logic;
- unit tests validating v2 parsing against a `.dar` sample and ensuring non-None field parsing.

##### PR #543 — “openapi support” (merged Dec 8, 2025)

Introduces OpenAPI/JSON API support in DAZL, including:
- auto-generated OpenAPI clients via `openapi-python-client`;
- Makefile targets to download swagger from a Splice node, generate bindings, and clean artifacts;
- exporting API methods via `python/dazl/api/__init__.py` and adding `AuthenticatedClient`;
- sandbox launcher updates to support JSON API;
- basic unit test coverage for the generated methods.

**Why it needs maintenance**

Upstream contributions reduce ecosystem friction, but only if they remain compatible with:
- new protobuf/LF versions;
- evolving swagger/OpenAPI schemas;
- changes in Splice JSON API endpoints and authentication conventions.

Maintenance scope includes:
- responding to upstream review feedback and future refactors;
- updating codegen scripts and patches for OpenAPI generation as schemas evolve;
- maintaining tests and example usage.

---

### 3. Architectural Alignment

This proposal aligns with Canton architecture by strengthening and maintaining the primary “developer interface layers”:

- **Ledger API (gRPC):** robust clients and service abstractions reduce duplicated integration work and standardize patterns across ecosystem teams.
- **Admin + Topology workflows:** topology read/write operations (namespace delegations, party mappings) are critical for real deployments; having maintained client tooling improves operational safety and ecosystem consistency.
- **DAML-LF / protobuf evolution:** multi-version LF support in Go codegen and upstream Python parsing support reduce breakage when the ecosystem upgrades.
- **JSON/OpenAPI modality:** OpenAPI client generation in Python supports teams building around JSON API access patterns (including Splice-node swagger acquisition and sandbox JSON API enablement).
- **Interoperability direction (wallet/dApp):** the Go wallet library and its “DApp API support” push toward standardized wallet–application integration patterns.

Together, these three contributions reduce the cost of building on Canton and improve interoperability and upgrade resilience across the ecosystem.

---

### 4. Backward Compatibility

- Go libraries follow tagged releases and maintain stable public APIs where possible. Any breaking changes (if required by upstream API evolution) will be released under semver-appropriate version bumps and accompanied by migration notes.
- Python contributions are upstreamed into `digital-asset/dazl-client` and follow that project’s compatibility and release process.

**Expected impact:** minimal disruption; changes are managed via versioning and documented migration guidance.

---

## Milestones and Deliverables

> Note: Since the development has already been delivered, the milestones below focus on **maintenance, compatibility, and hardening** over a 6-month support window.

### Milestone 1: Maintenance Baseline + Compatibility Matrix

- **Estimated Delivery:** 2026-04-15
- **Focus:** Establish predictable maintenance and confidence for ecosystem teams.
- **Deliverables / Value Metrics:**
  - Publish a clear **compatibility matrix** (Go versions, supported Canton/DAML-LF ranges; Python DAZL compatibility notes for LF/protobuf and JSON/OpenAPI flows).
  - CI improvements: reproducible test runs, pinned toolchain versions, and smoke tests for core workflows (codegen, ledger calls, topology ops).
  - Documentation updates: “getting started”, minimal examples, and troubleshooting sections for common integration failures.
  - Triage process: defined issue response SLA (e.g., initial response within 3 business days for critical integration issues).
  - Publish initial onboarding materials for new developer teams, including setup guides and reference usage patterns.

### Milestone 2: Hardening + Test Coverage Expansion

- **Estimated Delivery:** 2026-06-15
- **Focus:** Reduce production risk and improve developer UX.
- **Deliverables / Value Metrics:**
  - Expand unit/integration tests for:
    - Go codegen determinism and schema edge cases;
    - Go topology/admin operations coverage.
  - Add at least 2 end-to-end reference examples:
    - Go example using generated types + ledger interactions.
  - Release at least one tagged version for each Go repo (as needed based on fixes and upstream changes).
  - Produce developer-facing educational materials that make adoption easier for additional Canton ecosystem teams.

### Milestone 3: Upgrade Readiness + Upstream Coordination

- **Estimated Delivery:** 2026-08-20
- **Focus:** Stay aligned with ecosystem evolution and reduce “upgrade shock”.
- **Deliverables / Value Metrics:**
  - Upgrade playbook: documented procedure to update libs for new Canton/DAML-LF/protobuf versions (including how to validate changes).
  - At least one upstream coordination cycle:
    - work with Digital Asset maintainers on DAZL follow-ups (if required);
    - align with Canton Foundation Tech & Ops on any CIP-adjacent changes affecting wallet/dApp interoperability.
  - Organize ecosystem enablement activities (e.g., workshops, walkthroughs, or office hours) to help teams adopt the SDKs effectively.
  - Final maintenance report with:
    - issues resolved;
    - release notes;
    - known limitations and roadmap suggestions.

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:
- deliverables completed as specified for each milestone;
- demonstrated functionality or operational readiness;
- documentation and knowledge transfer provided;
- alignment with stated value metrics.

Project-specific conditions:
- Compatibility matrix and examples must be publicly accessible in the repos.
- Release tags must include clear changelogs and upgrade notes when applicable.
- For DAZL-related work, changes must remain upstream-compatible and accompanied by tests.

---

## Funding

**Total Funding Request:** 2,100,000 CC

### Payment Breakdown by Milestone

- **1,500,000 CC** upon committee acceptance to recognize and fund the infrastructure work that has already been delivered to the Canton ecosystem.
- **200,000 CC** for Milestone 1 (Maintenance Baseline + Compatibility Matrix) upon committee acceptance.
- **200,000 CC** for Milestone 2 (Hardening + Test Coverage Expansion) upon committee acceptance.
- **200,000 CC** for Milestone 3 (Upgrade Readiness + Upstream Coordination) upon final release and acceptance.

This funding structure reflects two distinct components:

1. **Retroactive funding** for substantial infrastructure work already delivered and already being used by ecosystem teams.
2. **Forward-looking maintenance funding** at **100,000 CC per month for 6 months** to ensure compatibility, hardening, documentation, educational support, and ecosystem coordination.

After this 6-month period, any further maintenance and expansion work should be **reviewed as a continuation or renewal grant**, based on demonstrated usage, ecosystem demand, and the expected volume of compatibility work required by Canton and related upstream changes.

### Volatility Stipulation

If the project duration is **under 6 months**:  
Should the project timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility.

---

## Co-Marketing

Upon milestone completion / release, the implementing entity will collaborate with the Foundation on:
- announcement coordination for major releases and maintenance updates;
- a technical blog post or case study:
  - “Building on Canton in Go with type-safe DAML codegen”
  - “Python JSON/OpenAPI integration patterns for Canton/Splice”
- developer promotion: short “how-to” snippets, example repos and educational materials.

---

## Motivation

These deliverables are valuable to the Canton ecosystem because they:
- reduce integration time for new projects by providing production-ready client layers and code generation;
- reduce duplicated effort across teams (Ledger API, topology, admin operations, wallet patterns);
- improve upgrade resilience as DAML-LF/protobuf schemas and API modalities evolve;
- broaden the developer base by supporting both Go and Python workflows, including JSON/OpenAPI.

This last point is especially important. Go is not a niche language choice in blockchain infrastructure: it is already used across production-grade systems that sit close to protocol, service, and tooling layers. That makes it a strong fit for the exact kinds of backend, service, and infrastructure systems Canton teams need to build around ledgers.

In addition, **approximately 4–5 teams, including our own, are already using the Go SDK and Go Wallet SDK**. This is evidence that these libraries are not merely speculative infrastructure — they are already functioning as shared developer tooling within the ecosystem.

In practice, this infrastructure helps teams ship faster and makes Canton more approachable for builders who would otherwise spend weeks re-implementing low-level glue.

---

## Rationale

Funding ongoing maintenance (rather than only net-new feature development) is the most effective way to preserve ecosystem value from already-delivered infrastructure:

- **SDKs are living dependencies.** Without maintenance, small upstream changes (protobuf schemas, swagger updates, endpoint changes) can break downstream teams.
- **Upstream alignment matters.** The Python DAZL changes were merged upstream; keeping them healthy requires continued coordination and quick fixes when upstream refactors occur.
- **Go + Python coverage is strategic.** Go is common for infra and backend services; Python is common for data pipelines, tooling, and rapid prototyping. Supporting both expands Canton’s effective builder surface.
- **Maintenance milestones are measurable.** Compatibility matrices, CI coverage, examples, releases, and response SLAs are concrete outputs the committee can assess.
- **Developer education compounds the value of infrastructure.** Part of the requested maintenance budget will be used to create onboarding materials and run developer-facing events so teams can adopt the tooling more quickly and with fewer support bottlenecks.

This approach maximizes return on the work already completed while ensuring the broader ecosystem can depend on it safely.
