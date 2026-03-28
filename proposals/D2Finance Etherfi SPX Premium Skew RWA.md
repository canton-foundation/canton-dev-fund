# Development Fund Proposal

**Author:** Frank (github: HWxFrank) D2 Finance 
**Email:** hwxfrank@d2.finance
**Status:** Draft  
**Created:** 2026-03-24  

---

## Abstract

D2 Finance in collaboration with Ether.fi propose to deploy the first institutional-grade, uncorrelated RWA yield strategy natively settled on the Canton Network — the **SPX Skew Premium RWA Strategy**. This initiative establishes a replicable, privacy-preserving on-chain settlement infrastructure for systematic volatility harvesting on the S&P 500 (SPX), targeting 7–12% gross annual yield sourced entirely outside of DeFi rate cycles.

D2 Finance and Ether.fi are requesting $225,000 USDC equivalent in fixed grants for this core proposal (Milestone 1: ~$30,000 legal & structural setup; Milestone 2: ~$45,000 on-chain infrastructure build; Milestone 3: $150,000 base CC yield reward) plus a variable Milestone 3 performance cushion of up to $166,667, with an optional $100,000 Milestone 5 extension.

The proposal will implement a $50M pilot deployment allocation, funded by Ether.fi (with $7B+ TVL), operating through a non-custodial Prime Broker who is a node operator on Canton. The strategy produces on-chain attestations and transparent P&L reconciliation on Canton. Upon successful 6-month proof of concept, the architecture will be fully productized as a featured app strategy vault run by D2 Finance, open to institutional investors in the Canton ecosystem. The final milestone tokenizes the SPX skew trade itself as a Canton-native RWA instrument.

This is not a crypto-native experiment. It is a direct migration of a battle-tested, SS&C-audited TradFi strategy — one the D2 Finance primary fund manager ran for 5+ years at PAG.com — onto privacy-preserving institutional blockchain infrastructure to enhance on-chain yield, and expand second order opportunity through tokenization.

---

## Specification

### 1. Objective

**Problem:** DeFi yield is structurally correlated. Strategies across lending markets, future yield trading, and delta-neutral basis trades all move together — tightening simultaneously in risk-off environments, precisely when diversification is most needed. Institutional allocators with significant on-chain capital are therefore exposed to a single underlying rate regime despite apparent product diversity.

**Opportunity:** The SPX volatility risk premium — where implied volatility exceeds realized volatility in ~85% of observations since 1990 — is a structural, academically validated inefficiency harvested by pension funds and endowments for decades. It is entirely uncorrelated with DeFi rates, ETH/BTC price, or on-chain liquidity conditions. The CBOE PUT Index benchmark has delivered 9.54% annualized returns with a 0.65 Sharpe ratio over 32+ years, with ~35% lower volatility than the S&P 500.

**Objective:** Build, validate, and productize an institutional settlement infrastructure on Canton that enables systematic SPX skew premium harvesting — starting with a 6-month $50M self funded pilot, culminating in an open vault framework and tokenized RWA instrument available to the broader Canton ecosystem.

**Intended Outcome:** Canton becomes the canonical settlement layer for privacy-preserving institutional RWA strategies. The infrastructure built here becomes a reusable template for future institutional strategy deployments across the Canton ecosystem.

Critically, the tokenization of the SPX Skew Premium strategy (Milestone 5) unlocks a second order of ecosystem value that extends well beyond the strategy itself. Once the strategy's yield stream is represented as a Canton-native RWA token, it becomes a composable financial primitive — one that can be integrated across the Canton ecosystem in the following ways:

- **Collateral for Lending & Credit Protocols:** The tokenized SPX RWA position — backed by verifiable Prime Broker custody and a documented yield history — can serve as high-quality collateral in Canton-based lending markets. Borrowers can unlock liquidity against their yield-bearing position without unwinding the trade, enabling capital efficiency unavailable in traditional structured products.

- **Margin & Structured Credit:** Institutional counterparties and Canton-based credit desks can accept the tokenized position as margin collateral for derivative overlays or structured credit facilities. The position's low correlation with crypto-native assets makes it particularly valuable as a diversifying collateral type — reducing systemic correlation risk within Canton's credit ecosystem.

