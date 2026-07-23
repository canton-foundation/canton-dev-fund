# CANTON DEVELOPMENT FUND
## Joint Grant Proposal
### Institutional Carbon Finance & Traceability Infrastructure on Canton

---

**Author:** ClimateTrade / Folks Finance </br>
**Status:** Submitted </br>
**Created:** 2026-05-19 </br>
**Updated:** 2026-06-24 </br>
**Label:** defi-protocols </br>
**Champion:** MPCH

---

| **Co-Applicant A** | **Co-Applicant B** |
|---|---|
| **ClimateTrade / ClimaT Protocol** | **Folks Finance** |
| climatetrade.com · climat.digital | folks.finance |
| *Scope: L1 ClimaT Spoke + L2 Carbon API + L3 Carbon Passport & Ledger* | *Scope: Folks Atlas Canton adapter — institutional-grade lending primitive for the Canton ecosystem* |
| **Funding Requested: 5,000,000 Canton Coins** | **Funding Requested: 2,000,000 Canton Coins** |

---

**Total Joint Funding Requested: 7,000,000 Canton Coins**

Payable in Canton Coin (CC) · Milestone-gated disbursement to each co-applicant independently

*April 2026*

---

## 1. Executive Summary

ClimateTrade/ClimaT Protocol and Folks Finance are submitting this joint application to the Canton Development Fund to build a three-layer, institutional-grade infrastructure stack that positions Canton as the foundational settlement layer for carbon-aware financial systems and enterprise emissions traceability.

The two co-applicants contribute complementary and non-overlapping capabilities. **Folks Finance** brings the only audited, production-grade cross-chain lending primitive with explicit Canton support — deploying it as shared infrastructure available to any Canton participant. **ClimateTrade/ClimaT Protocol** brings six years of operational carbon market infrastructure, 150+ verified projects, an active Canton validator node, and a live enterprise API — deploying this as a carbon-specific lending layer, oracle, and enterprise compliance product on top of the Folks Finance primitive.

Each co-applicant has **independent scope, independent milestones, and independent funding disbursement**. The two stacks are composable by design — but neither is a dependency of the other for milestone purposes. A reviewer can evaluate each component on its own merits.

### Joint Infrastructure Components & Funding Allocation

| | **Layer** | **Component** | **Co-Applicant** | **Funding** |
|---|---|---|---|---|
| **B** | L1a | Folks Atlas Canton Adapter — institutional-grade lending primitive for Canton ecosystem | Folks Finance | 2,000,000 CC |
| **A** | L1b | ClimaT Spoke — permissioned climate lending environment on Folks V2 | ClimateTrade / ClimaT | |
| **A** | L2 | Carbon Intelligence API — on-chain carbon data oracle for Canton | ClimateTrade / ClimaT | |
| **A** | L3 | Carbon Passport & Ledger — enterprise carbon accounting SaaS on Canton | ClimateTrade / ClimaT | 5,000,000 CC |
| | | **Total Joint Funding Requested** | | **7,000,000 CC** |

Together, these layers create a carbon-aware financial ecosystem on Canton, serving institutional lenders, enterprise compliance teams, and DeFi participants on the same shared infrastructure. The Folks Finance Canton adapter (L1a) is available to the entire Canton ecosystem from day one. The ClimaT components (L1b–L3) build the carbon-specific application layer on top.

---

## 2. Co-Applicant Background & Credentials

### 2.1 Co-Applicant B: Folks Finance

Folks Finance is a cross-chain lending and borrowing protocol with **$400M+ ATH TVL** live across 8 blockchains (Ethereum, Base, Avalanche, Arbitrum, BNB Chain, Polygon, Algorand, Sei). It raised $6.2M across seed and Series A rounds at a $75M valuation, and has operated with **zero material exploits** since April 2022 across multiple independent smart contract audits.

