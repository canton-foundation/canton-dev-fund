# Proposal: AetherNet - Post-Quantum Pre-Ledger Execution Gateway for the AI Economy

## 1. Project Overview
* **Project Name:** AetherNet (Quantum Universal Agentic Substrate)
* **Submitting Entity:** Kronova Intelligent Systems
* **Target Core Technology:** Daml SDK 3.5.16, Canton Ledger API v2, Rust TEEs (x86, ARM, RISC-V), NIST FIPS-203/204 PQC SDKs
* **Target RFP Category:** rfp-13:payments-defi

AetherNet is an architecture-agnostic, hardware-isolated **Pre-Ledger Execution Gateway** engineered for autonomous machine-to-machine (M2M) commerce. Rather than altering Canton's internal consensus or synchronizer topology, AetherNet intercepts, authenticates, and bounds off-chain agent negotiations inside bare-metal Rust Trusted Execution Environments (TEEs) before translating approved mandates into deterministic Canton Ledger API v2 commands.

The substrate is fully **model-agnostic** and **architecture-agnostic**:
* **Model-Agnostic Ingress:** Standardizes on Model Context Protocol (MCP) data objects and Agent Payments Protocol (AP2) mandates, abstracting cognitive reasoning from settlement. It operates equally across proprietary frontier APIs, open-weight models, or domain-specific inference engines.
* **Architecture-Agnostic Execution:** The Rust `EnclaveProvider` abstraction supports x86 (Intel TDX, AWS Nitro), ARM (CCA/TrustZone), and open-source RISC-V (Keystone) enclaves, bridging sovereign edge devices and localized appliances directly into Canton.

---

## 2. Problem Statement & Canton Ecosystem Value
While Canton natively eliminates public mempools and delivers protocol-level sub-transaction privacy between participant nodes, enterprise multi-agent workflows encounter three critical off-ledger risks at the network perimeter:

* **Pre-Ledger Quantum Exposure (Harvest Now, Decrypt Later):** Off-chain agent negotiations, MCP context graphs, and AP2 payment intents traverse public networks before reaching participant nodes. Adversaries harvesting this data can decrypt it once cryptanalytically relevant quantum computers emerge. AetherNet secures edge transport using NIST FIPS-203 (ML-KEM-768/1024) and signs execution mandates with FIPS-204 (ML-DSA-65/87).
* **Long-Shelf-Life Enterprise Data Assets:** High-value domains migrating to Canton require post-quantum guarantees immediately:
  * *Institutional RWAs & Canton Programmable Credit Protocol (PCP):* Decrypting historical off-chain negotiations exposes proprietary alpha, credit allocations, and counterparty pricing.
  * *Healthcare M2M Claims (EDI 837 / SMART on FHIR):* Autonomous adjudication involves Protected Health Information (PHI) requiring multi-decade privacy under statutory mandates.
* **Rogue Agent Containment & Hallucination Mitigation:** Canton executes valid Daml commands submitted to its API, but cannot detect whether an upstream LLM hallucinated, drifted, or suffered prompt injection. AetherNet executes policy evaluations inside hardware enclaves, verifying mandate constraints against pre-authorized limits before constructing Ledger API commands.
* **Off-Ledger Secure Semantic Memory (AetherNet KVS):** Storing vector embeddings and counterparty Know-Your-Agent (KYA) history directly on-ledger is cost-prohibitive. AetherNet isolates this memory inside the **AetherNet KVS (Kinetic Vector Store)**, a FIPS-203 shielded vector engine, preventing context leakage.
* **On-Ramp for Public L1/L2 Protocols:** For protocols migrating from mempool-heavy networks (Ethereum, Base, Solana) where MEV extraction and front-running are severe, AetherNet provides an isolated execution perimeter that safely bridges transaction intent directly into Canton's private, non-mempool ledger.

---

## 3. Institutional M2M Architecture vs. Consumer Rails (x402)
Standard Web3 AI payment protocols like x402 are consumer micropayment rails optimized for transparent public L2s using classical ECDSA signatures. AetherNet provides institutional-grade guarantees:

| Feature | Consumer AI Rails (e.g., x402) | AetherNet + Canton Network |
| :--- | :--- | :--- |
| **Cryptography** | Classical ECDSA (Quantum-Vulnerable) | NIST FIPS-203 (ML-KEM) & FIPS-204 (ML-DSA) |
| **Execution Privacy** | Broadcast on public ledgers/mempools | Sub-transaction privacy via Canton synchronizers |
| **Escrow Capability** | Simple transfer receipts | Turing-complete Daml 3.5.16 dynamic escrows & UTXO change patterns |
| **Agent Authentication** | Raw wallet keys | Remote hardware attestation (PCR hashes) + Cryptographic KYA |
| **Target Workloads** | $0.001 API inference calls | Enterprise settlement, tokenized RWAs, healthcare claims |

---

