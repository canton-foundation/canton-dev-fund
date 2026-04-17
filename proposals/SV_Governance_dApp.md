## Development Fund Proposal

**Author:** Eric Mann (Avro Digital)  
**Status:** Draft  
**Created:** 2026-04-15  
**Label:** onchain-governance  
**Champion:** Avro Digital  

---

## Abstract

Avro Digital requests 2,500,000 Canton Coin (CC) to design, implement, and prepare for rollout a standalone SV governance dApp that separates non-operational governance voting from node operations on the Global Synchronizer.

Today, the governance experience is embedded in the Splice SV application and tied to the same identity path used for node automation. This project extracts that workflow into a dedicated dApp, introduces the minimal Daml/CIP changes needed for a separate governance-voting identity for non-operational votes, proves external signing through the Canton wallet stack, and packages the result for SV-operated deployment alongside existing SV node infrastructure within the **current one-vote-per-node model**.

This proposal is intentionally narrow. It does **not** attempt to redesign governance, expand direct on-chain voting to a broader stakeholder set, or introduce a general-purpose external identity platform. Its purpose is to deliver the technical separation and operator-ready UX needed for future governance evolution.

---

## Specification

### 1. Objective

Deliver a standalone governance dApp and supporting Daml changes that allow an SV to use a separate governance-voting identity for non-operational votes while preserving the current one-vote-per-node model.

The project includes:

- A standalone governance dApp derived from the existing SV governance flow
- Daml/CIP changes that distinguish operator-controlled operational votes from governance-voter-controlled non-operational votes
- External-signing support through the Canton wallet stack using CIP-103 compatibility
- Operator-administered governance-voter/key binding for the current SV workflow
- UX improvements that adapt the existing governance UI rather than rebuilding it from scratch

Explicit non-goals:

- Broader redesign of governance rights or governance process
- Direct on-chain voting by a wider stakeholder set
- Tokenomics changes
- Independent voter-hosted deployment
- A generalized external identity platform
- Long-tail UX work such as mobile apps, notification systems, or broader collaboration workflows

These should be treated as follow-on work, not as implied scope within this proposal.

### 2. Implementation Mechanics

The implementation is organized around four tightly scoped workstreams:

**Daml and CIP work**

The current `DsoRules` model assumes governance voting follows the operator identity path. This project introduces a separate governance-voting path for non-operational votes while preserving existing one-vote-per-SV semantics.

The Phase 1 model is:

- Each SV retains one vote
- Operational votes remain operator-controlled
- Non-operational votes may be exercised through a separate governance-voting identity
- Initial rollout uses a 1:1 bootstrap mapping for compatibility with today's operating model

For Phase 1 review, the proposal assumes a narrow explicit split that will be finalized during contract review and CIP drafting:

- **Operational votes** are those directly tied to running, securing, or coordinating the SV node and its required operational responsibilities. Examples include emergency operational actions, release coordination, or upgrade-related actions where the SV operator is responsible for executing the resulting operational change.
- **Non-operational votes** are governance decisions that do not themselves require the SV operator's day-to-day operational authority to carry out. Examples include voting on governance proposals, committee-level decisions, or other policy choices where the vote can be separated from subsequent node operations.

The Phase 1 objective is not to settle every boundary case up front. It is to define an initial enumerated set of supported vote categories that is narrow, reviewable, and sufficient to prove the separated governance-voting path without expanding scope into a broader governance redesign.

This requires a focused CIP and corresponding changes in `splice-dso-governance`.

**Standalone governance dApp**

The governance experience will move into a separate web application rather than remain embedded in the SV-only surface. The dApp will:

- Display pending proposals and vote history
- Make vote actions explicit and auditable
- Show the authority path used for each vote
- Support clearer review and confirmation workflows
- Reuse the existing governance UI wherever practical

The dApp must support both the read path and the write path. Phase 1 assumes proposal discovery and vote-state inspection through existing API surfaces such as Scan rather than broad public visibility of the underlying contracts.

**External signing**

Rather than building a custom wallet path, the project will use the existing Canton wallet stack:

- `@canton-network/dapp-sdk`
- Wallet Gateway
- A compatible signing-provider or wallet path

The target is **CIP-103-compatible external signing** for governance-voter parties whose confirming participant is not the SV node.

**Deployment model**

The initial rollout remains conservative:

- SV-operated, with the dApp UI and supporting services packaged to run alongside existing SV node infrastructure
- One vote per node
- Used by current SV operators and governance voters
- Packaged for staged rollout alongside the existing SV UI

The governance-voter party does not need to be hosted on the SV node.

The user model also stays intentionally narrow. Phase 1 assumes operator-administered binding between the approved governance voter and the key or wallet path used for governance voting; it does not introduce self-service registration or a generalized external voter registry.

### 3. Architectural Alignment

