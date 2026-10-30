## Development Fund Proposal

**Organization:** Rocky (rocky.exchange)
**Author / Primary Contact:** Rocky team, GitHub [@jsjswjnsn-gif](https://github.com/jsjswjnsn-gif)
**Status:** Submitted
**Created:** 2026-10-29
**Proposal Type:** RFP-aligned
**RFP / Roadmap Area:** Financial Markets, Standards & Verification. RFP 11 "Public verifiability", first approach: "standardized tooling for asset issuers ... to publish public aggregates of activity and value"
**Champion:** `Needs Champion`
**Total Funding Request:** 3,000,000 CC
**Project Duration:** 6 months of delivery and adoption, followed by 24 months of maintenance
**Label:** regulatory-compliance

---

## Abstract

RFP 11 notes that "an aggregate value published by an issuer might not be trusted by the market, and private transaction disclosure defeats confidentiality." CIP-0056 states the same problem for token supply: a registry may report total supply, but this "does not allow independent verification", because holdings are private.

This proposal funds an open wire format for that gap. The issuer publishes an aggregate (total supply, total liabilities, collateral against exposure) as the root of a Merkle sum tree, in which every node hashes its children's subtotals. Each holder receives a short proof and checks in their own browser that they are counted, at their amount, inside the published total. No names or account identifiers are published.

The format, a 61-case conformance corpus, three implementations, a verification CLI, an offline single-file verifier and a Daml anchoring package already exist under Apache-2.0 at https://github.com/Rocky-DEX/Canton-Assurance-Layer, and Rocky uses the liabilities profile for its own solvency reports. The grant funds a CIP-0056 integration that makes total supply verifiable for token-standard instruments, a second independent implementation, an external security review, a public open-source verification portal, a CIP submission, adoption by organisations other than Rocky, and two years of maintenance across Canton and Splice releases.

---

## Specification

### 1. Objective

Single objective: **an aggregate published by a Canton issuer or venue can be checked by a third party that runs none of the publisher's software, without the underlying positions being published.**

CIP-0056 defines total supply as the sum of `amount` over all active `Holding` contracts with a matching `instrumentId`, and lets registries report it off-ledger. Today the market has to take that figure on trust. The same holds for an exchange's liabilities, a custodian's client claims, a repo book's exposure and a fund's units outstanding.

Outcome after six months: CIP-0056 issuers can publish a total supply that each of their holders can verify; an implementation written outside Rocky passes the conformance corpus; the cryptographic core has had an external review with findings published; anyone can see every published report and its verification result on a public portal that recomputes in their own browser; the format is submitted as a CIP; and at least five organisations other than Rocky use it. The following two years keep it working across Canton and Splice releases, with a published plan for what happens after.

Not in scope: the TEE and zero-knowledge approaches of RFP 11, further RWA profiles (RFP 12.2), and the publisher-side disclosure console (RFP 27). Any of these would be a separate proposal. The portal in Milestone 4 is a read-only verifier for the public, not a publishing tool.

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

**Known limit.** An inclusion proof shows a holder is counted. It does not show that the tree contains only real holders, or that off-ledger assets exist. The assurance levels make this visible rather than hiding it. Closing the completeness gap needs the TEE or ZK approaches, which are not part of this proposal. For supply caps, Ligero's prover (#517, which passed its committee vote on 2026-10-28) addresses completeness by anchoring to the mediator verdict stream and counter-signed ACS commitments; this proposal builds no completeness mechanism of its own and is designed to sit beside that work (see Rationale).

### 3. Architectural Alignment

- **CIP-0056:** makes the standard's optional total-supply figure checkable by holders, without changing the standard or any holding contract.
- **Canton's existing pattern:** participants already compare hash commitments over shared state instead of exchanging the state; this applies the same idea between an issuer and its holders.
- **RFP 11, first approach:** standardized tooling for any issuer, including decentralized issuers. The format has no privileged operator; anyone with the publisher's key can verify.
- **Other RFP 11 approaches:** a TEE or ZK prover, such as #517's supply-cap proof, can stand behind the same figure; this format records what each figure rests on, so the two strengthen each other rather than compete.
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

### Milestone 2: Verifiable total supply for CIP-0056 tokens (restricted pilot)
- **Estimated Delivery:** 8 weeks after acceptance
- **Focus:** `Holding` interface reader for `splice-api-token-holding-v1` and `-v2`; a `token.supply` profile and a `token-supply-v1` corpus feature with cases and golden vectors in all three implementations; asset and liability reads bound to one offset; a pilot label shown by the verifiers and the portal; staged validation on LocalNet, DevNet and MainNet; registry operator guide.
- **Deliverables / Value Metrics:** at least two CIP-0056 issuers or registry operators other than Rocky publish supply reports from their own participants under the pilot terms below, and confirm it in writing on this PR.
- **Pilot terms (before the external review in Milestone 3):** DevNet first; MainNet only for issuers who opt in in writing. The tool is read-only and never signs, submits or holds keys; the only ledger write is the publisher's own anchor contract. Every pilot report is labelled "pilot, pre-review" by the verifiers and the portal, and pilot publishers agree not to present pilot reports as audited evidence to customers or regulators. A publisher can stop at any time by not publishing. If the review in Milestone 3 finds a Critical or High issue, Rocky notifies every pilot publisher within 2 business days with the affected reports and a recommended action. Unrestricted production use is supported only after Milestone 3 is accepted.

### Milestone 3: Independent implementation and external security review
- **Estimated Delivery:** 8 weeks after Milestone 2
- **Focus:** support a second implementer using `docs/INTEGRATORS.md`; external review of the commitment core, salt derivation, sibling disclosure, the `token.supply` profile and the verifiers, scoped in `docs/SECURITY-REVIEW-BRIEF.md`, followed by a re-review of the remediations. The reviewer is an organisation independent of Rocky, named in the report.
- **Deliverables / Value Metrics:** see the Milestone 3 acceptance conditions below. Rocky does not pay the second implementer, so its participation is evidence of demand.

### Milestone 4: Public verification portal
- **Estimated Delivery:** 4 weeks after Milestone 3
- **Focus:** an open-source, self-hostable, read-only page that lists published supply and solvency reports for Canton instruments and venues, fetches each report and its anchor chain, and verifies them in the visitor's browser with the same modules as the offline verifier. It shows each figure's assurance level, the snapshot offset and time, and any break in a publisher's report history. Registries can link to it from the off-ledger metadata they already serve. It holds no keys and publishes nothing.
- **Deliverables / Value Metrics:** the portal lists reports from at least two publishers other than Rocky; at least one wallet, explorer or data provider links to or embeds it for its users and confirms this in writing.

### Milestone 5: Release, CIP submission and adoption
- **Estimated Delivery:** 6 weeks after Milestone 4
- **Focus:** crates.io and npm releases with reproducible builds (pinned toolchains, published checksums, a documented rebuild procedure); CIP submitted with the corpus as its normative tests (draft in `docs/cip/`); documentation in the Foundation's format; maintenance plan naming two maintainers.
- **Deliverables / Value Metrics:** at least five organisations other than Rocky confirm use in writing. Target profile: issuers or venues publishing reports, an auditor or data provider running the verifier, and a wallet or portal offering verification to its users. CIP submitted and review comments answered.

### Milestone 6: Maintenance
- **Duration:** 24 months after Milestone 5 acceptance
- **Focus:** compatibility with each Canton and Splice release (Ledger API, `Holding` interface versions); corpus and golden vectors kept current; triage of external issues and of disagreements between implementations; security fixes and advisories; CIP review responses; portal hosting and operation.
- **Deliverables / Value Metrics:** a quarterly report to the committee listing releases supported, issues and advisories handled, new publishers and verifiers, and portal usage. Each accepted quarterly report releases one base installment. The continuity commitments below apply throughout.
- **Adoption tranches (paid only if met within the 24 months):** an independent publisher is an organisation other than Rocky, not paid from this grant, publishing reports at least monthly for three consecutive months, verifiable on the portal.
  - Tranche A: at least 5 independent publishers
  - Tranche B: at least 10 independent publishers
  - Tranche C: at least 15 independent publishers, including at least 3 CIP-0056 issuers
- Base maintenance continues for the full 24 months whether or not the tranches are met.

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone
- Demonstrated functionality or operational readiness
- Documentation and knowledge transfer provided
- Alignment with stated value metrics

Project-specific conditions:

- **Milestone 1:** the committee or a reviewer it names reproduces the conformance run.
- **Milestone 2:** supply reports from at least two participants not operated by Rocky, verifiable by holders of those tokens with the offline verifier, published under the pilot terms.
- **Milestone 3, independent implementation:** written by an organisation other than Rocky, and its compatibility statement declares and passes, with no skipped case, at least the core feature set: `report-v1`, `report-v2`, `proof-v1`, `proof-v2`, `leaf-v2`, `manifest`, `assurance-v1`, `anchor-v1`, `provenance-v1` and the new `token-supply-v1`. `coverage-v1`, `group-v1` and `pack-v1` are optional.
- **Milestone 3, interoperability in both directions:** (a) reports produced by the second implementation, including at least one `token.supply` report from a real participant, sit in `interop/` and verify under Rocky's verifiers in CI; (b) the second implementation verifies the corpus and at least one current Rocky production report, recorded in its statement in `statements/`. Any disagreement is recorded at the named case and resolved, by a specification fix with a new case or by a fix in one implementation, before acceptance.
- **Milestone 3, security review:** the review report, the remediations and the re-review are published in the repository. Acceptance requires that no Critical or High finding is open: each is fixed and confirmed fixed in the re-review. Medium findings are fixed, or documented with their mitigation and a dated plan. Any finding left open is listed as accepted residual risk in `SECURITY.md`; Rocky, as maintainer, accepts it in writing, and the committee may require a fix before acceptance. Low and informational findings are tracked as issues.
- **Milestone 4:** the portal verifying reports from at least two non-Rocky publishers, and written confirmation from at least one wallet, explorer or data provider that links to or embeds it.
- **Milestone 5:** written confirmation of use from at least five organisations other than Rocky; a third party rebuilds a release and matches its published checksums. Acceptance of the CIP is a governance decision; the deliverable is a submitted and maintained proposal.
- **Milestone 6:** eight accepted quarterly maintenance reports for the base installments; for each adoption tranche, the publishers listed on the portal with their report history, and a written confirmation from each.

---

## Funding

**Total Funding Request:** 3,000,000 CC

### Payment Breakdown by Milestone
- Milestone 1 _(Format, corpus and verifiers)_: 100,000 CC upon committee acceptance of the reproduced conformance run
- Milestone 2 _(Verifiable total supply for CIP-0056 tokens)_: 550,000 CC upon committee acceptance of the external-issuer criterion
- Milestone 3 _(Independent implementation and external security review)_: 650,000 CC upon committee acceptance, including the reviewer's fees
- Milestone 4 _(Public verification portal)_: 350,000 CC upon committee acceptance of the publisher and integration criteria
- Milestone 5 _(Release, CIP submission and adoption)_: 350,000 CC upon final release and acceptance of the adoption criterion
- Milestone 6 _(Maintenance, 24 months)_: up to 1,000,000 CC
  - Base: 600,000 CC, paid as eight quarterly installments of 75,000 CC upon acceptance of each quarterly report
  - Tranche A: 100,000 CC upon acceptance of the 5-publisher criterion
  - Tranche B: 150,000 CC upon acceptance of the 10-publisher criterion
  - Tranche C: 150,000 CC upon acceptance of the 15-publisher criterion

Milestones 2 to 5 and the Milestone 6 adoption tranches, which depend on organisations outside Rocky, account for 2,300,000 CC (77 %). Milestone 1 pays for existing work and is open to the committee's view; we are willing to reduce or remove it.

**Organisations paid from this grant:** Rocky, as implementer, and the external security reviewer, named on this PR before Milestone 3 starts. Neither counts as an independent reviewer, implementer, publisher or adopter for any acceptance criterion, and no adoption count includes an organisation paid from this grant. Canton Coin is not counted as an instrument for any adoption criterion.

### Cost basis

Engineering is costed at a blended rate of 25,000 CC per engineer-week, covering salary, overhead and test infrastructure.

| Milestone | Engineering effort | Other costs | Total (CC) |
| :---- | :---- | :---- | ----: |
| M1 | Existing work, not costed by effort | — | 100,000 |
| M2 | 20 engineer-weeks: interface reader, profile and vectors in three implementations, staged network validation, support for two issuers (500,000) | Validator traffic and test participants on DevNet and MainNet (50,000) | 550,000 |
| M3 | 12 engineer-weeks: second-implementer support, interoperability CI, remediation work (300,000) | External security review and re-review (350,000, budget) | 650,000 |
| M4 | 12 engineer-weeks: portal build, accessibility, registry integration (300,000) | Hosting during delivery (50,000) | 350,000 |
| M5 | 14 engineer-weeks: reproducible releases, CIP drafting and review, documentation, adopter onboarding (350,000) | — | 350,000 |
| M6 base | 22 engineer-weeks over 24 months: release compatibility, triage, security fixes, CIP follow-up (550,000) | Portal hosting for 24 months (50,000) | 600,000 |
| M6 tranches | 14 engineer-weeks: onboarding new publishers, portal scaling (350,000), paid only if adoption is met | Additional hosting as usage grows (50,000) | 400,000 |

The security review figure is a budget, not a quote. Before Milestone 3 starts we will post the reviewer's written quote for the review and re-review on this PR; if the quote is lower, the Milestone 3 payment is reduced by the difference, and if it is higher, Rocky covers the excess.

### Continuity and exit

- **During the grant:** two named maintainers with commit rights, so no single person blocks a release or a security fix.
- **Before maintenance ends:** at least 6 months before the end of Milestone 6, Rocky publishes on this PR and in the repository what happens next: continued maintenance at Rocky's own cost, a new proposal, or a handover. We do not assume the Foundation will fund or maintain the work after the grant.
- **If Rocky stops maintaining it, at any time:** at least 90 days' notice on this PR, in the repository and on the Canton forum; a handover document covering architecture, release procedure, open issues and security contacts; reproducible builds so a new maintainer can produce identical releases; and, for any maintainer the community accepts, transfer of the repository and a redirect from the portal's address. The portal is open source and self-hostable, and every report stays verifiable offline with the single-file verifier, so published evidence remains checkable even if the portal goes away.

### Volatility Stipulation
Delivery and adoption take 6 months, followed by 24 months of maintenance. The grant is denominated in fixed Canton Coin and will be re-evaluated at the 6-month mark and at the start of each maintenance year, including the unpaid maintenance installments. Should delivery extend beyond 6 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility.

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

Adoption targets are stated as minimums the committee can check: two external issuers, one external implementer, one wallet, explorer or data provider integrating the portal, and five external users within six months. Rocky is the only production user today. Every token-standard instrument uses the same `Holding` interface, so after Milestone 2 an issuer can publish a supply report by running a read-only job beside its own participant, with no per-issuer development by us.

---

## Rationale

**Why a format rather than a service.** Publishers, verifiers and wallets are different organisations. A frozen byte-level format with conformance cases lets them interoperate, and when two implementations disagree it shows the exact case. A CIP needs the same thing.

**Related RFP 11 proposals.**
- *Contract-agnostic Merkle attestation sidecar (o1Labs, #577).* Configurable Merkle trees over a participant's active contracts, with a proof-of-reserves example over a CIP-56 holding template, non-membership proofs, and a Canton↔EVM bridge. Its tree constructions (OpenZeppelin-compatible binary tree, sparse Merkle tree) do not carry subtotals in the node hash, so a root shows which contracts are included but does not commit to their total. This proposal is about committing to the total, together with a signed document format, assurance levels and a conformance corpus. A sum-tree construction in this format could be offered as one of the sidecar's tree options; we would welcome working with o1Labs on that.
- *ZK supply-cap prover (Ligero, #517, passed its committee vote on 2026-10-28).* Proves in zero knowledge that circulating supply is within an advertised cap, without revealing totals or positions, with completeness anchored to the mediator verdict stream and counter-signed ACS commitments. It answers “is supply within the cap?” for the market. This proposal answers “what is the exact total, and am I counted in it?” for each holder, in a published document format with a conformance corpus that other tools can produce and check. The two compose rather than overlap: a `token.supply` report can reference a #517 proof for the same instrument and offset; the Milestone 4 portal can show that proof beside the report; and we build no completeness mechanism of our own, pointing to #517 for that property. During Milestone 2 we will offer Ligero a joint test on one CIP-0056 instrument; this depends on their agreement and is not an acceptance condition.
- *Structural reserve attestation (#759).* Enforces solvency inside new custody contracts the custodian adopts. This format works over an existing ledger snapshot with no contract changes, and such a contract could publish this format's root.

**Why extend rather than replace.** The work reads existing CIP-0056 `Holding` contracts through the Ledger API and changes neither the standard nor any contract.

**Alternatives considered.** Publishing positions defeats confidentiality. An auditor's signed figure alone cannot be checked by holders. Ethereum proof-of-reserves designs assume public reserves, a global block height and integer amounts, none of which hold on Canton.
