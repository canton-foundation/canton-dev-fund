## Development Fund Proposal: Canton Fast Lane -- Sequencer Channel Signaling Reference Toolkit

**Author:** Srikanth
**Status:** Submitted
**Created:** 2026-03-20

---

## Abstract

This proposal requests funding for an open-source reference toolkit for low-latency, non-final signaling between Canton-connected systems using sequencer-channel style transport.

Some institutional workflows need faster coordination than the full Daml transaction lifecycle is designed to provide. Examples include quote negotiation, pre-trade readiness checks, cross-domain reassignment handshakes, margin-warning alerts, market-data hints, and event-driven workflow nudges exchanged before a later formal Canton commitment. Today, teams that need such behavior must build bespoke off-ledger signaling infrastructure with little shared guidance on security boundaries, retry behavior, sequencing, and safe integration with Canton-based workflows.

The proposed project, **Canton Fast Lane**, will provide:

- a JVM channel adapter and TypeScript SDK for low-latency signaling
- a reference signaling protocol and message schema library
- delivery, retry, sequencing, and session-management patterns for non-final signaling
- a minimal reference application and technical documentation showing how to combine fast signaling with later Canton-ledger finalization safely

The goal is not to replace Daml, not to replace ledger transactions, not to bypass Canton’s trust guarantees for settlement, and not to introduce a new finality layer. The goal is to give the ecosystem a reusable, open-source reference pattern for **pre-commit and non-final coordination traffic** where low latency matters more than ledger durability, while keeping all final business commitments on the normal Canton and Daml path.

---

## Specification

### 1. Objective

The objective is to reduce the engineering cost and architectural risk of low-latency coordination in Canton-connected systems by publishing a concrete reference implementation that other teams can adopt, study, and extend.

The intended outcome is that a Canton team can:

- send low-latency signaling messages between authorized endpoints
- exchange non-final session-scoped coordination data without minting ledger events for every signal
- sequence and acknowledge transient messages safely enough for operational coordination
- combine fast signaling with a later formal Daml or Canton commit when business finality is actually required
- recover safely if a signaling process crashes or reconnects mid-session

This proposal is explicitly framed as **ecosystem infrastructure** and a **reference implementation**, not a finality system, not a settlement layer, and not a protocol change proposal.

### 1.1 Coordination Plane vs Execution Plane

This proposal is based on a simple architectural distinction:

- the **coordination plane** handles transient, advisory, preparatory, and operational signals
- the **execution plane** handles durable business commitments through normal Canton and Daml workflows

The Sequencer Channel Signaling Toolkit belongs only to the coordination plane.

Daml remains the authoritative layer for:

- durable business state
- asset movement
- settlement
- custody
- cryptographic finality
- auditability

The toolkit is valuable precisely because it avoids forcing every transient coordination event through the full execution plane while still preserving the execution plane for the state transitions that matter most.

### 2. Implementation Mechanics

The project will be delivered as:

- a JVM channel adapter built around the currently available sequencer-channel client surface
- a TypeScript SDK for typed signaling envelopes and application integration
- session-management, retry, reconnection, and bounded buffering utilities
- a minimal reference application and documentation

#### A. Correct Use Boundary

This proposal exists for a narrow class of problems.

Use this toolkit when:

- the signal is operational, advisory, or preparatory
- the latency requirements make a full ledger roundtrip too expensive
- the consumer understands that the message is **not** a final ledger fact
- the workflow will later rely on a proper Canton or Daml commit for business finality when needed

Do **not** use this toolkit when:

- the message itself must be a legally or operationally final business event
- the workflow is a payment, settlement, custody, or asset transfer
- the consumer must rely on Canton-style non-repudiation and ledger durability
- the sender is trying to prove that some state transition has definitely committed on-ledger

This toolkit is therefore a **signaling layer**, not a transaction layer.

#### A.1 Why This Complements Daml

This proposal should be understood as a complement to Daml, not a competitor to it.

Without a shared signaling pattern, teams usually fall into one of two bad outcomes:

- they force transient coordination traffic through durable ledger workflows that were never meant to carry every heartbeat, quote, readiness ping, or wake-up signal
- they build bespoke off-ledger channels with unclear security boundaries, retry behavior, and operator responsibilities

This toolkit creates a safer middle path:

- use low-latency signaling for non-final coordination
- use normal Canton and Daml transactions for final commitments

The result is not less Daml usage. If the toolkit is successful, it should improve the quality of downstream Daml usage by reducing failed submission attempts and making later ledger-backed workflows more likely to succeed.

#### B. Reference Signaling Scope

To keep the initial implementation technically credible and reviewable, the reference scope is limited to:

- one point-to-point signaling session between two authorized endpoints
- one typed signaling envelope format
- one acknowledgement model for session delivery
- one bounded sequencing and replay-protection model
- one reference bridge from low-latency signaling to a later ledger-backed commit

The project will prove one reference signaling path rather than claim universal support for every network topology, arbitrary multicast, or business-critical messaging semantics.

#### C. Signal Envelope Model

The reference signaling protocol will define a `SignalEnvelope` with, at minimum:

- `sessionId`
- `channelId`
- `messageId`
- `senderId`
- `recipientId`
- `messageType`
- `payloadCodecVersion`
- `payload`
- `payloadHash`
- `sequenceNo`
- `createdAt`
- `expiresAt`
- `correlationId`
- `ackRequested`
- `finalityExpectation`

Important constraint:

- `finalityExpectation` for the reference path must always be explicitly non-final
- the toolkit will reject schema usage that pretends a signal itself is a committed Canton business outcome

#### D. Session and Delivery Model

The reference happy path is:

1. Two authorized endpoints establish or resume a signaling session.
2. The sender emits a typed signal envelope over the low-latency channel.
3. The recipient validates session, sequence, expiry, and payload shape.
4. The recipient emits an acknowledgement when configured.
5. If the workflow requires formal business commitment, one side later submits a normal Canton or Daml transaction using the signal only as coordination input, never as proof of final state.

The design goal is:

- low-latency transport
- explicit non-final semantics
- session-scoped ordering
- replay protection within the session
- safe handoff into later ledger-backed workflows where needed

#### E. Event-Driven Integration Pattern

The reference application will show how fast signaling should coexist with Canton’s event-driven application model.

In particular, it will demonstrate:

- signaling for readiness, quote negotiation, or operational intent
- a later ledger-backed confirmation step when the workflow must become durable
- clear separation between `signal received` and `state committed`
- idempotent handoff from signaling logic into off-ledger automation or ledger submission logic

#### F. Recovery and Failure Handling

The project will include a reference recovery model for:

- dropped connections
- duplicated signal envelopes
- out-of-order sequence attempts
- stale or expired session messages
- reconnect and resume behavior
- bounded resend on missing acknowledgements

The toolkit will persist:

- session metadata
- local send sequence state
- acknowledgement state
- retry and reconnect state
- correlation state for later ledger handoff

On restart, the toolkit will recover persisted state and either:

- resume the session safely
- resend missing unacknowledged signals within configured bounds
- discard expired transient signals
- escalate to application-level retry or operator intervention according to documented policy

#### Explicitly Out of Scope

To keep the project feasible and reviewer-friendly, the following are explicitly out of scope:

- settlement, payment, or custody workflows
- asset movement or token transfer
- protocol-native finality or non-repudiation claims
- a new business messaging standard for the full ecosystem
- permissionless relay markets
- arbitrary large-payload transport
- replacing Ledger API / Daml workflows
- speculative third-party audit funding in this proposal

### 3. Architectural Alignment

This proposal aligns with Canton architecture by respecting the difference between:

- fast coordination traffic
- durable ledger-backed state transitions

It complements rather than replaces the normal Canton transaction model.

It is aligned with Development Fund priorities because it delivers:

- a reusable low-latency signaling reference pattern
- shared infrastructure for teams building latency-sensitive Canton-connected systems
- safer operational guidance for cases where non-final signaling is required before a later formal commit
- a public-good developer toolkit rather than a private hosted service

### 3.1 Architecture Selection Guide

The proposal is strongest when used for the right class of workflows.

Use normal Canton and Daml execution when:

- the outcome must be durable
- the event itself is a final business fact
- the workflow is a payment, settlement, custody, or contract state transition

Use the Sequencer Channel Signaling Toolkit when:

- the message is advisory, preparatory, or operational
- the workflow benefits from lower latency before the later formal commit
- participants still intend to rely on normal Canton and Daml workflows for the actual business outcome

This decision boundary is part of the proposal’s safety model and one of the main reasons a reference implementation is valuable.

