# Development Fund Proposal

| Field | Value |
| --- | --- |
| **Author** | Noders LLC |
| **Org** | Noders LLC (https://noders.team/) |
| **Status** | Submitted |
| **Created** | 2026-08-12 |
| **Label** | `daml-tooling` |
| **SIG** | Daml Language & Developer Tooling (`daml-tooling`) |
| **Champion** | Curtis Hrischuk, Digital Asset (@hrischuk-da) |

---

## Abstract

DamlForge is an exploratory project to determine whether a safe, useful Pythonic language for authoring Canton smart contracts can be designed. This grant funds an open-source proof of concept, focused technical experiments across five key semantic areas — composability, authorization, smart contract upgrading, contract keys, and interfaces — and structured community alignment to evaluate the direction before committing to production development.

The PoC compiles Pythonic source into readable DAML source, which is then validated by the standard DAML toolchain. All authorization, privacy, and upgrade guarantees remain enforced by the existing Canton infrastructure — DamlForge adds a new surface layer, not a new runtime.

The final outcome will be either a credible, community-reviewed design and scoped follow-up proposal, or a documented conclusion that the approach is not workable — with the technical reasons and reusable findings made public for the ecosystem.

---

## Specification

### 1. Objective

**Problem:** DAML's syntax and functional programming model create an initial learning barrier for developers coming from mainstream ecosystems, particularly Python, which is dominant in data engineering, quant finance, financial modeling, and applied cryptography. A Pythonic contract-authoring language could significantly lower the barrier to Canton adoption — but only if it preserves DAML's authorization, privacy, upgrade, and composition guarantees.

The ecosystem does not yet have sufficient evidence or alignment to decide what such a language should look like, which Python features it should support, or how its semantics should map safely to DAML. No existing tool or PoC addresses this question.

**Outcome:** A bounded, evidence-based answer to the question: *Can a Pythonic DAML contract language be built safely?*

Specifically, the project will:

1. Define and implement a minimal Pythonic contract language PoC.
2. Demonstrate end-to-end compilation and execution through the standard DAML/Canton development toolchain.
3. Experiment with and document possible solutions for five key semantic areas: composability, authorization, smart contract upgrading, contract keys, and interfaces.
4. Demonstrate deterministic generation of readable and auditable DAML source.
5. Gather structured feedback from Digital Asset and the wider DAML/Canton community.
6. Produce a clear go/no-go recommendation and, if appropriate, a follow-up implementation plan.

**Success looks like:**

- The Canton community has clear, publicly available evidence to evaluate whether a Pythonic DAML surface is viable.
- Python-familiar developers can inspect the PoC and assess whether it fits their workflow.
- Digital Asset and independent reviewers have formally engaged, and their feedback is publicly logged.
- All five design areas have working reference examples with documented conclusions — positive, negative, or unresolved.

---

### 2. Implementation Mechanics

The PoC compilation path is:

```
Pythonic source → AST + semantic model → readable DAML source → standard DAML compiler
```

Generated DAML must be deterministic, formatted consistently, suitable for human review, and usable with the normal DAML build, test, package, and upgrade tooling. The standard DAML compiler remains the source of truth for correctness.

#### Language Subset

The initial Pythonic language will be deliberately small and statically constrained. It will not execute arbitrary Python. The PoC will support enough functionality to evaluate the design:

- Typed records, enums, variants, ensure clause and functions.
- Templates with explicit signatories and observers.
- Consuming and nonconsuming choices with explicit controllers.
- Template invariants.
- Create, fetch, exercise, and archive operations.
- Contract keys and maintainers.
- Interfaces, interface choices, and interface instances.
- Imports or references needed to compose with handwritten DAML packages.
- Two versions of at least one package to explore SCU compatibility.

The implementation may use Python-compatible syntax and parsing, but DamlForge defines the accepted language subset and semantics.

#### Error Handling and Diagnostics

A key quality bar for the PoC is that error messages trace back to Pythonic source, not to generated DAML internals:

- Catch syntax and unsupported-subset errors directly in the Pythonic parser.
- Catch local name and basic type errors directly in the semantic model.
- Catch malformed template, choice, key, and interface declarations directly.
- Produce deterministic generated DAML.
- Generate a line/column source map (Pythonic source ↔ generated DAML).
- Parse common DAML build diagnostics and remap compiler errors to the originating Pythonic declaration.
- Map runtime template/choice failures through a build manifest.
- Keep raw DAML diagnostics available under a verbose/debug option.

#### Key Design Questions

The PoC explicitly investigates five semantic areas:

**1. Composability**
- Can generated contracts import and use handwritten DAML packages?
- Can handwritten DAML packages safely depend on generated packages?
- How are DAML modules, package names, dependencies, types, and interfaces represented?
- Can DamlForge use existing Token Standard and other interface DARs without reproducing them?
- Where should the boundary lie between Pythonic source and native DAML?

**2. Authorization**
- How must signatories, observers, controllers, and maintainers be expressed?
- Which declarations must always remain explicit?
- Can the type system reject ambiguous authorization before code generation?
- How are authorization failures mapped back to Pythonic source locations?
- How can generated code remain understandable and auditable by DAML developers?

Authorization will not be inferred silently in the PoC.

**3. Smart Contract Upgrading**
- How are DamlForge language versions and generated package versions related?
- Can two versions of a Pythonic contract compile into SCU-compatible DAML packages?
- Which source changes are safe, unsafe, or require migration?
- How stable must generated names, field ordering, modules, and package metadata remain?
- Can the standard upgrade tooling validate generated packages without special treatment?

**4. Contract Keys**
- How are key types, key expressions, and maintainers declared?
- Can the Pythonic type system enforce key and maintainer constraints?
- How are lookup-by-key, fetch-by-key, and exercise-by-key represented?
- How are key-related compiler errors mapped to Pythonic source?

**5. Interfaces**
- How are interface definitions, view types, choices, and implementations represented?
- Can generated templates implement interfaces defined in external DARs?
- Can handwritten DAML implement an interface generated by DamlForge?
- How are interface casts and interface choice exercises expressed?

---

### 3. Architectural Alignment

DamlForge sits entirely in the developer tooling layer — above Canton protocol and below application code. It introduces no changes to the Canton synchronizer, ledger APIs, Admin API, Topology Manager, or any existing infrastructure component.

The compilation path is designed to preserve Canton's existing trust guarantees:

- **Standard toolchain as arbiter:** DamlForge generates readable DAML source and delegates all correctness decisions to the standard DAML compiler. There is no separate runtime, no bypass of DAML's type system, and no modification to how contracts are executed on Canton.
- **Authorization stays explicit:** The PoC prohibits silent authorization inference. Signatories, observers, controllers, and maintainers must be declared visibly in Pythonic source — the generated DAML makes these declarations traceable for auditors.
- **SCU compatibility by design:** DamlForge's field ordering, naming, and module structure rules are designed to produce packages that work with the standard DAML upgrade tooling. Generated packages do not require special treatment by validators or synchronizers.
- **Composability with the ecosystem:** The PoC explicitly tests interoperability with handwritten DAML packages, the Canton Token Standard, and external DARs — ensuring DamlForge output integrates with the existing ecosystem rather than fragmenting it.

This proposal is labeled `daml-tooling` and aligns with the Development Fund's priority of lowering barriers to Canton development. It complements — rather than competes with — DAML Studio, DPM, and the standard DAML compiler. The motivation to broaden Canton's developer base to Python-familiar teams is consistent with the fund's goal of increasing Canton's long-term utility and resilience.

Noders operates an active Super Validator node and Featured Application on the Canton Network. That operational experience — running contracts through production SCU cycles, managing topology, and observing ledger behavior — directly informs the design decisions this PoC must get right around upgrades, keys, and composability.

---

### 4. Backward Compatibility

No backward compatibility impact.

DamlForge is a new, standalone tool. It generates standard DAML source code which is then compiled by the existing DAML SDK. No Canton protocol changes, no ledger API changes, no modifications to the synchronizer, and no impact on existing DAML packages or applications are required.

Teams currently using DAML are unaffected. Any DAML package generated by DamlForge is subject to the same standard DAML SCU rules as any other package — no special handling by validators is needed.

---

## Milestones and Deliverables

### Milestone 1: PoC, Semantic Experiments, Community Alignment, and Final Recommendation

**Estimated Delivery:** 8 weeks from grant approval

**Focus:** Deliver a working, publicly available PoC and design corpus that gives the Canton community an evidence-based answer to the question of whether a Pythonic DAML contract language is technically viable and worth production investment.

**Deliverables / Value Metrics:**

*Repository and core implementation:*
- Public Apache-2.0 repository.
- Language goals, non-goals, and initial syntax specification.
- Minimal parser, semantic model, and compiler pipeline.
- End-to-end example covering a template, signatory, observer, choice, controller, invariant, and contract creation.
- Generated DAML that builds with the DAML SDK version agreed with the champion prior to implementation start.
- Error diagnostics that trace back to Pythonic source locations (line/column source map).

*Semantic coverage across five areas:*
- Reference examples covering all five key areas: Composability, Authorization, SCU upgrading, Contract keys, Interfaces.
- At least one generated package that composes with handwritten DAML.
- At least one generated template implementing an interface from an external package.
- Two package versions evaluated with standard DAML upgrade tooling.
- Positive and negative examples showing which constructs are accepted or rejected.
- Design note for each area describing the approach, limitations, alternatives, and unresolved questions.

*Community engagement:*
- Public draft design document and demonstrable PoC.
- At least two structured design-review sessions with Digital Asset and independent DAML/Canton developers.
- Public feedback log showing accepted, rejected, and unresolved recommendations.
- Updated syntax, semantics, examples, and design documents based on review.

*Final deliverables:*
- Explicit identification of any blocking issue that would make the project unworkable.
- Final technical report.
- Final PoC release with reproducible demonstration.
- Requirements and constraints for a production-quality implementation (if positive).
- Go/no-go decision supported by technical evidence and community feedback.
- If positive: a scoped roadmap and milestone outline for a separate production implementation grant.

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for the milestone.
- Demonstrated functionality or operational readiness.
- Documentation and knowledge transfer provided.
- Alignment with stated value metrics.

**Project-specific conditions:**

1. **Community has an evidence-based answer.** All five design areas have publicly available design notes with documented conclusions — working, not workable, or unresolved with specific technical reasons. A reviewer unfamiliar with the PoC can read the design notes and form an independent opinion.

2. **External review has occurred.** At least two structured design-review sessions have taken place. The feedback log is public and shows that recommendations from Digital Asset and independent reviewers were considered, with the disposition (accepted, rejected, or deferred) documented for each point.

3. **The PoC is reproducible.** The final release can be built and run by an independent developer following the published instructions, producing the same generated DAML output.

4. **Go/no-go is supported, not asserted.** The final recommendation cites specific technical evidence from the experiments — not opinions. If negative, the documented reasons are specific enough that a future team does not need to repeat the same investigation.

---

## Funding

**Total Funding Request: 600,000 CC**

### Payment Breakdown by Milestone

| Milestone | Description | Payment |
| --- | --- | --- |
| M1 | PoC, Semantic Experiments, Community Alignment, Final Recommendation | 600,000 CC upon committee acceptance |

Full payment is made upon milestone completion and acceptance, consistent with standard Development Fund terms.

### Engineering Effort Estimate

| Workstream | Estimated Hours |
| --- | --- |
| Parser, AST, and Python-subset grammar | ~120 hours |
| Semantic model and type system | ~100 hours |
| Code generation pipeline (Pythonic → readable DAML) | ~80 hours |
| Semantic experiments across 5 design areas | ~130 hours |
| Community review sessions, feedback incorporation, public draft | ~50 hours |
| Design notes (×5), syntax specification, final technical report | ~80 hours |
| PoC release, examples, reproducible demo | ~40 hours |
| **Total** | **\~600 hours** |

### Volatility Stipulation

The project duration is under 6 months. Should the timeline extend beyond 6 months due to Committee-requested scope changes, any remaining portion must be renegotiated to account for significant USD/CC price volatility.

### Co-Marketing

Upon milestone completion and release, Noders LLC will collaborate with the Foundation on:

- Announcement coordination for the PoC release and final report.
- A technical blog post: *"DamlForge: Exploring Pythonic Smart Contracts for Canton — What We Learned."*
- A short demonstration video or walkthrough suitable for developer-facing channels.
- Sharing findings through Canton community channels (forum, mailing list, Discord) to maximize ecosystem benefit from the investigation, regardless of the go/no-go outcome.

---

## Motivation

DAML's type system and functional programming model are technically well-suited to financial contracts, but they present a significant onboarding barrier for developers coming from mainstream languages — particularly Python, which is dominant in quantitative finance, data engineering, and applied cryptography. These are exactly the verticals Canton is targeting.

A Pythonic contract-authoring language could make Canton development more approachable for this audience. But this is only valuable if it preserves DAML's authorization, privacy, upgrade, and composition guarantees. A Pythonic surface that silently weakens those guarantees would be worse than no surface at all.

The ecosystem does not yet have sufficient evidence to decide what such a language should look like. A bounded PoC and design process is the appropriate first step before committing to production development.

**Who benefits:** Python-familiar developers evaluating Canton as a target platform — a segment that currently faces the highest adoption friction. Noders has run two seasons of HackCanton with 29+ projects and directly observed this barrier: teams familiar with Python or mainstream OOP languages need substantially more time to understand DAML's authorization model than teams with functional programming backgrounds.

**What the ecosystem gains regardless of outcome:** If positive, a clear design and a scoped follow-up implementation grant. If negative, documented technical findings that prevent other ecosystem teams from investing in the same dead end — a concrete contribution to collective knowledge even without a shipped product.

---

## Rationale

**Why a PoC before a production compiler?**

Language design is high-risk and expensive to reverse. Committing to a production Pythonic-DAML compiler before knowing whether Pythonic semantics can safely encode DAML's authorization model — particularly around signatories, controllers, and SCU compatibility — would be premature. An 8-week bounded PoC is the responsible path: it answers the core design questions at a fraction of the cost of a failed production attempt.

**Why does nothing like this exist yet?**

The closest prior work is DAZL (the Python DAML ledger client), which enables Python applications to *interact with* Canton contracts via the Ledger API. DamlForge is categorically different: it is about *authoring* Canton contracts in a Pythonic syntax, not interacting with them. No existing tool, PoC, or proposal addresses this problem.

**Why Noders?**

Noders has been active in the Canton ecosystem for approximately one year. We operate a Super Validator node and Featured Application on the Canton Network, have shipped the Go DAML SDK (used by multiple ecosystem teams, including during HackCanton S1 and S2), and have run two hackathon seasons with 29+ projects. That combination — production operational experience, DAML SDK development, and direct exposure to the Canton developer onboarding problem — gives us the context to make the right design decisions for a project like DamlForge.

The Go DAML SDK grant (2026-03, Approved) demonstrated that Noders delivers: the SDK was shipped before the grant was submitted, the proposal was funded, and milestones are actively in progress. We apply the same approach here: a clearly scoped, technically grounded deliverable with explicit go/no-go discipline.

---

## Non-Goals

This eight-week grant will not deliver:

- A production-ready compiler or stable language.
- Support for arbitrary Python.
- Complete DAML language coverage.
- A replacement for DAML Studio, DPM, or the DAML compiler.
- Production deployment automation or guarantees of mainnet-ready output.
- Long-term SDK compatibility guarantees.
- A commitment to a follow-up grant before technical and community alignment is achieved.

---

## Deliberately Restricted or Unsupported Features

| **Native DAML capability** | **Pythonic** | **PoC status** |
| --- | --- | --- |
| Direct recursion | `def loop(x): return loop(x)` | Not supported |
| Indirect recursion | `a() → b() → a()` | Not supported |
| Infinite loop | `while True: ...` | Not supported |
| Runtime-unbounded loop | `while condition: ...` | Not supported |
| Fixed bounded loop | `for i in range(10): ...` | Supported |
| Variable bounded loop | `for i in range(count, bound=100): ...` | Supported with explicit maximum |
| Arbitrary list traversal | `for item in values: ...` | Restricted by declared bound or approved operation |
| Higher-order function | Function passed as a runtime value | Not supported |
| Approved collection operation | `map`, `filter`, `fold` from DamlForge library | Supported only through an allowlist |
| Arbitrary polymorphism | `def identity[A](value: A) -> A:` | Restricted |
| Container generics | `Optional[A]`, `list[A]`, `ContractId[T]` | Supported |
| User-defined type class | Custom protocol/type class | Not supported |
| User-defined type-class instance | Custom protocol implementation | Not supported |
| Operator overloading | `__add__`, `__eq__`, etc. | Not supported |
| Function overloading | Same function name, different arguments | Not supported |
| Implicit conversion | Automatic conversion between semantic types | Not supported |
| Explicit conversion | `convert(value, TargetType)` | Supported |
| Wildcard import | `from module import *` | Not supported |
| Dynamic import | `importlib.import_module(...)` | Not supported |
| Unrestricted external package | Arbitrary package import | Not supported |
| Locked dependency | Declared package/DAR with fixed identity | Supported |
| Dynamic typing | `Any` and runtime duck typing | Not supported |
| Untyped public declaration | `def calculate(value): ...` | Not supported |
| Typed public declaration | `def calculate(value: Decimal) -> Decimal:` | Supported |
| Reflection | `getattr`, `setattr`, arbitrary `type()` | Not supported |
| Metaprogramming | Metaclasses and runtime decorators | Not supported |
| Runtime code generation | `eval`, `exec`, dynamic AST execution | Not supported |
| Arbitrary Python library | Filesystem, network, process, environment APIs | Not supported |
| Mutable shared state | Global or class-level mutable variables | Not supported in contract logic |
| Collection mutation | `items.append(...)`, `mapping[key] = value` | Not supported in contract logic |
| Immutable construction | New list, record, map, or contract value | Supported |
| Arbitrary hidden authorization helper | Controller/signatory hidden behind unrestricted function | Restricted |
| Explicit authorization | Visible signatory, observer, controller, maintainer expression | Supported |
| Untyped contract identifier | Plain string contract ID | Not supported |
| Typed contract identifier | `ContractId[Asset]` | Supported |
| `AnyContractId` | `ContractId[Any]` | Not supported initially |
| Raw DAML fragment | `daml("...")` | Not supported |
| User-controlled generated name | Arbitrary emitted DAML identifier | Not supported |
| Automatic field reordering | Generator changes declaration order | Prohibited |
| Source field ordering | Preserve original declaration order | Required |

---

## Follow-Up

If the PoC demonstrates technical feasibility and sufficient ecosystem alignment, a separate proposal will cover production implementation, compatibility commitments, security review, documentation, adoption, and long-term maintenance.

If the PoC concludes that the approach is not workable, the final technical report and documented findings will be submitted as the deliverable. The ecosystem benefit is the same: a concrete, evidence-based answer replaces ongoing uncertainty.

