# Development Fund Proposal: DPM Trace Transaction Visualization

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
  - [Milestone 2: Interactive Transaction Visualizer](#milestone-2-interactive-transaction-visualizer)
  - [Milestone 3: Prepared Transactions, Failed Submissions, and Diff Workflows](#milestone-3-prepared-transactions-failed-submissions-and-diff-workflows)
  - [Milestone 4: Adoption and Ecosystem Validation](#milestone-4-adoption-and-ecosystem-validation)
- [Acceptance Criteria](#acceptance-criteria)
- [Potential Follow-Ons](#potential-follow-ons)
- [Funding](#funding)
- [Co-Marketing](#co-marketing)
- [Rationale](#rationale)
- [About the Team](#about-the-team)
- [References](#references)

---

## Abstract

We propose to build dpm trace, an open-source DPM plugin for visualizing successful and prepared Canton transactions, and understanding why some submissions failed.

A developer should be able to run a single CLI command to inspect a successful transaction, a prepared transaction, or a failed submission.

The tool will show readable transaction views, provide an interactive visualizer, and help developers compare what was prepared with what actually succeeded or failed.

---

## Specification

### 1. Objective

Build the core tooling needed for Canton transaction visualization and comparison.

- Add `dpm trace` commands so developers can inspect successful transactions, prepared transactions, and failed submissions from the CLI.
- Add an interactive transaction visualizer so developers can navigate transaction trees.
- Add compare (diff) workflows so developers can compare prepared transaction outcomes with successful transactions or failed submissions.

We are open to adjusting the details with Canton developers, Daml/Canton maintainers, and the Tech & Ops Committee.

### 2. Motivation

The Canton developer survey mentions Tenderly-like or Foundry-like tooling. We agree with the direction, but a 1:1 copy does not fit Canton. We propose implementing only what matters for Canton.

We analysed the current Canton stack and found useful primitives that already exist:

- Transaction/update data is available through participant Ledger APIs, including the JSON Ledger API.
- Completions expose successful and failed submission outcomes for authorized clients.
- Daml Script and IDE flows can produce useful local traces while tests or scripts are running.
- Participants already upload DARs and use package vetting to control which packages they are willing to process.

The gaps are:

- There is no single DPM command for inspecting the trace of a successful transaction.
- There is no interactive visualization workflow for navigating a transaction tree, state changes, parties, arguments, payloads, and return values.
- There is no developer-friendly diff between a prepared transaction and an actual successful transaction.
- There is no developer-friendly diff between a prepared transaction and a failed submission, with error context that helps identify the root cause.
- There is no simple way to compare two updates that represent the same business operation.
- Daml/Canton tooling lacks rich, portable and versioned debug-info for reliable source-level debugging, including expression spans, execution step IDs, and consistent variable/value visibility.

This proposal focuses on those gaps, except for debug info generation which will be covered as a subsequent proposal.

### 3. Implementation Mechanics

The work is split into three core components.

#### DPM Trace CLI

Add a DPM plugin command:

```bash
dpm trace <update-id> \
  --submitter <participant-url> \
  --read-as <party> \
  --access-token-file <token-file>

dpm trace --command-id <command-id> \
  --submitter <participant-url> \
  --act-as <party> \
  --access-token-file <token-file> \
  --log-file <validator-or-participant-log>
```

For successful transactions, the command connects to an authorized participant endpoint, fetches the participant-visible update, decodes it, and renders a readable trace tree with templates, choices, arguments, payloads, return values, parties, and contract ids where visible.

For failed submissions, there may be no committed `update-id`. In that case, `dpm trace --command-id` reads the authorized completion stream and renders the completion status and error details instead of a transaction tree. In LocalNet and DevNet workflows, `--log-file` can attach validator or participant logs from the node where the dApp is running. For MainNet and TestNet, log attachment depends on what the validator operator is authorized and willing to provide.

The `--submitter` value is the Ledger API or JSON Ledger API endpoint used for the lookup. The authorization model is explicit: the user supplies that endpoint, an access token, and a party context such as `--read-as` or `--act-as`, depending on the operation. The access token can be passed with `--access-token-file`, directly with `--token`, or through an environment variable such as `DPM_TRACE_TOKEN`.

It uses existing APIs:

- `UpdateService.GetUpdateById`
- JSON Ledger API `/v2/updates/update-by-id`
- `CommandCompletionService.CompletionStream` for command completion data
- JSON Ledger API completions endpoint where available
- `PackageService.GetPackage` where package metadata is available
- optional event/query APIs for related visible contract payloads

Prepared transaction creation and comparison workflows are described in the "Prepare and Compare" section below.

#### Prepare and Compare

Add a workflow for visualizing a prepared transaction before submission:

```bash
dpm trace prepare \
  --submitter <participant-url> \
  --act-as <party> \
  --access-token-file <token-file> \
  --commands commands.json \
  --export prepared.json
```

`commands.json` is a user-provided command payload in the shape expected by Canton's prepare API.

This workflow runs Canton's non-committing prepare flow. It generates a trace tree similar to successful transactions. The result can be visualized and compared with a successful transaction or failed submission.

For failed submissions, there may be no committed `update-id`, so the CLI uses the command completion:

```bash
dpm trace --command-id <command-id> \
  --submitter <participant-url> \
  --act-as <party> \
  --access-token-file <token-file>
```

`command-id` is the existing Ledger API command identifier used to correlate a submitted command with its completion result.

Add compare commands:

```bash
dpm trace compare --prepared prepared.json --update <update-id>
dpm trace compare --prepared prepared.json --command-id <command-id>
dpm trace compare <update-id-a> <update-id-b>
```

`update-id` identifies a successful transaction/update with a committed event tree. `command-id` identifies a submitted command; for failed submissions, the tool uses completion data because there may be no committed `update-id`.

The comparison workflow should support:

- Prepared transaction vs actual successful transaction.
- Prepared transaction vs failed completion, including completion status and error details.
- Two successful transactions that represent the same business operation.
- State diff comparison for creates, archives, reassignments, payload changes, parties, and return values.

The comparison view should include:

- Clear labels for each side of the comparison, for example prepared, successful transaction, failed completion, baseline, and candidate.
- Operation summary showing whether the compared transactions have the same root operation shape.
- Event tree diff showing added, removed, or changed create/exercise/archive/reassignment events.
- Field/value diff for arguments, payloads, return values, parties, witnesses, signatories, observers, and contract ids where visible.
- Completion/error panel for failed submissions, including status, error message, command id, submission id, offset, trace context, and synchronizer time where available.
- Optional log match panel when validator or participant logs are attached.
- Participant/projection labels so users know which endpoint and party context produced each side.

It uses existing APIs:

- `InteractiveSubmissionService.PrepareSubmission`
- JSON Ledger API interactive submission equivalent where available
- `UpdateService.GetUpdateById` for successful transactions
- `PackageService.GetPackage` for value/package decoding where available

Failed submissions may not have an update_id. In that case the tool works from the completion. For failed submissions, dpm trace reads the authorized completion stream for the submitting context.

For LocalNet and DevNet workflows, the tool can also accept validator or participant logs from the node where the dApp is running. These logs are operator-provided diagnostics, not Ledger API transaction data. `dpm trace` should correlate them with completion data where possible, using identifiers such as command id, submission id, update id, trace context, timestamps, and error messages. For MainNet or TestNet validators, log access may depend on operational security policies of the validator operator.

#### Interactive Transaction Visualizer

Build an interactive visualizer for the three main inputs: successful transactions, prepared transactions, and failed submissions.

```bash
dpm trace <update-id> --visualize
dpm trace prepare --commands commands.json --visualize
dpm trace --command-id <command-id> --visualize
```

For successful transactions, the visualizer opens the committed transaction tree. For prepared transactions, it opens the non-committed prepare result. For failed submissions, there may be no transaction tree, so the visualizer opens the completion/error view and any attached log matches.

The visualizer should make transaction and diagnostic data easy to navigate:

- Expandable event tree for create, exercise, archive, and reassignment events where a transaction tree exists.
- Event details panel with arguments, payloads, return values, actors, witnesses, signatories, observers, and contract ids.
- Completion/error panel for failed submissions.
- Optional log match panel when validator or participant logs are attached.
- Large payload handling for templates with many fields: collapsed sections by default, field search, and paged/truncated rendering with an explicit continue/show-more action. It is very similar UX used by debuggers like LLDB and GNU GDB when they should show many information on the screen that does not fit the window (for example large backtraces).
- State diff panel for contracts created, archived, reassigned, or otherwise affected.
- Search and filters by template, choice, party, contract id, event type, package id, command id, and submission id.
- Source hints where existing package/project metadata can provide them.
- Symbol/source hints should reuse existing LF spans and project metadata where available, including information obtainable from `damlc inspect`, package manifests, and `daml.yaml`.
- Participant/projection labels so the user knows which participant and party rights produced the view.

### 4. Architectural Alignment

The design follows Canton architecture:

- It works through authorized participant endpoints and respects participant-scoped visibility.
- It uses DPM as the developer entry point, which keeps the UX close to existing Canton developer workflows.
- It uses existing Ledger API and JSON Ledger API primitives.
- It supports bearer-token based authorization through an access-token file, direct token argument, or environment variable, plus explicit party context.
- It complements package upload and package vetting instead of replacing them.
- It does not require Canton protocol changes, Canton node changes, Daml compiler changes, or Daml-LF interpreter changes.
- It handles failed submissions through completion data, without inventing a successful transaction that does not exist.

The proposal aligns directly with Daml Language & Developer Tooling, Canton APIs, and DAR Package Management priorities.

### 5. Backward Compatibility

The proposed solution is additive. It does not change existing Daml applications, Canton nodes, Ledger API semantics, package upload, or package vetting.

---

## Proof of Concept Implementation

As part of this proposal work, Walnut built a proof of concept to validate the core technical assumptions before asking for funding.

- `dpm trace` proof of concept: [https://github.com/walnuthq/dpm-trace](https://github.com/walnuthq/dpm-trace)
- Initial `damlc --debug-info` support branch: [https://github.com/walnuthq/daml/tree/feature/debug-info](https://github.com/walnuthq/daml/tree/feature/debug-info)

The proof of concept fetches successful transactions from an authorized participant, renders a readable trace tree, and demonstrates the shape of an interactive CLI inspection flow.

---

## Milestones and Deliverables

Milestones 1 and 2 first make successful transactions readable and navigable. Milestone 3 extends the same tooling to prepared transactions, failed submissions, and diff workflows.

### Milestone 1: Transaction Trace CLI

**Estimated Delivery:** 4 weeks from start<br>
**Estimated Effort:** 8 engineer-weeks<br>
**Focus:** One useful command to inspect successful transactions.

**Deliverables / Value Metrics:**

- `dpm trace <update-id>` plugin command.
- Support for local and remote participant JSON Ledger API endpoints.
- Support for `--submitter`, `--read-as`, and bearer-token based access through token files, direct token arguments, or environment variables.
- Human-readable transaction tree for successful transactions.
- Create, exercise, archive, and reassignment event rendering.
- Contract ids, parties, witnesses, signatories, observers, choice arguments, return values, and payloads where visible.
- Participant-visible projection labeling.
- Documentation with a local Canton example and an authorized remote participant example.

**Acceptance Criteria:**

- A developer can run `dpm trace <update-id> --submitter <url> --read-as <party>` against a local Canton participant and inspect a successful transaction.
- The same command shape works against an authorized remote participant endpoint.
- The CLI renders a readable transaction tree for create, exercise, archive, and reassignment events where present.
- Output labels the result as a participant-visible projection and does not imply access to non-visible private data.
- At least three representative Daml examples are included: create, exercise with child create, and archive/consuming exercise.

### Milestone 2: Interactive Transaction Visualizer

**Estimated Delivery:** 4 weeks after Milestone 1 acceptance<br>
**Estimated Effort:** 8 engineer-weeks<br>
**Focus:** Make transaction trees easy to navigate and understand.

**Deliverables / Value Metrics:**

- `dpm trace <update-id> --visualize` for successful transaction visualization.
- Expandable transaction tree.
- Event details panel.
- Large payload handling for contracts and templates with many fields.
- State diff panel.
- Search and filters by template, choice, party, contract id, event type, and package id.
- Participant/projection labels shown in the visualizer.
- Best-effort symbol/source hints when local project metadata is available.
- Documentation explaining visualizer usage and privacy limits.

**Acceptance Criteria:**

- A developer can open an interactive visualizer from a successful transaction without manually reading JSON.
- The visualizer can navigate a representative transaction tree with nested exercise/create events.
- Search and filters work for at least template, choice, party, and contract id.
- Large payloads remain navigable without flooding the screen, using collapsed sections, field search, and explicit show-more behavior.
- The state diff view clearly shows created and archived contracts where present.
- Documentation clearly states that the visualizer shows a participant-visible projection, not a global transaction record.

### Milestone 3: Prepared Transactions, Failed Submissions, and Diff Workflows

**Estimated Delivery:** 5 weeks after Milestone 2 acceptance<br>
**Estimated Effort:** 10 engineer-weeks<br>
**Focus:** Help developers understand why intended and actual outcomes differ.

**Deliverables / Value Metrics:**

- `dpm trace prepare --commands commands.json` for preparing and visualizing prepared transaction data before submission.
- Prepared transaction results labeled as prepared, not committed.
- `dpm trace --command-id <command-id>` for inspecting failed submissions through completion data.
- Visualizer support for prepared transactions and failed completion/error views.
- `dpm trace compare --prepared prepared.json --update <update-id>`.
- `dpm trace compare --prepared prepared.json --command-id <command-id>` using the authorized completions endpoint for failed submissions.
- `dpm trace compare --prepared prepared.json --completion-file completion.json` for captured completion/error files.
- `dpm trace compare <update-id-a> <update-id-b>`.
- Diff view for event tree changes, state diff changes, parties, arguments, payloads, return values, and completion status.
- Support for inspecting failed submissions through completion data where available.
- Failed-completion comparison based on completion status, error details, submission id, trace context, offset, parties, and synchronizer time.
- Optional operator-provided validator/participant log attachment for LocalNet and DevNet diagnostics.
- Documentation explaining what can and cannot be compared.

**Acceptance Criteria:**

- A developer can run the prepare flow without committing and inspect the prepared transaction result.
- A developer can run `dpm trace --command-id <command-id>` and inspect completion status and error details for a failed submission.
- A developer can compare a prepared transaction result with a successful transaction.
- A developer can compare a prepared transaction result with a failed completion where the completion is available.
- A developer can compare two successful transactions and see event/state differences.
- Failed-completion views show completion status and error details without claiming that a failed submission has an update id.
- Failed-completion comparison works from a documented completion/error file and does not require log access.

### Milestone 4: Adoption and Ecosystem Validation

**Estimated Delivery:** 4 weeks after Milestone 3 acceptance<br>
**Estimated Effort:** 4 engineer-weeks plus support during the adoption window<br>
**Focus:** Prove that the tooling is useful to Canton developers outside Walnut.
**Note:** We are already in talks with three organizations building on Canton who expressed interest in trying the tool or sharing feedback (including a team from Goldman Sachs).

**Deliverables / Value Metrics:**

- Public release of the `dpm trace` plugin with installation instructions.
- Getting-started guide covering local Canton, authorized remote participant usage, visualization, prepare, and compare.
- At least one short demo video or recorded walkthrough.
- Outreach to Canton ecosystem developers, Daml/Canton maintainers, and Tech & Ops reviewers for hands-on testing.
- Feedback collection from at least three independent organizations using Canton or building Canton applications.
- Fixes or follow-up issues for adoption-blocking bugs found during the adoption window.
- Short adoption report summarizing who tested the tool, what workflows were tested, whether it sped up development, and what should be improved next.

**Acceptance Criteria:**

- At least three independent organizations run the trace workflow against a dApp project and confirm whether it sped up development and how.
- At least two independent organizations test the visualizer or compare workflow, confirmed by written feedback, public issue/PR activity, or other verifiable evidence.
- The getting-started guide lets a new user produce their first trace without Walnut assistance.
- Adoption feedback is published as a short report with concrete follow-up items.
- Any critical issue that blocks the documented happy path is fixed or explicitly documented with a workaround.

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- The delivered tools work on the current stable DPM/Daml SDK version at the time of development.
- The CLI commands can be installed and run in a clean environment.
- Trace and visualizer output is useful for successful transactions.
- Prepare and compare workflows are useful for understanding intended vs actual outcomes.
- Participant-scoped privacy is correctly represented in command syntax, output, and documentation.
- Failed completion handling uses completion data without implying a successful transaction exists.
- All software is released as open source under Apache-2.0 unless otherwise agreed.
- Documentation includes local development and authorized remote participant workflows.

Ecosystem value will be measured by:

- Working CLI trace, visualizer, prepare, and compare demos against representative Canton examples.
- Feedback from Canton ecosystem developers, Daml/Canton maintainers, or Tech & Ops reviewers.
- Adoption outcomes described in Milestone 4.

---

## Potential Follow-Ons

The work in this proposal is intentionally limited to transaction visualization, prepare, compare, and adoption. Several follow-ons become natural once these primitives are validated. They are listed here for context only and are **not part of this funding request**.

### Compiler Source Metadata

A versioned source/debug metadata schema and richer compiler-emitted debug information may be valuable follow-on work. This should build on existing LF spans and be scoped as a separate proposal with Daml/Canton maintainers.

### Source and Metadata Registry

A Sourcify-like registry may be useful later for verified Daml source and metadata, especially for packages a developer has not built locally. This would not replace Canton package upload or package vetting. Vetting says a participant is willing to process a package; source/metadata verification would say that a given source tree corresponds to a given package id.

### Other Likely Follow-Ons

- A hosted web UI on top of trace visualization and comparison workflows.
- A DAP-compatible adapter and VS Code extension if source-level tooling becomes a separate workstream.
- More advanced simulation and what-if tooling.
- Profiling and coverage tooling if a debug-info format is standardized later.

---

## Funding

**Total Funding Request:** 1,900,000 Canton Coin

The funding is split so that roughly half is tied to delivery and roughly half is tied to ecosystem adoption.

### Payment Breakdown by Milestone

- Milestone 1, Transaction Trace CLI: 320,000 CC upon committee acceptance
- Milestone 2, Interactive Transaction Visualizer: 320,000 CC upon committee acceptance
- Milestone 3, Prepared Transactions, Failed Submissions, and Diff Workflows: 310,000 CC upon committee acceptance
- Milestone 4, Adoption and Ecosystem Validation: 950,000 CC upon committee acceptance and adoption criteria

---

## Co-Marketing

Walnut is happy to collaborate with Canton on co-marketing if there is interest. Examples of content we could create together:

- A technical blog post explaining transaction visualization under Canton's participant privacy model.
- A short demo video showing `dpm trace`, the transaction visualizer, and compare workflows.
- A follow-up writeup explaining lessons from the adoption window.

---

## Rationale

We are not starting with a hosted UI as the first deliverable.

The right first step is to build the transaction inspection toolchain in layers:

1. A trace command that makes successful transactions developer-readable.
2. An interactive visualizer for navigating transaction trees and state changes.
3. Prepare and compare workflows for intended vs actual outcomes.
4. Adoption validation with independent Canton organizations.

This gives Canton developers useful tooling quickly without requiring protocol, node, compiler, or runtime changes.

## About the Team

Walnut is well suited for this work. Our team has four years of experience building blockchain debugging and observability tooling. We partner with leading ecosystems:

- Starkware / Starknet. We are building [Walnut Starknet Debugger](https://walnut.dev/), aka Tenderly for Starknet. Our work is end-to-end and involves debug info generation, tracing, transaction simulation, contract verificaiton, network forking and infra for hosting the debugger web app. 3-year ongoing partnership.
- Ethereum Foundation / Argot: [Debug info generation in the official Solidity compiler, ](https://github.com/argotorg/solidity)[`solc`](https://github.com/argotorg/solidity). We own debug info generation in solc - the official Solidity compiler. 1-year partnership, to be extended.
- Arbitrum/Offchain Labs: [StylusDB](https://github.com/OffchainLabs/stylus-sdk-rs/blob/main/cargo-stylus/docs/StylusDebugger.md), an official debugger for Stylus (Rust) and debugging Solidity \<\> Rust interoperability transactions.

---

## References

- JSON Ledger API OpenAPI: [https://docs.digitalasset.com/build/3.4/reference/json-api/openapi.html](https://docs.digitalasset.com/build/3.4/reference/json-api/openapi.html)
- gRPC Ledger API Reference: [https://docs.digitalasset.com/build/3.4/reference/lapi-proto-docs.html](https://docs.digitalasset.com/build/3.4/reference/lapi-proto-docs.html)
- Canton package management and vetting: [https://docs.daml.com/canton/usermanual/packagemanagement.html#understanding-package-vetting](https://docs.daml.com/canton/usermanual/packagemanagement.html#understanding-package-vetting)
