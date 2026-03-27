## Development Fund Proposal

**Author:** Unlockit (luis.marado@unlockit.io)
**Status:** Submitted  
**Created:** 2026-03-27

---

## Abstract

This proposal delivers an open decentralized workflow engine for Canton to address a recurring problem in workflow-heavy multi-party applications: teams need configurable workflows, but existing approaches typically depend on a central operator to coordinate execution and composition. Unlockit has seen this demand repeatedly in customer discussions and investigated available approaches, but found that central-operator dependence makes them a poor fit for decentralized, independently owned workflow domains.

The proposed output is a bounded reference implementation consisting of a workflow-definition DSL, drawing on useful BPMN-style workflow structure where it maps cleanly, together with a reusable runtime and composition framework, example workflows, and developer documentation. The first release focuses on a constrained workflow subset that can be mapped credibly to Canton’s authorization and transaction model, including explicit staged progression and bounded atomic execution of eligible multi-step paths. Commercially, this should reduce the cost, time, and implementation risk of bringing workflow-heavy Canton applications to market by turning bespoke multi-party coordination logic into reusable infrastructure. The goal is to lower the cost of building composable workflow-heavy applications on Canton without assuming a single party owns the full end-to-end process.

---

## Specification

### 1. Objective

Deliver a reusable workflow execution layer for Canton-based applications so developers can define, execute, and monitor decentralized workflows, and compose independently owned workflow domains into larger end-to-end business processes with explicit participant roles, task progression, proof-driven state transitions, and clear domain boundaries. The execution model should support both explicit staged progression and bounded atomic execution of eligible multi-step paths where the workflow structure and required authorizations allow it. A key part of the work is to determine what level of composition is credibly achievable under Canton and Daml authorization constraints, starting from party-level composition and investigating what is required for broader all-party composition.

For the purposes of this proposal, a workflow domain is a bounded area of business logic with its own process rules and ownership. Examples include trade validation, custodian transfer, legal signing, and payment handling. Composition means coordinating workflows from those separate domains as part of a larger process definition without requiring one party to hardcode and own the full end-to-end orchestration logic.

The clearest adopters for this work are Canton application teams, Daml development teams, and institutions building workflow-heavy applications in areas such as trade operations, custody coordination, collateral handling, document-driven approvals, and regulated asset servicing. The intention is to make workflow composition on Canton easier to carry from one product context to another instead of forcing each team to rebuild multi-party coordination logic from scratch.

### 2. Implementation Mechanics

The project will produce an open reference implementation composed of:

- a workflow definition model adapted to Canton execution realities
- a reference workflow runtime for decentralized progression and synchronization
- a composition framework for combining independently owned workflow domains
- step execution rules defining which actor may execute each workflow step
- APIs, SDKs, and workflow definition interfaces
- at least two example workflows that prove the model in practice
- technical documentation and developer onboarding material

The implementation will not attempt to make Canton a full generic BPMN engine. The point is to adapt useful workflow semantics to a privacy-aware multi-party ledger model in a reusable way, with a particular focus on composability across organizational and domain boundaries.

The work is intentionally focused on execution and composition rather than on the full workflow authoring experience. Visual modeling layers, BPMN-based design tools, and domain-specific workflow UIs can sit above the runtime rather than being bundled into it. The proposed output is therefore a foundational execution substrate for decentralized workflow-heavy applications on Canton, not an end-user workflow studio.

A credible first implementation path is to define a constrained workflow-definition DSL that captures a useful subset of BPMN-inspired workflow semantics and maps them to a bounded set of Canton-native templates and execution rules. The first DSL should remain close to Canton’s execution model rather than treating BPMN tasks as purely descriptive boxes. Participant roles in the workflow should resolve to concrete party bindings, and supported step types should correspond to executable Daml actions such as contract creation, choice exercise against a known contract or interface view, bounded wait states, exclusive branching, sub-workflow continuation, and atomic execution blocks. This keeps the first release precise and reviewable: the DSL models a bounded workflow subset with explicit execution semantics, rather than claiming broad BPMN compatibility without a clear mapping to Canton authorization and transaction behavior.

This should not imply that every modeled workflow step must become an independently persisted execution step on-ledger. Where the workflow structure permits it, and where all required parties can authorize the transition at once, multiple logical workflow steps may be collapsed into a single atomic execution path rather than being materialized as separate on-ledger states. Where that is not possible or not desirable, the workflow should instead progress through explicit staged coordination. This keeps the model aligned with Canton’s transactional strengths while still supporting decomposed multi-party progression when atomic execution is not available.

