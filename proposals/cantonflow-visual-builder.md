## Development Fund Proposal: CantonFlow — Visual BPMN Builder for Canton with Vibe Coding

**Author:** Stratos Lab — Dhonam Pemba, Kwang Wei Sim
**Status:** Draft
**Created:** 2026-03-08

---

## Abstract

Enterprise workflow adoption on Canton faces a steep barrier: Daml's powerful privacy and authorization model requires developers to think about data ownership at every line of code, making it inaccessible to the business analysts and process architects who design institutional workflows. Meanwhile, BPMN (Business Process Model and Notation) is the global standard for enterprise process design — used across finance, insurance, and supply chain — but existing BPMN engines like Camunda operate as centralized orchestrators that cannot deliver Canton's privacy, immutability, or multi-party trust guarantees.

CantonFlow bridges this gap with a deliberate **two-layer architecture**: (1) a **Camunda-compatible modeling surface** that imports/exports BPMN 2.0, preserves extension elements for round-trip compatibility, and delivers a familiar visual experience; and (2) a **Canton-native execution surface** where BPMN constructs compile into Daml templates/choices and off-ledger automation services, with runtime state observable through the Ledger API and optional Participant Query Store (PQS). This is explicitly *not* "Camunda on Canton" — it is a Camunda-compatible modeler with a Canton-native compiler and runtime.

Built on bpmn-js (the same engine powering Camunda Modeler), CantonFlow extends the standard with Canton-native properties — Signatories, Controllers, and Observers — mapped directly to BPMN Lanes and Tasks via BPMN extension elements (custom namespace), ensuring diagrams remain valid BPMN and can round-trip through other tools. An integrated LLM-powered "Vibe Agent" allows users to describe workflows in natural language and generate both the BPMN diagram and corresponding Daml code simultaneously, with policy-driven validation against the Canton-BPMN Profile v1 (CBP-v1) ruleset and Canton's authorization model.

This proposal requests **350,000 CC** across four milestones over five months to deliver the visual builder, BPMN-to-Daml transpiler, vibe coding integration, live Canton cockpit, and comprehensive documentation. All deliverables will be released under the Apache 2.0 license as reusable ecosystem infrastructure.

| Evidence | Link |
|---|---|
| Hackathon Prototype (Canton Catalyst/Construct winner, collateral-margin track) | https://github.com/stratoslab/cpcv-hackathon |
| Canton Wallet SDK | https://github.com/stratoslab/stratos-wallet-sdk |
| Canton LedgerView | https://github.com/stratoslab/Canton-LedgerView |
| Canton MCP Server | https://github.com/stratoslab/Canton-MCP-Server |
| Canton Quickstart Fork | https://github.com/stratoslab/cn-quickstart |
| Claude Skills Canton | https://github.com/stratoslab/claude-skills-canton |
| PrivaMargin (Margin & Collateral Reference Stack) | https://github.com/stratoslab/privamargin |
| PrivaMargin CRE (Credit Risk Engine) | https://github.com/stratoslab/privamargin-cre |
| Canton Canvas (CantonFlow Prototype) | https://github.com/stratoslab/canton-canvas |
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

**Target users:**

- **Business analyst / process designer:** Models processes visually in BPMN; expects a familiar Camunda-like palette, properties panel, and import/export.
- **Smart contract engineer:** Needs predictable compilation from BPMN + permissions metadata into Daml templates/choices; cares about upgradeability and correctness.
- **Integration / automation engineer:** Writes workers/bots that react to ledger events and external systems; wants strong observability and retry semantics.
- **Operator / compliance:** Needs audit trail, runtime monitoring, retention/pruning strategies, and secure deployment.

The intended outcomes are:

1. **Visual BPMN Builder** with Canton-native properties panel (Signatories, Controllers, Observers) built on the industry-standard bpmn-js toolkit.
2. **BPMN-to-Daml Transpiler** that converts annotated BPMN 2.0 XML into compilable Daml smart contracts, mapping Lanes to Parties, Tasks to Choices, Gateways to branching logic, and Sequence Flows to state transitions — following the Canton-BPMN Profile v1 (CBP-v1) specification.
3. **Vibe Coding Agent** powered by LLM integration that generates BPMN diagrams and Daml code from natural language descriptions, with automatic party assignment, authorization validation, and policy-driven self-correcting build loops.
4. **Live Canton Cockpit** that connects to the Canton Ledger API (gRPC and JSON) and optional PQS to visualize active contracts as tokens on the BPMN canvas, enabling real-time monitoring and transaction inspection.

