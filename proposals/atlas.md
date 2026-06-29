# Development Fund Proposal

**Title:** Atlas - Canton Wallet Activity and User Acquisition Infrastructure  
**Author:** Atlas Team / Canton Army  
**Created:** 2026-06-15  
**Label:** ecosystem-growth / user-acquisition  
**Champion:** TBD  
**Funding Request:** 500,000 CC  
**Target Duration:** 3 months of active delivery after grant approval

---

## Abstract

Atlas is a Canton-focused wallet activity and user acquisition platform. It builds something every Canton project currently has to build alone, then makes it available to all Canton projects on equal terms: a shared, neutral targeting and measurement layer for ecosystem growth.

Users connect one or more wallets through non-custodial verification, and Atlas analyzes those wallets through an intelligent scoring system. Every connected wallet receives an overall Atlas Score as well as individual DeFi activity scores for categories such as lending, borrowing, swapping, trading, liquidity provision, staking, bridge activity, and prediction-market activity. Users then receive relevant Canton-native offers through an Atlas dashboard and optional opt-in notifications. Instead of each team running its own whitelists, quests, giveaways, and airdrops with no shared way to measure results, Atlas gives Canton projects a common system for activity-based targeting, campaign delivery, and retention measurement.

Atlas launches in two phases. **Milestone 1** proves activity-based targeting inside Canton with Canton wallet support, scoring v1, wallet insights, a user dashboard, a verified project portal, and pilot campaigns. **Milestone 2** extends Atlas to external-chain users, allowing Canton-native projects to target wallets with proven activity on other networks and bring those users into Canton through offers and perks.

This proposal requests **500,000 CC** across two milestones to build Atlas as reusable ecosystem infrastructure for Canton user acquisition, offer matching, campaign targeting, activation, and campaign measurement.

---

## Problem Statement

### 1. Incentive efficiency is broken

Web3 user acquisition often rewards whoever claims first, wins a lottery-style allocation, or farms most aggressively, not whoever is most likely to use the product. Whitelists, quests, giveaways, and airdrops can create awareness, but they often fail to identify users who will continue using an application after the incentive ends.

This is especially damaging for emerging ecosystems like Canton, where projects may distribute CC rewards, fee discounts, early access codes, onboarding bonuses, or partner perks to wallets with little evidence of long-term participation.

### 2. Social tasks are weak product-fit signals

A user who follows an account, joins a Telegram group, or fills in a form is not necessarily a user who will trade, lend, borrow, stake, bridge, provide liquidity, or return to a protocol. Wallet activity is a stronger product-fit signal because it shows what users actually do.

### 3. Canton needs shared targeting infrastructure

Canton projects need a way to identify wallets that use products, return to protocols, and demonstrate relevant behavior. A wallet that repeatedly trades, lends, stakes, bridges, provides liquidity, or uses specific Canton applications should not be treated the same as a wallet with little or no activity history.

Today, every Canton project is effectively expected to solve user acquisition, whitelist quality, campaign targeting, and post-campaign measurement on its own. This creates duplicated work across the ecosystem and leaves projects with inconsistent data, repeated onboarding friction, and little ability to compare which campaigns actually produce useful users.

Atlas gives projects a shared, neutral acquisition layer for finding active and relevant wallet users without distributing incentives blindly.

### 4. Canton needs better retail acquisition from other chains

Canton needs more retail users, and many valuable potential users already exist on external chains. They lend, trade, stake, bridge, provide liquidity, use wallets, and interact with prediction markets elsewhere.

Atlas bridges this gap by allowing external-chain users to connect wallets, show relevant activity, and receive targeted offers from Canton-native projects. The progression is deliberate: Milestone 1 targets existing Canton users first; Milestone 2 expands the same logic to external-chain users and incentivizes them to try Canton-native apps.

---

## Objective and Scope

The objective is to build Atlas as Canton's opt-in wallet activity and user acquisition layer.

### Benefits to Canton

Atlas benefits the Canton ecosystem by creating shared growth infrastructure rather than another isolated campaign tool.

- Better user acquisition for Canton projects, with activity-based targeting instead of random signups
- More efficient use of incentives, with less wasted on low-intent users
- Higher-quality users for early campaigns and more repeat usage across Canton apps
- Stronger discovery for Canton-native applications
- More retail users entering Canton from other chains
- Better campaign, conversion, and retention data for the ecosystem
- Stronger network effects through a common growth layer for Canton projects

