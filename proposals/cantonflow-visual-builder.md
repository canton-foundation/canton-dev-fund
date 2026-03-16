## Development Fund Proposal: CantonFlow — Visual BPMN Builder for Canton with Vibe Coding

**Author:** Stratos Lab — Dhonam Pemba, Kwang Wei Sim
**Status:** Draft
**Created:** 2026-03-08

---

## Abstract

Canton lacks a visual workflow tool that preserves party-level privacy and authorization. Daml's powerful privacy and authorization model requires developers to think about data ownership at every line of code, which creates a steep barrier for the business analysts and process architects who already design institutional workflows in BPMN. Meanwhile, BPMN (Business Process Model and Notation) is the standard process language used across finance, insurance, and supply chain, but existing BPMN engines like Camunda operate as centralized orchestrators that cannot deliver Canton's privacy, immutability, or multi-party trust guarantees.

CantonFlow bridges this gap with a deliberate **two-layer architecture**: (1) a **Camunda-compatible modeling surface** that imports/exports BPMN 2.0, preserves extension elements for round-trip compatibility, and delivers a familiar visual experience; and (2) a **Canton-native execution surface** where BPMN constructs compile into Daml templates/choices and off-ledger automation services, with runtime state observable through the Ledger API and optional Participant Query Store (PQS). This is explicitly *not* "Camunda on Canton" — it is a Camunda-compatible modeler with a Canton-native compiler and runtime.

Built on bpmn-js (the same engine powering Camunda Modeler), CantonFlow extends the standard with Canton-native properties — Signatories, Controllers, and Observers — mapped directly to BPMN Lanes and Tasks via BPMN extension elements (custom namespace), ensuring diagrams remain valid BPMN and can round-trip through other tools. A constrained LLM-powered "Vibe Agent" allows users to describe workflows in natural language and generate BPMN drafts and corresponding Daml code, with policy-driven validation against the Canton-BPMN Profile v1 (CBP-v1) ruleset and Canton's authorization model.

This proposal requests **350,000 CC** across four milestones over five months to deliver a focused Phase 1 release: the visual builder, BPMN-to-Daml transpiler, deployment path to Canton LocalNet/DevNet, constrained AI-assisted workflow drafting, and comprehensive documentation. Advanced runtime monitoring and enterprise-grade extensions are intentionally limited in Phase 1 so the grant remains realistic relative to budget. All deliverables will be released under the Apache 2.0 license as reusable ecosystem infrastructure.

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

Canton and Daml offer institutional-grade privacy, deterministic execution, and multi-party authorization, but Canton currently lacks a visual workflow tool that preserves those guarantees while remaining usable by non-Daml specialists. Today, building a multi-party workflow on Canton requires:

- Deep understanding of Daml's Create-Exercise (UTXO-like) model
- Manual reasoning about signatory, controller, and observer authorization at every state transition
- No visual tooling for designing, debugging, and operationalizing workflows

Meanwhile, the enterprise world designs processes in BPMN 2.0 using tools like Camunda. BPMN engines, however, are typically centralized orchestrators — a "God Object" that tells everyone what to do — fundamentally incompatible with Canton's decentralized choreography model where logic is embedded in contracts and validated by stakeholders.

CantonFlow resolves this by building a **Decentralized BPMN Engine** — a visual builder where business analysts design workflows in BPMN while the execution layer is secured by Daml on Canton. The direct ecosystem outcome is lower time-to-first-prototype for business analysts, solution architects, and engineers building multi-party workflows on Canton. The tool enforces Canton's trust model at design time, preventing users from accidentally creating centralized workflows.

**Target users:**

- **Business analyst / process designer:** Models processes visually in BPMN; expects a familiar Camunda-like palette, properties panel, and import/export.
- **Smart contract engineer:** Needs predictable compilation from BPMN + permissions metadata into Daml templates/choices; cares about upgradeability and correctness.
- **Integration / automation engineer:** Writes workers/bots that react to ledger events and external systems; wants strong observability and retry semantics.
- **Operator / compliance:** Needs audit trail, runtime monitoring, retention/pruning strategies, and secure deployment.

The intended outcomes are:

1. **Visual BPMN Builder** with Canton-native properties panel (Signatories, Controllers, Observers) built on the industry-standard bpmn-js toolkit.
2. **BPMN-to-Daml Transpiler** that converts annotated BPMN 2.0 XML into compilable Daml smart contracts, mapping Lanes to Parties, Tasks to Choices, Gateways to branching logic, and Sequence Flows to state transitions — following the Canton-BPMN Profile v1 (CBP-v1) specification.
3. **Vibe Coding Agent** powered by LLM integration that generates BPMN diagrams and Daml code from natural language descriptions, with automatic party assignment, authorization validation, and policy-driven self-correcting build loops.
4. **Live Canton Cockpit** that connects to the Canton Ledger API (gRPC and JSON) to visualize active contracts as tokens on the BPMN canvas, enabling runtime monitoring and transaction inspection in Phase 1.

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
- **Interactive simulation:** Deferred beyond the core Phase 1 grant scope except for minimal replay or demo support if achieved ahead of schedule.
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

**Reusable Open-Source Outputs**

- `packages/bpmn-profile/` is reusable by any Canton builder that wants BPMN validation or `canton:` extension parsing without adopting the full CantonFlow application
- `packages/transpiler/` is intended to be reusable as a library and service boundary for BPMN XML → Daml generation
- `packages/daml-runtime-lib/` is reusable independently of the UI for projects that want the generated workflow state and gateway patterns
- Example workflows, benchmark corpus, generated Daml examples, and tutorial assets will all be released under Apache 2.0 alongside the core codebase
- No proprietary dependency is required for the core builder, transpiler, validation, or LocalNet/DevNet deployment path; optional AI features may use third-party model APIs

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

### 3.1 Delivery and Scope Discipline

This proposal is intentionally structured as a **lean, founder-led Phase 1 build** rather than a full-featured workflow platform release. At the proposed funding level, the objective is to deliver the highest-leverage reusable ecosystem components first:

- BPMN modeler with Canton-native properties
- CBP-v1 profile and validation rules
- BPMN-to-Daml transpiler and runtime library
- LocalNet/DevNet deployment path
- Sample workflows, documentation, and onboarding assets

The following are included in **limited Phase 1 form** only:

- **AI drafting:** constrained natural-language workflow generation for a defined benchmark set, with policy validation and repair loops
- **Cockpit:** basic live state overlays and transaction inspection for LocalNet/DevNet demonstrations

The following are **explicitly deferred beyond Phase 1** unless achieved ahead of schedule:

- Full enterprise PQS analytics features
- Broad BPMN semantics beyond CBP-v1
- Full-featured simulation environment
- Large-scope external security audit beyond focused review of generated contracts and integration surfaces

### 4. Backward Compatibility

CantonFlow is entirely new tooling infrastructure. It introduces no modifications to existing Canton protocol components, smart contracts, or ecosystem tooling. Existing applications and workflows are unaffected.

The builder imports and exports standard BPMN 2.0 XML, maintaining compatibility with existing Camunda diagrams (which can be imported and annotated with Canton properties).

*No backward compatibility impact.*

---

## Current Status and Execution Readiness

This proposal extends existing Stratos Lab work rather than starting from zero. The current state is:

| Component | Existing Asset / Proof | What is Already Proven | What Remains in This Proposal |
|---|---|---|---|
| BPMN / visual workflow UI | `canton-canvas` prototype | Early proof of modeling surface and CantonFlow concept | Productionize builder UX, properties panel, and BPMN round-trip fidelity |
| Canton integration and ledger tooling | Canton LedgerView, Canton MCP Server, Quickstart fork | Familiarity with Ledger API access patterns, tooling ergonomics, and Canton developer workflows | Turn those capabilities into deploy, monitoring, and transpilation workflows inside CantonFlow |
| Workflow and domain prototyping | Hackathon prototype and PrivaMargin-related repos | Multi-party Canton-native workflow thinking in collateral / institutional flows | Generalize those patterns into reusable BPMN-to-Daml tooling |
| AI-assisted development workflows | Claude Skills Canton and internal agent experience | Experience constraining LLM workflows around structured developer tasks | Limit AI scope to bounded workflow drafting, validation, and repair loops |

This matters for feasibility: the requested funding is intended to convert these proven pieces into a coherent, open-source Phase 1 developer tool rather than fund a zero-to-one research effort.

---

## Milestones and Deliverables

