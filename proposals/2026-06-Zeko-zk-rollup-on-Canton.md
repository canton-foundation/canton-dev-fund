# Zeko ZK Rollup Settlement for Canton

**Authors:** Zeko Labs  
**Zeko:** https://zeko.io  
**Zeko GitHub:** https://github.com/zeko-labs  
**Zeko Docs:** https://docs.zeko.io  
**Status:** Draft for Canton Development Fund submission  
**Created:** 2026-06-11  
**Champion:** Sina Nader, Digital Asset  
**Primary SIGs:** Canton Protocol & Multi-Synchronizer; Financial Workflows & Composability; dApp Integration; Canton APIs  
**Additional review requested:** Security group

# Abstract

Canton gets a full-stack sovereign ZK rollup framework for private, end-to-end verifiable enterprise applications and workflows, all settling natively to Canton. Private ZK applications, custom sovereign enterprise rollups, AI-agent workflows, private markets, and institutional RWA logic can execute on Zeko, prove their state transitions, and settle verified receipts onto Canton without exposing private computation or forcing Canton validators to run ZK application logic. Canton Coin (CC) is the default utility and gas/payment token for Canton-integrated Zeko rollup lanes.

This grant produces public, open-source Canton ecosystem infrastructure. The Daml packages, verifier interface, adapter, CLI, Docker deployment path, schemas, test fixtures, and reference scenarios will be reusable by Canton builders, institutions, application teams, and additional ZK integrations.

Zeko is a fully audited, mainnet-live ZK rollup protocol. Zeko requests a focused 3-6 month Development Fund grant to make Canton the first-class institutional settlement home for Zeko's proof-settlement pipeline: turning Zeko's SP1/Groth16 proof path into Canton-governed settlement receipts for institutional assets and workflows.

Zeko's existing settlement work already advances the proof path from Zeko rollup proof material through SP1 into a compact Groth16 artifact. This grant brings that path to Canton as a deployable settlement kit: institutional-ready, verifier-attested Groth16 settlement; Daml receipt packages; verifier registry and quorum rules; canonical public-input schemas; hash-domain test vectors; Ledger API adapter and CLI; 1-click Docker deployment; reference scenarios for Canton assets and workflows; and a first approved mainnet settlement lane path. Every accepted receipt is strongly bound across proof hash, public inputs, prior and next state roots, verifier keys, canonical receipt digests, and Daml settlement state. Groth16 verification runs in a deterministic verifier layer; Daml governs registered verifier attestations, root progression, asset custody, settlement claims, stakeholder visibility, and auditability.

The core Canton pipeline is:

1. Zeko executes private, high-throughput, or proof-heavy application activity in a sovereign rollup lane.
2. Zeko proves the resulting state transition using its recursive proof stack.
3. The Zeko proof is verified inside SP1 and wrapped as a Groth16 proof.
4. A deterministic Zeko-Canton verifier service verifies the Groth16 proof and emits a signed verification certificate over the exact public inputs.
5. Canton records the proof hash, public-input digest, verifier certificate, prior root, next root, nullifier root, asset root, data-availability commitment, and settlement instruction root in Daml.
6. Daml contracts enforce root progression, verifier authorization, asset custody, one-time settlement receipts, and stakeholder approval.

An accepted batch becomes a Canton-native settlement receipt for a verified Zeko rollup transition: Canton records the proof hash, public inputs, verifier attestations, and state-root update, then Daml uses that receipt to release or update Canton assets and advance the relevant Canton workflow.

This opens a general ZK application layer for Canton: TypeScript/o1js contracts, recursive proof composition, private inputs, proof-carrying appchains, custom sovereign rollups, and modular privacy at the infrastructure, application, and user levels. Canton remains the regulated asset, identity, workflow, and settlement layer. Zeko compresses private application computation into verified receipts for workloads that are too high-volume, too privacy-sensitive, or too computationally specialized to run directly inside ordinary Canton application workflows.

# Specification

## 1. Scope

The funded 3-6 month scope is the Canton settlement pipeline.

In scope:

