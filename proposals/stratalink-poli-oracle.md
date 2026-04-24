# Proof of Liquidity Oracle for Canton Network

**Applicant:** Stratalink Labs Ltd
**Contact:** Rob McDermott, Founder & CEO (robert@stratalink.ai)
**Technical Partner:** IntellectEU (Canton Foundation Member)
**Proposed Sponsor:** IntellectEU (Canton Foundation Member)
**Funding Requested:** £40,000 equivalent in Canton Coin
**Duration:** 8–10 calendar weeks (4–5 Agile sprints)
**Date:** March 2026

---

## 1. Objective and Scope

### Objective

Stratalink Labs proposes the development and deployment of a **Proof of Liquidity (PoLi) Oracle** on the Canton Network — shared infrastructure that enables institutional participants to verify real, tradeable market liquidity within their on-ledger settlement workflows.

This is a **public good** that benefits every institutional participant on Canton: clearing houses, CCPs, custodians, prime brokers, trading firms, and regulators.

### The Problem

Canton Network is establishing itself as the institutional settlement layer for digital asset markets. Institutional participants settling trades on Canton face a structural gap: **there is no way to verify, on-ledger and within a settlement workflow, whether there is real, tradeable market liquidity behind the assets being settled.**

Chainlink joined Canton as a Super Validator to provide pricing feeds. No equivalent exists for liquidity. Price tells an institution what an asset is worth. Liquidity tells them whether they can actually trade it at that price. For institutional settlement, both are essential.

| Institutional Function | Liquidity Data Requirement | Current State on Canton |
|---|---|---|
| Clearing House Margin | Verified orderbook depth to assess margin adequacy | No on-ledger source |
| CCP Risk Assessment | Liquidity stress indicators for counterparty risk | No on-ledger source |
| Custodian Collateral Review | Confirmation that collateral assets are genuinely liquid | No on-ledger source |
| Regulatory Supervision | Real-time liquidity monitoring across supervised venues | No on-ledger source |
| Prime Broker Execution | Pre-trade liquidity verification before large block execution | No on-ledger source |
| Settlement Readiness | Confirmation of sufficient market depth for settlement | No on-ledger source |

### Why On-Ledger Attestation

Liquidity data delivered via off-chain API can be disputed, manipulated in transit, or selectively reported. On-ledger attestation on Canton eliminates these risks: attested data is cryptographically signed at source, immutably recorded, and natively composable within Daml settlement workflows. Regulators can verify the same data consumers rely on through Canton's observer-party model — without a separate reporting pipeline. The result is a single, auditable source of liquidity truth that participants, counterparties, and regulators all share, rather than competing claims from different off-chain feeds.

This proposal requests funding **exclusively for the Canton-specific on-ledger build**. Stratalink's off-chain computation infrastructure (Layers 1–3) and Canton Adapter (Layer 4) are funded independently by Stratalink. The grant covers the Daml contract layer development.

**Grant-funded deliverables:**

| Deliverable | Description | Sprint |
|---|---|---|
| Daml Orchestrator & Request Contracts | Platform initialisation, Compliance Officer onboarding, public key management, and Institutional Consumer request submission with output type selection (PoLi Score, Depth, Threshold, Signed Claims). | Sprint 1 |
| Daml Attestation Contracts | Atomic creation of attestation records persisting off-chain oracle calculations on-ledger. Includes TTL management (validUntil), cryptographic signature fields, and consumer/observer visibility. | Sprint 2 |
| Consumer Verification Capabilities | On-ledger logic enabling Institutional Consumers to independently verify attestation signatures against the Platform Operator's public key and detect STALE status against current ledger time. | Sprint 2 |
| Compliance Observer Configuration | Native Canton observer-party permissions automatically assigning the Compliance Officer as observer on all attestation contracts. Protocol-enforced read-only audit trail. | Sprint 1–2 |
| Integration Test Suite | End-to-end validation: System Initialisation → Consumer Request → Operator Accept/Reject → Attestation Publication → Consumer Verification. | Sprint 3 |
| Technical Handover Documentation | Full operational guides and Daml contract specifications for MVP deployment. | Sprint 3 |

**Stratalink-funded scope (not in grant):**

| Component | Status |
|---|---|
| DACT — Venue data aggregation across 14 exchanges | Operational |
| STRATA AI — AI-driven liquidity analysis and manipulation detection | Operational |
| PoLi — Scoring methodology, evidence ladder, attestation generation | Operational |
| Oracle Core — HSM signing, publication policy, TTL assignment | In development (concurrent) |
| Canton Adapter — Ledger API integration, event monitoring, publication | In development (concurrent) |
| Daml Contract Specification — detailed spec provided to IntellectEU | Complete |
| ADGM Regulatory Pilot — fourteen venues | Commencing April/May 2026 |

