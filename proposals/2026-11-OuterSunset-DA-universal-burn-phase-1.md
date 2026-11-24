# Development Fund Proposal: Universal Burn, Phase 1

| Field | Value |
| :---- | :---- |
| Organization | Outer Sunset (a Five North subsidiary) and Digital Asset |
| Author / Primary Contact | Sebastian Lindner, Outer Sunset, sebastian@chainsafe.io. Wayne Collier, Digital Asset, wayne.collier@digitalasset.com |
| Status | Submitted |
| Created | 2026-10-26 |
| Proposal Type | RFP-aligned (implements SV-approved [CIP-0129](https://github.com/canton-foundation/cips/blob/main/cip-0129/cip-0129.md), Universal Burn and Synchronizer Pricing) |
| RFP / Roadmap Area | 5, Multi-synchronizer support for protocol, application development and operations. 8, Canton Coin Tokenomics, with CIP-0129 as its CIP co-requirement. |
| Champion | Shaul Kfir (Digital Asset) |
| Total Funding Request | 15,000,000 CC |
| Project Duration | 4 months for delivery (Milestones 1 to 3); adoption milestones (Milestone 4) up to 24 months after grant approval |
| Label | `tokenomics` |
| SIG alignment | Canton Protocol & Multi-Synchronizer, Tokenomics |

## Abstract

Canton Mainnet runs one burn-mint economy on one synchronizer. Every other synchronizer on Mainnet sits outside Canton Coin (CC) tokenomics, historically under enterprise license fees that are being phased out. CIP-0129, Universal Burn and Synchronizer Pricing, closes that gap. This proposal funds the implementation of its Phase 1.

The deliverable is the Daml, Scala, and operational work that lets a dedicated synchronizer join the CC economy, in the form set out by the Dedicated Synchronizer Paymaster Model CIP: the synchronizer meters and reports its own traffic, a paymaster named on its registration pays for that traffic by burning CC on the Global Synchronizer at the list price, and each burn records activity through CIP-0104's activity recording hook, so the paymaster, as a featured app, earns app rewards on the traffic it pays for. The work is contributed directly to canton-network/splice, under its Apache 2.0 license, CI and contribution rules, and ships in a Splice release.

A dedicated synchronizer joins the economy at the Global Synchronizer's list price. This proposal delivers on-ledger registration by Super Validator vote, naming the synchronizer's paymaster and the maximum activity weights its burns can use; the paymaster's burn on the Global Synchronizer; a sync operator app that meters the synchronizer's traffic, reports it in 10-minute intervals and runs without a Global Synchronizer connection; operator-initiated logical synchronizer upgrades (LSU); Scan visibility; and a four-node deployment, through to production operation on Mainnet.

CIP-0129's Phase 2, the volume pricing curve and the commitment, collateral and loyalty discounts, is outside the scope of this devfund grant; this proposal builds the paymaster burn whose price those discounts would later set. The technical details of the paymaster model are specified in the Dedicated Synchronizer Paymaster Model CIP (in draft, number to be assigned), and this proposal implements it.

## Delivery team

This is a joint application by Digital Asset and Outer Sunset.

- Outer Sunset will own the core development of this proposal.

- Digital Asset will be responsible for project management, technical design reviews, CI and test on the Continuous Integration Long Running (CILR) and DevNet networks, and release coordination. Digital Asset will also be responsible for detailed code reviews, covered under an existing Maintenance grant.

This proposal builds on two pieces of Splice work outside its scope: participants that initialize themselves without a validator app (Splice issue 4879), which Digital Asset is delivering, and CIP-0104's activity recording hook, `ActivityRecorder`.

## Specification

### 1. Objective

Put every synchronizer on Canton Mainnet on the same Canton Coin burn-mint economy.

Today a validator burns CC through `AmuletRules_BuyMemberTraffic` to buy sequencer traffic on the Global Synchronizer, and the Super Validators all record that purchase by updating the Validator's traffic balance. That flow, the economic link between using Canton and contributing to it, exists for just one synchronizer.

The objective is to generalize it: any registered dedicated synchronizer's traffic is metered on its own sequencers and paid for by burning CC on the Global Synchronizer at the list price, and the paymaster, as a featured app, earns app rewards on that burn from the same reward pool, and under the same cap, as Global Synchronizer activity.

### 2. Implementation mechanics

Note: As part of the delivery of this grant, we will submit the following implementation mechanics as a CIP. We expect some details may change during the process of CIP deliberation. In the event of any discrepancy between the technical details in this grant and those in the approved version of the CIP, the CIP takes precedence.

A dedicated synchronizer joins the economy in three steps:

1. The synchronizer runs without enforcing traffic limits. The sync operator app, run by the synchronizer's operator, sets every member's traffic balance to the maximum, so the sequencers meter all traffic but never refuse any. Participants buy no traffic and need no wallet.

2. The sync operator app reports the traffic. An authenticated API returns, for each 10-minute interval of record time, the traffic consumed on the whole synchronizer.

3. The paymaster pays after the fact. The paymaster named on the synchronizer's registration buys the reported traffic on the Global Synchronizer, less any discount agreed with the Super Validators, burning CC at the list price. As any traffic purchase does, the burn creates a validator reward coupon for the paymaster, and it records activity through CIP-0104's activity recording hook, so the paymaster, as a featured app, also earns app rewards on the traffic it pays for. The paymaster's agreement with the Super Validators can let it pay with a delay and smooth its burn across rounds.

**Registration.** The Super Validators register a dedicated synchronizer by governance vote. The registration records the synchronizer id, its paymaster, and maximum app and asset activity weights that cap the activity a purchase can record. Further votes update or archive the registration, and archiving it takes the synchronizer out of the economy. Each of these votes gets a form in the Super Validator governance app. Registration gates joining the economy, not running a synchronizer: as CIP-0129 requires, anyone can run a dedicated synchronizer and admit participants to it without a license or a vote.

**Operating without the Global Synchronizer.** Participants on a dedicated synchronizer initialize through Canton without a validator app (Splice issue 4879), and the sync operator app needs no Global Synchronizer connection. Only the paymaster needs one, to pay. A Global Synchronizer outage therefore cannot stop a dedicated synchronizer, and the paymaster pays for the traffic consumed on the dedicated synchronizer during the Global Synchronizer outage window afterward.

**Pricing and rewards.** Dedicated traffic is priced at the Global Synchronizer's list price, currently $60 per megabyte set through CIP-0084, about $1 for a typical transaction before rewards. A discount is agreed off-ledger between the Super Validators and the operator, possibly across several synchronizers with the same paymaster, and the paymaster applies it by buying less traffic than the report shows; nothing on-ledger records or enforces it. The paymaster earns app rewards only while it is featured, from the same pool and under the same `featuredAppRewardCap` as Global Synchronizer activity. This assumes CIP-0104's traffic-based app rewards are live before any dedicated synchronizer joins the economy, and that the Featured App guidance applies to the entire Canton Network, including dedicated synchronizers and the Global Synchronizer.

**Payment and trust.** The Super Validators do not run a dedicated synchronizer's sequencers and cannot see its traffic, so at launch nothing on-ledger compares a paymaster's payments with the reported traffic. The operator can compare its traffic report with the burns visible in Scan and bring a shortfall to the Super Validators, who can vote to archive the registration. Checking payments against reported traffic on-ledger is out of scope.

### 3. Architectural and Roadmap alignment

This work extends existing Splice machinery and builds on work delivered outside this grant, listed under Risks and dependencies: CIP-0104's activity recording hook, participant self-initialization in Splice, and a Canton change for participants that join after bootstrap. The buy traffic choice with its burn, the traffic-control parameters, and the logical synchronizer upgrade machinery are reused, and the burn records activity through CIP-0104's activity recording hook, whose Scan ingestion and reward computation ship in Splice outside this grant. The net-new functionality is a registration template with create, update and archive governance actions, a paymaster path through the buy traffic choice, and the sync operator app, which meters and reports traffic without a Global Synchronizer connection, with its upgrade automation. Volume pricing and commitment discounts are out of scope.

This proposal responds to two Requests for Proposals in the Foundation's 2026-2028 roadmap. CIP-0129 is approved by the Super Validators, and the roadmap treats an approved CIP that needs a technical implementation as its own Request for Proposals.

- RFP 5, Multi-synchronizer support for protocol, application development and operations. Multi-synchronizer scaling is core to this work. The proposal will give the ecosystem an economically coherent way to balance load between the Global Synchronizer and more dedicated capacity, which is a scaling path Canton's architecture already assumes. A dedicated synchronizer stays in the economy without its participants connecting to the Global Synchronizer, and no participant on it buys or tracks traffic: one paymaster pays for the synchronizer against a report in fixed 10-minute intervals, and every burn is readable on-chain.

- RFP 8, Canton Coin Tokenomics. CIP-0129 is the CIP this RFP requires. The roadmap's 2028 vision has users and validators burning Canton Coin whether they transact on the Global Synchronizer or a dedicated synchronizer. This proposal builds that burn for dedicated synchronizers, and the paymaster earns rewards on it as a featured app under the existing reward rules.

Relevant CIPs: CIP-0129, Universal Burn and Synchronizer Pricing (the economic design); the Dedicated Synchronizer Paymaster Model CIP, in draft (the technical specification this implements); CIP-0104, Traffic-Based App Rewards, with its amendment adding the app activity recording hook (the reward path for dedicated-synchronizer traffic); CIP-0084 (the process that sets the Global Synchronizer's list price); CIP-0079 (the CC/USD price feed this reuses for conversion); and CIP-0082 (the reward split, which is unchanged). The Featured App Guidance v2.0b is assumed to apply to dedicated synchronizers exactly as on the Global Synchronizer.

### 4. Backward compatibility

Global Synchronizer users see no change to price, reward rules, or purchase flow. Dedicated-synchronizer activity joins the same reward pools, as CIP-0129 intends.

- All Daml changes are backwards compatible under Daml Smart Contract Upgrade rules as enforced also by Splice's upgrade checker: new fields on released serializable types are `Optional` and appended last, and new variant constructors follow the nullary rule rather than adding fields to existing ones.

- The Global Synchronizer, and any synchronizer in `requiredSynchronizers`, is priced and gated exactly as today.

- Dedicated synchronizers already deployed on Mainnet move onto the economy as CIP-0129 sets out: Digital Asset handles that transition with each existing customer.

Adopting any Daml change on Mainnet requires a Super Validator supermajority vote. This grant tracks that timing dependency, and the release of CIP-0104's activity recording hook, under Risks and dependencies.

## Milestones and Deliverables

### Milestone 1: Daml models

- **Estimated delivery:**

  - We estimate four weeks after grant approval.

  - Committed to six weeks after grant approval.

- **Type:** Delivery

- **Focus:** The on-ledger foundation: a registration naming the paymaster and the maximum activity weights, and the paymaster's burn that records activity for the traffic it pays for.

- **Deliverables:**

  - *Registration:* `RegisteredSynchronizer` Daml template recording the synchronizer id, paymaster, maximum app activity weight and maximum asset activity weight, rejecting invalid weights on create and update, with the paymaster as an observer; create, update and archive governance actions in `splice-dso-governance`.

  - *Paying:* the buy traffic choice (`AmuletRules_BuyMemberTraffic`) and the token-standard traffic purchase extended so a registered synchronizer's paymaster, and only that paymaster, burns CC for its traffic. The choice takes the synchronizer id, the traffic in bytes, and optional app and asset activity weights that default to the registration's maxima and are rejected above them, and the burn records the paymaster's app activity, and asset activity, through CIP-0104's `ActivityRecorder` hook.

  - *Release:* The Daml above merged into canton-network/splice and carried into a Splice release, so the package versions the Super Validators vote on are the released ones.

- **Residual:** nothing on-ledger stops the same synchronizer being registered twice. The Super Validator form blocks a duplicate when the proposal is raised, and an archive vote removes one that gets through; until then, either registration's paymaster can burn for the synchronizer under its own maximum weights.

- **Out of scope:** on-ledger uniqueness of the synchronizer id; checking paymaster burns against metered traffic on-ledger; and a good-standing attestation that participants without a Global Synchronizer connection can check.

- **Acceptance Criteria:**

  - The Daml above is merged into canton-network/splice and carried into a Splice release, so the package versions the Super Validators vote on are the released ones.

  - Its Daml test scripts pass in CI and cover: creating, updating and archiving a registration, and rejecting one with invalid weights; a burn by the registered paymaster through either purchase path, at weights up to the registration's maximums, recording the paymaster's app activity, and asset activity, through the `ActivityRecorder` hook; and rejecting a burn above the maximum weights, for an unregistered or archived synchronizer, or by anyone other than the registered paymaster.

- **Amount:** 1.5M CC

### Milestone 2: Backend and frontend implementation

- **Estimated delivery:**

  - We estimate two months after grant approval.

  - Committed to three months after grant approval.

- **Type:** Delivery

- **Focus:** The dedicated synchronizer meters and reports its traffic and runs without the Global Synchronizer; payments and the activity they record are visible, and registrations and upgrades go through the interfaces the ecosystem already uses.

- **Deliverables:**

  - *Metering:* the sync operator app (`apps/syncoperator`); traffic control on the dedicated synchronizer configured as on the Global Synchronizer but with no free traffic; every member's traffic balance set to `MAX_LONG` by a trigger polling `ParticipantSynchronizerPermission` and `SynchronizerTrustCertificate`; and the same unlimited balance for the synchronizer's own mediators, which that polling does not find.

  - *Reporting it:* a traffic report API on the sync operator app, taking a start and end record time and returning, for each 10-minute record-time interval aligned on the hour (XX:00, XX:10, ...), the traffic consumed on the whole synchronizer, in bytes; totals kept across sequencer pruning and LSUs for at least one month, so a paymaster that pays with a delay can still read them, with an in-progress interval never reported as final; the same totals from every node's sync operator app on a multi-node synchronizer; authenticated.

  - *Running without the Global Synchronizer:* the sync operator app with no Global Synchronizer dependency, and support on the dedicated synchronizer for participants that run without a validator app, using the participant self-initialization Digital Asset is delivering in Splice, so a participant can connect to the dedicated synchronizer alone.

  - *Seeing it:* registrations, each paymaster burn and the app and asset activity it recorded readable or computable from Scan's `/v2/updates`, `/v0/events` and `/v2/state/acs` endpoints; operator metrics and dashboards for metered traffic.

  - *Governing it:* vote proposal and review forms in the Super Validator governance app for every action and parameter this proposal introduces that existing forms cannot accommodate, including creating, updating and archiving a registration, with the paymaster and both maximum weights as fields, and validation at proposal time including the duplicate check.

  - *Upgrading it:* LSU automation in the sync operator app that carries topology and traffic state to the successor synchronizer, started through the app's configuration rather than a vote, so an operator upgrades on its own schedule rather than the Global Synchronizer's.

- **Out of scope:** paymaster automation, which each paymaster builds for itself; a per-member funding mode with enforced balances.

- **Acceptance Criteria:** Support for all of the following is implemented and merged in canton-network/splice:

  - A participant connected only to the dedicated synchronizer, with no validator app, is admitted by the operator's permissioning and transacts without buying traffic, and its traffic is metered; a participant the operator has not admitted is refused and gets no traffic.

  - A paymaster reads the traffic metered on its synchronizer for a completed range of record time, in 10-minute intervals, from the sync operator app, and pays for it by burning CC on the Global Synchronizer.

  - Any third party can read from Scan what each registered dedicated synchronizer's paymaster has burned and the app and asset activity each burn recorded, and an operator can see its synchronizer's metered traffic on a dashboard.

  - Super Validators raise, review and pass every action and parameter introduced here via the Super Validator governance app.

  - A participant on the dedicated synchronizer keeps transacting through a Global Synchronizer outage of any length, because neither the synchronizer, the sync operator app nor its participants need a Global Synchronizer connection, and the paymaster pays for that window's metered traffic once it can reach the Global Synchronizer again.

  - The sync operator can trigger an LSU through the sync operator app's configuration to apply upgrades, carrying topology and traffic state across. Those do not need to be in lockstep with those of the Global Synchronizer, but should follow successful upgrades of the Global Synchronizer.

- **Amount:** 2.0M CC

### Milestone 3: Deployment tooling and testing

- **Estimated delivery:**

  - We estimate three months after grant approval.

  - Committed to four months after grant approval.

- **Type:** Delivery

- **Focus:** The whole flow runs end to end in Splice's CI and cluster tests, then continuously on DevNet from the published artifacts, with the tooling and documentation an outside operator needs to deploy and upgrade, and a paymaster needs to pay.

- **Deliverables:**

  - *Bootstrap and charts:* scripted synchronizer bootstrap of all four nodes, covering sequencer, mediator, initial topology and dynamic parameters, including no free traffic and permissioned onboarding from day one; Kubernetes Helm charts for the synchronizer, the sync operator app and a participant that runs without the Global Synchronizer, usable for CILR, DevNet and Mainnet alike.

  - *Topology:* a default topology of four sequencer and mediator nodes, each with its own sync operator app, so the dedicated synchronizer is exercised as a Byzantine fault tolerant (BFT) synchronizer rather than a single node.

  - *Testing:* an end-to-end acceptance scenario in CI that itself drives the paymaster's burns; a four-node integration test and a cluster test of the charts; an upgrade-compatibility gate on Daml changes.

  - *DevNet:* the charts deployed on DevNet, running the same four-node topology, with a paymaster run by the delivery team burning DevNet CC for its traffic.

  - *Documentation:* an operator guide covering bring-up of the four-node deployment, registration, permissioning, participants that run without the Global Synchronizer, the traffic report API, upgrades and offboarding; and a paymaster guide covering reading the report, applying an agreed discount, and paying for it regularly or smoothed across rounds, including after a Global Synchronizer outage.

  - *Upgrades:* a runbook for the config-initiated LSU, preserving sequencer ids, topology and traffic state.

- **Contingency:** if a participant can connect to both the dedicated synchronizer and the Global Synchronizer, the end-to-end scenario also runs a workflow spanning both through that participant.

- **Out of scope:** documentation for adding and removing nodes after bootstrap.

- **Acceptance Criteria:**

  - The end-to-end scenario runs in CI and is reproducible by a reviewer: register a synchronizer and its paymaster by vote, have participants transact on it, read the window's traffic from the report API, have the paymaster burn for it, and find the activity records the burn created.

  - An operator brings up the four-node synchronizer from the charts, with a sync operator app per node, in the cluster test; and in the four-node integration test every member gets the maximum balance on all four sequencers and a participant transacts.

  - Participants the operator does not run transact on a dedicated synchronizer that runs continuously on DevNet, registered by governance vote, deployed from the published charts rather than a development tree, and paid for by its paymaster burning DevNet CC, evidenced on-chain by the registration contract and the paymaster's burns and activity records.

- **Amount:** 1.5M CC

### Milestone 4: Mainnet adoption

- **Estimated delivery:** Each part below is paid once its criteria are met, and forfeited if they are not met within 24 months of grant approval.

- **Type:** Adoption

- **Focus:** The Daml is live on Mainnet, a dedicated synchronizer runs on it in production, and dedicated synchronizers drive burn.

- **Depends on:** approval of the Dedicated Synchronizer Paymaster Model CIP, and Super Validator adoption on Mainnet of these changes and of CIP-0104's activity recording hook.

**Milestone 4a: Live on Mainnet**

- **Acceptance Criteria:** Every Daml package delivered here is vetted on Mainnet, the Super Validators having adopted it by vote.

- **Amount:** 1.0M CC

**Milestone 4b: First dedicated synchronizer in production**

- **Acceptance Criteria:** At least one dedicated synchronizer has run in production on Mainnet for three consecutive months, operated by a party outside the delivery team and brought up from the operator guide alone, with its paymaster burning CC for its traffic over that period as its agreement with the Super Validators sets. The registration and the paymaster's burns are verifiable on-chain through Scan; the operator's independence is confirmed by the Foundation, which may keep their identity confidential.

- **Amount:** 2.0M CC

**Milestone 4c: Burn target**

- **Acceptance Criteria:** The paymasters of registered dedicated synchronizers burn at least $50,000,000 USD in total on Mainnet within 24 months of grant approval, as recorded on-chain and readable through Scan.

- **Amount:** 2.0M CC

**Milestone 4d: Burn stretch goal**

- **Acceptance Criteria:** That total reaches $500,000,000 USD within 24 months of grant approval.

- **Amount:** Additional 5.0M CC

## Acceptance criteria

Each milestone above carries its own criteria. Across the grant, the Tech and Ops Committee will evaluate completion on deliverables completed as specified for each milestone, demonstrated functionality or operational readiness, documentation and knowledge transfer provided, and alignment with the value metrics in each milestone's acceptance criteria. Acceptance rests on value to the ecosystem, not on delivery of an artifact. The Committee will also evaluate against:

- Capability focused. Every criterion of Milestones 2 and 3 states something an ecosystem participant can do that they could not before, reproducible by a reviewer from the CI tests or a deployment of the delivered code, or verifiable on-chain.

- On-chain verifiability. Registrations, every paymaster burn and the activity it records are readable on-chain, and the CC cost of any burn is recomputable from the list price and the round's CC/USD price, without trusting any operator. Metered consumption comes from the operator's report, and any discount from its off-ledger agreement with the Super Validators, not chain data.

- Same terms on the Global Synchronizer. A validator buying traffic on the Global Synchronizer pays the same price, earns rewards under the same rules, and uses the same purchase flow after this work ships as before it.

- Adoption. Gated at M4, where adoption first becomes possible: the Daml live on Mainnet, production operation by a party outside the delivery team, and the CC that dedicated synchronizers burn within 24 months.

- Delivery and adoption are paid separately. Milestones 1, 2 and 3 are delivery. Milestone 4 is adoption. No milestone mixes the two.

On the adoption weighting: 10.0M of the 15.0M request is adoption-contingent, 5.0M of it a stretch goal, all at Milestone 4, where adoption is actually possible.

## Funding

Total funding request: 15.0M CC: Delivery: 5.0M CC. Adoption-contingent: 5.0M CC. Adoption stretch goal: 5.0M CC.

| **Milestone** | **Trigger** | **Amount (CC)** | **Digital Asset / Outer Sunset split (CC)** | **Deadline** |
|----|----|----|----|----|
| M1: Daml models | Committee acceptance | 1.5M | 0.75M / 0.75M | 6 weeks after grant |
| M2: Backend and frontend implementation | Committee acceptance | 2.0M | 1.0M / 1.0M | 3 months after grant |
| M3: Deployment tooling and testing | Committee acceptance | 1.5M | 0.75M / 0.75M | 4 months after grant |
| M4a: Live on Mainnet | Daml adopted on Mainnet by vote | 1.0M | 0.5M / 0.5M | 24 months after grant |
| M4b: First dedicated synchronizer in production | Three months of third-party operation on Mainnet | 2.0M | 1.0M / 1.0M | 24 months after grant |
| M4c: Burn target | $50,000,000 USD burned by paymasters | 2.0M | 1.0M / 1.0M | 24 months after grant |
| M4d: Burn stretch goal | $500,000,000 USD burned by paymasters | 5.0M | 2.5M / 2.5M | 24 months after grant |
| **Total** |  | **15.0M** | **7.5M / 7.5M** |  |

### Volatility stipulation

The delivery milestones complete within approximately four months of grant approval. Milestone 4 turns on events this grant does not control, so each of its parts has a fixed deadline of 24 months after grant approval, for budgeting and audit, and is forfeited if its criteria are not met by then. The proposal is denominated in a fixed amount of Canton Coin and can run past six months, so the remaining milestones are re-evaluated at the six-month mark and renegotiated for USD/CC price volatility.

## Risks and dependencies

- **The paymaster CIP.** This proposal implements the Dedicated Synchronizer Paymaster Model CIP, which is in draft. Its approval is a decision outside this grant, and Mainnet adoption (Milestone 4) depends on it, on a timeline the CIP process sets. If review changes the model, the milestones follow the approved text.

- **CIP-0104's activity recording hook.** The paymaster's burn records activity through `ActivityRecorder`, which CIP-0104's amendment specifies; neither the amendment's approval (a Super Validator decision) nor the hook's release in Splice is part of this grant. Every acceptance criterion involving a paymaster burn depends on it: Milestone 1's release of the Daml; Milestone 2's paying, visibility and outage criteria; Milestone 3's end-to-end and DevNet criteria; and every part of Milestone 4.

- **CIP-0104's rollout.** CIP-0104 switches to traffic-based app reward computation in a later step of its rollout, subject to Tokenomics committee approval, and activity recorded before then earns no rewards. This proposal assumes the switch happens before any dedicated synchronizer joins the economy, and no acceptance criterion here requires rewards to be paid.

- **Participant self-initialization.** Participants without a validator app rely on Canton initializing them (Splice issue 4879), which Digital Asset is delivering in Splice. Milestone 2's first and fifth criteria, Milestone 3's end-to-end, four-node and DevNet criteria, and Milestones 4b, 4c and 4d depend on it; if it extends to sequencers and mediators, it may change Milestone 3's bootstrap.

- **New participants.** The sequencer reports traffic state only for members already in its topology, so giving a participant unlimited traffic before it joins relies on a Canton change, outside this grant, that Digital Asset has said it will make. Without it, a participant joining after bootstrap cannot finish connecting, since with no free traffic it has no balance to connect with. Milestone 2's first criterion, Milestone 3's end-to-end, four-node and DevNet criteria, and Milestones 4b, 4c and 4d depend on it.

- **Payment rests on the paymaster.** At launch nothing on-ledger compares burns with metered traffic (see Payment and trust). Recorded activity stays bounded by what was paid and the registration's maximum weights.

- **Payment timing.** Recorded activity counts in the round of the burn, so a payment covering a long period lands all its activity in one round, where that round's minting allowance caps it, and lump payments can trip the Featured App guidance's checks on sudden changes in activity. The paymaster CIP lets the Super Validators agree on a delay with a paymaster so it can smooth its burn, for example at a constant rate each round, and the paymaster guide covers doing so.

- **Permissioning.** Anyone admitted to a dedicated synchronizer consumes traffic its paymaster pays for, so from bootstrap, onboarding is restricted to participants the operator admits.

- **One paymaster per synchronizer.** A registration names one paymaster, and changing it takes an update vote, so replacing a paymaster that stops paying waits on that vote.

- **Activity the paymaster can record.** The paymaster, a featured app, records activity on its burns, up to the registration's maximum weights. The Super Validators set those maximums per synchronizer by vote, and a maximum asset activity weight of 0 turns asset activity off.

- **Minimum purchase.** The buy traffic choice enforces a minimum purchase (`minTopupAmount`); if the paymaster's path keeps it, a paymaster on a quiet synchronizer can pay only once its metered traffic reaches that minimum, or must pay for more than was metered.

- **Cross-synchronizer workflows.** A workflow spanning both synchronizers needs a participant connected to both. Milestone 3's end-to-end scenario does not depend on one, and runs that workflow where one is set up.

- **Super Validator governance.** Adopting Daml changes on Mainnet, and registering each synchronizer, requires a Super Validator vote. The adoption milestone is exposed to it, as is Milestone 3's DevNet criterion, which needs the synchronizer registered by vote on DevNet. Delivery milestones are otherwise written against demonstrable capability.

- **Adoption share.** 10.0M of the 15.0M request, including the 5.0M stretch goal, depends on events outside the applicants' control: approval of the Dedicated Synchronizer Paymaster Model CIP, Super Validator adoption on Mainnet, production operation by a party outside the delivery team, and how much CC dedicated synchronizers burn.

## Co-marketing

On release, the applicants will work with the Foundation on announcement coordination, a technical write-up of the design and its trust model, operator-facing material for teams evaluating a dedicated synchronizer, and paymaster-facing material on paying for a synchronizer's traffic. The design document, the work breakdown, and the operator and paymaster guides will be published and reusable by the Foundation.

## Motivation

The problem is structural, not incremental. Canton's architecture is multi-synchronizer by design, and applications with premium needs already run their own synchronizers. Those synchronizers are Mainnet: they carry the same assets, and apps on them can transact with apps on other synchronizers. Their economics are not. An operator can run a Mainnet synchronizer, benefit from the shared protocol, security model, and interoperability, and contribute nothing to the ecosystem that maintains them. License fees used to cover that, and they are ending.

Who benefits. Every current and future dedicated synchronizer operator; every participant on one, which needs no wallet or traffic purchase of its own; every paymaster, which as a featured app earns app rewards on the traffic it pays for; and every CC holder, through the burn those synchronizers begin contributing. Today the set of synchronizers inside CC tokenomics is one (1). This work makes that set unbounded, and the portion of the ecosystem that benefits directly is every dedicated synchronizer on Mainnet, all of which sit outside that set today.

Why it also unlocks scaling. Load that today must sit on the Global Synchronizer, or sit off the economy entirely, gets a priced path onto dedicated capacity. This proposal puts that path in place at one list price. CIP-0129's Phase 2 adds a published curve, so the price falls as a synchronizer's throughput rises and as its operator commits to that volume, which is what makes high-volume workloads viable on dedicated capacity.

## Rationale

Why extend rather than replace. The buy traffic choice with its burn, the traffic-control parameters, and CIP-0104's activity recording hook with its Scan ingestion and reward computation are the Splice machinery this builds on. The design adds a registration template with its governance actions, a paymaster path through the existing buy choice, and the sync operator app. It introduces no parallel economy, no second price feed, no new reward pool, and no change to the pool split.

Why registration is a separate template rather than a config field. Splice's `requiredSynchronizers` lists the synchronizers that Canton Coin and name-service users should be connected to, and code relies on that meaning. Overloading it with "synchronizers that support traffic purchases" is the kind of reuse that looks economical and produces a subtle regression. A dedicated template with its own governance actions keeps the existing meaning intact.

Why the registration names the paymaster. The paymaster earns app rewards on its burns, so a payer chosen by whoever submits the burn would let anyone earn on a synchronizer's traffic. The governed registration names the paymaster, so a burn by any other party is rejected rather than trusted.

Why the dedicated synchronizer meters but does not enforce. Canton accounts traffic per member and has no pooled account. Setting every balance to `MAX_LONG` and metering with no free allowance gives a synchronizer-level account without adding pooled accounts to Canton: one paymaster pays for the whole synchronizer, no participant needs a wallet, a Global Synchronizer connection or a top-up, and a Global Synchronizer outage cannot stop the synchronizer. The cost is enforcement: the sequencer no longer refuses unpaid traffic, which this proposal states as its trust boundary.

Alternatives considered.

- A purchase handshake: the buyer announces a purchase, the Super Validators ask for the burn and issue a traffic coupon for it, and the buyer reports actual use at the end of each period. Rejected. The paymaster's direct burn is simpler and suffices at launch.

- Per-member purchases with enforced balances. Each participant buys its own traffic on the Global Synchronizer and the operator grants it on the dedicated sequencer, so the sequencer refuses unpaid traffic. Not chosen for this phase: every top-up needs the Global Synchronizer, every participant needs a validator app and a wallet, and a Global Synchronizer outage needs a temporary traffic allowance so members can keep transacting. It can return later as a second funding mode.

- Publishing traffic reports on the Global Synchronizer. Not chosen for this phase: the sync operator app runs without a Global Synchronizer connection, so the report is served where the traffic is metered, and what reaches the Global Synchronizer is the paymaster's burn and the activity it records.

- A pooled traffic account in Canton. Not needed for this phase: `MAX_LONG` balances with a single payer give a synchronizer-level account, at the cost of enforcement set out above.

- Verifying dedicated-synchronizer activity rather than bounding it. Not available: the Super Validators do not run the dedicated sequencer or mediator, so there is nothing to recompute against. Rewards here derive from the paymaster's burn, so recorded activity is bounded by the traffic paid for and the registration's maximum weights; whether payment covers metered traffic rests on the paymaster at launch.

- A reward pool for dedicated-synchronizer operators. Rejected, consistent with the CIP. The four existing reward pools and their split are unchanged; this work extends who participates in them, through CIP-0104's activity recording hook.

## Maintenance

This code is contributed directly to canton-network/splice, under its Apache 2.0 license, CI, and contribution rules, and ships in Splice releases. Digital Asset, a co-applicant and currently Splice's core maintainer, will incorporate long-term maintenance into its existing maintenance grant.

Beyond that, the applicants commit to security patches for disclosed vulnerabilities in code delivered here, correctness fixes affecting the paymaster burn and its activity recording, metering and the traffic report, and the upgrade paths, and tracking CIPs that change the semantics this work depends on, CIP-0104 and its amendments included. The design documentation, work breakdown, operator guides and paymaster guides will be published and stay public.
