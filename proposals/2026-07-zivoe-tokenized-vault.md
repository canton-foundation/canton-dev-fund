## Development Fund Proposal: Tokenized Private Credit Vault

**Author:** Kristal Gruevski (Founder, GC), Jay Abbasi (Founder), & the Zivoe Team
**Status:** Draft
**Created:** 2026-07-03
**Label:** financial-workflows-composability
**SIG Alignment:** Financial Workflows & Composability
**[Champion](https://github.com/canton-foundation/canton-dev-fund/blob/main/sig-directory.md):** need Champion

---

## Abstract

Zivoe is building a private credit layer for stablecoin capital on Canton: a permissioned, privacy-preserving vault framework that enables qualified liquidity providers, stablecoin ecosystems, blockchain networks, funds, risk curators, qualified allocators, and private credit businesses to route stablecoin capital into curated, short-duration private credit strategies while preserving controlled disclosure, compliance workflows, and auditable settlement.

Zivoe's initial production implementation focuses on Merchant Cash Advance (MCA), revenue-based financing, and receivables exposure for small and medium-sized enterprises (SMEs), supported by a $1B+ annual origination pipeline across the U.S., U.K., Europe, and APAC, with more than three years of operating history through our strategic origination partner.

In early 2025, Zivoe launched zVLT, its first tokenized vault, on Ethereum. The platform has since grown to more than $7M in TVL across its private credit strategies and has generated performance to date exceeding 10% annualized returns.

Zivoe proposes to build, audit, open-source, and deploy a suite of Daml contracts for launching tokenized private credit vaults on Canton. The contract suite will include reusable components for permissioned participant onboarding, KYC/KYT-gated deposits, CIP-0056-compliant vault share issuance, redemption workflows, NAV-based pricing, settlement validation, treasury allocation workflows, and role-based administration.

This proposal is driven by near-term adoption pathways rather than speculative infrastructure. Unlike many infrastructure proposals, Zivoe intends to deploy this framework into an existing operating business with live assets, active qualified participants, established origination capacity, and demonstrated demand for tokenized private credit exposure.

Zivoe's MCA-focused vault would serve as the initial production implementation of this framework, demonstrating how Canton can support yield-bearing real-world assets, privacy-preserving private credit workflows, and reusable infrastructure primitives that future Canton builders can adapt for additional real-world asset strategies.

Zivoe is committed to building in public, and the Canton ecosystem can track our progress live on GitHub: https://github.com/Zivoe/zivoe-canton-prototype.

---

## Specification

### 1. Objective

Canton is well-positioned as an institutional blockchain environment for privacy-preserving finance, with architecture designed to support permissioned activity, controlled disclosure, and compliant asset workflows. This proposal seeks to extend those strengths into private credit by building and deploying a Canton-native tokenized private credit vault framework.

The objective is to enable qualified participants to access short-duration, yield-bearing private credit exposure through privacy-preserving, permissioned vault shares while supporting compliance-aware onboarding, controlled disclosure, auditable settlement, and institutional-grade operational workflows. The framework will support compliance-aware participant onboarding, controlled access, NAV-based pricing, redemption workflows, and reusable Daml components for future Canton-based private credit and real-world asset strategies.

Zivoe intends to use this framework to launch its MCA and receivables-focused strategy on Canton as an initial production implementation of the framework. The intended outcome is two-fold: to bring a cash-flowing private credit strategy to the Canton ecosystem for qualified participants; and, to contribute reusable open-source vault infrastructure that other Canton builders can reference, extend, or adapt for additional real-world asset strategies.

### 2. Implementation Mechanics

Zivoe will build a tokenized private credit vault system on Canton as a privacy-preserving private credit layer for stablecoin-funded capital, where qualified participants can access compliant, NAV-priced, short-duration credit exposure while preserving controlled disclosure and institutional confidentiality requirements. The system will allow qualified participants to deposit supported stablecoins, such as USDCx, into a vault contract in exchange for yield-bearing vault shares. These vault shares will be designed to align with the Canton Token Standard under CIP-0056 so that wallets, applications, and other Canton-native services can interact with them through a more uniform token interface.

At a high level, the system will include the following components:

**Vault**

The vault will manage deposits, vault share issuance, redemption requests, accounting, and participant balances. When a qualified participant deposits supported stablecoins into the vault, the contract will mint vault shares based on the current NAV per share. When a participant redeems vault shares, the contract will burn the relevant shares and process the redemption based on the vault's available liquidity, eligibility rules, and applicable approval requirements. The vault will be operated by an Issuer Role (signatory) and made visible to a select group of approved qualified participants (observers).

**Vault Share Token**

The vault share token will be designed to be CIP-0056 compatible, making it easier for wallets, custodians, and other Canton-native applications to integrate with the vault through a standardized token interface. Thus, over time, vault shares may support additional Canton-native workflows.

**Request-Based Minting and Redemption**

Vault share minting and redemption will use a request-based mechanism. This allows the vault to support both on-chain and off-chain validation logic before deposits or redemptions are finalized. For example, a participant may submit a request to deposit 1,000 USDCx, but the vault may require confirmation that the participant has passed KYC, KYT, AML, and eligibility checks before vault shares are minted. Similarly, redemption requests may be processed automatically up to defined thresholds, while larger redemption requests may require review or approval by an Issuer Role. For example, a vault may support the instant redemption of up to 500 USDCx, with larger redemption requests requiring manual approval. To preserve privacy, qualified participants would be signatories and only the Admin and Treasury would be observers.

**NAV-Based Pricing**

Vault share issuance and redemption will be governed by the vault's NAV per share. As the underlying private credit portfolio earns yield, NAV per share is expected to increase; if losses, impairments, fees, or other adjustments occur, NAV per share may decrease. The initial implementation may support NAV updates through an authorized Issuer Role at defined intervals, such as daily updates. The architecture may also support a NAV oracle model, where pricing data can be supplied on-chain at more frequent intervals by an approved oracle or data provider, such as Chainlink, Chronicle, or an equivalent provider.

**Treasury Contract**

Deposited stablecoins will flow into a treasury designed to hold and account for the vault's assets within the Canton environment. The treasury will operate pursuant to role-based permissions and will support the allocation of capital into on-chain or off-chain strategies, including the movement of capital into off-chain private credit assets where appropriate. This structure allows the vault to maintain clear separation between vault logic, asset accounting, and capital allocation workflows.

**Role-Based Administration**

The system will include role-based controls for operational functions such as NAV updates, treasury allocation, redemption approvals, participant eligibility updates, and administrative parameter changes. These roles will be implemented directly in Daml so that permissions and responsibilities are encoded into the contract logic rather than relying solely on off-chain operational processes.

**Open-Source Release**

Zivoe will release the core Daml contract suite under an open-source license, subject to applicable legal, regulatory, confidentiality, intellectual property, and security considerations. The open-source package is intended to serve as a practical reference implementation for future Canton builders seeking to launch tokenized vaults backed by private credit, receivables, trade finance, or other real-world asset strategies.

### 3. Architectural Alignment with Canton

A core design objective of the vault framework is to leverage Daml and Canton's authorization model to support privacy-preserving real-world asset workflows. Rather than relying solely on application-layer access controls, visibility and authorization are enforced directly at the contract level through Daml stakeholders, controllers, observers, and sub-transaction disclosure semantics.

The system will use role-scoped visibility to ensure that issuers, treasury operators, qualified participants, and approved counterparties only see the contracts and transaction details required for their role in a given workflow. For example, the vault contract may be visible to the issuer, treasury, and approved qualified participants, while mint and redemption requests would only be disclosed to the requesting qualified participants and the operational parties responsible for processing such requests.

Vault share holdings will be modeled as individual contracts rather than globally visible balances. This allows participants to observe their own balances, transfers, and activity without exposing that information to other parties on the network. Additionally, Daml sub-transaction privacy will limit disclosure of downstream settlement events to the stakeholders and authorizing parties involved in each workflow.

The proposed framework is designed to align with Canton's broader objective of enabling compliant, privacy-preserving financial infrastructure for institutional and real-world asset use cases. By embedding authorization, disclosure boundaries, and operational permissions directly into Daml contract logic, the system aims to support permissioned private credit workflows without exposing sensitive participant or treasury activity to unrelated parties on the network.

Additionally, the vault share token contracts are intended to align with the Canton Token Standard under CIP-0056, enabling standardized wallet and settlement integrations while preserving Canton-native privacy guarantees at the contract and workflow level.

### 4. Backward Compatibility

No backward compatibility impact. Zivoe will deploy new Daml packages on Canton. To the best of Zivoe's understanding, no existing Canton contracts, configurations, or workflows are modified.

---

## Milestones and Deliverables

### Milestone 1: DevNet Proof of Concept

- **Estimated Delivery:** 1-month post-approval
- **Focus:** Deliver a functional, end-to-end tokenized vault on Canton DevNet to demonstrate the core functionality of the contract suite. This milestone is intentionally scoped as a proof of concept: NAV updates are controlled directly by an authorized Issuer Role rather than through an oracle, and KYC/KYT enforcement is not yet integrated. The goal is to validate the core architecture and put working contracts in front of the Canton developer community as early as possible.
- **Deliverables:**
  - Full Daml contract suite implementing the core vault interface: minting requests, redemption requests, accounting, treasury, and role-based administration.
  - Unit and integration test suite (at least 80% coverage).
  - Contract suite deployed to Canton DevNet via a Zivoe-operated DevNet validator.
  - Public walkthrough or recorded demo showcasing the functionality of the vault on Canton DevNet.
  - Initial draft of developer documentation published for Canton ecosystem review.
- **Value To Canton Ecosystem:**
  - Demonstrates a functional Canton-native private credit vault.
  - Provides an initial reference implementation for privacy-preserving, compliance-aware private credit workflows on Canton.
  - Creates a test environment that Canton developers, reviewers, and qualified ecosystem participants can evaluate for future private credit use cases.

### Milestone 2: Audit-Ready DevNet Implementation

- **Estimated Delivery:** 2.5-months post-approval
- **Focus:** Expand the DevNet proof of concept into an audit-ready implementation. This milestone will complete the core contract architecture, integrate the KYC/AML compliance and NAV oracle adapters, deploy a minimal interface for interacting with the system on DevNet, and submit the contract suite for independent third-party audit.
- **Deliverables:**
  - Audit-ready Daml contract suite implementing the full vault framework.
  - KYC/KYT/AML compliance adapter.
  - NAV Oracle adapter.
  - Unit, integration, and workflow test suite with comprehensive coverage for core contracts and adapters.
  - Minimal frontend interface for interacting with the DevNet implementation, including deposit, redemption, and NAV update workflows.
  - Updated technical documentation describing the contract architecture, role permissions, compliance workflow, NAV workflow, treasury operations, and deployment process.
  - Contract suite submitted to a reputable third-party auditor for independent security review.
- **Value To Canton Ecosystem:**
  - Advances the project from a proof of concept to a complete audit-ready implementation of a Canton-native private credit vault framework.
  - Demonstrates how KYC/AML compliance checks, NAV-based pricing, and permissioned participant workflows can be implemented using Daml and Canton-native privacy controls.
  - Provides Canton developers and reviewers with a working DevNet implementation and technical documentation before the framework is finalized for TestNet and open-source release.

### Milestone 3: Audited Open-Source Release & TestNet Launch

- **Estimated Delivery:** 4-months post-approval
- **Focus:** Finalize the codebase following independent audit review, address material audit findings, deploy the remediated contract suite to Canton TestNet, and release the core framework as open-source infrastructure for the Canton ecosystem.
- **Deliverables:**
  - Independent third-party audit completed.
  - Audit report or summary published.
  - Address material audit findings.
  - Contract suite deployed to Canton TestNet via a Zivoe-operated TestNet validator.
  - Open-source release of the core Daml contract suite and supporting tooling under a permissive license, subject to applicable legal, regulatory, confidentiality, and security considerations.
  - Finalized developer documentation and integration guide enabling Canton builders to deploy and extend tokenized vault infrastructure using the framework.
  - Public walkthrough or technical demo showing the full TestNet implementation, including minting, redemption, NAV updates, KYC/KYT eligibility checks, treasury workflows, and role-based permissions.
- **Value To Canton Ecosystem:**
  1. Delivers a production-grade, independently audited Daml vault framework that Canton builders can adopt or extend for tokenized private credit, receivables, trade finance, or other real-world asset strategies converting Zivoe's work into reusable ecosystem infrastructure.
  2. Open-source release under a permissive license expands the pool of contributors who can review, harden, and improve Canton-native private credit infrastructure over time, consistent with CIP-0082's mandate to fund common-good infrastructure.
  3. Public audit report and disposition documentation contribute to the body of openly available Daml/Canton security research, benefitting auditors, reviewers, and developers across the ecosystem.

### Milestone 4: MainNet Launch

- **Estimated Delivery:** 7-months post-approval
- **Focus:** Launch production implementation of the vault framework on Canton Mainnet, a tokenized MCA vault backed by Zivoe's $1B+ origination pipeline. Demonstrate adoption through TVL growth, secondary market listings, and integrations with data providers.
- **Deliverables:**
  - MainNet deployment of Zivoe's MCA vault using the audited contract framework.
  - Production UI launched on zivoe.com for qualified participants.
  - Zivoe-owned MainNet validator operating in support of the vault deployment.
  - Grow vault TVL to at least $250,000 from qualified participants.
  - Launch a market for Zivoe's vault shares on a Canton-native DEX or liquidity venue (AskarDex, Tradecraft, or equivalent) with at least $100,000 in liquidity. Subject to DEX support and applicable legal, regulatory, and transfer restrictions.
  - Vault listed on at least one major public data provider, such as RWA.xyz, DeFiLlama, or an equivalent platform, to support ecosystem visibility and transparent tracking of vault activity.
  - Public launch announcement.
- **Value To Canton Ecosystem:**
  - Brings a live, yield-bearing private credit vault to Canton MainNet.
  - Demonstrates real usage through TVL, qualified participant onboarding, and secondary liquidity.
  - Creates a visible reference implementation for institutional Real-World-Asset (RWA) issuers evaluating Canton.
  - Shows that Canton can support not only compliant asset issuance, but also investable, composable, and liquidity-enabled private credit workflows.

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone
- Demonstrated functionality or operational readiness
- Documentation and knowledge transfer provided
- Alignment with stated value metrics

---

## Funding

**Total Funding Request:** $488,000 USD equivalent in Canton Coin (~3,253,333 CC at a reference price of $0.15 USD per CC)

### Payment Breakdown by Milestone

| Milestone                                        | CC Amount       | USD Equivalent | Trigger                                                                                      |
| :----------------------------------------------- | :-------------- | :------------- | :------------------------------------------------------------------------------------------- |
| M1: DevNet Proof of Concept                      | ~488,000 CC     | ~$73,200       | Committee acceptance of DevNet PoC and demo                                                  |
| M2: Audit-Ready DevNet Implementation            | ~650,666.67 CC  | ~$97,600       | Committee acceptance of audit-ready contract suite, including KYC/AML and NAV Oracle adapter |
| M3: Audited Open-Source Release & TestNet Launch | 976,000 CC      | ~$146,400      | Committee acceptance of audit, remediation, and open-source release, and TestNet deployment  |
| M4: MainNet Launch                               | 1,138,666.67 CC | ~$170,800      | Committee acceptance of MainNet deployment, TVL milestones, and DEX liquidity milestones     |

Funding is requested in milestone-based tranches and is intended to support development, testing, independent security review, open-source release, infrastructure operation, documentation, deployment, and ecosystem adoption activities associated with the proposed vault framework.

### Volatility Stipulation

Per CIP-0100, the grant is denominated in fixed Canton Coin using a reference price of $0.15 USD per CC. As the project duration exceeds 6 months:

- Milestones 1, 2, and 3 are fixed in Canton Coin.
- Milestone 4 is subject to re-evaluation at the 6-month mark, with the CC amount recalculated using the 30-day moving average price if CC/USD has moved more than +/-30% from the reference price.

The purpose of this adjustment is to preserve the intended USD-equivalent budget for remaining work while maintaining fair alignment with Canton Development Fund practices.

---

## Co-Marketing and Ecosystem Growth

Throughout the grant period, Zivoe will collaborate with the Canton Foundation on ecosystem-facing activities, including:

- Milestone announcements for DevNet launch, audit completion, Mainnet launch, and open-source release.
- Social coordination across Zivoe and Canton Foundation channels.
- Technical content explaining the Daml architecture for private credit and privacy preserving for RWA workflows.
- Educational content for RWA teams that may want to reuse or extend the open-source packages.
- LP-side business development introducing Zivoe's qualified participant base and private credit network to Canton.
- Participation in Canton community calls, developer forums, and ecosystem events upon invitation.
- Targeted integration conversations with Canton-native DeFi, custody, wallet, stablecoin, and lending-market teams.

Zivoe's goal is to make the deployment visible, useful, reusable, and commercially relevant while demonstrating how Canton can support privacy-preserving institutional real-world asset infrastructure beyond a purely technical proof of concept.

---

## Motivation

Canton's infrastructure is well-positioned for institutional financial workflows that require privacy, compliance, interoperability, controlled participation, and auditable settlement. Zivoe extends this infrastructure into private credit by contributing a Canton-native vault framework for short-duration, yield-bearing RWA strategies.

Considering the growing institutional interest in tokenized private credit, Zivoe:

- Expands Canton's RWA product surface by bringing a production-oriented MCA and receivables-focused private credit strategy to the ecosystem.
- Contributes adaptable Daml infrastructure that future Canton builders may reference, extend, or adapt for private credit, receivables, trade finance, or other yield-bearing RWA strategies.
- Supports qualified participant access through permissioned onboarding, controlled transferability, NAV-based pricing inputs, redemption workflows, and role-based administration.
- Strengthens Canton's financial workflows and composability ecosystem by creating infrastructure that may support future integrations with wallets, custodians, stablecoins, lending markets, reporting tools, and other qualified applications.
- Benefits a meaningful portion of Canton-based RWA and financial workflow builders, particularly teams that require permissioning, eligibility controls, asset accounting, NAV-based pricing, redemption mechanics, and privacy-preserving reporting.

The market opportunity is significant: [S&P Global Market Intelligence](https://www.spglobal.com/market-intelligence/en/news-insights/articles/2025/11/private-credit-gains-ground-among-top-private-equity-managers-94290783), citing Preqin, reported that private credit AUM is expected to nearly double from an estimated $2.280 trillion in 2025 to $4.504 trillion in 2030. Private credit is strategically important because its workflows naturally require privacy, eligibility controls, auditability, trusted settlement, and compliance-aware counterparties.

This proposal is designed to support both Zivoe's initial Canton deployment and broader ecosystem reuse, helping Canton demonstrate how privacy-preserving infrastructure can support more complex real-world asset strategies beyond cash and Treasury-class assets.

---

## Rationale and Public Benefit

Zivoe's existing private credit infrastructure and operating track record provide a practical foundation for this proposal. A Canton-native Daml vault framework is the preferred approach because Canton's privacy-enabled architecture is well-suited for permissioned private credit workflows involving qualified participants, controlled disclosure, role-based administration, NAV-based pricing inputs, and sensitive portfolio information.

The proposal is structured as a reusable vault framework rather than a one-off Zivoe product. This allows Zivoe to support its MCA-focused deployment while contributing open-source Daml components that future Canton builders/businesses may reference, extend, or adapt for private credit, receivables, trade finance, fund tokenization, and other yield-bearing RWA strategies.

The DevNet → TestNet → MainNet sequence is intended to de-risk the deployment in stages: DevNet validates the core vault lifecycle, TestNet supports audit, documentation, open-source review, and production-oriented integrations, and MainNet supports the initial live deployment of Zivoe's MCA-focused vault for qualified participants.

Zivoe considered alternatives, including bridging or mirroring its existing Ethereum vault, deploying a closed-source Zivoe-only vault, or waiting for private credit standards to emerge organically within Canton. Those approaches would provide less ecosystem value because they would not fully utilize Canton's native privacy and workflow capabilities, would create less reusable infrastructure for builders, or would delay a practical reference implementation for Canton-native private credit workflows.

The framework also directly responds to ecosystem adoption needs. Liquidity providers can use it to access private credit yield with controlled disclosure; stablecoin ecosystems can use it to create productive uses for stablecoin liquidity; blockchain networks can use it as a compliant real-world yield layer; BTC funds and institutional treasuries can use it for privacy-preserving stablecoin yield; risk curators and qualified allocators can use it to support diligence, strategy monitoring, and capital formation; and other private credit businesses can adapt the same framework for MCA, credit card receivables, factoring, trade finance, and other receivables strategies.

This approach extends Canton's existing strengths, supports Zivoe's production-oriented deployment, and contributes reusable Daml infrastructure for broader ecosystem growth, including potential future integrations with wallets, custodians, stablecoins, lending markets, reporting tools, and other qualified Canton applications, subject to applicable legal, regulatory, technical, operational, and market considerations.

---

## Growth Capacity and Commercial Readiness

Zivoe is approaching Canton with an existing operating platform, live private credit exposure, active LP and qualified participant conversations, and origination relationships with meaningful annual capacity.

Zivoe's adoption thesis is informed by existing commercial relationships and active discussions across multiple market participants, including institutional liquidity providers, banking and stablecoin infrastructure participants, tokenized asset platforms, and blockchain ecosystem partners.

Existing relationships include Centrifuge/Anemoy (RWA tokenization and distribution infrastructure participant) and IXS (BTC yield ecosystem participant evaluating private credit yield opportunities). Active discussions include Zenith (institutional liquidity and allocation participant with EVM ecosystem distribution capabilities), Bank of Vermont (banking and stablecoin infrastructure participant), XDC (blockchain ecosystem participant evaluating private credit yield opportunities), and Splyce (Solana ecosystem participant evaluating private credit yield opportunities).

While these relationships and discussions should not be interpreted as binding commitments, they demonstrate identifiable demand for privacy-preserving private credit infrastructure and multiple potential adoption pathways following deployment.

Commercial readiness metrics that strengthen the Canton adoption case include:

- $7M+ existing platform TVL across Zivoe private credit strategies.
- Approximately $1.36M in revenue generated, more than 10% annualized performance to date, approximately 12% APY consistently delivered to participants, and no missed LP payments.
- $1B+ annual origination pipeline across MCA, revenue-based financing, and receivables exposure.
- $100M+ potential private credit deployment capacity over the next 12 months, subject to capital availability, legal/compliance review, diligence, portfolio performance, liquidity reserves, and execution conditions.
- Team with 40+ years of combined experience across private credit, lending operations, compliance, risk management, finance, and blockchain infrastructure.

This section is included to demonstrate commercial preparedness and potential ecosystem impact and does not constitute a guarantee, offer, solicitation, or commitment.

---

## Why Zivoe

Zivoe has operated live infrastructure since approximately September 2024, with approximately $7M facilitated through its platform, approximately $1.36M in revenue generated, approximately 12% APY consistently delivered to participants, and no missed LP payments.

The Daml work proposed here is an adaptation of Zivoe's existing private credit vault pattern, not a theoretical design exercise. Zivoe has operated this model on Ethereum, with live contracts previously audited by Runtime Verification and Sherlock.

Zivoe's team brings both blockchain development capability and private credit management experience. The team combines experience across institutional private credit, lending operations, compliance, risk, finance, marketing, and production blockchain engineering.

### Team

- **Kristal Gruevski, Founder & General Counsel** - 3x FinTech startup GC with 10+ years of experience in corporate law, compliance, operations, government relations, and regulatory strategy. Has raised more than $100M in FinTech fundraising over her career and led legal and regulatory matters involving high-stakes government agencies.
- **Jay Abbasi, Founder** - Entrepreneurial operator with 20+ years of leadership across finance, technology, national banks, specialty lenders, operations, underwriting, compliance, mortgages, sales, and turnaround execution. Has experience scaling private credit and receivables portfolios to more than $150M in compressed timeframes while preserving disciplined operating and risk controls, and previously helped generate more than $80M in shareholder value in under three years at a specialty lending platform.
- **Walt Ramsey, Head of Risk** - Credit risk leader with 20+ years of experience across the product and credit cycle at institutions including JPMorgan Chase and Lloyds Bank. While at Elevate Credit, Walt helped support revenue growth from approximately $100M to $500M and worked with stakeholders on IPO strategy.
- **John Quarnstrom, Head of Technology** - Blockchain developer with nearly a decade of experience, including early engineering work at Maple Finance, which has originated more than $6B in on-chain loans. John is proficient in Daml and holds the Certificate in Quantitative Finance from the CQF Institute.
- **Chad Deal, Head of Compliance** - Compliance leader with hands-on experience building Compliance Management Systems, (CMSs) AML/BSA programs, and operational controls across lending platforms. Former COO/CEO in mortgage and lending businesses, with experience across day-to-day lending operations, vendor integrations, and CMS buildout.
- **Shannon Wright, Controller** - Finance executive with 20+ years across financial services, fintech, audit, controls, regulatory reporting, and IPO-readiness environments.
- **Alexandru Serban, Full Stack Engineer** - Developer with 4+ years of experience building full-stack applications that integrate on-chain components.

### Daml Hiring and Continuity

Zivoe expects to retain or contract experienced Daml engineering support alongside the development roadmap and intends to maintain the open-source packages and mainnet vault contracts for at least 24 months following launch.

### Why MCA and Receivables as the First Strategy

MCA and short-duration receivables exposure are a compelling starting point for demonstrating Canton's value proposition in private credit because the asset class is large, cash-flow based, and capable of producing observable yield cycles within months.

Zivoe's strategy aligns with Canton's goals by bringing qualified participant access, privacy-preserving workflows, controlled reporting, and reusable infrastructure to a commercially significant private credit category, subject to capital availability, diligence, legal structuring, operational approvals, and market conditions.

---

## Thank You and Next Steps

Zivoe can provide customary diligence materials upon request.

Zivoe welcomes a direct call with the Canton Foundation team to review the strategy, technical scope, commercial roadmap, and ecosystem alignment.

Thank you for your time and consideration.

With gratitude,
The Zivoe Team

---

## Important Notes and Disclaimers

This document is for discussion and informational purposes only and does not constitute an offer to sell, or a solicitation of an offer to buy, securities, tokens, interests in any vehicle, or any other financial instrument. Although this document may be publicly posted to satisfy Canton disclosure requirements, it is not intended as broad public marketing, investment advice, or a public solicitation.

Any participation, deployment, investment, integration, or commercial arrangement would be subject to definitive documentation, participant eligibility requirements, diligence, KYC/KYT/AML, transfer restrictions, tax, legal, regulatory, and operational review, and other applicable requirements.

Target returns are not guaranteed, and past performance is not indicative of future results. Private credit, MCA receivables, tokenized vault structures, and blockchain-based settlement systems involve risks, including credit, liquidity, operational, servicing, regulatory, smart-contract, market, and potential loss-of-principal risks.

This proposal is not intended to make comparative claims regarding other blockchain networks or ecosystems, including but not limited to the capabilities, suitability, or regulatory posture. Zivoe respects the broader blockchain community and may evaluate or work with other networks where appropriate; this proposal focuses on Canton because its privacy, compliance, interoperability, and institutional workflow capabilities appear aligned with the contemplated Canton-native private credit vault.