- **Folks Atlas — Canton-native architecture:** Folks Finance's upcoming product upgrade (launching Q3 2026) is purpose-built for institutional use cases. Canton is an explicitly supported target chain in V2's design — this is not a speculative port.
- **Unique protocol design:** Folks Atlas combines the risk isolation of vault-based lending (Morpho-style) with the capital efficiency of monolithic pools (Aave-style), deployable natively on both EVM and non-EVM chains.
- **Canton ecosystem commitment:** As part of this grant, Folks Finance will provide Canton-specific adapter contracts, deployment scripts, and integration documentation to Canton Development Fund participants — ensuring the primitive is accessible as shared Canton infrastructure, not a ClimaT-exclusive product.
- **Track record:** 4+ years in production, multiple independent audits, active bug bounty program, rate-limited architecture, and a Total Reserve treasury buffer protecting users from exploit scenarios, $13+ Bn in cumulative volume, $400M+ ATH TVL, over 200k active wallets.

### 2.2 Co-Applicant A: ClimateTrade / ClimaT Protocol

**ClimateTrade**

ClimateTrade is an institutional carbon market infrastructure company operating since 2018, with carbon solutions deployed for sovereign governments, UN agencies, and multinational corporations across more than 40 countries.

- **150+ verified carbon projects** spanning REDD+, IFM, Blue Carbon, Soil Carbon, Methane, and Renewable Energy across Latam, Africa, and Southeast Asia.
- **Proprietary Carbon API** (developers.climatetrade.com) — production-grade middleware covering Scope 1/2/3 emissions calculation, offset execution, credit retirement, and certification — currently used by enterprise integrators.
- **Active Canton Validator Node** — ClimateTrade is one of very few carbon-sector participants operating a production validator on Canton, providing structural alignment with the network's governance and infrastructure goals.
- **Market infrastructure:** climatetrade.com and market.climatetrade.com provide the liquid marketplace and retirement registry that backs tokenized credits used as collateral in the ClimaT Protocol.

**ClimaT Protocol**

ClimaT Protocol is the DeFi and institutional lending layer built on ClimateTrade's carbon pipeline. It provides overcollateralized credit facilities denominated in stablecoins, with environmental assets as collateral.

- ERC-20 utility token (CLIMAT), 2B fixed supply, MiCA Article 4 compliant.
- Five isolated credit pools: Carbon (VCM), Nature, Regenerative Agriculture, Methane, and Agricultural Land — LTV ratios 55–65%, independent liquidation per pool.
- Projected lender APR of 6–14% derived from borrower interest, not token inflation.

---

## 3. Problem Statement

### 3.1 The $4 Trillion Climate Finance Gap

The Paris Agreement requires $4–6 trillion in annual climate investment through 2030. The financing gap is not caused by a shortage of capital — it is caused by a **failure of financial infrastructure**. Specifically:

- **Illiquidity:** The voluntary carbon market lacks a functioning secondary market. Carbon credits are largely traded bilaterally over-the-counter, with limited price discovery and no standardised exit mechanism — making carbon a structurally illiquid asset class despite its scale. Climate investments are locked for 5–15 years with no secondary market.
- **Intermediation cost:** 15–30% of capital is consumed by intermediaries before a single gram of CO₂ is mitigated.
- **Exclusion:** Minimum ticket sizes of $500,000+ shut out all but the largest institutions.
- **No programmable carbon layer:** Carbon credits exist as bilateral OTC instruments with no on-chain composability, making carbon-linked financial products structurally impossible to build at scale.

### 3.2 The Enterprise Carbon Accounting Gap

Corporate emissions reporting mandates — CSRD in Europe, SEC climate rules in the US, and incoming supply chain due diligence requirements — are creating urgent demand for **auditable, real-time carbon accounting systems**. Existing solutions are fragmented, manual, and disconnected from financial systems. There is no institutional-grade, blockchain-native standard for enterprise carbon traceability that integrates with ERP systems and produces audit-ready outputs.

### 3.3 Canton's Opportunity

Canton's permissioned, privacy-preserving architecture — with $6T+ in RWA transacted as of January 2026 and 600+ institutional participants including JPMorgan, Goldman Sachs, BNP Paribas, and DTCC — is the only blockchain infrastructure capable of serving both institutional compliance requirements and DeFi composability simultaneously. This proposal builds the **carbon and climate layer** that Canton currently lacks.

