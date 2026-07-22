## Development Fund Proposal

**Author:** Petr Mensik, Ruby Nodes  
**Status:** Draft  
**Created:** 2026-03-16

---

## Abstract

Upgrading Daml packages on Canton is a multi-step process that touches package upload, vetting topology transactions, dependency ordering, upgrade compatibility, package selection, active contract state, and synchronizer-scoped configuration.

The platform provides good primitives for each step — compile-time compatibility checking, server-side DAR validation, vetting simulation, and Ledger API access to active contract state — but no tool connects them into a single, reviewable migration plan that accounts for a participant's actual deployed state.

The Daml Upgrade Migration Planner is a CLI tool that inventories a participant's current package, contract, and vetting state, analyzes one or more proposed DAR files against that state, and produces a concrete, ordered migration plan: what to upload, in what sequence, which packages need direct vetting on each synchronizer, what compatibility or package-selection rules apply, whether old packages can be safely unvetted, what force flags may be required, what the expected end state looks like, and what can be rolled back if something goes wrong.

The output is a structured artifact (JSON + Markdown) suitable for team review, change ticket attachment, or CI gate integration. Each plan records the ledger, topology, environment, and configuration state it was derived from and reports package support scoped to the local participant, its target synchronizers, and explicitly configured external participants.

---

## Specification

### 1. Objective

A team has `payments-v1.dar` (3 packages) deployed on their Canton participant, vetted across two synchronizers. They want to deploy `payments-v2.dar` (4 packages — 2 upgrades of existing packages, 1 new package, 1 unchanged dependency) and `reporting-v2.dar` (2 packages that depend on types from `payments-v2`).

The question: what exact steps do I take to get from here to there safely?

Today the answer is manual. The operator reads the upgrade documentation, inspects package and contract state, mentally computes the dependency graph, determines upload order, figures out which vetting transactions to issue on which synchronizers, checks whether force flags are needed, evaluates whether existing contracts still prevent an old package from being unvetted, and hopes they have not missed a step.

This manual process has concrete failure modes:

**DAR overlap and upgrade-lineage validation.** A DAR bundles the DALFs of all its dependencies, so uploading `reporting-v2.dar` also provides its `payments-v2` dependencies — the two DARs may overlap, and one upload may make the other redundant. Participant-side upgrade validation checks each newly uploaded package against packages *already* on the participant, so upload order still affects which SCU lineage errors surface first and where. Without an explicit analysis of package overlap and upgrade lineage across the input DAR set, operators either upload redundantly without knowing it or hit avoidable lineage-check failures mid-rollout.

**Incorrect assumptions about vetting.** Directly vetted package IDs are not the complete package-selection model. Upgrade-compatible packages and topology-aware package selection affect which package implementations can be used. A migration plan that treats every package version as an independent vetting requirement can generate unnecessary or incorrect steps.

**Partial vetting.** On multi-synchronizer participants, vetting is synchronizer-scoped. A package vetted on synchronizer X but not synchronizer Y can cause transaction failures for workflows that span both. The operator must track which synchronizers and relevant participants support which packages.

**Unsafe unvetting.** On Canton 3.4 and later the platform permits unvetting a package even while active contracts still reference it; the force flag that previously guarded this (`FORCE_FLAG_ALLOW_UNVET_PACKAGE_WITH_ACTIVE_CONTRACTS`, required on 3.3 and earlier) has been removed. This is a deliberate change: SCU allows a v1 contract to remain package-resolvable through a compatible vetted v2 under the applicable package-selection rules, so a blanket platform rejection would be too coarse. The real safety question is contextual — whether every package still referenced by active contracts has a compatible vetted replacement — and the planner evaluates exactly that as a policy check rather than relying on the platform to reject unsafe unvets. Package-level upgrade support does not by itself prove application workflow compatibility, which still requires the team's own integration testing.

**Force flag surprises.** Vetting upgrade-incompatible packages requires `FORCE_FLAG_ALLOW_VET_INCOMPATIBLE_UPGRADES`. Discovering this at vetting time, rather than planning time, creates unnecessary risk during rollout windows.

**Stale planning state.** Package, contract, and topology state can change between planning and rollout. Without recorded provenance (ledger offset, topology serials, configuration inputs), a previously valid plan can become stale without the operator noticing.

**Environment drift.** DevNet, TestNet, and MainNet frequently use different participants, synchronizers, package versions, and rollout policies. Teams need separate plans per environment and a way to compare them.

**Missing rollback planning.** If something goes wrong mid-upgrade, the operator needs to know which vetting transactions were issued, what the inverse `UpdateVettedPackages` operation is for each, and which uploads cannot be reversed. Today this is not captured as a pre-computed artifact.

**No reviewable artifact.** There is no document a team lead or SRE can review before the rollout window that says "here is exactly what will happen, step by step."

