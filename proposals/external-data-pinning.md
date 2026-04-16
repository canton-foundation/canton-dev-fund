# Development Fund Proposal

## Pinned External Data Fetches for Daml Contracts

| Field | Value |
| :---- | :---- |
| Author | Elliott Dehnbostel |
| Status | Draft |
| Created | 2026-04-15 |
| Label | canton-protocol-multi-synchronizer |
| Champion | need Champion |

---

# Abstract

This proposal requests funding to implement CIP-draft-external-data-pinning: a new Canton protocol primitive that allows Daml smart contract choices to fetch data from external TCP services during transaction construction and cryptographically pin the signed response to the transaction. Validating participants verify the pinned signature instead of re-executing the external call, preserving Canton's deterministic execution model while enabling smart contracts to consume off-chain data natively.

Today, every external data integration on Canton requires bespoke infrastructure: a dedicated contract model, off-chain automation, and a governance CIP per data source (CIP-0079 for Kaiko price feeds, CIP-0043 for TRM, CIP-0044 for Elliptic). This primitive replaces that per-source plumbing with a single general-purpose protocol-level mechanism. Contract authors can integrate any external data source — price feeds, KYC attestations, cross-chain state, API responses — by specifying a TCP endpoint and a set of trusted signing keys, without waiting for purpose-built pipelines or new governance proposals.

The implementation spans the Daml engine (new `fetchExternal` built-in), the Canton protocol (new `PinnedDataNode` transaction tree node type), the standard library (`DA.External` module), and developer tooling (reference service SDK in Python and TypeScript). All code will be contributed to the Canton open-source repository and the Daml SDK.

---

# Motivation

## The External Data Problem

Canton's privacy and determinism guarantees are a core strength, but they create isolation from external systems. Off-chain data — price feeds, compliance attestations, cross-chain state, API responses — cannot be consumed directly by Daml contract logic. Every integration requires:

1. A dedicated Daml contract model to hold the data
2. Off-chain automation to poll the source and publish to the ledger
3. A governance CIP to authorize each new data feed
4. Application-level trust in the automation operator

This works for a small number of high-value, centrally managed feeds. It does not scale to the long tail of external data integrations that application developers need as the Canton ecosystem grows.

**Concrete examples of infrastructure that would be replaced or simplified:**

- **CIP-0079 (Kaiko Price Feeds):** Super Validators run dedicated automation to ingest prices and publish them via Daml contracts. Each new price source requires a new contract model, a new automation pipeline, and a new governance proposal. With `fetchExternal`, a single oracle service operator signs price responses, and any contract can query any supported pair on-demand.

- **CIP-0043/CIP-0044 (KYC/AML Attestations):** Compliance data from TRM and Elliptic is manually bridged into the ledger through purpose-built pipelines. With `fetchExternal`, a compliance service can sign attestation responses directly, and contracts can check compliance status as part of their choice logic — no intermediate contracts or automation.

- **Cross-chain verification:** Confirming an L1 deposit before releasing Canton-side assets currently requires off-chain relayers with no standard interface. With `fetchExternal`, a bridge service can sign Merkle proofs of L1 state, and contracts can verify them natively.

## Why Protocol-Level, Not Application-Level

The key insight is that all external data integrations follow the same pattern: fetch, attest, consume. Implementing this at the protocol level rather than the application level provides:

- **Smaller trust surface:** Trust shifts from "trust the oracle operator's automation pipeline" to "trust the oracle operator's signing key" — a strictly smaller surface.
- **Request-response patterns:** Unlike push-based oracles, `fetchExternal` supports queries that depend on contract state (e.g., "what is the price of the asset I'm about to transfer?").
- **Deterministic replay:** The pin-and-verify model ensures all participants agree on the external data without requiring universal network access to the service.
- **No per-source governance:** New data sources don't require CIPs — contract authors embed accepted signing keys directly.

## Why Now