- **Yield Diversification for Other Canton Vaults & Strategies:** The tokenized SPX yield stream can be sliced, tranched, or blended into other Canton-native vault strategies. Portfolio managers building multi-strategy vaults on Canton can incorporate SPX skew exposure as a non-correlated yield layer — improving risk-adjusted returns at the portfolio level without adding DeFi rate exposure.

- **Index & Basket Products:** The tokenized instrument becomes a composable input for Canton-native index products that blend TradFi volatility premium yield with on-chain rate strategies — creating genuinely novel structured products that cannot be replicated on any other blockchain infrastructure.

In aggregate, the tokenized SPX RWA instrument transforms a single yield strategy into a foundational piece of Canton's institutional financial stack — one that generates compounding network effects as it is integrated by lending protocols, credit desks, vault managers, and structured product issuers building on Canton.

---

### 2. Implementation Mechanics

**Strategy Mechanics**

The SPX Skew Premium strategy systematically sells S&P 500 put options, collecting the implied volatility risk premium as yield. 

1. **Collateral** Ether.fi USDCx collateral is sent to a Prime Broker custodial wallet
2. **Prime Broker** Holds full custody — Basel III compliant, full regulatory compliance. The collateral is enabled as margin for trading SPX options (e-mini, e-mini CME, SPX) under a non-custodial model. 
3. **D2 Finance** instructs trades exclusively via Bloomberg EMSX / IB chat — zero withdrawal rights, no fund access
4. **On-chain reconciliation** occurs on Canton — P&L, position attestations, and yield distributions are settled and verified on-chain


**On-Chain Components**

- Canton-native vault smart contracts for deposit intake, attestation anchoring, and yield distribution
- USDCx (Canton USDC) collateral acceptance / cash conversion bridge to Prime Broker
- On-chain P&L reconciliation and attestation framework
- **Publicly Verifiable Attestation Protocol:** A core deliverable of Milestone 1 is scoping the deterministic technical architecture required to solve the 'oracle problem' for off-chain TradFi yield. Rather than prescribing a rigid data feed prematurely, D2 Finance will collaborate with the Prime Broker and Canton engineers during M1 to define a secure, trust-minimized attestation schema. This will likely involve cryptographic anchoring of periodic NAV updates (e.g., via secure API gateways or third-party oracle nodes) to ensure the chronological state of the vault's assets is deterministically verifiable on-chain.
- Featured application (dApp) for Canton ecosystem participants to access the strategy
- Tokenized SPX skew RWA instrument (final milestone)

---

### 3. Architectural Alignment

**Canton's Core Value Proposition — Realized**

This proposal directly activates Canton's foundational design principles:

- **Privacy-Preserving Settlement:** Prime Brokers do not expose position data to competitors. Canton's need-to-know data model is the only institutional blockchain architecture that satisfies this constraint. This is not a workaround — it is the reason Canton was built.
- **Basel III Compliance:** Tokenized assets on Canton are treated as Group 1 instruments, equivalent to traditional securities. The Prime Broker custody model is fully compatible with existing bank risk frameworks.
- **Scale:** Canton has already processed $6T+ in transactions with 500K+ daily transactions. The strategy's settlement volume is operationally trivial relative to existing throughput.
- **Institutional Counterparty Network:** Goldman Sachs (Foundation Member, GS DAP®), JPMorgan (JPM Coin, January 2026), UBS (active participant), and BNP Paribas (Foundation Member) are all existing Canton participants and D2 Finance's target Prime Broker relationships. This proposal converts abstract Canton membership into active trading infrastructure utilization.

**Ecosystem Priority Alignment**

This proposal aims to create a DeFi marquee, publicly verifiable institutional RWA deployment on Canton— one backed by D2 Finance and Ether.fi (7B+ TVL on-chain) and D2's SS&C-audited TradFi track record. The settlement infrastructure, vault contracts, and attestation framework built here could become reusable primitives for future institutional RWA issuers on Canton.


**Genuine Organic Settlement Volume.** The SPX Skew Premium strategy is a live, operating yield engine — not a static tokenization or a one-time issuance. It generates continuous, recurring on-chain settlement events: monthly P&L reconciliations, yield distributions, on-chain attestation publications, and CC reward disbursements to vault participants. This is durable, economically-grounded settlement activity that persists for the full duration of the pilot and, upon successful validation, scales into subsequent epochs and expanded capital deployments. It is precisely the kind of organic activity — rooted in real institutional trading rather than incentivized volume — that demonstrates Canton's operational maturity to prospective participants.

