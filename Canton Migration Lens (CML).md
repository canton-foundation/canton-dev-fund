# Development Fund Proposal
**Author:** [Creatives Onchain](https://x.com/cr8tivesonchain)  
**Status:** Draft  
**Created:** 2026-02-27  

---

## Abstract
Some Canton/Splice upgrades require a synchronizer migration with downtime, and major upgrades can change what historical data a participant can serve going forward. These are high-impact operational events where teams need clear, repeatable “migration evidence” to confirm what state was exported before the change and what state exists after.

Canton provides ACS snapshot export/import capabilities intended for operational recovery workflows. Separately, real migration sharp edges have existed (including issues affecting contracts with keys), and Splice migration tooling has evolved with metadata key-format changes over time. Canton Migration Lens (CML) is a small, open-source, offline-first, read-only CLI that validates and diffs ACS snapshot exports into deterministic, redacted reports that can be attached to change tickets and runbooks, without requiring privileged production access by default.

---

## Specification

### 1. Objective
**Problem being solved:** During major upgrades and recovery workflows, operators need a fast, safe way to:
- verify that an exported ACS snapshot is parseable and internally consistent, and
- produce a deterministic before/after comparison artifact that is safe to share internally (redacted) as part of an upgrade ticket.

Today, teams often rely on ad-hoc scripts and manual checks during downtime windows. That increases the chance of missed issues and makes post-mortems harder because there is no standard evidence artifact.

**Intended outcome:** Deliver an offline-first, read-only tool that turns ACS exports into:
- a canonical inventory of active state (counts by template identifier),
- a stable fingerprint (hash) that can be referenced in tickets,
- a semantic diff between two snapshots,
- and a clear PASS/FAIL validation report with stable error codes.

The scope is intentionally sized for a ~$25k-class build (6 weeks, 1–2 engineers), with measurable milestones and minimal operational risk.

---

### 2. Implementation Mechanics
#### Inputs (v1)
1) **ACS snapshot export files** produced via Canton’s ACS export workflow (GZIP-compressed snapshot artifact).
2) **Optional:** Migration dump *metadata JSON* linting only (schema and key-name compatibility), without parsing embedded private state.

#### Outputs (redacted by default)
- `inventory.json` — canonicalized aggregates only (no contract payloads)
- `fingerprint.sha256` — hash of canonical inventory for stable referencing
- `report.json` (+ optional `report.html`) — validation results and diagnostics (redacted)
- `diff.json` (+ optional `diff.html`) — semantic deltas between two inventories

#### Core commands
- `cml inventory <acs_snapshot.gz>`
  - Streams the snapshot and outputs:
    - total contract count
    - counts by template identifier (package/module/entity)
    - canonical, deterministically ordered `inventory.json`
    - `fingerprint.sha256` over the canonical JSON

- `cml validate <acs_snapshot.gz> [--baseline inventory.json]`
  - Outputs `PASS`, `PASS_WITH_WARNINGS`, or `FAIL` with stable error codes.
  - Explicit validation checks (testable):
    - gzip integrity and snapshot decode success
    - inventory total equals the sum of template counts
    - template identifiers are parseable and non-empty
  - Baseline mode:
    - warns on suspicious template-level deltas beyond configured thresholds
  - Known-risk advisories:
    - emits targeted advisories for known migration risk categories (advisories only; not presented as “proof of correctness” for contract-key semantics)

- `cml diff <inventory_a.json> <inventory_b.json>`
  - Produces canonical diffs:
    - template-level count deltas
    - additions/removals of templates
    - fingerprint comparison summary (for tickets)

- `cml lint-migration-metadata <dump_metadata.json>` (optional)
  - Validates required metadata keys/types and supports key naming variations (camelCase vs snake_case).
  - Does not parse embedded private ledger state.

#### Version support (removes a common reviewer blocker)
- v1 will support the ACS snapshot format produced by the Canton OSS version pinned at project start (the version used to generate the golden fixtures).
- The tool will fail safely and clearly if an unsupported snapshot format is encountered.
- A small compatibility matrix will be published in the README (supported versions explicitly listed; no implied “works for all versions”).

