## Development Fund Proposal

| Field | Value |
| :---- | :---- |
| Author | luis-marado-unlockit |
| Org | Unlockit |
| Status | Approved |
| Created | 2026-04-10 |
| Approved | 2026-06-10|
| PR | [#184](https://github.com/canton-foundation/canton-dev-fund/pull/184) | 

---

## Abstract

This proposal delivers **Canton Allocation Primitives (CAP)**, an open-source reference implementation for privacy-preserving multi-party allocation and decision workflows on Canton. Today, teams that need any rule-based allocation flows must rebuild the same private submission, resolution, and execution patterns themselves, with no shared implementation to build on.

These primitives are often associated with DAO governance, but they extend well beyond that context. These allocation flows appear in auctions, consortium approvals, committee decisions, and other multi-party coordination workflows where private inputs, rule-based resolution, and verifiable downstream execution matter.

CAP addresses that gap with a bounded first release: a shared core for privacy-preserving submission, resolution, outcome execution, and expiry handling, plus two initial modules for **governance** and **auctions**, together with reference flows and documentation for reuse and extension. The goal is not to build a universal governance platform or solve every allocation pattern at once. The goal is to give the Canton ecosystem a reusable foundation for a class of coordination problems that Canton is well suited to support but does not yet serve with shared infrastructure.

CAP is designed to sit above existing Canton asset and settlement infrastructure, so teams can reuse allocation and decision mechanics without replacing the token and transfer layers they already depend on.

---

## Specification

### 1. Objective

Deliver a reusable reference implementation for allocation and decision workflows on Canton so developers can model, execute, and evaluate multi-party submission, resolution, and executable outcome patterns without rebuilding the same coordination structure from scratch.

The first release should cover a narrow but meaningful class of allocation and decision problems:

- private submission by multiple parties
- time-bounded participation windows
- pluggable resolution rules
- outcome determination
- atomic downstream action execution

The intended outcome is that a Canton team can adopt CAP to build:

- majority, weighted, and other rule-based voting flows
- proposal approval workflows with downstream execution hooks
- sealed-bid or multi-unit auction flows
- future allocation-style modules built on the same submission and resolution core

For the purposes of this proposal, an allocation problem is any workflow where multiple parties submit inputs under a stated rule, the system resolves those inputs into an outcome, and the outcome can trigger settlement, parameter change, resource assignment, or another executable consequence.

In CAP, a resolution rule is a deterministic function that turns collected submissions into an outcome. Where the required authorizations have already been collected through the workflow, that outcome can be represented exercised atomically to trigger the authorized downstream action.

This proposal is useful for Canton teams that need reusable decision and allocation mechanics. The purpose is to cut down repeated implementation of the same submission, resolution, and outcome logic across different application contexts.

### 2. Implementation Mechanics

The project will produce an open-source reference implementation composed of:

- a shared allocation core for submission, resolution, outcome execution, and expiry handling
- a governance module covering proposal lifecycle, voting, approval logic, and execution hooks
- an auctions module covering sealed-bid, Dutch, and multi-unit auction formats
- Daml packages, example applications, and developer documentation
- an extension guide for future community-built modules

The point is to identify the shared structure of a useful class of allocation problems and implement that structure once in a reusable way. The first release should be evaluated as a bounded proof that one reusable core can support both auction and governance flows without rebuilding the underlying submission, resolution, outcome execution, and expiry mechanics each time.

A credible first implementation path is to define `cap-core` around four reusable concepts:

- **Submission workflow**
- **Resolution rules**
- **Outcome execution**

Domain-specific modules then build on top of that shared structure:

- `cap-governance`
- `cap-auctions`

#### Core Layer: `cap-core`

The core captures the common structure of allocation workflows on Canton.

**Submission workflow**  
Each participant submits through a privacy-preserving invite → submit → close lifecycle. Submissions stay visible only to the submitter and the parties that need to see them. Workflows have deadlines, expired invitations can be reclaimed, and the model stays non-blocking if a participant goes offline.

**Resolution rules**  
The core exposes pluggable resolution hooks that process collected submissions into an outcome. The core may provide baseline patterns such as weighted or threshold resolution, while domain modules implement their own domain-specific logic such as auction winner selection, quorum checks, or weighted governance approval.

**Outcome execution**  
The output of the workflow is an executable outcome represented as Daml smart contracts carrying the authority collected during the workflow. Where all required parties have authorized the resulting action, the outcome can be exercised atomically. This lets the workflow settle an auction, execute an approved governance proposal without an extra off-ledger trust layer.

Some of this design space has precedent in earlier Daml work, including the contingency-claims library that formed part of Daml Finance. While that work was developed under different token-standard and ecosystem assumptions than today's Canton Network, it may still provide useful technical reference points for modeling conditional rights, claim resolution, and executable outcome structures within CAP.

#### Governance Module: `cap-governance`

The governance module provides the first governance-oriented reference implementation built on `cap-core`. It should cover:

- proposal creation
- ballot submission
- quorum and approval threshold checks
- weighted voting
- downstream execution hooks after approval

The first supported governance formats should be:

- **Majority vote** with configurable quorum and approval threshold
- **Weighted vote** where voting power is determined by stake, token holdings, or an external weight input

#### Auctions Module: `cap-auctions`

The auctions module demonstrates that the same core can support another class of allocation problem without redesigning the underlying coordination model.

The first supported auction formats should be:

- **Sealed-bid first-price and second-price auctions**
- **Dutch auctions** 
- **Multi-unit auctions** 

All auction formats inherit the core submission workflow, time guards, expiry handling, and outcome-execution model. Bid visibility and winner determination are shaped by Canton’s privacy model.

#### Illustrative Execution Flows

To make the intended runtime more concrete, the first release should be understandable through two short reference flows that exercise the same `cap-core` under different rules.

**Sealed-bid auction flow**  
1. An operator creates an auction and sends one invitation per bidder.  
2. Each bidder submits privately through their own invitation path, with visibility limited to the bidder and the parties that legitimately need to see the bid.  
3. After the deadline, the operator resolves the auction according to the selected rule, such as first-price or second-price winner determination.  
4. Resolution produces an executable outcome that identifies the winning allocation and the downstream action required for completion.  
5. The winning allocation can then trigger downstream settlement through the relevant asset and transfer infrastructure, while losing or expired participation paths are released or reclaimed.

**Governed approval flow**  
1. An operator creates a proposal and issues one invitation per voter or approving party.  
2. Each participant submits a private or semi-private ballot through the same invitation and submission structure used in the auction case.  
3. After the participation window closes, the ballots are resolved under a different rule set: quorum, threshold, weighted approval, or another supported governance rule.  
4. If the proposal passes, the result becomes an executable approval outcome rather than only a recorded vote tally.  
5. That outcome can then trigger the downstream action it authorizes, such as fund release, parameter change, or another governed execution step.

These flows are intended to show why auctions and institution-facing governed approval processes belong in the same proposal. They are different application domains, but they rely on the same private submission, rule-based resolution, and executable outcome structure.

#### Architectural Notes

CAP should remain grounded in Canton’s native strengths and satisfy, but not be limited to, the following properties:

- sub-transaction privacy for need-to-know disclosure
- no global contention, ensuring that independent workflows do not interfere with each other
- explicit party authorization for submission and execution
- composability across synchronizers, allowing CAP workflows to integrate with existing asset and settlement infrastructure
- atomic downstream action execution where the required authority has been collected
- sender anonymity where participants in a submission flow do not learn the identity of other submitters
- auditable contract state and deterministic resolution logic
- decentralized identity and authorization, relying on Canton’s cryptographic identity and namespace-based delegation rather than central authorities

The implementation should support privacy-preserving multi-party operation without requiring more disclosure than the workflow needs. It should rely on Canton’s visibility model directly rather than introducing external cryptographic privacy overlays where they are unnecessary.

### 3. Architectural Alignment

This proposal aligns with Canton’s architecture and ecosystem priorities because it builds on:

- institutionally compliant decision and allocation flows
- useful to a broad set of Canton ecosystem stakeholders
- creates a base for additional ecosystem utility and reuse

It also fits the Development Fund focus on shared developer tooling, reference implementations, and common-good infrastructure.

CAP is intended to compose with existing Canton asset and settlement infrastructure rather than replace it. The allocation and governance flows determine outcomes; existing token and settlement layers remain responsible for asset representation and transfer.

### 4. Backward Compatibility

No backward compatibility impact is expected at the protocol level. The proposed work is a new application-layer library and set of reference implementations. Existing Canton applications and protocol behavior remain unchanged.

CAP is intended to compose with existing Canton asset and settlement infrastructure rather than replace it. That means the main compatibility consideration is at the application-integration layer rather than the protocol layer.

CAP’s outcome-execution layer will need to interoperate with the asset and transfer infrastructure available in the Canton ecosystem during implementation. Unlockit will stay available to discuss design and integration choices with adjacent efforts, including [Token Standard V2](https://github.com/canton-foundation/canton-dev-fund/pull/97), where that helps maintain alignment with evolving asset-interaction patterns.

---

## Milestones and Deliverables

Project start: 2026-07-01

### Milestone 1: Core Design And Scope Definition
- **Estimated Delivery:** 2026-07-31
- **Focus:** Define `cap-core`, first-release boundaries, and extension points
- **Deliverables / Value Metrics:**
  - design document for `cap-core`
  - documented first-release scope and out-of-scope items
  - documented extension points for governance and auction modules
  - a simplified prototype of a typical `cap-core` workflow on a Canton sandbox

### Milestone 2: First Runtime Slices In Both Proving Domains
- **Estimated Delivery:** 2026-08-31
- **Focus:** Validate the shared core early in both governance and auction flows
- **Deliverables / Value Metrics:**
  - majority-vote reference slice built on `cap-core`
  - sealed-bid auction reference slice built on `cap-core`
  - private ballot and bid handling demonstrated in both slices
  - Daml script and sandbox integration tests for both slices

### Milestone 3: Governance Module Expansion
- **Estimated Delivery:** 2026-09-30
- **Focus:** Expand `cap-governance` to the bounded first-release governance set
- **Deliverables / Value Metrics:**
  - weighted-vote implementation
  - quorum, threshold, and approval logic for supported governance formats
  - downstream execution hooks for approved proposals
  - Daml script and sandbox integration tests for supported governance formats

### Milestone 4: Auctions Module Expansion
- **Estimated Delivery:** 2026-10-31
- **Focus:** Expand `cap-auctions` to the bounded first-release auction set
- **Deliverables / Value Metrics:**
  - sealed-bid first-price and second-price auction support
  - Dutch auction implementation
  - multi-unit auction implementation
  - Daml script and sandbox integration tests for supported auction formats

### Milestone 5: Reference Flows And Integration Hardening
- **Estimated Delivery:** 2026-11-30
- **Focus:** Demonstrate end-to-end reuse and harden shared behavior
- **Deliverables / Value Metrics:**
  - one auction reference flow with downstream settlement
  - one governance reference flow with downstream proposal execution
  - reference flows and integration material packaged for external evaluation
  - end-to-end demonstration that both flows reuse the same `cap-core`

### Milestone 6: Documentation, Extension Guide, And Open-Source Release
- **Estimated Delivery:** 2026-12-31
- **Focus:** Prepare CAP for evaluation, reuse, and extension
- **Deliverables / Value Metrics:**
  - API documentation and developer setup instructions
  - extension guide for building new modules on `cap-core`
  - documentation of known implementation constraints, operating assumptions, and current first-release limitations
  - final/stable public open-source release under Apache 2.0 or equivalent, following public development throughout the project lifecycle
  - at least one public walkthrough, tutorial, or technical session

### Milestone 7: External Adoption Validation
- **Estimated Delivery:** 2027-12-31
- **Focus:** Validate external adoption through exactly 2 qualified external teams using CAP in pilot or production applications
- **Deliverables / Value Metrics:**
  - exactly 2 external teams using CAP primitives in a pilot or production application
  - confirmation from each adopting team to the Tech & Ops Committee
  - documentation showing substantive reuse of CAP primitives, including adapted or extended use where applicable
  - letters of intent may support evaluation but do not satisfy this milestone
  - validation is based on documented evidence of use and adopter confirmation; strict binary package traceability is not required

### Milestone 8: Extended External Adoption
- **Estimated Delivery:** 2028-12-31
- **Focus:** Reward additional external adoption beyond Milestone 7
- **Deliverables / Value Metrics:**
  - up to 10 additional qualified external teams beyond Milestone 7 using CAP primitives in pilot or production applications
  - pilot adoption earns 30,000 CC per additional qualified external team
  - production adoption earns 60,000 CC per additional qualified external team
  - if a qualified pilot later reaches production during the milestone period, the production payment is reduced by the pilot payment already made, with the same team capped at 60,000 CC
  - breadth premium of 50,000 CC if at least 5 additional qualified external teams are accepted by the end of the milestone period
  - additional breadth premium of 50,000 CC if 10 additional qualified external teams are accepted by the end of the milestone period
  - total Milestone 8 funding is capped at 700,000 CC
  - each accepted additional team must provide confirmation to the Tech & Ops Committee and substantive documentation of CAP primitive reuse, including adapted or extended use where applicable
  - letters of intent may support evaluation but do not satisfy this milestone
  - validation is based on documented evidence of use and adopter confirmation; strict binary package traceability is not required

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- deliverables completed as specified for each milestone
- a working `cap-core` supporting submission, resolution, executable outcome generation, and expiry handling
- a working `cap-governance` built on that core
- a working `cap-auctions` built on that core
- documentation sufficient for another team to understand, evaluate, and extend CAP

Project validation:

- **Working implementation.** Both reference flows (auction and governance) run end-to-end on a Canton sandbox.
- **Passing test suite.** All Daml script and sandbox integration tests for the delivered modules pass.
- **Shared core.** The auction and governance modules import and use the same `cap-core` packages.
- **Open-source release.** Source code is published under Apache 2.0 or equivalent in a public repository with documentation sufficient for a developer to clone, build, and run the delivered implementation.
- **Documented scope and constraints.** The released documentation clearly states what CAP covers in the first release, what remains out of scope, and the main implementation constraints and operating assumptions.
- **External pilot or production adoption.** Adoption milestones require qualified external teams using CAP primitives in pilot or production applications.
- **Adopter confirmation.** Each accepted external adoption must include confirmation from the adopting team to the Tech & Ops Committee.
- **Adapted reuse counts.** Downstream adaptation or extension counts as adoption where substantive reuse of CAP primitives is documented.
- **Traceability boundary.** Validation of adoption is based on documented evidence of use and adopter confirmation rather than strict binary package traceability, since `cap-core` interfaces are expected to be more bespoke than standardized token interfaces.
- **Internal use.** Unlockit internal use may support evaluation as evidence of implementation maturity, but it does not satisfy adoption milestones.
- **Letters of intent.** Letters of intent may support evaluation but do not satisfy adoption milestones.

---

## Funding

**Base Funding Request:** 550,000 CC
**Adoption-Linked Additional Funding:** up to 850,000 CC
**Total Funding Cap:** 1,400,000 CC

Part of the funding is shifted from pure delivery milestones into adoption-linked milestones. The base amount covers design, implementation, hardening, documentation, and public release. Additional funding is contingent on demonstrated downstream adoption so that part of the proposal's value is earned through real reuse, not only through delivery of the reference implementation.

This proposal includes adoption milestones M7 and M8 as a deliberate mechanism to validate reusability through downstream use. Adoption-linked funding is capped and earned only through accepted milestone evidence within the stated milestone periods.

### Payment Breakdown by Milestone
- Milestone 1 _(Core Design And Scope Definition)_: 90,000 CC upon committee acceptance
- Milestone 2 _(First Runtime Slices In Both Proving Domains)_: 100,000 CC upon committee acceptance
- Milestone 3 _(Governance Module Expansion)_: 100,000 CC upon committee acceptance
- Milestone 4 _(Auctions Module Expansion)_: 100,000 CC upon committee acceptance
- Milestone 5 _(Reference Flows And Integration Hardening)_: 100,000 CC upon committee acceptance
- Milestone 6 _(Documentation, Extension Guide, And Open-Source Release)_: 60,000 CC upon final release and acceptance
- Milestone 7 _(External Adoption Validation)_: 150,000 CC upon acceptance within 12 months after Milestone 6 for exactly 2 qualified external teams using CAP in pilot or production applications
- Milestone 8 _(Extended External Adoption)_: up to 700,000 CC upon acceptance within 24 months after Milestone 6, covering up to 10 additional qualified external teams beyond Milestone 7, paid at 30,000 CC per pilot adoption and 60,000 CC per production adoption, plus breadth premiums as specified in the milestone deliverables

### Timeline Accountability
If a milestone from Milestones 1 through 6 is delayed beyond its stated delivery month for reasons under the proposer’s control, the payout for that milestone should be reduced by **10% for each additional 2-week delay**, capped at **20%** for that milestone. After the capped delay penalty has been exhausted, if delays continue for reasons under the proposer’s control, become unreasonable, or result in non-delivery, the Foundation or Tech & Ops Committee may refuse acceptance and close the affected milestone, and reserved funds for that milestone return to the Dev Fund pool. If two milestones are closed for those reasons, the Foundation or Tech & Ops Committee may terminate the full proposal, and any remaining reserved funds return to the Dev Fund pool.

Delays caused by Committee-requested scope changes or dependency changes imposed by the Canton ecosystem should not trigger this penalty automatically and should instead be handled through explicit milestone re-planning.

For Milestones 7 and 8, unaccepted or unearned reserved adoption funds return to the Dev Fund pool at their respective milestone deadlines.

### Volatility Stipulation
The planned engineering and delivery duration is **6 months** for Milestones 1 through 6. Adoption milestones 7 and 8 extend beyond that window and are treated as separate adoption-linked milestones rather than part of the core delivery timeline.

The listed CC amounts reflect the Canton Coin exchange rate and value at the time this proposal is accepted. Because adoption milestones 7 and 8 may be accepted after the 6-month engineering delivery window, the parties may agree to fix the value of those adoption milestones in fiat currency terms, preferably EUR or otherwise USD, to address material CC valuation fluctuations. Any such adjustment must be approved by the Foundation or Tech & Ops Committee before payment. The approved amount remains capped and ring-fenced, and this stipulation does not create an automatic right to additional funding.

---

## Co-Marketing

Unlockit will collaborate with the Foundation to move CAP from publication to adoption:

- a coordinated public announcement covering the problem, delivered artifacts, and intended ecosystem value
- a technical architecture write-up on `cap-core`, the governance module, the auction module, and key design tradeoffs
- at least one public technical walkthrough, recorded or live, covering both a governance and an auction reference flow
- reference flows published in a clone-and-run format
- joint identification of early evaluator teams to test CAP in their own use cases
- dissemination through academic, research, and professional networks, including Unlockit's existing university partnerships

---

## Motivation

Canton already provides the privacy model and multi-party authorization that allocation workflows require. What it lacks is a shared library above the asset layer: the part that collects private inputs, applies a rule, and turns the result into an executable outcome. Teams that need auctions, approval votes, or other allocation workflows still have to rebuild that coordination layer from scratch.

Three concrete gaps motivate the proposal:

1. **Governance and approval flows.** A consortium that needs privacy-preserving voting and proposal execution on Canton has no reusable library to start from. Each team re-implements ballot privacy, quorum logic, and outcome execution independently.

2. **Auction and issuance allocation.** Tokenized issuance has reached settlement, but pricing, bookbuilding, and allocation decisions still sit outside reusable on-chain coordination infrastructure. [Hong Kong’s tokenized green bond issuance](https://www.hkma.gov.hk/media/eng/doc/key-information/press-release/2023/20230824e3a1.pdf) is a concrete example: the bonds were tokenized, but distribution and pricing still relied on traditional off-chain steps. CAP addresses the missing coordination layer above settlement: who gets what, under what rule, and how that outcome executes.

3. **Institutional asset administration.** Unlockit works with clients such as development-finance actors, municipalities, regulated lenders, and impact investors on collective asset administration where multiple parties must propose, vote under explicit rights or weights, satisfy reserved-matter rules, protect ring-fenced reserves, and trigger downstream actions only after the required approvals are in place. This recurring client need is what shaped the proposal.

**Relation to existing work.** Earlier Daml examples and Daml Finance, including the contingent-claims library, explored auctions, allocation, and claims-oriented modeling. Those artifacts were built around token standards and ecosystem assumptions that differ from today’s Canton Network and do not provide a reusable baseline for the current environment. CAP can draw on those design ideas without being constrained by them.

**Relation to CIP-0100.** [CIP-0100](https://github.com/canton-foundation/cips/blob/main/cip-0100/cip-0100.md) explicitly leaves spend workflows and related decision processes to subsequent work. CAP can supply primitives for some of those mechanics, including proposal handling, quorum-sensitive voting, weighted decision rules, and execution-ready approval outcomes, without attempting to implement the full operational governance of the Development Fund.

---

## Rationale

**Why fund this as shared infrastructure.** One reusable implementation of submission, resolution, and outcome-execution mechanics is cheaper for the ecosystem than having each Canton team re-derive the same logic independently. The governance and auction modules are the first two consumers of `cap-core`; the core is the lasting asset.

Unlockit is already exploring related allocation and coordination topics through ongoing academic partnerships. That work will continue regardless of the fund outcome, but Development Fund support would accelerate CAP from academic exploration into a bounded six-month public release for the Canton ecosystem.

**Why two modules instead of one.** A single-domain release would leave the core untested against a second workflow family. Shipping both governance and auctions in the first release forces the core interfaces to generalize early rather than silently coupling to one domain.

**Development Fund fit.**

- fills a gap in Canton’s application-layer coordination tooling
- lowers implementation cost for teams building governance or auction workflows
- addresses coordination patterns that appear across multiple domains
- produces open-source infrastructure reusable by other teams

**Extension path.** Future modules such as order matching, collateral allocation, resource distribution, or credential-weighted decision flows can build on the same `cap-core` interfaces if the first release demonstrates value. Unlockit’s ongoing academic partnerships provide a credible path for continued exploration of decentralized allocation problems beyond the first funded release.
