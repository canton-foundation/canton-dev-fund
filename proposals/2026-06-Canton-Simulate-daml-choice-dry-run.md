# Development Fund Proposal: DAML Choice Dry-Run Simulator

**Author:** Federico Abrignani, Salvatore Martorana (github.com/Sernior)
**Status:** Draft
**Created:** 2026-06-12
**Label:** daml-tooling
**[Champion](https://github.com/canton-foundation/canton-dev-fund/blob/main/sig-directory.md):** need Champion

---

## Abstract

A dry-run simulator for DAML choices. Given a live contract and a choice you want to exercise, it returns exactly what would happen (which contracts are created, which are archived, the choice return value, and any authorization errors) without writing anything to the ledger. It runs the same DAML LF engine Canton uses internally to validate transactions before commit, fed with the real contract fetched over the Ledger API, so the result matches what an actual submission would produce. In Ethereum terms, this is the `eth_call` that Canton does not have today. The deliverables are a `daml simulate` CLI and a TypeScript SDK, with a working proof of concept already validated on Canton 3.x.

---

## Specification

### 1. Objective

Give Canton developers the ability to preview the exact effects of a DAML choice before submitting it. Today the only way to find out what a choice does is to submit it and read the result off the ledger, which turns development into a trial-and-error loop, slows CI, and makes it impossible for a UI to show a user the consequences of an action before they confirm it.

Single objective: build the simulator and ship it as a CLI (`daml simulate`) and a TypeScript SDK. No web UI, no hosted service, no fee estimation (that is a separate concern). One tool that does one job.

### 2. Implementation Mechanics

The simulator fetches the target contract from Canton over the Ledger API, runs the requested choice through the DAML LF engine with that contract supplied as an explicit disclosure, and reads back the resulting transaction without committing it. Because it uses the real engine rather than a model or historical data, the predicted creates, archives, authorization outcome, and return value match what an actual submission would produce.

It drives `com.digitalasset.daml.lf.engine.Engine` directly (the same interpreter Canton uses to validate transactions before commit). The contract is injected as an explicit disclosure: the engine computes the resulting transaction and we read it and never apply the ledger update. For the fetch it calls the Ledger API v2 `EventQueryService.GetEventsByContractId` with the `created_event_blob`, which decodes straight into the contract instance the engine consumes.

It ships as:

- `daml simulate`, a CLI that takes a contract id, a choice, its arguments, and the acting party, and returns a JSON result listing created contracts (with payloads), archived contracts, the return value, and any authorization errors.
- A TypeScript SDK that wraps the CLI with generated types, for use in frontends and CI.

**Proof of concept (already working).** A prototype demonstrates the full mechanism end to end on Canton 3.x, the line the network runs. Against a live participant it fetches a real on-ledger contract over the Ledger API v2, exercises a choice on it, and computes the resulting transaction (the original contract archived, a new one created) while writing nothing back to the ledger; the fetched contract stays active afterward. It also detects authorization failures: the same choice attempted by a party that is not the controller is rejected with a precise `FailedAuthorization`. Source, clone-and-run: https://github.com/Sernior/Canton-Simulate (`daml build`, then `bash build.sh`).

**Scope and limitations.** The result is exact for everything the DAML LF engine decides, which is most of what blocks developers day to day: authorization, created contracts and their field values, archived contracts, the choice return value, and `ensure`/`assert` violations. It does not see the Canton layers above the engine (package vetting on the synchronizer, concurrent conflicts and staleness, topology and domain routing, mediator and sequencer timeouts). This is the same boundary `eth_call` lives within. The result reflects contract state at fetch time; if the contract is archived before real submission, that submission fails with a not-active error, and the CLI output carries a timestamp and contract version so staleness is visible rather than silent. The simulator does not estimate fees.

The technical risk is low: the proof of concept proves the core works on the real engine. The work funded here is breadth and productization (a correct CLI, a typed SDK, all DAML value and error types, transitive-dependency and contract-key handling, testing against a real testnet), and the maintenance surface stays small because it composes existing SDK interfaces rather than forking the engine.

### 3. Architectural Alignment

- Developer experience and tooling: it closes a named gap (no pre-execution choice simulation) that every team building on Canton hits, lowering the barrier to entry and shortening the development loop.
- It builds on stable, public interfaces (the Ledger API v2 and the DAML LF engine) rather than forking or modifying any core component, so it adds capability without protocol risk and stays cheap to maintain across releases.
- All artifacts (engine, CLI, SDK, JSON schema, fixture corpus) are released under Apache-2.0 for ecosystem-wide reuse, including by other tools such as IDE extensions and CI runners.
- Relevant SIGs: Daml Language and Developer Tooling, and Canton APIs.

### 4. Backward Compatibility

No backward compatibility impact. This is a read-only tool. It does not modify the protocol, the node, ledger state, or the DAML runtime. It reads a contract over the Ledger API and runs the engine locally. Existing integrations require no changes.

---

## Milestones and Deliverables

Week numbers are relative to grant acceptance. Milestone 1 is a small go/no-go gate that produces a working end-to-end proof against a real Canton ledger plus a published spec, both useful on their own even if later milestones do not proceed.

### Milestone 1: Real-ledger proof and specification

- **Estimated Delivery:** Week 3
- **Focus:** End-to-end path against Sandbox and Canton Network Testnet, plus a published technical spec. A deliberately small gate that de-risks the rest.
- **Deliverables / Value Metrics:** Fetch the target contract, run the choice through the engine, read the result without committing, including at least one choice that depends on a second contract. Publish the technical spec and a documented account of the gap. A reproducible run on a real testnet contract returns correct creates, archives, and authorization outcome, matching an actual submission. Spec published under Apache-2.0.

### Milestone 2: Core engine

- **Estimated Delivery:** Week 7
- **Focus:** A complete, correct engine layer covering the full range of DAML.
- **Deliverables / Value Metrics:** Contract fetch, disclosure, engine call without commit, transaction extraction, handling for all DAML LF error types, on-demand resolution of dependent contracts and contract keys. Published to Maven. Simulated results match actual submission at 95% or better on a published fixture corpus across consuming, non-consuming, and nested choices; every error type returns structured output.

### Milestone 3: CLI

- **Estimated Delivery:** Week 9
- **Focus:** The `daml simulate` command and a stable JSON output other tools can consume.
- **Deliverables / Value Metrics:** `daml simulate` with JSON output schema v1, gRPC and mTLS support, full help text. Installable standalone or as a daml plugin; schema published; all authorization error variants produce actionable structured output.

### Milestone 4: TypeScript SDK

- **Estimated Delivery:** Week 11
- **Focus:** Make the simulator usable from frontends and CI without leaving TypeScript.
- **Deliverables / Value Metrics:** Typed SDK over the CLI, types generated from the DAR, a working React example, npm package published under Apache-2.0. Choice argument errors are caught at compile time. At least one external developer confirms the SDK works in their project.

### Milestone 5: Hardening, docs, testnet validation

- **Estimated Delivery:** Week 12
- **Focus:** Make it adoptable and trustworthy.
- **Deliverables / Value Metrics:** End-to-end runs against Canton Network Testnet, golden-path docs, tutorials for the three common cases (pre-submission check, CI assertion, frontend preview), security review of the fetch and disclosure path. At least one external developer runs the tool against their own contracts and gives feedback.

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on ecosystem value, not artifact delivery alone:

- **Correctness:** on a published fixture corpus, output matches real ledger behaviour at 95% or better across consuming, non-consuming, and nested choices, validated against a live Canton participant.
- **Coverage:** all DAML authorization error types produce structured, actionable output rather than raw stack traces.
- **Openness:** engine, CLI, SDK, JSON schema, and fixtures all published under Apache-2.0.
- **Adoption signal:** at least one external Canton developer runs the tool against their own contracts and provides feedback, shown through composite evidence (written feedback, GitHub issues or pull requests, or a demo) rather than any single metric.

---

## Funding

**Total Funding Request: 480,000 CC**

### Payment Breakdown by Milestone

- Milestone 1 (Real-ledger proof and spec): 100,000 CC upon committee acceptance
- Milestone 2 (Core engine): 150,000 CC upon committee acceptance
- Milestone 3 (CLI): 100,000 CC upon committee acceptance
- Milestone 4 (TypeScript SDK): 80,000 CC upon committee acceptance
- Milestone 5 (Hardening, docs, testnet): 50,000 CC upon final release and acceptance

Milestone 1 is deliberately small so the fund risks little before the larger milestones unlock.

### Volatility Stipulation

The project duration is under 6 months (about 12 weeks). Should the timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility.

---

## Co-Marketing

Upon release, the team will collaborate with the Foundation on:

- Announcement coordination at the release
- A technical write-up of how the simulator drives the DAML LF engine, useful for other tooling builders
- A short demo showing the `eth_call`-style workflow that Ethereum developers already know
- A talk at a Canton or DAML developer community call, on request

---

## Motivation

Right now the only way to find out what a DAML choice does is to submit it and read the result off the ledger. Every team building on Canton hits this, on every choice, during development and on every environment promotion. The gap is documented: PR #171 (Fee Estimator) noted in its own text that "the Ledger API (v2) does not expose a public dry-run simulation endpoint comparable to Cosmos simulate", and worked around it statistically. PRs #297 and #327 handle debugging after a transaction has already run. Nothing addresses the before case.

Who benefits, and how much of the ecosystem:

- **Effectively 100% of dApp teams.** Every team validates choice behaviour during development, and today they do it by hand against a Sandbox. This is the direct, primary audience.
- **Frontend applications** that want to preview an action's effects for a user before they confirm it, which the TypeScript SDK makes possible.
- **CI pipelines** for any team running Canton integration tests, which gain a fast pre-submission check without a full ledger round trip.
- **New DAML developers**, for whom choice behaviour being invisible until execution is part of why the learning curve is steep.

---

## Rationale

The tool reuses the DAML LF engine Canton already runs, so results match the ledger by construction rather than by correlation. It extends the existing ecosystem rather than replacing any component: it builds on the public Ledger API v2 and the DAML LF engine, and complements the Fee Estimator (which estimates cost) and the Transaction Debugger (which inspects after the fact) by covering the missing pre-execution case.

Alternatives considered:

- A disposable Sandbox per simulation: needs full JVM startup and a replica of ledger state, and does not scale to CI. Explicit disclosure lets us inject only the target contract and keeps latency low.
- A Ledger API intercept or Canton fork: requires changing participant internals, would not survive releases, and is out of scope for external tooling. The default of extending what exists is exactly what this proposal does.

---

## License

This proposal text is dedicated to the public domain under CC0-1.0. All software produced under this grant is licensed under Apache-2.0.
