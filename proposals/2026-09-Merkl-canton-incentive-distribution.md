## Development Fund Proposal: Merkl: Incentive Distribution Infrastructure for Canton

| Field | Value |
| :---- | :---- |
| Author | Baptiste Guerin (baptiste@merkl.xyz) |
| Org | Merkl |
| Status | Draft |
| Created | 2026-09-08 |
| Revised | 2026-09-08 |
| Label | defi-liquidity |
| Champion | Looking for champion (in talks with Digital Assets) |

---

## Abstract

**This application stems from live Canton apps asking Merkl to support Canton.** Edel Finance and Minted each approached Merkl directly, because they hold Canton Coin allocated for growth and have no way to spend it on measured onchain activity. Their constraint is not budget, it is the absence of a distribution engine: today CC earmarked for growth can be spent on social and manual programs, and not on liquidity, holding, volume or lending behaviour. The Foundation has introduced Merkl to further applications with the same constraint, Alpend among them. This proposal responds to that demand rather than anticipating it.

Edel and Minted have expressed direct interest. Alpend is in discussion.

### What is Merkl

Merkl is the incentive and yield distribution layer for onchain finance. It has distributed **$1.8B+ for 250+ companies across 65+ chains**, to **5M+ unique wallets**, and is the reward engine behind Aave, Morpho, Uniswap, Ethena, Coinbase, Robinhood, Sky and Plasma ([merkl.xyz](https://merkl.xyz/)). Five workloads, all of which Canton needs: stablecoin yield distribution, chain and protocol growth, tokenized-asset dividends and coupons, retail Earn programs, and private payouts to vendors, contractors and cardholders. Named programs and published results are in Case Studies.


Canton apps today distribute by hand, and **the CC sits in application treasuries, not the Foundation's**, so every app must build redistribution itself before it can spend that CC on anything measurable (§Motivation). This proposal brings Merkl to Canton as **shared ecosystem infrastructure**: a campaign engine any Canton app can point at.

### Merkl live use cases and clients

#### Stablecoin yield distribution
- Merkl distributes yield to stablecoin holders based on activity, in compliance with crypto regulations
- Notable clients: Paypal (PYUSD), Ripple (RLUSD), Ethena (USDe), Sky (USDS), World Liberty Finance (USD1)

#### Chain/Protocol bootstaping and growth

- Merkl temporarily boost yields to cover the initial opportunity cost of users depositing liquidity on new chains, protocol and markets
- Notable Clients:
    - Protocols: Morpho ($100M+), Aave ($130M+), Uniswap ($50M+)
    - Chains: Plasma ($60M+ incentive program), Arbitrum ($30M+), Unichain ($30M+), Base ($30M+)


#### Tokenized assets

- Merkl distributes dividends, coupons, and yield to holders of tokenized shares, bonds, and funds
- Notable clients: Base  tEquities, Binance's bStocks, Midas's mGLO

#### Retail oriented earn programs

- Merkl powers Earn sections in wallets, fintechs, and exchanges by adding yield on top of native rates
- Notable clients: Robinhood, Coinbase, Kraken, Metamask, Trustwallet


#### Private Payments

- Protocols can leverage Merkl's distribution capabilities to Pay employees, contractors, and vendors onchain, without exposing addresses or amounts publicly
- Card issuers can leverage Merkl to pay cashback rewards with a single API call

### What Merkl will deliver on Canton

The grant delivers, in four parts:

1. **Canton as a Merkl Flow chain**: token-standard transfers, batching, preapprovals, and a claim flow where the recipient signs an authorization. Outcome: you can airdrop on Canton with Merkl.
2. **A Canton indexer**: visibility-granted, PQS-based, starting with token holders. Outcome: you can reward users who hold tokens on Canton.
3. **Protocol and payout support**: DEX, lending and issuer integrations across named Canton apps.
4. **A private payout rail**: cashback, rebates, referral and vendor payouts, triggered either by onchain monitoring or by a client API call, with each payout visible only to its own stakeholders.

**Funding request: 8,000,000 CC committed (≈ $960,000 at $0.12/CC), and up to 10,000,000 CC in total.** The committed portion funds **Milestones 1 and 2**, paid retroactively in three claims against delivered, verifiable milestones. The remaining **2,000,000 CC is per-protocol**, at 250,000 CC per Canton application: 150,000 CC once that application has **signed an integration agreement and granted visibility**, and 100,000 CC once it is running **a live campaign**. **20% of the ceiling cannot be claimed unless a named third-party Canton app has actually committed.** No funds are requested up front: Merkl carries the full direct cost and claims only against delivered, independently verifiable work.

Merkl asks the Foundation for **no volume commitment and no treasury outlay beyond the milestones**. Instead Merkl binds itself unilaterally to its standard rate on Canton, paid only by protocols who stream incentives or yield via Merkl. Merkl's return therefore depends on Canton applications actually using the infrastructure, which is the correct alignment.

The Canton-specific layer (chain adapter, Daml packages, registrar seed list, and the integration specification) ships **open source under Apache 2.0**.

---

## Motivation

### Canton has no incentive layer but its tokenomics guarantee it needs one

Canton routes the majority of emissions to applications and leaves each application to redistribute by hand. From January 2026, **62% of the total rewards pool, around 516 million CC, is shared among app providers every month**. Every featured app receiving that CC faces the same four problems: measure who did what, decide what each user earned, pay them, and prove the payout was correct.

Every Canton app solving this alone is duplicated effort on a problem that is entirely solved elsewhere:

- **Tradecraft**: *"Rewards distributed monthly based on your share of pool liquidity and lock duration"* ([tradecraft.fi/rewards](https://tradecraft.fi/rewards)). Hand-run, monthly, no continuous accrual.
- **BitSafe**: *"When CBTC trades on your venue, Canton Coin rewards follow, and BitSafe shares them with the venue that hosts the activity"* ([bitsafe.finance](https://bitsafe.finance/)). A revenue-share program with no distribution engine underneath.
- **Edel Finance**: *"has already distributed Canton Coin (CC) rewards across three separate distributions to its early users"* ([Chainwire](https://chainwire.org/2026/07/09/edel-finance-releases-markets-private-execution-for-programmable-markets/)), while already using Merkl for all of its yield distribution on Ethereum.
- **Helvet Swap**: *"A post-launch incentive program is in development"* ([cantonnews.org](https://cantonnews.org/projects/helvet-swap)). **Ekiden** and **Silvana** each built and now maintain an in-house points ledger.

That is six teams building the same thing in parallel. The absence is structural: **Canton has no shared measurement-and-payout primitive, so incentive design on Canton is limited to what a team can run by hand.**

### What Merkl brings that cannot be reproduced per-app

Merkl is not a claim contract. It is a measurement engine with 220 supported protocols, 24 scoring methods, 20 distribution methods and 32 eligibility hooks, all live in production. An app that integrates once gets:

- **Continuous, exhaustive accrual.** The engine reconstructs each participant's exact position from events, then integrates over the campaign window with no approximations ([docs.merkl.xyz](https://docs.merkl.xyz/merkl-mechanisms/technical-overview)). No snapshots, so no gaming the snapshot block.
- **Rate targeting, not just budgets.** `FIX_APR`, `MAX_APR`, `TARGET_APR_WITH_MERKL`, `NET_APR`: Merkl pays `max(target − reference APR, 0)`, so an issuer guarantees a rate rather than dumping a budget. A live `SOFR_SPREAD_RATCHET` method targets `SOFR + spread` against the NY Fed 30-day average.
- **Eligibility gating regulated issuers need.** OFAC screening via the Chainalysis Sanctions Oracle, offchain-mutable KYC allow/denylists, per-user caps, health-factor conditions, balance floors and ceilings.
- **Payouts, not only incentives.** The same engine pays cashback, rebates, referral bonuses and vendor payments, in production through **Merkl Pay** ([pay.merkl.xyz](https://pay.merkl.xyz)) and the Earn programs Merkl operates for Coinbase, Robinhood and Deel. A Canton payment app, card issuer or venue gets a payout rail without building one (§2.4).
- **Paying-agent workflows for tokenized assets.** Merkl acts as the onchain paying agent for tokenized funds, treasuries and equities ([guide](https://studio.merkl.xyz/guides/tokenized-finance/distribute-dividends-onchain-with-merkl)), cleanly split from the transfer agent, which supplies only an asset address, a timestamp and an amount ([Merkl](https://blog.merkl.xyz/transfer-agent-vs-paying-agent)). Given Canton's asset mix (USDCx, USYC, cETH, CBTC, Fractit), this is one of the highest-value workflows Merkl brings.

### Why nobody has built this on Canton yet

The gap is not an oversight, it is a difficulty. Three properties of Canton make the implementation challenging, and all three are addressed in §2:

- **There is no permissionless read.** `eth_getLogs` and `balanceOf` at a block have no Canton equivalent, and a **non-stakeholder does not learn that the transaction happened**. Every existing incentive engine assumes global observability, so measurement has to be rebuilt against a privacy model that inverts it. This is the hard part of the proposal, and the part no single app team has reason to build (§2.3).
- **The merkle-root claim pattern does not transfer**, so a port of the industry-standard design is not available (§2.1).
- **Batched, quorum-signed payout at scale is undocumented.** Traffic credits are non-transferable, so the distributor pays for every payout transaction, and nobody has published what a ~100-leg batched token-standard transfer costs.

This is why six teams have each built a partial, manual version instead: the full version needs a measurement engine, a custody substrate and Daml expertise at the same time. Merkl already has the first two in production and is upskilling for the third.

### The ecosystem share that benefits

In the [Canton ecosystem directory](https://www.cantonecosystem.com/) we found **15–25 live apps today with a token or a liquidity venue**. This proposal names 8 and targets 8 live in production by Milestone 3, plus every issuer using Merkl's paying-agent workflows. As DTCC's tokenization service (October 2026) and further issuers arrive, the addressable set grows with no additional integration work: **the marginal cost of the ninth Canton app running incentives drops to configuration.**

### Alignment with the fund's scope

The Development Fund's stated scope covers *"Developer tools and SDKs"*, *"Reference implementations"*, *"Critical ecosystem infrastructure"* and *"DeFi liquidity seeding where required for early utility"*. Incentive distribution sits in all four. It is also the mechanism by which the fund's *other* investments become visible: a DEX with no liquidity program cannot bootstrap, however good its Daml.

---

## Current Demand and Design-Partner Validation

Merkl did not decide to expand to Canton and then look for users. Canton applications asked, Merkl scoped the work, and this proposal is the result.

**Edel Finance** asked Merkl to support Canton. It already runs all of its yield distribution through Merkl on Ethereum and is building on Canton ([Chainwire](https://chainwire.org/2026/05/27/edel-markets-is-building-the-on-chain-perps-exchange-that-wall-street-can-actually-use/)), having run three manual CC distributions in the interim: same counterparty, same need, on a chain Merkl does not yet support. **Minted** asked for the same reason, stated plainly: it holds CC allocated for growth and can spend it only on manual and social programs. **Alpend**, a Canton money market, was introduced by the Foundation as a candidate with the same need. **Helvet Swap** and **Trade.Fast** both advertise liquidity reward programs with no engine built.

Merkl has also held technical scoping calls with Canton Network engineers on participant-node topology, PQS access patterns and observer-rights onboarding. Those findings shaped §2.3, in particular leading with `CanReadAsAnyParty` + PQS rather than requiring Daml changes from partners.

**Written confirmations.** Merkl is collecting a short written statement of need from each named application, and will post them in the proposal thread before seeking a champion.

---

## Specification

### 1. Goal

**Make Canton a fully supported Merkl chain, so that any Canton application can run measured, continuous, rule-based incentive campaigns without building distribution infrastructure.**

Single goal, three sequenced capabilities: pay on Canton (M1), measure on Canton (M2), integrate Canton protocols (M3).

### 2. Implementation Mechanics

#### 2.1 Adapting the Merkl Flow to Canton

**How Merkl works today.** The engine computes rewards continuously, then every 4–12 hours per chain merges them into a merkle tree and pushes the root to a `Distributor` contract. After a 1–2 hour dispute window watched by independent bots, users claim against the root with a merkle proof. This requires **three contracts deployed and maintained per chain**, on 65+ EVM chains plus Stellar.

**Why a merkle root is the wrong design on Canton.** Not impossible: Daml has stable `sha256` and `keccak256`, and a `nonconsuming` choice with a flexible controller can express a pull claim. The escrow's signatory must be the distributor, not the claimant, because the claimant's authority does not exist at creation time and the funds are the distributor's. The distributor is therefore already on the hook for the contract, the traffic and the escrow. There is also no global storage cost to amortise on a ledger where nodes store only relevant data, and the proof is extra payload the claimant's own validator pays for in non-transferable traffic credits, the exact inverse of the EVM incentive. **The merkle root buys no trust reduction whatsoever, and costs both sides more.**

**What Merkl Flow does instead.** Accounting and custody move off-chain into a ledger **replicated across N validators run as separate failure and compromise domains**, where funds move only via a **threshold t-of-n TSS signature** (the PoC runs 3-of-4; `n` and the production operator set are named as a Milestone 1b deliverable). The security model flips from optimistic to pessimistic:

| | Classic Merkl (V1) | Merkl Flow |
|---|---|---|
| Security model | optimistic: a bad root is claimable unless disputed in the window | pessimistic: a payout needs a quorum of validators to independently agree |
| Failure mode | bad root activates → **funds lost** | withdrawals **halt** → funds safe |
| Claim latency | 4–12h root cadence + 1–2h dispute | **real-time** |
| New chain cost | deploy + audit 3 contracts | deposit watcher + finality rule + tx builder + TSS curve support |
| Non-EVM | needs a contract-platform port | **any chain with token transfers** |

Two properties matter specifically for Canton. **The chain-side footprint is nothing but standard token transfers**, so nothing is deployed, audited or maintained, which removes the entire Daml-contract workstream from Canton's critical path. And **validators check cheap ledger-level invariants per operation** (conservation, per-campaign budget, per-period outflow cap, solvency), quarantining a violating campaign fail-closed rather than aborting a whole chain.

**Status.** A PoC **runs end-to-end** against **Base**, and against **Solana and Sui** for the Ed25519 path: DKG/TSS treasury, off-chain ledger, 4 independent validators, the production engine computing rewards, quorum-signed payouts in both withdrawal modes.

**What the grant pays for here, and what it does not.** Merkl Flow benefits every chain Merkl serves, so the fund is asked for **only the part Canton forces**: batching on both paths, the nonce manager, and chain partitioning. Everything else, from the invariant spec to the key ceremonies and the independent security review, is Merkl-funded and itemised in the Cost Model.

#### 2.2 Adapting Merkl Flow to distribute funds on Canton

Adding a chain to the ledger requires a deposit watcher plus finality rule, a transaction builder, and TSS support for the chain's signature scheme. Canton adds token-standard specifics on top:

- **Party identity as the account key.** Replace address assumptions with Canton `PartyId`. Add `CANTON` and party-ID validation to the shared schema layer, noting that a party is scoped to the participant node hosting it.
- **Deposit watcher and finality.** Watch treasury-party `Holding` creations via the Ledger API `UpdateService` / `StateService` on Merkl's own participant node. **Canton has BFT finality, so reorg handling is removed rather than adapted**, a genuine simplification versus every EVM chain. The cursor is the ledger `offset` paired with `recordTime`, not a block number.
- **Transfer construction against CIP-0056.** Build `TransferFactory_Transfer` exercises, including the registry round-trip that fetches `factoryId`, `disclosedContracts` and `choiceContextData` from the registrar's off-ledger HTTP API, discovered via the CNS `registryUrls` metadata key. Handle the CC-specific 10-minute `OpenMiningRound` context expiry by binding context fetch to ceremony start.
- **Batched payout, the Canton-native way.** Use the documented batching path: a `BatchMergeUtility` contract, merge-delegation consent captured at onboarding, and **~100 delegation choices per call, with multiple batches in parallel**. Splice documents this pattern for airdrops: *"Optionally, you can add transfers from your operator party to the merge calls to implement airdrop campaigns in a batched fashion"*. It also keeps recipients' UTXO counts low, which the standard explicitly asks providers to do.
- **TSS signing for Canton.** External parties sign with Ed25519. The ledger's threshold-EdDSA path is already demonstrated for Solana and Sui, so the work is the Canton transaction-hash format and authorization envelope, not new cryptography.
- **Per-chain payout parameters and the airdrop type.** Minimum-withdrawal thresholds, auto-pay floors, batching windows and claim-expiry periods are first-class scheme parameters, and Canton's need measuring rather than guessing. The existing `AIRDROP` type is wired end to end: a partner uploads an allocation of party IDs and amounts, and recipients claim against it. This is the Milestone 1b acceptance surface.

**The recipient experience: claim by default, auto-push by option.**

Rewards accrue continuously as a **ledger balance** the recipient sees in real time, with no pending-versus-claimable distinction. Two ways that balance reaches a wallet, selectable per campaign:

1. **Pull, the default.** The recipient signs a **withdrawal authorization off-ledger**; Merkl then runs the TSS ceremony and submits the Canton transaction. The user experience is a claim button, but the on-ledger transaction is built and broadcast by Merkl. Merkl Flow already models withdrawals as authorized intents, so this is the architecture's native mode rather than an addition.
2. **Auto-push, opt-in per campaign.** Merkl batches and broadcasts with no recipient action once a preapproval and merge delegation are in place. Appropriate for campaigns whose users have already onboarded with the integrated app, and for issuers who want distribution completed rather than offered.

Pull is the default for four reasons specific to Canton. **Unclaimed rewards expire back to the campaign creator** after a configurable window, which issuers distributing CC or tokenized assets consistently want and push cannot offer. It **avoids creating holdings nobody asked for**: every payout creates a `Holding` that incurs *"storage and compute cost on the validator nodes hosting users… and the validator nodes hosting the token administrator"*, plus holding fees, against a standard that asks providers to keep users *"below ~10 UTXOs per user on average"*, so pushing dust to dormant parties is costly to third parties in a way it is not on EVM. It **resolves the cold-recipient case**, where an allocation names party IDs that never onboarded and hold no preapproval, so a push degrades to the receiver-controlled `TransferInstruction_Accept` step anyway; under pull the preapproval is created when the recipient claims, so the flow is defined for arbitrary party IDs. And it **carries affirmative consent** where a campaign needs terms acceptance, a self-verification hook or a sanctions attestation before funds move.

Three items carry real technical uncertainty and are scoped as Phase-0 spikes with measurement rather than assumption: **traffic cost and maximum transaction size for a ~100-leg batched transfer**; the **party-count limit on validator-provided preapprovals**; and whether **`CanReadAsAnyParty` satisfies `GetActiveContracts`/`GetUpdates`** in place of per-party `canReadAs`. Results are published in the Milestone 1a report, useful to any app later attempting batched distribution.

#### 2.3 Indexing Canton activity, starting with token holders

**This is where Canton is genuinely different.** Merkl's engine is built on `eth_getLogs` and `balanceOf` at a block. Canton has neither, for architectural reasons:

> *"Non-stakeholders receive no information about the transaction payload or metadata. **They do not learn that the transaction happened.**"* / *"Each validator stores data only for its hosted parties; there is no global state replication."* / *"PQS sees only what your party sees."* ([privacy model](https://docs.canton.network/appdev/deep-dives/privacy-model.md))

So **there is no permissionless way to index a Canton application. Visibility must be granted, never scraped.** An external service with no on-ledger relationship sees CC flows via Scan and nothing else: no app holdings, no LP positions, no lending balances. The architecture therefore inverts. Merkl builds a **visibility-granted indexer** with three integration paths, ordered by partner cost, plus one forward-looking hook:

1. **`CanReadAsAnyParty` + PQS on the partner's own validator, the path we lead with.** Splice documents this for exactly the "see all my users' holdings" problem: *"Grant your wallet provider's user the `CanReadAsAnyParty` right on your validator node to allow it to read all users' `Holding` UTXOs"*, recommending PQS over direct Ledger API reads as *"the more scalable option"*. **Zero Daml change for the partner, no retroactivity problem.** Merkl runs a read-only PQS instance against the partner's participant, with 5 to 15 minute tokens since JWTs cannot be revoked.
2. **Observer on the template**: stronger and on-ledger, but needs a Daml upgrade per app and **cannot be applied retroactively**. Offered, not required.
3. **Token Standard V2 `Account.provider`**, where *"Account providers MUST have visibility on all asset movements and holdings"* (CIP-0112, approved 2026-06-12). Forward-looking only: MainNet currently reports `tokenStandard` 1.3.1, so we build against V1 `HoldingView` with `owner` behind an accessor.

Engineering work in Merkl's stack:

- **Merkl operates its own participant node**, so Merkl owns the ledger relationship, the offsets and the traffic budget. A Splice-as-a-service provider is the fallback for the earliest phase.
- **Offset-keyed state instead of block-keyed.** Merkl's `states-service` keys every snapshot by block number, but Canton offsets are **per-participant** (*"Each node allocates its own offsets based on its permissioned view"*), so an offset is meaningful only paired with the node that issued it.
- **Token holdings as the first campaign type.** `Splice.Api.Token.HoldingV1:Holding` is a pure view interface, and PQS indexes interface views directly, so it is SQL-queryable with point-in-time reads at arbitrary offsets: exactly the primitive `genericTimeWeighted` needs. Classification comes from the standard's own `tx-kind` metadata. A **`CantonProtocolReader`** interface handles positions, since *"balanceOf at block N"* has no Canton parallel and positions are per-user contract instances; Merkl's engine already abstracts EVM, SVM and Stellar, so this fits the existing shape.
- **Two open artifacts nobody currently maintains**: a **registrar-party seed list** (there is no `/registrars` index on Canton, so every indexer, wallet and explorer needs one), and the **visibility-grant specification**, published so an app can grant equivalent visibility to any analytics service, not only Merkl. The latter doubles as the onboarding process: which party is granted what, over which templates, and who bears the traffic and holding fees.

#### 2.4 Adding support for protocols

With payout (M1) and holder measurement (M2) in place, protocol support is a repeating pattern: map the app's Daml position templates to a Merkl scoring method, agree the visibility grant, configure campaign types, ship the opportunity page.

Target integrations, with status stated plainly rather than smoothed over:

| App | Category | Status | Merkl campaign family |
|---|---|---|---|
| **Edel Finance** | tokenized-equity supply market, private execution | MainNet; three manual CC distributions run; live Merkl client on Ethereum | supply incentives, yield distribution, volume and maker incentives |
| **Minted / mUSD** | stablecoin issuer | MainNet; CC allocated for growth, no distribution engine | holder rewards, reserve-yield redistribution |
| **Tradecraft** (ex-CantonSwap) | DEX / AMM, multi-currency atomic swaps | MainNet | LP liquidity, lock-duration weighting |
| **OneSwap** | atomic DvP DEX | MainNet | LP liquidity |
| **ACME Lend** | overcollateralized lending | MainNet | supply/borrow incentives, net-lending scoring |
| **Alpend** | money market / private credit | MainNet, whitelist-gated | supply/borrow incentives |
| **Helvet Swap** | institutional DEX | DevNet; program "in development" | LP liquidity |
| **Trade.Fast** | private AMM | MainNet unverified; advertises rewards with no mechanism | LP liquidity |

Issuer-side workflows land in the same milestone, because they are the same machinery pointed at a different question: yield redistribution for **USDCx**, **Minted**'s **mUSD** and **USYC**, dividend-equivalent and coupon payouts for tokenized assets such as **Fractit**'s real-estate baskets, and reserve-yield redistribution for stablecoin issuers arriving via **Brale** or **HiFi**. **Canton's stablecoin set is small today**, with **USDCx**, **mUSD** and the recently launched **USD1** (World Liberty Financial) alongside **USYC**, so issuer yield redistribution is a growth line in this proposal rather than a near-term volume driver. The workflows are built because they are the same machinery as the rest, not because the volume already exists.

**Payments and cashback are the same machinery pointed at a payout rather than an incentive.** A card issuer, payment app, venue or wallet defines a rule once, and Merkl pays every eligible party automatically. Two triggers, usable together:

- **Onchain monitoring.** The indexer watches the app's activity under the §2.3 visibility grant and computes the payout from the rule: a percentage of spend, a per-transaction rebate, a fee refund above a threshold, a volume tier. The client submits nothing, and accrual is continuous rather than reconciled by hand at month end. Merkl runs this shape on EVM today with per-event campaign types (`EVENT_BASED`, `ERC20INCOMINGTRANSFERS`).
- **API calls from the client.** For activity Merkl cannot or must not observe, the client posts eligible parties and amounts, or raw events for Merkl to score, over HTTP. This is the §2.3 push-feed path and the transfer-agent interface Merkl already exposes to issuers, so it needs no ledger access. It covers off-ledger triggers: a card authorization, a fiat settlement, a KYC status change, a subscription renewal.

Merkl then owns batching, funding checks, retries, per-user caps and a payout record per recipient. **Canton is the strongest chain Merkl could run this on**: a cashback ledger exposes customer spend patterns, and on Canton the payout is visible only to its stakeholders (§3), which no EVM chain can offer.


### 3. Architectural Alignment

- **CIP-0056 / CIP-0112 native.** All payouts are standard `TransferFactory_Transfer` exercises against `Splice.Api.Token.HoldingV1`; measurement reads the standard `Holding` interface view and `tx-kind` metadata. No parallel token abstraction, no custom holding representation, forward-compatible with CIP-0112's `Account`-based `HoldingView`.
- **Privacy-respecting by construction.** The design assumes sub-transaction privacy rather than working around it. Visibility is granted per-partner, scoped to named templates, and revocable at the participant's user-management layer. Merkl's *own* private campaigns on EVM are only an anonymity set, mixed among all other public campaigns flowing through the same Distributor contract. **On Canton, campaign privacy becomes cryptographic rather than statistical**, a genuine upgrade over what Merkl can offer anywhere else and a reason institutional issuers may prefer Canton.
- **No contract to deploy, therefore no per-chain audit or upgrade surface.** The payout path adds no Daml package to the network's trust surface, and the Daml that is written is thin, open, and built on documented Splice utilities: `BatchMergeUtility`, `TransferPreapproval`, `CanReadAsAnyParty` + PQS, `splice-util-token-standard-wallet`, CNS-based registry discovery. Where the docs say to measure on DevNet, we measure on DevNet.
- **BFT finality is used, not tolerated**, so reorg handling is deleted rather than adapted. And Merkl **complements CIP-0104 app activity records** rather than duplicating them: Scan's per-app-provider weights are a network-level signal, while Merkl measures *within* an app at per-user resolution, which Scan structurally cannot.

### 4. Backward Compatibility

No impact on existing Canton systems, integrations or workflows. Merkl deploys no Daml package other apps depend on, and requires no protocol change, no CIP, and no Splice modification. Integration is opt-in per application and revocable by withdrawing the visibility grant.

---

## Milestones and Deliverables

Dates are relative to grant approval.

**All funding is retroactive.** Nothing is disbursed on approval. Merkl funds the work from its own balance sheet and claims each tranche only after the deliverables exist and the committee, or its delegate, has verified them. Milestone 1 is therefore split into two smaller claims, so the fund's first payment sits against a completed, independently measurable artifact rather than against a quarter of unbilled work.

### Milestone 1a: Ledger batching and published Canton measurements

| Detail | Description |
|--------|-------------|
| **Estimated Delivery** | Month 2 from grant approval |
| **Funding** | 1,500,000 CC upon committee acceptance |

**Outcome: batched, quorum-signed payout is proven at Canton-relevant scale, and the ecosystem gets the measurements.**

**Deliverables funded by this grant**

- **Batching, without which Canton distribution does not work at scale**: batching on the accrual and payout paths, a deterministic nonce manager, and chain partitioning. Validated at 10× current Merkl volume by an automated load harness, with **published pass/fail results**.
- **Published DevNet measurement report** on traffic cost and maximum transaction size for ~100-leg batched transfers, the party-count limit on validator-provided preapprovals, and whether `CanReadAsAnyParty` satisfies `GetActiveContracts`/`GetUpdates`. Useful to any Canton team attempting batched distribution, whether or not it uses Merkl.
- Merkl participant node in production operation, with documented traffic-budget management.

**Ecosystem value:** the measurement report is public and reusable, and the unbatched control case quantifies exactly how much of the payout SLO batching buys.

### Milestone 1b: Canton support on Merkl Flow

| Detail | Description |
|--------|-------------|
| **Estimated Delivery** | Month 3 from grant approval |
| **Funding** | 2,500,000 CC upon committee acceptance |

**Outcome: you can airdrop tokens on Canton with Merkl.** A Canton app uploads an allocation of party IDs and amounts and funds a treasury; recipients claim from a real-time balance, or the campaign opts into auto-push. Batched, preapproval-backed, with no Daml deployed by anyone and unclaimed rewards returning to the creator after the expiry window.

**Deliverables funded by this grant**

- Canton chain adapter: deposit watcher and BFT-finality rule, `TransferFactory_Transfer` builder with registry choice-context round-trip, `BatchMergeUtility`-based batched payout, `TransferPreapproval` creation and renewal, threshold-Ed25519 signing, per-chain payout parameters, party-ID identity and `ChainId.CANTON` across schema, API and app.
- The claim flow: off-ledger withdrawal authorization, real-time balance display, claim-expiry and reversion to the campaign creator, plus opt-in auto-push.
- Canton adapter and Daml utilities published open source under Apache 2.0.
- Airdrop campaigns live on Canton MainNet, with free test-token campaigns so any app can rehearse.


### Milestone 2: Token holding campaigns on Merkl Flow

| Detail | Description |
|--------|-------------|
| **Estimated Delivery** | Month 4 from grant approval |
| **Funding** | 4,000,000 CC upon committee acceptance |

**Outcome: you can reward users who hold tokens on Canton.** Continuously, proportionally to time-weighted balance, with no snapshots: the same integral-over-time accrual Merkl runs on every other chain.

**Deliverables**

- Canton indexer service: PQS-backed reader over `Splice.Api.Token.HoldingV1:Holding` interface views, offset-keyed with `(offset, recordTime)`, live tail plus historical backfill at arbitrary offsets, and `states-service` migrated to offset-keyed snapshots additively and non-breaking for the 65+ existing chains.
- `CantonProtocolReader` with all three visibility paths implemented: `CanReadAsAnyParty` + PQS, template observer, and partner push feed.
- Token-holding campaign type live on Canton, driving time weighted liquidity and the APR-targeting distribution methods, with eligibility hooks operational: sanctions screening, KYC allow/denylists, per-user caps.
- **Published open specification** of the visibility-grant integration, so any analytics service can be granted equivalent access, plus the **open registrar-party seed list**.
- Public Merkl opportunity pages for Canton campaigns, with APRs surfaced in Merkl's app and via the public API for any Canton frontend to consume.

**Ecosystem value:** number of distinct Canton tokens with a live holding campaign, and the number of Canton parties receiving continuously-accrued rewards. Also: at least two apps granting visibility through paths Merkl did not build for them specifically, evidencing the spec is genuinely reusable.

### Milestone 3: Broad protocol support

| Detail | Description |
|--------|-------------|
| **Estimated Delivery** | First integrations by Month 5; tranches claimable for 12 months thereafter (to ~Month 17) |
| **Funding** | Up to 2,000,000 CC, paid per protocol, none of it payable without a signed third party |

**Outcome: Canton apps across DEX, lending and issuance run incentive programs on Merkl as a matter of course.**

**Deliverables**

- Integrations with up to 8 protocols from the named target set, each covering position mapping, visibility grant, campaign configuration and a public opportunity page. **Merkl begins an integration only once that protocol has signed an agreement and granted visibility**, so no engineering is committed against an absent counterparty.
- LP and concentrated-liquidity support for Canton DEXes, and lending support including net-lending scoring to prevent loop farming.
- Issuer workflows: reserve-yield redistribution (USDCx, Brale/HIFI issuance), tokenized-asset yield and dividend-equivalent distribution (USYC, Fractit), using the paying-agent interface Merkl already operates.
- Payment workflows: automated cashback, rebate and referral payouts for Canton payment apps, card issuers, venues and wallets, triggered by onchain monitoring or by client API calls on the push-feed interface.
- Per-protocol integration guides, plus a self-serve Canton path so an app can onboard without bespoke Merkl engineering.

**Payment structure: 250,000 CC per protocol, split in two, up to 8 protocols.**

| Per-protocol tranche | Trigger | Amount |
|---|---|---|
| 3a Integration | That protocol has **signed an integration agreement, granted visibility, and has a working Merkl integration with a public opportunity page** | 150,000 CC |
| 3b Adoption | That protocol is running **a live Merkl campaign sustained ≥7 days** | 100,000 CC |

Merkl is excluded from every count, and a protocol in which Merkl holds an interest does not qualify. The 3a trigger is deliberately not "code shipped": it requires a named, independent Canton application to have signed and granted access, which is where ecosystem demand is evidenced. The 3b trigger keeps 40% of every protocol's value tied to real usage.

**250,000 CC per protocol is ≈ $30,000 against ≈ $50,000 of apportioned cost, so Merkl funds roughly 40% of Milestone 3 itself.** Integration work produces revenue for Merkl through distribution fees, so Merkl should carry most of it; the tranche exists to make the *first* integrations rational before any volume exists, not to fund them outright. It also keeps the per-adopter figure close to the pricing accepted in the approved Kaiko proposal ([#113](https://github.com/canton-foundation/canton-dev-fund/pull/113)), which paid *"100,000 CC per client that adopts and goes live … up to a maximum of 10 clients"*, while Merkl's trigger additionally requires a signed agreement, a granted visibility scope and a campaign sustained for 7 days.

**Ecosystem value:** number of independent Canton apps running live Merkl campaigns; total value distributed on Canton through Merkl; number of distinct Canton parties receiving rewards. Milestone 3b tranches are assessed on composite evidence, not any single metric in isolation.

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion on:

- Deliverables completed as specified, with **demonstrated functionality on Canton MainNet, not DevNet or TestNet**, for every user-facing claim, and campaigns sustained ≥7 days so a distribution switched on for a review does not count.
- A committee member or delegate can independently verify each milestone: for M1, submit an allocation to a test campaign and observe a recipient claim it; for M2, verify a party's accrued reward tracks its time-weighted holding over a chosen interval; for M3, open each named protocol's public opportunity page and confirm live distribution.
- Published open-source artifacts under Apache 2.0, with the DevNet measurement report, visibility-grant specification and registrar seed list publicly accessible, and the independent security review summary published before Milestone 1b is accepted.
- Adoption counts evidenced by written attestation from **entities independent of Merkl**, or by verifiable on-ledger and public-API evidence. Merkl-affiliated parties are excluded from every count.
- Platform availability of **99.9% or better** for the Canton distribution path from Milestone 1b onward, on a public status endpoint Merkl stands up as part of Milestone 1b.

**Project-specific conditions**

- Visibility is always granted and always revocable, scoped to named templates. Merkl will not seek or use any mechanism to observe app data beyond what a partner has explicitly granted. No Merkl Daml package becomes a dependency other Canton apps must trust for the payout path.
- The Canton-specific layer stays open source during and after the grant. If Merkl discontinues Canton support, the adapter, indexer, Daml utilities, specification and seed list remain published under Apache 2.0.

---

## Funding

**Committed Funding Request: 8,000,000 CC** (≈ **$960,000**)

**Total including per-protocol tranches: up to 10,000,000 CC** (≈ **$1.20M**)

| Milestone | Description | Amount | Release |
|---|---|---|---|
| Milestone 1a | Ledger batching at 10× volume, published DevNet measurement report, participant node live | 1,500,000 CC | upon committee acceptance |
| Milestone 1b | Canton support on Merkl Flow: airdrop live on Canton MainNet | 2,500,000 CC | upon committee acceptance |
| Milestone 2 | Token holding campaigns on Merkl Flow | 4,000,000 CC | upon committee acceptance |
| **Committed subtotal** | | **8,000,000 CC** | |
| Milestone 3a | 8 × 150,000 CC per protocol signed, visibility granted, integration live | up to 1,200,000 CC | upon acceptance of each tranche claim |
| Milestone 3b | 8 × 100,000 CC per protocol running a campaign ≥7 days | up to 800,000 CC | upon acceptance of each tranche claim |
| **Ceiling** | | **10,000,000 CC** | |

**20% of the ceiling cannot be claimed unless an independent Canton application has signed and granted visibility, and 8% requires a sustained live campaign.** There is no distribution credit, no prepayment and no volume commitment requested from the Foundation.

### Cost Model

Blended senior-engineer cost at **$14,000 per engineer-month** fully loaded, the rate Merkl budgets internally.

**Grant-funded scope**

| Milestone | Workstream |
|---|---|---|---|
| M1a | Batching (accrual + payout), nonce manager, chain partitioning, load harness at 10× volume |
| M1a | Phase-0 DevNet spikes + published measurement report + participant node |
| M1b | Canton chain adapter, token-standard transfers, batched payout, preapprovals, Ed25519 TSS, claim flow, Daml utilities |
| M2 | Canton indexer, PQS reader, three visibility paths |
| M2 | Offset-keyed state migration across `states-service` and engine |
| M2 | `CantonProtocolReader`, holding campaign types, hooks on Canton |
| M2 | Published visibility-grant spec, registrar seed list, opportunity pages |
| M3 | 8 protocol integrations |
| M3 | LP / concentrated-liquidity and lending campaign support |
| M3 | Issuer yield and dividend workflows; self-serve onboarding path |
| M3 | Docs, guides, integration support |
| Ops | Participant node, traffic budgets, CC holding fees, `transferPreapprovalFee` renewals (~$1/recipient/year) |

**Merkl-funded scope, delivered as Milestone 1b acceptance conditions**

| Workstream | 
|---|---|---|
| Frozen invariant spec, conformance vectors |
| Isolated multi-validator deployment pipeline + telemetry plane |
| Authenticated transport, replicated sequencer, key ceremonies, break-glass, HA runbooks, independent security review |


| Phase | Grant-funded cost | 
|---|---|---|---|
| M1 + M2 engineering and ops | 8,000,000 CC ≈ $960,000 |
| M3 protocol integrations and issuer workflows | 2,000,000 CC ≈ $240,000 |
| Ledger custody hardening | not requested |

### Funding Rationale

**Why the committed portion is larger than a typical external grant.** The scope is two sequenced systems rather than one feature: a chain adapter that must construct token-standard transfers, batch them the Canton-native way, manage preapprovals, run a claim flow and sign with threshold Ed25519; and an indexer built against a privacy model that inverts every assumption Merkl's engine rests on. Canton is the harder instance, and unlike Stellar it cannot reuse the merkle-root path at all.

**Why Milestone 3 is not paid purely on campaign volume, and where Merkl absorbs the risk.** Whether a protocol funds a campaign, and at what size, is outside Merkl's control, while the integration cost is incurred in full regardless. Splitting each protocol 60/40 between a signed working integration and sustained usage means the fund pays nothing for shelf-ware, without Merkl underwriting a third party's budgeting decisions. Merkl funds every hour before claiming anything, funds the custody hardening in full, funds roughly 40% of the protocol integrations, takes no margin, and carries CC price exposure across a ~17-month claim window (see the rebase term below). **If Canton applications do not use the infrastructure, the fund has paid for working, open-source infrastructure and Merkl has earned nothing on it.**

If the committee prefers a smaller ceiling, the natural cut is capping per-protocol tranches at four. Merkl would rather reduce scope than rate.

### Pricing on Canton

Merkl's standard fees are **3% maintenance** and **0.5% on airdrops**. These fees can be lowered if Canton or applications opt-in for commited usage.

### Volatility Stipulation

The project duration exceeds 6 months (committed milestones through ~Month 4, per-protocol tranches through ~Month 17), so **the grant is denominated in fixed Canton Coin and requires re-evaluation at the 6-month mark**, per CIP-0100 and the fund template.

CC amounts are set against a reference price of **$0.12 CC/USD**, approximately the 2026-08-24 spot per [CoinGecko](https://www.coingecko.com/en/coins/canton).

**Merkl's preferred term is a quarterly rebase**: at the start of each calendar quarter, the CC amount of that quarter's outstanding milestones is recalculated on the 30-day moving average CC/USD price from a public reference source, mechanically and without a committee vote. Because the grant is retroactive, Merkl spends first and claims up to 17 months later, so a fixed-CC denomination puts the entire price movement over that window on the party that has already spent the cash. The rebase is symmetric: if CC appreciates, the fund pays fewer CC for the same delivered work.

If the Committee prefers fixed CC, Merkl accepts it and the amounts above stand as written, subject to the 6-month re-evaluation the template requires.


## Proposal Process

Merkl's expected path, stated so the committee can correct it early: the proposal is opened for feedback, reviewed by the relevant special interest groups, championed by a committee member or member organisation, and then presented to the **Tech & Ops Committee**, on an approximate **4-week timeline from a proposal-ready state to a vote**. Digital Assets is Merkl's primary champion candidate, on the strength of the payments work in §2.4 and prior technical scoping; Alpend is the second. The Foundation has confirmed it will not champion, and this proposal does not represent otherwise.

---

## Team Background

| Name | Role | Background |
|---|---|---|
| [Pablo Veyrat](https://www.linkedin.com/in/pablo-veyrat-5a6a84130/) | CEO, Merkl | Co-founder of Angle Labs; has led the company from launch in November 2023 to $1.8B+ distributed across 65+ chains |
| [Baptiste Guerin](https://www.linkedin.com/in/baptiste-guerin-748176126/) | Proposal lead, Merkl | Head of Revenue, leading Merkl's chain expansion, including the Stellar non-EVM launch |
| Merkl engineering | Ledger, engine, indexer, app | **20+ full-time engineers**, the team that built and operates Merkl across 65+ chains and shipped Merkl Flow to a working multi-validator PoC |

The team is **entirely French and works together from Merkl's Paris office**.

Merkl launched in November 2023 and is built by Angle Labs, Inc., which raised a **$5M seed round led by a16z** in September 2021 ([a16z](https://a16z.com/announcement/investing-in-angle/)). Distribution went from **$80M in January 2025 to $1B in November 2025** ([2025 in review](https://blog.merkl.xyz/2025-in-review-merkls-year-of-consolidation-and-growth)), and June 2026 alone ran **1,574 new campaigns and $14.8M distributed** ([June 2026 recap](https://blog.merkl.xyz/monthly-recap-june-2026-coinbase-usdc-lending-deel-stablecoin-wallet-and-more)).

**Merkl has already done a non-EVM expansion of exactly this shape.** On Stellar it *"required extending Merkl's infrastructure beyond its original scope, not just adding a new chain entry but opening a new category entirely"* ([Merkl](https://blog.merkl.xyz/merkl-goes-non-evm-starting-with-stellar)), and was audited by Halborn in April 2026. Canton is a harder version of a problem Merkl has already solved once.

---

## Case Studies

Every number is published by Merkl or the partner, with a source, and selected for what Canton issuers and venues will ask for.

| Partner | What Merkl did | Published result |
|---|---|---|
| [Stable + Hourglass](https://merkl.xyz/case-studies/stable-pre-deposit-campaign-refund-merkl) | Refund of over-cap pre-deposits via a custom token wrapper, so Hourglass kept vault custody throughout. The closest analogue to a Canton institutional ask: nine-figure scale, custody retained by the issuer | **$634M+ distributed, $500M claimed in 20 hours**, ~9,000 addresses in 5 days, 100% completed |
| [Sky](https://merkl.xyz/case-studies/sky-ssr-distribution-merkl) | Savings Rate paid on **time-weighted idle (unborrowed) balance** through nested ERC-4626 forwarders. Paying only on the portion of a balance in a given state is the Canton money-market and tokenized-treasury problem | ~$33M+ TVL, ~$600K+ in USDS, ~3.6% APR on idle |
| [Morpho](https://merkl.xyz/case-studies/morpho-reward-system) | Decommissioned its in-house MORPHO reward system in favour of Merkl. The exact path available to Silvana, and to Ekiden if it chooses it | **500+ campaigns, $7.35M+ distributed, 6 chains** |
| [Coinbase](https://blog.merkl.xyz/coinbase-integrates-merkl-rewards) / [Robinhood](https://blog.merkl.xyz/robinhood-earn-powered-by-merkl) | In-app Earn rewards; Merkl is *"the reward distribution layer for Robinhood Chain"*, itself *"built for financial services and tokenized real-world assets"* | *"More than 100 million Coinbase users can now earn Merkl rewards"* |
| [Optimism Superfest](https://merkl.xyz/case-studies/optimism-superfest) / [Seamless](https://merkl.xyz/case-studies/seamless-leverage-token-launch-merkl) / [Uniswap](https://merkl.xyz/case-studies/uniswap-launch-on-new-chains) | Measured, rule-based liquidity campaigns. Against Canton's 516M CC/month app pool, measured beats hand-run distribution by a large multiple on the same emissions | **$100M+ TVL at $66 per OP**; **$2,640 drove $100M+ TVL**; $20 seeded 3 pools to **$300k TVL in <3 days** |
| [Arbitrum DRIP](https://blog.merkl.xyz/merkl-powers-arbitrums-drip-80m-arb-rewards-to-boost-defi-activity) / [World Chain](https://merkl.xyz/case-studies/world-chain) | Programme-scale operation, including the first reward logic gated on World ID verified humans, the identity gating Canton issuers will require | **80M ARB over 12 months**; World Chain TVL $3M → $99M |

Merkl's playbooks for each of these workloads are published at [studio.merkl.xyz/guides](https://studio.merkl.xyz/guides), so a Canton app can read the pattern before it integrates. Canton's custodian and wallet set is structurally similar to the Coinbase and Robinhood integrations Merkl already runs: Dfns *"employs the CIP-56 token standard for its wallet-as-a-service platform on Canton Network"*, alongside BitGo, Copper and Archax.

One regulatory note, because it shapes what is designable: *"Under MiCA, GENIUS and CLARITY, passive yield is prohibited, but activity-based rewards remain permitted"* ([Merkl](https://merkl.xyz/use-cases/stablecoin-activity-rewards)). Merkl's rule engine expresses activity-conditioned rewards precisely, which matters more on Canton than anywhere else given who its issuers are.

---

## Security and Maintenance

**Track record.** `DistributionCreator` and `Distributor` were audited by Code4rena in [November 2025](https://code4rena.com/reports/2025-11-merkl) (0 high, 3 medium findings across 604 lines), following an earlier [June 2023](https://code4rena.com/reports/2023-06-angle) review; the Stellar deployment by [Halborn in April 2026](https://developers.merkl.xyz/merkl-stellar-audit-halborn-2026.pdf). Governance runs on a **4/6 multisig with 6 independent signers, never more than 3 in the same physical location**, and governance cannot alter distributions.

**Merkl Flow's security posture.** Custody sits behind a **threshold t-of-n TSS**: no complete key exists in any single place, and no payout occurs unless a quorum of independently-operated validators each verify ledger-level invariants and co-sign. Validators are a **deliberately separate codebase** from the engine, because running engine code N times would sign one bug N times. An internal threat model and adverse-condition audit exist with findings tracked, and the launch-gating set must close before any chain is flipped. Merkl commits to an **independent third-party security review**, funded by Merkl and not by this grant, with the summary published.

Merkl holds custody of undistributed funds, and there is no onchain artifact for third parties to verify against. Mitigations are quorum-signed hash-chained checkpoints, downloadable op logs, inclusion proofs, per-campaign accounting, and, for issuers who will not accept custody, the token-wrapper path that keeps funds with the issuer.

**Post-grant sustainability.** Merkl's Canton operation is funded by distribution fees on Canton volume and by Merkl's existing revenue across 65+ chains, not by continuing grants. Merkl commits to maintaining the Canton adapter, indexer and integrations for a **minimum of 36 months after Milestone 3 acceptance**, tracking Canton protocol upgrades including Token Standard V2 activation. If Merkl discontinues Canton support, the open-source artifacts remain published under Apache 2.0 with a migration note for affected apps.

---

## Risks and Mitigations

| Risk | Mitigation |
|---|---|
| **Visibility gating.** If an app does not grant read rights, Merkl cannot index it. The single biggest departure from EVM. | The three paths of §2.3, led by the zero-Daml-change one. The push-feed path needs no ledger access at all, and onboarding is a documented, published process rather than a bespoke negotiation. |
| **Custody concentration.** Merkl Flow means Merkl holds undistributed funds. | Threshold t-of-n TSS, fail-closed halts and quarantine, detailed in §Security and Maintenance, plus the token-wrapper alternative for issuers who decline custody entirely. |
| **Batched-transfer economics and ledger scale** are undocumented, against a payout path that cannot run millions of individual TSS ceremonies. | Measured on DevNet in Phase 0 and published in Milestone 1a. Batching and partitioning are launch-gating, with an explicit SLO set, an automated harness, and the unbatched control case measured to quantify the margin. Withdrawal thresholds and batching windows are tunable, so a constrained result is absorbed without redesign. |
| **Wallet maturity**, on which a claim flow depends. Plus ecosystem timing: Token Standard V2 is approved but MainNet reports 1.3.1. | The claim is an **off-ledger signed authorization**, not a submitted Canton transaction, so the flow needs a wallet that can sign a message rather than mature transaction-construction support, and auto-push removes even that for campaigns that opt in. On timing, we build against V1 `HoldingView` with `owner` behind an accessor, and nothing in the payout path depends on unshipped features. |

---

## Co-Marketing

Merkl will collaborate with the Foundation on:

- A joint launch announcement at Milestone 1b, plus a technical blog post on the merkle-root-versus-ledger argument and the DevNet measurement results, and a published case study per named protocol integration.
- Distribution through Merkl's channels: **200,000+ monthly active users on the Merkl App**, the blog and developer docs, with Canton featured in monthly recaps for the grant duration, and Canton Foundation branding on Canton opportunity pages as grant recipient.
- Contributing the visibility-grant specification and registrar seed list to the Canton developer documentation ecosystem, and presenting the indexing pattern at a Canton developer forum session.

All at no additional cost to the fund.

---

## Rationale

**Why an incentive layer rather than more per-app tooling.** Six Canton teams are currently building distribution themselves. The fund could subsidise a seventh. Shared infrastructure is cheaper once and better for everyone: 220 supported protocols, 24 scoring methods, sanctions screening and APR targeting are not things an app team should build to reward its LPs.

**Why Merkl rather than a purpose-built Canton distributor.** The default should be to extend what exists. Merkl already exists, at $1.8B+ distributed and 65+ chains, with the measurement engine, not the payout contract, being the hard and expensive part. Rebuilding continuous integral-based accrual, 24 scoring methods, wash-trading detection, sanctions hooks and APR targeting natively on Canton would cost more than this grant and arrive later. Extending Merkl means Canton inherits production-hardened campaign logic, and every future improvement Merkl ships arrives on Canton at no additional ecosystem cost.

**Why Merkl Flow rather than porting the merkle-root contracts.** Set out in §2.1: on Canton the merkle root buys no trust reduction and costs both sides more.

**Why open-source the Canton layer but not the custody core.** The fund does not support proprietary work, and the artifacts with genuine ecosystem value are the adapter, the Daml utilities, the indexer, the visibility-grant specification, the registrar seed list and the DevNet measurements, all of which any team can use, including Merkl's competitors. The custody internals are deliberately not published, for the same reason a custodian does not publish its key ceremony, and **the grant does not fund them.** This split by artifact class follows the approved OpenZeppelin proposal ([#262](https://github.com/canton-foundation/canton-dev-fund/pull/262)), which licensed libraries under MIT and tooling under AGPL 3.0 rather than applying one licence to everything.
