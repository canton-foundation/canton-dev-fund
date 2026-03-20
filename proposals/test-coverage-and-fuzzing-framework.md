## Development Fund Proposal

**Author:** Martin Derka, Head of New Initiatives at Quantstamp, on behalf of Quantstamp
**Status:** Submitted
**Created:** 2026-03-05

---

## Abstract

We propose developing a test coverage tool and fuzzer for Daml smart contracts.

Today, `daml test --show-coverage` reports only which templates were created and which choices were exercised. It tells developers nothing about which branches within a choice body were taken, which guard conditions were tested, or which error paths remain unexplored. Unit testing of Daml code relies on developers writing specific scenarios in Daml Script and asserting expected outcomes. There is no way to automatically generate random sequences of ledger operations, no way to define system-wide invariants, and no way to explore the contract state space beyond the scenarios a developer manually anticipates. Developers are used to tooling that is mature and readily available for languages and development frameworks in other ecosystems (c.f. the Foundry tools for Ethereum), and its absence provides an inferior experience for developers of applications on Canton Network.

The proposed test coverage tool will measure line, branch, and expression test coverage. The fuzzing tool will provision the first property-based testing and coverage-guided fuzzing framework for Daml smart contracts while being designed from the ground up for Daml's unique authorization model, UTXO-like state, and multi-party privacy semantics. Both tools will be developed as open-source, free to use, executable locally, will integrate with the current Daml tooling, and will provide reports usable in CI/CD pipelines.

---

## Specification

### 1. Objective

**Problem:** Daml's existing coverage mechanism (`--show-coverage`) tracks only two coarse-grained metrics: (1) whether each contract template was created at least once; and (2) whether each choice was exercised at least once. This provides no insight into:
- Which branches inside `case`, `if/then/else`, or guard expressions were taken
- Which error conditions (`abort`, `assertMsg`) were triggered
- What percentage of the contract logic was actually tested
- Whether specific authorization paths (different controllers exercising the same choice) were covered

Test coverage information is one of the basic metrics when evaluating the quality of code. Every major smart contract platform except Daml has line-level coverage tooling: Foundry (`forge coverage`) for Solidity, `cargo-tarpaulin` for Soroban/Rust, the Move Coverage Tool for Aptos. The 2026 Canton Developer Experience Survey identified security tooling as "Important" or "Critical" by 75% of respondents.

Similarly, the Daml Standard Library has no random value generation, no `Arbitrary` typeclass, no generator combinators, and no shrinking infrastructure. Daml Script provides only deterministic, manually-authored scenario tests. This means:

- Developers only test scenarios they explicitly think of.
- Edge cases in authorization logic (e.g., what happens when a party is both signatory and observer?) go unexplored.
- Complex multi-step workflows (e.g., DVP settlement with partial allocations, deadline expiry, and concurrent exercises) are tested with at most a handful of scenarios.
- The interactions between CIPs (e.g., CIP-0078 fee removal affecting CIP-0047 reward generation) are never systematically tested.
- CIP-0013 (the re-onboarding minting bug) is a real example of a bug that would have been caught by invariant testing - the invariant "no SV mints more than their agreed share" was violated, but no test checked it under all possible re-onboarding sequences.

**Intended Outcome:**
(1) Daml developers will receive a production-quality coverage tool that integrates with the existing Daml toolchain (`dpm test`, Daml Script, DPM) and produces actionable coverage reports that developers can use to identify under-tested code before deployment; and (2) Canton Network application developers will receive an easy-to-use fuzzing framework where they can:

1. Define invariants ("the total token supply never changes during transfers").
2. Run automated fuzzing campaigns that generate random sequences of ledger operations.
3. Get minimal failing sequences when an invariant is violated.
4. Use coverage feedback to guide exploration toward untested code paths.


### 2. Implementation Mechanics

#### DamlCov as the test coverage tool for Daml

