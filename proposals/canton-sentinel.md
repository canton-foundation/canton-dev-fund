# Proposal: Canton Sentinel, The Agentic Intent Layer

**Author:** Raju kumar  
**Status:** submitted  
**Created:** 2026-04-06  
**Contact:** mokamehraju@gmail.com  

***
## Abstract

Canton Sentinel is a privacy-preserving, open-source middleware layer for the Canton Network. It combines **Daml Smart Contracts**, a **Multi-Agent AI Orchestration** system, and an **off-chain Zero-Knowledge Proof (ZK) attestation** layer to solve a fundamental usability paradox: Canton's sub-transaction privacy model protects institutional data sovereignty, but that same privacy creates friction for participants who want to discover liquidity, execute complex cross-node financial workflows, and verify that autonomous agents faithfully followed their instructions, all without exposing confidential positions.

Sentinel delivers three open, reusable infrastructure components for the Canton ecosystem:

1. **Daml Intent Templates**: A library of parameterized Daml choices that encode natural-language financial intents (e.g., "Buy $1M of Gold if spread < 0.5%") as typed, enforceable contract choices.
2. **Multi-Agent Orchestration Layer**: Three specialized, canton-native agents (Scout, Compliance, Settlement) that discover liquidity, validate trades against KYC/AML policy, and execute atomic swaps, each operating strictly within Canton's party-based access control model.
3. **ZK Execution Attestation Layer**: An off-chain ZK-SNARK prover (built on circom + snarkjs) that generates cryptographic proofs of correct agent behavior, anchored on-ledger via a Daml `ZKProofAttestation` contract. This is computed entirely off-chain and delivered to the ledger following the same oracle attestation pattern established in the ecosystem.

All grant-funded components will be published as open-source (Apache 2.0) and designed as reusable primitives for any Canton participant or application developer.

***
## Specification

### 1. Objective

**The Core Problem**

Canton's sub-transaction privacy is its defining institutional advantage. However, it creates three concrete operational bottlenecks:

| Problem | Description | Impact |
| :--- | :--- | :--- |
| **Liquidity Opacity** | Participants cannot query liquidity on other nodes without explicit `Observer` rights; there is no shared discovery protocol. | Large RWA and tokenized-asset trades require time-consuming bilateral negotiations instead of automated matching. |
| **Intent-to-Execution Gap** | Translating a business goal ("buy X at Y price if Z condition") into valid Daml choices and **gRPC Ledger API** commands requires Daml expertise that most institutional users lack. | Entry barrier excludes non-technical participants; slows time-to-trade. |
| **Autonomous Agent Trust Deficit** | When AI agents execute on behalf of institutions, there is no cryptographic guarantee the agent followed the user's declared constraints. Standard AI "compliance" is auditable only via opaque logs. | Institutions cannot delegate execution to agents without legal and operational risk. |

**The Intended Outcome**

Canton Sentinel produces a complete, open-source solution to all three problems, one that works *with* Canton's privacy model rather than circumventing it. The outcome is a verifiable, composable intent execution layer that any application developer, prime broker, or institutional participant can build on.

***
### 2. Implementation Mechanics

#### 2.1 Architecture Overview

Sentinel is a **three-tier off-chain/on-chain system** that mirrors the oracle architecture pattern already established in the Canton ecosystem:

```
┌─────────────────────────────────────────────────────────────────┐
│ TIER 1 | INTENT LAYER (Off-Chain, Node.js / OpenAI SDK)         │
│ NL → structured Daml choice descriptor (JSON)                   │
└───────────────────────────┬─────────────────────────────────────┘
                            │ Intent Descriptor
┌───────────────────────────▼─────────────────────────────────────┐
│ TIER 2 | MULTI-AGENT LAYER (Off-Chain Orchestration)            │
│ Scout, Compliance, Settlement agents                            │
│ Canton Ledger API; party-scoped permissions                     │
└───────────────────────────┬─────────────────────────────────────┘
                            │ Signed execution + ZK proof
┌───────────────────────────▼─────────────────────────────────────┐
│ TIER 3 | DAML CONTRACT LAYER (Canton Network, on-ledger)        │
│ IntentOffer, PendingMatch, AtomicSettlement, ZKProofAttestation │
└─────────────────────────────────────────────────────────────────┘
```

#### 2.2 Tier 1: Natural Language Intent Parsing

A fine-tuned LLM (OpenAI GPT-4o / open-source alternative) translates plain-English commands into a typed **Intent Descriptor**: a structured JSON object defining:

* `asset_pair`, `direction`, `quantity`
* `price_constraint` (type, bound, tolerance)
* `compliance_level` (KYC tier, jurisdiction)
* `expiry`, `slippage_tolerance`
* `fallback_strategy`

The Intent Descriptor is validated against a JSON Schema and then submitted to Tier 2. No natural language is ever written to the Canton ledger; only validated, typed parameters reach the smart contract layer.

**Fine-tuning approach:** The model will be trained on a corpus of **synthetic** Daml Choice invocations plus **sanitized or anonymized** real invocation patterns (no confidential counterparty or position data), allowing it to map informal intent descriptions to known Canton contract APIs. The training pipeline will be open-sourced as part of Milestone 1.

#### 2.3 Tier 2: Multi-Agent Orchestration

The orchestration layer consists of three **sequentially-chained, independent agents** operating via Canton's Ledger API. Each agent is scoped to its minimum required Canton party permissions; a key security property.

**Agent A: The Scout Agent**

*Purpose:* Discover available liquidity across Canton nodes without accessing confidential data.

*Mechanism:*
* Queries Canton nodes on which the requesting party holds `Observer` rights (granted explicitly by counterparties).
* Uses Canton's `Disclosure` mechanism (analogous to the PoLi Oracle's Orchestrator disclosure pattern) to read publicly offered intent contracts.
* Does not see or store private position data from other parties' contracts.
* Returns a ranked list of matched offers to the Compliance Agent.

