## Development Fund Proposal

**Title:** AI Agent Interoperability for Institutions
**Authors:** Philip Kaddaj, Yash Bharti
**Status:** Draft
**Created:** 2026-02-13
**Label:** financial-workflows-composability
**Champion:** *Need Champion*
**Type:** Standards Track
**Layer:** Applications
**Requires:** CIP-56
**License:** Apache-2.0

---

## Abstract

This CIP defines a standard protocol enabling institutional AI agents on the Canton Network to advertise capabilities, establish service relationships, and compose multi-party workflows, inheriting Canton's existing privacy, authorization, and atomicity guarantees.

The protocol introduces a small set of Daml templates that compose into a two-phase request lifecycle. An **Agent Role Contract** exposes an agent's capabilities as exercisable Daml choices, one per capability (e.g. settlement, compliance, pricing). Each capability choice creates a typed **Service Request** representing a pending interaction that the agent has been asked to perform. When the agent completes the work off-ledger, it exercises a completion choice on the Service Request, producing a typed **Service Record** that captures the actual outcome and measured metrics. Service Records reference the originating Role Contract by identifier and carry a trace identifier for end-to-end auditability.

---

## Specification

### 1. Objective

Canton already enables institutions to compose transactions atomically across synchronization domains with sub-transaction privacy. As AI agents become primary actors in institutional workflows, executing settlement, asset servicing, compliance checks, and portfolio management, a gap has emerged: there is no standard way for these agents to advertise capabilities, negotiate service agreements, or orchestrate multi-party workflows with the same guarantees that the underlying transactions enjoy.

Without a standard protocol, each bilateral agent integration requires bespoke negotiation and custom tooling, replicating the fragmentation that Canton was built to eliminate. Early Canton pilots in capital markets have demonstrated cross-application transaction composability; extending this to the agent layer is the natural next step.

The objective of this proposal is to establish a Canton-native standard for institutional agent interoperability, comprising a small set of Daml templates, three Daml interfaces, and a complete reference implementation with an institutional SDK.

### 2. Implementation Mechanics

The protocol comprises three primitive contract types, summarised in the table below, which compose into a two-phase request lifecycle. The lifecycle deliberately separates the *request* from the *record*: a request represents work the agent has been asked to perform, while a record attests to what was actually performed. Outcome and metrics are written to the record only after the work has been executed, and only by the party that executed it.

| Contract | Role |
|---|---|
| Agent Role Contract | Publishes an agent's capabilities as exercisable Daml choices. |
| Service Request | A pending interaction created by a capability choice which follows a fixed interface. |
| Service Record | The outcome of a completed interaction which follows a fixed interface as well. |

Each capability is first-class throughout the contract surface, with its own typed parameters and outcomes. Adding a new capability means proposing a new typed choice on the Role Contract with its own request and record templates.

#### 2.1. Agent Role Contract

The Agent Role Contract is the central primitive. An institution (the *owner*) creates an Agent Role Contract to make an agent's capabilities available to a set of observers. Each capability the agent offers is a distinct Daml choice on the contract.

| Field | Purpose |
|---|---|
| Owner | Signatory; the institution that offers the agent. Creating the contract is the on-ledger delegation of authority to the agent. |
| Agent | Party that executes the service; added as an observer so the off-ledger service can see incoming requests via the ledger event stream. |
| Agent Identifier | Handle unique within the owner's scope. |
| Endpoint | Agent's communication channel (A2A agent card URI, MCP endpoint, or other reference). |
| Terms of Service | Machine-readable operating conditions (rate limits, per-request caps, fee schedules), enforced as preconditions within capability choices. |
| Observers | Parties that may view and exercise capabilities, leveraging Daml's observer model for selective disclosure. |
| Audit Observers | Read-only visibility for compliance and supervision. |

Agent parties **should** be allocated with a participant-local hint of the form `<owner>-agent-<agentId>` and surfaced with the display name `<owner>::agent::<agentId>`. Canton reserves `::` as a participant namespace separator, so the `::agent::` marker lives at the display layer rather than in the hint. This is a protocol-level naming convention enforced by party-allocation tooling, not by contract code.

Capability choices share a common shape: validate parameters against the contract's data, then create the corresponding typed Service Request directed at the agent. The Service Record is produced later by the agent, on the Service Request, at completion time. Lifecycle choices (update endpoint, add or remove observer, archive) are controlled by the owner and archive-and-recreate the contract.

