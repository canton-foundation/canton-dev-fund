## Development Fund Proposal: Canton Multi-Party Workflow Choreography Reference Implementation

**Author:** blackthornlover <h@bitdynamics.me>, Zhe Li <zhe@bitdynamics.me>, Srikanth <srikanth@bitdynamics.me>
**Implementing Entity:** Bitdynamics
**Status:** Submitted
**Created:** 2026-03-21

---

## Abstract

This proposal requests funding for an open-source reference implementation, in Daml and TypeScript, for multi-party workflow choreography across Canton's privacy-partitioned ledger model.

Canton's sub-transaction privacy model means that each participant only sees the contracts they are a stakeholder on. This is Canton's core value proposition for institutional finance. But it creates a coordination problem that has no analog in public-chain development: how do you advance a workflow across parties who cannot see each other's state, without leaking privacy, without requiring a trusted central orchestrator, and without collapsing all parties into a single shared contract that over-discloses?

Every serious Canton application that spans more than two parties hits this problem. Right now, every team solves it independently, inconsistently, and usually incorrectly — by over-disclosing (adding too many stakeholders to a single contract) or by under-specifying (routing coordination signals off-ledger and claiming Canton as settlement-only).

The proposed project, **Canton Multi-Party Workflow Choreography (CMWC)**, will provide:
- a reference Daml choreography contract model with explicit party-set transition primitives
- a TypeScript workflow runner that each participant operates locally against their own ledger projection
- a reference four-party trade settlement scenario demonstrating the full choreography lifecycle
- a choreography design guide documenting when and how to decompose multi-party workflows into Canton-native steps

The goal is not to build a universal workflow engine, not to run a hosted coordination service, and not to replace Canton's native atomic composition when a single transaction can express the full business action. The goal is to give the Canton ecosystem a reusable, open-source reference pattern for **privacy-preserving multi-party workflow choreography on a partitioned ledger**.

---

## Specification

### 1. Objective

The objective is to reduce the design risk and engineering cost of building multi-party workflows on Canton by publishing a concrete reference implementation that other teams can adopt, study, and extend.

Without a shared reference, teams face four recurring problems:

- **Unplanned party-set accumulation.** Workflows start with a small party set and grow it incrementally as more parties are needed, ending with a contract where all parties are stakeholders and the privacy separation the business requires is never achieved.
- **Incorrect handoff implementation.** The atomic archive-and-create-new-contract-with-different-party-set transition is the key primitive of Canton choreography. It is easy to implement incorrectly by accidentally carrying forward parties from the previous step as observers on the new contract.
- **Off-ledger attestation polling.** When a party who is not a stakeholder on the main business contract needs to confirm a local fact (e.g., that funds are available), teams build off-ledger API calls instead of Canton-native attestation contracts, reintroducing off-chain trust assumptions Canton was designed to eliminate.
- **Unspecified recovery.** What happens when a party's participant is offline during a workflow step? Teams build ad-hoc timeout logic with races between cancellation and late-arriving confirmations, producing workflows that are neither auditable nor correct under failure.

The intended outcome is that a Canton team can:
- model a multi-party workflow as a sequence of Daml contract steps, each with an explicitly defined party set
- hand off between steps using the `WorkflowHandoff` primitive, atomically archiving the current step and creating the next with a different party set
- collect local attestations from parties who are not stakeholders on the main business contract, using the `LocalAttestation` primitive, without off-ledger coordination
- operate a TypeScript workflow runner on each participant node that drives their local steps without needing to reconstruct global workflow state
- recover safely when a participant is offline, a step times out, or an attestation is not received within a configurable window

This proposal is explicitly framed as **ecosystem infrastructure** and a **reference implementation**, not a workflow engine product, not a hosted coordination service, and not a protocol change proposal.

### 2. Reference Scenario: Four-Party Equity Trade Settlement

To keep the implementation concrete and reviewable, the reference implementation is built around a single, fully worked scenario: a four-party equity block trade settlement with CCP novation.

The four parties are:

- **Asset Manager** — the buyer. Initiates the trade, holds cash at their custodian, needs shares delivered.
- **Broker-Dealer** — the seller. Holds shares in inventory, delivers them and receives cash.
- **Custodian** — holds the asset manager's settlement accounts. Confirms cash availability and credits shares on delivery. Operationally independent from the asset manager.
- **CCP (Central Counterparty)** — interposes itself between buyer and seller to guarantee settlement, novating the trade so each side's legal counterparty is the CCP, not the other trading party.

The workflow has five phases, each with a different party-set configuration:

**Phase 1 — Trade Agreement.** The asset manager and broker agree on instrument, quantity, price, and settlement date. Party set: asset manager + broker. The CCP and custodian are not yet parties and do not see the negotiated price.

**Phase 2 — CCP Novation.** The broker submits the trade to the CCP. The CCP archives the bilateral trade agreement and creates two new leg contracts atomically: a sell-side leg (CCP + broker) and a buy-side leg (CCP + asset manager). After this step, the broker and asset manager are no longer in the same contract and cannot see each other's leg.

**Phase 3 — Custodian Cash Attestation.** The custodian confirms that the asset manager's account has sufficient cash reserved for settlement. The custodian creates a `LocalAttestation` contract visible to the CCP only. The asset manager receives a summary confirmation. The broker sees nothing.

**Phase 4 — Simultaneous Settlement Instructions.** The CCP issues two settlement instruction contracts in the same Daml transaction: one to the custodian (release cash) and one to the broker (deliver shares). Each instruction contract has a different party set. Neither party sees the other's instruction.

**Phase 5 — Delivery-versus-Payment Finality.** Both legs complete. The CCP archives its internal novation contracts and creates finality records: the asset manager receives a shares-delivered confirmation, the broker receives a cash-received confirmation. Neither record reveals the other party's outcome details.

This scenario is chosen because it is immediately recognizable to every institution evaluating Canton for capital markets use, and because it contains every design pattern the reference implementation needs to demonstrate: party-set transitions (Phases 1→2, 2→3), local attestation (Phase 3), parallel instruction issuance with non-overlapping party sets (Phase 4), and terminal-state finality (Phase 5).

### 3. Implementation Mechanics

#### A. Daml Choreography Contract Model

The reference implementation defines four reusable Daml primitives:

**`WorkflowHandoff`** — the core party-set transition primitive. Given a source contract, a set of target contract types, and the new party set for each target, `WorkflowHandoff` archives the source and creates the targets in a single atomic Daml transaction. The primitive enforces that no party from the source contract appears on a target contract unless explicitly listed in the new party set. This is the novation primitive used in Phase 2.

**`LocalAttestation`** — the off-ledger-free confirmation primitive. A party who is not a stakeholder on the main business contract creates an `LocalAttestation` referencing that contract's `ContractId`, containing only the fields required to satisfy the downstream step, visible only to the party who needs to verify it. The verifying party archives the attestation when acknowledged. Used in Phase 3.

**`AwaitingStep`** — a lightweight signal contract that notifies a party that their action is required on a given workflow step, without revealing the step's full payload. Used to drive the TypeScript workflow runner without polling.

**`WorkflowTerminal`** — a typed terminal state contract (delivered, failed, cancelled, disputed) that all relevant parties are stakeholders on, providing an auditable end state for every workflow execution. Recovery paths converge to a `WorkflowTerminal` rather than leaving partial state on-ledger.

#### B. TypeScript Workflow Runner

Each participant operates a local workflow runner that:
- subscribes to their participant's ledger event stream for `AwaitingStep` and `LocalAttestation` creation events
- maps each event to a typed workflow action defined by the choreography model
- submits the corresponding Daml command (exercise a choice, create an attestation, advance to the next step)
- persists a local checkpoint after each successful command submission
- on restart, recovers checkpoint state and resumes from the last confirmed transition

The runner is intentionally local and projection-only. It never attempts to reconstruct global workflow state. Each participant's runner only knows about steps that are visible on their own ledger. Correctness is enforced by the Daml model, not by the runner.

#### C. Recovery and Timeout Model

