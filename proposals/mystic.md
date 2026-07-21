## Development Fund Proposal

**Author:** Mystic Finance 
**Status:** Submitted
**Created:** 2026-03-17
**Champion:** Gabi Tuinaite, Bitsafe
**Label:** defi-protocols

---

## Abstract

Mystic is building a modular lending market on Canton, which enables curators to create isolated lending vaults which allocate capital according to different risk preferences. This means isolated risk exposure for LPs and increased capital efficiency for borrowers, all under the privacy-preserving stack of Canton.

This work expands on what we’ve been doing over the past 12 months, where we’ve been managing the Morpho deployment on Plume, an RWA-focused L2 where we’ve achieved $80M TVL and 33k+ active users. It is our thesis that isolated lending and the ability to onboard better and more diversified collateral, RWAs in particular, is the future of on-chain lending. That thesis has led us right to Canton, where we now plan to build it in the Daml language with native Canton privacy and functionality baked in.

We also propose introducing a CIP with a unified tokenized vault standard, equivalent to the ERC-4626 vault standard on the EVM. This will dramatically improve Canton interoperability and be very beneficial for Canton DeFi. See more details in the ammendment made in the comments of this PR.

Serves this proposal to request the Committee for assistance mainly with audit costs, so we may take Mystic to market on Canton. We’re confident in our ability to operate and manage this business, as we have done so over the past year and have the relationships and expertise necessary to see it thrive.

---

## Specification

### 1. Objective

Within this grant, Mystic delivers a production-ready modular and curated lending market for Canton that enables the permissionless creation of isolated markets where risks are contained to each market. This will enable:
* Curation and creation of privacy-preserving, isolated lending vaults curated by institutions for institutions and retail alike;
* Lending, borrowing and leveraging crypto and RWAs alike in an isolated environment, permissioned or permissionless;
* Reusable and open infrastructure for anyone to create their own lending markets on Canton, for internal or external purposes;

See also the ammendment made to this proposal in the comments of this PR, where we propose to introduce a unified vault standard to avoid interoperability problems on Canton in the future.

### 2. Implementation Mechanics

The app is constituted by a set of lending markets and a set of curated vaults connected to the markets, as well as a frontend for user interactions and a backend for data management. Here we will outline how each of these work.

Each Mystic Market is a contract which accepts two assets, the collateral asset and the borrow asset (designed to align with the Canton Token Standard introduced in CIP-56). Each market has a) an oracle price feed, b) an interest rate model (IRM), c) an LLTV (liquidation loan-to-value) and d) a Custodian Party (can be a Party or a DecParty). For price verification, we integrate official Chainlink Data Streams through the ChainlinkPriceOracle template, whereas the LLTV is a parameter set by the curator upon market creation and the IRM is its own standalone contract. The Custodian Party is the one who holds the market's assets and is set by the market’s creator. As for the loan process itself, we first confirm that the assets deposited are correct by checking that the holding's instrument and registrar fields match what the market is configured to accept. Furthermore, any action on the protocol requires signatures from both the user and the protocol provider as co-signatories. The actions considered are supplying collateral, supplying the loan asset, repaying debt, withdrawing supplies, borrowing and liquidating. The protocol uses a keyless template design optimized for Daml 3.x and Daml-LF 2.2, removing traditional contract keys and maintainers to avoid per-key maintainer-uniqueness confirmation overhead and reduce per-transaction latency on the Canton Domain.

As part of this proposal, we are also delivering a CIP proposal and an open-source vault standard reference implementation. See the amendment to this proposal in the comments for more details on the implementation mechanics planned for this OSS implementation.

