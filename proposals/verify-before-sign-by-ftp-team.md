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

An external Canton signer receives a prepared tx and a hash computed by the preparing participant. Recomputing the hash binds it to the returned bytes. It does not prove that the prepared tx matches the signer's request.

This proposal delivers an Apache-2.0 TypeScript lib for both checks. The generic core recomputes V2 and V3 hashes and verifies the transaction root, signed metadata and party closure. A Token Standard adapter compares sender, receiver, amount and instrument with the original request. All required checks fail closed. The project also publishes lang-neutral conformance vectors for non-TypeScript and hardware-wallet implementations.

FTP already runs a narrower V2 verifier in its MainNet payment flow (x402 agentic wallet). [verify-prepared.ts](https://github.com/FTP-Tech-LLC/x402-canton-agent/blob/main/packages/agent-wallet/src/verify-prepared.ts) has 83 tests, including 39 verifier-bypass cases. The grant extracts the reusable core, implements V3 and separates Token Standard logic from the current hand-maintained template list.

The funding request is up to 570,000 CC: 250,000 CC for engineering and up to 320,000 CC after adoption. Any external security review requested by the Committee is handled separately.

---

## Specification

### 1. Objective

The wallet or gateway must reject a prepared tx before signing when it does not match the submitted request.

The package exposes one public entry point with two internal layers:

- The generic core binds the hash to the prepared bytes and verifies protocol-level structure without loading a Daml package.
- The Token Standard adapter verifies business fields that cannot be inferred from an unknown choice argument after Daml interpretation.

Full request verification runs in the wallet or gateway, where the original request is available. A signing driver receives `tx` and `txHash` and can only verify that binding.

### 2. Implementation Mechanics

In the [approve path](https://github.com/canton-network/wallet/blob/main/wallet-gateway/remote/src/web/frontend/approve/index.ts#L72-L86), `preparedTransactionHash` and `preparedTransaction` are read separately; no hash is recomputed. The [internal](https://github.com/canton-network/wallet/blob/main/core/signing-internal/src/controller.ts#L79) and [Fireblocks](https://github.com/canton-network/wallet/blob/main/core/signing-fireblocks/src/index.ts#L86) drivers still have `// TODO: validate transaction here` at signing.

**Example:** Alice asks her wallet to send 100 CC to Bob. The participant selects the holdings and returns a prepared transaction with its hash. It could instead prepare a valid transfer to Mallory and return the matching hash. Recomputing the hash would not detect that substitution: the bytes and hash agree, and Alice would sign the hash for those bytes. Only the wallet still has the original request and can compare it with the prepared transaction before signing.

The caller supplies the prepared bytes, participant hash, original request and policy. After decoding, the core checks:

1. **Root match.** The first release follows the Ledger API's single-command submission model. It requires exactly one matching root and rejects additional roots. Creates match by qualified template name. Exercises match by choice and qualified template or interface name.
2. **Signed metadata.** The signed `act_as` set and command id match the request. The synchronizer and signed time fields satisfy the caller policy.
3. **Party closure.** Every node party is named by the caller or admitted by an explicit policy rule. Rules may admit registry admin or provider parties that are introduced during preparation.

A failed check returns a typed refusal identifying the failed property. **Signing does not continue.**

Input-contract authentication is **outside scope**. Recomputing the typed normal form of V12 contract ids requires trusted package and type data, which the package-free core does not load.

Party closure restricts which parties may appear but does not bind a party to a business role. The Token Standard adapter therefore decodes `TransferFactory_Transfer` and compares (sender/receiver/amount/instrument) with the request. It supports the V1 argument, where sender and receiver are parties, and the V2 argument, where they are accounts. **FTP's current V2 verifier already performs this comparison.**

The package uses generated local protobuf bindings. `@canton-network/core-ledger-proto` 1.9.0 does not expose all V3 node fields and **does not implement V3 hashing.** Decoding V3 through that model omits `key_opt`, `by_key` and `QueryByKey` without an error. Package-local bindings add V3 without changing the shared model for existing consumers. For V2, CI also compares our output with `core-tx-visualizer`.

(Tech diff) -> V3 support covers the full version delta:

- removal of the node and metadata encoding-version prefixes;
- `key_opt` on create, exercise and fetch;
- `by_key` on exercise and fetch;
- the `QueryByKey` node;
- `max_record_time` in signed metadata.

**PV35 supports V2 and V3 and defaults to V2.** Both schemes include `preparation_time`, so either can enforce an age bound. Only V3 includes `max_record_time`; an expiry-bound policy therefore requires V3.

Traversal tracks visited node ids and enforces depth and node-count limits. It rejects duplicate node records, shared children, cycles, orphans and dangling references. Rollback subtrees are included in the hash walk and excluded from the effect walk.

Each conformance vector stores the participant's original protobuf bytes. A JSON round trip can discard unknown fields and cannot reproduce the original wire input.

### 3. Architectural Alignment

The library is client-side and consumes published Canton protocol artifacts. **It requires no change to Canton, Splice, Daml, the Ledger API or the Token Standard.**

The library is the verification component behind clear signing: it binds the displayed transaction to the signed bytes and compares those bytes with the original request.

FTP owns the protocol analysis, generated bindings, implementation, vectors, adversarial tests, documentation and audit remediation. The optional wallet patch is submitted after implementation and any review requested by the Committee. Maintainers receive a complete contribution for normal review. **Milestones 1 and 2 do not depend on merge.**

### 4. Backward Compatibility

The npm package is a new optional dependency and **does not affect existing integrations.** The separate wallet patch changes one signing path from fail-open to fail-closed and includes an explicit opt-out.

---

## Milestones and Deliverables

### Milestone 1 (HASH): V2/V3 hashing and conformance vectors

**Estimated Delivery:** week 10 from grant approval

**Focus:** Build and validate V2/V3 hashing with reusable conformance vectors.

**Deliverables / Value Metrics:**

- Apache-2.0 npm package computing V2 and V3 hashes on bindings generated for this package. V4 remains out of scope while stable synchronizers reject it.
- Bounded Daml-LF forest traversal rejecting duplicate node records, shared children or second parents, cycles, orphans, dangling references, and configured depth or node-limit breaches.
- At least 60 versioned vectors, with no fewer than 20 for each of V2 and V3 and at least 15 mutation or reject cases. Accepted vectors retain the participant's exact protobuf bytes. Reject vectors identify their accepted source and applied mutation. The V3 corpus covers the full delta, including `QueryByKey`.
- Accepted vectors generated through a live participant connected to a PV35 synchronizer and driven by a purpose-built Daml package with contract keys.
- Public CI running the corpus on every commit and comparing V2 with `core-tx-visualizer`.
- One documented entry point with published TypeScript types.

**Acceptance:**

- Every accepted V2 vector matches Canton's published Python reference and `core-tx-visualizer`.
- A negative control confirms that the harness detects a one-byte encoding deviation.
- V3 hashes match a live participant connected to a PV35 synchronizer on a held-out set not used during implementation.
- Public CI rejects every listed forest violation and inputs over either configured limit. The job is publicly rerunnable.

### Milestone 2 (GATE): Request verification and fail-closed policy

**Estimated Delivery:** week 18 from grant approval

**Focus:** Verify the prepared transaction against the original request before signing.

**Deliverables / Value Metrics:**

- Fail-closed enforcement of root, signed-metadata and party checks for create and exercise roots, including interface identifiers where present.
- Caller policy covering expected parties and synchronizer, accepted template and interface names, optional package-id pins, minimum hashing scheme and freshness bounds.
- Rollback-aware separation of hash and effect traversal.
- Token Standard adapter for `TransferFactory_Transfer`, covering the V1 party form and V2 account form and comparing sender, receiver, amount and instrument with the request.
- Typed refusals naming the failed property or mismatched field.
- Decoder mutation tests for malformed and adversarial input.
- Integration docs for policy construction, refusal handling and use of the vector corpus.
- A frozen release candidate suitable for an external security review if the Committee requests one.

**Acceptance:**

- A live participant produces a correct transfer accepted for both Token Standard V1 and V2 argument forms.
- Valid transaction bytes paired with the hash of a different transaction are refused.
- Four tests substitute sender, receiver, amount and instrument individually. Each refusal names the changed field.
- A transaction failing any core property is refused rather than accepted with a warning.
- Public CI must refuse stale `preparation_time` under both schemes and an expiry-bound policy under V2. The same job covers the scheme floor, rollback separation and mutation suite.

### Milestone 3 (ADOPT): Third-party adoption

**Estimated Delivery:** within 18 months of grant approval

**Focus:** Prove third-party adoption in a signing path.

This milestone covers adoption by an organisation other than FTP. Route A requires production or staging use; Route B requires integration into the official wallet SDK signing path. Demos and PoCs do not qualify. Either route qualifies for payment.

**Deliverables / Value Metrics:**

**Route A: independent integrators**

A named third party consumes the package from its signing path. For a public repository, the dependency is visible on the default branch and the repository has commits from at least two non-FTP authors during the preceding 90 days. For a private custody repository, the adopter confirms production or staging use in writing and provides a Committee contact.

**Route B: official wallet SDK adoption**

`@canton-network/wallet-sdk` adds the package under `sdk/wallet-sdk` on its default branch and uses it from the signing path.

**Acceptance:**

Route A evidence comes from the adopter. **FTP affiliates do not qualify.** If FTP writes the patch, it counts only after the adopter merges it.

Route B is complete when the dependency and signing-path use are merged to the SDK default branch. The Milestone 2 patch is separate from adoption. It relies on the V2 code already in the wallet and does not add the proposed package. Route A and Route B payments are not cumulative.

---

## Acceptance Criteria

Use the acceptance list under each milestone. Milestones 1 and 2 use public tests and the stated live-participant cases. Milestone 3 requires evidence from the adopter.

---

## Funding

**Total Funding Request:** up to 570,000 CC: 250,000 CC for engineering and up to 320,000 CC after third-party adoption.

### Payment Breakdown

- Milestone 1 (HASH): 100,000 CC upon Committee acceptance.
- Milestone 2 (GATE): 150,000 CC upon Committee acceptance.
- Milestone 3 (ADOPT), Route A: 80,000 CC per qualifying independent integrator, up to four.
- Milestone 3 (ADOPT), Route B: 320,000 CC when its acceptance conditions are met.

Without third-party adoption, the Fund pays 250,000 CC for the two engineering milestones. Adoption payments are capped at 320,000 CC.

### External Security Review

After Milestone 2, FTP will arrange an independent security review if requested by the Committee. Its scope and cost will be agreed separately against the vendor quote.

After Milestone 2 and any requested review, FTP will submit a complete V2-only patch for `core/signing-internal`. It hashes `params.tx` with the wallet's existing V2 code and compares the result with `params.txHash` before signing. The patch is free, and neither its submission nor merge is part of Milestone 2 acceptance.

### Volatility Stipulation

The grant is denominated in Canton Coin. If CC volatility materially changes its real value between acceptance and payment, FTP and the Tech and Ops Committee will re-evaluate the affected amount.

---

## Co-Marketing

FTP will coordinate the release announcement with the Foundation.

---

## Motivation

Regulated custodians use external signing to retain control of their Canton keys. Their signing stacks differ: some predate the wallet SDK, and hardware wallets do not run JavaScript.

4 teams besides FTP have implemented prepared-transaction hashing separately:

- [BitGo](https://github.com/BitGo/BitGoJS/blob/master/modules/sdk-coin-canton/resources/hash/hash.js#L1) maintains an independent V2 implementation and does not depend on the wallet SDK.
- [Turnkey](https://github.com/tkhq/sdk/blob/main/examples/chain-integrations/with-canton/README.md#L54) has a TypeScript V3 port as example code, not an installable package.
- Ledger and Cypherock each have V2 code running on the device, but no host-side library.

Canton 3.5.1 adds V3 hashing for PV35 and requires it when contract keys are used. BitGo, Ledger and Cypherock still implement V2, while Turnkey's V3 code remains example-only. Once this package ships, integrators can use it directly or test their own code against the same vectors.

### Maintenance

FTP will maintain the package for 12 months after Milestone 2 or until the Milestone 3 adoption window closes, whichever is later, at no additional cost. FTP already tracks Canton and Splice releases for its validator and facilitator. If maintenance stops, the Apache-2.0 code and vectors remain public. FTP will give 90 days' notice and offer repository and publishing rights to the Foundation or an agreed successor.

---

## Rationale

`core-tx-visualizer` remains the V2 reference in CI. Extending it to V3 requires regenerated protobuf bindings and a second hashing implementation, changing the model consumed by its existing users. A separate package delivers V3 without changing that dependency surface.

A platform change cannot perform the request comparison because the platform does not have the caller's original request. The check belongs in the wallet or gateway.

---

## Team

FTP delivered [Dev Fund #78](https://github.com/canton-foundation/canton-dev-fund/blob/main/proposals/2026-03-FTP-x402-protocol-integration.md), the x402 Protocol Integration for Canton. Milestones 1 and 2 were accepted. FTP currently runs a MainNet validator and live x402 facilitator; the x402 harness is published as seven npm packages.

The [existing verifier and bypass tests](https://github.com/FTP-Tech-LLC/x402-canton-agent/tree/main/packages/agent-wallet/src) are public and run with `pnpm test` in the agent-wallet package.
