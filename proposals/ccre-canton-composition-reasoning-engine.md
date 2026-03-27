## Development Fund Proposal

**Author:** Vicky Prasad
**Status:** Draft
**Created:** 2026-03-27

---

## Abstract

Canton Composition Reasoning Engine (CCRE) is a deterministic pre-execution validation tool for multi-application Canton workflows. It detects visibility and authorization violations in workflow composition before deployment, significantly reducing the current trial-and-error approach to validating cross-party interactions.

CCRE is not a workflow engine, testing framework, or package analyzer. It introduces a new layer in the Canton development stack: pre-execution composition validation. Canton enables composition but does not provide tooling to reason about it before execution. As the number of applications on Canton grows, the complexity of multi-app workflows increases non-linearly, making manual reasoning about composition correctness infeasible. CCRE fills this gap by performing static analysis against contract interfaces derived from Daml packages (DAR files), producing machine-verifiable certificates that can be integrated into CI pipelines, audit trails, and governance processes. It can act as a CI gate for workflow deployment, preventing unsafe compositions from reaching production.

A working MVP is available at [github.com/vickyshaw29/ccre](https://github.com/vickyshaw29/ccre) with full validation of visibility and authorization dimensions, deterministic certificate generation, and a CLI interface.

---

## Specification

### 1. Objective

In Canton's privacy model, contract visibility is scoped to signatories and observers. Authorization is scoped to controllers. When a workflow spans multiple applications — each managed by independent institutions — the composition of those applications can silently violate these constraints. A party may attempt to exercise a choice on a contract it cannot see, or act as controller on a choice it is not authorized for.

Today, these violations are discovered only at runtime through failed transactions, with no pre-deployment warning and no structured diagnostic output. For institutional deployments involving regulated counterparties, this creates operational risk, delays integration timelines, and increases the cost of multi-party workflow development.

CCRE solves this by validating workflow intent against contract interfaces before any transaction is submitted. For every step in a workflow, CCRE checks:

- **Visibility**: Is the acting party a signatory or observer of the target contract? (`actor ∈ signatories ∪ observers`)
- **Authorization**: Is the acting party the controller of the choice being exercised? (`actor == choice.controller`)

The output is a deterministic verdict (SAFE, UNSAFE, or UNSUPPORTED) with structured diagnostics identifying the exact step, violation type, and remediation path. When a workflow passes, CCRE produces a reproducible certificate — a machine-verifiable attestation that the workflow was validated under specific contract interfaces and intent. Same inputs always produce identical output, byte for byte.

### 2. Implementation Mechanics

CCRE is built in TypeScript 5.x targeting Node.js 20 LTS. The validation pipeline consists of six stages:

1. **Schema parsing and structural validation** — Contract interface JSON is validated against a strict Zod schema. Invariants are enforced (e.g., controller ⊆ stakeholders).
2. **Intent parsing** — Workflow intent is validated for structural correctness and completeness.
3. **Binding resolution** — Each workflow step is bound to its target template and choice. Unknown templates, unknown choices, and unknown actors produce distinct error codes.
4. **Visibility validation** — For each step, the actor's membership in the target contract's signatory and observer sets is checked.
5. **Authorization validation** — For each step, the actor's authorization as choice controller is checked. Multi-controller choices are marked UNSUPPORTED rather than approximated.
6. **Verdict aggregation and certificate generation** — Violations are aggregated with priority ordering (UNSUPPORTED > UNSAFE > SAFE). Passing workflows produce a deterministic SHA-256 certificate using canonical JSON serialization.

The CLI interface supports both human-readable and machine-readable (JSON) output, with configurable certificate output paths. Exit codes are mapped to specific failure categories for CI integration.

**Milestone 2** extends the engine with execution ordering validation — detecting temporal dependency violations where steps reference contract state that has not yet been produced by prior steps.

**Milestone 3** introduces direct DAR file parsing, eliminating the need for manual contract interface definition and enabling CCRE to operate directly on compiled Daml artifacts — the same artifacts that are deployed to Canton nodes.

**Milestone 4** focuses on ecosystem adoption, documentation, and integration patterns for institutional deployment.

### 3. Architectural Alignment

CCRE aligns directly with Canton's architecture and the constraints it introduces by design:

- **Privacy-first validation**: Canton's sub-transaction privacy model means visibility is not global — it is scoped per contract. CCRE's validation logic mirrors Canton's own visibility rules (`contractVisible = signatories ∪ observers`), making it architecturally native rather than an external approximation. CCRE models stakeholder-based visibility and treats dynamic divulgence conservatively — a contract is only considered visible if the actor is an explicit signatory or observer, not through runtime divulgence.
- **DAR-level operation**: CCRE operates on contract interfaces derived from Daml packages, the same compiled artifacts deployed to Canton nodes. Milestone 3 eliminates the abstraction layer entirely by parsing DAR files directly.
- **Multi-party composition focus**: Canton's unique value is coordinating workflows across independent institutions with privacy guarantees. CCRE validates exactly this — whether independently-authored applications compose correctly when orchestrated in a shared workflow.
- **Deterministic and auditable**: CCRE produces byte-identical output for identical inputs, making it suitable for integration into institutional governance and compliance workflows where reproducibility is required.
- **Protocol-adjacent safety layer**: CCRE introduces a safety layer analogous to admission controllers in Kubernetes or query planners in databases — it validates the correctness of a proposed operation before it reaches the execution engine. This positions CCRE as infrastructure, not tooling.
- **Complementary to existing proposals**: Where the Daml Package Analyzer (PR #130) identifies what cross-package interactions are structurally possible, CCRE validates whether a specific workflow's composition will execute correctly. These operate at different layers — package-level dependency mapping vs. workflow-level composition correctness — and are complementary. CCRE also complements execution and testing tools by validating workflows before they run, not after they fail.

### 4. Open-Source

CCRE is released as open-source software under the **MIT license**, making it freely available to the entire Canton ecosystem. All source code, test suites, documentation, and CI integration examples will be published and maintained in a public GitHub repository. Community contributions are welcome and encouraged.

### 5. Backward Compatibility

No backward compatibility impact. CCRE is a standalone analysis tool that reads contract interfaces and workflow intent as input. It does not modify Daml packages, Canton node configuration, or runtime behavior. It can be adopted incrementally alongside existing development workflows.

---

## Milestones and Deliverables

### Milestone 1: Core Validation Engine (MVP)

- **Estimated Delivery:** Complete (available now)
- **Focus:** Visibility and authorization validation with deterministic certificate generation
- **Deliverables / Value Metrics:**
  - CLI tool accepting contract interface JSON and workflow intent JSON
  - Visibility validation: `actor ∈ signatories ∪ observers` for every workflow step
  - Authorization validation: `actor == choice.controller` with UNSUPPORTED marking for multi-controller choices
  - Deterministic SHA-256 certificate generation with canonical JSON serialization
  - Structured diagnostic output with step-level violation identification and remediation guidance
  - Human-readable and machine-readable (JSON) output modes
  - Categorized exit codes for CI pipeline integration
  - Full test suite covering SAFE, UNSAFE, UNSUPPORTED, and error scenarios
  - Open-source MIT license

### Milestone 2: Execution Ordering Validation

- **Estimated Delivery:** 6 weeks from funding approval
- **Focus:** Temporal dependency analysis for workflow step ordering
- **Deliverables / Value Metrics:**
  - Detection of steps that reference contract state not yet produced by prior steps
  - Dependency graph construction for workflow steps
  - Cycle detection in workflow dependencies
  - Extended certificate including ordering validation results
  - Updated test suite and documentation

### Milestone 3: Direct DAR Parsing

- **Estimated Delivery:** 8 weeks from Milestone 2 completion
- **Focus:** Eliminate manual contract interface definition by parsing compiled Daml artifacts directly
- **Deliverables / Value Metrics:**
  - DAR file reader extracting template definitions, choice signatures, signatory/observer specifications, and interface implementations
  - Automatic contract interface generation from DAR packages
  - Support for multi-package DAR files with dependency resolution
  - Validation against real-world DAR files from Canton ecosystem projects
  - Integration guide for CI pipelines operating on DAR build output

### Milestone 4: Ecosystem Adoption and Integration

- **Estimated Delivery:** 8 weeks from Milestone 3 completion
- **Focus:** Production hardening, documentation, and adoption across Canton ecosystem participants
- **Deliverables / Value Metrics:**
  - CCRE validated against at least 5 real-world Canton deployment scenarios provided by Foundation member companies
  - Comprehensive documentation: getting started guide, CI integration patterns (including GitHub Actions example), certificate verification guide
  - Published npm package for direct installation
  - Feedback from adopting teams incorporated into tool refinement
  - Reference integration example with a Canton sample application

### Milestone Timeline

Milestones are sequential; each milestone begins after the prior milestone is complete and accepted.

| Milestone | Duration | Start | End |
|-----------|----------|-------|-----|
| M1: Core Validation Engine (MVP) | Complete | — | Delivered |
| M2: Execution Ordering Validation | 6 weeks | Upon funding approval | +6 weeks |
| M3: Direct DAR Parsing | 8 weeks | After M2 acceptance | +14 weeks |
| M4: Ecosystem Adoption and Integration | 8 weeks | After M3 acceptance | +22 weeks |

Total project duration: under 6 months from funding approval.

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone
- Demonstrated functionality against Canton workflow scenarios with correct verdict generation
- Deterministic certificate output verified across environments (same inputs produce byte-identical certificates)
- Documentation and knowledge transfer provided for each milestone
- For Milestone 3: successful DAR parsing validated against at least 3 distinct Daml package structures
- For Milestone 4: evidence of adoption by at least 5 Canton ecosystem participants with documented feedback

---

## Funding

**Total Funding Request:** 375,000 CC

### Payment Breakdown by Milestone

- Milestone 1 (Core Validation Engine — MVP): 50,000 CC upon committee acceptance of delivered working tool and test suite
- Milestone 2 (Execution Ordering Validation): 100,000 CC upon committee acceptance
- Milestone 3 (Direct DAR Parsing): 135,000 CC upon committee acceptance
- Milestone 4 (Ecosystem Adoption and Integration): 90,000 CC upon final release and acceptance

### Volatility Stipulation

The project duration is under 6 months. Should the project timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility.

---

## Co-Marketing

Upon release, the implementing entity will collaborate with the Foundation on:

- Announcement coordination for each milestone release
- Technical blog post explaining composition correctness as a distinct problem from execution correctness in Canton workflows
- Developer tutorial demonstrating CCRE integration into CI pipelines for multi-party workflow validation
- Case study documenting a real-world workflow validation scenario from Milestone 4 adoption

---

## Motivation

Multi-party workflow composition is the core value proposition of Canton Network. Every institutional deployment involves coordinating applications across independent parties with strict privacy boundaries. Today, validating whether those applications compose correctly requires deploying them and discovering failures at runtime — an expensive, risky, and time-consuming process.

CCRE makes composition validation a deterministic, pre-deployment step. This reduces integration timelines, eliminates classes of runtime failures, and produces auditable proof that workflows were validated before deployment. For regulated institutions, this auditability is not optional — it is a compliance requirement.

The immediate users are development and integration teams at institutions building multi-application workflows on Canton — teams that today validate composition through trial-and-error after deployment. CCRE integrates into their CI pipelines as a pre-deployment gate, catching visibility and authorization violations before they reach a running network.

The tool is designed as shared developer infrastructure. Any Canton participant building multi-party workflows benefits from pre-execution validation. As the ecosystem grows and more institutions deploy interconnected applications, the composition correctness problem compounds — making CCRE increasingly valuable over time.

---

## Rationale

Static analysis at the contract interface level allows CCRE to validate workflows without requiring a running Canton network, making validation fast, deterministic, and suitable for CI environments. This approach is the correct design for several reasons:

**Why static, not runtime:** Runtime validation discovers failures after they create operational impact. Static validation catches them before deployment, when the cost of correction is lowest. This aligns with established practices in software engineering (type checking, linting, formal verification) that have proven more effective than runtime-only validation.

**Why contract interfaces, not source code:** Daml source code can be refactored, abstracted, or generated. The contract interface — signatories, observers, controllers, choices — is the canonical specification of what a template permits. Validating against interfaces ensures CCRE checks what actually matters for composition correctness, regardless of how the Daml code is structured.

**Why deterministic certificates:** Institutional workflows require audit trails. A non-deterministic validation tool cannot serve as evidence in a compliance process. CCRE's canonical JSON serialization and SHA-256 hashing produce byte-identical certificates for identical inputs, making them suitable for governance integration.

**Why TypeScript:** The Canton developer ecosystem includes significant TypeScript/JavaScript usage for application frontends, automation scripts, and CI tooling. A TypeScript implementation integrates naturally into existing development workflows without requiring JVM infrastructure.

**Alternatives considered:**
- JVM-based tool (closer to Canton runtime): Rejected because it raises the adoption barrier for frontend-heavy teams and adds infrastructure requirements.
- Runtime validation middleware: Rejected because it discovers failures too late and cannot produce pre-deployment certificates.
- Daml-native validation: Rejected because it would require running a Canton node to validate, defeating the purpose of pre-deployment static analysis.