### 4. Delivery Readiness

This proposal assumes the existence of sequencer-channel style transport capabilities but deliberately keeps the first release at the toolkit and reference-pattern level.

The current Canton source indicates that sequencer channels are a real implementation surface, with a bidirectional gRPC `SequencerChannelService`, opaque payload forwarding, session-key setup, and a `SequencerChannelClient`. At the same time, the current code and configuration language also indicate that sequencer-channel support is still marked as unsafe / under development and is presently associated with online party replication flows.

That means the proposal should be read as a careful reference-toolkit effort built on a real underlying capability, not as a claim that sequencer channels are already a mature general-purpose product surface for every Canton deployment.

The initial reference path is restricted to:

- one session type
- one sender / one recipient
- one typed envelope model
- one acknowledgement mode
- one demonstrated bridge into a later ledger-backed commit

This keeps the first implementation reviewable and prevents overclaiming around finality or enterprise production scope.

### 5. Delivery Feasibility

This proposal is intentionally narrow enough to be built and reviewed:

- one reference signaling protocol
- one point-to-point session model
- one client toolkit
- one reconnect and replay-protection model
- one reference application and demo

The implementation is technically meaningful, but bounded. It does not attempt to solve generalized messaging, transaction finality, or protocol-native cross-domain settlement.

### 5.1 Implementation Plan

The implementation plan follows a layered approach that matches the current Canton capability surface while keeping the developer-facing experience practical.

**Phase 1: Application Protocol and Envelope Definition**

The first step is defining the toolkit’s own application protocol for non-final signaling.

This proposal does **not** change the underlying sequencer-channel protocol. Instead, it defines a typed signaling format that is carried inside the existing opaque channel payloads supported by Canton. The v1 toolkit will define a compact `SignalEnvelope` and related session messages with fields such as:

- `sessionId`
- `sequenceNo`
- `messageId`
- `payloadHash`
- `expiresAt`
- `correlationId`
- `ackRequested`

This phase also defines the toolkit’s acknowledgement, expiry, replay-protection, and correlation model.

**Phase 2: Session Initialization and Cryptographic Handshake**

Before transient messages can be exchanged, the two communicating endpoints must establish a secure point-to-point session over the sequencer channel.

The Canton source already models this with:

- channel metadata identifying the two members
- a channel-ready notification
- asymmetrically encrypted session-key transfer
- session-key acknowledgement

The reference toolkit will build on that flow. One side will be designated as the session-key owner, and both sides will rely on an agreed topology timestamp for the public-key encryption context, consistent with the current Canton client design.

**Phase 3: JVM Channel Adapter**

The native Canton client surface for sequencer channels currently lives on the JVM. Therefore, the toolkit’s low-level channel integration will be implemented as a JVM-side adapter built around `SequencerChannelClient` and a dedicated `SequencerChannelProtocolProcessor`.

This adapter will be responsible for:

- establishing and closing channel sessions
- handling payload send and receive callbacks
- managing session-key ownership and secure connection establishment
- surfacing channel state transitions to higher-level application code
- applying compatibility checks against the currently supported Canton sequencer-channel surface

This is more technically credible than pretending the first version can be implemented as a pure TypeScript-native Canton channel client.

**Phase 4: TypeScript SDK and State Management**

On top of the JVM channel adapter, the project will provide a TypeScript SDK as the main developer-facing integration surface.

This SDK will manage:

- local session metadata
- sequence tracking
- replay protection
- expiry handling
- reconnect and bounded resend policies
- correlation between transient signals and later ledger-backed actions

The TypeScript layer may persist lightweight session state in a local database or cache so that reconnect and recovery behavior can be demonstrated clearly in the reference app.

**Phase 5: Ledger Handoff and Finality Bridge**

The final architectural step is the safe handoff from non-final signaling back into the normal Canton and Daml execution path.

Once a signaling workflow concludes successfully, the application stops relying on the transient channel and returns to standard Canton behavior. The final business action is represented as a normal Daml or participant-submitted command, using the prior signal only as coordination input rather than as proof of business finality.

This handoff is one of the most important parts of the proposal, because it demonstrates that the toolkit is designed to complement Daml rather than replace it.

### 5.2 Engineering Scope That Drives Cost

This proposal is priced as a real engineering project rather than a lightweight SDK wrapper.

