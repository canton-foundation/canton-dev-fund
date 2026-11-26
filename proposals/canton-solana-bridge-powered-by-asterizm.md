# Canton <-> Solana <-> Ethereum <-> EVM Bridge Powered by Asterizm

**Author:** Asterizm Team  
**Status:** Submitted / Updated for Champion Review  
**Created:** 2026-02-21  
**Updated:** 2026-05-20

---

## Abstract

Asterizm proposes a production-grade bridge for the Canton ecosystem to enable secure, auditable, and operationally observable asset transfers across **Canton, Solana, Ethereum, and one additional EVM chain** supported by Asterizm, initially for the native coins of each chain using a wrapped-asset model.

The goal of this proposal is not to introduce generic interoperability for its own sake. The goal is to deliver a focused reference implementation that gives the Canton ecosystem a practical route to external wallet environments, liquidity surfaces, and developer ecosystems, while keeping trust assumptions, scope, and operating procedures explicit.

### Key outcomes

- Asterizm-deployed bridge components and business logic on Canton, Solana, Ethereum, and one selected EVM chain
- `wCC` live on Solana with a lock/mint and burn/release flow tied to Canton Coin on Canton
- `wCC` live on Ethereum with a lock/mint and burn/release flow tied to Canton Coin on Canton
- `wCC` live on one selected EVM chain with a lock/mint and burn/release flow tied to Canton Coin on Canton
- `wSOL` live on Canton and tied to original `SOL` on Solana
- `wETH` live on Canton and tied to original `ETH` on Ethereum
- `wEVM` live on Canton and tied to the native asset of the selected EVM chain
- A web application for transfer flows and transaction inspection
- Documentation, user guidance, operational runbooks, and public reference components

