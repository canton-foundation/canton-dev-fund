## Development Fund Proposal

**Author:** Unlockit (luis.marado@unlockit.io)
**Status:** Submitted  
**Created:** 2026-04-10

---

## Abstract

This proposal delivers **Canton Allocation Primitives (CAP)**, an open-source reference implementation for privacy-preserving multi-party allocation and decision workflows on Canton. Today, teams that need auctions, voting, quorum checks, or rule-based allocation flows must rebuild the same private submission, aggregation, and execution patterns themselves, with no production-ready shared implementation to build on.

These patterns are often associated with DAO governance, but they extend well beyond that context. The same underlying mechanics appear in auctions, consortium approvals, committee decisions, and other multi-party coordination workflows where private inputs, rule-based resolution, and verifiable downstream execution matter.

CAP addresses that gap with a bounded but extensible first release: a shared core for privacy-preserving submission, aggregation, settlement, and expiry handling, plus two initial modules for **governance** and **auctions**, together with reference applications and documentation for reuse and extension. The first release is intended to prove the core against two equally important workflow families already visible in practice: competitive allocation workflows such as auctions and issuance-related allocation, and institution-facing governed-asset workflows where approvals, thresholds, protected reserves, and downstream execution have to hold under explicit rules. This direction is grounded both in concrete tokenized issuance and allocation needs and in live institutional use cases seen by Unlockit, where governed collective assets require private participation, role-based decision rights, threshold checks, reserve protections, and auditable downstream execution across multiple stakeholders.

The goal is not to build a universal DAO platform or solve every allocation pattern at once. The goal is to give the Canton ecosystem a reusable foundation and reference implementation for a class of coordination problems that Canton is well suited to support but does not yet serve with shared infrastructure.

CAP is designed to sit above existing Canton asset and settlement infrastructure, so teams can reuse allocation and decision mechanics without replacing the token and transfer layers they already depend on.

---

## Specification

### 1. Objective

Deliver a reusable reference implementation for allocation and decision workflows on Canton so developers can model, execute, and evaluate multi-party submission, aggregation, and executable outcome patterns without rebuilding the same coordination structure from scratch.

The first release should cover a narrow but meaningful class of allocation and decision problems:

- private submission by multiple parties
- time-bounded participation windows
- pluggable aggregation and resolution rules
- deterministic winner or outcome determination
- atomic downstream settlement or action execution when the collected authorities allow it
- clear visibility and auditability boundaries enforced by Canton and Daml

The intended outcome is that a Canton team can adopt CAP to build:

- majority, weighted, or quadratic voting flows
- proposal approval workflows with downstream execution hooks
- sealed-bid or multi-unit auction flows
- future allocation-style modules built on the same submission and aggregation core

For the purposes of this proposal, an allocation problem is any workflow where multiple parties submit private or semi-private inputs under a rule, the system aggregates them into an outcome, and the outcome may trigger settlement, parameter change, resource assignment, or another executable consequence.

This proposal is aimed at Canton teams that need reusable decision and allocation mechanics, including developers building governance flows, approval processes, auction-style allocation, and related multi-party coordination patterns. The purpose is to cut down repeated implementation of the same submission, resolution, and outcome logic across different application contexts.

### 2. Implementation Mechanics

The project will produce an open reference implementation composed of:

- a shared allocation core for submission, aggregation, settlement, and expiry handling
- a governance module covering proposal lifecycle, voting, approval logic, and execution hooks
- an auctions module covering sealed-bid, Dutch, and multi-unit auction formats
- Daml packages, APIs, example applications, and developer documentation
- an extension guide for future community-built modules

The implementation will not attempt to make Canton a universal governance platform or a complete marketplace engine. The point is to identify the shared structure of a useful class of allocation problems and implement that structure once in a reusable way.

The first release should be evaluated as a bounded proof of shared structure, not as a complete allocation platform. Its purpose is to show that one reusable core can support both a competitive allocation flow and an institution-facing governed approval flow without rebuilding the underlying submission, aggregation, settlement, and expiry mechanics each time. Auctions and governance are therefore not competing explanations for the project; they are the two proving domains that demonstrate the same execution model under different real-world pressures. Phase 1 is limited to a narrow but reusable set of governance and auction formats, together with the shared execution model they depend on. Broader market-design problems, full DAO operating stacks, generalized marketplace backends, prediction markets, treasury systems, and other allocation-heavy applications remain outside the scope of this initial release.