The main cost drivers are:

- **JVM-side Canton integration:** the toolkit must bridge into a real Canton client surface that currently lives on the JVM, including channel lifecycle management, protocol-processor integration, secure session setup, compatibility validation, and operational shutdown behavior.
- **Typed application protocol design:** the project defines a reusable signaling envelope family, acknowledgement model, expiry model, replay-protection rules, and correlation model that other teams can adopt safely rather than re-implementing ad hoc.
- **Reliability work rather than happy-path demos:** reconnect, resume, duplicate suppression, stale-message handling, bounded resend, and recovery after process restart are core deliverables, not polish.
- **Two-layer developer experience:** the project includes both a JVM channel adapter and a TypeScript SDK, because a credible ecosystem deliverable needs a realistic developer-facing integration surface rather than exposing raw Canton internals.
- **Reference integrations and hard examples:** the proposal includes example flows for RFQ-style signaling, readiness or reassignment handshakes, and one additional operational use case so teams can evaluate the pattern in realistic conditions.
- **Documentation and safety guidance:** a major part of the work is making the boundary between signaling and finality unambiguous so teams do not misuse the toolkit as a substitute for Daml.

The budget therefore reflects not just code volume, but the combination of:

- JVM integration against an alpha-like underlying feature surface
- protocol and schema design
- TypeScript SDK and state-management work
- failure-path testing and hardening
- end-to-end reference app development
- reusable operator and developer documentation

### 6. Risks and Mitigations

- **Misuse as a finality layer:** the proposal explicitly encodes non-final semantics and documents when signaling must be followed by a normal Canton commit.
- **Operational fragility:** the toolkit persists session and acknowledgement state and models reconnect and bounded resend behavior explicitly.
- **Duplicate or stale signals:** the reference path uses sequence numbers, expiry windows, and replay-protection rules.
- **Architecture confusion:** the reference documentation will include a decision guide for when to use low-latency signaling versus normal ledger transactions.
- **Scope creep:** the first release is limited to one point-to-point session and one typed envelope family.
- **Perceived conflict with Daml:** the proposal now explicitly positions signaling as a pre-commit coordination plane whose purpose is to protect, not replace, the normal Daml execution path.
- **Underlying feature maturity:** because current sequencer-channel support appears to be an unsafe / under-development capability in Canton today, the first release is intentionally positioned as a narrow reference toolkit with explicit compatibility checks, bounded scope, and no promise of broad production readiness on day one.
- **Security posture:** the initial release includes internal threat modeling, misuse analysis, replay and expiry testing, and protocol-boundary review as part of the engineering scope. No separate third-party audit budget is requested in this proposal. If the toolkit sees broader production adoption, a full external security review should be funded through a separate follow-on proposal.

### 7. Backward Compatibility

No backward compatibility impact.

This project is additive. It introduces a new reference toolkit and supporting library without requiring protocol changes or changes to Canton core ledger behavior.

---

## Use Cases

The toolkit is most useful during the **connect and coordinate** phase of a workflow, before the workflow enters its later **execute and settle** phase on the ledger.

The v1 reference implementation will directly demonstrate a smaller subset of flows, but the proposal is motivated by the following high-fit use cases:

### Use Case 1: High-Frequency RFQ and Quote Negotiation

Two counterparties exchange transient bid, ask, or negotiation signals before either side submits a ledger-backed trade or commitment. The signaling layer reduces coordination latency during negotiation, while the final booked trade still happens through normal Canton mechanisms.

### Use Case 2: Pre-Trade Readiness, Lock Availability, and Compliance Clearance

Participants exchange non-final readiness signals such as “position loaded”, “asset available”, “risk checks passed”, or “window open” before attempting a later atomic or ledger-backed workflow. This can reduce failed submissions and unnecessary transaction attempts, while the actual source-of-truth checks still happen through normal Canton state reads and commits.

### Use Case 3: Oracle Market-Data and Reference-Rate Hints

Applications exchange ephemeral pricing, route-selection hints, or sub-second market-state signals that influence later application behavior but do not themselves constitute final business state. In the reference scope, this is modeled as point-to-point or bounded endpoint-to-endpoint signaling rather than a full multicast market-data network.

### Use Case 4: Order-Intent Handoff to a Matching Service