The reference implementation includes a documented recovery model for:
- **Offline participant.** If a party's participant is offline during their required step, the `AwaitingStep` contract persists until the participant reconnects and processes it. No other party's progress is blocked unless they are waiting for that party's attestation.
- **Attestation timeout.** If a `LocalAttestation` is not received within a configurable ledger-time window, the workflow automatically exercises a timeout choice that transitions to a `WorkflowTerminal` with status `AttestationTimeout`. All stakeholders on the terminal state can see the failure reason.
- **Duplicate submission.** If a participant's runner submits a command twice due to a crash-before-checkpoint scenario, the second submission fails gracefully because the `AwaitingStep` contract was already archived by the first. The runner detects the `CONTRACT_NOT_FOUND` response, reads the checkpoint, and advances to the next state.
- **Step rejection.** If a party exercises a rejection choice instead of an acceptance choice, the workflow transitions to a `WorkflowTerminal` with status `Rejected`, recording the rejecting party and reason. No other party is left waiting.

#### D. Choreography Design Guide

The reference implementation ships with a design guide that documents:
- how to decompose a multi-party business workflow into Canton-native steps with explicit party sets at each boundary
- the decision rule for choosing between `WorkflowHandoff` (party-set transition) versus `LocalAttestation` (off-contract confirmation) versus native Canton atomic composition (when all parties can be in the same transaction)
- how to reason about the difference between a signatory (must actively approve a step) and an observer (passively receives the ledger projection) in a choreography context
- the liveness model: which party's offline behavior blocks which downstream steps, and how to design workflow structure to minimize blocking scope
- known limitations: the reference implementation does not address multi-synchronizer choreography (that is the scope of CCDM), does not model dispute resolution beyond recording a terminal state, and does not handle large fan-out (more than six parties) in the first release

### 4. Architectural Alignment

This proposal aligns with Canton's privacy-first architecture because it addresses the coordination problem that Canton's privacy model creates, using only Canton-native primitives — no external witnesses, no trusted coordinators, no oracle dependencies.

It is aligned with Development Fund priorities because it delivers:
- a reusable multi-party workflow reference pattern usable by any Canton application
- shared infrastructure that reduces repeated design risk across the ecosystem
- a concrete, auditable settlement reference scenario for institutional use cases
- a public-good building block that directly supports DeFi, capital markets, and supply-chain applications on Canton

This is ecosystem infrastructure. The choreography primitives are general-purpose. The four-party settlement scenario is the reference instantiation, not the full scope of applicability.

### 5. Relationship to Existing Work

**CCDM (Canton Cross-Domain Messaging)** addresses the case where a workflow must cross synchronizer boundaries using protocol-native reassignment. This proposal addresses the case where the workflow stays on one synchronizer but spans multiple privacy domains within it. The two proposals are complementary, not overlapping. A future proposal can compose them for workflows that both span privacy domains and cross synchronizer boundaries.

**Native Canton atomic composition** is the right tool when all parties can be in a single Daml transaction and the business action is all-or-nothing. This proposal documents when to use choreography instead: when parties cannot all be in the same transaction, when party sets must change between steps, or when eventual consistency is acceptable and preferred to forcing all parties into a single synchronous commit.

### 6. Risks and Mitigations

- **Incorrect party-set design in the reference scenario.** Mitigated by including Daml Script scenarios that assert, for each workflow step, which parties can and cannot see which contracts.
- **Runner incorrectness under concurrent execution.** Mitigated by designing the runner around idempotent Daml command submission and checkpoint-before-action semantics.
- **Scope creep into a general workflow engine.** Mitigated by scoping the first release strictly to the four-party settlement scenario, four primitives, and one synchronizer. Multi-synchronizer choreography, dispute resolution workflows, and large fan-out are explicitly deferred.
- **Design guide becoming too abstract.** Mitigated by tying every design principle in the guide to a specific numbered phase of the reference scenario.

### 7. Backward Compatibility

No backward compatibility impact. This project is additive. It introduces new Daml primitives and a TypeScript runner library without requiring protocol changes or changes to Canton core behavior.

---

## Milestones and Deliverables

