## Development Fund Proposal: Canton Cross-Domain Settlement (CCDS) Reference Implementation

**Author:** Srikanth  
**Status:** Submitted  
**Created:** 2026-03-19  

---

## Abstract

This proposal requests funding for an open-source reference implementation, in Daml and TypeScript, for orchestrating cross-domain Delivery-versus-Payment (DvP) settlement across independent Canton synchronizer domains.

Canton already provides the protocol primitives required for cross-domain movement through reassignment. The missing layer is application infrastructure: developers still need to design bespoke settlement handshakes, timeout handling, lock semantics, orchestration state, and recovery behavior for each new cross-domain settlement workflow.

The proposed project, **Canton Cross-Domain Settlement (CCDS)**, will provide:

- a reference Daml settlement-capable interface and locking pattern
- a TypeScript orchestrator for `lock -> unassign -> assign -> execute -> return` flows
- persisted recovery logic for stalled or interrupted reassignment
- a minimal reference DvP application and technical documentation

The goal is not to define a universal standard. The goal is to give the Canton ecosystem a reusable, open-source reference pattern for cross-domain DvP settlement.

This proposal is also not starting from zero. An existing prototype already includes a Daml `Lockable` interface, a reference `DvPInstruction` contract, prototype Daml Script scenarios for happy-path and timeout/abort behavior, and a built DAR for the initial reference package. The funded work is therefore about hardening, extending, debugging, and proving the pattern across a real multi-synchronizer orchestration flow rather than inventing the basic settlement primitive from scratch.

---

## Specification

### 1. Objective

The objective is to reduce the application-layer friction of cross-domain settlement in Canton by publishing a concrete reference implementation that other teams can adopt, study, and extend.

The intended outcome is that a Canton team can:

- lock a reference asset leg on one domain
- orchestrate reassignment of that leg to a neutral settlement domain
- match it with a counter-leg from another domain
- execute the DvP swap in one settlement transaction on the neutral domain
- recover safely for documented pre-commit failure cases and complete forward recovery for documented post-commit cases

This proposal is explicitly framed as **ecosystem infrastructure** and a **reference implementation**, not a hosted product, not a formal CIP proposal, and not a universal settlement framework.

### 2. Implementation Mechanics

The project will be delivered as:

- a Daml package for settlement-capable locking and release semantics
- a TypeScript orchestration library for cross-domain settlement state transitions
- recovery logic and checkpoint persistence for interrupted flows
- a minimal reference DvP application and documentation

#### A. Reference Asset Scope

To keep the initial implementation technically credible and immediately useful, the reference scope is limited to:

- **CIP-0056 compliant token paths**
- **Daml Finance holding-style assets**

The project will prove one reference DvP path rather than claim universal support for all asset types and all settlement topologies.

#### B. Neutral Settlement Domain Pattern

The implementation will use a **Neutral Settlement Domain** pattern.

The reference topology therefore includes **three synchronizers**:

- home synchronizer A for the first settlement leg
- home synchronizer B for the counter-leg
- one mutually trusted neutral settlement synchronizer where the DvP exchange is executed

Two counterparties move their settlement legs from their respective home domains to that neutral settlement synchronizer. Once both legs are present there, a single Daml transaction executes the DvP swap. The resulting holdings can then be reassigned back to the parties' preferred domains if needed.

This pattern keeps the core settlement step simple and makes cross-domain orchestration behavior explicit.

#### C. Canonical Settlement Intent

The reference implementation will make the bilateral settlement intent explicit through a canonical instruction object rather than relying on implicit off-ledger matching.

In the prototype this role is already played by a `DvPInstruction` contract. The funded reference version will keep that same architectural idea and document it as the canonical intent object for the flow.

That instruction captures, at minimum:

- the two counterparties
- the neutral settlement synchronizer identifier
- the locked asset references for both legs
- a unique settlement or swap identifier
- timeout data and abort conditions
- the current settlement state needed by the orchestrator to determine the next allowed transition

Both sides lock against the same bilateral intent, and the orchestrator only advances a flow that has already been authorized by that shared instruction model.

#### D. Locking and Custody Model

Assets participating in the settlement handshake are represented through a settlement-capable locking interface so they cannot be concurrently spent or reassigned while the handshake is active.

During the `unassign -> assign` window:

- the participant-controlled orchestrator remains responsible for driving the workflow
- the project does not introduce a hosted settlement operator or external custodian
- the state machine records the in-flight step and the intended next transition

The design goal is safe orchestration, not hidden custody.

#### E. Orchestration Model

The orchestration logic will run in a TypeScript service on participant-controlled infrastructure and interact with Canton through the Ledger API and related application-facing APIs.

For each settlement flow, one orchestrator instance is designated as the active coordinator for advancing the bilateral instruction through its next steps. That coordinator may be operated by either counterparty or by jointly controlled participant-side infrastructure, but it is not a hidden third-party custodian and it does not gain discretionary settlement authority outside the documented state machine.