- Canton Daml packages for Zeko rollup registration, asset escrow, batch receipt registration, verifier governance, disclosure policy, and settlement claims.
- Canonical public-input schema for Zeko-to-Canton settlement certificates.
- Deterministic verifier service that verifies Groth16 proofs produced from the Zeko/SP1 pipeline and signs Canton-readable verification certificates.
- Canton Ledger API adapter and CLI for submitting verified Zeko batch receipts onto Canton.
- 1-click Docker deployment path for a local Zeko rollup lane, verifier service, Canton adapter, and demo settlement workflow.
- Local, testnet, and mainnet-ready demos for root advancement, asset escrow/release, proof-backed compliance receipts, AI-agent native coordination and payment protocols, private market receipts, and RWA/TAP settlement receipts.
- First Canton mainnet settlement lane deployment, subject to proposal review, security acceptance, configured verifier operators, and committee-approved timing.
- Public open-source reference infrastructure that other Canton ecosystem teams can inspect, fork, operate, extend, and adapt for future proof-carrying applications.
- Threat model, failure-mode tests, replay tests, root mismatch tests, verifier-key rotation tests, and operator runbooks.

Out of scope for this grant:

- Rebuilding the Zeko base protocol.

The design has a clear boundary: Daml enforces Canton state, Canton parties authorize Daml choices and asset or workflow updates, and Zeko proofs attest to off-ledger rollup computation.

## 2. Why Canton

Canton is the right settlement layer for this work because its architecture already separates privacy, stakeholder validation, and synchronization:

- Canton transaction privacy is based on entitled views: only the relevant parties and validators receive the transaction data they are entitled to see.
- Synchronizers order and mediate encrypted transaction views without seeing transaction contents.
- Validators process transactions for their hosted parties through the Ledger API and store only the contract data relevant to those parties.
- Canton uses an extended UTXO model where contracts are created, archived, and composed atomically.
- Canton supports multiple synchronizers, including private synchronizers for regulated or high-throughput workflows, while still allowing interaction with the Global Synchronizer.

Zeko extends those strengths. Canton controls regulated asset state and institutional workflow state. Zeko compresses private computation into proof receipts. Together, they give Canton verifiable private computation, batch compression, and proof-backed application settlement without expanding Canton validators into ZK application runtimes.

## 3. What Zeko Represents To Canton

Zeko is a ZK rollup and proof-carrying execution domain for Canton. It is not a replacement synchronizer, not a competing ledger for Canton assets, and not a general-purpose off-chain oracle.

Zeko gives Canton:

- **ZK coprocessor:** Zeko proves computation that is too expensive, private, or high-volume for ordinary Canton transaction execution.
- **Sovereign rollup infrastructure:** Institutions can run private, permissioned Zeko lanes with controlled operators, scoped data availability, modular privacy, and Canton settlement.
- **Private batch domain:** Zeko accumulates private actions, order flow, agent receipts, compliance events, and RWA lifecycle events, then exposes only the public inputs Canton needs.
- **Settlement receipt layer:** Zeko produces state roots, nullifier roots, asset roots, policy roots, data-availability commitments, and settlement instruction roots that Canton can record and govern.
- **CC-native rollup economy:** Canton Coin is the default utility and gas/payment token for Canton-integrated Zeko lanes, aligning rollup usage with Canton-native network value.
- **Developer expansion layer:** Builders can use TypeScript/o1js for private ZK application logic while settling institutional assets and workflows on Canton.

## 4. Architecture

The architecture has four layers.

### Layer A: Canton Settlement Layer

Canton holds the regulated asset contracts, institutional parties, approval workflows, and final settlement state.

The Daml package set will define:

- `ZekoRollupRegistry`: registers each Zeko lane, operator set, verifier set, verifier quorum, SP1 program verification key identifier, Zeko verification-key hash, circuit hash, disclosure policy, and supported asset scopes.
- `ZekoRollupState`: records the current accepted Zeko state root, action state, asset root, nullifier root, policy root, latest batch number, and data-availability policy for a registered lane.
- `ZekoAssetEscrow`: locks or binds Canton assets for use inside a Zeko lane. Signatories, observers, and choice controllers are assigned according to the Canton asset workflow.
- `ZekoBatchCertificate`: records a verified Zeko batch receipt, including proof hash, public-input digest, prior root, next root, action state, asset root, nullifier root, settlement instruction root, DA commitment, circuit hash, verifier key identifiers, and verifier attestations.
- `ZekoVerifierAttestation`: represents a verifier-party assertion, and optionally an attached signature payload, that a specific Groth16 proof was verified against a specific registered SP1 program key identifier and public-input schema.
- `ZekoSettlementClaim`: releases, updates, or composes Canton-side state after the batch certificate has been accepted and the claim has not already been used.
- `ZekoDisclosurePolicy`: records the auditor visibility, retention requirements, jurisdictional constraints, and selective-disclosure commitments attached to a lane or batch.

The active `ZekoRollupState` contract is consumed and recreated through a Daml choice on every accepted batch. This matches Canton's eUTXO model and gives Daml a clear state-transition boundary: the prior root must equal the current accepted root, and the next root becomes the new accepted root only after verifier attestations and Daml authorization checks pass.

### Layer B: Zeko Execution Layer

Zeko executes the private application logic.

Relevant Zeko primitives:

- zkApp account state.
- Account updates with preconditions, permissions, and authorization.
- Action state as an ordered Poseidon commitment to emitted actions.
- Recursive Kimchi/Pickles proof composition.
- Sequencer batching.
- Archive and data-availability paths for replay and audit.
- Client-side or server-side proving depending on the application privacy and UX requirements.

For Canton, Zeko lanes support:

- AI-agent native coordination, payment receipts, and budget state.
- Private order books and RFQ state.
- Private prediction-market or oracle-linked state.
- Tokenized Asset Protocol policy state.
- RWA issuance, eligibility, transfer-control, reserve, and lifecycle state.
- Sovereign institutional rollups with scoped operators and data availability.

### Layer C: SP1/Groth16 Proof Layer

Zeko's existing settlement engineering verifies Zeko rollup proof material inside SP1 and emits a Groth16 proof. Zeko has already begun building and proving this external-settlement path in [zeko-labs/ethereum-settlement](https://github.com/zeko-labs/ethereum-settlement). That repository is prior implementation work showing the reusable SP1/Groth16 mechanics. The [Zeko Ethereum settlement litepaper](https://zeko.io/ethereumlitepaper.pdf) is prior technical roadmap context: Ethereum is the initial proof point for the external settlement path, and with this proposal Canton becomes the actual target deployment. This proposal brings the proof-wrapping pipeline to Canton as the first-class institutional settlement endpoint.

That prior implementation work demonstrates the key mechanics:

- SP1 reads Zeko rollup proof material, Zeko verification-key material, zkApp command data, and verifier index data.
- The program checks that the zkApp command and statement bind to the same account update.
- The program reconstructs verifier-index commitments and computes the Zeko verification-key hash.
- The program verifies the Kimchi proof.
- The program commits public settlement values such as `proofValid`, `vkHash`, `stateBefore`, `stateAfter`, and `actionStateBefore`.
- The settlement contract checks proof validity, verifier key hash, action state, current root, and root update semantics before advancing state.

For Canton, the same proof core becomes a versioned `ZekoBatchCertificate` schema. The current proof core already emits proof validity, Zeko verification-key hash, pre/post zkApp state, and prior action state. The Canton work binds those proof-emitted values to Canton settlement metadata and lane-specific commitments:

- Registry and versioning: `rollupId`, `batchNumber`, `sp1ProgramVKeyId`, `circuitHash`, `publicInputSchemaHash`
- Proof-bound rollup transition: `zekoVkHash`, `priorStateRoot`, `nextStateRoot`, `priorActionState`
- Canton lane commitments: `nextActionState`, `priorAssetRoot`, `nextAssetRoot`, `priorNullifierRoot`, `nextNullifierRoot`, `settlementInstructionRoot`, `daCommitment`, `policyRoot`

