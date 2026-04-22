---
author: Sayeed Mehrjerdian (Lazer Technologies)
status: Draft
created: 2026-04-22
labels: daml-tooling
champion: Jatin Pandya (requested)
---

# Development Fund Proposal: DPM Debug — Visual Debugging Plugin for Daml on Canton

## Abstract

We propose to build **dpm-debug**, an open-source DPM plugin that brings visual transaction debugging, structured test output, and a debug log panel to the Daml developer experience on Canton. The tool hooks into DPM's existing test and script execution engine — it does not reimplement Daml evaluation — and surfaces runtime information through both an enhanced CLI and a local web UI.

This addresses the most-cited developer experience gap in the Canton ecosystem: the lack of a Hardhat/Tenderly-class debugging workflow. Every Daml developer benefits. The plugin architecture also serves as a reference implementation for future DPM plugin development.

## Specification

### Objective

Daml is a powerful but young smart-contract language. Developers coming from Solidity or other ecosystems expect visual transaction inspection, readable test failures, and structured logs. Today, debugging Daml largely means manually re-running test scripts via `dpm test` and reading raw console output, which:

- Slows down onboarding for new Daml engineers
- Makes root-causing contract logic bugs materially harder than in comparable ecosystems
- Is a recurring concern identified in the Foundation's developer experience survey

A strong debugger is a force multiplier: every engineer who touches Daml benefits, and it lowers the barrier to entry for the next wave of developers the ecosystem is trying to attract.

`dpm-debug` closes this gap by providing:

1. Structured, color-coded test results with assertion diffs and source-line linking
2. A visual transaction tree (exercised choices, fetched contracts, authorization chains)
3. A correlated debug/trace log panel
4. Ledger snapshot and replay-from-step for faster iteration

### Implementation Mechanics

