# Zeko ZK Rollup Settlement for Canton

**Applicant:** Zeko Labs  
**Zeko:** https://zeko.io  
**Zeko GitHub:** https://github.com/zeko-labs  
**Zeko Docs:** https://docs.zeko.io  
**Status:** Draft for Canton Development Fund submission  
**Created:** 2026-06-11  
**Champion:** Jack Charlesworth (LayerZero) - Financial Workflows & Composability SIG  
**Champion organization:** LayerZero  
**Champion contact:** Jack Charlesworth  
**Primary SIG:** Financial Workflows & Composability  
**Label:** financial-workflows-composability  
**Primary RFP category:** Financial Markets, Standards & Verification - 13. Payments and DeFi  
**Secondary RFP category:** Financial Markets, Standards & Verification - 11. Public verifiability  

# Abstract

Canton consortia can privately authorize and atomically settle institutional assets, but multilateral workflows may still require participants either to reveal confidential inputs or trust an operator to calculate the result. This proposal adds a Zeko proof layer for that missing computation.

The reference implementation is private multilateral B2B payment netting and collateralized settlement. Members anchor commitments to authorized obligations on Canton, while the private records are processed in a Zeko rollup lane. Zeko proves exact-set consumption, authorization, per-asset conservation, netting correctness, funding and collateral conditions, state continuity, and replay protection. A registered verifier quorum attests to the Groth16 proof, and Daml authorizes and records the resulting Canton settlement.

Canton remains authoritative for parties, agent mandates, assets, workflow authorization, entitled views, and final settlement. The grant delivers reusable open-source Daml packages, proof and receipt schemas, verifier and adapter infrastructure, deployment tooling, and a testnet reference lane. Approved aggregate metrics can also be independently verified without exposing bilateral obligations or member-level positions.

# 1. Specific Motivation And RFP Alignment

A consortium of institutions has recurring bilateral payment obligations across Canton-native assets. Gross settlement requires every obligation to be funded separately. Multilateral netting reduces liquidity and transaction requirements, but conventional implementations force a tradeoff:

1. disclose the full obligation graph so participants can reproduce the calculation; or
2. give the private graph to a calculation operator and trust the returned net positions.

The first approach exposes counterparties, exposures, limits, and liquidity information. The second preserves confidentiality among members but leaves the operator trusted for inclusion, arithmetic, policy application, and settlement-output integrity.

Zeko fills this specific gap. It maintains private rolling state across obligations, settlement windows, consumed nonces, collateral conditions, agent mandates, and prior receipts, then proves the multilateral state transition. Canton authorizes and settles the resulting asset movements. The lane holds no Canton assets.

This maps primarily to **RFP 13: Payments and DeFi**, which seeks reusable open-source payment, settlement, liquidity, privacy, auditability, and interoperability components. It maps secondarily to **RFP 11: Public verifiability** because the same proof can produce authorized aggregate settlement metrics that outside consumers can verify without receiving the bilateral obligation graph. The primary SIG remains Financial Workflows & Composability because the reference workflow is institutional settlement rather than an on-chain DeFi protocol; the RFP 13 mapping follows from the reusable payment and settlement tooling itself.

## Why The Ecosystem Needs It

Each accepted lane brings Canton assets, parties, and settlement volume into a workflow that would otherwise settle gross, depend on an opaque calculation operator, or remain off-ledger. Consortium members reduce funding and reconciliation requirements; auditors and regulators gain verification without unrestricted data access; market participants gain proof-backed settlement-volume and netting-efficiency signals; and verifier operators gain a reusable service role. The packages, schemas, and verifier interface are consortium-agnostic, so later deployments configure the same public infrastructure instead of rebuilding it, and the aggregate-verification path can support other Canton workflows with private data.

## Why Canton

Canton is the appropriate settlement layer because its Daml application model provides private, party-authorized workflows and atomic asset-state updates. Its synchronizer architecture also supports isolated institutional deployments while preserving Canton interoperability. Zeko does not replace those capabilities: it supplies proof of the private calculation that determines which Canton settlement transition is authorized. No Canton protocol, consensus, or synchronizer change is required.

# 2. Concrete Reference Use Case

