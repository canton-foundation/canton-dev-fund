## Development Fund Proposal

**Author:** Mystic Finance 
**Status:** Draft
**Created:** 2026-03-17  

---

## Abstract

Mystic is building a modular lending market on Canton, which enables curators to create isolated lending vaults which allocate capital according to different risk preferences. This means isolated risk exposure for LPs and increased capital efficiency for borrowers, all under the privacy-preserving stack of Canton.

This work expands on what we’ve been doing over the past 12 months, where we’ve been managing the Morpho deployment on Plume, an RWA-focused L2 where we’ve achieved $80M TVL and 33k+ active users. It is our thesis that isolated lending and the ability to onboard better and more diversified collateral, RWAs in particular, is the future of on-chain lending. That thesis has led us right to Canton, where we now plan to build it in the Daml language with native Canton privacy and functionality baked in.

Serves this proposal to request to the Committee for assistance with audit costs so we may take Mystic to market on Canton. We’re confident in our ability to operate and manage this business, as we have done so over the past year and have the relationships and expertise necessary to see it thrive.

---

## Specification

### 1. Objective

Within this grant, Mystic delivers a production-ready modular and curated lending market for Canton that enables the permissionless creation of isolated markets where risks are contained to each market. This will enable:
Curation and creation of privacy-preserving, isolated lending vaults curated by institutions for institutions and retail alike;
Lending, borrowing and leveraging crypto and RWAs alike in an isolated environment, permissioned or permissionless;
Reusable and open infrastructure for anyone to create their own lending markets on Canton, for internal or external purposes;
Fixed-rate and fixed-term RFQ lending on Canton, which lays the foundation for repo transactions under a curated vault model.


### 2. Implementation Mechanics

The app is constituted by a set of lending markets and a set of curated vaults connected to the markets, as well as a frontend for user interactions and a backend for data management. Here we will outline how each of these work.
Each Mystic Market is a contract which accepts two assets, the collateral asset and the borrow asset (as per the Canton Token Standard introduced in CIP 56). Each market has a) an oracle price feed, b) an interest rate model (IRM), c) an LLTV (liquidation loan-to-value) and d) a DecParty as a custodian. For price verification, we integrate official Chainlink Data Streams through the ChainlinkPriceOracle template, whereas the LLTV is a parameter set by the curator upon market creation and the IRM is its own standalone contract. The DecParty is a Custodian who holds the market’s assets, set by the market creator. As for the loan process itself, we first confirm that the assets deposited are correct by enforcing a Signatory–Observer handshake and checking if the assets match what’s expected in the centralized Asset Registry. Furthermore, any action on the protocol requires signatures from the participant and the protocol as an observer. The actions considered are supplying collateral, supplying borrow asset, repaying debt, withdrawing supplies, borrowing and liquidating. The protocol uses a keyless template design optimized for Daml 3.x and Daml-LF 2.2, removing traditional contract keys and maintainers to reduce sequencer contention on the Canton Domain.
Each Mystic Vault is a contract which receives user deposits, allocates them to markets and does share accounting. Each vault also has its own DecParty Custodian, which holds idle assets until they’re lent to a market. As for the deposit and allocation logic itself - when a user supplies to the vault, they receive vault shares (tokens which represent their stake in the vault). Their assets are then lent out to market via an Adapter connecting each vault to its markets. When a user supplies to the vault, funds are kept idle until the Adapter sends assets to the markets by calling Market.Supply with the Custodian DecParty as the depositor, creating a LendingPosition owned by the DecParty. The Adapter stores the position reference so it can later withdraw funds when users redeem shares or when liquidity needs to be rebalanced. This design allows vault allocations to be executed automatically by the Allocator while custody of assets remains secured by DecParties. For additional reading, please refer to our vault role breakdown here and a full breakdown of our design here.
Our frontend is a React + Vite interface built with Typescript and styled with Tailwind CSS which provides a fast, responsive way to interact with markets and vaults. User interaction with the blockchain is handled directly in our frontend. The app integrates with third-party Canton wallets on the UI (e.g. Loop, Console Wallet) and the Canton Identity Provider (IdP) for wallet mapping.