*Canton Integration:* Uses `queryContractFilter` on the Ledger API, filtered to `IntentOffer` contract templates. The Scout never creates or archives contracts; it is read-only.

**Agent B: The Compliance Agent (Policy-as-Code)**

*Purpose:* Validate a proposed match against KYC/AML and sanctions requirements before settlement.

*Mechanism:*
* Receives the ranked match list from the Scout Agent.
* For each proposed counterparty, performs:
  1. KYC tier check (against an on-chain `ComplianceCertificate` Daml contract).
  2. Sanctions screening (off-chain, against a periodically updated OFAC/EU/UN consolidated list).
  3. Jurisdiction eligibility check (against a static policy configuration file).
* Produces a `ComplianceVerdict` struct (approved / rejected + reason code).
* All compliance logic is executed off-chain; only the verdict (and its ZK proof, under **Milestone 4**) is written to the ledger.

*Canton Integration:* Reads `ComplianceCertificate` contracts via Ledger API using stakeholder rights. Compliance rules are encoded as a deterministic Node.js policy module (testable, auditable, open-source).

**Agent C: The Settlement Agent**

*Purpose:* Execute the atomic swap on-chain upon Compliance Agent approval.

*Mechanism:*
* Materializes the bilateral workflow on Canton via `PendingMatch` (staging) and `AtomicSettlement` (DvP), encoding the agreed trade parameters.
* Exercises the `AcceptAndSettle` choice on `AtomicSettlement`, triggering a Canton atomic swap (Delivery vs. Payment pattern).
* Upon confirmation, submits the `ZKProofAttestation` contract with the execution proof hash (**Milestone 4**).

*Canton Integration:* Uses `submitAndWait` via Ledger API. Signatory / controller layout follows the shipped templates (e.g. settlement agent and counterparty roles on `PendingMatch` / `AtomicSettlement` as specified in the Daml package). Counterparty is the `controller` on `AcceptAndSettle` where that choice is defined.

#### 2.4 Tier 3: Daml Contract Layer

The following Daml templates will be developed and open-sourced as part of this project:

**`IntentOffer`**: A publicly-disclosable offer contract. An institution creates one to signal willingness to trade (without revealing position size). Other parties can submit `IntentRequest` choices against it.

*Illustrative Daml fragment below; shipping templates use valid, compilable Daml and complete `PendingMatch` fields.*

```daml
template IntentOffer
  with
    offeror       : Party
    assetPair     : Text
    direction     : Direction   -- Buy | Sell
    priceRange    : PriceRange  -- (minPrice, maxPrice)
    expiresAt     : Time
    complianceReq : ComplianceLevel
  where
    signatory offeror
    -- No observer defined; disclosed via Canton's disclosure mechanism
    -- so counterparties can see public fields without being stakeholders.
    choice IntentRequest : ContractId PendingMatch
      with requester : Party; offeredPrice : Decimal
      controller requester
      do
        now <- getTime
        assertMsg "Offer expired" (now < expiresAt)
        create PendingMatch with ..  -- completed in the open-source package
```

**`PendingMatch`**: A bilateral staging contract that holds both parties' agreed parameters until the Compliance Agent approves.

**`AtomicSettlement`**: The final DvP contract. Exercises Canton's built-in atomic asset transfer between the two parties' ledger accounts.

**`ZKProofAttestation`**: Anchors the ZK execution proof on-chain (see Section 2.5).

**`ComplianceCertificate`**: Issued by a regulated Compliance Officer party. Certifies that a Canton party has passed KYC at a specified tier. Referenced by the Compliance Agent at runtime.

#### 2.5 The ZK Execution Attestation Layer

> **Important Note on Canton's Privacy Model and ZK Proofs**
>
> Canton's sub-transaction privacy is a protocol-native mechanism that already provides strong data confidentiality guarantees: participants see only the contracts in which they are stakeholders. Canton's core team has publicly noted that ZK proofs add significant complexity when the underlying privacy model is already cryptographically sound.
>
> Sentinel's ZK layer is therefore designed as an **additive, optional attestation mechanism**; not a replacement for Canton's privacy. It solves a specific problem that Canton's native privacy does not address: **proving to an external auditor or regulator that an autonomous AI agent correctly followed the user's declared constraints**, without revealing the private data the agent accessed during its search. This is a compliance and audit use case, not a privacy use case.

##### Does Canton Have a ZK Library?

**No.** As of April 2026, Canton (Daml) does not include a native ZK-SNARK library. The Canton 3.4 release introduced cryptographic primitives (`keccak256`, `secp256k1`, SHA-256 signature verification), but these are hashing and signature tools, not ZK proof systems. Canton's architecture and philosophy favor sub-transaction privacy over ZK proofs for the core ledger layer.

This means the Sentinel ZK layer must be built entirely off-chain and integrated via the same **off-chain-compute to on-ledger-attest** pattern used by Chainlink and the Stratalink PoLi Oracle on Canton.

##### Building the ZK-SNARK Library for Sentinel

The ZK layer will be built using **circom 2.0** (circuit description language) and **snarkjs v0.7.x** (JavaScript/WebAssembly proving engine), chosen because they are directly compatible with the project's Node.js stack, are production-grade, and are actively maintained (snarkjs v0.7.6, January 2026).

**Chosen Proving System: Groth16 (primary) + PLONK (secondary)**

| Protocol | Proof Size | Verification Speed | Trusted Setup | Recommended Use |
| :--- | :--- | :--- | :--- | :--- |
| **Groth16** | ~192 bytes (smallest) | Fastest (3 pairings) | Per-circuit (Powers of Tau + Phase 2) | On-chain anchoring (small, cheap) |
| **PLONK** | ~800 bytes | Fast (universal) | Universal (one ceremony for all circuits) | Development / complex circuits |
| **FFLONK** | ~300 bytes | Faster than PLONK | Universal | Optional Phase 3 upgrade |

