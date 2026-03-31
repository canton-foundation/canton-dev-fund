## Development Fund Proposal: Canton Cross-Domain Messaging (CCDM) -- Native Message Capsule Reference Implementation

**Author:** blackthornlover <h@bitdynamics.me>, Zhe Li <zhe@bitdynamics.me>, Srikanth Yeleswarapu <srikanth@bitdynamics.me>
**Implementing Entity:** Bitdynamics
**Status:** Submitted
**Created:** 2026-03-19

---

## Abstract

This proposal requests funding for an open-source reference implementation, in Daml and TypeScript, for native cross-domain workflow messaging across Canton synchronizer domains.

Canton already provides protocol-native contract reassignment between synchronizers. What is still missing for application builders is a reusable pattern for cases where a business workflow on one synchronizer must safely and asynchronously trigger a workflow, inbox event, or receipt on another synchronizer without degrading the trust model through external witness bridges and without forcing the original business contract itself to move.

The proposed project, **Canton Cross-Domain Messaging (CCDM)**, will provide:
- a reference Daml channel policy and message-capsule model
- a TypeScript automation toolkit for `publish -> reassign -> activate -> consume -> receipt` flows
- persisted recovery logic for interrupted or duplicated automation activity
- a minimal reference application and technical documentation

The goal is not to define a universal bridge protocol, not to run a hosted relay service, not to claim protocol-level atomicity for asynchronous workflows, and not to replace native Canton composition when an all-or-nothing transaction is possible. The goal is to give the Canton ecosystem a reusable, open-source reference pattern for **native, reassignment-based cross-domain workflow messaging**.

---

## Specification

### 1. Objective

The objective is to reduce the application-layer friction of cross-domain coordination in Canton by publishing a concrete reference implementation that other teams can adopt, study, and extend.

The intended outcome is that a Canton team can:
- publish a message capsule on a source synchronizer
- reassign that capsule to a target synchronizer using Canton-native reassignment
- activate and consume that capsule exactly once on the target synchronizer under channel policy
- create a target-side delivered or rejected receipt
- optionally return a delivery receipt back to the source synchronizer
- recover safely if an automation worker crashes or retries the same work

This proposal is explicitly framed as **ecosystem infrastructure** and a **reference implementation**, not a hosted bridge operator, not a protocol change proposal, and not a universal messaging standard.

### 2. Implementation Mechanics

The project will be delivered as:
- a Daml package for channel policy, message capsules, delivered messages, rejected messages, and delivery receipts
- a TypeScript automation library for cross-domain messaging state transitions
- recovery logic and checkpoint persistence for interrupted flows
- a minimal reference application and documentation

#### A. Architecture Selection Guide

The proposal is intentionally designed to sit below more ambitious bridge claims and beside Canton's native composition features.

Use **Global Synchronizer atomic composition** when:
- the workflow requires all-or-nothing commit semantics
- a single Canton transaction can naturally express the end-to-end business action
- the source-side state must not move unless the target-side state transition also commits

Use **direct reassignment of the live business contract** when:
- the target synchronizer should receive the same live object, not merely a message derived from it
- ownership or control of the contract itself is what must move cross-domain

Use **CCDM message capsules** when:
- the original business contract should remain where it is
- the target synchronizer needs an asynchronous workflow trigger, inbox item, or receipt
- eventual consistency is acceptable and explicitly documented
- the source-side business logic does not assume target-side success as part of one atomic commit

This proposal therefore does **not** present cross-domain messaging as a replacement for native Canton composition. It presents it as the narrower control-plane pattern that remains after native atomic composition and direct contract reassignment have been considered first.

#### B. Reference Channel Scope

To keep the initial implementation technically credible and reviewable, the reference scope is limited to:
- one ordered point-to-point message lane between two synchronizers
- one source-to-target message capsule flow
- one optional reverse receipt lane back to the source synchronizer
- typed reference payloads plus a payload hash for reproducibility
- one target-side delivery model that produces a delivered or rejected message artifact, not arbitrary workflow execution

The project will prove one reference messaging path rather than claim universal support for all message topologies, arbitrary multicast, or large-payload transport.

#### C. Channel Policy and Message Capsule Primitive