#### 2.2. Service Request

A Service Request represents a pending interaction, work the agent has been asked to perform but has not yet completed. There is one template per capability (e.g. `SettlementRequest`, `ComplianceRequest`, `PricingRequest`), each carrying the typed parameters of its capability as first-class fields.

All Service Request templates share the same authorization shape:

| Field | Role |
|---|---|
| Owner | Signatory; pre-authorizes both record creation and request archival. |
| Agent | Observer; controller of the completion choices. |
| Consumer | Observer; joint controller of cancellation with the owner. |
| Trace Identifier | Carried over from the originating capability choice for end-to-end auditing. |
| Role Contract Reference | Originating role's `agentId` as text, so the eventual record stays meaningful across Role Contract lifecycle updates. |
| Audit Observers | Inherited from the Role Contract for compliance visibility. |

Each Service Request supports three terminal choices:

| Choice | Controller | Effect |
|---|---|---|
| `Complete` | Agent | Produces a typed Service Record with outcome `Success` or `Partial` and the agent's typed outcome fields. |
| `Fail` | Agent | Produces a typed Service Record with outcome `Failure` and a reason string. |
| `Cancel` | Consumer or Owner | Withdraws the pending request without producing a record; the archival event remains in transaction history. |

#### 2.3. Service Record and Dispute Record

When a Service Request is completed (or failed), the completion choice creates the matching typed Service Record. The call sequence itself is already recorded by Daml's native ledger mechanisms; the Service Record provides a structured, queryable summary.

| Field | Content |
|---|---|
| Trace Identifier | Correlation key linking back to the original request, enabling end-to-end tracing across delegated and composed workflows. |
| Role Contract Reference | Textual pointer to the originating Role Contract (`agentId`). |
| Outcome Attestation | `Success`, `Partial`, or `Failure`, set by the agent at completion time. |
| Quantitative Metrics | Measured values for latency, accuracy, and SLA conformance. |
| Typed Outcome Fields | Per-capability typed result data (e.g., `settlementId` on `SettlementRecord`; `price` and `priceTimestamp` on `PricingRecord`). |

The consumer may exercise `Confirm` to attest the record, transitioning it to `Attested`. A single `DisputeRecord` template serves all record types because the substance of a dispute (disagreeing party, reason) is capability-independent; the disputed record's typed details remain available through the transaction history of the archival event.

Records are visible only to the interacting parties and explicitly designated audit observers.

#### 2.4. Daml Contracts

The protocol is defined by a small Daml package: a shared types module and three Daml interfaces, one per primitive. Each interface defines the shape that is common across all implementations of its primitive: the lifecycle of any role contract, the completion flow of any request, the attestation and dispute flow of any record. The implementing templates supply the typed, capability-specific fields and the actions that touch them.

**Shared Types**

```haskell
data ServiceOutcome = Success | Partial | Failure
  deriving (Show, Eq, Ord)

data ServiceMetrics = ServiceMetrics with
    latencyMs       : Optional Int
    accuracyPct     : Optional Decimal
    slaConformance  : Bool
  deriving (Show, Eq)

data TermsOfService = TermsOfService with
    maxRequestsPerDay   : Int
    maxAmountPerRequest : Optional Decimal
    feeCurrency         : Text
    feePerRequest       : Decimal
  deriving (Show, Eq)
```

Each interface exposes a `viewtype`, a public projection of the contract's data, and a set of getters that back the choice bodies.

**AgentRoleContract.** A standard lifecycle surface for any role contract: rotate the endpoint, add or remove an observer, archive the contract. The getters back the choices; `setEndpoint` and `setObservers` are supplied by each implementing template.