This proposal is aligned with current Canton and Splice architecture in four ways:

- It preserves the existing one-vote-per-node model while decoupling governance voting from node automation, which reduces operational coupling without forcing a broader governance redesign into the same project.
- It builds on the existing Splice governance stack and introduces a narrow, reviewable CIP plus targeted Daml changes rather than a disruptive contract rewrite.
- It uses the Canton wallet stack and targets CIP-103-compatible external signing instead of inventing a parallel signing system, which keeps the implementation aligned with the ecosystem's wallet direction.
- It contributes the output to the open-source Canton/Splice ecosystem under standard open-source licensing, making the work reusable for future governance evolution.

### 4. Backward Compatibility

Backward compatibility is a core design constraint for this project:

- The initial rollout preserves one-vote-per-node semantics.
- Operational votes remain on the existing operator-controlled path.
- Non-operational voting is introduced through a separate governance-voting identity without breaking the current operating model.
- The Phase 1 bootstrap mapping keeps deployment compatible with today's SV workflow while avoiding long-term lock-in to an operator-anchored design.
- The dApp is packaged for staged rollout alongside the existing SV UI rather than requiring a hard cutover.

---

## Milestones and Deliverables

### Milestone 1: Governance-Voting Identity and CIP

- **Estimated Delivery:** Month 2-3
- **Focus:** Separate non-operational governance voting from node automation in the on-chain model
- **Deliverables / Value Metrics:**
  - Focused contract review and minimal contract-change package covering the governance surfaces that must change and any new templates or choices proposed in the CIP
  - Definition of the Phase 1 split between operator-only operational votes and governance-voter-controlled non-operational votes, including an explicit initial list of supported vote categories and example vote types
  - Daml design and reference implementation for a governance-voting identity path that keeps voting conceptually separate from the operator model
  - Unit and integration tests for the new vote path
  - CIP draft submitted for review
  - Draft or submitted Splice PR for the contract-side implementation

### Milestone 2: External Signing Proof of Concept

- **Estimated Delivery:** Month 3-4
- **Focus:** Prove wallet-based external signing for governance votes
- **Deliverables / Value Metrics:**
  - Initial standalone governance dApp integrated with `@canton-network/dapp-sdk`
  - Wallet-gateway-backed signing path for governance votes
  - End-to-end non-production demo showing an externally signed non-operational governance vote recorded on-chain
  - Integration notes for a reference implementation path and a partner-compatible CIP-103 path

### Milestone 3: Deployment Packaging and Operator Workflow

- **Estimated Delivery:** Month 4-5
- **Focus:** Package the dApp for real operator use in the current model
- **Deliverables / Value Metrics:**
  - Deployment packaging for the governance dApp and minimal supporting services in an SV-operated, node-adjacent model
  - Operator-administered governance-voter/key binding workflow
  - End-to-end read and vote flows integrated into the standalone application
  - Existing governance UI flows adapted into the dApp packaging model with only the changes required by the new signing and routing model
  - TestNet or equivalent staging deployment with operator and ecosystem validation
  - Scan API extensions for any governance dApp read-path requirements
  - Successful staging validation by at least one current SV operator and one governance voter completing the intended end-to-end vote flow

### Milestone 4: UX Hardening and Rollout Readiness

- **Estimated Delivery:** Month 5-6
- **Focus:** Make the dApp safe for regular governance use and ready for rollout
- **Deliverables / Value Metrics:**
  - UX improvements based on feedback from current operators and governance users
  - Confirmation, diff, and audit views for high-confidence vote execution
  - Validation against at least one realistic wallet interoperability path
  - Operator documentation and rollout guidance for staged production adoption
  - Incorporated review feedback from representative governance users and operator stakeholders, with a rollout package suitable for staged adoption

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone
- Demonstrated functionality or operational readiness
- Documentation and knowledge transfer provided
- Alignment with stated value metrics

Project-specific acceptance conditions:

- Distinct operational and governance-voting identities are demonstrated in code
- The Phase 1 operational versus non-operational vote split is explicit, reviewable, and illustrated with an initial supported set of vote categories
- The CIP remains narrow, reviewable, and grounded in an explicit contract review plus stub design
- The Phase 1 bootstrap mapping preserves compatibility without forcing the long-term voting model to remain operator-anchored
- Backward compatibility is preserved throughout the Phase 1 rollout
- CIP and implementation artifacts are submitted for ecosystem review
- A governance vote can be signed externally and recorded on-chain
- The governance voter can confirm through a participant that is not the SV node
- The dApp uses the Canton wallet stack rather than a custom signing mechanism
- The dApp can be deployed alongside an SV node
- A current SV operator and governance voter can complete the intended vote flow end to end
- One-vote-per-node semantics remain unchanged
- Staging validation includes successful use by representative operator and governance-voter participants
- Operator-facing documentation and rollout guidance are complete
- The dApp is ready for staged TestNet/MainNet rollout, subject to normal governance and release approvals