The reference implementation will define an explicit **MessageChannelPolicy** and **MessageCapsule** so cross-domain delivery is bound to concrete on-ledger artifacts rather than inferred informally.

`MessageChannelPolicy` will capture, at minimum:
- `channelId`
- `policyVersion`
- `sourceSynchronizerId`
- `targetSynchronizerId`
- authorized sender role or party set
- authorized recipient role or consumer party set
- ordering rules for the lane
- expiry and timeout rules
- whether reverse receipts are required
- return or rejection behavior for undeliverable capsules

`MessageCapsule` will capture, at minimum:
- `channelId`
- `policyVersion`
- `messageId`
- `sequenceNo`
- `sender`
- intended recipient or consumer role
- `payloadType`
- canonical typed payload
- `payloadHash`
- `sourceReference`
- `expiry`
- `receiptRequired`

The deduplication and exactly-once acceptance key for the reference path is the tuple:
- `channelId`
- `policyVersion`
- `sequenceNo`
- `messageId`
- `payloadHash`

#### D. Native Delivery Model

The reference happy path is:
1. A sender publishes a `MessageCapsule` on the source synchronizer under a `MessageChannelPolicy`.
2. The automation toolkit performs a Canton-native reassignment of that capsule from the source synchronizer to the target synchronizer.
3. Once the capsule is active on the target synchronizer, target-side automation observes it through the ledger event stream and performs deterministic validation.
4. The target-side consumption step archives the active capsule and creates exactly one of:
   - `DeliveredMessage`
   - `RejectedMessage`
5. If the lane requires a receipt, the target side creates a receipt artifact that is propagated back over the reverse lane using the same reassignment-based pattern.

The design goal is:
- protocol-native transport of the message capsule
- target-side exactly-once acceptance for a given capsule identity
- explicit delivered, rejected, expired, or returned outcomes

The design goal is **not** atomic multi-domain execution. Source-side business logic must treat the message capsule as a separate asynchronous control-plane object, not as proof that the target-side workflow has already succeeded.

#### E. Automation and Event-Driven Processing Model

Because Daml contracts are passive and do not execute independently, the reference implementation will include state-triggered off-ledger automation. That automation will:
- subscribe to the participant ledger event stream for relevant creations and archival events
- perform reassignment and target-side processing as retriable tasks
- use bounded parallelism and explicit idempotency keys
- persist checkpoints for transport, activation, consumption, and receipt steps
- archive trigger contracts during subsequent command processing where the reference state machine requires it

The reference automation model is intentionally modular:
- one source-side publication or reassignment task
- one target-side activation or consumption task
- one optional receipt task

Correctness must remain in the Daml model and lane-state rules, not in off-ledger worker memory.

#### F. Recovery and Failure Handling

The project will include a reference recovery model for:
- process crashes before or after reassignment submission
- duplicated automation attempts
- target-side rejection due to policy or business validation
- expired capsules
- out-of-order sequence attempts
- receipt retries

The toolkit will persist:
- source publication state
- reassignment submission state
- target activation and processing state
- receipt state

On restart, the toolkit will recover persisted state and either:
- continue the next safe transition
- converge the capsule to `Delivered`
- converge the capsule to `Rejected`
- converge the capsule to `Expired`
- return the capsule or issue a failure receipt according to channel policy

The CCDM reference implementation does not claim protocol-level atomicity for asynchronous workflows. Instead, it provides a documented application-layer pattern built on native reassignment, explicit lane policy, replay protection, ordering rules, and recovery behavior.

#### Explicitly Out of Scope

To keep the project feasible and non-overlapping, the following are explicitly out of scope:
- atomic settlement or DvP across domains
- protocol changes to Canton
- external witness committees or attestation bridges
- hosted relay or messaging services
- permissionless relay economics or marketplace design
- arbitrary large-payload storage or file transport
- generic arbitrary workflow execution on the target side
- bespoke banking or enterprise adapter integrations
- frontend dashboard products beyond a minimal reference app
- speculative third-party audit funding in this proposal

### 3. Architectural Alignment

This proposal aligns with Canton's network-of-networks philosophy because it addresses a real application-layer coordination problem while staying inside protocol-native transport semantics.

