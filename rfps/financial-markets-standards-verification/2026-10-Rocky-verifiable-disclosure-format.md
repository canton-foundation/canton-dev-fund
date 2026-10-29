## Development Fund Proposal

**Organization:** Rocky (rocky.exchange)
**Author / Primary Contact:** Rocky team, GitHub [@jsjswjnsn-gif](https://github.com/jsjswjnsn-gif)
**Status:** Submitted
**Created:** 2026-10-29
**Proposal Type:** RFP-aligned
**RFP / Roadmap Area:** Financial Markets, Standards & Verification. RFP 11 "Public verifiability", first approach: "standardized tooling for asset issuers ... to publish public aggregates of activity and value"
**Champion:** `Needs Champion`
**Total Funding Request:** 560,000 CC
**Project Duration:** 6 months
**Label:** regulatory-compliance

---

## Abstract

RFP 11 notes that "an aggregate value published by an issuer might not be trusted by the market, and private transaction disclosure defeats confidentiality." CIP-0056 states the same problem for token supply: a registry may report total supply, but this "does not allow independent verification", because holdings are private.

This proposal funds an open wire format for that gap. The issuer publishes an aggregate (total supply, total liabilities, collateral against exposure) as the root of a Merkle sum tree, in which every node hashes its children's subtotals. Each holder receives a short proof and checks in their own browser that they are counted, at their amount, inside the published total. No names or account identifiers are published.

The format, a 61-case conformance corpus, three implementations, a verification CLI, an offline single-file verifier and a Daml anchoring package already exist under Apache-2.0 at https://github.com/Rocky-DEX/Canton-Assurance-Layer, and Rocky uses the liabilities profile for its own solvency reports. The grant funds a CIP-0056 integration that makes total supply verifiable for token-standard instruments, a second independent implementation, an external security review, a CIP submission, and adoption by organisations other than Rocky.

---

## Specification

### 1. Objective

Single objective: **an aggregate published by a Canton issuer or venue can be checked by a third party that runs none of the publisher's software, without the underlying positions being published.**

CIP-0056 defines total supply as the sum of `amount` over all active `Holding` contracts with a matching `instrumentId`, and lets registries report it off-ledger. Today the market has to take that figure on trust. The same holds for an exchange's liabilities, a custodian's client claims, a repo book's exposure and a fund's units outstanding.

Outcome after six months: a CIP-0056 issuer can publish a total supply that each of its holders can verify; an implementation written outside Rocky passes the conformance corpus; the cryptographic core has had an external review with findings published; the format is submitted as a CIP; and at least three organisations other than Rocky use it.

Not in scope: the TEE and zero-knowledge approaches of RFP 11, further RWA profiles (RFP 12.2), and the hosted disclosure console (RFP 27). Any of these would be a separate proposal.

### 2. Implementation Mechanics

**Commitment.** The publisher snapshots its books at a named ledger offset and builds a Merkle sum tree. A leaf is one holder's per-asset amounts plus a salt. A node hashes its children together with their per-asset subtotals, so the root commits to membership and totals at once; a correct root published next to an understated total fails verification. Amounts use 18-decimal fixed point with overflow-checked addition, which represents every Daml `Decimal` (10 decimal places) exactly up to about 3.4 × 10^20 units. Negative balances are clamped to zero and disclosed as a separate figure, so they cannot offset other holders. An odd node is promoted, not duplicated, so no subtree is counted twice. Salts are `HMAC-SHA256(per-snapshot master salt, user_id)`, so a holder's leaf cannot be linked across snapshots.

**What a proof reveals.** A proof is about log₂(n) steps (17 for 100,000 holders), each a hash plus subtotals. The sibling at the lowest level is another single holder, so a proof reveals that holder's balances without any identifier. SPEC §7 and `docs/SECURITY-ANALYSIS.md` document this and the mitigations (random leaf order, per-snapshot salts). It is in scope for the external review in Milestone 3.

**Documents.** A report (root, totals, snapshot time, ledger offset, publisher, disclosure manifest) is signed with Ed25519 over a length-prefixed, domain-separated digest. Each proof names its report digest, so it cannot be replayed against a later report. The verifier takes the publisher's key as a required input and never trusts a key embedded in the document.

**Assurance levels.** A report may carry a statement declaring, per field, what stands behind it: `cryptographically-verified`, `ledger-derived`, `third-party-attested`, `issuer-attested`, `claimed-only` or `not-disclosed`. The verifier checks each declaration and fails, naming the field, if it cannot support it. `ledger-derived` requires both an on-ledger anchor and a signed provenance graph (SPEC §16–17). This stops a signed assertion from being presented as a proof.

**Anchoring.** The Daml template `ReportAnchor` (package `canton-solvency-anchor`) records one contract per report holding digests and the offset, never amounts, each linked to its predecessor. A missing day, a fork, a rewound offset or an edited past report breaks the chain. The anchor gives tamper-evidence to parties who can see it; holders verify their own proofs off-ledger.

**Verification tools.** `canton-solvency-verify` verifies single proofs, directories, group chains, coverage statements and anchor chains; `manifest-diff` fails a CI job when a publisher discloses less than last time; `recompute` lets an auditor holding the full leaf set rebuild the root. `offline/verifier.html` is one file with no network calls and labels every figure either "recomputed here" or "publisher says". On one core of an Apple M4 Pro, publishing 1,000,000 leaves with all proofs took 7.3 s and verifying one proof about 0.05 ms (single runs, roughly ±20 %).

**New work: CIP-0056 integration.** `canton-reserve-attest` reads holdings today by template filter. It has been run read-only against a MainNet participant, reading four custody positions at one offset into a signed report (self-reported; the report is not public). Milestone 2 adds:
- an interface filter for the CIP-0056 `Holding` interface (`splice-api-token-holding-v1`, and `-v2` where an issuer exposes it), read at one pinned offset;
- a `token.supply` profile whose leaves are keyed by holder party and `instrumentId` and whose root totals are the CIP-0056 total supply, with corpus cases and golden vectors in all three implementations;
- a guide for registry operators, so the signed report and root can be served next to the supply figure the registry already reports.

The issuer's participant must see all holdings of the instrument, which is the same condition CIP-0056 states for computing total supply.

**Data and privacy.** Inputs are node-local: the publisher's own active contracts and its own books. Nothing depends on mediator metadata or on protocol messages staying publicly observable. Published data is the root, the totals and the manifest.

**Known limit.** An inclusion proof shows a holder is counted. It does not show that the tree contains only real holders, or that off-ledger assets exist. The assurance levels make this visible rather than hiding it. Closing the completeness gap needs the TEE or ZK approaches, which are not part of this proposal.

### 3. Architectural Alignment

- **CIP-0056:** makes the standard's optional total-supply figure checkable by holders, without changing the standard or any holding contract.
- **Canton's existing pattern:** participants already compare hash commitments over shared state instead of exchanging the state; this applies the same idea between an issuer and its holders.
- **RFP 11, first approach:** standardized tooling for any issuer, including decentralized issuers. The format has no privileged operator; anyone with the publisher's key can verify.
- **Other RFP 11 approaches:** a TEE or ZK prover could publish its result in this format and raise the assurance level of the same figure.
- **Governance references:** CIP-0056, CIP-0082, CIP-0100.

### 4. Backward Compatibility

No backward compatibility impact on Canton, Splice or existing contracts. The work only reads through the Ledger API.

Inside the format, wire identifiers keep the names they were first published under (`canton-solvency-report-v1` and related). Renaming them would invalidate documents already signed. Any change to the commitment rule ships as a new domain string with new corpus cases.

---

## Milestones and Deliverables

### Milestone 1: Format, conformance corpus and verifiers (existing work)
- **Estimated Delivery:** available at submission
- **Focus:** specification v1.2 frozen against the corpus; 61 conformance cases; Rust producer and verifier, TypeScript browser verifier, and a dependency-free Python verifier written from the specification text; CLI; offline verifier; JSON Schemas; Daml anchor package; compatibility statements in `statements/`.
- **Deliverables / Value Metrics:** reviewers reproduce all 61 cases from a clean clone with `python3 spec-audit/verify_from_spec.py`. The Python verifier, written from the text alone, found two defects the first two implementations had missed: the TypeScript verifier ordered map keys by UTF-16 code units instead of UTF-8 bytes (fixed and pinned by a corpus case), and one case was passing for the wrong reason (fixed by having cases declare their `requires`).

### Milestone 2: Verifiable total supply for CIP-0056 tokens
- **Estimated Delivery:** 8 weeks after acceptance
- **Focus:** `Holding` interface reader, `token.supply` profile, corpus cases and golden vectors, asset and liability reads bound to one offset, LocalNet end-to-end demo with seeded holdings, registry operator guide.
- **Deliverables / Value Metrics:** at least one CIP-0056 issuer or registry operator other than Rocky publishes a supply report from its own participant and confirms it in writing on this PR.

### Milestone 3: Independent implementation and external security review
- **Estimated Delivery:** 8 weeks after Milestone 2
- **Focus:** support a second implementer using `docs/INTEGRATORS.md`; their compatibility statement is checked in CI by the same test that compares our three. External review of the commitment core, salt derivation, sibling disclosure and verifiers, scoped in `docs/SECURITY-REVIEW-BRIEF.md`.
- **Deliverables / Value Metrics:** an implementation by an organisation other than Rocky passes the corpus for the features it declares, with its statement in `statements/`; review report and remediations published in the repository. The reviewer's fee comes from this milestone. Rocky does not pay the second implementer.

### Milestone 4: Release, CIP submission and adoption
- **Estimated Delivery:** 8 weeks after Milestone 3
- **Focus:** crates.io and npm releases and prebuilt binaries; CIP submitted with the corpus as its normative tests (draft in `docs/cip/`); documentation in the Foundation's format; maintenance plan with a named owner.
- **Deliverables / Value Metrics:** at least three organisations other than Rocky confirm use in writing. Target profile: an issuer or venue publishing reports, an auditor or data provider running the verifier, and a wallet or portal offering the offline verifier to its users. CIP submitted and review comments answered.

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone
- Demonstrated functionality or operational readiness
- Documentation and knowledge transfer provided
- Alignment with stated value metrics

Project-specific conditions:

- Milestone 1: the committee or a reviewer it names reproduces the conformance run.
- Milestone 2: a supply report from a participant not operated by Rocky, which a holder of that token can verify with the offline verifier.
- Milestone 3: a non-Rocky implementation passing the corpus; the external review report public.
- Milestone 4: written confirmation of use from at least three organisations other than Rocky. Acceptance of the CIP is a governance decision; the deliverable is a submitted and maintained proposal.

---

## Funding

**Total Funding Request:** 560,000 CC

### Payment Breakdown by Milestone
- Milestone 1 _(Format, corpus and verifiers)_: 100,000 CC upon committee acceptance of the reproduced conformance run
- Milestone 2 _(Verifiable total supply for CIP-0056 tokens)_: 140,000 CC upon committee acceptance of the external-issuer criterion
- Milestone 3 _(Independent implementation and external security review)_: 160,000 CC upon committee acceptance, including the reviewer's fee
- Milestone 4 _(Release, CIP submission and adoption)_: 160,000 CC upon final release and acceptance of the adoption criterion

Milestones 2 to 4, which depend on organisations outside Rocky, account for 460,000 CC (82 %). Milestone 1 pays for existing work and is open to the committee's view; we are willing to reduce or remove it.

### Volatility Stipulation
Project duration is **6 months**. Should the project timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility.

---

## Co-Marketing
Upon release, the implementing entity will collaborate with the Foundation on:

- Announcement coordination
- Technical blog: verifying a Canton token's total supply without publishing balances
- A walkthrough for registry operators and a demo at the relevant SIG meeting

---

## Motivation

Tokenized funds, Treasuries, deposit tokens and stablecoins are now issued natively on Canton. Each comes with a figure the market needs to trust, such as supply, backing or liabilities, and nobody outside the issuer can recompute it. The usual substitutes are a periodic auditor's letter or an announcement. Neither lets a holder check that they are included.

Who benefits: CIP-0056 issuers and registries that want their supply figure to be checkable; exchanges and custodians that owe clients a solvency figure; auditors and data providers who would otherwise need a separate check per publisher; wallets that want to show holders an in-browser check.

Expected adoption is modest and stated as such: the Milestone 2 to 4 targets are one external issuer, one external implementer and three external users within six months. Rocky is the only production user today. Every token-standard instrument uses the same `Holding` interface, so after Milestone 2 an issuer can publish a supply report by running a read-only job beside its own participant, with no per-issuer development by us.

---

## Rationale

**Why a format rather than a service.** Publishers, verifiers and wallets are different organisations. A frozen byte-level format with conformance cases lets them interoperate, and when two implementations disagree it shows the exact case. A CIP needs the same thing.

**Related RFP 11 proposals.**
- *Contract-agnostic Merkle attestation sidecar (o1Labs, #577).* Configurable Merkle trees over a participant's active contracts, with a proof-of-reserves example over a CIP-56 holding template, non-membership proofs, and a Canton↔EVM bridge. Its tree constructions (OpenZeppelin-compatible binary tree, sparse Merkle tree) do not carry subtotals in the node hash, so a root shows which contracts are included but does not commit to their total. This proposal is about committing to the total, together with a signed document format, assurance levels and a conformance corpus. A sum-tree construction in this format could be offered as one of the sidecar's tree options; we would welcome working with o1Labs on that.
- *ZK supply-cap prover (Ligero, #517).* Proves in zero knowledge that supply is below a cap. This proposal publishes exact totals and gives each holder an inclusion check; the two answer different questions and can apply to the same instrument.
- *Structural reserve attestation (#759).* Enforces solvency inside new custody contracts the custodian adopts. This format works over an existing ledger snapshot with no contract changes, and such a contract could publish this format's root.

**Why extend rather than replace.** The work reads existing CIP-0056 `Holding` contracts through the Ledger API and changes neither the standard nor any contract.

**Alternatives considered.** Publishing positions defeats confidentiality. An auditor's signed figure alone cannot be checked by holders. Ethereum proof-of-reserves designs assume public reserves, a global block height and integer amounts, none of which hold on Canton.