## 4. Agent Identity to Daml Party Mapping
Off-chain agent identities map deterministically into Canton `Party` authorizations across four distinct stages:

1. **Off-Chain Identity Assertion:** The autonomous agent generates a Decentralized Identifier (DID) and signs its AP2 mandate using its NIST FIPS-204 (ML-DSA) private key.
2. **Hardware Enclave Verification (KYA):** The AetherNet Rust TEE verifies the cryptographic signature against the agent's registered public key, validates hardware remote attestation quotes (PCR hashes), and enforces spending caps.
3. **Canton Ledger API User Authorization:** The AetherNet Gateway authenticates with the participant node's Ledger API v2 using scoped JWT bearer credentials tied to a designated Daml `Party`.
4. **On-Chain Choice Execution:** The gateway issues gRPC commands invoking choices on Daml templates (such as the `CurrencyRegistry` factory). Verified off-chain parameters (`agent_did`, `intent_ref`, and hardware attestation quote hash) are committed to ledger state as immutable audit records.

---

## 5. Smart Contract Architecture (Daml SDK 3.5.16)
The smart contract suite replaces hardcoded currency whitelists with an extensible **CurrencyRegistry** factory pattern, compiling strictly under Daml SDK 3.5.16:

```daml
module CurrencyRegistry where

import DA.List (elem)

template CurrencyRegistry
  with
    admin : Party
    observers : [Party]
    allowedCurrencies : [Text]
  where
    signatory admin
    observer observers
    
    key admin : Party
    maintainer key

    nonconsuming choice UpdateCurrencies : ContractId CurrencyRegistry
      with
        newCurrencies : [Text]
      controller admin
      do
        archive this
        create this with allowedCurrencies = newCurrencies

    nonconsuming choice MintEscrow : ContractId ServiceEscrow
      with
        issuer_did : Text
        merchant_did : Text
        intent_ref : Text
        cart_ref : Text
        amount : Decimal
        currency : Text
        settlement_domain : Text
      controller admin
      do
        assertMsg ("Currency " <> currency <> " not authorized.") (currency `elem` allowedCurrencies)
        create ServiceEscrow with
          admin = admin
          issuer_did = issuer_did
          merchant_did = merchant_did
          intent_ref = intent_ref
          cart_ref = cart_ref
          amount = amount
          currency = currency
          settlement_domain = settlement_domain

template ServiceEscrow
  with
    admin : Party
    issuer_did : Text
    merchant_did : Text
    intent_ref : Text
    cart_ref : Text
    amount : Decimal
    currency : Text
    settlement_domain : Text
  where
    signatory admin
    ensure amount > 0.0
```
##  6. Scope of Work, Milestones, and Funding
* **Requested Funding:** $40,000 USD

* **Baseline Infrastructure:** Daml SDK 3.5.16 & Canton 3.5.16 (Ledger API v2)

## Milestone 1: PQC TEE Enclave Attestation & KYA Engine ($15,000)
* **Scope:** Implement bare-metal FIPS-204 (ML-DSA) verification and hardware attestation quote parsing within the Rust enclave (rust-ap2-core). Establish policy-bounding logic to detect prompt manipulation and enforce invariant boundaries before command dispatch.

* **Deliverables:** Production-grade Rust enclave module, attestation validator (PCR hash quoting), unit test suite validating payload rejection upon signature or policy mismatch.

## Milestone 2: Ledger API v2 Command Proxy & Daml 3.5.16 Factory Integration ($15,000)
* **Scope:** Wire the Rust TEE gRPC client to Canton Ledger API v2 protobuf services (CommandService, ActiveContractsService). Implement the bridge that consumes verified agent DIDs and attestation quotes, maps them to provisioned Daml Party credentials, and submits MintEscrow commands via CurrencyRegistry.

* **Deliverables:** End-to-end integration service running against digitalasset/canton-open-source:3.5.16, deployment scripts, and automated ledger command verification.

## Milestone 3: Model-Agnostic SDK & Open-Source Developer Sandbox ($10,000)
* **Scope:** Publish public integration tooling bridging MCP/AP2 agent payloads to Canton. Deliver a mock relayer testbed allowing external developers to simulate post-quantum agentic settlement without local multi-node complexity.

* **Deliverables:** Public GitHub repository featuring TypeScript and Rust adapter SDKs, architectural diagrams, developer documentation, and sandbox test runners.

## 7. Acceptance Criteria
1. **Compilation:** Smart contracts compile with zero warnings using Daml SDK 3.5.16.

2. **Infrastructure Validation:** The gateway connects to and executes commands against a live Canton 3.5.16 participant node via Ledger API v2.

3. **Cryptographic Integrity:** End-to-end execution where an agent mandate signed with ML-DSA (FIPS-204) is verified within the Rust enclave and successfully triggers a ServiceEscrow creation via the CurrencyRegistry.

4. **Developer Artifacts:** Complete public repository featuring sandbox test runners and documentation detailing the edge-to-Canton data flow.