Hash-domain binding is part of the Canton design. The Ethereum proof point reconciles Zeko's Poseidon commitments with Ethereum's Keccak/SHA/KZG settlement surface. The Canton path uses versioned canonical byte encoding for each batch and settlement instruction, SHA-256 digests over those canonical bytes for Daml-visible identifiers, and the Zeko Poseidon commitments used inside the proof. The verifier service checks that the Groth16 public values, Poseidon commitments, Canton-visible digests, and `ZekoBatchCertificate` fields are all derived from the same canonical batch object. Daml records and compares the digest fields and enforces the state transition.

The Groth16 proof is the cryptographic proof artifact. The Canton Daml transaction records the proof hash, public inputs, and verifier certificate showing that the artifact verified under the registered verifier keys and schema.

### Layer D: Zeko-Canton Verifier And Adapter Layer

The Canton integration keeps Groth16 arithmetic in the verifier layer and keeps Canton settlement logic in Daml.

The Zeko-Canton verifier service does four deterministic jobs:

1. Load the registered SP1 program verification key, Zeko verification-key hash, circuit hash, public-input schema, and current Canton root state.
2. Verify the Groth16 proof and decode the committed public values.
3. Check root continuity, verifier-key binding, action-state binding, hash-domain binding, DA commitment binding, settlement-instruction-root binding, and application-specific invariants.
4. Emit a signed `ZekoVerifierAttestation` for the exact proof hash and public-input digest.

Canton then enforces the settlement rules:

- Validate Daml authorization.
- Confirm that verifier parties are registered and meet the quorum policy.
- Ensure the batch number and prior root match the active `ZekoRollupState`.
- Consume and recreate the rollup state contract with the next accepted root.
- Enforce asset escrow, settlement claim, and nullifier/receipt rules.
- Expose the right receipt views to signatories, observers, auditors, and regulators.

This is a proof-verified, reproducible settlement path. Institutions can run their own verifier service or require verifier attestations from a configured operator set. The proof artifact, public inputs, verifier version, canonical receipt digest, and Daml receipt remain available for audit and replay. The design is institutional-ready today through verifier attestations, quorum policy, strong receipt binding, and Canton-governed settlement state.

## 5. Settlement Flow

### Deposit Or Asset Binding

1. A Canton party exercises a choice on `ZekoAssetEscrow` to lock, bind, or authorize a Canton asset for use in a Zeko lane.
2. The escrow event produces a canonical deposit or scope commitment.
3. The adapter submits the commitment as a Zeko action.
4. Zeko includes the action in the lane's action state.
5. The next Zeko batch proof binds the action-state transition to the batch's state transition.

### Batch Acceptance

1. Zeko sequencer batches private actions and generates the Zeko proof.
2. SP1 verifies the Zeko proof material and produces a Groth16 proof with Canton-bound public inputs.
3. The Zeko-Canton verifier service verifies the Groth16 proof and signs a verifier attestation.
4. The adapter submits a Canton command exercising `AcceptBatch` on the active `ZekoRollupState`.
5. Daml checks verifier authorization, quorum, batch sequence, prior root, circuit hash, public-input digest, DA commitment, and settlement instruction root.
6. Daml archives the old `ZekoRollupState`, creates the new state contract, and creates a `ZekoBatchCertificate`.

### Settlement Claim

1. A claimant submits a `ZekoSettlementClaim` linked to an accepted batch certificate and settlement instruction.
2. The adapter supplies the claim digest, nullifier or receipt id, and required verifier/issuer/custodian authorization.
3. Daml rejects duplicate claims by consuming and recreating the relevant settlement state and recording the spent receipt/nullifier commitment.
4. Canton releases or updates the Canton-side asset state according to the Daml template rules.

### Audit And Replay

1. Canton stores the batch receipt, roots, proof hash, public-input digest, verifier attestations, and accepted asset or workflow updates.
2. Zeko archive/DA stores the private or encrypted rollup data required for entitled replay.
3. Auditors receive only the Daml views and Zeko disclosure packages they are entitled to under `ZekoDisclosurePolicy`.
4. Any authorized verifier can reproduce proof verification from the proof artifact and public inputs.

## 6. Core Invariants

The implementation must enforce these invariants.

### Proof Invariants

