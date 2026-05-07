# Proposal: Institutional Liquidity Verification Infrastructure for Canton Network

## Proposal Title

PoLi (Proof of Liquidity) — Institutional-Grade Liquidity Verification Infrastructure for Canton Network

## Proposer(s)

- **Stratalink Labs Ltd** — Liquidity verification technology provider
- **IntellectEU** — Canton Network Super Validator (Weight 1) and Premier Foundation Member; integration and deployment partner via the Catalyst Blockchain Manager (BCM)

## Champion / Sponsor

**Champion:** Jonathan Mayeur — Head of Product, IntellectEU; Canton Foundation Board Member and Tech & Ops Committee Member.

**Sponsor:** IntellectEU — Canton Foundation Premier Member and Super Validator (Weight 1).

## Category

Critical Infrastructure / Developer Tooling

---

## 1. Objective and Scope

### Problem Statement

Canton Network is positioning itself as the institutional-grade Layer 1 for capital markets, with participants including DTCC, Euroclear, HSBC, BNY, Broadridge, and Tradeweb. As Real World Asset (RWA) tokenisation accelerates across the network, institutional participants face a gap that shouldn't still exist: **there is no independent, verifiable mechanism to assess the actual liquidity of digital assets traded or settled on Canton.**

This matters because:

- **Clearing houses and CCPs** cannot accurately set margin requirements without verified liquidity data. Illiquid assets require higher margins, but without reliable liquidity measurement, risk models either over-collateralise (reducing capital efficiency) or under-collateralise (creating systemic risk).
- **Institutional asset managers** operating under fiduciary obligations need independent verification that assets they hold or trade have sufficient market depth. Best execution obligations under MiFID II, and equivalent regimes in ADGM and other jurisdictions, require demonstrable evidence of liquidity assessment.
- **Regulators** including the FCA, ADGM FSRA, and MAS are developing supervisory frameworks for tokenised assets that will require liquidity transparency as a precondition for institutional participation. Canton's privacy architecture is the reason institutions will use it. But that same privacy means liquidity data can't be read off-chain directly — it needs to come through trusted, neutral infrastructure.
- **Market integrity** depends on the ability to distinguish genuinely liquid markets from those exhibiting artificial depth through wash trading, spoofing, or other manipulative practices. Digital asset markets are particularly vulnerable to these practices, and institutional participants require independent verification before committing capital.

Today, Canton participants must either rely on self-reported venue data (which is conflicted), build bespoke analytics (which is duplicative and inconsistent), or operate without liquidity verification at all (which is the current default for most participants). None of these would survive a compliance review at a tier-one asset manager.

### Proposed Solution

This proposal funds the integration of **PoLi (Proof of Liquidity)** — Stratalink's liquidity verification infrastructure — onto the Canton Network, delivered via IntellectEU's Catalyst Blockchain Manager (BCM).

PoLi provides:

- **Real-time, multi-venue liquidity scoring** — aggregating and normalising orderbook data across major digital asset venues (including Binance, Coinbase, Kraken, and others) into a single, verifiable liquidity score per asset
- **Manipulation detection** — identifying wash trading, spoofing, and artificial depth through proprietary pattern recognition and anomaly detection
- **Time-series liquidity estimation (TSLE)** — historical liquidity trend analysis enabling forward-looking risk assessment
- **Consolidated tape (DACT)** — a Digital Assets Consolidated Tape providing a normalised, real-time view of market depth across fragmented venues
- **Regulatory-ready outputs** — pre-formatted liquidity attestations and analytics designed for consumption by compliance functions and regulatory bodies

Once live, any Canton participant can query PoLi through standard Canton APIs and get an independent liquidity assessment back. Think of it as the digital asset equivalent of a consolidated tape or an independent pricing service.

### Scope

This proposal covers:

1. **Integration of PoLi with Canton Network** via BCM, including Daml contract development, Oracle Adapter interface specification, and DevNet deployment
2. **Participant-facing interfaces** enabling Canton applications and participants to request and consume PoLi attestations via standard Daml contracts and the JSON Ledger API
3. **Documentation and developer resources** for Canton builders who want to incorporate liquidity verification into their applications
4. **DevNet deployment and end-to-end validation** demonstrating the full attestation lifecycle: request → oracle acceptance → consumer verification → compliance audit trail
5. **Technical handover** including containerised local setup (Docker), operational guides, and Daml contract specifications

This proposal does **not** cover:

- Development of the PoLi scoring engine itself (this exists and is operational)
- Development of BCM (this exists and is operational)
- Venue connectivity buildout (Stratalink maintains this independently)
- Regulatory licensing or permissions for either party

### Ecosystem Value

Here's what PoLi on Canton means for specific participant types:

- **Clearing and settlement participants** (DTCC, Euroclear, Broadridge, Tradeweb) gain access to independent liquidity verification for margin calculation, best execution compliance, and risk management within Canton-based settlement workflows
- Custodians like BitGo, Copper, Zodia, and Taurus get a new capability to offer institutional clients: independently verified liquidity data on Canton-held assets.
- For buy-side firms with fiduciary obligations, PoLi provides the evidence trail they need to demonstrate liquidity assessment was part of their process.
- **Canton's competitive position** — No other institutional-grade blockchain network offers embedded, independent liquidity verification. This is a concrete differentiator for Canton in the institutional RWA market
- Regulators in the UK, ADGM, EU, and Singapore are building supervisory frameworks for tokenised assets. Participants already using PoLi won't be scrambling to comply — the infrastructure is already there.
- PoLi is infrastructure, not a venue or issuer. Its value comes from being independent.

---

## 2. Technical Approach

### Architecture Overview

The architecture keeps Canton's privacy model intact. PoLi sits outside the network and delivers verified data in through a defined integration layer.

```
┌─────────────────────────────────────────────────────────────┐
│                    CANTON NETWORK                            │
│                                                             │
│  ┌──────────────┐    ┌──────────────────────────────────┐  │
│  │   Canton      │    │   Integration Layer (NEW)         │  │
│  │   Participant │◄──►│                                   │  │
│  │   Application │    │   ┌─────────────────────────┐    │  │
│  └──────────────┘    │   │ Daml Contracts            │    │  │
│                       │   │ - Orchestrator            │    │  │
│                       │   │ - AttestationRequest      │    │  │
│                       │   │ - Attestation             │    │  │
│                       │   └────────────┬────────────┘    │  │
│  ┌──────────────┐    │                │                   │  │
│  │   Catalyst    │    │   ┌────────────▼────────────┐    │  │
│  │   Blockchain  │◄──►│   │ API Gateway             │    │  │
│  │   Manager     │    │   │ - Auth & Rate Limiting   │    │  │
│  │   (BCM)       │    │   │ - Data Transformation    │    │  │
│  └──────────────┘    │   │ - Response Caching        │    │  │
│                       │   └────────────┬────────────┘    │  │
│                       └────────────────┼────────────────┘  │
│                                        │                    │
└────────────────────────────────────────┼────────────────────┘
                                         │
                          ┌──────────────▼──────────────┐
                          │   PoLi Service (Stratalink)  │
                          │                              │
                          │   ┌────────────────────┐    │
                          │   │ PoLi Scoring Engine │    │
                          │   │ DACT Consolidated   │    │
                          │   │   Tape              │    │
                          │   │ TSLE Analytics      │    │
                          │   │ STRATA AI           │    │
                          │   └────────────────────┘    │
                          │           ▲                  │
                          │   ┌───────┴──────────┐      │
                          │   │ Venue Connectors  │      │
                          │   │ Binance│Coinbase  │      │
                          │   │ Kraken │ [Others] │      │
                          │   └──────────────────┘      │
                          └─────────────────────────────┘
```

### Key Design Principles

1. **PoLi as a service, not source code** — Canton participants consume PoLi outputs through defined API endpoints. The PoLi scoring engine operates externally to Canton. Stratalink's IP stays with Stratalink. What reaches Canton is the verified output.