### Atlas gives Canton projects

- Wallet-activity-based user targeting
- Overall Atlas Score and category-score filters
- Campaign creation and offer delivery
- Audience segment previews
- Campaign analytics and reporting
- Existing Canton user activation
- External-chain user discovery for Canton onboarding
- Reusable growth infrastructure for Canton-native applications

### Atlas gives users

- Non-custodial wallet connection
- Wallet ownership verification
- Multi-wallet and multi-chain profile creation
- Wallet insights based on public activity
- Enriched wallet analytics, including categorized transaction history and project interaction history where data coverage is available
- Relevant Canton project offers
- Optional email and Telegram notification opt-in
- Control over connected wallets, optional contact details, and profile visibility
- The ability to disconnect wallets and opt out of notifications

The first release is Canton-only. The second release adds external-chain wallet support as a sourcing layer for Canton projects.

---

## Product Specification

### Core Workstreams

| Workstream | Scope |
| --- | --- |
| Wallet connection and identity | Non-custodial wallet connection, wallet ownership verification, multi-wallet profiles, Canton wallet support matrix, consent controls, and notification preferences |
| Data ingestion | Canton wallet activity ingestion for Milestone 1; supported external-chain activity ingestion for Milestone 2; existing Canton explorers, Noves where API access and coverage are available, other indexers and APIs, and a normalized wallet activity model |
| Scoring engine | Overall Atlas Score, category scores, Canton-native activity score, multi-wallet scoring, wallet maturity, activity consistency, DeFi categories, cross-chain activity, and wallet integrity signals |
| User dashboard and wallet insights | Wallet profile, connected wallet management, score display, category-score display, enriched wallet history, categorized transaction history, project interaction summaries, offer feed, and notification settings |
| Project portal | Project onboarding, campaign creation, targeting filters, offer creation, wallet segment preview, launch workflow, and campaign reporting |
| Launch and ecosystem activation | Canton Army launch campaigns, Canton News launch campaigns, Telegram onboarding support, pilot project onboarding, partner announcements, educational content, and milestone updates |

### User Wallet Profile

Users can connect multiple wallets to one Atlas profile from Milestone 1. This gives users a single wallet portfolio and gives projects a clearer view of real activity across connected wallets, while keeping Atlas opt-in and non-custodial.

Atlas will maintain a Canton wallet support matrix covering live Canton Network wallets, current integration status, supported signing flows, next integration priorities, and provider coordination status.

**Milestone 1 supports:** Canton wallet connection, wallet ownership verification, multi-wallet profiles, Canton wallet activity aggregation, wallet insights, enriched wallet history where data coverage is available, user dashboard, overall Atlas Score, category scores, Canton-native activity score, offer feed, and optional email / Telegram notification opt-in.

**Milestone 2 supports:** external-chain wallet connection, multiple chains in one Atlas wallet portfolio, cross-chain activity ingestion, cross-chain wallet insights and chain-relevant scoring where required / verification through a single no-fund-movement verification transaction where supported.

### Wallet Analytics Dashboard

As a secondary benefit for users, Atlas will provide a wallet analytics dashboard for every connected wallet.

In addition to receiving an overall Atlas Score and individual DeFi activity scores, users will be able to view enriched analytics about their wallet activity. This may include categorized transaction history, the Canton projects associated with each transaction, transaction types such as swaps, lending, borrowing, liquidity provision, staking, bridge activity, prediction-market activity, and other supported activity categories, and summaries of how the wallet has interacted across the Canton ecosystem.

Atlas plans to work with existing Canton explorers and Noves, where API access and data coverage are available, to enrich wallet history and improve transaction classification. This makes Atlas more useful to users even before they claim an offer: users can understand their Canton activity, review project interactions, see the types of transactions associated with their wallet, and return to the dashboard as new wallet activity and new offers appear.

### Target External Chains for Milestone 2

The target external-chain set is:

- **EVM networks** including Ethereum, Base, Arbitrum, Optimism, Polygon, BNB Chain, Avalanche, and other EVM networks where wallet and data coverage are reliable
- **Solana**
- **Tron**
- **Bitcoin**
- **Sui**

