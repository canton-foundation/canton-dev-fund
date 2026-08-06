## Development Fund Proposal: Prepared-Transaction Verification Library

**Author:** nicky2pc, FTP
**Status:** Submitted
**Created:** 2026-08-05
**Label:** wallet-apps
**Champion:** -

---

## Abstract

When an external party signs a Canton transaction, it signs a hash handed to it by a participant. Canton's own Ledger API definition states that clients **MUST** recompute that hash rather than trust it, and **MUST** display the transaction content for the user to validate first. The official gateway does decode and display a transaction, and it displays a hash beside it, but no production signing path recomputes that hash. Nothing binds what the user approves to what the key signs. Five teams have each written their own private version of the missing check, four of them pinned to hashing scheme V2, and Canton 3.5.1 now tells integrators to move to V3.

This proposal delivers:

1. **One Apache-2.0 TypeScript library** that recomputes the prepared transaction hash for schemes V2, V3 and V4 from protobuf bindings it owns, and **refuses to sign** unless four properties hold that a client can decide without the Daml package: root node identity, binding of the transaction metadata to the submitted request, party closure over every node in the tree, and authentication of the input contract ids
2. **A published conformance vector corpus**, language-neutral and carrying canonical wire bytes, so implementations in any language including embedded C can validate themselves without adopting the library
3. **An upstream pull request** to `canton-network/wallet` reading the raw transaction the signing interface already carries and never checks. Contributed free, with no milestone payment attached
4. **V3 support in an installable package**, which does not exist today in any form the ecosystem can consume

We already run fail-closed verification of this kind in production inside `@ftptech/canton-agent-wallet`. It is V2 only and tied to our own payment flow. The grant funds the generalization and public release, not the concept.

Funding is 100,000 CC, 150,000 CC and up to 320,000 CC across three milestones, for a maximum of 570,000 CC, plus a security review pass-through of up to 60,000 CC. If no adoption materializes, the Fund's committed exposure is 250,000 CC.

---



## The evidence, in links

**The protocol requires this check, twice.** `[interactive_submission_service.proto:237](https://github.com/digital-asset/canton/blob/main/community/ledger-api-proto/src/main/protobuf/com/daml/ledger/api/v2/interactive/interactive_submission_service.proto#L237)` "Clients MUST display the content of the transaction to the user for them to validate before signing the hash if the preparing participant is not trusted". Line 242 on the hash field: "Only provided for convenience, clients MUST recompute the hash from the raw transaction if the preparing participant is not trusted", and the next line adds that the field "May be removed in future versions".

**The signer already receives the raw transaction and never reads it.** `[typings.ts:9](https://github.com/canton-network/wallet/blob/main/core/signing-lib/src/rpc-gen/typings.ts#L9)` declares `tx` a required member of `SignTransactionParams` and documents it as the "Bytestring of the prepared transaction for verification purposes". `[transaction-service.ts:316](https://github.com/canton-network/wallet/blob/main/wallet-gateway/remote/src/ledger/transaction-service.ts#L316)` populates it on every live signing call. `[controller.ts:79](https://github.com/canton-network/wallet/blob/main/core/signing-internal/src/controller.ts#L79)` then carries `// TODO: validate transaction here` and reads `txHash` twice and `tx` not once across 302 lines.

**The recompute is written twice in the official stack and called from production zero times.** `[prepared.ts:23](https://github.com/canton-network/wallet/blob/main/sdk/wallet-sdk/src/wallet/namespace/transactions/prepared.ts#L23)` signs the participant's hash as received. The decoder sits in the same 43-line file, reachable only through an optional `decode()` method that no signing path calls. Both hashing implementations are hard-wired to V2 and neither accepts a scheme version.

**The official decoder cannot represent V3, and fails silently when it meets it.** The published bindings stop at V2 and carry none of the fields V3 adds. Two transactions differing only in a V3 field produce different wire bytes and the same hash, with no error raised.

**The only prepared-transaction validator refuses the transactions that carry value.** `[index.ts:126](https://github.com/canton-network/wallet/blob/main/core/tx-visualizer/src/index.ts#L126)` throws `Unsupported` on the first exercise node. Every token-standard transfer is an exercise of `TransferFactory_Transfer`.

**Five teams are solving this privately, each alone.**