The Canton Network is entering a growth phase where application diversity is expanding beyond simple token transfers and financial workflows. DeFi protocols, cross-chain bridges, compliance-aware applications, and data-driven contracts all need external data. Without a general-purpose primitive, each integration will spawn another bespoke pipeline and another governance proposal, creating an unsustainable operational burden on the Super Validator community.

---

# Specification

## 1. Objective

Implement the full `fetchExternal` primitive as specified in CIP-draft-external-data-pinning:

- **Daml engine:** New `fetchExternal` built-in that executes TCP fetches during command interpretation (submitter) and replays pinned data during validation (confirmers).
- **Canton protocol:** New `PinnedDataNode` type in the transaction tree, with validation logic in the mediator and confirming participants.
- **Daml standard library:** `DA.External` module exposing `FetchRequest`, `FetchResponse`, and `fetchExternal`.
- **External service SDK:** Reference implementations of the nonce-sign TCP protocol in Python and TypeScript, with test harness.
- **Phased rollout:** Protocol parameter gating so `fetchExternal` is disabled until 2/3 of Super Validators have upgraded.

## 2. Implementation Mechanics

### 2.1 Daml Engine Changes

The Daml LF Speedy interpreter gains a new `Result` variant:

```
ResultNeedExternalFetch(request: FetchRequest, callback: FetchResponse => Result)
```

During **command interpretation** (submitter), the engine host:
1. Opens a TCP connection to `request.endpoint`
2. Sends the 32-byte nonce (`SHA-256(transaction_uuid || fetch_node_index)`) followed by `request.payload`
3. Reads the response: `4-byte big-endian length || body || signature`
4. Verifies the signature over `SHA-256(nonce || body)` against `request.signerKeys`
5. Records the `FetchResponse` as a `PinnedDataNode` in the transaction view
6. Resumes the engine with the `FetchResponse`

During **validation** (confirming participants), the engine host:
1. Extracts the `PinnedDataNode` from the transaction view
2. Verifies the signature (same check as above)
3. Resumes the engine with the verified `FetchResponse` — no network call

This follows the same trampoline pattern as `ResultNeedContract` and `ResultNeedPackage` — the engine yields control, the host resolves the dependency, and the engine resumes.

### 2.2 Canton Protocol Changes

The transaction tree format is extended with `PinnedDataNode`:

```
PinnedDataNode:
  fetchRequest: FetchRequest       -- the original request (endpoint, signerKeys, etc.)
  fetchResponse: FetchResponse     -- the pinned response (body, signature, signerKey)
  nonce: ByteString[32]            -- the transaction-bound nonce
```

Pinned data nodes are included in the transaction view alongside create/exercise nodes and inherit the same visibility rules. The mediator and confirming participants verify the signature as part of transaction validation.

Protocol-level limits:
- Maximum response size: 64 KiB
- Maximum `fetchExternal` calls per transaction: 8
- Pinned data counts toward transaction traffic weight for fee calculation

### 2.3 Phased Rollout

This is a hard-fork change. The rollout follows the pattern established by previous protocol upgrades:

1. **Phase 1:** Release Canton version with `fetchExternal` support. The feature is gated by a protocol parameter (disabled by default). Contracts using `fetchExternal` can be compiled and deployed but will be rejected at runtime until the feature is enabled.
2. **Phase 2:** Once 2/3 of Super Validators have upgraded (verified via topology state), enable `fetchExternal` via an on-chain protocol parameter change through a CIP governance vote.

### 2.4 External Service SDK

Reference implementations of the nonce-sign TCP protocol:

- **Python SDK:** `canton-external-service` PyPI package with base class, nonce handling, signing helpers, and example price oracle
- **TypeScript SDK:** `@canton/external-service` npm package with equivalent functionality
- **Test harness:** Mock service for integration testing that returns deterministic signed responses

## 3. Architectural Alignment

This work aligns with Canton's architecture:

- **Daml engine continuation model:** `ResultNeedExternalFetch` follows the existing `ResultNeedContract`/`ResultNeedPackage` trampoline pattern. No changes to the engine's execution model.
- **Canton's sub-transaction privacy:** Pinned data inherits view visibility rules. External service endpoints are visible to confirming participants but not non-stakeholder observers.
- **Transaction format extensibility:** Canton's protobuf transaction format supports adding new node types. The `PinnedDataNode` is a natural extension alongside `CreateNode`, `ExerciseNode`, etc.
- **Deterministic execution:** The pin-and-verify model preserves determinism — all participants see the same pinned data and execute the same choice logic.

Relevant CIPs: This primitive would simplify or replace infrastructure required by CIP-0079 (price feeds), CIP-0043 (TRM attestations), CIP-0044 (Elliptic attestations), and any future data feed CIPs.

## 4. Backward Compatibility

**Hard fork.** All participants must upgrade to a Canton version that understands `PinnedDataNode` in the transaction format. Transactions containing `fetchExternal` calls submitted to older participants will be rejected.

- Contracts not using `fetchExternal` are entirely unaffected.
- The phased rollout ensures the feature is not activated until sufficient network adoption.
- The Daml compiler will reject `fetchExternal` calls targeting protocol versions that don't support the primitive.

---

# Milestones and Deliverables

## Milestone 1: Design Finalization & CIP Advancement

- **Estimated Delivery:** 4 weeks from grant approval
- **Focus:** Finalize the CIP through community review, nail down protobuf schema for `PinnedDataNode`, define the `ResultNeedExternalFetch` engine interface
- **Deliverables / Value Metrics:**
  - CIP advanced from Draft to Accepted status (or clear community feedback incorporated)
  - Protobuf schema definitions for `PinnedDataNode` and protocol parameter changes
  - Detailed engine integration design document reviewed by Daml engine maintainers
  - TCP protocol specification with wire format test vectors

## Milestone 2: Daml Engine Implementation

- **Estimated Delivery:** 10 weeks from grant approval
- **Focus:** Implement `fetchExternal` in the Daml LF Speedy interpreter and the Canton engine host
- **Deliverables / Value Metrics:**
  - `ResultNeedExternalFetch` variant in the Speedy engine
  - TCP fetch execution in the submitter's engine host (connection, nonce, read, verify)
  - Pinned data replay in the validator's engine host (signature verify, supply to engine)
  - `DA.External` standard library module (`FetchRequest`, `FetchResponse`, `fetchExternal`)
  - Unit tests: nonce generation, signature verification, timeout handling, max-bytes enforcement
  - Integration tests: round-trip fetch through engine interpretation + validation

## Milestone 3: Canton Protocol Integration

- **Estimated Delivery:** 16 weeks from grant approval
- **Focus:** Extend the Canton transaction tree format, integrate with mediator and confirming participant validation
- **Deliverables / Value Metrics:**
  - `PinnedDataNode` type in the transaction tree with protobuf serialization
  - Mediator validation: verify pinned data signatures during confirmation request processing
  - Confirming participant validation: verify pinned data and supply to engine during reinterpretation
  - Protocol parameter for feature gating (enabled/disabled)
  - Traffic weight accounting for pinned data
  - Integration tests: full transaction lifecycle with `fetchExternal` through submitter → sequencer → mediator → confirming participant → verdict
  - Backward compatibility tests: old nodes reject transactions with pinned data; new nodes without feature enabled reject `fetchExternal` calls

## Milestone 4: External Service SDK & Developer Tooling

- **Estimated Delivery:** 20 weeks from grant approval
- **Focus:** Make it easy for external service operators and Daml developers to adopt the primitive
- **Deliverables / Value Metrics:**
  - Python SDK (`canton-external-service`): base class, nonce handling, signing, example price oracle, published to PyPI
  - TypeScript SDK (`@canton/external-service`): equivalent functionality, published to npm
  - Test harness: mock external service for integration testing (deterministic responses, configurable latency/failure modes)
  - Developer documentation: tutorial for building an external service, tutorial for consuming `fetchExternal` in Daml contracts, security considerations guide
  - Example application: simple price oracle service + Daml contract that uses it, deployable end-to-end

## Milestone 5: TestNet Deployment & Phased Rollout