It is aligned with Development Fund priorities because it delivers:
- a reusable cross-domain messaging reference pattern
- shared infrastructure for multi-synchronizer application developers
- a concrete implementation path on top of existing Canton reassignment and application APIs
- a public-good building block for inbox delivery, receipts, and cross-domain workflow coordination

This is ecosystem infrastructure, not a private hosted bridge service.

### 4. Delivery Readiness

This proposal does not yet rely on a public prototype. That is exactly why the architecture is intentionally narrower than the earlier witness-based draft. The initial reference path is restricted to:
- two synchronizers
- one ordered lane
- one message capsule primitive
- one target-side delivery artifact
- one optional reverse receipt

This keeps the first implementation reviewable and makes the early milestones easy to verify.

### 5. Delivery Feasibility

This proposal is intentionally narrow enough to be built and reviewed:
- one reference message lane
- one explicit channel policy primitive
- one explicit message capsule primitive
- one reassignment-driven automation flow
- one optional receipt path
- one reference application and demo

The implementation is technically meaningful, but bounded. It does not attempt to solve universal messaging, protocol-native atomic composition, external witness verification, or enterprise productization.

### 6. Risks and Mitigations

- **Incorrect tool selection:** the proposal explicitly distinguishes between native atomic composition, direct business-contract reassignment, and message-capsule delivery so teams do not misuse it for DvP or other all-or-nothing workflows.
- **Duplicate and out-of-order processing:** the target-side lane model enforces sequencing, replay protection, and idempotent acceptance.
- **Operational fragility:** the automation toolkit persists checkpoints and explicitly models restart recovery and retry-safe behavior.
- **Target-side rejection ambiguity:** the reference model includes `RejectedMessage` and receipt semantics so failures converge to an auditable state rather than disappearing off-ledger.
- **Scope creep:** the first release is limited to one ordered point-to-point lane and one optional receipt flow.
- **Security scope:** this proposal includes documented invariants, adversarial scenarios, and an automation threat-model write-up, but excludes speculative third-party audit funding until the reference path stabilizes.

### 7. Backward Compatibility

No backward compatibility impact. This project is additive. It introduces a new reference implementation and supporting library without requiring protocol changes or changes to Canton core behavior.

---

## Milestones and Deliverables

### Milestone 1: Channel Policy and Message Capsule Daml Primitives
- **Estimated Delivery:** 5 weeks
- **Adoption Goal:** At least one Canton multi-synchronizer application team has reviewed the `MessageChannelPolicy` and `MessageCapsule` primitives, confirmed that the native reassignment-based delivery model is applicable to their cross-domain coordination requirement, and provided written feedback incorporated into the published implementation.
- **Deliverables / Adoption Criteria:**
  - a Daml package containing `MessageChannelPolicy`, `MessageCapsule`, `DeliveredMessage`, `RejectedMessage`, and `DeliveryReceipt` patterns for the reference scope, reviewed by at least one external Canton developer who confirmed the primitives address their cross-domain messaging need
  - sequence and replay-protection rules for the ordered lane, confirmed correct by at least one reviewer who has tested publish, expiry, and exactly-once acceptance scenarios
  - Daml Script scenarios for publish, expiry, rejection, receipt, and exactly-once target acceptance, with at least one external team confirming the scenario outcomes match their expected behavior
  - written confirmation from at least one Canton team that the architecture-selection guide correctly identifies when message capsules should be used instead of atomic composition or direct business-contract reassignment

### Milestone 2: Reassignment Automation Toolkit
- **Estimated Delivery:** 7 weeks
- **Adoption Goal:** At least one Canton multi-synchronizer team has deployed the TypeScript automation toolkit against a real (non-sandbox) Canton environment with two synchronizers and confirmed that the happy-path `publish -> reassign -> activate -> consume` flow completes without manual command intervention.
- **Deliverables / Adoption Criteria:**
  - a TypeScript automation library implementing the `publish -> reassign -> activate -> consume` state machine, deployed and confirmed working against a real Canton environment by at least one external team
  - two-synchronizer ordered lane support confirmed by at least one operator who has run the reference path end to end in a non-sandbox environment
  - persisted checkpoints and structured logs confirmed legible and useful by at least one operator who has used them to trace a delivery flow
  - local two-synchronizer sandbox scenarios confirmed reproducible by at least one developer following the published documentation without prior knowledge of the implementation

