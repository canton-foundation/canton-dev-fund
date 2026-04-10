# Development Fund Proposal - DamlSec: Automated Security Analysis of DAML Contracts via Symbolic Execution

**Author:** Neville Grech, Dedaub
**Status:** Draft
**Created:** 2026-04-09
**Label:** `daml-tooling`
**Champion:** Need Champion

---

## Abstract

DAML contracts securing trillions of dollars of institutional assets on Canton
have virtually no automated adversarial security tooling. Manual audits do not
systematically enumerate all paths through contract logic or prove that
authorization, conservation, and arithmetic properties hold across every
feasible execution. DamlSec fills this gap with a symbolic execution engine
purpose-built for DAML-LF, Canton's typed intermediate representation. 

The engine executes contracts symbolically - treating inputs, party identities,
and ledger state as unknown quantities - and uses a two-tier SMT strategy: a
**pure-Scala theorem prover** called from the hot loop to quickly prune
infeasible paths, and CVC5 at terminating paths to discharge the heavier
security property obligations and extract concrete counterexamples. CVC5
support is fully implemented but its native dependency is optional in the
build, so DamlSec can be distributed and run with the inner prover alone for
environments where ease of installation is paramount. The inner prover
decides quantifier-free linear integer arithmetic with uninterpreted functions
(QF_LIA + UF) - precisely the fragment that DAML security obligations
generate: party identity comparisons, authorization set membership, amount
conservation equalities. Being pure Scala and JVM-native, it has zero FFI
overhead and no native-library fragility, making it faster than architectures
employing external solvers and much easier to distribute along the standard
DAML toolchain.

Dedaub brings directly applicable depth to this project: our team has audited
multiple Canton/DAML projects, has senior staff with extensive Haskell and
Scala production experience, and a strong background in program analysis, as
evidenced by our publication track record and static analysis tools in the
Ethereum space. We already have a working prototype which executes for simple
DAML-LF programs. This proposal funds the development of the project, security
property coverage, and open-source release. Dedaub commits to maintaining the
project for two years post-completion. The tool is implemented in Scala, the
same language as the Canton node, the Speedy interpreter, and the broader
Digital Asset stack, ensuring it is easy for the community to understand,
contribute to, and extend.

---

## Specification

### 1. Objective

DAML's type system and authorization model prevent whole categories
of smart contract vulnerability present in Solidity. But they do not prevent
everything. Dedaub's audit work on Canton projects documented 
recurring vulnerability classes that do not produce compilation errors; they are
logic errors that require reasoning about all feasible execution paths
simultaneously. No currently available tool does this for DAML.

We propose `DamlSec`, a command-line tool and library that ingests a
compiled `.dar` file, symbolically executes the choices of each template, and
automatically reports violations of security properties. The tool is fully
automated - no annotations or specifications are required from the developer. It
reports findings with counterexample assignments of concrete values that trigger
the violation, making results immediately actionable. The tool will be open
sourced and can be easily integrated into the DAML SDK workflow via
`damlc`-compatible input, and documented for use by DAML developers, auditors,
and security researchers.

---

### 2. Implementation Mechanics

#### 2.1 Architecture Overview

The implementation has three components, each directly reusing or extending existing Canton/DAML infrastructure.

```
.dar file
  └─► DAR Parser (Digital Asset's existing Scala library)
        └─► Package: (Ast.scala types)
              └─► Speedy Compiler  (Compiler.scala, unchanged)
                    └─► SExpr (closure-converted ANF form)
                          └─► DamlSec Symbolic Engine
                                ├─► SymState machinery and harness
                                ├─► Pure-Scala theorem prover (QF_LIA + UF;
                                │    fast path pruning, NNF, simplification)
                                ├─► CVC5 (end-of-path - full theory; security
                                │       property obligations + counterexamples;
                                │       native dep optional in build)
                                └─► Security Property Checkers
                                      └─► Findings report (JSON + human-readable)
```

#### 2.2 Reusing the Speedy Compiler Pass

