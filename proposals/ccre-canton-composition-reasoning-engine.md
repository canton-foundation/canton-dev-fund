## Development Fund Proposal

**Author:** Vicky Prasad
**Status:** Draft
**Created:** 2026-03-27

---

## Abstract

Canton enables multi-domain workflows where contract execution, visibility, and conflict resolution depend on deployment topology — which parties are hosted on which domains via which participants. Code that is correct on a single domain can silently fail, block, or return wrong results when deployed across multiple synchronizers due to differences in party hosting, per-domain key scoping, and contract location.

Today, no pre-deployment tool evaluates a Daml package against a specific Canton topology to detect these failure modes. Developers discover them only at runtime — through hard crashes, silent incorrect state resolution, or stuck workflows — after deployment to a multi-domain environment.

CCRE (Canton Composition Reasoning Engine) is a topology-aware protocol safety checker that analyzes Daml-LF code together with deployment topology to identify where workflows violate Canton's multi-domain execution model — before they are deployed. It targets three orthogonal classes of failure not currently addressed by Canton's development toolchain:

1. **Stakeholder hosting violations** — a required party is not hosted on the execution domain, causing Canton's protocol to reject the transaction deterministically
2. **Cross-domain key ambiguity** — a key operation (fetchByKey, exerciseByKey) targets a key that is not unique across synchronizers, causing potential silent wrong-contract resolution when duplicate keys exist across domains
3. **Cross-domain contract reference risk** — a ContractId references a contract on a different domain than the execution context, requiring reassignment that may fail