Milestone 2 will deliver wallet connection, ownership verification, external activity ingestion, and usable activity-based scoring coverage across the target network set. Where data depth varies by chain, Atlas will use score-confidence and data-coverage labels rather than overclaiming identical precision across every network.

---

## Market Landscape and Differentiation

Similar products exist on other chains, but the functionality Atlas provides is usually split across three separate product categories. None of these categories currently operates as a Canton-first, opt-in, user-facing acquisition layer.

### Wallet intelligence and scoring

Examples include Nansen, Arkham, Cookie3, and Spindl. These products provide strong wallet analytics, attribution, intelligence, or marketing data, but they are generally built for analysts, investors, and marketing teams rather than for users. They are not primarily opt-in user dashboards, and they do not function as Canton-native offer delivery systems.

### Quest and campaign platforms

Examples include Galxe, Layer3, Zealy, and QuestN. These platforms help projects run campaigns, but they are usually based on social tasks, form fills, Discord or Telegram participation, follows, reposts, quizzes, and other actions that are weak indicators of product fit. Atlas is designed to replace this model for Canton by rewarding and targeting users based on real wallet behavior rather than task completion.

### Identity and sybil tools

Examples include Gitcoin Passport, Holonym, and Guild.xyz. These tools are adjacent because they help with identity, access, bot filtering, or community gating, but they do not primarily measure whether a wallet is active, relevant, and likely to use a specific Canton product.

### Atlas combines the categories

Atlas combines the useful parts of these categories into one Canton-first product:

- Activity-based wallet scoring
- A user-facing opt-in dashboard
- A verified project campaign portal
- Offer delivery and eligibility matching
- Privacy-preserving targeting without handing projects raw contact lists
- Campaign analytics tied to claims, conversions, and repeat usage where reported or verifiable

This makes Atlas different from an analytics dashboard, a quest board, or a sybil filter. Atlas is user acquisition infrastructure based on wallet activity and product fit.

With Atlas, users connect wallets and receive activity-based scores, including an overall Atlas Score and category scores such as lending, borrowing, swaps, trading, liquidity provision, staking, prediction-market activity, bridge activity, and other DeFi activity. Verified Canton projects then use those scores to identify users who match their product and offer targeted perks, early access, incentives, sign-up bonuses, rebates, or other opportunities.

The difference is that Atlas is not random and is not based on social-task completion. It gives Canton projects a way to identify the right users based on real wallet activity, then gives those projects a direct and privacy-preserving path to connect with them.

For example, a prediction-market project such as Unhedged could offer an Atlas sign-up bonus specifically to wallets with a history of prediction-market, trading, or event-driven market activity. A lending protocol could target wallets with a high lending or borrowing score and offer those users specific onboarding perks. A DEX could target wallets with strong swap, liquidity, and multi-asset activity. These use cases are fundamentally different from a random giveaway or a social quest.

As Atlas expands beyond Canton into EVM networks, Solana, Sui, Bitcoin, Tron, and other supported chains, Canton-native projects will also be able to identify proven DeFi, trading, lending, borrowing, liquidity, and prediction-market users from other ecosystems and bring them into Canton through targeted offers.

---

## Wallet Scoring Methodology

Atlas generates an overall Atlas Score and multiple category scores. Each score is expressed as a 0-100 percentage score and is based on wallet activity. Atlas does not score users based on article reads, social tasks, manual favoritism, or paid score boosts.

Atlas is also not designed to rank users by who holds the most CC. CC balance, CC holding behavior, and Canton-native asset exposure may be included as small signals where relevant, but they are not the primary scoring method.

A passive large holder should not automatically score higher than a smaller wallet that shows consistent real activity across Canton applications. Atlas prioritizes activity quality: frequency, recency, consistency, protocol usage, repeat engagement, category relevance, wallet maturity, and product fit.

The goal is to help Canton projects reach active and relevant wallet users, not simply the largest balances.

### Example Score Categories

