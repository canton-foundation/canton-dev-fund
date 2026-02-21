## Proposal Canton <-> Solana bridge powered by Asterizm

Author: Asterizm Team  
Status: Draft / Submitted / Under Review  
Created: 2026-Feb-21

---

## Abstract

Asterizm proposes a production-grade bridge development for Canton ecosystem to enable secure, low-latency asset transfers across Canton and Solana chains for the native coins of each chain (wrap mechanism is applied).

Key outcomes:

- Asterizm deployed cross-chain contracts with bridge business logic on Canton and Solana.
- wCC live on Solana with lock/mint, burn/release flow tied to CC on Canton
- wSOL live on Canton is tied to the original SOL on Solana,
- Web application of the token bridge solution with transfer flow and transaction explorer,
- Documentation and User Guide for Canton <-> Solana bridge app.

Please review our proposal, including interface examples, available at the following link:  
https://drive.google.com/file/d/1QZqrpmoHmXYqtXhmiNpjtkEuOvgwuKKW/view?usp=sharing

---

## Specification

### 1. Objective

The specific problem we are addressing is the lack of secure, low-latency cross-chain interoperability between Canton and Solana networks for native coins and other assets. Currently, transferring tokens or assets between these blockchains is either impossible or relies on centralized intermediaries, which introduces risks, delays, and trust assumptions.

Our intended outcome is to deploy a production-ready cross-chain bridge that enables:

- Secure transfer of Canton Coin and other Canton-issued assets (upon request) to Solana via wrapped tokens (wCC), and vice versa.
- Secure transfer of SOL to Canton as wrapped SOL (wSOL), and back to Solana.
- A user-friendly web interface for executing transfers with Canton and Solana wallets.
- Transparent transaction tracking through an integrated explorer.

This solution will provide a reliable, fully on-chain secured (via cryptography of hashing), and decentralized method for asset interoperability between Canton and Solana, unlocking liquidity, enabling cross-chain DeFi, and expanding ecosystem opportunities for both networks.

---

### 2. Implementation Mechanics

Explanation of how the solution will be implemented. Technologies, components, workflows, and operational approach are included.

#### Canton-side bridge implementation (Canton / Daml components + services):

- Development of bridge smart contracts for Canton (Daml).

- Development of Canton bridge components to support:

   - Canton -> Solana: lock Canton Coin on Canton, mint wrapped representation on Solana (wCC),
   - Solana -> Canton: burn wrapped representation on Solana, release underlying asset(s) on Canton.

Canton asset support:

- Canton Coin (included, comes as standard),
- Additional Canton-issued tokens/assets can be added upon request (not included).

#### Solana-side bridge implementation (Rust):

- Development of bridge smart contracts for Solana (Rust).

- Development of bridge components for Solana:

   - Solana -> Canton: lock Solana Coin (SOL) on Solana, mint wrapped representation on Canton (wSOL),
   - Canton -> Solana: burn wrapped representation on Canton (wSOL), release underlying asset(s) on Solana (SOL).

Supported assets:

- Canton-native asset(s): Canton Coin / (Canton-issued token(s) as optional add-on).
- Solana native: SOL (represented in Canton as wrapped SOL).

---

#### Web application (bridge UI) development: design, layout, web3 wallets integrations:

- Transfer flow page,
- Explorer page,
- Service pages.

Wallet integrations:

- Canton wallet integration
- Solana wallet integration

Off-chain modules for observability, monitoring, alerting, and op-runbooks.

Documentation for bridge users with an interface guide.

Summary.

Upon completion of the work, a Canton-branded bridge will be launched, delivering a production-ready bridge for Canton Coin and other assets (upon request) and wrapped SOL between Canton and Solana.

The solution will include a user interface for transferring tokens using Canton and Solana wallets, along with a transaction explorer for monitoring cross-chain transactions.

---

### 3. Architectural Alignment

The Canton <-> Solana bridge powered by Asterizm is aligned with the architecture and design principles of the Canton ecosystem. Canton is built around secure and deterministic transaction processing using Daml smart contracts and a privacy-aware execution model. Our bridge implementation leverages Canton-native Daml components for smart contracts and asset management, ensuring compatibility with Canton’s transaction model and validation logic.

From an ecosystem perspective, interoperability and asset tokenization are critical enablers of ecosystem growth. By introducing wrapped representations of Canton Coin (wCC) on Solana and wrapped SOL (wSOL) on Canton, the bridge expands liquidity access, enables cross-chain DeFi interactions, and unlocks new use cases for both Canton-native and Solana-native assets.

