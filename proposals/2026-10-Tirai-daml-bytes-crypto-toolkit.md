# Bytes, Cryptography and Structured Data for Daml

Applicant: Tirai Protocol  
Engineer: Gopi Kannappan, sole engineer  
RFP area: Developer Experience, Tooling & Education  
RFP items: 16, Daml / Developer Usability Gaps; 19, DPM Components and Extension Ecosystem (reusable Daml packages)  
Label: Daml Language & Developer Tooling  
Champion: Needs Champion  
Funding requested: 300,000 CC  
Proposed duration: nine weeks across three milestones

## Summary

I propose an Apache-2.0 open-source library for Daml, Canton’s smart-contract language, to handle bytes, verify signatures and check external data. I will build it for Canton application developers, starting with my own project, Tirai. I need it because Daml lacks a byte array type and teams must write the operations needed to verify external data themselves. I request 300,000 CC across three milestones of three weeks each, nine weeks total.

## The gap

A Canton application acting on external data must either verify its signature or trust an intermediary to report it. That data might be an oracle price, an issuer’s credential, a custodian’s reserve attestation, another chain’s block or a document signed by a counterparty’s system.

Today most integrations take the intermediary route. The interoperability providers connected to Canton become observer parties, parties given visibility into contracts on the ledger. They read data through their own participant node and sign an assertion about it. The destination consumes no Canton signature or state proof.

```text
Route A: used today
External system signs data
  -> Intermediary reads data and asserts it to the ledger
  -> Application trusts the intermediary

Route B: enabled by this library
External system signs data
  -> Application verifies the signature inside a choice
     No intermediary
```

I enable Route B so an application can verify signed external data inside a choice without an intermediary.

Daml has no byte array type. Bytes from other systems are handled as hex-encoded `Text`, with two hexadecimal characters per byte. Three helpers are available: `packHexBytes`, `byteCount` and `isBytes32Hex`. Each team writes the remaining operations itself. Verifying external data requires those operations before the application can reconstruct a signed message or hash it. They are also needed to check that a record belongs to a dataset identified by a root hash.

## Why this does not already exist

The crypto builtins in `DA.Crypto.Text` became stable only in Daml-LF 2.3 / Canton 3.5. Daml-LF is the intermediate language that Daml compiles to. Before that, the builtins were alpha. Canton applications have historically been closed-world contracts between parties who already know each other. External data was not the problem those applications were solving. The interoperability providers that needed external connections became observer parties instead. That approach needs no byte-level work.

## What I measured

Over the last week, I measured builtin behaviour and byte-processing costs. The builtins work inside a choice body, the code executed by a contract action. The documentation never states this, and every published example runs in a Daml Script.

Malformed and incorrect signatures behave differently. A malformed DER signature aborts the transaction. DER is a binary encoding format. `secp256k1WithEcdsaOnly` raises “Malformed signature ... error decoding signature bytes”. A well-formed but incorrect signature returns `False`. An application requiring a minimum number of signatures therefore behaves unexpectedly on its first malformed input.

The two secp256k1 signature-verification functions are not interchangeable. `secp256k1` re-hashes its message with SHA-256 before verification. It cannot verify a signature over a keccak digest, a hash produced by the function Ethereum uses. Ethereum-style integrations need `secp256k1WithEcdsaOnly`.

Daml-LF also forbids local recursion: “Local variables defined recursively, recursion can only happen at the top level.” Every loop over bytes must be a top-level function.

The script service enforces a 60 second evaluation ceiling. Byte-level work reaches it easily in tests. Whether an equivalent bound applies to a participant executing a choice in production is undocumented. I will include that unresolved distinction in the usability-gap report.

| Operation | Input | Measured cost |
|---|---|---:|
| `secp256k1WithEcdsaOnly` | Signature verification | 1.64 ms |
| `keccak256` | 32 bytes | 0.246 ms |
| `keccak256` | Approximately 600 bytes | 3.45 ms |
| Ethereum block header encoding in Daml using RLP, Ethereum’s format for nested byte lists | Block header | 2.41 ms |