- Overall Atlas Score
- Canton-native activity score
- Wallet maturity score
- Wallet activity consistency score
- Lending score
- Borrowing score
- Staking / yield score
- Trading / DEX score
- Liquidity provision score
- Prediction market score
- Bridge / cross-chain activity score
- Protocol diversity score
- Retention / loyalty score
- Dormant / reactivated wallet signal
- Airdrop behavior signal
- Wallet integrity signal
- Bot / farmer risk signal

Additional category scores may be added as wallet coverage and data quality improve.

### Signals Analyzed

Atlas analyzes wallet-level signals such as wallet age, active days, recent activity over 7 / 30 / 90 days, transaction count, transaction volume where reliable data is available, protocol interactions, Canton-native project usage, CC usage, swaps, lending, borrowing, staking, yield activity, liquidity provision, prediction-market activity, bridge activity, cross-chain behavior, protocol diversity, repeat protocol usage, dormant / reactivated behavior, airdrop behavior, wallet integrity indicators, bot / farmer risk indicators, and campaign claims or conversions where project-reported or network-verifiable.

NFT activity may also be included where relevant and where reliable data is available.

### Category Depth and Category Breadth

Atlas will distinguish between category depth and category breadth.

A user who is highly active in one category, such as lending or prediction markets, should not be unfairly penalized because they do not use every DeFi category. At the same time, a user who demonstrates meaningful activity across several categories should be recognized for broader ecosystem engagement.

The scoring model will separate:

- **Depth:** how strong a wallet is within a specific category
- **Breadth:** how many relevant categories the wallet uses meaningfully
- **Consistency:** whether activity is sustained or one-off
- **Integrity:** whether activity looks genuine or reward-farming driven

### Multi-Wallet and Multi-Chain Scoring

Atlas supports multi-wallet profiles from Milestone 1 and multi-chain wallet portfolios from Milestone 2.

Users may connect more than one wallet to a single Atlas profile. The profile score will aggregate wallet activity intelligently rather than simply adding all wallets together.

The aggregation model will account for strong activity across multiple wallets, complementary activity across different categories, low-activity wallets that should not artificially inflate a profile, higher-risk wallets that should reduce confidence, and data coverage differences between wallets and chains.

### Methodology Transparency

Atlas will publish a user-facing methodology page explaining score categories at a high level. Sensitive anti-abuse thresholds and exact weighting rules will remain private to protect score integrity and reduce gaming risk.

---

## Score Confidence and Data Coverage

Atlas will include score-confidence and data-coverage indicators where relevant:

- High coverage
- Medium coverage
- Limited coverage
- Data unavailable

This helps projects understand which categories have stronger data support and prevents Atlas from overclaiming where source data is incomplete. Atlas will document material scoring methodology updates in milestone reports or user-facing methodology notes.

---

## Atlas Offers Marketplace

Users connect a wallet and view Canton project offers they are eligible for. Eligible campaigns are shown first. Users may also browse public campaigns they are not currently eligible for, with broad explanations such as "requires more lending activity," "requires more recent Canton activity," "requires stronger trading history," or "requires bridge activity." Exact scoring thresholds are not exposed.

Offer types may include sign-up bonuses, fee discounts, deposit incentives, trading perks, lending and borrowing bonuses, prediction-market bonuses, liquidity incentives, staking or yield offers, early access, beta invitations, whitelist access, loyalty rewards, reactivation offers, partner onboarding campaigns, and educational onboarding campaigns.

All projects are manually verified before they can create campaigns.

---

## Opt-In Notifications and Re-Engagement

Email and Telegram collection is relevant because the Atlas dashboard will not be the only way users discover offers. Some users may connect a wallet, qualify for offers, and then not log in frequently.

Atlas can track dashboard login frequency and, where a user has opted in, send an email or Telegram notification when new offers become available for that user's connected wallet profile. For example, if a user has not logged in for a defined period and their wallet becomes eligible for new Canton project offers, Atlas can notify them that offers are waiting in the dashboard.

This feature is optional and controlled by the user. Users can opt in, opt out, remove optional contact details, and manage notification preferences at any time.

Atlas can deliver these reminders without giving projects unrestricted access to email addresses, Telegram handles, or raw contact lists. This preserves user control while improving offer discovery, campaign activation, and reactivation of dormant users.

---

## Verified Project Portal

Canton projects create targeted campaigns through Atlas.

