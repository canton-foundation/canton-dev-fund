# CantonTrace

## Development Fund Proposal

**Author:** Mert Köklü

**Status:** Submitted  

**Created:** 2026/04/10

---

## Abstract

CantonTrace is a web-based debugging and security analysis platform for Canton Network and Daml smart contracts. It delivers capabilities absent from the Canton ecosystem: expression-level execution tracing through an instrumented Daml-LF interpreter, dual-path transaction simulation, automated smart contract static analysis, Daml Script step-through debugging, performance profiling, structured error decoding, real-time event monitoring, contract lifecycle tracking, privacy visualization, and cross-transaction workflow reconstruction. All of these operate against real Canton ledger state.

The core technical innovation is a minimal fork of the open-source Daml-LF engine that exposes the Speedy machine's evaluation state at every reduction step. The Speedy machine is Canton's internal bytecode interpreter, and no other blockchain ecosystem offers this level of execution visibility. The platform connects to participant nodes as a standard Ledger API v2 client via gRPC Server Reflection, which dynamically discovers available API services at connect time. It respects Canton's sub-transaction privacy model, where each party sees only its entitled portion of a transaction, as well as offset locality and pruning boundaries.

Canton's developer tooling has a well-documented gap. Navigator, the previous web-based contract browser, was removed in Daml 3.0 with no replacement. Daml Shell is CLI-only and Enterprise-only. The five existing network explorers cannot access private contract data.

