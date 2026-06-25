# V3

# Zoniqx - Canton Network Development Fund Proposal

**Author:** Priyanshu Sinha (CSO) | Elvis Rodrigues (CPO) | Prasanth Kalangi (CEO), Zoniqx Inc 
**Status:** Draft
**Created:** 2026-02-23
**Funding Request:** 250,000 CC (USD $250,000 equivalent)

---

## Abstract

Zoniqx proposes building DAML-native compatibility for its institutional RWA tokenization stack — zProtocol (ERC-7518), zCompliance, zIdentity, and zConnect — on Canton Network.

The value proposition is direct: Zoniqx brings a $25B+ active asset pipeline and an ecosystem of 26+ institutional buyside network ready to deploy. Canton brings privacy-preserving settlement infrastructure and a network of financial institutions already operating as participant nodes. The missing piece is the compliance, identity, and distribution layer that connects the two. This grant funds building that bridge.

Once live, zConnect operates as unified market infrastructure — not exclusively for Zoniqx-originated assets, but for any tokenized asset from any chain to be distributed through Canton. Every Canton FI participant gains access to compliant deal flow. Every external issuer gains access to Canton's institutional network.

**Timeline:** 12 weeks | **Total:** $250,000

---

## Motivation

Canton's ecosystem currently lacks a shared compliance, identity, and distribution layer for RWA tokenization. Without it, every issuer on Canton has to independently solve identity verification, regulatory compliance, and investor access — duplicating effort, fragmenting liquidity, and slowing institutional adoption.

Zoniqx brings two things Canton doesn't currently have:

**1. Assets ready to deploy.** Zoniqx has a $25B+ active pipeline of tokenizable real-world assets across enterprise, sovereign, and fund structures. This pipeline needs compliant on-chain infrastructure to settle on. Building DAML compatibility means this pipeline routes through Canton.

**2. Buyside capital and distribution infrastructure.** zConnect's 26+ institutional buyside network — plus the financial institutions already operating as Canton participant nodes — creates a two-sided market. zConnect isn't exclusive to Zoniqx-originated assets. It's unified market infrastructure: any compliant asset from any chain can be onboarded and distributed through Canton to institutional buyers. The Canton FIs who are already here can now engage with tokenized assets through a single compliant distribution layer.

The infrastructure-vs-application distinction matters: funding one application creates one use case. Funding shared infrastructure creates the layer that every future RWA application on Canton can build on.

---

## Rationale

### Why Zoniqx — Not Build In-House

Zoniqx's stack is production-validated across eight blockchain ecosystems (XRPL, Cardano, Hedera, Midnight, Polygon, Coinbase/Base, ADI Chain). The ERC-7518 standard was authored by Zoniqx and ratified by the Ethereum Foundation. 

The $25B+ asset pipeline and 26+ buyside network are live. Building this from scratch on Canton would take 12–18 months and lack the institutional relationships that make infrastructure useful from Day 1.

### Why Canton Is the Right Ecosystem

Canton's sub-transaction privacy model is exactly what institutional compliance requires — compliance signals can be evaluated without exposing PII on-ledger. The Global Synchronizer's multi-party workflow model maps directly to how institutional deal execution works. The xReserve USDC bridge demonstrates Canton's cross-chain ambition; zProtocol bridge adapters extend that to compliant RWA instruments.

### Traction

| Deployment | Significance |
| --- | --- |
| XRPL, Cardano, Hedera, Midnight, Polygon, Coinbase (Base), ADI Chain, Japan Smart Chain | Full infrastructure deployed across 8 blockchain ecosystems — proving the integration methodology this proposal follows |
| IHC Group / ADI Chain (Abu Dhabi) | Enterprise blockchain tokenization for a $200B+ sovereign-backed conglomerate |
| Georgia National Land Registry | Sovereign land title tokenization — government-grade deployment |
| ERC-7518 Ratification | Zoniqx-authored compliance token standard ratified by the Ethereum Foundation |
| Wormhole Partnership | Cross-chain interoperability agreement enabling ERC-7518 assets to bridge across networks |
| $25B+ Active Pipeline | Live pipeline of tokenizable assets across enterprise, sovereign, and fund structures |
| 26+ Buyside Network Participants | 26+ institutional investors with committed capital deployment criteria in zConnect |