The reference configuration is a consortium of four members settling recurring obligations across two approved Canton assets and three consecutive settlement windows, with the acceptance target extending to 25 finalized windows. Members may act through treasury staff, institutional systems, or authorized enterprise agents.

The implementation must provide:

- **Confidentiality:** members receive only their obligations, net position, and entitled settlement views, not the complete bilateral graph.
- **Externally anchored completeness:** every obligation included in a settlement window is committed on Canton before cutoff, and the proof consumes exactly the finalized commitment set.
- **Authorization:** every obligation is signed by an authorized member or an enterprise agent operating under an active Canton-recorded mandate.
- **Conservation:** debits equal credits for each asset, apart from explicitly registered fees or adjustments.
- **Funding and collateral sufficiency:** each net debit is covered by Canton escrow, an authorized Canton settlement limit, or collateral evaluated under the registered policy.
- **State continuity:** the new private state follows from the last accepted root, including carried obligations, consumed nonces, limits, and prior receipts.
- **Replay protection:** an obligation, window, receipt, or settlement claim cannot be accepted twice.
- **Fail-closed settlement:** an invalid proof, missing quorum, stale root, or insufficient funding produces no partial settlement.
- **Verifiable disclosure:** approved aggregate metrics are bound to the same finalized window and proof without exposing bilateral obligations or member-level positions.

## Mandatory Obligation Anchor

Every obligation must create a `ZekoObligationCommitment` on Canton before the registered window cutoff. The contract records the submitting party, window, asset, nonce, and canonical obligation digest; the private obligation is delivered separately to the Zeko lane.

A member may withdraw or replace its own commitment before cutoff through an authorized Daml choice. Withdrawal archives the commitment and excludes it from the active window set. At cutoff, a `FinalizeWindow` action closes the set. Active commitments are canonically ordered by the versioned schema, and the adapter and each verifier independently reconstruct the same obligation-set root from Canton Ledger API state. The finalized root, commitment count, window identifier, and cutoff are recorded in `ZekoSettlementWindow`.

The obligation-set root is a Groth16 public input and a field in the Canton batch receipt. The proof statement is: **the batch consumed exactly the active obligation set committed under root R for window W**. Omitting, inserting, replacing, or replaying a commitment causes verification to fail.

This anchor proves correspondence to the committed set. It does not prove that a member's underlying commercial assertion is true. Member signatures, approved source signatures, or optional zkTLS evidence establish authorization and provenance; real-world truth remains a source responsibility.

## Enterprise-Agent Authorization

An enterprise agent may act only under an active `ZekoAgentMandate` recorded on Canton. The mandate identifies the principal, agent key or scoped identifier, permitted assets and counterparties, action types, value and frequency limits, validity period, approval requirements, policy hash, and revocation status.

The private Zeko state may contain the agent's budget usage, prior activity, workflow state, and policy evidence. The proof establishes that each accepted agent instruction was authorized, within mandate and budget, non-duplicative, and consistent with the active policy commitment. Private prompts, model outputs, internal policies, and decision records are not disclosed. The proof does not claim that the agent's commercial judgment was optimal.

# 3. Architecture

Zeko provides three functions to Canton.

## Private Execution And Recursive Proof

The Zeko lane receives the private obligations corresponding to Canton commitments, validates signatures and mandates, updates the rolling private state, computes per-asset net positions, checks funding and collateral policy, and constructs the settlement-instruction root. Zeko's recursive proof stack compresses the settlement-window transition into proof material that the existing Zeko/SP1 pipeline wraps as Groth16.