The Daml compiler's `Speedy.Compiler` translates `Ast.Expr` (the raw AST) into
`SExpr`, a closure-converted, ANF-normalized form. This pass is
production-grade, covers the full DAML-LF expression language, and is already
tested against the complete DAML standard library and ecosystem
contracts. DamlSec takes it as a library dependency without modification. This
infrastructure is a very expensive engineering component in any static analysis
or symbolic execution engine for a functional language, and unlike other
approaches will not be re-implemented.

#### 2.3 The Symbolic Execution Engine

The engine is a direct generalization of Speedy's execution model. Speedy
maintains a machine state that is concrete and mutable. DamlSec replaces the
concrete `SValue` domain with a symbolic `SymValue` domain and the single
mutable machine state with tens of millions viable symbolic states. We make
heavy use of persistent data structures - (e.g., HAMTs) and
libraries such as Bifurcan - so that forking a state at a branch point shares
the bulk of the data rather than copying it, keeping memory and allocation
cost proportional to the actual divergence between paths rather than the total
state size. In addition `SymValue` is a much more complex structure than the
`SValue` structure using in DAML's reference implementation, and internally
reflects symbolic formulae that are ameanable to lightweight theorem proving.

Our current prototype couples symbolic values directly with the inner
prover's own term and formula types rather than a custom AST, in order to
piggy-back on its built-in simplifier (constant folding, NNF rewriting,
identity elimination, linear-arithmetic canonicalization) for free, on the
same JVM, in the same call chain as the symbolic interpreter.

Inputs to a choice (the `arg` payload, the `self` contract, the `caller` party)
are initialized as fresh symbolic constants of the appropriate sort, constrained
only by the template's `ensure` clause (which is checked at creation time and
encoded as a path condition assumption).

The engine processes a worklist of viable `SymState` values, and implements a
symbolic semantics of `SExpr`.

DamlSec intends to use a deliberate two-tier SMT approach, exploiting the
structural difference between path pruning (very high frequency, must be
sub-millisecond) and optional property verification (low frequency). To achieve
a high frequency SMT capability, we use a prover optimized for QF_LIA +
UF (a simple logic, but one that very fast to discharge). The astute reader
might point out that DAML arithmetic includes multiplication and integer
division, which take us out of pure linear 
arithmetic. DamlSec resolves this by encoding these as uninterpreted
functions. This is *sound* for the path-pruning use case: an
uninterpreted-function abstraction may fail to prune some infeasible paths that
a richer theory would have caught, but it never incorrectly prunes a feasible
path (no soundness loss). We also note that in practice, the bulk of DAML security-relevant
feasibility is expressible within this logic authorization set membership, amount
conservation comparisons, party identity.

For the Outer tier SMT, we're planning to use CVC5, which in the context of a
Scala-based application is easier to maintain.

Finally, time-permitting an optional abstract-interpretation based analysis
using declarative program analysis techniques over the program can identify
which templates and choices can reach a security-sensitive operation (sinks),
pruning unexplored paths away from sinks.

All of these architectural choices are deliberate - in order for DamlSec to be a
practical, long-lasting tool it needs to be designed with more requirements in
mind that what we normally assume: scaling to
large programs, support the entirety of DAML semantics, with zero or very few
false positives. It needs to be easy to distribute and run, and be written using
the same technologies as the rest of the DAML toolchain so as to attract people
from the community to contribute and maintain it.


#### 2.4 Security Property Checkers

Multiple security detectors will be implemented as observers on the symbolic
effect trace, evaluated at the end of each terminating path. As an informal
illustration of the kinds of properties DamlSec will check:

- **Conservation.** When a contract transfers, splits, or merges value-bearing
  assets, the total amount in must equal the total amount out on every path. A
  conservation detector flags any execution where the symbolic engine can
  produce a path that creates assets out of nothing or silently destroys them,
  often a sign of a sloppy split/merge or an unguarded edge case.
- **Authorization.** Every contract action in DAML must be authorized by a
  specific set of parties. An authorization detector checks that every
  reachable creation, exercise, or archival is genuinely backed by the
  signatories the template demands - catching cases where a path lets one
  party act unilaterally on something that should require several.
