## Development Fund Proposal

**Author:** Tenzro Labs
**Status:** Submitted
**Created:** 2026-03-02

---

## Abstract

This proposal requests a grant from the Development Fund to support Tenzro Labs in building the **DAML Cloud IDE** — a dedicated, browser-based Integrated Development Environment for the Canton Network and DAML smart contracts.

The DAML Cloud IDE will provide a complete, zero-install development experience featuring a full-featured code editor, integrated terminal, in-browser DAML compilation and build tooling, contract simulation, and one-click deployment to Canton Devnet. The platform includes an AI-powered assistant specialized in DAML and Canton, and an AI-driven documentation platform for dynamic content creation.

Building on existing, production-ready assets (DAML Studio — a web-based intelligent development platform used by hundreds of developers across the US and Asia for learning and coding DAML contracts with AI-assisted prompts; DAML Coder — with VS Code + Cursor integration; and the Tenzro Canton Development Platform providing enterprise-grade infrastructure with Canton Network integration, validator node operations, and developer tools), the DAML Cloud IDE will eliminate fragmentation, accelerate developer productivity, and serve as a central hub for the Canton ecosystem.

---

## Specification

### 1. Objective

Deliver a comprehensive, browser-native DAML development environment enhanced with AI-powered documentation:

**Core IDE Features**
- Full-featured code editor with DAML syntax highlighting, auto-completion, and error diagnostics
- Integrated terminal for command-line operations, DAML SDK commands, and shell access
- In-browser DAML compilation, build tooling, and real-time error reporting
- Contract simulator for local testing and validation of DAML templates
- Project management system with file tree, multi-file editing, and workspace configuration
- One-click Canton Devnet deployment via Tenzro nodes
- Real-time collaboration and instant project sharing

**AI Assistant & Agent System**
- Full AI assistant (8–12B DAML-specialized model + Gemini 3.1 orchestration)
- Multi-agent system for best-practice enforcement, security audits, resource optimization, and EVM/Solana migration guidance
- Always-up-to-date SDK integration and contextual code suggestions

**AI-Powered Documentation Platform**
- AI-driven search and generation for DAML/Canton docs, auto-generating examples, step-by-step guides, and interactive tutorials based on user queries or project context

The platform exposes public APIs and MCP endpoints, and provides onboarding pathways including EVM/Solana migration wizards, tutorials, and templates.

### 2. Implementation Mechanics

Accelerated development and testing roadmap leveraging existing components:

- **Weeks 1–4: Core IDE Platform + AI Integration**
  Code editor, integrated terminal, DAML compiler integration, build system, contract simulator, project management, file system, and Devnet deploy pipeline. Backend microservices, real-time collaboration infrastructure, and user authentication. AI assistant rollout and agent swarm integration. AI-powered documentation platform (search/indexing/generation over Canton docs). Integrated testing, polish, and internal beta.

- **Weeks 5–8: Public Release + Onboarding Suite**
  Full onboarding suite (EVM/Solana migration tools, templates, tutorials). Documentation platform polish. Comprehensive end-to-end testing. Public release with launch documentation.

**Infrastructure stack (GCP):**
- Dedicated A100 GPU node for model inference
- GKE Autopilot Kubernetes cluster for microservices
- Scalable PostgreSQL, Redis, Milvus (embeddings), Dgraph (graph/AI-native data)
- Public APIs + MCP endpoints

### 3. Architectural Alignment

Directly supports the Canton Foundation's top priority: **massive developer adoption**. A zero-install, browser-native IDE removes all setup friction and provides instant access to a complete DAML development environment — editor, terminal, compiler, simulator, and deployment — from any device. The integrated AI-powered documentation platform drives engagement by providing always-current resources, accelerating knowledge sharing and ecosystem growth.

### 4. Backward Compatibility

Fully compatible with existing DAML SDK, Daml Studio, and Tenzro Platform. Projects import with zero migration effort; existing docs can be ingested seamlessly.

---

## Milestones and Deliverables

### Milestone 1: Core DAML Cloud IDE + AI Integration
- **Estimated Delivery:** +4 weeks (end of Week 4)
- **Focus:** Fully functional Cloud IDE with core development features and AI assistant.
- **Deliverables / Value Metrics:**
  - Code editor with DAML syntax support, auto-completion, and diagnostics operational in browser
  - Integrated terminal with full shell access and DAML SDK command support
  - In-browser DAML compilation, build tooling, and real-time error reporting
  - Contract simulator for template testing and validation
  - Project management with file tree, multi-file editing, and workspace configuration
  - One-click Canton Devnet deploy via Tenzro nodes
  - Real-time collaboration and project sharing
  - AI assistant and agent swarm active (best-practice enforcement, security audits, migration guidance)
  - AI-powered docs generation and search over Canton documentation
  - Comprehensive testing suite passed
  - Internal beta access open