```haskell
module Cantor8.AgentService.AgentRoleContract where

import Cantor8.AgentService.Types

data AgentRoleContractView = AgentRoleContractView
  with
    owner           : Party
    agent           : Party
    agentId         : Text
    endpoint        : Text
    terms           : TermsOfService
    observers       : [Party]
    auditObservers  : [Party]
  deriving (Show, Eq)

interface AgentRoleContract where
  viewtype AgentRoleContractView

  getOwner          : Party
  getAgent          : Party
  getAgentId        : Text
  getEndpoint       : Text
  getTerms          : TermsOfService
  getObservers      : [Party]
  getAuditObservers : [Party]

  setEndpoint  : Text -> Update (ContractId AgentRoleContract)
  setObservers : [Party] -> Update (ContractId AgentRoleContract)

  choice AgentRoleContract_UpdateEndpoint : ContractId AgentRoleContract
    with newEndpoint : Text
    controller getOwner this
    do
      assertMsg "endpoint must not be empty" (newEndpoint /= "")
      setEndpoint this newEndpoint

  choice AgentRoleContract_AddObserver : ContractId AgentRoleContract
    with newObserver : Party
    controller getOwner this
    do
      let current = getObservers this
      assertMsg "party is already an observer" (notElem newObserver current)
      setObservers this (newObserver :: current)

  choice AgentRoleContract_RemoveObserver : ContractId AgentRoleContract
    with partyToRemove : Party
    controller getOwner this
    do
      let current = getObservers this
      assertMsg "party is not an observer" (partyToRemove `elem` current)
      setObservers this (filter (/= partyToRemove) current)

  choice AgentRoleContract_Archive : ()
    controller getOwner this
    do pure ()
```

**AgentRequest.** A standard agent-side completion flow for any typed request: signal that the request has been picked up, complete it with a successful or partial outcome, fail it with a reason, or cancel it. The interface returns a `ServiceRecord` on completion; the implementing template decides which typed record is actually created.

```haskell
module Cantor8.AgentService.ServiceRequest where

import Cantor8.AgentService.Types
import Cantor8.AgentService.ServiceRecord (ServiceRecord)

data AgentRequestView = AgentRequestView
  with
    owner          : Party
    agent          : Party
    consumer       : Party
    traceId        : Text
    inProgress     : Bool
    auditObservers : [Party]
  deriving (Show, Eq)

interface AgentRequest where
  viewtype AgentRequestView

  getOwner          : Party
  getAgent          : Party
  getConsumer       : Party
  getTraceId        : Text
  getInProgress     : Bool
  getAuditObservers : [Party]

  markInProgress : Update (ContractId AgentRequest)
  completeWith   : ServiceOutcome -> ServiceMetrics
                 -> Update (ContractId ServiceRecord)
  failWith       : Text -> ServiceMetrics
                 -> Update (ContractId ServiceRecord)

  choice AgentRequest_MarkInProgress : ContractId AgentRequest
    controller getAgent this
    do
      assertMsg "request is already in progress" (not (getInProgress this))
      markInProgress this

  choice AgentRequest_Complete : ContractId ServiceRecord
    with
      outcome : ServiceOutcome
      metrics : ServiceMetrics
    controller getAgent this
    do
      assertMsg
        "Complete may only report Success or Partial; use Fail for Failure"
        (outcome == Success || outcome == Partial)
      completeWith this outcome metrics

  choice AgentRequest_Fail : ContractId ServiceRecord
    with
      reason  : Text
      metrics : ServiceMetrics
    controller getAgent this
    do
      assertMsg "reason must not be empty" (reason /= "")
      failWith this reason metrics

  choice AgentRequest_Cancel : ()
    with
      party  : Party
      reason : Text
    controller party
    do
      assertMsg
        ("party " <> show party <> " must be consumer or owner")
        (party == getConsumer this || party == getOwner this)
      assertMsg "reason must not be empty" (reason /= "")
```

**ServiceRecord.** A standard closing flow for any typed record: the consumer may attest the record, and either the provider or the consumer may raise a dispute. A dispute archives the record and creates a `DisputeRecord` signed by the disputing party.

```haskell
module Cantor8.AgentService.ServiceRecord where

import Cantor8.AgentService.Types

data ServiceRecordView = ServiceRecordView
  with
    provider       : Party
    consumer       : Party
    traceId        : Text
    outcome        : ServiceOutcome
    metrics        : ServiceMetrics
    attested       : Bool
    auditObservers : [Party]
  deriving (Show, Eq)

interface ServiceRecord where
  viewtype ServiceRecordView

  getProvider       : Party
  getConsumer       : Party
  getTraceId        : Text
  getOutcome        : ServiceOutcome
  getMetrics        : ServiceMetrics
  getAttested       : Bool
  getAuditObservers : [Party]

  setAttested : Update (ContractId ServiceRecord)

  choice ServiceRecord_Confirm : ContractId ServiceRecord
    controller getConsumer this
    do
      assertMsg "ServiceRecord is already attested" (not (getAttested this))
      setAttested this

  choice ServiceRecord_Dispute : ContractId DisputeRecord
    with
      party  : Party
      reason : Text
    controller party
    do
      let provider = getProvider this
          consumer = getConsumer this
      assertMsg
        ("party " <> show party <> " must be provider or consumer")
        (party == provider || party == consumer)
      assertMsg "reason must not be empty" (reason /= "")
      create DisputeRecord with
        provider
        consumer
        disputingParty = party
        traceId        = getTraceId this
        reason
        auditObservers = getAuditObservers this
```