The portal gives verified projects access to a filtered, consent-based audience layer of acquired users and connected wallets. Projects do not receive an unrestricted raw database. Instead, they can preview eligible wallet segments, configure targeting based on Atlas scores and category scores, launch offers, and measure whether those offers lead to wallet connects, claims, product usage, and repeat activity.

Project-side functionality includes:

- Project profile creation
- Campaign objective setup
- Filtered audience and wallet segment access
- Targeting by overall Atlas Score or category scores
- Targeting by Canton-native activity
- Targeting by external-chain qualification signals
- Offer creation
- Wallet segment preview
- Campaign review and launch workflow
- Campaign performance reporting

Verified Canton projects may configure campaigns using filters such as overall wallet score, wallet age, recent activity, Canton-native activity, lending, borrowing, staking / yield, trading / swaps, liquidity, prediction markets, bridge activity, chain activity, protocol activity where available, wallet maturity, activity depth, consistency, protocol diversity, dormant-but-previously-active users, new-to-Canton users with strong external-chain history, bot / farmer risk, wallet integrity, email / Telegram opt-in status, and user-consented region or location where provided.

Campaign analytics may include eligible wallet count, offer views, claims, wallet connects, conversion activity where reported or verifiable, repeat activity after 7 and 30 days where available, cost per claimed wallet, cost per active wallet, retention performance by segment, and performance by score category.

For the first time, Canton projects will be able to answer a question that traditional whitelist campaigns cannot answer reliably: **did this campaign produce real, returning users?**

---

## Example Project Use Cases

| Project type | Atlas targeting use case |
| --- | --- |
| Lending protocol | Target wallets with lending, borrowing, stablecoin, bridge, or DeFi usage signals |
| Prediction market | Target users with prediction-market, trading, event-driven, or repeated market participation |
| DEX / trading app | Target wallets with trading, swap, liquidity, multi-asset, or cross-chain activity |
| Staking product | Target users with wallet maturity, holding behavior, staking history, or yield-seeking behavior |
| Rewards or airdrop campaign | Target relevant users using category scores and wallet integrity signals |
| New Canton app | Target active Canton users and external-chain users who match the app category |
| Wallet or account infrastructure | Target active Canton users who have not yet used the wallet or onboarding flow |
| Bridge and onboarding product | Target active external-chain users and route them into Canton through relevant offers |
| Reactivation campaign | Identify previously active wallets that have gone dormant and send opt-in reactivation offers |
| Ecosystem-wide onboarding | Bring proven DeFi users, traders, lenders, borrowers, stakers, liquidity providers, and prediction-market users into Canton |

---

## Neutrality, Privacy, and User Protection

Atlas is designed as neutral Canton ecosystem infrastructure.

Wallets are scored using the same project-independent methodology. Projects choose targeting criteria, but cannot alter wallet scores, buy score improvement, manually rank users outside the scoring system, receive preferential access to private user data, or access unrestricted raw user databases.

Atlas will review campaigns before they are shown to users. Campaigns must include clear offer terms, eligibility criteria, project identity, and any action required from the user. Campaign review is limited to offer quality, user safety, and platform integrity; it does not affect wallet scoring.

Core privacy rules:

- Wallet connection is non-custodial
- Atlas never asks for private keys
- Atlas does not move user funds
- Wallet ownership is verified by signed message or another non-custodial verification flow
- Scores are based on wallet activity
- Email and Telegram handles are optional
- Contact details are shared only with user consent
- Projects can target score-based segments without receiving private contact data
- Users can disconnect wallets, remove contact details, opt out of notifications, and manage which wallets are included in their profile

Projects may access eligible wallet segments, score ranges, campaign analytics, and wallet addresses where users have opted into Atlas discoverability or where wallet visibility is required for the campaign mechanic. Atlas can deliver offers without exposing private contact details to projects.

---

## Common Good and Open Source Position

Atlas is intended to function as shared Canton ecosystem infrastructure, not as a private advantage for one project or one campaign operator.

It remains a common good for Canton because:

- Every wallet is scored using the same project-independent methodology
- Projects cannot buy score improvement, alter scoring rules, or receive preferential scoring treatment
- Wallet connection is non-custodial, opt-in, and controlled by the user
- Projects can target segments without receiving unrestricted raw contact data
- Core ecosystem outputs are made available to Canton projects whether or not they run paid Atlas campaigns
- Campaign analytics and milestone reporting give the ecosystem better information about what drives real activation and retention

