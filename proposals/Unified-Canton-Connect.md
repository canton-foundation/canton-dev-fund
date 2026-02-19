## Development Fund Proposal: Unified Canton Connect (UCС) — Open-Source Wallet SDK

**Author:** Vladimir Understanding 

**Status:** Draft 

**Created:** 2026-02-19  

---

## Abstract
Project Name: Unified Canton Connect (UCC)
Category: Developer Tools / Infrastructure (Public Good)

The Unified Canton Connect (UCC) is a universal, open-source integration SDK designed to solve the problem of wallet fragmentation within the Canton Network. Currently, the ecosystem lacks a standardized way for dApps to connect with the diverse array of Canton-compatible wallets (Canton Loop, institutional gateways, and private validator nodes). This creates a high technical barrier for developers and a confusing experience for users.

Problem Statement: The "N-to-M" Integration Trap
Currently, every new dApp developer on Canton faces an exponential integration problem. If there are N dApps and M wallets, the ecosystem requires N x M individual integrations. This creates a fragmented user experience and a high barrier to entry.
The Unified Canton Connect (UCC) transforms this into a 1-to-N model: developers integrate one module, and users gain access to all wallets.

The UCC delivers a "plug-and-play" module that any developer can add to their application to instantly support all CIP-103 compliant wallets. Key value drivers for the ecosystem include:
- Accelerated Adoption: Reduces dApp "Time-to-Market" by eliminating the need to build custom wallet integrations.
- User Sovereignty: Allows users to interact with any application using their preferred wallet provider, fostering a truly interconnected network.
- Institutional Readiness: By providing an audited, open-source standard, UCC ensures that enterprise and retail applications meet the highest security requirements.
- Community Ownership: The project will be hosted on the Canton Foundation’s GitHub, ensuring it remains a permanent, neutral, and evolving asset for all network participants.

---

## Specification

### 1. Objective
The goal is to provide a headless, programmatic abstraction layer for Canton Network interactions.
The Problem: Developers currently have to write boilerplate code to handle different connection strings, validator node addresses, and authentication flows for various wallets. There is no unified "connector" logic that works out-of-the-box for every wallet provider.
The Outcome: A pure Logic SDK (Software Development Kit). Developers import this module into their codebase to handle all wallet communication logic. It will act as the "standard library" for wallet-to-dApp interaction, allowing any app to be "wallet-agnostic."

### 2. Implementation Mechanics
The Unified Canton Connect (UCW) will be delivered as a pure Open-Source Code Library (SDK) hosted on GitHub.
- Integration Method: Developers can add the module to their project via standard package managers (NPM/Yarn) or by cloning the source code directly from the Canton Foundation GitHub repository.
- Logic Abstraction: The module contains the pre-written logic for the CIP-103 (dApp API) protocol. Instead of every developer writing their own code to handle JSON-RPC requests to wallets, they use the standardized functions provided in this module.
- Built-in Wallet Adapters: The code will include a directory of "Adapters." Each adapter is a specific piece of code designed to communicate with a different wallet (e.g., Canton Loop, Console, etc.).
- Standardized Request Flow: The module provides a unified way to:
  1. Identify and trigger a connection to any supported wallet gateway.
  2. Pass transaction data to the wallet for signing.
  3. Receive the signed payload back to the application.
- Zero Dependencies: The code will be lightweight and "headless," meaning it contains no visual elements. This ensures it can be integrated into any application (web, mobile, or server-side) without bloating the project or causing version conflicts.

### 3. Architectural Alignment
- Public Infrastructure: By hosting the code on the Canton Foundation GitHub, we ensure the module is a "Public Good." It is not a private product but a shared piece of infrastructure.
- CIP-103 Strict Adherence: The code serves as a reference implementation for the Canton dApp API standard, ensuring all integrations are technically "correct" by network standards.
- Open Contribution Model: The module is designed so that when a new wallet is released, the wallet's creators can simply submit a Pull Request to the repository to add their connection logic to the "Adapters" directory.

### 4. Backward Compatibility
No backward compatibility impact. This module provides a new, streamlined way to implement existing protocols.

---

## Milestones and Deliverables

### Milestone 1: _Core Module Development & Initial Adapters_
- **Estimated Delivery:**  2 Months
- **Focus:**  Writing the core logic for the CIP-103 protocol and the first set of wallet adapters.
- **Deliverables / Value Metrics:**  Full source code for the SDK published on GitHub. Integration of the top 10 (or more) existing Canton wallets/gateways. Technical documentation (README) explaining how to import and call the code.

### Milestone 2: _Security Audit & Foundation Transfer_
- **Estimated Delivery:**  1 Month
- **Focus:**  Ensuring the code is safe for financial applications and moving it to the official organization.
- **Deliverables / Value Metrics:**  Third-party security audit report. Successful transfer of repository ownership to the Canton-Foundation organization. "Wallet Adapter Template" for other developers to contribute new wallets.

