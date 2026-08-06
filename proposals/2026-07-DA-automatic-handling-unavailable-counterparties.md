## Development Fund Proposal

**Author: Julien Tinguely**
**Status:** Draft 
**Created:** 2026-08-06
**Label:** node-deployment-operations

**[Champion](https://github.com/canton-foundation/canton-dev-fund/blob/main/sig-directory.md):**  [Itai Segall](https://github.com/isegall-da)


---

## Abstract
This proposal introduces an automated, persistent counterparty lifecycle management system in the SV App to handle unresponsive or counterparties with vetting errors. 
By shifting counterparty exclusions from dynamic in-memory lists to persistent SQL-level anti-joins and isolating failures via recursive batch splitting, 
this mechanism prevents failing nodes from blocking healthy trigger processing, eliminates manual operator intervention, and scales up to 100M total network parties.

---

## Specification

### 1. Objective

Automatically detect, isolate, and reintegrate unresponsive or outdated network counterparties. This prevents transaction backlogs, 
ensures automated workflows continue uninterrupted for healthy participants, and eliminates manual support interventions to unblock stuck tasks.

### 2. Implementation Mechanics

The feature automates the full ignore lifecycle of problematic network counterparties with minimal human intervention:
* **Automated Detection & Exclusion**: Instantly identifies counterparties that time out or run outdated node versions, temporarily bypassing them at the database level so healthy transactions process without delay.
* **Precision Failure Isolation**: Pinpoints the exact failing party within a batch rather than blocking the entire transaction batch.
* **Automatic Recovery**: Automatically re-attempts processing using exponential backoff. Once a counterparty recovers, they are restored to active status.
* **Operational Guardrails**: Includes a protected safety list to prevent critical ecosystem actors from accidental exclusion, paired with Prometheus metrics for real-time operational dashboard visibility.

More on the technical design document: [Automatic Handling of Unavailable Counterparties](https://docs.google.com/document/d/1Psf-CoNswmzPwRD1gMhf0M6yumR3_20daYIMF7yDkC4/edit?tab=t.0#heading=h.qe0sef9t9o1w)

### 3. Architectural Alignment

Aligns with the ecosystem priorities for resilience, operational cost reduction, and scalable performance. 
Decoupling core automation triggers from unavailable nodes ensures that a single participant's downtime or delayed upgrade never degrades performance for the rest of the network.

### 4. Backward Compatibility

Non-disruptive rollout with low risk to existing system integrations or user workflows:
* **Flag-Gated Deployment**: All automated exclusion capabilities are behind feature flags, allowing controlled rollout, environment-specific testing, and instant toggle-off capability.
* **Preserved Manual Overrides**: Static ignore lists (`ignoredPartyIds`) remain fully supported, allowing operators to maintain manual overrides alongside the automation.
* **Zero-Downtime Schema Updates**: Database enhancements are strictly additive and require no breaking changes or maintenance windows.

---

## Milestones and Deliverables

### Milestone 1: Add persistent store
- **Estimated Delivery:*31.08.2026*
- **Focus:** Implementation of the persistent store for ignored counterparties and link it to existing in-memory ignore list
- **Deliverables / Value Metrics:** [Tracking: Automated handling of unavailable counterparties](https://github.com/canton-network/splice/issues/5019)

### Milestone 2: New auto-ignore with backoff logic
- **Estimated Delivery:*30.09.2026*
- **Focus:** Implementation of the core exclusion and reintegration logic of the design
- **Deliverables / Value Metrics:** [Tracking: Automated handling of unavailable counterparties](https://github.com/canton-network/splice/issues/5019)

### Milestone 3: Enable mechanism on production clusters
- **Estimated Delivery:*31.10.2026*
- **Focus:** Implementation of remaining design elements (e.g., Prometheus metrics, safety list, etc.) to enable the mechanism on production clusters
- **Deliverables / Value Metrics:** [Tracking: Automated handling of unavailable counterparties](https://github.com/canton-network/splice/issues/5019)

---

## Acceptance Criteria
The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone
- Demonstrated functionality or operational readiness
- Documentation and knowledge transfer provided
- Alignment with stated value metrics

(Add any project-specific acceptance conditions.)

The acceptance criteria is to be based on value to the ecosystem and not delivery of an artifact.
For example, a milestone of "10 dApps adopting this capability by August" shows value.  A milestone of
"Deliver this feature with 100% of CI/CD tests passing" does not demonstrate ecosystem value.

---

## Funding

**Total Funding Request:**

### Payment Breakdown by Milestone
- Milestone 1 _(Name)_: XX CC upon committee acceptance
- Milestone 2 _(Name)_: XX CC upon committee acceptance
- Milestone N _(Name)_: XX CC upon final release and acceptance

### Volatility Stipulation
If the project duration is **greater than 6 months**:
The grant is denominated in fixed Canton Coin and will require a re-evaluation at the 6-month mark.

If the project duration is **under 6 months**:
Should the project timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility.

---

## Co-Marketing
Upon release, the implementing entity will collaborate with the Foundation on:

- Announcement coordination
- Case study or technical blog
- Developer or ecosystem promotion

(Add any specific commitments.)

---

## Motivation
Why is this valuable to the Canton ecosystem?
Describe the ecosystem impact, expected adoption, or strategic importance.  Provide an estimate of the portion of the ecosystem that benefits (e..g, 50% of dApps use TypeScript and we expect 50% of them will use our TypeScript library).

---

## Rationale
Why is this the right approach to deliver that value?
Explain design decisions, alternatives considered, and why this solution is preferred.  In particular, explain how this proposal fits
into the existing ecosystem tooling, libraries, frameworks, etc. If this is a proposal to replace something that exists,
then explain why the proposal cannot fit into the existing component by extending what exists.  The default approach should be to extend what exists.
