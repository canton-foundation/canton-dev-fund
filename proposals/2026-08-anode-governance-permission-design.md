# Development Fund Proposal

| Field | Value |
| :---- | :---- |
| **Organization** | Anode.GG |
| **Author / Primary Contact** | Raphael Spannocchi, Anode.GG |
| **Status** | Submitted |
| **Created** | 2026-08-27 |
| **Proposal Type** | RFP-aligned |
| **RFP / Roadmap Area** | RFP 9 — Governance automation |
| **Champion** | Heslin Kim, Zenith |
| **Total Funding Request** | 860,000 CC |
| **Project Duration** | 6–9 months |
| **Label** | onchain-governance |

---

## Abstract

Anode.GG (Anode Governance) proposes an open-source reference implementation for **permissioned, typed governance proposals** on Canton. The project introduces an off-chain mandate registry and submission gate that permits a person or body to submit only the decision classes that Super Validators have explicitly authorized, within recorded limits and expiry dates. It reduces manual proposal triage, makes authority traceable, and gives Super Validators a more predictable review workflow without changing Canton’s current voting weights, quorum, or voting mechanism.

The first release implements the source proposal’s **Option B**: proposals remain subject to the existing voting process, but they are correctly typed, complete, attributable to a valid mandate, and bundled into predictable review windows. The architecture will keep a later consent-agenda path and professional-proxy workflow possible, but neither is in scope for this grant.

---

## Specification

### 1. Objective

Deliver a reusable governance-permissioning reference implementation that makes proposal authority explicit before a proposal reaches Canton’s existing governance process.

Today, governance involves numerous committees, working groups, editors, Super Validator operators, and Special Interest Groups (SIGs). The authority boundaries between them are often implicit. At the same time, a broad range of decisions arrive through the same high-attention Super Validator voting process. Rate limits can reduce submission volume, but cannot establish whether a proposer is authorized to make a particular proposal.

The project addresses that gap with three connected capabilities:

1. A machine-readable **mandate registry** that records who is authorized to initiate which decision classes, subject to stated limits, escalation rules, provenance, and expiry.
2. A **typed submission gate** that validates a proposal against its mandate, rejects out-of-scope submissions before publication, and records the authority chain for accepted proposals.
3. A transparent **workflow and audit layer** that tracks notice periods, review windows, renewals, notifications, and the complete provenance trail from a decision back to the mandate and authorizing vote.

The objective is deliberately limited to proposal creation and governance workflow coordination. It does not replace the existing voting mechanism or determine who receives a vote.

### 2. Problem and Ecosystem Value

For institutional participants, governance needs a documented chain of responsibility. A committee, working group, or delegated role should not derive its authority merely from custom or an informal process. It should hold a visible mandate that states what it may initiate, under which constraints, and until when.

This is consistent with institutional governance practice:

| Institutional practice | Canton capability delivered by this proposal |
| :---- | :---- |
| Board delegation of authority | Time-bound mandate with defined decision classes and limits |
| Reserved matters | Decision classes that always route to a full Super Validator vote |
| Consent agenda | A future-compatible workflow for routine items; not enabled in the initial release |
| Annual general meeting / reauthorization | Expiring mandates that can be renewed in a bundled review cycle |
| Delegation register | Public, queryable mandate registry and provenance trail |

The result is shared infrastructure rather than a workflow that benefits one organization. Any Canton governance body or future governance application can use the mandate schema, validation service, audit record, and reference user interface.

### 3. Scope and Non-Goals

#### In scope

- A public mandate data model and registry reference implementation.
- Typed proposal schemas and policy validation for the governance classes below.
- A proposal-submission gate that checks authority, bounds, expiry, and mandatory fields before publishing or forwarding a proposal.
- Governance workflow support for notice periods, reminders, review states, audit logs, and grouped mandate reauthorization.
- Documented integration interfaces for Canton’s existing governance channels, including the GitHub/CIP process and the Super Validator governance dApp where integration is agreed with its maintainers.
- A test or staging deployment, operator documentation, and an open-source handoff package.