A credible first implementation path is to define a bounded core around four reusable concepts:

- **Submission workflow:** invite, submit, close, reclaim, and timeout behavior for multi-party participation
- **Aggregation rules:** pluggable resolution functions that turn submissions into an allocation or governance outcome
- **Settlement or action execution:** an executable result object carrying the authority needed for atomic downstream execution where possible
- **Time guards and expiry:** deadlines, reclaim rules, and non-blocking recovery so workflows do not stall on inactive participants

This shared structure becomes `cap-core`, with domain-specific modules built on top:

- `cap-governance`
- `cap-auctions`

#### Core Layer: `cap-core`

The core captures the common structure of allocation workflows on Canton through four abstract components.

**Submission workflow**  
Each participant receives an invitation contract and submits through a privacy-preserving invite → submit → close lifecycle. A submission is visible only to the submitter and the allocator or resolver parties who legitimately need to see it. Time bounds enforce deadlines, expired invitations can be reclaimed, and the workflow continues even if a participant goes offline after submitting or fails to act before expiry.

**Aggregation rules**  
The core exposes pluggable aggregation hooks that process collected submissions into an outcome. The core may provide baseline patterns such as weighted, ranked, or threshold aggregation, while domain modules implement their own domain-specific resolution logic such as second-price auction settlement, quorum checks, or weighted governance approval.

**Settlement or action execution**  
The output of the allocation phase is not just a decision value. It is an executable settlement or action instruction represented as a Daml contract carrying the authority collected during the workflow. Where all required parties have authorized the resulting action, the allocator or executor can perform the outcome atomically. This allows winning bids to settle, governance proposals to trigger downstream action, or future modules to allocate scarce resources without introducing an extra off-ledger trust layer.

Some of this design space has precedent in earlier Daml work, including the contingency-claims library that formed part of Daml Finance. While that work was developed under different token-standard and ecosystem assumptions than today's Canton Network, it may still provide useful technical reference points for modeling conditional rights, claim resolution, and executable outcome structures within CAP.

**Time guards and expiry**  
All workflows are time-bounded with configurable deadlines. Late submissions are rejected, expired invitations can be reclaimed, and escrowed or reserved resources can be released on timeout. The model is explicitly non-blocking: it must never depend on every participant remaining online until the final resolution step.

#### Governance Module: `cap-governance`

The governance module is the main governance-oriented reference implementation in the first release. It should cover:

- proposal creation
- private or semi-private ballot submission
- quorum and approval threshold checks
- weighted voting support
- delegated voting where relevant
- downstream execution hooks after approval

The first supported governance formats should be:

- **Majority vote** with configurable quorum and approval threshold
- **Weighted vote** where voting power is determined by stake, token holdings, or an external weight input
- **Quadratic vote** where voting intensity is expressed through quadratic cost mechanics

The point is not to solve every DAO model. The point is to provide a concrete governance reference implementation that other teams can adapt to real approval and decision flows on Canton.

#### Auctions Module: `cap-auctions`

The auctions module demonstrates that the same core can support another class of allocation problem without redesigning the underlying coordination model.

The first supported auction formats should be:

- **Sealed-bid first-price and second-price auctions**
- **Dutch auctions** with descending price publication and first-valid-claim settlement
- **Multi-unit auctions** with uniform-price and discriminatory settlement variants

All auction formats inherit the core submission workflow, time guards, expiry handling, and settlement model. Losing bidders should not learn more than the model requires. Bid visibility and winner determination are shaped by Canton’s privacy model rather than bolted on through external cryptography.

#### Illustrative Execution Flows

To make the intended runtime more concrete, the first release should be understandable through two short reference flows that exercise the same CAP core under different rules.

**Sealed-bid auction flow**  
1. An issuer creates an auction and sends one invitation per bidder.  
2. Each bidder submits privately through their own invitation path, with visibility limited to the bidder and the allocator.  
3. After the deadline, the allocator resolves the auction according to the selected rule, such as first-price or second-price winner determination.  
4. Resolution produces an executable outcome that identifies the winning allocation and the settlement path required for completion.  
5. The winning allocation can then trigger downstream settlement through the relevant asset and transfer infrastructure, while losing or expired participation paths are released or reclaimed.