#### 2.5. Single-Agent Request Lifecycle (Example)

The following sequence demonstrates the two-phase contract interactions for a single agent serving a single request, with settlement used as the illustrative capability. An institution creates an `AgentRoleContract` to expose its agent's capabilities. A client institution exercises a capability choice, creating a typed Service Request. The agent performs the work off-ledger and exercises the completion choice, producing the matching typed Service Record. The consumer attests the record.

```
Owner Inst.                Agent                  Consumer Inst.
    |                        |                          |
    | (1) create AgentRoleContract                      |
    |-------------------------------------------------->|
    |       AgentRoleContract active; client in observers
    |                        |                          |
    |          --- Service Lifecycle ---                |
    |                        |                          |
    |       (2) exercise RequestSettlement              |
    |<--------------------------------------------------|
    |       SettlementRequest created; agent observes   |
    |                        |                          |
    |       (3) exercise Complete                       |
    |<-----------------------|                          |
    |       SettlementRecord created with outcome and metrics
    |                        |                          |
    |       (4) exercise Confirm                        |
    |<--------------------------------------------------|
    |       SettlementRecord: Attested                  |
```

*Single-agent two-phase request lifecycle (settlement used as illustrative capability). The consumer creates a typed Service Request by exercising a capability; the agent produces the typed Service Record at completion time.*

**Steps:**

1. Owner institution creates an `AgentRoleContract`, listing the client institution as an observer and the agent as an additional observer. The Role Contract exposes capability choices that observers may exercise.
2. Client exercises the `RequestSettlement` choice on the Role Contract, providing parameters (amount, currency) and a trace identifier. The choice body validates the parameters and creates a `SettlementRequest`. No `SettlementRecord` is created yet.
3. The agent observes the new `SettlementRequest` via the ledger event stream, performs the work off-ledger, then exercises `Complete` on the request, providing the actual outcome, measured metrics, and the typed settlement identifier. This archives the request and creates a `SettlementRecord`.
4. Client exercises `Confirm` on the `SettlementRecord`, transitioning it to `Attested`. The full call sequence is separately recorded by Daml's native ledger.

### 3. Architectural Alignment

Canton's primitives — sub-transaction privacy, multi-party atomic composition, and Daml authorization — already solve the trust and coordination problems that other ecosystems must engineer from scratch. This proposal extends those primitives to the agent layer.

The three core design decisions:

1. **Two-phase request lifecycle.** Capability choices create a Service Request; the Service Record is produced only when the agent exercises `Complete` or `Fail`, with the actual outcome and measured metrics.
2. **Agent as on-ledger actor.** The agent is named on the Role Contract, observes it (so the off-ledger service can see incoming requests), and controls the Service Request's completion choices. These on-ledger actions correspond to the agent's actual responsibility: reporting the outcome of work performed off-ledger.
3. **Disputes as dedicated contracts.** A dispute is not a state flag on the Service Record but an independent on-ledger contract (the `DisputeRecord`), signed by the disputing party. This guarantees the dispute is queryable, attributable, and non-repudiable. A single `DisputeRecord` template serves all record types because the substance of a dispute (disagreeing party, reason) is capability-independent; the disputed record's typed details remain available through the transaction history of the archival event.

The proposal depends on CIP-56 for token semantics for Canton Coin fee denomination in the Terms of Service.

### 4. Backward Compatibility

This proposal introduces new Daml template definitions only and requires no changes to existing Daml models, the Canton protocol, or synchronization domain software. It is fully backward compatible.

---

## Milestones and Deliverables

Cantor8 will execute the standard through four milestones.

### Milestone 1: Standard & SDK

**Focus** Reference implementation of the Daml templates and a complete SDK for institutional integration.

**Deliverables:**