#### Explicit non-goals

- Replacing the current Super Validator vote, quorum, voting weights, or one-vote-per-node model.
- Building a new general-purpose voting engine or duplicating the standalone governance-voting dApp funded for Avro Digital.
- Enabling automatic/optimistic passage, veto settlement, or on-chain enforcement in the initial release.
- Implementing professional proxy voting, tokenomics changes, or an external identity platform.
- Assuming that the Foundation accepts responsibility for production operation without a separate decision.

### 4. Implementation Mechanics

#### Mandate registry

Each mandate is a versioned, machine-readable record. It is created, amended, renewed, or revoked only through the governance process designated for mandates. A mandate includes:

| Field | Purpose |
| :---- | :---- |
| Holder | The authorized body, role, or named delegate |
| Decision classes | The proposal types the holder may initiate |
| Bounds | Value limits, parameter ranges, affected parties, jurisdictions, and other explicit scope limits |
| Instrument | The applicable passage and review rule |
| Escalation triggers | Conditions that require ordinary governance review regardless of the proposal’s initial path |
| Expiry | Date after which the holder can no longer initiate proposals under the mandate |
| Provenance | The authorizing decision and any later amendment or renewal |
| Status | Active, suspended, expired, revoked, or superseded |

The registry is intentionally fail-closed: an absent, expired, or out-of-scope mandate cannot authorize a proposal. Each accepted proposal stores the mandate identifier and version used for validation, so a reviewer can reconstruct the authority chain.

#### Typed proposals

The implementation will define structured schemas for the following initial taxonomy:

| Class | Examples | Initial treatment |
| :---- | :---- | :---- |
| Constitutional | Changes to CIP-0000, Super Validator rights or weights, this mandate framework | Existing full governance route |
| Tokenomics | Reward structures, fees, traffic pricing | Existing full governance route |
| Mandate | Granting, renewing, amending, or revoking authority | Existing full governance route |
| Standards | Protocol changes and token standards | Existing route unless separately authorized |
| Operational | Parameter changes within approved bounds, scheduling, routine administration | Existing voting route in the initial release |
| Administrative | Publication, record keeping, and non-binding notices | Recorded and published without a vote where permitted |

These classes make the intended review path visible. They do not weaken the governance bar: matters reserved for Super Validator approval remain on their existing route.

#### Submission gate and workflow service

The submission gate is an off-chain form and validation service operating ahead of existing channels. It will:

1. Identify the submitting holder and the selected mandate.
2. Validate the proposal’s type, required fields, bounds, affected parties, and dates against the active mandate.
3. Reject invalid submissions with a clear reason and a link to the governing rule.
4. Create an immutable audit event for each submission, validation result, and later status change.
5. Emit an accepted proposal in the agreed schema to existing governance channels, rather than replacing those channels.

The surrounding workflow service will record notice periods, flag upcoming mandate expiries, notify defined reviewers, and group renewals into scheduled reauthorization cycles. The initial implementation is off-chain because it is compatible with the current governance process and can be tested without changing protocol voting contracts.

#### Integration approach

The project will publish stable, documented interfaces instead of assuming control of another team’s application. In particular, it will:

- Link every accepted proposal to the applicable CIP, GitHub issue or pull request, and governance record where those artifacts apply.
- Offer a documented integration point for the Avro Digital governance dApp’s proposal and read paths, subject to upstream review and maintainers’ acceptance.
- Export public, privacy-safe audit data for dashboards, SIG review, and later reporting tools.

### 5. Architectural Alignment

This proposal directly responds to **RFP 9 — Governance automation**, which seeks tools that reduce manual governance overhead and improve the reliability, transparency, and participation of Canton governance processes. It provides proposal lifecycle tracking, notifications, governance audit logs, and repeatable workflow automation.

