## Development Fund Proposal

Author: Parthasarathy Ramanujam  
Status: Draft
Created: 2026-03-16

### Abstract

This proposal aims to design, develop and deploy an agentic wallet infrastructure on the Canton Network that enables automated payment workflows, simplified onboarding and enterprise-grade transaction flows.

The system will allow users to create and access wallets using phone number-based authentication, initially with [Vodafone](https://www.vodafone.com/) and [Twilio](https://www.twilio.com/), with a scalable architecture designed to support additional telecom providers such as [Telefonica](https://www.telefonica.com/en/communication-room/press-room/telefonica-tech-promotes-digital-identity-management-insurance-sector-spain/). The integration of phone number-based authentication serves as a key differentiator of the proposed wallet, enabling identity-linked accounts that support account recovery, customer interaction, and compliance workflows, including use cases where KYC is required.

At the core of the solution is a programmable wallet architecture powered by smart contracts, enabling agent-assisted transactions. These agents operate within defined rules and permissions to execute multi-step financial operations, recurring payments, and merchant settlement flows without requiring users to manually initiate each transaction.

In addition to wallet infrastructure and agent-assisted payment workflows, the proposal introduces a privacy-preserving framework for counterparty risk verification using zero-knowledge (ZK) proofs.

Canton Network is designed for institutional and regulated financial applications, where participants must manage credit exposure, collateral adequacy, and solvency requirements. However, Canton’s privacy model, where only relevant parties can view contract data, makes it difficult for third parties such as regulators, clearing entities, or counterparties to independently verify risk conditions without accessing sensitive trade details.

### Executive Summary

This proposal aims to bring millions of institutional users to **Canton Network** by enabling a new class of authenticated autonomous financial agents.

As AI agents increasingly manage tasks on behalf of individuals and institutions, the next frontier is agents autonomously managing financial transactions. Stablecoins have emerged as the primary payment rail for this **agentic economy**, enabling software agents to transact globally without relying on traditional banking infrastructure.

Institutional adoption of stablecoins is projected to account for **45%** of the **$46T** market in **2026,** growing to **73%** of an estimated **100T** annual volume by **2030**, with Agentic AI responsible for **$56.4T** of this transaction volume.

At the same time, counterparty risk remains a major constraint in financial markets. Global banks hold more than **$4.5**T in exposure to non-bank financial institutions, highlighting the systemic risks created by interconnected financial relationships. **Zero-knowledge proofs** (ZKPs) offer a solution by enabling institutions to verify solvency and exposure limits without revealing sensitive balance-sheet data, Adoption of ZKPs verification technologies is expected to accelerate as the global ZK market grows from **\~$1.3B** today to over **$7B** by 2033\.

Our proposal introduces **authenticated autonomous AI agents** capable of operating within privacy-preserving financial systems on Canton.

#### **Agentic integrations**

**Milestone 1 – Agent Authentication Infrastructure**  
Phone-number–based authentication for autonomous agents within wallets, developed in collaboration with **Vodafone (380M+** users globally**)** and **Twilio (10M+** developers/users**)**.

**Milestone 2 – Wallet Agent Integration**  
Integration of autonomous agents within **Pillar Wallet / PillarX (250k+** users**)** and **OpenClaw (2.8M** agents**)**.

**Milestone 3 – Institutional RWA Integration**  
Integration with real-world asset (RWA) applications including platforms developed by **Lloyds (21M+** users**)**.

#### **Privacy Preserving Risk Management** 

**Milestone 4 – Risk Model & Commitment Framework**  
Framework for assessing counterparty risk and defining exposure commitments.

**Milestone 5 – Privacy-Preserving Risk Verification**  
ZK-based verification of counterparty risk exposure across institutional networks.

**Milestone 6 – Third-Party Verification & Regulatory Integration**  
Independent verification and alignment with regulatory reporting frameworks.

### Use Cases 

In the Canton Network ecosystem of **2026**, your agentic wallet uses **PhoneID** to bridge the gap between traditional identity and autonomous financial operations. By collaborating with a major mobile provider, your wallet treats the phone number as a cryptographically verifiable anchor for **Daml** smart contracts.

#### 1\. Automated Repo/Cash Sweeps

In this model, the agent acts as an autonomous treasury manager. The **PhoneID** serves as the non-repudiable "Intent Mandate". 

* **Policy-Based Trigger:** The user sets predefined "Policy Controls" (e.g., "maintain exactly $50k in my cash account; sweep any surplus into intraday repos").  
* **PhoneID Authentication:** When the agent detects surplus cash, it initiates a transaction. The **PhoneID service** generates a secure, one-time cryptographic proof linked to the user’s SIM/Device. This proof is passed to the **Daml contract** to prove the agent has the legal authority to move those specific funds.  
* **Atomic Execution:** On Canton, the repo (collateral leg) and the cash sweep (cash leg) happen **atomically** and **intraday**. The agent settles the trade in seconds, moving tokenised deposits (e.g., LSEG DiSH cash) in exchange for tokenised Gilts or Treasuries.  
* **Efficiency:** This eliminates the 1–2 day settlement lag typical in traditional markets, allowing the user's balance sheet to be "recycled" multiple times a day for maximum yield. 

#### 2\. RWA Rebalancing & Dividends

For Real-World Assets (RWAs), the agent uses the **PhoneID** as a persistent, KYC-compliant identifier across different institutional subnets.

* **RWA Rebalancing:**  
  * **Drift Detection:** The agent monitors the portfolio. If a tokenised fund drifts \+5% from its target allocation, the agent triggers a rebalance.  
  * **KYC Portability:** Because the **PhoneID** is verified by a Tier-1 provider, it acts as a "Verifiable Credential". The agent can jump from a Goldman Sachs RWA service to a different provider's liquidity pool without the user needing to re-KYC at every stop.  
* **Dividend Distributions:**  
  * **Eligibility Check:** When an RWA issuer (like an equity or bond fund) pays a dividend, the smart contract checks the **PhoneID** linked to the wallet address to ensure the recipient is still a valid, verified resident of a permitted jurisdiction.  
  * **Automated Reinvestment:** Upon receipt of the dividend (in tokenised cash), the agent immediately checks its "Reinvestment Policy." If instructed, it automatically buys more of the underlying RWA or sweeps the dividend into a high-yield repo, all authenticated via the background **PhoneID** token without requiring a manual push notification for the user. 

  ##### Summary of the Workflow

1. **Identity:** User links **PhoneID** (Mobile Provider), **Agentic Wallet** (App Provider).  
2. **Consent:** User signs a high-level **Daml Intent Mandate** (OpenClaw access to 100k agents customised for use in the Canton ecosystem) authorizing the agent for specific tasks.  
3. **Action:** Agent monitors **Canton Network** data (yields, drifts, cash levels).  
4. **Verification:** Agent signs transactions using a sub-key; the **PhoneID service** provides the "KYC anchor" to the smart contract.  
5. **Settlement:** Canton executes the trade **atomically** with 24/7 availability. 

#### 3\. B2B2C Overnight Yield Optimization

In this model, a **Bank (B1)** or **Digital Asset Manager** provides a white-label yield engine to a **Fintech/Corporation (B2)**, which then offers an "interest-on-stables" feature to the **Retail Consumer (C)**.

* **The Institution (B1 \- e.g., Hashnote or Lloyds)**: Operates a validator node and issues a yield-bearing asset like **US Yield Coin (USYC)**.  
* **The Intermediary (B2 \- e.g., A White-label Wallet Provider)**: Integrates the institution's API to manage customer "stablecoin" balances.  
* **The Consumer (C)**: Holds a standard USD-pegged stablecoin (like USDC) in a digital wallet. 

  ##### The Workflow: "The Auto-Sweep"

* **Daily Activity**: The consumer uses USDC for daily transactions.  
* **Overnight Sweep**: At a set "cut-off" time (e.g., 6:00 PM), the **OpenClaw** agent or a Daml smart contract identifies "idle" USDC in the wallet.  
* **Atomic Swap**: The system executes an **atomic swap** on the Canton Network, exchanging the idle USDC for **USYC** (which invests in reverse-repo activities on government bonds).  
* **Yield Accrual**: While the consumer sleeps, the USYC balance earns a risk-free return (based on T-bill rates).  
* **Instant Liquidity**: At 8:00 AM, or whenever a payment is initiated, the agent swaps the USYC back into USDC instantly, providing the user with their principal plus the overnight interest. 

**Lloyds Banking Group’s 2026** strategic targets, which aim for over **£100 million** in incremental value from **next-generation AI**. It is already deploying **Agentic AI to 21 million customer accounts** in early 2026\. 

### 

### Specification

#### 1\. **Objective**

**1.1 Lack of identity-linked wallet infrastructure**

Existing wallets on the Canton Network do not currently provide identity-linked accounts based on phone number authentication. This limits the ability to support merchant, enterprise, and compliance-oriented use cases that require identifiable user interactions.

This project introduces phone number-based authentication to enable identity-linked accounts and support use cases where KYC or verified user identity is required.

**1.2. Limited support for automated payment workflows**

Many wallets are built for manual, single transactions, while businesses require recurring payments, conditional transactions and automated settlement.

This project enables agent-assisted transaction workflows that reduce manual steps and better match real-world financial operations.

**1.3. Complexity of integrating blockchain payments for merchants**

Merchants and service providers often face operational complexity when integrating blockchain payments and managing users.

This project provides infrastructure designed to support enterprise and commercial transaction environments, making these integrations more practical.

**1.4. Limited ability to verify counterparty risk while preserving privacy**

Canton’s privacy model ensures that contract data is visible only to relevant parties. While this protects confidentiality, it limits the ability of third parties, such as regulators, clearing entities, or counterparties, to independently verify exposure limits, collateral adequacy, or contract solvency without accessing sensitive trade details.

This proposal introduces a privacy-preserving framework using zero-knowledge proofs to enable verifiable counterparty risk checks without revealing underlying transaction data, supporting institutional, RWA, and regulated financial use cases on Canton Network.

#### **2\. Implementation Mechanics**

The project will build on proven components and existing tools, including [PillarX Wallet](https://pillarx.app/) infrastructure, reducing development risk and accelerating time to deployment. By reusing battle-tested wallet components and integrating them with Canton’s architecture, the project focuses resources on advancing functionality rather than rebuilding basic infrastructure.

The implementation will also explore and contribute to emerging standards relevant to programmable payments, identity and interoperability, including:

- [ERC-8004](https://eips.ethereum.org/EIPS/eip-8004) (agent-related transaction workflows and automation concepts). The implementation will align with any existing Canton-native equivalent to ERC-8004. If none exists, the team will create a Canton improvement proposal for agent service discovery and interaction;

- [x402](https://www.x402.org/) (emerging approaches to payment and service interaction standards);

- [AP2](https://cloud.google.com/blog/products/ai-machine-learning/announcing-agents-to-payments-ap2-protocol) and related payment or authorization frameworks.

### Zero-Knowledge Counterparty Risk Framework

The project will implement a privacy-preserving mechanism that allows counterparties or third parties to verify risk conditions without accessing confidential transaction data. Relevant contract information will be retrieved through the Canton Ledger API and converted into a cryptographic commitment representing the current financial state. A zero-knowledge proof will then be generated to demonstrate that predefined conditions (such as exposure limits or collateral adequacy) are satisfied.

Proof verification will take place off-chain, while a Daml smart contract on Canton records proof attestations, timestamps, and verification results. This design preserves Canton’s privacy model while enabling independent verification required for institutional and regulated financial use cases.

### Architectural Alignment

This project aligns with the Canton Network’s architecture by operating at the application layer and leveraging smart contract workflows to enable identity-linked and automated payment interactions without changes to core protocol components. The PillarX Wallet will add support for the Canton Network.

The implementation will align with relevant Canton Improvement Proposals, including the Canton dApp Standard (CIP-0103). If no Canton-native equivalent to ERC-8004 exists, the team will explore contributing a proposal for agent service discovery through the CIP governance process.

The zero-knowledge counterparty risk framework also operates at the application layer. Contract state will be accessed via the Canton Ledger API, with proof generation and verification performed off-chain. Proof attestations will be recorded through Daml smart contracts, ensuring compatibility with Canton’s privacy model while avoiding any modifications to consensus or validator infrastructure.

### Backward Compatibility

No backward compatibility impact.

### Milestones and Deliverables

#### **Phase 1**

1. **Milestone 1: Phone Number Authentication for Wallets and Agents**

   **Estimated Delivery:** April 13, 2026\.

   

   **Focus:** implement phone number authentication to enhance security and usability, particularly for agent-based transactions where agents represent users for purchases.

   

   **Deliverables / Value Metrics:**  
    

- Combine phone number-based authentication with wallet-based transaction authorization to enable identity-linked accounts.  
- Enable identity-linked accounts that support transaction authentication (in conjunction with [Vodafone](https://developer.vodafone.com/identity) — already hosting a node on Canton, and [Twilio’s Verify API](https://www.twilio.com/en-us/user-authentication-identity/verify) — API provides wider access to other telecom operators globally).


  This integration could significantly expand the Canton ecosystem by leveraging existing telecom infrastructure, as **Vodafone** serves over **380 million** consumer subscribers globally, and **Twilio’s** infrastructure provides access to an additional **10+ million** users.


  Given the central role of mobile phones in financial transactions, linking wallet authentication to telecom identity infrastructure can drive wider adoption of Canton-based applications and support large-scale consumer and enterprise use cases.


  Especially valuable for B2C onboarding and merchant services.


- Pluggable Agent Service Discovery:   
  \- Merchants discover and use agent services via a new ERC.   
  \- Develop a framework for experimenting with agents and wallet integration.

2. **Milestone 2: Pillar Agentic Wallet Integration live on Canton**

   **Estimated Delivery:** May 11, 2026\.

   

   **Focus:** deliver wallet integration and deployment on Canton, enabling end users and service providers to interact through phone number-based identity for service discovery and transactions, leveraging existing infrastructure such as PillarX Wallet.

   

   PillarX will come with 10 AI Agent verticals that perform various tasks out of the box, such as:

- A trading bot that can be active on a whitelisted basis.  
- A tokenisation bot that works on the RWA compliance.  
- A trading signal bot that can be customised to any market the user is interested in.  
    
  **Deliverables / Value Metrics:**  
    
- Support for end users and service providers interacting through the wallet.  
- Use of wallet and phone number–based identity to enable service discovery and transactions.  
- Leveraging existing tools and infrastructure (such as PillarX Wallet).

3. **Milestone 3: Integration of an RWA Application within the Wallet**

   **Estimated Delivery:** Jun 8, 2026

   

   **Focus:** integrate an RWA application into the wallet, enabling direct access to RWA services and showcasing agent-assisted functionality in a real-world application.

   

   **Deliverables / Value Metrics:**

   

- Integrate an application (such as Pairpoint by Vodafone \+ [Lloyds](https://www.lloydsbank.com/) RWA platform) as an in-wallet app.  
- Enable wallet-based access to RWA services and transactions.  
- Showcase the use of agent-assisted functionality within a real-world application.

#### **Phase 2**

4. **Milestone 4: Risk Model & Commitment Framework**  
     
   **Estimated Delivery: 15th June 2026**  
     
   **Focus:** Define verifiable counterparty risk statements and implement the Canton state extraction and commitment pipeline.  
     
   **Deliverables / Value Metrics:**  
     
- Defined risk metrics (net exposure, collateral coverage)  
- Canton Ledger API extraction workflow  
- Cryptographic commitment to the contract state  
- Demonstration of state anchoring on Canton

5. **Milestone 5: Privacy-Preserving Risk Verification**

   **Estimated Delivery: 15th July 2026**

   

   **Focus:** Enable verifiable proof of exposure thresholds without disclosing trade-level data.

   

   **Deliverables / Value Metrics:**

   

- Netting and collateral computation logic  
- zkVM-based proof generation workflow  
- Working proof demonstrating threshold validation

6. **Milestone 6: Third-Party Verification & Regulatory Integration**

   **Estimated Delivery: 30th July 2026**

   **Focus:** Enable regulators, counterparties, or clearing entities to independently verify risk compliance.

   

   

   **Deliverables / Value Metrics:**

- Off-chain verifier service  
- Daml attestation contract  
- End-to-end demonstration (extract \-\> prove \-\> verify \-\> record)

### Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

Deliverables completed as specified for each milestone  
Demonstrated functionality or operational readiness  
Documentation and knowledge transfer provided  
Alignment with stated value metrics

### Funding

Total Funding Request Phase 1: 1,250,000 CC (exchange rate 1 CC \= $0,16)  
Total Funding Request Phase 2: 1,250,000 CC

### Payment Breakdown by Milestone

#### Phase 1

**Milestone 1: Phone Number Authentication for Wallets and Agents:** 500,000 CC upon committee acceptance  
**Milestone 2: Pillar Agentic Wallet Integration live on Canton:** 437,500 CC upon committee acceptance  
**Milestone 3: Integration of an RWA Application within the Wallet**: 312,500 CC upon final release and acceptance

#### Phase 2

**Milestone 4: Risk Model & Commitment Framework:** 375,000 CC upon committee acceptance  
**Milestone 5: Privacy-Preserving Risk Verification:** 500,000 CC upon committee acceptance  
**Milestone 6: Third-Party Verification & Regulatory Integration:** 375,000 CC upon committee acceptance

### 

### Co-Marketing

Upon release, the implementing entity will collaborate with the Foundation on:

#### Announcement coordination

Case study or technical blog

#### Developer or ecosystem promotion

The team will actively support co-marketing and ecosystem promotion initiatives in collaboration with the Foundation. This includes participation in dedicated X Spaces, AMA sessions, online events and contributions to ecosystem reports, research publications, and educational or technical content aimed at developers and the broader community. The team is also open to collaborating on joint announcements, knowledge sharing and initiatives that help showcase the outcomes and impact of the project within the Canton ecosystem.

### Motivation

This project contributes to the Canton ecosystem by expanding the infrastructure available for enterprise-grade payment and transaction workflows, particularly in environments that require identity-linked accounts, automated financial operations and merchant integrations. Currently, identity-linked wallet functionality based on phone number authentication is not available within existing wallets on the Canton Network, creating a gap for merchant and compliance-oriented applications.

The proposed wallet introduces phone number-based authentication, enabling identity-linked accounts that support account recovery, customer interaction and compliance workflows. This approach provides an initial compliance and identity layer that can support use cases where KYC or verified user identity is required. 

Existing projects on the Canton Network that can benefit from this proposal include [Hecto Finance](https://hecto.finance/), [Lattice Finance](https://www.lattice.cash/), [Deploy Finance](https://deploy.finance/) and other ecosystem applications.  

In addition, institutional and RWA-focused applications on Canton require mechanisms to verify counterparty risk, including exposure limits, collateral adequacy, and contract solvency. While Canton’s privacy model ensures that contract data is visible only to relevant parties, it limits the ability of regulators, clearing entities, or counterparties to independently validate risk conditions without accessing sensitive trade data. The proposed zero-knowledge framework addresses this gap by enabling verifiable proof of predefined risk thresholds while preserving confidentiality. This strengthens Canton’s positioning as an infrastructure for regulated financial markets and enhances trust across institutional participants.

### Rationale

### The proposed approach extends Canton at the application layer through wallet infrastructure rather than introducing protocol-level changes, enabling faster adoption while maintaining compatibility with existing architecture. Phone number–based authentication was chosen to support identity-linked accounts and account recovery, addressing merchant and enterprise requirements where user identification and operational reliability are important.

### Agent-assisted transaction workflows enable automated and programmable interactions better suited to real-world financial use cases compared to purely manual transactions. The implementation will align with existing Canton standards where available, and if no equivalent to ERC-8004 exists, the team will explore contributing a Canton-compatible specification to support reusable ecosystem infrastructure.

### Additionally, the zero-knowledge counterparty risk framework is designed to operate at the application layer, avoiding modifications to Canton’s core protocol while enabling privacy-preserving verification of financial conditions. Rather than exposing sensitive trade data for regulatory or counterparty review, the approach allows participants to prove compliance with predefined risk thresholds through cryptographic attestations, preserving confidentiality while strengthening institutional trust.