- Daml package implementing the three protocol interfaces (`AgentRoleContract`, `AgentRequest`, `ServiceRecord`) and the `DisputeRecord` template, with typed request and record pairs for the illustrative capabilities (settlement, compliance, pricing).
- Daml Script test suite covering capability exercise, completion, attestation, dispute, and full request lifecycle, passing against both the in-memory IDE ledger and the persistent Canton sandbox.
- SDK in TypeScript and Python providing ledger client bindings, capability authoring templates, and example agent integrations against MCP and A2A endpoints.
- Operator documentation covering Role Contract authoring, capability extension, and party allocation conventions.
- Reference implementation and SDK merged to the Splice repository.

### Milestone 2: SDK Proof-of-Use

**Focus** Validation of the SDK against real institutional workflows on a shared test synchronizer.

**Deliverables:**

- At least three institutional design partners independently author capabilities against the SDK and deploy them on a shared test synchronization domain.
- End-to-end execution of each partner's capability against the standard, demonstrated by passing integration tests in the partner's own environment.
- Integration findings report covering protocol gaps, ergonomic issues, and proposed amendments to the draft.
- Revised CIP draft incorporating accepted amendments.

### Milestone 3: University Hackathon

**Focus** Seeding a developer base for the standard beyond the institutional design partners.

**Deliverables:**

- Multi-university hackathon executed against committee-agreed criteria for participation, submissions, and judging.
- Prize pool and follow-on grants awarded to winning teams to continue development against the standard.
- Public release of all submissions under open licences.
- Post-hackathon templates and example integrations contributed back into the SDK.

### Milestone 4: Adoption

**Focus** Sustained institutional production use of the standard on the Global Synchronizer MainNet.

**Deliverables:**

- Deployment of the standard on the Global Synchronizer following Super Validator vote.
- Sustained institutional production use of the standard, measured as cumulative Canton Coin burn attributable to transactions exercising choices on `AgentRoleContract`, `AgentRequest`, `ServiceRecord`, or any conforming implementation.
- Quarterly attribution report, derived from on-ledger transaction history and verifiable by any Super Validator.

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone
- Demonstrated functionality or operational readiness
- Documentation and knowledge transfer provided
- Alignment with stated value metrics

Project-specific acceptance conditions:

- **Milestone 1:** Reference implementation, SDK, and operator documentation merged to the Splice repository, with the Daml Script test suite passing against the in-memory IDE ledger and the persistent Canton sandbox.
- **Milestone 2:** At least three institutional design partners have authored capabilities against the SDK and demonstrated end-to-end execution on a shared test synchronizer, with the integration findings report and revised CIP draft published.
- **Milestone 3:** Multi-university hackathon completed, submissions released under open licences, follow-on grants awarded, and post-hackathon contributions merged into the SDK.
- **Milestone 4:** Cumulative attributable burn through the standard on the Global Synchronizer MainNet, verified against the quarterly attribution report.

---

## Funding

**Total Funding Request:** 25,000,000 Canton Coin (CC).

### Payment Breakdown by Milestone

| Milestone | Amount (CC) | Trigger |
|---|---|---|
| 1 – Standard & SDK | 2,000,000 | Reference implementation, SDK, and operator documentation merged to the Splice repository, with the Daml Script test suite passing against the in-memory IDE ledger and the persistent Canton sandbox |
| 2 – SDK Proof-of-Use | 1,000,000 | At least three institutional design partners have authored capabilities against the SDK and demonstrated end-to-end execution on a shared test synchronizer, with the integration findings report and revised CIP draft published |
| 3 – University Hackathon | 2,000,000 | Multi-university hackathon completed, submissions released under open licences, follow-on grants awarded, and post-hackathon contributions merged into the SDK |
| 4 – Adoption | 20,000,000 | Released in tranches of 1,000,000 CC per $10 Million of cumulative attributable burn through the standard on the Global Synchronizer MainNet, up to 20 tranches, verified against the quarterly attribution report |

### Adoption Bonus

| Bonus Trigger | Bonus Amount (CC) |
|---|---|
| Cumulative attributable burn through the standard on the Global Synchronizer MainNet exceeds $1 Billion | 25,000,000 |
| Cumulative attributable burn through the standard on the Global Synchronizer MainNet exceeds $10 Billion | 50,000,000 |

The bonus is paid once, against the highest threshold reached.

### Volatility Stipulation