### 2. Implementation Mechanics

CantonFlow operates as a client-side web application with optional backend services for compilation, deployment, and AI integration.

**Canton-BPMN Profile v1 (CBP-v1)**

CantonFlow defines an explicit BPMN feature subset for v1 to ensure deterministic, correct compilation:

- **Required (v1):** Start event, end event, sequence flow, lanes/pools, user task, service task, exclusive gateway (XOR), parallel gateway (AND split/join).
- **Deferred (v2+):** Inclusive gateways (OR), event-based gateways, compensation/transactions, boundary timer escalation semantics beyond a standardized timeout pattern, ad-hoc subprocess, event subprocess.

This deliberate scoping avoids the complexity explosion of full BPMN semantics (inclusive joins, event subprocesses, cancellation) — constructs where even production engines differ in behavior.

**Source-of-Truth Model:** BPMN XML is the canonical representation of process structure. Daml-specific permissions/typing metadata is stored as BPMN extension elements (custom namespace `canton:`) so diagrams remain valid BPMN and can round-trip through other tools that ignore unknown extensions. This follows established Camunda ecosystem patterns for extension elements and custom namespaces.

**Visual Builder (Front-End)**

- **Canvas Engine:** bpmn-js — the same rendering and interaction engine that powers Camunda Modeler. Handles BPMN 2.0 diagram creation, editing, import/export natively. Requires no server backend and is designed for browser-based embedding and extension.
- **Custom Properties Panel:** Built on bpmn-js-properties-panel with moddle extensions. Replaces Camunda's execution-specific tabs with Canton/Daml properties:
  - *Signatories:* Who is legally bound by this step (maps to Daml `signatory`)
  - *Controllers:* Who has the right to execute this step (maps to Daml `controller`)
  - *Observers:* Who can see the data without acting on it (maps to Daml `observer`)
  - *Automation Designation:* Whether a bot completes this task (for service tasks)
  - *Template Fields:* Data inputs/outputs for each task (maps to Daml `with` parameters)
  - *Variable Schema:* Typed variable constraints for data flowing through the process
- **Daml Linting Layer:** Always-on validation that highlights tasks in red if they violate Canton's authorization model (e.g., missing Controller, cross-lane arrow without explicit permission handoff, gateway without defined decision authority). In a centralized engine, missing permission metadata may be survivable; on Canton it becomes a correctness issue — validation must be enforced upfront.
- **BPMN Element Mapping enforced in UI (CBP-v1 Required):**

| BPMN Element | Canton/Daml Meaning | Implementation |
|---|---|---|
| Pool/Lane | Party | Each Lane maps to a Canton Party ID + hosting participant reference |
| Start Event | Contract Creation | Initial `create` command for ProcessState contract |
| User Task | Choice on Contract | A `choice` exercised by the Lane's Party (Controller) |
| Service Task | Off-ledger Automation | Job contract + automation party worker via Ledger API |
| Sequence Flow | State Transition | Consuming old contract, creating new contract |
| Message Flow | Cross-Participant Action | Choice exercised by a party in a different Lane |
| Exclusive Gateway (XOR) | Multi-Choice Pattern | N mutually exclusive choices with `assert` guards; only one path exercisable per token |
| Parallel Gateway (AND) | Token Set Management | AND split creates multiple active node IDs; AND join requires all branches to arrive |
| Boundary Timer Event | Contract Expiry | Off-ledger time source + automation exercising timeout choice |
| End Event | Archiving | Consuming choice that does not create a follow-up contract |

**Deferred Elements (v2+):**

| BPMN Element | Canton/Daml Meaning | Implementation |
|---|---|---|
| Inclusive Gateway (OR) | Multiple Optional Choices | Optional choices with state management |
| Event-Based Gateway | Event Correlation | Contract-based event matching |
| Event Subprocess | Triggered Sub-workflow | Nested process state contracts |

**BPMN-to-Daml Transpiler (Core Engine)**