- **Arithmetic safety.** Detects paths along which a division by zero, an
  overflow, an underflow, or a material rounding discrepancy can be triggered
  with reachable inputs. Rounding is especially relevant in DAML's financial
  domain: composed integer divisions in share calculations, fee splits, and
  pro-rata distributions can silently compound truncation errors into
  economically significant discrepancies. The symbolic engine reasons about
  the actual constraints on inputs, so this is much more precise than
  syntactic pattern matching for unguarded arithmetic.
- **Privacy / divulgence.** Flags paths along which a contract exposes data
  to a party that should not have visibility into it, an issue specific to
  DAML's per-party privacy model.
- **Key and maintainer consistency.** For templates that use contract keys,
  checks that the maintainers of every key are also signatories on every
  creation path, preventing classes of key/state desync bugs.

Each checker is a simple Scala function. Many more can be added, removed, or
overridden independently. The architecture is open for community contribution of
new detectors without modifying the engine core.

#### 2.5 Output Format

Findings are reported as structured JSON (for CI/audit tooling integration) and
human-readable text. Each finding includes: the template name, choice name,
detector name, the violating property as a readable formula, and a
**counterexample** - when CVC5 is present, a concrete assignment of symbolic
variables (contract field values, choice argument values, party identities),
demonstrating exactly what input triggers the violation. Without CVC5, the
inner prover still produces models for the linear-arithmetic fragment,
covering the majority of findings.

#### 2.6 Tooling Integration

DamlSec is going to be packaged as:
- A standalone CLI: `damlsec analyze MyContracts.dar`
- A Scala library (Maven/Gradle artifact) for programmatic integration in audit pipelines
- A GitHub Actions workflow template for CI integration

---

### 3. Architectural Alignment

DamlSec is structurally aligned with the Canton/DAML stack in a way that no alternative approach could achieve.

**Same runtime model.** It piggybacks on the production DAML-LF runtime
system. When the DAML runtime evolves, DamlSec inherits these changes and needs
only to add corresponding cases to the symbolic interpreter. This is the
tightest possible coupling between a security tool and the runtime it analyzes.

**Same language.** DamlSec is implemented in Scala, the same language used by
the Canton node, the Speedy interpreter, the Engine, and the ledger layer. There
is no FFI boundary, no language mismatch, no separate build system. A Canton
contributor familiar with the Canton source can read and modify DamlSec
immediately. Even the inner theorem proving engine is in pure Scala.

**Operates on compiled artifacts.** DamlSec analyzes `.dar` files, not source
code. This means it catches security issues that survive compilation, analyses
library code that a developer imports (not just their own templates), and is
immune to source-level obfuscation. It fits naturally into the
artifact-deployment pipeline: generate a `.dar`, run `damlsec analyze`, gate
deployment on finding-free output.

**Aligned with CIP-0082 priorities.** CIP-0082 explicitly identifies security,
audits, and developer tooling as fund priorities. DamlSec is a security tool
that also provides auditor tooling - it directly reduces the cost and increases
the thoroughness of Canton smart contract audits, a common-good benefit for
every project deploying on the network.

---

### 4. Backward Compatibility

DamlSec is a standalone analysis tool that reads `.dar` files and produces
reports. It does not modify the Canton protocol, the DAML runtime, any existing
contract, or any ledger API. It introduces no compatibility obligations on
existing projects. Adoption is purely opt-in.

---

## Milestones and Deliverables

### Milestone 1: Core Symbolic Engine

- **Estimated Delivery:** 6 weeks from project start
- **Focus:** A complete, tested symbolic execution engine covering the DAML-LF
  expression language. The existing prototype is hardened into a
  production-grade implementation with test coverage against representative DAML
  contracts.
- **Deliverables:**
  - Open source repository with CI pipeline
  - Symbolic engine passing the DAML expression-language test suite
  - Demonstrated symbolic execution of representative real-world templates
  - Technical blog post describing the engine architecture

### Milestone 2: Security Property Detectors and Counterexample Generation

- **Estimated Delivery:** 10 weeks from project start
- **Focus:** A first set of security property detectors implemented,
  integrated, and validated against real Canton contract vulnerabilities.
  Counterexample extraction produces human-readable, actionable output.
- **Deliverables:**
  - At least ten detectors, each with positive (bug detected) and negative
    (contract cleared) test cases
  - Counterexample output includes concrete assignments for free symbolic
    variables
  - Validation against real Canton contracts and known-vulnerable patterns
    drawn from prior audit experience

