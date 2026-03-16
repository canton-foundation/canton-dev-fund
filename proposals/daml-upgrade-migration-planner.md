## Development Fund Proposal

**Author:** Petr Mensik, Ruby Nodes  
**Status:** Draft  
**Created:** 2026-03-16  

---

## Abstract

Upgrading Daml packages on Canton is a multi-step process that touches package upload, vetting topology transactions, dependency ordering, and synchronizer-scoped state. The platform provides good primitives for each step — `dpm upgrade-check` for compile-time type compatibility, `ValidateDarFile` for server-side validation without side effects, `UpdateVettedPackages` with `dry_run` for vetting simulation — but no tool connects them into a single, reviewable migration plan that accounts for a participant's actual deployed state.

The Daml Upgrade Migration Planner is a CLI tool that inventories a participant's current package and vetting state, analyzes one or more proposed DAR files against that state, and produces a concrete, ordered migration plan: what to upload, in what sequence, what vetting transactions to issue, what force flags may be required, what the expected end state looks like, and what can be rolled back if something goes wrong. The output is a structured artifact (JSON + Markdown) suitable for team review, change ticket attachment, or CI gate integration.

---

## Specification

### 1. Objective

A team has `payments-v1.dar` (3 packages) deployed on their Canton participant, vetted across two synchronizers. They want to deploy `payments-v2.dar` (4 packages — 2 upgrades of existing packages, 1 new package, 1 unchanged dependency) and `reporting-v2.dar` (2 packages that depend on types from `payments-v2`). The question: what exact steps do I take to get from here to there safely?

Today the answer is manual. The operator reads the upgrade documentation, inspects package state via console commands or Admin API calls, mentally computes the dependency graph, determines upload order, figures out which vetting transactions to issue on which synchronizers, checks whether force flags are needed, and hopes they haven't missed a step.

This manual process has concrete failure modes:

**Dependency ordering mistakes.** `reporting-v2.dar` depends on packages from `payments-v2.dar`. Uploading `reporting-v2.dar` first will fail validation. With transitive dependencies across multiple DARs, sequencing becomes non-trivial.

**Partial vetting.** On multi-synchronizer participants (the norm in Canton 3.4.4+), vetting is per-synchronizer. A package vetted on synchronizer X but not synchronizer Y will cause transaction failures for workflows that span both. The operator must track which synchronizers need which packages vetted.

**Force flag surprises.** Vetting upgrade-incompatible packages requires `FORCE_FLAG_ALLOW_VET_INCOMPATIBLE_UPGRADES`. Discovering this at vetting time, rather than planning time, creates unnecessary risk during rollout windows.

**Missing rollback planning.** If something goes wrong mid-upgrade, the operator needs to know: which vetting transactions were issued? What is the `expected_topology_serial` to use for reverting? Which uploads completed (and cannot be reversed)? Today this information is not captured as a pre-computed artifact.

**No reviewable artifact.** There is no document a team lead or SRE can review before the rollout window that says "here is exactly what will happen, step by step." The plan lives in the operator's head.

The intended outcome is a CLI tool that replaces this manual planning with a deterministic, reviewable, machine-parseable migration plan derived from a participant's current state and a set of proposed DAR files.

### 2. Implementation Mechanics

#### Three-phase workflow

The planner works in three phases. The tool is read-only by default — it queries existing APIs, runs existing validation, and generates a plan document. It does not upload packages, issue vetting transactions, or modify participant state unless an explicit rehearsal mode is invoked.

**Phase 1 — State Discovery.** The tool connects to a Canton participant via the Admin API and Ledger API (or reads a previously exported state snapshot). It queries uploaded packages, their metadata (name, version, dependencies), and vetting state per synchronizer. It builds an internal model of the participant's current package graph.

**Phase 2 — DAR Analysis.** The tool reads proposed DAR files from the local filesystem. It parses each DAR to extract contained packages, their metadata, dependency relationships, and upgrade lineage (the `upgrades:` field). It calls `ValidateDarFile` against the participant to check server-side validation without side effects. It builds a proposed package graph.

**Phase 3 — Plan Generation.** The tool diffs the current state against the proposed state. It computes:

- **Upload sequence:** which DARs to upload in what order, respecting dependency constraints. In the example above: `payments-v2.dar` before `reporting-v2.dar`.
- **Vetting sequence:** which packages to vet on which synchronizers, in what order.
- **Preconditions:** what must be true before each step (e.g., "payments-v2 packages must be uploaded before reporting-v2").
- **Warnings:** situations that require force flags, packages that would shadow existing versions, vetting operations that affect multiple synchronizers.
- **Expected end state:** the full package/vetting state after the plan executes successfully.
- **Rollback guidance:** for vetting steps, the topology serial to revert to using CAS. For upload steps: do not proceed to vetting (uploads are irreversible — once a DAR is uploaded, it cannot be removed, but it has no effect until vetted).

The output is a structured plan in JSON (for CI consumption) and Markdown (for human review). The planner exits with code 0 if the migration is feasible, 1 if it has warnings, and 2 if the migration is not feasible.

#### Concrete scenario output

For the `payments-v2.dar` + `reporting-v2.dar` scenario above, the plan would produce:

1. **Upload** `payments-v2.dar` — precondition: participant reachable. Adds 3 new package IDs (2 upgrades, 1 new).
2. **Upload** `reporting-v2.dar` — precondition: payments-v2 packages uploaded. Adds 2 new package IDs.
3. **Vet** payments-v2 packages on synchronizer A — precondition: packages uploaded. Records topology serial before change.
4. **Vet** payments-v2 packages on synchronizer B — same packages, second synchronizer.
5. **Vet** reporting-v2 packages on synchronizer A — precondition: payments-v2 vetted (dependency).
6. **Vet** reporting-v2 packages on synchronizer B.
7. **Warning:** if payments-v2 contains an upgrade-incompatible change, step 3 requires `FORCE_FLAG_ALLOW_VET_INCOMPATIBLE_UPGRADES`.
8. **Rollback:** to revert step 6, unvet reporting-v2 on synchronizer B using `expected_topology_serial` from pre-step-6 state. Repeat in reverse order. Upload steps (1–2) cannot be reversed.

The JSON output for CI/CD consumption mirrors this sequence structurally. For example, the first upload step:

```json
[
  {
    "step": 1,
    "type": "upload",
    "target": "payments-v2.dar",
    "irreversible": true,
    "preconditions": [
      "participant_reachable"
    ]
  }
]
```

#### Architecture and components

The tool is implemented as a single CLI binary in Kotlin, compiled to a native executable via GraalVM native-image for fast startup and dependency-free distribution. Kotlin was chosen for direct reuse of existing Canton/Daml protobuf bindings and alignment with the JVM-based Canton ecosystem. GraalVM native-image provides the single-binary distribution and sub-second startup that a CLI tool requires. Rust was considered for its native binary story but the protobuf binding reuse and ecosystem alignment favored Kotlin.

The internal architecture has four modules:

**State Adapter.** Connects to the Canton participant's Admin API (v30) and Ledger API (v2) via gRPC, supporting independent mTLS/JWT authentication profiles for the Ledger API vs Admin API to respect production network boundaries. Provides a `ParticipantState` model: uploaded packages with metadata and dependencies, vetting state per synchronizer with topology serials, connection metadata. Can serialize to JSON for offline analysis.

**DAR Analyzer.** Reads DAR files from the filesystem. DARs are ZIP archives containing protobuf-encoded DALF (Daml-LF) files and a manifest. Extracts package IDs, names, versions, dependency lists, and upgrade metadata. Does not evaluate Daml expressions — only reads structural metadata.

**Plan Engine.** Core deterministic logic. Inputs: `ParticipantState` + list of analyzed DARs. Outputs: ordered list of `PlanStep` objects. Each step has a type (Upload, Vet, Unvet), a target (package ID, synchronizer ID), preconditions, expected outcome, warnings, and inverse operation (where reversible). The engine implements:

- Topological sort of upload order based on dependency graph.
- Per-synchronizer vetting sequencing.
- Force flag detection via `UpdateVettedPackages` with `dry_run: true`.
- Conflict detection: packages that would shadow existing versions.
- Rollback step generation: for vetting steps, records the topology serial anchor for CAS-style reversion. For upload steps, notes irreversibility.

**Reporter.** Produces output artifacts. JSON output follows a versioned schema. Markdown output uses a fixed template with step numbering, precondition callouts, and a summary table. Both formats include a metadata header (tool version, participant ID, timestamp, input DAR hashes).