**New Yield Opportunities for Canton Network Participants.** The D2 Finance vault structure (Milestone 4) is deliberately designed to be open to the broader Canton ecosystem. Canton network participants will gain access to an institutional-grade, TradFi-sourced yield strategy that has been entirely inaccessible to on-chain capital until now: uncorrelated with DeFi rates, enhanced with CC rewards, and backed by a verified Prime Broker custody model. For Canton participants building portfolios, managing treasury, or seeking non-correlated yield, the SPX RWA vault represents a categorically new option — the kind of sophisticated strategy that previously required direct relationships with institutional managers like PAG, now accessible through Canton-native infrastructure.

**A Platform for Sophisticated On-Chain Strategies, Not a One-Off.** The infrastructure established across these milestones — settlement architecture, vault primitives, PB integration patterns, and on-chain attestation framework — is explicitly designed as a reusable foundation for a broader class of TradFi strategies migrating on-chain. 
D2 Finance's multi-strategy mandate means the SPX skew deployment is the first in a pipeline of institutional strategies that can leverage this same infrastructure: systematic derivatives, fixed overlays, cross-asset volatility strategies, and beyond. Canton becomes the natural institutional home for this expanding suite — each additional strategy generating further organic settlement activity, new participant yield opportunities, and deepening the network's credibility as the premier privacy-preserving settlement layer for sophisticated TradFi-to-DeFi migration.


**D2 Finance as Canton Validator**

D2 Finance is an existing Canton validator, the (proposed) Prime broker is an existing Canton participant, and Ether.fi is also a Canton participant. This proposal is not a cold start — it activates existing Canton participants into a production deployment.

---

### 4. Backward Compatibility

No backward compatibility impact on existing Canton infrastructure, smart contracts, or participant integrations. All new components are additive. The vault framework will be designed for composability with existing Canton tooling and USDCx infrastructure.

---

## Milestones and Deliverables

### Milestone 1: MVP Architecture — Legal, Prime Broker & Smart Contract Foundation

- **Estimated Delivery:** Week 1–10 (approximately Q1 2026)
- **Focus:** Establish the complete technical and legal infrastructure required to execute the SPX Skew Premium RWA Strategy on Canton, including Prime Broker engagement, legal entity structuring, and initial Canton-native vault smart contract development.
- **Deliverables / Value Metrics:**
  - Legal structure confirmed and documented
  - Prime Broker agreement executed
  - USDCx collateral acceptance framework scoped and approved by Prime Broker
  - On-chain attestation and reconciliation schema defined and documented
 
  - **Value Metric:** Fully executable blueprint for live pilot — legal entity active, PB relationship contracted, contracts testnet-verified (~$30,000 disbursed against documented legal and structural costs)

---

### Milestone 2: Proof of Concept Initiation — On-Chain Infrastructure Build & $50M Live Deployment

- **Estimated Delivery:** Q2 2026 (Week 11–16, targeting Late Q2)
- **Focus:** Build and deploy the core on-chain infrastructure required to run the pilot — Chainlink oracle/attestation integration for off-chain NAV verification, custodial wallet setup (Anchorage or Fireblocks), and Canton vault mainnet deployment — culminating in Ether.fi $50M live deployment to the Prime Broker and first on-chain reconciliation cycle. Grant disbursed against documented build costs.
- **Deliverables / Value Metrics:**
  - Chainlink oracle integration (or equivalent trust-minimized attestation feed) deployed and verified on Canton testnet, then mainnet
  - Custodial wallet operational via institutional-grade provider (Anchorage Digital or Fireblocks) with Prime Broker connectivity confirmed
  - $50M+ deposited to Prime Broker under the agreed legal structure
  - First SPX put-selling trades executed via Bloomberg EMSX / IB chat by D2 (no withdrawal rights confirmed in writing)
  - First on-chain attestation of Prime Broker position published to Canton
  - First on-chain P&L reconciliation cycle completed and published to Canton
  - **Value Metric:** On-chain attestation infrastructure live and verified; $50M institutional capital settled on Canton; co-marketing announcement live

---

