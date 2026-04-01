---

# **Development Fund Proposal**

**Author:** Tenzro Labs
**Status:** Submitted (Revised April 2026)
**Created:** 2026-03-02

---

## **Abstract**

This proposal requests funding from the Canton Development Fund to build the **DAML Cloud IDE** — a zero-install, **AI-native**, browser-based development environment for DAML and the Canton Network.

Rather than being a traditional IDE, the Cloud IDE is designed as an AI-assisted development environment where developers can move from idea to deployed Canton application through a combination of direct coding, simulation, and AI-driven workflows.

The platform enables developers to write, compile, simulate, and deploy DAML contracts to Canton Devnet directly from any browser, with no local setup required — significantly reducing onboarding friction, particularly for developers coming from EVM or Solana ecosystems.

The project builds on our existing production systems, including DAML Studio (used by 100+ active developers) and the Tenzro Canton Development Platform. It complements, rather than replaces, the official Visual Studio Code extension and local CLI workflows.

---

## **Specification**

### **Core Objective (Phase 1)**

Deliver a zero-install, browser-native environment that enables developers to go from idea to deployed Canton application in a single interface.

Core capabilities include:

* Full-featured code editor with DAML syntax support and real-time diagnostics
* In-browser DAML compilation and build tooling
* Interactive contract simulator for rapid validation
* One-click deployment to Canton Devnet
* Integrated terminal and project management
* Real-time collaboration and project sharing

In addition, the platform integrates **AI-native development workflows** already built and in use within DAML Studio, including:

* DAML/Canton-specialized AI assistant for contract generation, explanation, and debugging
* Multi-agent workflow system capable of assisting in contract development, testing, and iteration

These capabilities are already implemented and actively used, and will be integrated into the Cloud IDE without impacting Phase 1 delivery or introducing execution risk.

---

## **Implementation Mechanics**

Development leverages existing infrastructure and codebases for rapid execution:

* **Weeks 1–3:** Core browser-based environment (editor, compiler, simulator, deployment pipeline)
* **Weeks 4–6:** Collaboration layer and integration of existing AI workflows
* **Weeks 7–8:** Public release, documentation, and onboarding materials

---

## **Architectural Alignment**

The DAML Cloud IDE directly supports Canton’s goal of expanding its developer ecosystem by addressing one of the primary barriers to adoption: **setup complexity and time-to-first-deployment**.

By combining zero-install access with AI-assisted development, the platform enables:

* Faster onboarding for new developers
* Reduced friction for developers transitioning from EVM and other ecosystems
* Accessibility for workshops, hackathons, and educational environments

We are already seeing demand from developers using DAML Studio and related tooling, as well as from broader developer pipelines (e.g., hackathon and onboarding environments), where zero-install workflows significantly improve accessibility and adoption.

Rather than replacing existing tooling, the Cloud IDE acts as an **entry point and acceleration layer** for the broader Canton development ecosystem.

---

## **Backward Compatibility**

The Cloud IDE is fully compatible with the existing DAML SDK, CLI workflows, and the Visual Studio Code extension. Projects can be imported and exported seamlessly between environments.

---

## **Milestones and Deliverables**

### **Milestone 1: Core Environment (End of Week 4)**

* Browser-based editor, compiler, simulator, and Devnet deployment operational
* Acceptance: Standard DAML projects compile and deploy successfully entirely in-browser

### **Milestone 2: Public Release & AI Integration (End of Week 8)**

* AI assistant and multi-agent workflows integrated
* Real-time collaboration enabled
* Public release with documentation

**Acceptance:**

* Developers can complete full workflow (idea → build → deploy) in a single environment
* Stable public release with measurable usage

---

## **Acceptance Criteria**

* All core functionality verifiable on Canton Devnet
* A new developer can go from idea to deployed contract entirely in-browser
* AI-assisted workflows demonstrably support development tasks
* Documentation sufficient for onboarding new developers

---

## **Funding**

**Total Funding Request:** 480,000 CC (approximately $75,600 USD)

### **Payment Schedule**

* 50% upon approval
* 50% upon successful public release

### **Budget Overview**

* Personnel (leveraging existing systems): majority
* Infrastructure and testing: ~20%
* Contingency: ~10%

---

## **Adoption and Success Metrics**

* Target: 150–200 active monthly users within 60 days

Metrics include:

* Successful in-browser deployments
* Repeat usage and developer retention
* Reduction in time-to-first-deployment
* Increase in new developers deploying applications to Canton Devnet

Success will be measured not only by usage, but by **how effectively the Cloud IDE contributes to onboarding new developers and increasing activity on the Canton Network**.

---

## **Long-term Maintenance**

Tenzro Labs will maintain the project as open source for at least 12 months and welcomes community contributions.

---

## **Co-Marketing & Requests**

* Joint announcement and developer onboarding initiatives with the Canton Foundation
* Developer workshops demonstrating AI-assisted DAML development

**Requests:**

* Canton Devnet access
* Coordination with Foundation tooling teams

---

## **Motivation**

Canton provides strong infrastructure for privacy-preserving applications, but developer onboarding remains constrained by setup complexity and fragmented workflows.

The DAML Cloud IDE addresses this by combining **zero-install access with AI-native development**, enabling developers to move from concept to deployment quickly and reliably.

This lowers the barrier to entry while increasing the speed, accessibility, and quality of development across the Canton ecosystem.