- A Canton batch certificate is accepted only if a registered verifier quorum attests to the exact Groth16 proof hash and public-input digest.
- The public-input schema is versioned and hash-bound.
- `zekoVkHash`, `sp1ProgramVKeyId`, and `circuitHash` must match the active registry entry.
- `priorStateRoot` must equal the active Canton `ZekoRollupState`.
- `nextStateRoot` becomes the active root only after Daml acceptance.

### Bridge And Asset Invariants

- Canton assets are represented in a Zeko lane only after Canton escrow, binding, or explicit authorization.
- Canton assets are released, updated, or composed only after a verified Zeko transition includes the corresponding settlement instruction.
- Each settlement claim has a one-time receipt or nullifier binding.
- Batch order is monotonic for each `rollupId`.
- Asset conservation is proven in the Zeko circuit and reflected in the Canton settlement instruction root.

### DA And Audit Invariants

- Every accepted batch binds to a DA commitment.
- The DA commitment identifies the encrypted or scoped data needed for replay, audit, and recovery.
- Private witnesses, order contents, prompts, model outputs, raw customer records, and compliance evidence are not posted to Canton unless an explicit disclosure policy requires it.
- Auditor access is represented as Daml observer visibility, separately disclosed Zeko audit packages, or both.

### Operational Invariants

- Verifier key rotation is explicit and versioned.
- Circuit upgrades cannot silently apply to existing rollup state.
- Emergency disablement pauses new batch acceptance without breaking already-accepted receipts.
- Recovery can proceed from the last accepted Canton root and DA commitments.

## 7. Canton Alignment

### Privacy

Canton provides sub-transaction privacy: parties see the views they are entitled to, validators process only the relevant views, and synchronizers see encrypted messages. Zeko adds proof privacy: Canton can accept a fact about private computation without receiving the computation's private inputs.

Together:

- Canton hides workflow data from uninvolved parties.
- Zeko hides private computation and batch internals from Canton.
- Daml controls who sees settlement receipts, asset updates, and audit disclosures.

### eUTXO Settlement

Canton contracts are immutable active contracts that are created and archived. The Zeko settlement design maps cleanly to that model: each accepted Zeko batch consumes the prior `ZekoRollupState` and creates the next one. Asset escrow and settlement claims are also represented as explicit Daml state transitions.

### Multi-Synchronizer And Institutional Deployment

Canton supports multiple synchronizers for isolation, performance, regulatory constraints, governance, and cost. Zeko's sovereign rollup lanes pair naturally with this model. A bank, market operator, or consortium can run a private Zeko lane for confidential execution and settle selected roots and receipts onto Canton using a private synchronizer, the Global Synchronizer, or a cross-synchronizer workflow depending on the asset and policy requirements.

### External Parties And Institutional Keys

Canton supports external parties that retain their own signing keys. That matters for verifier operators, custodians, issuers, agent operators, auditors, and regulated market participants. The Zeko-Canton integration can use Canton party authorization rather than bespoke off-ledger authorization for settlement acceptance and claim approval.

## 8. Reference Use Cases

### AI-Agent Native Coordination And Payment Protocols

Zeko's agent infrastructure already models paid work, budgets, approvals, output commitments, capability registration, worker leases, receipts, and settlement modes. On Canton, these become proof-backed work receipts, budget-bound agent actions, private prompt/output handling, and Daml approval workflows for institutional agents that touch real assets.

### Private Order Book And RFQ

Zeko private order book infrastructure supports wallet-signed order authorization, private notes/intents, off-chain matching, and proof-backed settlement anchoring. On Canton, this becomes a private RFQ/order-book lane where strategy and order flow remain private while Canton settles the asset transfers and audit receipts.

### Private Prediction Markets And Oracle-Linked Risk

Zeko private prediction-market work already uses private bet intent, wallet-signed orders, oracle/zkTLS-style event data, and rolling settlement. On Canton, this maps to private forecasting, event-linked risk transfer, internal market signals, and proof-backed structured-product workflows.

### Tokenized Asset Protocol And RWA