2. **Privacy-preserving** — The integration respects Canton's sub-transaction privacy model. Liquidity queries and results are shared only with the requesting participant unless explicitly published. No participant's trading activity or portfolio composition is revealed through the liquidity verification process.

3. **Canton-native interfaces** — Daml smart contracts provide the query and attestation interface, meaning Canton application developers interact with PoLi using the same tooling and patterns they use for any Canton workflow.

4. **BCM-deployed** — IntellectEU's Catalyst Blockchain Manager handles deployment, configuration, and operational management of the integration layer, leveraging their existing Canton infrastructure and operational expertise.

### Component Detail

#### Daml Smart Contracts

The Daml contract layer will include:

- **Orchestrator** — Platform initialisation contract supporting public key persistence management and system configuration. Stratalink operates as Platform Operator (sole signatory)
- **AttestationRequest** — Template enabling any authorised Canton participant (Institutional Consumer) to request a liquidity score for a specified asset, including Asset ID and Calculation Type parameters
- **Attestation** — Atomic attestation record containing PoLi score, calculation results, TTL management (validUntil timestamp), and cryptographic signature fields, with on-ledger signature and TTL validation

_Detailed Daml contract specifications are defined in the signed IntellectEU SOW (#USGTC 20260010) and will be refined during Sprint 1._

#### API Gateway

The API gateway translates between PoLi's REST API outputs and the Daml contract layer. Key functions:

- Authentication and authorisation of Canton participants
- Rate limiting and fair usage enforcement
- Data format transformation (JSON to Daml-compatible structures)
- Response caching for frequently queried assets
- Health monitoring and failover

_API specifications are covered by the Oracle Adapter Interface Specification deliverable in Milestone 1._

#### Data Pipeline

- Real-time score delivery for on-demand queries (target: sub-second response)
- Scheduled batch delivery for subscription-based monitoring
- Historical data access for TSLE trend analysis
- Event-driven alerts for material liquidity changes

### Security Considerations

- **No private keys or trading credentials** are shared between systems. PoLi reads public orderbook data from venues.
- **API authentication** uses industry-standard token-based mechanisms with key rotation.
- **Data integrity** is ensured through cryptographic signing of PoLi score attestations before delivery to the Daml contract layer.
- **Availability** — The integration layer will be designed for high availability with redundancy aligned to BCM's existing operational SLAs.
- **Audit trail** — All queries and attestations are recorded on-ledger via Daml contracts, providing full traceability for regulatory purposes.

---

## 3. Architectural Alignment

### Alignment with Canton Network Architecture

**Privacy model** — PoLi's service-based architecture aligns directly with Canton's sub-transaction privacy. Liquidity scores are delivered as discrete attestations to specific participants, not broadcast to the network. Participants control who can see their liquidity queries and the resulting scores.

**Composability** — Daml contracts for PoLi are designed as interfaces that other Canton applications can compose with. A clearing house application could incorporate a PoLi liquidity check as a precondition for accepting a new asset for clearing. No coordination with Stratalink needed — the Daml interfaces handle it.

**Scalability** — The computational load of liquidity scoring sits with the PoLi service, external to Canton's sequencer. Only the lightweight query/response interactions traverse the Canton network, minimising additional sequencer load.

**Token Standard compatibility** — PoLi outputs can be associated with any asset adhering to the Canton Token Standard, enabling liquidity verification for tokenised equities, fixed income, real estate, and other RWAs as they are issued on Canton.

### Alignment with Existing Canton Ecosystem

- **IntellectEU / BCM** — PoLi is deployed and operated through BCM, leveraging IntellectEU's existing multi-tenant Super Validator infrastructure and their proven Canton operational capability (demonstrated through CIP-0058 milestone delivery including escrow mechanics for milestone-based rewards).
- **Kaiko** (General Member) — Kaiko provides market data and analytics. PoLi is complementary, not duplicative: PoLi provides an independent *verification and scoring* layer that consumes raw market data (from multiple sources) and produces verified liquidity attestations. The distinction is between data provision (Kaiko) and liquidity verification infrastructure (PoLi).
- **Clearing and settlement participants** (DTCC, Euroclear, Broadridge, Tradeweb) — These institutions are the primary consumers of liquidity verification. PoLi's outputs enable them to operate their Canton-based clearing and settlement workflows with appropriate risk controls.
- **Custodians** (BitGo, Copper, Zodia, MPCH, Taurus) — Custodians can surface PoLi liquidity data to their institutional clients, adding value to their Canton custody offering.

### Dependencies

- Canton Network mainnet (operational)
- IntellectEU BCM (operational)
- Canton Token Standard (operational)
- Stratalink PoLi API (operational)
- No dependency on changes to Canton core protocol or Splice reference applications

---

## 4. Milestones and Deliverables

All milestones are completable within one quarter as required by CIP-0100. The milestone structure maps directly to the signed IntellectEU SOW (#USGTC 20260010), which covers 4 sprints across 8–10 calendar weeks.

### Milestone 1: Design, Specification & Orchestrator Contracts
**Duration:** Sprints 1–2 (Weeks 1–4)

| Deliverable | Description | Acceptance Criteria |
|---|---|---|
| Integration Architecture Document | Technical specification for PoLi-Canton integration via BCM, covering data flow, security model, and API design | Reviewed and approved by IntellectEU and Stratalink technical leads |
| Daml Orchestrator & Request Contracts | Codebase supporting platform initialisation, public key persistence management, and attestation request parameters (Asset ID, Calculation Type) | Contracts compile, deploy to Canton DevNet, and pass unit tests |
| Oracle Adapter Interface Specification | Daml template identifiers, choice names, argument structures, Ledger API schema, transaction payload format, and authentication requirements for oracle attestation submission | Published in project repository with Bruno API client collection |
| Test Plan | Validation strategy covering state transitions, consumer verification logic, and end-to-end MVP data flow | Approved by project leads |

### Milestone 2: Attestation Logic, Compliance Configuration & Testing
**Duration:** Sprint 3 (Weeks 5–6)

| Deliverable | Description | Acceptance Criteria |
|---|---|---|
| Daml Attestation Contracts | Atomic creation of attestation records including output types, calculation results, TTL management (validUntil), signature fields, and on-ledger TTL/signature validation | Contracts pass automated test suite on Canton DevNet |
| Compliance Officer Access Configuration | Read-only access for off-ledger Compliance Officer entity with equivalent visibility to Platform Operator across the full request-to-issuance chain | Demonstrated on DevNet with confirmed audit trail |
| DAML-Level Test Suite | Comprehensive validation of MVP on-demand data flow, state transitions, and consumer verification logic | All tests pass; test coverage documented |
| End-to-End MVP Validation | Full lifecycle demonstration on Canton DevNet: system initialisation → request submission → oracle acceptance → consumer verification → compliance audit trail | Acceptance criteria per SOW Amendment A4 satisfied |

### Milestone 3: DevNet Deployment, Documentation & Handover
**Duration:** Sprint 4 + Docker handover (Weeks 7–10)

| Deliverable | Description | Acceptance Criteria |
|---|---|---|
| Canton DevNet Deployment | End-to-end PoLi attestation flow running against live Canton DevNet environment | Independent verification that full lifecycle is functional |
| Technical Handover Documentation | Operational guides and Daml contract specifications for MVP implementation, including deployment guidelines | Reviewed by IntellectEU and Stratalink technical leads |
| Docker Images | Containerised solution for local Canton setup enabling independent testing and development | Images build, run, and reproduce DevNet demonstration locally |
| Developer Documentation | Integration guide, API reference, and worked examples for Canton developers consuming PoLi attestations | Published and accessible via Canton developer resources |
| Operational Runbook | Production operations documentation including monitoring, alerting, and incident response procedures | Reviewed by IntellectEU operations team |

### Post-Grant: Adoption & Ecosystem Expansion
**Duration:** Ongoing (self-funded by Stratalink)

These are not part of the grant. Stratalink funds them independently:

- **MainNet deployment** — Migration from DevNet to Canton MainNet, targeting July 2026
- **Featured App submission** — Canton Featured App application, mid-June 2026
- **Institutional participant onboarding** — Target 3–5 institutional participants in first quarter post-launch
- **Expanded asset coverage** — PoLi scores for top 20 digital assets relevant to Canton participants
- **Regulatory engagement** — Continued ADGM FSRA and FCA engagement referencing PoLi-Canton integration

---

## 5. Acceptance Criteria

### Per-Milestone Acceptance

Technical milestones will be assessed by the Core Contributors Group for code quality, documentation completeness, and architectural compliance.

### Overall Project Success Criteria

The project will be considered successful when:

1. **Daml contract codebase is delivered and accepted** — All contracts satisfy the acceptance criteria defined in the SOW (Amendment A4), demonstrated end-to-end on Canton DevNet
2. **Integration is independently verifiable** — A Canton participant can submit an attestation request, receive a PoLi score with cryptographic signature, and verify that signature on-ledger without Stratalink intervention
3. **Compliance audit trail is functional** — A Compliance Officer entity has confirmed read-only visibility across the full request-to-issuance chain
4. **Documentation enables independent development** — Technical handover documentation, Docker images, and developer guides are sufficient for a Canton developer to integrate PoLi attestations without direct support
5. **Operational handover is complete** — Stratalink has accepted the codebase and can deploy, operate, and extend the integration independently

### Long-Term Maintenance

Post-delivery maintenance will be structured as follows:

- **Integration Layer** — Maintained jointly by IntellectEU (Daml contracts, BCM deployment) and Stratalink (API specifications, data schemas). Documentation will be detailed enough for Core Contributors to take over maintenance if needed. This is a CIP-0100 requirement and we've built the milestones around it.
- **PoLi Service** — Maintained by Stratalink as an ongoing commercial service. Stratalink is Canton-native — Canton is the primary target blockchain for PoLi deployment. Service continuity is incentivised by Stratalink's commercial model, which generates revenue through participant usage fees on the network.
- **Upgrade path** — Daml contract upgrades will follow Canton's Smart Contract Upgrade (SCU) process. API versioning will ensure backward compatibility with a minimum 6-month deprecation window for any breaking changes.

---

## 6. Funding Request and Milestone Breakdown

### Funding Summary

| Milestone | Duration |
|---|---|
| M1: Design, Specification & Orchestrator Contracts | Sprints 1–2 (Weeks 1–4) |
| M2: Attestation Logic, Compliance & Testing | Sprint 3 (Weeks 5–6) |
| M3: DevNet Deployment, Documentation & Handover | Sprint 4 + Docker (Weeks 7–10) |
| **Total Grant Request** | **£40,000 over 8–10 calendar weeks** |

Allocation across milestones and between delivery partners is governed by a separate commercial agreement and is not disclosed in this proposal.

Stratalink co-invests internal resources beyond the grant scope: PoLi scoring engine operation and maintenance, multi-venue data connectivity (14 venues live), Oracle Adapter development, API infrastructure, regulatory engagement, and go-to-market activities. These are funded independently by Stratalink and are not included in the £40,000 grant request.

### Cost Effectiveness

Why this is good value for the Fund:

1. **Pays only for the integration layer** — Neither the PoLi engine nor BCM need to be built. Both exist and are operational. The grant funds the Daml contracts, DevNet deployment, and documentation that connect them
2. IntellectEU builds the Daml contracts and handles Canton deployment — they've done this before (CIP-0058). Stratalink delivers the PoLi service, Oracle Adapter, and institutional go-to-market. Each party stays in their lane.
3. **Reusable infrastructure** — The Daml contract patterns, Oracle Adapter interface specification, and developer documentation create templates for integrating other external data services with Canton
4. PoLi pays for itself through participant usage fees. The Fund's £40,000 produces infrastructure that doesn't come back asking for more.

---

## 7. Go-to-Market and Distribution Plan

### Why This Proposal Has a Credible GTM

This isn't just a technical delivery proposal. The team behind it has direct relationships with the clearing houses, custodians, and asset managers who'll actually use this.

**Stratalink's institutional network:**

- **27 years of traditional finance experience** across Goldman Sachs and Deutsche Bank, including leading MiFID II research unbundling implementation across Europe — the last major institutional market structure reform
- **Active regulatory engagement** with ADGM FSRA (pilot discussions for PoLi deployment in Abu Dhabi's digital asset regulatory framework) and UK FCA contacts
- **Direct relationships** with clearing house, custodian, and asset manager decision-makers who are evaluating Canton for tokenised asset workflows

**IntellectEU's Canton network position:**

- **Premier Foundation Member** with Board representation (Jonathan Mayeur)
- **Super Validator** with Weight 1 and demonstrated delivery track record
- **BCM operator** — the infrastructure through which many Canton participants already deploy and manage their nodes
- **Core Contributors Group** standing and active Splice repository contributor

### Distribution Strategy

**Phase 1 — Anchor Participants (Post-Delivery)**

Target: Clearing houses and custodians already active on Canton who have the most immediate need for liquidity verification.

- Approach: Direct engagement leveraging existing relationships with Canton Premier Members
- Focus: Demonstrate regulatory value and risk management utility
- Success metric: 3–5 institutional participants in pilot

**Phase 2 — Ecosystem Expansion (Post-Delivery)**

Target: Broader Canton participant base including asset managers, trading venues, and RWA issuers.

- Approach: Developer documentation, SDK release, and integration into Canton's standard onboarding materials
- Focus: Make liquidity verification a default capability for new Canton applications
- Success metric: 10+ participants actively consuming; 2+ third-party apps integrating

**Phase 3 — Regulatory Catalyst (Post-Delivery)**

Target: Regulatory bodies developing supervisory frameworks for tokenised assets.

- Approach: Present PoLi-Canton as a reference implementation for how institutional blockchain networks can provide liquidity transparency without sacrificing privacy
- Focus: Position verified liquidity data as a compliance tool regulators can point to when setting standards for digital asset markets
- Success metric: Active regulatory engagement documented with at least one jurisdiction (FCA, ADGM FSRA, or MAS)

### Co-Marketing

All public communications will be jointly branded between the Canton Foundation, IntellectEU, and Stratalink. Specific deliverables:

- Joint press release at MainNet deployment
- Case study publication following pilot completion
- Presentation at Canton Foundation events and relevant industry conferences
- Inclusion in Canton Foundation quarterly ecosystem report

---

## 8. Team and Capability

### Stratalink Labs Ltd

**Rob McDermott, Founder & CEO**
- 27 years in institutional capital markets: Goldman Sachs, Deutsche Bank
- Led MiFID II research unbundling implementation across European institutional markets
- Designed and built the PoLi scoring methodology, DACT architecture, and Stratalink's five-layer technology stack
- Active engagement with ADGM FSRA and UK FCA on digital asset market structure

Stratalink has built and operates:
- Multi-venue orderbook aggregation across major digital asset exchanges
- The PoLi institutional liquidity scoring engine
- DACT (Digital Assets Consolidated Tape)
- TSLE (Time Series Liquidity Estimation) analytics
- STRATA AI manipulation detection

### IntellectEU


**Key Canton Network credentials:**
- Weight 1 Super Validator (CIP-0058, approved April 2025)
- Built escrow mechanics for Canton's milestone-based reward system (CIP-0066)
- Monthly Splice repository contributor
- Operates Catalyst Blockchain Manager used by Canton participants
- Premier Foundation Member with Board representation
- Tokenomics Working Group participant

### Combined Capability

| Capability | Stratalink | IntellectEU |
|---|---|---|
| Liquidity verification technology | ✓ | |
| Multi-venue market data aggregation | ✓ | |
| Institutional market knowledge | ✓ | |
| Regulatory relationships (ADGM, FCA) | ✓ | |
| Daml smart contract development | | ✓ |
| Canton Network deployment & operations | | ✓ |
| BCM infrastructure | | ✓ |
| Canton governance standing | | ✓ |
| Go-to-market (institutional) | ✓ | ✓ |

---

## 9. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Integration more complex than estimated | Medium | Medium | SOW is signed with defined acceptance criteria (Amendment A4). Sprint-iterative delivery means complexity is surfaced in Sprints 1–2 before committing to full build. |
| Insufficient institutional adoption in pilot | Low | Medium | Anchor participants identified before MainNet launch. GTM plan leverages existing relationships, not cold outreach. |
| Canton Coin volatility erodes funding value | Low | Low | Total project duration is 8–10 weeks, limiting CC exposure. Grant request denominated in £ provides a clear benchmark for CC conversion at milestone payment. |
| Venue API changes disrupt data feeds | Low | Low | Stratalink manages venue connectivity independently; this is operational risk Stratalink already handles across its broader business. |
| Regulatory environment shifts | Low | Low | Regulatory shifts are more likely to *increase* demand for liquidity verification than decrease it. |
| Key person risk (Stratalink) | Medium | Medium | Documentation and API specifications ensure integration layer can be maintained independently. PoLi service has commercial incentive to continue regardless. |
| Competing proposal for similar capability | Low | Low | No current Canton member or proposal covers independent liquidity verification. Kaiko is complementary (data provision vs. verification). |

---

## Appendices

### Appendix A: Relevant Canton CIPs

- **CIP-0082** — Establishes the 5% Development Fund
- **CIP-0100** — Governance of the Development Fund (proposal review, milestone assessment, payment mechanics)
- **CIP-0058** — IntellectEU as Weight 1 Super Validator (demonstrates delivery capability and Canton standing)
- **CIP-0066** — Escrow mechanics for milestone-based rewards (infrastructure built by IntellectEU)

### Appendix B: Stratalink Technology Overview

**Five-Layer Technology Stack:**

1. **DACT** (Digital Assets Consolidated Tape) — Multi-venue orderbook aggregation and normalisation
2. **PoLi** (Proof of Liquidity) — Institutional-grade liquidity scoring with manipulation detection
3. **STRATA AI** — Machine learning analytics for liquidity pattern recognition and anomaly detection
4. **TILT** (Total Institutional Liquidity Terminal) — Institutional user interface and analytics platform
5. **RCL** (Regulatory Consumption Layer) — Read-only regulator interface mapped to ADGM and FCA doctrines

**Intellectual Property:** PoLi and DACT are trademarked ("PoLi by Stratalink", "DACT by Stratalink"). All core technology is proprietary to Stratalink Labs Ltd.

### Appendix C: Glossary

| Term | Definition |
|---|---|
| BCM | Catalyst Blockchain Manager — IntellectEU's Canton deployment and management platform |
| CC | Canton Coin — native token of the Canton Network |
| CCP | Central Counterparty Clearing House |
| DACT | Digital Assets Consolidated Tape — Stratalink's multi-venue data aggregation |
| Daml | Digital Asset Modelling Language — Canton's smart contract language |
| GSF | Global Synchroniser Foundation (now Canton Foundation) |
| LTF | Liquidity Truth Framework — Stratalink's standards framework |
| PoLi | Proof of Liquidity — Stratalink's liquidity verification scoring system |
| RCL | Regulatory Consumption Layer — Stratalink's regulator interface |
| RWA | Real World Assets — traditional financial assets represented on blockchain |
| SV | Super Validator — governance-participating node operator on Canton |
| TSLE | Time Series Liquidity Estimation — Stratalink's historical liquidity analytics |

---

_This proposal is submitted jointly by Stratalink Labs Ltd and IntellectEU. Champion: Jonathan Mayeur (Canton Foundation Board Member and Tech & Ops Committee Member). Sponsor: IntellectEU (Canton Foundation Premier Member). Submitted in accordance with CIP-0100 governance requirements.