### Milestone 3: Recovery, Idempotency, and Reverse Receipt Logic
- **Estimated Delivery:** 6 weeks
- **Adoption Goal:** At least one Canton multi-synchronizer team has tested one or more recovery scenarios — restart, duplicate processing, or target-side rejection — in a real or simulated environment and confirmed that the implementation converges to the expected `Delivered`, `Rejected`, or `Expired` state without manual intervention.
- **Deliverables / Adoption Criteria:**
  - restart checkpoint recovery confirmed working by at least one operator who has deliberately interrupted and restarted the automation toolkit and observed correct state resumption
  - duplicate and out-of-order processing handling confirmed by at least one team that has tested duplicate submission behavior and verified exactly-once delivery semantics
  - expiry, rejection, and return behavior for the ordered lane confirmed correct by at least one reviewer who has tested a failed delivery path end to end
  - optional reverse receipt lane confirmed working by at least one operator who has enabled receipts and verified delivery confirmation back to the source synchronizer
  - adversarial scenarios (interrupted automation, duplicate processing, target-side rejection) reviewed and confirmed realistic by at least one external team

### Milestone 4: Reference App and Technical Documentation
- **Estimated Delivery:** 4 weeks
- **Adoption Goal:** At least three independent Canton application or operator teams have adopted or reviewed some portion of the reference implementation — primitives, automation toolkit, or documentation — and the project has been publicly released with documented adoption evidence so that future teams can start from a validated, community-reviewed baseline.
- **Deliverables / Adoption Criteria:**
  - a minimal reference application confirmed working end-to-end by at least one external team who has deployed it against their own Canton environment
  - technical documentation reviewed and confirmed complete by at least one integrator who has followed it to build a cross-domain messaging integration without prior knowledge of the CCDM implementation
  - at least three independent adoption confirmations documented in the public repository (team testimonials, linked deployments, or recorded integration walkthroughs)
  - the full reference package — Daml primitives, automation toolkit, reference app, and documentation — released as open source under a permissive license
  - a recorded end-to-end demo showing a message capsule published on one synchronizer and delivering a confirmed artifact on another, usable as an onboarding reference for future Canton cross-domain application builders

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:
- a Daml package implementing the channel-policy, message-capsule, delivery, rejection, and receipt pattern for the reference scope
- Daml Script scenarios proving deterministic publish, expiry, rejection, sequencing, and replay-protection behavior
- successful automated reassignment-based delivery across two local synchronizers with no manual command intervention during the happy path
- target-side exactly-once acceptance demonstrated under duplicate automation attempts for the same capsule
- ordered-lane rejection, expiry, and return behavior demonstrated in the reference environment
- persisted checkpoint and restart recovery behavior demonstrated in the automation toolkit
- optional reverse-receipt behavior demonstrated when enabled in the reference app
- a minimal reference application running against the published implementation
- documentation covering the state machine, failure handling, integration assumptions, and architecture-selection guidance
- the project being released as open source

Project-specific acceptance conditions:
- the project must remain a reference implementation, not broaden into a hosted service or claim universal cross-domain messaging
- the initial release must stay within the stated reference channel scope
- the documentation must clearly state that message capsules are not a replacement for native atomic composition
- the documentation must clearly state that source-side workflows must not assume target-side success as part of the same atomic business outcome

---

## Funding

**Total Funding Request:** 1,800,000 CC

### Payment Breakdown by Milestone
- Milestone 1 _(Channel Policy and Message Capsule Daml Primitives)_: 550,000 CC upon committee acceptance
- Milestone 2 _(Reassignment Automation Toolkit)_: 600,000 CC upon committee acceptance
- Milestone 3 _(Recovery, Idempotency, and Reverse Receipt Logic)_: 500,000 CC upon committee acceptance
- Milestone 4 _(Reference App and Technical Documentation)_: 350,000 CC upon final release and acceptance