### Milestone 3: Proof of Concept Validation — 6-Month Testing Period with Tiered CC Yield Rewards

- **Estimated Delivery:** Q3 2026 (Months 1–6 of live operation, post Milestone 2)
- **Focus:** Execute the full 6-month proof of concept epoch with a performance-contingent two-tranche CC reward structure, monthly on-chain attestations, and comprehensive performance documentation to validate the strategy, settlement infrastructure, and Canton reward model. To demonstrate explicit skin in the game alongside Canton, D2 Finance is waiving all management and performance fees on this $50M allocation for the duration of the 6-month pilot.
- **CC Reward Structure:**
  - **Tranche 1 — Base Reward (unconditional):** 1% APR CC reward distributed monthly regardless of strategy yield — approximately $25,000/month on $50M deployed ($150,000 total over 6 months). This baseline reward offsets the initial first-mover technical risk of a new institutional deployment on Canton architecture.
  - **Tranche 2 — Performance Cushion (variable, capped at 4% APR):** A performance cushion of up to 4% APR CC to support the initial strategy parameters during the pilot period. The strategy targets 8% gross yield; this tranche provides a Canton-funded yield top-up in softer volatility environments where realized strategy yield compresses below that target. Tranche 2 disburses only to the extent realized monthly yield falls short of the 8% gross target, with Canton's contribution capped at 4% APR on $50M ($166,667 over 6 months) under any scenario. In a normal-to-elevated vol regime where the strategy performs at or above target, Tranche 2 draws minimally or not at all.
  - **Combined maximum CC exposure:** ~$316,667 over 6 months ($150,000 Tranche 1 base + up to $166,667 Tranche 2). Expected disbursement in a normal-to-elevated volatility regime — where the strategy targets 7–12% gross yield — is materially lower, as Tranche 2 draws minimally or not at all. The underlying sticky TVL incentive remains the canonical strategy itself.
- **Deliverables / Value Metrics:**
  - 6 monthly on-chain attestations published to Canton (position, P&L, yield)
  - Tranche 1 base CC rewards distributed monthly ($25,000/month, 6 months)
  - Tranche 2 performance cushion CC calculated and distributed monthly based on realized strategy yield vs. 8% gross target, capped at 4% APR Canton contribution
  - Monthly yield reconciliation report published on-chain — strategy yield, Tranche 2 drawdown (if any), and cumulative reward spend
  - Strategy performance documented vs. benchmark (target: 7%+ gross yield, 0% floor maintained)
  - Operational risk log maintained — any execution incidents, reconciliation discrepancies, and resolutions documented
  - End-of-pilot performance summary report published (on-chain verifiable), including total CC reward utilization across both tranches
  - **Value Metric:** 6 completed attestation cycles; tiered CC rewards fully distributed and verifiable; strategy performance independently verifiable on-chain; pilot declared successful or with documented learnings for iteration

---

### Milestone 4: Productized Vault — Canton Ecosystem Access & Featured Application

- **Estimated Delivery:** Q4 2026
- **Focus:** Generalize the SPX Skew Premium settlement infrastructure into a reusable, audited vault framework. Build and launch a featured Canton ecosystem application enabling any qualified Canton participant to access the strategy. Publish open-source architectural templates for future RWA deployers on Canton.
- **Deliverables / Value Metrics:**
  - Canton vault smart contracts v1.0 — fully audited (third-party audit report published)
  - Featured dApp deployed: Canton ecosystem participant interface for SPX RWA vault deposits, yield tracking, and withdrawal
  - Whitelisting / KYC/AML framework defined for institutional access
  - Canton Foundation case study or technical blog published
  - **Value Metric:** Audited, live dApp accessible to Canton ecosystem; second institutional participant in pipeline

---

### Milestone 5: SPX Skew Trade Tokenization (Optional Extension)