- Custom TypeScript module that parses annotated BPMN 2.0 XML and generates `.daml` template files.
- **Key architectural insight:** Compiles token-flow semantics into a series of contract states advanced via choice exercises. BPMN tokens "flow," whereas ledger systems evolve via transactions (create/exercise/archival). The transpiler bridges this by treating "token position" as a field on a `ProcessState` contract.

**CBP-v1 Canonical Mapping Rules (Normative):**

1. **Pools/Lanes → Parties:** Every lane maps to a party identifier (existing hosted party or party to be provisioned). Lane metadata includes party reference and hosting participant reference(s) for multi-participant environments.
2. **Process Instance → ProcessState Contract:** Each workflow instance is represented on-ledger by a single state carrier contract with `processDefinitionId`, `instanceId`, `currentNodeIds` (set), `variables` (typed record), `participants` (parties), and `historyRef`. Progress occurs via consuming choices that archive old state and create next state.
3. **User Task → Choice Controlled by Lane Controller:** A user task compiles into choices on `ProcessState` where `controller` is the party in the lane responsible for that task. Preconditions compile into asserts inside the choice.
4. **Service Task → External Automation Contract + Worker Pattern:** A service task compiles into either a choice exercised by a designated automation party, or a separate "Job" contract observed/controlled by an automation party. Off-ledger automation follows retriable-task structuring per Canton app design guidance.
5. **Exclusive Gateway (XOR) → Mutually Exclusive Choices with Guards:** XOR split compiles into N choices, each with outgoing condition asserts; only one path can be exercised per token instance. XOR merge compiles as pass-through.
6. **Parallel Gateway (AND) → Token Set Management:** AND split creates multiple active node IDs (or multiple child contracts). AND join requires all required branches to reach join before continuing, using `currentNodeIds` set semantics.
7. **Wait States and Timeouts:** A "wait" is represented by a contract that remains active until a party exercises a choice. Timeouts are implemented with off-ledger time sources and automation that exercises a timeout choice when wall-clock conditions are met.

**Compilation Pipeline:**
- Generated `.daml` files are compiled to `.dar` via Dpm/SDK tooling, with errors fed back to the visual builder for inline display.
- Policy validation enforces: every transition has a controller, all parties referenced exist, cross-lane transitions have explicit controller parties responsible for handoff.
- TypeScript types generated from DARs via Daml codegen for typed variable editors and safe contract payload construction in the builder UI.

**Vibe Coding Agent**

Camunda's own product direction already cites AI-powered copilots in modeling — users will expect conversational workflow design. CantonFlow's vibe agent is **policy-driven** (CBP-v1 rules + compilation feedback loops) to prevent "AI-generated diagrams" that cannot compile into correct authorization semantics.

- **Conversational sidebar** integrated into the builder where users describe workflows in natural language.
- **Example interaction:** User types "Create a trade finance workflow where the Bank must approve a letter of credit after the Buyer signs, but only if the amount is under $1M." The agent:
  1. Identifies parties (Bank, Buyer) and creates BPMN Lanes
  2. Creates User Tasks with appropriate Controllers
  3. Adds an Exclusive Gateway with amount-based condition
  4. Assigns Signatories and Observers based on the described relationships
  5. Generates the BPMN XML with Canton extension metadata and renders on canvas
- **Three-phase flow:**
  - *Prompt → Draft:* User describes process; the agent generates lanes, tasks, gateways, and initial permission assignments as extension metadata.
  - *Validate → Repair loop:* Compile Daml; if errors arise, the agent suggests diagram/metadata repairs (e.g., missing controller or party parameter). Self-corrects both BPMN model and Daml code until compilation succeeds.
  - *Simulate → Execute:* Token simulation for conceptual learning (clearly distinguished from real ledger execution semantics), then deploy to Canton for ledger-backed execution.
- **Context file (`.cantonrules`):** A project-level configuration file that teaches the AI agent Canton-specific constraints: "Every transition must have a controller. If a task is in the 'Regulator' lane, they must be an observer on all previous steps." Ensures AI-generated code never violates the decentralized trust model.

**Live Canton Cockpit**

