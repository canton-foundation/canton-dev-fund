# Development Fund Proposal: Canton Transaction Profiler

**Organization:** [Walnut](https://walnut.dev)<br>
**Authors / Primary Contacts:** Roman Mazur, CEO ([roman@walnut.dev](mailto:roman@walnut.dev)); Djordje Todorovic, CTO ([djordje@walnut.dev](mailto:djordje@walnut.dev)); Marija Mijailovic, Software Engineer ([marija@walnut.dev](mailto:marija@walnut.dev))<br>
**Status:** Draft<br>
**Created:** 2026-09-25<br>
**Proposal Type:** RFP-aligned<br>
**RFP / Roadmap Area:** RFP 18 (Integration into SDLCs) and RFP 19 (DPM Components and Extension Ecosystem)<br>
**Champion:** Curtis Hrischuk, Digital Asset (curtis.hrischuk@digitalasset.com)<br>
**Total Funding Request:** 2,700,000 Canton Coin (CC)<br>
**Project Duration:** 18 weeks, followed by 12 months of maintenance<br>
**Label:** daml-tooling<br>

## Abstract

Walnut proposes `dpm profile`, an open-source DPM component for Canton
transaction size analysis, estimated traffic costs, and
time spent in each local Daml Script step. Reports will show execution profiles
with links to the Daml source code.
It will include commands to compare runs before and after code changes,
so it can be used in CI.

The profiler will reuse building blocks from `dpm trace` and `dpm debug`,
debugging tools we developed for the Canton ecosystem.
It will map profiling results to Daml source code using debug metadata,
which links compiled definitions to source locations. Our separate
[debug-info proposal (PR #743)](https://github.com/canton-foundation/canton-dev-fund/pull/743)
covers the metadata format, its generation, and an API for reading it.

## Specification

### Objective

Developers need to identify expensive transaction data, understand script execution time, connect the results to Daml source code, and catch regressions in CI. The existing Daml Profiler provides Daml Engine timings, but not this combined workflow. `dpm profile` will bring these measurements and comparisons into one CLI, with source links where source information is available.

### Existing profiler and scope

The existing [Daml Profiler](https://docs.canton.network/sdks-tools/development-tools/daml-profiler)
records contract execution time, including for transactions submitted by
Daml Scripts, and exports speedscope profiles. It does not measure time spent
waiting or running other Daml Script steps between transaction submissions.
Its profiles contain
just compiler-internal names, without a mapping to the original names from Daml
code, source files, or line numbers.

Our proposed `dpm profile` will read speedscope profiles exported by the existing Daml Profiler
and use debug info metadata to add links to Daml source code.
It will also report transaction sizes, estimated traffic
costs, and time spent in Daml Script steps. It will include commands to
compare profiles between different runs, so it can be used in CI.

The existing Daml Profiler does not report separate timings for database
access, sequencing, or network communication. The initial version of
`dpm profile` will not support this either, but we would be happy to propose
support for it in a follow-up proposal.

### Inputs and supported analysis

`dpm profile` will read transaction data to analyze size and estimated cost,
profiles of the existing Daml Profiler to report Daml execution time, and
timestamped script traces to report how long script steps take.

| Input | What `dpm profile` reports |
| --- | --- |
| Transaction preparation request and response | Submitted-command breakdown, estimated field sizes, serialized prepared transaction size, and the participant's traffic estimate. |
| Committed update or exported transaction trace | Transaction nodes visible to the participant, with estimated sizes. |
| Daml Engine speedscope profile | Execution times and how often each Daml clause runs (for example, `signatory`, `observer`, or `ensure`). |
| Daml Script runtime trace | Recorded events, source locations, and time spent in each script step. |

`dpm profile` will print a readable profile report to standard output and support
saving it as a versioned JSON file that other tools can read and use.
Each profile will include
input identifiers, package, participant visibility, measurement basis, and
tool versions.
Unresolved source locations will retain their names and an explicit
unavailable status.

## Dev Fund 2.0 Alignment

**RFP mapping.** RFP 19 (DPM Components and Extension Ecosystem) explicitly includes “fee estimators” and “observability tools”. `dpm profile` addresses both through transaction size and estimated cost reports, execution profiles, and links to Daml code. RFP 18 (Integration into SDLCs) is addressed by test-suite reports, comparisons, and CI checks. See the [Foundation roadmap](https://github.com/canton-foundation/canton-dev-fund/blob/main/2026-2028-strategic-roadmap.md).

**Ecosystem need and beneficiaries.** Daml application developers and teams maintaining Canton test suites need to understand which code contributes to transaction size and execution time. The profiler will help them evaluate code changes and detect regressions before release.

**Adoption.** M4 requires three independent organizations to run the profiler on their own projects, two to confirm that the reports are useful, and one to use the checks in CI.

## Milestones and Deliverables

The staffing plan is two engineers working in parallel during M1–M3, followed by one engineer during M4 with support from the Walnut team for adoption. This gives 32 engineer-weeks across 18 weeks of delivery and adoption. M5 adds an estimated 12 engineer-weeks over the following twelve months. These are planning estimates; work is accepted against the milestone criteria, not hours worked.

### Milestone 1: Transaction size and estimated cost profiling

**Estimated Delivery:** 5 weeks from start

**Estimated Effort:** 10 engineer-weeks (2 engineers working in parallel for 5 weeks).

M1 will add two commands:

- `dpm profile tx` — generate transaction profiles.
- `dpm profile diff` — compare profiles between runs.

`dpm profile tx` will accept prepared transactions, committed updates, and
traces exported by `dpm trace`.
Reports will rank size contributors by template,
choice, and payload field, with source links where metadata is available.

The report will include the following measurements when the data is available:

| What `dpm profile tx` reports | What it means |
| --- | --- |
| Estimated field sizes | Estimated size of each field in bytes, to identify large fields and compare changes. |
| Prepared transaction size | Measured size of the serialized prepared transaction in bytes. This is not the charged traffic. |
| Canton traffic estimate | The participant's estimate of the traffic needed to submit the transaction. |
| Estimated cost in Canton Coin (CC) | A CC estimate, with the size or traffic value and price used in the calculation. |

For prepared transactions, `dpm profile tx` will report each submitted
command, such as Create or Exercise. One Exercise can produce multiple nodes, so
command counts and resulting node counts will remain
separate. Node analysis is limited to the data visible in committed updates
or exported transaction trees.

`dpm profile tx` will estimate field sizes to show which fields contain the most
data. These estimates and the measured prepared transaction size do not show
how much Canton charges for each field or how much traffic comes from protocol
overhead.

Canton's traffic estimate (provided in the `totalTrafficCostEstimation` field)
covers transaction confirmation messages. It is based on message sizes,
recipients, and configured base costs. It excludes traffic needed to move
contracts between synchronizers. `dpm profile tx` will report this estimate
separately from the estimated cost in Canton Coin.

CC conversions will identify the supported Canton version and use a
compatible traffic price when available. Conversions based on modeled bytes or the
serialized prepared transaction size will be labeled as scenario assumptions.
Reports will distinguish an unavailable traffic estimate from an estimate of zero.

`dpm profile diff` will compare payload sizes, operation counts, and
available traffic estimates for the same operation across package versions
or runs. It will identify changes in price, participant visibility, and
measurement method separately from application changes.
The command can be used in CI to show how code changes affect transaction
size and estimated traffic costs.

**Acceptance Criteria:**

- A package comparison identifies a large field and reports the size
  reduction after an application change.
- `dpm profile tx` reports a non-zero traffic estimate from a Canton participant
  and shows the units and assumptions used to estimate its cost in Canton Coin.
- Examples for Create, Exercise with child Creates, and consuming Exercise show
  the difference between the number of submitted commands and the number of
  transaction nodes visible to the participant.
- The commands support local and authorized remote participants, plus
  offline analysis of exported artifacts.
- JSON reports distinguish all measurement types and missing values. The
  comparison identifies the affected template or choice.

### Milestone 2: Daml Script execution and elapsed timing

**Estimated Delivery:** 5 weeks after Milestone 1 acceptance

**Estimated Effort:** 10 engineer-weeks (2 engineers working in parallel for 5 weeks).

M2 will add `dpm profile run` to profile local Daml Scripts and export Daml
Script traces with timestamps. It will combine these traces with speedscope
profiles from the existing Daml Profiler. The report will include Daml Engine
execution time and evaluation counts by supported clause, template, and choice.

M2 will use `damlc inspect` to link profile frames to Daml code where the
compiled package contains source locations. Some compiler-generated functions
have no source locations, so these links will be best effort. When `daml-debug-info/v1` metadata is available, `dpm profile` will use it to improve source
links, including links for compiler-generated functions.

Reports will show time spent in each function, both including and excluding
functions it calls, without counting the same time twice.
Output will remain compatible with speedscope viewers.

We will add timestamps to the Daml Script trace to measure how long each step
takes, including waiting for transaction submissions to complete and explicit
pauses between submissions. Daml Engine execution time
is part of the time spent in a script step, so reports will not add them
together. Any time that cannot be linked to a recorded step will be shown
separately.

`dpm profile run` will provide:

- Automatic profiling setup, profile collection, and export of timestamped Daml
  Script traces, without requiring users to edit participant configuration
  manually.
- Daml Engine execution timings for transactions with captured profiles.
- Time spent in script steps, including steps without a Daml Engine profile,
  using script timestamps.
- An explanation if profiling cannot run, with support for opening saved profiles.

Documentation will list supported SDK and Canton versions and any required
setup. The initial version will not show separate timings for database access,
sequencing, or network communication. Future versions may add more detailed timing.

**Acceptance Criteria:**

- Users can collect and analyze profiles in a freshly downloaded project using
  the documented setup, without manually editing participant configuration.
- For a script that submits a Create, waits a few seconds, and submits an
  Exercise, the report shows Daml Engine timings for both submissions, the wait,
  and the total script time. The measured wait is within 10% of a separate timing check.
- The report shows how often `signatory`, `observer`, and `ensure` run and how
  long they take. Without debug metadata, `damlc inspect` provides source links
  for the signatory and ensure clauses in the example package. Compiler-generated functions and results without source links remain visible.
- Profile collection, script-step timing, and the source links available through
  `damlc inspect` work without debug metadata. When debug metadata is available,
  reports use it to improve source mapping. Older traces without timestamps
  still show event counts and state that timing is unavailable.
- Users can export a Daml Script trace that records when each step starts and
  ends, and generate a timing report from the saved trace. Walnut provides the
  required working tools with installation and maintenance documentation. M2
  acceptance does not depend on approval of the debug-info proposal or an
  upstream merge.

### Milestone 3: Test-suite reports, baselines, and CI budgets

**Estimated Delivery:** 4 weeks after Milestone 2 acceptance

**Estimated Effort:** 8 engineer-weeks (2 engineers working in parallel for 4 weeks).

M3 will add `dpm profile check` to check size and timing limits in CI.
It will also add a report that combines results from all Daml Script tests.
The report will show results for each test, template, and choice, with
measurements, units, and links to Daml code. The report will also be available
as JSON. We will document this format so other tools can read and use the report.

`dpm profile diff` will compare test results with results saved from an earlier
run. `dpm profile check` will check transaction size, node counts, and execution
time against fixed limits or allowed increases from that earlier run. Timing
reports will show the test setup, how many times tests ran, how the results
were combined, and how much variation is allowed.

A reference GitHub Actions workflow will run tests, save reports, compare
the baseline, and check budgets without prompts. Documentation will cover
equivalent use in other CI systems.

**Acceptance Criteria:**

- A representative suite produces per-test results and template/choice
  totals in one report. Failed tests and missing measurements are explicit.
- An increased payload and a slower script step each trigger their budget.
  Output identifies the test, operation, value, threshold, and source
  location when available.
- Checks return 0 for a pass, 2 for a breach, and 1 for a tool error.
  Missing measurements required by a budget cannot silently pass.
- The reference pipeline runs from a clean checkout with documented
  baseline and threshold configuration.

### Milestone 4: Public release, adoption, and ecosystem validation

**Estimated Delivery:** 4 weeks after Milestone 3 acceptance

**Estimated Effort:** 4 engineer-weeks (1 engineer for 4 weeks, with adoption support from the Walnut team).

M4 will deliver the public release of the code written in Go, installation
instructions, and a getting-started guide. We will publish an example showing
how a Daml code change reduces transaction size or estimated traffic costs,
with profiles from before and after the change and an explanation of how
the values were calculated.

Walnut will support independent teams using the profiler on their projects,
collect findings, and address adoption blockers. Runtime trace and metadata
requirements identified during validation will be recorded with their
maintainers. Adoption evidence will not require publication of private
application data.

**Acceptance Criteria:**

- At least three independent organizations run the profiler on their own
  projects.
- At least two teams confirm that the reports help them understand transaction
  size, estimated traffic costs, or execution time in their projects.
- At least one runs the budget check in its own CI.
- Critical issues blocking the documented workflow are fixed or have a
  documented workaround. Installation and examples work from a clean
  environment with the listed prerequisites.

### Milestone 5: Maintenance

**Duration:** Twelve months following Milestone 4 acceptance.

**Estimated Effort:** 12 engineer-weeks over twelve months (an average of 1 engineer-week per month, or 3 per quarter).

M5 covers compatibility updates, bug fixes, issue triage, and documentation for the profiler and its timing extensions. Walnut will submit a maintenance report at the end of each three-month period.

**Acceptance Criteria:**

- Each quarterly report lists SDK and Canton versions tested, compatibility results, issues handled, fixes released, and remaining issues with their status.
- The documented profiling and CI workflows pass on the supported versions, with fixes or documented workarounds for blocking issues.
- Relevant code and documentation updates are published. Each accepted quarterly report releases a payment of 150,000 CC, totaling 600,000 CC over twelve months.

## Architectural Alignment

### Integration and dependencies

`dpm profile` will be a DPM component that uses existing participant APIs and
profiles produced by the Daml Profiler. No Canton protocol or node code changes are required.
Profile collection can require participant configuration and operator
access.

Walnut will update the Daml Script runner to record when each script step starts and finishes, including transaction submissions and explicit pauses. `dpm profile run` will use this runner to collect timing data. Until these changes are included in the official Daml SDK, Walnut will provide the modified runner, its source code, and installation instructions. Walnut will maintain the modified runner during the twelve-month maintenance period, with the goal of getting these changes merged into the official Daml SDK. M2 requires working profiling tools, but it does not require the changes to be merged upstream.

Transaction size analysis and engine profiling require no edits to Daml application code. `dpm profile` will use source locations from the compiled package to link results to Daml code where possible. Debug metadata from the same build will improve these links when available. To display the code, it also needs the Daml source files.

### Access and data

Our separate [debug-info proposal](https://github.com/canton-foundation/canton-dev-fund/pull/743)
covers debug info metadata generation and the API for reading it. This proposal covers integrating that metadata into `dpm profile` when
available. It also covers exporting Daml Script traces with timestamps to
measure time spent in script steps.
M2 will use `damlc inspect` to link results to Daml code where source locations
are available. When debug info metadata is available, `dpm profile` will use it
to improve these links. We will deliver the required Daml Script traces and
timestamps through our work on `dpm trace` and `dpm profile`, so M2 does not
depend on approval of the debug-info proposal.

Remote analysis requires authorized participant access and is limited to
the requesting parties' visibility. Collecting Daml Engine profiles from a
remote participant requires help from its operator. An update ID cannot recover historical timing
unless profiles were recorded and can be associated with the transaction.

Default reports contain identifiers, counts, sizes, and timings without
payload values. Exports containing values will be marked sensitive.
Analysis and CI artifacts can remain within the team's environment.

### Ecosystem scope

The proposal addresses [RFP 18 (Integration into SDLCs)](https://github.com/canton-foundation/canton-dev-fund/blob/main/2026-2028-strategic-roadmap.md?plain=1#L204)
and [RFP 19 (DPM Components and Extension Ecosystem)](https://github.com/canton-foundation/canton-dev-fund/blob/main/2026-2028-strategic-roadmap.md?plain=1#L207).

| Related work | Scope |
| --- | --- |
| [Approved DPM Trace proposal](../../proposals/2026-08-Walnut-dpm-trace-visualization.md) | Transaction structure and visualization. The profiler adds quantitative size/timing analysis and comparisons. |
| [DamlCov proposal](https://github.com/canton-foundation/canton-dev-fund/pull/323) | Test coverage. Coverage instrumentation is outside this proposal. |
| [Approved user-paid traffic accounting proposal](../../proposals/2026-07-DA-user-paid-traffic-accounting.md) | Account attribution and enforcement. The profiler does not implement billing or assume wallet charges equal synchronizer traffic cost. |

Reports will retain participant and synchronizer context and use supported
estimate APIs as they evolve. Size and timing comparisons do not depend on
which party or account pays for traffic.

### Backward compatibility

No backward compatibility impact on existing Daml applications or Canton
APIs. Profiling and script recording extensions are opt-in.

Reports will use a versioned schema. Consumers will ignore unknown fields
within a supported major version. Unsupported metadata or stale source
files will disable affected source links without removing size and timing
results.

## About Walnut

- **Canton.** The Development Fund approved our
  [DPM Trace Transaction Visualization](../../proposals/2026-08-Walnut-dpm-trace-visualization.md)
  proposal, and we are building `dpm trace` now.
- **Ethereum Foundation / Argot.** We own debug info generation in `solc`,
  the official Solidity compiler. Our partnership is being extended after
  its first year.
- **Starkware / Starknet.** We build the Walnut Starknet Debugger, covering
  debug info generation, tracing, simulation, verification, and the hosted
  debugger itself. We have worked together for three years.
- **Miden.** We build the compiler and the debugger for Miden.
- **Tempo.** We work with them on solar, a Solidity compiler written in
  Rust.
- **Arbitrum / Offchain Labs.** We build StylusDB, the official debugger for
  Stylus.

## Proof of Concept Implementation

Walnut built a Python proof of concept during proposal preparation.

- `dpm profile` proof of concept: [`feature/profiler`](https://github.com/walnuthq/dpm-trace/tree/feature/profiler)

The proof of concept reports transaction sizes and Canton traffic estimates,
supports comparisons and budgets for modeled sizes and node counts, and
analyzes profiles from the existing Daml Profiler. Full engine source
mapping and elapsed script timing remain proposed work.

## Acceptance Criteria

Acceptance requires the milestone criteria above, reproducible examples,
documented prerequisites, and Apache-2.0 deliverables. M4 additionally
requires independent adoption evidence.

## Funding

**Total Funding Request:** 2,700,000 Canton Coin (CC).

The request allocates 1,150,000 CC to development, 950,000 CC to public release and adoption (approximately 35% of the total), and 600,000 CC to twelve months of maintenance. The milestone amounts and adoption allocation are open to negotiation with the committee.

### Payment Breakdown by Milestone

- Milestone 1: 380,000 CC upon committee acceptance.
- Milestone 2: 420,000 CC upon committee acceptance.
- Milestone 3: 350,000 CC upon committee acceptance.
- Milestone 4: 950,000 CC upon committee acceptance of the public release and adoption criteria.
- Milestone 5: 600,000 CC for twelve months of maintenance, paid in four quarterly installments of 150,000 CC after committee acceptance of each quarterly maintenance report.

### Volatility Stipulation

Delivery and adoption are scheduled for 18 weeks, followed by twelve months of maintenance. The grant is denominated in fixed Canton Coin and will be re-evaluated at the six-month mark, including unpaid maintenance installments. If delivery extends beyond six months due to committee-requested scope changes, remaining milestones must be renegotiated to account for significant USD/CC price volatility.

## Co-Marketing

Walnut will coordinate release announcements with the Canton Foundation
and publish a technical measurement guide, an optimization demo with
before and after profiles, and CI budget documentation.

## Maintenance

For twelve months following M4 acceptance, Walnut will maintain profiler compatibility with each Daml SDK and Canton release, triage external issues, and keep the report schema stable. This work is funded separately through M5 at 600,000 CC, paid as 150,000 CC per quarter after acceptance of the quarterly maintenance report.

We will maintain the profiler alongside our `dpm trace` and `dpm debug`
integrations. Maintenance funded here covers profiler behavior and its
timing extensions.

Maintenance of the debug metadata format and the API for reading it is covered
by the separate debug-info proposal. The Apache-2.0 code and documentation allow
stewardship to transfer to the Foundation or another maintainer.

## Motivation

The profiler will give Canton application teams a shared tool for measuring transaction size, estimated traffic costs, and script execution time. Source links will help developers find the Daml code to review. CI checks will help teams detect size and timing regressions before release.

The initial adoption target is three independent organizations. We do not yet have evidence to estimate what percentage of Canton application teams will use the profiler.

## Rationale

We will extend the analysis of profiles from the existing Daml Profiler and reuse building blocks from `dpm trace` and `dpm debug`. This keeps profiling in the same CLI as the team's other development tools and reuses measurements already provided by the Daml Engine.

`damlc inspect` will provide source links where compiled packages contain source locations. Debug info metadata will improve those links when available. Timestamped Daml Script traces will add step timing, including transaction submissions and explicit pauses. The same reports will support local analysis, comparisons, and CI checks.