A trading application sends low-latency intent signals to an off-ledger matching service or coordinator before matched outcomes are submitted through normal Canton workflows for sequencing and settlement. The toolkit is not presented as a full CLOB implementation, only as a fast intent-coordination pattern ahead of ledger-backed execution.

### Use Case 5: Pre-Settlement Margin Call Warnings

Operators, brokers, or clearing workflows send instant pre-ledger warnings that a portfolio is approaching a margin threshold, giving participants a brief window to respond before any later formal liquidation or collateral workflow is attempted on-ledger.

### Use Case 6: Cross-Domain Reassignment Handshakes

Before initiating a native contract reassignment or other cross-domain workflow, one side can signal that the target participant is online, session state is ready, and the receiving process is prepared for the next step. This improves operational readiness without replacing the later protocol-native reassignment itself.

### Use Case 7: Operational Liveness, Heartbeats, and Cutover Coordination

Operators coordinate low-latency cutover events, routing-state changes, service-readiness signals, or health probes without writing every heartbeat to the ledger.

### Use Case 8: Syndicated Loan Allocation Probing

Lead arrangers or coordination services can privately exchange non-binding interest or allocation signals with participant institutions before the actual binding Daml obligations are created.

### Use Case 9: Workflow Nudges for Event-Driven Automation

An application uses fast signaling to wake, prioritize, or pre-stage off-ledger automation that will later confirm state through normal ledger reads, Participant Query Stream consumption, and Canton writes.

### Use Case 10: Identity and KYC Challenge-Response

Institutions exchange rapid off-ledger challenge-response signals to confirm session freshness, endpoint identity, or readiness for a later sensitive workflow. This can help gate a later ledger-backed transfer or instruction, but it does not replace the formal compliance or authorization logic of the eventual Canton transaction.

---

## Milestones and Deliverables

### Milestone 1: Protocol and Client Foundation

- **Estimated Delivery:** 4 weeks
- **Focus:** define the reference signaling model and client boundary
- **Deliverables / Value Metrics:**
  - compatibility review against the currently available sequencer-channel service and client surface
  - a schema library for `SignalEnvelope` and related session messages
  - a JVM channel adapter wrapping the currently available sequencer-channel client surface
  - a TypeScript SDK boundary for point-to-point signaling integration
  - technical documentation clearly separating non-final signaling from ledger-backed finality

### Milestone 2: Recovery, Replay Protection, and Reference App

- **Estimated Delivery:** 5 weeks
- **Focus:** make the toolkit robust enough for real operational use
- **Deliverables / Value Metrics:**
  - reconnect and resume behavior
  - duplicate and stale-message handling
  - bounded resend and retry policies
  - a minimal reference application demonstrating one low-latency signaling flow and one later ledger-backed confirmation step

### Milestone 3: Use-Case Packs and Integration Guides

- **Estimated Delivery:** 4 weeks
- **Focus:** make the pattern easy for external teams to apply correctly
- **Deliverables / Value Metrics:**
  - RFQ / quote-negotiation example
  - reassignment-handshake or readiness-signaling example
  - one additional example from margin-warning, workflow-nudge, or identity challenge-response flows
  - integration guidance for event-driven automation and safe ledger handoff
  - operator and developer documentation for configuration, security boundaries, and failure handling

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- a reference client toolkit implementing the documented signaling model
- typed envelope schemas and session logic published as open source
- successful point-to-point signaling with sequencing, acknowledgements, and reconnect behavior demonstrated in the reference environment
- replay-protection and expiry behavior demonstrated under duplicate and stale-message scenarios
- a reference application showing one non-final signaling flow followed by one later ledger-backed confirmation step
- documentation clearly stating what this toolkit is for, what it is not for, and how it should safely coexist with normal Canton transactions

Project-specific acceptance conditions:

- the project must remain a signaling toolkit, not broaden into a settlement or transaction layer
- the documentation must clearly state that signals are not Canton-final business events
- the examples must show at least one proper handoff from low-latency signaling into a later normal Canton or Daml commit

---

## Funding

**Total Funding Request:** 2,800,000 CC

### Payment Breakdown by Milestone

- Milestone 1 _(Protocol and Client Foundation)_: 950,000 CC upon committee acceptance
- Milestone 2 _(Recovery, Replay Protection, and Reference App)_: 950,000 CC upon committee acceptance
- Milestone 3 _(Use-Case Packs and Integration Guides)_: 900,000 CC upon final release and acceptance

