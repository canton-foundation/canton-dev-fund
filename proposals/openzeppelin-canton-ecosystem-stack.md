## OpenZeppelin Canton Ecosystem Stack

| Field | Value |
| :---- | :---- |
| **Author** | OpenZeppelin |
| **Status** | Draft |
| **Created** | 2026-04-28 |
| **Label** | `financial-workflows-composability` |
| **Champion** | Digital Asset |

---

# Abstract

This proposal requests a grant to fund the design, implementation, security audit, and ecosystem adoption of a comprehensive open-source development stack for Canton, delivered over 24 months in quarterly milestones.

The grant bundles three tightly coupled workstreams into a single proposal:

1. **OpenZeppelin Reference Implementations for Canton**: 8 production-ready, end-to-end blueprints (4 per year) targeting strategic DeFi and institutional use cases, each including working reference code, architecture documentation, demo front-end, and threat models.  
2. **OpenZeppelin Contracts Library for Canton**: A secure, audited, and standardized Daml contracts library providing the same role as OpenZeppelin Contracts for Solidity: the trusted foundation developers import when building applications. The library roadmap feeds directly from the needs and use cases that arise from the Reference Implementations, ensuring every primitive is battle-tested in a real application before release. Includes Contracts Wizard integration, AI development tools, and comprehensive documentation.  
3. **Security Audits**: Dedicated security capacity covering smart contract audits of all OpenZeppelin-produced library code and Reference Implementation code, ensuring every release meets OpenZeppelin's established security standards.

Additionally, OpenZeppelin commits to a **Developer Enablement and Co-Marketing program**, included at no additional cost to the fund, to drive ecosystem adoption of the libraries and Reference Implementations. This program directly supports the adoption milestones defined in this proposal.