A functional prototype is available for reviewer evaluation, demonstrating the platform's core architecture, Canton gRPC connectivity, and a subset of the described features. The prototype comprises approximately 45,800 lines of code across the three services, demonstrating technical feasibility at scale. 
- Source code: [github.com/justmert/cantontrace](https://github.com/justmert/cantontrace)
- Live instance: [cantontrace.com](https://cantontrace.com)
- Video walkthrough: [youtube.com/watch?v=xjXGmoFw7xA](https://www.youtube.com/watch?v=xjXGmoFw7xA)

---

## Specification

### 1. Objective

Canton Network processes over 15 million transactions monthly and secures trillions of dollars in tokenized real-world assets through production deployments at DTCC, Broadridge, Goldman Sachs, HSBC, and BNP Paribas. Despite this institutional scale, developers lack fundamental debugging tools:

- **No execution visibility.** Failed commands produce only opaque gRPC error codes. The `debug` function reveals only the last source location, and full stacktraces "could violate subtransaction privacy quite easily."
- **No transaction simulation.** No preflight check exists to preview ledger effects, estimate costs, or validate authorization before committing a transaction.
- **No contention diagnosis.** UTXO contention, where concurrent transactions race to consume the same contract, is the #1 production issue. Diagnosing it requires manually parsing log files across multiple participants. Canton's troubleshooting guide documents this forensic process as the state of the art.
- **No visual contract inspection.** Since Navigator's removal, there is no web-based way to browse active contracts or trace contract lifecycles.
- **No privacy debugging.** No tool visualizes disclosure boundaries or compares what different parties can see in the same transaction.
- **No static security analysis.** Vulnerability patterns such as contention-prone designs, authorization gaps, and unbounded fetch chains are discovered only at runtime.

[The 2026 Canton Developer Experience Survey](https://forum.canton.network/t/canton-network-developer-experience-and-tooling-survey-analysis-2026/8412), covering 41 active developers, quantifies the urgency: 80% joined within 12 months, 71% come from Ethereum backgrounds expecting Tenderly-grade tooling, and visual debugging was the top-requested capability.

CantonTrace addresses all of these gaps in a unified platform, directly supporting the Protocol Development Fund's mandate of "developer tools that make it easier to build, test, and operate on Canton."

### 2. Implementation Mechanics

#### Architecture

CantonTrace is a three-service stack following Canton's Architecture 3.1, the "App Provider Operates Backend" pattern:

- **Frontend.** React 18 / TypeScript web application. Uses Monaco Editor, a VS Code-based code editor component, for Daml source display. Uses ReactFlow for interactive transaction tree graphs and Recharts for profiling charts. Styled with Tailwind CSS v4 and shadcn/ui components. Routing and data fetching via TanStack Router/Query, client state via Zustand.
- **Backend Server.** Node.js / Fastify 5 server that bridges the frontend to Canton's gRPC layer via `@grpc/grpc-js` with Server Reflection. Rather than depending on static `.proto` definition files, Server Reflection dynamically discovers available API services from the running participant. Beyond request translation, the server handles OAuth 2.0/JWT authentication, Redis caching, WebSocket streaming, sandbox lifecycle management, and maintains the PostgreSQL-backed error knowledge base. Wraps all 11 Ledger API v2 services.
- **Engine Service.** Scala 2.13 / JVM service wrapping Daml-LF Engine 3.4.11 with Akka HTTP. Provides the instrumented execution tracing core, DALF parsing (DALF is Canton's compiled Daml bytecode format), Daml-LF decompilation, offline simulation, Script tracing, profiling, and static analysis. This service runs on the JVM because the Daml-LF engine is a Scala library.

Infrastructure: PostgreSQL 16 for the error knowledge base and DAR source storage. A DAR, or Daml Archive, is the deployment package containing compiled bytecode and optionally source files. Redis 7 provides caching. Canton sandboxes are provisioned via the `dpm sandbox` CLI tool.

#### CantonTrace MVP

| | |
|---|---|
| ![Dashboard](https://raw.githubusercontent.com/justmert/cantontrace/main/img/dashboard.png) | ![Contracts](https://raw.githubusercontent.com/justmert/cantontrace/main/img/contracts.png) |
| ![Templates](https://raw.githubusercontent.com/justmert/cantontrace/main/img/templates.png) | ![Transactions](https://raw.githubusercontent.com/justmert/cantontrace/main/img/transactions.png) |
| ![Events](https://raw.githubusercontent.com/justmert/cantontrace/main/img/events.png) | ![Simulate](https://raw.githubusercontent.com/justmert/cantontrace/main/img/simulate.png) |
| ![Trace](https://raw.githubusercontent.com/justmert/cantontrace/main/img/trace.png) | ![Sandbox](https://raw.githubusercontent.com/justmert/cantontrace/main/img/sandbox.png) |

#### Deployment Model

CantonTrace supports two deployment modes. In **self-hosted mode**, developers run the full three-service stack on their own infrastructure using a single `docker compose up` command. No manual service configuration, dependency installation, or build step is required beyond having Docker installed. This mode is designed for enterprise teams with data residency requirements or air-gapped environments, as all data stays on their own machines. In **hosted mode**, CantonTrace is operated as a managed web service at [cantontrace.com](http://cantontrace.com). Developers open the platform in their browser, create a sandbox or connect to their participant node, and start debugging immediately with no local setup at all. Both modes deliver the identical feature set and connect to Canton participant nodes the same way.

#### Canton Integration

The platform connects to participant nodes via 11 gRPC services covering the full Ledger API v2 surface: version discovery, ledger state queries, transaction streaming, command submission, command completion tracking, interactive simulation, event queries, package management, party management, user management, and pruning boundary queries.

At connection time, a six-step bootstrap sequence runs to discover the participant's capabilities, determine the pruning boundary (how far back historical data is available, since Canton supports GDPR-compliant deletion of old data), capture the current ledger position, enumerate deployed smart contract packages, and resolve the authenticated user's party-level permissions.

The platform enforces Canton 3.5 protocol constraints throughout:

- Every Active Contract Set (ACS) query includes the mandatory `active_at_offset` parameter. This is a required field in Canton 3.5; omitting it causes protocol-level failure.
- Template and choice identifiers use the package-name reference format. The older package-id format is deprecated.
- The `EventQueryService` is handled correctly. It returns wrapper messages for contract creation and archival but does not return exercise event data. Exercise details are obtained by fetching the full transaction tree separately.
- All four update types are handled: standard transactions, cross-synchronizer reassignments, topology changes, and offset checkpoints.
- Transaction shape semantics are respected. `LEDGER_EFFECTS` returns all events a party is informed of, including exercises, while `ACS_DELTA` returns only contract creation and archival events.
- Offsets, which are ledger position markers, are used only as cursors within a single participant's event stream and never compared across participants. Cross-feature correlation uses the globally unique `update_id`.
- Error matching uses machine-readable error codes exclusively, never the human-readable message text, which changes across releases.

#### Engine Instrumentation

The Daml-LF Speedy machine is Canton's internal bytecode interpreter. It is a CEK-style abstract machine that evaluates Daml expressions through discrete, stepwise reductions. CantonTrace's modification exploits the engine's existing `ResultInterruption` mechanism, a cooperative multitasking feature that allows the engine to yield control periodically, by setting `iterationsBetweenInterruptions = 1`. This pauses the machine after every single reduction step.

At each pause, the machine's public accessor methods expose three categories of data: the source location in the original Daml code via `getLastLocation` (providing file, line, and column), the expression currently being evaluated via `currentControl`, and all variable values in scope via `currentEnv`, `currentFrame`, and `currentActuals`.

The published engine's `ResultInterruption` carries only a resume callback, with no reference to the machine's state. The modification extends it with a `MachineSnapshot` that captures the full inspectable state. The modified files, `Result.scala`, `Engine.scala`, and `Machine.scala`, are deployed via classpath shadowing, which places them ahead of the published JAR on the JVM classpath so they take precedence. All other engine internals remain unmodified.

To make the raw trace data useful, the platform applies intelligent step grouping that collapses raw machine steps (200–2000 per command) into developer-meaningful operations at three verbosity levels: Daml-level with ~10–30 grouped steps matching source-level constructs, Expression-level with ~50–200 individual interpreter steps, and Raw with every machine reduction.

#### Authentication

**Sandbox (zero friction):** The platform provisions Canton Sandboxes with authentication disabled via `dpm sandbox`. No configuration is needed. The developer uploads a DAR and starts debugging immediately.

**Production (OAuth 2.0):** The developer authenticates via their organization's identity provider. The platform uses short-lived JWTs for all Ledger API calls, inheriting exactly the user's Canton permissions. `CanActAs` grants permission to submit commands on behalf of a party, while `CanReadAs` grants permission to read data visible to a party. The platform never submits real transactions. The simulator uses `PrepareSubmission`, which validates a command and returns what would happen, but never calls `ExecuteSubmission`.

#### Deliverables

CantonTrace consists of 13 deliverables spanning debugging, analysis, monitoring, and infrastructure:

**1. Expression-Level Debugger.** Three-panel UI. The Code Panel uses Monaco Editor to show Daml source code or decompiled bytecode representation, with the current execution line highlighted and variable values annotated inline. The Steps Panel displays sequential execution steps with navigation controls: forward, back, run to error, run to contract fetch, and run to end. The Context Panel shows active contracts in scope, authorization state with required vs provided parties, the growing transaction tree, and profiler output. Three verbosity levels are available. The debugger supports `ensure` clause debugging (preconditions on contract creation) and authorization failure analysis with exact variable values at the point of failure.

**2. Transaction Simulator.** Two execution paths for dry-running commands without committing to the ledger. Path A (Online) calls `PrepareSubmission` against the live participant for exact behavior prediction with cost estimation. Path B (Offline) fetches the current contract state and packages from Canton, then executes locally via the engine service. Path B is the only option for time-travel simulation, which replays commands against historical ledger state, and it requires only read permissions. The simulator includes a command builder with dynamic argument forms and a what-if panel for parameter modification and side-by-side comparison.

**3. Error Debugger.** Implements Canton's complete 11-category error taxonomy with structured parsing of gRPC error metadata, including error codes, correlation IDs, retry delays, and identifiers for missing resources. A PostgreSQL-backed knowledge base stores 31+ individual error codes, each with a human-readable explanation, common causes, and suggested fixes. For ABORTED errors caused by contention, the debugger reconstructs a timeline showing the exact race condition: "Your transaction tried to consume contract X at T2. Transaction Y consumed it at T1."

**4. Transaction Explorer.** Interactive tree visualization of any transaction fetched by its globally unique update ID. Four analysis views: Tree shows an interactive graph with decoded payloads and party information. State Diff shows contracts consumed as inputs versus contracts created as outputs. Privacy provides a per-party visibility matrix showing which parties see which events. Workflow enables cross-transaction correlation via W3C Trace Context headers, contract chain following, and workflow ID grouping.

**5. Contract Lifecycle Tracker.** Full history of any contract from creation through choice exercises to archival. Uses Canton's event query service for creation and archival bookends, enriched with full transaction lookups for exercise details. Displays a visual timeline with pruning boundary awareness and divulged contract detection. Divulged contracts are contracts shared out-of-band whose archival may not be communicated back to the receiving party.

**6. ACS Inspector.** Web-based browser for the Active Contract Set, which is the collection of all currently live contracts on the ledger. Supports server-side filtering by template and party, fully decoded payloads, and offset-based time travel to view historical snapshots with pruning boundary enforcement.

**7. Template Explorer.** Auto-generated interactive documentation for all deployed Daml packages. Parses compiled DALF archives to extract template metadata. Five tabs per template: Fields with types, Choices with parameters and return types and controllers, Key with the lookup key definition if present, Source showing actual `.daml` source from the DAR or decompiled bytecode representation, and Security showing static analysis findings from the Static Analyzer.

**8. Event Stream Monitor.** Real-time ledger event streaming via WebSocket, handling all four Canton update types. Three tabs: Stream provides a live event feed with filtering, pause/resume, auto-reconnect with exponential backoff, and offset-based recovery on reconnection. Errors tracks failed commands with error category badges and knowledge base lookup. Reassignments tracks cross-synchronizer contract transfers, pairing assignment and unassignment events by their shared reassignment ID.

**9. Sandbox Manager.** Create, connect, reset, and delete Canton Sandbox instances from the web UI. DAR upload with automatic source file extraction for the debugger's code panel. Party allocation.

**10. Daml Script Trace Debugger.** Daml Scripts are the primary testing tool in the Daml ecosystem. They are multi-step programs that allocate parties, create contracts, exercise choices, and assert results. This debugger wraps the Script runner at two integration points: script-level action interception captures each allocate/submit/query action with inputs and outputs, and engine-level submit interception substitutes the forked engine from the Expression-Level Debugger to capture every execution step within each submit block. The debugger includes a Script Timeline showing each action with its result, a Variable Inspector enriching opaque contract IDs with decoded payloads, Ledger State Snapshots with visual diff between steps, engine drill-down into any submit block, and `submitMustFail` validation that verifies negative tests fail for the right reason.

**11. Performance Profiler.** Reads the Speedy machine's built-in profiling data, which consists of function-level timing events with nanosecond precision, through the `MachineSnapshot`. Also captures per-step wall-clock timing at each interpreter pause. Outputs include an interactive flame chart in the standard speedscope format with click-through to source locations, a hotspot table ranked by step count and wall-clock time, a per-choice cost breakdown showing steps, time, and contracts fetched or created for each choice invocation, and a step distribution by category. No Canton Enterprise Edition is required.

**12. Static Analyzer.** Eight detection rules implemented as pattern matching on the compiled Daml-LF expression tree, without executing code or connecting to a ledger. Rule 1, Unguarded Consuming Choice, detects consuming choices with no parameter validation in their body. Rule 2, Contention-Prone Design, flags templates where multiple distinct parties can exercise consuming choices on the same contract. Rule 3, Authorization Gap, identifies choice controllers that reference a party field not in the signatory set. Rule 4, Missing Observer in Disclosure, finds choices that fetch a contract the acting party cannot see without explicit disclosure. Rule 5, Unbounded Fetch Chain, catches contract fetches inside loops that risk timeout. Rule 6, Package Upgrade Incompatibility, detects breaking changes between package versions at Critical severity. Rule 7, Contract Key Uniqueness Risk, flags cases where the key maintainer differs from the signatory, enabling conflicting keys. Rule 8, Missing Signatory Exit Path, identifies signatories that control no consuming choice and cannot unilaterally leave the contract. Reports are integrated into the Template Explorer's Security tab, a standalone Analyzer page, and the DAR upload flow. Each rule is an independent function, making the engine extensible.

**13. Programmatic REST API & CI/CD.** OpenAPI-documented REST API wrapping all platform capabilities. A CI/CD pipeline endpoint provisions a temporary sandbox, uploads a DAR, runs tests, collects results including traces, snapshots, and error reports, then tears down. Example GitHub Actions and GitLab CI workflow configurations are included.

### 3. Architectural Alignment

CantonTrace operates as a read-only Ledger API v2 client, inheriting the user's exact permissions via JWT. Every feature respects Canton's sub-transaction privacy. Hidden subtrees are rendered as "not visible to your parties," never "not present." Offsets are used only as single-participant cursors. Pruning boundaries are checked before all historical queries.

The platform directly addresses the Protocol Development Fund's scope as defined in [CIP-0082](https://github.com/canton-foundation/cips/blob/main/cip-0082/cip-0082.md): developer tooling, security analysis, reference implementations, and critical infrastructure. All deliverables are released as an open-source public good under Apache 2.0.

The engine fork leverages stable, documented APIs. `ResultInterruption` is used by Canton's own runtime for cooperative multitasking, and the accessor methods (`getLastLocation`, `currentControl`, `currentEnv`) are the same methods used by the engine's own error reporting and profiling. These interfaces have remained stable across versions.

### 4. Backward Compatibility

No backward compatibility impact. CantonTrace connects to existing participant nodes as a read-only client. It modifies no Canton infrastructure and requires no changes to deployed contracts. The forked engine runs entirely on the platform's own backend. gRPC Server Reflection ensures version compatibility without static proto files.

---

## Milestones and Deliverables

### Milestone 1: Foundation — Platform Infrastructure, ACS Inspector & Template Explorer

- **Estimated Delivery:** Week 4
- **Focus:** Three-service architecture, gRPC connectivity via Server Reflection, foundational read-only features.
- **Deliverables / Value Metrics:**
  - Three-service stack containerized with Docker Compose
  - gRPC Server Reflection client with dynamic service discovery and the protobufjs monkey-patch for Canton's `constructor` field name collision
  - Six-step connection bootstrap sequence
  - **Deliverable 6, ACS Inspector:** Browse active contracts with decoded payloads, server-side filtering, offset-based time travel with pruning awareness
  - **Deliverable 7, Template Explorer:** DALF parsing, template documentation with fields/choices/keys, decompiled Daml-LF or actual source rendering in Monaco Editor
  - Sandbox Manager with DAR upload and party allocation
  - PostgreSQL error knowledge base covering 11 categories and 31+ codes. Redis caching layer
  - Test Daml project with SimpleToken, Agreement, and ReferenceData templates. Integration tests against a real Canton Sandbox

### Milestone 2: Real-Time Monitoring — Event Stream, Transaction Explorer & Contract Lifecycle

- **Estimated Delivery:** Week 8
- **Focus:** Real-time event streaming, transaction tree visualization with state diffing, and contract history tracking.
- **Deliverables / Value Metrics:**
  - **Deliverable 8, Event Stream Monitor:** WebSocket streaming with all four update types, server-side filtering, pause/resume, auto-reconnect with exponential backoff, offset-based recovery
  - **Deliverable 4, Transaction Explorer:** Interactive tree visualization with ReactFlow, state diff computation, full transaction metadata, privacy analysis view
  - **Deliverable 5, Contract Lifecycle Tracker:** Full history via EventQueryService and UpdateService enrichment, visual timeline, pruning awareness
  - Cross-feature navigation linking events, transactions, contracts, and templates

### Milestone 3: Error Debugging & Transaction Simulation

- **Estimated Delivery:** Week 12
- **Focus:** Structured error decoding with the full 11-category Canton error taxonomy, and dual-path transaction simulation.
- **Deliverables / Value Metrics:**
  - **Deliverable 3, Error Debugger:** Full 11-category error taxonomy, gRPC metadata parsing, contention timeline visualization, knowledge base lookup. Security stripping warning for PERMISSION_DENIED errors
  - **Deliverable 2, Transaction Simulator:** Online via PrepareSubmission and offline via local engine execution, command builder UI with dynamic argument forms, what-if panel with side-by-side comparison

### Milestone 4: Expression-Level Execution Debugger

- **Estimated Delivery:** Week 17
- **Focus:** The platform's headline capability. Forked Daml-LF engine with expression-level instrumentation, three-panel debugger UI, and the source extraction and decompilation pipeline.
- **Deliverables / Value Metrics:**
  - **Deliverable 1, Expression-Level Debugger:** Minimal engine fork with classpath shadowing build. MachineSnapshot implementation capturing source location, current expression, and full environment stack. Step correlation and intelligent grouping at three verbosity levels
  - Three-panel UI: Code Panel with Monaco Editor, Steps Panel with sequential step list and navigation controls, Context Panel with active contracts, authorization state, and growing transaction tree
  - Step navigation: forward, back, run to error, run to contract fetch, run to end. Ensure clause debugging. Authorization debugging with required vs provided party sets
  - DAR source extraction pipeline storing `.daml` files in PostgreSQL keyed by package ID. Daml-LF decompilation fallback for production packages where source is stripped

### Milestone 5: Script Debugger, Profiler & Static Analyzer

- **Estimated Delivery:** Week 22
- **Focus:** Script-level debugging, performance profiling, and automated security analysis.
- **Deliverables / Value Metrics:**
  - **Deliverable 10, Script Trace Debugger:** Script runner wrapping at action and engine levels, timeline view, variable inspector with payload enrichment, ledger snapshots with diff, engine drill-down, `submitMustFail` validation
  - **Deliverable 11, Profiler:** Flame chart from the engine's built-in Profile data and per-step wall-clock timing, hotspot table, per-choice cost breakdown, step distribution, speedscope JSON export
  - **Deliverable 12, Static Analyzer:** Eight detection rules on the Daml-LF expression tree, integrated into Template Explorer and DAR upload flow, JSON export, suggested fixes per finding

### Milestone 6: API, CI/CD & Production Readiness

- **Estimated Delivery:** Week 26
- **Focus:** Programmatic API, CI/CD integration, production hardening.
- **Deliverables / Value Metrics:**
  - **Deliverable 13, REST API & CI/CD:** OpenAPI-documented endpoints, CI/CD pipeline endpoint, example GitHub Actions and GitLab CI configurations
  - Performance: Redis caching, gRPC connection pooling, WebSocket backpressure handling, virtualized scrolling for large datasets
  - Resilience: automatic gRPC reconnection, JWT refresh, graceful degradation when services are unavailable
  - UX: keyboard shortcuts for step-through debugging, dark/light mode, loading and empty states with guidance
  - End-to-end test suite and complete project documentation

---

### Post-Release Maintenance

Following the final milestone, I will maintain CantonTrace for 12 months at no additional cost. Maintenance covers Canton SDK version compatibility (re-applying the engine fork modifications against new Daml-LF releases and validating classpath shadowing), bug fixes for reported issues, dependency security updates, and adjustments required by Canton Ledger API changes. Feature development beyond the 13 deliverables defined in this proposal is not included in the maintenance commitment.

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables verified against a running Canton Sandbox, version 3.5 / Splice 0.5.x, with test data exercising all platform features
- All features operating against real Canton Ledger API v2 data, not mock data
- Full Canton 3.5 protocol compliance: mandatory `active_at_offset`, package-name references, all four update types handled, correct EventQueryService wrapper message handling, offset locality enforced, sub-transaction privacy respected
- Expression-level debugger producing accurate traces with source mapping and variable capture
- Static analyzer detecting all eight rule violations on test templates with no false negatives
- All code published under Apache 2.0 with documentation covering architecture, API reference, deployment, and contribution guidelines

---

## Funding

**Total Funding Request:** 2,450,000 CC

### Payment Breakdown by Milestone

- Milestone 1 (Foundation): **350,000 CC** upon committee acceptance
- Milestone 2 (Monitoring & Transaction Analysis): **350,000 CC** upon committee acceptance
- Milestone 3 (Error Debugging & Simulation): **400,000 CC** upon committee acceptance
- Milestone 4 (Expression-Level Debugger): **550,000 CC** upon committee acceptance
- Milestone 5 (Script Debugger, Profiler & Static Analyzer): **450,000 CC** upon committee acceptance
- Milestone 6 (API & Production Readiness): **350,000 CC** upon final release and acceptance

### Budget Justification

The budget covers 26 weeks of full-time solo development, weighted by technical complexity. Milestone 4 receives the largest allocation at 550,000 CC because it delivers the platform's headline feature: the forked Daml-LF engine with Speedy machine instrumentation, the classpath shadowing build configuration, the MachineSnapshot implementation, the three-panel debugger UI with Monaco Editor integration, the step correlation and grouping algorithms, and the DAR source extraction and decompilation pipeline. This is the most technically demanding and architecturally novel component in the entire platform. Milestone 5 at 450,000 CC combines three deep engine-service workstreams: the Script runner integration with instrumentation at two integration points, the performance profiler reading the engine's built-in Profile object with expression-level timing, and the complete static analysis rule engine with eight detection rules requiring deep AST traversal of compiled DALF archives. Milestone 3 at 400,000 CC implements the dual-path transaction simulator with both PrepareSubmission integration and server-side engine execution, alongside the full 11-category error taxonomy with contention visualization. Milestones 1, 2, and 6, at 350,000 CC each, deliver the platform foundation and Canton connectivity, the real-time monitoring and transaction analysis features, and the programmatic API with production hardening respectively.

All costs are development costs including infrastructure. No marketing or promotional expenses are included.

---

## Co-Marketing

Upon release, I will collaborate with the Canton Foundation on:

- Announcement coordination for the platform launch
- A technical blog post on the engine fork approach and expression-level debugging
- A video walkthrough demonstrating the full debugging workflow from sandbox creation through execution tracing to error resolution
- Developer onboarding content: a guided tutorial showing new Canton developers how to go from zero to debugging their first Daml contract, suitable for integration into Canton's official developer documentation
- Presentation at Canton developer community events or Foundation-organized calls/meetups
- Ongoing visibility in Canton community channels including Discord, [discuss.daml.com](http://discuss.daml.com), and relevant developer forums to drive awareness, gather feedback, and support adoption

---

## Motivation

Canton's institutional adoption has outpaced developer tooling. Canton's sub-transaction privacy model, where each party sees only its entitled projection of a transaction, and its UTXO-based state model make debugging fundamentally harder than on public chains. On Ethereum, tools like Tenderly can replay any transaction with full visibility. On Canton, error details are deliberately stripped for security, and contention diagnosis requires manual log forensics. The canonical troubleshooting workflow involves six manual steps across raw log files to diagnose a single contention failure.

The existing tooling landscape confirms the gap:


| Tool            | Provider                    | Capability                                                | Limitation                                                                |
| --------------- | --------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------- |
| Daml Studio     | Digital Asset               | VS Code extension with local script execution             | Cannot connect to live participant nodes. No execution tracing            |
| Daml Shell      | Digital Asset               | CLI-based contract browser on Participant Query Store     | Enterprise-only, CLI-only. No visualization, simulation, or tracing       |
| Canton Console  | Digital Asset               | Admin operations via REPL                                 | Not a debugging tool. No contract inspection or transaction visualization |
| Navigator       | Digital Asset               | Web-based contract browser                                | Deprecated in Daml 2.9, removed in 3.0                                    |
| Cantonscan      | Proof Group                 | Network-level explorer: balances, validators, governance  | No private contract data. No participant-level or source-level debugging  |
| CC Explorer     | Node Fortress               | Network monitoring, API, webhook alerts                   | No Daml execution visibility. Macro-level network data only               |
| 5N Lighthouse   | Canton Loop                 | Public explorer and data platform                         | Network activity only. No participant-level debugging                     |
| Sync Insights   | [Chata.ai](http://Chata.ai) | AI-driven analytics on network relationships              | Macro analytics. No Daml execution debugging                              |
| Noves CCBrowser | Noves                       | Chrome extension with human-readable transaction analysis | Asset flow mapping. No code-level debugging                               |


No existing tool provides participant-level, privacy-aware, source-level Daml execution debugging. CantonTrace occupies this entirely unserved space.

CantonTrace is valuable because it:

- **Fills an unserved niche.** No tool provides participant-level, privacy-aware, source-level Daml debugging. Network explorers cannot access private data. Daml Shell is CLI-only and Enterprise-only. Daml Studio, the VS Code extension, cannot connect to live participant nodes.
- **Pioneers a unique capability.** Expression-level execution tracing with source mapping and variable inspection in a web UI does not exist for any blockchain. Solidity debuggers operate at the EVM opcode level. Foundry's debugger is CLI-only. No blockchain debugger handles sub-transaction privacy.
- **Prevents production incidents.** The static analyzer catches contention-prone designs, authorization gaps, and upgrade incompatibilities before deployment.
- **Lowers the barrier to entry.** Zero-friction sandbox creation, visual debugging, and interactive template documentation support Canton's developer growth.
- **Creates a public good.** Open-source under Apache 2.0, permanently available to every Canton developer.

---

## Rationale

**Why a forked engine?** Canton's privacy model strips execution details from API responses to protect sub-transaction confidentiality. The only way to provide source-level debugging is to re-execute the command locally in an instrumented engine using the same contract state and packages available to the authenticated user. The Daml-LF engine is well suited for this because it is a pure interpreter that resolves external state, such as contracts and packages, via callbacks. It is architecturally decoupled from Canton's consensus and networking layers. Canton uses a single code path for both transaction construction and validation, so an instrumented fork captures the exact execution trace used in production.

**Why classpath shadowing?** A full fork of the engine, roughly 50,000 lines, would create a maintenance burden proportional to the entire codebase. Classpath shadowing places modified class files ahead of the published JAR on the JVM classpath, isolating changes to three files. Version updates become a targeted task: re-apply the modifications to three files, compile, and test. The modified surfaces, `ResultInterruption` and the machine accessor methods, are stable across versions because they are used by the engine's own error reporting and profiling.

**Why Server Reflection?** Canton's protobuf API definitions evolve across versions. Bundling static proto files would break with each Canton update. Server Reflection dynamically discovers available services from the running participant, making the platform version-agnostic. This required solving a specific compatibility issue: Canton's `Variant` message has a field named `constructor` that collides with JavaScript's built-in `Object.constructor`, handled via a targeted protobufjs monkey-patch.

**Why dual-path simulation?** Path A via PrepareSubmission reflects exact participant behavior including cost estimation but requires `CanActAs` permission. Path B via the offline engine requires only `CanReadAs` permission, supports time-travel debugging against historical state, and feeds directly into the expression-level debugger for step-through analysis. Neither path alone covers all debugging scenarios.

**Why a web platform?** The 2026 developer survey specifically requested browser-based visual tools, with multiple respondents citing Tenderly and Remix as benchmarks. A web platform requires no local installation, supports team collaboration, integrates with CI/CD pipelines via REST API, and enables the visualizations essential for understanding Canton's multi-party, privacy-preserving transaction model: transaction trees, privacy matrices, flame charts, and contention timelines.

**Why static analysis on DALF bytecode?** Enterprise deployments routinely strip `.daml` source files from DAR archives before deployment to protect proprietary logic. DALF bytecode is always available via Canton's package service and retains the complete abstract syntax tree including template structures, choice bodies, and authorization expressions. The eight rules target documented, prevalent vulnerability classes: UTXO contention as Canton's #1 production issue, authorization gaps, N+1 fetch chains causing timeouts, and package upgrade incompatibilities.

**Why integrate static analysis into the debugging platform?** Runtime debugging and static analysis are complementary. The debugger reveals what went wrong in a specific execution; the analyzer reveals what was structurally going to go wrong regardless. When the Expression-Level Debugger catches a contention failure on a template that the Static Analyzer already flagged as contention-prone, the developer understands not just the symptom but the design flaw that caused it. Integrating both into one platform closes this feedback loop. A standalone analyzer would produce warnings with no connection to runtime behavior; a standalone debugger would diagnose symptoms without surfacing their structural root causes.

**Why not build on an existing tool?** VS Code extension extending Daml Studio was rejected because it cannot connect to live participant nodes. A CLI tool augmenting Daml Shell was rejected because the target users expect web-based tools. Plugins for existing blockchain debuggers like Tenderly or Foundry were rejected because they are architecturally tied to EVM and cannot handle Daml's functional paradigm or sub-transaction privacy. Building on the deprecated Navigator codebase was rejected because Navigator was removed due to its inability to support smart contract upgrades.



---

## Team

### Mert Köklü

Mert is an experienced software engineer with over four years of blockchain development experience, specializing in tooling, integrations, and backend infrastructure. He holds Bachelor's degree in Computer Science and has led engineering teams focused on both AI and blockchain technologies.

He previously worked with ApeWorX, where he developed StarkNet plugins and compiler tools for the Cairo language. Before that, he served as AI Video Analytics Team Lead at an NVIDIA partner company, managing large-scale intelligent vision projects.

**Recent Grantee Projects:**

- **SoroReveal:** Decompile Soroban smart contracts back to readable source code ([web](https://sororeveal.com/))
- **Alerts dYdX:** Monitor positions, alerts, and account status on dYdX in real time ([web](https://alertsdydx.com/))
- **Kurtosis-Orbit:** Tool for spinning up complete Arbitrum Orbit rollup environments ([repo](https://github.com/justmert/kurtosis-orbit))
- **Arbitrum Python SDK:** Python library for interacting with Arbitrum ([repo](https://github.com/justmert/arbitrum-python-sdk))
- **ICP Agent Kit:** Enables natural language interaction with the Internet Computer ([repo](https://github.com/justmert/icp-agent-kit))
- **Cosmic:** Local Starknet block explorer ([repo](https://github.com/justmert/cosmos))

**Contact**

- **GitHub**: <https://github.com/justmert>
- **LinkedIn**: <https://www.linkedin.com/in/mertkoklu/>
- **Telegram**: @mertkklu

