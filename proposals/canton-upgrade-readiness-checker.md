## Development Fund Proposal

**Author:** Ayush  
**Status:** Draft  
**Created:** 2026-04-04  
**Title:** Canton Upgrade Readiness Checker  

---

## Abstract

This proposal introduces the **Canton Upgrade Readiness Checker**: a CLI tool that validates whether validator and application infrastructure is ready for a Canton or Daml 3 upgrade. It analyzes configuration files, package versions, topology assumptions, and known upgrade patterns to surface breaking changes, deprecation warnings, and misconfigurations before they reach production. By reducing upgrade risk and manual checking effort, this tool improves validator uptime, shortens migration windows, and lowers the barrier to upgrade adoption for new teams building on Canton.

---

## Specification

### 1. Objective

**Problem:**  
Canton and Daml upgrades often require coordinated changes to validator configs, topology, package versions, and API usage. Operators currently perform these checks manually or via ad hoc scripts, increasing the risk of downtime, misconfigurations, and extended rollout windows. The LSU-style upgrade path shows that protocol-level changes are becoming more complex and systematic, but no shared tooling exists to validate readiness for those changes.

**Intended outcome:**  

- Eliminate “surprise” upgrade blockers by catching configuration and version mismatches before deployment.  
- Provide a standard, reusable tool for validators, app teams, and onboarding teams to validate readiness for a Canton or Daml 3 upgrade.  
- Reduce upgrade coordination time from days to minutes and make upgrades safer for new adopters.

---

### 2. Implementation Mechanics

**Core workflow:**  

1. User runs `canton-upgrade-checker validate` over a validator or app deployment directory.  
2. The tool parses configuration files (`.conf`, `.json`, `.yaml`, TOML), package manifests, and topology files.  
3. It applies a rules engine that encodes:  
   - Known Canton/Daml 3 upgrade rules (e.g., deprecated fields, required fields, upgraded topology assumptions).  
   - Version constraints (e.g., “minimum Daml 3.1 runtime”, “validator 3.x required”).  
   - Common misconfigurations (e.g., mismatched certificates, invalid topology IDs, missing upgrade flags).  
4. The tool outputs:  
   - A human-readable readiness report.  
   - Structured JSON output for CI/CD pipelines.  
   - A list of issues ranked by severity (error, warning, hint).  
   - Optional auto-suggested fixes (e.g., recommended config snippets, `upgrade-plan.md`).

**Technologies and components:**  

- Implementation language: Go or Rust (Rust preferred for safety and tooling culture).  
- Configuration parsing: compositional parsers for common config formats (HOCON, JSON, YAML, TOML).  
- Rules engine: declarative YAML-based rule definitions that can be extended over time.  
- Output: text report, JSON, and optional Markdown/HTML.  
- CI/CD integration: hooks for GitHub Actions / GitLab CI to block merges if critical issues exist.  
- Source: fully open-source repository under a permissive OSS license, hosted in the Canton ecosystem (e.g., `canton-upgrade-checker`).

**Operational approach:**  

- The tool runs offline over local or downloaded configs; no live Canton node interaction initially.  
- Later, an optional plugin mode could connect to a node’s admin API to validate runtime-level assumptions (if scope and security are acceptable to the committee).

---

### 3. Architectural Alignment

This work aligns with Canton architecture and ecosystem priorities in several ways:

- **Protocol upgrade support:**  
  Aligns with LSU-style upgrades and Canton’s global synchronizer model, where upgrades must be coordinated without global downtime. The tool does not change the protocol, but it makes the upgrade path safer and easier to operationalize.  
- **Validator tooling:**  
  Provides shared infrastructure for validators and node operators, reducing the burden of manual configuration checks.  
- **Ecosystem priorities:**  
  - Makes Canton safer and more approachable for new teams.  
  - Encourages timely upgrades by reducing risk and friction.  
- **Developer tooling:**  
  Fits the fund’s explicit support for shared tooling and developer-enabling infrastructure.

---

### 4. Backward Compatibility

**Impact on existing systems:**  

- The tool runs as a separate CLI and does not modify Canton nodes, configuration files, or running services unless explicitly instructed to generate fix scripts.  
- By default, the tool performs read-only analysis.

**Integration impact:**  

- Existing node operators and app teams can adopt the tool at their own pace.  
- There is no requirement to change existing deployment or config practices; the tool simply adds a new validation step.

**Conclusion:**  
No backward compatibility impact on Canton protocol or node behavior. The tool is an optional validation layer that can be added to existing workflows.

---

## Milestones and Deliverables

### Milestone 1: Core Validator Deployment Checker

- **Estimated Delivery:** Weeks 1–3  
- **Focus:** Validate basic Canton validator deployment configs and common patterns.  
- **Deliverables / Value Metrics:**  
  - `canton-upgrade-checker` core CLI that parses Canton validator configs and outputs a readiness report.  
  - Initial rule set covering 10–15 common issues (e.g., missing fields, deprecated options, invalid topology IDs).  
  - Integration with one example validator deployment (e.g., a local devnet or a small testnet configuration).  
  - Automated tests covering 80%+ of core rules.  
  - Basic documentation (README, CLI reference, example usage).