Our backend is NestJS with TypeScript and it is mostly for data collection and caching. This is done by using MongoDB, Redis, and BullMQ for queues. We run most of our infrastructure on Azure, including blockchain indexers for data collection.

### 3. Architectural Alignment

This work directly aligns with Canton’s architecture of having multiple Subnets connected to the Global Synchronizer, as Mystic’s architecture itself is one of having multiple isolated lending markets that can trade with each other and benefit from all Mystic liquidity. It is also in line with the objectives of promoting privacy and RWA support, as our model enables both permissioned and permissionless markets, fit for crypto and RWAs alike. The protocol will also later enable both fixed and floating rate loans, giving institutions the modularity required to seriously move operations to the Global Synchronizer.

The proposal also aligns with ecosystem priorities to further interoperability and broaden participation, as Mystic advances Canton DeFi modularity and increases DeFi addressable market dramatically by enabling many more issuers to be onboarded as lending collateral and supply assets, as well as enabling anyone to build private and isolated lending experiences on top of Mystic. We also build upon CIP-56 for asset standards at both vault and market level and the oracle template at the market level.

### 4. Backward Compatibility

No backward compatibility impact.

## Milestones and Deliverables

## **Milestone 1: Markets & Vaults MVP**

**Focus:**
Development of the markets layer of Mystic, each a contract with 2 assets (collateral and borrow asset), a Liquidation LTV, an Interest Rate Model (IRM), a DecParty custodian and an Oracle price feed.
Development of curated lending vaults, which split deposited assets into a set of pre-selected markets.

* **Estimated delivery:** 2 months from grant approval. To note, we’ve started already regardless of grant outcome, so it’s likely we’ll be farther ahead when this is reviewed.

**Deliverables:**
* Core market functionality on Devnet - supply, withdraw, borrow, repay, liquidate. IRM, LTV/LLTV, oracle and DecParty implementations all working flawlessly;
* Core vault functionality on Devnet - assets deposited in the vault are split amongst the chosen markets as per curator selection and earn a blended supply APY;
* Vault roles, parameters that curators can change, fee settings;
* Basic curator tooling - rebalancing bot, liquidation bot open-source templates;
* Development of curator UI where curators can assemble and manage their vaults;
* Pass end-to-end testing of all edge cases for both vaults and markets;
* UI and backend integrations so the whole app is functional on Devnet in the Mystic UI.

## **Milestone 2: RFQ Lending**

**Focus:** Enable vaults to lend their funds via an RFQ process to non-utilization-based markets by enabling fixed-rate markets, fixed-term markets and permissioned markets (for RWAs). This milestone includes also a rehypothecation feature, which enables a percentage of market collateral to be lent out by the curator via RFQ.

* **Estimated delivery:** 4 months from completing Milestone 1

**Deliverables:**

* Core functionality for fixed-rate markets on Devnet - borrows happen at a fixed price and curators can allocate funds to these borrows via RFQ away from utilization-based markets;
* Core functionality for fixed-term markets on Devnet - borrows happen at a fixed-rate AND a fixed duration. Much like in fixed-rate, curators can allocate funds to these borrows via RFQ away from utilization-based markets;
* Permissioning functionality, such that only whitelisted parties can be lenders, borrowers, custodians and liquidators in a market. Meant to support tokenized securities;
* Rehypothecation: curators can set a “Rehypothecation Rate” in their markets, enabling them to lend out a percentage of the collateral of loans happening via their vault;
* Curators can manage permissioning and RFQ on curator UI;
* UI and backend integrations, enabling fully functional RFQ vaults on Mystic UI;
* Pass end-to-end testing of all edge cases.

## **Milestone 3: Mainnet Launch and Ecosystem Adoption**

**Focus:** Onboard 1 curator minimum, launch 1 vault minimum and reach $30M in deposits

* **Estimated delivery:** 3 months from completing Milestone 2

**Deliverables:**

* Achieve $30M deposits on Canton (collateral + supply assets);
* 1 curated vault live on Mainnet with at least one market;
* Publish comprehensive documentation for other builders and ecosystem players to be able to build and curate on Mystic;

---

