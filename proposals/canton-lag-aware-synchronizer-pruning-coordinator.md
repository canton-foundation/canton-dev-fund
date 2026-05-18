## Development Fund Proposal: Lag-Aware Synchronizer Pruning Coordinator

**Author:** Srikanth (BitDynamics)  
**Status:** Submitted  
**Created:** 2026-03-22  

---

## Abstract

This proposal requests funding for an open-source operator toolkit for **lag-aware, policy-driven synchronizer pruning coordination** across sequencer, mediator, and BFT-orderer components.

Canton already provides pruning commands and scheduling capabilities, but safe pruning remains operationally complex. Sequencer pruning can be blocked by inactive clients, force-pruning can disable members, BFT-orderer retention requires operator judgment, and the relationship between acknowledgements, lagging members, and safe pruning windows is still too manual for many teams.

The proposed project, **Lag-Aware Synchronizer Pruning Coordinator**, will provide:

- a unified status collector for sequencer, mediator, and BFT-orderer pruning state
- dry-run pruning plans with blocker diagnosis and impact analysis
- a policy engine for coordinated pruning schedules and retention guardrails
- audit-friendly reports, dashboards, and operator runbooks

The goal is not to change Canton pruning semantics and not to automate destructive actions blindly. The primary value of the project is diagnostics, normalization, and operator decision support. Execution capabilities, if included, remain explicitly policy-gated and secondary to the dry-run and reporting path. The goal is to reduce operator error, storage sprawl, and recovery risk by making existing pruning workflows safer and easier to understand.

---

## Team Background

### BitDynamics

BitDynamics brings deep experience in building and operating blockchain infrastructure. The team has worked across Ethereum client infrastructure, validator operations, and production-grade hosting systems supporting validator infrastructure securing more than 2 billion AUD in assets. This background is directly relevant to building reliable, auditable, and security-conscious public infrastructure for a grants program. The team is also building actively on Canton.

---

## Specification

### 1. Objective

The objective is to reduce operational risk and cost around synchronizer pruning by publishing a concrete, open-source pruning coordination toolkit that helps operators:

- understand why pruning is blocked
- estimate the impact of pruning choices before executing them
- coordinate pruning across sequencer, mediator, and BFT-orderer layers
- schedule routine pruning with safer defaults and clearer observability

The intended outcome is that a synchronizer operator can:

- inspect pruning state across relevant components in one place
- identify lagging or inactive members that block safe pruning
- simulate pruning actions before making a change
- apply documented policies instead of relying on ad hoc judgment

This proposal is explicitly framed as **operator infrastructure** and a **reference implementation**, not as a protocol change and not as a new pruning algorithm.

### 1.1 Validated Need

This proposal is based on a recurring operator pain pattern rather than an abstract tooling idea.

The need is directly grounded in current Canton pruning workflows as documented today: safe pruning remains conditional on lag, acknowledgements, retention posture, and operator judgment across multiple component surfaces rather than one simple health check.

Across real Canton operations work, pruning is one of the places where teams most often fall back to expert-only manual judgment:

- determining whether pruning is blocked by lagging or inactive members
- distinguishing safe pruning from force-pruning with member impact
- reasoning about BFT retention state separately from sequencer and mediator state
- explaining pruning posture to auditors, SREs, and platform operators in a reviewable way

The intended first-wave users are synchronizer operators, platform engineers, and SRE teams who already run Canton or are preparing to run it in more production-like environments. The project is therefore designed around operator workflows first, not around a hypothetical future product surface.

### 2. Implementation Mechanics

The project will be delivered as:

- a status collector and planner for synchronizer pruning
- a dry-run analysis engine with lag-aware diagnostics
- a policy and scheduling layer for coordinated pruning
- dashboards, reports, and operator documentation

The implementation is guided by four design principles:

- **Status normalization is the heart of the system.** The core engineering investment is in the `StatusNormalizer`, `SafePointCalculator`, and `BlockerDiagnoser`, because operator trust depends on these layers being correct and well-tested.
- **Adapter traits must support partial capability.** Sequencer, mediator, and BFT-orderer components do not expose identical operational surfaces. The toolkit must work even when one adapter exposes less information, returning explicit unknown or unsupported states rather than failing the whole workflow.
- **Diagnostics come before execution.** The first release is centered on collection, normalization, dry-run planning, blocker diagnosis, and audit output. Execution remains optional and policy-gated.
- **BFT orderer support must degrade gracefully.** Because BFT retention and pruning surfaces may be weaker or less uniform than sequencer and mediator surfaces, the design must handle partial or unavailable BFT data as a first-class operating condition. In v1, BFT support is explicitly limited to read-only and diagnostic-first coverage where supported, rather than full coordination or execution parity.

#### A. Unified Pruning Status Collection

The implementation will gather and normalize pruning-relevant information such as:

- sequencer pruning status and safe pruning timestamps
- lagging or inactive client acknowledgements
- mediator pruning status
- BFT-orderer retention and pruning schedule state
- policy inputs such as retention windows and minimum blocks to keep

The goal is to provide one operator view of pruning posture instead of several disconnected command outputs.

For v1, the minimum expected BFT-orderer scope is:

- read-only collection of available retention and pruning-related state where exposed
- explicit reporting when a BFT adapter cannot expose one of the desired surfaces
- conservative planner behavior that narrows or lowers-confidence recommendations when BFT visibility is partial

The first funded release does **not** require BFT-orderer execution support to be considered successful.

The collector layer will be built around adapter capability declarations so that each component can report what it supports, for example:

- pruning status
- acknowledgements
- safe pruning timestamps
- retention state
- execution support

If an adapter does not support one of these surfaces, the unified status model will record that explicitly rather than treating it as a hard failure.

#### B. Dry-Run Planning and Blocker Diagnosis

The coordinator will compute a dry-run pruning plan that explains:

- what can be pruned safely under current conditions
- what cannot be pruned yet and why
- which clients or nodes are blocking progress
- what the likely impact would be of force-pruning or disabling blockers

The design priority is decision support, not hidden automation.

The planner will treat partial information conservatively. Missing or unsupported state from one component will reduce confidence and narrow the suggested safe pruning range, rather than silently assuming safety.

#### C. Policy Engine and Scheduling

The toolkit will support configurable operator policies such as:

- minimum retention windows
- minimum BFT blocks to keep
- maximum tolerated lag before raising warnings
- approval requirements before force-prune actions
- scheduled pruning windows and maintenance policies

The project does not attempt to replace human governance. It gives teams a safer, repeatable way to express and apply their pruning policy.

In the first release, policy is primarily used to classify, gate, and explain actions. Scheduled execution remains an optional secondary layer and is not the primary acceptance target for the proposal.

#### D. Audit Trail and Safety Reports

Every planned or executed pruning workflow should leave a clear record.

The coordinator will produce:

- dry-run reports
- execution summaries
- blocker and member-impact reports
- scheduled-run logs suitable for audits and incident review

This is especially important when a workflow could disable lagging clients or otherwise affect future recoverability.

#### E. Dashboards and Runbooks

The project will include operator-facing materials such as:

- dashboards or report views for pruning state and lag
- suggested alert conditions
- safe operating procedures for routine pruning
- escalation notes for blocked or risky scenarios

The goal is to reduce the amount of expert-only knowledge needed to run a healthy synchronizer.

#### F. Early Vertical Slice

To keep the project grounded and reviewable, the first implementation milestone will prove one end-to-end slice early:

- simulated clients for sequencer, mediator, and BFT-orderer components
- unified status collection with partial-capability handling
- one operator-facing CLI status command
- JSON and table output for normalized pruning posture

This ensures the project demonstrates real operator value before later dashboard or optional execution work begins.

#### Explicitly Out of Scope

To keep the proposal narrow and approval-friendly, the following are out of scope:

- redefining Canton pruning semantics
- changing protocol guarantees around acknowledgements or recoverability
- automatic disabling of members without explicit operator policy
- participant-side application recovery beyond documented pruning interactions
- replacing existing Canton admin APIs
- mandatory automated pruning execution in the first release

