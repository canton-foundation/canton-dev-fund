# Development Fund Proposal: A bytes and cryptography toolkit for Daml

**Organization:** Tirai Protocol
**Author / Primary Contact:** Gopi Kannappan
**Proposal Type:** RFP-aligned
**RFP / Roadmap Area:** Developer Experience, Tooling & Education. Primarily item 16,
Daml / Developer Usability Gaps, which names native bytes support. Secondarily item 19,
DPM Components and Extension Ecosystem.

---

## Abstract

Daml has no byte array type. An application that needs to work with bytes produced
somewhere else, a signature, a hash, a serialised record from another system, does it
over hex-encoded `Text` with three helpers: `packHexBytes`, `byteCount` and
`isBytes32Hex`. Everything beyond that is written by hand, by every team, from scratch.

`DA.Crypto.Text` added `keccak256`, `sha256` and three secp256k1 verification functions,
stable from Daml-LF 2.3. They are powerful and almost entirely undocumented in use. Their
documentation does not say whether they work in a choice body, says nothing about cost,
and does not mention that one of them cannot verify a signature over a keccak digest while
another can.

We have spent the last week using them in earnest, against external test vectors, and
measuring what they cost. This proposal turns that work into a documented, reusable
library and DPM component, plus a written account of the usability gaps for the Foundation
and the Daml team.

**We are not proposing to investigate whether this is feasible. We have working code and
measurements, published below. We are proposing to turn a private workaround into shared
infrastructure.**

---

## The problem, with evidence

Everything in this section is measured, not estimated. Sources are committed code and
external test vectors, listed under Evidence.

**The builtins do work inside a choice body.** The documentation never states this and
every published example runs in a Daml Script. A team evaluating whether on-ledger
cryptography is possible at all has to discover this by experiment, and some will
reasonably conclude it is not supported.

**A malformed DER signature aborts the transaction. It does not return `False`.**
`secp256k1WithEcdsaOnly` raises `Malformed signature ... error decoding signature bytes`
when the input is structurally invalid, while a well-formed but incorrect signature
returns `False` as expected. Any application counting valid signatures against a threshold
will behave differently from its author's intent the first time it meets a malformed
input, and nothing in the documentation warns of this.

**`secp256k1` and `secp256k1WithEcdsaOnly` are not interchangeable.** The first re-hashes
its message argument with SHA-256 before verifying, so it cannot check a signature over a
keccak digest. Anyone integrating with Ethereum-style signatures needs the second, and the
documentation does not make the distinction findable.

**Daml-LF forbids local recursion.** "Local variables defined recursively, recursion can
only happen at the top level." Every loop over bytes must therefore be a top-level
function, which is surprising and is discovered at compile time after the code is written.

**The script service enforces a 60 second evaluation ceiling.** Reached easily by
byte-level work in tests, and not documented alongside the primitives that provoke it.

**Costs were unknown and are now measured.** Daml Script has no wall clock, so we measured
by slope: several scripts in one module so compilation cancels, equal transaction counts
so ledger overhead cancels, and the difference attributed to the work. Script order is
rotated between rounds, because a fixed order produced an impossible result where a script
doing strictly more work finished faster.

| Operation | Cost |
|---|---|
| `secp256k1WithEcdsaOnly` | 1.64 ms |
| `keccak256`, 32-byte input | 0.246 ms |
| `keccak256`, ~600-byte input | 3.45 ms |
| Ethereum block header RLP encode, in Daml | 2.41 ms |

Note the third row against the second. **Hash cost scales with input length**, so a figure
measured on a 32-byte input understates a realistic payload by more than an order of
magnitude. That is the kind of thing a developer should be able to read rather than
rediscover.

---

## What we will build

A Daml library, published as a DPM component, with four parts.

**1. Bytes.** The operations every team currently rewrites over hex `Text`: length, slice,
concatenate, compare, pad, convert to and from integers with explicit endianness, and
validate. Written against the current `Text` representation, with an interface designed so
that a future native bytes type can be adopted without changing call sites.

**2. Cryptography.** Thin, documented wrappers over `DA.Crypto.Text` that make the sharp
edges visible rather than surprising: which verification function to use for which digest,
what happens on malformed input, and what each one costs. Includes a safe counting helper
for threshold verification that cannot be defeated by a duplicate signature, which is a
mistake we made ourselves and had caught in review.