**Governed approval flow**  
1. A proposal creator issues one invitation per voter or approving party.  
2. Each participant submits a private or semi-private ballot through the same invitation and submission structure used in the auction case.  
3. After the participation window closes, the ballots are aggregated under a different rule set: quorum, threshold, weighted approval, delegation, or another supported governance rule.  
4. If the proposal passes, the result becomes an executable approval outcome rather than only a recorded vote tally.  
5. That outcome can then trigger the downstream action it authorizes, such as fund release, parameter change, or another governed execution step.

These flows are intended to show why auctions and institution-facing governed approval processes belong in the same proposal. They are different application domains, but they rely on the same private submission, rule-based resolution, and executable outcome structure.

#### Architectural Notes

CAP should remain grounded in Canton’s native strengths:

- sub-transaction privacy for need-to-know disclosure
- explicit party authorization for submission and execution
- atomic downstream action execution where the required authority has been collected
- auditable contract state and deterministic resolution logic

The implementation should support privacy-preserving multi-party operation without requiring a central operator to see everything, while still leaving room for adopters to choose more centralized visibility or operating models where that is appropriate for their governance or allocation context. It should also not rely on cryptographic privacy overlays where Canton’s own visibility model can do the job directly.

### 3. Architectural Alignment

This proposal aligns with Canton’s architecture and ecosystem priorities because it builds on:

- privacy-aware multi-party state transitions
- auditable decision and allocation flows
- explicit participant authorization
- application-layer reference implementations reusable across domains

It also fits the Development Fund focus on shared developer tooling, reference implementations, and common-good infrastructure.

This is ecosystem infrastructure rather than a one-off application. The governance and auctions modules are the first proof points, but the deeper value is the reusable allocation core.

CAP is intended to compose with existing Canton asset and settlement infrastructure rather than replace it. The allocation and governance flows determine outcomes; existing token and settlement layers remain responsible for asset representation and transfer.

### 4. Backward Compatibility

No backward compatibility impact is expected at the protocol level. The proposed work is a new application-layer library and set of reference implementations. Existing Canton applications and protocol behavior remain unchanged.

---

## Milestones and Deliverables

### Milestone 1: Core Design And Scope Definition
- **Estimated Delivery:** Month 1  
- **Focus:** Define the CAP core, release boundaries, and reusable abstract interfaces for submission, aggregation, settlement, and expiry handling  
- **Deliverables / Value Metrics:**  
  - design document for `cap-core`
  - documented first-release scope and explicit out-of-scope items
  - prototype implementation of invite → submit → aggregate → settle lifecycle on a Canton sandbox
  - documented extension points for governance and auction modules

### Milestone 2: First Runtime Slices In Both Proving Domains
- **Estimated Delivery:** Month 2  
- **Focus:** Validate the shared core early in both a governed approval flow and a competitive allocation flow  
- **Deliverables / Value Metrics:**  
  - majority-vote implementation as the first governance reference slice
  - sealed-bid first-price or second-price auction implementation as the first auction reference slice
  - governance-specific proposal, ballot, quorum, and execution-hook model on top of `cap-core`
  - auction-specific invitation, submission, winner-resolution, and settlement model on top of `cap-core`
  - initial private or semi-private ballot handling and private bid handling
  - Daml script and sandbox integration tests for both first supported slices
  - documented design path for the remaining governance and auction formats

### Milestone 3: Governance Module Expansion
- **Estimated Delivery:** Month 3  
- **Focus:** Expand the governance module from the initial slice to the broader bounded first-release governance set  
- **Deliverables / Value Metrics:**  
  - weighted-vote implementation
  - quadratic-vote implementation
  - hardened quorum, threshold, delegation, and result-resolution logic across governance formats
  - downstream execution-hook model for approved proposals
  - Daml script and sandbox integration tests for all supported governance formats