---

## 4. Infrastructure Components

### 4.1 Layer 1a: Folks Atlas Canton Adapter [Co-Applicant B: Folks Finance]

Folks Finance will deliver the **foundational lending primitive for Canton** — a production-ready, audited deployment of Folks Atlas available to any Canton project as a base layer. ClimaT is the first consumer, but the infrastructure is designed to serve the broader Canton ecosystem.

**What Folks Finance Delivers**

- **Canton-native Folks Atlas deployment:** Full protocol adaptation for Canton, through Zenith EVM.
- **Spoke framework:** The Spoke model allows any Canton project to deploy a permissioned, isolated lending environment on top of the V2 core — configuring their own KYC/AML controls (dependent on external support, i.e. Chainlink ACE with Sumsub), collateral types, interest rate models, and liquidation parameters without touching the shared base layer.
- **Oracle flexibility:** Configurable per pool — different oracle sources (dependent on external support), i.e. Chainlink, Pyth, or custom oracle sources. Compatible with Chainlink Data Streams live on Canton since February 2026.

**Documentation & Developer Support**

Folks Finance will provide Canton adapter contracts, deployment scripts, Spoke configuration templates, and integration documentation to Canton Development Fund participants and approved ecosystem projects. Developer integration guides and worked examples will be available to Canton-approved counterparties through a structured access program.

**Budget Allocation: 2,000,000 CC**

| **Work Item** | **Allocation** |
|---|---|
| Canton protocol adaptation (through Zenith EVM) — Folks Atlas core contracts | 900,000 CC |
| Spoke framework deployment and configuration tooling | 900,000 CC |
| Developer documentation and Canton integration guides | 200,000 CC |

---

### 4.2 Layer 1b: ClimaT Spoke — Climate Lending Environment [Co-Applicant A: ClimateTrade]

Built on the Folks Finance L1a infrastructure, the ClimaT Spoke is a **permissioned, isolated lending environment owned and operated by ClimateTrade/ClimaT**, configured specifically for environmental asset collateral. The Spoke's risk is fully self-contained — positions within it cannot affect any other Canton participant or the V2 base layer.

**ClimaT Spoke Configuration**

- **Compliance controls:** KYC/AML, KYT, and whitelisted-address entry gates — configured to ClimaT's regulatory requirements and compatible with Canton's identity model (dependent on external support).
- **Multiple interest rate models:** Fixed, piecewise linear, double piecewise linear, and exponential — configurable per collateral pool.
- **Liquidation models:** Liquidation Bonus, Dutch Auction, Target Health Factor, and auto-deleverage — tuned per pool volatility profile.

**Collateral Pools**

| **Pool** | **Collateral Type** | **Max LTV** | **Liq. Threshold** | **Lender APR** | **Phase** |
|---|---|---|---|---|---|
| Carbon (VCM) | REDD+, IFM verified credits | 65% | 75% | 6–10% | 1 |
| Nature | Biodiversity / Blue Carbon | 60% | 70% | 7–12% | 1 |
| Regen. Agriculture | Soil Carbon / Ag Credits | 60% | 72% | 8–14% | 2 |
| Methane | Methane / HFC Credits | 65% | 75% | 6–9% | 2 |
| Agricultural Land | Tokenized Titles + Harvest | 55% | 68% | 7–13% | 2 |

*Note: The ClimaT Spoke budget is included within the ClimateTrade 5,000,000 CC allocation and is itemised in Section 7 (Milestones) under Co-Applicant A milestone gates.*

---

### 4.3 Layer 2: Carbon Intelligence API Infrastructure [Co-Applicant A: ClimateTrade]

This component adapts ClimateTrade's production carbon API into a **Canton-native data oracle and middleware layer** — making carbon data, calculation, and transaction execution accessible to any application building on Canton.

**Modules:**

