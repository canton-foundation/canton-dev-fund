# Canton Development Fund Application: Roil (Private Treasury Management)

## 1. Executive Summary
**Project Name:** Roil  
**Tagline:** Private Treasury Management on Canton Network  
**Category:** DeFi / Treasury Management / Privacy Infrastructure  
**SIG:** defi-protocols  
**Champion:** TBD (Seeking SIG Sponsor)  
**Website:** https://roil.app  
**GitHub Organization:** https://github.com/Roil-Finance/roil-finance  
**Applicant Status:** Independent Development Team & Canton Validator Operator (`roilfinance-validator-1`)

### Project Overview
Roil is a privacy-first, automated treasury and portfolio management platform natively built for the **Canton Network**. Utilizing Canton’s unique **sub-transaction privacy** model and **Daml smart contracts**, Roil enables users—from DeFi participants to institutional asset managers—to perform automated portfolio rebalancing, Dollar-Cost Averaging (DCA), and yield auto-compounding without exposing their underlying portfolio allocations, order flow, or execution strategies to the public ledger.

---

## 2. Problem Statement & Canton Ecosystem Value

### The Problem
On public EVM-based blockchains, portfolio composition, strategy parameterization, and transaction execution are fully transparent. This exposes traders and institutions to:
1. **MEV & Front-Running:** Bots exploit order visibility, extracting billions in value.
2. **Strategy Copying:** Sophisticated treasury strategies are instantly cloned.
3. **Institutional Reluctance:** Financial institutions cannot manage significant treasuries on fully transparent ledgers.

### The Solution & Value to Canton
Roil solves these challenges by leveraging Canton's **sub-transaction privacy** and **CIP-0056 token standard**. 

**Key Network Benefits for Canton:**
- **Uniform Transaction Traffic Profile:** Unlike high-burst trading platforms, Roil’s DCA and drift-rebalancing engines distribute transaction envelopes evenly across Canton’s 10-minute rounds ("round-aware scheduling"). This aligns perfectly with **CIP-0104** transaction economics.
- **Daml & CIP-0056 Showcase:** Demonstrates advanced Daml capabilities (authorization-centric contracts, feature caps, atomic settlements) and full CIP-0056 compliance.
- **CIP-0116 Compliance:** Roil has secured **5,000,000 CC** to satisfy the Non-Issuer Featured App (FA) staking requirement, ensuring complete regulatory and operational alignment with Canton Foundation mandates.
- **Liquidity & Volume:** Onboarding automated liquidity/AMM execution natively on Canton, driving consistent ledger activity and CC velocity.

---

## 3. Technical Architecture & Current Progress

Roil employs a 3-tier architecture designed for production-grade reliability:

- **Canton Participant Node (Daml Ledger):** 10 Daml Modules (DAR v0.3.4), CIP-0056 Native
- **Backend (Express / TypeScript Engine):** Rebalance, DCA, Compound, Reward Engine, Round-Aware Scheduler
- **Frontend (React 19 / Vite UI):** Passkey / Web3 Auth + Canton dApp SDK

### Daml Smart Contract Architecture (10 Modules)
- `Types.daml`: Core types (`AssetId`, `Holding`, `Tier`, `TriggerMode`).
- `Portfolio.daml`: Portfolio drift tracking, rebalancing state, atomic swap execution assertions.
- `DCA.daml`: Scheduled buy orders with frequency constraints and on-ledger auditing.
- `RewardTracker.daml`: Tier-based CC rebate mechanics (Bronze to Platinum).
- `TokenTransfer.daml` & `TransferPreapproval.daml`: Standardized CIP-0056 transfer routing.
- `Governance.daml` & `Whitelist.daml`: System parameter configuration, circuit breakers, and feature caps (`totalValueUSD`, `amountPerBuy`).
- `FeaturedApp.daml`: GSF activity logging and Featured App interaction hooks.

### Testing & Readiness
- **Daml Contracts:** 161 Daml Script tests passed (100% coverage on authorization & edge cases).
- **Backend & Services:** 267 Vitest suites passed (engine logic, circuit breakers, price oracle fallback).
- **MainNet Status:** Validator bootstrapped (`roilfinance-validator-1`), DAR v0.3.4 registered on TestNet & MainNet.

---

## 4. Grant Proposal & Milestones

We are requesting grant funding from the **Canton Development Fund** to complete external security audits, deploy proprietary native AMM liquidity contracts, and execute our official MainNet launch.

| Milestone | Description | Deliverables | Target Timeline | Requested Grant (CC) |
|-----------|-------------|--------------|-----------------|----------------------|
| **Milestone 1 (Completed)** | Core Infrastructure, Daml Contracts & TestNet Deploy | 10 Daml modules, TS Engine, React 19 Frontend, 428 passing tests, TestNet deployment at `api.roil.app`. | Completed | - |
| **Milestone 2 (Execution)** | Security Audit & Native AMM Engine | 1. Third-party smart contract security audit for Daml codebase.<br>2. Deployment of native execution layer (AMM/liquidity pool Daml contracts).<br>3. CIP-0116 FA Staking (5M CC lockup execution). | Month 1–2 | **250,000 CC** |
| **Milestone 3 (MainNet & Scale)** | Public MainNet Launch & RWA Integration | 1. MainNet application launch.<br>2. Onboarding initial 500 alpha/beta users.<br>3. Integration of Canton-native RWA assets (e.g., tokenized gold/bonds). | Month 3–4 | **250,000 CC** |
| **Total Requested** | | | | **500,000 CC** |

---

## 5. Team & Repository Information

- **Core Team:**
  - **Seyfettin (Founder & Lead Developer):** Blockchain engineer and Canton Network validator operator (`roilfinance-validator-1`). Specialized in Daml smart contracts, TypeScript backend architecture, and Canton infrastructure.
  - **Barış / barissdev (Developer):** Blockchain and full-stack developer contributing to application development, frontend integration, and core mechanics. GitHub: https://github.com/barissdev
- **GitHub Repositories & Profiles:**
  - Main Repo (Daml + Backend + Core): https://github.com/Roil-Finance/roil-finance
  - Web Application Repo: https://github.com/Roil-Finance/roil-app
  - Team Member Profile: https://github.com/barissdev
- **Canton Validator Party ID:** `roilfinance-validator-1`
- **Canton Validator Party ID:** `roilfinance-validator-1`
