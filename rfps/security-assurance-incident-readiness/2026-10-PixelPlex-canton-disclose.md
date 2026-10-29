## Development Fund Proposal

**Organization:** PixelPlex  
**Author / Primary Contact:** Alexei Dulub, alexei.dulub@pixelplex.io  
**Status:** Draft  
**Created:** 2026-10-29  
**Proposal Type:** RFP-aligned  
**RFP / Roadmap Area:** Security, Assurance & Incident Readiness. RFP 27 Security Monitoring, Auditability and Evidence.  
**Champion:** `Needs Champion`  
**Total Funding Request:** 1,690,000 CC, of which 850,000 CC is paid only for external adoption and 80,000 CC only on CIP approval  
**Project Duration:** about 15 months (24 weeks of delivery, then a 9-month adoption window)  
**Label:** regulatory-compliance  

---

## Abstract

A Canton party often has to show part of its past transactions to someone who is not on the ledger: an auditor, a regulator, a counterparty in a dispute. Observers do not cover the past, and a signed export asks the recipient to trust the party under audit.

We propose Canton Disclose: a portable evidence package and an open verifier. The subject authorizes the disclosure on the ledger, names the recipient and the scope, and its participant operator exports the matching records. The recipient checks each claim offline, from the bytes it keeps, without access to the ledger. The strongest claim, that the synchronizer accepted the transaction, rests on the mediator group's signatures, which Canton already produces.

Deliverables: a Daml consent package, a package format with per-claim results, an exporter run by the participant operator, a verifier as CLI, library and browser page, a conformance corpus, and a CIP, all Apache-2.0. More than half of the request is paid only when organizations outside PixelPlex use the format on MainNet.

The companion implementation draft, [`2026-10-PixelPlex-canton-disclose-implementation-draft.md`](./2026-10-PixelPlex-canton-disclose-implementation-draft.md), has the consent package, the package format, the verification algorithm, the evidence-access measurements and the validation corpus.

---

## Specification

### 1. Objective

Let a Canton party hand chosen past transactions to a chosen recipient, who checks specific claims about them without trusting that party for those claims, and learns nothing beyond the authorized items except what implementation draft §10 lists. That list includes the party structure Scan publishes for the update id of an anchored item.

RFP 27 asks each proposal four things:

- **Threats addressed.** A subject that fabricates or alters history it presents as the network's; an exporter that delivers more than the grant authorizes; a recipient that mistakes an identifier match for network acceptance.
- **Scope.** Entity level: one participant's retained history, exported by its operator. No statement about any other participant.
- **Data sources.** The Ledger API, the participant's stored sequenced events (signed confirmation results, encrypted protocol views) and the topology store. No public scan data.
- **Privacy, access control and selective disclosure.** An on-ledger grant per recipient, deny-by-default scope checks on every opened component, and a counterparty policy (§2).

A verified package does not establish that a contract is active now, that the subject disclosed everything in scope or that a derived figure is correct. It says nothing about solvency, settlement or completion of a workflow. The recipient still relies on the confirming participants, the synchronizer's topology governance and its own trust anchor. Out of scope: TEE or ZK aggregate publication, proof of reserves, continuous assurance. RFP 11 is not claimed.

### 2. Implementation Mechanics

**Actors.** The *subject* authorizes the release, the *exporter* runs at the subject's participant operator, the *recipient* runs the *verifier*.

**Consent on the ledger.** A small Daml package, given in full in implementation draft §4. It compiles on SDK 3.5.2, and its test scenarios, kept in a separate package, pass. The subject accepts a `DisclosureRequest` into a `DisclosureGrant` with scope, expiry, delegates and a counterparty policy. Each export gets an `ExportAuthorization` binding one package hash to one recipient. The recipient acknowledges receipt itself, on the ledger or by signature. The package carries the grant and the authorization as anchored evidence of the transactions that created them, so the verifier takes the authorization time from the mediator-signed record time and not from a field the subject filled in. The ledger records the grant, its narrowing and its revocation, and a verifier with ledger access checks them online.

**Claims.** Each item carries several claims, each with its own evidence and result:

| Claim | Establishes | Evidence |
| --- | --- | --- |
| `content_integrity` | the item is what the manifest commits to | package hashes |
| `id_authenticated` | payload and authentication data recompute the contract-id suffix (the discriminator is not covered); not that the contract was ever created | `created_event_blob` |
| `transaction_acceptance` | the synchronizer accepted the transaction at the stated record time, and the item is a leaf of it | mediator-signed result, its sequencer-signed delivery, historical topology, decrypted protocol view |
| `disclosure_authorization` | the subject authorized this package to this recipient at a record time | grant and export authorization as anchored evidence |
| `recipient_acknowledged` | the recipient confirmed receipt of this content hash | acknowledgement signed by the recipient |
| `scope_completeness` | nothing cryptographic | subject attestation |

The corpus includes a fabricated but internally consistent contract that passes `id_authenticated` and must fail `transaction_acceptance`.

**Verify.** The verifier takes a package, a trust anchor and a policy file listing the claims the recipient requires, and returns a result per claim and a package verdict. Result vocabulary, policy format, aggregation rule and error codes are normative CIP text. Missing evidence gives its own named result, such as `unavailable`. Acceptance thresholds come from the mediator group in historical topology. The verifier ignores any threshold a package states.

```text
content_integrity:         verified
transaction_acceptance:    verified
id_authenticated:          verified
disclosure_authorization:  verified_as_of 2026-03-14T09:12:00Z
recipient_acknowledged:    unavailable
current_revocation_status: unknown_offline
scope_completeness:        subject_attested
```

**Two modes.** *Projection mode* exports events as the Ledger API shows them and needs only Ledger API read rights. A projection item carries no update id by default, so the recipient gets no Scan lookup key for it. A projection-only package is a signed export: its records, and its authorization, are as trustworthy as the subject. *Anchored mode* adds `transaction_acceptance` and an anchored `disclosure_authorization`. It reads the participant's stored sequenced events and opens the encrypted protocol views with the participant's encryption key. The package carries the mediator's result and its delivery to the exporting participant, which names only that participant. It does not carry the delivery of the confirmation request, which names the other participants.

We ran the chain on a local Canton 3.5.6 network with parties on two participants. We decrypted a protocol view with the participant's default ECIES key, recomputed its hash to the update id and to the root hash in the mediator's signed result, and checked the mediator and sequencer signatures against the participant's topology store. The run took shortcuts: the key was exported from the node, verification used Canton's own classes inside the node's JVM, there was one mediator and one sequencer, and the topology signatures were not checked (draft §8). Milestone 1 repeats the chain without them, and the Committee decides whether to continue based on its published result.

**The disclosure boundary.** Canton draws a protocol view around participants, not parties, so one view can contain an action concerning a party the grant never named. The exporter checks every opened component against the grant and the subject's own visibility, and falls back to a projection item when a component cannot be separated. The verifier repeats the check. Milestone 1 measures how often this happens.

**Counterparties.** Counterparties did not sign the grant, but an anchored item can carry their party ids. The grant carries a counterparty policy, chosen by the subject and enforced by the subject's exporter and by the verifier from evidence in the package:

- `ConsentRequired` (CLI default): every other party an anchored item names has a `CounterpartyConsent` for this subject, recipient and scope, signed by that party alone and carried as anchored evidence. A missing consent fails the package.
- `NotifyOnly`: the package carries an anchored `DisclosureNotice` to each named party. A missing notice fails the package.
- `ProjectionOnly`: no anchored item may name anyone but the subject.

Parties in the grant's `policyExempt` list are outside the policy. By default the CLI adds to it the admin of each instrument in scope. The admin takes part in every movement of its asset, and for Amulet it is the DSO party, which will not sign a consent for each audit.

The policy protects counterparties from an honest operator's mistakes. It cannot protect them from a subject that decides to disclose what it can already see. Who learns what under each policy, including what a root hash reveals on a synchronizer with Scan, is in implementation draft §10.

**Operator deployment requirements.** What an operator must provide for anchored mode:

1. The exporter runs on the operator's infrastructure, in the participant's trust zone. PixelPlex hosts nothing.
2. Read-only access to the participant's stored sequenced events, through a database role with `SELECT` on `common_sequenced_events` and the topology tables only. The same database holds the node's private keys in `common_crypto_private_keys`. A wider read grant gives the exporter every key of the node unless the private store is encrypted with a KMS key. A second sequencer subscription is possible, but its credential can also send messages as the participant, so we do not recommend it.
3. A decrypt capability for the participant's encryption key. Canton's AWS and GCP KMS integrations accept only RSA-2048 encryption keys. ECIES keys can sit in a KMS only through a KMS driver that supports them. For such a key the capability is a scoped, logged KMS permission. Canton has no sanctioned way to give an outside process decrypt capability for a node-held key. Such a participant runs projection mode.
4. Historical encryption keys kept for the window offered, and capture started before pruning.
5. Every decrypt and export audit-logged.

Projection mode needs none of points 2 to 4.

**Coverage.** A package states its earliest recoverable update, the retention window and any gaps, and still verifies after the source participant has pruned that history.

**Surfaces.** `dpm disclose request | grant | export | verify`, `@canton-disclose/core` and `@canton-disclose/verifier`, the browser verifier, and a reference exporter container.

### 3. Architectural Alignment

RFP 27 asks for "reusable tools and standards for ... compliance evidence ... while preserving Canton's privacy model". This is an evidence primitive for any Daml application. It adds no observers and no protocol change. It builds on CIP-0112: account-provider visibility decides who sees events, and this format gives that visibility a verifiable export for past events and outside recipients.

**Upstream first.** The exporter reads interfaces Canton serves to its own operator, but they carry no stability guarantee for this use: `mediator.proto` is exempt from the backwards continuity check and no check constrains hash derivation (draft §8). Decryption also has no sanctioned path for a node-held key. Milestone 1 writes up an evidence-export interface for the Canton maintainers that would solve both: an operator-only endpoint returning the signed result and decrypted views for an update, or at least a versioned specification of view and contract-id hashing. A narrower request goes with it: a mediator signature on the `MediatorInspectionService.Verdicts` stream. Proving acceptance would then need no read access to the participant database, though opening a view still needs decryption. If the maintainers take it on, the exporter targets it. If not, we publish their answer and keep pinning exact patch releases.

### 3a. Adjacent work and boundaries

Statuses checked on 2026-10-29.

