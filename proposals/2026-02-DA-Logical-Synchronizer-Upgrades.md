# **Development Fund Proposal**

## **Logical Synchronizer Upgrades (LSU)**

| Author | Wayne Collier, Digital Asset |
| :---- | :---- |
| Status | Proposal |
| Created | 2026-03-05 |

---

# **Abstract**

This proposal requests funding to design, implement, and release "Logical Synchronizer Upgrades" (LSU) for the Canton protocol. This will make it possible for the Global Synchronizer to upgrade from one protocol version to another while continuing to process Daml transactions, with only a few seconds to a few minutes of noticeable downtime.

LSU introduces an abstraction layer distinguishing between a **Logical Synchronizer** (the persistent identity of the synchronizer) and a **Physical Synchronizer** (the set of synchronizer nodes running a particular protocol version). This allows for rolling migrations where a new version of a synchronizer spins up alongside the old one. Validators can upgrade to the new version of Canton in advance, at their own pace, and then link seamlessly to the upgraded synchronizer, preserving all transaction history and cryptographic evidence. This approach will also substantially reduce the need for coordination among network participants, with automation and asynchronous activity largely replacing a coordinated joint effort by Super Validator and Validator node operators.

This solution will allow the Global Synchronizer to adopt improved Canton protocol versions even as it continues to scale in size and throughput.

# **Motivation**

As the Canton Network scales, the requirement to halt transaction processing to perform protocol upgrades becomes increasingly untenable. The current "dump and restore" methodology presents several critical issues:

**Downtime:** It requires global coordination to stop all activity.

**Complexity:** The operational burden on node operators to export/import data is high.

**Risk:** "Hard" migrations introduce opportunities for data corruption or operator error during the manual transition phase.

# **Specification**

## **1\. Objective**

The objective is to deliver a production-ready implementation of Logical Synchronizer Upgrades in the Canton Open Source repository.

The technical scope includes:

**Identity Abstraction:** Decoupling the Logical Synchronizer ID (LSId) from the Physical Synchronizer ID (PSId).

**Migration Orchestration:** Implementing "Killswitch/Tombstone" logic to freeze the old synchronizer and automatically redirect traffic to the successor.

**Automated Handover:** Enabling Validator nodes to detect the upgrade announcement, pause submission, switch connections, and resume processing on the new protocol version automatically.

**Security:** Ensure monotonic time across the migration, prevent replay attacks between physical instances, and enforce deduplication of transactions across the physical synchronizers.

## **2\. Implementation Mechanics**

**Topology Freeze:** A mechanism to temporarily prevent topology changes on the synchronizer around the time of the upgrade.

**Successor Announcement:** A new topology mapping LsuSequencerSuccessor allowing the existing synchronizer to point securely to its successor.

**Read-Only Mode:** Sequencers on the existing synchronizer will reject new submissions but allow time proofs to facilitate an orderly exit.

**Client-Side Logic:** Validator nodes will manage a Registering state to ingest the genesis topology of the new synchronizer while still connected to the old one.

# **Milestones and Deliverables**

Based on the execution plan, the project is divided into four distinct milestones over a 6-month period.

## **Milestone 1: Core Primitives & Topology**

| Estimated Delivery | Month 2 after announcement of approval of this proposal |
| :---- | :---- |
| **Focus** | Building the foundational data structures and topology transactions. |

Deliverables:

* Implementation of PhysicalSynchronizerId vs LogicalSynchronizerId distinction in the codebase.  
* New Topology Transactions: LsuAnnouncement and SynchronizerKillSwitch.  
* Implementation of the "Topology Freeze" logic on the sequencer.  
* Ability to start a successor synchronizer with a genesis topology derived from an existing one (demonstrated via integration testing).

## **Milestone 2: E2E Happy Path Orchestration**

| Estimated Delivery | Month 3 |
| :---- | :---- |
| **Focus** | Connecting the pieces to allow a successful migration under ideal conditions. |

Deliverables:

* Validator node logic to handle the SynchronizerSuccessor announcement.  
* Automatic registration of the new synchronizer upon detection.  
* Implementation of the "Tombstone" enforcement (sequencers go read-only after upgrade time).  
* Integration test demonstrating a validator moving from Protocol Version N to N+1 without manual intervention.

## **Milestone 3: Production Readiness & Release**

| Estimated Delivery | Month 4 |
| :---- | :---- |
| **Focus** | Crash recovery, unhappy paths, and security hardening. |

Deliverables:

* **Crash Recovery:** Mechanisms to resume migration if a node restarts mid-process.  
* **Unhappy Paths:** Handling late-coming Validators (offline during migration) via auto-catchup or repair workflows.  
* **Security Audit:** Verification of time monotonicity, signature validity, and deduplication across the boundary.  
* **Final Release:** Merged code into the main branch and included in a tagged Canton release.

## **Milestone 4: Successful upgrade on MainNet**

| Estimated Delivery | Month 6 |
| :---- | :---- |
| **Focus** | MainNet Physical Synchronizer, and at least 90 percent of Validators, successfully upgrade, retaining all history and cryptographic evidence, while halting Daml transactions for less than three minutes. |

