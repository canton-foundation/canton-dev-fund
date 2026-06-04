# Jubilee — Private Asset Issuance & Exchange Protocol for Canton

| | |
|---|---|
| **Author** | Jubilee Team |
| **Status** | In Review |
| **Created** | 2026-04-29 |
| **Website** | https://jubilee.markets |
| **X (Twitter)** | https://x.com/JubileeMarkets |
| **Champion** | Jack Charlesworth - @jackcharlesworth |

---

## Abstract

Jubilee is a privacy-native digital asset issuance and exchange protocol built entirely on Canton's DAML execution model. It leverages Canton's sub-transaction privacy architecture to enable confidential creation, discovery, and trading of non-fungible digital assets — with party-based ownership, atomic multi-party settlement, and contract-enforced authorization at every layer.

The core marketplace is fully functional and validated on Canton's testnet, with minting, listing, buying, selling, offer, and counter-offer flows implemented. This proposal seeks funding to:

- Migrate the platform to Canton MainNet under production-grade hardening
- Conduct two independent security audits before live economic activity begins
- Deliver USDC base-asset support and multi-chain bridge expansion
- Release reusable open-source infrastructure as Canton ecosystem public goods, including an opinionated NFT-focused reference implementation of the CIP-56 standard

Target use cases span institutional certificates, tokenized documents, premium digital collectibles, license management, and any non-fungible asset class where ownership privacy and atomic settlement are essential.

---

## Delivered Work — Current Platform State (Testnet)

The Jubilee platform is fully functional on Canton's testnet. This proposal funds the migration of this validated platform to MainNet under production-grade standards, the addition of supplementary features, and the release of open-source infrastructure for the Canton ecosystem.

### Core marketplace & DAML architecture (testnet)

- Full DAML contract suite (6+ templates): collection management, token ownership, marketplace listings, offer/counter-offer, transfer requests
- End-to-end marketplace flows: mint, list, buy, sell, offer, counter-offer, transfer
- Party-based ownership model, enforced via DAML controller rules
- Fixed nominal platform fee (0.1 CC per transaction) with creator royalty and seller distribution

### Marketplace discovery & browsing

- Top Collections / Ledger of Rank — sortable list with floor, best offer, sales, volume, listed, owners, and trend graph; 1D/7D/30D/ALL time filters
- Featured Collections and Trending Collections carousels
- Explore Collections page — sortable columns (Floor, 1D/7D Change, Volume, Owners, Supply), favoriting
- Latest Activity feed (mint, list, sale, transfer, offer events)
- Activity page — fully filterable event history (All/Sale/List/Offer/Mint/Transfer), LIVE indicator
- Collection detail and NFT detail pages

### Mint experience

- Jubilee Mint page — Opening Soon (with countdown), Minting Now (progress bar, stage display), Allowlist/Public stage flows
- Minting Right Now live cards — minted/supply, price, stage info
- Editor's Note curation, Submit a Collection flow

### Collection creation & management

- 4-step creator wizard: Details → Media & Metadata → Mint Stages → Review
- Multi-file media upload (GIF/JPG/MP3/MP4/PNG/SVG)
- CSV metadata upload: tokenID, name, file_name (required); description, external_url (optional); attributes[trait_name] (traits)
- Mint settings: total supply, mint price, start/end time, royalty %, per-wallet mint limit
- Staged mint + whitelist management
- Editorial Office (platform admin panel) — launch permissions, users, collection management, platform revenue tracking

### Creator tools & analytics

- Creator Dashboard — total volume, royalties earned, NFTs minted, collection count
- Royalty earnings graph (7D/30D/90D/1Y/ALL)
- Avg per sale, all-time royalty, royalty rate metrics
- CSV export
- Per-collection management — mint progress, volume, sales, holders, floor, royalties

### User portfolio & operations

- Portfolio page — Owned / Listed / Offers / Activity tabs
- Multi-select mode — multiple NFT selection for bulk operations
- Bulk list modal — single price application or per-NFT override, subtotal and avg calculation
- Bulk send flow

### Self-custody wallet

- Wallet Overview — balance, wallet type, Canton Party ID
- Deposit address for CC reception
- Send Canton Coin — signing with private key
- Send NFTs — via transfer button
- Bridge (USDCx) shortcut