It also respects the architecture and scope of related work:

- **Existing Super Validator governance:** the system validates proposal authority before the established process; it does not change voting rights or vote execution.
- **Avro Digital’s approved SV Governance dApp:** this proposal supplies a distinct permissioning and lifecycle layer. It will integrate through documented interfaces rather than rebuild the voting UI or external-signing flow.
- **CIP process:** constitutional, tokenomics, mandate, and standards decisions retain the appropriate existing governance/CIP route. Any later protocol-level enforcement would require its own technical review and CIP.
- **Privacy model:** the initial registry and audit log concern public governance metadata—authority, proposal type, status, and provenance. They do not need to expose private ledger transaction data.

### 6. Backward Compatibility

*No backward compatibility impact on the current voting mechanism, voting weights, quorum, or one-vote-per-node model.*

The first release is an off-chain, additive validation and workflow layer. Existing governance channels remain available while adoption is phased. Any integration is introduced behind documented interfaces and can be evaluated on test or staging environments before operational use.

---

## Milestones and Deliverables

### Milestone 1: Mandate and Typed-Proposal Specification

- **Estimated Delivery:** Month 1-3
- **Focus:** Produce the common governance language and implementation specification.
- **Deliverables / Value Metrics:**
  - Stakeholder interviews with representatives from Special Interest Groups (SIGs), working groups, Super Validator operators, and the Foundation.
  - Published mandate schema, decision taxonomy, lifecycle state model, and escalation rules.
  - Reference policy for authorization, expiry, revocation, and reauthorization.
  - Mapping of the first release to Canton’s current governance and CIP workflow, including explicit interface boundaries with the Avro governance dApp.
  - Review package submitted to the Onchain Governance Modeling SIG and affected maintainers, with a public disposition log for substantive feedback.
  - At least three representative proposal scenarios (in-scope operational, out-of-scope, and mandate renewal) expressed using the specification.
- **Acceptance conditions:** Reviewers can determine, from the published schema and scenarios, whether a proposed action is authorized, requires escalation, or must be rejected; the documented model has no unresolved ambiguity about holder, decision class, bounds, expiry, or provenance.

### Milestone 2: Mandate Registry and Submission-Gate Reference Implementation

- **Estimated Delivery:** Months 2–4
- **Focus:** Make permissioned submission demonstrable and usable in a non-production environment.
- **Deliverables / Value Metrics:**
  - Open-source registry service, versioned mandate records, and proposal-validation API.
  - Reference submission interface that validates mandatory fields, authorization, bounds, and expiry before it creates a proposal record.
  - Reviewer-facing rejection messages that identify the governing mandate condition or missing requirement.
  - End-to-end demonstration that an authorized operational proposal is admitted and an equivalent out-of-scope proposal is rejected before publication.
  - Public audit event format that links each accepted proposal to its mandate version.
- **Acceptance conditions:** A governance participant can submit a valid proposal through the reference flow and a reviewer can independently trace it to the authorizing mandate; an unauthorized or expired mandate cannot be used to produce an accepted proposal record.

### Milestone 3: Governance Lifecycle, Notification, and Audit Integrations

- **Estimated Delivery:** Months 4–6
- **Focus:** Reduce review overhead and make mandate accountability observable.
- **Deliverables / Value Metrics:**
  - Notice-period, reminder, expiry-warning, and reauthorization-bundling workflows.
  - Public proposal-lifecycle and mandate-provenance views, using privacy-safe governance metadata.
  - Documented adapters or export formats for GitHub/CIP artifacts and the existing governance dApp’s proposal/read paths, where maintainers approve integration.
  - A staged workflow exercise covering submission, reviewer notification, mandate expiry, and renewal.
  - Operator runbook describing user roles, incident handling, audit export, and manual fallback procedures.