Deliverables:

* Upgrade MainNet to a new version of Canton containing at least one protocol change.  
* Successfully upgrade MainNet a second time to a new version of Canton containing at least one protocol change.  
* Resolve any issues that come up in these upgrades.

**Operational Handover & Ongoing Maintenance**

Upon the successful completion of Milestone 4, day-to-day maintenance of the ISS-based BFT repository (including security SLAs, bug fixes, CI/CD pipeline management, and external PR reviews) will seamlessly roll into the purview of Digital Asset’s proposed *2026-Maintenance Grant for Daml Open Source*.

# **Acceptance Criteria**

The Tech & Ops Committee may evaluate the completion of the grant based on the following:

**Demonstration:** A live or recorded demo showing a Canton network upgrading protocol versions while a load generator runs, showing zero data loss and minimal interruption.

**Code Quality:** All code merged into the open-source repository with appropriate unit and integration test coverage.

**Documentation:** Updated operator manuals explaining how to trigger an LSU and how to configure nodes for auto-migration.

**Security Audit:** Complete and deliver an internal security audit.

# **Funding**

**Funding Request: 12,000,000 Canton Coin (CC).**

Payment Schedule:

| Milestone | Amount (CC) | Trigger |
| :---- | :---- | :---- |
| 1 – Core Primitives & Topology | 2,000,000 | Committee acceptance of deliverables |
| 2 – E2E Happy Path Orchestration | 2,000,000 | Committee acceptance of deliverables |
| 3 – Production Readiness & Release | 2,000,000 | Final release and committee acceptance |
| 4 – Successful upgrade on MainNet | 6,000,000 | Second successful upgrade on MainNet |

**Baseline total payment 12,000,000 Canton Coin (CC).**

## **Early Completion Bonus**

We propose an incentive model that incentivizes early delivery while respecting the Foundation’s need for budget predictability, allowing a bonus payment of up to an additional 20% more than the original project total payment.

| Early Completion | Bonus Percentage | Bonus Amount |
| :---- | :---- | :---- |
| Final delivery 1 month ahead of schedule | 10% | 1,200,000 |
| Final delivery 2 months ahead of schedule | 20% | 2,400,000 |

## **Delayed completion penalty**

In case the project delivers its final milestone later than the predicted timeline, the final payment will be reduced each month by 10 percent of the nominal project total for the first four months after the original planned completion date, then holding at 10% of the baseline total, resulting in a final payment of just 10% of the total proposal for the final milestone if delivered more than four months after the original proposed completion date.

## **Volatility Stipulation for delays caused by scope changes**

As this project is expected to complete within 6 months, the grant is denominated in fixed Canton Coin. We propose that if the project timeline extends beyond 6 months due to requested scope changes by the Committee, the remaining un-minted milestones must be renegotiated to account for any significant USD/CC price volatility.

# **Co-Marketing**

Upon the release of Logical Synchronizer Upgrades, Digital Asset will collaborate with the Foundation on:

* A technical blog post explaining the "Soft Migration" architecture.  
* Highlighting the feature in the quarterly Canton Development Fund report.

# **Rationale**

The proposed LSU approach allows the Canton protocol to evolve and fix bugs in the ordering layer without disrupting the application layer. It ensures that Synchronizers can operate as true "commodity" infrastructure—upgradable and maintainable without application developers or end-users needing to be aware of the underlying topology shifts.

## **De-risking Protocol Evolution**

By implementing Logical Synchronizer Upgrades (LSU), we lower the barrier to entry for protocol improvements. This ensures that the Canton Network can evolve rapidly without the "fear of upgrade" that plagues many distributed ledger networks. It transforms an upgrade from a high-stakes, manual crisis management event into a routine, automated operational procedure.

## **Decoupling Identity from Infrastructure**

The core technical concept proposed in this design is the separation of the **Logical Synchronizer** (the persistent identity and history of the domain) from the **Physical Synchronizer** (the infrastructure running a specific protocol version). Currently, the identity of a synchronizer is tied to its physical instantiation. When the protocol changes, the identity changes, forcing applications and Validators to "re-learn" the network topology. This proposal introduces an abstraction layer where:

1. **History is preserved:** Applications see a continuous stream of transactions under a single Logical ID, regardless of the underlying protocol shifts.  
2. **Safety is enforced:** By strictly enforcing monotonic time and preventing "split-brain" scenarios through the tombstone/successor mechanism, we maintain the integrity of the ledger without sacrificing the ability to change the underlying data models.

## **Reducing Coordination Burden**

In the current model, a synchronizer upgrade requires out-of-band coordination between the Super Validators (to agree on a halt time) and every single Validator Node (to prepare for the new connection). This manual coordination is prone to human error and leaves slower Validators stranded. LSU moves this coordination on-chain. The "Successor Announcement" and "Killswitch" topology transactions allow the protocol itself to orchestrate the migration. This ensures that Validators can detect, prepare for, and execute the migration automatically, drastically reducing the support burden on the Foundation and Super Validator operators.