Zeko's tokenized asset protocol work is directly relevant to Canton. It supports private, permissioned asset workflows with policy-linked proofs, settlement-time policy guards, source-system adapters, issuer workflows, and sovereign-rollup deployment patterns.

On Canton, tokenized asset flows can bind issuance approvals, investor or counterparty eligibility, transfer restrictions, reserve or collateral facts, custody/fund-administrator evidence, and lifecycle events such as mint, transfer, corporate action, redemption, burn, and audit.

This positions Zeko and Canton as research and implementation partners for private, permissioned, institutional RWA systems.

### Proof-Backed Compliance Packages

An institution can generate a scoped compliance package off-ledger, prove that it satisfies policy, and register a Canton receipt for entitled auditors. The raw evidence remains in scoped storage or Zeko DA. Canton records the receipt, disclosure rights, and resulting asset or workflow update.

## 9. Deliverables

This is a 3-6 month funded effort with monthly updates and an end-of-phase report. Delivery begins after proposal acceptance, with a Q3/Q4 2026 target based on review timing and committee-approved scope.

### Phase 1: Settlement Specification And Local Proof Fixture

**Focus:** Lock the Canton settlement design and prove the proof-to-receipt path locally.

Deliverables:

- Versioned Canton settlement schema for Zeko batch certificates, including canonical public inputs, hash-domain binding, and verifier attestation format.
- Daml package prototypes for rollup registration, state progression, verifier governance, batch receipts, asset escrow/claims, and disclosure policy.
- Deterministic verifier service prototype that verifies SP1/Groth16 proof artifacts and emits Canton-readable attestations.
- Canton-first local fixture and test vectors derived from the existing Zeko/SP1 proof-wrapping implementation.
- 1-click local Docker workflow that runs a Zeko rollup lane, verifier service, Canton adapter, and demo settlement path.
- End-to-end local demo for proof-backed root advancement and a representative Canton asset or workflow settlement claim.
- Phase 1 threat model and failure-mode test plan covering verifier authorization, replay, stale roots, duplicate claims, DA binding, and circuit/key upgrades.

### Phase 2: Testnet/Mainnet Adapter And Reference Scenarios

**Focus:** Move from local fixture to testnet/mainnet-ready infrastructure, reference scenarios, and the first approved Canton mainnet settlement lane path.

Deliverables:

- Canton Ledger API adapter and CLI for lane registration, receipt submission, receipt inspection, and settlement claims.
- Testnet/mainnet-ready deployment package for the Zeko-Canton verifier service and rollup lane, including configuration, verifier-operator setup, key-material handling, runbooks, pause/rollback procedure, and acceptance checklist.
- Negative-test suite for the core settlement invariants: proof validity, verifier/key authorization, schema binding, root progression, DA binding, canonical digest consistency, replay resistance, and one-time settlement claims.
- Reference scenarios covering private payment/netting or asset escrow, proof-backed compliance/RWA, and AI-agent or private-market receipts, with at least one runnable end-to-end lane and additional implementation blueprints.
- First approved Canton mainnet settlement lane path, subject to proposal review, security acceptance, configured verifier operators, and committee-approved timing.
- Documentation for Canton builders, Daml developers, verifier operators, and institutional reviewers.

### Follow-On Phase: Hardening And Production Readiness

The initial proposal is intentionally 3-6 months. A separate follow-on proposal would cover:

- External audit of Daml packages, verifier service, and adapter.
- Production verifier-operator governance.
- Managed explorer/indexer for Zeko-Canton receipts.
- Broader enterprise pilots.
- Additional mainnet deployments beyond the first approved settlement lane.
- Additional use-case circuits and disclosure-policy packages.

## 10. Acceptance Criteria

### Protocol And Architecture

- Public-input schema and Daml package API are published and versioned.
- Verifier attestation format is deterministic and reproducible.
- Proof hash, public-input digest, verifier key, circuit hash, DA commitment, and root transition are all bound in the accepted Canton receipt.
- Canonical encoding and hash-domain test vectors show that Poseidon commitments, Groth16 public values, Canton-visible SHA-256 digests, and Daml certificate fields are derived from the same canonical batch object.
- Groth16 verification is handled in the verifier layer; Daml validates the accepted receipt, registered verifier attestations, and Canton state transition.