---

## Funding

**Total Funding Request:** 2,500,000 CC

This request reflects:

- Daml/CIP design and implementation on a governance-critical path
- dApp extraction and wallet integration
- Operator-ready deployment packaging and UX hardening
- Upstream contribution, review, and integration overhead
- Targeted architectural consulting to de-risk the contract and integration design

### Payment Breakdown by Milestone

- Milestone 1 (Governance-Voting Identity and CIP): 550,000 CC to Avro Digital upon CIP/design package and contract implementation submission for review
- Milestone 2 (External Signing Proof of Concept): 450,000 CC to Avro Digital upon committee-verifiable externally signed vote demo
- Milestone 3 (Deployment Packaging and Operator Workflow): 550,000 CC to Avro Digital upon staging deployment in the SV-operated model and end-to-end operator workflow validation
- Milestone 4 (UX Hardening and Rollout Readiness): 450,000 CC to Avro Digital upon rollout-ready release package, documentation, and operator validation

The milestone amounts above total 2,000,000 CC and fund Avro Digital's implementation workstream. The remaining 500,000 CC is paid to Digital Asset as described below.

### Digital Asset Consulting Payment Breakdown

- Milestone 1: 250,000 CC paid to Digital Asset upon acceptance of milestone 1 deliverables
- Milestone 4: 250,000 CC paid to Digital Asset upon acceptance of milestone 4 deliverables

### Volatility Stipulation

The project is expected to complete within 6 months. Should the timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility.

---

## Co-Marketing

Upon release, Avro Digital will collaborate with the Canton Foundation on:

- Announcement coordination for milestone and release communications
- A case study or technical blog covering the governance architecture, wallet integration, and rollout approach
- Developer and ecosystem promotion tied to the new governance workflow

---

## Motivation

The near-term governance problem is that participation is still operationally coupled to running a node.

Today, a relatively small number of SV nodes represent a larger and growing set of funded organizations. That arrangement is still workable, but it places node operators in the middle of a governance workflow that should have a clearer and more dedicated path. The existing SV application is also not the right long-term place to iterate on governance-specific signing flows, authority boundaries, and user experience.

A focused technical step is available now: extract governance into a standalone dApp, separate non-operational governance voting from node operations, and prove standards-aligned external signing without taking on a broader redesign of governance rights or stakeholder representation in the same project.

This gives the ecosystem a cleaner technical foundation for future governance evolution while delivering immediate practical value to current SV operators and governance participants.

---

## Rationale

The key design choice is to separate governance from node operations without trying to solve every future governance question in the same grant. A standalone dApp gives governance review, signing, and audit flows their own surface, while the narrow Phase 1 scope preserves one-vote-per-node semantics and keeps the CIP and implementation reviewable.

Using the Canton wallet stack and reusing the existing governance UI wherever practical both reduce delivery risk. The project can focus on the contract, signing, read-path, routing, and deployment changes that matter now instead of spending the grant on a bespoke wallet path or a full UI rewrite.

Avro Digital is proposing this as a focused, upstream-collaborative first step grounded in direct Scala, Daml, and production-infrastructure experience.

---

## Team

- **Eric Mann:** Implementation lead across application architecture, integration, and deployment packaging
- **Randy Harrison:** CTO responsible for CIP drafting, review, and upstream design coordination
- **Ian Hensel:** Head of Product responsible for operator workflow validation, product feedback, and rollout planning

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Defining the Phase 1 operational/non-operational vote split is harder than expected | Medium | High | Keep the first supported vote categories explicit and narrow, and defer broader classification questions to follow-on work |
| CIP/review cycle takes longer than planned | Medium | High | Keep the initial contract proposal narrow and start review early |
| Contract design changes during upstream review | Medium | Medium | Treat the current contract shape as representative, not fixed |
| Wallet interoperability is rough in the first implementation | Medium | Medium | Validate one concrete wallet/gateway path before broadening scope |
| Scope drifts toward full external stakeholder voting | High | High | Keep the project explicitly constrained to one vote per node |
| UI hosting and governance-voter party hosting get conflated | Medium | Medium | Keep SV-operated UI deployment in scope while separately allowing governance-voter confirmation through a different participant |
| Production rollout timing depends on external release windows | Medium | Medium | Make rollout readiness, not forced production timing, the milestone target |

---

## Maintenance and Sustainability

The output of this grant is intended to live in the open-source Canton/Splice ecosystem. Avro Digital expects to maintain the work as part of its continuing Canton contribution efforts, but the code and documentation will be structured so that other contributors can continue the work if needed.

---

## Open Source and Licensing

All software deliverables will be contributed under Apache 2.0 to the relevant open-source repositories. Any CIP text will be submitted under the standard licensing used by the `canton-foundation/cips` repository.
