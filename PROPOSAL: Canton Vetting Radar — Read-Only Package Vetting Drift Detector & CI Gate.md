# Development Fund Proposal  
**Author:**  [Crackdevs](https://www.crackdevs.com)
**Status:** Submitted 
**Created:** 2026-02-26  

---

## Abstract  
Package vetting inconsistencies can block Canton workflows at runtime when required package versions are not vetted consistently across participants on a synchronizer. **Canton Vetting Radar** is a safe, read-only CLI that queries vetted-package state via the Ledger API and produces a deterministic drift report (Markdown + JSON) plus a CI-friendly “gate” mode that fails when required vetting conditions are not met. It requires no topology write access and makes rollout readiness reviewable and repeatable.

---

## Specification  

### 1. Objective  
**Problem being solved**  
During package rollouts and upgrades, teams can end up with inconsistent vetting state across participants and synchronizers (missing vetting, mixed versions, partial rollouts). Diagnosing these issues is slow because the answer (“who vetted what, where”) is scattered across node access patterns, and it is rarely captured as a reusable artifact for reviews or incident handoffs.

**Intended outcome**  
Deliver a small, low-risk tool that provides:  
- An aggregated view of vetted packages across one or more scanned participant Ledger API endpoints  
- Deterministic drift detection with explicit severity levels (FAIL/WARN/INFO)  
- A requirements-based compliance check that can be used as a CI gate in any pipeline  
- Outputs that are reproducible and suitable for change reviews and support tickets  

---

### 2. Implementation Mechanics  
**Operational approach (safe-by-default)**  
- Read-only by default; no topology write actions and no “auto-fix” behavior  
- Uses structured Ledger API data (no log parsing, no heuristics on free-form text)  
- No telemetry or uploads; runs locally and outputs local artifacts  
- Authentication is handled via standard Ledger API credentials (TLS + bearer token), supplied by env/file/stdin; secrets are not persisted unless explicitly requested

**Core workflow**  
1) **Scan (data acquisition)**  
- User provides a list of participant Ledger API endpoints to scan  
- For each endpoint, call `ListVettedPackages` and collect: synchronizer ID → vetted packages (name/version identifiers)  
- Produce a normalized, versioned `scan.json` artifact

2) **Analyze (drift detection)**  
- Apply a small, deterministic rule set to `scan.json` and/or live scan results  
- Drift rules are explicit and testable (no subjective “best guess” rules)

3) **Check (requirements gate)**  
- Evaluate results against a simple `requirements.yaml` file  
- Return deterministic exit codes:
  - `0` = compliant  
  - `1` = warnings (non-blocking drift)  
  - `2` = fail (missing required vetting or incompatible mismatch)

4) **Report (human + machine)**  
- `report.md`: readable summary + matrices + remediation checklist (who is missing what)  
- `report.json`: machine schema for automation and programmatic consumption  
- Both outputs are deterministic (stable ordering, stable IDs)

**Implementation choices (concrete and non-hypothetical)**  
- Language: Go (single static binary distribution, mature gRPC support)  
- Packaging: GitHub releases (Linux/macOS binaries + checksums) and a minimal Docker image  
- Testing:
  - Unit tests with mocked Ledger API responses  
  - Golden tests to guarantee stable report output  
  - One integration test harness using a controlled test participant (for CI validation)

---

### 3. Architectural Alignment  
- **Canton-native data source:** Uses a first-class Ledger API call intended to surface vetted-package state, keeping the tool aligned with standard access patterns and avoiding privileged topology write paths.  
- **Ecosystem priority:** Improves reliability of package rollouts and upgrades by making vetting readiness observable, reviewable, and gateable before production impact occurs.  
- **Non-overlap with current proposal lanes:** This is not CI action infrastructure, not LocalNet/dev environment tooling, not IDE tooling, not wallet tooling, and not a topology write-path manager. It is a focused read-only verifier and reporting utility.

**Relevant CIPs:** No new CIP required. This tool does not modify protocol behavior or introduce new standards; it operationalizes correct rollout hygiene using existing interfaces.

---

### 4. Backward Compatibility  
*No backward compatibility impact.*  
Canton Vetting Radar is an external, read-only tool that does not alter nodes, packages, topology, or transaction semantics.

---

## Milestones and Deliverables  

### Milestone 1: _(Scan + Normalized Inventory)_  
- **Estimated Delivery:** 2026-03-13  
- **Focus:** Reliable scan pipeline + stable `scan.json` schema  
- **Deliverables / Value Metrics:**  
  - `scan` command that connects to one or more participant Ledger API endpoints and emits a versioned `scan.json`  
  - Normalized model: per scanned participant → per synchronizer → vetted package identifiers  
  - Deterministic output ordering and stable IDs  
  - Tests: ≥ 20 unit tests + ≥ 3 golden fixtures  
  - Performance target: scan completes in < 30 seconds for a typical small environment (bounded by network latency)

### Milestone 2: _(Drift Detection + Requirements Gate)_  
- **Estimated Delivery:** 2026-03-27  
- **Focus:** Make results actionable and CI-friendly  
- **Deliverables / Value Metrics:**  
  - `requirements.yaml` schema + strict validator (no silent assumptions)  
  - `check` command with deterministic exit codes (0/1/2)  
  - Drift rules (deterministic, minimal false positives):
    - Missing required package/version on a scoped participant/synchronizer → FAIL  
    - No shared allowed version set across scoped participants → FAIL  
    - Mixed versions present but still within allowed set → WARN  
    - Unscoped participants detected (when scanning in discover mode) → WARN  
  - Golden fixtures: ≥ 6 drift scenarios with expected outputs  
  - `report.json` includes machine-actionable remediation entries (“participant X missing package Y on synchronizer S”)