### Public outputs

Atlas will publish and maintain:

- A public scoring methodology overview that explains categories and principles
- A supported wallet and chain coverage matrix
- Canton project onboarding guides
- User onboarding and wallet-connection guides
- Campaign setup templates and best-practice materials
- Aggregated, non-personalized campaign learnings where publication does not expose private user data or sensitive partner data
- Milestone reports covering delivery status, wallet and chain coverage, campaign adoption, and ecosystem learnings

These outputs make Atlas useful to the broader Canton ecosystem even for teams that do not use Atlas as a paid campaign channel.

### Open source recommendation

Atlas should be partially open source rather than fully open source during the grant period.

The strongest common-good position is to make documentation, onboarding guides, integration examples, scoring-category explanations, public methodology notes, wallet and chain coverage matrices, and non-sensitive developer examples open and reusable. Atlas may also open source lightweight SDKs, API examples, or campaign integration templates if those are useful for Canton projects.

Atlas should not fully open source the scoring engine, raw weighting logic, anti-abuse thresholds, fraud-detection rules, campaign-matching internals, private data pipelines, or systems handling contact information. Publishing those components would make the scoring system easier to game, reduce campaign quality, and create unnecessary privacy and security risk.

This approach gives the Development Fund committee the public-goods benefits they should expect from ecosystem infrastructure while preserving the integrity of the product and protecting users.

---

## Distribution and Pilot Demand

Atlas launches through existing Canton-specific channels operated by the Atlas team.

| Channel | Current position |
| --- | --- |
| Canton Army X | 14.5K followers |
| Canton Army X impressions | 4M+ impressions since launch |
| Canton News website | 16K+ visitors within six weeks of launch |
| Canton News active users | 2.1K active users within six weeks while the site is still being indexed |
| Canton News views | 12K views within six weeks |
| Canton News event count | 34K user interactions within six weeks |
| Canton News content | 200+ blogs and 100+ news articles / press releases |
| Canton News X | 1.2K followers within six weeks |
| Canton News X impressions | 150K+ impressions within six weeks |
| Canton Army Alpha Telegram | Active Canton-only Telegram community with 2K+ members |
| Canton project relationships | Direct work with 40+ Canton projects and strong relationships with nearly all Canton Network applications |
| Pilot demand | Agreements or active pilot interest across 20+ named projects |

Pilot agreements or active pilot interest includes Rho Labs, EQ Market, Send, Cenote, Raven, Edel, Rapid Chain, ACME, Alpend, OneSwap, Temple, Tradecraft, EA Finance, Cantex, HANDL, and Nuxaris.

This list is expected to increase as more Canton projects agree to test Atlas during the pilot period.

Canton Army and Canton News are Canton-specific channels. Atlas turns this existing reach into measurable onboarding infrastructure.

---

## Marketing and Co-Marketing Strategy

The launch strategy uses existing Canton-focused reach rather than paid generic crypto marketing. Atlas will use Canton Army launch campaigns, Canton News launch campaigns, Telegram onboarding support, pilot project announcements, educational articles, partner launch posts, campaign explainers, case studies, and monthly ecosystem updates.

### Launch strategy

1. **Canton-native launch:** Atlas launches directly into the Canton Army and Canton News audience, giving the pilot immediate access to a Canton-specific user base.
2. **Pilot project campaigns:** Atlas uses initial pilot partners to create real campaign inventory for users from launch. Campaigns are configured through the project portal and matched to users through wallet scores.
3. **Cross-chain acquisition:** Atlas expands wallet support to external chains in Milestone 2, allowing Canton projects to identify relevant users from other ecosystems and bring them into Canton.

### User education

Atlas will publish explainers covering wallet connection, non-custodial verification, Atlas Score categories, user consent controls, contact preferences, and how users can discover relevant Canton offers.

---

## Milestones and Deliverables

### Milestone 1: Canton Pilot Launch

**Estimated Delivery:** Months 1-2 after grant approval  
**Payment on Acceptance:** 300,000 CC  
**Focus:** Canton wallet connection, multi-wallet profiles, scoring v1, wallet insights, enriched wallet analytics, user dashboard, project portal, offer dashboard, Canton wallet support matrix, and first pilot campaigns.

