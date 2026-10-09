# Development Fund Proposal: Canton Flash Liquidity

- **Author:** Uroš Kočišević [kocisevic](https://github.com/kocisevic)
- **Org:** Vacuumlabs
- **Status:** Draft
- **Created:** 2026-09-07
- **Proposal Type:** RFP-aligned
- **RFP / Roadmap Area:** RFP 13, Payments and DeFi (Financial Markets, Standards & Verification)
- **Champion:** Needs Champion
- **Total Funding Request:** 1,430,000 CC fixed, plus a ring-fenced 300,000 CC ceiling for external security review, plus up to 1,000,000 CC adoption based
- **Project Duration:** Up to 19 weeks of development + maximum of 12 months of adoption deadlines + 12 month maintenance and adoption window
- **Label:** `defi-liquidity`

## Abstract

Flash liquidity ie borrowing with no collateral, under the condition that the loan is repaid inside the same transaction, is the primitive that lets a liquidator, arbitrageur or refinancer act with capital they do not own. It exists on multiple EVM chains and has no Canton equivalent.

We developed a proof of concept for a four leg flash loan, executed by the borrower as a single atomic Canton transaction: pool to borrower, the borrower action (a two swap arbitrage in this case), borrower returns principal plus fee, and a pool balance invariant check on exit. It runs on Canton Token Standard V2 (`CIP-0112`) allocation and settlement rails, against two registry implementations: a minimal mock and `AmuletRegistryV2`, the Splice test-harness registry that exercises the production `splice-amulet` Daml packages.

This proposal funds making multi party atomic asset transfer durable on Canton. Atomic composition itself already works: `CIP-0112` provides it. What is not dependable is moving several parties' assets through one such transaction knowing in advance that it will settle atomically and what it will cost. The proposal delivers three things against that gap:

1. A production grade flash liquidity primitive, with a reference flash liquidation integration.
2. The first published measurement of how confirmation latency scales with the number of signatory participants.
3. A settlement compatibility test kit that tells an application author whether a given registry can take part in such a transaction at all.

The primitive holds liquidity in partitions, which keeps concurrent borrowers off a single shared state contract and makes contention a parameter the operator sets. It is not a money market. Pooled liquidity accounting is out of scope and the pool is funded by its operator.

The measurement and the test kit are useful to Canton whether or not a single flash loan is ever taken.

## Specification

### 1. Objective

**To make it possible for an application on Canton to compose several parties' asset movements into one transaction, and to know in advance whether that will work and what it will cost.**

Today it can do the first but not the second. The composition is possible, because `CIP-0112` batch settlement provides it, but nothing tells an application in advance whether the registries involved will settle synchronously, and nothing tells it how long the confirmation round will take once several participants must confirm. Applications therefore avoid it, or ship it and hope.

This is one objective with three prongs:

- **Flash liquidity, the proof that it can be done.** Flash liquidity is impossible without atomic composition, which makes flash liquidity the sharpest test of atomic composition and its most demanding consumer.
- **The latency, what it costs** Confirmation latency as a function of the number of signatory participants, measured rather than argued.
- **The compatibility test kit, to find whether it will work.** A runnable check that tells an application author, before they build, whether a registry settles synchronously enough to compose with.

With all these shipped, the possibilities include:

- A liquidator, arbitrageur or treasury operator can borrow Canton Coin or any V2 registry asset without collateral, put it to work, and repay it, in one transaction they submit alone.
- A lending protocol author can read a short published list of requirements and know whether their liquidation path is flash liquidatable, before they ship it rather than after.
- A registry implementer can run a suite and state, with evidence, that their registry can take part in atomically composed transactions.
- Anyone implementing a multi party atomic asset transfer can look up what each additional signatory participant costs them in confirmation latency.

**Explicitly out of scope: pooled liquidity accounting.** No LP tokens, no interest index, no utilization curve, no reserves, no rates. The exclusion is to ensure the focus of this proposal is on the flash liquidity primitive feature set and not the incentivization mechanism and other implementation details of the LP itself.

### 2. Implementation Mechanics

#### 2.1 The Primitive

A flash loan on Canton is not a state machine and not a loan contract, since the debt never survives a transaction. It is a shape of transaction, and Canton's authority model supplies the atomicity for free: a Daml transaction is one commit of a tree, and a choice body executes with the signatories of the contract combined with the controllers of the choice.

**The mechanism in one paragraph.** A liquidity pool contract signed by the pool operator exposes a nonconsuming `borrow` choice controlled by the borrower. Inside that one choice body the pool allocates and settles liquidity to the borrower on `CIP-0112` rails, hands control to a third party implementation of the borrower action interface, settles principal plus fee back, asserts the pool balance invariant, and rolls the partition state contract forward. The registry's authority arrives by exercising a choice on the registry's own rules contract, so the registry admin never submits anything. The counterparty, meaning the venue or protocol on the other side of the borrower's action, supplies its authority by having signed the pool contract in advance. The choice context and the disclosures are assembled off-ledger before submission. One commit, one submitter, no keeper and no off-ledger monitor.

**Why liquidity is partitioned.** `borrow` is nonconsuming, but the balance it moves lives in a partition state contract, and updating that contract archives it and recreates the successor. Two borrows that roll the same partition state contract forward in the same instant therefore conflict, and one of them is rejected and retries. A single shared partition is a throughput ceiling, and the remedy is to hold liquidity in several partitions and select one per borrow, which makes contention a parameter the operator sets rather than an accident of traffic.

We also researched an alternative, an intent based pool in which incoming allocations supply the liquidity. It removes contention, but only by requiring that someone has already committed the funds, which is the standing inventory requirement flash liquidity exists to remove. We therefore did not pursue it.

**Re-entrancy, and the scope of the invariant.** `borrow` is nonconsuming and its body hands control to a third party implementation, so the borrower can attempt to exercise `borrow` again from inside its own callback, on the same partition or on another one. The design therefore carries an explicit re-entrancy guard. The invariants ensure that the flash loan succeeds only when the amount returned to the pool is equal to or exceeding the amount borrowed, plus fees.

#### 2.2 The Deliverables

**(a) The primitive, as a library.**

The first block of work is the library:

- One coherent package layout, with a deliberate and documented public surface rather than whatever the tests needed, under the constraint that an interface cannot be implemented in its defining package.
- The settlement adapter, and the assembly of the choice context and the disclosures, as components an application author calls directly.
- Partitioning of pool liquidity, with partition selection.
- The pool balance invariant stated formally and scoped per partition.
- A pre-flight synchronizer check that refuses to arm a loan whose input contracts are not assigned to a common synchronizer, with a named diagnostic rather than an opaque routing rejection.
- Error handling and diagnostics that tell an integrator which leg failed and why.
- A pipeline that runs the full suite against a real participant on every change, with the dependency check alongside it.

On top of that sits the hardening that our proof of concept conditions demand:

- Fee arithmetic under real registry fee parameters, with rounding biased to the pool at the instrument's minimum unit and a borrower side buffer computed from the registry's transfer configuration rather than assumed zero.
- Canton explicit disclosure in place of observer lists, which removes a standing privacy leak of pool and venue balances.

**Who funds the pool?**

In this version the pool is funded by its operator. That operator, a treasury, market maker or lending protocol capitalizing liquidation for its own liquidators, signs the pool contract and earns the fee. That is why pooled liquidity accounting can be excluded without leaving a hole: a single operator pool needs no LP tokens, no interest index and no reserves. Opening the pool to third party depositors is a separate problem with genuine unsolved research behind it, and it is deliberately left to a later proposal.

**(b) The flash liquidation reference integration.** The durable use case. A liquidator holding nothing repays an unhealthy vault's debt with borrowed funds, receives discounted collateral, sells it, repays principal plus fee, and keeps the surplus, in one transaction.

We will write a reference lending vault ourselves, as a separate package with no dependency in either direction on the pool. The requirements for flash liquidation are published first, and the vault is then written against them, so any later protocol can check itself against the same document and get the same answer we did.

**(c) The measurement.** A benchmark harness and a published report answering questions that currently have no numbers attached anywhere in the ecosystem:

- Confirmation latency as a function of the number of signatory participants in one atomically composed transaction, on a genuinely multi participant deployment.
- Contention and retry rate per partition under concurrent borrowers, which converts a structural argument into data.
- The armed context lifetime under realistic DSO tick parameters, meaning how long a pre-armed submission actually has before the config state it points at rotates out from under it.

**(d) The settlement compatibility test kit.** This is a tool a registry author runs to find out whether applications can compose their registry atomically. It proposes no new interface and asks nothing of the standard.

The kit checks three properties, all of which this work found to matter and none of which the standard currently requires:

- Allocations complete synchronously, so batch settlement can follow inside the same update.
- The choice context is buildable from contracts that already exist, with no live call to the registry, so a multi-leg transaction can be armed before submission.
- The registry states the lifetime of that context.

Two registries, a minimal mock and `AmuletRegistryV2`, already pass all three, which is why the kit is proposed from evidence. We can say precisely what passing means and ship reference subjects that demonstrate it.

### 3. Architectural Alignment

**RFP 13(i)(a), Payments and DeFi.**
We're developing a reusable open source primitive for flash liquidity, and compatibility kit that will be usable for registries to determine that particular asset is flash liquidatable.

### 4. Backward Compatibility

No backward compatibility impact. All code is new packages.

## Milestones and Deliverables

Development spans approximately 19 weeks from project start, with 12 months including maximum time to fulfill the adoption gates, followed by a twelve month maintenance.

Amounts are set out under Funding. Milestones 2 and 3 each carry an adoption gate, per the [Adoption Based Payments table](#adoption-based-payments).

Milestone 4 is the maintenance period, and its fixed payment is not gated by adoption. Maintenance requires ongoing engineering effort, so the payment for Milestone 4 is made in full whether or not its adoption targets are met. Those targets are paid separately, as adoption based payments.

The primitive and the reference lending vault are deployed on MainNet in Milestone 3, before the maintenance period begins. Milestone 4 does not start until that MainNet deployment is live, so the maintenance and adoption window always runs against a MainNet deployment.

### Milestone 1: Flash liquidation primitive, and the requirements that make it possible

**Estimated Duration:** 12 weeks

**Focus:** Turn the primitive into a library an application can depend on, publish the integration requirements.

**Deliverables:**

_The primitive as a usable library:_

- Public Apache 2.0 repository holding the pool, the borrower action interface in its own package, and the shared settlement adapter.
- Assembly of the choice context and the disclosures as a component an application calls directly, covering the counterparties' inventory and not only the registry's rules contract.
- Fee model in basis points of principal, stated as a formula that takes the registry's transfer configuration as an input, with a worked break even borrow size.
- Partitioning of pool liquidity, with partition selection.
- A re-entrancy guard on the `borrow` choice, preventing a borrower action implementation from recursively invoking `borrow`.
- The pool balance invariant stated formally, with its pre-state, its post-state and the quantifier made explicit, scoped per partition, together with the argument that per partition invariants add up to a pool wide guarantee.
- Registry pinning: the expected `admin` party and `instrumentId` asserted on every holding entering or leaving the pool.
- Documented, explicitly versioned public surface, plus integration documentation for an author writing their own borrower action implementation.
- Full test suite green against a real Canton participant in continuous integration, with the package independence check in the same pipeline.
- Negative tests that assert the engine's actual error text and identify contracts by identifier.
- One command reproduction in a single JVM process, without Docker, Postgres, Kubernetes or a local network stack, emitting the engine's own transaction trees as committed evidence.
- A minimal latency probe, run on a second and separate deployment. Three participants on one synchronizer: pool operator, registry admin and borrower. The venue party shares the borrower's participant.
- A provisional confirmation latency number from that probe: the median and the spread over a fixed run count, stated against the single participant baseline. This is a first number and not the benchmark. The harness, the sweep across signatory counts, traffic accounting, concurrency and context lifetime all stay in Milestone 2.
- A minimal reference lending vault, in a package the pool does not depend on.
- A flash liquidation implementation of the borrower action interface driving the full path, namely borrow, repay debt, receive discounted collateral, sell, repay principal plus fee, keep the surplus, in one transaction, on V2 rails, on a real participant.
- Negative tests in which a healthy vault, and collateral discounted insufficiently to cover principal plus fee, each reject the entire transaction, leaving every balance unchanged and the liquidator holding nothing.
- Published engineering write-up of the atomic four leg transfer result and a provisional latency number, stating in the same document the conditions the result was obtained under.
- A public walkthrough of the reproduction, recorded and published.

### Milestone 2: Multi participant measurement, benchmark report and settlement compatibility test kit

**Estimated Duration:** 5 weeks for technical delivery, and a maximum of 6 months from the beginning of Milestone 2, set by adoption gate.

**Focus:** Replace structural arguments with numbers on a real multi participant deployment, so that the remaining single participant conditions of Milestone 1 are lifted and confirmation latency, contention and armed context lifetime are measured rather than argued.

**Deliverables:**

_Measurement and benchmark report:_

- A multi participant deployment, with pool operator, registry, venue and liquidator on separate participants on one synchronizer, and the flash loan green on it.
- An open source benchmark harness reusable by any project measuring multi party atomic asset transfers.
- A published report covering confirmation latency versus number of signatory participants.
- The synchronizer traffic cost of one flash loan submission, compared against the same work done as separate submissions.
- Contention and retry rate per partition under concurrent borrowers.
- The measured lifetime of a pre-armed choice context under realistic DSO tick parameters.
- In that report, the economic envelope stated explicitly: given the measured latency and measured traffic cost of one submission, what price movement or liquidation bonus a Canton flash loan needs to be profitable.
- The report presented to the DeFi Protocols and Liquidity SIG and to the Financial Workflows and Composability SIG.

_Settlement compatibility test kit:_

- A runnable compatibility test kit under Apache 2.0 that any registry author can execute against their own registry, checking synchronous completion, a pre-armable choice context and a declared context lifetime.
- The two registries already tested, a minimal mock and `AmuletRegistryV2`, shipped as reference passing subjects. Both are test-harness registries, so the kit is also run against at least one registry written outside this project, where one is available to us, with the result published either way, pass or fail.
- A short compatibility profile document.
- Documentation for application authors on what passing does and does not guarantee, including the explicit statement that the standard still permits `Pending` and that a registry may legitimately not pass.
- The kit and the profile presented to the Token Standards and Asset Standards SIG.
- (Optional and unfunded): if that SIG wishes to adopt the profile as a CIP, we will support the process. No funding is attached to that outcome and no milestone depends on it.

**Adoption Gate:** **200,000 CC**

- At least 1 of 2 external lending or vault protocols confirming conformance against the published requirements (row A1, **100,000 CC** each), per the [Adoption Based Payments table](#adoption-based-payments).
- At least 1 of 2 independent compatibility kit runs against a registry we did not write the fixture for, performed and published by that registry's own authors (row A2, **100,000 CC** each), per the [Adoption Based Payments table](#adoption-based-payments).

**Adoption Gate Deadline:** 6 months from the beginning of Milestone 2.

### Milestone 3: Production hardening, real fee parameters, and security review

**Estimated Duration:** 2 weeks for technical delivery, and a maximum of 6 months from the beginning of Milestone 3, set by adoption gate.

**Focus:** Everything between "the mechanism works" and "an institution would put liquidity behind it", closing the zero fee conditions and the standing privacy leak.

**Deliverables:**

- Fee arithmetic under non-zero registry fee parameters, with rounding biased to the pool at the instrument's minimum unit, a borrower side buffer derived from the registry's transfer configuration rather than assumed zero, and a prohibition on dust sized borrows paying zero fee.
- Canton explicit disclosure in place of observer lists, removing the standing visibility of pool and venue balances.
- A published threat model with its open items closed or explicitly accepted.
- An external security review commissioned within this milestone, with scope and quote agreed. The reviewer's own schedule sits outside our control, so the findings and our responses are published on receipt rather than inside the milestone window.
- Operator documentation covering partition sizing, disclosure handling, and what a pool operator can and cannot do, since for liveness a pool operator is trusted and for safety it is not.
- The primitive deployed and exercised on TestNet.
- The reference lending vault deployed on MainNet.

**Adoption Gate:** **100,000 CC** 

- At least 2 parties other than Vacuumlabs exercising the primitive on TestNet (row A3, **50,000 CC** each), per the [Adoption Based Payments table](#adoption-based-payments).

**Adoption Gate Deadline:** 6 months from the beginning of Milestone 3.

### Milestone 4: Maintenance and adoption window

**Estimated Duration:** 12 months from beginning of Milestone 4.

**Focus:** Sustainability of the work after the grant.

**Deliverables:**

- Twelve months of maintenance, covering SDK, Canton and Token Standard version upgrades, issue triage, and compatibility updates as the Amulet packages and the V2 standard evolve.
- Integration support for teams adopting the primitive or the compatibility kit.
- A written maintenance handover plan at the end of the window, naming one of three outcomes: continued stewardship, a named successor maintainer, or archival with a clear statement of state.

**Adoption Target:** **500,000 CC**

- 2 parties other than Vacuumlabs exercising the primitive on MainNet (row A4, **100,000 CC** each), per the [Adoption Based Payments table](#adoption-based-payments).
- 2 external protocols adopting the primitive and allowing flash borrowing from their own vault on MainNet (row A5, **150,000 CC** each), per the [Adoption Based Payments table](#adoption-based-payments).

**Adoption Target Deadline:** 12 months from beginning of M4.

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone
- Demonstrated functionality or operational readiness
- Documentation and knowledge transfer provided
- Alignment with the RFP items stated under Architectural Alignment

Milestone specific acceptance conditions:

- **Milestone 1:** the pool and borrower action interface are public, the package manifest is published, the full test suite passes on a real participant, and the one command reproduction runs clean. The provisional latency number is published, whatever the number is. A bad number is an accepted outcome here, as it is in Milestone 2. The flash liquidation path clears end to end on a real participant, both negative tests reject as designed, and the requirements have gone out to the DeFi Protocols and Liquidity SIG.
- **Milestone 2:** the multi participant deployment is live, and the benchmark report is published with the economic envelope stated and submitted to both SIGs. Whether either SIG grants a presentation slot is not ours to decide, so acceptance turns on submission rather than on the slot. The compatibility kit runs clean against both reference registries, the compatibility profile is published, and the kit has been run against at least one registry written outside this project where one was available to us, with that result published either way.
- **Milestone 3:** fee arithmetic holds under non-zero parameters, the privacy leak is closed, the threat model is published with its open items closed or explicitly accepted, the primitive is deployed and exercised on TestNet, and the reference lending vault is live on MainNet with at least one flash liquidation cleared end to end. The external security review is commissioned within this milestone, with its scope and quote agreed. Its findings and our responses are published on receipt, which may fall after the milestone closes.
- **Milestone 4:** each period's maintenance commitments are delivered and the final handover plan is written.

Milestones with adoption gates require the adoption gate events to pass completely before moving to the next milestone.

## Funding

### Total Funding Request

**2,730,000 CC**

**1,130,000 CC** (46.5%) fixed for development, plus **300,000 CC** (12.3%) fixed for maintenance, plus up to **1,000,000 CC** (41.2%) adoption based.

There is also a ring-fenced **300,000 CC** ceiling for the external security review. Only the reviewer's accepted quote is drawn against it, and any remainder is never requested. 

> The percentage figures are against 2,430,000 CC, excluding the 300,000 CC review costs.

All Canton Coin figures in this proposal assume a rate of **1 CC = €0.10** for budgeting and volatility purposes.

**Adoption gates.** M2 and M3 carry an adoption gate, that succeeds only when their adoption events are **completely** met within the adoption gate deadline. If the adoption gate is only partly met, or not met at all, the milestone payment is not paid out. In that case, the Foundation pays only for the adoption events that were met, at the amounts in the [Adoption Based Payments table](#adoption-based-payments), and not the payment for technical delivery.

### Payment Breakdown by Milestone

- **Milestone 1** (The primitive as a usable library, flash liquidation and the published requirements): **640,000 CC** (26.3%)
- **Milestone 2** (Multi participant measurement, benchmark report and settlement compatibility test kit): **290,000 CC** (11.9%)
  - Adoption gate: up to **200,000 CC** (8.2%)
- **Milestone 3** (Production hardening, real fee parameters, threat model): **200,000 CC** (8.2%).
  - Audit costs: Max of **300,000 CC**, ring-fenced and pass-through.
  - Adoption gate: up to **100,000 CC** (4.1%)
- **Milestone 4** (Maintenance and adoption window, 12 months): **300,000 CC** (12.3%) total, released quarterly in chunks of **75,000 CC**.
  - Adoption target: up to **500,000 CC** (20.6%)
  
- **Remaining adoption milestones:** up to **200,000 CC** (8.2%) of the 1,000,000 CC adoption cap, covering 
  - 1 additional A1 (100,000 CC) and
  - 1 additional A2 (100,000 CC).
  
Vacuumlabs may claim them until the end of Milestone 4.

- **External security review:** Ring-fenced, capped at **300,000 CC**. Released against a quote submitted to the Committee for approval once Milestone 2 is accepted, and passed through to the reviewer in full. We take no margin on it, and anything under the cap is not drawn. This is a pass-through cost, Vacuumlabs retains no part of this payment. The Canton Foundation may pay this amount either to Vacuumlabs or directly to the audit firm.

### Adoption Based Payments

Up to **1,000,000 CC** (41.2%), payable only on evidence, in tranches against the outcomes below. Each row unlocks only once the milestone that makes the outcome possible has been accepted.

| Row | Adoption Milestone                                                                                                           | Amount          | Max Cap | Max Total          | Evidence required                                                                                                                                                                                                                                                                                                                                                                             |
| --- | ---------------------------------------------------------------------------------------------------------------------------- | --------------- | ------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A1  | An external lending or vault protocol confirms conformance against the published requirements                                | 100,000 CC each | 2       | 200,000 CC (8.2%)  | A written assessment from a named technical contact at the protocol, addressed to the Tech & Ops Committee, mapping each published requirement to that protocol's liquidation path, with a pass or fail recorded per requirement.                                                                                                                                                             |
| A2  | The compatibility kit is run against a registry we did not write the fixture for, by its own authors, with results published | 100,000 CC each | 2       | 200,000 CC (8.2%)  | Machine readable kit output recording the kit version and commit, the registry `admin` party and `instrumentId` under test, and per case results. Published by the registry's own authors at a public location, together with a public continuous integration run the Committee can reproduce.                                                                                                |
| A3  | A party other than Vacuumlabs exercises the primitive on TestNet                                                             | 50,000 CC each  | 2       | 100,000 CC (4.1%)  | TestNet update identifiers for at least one successful four leg borrow, the submitting party identifier, which must be distinct from any Vacuumlabs party, the package identity used resolving to the published package manifest, and written confirmation from a named technical contact at that party.                                                                                      |
| A4  | A party other than Vacuumlabs exercises the primitive on MainNet                                         | 100,000 CC each | 2       | 200,000 CC (8.2%)  | MainNet update identifiers for at least one successful four leg borrow from the Vacuumlabs reference vault, the submitting party identifier, which must be distinct from any Vacuumlabs party, the package identity used resolving to the published package manifest, and written confirmation from a named technical contact at that party.                                                  |
| A5  | An external protocol adopts the primitive and allows flash borrowing from its own vault on MainNet                           | 150,000 CC each | 2       | 300,000 CC (12.3%) | MainNet update identifiers for the creation of the protocol's vault, signed by an operator party distinct from any Vacuumlabs party, and for at least one successful four leg borrow from that vault. The package identity used must resolve to the published package manifest, with written confirmation from a named technical contact at the protocol that the vault is open to borrowers. |

**Only one instance each of A1 and A2 is needed to pass the Milestone 2 adoption gate.** The second instance of each row stays claimable until the end of Milestone 4. This lets development continue without delay, while the gate still requires proof of adoption.

**The package manifest is the binding artifact.** Milestone 1 publishes a manifest recording, for each release, the package name, version, package identity and DAR SHA-256. That manifest determines whether a claim uses the published packages. Qualifying reuse includes any release in the published manifest lineage, so that a claimant depending on the package by name across an upgrade lineage is not excluded.

**Disclosure of evidence.** A claimant provides the evidence above either publicly with their consent, or privately to the Canton Foundation under confidentiality. In the confidential case, the Foundation confirms qualification to the Committee. Where we are engaged commercially by the claiming organization, that engagement is disclosed to the Committee at the time of claim, and the written confirmation is provided independently by the claimant. The Committee may decline a claim on this basis.

### Volatility Stipulation

Development (Milestones 1 to 3) is scoped to approximately 19 weeks, which is about 4.5 months. Should that timeline extend beyond six months due to Committee requested scope changes, any remaining milestones must be renegotiated to account for significant movement against the EUR to CC rate assumed above.

Milestone 4 and the adoption based payments extend past the six month mark by design. Because the grant is denominated in fixed Canton Coin, those components are subject to re-evaluation at the six month mark, on the same terms the Foundation applies to any project exceeding six months.

## Licensing

This proposal document: `CC0-1.0`. All software delivered under it: `Apache-2.0`.

## GTM / Co-Marketing

Upon release, we will collaborate with the Foundation on:

- Announcement coordination
- Case study or technical blog
- Developer or ecosystem promotion

Specific commitments:

- A technical write-up of the implementation, including the annotated transaction tree.
- A joint post with any lending or vault protocol that adopts the flash liquidation path.

## Risks and Mitigations

- **Demand risk** Flash loans thrive on volatile markets, many venues and frequent liquidations. Canton today is institutional and RWA heavy with thin on-ledger AMM liquidity, so standalone flash arbitrage demand is likely premature.
  - _Mitigation:_ Flash liquidation is the durable use case, because institutional lending needs liquidators regardless of market volatility. Flash arbitrage remains a secondary use case that becomes valuable as on-ledger venue liquidity deepens.
- **"Flash loans are an attack vector."** On EVM chains flash loans are best known for enabling oracle manipulation attacks. Such an attack needs two preconditions: a manipulable on-chain price source, and deep permissionless venue liquidity to move that price through. Canton today has neither.
  - _Mitigation:_ Milestone 1 addresses this case directly. Registry pinning bounds what the pool will accept, and an unprofitable or malformed attempt fails atomically, leaving the pool untouched. Re-entrancy is a separate attack class. Milestone 1 has a deliverable to close the re-entrancy attacks.
- **Latency risk.** If confirmation latency scales badly with signatory count, the economics of same transaction borrowing narrow sharply.
  - _Mitigation:_ a minimal probe in Milestone 1 gives a first number at that milestone's acceptance, and the full curve arrives in Milestone 2. Both measure rather than assume, and a negative result is an accepted outcome in each. A bad number therefore surfaces before the committee pays for the benchmark build, and before the hardening and adoption work.
- **Liquidity or a venue on a separate synchronizer.** A flash loan cannot span synchronizers.
  - _Mitigation:_ pre-flight assignment check, explicit synchronizer pinning on submission, and pre-positioning of pool liquidity per synchronizer, with partitions as the unit. Amulet and the public venues are on the Global Synchronizer, so this affects deliberately private deployments only.

## Motivation

Flash liquidity is missing infrastructure, and its absence is felt by liquidators first. Every lending protocol needs liquidators, and a liquidator needs the debt asset at the moment of liquidation. Without flash liquidity, liquidators have to hold the right asset, in the right size, idle, in advance, for every market they intend to cover. This is a structural constraint.

Flash liquidity removes the inventory requirement outright, so the binding constraint becomes who can find a profitable path rather than who is already rich in the right asset. Canton is about to have lending protocols. The Development Fund has approved the [OpenZeppelin Canton Ecosystem Stack](https://github.com/canton-foundation/canton-dev-fund/pull/262), whose Milestone 3 acceptance criteria cover vault creation, deposit and withdrawal, borrow and repay, and credential-gated compliance. Liquidation is not in that acceptance list, and institutional positions are large, which is precisely where the gap between position size and liquidator inventory turns into credit risk.

**Strategic importance.** Canton's differentiator is that authority can be delegated so that one party submits a transaction touching many parties' assets. Flash liquidity is an important exercise of that property. Demonstrating it, measuring what it costs, and giving registries a way to show they support it is a direct investment in Canton's core claim about composability.

## Rationale

**Why a flash liquidity primitive and not a money market.** Pooled liquidity accounting is the largest single body of work in a lending protocol, it would dominate this grant's schedule, and it overlaps funded work already under way on vaults, liquidity pool hooks, DeFi math and venue side pool accounting.

**Why a compatibility kit rather than a new interface.** In our research, we noted that batch settlement already provides standard atomic composition. A new interface would fragment the standard rather than fill a gap.

## References

- [CIP-0112](https://github.com/canton-foundation/cips/blob/main/cip-0112/cip-0112.md)
- [`splice-amulet`, the Amulet packages behind Canton Coin](https://github.com/hyperledger-labs/splice/tree/main/daml/splice-amulet)
- [Canton Token Standard API packages](https://github.com/hyperledger-labs/splice/tree/main/token-standard)
- [OpenZeppelin Canton Ecosystem Stack](https://github.com/canton-foundation/canton-dev-fund/pull/262)