- **Carbon Calculation Engine:** On-chain-accessible Scope 1, 2, and 3 emissions calculation. Product-level footprinting and supply chain emissions modeling via ClimateTrade API endpoints.
- **Carbon Transaction Layer:** Programmatic offset execution, micro-offsetting, and on-chain credit retirement tracking — enabling Canton applications to embed carbon actions natively in smart contract logic.
- **Certification & Verification Module:** Verifiable carbon claims with audit-ready data outputs. Standardized reporting compatible with Verra, Gold Standard, and emerging regulatory frameworks.
- **Canton Oracle Bridge:** A Canton-compatible oracle adapter publishing ClimateTrade price feeds, project availability, and retirement confirmations on-chain — composable with Chainlink Data Streams (live on Canton since February 2026).

**Infrastructure Value**

This layer transforms ClimateTrade's existing enterprise API into shared Canton infrastructure. Any Canton participant — whether a bank, DeFi protocol, or enterprise application — can consume carbon data without bilateral integration agreements with ClimateTrade.

**Budget Allocation: 1,700,000 CC**

| **Work Item** | **Owner** | **Allocation** |
|---|---|---|
| Canton oracle adapter and on-chain API bridge | ClimateTrade | 600,000 CC |
| Scope 1/2/3 calculation module Canton integration | ClimateTrade | 400,000 CC |
| Credit retirement on-chain tracking and verification module | ClimateTrade | 340,000 CC |
| Developer documentation, SDKs, and Canton integration examples | ClimateTrade | 200,000 CC |
| Security review of oracle and API components | ClimateTrade | 160,000 CC |

---

### 4.4 Layer 3: Carbon Passport & Ledger Infrastructure [Co-Applicant A: ClimateTrade]

This is the most novel component in this proposal and, in our assessment, the highest long-term value component for the Canton ecosystem. It establishes a **Canton-native enterprise carbon accounting system** — a SaaS product enabling corporations to manage and report their supply chain carbon footprint on an immutable, auditable ledger.

**The Enterprise Demand Context**

CSRD (effective 2024–2026 rollout), CBAM, SEC climate disclosure rules, and incoming EU supply chain due diligence legislation are creating legal reporting obligations for thousands of companies. These companies need systems that are not just functionally accurate but **legally defensible** — immutable, timestamped, and auditor-readable. Canton's privacy-preserving architecture is uniquely suited to this requirement: companies can record sensitive emissions data with selective disclosure to auditors and regulators without public exposure.

**Carbon Passport**

A Canton-native digital identity for products, assets, and supply chain nodes, carrying:

- Lifecycle emissions data — from raw material extraction through manufacturing, logistics, and end-of-life.
- Embedded carbon intensity — expressed as CO₂e per unit, updated dynamically as supply chain data is recorded.
- Offset linkages — cryptographic references to on-chain credit retirements via the L2 Carbon API layer.
- Verification status — certification body attestations (Verra, Gold Standard, and others) embedded as verifiable credentials.

**Carbon Ledger**

An immutable, Canton-native general ledger for corporate carbon accounting:

- Records emissions events, offset transactions, and certification attestations with full auditability.
- Selective disclosure: companies control which data is visible to auditors, regulators, customers, and counterparties — using Canton's sub-transaction privacy model.
- Temporal integrity: each entry is cryptographically timestamped and tamper-evident — satisfying the evidentiary requirements of regulatory audits.
- Multi-entity support: group-level consolidation across subsidiaries and joint ventures, with entity-level segregation.

**ERP Integration Layer**

To achieve enterprise adoption, the Carbon Ledger must connect to existing corporate systems:

- **SAP Integration:** Real-time synchronization of emissions data from SAP S/4HANA — the standard ERP system for large enterprises globally.
- **Oracle Integration:** Connector for Oracle Fusion Cloud ERP, widely used in financial services and manufacturing.
- **Generic API Layer:** REST/webhook interface for any enterprise system to push activity data and receive carbon accounting entries — enabling long-tail enterprise adoption beyond SAP and Oracle.

**SaaS Product Model**

