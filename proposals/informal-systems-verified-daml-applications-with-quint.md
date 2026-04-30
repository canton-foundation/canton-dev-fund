## Development Fund Proposal: Verified DAML applications with Quint - Specification-Driven Testing and AI-Assisted Smart Contract Development for Canton

**Author:** [Informal Systems](https://informal.systems)
**Status:** Submitted
**Created:** 2026-03-06  

---

## Abstract

This proposal addresses a key gap in DAML development on Canton: the lack of formal, application-level verification.

Today, DAML contracts rely on manual, scenario-based testing, which does not systematically check invariants or explore all possible states. At the same time, LLM-generated DAML code can introduce subtle authorization and workflow bugs, with no automated way to verify correctness against developer intent.

The project delivers:

- Spec-Driven Code Generation: A workflow where a formal Quint specification guides LLM code generation and serves as the verification oracle, iterating until the contract satisfies the spec.
- Quint Connect for DAML: A model-based testing framework that verifies a DAML implementation against the same Quint specification by replaying generated traces by the simulator that explore the state space of contract interactions.

### Value to the Canton Ecosystem

- Raises the baseline security and correctness of DAML applications
- Introduces a practical, specification-first discipline for DAML
- Makes AI-assisted DAML development verifiable and safe
- Strengthens Canton’s positioning as a high-assurance smart contract platform

---

## Specification

### 1. Objective

#### Problem

DAML is a smart contract language designed with a strong focus on correctness. Its explicit party and authorization model, clear contract lifecycle semantics, and formally defined execution model make it a good fit for expressing complex multi-party workflows. In practice, however, translating a developer’s intent into a correct and robust DAML implementation can still be difficult and time-consuming.

Three concrete problems motivate this proposal:

**1.1 Testing DAML contracts is manual and shallow.**

The primary testing tool today is Daml Script, which allows developers to write deterministic, sequential test scenarios. This is analogous to writing hand-crafted unit tests: useful, but it only covers the paths the developer already thought of. There is no property-based testing, no systematic exploration of state space, and no way to express and machine-check invariants across all reachable states.

**1.2 LLM-generated DAML code is unverified.**

Large language models can write plausible-looking DAML, but could produce subtle authorization mistakes, incorrect signatory sets, missing `ensure` clauses, and flawed choice guards; bugs that are hard to spot in review and dangerous on a live ledger. There is currently no toolchain that can automatically verify whether LLM-generated DAML code matches a developer’s stated intent.

**1.3 Formal specifications of DAML applications do not exist as a discipline.**

Writing down the intended behavior of a multi-party workflow formally (before writing code) is the most effective way to catch design flaws early. DAML’s own formal semantics (the DAML-LF specification) describe *how* the runtime works, not *what a given application should do*. There is no standard language or tooling for writing application-level specs for DAML contracts, and no way to mechanically check an implementation against such a spec.

#### Intended Outcome

This project delivers two interlocking pieces of infrastructure:

**A. Quint Connect for DAML**: A model-based testing (MBT) framework that lets developers write a formal [Quint](https://quint-lang.org/) specification of their DAML application’s behavior and automatically verify that a deployed DAML contract matches the spec, by replaying Quint-generated traces against a running Canton Sandbox instance. This is the DAML analog of [`quint-connect`](https://github.com/informalsystems/quint-connect), which already does this for Rust programs.

**B. Spec-Driven DAML Code Generation**: A workflow and toolchain that uses a Quint spec as both the *generation prompt* and the *verification oracle* for LLM-assisted DAML code generation. The same formal spec that expresses intent guides an LLM to produce DAML templates, and the MBT framework automatically verifies the result — feeding failures back into the LLM until the implementation passes. Users are required only to provide English prompts or English specifications as input, and the toolchain will automatically generate (leveraging [`quint-llm-kit`](https://github.com/informalsystems/quint-llm-kit)) a Quint spec. The user is also responsible for reviewing and validating the Quint spec.

Together, these raise the baseline correctness of DAML applications in the Canton ecosystem, make formal methods accessible to application developers, and establish a repeatable discipline for verified DAML development.

### 2. Implementation Mechanics

#### 2.1 DAML–Quint Correspondence

Quint is a specification language in the tradition of TLA+, designed to express state machines: variables, actions that transition state, and invariants. DAML’s execution model maps onto this model naturally.

DAML’s runtime state is the Active Contract Set (ACS): the set of all live, non-archived contracts at a given moment, each identified by an opaque contract ID and carrying its template fields as payload. Contracts are brought into existence by `create` commands and mutated by `exercise` commands (consuming choices archive the exercised contract and may create new contracts in its place, while non-consuming choices leave it unchanged). Authorization rules (signatories, controllers, observers) determine which parties must be involved in each operation.

In Quint, the ACS becomes a map from contract ID to a record of template fields, held in a state variable. DAML choices become guarded Quint actions: their `ensure` clauses and preconditions become boolean guards, and their create/archive effects become map updates. Parties are explicit parameters to actions; Quint’s `nondet` operator is used to nondeterministically pick which party acts and which contract IDs are involved during simulation, systematically exploring all reachable combinations. Template-level invariants become Quint `val` invariants that the model checker verifies hold at every reachable state.

As a concrete example, Appendix A shows a DAML token contract alongside its equivalent Quint specification, illustrating how templates become state maps, choices become guarded actions, and the `nondet` operator drives nondeterministic exploration. That spec drives both trace generation and verification.

#### 2.2 Quint Connect for DAML

[`quint-connect`](https://github.com/informalsystems/quint-connect) is an existing Rust library that connects a Quint specification to a Rust implementation for model-based testing. The developer writes a Quint spec of the intended behavior and implements a thin `Driver` trait that maps each Quint action to a call into the Rust system under test. The framework then runs `quint` to generate traces from the spec, replays each trace through the driver, and after every step compares the actual system state against the state the Quint model predicted, reporting a structured diff on any mismatch. It has been used to test distributed system components (e.g., in [Malachite](https://github.com/circlefin/malachite), a BFT consensus engine implemented in Rust; and in [Emerald](https://github.com/informalsystems/emerald), a framework for building high performance EVM-compatible networks) and is the direct inspiration for this proposal.

Quint Connect for DAML follows the same three-phase architecture, adapted for the DAML/Canton execution model.

#### Phase 1: Trace Generation

At test runtime (not compile time), the framework spawns the `quint` CLI as a blocking subprocess. Two modes are supported:

- Simulation mode: `quint run spec.qnt --mbt --seed N --n-traces K`. Quint randomly explores the state space and writes `K` ITF JSON files to a temp directory. The `--mbt` flag instructs Quint to record `mbt::actionTaken` and `mbt::nondetPicks` in every step so the driver knows what to execute and with what parameters.
- Scenario mode: `quint test spec.qnt --match ^scenarioName$`. Quint executes a named deterministic `run` test scenario from the spec. No `--mbt` flag; the trace is fully determined by the scenario definition.

Both modes produce [ITF (Informal Trace Format)](https://apalache-mc.org/docs/adr/015adr-trace.html) files with JSON where each step contains the action name, the nondeterministic parameters chosen for that step, and the expected next values of all Quint state variables. No changes to the Quint language itself are needed; only the driver layer is new.

#### Phase 2: Trace Replay

For each step in each ITF trace, the runner extracts the action name and parameters from the ITF JSON and dispatches to the driver, which translates the action into the corresponding DAML command and submits it to a locally running Canton Sandbox via the HTTP JSON API, then waits for transaction confirmation before proceeding to the next step.

What needs to be built is the runner loop (ITF parsing + dispatch) and the driver interface. The runner is the core reusable piece of the framework; the driver is application-specific and written by the user for each DAML application under test.

We will leverage existing available tooling:

- [`@daml/ledger`](https://docs.daml.com/app-dev/bindings-ts/daml-ledger) (the official Canton TypeScript/JavaScript HTTP JSON API client) provides the primitives for submitting commands to the ledger.
- [`daml codegen js`](https://docs.digitalasset.com/build/3.5/component-howtos/application-development/daml-codegen-javascript.html) generates TypeScript bindings from a compiled DAML DAR file, giving strongly-typed access to template constructors and choice arguments and eliminating a class of serialization errors.

#### Phase 3: State Verification

After each step, the runner queries the Active Contract Set (ACS) via the HTTP JSON API and compares it structurally against the expected state recorded in the ITF file. On mismatch, a diff is reported and the test fails.

The comparison is non-trivial in one important aspect: DAML’s ACS only contains *active* (non-archived) contracts, whereas a Quint state model typically represents the full history of the system, including state variables that are derived from archiving events. The driver must therefore reconstruct derived state from the ACS and from the history of submitted commands. This mapping from the ledger’s ACS representation to the Quint state representation is the core driver-side responsibility and must be written by the developer for each application.

What needs to be built in this case is the state comparison logic in the framework (structural diff between deserialized ITF state and driver-reported state), and the ACS-to-Quint-state mapping in each driver. The `daml codegen js` output gives typed access to ACS payloads, which makes the mapping code type-safe.

#### Local Setup

For local development, the Canton SDK provides a single command that starts both a Canton Sandbox instance and an HTTP JSON API server together, which is sufficient to run the MBT tests against a local ledger.

Before running MBT tests, parties must be allocated on the ledger. In DAML, parties are opaque identifiers assigned by the ledger at allocation time. The recommended approach is to write a Daml Script that allocates the required parties and outputs their ledger-assigned identifiers to a file that the test runner can then load. These allocated parties persist on the Sandbox ledger across API calls.

#### 2.3 Spec-Driven DAML Code Generation

The second pillar turns Quint specs into a generation prompt and a verification oracle simultaneously:

```
+------------------------------------------------------+
| Developer writes English spec of intended behavior   |
+------------------------------------------------------+
                         |
                         v
+--------------------------------------------------------------+
| Developer writes Quint spec                                  |
|            OR                                                |
| LLM drafts Quint spec and developer reviews and approves     |
+--------------------------------------------------------------+
                         |
                         v
+--------------------------------------------------------------+
| Generation prompt                                            |
| "Given this Quint spec of a DAML application's behavior,     |
|  generate a correct DAML template implementation"            |
+--------------------------------------------------------------+
                         |
                         v
+-------------------------------+
| LLM-generated DAML template   |
+-------------------------------+
                         |
                         v
+--------------------------------------------------------------+
| quint run --mbt spec.qnt                                     |
|  -> ITF traces                                               |
|  -> DAML driver replays each trace                           |
|  -> Compare ACS to expected spec state                       |
+--------------------------------------------------------------+
                         |
                         v
                    +---------+
                    |  pass?  |
                    +----+----+
                         | 
              +----------+----------+
              |                     |
             yes                    no
              |                     |
              v                     v
        +-----------+     +------------------------------------+
        |   Done    |     | Correction prompt                  |
        +-----------+     | "The generated DAML failed the     |
                          | following MBT trace. At step N and |
                          | action X the expected state was... |
                          | but the contract ACS shows...      |
                          | Here is the current DAML code.     |
                          | Fix it."                           |
                          +------------------------------------+
                                            |
                                            v
                                      +-----------+
                                      | Fix code  |
                                      +-----------+
                                            |
                                            +------------------+
                                                               |
                                                               v
                               (back to) quint run --mbt spec.qnt
```

Key properties of this loop:

- Unambiguous feedback: the error is not “the tests failed” but a structured diff between the Quint expected state and the actual ACS (the LLM receives precise information about what is wrong)
- Termination condition: all Quint-generated traces pass, then correctness guaranteed up to the spec’s expressiveness
- Spec as documentation: the Quint spec serves triple duty as design doc, generation prompt, and test oracle

#### 2.4 Toolchain Components Summary

Existing infrastructure this project builds on:

| Tool | Role in this project |
| --- | --- |
| `quint` CLI + ITF format | Generates MBT traces; the ITF JSON schema is the interface between spec and driver |
| `@daml/ledger` | Official TypeScript HTTP JSON API client; used by the driver to submit commands to Canton |
| `daml codegen js` | Generates typed TypeScript bindings from a compiled DAR file; used for type-safe ACS deserialization |
| Canton Sandbox | Local ledger for running MBT tests against |

Project deliverables:

| Deliverable | Language | Form |
| --- | --- | --- |
| `quint-connect-daml` (MBT runner + `Driver` interface definition) | TypeScript | npm package |
| Quint DAML pattern library (reusable Quint modules encoding common DAML contract patterns) that developers can import as building blocks when writing specs | Quint | `.qnt` files |
| `quint-llm-kit` DAML extension (DAML-aware agents and prompt templates that use the pattern library as context for LLM-assisted Quint spec generation for DAML applications) | — | Contribution to [`quint-llm-kit`](https://github.com/informalsystems/quint-llm-kit) |
| End-to-end working example | DAML + Quint + TypeScript | GitHub repository |
| Documentation | — | In each corresponding repository |

### 3. Architectural Alignment

#### 3.1 Alignment with DAML’s Formal Foundations

DAML was designed with formal semantics from the beginning. The DAML-LF specification defines the language’s reduction rules, authorization logic, and privacy semantics mathematically. This project sits in direct alignment with that design philosophy: it brings application-level formal specification to the layer above DAML-LF, closing the gap between the formally-specified runtime and the informally-described applications that run on it.

Specifically:

- Authorization invariants: DAML’s authorization model (signatories must authorize, controllers must be observers) is mechanically enforceable at the language level — but whether a given set of signatories is *the right set for the application’s business logic* is not. Quint specs capture this application-level authorization intent and verify it against traces.
- Privacy model: Canton’s subview privacy, where each participant sees only the contract data relevant to their role, can be modeled in Quint as per-party state projections. This allows MBT to verify not just correctness but correct information disclosure.
- Finality and atomicity: Canton’s transaction model guarantees atomic multi-contract updates. Quint specs can model this atomicity explicitly, ensuring the implementation’s atomic steps match the spec’s atomic transitions.

#### 3.2 Alignment with Ecosystem Priorities

Developer accessibility: Canton’s goal of making multi-party workflows composable and trustworthy requires developer tooling that meets application developers where they are. Daml Script today requires developers to manually construct test scenarios, a skill that takes time to develop. MBT from Quint specs lowers the barrier: write what the system *should do*, and the tooling explores *whether it does*.

Security and auditability: A Quint spec is a precise, human-readable, machine-checkable document. For Canton applications handling financial instruments, having a formal spec as part of the repository creates an auditable record of intended behavior (one that can be checked against the implementation at any time). This directly supports the due diligence expected of regulated financial applications on Canton.

LLM-assisted development: The Canton ecosystem is seeing growing interest in AI-assisted DAML development. Without a verification layer, this creates a new attack surface: confident-sounding but incorrect contracts. By making Quint specs a first-class artifact in the DAML development workflow, this project provides a correctness layer that makes LLM assistance safe to use in production contexts.

Complementing existing tooling: This project does not replace Daml Script, it complements it. Daml Script is ideal for concrete, regression-style tests. Quint-based MBT explores the state space systematically. Both are needed, and a Canton developer would use both.

### 4. Backward Compatibility

No backward compatibility impact.

---

## Milestones and Deliverables

### Milestone 1: Quint connect for DAML
- **Estimated Delivery:** 5 weeks. 
- **Focus:** The model-based testing framework for DAML that connects Quint specifications with DAML applications.
- **Deliverables / Value Metrics:** `quint-connect-daml` npm package — runner loop, `Driver` interface, state comparison, end-to-end working example.

### Milestone 2: Spec-Driven DAML code generation
- **Estimated Delivery:** 4 weeks 
- **Focus:** LLM-assisted workflow for automated generation of DAML application from Quint specs.
- **Deliverables / Value Metrics:**  Quint DAML pattern library, spec design guidelines for DAML applications, `quint-llm-kit` DAML extension.

---

## Acceptance Criteria

### Milestone 1: Quint Connect for DAML

**`quint-connect-daml` npm package**

- The package is published to npm (or delivered as a tagged GitHub release with build instructions) and installs without errors using a standard Node.js toolchain.
- The package exposes a `Driver` interface that application developers can implement to map Quint actions to DAML commands.
- The runner loop correctly parses ITF JSON traces produced by `quint run --mbt` and dispatches each step to the driver by action name and nondeterministic parameters.
- After each step, the runner queries the Canton Sandbox ACS via the HTTP JSON API, applies the driver's ACS-to-Quint-state mapping, and compares the result against the expected state in the ITF file, reporting a human-readable diff on any mismatch and failing the test.
- Both simulation mode (`quint run --mbt`) and scenario mode (`quint test`) are supported as trace sources.

**End-to-end working example**

- A self-contained example repository (or subdirectory) is provided that includes: a non-trivial DAML template, its corresponding Quint specification, a TypeScript driver implementing the `Driver` interface, and instructions for running the full MBT test suite locally.
- Running the example's test suite against a local Canton Sandbox instance completes without errors and exercises at least one failing-trace scenario to demonstrate that state mismatches are correctly detected and reported.

**Documentation**

- A README or documentation page covers: how to write a `Driver` for a new DAML application, how to run MBT tests, and how to interpret trace replay failures.

### Milestone 2: Spec-Driven DAML Code Generation

**Quint DAML pattern library**

- At least three reusable `.qnt` modules are provided, each encoding a distinct common DAML contract pattern (e.g., create/archive lifecycle, signatory and controller authorization, non-consuming and consuming choices, multi-party workflows).
- Each module includes inline documentation and at least one runnable `quint run` example demonstrating its use.

**`quint-llm-kit` DAML extension**

- A contribution to the [`quint-llm-kit`](https://github.com/informalsystems/quint-llm-kit) repository adds DAML-aware agents and prompt templates that use the Quint DAML pattern library as context.
- A working demonstration shows the full spec-driven code generation loop end-to-end: starting from an English description of a DAML workflow, generating a Quint spec (either by the developer or LLM-assisted), using that spec as a generation prompt for LLM-produced DAML code, running `quint-connect-daml` MBT tests against the generated code, feeding structured failure diffs back into the LLM, and iterating until all traces pass.

**Spec design guidelines**

- A written guide explains how to structure a Quint specification for a DAML application: how to model the ACS as Quint state, how to represent choices as guarded actions, how to use `nondet` for party and contract ID selection, and how to express template-level invariants.

**Documentation**

- Documentation for the `quint-llm-kit` DAML extension covers how to invoke the DAML agents, how to review and validate a generated Quint spec before using it as a generation prompt, and how to interpret MBT feedback during the code generation loop.

---

## Funding

**Total Funding Request:** $150,000 USD equivalent in Canton Coin (CC)

### Payment Breakdown by Milestone

- Milestone 1 Quint connect for DAML: $75,000 USD equivalent in Canton Coin (CC) on completion  
- Milestone 2 Spec-Driven DAML code generation: $75,000 USD equivalent in Canton Coin (CC) on completion

### Volatility Stipulation

If the project duration is **greater than 6 months**:  
The grant is denominated in fixed Canton Coin and will require a re-evaluation at the 6-month mark.

If the project duration is **under 6 months**:  
Should the project timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility.

---

## Co-Marketing

Informal Systems and the Canton Foundation will coordinate a joint launch announcement with a technical blog post distributed through both organizations’ channels, covering the practical value of specification-driven development for DAML and the tooling delivered under this proposal. Six months post-launch, Informal and the Canton Foundation will publish a follow-up blog featuring case studies from teams that have adopted the tooling, documenting real-world impact on DAML development workflows.

Building on Informal’s existing work publishing technical content on DAML development, Informal will contribute to Canton’s investment in the DAML ecosystem through accessible documentation and educational resources. Where relevant, Informal will provide technical expertise at Canton-hosted hackathons to support teams building verified DAML applications. Through its formal methods and blockchain security networks, Informal will introduce Canton to an audience of developers and researchers who evaluate platforms on correctness and technical rigor, expanding Canton’s reach into a community that is a natural fit for its high-assurance positioning.

---

## Motivation

This proposal strengthens the Canton ecosystem by improving the correctness, safety, and development workflow of DAML applications, which are central to Canton’s value as an institutional-grade platform.

It raises the baseline reliability of DAML smart contracts. Complex authorization rules, signatory sets, and workflow constraints are difficult to verify through manual tests alone. Model-based testing and formal specifications allow developers to check invariants across many possible execution paths, reducing subtle bugs that could otherwise appear in production systems.

Second, the proposal introduces a specification-first development discipline for DAML applications. By enabling developers to formally describe the intended behavior of a workflow before implementing it, the approach helps identify design errors early and provides a clear, machine-checkable definition of contract behavior. This aligns well with Canton’s focus on high-assurance, multi-party systems used in regulated and enterprise environments.

Third, the project makes AI-assisted DAML development safer and more practical. As LLMs increasingly assist with code generation, having an automated verification loop ensures that generated contracts actually match the developer’s intent. This enables faster development without sacrificing correctness.

Finally, the tooling is designed to be accessible to application developers, which supports ecosystem adoption. Because it operates alongside existing Canton development workflows and uses the Canton Sandbox for verification, teams can integrate it without changing the underlying infrastructure.

Overall, the proposal helps establish verified DAML development as a standard practice, improving trust in Canton-based applications and strengthening the ecosystem’s appeal for complex, high-value multi-party systems.

---

## Rationale

This proposal delivers value by combining formal specification, model-based testing, and automated verification in a way that fits naturally with existing DAML and Canton development workflows.

### Specification as the Source of Truth

The design centers on writing a Quint specification of the intended workflow behavior before or alongside the DAML implementation. This ensures that developer intent is captured explicitly and can be mechanically checked. Using a formal specification as the source of truth allows both testing and code generation to be grounded in the same definition of correct behavior.

### Model-Based Testing Instead of Manual Test Scenarios

Current DAML testing relies primarily on handwritten Daml Script scenarios, which only cover paths the developer explicitly anticipates. The proposed approach uses model-based testing (MBT) to automatically generate execution traces from the specification and replay them against a running Canton Sandbox instance. This systematically explores more of the state space and verifies invariants across many possible contract interactions.

### Verification Without Modifying Canton

A key design decision is to implement verification externally to the Canton ledger. The framework interacts with a standard Canton Sandbox instance rather than modifying the runtime or ledger protocol. This keeps the solution lightweight, compatible with existing deployments, and easy for developers to adopt.

### Spec-Driven LLM Code Generation

Instead of trusting LLM-generated code directly, the proposal uses the specification as both the generation prompt and verification oracle. The model-based testing framework automatically checks whether generated code satisfies the specification and feeds failures back into the generation loop. This creates a practical path to safe AI-assisted development.

### Why This Approach Is Preferred

Alternative approaches were considered:

- Expanding manual test suites: Improves coverage incrementally but still relies on developers anticipating edge cases.
- Static analysis or linting tools: Useful for catching common mistakes but unable to verify full workflow behavior or state transitions.
- Direct formal verification of DAML code: Powerful but typically too complex and specialized for most application developers.

The proposed approach balances rigor and usability. Model-based testing provides strong behavioral guarantees without requiring developers to become formal methods experts, while the use of Quint specifications creates a reusable artifact that supports testing, verification, and AI-assisted development.

As a result, this solution delivers meaningful improvements in correctness, developer productivity, and ecosystem reliability while remaining practical for real-world Canton application development.

### Team and Prior Work

[Informal Systems](https://informal.systems/) is a research and engineering company specializing in formal methods, distributed systems, and blockchain infrastructure. Among other achievements, we were the originators and lead developers of [Malachite](https://github.com/circlefin/malachite), a high-performance BFT consensus engine, until it was acquired by Circle in August 2025.

Every component of this proposal builds directly on previous work and experience.

- Quint, the specification language. We are the authors and maintainers of [Quint](https://github.com/informalsystems/quint), the formal specification language at the core of this proposal. Quint is an executable specification language in the TLA+ tradition, with a built-in simulator, model checker, and support for the ITF trace format used by `quint-connect`. It is actively maintained and has been adopted for specifying distributed protocols and smart contract systems. See also: [Func Prog Podcast — Gabriela Moreira on Quint](https://www.linkedin.com/posts/informal-systems_func-prog-podcast-episode-4-gabriela-moreira-activity-7333497957180178433-3036).
- `quint-connect`, the MBT framework this proposal extends. We authored [`quint-connect`](https://github.com/informalsystems/quint-connect), the Rust library for model-based testing from Quint specifications that this project directly adapts for DAML. It has been applied in production testing of distributed system components, including the [Emerald](https://github.com/informalsystems/emerald/tree/main/tests/mbt) EVM-compatible network framework.
- LLM and formal specification. We have published on, and built tooling for, the combination of LLMs and formal specifications as a correctness workflow:
    - [Reliable Software in the LLM Era](https://quint-lang.org/posts/llm_era): executable Quint specs as a validation layer for LLM-generated code.
    - [Quint Connect: LLM-Friendly Model-Based Testing](https://quint-lang.org/posts/quint_connect): the design philosophy behind `quint-connect` and its use in AI-assisted development.
    - [`quint-llm-kit`](https://github.com/informalsystems/quint-llm-kit) — a practical toolkit integrating Claude Code with Quint agents, MCP servers, and pre-configured commands for LLM-assisted formal specification work; built from the experiments described in the above blog post and actively used internally at Informal Systems