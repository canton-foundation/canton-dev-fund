## Development Fund Proposal: Prepared-Transaction Hashing Library


| Field    | Value                                                                 |
| -------- | --------------------------------------------------------------------- |
| Author   | nicky2pc                                                              |
| Org      | FTP                                                                   |
| Status   | Submitted                                                             |
| Created  | 2026-08-05                                                            |
| PR       | [#617](https://github.com/canton-foundation/canton-dev-fund/pull/617) |
| Label    | wallet-apps                                                           |
| Champion | *need Champion*                                                       |


---

## Abstract

The idea of this proposal is to add the hash-recomputation step missing from the external-signing flow. The wallet takes the prepared tx and hash returned by the participant, independently recomputes the hash from the tx bytes and compares the two before asking its signing backend to sign.

The proposed Apache-2.0 TypeScript library closes this gap. Its core recomputes the prepared-tx hash using Canton hashing scheme V2 or V3. The signing flow stops if the result differs from the hash returned by the participant. Separately, we will publish conformance vectors containing the original tx bytes, hashing scheme and expected result, so non-TypeScript and hardware-wallet developers can test their own implementations.

FTP already uses a narrower V2 verifier in the MainNet payment flow of its x402 agentic wallet. The [verify-prepared.ts](https://github.com/FTP-Tech-LLC/x402-canton-agent/blob/main/packages/agent-wallet/src/verify-prepared.ts) implementation has 83 tests, including 39 bypass cases. We will extract its V2 hashing code, add V3 and package the result for reuse.


The funding request is up to 570,000 CC: 250,000 CC for engineering and up to 320,000 CC after adoption. Any external security review requested by the Committee is handled separately.

---

## Specification

### 1. Objective

Before signing, the wallet recomputes the hash from the prepared tx bytes and compares it with the hash returned by the participant.

The package exposes one public entry point for V2/V3 prepared-transaction hashing.

### 2. Implementation Mechanics

Today, the participant-supplied hash can reach the signing driver without being recomputed from the prepared tx. In the [approve path](https://github.com/canton-network/wallet/blob/main/wallet-gateway/remote/src/web/frontend/approve/index.ts#L72-L86), `preparedTransactionHash` and `preparedTransaction` arrive as two separate inputs and no hash is recomputed. The [internal](https://github.com/canton-network/wallet/blob/main/core/signing-internal/src/controller.ts#L79) and [Fireblocks](https://github.com/canton-network/wallet/blob/main/core/signing-fireblocks/src/index.ts#L86) signing drivers still carry `// TODO: validate transaction here` at the signing site. This is the missing check that the proposed library addresses.

The caller passes the prepared bytes and hashing scheme. The package returns the recomputed hash or a typed error if the input cannot be decoded. The caller compares the result with the participant-supplied hash before signing.

We generate our own protobuf bindings for the package. The shared model, `@canton-network/core-ledger-proto` 1.9.1, does not implement V3 hashing, and decoding V3 through it silently drops `key_opt`, `by_key` and the `QueryByKey` node. A V3 hasher cannot use a model that drops fields included in the hash. Local bindings add V3 without changing the shared model for its existing consumers. For V2, our CI also compares output with `core-tx-visualizer`.

V3 changes the wire format in five places, and we cover the full delta.

- the node and metadata encoding-version prefixes are removed
- `key_opt` appears on create, exercise and fetch
- `by_key` appears on exercise and fetch
- the `QueryByKey` node is added
- `max_record_time` is added to signed metadata

PV35 supports both V2 and V3 and defaults to V2. V3 is required when contract keys are used.

The decoder walks the node forest defensively. It tracks visited node ids, enforces depth and node-count limits, and rejects duplicate node records, shared children, cycles, orphans and dangling references. Rollback subtrees remain part of the hash walk.

The conformance vectors are a separate test artifact, not part of the npm runtime. Each vector stores the hashing scheme, the participant's original protobuf bytes and the expected hash or rejection. We use the original bytes because a JSON round trip can discard unknown fields.

### 3. Architectural Alignment

The library runs client-side against published Canton protocol artifacts. Nothing in Canton, Splice, Daml or the Ledger API has to change for it to work.

The library complements clear signing by checking that the prepared tx is covered by the hash sent for signing.

We do the work ourselves, from protocol analysis through the vector corpus and adversarial tests to any fixes an audit turns up. Separately we will offer the wallet repository a small free patch, described under Funding, and the maintainers will get a complete contribution to review through their normal process. Neither Milestone 1 nor Milestone 2 depends on that patch being merged.

### 4. Backward Compatibility

The npm package is a new optional dependency, so nothing changes for anyone who does not adopt it.

---

## Milestones and Deliverables

### Milestone 1 (HASH): V2/V3 hashing and conformance vectors

Estimated delivery: week 10 from grant approval.

Focus: build and validate V2/V3 hashing with reusable conformance vectors.

Deliverables and value metrics:

- An Apache-2.0 npm package computing V2 and V3 hashes on bindings generated for this package. V4 stays out of scope while stable synchronizers reject it.
- At least 40 accepted vectors, with no fewer than 20 for each of V2 and V3. Each vector stores the hashing scheme, the participant's exact protobuf bytes and the expected hash.
- Accepted vectors generated on a live participant connected to a PV35 synchronizer, driven by a Daml package we build specifically to exercise contract keys.
- Public CI running the same corpus in Node and browser environments. V2 is also compared with Canton's Python reference and `core-tx-visualizer`.
- One documented entry point with published TypeScript types.

Acceptance:

- Every accepted V2 and V3 vector reproduces the hash returned by a live PV35 participant.
- Every V2 result also matches Canton's Python reference and `core-tx-visualizer`.
- The same corpus passes in public Node and browser CI.

### Milestone 2 (GATE): Request verification and fail-closed policy

Estimated delivery: week 18 from grant approval.

Focus: verify the prepared tx against the original request before signing.

Deliverables and value metrics:

- Fail-closed enforcement of the root, signed-metadata and party checks for create and exercise roots, including interface identifiers where present.
- A caller policy covering expected parties and synchronizer, accepted template and interface names, optional package-id pins, minimum hashing scheme and freshness bounds.
- Rollback-aware separation of hash and effect traversal.
- A Token Standard adapter for `TransferFactory_Transfer`, covering the V1 party form and the V2 account form and comparing sender, receiver, amount and instrument with the request.
- Typed refusals naming the failed property or mismatched field.
- Decoder mutation tests for malformed and adversarial input.
- Integration docs for policy construction, refusal handling and use of the vector corpus.
- A frozen release candidate suitable for an external security review if the Committee asks for one.

Acceptance:

- A live participant produces a correct transfer, accepted under both Token Standard V1 and V2 argument forms.
- Valid transaction bytes paired with the hash of a different transaction are refused.
- Four tests substitute sender, receiver, amount and instrument one at a time, and each refusal names the changed field.
- A transaction failing any core property is refused, not accepted with a warning.
- Public CI shows two freshness refusals. A stale `preparation_time` is refused under both schemes, and a V2 transaction is refused under a policy requiring an expiry bound, since V2 carries no `max_record_time`. The same job covers the scheme floor, rollback separation and the mutation suite.

### Milestone 3 (ADOPT): Third-party adoption

Estimated delivery: within 18 months of grant approval.

Focus: prove third-party adoption in a signing path.

This milestone covers adoption through one of two routes. Route A is production or staging use by an independent integrator. Route B is official adoption of the package in `canton-network/wallet`. Either route qualifies for payment, the two payments are not cumulative, and demos and proofs of concept qualify under neither.

Deliverables and value metrics:

Route A, independent integrators. A named third party imports the package and calls it from its signing path. For a public repository, the dependency must be visible on the default branch, and the repository must show commits from at least two non-FTP authors during the preceding 90 days. For a private custody repository, the adopter confirms production or staging use in writing and provides a Committee contact.

Route B, official package adoption. The dedicated hashing package is merged into the default branch of `canton-network/wallet`, published under the `@canton-network` scope and used by an official prepared-transaction signing path.

Acceptance:

Route A evidence comes from the adopter, and FTP affiliates do not qualify. If we write the integration ourselves, it counts only after the adopting team merges it. Route B is complete when the package is merged, published and used by an official prepared-transaction signing path. Route A and Route B payments are not cumulative.

---

## Acceptance Criteria

Acceptance criteria sit under each milestone. Milestones 1 and 2 are verified through public tests and the stated live-participant cases. Milestone 3 needs evidence from the adopter.

---

## Funding

We ask for up to 570,000 CC, based on a CC price of $0.115 as of August 4, 2026. 250,000 CC covers engineering, and up to 320,000 CC is paid only after third-party adoption.

### Payment Breakdown

- Milestone 1 (HASH): 100,000 CC upon Committee acceptance.
- Milestone 2 (GATE): 150,000 CC upon Committee acceptance.
- Milestone 3 (ADOPT), Route A: 80,000 CC per qualifying independent integrator, up to four.
- Milestone 3 (ADOPT), Route B: 320,000 CC when its acceptance conditions are met.

Without third-party adoption, the Fund pays 250,000 CC for the two engineering milestones. Adoption payments are capped at 320,000 CC.

### External Security Review

After Milestone 2 we will arrange an independent security review if the Committee asks for one, and its scope and cost will be agreed separately against the vendor quote.

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

We will maintain the package for 12 months after Milestone 2 or until the Milestone 3 adoption window closes, whichever is later, at no additional cost. FTP already tracks Canton and Splice releases for its validator and facilitator. If maintenance stops, the Apache-2.0 code and vectors stay public, we will give 90 days notice, and we will offer repository and publishing rights to the Foundation or an agreed successor.

---

## Rationale

Why a dedicated hashing package instead of keeping hashing inside `core-tx-visualizer`. The wallet repository currently has V2 hashing in both `core-tx-visualizer` and `wallet-sdk`. Moving it into one core package separates hashing from visualization and provides one place for V2 and V3 support.

Why not fix this in the platform. The platform does not have the caller's original request, so no platform change can perform the comparison. The check has to run client-side, in the wallet or gateway.

---

## Team

FTP delivered [Dev Fund #78](https://github.com/canton-foundation/canton-dev-fund/blob/main/proposals/2026-03-FTP-x402-protocol-integration.md), the x402 Protocol Integration for Canton. Milestones 1 and 2 were accepted. We run a MainNet validator and a live x402 facilitator, and the x402 harness is published as seven npm packages.

The [existing verifier and bypass tests](https://github.com/FTP-Tech-LLC/x402-canton-agent/tree/main/packages/agent-wallet/src) are public and run with `pnpm test` in the agent-wallet package.