The authority model is intentionally narrow:

- both counterparties must have authorized the bilateral settlement intent before the orchestrator can act on it
- the orchestrator may drive only the next allowed transition recorded in the instruction and persisted checkpoint state
- neutral-domain execution remains gated by the Daml settlement transaction and does not become a unilateral orchestrator power
- timeout-driven abort behavior is available only for the documented pre-execution cases
- if neutral-domain execution has already committed, the recovery model switches to forward recovery for any remaining return or reassignment steps rather than claiming that the original state can always be restored

The orchestrator is responsible for:

- coordinating lock, reassignment, execution, and return steps
- persisting in-flight settlement checkpoints
- applying deterministic retries where safe
- detecting stalled flows
- triggering the documented recovery transition for the active checkpoint state
- exposing state transitions and logs for operator visibility

#### F. Failure Recovery

The project will include a reference recovery model with two clearly separated cases:

- **pre-commit recovery:** before the neutral-domain DvP transaction has executed, the orchestrator may resume the next safe transition or unwind recoverable flows back toward the source path according to the documented rollback rules
- **post-commit recovery:** after the neutral-domain DvP transaction has executed, the orchestrator must treat the swap as committed and use forward recovery to finish any remaining reassignment or return-to-target steps

If a reassignment or settlement leg cannot complete, for example because the destination synchronizer is unavailable or the participant crashes mid-flow, the orchestrator will recover persisted state on restart and continue according to the last committed checkpoint and the documented recovery case.

The CCDS reference implementation does not claim protocol-level atomicity across the full cross-domain lifecycle. Instead, it provides atomic execution on a neutral settlement domain once both legs have arrived there, combined with an explicit application-layer orchestration and recovery model for reassignment steps before and after execution.

This means the proposal does **not** claim that every failure can be resolved by simply returning both assets to their original home domains. Repair-required reassignment failures and post-commit interruptions are treated as distinct cases with their own documented recovery behavior, operator visibility, and escalation expectations.

#### Explicitly Out of Scope

To keep the project feasible and non-overlapping, the following are explicitly out of scope:

- legacy connectivity such as SWIFT, SEPA, or traditional bank APIs
- bespoke adapters for proprietary institutional platforms
- broad multi-asset adapter coverage beyond the reference path
- frontend dashboard products beyond a minimal reference app
- formal standardization or CIP authorship work
- speculative third-party audit funding in this proposal

### 3. Delivery Readiness

This work is not starting from zero. The current prototype already includes:

- a Daml `Lockable` interface for settlement-capable assets
- a reference `DvPInstruction` contract covering execute and timeout-driven abort behavior
- Daml Script scenarios covering happy-path ownership swap and timeout/abort behavior
- a built DAR for the current reference package
- a narrow prototype centered on one reference DvP path using mock assets

That existing baseline reduces zero-to-one risk for Milestone 1.

At the same time, the current implementation is still intentionally prototype-level. It does **not** yet prove:

- a completed release-grade reference asset path using CIP-0056 and Daml Finance-style assets
- real two-synchronizer reassignment orchestration
- persisted off-ledger checkpoint recovery
- restart-safe compensation behavior in a live orchestrator
- a reusable TypeScript reference library for participant-side coordination
- release-grade validation for every current Daml Script scenario

The funded work therefore focuses on turning an already-existing settlement primitive into a credible reference implementation for real cross-domain orchestration.

### 4. Architectural Alignment

This proposal aligns well with Canton’s “Network of Networks” philosophy because it addresses a problem created by domain fragmentation at the application layer.

It is aligned with Development Fund priorities because it delivers:

- a reusable cross-domain settlement reference pattern
- shared infrastructure for DvP-focused application developers
- a concrete implementation path on top of existing Canton reassignment primitives
- a public-good building block for future DvP and PvP tooling without requiring protocol changes

This is ecosystem infrastructure, not a private hosted service.

### 5. Delivery Feasibility

This proposal is intentionally narrow enough to be built and reviewed:

- one reference settlement pattern
- one reference DvP flow
- one orchestrator state machine
- one documented recovery model with explicit pre-commit rollback and post-commit forward-recovery boundaries
- one reference application and demo

The implementation is technically difficult, but it is bounded. It does not attempt to solve universal cross-domain settlement, legacy connectivity, or institutional productization.

Feasibility is strengthened further by the phased structure:

- Milestone 1 hardens and documents the existing Daml prototype
- Milestone 2 proves happy-path orchestration across the full three-synchronizer reference topology
- Milestone 3 proves restart and compensation behavior
- Milestone 4 packages the pattern for external teams

### 6. Risks and Mitigations

