## Development Fund Proposal

**Author: Julien Tinguely**
**Status:** Draft 
**Created:** 2026-08-06
**Label:** node-deployment-operations

**[Champion](https://github.com/canton-foundation/canton-dev-fund/blob/main/sig-directory.md):**  [Itai Segall](https://github.com/isegall-da)


---

## Abstract
This proposal introduces an automated, persistent counterparty lifecycle management system in the SV App to handle unresponsive counterparties and those with vetting errors. 
By shifting counterparty exclusions from in-memory lists to persistent SQL-level anti-joins and isolating failures via recursive batch splitting, 
this mechanism prevents failing nodes from blocking healthy trigger processing, eliminates manual operator intervention, and scales up to 100M total network parties.

---

## Specification

### 1. Objective

Automatically detect, isolate, and reintegrate unresponsive counterparties and those with vetting errors. This prevents transaction backlogs, 
ensures automated workflows continue uninterrupted for healthy participants, and eliminates manual support interventions to unblock stuck tasks.

### 2. Implementation Mechanics

The feature automates the full ignore lifecycle of problematic network counterparties with minimal human intervention:
* **Automated Detection & Exclusion**: Instantly identifies counterparties that time out or run outdated node versions, temporarily bypassing them at the database level so healthy transactions process without delay.
* **Precision Failure Isolation**: Pinpoints failing parties within a batch rather than blocking the entire transaction batch.
* **Automatic Recovery**: Automatically re-attempts processing using exponential backoff. Once a counterparty recovers, they are restored to active status.
* **Operational Guardrails**: Includes a protected safety list to prevent critical ecosystem actors from accidental exclusion, paired with Prometheus metrics for real-time operational dashboard visibility.

More details on the technical design document: [Automatic Handling of Unavailable Counterparties](https://docs.google.com/document/d/1Psf-CoNswmzPwRD1gMhf0M6yumR3_20daYIMF7yDkC4/edit?tab=t.0#heading=h.qe0sef9t9o1w)

### 3. Architectural Alignment

Aligns with the ecosystem priorities for resilience, operational cost reduction, and scalable performance. 
Decoupling core automation triggers from unavailable nodes ensures that a single participant's downtime or delayed upgrade never degrades performance for the rest of the network.

### 4. Backward Compatibility

Non-disruptive rollout with low risk to existing system integrations or user workflows:
* **Flag-Gated Deployment**: All new features are behind feature flags, allowing controlled rollout.
* **Preserved Manual Overrides**: Static ignore lists (e.g., `ignoredPartyIds`) remain fully supported, allowing operators to maintain manual overrides alongside the automation.
* **Zero-Downtime Schema Updates**: Database enhancements are strictly additive and require no breaking changes or maintenance windows.

---

## Milestones and Deliverables

### Milestone 1: Add persistent store
- **Estimated Delivery:*2026.08.31*
- **Focus:** Wire the new persistent store for unavailable counterparties to existing in-memory ignore list
- **Deliverables / Value Metrics:** [Tracking: Automated handling of unavailable counterparties](https://github.com/canton-network/splice/issues/5019)

### Milestone 2: New auto-ignore with backoff logic
- **Estimated Delivery:*2026.09.30*
- **Focus:** Implementation of the core exclusion and reintegration logic of the design
- **Deliverables / Value Metrics:** [Tracking: Automated handling of unavailable counterparties](https://github.com/canton-network/splice/issues/5019)

### Milestone 3: Enable mechanism on production clusters
- **Estimated Delivery:*2026.10.31*
- **Focus:** Implementation of remaining design elements (e.g., Prometheus metrics, safety list, etc.) to enable the mechanism on production clusters
- **Deliverables / Value Metrics:** [Tracking: Automated handling of unavailable counterparties](https://github.com/canton-network/splice/issues/5019)

---

## Acceptance Criteria
The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone
- Demonstrated functionality or operational readiness
- Documentation and knowledge transfer provided
- Alignment with stated value metrics

---

## Funding

**Total Funding Request:**

### Payment Breakdown by Milestone
- Milestone 1 _(Add persistent store)_: XX CC upon committee acceptance
- Milestone 2 _(New auto-ignore with backoff logic)_: XX CC upon committee acceptance
- Milestone 3 _(Enable mechanism on production clusters)_: XX CC upon final release and acceptance

---

## Motivation
Unresponsive or outdated network participants currently block shared background workflows, causing delays for healthy users and requiring costly manual fixes. 
Automating failure detection and recovery ensures the Canton network stays healthy under high-throughput as it scales to millions of users. 
This directly benefits Super Validators running background tasks and all end users expecting seamless transaction processing.

---

## Rationale
Instead of passing slow in-memory lists into database queries, this design uses persistent database anti-joins to cleanly filter out broken nodes at the source. 
When errors occur, recursive batch splitting isolates the exact failing party while exponential backoff automatically restores them once recovered. 
This approach directly extends existing SV triggers without replacing system infrastructure.