Zeko has begun building and proving this reusable external-settlement path in [zeko-labs/ethereum-settlement](https://github.com/zeko-labs/ethereum-settlement). The [Zeko Ethereum settlement litepaper](https://zeko.io/ethereumlitepaper.pdf) documents the broader technical direction. Ethereum is an initial proof point for external settlement; this proposal makes Canton the target institutional deployment.

## Verifier Attestation

Registered verifier operators independently reconstruct the finalized Canton obligation-set root; load the registered Groth16/SP1 and Zeko verification artifacts; verify the proof and versioned public inputs; check roots, commitments, settlement instructions, funding/collateral bindings, disclosure outputs, and key versions; and sign the exact proof hash and public-input digest.

The Groth16 artifact is the cryptographic proof. A verifier signature attests that the named operator performed the registered verification. Daml checks registered parties, quorum, receipt binding, authorization, and Canton state transition rather than reproducing pairing arithmetic.

The reference policy, and the Milestone 3 acceptance bar, is **3-of-5**, distributed across at least three operationally independent organizations so no single organization controls quorum. At least one verifier must be independent of both Zeko and the lane operator. A 2-of-3 configuration is permitted only as an interim Milestone 3 configuration; migration to 3-of-5 must be completed and tested before Milestone 3 acceptance.

The verifier set, quorum threshold, and circuit/key versions are held in `ZekoRollupRegistry`. Registry changes require authorization from the registered consortium governance parties, not Zeko alone, and take effect only from a registered activation sequence so they cannot retroactively apply to an accepted batch. Zeko operating one verifier therefore does not give Zeko control of the quorum.

Under 3-of-5, the lane remains live with up to two unavailable verifiers. If fewer than three valid attestations are available, the window does not settle. Canton remains at the last accepted state, and obligations carry forward, expire, or enter the registered gross-settlement path.

At consortium registration, the founding member parties and governance threshold are agreed with the consortium, not selected by Zeko alone, and recorded in the initial authorized registry transaction. Subsequent governance-party or threshold changes require the currently registered member threshold and take effect only from a prospective activation sequence. The Milestone 1 design document will define the bootstrap authorization and membership-change choices.

## Canton Settlement Receipt

The minimum reference Daml package includes:

- `ZekoRollupRegistry`: lane, circuit, key, schema, verifier, quorum, asset-scope, and disclosure configuration.
- `ZekoRollupState`: current accepted root, sequence, and replay-protection commitments.
- `ZekoAgentMandate`: principal-to-agent authority, limits, policy commitment, validity, and revocation.
- `ZekoObligationCommitment`: canonical commitment for a private obligation, with pre-cutoff withdrawal/replacement choices.
- `ZekoSettlementWindow`: cutoff, active commitment count, finalized obligation-set root, and status.
- `ZekoConsortiumEscrow`: settlement capacity, asset, amount or limit, window scope, expiry, and timeout recovery.
- `ZekoVerifierAttestation`: verifier assertion bound to the exact proof and public-input digest.
- `ZekoConsortiumSettlementBatch`: accepted roots, settlement instructions, aggregates, proof metadata, quorum, and settlement status.
- `ZekoPublicMetricCertificate`: authorized aggregate value, source-state commitment, proof binding, and disclosure policy.
- `ZekoSettlementClaim`: one-time settlement instruction or claim linked to an accepted batch.

The exact templates, choices, signatories, observers, controllers, and selected Canton asset interface are finalized in the Milestone 1 design document.

# 4. End-To-End Walkthrough

| Step | Actor and system | Information created, sent, or revealed | Trust and failure behavior | Proven, attested, and Canton impact |
|---|---|---|---|---|
| **1. Register and fund** | Consortium governance and members use the Canton application. | Register members, assets, ruleset, agent mandates, circuit/key versions, verifier set, quorum, disclosure policy, and windows. Members escrow or authorize settlement capacity. | Governance changes require Canton-party authorization. Insufficient capacity prevents acceptance. | Canton records governance, mandates, and asset authorization. New Daml packages are deployed; no protocol change is required. |
| **2. Commit and finalize** | Members, systems, or agents create private obligations and Canton commitments. | The private record goes to the lane. Canton receives its digest, member, asset, window, and nonce. Members may withdraw or replace before cutoff. At cutoff, the active set closes and its canonical root is recorded. | Members attest commercial validity. The operator can delay private delivery but cannot silently omit a finalized commitment. Missing private data causes failure or the registered carry-forward/expiry treatment. | Signatures and mandates establish authorization; source truth is attested. Canton anchors the exact input set. |
| **3. Execute and prove** | Zeko and the SP1/Groth16 pipeline process the finalized window. | Zeko validates authority, consumes exactly the finalized set, nets by asset, checks conservation and funding/collateral, advances state, and produces settlement and disclosure commitments. | The operator affects availability and may receive private obligations under consortium confidentiality rules. It may be an existing consortium agent or member-owned utility, so the design does not necessarily introduce a new trusted third party. It is not trusted for input-set selection, arithmetic, policy correctness, or output. | Exact-set consumption, authorization, conservation, netting, policy checks, replay protection, and continuity are cryptographically proven. |
| **4. Verify and attest** | Independent verifier operators query Canton, verify Groth16, and attest through Canton parties. | Each reconstructs the finalized root and checks the proof, inputs, roots, instructions, aggregates, keys, and schema. | A dishonest minority cannot satisfy quorum. A colluding quorum could falsely attest; independent replay detects but does not prevent that misconduct. Fewer than quorum attestations halt settlement. | Groth16 provides the proof; signatures attest verification. Canton stores verifier parties and policy. |
| **5. Settle and disclose** | The adapter and authorized Canton parties exercise settlement. Members and approved consumers receive receipts. | Canton receives proof/input digests, finalized root, state roots, instruction root, attestations, and entitled member instructions. Approved consumers may receive aggregate metrics and the proof package. | Daml rejects stale roots, wrong sets, insufficient quorum, replay, missing escrow, or unauthorized settlement. Failure produces no partial movement. | Daml authorizes final settlement and advances state. Aggregate derivation is proven; final asset state is Canton-authoritative. |

# 5. Trust, Failure, And Recovery

- **Members** attest that signed obligations represent valid commercial instructions.
- **Canton** is authoritative for parties, mandates, escrow or settlement capacity, Daml authorization, final asset state, and entitled views.
- **The lane operator** affects liveness and may hold a contractual confidentiality role, but cannot choose a different finalized set or alter the proven calculation. It may be an existing consortium agent or member-owned utility rather than a new trusted third party.
- **The prover** is not trusted for correctness; invalid computation fails verification.
- **The verifier quorum** is trusted by Daml to report proof verification honestly. Organizational diversity, replay, key rotation, pause, and removal reduce but do not eliminate collusion risk.
- **Off-chain sources** remain responsible for source truth. Signatures and zkTLS establish provenance and integrity, not objective truth.
- **Data availability** affects replay and recovery and is governed by registered retention and monitoring rules.

An invalid proof, unavailable operator, or unavailable quorum leaves Canton at the last accepted state. Nothing partially settles. If a window misses its deadline, obligations follow the registered carry-forward, expiry, withdrawal, or gross-settlement rule. If no batch is accepted before an escrow timeout, the depositing member may recover unused escrow through the applicable Daml authorization path without operator or verifier approval. Recovery is available only where no settlement claim references that escrow and it has not been consumed by an accepted batch; recovery and settlement are mutually exclusive on the same contract, enforced by consumption. The reference design includes a gross-settlement path from anchored commitments for consortium-approved recovery.

# 6. Value Compared With Canton-Only Alternatives

| Approach | Confidentiality | Calculation trust | Funding efficiency | External verification |
|---|---|---|---|---|
| Gross Canton settlement | Strong | No netting operator | Low; obligations funded separately | Canton receipts only |
| Full disclosure and member-recomputed netting | Weak across consortium | Members reproduce calculation | High | Requires private graph |
| Trusted operator plus Canton settlement | Strong among members | Operator trusted for inclusion and arithmetic | High | Operator attestation |
| Zeko proof plus Canton settlement | Strong among members | Finalized set and calculation proven; verifier quorum explicit | High | Proof-bound receipts and approved aggregates |

The lane is useful where multiple institutions require recurring joint computation over confidential inputs and cannot rely on full disclosure or one calculation operator. Where that requirement does not exist, a Canton-only Daml workflow remains simpler.

# 7. Public Verifiability And Extensions

The reference lane will produce a separately authorized verification package containing selected metrics derived from the same finalized set and accepted proof. Candidate outputs include gross payment value by asset, net settlement value, netting efficiency, obligation count, participant count, and aggregate collateral coverage. Member obligations, net positions, limits, pricing, and internal liquidity remain private.

Each `ZekoPublicMetricCertificate` binds the metric definition and version, measurement window, asset scope, value, finalized set root, proof/input digests, verifier quorum, Canton receipt, and disclosure policy. An approved consumer can independently verify that the metric came from the accepted private workflow state.

The same pattern can later support private-credit reserve or covenant proofs, repo and securities-lending netting, collateral and margin proofs, DvP batches, private dealer/RFQ settlement, and other enterprise-agent financial workflows. These are extensions, not parallel funded applications.

# 8. Scope And Deliverables

This is an indicative 4-6 month effort measured from committee-approved kickoff. Milestones 1-3 are expected to require approximately 16 weeks; the optional extension adds hardening, adoption, and mainnet work within the approved six-month envelope.

## Milestone 1: Detailed Design And Adopter Configuration

**Indicative duration:** 5 weeks.

- Detailed design covering actors, trust, Canton parties, Daml choices, selected asset interface, atomic settlement, timeout recovery, obligation finalization, Zeko state, agent mandates, formal proof statement, public/private inputs, verifier governance, data availability, disclosure, deployment, performance, security, and adoption.
- Architecture-gate review with the champion and reviewers before implementation proceeds.
- Reference-participant workflow mapping and success criteria.
- Threat model and test plan.

If no reference participant has confirmed by Milestone 1 acceptance, Milestone 2 proceeds against the reference configuration and participant selection moves to Milestone 3. The architecture gate is not contingent on a third party's timing.

## Milestone 2: Proof, Schema, And Local Fixture

**Indicative duration:** 5 weeks.

- Versioned obligation, finalization, public-input, receipt, attestation, and public-metric schemas.
- Canonical encoding, Poseidon/SHA-256 binding, and positive/negative vectors.
- Zeko/SP1/Groth16 fixture for exact-set netting and aggregate disclosure.
- Minimum Daml prototypes and deterministic verifier prototype.

## Milestone 3: Canton Testnet Reference Lane

**Indicative duration:** 6 weeks.

- Ledger API adapter and CLI for registration, commitment, finalization, proof submission, settlement, inspection, and verification.
- Streamlined Docker deployment for the lane, verifier, adapter, and workflow.
- End-to-end testnet lane covering four members, two assets, at least three windows, human, system, and agent authorization, escrow, private netting, proof generation, 3-of-5 verification at acceptance, atomic settlement, aggregate verification, timeout recovery, and negative cases.
- Operator, verifier, key-management, pause, recovery, and upgrade runbooks.
- Peer security review of the Daml packages before Milestone 3 acceptance; independent review and audit remain in optional Milestone 4.
- Public open-source packages, interfaces, fixtures, and documentation.

## Optional Milestone 4: Hardening, Adoption, And Mainnet Path

**Indicative duration:** up to 8 additional weeks, subject to committee approval and overlap with late Milestone 3 hardening where appropriate.

- Independent security review and remediation of Canton-specific components.
- Additional qualified verifier and lane operators.
- Additional consortium or asset configurations.
- Performance and reliability hardening.
- Ecosystem onboarding and application support.
- First committee-approved Canton mainnet settlement-lane deployment.

Mainnet deployment and production hardening are not acceptance requirements of the base grant. They are funded only through the committee-approved extension.

# 9. Acceptance Criteria

## Architecture And Correctness

- The design passes the architecture gate before implementation funding proceeds.
- Every active obligation is Canton-anchored before cutoff, and verifiers reconstruct the finalized root.
- The proof binds the exact set, roots, ruleset, agent mandates, instructions, funding/collateral conditions, disclosures, and registered keys.
- Invalid signatures, revoked or over-budget authority, omitted or inserted commitments, duplicate nonces, imbalance, underfunding, stale roots, altered instructions, wrong keys, invalid proofs, insufficient quorum, and replay are rejected.
- Timeout recovery and carry-forward, expiry, or gross settlement are demonstrated.
- Public certificates bind approved aggregates to the same window, proof, and Canton receipt.

## Adoption-Driven Delivery

- At least 25 accepted batches corresponding to 25 finalized settlement windows, including at least three consecutive windows and four participating members.
- At least one accepted window in which obligations are submitted by an enterprise agent operating under a Canton-recorded mandate.
- At least one complete window operated by an operator external to Zeko using the published stack.
- A 3-of-5 verifier set at Milestone 3 acceptance across at least three independent organizations, including one verifier independent of Zeko and the lane operator. A 2-of-3 configuration is permitted during Milestone 3 only, with tested migration completed before acceptance.
- At least one external participant, distinct from the operator external to Zeko, supplies obligations or maps its own workflow into the lane.
- If no reference participant is confirmed during Milestone 1, at least one external participant must be confirmed by Milestone 3 acceptance.
- At least one external consumer independently verifies an approved aggregate package without bilateral data.
- The final report records windows, batches, participants, gross-to-net reduction, external operation, failure exercises, integration findings, and remaining production work.

Zeko is in active discussions with ZK application teams, financial firms, and other prospective users of private execution and settlement infrastructure. Zeko will seek to select the first Canton reference participant during Milestone 1. If participant timing extends beyond that gate, implementation proceeds against the reference configuration and participant confirmation becomes a Milestone 3 acceptance requirement. Where confidentiality prevents public naming, Zeko will identify the participant privately to the champion or committee.

# 10. Post-Grant Operation And Sustainability

Zeko Labs will maintain the public packages, schemas, verifier interface, adapter, CLI, Docker templates, fixtures, and documentation. Zeko will operate one initial verifier and support onboarding of independent operators.

The open-source packages and interfaces do not require a per-use fee. CC-denominated fees apply only where an operator provides managed verifier operation, lane operation, monitoring, support, or related production services. Lane-level fees will be designed to cover operating costs plus a reasonable operator margin without recurring Development Fund support.

# 11. Funding

**Base request:** 6,000,000 CC for Milestones 1-3.  
**Optional extension:** up to 4,000,000 CC for Milestone 4.  
**Maximum:** 10,000,000 CC.

| Milestone | Funding | Acceptance gate |
|---|---:|---|
| 1. Detailed design and adopter configuration | 1,500,000 CC | Design, threat model, participant workflow mapping or documented fallback, and architecture acceptance |
| 2. Proof, schema, and local fixture | 1,500,000 CC | Schemas, vectors, proof fixture, Daml prototypes, and verifier prototype |
| 3. Canton testnet reference lane | 3,000,000 CC | Testnet implementation, external operation, adoption criteria, runbooks, and report |
| 4. Optional hardening, adoption, and mainnet path | Up to 4,000,000 CC | Committee-approved extension, security acceptance, operators, and mainnet deployment and readiness |

The base 6,000,000 CC grant delivers the accepted design, proof and schema fixtures, Canton packages, verifier and adapter infrastructure, and testnet reference lane. The optional extension funds production hardening, additional configurations and operators, ecosystem adoption, and the first approved mainnet lane.

# 12. Security Scope And Risks

Zeko's existing protocol is audited and mainnet-live. The new security scope is the Canton-specific proof schema, Daml packages, verifier, adapter, encodings, deployment, and operating controls.

- **Verifier collusion:** consortium-authorized registry control, diverse quorum, replay, bounded escrow, rotation, removal, pause, and logs.
- **Operator censorship or outage:** exact Canton-anchored set, cutoff rules, carry-forward/expiry, timeout recovery, and gross-settlement fallback.
- **Encoding ambiguity:** versioned schemas and cross-language test vectors.
- **Source-data falsity:** explicit separation between authenticated provenance and proven computation.
- **Missing data availability:** retention requirements, monitoring, recovery tests, and fail-closed settlement.
- **Circuit or key upgrades:** version registration, authorized activation, compatibility rules, and pause.
- **Scope expansion:** one funded consortium implementation; other applications remain extensions.

# 13. References

- Zeko: https://zeko.io
- Zeko documentation: https://docs.zeko.io
- Zeko GitHub: https://github.com/zeko-labs
- Zeko Ethereum settlement implementation: https://github.com/zeko-labs/ethereum-settlement
- Zeko Ethereum settlement litepaper: https://zeko.io/ethereumlitepaper.pdf
- Canton Network: https://www.canton.network
- Canton documentation: https://docs.canton.network
- Canton Development Fund roadmap and RFPs: https://github.com/canton-foundation/canton-dev-fund/blob/main/2026-2028-strategic-roadmap.md