#### Product checklist

- Public Atlas landing page
- User registration and authentication
- Canton wallet connection
- Signed-message wallet ownership verification
- Multi-wallet user profile
- Canton wallet activity ingestion
- Canton wallet support matrix covering live Canton Network wallets
- Initial integrations with highest-usage and technically ready Canton wallets
- Integration path documented for additional live Canton wallets
- Scoring engine v1
- Overall Atlas Score and individual category scores
- Canton-native activity score
- Wallet insights view
- Wallet analytics dashboard for connected wallets
- Categorized transaction history and project interaction history where data coverage is available
- Existing Canton explorer and Noves integration path for enriched wallet analytics
- User dashboard
- User offer dashboard
- Project portal v1
- Campaign and offer creation flow
- Consent, opt-in, and opt-out controls
- Optional email and Telegram notification preferences
- Bot / farmer risk indicators
- Public scoring methodology page
- Launch campaign across Canton Army, Canton News, and Telegram
- First milestone report

#### Pilot and value checklist

- 2,000+ user signups, connected wallets, or waitlist registrations
- 10+ pilot project campaigns configured, launched, or ready for launch
- 10 participating pilot projects offering Atlas users an incentive, perk, benefit, sign-up offer, rebate, early access, or other campaign offer
- Canton wallet support matrix published or delivered to the committee
- First campaign status report delivered

The 2,000-user target is conservative. Atlas expects to exceed this based on Canton Army, Canton News, Telegram distribution, existing pilot agreements, and direct relationships with Canton projects.

### Milestone 2: Cross-Chain Acquisition Layer

**Estimated Delivery:** Month 3 after grant approval, beginning after Milestone 1 acceptance  
**Payment on Acceptance:** 200,000 CC  
**Focus:** External-chain wallet support, multi-chain wallet portfolio support, cross-chain wallet insights, chain-relevant scoring, campaign analytics, broader partner rollout, and growth of the Canton user base by bringing proven DeFi, trading, lending, borrowing, liquidity, and prediction-market users from other chains into Canton.

#### Product checklist

- External-chain wallet connection support across the target network set
- Multiple chains in one Atlas wallet portfolio
- External-chain activity ingestion
- Cross-chain wallet insights
- Chain-relevant category scoring where required by the supported network and available data
- Clear separation between Canton activity score and external qualification score
- Campaign analytics dashboard
- External activity filters for verified Canton projects
- Canton app recommendations based on external wallet activity
- Campaigns for users active on external chains but new to Canton
- Segments for proven external-chain DeFi, trading, lending, borrowing, liquidity, and prediction-market users
- Pre-built wallet segments for common Canton project needs
- Audience size and quality previews for projects
- Dormant / reactivation campaign support
- Partner project reporting
- Final milestone report

#### Pilot and value checklist

- 10,000+ total user signups, connected wallets, or waitlist registrations
- 20+ pilot projects onboarded, approved for portal access, or offering Atlas users campaigns
- Campaigns targeting both active Canton wallets and qualified external-chain wallets
- Measurable external-chain onboarding results, including offer views, wallet connects, claims, and conversion activity where reported or verifiable
- Final milestone report covering wallet activation, campaign adoption, external-chain onboarding results, retention metrics, and sustainability plan

Each milestone report will include delivered features, supported wallets and chains, Canton wallet support status, scoring coverage, pilot project status, campaign status, integration notes, and next steps.

---

## Funding

**Total Funding Request:** 500,000 CC

| Milestone | Payment on Acceptance |
| --- | ---: |
| Milestone 1 - Canton Pilot Launch | 300,000 CC |
| Milestone 2 - Cross-Chain Acquisition Layer | 200,000 CC |
| **Total** | **500,000 CC** |

Project incentives are funded by participating projects. This grant funds Atlas infrastructure, not campaign reward budgets.

---

## Dependencies and Out of Scope

Milestone timing depends on Canton wallet signing support, chain data availability, existing Canton explorer coverage, Noves API access and coverage, other API coverage, pilot project readiness, user opt-in, compliance review of user-facing privacy and campaign terms, external-chain wallet support, and data reliability.