### Milestone 1: Specification & Daml-Flavored Modeler
- **Estimated Delivery:** Month 1 (4 weeks)
- **Focus:** Technical specification, BPMN-to-Daml mapping formalization, and base visual builder with Canton properties panel.
- **Deliverables / Value Metrics:**
  - Technical specification document covering the CBP-v1 profile definition, canonical mapping rules, transpiler architecture, and ProcessState contract design
  - Architecture decision records documenting design choices for the transpiler strategy, state management pattern, gateway mapping approaches, and community vs enterprise mode packaging
  - bpmn-js-based visual builder (React application) that:
    - imports BPMN 2.0 XML
    - edits lanes, tasks, sequence flows, and supported gateways
    - exports valid BPMN XML with `canton:` extension elements preserved
    - exposes a custom Canton properties panel via bpmn-js-properties-panel + moddle extensions (Signatories, Controllers, Observers, Automation Designation, Template Fields, Variable Schema)
    - runs always-on validation for CBP-v1 authorization constraints
  - Public GitHub repository initialized with monorepo structure, CI/CD pipeline, contribution guidelines, and benchmark corpus folder
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
  - Reusable package boundaries documented for `packages/bpmn-profile`, `packages/transpiler`, and `packages/daml-runtime-lib`

### Milestone 3: Vibe Coding Agent & Live Cockpit
- **Estimated Delivery:** Month 4 (4 weeks)
- **Focus:** Constrained AI-assisted workflow drafting and a demonstration-grade live cockpit for LocalNet/DevNet.
- **Deliverables / Value Metrics:**
  - Vibe Coding Agent with conversational sidebar:
    - Natural language to BPMN draft generation for a defined benchmark set of reference workflows
    - Automatic lane/party assignment and Canton metadata suggestion subject to CBP-v1 validation
    - Agentic build loop: auto-drafting, linting via `daml build`, and bounded self-correction
    - `.cantonrules` context file support for project-level AI constraints
  - Phase 1 Live Canton Cockpit:
    - Active Contract Set (ACS) visualization as token overlays on BPMN diagram via Ledger API streaming subscriptions
    - Active node highlighting on LocalNet/DevNet reference environments
    - Transaction inspection panel with deep-link from diagram node to transaction/event evidence (Canton Transaction ID, offsets, parties, privacy scope)
    - Task readiness display for pending choices
  - Connection support for Canton LocalNet and DevNet Ledger APIs (gRPC and JSON)
  - Benchmark suite for vibe agent accuracy against 20 reference workflow descriptions, with committed scoring rubric measuring diagram validity, party assignment correctness, and compilable Daml output
  - Explicit documentation of deferred items: enterprise PQS analytics, broader BPMN semantics, and advanced simulation

### Milestone 4: Security, Documentation & Ecosystem Readiness
- **Estimated Delivery:** Month 5 (4 weeks)
- **Focus:** Focused security review, comprehensive documentation, ecosystem onboarding, and maintenance commitment.
- **Deliverables / Value Metrics:**
  - Focused external review of transpiler output (generated Daml contracts), AI prompt/input handling boundaries, and Ledger API integration surfaces — with published findings and remediation report sized to the Phase 1 budget
  - Comprehensive developer documentation: architecture guide, BPMN-to-Daml mapping reference, transpiler API documentation, vibe agent usage guide, and deployment guide
  - Integration examples demonstrating:
    - Trade finance workflow (multi-party letter of credit with regulatory oversight)
    - Supply chain tracking (cross-organization handoffs with selective disclosure)
    - Insurance claims processing (automated gateway logic with compliance observers)
    - Import of existing Camunda BPMN diagrams and annotation with Canton properties
  - Deployment guide covering Canton LocalNet/DevNet usage and MainNet readiness considerations
  - Maintenance plan: 12-month commitment to issue triage (48-hour response SLA), security patches, Canton SDK compatibility updates, and LLM prompt/config updates. **Post-grant sustainability:** Stratos Lab will self-fund ongoing maintenance and development beyond the grant timeline through consulting engagements and paid implementation services for enterprises adopting CantonFlow and other Canton-aligned solutions. The open-source tooling remains a public good; Stratos Lab's commercial sustainability comes from implementation services, not gating the tool itself
  - Ecosystem onboarding assets:
    - developer workshop materials (slide deck, hands-on lab, sample workflows)
    - quickstart tutorial for external developers
    - launch plan targeting Canton builders and BPMN-oriented enterprise architects
  - Adoption assets in repository:
    - at least 3 public reference workflows
    - at least 2 imported BPMN diagrams demonstrated end-to-end
    - benchmark corpus and scoring rubric used for AI evaluation

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
- Vibe agent generates compilable Daml output for at least 80% of the committed 20-workflow benchmark corpus without manual correction, using policy-driven CBP-v1 validation and the scoring rubric committed in the repository
- Live cockpit displays active contract state from a running Canton node in the reference LocalNet/DevNet setup, with active node highlighting visible during committee demonstration and target updates within 5 seconds under the documented reference test setup
- Focused external review completed by a qualified reviewer with published report and documented remediation of critical findings
- All code released under Apache 2.0 license in a public GitHub repository with monorepo structure
- End-to-end demonstration: natural language description → BPMN diagram → Daml code → `.dar` compilation → Canton deployment → live cockpit monitoring
- Time-to-first-ledger-backed workflow: from empty project to deployed DAR and running instance in < 30 minutes using templates
- Public benchmark corpus, sample workflows, and tutorial assets committed to the repository