- Connects to Canton Ledger API (gRPC and JSON) to subscribe to ledger updates and query the Active Contract Set (ACS).
- Uses bpmn-js overlays to render "Active Contracts" as glowing tokens on the BPMN diagram nodes, with active node highlighting updating within seconds from ledger events.
- **Transaction inspection:** Clicking a completed task deep-links from diagram node to transaction/event evidence — Canton Transaction ID, offsets, participating parties, and privacy scope.
- **Task readiness:** Shows which parties can currently act on pending choices.
- **Automation status:** Displays service task worker health and execution state.
- **Interactive simulation:** Deterministic replay of Daml contract state, allowing users to explore "what if" scenarios against the visual diagram (clearly distinguished from live ledger execution).
- **Enterprise mode (optional):** PQS (Participant Query Store) integration for SQL-based access to active and historical ledger state, enabling richer querying, historical inspection, and audit-grade event trails.

**Deployment Pipeline**

- One-click "Deploy to Canton" that compiles Daml to `.dar` and uploads to a target participant node via the Ledger API (package management services).
- Support for Canton LocalNet (local development), DevNet (testing), and MainNet deployment targets.
- Party and user provisioning via JSON Ledger API.
- Environment profiles (dev/test/prod) with TLS/JWT configuration.

**Security and Identity Architecture**

- Canton's cryptographic identity foundations — nodes and parties have unique identifiers with asymmetric cryptography for encryption and signing.
- OAuth2/JWT-based authentication for Ledger API access, with distinct admin API vs ledger API JWT expectations.
- Least-privilege automation identities: automation party(ies) only control specific "service task" choices.
- Audit-grade event trails: store transaction IDs, offsets, and process instance mapping.
- **Community mode** (local dev, minimal monitoring) vs **Enterprise mode** (PQS-based cockpit, hardened operations, enterprise artifacts) packaging, reflecting Canton's open-source community edition and enterprise variant availability.

**Monorepo Layout**

- `apps/modeler-web/` — BPMN canvas, properties panel, vibe copilot UI, import/export
- `apps/builder-api/` — Project storage, validation, build/deploy orchestration, auth profiles
- `packages/bpmn-profile/` — CBP-v1 schema + validators + canonical mapping library
- `packages/transpiler/` — BPMN XML → intermediate representation (IR) → Daml code generator
- `packages/daml-runtime-lib/` — Reusable Daml templates for workflow state, gateways, job patterns
- `apps/automation-runner/` — Ledger subscriber + worker execution engine (service tasks, timers)
- `apps/monitoring/` — Cockpit overlays using ledger queries/streams and optional PQS integration
- `infra/` — LocalNet/DevNet compose/helm configs, JWT/TLS configs

### 3. Architectural Alignment

CantonFlow reinforces Canton's core architectural principles while expanding ecosystem accessibility:

- **Sub-transaction privacy:** The builder enforces Canton's privacy model at design time. Cross-lane interactions require explicit permission handoffs. The properties panel makes Signatory/Controller/Observer assignment a first-class visual concept, ensuring that privacy boundaries are defined before code generation — not as an afterthought.
- **Daml smart contracts:** All generated business logic is expressed in Daml, ensuring deterministic execution, formal verifiability, and composability with other Daml applications on Canton. Generated contracts follow Daml best practices and the ProcessState contract pattern with consuming choices for state advancement.
- **Canton Ledger API native:** CantonFlow targets Canton's standardized participant-facing Ledger API (gRPC and JSON), plus identity/authn primitives (JWT, TLS), ensuring portability across Canton deployments. The admin API is used optionally for Canton-specific operational tasks.
- **Global Synchronizer compatibility:** Generated contracts are designed for deployment on Canton's Global Synchronizer, enabling cross-domain workflow execution across participating nodes.
- **No protocol modifications:** CantonFlow operates entirely at the application and tooling layer. It introduces no changes to Canton's protocol, consensus mechanism, or synchronization infrastructure.
- **Ecosystem composability:** Generated Daml contracts expose well-defined interfaces. Workflows designed in CantonFlow can integrate with existing Canton applications, and existing `.daml` files can be imported into the builder's data object library. TypeScript types generated from DARs via Daml codegen enable typed integration.
- **Decentralization by design:** The builder's linting layer prevents the "Centralization Trap" — ensuring every arrow crossing lanes represents an explicit permission handoff, enforcing Canton's choreography model over Camunda's orchestration model. Canton is explicitly positioned around enforcing visibility/authorization rules defined by Daml contracts while maintaining high privacy, even across organizations and adversarial environments.