Groth16 is recommended for production because its proof size is minimal; the 192-byte proof is stored in the Daml `ZKProofAttestation` contract as a base64 string with negligible on-ledger overhead.

##### Required Circuits

**Circuit 1: `BestPriceCircuit`**

*Purpose:* Prove the Scout Agent selected the optimal (lowest ask / highest bid) price from all discovered offers, without revealing all queried prices.

*Algorithm:* Groth16 over BN128 curve.

*Inputs:*
```
Private: quotedPrices[N]  (all prices queried, hidden)
          selectedIndex    (index of chosen price, hidden)
Public: priceCommitment  (Pedersen commitment to selected price)
          maxSpread        (user's declared constraint)
          timestamp        (proof freshness)
```

*Constraints:* The circuit enforces `selectedPrice ≤ quotedPrices[i]` for all `i`, and `spread(selectedPrice, midPrice) ≤ maxSpread`. A comparator subtree of `O(N log N)` R1CS constraints implements the minimum selection.

*circom skeleton:*
```circom
pragma circom 2.1.0;
include "comparators.circom";   // from circomlib
include "poseidon.circom";       // Poseidon hash for commitment

template BestPriceCircuit(N) {
    signal input  quotedPrices[N];
    signal input  selectedIndex;
    signal input  maxSpread;
    signal output priceCommitment;

    // 1. Extract selected price
    signal selectedPrice;
    selectedPrice <== quotedPrices[selectedIndex];

    // 2. Verify selected price is minimum
    component isLe[N];
    for (var i = 0; i < N; i++) {
        isLe[i] = LessEqThan(64);
        isLe[i].in[0] <== selectedPrice;
        isLe[i].in[1] <== quotedPrices[i];
        isLe[i].out === 1;
    }

    // 3. Verify spread constraint
    component spreadCheck = LessEqThan(64);
    spreadCheck.in[0] <== selectedPrice;   // simplified; real impl uses mid-price
    spreadCheck.in[1] <== maxSpread;
    spreadCheck.out === 1;

    // 4. Commit to selected price (Poseidon hash)
    component hasher = Poseidon(1);
    hasher.inputs[0] <== selectedPrice;
    priceCommitment <== hasher.out;
}
component main { public [maxSpread] } = BestPriceCircuit(32);
```

**Circuit 2: `ComplianceVerificationCircuit`**

*Purpose:* Prove that a counterparty's KYC record exists in an approved Merkle tree (without revealing the record itself) and is not present in a sanctions list.

*Algorithm:* PLONK (universal setup; more flexible for Merkle proof lookups and variable-depth trees).

*Inputs:*
```
Private: kycRecord          (full KYC data leaf)
          kycMerklePathElements[DEPTH]
          kycMerklePathIndices[DEPTH]
          sanctionsNullifier (Poseidon(kycRecord || salt))
Public: kycMerkleRoot      (root of the approved KYC tree)
          sanctionsRoot       (root of the sanctions exclusion set)
          requiredKycTier     (minimum required level)
          complianceResult    (1 = approved, 0 = rejected)
```

*Constraints:* Merkle inclusion proof (circomlib `MerkleProof` template) for KYC inclusion; Merkle exclusion proof for sanctions absence; tier range check.

**Circuit 3: `IntentFulfillmentCircuit`**

*Purpose:* The master proof. Proves that all steps of the agent workflow (price, compliance, settlement parameters) faithfully matched the user's original signed intent.

*Algorithm:* Groth16.

*Inputs:*
```
Private: intentParameters  (full user intent struct, hashed for binding)
          executionRecord    (full execution result struct)
Public: intentHash        (Poseidon hash of user's signed intent)
          executionHash     (Poseidon hash of execution result)
          constraintsSatisfied (boolean: 1 = all constraints met)
```

*Constraints:* Hash preimage checks (intent and execution are well-formed), and a bitwise constraint verification that maps each intent parameter to its corresponding execution value.

##### Trusted Setup Procedure

For Groth16 circuits, a two-phase trusted setup is required:

1. **Phase 1: Powers of Tau (universal):** Use the existing `powersOfTau28_hez_final_22.ptau` ceremony file from the Hermez/iden3 community (established, publicly verifiable, supports up to 2²² constraints; sufficient for Sentinel's circuits).
2. **Phase 2: Circuit-specific contribution:** For each circuit, run a local `snarkjs groth16 setup` followed by a project-specific Phase 2 contribution ceremony (`snarkjs zkey contribute`). The ceremony transcripts will be published for community verification.

##### On-Chain Anchoring: `ZKProofAttestation` Daml Contract

*Illustrative template shape; final authorization, observers, and how verification results are recorded follow the oracle-attestation pattern described in the narrative below.*

```daml
template ZKProofAttestation
  with
    agentOperator     : Party
    proofType         : ProofType  -- BestPrice | Compliance | IntentFulfillment
    publicInputs      : [Text]     -- JSON-encoded public inputs
    proofBytes        : Text       -- Groth16 proof (base64, ~256 chars)
    verificationKeyId : Text       -- Hash of the circuit's vkey (references off-chain registry)
    intentOfferCid    : ContractId IntentOffer  -- anchor to originating offer / workflow
    tradeId           : Text
    createdAt         : Time
    validUntil        : Time
  where
    signatory agentOperator
    observer  agentOperator  -- institution can read its own proofs

    choice VerifyProofOnChain : Bool
      -- Non-consuming: the attestation persists after verification.
      -- Snarkjs verification runs off-chain; this choice models recording
      -- a deterministic attestation outcome (exact fields in shipped package).
      controller agentOperator
      do
        now <- getTime
        assertMsg "Proof expired" (now < validUntil)
        return True  -- Shipped code wires off-chain verify → recorded result
```

The proof verification is performed off-chain by the participant's node using the snarkjs verifier module, following the same pattern as the PoLi Oracle's `VerifyAttestation` choice. The Daml contract records the result and serves as an immutable audit anchor.

##### Off-Chain Prover Service Integration

The ZK prover is a dedicated Node.js microservice:

```
┌─────────────────────────────────────────────────────────────────┐
│ ZK Prover Service (Node.js + snarkjs v0.7.x)                    │
│                                                                 │
│ POST /prove/best-price   → Groth16 proof (base64)               │
│ POST /prove/compliance   → PLONK proof (base64)                 │
│ POST /prove/fulfillment  → Groth16 proof (base64)               │
│                                                                 │
│ Inputs: private witness + public signals (JSON)                 │
│ Output: { proof, publicSignals, verificationKey }               │
└───────────────────────────┬─────────────────────────────────────┘
                            │ proof bytes + public inputs
                            ▼
                Canton Adapter → ZKProofAttestation on ledger
```

Proof generation times (estimated on a standard 8-core server):
* `BestPriceCircuit` (N=32): ~1.2s (Groth16, ~65k constraints)
* `ComplianceCircuit`: ~3.8s (PLONK, ~120k constraints)
* `IntentFulfillmentCircuit`: ~0.9s (Groth16, ~40k constraints)

These are acceptable for post-trade attestation workflows. They are not on the critical path of settlement execution.

***
### 3. Architectural Alignment

| Principle | Sentinel's Approach |
| :--- | :--- |
| **Sub-Transaction Privacy** | All agent operations use Canton's native party-scoped permissions. The Scout reads only disclosed or observer-accessible contracts. No private data from third parties is ever accessed without explicit authorization. |
| **Daml Authorization Model** | The `IntentOffer` template's `IntentRequest` choice is controller-gated (only the requesting party can exercise it). The `AtomicSettlement` choice enforces DvP atomicity natively in Daml; no custom escrow logic needed. |
| **Canton Ledger API Pattern** | All off-chain agents interact with Canton exclusively through the gRPC Ledger API (`submitAndWait`, `queryContractFilter`). No direct participant node access. |
| **Oracle Attestation Pattern** | The ZK layer follows the same off-chain-compute to on-ledger-attest model established by Chainlink and the PoLi Oracle. This is consistent with Canton's computation boundary philosophy. |
| **Reusable Primitives** | The `IntentOffer`, `PendingMatch`, `AtomicSettlement`, `ComplianceCertificate`, and `ZKProofAttestation` templates are designed as general-purpose, asset-agnostic primitives. Any Canton application can import and extend them. |
| **Governance Alignment** | This proposal is submitted under CIP-0082 (Development Fund) and governed by CIP-0100. The ZK prover service will publish its verification keys and ceremony transcripts for community verification. |

**Relationship to Existing Canton Primitives**

Sentinel does not replace or modify any existing Canton protocol. It builds on top of:
* Canton's native `Archive` / `Create` atomic transaction semantics for settlement.
* Canton's `Disclosure` mechanism for the Scout Agent's liquidity discovery.
* Canton's existing `Party` and `Observer` rights model for the Compliance Agent's certificate reads.

***
### 4. Backward Compatibility

Sentinel is entirely additive. It introduces new Daml templates and off-chain services. It does not:
* Modify any Canton protocol parameters or consensus rules.
* Change any existing Daml SDK APIs.
* Require ledger participants to upgrade their nodes.
* Interfere with existing Canton applications, DEXs, or validator operations.

Participants who do not use Sentinel are unaffected. Participants who do adopt it can migrate incrementally; the `IntentOffer` template is interoperable with any existing Canton asset contract that supports transfer choices.

***
## Milestones and Deliverables

Grant-funded delivery runs **M1 through M4** over **20 weeks (~five months)** from grant approval: **four milestones, each allocated a 5-week window**. Scope is split as **(1)** Daml Intent Primitives & AI Parser MVP, **(2)** Scout & Compliance Agents, **(3)** Settlement Agent & Atomic DvP Execution, **(4)** ZK Execution Attestation Layer plus Public SDK, Mainnet deployment, and ecosystem release (see milestones below).

**Calendar vs. Appendix A (ZK roadmap):** The **grant calendar** is fixed at **20 weeks (M1–M4)** above. **Appendix A** uses **numbered engineering bands** for the ZK track (build, test, audit, release); those labels are **not extra calendar months**. ZK work **concentrates in M4 (weeks 16–20)** for acceptance, with **parallel contributors** (ZK, backend, SDK, release) so design, CI, and early circuit work can **overlap** earlier milestones without extending the five-month programme.

**Payment timing (explicit):** **M1 funds (120,000 CC) are paid as soon as the grant is approved and the funding agreement is executed** — **before** M1 work is finished — so the team can start immediately. **When M1 work is complete, the Committee reviews and accepts M1** (target: week 5); that acceptance **does not** gate the first payment (already released), but it **does** gate **release of M2**. **M2 (160,000 CC)** is paid **only after** Tech & Ops **acceptance** of M2 deliverables. **M3 (200,000 CC)** is paid **only after** acceptance of M3. **M4 (220,000 CC)** is paid **only after** acceptance of M4. **Total request: 700,000 CC.** Failure to meet a milestone after the upfront tranche is handled per standard Development Fund terms (e.g. pause or recovery plan as determined by the Committee).

### Milestone 1: Daml Intent Primitives & AI Parser MVP _(Weeks 1 to 5)_
* **Estimated Delivery:** target **M1 acceptance review** by **end of week 5** from grant approval
* **Focus:** Daml Intent Primitives, AI Parser MVP, and **ecosystem foundations** (public repo, npm scope, first developer-facing release mechanics)
* **Deliverables / Value Metrics:**
  * **Daml Intent Primitives:** Open-source Daml package with `IntentOffer`, `PendingMatch`, `AtomicSettlement`, `ComplianceCertificate` templates (Apache 2.0, published to GitHub).
  * **AI Parser MVP:** JSON Schema for the Intent Descriptor; Node.js service converting natural-language commands to valid Intent Descriptors; ≥90% schema-valid output on 20 canonical test phrases.
  * Complete unit test suite for all Daml templates (Canton Sandbox).
  * **Ecosystem (M1 slice):** Public GitHub org/repo layout, Apache 2.0 license, basic CI, **npm scope** and **`@canton-sentinel/sdk` package scaffold** (typed stubs or minimal client surface aligned to Intent Descriptor only), changelog and versioning policy started.
  * Developer documentation: template reference, Intent Descriptor schema, quickstart for Daml + parser.
  * **Value Metric:** A developer can submit a natural-language trade intent and receive a valid, schema-conformant Daml Choice Descriptor in < 3 seconds.

### Milestone 2: Scout & Compliance Agents _(Weeks 6 to 10)_
* **Estimated Delivery:** target **M2 acceptance review** by **end of week 10** from grant approval (five working weeks after M1 acceptance)
* **Focus:** Scout & Compliance agents, orchestration harness, and **SDK read/query path** for discovery workflows
* **Deliverables / Value Metrics:**
  * **Scout Agent:** Node.js service querying Canton Testnet for disclosed `IntentOffer` contracts via Ledger API; ranked match list.
  * **Compliance Agent:** Policy-as-Code (KYC tier, OFAC/UN/EU sanctions, jurisdiction); open-source policy module.
  * `ComplianceCertificate` issuance workflow (Compliance Officer role).
  * Agent orchestration harness: Intent to Scout to Compliance to `ComplianceVerdict` on Canton Testnet.
  * **Public SDK (M2 slice):** `@canton-sentinel/sdk` extensions for **read/query** and Scout/Compliance integration (typed Ledger API helpers, documented examples).
  * **Ecosystem (M2 slice):** Expanded README, contribution guide, and **pre-release npm publish** (e.g. `0.x`) consumable by integrators.
  * **Value Metric:** Full Scout to Compliance pipeline executes in < 5 seconds on Canton Testnet with a demonstrated match and approval verdict.

### Milestone 3: Settlement Agent & Atomic DvP Execution _(Weeks 11 to 15)_
* **Estimated Delivery:** target **M3 acceptance review** by **end of week 15** from grant approval (five working weeks after M2 acceptance)
* **Focus:** Settlement Agent, atomic DvP on Testnet, Dashboard Alpha, and **SDK write/submit path**
* **Deliverables / Value Metrics:**
  * **Settlement Agent:** `PendingMatch` / `AtomicSettlement` flow with `AcceptAndSettle` on Canton Testnet (two test parties).
  * Full three-agent pipeline: natural language intent through Scout, Compliance, Settlement to on-chain confirmation.
  * Idempotency and error recovery (Ledger API failures, offsets, timeouts) with documented failure modes.
  * **Institutional Dashboard Alpha (Next.js 14):** intents, agent status, settlement confirmations (dark mode, responsive).
  * **Public SDK (M3 slice):** `@canton-sentinel/sdk` methods for **command submission** (`submitAndWait` patterns), dashboard-aligned examples, Testnet configuration templates.
  * **Ecosystem (M3 slice):** **Testnet-focused release**: tagged GitHub release, npm **beta** line, short integration guide for third-party apps.
  * **Value Metric:** Full pipeline executes in < 30 seconds end-to-end on Canton Testnet; settlement is atomic (both legs or neither).

### Milestone 4: ZK Layer, Public SDK, Mainnet Deployment & Ecosystem Release _(Weeks 16 to 20)_
* **Estimated Delivery:** target **M4 acceptance review** by **end of week 20** from grant approval (five working weeks after M3 acceptance)
* **Focus:** ZK Execution Attestation Layer, **shipping the full public SDK**, **Canton Mainnet deployment**, security review posture, and **ecosystem / co-marketing readiness**
* **Deliverables / Value Metrics:**
  * **ZK Execution Attestation Layer:** `BestPriceCircuit` and `IntentFulfillmentCircuit` (circom 2.0, Groth16, snarkjs v0.7.x); `ComplianceVerificationCircuit` (PLONK); trusted setup artifacts and published Phase 2 transcripts; ZK Prover Service (REST); `ZKProofAttestation` and `VKeyRegistry` on Testnet; post-trade attestation demo; proofs verifiable by third-party snarkjs client.
  * **Public SDK (M4 / GA):** **`@canton-sentinel/sdk`** complete: agents, Daml template bindings, ZK prover client; JSDoc, **hosted API reference**, publish to npm (**1.x** or stable line).
  * Daml package on Canton ecosystem registry **or** GitHub Packages as documented.
  * **Canton Mainnet deployment:** all grant-developed templates and integration paths exercised on **Mainnet**; target **two pilot** institutional participants for feedback.
  * **Security:** self-assessment checklist plus **third-party review** of Daml templates and ZK circuits (circomlib-aligned).
  * **Ecosystem release:** public issue tracker, changelog, Daml SDK upgrade policy; materials ready for Foundation co-marketing (announcement draft, demo script).
  * **Value Metric:** A new developer completes the **documented quickstart** (SDK + Mainnet or documented Mainnet-equivalent environment) and reaches a successful **settlement or attestation** flow in **under 10 minutes**.

***
## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

* **Reference environment:** Latency and quickstart metrics (e.g. M1–M4 value metrics and the M4 quickstart bar) are measured in a **documented reference environment** (machine profile and network assumptions) published with the test plan and quickstart.

* All deliverables completed as specified for each milestone.
* Demonstrated, reproducible functionality on **Canton Testnet** through M3; **M4** additionally demonstrates **Mainnet** deployment and end-to-end SDK quickstart as specified.
* All Daml templates pass Canton Sandbox unit tests and Testnet integration tests with zero critical defects (Mainnet smoke tests for M4 as applicable).
* Documentation and knowledge transfer provided (developer guide, hosted API reference by M4, circuit specification).
* Open-source release: All grant-funded code under Apache 2.0 on a public GitHub repository, with **M1 tranche** funding the opening sprint **upon executed grant** and subsequent visibility at each milestone acceptance.

**Project-Specific Acceptance Conditions:**

| Condition | Milestone | Pass Criteria |
| :--- | :--- | :--- |
| Intent Parser schema validity | M1 | ≥ 90% of 20 canonical test phrases produce schema-valid output |
| Scout Agent correctness | M2 | Returns correct match subset from a pre-seeded test set of 10 `IntentOffer` contracts |
| Compliance Agent determinism | M2 | Given the same inputs, produces identical output on 100 consecutive runs |
| Settlement atomicity | M3 | In a simulated failure (Ledger API timeout at T+2), no partial settlement occurs |
| ZK proof soundness | M4 | Proof generated for a valid execution verifies as `true`; proof generated for a tampered execution verifies as `false` (soundness test) |
| ZK proof completeness | M4 | Proof generation succeeds for 100/100 valid execution records in the test suite |
| Public SDK + quickstart | M4 | New developer completes documented quickstart (SDK + Mainnet path) in **under 10 minutes** |
| Mainnet deployment | M4 | Grant-developed templates and integration paths live on Canton Mainnet; smoke verification documented |

***
## Funding

**Total Funding Request: 700,000 CC**

*(Denominated in Canton Coin (CC) per CIP-0100; amount fixed at submission.)*

### Payment Breakdown by Milestone

**700,000 CC** in **four tranches**: **120,000 + 160,000 + 200,000 + 220,000**. **M1 (120,000 CC) is disbursed on grant approval and executed agreement** — **first payment immediately**, without waiting for M1 completion. **After M1 work is done**, the Committee **reviews and accepts M1**; **M2 (160,000 CC) is paid only after M2 acceptance**. **M3 (200,000 CC)** after **M3 acceptance**. **M4 (220,000 CC)** after **M4 acceptance** (ZK layer, GA public SDK, Mainnet, security review, ecosystem closure). The programme is paced as **four consecutive 5-week windows** (**20 weeks total**, approximately **five months**) from grant approval.

| Milestone | Scope (summary) | Target work window (from grant approval) | CC amount | When paid |
| :--- | :--- | :--- | :--- | :--- |
| M1 | Daml Intent Primitives & AI Parser MVP + ecosystem foundations (repo, CI, SDK scaffold) | Weeks 1–5 | **120,000 CC** | **On grant approval / executed agreement** (upfront, before M1 completion) |
| M2 | Scout & Compliance Agents + SDK read/query + npm pre-release | Weeks 6–10 | **160,000 CC** | **After M2 acceptance** (M1 must be accepted before M2 payment is released) |
| M3 | Settlement Agent & Atomic DvP + Dashboard Alpha + SDK submit path + Testnet beta release | Weeks 11–15 | **200,000 CC** | **After M3 acceptance** |
| M4 | ZK Execution Attestation Layer + full public SDK + Mainnet + ecosystem & security | Weeks 16–20 | **220,000 CC** | **After M4 acceptance** |
| **TOTAL** | | **Weeks 1–20** | **700,000 CC** | |

*The **220,000 CC** M4 tranche concentrates ZK, Mainnet cutover, GA SDK, third-party review, and ecosystem release. **M1 acceptance** remains mandatory before **M2** funds are released, even though **M1 cash** arrives upfront. Week boundaries may shift slightly by mutual agreement.*

### Volatility Stipulation

The grant-funded work is scoped to **M1 through M4** and is expected to complete within **approximately five months (20 weeks)** from approval. If the Committee requests scope changes that push delivery materially beyond that window, any remaining tranches must be renegotiated for USD/CC volatility per CIP-0100.

### Co-Investment

The proposing entity will fund the following components independently (not covered by this grant):
* OpenAI API costs for fine-tuning and inference during development.
* Cloud infrastructure for the ZK Prover Service, agent orchestration, and hosted documentation (if exceeding grant-allocated hosting).
* Institutional Dashboard production hosting and any optional pilot incentives beyond the two reference participants named in M4.

***
## Team and developer roles (execution capacity)

Delivery is structured around **specialist developers** so reviewers can see end-to-end coverage: **on-ledger logic (Daml/Canton)**, **backend services**, **institutional frontend**, and **ledger-facing integration** (often described as **Web3-style** in hiring markets, here meaning **Canton-native**: parties, rights, Ledger API, and high-assurance workflows rather than EVM tooling).

| Role | Primary ownership | Stack / notes |
| :--- | :--- | :--- |
| **Daml / Canton developers** | Intent templates (`IntentOffer`, `PendingMatch`, `AtomicSettlement`, `ComplianceCertificate`, `ZKProofAttestation`, `VKeyRegistry`), choice design, signatory/observer model, Sandbox and Testnet/Mainnet packaging | Daml SDK, Canton Sandbox, Ledger API command shapes, upgrade-friendly package layout |
| **Backend engineers** | Scout, Compliance, and Settlement agents; intent parser service; orchestration; Canton Adapter; REST surfaces for the ZK prover; integration tests against Testnet/Mainnet | Node.js / TypeScript, gRPC Ledger API clients, OpenAI SDK where used, observability and idempotent command submission |
| **Frontend engineers** | Institutional Dashboard (Next.js 14): intent capture, agent status, settlement and attestation views; accessibility and responsive layout; institutional dark theme | React / Next.js, typed API client to backend, clear operator UX for non-Daml users |
| **Web3 / on-ledger integration engineers** | Party onboarding patterns, authentication to participant nodes, secure handling of ledger credentials, multi-step DvP and attestation flows documented for integrators | Canton Ledger API, **not** EVM; emphasis on **institutional** custody and permissioned-network semantics |
| **ZK / circuits engineers** | circom 2.x circuits, snarkjs proving pipeline, trusted setup artefacts, prover microservice hardening | Groth16 / PLONK as specified; coordination with Daml team for public inputs and attestation templates |

**How this maps to milestones:** M1 leans heavily on **Daml + backend** (parser, contracts, SDK scaffold); M2–M3 add **backend + Web3/Canton integration** and **frontend** (dashboard); M4 adds **ZK engineers** plus **full SDK**, **Mainnet**, and release engineering across roles. Roles may be **shared across contributors** or delivered with **named contractors**; the proposal assumes capacity exists to staff each lane for the 20-week programme.

***
## Co-Marketing

Upon release, the implementing entity will collaborate with the Canton Foundation on:

* **Announcement coordination:** Joint press release and ecosystem blog post announcing the open-source release of the Daml Intent Template library and ZK Attestation Layer.
* **Technical blog series:** Three-part series covering (1) the Intent Parsing architecture, (2) how Sentinel's multi-agent system uses Canton's privacy model natively, and (3) a developer-accessible explainer on building ZK attestations for Canton.
* **Developer promotion:** SDK featured in Canton developer documentation and ecosystem tooling page.
* **Demo:** Live demonstration at a Canton Foundation event or ecosystem call after **M4 acceptance** (Mainnet + SDK quickstart ready; schedule by mutual agreement).
* **ZK Circuit Open-Source:** Trusted setup ceremony artifacts and circuit source published on GitHub with community verification instructions; a first for the Canton ecosystem.

***
## Motivation

**Why this is valuable to the Canton ecosystem:**

Canton's institutional adoption depends on reducing the operational and technical barrier for new participants. Today, executing a cross-node trade on Canton requires:
1. Daml expertise to author contract choices.
2. Manual bilateral counterparty discovery.
3. gRPC Ledger API client integration and command submission.
4. A separate compliance layer built independently by each participant.

This means each new institutional participant must rebuild the same integration plumbing from scratch; a significant duplication of effort and a competitive deterrent.

Sentinel addresses this by providing **shared, reusable infrastructure**, not a proprietary application, that any Canton participant can adopt. The Daml Intent Template library is the Canton equivalent of OpenZeppelin for Ethereum: a trusted, audited base layer that developers build on rather than rebuild.

The ZK Execution Attestation Layer additionally opens up a category of use cases that are **not yet standard on Canton**: **verifiable autonomous agent execution** for institutional compliance. As AI-driven trading and treasury management become mainstream, institutions will require cryptographic guarantees (not just audit logs) that agents followed declared policies. Sentinel **targets** an open, reusable pattern on Canton for that audit use case, implemented without replacing Canton's native sub-transaction privacy.

**Expected ecosystem impact:**
* Reduces onboarding time for new Canton participants who want to build RWA trading workflows.
* Provides a standards-based intent format that existing Canton DEXs and liquidity protocols can integrate.
* Establishes a ZK circuit library and attestation pattern reusable by other Canton projects.
* Attracts AI-native fintech teams to Canton by providing an agent-compatible SDK.

***
## Rationale

**Why this approach?**

**On the Three-Tier Architecture:**
A monolithic "AI agent" was explicitly rejected because a single agent touching discovery, compliance, and settlement creates unacceptable single-point-of-failure and audit surface risks. Separating concerns into three independently-auditable agents, each with minimum required Canton permissions, means a compromise of one agent cannot automatically compromise the others. The Scout cannot settle; the Compliance Agent cannot discover; the Settlement Agent cannot read KYC data.

**On using ZK Proofs despite Canton's native privacy:**
Canton's sub-transaction privacy proves *to counterparties and the ledger* that transactions are valid. It does not prove *to external auditors* that an AI agent faithfully followed its declared constraints before arriving at a trade. These are distinct requirements. The ZK layer solves the second requirement without duplicating the first. We explicitly adopt the off-chain-compute to on-ledger-attest pattern, consistent with Canton's architecture, rather than attempting to embed ZK verification logic in Daml (which is unsupported and architecturally inappropriate).

**On circom + snarkjs over alternatives:**
* **gnark (Go):** Faster proving, but incompatible with the Node.js stack; would require a separate Go microservice with IPC overhead.
* **bellman (Rust):** Excellent performance, but requires WebAssembly compilation for Node.js integration; added build complexity.
* **circom + snarkjs:** Native JavaScript/WebAssembly; directly importable into the Node.js orchestration layer; mature ecosystem; Groth16 proof size (192 bytes) is optimal for on-chain anchoring.

**On Groth16 over PLONK for on-chain anchoring:**
Groth16's 192-byte proof is significantly smaller than PLONK's ~800 bytes. Since proofs are stored in Daml contracts, minimizing on-ledger footprint reduces transaction costs and keeps the `ZKProofAttestation` contract lightweight. PLONK is used for the `ComplianceVerificationCircuit` where the universal trusted setup (no per-circuit ceremony) is worth the size tradeoff given the complexity of Merkle proof constraints.

**On open-source commitment:**
All grant-funded components are open-source (Apache 2.0). The ZK circuits, trusted setup artifacts, Daml templates, and SDK are public goods for the Canton ecosystem. Sentinel's commercial differentiation (if any) lies in the hosted infrastructure service layer, not the protocol primitives.

***
## Appendix A: ZK Implementation Roadmap (Detailed)

For the benefit of reviewers evaluating the feasibility of the ZK layer:

### Step-by-Step Build Plan

***Appendix week labels** are **engineering-phase indices** for the ZK workstream (who does what, in what order), **not** additional weeks beyond the **M1–M4 grant calendar** in **Milestones and Deliverables**. The **five-month programme** remains authoritative; phases below **overlap** across people and milestones as described in the **Calendar vs. Appendix A** note.*

*Cadence below: **bands 1–8** implementation, **bands 9–20** testing, audit, hardening, and release integration; **bands 9–20** run in parallel with SDK GA, Mainnet cutover, and other **M4** workstreams where staffing allows. Subsection titles that read **“Week X to Y”** are **ZK sub-phase indices inside this appendix only**, not extra weeks on top of the M1–M4 grant calendar.*

**Week 1 to 2: Circuit Development Environment**
```bash
# Install toolchain
npm install -g circom snarkjs
npm install snarkjs circomlib

# Initialize circuit project
mkdir sentinel-circuits && cd sentinel-circuits
npm init -y
```

**Week 3 to 4: BestPriceCircuit Implementation**
1. Implement circuit in `circuits/best_price.circom` (see Section 2.5 for skeleton).
2. Compile: `circom best_price.circom --r1cs --wasm --sym`
3. Verify constraint count: `snarkjs r1cs info best_price.r1cs` (target: < 100k constraints).
4. Download Powers of Tau: `snarkjs powersoftau download bn128 22 pot22_final.ptau`
5. Phase 2 setup: `snarkjs groth16 setup best_price.r1cs pot22_final.ptau best_price_0.zkey`
6. Contribute to ceremony: `snarkjs zkey contribute best_price_0.zkey best_price_final.zkey`
7. Export verification key: `snarkjs zkey export verificationkey best_price_final.zkey vkey_best_price.json`
8. Test: Generate proof for valid witness; verify; then tamper input and confirm verification fails.

**Week 5 to 6: ComplianceVerificationCircuit (PLONK)**
1. Implement Merkle inclusion proof circuit using `circomlib`'s `MerkleProof` and `Poseidon` templates.
2. Use PLONK setup: `snarkjs plonk setup compliance.r1cs pot22_final.ptau compliance.zkey`
3. Verify that a known-good KYC record produces a valid proof; a sanctions-listed party fails the exclusion constraint.

**Week 7 to 8: IntentFulfillmentCircuit + Prover REST API**
1. Implement the binding circuit that links `intentHash` to `executionHash`.
2. Build Express.js REST API wrapping `snarkjs.groth16.prove()` and `snarkjs.plonk.prove()`.
3. Integrate prover API with the Canton Adapter: after `AtomicSettlement` confirmation, call `/prove/fulfillment`, receive proof, submit `ZKProofAttestation`.

**Testing & Audit (Week 9 to 20)** — *covers soundness through external review (weeks 9–14), then Mainnet readiness, integrator hardening, and GA closure (weeks 15–20).*

**Week 9 to 10: Core soundness & tooling**
1. Soundness tests: For each circuit, generate 100 valid proofs (expect all to verify) and 100 tampered proofs (expect all to fail).
2. Property and regression tests in CI: witness generation, proof/verify round-trips, and version-pinned `snarkjs` artifacts.
3. Security tooling pass: Check for under-constrained signals using `circom --inspect`; initial pass against known circuit vulnerabilities (missing range constraints, signal aliasing).

**Week 11 to 12: Trusted setup & transparency**
1. Publish full ceremony transcripts and Phase 2 contribution logs; document reproduction steps for independent verification.
2. Public verification window: invite ecosystem review of `.zkey` exports and `vkey` hashes aligned with on-ledger `VKeyRegistry` (or documented registry equivalent).
3. Load and soak tests on the Prover REST API (concurrency, memory, worst-case witness sizes).

**Week 13 to 14: External review, remediation, and E2E**
1. Third-party security review of circuits and prover service (scope aligned with M4); track findings to closure or documented risk acceptance.
2. Remediation sprint: patch circuits or constraints as needed; re-run soundness suites and update trusted-setup artifacts if any circuit changes.
3. End-to-end attestation on Canton Testnet: `AtomicSettlement` → prover → `ZKProofAttestation` submission; third-party verification using published `snarkjs` client instructions.

**Week 15 to 16: Mainnet readiness & operational hardening**
1. Mainnet configuration: freeze circuit/`vkey` identifiers for production; align `VKeyRegistry` (or equivalent) with Mainnet package deployment and change-control policy.
2. Operational runbooks: prover deployment, key rotation procedure, incident response for proof-generation failures, and observability dashboards (latency, error rates, witness size outliers).
3. Failure-injection and chaos tests: kill prover mid-request, ledger timeouts, oversized witnesses; confirm orchestration degrades safely without false attestations.

**Week 17 to 18: SDK, docs, and integrator pilot**
1. **`@canton-sentinel/sdk` ZK client:** stable surface for proof requests, verification helpers, and typed errors; examples aligned with hosted API reference.
2. Pilot integrator dry-run: at least one external integrator completes Testnet → Mainnet smoke path using published quickstart; capture breaking feedback and patch before GA.
3. Documentation: circuit specification v1, public-input catalogue, and “verify offline” tutorial for auditors and regulators.

**Week 19 to 20: Final gate & ecosystem handoff**
1. Acceptance test sweep: re-run M4 soundness/completeness criteria (100/100 valid proofs; tampered proofs fail); confirm documented quickstart completes in **under 10 minutes** on a clean environment or reproducible CI job.
2. Versioned release: tagged GitHub release for circuits + prover + Daml package hashes; npm **1.x** (or stable line) with changelog; upgrade notes for future circuit changes.
3. Ecosystem handoff: announcement materials, demo script, and Foundation co-marketing checklist; optional community call walkthrough of ceremony artifacts and verification steps.