### Funding Rationale

- Milestone 1 is substantial because it includes the hardest architectural boundary in the project: defining the application protocol, validating compatibility with the currently available sequencer-channel surface, implementing the JVM channel adapter, and establishing the first TypeScript integration surface.
- Milestone 2 remains equally large because this is where the project becomes real engineering infrastructure rather than a demo. Reconnect, replay protection, resend policy, recovery after restart, and the first end-to-end reference application are the main technical-risk items in the proposal.
- Milestone 3 is still large because the value of this project depends on making the pattern reusable. The reference examples, operator guidance, integration guides, and safety documentation are part of the product, not afterthoughts.
- The total request reflects a multi-surface delivery across Canton-facing JVM integration, TypeScript SDK development, reliability hardening, reference apps, and public documentation.
- No hosted-service budget, recurring maintenance budget, or open-ended support retainer is requested in this proposal.

### Budget Justification by Workstream

The requested `2,800,000 CC` is best understood as funding five concrete engineering workstreams:

| Workstream | Scope | Budget (CC) |
| :---- | :---- | :---- |
| JVM Channel Adapter and Compatibility Validation | `SequencerChannelClient` integration, protocol processor wiring, channel lifecycle, session-key ownership flow, compatibility checks against current Canton surface | 750,000 |
| Signaling Protocol and TypeScript SDK | `SignalEnvelope` schemas, acknowledgement model, correlation model, TypeScript SDK boundary, local state handling | 600,000 |
| Reliability and Recovery Hardening | reconnect/resume, replay protection, stale-message handling, bounded resend, recovery after restart, failure-path test coverage | 700,000 |
| Reference Apps and Use-Case Packs | RFQ example, readiness or reassignment-handshake example, one additional operational example, end-to-end ledger handoff flows | 450,000 |
| Documentation, Safety Guidance, and Release Packaging | operator guides, developer docs, architecture decision guidance, release packaging, example integration material | 300,000 |

| **Total** |  | **2,800,000** |

This budget is intentionally front-loaded toward engineering hardening and compatibility validation because the main risk is not “can we build a demo UI.” The main risk is delivering a safe, reusable toolkit on top of a real but still-maturing Canton capability surface.

### Volatility Stipulation

If the project timeline extends beyond 6 months due to Committee-requested scope changes, any remaining milestones should be renegotiated to account for significant USD/CC volatility.

---

## Co-Marketing

Upon release, the implementing entity will collaborate with the Foundation on:

- announcement coordination
- a technical write-up explaining when to use low-latency signaling versus normal Canton transactions
- one developer-facing walkthrough or workshop

Specific commitments:

- publish integration guidance for latency-sensitive Canton-connected systems
- publish at least one end-to-end example showing signaling plus later ledger-backed confirmation

---

## Motivation

Not every coordination problem in a Canton-connected system should be represented as a full ledger transaction.

Some enterprise workflows need faster, transient communication for quote negotiation, readiness checks, routing hints, or operational coordination before the workflow reaches the point where a durable, auditable Canton commit is appropriate.

Without a shared reference pattern, teams will build custom low-latency channels with inconsistent security boundaries, unclear retry semantics, and dangerous confusion between advisory signaling and final business state.

An open-source reference toolkit would reduce that risk and give the ecosystem a safer path for the narrow class of use cases where low latency matters but ledger finality is not yet the right tool.

It would also help reserve the normal ledger path for the high-value transitions it is best at: durable commitments, business state changes, and auditable final outcomes. In that sense, the toolkit acts as a funnel into better downstream ledger usage rather than as an attempt to compete with Daml.

---

## Rationale

This proposal is intentionally narrow because the risks of misuse are real.

It is the right approach for four reasons:

- it addresses a genuine gap for latency-sensitive coordination without pretending to be a settlement system
- it makes the non-final nature of signaling explicit so teams do not degrade Canton’s trust model by accident
- it gives the ecosystem reusable guidance and tooling instead of pushing every team toward bespoke and unsafe off-ledger messaging
- it helps reduce wasted durable transaction attempts by making the pre-commit coordination phase faster, clearer, and more reliable

The result is a disciplined public-good proposal: a low-latency signaling reference toolkit that complements Canton’s transaction model rather than competing with it.
