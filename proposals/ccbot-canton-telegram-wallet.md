# CC Bot Wallet — The First AI-Powered Passkey Wallet on Telegram for Canton Network

- **Author:** CC Bot Team
- **Status:** Draft
- **Created:** 2026-02-22
- **Champion:** [TBD]

---

## Abstract

CC Bot Wallet is a Telegram-native, self-custodial super app that serves as the **primary retail entry point** to Canton Network. By combining a seedless passkey wallet, AI-powered assistant, DeFi tools, NFT management, gaming mechanics, and a dApp browser into a single Telegram Mini App, CC Bot Wallet eliminates the need for users to register on multiple platforms for different blockchain operations.

With **950 million+ monthly active Telegram users** and **500M+ Mini App MAU**, Telegram represents the single largest untapped distribution channel for Canton Network. CC Bot Wallet bridges Canton's enterprise-grade infrastructure with consumer-scale adoption — no app downloads, no seed phrases, no friction.

The project is **production-ready**, fully open-source (Apache 2.0), and targets **mainnet launch in April 2026**.

- **Website:** https://www.ccbot.io
- **App:** https://app.ccbot.io
- **Telegram Bot:** @ccbotwallet_bot

---

## Motivation

### The Problem

Canton Network has built world-class enterprise infrastructure, but it currently lacks a **consumer-facing gateway** to onboard retail users at scale. Today:

- Users must download dedicated wallet apps, manage seed phrases, and navigate complex UIs
- Every blockchain operation (swap, stake, bridge, NFT) requires registering on a **separate platform**
- There is no Telegram-native wallet for Canton, despite Telegram being the dominant communication platform in crypto communities
- The gap between Canton's institutional capabilities and retail accessibility limits network growth and CC token adoption

### Why Telegram Matters for Canton

| Metric | Value |
|--------|-------|
| Monthly Active Users | **950M+** |
| Daily New Users | **2.5M+** |
| Mini App Monthly Active Users | **500M+** |
| Crypto-Native Communities | **Dominant platform** |
| Geographic Reach | **Global — especially emerging markets** |

Telegram is not just a messaging app — it is the **de facto operating system for crypto communities**. Every major blockchain ecosystem (TON, Solana, Ethereum) has recognized this and invested heavily in Telegram-native experiences. Canton Network must not fall behind.

By deploying CC Bot Wallet on Telegram, Canton gains:

- **Instant access** to 950M+ potential users with zero acquisition cost
- **Viral distribution** through Telegram's share/invite mechanics
- **Global financial inclusion** — Telegram is available where traditional banking is not
- **Network effect acceleration** — every new user generates transactions, fees, and ecosystem activity

### Why This is a Public Good

CC Bot Wallet is not a private product — it is **shared infrastructure** for the entire Canton ecosystem:

1. **Open-source reference implementation** — Other developers can fork, extend, and learn from it
2. **User onboarding pipeline** — Every user onboarded benefits all Canton dApps and protocols
3. **Developer tooling** — The crypto, Canton client, and shared packages are reusable libraries
4. **Network activity driver** — More users = more transactions = more value for all Canton participants
5. **Standard setter** — Establishes UX patterns for consumer-facing Canton applications

---

## Specification

### Objective

Build and launch the **first production-grade, AI-powered, self-custodial super app wallet** for Canton Network on Telegram, enabling retail users to:

- Create a wallet in seconds (no seed phrases, no app downloads)
- Send, receive, swap, stake, and bridge Canton Coin (CC) — all within Telegram
- Interact with Canton dApps through an in-wallet browser
- Manage NFTs and digital collectibles
- Get AI-powered assistance for transactions, portfolio analysis, and support
- Recover their wallet using passkeys (WebAuthn) across devices

### Implementation Mechanics

#### Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    TELEGRAM                              │
│  ┌──────────────┐  ┌──────────────────────────────────┐ │
│  │  Grammy Bot   │  │  Mini App (React + Vite)         │ │
│  │  (Webhook)    │  │  ┌────────┬────────┬───────────┐ │ │
│  └──────┬───────┘  │  │ Wallet │ DeFi   │ AI Agent  │ │ │
│         │          │  │ ┌────┐ │ ┌────┐ │ ┌───────┐ │ │ │
│         │          │  │ │Send│ │ │Swap│ │ │Natural│ │ │ │
│         │          │  │ │Recv│ │ │Stak│ │ │Language│ │ │ │
│         │          │  │ │QR  │ │ │Brdg│ │ │Txns   │ │ │ │
│         │          │  │ └────┘ │ └────┘ │ └───────┘ │ │ │
│         │          │  ├────────┼────────┼───────────┤ │ │
│         │          │  │ NFTs   │ Games  │ dApps     │ │ │
│         │          │  └────────┴────────┴───────────┘ │ │
│         │          └──────────────┬───────────────────┘ │
└─────────┼────────────────────────┼─────────────────────┘
          │                        │