The Carbon Passport & Ledger will be offered as a **subscription SaaS product** to enterprises, creating a recurring revenue stream that sustains infrastructure maintenance post-grant. Pricing will be tiered by emissions volume and number of supply chain nodes — consistent with enterprise SaaS benchmarks in the ESG data space.

**Budget Allocation: 3,300,000 CC**

| **Work Item** | **Owner** | **Allocation** |
|---|---|---|
| Carbon Passport smart contract design and deployment on Canton | ClimateTrade | 825,000 CC |
| Carbon Ledger — immutable record system with selective disclosure | ClimateTrade | 907,500 CC |
| SAP S/4HANA integration connector | ClimateTrade | 495,000 CC |
| Oracle Fusion ERP integration connector | ClimateTrade | 330,000 CC |
| Generic REST/webhook API layer | ClimateTrade | 247,500 CC |
| SaaS product layer — UI, access controls, reporting dashboard | ClimateTrade | 330,000 CC |
| Security audit of Passport and Ledger contracts | External Auditor | 165,000 CC |

---

## 5. System Architecture

The three layers are designed to be independently deployable and composable. Each layer produces value for Canton participants whether or not the other layers are adopted.

| **Layer** | **Inputs** | **Outputs** | **Canton Consumers** |
|---|---|---|---|
| L1 Lending | Tokenized carbon credits and RWAs as collateral | Stablecoin liquidity; lender yield; overcollateralized loans | DeFi protocols, institutional lenders, project developers |
| L2 Carbon API | ClimateTrade API; Verra/GS registries; market price data | Carbon oracle feeds; offset execution; retirement proofs | Any Canton dApp, bank, or ESG application |
| L3 Passport & Ledger | ERP emissions data; supply chain activity; L2 offset records | Audit-ready carbon ledger; CSRD/SEC-ready reports; carbon passports | Enterprises, auditors, regulators, supply chain counterparties |

**Key architectural principles:** Canton's privacy-preserving sub-transaction model is load-bearing for all three layers. L1 requires permissioned access controls at the Spoke level. L2 requires selective oracle disclosure. L3 requires entity-level data segregation with auditor-controlled visibility windows. All three are natively supported by Canton's architecture and would be structurally impossible to replicate on a public blockchain.

---

## 6. Alignment with Canton Development Fund Criteria

| **Canton Fund Criterion** | **How This Proposal Meets It** |
|---|---|
| **Core R&D / reference implementations** | Folks Finance Folks Atlas — the first production-ready, audited lending primitive on Canton, available to the Canton ecosystem. ClimateTrade developer documentation and integration guides for all three layers. |
| **Critical shared infrastructure** | L2 Carbon API oracle layer and L3 Carbon Ledger are shared infrastructure usable by any Canton participant, not proprietary to ClimateTrade. |
| **Institutional adoption pathway** | ERP integrations (SAP, Oracle), Canton identity layer compatibility, KYC/AML controls, and CSRD/SEC-ready reporting outputs are designed for regulated enterprise buyers. |
| **RWA enablement** | Carbon credits, nature-based assets, agricultural land titles, and future harvest values as on-chain RWA collateral, directly expanding Canton's RWA collateral universe. |
| **Security and scalability** | Folks Finance V2 independently audited; ClimateTrade components audited by external security firm; modular architecture enables independent scaling of each layer. |
| **Long-term maintenance** | SaaS revenue model on L3 sustains Carbon Passport & Ledger maintenance. Protocol revenue on L1 funds ClimaT Spoke operations. ClimateTrade API revenue funds L2 maintenance. |
| **Common good for the ecosystem** | Folks Finance Folks Atlas Canton primitive available to all Canton participants. L2 Carbon API oracle layer accessible to Canton participants via standard API contract. Integration documentation made available to Canton Development Fund participants. |

---

## 7. Milestones & Timeline

Each co-applicant has **independent milestone gates and independent funding disbursement**. Folks Finance milestones govern the 2,000,000 CC Co-Applicant B allocation. ClimateTrade/ClimaT milestones govern the 5,000,000 CC Co-Applicant A allocation. Failure to deliver a milestone by one co-applicant does not affect disbursement to the other.

