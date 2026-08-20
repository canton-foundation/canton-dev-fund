## Development Fund Proposal: Prepared-Transaction Verification Library


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

The idea of this proposal is to add the request-verification step missing from the external-signing flow. To perform this check, the wallet takes the prepared tx and hash returned by the participant, recomputes independently the hash from the tx bytes, compares it with the returned hash, and compares the tx with the original request before asking its signing backend to sign the hash.

Issue appears even in a basic payment. Alice calls wallet to send 100 CC to Bob, but the participant returns a valid transfer to Mallory with its matching hash. The hash still checks out, but the wallet sees that Alice asked to pay Bob, not Mallory.

The proposed Apache-2.0 TypeScript library closes this gap. It's core recomputes the prepared-tx hash using Canton hashing scheme V2 or V3, then checks the root command, signed metadata and every party referenced in the transaction. We will also provide a Token Standard adapter that verifies the sender, receiver, amount and instrument against the original request. Any mismatch stops signing.  We will also publish test vectors for developers to verify non-TypeScript and hardware-wallet implementations.

FTP already uses a narrower V2 verifier in the MainNet payment flow of its x402 agentic wallet. The verify-prepared.ts (https://github.com/FTP-Tech-LLC/x402-canton-agent/blob/main/packages/agent-wallet/src/verify-prepared.ts) implementation has 83 tests, including 39 bypass cases. We will turn the existing V2 verifier into a reusable V2/V3 core and moves the Token Standard-specific checks into a separate adapter.

The funding request is up to 570,000 CC: 250,000 CC for engineering and up to 320,000 CC after adoption. Any external security review requested by the Committee is handled separately.

---

## Specification

### 1. Objective

A prepared tx can be signed only after the wallet that requested it confirms that it matches the original request.

The package exposes one public entry point with two internal layers:

- The core is independent from Daml packages. It rebuilds the hash from the tx bytes and checks the returned hash, root, metadata and parties.

- The Token Standard adapter, which is used to read and verify the transfer fields that the package-free core cannot interpret.

The wallet performs the full check before calling the signing backend. It still has the original request, while the signing backend receives only the verified `tx` and `txHash`.


### 2. Implementation Mechanics

Today the official wallet signs whatever the participant sends. In the [approve path](https://github.com/canton-network/wallet/blob/main/wallet-gateway/remote/src/web/frontend/approve/index.ts#L72-L86), `preparedTransactionHash` and `preparedTransaction` arrive as two separate inputs and no hash is recomputed. The [internal](https://github.com/canton-network/wallet/blob/main/core/signing-internal/src/controller.ts#L79) and [Fireblocks](https://github.com/canton-network/wallet/blob/main/core/signing-fireblocks/src/index.ts#L86) signing drivers still carry `// TODO: validate transaction here` at the signing site. That is the Mallory substitution sitting in production code.

The caller passes four things. The prepared bytes, the participant hash, the original request, and a policy stating what it will accept, which covers expected parties and synchronizer, allowed template and interface names, optional package-id pins, a minimum hashing scheme, and freshness bounds.

After decoding, the core runs three checks.

1. **Root match.** The first release follows the Ledger API single-command submission model, so exactly one root must match the request and extra roots are rejected. A create node matches by qualified template name. An exercise node matches by choice name plus qualified template or interface name.
2. **Signed metadata.** The signed `act_as` set and command id must match the request. The synchronizer and signed time fields must satisfy the caller policy.
3. **Party closure.** Every party in every node must be either named by the caller or admitted by an explicit policy rule. Rules can admit parties the participant introduces during preparation, such as a registry admin party or a provider party.

A failed check returns a typed refusal naming the property that failed, and signing stops.

We leave input-contract authentication out of scope. It requires recomputing the typed normal form of V12 contract ids, which needs trusted package and type data that the core never loads.

Party closure limits which parties may appear, but it cannot bind a party to a role. It knows Mallory is present, not that Mallory is the receiver. That is why the Token Standard adapter decodes `TransferFactory_Transfer` and compares sender, receiver, amount and instrument with the request. It handles the Token Standard V1 argument form, where sender and receiver are parties, and the V2 form, where they are accounts. Our production verifier already performs this comparison under hashing scheme V2.

We generate our own protobuf bindings for the package. The shared model, `@canton-network/core-ledger-proto` 1.9.0, does not implement V3 hashing, and decoding V3 through it silently drops `key_opt`, `by_key` and the `QueryByKey` node. For a verifier that is fatal, because it would approve transactions containing fields it never saw. Local bindings add V3 without changing the shared model for its existing consumers. For V2, our CI also compares output with `core-tx-visualizer`.

V3 changes the wire format in five places, and we cover the full delta.

- the node and metadata encoding-version prefixes are removed
- `key_opt` appears on create, exercise and fetch
- `by_key` appears on exercise and fetch
- the `QueryByKey` node is added
- `max_record_time` is added to signed metadata

PV35 supports both V2 and V3 and defaults to V2. Both carry `preparation_time`, so either can enforce an age bound. Only V3 carries `max_record_time`, so an expiry-bound policy needs V3.

The decoder walks the node forest defensively. It tracks visited node ids, enforces depth and node-count limits, and rejects duplicate node records, shared children, cycles, orphans and dangling references. Rollback subtrees are included in the hash walk and excluded from the effect walk.

Each conformance vector stores the participant's original protobuf bytes rather than JSON, because a JSON round trip can discard unknown fields and no longer reproduces the wire input.

### 3. Architectural Alignment

The library runs client-side against published Canton protocol artifacts. Nothing in Canton, Splice, Daml, the Ledger API or the Token Standard has to change for it to work.

It is the proving half of clear signing. The wallet shows the user what they are signing, and the library proves the display is honest by binding the displayed transaction to the signed bytes and comparing those bytes with the original request.

We do the work ourselves, from protocol analysis through the vector corpus and adversarial tests to any fixes an audit turns up. Separately we will offer the wallet repository a small free patch, described under Funding, and the maintainers will get a complete contribution to review through their normal process. Neither Milestone 1 nor Milestone 2 depends on that patch being merged.

### 4. Backward Compatibility

The npm package is a new optional dependency, so nothing changes for anyone who does not adopt it. The separate wallet patch flips one signing path from fail-open to fail-closed and includes an explicit opt-out.

---

## Milestones and Deliverables

### Milestone 1 (HASH): V2/V3 hashing and conformance vectors

Estimated delivery: week 10 from grant approval.

Focus: build and validate V2/V3 hashing with reusable conformance vectors.

Deliverables and value metrics:

- An Apache-2.0 npm package computing V2 and V3 hashes on bindings generated for this package. V4 stays out of scope while stable synchronizers reject it.
- A bounded Daml-LF forest traversal that rejects duplicate node records, shared children or second parents, cycles, orphans, dangling references, and anything over the configured depth or node limits.
- At least 60 versioned vectors, with no fewer than 20 for each of V2 and V3 and at least 15 mutation or reject cases. Accepted vectors keep the participant's exact protobuf bytes. Each reject vector names the accepted vector it came from and the mutation applied. The V3 corpus covers the full delta, including `QueryByKey`.
- Accepted vectors generated on a live participant connected to a PV35 synchronizer, driven by a Daml package we build specifically to exercise contract keys.
- Public CI running the corpus on every commit and comparing V2 with `core-tx-visualizer`.
- One documented entry point with published TypeScript types.

Acceptance:

- Every accepted V2 vector matches Canton's published Python reference and `core-tx-visualizer`.
- A negative control confirms the harness detects a one-byte encoding deviation.
- V3 hashes match a live participant on a PV35 synchronizer, on a set we hold back during implementation.
- Public CI rejects every listed forest violation and any input over either limit, and the job is publicly rerunnable.

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

This milestone covers adoption by an organisation other than FTP, through one of two routes. Route A is production or staging use by an independent integrator. Route B is integration into the official wallet SDK signing path. Either route qualifies for payment, the two payments are not cumulative, and demos and proofs of concept qualify under neither.

Deliverables and value metrics:

Route A, independent integrators. A named third party imports the package and calls it from its signing path. For a public repository, the dependency must be visible on the default branch, and the repository must show commits from at least two non-FTP authors during the preceding 90 days. For a private custody repository, the adopter confirms production or staging use in writing and provides a Committee contact.

Route B, official wallet SDK adoption. `@canton-network/wallet-sdk` adds the package under `sdk/wallet-sdk` on its default branch and uses it from the signing path.

Acceptance:

Route A evidence comes from the adopter, and FTP affiliates do not qualify. If we write the integration ourselves, it counts only after the adopting team merges it. Route B is complete when the dependency and its signing-path use are merged to the SDK default branch. The free V2-only wallet patch described under Funding does not count as Route B adoption, because it uses the V2 code already in the wallet and does not add the proposed package.

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

After Milestone 2 and any requested review, we will also submit a complete V2-only patch for `core/signing-internal`, closing the TODO cited above. It hashes `params.tx` with the wallet's existing V2 code and compares the result with `params.txHash` before signing. The patch is free, and neither its submission nor its merge is part of Milestone 2 acceptance.

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

Why a separate package instead of extending `core-tx-visualizer`, the existing V2 reference. Extending it to V3 needs regenerated protobuf bindings and a second hashing implementation, which changes the model its current consumers depend on. A separate package delivers V3 without touching that dependency surface.

Why not fix this in the platform. The platform does not have the caller's original request, so no platform change can perform the comparison. The check has to run client-side, in the wallet or gateway.

---

## Team

FTP delivered [Dev Fund #78](https://github.com/canton-foundation/canton-dev-fund/blob/main/proposals/2026-03-FTP-x402-protocol-integration.md), the x402 Protocol Integration for Canton. Milestones 1 and 2 were accepted. We run a MainNet validator and a live x402 facilitator, and the x402 harness is published as seven npm packages.

The [existing verifier and bypass tests](https://github.com/FTP-Tech-LLC/x402-canton-agent/tree/main/packages/agent-wallet/src) are public and run with `pnpm test` in the agent-wallet package.
