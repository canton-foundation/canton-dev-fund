# Development Fund Proposal: Asset Virtualisation for Canton - Sig.Network

**Author:** Sig.Network
**Status:** Submitted
**Created:** 2026-06-09

---

## Abstract

Sig.Network requests $400,000 to give every Canton contract native access to the liquidity on Ethereum, Solana, and Hyperliquid: no bridges, no custodians, no wrapped tokens. We call this Asset Virtualisation.

Canton is built for institutions, private, configurable, and with best-in-class access to RWAs and their markets. But Canton participants also want what only public chains provide today: 24-hour swap liquidity, always-on overcollateralised credit lines, liquid perpetuals markets for hedging, and whatever yield or structuring product DeFi ships next quarter.

Today this ecosystem lives on Ethereum, Solana, and Hyperliquid, and it is hard to move. Sig.Network gives Canton applications the reach of a prime brokerage: one venue, every market, settled on Canton.

Broadly, Asset Virtualisation is a general-purpose technology which can:
- Accept deposits from any chain, directly from that chain's wallets and exchange accounts
- Withdraw funds to native or Canton accounts
- Access foreign-chain DeFi liquidity (e.g. Uniswap, Aave, Raydium, Hyperliquid)

This proposal funds the core primitive and its Ethereum, Solana, and further EVM deployments. The same foundation then carries every chain that follows: Hyperliquid and other networks will be scoped in later proposals.

Asset Virtualisation solves Canton DeFi's cold-start problem. Applications get immediate access to external liquidity and the DeFi products users already rely on: looping, leverage, yield. Canton's privacy, regulated-market access, and fast finality become strictly additive.

Temple, Canton's first institutional CLOB, and Bima, a Bitcoin-derived stablecoin, are the reference deployers for this work. The open-source SDK delivered alongside makes Asset Virtualisation available to every Canton application. It is ecosystem infrastructure, not a single-application integration.

The team executing this integration built NEAR Chain Signatures, the foundational technology underpinning this work. David Millar-Durrant (CEO; ex-Digital Asset, Dfinity, NEAR) leads delivery. Ognjen Marić, author of the original Canton Network whitepaper, advises on architectural design.

Sig.Network is already live in production on Ethereum and Solana, and the Polkadot integration is in active development. This grant brings that system to Canton.

---

## Attestations

