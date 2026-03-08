## Development Fund Proposal: CantonFlow — Visual BPMN Builder for Canton with Vibe Coding

**Author:** Stratos Lab — Dhonam Pemba, Kwang Wei Sim
**Status:** Draft
**Created:** 2026-03-08

---

## Abstract

Enterprise workflow adoption on Canton faces a steep barrier: Daml's powerful privacy and authorization model requires developers to think about data ownership at every line of code, making it inaccessible to the business analysts and process architects who design institutional workflows. Meanwhile, BPMN (Business Process Model and Notation) is the global standard for enterprise process design — used across finance, insurance, and supply chain — but existing BPMN engines like Camunda operate as centralized orchestrators that cannot deliver Canton's privacy, immutability, or multi-party trust guarantees.

CantonFlow bridges this gap by delivering a visual BPMN 2.0 builder that transpiles diagrams directly into Daml smart contracts for deployment on the Canton Network. Built on bpmn-js (the same engine powering Camunda Modeler), CantonFlow extends the standard with Canton-native properties — Signatories, Controllers, and Observers — mapped directly to BPMN Lanes and Tasks. An integrated LLM-powered "Vibe Agent" allows users to describe workflows in natural language and generate both the BPMN diagram and corresponding Daml code simultaneously, with real-time linting against Canton's authorization model.

This proposal requests **350,000 CC** across four milestones over five months to deliver the visual builder, BPMN-to-Daml transpiler, vibe coding integration, live Canton cockpit, and comprehensive documentation. All deliverables will be released under the Apache 2.0 license as reusable ecosystem infrastructure.

| Evidence | Link |
|---|---|
| Hackathon Prototype (Canton Catalyst/Construct winner, collateral-margin track) | https://github.com/stratoslab/cpcv-hackathon |
| Canton Wallet SDK | https://github.com/stratoslab/stratos-wallet-sdk |
| Canton LedgerView | https://github.com/stratoslab/Canton-LedgerView |
| Canton MCP Server | https://github.com/stratoslab/Canton-MCP-Server |
| Canton Quickstart Fork | https://github.com/stratoslab/cn-quickstart |
| Website | https://stratoslab.xyz |
| X (Twitter) | https://x.com/StratosLab_ |

---

## Specification

### 1. Objective

Canton and Daml offer institutional-grade privacy, deterministic execution, and multi-party authorization — but adoption is constrained by developer accessibility. Today, building a multi-party workflow on Canton requires:

- Deep understanding of Daml's Create-Exercise (UTXO-like) model
- Manual reasoning about signatory, controller, and observer authorization at every state transition
- No visual tooling for designing, simulating, or debugging workflows

Meanwhile, the enterprise world designs processes in BPMN 2.0 using tools like Camunda. Over 70% of Fortune 500 financial institutions use BPMN for process modeling. But BPMN engines are centralized orchestrators — a "God Object" that tells everyone what to do — fundamentally incompatible with Canton's decentralized choreography model where logic is embedded in contracts and validated by stakeholders.

CantonFlow resolves this by building a **Decentralized BPMN Engine** — a visual builder where business analysts design workflows in the global BPMN standard, while the execution layer is secured by Daml's privacy-preserving ledger on Canton. The tool enforces Canton's trust model at design time, preventing users from accidentally creating centralized workflows.

The intended outcomes are:

1. **Visual BPMN Builder** with Canton-native properties panel (Signatories, Controllers, Observers) built on the industry-standard bpmn-js toolkit.
2. **BPMN-to-Daml Transpiler** that converts annotated BPMN 2.0 XML into compilable Daml smart contracts, mapping Lanes to Parties, Tasks to Choices, Gateways to branching logic, and Sequence Flows to state transitions.
3. **Vibe Coding Agent** powered by LLM integration that generates BPMN diagrams and Daml code from natural language descriptions, with automatic party assignment, authorization validation, and self-correcting build loops.
4. **Live Canton Cockpit** that connects to the Canton Ledger API and visualizes active contracts as tokens on the BPMN canvas, enabling real-time monitoring and transaction inspection.

### 2. Implementation Mechanics

CantonFlow operates as a client-side web application with optional backend services for compilation, deployment, and AI integration.

**Visual Builder (Front-End)**