CLI subcommands: `plan` (full workflow), `snapshot` (export current state), `analyze` (offline DAR analysis), `diff` (compare two state snapshots). Supports `--output json`, `--output markdown`, `--participant` connection flags, `--strict` (exit non-zero on warnings), and `--require-no-force-flags`.

#### Non-goals

- **Not a package manager.** This tool does not host, resolve, download, or version-manage DAR files. It takes DARs as filesystem inputs.
- **Not a release orchestration platform.** This tool produces a plan. It does not execute the plan (except in rehearsal mode, which uses only read-only/dry-run API calls).
- **Not a reimplementation of Daml upgrade checks.** The planner delegates to `dpm upgrade-check` and `ValidateDarFile` for compatibility validation.
- **Not a vetting drift monitor.** This tool produces a point-in-time migration plan, not a continuous monitoring signal.
- **Not a dashboard or web UI.** The output is CLI text, JSON, and Markdown.
- **Not a multi-participant coordinator.** The planner operates against a single participant's state. Per-participant plans are a building block toward multi-party upgrade coordination, but the coordination protocol itself — ensuring all counterparties vet before contracts are published — requires a different trust model and is a strong candidate for a follow-up grant.

### 3. Architectural Alignment

The tool is a thin orchestration layer over Canton's existing package management APIs, not a reimplementation of Canton internals.

Canton provides several upgrade-related primitives:

- **`dpm upgrade-check --compiler old.dar new.dar`** — compile-time type compatibility. Does not know what the participant currently has uploaded or vetted. Does not produce a migration plan.
- **`ValidateDarFile`** (Ledger API v2) / **`ValidateDar`** (Admin API v30) — same validation as upload, without side effects. Does not tell you the order for multiple DARs or check vetting implications.
- **`UpdateVettedPackages` with `dry_run: true`** (Admin API, 3.4.4+) — previews a single vetting change without broadcasting. Does not sequence multiple operations.
- **`ListVettedPackages`** and package listing APIs — expose current state. Data sources, not planning tools.

Each of these primitives answers one question. None answers the compound question: "Given my current state and these new DARs, what is the complete, ordered, safe migration sequence?" That is the gap this tool fills — by delegating validation to Canton's own APIs rather than reimplementing their logic.

The tool requires Canton 3.4.x APIs:

- Admin API v30: `ValidateDar`, `UpdateVettedPackages` (with `dry_run`), package listing and vetting state queries.
- Ledger API v2: `ValidateDarFile`, `ListPackages`.
- Canton 3.4.4+ requires `synchronizer_id` on package management calls. The tool queries available synchronizers and iterates.

Known constraint: no single API returns all packages with full dependency metadata and vetting state across all synchronizers. The tool combines multiple API calls and joins results.

The `UpdateVettedPackages` `dry_run` feature is critical for force flag detection. On Canton versions before 3.4.4, force flag detection is marked "unavailable — manual verification required" and the plan proceeds with a warning.

### 4. Backward Compatibility

*No backward compatibility impact.* This is a new, standalone CLI tool. It reads from Canton APIs without modifying participant state (the rehearsal mode uses only `dry_run` and validation APIs). It does not alter any existing Canton components, workflows, or integrations.

---

## Milestones and Deliverables

### Milestone 1: State Discovery and DAR Analysis
- **Estimated Delivery:** Week 4
- **Focus:** Build the state adapter and DAR analysis modules. Prove the core data model works with real Canton packages. This milestone produces the `ParticipantState` model and DAR metadata extraction that all subsequent milestones build on.
- **Deliverables / Value Metrics:**
  - CLI with `snapshot` command (connect to participant, export state as JSON)
  - CLI with `analyze` command (parse DARs, produce metadata + dependency report)
  - JSON snapshot schema (versioned, documented)
  - DAR parser covering Daml-LF package metadata extraction
  - `ParticipantState` data model used by M2's plan engine
  - Golden fixture test scenarios with deterministic expected outputs
  - Unit tests covering DAR parsing and snapshot serialization

### Milestone 2: Core Migration Plan Engine
- **Estimated Delivery:** Week 8
- **Focus:** Build the plan engine that diffs participant state against proposed DARs and produces a complete, ordered migration plan. This is the core product milestone.
- **Deliverables / Value Metrics:**
  - CLI `plan` command (connect to participant + read DARs → full migration plan)
  - Plan engine with topological upload ordering and per-synchronizer vetting sequencing
  - Rollback plan generation with topology serial anchors for vetting steps; irreversibility noted for upload steps
  - Markdown report (step-numbered, preconditions, expected outcomes, rollback section)
  - JSON plan schema (versioned)
  - Covers the `payments-v2.dar` + `reporting-v2.dar` canonical scenario end-to-end
  - Golden fixture scenarios covering multi-DAR and multi-synchronizer cases
  - Unit and integration tests covering plan engine logic