### 3. Architectural Alignment

This proposal aligns strongly with Canton operations because it improves the usability of already documented system capabilities:

- sequencer pruning and forced pruning
- mediator pruning
- BFT-orderer retention management
- lagging-member diagnosis

It complements existing Canton infrastructure without competing with it:

- it does **not** change consensus
- it does **not** replace logical synchronizer migration
- it does **not** duplicate topology-composer work

It provides operator tooling and guidance around a real and recurring synchronizer maintenance task.

The project is intentionally positioned as **diagnostics and planning infrastructure** rather than pruning automation. That makes it safer to adopt, easier to evaluate, and more reusable across operators with different governance and maintenance practices.

### 4. Delivery Feasibility

This proposal is intentionally scoped as tooling around existing surfaces:

- one unified status model
- one dry-run planner
- one policy/scheduler layer
- one operator dashboard/reporting path

The project is comparatively feasible because the riskiest work is concentrated in normalization and diagnosis rather than protocol or storage-engine changes. The first release can provide immediate value even if some adapters expose partial capability or execution support remains disabled.

Because it is largely built around existing admin surfaces and pruning workflows, the implementation is comparatively low-risk and highly testable.

### 5. Risks and Mitigations

- **Operator over-automation risk:** the first release centers on dry-run reports, approvals, and policy controls before any optional execution path.
- **Misleading safety assumptions:** reports and documentation will distinguish clearly between safe pruning, forced pruning, and workflows that disable lagging members.
- **Scope creep into protocol changes:** the proposal remains focused on coordination and diagnostics around existing pruning behavior.
- **Fragmented node environments:** the toolkit uses a normalizing status model so it can work with mixed synchronizer operator setups without requiring a monolithic deployment pattern.
- **Partial BFT visibility:** the adapter capability model allows the system to degrade gracefully and present explicit unknown states when a component cannot expose every desired signal.

### 6. Backward Compatibility

No backward compatibility impact is intended.

This project is additive. It introduces a new operator coordination layer around existing pruning commands and status surfaces.

---

## Milestones and Deliverables

### Milestone 1: Public Alpha for Pruning Posture Visibility

An operator can inspect normalized pruning posture, blockers, and safe bounds across the supported components from one toolkit.

### Milestone 2: External Operator Evaluation

At least one operator or evaluator runs the toolkit against a realistic reference setup and records whether the dry-run output actually improves decision-making.

### Milestone 3: Hardened Diagnostics and Policy Release

Feedback is incorporated into planner output, policy gating, conservative degraded-mode behavior, and audit-friendly reporting.

### Milestone 4: Adoption-Ready Operator Package

Dashboards or report views, runbooks, and release materials are strong enough for another operations team to adopt directly.

---

## Potential Ecosystem Beneficiaries

This proposal is intended as public-good infrastructure for the wider Canton ecosystem, and I have identified a few ecosystem teams that are well aligned with the feature set and have expressed interest in this kind of capability, including `Gateway`, `Lumens.fi`, and `H20Nodes`.

These features address recurring operational pain that teams in this category face when building or operating Canton-based systems, especially around lagging members, blocked pruning windows, retention uncertainty, and growing infrastructure state.

More broadly, this project is useful for all teams operating Canton synchronizers or validator infrastructure, improving pruning visibility, and reducing the operational risk of retention and cleanup workflows.



## Acceptance Criteria

The Tech & Ops Committee can evaluate completion based on:

- successful collection and normalization of pruning state across sequencer, mediator, and BFT-orderer layers
- dry-run plans that correctly identify blockers and safe pruning opportunities in a reference environment
- operator-visible reports for lagging or inactive members that affect pruning
- policy-driven approval and dry-run planning demonstrated in a reference environment
- audit-friendly output for planned and executed workflows
- publication of dashboards or equivalent report views plus runbook documentation
- the project being released as open source
- one explicit blocked-pruning reference scenario where an inactive or lagging member prevents the recommended safe prune range
- one explicit partial-visibility reference scenario where BFT-orderer data is incomplete or unsupported and the planner degrades conservatively rather than assuming safety
- one explicit force-prune preview scenario where the toolkit reports likely member impact before any higher-risk action can be approved

