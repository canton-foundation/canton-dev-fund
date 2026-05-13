# Development Fund Proposal: DPM Trace and Source-Aware Debugging

**Author:** [Walnut](https://walnut.dev)<br>
**Status:** Draft<br>
**Created:** 2026-05-08<br>
**Label:** daml-tooling<br>
**Champion:** Need Champion<br>

---

## Table of Contents

- [Abstract](#abstract)
- [Specification](#specification)
  - [1. Objective](#1-objective)
  - [2. Motivation](#2-motivation)
  - [3. Implementation Mechanics](#3-implementation-mechanics)
  - [4. Architectural Alignment](#4-architectural-alignment)
  - [5. Backward Compatibility](#5-backward-compatibility)
- [Proof of Concept Implementation](#proof-of-concept-implementation)
- [Milestones and Deliverables](#milestones-and-deliverables)
  - [Milestone 1: Transaction Trace CLI](#milestone-1-transaction-trace-cli)
  - [Milestone 2: Trace Bundles](#milestone-2-trace-bundles)
  - [Milestone 3: Interactive Debugger](#milestone-3-interactive-debugger)
  - [Milestone 4: Debug Information Format and Compiler Integration](#milestone-4-debug-information-format-and-compiler-integration)
  - [Milestone 5: Adoption and Ecosystem Validation](#milestone-5-adoption-and-ecosystem-validation)
- [Acceptance Criteria](#acceptance-criteria)
- [Potential Follow-Ons](#potential-follow-ons)
- [Funding](#funding)
- [Co-Marketing](#co-marketing)
- [Rationale](#rationale)
- [About the Team](#about-the-team)
- [References](#references)

---

## Abstract

We propose to build `dpm trace`, an open-source DPM plugin for inspecting and debugging Canton transactions.

A developer should be able to start from an already committed update id, run a single CLI command, and get a readable transaction trace.

From there, the tool adds interactive inspection and source-aware debugging workflows. To make that reliable, we also propose compiler-generated debug metadata so transaction traces and debugger steps can link back to Daml source.

---

## Specification

### 1. Objective

Build the core tooling needed for source-aware Canton transaction debugging.

- Add `dpm trace <update-id>` so developers can inspect already committed updates from the CLI.
- Add an interactive debugger so developers can inspect committed updates and replay captured trace bundles.

We are open to adjusting the details with Canton developers, Daml/Canton maintainers, and the Tech & Ops Committee.

### 2. Motivation

The Canton developer survey mentions Tenderly-like or Foundry-like tooling. We agree with the direction, but a naive 1:1 copy does not fit Canton's unique architecture.

We analysed the current Canton stack and found useful primitives that already exist:

- Transaction/update trace data is available through participant Ledger APIs, including the JSON Ledger API.
- Daml Script and IDE flows can produce useful local traces while tests or scripts are running.
- Participants already upload DARs and use package vetting to control which packages they are willing to process.

The gaps are:

- There is no CLI command for inspecting the trace of a transaction / update.
- There is no interactive debugger workflow for committed updates.
- There is no interactive debugger for local Daml Script / test workflows
- Current package metadata can help decode Daml values, templates, choices, and fields, but it does not give debuggers reliable source locations or expression-level information.
- Daml/Canton tooling lacks rich, portable debug-info for reliable source-level debugging, including expression spans, execution step IDs, and consistent variable/value visibility.

This proposal focuses on those gaps.

### 3. Implementation Mechanics

The work is split into three core components.

#### DPM Trace CLI

Add a DPM plugin command:

```bash
dpm trace <update-id> --participant <participant-url> --read-as <party>
```

The command connects to an authorized participant endpoint, fetches the participant-visible update, decodes it, and renders a readable trace tree with decoded templates, choices, arguments, payloads, and return values where visible.

It uses existing APIs:

- `UpdateService.GetUpdateById`
- JSON Ledger API `/v2/updates/update-by-id`
- `PackageService.GetPackage` where package metadata is available
- and optional event/query APIs for related visible contract payloads

#### Interactive Debugger

Build an interactive debugger for transactions/updates.

We propose adding an `--interactive` flag to `dpm trace` command to invoke the debugger, such as:

```plain text
dpm trace <update-id> --interactive
```

This opens a REPL-style trace inspector for the committed update. The debugger can step through the trace, inspect decoded values and state changes, jump to selected trace events or source locations, and show source links where debug metadata is available. If debug metadata is missing, it still shows the event tree and visible ledger data. The richer the compiler-generated debug information is, the better the debugger experience becomes.

Additionally, we propose adding two commands, `bundle` and `replay`, for replay-based debugging of Canton transactions/updates. `bundle` saves the participant-visible trace and available context as a portable JSON artifact. `replay` opens that artifact later without reconnecting to the original participant.

The bundle format decouples capture from inspection, enabling a Sentry-like architecture: an authorised backend captures bundles from a participant, while a Canton Explorer or future Tenderly-like tooling serves them to users via a web UI. `replay` is the local CLI consumer of the same format.

The commands will look as follows:
<empty-block/>
```bash

dpm trace bundle <update-id> --participant <participant-url> --read-as <party> --out <trace-bundle>
dpm trace replay <trace-bundle> --interactive
```

#### Rich Compiler-generated Debug Information

Current DAR metadata helps with package ids, modules, templates, choices, fields, and typed values. That is enough for decoding many traces, but it is not enough for robust source-level debugging.

We propose defining a versioned Canton debug information format for Daml contracts. The format can be embedded in a DAR or emitted as a sidecar build artifact.

Initial data:

- package id
- package name and version
- source root
- source file hashes
- module spans
- template spans
- choice spans
- expression spans where feasible
- deterministic debug step IDs that map source spans to Daml-LF/runtime execution points

Later extensions:

- richer local variable information
- profiling and coverage metadata
- future debugger, profiler, and coverage extensions

The preferred compiler entry point is:

```bash
damlc build --debug-info
```

This is similar in spirit to mature debug-info ecosystems such as DWARF on Unix-like systems and PDB/CodeView on Windows. In web3, Ethereum has recently started standardizing this problem through the `ethdebug` format. A shared Canton debug-info format would give compiler, debugger, profiler, and other tooling authors a common target to build against.

### 4. Architectural Alignment

The design follows Canton architecture:

- It works through authorized participant endpoints and respects participant-scoped visibility.
- The DPM plugin milestones require no Canton protocol changes.
- It uses existing Ledger API and JSON Ledger API primitives before proposing lower-level runtime work.
- It complements package upload and package vetting instead of replacing them.
- It uses DPM as the developer entry point, which keeps the UX close to existing Canton developer workflows.
- Compiler-generated debug information is opt-in. Existing Daml projects and DARs continue to work unchanged, and debugging tools use the metadata only when it is available.

The proposal aligns directly with Daml Language & Developer Tooling, Canton APIs, and DAR Package Management priorities.

### 5. Backward Compatibility

The proposed solution is completely “pluggable” into the existing ecosystem. The DPM plugin is additive and does not change existing Daml applications, Canton nodes, Ledger API semantics, or package vetting.

The compiler debug-info flag is opt-in. DARs built without debug information continue to work exactly as they do today. Tools should degrade gracefully: with no debug info, they still show decoded package data and transaction structure; with debug info, they add source links and richer stepping.

---

## Proof of Concept Implementation

As part of this proposal work, Walnut built a proof of concept to validate the core technical assumptions before asking for funding.

- `dpm trace` proof of concept: [https://github.com/walnuthq/dpm-trace](https://github.com/walnuthq/dpm-trace)
- Initial `damlc --debug-info` support branch: [https://github.com/walnuthq/daml/tree/feature/debug-info](https://github.com/walnuthq/daml/tree/feature/debug-info)

---

## Milestones and Deliverables

### Milestone 1: Transaction Trace CLI

**Estimated Delivery:** 4 weeks from start
**Focus:** One useful command to inspect committed updates.

**Deliverables / Value Metrics:**

- `dpm trace <update-id>` plugin command.
- Support for local and remote participant JSON Ledger API endpoints.
- Support for `--read-as` party context and bearer-token based access.
- Human-readable transaction tree for already committed updates.
- Create, exercise, archive, and reassignment event rendering.
- Contract ids, parties, witnesses, signatories, observers, choice arguments, return values, and payloads where visible.
- Participant-visible projection labeling.
- JSON trace artifact for downstream tools.
- Documentation with a local Canton example and a remote participant example.

**Acceptance Criteria:**

- A developer can run `dpm trace <update-id> --participant <url> --read-as <party>` against a local Canton participant and inspect a committed update.
- The same command shape works against an authorized remote participant endpoint.
- The CLI renders a readable transaction tree for create, exercise, archive, and reassignment events where present.
- The CLI can emit a normalized JSON trace artifact.
- Output labels the result as a participant-visible projection and does not imply access to non-visible private data.
- At least three representative Daml examples are included: create, exercise with child create, and archive/consuming exercise.

### Milestone 2: Trace Bundles

**Estimated Delivery:** 4 weeks after Milestone 1 acceptance
**Focus:** Make committed updates portable and reusable.

**Deliverables / Value Metrics:**

- `dpm trace bundle <update-id>` to save a committed update and its available context as a trace bundle.
- `dpm trace replay <trace-bundle>` to load a saved trace bundle and render the saved trace.
- Portable, versioned trace bundle format.
- Bundle contents: transaction trace, participant/read-as context, visible events, package metadata, reserved source/debug metadata slots, visible contract state where available, and privacy/projection labels. The richer debug-info format is defined in Milestone 4.
- Bundle privacy guidance covering what is included, what can be redacted, and how participant-visible labels are preserved.
- Bundle validation so corrupted or incompatible artifacts fail clearly.
- Documentation explaining trace bundles, participant projections, and privacy limits.

**Acceptance Criteria:**

- A developer can create a trace bundle from a committed update and reopen it later.
- The trace bundle schema is documented, versioned, and includes privacy/redaction guidance.
- A developer can replay a committed-update bundle from the CLI and see the same participant-visible trace data.
- Invalid or unsupported bundle versions produce clear errors.
- Documentation clearly states that a trace bundle is a participant-visible artifact, not a full global transaction record.
- Privacy labeling is present in every debug session.

### Milestone 3: Interactive Debugger

**Estimated Delivery:** 4 weeks after Milestone 2 acceptance
**Focus:** Add interactive debugging for committed updates and trace bundles.

**Deliverables / Value Metrics:**

- `dpm trace <update-id> --interactive` for immediate committed-update inspection.
- `dpm trace replay <trace-bundle> --interactive` for saved trace bundles.
- Event-by-event replay over the participant-visible transaction tree for committed updates.
- REPL-style debugger with next/previous/continue/source/context commands.
- Breakpoints on event index, template, choice, and source location where metadata is available.
- Source snippet display where metadata exists.
- Variable and contract inspector for visible values.
- State-diff view for created and archived contracts.
- Documentation covering immediate inspection and replay from trace bundles.

**Acceptance Criteria:**

- A developer can open an immediate interactive inspector from a committed update without first writing a bundle.
- A developer can replay a committed-update bundle interactively from the CLI.
- Breakpoints work for event id, template, choice, and source location when debug metadata is present.
- The debugger degrades cleanly when source metadata is missing.
- Documentation explains the supported debugger modes and their requirements.

### Milestone 4: Debug Information Format and Compiler Integration

**Estimated Delivery:** 6 weeks after Milestone 3 acceptance
**Focus:** Make source-aware debugging reliable by defining and emitting debug metadata.

**Deliverables / Value Metrics:**

- Draft Canton/Daml debug-info format.
- Reference implementation for generating debug-info artifacts.
- Preferred compiler UX: `damlc build --debug-info`, subject to review with Daml maintainers.
- Sidecar JSON output, with DAR embedding as the preferred long-term path if accepted by maintainers.
- Source file hashes and package-id matching.
- Template and choice source spans.
- Initial expression span support where compiler data is available.
- Define deterministic debug step IDs for source expressions and emit them in the debug-info artifact, so runtime/debugger events can reference exact Daml source spans.
- `dpm trace --debug-info <path>` support, where the path can be a file, directory, or manifest for multi-package traces.
- Runtime integration note describing what Daml-LF/interpreter debug events are needed for full expression-level stepping.
- Documentation for generating debug-info artifacts and using them with `dpm trace`.

**Acceptance Criteria:**

- A sample Daml project can be built with debug info.
- `dpm trace` can load the debug-info artifact and link trace nodes to source locations.
- Debug-info output includes deterministic debug step IDs for supported source spans.
- The format is documented and versioned.
- The design is shared with Daml/Canton maintainers.

### Milestone 5: Adoption and Ecosystem Validation

**Estimated Delivery:** 4 weeks after Milestone 4 acceptance
**Focus:** Prove that the tooling is usable by Canton developers outside Walnut.

**Deliverables / Value Metrics:**

- Public release of the `dpm trace` plugin with installation instructions.
- Getting-started guide covering local Canton, authorized remote participant usage, trace bundles, and interactive debugging.
- At least one short demo video or recorded walkthrough.
- Outreach to Canton ecosystem developers, Daml/Canton maintainers, and Tech & Ops reviewers for hands-on testing.
- Feedback collection from at least three independent Canton developers or teams.
- Fixes or follow-up issues for adoption-blocking bugs found during the adoption window.
- Short adoption report summarizing who tested the tool, what workflows were tested, what worked, what did not, and recommended next steps.

**Acceptance Criteria:**

- At least three independent Canton developers or teams run the trace workflow against a local project, sample project, or authorized participant endpoint, confirmed by written feedback, public issue/PR activity, or other verifiable evidence.
- At least two independent users test trace bundles or the interactive debugger, confirmed by written feedback, public issue/PR activity, or other verifiable evidence.
- The getting-started guide lets a new user produce their first trace without Walnut assistance.
- Adoption feedback is published as a short report with concrete follow-up items.
- Any critical issue that blocks the documented happy path is fixed or explicitly documented with a workaround.

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- The delivered tools work on the current stable DPM/Daml SDK version at the time of development.
- The CLI commands can be installed and run in a clean environment.
- Trace and debugger output is useful for committed updates.
- Participant-scoped privacy is correctly represented in command syntax, output, artifacts, and documentation.
- Debug-info artifacts are versioned, documented, and matched to package ids.
- All software is released as open source under Apache-2.0 unless otherwise agreed.
- Documentation includes local development and authorized remote participant workflows.

Ecosystem value will be measured by:

- Working CLI trace and interactive debugger demos against representative Canton examples.
- Feedback from Canton ecosystem developers, Daml/Canton maintainers, or Tech & Ops reviewers.
- A reviewed and documented debug-info format that can be reused by future tools.
- The adoption outcomes described in Milestone 5.

---

## Potential Follow-Ons

The work in this proposal is intended to be a foundation. Once the core toolchain is in place, several extensions become natural follow-ons. They are listed here for context only and are **not part of this funding request**. Any of them can be picked up later as separate proposals once the core deliverables have been validated by the ecosystem.

### Source and Debug Metadata Registry

An open-source registry for verified Daml source and debug metadata, so source-aware debugging works for packages a developer has not built locally.

This would not replace Canton package upload or package vetting. Vetting says a participant is willing to process a package; source/debug verification would say that a given source tree and debug-info artifact correspond to a given package id.

Likely shape:

- Hosted or permissioned instance for open-source Canton packages, examples, and ecosystem packages.
- Self-hosted/private instance for institutions that cannot publish source externally.
- Storage of DARs where permitted, source files, package ids, debug-info artifacts, template/choice/field metadata, source spans, and optional repository metadata.
- `dpm trace` lookup by package id to make historical traces source-aware.

Open questions to resolve before this becomes its own proposal:

- Reproducibility of `damlc` builds across SDK versions, OS, and build environments, and a verification status model that handles partial matches.
- Threat model: who can publish, anti-squatting on package ids, source poisoning, and spam control.
- Licensing of registry data, separate from the Apache-2.0 code license.
- How pre-existing DARs without debug info are represented.

### Other Likely Follow-Ons

- A web UI on top of the trace bundle format and debug-info format.
- A DAP-compatible adapter and VS Code extension for the interactive debugger.
- Simulation and what-if tooling on top of replay bundles.
- Profiling and coverage extensions built on top of the debug-info format.

---

## Funding

**Total Funding Request:** 1,900,000 Canton Coin

### Payment Breakdown by Milestone

- Milestone 1, Transaction Trace CLI: 320,000 CC upon committee acceptance
- Milestone 2, Trace Bundles: 320,000 CC upon committee acceptance
- Milestone 3, Interactive Debugger: 320,000 CC upon committee acceptance
- Milestone 4, Debug Information Format and Compiler Integration: 620,000 CC upon committee acceptance
- Milestone 5, Adoption and Ecosystem Validation: 320,000 CC upon committee acceptance and adoption criteria

---

## Co-Marketing

Walnut is happy to collaborate with Canton on co-marketing if there is interest. Examples of content we could create together:

- A technical blog post explaining transaction debugging under Canton’s participant privacy model.
- A short demo video showing `dpm trace`, interactive debugging, and source-aware traces.
- A follow-up writeup explaining committed update traces and source-aware debugging.

---

## Rationale

We are not starting with a hosted UI as the first deliverable (aka Tenderly for Canton mentioned in the survey).

The right first step is to build the debugging toolchain in layers:

1. A small trace command that proves committed updates can become developer-readable.
2. A trace bundle format for saving and replaying committed updates.
3. An interactive debugger for committed updates and trace bundles.
4. A debug-info format so source mapping is based on compiler-generated metadata.

## About the Team

Walnut is well suited for this work. Our team has four years of experience building blockchain debugging and observability tooling. We partner with leading ecosystems:

- Starkware / Starknet. We are building [Walnut Starknet Debugger](https://walnut.dev/), aka Tenderly for Starknet. Our work is end-to-end and involves debug info generation, tracing, transaction simulation, contract verificaiton, network forking and infra for hosting the debugger web app. 3-year ongoing partnership.
- Ethereum Foundation / Argot: [Debug info generation in the official Solidity compiler, ](https://github.com/argotorg/solidity)[`solc`](https://github.com/argotorg/solidity). We own debug info generation in solc - the official Solidity compiler. 1-year partnership, to be extended.
- Arbitrum/Offchain Labs: [StylusDB](https://github.com/OffchainLabs/stylus-sdk-rs/blob/main/cargo-stylus/docs/StylusDebugger.md), an official debugger for Stylus (Rust) and debugging Solidity \<\> Rust interoperability transactions.

---

## References

- JSON Ledger API OpenAPI: [https://docs.digitalasset.com/build/3.4/reference/json-api/openapi.html](https://docs.digitalasset.com/build/3.4/reference/json-api/openapi.html)
- Canton package management and vetting: [https://docs.daml.com/canton/usermanual/packagemanagement.html#understanding-package-vetting](https://docs.daml.com/canton/usermanual/packagemanagement.html#understanding-package-vetting)
- ETHDebug format: [https://ethdebug.github.io/format/](https://ethdebug.github.io/format/)