- **Language/Stack:** TypeScript (CLI + web UI), leveraging DPM's plugin interface
- **Execution engine:** DPM itself. `dpm-debug` wraps `dpm test` and `dpm script`, parses structured output (JSON transaction logs), and renders it
- **Web UI:** Lightweight local dev server (React, single-page) launched via `dpm debug <script>`
- **Integration point:** Builds on and references [Build-on-Canton-MCP](https://github.com/Jatinp26/Build-on-Canton-MCP) for MCP-based tooling patterns
- **Reference:** [DPM documentation](https://docs.digitalasset.com/build/3.4/dpm/dpm.html)

### Architectural Alignment

- Extends DPM (funded under PR #49) rather than duplicating it
- Follows DPM's plugin conventions, creating a reusable pattern for the community
- Complements Certora's Package Analyzer (PR #130): static analysis at compile time vs. runtime debugging
- Aligns with Canton's push for improved developer tooling and onboarding
- Relevant CIP categories: daml-tooling

### Backward Compatibility

No protocol changes. `dpm-debug` is a pure plugin. It reads DPM's output and adds a visualization/debugging layer. It does not modify DPM core, Canton nodes, or the Daml compiler. Compatible with the current stable DPM/Daml SDK version at time of development.

## Milestones and Deliverables

### Milestone 1: DPM Plugin Scaffold + Enhanced CLI Test Output

**Estimated Delivery:** 4 weeks from approval

**Focus:** Establish the plugin architecture and deliver an immediately useful CLI debugging experience.

**Deliverables and Value Metrics:**

| Deliverable | Value Metric |
|---|---|
| `dpm-debug` plugin scaffold installable via DPM | Plugin installs cleanly; README documents setup |
| Structured test result parser for `dpm test` output | Parses all test result types (pass/fail/error) |
| Color-coded CLI output with assertion diffs | Side-by-side expected vs. actual on failures |
| Source-line linking (file:line for failing assertions) | Clickable in terminal emulators supporting OSC 8 |
| Per-test timing data | Millisecond-granularity per test case |
| Sample Daml project demonstrating the plugin | 3+ contract templates with passing and failing tests |
| Documentation: install guide, usage, contributing guide | Published in repo README + /docs |

**Acceptance Criteria:** Plugin installs via DPM on a clean environment, runs against the sample project, and produces structured output matching the defined spec. Reviewed and accepted by the champion.

### Milestone 2: Visual Transaction Debugger (Web UI)

**Estimated Delivery:** 4 weeks after M1 acceptance

**Focus:** Deliver the visual debugging experience that is the core value proposition.

**Deliverables and Value Metrics:**

| Deliverable | Value Metric |
|---|---|
| Local web UI launched via `dpm debug <script>` | Starts on localhost, auto-opens browser |
| Transaction tree visualization | Expandable nodes for all ledger actions |
| Node types: create, exercise, fetch, lookupByKey, authorize | All node types render with correct metadata |
| Source mapping (click node to jump to Daml source) | Works for all template/choice references |
| Correlated debug/trace log panel | Logs displayed alongside the transaction that produced them |
| Filter and search within transaction tree | Filter by template, choice, party, contract ID |
| Documentation + 3-minute demo video | Published to repo + YouTube/Loom |

**Acceptance Criteria:** UI renders the full transaction tree for 3 defined reference scripts covering all node types; all nodes render correctly with source links; debug panel correlates logs to transactions. Champion sign-off.

### Milestone 3: Snapshot/Replay + 1.0 Release

**Estimated Delivery:** 2 weeks after M2 acceptance

**Focus:** Add power-user features and ship a production-ready 1.0 release.

**Deliverables and Value Metrics:**

| Deliverable | Value Metric |
|---|---|
| Ledger snapshot capture at any transaction step | Snapshot serialized to JSON, reloadable |
| Replay-from-snapshot for faster iteration | Re-run from any captured state |
| End-to-end getting-started guide | New user to first debug session in under 10 minutes |
| Walkthrough video (full feature tour) | 5 to 8 minute edited video |
| 1.0 release cut and published | Tagged release on GitHub, installable via DPM |
| Bug-fix support commitment (90 days post-1.0) | Issues triaged within 48 hours on business days |

**Acceptance Criteria:** Full feature spec met end-to-end against acceptance tests in the repo; champion sign-off; public release; video published.

## Acceptance Criteria

The Tech & Ops Committee evaluates each milestone based on:

1. **Deliverable completion:** All listed deliverables shipped and functional
2. **Functionality:** Works on the current stable DPM/Daml SDK version
3. **Documentation:** Install guide, usage docs, and contributing guide published
4. **Value alignment:** Demonstrably improves the Daml debugging experience for all developers; does not introduce proprietary dependencies
5. **Open source:** All code published under MIT license

## Funding

**Total Funding Request:** 667,000 Canton Coin (CC)

**Payment Breakdown by Milestone:**

| Milestone | CC Amount | USD Equivalent (@$0.15) | Duration |
|---|---:|---:|---|
| M1: Plugin scaffold + CLI debugger | 267,000 CC | $40,000 | 4 weeks |
| M2: Visual transaction debugger | 267,000 CC | $40,000 | 4 weeks |
| M3: Snapshot/replay + 1.0 release | 133,000 CC | $20,000 | 2 weeks |
| **Total** | **667,000 CC** | **$100,000** | **10 weeks** |

Payment: Milestone-based at $10,000 per week ($250/hr full rate). Each milestone paid upon champion acceptance.

**Volatility Stipulation:** Project duration is under 6 months. If the 30-day moving average CC price deviates more than 33% from $0.15 during the project, we reserve the right to request a one-time CC amount adjustment for remaining milestones, subject to committee approval.

## Co-Marketing

- Joint announcement with the Canton Foundation upon grant approval
- Blog post / case study upon 1.0 release
- Demo at Canton community call or developer event
- Cross-promotion on social media with Foundation accounts

## Motivation

The Canton Foundation's developer experience survey and direct conversations with Foundation team members have identified visual debugging as the single largest gap in the Daml developer experience. Competing smart-contract ecosystems (Solidity/Hardhat, Move/Aptos) have mature debugging toolchains; Canton currently lacks an equivalent.

`dpm-debug` directly addresses this gap with a focused, deliverable tool that extends the Foundation's existing investment in DPM. By building as a plugin, we also establish a pattern for the community to extend DPM further, making this a force-multiplier for future ecosystem development.

## Rationale

**Why a DPM plugin (not standalone)?**
DPM already handles compilation, dependency resolution, and test execution. Building on top avoids duplicating that infrastructure and ensures `dpm-debug` benefits automatically from DPM improvements. This architecture was specifically recommended by Foundation team members.

**Why a local web UI (not just CLI)?**
Transaction trees are inherently hierarchical and can be deeply nested. A CLI-only view forces developers to mentally reconstruct the tree from text. A visual, expandable tree with source links and log correlation dramatically reduces cognitive load, the same reason Tenderly and Hardhat's web UIs are popular in the EVM ecosystem.

**Why not extend Certora's Package Analyzer?**
The Package Analyzer (PR #130) is a compile-time static analysis tool for security auditing. `dpm-debug` is a runtime tool for development-time debugging. They are complementary: one finds potential issues before deployment, the other helps diagnose issues during development and testing.

**Alternatives considered:**
- VS Code extension: Higher maintenance burden, IDE-specific. A web UI works with any editor.
- Standalone transaction viewer: Loses integration with DPM's test/script runner.
- Contributing directly to DPM core: DPM is maintained by Digital Asset (PR #49); a plugin is the right boundary for community contributions.

## Team

[Lazer Technologies](https://www.lazertechnologies.com/industries/crypto) is a North America-based product studio with 200+ senior engineers. We specialize in developer tooling, wallet infrastructure, and AI-forward engineering practices for crypto and fintech clients including Coinbase, Kraken, Privy, Dynamic, Turnkey, and Crossmint.

- **Project Lead:** Sayeed Mehrjerdian
- **Lead Engineer:** TBD (senior TypeScript/React engineer with Daml exposure from prior reference application build)