The intended outcome is a CLI tool that replaces this manual planning with a deterministic, reviewable, machine-parseable migration plan derived from a participant's current state, explicit environment configuration, and a set of proposed DAR files.

### 2. Implementation Mechanics

#### Three-phase workflow

The planner works in three phases.

The tool is read-only by default — it queries existing APIs, runs existing validation, and generates a plan document. It does not upload packages, issue vetting transactions, migrate contracts, or modify participant state. Rehearsal mode invokes only validation and `dry_run` operations.

**Phase 1 — State Discovery.** The tool connects to a Canton participant via the Admin API and Ledger API, or reads a previously exported state snapshot.

It queries:

- uploaded packages and their metadata;
- vetting state per synchronizer, including topology serials and available temporal metadata;
- active contracts visible to the configured Ledger API identity, grouped by package and template;
- connected synchronizers and relevant topology state;
- vetting state of explicitly configured external participants where that state is visible through the participant's topology APIs;
- the state-provenance fields listed under the Reporter metadata header (Ledger API offset, per-synchronizer `RecordTime`, topology serials with validity bounds, per-call query timestamps).

The tool loads an explicit environment profile containing the participant connection, target synchronizers, input DARs, required external participants, and planning policy. Non-secret configuration inputs are normalized and recorded in the snapshot and plan metadata.

The resulting `ParticipantState` is a point-in-time planning input. Incomplete contract or external topology visibility is recorded as a limitation, never treated as proof of readiness.

**Phase 2 — DAR Analysis.** The tool reads proposed DAR files from the local filesystem, parsing each to extract contained packages, their metadata, dependency relationships, and upgrade lineage through the `upgrades:` field.

It calls `ValidateDarFile` against each target synchronizer for authoritative live validation against the participant's actual package and topology state. For offline pre-upload checking of the complete DAR set, it invokes `dpm upgrade-check --participant` (which runs the same participant-side upload validation without a live ledger); `dpm upgrade-check --compiler` is used as a weaker secondary check. Canton remains the source of truth for compatibility validation; the planner consumes and organizes these results.

The tool builds a proposed package graph and identifies package-name and version relationships relevant to topology-aware package selection.

**Phase 3 — Plan Generation.** The tool diffs the current state against the proposed state and configured target environment. It computes:

- **Upload set and order:** the planner determines which package IDs each input DAR contributes, reports any package overlap between input DARs, and produces a deterministic upload order that respects SCU lineage checks against packages already on the participant. By default it preserves the explicitly supplied top-level DARs; an optional `minimal-upload-set` policy removes redundant DAR uploads.
- **Effective package support:** which packages require direct vetting and which package names are already supported through compatible vetted upgrades and package-selection rules.
- **Vetting sequence:** which packages to vet on which synchronizers, in what order (vetting sequencing remains genuinely dependency-constrained at the package level).
- **Unvetting feasibility:** classified as *safe* (no visible active contracts reference the package), *allowed under policy with warning* (active contracts exist but a compatible vetted replacement is in place on the required synchronizers, so existing contracts remain package-resolvable through the replacement under the applicable package-selection rules), *blocked* (active contracts exist without a compatible vetted replacement), or *incomplete evidence* (contract visibility or compatibility evidence is insufficient to reach a verdict; treated as blocked under the strict policy and as a manual-prerequisite warning otherwise). The planner establishes package-level upgrade support; it does not prove application-specific workflow compatibility, which still requires the team's own integration testing.
- **Package support by scope:** local-participant readiness, per-target-synchronizer package support, and observable package support of explicitly configured external participants where topology evidence is available.
- **Preconditions:** what must be true before each step, including package availability, compatibility checks, contract-state requirements, and expected topology serials.
- **Warnings and blockers:** situations that require force flags, incomplete visibility, stale planning inputs, package conflicts, and operations that cannot currently be proven safe.
- **Expected end state:** the package and vetting state after the plan executes successfully.
- **Rollback guidance:** for each vetting or unvetting step, the plan records the pre-change vetted-package state, the expected topology serial guarding the forward operation, and the inverse `UpdateVettedPackages` change reconstructed from the pre-change state and protected by compare-and-set (CAS) on the current serial. For upload steps, the plan records irreversibility. Rollback guidance does not claim that application state can always be restored by reverting a vetting change.

The output is a structured plan in JSON for CI consumption and Markdown for human review. The planner exits with code 0 if the migration is feasible, 1 if it has warnings or incomplete non-blocking evidence, and 2 if the migration is not feasible under the selected planning policy.

#### Planning policies

V1 includes a small fixed set of planning policies rather than a generic strategy or workflow engine. Policies control how the planner treats warnings and incomplete evidence, for example:

- block unvetting when active-contract visibility is incomplete;
- require all configured synchronizers to pass validation;
- require all explicitly configured external participants to have observable compatible vetting state;
- reject plans requiring selected force flags.