┌─────────▼────────────────────────▼─────────────────────┐
│                   BACKEND (Fastify)                     │
│  ┌─────────┐  ┌──────────┐  ┌────────────────────────┐ │
│  │Auth     │  │Canton    │  │Background Jobs         │ │
│  │Service  │  │Service   │  │(BullMQ)                │ │
│  │(JWT)    │  │(SDK)     │  │• UTXO Merge (5min)     │ │
│  └─────────┘  └──────────┘  │• Canton Sync (2min)    │ │
│  ┌─────────┐  ┌──────────┐  └────────────────────────┘ │
│  │Wallet   │  │Transfer  │                              │
│  │Service  │  │Service   │                              │
│  └─────────┘  └──────────┘                              │
└────────┬──────────┬─────────────────────────────────────┘
         │          │
┌────────▼──┐  ┌────▼─────┐  ┌────────────────────────┐
│PostgreSQL │  │  Redis    │  │ Canton Network         │
│  16       │  │  7        │  │ (Mainnet)              │
│ 14 tables │  │ Sessions  │  │ @canton-network/       │
│ Drizzle   │  │ BullMQ    │  │   wallet-sdk v0.21.0   │
└───────────┘  └──────────┘  └────────────────────────┘
```

#### 1. Seedless Passkey Architecture (Core Innovation)

Traditional crypto wallets force users to manage 24-word seed phrases — the **#1 barrier to mass adoption**. CC Bot Wallet eliminates this entirely:

**2-of-3 Shamir Secret Sharing:**

```
Ed25519 Private Key (32 bytes)
        │
        │ Shamir Split (k=2, n=3)
        │
   ┌────┼────┐
   ▼    ▼    ▼