### Milestone 3: Force Flag Detection, CI Gate, and Rehearsal
- **Estimated Delivery:** Week 11
- **Focus:** Add force flag detection via `UpdateVettedPackages(dry_run=true)`, CI gate integration, and optional rehearsal mode. Rehearsal runs against a single localnet participant using only read-only/dry-run API calls.
- **Deliverables / Value Metrics:**
  - Force flag detection: plan warns when `FORCE_FLAG_ALLOW_VET_INCOMPATIBLE_UPGRADES` or `FORCE_FLAG_ALLOW_UNVETTED_DEPENDENCIES` is required
  - CI gate mode: `--strict` and `--require-no-force-flags` flags, exit codes 0 (clean) / 1 (warnings) / 2 (infeasible)
  - `plan --rehearse` flag that executes validation and dry-run API calls per plan step
  - Rehearsal report: per-step pass/fail with error details
  - Graceful degradation on pre-3.4.4 participants (force flag detection marked unavailable)
  - Additional fixture scenarios for force flag and CI gate cases
  - Unit and integration tests for force flag detection and CI gate behavior

### Milestone 4: Documentation, Packaging, and End-to-End Validation
- **Estimated Delivery:** Week 14
- **Focus:** Package for distribution, write reference documentation, validate end-to-end against cn-quickstart.
- **Deliverables / Value Metrics:**
  - Prebuilt binaries for Linux (amd64) and macOS (amd64, arm64) via GitHub Releases
  - Docker image published to GitHub Container Registry
  - Documentation: installation guide, quickstart (5-minute walkthrough), reference for all CLI commands and flags, worked example against cn-quickstart, CI integration guide
  - End-to-end integration tests running full plan + rehearse cycle against cn-quickstart localnet
  - All golden fixtures passing on Canton 3.4.x

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone
- Demonstrated functionality or operational readiness
- Documentation and knowledge transfer provided
- Alignment with stated value metrics

The following conditions apply across milestones:

- Deterministic plan output: same participant state + same DARs = same plan JSON, byte-for-byte (modulo timestamp)
- Correctly sequences uploads respecting dependency order across multi-DAR fixture scenarios
- Correctly identifies force flag requirements in fixture scenarios
- Multi-synchronizer vetting plan covers all synchronizers reported by the participant and correctly sequences per-synchronizer vetting with dependency awareness
- Rollback section references correct topology serials for vetting steps; upload steps are explicitly marked as irreversible
- CI gate mode exits 0 (clean), 1 (warnings), 2 (infeasible) on appropriate fixture inputs
- Rehearsal mode results match plan predictions on known-good cases; expected failures on known-bad cases
- Rehearsal mode makes no permanent state changes (verified by snapshot diff before/after)
- Golden fixture corpus passes on Canton 3.4.x with cn-quickstart localnet
- All outputs include tool version, input hashes, and participant identifier in metadata header
- `snapshot` command correctly exports package and vetting state from a cn-quickstart localnet participant
- Binaries run without external dependencies on supported platforms
- Documentation reproduces end-to-end on a fresh cn-quickstart setup

---

## Funding

**Total Funding Request:** 530,000 CC

### Payment Breakdown by Milestone
- Milestone 1 (State Discovery and DAR Analysis): 110,000 CC upon committee acceptance
- Milestone 2 (Core Migration Plan Engine): 170,000 CC upon committee acceptance
- Milestone 3 (Force Flag Detection, CI Gate, and Rehearsal): 145,000 CC upon committee acceptance
- Milestone 4 (Documentation, Packaging, and End-to-End Validation): 105,000 CC upon final release and acceptance

### Volatility Stipulation
The project duration is under 6 months. Should the project timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility.

---

## Co-Marketing