Each Mystic Vault is a contract which receives user deposits, allocates them to markets and does share accounting. Each vault also has its own Vault Registrar (can be a Party or a DecParty), who mints vaults shares to the depositor and holds idle assets until they’re lent to a market. As for the deposit and allocation logic itself - when a user supplies to the vault, they receive vault shares (tokens which represent their stake in the vault). Their assets are then lent out to market via an Adapter connecting each vault to its markets. Each vault is connected to the AdapterRegistry, which lets vaults support other types of markets to be added later on (e.g. fixed-rate). When a user supplies to the vault, funds are kept idle until the Adapter sends assets to the markets by calling Market.Supply with the Vault Registrar Party as the depositor, creating a LendingPosition owned by the Registrar Party. The Adapter stores the position reference so it can later withdraw funds when users redeem shares or when liquidity needs to be rebalanced. This design allows vault allocations to be executed automatically by the Allocator while custody of assets remains secured by Vault Registrar.

Our frontend is a React + Vite interface built with Typescript and styled with Tailwind CSS which provides a fast, responsive way to interact with markets and vaults. User interaction with the blockchain is handled directly in our frontend. The app integrates with third-party Canton wallets on the UI (e.g. Loop, Console Wallet) and the Canton Identity Provider (IdP) for wallet mapping.

Our backend is NestJS with TypeScript and it is mostly for data collection and caching. This is done by using MongoDB, Redis, and BullMQ for queues. We run most of our infrastructure on Azure, including blockchain indexers for data collection.

### 3. Architectural Alignment

This work directly aligns with Canton’s architecture of having multiple Subnets connected to the Global Synchronizer, as Mystic’s architecture itself is one of having multiple isolated lending markets that can trade with each other and benefit from all Mystic liquidity. It is also in line with the objectives of promoting privacy and RWA support, as our model enables both permissioned and permissionless markets, fit for crypto and RWAs alike.

The proposal also aligns with ecosystem priorities to further interoperability and broaden participation, as Mystic advances Canton DeFi modularity and increases DeFi addressable market dramatically by enabling many more issuers to be onboarded as lending collateral and supply assets, as well as enabling anyone to build private and isolated lending experiences on top of Mystic. The proposed introduction of a unified vault standard as a new CIP is also fully in alignment with these objectives.

More specifically, in terms of alignment with existing ecosystem initiatives and CIPs:
- The open-source ERC-4626-like vault standard we've proposed building is in direct alignment and will be integrated with the [Decentralization Manager](https://github.com/canton-foundation/canton-dev-fund/pull/298) proposed by Bitsafe in PR 298 to the Dev Fund, as vaults will be able to choose having centralized custody or use the Decentralization Manager for decentralized custody.
- We're building everything based on CIP-56 for asset standards at both vault and market level and the oracle template at the market level.

### 4. Backward Compatibility

No backward compatibility impact.

## Milestones and Deliverables

## **Milestone 1: Markets**

**Focus:**
* Development of the markets layer of Mystic, each a contract with 2 assets (collateral and borrow asset), a Liquidation LTV, an Interest Rate Model (IRM), a custodian and an oracle price feed.
* Front-end, backend integration.
* Internal testing and internal auditing.

We have finished this already and are currently blocked by approval of this proposal to audit and thus launch on Canton.

Estimated delivery:
It took us two months to do this milestone. It will take us an additional 1.5 months from the approval of this proposal to launch, during which we will be conducting audit reviews.

Regarding how the audits will be conducted: we have already gotten quotes from several auditors, so we know what to expect. We intend to do two audits on the markets codebase, in which case the process will be:
* First audit: 1 week (Chain Defenders is the auditor)
* Remediation of first audit: 2 weeks
* Second audit: 2 weeks (Quantstamp is the auditor)
* Remediation of second audit: 2 weeks
Total time elapsed: 1.5 months

Some further comments:
* Audits would start within a week of approval of this proposal or otherwise at the auditing firms’ earliest convenience.
* Their scope would be the 3 files that make up Mystic Markets: base.dar, curator.dar, oracle.dar. Together they total 1079 NSLOC.
* We will pay the audits ourselves from the funding received from this milestone. Meaning, we are here assuming that the funding is disbursed after the acceptance criteria is confirmed and it has been validated that the code is ready for auditing.

