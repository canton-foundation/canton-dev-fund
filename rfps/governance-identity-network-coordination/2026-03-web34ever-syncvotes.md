## Development Fund Proposal

**Organization:** web34ever, Canton MainNet validator operator\
**Author / Primary Contact:** @web3validator, @papsanly\
**Status:** Submitted\
**Created:** 2026-03-10 (revised 2026-05-05, 2026-07-15; Dev Fund 2.0 update 2026-09-26)\
**Proposal Type:** RFP-aligned\
**RFP / Roadmap Area:** RFP-09 Governance automation; RFP-02 Application decentralization (the BitSafe Decentralization Manager integration)\
**Champion:** `Needs Champion`\
**Total Funding Request:** 700,000 CC (unchanged)\
**Project Duration:** 3 months from approval\
**Label:** onchain-governance

File in the fork: `rfps/governance-identity-network-coordination/2026-03-web34ever-syncvotes.md` (replaces `proposals/cantondao.md`).

## Abstract

SyncVotes is open-source DAO governance for the Canton Network with its own integrated wallet: members hold their keys in the browser, the browser verifies every transaction before signing it, and proposals are counted and carried out on-ledger in Daml. It is live on [MainNet](https://syncvotes.com), [TestNet](https://test.syncvotes.com) and [DevNet](https://dev.syncvotes.com), with public docs at [syncvotes.com/docs](https://syncvotes.com/docs) and the code under MIT at [SYNCVOTES/syncvotes](https://github.com/SYNCVOTES/syncvotes).

Communities create DAOs, submit proposals and vote with member-held keys; membership and settings changes are executed on-ledger. The request recognizes that delivered platform and funds a DAO treasury with multisig control and proposal-based payouts, followed by independent-operator control through BitSafe's Decentralization Manager. Our first customer, POSTHUMAN, can move its current voting to Canton before the treasury is ready; the treasury adds the collective spending it also needs.

## Specification

### 1. Objective

A community on Canton should be able to decide together **and act on the decision with its own funds**, without trusting a single operator. SyncVotes already delivers the deciding part. This grant delivers the acting part: a DAO treasury that pays out only what a vote approved, under the control of independent operators rather than one validator.

Current functionality:

- **DAOs** by membership (one member, one vote) or by shares; public or private DAO pages.
- **Proposals:** a decision (yes, no, abstain); a choice among 2–10 options, one pick or several; changes to the DAO — members and shares, name and picture, voting rules, visibility, dissolution — carried out on-ledger once passed.
- **Rules:** yes against the whole vote or the votes cast; majority, a percentage or a fraction; quorum; settle early once certain; votes that may change until the deadline; ballots hidden from other members, but not from the hosting operator. Changes to the DAO run under the DAO's own rules; a proposer sets the rule for a decision or a choice.
- **Operational treasury:** each DAO, or each member, pays its traffic from a balance topped up by sending CC with a memo from any wallet, charged the traffic's cost net of the rewards it earns back. This covers transaction costs; a treasury for payouts is the work funded here.
- **Trust model, stated:** what the operator can and cannot do is published ([Trust Model](https://syncvotes.com/docs/trust-model)), with a [self-hosting guide](https://syncvotes.com/docs/self-hosting) for communities that want to run their own instance.

Sources: [current code and deployment documentation](https://github.com/SYNCVOTES/syncvotes/tree/3c14e2522a76) and [user documentation](https://syncvotes.com/docs). On 26 September 2026, the MainNet, TestNet and DevNet `/version` endpoints all reported commit `3c14e2522a76`.

### 2. Implementation Mechanics

**Delivered platform.**

- **Keys and parties.** Each member is an [external party](https://docs.canton.network/overview/reference/external-party). The key comes from a 12-word phrase (BIP-39, SLIP-0010, ed25519) in the browser and rests encrypted with AES-GCM behind a passkey (WebAuthn PRF) or a password; the phrase restores the same party on any device.
- **Signing.** The server prepares each transaction through interactive submission; the browser decodes it, recomputes the hash and signs only if it is exactly the choice, contract and arguments the page asked for, acting as the member alone. The server executes only transactions it prepared, and the app's ledger user is not granted the right to act as a member.
- **Daml.** Package [`syncvotes` 1.0.3](https://github.com/SYNCVOTES/syncvotes/blob/3c14e2522a76/daml/daml.yaml), checked as an upgrade of 1.0.2. The provider co-signs the application's contracts, counts ballots in batches and executes supported changes. The ledger checks the ballots submitted to it, including eligibility, deadlines and duplicate counting; it cannot detect ballots the provider omits.

**Funded work.**

- **DAO treasury.** A treasury party per DAO, holding CC through the CIP-0056 token standard, controlled m-of-n by named signers. It can move funds only to execute a passed payout proposal.
- **Payout proposals.** A new proposal type — a one-off payment of a specified amount to a specified party — decided under the DAO's rules. Execution also requires the treasury's multisig approvals; the payment and its proposal stay linked on-ledger.
- **Independent operators.** M3 places the treasury authority under a decentralized namespace managed through BitSafe's Decentralization Manager. Execution requires independent operators; this milestone does not decentralize every existing DAO action. BitSafe has confirmed its readiness to collaborate; specific operator roles, supported versions and costs are still to be agreed.

### 3. Architectural Alignment

- **External parties and interactive submission** — the only way a member's transaction is ever signed.
- **Smart Contract Upgrades** — compatible changes use the existing upgrade mechanism. Treasury and DM integration may require new contracts or parties; their adoption by existing DAOs will be documented and tested.
- **CIP-0056 token standard** — pay-ins today; treasury holdings and payouts in this grant.
- **CIP-0047 / CIP-0104** — activity markers only on meaningful activity; the provider as confirmer for traffic-based rewards.
- **RFP-09 Governance automation** — proposals, voting, decision records and authorized execution for application-level communities and organizations.
- **RFP-02 Application decentralization** — treasury authority shared across independent operators using BitSafe's Decentralization Manager rather than a separate topology-management system.
- **Privacy** — private DAO pages and hidden ballots restrict access by other users, not by the hosting operator. Additional hosting operators may also see contracts; self-hosting changes whom the community trusts, not this visibility model.

### 4. Backward Compatibility

Existing DAOs are not automatically moved to new parties or contracts. We will test the impact on existing governance and document an opt-in path to the treasury and DM deployment, including any migration, approvals and user actions required. A migration-free transition is not assumed.

## Milestones and Deliverables

| Milestone | Status / target | CC |
| --- | --- | --: |
| 1. Delivered platform and integrated wallet: v1 followed by live v2 | Delivered by the team; committee acceptance pending | 350,000 |
| 2. DAO treasury with multisig control and proposal-based payouts | Within 1 month of approval | 200,000 |
| 3. BitSafe Decentralization Manager integration | Within 3 months of approval | 150,000 |
| Total |  | 700,000 |

### Milestone 1: Delivered platform and integrated wallet

- **Estimated Delivery:** Delivered — v1, followed by the live v2. Committee acceptance pending; this is a request for delivered work, not a claim of prior grant approval.
- **Focus:** Canton-native DAO governance with member-held keys.
- **Deliverables / Value Metrics:**
  - v2 live on MainNet, TestNet and DevNet
  - Integrated wallet: in-browser keys, browser-verified signing, restore from phrase
  - `syncvotes` 1.0.3 Daml package, checked against the preceding release
  - Public MIT repository, user documentation, trust model and self-hosting guide

### Milestone 2: DAO treasury with multisig control and proposal-based payouts

- **Estimated Delivery:** Within 1 month of approval
- **Focus:** A DAO spends its own funds, only as its members decided.
- **Deliverables / Value Metrics:**
  - Per-DAO treasury party with m-of-n control, holding CC through the token standard
  - One-off payout proposals and the UI to approve and execute them
  - Treasury contract review and security tests, with findings documented and blocking issues resolved before MainNet use; no separate external audit is promised
  - A community-led MainNet pilot with a proposal-authorized payout; POSTHUMAN is the intended first partner, subject to its agreement
  - User documentation, signer-change and recovery procedures

### Milestone 3: BitSafe Decentralization Manager integration

- **Estimated Delivery:** Within 3 months of approval
- **Focus:** No single operator can execute a treasury payout or take over treasury authority.
- **Deliverables / Value Metrics:**
  - Treasury authority held by a party under a decentralized namespace through BitSafe's Decentralization Manager
  - Hosting and control involving at least two operators independent of web34ever and each other
  - At least one MainNet DAO using this treasury authority, with documented deployment, data visibility, outage recovery and an opt-in path for other DAOs

The web34ever team is responsible for delivery. These dates are our estimates, not BitSafe's commitments. Operator participation, approval thresholds, supported DM versions and operating costs must be agreed before deployment. If an external dependency prevents delivery, any scope or date change requires committee approval.

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone
- Demonstrated functionality or operational readiness
- Documentation and knowledge transfer provided
- Alignment with stated value metrics

Project-specific conditions:

- **M1:** public source and documentation, with reproducible demonstrations of wallet creation/recovery, DAO creation, voting and execution of a supported DAO change on MainNet; an end-to-end walkthrough on TestNet.
- **M2:** a real community, not an internal test DAO, funds a MainNet treasury and passes a payout proposal. Execution requires both the passed proposal and the configured multisig threshold, pays the exact recipient and amount, and cannot happen twice. Publish source, review findings and reproducible tests rejecting unapproved proposals, insufficient signatures, altered recipient/amount and duplicate execution. The app operator cannot bypass this policy. Document and test signer changes and recovery.
- **M3:** demonstrate a MainNet payout with DM-integrated treasury authority and at least two operators independent of web34ever and each other. Publish operator identities, party ID, namespace/key/hosting topology, approval thresholds and execution records. Test that one operator cannot execute alone or unilaterally take over authority. Publish deployment, data-visibility and tested outage/recovery procedures. DM does not itself prove ballot completeness; document the remaining counting and execution trust dependencies.

Community use and independent-operator participation must be evidenced, not inferred from simulations. The same community may demonstrate M2 and then M3.

## Funding

**Total Funding Request:** 700,000 CC

### Payment Breakdown by Milestone

- Milestone 1 (Delivered platform and integrated wallet): 350,000 CC upon committee acceptance
- Milestone 2 (DAO treasury with multisig control and proposal-based payouts): 200,000 CC upon committee acceptance
- Milestone 3 (BitSafe Decentralization Manager integration): 150,000 CC upon final release and acceptance

M1 requests recognition of delivered development, subject to committee acceptance. M2 funds treasury contracts, proposal and signing flows, UI, review, tests, documentation and pilot support. M3 funds DM integration, multi-operator deployment, testing and the runbook. These are proposed milestone allocations, not audited expenditure or third-party quotations. The existing operational treasury is not charged again as new development.

### Volatility Stipulation

The remaining delivery target is 3 months from approval. Should the timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility.

## Co-Marketing

Upon release, the implementing entity will collaborate with the Foundation on:

- Announcement coordination
- A technical post: governance on Canton with external parties, browser-verified signing and on-ledger execution
- A community migration and treasury case study, with the participating community's consent
- Developer and ecosystem promotion, including validator communities

## Motivation

**First customer.** POSTHUMAN, an independent partner community, has run its governance on DAO DAO for years, first on [Juno](https://daodao.zone/dao/juno1h5ex5dn62arjwvwkh88r475dap8qppmmec4sgxzmtdn5tnmke3lqwpplgg), then on the [Cosmos Hub](https://daodao.zone/dao/cosmos1lj6knrgumqr5a9jxmkqeag476gmzgn24mv0w3548tyw6a5ryr7ms6xl599). SyncVotes was built around its requirements and continues to develop with its feedback. POSTHUMAN can migrate its current voting before the treasury is ready. We are technically ready for that step, targeting 1–2 weeks once viable transaction costs and community approval are confirmed. Treasury use follows M2; its absence need not block the initial voting migration. The migration is planned, not yet complete. We are also in discussions with other validator-operated communities entering Canton; no additional deployments are claimed as confirmed.

**Who benefits.**

- **Validator operators and their communities** — delegators, node partners and working groups that decide things together and hold shared funds. SyncVotes gives them Canton-native governance instead of Snapshot or DAO DAO, and self-hosting lets a validator offer it to its own community.
- **Canton Foundation committees and working groups** — could create their own DAOs to review member proposals, funding applications and other submissions, discuss them, vote and record decisions on-ledger. We are ready to work with the Foundation on workflow design, a pilot and integration with existing submission and review processes. Requirements and integration scope would be agreed jointly.
- **Institutions and consortia** — DAO pages and ballots restricted from other users, with hosting-operator visibility disclosed; the planned treasury distributes spending authority across independent operators.

**How it drives adoption.**

- **New parties, not new wallets.** A member joins with a key made in the browser; every member of every DAO becomes a Canton party, including people who have never used Canton.
- **Real traffic.** Every proposal, ballot, count and payout is a confirmed transaction that burns traffic.
- **Migrations.** Communities can start with voting on Canton and later move shared spending to a DAO treasury. We will report actual community use separately from internal tests and uncommitted discussions.

**Roadmap beyond this grant** (not funded here; separate proposals if needed): notifications (a Telegram bot for new proposals, deadlines and results); join requests and invite links for public DAOs; scheduled payouts and proposal deposits; delegation; committees with veto; ranked-choice and token-weighted voting; a public API, embeddable widget and TypeScript SDK; a governance export.

## Rationale

**Why a Canton-native tool?** Rather than reproduce the full action menu of an EVM or Cosmos DAO, SyncVotes implements voting and supported actions using Canton parties and Daml authorization. The treasury extends those actions to community spending.

**Why an integrated wallet?** The hosting participant needs the application's Daml package. The integrated wallet gives members external-party onboarding and transaction verification without requiring a third-party wallet to support SyncVotes contracts. Members keep their key in the browser; incoming CC payments use the token standard.

**Why integrate BitSafe's Decentralization Manager?** It provides decentralized-party topology and a [custom propose/confirm/execute interface](https://github.com/DLC-link/decentralization-manager/blob/4d650edbbf851852311a4921af8f5df608450a6b/docs/CUSTOM_DAML_TEMPLATES.md). SyncVotes must implement payout-specific contracts and approval checks; DM is not a ready-made DAO treasury. [Discussions with BitSafe are already under way](https://github.com/canton-foundation/canton-dev-fund/pull/70#issuecomment-4395033969).

**Why state the trust model?** The operator cannot sign a member's ballot, but can delay execution and affect results by omitting ballots. The [trust model](https://syncvotes.com/docs/trust-model) also explains membership-list omissions and the provider/creator collusion risk. M3 distributes treasury authority; it does not automatically remove all application trust dependencies or prove that every ballot was counted.

**Earlier revisions.** v2 replaces v1; the earlier members-only privacy claim does not describe the current product. The July figure of approximately 2.3 KB per v1 ballot measured its record, not total traffic; later measurements were approximately 560 KB per vote in a 2,660-member v1 DAO. Neither is presented as a v2 benchmark.