#### Safety posture (kill-switch by design)
- Offline-first and read-only: no imports, no topology ops, no writes to Canton state.
- Redaction-by-default: no contract payloads, no sensitive party/stakeholder identities exported in reports.
- No production endpoints required by default.

#### Packaging
- Single runnable CLI artifact (fat JAR) and Docker image.
- GitHub Releases with checksums and a versioned changelog.
- Golden fixtures + deterministic test suite to ensure stable outputs.

---

### 3. Architectural Alignment
CML aligns with Canton and Splice operational realities by focusing on the artifacts operators already produce during recovery and migration workflows (ACS snapshots) and by emitting evidence artifacts that fit into existing change-management practices (tickets/runbooks/incident reports). It sits above existing mechanisms rather than changing core node behavior.

**Non-overlap assurance:** This proposal intentionally avoids the active “red zone” lanes in the current Dev Fund queue such as CI/GitHub Actions suites (Smelt) and LocalNet/dev-environment bundling (DevKit). CML is a migration/recovery evidence tool, not CI infrastructure or environment orchestration.

**Relevant CIPs:** This proposal targets the Dev Fund’s shared tooling goals and milestone-based delivery model (as defined by the Dev Fund process/CIP-0100 governance context).

---

### 4. Backward Compatibility
*No backward compatibility impact.*

---

## Milestones and Deliverables

### Milestone 1: **ACS Inventory & Deterministic Fingerprints**
- **Estimated Delivery:** 2026-03-13
- **Focus:** Build the offline core that produces canonical inventories and stable fingerprints from ACS snapshots.
- **Deliverables / Value Metrics:**
  - `cml inventory` generates canonical `inventory.json` + `fingerprint.sha256`
  - Deterministic output: identical input produces byte-stable canonical JSON and identical fingerprint
  - Golden fixtures and tests:
    - corrupted gzip → specific failure code
    - invalid snapshot → specific failure code
  - Minimal runbook: “Export ACS → Inventory → Fingerprint”

### Milestone 2: **Validator + Redacted Evidence Reports**
- **Estimated Delivery:** 2026-03-27
- **Focus:** Provide PASS/FAIL validation with stable error codes and ticket-ready redacted reports.
- **Deliverables / Value Metrics:**
  - `cml validate` returns `PASS/PASS_WITH_WARNINGS/FAIL`
  - `report.json` (always) and `report.html` (optional), redacted by default
  - Baseline comparison mode:
    - `--baseline inventory.json` flags suspicious template-level deltas beyond configured thresholds
  - Documentation: “Migration Evidence Workflow (pre/post)”

### Milestone 3: **Semantic Diff + Migration Metadata Lint + Releases**
- **Estimated Delivery:** 2026-04-10
- **Focus:** Pre/post comparison artifacts, minimal metadata linting, and production-ready packaging.
- **Deliverables / Value Metrics:**
  - `cml diff` produces stable `diff.json` (+ optional HTML)
  - `cml lint-migration-metadata` validates metadata schema and key-name compatibility
  - Docker image + GitHub Release binaries + checksums + changelog
  - Copy/paste runbook:
    - export ACS (pre) → validate/inventory
    - export ACS (post) → validate/inventory
    - diff inventories → attach diff report to ticket

---

## Acceptance Criteria
The Tech & Ops Committee will evaluate completion based on:
- Deliverables completed as specified for each milestone
- Demonstrated functionality or operational readiness
- Documentation and knowledge transfer provided
- Alignment with stated value metrics

Project-specific acceptance conditions:
- Offline-by-default: no network calls required for core functionality
- Read-only-by-default: no import/apply operations
- Redaction-by-default: outputs contain only aggregates (counts/hashes), no payload export
- Deterministic artifacts: canonical JSON outputs and fingerprints are stable across runs for identical inputs
- Safe failure: unsupported snapshot formats fail with a clear error code and remediation guidance
- Reproducible demo: documented demo flow showing pre/post inventory and diff artifacts

---

## Funding
**Total Funding Request:** 150,000 CC