---

## Funding

**Total Funding Request:** 350,000 CC

This proposal is intentionally priced as a **lean, founder-led build**. At a reference Canton Coin price of **$0.151743 USD per CC**, the total request of **350,000 CC** corresponds to approximately **$53,110 USD**. For a two-person team over five months, this equates to approximately **$26,555 per person total**, or **$5,311 per person per month** before infrastructure, LLM/API usage, taxes, and operating overhead.

The implication is explicit: this grant does **not** fund two full-time senior engineers at market rates plus a broad audit and enterprise-grade platform scope. Instead, Stratos Lab is committing to a founder-subsidized delivery model in which grant funds cover the core reusable ecosystem outputs, modest infrastructure, controlled AI/LLM usage, documentation, and a focused external review. Scope has therefore been prioritized around the builder, transpiler, deploy path, onboarding assets, and constrained AI/cockpit features appropriate to a Phase 1 release.

### Payment Breakdown by Milestone
- **Milestone 1** — Specification & Daml-Flavored Modeler: **75,000 CC** upon committee acceptance
- **Milestone 2** — BPMN-to-Daml Transpiler & One-Click Deploy: **125,000 CC** upon committee acceptance
- **Milestone 3** — Vibe Coding Agent & Live Cockpit: **100,000 CC** upon committee acceptance
- **Milestone 4** — Security, Documentation & Ecosystem Readiness: **50,000 CC** upon final release and acceptance

### Budget Justification

Using the same reference price of **$0.151743 USD per CC**, the proposal budget is approximately:

| Category | Approximate Cost (USD) | Notes |
|---|---:|---|
| Engineering labor | 42,000 | Founder-led, below-market delivery across product, frontend, transpiler, and Canton integration work |
| Infrastructure / CI / hosting | 4,000 | Repository hosting, CI runners, test environments, artifact storage, demo environments |
| LLM / AI API usage | 3,000 | Controlled usage for workflow drafting, validation loops, and benchmark evaluation |
| Documentation / workshops / examples | 2,000 | Tutorial production, sample workflow assets, workshop materials |
| Focused external review / contingency | 2,110 | Targeted review limited to: (1) generated Daml contract output correctness and authorization safety, (2) AI prompt/input handling boundaries to prevent injection or policy bypass, and (3) Ledger API integration surface authentication and data exposure. This is explicitly not a comprehensive platform security audit — a full audit is deferred to Phase 2 or a separate security-focused grant proposal |
| **Total** | **53,110** | Approximate at 350,000 CC |

This budget is sufficient for a focused Phase 1 release, but not for a fully productized enterprise platform. Accordingly, enterprise-only analytics features, broader BPMN semantics, and large-scope security work are deferred unless achieved ahead of schedule.

### Scope Prioritization Under Schedule Pressure

If delivery pressure requires trade-offs within a milestone, the priority order is: (1) transpiler correctness and CBP-v1 compliance, (2) visual builder and deployment path, (3) documentation and onboarding assets, (4) cockpit and AI agent polish. Core reusable infrastructure ships first; experiential features degrade gracefully. Any material scope adjustment will be communicated to the Committee before the affected milestone review.

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

**Phase 1 adoption targets:**

- At least **3** public reference workflows published in the repository and used in documentation
- At least **3** external developers complete the quickstart and deploy a sample workflow on LocalNet or DevNet
- At least **1** public workshop or walkthrough session delivered for the Canton ecosystem
- At least **2** imported BPMN diagrams from existing tooling demonstrated end-to-end through annotation, transpilation, and deployment

**Adoption funnel:**

- **Awareness:** announcement coordination, technical blog series, walkthrough video, and ecosystem/community presentations
- **Activation:** quickstart tutorial, sample workflows, and workshop materials that get external developers to first deployment
- **Proof:** imported BPMN diagrams, public benchmark corpus, and external developer completions documented in the repository or release notes

---

## Motivation

Canton is positioned as institutional-grade blockchain infrastructure for regulated, multi-party use cases, with native privacy and deterministic execution. Yet the ecosystem faces a critical adoption bottleneck: **the gap between enterprise process design (BPMN) and decentralized execution (Daml) is too wide for most organizations to cross.**

This gap matters for four reasons:

1. **Accessibility crisis:** Daml's learning curve is the single largest barrier to Canton adoption. Business analysts who design institutional workflows cannot use Canton without specialized Daml developers — a scarce and expensive resource. CantonFlow eliminates this bottleneck by meeting enterprise users where they already are: BPMN.

2. **Market alignment:** BPMN is already embedded in enterprise process design and workflow documentation. CantonFlow positions Canton as an upgrade path for teams that already think in BPMN, allowing them to retain a familiar modeling language while gaining privacy-preserving decentralized execution.

3. **Ecosystem differentiation:** No existing Canton tooling addresses visual workflow design, BPMN compatibility, or AI-assisted contract generation. CantonFlow fills a unique gap in the developer experience, complementing existing SDK and CLI tools with a visual-first approach that dramatically expands who can build on Canton.

4. **AI-assisted drafting as adoption catalyst:** Natural language workflow drafting can reduce the distance between business intent and a deployable Canton workflow, especially when constrained by CBP-v1 validation and repair loops. In Phase 1, this is scoped as a bounded accelerator for prototyping rather than an open-ended promise of fully automated production delivery.

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

**Why AI-assisted drafting is included in Phase 1:**

The hardest part of Daml development is reasoning about authorization — who signs, who controls, who observes at every state transition. An LLM trained on the BPMN-to-Daml mapping table can infer these relationships from natural language descriptions of business processes, dramatically reducing the cognitive overhead that makes Daml adoption difficult. The `.cantonrules` context file and CBP-v1 policy validation ensure AI-generated code is policy-driven — preventing "AI-generated diagrams" that cannot compile into correct authorization semantics. This aligns with Camunda's own product direction, which already cites AI-powered copilot capabilities.

**Why Canton is the right execution target:**

The core feasibility argument rests on three pillars: (1) BPMN is designed for a dual role — human comprehension and translation into software components; (2) Canton and Daml are explicitly about enforcing authorization/visibility at the contract level across organizational boundaries, with participants exposing standard Ledger APIs; (3) open-source toolchains exist for both the BPMN modeling surface and Canton/Daml runtime scaffolding. The go/no-go criterion is clear: proceed when workflows span multiple organizations where no single operator should be the ultimate trusted orchestrator, and you need shared state with privacy-preserving authorization for each step.

**Why Camunda-compatible BPMN — not a new visual language:**

CantonFlow deliberately builds on BPMN 2.0 and the Camunda modeling ecosystem rather than creating a proprietary drag-and-drop interface. This is a strategic choice, not a technical default. Enterprises in banking, insurance, and supply chain already have existing BPMN process libraries, trained analysts, and regulatory documentation in BPMN format. A proprietary visual language — however polished — requires organizations to re-learn, re-train, and re-document. CantonFlow instead positions Canton as a **drop-in execution upgrade** for workflows enterprises have already modeled: import an existing Camunda BPMN diagram, annotate it with Canton privacy properties, transpile to Daml, and deploy. This "plug-and-play" approach dramatically shortens the enterprise adoption path because CantonFlow meets organizations where they already are, rather than asking them to start over with a new tool. The Camunda ecosystem has millions of deployed process models across regulated industries — CantonFlow makes every one of them a potential Canton onboarding opportunity.

**Why Stratos Lab:**

Stratos Lab has demonstrated Canton-native engineering capability through nine public repositories (wallet SDK, ledger viewer, MCP server, quickstart fork, hackathon prototype, CantonFlow prototype, PrivaMargin reference stack, credit risk engine, and Claude Skills for Canton), a hackathon win in the collateral-margin track (Canton Catalyst/Construct), and a team combining institutional finance domain expertise with blockchain engineering and AI application development experience. This proposal extends proven Canton development capability into a new domain — developer tooling — that maximizes ecosystem impact.

**Team:**

- **Kwang Wei Sim** — CEO, Product & GTM Strategy ([LinkedIn](https://www.linkedin.com/in/kwangwsim) | [GitHub](https://github.com/adappterxyz))
  Leadership and go-to-market experience across sectors and markets. Active role in piloting structured product issuance under MAS Project Guardian at Marketnode. Former IT consulting lead at Haidilao.

- **Dhonam Pemba, PhD** — CTO, Risk Modelling / AI Lead ([LinkedIn](https://www.linkedin.com/in/dhonam-pemba/) | [GitHub](https://github.com/dpny518))
  Experienced founder/advisor of AI and blockchain startups with several exits. Former: Safety Net Connect, KidX, Kadho Inc. AI Link member. Leads CantonFlow's transpiler architecture, AI agent design, and Canton integration engineering.