| Blockchain | What Was Adapted | What It Unlocked |
| --- | --- | --- |
| **XRPL** | ERC-7518 logic to XRPL native token framework; zCompliance to XRPL transaction hooks | Compliant RWA issuances with institutional-grade transfer restrictions |
| **Cardano** | zProtocol to Plutus contracts; zIdentity to eUTxO credential anchoring | KYC-gated token issuance for institutional clients in the eUTxO model |
| **Hedera** | zCompliance to Hedera Token Service compliance APIs | Enterprise issuers under regulated frameworks deploying on Hedera |
| **Midnight** | Privacy-preserving RWA infrastructure on ZK-proof architecture | Directly relevant: Midnight's privacy model is architecturally analogous to Canton's sub-transaction privacy |
| **Polygon** | High-volume ERC-7518 deployments; zConnect distribution workflows | Institutional issuances with active buyside distribution |
| **Coinbase (Base)** | EVM infrastructure adaptation; zConnect buyside integrations | Institutional-grade tokenization with live distribution |
| **ADI Chain (IHC Group, Abu Dhabi)** | Full stack deployment for Abu Dhabi's flagship digital asset initiative | Sovereign-backed digital chain powered by Zoniqx infrastructure |

---

## Specification

### 1. Objective

Build DAML compatibility for four protocol layers, bringing Zoniqx's proven infrastructure to Canton:

| Protocol | What It Does | What Canton Gets |
| --- | --- | --- |
| **zProtocol** (ERC-7518) | Compliant token issuance, dynamic transfer restrictions, full lifecycle management | DAML-native compliant token standard — any Canton participant can issue regulated tokens |
| **zCompliance** | Real-time compliance oracle: multi-jurisdiction rule enforcement without PII on-ledger | Plug-and-play compliance for every issuance on Canton (Reg D/S, MAS, ADGM, MiFID II, etc.) |
| **zIdentity** | Portable institutional DID-anchored KYC/KYB credentials | Investors verify once, participate across all Canton issuances — no repeated onboarding |
| **zConnect** | Unified distribution infrastructure: deal room, subscription, allocation, settlement | 26+ buyside partners + Canton's own FI network can engage with any onboarded asset from any chain |

**Core outcome:** Canton becomes the settlement and compliance layer where institutional issuers deploy and institutional capital flows — powered by infrastructure that works for the entire ecosystem, not just one application.

### 2. Implementation Mechanics

Zoniqx follows a four-phase integration methodology validated across eight blockchain deployments. All four protocols are built in parallel.

**Phase 1 — DAML Architecture Design (Weeks 1 & 2)**
Translate zProtocol, zCompliance, zIdentity, and zConnect into Canton/DAML architecture. Design participant node topology, inter-protocol data flows, and zConnect's multi-party deal workflow mapping to Canton's Global Synchronizer model.

**Phase 2 — Proof of Concept (Weeks 3 - 6)**
Build functional end-to-end integration on Canton testnet: compliant token issuance → identity verification → compliance check → distribution through zConnect deal room → atomic settlement.

**Phase 3 — Testnet Launch + Integrations (Weeks 7 – 10)**
Production-grade deployment on Canton testnet with UI, SDK, documentation, and third-party integration readiness. External issuer onboarding test.

**Phase 4 — Mainnet Launch (Weeks 11 – 12)**
Production deployment on Canton mainnet. Controlled validation with live issuance workflow.

### 3. Architectural Alignment

| Canton Principle | Zoniqx Integration | Why It Fits |
| --- | --- | --- |
| Sub-transaction privacy | zCompliance + zIdentity | Compliance signals delivered without PII on ledger — Canton settles, it doesn't store KYC |
| Composable DAML contracts | zProtocol (ERC-7518) | DAML templates composable with existing Canton financial primitives; importable by any participant node |
| Global Synchronizer multi-party workflows | zConnect | Deal room, subscription, settlement span multiple Canton nodes — exactly what the Synchronizer is built for |
| Cross-chain asset onboarding | zConnect + zProtocol bridge adapters | Any tokenized asset from any chain can be onboarded into Canton's distribution infrastructure — extending the xReserve bridge pattern to compliant RWA instruments |