The implementing entity operates [Canton Echo](https://x.com/Canton_Echo), an independent community media outlet covering Canton ecosystem news, technical content, and developer tooling. Canton Echo maintains its own audience across X (Twitter) and a Medium blog, and will continue to serve as a long-term channel for Canton developer content beyond this project.

Upon release, we will collaborate with the Foundation on:

- Announcement coordination across Foundation channels and Canton Echo
- Technical blog post on Canton Echo's Medium blog walking through a real-world upgrade scenario using the planner
- Ongoing developer promotion via Canton Echo and Canton community channels

---

## Motivation

Every team running Daml applications on Canton will eventually need to upgrade their packages. Today each team builds their own ad-hoc upgrade workflow. The failure modes are shared (dependency ordering, partial vetting, missing force flags) but no shared tooling exists to prevent them.

The planner is common-good infrastructure because the planning logic is structural, not application-specific. The inputs are package metadata and participant state — the same data structures for every Daml application. The output is a deployment plan — the same artifact shape for every team.

Specific beneficiaries: application teams deploying DAR upgrades, validator operators accepting vetting requests from app teams (a reviewable plan reduces their evaluation burden), CI/CD pipelines that need an automated pre-deployment gate, and SRE teams that need a rollback plan before entering a maintenance window.

The Markdown report format is designed for change management workflows where teams attach a migration plan to a change ticket, get sign-off, then execute.

---

## Rationale

#### What makes this tool distinct

Existing Canton tooling provides primitives: compile-time type checking (`dpm upgrade-check`), server-side validation without side effects (`ValidateDarFile`), single-operation vetting simulation (`UpdateVettedPackages` dry_run), and state queries (`ListVettedPackages`). Each answers one question in isolation. No existing tool answers the compound question that operators actually face: "Given my participant's current state and these new DARs, what is the complete, ordered, safe migration sequence?"

The Migration Planner is not a compatibility checker — compatibility checking is one input to the plan, not the output. It is not a vetting state monitor — monitoring tells you what is; planning tells you what to do next. It is not a CI gate alone — a CI gate is one consumption mode for the plan, built on top of the planning engine. And it is not a generic release orchestrator — tools like Spinnaker or Argo do not understand Canton's package model, vetting topology, or DAR dependency graphs.

The Planner composes Canton's existing APIs into a planning workflow that produces a deterministic, reviewable migration artifact. The new code is the sequencing logic, not the validation logic.

#### Design decisions

**Kotlin + GraalVM native-image.** Kotlin provides direct reuse of existing Canton/Daml protobuf bindings and alignment with the JVM-based Canton ecosystem. GraalVM native-image compiles to a single binary with fast startup and no JVM dependency at runtime, giving CLI-appropriate distribution characteristics. Rust was considered for its native binary story, but the protobuf binding reuse and Canton ecosystem alignment favored Kotlin.

**Single-participant scope.** Multi-participant coordination — ensuring counterparties vet packages before contracts are published — is a distributed consensus problem with different trust and synchronization requirements. The Planner produces per-participant plans that serve as building blocks for multi-party coordination. Extending the tool to orchestrate across participants is a natural direction for continued work under a follow-up grant.

**Plan-first, rehearsal-optional.** The core value is the plan artifact itself: reviewable, deterministic, attachable to a change ticket. Rehearsal mode (executing `dry_run` and validation calls against a live participant) validates the plan but is an optional layer added in M3, not the primary deliverable.

#### Risks and mitigations

- *Canton Admin API stability.* The tool depends on Admin API v30 endpoints. Mitigation: version-pin the supported Canton range, test against specific releases, degrade gracefully on missing features.
- *`UpdateVettedPackages` dry_run availability.* Introduced in 3.4.4. Mitigation: force flag detection marked "unavailable" on pre-3.4.4 participants; plan proceeds with a warning.
- *Multi-synchronizer complexity.* The most complex part of the implementation. Mitigation: early integration testing in M2, dedicated golden fixtures. Advanced multi-synchronizer orchestration (e.g., coordinated vetting sequences across synchronizers with rollback guarantees) is a natural candidate for a follow-up grant.
- *DAR format evolution.* The analyzer extracts only structural metadata (package IDs, names, versions, dependencies) stable across LF versions. Unknown fields are ignored, not rejected.
- *Rollback asymmetry.* Package uploads are irreversible — a DAR once uploaded cannot be un-uploaded. Only vetting changes are reversible via topology serial reversion. The plan documents this asymmetry explicitly for each step rather than promising symmetric rollback.
- *Scope creep toward execution.* This tool produces plans; it does not apply them. Rehearsal mode uses only read-only/dry-run APIs. Plan execution is a different trust model and a different project.
