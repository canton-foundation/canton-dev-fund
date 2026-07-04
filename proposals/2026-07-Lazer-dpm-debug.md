# Development Fund Proposal: DPM Debug — Visual Debugging Plugin for Daml on Canton

| Field | Value |
| :---- | :---- |
| Author | Sayeed (Lazer Technologies) |
| Org | Lazer Technologies |
| Status | Submitted |
| Created | 2026-07-03 |
| Category | daml-tooling |
| Champion | Jatin Pandya (Canton Foundation) |
| Supporting materials | [Strategy deck](https://lazertechnologies.github.io/canton-debugger-proposal/) · [Repo](https://github.com/LazerTechnologies/canton-debugger-proposal) |

---

## Abstract

`dpm-debug` is a DPM plugin that brings visual transaction debugging, structured test output, and a debug log panel to the Daml developer experience on Canton. The Canton Foundation's own developer experience survey flagged visual debugging and transaction visibility as the top missing tools in the ecosystem, and Foundation feedback has repeatedly identified a high-quality debugging experience as the single biggest gap on top of Canton.

This proposal requests **1,000,000 CC (~$140,000 USD)** over **16 weeks** across **3 milestones** to design, build, and release `dpm-debug` 1.0 as an open-source (MIT) plugin for DPM.

---

## Objective and Scope

### Objective

Deliver a production-quality debugging plugin for DPM that gives Daml developers on Canton:

1. **Structured CLI test output** — readable test results with assertion diffs and direct source linking, replacing raw, hard-to-parse output.
2. **Visual transaction tree** — a web UI that renders transaction structures visually so developers can inspect contract creates, exercises, and archives during active development.
3. **Debug/trace log panel** — a filterable, searchable panel for debug and trace logs emitted during test and script execution.
4. **Snapshot/replay** — capture a test or script execution and replay it for step-through inspection.

### Scope

In scope: DPM plugin scaffold and distribution, CLI output formatting, web UI for transaction visualization and logs, snapshot/replay, end-to-end documentation, and a walkthrough video. Out of scope: compile-time static analysis (covered by Certora's Daml Package Analyzer), production monitoring/observability, and changes to Canton or Daml core.

---

## Motivation and Ecosystem Value

Debugging is the most-cited gap in the Daml developer experience on Canton. Developers today rely on raw log output and manual inspection to understand transaction behavior, which slows development and raises the barrier to entry for new teams building on Canton.

`dpm-debug` is complementary to existing funded work, with no overlap:

- **Certora (PR #130)** provides compile-time static analysis of `.dar` files for security auditing. `dpm-debug` operates at a different layer: runtime debugging during active development. Different layer, different users, zero overlap.
- **Digital Asset's DPM/Daml maintenance (PRs #47–#49)** keeps DPM working. `dpm-debug` extends DPM with new capability via its plugin architecture rather than duplicating infrastructure — the architecture recommended to us by the Foundation.
- **Obsidian's training program (PR #32)** produces educational content. Better debugging tooling makes learning-by-doing faster and complements training material.

The plugin is a common-good developer tool: open-source, MIT-licensed, and usable by every team building Daml applications on Canton.

---

## Technical Approach

- **DPM plugin architecture:** `dpm-debug` ships as a DPM plugin, installable through the standard DPM workflow. This builds on the tooling the Foundation already funds and follows the architecture specifically recommended by the Foundation.
- **Structured test output (M1):** a parser for test/script execution results that renders structured, colorized CLI output with assertion diffs (expected vs. actual) and links back to the source location of failures.
- **Visual transaction tree (M2):** a local web UI that renders the transaction tree — creates, exercises, archives, and their nesting — with node inspection, plus a debug/trace log panel with filtering and full-text search.
- **Snapshot/replay (M3):** serialize execution traces to disk so a session can be reloaded, shared, and stepped through after the fact.
- **Open source:** all code released under the MIT license in a public repository, with CI, tests, and contribution guidelines.

---

## Architectural Alignment

- Extends **DPM**, the Foundation-funded package manager, through its plugin system — adding capability without duplicating funded maintenance work.
- Addresses the #1 gap identified in the Foundation's DX survey (visual debugging and transaction visibility).
- Complements, and does not overlap with, funded static-analysis (Certora), maintenance (Digital Asset), and training (Obsidian) proposals.
- Open-source MIT licensing aligns with the fund's common-good scope guidance.

---

## Milestones and Deliverables

Total: **1,000,000 CC (~$140,000 USD)** over **16 weeks**. 80% of funding is unlocked in M1 and M2.

| Milestone | Duration | Deliverables | CC | USD |
| :---- | :---- | :---- | ---: | ---: |
| **M1 — Plugin + CLI** | Weeks 1–6 | DPM plugin scaffold; execution-result parser; structured CLI test output with assertion diffs and source linking | 400,000 | $56,000 |
| **M2 — Visual Debugger** | Weeks 7–12 | Local web UI; visual transaction tree with node inspection; debug/trace log panel with filter and search | 400,000 | $56,000 |
| **M3 — Polish + Release** | Weeks 13–16 | Snapshot/replay; end-to-end documentation; walkthrough video; 1.0 release under MIT license | 200,000 | $28,000 |
| **Total** | 16 weeks | | **1,000,000** | **$140,000** |

---

## Acceptance Criteria

**M1 — Plugin + CLI (400,000 CC)**
- `dpm-debug` installs as a DPM plugin via the standard DPM workflow on macOS and Linux.
- Running a Daml test suite through the plugin produces structured output: pass/fail summary, per-test status, and assertion diffs showing expected vs. actual values.
- Test failures link to the source file and line of the failing assertion.
- Code public in the project repository with CI running the test suite.

**M2 — Visual Debugger (400,000 CC)**
- Web UI launches locally from the plugin and renders the full transaction tree (creates, exercises, archives, nesting) for a test or script execution.
- Individual nodes can be inspected to view contract payloads and choice arguments.
- Debug/trace log panel displays logs emitted during execution with level filtering and full-text search.
- Demonstrated end-to-end against a sample Daml project.

**M3 — Polish + Release (200,000 CC)**
- Snapshot of an execution can be saved to disk and replayed in the web UI.
- Complete documentation: installation, usage, and troubleshooting.
- Public walkthrough video demonstrating the full workflow.
- Version 1.0 tagged and released under the MIT license.

---

## Funding Request and Payment

- **Total request:** 1,000,000 CC (~$140,000 USD at $0.14/CC)
- **Payment:** milestone-based in Canton Coin, released after acceptance of each milestone per the fund's payment terms
- **Breakdown:** M1 — 400,000 CC; M2 — 400,000 CC; M3 — 200,000 CC

---

## Team and Capability

[Lazer Technologies](https://www.lazertechnologies.com/industries/crypto) is a North America-based product studio with 200+ senior engineers specializing in developer tooling, wallet infrastructure, and AI-forward engineering for crypto and fintech clients including Coinbase, Kraken, Privy, Dynamic, Turnkey, and Crossmint.

This is Lazer's first Canton Development Fund proposal, deliberately scoped as a modest, credible first ask (~$8.75K/week over 16 weeks) that positions the team for follow-up contributions after delivery.

---

## Adoption and Distribution Plan

- Distributed through DPM's plugin mechanism for one-command installation.
- Announced through Canton community channels with a walkthrough video at 1.0 release.
- Documentation and sample project lower onboarding friction for new Daml developers.
- MIT license enables any team or vendor to build on and extend the tool.