## Acceptance Criteria

**Milestone 1:** Markets & Vaults MVP

* Demonstration of markets fully working on Devnet, with all major functions working well - withdraw, supply, borrow, repay, liquidate;
* Demonstration of vaults fully working on Devnet, where users can supply/withdraw an asset and where assets deposited are split amongst the chosen markets and earn a blended supply APY;
* Demonstration of the whole product working end-to-end on Devnet for all parties, from curators to lenders, borrowers, custodians and liquidators;
* Demonstration of resilience and full production-readiness;
Timeline: 2 months from Milestone 1 completion.

**Milestone 2:** RFQ Lending

* Demonstration of all fixed-rate and fixed-term markets working on Devnet, with RFQ logic away from utilization-based markets as default;
* Demonstration of rehypothecation feature working via RFQ on Devnet;
* Demonstration of market permissioning fully working on Devnet;
Timeline: 4 months from Milestone 1 completion.

**Milestone 3:** Mainnet Launch and Ecosystem Adoption

* Reach $30M in deposits;
* Launch at least one curated vault with at least one market; 
* Documentation delivered
* **Timeline**: 3 months from Milestone 2 completion.

From a distribution perspective, we plan to have two curators initially: one for CC and one for stablecoins, each with their own distribution advantage in the respective assets. We will work with curators and issuers on the chain to set up markets which can enable CC-denominated and stablecoin-denominated leverage loops. To add that a third vault targeting a  CBTC-denominated loop is already in the works as well.

We will bootstrap supply-side TVL with CC rewards and a CEX integration we have closed which will direct users to supply their assets on Mystic. From there, we will work with issuers and curators to attract borrowers, effectively getting the flywheel to start turning. After that, our focus will be on onboarding more issuers, curators, Canton validators and distribution partners to scale the number of and size of vaults available on Canton.

---

## Funding

**Total Funding Request:**  

**Total funding request:** 1,266,665 CC (190K USD at 0.15 CC/USD rate)

Our main problem is we don’t have the funds to audit our project and take it to market, otherwise we arguably wouldn’t even ask for this grant. As such, we request funding that will mostly be spent auditing our work so that we can go live on Canton. Additional funding on the last milestone is reduced and only rewards traction and a material contribution to the ecosystem.

**Payment breakdown by Milestone:**

* **Milestone 1 — Markets & Vaults MVP:** 333,333 CC (50K USD at 0.15 CC/USD rate) upon committee acceptance of the criteria.
    
* **Milestone 2 — RFQ Lending:** 666,666 CC (100K USD at 0.15 CC/USD rate) upon committee acceptance of the criteria.
    
* **Milestone 3 — Mainnet Launch and Ecosystem Adoption:** 266,666 CC (40K USD at 0.15 CC/USD rate) upon final release and acceptance of the criteria.


**Volatility handling**

The milestone amounts are denominated in Canton Coin (CC) using a baseline reference price of 0.15 USD per CC. To account for volatility, we propose to reassess the 30-day moving averages of CC/USD price when each milestone ends. The proposed approach:
If price at the end of a milestone is within 25% of 0.15 USD per CC, nothing changes in the amount of CC disbursed. So, within 0.1125 and 0.1875, the same amount of CC is disbursed.
If the moving average falls outside this interval, we propose the USD amount is recalculated according to the new price. So, for example, if CC moving average is at 0.1 USD at the end of a milestone, the amount disbursed is the milestone’s USD amount expressed in 0.1 CC prices.
This way, Mystic is flexible on CC volatility and we can execute the project without excessive complexity whilst also accounting for extreme volatility.


## Co-Marketing

Upon each milestone release, Mystic will collaborate with the Canton Foundation on:
Joint announcements of each new functionality on Canton;
Joint blog posts and technical deep dives of what Mystic enables on Canton;
Upon Mainnet launch, LP and borrower business development to move TVL over to Canton;
Upon Mainnet launch, ecosystem development by partnering with distribution channels (e.g. wallets and neobanks, both of which we’re already in discussions with).

---

## Motivation