**Co-investment:** Stratalink makes a significant co-investment in internal engineering, management, and infrastructure costs for the Canton integration. The grant targets the funding of Dapp development.

> **MVP Scope Note:** This Phase 1 MVP delivers the **on-demand Request-Fulfillment** contract layer on Canton devnet. The production oracle model — with periodic publication cadence and mainnet deployment — is Phase 2, to be proposed separately upon successful Phase 1 delivery, consistent with CIP-0100's quarterly milestone structure.

---

## 2. Technical Approach

### Architecture

The PoLi Oracle follows the same architectural pattern as Chainlink on Canton: all computation executes off-chain within proprietary infrastructure; only attested, signed outputs are published to Canton via a validator node.

| Component | Location | Description |
|---|---|---|
| DACT (Layer 1) | Stratalink off-chain | Venue data aggregation and normalisation across fourteen institutional exchanges |
| STRATA AI (Layer 2) | Stratalink off-chain | AI-driven analysis: manipulation detection, anomaly identification, liquidity regime classification |
| PoLi (Layer 3) | Stratalink off-chain | Scoring methodology, evidence ladder (L1–L5), cryptographic attestation generation |
| Oracle Core (Layer 4) | Stratalink off-chain | Attestation signing (HSM), publication policy, TTL assignment, format standardisation |
| Canton Adapter (Layer 4) | Stratalink → Canton | Ledger API integration: monitors AttestationRequest events, publishes signed Attestation contracts |
| **Daml Contracts** | **Canton Network** | **Oracle Orchestrator, AttestationRequest, Attestation contracts — GRANT-FUNDED SCOPE** |

**Computation boundary:** No proprietary scoring algorithms, AI reasoning models, or raw venue data are deployed to the Canton Network. Daml contracts strictly encode request routing, data persistence, and verification logic. All computation remains off-chain with Stratalink. This boundary is absolute.

### On-Demand Lifecycle (Scenario 2 MVP)

The MVP implements an on-demand Request-Fulfillment model:

| Step | Actor | Action |
|---|---|---|
| 1. Initialise | Stratalink (Platform Operator) | Creates the Oracle Orchestrator contract on Canton with Compliance Officer onboarded as observer. One-time setup. |
| 2. Request | Institutional Consumer | Exercises Request Attestation choice on the Orchestrator, specifying asset pair and output type. Creates an AttestationRequest contract. |
| 3. Process | Stratalink (via Canton Adapter) | Detects the AttestationRequest via Ledger API. Triggers off-chain computation (DACT → STRATA AI → PoLi). Exercises Process Request choice. |
| 4. Publish | Stratalink (via Canton Adapter) | Archives the AttestationRequest and atomically creates the Attestation contract with PoLi score, TTL, cryptographic signature, and consumer/regulator visibility. |
| 5. Verify | Institutional Consumer | Fetches Attestation contract. Verifies signature against Platform Operator's public key. Checks TTL freshness (STALE detection). Consumes data in workflow. |
| 6. Observe | Compliance Officer | Reads attestation data via observer-party permissions. Verifies link between initial request and issued data. Protocol-enforced audit trail. |

### Oracle Feed Types

The system provides four oracle feed types: **PoLi Score Feed** (overall liquidity health with confidence interval), **Depth Feed** (aggregated orderbook depth summary), **Threshold Feed** (binary confirmations for minimum liquidity requirements), and **Signed Claims** (full provenance metadata for compliance and audit).

### Daml Contract Design & Canton Integration

This section describes how the PoLi Oracle contracts are designed to work within Canton's privacy model, validator architecture, and Daml's unique rights-management paradigm.

**Party model and rights structure.** The oracle system defines three distinct party roles, each with specific Daml signatory and observer rights:

| Party | Daml Role | Rights | Rationale |
|---|---|---|---|
| Platform Operator (Stratalink) | Signatory on Orchestrator and Attestation contracts | Create Orchestrator, process requests, publish attestations, update public key | Single authoritative source of attested data — no other party can create or modify attestations |
| Institutional Consumer (IC) | Controller on Request Attestation choice | Exercise request choice on Orchestrator, fetch and verify attestations, exercise verification choice | Consumers initiate the workflow but cannot influence the attested output |
| Compliance Officer (CO) | Observer on all attestation contracts | Read-only visibility across all attestation data, verify request-to-attestation linkage | Regulatory audit trail without modification rights or performance impact |

