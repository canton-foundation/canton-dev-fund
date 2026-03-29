## Development Fund Proposal: Canton Cross-Domain Settlement (CCDS) Reference Implementation

- **Author:** Srikanth 
- **Status:** Submitted  
- **Created:** 2026-03-19  

---

## Abstract

This proposal requests funding for an open-source reference implementation, in Daml and TypeScript, for orchestrating cross-domain Delivery-versus-Payment (DvP) settlement across independent Canton synchronizer domains.

Canton already provides reassignment and the primitives needed for cross-domain movement. What is still missing for most application teams is the application-layer settlement infrastructure: locking semantics, bilateral settlement intent, orchestration state, timeout handling, restart behavior, and recovery boundaries.

CCDS will provide a reusable reference pattern rather than a hosted product or universal settlement platform. The deliverables include:

- a Daml settlement-capable locking interface and canonical settlement instruction
- a TypeScript orchestrator for `lock -> unassign -> assign -> execute -> return`
- persisted checkpoints, restart recovery, and documented pre/post-commit behavior
- a bounded reference suite of asset paths, including local `Lockable` assets, CIP-0056 / Daml Finance-style adapter paths, Splice / `HoldingV1` / `Amulet` style paths, and a bridge-backed Canton Coin / DA Utility reference flow
- a minimal reference app, reviewer-friendly demos, and integration documentation

The goal is to lower the cost of building cross-domain DvP on Canton by giving the ecosystem an open reference implementation that teams can evaluate, adopt, and extend.

---

## Specification

### 1. Objective

The objective is to reduce the application-layer friction of cross-domain settlement in Canton by publishing a concrete reference implementation that other teams can run, study, and adapt.

The intended outcome is that a Canton team can:

- lock a settlement leg on one synchronizer
- reassign both legs to a neutral settlement synchronizer
- execute the DvP swap in one settlement-domain transaction
- handle documented pre-commit abort cases safely
- complete documented post-commit forward recovery after interruptions

The project is explicitly positioned as ecosystem infrastructure and a reference implementation, not a universal standard, hosted operator, or production settlement product.

### 2. Implementation Mechanics

The project will be delivered as:

- a Daml package for settlement-capable locking and release semantics
- a TypeScript orchestration library for cross-domain settlement state transitions
- checkpoint persistence and recovery logic for interrupted flows
- bridge helpers for the included Canton Coin / DA Utility reference flow
- a minimal reference DvP app, demo scripts, and technical documentation

The reference topology uses a Neutral Settlement Domain pattern with three synchronizers:

- home synchronizer A for the first leg
- home synchronizer B for the counter-leg
- one mutually trusted neutral settlement synchronizer for atomic DvP execution

The implementation will make bilateral settlement intent explicit through a canonical instruction object. That instruction records, at minimum:

- the two counterparties
- the neutral settlement synchronizer identifier
- the locked asset references for both legs
- a unique settlement identifier
- timeout and abort data
- the current settlement state used by the orchestrator

The orchestrator runs on participant-controlled infrastructure and has deliberately narrow authority:

- it can act only on already-authorized bilateral settlement intent
- it may drive only the next allowed transition recorded in the instruction and checkpoint state
- neutral-domain execution remains gated by the Daml settlement transaction
- pre-execution timeouts may abort only the documented rollback-safe cases
- after execution commits, recovery switches to forward recovery rather than pretending the original state can always be restored

The reference asset scope is intentionally bounded to a small set of representative paths:

- a local reference `Lockable` asset path
- CIP-0056 compliant token paths represented through a reference adapter pattern
- a Daml Finance-style holding adapter path
- a Splice / `HoldingV1` / `Amulet` style adapter path, including a bridge-backed Canton Coin reference flow

Where CCDS includes adapter paths, it is proving the integration pattern and coordinator behavior. It does not promise direct drop-in compatibility with every deployed external package line. Broader package-specific direct integrations outside the included reference paths are future work and may be proposed separately after the reference implementation has been evaluated in the ecosystem.

Out of scope for this grant:

- legacy connectivity such as SWIFT, SEPA, or bank APIs
- bespoke adapters for proprietary institutional platforms
- broad multi-asset adapter coverage beyond the included reference paths
- frontend dashboard products beyond a minimal reference app
- formal standardization or CIP authorship work
- direct drop-in integration with every external Daml Finance package line
- speculative third-party audit funding

If evaluation or implementation findings show that a later milestone requires materially different effort than expected, the team may return to the Committee with a scoped amendment request rather than silently broadening scope.

### 3. Architectural Alignment

This proposal aligns with Canton’s Network of Networks model because it addresses a coordination problem created by domain fragmentation at the application layer rather than requiring protocol changes.

It is aligned with Development Fund priorities because it delivers:

- a reusable cross-domain settlement reference pattern
- shared infrastructure for DvP-oriented application developers
- a concrete implementation path on top of Canton reassignment primitives
- a public-good foundation for future DvP and PvP tooling

The included reference suite is intentionally limited to representative paths that make the pattern concrete while still keeping CCDS within reference-implementation scope.

### 4. Backward Compatibility

*No backward compatibility impact.*

This project is additive. It introduces a new reference implementation and supporting client library without requiring protocol changes or changes to existing Canton core behavior.

---

## Milestones and Deliverables

### Milestone 1: _(Public Alpha for the CCDS Reference Suite)_
- **Estimated Delivery:** 4-6 weeks from project start  
- **Focus:** Publish the first public alpha for the supported CCDS reference suite and make the happy path easy for external teams to review.  
- **Deliverables / Value Metrics:**  
  - published alpha release of the Daml settlement contracts and TypeScript orchestrator  
  - local three-synchronizer reference environment  
  - proof scenarios for deterministic lock, timeout, release, and execute behavior  
  - included reference asset paths documented and runnable  
  - reviewer-friendly happy-path demos, including the bridge-backed Canton Coin reference flow  

### Milestone 2: _(Evaluation-Ready Package for the Reference Happy Paths)_
- **Estimated Delivery:** 2-4 weeks after Milestone 1  
- **Focus:** Publish an evaluation-ready package for the happy path so external teams can review, run, and comment on the reference implementation.   
- **Deliverables / Value Metrics:**  
  - reviewer packet published, including runbook, architecture summary, operator notes, and evaluation checklist  
  - guided review materials and demo commands published for external teams  
  - at least one external review invitation or walkthrough offer initiated  
  - any feedback received is documented and triaged into concrete hardening priorities for the beta milestone  

### Milestone 3: _(Recovery-Hardened Reference Beta for Independent Review)_
- **Estimated Delivery:** 4-6 weeks after Milestone 2  
- **Focus:** Incorporate evaluation feedback and publish a beta whose recovery model can be independently reviewed and rerun by external teams.  
- **Deliverables / Value Metrics:**  
  - persisted checkpoint and restart recovery behavior demonstrated  
  - documented pre-commit rollback and post-commit forward-recovery boundaries  
  - restart, pre-commit abort, and post-commit forward-recovery scenarios packaged for independent review  
  - stalled reassignment detection and operator expectations documented clearly enough for external reviewers  

### Milestone 4: _(Reusable CCDS Reference Release for External Adoption)_
- **Estimated Delivery:** 2-4 weeks after Milestone 3  
- **Focus:** Publish CCDS as an adoption-ready open-source reference implementation that an external team can understand and evaluate without source-diving.  
- **Deliverables / Value Metrics:**  
  - open-source release of the minimal reference app or demo suite  
  - architecture, state machine, recovery, and integration documentation published  
  - integration guidance strong enough that an external team can understand the supported topology, authority model, included reference paths, and failure boundaries without reading the source code first  
  - at least one end-to-end example published for external reuse, review, and adoption evaluation  

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone  
- Demonstrated functionality or operational readiness  
- Documentation and knowledge transfer provided  
- Alignment with stated value metrics  

Project-specific acceptance conditions:

- the Daml package implements the settlement-capable locking and release pattern for the reference asset scope
- Daml Script scenarios demonstrate deterministic timeout and release behavior
- automated reassignment orchestration succeeds across three local synchronizers representing two home domains and one neutral settlement domain, with no manual command intervention during the happy path
- persisted checkpoint and restart recovery behavior is demonstrated in the orchestrator
- stalled reassignment detection and the documented recovery behavior are demonstrated in the reference environment
- the published release includes the included reference asset paths and at least one bridge-backed Canton Coin reference flow
- documentation clearly distinguishes recoverable pre-commit rollback cases from post-commit forward-recovery cases
- documentation clearly defines the bilateral settlement intent object and the coordinator authority model
- the release clearly distinguishes included reference adapter paths from direct integrations that remain future work
- evaluation materials for external reviewers are published, and any feedback received during the evaluation window is documented and triaged

---

## Funding

**Total Funding Request:** 1,500,000 CC

### Payment Breakdown by Milestone
- Milestone 1 _(Public Alpha for the CCDS Reference Suite)_: 375,000 CC upon committee acceptance  
- Milestone 2 _(Evaluation-Ready Package for the Reference Happy Paths)_: 225,000 CC upon committee acceptance  
- Milestone 3 _(Recovery-Hardened Reference Beta for Independent Review)_: 550,000 CC upon committee acceptance  
- Milestone 4 _(Reusable CCDS Reference Release for External Adoption)_: 350,000 CC upon final release and acceptance  

### Volatility Stipulation
If the project timeline extends beyond 6 months due to Committee-requested scope changes, any remaining milestones should be renegotiated to account for material CC/USD volatility.

---

### Team Background
BitDynamics brings deep experience in building and operating blockchain infrastructure. The team has worked across Ethereum client infrastructure, validator operations, and production-grade hosting systems supporting validator infrastructure securing more than 2 billion AUD in assets. This background is directly relevant to building reliable, auditable, and security-conscious public infrastructure for a grants program. Team is also building actively on Canton.

---

## Potential Ecosystem Beneficiaries

This proposal is intended as public-good infrastructure for the wider Canton ecosystem. A few ecosystem teams appear well aligned with this feature set and with the kinds of problems CCDS is designed to address, including Gateway, Lumens.fi, and Hashrupt.

These capabilities target recurring orchestration and recovery pain points that teams in this category face when building or operating Canton-based systems, especially where delivery-versus-payment or asset movement must span multiple synchronizer domains.

More broadly, the project is intended to benefit teams building cross-domain settlement workflows, multi-synchronizer financial applications, and reusable post-trade coordination patterns on Canton.

## Co-Marketing

Upon release, the implementing entity will collaborate with the Foundation on:

- Announcement coordination  
- Case study or technical blog  
- Developer or ecosystem promotion  

Specific commitments:

- publish integration guidance for teams evaluating the reference pattern
- publish at least one developer-facing walkthrough or demo
- publish at least one end-to-end example showing the reference DvP flow

---

## Motivation

Canton’s value proposition is not only privacy or institutional messaging. It is the ability to support coordination across independently operated domains.

But if each application team must build cross-domain settlement orchestration from scratch, the network-of-networks model remains unnecessarily expensive to use in practice.

A reusable reference implementation for cross-domain DvP settlement would give the ecosystem:

- a common starting point for inter-domain asset exchange
- safer and more consistent reassignment handling
- a concrete recovery model for interrupted settlement flows
- lower engineering cost for future Canton applications dealing with fragmented domain liquidity
- a practical reference suite that external teams can evaluate before building bespoke integrations

This makes CCDS a strong candidate for Development Fund support as reusable open-source ecosystem infrastructure.

---

## Rationale

This proposal is intentionally scoped as a reference implementation rather than a universal settlement standard.

That is the right approach because:

- cross-domain settlement is operationally complex, so the first public-good deliverable should prove a small but useful set of reference paths well
- the ecosystem benefits more from a reusable open-source handshake and recovery pattern than from a broad but weakly verified platform claim
- adoption depends as much on reviewability, demos, and recovery clarity as on the happy-path code itself
- keeping the initial implementation bounded avoids overlap with broader SDK, dApp API, and institutional product proposals

The `1.5M CC` request prices CCDS as a reusable public reference implementation with documentation, recovery behavior, and evaluation milestones, rather than as a one-off proprietary integration or a universal settlement platform.