- **Estimated Delivery:** Q1-Q2 2027
- **Focus:** Tokenize the SPX Skew Premium trade itself as a Canton-native RWA instrument — creating a composable, transferable on-chain representation of the strategy position. This enables secondary market participation, structured product composition, and establishes Canton as an RWA tokenization venue for derivatives-based yield strategies.
- **Deliverables / Value Metrics:**
  - SPX Skew RWA token standard defined and implemented on Canton (legal wrapper, on-chain representation, transfer restrictions)
  - Legal opinion obtained on tokenized instrument classification
  - Token integrated into the Canton vault dApp — depositors receive tokenized position receipts
  - Transfer and secondary market framework documented (OTC or venue-based)
  - Partnership with lending market, OTC venue, or structured product issuer to utilize tokenized RWA as collateral.
  - **Value Metric:** Live tokenized SPX RWA instrument on Canton; live use for RWA as collateral in Canton ecosystem.

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone, with supporting documentation
- Demonstrated on-chain functionality for each milestone (testnet for M1; mainnet for M2–M5)
- Monthly attestation reports published on-chain for M3 (6 total)
- Monthly yield reconciliation reports published on-chain for M3 (6 total), including Tranche 2 drawdown calculations
- CC reward distribution logs verifiable on Canton for M3 (Tranche 1 and Tranche 2 separately)
- Third-party audit report accepted for vault contracts in M4
- Legal opinion letter provided for tokenized instrument in M5
- Documentation and developer resources published for ecosystem reuse (M4, M5)
- Joint co-marketing commitments fulfilled per milestone (announcement M2; case study M4; CIP candidate M5)
- Alignment with stated value metrics as defined per milestone above

---

## Funding

**Total Funding Request:** $225,000 fixed (core proposal) + up to $166,667 variable (Milestone 3 performance cushion) + $100,000 optional (Milestone 5 extension)

### Payment Breakdown by Milestone

| Milestone | Description | Funding (CC, fixed at acceptance) |
|-----------|-------------|-----------------------------------|
| Milestone 1 | (~$30,000) MVP Architecture — Legal entity structuring, Prime Broker documentation, regulatory opinion letters & associated setup costs | Fixed, disbursed against documented legal costs |
| Milestone 2 | (~$45,000) Proof of Concept Initiation — On-Chain Attestation Build (Chainlink integration), Custodial Wallet Setup (Anchorage / Fireblocks), & $50M Live Deployment | Fixed, disbursed against documented build costs |
| Milestone 3 | ($150,000 base + up to $166,667 variable) 6-Month PoC Validation & Tiered CC Yield Rewards | Tranche 1: $25,000/month fixed for 6 months; Tranche 2: variable monthly performance cushion up to 4% APR, calculated against realized strategy yield vs. 8% gross target |
| Milestone 4 | ($75,000) Productized Vault, Canton Ecosystem dApp, & Third-Party Audits | Fixed |
| Milestone 5 | ($100,000) **(Optional Extension)** Tokenized RWA Instrument — Legal wrappers & Canton Primitives | Fixed |

> **Note on Milestone 3 Reward Structure:** The two-tranche CC reward model is designed to align Canton's incentive spend with actual strategy performance. Tranche 1 (1% APR base, $150,000 total) is disbursed unconditionally as a first-mover deployment incentive. Tranche 2 (variable, capped at 4% APR) is a performance cushion supporting the initial strategy parameters — the strategy targets 8% gross yield, and Canton's contribution bridges any shortfall below that target, up to a 4% APR cap. In a normal-to-elevated volatility environment where the strategy delivers at or above target, Tranche 2 draws minimally or not at all. Maximum combined exposure across both tranches is ~$316,667 over 6 months. This should be scoped as two separate network incentive line items in final grant documentation.

### Volatility Stipulation

The total project duration spans greater than 6 months (M1 through M5 approximately 12 months). The grant is therefore denominated in fixed Canton Coin and will require a re-evaluation at the 6-month mark. Should the Committee request scope changes to any remaining milestones after the 6-month mark, any remaining milestone payments must be renegotiated to account for significant USD/CC price volatility.

---

## Suggested Co-Marketing

Upon completion of each milestone, D2 Finance, the allocation partner, and Canton Foundation will collaborate on:

**Milestone 2 (Pilot Launch):**
- Joint press release: "First Institutional SPX RWA Strategy Deployed on Canton" — coordinated across D2 Finance, and Canton Foundation communications channels
- Announcement coverage targeting institutional DeFi, RWA, and TradFi blockchain verticals 
- D2 Finance allocation partner community announcement to their $7B+ TVL depositor base