**Deliverables:**
* 3 MysticMarket Daml smart contracts - base.dar, curator.dar and oracle.dar
* Market functionality on Devnet- supply, withdraw, borrow, repay, liquidate. IRM, LTV/LLTV and custodian implementations all working flawlessly;
* Pass end-to-end testing of all edge cases and internal testing;
* Internal audit and internal review;
* UI and backend integrations so markets are functional and available on Devnet in the Mystic UI.

## **Milestone 2: Vaults**

**Focus:**
* Develop an open-source vault standard on Canton functional, equivalent to the ERC-4626 standard on the EVM. Propose a CIP for this new standard for all to adhere to.
* Make a reference implementation on Devnet open-source available for all to see and use along with documentation for it. This will live on as an open-source artifact for the Canton community.
* Customize the vault for our own use case of curated lending - this includes yield calculations, vault roles, fees, allocation, adding/removing markets, vault reallocation.
* Factory contract for vault creation.
* Vault and market permissioning - enabling whitelisting borrowers, lenders and liquidators per market and vault.
* Curator UI development, where curators can create and manage their vaults.
* Front-end, backend integrations.
* Internal testing and internal auditing.

Estimated delivery:
Three months from Milestone 1, including audit reviews.

We propose doing the same as above: funds are disbursed after acceptance criteria for this milestone has been confirmed, so we can then audit and go to market with vaults. The reference implementation will be published publicly after it is audited also.

**Deliverables:**

* Submit CIP proposal for a common tokenized vault standard that the whole ecosystem can adhere to, following the example set by the ERC-4626 vault on the EVM. More detail in the amendment made to this proposal as a comment.
* Reference implementation of a vault as per the CIP delivered and made available as open-source software, for all to use and build on top of.
* Mystic vault Daml smart contracts.
* Mystic curator UI, fully integrated with vault smart contracts
* Vault functionality - deposit, withdraw, allocate, fee distribution, yield distribution, role enforcement, permissioning enforcement, share accounting.
* Pass end-to-end testing and internal review of all edge cases for vaults;
* UI and backend integrations so vaults are functional and available on Devnet in the Mystic UI and the curator UI.

## **Milestone 3: Mainnet Launch and Ecosystem Adoption**

**Focus:** Onboard 1 curator minimum, launch 1 vault minimum and reach $30M in deposits

* **Estimated delivery:** 3 months from completing Milestone 2

**Deliverables:**

* 1 curated vault live on Mainnet with at least one market;
* Publish comprehensive documentation for other builders and ecosystem players to be able to build and curate on Mystic;
* Achieve $30M deposits on Canton (collateral + supply assets).

---

## Acceptance Criteria

## Acceptance Criteria

**Milestone 1:** Markets
* Demonstration of markets fully working on Devnet, with all functions working well. This includes users able to withdraw, supply, borrow, repay, liquidate on markets.
* Demonstration of markets whitelisting feature fully working on Devnet.
* Demonstration of full codebase working and audit-readiness of markets on Devnet, including public allocation, and IRMs. Since the code is already at this level, the time we need for this milestone is just the time needed to audit it and review the audits.

**Timeline**: 1.5 months


**Milestone 2:** Vaults

* Completion of audits on the market smart contracts with audit reports and remediation;
* Submission of a new tokenized vault CIP standard;
* An open source reference implementation of the vault smart contract for the whole Canton ecosystem to use. Documentation for its use to be submitted alongside it;
* Demonstration of Mystic’s vault implementation of curated lending vaults fully working on Devnet, where users can supply/withdraw an asset and where assets deposited are split amongst the chosen markets and earn a blended supply APY;
* Demonstration of vaults being able to add/remove markets, allocate to markets and rebalance across added markets as triggered by the curator;
* Demonstration of owners of vaults being able to set fees, fee recipients, add/remove roles and manage access control via the curator UI. Public allocation, adapter registry and vault adapters also working as intended;
* Demonstration of full codebase working on Devnet.

**Timeline**: 3 months from Milestone 1 completion


**Milestone 3:** Mainnet Launch and Ecosystem Adoption

* Completion of audits on the vaults smart contracts with audit reports and remediation;
* Launch at least one curated vault with at least one market; 
* Documentation delivered
* Reach $30M in deposits;


