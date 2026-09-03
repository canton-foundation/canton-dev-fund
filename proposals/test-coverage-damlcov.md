## Development Fund Proposal: DamlCov

**Author:** Martin Derka, Head of New Initiatives at Quantstamp, on behalf of Quantstamp
**Status:** Submitted
**Created:** 2026-03-05
**Label:** daml-tooling
**[Champion](https://github.com/canton-foundation/canton-dev-fund/blob/main/sig-directory.md):** @monsieurleberre (Matthieu Le Berre)

---

## Abstract

We propose developing a test coverage tool for Daml smart contracts.

Today, `dpm test --show-coverage` reports coverage at the template and choice granularity, i.e., which templates were created, which choices and interface choices were exercised, broken down by internal-vs-external scope, and it can name the specific templates, choices, and interfaces left uncovered. What it does not reach is the logic *inside* choice bodies: which branches were taken, which guard conditions were tested, or which error paths remain unexplored. It also produces no HTML or LCOV reports for CI integration. Developers are used to tooling that is mature and readily available for languages and development frameworks in other ecosystems (c.f. the Foundry tools for Ethereum), and its absence provides an inferior experience for developers of applications on Canton Network.

The proposed test coverage tool will measure line, branch, and expression test coverage. It will be developed as open-source, free to use, executable locally, will integrate with the current Daml tooling, and will provide reports usable in CI/CD pipelines.

---

## Specification

### 1. Objective

**Problem:** Daml's existing coverage mechanism (`--show-coverage`) reports at template and choice granularity: which templates were created and which choices were exercised, including interface implementations and interface choices, split by internal-vs-external scope. The flag also reports the names of the specific templates, choices, and interfaces left uncovered. This is genuinely useful at the structural level, but it stops at the boundary of the choice body. It provides no insight into:
- Which branches inside `case`, `if/then/else`, or guard expressions were taken
- Which error conditions (`abort`, `assertMsg`) were triggered
- What percentage of the contract logic was actually tested
- Whether specific authorization paths (different controllers exercising the same choice) were covered

It also does it emit HTML or LCOV reports consumable by standard CI coverage services.

Test coverage information is one of the basic metrics when evaluating the quality of code. Every major smart contract platform except Daml has line-level coverage tooling: Foundry (`forge coverage`) for Solidity, `cargo-tarpaulin` for Soroban/Rust, the Move Coverage Tool for Aptos. The 2026 Canton Developer Experience Survey identified security tooling as "Important" or "Critical" by 75% of respondents.

**Intended Outcome:** Daml developers will receive a production-quality coverage tool that integrates with the existing Daml toolchain (`dpm test`, Daml Script, DPM) and produces actionable coverage reports that developers can use to identify under-tested code before deployment.

### 2. Implementation Mechanics

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

If trace output volume becomes a bottleneck (thousands of probes per test run), an alternative approach is to instrument using a dedicated coverage contract that records probe hits as ledger state, queryable after test execution. This adds slight complexity but eliminates dependency on log parsing. This alternative is strictly dev-time / local-environment instrumentation. Coverage probes are not present in any production deployment; the privacy model of the original contracts is unmodified. There might be other benefits to this approach, such as (a) sidestepping the nuances of stdio, especially in multiplatform setting; and (b) enabling testability under conditions simulating real traffic and preexisting state (as opposed to clean local test runs). 

We will evaluate both approaches in Milestone 1 and select the more robust one.

Subsequently, when instrumented contracts are executed via `daml test` or Daml Script, trace output will be captured and parsed into a coverage database. The runtime will:
- Collect probe hits in memory during test execution
- Serialize coverage data to a `.damlcov` file (JSON format for interoperability)
- Support aggregation across multiple test runs (critical for large projects with test suites split across files)
- Handle the existing `--save-coverage` / `--load-coverage` flags as input, extending rather than replacing the current coarse-grained coverage

DamlCov will be able export the coverage data as an artifact after the run, so that they can be consumed in the subsequent pipeline steps. This underpins one of the major use cases for the tool---the ability to develop service-layer integration tests in multi-client setting exercising contracts through the ledger API, getting contract-level coverage back. Within this proposal, the implementers will ensure support for Java, Node, and C#.


Reporting will include:
- **Terminal report:** Colored summary showing file-by-file line/branch/expression percentages
- **HTML report:** Annotated source files with hit/miss highlighting (modeled on `cargo-tarpaulin`'s HTML output and `lcov`'s genhtml)
- **LCOV export:** Standard `lcov.info` format for integration with existing CI coverage services (Codecov, Coveralls)
- **JSON export:** Machine-readable format for custom tooling (coverage artifact with stable schema; ingestible from execution paths other than `dpm test`)

Assumed interaction with existing Daml toolchain:

| Daml Tool | Integration Point |
|-----------|-------------------|
| `dpm build` | DamlCov instruments the `.dar` output; no compiler changes needed |
| `dpm test` | DamlCov wraps the test runner to capture trace output |
| `--show-coverage` | DamlCov extends this flag to include line/branch metrics |
| `--save-coverage` / `--load-coverage` | DamlCov reads/writes compatible format, adding granular data |
| DPM | DamlCov installs as a tool via `dpm install` |


Prior coverage work validates the approach but is not reusable---the Daml-LF instrumentation and privacy-aware probe model need a ground-up design. The funding covers the Daml-specific engineering.

### 3. Architectural Alignment

The 2026 Canton Developer Experience Survey identified security tooling as "Important" or "Critical" by 75% of respondents, yet the current tooling support for measuring test coverage in Daml is insufficient. Beyond the use during the SDL of every project building for Canton Network, we list several use cases where the tool is applicable to CIPs and projects that are of interest to the overall Canton ecosystem:

- **CIP-0056 (Token Standard):** DamlCov will enable developers implementing CIP-0056-compliant tokens to verify that their test suites exercise all transfer, allocation, and settlement paths - including error paths (insufficient funds, expired deadlines, unauthorized access).
- **CIP-0103 (dApp Standard):** dApp developers will be able to use DamlCov to ensure wallet integration flows are fully tested before deployment.
- **CIP-0104 (Traffic-Based App Rewards):** The complex reward attribution logic will be measurable for coverage completeness.
- **Daml Finance library:** The community's primary reusable library (24 stars, zero formal verification) would immediately benefit from coverage measurement, revealing which instrument types and lifecycle paths are under-tested.
- **Dev Fund PR #12 (B-Method Verification):** Coverage data will help prioritize which code paths most urgently need formal verification - the untested paths are the highest-risk.
- **Dev Fund PR #5 (Daml Security Framework):** The `daml-check` static analysis tool proposed in PR #5 is complementary; DamlCov will measure what is tested, `daml-check` finds what is vulnerable. Together they will provide a more complete security picture.
- **Dev Fund PR #327 (dpm-trace):** DamlCov could consume and benefit from the `damlc --debug-info` format proposed in [PR#327](https://github.com/canton-foundation/canton-dev-fund/pull/327) once it lands; it will fall back to Daml-LF location annotations otherwise.
- **Dev Fund PR #52 (DamlFuzz):** DamlCov can provide traces to DamlFuzz to guide the fuzzing.

### Named Ecosystem Adopters
This section lists the ecosystem adopters who expressed interest in adopting and using DamlCov. It will be periodically updated as we gather additional support.

- Quantstamp (audit provider): DamlCov will be used to discover untested code in client audits.
- Coinversa.ai (project on Canton): DamlCov will be used to evaluate and strengthen the test suite.
- Peaceful Studio (@monsieurleberre): Specifically interested in multi-client support to use with a C# SDK. *"Hand-authored Daml Script scenarios are what we have today; pointing at branches that aren't exercised is the missing piece."*
- Bitsafe: would [love better tooling](https://github.com/canton-foundation/canton-dev-fund/pull/323#issuecomment-4798960139) around security, static analysis and test-coverage of Daml, and would integrate the tool into their development workflow

### 4. Backward Compatibility

No backward compatibility impact. DamlCov will be a separate tool that instruments compiled `.dar` files and wraps the existing test runner. It will use only public Daml-LF protobuf format and Daml Script APIs and will not modify the Daml compiler, SDK, or Canton node software. Projects will opt in by installing DamlCov via DPM.

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

### Milestone 3: Ongoing Maintenance
- **Estimated Delivery:** Ongoing for 12 month after delivering Milestone 2
- **Focus:** The team commits to maintaining the tool and providing developer support for 12 months following the completion. The code will be maintained as an open-source project during the entire duration. The team is interested in providing long-term support for the tool even after the initial commitment window elapses. In laymen terms, the team will ensure that the tool is ready and safe to use out of the box, actively maintain the repository during this period, and provide developer support for the ecosystem. This will include:
  - Bugfixes
  - Security updates - critical with the dependency supply chain attack
  - Canton SDK compatibility
  - Major platform compatibility
  - Github ticket responses and developer support
  - Feature request triage
  - Additional feature development as feasible

- **Deliverables / Value Metrics:**
  - Ongoing maintenance of the project
  - Number of (un)resolved developer support tickets in Github

Note that DamlCov will continue being usable even after funding period. The proposed tool is a standalone library and executable on top of stable Daml Script APIs and Daml-LF protobuf, so it will continue to work against any Daml version that does not break Script API contracts. All materials including `.dars` and tutorials will remain published, and the repository will remain open for community PRs and open-source development. The implementers are interested in ongoing maintenance of the tool beyond the indicated period.

### Milestone 4: Ecosystem Adoption
- **Estimated Delivery:** Ongoing for 12 month after delivering Milestone 2
- **Focus:** The team will focus on supporting ecosystem projects and other ecosystem participants in integrating DamlCov to measure and improve the completeness of their test suites. This is an event-based milestone that aligns the grant and the proposed tool with the ecosystem adoption. We request 50,000 CC/project using the DamlCov, as demonstrated by their repository (ideally publishing `coverage.lcov` to Codecov and a CI badge if configured) or an external audit report. The events will count within the first 12 months of the tool becoming usable, and the payouts will be limited to such 8 events (that is 400,000 CC milestone cap).
- **Deliverables / Value Metrics:**
  - Number of projects integrating DamlCov

---

## Acceptance Criteria
The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone
- Demonstrated functionality or operational readiness
- Documentation and knowledge transfer provided
- Alignment with stated value metrics

Additional project-specific acceptance conditions:

- DamlCov produces accurate line and branch coverage for Daml contracts compiled to Daml-LF v2. (We consider v1 deprecated of scope for DamlCov.)
- Coverage reports validated against Splice reference packages and Daml Finance library: DamlCov produces a line/branch report for the full Splice token-standard reference package and the Daml Finance Holding module, hand-checked against the source for at least one known-untested branch per file
- HTML and LCOV report formats are correct and render properly in standard viewers.
- Documentation sufficient for a Daml developer to install and use the tool without assistance.
- DamlCov is usable with Node, Java and C#.

---

## Funding

**Total Funding Request: 1,300,000 CC** 

### Payment Breakdown by Milestone

- Milestone 1 (Instrumentation Engine): 250,000 CC upon committee acceptance
- Milestone 2 (Runtime & Reporting): 350,000 CC upon committee acceptance and release
- Milestone 3 (Ongoing Maintenance): 25,000 CC/month, paid for the first 12 months after the committee acceptance of Milestone 2
- Milestone 4 (Ecosystem Adoption): an event-based milestone to demonstrate ecosystem alignment; 50,000 CC/project using the DamlCov, as demonstrated by their repository or an external audit report, within 12 months after the committee acceptance of Milestone 2, capped at 400,000 CC (8 payable events)

### Volatility Stipulation
The grant is denominated in fixed Canton Coin and will require a re-evaluation at the 6-month mark.

---


## Co-Marketing
Upon release, the implementing entity will collaborate with the Foundation on:

- Announcement coordination
- Case study or technical blog
- Developer or ecosystem promotion
- Hands-on technical workshops focused on using the tool

---

## Go-to-Market Strategy

DamlCov will be released as an open-source, freely available tool. The strategy for driving adoption is built around Quantstamp's existing position within the Canton security and audit community and does not depend on paid promotion or platform exclusivity.

**Distribution**

The tool will be published to a public GitHub repository under an open-source license and made available via DPM as an installable package (`dpm install damlcov`). All source code, documentation, and release artifacts will be freely accessible from day one.

**Tutorial-Driven Onboarding**

Step-by-step tutorials will be published covering: running DamlCov against an existing Daml project, interpreting coverage reports, and integrating the tool into a CI/CD pipeline. Tutorials will be written against real Canton Network packages (Daml Finance, Splice reference implementations) to ensure developers encounter immediately applicable examples. Tutorials will be submitted for inclusion in the official Digital Asset documentation and Canton Network developer hub.

**Audit-Integrated Recommendation**

Quantstamp conducts security audits of Daml and Canton Network applications. DamlCov will be recommended as a standard part of every Daml audit engagement: coverage gaps identified by DamlCov will appear directly in audit findings. This gives the tool immediate credibility through use in real security contexts and ensures every project that undergoes a Quantstamp audit is exposed to the tooling.

**Community Evangelism**

Quantstamp will evangelize the tool through the Canton Network security community via developer forums, ecosystem calls, and technical meetups. Canton Network security experts are the natural early adopters: once they incorporate coverage measurement into their standard workflow, they raise the baseline expectation for every project they review, contribute to, or audit.

**Definition of Success**

The primary success metric is adoption: Daml developers are routinely measuring test coverage as part of their standard development and pre-deployment process, and the security posture of Canton Network applications improves as a result. The secondary metric is ecosystem position: when a Daml developer wants to measure test coverage of a contract, DamlCov is the first solution they reach for. A concrete marker of success is that DamlCov appears in the testing sections of community audit checklists, CIP security guidance, and onboarding documentation for Canton Network developers.

---

## Motivation

Today, Daml developers ship contracts with structurally inadequate test assurance. The existing `--show-coverage` flag reports coverage at the template and choice level. It reveals nothing about the internal logic paths actually exercised within a choice body. A developer can achieve "100% coverage" under the current metric while leaving entire branches of authorization logic, error handling, and guard conditions completely untested.

Every major competing smart contract platform has addressed this gap. Foundry (`forge coverage`) has become a foundational part of the Ethereum developer experience. Soroban has `cargo-tarpaulin`. The Move ecosystem has the Move Coverage Tool. Daml's absence from this category is conspicuous and is reflected in survey data: 75% of respondents to the 2026 Canton Developer Experience Survey rated security tooling as "Important" or "Critical," while the current tooling provides no meaningful coverage measurement.

The immediate beneficiaries are the developers building on Canton Network today - those implementing CIP-0056 token standards, building dApps under CIP-0103, or contributing to shared infrastructure like Daml Finance. The strategic beneficiary is the Canton Network itself: a platform that can credibly claim production-quality security tooling attracts more sophisticated builders and more institutional adopters. Developer tooling is infrastructure, and like all infrastructure, its absence is most visible when something breaks.

---

## Rationale

The proposed tooling exists in many mature ecosystems. The proposal follows the established use cases and patterns. The team has rich experience with developing similar tools, and formulated the roadmap based on their experience.

---

## Appendix: Responses to Reviews

In response to the [review](https://github.com/canton-foundation/canton-dev-fund/pull/52#issuecomment-4128467271):

### 1. Evidence of ecosystem demand

Quantstamp has conducted multiple security audits of Daml and Canton Network applications. In each engagement, the absence of coverage tooling is a recurring friction point, both for our auditors and for the development teams we work with. We regularly report untested code, and we regularly report untested edge cases to Canton Network projects being audited. Audited projects also often seek guidance regarding testing from auditors, which we are unable to provide due to the tooling absence. The 2026 Canton Developer Experience Survey cited in the proposal, where 75% of respondents rated this category of tooling as "Important" or "Critical". We can obtain further evidence through direct testimonials from Canton Network projects to the committee.

The proposed tool plays an important role for agentic development as well. It provides data that agents can use to reason about their code quality, guide to to finding mishandled logic, and delivering more reliable code. The use of AI tooling during development is increasingly popular, making the tool even more valuable ecosystem addition.

### 2. Scope and sequencing

The delivery sequence already ensures independent value at each stage. Milestone 2 delivers a complete, production-usable coverage tool. After Milestone 2, a team can run `damlcov run` and immediately understand which branches of their contracts are untested.

### 3. Adoption expectations

The team will consider the tool successful if it:

- Becomes universally recommended as a test coverage tool by the Canton Network and Daml community.
- A vast majority of projects completing their development phase enters the audit phase with DamlCov configured in the codebase.
- Multiple auditing firms recommend the use of DamlCov when providing guidance to projects undergoing an audit.
- DamlCov is used in CIP implementations (e.g. in CIP-0056).
- Becomes regularly used by agents when developing DAML code.

### 4. Integration with existing workflows

Integration is intentionally low-friction. DamlCov requires no changes to how developers write tests: it wraps `dpm test`, instruments the compiled `.dar`, captures trace output, and produces reports. A developer's existing Daml Script test suite works without modification. The only new step is running `damlcov run` instead of `dpm test` when they want coverage data.

The tool will be executable locally, and its structured plain text output can be further used in CI/CD pipelines as is customary for other similar tools.