- **Estimated Delivery:** 26 weeks from grant approval
- **Focus:** Deploy on TestNet, validate under real network conditions, prepare for MainNet rollout
- **Deliverables / Value Metrics:**
  - `fetchExternal`-enabled Canton build deployed on Global Synchronizer TestNet
  - Example oracle service running on TestNet, accessible to test participants
  - Demonstrated end-to-end flow: Daml contract exercises choice with `fetchExternal`, transaction confirmed by multiple participants, pinned data correctly verified
  - Load testing: sustained `fetchExternal` transactions at target throughput, measuring impact on transaction latency and size
  - Rollout playbook: step-by-step guide for Super Validators to upgrade, including verification that 2/3 threshold is met before feature activation
  - Security audit of the TCP protocol implementation and nonce generation

---

# Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- **Milestone 1:** CIP reviewed by at least 3 community members; protobuf schema and engine design reviewed by Daml engine maintainers
- **Milestone 2:** All unit and integration tests pass; `fetchExternal` produces identical contract execution results when pinned data is replayed vs. when fetched live
- **Milestone 3:** Full transaction lifecycle completes with `fetchExternal` on a Canton test network; backward compatibility verified (old nodes reject gracefully)
- **Milestone 4:** SDKs published to PyPI and npm; example application deployable by a developer unfamiliar with the internals within 1 hour following the tutorial
- **Milestone 5:** `fetchExternal` operates on TestNet for 2+ weeks with at least 2 independent participants validating pinned data transactions; security audit completed with no critical findings

---

# Funding

**Total Funding Request: 500,000 Canton Coin (CC)**

### Payment Breakdown by Milestone

| Milestone | Amount (CC) | Trigger |
| :---- | :---- | :---- |
| 1 — Design Finalization | 50,000 | Committee acceptance of CIP advancement and design documents |
| 2 — Daml Engine Implementation | 125,000 | Committee acceptance of deliverables and passing test suite |
| 3 — Canton Protocol Integration | 150,000 | Committee acceptance of deliverables and integration tests |
| 4 — SDK & Developer Tooling | 75,000 | SDKs published, documentation reviewed, example app functional |
| 5 — TestNet Deployment | 100,000 | Sustained operation on TestNet with demonstrated end-to-end flow |

### Rationale for Amount

This proposal touches three separate codebases (Daml LF engine, Canton protocol, Daml standard library) and requires two new SDKs. The Daml engine changes are particularly sensitive — the Speedy interpreter is the core of transaction determinism, and adding a new `Result` variant with external IO requires careful design to preserve correctness guarantees. The Canton protocol changes extend the transaction format, which is a hard-fork-level modification touching serialization, validation, and privacy logic across multiple components.

### Volatility Stipulation

This grant is denominated in fixed Canton Coin. Should the project timeline extend beyond 6 months due to Committee-requested scope changes, remaining milestones will be renegotiated to account for significant USD/CC price volatility.

---

# Co-Marketing

Upon release, the implementing entity will collaborate with the Foundation on:

- Announcement and technical blog post explaining the `fetchExternal` primitive and its implications for Canton application development
- Developer tutorial and workshop at a Canton community event
- Showcase of the example oracle application demonstrating end-to-end flow
- Outreach to existing oracle/data feed operators (Kaiko, TRM, Elliptic) to discuss adopting the nonce-sign protocol as a simpler integration path

---

# Preliminary Implementation