Share1 Share2 Share3
(User) (Server)(Recovery)
```

- **Share 1 (User Device):** Encrypted with PIN-derived AES-256-GCM key, stored in Telegram CloudStorage
- **Share 2 (Server):** Encrypted with server-side AES-256-GCM key, stored in PostgreSQL
- **Share 3 (Recovery):** Backed up via WebAuthn passkey — recoverable across devices using biometrics

**Any 2 of 3 shares** can reconstruct the private key for signing. Users never see a seed phrase. Recovery uses fingerprint/Face ID via the WebAuthn standard.

**Cryptographic Stack:**
- Ed25519 signing (Canton Network standard) via `@noble/curves`
- AES-256-GCM encryption via `@noble/ciphers`
- HKDF-SHA256 key derivation via `@noble/hashes`
- All audited, production-grade libraries — zero custom cryptography

#### 2. Canton Network Integration

Deep integration with the **official Canton SDK** (`@canton-network/wallet-sdk v0.21.0`):

- **External Party creation** with `SignAndAllocateExternalParty`
- **CC transfers** via `CreateTransfer` with nonce tracking
- **TransferPreapproval** for receiving tokens
- **UTXO management** with automatic merging (>10 UTXOs)
- **Balance queries** via External Party API
- **Transaction history** sync from Canton Ledger API
- **Daml smart contracts** for passkey recovery audit trail

#### 3. Super App — All Operations in One Place

**The core value proposition:** Users should never need to register on another platform to interact with Canton Network. Everything happens inside one Telegram Mini App.

| Feature | Description | Status |
|---------|-------------|--------|
| **Wallet** | Send, receive, QR codes, transaction history | Production Ready |
| **Passkey Recovery** | WebAuthn-based, cross-device wallet recovery | Production Ready |
| **Rewards Engine** | Daily tasks, streaks, referrals, XP levels | Production Ready |
| **AI Assistant** | Natural language transactions, portfolio analysis, 24/7 support | In Development |
| **Token Swaps** | DEX integration for CC and ecosystem tokens | Planned |
| **Staking** | Stake CC for network rewards | Planned |
| **Bridge** | Cross-chain asset bridging | Planned |
| **NFT Gallery** | View, mint, transfer Canton NFTs | Planned |
| **dApp Browser** | In-wallet WebView for Canton dApps | Planned |
| **Mini Games** | Play-to-earn mechanics with CC rewards | Planned |

#### 4. AI Agent Integration

The AI assistant transforms blockchain complexity into conversational simplicity:

- **Natural Language Transactions:** "Send 100 CC to @john" — the AI parses intent, confirms details, executes
- **Portfolio Analytics:** Real-time analysis, risk assessment, trend identification
- **Smart Recommendations:** Personalized staking/DeFi suggestions based on user profile
- **24/7 Support:** Conversational help for all wallet features
- **Price Analysis:** AI-powered market insights and alerts
- **Security Alerts:** Proactive notifications for suspicious activity

#### 5. Anti-Sybil & Security

- Telegram Premium verification, account age checking
- Behavioral analysis and device fingerprinting
- IP-based rate limiting (Nginx + Redis)
- PIN brute-force protection (5 attempts, 15-min lockout)
- JWT session management (15-min access, 7-day refresh)
- HMAC-SHA256 Telegram initData validation
- Structured security audit logging
- TLS 1.2/1.3 enforced, HSTS enabled
- Memory-safe key handling (private keys zeroed after use)

### Architectural Alignment

CC Bot Wallet is purpose-built for Canton Network:

- **Ed25519 signatures** — Canton's native signing algorithm
- **External Party API** — Direct integration with Canton's party management
- **Daml smart contracts** — Passkey recovery logic deployed as Daml templates
- **Canton SDK** — Official `@canton-network/wallet-sdk` for all ledger operations
- **Privacy model** — Respects Canton's sub-transaction privacy guarantees
- **UTXO model** — Handles Canton's UTXO-based token accounting natively

### Backward Compatibility

No backward compatibility impact. CC Bot Wallet is a new application that consumes Canton Network APIs through the official SDK. It does not modify any protocol-level behavior.

---

## Milestones and Deliverables

### Milestone 1: Mainnet Launch & Open Source Release
- **Estimated Delivery:** April 2026
- **Focus:** Production mainnet deployment, open-source release, initial user onboarding
- **Deliverables:**
  - Production mainnet deployment on app.ccbot.io
  - Full open-source release on GitHub (Apache 2.0)
  - Core wallet: send, receive, balance, transaction history
  - Passkey/WebAuthn wallet creation and recovery
  - Telegram bot with Mini App integration
  - CI/CD pipeline with automated deployments
  - User documentation and developer guides
- **Value Metrics:**
  - Functional mainnet wallet with real CC transactions
  - Public GitHub repository with documentation
  - 3,000+ onboarded users
  - 200-300 new users per day run rate

### Milestone 2: AI Agent & DeFi Integration
- **Estimated Delivery:** Q3 2026
- **Focus:** AI-powered assistant, DEX swaps, staking, security hardening
- **Deliverables:**
  - AI assistant with natural language transaction support
  - Token swap integration (Canton DEX)
  - CC staking interface and mechanics
  - Enhanced rewards engine (tasks, streaks, referrals)
  - Cross-chain bridge (initial implementation)
  - Third-party security audit completion
  - dApp browser (WebView-based)
- **Value Metrics:**
  - 18,000+ total users
  - 5,000-7,000 daily active users
  - 50,000-75,000 daily transactions
  - AI assistant handling 50%+ of user interactions
  - Published security audit report

### Milestone 3: Ecosystem Scale & Developer Platform
- **Estimated Delivery:** Q4 2026
- **Focus:** NFT support, developer SDK, multi-platform, ecosystem partnerships
- **Deliverables:**
  - NFT gallery, minting, and transfer features
  - Developer SDK/API for third-party integrations
  - Mini games platform with CC rewards
  - Canton Name Service (CNS) full integration
  - Multi-language support (10+ languages)
  - Performance optimization for 500K+ daily transactions
  - Enterprise API for institutional partners
- **Value Metrics:**
  - 45,000+ total users
  - 10,000-15,000 daily active users
  - 100,000-150,000 daily transactions
  - 10-15 transactions per user per day
  - 10+ integrated dApps
  - Developer SDK adoption metrics

---

## Acceptance Criteria

Each milestone will be evaluated based on:

1. **Deliverable Completion** — All listed deliverables are functional and deployed
2. **Demonstrated Functionality** — Live demo on Canton mainnet with real transactions
3. **Documentation** — Technical docs, API reference, and user guides published
4. **Open Source** — All code publicly available under Apache 2.0
5. **Metric Achievement** — Quantifiable metrics met or progress demonstrated
6. **Security** — No critical/high vulnerabilities in deployed code
7. **Canton Alignment** — Full compatibility with latest Canton SDK and protocol updates

---

## Funding

### Total Funding Request

[To be determined based on Tech & Ops Committee guidance]

### Payment Breakdown by Milestone

| Milestone | Deliverables | Estimated CC Amount | Payment Trigger |
|-----------|-------------|--------------------:|-----------------|
| M1: Mainnet Launch | Core wallet + open source + deployment | TBD | Mainnet live + GitHub release |
| M2: AI Agent & DeFi | AI assistant + swaps + staking + audit | TBD | Features deployed + audit published |
| M3: Ecosystem Scale | NFTs + SDK + games + partnerships | TBD | SDK released + user metrics achieved |

### Volatility Stipulation

For project duration exceeding 6 months, funding amounts may be re-evaluated per CIP-0082 guidelines to account for Canton Coin price volatility.

---

## Co-Marketing

Upon each milestone completion, we propose:

- Joint announcement with Canton Foundation on social channels
- Community AMA hosted in Canton Telegram groups
- Technical blog post on Canton Foundation blog detailing implementation
- Developer workshop showcasing open-source components for ecosystem builders

---

## Rationale

### Why This Approach?

1. **Telegram-first, not Telegram-also:** Purpose-built for Telegram's UI paradigm — not a web wallet ported to Telegram. This ensures the best possible UX for 950M+ potential users.

2. **Super app, not single-purpose wallet:** Users abandon single-purpose crypto apps. By combining wallet + DeFi + AI + gaming + NFTs, we create a sticky, engaging experience that drives daily active usage. Users do not need to register on multiple platforms for different operations.

3. **Seedless architecture:** The #1 reason mainstream users don't adopt crypto wallets is seed phrase management. Our 2-of-3 Shamir + Passkey approach delivers enterprise-grade security with consumer-grade simplicity.

4. **Official Canton SDK:** Built on the official `@canton-network/wallet-sdk` rather than custom API integrations, ensuring long-term compatibility and reducing maintenance burden.

5. **Open source from day one:** All code is Apache 2.0 licensed. Other developers can fork the wallet, reuse the crypto libraries, or extend the Canton client — amplifying the ecosystem impact far beyond our direct user base.

6. **AI-native:** AI agents are not a bolt-on feature. They are a core part of the UX — reducing the learning curve from "understand blockchain concepts" to "just tell the AI what you want."

### Why Now?

- Canton Network mainnet is maturing and needs consumer-scale adoption
- Telegram Mini Apps have proven product-market fit (500M+ MAU)
- Competing L1s (TON, Solana) are already investing heavily in Telegram wallets
- AI agent technology has reached production readiness
- The CC Bot Wallet codebase is already production-ready — this is not a speculative proposal

### Team

| Name | Role | Contact |
|------|------|---------|
| **Seher** | Co-Founder & Developer Lead | seher@ccbot.io |
| **Ferhat** | Co-Founder | ferhat@ccbot.io |
| **Umut** | Community Manager | umut@ccbot.io |
| **Suleyman** | Marketing Lead | suleyman@ccbot.io |
| **Serhat** | Operations | serhat@ccbot.io |

### Team Capability

- Production-ready codebase with 164+ TypeScript files across 5 packages
- Complete security audit (LOW risk rating, February 2026)
- Deep Canton SDK integration (official wallet-sdk v0.21.0)
- Full CI/CD pipeline, Docker deployment, and monitoring infrastructure
- Working Telegram bot and Mini App with 35+ UI screens defined

---

## Technical Appendix

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 6, Tailwind CSS 4, Framer Motion, Zustand |
| Backend | Node.js 22, Fastify 5, Grammy (Telegram Bot) |
| Database | PostgreSQL 16, Drizzle ORM |
| Cache/Queue | Redis 7, BullMQ |
| Cryptography | @noble/curves, @noble/hashes, @noble/ciphers |
| Canton SDK | @canton-network/wallet-sdk v0.21.0 |
| Smart Contracts | Daml (PasskeyRecovery) |
| Auth | JWT + HMAC-SHA256 + WebAuthn |
| Deployment | Docker, Nginx, GitHub Actions |
| License | Apache 2.0 |

### Database Schema (14 Tables)

`users`, `wallets`, `transactions`, `server_shares`, `sessions`, `verifications`, `email_codes`, `notifications`, `passkey_credentials`, `passkey_challenges`, `passkey_sessions`, `session_locks`, `security_events`, `rate_limits`

### Repository Structure

```
canton-telegram-wallet/
├── apps/
│   ├── bot/            # Fastify API + Grammy Telegram Bot
│   └── mini-app/       # React + Vite Telegram Mini App
├── packages/
│   ├── crypto/         # Ed25519, Shamir SSS, AES-GCM, HKDF
│   ├── canton-client/  # Official Canton SDK wrapper
│   └── shared/         # Zod schemas, types, constants
├── contracts/          # Daml smart contracts
├── docker/             # Production deployment configs
├── docs/               # Architecture, API, security docs
└── .github/            # CI/CD workflows
```

---

**Website:** https://www.ccbot.io
**App:** https://app.ccbot.io
**Telegram Bot:** @ccbotwallet_bot
**Contact:** contact@ccbot.io
