# Development Fund Proposal: Versioned Debug Info Metadata for Daml

**Author:** [Walnut](https://walnut.dev)<br>
**Status:** Draft<br>
**Created:** 2026-08-19<br>
**Label:** daml-tooling<br>
**Champion:** Need Champion<br>

---

## Abstract

When a Daml workflow fails on Canton, the developer sees an error message
and a package id. They do not see which line of Daml failed, which values
reached it, or how execution got there. The compiler knows which source
produced which part of the package, so that mapping should be produced in a
form tooling can consume. Today only fragments survive, and nothing gathers
them into anything a tool can rely on.

Walnut proposes to fix that. We will define a debug metadata format for
Daml, make the Daml compiler emit it, and integrate it into tooling that
uses it. The metadata maps a compiled package back to its source code, so a
tool can point at the exact line that failed instead of guessing.

We hit this problem building our own tool. The Development Fund approved
our
[DPM Trace Transaction Visualization](./dpm-trace-visualization.md)
proposal, and we are building `dpm trace` now. It can show what a
transaction did, but not which Daml code did it. This proposal supplies the
missing metadata, uses it to add source-level views to `dpm trace`, and
adds `dpm debug`, a new debugger that steps through a Daml run in the
source.

---

## What we will build

1. **The format.** A published specification for Daml debug metadata,
   carrying its own version so a consumer knows exactly which revision it
   is reading, with a JSON Schema so tools can check a file
   automatically.
   The [current draft](https://github.com/walnuthq/daml/blob/feature/debug-info/sdk/compiler/damlc/daml-debug-info-v1.md) is written against a working prototype.
2. **Compiler support.** `damlc` emits the metadata when asked, and can
   produce a debug build that a debugger can step through. Both go into
   the official Daml repository.
3. **A runtime trace.** Daml Script writes a log of what a local run did
   and where in the source each step happened.
4. **A verifier and a reader library.** `dpm debug-info verify`, which
   proves a metadata file is correct, and code that loads it and answers
   "which source line is this?", with example Daml packages we test
   against.
5. **The tooling that uses it.** Source-level views added to `dpm trace`,
   whose transaction inspection and visualization are already funded by the
   approved DPM Trace proposal, and `dpm debug`, a new command-line
   debugger with breakpoints and stepping over Daml source.

---

## Specification

### 1. Objective

Give Daml developers accurate, source-level error messages and debugging.

The metadata has to answer, for any compiled package:

- Which source files produced it, and do the files on my disk still match?
- Which line of source does each template, choice, and expression come
  from?
- Which values may a tool show, and which values does it not have?
- Where can this package fail, so a failure can be traced back to the line
  that caused it?

The format and the tooling are public and open source, so any Daml tool can
use them. We are building the first user ourselves.

### 2. Motivation

Debugging Daml today is harder than it should be. A failed submission
returns a status and a message. Finding the cause means searching the
source for the error text, which breaks down as soon as two assertions
share a message or a message is built at runtime. Nothing tells a developer
which line ran, in which package version, with which values.

Most of what is needed already exists inside the compiler. Daml-LF carries
source locations, and the compiler knows which file every definition came
from. What is missing is a way to get it out.

`damlc inspect` comes closest. It prints a package, but it prints Daml-LF
in a textual form meant for people rather than a format tools can depend
on, and it carries no file paths and no source hashes, so a tool still
cannot tell whether the file on disk is the one that was compiled. For
choices there is nothing to print at all: their source locations are
dropped during compilation, which is one of the compiler improvements this
proposal upstreams.

Most mature language toolchains solve this the same way, by writing debug
metadata next to the compiled artifact: DWARF for native code on Unix-like
systems, source maps for JavaScript, ETHDebug for EVM contracts. Daml has no equivalent yet. The
result is that each Canton tool, including ours, has to guess at source
locations, and different tools guess differently.

The value is straightforward. Clear error messages that name a file and a
line. A debugger that steps through Daml source instead of ledger events.
Test and coverage reports that point at real code. Less time spent guessing
why a workflow failed.

### 3. Implementation Mechanics

#### A. The format

We publish `daml-debug-info/v1` as a versioned specification with a JSON
Schema. A metadata file describes a compiled package: its source files
and their hashes, the source span of every template, choice, interface and
value, the Daml-LF references that tie those back to ledger data, the
places the package can fail, and step markers a debugger can walk.

It also records which values a tool is allowed to show. Some values are in
the transaction and any entitled party can see them. Others exist only
inside the interpreter and never appear in ledger data. The format labels
each one, so tools can show what they have and say plainly when they do not
have something, instead of inventing it.

The [full draft specification](https://github.com/walnuthq/daml/blob/feature/debug-info/sdk/compiler/damlc/daml-debug-info-v1.md) lives with the prototype compiler
and covers the document structure, the position and hashing rules, the
runtime trace format, and what a consumer must validate.

#### B. Compiler support

`daml build --debug-info` writes the metadata next to the
compiled DAR, and optionally inside it, where existing tools ignore it.

The flag never changes the compiled package. A package built with it has
the same package id as one built without it, which is what makes the
metadata safe to trust: it describes exactly the artifact you deploy. We
prove this with a test that builds both ways and compares package ids.

We identified some gaps in the compiler while building the prototype.
Source locations for choices are dropped during compilation, so no tool can
point at a choice body. Closing that gap is part of this work, in Milestone
1, and the changes go upstream as their own pull requests.

#### C. Debug builds and the runtime trace

We aim to bring record and replay debugging to Daml. A run writes down what
it did and where in the source each step happened, and the debugger walks
that recording afterwards, so a test that failed in CI can be examined
without reproducing it first.

`daml script --debug-trace-file <file>` writes that record: which script
started, what it submitted, which contracts were created and exercised,
what was traced, and where each of those happened in the source. This uses
an extension point the interpreter already provides, so it needs no change
to Canton.

That record covers runs a developer starts themselves. A transaction that
already executed on a participant is never re-run: `dpm trace` reads it
through the Ledger API and uses the metadata to put source locations on
what it did, which is how the same source mapping reaches transactions
nobody can replay.

To follow execution inside a choice body, `daml build --debug-build`
produces a debug build of the package carrying a step marker at each source
location. Section 4 explains how a debugger uses those markers to stop.

The two flags are separate because they do different things to the
artifact. `--debug-info` writes a file beside the DAR and never touches the
package, so a production build can carry metadata and keep its package id.
`--debug-build` compiles markers into the package, so its package id
differs by construction. C++ draws the same line between a release build
with debug info (`-g -O2`) and a debug build (`-g -O0`): the first is the
artifact you ship, the second is compiled differently so a debugger can
stop anywhere.

#### D. Verification and the reader library

Debug info that is quietly wrong is worse than none, because the debugger
will confidently point at the wrong line and the developer will believe it.
Mature debug formats ship a verifier for that reason. LLVM checks
debug metadata inside the compiler, and `llvm-dwarfdump --verify` checks it
in a built binary. Daml needs the same, so verification is a deliverable
here.

It happens at three levels. The JSON Schema checks shape: required fields,
types, and allowed values, which any tool can run without our code. A
schema cannot check meaning, so the verifier also confirms that every
reference resolves, that ids are unique, that spans are well formed, and
that no value carries a more permissive availability label than the rules
allow. The strongest level compares the file against the things it
describes: the package id must match the DAR, the source hashes must match
the files on disk, and every span must land inside the file it names.

`dpm debug-info verify <dar>` runs all three and says what failed and
where, with machine-readable output for CI. The same checks run inside
`damlc` behind a flag and over the example packages in the compiler test
suite, so a producer bug fails the build instead of reaching whoever
consumes the file months later.

Consumers get the checks as a library too, so a tool knows whether to trust
a file before relying on it, and can go from a template or choice to a
source location. The examples it is tested against cover what breaks naive
implementations: interfaces, contract keys, several packages at once, and
two versions of the same package.

#### E. The tooling that uses it

Metadata on its own helps nobody, so this proposal also builds the two
pieces that turn it into something a developer uses.

`dpm trace`, funded by our approved
[DPM Trace proposal](./dpm-trace-visualization.md), can already show what a
transaction did. Here we add the source side of it: the Daml line behind
each transaction node, and for a failed submission, the assertion that
rejected it.

`dpm debug` is new work in this proposal. It runs a Daml Script under the
debugger, stops at breakpoints set on Daml lines, steps from there, and
shows the values it has while labeling the ones it does not.

### 4. How the debugger works

Source-level debugging here follows the well-known approach from C and C++
toolchains, which have worked this way for decades.

A C++ toolchain writes debug info next to the compiled binary. It maps
machine addresses back to source lines and records where values live. The
debugger reads that file, and when the developer asks to break on a line it
plants a trap at the matching address. When execution reaches the trap, the
debugger takes over and shows them their own source.

The pieces line up:

| C++ | Daml, in this proposal |
| --- | --- |
| the DWARF file written beside the binary | `daml-debug-info/v1` written beside the DAR |
| a release build with debug info, `-g -O2` | `daml build --debug-info` |
| a debug build, `-g -O0` | `daml build --debug-build`, which plants a marker at every source location |
| the breakpoint instruction the debugger patches in | one of those markers |
| the process stopping when it hits that instruction | the marker calling the interpreter's logging callback, which the debugger holds open |
| `gdb` or `lldb` | `dpm debug` |

The one real difference is where the trap comes from. In C++ the operating
system provides it, so the binary is untouched and the debugger stops the
process from outside. Canton has no equivalent, and adding one would mean
changing the Daml interpreter, the component that computes transactions on
every validator. We are not proposing that.

So the compiler plants the traps instead, which is why interactive
debugging uses a debug build: something you produce locally, on your own
package, while you are working on it. What you ship is unaffected and still
carries its debug info, which is what lets `dpm trace` put source locations
on real transactions.

Breakpoints then work the way a developer expects. Each marker calls the
interpreter's logging callback synchronously, on the thread evaluating the
choice body. `dpm debug` receives the call, compares it against the
breakpoints the developer set, and either returns at once or holds until
they step. Holding that call holds interpretation, which is what makes a
real pause possible without touching Canton.

### 5. Architectural Alignment

Nothing here changes Canton. No protocol change, no node change, no change
to how transactions are executed or what any party can see. The metadata
describes code, not ledger data, and the tools that read it keep working
through authorized participant APIs.

The metadata belongs to a package and is keyed by package id, which is what
makes it correct under smart contract upgrades: two versions of a package
have different ids and different metadata, so a tool always resolves
against the version that actually ran.

### 6. Backward Compatibility

No backward compatibility impact. The metadata is new, optional, and
written alongside the DAR rather than inside the package, so existing
builds, tools, and deployments are unaffected.

---

## Milestones and Deliverables

### Milestone 1: Specification and compiler improvements

**Estimated Delivery:** 4 weeks from start<br>
**Focus:** Agree the format with Daml maintainers and land the groundwork
in the official compiler.

**Deliverables:**

- The `daml-debug-info/v1` specification published, with a JSON Schema.
- The compiler improvements submitted to `digital-asset/daml`, including
  measurements of their effect on package size and interpreter speed.
- A review of the format with Daml/Canton maintainers.

**Acceptance Criteria:**

- The specification is public and covers, at minimum, templates, choices,
  choice arguments, payload fields, and failure sites.
- Daml maintainers have reviewed the format and agree it is emittable by
  the compiler.
- The compiler improvements are open as pull requests against
  `digital-asset/daml`, and we help the merging process by actively
  addressing review comments.

### Milestone 2: Compiler and Daml Script emission

**Estimated Delivery:** 8 weeks after Milestone 1 acceptance<br>
**Focus:** Ship metadata emission and the runtime trace in the official
toolchain.

**Deliverables:**

- `damlc` emits `daml-debug-info/v1` behind a flag.
- `daml build --debug-build` produces a debug build carrying step markers.
- Daml Script writes the runtime debug trace.
- The test proving the metadata flag does not change the compiled package.
- Documentation for each.

**Acceptance Criteria:**

- The emission changes are open as pull requests against
  `digital-asset/daml`, and we help the merging process by actively
  addressing review comments.
- A developer can build any Daml package with a released or nightly build
  of the compiler and get valid metadata.

### Milestone 3: Verification and the reader library

**Estimated Delivery:** 4 weeks after Milestone 2 acceptance<br>
**Focus:** Make the metadata provably correct, and usable by any tool.

**Deliverables:**

- `dpm debug-info verify`, checking shape, internal consistency, and
  agreement with the DAR and the source files, with machine-readable
  output for CI.
- The same checks inside `damlc` behind a flag, run over the example
  packages in the compiler test suite.
- Open-source reader library that resolves a template or choice to a
  source location.
- Example Daml packages covering interfaces, contract keys, multi-package
  builds, and package upgrades.
- Documentation for tool authors.

**Acceptance Criteria:**

- The verifier accepts every valid example and rejects deliberately
  corrupted ones: stale sources, a mismatched package id, a span outside
  its file, an unresolved reference, and an availability label that claims
  more than the rules allow.
- A producer bug introduced on purpose is caught by the compiler-side
  check before the file is written.
- Someone who is not us can go from a template or choice name to the right
  source line using only the published library and documentation.

### Milestone 4: Source-level debugging in `dpm trace` and `dpm debug`

**Estimated Delivery:** 5 weeks after Milestone 3 acceptance<br>
**Focus:** Put the metadata to work in the tools developers already use.

**Deliverables:**

- `dpm trace` gains source locations for transactions and failed
  submissions.
- `dpm debug`, the new command-line debugger, sets breakpoints on Daml
  lines and steps through a run in the source.
- A worked example and walkthrough, from building a package to debugging a
  failure in it.

**Acceptance Criteria:**

- A developer can take a failing Daml workflow and see the exact line that
  rejected it, without searching the source for the error message.
- `dpm debug` stops at a breakpoint on a line inside a choice body, steps
  from there, and shows the values it has while labeling the ones it does
  not.

### Milestone 5: Adoption

**Estimated Delivery:** 4 weeks after Milestone 4 acceptance, plus support
through the adoption window<br>
**Focus:** Get the format used by Canton tools.

A format only pays off when tooling uses it, so adoption is where most of
the value of this proposal sits. We are the first adopter ourselves: our
own Daml debugger depends on this metadata and ships on it.

**Deliverables:**

- Public release of the specification, JSON Schema, verifier, and reader
  library, with a getting-started guide written for tool authors.
- `dpm trace` and `dpm debug` released on the format, which makes Walnut
  its first production consumer.
- Outreach to the tools that would gain most from source mapping. Static
  analysis such as Certora's Daml package analyzer could point findings at
  a file and line rather than a package. IDE tooling such as the Daml Code
  Assistant could feed precise error locations back into its compile and
  test loop. Test reporters and profilers need the same mapping. If the
  DamlCov proposal is funded and the tool gets built, source-level coverage
  is a natural fit and we will offer the same support there.
- A short demo video or recorded walkthrough.
- Fixes for anything that blocks a tool author during the adoption window.
- An adoption report: who integrated, what they built with it, and what the
  format got wrong.

**Acceptance Criteria:**

- `dpm trace` and `dpm debug` are released on the format and available to
  Canton developers.
- At least three Canton developers or teams use the source-level debugging
  workflow and give written feedback on whether it sped up their work.
- The adoption report is published, with concrete follow-up items.

### Milestone 6: Maintenance

**Estimated Delivery:** a 12-month maintenance window following Milestone 5
acceptance<br>
**Focus:** Keep the format, the compiler support, and the tooling working
as Daml and Canton move.

**Deliverables:**

- Compatibility with each Daml SDK release published during the window:
  metadata emission, debug builds, and the runtime trace keep working as
  the compiler and Daml Script evolve, with fixes upstreamed where they
  belong.
- Stewardship of the specification and JSON Schema: errata, clarifications,
  and minor revisions driven by adopter feedback, without breaking v1
  consumers.
- Bug fixes and issue triage for the verifier, the reader library,
  `dpm debug`, and the source-level features in `dpm trace`.
- Integration support for tool authors adopting the format, continuing the
  Milestone 5 outreach.
- A quarterly maintenance report: fixes shipped, issues triaged, SDK
  compatibility status, and new integrations.

**Acceptance Criteria:**

- The repositories remain healthy across the window: green CI, no
  outstanding critical defects, external issues and pull requests triaged
  within a reasonable SLA.
- The metadata and tooling work against each Daml SDK release published
  during the window, verified by the example packages.
- The quarterly maintenance report is published each quarter.

---

## Acceptance Criteria

Each milestone above carries its own criteria, and those are the bar. Two
apply throughout: the compiler work is submitted to the official Daml
repository and carried through review rather than kept in a fork, and
every deliverable is open source under Apache-2.0.

---

## Funding

**Total Funding Request:** 3,360,000 Canton Coin (CC).

The funding is split roughly half to delivery, a quarter to ecosystem
adoption, and a quarter to a 12-month maintenance window.

### Payment Breakdown by Milestone

- Milestone 1, Specification and compiler improvements: 300,000 CC upon
  committee acceptance.
- Milestone 2, Compiler and Daml Script emission: 600,000 CC upon committee
  acceptance.
- Milestone 3, Verification and the reader library: 300,000 CC upon
  committee acceptance.
- Milestone 4, Source-level debugging in `dpm trace` and `dpm debug`:
  350,000 CC upon committee acceptance.
- Milestone 5, Adoption: 850,000 CC upon committee acceptance and the
  adoption criteria.
- Milestone 6, Maintenance: 960,000 CC across a 12-month window following
  Milestone 5 acceptance, paid 240,000 CC per quarter against the quarterly
  maintenance report.

### Volatility Stipulation

Delivery across the five milestones is estimated at 25 weeks, under 6
months. Should the project timeline extend beyond 6 months due to
Committee-requested scope changes or upstream review timelines outside our
control, any remaining milestones will be renegotiated to account for
significant USD/CC price volatility. Should the Milestone 5 adoption window
run past the 6-month mark, the remaining Milestone 5 amount may be
re-evaluated in the same way at that point. The Milestone 6 maintenance
window runs 12 months and is paid quarterly, which limits volatility
exposure to one quarter at a time, and its remaining quarters may likewise
be re-evaluated at the window's 6-month mark, per CIP-0100.

---

## Co-Marketing

Walnut can work with the Canton Foundation on a technical post about how
Daml debug metadata works, a demo showing a failing workflow debugged down
to the line, and documentation for teams building Daml tools.

---

## Rationale

The reason to fund this is what it unlocks in the tools around it.
`dpm trace` can already show what a transaction did, and with this metadata
it shows which line of Daml did it. The test coverage tool proposed as
[DamlCov](https://github.com/canton-foundation/canton-dev-fund/pull/323)
could report which Daml lines a test suite exercised instead of which
packages it touched. Profilers, test reporters, and explorers all need the
same source mapping, and today each of them either invents its own or does
without, and none of them can do better than a text search. Putting the
answer in the compiler once means every Canton tool gets the same answer,
and gets it right.

---

## Risks and Mitigations

- **Upstream review takes time.** Milestone 1 opens the compiler pull
  requests first, so review starts early and maintainers can weigh in on
  the approach long before the larger changes arrive. Every change we send
  is small, additive, off by default, and covered by tests, which is the
  shape most likely to be accepted, and they stand on their own merits
  because they improve Daml stack traces for everyone.
- **The format misses something real.** The specification is not frozen
  until maintainers have reviewed it, and the prototype already covers real
  packages, so gaps show up as concrete cases rather than as opinions.

---

## Maintenance

Everything we produce is open source under Apache-2.0. Milestone 6 funds a
12-month maintenance window following Milestone 5 acceptance: compatibility
with each Daml SDK release, stewardship of the specification, bug fixes
across the verifier, the reader library, `dpm debug` and `dpm trace`, and
integration support for adopters, reported quarterly. Once the compiler
changes are merged, they are maintained in `digital-asset/daml` like the
rest of the compiler, which is the point of upstreaming them. Beyond the
funded window, Walnut remains the natural steward of the specification and
tooling. Everything is open, so stewardship can transfer to the Foundation
or another maintainer without loss if it ever needs to.

---

## About the Team

Walnut has spent four years building debugging and observability tooling
for blockchains, and we build it in collaboration with the teams behind the
blockchain platforms themselves:

- **Canton.** The Development Fund approved our
  [DPM Trace Transaction Visualization](./dpm-trace-visualization.md)
  proposal and we are building `dpm trace` now. This proposal comes
  directly out of that work: we hit the missing metadata while building
  it.
- **Ethereum Foundation / Argot.** We own debug info generation in
  [`solc`](https://github.com/argotorg/solidity), the official Solidity
  compiler. One-year partnership, being extended.
- **Starkware / Starknet.** We build the
  [Walnut Starknet Debugger](https://walnut.dev/), covering debug info
  generation, tracing, simulation, verification, and the hosted debugger
  itself. Three-year partnership.
- **Miden.** We build the compiler and the debugger for
  [Miden](https://github.com/0xMiden).
- **Tempo.** We work with them on
  [solar](https://github.com/paradigmxyz/solar), a Solidity compiler
  written in Rust.
- **Arbitrum / Offchain Labs.**
  [StylusDB](https://github.com/OffchainLabs/stylus-sdk-rs/blob/main/cargo-stylus/docs/StylusDebugger.md),
  the official debugger for Stylus.

Debug info generation in a production compiler is the specific thing we
have done before, in `solc` and in Starknet, and it is the specific thing
this proposal asks for in Daml.

---

## What already exists

We built a prototype at
[walnuthq/daml](https://github.com/walnuthq/daml/tree/feature/debug-info):

- `daml build --debug-info` emits the metadata, taken from
  the compiled package rather than by reading source text.
- The compiler improvements that restore source locations for choices.
- `daml script --debug-trace-file` writes the runtime trace.
- The draft specification and its JSON Schema.

In [walnuthq/dpm-trace](https://github.com/walnuthq/dpm-trace/tree/feature/debug-info) we have
prototyped the tooling: `dpm trace` reading the metadata for source links,
an early `dpm debug` stepping through the traces, and `dpm debug-info
verify` checking an artifact against the specification.

The specification's last section says exactly which parts the prototype
emits today and which parts are Milestone 2 work.

---

## References

- Approved proposal this builds on:
  [DPM Trace Transaction Visualization](./dpm-trace-visualization.md)
- Draft specification:
  [daml-debug-info-v1.md](https://github.com/walnuthq/daml/blob/feature/debug-info/sdk/compiler/damlc/daml-debug-info-v1.md)
- Prototype compiler and runtime:
  [github.com/walnuthq/daml (branch feature/debug-info)](https://github.com/walnuthq/daml/tree/feature/debug-info)
- Prototype tooling:
  [github.com/walnuthq/dpm-trace (branch feature/debug-info)](https://github.com/walnuthq/dpm-trace/tree/feature/debug-info)