| **Milestone** | **Period** | **Co-Applicant** | **Disbursement** | **Running Total** |
|---|---|---|---|---|
| M1-B | Months 0–4 | Folks Finance (Co-Applicant B) | 700,000 CC | 700,000 CC |
| M1-A | Months 0–4 | ClimateTrade / ClimaT (Co-Applicant A) | 1,700,000 CC | 2,400,000 CC |
| M2-B | Months 4–8 | Folks Finance (Co-Applicant B) | 700,000 CC | 3,100,000 CC |
| M2-A | Months 4–8 | ClimateTrade / ClimaT (Co-Applicant A) | 1,700,000 CC | 4,800,000 CC |
| M3-B | Months 8–12 | Folks Finance (Co-Applicant B) | 600,000 CC | 5,400,000 CC |
| M3-A | Months 8–12 | ClimateTrade / ClimaT (Co-Applicant A) | 1,600,000 CC | 7,000,000 CC |

---

### Co-Applicant B: Folks Finance — Milestone Track

#### Milestone 1-B: Canton Deployment (Months 0–4) | 700,000 CC

| **Deliverable** | **Acceptance Criteria** |
|---|---|
| Folks Atlas Canton contracts deployed to testnet | Contracts deployed and verifiable on Canton testnet explorer; deployment documentation delivered to Canton Development Fund |
| Spoke framework operational — ClimaT Spoke live on testnet | ClimaT Spoke accepting test collateral; liquidation mechanics verified end-to-end |

#### Milestone 2-B: Open-Source Release (Months 4–8) | 700,000 CC

| **Deliverable** | **Acceptance Criteria** |
|---|---|
| Canton adapter reference implementation delivered to Canton Development Fund | Full contract suite, configuration tooling, and integration documentation delivered; Canton Fund participants granted access; passing test suite confirmed |
| Developer integration guides delivered | Detailed documentation on how a developer would launch their own Spoke, including a worked example — delivered to Canton-approved counterparties |

#### Milestone 3-B: Mainnet & Ecosystem Adoption (Months 8–12) | 600,000 CC

| **Deliverable** | **Acceptance Criteria** |
|---|---|
| Folks Finance Folks Atlas live on Canton mainnet | Mainnet deployment verified; all ClimaT Spoke pools live and accepting real collateral |
| Independent security audit complete and published | Audit report from named firm published publicly; all critical and high findings resolved |
| Minimum 1 additional Canton project onboarded to Spoke framework | Signed agreement or live deployment by a Canton project other than ClimaT documented and reported to Canton Development Fund |

---

### Co-Applicant A: ClimateTrade / ClimaT Protocol — Milestone Track

#### Milestone 1-A: Foundations (Months 0–4) | 1,700,000 CC

| **Layer** | **Deliverable** | **Acceptance Criteria** |
|---|---|---|
| L1b | ClimaT Spoke deployed on testnet (built on Folks V2) | Spoke live; VCM and Nature pools accepting test collateral |
| L2 | Canton Oracle Bridge deployed to testnet | Oracle publishing ClimateTrade price feeds on-chain; feeds readable by test contracts |
| L2 | Scope 1/2/3 calculation API Canton integration complete | API callable from Canton smart contract; documented with passing test suite |
| L3 | Carbon Passport smart contract spec and prototype on testnet | Prototype Passport issuable for test product; data schema documented and delivered to Canton Development Fund |

#### Milestone 2-A: Integration & Open-Source Release (Months 4–8) | 1,700,000 CC

| **Layer** | **Deliverable** | **Acceptance Criteria** |
|---|---|---|
| L2 | Credit retirement on-chain tracking module live on testnet | End-to-end retirement flow: API call → on-chain record → auditor-readable proof |
| L2 | Full developer documentation and API reference published | Docs site live; all endpoints documented with request/response examples; accessible to Canton Development Fund participants |
| L3 | Carbon Ledger deployed on Canton testnet | Multi-entity ledger recording emissions and offset events with selective disclosure operational |
| L3 | SAP S/4HANA integration connector operational | Bi-directional data sync between SAP test environment and Carbon Ledger confirmed |