**Milestone 4 (Ecosystem dApp):**
- Canton Foundation technical blog / case study: architecture, privacy-preserving settlement, and lessons from $50M pilot
- Developer documentation promoted via Canton ecosystem developer channels
- Co-presentation at relevant institutional DeFi or RWA conference (e.g., Token2049, Consensus, Digital Assets Summit)

**Milestone 5 (Tokenization):**
- Technical deep-dive article: SPX skew tokenization design decisions and institutional adoption implications
- Outreach to prospective Canton RWA issuers using the open framework as a reference deployment

---

## Motivation

**Why This Matters for the Canton Ecosystem**

The strategy itself solves a real, immediate problem for on-chain capital allocators: the absence of uncorrelated yield. Every major on-chain yield strategy today is correlated. SPX skew premium is not. This is not marginal improvement — it is a categorically different risk/return input for institutional portfolio construction.

For Canton specifically: this deployment creates a publicly visible proof-of-concept that institutional-grade TradFi strategies can migrate on-chain through Canton's privacy-preserving infrastructure. It activates existing Canton bank participants (Goldman, JPM, UBS, BNP) to potentially expand their use of Canton in a production trading context — converting their Canton membership into live settlement relationships. It generates the network effects that attract subsequent institutional RWA issuers. And through the productized vault framework and tokenization milestones, it leaves behind reusable infrastructure that compounds Canton's institutional positioning long after the pilot concludes.

---

## Rationale

**Why This Approach**

*Why the SPX Skew Premium strategy?* It is the most liquid, most academically documented, longest-running volatility harvesting strategy in institutional finance. The CBOE PUT Index provides 32+ years of auditable benchmark performance. D2's principals ran this exact strategy at PAG for 5+ years under SS&C audit. It is not a novel or unproven approach — it is a proven TradFi strategy being made accessible on-chain for the first time.

*Why non-custodial Prime Broker structure?* Because custody never leaves the institutional framework. D2's allocation partner retains 100% beneficial ownership; the Prime Broker holds assets under Basel III; D2 operates as execution agent only with zero withdrawal rights. This eliminates counterparty risk to the strategy itself. Furthermore, D2 Finance actively manages the SPX premium skew strategy's tail risk. While the proposed SPX RWA strategy structure involves short volatility exposure, D2's flagship multi-strategy fund is structurally long volatility. This allows D2 to naturally hedge this left-tail risk across its portfolio, possessing the capacity to easily accommodate hedging for $100M+ in the SPX skew strategy at current AUM. This combined approach creates the least novel, most institutionally familiar risk profile possible.

*Why Canton?* Canton's privacy-preserving architecture is a genuine prerequisite for Prime Broker participation at scale. Banks will not expose position data on a fully transparent public ledger. Canton's need-to-know model satisfies bank compliance requirements that Ethereum cannot. Additionally, Canton's existing relationships with TradFi institutions mean settlement conversations begin with counterparties who already have Canton infrastructure — dramatically reducing onboarding friction. The CC reward layer provides additional yield incentive unavailable on alternative blockchains for long term sustainability of a strategy yield vault.

*Why this team?* D2 Finance brings the only combination of: (a) verified TradFi track record running this exact strategy at PAG.com, (b) 27 months of live on-chain operation with audited smart contracts, (c) existing Canton validator status, and (d) Ether.fi providing the $50M initial capital commitment and risk. This proposal does not ask Canton to fund discovery; it asks Canton to accelerate and reward a deployment that is already in motion.

*Why these milestones?* The milestone sequence is deliberately staged to minimize Canton's risk: M1 proves architecture before capital moves; M2 initiates capital only after legal and technical infrastructure is confirmed; M3 validates the pilot with monthly on-chain proof before productization investment, with CC rewards structured to scale inversely with strategy outperformance; M4 converts the pilot into ecosystem infrastructure; M5 creates lasting Canton-native RWA primitives. Each milestone delivers independent value and can be evaluated discretely.

---

*DISCLAIMER: This proposal is for discussion and grant application purposes only and does not constitute an offer or solicitation. All terms are indicative and subject to final documentation. This does not constitute financial, legal, or investment advice.*

*Prepared by: Frank (Head of Operations & Growth), D2 Finance*  
*Licensed Entity: Ayers Rock Technology Limited (BVI Approved Manager)*  
*Contact: hwxfrank@d2.finance*  