**Timeline**: 3 months from Milestone 2 completion.

From a distribution perspective, we plan to have two curators initially: one for CC and one for stablecoins, each with their own distribution advantage in the respective assets. We will work with curators and issuers on the chain to set up markets which can enable CC-denominated and stablecoin-denominated leverage loops. To add that a third vault targeting a  CBTC-denominated loop is already in the works as well.

We will bootstrap supply-side TVL with CC rewards and a CEX integration we have closed which will direct users to supply their assets on Mystic. From there, we will work with issuers and curators to attract borrowers, effectively getting the flywheel to start turning. After that, our focus will be on onboarding more issuers, curators, Canton validators and distribution partners to scale the number of and size of vaults available on Canton.

---

## Funding

**Total Funding Request:**  

**Total funding request:** 1,266,665 CC (190K USD at 0.15 CC/USD rate)

**Payment breakdown by Milestone:**

* **Milestone 1 — Markets:** 333,333 CC (50K USD at 0.15 CC/USD rate) upon committee acceptance of the criteria.
    
* **Milestone 2 — Vaults:** 666,666 CC (100K USD at 0.15 CC/USD rate) upon committee acceptance of the criteria.
    
* **Milestone 3 — Mainnet Launch and Ecosystem Adoption:** 266,666 CC (40K USD at 0.15 CC/USD rate) upon final release and acceptance of the criteria.


**Volatility handling**

The milestone amounts are denominated in Canton Coin (CC) using a baseline reference price of 0.15 USD per CC. To account for volatility, we propose to reassess the 30-day moving average of CC/USD price when each milestone ends. The proposed approach:

* If moving average price at the end of a milestone is within 25% of 0.15 USD per CC, nothing changes in the amount of CC disbursed. So, within 0.1125 and 0.1875, the same amount of CC is disbursed.
* If the moving average falls outside this interval, we propose the USD amount is recalculated according to the new price. So, for example, if CC moving average is at 0.1 USD at the end of a milestone, the amount disbursed is the milestone’s USD amount expressed in 0.1 CC prices.

This way, Mystic is flexible on CC volatility and we can execute the project without excessive complexity whilst also accounting for extreme volatility.

---

## Maintenance & Ownership

There are two things to consider here: the Mystic codebase and the OSS artifact that is the vault standard. The vault standard will be published by Mystic Labs, the company building and operating Mystic, under the MIT license to be freely used by anyone as a public good, whereas Mystic-specific code will remain private and proprietary to Mystic Labs. More specifically, that means the lending market layer done in Milestone 1 remains private, whereas in Milestone 2 there will be a part of the code that remains private, which is the vault code specific to our use case, and the OSS vault standard which is made public and open-source for anyone to use.

Mystic Labs, the company behind Mystic, hereby commits to maintain the vault standard and continue its development and compatibility updates for a period of minimum 12 months after the completion of milestone 2, should the grant be approved. This will be funded by protocol operations; we will not ask for additional grants to maintain the code. We will otherwise work with the ecosystem to support any changes necessary, fix bugs that arise, update dependencies and solve CIP-compatibility issues to ensure the vault standard remains broadly usable by everyone in the community.

---

## Co-Marketing

Upon each milestone release, Mystic will collaborate with the Canton Foundation on:
* Joint announcements of each new functionality on Canton;
* Joint blog posts and technical deep dives of what Mystic enables on Canton;
* Upon Mainnet launch, LP and borrower business development to move TVL over to Canton;
* Upon Mainnet launch, ecosystem development by partnering with distribution channels (e.g. wallets and neobanks, both of which we’re already in discussions with).

---

## Motivation

