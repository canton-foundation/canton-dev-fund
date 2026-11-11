# Development Fund Proposal

**Author:** Dapps over Apps 
**Status:** Submitted 
**Created:** 2026-02-25

---

## Abstract

Canton provides `health.dump()` as an official troubleshooting workflow that produces a ZIP bundle containing key diagnostic artifacts (configuration with sensitive values redacted, log extract, metrics snapshot, and thread stack traces). In practice, operators struggle to interpret the dump quickly (including nested ZIP output), slowing incident triage and making escalation/support handoffs inconsistent.

**Dump Doctor** is a safe, offline-first CLI that converts Canton health dumps into a prioritized triage report (Markdown + JSON) with redaction-by-default, deterministic rule IDs, and actionable next steps grounded in official troubleshooting guidance. It requires no node changes, no privileged write access, and is designed to be immediately usable by any operator on day one.

---

## Specification

### 1. Objective

**Problem:** Health dumps are the natural “first artifact” during incidents, but they are not operator-friendly to interpret. The current workflow is manual: unzip, hunt through logs/metrics/threads, and translate symptoms into actions under time pressure.

**Intended outcome:** Provide a standardized, reproducible triage layer that turns a `health.dump()` ZIP into:

* A short, prioritized findings list with severity and confidence
* A consistent “what to check next” playbook
* A redacted report suitable for tickets/issues without leaking secrets by default
* A machine-readable JSON result for automation and tooling integration

Success looks like “dump → triage report” in under a minute, with consistent outputs and clear remediation hints.

---

### 2. Implementation Mechanics

**Tool:** `dump-doctor` (CLI + Docker image)

**Safe-by-default operational model**

* Offline-first: reads a local health dump ZIP
* No network calls by default
* Read-only: never changes node state, never calls write endpoints
* Redaction-by-default: strict redaction mode enabled by default in report output
* Deterministic outputs: stable ordering, stable rule IDs, versioned JSON schema

**Core pipeline**

1. **Ingest**

   * Open the health dump ZIP and handle nested ZIP structure when present
   * Detect and load included artifacts (config snapshot, logs, metrics snapshot, thread dumps)
   * Support multi-node dumps when present (treat each node as an analyzable unit)

2. **Normalize**

   * Normalize artifacts into a stable internal model:

     * Node inventory and metadata (best-effort)
     * Log events indexed by pattern and time window
     * Metrics snapshot extraction (best-effort)
     * Thread dump extraction and “hot spot” summarization (best-effort)
   * Produce a consistent baseline summary even if some artifact types are absent

3. **Redact**

   * Default strict redaction for outputs:

     * Remove common secret-like tokens (JWT-like strings, keys, passwords)
     * Optionally scrub hostnames and file paths (configurable)
   * Bound all evidence excerpts (caps on bytes/lines) to prevent accidental leakage

4. **Rule engine**

   * Rulepack v1 is a curated set of high-signal detectors mapped to official troubleshooting guidance
   * Each rule emits:

     * `rule_id`, `severity`, `confidence`
     * short explanation
     * evidence references (file + line range within extracted evidence)
     * recommended next actions
   * Rules are data-driven (YAML/JSON) where possible, with a small number of compiled detectors for complex patterns (e.g., frequency heuristics)

5. **Report**

   * `report.json` (versioned schema)
   * `report.md` (human-readable triage report)
   * Optional `evidence/` extraction only behind an explicit flag

**Rulepack v1 scope (explicit, non-vague)**

* At least 10 rules shipping in MVP, including:

  * Database task queue saturation pattern detection with a concrete remediation suggestion
  * Serialization exception detection with frequency heuristic (warn only when persistent/frequent)
  * Task runner overload/stuck indicators (where present in health/monitoring outputs)
  * Authentication/token-related misconfiguration hints when directly observable in logs/config snapshot
  * “Operator action required” vs “informational” classification

**Packaging**

* CLI binaries (Linux/macOS)
* Docker image for repeatable execution in operator environments
* Release artifacts with checksums and a short “how to run” guide

---

### 3. Architectural Alignment

Dump Doctor aligns with Canton architecture and ecosystem priorities by building on the existing health dump mechanism rather than introducing new runtime components:

* It operates strictly **above** Canton’s diagnostic interfaces and consumes the health dump artifact produced by the standard troubleshooting workflow.
* It does not require protocol changes, consensus changes, or modifications to Canton nodes.
* It improves reliability and operator experience in a way that complements (rather than competes with) LocalNet tooling, CI tooling, or IDE tooling.

