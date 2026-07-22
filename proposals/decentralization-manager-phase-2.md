# Decentralization Manager Development Fund Proposal - Phase 2

- **Author:** BitSafe
- **Builds on:** Decentralization Manager Development Fund Proposal ([Canton Foundation Development Fund PR #298](https://github.com/canton-foundation/canton-dev-fund/pull/298))
- **SIG:** Decentralized Attestor Pools / DAO / Multisig
- **Champion:** Akshay Sinha, Alpend ([@akshaysinha100](https://github.com/akshaysinha100))

## Abstract

This proposal seeks funding for the second phase of the Decentralization Manager roadmap, extending the production-validated, open-source tooling that Grant 1 contributed to the Canton ecosystem. Grant 1 funded the open-source release of the core Decentralization Manager - party setup, the Generalized Governance Core, and the Token Management and Custody Daml templates - with CBTC governance on Canton MainNet as a live proof point. This proposal funds three new capabilities layered on that foundation:

1. **A generalized reward engine** that routes CIP-104 traffic-based Canton Coin app rewards earned by a Decentralized Party to governance-configured beneficiaries, via two selectable modes - real-time assignment with rewards minted directly by beneficiaries (Mode A) and treasury accrual with deferred distribution (Mode B) - with on-chain configuration, configured-split verification, and a reward management dashboard per Decentralized Party.
2. **Decentrally hosted external party management**, which lets a wallet provider easily onboard an external party across several independent validators that run the Decentralization Manager software (the wallet provider itself only needs API access to a host), so external parties have resilience to node downtime and are threshold-hosted, with the end user retaining full authority over the party.
3. **Add/remove member from a Decentralized Party**, that lets a Decentralized Party add and remove members (governance voters) on a live party through governance workflows - with the corresponding node hosting changes executed through Canton topology workflows - and a clear on-chain audit trail.

As with Grant 1, the work is released under Apache 2.0. The code will live under BitSafe's GitHub organization, building on the existing open-source repository ([github.com/DLC-link/decentralization-manager](https://github.com/DLC-link/decentralization-manager)). The proposal is structured as five milestones: (1) Reward Engine, (2) Decentrally Hosted External Parties, (3) Add/Remove Member from a Decentralized Party, (4) ongoing maintenance, and (5) ecosystem adoption by teams other than BitSafe.

Because this single request funds three distinct capabilities, it is necessarily longer than a single-capability proposal such as Grant 1. The Reward Engine, decentrally hosted external parties, and add/remove member from a Decentralized Party are treated as independent workstreams throughout, so the committee can evaluate, fund, and accept each on its own merits.

## Motivation & Alignment with Canton priorities

**Make Canton's reward economics legible and automatable.** Grant 1 made it easy to create Decentralized Parties that govern reward-earning apps, but with CIP-104 a Decentralized Party that earns traffic-based app rewards has no governed way to route them: there is no mechanism to configure a split on-chain and automatically distribute rewards across node operators, the issuing application, and other stakeholders. This need applies to every Decentralized Party earning Featured App Rewards (FAR) on the network. The Reward Engine makes reward routing a configurable, governance-controlled, on-chain-auditable primitive.

**Let users decentralize without running a node.** Creating a Decentralized Party with the open-source Decentralization Manager today requires running Canton infrastructure, which excludes external parties (wallet users). This decentrally-hosted external parties feature closes that gap: a wallet provider hosts a user's external party across multiple nodes with an m-of-N threshold, so no single host can take over, impersonate, or migrate the user.

Multi-hosting also removes an operational single point of failure that single-node hosting cannot. Today, if the one node hosting a wallet user's party goes down, the user cannot transact at all until it recovers. With an external party hosted across several independent nodes, all nodes hold the party's ACS and can submit transactions for that party, thus it continues to operate as expected as long as the signing threshold is healthy - a direct liveness and failover improvement for the network's largest user population.

**Let decentralized parties evolve their membership.** A Decentralized Party's membership is effectively static today - adding or removing a participant means redeploying contracts or bespoke workarounds. For any long-lived party, member rotation is a matter of when, not if: in extreme scenarios - a compromised operator, an insolvency, a forced exit for compliance reasons - the party must be able to rotate a member out immediately, not redeploy from scratch. Add/remove member turns membership changes into governed, multi-party-approved, on-chain-auditable operations on a live party - a security and resilience primitive the rest of the suite (Vaults, custody, hosting) needs to reach production grade.

**Build on production-validated tooling.** All three capabilities extend a codebase already running CBTC on Canton MainNet with Finoa, Nethermind, and DSRV as validators.

## Specification

### 1. Implementation Mechanics

We will design, build, and open-source three new capability areas for the Decentralization Manager, all released under Apache 2.0 under BitSafe's GitHub organization, extending the existing open-source [decentralization-manager](https://github.com/DLC-link/decentralization-manager) repository; the Reward Engine (Milestone 1) additionally undergoes a security audit before release. All three are built entirely on existing Canton and Splice primitives with no protocol changes - the only pending dependency is CIP-104 going live on Canton core, which gates production-scale reward earning; the summaries below cover what each capability does, how it fits Canton, and the primitives it builds on (component naming is not final).

#### 1.1 Reward Engine

A Decentralized Party holding an active `FeaturedAppRight` earns CIP-104 traffic-based Canton Coin app rewards, which are distributed directly to a governance-configured beneficiary set: rewards are either minted directly by the beneficiaries (self-mint), or minted to the party itself and redistributed via token transfer. Governance sets the beneficiary set, per-beneficiary percentages, and a settlement mode through the Generalized Governance Core's propose/confirm/execute lifecycle delivered in Grant 1. Two settlement modes are supported:

- Mode A (assign and self-mint), real-time assignment as rewards are earned, with rewards minted directly by the beneficiaries;
- Mode B (treasury accrual and deferred distribution), rewards minted to the party's treasury with scheduled payout on a governance-fixed split.

The engine consumes rewards through Canton's standard app-reward mechanics, mints and transfers via Token Standard flows, and adds configured-split verification that shows what each beneficiary actually earned and flags beneficiaries that are not minting rewards, plus a reward management dashboard per Decentralized Party.

#### 1.2 Decentrally Hosted External Parties (v0)

A new tenant API on the Decentralization Manager lets a wallet provider onboard a sovereign external party across several independent host nodes, so end users get a threshold-hosted, multi-hosted party without running their own Canton node. The client application (often a wallet) generates the user's key client-side, prepares the multi-host onboarding topology via one host, has the user sign the multi-hash, and submits the same signed bundle to each host; each host validates against its operator's policy and relays to its participant's `AllocateExternalParty`.

The result is a party hosted with `Confirmation` permission on N nodes at an m-of-N threshold - sovereign to the user, consensual in both directions - with a unilateral, audited unhosting path for compliance. It uses Canton's existing external-party machinery (`GenerateExternalPartyTopology`, `AllocateExternalParty`, `PartyToParticipant`) and Splice's existing hosting-consent contracts (`ValidatorRight`, `TransferPreapproval`); the tenant API is an operator-side wrapper around credentials and policy, with no on-chain registry or new Daml governance model in this phase.

#### 1.3 Add/Remove Member from a Decentralized Party

A Decentralized Party adds or removes members on a live party - without recreating the party or redeploying its contracts. Members and nodes sit at two distinct layers of the system: members (governance voters) are added and removed through the Generalized Governance Core's propose/confirm/execute lifecycle, while the corresponding node hosting changes are executed through Canton topology workflows, with no new on-chain Daml. Every membership change requires an approval by a threshold of members, and is recorded in an on-chain governance audit trail. Add-member adds the joining node to the party's topology and includes ACS synchronization, so the joining node receives the party's active contract set; remove-member revokes the departing node's topology and shared-state authority. ACS cleanup - purging the party's contract state from the departing node - is out of scope for this milestone. ACS synchronization initially uses Canton's stable party replication workflow (which requires briefly placing the receiving node in maintenance mode); once Digital Asset's online party replication reaches stable release, the add-member flow will adopt it, removing node downtime entirely.

A member-management UI exposes the propose/vote flow for simplicity. The capability composes Canton's native `PartyToParticipant` topology and the existing governance primitives, introducing no new governance primitive or protocol change.

### 2. Dependencies

- **CIP-104 (Reward Engine).** Production-scale reward earning begins when CIP-104 goes live on Canton core. Milestone 1 acceptance is demonstrated on DevNet, so delivery and payment are not gated on the CIP-104 launch date.
- **Online party replication (Add/Remove Member).** Add-member ACS synchronization currently uses Canton's stable party replication workflow, which requires temporarily disconnecting the receiving node (maintenance mode) during onboarding. Digital Asset's online party replication- alpha today, expected GA later this year- removes this requirement. Milestone 3 will adopt the upgraded workflow once it reaches stable release; this is an improvement path, not a delivery blocker, as the milestone is deliverable with today's stable primitives.

### 3. Backward Compatibility

These capabilities build on the foundation delivered in Grant 1 and introduce new features to the Decentralization Manager application. They are application-layer additions: they do not modify Canton protocol behavior, ledger APIs, or existing smart contracts, and they wire together existing Canton and Splice features without changing their semantics. Existing applications, validator nodes, and synchronizers are unaffected, and nodes that do not run these features continue to operate normally - no backward-compatibility impact on the Canton Network.

## Milestones and Deliverables

This proposal is structured as five milestones: (1) the Reward Engine, (2) Decentrally Hosted External Parties, (3) Add/Remove Member from a Decentralized Party, (4) ongoing maintenance of the open-source codebase, and (5) ecosystem adoption by teams other than BitSafe. BitSafe operates a production reference instance on Canton MainNet throughout; Milestones 1-3 acceptance criteria are demonstrated on DevNet, and ecosystem adoption (Milestone 5) is proven on Canton MainNet.

### Milestone 1: Reward Engine (CIP-104)

| Field | Details |
| :---- | :---- |
| **Estimated Delivery** | 2 months after grant approval |
| **Focus** | A generalized engine for routing CIP-104 traffic-based rewards earned by a Decentralized Party to governance-configured beneficiaries, via Mode A (real-time assignment, rewards minted directly by beneficiaries) and Mode B (treasury accrual and deferred distribution, rewards minted to the party's treasury) |
| **Team** | BitSafe |

**Deliverables:**

- Governance-configured reward splits: beneficiary set, per-beneficiary percentages, and settlement mode (A/B), set and rotated via the Generalized Governance Core, with a configuration UI gated on an active `FeaturedAppRight`
- Mode B (treasury accrual): scheduled fixed-split distribution and batched treasury minting; beneficiaries are responsible for setting up their own `TransferPreapproval`s as needed
- Mode A (real-time assignment): reward-assignment automation and self-mint verification
- Configured-split verification: actual per-beneficiary earnings against the configured split, flagging beneficiaries that are not minting rewards, with per-node verification and export
- Reward management dashboard, per Decentralized Party: check and change the reward configuration (beneficiary set, percentages, settlement mode), track earned rewards, and review distribution history
- Security audit
- Open-source release under Apache 2.0 under BitSafe's GitHub organization, including developer documentation

**Acceptance Criteria.** Demonstrated on DevNet:

- **Configure rewards via governance.** A Decentralized Party with an active `FeaturedAppRight` can configure a beneficiary set on-chain, percentages, and settlement mode through the propose/confirm/execute engine; the UI correctly gates on the right being active.
- **Mode A complete.** The reward-assignment delegation contract and automation are complete, with rewards minted directly by the beneficiaries.
- **Mode B complete.** The full Mode B cycle runs end-to-end: rewards are earned, minted to the Decentralized Party, accrue to the party's treasury, and are paid out on a scheduled, governance-fixed split, including batched treasury minting; `TransferPreapproval` recipient onboarding is out of scope - beneficiaries set up their own preapprovals as needed.
- **Configured-split verification.** Actual per-beneficiary earnings are visible against the configured split, beneficiaries that are not minting rewards are flagged, with per-node verification and export.
- **Open-source release.** All funded deliverables are audited and open-sourced under Apache 2.0 under BitSafe's GitHub organization.

### Milestone 2: Decentrally Hosted External Parties (v0)

| Field | Details |
| :---- | :---- |
| **Estimated Delivery** | 2 months after delivery of Milestone 1 |
| **Focus** | A tenant API on the Decentralization Manager that lets an allowlisted wallet provider onboard a sovereign external party across multiple independent host nodes, with a unilateral, audited unhosting path for compliance |
| **Team** | BitSafe |

**Deliverables:**

- Decentralization Manager tenant API: onboarding endpoints (prepare, onboard, status, unhost), hosting-policy configuration (allowlist, rate limits, threshold rules), and an audit log
- Wallet-side reference flow: client-side key generation, prepare/sign, fan-out submission to each host, and a Token Standard transfer flow aligned with the splice-wallet-kernel SDK
- Multi-host onboarding across independent validators, including `TransferPreapproval` handling (the wallet provider acts as the default preapproval provider, with optional support for multiple candidate providers) and fee-renewal automation
- Unhosting / compliance path: unilateral exit end-to-end (topology plus Splice contracts) with an operator-facing action and audit trail
- Pilot across 3-4 friendly nodes (DevNet) with one wallet-provider integration and an operator runbook
- Open-source release under Apache 2.0 under BitSafe's GitHub organization, including developer documentation

**Acceptance Criteria.** Demonstrated across a pilot host set on DevNet:

- **Multi-host onboarding.** A wallet provider onboards a sovereign external party across 3-4 independent host nodes from a single signed bundle, yielding an m-of-N (threshold less than or equal to N) `Confirmation`-permission party.
- **Sovereignty and consent.** No single host can take over, impersonate, or forcibly migrate the party; the party operates via interactive submission (prepare / sign / execute) using Token Standard transfers.
- **Partial-failure safety.** Onboarding to a subset of hosts leaves the party in a "pending" (partially signed) state, never half-created; a down host can be retried until its signature lands.
- **Compliance exit.** A host can unilaterally unhost the party end-to-end (topology plus `ValidatorRight` and `TransferPreapproval` cleanup) with an audit record, on a 2-of-3 configuration.
- **Open-source release.** All funded deliverables are open-sourced under Apache 2.0 under BitSafe's GitHub organization.

### Milestone 3: Add/Remove Member from a Decentralized Party

| Field | Details |
| :---- | :---- |
| **Estimated Delivery** | 1 month after delivery of Milestone 2 |
| **Focus** | A governance-driven add/remove-member lifecycle - adding and removing members on a live Decentralized Party through governance workflows (with node hosting changes executed through topology workflows), with multi-party approval and an on-chain audit trail |
| **Team** | BitSafe |

**Deliverables:**

- Add-member governance workflow: propose/confirm/execute add-member action on the Generalized Governance Core (GovCore Daml), with the joining node added via Canton topology workflows, including ACS synchronization so the joining node receives the party's active contract set
- Remove-member governance workflow: governed removal via the Generalized Governance Core, revoking the departing node's topology and shared-state authority through topology workflows. ACS cleanup - purging the party's contract state from the departing node - is out of scope for this milestone
- Multi-party approval plus an on-chain governance audit trail covering every membership change, threshold change, and vote
- Member-management admin UI: membership proposals and approval controls for non-technical admins
- Open-source release under Apache 2.0 under BitSafe's GitHub organization, including developer documentation

**Acceptance Criteria.** Demonstrated on DevNet:

- **Govern membership.** A member can be added to and removed from the reference Decentralized Party through propose/confirm/execute governance workflows (GovCore Daml), with the corresponding node hosting change executed through topology workflows and no single party able to alter membership unilaterally.
- **Audit trail.** Every membership and threshold change is recorded in an on-chain, queryable governance audit trail.
- **Open-source release.** All funded deliverables are open-sourced under Apache 2.0 under BitSafe's GitHub organization.

### Milestone 4: Ongoing Maintenance

| Field | Details |
| :---- | :---- |
| **Estimated Delivery** | Begins after delivery of Milestone 3; covers 12 months of support |
| **Focus** | Keeping the Reward Engine, external-party hosting, and add/remove member from a Decentralized Party code healthy: bug fixes, security patches, dependency bumps, CIP-104 compatibility tracking, CI/CD, and external PR triage |
| **Team** | BitSafe |

Maintenance covers:

- Security patch SLA: critical patches within 7 days of disclosure, high-severity within 30 days
- Dependency bumps: Canton, Splice, the DAML SDK, and the Rust toolchain
- CIP-104 compatibility tracking as the spec and on-ledger mechanics evolve, and tracking of the upstream reward-assignment interface through release
- External PR triage: target first response within 5 business days
- CI/CD upkeep and release tagging
- No new features, no roadmap work, no API surface changes

**Acceptance Criteria.** The open-source repositories remain healthy (green CI, no outstanding critical vulnerabilities, external PRs triaged within a reasonable SLA, CIP-104 compatibility maintained) across the 12-month maintenance window.

### Milestone 5: Ecosystem Adoption

| Field | Details |
| :---- | :---- |
| **Estimated Delivery** | Within 6 months of delivery of Milestone 3 |
| **Focus** | Proven ecosystem adoption of the Reward Engine, decentrally hosted external parties, and add/remove member from a Decentralized Party by teams other than BitSafe |
| **Team** | BitSafe (integration support, developer relations) |

**Deliverables:**

- Integration support and office hours for external adopter teams
- Developer documentation, and reference guides for all three capabilities
- At least four production adoptions on Canton MainNet, **not** operated by BitSafe, combined across the three capabilities in any mix:
  - FAR-earning Decentralized Parties routing rewards through the open-source Reward Engine, with reward configuration and distribution visible on-chain, and/or
  - Independent host nodes (and at least one wallet provider) running decentrally hosted external parties in production
  - Decentralized Parties using the open-source add/remove-member tooling to add or remove members in production, with membership changes visible on-chain
- Written attestations confirming feature usage, or verifiable on-chain/repository evidence.

**Acceptance Criteria.** By the end of Milestone 5, at least four production adoptions, combined across the three capabilities in any mix, meet all of the following:

- Operated by an entity other than BitSafe.
- Documented on Canton MainNet: for the Reward Engine, real reward configuration and distribution cycles initiated by the third party and queryable on-chain; for external-party hosting, a live multi-hosted external party onboarded and operated through independent hosts; for add/remove member, a membership change executed on a live third-party Decentralized Party through the governance workflow, visible in the on-chain audit trail.

## Funding

**Total Funding Request:** 10,600,000 CC

### Milestone Allocation

| Milestone | CC Amount | Payment Trigger |
| :---- | :---- | :---- |
| M1 - Reward Engine (CIP-104) | 2,700,000 CC | Committee acceptance based on the Milestone 1 acceptance criteria demonstrated on the DevNet reference instance (Mode A and Mode B complete) + open-source release under BitSafe's GitHub organization |
| M2 - Decentrally Hosted External Parties (v0) | 1,300,000 CC | Committee acceptance based on the Milestone 2 acceptance criteria demonstrated on DevNet (multi-host onboarding and unilateral unhosting across a 3-4 node pilot with one wallet-provider integration) + open-source release under BitSafe's GitHub organization |
| M3 - Add/Remove Member from a Decentralized Party | 1,000,000 CC | Committee acceptance based on the Milestone 3 acceptance criteria demonstrated on DevNet (add/remove-member governance and on-chain audit trail on the reference party) + open-source release under BitSafe's GitHub organization |
| M4 - Ongoing Maintenance (12 months) | 2,000,000 CC | Paid against quarterly maintenance reports |
| M5 - Ecosystem Adoption | 3,600,000 CC | >=4 non-BitSafe production adoptions in total, combined across the three capabilities in any mix, with live activity visible on-chain. Paid against each adoption (900,000 CC each) |
| **Total** | **10,600,000 CC** | |

The Milestone 1 amount includes all security audit costs within the agreed audit scope. Adoption (M5) is approximately 34% of the total (3,000,000 of 10,600,000 CC).

### Timeline Incentives

**SLA Penalty.** A 10% reduction in the respective milestone payment will be applied for every full month of delay beyond its estimated delivery date. If any milestone is more than 3 full months delayed for reasons within BitSafe's control, the terms of the agreement will be revisited between BitSafe and the Tech & Ops Committee. Milestone 1 delays attributable solely to the CIP-104 Canton-core launch date (outside BitSafe's control) are excluded from this penalty.

**Acceleration Bonus.** Delivery of Milestone 5 more than 1 month ahead of its projected schedule with all acceptance criteria met triggers a +10% bonus on the Milestone 5 payout.

### Volatility Stipulation

The grant is denominated in Canton Coin (CC). As the project duration exceeds 6 months, the grant will be re-evaluated at the 6-month mark, and additionally if CC price volatility materially changes the real value of remaining milestones between acceptance and payout. Any adjustments will be negotiated between BitSafe and the Tech & Ops Committee.

## Co-Marketing

Upon completion of these milestones, BitSafe will collaborate with the Canton Foundation on:

- Technical blog posts and developer documentation explaining the three capabilities and their benefits for application developers, node operators, and wallet providers, published to the open-source repositories
- Milestone highlights in the quarterly Canton Development Fund reports, plus AMA calls and technical workshops for the Canton developer community
- Co-authored case studies with early adopters routing rewards, hosting external parties, or adding and removing members

## Licensing

All code introduced as a result of work on this proposal will be released under the Apache 2.0 license under BitSafe's GitHub organization, building on the existing open-source repository ([github.com/DLC-link/decentralization-manager](https://github.com/DLC-link/decentralization-manager)) and positioning all three capabilities as shared network infrastructure alongside existing Splice components. BitSafe continues as a code contributor to the Canton ecosystem.

## Rationale

### Alignment with Canton priorities

This proposal advances priorities Canton has consistently emphasized: decentralization as the default rather than a bespoke effort, shared open-source infrastructure available to the whole ecosystem alongside Splice, and broader economic participation for validators and node operators. The Reward Engine integrates cleanly with CIP-104 rather than introducing a parallel rewards primitive, and decentrally hosted external parties extend sovereign, threshold-hosted parties to wallet users without protocol changes.

### Extending Production-Validated Tooling

All three capabilities build on the Decentralization Manager codebase that has run CBTC on Canton MainNet since late 2025, with Finoa, Nethermind, and DSRV as validator nodes. Rather than each team re-implementing reward routing, multi-host onboarding, or runtime membership management, this proposal funds BitSafe to harden and contribute that work as a common good, with a live reference instance providing ongoing public proof that it works end-to-end.

### Open-Source as Neutral Network Infrastructure

Open-sourcing the Reward Engine deliberately avoids inserting BitSafe between applications and CIP-104 rewards as a take-rate; a standard tenant API keeps external-party hosting a competitive, multi-operator market. Both choices strengthen alignment with Digital Asset and the Canton Foundation and keep the Decentralization Manager neutral, shared infrastructure under Apache 2.0.

### Proven Ecosystem Pickup as a Dedicated Milestone

A dedicated adoption milestone requires at least four non-BitSafe production adoptions, combined across the three capabilities in any mix, with payout contingent on live on-chain activity. This ensures the grant delivers demonstrable ecosystem value, not just shipped code.

### Incremental Delivery with a Clear Long-Term Plan

This proposal delivers three production-quality capability areas with clear acceptance criteria, sequenced around their Canton-core dependencies (CIP-104, the upstream reward-assignment interface, and online party replication, whose GA release Milestone 3 will adopt to eliminate node downtime during member addition). Follow-up proposals for open host discovery and dynamic host sets will be submitted separately as those designs firm up and their dependencies land. The Tech & Ops Committee retains full discretion over whether to fund each subsequent phase.