### Functional Correctness

- End-to-end local flow accepts a valid Groth16 proof and advances a Canton `ZekoRollupState`.
- Invalid proofs, mismatched verifier keys, mismatched schemas, stale roots, or inconsistent canonical digests cannot produce an accepted Canton receipt.
- Duplicate settlement receipts, replayed batches, and already-used settlement claims are rejected.
- Unauthorized verifier party cannot satisfy the registry quorum.
- Asset release cannot occur without an accepted batch certificate and valid settlement claim.

### Security

- Zeko protocol mainnet/audit status is documented for reviewers.
- New security scope is limited to Canton Daml packages, verifier service, public-input schema, adapter, fixtures, and operational controls.
- Threat model is published in Phase 1 and covers verifier operators, DA, replay, root mismatch, stale roots, duplicate claims, unauthorized verifiers, key/circuit upgrades, and emergency pause.
- Key rotation, circuit upgrade, verifier removal, and emergency pause flows are documented.

### Developer And Operator Experience

- CLI can register a rollup, submit a batch certificate, inspect a receipt, and submit a settlement claim.
- 1-click Docker deployment can launch the local Zeko-Canton rollup stack, verifier service, adapter, and demo settlement workflow.
- Mainnet deployment package includes verifier-operator configuration, key material handling, pause/rollback procedure, and acceptance checklist for the first approved Canton mainnet settlement lane.
- Documentation explains the full proof path from Zeko proof to SP1/Groth16 proof to Canton Daml receipt.
- Reference scenarios are documented, with at least one runnable end-to-end lane and additional scenarios as implementation blueprints.
- Canton developers can run the local demo without needing to understand Zeko internals.

## 11. Funding

**Funding request:** 6,000,000 CC for the base 3-month Canton final-mile delivery, with a committee-approved extension of up to 4,000,000 CC if the scope proceeds through the full 6-month hardening, reference scenarios, ecosystem growth support, and first approved mainnet settlement lane path. Maximum request: 10,000,000 CC.

**Term:** Initial 3 months for specification, local fixture, Daml packages, verifier service, and adapter. Extension to 6 months covers broader hardening, reference scenarios, ecosystem growth support for new Canton app deployments and adoption, testnet/mainnet-ready documentation, and the first approved Canton mainnet settlement lane path, subject to committee-approved scope and timing.

**Payment schedule:** Milestone-based disbursements:

- 1,500,000 CC on proposal acceptance and Phase 1 start.
- 1,500,000 CC on Phase 1 acceptance.
- 3,000,000 CC on Phase 2 acceptance, including the testnet/mainnet-ready deployment path, reference-scenario materials, and initial ecosystem adoption package for new app deployments.
- Up to 4,000,000 CC for committee-approved full-term extension, hardening, additional reference scenarios, ecosystem growth support, first approved mainnet settlement lane path, and production readiness.

**Budget rationale:** This is shared ecosystem infrastructure. The work spans ZK engineering, Daml engineering, public-input/circuit binding, verifier service implementation, test fixtures, negative tests, documentation, institutional use-case design, and ecosystem adoption support.

**Indicative allocation:**

- 45% proof, verifier, and public-input engineering.
- 25% Daml packages and Canton Ledger API adapter.
- 10% security modeling, negative tests, and reliability.
- 10% documentation, CLI, and developer tooling.
- 10% reference scenarios, ecosystem growth, and adoption support.

**Open-source commitment:** Daml packages, verifier reference implementation, adapter, CLI, Docker deployment templates, schemas, test harnesses, documentation, and reference examples will be open-sourced under Apache-2.0 or another permissive license approved in the proposal repository. The result is reusable public infrastructure for the Canton ecosystem. Private keys, partner configurations, and security-sensitive deployment secrets are excluded.

## 12. Co-Marketing And Research Partnership

Zeko will work with the Canton ecosystem on:

- Technical writeups on Groth16 proof settlement onto Canton.
- Developer workshops for Daml, TypeScript, o1js, verifier operators, and institutional builders.
- Reference demos for AI-agent native coordination and payment protocols, private markets, proof-backed compliance, and RWA settlement.
- Ecosystem growth support for Canton teams building new Zeko-backed app deployments, including technical onboarding, reference integrations, and adoption materials.
- Research with Canton stakeholders on sovereign rollups, modular privacy, verifier governance, and proof-backed enterprise workflows.

Zeko will be an active research partner for Canton on enterprise-grade private and permissioned systems.

## 13. Motivation

Canton already solves a hard problem: institutional privacy with composable multi-party workflows. It does this through entitled transaction views, stakeholder validation, encrypted synchronization, and Daml authorization.

Zeko targets workloads that benefit from private proof-carrying execution before Canton settlement:

- High-frequency private matching and netting.
- Agent receipts and budget updates.
- RWA compliance and eligibility computation.
- Private forecasting and oracle-linked event logic.
- Large policy checks over private evidence.
- Proof-backed analytics over tokenized assets.

These workloads need computation, privacy, and compression before they reach Canton. Zeko supplies that layer. Canton remains the system of record.

The result is a new institutional architecture:

- Zeko performs private proof-carrying execution.
- SP1/Groth16 makes the proof artifact compact and externally verifiable.
- Canton records the verified settlement receipt and executes the regulated asset or workflow update.

## 14. Risks And Mitigations

### Risk: Verifier Operators Become Too Trusted

**Mitigation:** Verification is deterministic, proof artifacts are retained, public inputs are hash-bound, verifier keys are registered in Daml, and institutions can run their own verifier service or require a quorum of registered verifiers.

### Risk: Public-Input Encoding Is Ambiguous

**Mitigation:** The schema is versioned, hash-bound, test-vectored, and included in every accepted `ZekoBatchCertificate`.

### Risk: DA Is Missing Or Insufficient For Audit

**Mitigation:** Every batch binds to a DA commitment and disclosure policy. Batches without required DA metadata are rejected by the adapter and verifier policy.

### Risk: Replay Or Duplicate Claims

**Mitigation:** Batch numbers, prior roots, receipt ids, nullifier roots, and Daml state transitions make settlement claims one-time-use.

### Risk: Scope Expands Into Too Many Apps

**Mitigation:** The funded work is the settlement layer plus bounded reference scenarios, with at least one runnable end-to-end lane. Additional app-specific circuits and enterprise pilots belong in follow-on work.

## 15. Notes For Reviewers

This proposal advances Canton's multi-runtime strategy through a distinct proof-native settlement lane for custom sovereign enterprise rollups, private rollup execution, recursive proof aggregation, Groth16 proof verification, and Canton-native Daml settlement receipts.

Zeko remains the external proof execution domain; Canton remains the institutional settlement layer. The proposal makes verified Zeko state transitions first-class Canton receipts.

Canton settlement uses Daml state and registered verifier attestations over Groth16 proof artifacts. Daml records and governs the accepted receipt; the verifier layer checks the proof. Canton enforces authorization, stakeholder visibility, contract lifecycle, asset custody, settlement finality, and auditability.

Zeko brings audited mainnet protocol infrastructure, recursive ZK execution, sovereign rollup deployment, o1js developer tooling, modular privacy, and a working SP1/Groth16 proof-wrapping pipeline. Canton becomes the institutional final-mile settlement layer for those proofs.

# References

- Canton Development Fund repository: https://github.com/canton-foundation/canton-dev-fund
- Canton Development Fund review process: https://github.com/canton-foundation/canton-dev-fund/blob/main/Development%20Fund%20Proposal%20Review%20Process.md
- Canton Network: https://www.canton.network/
- Canton documentation: https://docs.canton.network/
- Zeko: https://zeko.io
- Zeko GitHub organization: https://github.com/zeko-labs
- Zeko developer docs: https://docs.zeko.io/
- Zeko SP1-Groth16 proof wrapping engineering: https://github.com/zeko-labs/ethereum-settlement
- Zeko Ethereum settlement technical roadmap: https://zeko.io/ethereumlitepaper.pdf
- o1js docs: https://docs.o1labs.org/o1js/