| Adjacent work | Overlap | Boundary |
| --- | --- | --- |
| [DA Registry Proof of Transfer](https://docs.digitalasset.com/registry/guides/proof-of-transfer) (shipped) | Online status for Registry transfers | Complementary. We build no status service. If Digital Asset publishes a retained, independently checkable proof object, the package carries it |
| [Splice Scan](https://github.com/hyperledger-labs/splice) `/v0/events/{update_id}` (shipped) | Publishes mediator verdicts for the global synchronizer. Splice validators accept a Scan answer only when f+1 SV Scans agree (`BftScanConnection`), and a recipient can query Scans the same way | Where the recipient can check online at the time, Scan is the cheaper path. Scan has to be queried online, gives the recipient nothing to keep as proof, runs only on the global synchronizer, and returns only the verdict for a transaction the DSO party did not see. We read no data from Scan and propose no change to it |
| [#853 Veilio](https://github.com/canton-foundation/canton-dev-fund/pull/853) (in vote) | On-ledger authorization, off-ledger evidence packages | Theirs evidences who may see data. Ours evidences what the network accepted. If their authorization object lands first, our grant evidence cites it |
| [#577 Merkle Attestation Sidecar](https://github.com/canton-foundation/canton-dev-fund/pull/577) (in vote) | Extraction, commitments, external verification | They carry a participant's attestation; we carry the mediator group's signatures. No commitment sidecar |
| [#786 Koschei Sentinel](https://github.com/canton-foundation/canton-dev-fund/pull/786) (open) | Evidence schema and bundles | No assurance rules or test corpus. If their bundle format lands first we carry our items inside it |
| [#860 Refused actions](https://github.com/canton-foundation/canton-dev-fund/pull/860) (open) | Evidence format, offline verification | Accepted transactions only. We propose a common envelope convention |
| [#788](https://github.com/canton-foundation/canton-dev-fund/pull/788), [#866](https://github.com/canton-foundation/canton-dev-fund/pull/866) (in vote), [#759](https://github.com/canton-foundation/canton-dev-fund/pull/759) (draft), [#302](https://github.com/canton-foundation/canton-dev-fund/pull/302) (merged) | Audit trails, attestation, compliance outputs | Ledger API access logs (#788), entries the attester created (#866), solvency (#759), monitoring and risk scoring (#302): we build none of these. #759 can take our package as input |
| [#941 Verifiable Disclosure Format](https://github.com/canton-foundation/canton-dev-fund/pull/941) (open, RFP 11) | Verifiable disclosure, offline verifier, conformance corpus | Issuer-published aggregates with holder inclusion proofs. We disclose individual past transactions to a named recipient and publish no aggregate. No shared component |
| [#879 cantonsim](https://github.com/canton-foundation/canton-dev-fund/pull/879) (PixelPlex, draft) | Contract-id recomputation | No dependency in either direction. cantonsim predicts views before submission; we read the views Canton produced. If both are funded they share test vectors |

### 4. Backward Compatibility

*No backward compatibility impact.* The consent package is new and independent, and no existing application changes. The exporter is a read-only consumer and requests no protocol change and no new ledger visibility.

Because no continuity check constrains hash derivation, the first release names exact patch releases instead of version ranges, along with supported cryptographic configurations, contract-id versions, tested transaction shapes and the unsupported cases (draft §3, §5, §10). That compatibility matrix is normative.

---

## Milestones and Deliverables

Two senior engineers from the CC View and CC Trace teams, who work with Splice Scan and the Canton protocol. Milestones 1 to 4 take 24 weeks from the project start. Milestone 5 is the adoption window, closing 9 months after Milestone 4 is accepted.

### Milestone 1: Feasibility gate and upstream proposal
- **Committed Date:** week 5
- **Effort:** 10 engineer-weeks
- **Focus:** the proof chain on a named Canton patch release, with parties on two participants, without the shortcuts of our local run: the view decrypted through a KMS-held key, the mediator signatures checked against historical topology validated up to a trust anchor. Separability measured on views captured from a local Canton network running the token-standard test scenarios shipped with Splice, with parties placed on separate participants as in production (registry admin, each holder and the executor each on their own participant), and the share of items that passes under each counterparty policy. The decrypt options for KMS-held and node-held keys and their trust cost. The evidence-export interface for the Canton maintainers.
- **Deliverables / Value Metrics:** the proof chain, reproduced by an engineer outside PixelPlex from the published repository, with their name and reproduction log in the milestone report; the leaf-separability number per placement and the pass share per policy, published with tool and corpus whatever the result; the target workflows with the disclosures each needs; the operator deployment guide; the interface proposal sent to the maintainers.
- **The gate:** the Committee decides whether to continue, based on the reproduced proof chain and on whether the named workflows can be served on real transaction shapes. If the gate fails, we publish the finding and a revised scope and payment schedule within two weeks, and Milestones 2 to 4 are reopened for the Committee rather than narrowed by us. The maintainers' answer is not part of the gate.

### Milestone 2: Standard, consent package, claims without decryption
- **Committed Date:** week 11
- **Effort:** 12 engineer-weeks
- **Focus:** consent package, the package format as a versioned JSON Schema in the project repository, claim definitions, result vocabulary, policy format, threat model, CIP draft. Contract-id recomputation in the TypeScript verifier for every supported contract-id version, with test vectors from a running node. Historical-topology export with its completeness rule.
- **Deliverables / Value Metrics:** a recipient with no ledger access verifies `content_integrity` and `id_authenticated` on the published corpus, and the fabricated-contract case fails `transaction_acceptance`. The JSON Schema is published and every corpus package validates against it. The CIP draft is filed with the Regulatory Compliance SIG.

### Milestone 3: Exporter, disclosure boundary, cryptographic review
- **Committed Date:** week 17
- **Effort:** 12 engineer-weeks, plus an independent cryptographic review
- **Focus:** capture from the stored sequenced events, decryption through the KMS paths, per-component scope checks, anchored authorization and counterparty evidence, CLI, library and browser verifier, tampered corpus, retention tests. The independent review runs here, before anchored mode is finished, so its findings shape it.
- **Deliverables / Value Metrics:** the verifier fails with a specific named error code on every tampered case in the corpus (draft §15 lists them, including a backdated authorization and a counterparty named without consent); the boundary test passes: a transaction with informees on two participants, exported for one party, with the other party's node absent; the review report is published with each finding and its resolution.

### Milestone 4: `transaction_acceptance` end to end, CIP submission
- **Committed Date:** week 24
- **Effort:** 12 engineer-weeks
- **Focus:** view-tree hashing in the TypeScript verifier, the anchored path over the shapes Milestone 1 established, mediator threshold derivation, a CI job that runs the corpus against each new Canton patch release, CIP submission.
- **Deliverables / Value Metrics:** one end-to-end disclosure from a custom Daml application that is not a Registry transfer, verified on DevNet from the package, topology and trust anchor alone, with the exporter unreachable and nothing outside the grant in the package; the re-validation CI public with its first runs linked; the CIP submitted.

### Milestone 5: External adoption
- **Committed Date:** 9 months after Milestone 4 acceptance
- **Effort:** 4 engineer-weeks of integration support, spent only if adopters appear
- **Deliverables / Value Metrics:** up to four adoption events, each by a different organization. Each event is an organization not affiliated with PixelPlex (no common ownership, not a PixelPlex client or contractor for this work, not a co-author of this proposal) that confirms in this PR one of:
  - (a) it runs the exporter on its own MainNet participant and delivered at least one package with anchored items to a recipient outside its organization;
  - (b) it is a recipient that accepted at least three such packages from MainNet participants in its own process, using a conforming verifier with its own trust anchor, or that accepted one and publicly describes how it uses the format. The exporting organizations must meet the same affiliation rule.

  A package exported for a PixelPlex product never counts. A delivery counts toward one event only, as (a) or (b). The Committee resolves disputes. CIP approval is a separate payment.

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone
- Demonstrated functionality against local Canton and DevNet
- Documentation and knowledge transfer provided
- Alignment with stated value metrics

Project-specific conditions:

- Every claim is defined in the CIP with its evidence, result tokens and error codes, and the corpus has a case for each token. Two conforming verifiers return the same verdict on the same inputs.
- A package with only `id_authenticated` is never reported as evidence of network acceptance.
- The privacy analysis states what the recipient, exporter, delegates and each counterparty learn under each policy, in a form others can reproduce.
- A design element found impossible as specified is published within two weeks of the milestone that found it.
- Code, schemas, corpora and CIP text are public under Apache-2.0 throughout.

---

## Funding

**Total Funding Request:** 1,690,000 CC

### Payment Breakdown by Milestone
- Milestone 1 (Feasibility gate and upstream proposal): 140,000 CC upon committee acceptance
- Milestone 2 (Standard, consent package, claims without decryption): 180,000 CC upon committee acceptance
- Milestone 3 (Exporter, disclosure boundary, cryptographic review): 280,000 CC upon committee acceptance, of which 100,000 CC is the independent review, paid out on publication of its report
- Milestone 4 (`transaction_acceptance` end to end, CIP submission): 160,000 CC upon committee acceptance
- Milestone 5 (External adoption): up to 930,000 CC upon final acceptance: 212,500 CC per adoption event, up to four, and 80,000 CC on CIP approval, each counted within the window

| | Paid regardless of adoption | Paid only for external adoption | Paid only on CIP approval |
| --- | --- | --- | --- |
| Milestones 1 to 4 | 760,000 | | |
| Milestone 5 | | 850,000 | 80,000 |
| Total | 760,000 (45%) | 850,000 (50.3%) | 80,000 (4.7%) |

### Effort basis

52 engineer-weeks at about 30,600 CC each, plus a 100,000 CC independent cryptographic review procured from a third party. Infrastructure is a DevNet participant and a validator we already operate.

| Milestone | Engineer-weeks | Effort |
| --- | --- | --- |
| 1 | 10 | proof chain through a KMS key with validated topology, measurements, decrypt options, deployment guide, interface proposal |
| 2 | 12 | consent package, schema, claims, CIP draft, topology export; contract-id recomputation in TypeScript (3 engineer-weeks) |
| 3 | 12 | store capture, KMS decryption, boundary and counterparty checks, verifier surfaces, corpus, review fixes |
| 4 | 12 | view-tree hashing in TypeScript (4 engineer-weeks), anchored path, non-Registry demonstration, re-validation CI, CIP |
| 5 | 4 | support for external adopters |
| across | 2 | project management, SIG and CIP threads, maintainer discussion |

The 660,000 CC of engineering paid regardless of adoption covers 48 engineer-weeks, about 13,750 CC each.

### Volatility Stipulation
The grant is denominated in fixed Canton Coin and will require a re-evaluation at the 6-month mark.

### Maintenance
PixelPlex commits to 12 months of maintenance after Milestone 4 at its own cost: the re-validation CI on every Canton patch release and the fixes it calls for, the compatibility matrix, security fixes, and issue triage within 5 business days. We estimate one patch release at 1 to 3 engineer-days when CI passes, and up to 2 engineer-weeks when hash derivation, the `created_event_blob` layout or the sequenced-event store schema changes. Not included: a standing-feed service, new delivery adapters, new item kinds, and a transfer-status adapter.

---

## Co-Marketing
Upon release, the implementing entity will collaborate with the Foundation on:

- Announcement coordination and a technical blog per milestone
- A case study with an adopting operator and recipient
- A recorded workshop for compliance and audit teams of Foundation members

---

## Motivation

Read access and observers require the recipient to be on the ledger, and observers miss the past. A signed export moves the trust back to the party under audit. For Registry transfers, Proof of Transfer gives an online status check. This proposal covers the remaining case: evidence from any Daml application that a recipient checks years later from what it kept, without calling a service. The typical case is one transaction. A party in a dispute shows that a trade in a custom settlement application was accepted. A payer shows a counterparty or an auditor that a payment went through. Statements also fit, such as an issuer's mint and burn history or a custodian's holdings changes for one account. There the package proves each record it carries, and only the subject answers for completeness. Milestone 1 confirms which of these the project serves first.

Who benefits: asset issuers and account providers that report to clients and regulators, custodians, applications that must evidence their own behaviour, and attestation and compliance projects that need a common input format. By a third-party count the network had 107 Featured Apps at the end of Q2 2026 ([CantonNews](https://cantonnews.org/canton-network-q2-2026-a-deep-dive-into-transactions-apps-and-validators)), and each of their operators can export projection-mode packages. Anchored mode needs the participant encryption key in a KMS, and Canton's AWS and GCP KMS integrations accept only RSA-2048 encryption keys. On 2026-10-29 the global synchronizer's topology listed RSA-2048 encryption keys for 293 of its 2,249 participants. This is the most anchored mode can serve today, since an RSA key suggests a KMS but does not prove one. Milestone 1 publishes the deployment guide.

**How this drives adoption.** Projection mode is the entry step. It needs only Ledger API read rights, so any operator can issue packages from the first release, but a projection package is a signed export and does not count as adoption. Operators that hold their encryption key in a KMS add anchored mode, and adoption payments count only anchored packages on MainNet from organizations outside PixelPlex. Recipients need no node: the verifier runs in a browser. The CIP lets auditors and other tools accept packages without depending on PixelPlex. PixelPlex plans to export packages from its own validator for its Featured Applications and to accept packages as evidence in CC Trace investigations. This is a first use and does not count as adoption.

---

## Rationale

**Why claims instead of one proof grade.** `id_authenticated` and `transaction_acceptance` are different facts with different evidence. A format that reports one number will be read as the stronger of the two.

**Why the boundary is the gate.** Canton draws protocol views around participants, so anchored mode may be narrow on real transaction shapes. We measure that first, before the money for anchored mode is spent.

**Why authorization is anchored.** The caller sets every time field in the consent contracts. Anchoring the grant and the authorization to their own transactions gives the verifier a record time signed by the mediator group, which the subject cannot backdate.

**Why no field-level redaction with network-backed authenticity.** `ViewParticipantData` carries one salt for the whole leaf, so removing a field changes the leaf hash. Binding a redacted record to the original transaction needs a transformation proof the protocol does not have. This proposal does not include one.

**Alternatives considered.** TEE-based disclosure trusts hardware and an operator. A hosted disclosure service would centralize private data.

**Relation to PixelPlex's other proposals.** PixelPlex has #606, #878 and #879 open on this board.

**About PixelPlex.** PixelPlex operates a Canton validator, four Featured Applications and an asset issuer, builds CC View (explorer and data API), Intercepta (transaction monitoring, clients include Revolut and Trust Wallet) and CC Trace (investigations), co-authored CIP-0103 (dApp Standard) and authored the draft Standard Package Validation CIP ([cips PR #168](https://github.com/canton-foundation/cips/pull/168)). About a third of its 100 engineers work on Canton and Daml.