DamlCov will operate at the **Daml-LF** (Ledger Fragment) level - the intermediate representation that all Daml contracts compile to. This is the correct instrumentation point because:
- It is stable across Daml language versions (Daml-LF has a well-defined, versioned specification)
- It preserves the structure of the source Daml code (expressions, let-bindings, case matches, updates)
- It is where the Daml engine actually executes - instrumentation here measures what the runtime actually runs
- Source maps from Daml-LF back to `.daml` source files already exist in the compiler's debug output

**Phase 1 - Daml-LF Instrumentation Engine:**
The tool will parse compiled `.dar` files (which contain Daml-LF archives in protobuf format), traverse the expression tree, and insert coverage probes at:
- **Every top-level expression** in choice bodies and template key computations (line coverage)
- **Every branch of `case` expressions** (pattern match arms) (branch coverage)
- **Every branch of `if/then/else` expressions** (branch coverage)
- **Every `let` binding** in a choice body (expression coverage)
- **Guard conditions** in `ensure` clauses and `assert`/`assertMsg` calls (condition coverage)

Instrumentation will be done by wrapping target expressions with a side-effecting `trace` call that logs a unique probe ID when executed. The Daml engine supports `trace` as a built-in function that outputs a string to the debug log and returns its second argument unchanged, making it suitable for non-intrusive instrumentation. The `daml test` runner captures trace output in its console output; DamlCov will parse this output to record probe hits. Each probe ID will map back to a source location via the Daml-LF location annotations (the Daml-LF protobuf format includes `Location` messages containing module reference, start line, start column, end line, end column for each expression - these are the source maps).

If trace output volume becomes a bottleneck (thousands of probes per test run), an alternative approach is to instrument using a dedicated coverage contract that records probe hits as ledger state, queryable after test execution. This adds slight complexity but eliminates dependency on log parsing. We will evaluate both approaches in Milestone 1 and select the more robust one.

Subsequently, when instrumented contracts are executed via `daml test` or Daml Script, trace output will be captured and parsed into a coverage database. The runtime will:
- Collect probe hits in memory during test execution
- Serialize coverage data to a `.damlcov` file (JSON format for interoperability)
- Support aggregation across multiple test runs (critical for large projects with test suites split across files)
- Handle the existing `--save-coverage` / `--load-coverage` flags as input, extending rather than replacing the current coarse-grained coverage

Reporting will include:
- **Terminal report:** Colored summary showing file-by-file line/branch/expression percentages
- **HTML report:** Annotated source files with hit/miss highlighting (modeled on `cargo-tarpaulin`'s HTML output and `lcov`'s genhtml)
- **LCOV export:** Standard `lcov.info` format for integration with existing CI coverage services (Codecov, Coveralls)
- **JSON export:** Machine-readable format for custom tooling

Assumed interaction with existing Daml toolchain:

| Daml Tool | Integration Point |
|-----------|-------------------|
| `dpm build` | DamlCov instruments the `.dar` output; no compiler changes needed |
| `dpm test` | DamlCov wraps the test runner to capture trace output |
| `--show-coverage` | DamlCov extends this flag to include line/branch metrics |
| `--save-coverage` / `--load-coverage` | DamlCov reads/writes compatible format, adding granular data |
| DPM | DamlCov installs as a tool via `dpm install` |

#### DamlFuzz as a fuzzer for Daml

We propose DamlFuzz as a **Daml Script extension** with a companion Haskell library. The design will follow the proven architecture of invariant testing tools that developers are used to from the Ethereum ecosystem, adapted for Daml's unique execution model. The work will focus on three main components:

**Component 1 - Generator Framework (`DamlFuzz.Gen`):**