A key technical constraint is authorization. In a Daml setting, broad workflow composition across multiple parties is not simply a modeling problem. It depends on what can be authorized, delegated, witnessed, and progressed without violating the ledger's participant and party semantics. For that reason, the proposal should not assume at the outset that arbitrary all-party composition is available. A more credible path is to first validate composition at a single-party or clearly bounded party-controlled level, then investigate and prototype what additional patterns, primitives, or deviations would be needed to support broader cross-party composition safely.

The first executable cut should focus on a narrow supported subset: workflow steps that can be executed, explicit step assignees or authorized actors, basic branching and joining rules, the ability to collapse eligible multi-step paths into one atomic transition, and the ability for one workflow to continue based on outputs produced by another workflow.

A strong proving scenario for the first release is a four-party token-transfer workflow involving buyer, seller, and two custodians, where a trade is proposed and accepted, an already locked token position at the source custodian is validated for transfer, and the asset is ultimately transferred into a lock under the destination custodian for the receiving party. This is a useful proving scenario because trade agreement, source-custody validation, destination-custody readiness, and final transfer can be modeled as separately owned workflow domains that must compose into one end-to-end process without relying on a central workflow operator. The scenario also shows why the execution model must support both staged and bounded atomic progression: proposal, acceptance, and custody-side checks occur as explicit workflow steps, while the final transfer may be collapsed into one atomic transition once the required authorizations and lock conditions are in place.

A second reference example could be a property-financing approval and offer workflow in which credentialed checks over selected buyer documents drive bank approval, after which the buyer creates a purchase proposal that is relayed through buyer agent and seller agent before reaching the seller. This is useful because it combines document-derived conditions, approval-gated progression, and multi-party handoff across independently owned domains without requiring one party to own the full process logic.

Initial workflow support should focus on:

- start and end events
- persisted workflow states that can be queried and inspected
- steps that can be executed by a human actor or by system logic
- explicit identification of which actor may execute each step
- sequential flow
- basic branching and joining rules, such as accept or reject and wait for both prerequisites
- bounded atomic execution of multi-step paths when the workflow structure and required authorizations allow it
- progression across multiple parties only within the validated authorization scope
- the ability for one workflow to continue after another workflow has produced a required output on the ledger
- visible and traceable workflow status for running and completed workflows

The initial implementation should not claim full BPMN coverage. Timers, escalations, compensation patterns, richer exception handling, reusable subprocess libraries, and visual designer tooling should be treated as later evolution.

### 3. Architectural Alignment

This proposal aligns with Canton’s architecture and ecosystem priorities because it builds on:

- shared coordination without a single trusted operator
- strong auditability and traceability
- privacy-aware multi-party state transitions
- application-layer and middleware reference implementations that can be reused across the ecosystem

It also fits the Development Fund focus on shared developer tooling, reference implementations, and common-good infrastructure.

### 4. Backward Compatibility

No backward compatibility impact is expected at the protocol level. The proposed work is an application-layer or middleware reference implementation and does not require a breaking change to existing Canton applications.

---

## Milestones and Deliverables

### Milestone 1: Research Baseline And Scope Definition
- **Estimated Delivery:** Month 1  
- **Focus:** Establish the modeling baseline, constraints, and proposal assumptions  
- **Deliverables / Value Metrics:**  
  - explicit note on where standard BPMN does not map cleanly to decentralized shared-state execution
  - literature-backed assessment of BPMN applicability, limitations, and required deviations or extensions for decentralized shared-state workflows
  - collaboration plan with academic institutions, with the intention to produce publishable research outputs alongside the engineering work
  - clear definition of the target use-case set, with the token-transfer and property-financing approval and offer workflows as the current reference examples unless the baseline phase identifies stronger alternatives

### Milestone 2: Workflow Model And Authorization Boundary
- **Estimated Delivery:** Month 2  
- **Focus:** Define the executable workflow model and the credible first composition boundary  
- **Deliverables / Value Metrics:**  
  - core workflow execution model and architecture note
  - cross-workflow composition model
  - explicit authorization model analysis for party-level and cross-party composition under Canton and Daml
  - supported first-cut workflow semantics and explicit later-cut deferrals
  - validation that the supported first-cut workflow semantics and authorization model are sufficient for the token-transfer and property-financing approval and offer reference examples
  - documented initial composition boundary for implementation
  - documented execution constraints for the chosen composition boundary