No modifications to Canton core protocol or SDK. All components deploy as standard participant nodes and DAML packages.

### 4. Backward Compatibility

No backward compatibility impact. All protocol packages are additive.

---

## Milestones and Deliverables

### Milestone 1 — Architecture Validation (2 weeks)

- **Deliverables:** DAML architecture spec for all four protocols; Canton participant node topology; inter-protocol communication design; development sandbox with scaffolding packages
- **Acceptance:** Architecture approved by Tech Committee; DAML packages compile on Canton testnet

### Milestone 2 — Proof of Concept (4 weeks)

- **Deliverables:** Functional zProtocol token issuance + zCompliance enforcement + zIdentity verification + zConnect deal room on Canton testnet; end-to-end demo
- **Acceptance:** Complete issuance-to-settlement workflow demonstrated on testnet

### Milestone 3 — Testnet Launch (4 weeks)

- **Deliverables:** Production-grade testnet deployment; issuer and investor UI; SDK + developer documentation; external asset onboarding test via zConnect
- **Acceptance:** Third-party issuer successfully deploys compliant token using Zoniqx infrastructure on Canton testnet

### Milestone 4 — Mainnet Launch (2 weeks)

- **Deliverables:** Canton mainnet deployment; controlled live issuance validation; ecosystem documentation
- **Acceptance:** Live production environment operational; first compliant asset issued and distributed through zConnect on Canton mainnet

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate based on: deliverables completed per milestone, demonstrated functionality, documentation provided, and alignment with stated value metrics. Project-specific condition: end-to-end regulated asset issuance and distribution must be demonstrable to external Canton participants by Milestone 4.

---

## Funding

**Total:** 250,000 CC

| Milestone | Payment | Trigger |
| --- | --- | --- |
| M0 - Contract Signing  | 50,000 (20%) | Due on receipt  |
| M1 — Architecture Validation | 50,000 (20%) | Committee acceptance |
| M2 — Proof of Concept | 50,000 (20%) | Committee acceptance |
| M3 — Testnet Launch | 50,000 (20%) | Committee acceptance |
| M4 — Mainnet Launch | 50,000 (20%) | Final release and acceptance |

**Volatility:** Total duration is 12 weeks (<6 months). Should scope changes extend beyond 6 months, remaining milestones will be renegotiated per Development Fund volatility policy.

---

## Co-Marketing

Upon production release (Milestone 4), Zoniqx and the Canton Foundation will collaborate on:

- **Joint announcement** across Canton Foundation, Zoniqx, and institutional partner channels, led by the live issuance milestone as the proof point
- **Case study** co-authored on the first live pipeline asset migrated to Canton — sovereign, institutional, or enterprise depending on which client is first to mainnet
- **Sovereign activation** — coordinated outreach to amplify Canton's institutional credibility in key markets
- **Developer initiative** — Zoniqx to co-fund a builder grant or hackathon for Canton developers building on the open-source protocol stack
- **Ongoing ecosystem support** — Zoniqx commits to maintaining open-source DAML packages and engaging the Canton developer community for minimum 12 months post-launch

---

## Appendix — Protocol Summary

| Protocol | Core Function | DAML Approach |
| --- | --- | --- |
| zProtocol (ERC-7518) | Compliant token: issuance, restrictions, lifecycle | DAML contract templates; native Canton token issuance |
| zCompliance | Real-time compliance oracle + multi-jurisdiction rules | Canton participant node; DAML oracle contracts |
| zIdentity | Portable institutional DID-based identity | Canton DID registry; DAML credential attestation |
| zConnect | Unified distribution: deal room, subscription, settlement | DAML multi-party deal contracts; Canton atomic settlement; open to any chain's assets |