### Milestone 2: Canton/Daml 3 Upgrade Rules & CI/CD Integration

- **Estimated Delivery:** Weeks 4–6  
- **Focus:** Encode Canton/Daml 3 upgrade guidance into rules and integrate with CI/CD.  
- **Deliverables / Value Metrics:**  
  - Rule set expanded to 30+ checks, including Daml 3 migration patterns, version mismatches, and topology changes.  
  - Output formats: JSON for CI pipelines and Markdown/human-readable reports.  
  - Example GitHub Actions / GitLab CI configuration that blocks merges if critical upgrade issues are detected.  
  - Test suite expanded to 90%+ coverage of public rules.  
  - Example migration playbook (`upgrade-plan.md`) generated from tool output.  
  - Public demo using a small Canton testnet or devnet.

### Milestone 3: Validator-Focused Release and Documentation

- **Estimated Delivery:** Weeks 7–8  
- **Focus:** Harden for validator usage and publish as an ecosystem tool.  
- **Deliverables / Value Metrics:**  
  - Stable v1.0 release published to a package manager (e.g., `go install ...` or Rust’s `cargo` registry).  
  - Validator-specific documentation and tutorials (e.g., “How to validate your upgrade plan”).  
  - Example runs against 3–5 real validator configs (with permission) to demonstrate utility.  
  - Public blog post or technical write-up (co-branded with the Canton Foundation).  
  - No critical bugs in the last 2 weeks of testing.

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone.  
- Demonstrated functionality via:  
  - Working CLI with the described rules and outputs.  
  - Example runs on validator or testnet configs showing meaningful issues flagged.  
- Documentation and knowledge transfer provided:  
  - Installation instructions, CLI usage, rule format, and contribution guidelines.  
- Alignment with stated value metrics:  
  - Clear reduction of potential upgrade risk and upgrade preparation time for validators.  
  - Reusable, open-source tool integrated into at least one example CI/CD pipeline.  

---

## Funding

**Total Funding Request:** 450,000 Canton Coins (CC)

### Payment Breakdown by Milestone

- Milestone 1: Core Validator Deployment Checker – 150,000 CC upon committee acceptance.  
- Milestone 2: Canton/Daml 3 Upgrade Rules & CI/CD Integration – 180,000 CC upon committee acceptance.  
- Milestone 3: Validator-Focused Release and Documentation – 120,000 CC upon final release and acceptance.  

### Volatility Stipulation

The project duration is **under 6 months**, so the grant is denominated in fixed Canton Coin.  
Should the project timeline extend beyond 6 months due to **Committee-requested scope changes**, any remaining milestones must be renegotiated to account for significant USD/CC price volatility.

---

## Co-Marketing

Upon release, the implementing entity will collaborate with the Canton Foundation on:

- **Announcement coordination:**  
  - Joint announcement post on the Canton Foundation site and Discord.  
- **Case study or technical blog:**  
  - A short “lessons learned” write-up showcasing how the tool helped validators or a pilot testnet upgrade.  
- **Developer or ecosystem promotion:**  
  - Inclusion of `canton-upgrade-checker` in onboarding docs for new validator teams.  
  - Optional live demo at a Canton community call or workshop.  

---

## Motivation

This work is valuable because:

- It reduces **operational risk** for validators and app teams during Canton and Daml 3 upgrades, which are critical for security and feature adoption.  
- It makes Canton **safer and easier** for new teams to adopt, as they can validate their configs before touching a live network.  
- It creates **shared infrastructure** that benefits the entire ecosystem rather than a single party.  
- It aligns with the **long-term goal** of reducing friction in protocol and tooling upgrades, especially as the Canton network grows.

---

## Rationale

**Why this approach?**  

- **Problem-driven scope:** Instead of a generic linter, this proposal focuses tightly on upgrade-specific issues (LSU-style changes, topology, Daml 3 migration, version mismatches). This keeps the tool bounded and forces clear metrics (“number of breaking issues caught”).  
- **CLI + rules engine:**  
  - CLI is familiar, lightweight, and scriptable; it fits into existing CI/CD and deployment workflows.  
  - Rules encoded in YAML can be extended by the community and adapted to new CIPs.  
- **No live infra risk:** The tool runs offline or in a dry-run mode, so it does not introduce new runtime dependencies or security surface to Canton nodes.  

**Alternatives considered:**  

- Building a node-integrated upgrade tool was rejected because it would require protocol changes and a higher review bar.  
- A generic Canton linter was rejected because it would be too broad and harder to validate; the committee prefers clearly scoped, impactful tools.  

**Why this is the right solution:**  

- Targets a **real, urgent pain** (upgrade coordination) with a **lightweight, tooling-only** approach.  
- Fits the **450k CC solo-dev budget** and 8-week timeline.  
- Can be shipped, iterated, and reused across the ecosystem without touching the protocol.