#### Milestone 3-A: Mainnet Launch & Institutional Pilots (Months 8–12) | 1,600,000 CC

| **Layer** | **Deliverable** | **Acceptance Criteria** |
|---|---|---|
| L1b | ClimaT Spoke live on Canton mainnet — all 5 pools | All credit pools live on mainnet; TVL dashboard published |
| L2 | Full Carbon API oracle stack live on Canton mainnet | Oracle feeds, calculation API, and retirement module all mainnet-verified |
| L2 | Minimum 2 external Canton projects integrating L2 API | Signed integration agreements or live integrations publicly documented |
| L3 | Carbon Passport & Ledger live on Canton mainnet | Minimum 1 enterprise pilot recording emissions on mainnet; pilot company named |
| L3 | Oracle Fusion ERP connector released | Oracle Fusion connector delivered with full integration documentation; available to ClimateTrade enterprise clients |
| L3 | CSRD-ready reporting module delivered | Report template generating CSRD-compliant disclosure from Ledger data; reviewed by legal counsel |

---

## 8. Strategic Impact

### 8.1 For the Canton Ecosystem

- **First institutional-grade lending primitive:** The Folks Finance V2 Spoke is the first production-ready, audited lending infrastructure deployable by any Canton participant, not just ClimaT.
- **Shared carbon data layer:** The L2 Carbon API Oracle makes ClimateTrade's carbon data programmatically accessible to Canton participants via standard API, removing the need for bilateral integration agreements with ClimateTrade for each new Canton application.
- **Enterprise compliance magnet:** The Carbon Passport & Ledger creates a concrete reason for regulated enterprises to join Canton — not for DeFi yield, but for legally defensible emissions accounting.
- **RWA collateral expansion:** Carbon credits, agricultural land, and harvest value are entirely new collateral categories for Canton, expanding the RWA universe beyond tokenized treasuries and fund shares.

### 8.2 Revenue Sustainability (Post-Grant)

| **Layer** | **Revenue Model** | **Year 1 (Est.)** | **Year 3 (Est.)** |
|---|---|---|---|
| L1 Lending | 15% reserve factor on borrower interest + liquidation bonuses | $1.5M | $28M |
| L2 Carbon API | Per-call API pricing for Canton participants + enterprise subscriptions | $200K | $2M |
| L3 Carbon SaaS | Annual SaaS subscriptions (enterprise tier $50K–$200K/yr) | $300K | $5M |

*Revenue projections are bottom-up estimates based on comparable DeFi credit protocols and ESG SaaS benchmarks. They do not constitute performance guarantees.*

### 8.3 Differentiation from Existing Approaches

No existing Canton participant has combined carbon market infrastructure, institutional-grade lending, and enterprise compliance tooling on a single shared stack. The closest analogues — Morpho on Ethereum for lending, Pachama/Rubicon for carbon data — operate on public chains and cannot serve Canton's permissioned institutional base. This proposal is structurally Canton-native and competitively defensible.

---

## 9. Team

### 9.1 Co-Applicant B: Folks Finance

| **Name** | **Role** | **Relevant Background** |
|---|---|---|
| Benedetto Biondi | Founder & CEO | Forbes Under 30 (Finance). Techstars Web3 mentor. DeFi lecturer, University of Florence. Led all 6 Folks Finance foundation partnerships. DeFi advisor at ClimaT. |
| Gidon Katten | Core Contributor | Ex-Amazon. Imperial College London (award-winning paper: Green Bonds on Algorand). Led delivery of 8 DeFi products across multiple chains. Will oversee Canton technical architecture. |
| Zeno Auersperg | Head of Strategy | Mathematics + Business Administration. 6+ years DeFi. Background in fintech (banking, credit scoring). Advisor to 10+ DeFi startups. Will own pool parameter design and risk modelling for Canton. |

### 9.2 Co-Applicant A: ClimateTrade / ClimaT Protocol