Hash cost scales with input length. The 32-byte measurement understates the measured cost of the larger payload by more than an order of magnitude.

Daml Script has no wall clock, so I measured cost by slope. I placed several scripts in one module so compilation cancels. I used equal transaction counts so ledger overhead cancels. The difference is the work performed. I rotated script order between rounds. A fixed order had produced an impossible result: a script doing strictly more work finished faster. I will publish the measurement scripts and method with the library.

## What the library provides

The library has four parts:

```text
+-------------------------------------------------------+
| Canton application                                    |
| oracle consumer, bridge, credential check             |
+-------------------------------------------------------+
| This library                                          |
| bytes | cryptography wrappers | structured data       |
| documentation and vectors                             |
+-------------------------------------------------------+
| DA.Crypto.Text builtins                               |
| keccak256 | sha256 | secp256k1 family                 |
+-------------------------------------------------------+
| Canton / Daml-LF                                      |
+-------------------------------------------------------+
```

I place the library above the builtins without replacing or reimplementing them.

1. Bytes: length, slicing, concatenation, comparison, padding, integer conversion with explicit endianness (byte order) and validation. I will implement these over hex-encoded `Text`. Call sites will use the library interface so a future native bytes implementation can replace the representation without changing those calls.
2. Cryptography: documented wrappers over `DA.Crypto.Text`. I will specify which function accepts which digest convention, malformed-input behaviour and measured cost. A threshold-counting helper will prevent one valid signature submitted several times from satisfying a threshold. I made that mistake myself, and it was caught in review. Tests will cover repeated signatures and repeated signers.
3. Structured data: RLP encoding and decoding, binary Merkle proof verification and Ethereum Patricia trie proof verification. Merkle proofs link a record to a tree’s root hash. Patricia trie proofs do this for Ethereum’s key-value trees.
4. Supporting material: documentation, external test vectors (inputs with known expected results), a worked reference example and a usability-gap report for the Daml team.

I will document validation at the wrapper boundary separately from builtin failures. A wrapper must not imply that all invalid signatures return `False` when a malformed encoding can abort execution.

## Evidence

My Ethereum RLP encoder passes all 28 official vectors in `ethereum/tests`, at `RLPTests/rlptest.json`. I mutation-checked the tests: changing one expected byte makes the test fail.

Signature verification passes eight of eight assertions against Project Wycheproof vectors from `C2SP/wycheproof`, using `ecdsa_secp256k1_sha256_test.json`. Those assertions execute inside a choice body. My `keccak256` output also matches Foundry’s `cast keccak` byte for byte.

I use external vectors because tests generated from my own output cannot catch a convention I get wrong on both sides. This code is currently in a private repository. I will publish it under Apache-2.0 in Milestone 1. Access is available to the Foundation sooner on request.

## Assurance

I provide assurance through test vectors from external authorities rather than my own output, mutation-checked tests so a pass is not vacuous, and negative cases that must be rejected. I do not implement cryptography in this library: secp256k1 and keccak256 are Canton’s own builtins. I add encoding, decoding and verification logic above them, where realistic failures are parsing and logic bugs rather than broken primitives, making differential testing against reference vectors the effective control for this work. I had two defects in a related design found by adversarial review before they shipped: one counted valid signatures instead of distinct signers; the other accepted a signature that the reference implementation rejects. I include both as test cases in this proposal’s acceptance criteria: repeated valid signatures must not substitute for distinct signers, and the signature rejected by the reference implementation must be rejected. I provide no external audit or third-party review of this library; an adopter putting value at risk should do its own review.

## Architectural alignment

Item 16 explicitly names native bytes type support. I will supply a library over the current representation, with an interface designed to accommodate a future native type. The proposal also fits Item 19, which has no prior grant examples. Foundation DevRel, its developer relations team, has compiled wanted use cases for that item. DevRel suggested this RFP area and offered to consider championing after review.

The library requires no protocol change. Every function is pure and operates only on data the calling contract already holds. The privacy model remains unchanged. I will use stable programming interfaces (APIs) only. The byte operations, cryptographic wrappers and proof functions will be reusable independently of Tirai and independently of the reference application.