Policies affect plan feasibility and CI exit codes.

#### Multi-network profiles

The configuration file can define named environment profiles such as DevNet, TestNet, and MainNet, each with independent participant credentials, target synchronizers, DAR inputs, external participant requirements, and planning policy. The planner generates each environment plan independently; the `diff` command compares normalized snapshots or plans across profiles. V1 does not automatically promote a plan between environments or infer that TestNet success guarantees MainNet safety.

#### Concrete scenario output

For the `payments-v2.dar` + `reporting-v2.dar` scenario above, the plan would produce:

1. **Capture state** for the selected environment — records the provenance metadata (participant ID, offset, topology serials, configuration hash) and contract-visibility scope.
2. **Validate** the input DAR set against each target synchronizer using `ValidateDarFile` — checks server-side upgrade compatibility of every proposed DAR without side effects.
3. **Analyze DAR overlap** — `reporting-v2.dar` bundles the DALFs of its `payments-v2` dependencies, so the planner reports which package IDs each input DAR contributes and flags the overlap. By default it preserves both explicitly supplied DARs in the plan (uploading an already-known package is idempotent); under the optional `minimal-upload-set` policy it would drop `payments-v2.dar` as redundant.
4. **Upload** `payments-v2.dar` first — deterministic order chosen so participant-side upgrade lineage checks surface `payments-v2` errors against the current `payments-v1` before any dependent DAR is considered. Adds 3 new package IDs (2 upgrades, 1 new).
5. **Upload** `reporting-v2.dar` — its `payments-v2` DALFs are already present (redundant) or, if only `reporting-v2.dar` had been uploaded, would be introduced here. Adds 2 new `reporting-v2` package IDs.
6. **Vet** the required `payments-v2` packages on synchronizer A — only packages not already effectively supported are included. Records topology serial before change.
7. **Vet** the required `payments-v2` packages on synchronizer B.
8. **Vet** the required `reporting-v2` packages on synchronizers A and B after their dependencies are supported.
9. **Package support summary:** local participant ready; local participant supports the required `payments-v2` packages on synchronizers A and B; configured external participants classified as ready, partial, unknown, or not evaluated on each synchronizer based on available topology evidence.
10. **Unvet `payments-v1` packages**, if requested — classified using the four-state model above: here *allowed under policy with a warning*, because active v1 contracts exist but the compatible `payments-v2` replacement is vetted on both synchronizers so existing contracts remain package-resolvable through the replacement under the applicable package-selection rules. Package-level resolvability does not by itself prove application workflow compatibility. The corresponding Canton `dry_run` is executed in all non-blocked cases to validate the unvet topology transaction itself (topology serial, package identity).
11. **Warning:** if `payments-v2` contains an upgrade-incompatible change, the relevant vetting step requires `FORCE_FLAG_ALLOW_VET_INCOMPATIBLE_UPGRADES`.
12. **Rollback:** each vetting or unvetting change is inverted per the rollback-guidance model above (inverse `UpdateVettedPackages` from recorded pre-change state, reverse order, CAS-protected). Upload steps cannot be reversed. If contracts have already been created using v2, rollback may require an application-level roll-forward migration rather than simply unvetting v2.

The JSON output for CI/CD consumption mirrors this sequence structurally. For example:

```json
[
  {
    "step": 10,
    "type": "unvet",
    "target_package": "payments-v1-package-id",
    "synchronizer": "synchronizer-a",
    "status": "allowed_with_warning",
    "preconditions": [
      "contract_visibility_complete_for_configured_scope",
      "compatible_replacement_vetted_on_required_synchronizers",
      "dry_run_succeeds",
      "expected_topology_serial_matches"
    ],
    "evidence": {
      "ledger_offset": "participant-offset",
      "active_contract_count": 42,
      "compatible_replacement_package": "payments-v2-package-id",
      "replacement_vetted_on": ["synchronizer-a", "synchronizer-b"],
      "contract_visibility": "complete_for_configured_scope"
    },
    "inverse_operation": {
      "type": "vet",
      "target_package": "payments-v1-package-id",
      "synchronizer": "synchronizer-a",
      "reconstructed_from": "recorded_pre_change_vetted_package_state",
      "protected_by_expected_topology_serial": true
    }
  }
]
```

#### Architecture and components

The tool is implemented as a single CLI binary in Kotlin, compiled to a native executable via GraalVM native-image (see Design decisions in the Rationale section for the language choice).

The internal architecture has four modules:

**State Adapter.** Connects to the Canton participant's Admin API and Ledger API via gRPC, supporting independent mTLS/JWT authentication profiles for the Ledger API and Admin API to respect production network boundaries.

Provides a `ParticipantState` model containing:

- uploaded packages with metadata and dependencies;
- direct vetting state per synchronizer with topology serials;
- active contracts visible to the configured Ledger API identity, grouped by package and template;
- connected synchronizers and relevant visible topology state;
- configured external-participant vetting evidence where available;
- the state-provenance fields listed under the Reporter metadata header;
- environment name and normalized non-secret planning inputs;
- explicit completeness/visibility markers.

The model can be serialized to versioned JSON for offline analysis.

**DAR Analyzer.** Reads DAR files from the filesystem. DARs are ZIP archives containing protobuf-encoded DALF files and a manifest. Extracts package IDs, names, versions, dependency lists, and upgrade metadata. Does not evaluate Daml expressions — only reads structural metadata and delegates compatibility validation to Canton and `dpm`.

**Plan Engine.** Core deterministic logic. Inputs: `ParticipantState`, normalized environment configuration, planning policy, and list of analyzed DARs. Output: ordered `PlanStep` objects and a scoped package-support result (local participant; per-target-synchronizer; per-configured-external-participant on each target synchronizer).

Each plan step has a type (`Check`, `Upload`, `Vet`, `Unvet`), target, preconditions, evidence, expected outcome, warnings or blockers, and inverse operation where reversible.

The engine implements:

- DAR overlap analysis and package-ID contribution reporting across the input DAR set, with an optional minimal-upload-set policy;
- deterministic upload ordering chosen so participant-side upgrade lineage checks surface expected errors first;
- package-name, upgrade-lineage, and effective-support analysis;
- per-synchronizer vetting sequencing based on package-level dependencies;
- SCU-aware unvetting classification (*safe* / *allowed with warning* / *blocked* / *incomplete*) combining active-contract evidence with compatible-replacement analysis;
- force flag detection via `UpdateVettedPackages` with `dry_run: true`;
- conflict detection for package-name/version and upgrade-lineage issues;
- participant-on-synchronizer package-support classification;
- fixed planning-policy evaluation;
- inverse-operation rollback step generation from recorded pre-change vetted-package state, protected by expected topology serial (compare-and-set).

**Reporter.** Produces output artifacts. JSON output follows a versioned schema serialized canonically: object keys sorted lexicographically, arrays emitted in the deterministic order produced by the Plan Engine (topological upload order, then a fixed synchronizer sort for vetting and unvetting), UTF-8 encoding without BOM, LF line endings, stable numeric formatting, and no volatile fields inside the deterministic portion. Volatile metadata such as the wall-clock generation timestamp and per-API query timestamps live in a separate `metadata_nondeterministic` object that is not covered by the byte-for-byte determinism guarantee. Markdown output uses a fixed template with step numbering, readiness scope, precondition and blocker callouts, evidence, and a summary table.

Both formats include a metadata header containing:

- tool and schema version;
- environment and participant ID;
- plan-generation timestamp (local wall clock; emitted under `metadata_nondeterministic`);
- Ledger API offset used for the ACS query;
- per-synchronizer `RecordTime` from the offset checkpoint;
- per-synchronizer vetted-package topology serial;
- topology transaction `valid_from_inclusive` / `valid_until_exclusive` bounds where exposed;
- local query timestamp for each API call in the snapshot (under `metadata_nondeterministic`);
- normalized configuration hash;
- input DAR hashes;
- contract and topology visibility limitations.

These fields are captured independently and do not form a transactionally atomic cross-API snapshot.

CLI subcommands:

- `plan` — full workflow for one named environment;
- `snapshot` — export current environment state;
- `analyze` — offline DAR analysis;
- `diff` — compare snapshots or plans, including across named environments.

The CLI supports `--config`, `--environment`, `--output json`, `--output markdown`, `--strict`, `--require-no-force-flags`, and fixed planning-policy options.

#### Non-goals

- **Not a package manager.** This tool does not host, resolve, download, or version-manage DAR files. It takes DARs as filesystem inputs.
- **Not a release orchestration platform.** This tool produces a plan; it does not execute it.
- **Not a reimplementation of Daml upgrade checks.** The planner delegates to `dpm upgrade-check`, `ValidateDarFile`, and Canton's native vetting validation.
- **Not an application contract migration engine.** It identifies active contracts relevant to unvetting but does not exercise application-specific migration choices.
- **Not a vetting drift monitor.** It produces a point-in-time migration plan, not a continuous monitoring signal.
- **Not a dashboard or web UI.** The output is CLI text, JSON, and Markdown.
- **Not a global readiness oracle.** Package support is reported only for the local participant, its target synchronizers, and explicitly configured external participants; application-wide readiness is never inferred.
- **Not a multi-participant coordinator.** It does not coordinate approvals, wait for counterparties, or issue topology transactions across organizations.
- **Not an environment promotion engine.** Named DevNet, TestNet, and MainNet profiles are analyzed independently; V1 does not promote plans or infer environment equivalence.
- **Not a generic strategy engine.** V1 includes fixed planning policies, not user-defined workflows, delegated automation, or deferred execution.