### Milestone 2: Public Release + Onboarding Suite
- **Estimated Delivery:** +8 weeks (end of Week 8)
- **Focus:** Production-ready public launch with complete onboarding tools and polished documentation.
- **Deliverables / Value Metrics:**
  - EVM/Solana onboarding tools, migration wizards, templates, and tutorials
  - Polished documentation platform
  - End-to-end testing complete
  - Successful public launch with documentation

### Milestone 3: Post-Launch Stabilization
- **Estimated Delivery:** +8 weeks post-release (covered within grant period)
- **Focus:** Stability, performance, and early adoption growth.
- **Deliverables / Value Metrics:**
  - Critical bug fixes and performance tuning
  - Model refinement based on real-world usage
  - Documentation updates
  - User support and onboarding assistance

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone
- Demonstrated functionality or operational readiness
- Documentation and knowledge transfer provided
- Alignment with stated value metrics

**Project-specific acceptance conditions:**

- **Milestone 1:** ≥ 90% of sample projects compile/deploy successfully on first try; integrated terminal executes DAML SDK commands correctly; AI docs search/generation returns relevant, accurate results >85% in tests; all features pass integrated testing.
- **Milestone 2:** Successful public launch; AI acceptance rate >35% in blind tests; agent-detected security issues >95%; onboarding tools functional for EVM/Solana developers.
- **Milestone 3:** ≥ 99% uptime during stabilization; ≥ 200 active monthly users within 60 days of launch; positive early feedback (NPS > 65).

---

## Funding

**Total Funding Request:** 540,000 CC (approximately $85,000 USD at 0.1575 USD/CC).

### Payment Breakdown by Milestone

- **Milestone 1** (Core Cloud IDE + AI Integration): 351,200 CC upon committee acceptance
  - Personnel (4 FTE × 4 weeks): ~266,700 CC (≈ $42,000)
  - GPU / Model Fine-Tuning (~400–500 GPU-hours, A100): ~76,200 CC (≈ $12,000)
  - Other (API credits, monitoring, security scans): ~8,300 CC (≈ $1,300)

- **Milestone 2** (Public Release + Onboarding Suite): 188,800 CC upon committee acceptance
  - Production Inference & Hosting (A100 node + GKE + databases, initial 3–4 months): ~57,100 CC (≈ $9,000)
  - Training Data (DAML/Canton corpus curation, data labeling, embeddings generation, fine-tuning pipelines): ~63,500 CC (≈ $10,000)
  - Onboarding & Launch (migration tools, templates, testing, beta incentives): ~19,000 CC (≈ $3,000)
  - Contingency (~10%): ~49,200 CC (≈ $7,800)

### Payment Schedule

- Upon approval / start: 270,000 CC (50%)
- Upon Milestone 2 completion & public release: 270,000 CC (50%)

### Volatility Stipulation

The grant is denominated in fixed Canton Coin (CC). Should the project timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility.

### Budget Assumptions

- **Team Composition** (4-person full-time sprint team for 2 months):
  - 1 × Senior Full-Stack / AI Engineer (AI fine-tuning, agent orchestration, backend)
  - 1 × Frontend / Cloud Engineer (React/TS, browser IDE, terminal integration, real-time features)
  - 1 × Platform Engineer (compiler integration, build system, simulator, SDK tooling)
  - 1 × DevOps / Infrastructure Engineer (GCP setup, Kubernetes, GPU inference, CI/CD)
- **Personnel Rate:** Blended hourly rate of $180/hour per team member (includes base salary, benefits, taxes, and overhead).
- **GPU Pricing:** GCP on-demand A100 80GB ≈ $3.67–$4.52/hour per GPU; spot discounts up to 60–91% possible for dev bursts.
- **Contingency:** ~10% buffer for unexpected compute spikes or minor scope adjustments.
- **Transparency:** Full timesheets, GCP billing exports, model training logs, and salary benchmarks available upon request.

---

## Co-Marketing

Upon release, Tenzro Labs will collaborate with the Foundation on:

- Joint launch announcement and case studies
- Developer webinars showcasing the DAML Cloud IDE
- Promotion across Canton ecosystem channels

**Additional Asks:**
- Priority access to Canton Devnet resources and internal best-practice repositories (to seed the docs platform)
- Collaboration on official "Canton Recommended IDE" badge and documentation integration

---

## Motivation

Hundreds of developers already rely on DAML Studio and the Tenzro Platform daily. Delivering a modern, browser-native IDE with integrated terminal, compilation, simulation, and deployment — augmented with an AI-powered documentation platform for dynamic content creation — will dramatically lower barriers, accelerate onboarding (especially from EVM/Solana), and grow the Canton developer ecosystem.

---

## Rationale

A Cloud-first approach delivers the fastest path to broad developer accessibility. By providing a zero-install IDE with full development capabilities — editor, terminal, compiler, simulator, and one-click deployment — developers can start building on Canton immediately from any browser. The AI-powered docs and content creation will keep resources fresh and user-generated, while community tools drive retention and contributions. The accelerated timeline is achievable thanks to a mature existing stack, which provides a production-proven foundation for rapid build-out.