### Payment Breakdown by Milestone
- Milestone 1 (ACS Inventory & Deterministic Fingerprints): 60,000 CC upon committee acceptance
- Milestone 2 (Validator + Evidence Reports): 55,000 CC upon committee acceptance
- Milestone 3 (Semantic Diff + Metadata Lint + Releases): 35,000 CC upon final release and acceptance

### Volatility Stipulation
If the project duration is **under 6 months**:
Should the project timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility.

---

## Co-Marketing
Upon release, the implementing entity will collaborate with the Foundation on:
- Announcement coordination
- A technical blog post explaining the “migration evidence” workflow and how to use the tool safely
- A short recorded demo walkthrough (5–10 minutes) showing pre/post inventory + diff

---

## Motivation
This work reduces operational risk during high-impact upgrade and recovery events by providing deterministic, redacted evidence artifacts that fit into normal operational workflows (tickets/runbooks). It is immediately usable by any team that exports ACS snapshots for recovery or migration workflows, without requiring integration changes or privileged production access by default.

---

## Rationale
A migration automation or “apply” tool introduces high risk (write-path, potential to affect network state) and is harder to approve. A broad CI suite or LocalNet environment tool is already covered by active proposals and is outside a $25k-class scope. CML is intentionally small, safe-by-default, and focused on a narrow but critical gap: standardized, deterministic verification and comparison artifacts for migration/recovery snapshots.

**Alternatives considered:**
- “Deep parsing” of private migration dumps: rejected for v1 due to format brittleness and privacy risk. Instead, v1 only lints metadata key compatibility.
- Pure file diffs: rejected because raw diffs are noisy and not ticket-friendly. CML produces semantic, canonicalized diffs at the template inventory level.


## Team
### Akeem Adelanke — Project Manager & Developer Onboarding Specialist
**Background:** Experience in developer onboarding, crypto programs, and community operations with NEAR, Creatives DAO, Mintbase, and Arbitrum.  
**Responsibilities:** Delivery planning, stakeholder coordination, pilot integrator support, documentation quality, community updates.  
**Social:** https://x.com/cr8tivesonchain  

### Timothy Popoola — Systems and Verification Engineer (Test Reliability + Invariants)
**Background:** Engineer with experience building security-sensitive systems and system-level interfaces. Built FlowGuard (non-custodial treasury management protocol for Bitcoin Cash; honorable mention at the BCH Blaze Hackathon) and architected AetheraOS (bridge between MCP and local OS execution).  
**Relevant Links:**  
- FlowGuard: https://github.com/winsznx/flow-guard | https://flow-guard-delta1.vercel.app  
- AetheraOS: https://github.com/winsznx/AetheraOS | https://aethera-os.vercel.app  
**Responsibilities:** Define correctness invariants for inventory/fingerprint generation; design adversarial and negative test scenarios (corrupt gzip, malformed snapshot, edge-case template identifiers); ensure deterministic, CI-friendly golden fixtures; review report stability and classification rules (PASS/WARN/FAIL) to avoid misleading results.

### Christian Ndu — Core Implementation Engineer (CLI + Diff Engine + Tests)
**Background:** Backend and full stack engineer with experience across TypeScript, Go, and Rust, with a focus on shipping developer tooling.  
**Responsibilities:** Implement the CLI commands (`inventory`, `validate`, `diff`, optional metadata lint); implement canonicalization (stable JSON ordering), hashing, and diff rendering; build unit tests and golden fixtures; ensure no sensitive data is logged by default and any verbose/debug output is opt-in.  
**Social:** https://github.com/khrees2412  

### Musa Habeeblai — Protocol and Security Reviewer (Semantics + Safety)
**Background:** Blockchain and protocol engineer with experience in zk systems and production-grade protocol work.  
**Responsibilities:** Review inventory semantics (what is safe and meaningful to report); review redaction policy and “no payload” guarantees; review risk advisories to minimize false alarms without masking real issues; ensure the tool remains strictly observational and does not encourage unsafe handling of exports.  
**Social:** https://github.com/beebozy  