### Trading primitives & discovery enhancements

- **On-ledger CC offer escrow:** When a buyer submits an offer, their CC is locked on-ledger into an escrow contract before the seller ever sees the offer. This eliminates the unbacked-offer spam problem common in EVM-based marketplaces, where offers can be made without committed funds and then withdrawn arbitrarily. Every offer that reaches a seller is fully backed at the moment of receipt.
- **OpenRarity-based rarity scoring:** Industry-standard rarity computation engine implemented for all collections, providing deterministic and reproducible rarity rankings across traits.
- **Indexed prefix-search optimization:** Search infrastructure tuned for low-latency collection and NFT discovery via indexed prefix-matching, supporting marketplace-grade browse experience.

### Rewards system

- Rewards page — tier display, lifetime points, cycle points, daily cap, current tier, multiplier
- Tier progress bar, cycle pool reveal countdown, claim flow
- Earn actions: Mint an NFT, Bridge deposit/withdrawal, Hold an NFT, Daily login streak
- Tier Breakdown: Bronze / Silver / Gold / Platinum / Diamond — point ranges and multipliers per tier
- Leaderboard and history tabs

### Notifications

- Dropdown notification center and dedicated Notifications page
- Event types: NFT minted, new offer received, offer accepted, counter-offer received, counter-offer accepted, sale completed, transfer received
- Unread counter, mark all read, all/unread filtering

### USDCx bridge (Ethereum ↔ Canton)

- Bidirectional bridge via Circle's xReserve infrastructure (operational at testnet level) — USDC on Ethereum is wrapped to USDCx on Canton

### Production infrastructure & operations (live)

Beyond the application layer, Jubilee has shipped production-grade operational infrastructure indicating execution capability beyond DAML contract development:

- **Live production landing site** at [jubilee.markets](https://jubilee.markets) deployed via Cloudflare Pages with custom domain and active SSL
- **Email infrastructure:** Resend Pro with DKIM-verified sending domain, Cloudflare Queues, Batch API, and retry/backoff handling
- **Waitlist system:** Cloudflare D1 + KV with rate limiting, capable of handling 10,000+ signups per minute
- **Operational maturity:** monitoring, deployment automation, and zero-downtime release practices in place

This demonstrates that the team can not only ship Canton smart contracts but also operate the production-side infrastructure required to support a consumer-grade application.

---

## Specification

> **Note on terminology:** Within this document, references to "USDC" in the context of assets held or transacted on Canton refer specifically to **USDCx** — USDC wrapped onto Canton via Circle's xReserve infrastructure. References to "USDC" in the context of external EVM chains refer to native USDC.

### 1. Objective

Canton's ecosystem currently lacks a standardized, privacy-native surface for issuing, discovering, and trading non-fungible digital assets. There is no NFT-focused reference implementation atop CIP-56, no production-grade NFT marketplace running on Canton MainNet, and no unified asset onboarding interface for Canton-native NFT projects.

Jubilee solves this by delivering a production-grade marketplace platform, a launchpad for ecosystem projects, multi-chain bridge integrations, and reusable open-source infrastructure as public goods.

Success looks like:

- A fully operational private asset marketplace on Canton MainNet
- A launchpad enabling Canton ecosystem projects to issue and distribute digital asset collections
- An open-source NFT-focused reference implementation of CIP-56, published and documented for the Canton ecosystem
- Reusable marketplace primitives (listing, offer, counter-offer, atomic payment distribution) released as open-source public goods
- Multi-chain bridge integrations and swap integration for asset onboarding
- At least one non-Jubilee Canton ecosystem project successfully onboarded via the launchpad

### 2. Implementation Mechanics

Jubilee is built entirely in DAML and follows Canton's native execution model:

- Users interact through a web interface
- Backend (Node.js) constructs DAML commands and submits via Canton Ledger API
- DAML engine enforces all authorization, preconditions, and contract rules
- State transitions are atomic and follow a strict create-and-archive model
- Ownership is party-based, stored directly in contract state, and enforced via DAML controller rules
- Self-custody wallet runs entirely in the browser using an Ed25519 keypair encrypted at rest, with a prepare/sign/submit flow over the validator's external-party surface

Marketplace transactions combine asset transfer, payment settlement, and royalty distribution within a single atomic operation — eliminating the partial-fill and failed-royalty problems common in EVM-based marketplaces. Buyer offers are similarly placed into on-ledger escrow at submission time, ensuring every offer reaching a seller is fully backed by locked CC.

The platform fee is structured as a fixed nominal amount (0.1 CC per transaction) at launch, with provision for percentage-based fee tier introduction in future governance proposals as transaction volume data becomes available.

### 3. Architectural Alignment

Jubilee is fully aligned with Canton's architecture and is positioned as an opinionated, NFT-focused reference implementation of CIP-56 — not a fork, not a competing standard.

**Native execution alignment:**

- DAML-native execution — all contract logic runs natively in DAML, no EVM adaptation
- Party-based identity — ownership tied to Canton parties, not addresses
- Sub-transaction privacy — ownership visibility restricted to relevant parties only
- Atomic state transitions — every trade is all-or-nothing, no intermediate states
- Create-and-archive model — immutable contract lifecycle, no mutable state

**CIP-56 (Canton Token Standard) implementation:**

Jubilee is a CIP-56 implementation. CIP-56 defines the general DAML interfaces required for any Canton token to interoperate with wallets, bridges, exchanges, and custody applications without bespoke integration code: Holding, TransferInstruction, TransferFactory, Allocation, AllocationRequest, AllocationInstruction, AllocationFactory, and Metadata/InstrumentId types. CIP-56 is intentionally generic and says nothing about NFT-specific concerns — collections, mint stages, allowlists, supply caps, creator royalties, escrowed offers.

Jubilee's open-source library fills this gap with NFT-specific primitives that all implement CIP-56 interfaces:

| Jubilee template | CIP-56 interface |
|---|---|
| NFToken (amount = 1.0) | Holding |
| JubileeTransferFactory | TransferFactory |
| JubileeTrade | AllocationRequest |
| JubileeAllocation | Allocation |
| JubileeAllocationFactory | AllocationFactory |

Official Splice v0.5.18 CIP-56 DARs are vendored as data-dependencies, with interface instance declarations provided against them. This means a Jubilee NFT is a first-class Canton token: any CIP-56-compatible wallet can already see, custody, and participate in atomic settlement with Jubilee NFTs with zero changes on its side. The collection and marketplace layer is opinionated scaffolding sitting atop the standard, not a replacement for it.

The analogy is ERC-721: ERC-721 is the interface, OpenZeppelin's ERC721 is the reference implementation, and OpenSea is an application built on top. CIP-56 is the interface; Jubilee's open-source NFT library will serve as the canonical reference implementation for non-fungible assets atop CIP-56; jubilee.markets is the consumer application built atop it.

**Other CIP alignment:**

- **CIP-0082** — contributes ecosystem utility through asset infrastructure and reference implementations, both explicitly named eligible categories
- **CIP-0100** — structured with milestone-based delivery, measurable outputs, and acceptance criteria
- **CIP-0104** — every Jubilee operation produces confirmation-request envelopes where the platform party is signatory (i.e., confirmer), generating a clean traffic attribution profile suitable for the new traffic-based reward model

### 4. Backward Compatibility

The Jubilee asset protocol is additive to the Canton ecosystem. It does not require changes to Canton core, Splice, or DAML. It does not modify or fork CIP-56; it implements it. Existing CIP-56-compatible wallets, bridges, and custody applications can interact with Jubilee NFTs without code changes.

*No backward compatibility impact.*

---

## Milestones and Deliverables

### Milestone 1: MainNet Launch & Hardening

- **Estimated Delivery:** 2 weeks
- **Focus:** Migration of testnet-validated DAML contract architecture to MainNet under production-grade stabilization. This milestone's allocation is intended to also cover the capital required for two independent security audits scheduled at the start of MS2.

**Deliverables / Value Metrics:**

- Deployment of all DAML contract templates (11+ production templates) to Canton MainNet
- Live validation on MainNet of end-to-end flows: mint, list, buy, sell, offer, counter-offer, transfer
- Live validation of the fixed nominal platform fee structure (0.1 CC per transaction) on MainNet, with infrastructure ready for percentage-based fee tier introduction via future governance proposals
- Production monitoring, logging, and incident response infrastructure
- Load testing and edge-case hardening — stability validated under MainNet conditions
- Initiation of formal engagement with two independent security audit firms (one being Canton Network's official audit solution partner, the other an independent firm with DAML expertise) for execution at the start of MS2

### Milestone 2: Product Readiness, Security Hardening & First Launch

- **Estimated Delivery:** 3 weeks
- **Focus:** Layering the full product surface atop the MainNet contract infrastructure, executing two independent security audits before live economic activity begins, and delivering the first Canton-native collection launch as proof-of-life.

**Deliverables / Value Metrics:**

- **Independent security audits:** Completion of two parallel audits — scope: full DAML contract suite, atomic payment distribution logic, bridge integration
- **Audit remediation:** Critical and high-severity findings remediated and documented
- **Atomic payment distribution:** Live MainNet validation of platform fee + creator royalty + seller distribution executing in a single atomic operation
- Collection creator panel functional on MainNet: 4-step wizard, CSV metadata upload, multi-file media upload, mint settings, staged mint + whitelist management
- Self-custody wallet fully functional on MainNet: browser-encrypted private key, login/recovery, Canton Party ID management, Send CC, Send NFTs, deposit address
- Live bidirectional Ethereum ↔ Canton MainNet USDCx bridge via Circle's xReserve infrastructure
- Live MainNet validation of bulk list and bulk send features
- Creator Dashboard operational on MainNet: volume, royalties earned, NFTs minted, per-collection management, royalty earnings graph, CSV export
- First reference Jubilee-native collection launch: full flow demonstrably completed
- Post-launch monitoring period: bug fixes and stability iterations based on real user feedback

### Milestone 3: Ecosystem Onboarding, Web3 Wallet Integration for Swap & In-Site Temple Swap

- **Estimated Delivery:** 4 weeks
- **Focus:** Enabling Canton ecosystem projects to launch collections through the Jubilee launchpad and allowing users to perform swaps without leaving the site via integrated Temple swap functionality.

**Deliverables / Value Metrics:**

- **Launchpad infrastructure:** Operational ecosystem onboarding infrastructure with documented submission process and technical onboarding guide, accepting external collection submissions
- **Web3 wallet integration (swap-only):** Connection support specifically for the swap feature — Canton-supported web3 wallets can connect to Jubilee's swap surface, while the rest of the platform continues to use Jubilee's self-custody wallet
- **In-site Temple swap:** Temple swap integration embedded within the Jubilee interface

### Milestone 4: USDC Base Asset, Multi-Chain Bridge & Open Source Release

- **Estimated Delivery:** 4 weeks
- **Focus:** USDC base-asset support for NFT trading flows alongside CC, multi-chain bridge expansion, and the release of open-source infrastructure that produces durable value for the Canton ecosystem.

**Deliverables / Value Metrics:**

- **USDC as base asset:** NFT buy/sell flows support transactions denominated in USDCx on Canton
- **Multi-chain bridge expansion:** Bridge infrastructure extended to additional chains through complementary bridge integrations covering cross-chain routing and additional EVM-side asset onboarding, with xReserve continuing to support the Ethereum <-> Canton leg.
- **Open-source public goods release:**
  - NFT-focused CIP-56 reference implementation (DAML library) — collection grouping, mint stage mechanics, allowlist management, supply caps, royalty enforcement embedded in AllocationRequest settlement, and an on-ledger escrow pattern for fully backed offers
  - Marketplace primitives library
  - Atomic payment distribution templates
  - Self-custody wallet reference implementation (browser-encrypted Ed25519 keypair + prepare/sign/submit flow)
  - USDC bridge reference integration
  - Developer documentation and integration guides
  - Public GitHub repository for the reference library, opened at this milestone
  - All open-source components released under **Apache License 2.0**, the de-facto standard adopted across Canton Foundation OSS repositories

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone
- Demonstrated functionality or operational readiness
- Documentation and knowledge transfer provided
- Alignment with stated value metrics

Project-specific acceptance conditions per milestone:

**MS1 — MainNet Launch & Hardening:**
All DAML contract templates deployed and operational on Canton MainNet. A Committee member or representative can interact with the deployed contracts. All core marketplace flows are demonstrable live on MainNet, including mint, list, buy, sell, offer, counter-offer, and transfer. Production monitoring, logging, and incident response infrastructure are active. Formal engagement with two independent audit firms initiated.

**MS2 — Product Readiness, Security Hardening & First Launch:**
Two independent security audit reports completed; critical and high-severity findings remediated and documented. Atomic payment distribution (platform fee + royalty + seller) live on MainNet in a single atomic operation with real CC. Creator panel, self-custody wallet, USDCx bridge, bulk operations, and creator dashboard accessible and operational on MainNet.

First Jubilee reference collection launched on MainNet with a supply of 1,000 NFTs and fully minted through Jubilee. Primary mint activity is tracked separately from secondary marketplace activity.

After the reference collection launch, at least 3000 non-mint user-initiated on-chain marketplace transactions are completed on MainNet across listing, purchasing, offers, offer acceptance, counter-offers, counter-offer acceptance, transfers, bulk listing, and bulk transfer flows. This includes at least 1000 completed purchase/sale transactions on MainNet.

Marketplace activity, including total minted supply, listed supply, transaction count, completed sales, unique holders, royalty distributions, seller proceeds, platform fee distributions, and sales volume, is reported to the Committee.

**MS3 — Ecosystem Onboarding + Swap Wallet + Temple Swap:**
Launchpad infrastructure accepting external collection submissions, with a documented submission process and technical onboarding guide. At least 3 external collections or ecosystem projects are onboarded into the launchpad pipeline, with at least 2 external collections live on MainNet through Jubilee.

Across the Jubilee reference collection and external collection activity, at least 5000 cumulative non-mint user-initiated on-chain marketplace transactions are completed on MainNet across listing, purchasing, offers, offer acceptance, counter-offers, counter-offer acceptance, transfers, bulk listing, and bulk transfer flows. This includes at least 2000 completed purchase/sale transactions across all live collections.

Marketplace metrics, including transaction count, completed sales, sales volume, listed supply, unique holders, collection activity, royalty distributions, seller proceeds, and platform fee distributions, are reported to the Committee.

A Canton-supported web3 wallet that has completed any required Temple-side onboarding can connect to Jubilee on the swap page and execute a swap without leaving the site.

**MS4 — USDC Base Asset + Multi-Chain Bridge + Open Source Release:**
An NFT can be listed and purchased denominated in USDCx on Canton, with atomic payment distribution functioning on the USDCx-denominated transaction. Multi-chain bridge integration is demonstrably operational for at least one external route.

USDCx-denominated marketplace activity is demonstrated through at least 200 completed non-mint user-initiated on-chain marketplace transactions, including at least 100 completed purchase/sale transactions denominated in USDCx.

All public goods released in a public repository under Apache License 2.0, including the NFT-focused CIP-56 reference implementation, marketplace primitives, atomic payment distribution templates, escrowed offer pattern, self-custody wallet reference implementation, and developer documentation.

CIP-56 interface compliance demonstrably verified through Jubilee-to-CIP-56 type mappings, example flows, and integration guidance for wallets, marketplaces, and launchpad builders.

---

## Funding

Total Funding Request: 600,000 CC

This amount is intended as a working ask to level-set the review conversation. Jubilee remains open to discussion and calibration with Jack Charlesworth, the Tech & Ops Committee, and Canton Foundation reviewers based on ecosystem norms, comparable proposals, milestone scope, and Committee guidance.

Payment Breakdown by Milestone

Milestone 1: 200,000 CC
Milestone 2: 160,000 CC
Milestone 3: 110,000 CC
Milestone 4: 130,000 CC

### Cost Drivers per Milestone

To support that discussion, the principal cost drivers across the four milestones are:

- **MS1:** MainNet deployment, production-grade stabilization, and the capital required to commission two independent security audits at the start of MS2
- **MS2:** Audit execution and remediation, atomic payment distribution validation on MainNet, and first reference collection launch
- **MS3:** Ecosystem onboarding for non-Jubilee projects, embedded wallet integration for the Swap surface, and Temple Swap integration
- **MS4:** USDCx base-asset support, multi-chain bridge integrations, and packaging of the open-source CIP-56 NFT reference library

### Volatility Stipulation

Project duration is approximately 13 weeks (~3 months), well under the six-month threshold defined in CIP-0100. Should the project timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility.

---

## Co-Marketing

Upon each milestone delivery, Jubilee will collaborate with the Canton Foundation on:

- **Milestone 1:** Coordinated MainNet launch announcement
- **Milestone 2:** Technical blog covering DAML contract architecture, security audit outcomes, and the first Canton-native NFT collection launch
- **Milestone 3:** Ecosystem onboarding case study featuring the first non-Jubilee project launched via the platform, plus joint announcement of the Temple swap integration
- **Milestone 4:** Developer-focused content (technical documentation, integration tutorials, blog series) promoting the open-source CIP-56 NFT reference implementation and marketplace primitives as Canton ecosystem public goods

---

## Motivation

### The Gap

Canton has rapidly matured into institutional-grade infrastructure, with participants including DTCC, BNY, Goldman Sachs, BNP Paribas, and others operating on the network. However, the ecosystem currently lacks a standardized, privacy-native surface for issuing, discovering, and trading non-fungible digital assets at consumer scale.

Today there is:

- No NFT-focused reference implementation atop CIP-56
- No production-grade NFT marketplace running on Canton MainNet
- No unified asset onboarding interface for Canton-native NFT projects
- No open-source primitives that future builders can reuse for non-fungible asset issuance and exchange

This creates a structural gap: Canton ecosystem projects cannot easily launch asset collections, institutions lack a native asset interaction layer, and builders lack reusable primitives for asset issuance and exchange.

### Why Privacy Matters for Non-Fungible Assets

On public blockchains, every NFT ownership record is globally visible. This is fundamentally incompatible with use cases where ownership confidentiality is required — institutional certificates, sensitive documents, premium collections, regulated financial instruments, or any scenario where revealing "who owns what" creates competitive, legal, or privacy risk.

Canton's sub-transaction privacy model solves this natively: only the relevant parties can see a contract's existence. Jubilee is designed to fully exploit this advantage — providing the first non-fungible asset layer where ownership privacy is built in from the protocol level, not bolted on.

### Why the Development Fund Should Care

CIP-0082 explicitly targets "core R&D, dev tools, security, audits, reference implementations, DeFi app(s) liquidity seeding, and critical infra" as eligible work. Jubilee delivers across multiple eligible categories:

- **Reference implementation** — an NFT-focused reference implementation of CIP-56, the canonical Canton Token Standard
- **Developer tooling** — open-source library for collection management, mint mechanics, royalty enforcement, on-ledger offer escrow (eliminating unbacked-offer spam), and atomic payment distribution that any Canton builder can reuse
- **Critical infrastructure** — without a non-fungible asset layer, Canton's ecosystem of institutional and consumer participants has no standardized way to issue, trade, or manage unique digital assets
- **Security and audits** — the proposal includes two independent security audits as a milestone deliverable, contributing to the ecosystem's overall security posture

Beyond the formal grant scope, Jubilee's existence as an opinionated, production-grade consumer application atop CIP-56 produces additional ecosystem value:

- **CIP-56 validation at consumer scale** — most CIP-56 traffic today is institutional (BNY, DTCC tokenized securities settlement). Jubilee proves the same standard holds up under high-frequency consumer flows: bulk listings, counter-offers, atomic settlement under marketplace load, browser-based Ed25519 self-custody. This is empirical evidence the Tokenomics Committee, SVs, and the Canton Foundation can use when scaling future protocol decisions.
- **CIP-0104 traffic-economics data point** — Jubilee operations produce confirmation-request envelopes with clean attribution profiles, providing Canton governance with real consumer-app traffic data on the new traffic-based reward model. Today this data is largely modeled, not observed.
- **Self-custody UX precedent** — most Canton applications assume institutional custodian. Jubilee's browser-encrypted Ed25519 + prepare/sign/submit pattern is a complete model running on the validator's external-party surface. Other Canton consumer apps can adopt this pattern directly.

---

## Rationale

### Why Canton-Native, Not EVM-Adapted?

Jubilee is designed specifically for Canton rather than adapting EVM-based asset models. Key architectural decisions:

- **Contract-level ownership** instead of global mappings — each asset is an independent contract instance
- **Party-based identity** instead of address-based — aligned with Canton's identity model
- **Atomic multi-party settlement** — asset transfer + payment + royalty in a single operation
- **Create-and-archive state transitions** — immutable contract lifecycle
- **Contract-enforced authorization** — DAML controller rules, not application-level checks

Alternative approaches (EVM-style assets, mutable state, off-chain ownership tracking) were evaluated and rejected due to fundamental misalignment with Canton's privacy model and weaker security guarantees.

### Why Atomic Payment Distribution Matters

In EVM-based marketplaces, royalty enforcement has been a persistent challenge — platforms like OpenSea famously struggled with enforcing creator royalties, as sellers could bypass them through direct transfers. Jubilee's DAML contract architecture solves this at the protocol level: every sale atomically distributes platform fee, creator royalty, and seller payment within a single indivisible operation. There is no way to bypass royalties without bypassing the entire settlement mechanism.

This atomic payment distribution pattern is one of the key public goods deliverables. Any Canton builder can reuse it for their own marketplace or settlement workflows.

### On-Ledger Offer Escrow as a Public-Goods Security Primitive

A second protocol-level primitive that Jubilee contributes to the Canton ecosystem is the on-ledger offer escrow pattern. In EVM-based marketplaces, buyer offers are typically off-chain signed messages with no committed funds — leading to widespread unbacked-offer spam, where attackers flood collections with offers they cannot or will not honor, polluting collection analytics and frustrating sellers. Jubilee solves this at the contract level: when a buyer submits an offer, the offered CC is moved into an on-ledger escrow contract before the seller is even notified. Every offer that reaches a seller is therefore fully collateralized at the moment of receipt; sellers can accept any offer without counterparty risk.

This escrow pattern will be released as part of the open-source library in Milestone 4, providing a reusable security primitive that any Canton marketplace, auction, or P2P-trade application can adopt directly.

### Why Extend CIP-56 Rather Than Fork

Jubilee's open-source NFT library extends CIP-56 rather than forking it or creating a competing standard. CIP-56 is intentionally generic; it defines what a "holding" or a "transfer factory" looks like, but says nothing NFT-specific. Jubilee fills this gap with NFT-specific primitives that all implement CIP-56 interfaces.

The strategic and ecosystem importance of this approach: extending an open standard means we do not fragment the ecosystem. Anyone integrating Jubilee NFTs only needs to know CIP-56 — they do not need to know Jubilee-specific types. Forking the standard would have required every wallet and bridge to develop a custom adapter for us. By implementing the standard, Jubilee NFTs become first-class Canton tokens that work with the existing CIP-56-compatible infrastructure.

### Why Sequence Audits Between MS1 and MS2

The audits are scheduled at the start of MS2 rather than before MS1 deployment because the testnet platform has already been extensively validated, and the MS1 deployment migrates exactly that validated codebase to MainNet. The audits then occur before live economic activity begins in MS2, when atomic payment distribution and real CC flows go live. This sequencing maximizes user safety: audit findings are remediated before users transact at scale, while not introducing artificial delays for already-validated testnet behavior.

---

## Team

The Jubilee team consists of a focused core group covering DAML architecture, wallet and product engineering, validator infrastructure, full-stack systems, ecosystem development, and go-to-market execution.

**Kerem Kubilay** — Technical Lead / DAML Architect — kerem@jubilee.markets

Kerem leads Jubilee's Canton-native technical architecture and DAML contract development. He is responsible for the DAML contract suite behind Jubilee's collection, ownership, listing, offer, counter-offer, transfer, and atomic settlement flows, as well as the work required to map Jubilee's NFT primitives onto CIP-56 interfaces.

Kerem has been an active crypto application developer across multiple ecosystems before Jubilee, including Solana, Base, Arc, and MegaETH. His work has covered wallet infrastructure, transaction flows, user-facing blockchain applications, and on-chain product logic across both EVM and non-EVM environments. He has hands-on experience with key management, transaction signing, user onboarding, asset custody, and reliable execution under real user conditions.

Before Jubilee, Kerem developed an Arc-native wallet implementation, available at https://chromewebstore.google.com/detail/casarc-wallet/ddmjmbkgdcknajaomkmpmonaeafgkdhn, and also created a mining-style game being built on MegaETH. This background across wallet UX, transaction execution, and consumer-facing crypto products directly informs Jubilee's self-custody wallet, prepare/sign/submit flow, and marketplace execution model.

Within Jubilee, Kerem's focus is DAML correctness, contract-level authorization, party-based ownership, atomic payment distribution, escrowed offers, and the technical design of reusable NFT primitives for Canton builders.

**Gokay Sourled** — Infrastructure Lead / Full-Stack Engineer — gokay@jubilee.markets

Gokay leads Jubilee's full-stack implementation, backend services, deployment infrastructure, and integration layer. He is responsible for the production application surface that connects the web interface, backend services, Canton Ledger API interaction, creator tools, portfolio flows, notification systems, waitlist infrastructure, and operational monitoring.

Gokay is also responsible for Huginn's and Jubilee's validator infrastructure and validator tooling. Huginn has operated as a Cosmos Hub mainnet validator for years, runs validators across multiple Cosmos-based Layer 1 networks, and was selected as a Monad genesis mainnet validator. Gokay runs Huginn's validator systems and has built internal tooling used for validator operations, monitoring, alerting, and ecosystem infrastructure.

He has also built and maintained several Huginn products and infrastructure tools, including validator monitoring and ecosystem tooling. This includes Monadoring Bot, a real-time monitoring solution for Monad validators with instant timeout and skipped block alerts, chain halt detection, Telegram and PagerDuty integration, and Discord bridge support. Huginn's broader product surface also includes Cosmos.Wiki, Huginn Guard, Monval, and Monadoring.

This infrastructure background is directly relevant to Jubilee's production operations, monitoring, deployment reliability, and the technical discipline required to run user-facing financial applications on Canton.

Within Jubilee, Gokay's focus is product reliability, user-facing execution, creator dashboard infrastructure, collection onboarding tooling, bridge/swap integration surfaces, deployment infrastructure, and production operations.

**Utku Huginn** — Ecosystem & Product Lead — utku@jubilee.markets

Utku leads Jubilee's ecosystem strategy, product direction, creator onboarding, community distribution, partnerships, documentation, and co-marketing coordination.

He is part of Huginn, an infrastructure and ecosystem team active across the Cosmos and modular blockchain ecosystem. Huginn has contributed to ecosystem growth through community management, validator ecosystem support, localized education, user onboarding, and long-term participation in networks such as Cosmos Hub, Initia, Berachain, Babylon, Monad, and other Cosmos-aligned ecosystems.

Utku has extensive experience building and coordinating crypto-native communities, especially across Turkish and modular blockchain ecosystems. He has worked on ecosystem onboarding, local community growth, campaign coordination, creator relationships, and go-to-market distribution for multiple blockchain communities and projects.

Utku also has direct NFT community experience through Celestine Sloth Society, one of the earliest Celestia-aligned NFT communities, where he has contributed to holder coordination, community campaigns, creator relationships, and cross-ecosystem visibility efforts.

Within Jubilee, Utku's focus is converting Jubilee from a working Canton product into a live ecosystem venue: onboarding creators, coordinating launch partners, building community demand, managing external communications, and ensuring the platform is positioned as useful infrastructure for Canton-native asset issuance.

The team has already developed a fully functional marketplace on Canton's testnet, including minting, trading, offers, counter-offers, wallet flows, creator tooling, and marketplace discovery, demonstrating the ability to execute and deliver production-grade systems aligned with Canton's architecture.

---

## Post-Grant Maintenance

Following completion of all milestones, Jubilee will continue maintaining the open-source components without requiring additional grant funding.

The marketplace introduces a sustainable revenue model through platform transaction fees. At launch, fees are structured as a fixed nominal amount (0.1 CC per transaction) applied at the contract level during atomic settlement. This minimal flat fee maximizes creator and seller economics during the early ecosystem phase. As transaction volume data becomes available, percentage-based fee tiers may be introduced through future governance proposals, ensuring continued development, maintenance, and long-term support of the infrastructure.

---

## Champion

External contributor proposals to the Canton Development Fund require sponsorship from a Tech & Ops Committee member, per CIP-0100. Jubilee has received champion confirmation from Jack Charlesworth and the proposal is now in review.

---

## Links

- **Website:** https://jubilee.markets
- **X (Twitter):** https://x.com/JubileeMarkets
- **Public GitHub repository (open-source library):** to be opened at Milestone 4