### 3. Architectural Alignment

The tool is a thin planning layer over Canton's existing package management, topology, and Ledger APIs. Canton provides several upgrade-related primitives:

- **`dpm upgrade-check --participant <all DARs>`** — runs the same participant-side upload validation as a live upload, without a running ledger; recommended for offline pre-upload checking of the complete DAR set. The `--compiler` mode is a weaker secondary check.
- **`ValidateDarFile` / `ValidateDar`** — the same validation used during upload, without side effects, evaluated against the actual participant and target synchronizer state (the authoritative live check).
- **`UpdateVettedPackages` with `dry_run: true`** — previews a single vetting change without broadcasting it.
- **Package, topology, and active-contract queries** — data sources exposing current participant state.
- **Topology serial preconditions** — protect updates against concurrent topology changes but must be collected and associated with the correct plan step.

Each primitive answers one part of the problem. None answers the compound question:

> Given this environment, participant state, active contracts, visible topology state, planning policy, and these proposed DARs, what is the complete ordered migration sequence, which operations are blocked, and what readiness has actually been established?

That is the gap this tool fills: it delegates validation and safety enforcement to Canton's own APIs and adds deterministic state collection, sequencing, evidence, and reporting.

The initial supported version matrix targets Canton 3.4.6, the latest 3.4.x release, and the latest 3.5.x release. Required API capabilities are detected at connection time rather than inferred solely from the participant version.

The planner uses:

- Ledger API `PackageManagementService` for DAR validation (`ValidateDarFile`), package listing, vetting queries, and `UpdateVettedPackages(dry_run)`;
- Ledger API v2 for active-contract state and the offset used by the snapshot;
- Admin API `TopologyManagerReadService` / `TopologyManagerWriteService` for synchronizer-scoped vetting state, topology serials, and observable external-participant package support.

No single API returns all required state; the tool combines multiple calls and records the observation boundaries of each result (see the non-atomic state collection risk below).

The `UpdateVettedPackages` `dry_run` feature is required for force-flag detection and for validating proposed vetting and unvetting topology transactions before they are broadcast. The tool probes for `ValidateDarFile`, `UpdateVettedPackages`, and `dry_run` support at connect time; if a required capability is missing, the corresponding conclusion is marked unavailable and the selected planning policy decides whether the plan continues with a warning or becomes infeasible.

#### Future `dpm` integration

V1 is distributed as a standalone CLI to keep implementation and release coordination bounded. Its stable command interface and versioned JSON schemas are designed so the planner can later be invoked or incorporated through `dpm` without changing the planning model: the native executable can be called as an external command, and the core planning modules can be exposed as a JVM library. Actual integration is outside v1 because it depends on coordination with the maintainers and release process of `dpm`.

### 4. Backward Compatibility

*No backward compatibility impact.*

This is a new, standalone CLI tool. It reads from Canton APIs without modifying participant state and does not alter any existing Canton components, workflows, or integrations.

The JSON snapshot and plan formats are versioned. Additive schema evolution is preferred, and incompatible schema changes require a new major schema version.

---

## Milestones and Deliverables

### Milestone 1: State Discovery, Configuration, and DAR Analysis

- **Estimated Delivery:** Week 5
- **Focus:** Build the state adapter, explicit environment/configuration model, and DAR analysis modules. Prove the core data model works with real Canton packages, active contracts, synchronizer topology, and reproducible state boundaries.

- **Deliverables / Value Metrics:**
  - CLI with `snapshot` command for a named environment;
  - CLI with `analyze` command;
  - versioned JSON snapshot schema;
  - normalized environment-profile schema for DevNet, TestNet, and MainNet-style configurations;
  - participant package and per-synchronizer vetting inventory;
  - Ledger API active-contract inventory grouped by package and template;
  - captured Ledger API offset, topology serials, and available observation/effective-time metadata;
  - explicit visibility/completeness markers for contract and external topology data;
  - DAR parser covering Daml-LF package metadata extraction;
  - upgrade-lineage and dependency representation;
  - `ParticipantState` data model used by M2;
  - golden fixtures with deterministic expected outputs;
  - unit and integration tests covering DAR parsing, configuration normalization, state collection, ACS grouping, and snapshot serialization.

### Milestone 2: SCU-Aware Migration Plan Engine

- **Estimated Delivery:** Week 11
- **Focus:** Build the plan engine that diffs participant state against proposed DARs and produces a complete, ordered migration plan using package-selection and upgrade-compatibility semantics.