- **Canvas Engine:** bpmn-js — the same rendering and interaction engine that powers Camunda Modeler. Handles BPMN 2.0 diagram creation, editing, import/export natively.
- **Custom Properties Panel:** Replaces Camunda's execution-specific tabs (Listeners, Execution) with Canton/Daml properties:
  - *Signatories:* Who is legally bound by this step (maps to Daml `signatory`)
  - *Controllers:* Who has the right to execute this step (maps to Daml `controller`)
  - *Observers:* Who can see the data without acting on it (maps to Daml `observer`)
  - *Template Fields:* Data inputs/outputs for each task (maps to Daml `with` parameters)
- **Daml Linting Layer:** Real-time validation that highlights tasks in red if they violate Canton's authorization model (e.g., missing Controller, cross-lane arrow without explicit permission handoff, gateway without defined decision authority).
- **BPMN Element Mapping enforced in UI:**

| BPMN Element | Canton/Daml Meaning | Implementation |
|---|---|---|
| Pool/Lane | Party | Each Lane maps to a Canton Party ID |
| Start Event | Contract Creation | Initial `create` command |
| User Task | Choice on Contract | A `choice` exercised by the Lane's Party (Controller) |
| Service Task | Off-ledger Automation | Daml Trigger or Automation Bot via Ledger API |
| Sequence Flow | State Transition | Consuming old contract, creating new contract |
| Message Flow | Cross-Participant Action | Choice exercised by a party in a different Lane |
| Exclusive Gateway (XOR) | Multi-Choice Pattern | Multiple choices on a single contract with `assert` guards |
| Parallel Gateway (AND) | Multi-party Signatures | Pending contract requiring all parties to sign before next step |
| Inclusive Gateway (OR) | Multiple Optional Choices | Optional choices with state management |
| Boundary Timer Event | Contract Expiry | `getTime` + external Clock provider for timeout triggers |
| End Event | Archiving | Consuming choice that does not create a follow-up contract |

**BPMN-to-Daml Transpiler (Core Engine)**

- Custom TypeScript module that parses annotated BPMN 2.0 XML and generates `.daml` template files.
- **Transpilation strategy:** Each Task is treated as a consuming choice, ensuring the ledger state stays lean and the "token" moves forward — mimicking Camunda's execution behavior while maintaining Canton's integrity.
- **State Machine Template pattern:** Instead of generating a new Daml Template per BPMN Task, the transpiler generates a Generic State Template with:
  - `processId`, `currentActivityId`, `variables` (Map), `activeParties`
  - A `Progress` choice that takes an `Action` as input, validates against the process definition, and creates the next state contract
- **Exclusive Gateway (XOR) mapping:** Generates either the Multi-Choice Pattern (for user-driven decisions) or automated bot logic (for service-driven decisions) with `assert` guards for each path.
- **Parallel Gateway (AND) mapping:** Generates pending contracts requiring multi-party signatures before the join step triggers.
- **Compilation pipeline:** Generated `.daml` files are compiled to `.dar` via `daml build`, with errors fed back to the visual builder for inline display.

**Vibe Coding Agent**

- **Conversational sidebar** integrated into the builder where users describe workflows in natural language.
- **Example interaction:** User types "Create a trade finance workflow where the Bank must approve a letter of credit after the Buyer signs, but only if the amount is under $1M." The agent:
  1. Identifies parties (Bank, Buyer) and creates BPMN Lanes
  2. Creates User Tasks with appropriate Controllers
  3. Adds an Exclusive Gateway with amount-based condition
  4. Assigns Signatories and Observers based on the described relationships
  5. Generates the BPMN XML and renders on canvas
- **Agentic build loop:** When the user clicks "Generate Code," the agent drafts Daml templates, runs `daml build`, reads any errors, and self-corrects both the BPMN model and Daml code until compilation succeeds.
- **Context file (`.cantonrules`):** A project-level configuration file that teaches the AI agent Canton-specific constraints: "Every transition must have a controller. If a task is in the 'Regulator' lane, they must be an observer on all previous steps." Ensures AI-generated code never violates the decentralized trust model.

**Live Canton Cockpit**

- Connects to Canton Ledger API to query the Active Contract Set (ACS).
- Uses bpmn-js overlays to render "Active Contracts" as glowing tokens on the BPMN diagram nodes.
- **Transaction inspection:** Clicking a completed task displays the Canton Transaction ID, participating parties, and privacy scope.
- **Interactive simulation:** Deterministic replay of Daml contract state, allowing users to explore "what if" scenarios against the visual diagram.

**Deployment Pipeline**