### Funding Rationale
- Milestone 1 is intentionally smaller because it defines the core Daml model and proves the native message-capsule primitive before broader automation is funded.
- Milestone 2 is the largest because automation, reassignment orchestration, sandbox setup, and operational checkpoints are the hardest engineering layer in the first release.
- Milestone 3 funds the main operational-risk reducer: restart recovery, idempotency, rejection handling, and reverse receipts.
- Milestone 4 is smaller because it packages and explains the now-proven reference flow rather than inventing a new technical layer.
- No hosted-service budget is requested in this proposal.

### Volatility Stipulation

If the project duration extends beyond 6 months due to Committee-requested scope changes, remaining milestones should be renegotiated for material CC/USD volatility. No hosted service budget or speculative third-party audit budget is requested in this proposal. If a later stage justifies external review, a follow-on proposal can request scoped security review funding once implementation details stabilize.

---

## Maintenance and Evolution

The initial grant funds the reference implementation, documentation, and public release. After release, the project will be maintained in the open through normal repository-based contribution workflows, issue tracking, and versioned releases.

The intended long-term path is to keep the implementation aligned with evolving Canton multi-synchronizer practices and application-layer workflow patterns.

If appropriate and accepted by maintainers, the project may later be upstreamed into a broader Foundation-aligned open-source repository or another suitable ecosystem home. If upstreaming is not immediately appropriate, the project will remain in a public standalone repository with clear version compatibility notes, contribution guidelines, and release documentation so that external teams can adopt and extend it with minimal friction.

### High-Level Architecture

CCDM is designed as a narrow reference implementation with three layers:
- a Daml channel-policy and message-capsule layer for source and target synchronizers
- a participant-side TypeScript automation toolkit that drives publication, reassignment, activation, consumption, and receipt steps
- a reference multi-domain sandbox used to validate the end-to-end flow

At a high level, a sender first publishes a `MessageCapsule` on a source synchronizer. The automation toolkit reassigns that capsule to the target synchronizer using Canton-native reassignment. Once active on the target synchronizer, the capsule is consumed exactly once into either a `DeliveredMessage` or `RejectedMessage`. If configured, a reverse-lane `DeliveryReceipt` is then propagated back to the source synchronizer.

The implementation includes persisted checkpoints and restart recovery so interrupted flows can either resume safely or converge to a documented delivered, rejected, expired, or returned state according to channel policy.

The initial release is intentionally limited to one ordered message lane across two synchronizers with an optional reverse receipt lane.

## Co-Marketing

Upon release, the implementing entity will collaborate with the Foundation on:
- announcement coordination
- a short technical write-up explaining the native message-capsule model and its correct use boundaries
- one developer-facing walkthrough or demo

Specific commitments:
- publish integration guidance for teams evaluating the reference pattern
- publish at least one end-to-end example showing the reference messaging flow

---

## Motivation

Canton's value proposition is not only privacy or asset movement. It is also the ability to support coordination across independently operated synchronizers. But if every application team must design its own cross-domain control-plane logic, reassignment automation, replay protection, receipt semantics, and recovery behavior from scratch, the network-of-networks model remains unnecessarily expensive and risky to use in practice.

A reference implementation for native cross-domain messaging would give the ecosystem:
- a common starting point for cross-synchronizer workflow coordination
- safer and more consistent asynchronous delivery semantics
- a protocol-native alternative to external witness or bridge patterns
- lower engineering cost for future Canton applications that need source-domain activity to trigger target-domain workflows without moving the original business contract

This makes CCDM a stronger candidate for Development Fund support than the earlier witness-based design because it stays inside Canton-native transport semantics and acknowledges more clearly when native atomic composition should be used instead.

---

## Rationale

This proposal is intentionally scoped as a native message-capsule reference implementation rather than a universal bridge or protocol-standard effort. That discipline matters for three reasons:
- if a workflow needs all-or-nothing cross-domain commit, it should use native atomic composition rather than asynchronous messaging
- if a workflow needs the live business contract itself to move domains, it should use direct reassignment of that contract rather than a derived message layer
- when asynchronous workflow messaging is still needed, the first public-good deliverable should prove one protocol-native control-plane pattern well instead of degrading trust assumptions through an external witness architecture

The project is therefore designed to give Canton builders a practical starting point for cross-domain messaging without claiming to solve every topology, every payload type, or every production coordination requirement in one proposal.