### Milestone 1: Choreography Daml Primitives and Reference Scenario Phases 1–2
- **Estimated Delivery:** 5 weeks
- **Focus:** Define the core Daml choreography primitives and prove the party-set transition pattern
- **Deliverables / Value Metrics:**
  - `WorkflowHandoff`, `AwaitingStep`, and `WorkflowTerminal` Daml primitives
  - Daml Script scenarios for the trade agreement (Phase 1) and CCP novation (Phase 2)
  - Party-visibility assertions confirming that after novation, the broker cannot see the buy-side leg and the asset manager cannot see the sell-side leg
  - Implementation notes on the `WorkflowHandoff` atomic archive-and-create pattern

### Milestone 2: LocalAttestation Primitive and Reference Scenario Phases 3–4
- **Estimated Delivery:** 6 weeks
- **Focus:** Prove the off-ledger-free attestation pattern and parallel instruction issuance
- **Deliverables / Value Metrics:**
  - `LocalAttestation` Daml primitive with configurable timeout and acknowledgement choices
  - Daml Script scenarios for the custodian cash attestation (Phase 3) and simultaneous settlement instructions (Phase 4)
  - Party-visibility assertions confirming that the broker does not see the custodian attestation and neither party sees the other's settlement instruction
  - Attestation timeout scenario demonstrating `WorkflowTerminal` convergence

### Milestone 3: TypeScript Workflow Runner and Recovery Model
- **Estimated Delivery:** 6 weeks
- **Focus:** Automate the full four-party scenario end-to-end and prove recovery behavior
- **Deliverables / Value Metrics:**
  - TypeScript workflow runner with ledger event subscription, checkpoint persistence, and idempotent command submission
  - Full end-to-end scenario automation across four local participant nodes without manual command intervention
  - Recovery scenarios: offline participant, attestation timeout, duplicate submission, step rejection
  - Structured logs showing per-participant workflow progress without global state reconstruction

### Milestone 4: Finality, Design Guide, and Reference Documentation
- **Estimated Delivery:** 4 weeks
- **Focus:** Complete the reference scenario and make the pattern usable by other teams
- **Deliverables / Value Metrics:**
  - Finality phase (Phase 5) implementation and Daml Script scenarios
  - Choreography design guide covering party-set decomposition, signatory vs observer reasoning, liveness model, and known limitations
  - Integration documentation for teams adapting the primitives to their own workflows
  - Recorded demo showing the full four-party settlement scenario end-to-end across four local participant nodes

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:
- `WorkflowHandoff`, `LocalAttestation`, `AwaitingStep`, and `WorkflowTerminal` Daml primitives delivered and documented
- Daml Script scenarios covering all five phases of the reference settlement scenario
- Party-visibility assertions passing for each phase, confirming that no party sees contracts outside their intended party set
- `LocalAttestation` timeout behavior demonstrated, converging to `WorkflowTerminal` without manual intervention
- Full end-to-end scenario automation demonstrated across four local participant nodes with no manual command intervention during the happy path
- Recovery behavior demonstrated for: offline participant, attestation timeout, duplicate submission, step rejection
- Choreography design guide published covering party-set decomposition, signatory vs observer model, liveness reasoning, and known limitations
- Project released as open source

Project-specific acceptance conditions:
- the project must remain a reference implementation scoped to the four-party settlement scenario in the first release
- the `WorkflowHandoff` primitive must enforce that no prior-step party appears on a new-step contract unless explicitly listed
- the design guide must clearly state when native Canton atomic composition should be used instead of choreography
- the runner must be projection-only: it must not attempt to reconstruct global workflow state from multiple participants' ledger streams

---

## Funding

**Total Funding Request:** 2,000,000 CC

### Payment Breakdown by Milestone
- Milestone 1 _(Choreography Daml Primitives and Reference Scenario Phases 1–2)_: 500,000 CC upon committee acceptance
- Milestone 2 _(LocalAttestation Primitive and Reference Scenario Phases 3–4)_: 600,000 CC upon committee acceptance
- Milestone 3 _(TypeScript Workflow Runner and Recovery Model)_: 600,000 CC upon committee acceptance
- Milestone 4 _(Finality, Design Guide, and Reference Documentation)_: 300,000 CC upon final release and acceptance