A working MVP is available at [github.com/vickyshaw29/ccre](https://github.com/vickyshaw29/ccre).

---

## Specification

### 1. The Problem

Canton's value proposition is multi-party, multi-domain composability. But the moment a workflow crosses domain boundaries, three guarantees that developers rely on from single-domain development break:

**Key uniqueness is per-synchronizer, not global.** Canton 3.x deprecated Unique Contract Keys (UCK). A `fetchByKey @Bond ("issuer", bondId)` that works correctly on one domain may return a completely different contract on another domain — with no error signal. The developer has no compile-time or test-time indication that this is possible.

**Party hosting determines what can execute where.** Canton's protocol requires all stakeholders (signatories and observers) of a contract to be hosted on any domain where that contract can be operated on. If a key maintainer is not hosted on the execution domain, Canton rejects the transaction. If an observer is not on the target domain, reassignment to that domain is impossible. These are hard protocol constraints, not runtime warnings.

**Contract IDs are not guaranteed to be locally resolvable.** A ContractId refers to a contract on exactly one domain at a time. Operations that cross domain boundaries may require the contract to be reassigned — which requires all stakeholders to be on the target domain and depends on timing. Developers assume "if I have a ContractId, I can use it." Multi-domain Canton does not guarantee this.

Developers write and test on single domains. Everything passes. Production deployment spans multiple domains, and the system silently misbehaves or hard-fails. No tool in the current Canton toolchain — not the Daml compiler, not DLint, not the Canton runtime — addresses this gap before deployment.

### 2. CCRE's Three Core Checks

CCRE implements three orthogonal checks, each targeting a distinct class of multi-domain failure:

**CCRE-003 — Incomplete Stakeholder Hosting (CRITICAL)**
Detects when a stakeholder (signatory, observer, or key maintainer) of a template is not hosted on a domain where that template can be executed. This is a deterministic failure — Canton's protocol will reject the transaction or make reassignment impossible. Stakeholder hosting is a necessary condition for contract lifecycle operations; CCRE approximates this at the party-hosting level.

**CCRE-001 — Cross-Domain Key Ambiguity (CRITICAL)**
Detects when a key operation (fetchByKey, exerciseByKey, lookupByKey) uses a key that is not scoped to a single domain. Since Canton 3.x, key uniqueness is per-synchronizer only — the same key can exist on multiple domains pointing to different contracts. This causes potential silent wrong-contract resolution with no error signal when duplicate keys exist across domains.

**CCRE-010 — Cross-Domain Contract Reference Risk (HIGH)**
Detects when a choice body references a ContractId that may reside on a different domain than the execution context. This flags a structural pattern where cross-domain resolution is required but not guaranteed to succeed. The outcome depends on whether auto-reassignment succeeds, which itself depends on stakeholder hosting and timing.

Each check has a formally defined soundness boundary: CCRE-003 findings are deterministic (provable from protocol spec), CCRE-001 findings are demonstrable (provable if duplicate keys exist), CCRE-010 findings are conditional (structural risk that may or may not manifest).

### 3. How CCRE Works

CCRE takes two inputs: a contract model (currently JSON schema; direct DAR parsing planned for M3) and a topology configuration (JSON describing domains, participants, and party-to-domain mappings).

The analysis pipeline:
1. **Contract Model Loading** — Load contract interface definitions (M1–M2: JSON schema input; M3: direct DAR parsing of compiled Daml-LF packages)
2. **IR Construction** — Extract templates, choices, key operations, signatories, observers, and controller specifications
3. **Interaction Graph Construction** — Build a directed multigraph of cross-template operations (exercise, fetch, create edges) with interface expansion for Daml 2.x
4. **Topology Loading** — Parse deployment topology and validate it against the contract model (missing parties, empty domains, single-domain skip)
5. **Domain Inference** — Infer execution domains per template using topology config as ground truth, propagated through the interaction graph with a bounded 2-hop traversal (2-hop captures direct and one-level-indirect cross-template interactions, covering the majority of institutional composition patterns while keeping analysis tractable). When multiple domains are possible for a template, CCRE uses worst-case union of domains to preserve soundness.
6. **Check Execution** — Run CCRE-003, CCRE-001, and CCRE-010 against the inferred domains
7. **Cross-Suppression** — At the per-reference level, annotate (not suppress) overlapping findings between checks
8. **Decision** — Any CRITICAL finding → BLOCKED. Only HIGH → WARNING. Only INFO → PASS with notes.

The output is structured JSON suitable for CI pipeline integration, audit trails, and governance processes.

### 4. Relationship to Existing Tooling

CCRE operates at a different layer than existing analysis and testing tools in the Canton ecosystem. It does not replace them; it introduces topology-aware reasoning that is currently missing from the entire toolchain.

**Relationship to Certora's Daml Package Analyzer (PR #130):**
The Daml Package Analyzer provides visibility into cross-package interactions — mapping which templates and choices are used across package boundaries. This answers the question: "What interacts with what?"

CCRE builds on top of this by answering a fundamentally different question: "What breaks when this is deployed across domains?"

For example, a package may safely use `fetchByKey` in a single-domain deployment. The Package Analyzer will correctly report the cross-package interaction. However, when deployed across multiple synchronizers, the same code may return a different contract or fail entirely due to per-domain key uniqueness. This failure is not visible at the code or package level — it only emerges when code is evaluated together with deployment topology. CCRE introduces this missing layer.

**Relationship to DLint:**
DLint checks Daml code style and patterns. It has no awareness of domains, topology, or multi-synchronizer semantics. CCRE and DLint operate at entirely different layers — syntax vs protocol.

**Relationship to Canton Runtime:**
Canton's runtime rejects invalid transactions but provides no pre-deployment analysis. CCRE catches the same failures before deployment, when the cost of correction is lowest. This is the same relationship as a type checker to a runtime — both enforce correctness, but one operates at build time.

**Why not just use a cross-package analyzer?**
Cross-package analyzers operate purely at the code level and assume a single, consistent execution environment. Canton explicitly breaks this assumption: execution depends on domain boundaries, party-to-participant mappings, and synchronizer configuration. Many failure modes in Canton are not visible in the code itself. CCRE's core contribution is introducing topology as a first-class input to static analysis, enabling detection of failure modes that are invisible to code-only tools.

### 5. Open-Source

CCRE is released as open-source software under the **MIT license**. All source code, specifications, test suites, and documentation are published and maintained in a public GitHub repository. Community contributions are welcome and encouraged.

### 6. Backward Compatibility

No backward compatibility impact. CCRE is a standalone pre-deployment analysis tool. It does not modify Daml packages, Canton node configuration, or runtime behavior. It can be adopted incrementally alongside existing development workflows.

---

## Milestones and Deliverables

### Milestone 1: Core Validation Engine (MVP)

- **Estimated Delivery:** Complete (available now)
- **Focus:** Single-domain composition validation (visibility and authorization checks) with deterministic certificate generation, plus a working implementation of CCRE-003 (stakeholder hosting check) against multi-domain topology configuration. M1 validates local correctness — the structural foundation that M2's topology-aware analysis builds upon — and demonstrates multi-domain analysis with a fully functional `--topology` CLI path producing BLOCKED/PASS decisions.
- **Deliverables:**
  - CLI tool accepting contract interface JSON, workflow intent JSON, and optional topology configuration JSON (`--topology` flag)
  - Visibility validation (`actor ∈ signatories ∪ observers`) and authorization validation (`actor == choice.controller`)
  - CCRE-003: Working stakeholder hosting check against multi-domain topology configuration with full topology resolution pipeline (BLOCKED/PASS decisions, 5 dedicated test cases)
  - Deterministic SHA-256 certificate generation with canonical JSON serialization
  - Structured diagnostic output with step-level violation identification and Canton protocol impact messaging
  - Full test suite covering SAFE, UNSAFE, UNSUPPORTED, BLOCKED, PASS, and error scenarios (23 tests)
  - Open-source MIT license

### Milestone 2: Multi-Domain Topology Analysis Engine

- **Estimated Delivery:** 8 weeks from funding approval
- **Focus:** Implement the three core multi-domain checks (CCRE-003, CCRE-001, CCRE-010) against topology configuration. M2 will deliver CCRE-003 and domain inference first, followed by CCRE-001 and CCRE-010 in subsequent iterations within the milestone.
- **Deliverables:**
  - Interaction graph construction from Daml-LF with interface expansion
  - Domain inference algorithm with bounded 2-hop traversal
  - CCRE-003: Full stakeholder hosting check extended with interaction graph and domain inference (building on M1's working implementation)
  - CCRE-001: Cross-domain key ambiguity detection (key operations without domain scoping)
  - CCRE-010: Cross-domain contract reference risk detection
  - Reference-level cross-suppression between checks
  - Extended topology analysis pipeline integrating all three checks into the existing `--topology` CLI path
  - Test suite with multi-domain topology scenarios demonstrating each check

### Milestone 3: Direct DAR Parsing

- **Estimated Delivery:** 8 weeks from Milestone 2 completion
- **Focus:** Eliminate manual contract interface definition by parsing compiled Daml artifacts directly
- **Deliverables:**
  - DAR file reader extracting Daml-LF (template definitions, choice signatures, signatory/observer specifications, key definitions, interface implementations)
  - Automatic IR construction from DAR packages
  - Support for multi-package DAR files with dependency resolution
  - Expression traversal for choice bodies (exercise, fetch, create, lookupByKey, exerciseByKey, fetchByKey)
  - Validation against real-world DAR files from Canton ecosystem projects
  - Integration guide for CI pipelines operating on DAR build output

### Milestone 4: Ecosystem Adoption and Integration

- **Estimated Delivery:** 8 weeks from Milestone 3 completion
- **Focus:** Production hardening, documentation, and adoption across Canton ecosystem participants
- **Deliverables:**
  - CCRE validated against at least 5 real-world Canton deployment scenarios provided by Foundation member companies
  - Comprehensive documentation: getting started guide, topology configuration guide, CI integration patterns (GitHub Actions example), finding interpretation guide
  - Published npm package for direct installation
  - Feedback from adopting teams incorporated into tool refinement
  - Reference integration example with a Canton sample application

### Milestone Timeline

| Milestone | Duration | Start | End |
|-----------|----------|-------|-----|
| M1: Core Validation Engine (MVP) | Complete | — | Delivered |
| M2: Multi-Domain Topology Analysis | 8 weeks | Upon funding approval | +8 weeks |
| M3: Direct DAR Parsing | 8 weeks | After M2 acceptance | +16 weeks |
| M4: Ecosystem Adoption | 8 weeks | After M3 acceptance | +24 weeks |

Total project duration: under 6 months from funding approval.

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone
- For Milestone 2: each of the three core checks demonstrated with a concrete multi-domain scenario that produces a correct finding, plus a false positive analysis showing the check does not fire on correctly-configured topologies
- For Milestone 3: successful DAR parsing validated against at least 3 distinct Daml package structures from the Canton ecosystem
- For Milestone 4: evidence of adoption by at least 5 Canton ecosystem participants with documented feedback
- Deterministic output verified across environments (same inputs produce identical results)
- Documentation and knowledge transfer provided for each milestone

---

## Funding

**Total Funding Request:** 375,000 CC

### Payment Breakdown by Milestone

- Milestone 1 (Core Validation Engine — MVP): 50,000 CC upon committee acceptance of delivered working tool and test suite
- Milestone 2 (Multi-Domain Topology Analysis): 135,000 CC upon committee acceptance
- Milestone 3 (Direct DAR Parsing): 100,000 CC upon committee acceptance
- Milestone 4 (Ecosystem Adoption): 90,000 CC upon final release and acceptance

### Volatility Stipulation

The project duration is under 6 months. Should the project timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility.

---

## Co-Marketing

Upon release, the implementing entity will collaborate with the Foundation on:

- Announcement coordination for each milestone release
- Technical blog post: "Works in Dev, Breaks in Production — How CCRE Catches Multi-Domain Failures Before Deployment"
- Developer tutorial demonstrating CCRE integration into CI pipelines with topology validation
- Case study documenting a real-world multi-domain failure scenario caught by CCRE from Milestone 4 adoption

---

## Motivation

Multi-domain deployment is the future of Canton. Canton 3.x deprecated global key uniqueness. DTCC, Digital Asset, and institutional participants are building workflows that span multiple synchronizers. Every team deploying across domains faces the same gap: code that passes all tests on a single domain can fail or silently misbehave in production.

This is not a hypothetical problem. It follows directly from Canton's protocol design:
- Per-synchronizer key scoping means key operations are ambiguous across domains
- Party hosting requirements mean transactions fail if stakeholders are missing from execution domains
- Contract reassignment depends on all stakeholders being on the target domain

No tool in the current Canton development toolchain catches any of these before deployment. The Daml compiler does not know about topology. DLint does not know about domains. The Canton runtime discovers failures only after they occur. CCRE fills this gap by making topology a first-class input to pre-deployment analysis.

The immediate users are development and integration teams at institutions deploying multi-domain workflows on Canton. As the ecosystem grows and more institutions deploy across multiple synchronizers, the multi-domain correctness problem compounds — making CCRE increasingly valuable over time.

CCRE is designed as shared developer infrastructure — open-source from day one, milestone-based delivery, minimal scope focused on the three highest-impact failure classes. The tool is scoped tightly to what can be verified with high confidence from static analysis, with explicit soundness boundaries stating what CCRE does and does not guarantee.

---

## Rationale

**Why topology-aware, not code-only:** The failure modes CCRE detects do not exist in the code itself. They emerge when code is evaluated against a specific deployment topology. A `fetchByKey` that is perfectly safe on one domain becomes a silent correctness bug when the same key exists on another domain. No amount of code analysis alone can detect this — the topology must be an input.

**Why static, not runtime:** Runtime validation discovers failures after they create operational impact. Static validation catches them before deployment, when the cost of correction is lowest. For institutional deployments involving regulated counterparties, discovering a stakeholder hosting violation in production is orders of magnitude more expensive than catching it in CI.

**Why these three checks:** CCRE-003, CCRE-001, and CCRE-010 were selected from an initial set of 10 candidate checks through systematic protocol analysis. The remaining 7 were eliminated because they could not produce concrete, demonstrable failure scenarios grounded in Canton's protocol specification. The three selected checks each target a distinct, independent failure class with a formally defined soundness boundary. Every finding is traceable back to a specific Canton protocol constraint.

**Why TypeScript:** The Canton developer ecosystem includes significant TypeScript/JavaScript usage for application frontends, automation scripts, and CI tooling. A TypeScript implementation integrates naturally into existing development workflows without requiring JVM infrastructure. Milestone 3 (DAR parsing) may require a Scala/JVM component for Daml-LF extraction, which will be provided as a pre-processing step.

**Alternatives considered:**
- JVM-based tool (closer to Canton runtime): Rejected because it raises the adoption barrier for frontend-heavy teams.
- Runtime validation middleware: Rejected because it discovers failures too late and cannot produce pre-deployment analysis.
- Extending DLint: Rejected because DLint operates at the syntax level and has no architecture for topology-aware analysis.
- Extending the Daml compiler: Rejected because topology is a deployment concern, not a compilation concern — coupling them would violate separation of concerns.