- [BitGo](https://github.com/BitGo/BitGoJS/blob/master/modules/sdk-coin-canton/resources/hash/hash.js#L1) maintains its own copy "since we won't be using the canton wallet SDK", with an open engineering ticket on the next line
- [Turnkey](https://github.com/tkhq/sdk/blob/main/examples/chain-integrations/with-canton/README.md#L54) solved it further than anyone, writing [the only V3 implementation in TypeScript](https://github.com/tkhq/sdk/blob/main/examples/chain-integrations/with-canton/src/hashing/v3.ts), then stated "we don't provide this code in an NPM package that you can conveniently install"
- [Cordial Systems](https://github.com/cordialsys/crosschain/blob/main/chain/canton/tx_input/hash_validation.go#L21) solved it again in Go
- [Ledger](https://github.com/LedgerHQ/app-canton/blob/develop/src/transaction/canonical_hash.c#L25) and [Cypherock](https://github.com/Cypherock/x1_wallet_firmware/blob/main/apps/canton_app/canton_txn_encoding.c#L388) solved it on device, in 160,001 and 216,536 bytes of hand-written C across their Canton transaction modules

**Those private solutions are about to break.** The Canton 3.5.1 release notes state that "Integrators are encouraged to move to `HASHING_SCHEME_VERSION_V3` for synchronizers using protocol version 35" and that "usage of contract keys requires" it. Four of the five are pinned to V2, and the fifth is the one its own author will not distribute. At Ledger, V3 is not an enum value in the generated protobuf at all, so moving means reflashing firmware.

---



## Specification



### 1. Objective

**Problem:** An external party signing a Canton transaction signs a hash handed to it by a participant. No production signing path recomputes that hash or checks what is inside it against the request that produced it.

**Outcome:** One Apache-2.0 TypeScript library that recomputes the hash for schemes V2, V3 and V4 and refuses to proceed unless four template-independent properties hold: root node identity by choice name and qualified template or interface name, binding of the submitted request to the signed metadata, party closure over every node in the tree, and authentication of the input contract ids.

**What it does not claim.** A prepared transaction carries the choice argument re-translated through the Daml type signature, which rescales numerics and substitutes package identifiers, so reproducing it requires the package. Byte comparison of choice arguments is not available to a client without the DAR, and we do not claim it. It is offered as an opt-in mode for callers that supply type signatures.

**Success looks like:**

- A custody platform replaces a hand-written hashing file with one dependency and gains V3 support it does not have today
- A wallet integrator calls one function before signing and gets a refusal, not a warning, when the transaction does not answer to the request
- An implementation in any language, including embedded C, validates itself against the published vectors

This proposal has a single objective. It does not bundle a wallet, a signing driver, a gateway or a user interface. The live proposals here are consumers rather than duplicates: #109 Wallet Gateway, #409 Signer and #82 ClearSign can call the library, and #574 Mobile SDK, being Swift and Kotlin, can validate against the vector corpus. None publishes conformance vectors or commits to a hashing scheme version.

### 2. What already exists versus what is net-new

**Reused as an oracle, not as a runtime dependency.** `@canton-network/core-tx-visualizer` recomputes the V2 hash correctly but cannot be the decode path, because its bindings cannot represent V3. We generate our own and keep the official package in CI as a differential oracle, which gives cross-implementation agreement on V2 from day one against it and against Ledger's independently written C.

**Ours already.** The production verifier in `@ftptech/canton-agent-wallet` walks the decoded transaction fail-closed, but pins its rules to a hand-maintained list of choices and templates. That list is what makes it safe and also why it does not generalize: a new registry template is unverifiable until someone adds it. This grant keeps the posture and replaces the list with properties that hold for any template.

**Unpackaged everywhere.** Hashing schemes V3 and V4 in any installable TypeScript library. Template-independent verification of a prepared transaction against the request that produced it. A published vector corpus carrying canonical wire bytes. A fail-closed default living in a library rather than re-implemented per integrator.

**On Dev Fund #50, the Splice Wallet Kernel maintenance grant.** That grant states in full that "Major upgrades to the covered components and new feature development are out of scope for this maintenance grant and will be proposed in separate CIPs." This is that separate proposal, and the upstream patch is contributed at zero cost, so nothing here is billed twice.

### 3. Implementation Mechanics

The library exposes one entry point. A caller passes the prepared transaction, the request it believes it submitted, and a policy: expected parties, accepted packages, the lowest hashing scheme it will tolerate, and a freshness bound. It receives a verified result or a typed refusal naming the property that failed.

Decoding runs on bindings we generate ourselves, so every field the protocol defines is representable. The hash is recomputed by a shared builder with thin per-scheme deltas. V3 is ported against Digital Asset's published Python reference and validated against the Scala original. V4 has no Python reference, so it is implemented against the Scala source and shipped best-effort while it remains rejected on stable synchronizers.

The scheme is not left to the counterparty. Protocol version 35 accepts both V2 and V3 and defaults to V2, but only V3 binds `max_record_time`, so a participant answering V2 returns a signature that does not commit to the transaction's own expiry. The caller sets a floor and anything below it is refused.

The transaction is then walked from its roots. Both root kinds Canton admits are accepted, identity is matched on the interface identifier where one is present because a token-standard transfer reports the concrete registry template rather than the interface it was called through, and all three Daml-LF well-formedness conditions are enforced, including the aliasing condition existing implementations omit and which is why a naive hasher can be made to run for hours on a payload under 50KB. The walk is bounded, and it distinguishes the hash walk, which must descend into rollback subtrees, from the effect walk, which must not. Party assertions cover exercise and fetch nodes, which the existing validator rejects outright. Input contracts are authenticated against the payloads the participant attributes to them, wherever that is decidable without the package.

Alongside the library we publish a versioned corpus. Each vector carries the canonical wire bytes, not just the JSON, because re-encoding JSON to the wire is not canonical and that is where two correct implementations diverge. It includes reject vectors for the malformed cases above, and is generated against a live protocol version 35 participant using our own Daml package with contract keys, which is what forces the V3 delta.

The upstream pull request is small as a patch and bounded in what it proves. The plumbing exists and is unused, so it reads a field the platform already delivers rather than changing a signer interface. But that repository's own bindings stop at V2, so a merged patch establishes V2 agreement and nothing more, and covering V3 there would mean regenerating them, which is a maintainer decision. That boundary is the case for this grant rather than an objection to it: an integrator needing V3 today cannot get it from the official stack at any patch size. CIP-0100 states the committee "should only fund projects that require changes to the core OSS repos if they have the buyin of the code maintainers of those repos", which is why no payment here depends on it being merged.

### 4. Architectural Alignment

The library is additive. It requires no changes to Canton core, Splice or Daml, and no change to the token standard. It consumes published protocol artifacts only.

### 5. Backward Compatibility

No backward compatibility impact. The library is a new, optional dependency. The upstream patch changes a default from fail-open to fail-closed and will be proposed with an explicit opt-out.

---



## Milestones and Deliverables



### Milestone 1: Multi-scheme recompute and conformance vectors

- **Estimated Delivery:** Week 10 from grant approval
- **Focus:** Close the V3 gap in installable TypeScript and publish vectors any implementation can check itself against
- **Deliverables and Value Metrics:**
  - Apache-2.0 package published to npm supporting hashing schemes V2, V3 and V4, on protobuf bindings we generate ourselves so every protocol field is representable rather than silently dropped
  - Bounded traversal enforcing all three Daml-LF well-formedness conditions, including the aliasing condition current implementations omit
  - Versioned vector corpus for V2 and V3 with mutation and reject cases, carrying canonical wire bytes, language-neutral so embedded C can validate without adopting the library. V4 best-effort while the protocol definition states it "is only returned for development-protocol synchronizers and is rejected for stable synchronizers"
  - Vectors generated against a live protocol version 35 participant using a purpose-built Daml package with contract keys
  - Public CI running the corpus on every commit, including byte-for-byte agreement with `core-tx-visualizer` and Ledger's C on V2
- **Funding:** 100,000 CC upon committee acceptance



### Milestone 2: Verification, fail-closed policy and upstream contribution

- **Estimated Delivery:** Week 18 from grant approval
- **Focus:** Turn hash computation into a signing decision
- **Deliverables and Value Metrics:**
  - The four template-independent properties enforced fail-closed, across both legal root kinds and via the interface identifier where one is present
  - A caller-set floor on the accepted hashing scheme, so a counterparty cannot answer V2 on a protocol version 35 synchronizer and return a signature that does not bind `max_record_time`
  - Rollback-aware traversal, separating the hash walk that must descend from the effect walk that must not
  - Typed refusals naming the property that failed, and an opt-in mode for callers supplying type signatures who want field-level argument comparison
  - Decoder hardened against malformed and adversarial input, with a mutation test suite
  - Pull request opened against `canton-network/wallet` reading the `tx` field the signing interface already carries. Contributed at zero cost, and acceptance of this milestone does not depend on it being merged
  - Independent security review of the verification logic, commissioned against a frozen commit at the end of Milestone 1 and reported in this milestone, with the npm `latest` tag withheld until the report is in
- **Funding:** 150,000 CC upon committee acceptance



### Milestone 3: Adoption

- **Estimated Delivery:** Within 18 months of grant approval
- **Focus:** Payment tracks consumption by organizations other than the applicant. Two routes qualify, and the milestone is satisfied by either
- **Deliverables and Value Metrics:**
  - **Route A, independent integrators.** The library appears as a consumed dependency in the default branch of a public repository belonging to a named third party, with the import reachable from a signing path. The consuming repository shows commits from at least two authors unaffiliated with the applicant in the 90 days before the claim, and the consuming team confirms in writing that it is used in a production or staging signing path
  - **Route B, the official SDK as the adopter.** The library is taken as a dependency of `@canton-network/wallet-sdk` under `sdk/wallet-sdk`, on the default branch and reachable from its signing path. This is the same adoption event as Route A with a single adopter that reaches every consumer of the official SDK at once, which is why it settles the milestone in full
- **Funding:** 80,000 CC per independent integrator to a maximum of four, or 320,000 CC in full under Route B. The two routes are not cumulative

Route B is a distinct artifact from the free patch delivered in Milestone 2. That patch targets the gateway signing driver under `core/signing-internal`, is paid nothing, and does not need to be merged. Route B is the library itself being consumed by the SDK under `sdk/wallet-sdk`. The Milestone 2 patch does not count toward it.

Integrators affiliated with the applicant do not qualify. Under Route A, pull requests we author count only once merged by maintainers of the consuming organization. Under Route B, the decision rests with the wallet maintainers and nothing here presumes it.

**Deadline rationale.** Engineering completes inside two quarters. The 18 month window applies only to Milestone 3, as an explicit exception of the kind granted in Dev Fund #46 and #407, because adoption of a signing-path dependency is governed by the consuming organization's release cycle rather than ours. A shorter window would push us to claim adoption from friendly parties rather than real ones.

---



## Acceptance Criteria

Evaluated on ecosystem value, not artifact delivery:

- **Milestone 1** is accepted when the V2 corpus agrees byte for byte with two implementations written independently of it, `core-tx-visualizer` and Ledger's C, and catches a deliberately introduced hashing error in both, and when the V3 corpus agrees with a live protocol version 35 participant. Both in a public CI job any third party can re-run
- **Milestone 2** is accepted when a transaction failing each of the four properties is demonstrably refused rather than warned about against a live participant, with the refusal naming the property, and when the security review report is delivered
- **Milestone 3** is accepted per integrator under Route A, on evidence from the consuming team rather than self-attestation, or in full under Route B on the merged dependency being visible in the official SDK's default branch

---



## Funding

**Total Funding Request:** up to 570,000 CC, plus a security review pass-through of up to 60,000 CC


| Milestone                                                                | Amount           | Share of maximum |
| ------------------------------------------------------------------------ | ---------------- | ---------------- |
| Milestone 1, multi-scheme recompute and vectors                          | 100,000 CC       | 17.5%            |
| Milestone 2, verification and upstream                                   | 150,000 CC       | 26.3%            |
| Milestone 3, adoption, by independent integrators or by the official SDK | up to 320,000 CC | 56.1%            |


The two engineering milestones together are 250,000 CC, and that is the Fund's committed exposure if the library is never adopted. Everything above it is contingent, consistent with CIP-0100's statement that "Grants are generally expected to be weighed towards adoption milestones which generate utility & value to the ecosystem".

The security review is a pass-through of vendor invoice up to 60,000 CC, outside the 570,000 CC base. It is commissioned against a frozen commit at the end of Milestone 1 and reported in Milestone 2, so the auditor sees the hashing core before it carries the `latest` tag rather than after integrators depend on it. It is smaller than the audit lines in comparable grants because the scope is one verification library and its vector corpus, not an SDK or a platform.

### Volatility Stipulation

The grant is denominated in Canton Coin (CC). If CC price volatility materially changes the real value of the grant between acceptance and payout, the grant amount will be re-evaluated. Any adjustments will be negotiated between FTP and the Tech and Ops Committee.

---



## Adoption and Go To Market

Distribution is npm, plus the free upstream patch, which closes the V2 gap for gateway operators whether or not they ever adopt our package.

The teams most likely to adopt first are the five already maintaining their own implementations, since the library removes code they currently carry. None has committed, and nothing here assumes they will. We approach them once Milestone 1 ships and there is something concrete to evaluate. The milestone structure is built so that the Fund pays nothing for adoption that does not materialize.

---



## Maintenance and Post-Grant Sustainability

We maintain the library for 12 months after Milestone 2 acceptance or until the Milestone 3 adoption window closes, whichever is later, at no cost to this grant. That covers new hashing scheme versions, security fixes and the conformance matrix.

**Post-grant maintenance, separate and not part of the 570,000 CC.** Beyond that period we propose ongoing maintenance under a separate grant subject to committee review. The reason this is credible is operational rather than contractual: we run a MainNet validator and a live x402 facilitator and track Canton and Splice releases for our own infrastructure already, so the library and its vectors are refreshed on the same upgrade cycle.

- **Compatibility cadence:** the vector corpus is regenerated against each Canton release, and the compatibility matrix is kept current
- **Upgrade playbook:** a documented procedure for moving the bindings and encoders to a new protocol or hashing scheme version, so the work does not depend on one person
- **Issue handling:** integration-blocking defects are triaged on the same track as our node incidents, and security-relevant issues are patched first
- **Release hygiene:** semantic versioning, changelogs and migration notes on every release

If maintenance is never renewed, the library stays Apache-2.0 and the vectors stay published and versioned, so any consumer can fork without permission. If we become unable to maintain it, repository administration and npm publishing rights are offered to the Canton Foundation or a mutually agreed successor with 90 days notice.

---



## Co-Marketing

Upon release we will collaborate with the Foundation on announcement coordination, a technical write-up walking through a real divergence caught before signing, and developer promotion through Canton community channels.

---



## Motivation

CIP-0082, which established the Development Fund, defines its purpose as "long-term investment in the Canton protocol (core R&D, dev tools, security, audits, reference implementations, ... critical infra)".

External party signing is how regulated custodians hold their own keys on Canton. The teams that most need verification before signing are largely the ones that cannot take a dependency on the wallet SDK, either because their stacks predate it or because they run on embedded hardware with no JavaScript runtime. They need a small, SDK-independent, multi-version library and a published conformance corpus. Neither exists, which is why the same work has now been paid for five times and packaged for reuse zero times.

---



## Rationale

**Why not simply extend** `core-tx-visualizer`**?** Extending it in place means regenerating its proto layer, which changes the object every existing consumer decodes against, and it still would not give us the refusal: that package is a decoder used by the wallet SDK and by dApp frontends, and making it fail-closed would change behaviour for all of them. The integrators who most need refusal semantics either avoid that dependency deliberately, as BitGo states in its own source, or cannot take it at all. A separate small library is the only shape both populations can consume, and we keep the official package in CI so the two never silently diverge on V2.

**Why not wait for Digital Asset?** The recompute has sat in the official repository, written twice and called from production zero times, for as long as the signing path has trusted the participant hash. The signing interface already carries the raw transaction and documents it as being for verification, and the controller still does not read it. We contribute the patch for free so the question does not arise.

---



## Team

FTP delivered Dev Fund #78, the x402 Protocol Integration for Canton, with Milestones 1 and 2 accepted by the committee. We operate a MainNet validator and a live x402 facilitator, and we publish seven packages on npm covering the Canton x402 stack.

Our existing `verify-prepared.js` recomputes the prepared transaction hash and walks the decoded transaction fail-closed for our own payment flow, against a fixed list of choices and templates. It is the direct precursor to this proposal, disclosed in Specification section 2.