### Funding Rationale
- Milestone 1 is the foundation: the `WorkflowHandoff` primitive and novation transition are the hardest design decisions in the whole implementation and must be proven correct before later milestones build on them.
- Milestones 2 and 3 are equal in size because the attestation model and the runner are both significant engineering layers with non-trivial correctness requirements.
- Milestone 4 is smaller because it completes and documents the already-proven reference flow rather than introducing new technical primitives.
- No hosted-service budget is requested in this proposal.

### Volatility Stipulation

If the project duration extends beyond 6 months due to Committee-requested scope changes, remaining milestones should be renegotiated for material CC/USD volatility. No hosted service budget is requested in this proposal.

---

## Maintenance and Evolution

The initial grant funds the reference implementation, the four-party settlement scenario, the design guide, and the public release. After release, the project will be maintained through normal open-source contribution workflows.

The intended long-term path is to keep the choreography primitives aligned with evolving Canton participant and synchronizer APIs, and to accept community contributions extending the reference to additional workflow topologies (supply chain, multi-party lending, regulatory reporting).

If appropriate, the primitives may later be contributed to a broader Canton ecosystem library or upstreamed into a Foundation-aligned open-source repository. If that path is not immediately available, the project will remain in a public standalone repository with clear versioning, contribution guidelines, and Canton compatibility notes.

### High-Level Architecture

CMWC is designed as two layers above the Canton ledger:
- a **Daml choreography layer** providing the four primitives (`WorkflowHandoff`, `LocalAttestation`, `AwaitingStep`, `WorkflowTerminal`) that encode the workflow structure and party-set transitions directly in the ledger model
- a **per-participant TypeScript runner layer** that each party operates locally, subscribing to their own ledger event stream, executing their local steps, and persisting checkpoints — without any global coordinator

The design is deliberately decentralized. There is no component that sees the full workflow state. Correctness is guaranteed by the Daml model. Liveness is provided by each participant's local runner. Recovery converges to a `WorkflowTerminal` visible to all relevant parties regardless of which participant experiences the failure.

## Co-Marketing

Upon release, the implementing entity will collaborate with the Foundation on:
- announcement coordination
- a short technical write-up explaining the choreography model and its correct use boundaries relative to native atomic composition
- one developer-facing walkthrough or demo

Specific commitments:
- publish the four-party settlement scenario as a standalone example repository
- publish at least one design guide excerpt showing how to adapt the primitives to a different workflow topology

---

## Motivation

Canton's privacy model is its most important differentiator for institutional finance. But that privacy model creates a design problem that every multi-party Canton application must solve: how do you coordinate workflow progress across parties who cannot see each other's state?

Today, every team that builds a multi-party Canton workflow answers this question from scratch. The answers are inconsistent. The most common failure mode is over-disclosure — adding all parties as stakeholders on a shared coordination contract because the team doesn't know how to model the party-set transitions correctly. The second most common failure mode is off-ledger coordination — routing workflow signals through APIs and webhooks and claiming Canton only for the final settlement step, which defeats the purpose of using Canton in the first place.

A reference choreography implementation would give the ecosystem:
- a correct, documented pattern for modeling party-set transitions in Canton workflows
- a shared starting point that reduces per-team design risk for every future multi-party application
- a concrete demonstration that Canton's privacy model and multi-party coordination are complementary, not in tension
- a lower barrier to entry for institutional teams evaluating Canton for capital markets, supply chain, and regulated-industry workflows

This is the foundational coordination pattern that every serious Canton application will eventually need.

---

## Rationale

This proposal is intentionally scoped as a four-party reference implementation rather than a general workflow engine because:
- a general workflow engine is a product, not ecosystem infrastructure
- the choreography design patterns can be fully demonstrated in a single, well-chosen scenario
- reviewers can objectively verify the party-visibility guarantees in the four-party settlement scenario without requiring a broad survey of workflow topologies
- subsequent teams can adapt the four primitives to their own workflows without needing the reference to cover every possible case

The four-party equity settlement scenario is chosen because it is maximally representative: it contains party-set transitions, off-contract attestations, parallel instruction issuance, and terminal-state finality — the full design space of Canton choreography — in a single, commercially recognizable workflow that institutional evaluators understand immediately.
