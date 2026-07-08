## Development Fund Proposal

**Author:** Helena Assis
**Status:** Draft
**Created:** 2026-07-08
**Last Revised:** 2026-07-08
**Champion:** need Champion
**SIG:** canton-apis

---

## Abstract

This proposal seeks funding to harden and expand `canton-explorer`, an already-usable public explorer and operational console for Canton networks. The project is live today, publicly visible, and already demonstrates immediate value: it gives developers and operators a far clearer view of what is happening on the network without forcing them to rely on ad hoc debugging, scattered logs, or large volumes of custom diagnostic code.

The key idea is that `canton-explorer` is not only a ledger explorer and not only an operations dashboard. Its public value comes from joining those two needs in a single tool: developers can inspect flows, state, and behavior more directly, while operators can use the same system as a practical operational console for real network activity and internal tokens beyond Canton Coin.

As with the SDK proposal, the fact that the product already exists should not be misread as "the work has already been compensated." It means the fund has the opportunity to support a lower-risk, already-proven public good. Significant engineering effort has already been invested to discover the right product shape, build a usable first version, and validate the need. The requested funding is for the next phase: deepen capability, improve reliability and UX, document public use, and make the explorer more broadly adoptable across the ecosystem.

---

## Specification

### 1. Objective

Full delivery of this proposal will result in a production-grade public explorer and operational console for Canton that helps both builders and operators understand network state, flows, and asset behavior with far less manual debugging and far less operational guesswork.

The outcome is a shared ecosystem tool that:

- improves visibility into ledger and network behavior
- helps developers inspect what is happening without writing extensive one-off diagnostic code
- helps operators monitor and reason about operational flows and internal tokens
- provides a public reference implementation for inspection and operational usability on Canton

### 2. Problem and Ecosystem Value

Today, understanding what is happening in a Canton-based system often requires too much manual effort. Developers frequently fall back to console logging, custom scripts, and fragmented inspection paths just to answer basic questions about system behavior. Operators face a parallel problem: they need a usable operational view of real activity on the network, including assets and flows that are meaningful to production usage rather than only the narrow case of Canton Coin.

This leads to several ecosystem problems:

- debugging is slower and more expensive than it should be
- operational visibility is fragmented
- reusable public inspection tooling is weaker than it could be
- each team is pushed toward building its own ad hoc visibility layer

`canton-explorer` addresses these gaps by providing a shared, public tool that improves both developer experience and operational clarity.

### 3. Current Status

`canton-explorer` already exists today as a public project. The public repository is available at `https://github.com/distrohelena/canton-explorer`, and a live demo deployment is already available at `https://canton.sweetsquare.io`.

This matters because it demonstrates:

- the project is not theoretical
- the product already has a working public shape
- the grant would accelerate a validated tool rather than pay for first discovery

That reduces technical risk for the fund and makes milestone evaluation more concrete.

### 4. Implementation Mechanics

The project will be matured through three connected workstreams.

#### Workstream A: Explorer depth and inspection workflows

Improve the explorer's ability to help users understand system state, flows, and asset behavior. This includes deeper and clearer inspection paths for the kinds of questions developers routinely ask while building and debugging Canton applications.

The practical goal is simple: a developer should be able to answer more questions directly in the explorer, instead of needing hundreds or thousands of lines of temporary debugging code.

#### Workstream B: Operational console capabilities

Expand the tool's usefulness for operators by strengthening the operational console aspects of the product, including visibility into internal tokens and other network behaviors beyond the narrow Canton Coin case.

The project should help operators reason about what is happening, not merely display raw data without useful operational structure.

#### Workstream C: Public readiness, UX, and reliability

Improve:

- usability for recurring real-world use
- clarity of important screens and workflows
- documentation for public users
- deployment guidance
- reliability and maintainability of the explorer as a shared public tool

### 5. Out of Scope

This proposal does not seek to fund:

- private customer-specific dashboards
- proprietary operational tooling
- a wallet product
- a replacement for every specialized monitoring system a node operator may still choose to run

The proposal is specifically for a reusable public explorer and operational console with broad ecosystem value.

### 6. Sustainability

The explorer will continue to be maintained as a public project after the grant period through the existing repository and live deployment base.

This proposal funds a focused maturity phase:

- deeper capability
- improved usability
- stronger reliability
- better documentation

The maintenance story is credible because the project is already public, already live, and already useful.

### 7. Milestones

#### M1: Explorer Depth and Inspection Capability

**Funding:** 220,000 CC

Deliver:

- improved inspection workflows for key developer questions
- broader support for understanding flows, state, and assets
- better navigation and visibility for common debugging and analysis tasks

Acceptance criteria:

- representative investigation flows can be completed directly in the explorer
- the product clearly reduces reliance on ad hoc debugging for targeted use cases
- updated public demo reflects the added inspection capabilities

#### M2: Operational Console Expansion

**Funding:** 160,000 CC

Deliver:

- stronger operational views for network activity and internal tokens
- better support for operator-facing workflows
- clearer presentation of state that matters for ongoing network use

Acceptance criteria:

- operator-facing workflows are documented and demonstrable
- public product shows useful support for assets and flows beyond Canton Coin
- targeted operational views are usable without author-only context

#### M3: Public Readiness, UX, and Documentation

**Funding:** 120,000 CC

Deliver:

- improved UX for recurring public use
- clearer user-facing documentation
- deployment or usage guidance for third parties
- reliability improvements needed for broader public consumption

Acceptance criteria:

- public documentation exists for core explorer usage
- live deployment and repository present a coherent public product
- major user workflows are more understandable and repeatable for third parties

#### M4: Security / Reliability Review and Remediation

**Funding:** 120,000 CC

Deliver:

- focused external review of relevant security and reliability concerns
- remediation of in-scope issues
- reviewer-facing documentation of findings and disposition

Acceptance criteria:

- external review completed
- in-scope issues triaged and addressed
- remediation status documented

### 8. Funding Request

Total requested funding: **620,000 CC**

Breakdown:

- M1: 220,000 CC
- M2: 160,000 CC
- M3: 120,000 CC
- M4: 120,000 CC

At a reference price of **0.1263 USD / CC**, this is approximately **78,306 USD** in total, including the external review milestone.

### 9. Alignment with Canton Priorities

This proposal aligns directly with:

- **App Building and Developer Experience:** reduces debugging friction and improves visibility for builders
- **Stability and Maintainability:** gives teams and operators a clearer shared view into system behavior
- **Security and Resilience:** includes an external review and remediation milestone

### 10. Why This Proposal Is a Good Fit for the Fund

`canton-explorer` is a strong fit for the Development Fund because it delivers a shared public benefit. It is not merely a private dashboard for one team. It improves the day-to-day ergonomics of building and operating on Canton and can serve as a public reference point for how visibility and operational usability should feel in the ecosystem.

The project is already live and already useful. That lowers the risk of the proposal, but it should not erase the fact that substantial unpaid engineering work has already been invested to get the product to this point. The fund can now help turn that proven base into a more durable, polished, and broadly reusable public good.