### Milestone 3: Runtime, APIs, And Single-Party Composition
- **Estimated Delivery:** Month 3  
- **Focus:** Build the first runnable reference runtime for the constrained workflow-definition model and prove the minimum supported execution boundary through single-party or clearly bounded composition  
- **Deliverables / Value Metrics:**  
  - running reference runtime
  - developer-facing APIs or SDKs
  - workflow definition interfaces for the supported first-cut semantics
  - step execution rules defining which actor may execute each workflow step
  - executable support for single-party composition as the minimum guaranteed composition model
  - traceable workflow state transitions demonstrated end to end

### Milestone 4: Multi-Party Composition
- **Estimated Delivery:** Month 4  
- **Focus:** Extend the runtime only within the broader multi-party composition boundary validated by the authorization analysis from Milestone 2  
- **Deliverables / Value Metrics:**  
  - runtime support for cross-workflow execution within the documented composition boundary
  - explicit multi-party composition support within the approved authorization boundary
  - explicit statement of whether broader cross-party composition beyond the delivered multi-party model is feasible in the proposed runtime model
  - if broader composition is not yet feasible, a documented gap analysis and proposed next-step architecture for enabling it

### Milestone 5: Example Workflows And Integration Hardening
- **Estimated Delivery:** Month 5  
- **Focus:** Use reference workflows to prove reuse, harden the validated runtime behavior, and prepare the output for reuse by other teams rather than introducing new core semantics  
- **Deliverables / Value Metrics:**  
  - at least two end-to-end example workflows overall
  - one example workflow covering the four-party token-transfer proving scenario
  - one example workflow covering the property-financing approval and offer scenario
  - example workflows covering distinct workflow shapes or domain boundaries
  - preparation of the example workflows and integration material in a form suitable for evaluation by external Canton teams
  - support for early evaluator review of the delivered implementation, where relevant external teams are available
  - hardening of runtime APIs and workflow definition interfaces based on the example workflows
  - documented limitations, unsupported semantics, and known constraints from the implementation work

### Milestone 6: Documentation, Public Release, And Knowledge Transfer
- **Estimated Delivery:** Month 6  
- **Focus:** Prepare release and make the output usable by other teams  
- **Deliverables / Value Metrics:**  
  - integration guide and architecture documentation
  - setup and usage instructions
  - runnable walkthroughs or reference repositories for the example workflows
  - knowledge-transfer material suitable for ecosystem reuse
  - public release package prepared for ecosystem evaluation
  - public-facing material explaining where the runtime is immediately useful, where the validated composition boundary currently ends, and how other teams can assess fit for their own use cases
  - at least one live or recorded technical session intended to onboard external developers or evaluator teams to the released implementation

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- deliverables completed as specified for each milestone
- a working reference implementation that executes decentralized multi-party workflows
- at least two reproducible example workflows
- documentation sufficient for another team to understand and evaluate adoption
- clear evidence that the output is reusable ecosystem infrastructure rather than a one-off demo

Project-specific acceptance conditions:

- workflow state progression must be visible and verifiable
- participant roles and step ownership must be explicit
- composed workflows must show how independently owned workflow domains coordinate without collapsing into one hardcoded flow
- the examples must preserve clear domain boundaries rather than flattening everything into one synthetic process
- the implementation must make clear when a modeled workflow path is executed through explicit staged progression and when it may be collapsed into one atomic ledger transition
- the implementation must clearly state the supported authorization boundary for composition, including whether the validated scope is party-level only or broader cross-party composition
- the implementation must document what workflow semantics are supported, what deviates from standard BPMN, and what is intentionally out of scope

---

## Funding

**Total Funding Request:** 750,000 CC  

### Payment Breakdown by Milestone
- Milestone 1 _(Research Baseline And Scope Definition)_: 125,000 CC upon committee acceptance
- Milestone 2 _(Workflow Model And Authorization Boundary)_: 125,000 CC upon committee acceptance
- Milestone 3 _(Runtime, APIs, And Single-Party Composition)_: 125,000 CC upon committee acceptance
- Milestone 4 _(Multi-Party Composition)_: 125,000 CC upon committee acceptance
- Milestone 5 _(Example Workflows And Integration Hardening)_: 125,000 CC upon committee acceptance
- Milestone 6 _(Documentation, Public Release, And Knowledge Transfer)_: 125,000 CC upon final release and acceptance

### Timeline Accountability
If a milestone is delayed beyond its stated delivery month for reasons under the proposer's control, the payout for that milestone should be reduced by **5% for each additional 2-week delay**, capped at **20%** for that milestone.

