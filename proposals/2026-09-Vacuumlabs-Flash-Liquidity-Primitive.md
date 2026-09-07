# Development Fund Proposal: Canton Flash Liquidity

- **Author:** Uroš Kočišević [kocisevic](https://github.com/kocisevic)
- **Org:** Vacuumlabs
- **Status:** Draft
- **Created:** 2026-09-07
- **Label:** `defi-liquidity`
- **Champion:** Needs Champion

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

**Re-entrancy, and the scope of the invariant.** `borrow` is nonconsuming and its body hands control to a third party implementation, so the borrower can attempt to exercise `borrow` again from inside its own callback, on the same partition or on another one. The design therefore carries an explicit re-entrancy guard.

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

Development spans approximately 17 weeks from project start, followed by a twelve month maintenance and adoption window.

Amounts are set out under Funding, and adoption based payments sit outside the milestones.

### Milestone 1: The primitive as a usable library

**Estimated Duration:** 6 weeks

**Focus:** Turn the primitive into a library an application can depend on

**Deliverables:**

- Public Apache 2.0 repository holding the pool, the borrower action interface in its own package, and the shared settlement adapter.
- Assembly of the choice context and the disclosures as a component an application calls directly, covering the counterparties' inventory and not only the registry's rules contract.
- Fee model in basis points of principal, stated as a formula that takes the registry's transfer configuration as an input, with a worked break even borrow size under the zero fee test conditions of this milestone. Milestone 5 substitutes non-zero registry parameters into the same formula. Both are published with the integration documentation.
- Partitioning of pool liquidity, with partition selection.
- A re-entrancy guard on the `borrow` choice, preventing a borrower action implementation from recursively invoking `borrow`.
- The pool balance invariant stated formally, with its pre-state, its post-state and the quantifier made explicit, scoped per partition, together with the argument that per partition invariants add up to a pool wide guarantee.
- Registry pinning: the expected `admin` party and `instrumentId` asserted on every holding entering or leaving the pool.
- Documented, explicitly versioned public surface, plus integration documentation for an author writing their own borrower action implementation.
- Full test suite green against a real Canton participant in continuous integration, with the package independence check in the same pipeline.
- Negative tests that assert the engine's actual error text and identify contracts by identifier rather than by prose, and time dependent tests that use past deadlines, since a real participant neither distinguishes an archived contract from an invisible one nor permits time to be advanced.
- One command reproduction in a single JVM process, without Docker, Postgres, Kubernetes or a local network stack, emitting the engine's own transaction trees as committed evidence.
- A minimal latency probe, run on a second and separate deployment. Three participants on one synchronizer: pool operator, registry admin and borrower. The venue party shares the borrower's participant.
- A provisional confirmation latency number from that probe: the median and the spread over a fixed run count, stated against the single participant baseline. This is a first number and not the benchmark. The harness, the sweep across signatory counts, traffic accounting, concurrency and context lifetime all stay in Milestone 3.
- Published engineering write-up of the atomic four leg transfer result and a provisional latency number, stating in the same document the conditions the result was obtained under.
- A public walkthrough of the reproduction, recorded and published.

### Milestone 2: Flash liquidation, and the requirements that make it possible

**Estimated Duration:** 4 weeks

**Focus:** Prove reuse by a second application structurally unrelated to the first, publish the integration requirements while lending protocols are still being designed.

**Deliverables:**

- The flash liquidatable requirements published first, as a short specification aimed at lending protocol authors, then circulated through the DeFi Protocols and Liquidity SIG. Any responses received are published verbatim, including from a protocol whose liquidation path cannot meet the requirements. A documented "no" is a useful outcome: it is exactly the finding the ecosystem needs before that protocol ships. Applicable SIG feedback will be incorporated into the specification, with dispositions recorded for feedback not incorporated. Material scope changes are subject to agreement with the Committee.
- A minimal reference lending vault written against that published specification, in a package the pool does not depend on.
- A flash liquidation implementation of the borrower action interface driving the full path, namely borrow, repay debt, receive discounted collateral, sell, repay principal plus fee, keep the surplus, in one transaction, on V2 rails, on a real participant.
- Negative tests in which a healthy vault, and collateral discounted insufficiently to cover principal plus fee, each reject the entire transaction, leaving every balance unchanged and the liquidator holding nothing.

### Milestone 3: Multi participant measurement and published benchmark report

**Estimated Duration:** 3 weeks

**Focus:** Replace structural arguments with numbers on a real multi participant deployment, so that the remaining single participant conditions of Milestone 1 are lifted and confirmation latency, contention and armed context lifetime are measured rather than argued. This is the most important open question in the work and the deliverable with the widest reuse. Milestone 1 already builds a three participant deployment and publishes a first number from it. This milestone scales that topology to four participants, one role each, and turns the probe into a measurement. It remains the only milestone that measures on a controlled deployment we operate ourselves. The Milestone 5 DevNet exercise, by contrast, runs against infrastructure we do not control.

**Deliverables:**

- A genuinely multi participant deployment, with pool operator, registry, venue and liquidator on separate participants on one synchronizer, and the flash loan green on it.
- An open source benchmark harness reusable by any project measuring multi party atomic asset transfers.
- A published report covering confirmation latency versus number of signatory participants.
- The provisional Milestone 1 number either confirmed or corrected, with the report stating which of the two it did.
- The synchronizer traffic cost of one flash loan submission, compared against the same work done as separate submissions.
- Contention and retry rate per partition under concurrent borrowers.
- The measured lifetime of a pre-armed choice context under realistic DSO tick parameters.
- In that report, the economic envelope stated explicitly: given the measured latency and measured traffic cost of one submission, what price movement or liquidation bonus a Canton flash loan needs to be profitable.
- The report presented to the DeFi Protocols and Liquidity SIG and to the Financial Workflows and Composability SIG.

### Milestone 4: Settlement compatibility test kit

**Estimated Duration:** 2 weeks

**Focus:** Convert the harness into a tool that registry implementers and application authors can both rely on.

**Deliverables:**

- A runnable compatibility test kit under Apache 2.0 that any registry author can execute against their own registry, checking synchronous completion, a pre-armable choice context and a declared context lifetime.
- The two registries already tested, a minimal mock and `AmuletRegistryV2`, shipped as reference passing subjects. Both are test-harness registries, so the kit is also run against at least one registry written outside this project, where one is available to us, with the result published either way, pass or fail.
- A short compatibility profile document.
- Documentation for application authors on what passing does and does not guarantee, including the explicit statement that the standard still permits `Pending` and that a registry may legitimately not pass.
- The kit and the profile presented to the Token Standards and Asset Standards SIG.
- (Optional and unfunded): if that SIG wishes to adopt the profile as a CIP, we will support the process. No funding is attached to that outcome and no milestone depends on it.

### Milestone 5: Production hardening, real fee parameters, and security review

**Estimated Duration:** 2 weeks

**Focus:** Everything between "the mechanism works" and "an institution would put liquidity behind it", closing the zero fee conditions and the standing privacy leak.

**Deliverables:**

- Fee arithmetic under non-zero registry fee parameters, with rounding biased to the pool at the instrument's minimum unit, a borrower side buffer derived from the registry's transfer configuration rather than assumed zero, and a prohibition on dust sized borrows paying zero fee.
- Canton explicit disclosure in place of observer lists, removing the standing visibility of pool and venue balances.
- A published threat model with its open items closed or explicitly accepted.
- An external security review commissioned within this milestone, with scope and quote agreed. The reviewer's own schedule sits outside our control, so the findings and our responses are published on receipt rather than inside the milestone window.
- Operator documentation covering partition sizing, disclosure handling, and what a pool operator can and cannot do, since for liveness a pool operator is trusted and for safety it is not.
- The primitive deployed and exercised on TestNet.

### Milestone 6: Maintenance and adoption window

**Estimated Duration:** 12 months, following Milestone 5

**Focus:** Sustainability. The review process is explicit that a proposal must identify who maintains the work after the grant.

**Deliverables:**

- Twelve months of maintenance, covering SDK, Canton and Token Standard version upgrades, issue triage against a published response commitment, and compatibility updates as the Amulet packages and the V2 standard evolve.
- Integration support for teams adopting the primitive or the compatibility kit.
- A written maintenance handover plan at the end of the window, naming one of three outcomes: continued stewardship, a named successor maintainer, or archival with a clear statement of state.

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone
- Demonstrated functionality or operational readiness
- Documentation and knowledge transfer provided
- Alignment with the RFP items stated under Architectural Alignment

Milestone specific acceptance conditions:

- **Milestone 1:** the pool and borrower action interface are public, the package manifest is published, the full test suite passes on a real participant, and the one command reproduction runs clean. The provisional latency number is published, whatever the number is. A bad number is an accepted outcome here, as it is in Milestone 3.
- **Milestone 2:** the flash liquidation path clears end to end on a real participant, both negative tests reject as designed, and the requirements have gone out to the DeFi Protocols and Liquidity SIG.
- **Milestone 3:** the multi participant deployment is live, and the benchmark report is published with the economic envelope stated and submitted to both SIGs. Whether either SIG grants a presentation slot is not ours to decide, so acceptance turns on submission rather than on the slot.
- **Milestone 4:** the compatibility kit runs clean against both reference registries, the compatibility profile is published, and the kit has been run against at least one registry written outside this project where one was available to us, with that result published either way.
- **Milestone 5:** fee arithmetic holds under non-zero parameters, the privacy leak is closed, the threat model is published with its open items closed or explicitly accepted, and either the primitive is exercised on DevNet or the report explaining why the armed context cannot be configured there is published. The external security review is commissioned within this milestone, with its scope and quote agreed. Its findings and our responses are published on receipt, which may fall after the milestone closes.
- **Milestone 6:** each period's maintenance commitments are delivered and the final handover plan is written.

## Funding

### Total Funding Request

**1,330,000 CC** fixed for development and maintenance, plus a ring-fenced **300,000 CC** ceiling for the external security review, plus up to **1,000,000 CC** adoption based.

The review ceiling is an upper bound. Only the reviewer's accepted quote is drawn against it, and any remainder is never requested.

### Funding Basis

Development and maintenance funding is paid as fixed milestone amounts upon acceptance of the corresponding deliverables. The milestone amounts reflect the scope, complexity, and expected effort required for each milestone and are not time-and-materials charges.
All Canton Coin figures in this proposal assume a rate of **1 CC = €0.10** for budgeting and volatility purposes.
The product manager and an in-house smart contract auditor will contribute in a part time capacity at no additional cost.

### Payment Breakdown by Milestone

- **Milestone 1** (The primitive as a usable library): **340,000 CC**
- **Milestone 2** (Flash liquidation and the published requirements): **200,000 CC**
- **Milestone 3** (Multi participant measurement and benchmark report): **140,000 CC**
- **Milestone 4** (Settlement compatibility test kit): **150,000 CC**
- **Milestone 5** (Production hardening, real fee parameters, threat model): **200,000 CC**. (Not including audit fee).
- **Milestone 6** (Maintenance and adoption window, 12 months): **300,000 CC** total, released quarterly in chunks of **75,000 CC**.

- **External security review:** Ring-fenced, capped at **300,000 CC**, and outside the 1,330,000 CC figure above. Released against a quote submitted to the Committee for approval once Milestone 4 scope is stable, and passed through to the reviewer in full. We take no margin on it, and anything under the cap is not drawn.

### Adoption Based Payments

Up to **1,000,000 CC**, payable only on evidence, in tranches against the outcomes below. Each row unlocks only once the milestone that makes the outcome possible has been accepted.

| Adoption Milestone                                                                                                            | Unlocks after | Amount          | Max Cap | Max Total  | Evidence required                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ----------------------------------------------------------------------------------------------------------------------------- | ------------- | --------------- | ------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| An external lending or vault protocol confirms conformance against the published requirements, or adopts the liquidation path | Milestone 4   | 200,000 CC each | 3       | 600,000 CC | **Conformance branch:** a written assessment from a named technical contact at the protocol, addressed to the Tech & Ops Committee, mapping each published requirement to that protocol's liquidation path, with a pass or fail recorded per requirement. **Adoption branch:** dependency proof resolving to a package identity in the published package manifest, plus the DAR hash, the borrower party identifier, update identifiers for at least one successful flash liquidation executed through the primitive, and the protocol's written confirmation to the Committee. |
| The compatibility kit is run against a registry we did not write the fixture for, by its own authors, with results published  | Milestone 4   | 100,000 CC each | 2       | 200,000 CC | Machine readable kit output recording the kit version and commit, the registry `admin` party and `instrumentId` under test, and per case results. Published by the registry's own authors at a public location, together with a public continuous integration run the Committee can reproduce.                                                                                                                                                                                                                                                                             |
| A party other than Vacuumlabs exercises the primitive on MainNet                                                              | Milestone 5   | 100,000 CC each | 2       | 200,000 CC | MainNet update identifiers for at least one successful four leg borrow, the submitting party identifier, which must be distinct from any Vacuumlabs party, the package identity used resolving to the published package manifest, and written confirmation from a named technical contact at that party.                                                                                                                                                                                                                                                                   |

**The package manifest is the binding artifact.** Milestone 1 publishes a manifest recording, for each release, the package name, version, package identity and DAR SHA-256. That manifest determines whether a claim uses the published packages. Qualifying reuse includes any release in the published manifest lineage, so that a claimant depending on the package by name across an upgrade lineage is not excluded.

**Disclosure of evidence.** A claimant provides the evidence above either publicly with their consent, or privately to the Canton Foundation under confidentiality. In the confidential case, the Foundation confirms qualification to the Committee. Where we are engaged commercially by the claiming organization, that engagement is disclosed to the Committee at the time of claim, and the written confirmation is provided independently by the claimant. The Committee may decline a claim on this basis.

**Not accepted as evidence.** Letters of intent, memoranda of understanding, and stated plans to adopt. Forks or clones with no operating deployment. Use of the primitive by Vacuumlabs or our affiliates, including the reference lending vault we write under Milestone 2.

The third row asks for a MainNet execution by a third party, which is a higher bar than the DevNet exercise Milestone 5 itself delivers: it puts real Canton Coin behind the pool and requires the claimant to run their own validator. It therefore depends on the primitive being deployable on public infrastructure at all. If Milestone 5 finds that the armed context cannot be configured there and instead delivers the report explaining why, the row cannot be claimed and nothing is owed under it.

### Volatility Stipulation

Development (Milestones 1 to 5) is scoped to approximately 17 weeks, which is about 4 months. Should that timeline extend beyond six months due to Committee requested scope changes, any remaining milestones must be renegotiated to account for significant movement against the EUR to CC rate assumed above.

Milestone 6 and the adoption based payments extend past the six month mark by design. Because the grant is denominated in fixed Canton Coin, those components are subject to re-evaluation at the six month mark, on the same terms the Foundation applies to any project exceeding six months.

## Licensing

This proposal document: `CC0-1.0`. All software delivered under it: `Apache-2.0`.

## Team Background

| Name             | Links                                                                                                   | Role                               |
| ---------------- | ------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| Arpit Karnatak   | [CV](https://people.vacuumlabs.com/cv/90e4d3669294235cd92b6e78f0db6c30f2b373525aaa790a37a81dba8a75d7fe) | Smart Contract Engineer            |
| Vladislav Dunaev | [CV](https://people.vacuumlabs.com/cv/1da8bb66b8fd48b77d6d3ab1ff720fe66176441fa038743c7c1d122c2c99bbe5) | Smart Contract Engineer            |
| Boris Hristov    | [CV](https://people.vacuumlabs.com/cv/7ca3b02f0626c586367860c6d1cb80811fee74b3162c95f671cdcd8b56cc7ab8) | Smart Contract Auditor (Unbilled)  |
| Uroš Kočišević   | [CV](https://people.vacuumlabs.com/cv/ec6323f2737c840999667d42c7ca29630e99c942a12a5da2e91df295f3d55d0a) | Product Manager (Unbilled)         |

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
  - _Mitigation:_ a minimal probe in Milestone 1 gives a first number at that milestone's acceptance, and the full curve arrives in Milestone 3. Both measure rather than assume, and a negative result is an accepted outcome in each. A bad number therefore surfaces before the committee pays for the benchmark build, and before the hardening and adoption work.
- **Liquidity or a venue on a separate synchronizer.** A flash loan cannot span synchronizers.
  - _Mitigation:_ pre-flight assignment check, explicit synchronizer pinning on submission, and pre-positioning of pool liquidity per synchronizer, with partitions as the unit. Amulet and the public venues are on the Global Synchronizer, so this affects deliberately private deployments only.
- **Adoption risk.** Adoption depends on parties we do not control.
  - _Mitigation:_ no milestone acceptance depends on a third party action, adoption outcomes pay only from the adoption tranche, and nothing is owed if they do not occur.

## Motivation

Flash liquidity is missing infrastructure, and its absence is felt by liquidators first. Every lending protocol needs liquidators, and a liquidator needs the debt asset at the moment of liquidation. Without flash liquidity, liquidators have to hold the right asset, in the right size, idle, in advance, for every market they intend to cover. This is a structural constraint.

Flash liquidity removes the inventory requirement outright, so the binding constraint becomes who can find a profitable path rather than who is already rich in the right asset. Canton is about to have lending protocols. The Development Fund has approved the [OpenZeppelin Canton Ecosystem Stack](https://github.com/canton-foundation/canton-dev-fund/pull/262), whose Milestone 3 acceptance criteria cover vault creation, deposit and withdrawal, borrow and repay, and credential-gated compliance. Liquidation is not in that acceptance list, and institutional positions are large, which is precisely where the gap between position size and liquidator inventory turns into credit risk.

**Strategic importance.** Canton's differentiator is that authority can be delegated so that one party submits a transaction touching many parties' assets. Flash liquidity is an important exercise of that property. Demonstrating it, measuring what it costs, and giving registries a way to show they support it is a direct investment in Canton's core claim about composability.

## Rationale

**Why a flash liquidity primitive and not a money market.** Pooled liquidity accounting is the largest single body of work in a lending protocol, it would dominate this grant's schedule, and it overlaps funded work already under way on vaults, liquidity pool hooks, DeFi math and venue side pool accounting.

**Why a compatibility kit rather than a new interface.** In our research, we noted that batch settlement already provides standard atomic composition. A new interface would fragment the standard rather than fill a gap.

## References

- [CIP-0056](https://github.com/canton-foundation/cips/blob/main/cip-0056/cip-0056.md)
- [CIP-0112](https://github.com/canton-foundation/cips/blob/main/cip-0112/cip-0112.md)
- [`splice-amulet`, the Amulet packages behind Canton Coin](https://github.com/hyperledger-labs/splice/tree/main/daml/splice-amulet)
- [Canton Token Standard API packages](https://github.com/hyperledger-labs/splice/tree/main/token-standard)
- [`splice-token-standard-v2-test`](https://github.com/hyperledger-labs/splice/tree/main/token-standard/splice-token-standard-v2-test)
- [Token Standard V2 validation notes](https://github.com/hyperledger-labs/splice/blob/main/token-standard/V2_VALIDATION.md)
- [Token Standard V2 on DevNet](https://github.com/hyperledger-labs/splice/blob/main/token-standard/TOKEN_STANDARD_V2_DEVNET.md)
- [Token Standard APIs documentation](https://docs.global.canton.network.sync.global/app_dev/token_standard/index.html)
- [OpenZeppelin Canton Ecosystem Stack](https://github.com/canton-foundation/canton-dev-fund/pull/262)