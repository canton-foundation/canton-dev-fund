## Party Mobility Phase 1: Online Party Replication

| Field | Value |
| --- | --- |
| **Organization** | Digital Asset |
| **Author / Primary Contact** | Wayne Collier, Digital Asset (`waynecollier-da`) |
| **Status** | Draft |
| **Created** | 2026-09-10 |
| **Proposal Type** | RFP-aligned |
| **RFP / Roadmap Area** | RFP 1, Enable frictionless party hosting (Protocol, Infrastructure, Scalability & Resilience) |
| **Aligned SIG** | Party Portability & Data Resilience |
| **Champion** | Shaul Kfir |
| **Total Funding Request** | 18,000,000 CC base. Maximum payable 20,700,000 CC including the adoption scale bonus |
| **Project Duration** | 16 months |
| **Label** | `party-portability-data-resilience` |

---

## Abstract

Canton lacks a robust way to extend a party’s hosting rights, and the data controlled by that party, from one Validator node to another. The hosting [replication mechanism that works today](https://docs.canton.network/global-synchronizer/production-operations/party-management#offline-party-replication-steps) requires the target node to stop transacting while an operator moves an active contract set from a source node to the target node via a file export and import.

This proposal funds online party replication, which moves a party's active contract set between Validators over a **sequencer channel** while the party continues to transact. In this approach, the act of onboarding a party to a new node, via topology transaction, triggers a transfer of that party’s contract state from a source Validator to this new node.

As a first step toward fully online party replication, the proposal introduces an improved version of offline party replication, built around primitives for authorizing **remote reads** of a party's Active Contract Set (ACS), and **party freeze** during this read process. Remote read and party freeze allow a node newly hosting a given party to read the party’s ACS from other nodes that already host the party, while transactions involving that party are paused, and the target Validator also pauses transaction processing.  Once this transfer is complete, the protocol will then initiate synchronized transaction processing on the new node, and resume synchronization on all other nodes hosting that party. 

With this work, Validator node topology stops being a one-way decision. Every Validator that hosts parties gains the ability to move them, wallet providers gain a path to split or consolidate hosted parties as they grow. The remote read library, the `get_remote_acs` command and the frozen party state become shared primitives that will enable future work (which we can call **Party Mobility Phase 2\)** to deliver party offboarding, party reonboarding, and data recovery from keys. 

---

## Specification

### 1\. Objective

Deliver online party replication on MainNet: the ability for a party to copy its ACS from one Validator by simply adding a hosting relationship to the new node. This will be initiated via an action authorized by the keyholder for that party and by the operator of the new Validator node, without pausing transactions that involve that party. This capability will be exposed through the Ledger API and triggered by topology authorization.

The Foundation's 2026-2027 RFP 1 area is broader than this proposal, and states that the Foundation "anticipate\[s\] approving multiple grants in this area as work progresses over the coming year." This proposal will be followed by a second phase RFP 1 proposal enabling party migration, which will offboard parties from the source Validator node and also allow reonboarding, as well as general data recovery from counterparties via the party’s keys. 

The remote read work in milestones 1 and 2 delivers primitives that will be exposed as admin API commands on an existing Validator node when it moves its hosting relationship to a new node, enable hosting-right grants and revocations signed by the party through a wallet, delivery of encrypted streams of ACS state to designated backup services, recovery of a party or Validator from keys, and concurrent replication of multiple parties to one target Validator.

### 2\. Implementation Mechanics

This section traces to two Digital Asset engineering design documents, *Sequencer Channels for OnPR and get\_remote\_acs* (2024-07) and *Remote Read and OnPR Milestones* (2026-08-19), together with the dependency map accompanying the second. All three are available to the Core Contributors Group on request. Nothing described here is new design introduced by this proposal.

The estimates behind the milestones are remaining work measured from grant approval forward. Parts of several items are already complete, and the engineering documents mark them as such, so a reviewer reading those documents will see progress markers that the milestone scopes here exclude.

**Remote read over sequencer channels.** A remote read library exposes the sequencer channel negotiation and the Daml admin workflow that party replication uses, so that replication and a direct read share one implementation. On top of it, a `get_remote_acs` admin API command retrieves a named party's active contract set from a chosen source Validator on a chosen synchronizer. The source signs an ACS digest and provides it to the target as evidence of what was sent. Authorization is checked in the Daml admin workflow: the source confirms that the target is authorized in `PartyToParticipant` topology to receive the party's contract set. A separate authorization check extends remote read to disaster recovery, where the requesting party is not onboarding. The sequencer carrying a channel is chosen from the sequencers that have channels enabled and to which both Validators are connected, using a semi-random hash-based scheme so that the same sequencer is not always selected and load spreads.

**Party freezing through topology.** A frozen state on `PartyToParticipant` prevents concurrent workload from interfering with replication. Freezing the party, rather than disconnecting the target Validator, is what allows the target to stay connected to the synchronizer for sequencer channel connectivity while the contract set moves. A write service exposes the state change, and protocol support ensures a frozen party cannot transact. That protocol support also makes the sequencer channel protocol available on a stable protocol version, protocol version 37, rather than a development one.

**Replication through the Ledger API.** The Ledger API gains the ability to add a party with an onboarding flag, and to report replication progress and errors through a status endpoint. Replication is then triggered automatically by the authorization of the party onboarding topology transaction, with no second operator action. A configuration option disables auto-triggering for operators who want to drive replication manually, and a pending-operation store prevents auto-triggering during an offline replication.

**Crash recovery and continuous indexing.** The imported contract set lands in an indexing journal before contracts reach the indexer, Canton's protocol handling appends concurrent onboarding-party transactions and reassignments to that journal, and indexer events are held and then flushed when the onboarding flag clears. This removes the minute-scale pauses of the file-based path and is the prerequisite for target Validator crash recovery. Target Validator crash recovery covers a crash during the remote read and a crash during indexing, and only updates the Validator's active contract store and in-memory state once the full contract set has arrived.

**Operational safety.** Staged ingestion is extended so that a target Validator validates a staged contract set against commitment-style hashes exchanged with a remote counter-participant before ingesting it, which makes the Validator resilient against a corrupt or partial ACS. The design work to establish what remains beyond the ACS commitment rewrite, so that a commitment hash of a party at a given point in time can be produced, is part of milestone 5 rather than settled going in. A guard rejects a second concurrent onboarding authorization to the same target Validator, by ignoring the relevant authorized topology transactions, following the precedent already set in the Canton codebase by the logical synchronizer upgrade implementation. Cancellation works by removing the onboarding hosting entry, dropping staged data if ingestion has not begun and interrupting it if it has, and a cancelled replication can be retried from either the import stage or the indexing stage. Disaster recovery behavior is defined for a backup restored mid-replication: cancel if the contract set has not been ingested, roll forward if it has.

### 3\. Architectural Alignment

**Ecosystem priorities.** This work responds to RFP 1, Enable frictionless party hosting, which asks for "enhancements to the Canton Protocol, Ledger API, and the Wallet SDK, to allow parties to move easily among Validator nodes." Moving a party between Validator nodes without downtime is the core of that request. The 2026-2028 roadmap targets "100+ Million parties and wallets on the Global Synchronizer" and states that "Wallet/Party key holders or their delegate(s) have full control over Validator hosting, redundancy, and disaster recovery," neither of which is reachable while a party's hosting Validator is fixed at onboarding. 

**Canton architecture.** Party replication operates on the Validator's active contract set, which is the unit Canton already uses for offline replication and for Validator repair, so it introduces no new notion of ledger state. It relies on the existing `PartyToParticipant` topology mapping for authorization and on sequencer channels as transport. The concurrency guard follows a pattern already present in the Canton codebase from the logical synchronizer upgrade implementation, which ignores selected authorized topology transactions to protect a Validator during a sensitive operation.

**Relevant CIPs.** CIP-0117, Logical Synchronizers, is relevant because milestone 4 defines the behavior of a replication interrupted by a logical synchronizer upgrade, and because the upgrade implementation supplies the topology-handling pattern the concurrency guard follows. CIP-0082 and CIP-0100 govern this grant.

**Super Validator and governance dependencies, stated plainly.** An individual replication is a bilateral operation between two Validators. It needs no per-replication Super Validator action and no synchronizer governance step, which is what makes it usable at the scale the roadmap targets. Two enabling conditions do require Super Validator action, and this proposal depends on both. Making the sequencer channel protocol available on protocol version 37 as a stable version requires the Global Synchronizer to run that protocol version, which is an on-chain governance decision. Enabling sequencer channels on Global Synchronizer sequencers is an operator action on Super Validator nodes. Milestones 1, 6 and 7 all rest on those conditions, and neither is inside Digital Asset's control.

**Canton's non-negotiables, and the one this proposal touches.** Privacy, atomic composability, decentralized control, independent resilience and global scale. Remote read moves a party's contract set from one Validator to another, and the disaster recovery authorization check widens that to parties that are not onboarding. The control that keeps this inside Canton's privacy model is the topology check in the Daml admin workflow: a source Validator releases a party's contract set only to a target that `PartyToParticipant` topology already authorizes to host that party. No Validator gains visibility of contracts for parties it is not authorized to host, and the widening is in which topology states permit a read, not in which contracts a reader may see.

### 4\. Backward Compatibility

The capability is additive and ships behind a feature flag until milestone 8\. Offline file-based party replication continues to work throughout and remains the fallback path, so no existing operator procedure breaks.

Two changes reach beyond the feature itself. Removing indexer pausing changes Validator indexing behavior for onboarding parties, including a new indexing journal and a flush on onboarding flag clearance. Making the sequencer channel protocol available on protocol version 37 means sequencer and Validator operators wishing to use replication must be on that protocol version, and the Global Synchronizer must have adopted it. Both of those follow the network's ordinary protocol-version adoption path rather than requiring a separate migration, which is an inference from how prior protocol versions have been adopted rather than a statement in the engineering design.

Milestone 7 deprecates the Early Access Ledger API replication service in favor of the Generally Available (GA) API.

---

## Milestones and Deliverables

The project is divided into 8 milestones over a 16-month period. Design development and the removal of dependencies that would otherwise prevent progress in this area have been ongoing for over 18 months. This grant funds the work to implement these features.

Milestones are numbered in expected order of delivery, but some are independent of one another. See: Parallel Milestones, under Funding.

### Milestone 1: Remote Read Primitives and Replication on the Early Access Admin API

- **Estimated Delivery:** Month 3  
- **Focus:** The remote read library, the `get_remote_acs` command, and the Early Access Admin API for replication. This API allows a read-only copy of the ACS for a specific party at a specific point in time. In combination with Party Freezing (Milestone 2), this pauses transactions on a specific party (taking just that party "offline"), and once complete it allows that copy to become the basis for ongoing synchronization of that party's state across those Validator nodes where it has been replicated. Remote read does **not** require the source Validator to disconnect from the synchronizer or pause all transactions.  
- **Deliverables:**  
  - Remote read library built on sequencer channel negotiation and Daml admin workflows  
  - `get_remote_acs` admin API command  
  - Protocol support for the frozen `PartyToParticipant` state on protocol version 37  
  - Remote read authorization check extended for disaster recovery, covering parties that are not onboarding

### Milestone 2: Party Freezing and Remote Read for Party-by-Party Offline Replication

- **Estimated Delivery:** Month 5  
- **Focus:** Freezing a party's activity via a topology transaction, to allow its contract set to move to an additional Validator. The target Validator must disconnect from the synchronizer during the import of the party’s ACS.   
  
- **Deliverables and Adoption Metrics:**  
  - Implementation of the frozen state on `PartyToParticipant`  
  - Write service exposing the frozen state transition  
  - Offline party replication driven by remote read  
  - **Adoption metric:** Party-level offline replications completed on five (5) nodes by operators other than Digital Asset.

### Milestone 3: Replication Early Access: Auto-Trigger and Crash Recovery

- **Estimated Delivery:** Month 7  
- **Focus:** Replication triggered by topology authorization, surviving a restart on either Validator  
- **Deliverables:**  
  - Ledger API call to add a party with an onboarding flag, and a status endpoint reporting replication progress and errors  
  - Automatically initiated party replication via submission of a party onboarding topology transaction to a Validator that does not already host that party  
  - Configuration option to disable auto-triggering, and suppression of auto-triggering during an offline replication  
  - Removal of indexer pausing, including the indexing journal, and protocol handling of onboarding-party transactions and reassignments  
  - Source Validator crash recovery  
  - Target Validator crash recovery across both the remote read stage and the indexing stage

### Milestone 4: Robustness, Operability and Feature Orthogonality

- **Estimated Delivery:** Month 10  
- **Focus:** Behavior under sustained load, under a synchronizer upgrade, and under cancellation  
- **Deliverables:**  
  - Long-running chaos testing of replication  
  - Review of every error returned by the party replicator, remote read and staged ingestion, with test coverage and documented recovery for each  
  - Performance runner exercise against the ACS commitment processor  
  - Replication configuration options, metrics and health checks  
  - Defined and implemented behavior for a replication interrupted by a Logical Synchronizer Upgrade  
  - Correctness argument for reassignments under a multi-synchronizer configuration  
  - Cancellation of an incomplete or failed replication, with retry supported from both the import stage and the indexing stage

### Milestone 5: Safe ACS Import

- **Estimated Delivery:** Month 12  
- **Focus:** Making a Validator resilient against a corrupt or partial contract set and source-signed ACS evidence.  
- **Deliverables:**  
  - Source-signed ACS digest delivered to the target Validator as evidence  
  - ACS commitment hash for a single party at a single point in time  
  - Staged ingestion extended with remote counter-participant validation, exchanging commitment-style hashes of the party's contract set  
  - Defined Validator behavior when validation fails

### Milestone 6: Online Replication Early Access Available on DevNet

- **Estimated Delivery:** Month 13  
- **Focus:** Getting the capability in front of wallet operators on a Canton Network environment  
- **Deliverables and Adoption Metrics:**  
  - Initial online party replication runbook published in the public Canton operator documentation  
  - Promotion of out of development status: backward compatible (stable) schema, new protocol version released  
  - Demonstration script, and incorporation of feedback from wallet operators exercising the capability  
  - Sequencer channels and replication enabled on selected sequencer and Validator nodes on DevNet  
  - **Adoption metric:** Three (3) wallet providers, plus the Splice Wallet Gateway team, execute an online party replication on DevNet through their own clients, on parties and target Validators of their choosing, and their feedback is incorporated before MainNet.

### Milestone 7: Online Party Replication Available on MainNet

- **Estimated Delivery:** Month 16  
- **Focus:** Generally Available (GA) API version, and release to TestNet and MainNet  
- **Deliverables and Adoption Metrics:**  
  - Secure sequencer channels: resource consumption limits, restriction on sequencer channel identifier length, and any security issues identified up to this point.  
  - Generally Available (GA) Ledger API service for replication, relying on general topology management through the Ledger API, with non-topology endpoints properly exposed  
  - Guard rejecting a second concurrent onboarding authorization to the same target Validator  
  - Disaster recovery support, cancelling or rolling forward a replication interrupted by a restored backup according to how far it had progressed  
  - Support of the Early Access Ledger API through DevNet, and release through the standard DevNet and TestNet cycle to MainNet  
  - Runbook extended for MainNet operation  
  - **Adoption metric:** Three (3) wallet providers and/or Validator operators outside Digital Asset each complete a party replication on MainNet within 3 months of availability.   
    - This milestone delivers replication deployed and available on MainNet with the capability behind a feature flag; the flag will be removed when milestone 8 is completed.

### Milestone 8: Internal Audit and Production Readiness

- **Estimated Delivery:** Month 16  
- **Focus:** Internal audit of the new protocol surface, and removal of the feature flag  
- **Deliverables:**  
  - Audit of sequencer channels and party replication, sufficient to permit Validator and sequencer operators to enable the capability in production environments. This will be an internal audit. External audits will be funded and scheduled separately.  
  - Remediation of audit findings, or an explicit recorded exception, with rationale for any finding not remediated  
  - Removal of the online party replication feature flag, so the capability is available by default  
  - Runbook completed to the standard of operator self-sufficiency  
  - A written summary of security findings and their resolutions, provided to the Foundation's Security Subcommittee.

The internal audit in this milestone will be performed concurrently with the MainNet work in milestone 7\.

### Dependency Graph

Reading this graph: Rounded nodes represent major capabilities the milestones deliver against. `Remote read for OffPR` and `Remote read for DR` complete in milestones 1 and 2, `OnPR early access` in milestone 3, `OnPR on DevNet` in milestone 6, `OnPR on MainNet` in milestone 7, and `OnPR production readiness` in milestone 8\. The two tracks on the left are independent of one another, which is why milestone 2 can complete without milestone 1 and why the internal audit can run alongside the MainNet work. Note that **the left-right layout of this diagram should not be read as a timeline;** specifically, the Remote Read features will be completed before the rest of the dependencies.

![Dependency graph for the eight milestones, showing the remote read track and the online party replication track converging on MainNet availability.](2026-09-DA-party-mobility-phase-1-dependency-graph.png)

The internal audit proceeds in parallel to the `OnPR on MainNet` gate. Its three prerequisites are Safe ACS Import, secure sequencer channels and the concurrency guard, all of which complete before MainNet deployment does. Only production readiness, which implies removing the feature flag, relies on both.

---

## Acceptance Criteria

The Tech & Ops Voting Group will evaluate completion based on:

- Deliverables completed as specified for each milestone  
- Demonstrated functionality or operational readiness  
- Documentation and knowledge transfer provided  
- Alignment with the stated value metrics

Project-specific acceptance conditions, all of which are measured by what people outside Digital Asset do with the capability:

- **Third-party execution.** Milestones 2, 6 and 7 each require the capability to be exercised by operators outside Digital Asset, at the levels described in their associated value metrics.  

- **Adoption.** The grant is complete when validator operators have demonstrated that they can move parties on MainNet with no replication-specific configuration and no feature flag. 

  

---

## Funding

**Total Funding Request:** 20,700,000 CC.  18,000,000 CC for milestone completion, plus an adoption bonus of 2,700,000 CC.

### Payment Breakdown by Milestone

| Milestone | Amount (CC) | Trigger |
| :---- | :---- | :---- |
| 1 - Remote Read Primitives and Early Access Admin API | 2,700,000 | Committee acceptance of deliverables and value metrics |
| 2 - Party Freezing and Remote Read for Party-by-Party Offline Replication | 1,400,000 | Committee acceptance of deliverables and value metrics |
| 3 - Replication Early Access: Auto-Trigger and Crash Recovery | 3,600,000 | Committee acceptance of deliverables and value metrics |
| 4 - Robustness, Operability and Feature Orthogonality | 3,700,000 | Committee acceptance of deliverables and value metrics |
| 5 - Safe ACS Import | 900,000 | Committee acceptance of deliverables and value metrics |
| 6 - Online Replication Early Access Available on DevNet | 1,200,000 | Replication executed on DevNet by a wallet provider outside Digital Asset |
| 7 - Online Party Replication Available on MainNet | 3,700,000 | Replication executed on MainNet by validator operators outside Digital Asset |
| 8 - Internal Audit and Production Readiness | 800,000 | Audit complete, findings remediated, feature flag removed, operators replicating from the runbook alone |

### Volatility Stipulation

As this project duration is greater than 6 months, the grant is denominated in fixed Canton Coin and will require a re-evaluation at the 6-month mark.

Digital Asset proposes that the re-evaluation cover every milestone whose estimated delivery falls after it, so that the Canton Coin amounts for those milestones are set once at the 6-month mark rather than renegotiated at each submission. 6 of the 8 milestones are expected to complete more than 6 months after grant approval, carrying 13,900,000 CC of the base total, so the re-evaluation is material and Digital Asset would rather it happen once than eight times.

### Parallel Milestones

Milestones are numbered in expected order of delivery, and several are independent of one another. Milestone 2 shares no dependency with milestones 1 or 3\. Milestone 5 depends only on the ACS digest delivered in milestone 1\. The internal audit in milestone 8 begins as soon as its own prerequisites are complete, rather than waiting for MainNet deployment in milestone 7\.

Digital Asset may therefore submit any milestone for acceptance, and the Tech & Ops Voting Group may accept and pay it, before a lower-numbered milestone is complete. Acceptance of a milestone carries no implication that earlier milestones have been accepted.

### Adoption Scale Bonus

An additional 15% of the base grant amount, contingent on a wallet provider putting the capability to use at scale within a defined window after it reaches MainNet.

| Adoption Scale Bonus | Bonus Percentage | Bonus Amount |
| :---- | :---- | :---- |
| A wallet provider replicating at least 10,000 parties from one node to another within two months of MainNet release | 15% | 2,700,000 CC |

The trigger measures adoption by a third party rather than delivery by Digital Asset.

Note that replication in this proposal is serial with respect to a single target Validator, so 10,000 parties means 10,000 sequential replications, which allows roughly eight minutes per party across two months.

---

## Co-Marketing

Upon release, Digital Asset will collaborate with the Foundation on:

- Announcement coordination  
- A technical blog post explaining party replication over sequencer channels and its benefits for validator operators and wallet providers  
- Developer and ecosystem promotion, including a walkthrough of the published runbook  
- Highlighting the feature in the quarterly Canton Development Fund report

---

## Motivation

**The ecosystem problem.** Canton lacks a robust way to extend a party’s hosting rights from one node to another. The only replication mechanism available today is offline: the operator isolates the target Validator from the synchronizer, backs it up, imports an exported contract set, reconnects, and clears the onboarding and offline flags, in that order, with console access to both Validators and a file transfer between their operators. Indexer pausing on the target adds pauses measured in minutes. This is a capability that only a Canton expert can execute safely, and is infeasible for most production systems.

**Portion of the ecosystem that benefits.** Every Validator hosts parties, so every Validator is exposed to the underlying constraint: the Validator node a party is onboarded to is effectively permanent. The roadmap targets 10,000+ validator nodes and 100+ million parties and wallets on the Global Synchronizer by 2028, and states that party key holders should have "full control over validator hosting, redundancy, and disaster recovery." Neither target is reachable while hosting is fixed at onboarding, so the addressable population is the whole validator set.

The population that benefits immediately is narrower and more countable: validator operators hosting parties on behalf of others, which is the wallet provider and custodian segment. For those operators, node sizing and node consolidation decisions cannot be revisited. Digital Asset expects the majority of that segment to use party replication within a year of MainNet availability. 

The secondary beneficiaries are the builders and users of additional RFP 1 work that will follow this proposal. Party offboarding, party reonboarding, recovery of a validator from its keys, designated backup services holding a streamed copy of a party's contract state, and bulk ACS repair will all build on the work completed in this grant.

**Evidence that the problem is real.** Multiple wallet providers have stated that they prefer to operate in multi-hosted mode, with each party's data present on more than one Validator node. And the Tokenomics committee is working on Featured Application guidelines that will require multi-hosting ("Co-Validation") for most applications.

**Strategic importance.** RFP 1 is the first RFP in the first roadmap category, and the Foundation anticipates multiple grants in the area. Party portability is also the subject of one of the Foundation's own SIGs. A network whose parties cannot move is a network whose Validators cannot restructure, which becomes a constraint on institutional adoption as node operators consolidate, migrate between infrastructure providers, or change custodial arrangements.

**Sustainability.** The deliverables are contributions to the Canton open-source codebase, maintained under the existing maintainer review process alongside the rest of the Validator and protocol code. There is no separate component to keep alive and no new service to operate, so ongoing maintenance is covered by the same arrangement that maintains the codebase the work lands in. Digital Asset will provide ongoing maintenance of this code under its existing [Canton Open Source maintenance grant](https://github.com/canton-foundation/canton-dev-fund/blob/main/proposals/2026-03-DA-canton-oss-maintenance.md).

**Public good.** Online party replication is a feature every user and node operator can use, and the remote read library, `get_remote_acs` command and frozen-party topology state are shared infrastructure that multiple future applications and utilities can build on.

---

## Rationale

**Sequencer channels as the transport.** Moving a contract set through a file export and import puts the operator in the data path and lacks protocol-level controls. It would rely on the Ledger API and Wallet Gateway, leaving the ecosystem with a more complex solution over the long term. 

Sequencer channel let the source stream directly to the target over infrastructure both Validators are already connected to, with no new component to operate and no artifact to move by hand. Sequencer channels will be simpler than for Validators and Wallet apps–though they will require more work up front, to harden and audit their implementation. 

**Party freezing as a step toward zero downtime.** The target Validator has to stay connected to the synchronizer for the sequencer channel to work, so the older approach of disconnecting it will not be available. As an intermediate step, freezing the party through `PartyToParticipant` topology stops interfering workflows, though it still requires the target Validator to go offline. The full scope of this proposal will allow replication with zero downtime.  
    
**Auto-triggering from topology authorization.** Kicking off party replication with a topology transaction will make it possible for party owners to initiate a replication procedure. This will allow wallets to initiate party replication directly in their UI, progressing with the replication once the target Validator authorizes the move. It also meets the RFP 1 request that parties grant hosting rights by signing a transaction submitted through the Ledger API.

**Serial replication to preserve delivery timelines.** Supporting concurrent replication of many parties to one target Validator is significant and complex work, and building it first would push MainNet availability out substantially. This proposal instead ships a guard that rejects a second concurrent onboarding to the same target, preventing the Validator database corruption that concurrency would otherwise risk, and defers the throughput work to a later grant under the same RFP.

This is a trade off between throughput and delivery timelines. The adoption scale bonus is set against serial replication rather than against the deferred concurrency work.

**Remote read as a reusable primitive, and why it is funded here.** Building remote read as a library and an admin API command, rather than as private machinery inside replication, will enable additional features in the future, including validator recovery from keys, and providing a way for Validator operators to read a remote ACS for repair purposes.

**Alternatives considered:**

| Approach | Advantages | Disadvantages | Decision |
| :---- | :---- | :---- | :---- |
| Online replication over sequencer channels | No party downtime; single operator action; reusable remote read primitive; no artifact handled by hand | New protocol surface requiring security hardening; roughly 12 weeks of additional schedule; depends on protocol version 37 adoption | Selected |
| Extend offline file-based replication only | Already implemented; no new protocol surface | Requires the party to stop transacting; target must be isolated, backed up and reconnected in a fixed order; needs console access to both Validators and a file transfer between operators; indexer pauses measured in minutes | Not selected; retained as a fallback, but moved to the per-party level |
| Party migration by offboarding from the source Validator | Conceptually the simplest answer to what operators ask for, and named in RFP 1 | Party offboarding does not exist and cannot be relied on, so every path ends in multi-hosting | Not selected; a candidate for a later grant under RFP 1 |
| Manage ACS replication in the Ledger API and Wallet Gateway | Leaves the Canton protocol surface unchanged | Pushes replication state into every client; more complex behavior at the node level | Not selected; sequencer channels remove the need |
| Concurrent replication to a single target Validator, FIFO or bulk | Higher throughput for bulk onboarding and rebalancing | Significant complex feature work; risk of Validator database corruption; would delay MainNet availability | Not selected; deferred to a later grant, with a concurrency guard shipped instead |
| Online replication without removing indexer pausing | Smaller scope; less protocol handling work | Retains minute-scale pauses, and target Validator crash recovery is not achievable without the indexing journal | Not selected; the pauses are part of what this proposal exists to remove |
