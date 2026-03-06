# Development Fund Proposal: Canton Flow

**Author:** Canton Flow Team
**Status:** Submitted / Under Review
**Created:** 2026-03-06

## Abstract
Canton Flow is a 100% deterministic, visual smart contract builder tailored for the Canton Network. By providing a drag-and-drop interface, it empowers developers and enterprise architects to visually design privacy-first Daml contracts and instantly generate production-ready code. Canton Flow eliminates the steep Daml learning curve, accelerates enterprise onboarding, and serves as a public good to bridge the gap between business requirements and technical implementation.

**Live Beta / Proof of Concept:** [https://cantonflow.vercel.app/](https://cantonflow.vercel.app/)

## Specification

### 1. Objective
While Canton offers unparalleled privacy and interoperability, the barrier to entry is high. New developers face a steep learning curve with Daml. Furthermore, bridging the gap between Business Units (who need to visually understand data boundaries) and Technical Teams (who write the contracts) causes severe friction in B2B sales cycles. The objective of Canton Flow is to solve this by providing a visual IDE that translates intuitive node-based architecture directly into secure, compilable Daml code without manual coding.

### 2. Implementation Mechanics & Team
Canton Flow is a high-performance web application built with Next.js, React Flow, and Tailwind CSS.
* **Deterministic AST Compiler:** We do not rely on unpredictable LLMs (No AI Hallucinations). The engine uses a strict Abstract Syntax Tree (AST) approach. Every visual node (Party, Asset, Rule) and connected edge deterministically translates to mathematically proven Daml constructs (e.g., `Signatory`, `Observer`, `Choice`).
* **Real-Time Code Generation:** Integrated with a Monaco Editor, the platform provides instant, syntax-error-free `.daml` file generation as the user interacts with the canvas.
* **Team Structure:**
  * **Eren Yegit (Co-Founder & Lead Architect):** Focuses on the AST compiler, Daml generation logic, and DevNet integration.
  * **Emirhan Yıldız (Co-Founder & Frontend Lead):** Focuses on the React Flow canvas, node interactions, and enterprise template designs.
* **Open Source Model:** The core engine will be open-sourced, allowing the community to audit the AST compiler and contribute custom node types.

### 3. Architectural Alignment
This proposal strongly aligns with the Canton Development Fund's priority of funding **"Developer tools and SDKs"** and **"Critical ecosystem infrastructure"**. It provides a shared visual language that makes the Global Synchronizer's cross-app composability visually mappable. By providing pre-built, audited node templates, it enforces standard, secure smart contract patterns across the Canton ecosystem.

### 4. Backward Compatibility
No backward compatibility impact. Canton Flow operates as an external developer tool and generates standard `.daml` files that are fully compatible with existing Canton nodes and SDKs.

## Milestones and Deliverables

**Total Estimated Timeline:** 10 Weeks

### Milestone 1: Core Engine Hardening & Open Source Release
* **Estimated Delivery:** 3 Weeks from approval
* **Focus:** Transitioning the current Beta into a robust, fully documented open-source repository.
* **Deliverables / Value Metrics:**
  * Public GitHub repository release under an MIT/Apache open-source license.
  * Support for advanced Daml types within the visual nodes (Complex Choices, Controllers, and Custom Data Payloads).
  * Comprehensive developer documentation and architecture guides.

### Milestone 2: Cloud DevNet Integration & Sandbox Deployment
* **Estimated Delivery:** 4 Weeks after M1
* **Focus:** Zero-configuration testing and deployment to eliminate onboarding friction.
* **Deliverables / Value Metrics:**
  * Integration of a "One-Click Deploy" mechanism within the UI.
  * Direct API connection to a cloud-hosted Canton DevNet sandbox.
  * Users can push their visual architecture directly to a live node without local Docker or SDK configuration, receiving a success confirmation and endpoint details.

### Milestone 3: Enterprise Template Marketplace
* **Estimated Delivery:** 3 Weeks after M2
* **Focus:** Rapid prototyping for B2B sales and standardizing enterprise workflows.
* **Deliverables / Value Metrics:**
  * Import/Export functionality for JSON blueprints.
  * Integration of 3 pre-built, auditable enterprise templates directly in the UI: Supply Chain Provenance, Tokenized Real Estate, and Syndicated Loans.

## Acceptance Criteria
The Tech & Ops Committee will evaluate completion based on:
* Deliverables completed as specified for each milestone.
* **M1:** Codebase is public, documented, and successfully generates advanced Daml syntax.
* **M2:** A user can click "Deploy" and successfully instantiate their generated model on a connected Canton DevNet environment.
* **M3:** JSON import/export functions flawlessly, and the 3 enterprise templates generate compiling Daml code.

## Funding

**Total Funding Request:** 200,000 CC

### Payment Breakdown by Milestone
* **Milestone 1 (Core Engine):** 60,000 CC upon committee acceptance
* **Milestone 2 (DevNet Integration):** 80,000 CC upon committee acceptance
* **Milestone 3 (Templates):** 60,000 CC upon final release and acceptance

## Volatility Stipulation
**If the project duration is under 6 months:**
Should the project timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility.

## Co-Marketing
Upon release, the implementing entity will collaborate with the Foundation on:
* Announcement coordination on X (Twitter) and ecosystem channels.
* A technical blog post / case study detailing how the AST compiler generates secure Daml.
* A comprehensive video tutorial series for the Canton developer community demonstrating "Zero to DevNet in 5 Minutes".

## Motivation
The greatest hurdle for Canton's mass adoption is not its technology, but its accessibility. Sales engineers and Super Validators currently rely on static slides to pitch Canton to banks. Canton Flow provides an "Aha!" moment: an interactive, visual whiteboard where enterprise clients can see their privacy boundaries mapped out, while developers instantly receive the underlying code. This radically shortens the B2B sales cycle and drastically lowers the onboarding barrier for new developers.

## Rationale
Visual node builders (like Unreal Engine Blueprints or Zapier) are proven paradigms for managing complex logic. We chose a strict AST-to-Code compiler over LLM-based (AI) generation because enterprise financial networks require 100% determinism. AI hallucinates; our compiler maps nodes to mathematically proven Daml rules, ensuring zero security compromises while maximizing developer experience.