**Non-goals (explicit scoping):**

- Not a full replacement for Camunda's execution runtime, connectors, or operational stack (e.g., complete semantics parity with Zeebe job workers or Camunda's end-to-end orchestration environment).
- Not "execute arbitrary BPMN" — BPMN formal semantics are broad and include complex corner cases; even engines differ in supported subsets. CBP-v1 deliberately narrows scope for deterministic compilation.
- Not a single-organization internal orchestration tool — CantonFlow is most valuable when workflows span multiple organizations where no single operator should be the ultimate trusted orchestrator.

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
  - Technical specification document covering the CBP-v1 profile definition, canonical mapping rules, transpiler architecture, and ProcessState contract design
  - Architecture decision records documenting design choices for the transpiler strategy, state management pattern, gateway mapping approaches, and community vs enterprise mode packaging
  - Functional bpmn-js-based visual builder (React application) with:
    - Standard BPMN 2.0 diagram creation and editing
    - Custom Canton properties panel via bpmn-js-properties-panel + moddle extensions (Signatories, Controllers, Observers, Automation Designation, Template Fields, Variable Schema)
    - Always-on Daml linting layer that validates CBP-v1 authorization constraints in real-time
    - BPMN XML import/export with Canton metadata preserved via `canton:` custom XML namespace extension elements — round-trip compatible with Camunda-authored diagrams
  - Public GitHub repository initialized with monorepo structure, CI/CD pipeline, and contribution guidelines
  - Test framework design with scenario definitions for transpiler validation
  - Internal API surface definition (Projects, Validation, Build, Deploy, Run, Monitor endpoints)

### Milestone 2: BPMN-to-Daml Transpiler & One-Click Deploy
- **Estimated Delivery:** Month 2–3 (8 weeks)
- **Focus:** Core transpiler engine, Daml code generation, compilation pipeline, and deployment to Canton.
- **Deliverables / Value Metrics:**
  - BPMN-to-Daml transpiler implementing all 7 CBP-v1 canonical mapping rules: Pools/Lanes → Parties, Process Instance → ProcessState contract, User Tasks → lane-controlled choices, Service Tasks → automation contracts + worker pattern, XOR Gateways → mutually exclusive guarded choices, AND Gateways → token set management, Wait States/Timeouts → off-ledger automation
  - ProcessState contract pattern implementation with consuming choices for state advancement
  - Compilation pipeline integrating Dpm/SDK tooling with error feedback displayed inline on the visual canvas, plus policy validation (controller coverage, party existence, cross-lane handoff authorization)
  - TypeScript type generation from DARs via Daml codegen for typed builder UI integration
  - One-click "Deploy to Canton" targeting Canton LocalNet and DevNet, with party/user provisioning via JSON Ledger API
  - Integration test suite with 85%+ code coverage on the transpiler, validating correct Daml generation for each CBP-v1 element type
  - End-to-end demonstration: design a multi-party workflow in the visual builder, transpile to Daml, compile to `.dar`, deploy to Canton LocalNet, and execute the workflow via Ledger API
  - Performance benchmarks for transpilation speed and compilation pipeline latency
  - Model round-trip validation: import a BPMN created in Camunda tooling, preserve extension elements, enrich with Daml metadata, export without corruption

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
    - Active Contract Set (ACS) visualization as token overlays on BPMN diagram via Ledger API streaming subscriptions
    - Active node highlighting updates within seconds from ledger events
    - Task readiness display (which parties can act) and automation status
    - Transaction inspection panel with deep-link from diagram node to transaction/event evidence (Canton Transaction ID, offsets, parties, privacy scope)
    - Interactive simulation mode for deterministic workflow replay (clearly distinguished from live ledger execution)
  - Connection support for Canton LocalNet, DevNet, and MainNet Ledger APIs (gRPC and JSON)
  - Optional PQS integration for enterprise-mode historical querying
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