- **Cross-domain failure complexity:** the project limits itself to one reference DvP pattern and a documented recovery model with explicit pre-commit rollback and post-commit forward-recovery boundaries rather than claiming universal settlement guarantees.
- **Asset-path diversity:** the first release targets one reference path using CIP-0056 and Daml Finance-style assets instead of broad adapter coverage.
- **Operational fragility:** the orchestrator persists checkpoints and explicitly models restart recovery and stalled reassignment handling.
- **Security scope:** this proposal includes internal hardening through documented state-machine invariants and adversarial scenarios, but excludes speculative third-party audit funding until the code and reference path stabilize.

### 7. Backward Compatibility

No backward compatibility impact.

This project is additive. It introduces a new reference implementation and supporting client library without requiring protocol changes or changes to Canton core behavior.

---

## Milestones and Deliverables

### Milestone 1: Hardened Settlement-Capable Daml Interface

- **Estimated Delivery:** 5 weeks
- **Focus:** turn the existing Daml prototype into a documented reference settlement primitive
- **Deliverables / Value Metrics:**
  - a Daml package containing a hardened reference settlement-capable interface and locking pattern for reference assets
  - timeout and release semantics for bilateral lock flows
  - passing Daml Script scenarios for happy-path lock/settle and timeout/abort behavior
  - replacement of the current mock-asset prototype path with the stated reference asset scope or clearly documented adapter boundaries for that scope
  - implementation notes documenting the reference asset assumptions and guarantees
  - value metric: the reference Daml package builds cleanly and its published scripts prove deterministic lock, settle, and release behavior for the stated reference path

### Milestone 2: TypeScript Cross-Domain Orchestrator

- **Estimated Delivery:** 8 weeks
- **Focus:** automate the happy-path cross-domain movement across the full three-synchronizer reference topology
- **Deliverables / Value Metrics:**
  - a TypeScript orchestration library implementing the reassignment state machine
  - support for the `lock -> unassign -> assign -> execute -> return` flow across three local synchronizers representing two home domains and one neutral settlement domain
  - persisted in-flight state and structured logs for each transition
  - local three-synchronizer sandbox scenarios for the reference path
  - value metric: the orchestrator completes the documented happy-path DvP flow across the full reference topology with no manual command intervention after workflow start

### Milestone 3: Recovery and Compensation Logic

- **Estimated Delivery:** 8 weeks
- **Focus:** handle unhappy-path settlement states safely
- **Deliverables / Value Metrics:**
  - stalled reassignment detection
  - restart checkpoint recovery
  - rollback-to-source logic for documented recoverable pre-commit failure cases
  - forward-recovery handling for documented post-commit interruption cases
  - adversarial scenarios covering interrupted settlement and restart handling
  - value metric: interrupted flows can be resumed, rolled back in documented pre-commit cases, or advanced through documented post-commit forward recovery according to the published recovery model after orchestrator restart

### Milestone 4: Reference DvP App and Technical Documentation

- **Estimated Delivery:** 4 weeks
- **Focus:** make the reference pattern usable by other teams
- **Deliverables / Value Metrics:**
  - a minimal reference DvP application showing a swap between a Daml Finance-style asset and a CIP-0056 token path
  - technical documentation for the bilateral settlement intent, coordinator authority model, state machine, and recovery model
  - API documentation and implementation notes for integrators
  - a recorded demo showing the reference flow end to end across the full three-synchronizer topology
  - value metric: an external team can understand the reference flow, guarantees, and limitations without reading implementation code first

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- a Daml package implementing the settlement-capable locking and release pattern for the reference asset scope
- Daml Script scenarios proving deterministic timeout and release behavior
- successful automated reassignment orchestration across three local synchronizers representing two home domains and one neutral settlement domain, with no manual command intervention during the happy path
- persisted checkpoint and restart recovery behavior demonstrated in the orchestrator
- stalled reassignment detection and the documented recovery behavior demonstrated in the reference environment
- a minimal reference DvP application running against the published implementation
- documentation covering the state machine, settlement handshake, failure handling, and reference integration assumptions
- the project being released as open source

Project-specific acceptance conditions:

- the project must remain a reference implementation, not broaden into a universal settlement platform
- the initial release must stay within the stated reference asset scope
- recovery behavior must be documented clearly enough that external teams can understand the guarantees and limitations
- the published documentation must distinguish clearly between recoverable pre-commit rollback cases and post-commit forward-recovery cases
- the published documentation must define the bilateral settlement intent object and the coordinator authority model used by the orchestrator
- the published deliverables must distinguish clearly between what is already prototyped in Daml and what is newly delivered in orchestrator and recovery layers

---

## Funding

**Total Funding Request:** 3,200,000 CC

### Payment Breakdown by Milestone