- One-click "Deploy to Canton" that compiles Daml to `.dar` and uploads to a target participant node via the Ledger API.
- Support for Canton Sandbox (local development), DevNet (testing), and MainNet deployment targets.

### 3. Architectural Alignment

CantonFlow reinforces Canton's core architectural principles while expanding ecosystem accessibility:

- **Sub-transaction privacy:** The builder enforces Canton's privacy model at design time. Cross-lane interactions require explicit permission handoffs. The properties panel makes Signatory/Controller/Observer assignment a first-class visual concept, ensuring that privacy boundaries are defined before code generation — not as an afterthought.
- **Daml smart contracts:** All generated business logic is expressed in Daml, ensuring deterministic execution, formal verifiability, and composability with other Daml applications on Canton. Generated contracts follow Daml best practices and the State Machine Template pattern.
- **Global Synchronizer compatibility:** Generated contracts are designed for deployment on Canton's Global Synchronizer, enabling cross-domain workflow execution across participating nodes.
- **No protocol modifications:** CantonFlow operates entirely at the application and tooling layer. It introduces no changes to Canton's protocol, consensus mechanism, or synchronization infrastructure.
- **Ecosystem composability:** Generated Daml contracts expose well-defined interfaces. Workflows designed in CantonFlow can integrate with existing Canton applications, and existing `.daml` files can be imported into the builder's data object library.
- **Decentralization by design:** The builder's linting layer prevents the "Centralization Trap" — ensuring every arrow crossing lanes represents an explicit permission handoff, enforcing Canton's choreography model over Camunda's orchestration model.

**Relevant CIP alignment:**
- **CIP-0082:** All deliverables constitute shared ecosystem infrastructure — developer tooling that benefits every Canton builder. Released as public goods under Apache 2.0.
- **CIP-0100:** Milestone structure and acceptance criteria are designed for transparent evaluation by the Tech & Ops Committee.

### 4. Backward Compatibility

CantonFlow is entirely new tooling infrastructure. It introduces no modifications to existing Canton protocol components, smart contracts, or ecosystem tooling. Existing applications and workflows are unaffected.

The builder imports and exports standard BPMN 2.0 XML, maintaining compatibility with existing Camunda diagrams (which can be imported and annotated with Canton properties).

*No backward compatibility impact.*

---

## Milestones and Deliverables

### Milestone 1: Specification & Daml-Flavored Modeler
- **Estimated Delivery:** Month 1 (4 weeks)
- **Focus:** Technical specification, BPMN-to-Daml mapping formalization, and base visual builder with Canton properties panel.
- **Deliverables / Value Metrics:**
  - Technical specification document covering the full BPMN-to-Daml mapping table, transpiler architecture, and state machine template design
  - Architecture decision records documenting design choices for the transpiler strategy, state management pattern, and gateway mapping approaches
  - Functional bpmn-js-based visual builder (React application) with:
    - Standard BPMN 2.0 diagram creation and editing
    - Custom Canton properties panel (Signatories, Controllers, Observers, Template Fields)
    - Daml linting layer that validates authorization constraints in real-time
    - BPMN XML import/export with Canton metadata preserved via custom XML namespaces
  - Public GitHub repository initialized with project structure, CI/CD pipeline, and contribution guidelines
  - Test framework design with scenario definitions for transpiler validation

### Milestone 2: BPMN-to-Daml Transpiler & One-Click Deploy
- **Estimated Delivery:** Month 2–3 (8 weeks)
- **Focus:** Core transpiler engine, Daml code generation, compilation pipeline, and deployment to Canton.
- **Deliverables / Value Metrics:**
  - BPMN-to-Daml transpiler supporting: Start/End Events, User Tasks, Service Tasks, Sequence Flows, Message Flows, Exclusive Gateways (XOR), Parallel Gateways (AND), and Inclusive Gateways (OR)
  - State Machine Template pattern implementation for efficient Daml contract generation
  - Compilation pipeline integrating `daml build` with error feedback displayed inline on the visual canvas
  - One-click "Deploy to Canton" targeting Canton Sandbox and DevNet
  - Integration test suite with 85%+ code coverage on the transpiler, validating correct Daml generation for each BPMN element type
  - End-to-end demonstration: design a multi-party workflow in the visual builder, transpile to Daml, compile to `.dar`, deploy to Canton Sandbox, and execute the workflow via Ledger API
  - Performance benchmarks for transpilation speed and compilation pipeline latency