### Milestone 3: CLI, Integration, Documentation, and Community Onboarding

- **Estimated Delivery:** 14 weeks from project start
- **Focus:** Polished for external use - standalone CLI, CI integration, full
  documentation, and a public demo on a real Canton project. Joint technical
  article with the Canton Foundation.
- **Deliverables:**
  - Published CLI artifact, installable via standard package managers
  - CI workflow template for any Canton project
  - Precision benchmark on a corpus of known-correct contracts
  - User documentation: quickstart, detector reference, FAQ
  - At least one real Canton ecosystem project has run DamlSec and reviewed
    the results, in coordination with the Foundation
  - Co-authored technical article with the Canton Foundation

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- **Milestone 1:** Repository public, CI green, and a live demo of symbolic
  execution on representative templates in a technical review session.
- **Milestone 2:** At least ten detectors present in the repository with
  passing tests, and a written report documenting detection results on the
  validation corpus, including real findings and contracts correctly cleared.
- **Milestone 3:** CLI artifact published and installable; co-marketing
  technical article published.
- **All milestones:** Code released under a compatible open source licence
  and accompanied by sufficient documentation for a Scala developer to build
  and run it independently.

---

## Funding

**Total Funding Request:** 250,000 CC

*Project duration is under 6 months; the Canton Coin denomination is fixed for the life of the grant.*

### Payment Breakdown by Milestone

- **Milestone 1** - Core Symbolic Engine: **80,000 CC** upon committee acceptance
- **Milestone 2** - Security Detectors and Counterexample Generation: **100,000 CC** upon committee acceptance
- **Milestone 3** - CLI, Integration, Documentation, Community Onboarding: **70,000 CC** upon final release and acceptance

### Post-Grant Maintenance Commitment

Dedaub commits to maintaining the DamlSec repository for **one year** following
Milestone 3 acceptance. Maintenance includes: addressing critical issues filed
against the tool (no feature requests), tracking breaking changes in the DAML
SDK, tracking dependency releases, and reviewing community-contributed
detectors. This commitment is independent of further grant funding.

---

## Co-Marketing

Upon Milestone 3 release, Dedaub will collaborate with the Foundation on:

- **Announcement coordination:** coordinated release announcement via Canton Foundation channels and Dedaub's security research blog
- **Technical article:** a detailed joint piece describing the tool's
  architecture, the vulnerability classes it detects, results on real Canton
  contracts, and guidance for DAML developers on interpreting and acting on
  findings
- **Ecosystem promotion:** presentation at a Canton Foundation technical forum
  or developer event; DamlSec listed in Canton's developer tooling directory
- **Audit pipeline integration:** Dedaub will incorporate DamlSec into its own
  DAML audit workflow and document the integration as a reference for other
  audit firms

---

## Motivation