A draft PR implementing the core protocol machinery is available at [digital-asset/canton#491](https://github.com/digital-asset/canton/pull/491). This covers:

- **Protobuf**: `PinnedDataNode`, `FetchExternalRequest`, `FetchExternalResponse` in v31 proto
- **Daml LF Engine**: `ResultNeedExternalFetch` variant with full `map`/`flatMap`/`consume` support
- **Speedy Interpreter**: `Question.Update.NeedExternalFetch` + Engine loop handler
- **Speedy Built-in**: `SBUFetchExternal` with nonce generation and callback
- **Canton Engine Host**: `DAMLe.handleResult` dispatches to `ExternalFetchResolver`
- **TCP Resolver**: `TcpExternalFetchResolver` implements the nonce-sign protocol
- **Validation Resolver**: `PinnedDataResolver` replays pinned data during reinterpretation
- **Transaction Tree**: `PinnedDataNode` in `ViewParticipantData` with signature verification
- **Protocol Gating**: `enableExternalFetches` parameter in `DynamicSynchronizerParameters`
- **Tests**: 20 tests covering Result trampoline, TCP fetch, pinned data verification (ECDSA + Ed25519), and resolver error handling

---

# Rationale

## Why a Protocol Primitive, Not a Library

Application-level oracle patterns (the status quo) require:
1. A dedicated contract model per data type
2. Off-chain automation to poll and publish
3. A governance CIP to authorize each new feed
4. Application-level trust in the automation operator

A protocol primitive shifts the trust boundary from "trust the oracle operator's entire automation pipeline" to "trust the oracle operator's signing key" — a strictly smaller and more auditable trust surface. It also enables request-response patterns where the query depends on contract state, which push-based oracles cannot support.

## Why Pin-and-Verify, Not Re-Execute

Re-executing the external call on every validating participant would:
- Require all participants to have network access to the external service
- Leak information about which participants are validating which transactions (privacy violation)
- Introduce non-determinism if the service returns different data across calls

Pinning the signed response eliminates all three problems. Only the submitter needs network access; all other participants verify a cryptographic signature.

## Why TCP, Not HTTP

Embedding an HTTP client in the Daml engine would import significant complexity (headers, content encoding, chunked transfer, TLS certificate management) into the consensus-critical path. Raw TCP keeps the protocol primitive minimal. Higher-level protocols (HTTP, gRPC, WebSocket) can be implemented in external service wrappers that speak the nonce-sign protocol over TCP — the SDKs provided in Milestone 4 will include HTTP-fronted examples.

## Why These Limits

- **64 KiB max response:** Covers price quotes (~100 bytes), attestation certificates (~1-4 KiB), Merkle proofs (~1-8 KiB), and most API responses. Larger data should be published to dedicated contracts via existing patterns.
- **8 fetches per transaction:** Prevents abuse while supporting complex workflows (e.g., fetch price + fetch KYC status + fetch cross-chain proof). The limit is a protocol parameter adjustable by future CIP.

## Use Case: Atomic Cross-Chain Bridging

The `fetchExternal` primitive enables a new bridging pattern that settles in one atomic transaction per direction, with no intermediate contracts or two-phase commit.

**Inbound (External → Canton):** User deposits on L1. User exercises `BridgeIn` on Canton with the deposit tx hash. The choice calls `fetchExternal` to the bridge service: "confirm deposit 0xabc." Bridge service checks L1 state, signs a Merkle proof. Canton contract verifies the pinned signature and mints the bridged asset. One atomic transaction: L1 verification + Canton mint.

**Outbound (Canton → External):** User exercises `BridgeOut`: burns the Canton-side asset. Bridge service is a party on the contract — receives the confirmed transaction via its Canton participant, verifies the burn, submits the mint/release on the external chain.

The bridge service has two roles: as a Canton participant it sees transactions it's party to and acts on burn events; as a `fetchExternal` TCP signer it attests to external chain state when asked. The nonce binding prevents replay of stale proofs. The pinned signature is on-chain evidence of the bridge operator's attestation at that moment for that specific transaction.

Compared to existing bridge patterns (deposit → wait for relayer → post proof → claim — 3+ steps, multiple transactions, race conditions, timeouts), `fetchExternal` reduces each direction to one step from the user's perspective.

## Relationship to Other CIPs

This primitive would simplify or subsume infrastructure required by:
- **CIP-0079 (Price Feeds):** Oracle operators could offer a signing service instead of running automation pipelines
- **CIP-0043/CIP-0044 (KYC/AML):** Compliance providers could sign attestation responses directly
- **Future data feed CIPs:** Would not need per-source governance proposals — contract authors embed trusted keys directly
- **Cross-chain bridges:** Atomic inbound/outbound bridging with no intermediate state (see above)
