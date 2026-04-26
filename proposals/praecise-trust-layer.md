# **Development Fund Proposal**

**Author:** Praecise
**Status:** Submitted (Revised April 2026)
**Created:** 2026-03-04


## **Abstract**

Praecise proposes building the **Praecise Trust Layer** — a lightweight, policy-enforced **delegation and execution control layer** for the Canton Network.

Rather than introducing a new identity or compliance system, Praecise builds directly on Canton’s existing identity primitives and sub-transaction privacy model to enable secure, auditable delegation from Guardians (humans or institutions) to Agents (autonomous systems or code) under clearly defined Policies.

This addresses a practical gap in agent-driven workflows — how identities can safely delegate authority to autonomous systems — without duplicating ongoing work on identity, credentials, or compliance.

Parts of the Praecise framework are already under active development and in production use within real systems, reducing execution risk and demonstrating immediate applicability.

---

## **Specification**

### **Objective**

Deliver a standardized **Guardian → Agent → Policy** framework that enables controlled delegation and enforceable execution:

* **Guardians** define permissions, constraints, and revocation rules
* **Agents** operate strictly within those defined constraints
* **Policies** enforce boundaries such as spending limits, approval thresholds, and permitted actions, with full auditability

---

### **Core Components (Phase 1 Scope)**

* DAML templates for:

  * Guardian identity linkage
  * Agent registration and authorization
  * Policy definition and enforcement

* Policy enforcement mechanisms:

  * Per-action constraints (e.g. value limits, allowed operations)
  * Approval thresholds for sensitive actions

* Revocation system:

  * Immediate and global revocation of agent permissions
  * Propagation across active sessions and workflows

* Auditability:

  * Delegation and execution events recorded and verifiable on Canton

This proposal is intentionally scoped to **delegation and policy enforcement only**.

Out of scope:

* Identity issuance systems
* KYC or compliance infrastructure
* Cross-chain bridging

---

## **Implementation Mechanics**

Development builds on existing internal systems and DAML expertise:

* **Weeks 1–4:** Core DAML templates (Guardian, Agent, Policy) and enforcement logic
* **Weeks 5–8:** Revocation mechanisms, audit flows, and integration with sample agent workflows
* **Weeks 9–12:** Security review, documentation, SDK stubs, and public Devnet deployment

---

## **Architectural Alignment**

The Praecise Trust Layer complements Canton’s architecture by:

* Building on existing identity primitives rather than replacing them
* Using DAML authorization patterns for enforceable delegation
* Extending Canton’s privacy model to controlled agent execution

It aligns with ongoing CIP efforts by focusing on **standardized enforcement and execution control**, rather than redefining identity or credential systems.

---

## **Ecosystem Context**

The need for standardized delegation and policy enforcement is emerging alongside the rapid development of agent-native payment and execution systems.

Protocols such as **x402 (Coinbase)** and **Stripe’s Machine Payments Protocol (MPP)** enable autonomous agents to directly transact for services. In parallel, major payment networks such as **Visa** and **Mastercard** are introducing agent authorization frameworks (e.g. Trusted Agent Protocol and Agent Pay), defining how agents are permitted to spend on behalf of users.

These developments establish a clear separation of concerns:

* Payment protocols handle execution of transactions
* Authorization frameworks define who is allowed to spend
* A missing layer is how authority is **constrained, enforced, and revoked** across agents

Praecise addresses this gap by providing a standardized delegation and policy enforcement layer, ensuring that agent-driven systems — regardless of underlying payment or execution protocol — operate within clearly defined and auditable boundaries.

---

## **Practical Context and Validation**

The need for this layer arises directly from real-world agent-based systems.

In existing implementations, agents are already performing autonomous actions such as requesting paid resources and executing transactions. These systems require strict enforcement of constraints defined by a controlling entity, including:

* Per-request and daily spending limits
* Allowed assets and execution contexts
* Approval thresholds for higher-value actions
* Immediate revocation and freeze capabilities

These controls are currently enforced across multiple layers (application logic, smart contracts, and settlement systems), demonstrating both the necessity and feasibility of a **standardized delegation framework**.

---

## **Backward Compatibility**

* Fully opt-in and non-invasive
* No changes to existing Canton infrastructure
* Compatible with Smart Contract Upgrade rules
* Uses optional fields where appropriate

---

## **Milestones and Deliverables**

### **Milestone 1: Core Policy Framework (End of Week 4)**

* DAML templates for Guardian, Agent, and Policy
* Basic policy enforcement and validation

**Acceptance:**
End-to-end test demonstrating:

* policy creation
* agent execution within constraints
* enforcement verification on Canton Devnet

---

### **Milestone 2: Revocation & Integration (End of Week 8)**

* Global revocation system
* Sample integrations with agent workflows

**Acceptance:**

* Successful constrained execution
* Revocation propagates and blocks further actions

---

### **Milestone 3: Security Review & Public Release (End of Week 12)**

* Security review and remediation
* Documentation and SDK stubs
* Open-source DAML templates
* Public Devnet deployment

**Acceptance:**

* Clean security review
* Templates usable by external teams
* Deployment verifiable on Devnet

---

## **Acceptance Criteria**

* Delegation and policy enforcement fully operational on Canton Devnet
* Policies correctly constrain agent behavior
* Revocation functions reliably across scenarios
* Documentation sufficient for adoption by external teams

---

## **Funding**

**Total Funding Request:** 580,000 CC (approximately $91,350 USD)

### **Payment Schedule**

* 50% upon approval
* 50% upon completion and verification of milestones

### **Budget Overview**

* Personnel (leveraging existing development): majority
* Security review and infrastructure: ~20%
* Contingency: ~10%

---

## **Adoption and Success Metrics**

Success will be measured by:

* Adoption of the delegation framework by Canton applications
* Number of agent-driven workflows using policy enforcement
* Reduction in custom, application-specific delegation implementations
* Demonstrated use in real-world agent execution scenarios

We are already utilizing components of this system internally and expect early adoption from teams building agent-based workflows, particularly in payments, orchestration, and multi-agent systems.

---

## **Long-term Maintenance**

Praecise will maintain the framework for at least 6–12 months post-release and is open to contributing components to relevant CIP efforts or transitioning stewardship to the broader ecosystem.

---

## **Co-Marketing & Alignment**

* Coordination with relevant CIP efforts around delegation and credentials
* Joint technical content on secure agent execution in Canton
* Developer workshops demonstrating policy-enforced delegation

**Requests:**

* Canton Devnet access
* Technical feedback on DAML contract design

---

## **Motivation**

As Canton evolves to support increasingly autonomous and agent-driven workflows, there is a growing need for standardized mechanisms that allow identities to safely delegate authority to agents.

Without a shared framework, each application must implement its own delegation logic, leading to fragmentation, inconsistent security models, and increased operational risk.

The Praecise Trust Layer provides a consistent, auditable, and privacy-preserving way to manage agent execution — enabling safer adoption of autonomous systems while preserving institutional control.