> "The team behind Sig.Network have a long history of working with DAML and Canton technology. They are familiar with the network and liquidity fragmentation issues that have plagued interoperability protocols in the past. With their solution, Temple can offer Asset and Market Virtualization to our partners. This unlocks a very large design space for Temple and the industry as a whole."
>
> - **Dan Simerman, Co-Founder, [Temple Digital Group](https://templedigitalgroup.com/)**


> "We’re going to use the product to enable native Collar loans on Canton and for our CDP product."
>
> - **Sid Sridhar, Founder, [Bima](https://bima.money/)**

> "[Sig.Network] transforms Minted's cross-chain architecture from a validator multisig model to decentralized MPC threshold signing, while enabling multi-chain expansion starting with Solana. Sig's existing Canton POC and production Solana deployment significantly de-risk execution."
>
> - **Luis Cuello, Founder & CEO, [Minted](https://minted.app)**

---

## Motivation

Canton's institutional market infrastructure is live. But a Canton application today can only serve users who already hold Canton's tokenised assets, a fraction of the cryptocurrency capital that should be deploying here. That capital will not arrive on its own: institutions will not bridge, wrap, or re-custody assets to reach a new network when it lacks liquidity for those assets.

We are building Asset Virtualisation for Canton because Canton's applications are already asking for it. Temple needs order books backed by collateral that lives on Ethereum and Solana. Bima needs external collateral behind its credit lines. Yieldy wants to deploy on Canton without abandoning users on other chains. Different applications, all missing one thing: native access to cross-chain assets, protocols and liquidity.

The chains that have the liquidity lack what Canton has: privacy, synchronised settlement, and regulated RWA markets. We bring the two together for all Canton participants.

The alternative on file is a [wrapped token bridge](https://github.com/canton-foundation/canton-dev-fund/pull/13). Wrapped tokens cannot be deposited from CEXs or custody accounts, strand assets outside their home ecosystem's markets, and are a user experience nightmare.

---

## Use cases

Each use case below is a different participant: a venue, a market maker, an application, a borrower. All four run on the same primitive and the same open-source SDK. That breadth is the point.

### CEX like DeFi

An institution's digital-asset operations are split across exchange accounts, and a wallet per chain for DeFi opportunities. A CEX rebundles them into one account, but only by taking custody, and even then the account stops at the exchange's own books: DeFi credit, long-tail pairs, and on-chain yield stay outside.

**Problem 1: an on-chain venue is capped at its own chain's assets.** A Canton venue today can only list what is already tokenised on Canton, and a user's collateral on Ethereum or Solana cannot back a position on it. This is a large part of why custodial venues still clear 90% of cryptocurrency trading volume: the only venues offering the full asset universe and margining against it are custodial.

**Problem 2: traders choose between CEX order books and DeFi liquidity.** The deep order books live on custodial venues; the credit lines, long-tail pairs, perpetuals, and yield live in DeFi. No venue reaches both, so a desk splits its capital between exchange accounts and per-chain wallets, and pays in time and risk every time the trade is on the other side.

**Resolution.** Asset Virtualisation makes Temple a CEX that can also reach DeFi markets and liquidity. Temple can list an asset the day its chain is supported, and a single Temple account lets a user:

- Deposit USDC from a Coinbase account and ETH from MetaMask into the same account
- Trade Temple's books against that combined balance, cross-margined as one position
- Sweep idle balances into Aave, and recall them the moment an order needs the margin
- Route an order to Uniswap or Raydium when the on-chain pool is deeper than the book
- Hedge with a perpetual on Hyperliquid without moving margin out of the account

Every step settles as a standard Canton transaction, with Canton's privacy intact and no custodial intermediary. A Temple account is therefore both things at once: the place where assets from every chain are held, and the place where they participate in every market, exchange books and DeFi alike, without anyone taking custody. Every external depositor this attracts becomes a Canton participant, and every fill becomes Canton settlement volume.

### Efficient off-chain matching

Off-chain matching with on-chain settlement is now a dominant market structure:
- Polymarket runs an off-chain matching engine ($10B per month[^1])
- NEAR Intents runs an RFQ engine against locked assets ($2B per month[^1])
- CoW Swap lets searchers match orders, then offloads settlement to on-chain liquidity ($2B per month[^1])

These venues share two structural problems.

**Problem 1: Capital is trapped in one venue at a time.** A market maker's capital can only back orders on one contract at a time. If their ETH is committed on CoW Swap and a profitable order lands on NEAR Intents, they can't redeploy in time: auction windows plus chain finality run to minutes, and the auction is gone. The alternative, committing capital and settling later, slows execution. Either way, fragmentation raises the cost of capital to market-make.

**Problem 2: Trades can't be chained atomically.** Suppose one engine has deep Solana liquidity and another deep Ethereum liquidity. To execute an ETH→SOL trade, a solver breaks it into an ETH→USDC leg on the first book and a USDC→SOL leg on the second. Because the legs settle independently, the maker has to price the risk that one leg fills while the other fails, and carry the cost of unwinding it.

**Resolution.** Bringing the order books onto Canton solves both. Capital backs every book from a single synchronised position, so there is no redeployment lag, and multi-leg trades settle atomically as one Canton transaction. Sub-transaction privacy means none of this leaks order-book contents to other market participants. Finally, since the cross-chain assets are controlled directly by Canton smart contracts, settlement is guaranteed. This is the market structure Temple is bringing to Canton, and every order matched this way settles as Canton transaction volume.

### Bringing existing applications to Canton

Canton's cold-start problem has an application side as well as a liquidity side: established DeFi applications have users and TVL on other chains, and deploying on Canton means starting from zero.

**Problem: migrating an application means asking its users to migrate first.** An application's users hold their assets on its current chains and will not bridge them. So the application either stays where its users are, or deploys on Canton with no users and no TVL on day one.

**Resolution.** With Asset Virtualisation, an application deploys its logic on Canton while its users keep transacting from their existing chains and wallets, so it arrives with its user base and TVL intact and gains Canton's privacy and RWA markets on arrival. Yieldy intends to join Canton this way. Every application that arrives like this deepens Canton's liquidity for all the others.

### Collateralised credit lines and CDPs

Canton holds best-in-class tokenised RWAs, but a participant who wants to borrow against them, or against assets they already hold on Ethereum or Solana, has nowhere to go: Canton's native credit markets are thin, and the overcollateralised lending markets they would use live on other chains, where protocols like Aave hold $12B.

**Problem: collateral and credit live on different chains.** An institution holding ETH on Ethereum and tokenised treasuries on Canton cannot treat both as a single collateral base. Drawing a stablecoin line today means bridging the ETH into a wrapped representation, accepting the custody and synthetic-asset risk that the institution's mandate forbids, or leaving the position idle.

**Resolution.** With Asset Virtualisation, a Canton CDP or lending application reads the user's real home-chain collateral directly and issues credit against it on Canton. The collateral never leaves Ethereum or Solana and is never wrapped. Bima uses this to enable native Collar loans and its CDP product on Canton: a user posts external collateral, draws a Bitcoin-derived stablecoin line, and settles back to their home-chain address. Liquidations and margin calls execute as standard Canton transactions, with Canton's privacy and settlement guarantees, while the underlying collateral stays real and on its home chain throughout. Each credit line drawn this way brings an external borrower, and their collateral base, into Canton's transaction flow.

## Specification

### 1. Objective

Enable users on Ethereum, Solana, and additional networks to deposit and withdraw native assets into Canton applications using standard wallets, with no bridging, wrapping, or new infrastructure on the user's side. Deliver an open-source Asset Virtualisation SDK that any Canton application can adopt.

### 2. Implementation Mechanics

**How Asset Virtualisation works:**

1. A user initiates a transaction on their home chain (e.g., ETH deposit from MetaMask)
2. Sig's decentralised MPC validator network detects the action and constructs the canonical Canton transaction
3. Sig signs and submits the transaction to the Canton application using chain-signature cryptography
4. The Canton application executes it as a standard Canton transaction: privacy, compliance controls, and settlement guarantees intact
5. Settlement flows back to the user's home-chain address via the same MPC path

No assets are locked. No wrapped tokens are minted. The home-chain asset remains real and unencumbered throughout. External liquidity is accessible to Canton applications in real time, without creating synthetic representations of those assets on Canton.

**Deliverables per milestone:** a live mainnet integration for each supported chain, and an open-source TypeScript SDK with Temple as the reference implementation.

### 3. Architectural Alignment

Asset Virtualisation is designed around Canton's core properties:

| Canton Property | How Asset Virtualisation Preserves It |
|---|---|
| Sub-transaction privacy | External chain actions resolve to Canton identities; external observers see standard home-chain transactions, not Canton order flow |
| DAML transaction model | Sig converts external actions into standard Canton transactions; Canton applications process them identically to native transactions |
| Settlement guarantees | Assets remain on home chains; settlement paths are cryptographically bound; no custodial intermediary |
| No custody assumption | Sig's MPC holds policy-bound signing authority, not funds |

No Canton protocol changes are required. Applications opt in by calling Sig's Canton smart contracts to perform multichain actions; beyond adding those calls, existing application contracts are unchanged.

### 4. Backward Compatibility

No backward compatibility impact. All components are additive. Existing Canton participants and Canton protocol behaviour are unchanged.

### 5. Alignment with Canton Priorities

This proposal sits squarely in the Q2 2026 priority area of **App Building and Developer Experience**: it delivers interoperability across wallets, assets, and dApps, and removes the largest source of user friction, reaching Canton applications from standard external wallets. The open-source SDK is a shared ecosystem asset rather than a single-team integration, and adoption is the funded measure of success: Milestone 2 requires two applications live in production and Milestone 3 requires $1M of organic volume.

---

## Milestones and Deliverables

### Milestone 1: Mainnet - Ethereum + Open-Source SDK
- **Estimated Delivery:** June 29, 2026
- **Focus:** End-to-end Ethereum integration validated on Canton DevNet, then launched to production. Ethereum users can deposit and withdraw native assets into Canton applications via standard wallets. SDK publicly released.
- **Deliverables / Value Metrics:** Full Ethereum deposit and withdrawal flow demonstrated end-to-end on Canton DevNet, SDK integration complete and reviewed by Temple, live mainnet integration (Ethereum), open-source Asset Virtualisation SDK published with documentation.

### Milestone 2: Mainnet - Application Adoption
- **Estimated Delivery:** August 1, 2026
- **Focus:** The SDK proves out as ecosystem infrastructure: two Canton application development teams running Asset Virtualisation in production.
- **Deliverables / Value Metrics:** Two Canton applications live on Canton mainnet processing transactions through the Asset Virtualisation SDK

### Milestone 3: User Adoption
- **Estimated Delivery:** September 1, 2026
- **Focus:** Demonstrated production usage of the integrations delivered in the preceding milestones.
- **Deliverables / Value Metrics:** Minimum $1M in organic deposit and withdrawal volume within any 30-day window on Canton mainnet. Doesn't block Milestones 4 or 5.

### Milestone 4: Mainnet - Solana
- **Estimated Delivery:** October 1, 2026
- **Focus:** Native Solana asset deposits and withdrawals. Unlocks SOL and Solana-native assets and liquidity within Canton's institutional markets.
- **Deliverables / Value Metrics:** Live mainnet Solana integration; open-source Solana chain adapter; documentation; SOL and Solana-native assets accessible on Canton

### Milestone 5: Mainnet - Additional EVM Networks
- **Estimated Delivery:** November 1, 2026
- **Focus:** Expand to BNB and Polygon, broadening the native liquidity and asset classes accessible on Canton.
- **Deliverables / Value Metrics:** Live mainnet integrations for two additional EVM networks; SDK updated with new chain adapters; network-specific documentation published; demonstrated live use of a swap provider (e.g. Uniswap) and a yield provider (e.g. Aave) with virtualised assets on at least one supported chain

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- End-to-end deposits and withdrawals from each supported chain demonstrated live on Canton mainnet
- Open-source SDK published to a public repository with integration documentation
- Temple live with external-chain users executing transactions through the integration
- Two Canton applications live on mainnet using the integration by M2
- From M5 (Additional EVM Networks) onwards: demonstrated live use of a swap provider (e.g. Uniswap) and a yield provider (e.g. Aave) with virtualised assets on each supported chain
- Volume metric met at M3: $1M deposit/withdrawal volume within any 30-day window on Canton mainnet

---

## Funding

**Total Funding Request:** $400,000 USD equivalent in Canton Coin

### Payment Breakdown by Milestone

- Milestone 1 (Mainnet - Ethereum + SDK): $150,000 CC equivalent upon committee acceptance
- Milestone 2 (Application Adoption): $50,000 CC equivalent upon committee acceptance
- Milestone 3 (User Adoption): $100,000 CC equivalent upon committee acceptance
- Milestone 4 (Mainnet - Solana): $50,000 CC equivalent upon committee acceptance
- Milestone 5 (Mainnet - 2 Additional EVMs): $50,000 CC equivalent upon committee acceptance

### Volatility Stipulation

The project duration is under 6 months (May–November 2026). CC amounts for each milestone will be calculated at the 30-day moving average of CC/USD at the time of milestone submission. Should the project timeline extend beyond 6 months due to Committee-requested scope changes, remaining milestones will be renegotiated to account for significant USD/CC price movements.

---

## Co-Marketing

Upon each milestone release, Sig.Network will collaborate with the Canton Foundation on:

- Announcement coordination for each mainnet launch
- Joint technical blog post or case study demonstrating Asset Virtualisation in production
- Developer documentation and ecosystem promotion for the open-source SDK

Temple Digital Group, as the first production user of the integration, will provide independent co-marketing support at each milestone.

---

## Maintenance and Sustainability

The Asset Virtualisation SDK and the underlying validator network are part of Sig.Network's core product. Sig.Network operates and maintains both after the grant period, exactly as it does for the live Ethereum and Solana deployments today. The SDK is open source, so the Canton ecosystem retains the integration layer under an open licence regardless.

---

## Rationale

**Why Sig.Network:**

Sig.Network was built by the team that created NEAR Chain Signatures, the foundational chain-signature MPC technology that makes Asset Virtualisation possible. Ethereum and Solana integrations are live in production, and the Polkadot integration is back in active development. The Canton integration is the next deployment of a proven system, not greenfield research.

David Millar-Durrant (CEO) is ex-Digital Asset, with direct experience building on DAML and Canton infrastructure. Ognjen Marić, author of the original Canton Network whitepaper, advises on architectural design. This combination, the team that built the underlying technology and the person who defined Canton's architecture, is the strongest possible execution pair for this integration.

Temple is already in production using this integration, with a public Q2 2026 go-live commitment. This grant de-risks and accelerates a delivery already underway. Asset Virtualisation is also the foundational layer for future Canton capabilities, including cross-chain access to tokenised assets and sequencer interoperability with other networks, but those are distinct workstreams. This grant funds the core primitive those capabilities will build on.

**Why this approach over a bridge:**

The wrapped-token bridge architecture introduces custody risk, a bridge attack surface, and synthetic representations of assets that institutional counterparties will not accept in place of the real thing. Asset Virtualisation introduces none of these. Assets remain real and on their home chains. Canton's synchronised settlement extends to external participants without Canton ever holding or wrapping their assets.

This is not a design preference. It is an institutional requirement, and why every institutional Canton application that follows will need the same primitive.

[^1]: Figures as of June 2026