**3. Structured data.** RLP encoding and decoding, and Merkle proof verification for both
binary trees and Ethereum's Patricia trie. These are what any application verifying data
from an external system actually needs, and they are the part nobody wants to write twice.

**4. Evidence and documentation.** Test vectors from external authorities rather than from
our own output, a worked reference example, measured costs, and a written usability-gap
report for the Daml team.

---

## Evidence this already works

Committed and reproducible today:

- An Ethereum RLP encoder in Daml passing **28 of 28** official vectors from
  `ethereum/tests` `RLPTests/rlptest.json`. The test is mutation-checked: altering one
  expected byte makes it fail, so the pass is not vacuous.
- Signature verification against **Project Wycheproof** vectors
  (`C2SP/wycheproof`, `ecdsa_secp256k1_sha256_test.json`), 8 of 8 assertions, exercised
  from inside a choice body.
- `keccak256` output matching Foundry's `cast keccak` byte for byte.
- The cost measurements in the table above, with the methodology described.

External vectors are used deliberately. A test built from our own output cannot catch a
convention we got wrong on both sides.

---

## Architectural alignment

**No protocol change.** This is a library in Daml plus a DPM component. Nothing in the
synchronizer, the participant or the protocol is touched.

**No change to the privacy model.** Every function is pure and operates only on data the
calling contract already holds. The library exposes no new information to anyone and does
not depend on protocol-level metadata, which also means it is unaffected by future changes
to what the Mediator exposes.

**Stable APIs only.** `DA.Crypto.Text` is stable from Daml-LF 2.3 and Canton 3.5. The
library targets that and states its minimum versions explicitly.

**Reusable rather than application-specific.** Any Canton application that needs to check a
signature produced elsewhere, verify a hash, or read a serialised structure from another
system can use this. Our own use is one consumer, described below, and is not the point of
the work.

---

## Milestones and deliverables

### Milestone 1: Bytes and cryptography

Deliverables: the bytes module; documented cryptography wrappers including the safe
threshold-counting helper; external test vectors committed and running in CI; a published
DPM component; reference documentation covering the undocumented behaviours above.

Acceptance criteria: a Canton developer can verify an externally produced signature or
hash in a choice body without writing hex plumbing; the documented sharp edges each have a
test demonstrating them; the DPM component installs and its examples run.

### Milestone 2: Structured data

Deliverables: RLP encode and decode; Merkle proof verification for binary trees and for
Ethereum's Patricia trie; vectors from external authorities for each; measured costs
published alongside.

Acceptance criteria: an application can verify that a record is included under a root it
was given, using only the library; every encoder round-trips against external vectors; the
cost of each operation is published so applications can budget against the evaluation
ceiling.

### Milestone 3: Reference example, report and maintenance

Deliverables: a worked end-to-end example verifying an external chain's block header
in Daml, which is the smallest realistic thing that exercises every part of the library; a
written usability-gap report for the Daml team, covering native bytes, the abort-on-
malformed behaviour, local recursion and the evaluation ceiling, with measurements; a
maintenance plan and versioning policy.

Acceptance criteria: the example runs from a clean checkout and is documented well enough
for a developer unfamiliar with the library to adapt it; the report is specific enough to
be actionable by the Daml team.

---

## Funding

**Total funding request:** to be completed.
**Project duration:** to be completed.

No maximum amount or duration is published for this RFP area. We would welcome the
Foundation's guidance on what is appropriate for a library of this scope before fixing a
figure, and will revise this section before the proposal is considered.

---

## Our interest, stated plainly

Tirai is a shielded asset protocol. It runs in production on Ethereum, Arbitrum and
Solana, and a Daml verifier of the same proof runs on Canton. We built the work described
here because we needed to verify a permissioned EVM chain's blocks from inside Daml, and
found that the byte-level groundwork did not exist.

We will build that groundwork either way. This proposal is to build it **once, in the
open, for everyone**, rather than privately for ourselves. Our own use becomes the worked
example in Milestone 3 and the proof that the library does real work.

The library will be Apache-2.0, matching Canton's own licence. Tirai's protocol, circuit
and prover are not part of this proposal and remain ours.

---

## Maintenance

We maintain production verifier implementations on four platforms today and have a direct
interest in this library continuing to work as Canton evolves. We commit to version
compatibility statements for supported Canton and Daml-LF versions, published test vectors
so breakage is detectable by anyone rather than only by us, and issue response for the
duration of the grant and beyond while we remain a consumer.