The foundation will be a generator library providing:
- `Gen a` monad for building random value generators
- Built-in generators for all Daml primitive types: `Int`, `Decimal`, `Text`, `Bool`, `Date`, `Time`, `Party`, `ContractId`
- Combinators: `oneOf`, `frequency`, `listOf`, `mapOf`, `optional`, `suchThat`, `resize`, `scale`
- **Automatic derivation** via Template Haskell-style metaprogramming: for any Daml data type defined with `data` or `template`, DamlFuzz will generate an `Arbitrary` instance automatically
- Shrinking: when a failing input is found, DamlFuzz will systematically reduce it to a minimal reproducer

The key technical challenge is that Daml has no `IO` monad and no `System.Random`. DamlFuzz will solve this by providing a **deterministic PRNG** implemented in pure Daml using `Int` arithmetic. The seed will be supplied externally via the test runner (Haskell side), making tests reproducible.

**Component 2 - Property Definition DSL (`DamlFuzz.Property`):**

Developers will define properties using a domain-specific language at three levels:

*Function-level properties* (postconditions on individual choices):
```
-- "After a transfer, the sender's balance decreases by exactly the transfer amount"
prop_transfer_sender_balance : Property
prop_transfer_sender_balance = forAll genTransferArgs $ \(sender, receiver, amount) ->
  let balanceBefore = queryBalance sender
  in after (submit sender (exerciseCmd holdingCid Transfer with ..) ) $
     queryBalance sender === balanceBefore - amount
```

*System-level invariants* (must hold after every operation in a sequence):
```
-- "Total token supply is conserved across all transfers"
invariant_supply_conservation : Invariant
invariant_supply_conservation = Invariant $ do
  holdings <- queryAll @Holding
  let totalSupply = sum [h.amount | h <- holdings]
  totalSupply === expectedTotalSupply
```

*Stateful fuzzing campaigns* (random sequences of operations):
```
campaign_token_stress : Campaign
campaign_token_stress = Campaign
  { actions = [Action "transfer" genTransferAction, Action "allocate" genAllocateAction, ...]
  , invariants = [invariant_supply_conservation, invariant_no_negative_balances]
  , actors = [alice, bob, charlie, bank]
  , depth = 50        -- max actions per sequence
  , runs = 1000       -- number of random sequences
  }
```

**Component 3 - Fuzzing Engine (`DamlFuzz.Engine`):**

The engine will orchestrate fuzzing campaigns:

1. **Initialization:** Deploy contracts under test, set up initial state
2. **Sequence generation:** For each run, generate a random sequence of up to `depth` actions:
   - Select a random action type from the campaign's action list (weighted by `frequency`)
   - Select a random actor from the actor pool
   - Generate random arguments using the action's generator
   - Submit the action via Daml Script's `submit` / `trySubmit`
3. **Invariant checking:** After each successful action, evaluate all invariants. If any invariant returns `False`, record the failing sequence.
4. **Coverage guidance** (optional, enhanced by DamlCov from Proposal 1): If DamlCov is available, after each action, check which new code paths were covered and prioritize action types and argument ranges that increase coverage. Coverage-guided fuzzing finds deeper bugs faster. DamlFuzz is fully functional without DamlCov. Coverage guidance is an enhancement, not a requirement.
5. **Shrinking:** When a violation is found, systematically reduce the sequence:
   - Remove actions that do not affect the violation
   - Shrink action arguments to smaller values
   - Report the minimal failing sequence

The engine will run as a Haskell executable that invokes Daml Script programmatically, managing the PRNG state and coverage feedback externally while the Daml code handles ledger operations.

#### Interaction with Existing Daml Toolchain

| Daml Tool | Integration Point |
|-----------|-------------------|
| `dpm test` | DamlFuzz campaigns run via `dpm test` as standard Daml Script tests |
| Daml Script | DamlFuzz uses `submit`, `trySubmit`, `query`, `allocateParty` - all standard Daml Script APIs |
| `dpm build` | DamlFuzz is a `.dar` dependency added to `daml.yaml` |
| DPM | Installable via `dpm install` as a vendored `.dar` |