| **Name** | **Role** | **Relevant Background** |
|---|---|---|
| Francisco Benedito | President ClimaT / CEO ClimateTrade | Visionary entrepreneur and founder of Climatecoin and ClimateTrade, pioneering carbon tokenization and blockchain-based climate solutions. Former banking professional; recognized globally as a top fintech influencer for the SDGs. Leading European expert in RWA and tokenization; featured by Forbes Spain as one of the 22 of 2022 to change the world through sustainable innovation. |
| Ariel Futorski | CEO ClimaT / Climatecoin | Pioneer applying Austrian economic principles to environmental markets. Former strategic advisor to Algorand Foundation; former Web3 Tech Specialist at Ledger. Leads protocol design, institutional partnership strategy, and go-to-market execution. |
| Nerea García | Head of Product, ClimateTrade | 8 years experience in Climate Tech. Environmental Science graduate, specialized in carbon footprint calculation and offsetting. Driving the transition toward climate neutrality through innovation. |
| Vanessa Pizza | CMO, ClimateTrade | 7 years experience in climate tech communication and marketing at ClimateTrade. |
| Olga Brigido | Head of Legal, ClimateTrade | Over six years at ClimateTrade, specializing in sustainability and blockchain. Degree in International Law with international experience promoting sustainability; brings strong regulatory and multi-stakeholder expertise. Also supports impact management, including the B Impact Assessment. |
| Abraao Reis | IT Manager, ClimateTrade | Leads development and maintenance of the company's technology infrastructure. Strong expertise in software engineering and blockchain systems, ensuring scalability, security, and reliability of ClimateTrade's platform while supporting innovation in carbon markets and digital solutions. |

---

## 10. Risk & Mitigation

| **Risk** | **Description** | **Mitigation** |
|---|---|---|
| Smart Contract Risk | Vulnerabilities in Spoke contracts or Carbon Passport logic could expose user funds or corrupt ledger data. | Independent audits by Hashlock (engaged) for all components. Bug bounty program active. Rate limits and reserve buffers in L1. |
| Carbon Asset Volatility | Carbon credit prices may decline, triggering liquidations and reducing collateral value. | Conservative LTV ratios (55–65%). Isolated pool architecture ensures volatility in one pool cannot propagate. Dynamic Health Factor monitoring. |
| Regulatory Uncertainty | MiCA implementation and SEC climate rules may evolve, affecting token classification or reporting requirements. | CLIMAT token registered with Spain CNMV under MiCA Article 4. Legal counsel engaged. L3 outputs designed to be framework-agnostic and updatable. |
| Oracle Reliability | Carbon price feed downtime could affect lending decisions or collateral valuations. | Canton Oracle Bridge compatible with Chainlink Data Streams (live on Canton since Feb 2026). Fallback oracle sources configurable at Spoke level. |
| Enterprise Adoption (L3) | Enterprises may be slow to adopt a new carbon accounting SaaS product. | Regulatory mandate (CSRD, SEC) creates pull demand. ERP integrations lower switching cost. Initial pilots being scoped with ClimateTrade existing enterprise clients. |

---

## 11. Conclusion

This proposal requests 7,000,000 Canton Coins from the Canton Development Fund to build the foundational carbon and climate finance infrastructure layer that Canton currently lacks.

The three components — a modular institutional lending primitive (L1), a shared carbon data oracle (L2), and a Canton-native enterprise carbon accounting SaaS (L3) — are independently valuable, composable with each other, and collectively position Canton as the institutional settlement layer for sustainable finance.

ClimateTrade brings six years of production carbon market infrastructure, 150+ verified projects, an active Canton validator node, and a live enterprise API. Folks Finance brings the only audited, production-grade lending primitive with explicit Canton support. Together, they represent a team capable of delivering institutional-quality infrastructure on time and on spec.

The result is not an isolated application — it is **shared infrastructure** that any Canton participant can consume, extend, and build on. Carbon-aware financial products, enterprise ESG compliance tools, and tokenized RWA lending markets all become possible on Canton the day this stack goes live.

---

**ClimateTrade / ClimaT Protocol** | **Folks Finance**

climatetrade.com · climat.digital · folks.finance