Please review interface example available here:  
[https://docsend.com/v/v5rxq/canton_solana](https://docsend.com/v/v5rxq/canton_solana)

---

# Specification

## 1. Objective

The specific problem we are addressing is the lack of production-ready interoperability **between Canton and major external ecosystems such as Solana and Ethereum/EVM chains** for native coins and other assets. At present, moving value between these ecosystems is either impossible, highly fragmented, or dependent on custodial or weakly specified trust models.

Our intended outcome is to deploy a production-ready bridge that enables:

- Secure transfer of Canton Coin to Solana, Ethereum, and one selected EVM chain through wrapped representations
- Secure transfer of `SOL`, `ETH`, and one selected EVM-native asset into Canton through wrapped representations
- A user-facing interface for transfer execution with Canton, Solana, Ethereum, and EVM wallets
- Transparent transaction tracking through an integrated explorer and operational monitoring

This proposal is intentionally scoped as a **focused first production route** rather than an unlimited bridge program. The objective is to prove a secure and operationally reliable interoperability pattern for Canton with explicit trust assumptions, measurable milestones, and a practical rollout model.

---

## 2. Implementation Mechanics

### Canton-side bridge implementation (Canton / Daml components + services)

- Development of bridge smart contracts and services for Canton using Daml and supporting components
- Canton bridge flows for:
    - **Canton -> Solana**: lock Canton Coin on Canton and mint wrapped representation on Solana (`wCC`)
    - **Solana -> Canton**: burn `wCC` on Solana and release underlying `CC` on Canton
    - **Canton -> Ethereum**: lock Canton Coin on Canton and mint wrapped representation on Ethereum (`wCC`)
    - **Ethereum -> Canton**: burn `wCC` on Ethereum and release underlying `CC` on Canton
    - **Canton -> selected EVM chain**: lock Canton Coin on Canton and mint wrapped representation on the selected EVM chain (`wCC`)
    - **selected EVM chain -> Canton**: burn `wCC` on the selected EVM chain and release underlying `CC` on Canton
- Wrapped asset logic on Canton for inbound assets:
    - **Solana -> Canton**: lock `SOL` on Solana and mint `wSOL` on Canton
    - **Ethereum -> Canton**: lock `ETH` on Ethereum and mint `wETH` on Canton
    - **selected EVM chain -> Canton**: lock the native asset on the selected EVM chain and mint `wEVM` on Canton

### Canton asset support

- Canton Coin is included in the initial scope
- Additional Canton-issued assets may be supported later, but they are not included in the initial grant scope

### Solana-side bridge implementation (Rust)

- Development of bridge programs and supporting components for Solana
- Bridge flows for:
    - Canton -> Solana: mint `wCC` on Solana against Canton-locked `CC`
    - Solana -> Canton: burn `wCC` on Solana and trigger release of `CC` on Canton
    - Solana -> Canton: lock `SOL` on Solana and mint `wSOL` on Canton
    - Canton -> Solana: burn `wSOL` on Canton and release `SOL` on Solana

### Ethereum-side bridge implementation (Solidity)

- Development of bridge contracts and supporting components for Ethereum
- Bridge flows for:
    - Canton -> Ethereum: mint wrapped Canton Coin on Ethereum against Canton-locked `CC`
    - Ethereum -> Canton: burn wrapped Canton Coin on Ethereum and trigger release of `CC` on Canton
    - Ethereum -> Canton: lock `ETH` on Ethereum and trigger minting of `wETH` on Canton
    - Canton -> Ethereum: burn `wETH` on Canton and release `ETH` on Ethereum

### Selected EVM-side bridge implementation (Solidity)

- Development of bridge contracts and supporting components for one selected EVM network supported by Asterizm
- Bridge flows for:
    - Canton -> selected EVM: mint wrapped Canton Coin on the selected EVM chain against Canton-locked `CC`
    - selected EVM -> Canton: burn wrapped Canton Coin on the selected EVM chain and trigger release of `CC` on Canton
    - selected EVM -> Canton: lock the EVM-native asset and trigger minting of `wEVM` on Canton
    - Canton -> selected EVM: burn `wEVM` on Canton and release the underlying asset on the selected EVM chain

### Web application and operator tooling

- Transfer flow page
- Explorer / transaction status page
- Service pages and user guidance
- Canton wallet integration
- Solana wallet integration
- Ethereum / EVM wallet integration
- Off-chain modules for observability, monitoring, alerting, and operator runbooks

### Summary

Upon completion, a Canton-branded bridge will be delivered as a production-ready reference implementation for Canton Coin and selected native assets between Canton, Solana, Ethereum, and one selected EVM chain.

The solution includes a user interface, wallet integrations, public technical documentation, transaction inspection, and operations guidance so that ecosystem reviewers can assess not only feature completeness, but also security and production readiness.

---

## 3. Security Model and Trust Assumptions

This proposal does **not** assume a trust-minimized light-client bridge between Canton and external chains. Instead, it uses Asterizm's production cross-chain messaging architecture together with chain-specific bridge contracts and services.

The bridge is designed to provide verifiable and auditable cross-chain transfers with clearly documented trust assumptions and operational controls.

### Core principles

- Assets remain locked or escrowed on the origin chain while a wrapped representation is minted on the destination chain
- Minting and release operations are executed only after the destination-side bridge logic validates a cross-chain message under the Asterizm protocol rules
- Each transfer can be traced through on-chain transactions together with off-chain operational logs and monitoring
- The deployment includes observability, alerting, and emergency handling to reduce operational risk during early production use

### Trust assumptions

- Users trust the correctness of the deployed Canton, Solana, Ethereum, and selected EVM bridge contracts/programs
- Users trust the Asterizm message validation and delivery model used as the interoperability layer
- Users trust the operational security of the deployment, including key management, release procedures, incident response, and emergency controls

### Risk controls included in scope

- Pause / emergency stop procedures
- Transfer caps and rollout limits for early production deployment
- Monitoring and alerting for transfer failures and abnormal patterns
- Public documentation of trust assumptions and the operating model
- Transaction traceability across bridge components

### Out of scope for this proposal

- A generalized arbitrary-message bridge for third parties
- Immediate support for all Canton-issued assets
- Immediate support for all Solana and EVM token standards
- Deep liquidity bootstrapping, market-making, or exchange listing work
- A trust-minimized light-client architecture

---

## 4. Architectural Alignment

The **Canton <-> Solana <-> Ethereum <-> selected EVM** bridge is aligned with the architecture and design principles of the Canton ecosystem. Canton is built around secure and deterministic transaction processing using Daml smart contracts and a privacy-aware execution model. Our implementation leverages Canton-native Daml components for smart contracts and asset handling while keeping interoperability logic explicit and reviewable.

From an ecosystem perspective, interoperability and tokenized asset distribution are important enablers of growth. By introducing wrapped representations of Canton Coin on Solana, Ethereum, and one selected EVM chain, and wrapped representations of `SOL`, `ETH`, and the selected EVM-native asset on Canton, the bridge expands the addressable environment for Canton-connected assets while preserving a controlled, documented asset path.

The solution is structured around three principles:

- **Controlled Cross-Chain Asset Representation**: Wrapped assets are backed 1:1 by locked assets on origin chains, with documented asset flows and trust assumptions
- **Operational Transparency**: Monitoring, alerting, logging, and runbooks are included so the bridge can be operated and evaluated as production infrastructure
- **Usable Integrations**: Wallet support, UI, and explorer tooling are included to reduce friction for both developers and end users

Overall, the bridge strengthens the Canton ecosystem by delivering a concrete interoperability pattern for high-value asset and liquidity use cases while remaining compatible with Canton's architectural model.

---

## 5. Initial Ecosystem Demand and Why Canton

The purpose of this bridge is not to provide generic interoperability in the abstract. The initial value for Canton is to create a practical route between Canton-based assets and external chains that already have strong wallet distribution, active users, and liquidity environments.

### Why this matters for Canton

- Tokenized assets and RWAs issued or represented in the Canton ecosystem may need access to broader wallet and liquidity surfaces
- Stablecoin and payment flows can benefit from external ecosystems with active user and application environments
- Canton ecosystem teams may require inbound access to external assets for DeFi, treasury, settlement, and product design use cases
- A bridge reference implementation lowers the barrier for future Canton ecosystem integrations

### Why Solana first

- Solana offers strong wallet distribution, active on-chain users, and established asset transfer behavior
- The Canton <-> Solana route is differentiated from standard EVM-only connectivity
- Solana is particularly relevant for payments, consumer-facing finance, and token distribution environments that can complement Canton's institutional and tokenized asset focus

### Initial target users

- Canton ecosystem teams issuing or managing tokenized assets
- Infrastructure and application teams that need a bridgeable Canton asset route
- Selected early integrators and design partners introduced through the Canton ecosystem and Asterizm network

### Initial success signals

- At least one concrete early integration path or design-partner discussion in the Canton ecosystem
- Transfer demonstrations across the defined initial chain set
- A reviewer-accessible bridge implementation package with clear operational procedures
- A reusable reference pattern for extending Canton-connected asset interoperability

---

## 6. Backward Compatibility

The proposed bridge will provide third-party developers with the ability to use Solana-, Ethereum-, and EVM-originated assets within applications and protocols deployed on Canton.

Likewise, Canton-originated assets will be able to participate in applications and liquidity environments on Solana, Ethereum, and the selected EVM chain through wrapped representations.

External protocols will also be able to integrate the bridge as infrastructure within their own products, expanding business and application opportunities across the Canton ecosystem.

---

## 7. Initial Scope and Non-Goals

### Initial scope for this grant

- Support for Canton Coin as the first Canton-native production asset
- Support for `SOL`, `ETH`, and one selected EVM-native asset as the first inbound external assets
- Wrapped-asset flows for `wCC`, `wSOL`, `wETH`, and `wEVM`
- Bridge UI for deposit, redemption, transfer status, and transaction inspection
- Monitoring, alerting, documentation, and operator runbooks
- Public or reviewer-accessible reference components for Canton, Solana, Ethereum, and the selected EVM chain

### Non-goals for the initial grant phase

- Support for every Canton-issued asset from day one
- Support for all SPL, ERC-20, and non-fungible asset variants
- Institutional custody integrations
- Generalized cross-chain governance or arbitrary contract execution
- Liquidity incentives, market making, or exchange integrations

This narrower scope is intentional. It makes the proposal easier to evaluate, reduces execution risk, and creates a clearer path for champion review and committee assessment.

---

# Milestones and Deliverables

## Milestone 1: Architecture, Security Design, and Reference Bridge Flow

**Estimated Delivery:** 21-28 days

### Focus

- Finalize the architecture for Canton <-> Solana <-> Ethereum <-> selected EVM bridge flows
- Implement core bridge contracts/programs and business logic across the selected chains
- Define trust assumptions, failure handling, and operational controls
- Deliver a reviewer-accessible reference flow with transfer traceability

### Deliverables / Acceptance Criteria

- Technical architecture document, including:
    - bridge message flow
    - trust assumptions
    - asset lock/mint and burn/release flows
    - failure handling and emergency controls
- Core bridge components implemented for Canton, Solana, Ethereum, and one selected EVM chain
- Testnet end-to-end reference flows for:
    - `CC` Canton -> Solana -> Canton
    - `CC` Canton -> Ethereum -> Canton
    - `CC` Canton -> selected EVM -> Canton
    - `SOL` Solana -> Canton -> Solana
    - `ETH` Ethereum -> Canton -> Ethereum
    - selected EVM native asset -> Canton -> selected EVM
- Public or reviewer-accessible repositories for bridge components and deployment manifests
- Transaction trace examples for successful and failed transfers
- Monitoring and operator runbook covering alerting and emergency pause procedures

---

## Milestone 2: Production Readiness, UI, and Ecosystem Enablement

**Estimated Delivery:** 14-21 days

### Focus

- Complete bridge UI, wallet integrations, explorer pages, and user-facing flows
- Run testing, debugging, and production-readiness checks
- Finalize documentation and deployment packaging
- Prepare initial rollout parameters for live usage

### Deliverables / Acceptance Criteria

- Bridge web application live with:
    - transfer flow
    - transaction explorer / status page
    - service and information pages
- Wallet support for Canton, Solana, Ethereum, and the selected EVM chain
- Production-readiness package including:
    - rollout limits / transfer caps
    - emergency controls
    - monitoring and alerting configuration
    - incident-response guidance
- Documentation for end users and integrators published
- At least 20 successful transfer demonstrations across the supported routes, with on-chain transaction references and off-chain logs shared with reviewers

---

# Deliverables

- Technical documentation covering architecture, trust assumptions, operator procedures, and user guidance
- A Canton <-> Solana <-> Ethereum <-> selected EVM bridge reference implementation
- Wrapped token flows for `wCC`, `wSOL`, `wETH`, and `wEVM`
- Canton, Solana, Ethereum, and selected EVM wallet integrations
- Transaction explorer for user-visible cross-chain transfer tracking
- Monitoring, alerting, and bridge scanner functionality
- Public or reviewer-accessible repositories for Canton components, Solana programs, EVM contracts, and deployment manifests

**Evidence of completion:** successful cross-chain transfers across the supported routes via the published bridge website, supported by on-chain transaction hashes, explorer data, and off-chain operational logs

---

# Funding

**Total Funding Request:** $145,000 | 970,000 CC

## Payment Breakdown by Milestone

### Milestone 1: Architecture, Security Design, and Reference Bridge Flow

**Requested payment:** 470,000 CC upon acceptance of Milestone 1 scope and delivery package

- Web application branded design and layout — $15,000
- Bridge development and deployment across Canton, Solana, Ethereum, and selected EVM — $55,000

**Tranche 1 Total:** $70,000 | 470,000 CC

### Milestone 2: Production Readiness, UI, and Ecosystem Enablement

**Requested payment:** 500,000 CC upon acceptance of Milestone 2 delivery package

- Testing and debug phase for bridge routes — $15,000
- Web application development, explorer, and wallet integration — $50,000
- Test and debugging of web application — $10,000

**Tranche 2 Total:** $75,000 | 500,000 CC

---

## Volatility Stipulation

The expected project duration is less than 3 months.

---

# Co-Marketing

Upon release, we are happy to collaborate with the Foundation on co-marketing activities, including:

- Coordinated announcements with the Foundation
- A technical blog post or case study
- Developer-facing promotion within the ecosystem

We are also open to discussing additional ecosystem-facing commitments if helpful.

---

# Motivation

The **Canton <-> Solana <-> Ethereum <-> selected EVM bridge** developed by **Asterizm** provides value to the Canton ecosystem by creating a practical, auditable path between Canton-connected assets and major external ecosystems.

This matters for four reasons:

- **Ecosystem Growth**: Canton-native assets can access broader wallet, application, and liquidity environments
- **Adoption Acceleration**: External assets can enter Canton-linked products and use cases through a defined interoperability route
- **Strategic Interoperability**: Canton gains a reusable reference path for cross-chain asset movement that can support future tokenized asset and financial workflows
- **Operational Reliability**: The proposal includes monitoring, documentation, and emergency procedures so the bridge can be evaluated as production infrastructure rather than just a demo

This proposal is intentionally framed as a focused interoperability implementation with explicit scope, trust assumptions, and measurable deliverables.

---

# Rationale

This approach directly delivers an auditable cross-chain bridge with explicit operational controls and a clear first-use scope. Alternative approaches, such as purely custodial or loosely specified bridge models, introduce greater trust ambiguity and weaker ecosystem confidence.

By leveraging Canton-native Daml components, Solana Rust programs, Ethereum and EVM smart contracts, and Asterizm's production cross-chain transport layer, the solution aims to provide:

- compatibility with the Canton ecosystem
- a practical route to major external networks
- traceable asset movements
- operational visibility for reviewers and integrators

Asterizm aligns with the philosophy and technical architecture of the Canton Network as an enterprise-grade interoperability provider focused on real-world production integrations, including privacy-aware and institutional use cases.

---

# Why Asterizm?

Asterizm is a cross-chain messaging and infrastructure provider already integrated with the Canton Network. We enable secure, auditable, and scalable interoperability connecting Canton to more than 30 networks, including Ethereum, Avalanche, Base, Arbitrum, Optimism, Solana, Stellar, and others.

Our team has direct experience with Canton Daml contracts and with integrating Canton into Asterizm infrastructure. We also have substantial experience developing, testing, and deploying bridge and interoperability systems across EVM and non-EVM environments.

The first collateral bridge on Canton, built using Asterizm Protocol, is intended to enable secure cross-chain transfers of digital assets and tokenized RWAs between Canton and a broad set of networks. That existing technical alignment, combined with demand for cross-chain asset pathways, makes Asterizm a practical partner to deliver this focused Canton bridge reference implementation.

---

# Team & Experience

**Asterizm (Asterizm.io)** is an institutional-grade blockchain interoperability infrastructure provider for DeFi, RWAs, and enterprise blockchains. Asterizm removes the need for third-party off-chain consensus by using its own cross-chain validation and messaging model, enabling lower costs and faster execution across supported environments.

**Asterizm has integrated with 30+ EVM chains, as well as Canton, Stellar, Solana, TON, and MoveVM chains.**

Asterizm focuses on DeFi, RWAs, stablecoins, fintech, and enterprise use cases, with solution delivery across finance, payments, and tokenization.

- Backed by Web3 VCs including Optic Capital, Blockchain Founders Fund, V3NTURES, Funders VC, WebWise Capital, Cicada Capital, and Oversubscribed Capital
- Multiple grants secured, including Cardano, Stellar, Supra, Redbelly, and Bahamut
- Audited by HashEx (2023), Decurity (2025), and CredShields (2026)
- Recognition including Techstars by Polygon Alumni (Spring '23), WebSummit Qatar 2024 semi-finalist, and Paris Blockchain Week 2025 top DeFi/RWA recognition
- A coordinated core team working together since 2020

Our team has deep experience with Canton Daml contracts and has successfully integrated them into the Asterizm interoperability stack. Because Solana and EVM environments are also already integrated with Asterizm, we can deliver this proposal on top of existing production infrastructure rather than beginning from zero.

**Website:** [https://asterizm.io/](https://asterizm.io/)  
**Docs:** [https://docs.asterizm.io/](https://docs.asterizm.io/)  
**GitHub:** [https://github.com/Asterizm-Protocol](https://github.com/Asterizm-Protocol)

---

## Optional Champion Review Notes

If helpful for champion review, Asterizm is open to:

- narrowing the initial chain or asset scope further
- clarifying early design-partner demand within the Canton ecosystem
- refining milestone acceptance criteria
- publishing a more explicit operating model and incident-handling appendix
