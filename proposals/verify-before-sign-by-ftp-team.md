## Development Fund Proposal: Prepared-Transaction Hashing Library


| Field    | Value                                                                 |
| -------- | --------------------------------------------------------------------- |
| Author   | nicky2pc                                                              |
| Org      | FTP                                                                   |
| Status   | Submitted                                                             |
| Created  | 2026-08-05                                                            |
| PR       | [#617](https://github.com/canton-foundation/canton-dev-fund/pull/617) |
| Label    | wallet-apps                                                           |
| Champion | Jatinp26                                                              |


---

## Abstract

This proposal adds the hash-recomputation step missing from the external-signing flow. Before signing, the wallet recomputes the prepared-tx hash using Canton scheme V2 or V3 and compares it with the hash returned by the participant.

The Apache-2.0 TypeScript package performs that computation. A separate language-neutral corpus lets non-TypeScript and hardware-wallet developers test their own implementations against the same inputs and results.

The implementation starts from the existing V2 hasher in @canton-network/core-tx-visualizer and moves it into a dedicated package without breaking its current APIs. FTP already runs a narrower V2 verifier in its production x402 payment flow, with 83 tests including 39 bypass cases. We will use that implementation experience and the relevant tests to harden the new package, not build a second V2 hasher from scratch.

The funding request is up to 430,000 CC: 190,000 CC for engineering and up to 240,000 CC after adoption. Any external security review requested by the Committee is handled separately.

---

## Specification

### 1. Objective

Before signing, the wallet recomputes the hash from the prepared tx bytes and compares it with the hash returned by the participant.

The package exposes one public entry point for V2/V3 prepared-transaction hashing.

### 2. Implementation Mechanics

Today, the participant-supplied hash can reach the signing driver without being recomputed from the prepared tx. In the [approve path](https://github.com/canton-network/wallet/blob/main/wallet-gateway/remote/src/web/frontend/approve/index.ts#L72-L86), `preparedTransactionHash` and `preparedTransaction` arrive as two separate inputs and no hash is recomputed. The [internal](https://github.com/canton-network/wallet/blob/main/core/signing-internal/src/controller.ts#L79) and [Fireblocks](https://github.com/canton-network/wallet/blob/main/core/signing-fireblocks/src/index.ts#L86) signing drivers still carry `// TODO: validate transaction here` at the signing site. This is the missing check that the proposed library addresses.

The caller passes the prepared bytes and hashing scheme. The package returns the recomputed hash or a typed error if the input cannot be decoded. The caller compares the result with the participant-supplied hash before signing.

![Prepared-transaction hash recomputation flow with a separate test-only conformance corpus.](./verify-before-sign-hashing-flow.png)

`@canton-network/core-ledger-proto` does not currently expose the V3 `key` and `by_key` fields or the `QueryByKey` node. We will generate the updated transaction types through the existing `core/ledger-proto` pipeline and export them from the shared package. `core/tx-hashing` will use those bindings instead of maintaining its own. For V2, our CI also compares output with the published `@canton-network/core-tx-visualizer` 1.9.1 implementation.


V3 changes the wire format in five places, and we cover the full delta.

- the node and metadata encoding-version prefixes are removed
- optional `key` appears on create, exercise and fetch
- `by_key` appears on exercise and fetch
- the `QueryByKey` node is added
- `max_record_time` is added to signed metadata

PV35 supports both V2 and V3 and defaults to V2. V3 is required when contract keys are used.

The decoder walks the node forest defensively. It tracks visited node ids, enforces depth and node-count limits, and rejects duplicate node records, shared children, cycles, orphans and dangling references. Rollback subtrees remain part of the hash walk.

The conformance vectors are a separate test artifact, not part of the npm runtime. Each vector stores the hashing scheme, the participant's original protobuf bytes and the expected hash or rejection. We use the original bytes because a JSON round trip can discard unknown fields.

### 3. Architectural Alignment

The library runs client-side against published Canton protocol artifacts. Nothing in Canton, Splice, Daml or the Ledger API has to change for it to work.

The library complements clear signing by checking that the prepared tx is covered by the hash sent for signing.

We do the work ourselves, from protocol analysis through the vector corpus and adversarial tests to any fixes a requested review turns up. We will submit a complete upstream PR to `canton-network/wallet`, with `core/tx-hashing` and `@canton-network/core-tx-hashing` as the proposed path and package name. Milestone 1 requires a review-ready PR that passes repository CI, not its merge.

### 4. Backward Compatibility

The new package preserves the existing public V2 APIs. In the upstream PR, `core-tx-visualizer` and `wallet-sdk` use it internally, so existing integrations do not need to change.

---

## Milestones and Deliverables

### Milestone 1 (BUILD): V2/V3 hashing package and upstream delivery

Estimated delivery: week 18 from grant approval.

Focus: move the existing V2 hasher into a dedicated package, add V3 and deliver a complete upstream PR.

Deliverables and value metrics:

- An Apache-2.0 package under the proposed `core/tx-hashing` layout, starting from the existing `core-tx-visualizer` V2 implementation and adding V3. V4 is out of scope.
- The existing prepared-transaction hashing APIs in `core-tx-visualizer` and `wallet-sdk` routed through the new package without breaking their public V2 interfaces.
- Bounded forest traversal rejecting duplicate node records, shared children, cycles, orphans, dangling references and configured depth or node-limit breaches.
- At least 60 vectors: no fewer than 20 accepted V2 cases, 20 accepted V3 cases and 20 mutation or reject cases. Each vector stores the hashing scheme, original protobuf bytes and expected result.
- Accepted vectors generated through a live participant connected to a PV35 synchronizer, using a Daml package with contract keys.
- Held-out V3 cases covering the removed encoding-version prefixes, optional `key`, `by_key`, `QueryByKey` and `max_record_time`.
- Public Node and browser CI. V2 and V3 are compared with the Python hashing examples shipped with Canton v3.5.1 ([V2](https://github.com/digital-asset/canton/blob/v3.5.1/community/app/src/pack/examples/08-interactive-submission/daml_transaction_hashing_v2.py), [V3](https://github.com/digital-asset/canton/blob/v3.5.1/community/app/src/pack/examples/08-interactive-submission/daml_transaction_hashing_v3.py)). V2 is also compared with the published `@canton-network/core-tx-visualizer` 1.9.1 implementation.
- Integration documentation and published TypeScript types.
- A complete upstream PR to `canton-network/wallet`.

Acceptance:

- Every accepted V2 and V3 vector reproduces the hash returned by a live PV35 participant and matches the corresponding Canton v3.5.1 Python hashing example.
- Every V2 result also matches the published `@canton-network/core-tx-visualizer` 1.9.1 implementation
- Held-out V3 hashes match both the live participant and the V3 Python hashing example.
- A one-byte mutation to a hashed field changes the expected hash or makes the input invalid.
- Public CI rejects malformed protobuf, malformed forests, unsupported schemes and inputs over either configured limit.
- The upstream PR contains the complete package, compatibility updates, documentation and tests and passes the relevant repository CI. Merge is not required for Milestone 1.

### Milestone 2 (ADOPT): Package adoption

Estimated delivery: within 18 months of grant approval.

Focus: prove third-party adoption in a signing path.

This milestone has two alternative routes. Route A is official adoption in `canton-network/wallet`. Route B is production or staging use by independent integrators. Either route qualifies for payment, the payments are not cumulative, and demos and proofs of concept qualify under neither.

Deliverables and value metrics:

Route A, official package adoption. The dedicated hashing package is merged into the default branch of `canton-network/wallet`, published under the `@canton-network` scope and used by an official prepared-transaction signing path.

Route B, independent integrators. A named third party imports the package and calls it from its signing path. For a public repository, the dependency must be visible on the default branch, and the repository must show commits from at least two non-FTP authors during the preceding 90 days. For a private custody repository, the adopter confirms production or staging use in writing and provides a Committee contact.

Acceptance:

Route A is complete when the package is merged, published and used by an official prepared-transaction signing path. Route B evidence comes from the adopter, and FTP affiliates do not qualify. If we write an integration ourselves, it counts only after the adopting team merges it. Route A and Route B payments are not cumulative.

---

## Acceptance Criteria

Detailed acceptance criteria are listed under each milestone. Milestone 1 covers validated upstream delivery; Milestone 2 requires official or independent production or staging adoption.

---

## Funding

We ask for up to 430,000 CC, based on a CC price of $0.115 as of August 4, 2026. 190,000 CC covers engineering, and up to 240,000 CC is paid only after adoption.

### Payment Breakdown

- Milestone 1 (BUILD): 190,000 CC upon Committee acceptance.
- Milestone 2 (ADOPT), Route A: 240,000 CC when its acceptance conditions are met.
- Milestone 2 (ADOPT), Route B: 60,000 CC per qualifying independent integrator, up to four.

Without adoption, the Fund pays 190,000 CC for the engineering milestone. Adoption payments are capped at 240,000 CC.

### External Security Review

After Milestone 1 we will arrange an independent security review if the Committee asks for one, and its scope and cost will be agreed separately against the vendor quote.

### Volatility Stipulation

The grant is denominated in Canton Coin. If CC volatility materially changes its real value between acceptance and payment, FTP and the Tech and Ops Committee will re-evaluate the affected amount.

---

## Co-Marketing

FTP will coordinate the release announcement with the Foundation.

---

## Motivation

Regulated custodians use external signing to keep control of their Canton keys. Their signing stacks differ. Some predate the wallet SDK, and hardware wallets do not run JavaScript at all. That is why we publish language-neutral conformance vectors and not just a TypeScript package.

Four teams besides FTP have implemented prepared-transaction hashing on their own.

- [BitGo](https://github.com/BitGo/BitGoJS/blob/master/modules/sdk-coin-canton/resources/hash/hash.js#L1) maintains an independent V2 implementation and does not depend on the wallet SDK.
- [Turnkey](https://github.com/tkhq/sdk/blob/main/examples/chain-integrations/with-canton/README.md#L54) has a TypeScript V3 port, but as example code rather than an installable package.
- Ledger and Cypherock each run V2 code on the device, but neither has a host-side library.

Canton 3.5.1 adds V3 hashing for PV35 and requires V3 whenever contract keys are used. BitGo, Ledger and Cypherock still implement V2, and Turnkey's V3 code stays example-only. Once this package ships, integrators can use it directly or test their own code against the same vectors.

### Maintenance

We will maintain the package for 12 months after Milestone 1 or until the Milestone 2 adoption window closes, whichever is later, at no additional cost. FTP already tracks Canton and Splice releases for its validator and facilitator. If the package has not been merged upstream and maintenance stops, the Apache-2.0 code and vectors stay public, we will give 90 days notice, and we will offer repository and publishing rights to the Foundation or an agreed successor.

---

## Rationale

Why a dedicated hashing package instead of keeping hashing inside `core-tx-visualizer`. The wallet repository currently has V2 hashing in both `core-tx-visualizer` and `wallet-sdk`. Moving it into one core package separates hashing from visualization and provides one place for V2 and V3 support.

---

## Team

FTP delivered [Dev Fund #78](https://github.com/canton-foundation/canton-dev-fund/blob/main/proposals/2026-03-FTP-x402-protocol-integration.md), the x402 Protocol Integration for Canton. Milestones 1 and 2 were accepted. We run a MainNet validator and a live x402 facilitator, and the x402 harness is published as seven npm packages.

The [existing verifier and bypass tests](https://github.com/FTP-Tech-LLC/x402-canton-agent/tree/main/packages/agent-wallet/src) are public and run with `pnpm test` in the agent-wallet package.