The inclusion of a web application, wallet integrations, and a transaction explorer enhances usability and transparency for developers and end users.

The solution is structured around three key principles:

- Secure Cross-Chain Asset Representation – Wrapped tokens (wCC and wSOL) are backed 1:1 by locked assets on their origin chains, ensuring economic consistency and verifiability of cross-chain transfers.
- Operational Transparency and Monitoring – The bridge includes monitoring, alerting, and logging mechanisms to provide visibility into cross-chain operations and ensure reliability.
- Seamless Wallet Integration – Integration with Canton and Solana wallets enables secure transaction signing and a smooth user experience for cross-chain transfers.

Overall, the Canton <-> Solana bridge powered by Asterizm strengthens the ecosystem by delivering production-grade, on-chain interoperability, expanding asset utility, and enabling secure cross-chain financial and tokenization use cases while remaining compatible with Canton’s architectural model.

---

### 4. Backward Compatibility

The proposed bridge will provide third-party developers with the ability to leverage Solana-originated assets within applications and protocols deployed on the Canton Network.

Furthermore, external protocols will be able to integrate the bridge as infrastructure within their own products, enhancing user experience and enabling new business use cases across both the Canton and Solana ecosystems, including the utilization of assets native to Canton.

---

## Milestones and Deliverables

### Milestone 1: Design & Smart contracts deployment

Estimated Delivery: (14-21 days)

Focus:

- Web app design and layout: exchange flow, explorer, wallets, and service pages,
- Development and deployment of bridge smart contracts (mint/burn, lock/redeem through Asterizm protocol) on Canton and Solana.

Deliverables / Value Metrics:

- Technical Documentation (architecture overview, user guides for asset transfers).

Canton <-> Solana Bridge:

- Lock/mint and burn/release flows with UI (web and mobile versions) for selected native assets on each chain - Canton Coin, Solana Coin,

Wrapped token representations:

- wCC on Solana backed 1:1 by locked Canton Coin on Canton,
- wSOL on Canton backed 1:1 by locked SOL on Solana.

- At least 20 transfers processed to/from Canton and Solana for CC and SOL tokens in testnet and mainnet.

---

### Milestone 2: Testing, debugging + Web App development

Estimated Delivery: (10-14 days)

Focus:

- Make test transfers across selected chains for native coins,
- Debug issues,
- Web application development: exchange flow, explorer, service pages, mobile version, web3 wallets integration,
- Architecture documentation, interface guides.

Deliverables / Value Metrics:

- Bridge scanner website live: user transaction monitoring, global statistics.
- Launched web application with at least 2 web3 wallets supporting Canton and Solana networks.
- Integration of Canton and Solana web3 wallets
- Public Repos: reference Canton components (Daml/packages + services) and Solana Rust program(s), deployment manifests.

---

## Funding

Total Funding Request: $145 000 | 970 000 CC

### Payment Breakdown by Milestone

Milestone 1 (Design & Smart contracts deployment): 470 000 CC upon committee acceptance (before start):

- Web app branded design and layout — $15 000
- Bridge development & deployment (Canton components + Solana program) — $55 000

Tranche 1 Total: $70 000 | 470 000 CC tokens

Milestone 2 (Testing, debugging + Web App development): 500 000 CC upon committee acceptance

- Testing and debug phase for bridge routes — $25 000
- Web app development according to design (exchange flow, explorer, web3 wallets integration) — $50,000

Tranche 2 Total: $75 000 | 500 000 CC tokens

Volatility Stipulation

The project duration is going to be less than 3 months.

---

## Co-Marketing

We confirm that upon release, we are happy to collaborate with the Foundation on co-marketing activities. Specifically, we can contribute by:

- Coordinating announcements with the Foundation
- Preparing a technical blog or case study
- Promoting the project to developers and within the ecosystem

We can also discuss any additional commitments you may require.

---

## Motivation

The Canton <-> Solana bridge developed by Asterizm provides significant value to the Canton ecosystem by enabling secure, low-latency, and fully on-chain interoperability with Solana. This capability addresses a key limitation in the ecosystem — the lack of seamless cross-chain asset transfers — and opens new opportunities for liquidity, decentralized finance (DeFi), and tokenized asset interactions.

The strategic importance of this bridge is multi-fold:

- Ecosystem Growth – By enabling wrapped tokens (wCC on Solana and wSOL on Canton), the bridge allows Canton-native assets to participate in Solana-based applications and vice versa, increasing the reach and utility of Canton assets.
- Adoption Acceleration – The bridge facilitates secure cross-chain transactions for DeFi protocols, RWA projects, and enterprise applications, driving adoption of Canton for both developers and end-users.
- Strategic Interoperability – Supporting a production-grade bridge aligns with Canton’s ecosystem priority of enabling enterprise-ready, cross-chain solutions, helping Canton position itself as a hub for multi-chain financial and tokenization applications.
- Operational Reliability – With a fully tested, audited, and monitored bridge, the Canton ecosystem benefits from safe, transparent, and observable asset flows, reducing operational risk and enhancing trust among participants.

Overall, the Asterizm bridge strengthens Canton’s ecosystem by increasing asset utility, supporting new use cases, and positioning Canton as an inclusive platform in the enterprise and DeFi space.

---

## Rationale

This approach—developing a production-grade Canton <-> Solana bridge with on-chain smart contracts and wrapped tokens—directly delivers secure, low-latency, and fully auditable cross-chain transfers.

Alternative solutions, such as custodial bridges, introduce trust risks, delays, and reduced transparency.

By leveraging Canton-native Daml contracts and Solana Rust programs, enterprise-grade off-chain transport layer (no intermediary consensus), combined with a user-friendly web interface and wallet integrations, this solution ensures full compatibility with both ecosystems, operational reliability, and long-term scalability, making it the most secure and sustainable approach for the Canton ecosystem.

Asterizm aligns closely with the philosophy and technical architecture of the Canton Network. Since 2023, we have operated as a cross-chain infrastructure provider focused on enterprise-grade use cases, delivering capabilities such as privacy-preserving messaging between private–public and private–private networks, near-instant message finality, and high throughput performance without exponential growth in infrastructure costs.

---

## Why Asterizm?

Asterizm is a proven cross-chain messaging and infrastructure provider, already integrated with Canton Network. We enable secure, auditable, and scalable cross-chain interoperability, connecting Canton to over 30 networks — Ethereum, Avalanche, Base, Arbitrum, Optimism, Solana, Stellar, and more.

Our team has deep expertise with Canton Daml contracts and has successfully integrated them into the Asterizm infrastructure. We have extensive experience developing, testing, and deploying bridges, including secure asset transfers, multi-chain workflows, and collateral bridges.

The first Collateral Bridge on Canton, being built using Asterizm Protocol, will enable secure cross-chain transfers of digital assets and tokenized RWAs between Canton and over 30 networks. Strong demand for cross-chain solutions and our proven experience make Asterizm the natural and reliable choice to deliver the Canton <-> Solana production-grade bridge.

---

## Team & Experience

Asterizm (https://asterizm.io/) is a cross-chain messaging and infrastructure provider, enabling seamless interoperability across EVM, non-EVM, private, and public blockchains as well as asset issuance under the CNT (omnichain) standard. Our technology is built for financial institutions, enterprises, DeFi applications, tokenization platforms, and asset managers, solving key challenges in secure data transmission, an omnichain asset issuance, cross-network transactions, RWA tokenization, and decentralized finance adoption.

Asterizm has successfully integrated with 27+ EVM chains, as well as Solana, TON, and MoveVM chains.

Plume and Cardano will be supported by the end of Q2 2026. The protocol demonstrates strong adoption, audited security, and a rapidly expanding ecosystem.

Asterizm maintains a strong focus on TradFi, RWA, and enterprise sectors, delivering solutions across finance, payments, and asset tokenization.

- Techstars by Polygon Alumni – Graduates of the TECHSTARS (top 3 Silicon Valley accelerator), part of the Techstars x Polygon Spring '23 cohort.
- Backed by smart Web3 VCs - such as Optic Capital | Blockchain Founders Fund | V3NTURES | Funders VC | WebWise Capital | Cicada Capital | Oversubscribed Capital.
- Multiple Grants Secured – Including a major grant from Cardano (500,000 ADA), Stellar, and another from Redbelly (NDA), an RWA-focused chain.
- Audited & Secure – Successfully audited by HashEx in 2023 and more recently by Decurity in 2025.
- Recognized Talent – The team are prizewinners of ETHGlobal, one of the most respected global Web3 hackathons.
- Global Recognition – Semi-finalist at WebSummit Qatar 2024, and top-24 Infra/DeFi project at Paris Blockchain Week.
- Speed & Cost Leadership – Message delivery in Asterizm is faster and cheaper than most competitors. Designed from day one to support high-throughput financial use cases in sectors like banking, asset management, tokenized RWAs, and institutional DeFi.

A well-coordinated team working together since 2017.