**Relevant CIPs:** No new CIP is required. This tool is an external operational utility and does not alter protocol behavior or standard interfaces.

---

### 4. Backward Compatibility

*No backward compatibility impact.*
Dump Doctor is an external, read-only tool that consumes health dump ZIP files and produces reports.

---

## Milestones and Deliverables

### Milestone 1: *(Ingestion + Normalization MVP)*

* **Estimated Delivery:** 2026-03-11
* **Focus:** Reliable dump ingestion (including nested ZIP) + normalized model + deterministic JSON output
* **Deliverables / Value Metrics:**

  * `dump-doctor analyze <dump.zip> --format json` produces deterministic `report.json` (stable ordering, stable IDs)
  * Handles nested ZIP dumps and produces a valid report in all fixture cases
  * Fixture suite:

    * 1 minimal dump fixture
    * 1 nested ZIP fixture
    * 1 “large logs” fixture
  * Test coverage:

    * ≥ 20 unit tests
    * ≥ 3 golden test fixtures with stable expected outputs
  * Performance target:

    * `summarize` completes in < 10 seconds on fixtures
    * `analyze` completes in < 30 seconds on fixtures

### Milestone 2: *(Rule Engine + Rulepack v1 + Redaction)*

* **Estimated Delivery:** 2026-03-25
* **Focus:** High-signal rule engine + v1 rulepack + strict redaction + Markdown report
* **Deliverables / Value Metrics:**

  * Rule engine supporting `rule_id`, severity, confidence, and evidence references
  * Rulepack v1:

    * ≥ 10 rules shipped
    * Each rule has: detection logic, explanation, and next-step guidance
  * `report.md` rendering:

    * Top findings summary (P0/P1/P2)
    * Bounded evidence excerpts
    * Recommended next actions
  * Strict redaction mode:

    * Enabled by default in reporting
    * Automated tests verify secrets-like tokens are not emitted in outputs

### Milestone 3: *(Packaging + Operator UX + Documentation)*

* **Estimated Delivery:** 2026-04-08
* **Focus:** Release-quality packaging + operator usability + knowledge transfer
* **Deliverables / Value Metrics:**

  * CLI binaries + Docker image published
  * Release automation with checksums and changelog
  * Operator UX:

    * Exit codes: `0` (no findings above threshold), `1` (warnings), `2` (fail/critical)
    * Flags: `--max-findings`, `--max-log-bytes`, `--redact strict|relaxed`
  * Documentation:

    * “Generate dump → run Dump Doctor → attach report to ticket”
    * “How to add a new rule safely”
  * End-to-end demo on “large logs” fixture: dump → report in < 60 seconds

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

* Deliverables completed as specified for each milestone
* Demonstrated functionality or operational readiness
* Documentation and knowledge transfer provided
* Alignment with stated value metrics

**Project-specific acceptance conditions:**

* Nested ZIP dumps are handled reliably (no manual intervention required).
* Outputs are deterministic (stable ordering, stable rule IDs, versioned JSON schema).
* Strict redaction is default and validated by automated tests.
* Tool remains read-only and offline-first by default (no write actions, no telemetry, no uploads).
* Rulepack v1 includes ≥ 10 rules with unit tests and golden fixtures.

---

## Funding

**Total Funding Request:** **130,000 CC**

### Payment Breakdown by Milestone

* Milestone 1 *(Ingestion + Normalization MVP)*: **40,000 CC** upon committee acceptance
* Milestone 2 *(Rule Engine + Rulepack v1 + Redaction)*: **55,000 CC** upon committee acceptance
* Milestone 3 *(Packaging + Operator UX + Documentation)*: **35,000 CC** upon final release and acceptance

### Volatility Stipulation

If the project duration is **under 6 months**:
Should the project timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility.

---

## Co-Marketing

Upon release, the implementing entity will collaborate with the Foundation on:

* Announcement coordination
* Short technical blog post (“From health.dump to actionable triage in under a minute”)
* Ecosystem promotion (operator runbook snippet + example ticket template section)

---

## Motivation

This proposal delivers immediate ecosystem value by making a standard Canton troubleshooting artifact usable under real incident conditions. Health dumps already exist, but interpretation is slow and inconsistent across teams; a standardized triage report reduces time-to-diagnosis and improves the quality of escalations and support tickets. The tool is safe-by-default, requires no changes to Canton nodes, and can be adopted by any operator in a single command.