**Canton privacy model integration.** Canton's sub-transaction privacy is fundamental to the oracle's design. Unlike public blockchains where all data is visible to all participants, Canton ensures that contract data is only visible to parties with explicit rights:

- The **Orchestrator contract** is disclosed (not stakeholder-visible) to Institutional Consumers. This means ICs can fetch the contract's public key and metadata via the Ledger API using Canton's disclosure mechanism, without being signatories or observers. They cannot see other consumers' requests or attestations.
- **AttestationRequest contracts** are visible only to the requesting IC and the Platform Operator. Other consumers on the network cannot see that a request has been made, what asset pair was requested, or when. This preserves commercial confidentiality — a trading firm's liquidity queries are not leaked to competitors.
- **Attestation contracts** are scoped to the requesting IC (as stakeholder), the Platform Operator (as signatory), and the Compliance Officer (as observer). No broadcast publication occurs. If Consumer A requests an attestation for BTC/USDT, Consumer B has no visibility of that attestation unless they independently request their own.
- This privacy architecture means the oracle can serve competing institutional consumers on the same Canton network without information leakage — a critical requirement for institutional adoption that public-chain oracles cannot satisfy.

**Validator node and Ledger API interaction.** Stratalink operates a dedicated validator node on Canton, deployed via IntellectEU's Catalyst Blockchain Manager. The interaction between Stratalink's off-chain infrastructure and the Canton ledger occurs exclusively through the gRPC Ledger API:

- The **Canton Adapter** (Stratalink's Layer 4 component) maintains a persistent connection to the Ledger API via the Stratalink validator node.
- It subscribes to the **transaction stream** filtered for AttestationRequest contract creation events where the Platform Operator is a stakeholder.
- When a new AttestationRequest is detected, the Adapter extracts the request parameters (asset pair, output type, consumer identity) and triggers the off-chain computation pipeline (DACT → STRATA AI → PoLi → Oracle Core).
- The signed attestation output is submitted back via the Ledger API as a **command** exercising the Process Request choice on the AttestationRequest contract, which atomically archives the request and creates the Attestation contract in a single Canton transaction.
- The Adapter never reads or writes Canton state outside of its own contracts. It has no visibility into other participants' workflows, settlements, or data — consistent with Canton's privacy guarantees.

**Daml contract state transitions.** The contract lifecycle follows a strict, auditable state machine:

```
[Orchestrator] → (IC exercises RequestAttestation) → [AttestationRequest]
    → (PO exercises RejectRequest) → [Archived, no output]
    → (PO exercises ProcessRequest) → [Archived] + [Attestation created atomically]
        → (IC exercises VerifyAttestation) → [Verification result returned, contract unchanged]
```

Each transition is a single Canton transaction with deterministic outcomes. The atomic archive-and-create pattern on ProcessRequest ensures no intermediate state where a request exists without a corresponding attestation (or explicit rejection). This eliminates race conditions and provides a clean audit trail for the Compliance Officer.

**Daml data model (simplified).** The core attestation record persisted on-ledger:

```
template Attestation
  with
    platformOperator : Party
    consumer : Party
    complianceOfficer : Party
    assetPair : Text
    outputType : OutputType  -- PoLiScore | DepthFeed | ThresholdFeed | SignedClaim
    calculationResult : Text  -- JSON-encoded oracle output
    poliScore : Optional Int  -- 0-100 score (when outputType = PoLiScore)
    createdAt : Time
    validUntil : Time  -- TTL enforcement
    attestationSignature : Text  -- HSM-produced signature over payload
    methodologyHash : Text  -- hash of scoring methodology version
    merkleRoot : Text  -- provenance anchor
  where
    signatory platformOperator
    observer consumer, complianceOfficer
    
    choice VerifyAttestation : VerificationResult
      controller consumer
      do
        now <- getTime
        let isStale = now > validUntil
        let sigValid = verifySignature platformOperatorPubKey payload attestationSignature
        return VerificationResult with ..
```

This is a simplified representation that will evolve to become production-grade. The key design decisions: the Platform Operator is sole signatory (only they can create attestations), the consumer and CO are observers (read and verify, never modify), the verification choice is non-consuming (the attestation persists after verification), and the TTL check uses Canton's native ledger time.

---

## 3. Architectural Alignment

### Canton Protocol Alignment

- **Privacy model:** Attestation contracts use Canton's native observer-party model. Consumers are only visible on contracts they explicitly request. Compliance Officers gain read-only access without modification rights. No broadcast publication.
- **Oracle pattern:** Follows the same chain-agnostic oracle model as Chainlink on Canton — off-chain computation, on-ledger attested outputs, validator node presence.
- **Transaction efficiency:** On-demand model minimises Canton Coin transaction volume during MVP phase. Each attestation is a single Canton transaction, generating validator rewards.
- **Daml contract design:** Contracts are asset-agnostic (dynamic asset pair input), use Canton's native time model for TTL enforcement, and separate concerns cleanly (Orchestrator → Request → Attestation).
- **Computation boundary:** Strictly maintained. No proprietary logic on-ledger. This preserves IP while maximising the public good value of the contract patterns.

### Reusable Infrastructure Patterns

The Daml contracts developed for the PoLi Oracle establish **reusable reference implementations** for any data oracle on Canton:
- Oracle Orchestrator pattern (singleton, operator-signatory, observer configuration)
- On-demand Request-Fulfillment lifecycle (consumer-triggered, operator-fulfilled)
- Consumer verification logic (signature verification, TTL/STALE detection)
- Compliance observer configuration (protocol-enforced audit trail)

These patterns are generalisable beyond liquidity to any data oracle use case on Canton.

### Open-Source Commitment

All grant-funded Daml contracts, integration test suites, and technical documentation will be published as open-source on GitHub under the Apache 2.0 licence, available as reference implementations for the Canton ecosystem. Stratalink's proprietary computation logic (Layers 1–3, STRATA AI scoring, Oracle Core) remains closed-source and entirely off-chain — the computation boundary ensures that open-sourcing the contract layer creates no IP exposure while maximising public good value.

### Security & Resilience

**Oracle manipulation resistance.** The architecture provides multiple layers of defence against false or manipulated attestations:

- **Single-operator signing authority.** Only Stratalink (the Platform Operator) can exercise the Process Request choice and publish attestations. No third party can submit data to the oracle contracts. Every attestation is cryptographically signed using HSM-protected keys — consumers verify this signature on-ledger before trusting the data.
- **Off-chain data integrity.** STRATA AI (Layer 2) applies machine learning models to detect and filter spoofing, wash trading, layering, and pump-and-dump patterns from raw venue data before it reaches the PoLi scoring engine. The published score represents a verified conservative floor of genuine liquidity, not raw orderbook data that could be manipulated at source.
- **Computation boundary enforcement.** Because all scoring logic executes off-chain, there is no attack surface on the Canton ledger itself. The Daml contracts only persist signed outputs — they cannot be manipulated by other Canton participants. An attacker would need to compromise Stratalink's HSM signing infrastructure to publish a false attestation.
- **TTL and freshness enforcement.** Every attestation carries a validUntil timestamp. Consumers verify freshness on-ledger — stale data is programmatically detected and flagged, preventing reliance on outdated attestations.

**Key rotation procedures.** The Orchestrator contract includes a dedicated choice for the Platform Operator to update the attestation public key. Operationally, Stratalink will implement scheduled key rotation (quarterly as baseline, with emergency rotation capability). Key rotation events are visible on-ledger — consumers automatically fetch the updated public key from the Orchestrator contract for subsequent verifications. HSM key management follows institutional-grade practices.

**Node outage handling.** In the on-demand (Scenario 2) model, if the Stratalink validator node goes offline:

- In-flight AttestationRequest contracts remain pending on the ledger. They are not lost or archived — they persist until the Platform Operator processes them.
- No stale or partial attestations are published. The system fails safe: consumers receive no data rather than incorrect data.
- Upon node recovery, the Canton Adapter detects and processes all pending AttestationRequests in order.
- Consumers can check the Orchestrator contract's liveness by monitoring response times. Extended outages would be communicated via operational status channels.
- Phase 2 (periodic publication) will introduce heartbeat monitoring and automated failover procedures.

---

## 4. Milestones and Deliverables

### Milestone Schedule

| Milestone | Deliverables | Verification Criteria | Timeline | Funding Release |
|---|---|---|---|---|
| **M1: Foundation & Orchestrator** | Oracle Orchestrator contract live on Canton devnet. Compliance Officer onboarded. Public key management operational. AttestationRequest choice functional. | Demonstrated on devnet: Consumer can submit an AttestationRequest via the Orchestrator. Compliance Officer is visible as observer. | End of Sprint 1 (Week 2) | 33% |
| **M2: Attestation & Verification** | Attestation contracts creating on acceptance. TTL enforcement operational. Signature verification functional. Consumer verification choice working. | Demonstrated on devnet: Full lifecycle from request to published attestation. Consumer can verify signature and STALE status. CO can read attestation data. | End of Sprint 2 (Week 4) | 33% |
| **M3: Integration & Handover** | End-to-end integration test suite complete. Technical handover documentation delivered. All acceptance criteria met per user stories. | Full integration test report. Documentation review complete. Stratalink's Canton Adapter successfully publishing live attestations to devnet. | End of Sprint 4–5 (Week 8–10) | 34% |

**Total grant funding:** £40,000 equivalent in Canton Coin, released across three milestones (33% / 33% / 34%) upon demonstrated delivery.

**Risk mitigation:** The Agile sprint methodology provides built-in flexibility to adjust scope within sprints if technical issues arise. The Delivery Manager is specifically tasked with unblocking issues, managing dependencies with Stratalink's Canton Adapter team, and ensuring sprint velocity stays on track.

### Team & Resources

IntellectEU is a Canton Foundation member, Canton Network validator, and the ecosystem's leading Daml development partner. The project will be delivered by a team composed of experts in Daml/Canton and Stratalink resources:

| Role | Allocation |
|---|---|
| Delivery Manager | Part-time oversight |
| Lead Daml Engineer | Advisory / code review |
| Blockchain Engineer (Daml) | Full-time dedicated |
| Back-end Developer | Full-time dedicated |

**Stratalink Labs (Self-funded):**

| Role | Contribution |
|---|---|
| Rob McDermott, Founder & CEO | 27 years institutional finance (Goldman Sachs, Deutsche Bank). MiFID II implementation. Project leadership, Daml specification, institutional engagement. |
| Engineering Team | Canton Adapter development, Oracle Core integration, off-chain computation infrastructure. |

---

## 5. Acceptance Criteria

The following acceptance criteria define specific, testable conditions for each deliverable.

### IAM1 — System Initialisation (Platform Operator)

**User Story:** Onboard into the system and initialise it, so that all subsequent attestations are governed under a regulated framework.

**Acceptance Criteria:**
1. A Genesis (Orchestrator) contract is successfully created on the ledger with the PO party as its signatory.
2. The Compliance Officer (CO) is onboarded into the system.
3. The CO is defined as an Observer on the Orchestrator contract.
4. The contract contains a field with the PO's attestation public key.
5. The contract contains a choice for the PO to update the public key.

### MKT1 — Request Attestation (Institutional Consumer)

**User Story:** Request an Attestation, so that I can provide my specific requirements for oracle calculations and output type.

**Acceptance Criteria:**
1. The Orchestrator contract is disclosed to the IC party.
2. The IC can fetch the contract details via the Ledger API without being a stakeholder of it.
3. An AttestationRequest contract is created upon exercising a choice on the Orchestrator contract with the PO as the provider.
4. The request includes the output type (PoLi Score Feed, Depth Feed, Threshold Feed, Signed Claims) and a data schema for possible input parameters.

### MKT2 — Reject Attestation Request (Platform Operator)

**User Story:** Reject an Attestation request, so that invalid or high-risk requests are not fulfilled.

**Acceptance Criteria:**
1. The AttestationRequest contract is archived upon rejection.
2. No downstream contracts are generated.
3. (Optional) A rejection reason is persisted for the IC to view.

### MKT3 — Accept Attestation Request (Platform Operator)

**User Story:** Accept an Attestation request, so that off-chain oracle calculations are persisted into the ledger.

**Acceptance Criteria:**
1. Exercising the accept choice archives the AttestationRequest and creates a new contract atomically.
2. The new contract matches the output type defined in the request by the IC.
3. The new contract includes the result of the off-chain oracle computation and calculations.
4. The CO is automatically added as an Observer to the new contract.
5. The CO can verify the link between the initial request and the final issued data.
6. The new contract contains a mandatory timestamp validUntil (TTL) field.
7. The ledger time at creation must be less than the validUntil timestamp.
8. The new contract carries a cryptographic signature produced by the PO's signing key.

### MKT4 — Verify Attestation (Institutional Consumer)

**User Story:** Ingest the Attestation information, so that I can verify the integrity of the oracle data provided.

**Acceptance Criteria:**
1. The IC can fetch the Orchestrator contract through disclosure and access the PO's public key.
2. The IC is a stakeholder on the contract created in the acceptance and is able to fetch it.
3. The IC can exercise a choice in the contract to:
   - (a) verify the attestation signature against the payload using the public key.
   - (b) verify if the attestation result is STALE by checking if the attestation creation timestamp plus the attestation TTL field in seconds exceeds the ledger current time.

> **Verification note:** These acceptance criteria are testable, binary conditions. Each can be demonstrated on Canton devnet during milestone review. The integration test suite (Milestone 3) validates the complete lifecycle: IAM1 → MKT1 → MKT2/MKT3 → MKT4, confirming all criteria are met end-to-end.

---

## 6. Funding Request and Milestone Breakdown

| Item | Detail |
|---|---|
| **Total Grant Requested** | £40,000 equivalent in Canton Coin |
| **Grant Covers** | Daml contract development, integration testing, and technical documentation (8–10 calendar weeks / 4–5 Agile sprints) |
| **Grant Does NOT Cover** | Stratalink off-chain infrastructure (Layers 1–3), Canton Adapter, HSM key management, ongoing node operations, or any proprietary computation |
| **Stratalink Co-Investment** | Significant internal engineering, management, and infrastructure investment by Stratalink |
| **Total Project Value** | Grant-funded development plus substantial Stratalink co-investment |
| **Duration** | 8–10 calendar weeks (4–5 Agile sprints) |
| **Funding Release** | Three milestone payments (33% / 33% / 34%) upon demonstrated delivery |
| **Denomination** | Canton Coin at prevailing rate at each milestone |
| **Proposed Sponsor** | IntellectEU (Canton Foundation member) |

---

## 7. Benefit to Canton Network

### Network-Wide Utility

| Stakeholder | Direct Benefit |
|---|---|
| Clearing Houses & CCPs | Pre-trade liquidity verification for margin decisions and counterparty risk assessment within settlement workflows |
| Custodians | Collateral quality assurance based on verified liquidity depth, not assumed market conditions |
| Prime Brokers & Trading Firms | Pre-execution liquidity intelligence for block trades. Risk management inputs for client portfolios. |
| Regulators & Compliance | Real-time supervisory visibility via Canton's native observer-party model. Immutable audit trail linking requests to attested data. |
| Token Issuers | Verified liquidity history for tokenised assets seeking listing or institutional adoption on Canton |
| All Validators | Every PoLi attestation is a Canton Coin transaction generating validator rewards. Transaction volume scales with consumer adoption. |

### Canton Coin Economics

As a Canton-native application, the PoLi Oracle generates Canton Coin transaction fees with every attestation published. As publication frequency scales from on-demand (Phase 1) to periodic cadence (Phase 2) and consumer count grows, transaction volume increases linearly. Once operational, Stratalink intends to apply for Featured Application status, earning Canton Coin app rewards from the network reward pool.

---

## 8. Global Go-to-Market & Adoption Strategy

### Market Positioning

Stratalink positions the PoLi Oracle as **the institutional liquidity verification standard for Canton Network** — the liquidity equivalent of what Chainlink provides for pricing. The value proposition is simple: Canton has pricing feeds and settlement mechanics, but no way for participants to verify liquidity on-ledger. PoLi fills that gap.

The target market is institutional participants on Canton who need verified liquidity data for operational decisions: margin calculations, counterparty risk assessment, collateral valuation, pre-trade execution analysis, and regulatory reporting.

### Customer Segments & Prioritisation

| Segment | Use Case | Priority | Why |
|---|---|---|---|
| **Prime Brokers** | Pre-trade liquidity verification for client block execution. Risk management inputs for client portfolios. | Phase 1 (Immediate) | Direct commercial need. Melvis (Canton Foundation ED) is facilitating introductions to Ripple Prime, LTP, and Matrixport. |
| **Trading Firms & Market Makers** | Real-time liquidity intelligence for execution strategy. Cross-venue liquidity comparison. | Phase 1 (Immediate) | High-frequency consumers generating attestation volume. Canton Foundation identifying targets. |
| **Clearing Houses & CCPs** | Margin adequacy assessment. Counterparty risk monitoring using verified liquidity depth. | Phase 2 (Post-mainnet) | Require production-grade, periodic attestations. Engage during devnet testing, convert on mainnet. |
| **Custodians** | Collateral quality verification. Proof that held assets are genuinely liquid. | Phase 2 (Post-mainnet) | Similar to clearing houses — need production reliability before integration. |
| **Regulators** | Supervisory liquidity monitoring via Canton's observer-party model. | Phase 2–3 | Regulatory adoption follows commercial adoption. Observer permissions already architected. |
| **Token Issuers** | Verified liquidity track record for listings and institutional adoption. | Phase 3 | Derivative demand — grows as the oracle becomes an industry standard. |

### Geographic Strategy

| Region | Approach | Regulatory Context |
|---|---|---|
| **Abu Dhabi / MENA** | Lead market. Stratalink has established presence and Canton ecosystem has strong MENA engagement (Ripple Prime, institutional tokenisation activity). | ADGM regulatory pilot commencing April/May 2026 |
| **Europe / UK** | Second market. Rob McDermott's institutional network (Goldman Sachs, Deutsche Bank). MiFID II expertise provides credibility with European institutional buyers. | FCA dialogue ongoing via regulatory consultation process |
| **Asia-Pacific** | Third market via partnerships. LTP (300+ institutional clients, $400B+ annual volume) and Matrixport provide APAC distribution without Stratalink needing local operations. | Via partner network |
| **North America** | Phase 3. Enter via Canton's existing institutional ecosystem (DTCC, Goldman Sachs GS DAP, Tradeweb). | US Reg NMS context |

### Distribution Channels

**1. Canton Foundation introductions (Primary — Phase 1).** The Foundation is actively facilitating introductions to trading firms and prime brokers on Canton. This is the highest-conversion channel because targets are already Canton participants with existing validator nodes and Daml workflows. Melvis Langyintuo (ED) is coordinating.

**2. IntellectEU ecosystem (Secondary — Phase 1–2).** IntellectEU's client base includes institutional blockchain adopters across the Americas, Europe and the Middle East. IntellectEU can introduce PoLi to clients already using Catalyst for Canton deployments.

**3. Direct institutional engagement (Ongoing).** Rob McDermott's 27-year institutional finance network spanning Goldman Sachs, Deutsche Bank, and MiFID II implementation across European sell-side. Direct relationship-based selling to institutional buyers.

**4. Canton Featured Application programme (Phase 2).** Upon mainnet launch, Stratalink will apply for Featured Application status. This provides visibility to all Canton participants and generates Canton Coin app rewards, creating a self-reinforcing adoption loop.

### Commercial Model

| Component | Model | Detail |
|---|---|---|
| **On-demand attestations (Phase 1)** | Free during devnet testing | Removes friction for institutional partners to evaluate. Cost covered by Stratalink co-investment. |
| **Subscription access (Phase 2)** | Tiered annual subscription | Institutional consumers pay for production-grade, periodic attestation feeds. Tiered by asset pair coverage and publication frequency. |
| **Premium analytics (Phase 2–3)** | Usage-based pricing | Enhanced data products: historical liquidity trends, venue-level decomposition, stress scenario modelling. Commercial premium layer on top of public good infrastructure. |
| **Canton Coin economics** | App rewards + transaction fees | Every attestation generates Canton Coin fees. Featured Application status provides additional CC rewards. Volume scales linearly with consumer count and publication frequency. |

### Adoption Targets — First 3 Months Post-MVP

| Metric | Target | How |
|---|---|---|
| Institutional Partners Engaged | 4–6 trading firms and prime brokers | Via Canton Foundation introductions. Initial targets: Ripple Prime, LTP, Matrixport, and additional firms identified by the Foundation. |
| Active Consumers on Devnet | 2–3 institutional consumers testing the on-demand flow | Direct onboarding through partnership conversations. IntellectEU ecosystem network. |
| Attestation Volume | 50–100 on-demand attestations per month on devnet | Consumer testing and integration validation. |
| Asset Pair Coverage | Top 5 institutional-grade token pairs | BTC/USDT, ETH/USDT, BTC/USD, ETH/USD, SOL/USDT. Asset-agnostic schema enables expansion. |

The devnet MVP serves as the institutional validation environment: partners engaged during this phase are evaluating PoLi for production integration. Successful devnet testing converts directly to Phase 2 mainnet consumers — these are not separate pipelines but sequential stages of the same institutional onboarding process.

### Adoption Milestones — 12-Month Outlook

| Timeframe | Milestone | Success Metric |
|---|---|---|
| Month 1–2 | MVP live on devnet. First institutional partners onboarded for testing. | 2+ partners actively querying attestations. |
| Month 3–4 | Mainnet migration. Featured Application application submitted. | Contracts live on mainnet. CC rewards active. |
| Month 4–6 | Periodic publication operational. First commercial subscription signed. | 1+ paying subscriber. 1,000+ attestations/month. |
| Month 6–9 | APAC expansion via LTP/Matrixport. Second geographic market active. | 5+ active institutional consumers across 2+ regions. |
| Month 9–12 | Atomic CIP submitted. Clearing house / CCP pilot initiated. | CIP under review. 1+ clearing house evaluating integration. |

### Phase 2 Roadmap (Post-MVP — Separate Grant Proposal)

| Milestone | Description | Estimated Timeline |
|---|---|---|
| Mainnet Migration | Validator node and contracts migrated from devnet to Canton mainnet | Month 3–4 post-MVP |
| Periodic Publication (Scenario 1) | Scheduled attestation publication cadence (initially every few minutes, scaling to sub-minute) | Month 4–6 post-MVP |
| Featured Application | Application for Canton Coin app rewards programme | Upon mainnet launch |
| First Commercial Consumer | Signed subscription agreement with an institutional consumer on Canton | Month 4–6 post-MVP |
| Phase 3: Atomic CIP | Canton Improvement Proposal for atomic liquidity verification within settlement workflows | Month 9–12 post-MVP |

---

## 9. Execution Readiness

| Proof Point | Evidence |
|---|---|
| Off-chain infrastructure operational | Fourteen institutional venues live: Binance, Coinbase, Kraken, dYdX, Uniswap, and OTC venues. Real-time data ingestion, PoLi scoring, and liquidity stress dashboards. |
| Technical architecture validated | Daml leads conducted technical deep-dive. Scenario 2 (on-demand) selected as MVP. Detailed user stories with acceptance criteria produced. |
| Joint team mobilised | IntellectEU and Stratalink have jointly scoped the delivery over 8–10 calendar weeks / 4–5 Agile sprints. Scope, team, and deliverables specified. Commercial terms agreed. |
| Regulatory engagement | ADGM regulatory pilot commencing April/May 2026. FCA dialogue ongoing via regulatory consultation process. |
| Ecosystem alignment confirmed | Canton Foundation ED (Melvis Langyintuo) actively supporting. Canton Strategic Holdings President (Mark Toomey) endorsed. Telegram coordination group established. |
| AI manipulation detection proven | STRATA AI filters spoofing, wash trading, and pump-and-dump patterns from venue data. Produces a verified conservative floor of genuine liquidity. |
| Team credibility | CEO with 27 years institutional finance (Goldman Sachs, Deutsche Bank). IntellectEU as Canton's leading Daml Experts. |

---

## 10. Long-Term Maintenance & Stewardship

### Open-Source Repository Stewardship

Stratalink Labs will serve as the long-term steward of the open-source Daml contract repository following grant completion. This includes:

- **Ongoing repository ownership.** Stratalink will maintain the public GitHub repository, review community contributions, manage issues, and publish updates as the Canton protocol evolves (e.g., Daml SDK upgrades, Canton version migrations).
- **Contract evolution.** As PoLi moves from Phase 1 (on-demand, devnet) to Phase 2 (periodic publication, mainnet) and Phase 3 (atomic CIP), updated contract versions will be published to the open-source repo, ensuring the reference implementations remain current and useful to the ecosystem.
- **Documentation maintenance.** Technical documentation and integration guides will be kept up to date with each contract release.

### Post-Delivery Support

- **Stratalink: 3-month bug-fix commitment.** For 3 months following Milestone 3 acceptance, Stratalink commits to triaging and resolving any defects discovered in the grant-funded Daml contracts at no additional cost. This covers functional bugs against the agreed acceptance criteria, not feature enhancements.
- **IntellectEU: maintenance available under separate agreement.** Post-delivery Daml contract maintenance, performance optimisation, and feature development for Phase 2 are available under a separate support agreement to be negotiated with IntellectEU. This ensures continuity of Daml expertise without over-committing grant-funded resources.
- **Operational continuity.** Stratalink operates the oracle infrastructure (validator node, Canton Adapter, off-chain computation stack) as a commercial service. The oracle's ongoing operation is not dependent on the grant — it is core to Stratalink's business model. This ensures the grant-funded contracts remain actively used and maintained beyond the grant period.

---

## Contact

| | |
|---|---|
| **Applicant** | Rob McDermott, Founder & CEO, Stratalink Labs Ltd |
| **Location** | London · Abu Dhabi |
| **Email** | robert@stratalink.ai |
| **Technical Partner** | IntellectEU |
| **Commercial Partner** | IntellectEU |

---

*This proposal is submitted to the Canton Foundation Tech & Ops Committee for evaluation under the Protocol Development Fund (CIP-0082 / CIP-0100). Stratalink Labs Ltd reserves all intellectual property rights in its proprietary technology (Layers 1–3 and Oracle Core).*