### Milestone 3: _(Reporting + Packaging + Docs)_  
- **Estimated Delivery:** 2026-04-10  
- **Focus:** Drop-in usability and adoption  
- **Deliverables / Value Metrics:**  
  - `report` command generating deterministic `report.md` + `report.json`  
  - Release artifacts: Linux + macOS binaries with checksums; minimal Docker image  
  - Documentation:
    - 5-minute quickstart  
    - CI examples (generic, not tied to any one CI vendor)  
    - Rollout checklist: “how to use FAIL/WARN/INFO to complete a rollout safely”  
  - Example templates:
    - `requirements.yaml` examples for common deployment patterns  
    - sample reports for reviewers

---

## Acceptance Criteria  
The Tech & Ops Committee will evaluate completion based on:  
- Deliverables completed as specified for each milestone  
- Demonstrated functionality or operational readiness  
- Documentation and knowledge transfer provided  
- Alignment with stated value metrics  

**Project-specific acceptance conditions:**  
- Tool remains read-only by default and contains no topology write-path automation.  
- `check` results are deterministic (same inputs → same outputs) with stable exit codes (0/1/2).  
- Reports are reproducible and stable (golden fixtures must pass).  
- Requirements validation must prevent false confidence (explicitly warns when using discover mode without an explicit participant scope).  
- Release artifacts must be provided for Linux and macOS with checksums.

---

## Funding  
**Total Funding Request:** **135,000 CC**  

### Payment Breakdown by Milestone  
- Milestone 1 _(Scan + Normalized Inventory)_: **40,000 CC** upon committee acceptance  
- Milestone 2 _(Drift Detection + Requirements Gate)_: **55,000 CC** upon committee acceptance  
- Milestone 3 _(Reporting + Packaging + Docs)_: **40,000 CC** upon final release and acceptance  

### Volatility Stipulation  
If the project duration is **under 6 months**:  
Should the project timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility.

---

## Co-Marketing  
Upon release, the implementing entity will collaborate with the Foundation on:  
- Announcement coordination  
- Case study or technical blog (“Preventing package vetting drift with a read-only CI gate”)  
- Developer/operator promotion (example `requirements.yaml`, sample reports, rollout checklist)

---

## Motivation  
This proposal targets a reliability gap that directly affects successful Canton deployments: package rollout readiness is often not captured as a deterministic artifact, and vetting inconsistencies can block workflows at runtime. Canton Vetting Radar makes rollout vetting state visible, reviewable, and gateable in a safe, read-only way, improving operational confidence without introducing write-path risk or requiring node changes.

Expected adoption:  
- Operators run it before and after package rollouts to confirm consistency  
- Integrators use `check` mode as a release-readiness gate in CI  
- Support workflows attach reports to incidents to reduce back-and-forth during diagnosis

---

## Rationale  
This approach is preferred because it avoids the most common reviewer blockers:  
- It is not “just listing state.” The core value is deterministic drift detection + requirements-based gating + reproducible artifacts.  
- It stays out of dangerous territory by remaining read-only and advisory (no auto-fix, no topology transaction submission).  
- It uses structured Ledger API data rather than heuristic parsing, reducing brittleness and maintenance burden.  
- It fits the $20k–$25k MVP constraint because it is bounded to one core data source, a small deterministic rule set, and packaging/documentation—no dashboards, no hosted services, and no ecosystem-wide coordination requirements.
## Team (Crackdevs)

[Crackdevs](https://www.crackdevs.com) is a builder collective focused on developer tooling and core infrastructure. We build and maintain CLIs, SDKs, templates, IDE extensions, deployment workflows, and other “glue” tooling that makes blockchain development less painful.

### Team member backgrounds

#### Victor Durosaro (GitHub: psyberpath)
Background: Web3 and backend engineer with strong Node.js and NestJS experience.  
Profile: https://github.com/psyberpath  
Work samples:
- nestjs-auction-system (real-time auction backend with concurrency, WebSockets, caching, background jobs): https://github.com/psyberpath/nestjs-auction-system
- nestjs-esp-integration-api (Mailchimp/GetResponse integration API with key validation, rate limiting, Postgres/TypeORM): https://github.com/psyberpath/nestjs-esp-integration-api

#### Aje Damilola (GitHub: ajedamilola)
Background: Full stack web/software developer across Node.js, React, Electron, PHP/Laravel, Flutter, and databases.  
Profile: https://github.com/ajedamilola  
Work samples:
- propress (blog/news sharing platform): https://github.com/ajedamilola/propress
- qrcode_generator (QR code generator in PHP): https://github.com/ajedamilola/qrcode_generator

#### Divine Favour (GitHub: Divine572)
Background: Quant and Web3-focused engineer building trading and blockchain projects.  
Profile: https://github.com/Divine572  
Work samples:
- QuanTrader (Python quant research library, feature engineering + backtesting): https://github.com/Divine572/QuanTrader
- Celo-Wallet (simple wallet on Celo in Go): https://github.com/Divine572/Celo-Wallet

#### Tochukwu Samuel (GitHub: devine200)
Background: Engineer interested in Web3 dApp development and LLM engineering, with hands-on projects across Solidity, backend services, and analysis workflows.  
Profile: https://github.com/devine200  
Work samples:
- InterSwitchAssessment (asset registry: Solidity + Node backend + analysis notebook): https://github.com/devine200/InterSwitchAssessment
- LBPoolConcept (liquidity bootstrapping pool concept with weighted AMM mechanics): https://github.com/devine200/LBPoolConcept

#### Ifedimeji Omoniyi (Technical Product Manager)
Background: Technical product manager with experience across developer tooling, protocols, and infrastructure.  
Profile: https://www.linkedin.com/in/ifedimeji-omoniyi-948132233/

