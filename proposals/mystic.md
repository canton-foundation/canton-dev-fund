**Author:** Mystic Finance
**Status:** Submitted
**Created:** 2026-09-28
**Champion:** Gabi Tuinaite, Bitsafe
**Label:** defi-protocols
**RFPs:** RFP 13 "Payments & DeFi" and RFP 12 "RWA Standards"

# Abstract

Financial applications on Canton need vaults for different purposes: issuing new assets, running strategies, building new financial primitives. Today, everyone building with vaults on Canton is building their own implementation from scratch, meaning third-parties have to build custom integrations for every single vault, a lot of the work is redone and a lot of risk is introduced (on EVM, vault share accounting was a known source of bugs before ERC-4626 was introduced). This also slows down development a lot, limits modularity and silos capital.

Mystic fixes this by introducing a CIP for an open-source tokenized vault standard that any financial application or asset issuer on Canton can build upon and thus have an easier time launching on Canton. The standard will, through feedback from multiple entities building with vaults on Canton, consider different use cases such that anyone building on the standard will be able to have their vault integrated by third-parties without them having to do any custom work.

We are in touch with 18 teams building vaults in Canton and it's pretty unanimous that a standard is needed to make sure everyone is building safe, compatible vaults that won't silo the capital in DeFi. Future vault builders are even reaching out to us for help, wanting to make sure their vaults will be aligned with the standard. We also know, from entities working closely with TradFi institutions exploring pilots on Canton, how absolutely vital vaults will be in creating the financial plumbing they will use when coming on-chain. We are thus confident in the broader need for this standard, which we have been working on for a while now while in close contact with the Cashen team. All the 18 teams mentioned will be able to have a say in the standard before a CIP is introduced.

We will introduce this as a common good for everyone building on Canton to enjoy, as well as provide the ongoing support needed to maintain and upgrade the standard over time. This PR will mean open-sourcing and bringing to everyone a much needed piece of infrastructure that many already need, which we're confident will mean a safer, more collaborative and efficient environment for all.

# Specification

## 1. Objective

Vaults have become the bedrock of modern DeFi. On EVM chains, lending markets, yield strategies, tokenized funds and treasury products almost all end up as vaults in one form or another. Since ERC-4626, they also all share one interface. Canton is now where EVM was before that standard. Vaults are being built quickly, and each team is making its own choices about how deposits, share accounting and redemptions work. On EVM, that ultimately created a lot of bugs around share accounting and problems with interoperability.

All of this dramatically slows down Canton adoption, as teams need to redo a lot of foundational work instead of focusing on their own products and use cases. Not to mention, causes a lot of fragmentation that in the long run, will cost the ecosystem dearly.

The intended outcome of this proposal is an approved CIP that defines 4 tokenized vault standard interfaces on Canton, which together form the vault standard. This will be accompanied by an open-source reference implementation and a conformance suite any team can run against their own vault, to make sure they're conformant. For integrators (e.g. wallets, custodians), supporting the standard means that they can integrate any conformant vault without new code. For builders, they can ship vault products much faster and now focus on their use case.

## 2. What Already Exists vs. What Is Net-New

CIP-56 and CIP-112 give Canton a common model for holdings, transfers and allocations, but they stop short of the vault itself. There is no shared definition of depositing into a pool in exchange for shares, of how those shares are priced, or of how a redemption is requested and settled. A new piece of infrastructure is needed for that, which takes the existing token standards and drives them further to create a unified vault standard.

As mentioned above, we are in contact with 18 teams building vaults on Canton. This means that there are many implementations out there already, all of them are different to each other. There are likely even more out there that we don't know of yet. This means we are already seeing the beginning of the fragmentation we warn about, which is only going to get worse as more builders come to the chain and are forced to build without a standard.

What we're introducing here is clear - a new standard that anyone can use to create their own vault product. More specifically:

- Daml vault interfaces covering deposit, mint, withdraw and redeem; request queues for async deposits and redemptions and a single vault View.
- A standard model for share accounting and exchange rates, with safety rules built in (rounding direction, protection against first-depositor inflation, slippage bounds).
- Vault shares issued as ordinary CIP-56 holdings, so any standard wallet can hold them with no changes.
- An MIT-licensed reference implementation and a conformance suite that any team can use.