### 3. Architectural Alignment

The 2026 Canton Developer Experience Survey identified security tooling as "Important" or "Critical" by 75% of respondents, yet the current tooling support for measuring test coverage and fuzzing in Daml is insufficient. Beyond the use during the SDL of every project building for Canton Network, we list several use cases where the tools are applicable to CIPs and projects that are of interest to the overall Canton ecosystem:

#### DamlCov

- **CIP-0056 (Token Standard):** DamlCov will enable developers implementing CIP-0056-compliant tokens to verify that their test suites exercise all transfer, allocation, and settlement paths - including error paths (insufficient funds, expired deadlines, unauthorized access).
- **CIP-0103 (dApp Standard):** dApp developers will be able to use DamlCov to ensure wallet integration flows are fully tested before deployment.
- **CIP-0104 (Traffic-Based App Rewards):** The complex reward attribution logic will be measurable for coverage completeness.
- **Daml Finance library:** The community's primary reusable library (24 stars, zero formal verification) would immediately benefit from coverage measurement, revealing which instrument types and lifecycle paths are under-tested.
- **Dev Fund PR #12 (B-Method Verification):** Coverage data will help prioritize which code paths most urgently need formal verification - the untested paths are the highest-risk.
- **Dev Fund PR #5 (Daml Security Framework):** The `daml-check` static analysis tool proposed in PR #5 is complementary; DamlCov will measure what is tested, `daml-check` finds what is vulnerable. Together they will provide a more complete security picture.

#### DamlFuzz

- **CIP-0056 (Token Standard):** This CIP could benefit from a reusable library that includes pre-built invariants such as supply conservation, non-negative balances, transfer atomicity, and allocation lock exclusivity. Any project implementing CIP-0056 tokens will inherit these properties by adding DamlFuzz as a dependency.
- **CIP-0104 (Traffic-Based App Rewards):** The complex traffic attribution formula is a good fuzzing target - integer overflow, multi-app splitting fairness, and coupon threshold semantics can all be expressed as invariants and stress-tested with random traffic patterns.
- **CIP-0013 (Re-onboarding Bug):** One could write a property that would have caught this bug ("SV minting never exceeds agreed share after any sequence of onboarding/removal/re-onboarding").
- **CIP-0105 (SV Locking):** Tier determination and vesting calculations under random lock/unlock sequences are natural fuzzing targets.

### 4. Backward Compatibility

No backward compatibility impact. DamlFuzz will be a library (`.dar` package) and a companion Haskell executable. It will use only public Daml Script APIs and will not modify the Daml compiler, SDK, or Canton node software. Projects will opt in by adding DamlFuzz as a test dependency.

---

## Milestones and Deliverables

### Milestone 1: DamlCov: Daml-LF Instrumentation Engine
- **Estimated Delivery:** 8 weeks after commencing
- **Focus:** Core instrumentation of Daml-LF expression trees with source map resolution
- **Deliverables / Value Metrics:**
  - Open-source library that parses `.dar` files and inserts coverage probes
  - Line and branch probe insertion for `case`, `if/then/else`, `ensure`, `assert`
  - Source map resolution mapping probes back to `.daml` source locations

### Milestone 2: DamlCov: Coverage Runtime, Aggregation, and Reporting
- **Estimated Delivery:** 8 weeks after commencing
- **Focus:** End-to-end coverage measurement from test execution to human-readable reports
- **Deliverables / Value Metrics:**
  - `damlcov run` command that instruments, executes tests, and produces coverage data
  - `damlcov report` command generating terminal, HTML, and LCOV output
  - Coverage aggregation across multiple test files
  - Compatibility with existing `--save-coverage` / `--load-coverage` workflow
  - Documentation with tutorial and examples