Canton’s vision for interoperability of private, autonomous applications is a perfect fit for the isolated lending model and vice-versa. Mystic enables anyone to do their own underwriting whilst also being exposed to the overall market, meaning each autonomous application can have its private curated lending market but also lend/borrow against each other and benefit from ecosystem-wide liquidity, a value proposition that is almost custom-fit to what Canton is building. In that sense, Mystic brings to credit exactly what the Global Synchronizer is bringing to the Subnets: the ability for independent parties to create independent credit markets that can interact with each other. Mystic on Canton enables:
Subnets to have their own isolated, private lending market on the Global Synchronizer. We believe this can be a crucial stepping stone to make Canton’s vision a reality.
Attracting new curators, LPs, builders and participants by bringing composability to new assets.
Onboarding a plethora of asset issuers from other ecosystems and TradFi alike to the Global Synchronizer, which would be invaluable for Canton DeFi.
Enabling institutions to move their successful repo use cases to the Global Synchronizer by leveraging Mystic’s fixed-term and rehypothecation features.

---

## Rationale

Here’s why Mystic is uniquely well-positioned to deliver this project:

* **Existing infrastructure and user-base:** We have a fully battle-tested app with 13k MAU for curated lending, with a functional curator dashboard at curator.mysticfinance.xyz and app at app.mysticfinance.xyz. We can bring our user base over to Canton.
 **Deep operational expertise:** The Mystic team has been operating a curated lending market built on Morpho for a year now, where we’ve been working closely with curators, foundations, LPs and borrowers to build curated lending markets for different assets. We understand the nuances of operating this business, much like we have a lot of relationships we can bring over to Canton to make this project a success (for example, with curators and asset issuers). Our work has seen us reach $80M+ TVL and 33k+ users over the past year, numbers we hope to now eclipse on Canton.
* **Proven accountability and delivery:** We’ve been in the space for a while now and are happy to introduce you to any number of partners and clients that can vouch for our professionalism and ability to deliver.

As for why this is the right design - there are two main models which dominate DeFi lending, the shared model (e.g. Aave) and the isolated model (e.g. Morpho). We will here briefly compare them in efficiency and risk:
The shared model is more efficient because it enables rehypothecation, but it doesn’t scale as well because it struggles to onboard long-tail collateral (as all assets share risk, the protocol’s risk increases with any additional collateral onboarded). Isolated lending, on the other hand, can onboard assets with much more flexibility because it isolates their risk (proven by how many more collateral assets Morpho supports over Aave). However, since this model doesn’t usually enable rehypothecation, it is less efficient on a per-dollar-supplied basis. Mystic solves this by introducing a “rehypothecation rate” for the first time in DeFi, set by curators at the vault level.
Shared models are usually more user-friendly and less complex, as there’s less to understand. That is better for retail and less nuanced players. Isolated models, on the other hand, tend to be preferred by institutions and more nuanced players, as it enables them to better manage their risk. An interesting corollary effect of this is that supply rates in isolated models tend to be higher than those of shared models, although the exact cause of this is arguable.

We believe the ability to give the best rates on the best collateral will win in lending. That is only possible by isolating it. In addition, isolating risk is key in providing an institutional-grade experience, as that is what most sophisticated players prefer. And to top it all off, the flexibility in onboarding more collateral is better primed for RWAs, which have different permissioning requirements. Taking all of these into account, it seems clear to us that curated lending is the right model for Canton - better adjusted to an institutional-user base, better adjusted to the assets the chain wants to service, and even better adjusted to how the Canton ecosystem is structured (i.e. it fits the Subnets model very well, as each Subnet can have its own curated vault(s)). Not to mention, there is now ample evidence in DeFi that institutions prefer a fixed-rate lending environment, which Mystic will also support. We’re thus very confident in this design decision and that it is right for Canton.

All in all, Mystic is uniquely positioned to deliver a curated lending market of Canton, which is actually something we’ve wanted to do for a while - we reached out to the Digital Asset team back in 2024 to build this, but had to pay a 200k fee at the time to do so which ultimately led to us not moving forward with the project. The circumstances having now changed, we would love to make our original vision a reality with your help, and work together to bring Canton DeFi to the next level. Thank you for reading and for your consideration!