- **Deliverables / Value Metrics:**
  - CLI `plan` command;
  - DAR overlap analysis and per-DAR package-ID contribution reporting (with an optional `minimal-upload-set` policy for pruning redundant DAR uploads), and deterministic upload ordering aligned with participant-side upgrade lineage checks;
  - per-synchronizer vetting sequencing based on package-level dependencies;
  - effective package-support evaluation based on direct vetting, package names, upgrade lineage, and native compatibility results;
  - SCU-aware four-state unvetting classification (*safe* / *allowed with warning* / *blocked* / *incomplete*) based on active-contract evidence and compatible-replacement analysis;
  - explicit blocked/manual-precondition result when contract visibility is incomplete;
  - package-support classifications scoped to the local participant, each target synchronizer, and explicitly configured external participants;
  - fixed planning policies for warning, visibility, synchronizer, participant, and force-flag requirements;
  - rollback plan generation using inverse `UpdateVettedPackages` operations reconstructed from recorded pre-change state, protected by expected topology serials (compare-and-set);
  - Markdown report with state provenance, readiness scope, preconditions, evidence, blockers, expected outcomes, and rollback section;
  - versioned JSON plan schema with canonical serialization;
  - complete canonical scenario;
  - golden fixtures covering:
    - multi-DAR package overlap reported accurately, with the optional minimal-upload-set policy pruning redundant DAR uploads;
    - deterministic upload order exposing SCU lineage errors against previously uploaded packages;
    - multiple synchronizers;
    - compatible package upgrades;
    - upgrade-incompatible packages;
    - active contracts blocking unvetting (no compatible replacement);
    - active v1 contracts with a compatible vetted v2 upgrade, where unvetting v1 is allowed under policy with a warning;
    - incomplete contract visibility;
    - local readiness with unknown external readiness;
  - unit and integration tests covering plan-engine logic.

### Milestone 3: Dry-Run Validation, Multi-Network Comparison, and CI Gate

- **Estimated Delivery:** Week 14
- **Focus:** Add native dry-run validation, CI gate integration, scoped rehearsal, stale-state detection, and comparison of independently generated environment plans.

- **Deliverables / Value Metrics:**
  - force flag detection through `UpdateVettedPackages(dry_run=true)`;
  - dry-run validation of proposed vetting and unvetting changes;
  - `plan --rehearse` using validation and dry-run APIs only, classifying each step as *validated*, *deferred* (dependent on earlier plan steps not yet applied), or *failed*;
  - rehearsal report with per-step verdict, deferred-validation markers, and error details;
  - CI gate mode with `--strict`, `--require-no-force-flags`, and policy-based exit behaviour;
  - exit codes 0 (clean), 1 (warnings/incomplete non-blocking evidence), and 2 (infeasible);
  - detection and reporting of changed topology serials or mismatched configuration/state provenance;
  - named environment support for independently generating DevNet, TestNet, and MainNet plans;
  - `diff` support for snapshots and plans across environment profiles;
  - graceful degradation when a Canton version does not provide a required validation capability;
  - additional fixture scenarios for dry-run, stale-state, multi-network, force-flag, and CI-gate cases;
  - unit and integration tests for validation, comparison, and CI behaviour.

### Milestone 4: Documentation, Packaging, and End-to-End Validation

- **Estimated Delivery:** Week 17
- **Focus:** Package the tool for distribution, write reference documentation, validate the complete workflow against cn-quickstart, and test the operational boundaries introduced by the extended state and readiness model.

- **Deliverables / Value Metrics:**
  - prebuilt binaries for Linux (amd64) and macOS (amd64, arm64) via GitHub Releases;
  - Docker image published to GitHub Container Registry;
  - documentation:
    - installation guide;
    - quickstart;
    - environment profile and authentication reference;
    - all CLI commands and policies;
    - worked single-network and multi-network examples;
    - SCU/package-selection and unvetting-safety explanation;
    - readiness-scope and visibility limitations;
    - CI integration guide;
    - future `dpm` integration direction;
  - end-to-end integration tests running snapshot, plan, rehearse, and diff workflows against cn-quickstart localnet;
  - all golden fixtures passing against a concrete tested Canton matrix (initially: 3.4.6, the latest 3.4.x patch, and the latest 3.5.x patch at release time — the exact set is enumerated in the release notes);
  - release notes and versioned JSON schemas;
  - final technical walkthrough and knowledge transfer.

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- deliverables completed as specified for each milestone;
- demonstrated functionality and operational readiness;
- documentation and knowledge transfer;
- alignment with stated value metrics.

The following conditions apply across milestones:

- Deterministic plan output: the same captured participant state, normalized configuration, planning policy, and DAR inputs produce the same plan JSON byte-for-byte in its deterministic portion (canonical serialization as defined in the Reporter section); wall-clock and other non-deterministic metadata are emitted under `metadata_nondeterministic` and excluded from this guarantee.
- Every output records the full metadata header defined in the Reporter section, including state provenance (offset, `RecordTime`, topology serials), input hashes, and known visibility limitations.
- Package overlap across input DARs is reported accurately, redundant package uploads are identified, and the generated upload order is deterministic; the optional `minimal-upload-set` policy prunes redundant DAR uploads when enabled.
- Direct vetting steps account for native upgrade-compatibility validation and effective package support rather than treating every package ID as an independent requirement.
- Multi-synchronizer plans cover all target synchronizers configured for the environment and sequence vetting with dependency awareness.
- An unvetting step is classified as *safe*, *allowed under policy with a warning*, *blocked*, or *incomplete evidence* using SCU effective-package-support analysis; the *allowed with warning* verdict requires a compatible vetted replacement on the required synchronizers, and incomplete contract visibility yields *blocked* or an explicit manual prerequisite according to policy.
- Dry-run results correctly identify force flags and native validation failures in fixture scenarios.
- Readiness and package support are reported separately for the local participant, each target synchronizer, and each explicitly configured external participant where topology evidence is available; application-wide readiness is never reported.
- Named environment profiles independently generate plans with their own package, participant, synchronizer, configuration, and state inputs.
- Cross-environment `diff` highlights material package, configuration, topology, and readiness differences.
- Rollback sections capture the pre-change vetted-package state, the inverse `UpdateVettedPackages` change, and the expected topology serial (CAS) guarding each inverse step; upload steps are explicitly irreversible.
- Rollback guidance warns when contracts created under a new package version can make simple rollback by unvetting invalid.
- CI gate mode exits 0, 1, or 2 on appropriate fixture inputs.
- Rehearsal validates every operation that can be evaluated against current participant state, marks operations dependent on earlier unapplied plan steps as *deferred*, matches plan predictions on known-good cases, and exposes expected failures on known-bad cases.
- Rehearsal mode makes no permanent state changes, verified by snapshot comparison.
- Changed topology serials or material state/configuration mismatches cause a stale-plan warning or infeasible result according to policy.
- Golden fixtures pass on the concrete tested Canton matrix enumerated in the release notes (initially Canton 3.4.6, the latest 3.4.x, and the latest 3.5.x) using cn-quickstart localnet.
- `snapshot` correctly exports package, vetting, active-contract summary, topology, state-boundary, and visibility information.
- Binaries run without external runtime dependencies on supported platforms.
- Documentation reproduces the full workflow on a fresh cn-quickstart setup.

---

## Funding

**Total Funding Request:** 585,000 CC

### Payment Breakdown by Milestone

- **Milestone 1 — State Discovery, Configuration, and DAR Analysis:** 120,000 CC upon committee acceptance
- **Milestone 2 — SCU-Aware Migration Plan Engine:** 195,000 CC upon committee acceptance
- **Milestone 3 — Dry-Run Validation, Multi-Network Comparison, and CI Gate:** 160,000 CC upon committee acceptance
- **Milestone 4 — Documentation, Packaging, and End-to-End Validation:** 110,000 CC upon final release and acceptance

### Volatility Stipulation

The project duration is under 6 months. Should the project timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility.

---

## Co-Marketing