Canton secures institutional financial workflows - tokenized securities,
cross-bank settlement, real-world assets - with the value at risk measured in
trillions of dollars. Yet the automated security tooling available to
developers writing those contracts is sparse. The [Canton Network Developer
Experience and Tooling Survey Analysis
(2026)](https://forum.canton.network/t/canton-network-developer-experience-and-tooling-survey-analysis-2026/8412)
documents this gap clearly: security and auditing tooling is among the most
requested categories. The current landscape of security-focused tools
confirms the gap:

| Tool | Provider | Approach | Key Limitation |
|---|---|---|---|
| DAML compiler | Digital Asset | Type checking, structural authorization | Not path-sensitive; cannot reason about runtime values or cross-path logic |
| daml-lint | OpenZeppelin (2026) | Syntactic pattern matching on source AST (6 rules) | Purely syntactic; cannot determine whether a flagged pattern is actually reachable |
| daml-props | OpenZeppelin (2026) | Property-based testing / fuzzing (pure DAML) | Samples the input space; no coverage guarantee; misses rare path combinations |
| daml-verify | OpenZeppelin (2026) | SMT verification on manually constructed Python model | Requires manual model construction per contract; model may diverge from the actual implementation |
| daml-lf-verify | Digital Asset (2020) | Symbolic execution as Haskell compiler plugin | Abandoned; narrow scope (fund preservation only); unmaintained since ~2020 |
| Manual audit | Various | Human code review | Does not scale; no systematic path enumeration; findings not reproducible |

No existing tool provides automated, path-sensitive security analysis that
operates directly on compiled DAML artifacts, covers all feasible execution
paths, and produces concrete counterexamples. DamlSec occupies this gap. DAML-specific vulnerabilities -
authorization bypass, conservation violation, privacy leaks - are quiet and
subtle, which makes automated detection more valuable, not less.

DamlSec is a common-good infrastructure investment: every project deploying
DAML contracts on Canton benefits from the same security properties the tool
checks. It is open source, architecturally designed for community extension,
and aligned with CIP-0082's explicit priorities around security and developer
tooling.

---

## Rationale

### Why the DamlSec Approach

**Static analysis.** Pattern-matching based static analysis
catches a subset of bugs - missing guards, obvious unguarded divisions - but
cannot reason about whether a problematic branch is actually reachable given
the contract's invariants. It is useful for triage, and as an accelerator for
more powerful symbolic reasoning. We do aim to employ some techniques from this
field.

**Fuzzing and property-based testing.** Random-input testing is powerful for
finding implementation bugs but provides no coverage guarantee: a conservation
violation that only manifests on one specific allocation across paths will be
missed with overwhelming probability. In our experiments, a test suite written
by a modern LLM provides more code coverage than fuzzing. Symbolic execution
exhausts all feasible paths up to a configurable bound, making it
complementary - it proves the absence of findings within the explored depth
rather than providing probabilistic assurance.

**Formal proofs.** Approaches that require manually constructing
a symbolic model of the contract are prohibitively expensive for routine audit
use and introduce the risk that the model diverges from the implementation.
DamlSec works directly on the compiled artifact - no model construction, no
divergence risk.

Novel integrations of symbolic execution with static analysis occupy the correct
point in the tradeoff space: automated, path-sensitive,
counterexample-producing, and operating on the actual compiled code.

### Why Build on the Scala Toolchain and Not Repeat the Haskell Approach

A previous attempt at DAML symbolic execution was written in Haskell as a
compiler plugin and was ultimately abandoned. Maintaining a plugin against a
moving compiler target, combined with the fragility of interfacing Haskell
with production-grade SMT solvers, contributed to its deprecation. DamlSec is
written in Scala, lives outside the compiler, takes compiled artifacts as
input (a stable binary interface), and uses a Scala-native theorem prover. This
is a more maintainable architecture on every dimension and specifically
eliminates fragility that contributed to the prior tool's abandonment.

### Why a Two-Tier SMT Stack

DamlSec is built around a clear design principle drawn from prior
experience with theorem proving on smart contract bytecode: heavyweight SMT
solvers are inadequate for symbolic reasoning that targets exploration of
security violations. Heavyweight solver calls on the kinds of queries symbolic
execution generates can cost seconds each, so even a modest call rate dominates
analysis time. The right architecture is a cheap inner pre-pruning stage, with
the expensive solver reserved for the small number of candidates that genuinely
need it.

DamlSec realizes this principle with solvers tuned to DAML's
actual workload. The inner-tier prover does aggressive simplification and
fast feasibility checking on the hot loop, sub-millisecond per query. The
outer-tier solver is expensive, called only on the survivors, and used to
discharge security obligations and produce concrete counterexamples. This
gives DamlSec the throughput of a custom-built pipeline without paying the
engineering cost of building one from scratch.

### Why Dedaub

Dedaub is a blockchain security firm whose research team built static analysis
and symbolic execution tools for Ethereum used by tens of thousands of users. 
The team has published extensively on program analysis, decompilation, symbolic
reasoning techniques, AI, and smart contract security at top venues (PLDI,
OOPSLA, ICSE). We have directly audited DAML/Canton codebases, giving us
first-hand knowledge of the vulnerability patterns DamlSec is designed to
detect. We have Scala engineers on staff who understand the DAML toolchain, and
a working prototype already exists. This is an execution risk we have already
substantially de-risked. Finally the team has been awarded millions in bug
bounty rewards, for disclosing critical vulnerabilities in popular web3
protocols.
