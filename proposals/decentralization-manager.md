# Development Fund Proposal: Decentralization Manager

## Champions and SIG

- **SIG:** Decentralized Attestor Pools / DAO / Multisig
- **Champion:** Gabija Tuinaite, BitSafe ([@gabitu7](https://github.com/gabitu7))
- **Co-Champions:**
  - Tobias von Vignau, Director of Product, Digital Asset
  - Akshay Sinha, Alpend ([@akshaysinha100](https://github.com/akshaysinha100))

## Abstract

This proposal seeks funding for the initial phase of a multi-phase roadmap to contribute the Decentralization Manager — a generalized framework for creating and managing decentralized parties on the Canton Network — to the Canton ecosystem as a public good. The Decentralization Manager enables asset issuers, application developers, and institutions to configure threshold-governed multi-party topologies and deploy governed applications without managing the underlying complexity of multi-node coordination, threshold cryptography, or on-chain governance.

BitSafe has invested approximately six months of engineering effort building and operating a production implementation that currently governs CBTC on Canton MainNet. The system supports automated topology orchestration, m-of-n threshold governance, a plugin-based proposal framework, and a management UI. It has been validated with multiple validator node operators (Finoa, Nethermind, DSRV) on Canton MainNet.

This proposal funds the open-source release of the core Decentralization Manager tooling: party setup, the Generalized Governance Core, and the Token Management and Custody Daml templates. In parallel, and at BitSafe's own cost, BitSafe will migrate CBTC governance to the new system on Canton MainNet as a live proof point that the tooling works end-to-end in production. The CBTC migration itself is explicitly out of the grant's funding scope. Subsequent proposals will cover reward management, dynamic membership and weighted voting, and external-party interactions with Decentralization Manager networks (intent-based governance and the DMN API Standard), as those designs firm up and as the relevant Canton-core dependencies land (CIP-104, ACS migration).

BitSafe will operate a production reference instance on Canton MainNet throughout, and the milestone's acceptance criteria will be demonstrated on that instance.

## Long-Term Plan and Follow-Up Proposals

The Decentralization Manager roadmap spans multiple phases. This proposal funds Phase 1 only. BitSafe intends to submit subsequent proposals for later phases as their designs stabilize and their Canton-core dependencies land. Approval of this proposal is not a commitment by the Tech & Ops Committee to fund later phases; it is shared context so the committee can evaluate Phase 1 against the broader trajectory.

**Phase 1 (this proposal): Open-source release of core Decentralization Manager tooling.** Audit and open-source party setup, the Generalized Governance Core, and the Token Management and Custody Daml templates. BitSafe will separately migrate CBTC governance to the new system on Canton MainNet, at its own cost, as a live proof point — not as a grant-funded deliverable. No Canton-core dependencies are blocking.

**Phase 2 (future proposal): External-Party Interaction with Decentralization Manager Networks.** Intent-based governance flow allowing external owner parties to initiate actions that the Decentralization Manager network approves and executes, the Decentralization Manager Network (DMN) API Standard, a Rust reference implementation, and a CIP-0103 wallet gateway enabling external signing providers. These unlock distributed party hosting, so users without their own Canton node can create and manage decentralized parties through third-party marketplaces.

**Phase 3 (future proposal): Reward Management.** CIP-104-compliant reward capture of FAR and distribution among decentralized party members and other stakeholders, a reward management dashboard, and enhanced health monitoring. Dependent on CIP-104 landing on Canton core.

**Phase 4 (future proposal): Dynamic Membership and Weighted Voting.** Add-member governance workflow with ACS synchronization, weighted voting, voting party delegation, and validator metadata. Dependent on ACS migration landing on Canton core.

## Motivation

**Reduce Centralization Risk.** Assets and applications on the Canton Network typically launch on nodes run by a single entity, or even a single validator node. This creates operational fragility: if the node goes offline, the application halts. It also creates concentration risk, as one entity controls all contract state. For applications handling tokenized assets, vaults, or liquidity pools, this single point of failure is unacceptable. Decentralized parties distribute trust and validation across multiple independent nodes, but the process of creating one today is manual, error-prone, and requires deep Canton protocol expertise.

**Remove the Complexity Barrier.** Creating a decentralized party currently requires: (a) coordinating DNS and PartyToParticipant topology mapping across multiple nodes, (b) implementing Daml governance contracts for threshold signing, (c) building UIs for proposal and confirmation workflows, and (d) managing the operational lifecycle of members joining and leaving. No standardized tooling exists. Each team that wants to decentralize must build from scratch.

**Enable Ecosystem Growth.** There is a growing pipeline of qualified leads and partners that need decentralization tooling — asset issuers, DeFi protocols, wallet providers, and institutional custodians. Without accessible tooling, these teams either remain centralized or invest months of engineering effort duplicating work that should be shared infrastructure.

**Create a Common Good.** BitSafe has built this tooling for its own products (CBTC, Vaults) and is now turning it into open-source infrastructure that any builder on the Canton Network can use, eliminating duplicated effort and making robust decentralization accessible to the entire ecosystem.

## Specification

### 1. Objective

We propose to open-source, audit, and deploy the core Decentralization Manager as a generalized application for creating and managing decentralized parties on the Canton Network. The technical scope of this proposal covers four areas:

**Decentralized Party Setup.** Automated topology orchestration handling DNS and PartyToParticipant mapping, multi-party signing, and threshold configuration through a coordinator-attestor model with an 8-step onboarding workflow and a setup wizard UI. Already implemented by BitSafe; to be audited and open-sourced.

**Generalized Governance Core.** A plugin-based governance framework providing a generic propose/confirm/execute engine with configurable m-of-n thresholds, a governance audit trail, and a remove-node-from-set workflow (Dynamic Membership Management, phase 1). Third-party applications register custom DAML contracts as plugins and execute governance actions through the same threshold mechanism. Already implemented by BitSafe; to be audited and open-sourced.

**Daml templates.** Token Management and Custody Daml templates released as open-source reference implementations built on the Generalized Governance Core.

**CBTC Governance as a Live Proof Point (not grant-funded).** In parallel with this proposal, and at BitSafe's own cost, BitSafe is migrating CBTC governance on Canton MainNet from the current custom coordinator-attestor flow to on-chain proposal contracts powered by the new plugin system. This validates the plugin architecture end-to-end in production and establishes a live reference. The migration itself is explicitly out of the grant's funding scope.

### 2. Dependencies

No Canton-core dependencies block this proposal. All deliverables can be audited, open-sourced, and deployed on Canton MainNet using currently available Canton capabilities.

Canton-core dependencies (CIP-104 for reward distribution, ACS migration for dynamic add-member) will be addressed in their respective follow-up proposals and are not on the critical path for Phase 1.

### 3. Implementation Mechanics

The sections below describe the system as currently architected by BitSafe. Component and module names are used for clarity and do not represent final naming — the open-source release may adopt different conventions (example: "Plugins" may be renamed to "Modules").

#### 3.1 Topology Orchestration and Party Setup

The Decentralization Manager implements a coordinator-attestor model for decentralized party creation. A coordinator node initiates party setup and invites attestor nodes to join. The system automates an 8-step workflow:

1. **WaitingForAttestors** — Coordinator publishes invitation; attestors accept or decline via UI
2. **GenerateKeys** — Each node generates its signing key share for the shared party identity
3. **CreateProposals** — Coordinator computes DNS and PartyToParticipant topology proposals
4. **SignDns** — All parties sign the DNS mapping transaction
5. **SubmitDns** — DNS mapping submitted to the Canton topology store
6. **SignP2P** — All parties sign the PartyToParticipant mapping
7. **SubmitFinal** — Final topology transaction submitted; party identity active
8. **Complete** — All nodes confirm synchronization; party operational

The setup allows configuration of m-of-n thresholds (default: n/2), party ID prefixes, peer selection, and real-time progress monitoring. Threshold configuration is enforced at both the topology level and the governance level via `GovernanceSetThreshold` actions.

#### 3.2 Plugin-Based Governance Framework

The governance engine ("Governance Core") decouples the governance mechanism from application-specific logic.

**Governance Core** provides:

- Standardized propose/confirm/execute lifecycle for any DAML-based action
- Configurable m-of-n threshold enforcement with no administrative override
- Plugin Manager for uploading DARs, deploying governance contracts, and registering plugins
- REST API (25+ endpoints) for governance operations
- Privacy-preserving governance audit trail recording all votes, threshold changes, member-removal events, and action execution history
- Dynamic Membership Management, phase 1: remove-node-from-set workflow (add-member is deferred to the Phase 4 follow-up proposal, dependent on ACS migration)

**Plugins** are DAML packages defining domain-specific governance actions. Each plugin registers action types with Governance Core and inherits the propose/confirm/execute workflow. The following Daml templates are in scope for this proposal as open-source reference implementations:

- **Token Management Daml template** — governed token issuance, minting, and burning operations, wrapping the utility and registry functions needed by CBTC and extensible for third-party tokens
- **Custody Daml template** — on-chain, quorum-based voting for token transfers (send/receive as a decentralized party)

Third-party developers build and deploy additional plugins by implementing the Governance Core interface and uploading DAML packages through the Plugin Manager.

#### 3.3 CBTC Governance as a Live Proof Point (not grant-funded)

CBTC is currently governed through a custom coordinator-attestor flow operated by BitSafe, Finoa, Nethermind, and DSRV on Canton MainNet. In parallel with this proposal, and at BitSafe's own cost, BitSafe is migrating CBTC governance to the new on-chain proposal contract model powered by the Token Management and Custody Daml templates. The existing attestor network continues to run automation but invokes governance via intent calls into the new contracts.

This migration is not a grant-funded deliverable. It is included here because it serves two purposes for the ecosystem: it validates the plugin architecture end-to-end in production, and it establishes CBTC as the live reference instance.

### 4. Architectural Alignment

The Decentralization Manager is built directly on Canton's topology and ledger primitives:

- **Topology orchestration** uses Canton's native PartyToParticipant mappings and DNS topology transactions for multi-node party identity.
- **Governance contracts** are written in DAML and executed on the Canton ledger, inheriting Canton's privacy model and sub-transaction authority.
- **Plugin architecture** extends the standard DAML package deployment mechanism — plugins are DARs uploaded and registered through Canton's existing package management.
- **Parallel to Super Validator governance:** The propose/confirm/execute mechanism used here mirrors the governance pattern the Super Validators use for Canton network governance. The Decentralization Manager turns that same mechanism into reusable infrastructure for any decentralized entity on the network.

| Super Validator governance | Decentralization Manager governance |
| :---- | :---- |
| Propose, confirm, execute | Propose, confirm, execute |
| Hardcoded to Canton network operations | Plugin-based, generalized to any DAML governance action |
| Configurable m-of-n among SVs | Configurable m-of-n among party members |

- **Splice integration:** The open-source release targets the Canton Foundation GitHub organization, positioning the Decentralization Manager as shared network infrastructure alongside existing Splice components.

No custom consensus mechanisms or protocol modifications are introduced. The system operates entirely within Canton's existing participant and synchronizer architecture.

### 5. Backward Compatibility

The Decentralization Manager is a new application layer — it does not modify Canton protocol behavior, ledger APIs, or existing smart contracts. It wires together existing Canton features (PartyToParticipant topology, DAML package management) without changing their semantics. Existing applications, validator nodes, and synchronizers are unaffected, and nodes that do not run the Decentralization Manager continue to operate normally.

No backward compatibility impact on the Canton Network.

## Milestones and Deliverables

This proposal is structured as three milestones: (1) the open-source release of the core Decentralization Manager tooling (combining the internal M1.1-M1.3 work streams into one deliverable), (2) ongoing maintenance of the open-source codebase, and (3) ecosystem adoption by teams other than BitSafe. BitSafe operates a production reference instance on Canton MainNet throughout; each milestone's acceptance criteria are demonstrated on that instance.

### Milestone 1: Open-Source Release of Core Decentralization Manager Tooling

| | |
| :---- | :---- |
| **Estimated Delivery** | End of June 2026 (internal target: end of May 2026) |
| **Focus** | Audit and open-source the core Decentralization Manager tooling — party setup, the Generalized Governance Core, and the Token Management and Custody Daml templates — alongside BitSafe's self-funded CBTC reference instance on Canton MainNet as a live proof point |
| **Team** | BitSafe |

**Deliverables:**

- Topology orchestration with 8-step onboarding workflow
- Setup wizard UI with party ID prefix input, peer selection, and progress tracking
- Configurable m-of-n threshold (default n/2) with `GovernanceSetThreshold` action
- On-chain indirection for governance actions, with customizable permission set
- Network Status panel with connectivity monitoring and invitation management UI
- Generalized Governance Core: propose/confirm/execute engine, generalized DAML governance models, REST API (25+ endpoints), governance dashboard, OIDC provider authentication integration
- Plugin Manager UI for DAR upload, contract deployment, and plugin registration
- Governance audit trail recording votes, threshold modifications, member-removal events, and action execution history
- Dynamic Membership Management, phase 1: remove node from the set
- Token Management Daml template
- Custody Daml template
- Security audit of the Generalized Governance Core and both Daml templates (Token Management, Custody), conducted by Quantstamp, engaged and scheduled for May
- Open-source release under Apache 2.0 on the Canton Foundation GitHub organization, including developer documentation and a plugin guide
- BitSafe-operated CBTC reference instance running on Canton MainNet. Delivered by BitSafe at its own cost as a live proof point; not funded by this grant

**Acceptance Criteria.** By the end of Milestone 1, all of the following are demonstrated on Canton MainNet:

- **Create a decentralized party.** A third party can create a decentralized party end-to-end through the Decentralization Manager, using: topology orchestration; the setup wizard UI with party ID prefix input, peer selection, and progress tracking; configurable m-of-n threshold (default n/2) enforced via `GovernanceSetThreshold`; DAML-enforced configurable permissions; the Network Status panel with connectivity monitoring; and the invitation management UI.
- **Execute governance actions.** Run governance end-to-end on the Generalized Governance Core: the propose/confirm/execute engine, generalized DAML governance models, REST API (25+ endpoints), governance dashboard, and OIDC authentication integration are all functional.
- **Upload packages, including ready-made templates.** The Plugin Manager UI supports DAR upload, contract deployment, and plugin registration. The Token Management and Custody Daml templates are available as open-source reference implementations, and a third-party developer can upload a custom DAML package as a plugin and execute governance actions through the Governance Core.
- **Governance audit trail.** The governance audit trail is enforced and queryable on-chain.
- **Open-source release.** All funded deliverables are audited and open-sourced under Apache 2.0 on the Canton Foundation GitHub organization.
- **Live proof point.** BitSafe's self-funded CBTC reference instance is running on the new system on Canton MainNet.

### Milestone 2: Ongoing Maintenance

| | |
| :---- | :---- |
| **Estimated Delivery** | Begins after Milestone 1 completion; covers 12 months of support |
| **Focus** | Keeping the open-source Decentralization Manager codebase healthy: bug fixes, security patches, dependency bumps, CI/CD, and external PR triage |
| **Team** | BitSafe |

Maintenance is staffed at 0.25 FTE for 12 months, totaling 480 engineering hours. This covers:

- Security patch SLA: critical patches within 7 days of disclosure, high-severity within 30 days
- Dependency bumps: monthly cadence on Canton, DAML SDK, and Rust toolchain
- External PR triage: target first response within 5 business days
- CI/CD upkeep and release tagging
- No new features, no roadmap work, no API surface changes

**Acceptance Criteria.** The open-source repository remains in a healthy state (green CI, no outstanding critical vulnerabilities, external PRs triaged within a reasonable SLA) across the 12-month maintenance window.

### Milestone 3: Ecosystem Adoption

| | |
| :---- | :---- |
| **Estimated Delivery** | Up to 3 months after Milestone 1 completion |
| **Focus** | Proven ecosystem adoption of the Decentralization Manager by teams other than BitSafe |
| **Team** | BitSafe (integration support, developer relations) |

**Deliverables:**

- Integration support and office hours for external adopter teams
- Developer documentation, sample plugins, and reference integration guides
- At least two applications in production on Canton MainNet using the Decentralization Manager that are **not** operated by BitSafe
- Case studies co-authored with the adopter teams

**Value Proposition.** Demonstrates that the tooling is genuinely a common good — other teams on Canton are building on it, not just BitSafe. This is the clearest possible evidence that the grant has delivered ecosystem value.

**Acceptance Criteria.** By the end of Milestone 3, at least two production applications meet all of the following:

- Operated by an entity other than BitSafe.
- Not a pre-existing BitSafe integration partner whose decentralized party setup was scoped before this grant. New partners only, or pre-existing partners whose use of the Decentralization Manager is materially independent of BitSafe's CBTC integration work.
- Independent governance decisions observable on Canton MainNet, queryable via the on-chain governance audit trail (i.e., real propose/confirm/execute cycles initiated and signed by the third-party operator's own party members; BitSafe may be a member of that party).

## Funding

**Total Funding Request:**

The funding amount for this proposal will be finalized pending:

- Decision on whether the Rust backend audit (approximately $70k) is in scope for this proposal or deferred to a later phase (currently not included in the funding request).

### Milestone Allocation

| Milestone | CC Amount | Payment Trigger |
| :---- | :---- | :---- |
| M1 — Open-Source Release of Core Decentralization Manager Tooling | 5,000,000 CC | Committee acceptance + open-source release on Canton Foundation GitHub + BitSafe-operated CBTC reference instance live on MainNet as proof point |
| M2 — Ongoing Maintenance (12 months) | 1,000,000 CC | Paid against quarterly maintenance reports |
| M3 — Ecosystem Adoption | 2,500,000 CC | >=2 non-BitSafe applications in production on Canton MainNet using the Decentralization Manager, with live governance activity visible on-chain |
| **Total** | **8,500,000 CC** |  |

The milestone amount includes all security audit costs within the agreed audit scope.

### Timeline Incentives

**SLA Penalty.** A 10% reduction in the respective milestone payment will be applied for every full month of delay beyond its estimated delivery date. If any milestone is more than 3 full months delayed for reasons within BitSafe's control, the terms of the agreement will be revisited between BitSafe and the Tech & Ops Committee.

**Acceleration Bonus.** Delivery of Milestone 3 more than 1 month ahead of its projected schedule with all acceptance criteria met triggers a +10% bonus on the Milestone 3 payout.

### Volatility Stipulation

The grant is denominated in Canton Coin (CC). If CC price volatility materially changes the real value of the grant between acceptance and payout, the grant amount will be re-evaluated. Any adjustments will be negotiated between BitSafe and the Tech & Ops Committee.

## Co-Marketing

Upon completion of this milestone, BitSafe will collaborate with the Canton Foundation on:

- Technical blog posts explaining the Decentralization Manager's architecture and its benefits for application developers
- Highlighting milestone completion in the quarterly Canton Development Fund reports
- Developer documentation and integration guides published to the open-source repository
- AMA calls and technical workshops for the Canton developer community
- Active participation in the #cf-tech-ops Slack channel and Canton developer forums
- Co-authored case studies with early adopters running decentralized parties
- DecParty white paper distribution through Canton Foundation channels

## Licensing

All code introduced as a result of work on this proposal will be released under the Apache 2.0 license on the Canton Foundation GitHub organization, positioning the Decentralization Manager as shared network infrastructure alongside existing Splice components. BitSafe will become a code contributor to the Canton ecosystem.

## Rationale

**Alignment with Canton priorities.** This proposal advances three priorities Canton has consistently emphasized: decentralization of the network as the default rather than a bespoke effort, shared open-source infrastructure released under the Canton Foundation alongside Splice, and broader validator economic participation through more multi-node parties. The plugin architecture is also designed to integrate cleanly with upcoming standards (CIP-104) without introducing parallel governance primitives, lowering the barrier for institutional issuers and tokenized RWA builders that cite multi-party governance as a prerequisite for launching on Canton.

### Turning Production-Validated Tooling into a Common Good

The Decentralization Manager has been built, deployed, and operated in production on Canton MainNet since late 2025. CBTC runs on a decentralized party managed by this tooling, with Finoa, Nethermind, DSRV, and BitSafe as validator nodes. Rather than each team on Canton re-implementing this infrastructure, this proposal funds BitSafe to harden, audit, and contribute the tooling as a common good for the whole network. BitSafe's CBTC reference instance — migrated to the new system at BitSafe's own cost, not through this grant — provides ongoing public proof that the tooling works end-to-end.

### Plugin Architecture for Ecosystem Extensibility

Governance Core provides the generic propose/confirm/execute mechanism; plugins define domain-specific actions. Any Canton application developer can build a plugin for their DAML contracts and inherit the full governance stack without reimplementing threshold signing, quorum enforcement, or confirmation workflows. This pattern mirrors how the Super Validators govern the Canton network, and this proposal makes the same pattern usable by any decentralized entity.

### Proven Ecosystem Pickup as a Dedicated Milestone

A dedicated adoption milestone requires at least two non-BitSafe applications running in production on Canton MainNet using the Decentralization Manager, with payout contingent on live on-chain governance activity. Two external adopters have already confirmed interest; BitSafe is actively lining up additional adopters. This ensures the grant delivers demonstrable ecosystem value, not just shipped code.

### Open-Source as Network Infrastructure

The Decentralization Manager is released on the Canton Foundation GitHub organization, positioning it as shared network infrastructure alongside existing Splice components. Code remains open-source and community-maintained under Apache 2.0, aligning with the Canton Foundation's principles of shared, open ecosystem infrastructure.

### Incremental Delivery with a Clear Long-Term Plan

This proposal delivers a single, fully audited, production-quality tranche of code with clear acceptance criteria. Follow-up proposals for reward management, dynamic membership, and external-party interaction with Decentralization Manager networks will be submitted separately as those designs firm up and as Canton-core dependencies (CIP-104, ACS migration) land. The Tech & Ops Committee retains full discretion over whether to fund each subsequent phase.