OpenZeppelin has already begun investing in the Canton ecosystem, publishing [research on smart contract security for institutional finance on Canton](https://www.openzeppelin.com/news/smart-contract-security-for-institutional-finance-on-canton-an-entirely-different-problem) and open-sourcing early Canton tooling including a [token template](https://github.com/OpenZeppelin/canton-token-template), a [stablecoin template](https://github.com/OpenZeppelin/canton-stablecoin), a [Daml linter](https://github.com/OpenZeppelin/daml-lint), a [Daml verifier](https://github.com/OpenZeppelin/daml-verify), and a [Daml property-based testing library](https://github.com/OpenZeppelin/daml-props). This proposal builds on that foundation.

---

# Motivation

## The Opportunity

Canton is entering a critical growth phase. Institutions like DTCC are bringing $100T+ in tokenizable assets to the network, and the recent tokenomics shift toward rewarding useful applications creates a clear window for builders.

## The Problem

Through multiple meetings with Digital Asset leadership and the Canton Foundation, we have identified critical gaps:

- **No open-source reference implementations** for the complex financial products Canton's ecosystem needs: no compliant lending, no privacy-preserving DEXs, no composable DeFi building blocks.  
- **No standardized, audited contract libraries.** The current token standard (CIP-56) covers simple instruments, but there are no reusable primitives for vaults, access control, cross-chain messaging, credentials, or other DeFi building blocks. Teams are independently rebuilding the same foundational components, increasing security risk and slowing adoption.  
- **Steep learning curve for web3 developers.** Canton's Daml-based architecture is fundamentally different from Solidity/EVM ecosystems. Developers entering the ecosystem face limited documentation, fragmented tooling, and no equivalent of the battle-tested contract libraries they rely on elsewhere.

## Why OpenZeppelin

Founded in 2015, OpenZeppelin is the world leader in securing blockchain applications and smart contracts. Its open-source Contract Libraries are the industry standard for smart contract development.

| Metric | Value |
| :---- | :---- |
| Total Value Transferred via OpenZeppelin Contracts | \+$35 trillion |
| TVL importing OpenZeppelin Contracts | $175B+ |
| Market share in top 50 DeFi protocols | \~85% |
| Transactions processed since 2018 | 5.9B+ |
| Average weekly NPM downloads | \~700K |
| Yearly documentation views | \+1.8M |
| Yearly Contracts Wizard views | \+1.6M |

OpenZeppelin has successfully built trusted contract libraries and developer tools across multiple ecosystems, each time becoming the standard foundation developers build on:

| Ecosystem | Scope |
| :---- | :---- |
| Ethereum | Solidity Contracts (10+ years), EIPs/ERCs standards, gold-standard audits, incident response |
| Starknet | Contracts Library for Cairo, SNIPs standards, Security Tooling, Contracts Wizard |
| Stellar | Contracts Library for Soroban, standards development, Ecosystem Stack, Contracts Wizard |
| Arbitrum | Contracts Library for Stylus (Rust), AIPs standards, Security Council member, Contracts Wizard |
| Midnight | Contracts Library for Compact, LunarSwap reference DEX, privacy-preserving architecture |
| Uniswap | Contracts Library for Hooks, gold-standard audits for v4, Contracts Wizard |
| Sui | Contracts Libraries for SUI Move, standards development, Starter dApps, Contracts Wizard |
| Miden | Confidential Contracts Library, standards development, Contracts Wizard, Private State Manager |

Our Midnight engagement is particularly relevant: we built [LunarSwap](https://midnight.openzeppelin.com/lunarswap), a working privacy-preserving DEX on a UTXO-based architecture with a functional programming language, solving many of the same challenges Canton developers face.

As the [primary security partner for financial institutions](https://www.openzeppelin.com/financial-institutions) including DTCC and WisdomTree, OpenZeppelin is uniquely positioned to help Canton accelerate composability across TradFi and DeFi.

## Strategic Fit

This is not a cold start. OpenZeppelin has built deep expertise in privacy-preserving, UTXO-based architectures through our Midnight engagement, and our team is already ramping Daml capabilities. Our approach complements Digital Asset's commercially-driven model: we build trusted open-source building blocks that accelerate ecosystem adoption while Digital Asset focuses on core infrastructure and institutional onboarding. Through close collaboration, our development work will provide feedback on and improve existing ecosystem tools (e.g., [Canton protocol](https://github.com/canton-foundation/canton-dev-fund/pull/48/files), [Splice](https://github.com/canton-foundation/canton-dev-fund/pull/47/files), [Daml SDK](https://github.com/canton-foundation/canton-dev-fund/pull/49/files), [Splice Wallet Kernel](https://github.com/canton-foundation/canton-dev-fund/pull/50/files)), helping streamline the secure development path for all builders.

---

# Specification

## 1\. Objective

Deliver shared, open-source ecosystem infrastructure for Canton that:

- **Accelerates DeFi adoption** by providing production-ready Reference Implementations that teams can evaluate, fork, and build upon rather than starting from scratch.  
- **Standardizes secure development** by providing audited, composable Daml contract primitives that developers import and compose, reducing fragmentation, lowering security risk, and accelerating time-to-market.  
- **Bridges the web3 developer gap** by delivering the same streamlined developer experience (Contracts Wizard, AI tools, documentation) that has driven 85% market penetration in Ethereum.  
- **Improves Digital Asset tooling** through active collaboration: as our team builds on Canton's stack, we provide developer experience feedback and contribute improvements that benefit the entire ecosystem.

## 2\. Implementation Mechanics

### How the Workstreams Connect

The Reference Implementations and the Contracts Library are designed to reinforce each other. The library roadmap feeds directly from the needs and use cases that arise from the Reference Implementations: as we build each RI, we identify and prioritize the reusable Daml primitives required, extract and generalize them into standalone library components, and then use those library components as the building blocks within the Reference Implementation itself. This means every library component is validated in a real reference application before release, and every Reference Implementation showcases integrations of our secure contract standard implementations while documenting usage of the best ecosystem tools and off-chain components.

By working on strategic DeFi use cases for Reference Implementations in parallel with the library, we continuously adjust our library roadmap to bring to Daml the primitives that will accelerate DeFi and TradFi teams. At the same time, we provide active feedback and collaborate to improve Digital Asset tools and solutions integrated into our Reference Implementations.

### Workstream A: Reference Implementations (8 total, 4 per year)

OpenZeppelin Reference Implementations are the next evolution of OpenZeppelin standards. They are specifically designed to target critical bottlenecks that both financial institutions and DeFi teams face when trying to integrate or migrate to Canton.

Reference Implementations dramatically compress timelines by providing production-ready blueprints and end-to-end working examples that enable teams to evaluate, decide, and deploy using battle-tested patterns rather than starting from scratch. Their reusable and audited components provide secure scaffolding for new integrations, avoiding fragmentation of similar use cases and enabling teams to build confidently over trusted patterns.

Each end-to-end implementation will include:

- **Working Reference Code**: Production-ready implementations integrating with Canton for particular use cases, with all on-chain and off-chain elements assembled into a single packaged offering. The package will include deployment utilities for immediate evaluation using testnets, including localnet.  
- **Architecture Documentation**: Component maps showing integration patterns with custody, compliance, and risk management systems.  
- **Demo Front-End**: Prototype end-to-end UI supporting core flows and technical evaluation, with reusable white-label components.  
- **Threat Model and Security Considerations**: Risk assessment specific to each use case, addressing specific attack vectors and failure modes.

Even though our initial scoping for Reference Implementations focuses on DeFi applications, these will be designed with institutional composability in mind, and will include patterns such as compliance hooks, credential-based access, and multi-party attestation. This way, the implementations can serve both a crypto-native team looking to build or port their solution to Canton and a regulated institution that wants to provide DeFi utility on top of their tokenized assets or TradFi application.

As needed, Reference Implementations will also include **FI Evaluation Guides** specifically tailored to accelerate compliance and procurement for financial institutions. These guides translate technical architecture into the language used by teams engaged in procurement, compliance, and technology risk, providing risk-based assessments of ledger technologies, protocols, and counterparties necessary to participate in a variety of commercial implementations.

**Year 1 Reference Implementations** (preliminary; specific use cases to be defined through joint scoping sessions with Canton, relevant partners, and target clients):

1. **Privacy-Preserving Decentralized Exchange (DEX)**: End-to-end blueprint for an open-source reference DEX that demonstrates how to build a working DeFi protocol on Canton end-to-end, leveraging OpenZeppelin's experience building [LunarSwap](https://midnight.openzeppelin.com/lunarswap) on Midnight. Building a DEX on Canton involves unique challenges: every smart contract requires an explicit configuration of which nodes participate in consensus, so the DEX will need to set up a decentralized attestor data pool to validate the liquidity pool and trading logic. The native capability already exists on Canton (e.g., [BitSafe cBTC](https://docs.bitsafe.finance/bitsafe-documentation/product-suite/cbtc)), and Digital Asset is building improved tooling to simplify setup, which OpenZeppelin will integrate with as it becomes available. Beyond the working code, the deliverable will include educational materials on how to think about building DeFi protocols on Canton, addressing a gap that Digital Asset currently fills through hand-holding and advisory. This Reference Implementation will enable teams building different variations of exchanges, from AMMs to Centralized Limit Order Books (CLOBs).  
     
2. **Lending Protocol**: End-to-end blueprint for a lending protocol adapted for Canton's architecture and privacy considerations, built around vaults as the core primitive, with vault features designed to integrate with established or new standards in the Canton ecosystem including credential and attestation systems. This allows the lending protocol to serve both crypto-native DeFi users and institutional participants who require compliance controls. The implementation may also explore multi-party attestation patterns, where the vault issuer is multiply attested. OpenZeppelin brings direct experience implementing [tokenized vault standards](https://docs.openzeppelin.com/impact/tokenization-and-real-world-assets#tokenized-vaults) and RWA-backed lending infrastructure across multiple ecosystems, including [ERC-4626 on Ethereum](https://docs.openzeppelin.com/contracts/5.x/erc4626), [SEP-56 on Stellar](https://docs.openzeppelin.com/stellar-contracts/tokens/vault/vault), and [equivalent implementations on Starknet](https://docs.openzeppelin.com/contracts-cairo/2.x/erc4626), as well as deep expertise in lending protocol security through long-standing partnerships such as [Compound](https://blog.openzeppelin.com/compound-comprehensive-protocol-audit).  
     
3. **Cross-Chain Stablecoin Payment Orchestration**: End-to-end blueprint for stablecoin payment orchestration on Canton, enabling users holding stablecoins on other chains to transact and settle privately on Canton without exposing payment details. The reference implementation will demonstrate cross-chain settlement workflows leveraging Canton's privacy guarantees, integrating with existing stablecoin infrastructure in the Canton ecosystem (e.g., [USDCx](https://docs.digitalasset.com/integrate/devnet/usdcx-support/index.html)), and complementing Canton's growing institutional stablecoin ecosystem. The cross-chain components will build on the Standardized Messaging Gateway from our Contracts Library, with integration points for compliance controls via Credentials and Claims. OpenZeppelin brings direct experience working with cross-chain interoperability providers including Chainlink and LayerZero, and will collaborate with Canton ecosystem partners to ensure compatibility.  
     
4. **Confidential Auction Launchpad**: End-to-end blueprint for a confidential auction launchpad on Canton, enabling ICOs and token distribution workflows where bids, allocations, and settlement details are visible only to the relevant parties. The reference implementation will initially focus on sealed-bid token auctions, with a design that supports additional on-chain launch mechanisms over time. The implementation will include integration points for controlled participant access, credentials, and policy checks where needed for regulated or institution-facing distributions.

**Year 2 Reference Implementations** will be defined through the 12-month scope review in collaboration with Canton Foundation, Digital Asset, relevant ecosystem partners, and the wider community.

### Open Source Tooling Integration and Ecosystem Collaboration

By working on strategic DeFi use cases for Reference Implementations, **OpenZeppelin will actively use, provide feedback on, integrate with, and build on top of Digital Asset's tooling.** This includes existing tooling (language bindings, DPM and SDKs) that currently provide low-level typed access to Canton's APIs, as well as new developments in open-source decentralized party management and decentralized attestor data pool infrastructure that may be needed in the Reference Implementations.

**Collaboration with ChainSafe on CIP-86 deployments.** OpenZeppelin will coordinate with ChainSafe on interface design between the Daml contracts library and their CIP-86 middleware, so that applications built on OpenZeppelin primitives integrate smoothly with the ChainSafe middleware layer. OpenZeppelin and ChainSafe intend to publish joint deployment guidance for the combined library and middleware pattern, and to align on technical details as both projects mature.

OpenZeppelin will not only collaborate to improve the developer experience of existing ecosystem tools, but will also integrate tools from the OpenZeppelin Stack into Canton as needed, targeting specific functionalities required by the Reference Implementations. These may include tools that developers already use in other ecosystems, such as [Monitor](https://docs.openzeppelin.com/monitor/1.3.x) for event detection and alerting, and a [Private State Manager](https://github.com/OpenZeppelin/private-state-manager) for off-chain synchronization.

### Workstream B: Contracts Library

OpenZeppelin will deliver a secure, audited, and well-documented contracts library for Daml that serves the same role as OpenZeppelin Contracts for Solidity: the trusted foundation that every developer imports and composes when building applications. These libraries will provide a standardized layer of reusable code assets that streamline secure development in Canton.

The specific building blocks and the order in which we bring them to production depends heavily on the particular architectural and language constraints of each ecosystem, as well as the specific types of use cases targeted in their strategic roadmap. We envision an initial 24-month engagement, split into quarterly milestones, to develop the complete contracts library, with an evolving roadmap that feeds directly from the needs and use cases that arise from our Reference Implementations.

**Library Support for Existing CIPs:**

- **CIP-56 Canton Network Token Standard**: Review, design, and implementation ensuring it is modular and maximally extensible in terms of enabling the expression and enforcement of the complex rules and regulations required by financial assets like stablecoins as well as institutional asset management in general. In line with our experience implementing and distributing ERC-20 in Ethereum and similar token standards in other ecosystems, we will build a production-ready token standard implementation that developers can import in their applications, with Digital Asset maintaining the specification and OpenZeppelin providing the audited implementation.

- **CIP-86 ERC-20 Middleware and Distributed Indexer:** Support for the CIP-86 workstream, which enables Ethereum-native tooling (MetaMask, JSON-RPC, standard ABIs) to interact with CIP-56 tokens on Canton. ChainSafe has shipped the reference middleware, providing the Ethereum JSON-RPC facade, MetaMask compatibility, and the bidirectional ERC-20 to CIP-56 asset bridge. OpenZeppelin will ensure the audited Daml primitives delivered through this grant are designed for clean integration with the ChainSafe middleware, so DeFi protocols porting to Canton can deploy the OpenZeppelin library on the contract layer and run the ChainSafe middleware in front of it without adapter code. OpenZeppelin and ChainSafe will publish joint deployment guidance and reference architectures for the combined pattern, and will co-market it as the standard on-ramp for Ethereum-native teams entering Canton.

*"ChainSafe views OpenZeppelin's Daml contracts library as complementary to our CIP-86 middleware. Teams using OpenZeppelin primitives for their application logic combined with our middleware for Ethereum-native UX gain a complete Ethereum-like development and user experience on Canton. We look forward to collaborating on interface alignment and co-marketing this pattern to the ecosystem."*  
Colin Schwarz, Program Lead, ChainSafe

- **CIP-103 dApp Standard**: Library components to support the Canton dApp standard, providing the contract-level primitives for building standardized decentralized applications. We will review existing implementations where CIP-103 is relevant (e.g., Splice Wallet Kernel), ensuring compatibility for any new components and avoiding implementation duplication as we use these components in our Reference Implementations.  
- **CIP-104 Traffic-Based App Rewards**: Library support for CIP-104, which replaces the deprecated CIP-47 Featured App Activity Markers with automatic traffic-based rewards measurement. OpenZeppelin will provide library components to help developers integrate with the new rewards model and migrate from the legacy marker system.

Other CIPs published by the community will be reviewed and considered for implementation as we progress through the engagement.

**Additional Library Components:**

OpenZeppelin will provide additional library components for other features required for the DeFi Reference Implementations, so that these features may be used within the RIs and by developers for other applications. OpenZeppelin will also submit new CIPs associated with these, as deemed appropriate and desirable by the community, to promote standardization and reuse. Smart contract features and standards covered may include:

- **Vaults**: Core to lending, permissioned and permissionless, multi-asset, multi-chain.  
- **Modular Hooks**: Useful to allow customization of liquidity pools (see [Uniswap Hooks](https://docs.openzeppelin.com/uniswap-hooks)).  
- **Roles Based Access Control**: Necessary for swap/lending controls.  
- **Timelock and Pause**: Useful for security controls.  
- **Nonfungible Tokens**: Used for transferable loan positions.  
- **Modular Multi-Sig Accounts**: Necessary for external DeFi users (LPs and borrowers). We will review existing accounts and wallet implementations (such as the Splice Wallet Kernel) to ensure compatibility and avoid duplication by leveraging existing components whenever possible.  
- **Credentials and Claims**: Necessary for compliance checks on external DeFi users.  
- **Standardized Messaging Gateway**: Useful to add multi-chain support compatible with any of Chainlink, LayerZero, Wormhole, etc.  
- **DeFi Math Library**: Reusable math primitives and financial abstractions for DeFi and institutional applications.  
- **Staking Contracts**: For confidential staking and reward distribution.  
- **Vesting Contracts**: For privacy-preserving token distribution.  
- **Token Auctions**: For confidential ICOs and various auction formats.  
- **Additional Canton Standards**: To be determined throughout the engagement in collaboration with Canton and Digital Asset, for Canton-specific use cases.

Additional library components may include contract types that are difficult or not feasible to implement on other blockchains due to technical constraints, new use cases made possible by Canton's unique private architecture, as well as deeper enhancements or extensions to familiar patterns from other ecosystems.

**Developer Tools:**

- [**Contracts Wizard**](https://wizard.openzeppelin.com/)**, UI Builder, and Documentation**: Developers bootstrap Canton smart contract creation using a user-friendly interface and an AI assistant within the OpenZeppelin Contracts Wizard. This integration includes code generation capabilities, templates, comprehensive usage guides, integration with ecosystem IDEs, and deployment workflows. With over \+1.6M views in 2025, the OpenZeppelin Contracts Wizard will give thousands of blockchain developers instant exposure to Canton. The [OpenZeppelin UI Builder](https://builder.openzeppelin.com/) will complement the Wizard by enabling developers to generate ready-to-deploy front-end interfaces for their Canton smart contracts.  
- **AI-Enhanced Development Tools**: [Contracts MCP Server](https://blog.openzeppelin.com/introducing-contracts-mcp) giving AI-assisted development environments such as Cursor, Claude, Gemini, Windsurf, and VS Code structured access to OpenZeppelin's library components. AI Development Skills encoding proven development workflows, library usage patterns, and security considerations. Claude Plugin packaging Canton-specific MCP tools, skills, and development resources. This will include smart contract upgrade compatible enhancements (SCU).  
- **Comprehensive Documentation**: A dedicated Canton section on [OpenZeppelin Documentation](https://docs.openzeppelin.com/) detailing contract types, interfaces, use cases, and best practices.

### Workstream C: Security Audits

OpenZeppelin will dedicate **55 researcher-weeks of security capacity** over 24 months, covering:

- **Smart Contract Security Audits**: Line-by-line review of all OpenZeppelin-produced Daml smart contract code across the Contracts Library and Reference Implementations, identifying vulnerabilities, logic errors, and security flaws before each release.  
- **Security Reviews**: Full-stack security assessments of each Reference Implementation, evaluating on-chain smart contracts alongside off-chain backend systems and front-end interfaces.  
- **Penetration Testing**: Simulated real-world attacks against Reference Implementation deployments, covering application-level and infrastructure-level attack surfaces.  
- **Continuous Coverage and AI-Security Agent**: Audits amplified by OpenZeppelin's AI security agent, integrated directly into the audit workflow as a supervised accelerator. The AI agent continuously analyzes the codebase, highlights high-risk patterns, validates invariants, and surfaces architectural risks before and between formal audit cycles, with all findings reviewed and validated by OpenZeppelin auditors.  
- **Immunefi Bug Bounty**: Assistance to establish and manage a bug bounty program (OpenZeppelin will fund bounty payouts at the same levels as our standard OpenZeppelin Contracts bug bounty program).

This security capacity is scoped to OpenZeppelin-produced code. All security findings and reports will be published alongside the audited releases.

### Developer Enablement and Co-Marketing (included at no cost to the fund)

To support the adoption milestones defined in this proposal, OpenZeppelin commits to the following at no additional cost to the fund:

- **Dedicated Technical Account Manager** for the Canton Foundation.  
- **Tailored technical content**: In-depth tutorials and step-by-step guides for each release.  
- **Hackathon support**: Coaching and workshops at virtual and in-person events.  
- **Interactive demos and feedback sessions**: Hands-on showcases followed by community Q\&A.  
- **Co-marketing campaigns** for developer awareness and adoption of the Reference Implementations.  
- **Dedicated Canton Network Page** on OpenZeppelin's website (similar to [existing partner ecosystem pages](https://www.openzeppelin.com/networks/stellar)).  
- **Technical workshops** at Canton's flagship event and strategic conferences.  
- **Quarterly community feedback sessions** via community calls, X-spaces, Discord, and developer office hours.

OpenZeppelin's reach: \~150K monthly documentation views, 58.5K X followers (\~180K monthly impressions), 14.5K LinkedIn followers, \~13K monthly blog views.

## 3\. Architectural Alignment

This proposal aligns with the Canton ecosystem's core needs across multiple dimensions:

- **App Building and Developer Experience**: The Contracts Library, Contracts Wizard, AI tools, and documentation dramatically lower the barrier to building on Canton.  
- **Security and Resilience**: Every library component and Reference Implementation undergoes rigorous security audit before release.  
- **Financial Workflows and Composability**: All deliverables are designed for institutional composability with compliance hooks, credential-based access, and multi-party attestation.  
- **Scaling the Network**: Reference Implementations demonstrate real DeFi use cases that drive network traffic and adoption, directly supporting the traffic-based rewards model (CIP-104).

OpenZeppelin will actively collaborate with Digital Asset on existing and evolving open-source tooling, providing developer experience feedback and security input that benefits the entire ecosystem.

This work aligns with and builds upon the following published Canton standards and ecosystem development proposals:

- **CIP-56** (Canton Network Token Standard, approved) and the **Token Standard V2** upgrade proposal (PR \#97, approved)  
- **CIP-86** (ERC-20 Compatible Interface, approved)  
- **CIP-103** (dApp Standard, approved) and the **dApp SDK and Tooling** proposal (PR \#69, submitted)  
- **CIP-104** (Traffic-Based App Rewards, approved) and the implementation proposal (PR \#107, approved)  
- **Canton**, **Splice**, **Daml SDK**, and **Splice Wallet Kernel** open-source maintenance proposals (PRs \#47, \#48, \#49, \#50, submitted)

## 4\. Backward Compatibility

No backward compatibility impact. The Contracts Library and Reference Implementations are new additions to the ecosystem. Library components implementing existing CIPs (CIP-56, CIP-86, CIP-103, CIP-104) will follow the published specifications and maintain compatibility with existing ecosystem tooling.

---

# Milestones and Deliverables

## Milestone 1: Token Foundation and dApp Framework

| Field | Value |
| :---- | :---- |
| **Estimated Delivery** | Quarter 1: May to July 2026 |
| **Focus** | Foundational library components and Reference Implementation research |

**Reference Implementations:**

- Research and design for Year 1 Reference Implementations (DEX, Lending, Cross-Chain Stablecoin Payment Orchestration, Confidential Auction Launchpad)

**Contracts Library:**

- CIP-56 Canton Network Token Standard implementation  
- CIP-86 ERC20 Compatible Interface implementation  
- CIP-103 dApp Standard library components  
- CIP-104 Traffic-Based App Rewards library support  
- All library code published to GitHub with \>90% test coverage  
- Initial Canton section on OpenZeppelin Documentation

**Security:**

- Security audits of library components  
- Continuous coverage and AI-Security Agent

**Developer Enablement (included):**

- Marketing and community activations  
- Dedicated Technical Account Manager

**Acceptance Criteria:**

- All library code compiles against the current Daml SDK and passes CI with 100% test pass rate.  
- 90% code coverage confirmed via automated test reporting.  
- CIP-56 and CIP-86 implementations demonstrate token creation, transfer, and querying on LocalNet, including backwards compatibility tests.  
- CIP-103 library components are compatible with at least one existing CIP-103 implementation (e.g., Splice Wallet Kernel).  
- CIP-104 library components demonstrate integration with the traffic-based rewards model on LocalNet.  
- Architecture documents for Year 1 Reference Implementations published and reviewed by Digital Asset.  
- Library code and Reference Implementation code published in public GitHub repositories under MIT license. OpenZeppelin tooling code published under AGPL 3.0 license.

---

## Milestone 2: DEX Reference Implementation and Enabler Libraries

| Field | Value |
| :---- | :---- |
| **Estimated Delivery** | Quarter 2: August to October 2026 |
| **Focus** | First Reference Implementation and DeFi-enabling library components |

**Reference Implementations:**

- **Reference Implementation 1: Privacy-Preserving DEX**: Working reference code, architecture documentation, demo front-end, and threat model.

**Contracts Library:**

- Vaults  
- Modular Hooks  
- Roles Based Access Control  
- Timelock and Pause

**Security:**

- Security audits of Milestone 1 library code (audit report published)  
- Security reviews and penetration tests of DEX Reference Implementation  
- Continuous coverage and AI-Security Agent

**Developer Enablement (included):**

- Marketing and community activations  
- Dedicated Technical Account Manager  
- Leadership meeting

**Acceptance Criteria:**

- DEX Reference Implementation demonstrable on LocalNet/DevNet: pool creation, liquidity provision, swap execution, and fee collection.  
- Demo front-end functional for core DEX flows.  
- Architecture documentation includes integration patterns for custody, compliance, and risk management systems.  
- Threat model identifies and documents attack vectors specific to DEX on Canton.  
- Vault, Hooks, RBAC, and Timelock/Pause library components pass \>90% code coverage with full CI integration.  
- Educational materials on building DeFi protocols on Canton published alongside the RI.  
- M1 security audit report published with all critical and high findings resolved.

---

## Milestone 3: Lending Reference Implementation and Developer Tools

| Field | Value |
| :---- | :---- |
| **Estimated Delivery** | Quarter 3: November to January 2027 |
| **Focus** | Second Reference Implementation, lending-enabling library components, and developer tooling |

**Reference Implementations:**

- **Reference Implementation 2: Lending Protocol**: Working reference code, architecture documentation, demo front-end, and threat model.

**Contracts Library:**

- Nonfungible Tokens  
- Modular Multi-Sig Accounts  
- Credentials and Claims  
- OpenZeppelin Contracts Wizard, UI Builder, and Documentation for Canton  
- AI-Enhanced Development Tools for Canton (MCP Server, AI Skills, Claude Plugin)

**Security:**

- Security audits of Milestone 2 deliverables (audit report published)  
- Security reviews and penetration tests of Lending Reference Implementation  
- Continuous coverage and AI-Security Agent

**Developer Enablement (included):**

- Marketing and community activations  
- Dedicated Technical Account Manager

**Acceptance Criteria:**

- Lending Protocol Reference Implementation demonstrable on LocalNet/DevNet: vault creation, deposit/withdrawal, borrow/repay, and credential-gated compliance.  
- Demo front-end functional for core lending flows.  
- NFT, Multi-Sig, and Credentials library components pass \>90% code coverage with full CI integration.  
- Contracts Wizard generates valid Canton Daml contract code for token and vault configurations.  
- AI tools (MCP Server) return correct library component usage patterns for Canton-specific queries.  
- Canton Network section on OpenZeppelin Documentation is comprehensive for all released library components.  
- M2 security audit report published with all critical and high findings resolved.  
- At least 1 independent Canton developer has reviewed and provided feedback on the library components (written confirmation).

---

## Milestone 4: Cross-Chain and Auction RIs, Year 1 Adoption

| Field | Value |
| :---- | :---- |
| **Estimated Delivery** | Quarter 4: February to April 2027 (End of Year 1\) |
| **Focus** | Final Year 1 Reference Implementations, cross-chain library, and Year 1 adoption proof |

**Reference Implementations:**

- **Reference Implementation 3: Cross-Chain Stablecoin Payment Orchestration**: Working reference code, architecture documentation, demo front-end, and threat model.  
- **Reference Implementation 4: Confidential Auction Launchpad**: Working reference code, architecture documentation, demo front-end, and threat model.  
- **12-Month Scope Review**: Joint review with Canton Foundation to align Year 2 roadmap.

**Contracts Library:**

- Standardized Messaging Gateway  
- Other Standard Implementations (to be determined per evolving roadmap)

**Security:**

- Security audits of Milestone 3 deliverables (audit report published)  
- Security reviews and penetration tests of Cross-Chain and Auction Reference Implementations  
- Continuous coverage and AI-Security Agent

**Developer Enablement (included):**

- Marketing and community activations  
- Dedicated Technical Account Manager  
- Leadership meeting

**Delivery Acceptance Criteria:**

- Cross-Chain Stablecoin RI demonstrable on LocalNet/DevNet: cross-chain settlement workflow with privacy guarantees, integrating with USDCx or equivalent Canton stablecoin infrastructure.  
- Confidential Auction RI demonstrable on LocalNet/DevNet: sealed-bid auction with allocation and settlement visible only to relevant parties.  
- Messaging Gateway library component supports at least one cross-chain messaging provider integration.  
- M3 security audit report published with all critical and high findings resolved.  
- 12-Month Scope Review completed with Year 2 roadmap published and agreed upon with Canton Foundation.

**Adoption Criteria (Year 1):**

To support these adoption targets, the Canton Foundation and Digital Asset will actively introduce OpenZeppelin to teams building in the Canton ecosystem and facilitate integration opportunities throughout the engagement.  
                                                                                                                                                    

- At least **3 independent Canton projects** have imported or integrated OpenZeppelin Contracts Library components into their applications or prototypes, confirmed via written attestations or verifiable on-chain/repository evidence.  
- At least **1 Reference Implementation** has been forked, deployed, or used as a foundation by an external team, confirmed via public repository evidence or written attestation.                                                                                                                  
- Published Year 1 Adoption Report documenting usage, feedback received, and ecosystem impact.

---

## Milestone 5: Reference Implementation 5 and Extended Library

| Field | Value |
| :---- | :---- |
| **Estimated Delivery** | Quarter 5: May to July 2027 |
| **Focus** | First Year 2 Reference Implementation and extended library components |

**Reference Implementations:**

- **Reference Implementation 5** (use case defined during 12-Month Scope Review): Working reference code, architecture documentation, demo front-end, and threat model.

**Contracts Library:**

- Staking Contracts  
- Additional Canton Standards (to be determined per Year 2 roadmap)

**Security:**

- Security audits of Milestone 4 deliverables (audit report published)  
- Security reviews and penetration tests  
- Continuous coverage and AI-Security Agent

**Developer Enablement (included):**

- Marketing and community activations  
- Dedicated Technical Account Manager

**Acceptance Criteria:**

- RI 5 demonstrable on LocalNet/DevNet with functional demo front-end.  
- Staking library components pass \>90% code coverage with full CI integration.  
- M4 security audit report published with all critical and high findings resolved.  
- At least 1 independent Canton developer has reviewed new library components (written confirmation).

---

## Milestone 6: Reference Implementation 6 and Token Utilities

| Field | Value |
| :---- | :---- |
| **Estimated Delivery** | Quarter 6: August to October 2027 |
| **Focus** | Second Year 2 Reference Implementation and token utility libraries |

**Reference Implementations:**

- **Reference Implementation 6** (use case defined during 12-Month Scope Review): Working reference code, architecture documentation, demo front-end, and threat model.

**Contracts Library:**

- Vesting Contracts  
- Token Auctions  
- Other Open Source Developer Adoption Tools as needed per Year 2 roadmap

**Security:**

- Security audits of Milestone 5 deliverables (audit report published)  
- Security reviews and penetration tests  
- Continuous coverage and AI-Security Agent

**Developer Enablement (included):**

- Marketing and community activations  
- Dedicated Technical Account Manager  
- Leadership meeting

**Acceptance Criteria:**

- RI 6 demonstrable on LocalNet/DevNet with functional demo front-end.  
- Vesting and Token Auctions library components pass \>90% code coverage with full CI integration.  
- M5 security audit report published with all critical and high findings resolved.

---

## Milestone 7: Reference Implementation 7 and Additional Standards

| Field | Value |
| :---- | :---- |
| **Estimated Delivery** | Quarter 7: November to January 2028 |
| **Focus** | Third Year 2 Reference Implementation and additional Canton standards |

**Reference Implementations:**

- **Reference Implementation 7** (use case defined during 12-Month Scope Review): Working reference code, architecture documentation, demo front-end, and threat model.

**Contracts Library:**

- Additional Canton Standards (to be determined per Year 2 roadmap)

**Security:**

- Security audits of Milestone 6 deliverables (audit report published)  
- Security reviews and penetration tests  
- Continuous coverage and AI-Security Agent

**Developer Enablement (included):**

- Marketing and community activations  
- Dedicated Technical Account Manager

**Acceptance Criteria:**

- RI 7 demonstrable on LocalNet/DevNet with functional demo front-end.  
- Any new library components pass \>90% code coverage with full CI integration.  
- M6 security audit report published with all critical and high findings resolved.

---

## Milestone 8: Final Reference Implementation, Year 2 Adoption

| Field | Value |
| :---- | :---- |
| **Estimated Delivery** | Quarter 8: February to April 2028 (End of Year 2\) |
| **Focus** | Final Reference Implementation, remaining audits, and Year 2 adoption proof |

**Reference Implementations:**

- **Reference Implementation 8** (use case defined during 12-Month Scope Review): Working reference code, architecture documentation, demo front-end, and threat model.

**Contracts Library:**

- Additional Canton Standards (to be determined per Year 2 roadmap)

**Security:**

- Security audits of Milestone 7 deliverables (audit report published)  
- Security reviews and penetration tests  
- Final security audit and documentation polish across the full library and RI codebase  
- Continuous coverage and AI-Security Agent

**Developer Enablement (included):**

- Marketing and community activations  
- Dedicated Technical Account Manager  
- Leadership meeting

**Delivery Acceptance Criteria:**

- RI 8 demonstrable on LocalNet/DevNet with functional demo front-end.  
- M7 security audit report published with all critical and high findings resolved.  
- Full library documentation is complete, current, and published on OpenZeppelin Documentation.  
- All library code and Reference Implementation code is publicly available under MIT license. All OpenZeppelin tooling code is publicly available under AGPL 3.0 license.

**Adoption Criteria (Year 2):**

The Canton Foundation and Digital Asset will continue to facilitate introductions to new and existing ecosystem teams throughout Year 2\.             

- At least **17 additional independent Canton projects** (20 cumulative) have imported or integrated OpenZeppelin Contracts Library components, confirmed via written attestations or verifiable on-chain/repository evidence.  
- At least **8 external adoption events across the Reference Implementation portfolio**, where a fork, deployment, or use as a foundation by an external team each count as one event, confirmed via public repository evidence or written attestations. Events may be distributed unevenly across RIs, reflecting that some use cases attract broader adoption than others.  
- Published Year 2 Adoption Report documenting cumulative usage, ecosystem feedback, and measurable impact.

---

# Acceptance Criteria

The Tech & Ops Committee will evaluate completion of each milestone based on:

**Code Quality:**

- All library code and Reference Implementation code published in public GitHub repositories under MIT license. All OpenZeppelin tooling code published under AGPL 3.0 license.  
- All pull requests require 2 code reviews by OpenZeppelin team members; public contributor PRs accepted.  
- 90% code coverage with automated tests integrated into CI/CD pipeline; 100% test pass rate required for every merge.  
- All code compiles against the current Daml SDK version.

**Security:**

- Security audit reports published alongside every audited release.  
- All critical and high severity findings resolved before release.  
- Security audits conducted by OpenZeppelin's dedicated research team, amplified by AI-augmented analysis.

**Documentation:**

- Comprehensive documentation for every library component and Reference Implementation published on OpenZeppelin Documentation.  
- Contracts Wizard updated for each new library component.

**Adoption (Milestones 4 and 8):**

- Written attestations from independent Canton projects confirming library usage, or verifiable on-chain/repository evidence.  
- Published adoption reports.  
- Attestations must come from entities independent of OpenZeppelin.

**Project-Specific Conditions:**

- The project must remain scoped to open-source, reusable ecosystem infrastructure.  
- Year 2 Reference Implementation topics are defined through the 12-Month Scope Review and must be agreed upon with the Canton Foundation before work begins.  
- OpenZeppelin will attend at least 1 quarterly community feedback session per quarter throughout the engagement.

---

# Funding

## Total Funding Request

**Total: 28,378,378 CC**

## Payment Breakdown by Milestone

*CC amounts below use a 30-day average CC/USD price of $0.148 calculated on April 28, 2026, and will be recalculated upon committee approval of this proposal.*

| Milestone | Reference Implementations | Contracts Library | Security | Dev Enablement | Subtotal | % of Total | Trigger |
| :---- | :---- | :---- | :---- | :---- | :---: | :---: | :---- |
| **M1** (Q1) | Research and Design | CIP-56, CIP-86, CIP-103, CIP-104 | Audits, Continuous Coverage | Included | 2,128,378 CC | 7.5% | Committee acceptance |
| **M2** (Q2) | RI 1: DEX | Vaults, Hooks, RBAC, Timelock/Pause | Audits, Reviews, Pen Tests | Included | 2,128,378 CC | 7.5% | Committee acceptance |
| **M3** (Q3) | RI 2: Lending | NFTs, Multi-Sig, Credentials, Wizard, AI Tools | Audits, Reviews, Pen Tests | Included | 2,128,378 CC | 7.5% | Committee acceptance |
| **M4** (Q4, End Y1) | RI 3: Cross-Chain, RI 4: Auction | Messaging Gateway, Additional Standards | Audits, Reviews, Pen Tests | Included | 7,804,054 CC | 7.5%(Delivery)<br>20% (Adoption) | Committee acceptance AND adoption criteria |
| **M5** (Q5) | RI 5 (TBD) | Staking, Additional Standards | Audits, Reviews, Pen Tests | Included | 1,418,919 CC | 5% | Committee acceptance |
| **M6** (Q6) | RI 6 (TBD) | Vesting, Auctions, Developer Tools | Audits, Reviews, Pen Tests | Included | 1,418,919 CC | 5% | Committee acceptance |
| **M7** (Q7) | RI 7 (TBD) | Additional Standards | Audits, Reviews, Pen Tests | Included | 1,418,919 CC | 5% | Committee acceptance |
| **M8** (Q8, End Y2) | RI 8 (TBD) | Additional Standards | Audits, Reviews, Pen Tests | Included | 9,932,433 CC | 5%(Delivery)<br>30% (Adoption) | Committee acceptance AND adoption criteria |

**Payment Weighting by Year:** Year 1 is weighted 60% delivery / 40% adoption. Year 2 is weighted 40% delivery / 60% adoption. Overall split across the full engagement is 50% delivery / 50% adoption.

## Early Completion Bonus

| Tier | Condition | Bonus | Amount |
| :---- | :---- | :---: | :---: |
| Delivery acceleration | All delivery milestones in year completed 1 month ahead of schedule | 15% of that year's adoption payout | 851,351 CC (Y1) / 1,277,027 CC (Y2) |
| Adoption over-performance | Adoption criteria met with 2x the required independent integrators | 15% of that year's adoption payout | 851,351 CC (Y1) / 1,277,027 CC (Y2) |

Early completion bonuses are mutually exclusive per year.

## Volatility Stipulation

This proposal spans 24 months, significantly exceeding the 6-month threshold for fixed Canton Coin denomination. To address CC/USD price volatility:

- **Quarterly Rebase:** At the beginning of each calendar quarter, the CC amount for that quarter's milestone is recalculated based on the 30-day moving average CC/USD price as of that date using Coingecko.  
- **Mechanism:** The USD value of each milestone is fixed at grant approval. The CC amount for each milestone is computed by dividing the fixed USD value by the 30-day moving average CC/USD price, sourced from Coingecko, at the start of the quarter in which the milestone is expected to be delivered.  
- **Effect:** This locks in the USD-equivalent value of each milestone and limits volatility exposure to one quarter. OpenZeppelin carries the price risk within each quarter.  
- **Rebasing occurs automatically** and does not require a committee vote. The committee retains the right to review the calculation methodology.

## Billing and Payment Terms

OpenZeppelin will issue an invoice on the first day of each calendar quarter for that quarter's milestone. Payment is expected upon milestone delivery and committee acceptance. If the milestone is accepted before the quarter ends, payment is due on the day of acceptance. 

## 12-Month Scope Review and Termination Provisions

- **12-Month Scope Review:** At the end of Quarter 4, OpenZeppelin and the Canton Foundation will conduct a joint review to align Year 2 priorities with evolving ecosystem needs. Year 2 Reference Implementation topics and any library roadmap adjustments will be agreed upon before Year 2 work begins.  
- **No-Fault Termination:** The Foundation maintains the right to terminate the engagement at the end of any quarterly performance period or at the 12-month mark should strategic priorities shift. In this case, OpenZeppelin is compensated for all accepted milestones to date.  
- **Termination for Breach:** The Foundation may invoke termination if OpenZeppelin fails to remedy a material breach within fifteen (15) business days after receipt of written notice.

---

# Co-Marketing

OpenZeppelin will coordinate with the Canton Foundation on the following, at no additional cost to the fund:

- **Release Announcements:** Tailored announcements for each milestone release across OpenZeppelin's blog, documentation, and social channels (58.5K X followers, 14.5K LinkedIn followers, \~150K monthly doc views).  
- **Technical Workshops:** At least 1 technical workshop at a Canton flagship event and 1 at a strategic industry conference per year.  
- **Hackathon Support:** Coaching, mentorship, and workshops at Canton-hosted hackathons and incubators.  
- **Community Feedback Sessions:** At least 1 per quarter via community calls, X-spaces, Discord, or developer office hours.  
- **Dedicated Canton Network Page** on [openzeppelin.com](https://www.openzeppelin.com) serving as a central hub for Canton developers.  
- **Content and Tutorials:** In-depth technical tutorials and step-by-step guides for each Reference Implementation release.  
- **Dedicated Technical Account Manager** for the Canton Foundation throughout the engagement.

These activities directly support the adoption milestones by driving developer awareness, onboarding, and library uptake across the Canton ecosystem.

---

# Maintenance

All code produced under this grant will be published as open source: the Contracts Library and Reference Implementations under the MIT license, and OpenZeppelin tooling under the AGPL 3.0 license. OpenZeppelin has a demonstrated track record of maintaining open-source contract libraries as long-term public goods across Ethereum (10+ years), Starknet, Stellar, Arbitrum, and others.

Post-grant maintenance of the Canton Contracts Library will follow the same model: OpenZeppelin will continue to maintain the library as part of its open-source portfolio. Should the Canton Foundation require a formal maintenance commitment beyond the grant period, this can be structured as a separate recurring maintenance grant.

---

# Rationale

## Why a Single Bundled Grant

The Reference Implementations and Contracts Library are tightly coupled: the library provides the reusable primitives, and the RIs demonstrate how to compose them into production applications. Separating them risks approving one without the other, undermining the value of both. The security audit workstream ensures every release meets the quality bar the ecosystem expects from OpenZeppelin. Bundling all three into a single proposal ensures the grant delivers a complete, self-contained ecosystem contribution.

## Why OpenZeppelin

OpenZeppelin has replicated this exact model across 9 ecosystems over 10 years. In each case, the libraries became the standard foundation developers build on:

- \~85% market penetration in top 50 DeFi protocols on Ethereum  
- $175B+ in TVL importing OpenZeppelin Contracts

With a growing customer base that includes Uniswap, DTCC, and WisdomTree, and as the primary security partner for financial institutions, Canton gains the opportunity to leverage the strength and trust associated with the OpenZeppelin brand for a joint go-to-market strategy to access new opportunities both in DeFi and TradFi.

## Why 24 Months

Building a comprehensive contracts library and 8 Reference Implementations is a multi-year undertaking. Our experience across other ecosystems (Ethereum, Starknet, Stellar) shows that Year 1 is primarily build and establish, while Year 2 is when adoption compounds as the library reaches critical mass. The 12-month scope review and no-fault termination provide the Foundation with clear off-ramps if priorities change.

---

# Open Source

All code produced under this grant will be released as open source:

- **Contracts Library**: Released under the MIT license, freely available for any Canton developer to import, use, and build upon without restriction.  
- **Reference Implementations:** Released under the MIT license, enabling Canton builders to fork, adapt, and commercialize freely while contributing to ecosystem standardization.  
- **OpenZeppelin Tooling:** Released under the AGPL 3.0 license, ensuring tooling derivatives remain open source and contribute back to the ecosystem.                                               

All development will be conducted in public GitHub repositories under the OpenZeppelin organization, with full transparency into the development process, code reviews, and CI/CD pipeline.       