If a specific Canton wallet or external chain does not have reliable signing or scoring coverage by the relevant milestone, Atlas will prioritize the highest-confidence implementation path first and label lower-coverage categories accordingly.

This grant does not fund project incentive budgets, automated reward distribution, custody or wallet management, private wallet deanonymization, non-Canton project campaigns, general multichain advertising, the sale of raw wallet databases, the sale of unrestricted email or Telegram lists, or social-task quest farming.

Atlas will not present wallet scores as KYC, identity verification, proof of personhood, or regulated eligibility decisions.

---

## Public Ecosystem Outputs

Atlas will produce public milestone updates, a user-facing explanation of scoring categories, a project onboarding guide, supported wallet and chain coverage updates, aggregated non-personalized campaign learnings, and educational content explaining wallet-based targeting for Canton project acquisition. These public outputs are part of the common-good commitment described above and will be available to Canton projects whether or not they use Atlas for paid campaigns.

Atlas will not publish private user data, private contact information, unrestricted wallet databases, or sensitive anti-abuse thresholds.

---

## Team

The Atlas team operates Canton-only media and community infrastructure through Canton Army and Canton News.

The team has already worked with 40+ Canton projects and has strong relationships with nearly all Canton Network applications. Projects trust the team, want to collaborate, and have already shown pilot interest. This gives Atlas a strong path to campaign supply, user onboarding, project participation, and ecosystem adoption.

Relevant assets include Canton Army's 14.5K X followers and 4M+ impressions since launch; Canton News' 16K+ website visitors within six weeks; Canton News X's 1.2K followers and 150K+ impressions within six weeks; 200+ Canton-focused blogs and 100+ news articles / press releases; a 2K+ member Canton-only Telegram community; and pilot agreements or pilot interest across 20+ named projects.

The team's ultimate goal is to support Canton projects and the wider Canton ecosystem by helping applications find active, relevant users and helping users discover the Canton products that match their behavior.

---

## Risk Management

| Risk | Mitigation |
| --- | --- |
| Canton wallet integration coverage depends on wallet signing support | Maintain a Canton wallet support matrix and prioritize the highest-usage, technically ready wallets first |
| External-chain data quality varies by chain | Use reliable wallet support, existing Canton explorers, Noves where available, other indexers and APIs, score-confidence labels, and data-coverage indicators |
| Wallet signing and data standards vary by chain | Support the listed target external-chain networks using the strongest available wallet-connection, signing, explorer, indexer, and API paths |
| Score integrity must be protected | Keep sensitive scoring weights and anti-abuse thresholds private while explaining score categories |
| Pilot campaign timing may vary | Acceptance allows campaigns to be configured, launched, or ready for launch |
| User privacy must remain central | Use non-custodial wallet verification, opt-in notifications, contact-sharing consent, and private contact-data protection |
| Overclaiming risk from incomplete data | Use confidence indicators and data-coverage labels |
| Gaming or farming risk | Use wallet integrity signals, bot / farmer risk indicators, and private anti-abuse thresholds |
| Scope creep into non-Canton advertising | Keep project campaigns focused on Canton Network and use external-chain data only for Canton onboarding |

---

## Maintenance and Sustainability

Atlas is expected to become self-sustaining after the grant period through verified project campaign fees, premium targeting tools, analytics access, managed campaign setup, partner campaign support, custom reporting for Canton projects, sponsored Canton project campaigns, and continued ecosystem partnerships.

The grant funds the initial Canton infrastructure, pilot launch, and cross-chain wallet activity layer. Long-term operation is expected to be funded by participating Canton projects.

The business model is straightforward: projects pay for high-quality, measurable user acquisition and campaign analytics. The Development Fund investment seeds the infrastructure; campaign demand sustains it.

---

## Final Summary

Atlas is a Canton-first wallet activity and user acquisition platform that helps projects find the right users and helps users discover the right Canton opportunities.

It replaces random distribution with activity-based matching, gives users control over wallet connection and communications, gives projects better campaign targeting and analytics, and gives Canton a reusable ecosystem growth layer.

Milestone 1 builds and launches the Canton pilot. Milestone 2 adds external-chain qualification to bring relevant users into Canton. The total funding request is **500,000 CC**.