Delays caused by Committee-requested scope changes, dependency changes imposed by the Canton ecosystem, or other agreed external blockers should not trigger this penalty automatically and should instead be handled through explicit milestone re-planning.

### Volatility Stipulation
The planned project duration is **6 months**. On that basis, no additional volatility adjustment is assumed in this proposal.

If the project timeline extends materially beyond 6 months due to Committee-requested scope changes, any remaining milestones should be renegotiated to account for significant price volatility.

Publishable research output with academic institutions is treated as a beneficial parallel outcome of the project. It is not intended to reopen the payment or scope of the funded engineering work defined in this proposal.

Unlockit is already exploring this topic through ongoing academic partnerships and expects that work to continue regardless of the fund outcome. The requested funding is important because it would accelerate delivery beyond the pace of an academic exploration track and turn the work into a public, reusable implementation on a materially shorter timeline.

---

## Co-Marketing

Upon release, the implementing entity will work with the Foundation on more than simple visibility for the project. The aim is to help the delivered implementation reach serious technical evaluation and early reuse.

The released runtime should be easy to find, straightforward to assess, and practical to test for teams that may want to adopt, extend, or build on it. That requires clear positioning within the Canton stack, examples and documentation packaged for real evaluation, and coordination with early evaluator teams so external groups can move from interest to technical assessment with limited friction.

Accordingly, the implementing entity will collaborate with the Foundation on:

- a coordinated public announcement covering the problem, delivered artifacts, and intended ecosystem value
- a technical architecture write-up explaining the workflow model, composition boundary, and key design tradeoffs
- at least one recorded developer walkthrough showing how to define, run, inspect, and extend an example workflow using the delivered runtime
- publication of the example workflows and reference integration material in a form that other teams can clone, run, and evaluate
- a live ecosystem demo or workshop session focused on adoption, implementation constraints, and extension paths for other teams building workflow-heavy multi-party applications on Canton
- coordination with the Foundation to identify and engage early evaluator teams who can test the delivered implementation in relevant Canton workflow-heavy use cases
- active dissemination through relevant academic, research, and standards-adjacent networks, including existing connections with [INESC-ID](https://www.inesc-id.pt/), [Nova SBE](https://www.novasbe.unl.pt/en/), and related professional communities, to increase awareness of both the engineering output and the underlying workflow-composition problem

---

## Motivation

Canton is well suited to applications where several parties must coordinate process progression without handing control to one central operator. Yet in practice, workflow-heavy business processes are often split across separate systems and separate business domains. This is especially visible in financial institution coordination, where trade validation, proof generation, asset movement, and settlement are handled as distinct domains by different parties or systems. Similar fragmentation also appears in property closing, where payment or escrow release, contract signing, transaction progression, and compliance checks are handled separately.

Canton is at a point where the underlying privacy and coordination primitives are already strong, but the application-layer workflow baseline is still missing. Closing that gap would shorten the path from architecture to working implementation for workflow-heavy use cases and make Canton easier to recognize as a platform for operational coordination as well as asset and contract representation.

For Unlockit, demand for configurable workflows is well established. The ability for customers to define or adapt their own workflow logic has repeatedly come up across customer conversations and product exploration. Customers do not want every variation in approvals, handoffs, evidence checks, or exception paths to require bespoke engineering work. They want controlled configurability so the product can adapt to their operating model instead of forcing them into one fixed flow.

Unlockit is approaching this from direct product work with proof-driven, multi-party processes where independently owned participants, privacy constraints, and verifiable progression are baseline requirements. That practical grounding matters, but the intended output is still reusable ecosystem infrastructure rather than a product feature tied only to Unlockit’s immediate market focus.

This is also not a gap that Unlockit is identifying only in the abstract. It is something the team has already investigated in practice. That work clarified the need: the key issue with the existing approaches was dependence on a central operator. They could support workflow configuration, but only by making one party or one platform the trusted coordinator of execution and composition. That does not match the decentralized trust model required for credible composition across independently owned domains. This is a significant reason why building the framework has become an active product and ecosystem consideration.

The difficulty is that configurable workflows are already hard in a centralized product, and materially harder in a decentralized one. In a centralized stack, one operator can own the workflow engine, the execution order, and the trust assumptions. In a decentralized ecosystem, that option is not available. If multiple organizations need to compose workflow behavior, the model cannot rely on one shared operator to coordinate execution implicitly. The workflow logic has to remain trustworthy even when the participating parties are independent, their domains are separately owned, and progression depends on explicit authorization, shared state, and verifiable outputs rather than central control.

Today, those flows are typically connected in a fragmented and fragile manner. Each organization optimizes for its own domain, but composition across organizations is expensive and often custom-built for each use case. A simple example is when a trade between a party and a counterparty is validated in one workflow domain, proofs are generated for both sides, and custodians should only move assets after receiving the right proof and satisfying either an automatic acceptance rule or a human review path. An open workflow engine would address that gap directly by allowing workflow logic to be built independently and then composed into larger multi-party processes through a workflow model inspired by BPMN but adapted to decentralized shared-state execution. That would strengthen Canton’s applicability to operational coordination use cases and would create a visible reference implementation that other teams can adopt, extend, or evaluate.

---

## Rationale

The proposal backs a concrete and reusable infrastructure layer rather than an open-ended research track. The workflow engine can be built and validated through clear milestones, and its value can be demonstrated with example workflows, workflow composition across independently owned domains, and public documentation.

The economic case is strongest when this is treated as one focused reference implementation rather than as a broad workflow platform build. Putting effort into execution semantics, validated composition boundaries, and reusable example workflows is a better ecosystem investment than letting similar workflow logic be re-implemented independently across separate teams and domains.

There is also a sound business rationale behind this proposal. Unlockit expects this kind of framework to enable future product features in areas where customers want configurable process logic without bespoke implementation every time. At the same time, this is not narrow enough to justify solving only as a proprietary product feature for Unlockit’s current market focus. The problem is more horizontal than that. It appears across industries, across workflow-heavy products, and across decentralized coordination scenarios.

The Development Fund fits this work because Unlockit is prepared to initiate it while the intended outcome extends beyond Unlockit itself. The desired result is a reusable framework that other teams can adopt, extend, and evaluate in domains beyond Unlockit’s immediate priorities. If the initial implementation demonstrates value, it should establish a foundation for further contributions, additional workflow patterns, and future implementations beyond the originating use cases.

The proposal is also strongly aligned with the Development Fund because:

- it creates reusable ecosystem infrastructure
- it lowers implementation cost for future teams
- it is open and reusable
- it strengthens Canton’s story in a category where it has architectural strengths but lacks a reusable reference
- it addresses a coordination problem that appears across multiple domains rather than only one vertical

The main design choice is to fund a focused reference implementation instead of a full generic workflow platform. That keeps scope realistic while still producing something that the ecosystem can use and build on. It also leaves room for a broader community to extend the framework over time instead of pretending that one funded project should solve the whole workflow problem in one pass.

Unlockit is also open to align with and contribute to adjacent ecosystem efforts that extend the usability and reach of this work. In particular, visual workflow-definition and modeling layers could become valuable complements to the core runtime and composition framework proposed here. Those higher-level experiences matter, but they depend on a credible execution and composition foundation. This proposal is focused on establishing that foundational layer.

A clear workflow-semantics scope definition is necessary because the initial implementation needs an explicit boundary around which executable workflow shapes are supported, where standard BPMN falls short, and what remains intentionally deferred. Existing research on blockchain-oriented business process modeling already points in this direction. [Milani, García-Bañuelos, Filipova, and Markovska (2021)](https://doi.org/10.1108/BPMJ-06-2020-0263) argue that neither BPMN nor CMMN fully and accurately represent certain blockchain-specific patterns, and specifically note gaps around blockchain-oriented modeling concerns. [Guerreiro et al.](https://emisa-journal.org/emisa/article/view/221) report lessons learned about the appropriateness of BPMN for blockchain applications in practice. More recently, [BPMN4BC](https://design.inf.usi.ch/publications/2025/icsoc) proposes an explicit BPMN extension for blockchain-enabled process modeling, which is itself evidence that standard BPMN is not sufficient for these scenarios. A decentralized shared ledger is not naturally represented as a standard BPMN participant, and proof generation, shared-state visibility, and proof-triggered progression do not map cleanly to off-the-shelf BPMN semantics without deviations or extensions. BPMN is therefore better treated here as an inspiration for orchestration vocabulary than as the exact execution contract.

That also creates room for a defensible research step up front, ideally carried out with academic institutions, so the execution model is grounded in evidence and can lead to academic papers as well as reusable ecosystem software. If the work proves relevant in practice, it can also attract continued interest from academic institutions and strengthen Canton’s visibility as a technology that supports innovation across multiple sectors, not only finance.