Nothing already in place is replaced or changed. The standard merely adds a missing layer, the vault, on top of the holdings and allocations logic CIP-56 and CIP-112 already define.

## 3. Implementation Mechanics

What we're proposing here is a set of 4 different interfaces, which together form the standard. It accepts a single holding as deposit and issues another holding as vault share. Redemptions are processed by burning vault shares and, in exchange, give users back the assets they deposited. Because vault shares are ordinary CIP-56 holdings, any wallet or custodian that already supports them will support vault shares with no vault-specific code.

The standard is four Daml interfaces - Vault, VaultAsyncDeposit, VaultAsyncRedeem and VaultEventLog. Every vault implements Vault, which features four choices that move assets and ten read methods that price them and report the vault's limits. Vaults that queue deposits (as in ERC-7540 logic) also implement VaultAsyncDeposit, and vaults that queue redemptions also implement VaultAsyncRedeem. Each of these adds one choice to place a request and one read method to track it. A wallet can therefore tell, from the interfaces a vault implements, how deposits and redemptions are processed. Vaults that want to make their activity available to third-parties also implement VaultEventLog, which adds one choice.

The overall total nineteen choices and methods referenced here are:

- 4 core choices - Vault_Deposit, Vault_Mint, Vault_Withdraw, Vault_Redeem. These move the underlying between the depositor and the custodian, and mint or burn the vault's shares to match. Each one takes a slippage limit and fails without changing anything if the rate moves past it.
- 4 "max" methods - maxDeposit, maxMint, maxWithdraw, maxRedeem. These report the ceiling on each action before it is attempted.
- 4 preview methods - previewDeposit, previewMint, previewWithdraw, previewRedeem. These give the outcome of an action, including fees, before it is taken.
- 2 conversion methods - convertToShares, convertToAssets. These price the exchange of vault shares to assets provided.
- 2 request choices - Vault_RequestDeposit on VaultAsyncDeposit, and Vault_RequestRedeem on VaultAsyncRedeem. These queue a deposit or a redemption for vaults whose underlying cannot settle on demand. The funds are escrowed as a CIP-112 allocation instead of being transferred, and their price is defined when a request is filled. There are two consequences of this: queued requests have no slippage limit and the preview methods fail on queued deposits/redemptions.
- 2 pending methods - pendingDepositRequest, pendingRedeemRequest. These report what is still queued for a party under a request. Every conformant vault reports in-flight requests the same way, so a wallet shows one status across all of them.
- 1 reporting choice - VaultEventLog_PositionChange on VaultEventLog. They signal to the vault's observers that a party's position has changed, reporting the transaction's details. Important to note that the registrar controls the reporting choice, the parties to notify are named on the choice, and reporting has no effect beyond making the event visible. The vault exercises it in the same transaction as the action it reports. Without it, every integrator builds custom indexing per vault, which is the fragmentation this standard exists to remove.

Comments and design decisions:

- Every choice in the standard is nonconsuming, so no user action rewrites the vault contract and depositors never contend with each other for it. If the choices were consuming, depositors would have to take turns, and anyone whose deposit arrives while another is in flight is rejected because the vault has been archived.
- Rounding in every method will be fixed and will always favor the vault. A deposit that would mint zero shares will be rejected. That, together with a virtual offset carried in the vault's published totals, is our mitigation for the first-depositor inflation attack.
- A wallet is not a stakeholder of the vault contract, so it cannot read the vault's state or call any of the methods above. Everything a wallet needs will be published in a single view. That view carries the vault's stable identifier, its registrar and custodian, both instruments, the totals, the rate, and how long that rate holds. Vaults that queue will also publish the escrow deadline window and the parties allowed to settle or cancel a pending request, so a depositor can judge both before committing funds.
- We assume every vault deployer will create an API that enables external parties to not only read this view, but exercise the above choices when allowed to. The vault serves the view together with the contract's created-event blob, and the wallet attaches that blob to its own submission. This is what gives parties with no visibility over the vault's contracts the ability to interact with it. We will submit a template for this API also, along with a conformance test suite that any implementation can run.

## 4. Long-Term Ownership and Maintenance Post-Merge

