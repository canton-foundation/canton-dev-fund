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

The entire core protocol — including smart contracts and exchange infrastructure — will be open-sourced by mainnet launch, enabling:

* Reuse by exchanges and trading applications
* Standardization of trading primitives across Canton
* Faster ecosystem-wide innovation

This includes:
* On-chain settlement, margin, and liquidation contracts
* Off-chain Rust matching engine (CLOB)
* APIs and integration layer

We have engaged with multiple teams exploring perpetuals on Canton, including PixelPlex and Console Wallet, who confirmed they will use the Ekiden stack to accelerate time-to-market and focus on growth and distribution rather than rebuilding core infrastructure.

Ekiden is designed as an open, community-owned protocol.

We believe that only open-source systems — continuously improved through iteration and contributions from multiple teams — can evolve into resilient, long-term infrastructure.

By open-sourcing both the on-chain and off-chain components, Ekiden enables:

* Continuous improvement by ecosystem contributors
* Faster innovation cycles across multiple teams
* Shared ownership of critical trading infrastructure

As part of this vision, we are open to aligning ownership of the protocol with the Canton ecosystem, including potential contribution of core IP into a foundation-led or community-governed structure over time.

Milestone 6 specifically refers to aligning the exchange protocol layer with the Canton ecosystem over time. This includes:
* CLOB and matching engine design
* Risk and liquidation systems
* Fee and funding mechanisms
* Execution modules
* Exchange APIs and protocol specifications

The goal is to evolve Ekiden into shared ecosystem infrastructure rather than a closed, single-team operated product.

---

## 4. Milestones, Funding & Deliverables

### Milestone 6 — Ecosystem Contribution  
Timeline: Post-traction  
Funding: 2,400,000 CC  

Deliverables:
- Alignment of exchange protocol infrastructure with the Canton ecosystem
- Open access to protocol infrastructure and specifications
- Governance and ecosystem ownership framework discussions

Acceptance Criteria:
- Significant trading volume achieved
- Active ecosystem integrations
- Exchange operating as a shared Canton liquidity venue
- Open-source infrastructure actively reused by ecosystem participants

---

## 9. Current Status

Ekiden is already fully built and operational.

The exchange, matching engine, APIs, liquidity integrations, and trading infrastructure are already live today.

Demo is accessible via the following links:
- https://app.ekiden.fi
- https://app.ekiden.fi/stats

Current metrics:
- ~75,000 registered wallets
- ~25 million trades executed daily

At the moment, deposits are intentionally capped at low limits while infrastructure rollout and validation continue.

The Canton deployment specifically focuses on:
- Deposits and withdrawals
- On-chain settlement
- Margin and liquidation contracts
- Oracle integration and failover

This significantly reduces implementation risk and enables a fast deployment timeline.

The matching engine is initially operated by Ekiden, though the architecture supports multiple independent operators over time.

From a trading systems perspective, fully decentralized matching is generally not preferred due to latency and colocation requirements. The design goal is performance and reliability first, while keeping infrastructure modular and extensible.

Importantly, user funds remain secured on-chain at all times, while the off-chain layer handles execution and ordering only.

---