### Milestone 3: Vibe Coding Agent & Live Cockpit
- **Estimated Delivery:** Month 4 (4 weeks)
- **Focus:** LLM-powered natural language workflow generation, live Canton monitoring, and interactive simulation.
- **Deliverables / Value Metrics:**
  - Vibe Coding Agent with conversational sidebar:
    - Natural language to BPMN diagram generation with automatic party/lane assignment
    - Natural language to Daml code generation with Canton authorization constraints
    - Agentic build loop: auto-drafting, linting via `daml build`, and self-correction
    - `.cantonrules` context file support for project-level AI constraints
  - Live Canton Cockpit:
    - Active Contract Set (ACS) visualization as token overlays on BPMN diagram
    - Transaction inspection panel (Canton Transaction ID, parties, privacy scope)
    - Interactive simulation mode for deterministic workflow replay
  - Connection support for Canton Sandbox, DevNet, and MainNet Ledger APIs
  - Test suite for vibe agent accuracy: benchmark against 20 reference workflow descriptions, measuring correct party assignment, authorization validity, and compilable Daml output

### Milestone 4: Security, Documentation & Ecosystem Readiness
- **Estimated Delivery:** Month 5 (4 weeks)
- **Focus:** Security review, comprehensive documentation, ecosystem integration examples, and maintenance commitment.
- **Deliverables / Value Metrics:**
  - Independent security review of transpiler output (generated Daml contracts), vibe agent prompt injection resistance, and Ledger API integration — with published findings and remediation report
  - Comprehensive developer documentation: architecture guide, BPMN-to-Daml mapping reference, transpiler API documentation, vibe agent usage guide, and deployment guide
  - Integration examples demonstrating:
    - Trade finance workflow (multi-party letter of credit with regulatory oversight)
    - Supply chain tracking (cross-organization handoffs with selective disclosure)
    - Insurance claims processing (automated gateway logic with compliance observers)
    - Import of existing Camunda BPMN diagrams and annotation with Canton properties
  - Production deployment guide covering Canton MainNet considerations, operational requirements, and monitoring setup
  - Maintenance plan: 12-month commitment to issue triage (48-hour response SLA), security patches, Canton SDK compatibility updates, and LLM model updates
  - Developer workshop materials (slide deck, hands-on lab, sample workflows) for ecosystem education

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone
- Demonstrated functionality or operational readiness via DevNet deployment
- Documentation and knowledge transfer provided
- Alignment with stated value metrics

**Project-specific acceptance conditions:**

- Visual builder renders and edits valid BPMN 2.0 diagrams with Canton properties panel functional
- Transpiler generates compilable Daml code from annotated BPMN XML for all supported element types
- All generated Daml contracts compile and pass tests on current Canton SDK version
- Integration test suite achieves 85%+ coverage with all tests passing on Canton Sandbox
- One-click deploy workflow demonstrated end-to-end on Canton DevNet
- Vibe agent generates compilable Daml output for at least 80% of benchmark workflow descriptions without manual correction
- Live cockpit displays active contract state from a running Canton node
- Security review completed by a qualified independent reviewer with published report
- All code released under Apache 2.0 license in a public GitHub repository
- End-to-end demonstration: natural language description → BPMN diagram → Daml code → `.dar` compilation → Canton deployment → live cockpit monitoring

---

## Funding

**Total Funding Request:** 350,000 CC

### Payment Breakdown by Milestone
- **Milestone 1** — Specification & Daml-Flavored Modeler: **75,000 CC** upon committee acceptance
- **Milestone 2** — BPMN-to-Daml Transpiler & One-Click Deploy: **125,000 CC** upon committee acceptance
- **Milestone 3** — Vibe Coding Agent & Live Cockpit: **100,000 CC** upon committee acceptance
- **Milestone 4** — Security, Documentation & Ecosystem Readiness: **50,000 CC** upon final release and acceptance

### Volatility Stipulation

The project duration is **under 6 months** (5 months planned). Should the project timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility.

---

## Co-Marketing

Upon release, Stratos Lab will collaborate with the Canton Foundation on:

- **Announcement coordination:** Joint announcement of each milestone completion through Foundation and Stratos Lab channels.
- **Technical blog series:** Publication of technical deep-dives covering the BPMN-to-Daml transpilation architecture, vibe coding for decentralized workflows, and the "Decentralized BPMN Engine" concept — targeting enterprise architects, business analysts, and Canton developers.
- **Case study:** Detailed case study documenting how CantonFlow enables business analysts to build production-grade, cryptographically secure workflows without writing Daml code — demonstrating Canton's accessibility for institutional adoption.
- **Developer workshop:** Hosted workshop (virtual and/or in-person at a Canton ecosystem event) walking developers through designing, generating, deploying, and monitoring Canton workflows using CantonFlow.
- **Ecosystem promotion:** Presentation of CantonFlow at relevant Canton community calls, developer meetups, Camunda community events, and industry conferences. Targeted outreach to existing Camunda users in finance, insurance, and supply chain sectors.
- **Video demonstration:** Produced walkthrough video showing the full journey from natural language description to live Canton deployment, suitable for social media and conference presentations.

---

## Motivation

Canton is positioned as the institutional-grade blockchain — purpose-built for regulated finance with native privacy, deterministic execution, and institutional backing from Deutsche Börse, Goldman Sachs, and S&P Global. Yet the ecosystem faces a critical adoption bottleneck: **the gap between enterprise process design (BPMN) and decentralized execution (Daml) is too wide for most organizations to cross.**

This gap matters for four reasons:

1. **Accessibility crisis:** Daml's learning curve is the single largest barrier to Canton adoption. Business analysts who design institutional workflows cannot use Canton without specialized Daml developers — a scarce and expensive resource. CantonFlow eliminates this bottleneck by meeting enterprise users where they already are: BPMN.

2. **Market alignment:** Over 70% of Fortune 500 financial institutions use BPMN for process modeling. Camunda alone has 500+ enterprise customers. CantonFlow positions Canton as a direct upgrade path for these organizations — keep your visual modeling standard, gain privacy-preserving decentralized execution.

3. **Ecosystem differentiation:** No existing Canton tooling addresses visual workflow design, BPMN compatibility, or AI-assisted contract generation. CantonFlow fills a unique gap in the developer experience, complementing existing SDK and CLI tools with a visual-first approach that dramatically expands who can build on Canton.

4. **Vibe coding as adoption catalyst:** The integration of natural language workflow generation reduces the time from "idea" to "deployed Canton workflow" from weeks to minutes. A business analyst can describe a multi-party process in plain English and have production-grade, privacy-preserving Daml contracts running on Canton — without touching a semicolon.

---

## Rationale

**Why BPMN as the visual standard:**

BPMN 2.0 is the ISO-standard notation for business process modeling (ISO/IEC 19510:2013). It is taught in business schools, required by regulators for process documentation, and embedded in enterprise toolchains globally. Building on BPMN — rather than inventing a proprietary visual language — ensures immediate familiarity for the target audience and compatibility with existing enterprise modeling investments.

**Why bpmn-js as the rendering engine:**

bpmn-js is the open-source toolkit that powers Camunda Modeler. It is the most mature, extensible, and widely-adopted BPMN rendering library available. Building on bpmn-js provides full BPMN 2.0 compliance, a proven extension architecture for custom properties panels, and import/export compatibility with existing Camunda diagrams.

**Why the "Shadow Modeler" architecture:**

The BPMN XML acts as the source of truth for "Flow" (what happens next), while a Daml Metadata Layer (injected via custom XML namespaces) acts as the source of truth for "Permissions" (who is allowed to do what). This separation preserves BPMN compatibility while encoding Canton's authorization model — enabling round-trip editing between CantonFlow and standard BPMN tools.

**Why the State Machine Template pattern over per-task templates:**

Generating a separate Daml Template for each BPMN Task would produce excessive contract bloat and poor composability. The State Machine Template pattern — a generic state contract with a `Progress` choice validated against a process definition — produces leaner contracts, mirrors Camunda's token-based execution model, and simplifies the transpiler logic.

**Why vibe coding is not a gimmick:**

The hardest part of Daml development is reasoning about authorization — who signs, who controls, who observes at every state transition. An LLM trained on the BPMN-to-Daml mapping table can infer these relationships from natural language descriptions of business processes, dramatically reducing the cognitive overhead that makes Daml adoption difficult. The `.cantonrules` context file ensures AI-generated code respects Canton's decentralized trust model.

**Why Stratos Lab:**

Stratos Lab has demonstrated Canton-native engineering capability through five public repositories (wallet SDK, ledger viewer, MCP server, quickstart fork, and hackathon prototype), a hackathon win in the collateral-margin track, and a team combining institutional finance domain expertise with blockchain engineering and AI application development experience. This proposal extends proven Canton development capability into a new domain — developer tooling — that maximizes ecosystem impact.