## Milestones

I propose three milestones:

1. Milestone 1: bytes, cryptographic wrappers and publication. Duration: three weeks. Funding: 100,000 CC.

   I will publish the existing code and evidence under Apache-2.0. I will complete the byte interface, cryptographic wrappers and threshold helper. I will package the initial DPM component and document digest selection, validation and transaction-abort behaviour.

   Acceptance requires installation and execution of the examples from a clean environment. Tests must cover byte boundaries, explicit endianness and malformed hex input. The existing 28 RLP vectors and eight signature assertions must pass. Changing an expected RLP byte must fail its test. Choice-body tests must demonstrate both a malformed signature abort and a well-formed incorrect signature returning `False`. Repeating one valid signature must not satisfy a threshold requiring distinct signers.

2. Milestone 2: structured data and reproducible measurements. Duration: three weeks. Funding: 100,000 CC.

   I will complete RLP decoding and verification for binary Merkle trees and Ethereum Patricia tries. I will publish external fixtures, benchmark scripts and instructions for reproducing the measurements.

   Acceptance requires RLP encoding to continue passing the official vectors. Decoding must recover the expected structures from external fixtures. Proof tests must accept valid inclusion fixtures and reject fixtures with an altered record, proof or root. Hash outputs must match the external expected values. The benchmark scripts must run with equal transaction counts and rotated execution order. They must cover both measured hash input sizes.

3. Milestone 3: reference example, documentation and usability report. Duration: three weeks. Funding: 100,000 CC.

   I will build a worked example that verifies an external chain’s block header in Daml. I will reconstruct the precise serialisation, its byte encoding, and hash it. I will verify signatures against that hash with threshold counting and check that a record is included under a root. This flow exercises every part of the library.

   Acceptance requires the packaged example to run from a clean environment. Its tests must accept a valid fixture and reject altered serialisation, insufficient distinct signers and an invalid inclusion proof. Documentation must identify the stable APIs used and reproduce the observed malformed-signature behaviour. The published usability report must include the recursion restriction, byte representation gap, script evaluation ceiling and unresolved production execution bound.

## Adoption and success measures

My committed consumer today is one project: my own. Tirai needs this library to verify a permissioned EVM chain’s blocks inside Daml. That chain restricts participation and uses Ethereum-compatible execution.

Adjacent demand appears in the Foundation’s proposal pipeline. The DIA Canton Multi-Oracle Aggregator proposal would need byte-level signature and hash handling. So would the Primus Labs and HashCloak proposal for Groth16 and UltraHonk proof verifiers in Daml for zkTLS, which authenticates web data through cryptographic proofs. They are not committed users of this library.

I will measure success through a DPM component that installs cleanly, examples that execute from that installation and published external vectors that allow anyone to detect breakage. I will also target adoption by at least one project other than Tirai within the grant period. I will report whether that adoption occurred separately from completion of the library tests.

## Funding

I request 300,000 CC across three milestones of 100,000 CC each. Each milestone lasts three weeks, for nine weeks total.

No maximum is published for this RFP area. I benchmarked the figure against a comparable funded proposal in the same area with the same three-milestone, nine-week structure and welcome the Foundation’s correction if it is out of line.

## Maintenance

During the grant period, I will maintain the package, address defects found against its documented behaviour and update its tests with fixes. Tirai’s planned use gives me an ongoing reason to maintain it. I am not proposing a separately funded maintenance term here. The library will use Apache-2.0, matching Canton’s own licence. Tirai’s protocol, circuit and prover are outside this proposal and remain proprietary.

## About the applicant

I am Gopi Kannappan, Tirai’s sole engineer. Tirai is a shielded asset protocol deployed and running on testnets across Ethereum, Arbitrum and Solana. Its Arbitrum One mainnet pool is currently paused pending a redeploy. A Daml verifier of the same proof has run on a Canton ledger. I maintain implementations of one proof format across native Rust, EVM Solidity, Solana and Daml.

I need this groundwork for Tirai and will build it either way. I am requesting support to build and document it once in the open.