- Milestone 1 _(Hardened Settlement-Capable Daml Interface)_: 700,000 CC upon committee acceptance
- Milestone 2 _(TypeScript Cross-Domain Orchestrator)_: 1,000,000 CC upon committee acceptance
- Milestone 3 _(Recovery and Compensation Logic)_: 1,000,000 CC upon committee acceptance
- Milestone 4 _(Reference DvP App and Technical Documentation)_: 500,000 CC upon final release and acceptance

### Funding Rationale

- Milestone 1 is priced lower than the later milestones because the core Daml primitive already exists in prototype form, but it still includes meaningful work to finish release-grade scripts, harden semantics, and move beyond the current mock-asset prototype path.
- Milestone 2 is one of the hardest parts of the project because it turns the settlement primitive into a real cross-domain orchestration workflow across two synchronizers.
- Milestone 3 is priced similarly to Milestone 2 because restart-safe recovery and compensation behavior is the main operational-risk reducer in the full reference implementation.
- Milestone 4 is smaller because it packages and explains the now-proven reference flow rather than inventing a new technical layer.
- No recurring maintenance or hosted-service budget is requested in this proposal.

### Volatility Stipulation

If the project duration extends beyond 6 months due to Committee-requested scope changes, remaining milestones should be renegotiated for material CC/USD volatility.

No speculative third-party audit funding is requested in this proposal. If external review is later justified, a follow-on proposal can request scoped security review funding once implementation details stabilize.

---

## Maintenance and Evolution

The initial grant funds the reference implementation, documentation, and public release. After release, the project will be maintained in the open through normal repository-based contribution workflows, issue tracking, and versioned releases.

The intended long-term path is to keep the implementation aligned with evolving Canton reassignment practices, token-standard usage, and reference settlement patterns. If appropriate and accepted by maintainers, the project may later be upstreamed into a broader Foundation-aligned open-source repository such as `hyperledger-labs/splice` or another suitable ecosystem home.

If upstreaming is not immediately appropriate, the project will remain in a public standalone repository with clear version compatibility notes, contribution guidelines, and release documentation so that external teams can adopt and extend it with minimal friction.

### High-Level Architecture

CCDS is designed as a narrow reference implementation with three layers:

- a Daml settlement-capable locking layer for reference assets
- a participant-side TypeScript orchestrator that drives reassignment and settlement steps
- a reference multi-domain sandbox used to validate the end-to-end flow

At a high level, each counterparty first locks its settlement leg on its home domain. The orchestrator then reassigns both legs to a neutral settlement domain, where the DvP exchange is executed in a single settlement-domain transaction. After execution, the resulting assets are reassigned back to the counterparties’ target domains.

The implementation includes persisted checkpoints and restart recovery so interrupted flows can either resume safely, roll back documented pre-commit cases toward their source path, or complete documented post-commit forward-recovery according to the published recovery model.

The initial release is intentionally limited to one reference DvP path across three synchronizers using CIP-0056 token paths and Daml Finance-style assets.

## Team Background

### BitDynamics

BitDynamics brings deep experience in building and operating blockchain infrastructure. The team has worked across Ethereum client infrastructure, validator operations, and production-grade hosting systems supporting validator infrastructure securing more than 2 billion AUD in assets. This background is directly relevant to building reliable, auditable, and security-conscious public infrastructure for a grants program. Team is also building actively on Canton. 

## Co-Marketing

Upon release, the implementing entity will collaborate with the Foundation on:

- announcement coordination
- a short technical write-up explaining the reference settlement handshake and recovery model
- one developer-facing walkthrough or demo

Specific commitments:

- publish integration guidance for teams evaluating the reference pattern
- publish at least one end-to-end example showing the reference DvP flow

---

## Motivation

Canton’s value proposition is not only privacy or institutional messaging. It is the ability to support coordination across independently operated domains.

But if every application team must build cross-domain settlement orchestration from scratch, the network-of-networks model remains unnecessarily expensive to use in practice.

A reference implementation for cross-domain DvP settlement would give the ecosystem:

- a common starting point for inter-domain asset exchange
- safer and more consistent reassignment handling
- a concrete recovery model for interrupted settlement flows
- lower engineering cost for future Canton applications dealing with fragmented domain liquidity

This makes CCDS a strong candidate for Development Fund support as a reusable open-source infrastructure contribution.

---

## Rationale

This proposal is intentionally scoped as a reference implementation rather than a universal settlement standard.

That discipline matters for three reasons:

- cross-domain settlement is operationally complex, so the first public-good deliverable should prove one reference DvP path well
- the ecosystem benefits more from a reusable open-source handshake and recovery pattern than from a broad but weakly verified SDK claim
- keeping the initial implementation narrow reduces overlap with broader SDK, dApp API, and institutional product proposals already under discussion

The project is therefore designed to give Canton builders a practical starting point for cross-domain DvP orchestration without claiming to solve every asset path, every settlement topology, or every production integration concern in one proposal.