### Milestone 3: DamlFuzz: Generator Framework and Property DSL
- **Estimated Delivery:** 14 weeks after commencing
- **Focus:** Core `Gen` monad, PRNG, combinators, property definition, automatic derivation tool
- **Deliverables / Value Metrics:**
  - `DamlFuzz.Gen` library with generators for all Daml primitives + combinators
  - `DamlFuzz.Property` DSL for function-level and system-level properties
  - `damlfuzz-derive` code generator producing `Arbitrary` instances from `.dar` files
  - Deterministic PRNG validated for statistical quality

### Milestone 4: DamlFuzz: Fuzzing Engine with Shrinking
- **Estimated Delivery:** 8 weeks after commencing
- **Focus:** Campaign orchestration, sequence generation, invariant checking, shrinking
- **Deliverables / Value Metrics:**
  - `DamlFuzz.Engine` supporting stateful fuzzing campaigns with configurable depth and runs
  - Shrinking that reduces failing sequences to minimal reproducers
  - Comprehensive documentation and contributor guide
  - Performance benchmark

### Milestone 5: DamlFuzz: Benchmarking and Optimization
- **Estimated Delivery:** 12 weeks after commencing
- **Focus:** Pre-built properties for CIP standards, coverage-guided exploration, ecosystem validation
- **Deliverables / Value Metrics:**
  - Performance optimizations and new benchmarks

### Milestone 6: Ongoing Maintenance
- **Estimated Delivery:** 12 weeks after commencing
- **Focus:** The team commits to maintaining the tools and providing developer support for 12 months following the completion. The code will be maintained as an open-source project during the entire duration. The team is interested in providing long-term support for the tools even after the initial commitment window elapses.
- **Deliverables / Value Metrics:**
  - Ongoing maintenance of the project

---

## Acceptance Criteria
The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone
- Demonstrated functionality or operational readiness
- Documentation and knowledge transfer provided
- Alignment with stated value metrics

Additional project-specific acceptance conditions:

- DamlCov produces accurate line and branch coverage for Daml contracts compiled to Daml-LF v2
- Coverage reports validated against Splice reference packages and Daml Finance library
- HTML and LCOV report formats are correct and render properly in standard viewers
- Documentation sufficient for a Daml developer to install and use the tool without assistance

- DamlFuzz correctly generates random Daml values for all primitive types and user-defined data types
- Property-based tests can be defined and executed via standard `daml test` workflow
- Stateful fuzzing campaigns generate valid sequences of ledger operations respecting Daml's authorization model
- Shrinking produces minimal failing sequences (demonstrated on synthetic bugs)
- Performance is sufficient for practical fuzzing campaigns (benchmark documented with specific throughput numbers)

---

## Funding

**Total Funding Request:**

### Payment Breakdown by Milestone

- Milestone 1 (DamlCov: Instrumentation Engine): 250,000 CC upon committee acceptance
- Milestone 2 (DamlCov: Runtime & Reporting): 750,000 CC upon committee acceptance and release
- Milestone 3 (DamlFuzz: Generator Framework and Property DSL): 1,000,000 CC
- Milestone 4 (DamlFuzz: Fuzzing Engine with Shrinking): 1,000,000 CC upon committee acceptance and release
- Milestone 5 (DamlFuzz: Benchmarking and Optimization): 250,000 CC upon committee acceptance and release
- Milestone 6 (Ongoing Maintenance): 50,000 CC/month, paid for the first 12 months after the committee acceptance of Milestone 2 or 4 (whichever comes first)

### Volatility Stipulation
The grant is denominated in fixed Canton Coin and will require a re-evaluation at the 6-month mark.

---

## Co-Marketing
Upon release, the implementing entity will collaborate with the Foundation on:

- Announcement coordination
- Case study or technical blog
- Developer or ecosystem promotion
- Hands-on technical workshops focused on using the tools

---

## Go-to-Market Strategy

DamlCov and DamlFuzz will be released as open-source, freely available tools. The strategy for driving adoption is built around Quantstamp's existing position within the Canton security and audit community and does not depend on paid promotion or platform exclusivity.