Canton’s vision for interoperability of private, autonomous applications is a perfect fit for the isolated lending model and vice-versa. Mystic enables anyone to do their own underwriting whilst also being exposed to the overall market, meaning each autonomous application can have its private curated lending market but also lend/borrow against each other and benefit from ecosystem-wide liquidity, a value proposition that is almost custom-fit to what Canton is building. In that sense, Mystic brings to credit exactly what the Global Synchronizer is bringing to the Subnets: the ability for independent parties to create independent credit markets that can interact with each other. Mystic on Canton enables:
* Subnets to have their own isolated, private lending market on the Global Synchronizer. We believe this can be a crucial stepping stone to make Canton’s vision a reality.
* Attracting new curators, LPs, builders and participants by bringing composability to new assets.
* Onboarding a plethora of asset issuers from other ecosystems and TradFi alike to the Global Synchronizer, which would be invaluable for Canton DeFi.

See also the Motivation for the submission of a CIP for a unified tokenized vault standard in the ammendment made in the comments of this PR.

---

## Rationale

Here’s why Mystic is uniquely well-positioned to deliver this project:

* **Existing infrastructure and user-base:** We have a fully battle-tested app with 13k MAU for curated lending, with a functional curator dashboard at curator.mysticfinance.xyz and app at app.mysticfinance.xyz. We can bring our user base over to Canton.
* **Deep operational expertise:** The Mystic team has been operating a curated lending market built on Morpho for a year now, where we’ve been working closely with curators, foundations, LPs and borrowers to build curated lending markets for different assets. We understand the nuances of operating this business, much like we have a lot of relationships we can bring over to Canton to make this project a success (for example, with curators and asset issuers). Our work has seen us reach $80M+ TVL and 33k+ users over the past year, numbers we hope to now eclipse on Canton.
* **Proven accountability and delivery:** We’ve been in the space for a while now and are happy to introduce you to any number of partners and clients that can vouch for our professionalism and ability to deliver.

As for why this is the right design - there are two main models which dominate DeFi lending, the shared model (e.g. Aave) and the isolated model (e.g. Morpho). We will here briefly compare them in efficiency and risk:
* The shared model is more efficient because it enables rehypothecation, but it doesn’t scale as well because it struggles to onboard long-tail collateral (as all assets share risk, the protocol’s risk increases with any additional collateral onboarded). Isolated lending, on the other hand, can onboard assets with much more flexibility because it isolates their risk (proven by how many more collateral assets Morpho supports over Aave). However, since this model doesn’t usually enable rehypothecation, it is less efficient on a per-dollar-supplied basis. Mystic solves this by introducing a “rehypothecation rate” for the first time in DeFi, set by curators at the vault level.
* Shared models are usually more user-friendly and less complex, as there’s less to understand. That is better for retail and less nuanced players. Isolated models, on the other hand, tend to be preferred by institutions and more nuanced players, as it enables them to better manage their risk. An interesting corollary effect of this is that supply rates in isolated models tend to be higher than those of shared models, although [the exact cause of this is arguable](https://www.linkedin.com/pulse/what-drives-aave-morpho-rate-spread-silvio-busonero-uqx9e?utm_source=share&utm_medium=member_android&utm_campaign=share_via).

We believe the ability to give the best rates on the best collateral will win in lending. That is only possible by isolating it. In addition, isolating risk is key in providing an institutional-grade experience, as that is what most sophisticated players prefer. And to top it all off, the flexibility in onboarding more collateral is better primed for RWAs, which have different permissioning requirements. Taking all of these into account, it seems clear to us that curated lending is the right model for Canton - better adjusted to an institutional-user base, better adjusted to the assets the chain wants to service, and even better adjusted to how the Canton ecosystem is structured (i.e. it fits the Subnets model very well, as each Subnet can have its own curated vault(s)). We’re thus very confident in this design decision and that it is right for Canton.

All in all, Mystic is uniquely positioned to deliver a curated lending market of Canton, which is actually something we’ve wanted to do for a while now - we reached out to the Digital Asset team back in 2024 to build this, but had to pay a starting fee at the time to do so which ultimately led to us not moving forward with the project. The circumstances having now changed, we would love to make our original vision a reality with your help, and work together to bring Canton DeFi to the next level. Thank you for reading and for your consideration!

See also the Rationale for the submission of a CIP for a unified tokenized vault standard in the ammendment made in the comments of this PR.