This grant is denominated in fixed Canton Coin, with USD thresholds for Milestone 4 and the Adoption Bonus referenced to a CC/USD rate of $0.1552 at the time of submission. Should significant USD/CC price volatility materially alter the economic intent of these thresholds before they are reached, the remaining un-minted tranches will be renegotiated with the committee.

---

## Co-Marketing

Upon release, Cantor8 will collaborate with the Foundation on:

- Announcement coordination at each milestone delivery.
- A technical blog and case study covering the reference implementation and design partner integrations.
- Developer ecosystem promotion around the SDK release and the University Hackathon.

---

## Motivation

Agentic AI is moving into rule-governed institutional workflows: settlement matching, collateral optimization, compliance screening, NAV calculation, fund servicing. Today these integrations are bilateral and bespoke, replicating exactly the fragmentation Canton was built to eliminate.

A standardised agent interoperability layer benefits the ecosystem in four concrete ways:

- **Privacy-preserving by default**, inheriting Canton's sub-transaction privacy.
- **Composable with existing Daml workflows.**
- **Bridges Canton to the wider agent ecosystem.** The Role Contract's endpoint field references the agent's native communication channel (A2A agent card URI, MCP server, or other), so an agent implemented against existing agent-communication standards becomes addressable as a Canton service without protocol-specific adapters. Institutions can adopt the standard without re-platforming their agent stacks.
- **Network economic alignment via Canton Coin burn.** Role Contract creation, capability choice exercises, and Service Record creation and attestation all generate synchronizer traffic, contributing to Canton Coin burn. Adoption of the standard therefore translates directly into network economic activity, aligning Super Validator and Application Provider incentives with protocol uptake without requiring any direct reward allocation.

Target use cases include:

- Cross-institution settlement matching: agent-to-agent negotiation and atomic settlement across synchronization domains.
- Automated compliance screening: compliance-as-a-service invoked as a composable workflow step.
- Collateral optimization and margin calls: atomic collateral movements with real-time eligibility checks.
- NAV calculation and fund servicing: pricing, transfer, and custodian agents composing validated fund administration workflows.
- Cross-chain asset operations: coordinating Canton-native and bridged assets (e.g., cETH) within a single workflow.

The expected adopter base is the set of Application Providers building institutional agent workflows on Canton — initially in capital markets, where the early Canton pilots have already demonstrated cross-application transaction composability and where the design partner cohort in Milestone 2 will be sourced.

---

## Rationale

Agentic AI will progressively subsume rule-governed tasks across financial services. The question is not whether institutional agents will perform settlement matching, collateral optimization, or regulatory reporting, but whether they will do so through fragmented bilateral integrations or through a composable, standardized protocol. Canton's primitives — sub-transaction privacy, multi-party atomic composition, and Daml authorization — already solve the trust and coordination problems that other ecosystems must engineer from scratch. This proposal extends those primitives to the agent layer rather than re-engineering them in a separate component.

Three design decisions were considered and justified against alternatives:

1. **Two-phase request lifecycle (Service Request, then Service Record) over a single combined contract.** A single-contract design conflates the agent's intent to act with the actual outcome of that action, and forces the outcome to be guessed at creation time. Splitting the lifecycle means the outcome and measured metrics are written by the party that actually executed the work, at the time they executed it. This makes Service Records faithful artefacts of what happened rather than placeholders updated after the fact.

2. **Agent as on-ledger actor rather than a purely off-ledger service.** Naming the agent on the Role Contract gives it observer status on incoming requests and controller status on completion choices. This matches the agent's real responsibility — reporting outcomes of off-ledger work — and avoids a separate authorization layer for agent actions.

3. **Disputes as dedicated `DisputeRecord` contracts rather than a state flag on the Service Record.** A flag is mutable and unattributable; a dedicated contract signed by the disputing party is queryable, attributable, and non-repudiable. A single `DisputeRecord` template serves all record types because the substance of a dispute is capability-independent.

The proposal extends Canton's existing primitives (Daml templates, choices, observer model, signatory authority) rather than introducing new mechanisms. No existing component needs to be replaced.

---

## Reference Implementation

A complete reference implementation, including a Daml Script test suite, is provided in the Splice repository. The suite passes against both the in-memory IDE ledger and the persistent Canton sandbox. The repository link will be added in a subsequent revision.

---

## Changelog



---

## Copyright

This proposal is licensed under the Apache License, Version 2.0.