- **Acceptance conditions:** In a staged governance exercise, reviewers receive the required notice and can see the proposal’s authority path and lifecycle state; an expired mandate is surfaced before it can authorize a subsequent proposal.

### Milestone 4: Community Validation, Release, and Handover Package

- **Estimated Delivery:** Months 6–9
- **Focus:** Demonstrate ecosystem usefulness and leave a maintainable public-good implementation.
- **Deliverables / Value Metrics:**
  - A public release of the reference implementation, schemas, test fixtures, documentation, and integration guide.
  - Facilitated validation with at least two representative governance participants or roles in a test/staging workflow, with findings and responses published where participants permit.
  - A documented operating model, security/privacy boundaries, and a maintenance/handover recommendation for Foundation or third-party operation.
  - A roadmap identifying the separately governed next steps for consent-agenda passage, proxy voting, and on-chain enforcement.
  - A case study or technical walkthrough prepared with the Foundation for ecosystem reuse.
- **Acceptance conditions:** At least two representative participants or roles can complete the reference proposal workflow in the agreed test/staging environment; the release gives another ecosystem team enough documentation and fixtures to evaluate or extend the tool without relying on Anode as the sole source of knowledge.

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on the ecosystem value delivered by the system, not merely the existence of software artifacts.

- Governance participants can determine proposal authority before review by inspecting a public, versioned mandate and its bounds.
- A valid mandate enables a correct typed proposal; an invalid, expired, or out-of-bounds mandate does not.
- Reviewers receive timely workflow notice and can inspect a proposal’s type, lifecycle state, and provenance back to the authorizing decision.
- The solution works alongside the current governance process and does not introduce a change to voting rights, voting weight, quorum, or the one-vote-per-node model.
- The public release is reusable by other Canton governance teams and includes the documentation, interfaces, and test fixtures required for independent evaluation.
- Community validation demonstrates that the workflow reduces ambiguity about who may submit what, rather than shifting the same manual decision to a different interface.

---

## Funding

**Total Funding Request: 860,000 CC**

Anode.GG requests funding solely in Canton Coin (CC), aligning the program’s incentives with the Canton ecosystem.

### Payment Breakdown by Milestone

| Milestone | CC | Payment trigger |
| :--- | ---: | :--- |
| Milestone 1 — Mandate and Typed-Proposal Specification | 150,000 | Accepted public specification and review package |
| Milestone 2 — Registry and Submission Gate | 260,000 | Demonstrated valid and invalid proposal flows with traceable mandate provenance |
| Milestone 3 — Lifecycle, Notification, and Audit Integrations | 215,000 | Staged workflow exercise with visible lifecycle, notification, expiry, and renewal handling |
| Milestone 4 — Community Validation, Release, and Handover | 235,000 | Public release and completed representative-participant validation |
| **Total** | **860,000** | — |

### Volatility Stipulation

The project is expected to complete within 6–9 months. The buffer allows time for stakeholder feedback and interviews, which require scheduling flexibility with institutional participants. At the six-month mark, the Foundation and Anode.GG will re-evaluate any remaining CC milestones to account for material CC/USD volatility. Should the timeline extend beyond nine months because of Committee-requested scope changes, the remaining scope and milestones will be re-baselined at that review.

---

## Co-Marketing

Upon release, Anode.GG will collaborate with the Canton Foundation on:

- Announcement coordination for the public reference implementation.
- A technical walkthrough or case study explaining mandate-based governance permissioning.
- Ecosystem outreach through the Onchain Governance Modeling SIG and relevant governance participants.

---

## Motivation

Canton is governed by institutions that already operate under clear delegation, accountability, and audit expectations. A governance permissioning layer turns those familiar practices into a shared network capability. It can reduce avoidable proposal volume, give Super Validators a predictable review path, and ensure that routine workflow does not obscure decisions that truly require broad attention.