The implementing entity operates [Canton Echo](https://x.com/Canton_Echo), an independent community media outlet covering Canton ecosystem news, technical content, and developer tooling.

Canton Echo maintains its own audience across X and a Medium blog and will continue to serve as a long-term channel for Canton developer content beyond this project.

Upon release, we will collaborate with the Foundation on:

- announcement coordination across Foundation channels and Canton Echo;
- a technical blog post walking through a real-world upgrade scenario using the planner;
- ongoing developer promotion through Canton Echo and Canton community channels.

---

## Motivation

Teams running Daml applications on Canton eventually need to upgrade their packages. Today they typically rely on internal runbooks, scripts, and manual checks. The failure modes are shared — dependency ordering, incorrect vetting assumptions, missing force flags, active contracts, environment differences, and incomplete counterparty readiness — but no shared tool produces a complete preflight plan.

Concrete failure patterns encountered by operators include upgrades blocked because required packages are not yet vetted, divergent per-environment package strategies, and the need to track migration progress against existing contracts.

The planner is common-good infrastructure because the planning logic is structural rather than application-specific: package metadata, participant state, active-contract references, topology state, and environment configuration follow the same model across Daml applications. Primary beneficiaries are application and release teams deploying DAR upgrades, platform and SRE teams preparing maintenance windows, validator operators evaluating vetting requests, CI/CD pipelines needing an automated pre-deployment gate, and technical reviewers who need a stable artifact showing what is planned and what remains unknown.

The Markdown report is designed for change-management workflows: generate a point-in-time plan, attach it to a change ticket, review the evidence and blockers, obtain sign-off, then execute using existing operational tooling.

The initial adoption path is to validate the tool against cn-quickstart and representative upgrade scenarios, publish stable binaries and schemas, and invite ecosystem teams to test the resulting workflow.

---

## Rationale

### What makes this tool distinct

As described under Architectural Alignment, Canton's upgrade primitives each answer one question in isolation; none produces the complete ordered migration sequence for a concrete participant state.

The Migration Planner is not a compatibility checker — compatibility checking is one input to the plan. It is not a vetting-state monitor — monitoring tells you what is, while planning tells you what to do next. It is not merely a CI gate — CI is one consumer of the plan. It is not a generic release orchestrator — generic deployment tools do not understand Daml package selection, active contract restrictions, synchronizer-scoped vetting, topology serials, or DAR dependency graphs.

### Design decisions

**Kotlin + GraalVM native-image.** Kotlin provides direct reuse of existing Canton/Daml protobuf bindings and alignment with the JVM-based Canton ecosystem. GraalVM native-image compiles to a single binary with fast startup and no JVM dependency at runtime. Rust was considered for its native binary story, but protobuf binding reuse and ecosystem alignment favored Kotlin. The stable CLI and JSON schemas preserve a path to future `dpm` integration.

**Single-participant execution scope.** The tool connects to and plans from one participant at a time, reporting observable vetting evidence for explicitly configured external participants without coordinating them. This keeps the trust and execution model bounded.

**Plan-first, rehearsal-optional.** The core value is the reviewable and deterministic plan artifact. Rehearsal validates the plan through read-only and dry-run calls but does not apply it.

**Ledger API active-contract state for v1.** V1 uses Ledger API data available to the configured identity to identify contracts relevant to unvetting. PQS is not required for v1; it remains a possible future adapter for richer historical analysis and progress tracking.

**Named environments.** Profiles make DevNet, TestNet, and MainNet differences explicit and comparable.

**Fixed policies instead of a workflow engine.** The tool exposes a bounded set of safety and CI policies (see Non-goals for excluded workflow capabilities).

### Risks and mitigations

- **Canton API stability.** The tool depends on package, topology, and Ledger APIs.  
  **Mitigation:** version-pin the supported Canton range, isolate API adapters, and mark unavailable conclusions explicitly.

- **SCU and package-selection complexity.** Direct vetting state is not the complete package-support model.  
  **Mitigation:** delegate compatibility checks to Canton, model upgrade lineage and package names explicitly, and maintain dedicated compatible/incompatible fixtures.

- **Incomplete active-contract visibility.** Ledger API results depend on the authorization and party scope of the configured identity. A participant can host parties whose contracts a given identity cannot read, in which case an ACS query silently omits those contracts and any unvetting recommendation derived from it would be unsafe.  
  **Mitigation:** support two explicit visibility modes. In **participant-wide mode**, the configured identity must hold `CanReadAsAnyParty`, verified before an ACS query is treated as covering the participant. In **explicit-scope mode**, the operator declares the party set relevant to the packages being unvetted, and the tool verifies read rights for every listed party, cross-checked against locally hosted parties via `PartyManagementService.ListKnownParties`. If neither mode's preconditions are met, visibility is reported as incomplete and definitive unvetting recommendations are blocked. The resolved scope is recorded in plan metadata. PQS is not a remedy for this gap: it ingests via the Ledger API under an identity subject to the same authorization boundaries.

- **Non-atomic state collection.** Ledger and topology observations come from different APIs and can change during planning.  
  **Mitigation:** record offsets, topology serials, and observation metadata; detect material changes during rehearsal; never represent the snapshot as transactionally atomic.

- **External readiness limitations.** One participant cannot identify every future counterparty, and even for explicitly configured external participants topology observations are eventually consistent — the local view can lag concurrent changes during active rollout windows.  
  **Mitigation:** evaluate only explicitly configured participants where evidence is visible and return unknown rather than infer safety. Each readiness classification records the `topology_serial` and observation/effective time it was derived from, and stale-state detection flags material topology-serial changes between planning and rehearsal.

- **`UpdateVettedPackages` dry-run availability.** Required validation capabilities may differ across Canton versions.  
  **Mitigation:** mark unavailable checks explicitly and let the planning policy determine whether this is a warning or blocker.

- **Multi-network configuration drift.** Environment profiles can diverge in packages, policies, topology, or credentials.  
  **Mitigation:** normalize profiles, include configuration hashes in plans, and provide plan/snapshot diffs.

- **DAR format evolution.**  
  **Mitigation:** extract only stable structural metadata and isolate Daml-LF parsing behind the DAR Analyzer.

- **Rollback asymmetry.** Uploads cannot be removed, and contracts created under v2 can prevent a simple rollback to v1.  
  **Mitigation:** describe rollback per operation, generate the inverse `UpdateVettedPackages` change from the recorded pre-change vetted-package state protected by the expected topology serial (compare-and-set), and distinguish topology rollback from application-level roll-forward migration.

- **Scope creep toward execution.**  
  **Mitigation:** keep all operations read-only or dry-run and hold the Non-goals boundary.
