# Canton C++ SDK

| Field | Value |
| :---- | :---- |
| Organization | Equilibrium ([equilibrium.co](https://equilibrium.co)) |
| Author / Primary Contact | Olli Tiainen <olli@equilibrium.co> |
| Status | Submitted |
| Created | 2026-08-31 |
| Proposal Type | RFP-aligned |
| RFP / Roadmap Area | RFP #17: SDKs in different languages |
| Champion | Heslin Kim, Zenith ([@heslin-zenith](https://github.com/heslin-zenith)) |
| Total Funding Request | Up to 2,545,000 CC |
| Project Duration | ~4 months engineering (6-month hard deadline) |
| Label | canton-apis |

---

## Table of Contents

- [Abstract](#abstract)
- [Motivation](#motivation)
- [Specification](#specification)
  - [1. Objective](#1-objective)
  - [2. Implementation Mechanics](#2-implementation-mechanics)
  - [3. Architectural Alignment](#3-architectural-alignment)
  - [4. Backward Compatibility](#4-backward-compatibility)
- [Milestones and Deliverables](#milestones-and-deliverables)
- [Acceptance Criteria](#acceptance-criteria)
- [Funding](#funding)
- [Co-Marketing](#co-marketing)
- [Rationale](#rationale)
- [Why Equilibrium](#why-equilibrium)



## Abstract

Equilibrium proposes the **Canton C++ SDK**, an Apache-2.0 library family that gives native C++ applications typed Ledger API v2 access without adding a JVM or sidecar to their runtime path.

| Deliverable | Published form |
|---|---|
| Canton C++ libraries | `canton-cpp-sdk` with six `canton::*` CMake targets |
| Canton C++ code generation | `canton-codegen-cpp`, shipped as a `dpm codegen-cpp` component |
| Canton C++ verification and adoption artifacts | `canton-conformance-cpp`, `canton-bench-cpp`, `canton-reference-cpp` and versioned documentation |

Engineering delivery is estimated at four months, with a hard deadline of six months. Adoption remains open until month 14. The base grant assigns 70 percent to engineering and 30 percent to adoption: 20 percent for verified MainNet applications and 10 percent for the completion criteria. A security-review pass-through is separate. The amounts are described in detail in [Funding section](#funding).

Equilibrium brings an established C++ practice, recent work on a post-quantum
signature path in a C++ ledger reference client, and grant-funded SDK work in other
ecosystems.

---

## Motivation

### The missing client

A C++ team can find Ledger API protobuf definitions, an OpenAPI document, and SDKs
for Java, TypeScript, Rust, Go, Python and C#. It cannot find a maintained C or C++
SDK that supplies the application-level client behaviour above generated gRPC stubs.

Building directly on the protos still leaves the application layer to implement.
That includes Daml-LF decoding, serialization for every generated record, variant
and enum, change-ID deduplication, command recovery, resumable streams and
reassignment semantics. A sidecar in a supported language avoids some of that work,
but adds a process boundary and a second toolchain. It also splits the signing path.
[Appendix A](#appendix-a-what-canton-codegen-cpp-adds-to-generated-stubs) lists what
generated gRPC stubs do not provide.

The signing path matters because PKCS #11, the standard HSM API, is specified in
ANSI C. A Securosys driver already ships in the Canton wallet repository. The SDK
defines a native C++ signer boundary for interactive submission without putting
another runtime between the application and its keys. Vendor-specific HSM and KMS
drivers remain outside v1.

### Why C++ now

Digital Asset maintains Java and TypeScript SDKs. The Fund has approved Rust (#407),
Go and Python DAZL (#38), C#/.NET (#46), and a Swift/Kotlin mobile SDK (#574). Its SDK
request leaves C++ and Scala without a fully featured SDK. We found no C++ SDK or
open C++ proposal in the Fund repository.

Scala applications can use the maintained Java SDK on the JVM. C++ applications
have no equivalent fallback and must cross a process boundary to use a supported
runtime. That gap sits close to two parts of Canton's institutional market where
native integration matters: trading systems and key-management hardware.

### Who benefits

Digital Asset's 2025 funding round included Tradeweb Markets, Citadel Securities,
Optiver, IMC and Virtu Financial. Its 2024 network pilot included Cboe Global
Markets, IEX, Baymarkets and DTCC. Commercial direct-market-access products for this
market are already distributed as C++ libraries, and PKCS #11 specifies an ANSI C
interface to HSMs. Sources are listed in
[Appendix C](#appendix-c-c-adoption-and-market-evidence).

---

## Specification

### 1. Objective

**A C++ application team can generate typed Daml bindings and build, sign, submit,
stream and query Canton Ledger API v2 workflows through one maintained native SDK,
without adding a JVM or sidecar to the application runtime.**

### 2. Implementation Mechanics

#### 2.1 Deliverables & scope

The Canton C++ SDK gives C++ applications typed access to commands, ledger state,
update streams, token workflows and external signing. Milestone 1 will reconcile the
final capability map with the ledger client standard.

**Named release outputs:**

| Output | Published form |
|---|---|
| Canton C++ SDK | `canton-cpp-sdk` repository |
| Canton C++ libraries | `canton::core`, `canton::ledger`, `canton::admin`, `canton::auth`, `canton::token`, `canton::pqs` |
| Canton C++ code generator | `canton-codegen-cpp` and `dpm codegen-cpp` |
| Canton C++ conformance suite | `canton-conformance-cpp`, with release results under `conformance/results/` |
| Canton C++ benchmark suite | `canton-bench-cpp`, with release results under `benchmarks/results/` |
| Canton C++ compatibility matrix | `COMPATIBILITY.md` |
| Canton C++ reference application | `canton-reference-cpp` |
| Canton C++ documentation | Versioned site generated from `docs/` |
| Canton C++ support policy | `docs/support.md` |
| Canton C++ upgrade playbook | `docs/upgrade-playbook.md` |

**V1 includes:**

- **Core libraries.** A modular family (`canton::core`, `canton::ledger`,
  `canton::admin`, `canton::auth`, `canton::token`, `canton::pqs`) for the transaction,
  state, update and admin services listed below, with JWT/OIDC authentication and
  TLS/mTLS on every transport.
- **Code generation.** `canton-codegen-cpp` generates typed C++ from `.dar` files
  (templates, choices, interfaces, and contract keys, see 2.4), with both gRPC and
  JSON codecs on generated types.
- **Token workflows.** CIP-0056 transfers and allocation-based settlement, and
  CIP-0112 V2 accounts, revised allocations and holding-change events, including
  choice-context resolution and disclosed-contract handling.
- **External signing.** Prepare/execute flows with a pluggable signer interface, a
  software signer and a mock external-signer adapter. Vendor HSM and KMS drivers can
  implement the same interface but are outside v1.
- **PQS access.** A typed Participant Query Store client for PostgreSQL queries.
- **Resilient streams.** Resumable update and completion streams, command
  recovery through the completion service, same-Participant change-ID deduplication,
  and multi-synchronizer reassignment events surfaced as their two constituent
  events. The SDK mirrors the maturity label of the corresponding Canton release.
- **Observability.** OpenTelemetry tracing and metrics with W3C trace-context
  propagation.
- **Conformance.** A test suite that exercises the SDK on LocalNet and DevNet against
  the available ledger client standard capability list, or a matrix reconstructed
  from funded SDK scopes until access is provided.
- **Benchmarks.** A reproducible suite for command submission
  round-trips and update-stream throughput, with methodology and environment stated,
  rerun and republished per release.
- **Documentation and maintenance.** Quickstarts, examples, a compatibility matrix and
  semantic versioning.

**Out of scope for v1 (roadmapped, not excluded):**

- **Topology writes.** Constructing and submitting topology transactions.
- **Topology-event subscriptions.** V1 covers topology reads only.
- **Multi-synchronizer management.** Listing, per-synchronizer vetting and target
  selection. V1 surfaces multi-synchronizer events under the maturity label assigned
  by the supported Canton release.
- **In-memory ACS.** An active contract set kept current from the update
  stream.
- **High-availability features.** Command batching, pending-set tracking,
  cross-participant deduplication, stream
  failover and node-health monitoring for high-availability deployments.
- **WASM and browser targets.** These remain roadmap items.
- **Stable C ABI.** A later C ABI can serve HSM firmware, native extensions, Swift
  and legacy C estates once the C++ API has settled.
- **Vendor HSM and KMS drivers.** V1 publishes and tests the signer interface, a
  software signer and a mock external-signer adapter, but no vendor-specific driver.

Package management is included in this SDK's v1 so C++ operators do not need a second
toolchain to upload and vet a DAR. We will sequence the remaining roadmap with the
canton-apis SIG once v1 adoption data exists.

**Out of scope entirely:** wallet user interfaces, Daml authoring tools, any
alternative runtime or node implementation.


#### 2.2 Canton C++ SDK Sources

The protobuf definitions in `digital-asset/canton` are the source of truth. The SDK
vendors and pins both:

- the `community/ledger-api-proto` module at the pinned Canton release (named
  `community/ledger-api` on the 3.3 and 3.4 release lines), covering
  `com/daml/ledger/api/v2/**` including `admin/` and `interactive/`, plus the
  separately housed value protos; and
- `community/base/src/main/protobuf/com/digitalasset/canton/topology/admin/v30/**`,
  including `TopologyManagerReadService`, together with the Canton protobufs that
  tree imports.

Both roots and their imports are pinned to the same Canton release. The initial
implementation target is Canton 3.5.15, the latest published release checked on
2026-08-28. Supporting a new Canton range triggers re-vendoring in an SDK minor
release and an architecture decision record. The approved Rust SDK uses the same
model.

`COMPATIBILITY.md` publishes one row per exact SDK and Canton patch-release pair. A
pair is not labelled `tested` until its result file exists. Before the first SDK
release, the matrix contains no release rows. Each published row follows these rules:

| `Support` | Required `Canton release` | Required `Contract-key semantics` | Required `Hash-scheme version` | Required `Conformance results` |
|---|---|---|---|---|
| `tested` | Exact patch release | Observed behavior for that release, including uniqueness and negative-lookup validation | Hash-scheme version implemented for that release | Existing result file for the pair |
| `untested` | Exact patch release | `not claimed` | Hash-scheme version implemented for that release | `none` |
| `unsupported` | Exact patch release | `unavailable` | `unavailable` | `none` |

The JSON Ledger API is a secondary transport. It uses the Daml-LF JSON encoding in
the participant's OpenAPI document, not proto3 canonical JSON, so `protobuf` JSON
utilities cannot be reused. The published OpenAPI specification also contains
structures that should not become public SDK types, including duplicated schemas and
untyped payloads. We therefore generate from protos and hand-write thin clients for
the small set of JSON-only endpoints, following the funded C# and Rust SDKs.

#### 2.3 `canton::*` Library Family

The six libraries are layered so dependencies point downwards:

- `canton::core`: values, offsets, errors, retry policy, configuration.
- `canton::ledger`: command submission (sync and async), update service, state
  service, event and contract queries, version service.
- `canton::admin`: party and user management, package management, identity provider
  configuration, pruning, topology read.
- `canton::auth`: token providers (static bearer, OIDC client-credentials with
  caching and refresh), designed so custom providers plug in.
- `canton::token`: token standard workflows over generated interface types.
- `canton::pqs`: typed read-side queries against a Participant Query Store.

These names are both exported CMake targets and C++ namespaces. Their installable
package artifacts use the corresponding hyphenated names: `canton-core`,
`canton-ledger`, `canton-admin`, `canton-auth`, `canton-token` and `canton-pqs`.

Transport uses the gRPC C++ callback API. Errors are classified as retriable or
non-retriable and retain the details returned by the Ledger API. HSM-, KMS- and
file-backed keys plug into one signer interface, following the driver split used by
the Canton wallet SDK.

#### 2.4 `canton-codegen-cpp`

`canton-codegen-cpp` reads a `.dar`, resolves its transitive Daml-LF dependencies,
and emits typed C++ for templates, choices, interfaces, views and contract keys. It
also emits the Ledger API's exercise-by-key and key-prefetch paths. Because platform
support for contract keys varies by Canton release, `COMPATIBILITY.md` records the
semantics of each exact release pair. For the initial Canton 3.5.15 target, that means
non-unique keys and no validation of negative key lookups. A `tested` label therefore
does not imply key uniqueness. Platform key support does not gate a milestone.

Daml-LF decoding happens at code-generation time through a project-owned thin JVM
adapter to the public `daml-lf-archive` interface. Generated code and runtime
libraries have no JVM dependency. The funded C# (#46) and Rust (#407) SDKs use the
same approach. A compatible
shared component can be considered later during maintenance.

The Daml compiler checks smart contract upgrade compatibility at build time. The
participant applies the relevant checks at DAR upload and runtime. A package version
bump regenerates the corresponding C++ types.

#### 2.5 `canton-codegen-cpp` Type Mapping

The mappings that need explicit SDK behaviour are:

| Daml-LF | C++ | Note |
|---|---|---|
| `Numeric n` | `canton::Numeric` (integer mantissa plus scale) | LF allows 38 significant digits. No standard C++ decimal type is sufficient, so the SDK ships a fixed-point type with checked arithmetic; the C# SDK ships a fixed-point type for the same reason. |
| `GenMap k v` | `std::map` with an LF value-ordering comparator | LF maps use built-in value ordering; a hash map would change both key semantics and iteration order. |
| `Optional a` | `std::optional<T>` | |
| Variants | `std::variant` with visitor helpers | |
| Enums | closed `enum class` types | |
| `Time` | `canton::Timestamp` | Microsecond precision, UTC. |
| `Party` | `canton::Party` | Strong typedef, not a raw string. |
| `ContractId t` | `canton::ContractId<T>` | Strong typedef, not a raw string. |

Because C++20 has no standard derive macros, the generator emits JSON codecs for each
record, variant and enum, together with round-trip tests.

#### 2.6 `canton::ledger` Commands and Streams

`canton::ledger` implements the command and stream semantics common to the funded
SDK scopes, subject to the ledger client standard reconciliation in 2.15:

- **Deduplication.** Change ID (acting parties, user ID, command ID) applied on
  both transports. Duplicate-command rejection is guaranteed only when the retry is
  sent to the same Participant.
- **Command recovery.** The completion service is checked after a client crash, lost
  connection or timeout. The SDK does not resubmit a command before checking
  completions for it.
- **Resumable streams.** Update and completion subscriptions resume from a persisted
  offset, and active-contract reads compose with update streams at a consistent
  ledger offset.
- **Multi-synchronizer events.** Reassignments are surfaced as their two constituent
  events (unassigned on the source synchronizer, assigned on the target), never
  collapsed. `COMPATIBILITY.md` mirrors the upstream maturity level; the initial
  Canton 3.5.15 target is labelled Alpha and testing-only, not production-supported.
- **Retries.** Retriable errors use bounded retries and configurable timeouts.

#### 2.7 `canton::token`

`canton::token` resolves transfer and allocation factories, fetches
`createdEventBlob` disclosures, assembles choice context, and exercises CIP-0056 and
CIP-0112 choices. Transfer pre-approvals use the published Splice wallet endpoints.
Registry calls use the Splice OpenAPI definitions and only the `*-external`
endpoints covered by their compatibility guarantee.

#### 2.8 `canton::ledger` Interactive Submission

Interactive submission follows prepare, sign and execute. The `canton::Signer`
interface keeps HSM, KMS and air-gapped key handling outside the SDK. V1 ships a
software signer and `examples/external-signing/mock-signer/`, which exercises the
external process boundary without claiming compatibility with a vendor device.
Because topology writes are outside v1, external parties must already be onboarded
or use a separate onboarding tool.

The interactive submission service requires the client to recompute the transaction
hash: when the preparing participant is not trusted, the client hashes the raw
transaction itself instead of signing the hash the participant returns. `canton::Signer`
receives only that recomputed hash, not the value from the prepare response. For
externally signed transactions, the hash also covers the physical synchronizer ID.

The hashing scheme is versioned and changes between Canton releases, so the SDK pins
a scheme version to each Canton release. The SDK's v1 release pins scheme V2/V3, the
stable scheme on the 3.5.x line after Canton 3.3 dropped V1, and excludes V4, which
is still Dev-protocol only. `COMPATIBILITY.md` lists the hash-scheme version next to
contract-key semantics for every release pair, because `buf` breaking-change
detection does not flag a scheme change. The exact per-release set is settled at
Milestone 1.

#### 2.9 `canton::pqs`

`canton::pqs` provides typed PostgreSQL queries against Participant Query Store and
uses the generated JSON codecs to decode contract payloads. PQS is Apache-2.0
(`digital-asset/participant-query-store`, checked 2026-08-20). The client does not
maintain a second in-process copy of ledger state.

#### 2.10 Canton C++ SDK Observability

The SDK exports traces and metrics through `opentelemetry-cpp` and OTLP. It propagates
W3C trace context over gRPC and JSON, counts requests and responses by endpoint and
outcome, and logs structured Ledger API errors. Log level, format and destination
are configurable.

#### 2.11 Canton C++ SDK Packaging

C++ has no single package manager, so the SDK ships through four channels:

1. CMake `FetchContent` and `find_package` support from the repository, with no
   package-registry dependency for the SDK itself.
2. A Conan recipe, published to a maintained public remote.
3. A vcpkg overlay port maintained in the repository, with submission to the central
   vcpkg registry pursued in parallel.
4. A `dpm` component (`codegen-cpp`) packaging the code generator, so Canton
   developers invoke it the same way as the Java, JS, Rust and C# generators.

Acceptance covers items 1 through 3 and a dpm component installable from our
published recipe. Central registry listings and inclusion in Digital Asset's dpm
assembly manifest will be pursued but do not gate payment.

Milestone 1 asks the Foundation to confirm the `canton::` namespace and `canton-*`
package names. Until then, packages use the `equilibrium-canton-*` prefix. The
approved Rust SDK follows the same process.

#### 2.12 Canton C++ SDK Target Platforms and Toolchains

V1 uses C++20 and accepts against this initial matrix:

| Runner | Architecture | Compiler |
|---|---|---|
| Ubuntu 22.04 | x86-64 | GCC 11 |
| Ubuntu 22.04 | x86-64 | Clang 14 |
| Ubuntu 24.04 | arm64 | GCC 13 |
| Ubuntu 24.04 | arm64 | Clang 18 |
| Windows Server 2022 | x86-64 | MSVC 19.40 (Visual Studio 2022 17.10) |
| macOS 14 | arm64 | Apple Clang 15 |

CI records the compiler patch version and dependency lockfile with each result.
Changing a matrix row before v1 requires a public architecture decision record and
Foundation approval. Runtime dependencies are gRPC/protobuf, an HTTP/WebSocket
library, `opentelemetry-cpp`, `libpq` and a JWT library.

#### 2.13 `canton-conformance-cpp` and Memory Safety

The SDK decodes untrusted network data and prepares payloads for signing, so memory
safety is part of the deliverable. The following checks run in CI, and the review in
[Appendix B](#appendix-b-security-review) covers each decoder boundary.

- **Modern C++ rules.** RAII throughout, no owning raw pointers,
  clang-tidy and compiler warnings as errors.
- **Sanitizers.** AddressSanitizer, UndefinedBehaviorSanitizer and ThreadSanitizer.
- **Fuzzing.** Continuous fuzzing of every decoder boundary (LF JSON codec, stream
  frame handling, completion parsing) with libFuzzer corpora in the repository.
- **Two test tiers.** "No-node" tests (unit tests,
  in-process gRPC and WebSocket mock servers, TLS handshakes, wire-shape assertions)
  always run. Live integration tests against LocalNet and DevNet are gated on
  environment configuration.
- **Coverage.** At least 80 percent on codegen and serialization paths, measured in CI.
- **Independent review.** A third-party security review at Milestone 3, budgeted as
  a pass-through cost.

#### 2.14 Canton C++ SDK Repository Practices

The public `canton-cpp-sdk` repository will use Apache-2.0 from day one. Releases use
semantic versioning, changelogs and migration notes. Issues and PRs are public. The
upgrade procedure lives in `docs/upgrade-playbook.md`. We will offer to transfer the
repository to the Foundation if adoption warrants it.

#### 2.15 `canton-conformance-cpp` and the Ledger Client Standard

Until the current ledger client standard is published, `canton-conformance-cpp` uses
a provisional matrix derived from the published scope of the funded Rust SDK (#407).
The standard itself is not publicly readable. It covers codegen, transport,
authentication, errors, retries, command recovery, signing, streams,
admin operations and token workflows. Each claimed capability runs on LocalNet and
DevNet, with results published per release. Capability rows use this form:

| ID | Capability | Pass condition | Reconstructed from |
|---|---|---|---|
| `commands.dedup.change-id` | Change-ID deduplication on both transports | A resubmission to the same Participant with the same acting parties, user ID and command ID inside the deduplication window is rejected as a duplicate and creates no second transaction. | #407, #46 |
| `streams.update.resume` | Update-stream resume from a persisted offset | A client restarted mid-stream resumes from its stored offset with no gap and no duplicate events. | #407, #46 |

`canton-conformance-cpp` is this SDK's own acceptance gate. It aligns to the Rust
SDK's capability mapping (#407) and consumes the transaction-hashing test vectors
proposed in #617 rather than defining a competing standard. Its capability
definitions and vectors are kept separate from the C++ driver, so the SDK can be
re-verified independently of any one release.

At Milestone 1 we reconcile the scope against Digital Asset's working standard once
we have access and report any differences in `reports/ledger-client-standard.md`. If
the standard is still unavailable, we publish the provisional matrix and reconcile it
when access is provided.

### 3. Architectural Alignment

The Canton C++ SDK extends the existing Canton client stack through published API
surfaces.

- **Ledger API v2 as the contract.** The SDK is a client of the published protobuf
  and OpenAPI surfaces, pinned per Canton release. The V1 critical path is contained
  in the new client repository.
- **The SDK family.** Approved grants cover Rust (#407), Go (#38) and C#/.NET (#46).
  Digital Asset maintains Java and TypeScript, with TypeScript dApp and wallet kits
  under #69. This SDK follows their core patterns: pinned protos, JVM-assisted
  codegen and a protos-first transport strategy.
- **Standards.** Token standard per CIP-0056 and CIP-0112. Interactive submission per
  the Ledger API's interactive service. Wallet-adjacent flows compose with the
  Splice wallet APIs rather than duplicating them.
- **Distribution through dpm.** The code generator ships as a dpm component alongside
  other Canton SDK generators.
- **Coordination.** We will work in the canton-apis SIG, coordinate with Digital
  Asset's SDK maintainers and publish the JVM adapter for reuse by other SDK teams.
- **Equilibrium's other Fund proposals.** We have other proposals in different areas.
  None shares a deliverable, repository or budget line with this SDK, and none of
  the engineers named in Why Equilibrium is committed to a grant that would run alongside it.

### 4. Backward Compatibility

The Canton C++ SDK is an additive client artifact. It leaves existing systems,
integrations and workflows unchanged.

---

## Milestones and Deliverables

The delivery team is three senior C++ engineers with part-time QA and developer
relations support. Dates run from grant approval. Milestones 1 through 3 are checked
against published artifacts and demonstrations. Milestone 4 pays for third-party
adoption.

### Delivery Preconditions

| Dependency | Needed by | Treatment if unavailable |
|---|---|---|
| DevNet endpoint, credentials and a test party authorised to submit | Milestone 1 | LocalNet work continues. The DevNet acceptance check and its deadline start when access is provided. |
| CIP-0056 and CIP-0112 packages, test parties and test assets on the target DevNet | Milestone 3 | Token work continues on LocalNet. The affected DevNet acceptance check waits for the named deployment and access. |
| Security-review pass-through approved and an independent reviewer booked | Milestone 3 | Equilibrium books the reviewer by Milestone 2 acceptance. A later committee approval or reviewer start date moves only the external-review check. |
| Adopter access and permission to publish evidence or attest privately | Milestone 4 | No application earns a tranche until the Foundation receives the specified evidence. |

The ledger client standard is not a delivery precondition. If it remains unavailable,
Milestone 1 publishes the provisional matrix described in 2.15 and records the
missing access. Hard deadlines still apply to every artifact and check within
Equilibrium's control; only the affected external-environment check is deferred.

### Milestone 1: `canton::core`, `canton::ledger`, `canton::auth` and Proof of Concept

- **Estimated delivery:** Month 1.5. **Hard deadline:** 2 months from grant approval.
- **Estimated effort:** ~50 person-days.
- **Focus:** Validate core feasibility and deliver a usable client early.
- **Deliverables:**
  - `canton::core`, `canton::ledger` and `canton::auth`: command submission
    (sync/async), update and completion streams with resume, state service reads,
    JWT/OIDC auth, TLS/mTLS, retry and error classification.
  - Vendored protos pinned to a named Canton release, with `COMPATIBILITY.md` v1.
  - OpenTelemetry tracing and metrics.
  - `examples/localnet-poc/`, submitting and reading a transaction end to end on
    LocalNet and DevNet.
  - First tagged release, `docs/quickstart.md`, and CI (build matrix, sanitizers,
    no-node tests).
  - `reports/ledger-client-standard.md` reconciliation report (2.15).
  - Namespace confirmation requested from the Foundation for the `canton::` C++
    namespace and the `canton-*` package names (2.11).
- **Acceptance checks:**
  - The release builds on every row in the platform matrix in 2.12.
  - Unit, sanitizer and no-node integration tests pass in CI.
  - `examples/localnet-poc/` submits a transaction and reads it back on LocalNet.
  - With the stated access precondition met, `examples/localnet-poc/` submits a
    transaction and reads it back on DevNet.

### Milestone 2: `canton-codegen-cpp`, `canton::admin` and Packaging

- **Estimated delivery:** Month 3. **Hard deadline:** 4 months from grant approval.
- **Estimated effort:** ~70 person-days, including the generation and testing of
  serialization code for each generated C++ type.
- **Focus:** Typed end-to-end development from a `.dar`.
- **Deliverables:**
  - `canton-codegen-cpp` with its project-owned JVM adapter to
    `daml-lf-archive`: templates, choices, interfaces, contract keys, transitive
    dependency closure, and input in both Daml-LF major versions (LF1 and LF2).
  - Daml-LF to C++ type mapping per 2.5, including `canton::Numeric` and ordered
    map semantics, with generated round-trip tests.
  - JSON codecs on generated types and hand-written clients for JSON-only endpoints.
  - Packaging channels live: CMake `FetchContent`/`find_package`, Conan recipe on a
    public remote, vcpkg overlay port, `dpm` codegen component installable.
  - Clean-runner acceptance scripts under `acceptance/packaging/` for CMake, Conan,
    vcpkg and dpm.
  - `canton::admin` (party/user/package management and topology reads through the
    generated v30 `TopologyManagerReadService` client).
  - Executable examples under `examples/ledger/` and `examples/admin/`, plus the
    `examples/codegen/` walkthrough.
- **Acceptance checks:**
  - Generate C++ from a `.dar`, submit with the generated types, and observe the
    transaction.
  - Query the ACS through both gRPC and JSON.
  - Query topology state through `TopologyManagerReadService`.
  - Regenerate compatible code after a package version bump.
  - `acceptance/packaging/cmake.sh` installs the CMake package on a clean runner and
    builds its example project.
  - `acceptance/packaging/conan.sh` installs from the published Conan remote on a
    clean runner and builds its example project.
  - `acceptance/packaging/vcpkg.sh` installs the overlay port on a clean runner and
    builds its example project.
  - `acceptance/packaging/dpm.sh` installs the dpm component on a clean runner and
    generates C++ from the sample `.dar`.

### Milestone 3: `canton::token`, `canton::pqs`, `canton-conformance-cpp` and Security Review

- **Estimated delivery:** Month 4. **Hard deadline:** 6 months from grant
  approval (the external audit window sits inside this milestone).
- **Estimated effort:** ~60 person-days plus the external review window.
- **Focus:** Complete and verify the institutional feature set.
- **Deliverables:**
  - `canton::token`: CIP-0056 transfers and allocation-based settlement; CIP-0112 V2
    accounts, revised allocations and holding-change events; Splice transfer
    pre-approvals; disclosed-contract and choice-context handling.
  - Interactive submission prepare/execute with `canton::Signer`, a software signer
    and the mock external-signer adapter under `examples/external-signing/`.
  - `canton::pqs` typed read-side client.
  - `canton-conformance-cpp` green on the supported matrix, with release results in
    `conformance/results/` and capability definitions and vectors kept as the SDK's
    acceptance gate (2.15).
  - `canton-bench-cpp` published with its environment, methodology, submission
    round-trip p50/p95/p99 and update-stream throughput in `benchmarks/results/`.
    `benchmarks/reproduce.sh` runs five trials on the recorded runner and reports the
    median for each metric.
  - Independent security review completed; critical and high findings remediated
    and `security/remediation.md` published.
  - Canton C++ documentation live: guides, API reference, examples,
    `COMPATIBILITY.md`, versioning, `docs/support.md` and
    `docs/upgrade-playbook.md`.
- **Acceptance checks:**
  - With the stated token-environment precondition met, a CIP-0056 transfer settles
    end to end on DevNet.
  - With the stated token-environment precondition met, a CIP-0112 allocation-based
    transfer executes on DevNet.
  - An externally signed submission executes through the mock signer process.
  - `canton-conformance-cpp` publishes green results for the supported matrix.
  - On the recorded environment, the reproduced submission p50 is within 10 percent
    of the published baseline.
  - On the recorded environment, the reproduced submission p95 is within 10 percent
    of the published baseline.
  - On the recorded environment, the reproduced submission p99 is within 15 percent
    of the published baseline.
  - On the recorded environment, the reproduced update-stream throughput is within
    10 percent of the published baseline.
  - The independent reviewer delivers the final report.
  - Every critical finding is remediated.
  - Every high finding is remediated.
  - `security/remediation.md` is published.
  - The versioned Canton C++ documentation site is live.
  - `docs/support.md` is published.
  - `docs/upgrade-playbook.md` is published.

### Milestone 4: `canton-reference-cpp` and Production Adoption

- **Opens:** on Milestone 3 acceptance. **Deadline:** 14 months from grant approval.
- **Focus:** Verified production usage on Canton MainNet and the adoption outcomes in
  the table below. This milestone carries 30 percent of the base grant. Partial
  adoption earns partial payment.
- **Payment structure:** the MainNet application pool is 20 percent of the base,
  paid as 4 percent per qualified application for up to five applications. The
  completion tranche is 10 percent of the base. It is payable only after at least one
  production application qualifies and every bundled completion criterion is met.

| Deliverable | Acceptance criteria | Tranche payout |
|---|---|---|
| Production application on MainNet | Each independent application records at least 100 successful SDK-submitted MainNet transactions during one declared 30-day window. Evidence names the organisation, application, SDK version, observation window and party ID, supported by an on-chain query or private attestation to the Foundation under an agreed confidentiality arrangement. | 4% of base per app, up to 20% of base |
| `canton-reference-cpp` | An open-source service built entirely on the SDK that submits a token settlement, follows the resulting update and queries the resulting PostgreSQL read model through PQS on DevNet or MainNet. | condition of 10% completion tranche |
| Documentation continuity | The versioned documentation site, `docs/support.md` and `docs/upgrade-playbook.md` delivered in Milestone 3 remain live and current through Milestone 4 acceptance. | condition of 10% completion tranche |
| Organisation adoption | 3 distinct organisations each provide a public integration reference or private attestation naming the SDK version and the integration activity performed. | condition of 10% completion tranche |
| External contributions | 5 accepted contributions from outside Equilibrium. An issue counts only if it is reproducible and in scope; a PR counts only if it is merged. | condition of 10% completion tranche |
| Community issue resolution | 3 accepted community-reported issues are closed with a linked code, test or documentation change. | condition of 10% completion tranche |
| **Milestone 4 maximum** | | 760,000 CC, 30% of the base |

- **Deadline rationale:** the month-14 deadline provides about ten months for
  adoption after the engineering estimate and eight months after the hard deadline.
  This sits between the approved Rust SDK's adoption window and the longer window
  used by the C#/.NET SDK. If Milestone 3 is delayed for reasons outside our control,
  we will request an extension through the standard renegotiation clause.
- **Verification:** adopting teams provide the evidence named in the table directly
  to the committee. A production tranche is not payable from a party ID or isolated
  transaction alone.

---

## Acceptance Criteria

Each milestone is accepted against the capabilities and acceptance checks stated under that milestone, with the published artifacts providing the evidence.

- **Milestones 1 through 3:** the named artifacts are published and each check passes
  on the environment named in that check.
- **Milestone 4:** the Foundation receives the evidence listed in the adoption table.
  Per-application payments require qualified MainNet use; the completion payment also
  requires at least one qualified production application.

Central registry listings, upstream documentation and inclusion in Digital Asset's
dpm assembly manifest are reported but do not gate payment. If the ledger client
standard is unavailable at Milestone 1, we publish the provisional matrix described
in 2.15 and reconcile it when access is provided.

---

## Funding

Total Funding Request: Up to **2,545,000 CC**

The request has an engineering and
adoption base and a security-review pass-through.

The base assigns 70 percent to engineering and 30 percent to adoption outcomes. Engineering is estimated at about 180 person-days across the first three milestones.

### Payment breakdown by milestone

- Milestone 1 (Core client, auth, proof of concept): **400,000 CC** upon committee acceptance
- Milestone 2 (Codegen, JSON codecs, packaging, dpm component): **660,000 CC** upon committee acceptance
- Milestone 3 (Token standard, external signing, PQS, conformance): **725,000 CC** upon committee acceptance
- Milestone 4 (Adoption and production deployment): **760,000 CC** upon final release and acceptance

### Security Review (pass-through, separate from the base)

The independent review is a separate pass-through cost paid at Milestone 3. Its
budget starts from the approved SDK audit quotes (about $24,000 and €26,000), adds
the C++ memory-safety scope in Appendix B, and converts the vendor quote at the
CC/USD basis stated at filing. The scope will be published before work begins.

### Volatility Stipulation

The grant remains denominated in Canton Coin, with reviews at 6 and 12 months. If the
committee changes scope, the remaining milestones are renegotiated at those reviews.
If the trailing 30-day average CC/USD rate moves by more than 25 percent from its
approval level, either side may reopen the unpaid milestones for discussion. The
committee decides whether to change them.

---

## Co-Marketing

The launch plan has four parts:

1. **Packaging:** CMake, Conan, vcpkg and dpm channels, including an SDK source path
   that does not depend on a package registry.
2. **Documentation:** quickstarts, CI-tested examples and a versioned site linked
   from the repository. We will also request a Canton community-bindings entry.
3. **Ecosystem work:** participation in the canton-apis SIG, public issue triage and
   conformance results for each release.
4. **Adoption support:** integration help tied to the production applications that
   earn Milestone 4 payments.

For the v1 release, Equilibrium will work with the Foundation on:

- **Announcements:** the v1 release and completed adoption tranches.
- **Technical content:** the architecture, Daml-LF type mapping and one integration
  walkthrough.
- **Developer outreach:** talks and workshop material for exchange, custody and
  market-making engineering teams.
- **Case study:** one qualified adopter after its integration reaches production.

---

## Rationale

We considered three alternatives:

- **Generic gRPC/OpenAPI generation:** generated stubs do not cover the
  required Daml semantics or client behaviour (Appendix A).
- **C bindings over the Rust SDK:** this would reuse code, but couple two SDK
  release cycles and hide ownership and threading semantics behind an FFI boundary.
  A stable C ABI over the C++ core is on the post-v1 roadmap for firmware, native
  extensions and legacy C systems.
- **JSON-only client:** simpler, but it cannot meet the streaming, performance and
  deduplication requirements shared by the funded SDK scopes, and the published
  OpenAPI surface is not yet clean enough to generate from.

---

## Why Equilibrium

Equilibrium builds, secures, and funds verifiable systems for finance & AI. We're a global team of 30 engineers, cryptographers and economists.

Relevant work includes:

- **C++ ledger engineering.** We built a hybrid ECC plus ML-DSA-44 (NIST
  FIPS 204) post-quantum signature path in an L1's C++ reference client,
  covering all five signing surfaces in proof-of-concept scope, with
  benchmark and test harnesses. The client and code are confidential, but we can
  review the design and benchmark method with the committee or SIG.
- **SDK and protocol tooling.** We built Zcash UniFFI bindings
  (Swift, Kotlin, Python, Ruby from one Rust core) under a Zcash Community Grants
  RFP. See the [public repository](https://github.com/eigerco/uniffi-zcash-lib),
  [RFP](https://forum.zcashcommunity.com/t/zcash-uniffi-library-rfp/43468) and
  [write-up](https://equilibrium.co/writing/unveiling-the-zcash-uniffi-library).
  We also applied the Ziggurat network-testing method to the XRP Ledger's C++
  client, including a partial Rust implementation for differential testing. See the
  [public repository](https://github.com/runziggurat/xrpl) and
  [XRP Ledger write-up](https://xrpl.org/blog/2022/ziggurat).
- **Protocol testing and maintenance.** Our Ziggurat work for Zcash produced 13
  credited vulnerability disclosures across two node implementations. The
  [grant record](https://grants.zfnd.org/proposals/1199600083-ziggurat-the-zcash-network-stability-framework)
  and [repository](https://github.com/runziggurat/zcash) are public. We also built and
  continue to maintain Pathfinder, the open-source Rust full node for Starknet
  ([source](https://github.com/eqlabs/pathfinder),
  [project page](https://equilibrium.co/projects/pathfinder)).
- **Publicly funded work.** Examples include
  Web3 Foundation-funded [Polka Storage](https://github.com/eigerco/polka-storage)
  and [Strawberry JAM](https://github.com/eigerco/strawberry), Aptos-supported
  [Move mutation-testing tools](https://github.com/eigerco/move-mutation-tools) and
  the DFINITY-funded
  [Ethereum light client on ICP](https://github.com/eigerco/ethereum-canister).

The delivery team will be selected from these Equilibrium engineers:

| Engineer | Relevant experience |
|---|---|
| [Piotr Olszewski](https://github.com/asmie) | Engineering manager; C/C++ across embedded systems, security and cryptography. |
| [Maciej Zwoliński](https://github.com/zvolin) | C++ on Nokia 3GPP systems, followed by Rust and WASM infrastructure. |
| [Mariusz Pilarek](https://github.com/mariopil) | C++ and Rust; interval-arithmetic and protocol-testing tools. |
| [Diogo Friggo](https://github.com/diogofriggo) | C++ and Rust protocol engineering and applied cryptography. |

The final delivery team will include engineers who scoped this proposal.

---

## Appendix A: What `canton-codegen-cpp` Adds to Generated Stubs

1. **The JSON Ledger API requires Daml-LF JSON codecs.** Its encoding follows the
   participant's OpenAPI document. Proto3 JSON utilities produce different wire
   shapes for real payloads.
2. **The published OpenAPI surface requires a curated client layer.** The C#/.NET SDK
   proposal documented duplicated numbered schemas, discriminator-less `oneOf`
   wrappers, inline-duplicated enums and untyped payload fields. Direct generation
   exposes those structures as public API.
3. **Daml-LF supplies the application types.** Contract-key workflows, interface
   views, SCU-aware regeneration, `Numeric`'s 38 significant digits and `GenMap`'s
   value ordering require a generator that reads Daml-LF as well as protobuf.
4. **The client layer implements ledger behaviour.** Change-ID deduplication,
   command recovery via completions, resumable streams and reassignment semantics
   sit above generated RPC stubs.
5. **C++ serialization is generated explicitly.** C++20 has no standard derive
   macros or runtime reflection, so `canton-codegen-cpp` emits and tests
   serialization for every generated type.

---

## Appendix B: Security Review

The scope will be agreed and published as `security/audit-scope.md` before the
review begins. Intended coverage:

- **Authentication:** OIDC flows, token caching and secret handling.
- **Transport security:** TLS and mTLS configuration surfaces and defaults.
- **External signing:** hash construction, signature handling, downgrade and
  substitution resistance in prepare/execute flows.
- **Memory safety:** all decoder boundaries (LF JSON codecs, stream framing,
  completion parsing), informed by the fuzzing corpora from CI.
- **Generated-code safety:** absence of unchecked conversions and lifetime hazards in
  emitted serialization.
- **Supply chain:** dependency pinning, reproducible builds and release signing.

Critical and high findings are remediated before Milestone 3 acceptance. A
`security/remediation.md` summary is published with the release.

---

## Appendix C: C++ Adoption and Market Evidence

Digital Asset's 2025 funding round included DRW Venture Capital, Tradeweb Markets,
Citadel Securities, Optiver, IMC and Virtu Financial
([Canton Network, 2025-06-24](https://www.canton.network/canton-network-press-releases/digital-asset-raises-135-million-to-accelerate-adoption-of-canton-network)).
The 2024 network pilot included Cboe Global Markets, IEX, Baymarkets and DTCC
([Canton Network, 2024-03-12](https://www.canton.network/canton-network-press-releases/the-canton-network-completes-the-most-comprehensive-blockchain-pilot-to-date-for-tokenized-real-world-assets)).

Commercial direct-market-access SDKs for Eurex T7 order routing and market data ship
as C++ libraries for Linux and Windows
([OnixS, checked 2026-08-20](https://www.onixs.biz/eurex.html)).

PKCS #11, the standard API to hardware security modules, is specified in ANSI C
([OASIS PKCS #11 v3.1, 2023-07-23](https://docs.oasis-open.org/pkcs11/pkcs11-spec/v3.1/pkcs11-spec-v3.1.html)).
Securosys Primus applications, for example, include `pkcs11.h` and link
`libprimusP11.so`
([Securosys docs, checked 2026-08-20](https://docs.securosys.com/pkcs/Use-Cases/own_application/)),
and a Securosys driver ships in the
[Canton wallet repository](https://github.com/canton-network/wallet/tree/main/core/signing-securosys).
A native C++ SDK can connect this layer to Canton's interactive submission flow.
gRPC, Canton's primary transport, also provides a native C++ implementation and API
([official C++ documentation, checked 2026-08-21](https://grpc.io/docs/languages/cpp/)).