**Distribution**

The tools will be published to a public GitHub repository under an open-source license and made available via DPM as installable packages (`dpm install damlcov`, `dpm install damlfuzz`). All source code, documentation, and release artifacts will be freely accessible from day one.

**Tutorial-Driven Onboarding**

Step-by-step tutorials will be published covering: running DamlCov against an existing Daml project, interpreting coverage reports, writing a first DamlFuzz property, and integrating both tools into a CI/CD pipeline. Tutorials will be written against real Canton Network packages (Daml Finance, Splice reference implementations) to ensure developers encounter immediately applicable examples. Tutorials will be submitted for inclusion in the official Digital Asset documentation and Canton Network developer hub.

**Audit-Integrated Recommendation**

Quantstamp conducts security audits of Daml and Canton Network applications. DamlCov and DamlFuzz will be recommended as a standard part of every Daml audit engagement: coverage gaps identified by DamlCov will appear directly in audit findings, and DamlFuzz will be used to demonstrate invariant violations where applicable. This gives the tools immediate credibility through use in real security contexts and ensures every project that undergoes a Quantstamp audit is exposed to the tooling.

**Community Evangelism**

Quantstamp will evangelize the tools through the Canton Network security community via developer forums, ecosystem calls, and technical meetups. Canton Network security experts are the natural early adopters: once they incorporate coverage measurement and fuzzing into their standard workflow, they raise the baseline expectation for every project they review, contribute to, or audit. The goal is for DamlFuzz to become an expected artifact of serious Daml development - the way `forge fuzz` is expected in serious Solidity development.

**Definition of Success**

The primary success metric is adoption: Daml developers are routinely performing fuzz testing as part of their standard development and pre-deployment process, and the security posture of Canton Network applications improves as a result. The secondary metric is ecosystem position: when a Daml developer wants to fuzz-test a contract, DamlFuzz is the first solution they reach for. A concrete marker of success is that DamlFuzz and DamlCov appear in the testing sections of community audit checklists, CIP security guidance, and onboarding documentation for Canton Network developers.

---

## Motivation

Today, Daml developers ship contracts with structurally inadequate test assurance. The existing `--show-coverage` flag tells a developer only whether a template was created and whether a choice was exercised - binary facts that reveal nothing about the internal logic paths actually exercised. A developer can achieve "100% coverage" under the current metric while leaving entire branches of authorization logic, error handling, and guard conditions completely untested. There is no random input generation, no invariant checking, no way to ask "does this property hold for all possible sequences of operations?" This gap is not hypothetical. CIP-0013, the re-onboarding minting bug, is a documented instance of exactly the kind of invariant violation - "an SV never mints more than its agreed share" - that systematic fuzzing would have surfaced before deployment.

Every major competing smart contract platform has addressed this gap. Foundry (`forge coverage`, `forge fuzz`) has become a foundational part of the Ethereum developer experience. Soroban has `cargo-tarpaulin`. The Move ecosystem has the Move Coverage Tool. Daml's absence from this category is conspicuous and is reflected in survey data: 75% of respondents to the 2026 Canton Developer Experience Survey rated security tooling as "Important" or "Critical," while the current tooling provides neither meaningful coverage measurement nor automated adversarial testing.

The immediate beneficiaries are the developers building on Canton Network today - those implementing CIP-0056 token standards, building dApps under CIP-0103, or contributing to shared infrastructure like Daml Finance. The strategic beneficiary is the Canton Network itself: a platform that can credibly claim production-quality security tooling attracts more sophisticated builders and more institutional adopters. Developer tooling is infrastructure, and like all infrastructure, its absence is most visible when something breaks.

---

## Rationale

The proposed tooling exists in many mature ecosystems. The proposal follows the established use cases and patterns. The team has rich experience with developing similar tools, and formulated the roadmap based on their experience.