### Milestone 4: Auctions Module Expansion
- **Estimated Delivery:** Month 4  
- **Focus:** Expand the auction module from the initial slice to the broader bounded first-release auction set  
- **Deliverables / Value Metrics:**  
  - completion of sealed-bid first-price and second-price auction support
  - Dutch auction implementation
  - multi-unit auction implementation with at least one tie-breaking rule
  - auction-specific submission, timeout, reclaim, escrow, and settlement behavior on top of `cap-core`
  - Daml script and sandbox integration tests for all supported auction formats

### Milestone 5: Reference Applications And Integration Hardening
- **Estimated Delivery:** Month 5  
- **Focus:** Demonstrate end-to-end reuse through concrete applications and harden the shared core behavior  
- **Deliverables / Value Metrics:**  
  - at least four reference applications:
  - sealed-bid auction for a tokenized asset with settlement
  - multi-unit auction with partial fills
  - consortium governance vote with downstream proposal execution
  - quadratic voting allocation example
  - preparation of the reference applications and integration material in a form suitable for evaluation by external Canton teams
  - support for early evaluator review of the delivered implementation, where relevant external teams are available
  - Canton testnet deployment or equivalent public reference environment
  - load or concurrency testing with documented constraints

### Milestone 6: Documentation, Extension Guide, And Open-Source Release
- **Estimated Delivery:** Month 6  
- **Focus:** Prepare CAP for evaluation, adoption, and future extension by other teams  
- **Deliverables / Value Metrics:**  
  - API documentation for the public Daml packages
  - developer tutorials and setup instructions
  - extension guide showing how to build a new module on `cap-core`
  - open-source release under Apache 2.0 or equivalent
  - at least one public walkthrough, blog post, or developer-facing tutorial
  - public-facing material explaining where CAP is immediately useful, where the first-release boundary currently ends, and how other teams can assess fit for their own use cases
  - at least one live or recorded technical session intended to onboard external developers or evaluator teams to the released implementation

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- deliverables completed as specified for each milestone
- a working reusable `cap-core` supporting submission, aggregation, executable outcome generation, and expiry handling
- a working governance reference implementation built on that core
- a working auctions reference implementation built on that core
- documentation sufficient for another team to understand the supported model, evaluate adoption, and extend it within the documented boundaries
- clear evidence that the output is reusable ecosystem infrastructure rather than a one-off demo

Project-specific acceptance conditions:

- submission visibility must remain limited to the required parties for each supported flow
- supported governance flows should demonstrate private or semi-private ballot handling, quorum or threshold evaluation, and deterministic outcome resolution
- supported auction flows should demonstrate private bid handling, deterministic winner determination, and reclaim or release behavior for non-winning or expired participation paths
- supported workflows should define bounded participation windows and recovery behavior for inactive participants
- at least one shared core behavior should be shown operating across both governance and auction flows without requiring a separate core implementation
- where downstream execution is claimed to be atomic, the implementation should show that the required authority was collected before execution
- the implementation should clearly document what CAP covers in the first release and what remains intentionally out of scope

---

## Funding

**Total Funding Request:** 750,000 CC  

The requested funding should be scoped to a bounded reference-implementation effort rather than a maximal governance or marketplace platform build. It is meant to cover the design, implementation, validation, and publication of `cap-core`, the supporting governance and auctions modules, the reference applications required for ecosystem evaluation, and the documentation needed for reuse and extension. It does not assume delivery of full DAO platform functionality, universal market design support, tokenomics frameworks, or every possible allocation mechanism.

### Payment Breakdown by Milestone
- Milestone 1 _(Core Design And Scope Definition)_: 125,000 CC upon committee acceptance
- Milestone 2 _(Governance Module Design And First Runtime Slice)_: 125,000 CC upon committee acceptance
- Milestone 3 _(Governance Module Expansion)_: 125,000 CC upon committee acceptance
- Milestone 4 _(Auctions Module)_: 125,000 CC upon committee acceptance
- Milestone 5 _(Reference Applications And Integration Hardening)_: 125,000 CC upon committee acceptance
- Milestone 6 _(Documentation, Extension Guide, And Open-Source Release)_: 125,000 CC upon final release and acceptance

### Timeline Accountability
If a milestone is delayed beyond its stated delivery month for reasons under the proposer’s control, the payout for that milestone should be reduced by **5% for each additional 2-week delay**, capped at **20%** for that milestone.