Project-specific acceptance conditions:

- the project must remain a coordination and diagnostics layer rather than a protocol change
- higher-risk actions must remain policy-gated and operator-visible
- documentation must clearly explain the difference between standard pruning, forced pruning, and member-disabling effects
- the toolkit must remain useful when one adapter exposes only partial capability or unsupported surfaces

---



## Funding

**Total Funding Request:** 750,000 CC

### Payment Breakdown by Milestone

- Milestone 1 - 170,000 CC upon committee acceptance of the Unified Pruning Status Collector.
- Milestone 2 - 220,000 CC upon committee acceptance of the Dry-Run Planner and Blocker Diagnosis.
- Milestone 3 - 220,000 CC upon committee acceptance of the Policy Engine and Coordinated Scheduling.
- Milestone 4 - 140,000 CC upon final release and acceptance of the Dashboards, Runbooks, and Documentation.

### Funding Rationale

- This proposal is priced as operator diagnostics and planning infrastructure built around existing Canton administrative surfaces, not as a protocol or storage-engine change.
- Milestone 1 funds the most important engineering layer: the normalized status model, adapter capability handling, and the first end-to-end operator-facing CLI slice.
- Milestone 2 funds the core reasoning engine of the project: safe-point calculation, blocker diagnosis, and impact-aware dry-run planning.
- Milestone 3 funds policy expression, guardrails, and optional coordinated workflows while keeping execution explicitly secondary and gated.
- Milestone 4 funds adoption and usability: dashboards, reports, runbooks, and open-source packaging for real operator teams.

### Volatility Stipulation

If the project duration extends materially due to committee-requested scope changes, remaining milestone amounts should be renegotiated for material CC/USD volatility.

No speculative external audit funding is requested in this proposal.

---

## Co-Marketing

Upon release, the implementing entity will collaborate with the Foundation on:

- announcement coordination for the open-source release
- a technical blog or operator-facing write-up covering pruning safety workflows
- one ecosystem-facing demo or walkthrough focused on real synchronizer operations scenarios

---

## Motivation

Synchronizer pruning is a real operational requirement, not an optional optimization. As Canton deployments become more production-like, teams need to control storage growth, keep retention posture understandable, and avoid accidental recovery-risk decisions during maintenance windows.

Today, that work is still too dependent on expert interpretation of multiple component surfaces. This creates operational drag for smaller teams, increases the chance of inconsistent pruning decisions, and makes it harder to explain maintenance posture to platform teams, auditors, and incident responders.

An open-source pruning coordinator improves the ecosystem by turning a fragmented operator workflow into a repeatable and reviewable one. It helps more teams run Canton safely without requiring deep internal expertise for every pruning decision.

---

## Rationale

This proposal deliberately focuses on diagnostics, planning, and policy guardrails instead of protocol changes.

That is the right first step for three reasons:

- the problem is immediate and operational today, even without any new pruning semantics
- existing Canton surfaces already expose enough signal to deliver meaningful operator value
- a conservative coordination layer is easier to review, safer to adopt, and more likely to be reused across different operator environments

Alternative approaches were considered and intentionally rejected for the first release:

- building a more aggressive pruning automation engine by default
- coupling the work to consensus, storage-engine, or BFT protocol changes
- bundling the project into a broader operator suite without proving the pruning workflow value first

The proposed approach keeps scope narrow, adoption practical, and risk low while still addressing a high-friction part of real Canton operations.

---

## Maintenance and Evolution

The initial grant funds the reference implementation, documentation, and public release. After release, the project will be maintained in the open through normal repository-based workflows, issue tracking, and versioned releases.

The intended long-term path is to keep the toolkit aligned with evolving Canton pruning commands, BFT-orderer retention practices, and synchronizer operator workflows. If appropriate and accepted by maintainers, the toolkit may later be upstreamed into a broader Canton operations or SRE tooling repository.
