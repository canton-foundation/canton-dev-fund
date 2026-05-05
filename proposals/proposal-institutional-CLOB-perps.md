# Ekiden on Canton — Institutional CLOB-based Perpetual Futures Exchange

## Abstract

This proposal introduces Ekiden.fi, a high-performance Central Limit Order Book (CLOB) perpetual futures exchange deployment on Canton Network.

Ekiden combines:
- Off-chain deterministic matching engine (5–15ms latency)
- On-chain settlement and margin system
- Institutional-grade API infrastructure

The goal is to bring trading volume, liquidity, and real-world asset (RWA) perpetual futures into the Canton ecosystem.

Unlike AMM-based designs, Ekiden enables:
- Precise price discovery  
- Deep liquidity provisioning  
- Familiar UX for algorithmic traders  

Ekiden brings a strong network of partners and investors who are already active or aligned with the Canton ecosystem and will directly benefit from this deployment. 
These include LayerZero, Flowdesk, Keyrock, Enigma Validator, G20, GSR, and Chainlink, among others. Their involvement brings immediate liquidity, infrastructure support, and distribution, accelerating adoption of trading on Canton from day one.

---


## Product Overview

 ![04.2. Connected Returning User (2) (1)](https://hackmd.io/_uploads/HkeXQnh9pZl.png)

Ekiden.fi is a fully built and production-ready exchange with:
- Live order book interface
- Real-time trading and execution
- Integrated margin and positions system
- Liquidation Engine


## 1. Architecture

Ekiden consists of three core components:

### On-chain Layer
- Margin accounts and settlement  
- Perpetual markets  
- Liquidation engine  
- Oracle integration with failover  

### Off-chain CLOB
- Deterministic order matching  
- Sub-20ms execution latency  
- Horizontal scaling by market  

### API Layer
- Institutional-grade connectivity  
- Integration with:
  - Market makers  
  - Prop trading firms  
  - Aggregators (CCXT, Hummingbot)  

---


## 2. Technical Design

Ekiden is a hybrid trading system combining off-chain execution with on-chain settlement.

### Core Flow

1. Users sign trading intents using API keys  
2. Orders are submitted to the matching engine  
3. Orders are matched deterministically in the CLOB  
4. Trades are batched and submitted on-chain  
5. On-chain layer validate and settle positions  

---

### Matching Engine (Off-chain)

- Written in Rust, optimized for low-latency execution  
- Deterministic matching per market (market-based sharding)  
- Supports limit, market, and conditional orders  
- Maintains full order book state and trade history  
- Designed for horizontal scaling across markets  

---

### On-chain Layer

- Implemented in Daml  
- Responsible for:
  - Margin accounting  
  - Position tracking  
  - Trade settlement  
  - Liquidation logic  

- Cross-margin system with single collateral model  
- Modular design allowing additional collateral assets  

---

### Risk Engine

- Real-time margin validation before order acceptance  
- Enforces:
  - Initial and maintenance margin  
  - Position limits  
  - Account health checks  

- Liquidation engine:
  - Monitors undercollateralized accounts  
  - Executes partial and full liquidations  
  - Integrates with oracle price feeds  

---

### Oracle System

- Uses external price feeds with fallback mechanisms  
- Supports failover logic to prevent manipulation  
- Critical for liquidation and mark price calculation  

---

### API & Integration Layer

- REST / WebSocket / gRPC interfaces  
- Designed for:
  - Market makers  
  - Algorithmic traders  
  - External trading platforms  

- Supports high-frequency trading workflows  
- Compatible with industry tools (CCXT, Hummingbot)  

---

### Data & Reliability

- Persistent storage via RocksDB  
- Snapshot + replay recovery for fault tolerance  
- Idempotent order handling  
- Deterministic sequencing of trades  

---

### Deployment Model

- Off-chain services operate independently of chain performance  
- On-chain layer ensures finality and correctness  
- Enables continuous trading even under partial network degradation  

This architecture provides the performance of centralized exchanges with the settlement guarantees of on-chain systems.

## 3. Public Good Contribution

Ekiden contributes to the Canton ecosystem as a shared trading infrastructure layer, not just an application.

* Provides a unified liquidity venue for Canton-based assets
* Enables fast listing of new markets (including RWAs)
* Offers standardized APIs for wallets, exchanges, and applications
* Unlocks institutional-grade execution and uptime across the ecosystem

Ekiden is designed to integrate directly with key ecosystem components (and will have these at launch):

* Temple Vaults — enabling capital deployment into trading strategies (market making, basis trades, funding capture)
* cBTC — supported as a collateral asset, unlocking BTC-denominated liquidity
* Tradecraft Swap SDK — enabling seamless asset routing and onboarding
* Tradecraft liquidity pools — building a liquidity layer on top of Ekiden’s CLOB, enabling pooled capital to participate in market making and execution

Multiple teams are already planning to build on top of Ekiden’s infrastructure:

* Trading competitions via Squads.fi
* Algorithmic strategy marketplace via Tradium
* AI-driven execution and arbitrage via Pelagos
* On-ramp via AhoraCrypto.com

In addition, Ekiden is actively driving institutional adoption through integration with Fordefi, lowering the barrier for professional capital to access Canton.

The entire core protocol — including smart contracts and exchange infrastructure — will be open-sourced, enabling:

* Reuse by exchanges and trading applications
* Standardization of trading primitives across Canton
* Faster ecosystem-wide innovation

We have engaged with multiple teams exploring perpetuals on Canton, including PixelPlex and Console Wallet, who confirmed they will use Ekiden stack to accelerate time-to-market, and it will allow them to focus on growth and distribution rather than rebuilding core infrastructure.

Ekiden is designed as an open, community-owned protocol.

We believe that only open-source systems — continuously improved through iteration and contributions from multiple teams — can evolve into resilient, long-term infrastructure.

By open-sourcing both the on-chain and off-chain components, Ekiden enables:

* Continuous improvement by ecosystem contributors
* Faster innovation cycles across multiple teams
* Shared ownership of critical trading infrastructure

As part of this vision, we are open to aligning ownership of the protocol with the Canton ecosystem, including potential contribution of core IP into a foundation-led or community-governed structure over time.

This ensures that Ekiden evolves as a public good for the network, rather than a closed, single-team product.

---

## 4. Milestones, Funding & Deliverables

### Milestone 1 — Canton Testnet Deployment  
Timeline: 3 weeks  
Funding: 700,000 CC  

**Deliverables:**
- Smart contracts deployed on Canton testnet  
- Deposit / withdraw / trading fully functional  
- Internal matching engine connected  

**Acceptance Criteria:**
- End-to-end trading flow live  
- 12 markets available  
- Internal test trading completed  

---

### Milestone 2 — Integrations & Early Liquidity  
Timeline: 2 weeks  
Funding: 700,000 CC  

**Deliverables:**
- Integration with ≥ 2 market makers  
- Integration with ≥ 1 external interface (aggregator / API user)  
- Initial growth campaigns launched  

**Acceptance Criteria:**
- ≥ 500 active users  
- ≥ 1M USD testnet trading volume  
- ≥ 2 integrations live  

---

### Milestone 3 — Security & Audit  
**Timeline:** 3 weeks  
**Funding:** 700,000 CC  

**Deliverables:**
- Smart contract audit completed  
- Risk engine validation  
- Monitoring and oracle failover implemented  

**Acceptance Criteria:**
- Audit report delivered  
- All critical issues resolved  
- Public documentation published  

---

### Milestone 4 — Mainnet Launch  
**Timeline:** 2 weeks  
**Funding:** 500,000 CC  

**Deliverables:**
- Full deployment on Canton mainnet  
- Trading enabled  
- Market makers active  

**Acceptance Criteria:**
- ≥ 15 markets live  
- ≥ 3 market makers connected  
- Stable trading environment  

---

### Milestone 5 — Liquidity & Growth  
**Timeline:** 4 weeks  
**Funding:** 700,000 CC  

**Deliverables:**
- Institutional onboarding  
- Liquidity programs (MM incentives, trading campaigns)  
- Market expansion  

**Acceptance Criteria:**
- ≥ 500M USD cumulative trading volume  
- ≥ 1,000 active users  
- Sustained daily trading activity  

---

### Milestone 6 — Ecosystem Contribution  
**Timeline:** Post-traction  
**Funding:** 2,400,000 CC  

**Deliverables:**
- Transfer of exchange ownership / infrastructure alignment with Canton ecosystem  
- Open access to trading infrastructure for ecosystem partners  

**Acceptance Criteria:**
- Significant trading volume achieved  
- Active ecosystem integrations  
- Exchange operating as a shared Canton liquidity venue  

___

### Total Funding Request

**Total: 5,700,000 CC**

---

## 5. Roadmap & Timeline

Ekiden follows a phased launch approach to bootstrap liquidity and onboard users ahead of full trading activation.

- **May 17** — Waitlist campaign launch  
  Initial user acquisition and onboarding of early participants.

- **June 2** — Testnet launch
Users can run complete trading flow across 12 markets
 
- **June 22** - Pre-deposits open  
  Users can deposit funds ahead of trading, allowing early liquidity formation.

- **July 14** — Mainnet launch  
  Trading goes live with initial markets, active market makers, and full platform functionality.

This staged rollout ensures liquidity is seeded before trading begins, enabling strong activity from day one.

---

## 6. GTM and Liquidity Strategy

Ekiden’s growth strategy is focused on driving trading volume and building a strong, sustainable liquidity base. We take a product-centric approach and target three main user groups:

- **Institutions** — we provide tailored terms and integrations for each partner  
- **Algorithmic traders** — professional traders with proven strategies, integrated via API  
- **Retail traders** — onboarded through marketing and community efforts, providing essential counterparty flow  

We leverage the following mechanisms to grow activity:

- **Points program**  
  Users earn future Ekiden token allocation based on their activity. Rewards are tied to trading volume, maker flow, and overall engagement.

- **Market maker program**  
  Performance-based incentives for liquidity providers, with clear KPIs such as depth, spreads, and uptime. In some cases, minimum volume requirements apply.

- **Referral program**  
  Multi-tier fee rebates that incentivize users to bring in new traders and grow network activity.

- **Affiliate / builder program**  
  Revenue sharing with partners building on top of Ekiden (interfaces, aggregators, integrations). Each partner operates with a dedicated code.

- **Trading incentives and campaigns**  
  Ongoing competitions and reward programs with public leaderboards, designed to gamify trading and drive engagement.

- **Marketing and distribution**  
  Targeted campaigns across trading communities and KOL networks, focused on high-intent users and liquidity migration from other venues.

- **Fast listings**  
  New markets can be listed quickly once price feeds are available, allowing us to capture demand for trending assets.

- **MM vaults (in development)**  
  Structured liquidity pools operated by professional market makers, enabling users to participate in market-making strategies and share in generated yield.

- **Community and mindshare**  
  Continuous engagement with the trading community through education, content, and direct interaction, driving organic growth and retention.

Ekiden already has an existing trading community of ~75,000 whitelisted users, providing a strong foundation for initial liquidity and activity.

---

## 7. Sustainability

Ekiden is a **revenue-generating protocol**.

### Revenue sources
- Trading fees  
- Liquidation fees  
- Listing fees  

Post-grant, development and operations are sustained through protocol revenue.

---

## 8. Alignment with Canton Priorities

### Scaling the Network
- Algo trading activity  
- Increased order flow  

### App Ecosystem Growth
- Liquidity layer for other applications  
- Integration-ready trading APIs  

### Security & Reliability
- Deterministic matching engine  
- Audited smart contracts  
- Robust risk management  

---

## 9. Current Status

Ekiden is already fully built and operational.

This deployment is not starting from zero — Ekiden already has:
	•	Integrated liquidity and Tier-1 market makers
	•	Active trading infrastructure
	•	Confirmed ecosystem partners and integrations
	•	Institutional onboarding in progress (via Fordefi)

This reduces development complexity, risk, and time to market, enabling a fast deployment on Canton. 

---

## 10. Co-Marketing

Ekiden will collaborate with the Canton ecosystem on:

- Launch announcements  
- Trading campaigns  
- Partner integrations  
- Liquidity programs  

---