Expected impact:

* Faster incident triage (reduced time spent searching logs/metrics/threads manually)
* Higher quality, consistently redacted evidence artifacts for escalation
* Lower operator onboarding friction (repeatable, documented workflow)

---

## Rationale

This approach is preferred over alternatives because it is narrow, safe, and high ROI:

* It does not attempt to replace monitoring stacks or build dashboards (which would increase scope and overlap risk).
* It improves a workflow that already exists in Canton operations: generating a health dump.
* It avoids privileged write access and avoids automating risky admin operations.
* It provides deterministic, testable deliverables (fixtures, rule IDs, schema versioning) rather than subjective “best effort” guidance.

Alternatives considered:

* “Just unzip and grep” is common but inconsistent, slow under pressure, and not easily shareable in a standardized format.
* Building dashboards or observability stacks is larger scope and overlaps with other tooling directions; this proposal stays focused on triage from an existing artifact.


Dapps over Apps is a collective advancing Web3 through developer tooling and education. We create tools that enhance the developer experience and lead initiatives that onboard new builders into blockchain ecosystems.


We built a local testing patch that adds native support for Arbitrum precompiles (ArbSys at 0x64, ArbGasInfo at 0x6c) and transaction type 0x7e (deposits) to Hardhat and Foundry (Anvil).
Website: [www.ox-rollup.com](http://www.ox-rollup.com)
Ox-rollup/README.md at verify/m2-step1 · Supercoolkayy/Ox-rollup

We created a Retrieval Utility tool for Filecoin that tests CID retrieval performance across multiple public gateways. [https://www.retrievaltester.com/](https://www.retrievaltester.com/)

We built ZecKit (Zcash) — a one-command Zebra devnet + reusable CI/automation toolkit for Zcash developer workflows. [https://github.com/zecdev/ZecKit](https://github.com/zecdev/ZecKit) (Release: [https://github.com/Great-DoA/ZecKit/releases/tag/v0.0.1-beta](https://github.com/Great-DoA/ZecKit/releases/tag/v0.0.1-beta))

We created a professional VoxEdit to Unity/Roblox Asset Converter for Sandbox creators and gamers. [https://github.com/Supercoolkayy/voxbridge/](https://github.com/Supercoolkayy/voxbridge/)

We built a VS Code extension for Arbitrum Stylus designed to provide a superior coding experience for Arbitrum Stylus smart contract development. [https://github.com/Supercoolkayy/Abitrum-stylus-extension/tree/main](https://github.com/Supercoolkayy/Abitrum-stylus-extension/tree/main)

We built a Portable Sandbox Identity Toolkit that lets you convert your Sandbox avatars to VRM format for use across metaverse platforms like Unity, VRChat, and more. Includes blockchain-based ownership verification to ensure you own the avatar NFT before conversion. [https://pypi.org/project/avatar-everywhere-cli/](https://pypi.org/project/avatar-everywhere-cli/)

Some of our notable contributions include:

Abdulkareem Oyeneye – Project Lead
Experienced developer tool engineer and project manager with a strong background in Web3 growth and technical product execution. He has led multiple ecosystem tooling initiatives and is skilled at identifying developer pain points and protocol infrastructure needs. [https://www.linkedin.com/in/abdulkareem-oyeneye-82a6aa277](https://www.linkedin.com/in/abdulkareem-oyeneye-82a6aa277)

Gospel Ifeadi – Smart Contract Engineer
Proficient in Rust, C++, JavaScript, and Python. Gospel has worked on multiple dApps and developer tooling projects. He brings deep experience in backend development, smart contract automation, and R&D. [https://x.com/gospel70800](https://x.com/gospel70800)

Musa Abdulkareem – ZK Engineer
Focused on building robust blockchain toolkits and applications. Musa contributes core engineering support for protocol-level integrations. [https://www.linkedin.com/in/wisemrmusa](https://www.linkedin.com/in/wisemrmusa)

Bolaji Ahmad – Full Stack Engineer
Bolaji has worked on foundational tooling within the Polkadot ecosystem and contributes full stack and infrastructure expertise across multiple blockchain frameworks. [https://linkedin.com/in/bolajahmad](https://linkedin.com/in/bolajahmad)

---