Delays caused by Committee-requested scope changes or dependency changes imposed by the Canton ecosystem should not trigger this penalty automatically and should instead be handled through explicit milestone re-planning.

### Volatility Stipulation
The planned project duration is **6 months**. On that basis, no additional volatility adjustment is assumed in this proposal.

If the project timeline extends materially beyond 6 months due to Committee-requested scope changes, any remaining milestones should be renegotiated to account for significant price volatility.

Unlockit is already exploring these topics through ongoing academic partnerships and expects that work to continue regardless of the fund outcome. The requested funding matters because it would accelerate delivery beyond the pace of an academic exploration track and turn that work into a public, reusable reference implementation on a materially shorter timeline.

---

## Co-Marketing

Upon release, the implementing entity will work with the Foundation to help the delivered implementation move from publication to actual reuse.

CAP should be easy to inspect, straightforward to trial, and concrete enough for teams to judge whether its shared mechanics fit their own governance, approval, or allocation needs. That depends on clear positioning within the Canton stack, reference applications packaged for real evaluation, and support for early evaluator teams exploring adjacent use cases.

Accordingly, the implementing entity will collaborate with the Foundation on:

- a coordinated public announcement covering the problem, delivered artifacts, and intended ecosystem value
- a technical architecture write-up explaining the CAP core, the governance reference model, the auction reference model, and the key design tradeoffs behind the shared execution structure
- at least one recorded developer walkthrough showing a reference governance flow and a reference auction flow, together with the shared CAP core behavior they rely on
- publication of the reference applications and integration material in a form that other teams can clone, run, and evaluate
- a live ecosystem demo or workshop session focused on adoption, implementation constraints, and extension paths for other teams building governance, auction, and allocation workflows on Canton
- coordination with the Foundation to identify and engage early evaluator teams who can test the delivered implementation in relevant governance, auction, or allocation use cases
- active dissemination through relevant academic, research, and professional networks, including existing connections with universities and related communities, to increase awareness of both the engineering output and the underlying allocation-and-resolution problem

---

## Motivation

Canton is well suited to applications where multiple parties must coordinate decisions, allocations, and downstream actions without handing control to a single trusted operator. Yet the coordination patterns that sit above assets and approvals are still rebuilt from scratch by every team that needs them.

The opportunity exists now because Canton already supplies the privacy and multi-party coordination model these problems need, while teams still lack a reusable baseline for private submissions, rule-based resolution, and verifiable outcome execution. Filling that gap would make governance and allocation patterns quicker to prototype, easier to compare, and more credible as reusable Canton application building blocks.

This is particularly visible in governance and allocation workflows. A consortium needs privacy-preserving voting and proposal execution but has no reusable governance library on Canton. A team needs sealed-bid auctions or multi-unit allocation but must re-implement submission privacy, expiry handling, and settlement logic itself. A broader allocation problem such as collateral distribution or resource assignment often shares the same structural shape, but there is no common coordination layer teams can reuse.