### Milestone N: _12-Month Maintenance & Ecosystem Monitoring_
- **Estimated Delivery:**  12 Months (Ongoing)
- **Focus:**  Keeping the code updated and adding new wallets as they launch.
- **Deliverables / Value Metrics:**  Regular updates to the source code to support new Canton Network versions. Integration of new wallets via active monitoring or reviewing Pull Requests.Bug fixes and community support via GitHub Issues.

---

## Acceptance Criteria
- Code is fully functional and compatible with the latest Canton Network release.
- Successful demonstration of a dApp connecting to multiple different wallets using only the UCW module.
- Audit report confirming no security vulnerabilities in the connection logic.
- Repository is live and accessible under an open-source license (MIT/Apache 2.0).

---

## Funding

**Total Funding Request:**   40,000 USDC / 255,000 CC

### Payment Breakdown by Milestone
- Milestone 1 _Core SDK_: 40% CC upon delivery of functional code - 15.000 USDC - Deep integration with Splice Wallet Kernel, implementation of CIP-103, and building the adapter logic.
- Milestone 2 _Security & Transfer_: 40% CC upon completion of audit and GitHub transfer - 15.000 USDC - External security audit, GitHub transfer, and documentation.
- Milestone 3 _Maintenance_:  20% CC paid quarterly for ongoing maintenance and wallet updates - 10,000 USDC - One year of "on-call" updates for new Canton versions and pro-active addition of new wallet providers.

### Volatility Stipulation
The project duration is greater than 6 months (due to the 12-month maintenance phase).
The grant is denominated in fixed Canton Coin (CC) based on the exchange rate at the time of approval. As per the template, a re-evaluation of the remaining Milestone 3 funds will be requested at the 6-month mark to account for significant CC/USD price volatility, ensuring the long-term sustainability of the maintenance phase.

---

## Co-Marketing
Upon release, the implementing entity will collaborate with the Foundation on:

- Announcement coordination: A joint press release and social media campaign (X/LinkedIn) highlighting the launch of the first universal wallet connector for Canton.
- Case study or technical blog: A detailed technical article titled "How to achieve multi-wallet compatibility in 5 minutes", published on the Canton blog or Medium.
- Developer or ecosystem promotion: Active promotion of the SDK within the Canton and Daml developer communities (Discord, Telegram).

Specific Commitments:
- Interactive Demo dApp: I will provide a live, open-source sample application hosted on GitHub Pages that demonstrates how the SDK handles switching between multiple different wallet providers in real-time.
- Developer Workshop: I commit to hosting one technical webinar or "Office Hours" session for the Canton community to walk developers through the integration process and answer technical questions.
- Documentation Suite: Production of high-quality "Quick Start" guides and API reference documentation to ensure a frictionless "copy-paste" experience for new developers.
- Wallet Provider Outreach: I will proactively reach out to existing wallet teams in the ecosystem to assist them in writing their specific adapters for the SDK, ensuring the module is populated with providers from day one.

---

## Motivation
The motivation for this project stems from my role as a Canton Network Validator and a long-standing commitment to building scalable, interconnected systems. As a validator, I see firsthand the friction that occurs when the network’s technical potential is throttled by a fragmented user experience.
Why this is valuable to the Canton ecosystem:
- Solving the "Last Mile" Problem: Canton is a powerful, privacy-preserving network, but its "last mile" — the connection between the user’s wallet and the dApp — is currently broken. By providing a universal, open-source SDK, we remove the final barrier to mass adoption.
- Validator-Driven Infrastructure: As a validator (GitHub: Antropocosmist), my motivation is the health and throughput of the entire network. This module is not a commercial product; it is a public utility designed to increase transaction volume by making it easier for users to interact with any dApp.
- Strategic Unity: In a decentralized network, fragmentation is the greatest risk. This project introduces a "unifying logic" that allows diverse wallet providers to coexist while giving developers a single standard to follow. It ensures that the ecosystem grows as a coherent whole rather than a collection of isolated silos.
- Expected Adoption: We expect this SDK to become the default integration standard for all new dApps entering the Canton Network. By hosting the code on the Foundation’s GitHub, we provide the community with a "sovereign" tool that they can trust, audit, and evolve collectively.
- Philosophical Alignment: My work as "Vladimir Understanding" has always focused on creating systems that enhance human agency and connectivity. This SDK is a digital manifestation of that goal — creating a transparent, open, and frictionless bridge between technology and the person using it.

---

## Rationale
Why is this the right approach?
- Source-Code Sovereignty: Unlike a centralized service, this is a pure code module. It resides within the apps themselves, ensuring there is no single point of failure and no "middleman" taking fees or tracking user data.
- Leveraging Existing Standards: We are not "reinventing the wheel." We are taking the official CIP-103 protocol and wrapping it into a developer-friendly, ready-to-use package. This ensures 100% compatibility with the Canton core.
- Open-Source as a Safety Net: By committing the result to the Canton Foundation, we eliminate "Key Person Risk." As a validator, I am initiating this project to serve as the seed for a community-driven library that will outlive any single developer's involvement.
- Efficiency: It is strategically smarter to fund one high-quality, audited universal connector than to have dozens of teams struggle with individual wallet integrations, leading to potential security vulnerabilities and poor UX.

--