The project is particularly relevant as Canton scales: governance needs traceable authority, time-bound delegation, and readable process records before a large number of participants and committees depend on them. This is also a practical improvement for regulated ecosystem participants that must explain how their governance responsibilities are allocated and supervised.

---

## Rationale

The recommended first step is **gated and scoped, still voted** (Option B in the underlying design). It delivers the highest-value controls—clear authority, typed proposals, auditability, expiry, and fewer malformed submissions—without asking the community to change any current voting rule.

Consent-agenda passage could later accelerate pre-authorized operational items: a holder would submit under a valid mandate, a notice period would open, and a qualified veto would escalate the matter to ordinary Super Validator voting. Professional proxy voting could later allow an SV to appoint an instruction-bound voting or oversight agent. Both depend on the same mandate registry and proposal schema, but each introduces policy decisions that must be considered separately. Keeping them outside this grant reduces implementation and governance risk.

The initial implementation remains off-chain by design. It can integrate with the present governance process, validate the user experience with real participants, and create a well-specified basis for a future CIP or Daml enforcement layer if the community elects to pursue one.

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
| :---- | :---- | :---- | :---- |
| Mandate boundaries are disputed or overlap | Medium | High | Require explicit decision classes, bounds, provenance, and escalation conditions; route unresolved conflicts to mandate review rather than letting the platform infer authority. |
| Scope drifts into a voting-engine redesign | Medium | High | Keep the current voting mechanism and Avro dApp’s voting/signing scope out of this grant; use documented integration boundaries. |
| Registry operation becomes a governance chokepoint | Medium | High | Make mandates public and versioned; fail closed; give the registry no discretionary power beyond the approved rules; document manual fallback. |
| Community adoption is limited | Medium | Medium | Validate with representative participants in a staged workflow, publish reusable interfaces and fixtures, and make integration incremental rather than requiring cutover. |
| A future policy choice is treated as an implementation assumption | Medium | Medium | Keep consent agendas, proxy voting, mandate values, and any protocol enforcement as separately governed follow-on decisions. |

---

## Maintenance and Sustainability

Anode.GG will maintain the reference implementation throughout the delivery period and provide the documentation, test fixtures, public schema, and operating runbook required for independent use and review. The preferred long-term production operator is the Canton Foundation or a service provider selected through a separate Foundation process; no production ownership is assumed by this proposal. The selection process design will be covered in the deliverable.

The public mandate model and integration interfaces are designed to keep the system from becoming dependent on a single provider. Any future production deployment, consent-agenda mode, proxy workflow, or on-chain enforcement remains subject to ordinary Canton governance and a separate maintenance decision.

## Open Source and Licensing

All software, schemas, test fixtures, integration adapters, and documentation produced through this grant will be released publicly under the MIT License.

The project repository will include the full MIT License text, copyright attribution to Anode.GG and contributors, and clear contribution guidance. No proprietary licence, paid feature tier, or restricted-use condition will apply to the grant-funded deliverables.

---

## References

- [CIP-0000 — Canton Improvement Process](https://github.com/canton-foundation/cips/blob/main/cip-0000/cip-0000.md)
- [CIP-0100 — Development Fund governance](https://github.com/canton-foundation/cips/blob/main/cip-0100/cip-0100.md)
- [Canton Development Fund: RFP 9 — Governance automation](../2026-2028-strategic-roadmap.md)
- [Development Fund Proposal Review Process](../Development%20Fund%20Proposal%20Review%20Process.md)
- [Canton SIG Directory](../sig-directory.md)
- [CPMI-IOSCO Principles for Financial Market Infrastructures — Principle 2](https://www.bis.org/cpmi/publ/d101a.pdf)
- [Basel Committee Corporate Governance Principles for Banks — Principle 3](https://www.bis.org/bcbs/publ/d328.pdf)
- [DORA — Regulation (EU) 2022/2554](https://eur-lex.europa.eu/eli/reg/2022/2554/oj)