This gap is also visible in tokenized issuance flows where tokenization has reached issuance and settlement, while pricing, bookbuilding, or allocation decisions still sit outside reusable on-chain coordination infrastructure. [Hong Kong’s tokenized green bond work](https://www.hkma.gov.hk/media/eng/doc/key-information/press-release/2023/20230824e3a1.pdf) is a concrete example of a tokenized issuance path that still relied on traditional distribution and pricing steps around the issuance process. CAP addresses the missing coordination layer above settlement: who gets what, under what rule, and how that outcome executes.

For Unlockit, this is also not only an abstract ecosystem gap. Similar to the workflow-engine proposal, the motivation is reinforced by recurring market demand. The proposal is informed by a live use case in collective asset administration where multiple parties must submit proposals, vote under explicit rights or weights, satisfy threshold or reserved-matter rules, protect ring-fenced reserves, and trigger downstream actions only when the required approvals are in place. That use case is relevant to institutional stakeholders such as development-finance actors, municipalities, regulated lenders, and impact-oriented investors, which makes the need for auditable and reusable coordination mechanics especially concrete.

Unlockit is coming to this from practical work on governed multi-party processes where proposals, approvals, weighted participation, and downstream execution have to hold under real privacy and authorization constraints. That matters because the proposal responds to recurring implementation needs rather than to a purely theoretical category definition.

The same need is also visible in the governance roadmap opened by [CIP-0100](https://github.com/canton-foundation/cips/blob/main/cip-0100/cip-0100.md), which explicitly leaves subsequent work to define spend workflows and related decision processes. CAP does not attempt to implement the full operational governance of the Development Fund, but it can provide reusable primitives for some of the underlying mechanics such processes depend on, including proposal handling, quorum-sensitive voting, weighted decision rules, and execution-ready approval outcomes.

Earlier Daml examples and Daml Finance work touched parts of this design space, including auction, allocation, approval-style behavior, and claims-oriented modeling ideas. That history is useful because it shows the underlying problem is real rather than invented for this proposal. At the same time, those artifacts do not provide a production-ready, extensible baseline for today’s Canton Network. They were built in narrower contexts and, in the case of Daml Finance, around token standards and surrounding assumptions that differ from the current Canton environment. If relevant, those earlier design ideas can still inform CAP without constraining it to outdated assumptions.

CAP would address that gap directly by capturing the shared structure of these workflows once and exposing it as reusable ecosystem infrastructure. Governance and auctions are the most immediate proof points because they are familiar, broadly useful, and clearly demonstrable, but the deeper value is the reusable CAP core that can support future modules without redesigning the whole system.

---

## Rationale

The proposal funds a concrete and reusable coordination layer rather than a one-off governance app or auction app. CAP can be built and validated through clear milestones, and its value can be demonstrated through working modules, reference applications, and public documentation.

The economic argument is that CAP funds one reusable implementation of mechanics that otherwise tend to be rebuilt piecemeal across governance, approval, and allocation applications. A bounded CAP release is a cheaper ecosystem investment than asking each team to re-derive private submission handling, aggregation rules, expiry logic, and executable outcomes in isolation.

CAP specifically targets the layer above settlement: the workflow that collects private submissions, applies an allocation or approval rule, and turns the result into an executable outcome. That is the part teams still rebuild repeatedly even when asset modeling and transfer mechanisms already exist.

This is not only relevant to governance-style applications or auctions. The same primitives also appear in institution-facing asset administration contexts where participation rights, approval thresholds, protected reserves, and execution discipline must be enforced under audit expectations.

The proposal is also strongly aligned with the Development Fund because:

- it creates reusable coordination infrastructure for the ecosystem
- it lowers implementation cost for teams building governance or auction workflows
- it is open and reusable
- it fills a visible gap in Canton’s application-layer tooling
- it addresses coordination patterns that appear across multiple domains rather than only one vertical

The main design choice is to fund two focused domain modules on top of an extensible core, rather than trying to support every allocation mechanism at once. That keeps scope realistic while still producing something the ecosystem can use and build on.

The first release centers on governance, but the core insight is broader: proposal handling, voting, private submissions, threshold checks, and downstream execution are all instances of a more general allocation-and-resolution structure. CAP is intended to capture that structure once, prove it through governance and auctions, and make later extensions cheaper and safer.

Future modules such as order matching, collateral allocation, resource distribution, or credential-weighted decision flows can build on the same core if the first release demonstrates value. That gives the proposal a credible extension path without requiring the first grant to fund the whole roadmap.

This also creates a credible academic continuation path. The CAP direction can be embedded into an ongoing or future PhD track, which would support continued research and implementation work around decentralized allocation problems beyond the first funded release. That matters because the intent is not only to ship governance and auctions, but to establish a foundation that can continue to grow with additional implementations solving adjacent allocation problems over time. That academic continuation path does not remove the case for future implementation funding. If the core proves useful, additional modules and production-grade extensions may still justify separate funded work, whether through future development-fund proposals or other ecosystem-backed implementation tracks.

Future evolution should also remain attentive to adjacent token-standard work in the Canton ecosystem, including [PR #97, `Token Standard V2`](https://github.com/canton-foundation/canton-dev-fund/pull/97). If that work matures, it may create better settlement and asset-interaction assumptions for later CAP extensions without changing the bounded first-release scope proposed here.