In terms of maintenance, Mystic hereby commits to maintain the vault standard and continue its development and compatibility updates for a period of minimum 12 months after the completion of milestone 2, should the grant be approved. This will be funded by protocol operations; we will not ask for additional grants to maintain the code. We will otherwise work with the ecosystem to support any changes necessary, fix bugs that arise, update dependencies and solve CIP-compatibility issues to ensure the vault standard remains broadly usable by everyone in the community.

In terms of ownership, the vault standard and all its interfaces will be completely open-sourced via the MIT license, so it's available for anyone in the ecosystem to use.

## 5. Architectural Alignment

The vault standard builds on the existing CIP-56 and CIP-112 token standards and changes nothing that came before it. It adds the vault layer by introducing specific vault interfaces and reuses everything else. In more details:

- It builds on the existing CIP-56 and CIP-112 token standards: The vault shares are CIP-56 token holdings, async deposits and redemptions settle through the existing CIP-112 allocation framework, and reporting follows the EventLog pattern. There is no new token or settlement model added.
- It makes no change to the core infrastructure: Nothing in Splice, Amulet, the DSO models or the SV app needs to change. The standard is a standalone set of Daml interface packages and an OpenAPI specification.
- It uses tools Canton already has. The standard relies on existing features for reading state using Interface Views, discovery using CNS metadata and OpenAPI registry endpoints, and settlement using allocation-based DvP. This means that a team that has already integrated the token standards will already be familiar with the standard.
- It preserves Canton's privacy model: Integrators only see the vault information and the transaction events they need. Details like positions, counterparties and strategies remain visible only to parties authorized to see them.
- It works with different custody setups. The standard supports single-party custody, DecParties and BitSafe's Decentralization Manager, which lets institutional custodians take part without changing their setup. Obsidian's CCP will be supported also.
- It supports Canton's ecosystem goals: The proposal answers RFP 13's call for reusable DeFi standards that serve many applications, and RFP 12.2's call for institutional RWA workflow standards almost to the letter.

# Milestones and deliverables

## Milestone 1: Design, Ecosystem Feedback & CIP Submission

Estimated delivery: 2 months from grant approval

Funding: 500,000 CC upon acceptance

Focus: Deliver sync and async vault reference implementations, create a working doc and incorporate in it feedback from the ecosystem and submit the CIP.

**Deliverables:**

- Complete sync and async vault reference implementation, all its interfaces.
- Create a working doc with the full specifications of the vault standard and share it with the 18 teams we're in touch with, to get their feedback. Incorporate as much of it Submit CIP

**Note:** either the Foundation's technical team audits the package, or a third-party needs to. If the Foundation has the availability to do it, no further funding is required. Otherwise, we hereby request an earmarked additional 800,000 CC to be spent exclusively on audits. We can also send you the invoices for you to cover, if easier.

**Ecosystem value:** The CIP submission will accelerate a vault standard on Canton. In addition, including ecosystem feedback will make it much more likely that the vault is of high quality and accepted moving forward.

## Milestone 2: Daml packages, audits and delivering the standard

Estimated delivery: 2 months from CIP approval

Funding: 500,000 CC upon acceptance

Focus: Deliver the finished Daml packages, audit them and deliver the standard

**Deliverables:**

- Daml packages for both sync and async vault implementations.
- Audit reports from two different audit firms with no high or medium severity findings.
- Conformance test suite for anyone to ensure their vault meets the standard.
- Iterate on all outstanding feedback before merge.
- Extensive developer documentation so anyone can easily build on the standard.

**Ecosystem value:** Open-sourced vault standard that anyone can use to build vault products on Canton.

## Milestone 3: Ecosystem Adoption

- **Estimated Delivery:** Up to 12 months from Milestone 2 completion
- **Funding:** 100,000 CC per team that adopts the standard, up to a maximum of 10 teams (1,000,000 CC maximum)
- **Focus:** Drive ecosystem-wide adoption of the vault standard.

**Deliverables / Value Metrics:**

- Outreach and work with community players to drive standard adoption.
- Work with them to deliver Mainnet use cases of the vault standard.

**Ecosystem value:** This directly measures if the standard has adoption and if it is reducing friction of building on Canton.

# Acceptance Criteria

Completion will be tracked by the deliverables completed as per each milestone. We'll also be available to share further technical documentation and facilitate any necessary introductions to teams building on the standard. More specifically, per milestone:

- **Milestone 1:** Public working doc, vault reference implementations available and CIP approved.
- **Milestone 2:** Daml package and conformance test suite published and available to everyone open-source; developer documentation publicly available.
- **Milestone 3:** Payments released upon verified adoption of each partner, up to 10. Confirmations done via direct Github repo sharing or team introductions.

# Funding

**Total Funding Request:** 1,000,000 CC for Milestones 1 and 2, plus a variable amount for Milestone 3 dependent on adoption of the standard. Per milestone:

**Milestone 1:** Design, Ecosystem Feedback & CIP Submission - 500,000 CC

**Milestone 2:** Daml packages and delivering the standard - 500,000 CC

**Milestone 3:** Ecosystem Adoption (max 10 teams) - 100,000 CC per team, capped at 1,000,000 CC

## Volatility handling

The milestone amounts are denominated in Canton Coin (CC) using a baseline reference price of 0.13 USD per CC. To account for volatility, we propose to reassess the 30-day moving average of CC/USD price when each milestone ends. The proposed approach:

- If the moving average price at the end of a milestone is within 25% of 0.13 USD per CC, nothing changes in the amount of CC disbursed.
- If the moving average falls outside this interval, we propose the USD amount is recalculated according to the new price. So, for example, if CC moving average is at 0.08 USD at the end of a milestone, the amount disbursed is the milestone's USD amount expressed in 0.08 CC prices.

This way, Mystic is flexible on CC volatility and we can execute the project without excessive complexity whilst also accounting for extreme volatility.

# Co-Marketing

Upon each milestone release, Mystic will collaborate with the Canton Foundation on:

- Joint announcements of the vault standard's availability on Canton;
- Joint blog posts and technical deep dives of what it enables on Canton;
- Case studies of teams building on the standard;

# Motivation

Many projects are currently building vault-based products on Canton. Without a unified standard, every single one of them has to build their own vault from scratch, risking introducing bugs like what has happened before on EVM. Not only that, integrators are forced to build new integrations for every single new vault interface they want to support, creating a lot of friction, reducing modularity across the ecosystem, and increasing development costs. Overall, this introduces unnecessary complexity to the Canton ecosystem.

A unified vault standard solves this problem. When all vaults share the same standard, integrators need only support that standard's interfaces and they'll automatically support all vaults. Builders, on the other hand, need to code a lot less and can focus on the use cases relevant to their product. This will also dramatically facilitate onboarding new protocols and asset issuers to the ecosystem, as the needed development cost to come on Canton goes down significantly.

That is exactly what this proposal aims to introduce. We have been working on this already for a while now and are close to a working doc we can share, as well as a sync vault reference implementation as well. We have been working closely with the Cashen team on this, with whom we plan to co-author the standard, and more recently, the Obsdian team has also agreed to help drive the Standard. 16 more teams await our completion to share their feedback.

This proposal has a clear, positive impact on Canton, as a unified vault standard makes building easier, improves interoperability and reduces development costs to all on the network, thus making it more open and collaborative. As we have seen, vaults have become a critical piece of DeFi on EVM. We expect the same will happen (and already is happening) on Canton. Meaning the sooner we introduce a standard, the better.

# Rationale

## Why Mystic

Mystic is building a curated lending market on Canton, meaning we are building lending vaults on Canton ourselves. That's when we realized we'd really benefit from having a vault standard, and so when we realized there were none, we set out to build one ourselves. We have built vaults on EVM on an LST tied to the Plume token and have extensively operated Morpho vaults across Plume, Flare and Citrea, where our vaults total $80M+ in deposits. This experience has given us a deep understanding of vault standards, which allows us to identify which parts to carry over to Canton and which parts not to. Furthermore, since we need the standard ourselves, we know exactly what builders on the ground need to see, are in touch with many teams like ourselves and can thus implement and dogfood the standard as we build it.

Not only that, we've been talking to 18 teams that want to see the same happen on Canton, and are ready to help contribute to the standard. This means we will not only build this ourselves, but we'll further coordinate with a larger cohort of people to make this a reality.

## Why this approach

Treating a vault as a token issuer is the right design for Canton's architecture. The existing token standards already use this pattern (e.g., Holding) to define assets that every registry implements independently and that every wallet integrates with once. The Canton Vault Standard extends this model to any vault-issued position, yield-bearing or not, reusing the disclosure mechanism registries already serve so it integrates naturally with how Canton applications are built and maintained.