- Visual builder renders and edits valid BPMN 2.0 diagrams with Canton properties panel functional (Signatories, Controllers, Observers, Automation Designation, Template Fields, Variable Schema)
- BPMN XML round-trip: import Camunda-authored BPMN, preserve extension elements, enrich with Canton metadata, export without corruption
- Transpiler implements all 7 CBP-v1 canonical mapping rules and generates compilable Daml code from annotated BPMN XML
- A BPMN model passes CBP-v1 validation iff: every task/gateway has necessary party/controller metadata, every cross-lane transition has explicit controller party for handoff, and the transpiler produces a DAR that builds successfully
- All generated Daml contracts compile and pass tests on current Canton SDK version
- Integration test suite achieves 85%+ coverage with all tests passing on Canton LocalNet
- One-click deploy workflow demonstrated end-to-end on Canton DevNet with party provisioning via JSON Ledger API
- Vibe agent generates compilable Daml output for at least 80% of benchmark workflow descriptions without manual correction, using policy-driven CBP-v1 validation
- Live cockpit displays active contract state from a running Canton node with active node highlighting updating within seconds from ledger events
- Security review completed by a qualified independent reviewer with published report
- All code released under Apache 2.0 license in a public GitHub repository with monorepo structure
- End-to-end demonstration: natural language description → BPMN diagram → Daml code → `.dar` compilation → Canton deployment → live cockpit monitoring
- Time-to-first-ledger-backed workflow: from empty project to deployed DAR and running instance in < 30 minutes using templates

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

The BPMN XML acts as the source of truth for "Flow" (what happens next), while a Daml Metadata Layer (stored as BPMN extension elements in a custom `canton:` namespace) acts as the source of truth for "Permissions" (who is allowed to do what). This separation preserves BPMN compatibility while encoding Canton's authorization model — enabling round-trip editing between CantonFlow and standard BPMN tools. Unknown extension elements are preserved during import/export, maintaining compatibility with Camunda-authored diagrams that use their own extension namespaces.

**Why the ProcessState contract pattern over per-task templates:**

Generating a separate Daml Template for each BPMN Task would produce excessive contract bloat and poor composability. The ProcessState contract pattern — a state carrier contract with consuming choices that archive old state and create next state — bridges the semantic impedance mismatch between token-based BPMN execution and contract/choice-based ledger evolution. It produces leaner contracts, mirrors Camunda's token-based execution model, and simplifies the transpiler logic.

**Why CBP-v1 scoping is essential:**

BPMN formal semantics are broad and include complex corner cases (inclusive joins, event subprocesses, cancellation). Even production engines differ in supported subsets and behavior. Attempting full BPMN semantics parity would be a multi-year effort that fights fundamental mismatches between token-based orchestration and contract/choice-based ledger execution. CBP-v1 deliberately narrows scope to a practical, deterministically compilable subset that delivers immediate value.

**Why vibe coding is not a gimmick:**

The hardest part of Daml development is reasoning about authorization — who signs, who controls, who observes at every state transition. An LLM trained on the BPMN-to-Daml mapping table can infer these relationships from natural language descriptions of business processes, dramatically reducing the cognitive overhead that makes Daml adoption difficult. The `.cantonrules` context file and CBP-v1 policy validation ensure AI-generated code is policy-driven — preventing "AI-generated diagrams" that cannot compile into correct authorization semantics. This aligns with Camunda's own product direction, which already cites AI-powered copilot capabilities.

**Why Canton is the right execution target:**

The core feasibility argument rests on three pillars: (1) BPMN is designed for a dual role — human comprehension and translation into software components; (2) Canton and Daml are explicitly about enforcing authorization/visibility at the contract level across organizational boundaries, with participants exposing standard Ledger APIs; (3) open-source toolchains exist for both the BPMN modeling surface and Canton/Daml runtime scaffolding. The go/no-go criterion is clear: proceed when workflows span multiple organizations where no single operator should be the ultimate trusted orchestrator, and you need shared state with privacy-preserving authorization for each step.

**Why Stratos Lab:**

Stratos Lab has demonstrated Canton-native engineering capability through five public repositories (wallet SDK, ledger viewer, MCP server, quickstart fork, and hackathon prototype), a hackathon win in the collateral-margin track, and a team combining institutional finance domain expertise with blockchain engineering and AI application development experience. This proposal extends proven Canton development capability into a new domain — developer tooling — that maximizes ecosystem impact.
