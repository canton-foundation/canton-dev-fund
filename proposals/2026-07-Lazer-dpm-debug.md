# Development Fund Proposal: DPM Debug — Visual Developer Workbench for Daml on Canton

| Field | Value |
| :---- | :---- |
| Author | Sayeed (Lazer Technologies) |
| Org | Lazer Technologies |
| Status | Submitted (revised 2026-07-10) |
| Created | 2026-07-03 |
| Category | daml-tooling |
| Champion | Seeking champion (in discussion with Tech & Ops Committee) |
| Related proposals | [#327 dpm trace (Walnut)](https://github.com/canton-foundation/canton-dev-fund/pull/327) · [#382 debug metadata (Walnut)](https://github.com/canton-foundation/canton-dev-fund/pull/382) · [#297 Transaction Debugger (InfraSingularity)](https://github.com/canton-foundation/canton-dev-fund/pull/297) |
| Supporting materials | [Strategy deck](https://lazertechnologies.github.io/canton-debugger-proposal/) · [Repo](https://github.com/LazerTechnologies/canton-debugger-proposal) |

---

## Abstract

`dpm-debug` is a **visual developer workbench** for Daml on Canton, delivered as a DPM plugin that launches a local web application. It gives developers a Remix-style visual environment for their participant node: which packages and templates are deployed, which contracts are visible, what transactions are flowing, why a test failed — all rendered visually instead of read out of raw logs.

This proposal is **deliberately scoped as the UX layer** of the Canton debugging stack, and is designed to be **complementary to Walnut's `dpm trace` proposal (#327)** and a **first-wave consumer of Walnut's proposed debug metadata standard (#382)**. Walnut is building the low-level foundation — CLI trace of committed updates, portable trace bundles, an interactive debugger, and compiler-emitted debug metadata. We build the high-level visual surface on top of those primitives and commit to consuming their formats rather than defining parallel ones.

The Foundation's DX survey flagged visual debugging and transaction visibility as the top missing tools in the ecosystem. This proposal requests **1,000,000 CC (~$140,000 USD)** over **16 weeks** across **3 milestones**, released open-source under MIT.

---

## Relationship to Related Proposals

**#327 — dpm trace (Walnut).** The foundation layer: `dpm trace <update-id>` CLI, normalized JSON trace artifacts, portable versioned trace bundles, and an interactive REPL debugger. We do not duplicate any of this. `dpm-debug` **consumes** their outputs: our transaction-tree view renders the normalized JSON trace artifact defined in their Milestone 1, and our workbench opens the trace bundles defined in their Milestone 2. Where `dpm trace` is not installed, we degrade gracefully to direct Ledger API / JSON Ledger API queries — but the intended architecture is their trace under the hood, our UI on top.

**#382 — Versioned Debug Metadata for Daml (Walnut).** This draft explicitly names "trace, visualization, test-reporting, coverage, and source diagnostics tools" as intended consumers of the metadata standard. `dpm-debug` is exactly such a consumer: our Milestone 3 uses the metadata, where available, to show source spans alongside transaction events and test failures. We will not invent a parallel source-mapping scheme; if #382 is not yet available during our build, we ship without source display and add it when the standard lands.

**#297 — Canton Transaction Debugger (InfraSingularity).** A different problem: failure-first diagnosis of *rejected* submissions with plain-language causes and shareable diagnostic bundles. No meaningful overlap with a visual workbench for the development loop; the tools would serve developers at different moments.

One clarification on framing raised in review: the distinction between our proposals is **not** local vs. deployed — a local Canton participant exposes the same Ledger APIs as a production node, and `dpm trace` works locally too. The distinction is **layer**: Walnut is building the trace/debug primitives and CLI; we are building the visual environment on top of them.

---

## Objective and Scope

### Objective

Deliver a production-quality visual workbench that gives Daml developers on Canton:

1. **Participant explorer** — a visual overview of the connected participant: deployed packages and templates, contracts visible to the configured party context, and a live transaction feed.
2. **Visual trace explorer** — interactive transaction trees rendered from `dpm trace` JSON artifacts and trace bundles (with direct Ledger API fallback), with node inspection of contract payloads and choice arguments, plus a filterable, searchable debug/trace log panel.
3. **Visual test reporting** — structured, visual test and script run results with assertion diffs (expected vs. actual) and direct links to failing tests.
4. **Source-aware display** — where #382 debug metadata is available, source spans shown alongside transaction events and test failures.

### Out of Scope (deliberately)

CLI trace tooling, trace bundle formats, and interactive/step debuggers (all #327); compiler changes and debug metadata formats (#382); failure-diagnosis engines and error decoding (#297); any Canton or Daml core changes. Where this proposal touches those areas, it consumes the other teams' outputs rather than rebuilding them.

---

## Motivation and Ecosystem Value

Debugging and transaction visibility are the most-cited gaps in the Daml developer experience on Canton. The ecosystem response is converging on a layered stack: Walnut is proposing the low-level primitives (trace, bundles, debug metadata) with deep compiler-tooling pedigree. What remains missing is the high-level visual environment that most application developers reach for first — the equivalent of Remix in the EVM ecosystem or the Flow playground: open a browser, see your node, your contracts, your transactions, and your test results.

A shared visual layer also multiplies the value of the lower layers: trace artifacts and debug metadata are far more useful to the median developer when a UI renders them. Funding both layers, built by teams that have agreed on formats, gives Canton a coherent debugging ecosystem instead of overlapping tools.

---

## Technical Approach

- **DPM plugin + local web app:** `dpm-debug` installs via the standard DPM workflow and launches a localhost web application connected to a participant endpoint (local or authorized remote) using bearer-token auth and an explicit `read-as` party context. All output is participant-visible projection only.
- **Participant explorer (M1):** package/template inventory via the package and query APIs; visible contract browsing; live transaction feed via the JSON Ledger API.
- **Trace rendering (M2):** native rendering of `dpm trace` normalized JSON artifacts and versioned trace bundles as interactive transaction trees; direct `UpdateService`/JSON Ledger API queries as fallback when `dpm trace` is absent.
- **Test reporting (M2):** parse Daml Script/test execution results into visual pass/fail reports with assertion diffs.
- **Source display (M3):** consume #382 debug metadata artifacts where present to annotate events and failures with source spans; degrade cleanly when absent.
- **Open source:** MIT license, public repository, CI, tests, contribution guidelines.

---

## Architectural Alignment

- Works entirely through authorized participant endpoints and respects participant-scoped visibility; never implies access to non-visible data.
- Uses DPM as the entry point, consistent with the Foundation-funded developer toolchain.
- Consumes — rather than redefines — the trace artifact, bundle, and debug metadata formats proposed in #327/#382, supporting a single set of ecosystem standards.
- Requires no Canton protocol, Ledger API, or compiler changes.
- Addresses the #1 gap in the Foundation's DX survey (visual debugging and transaction visibility).

---

## Milestones and Deliverables

Total: **1,000,000 CC (~$140,000 USD)** over **16 weeks**. 80% of funding is unlocked in M1 and M2. No milestone is blocked on Walnut's delivery: M1 and the fallback paths in M2 use only existing Ledger APIs; trace-artifact rendering and source display activate as the companion formats become available.

| Milestone | Duration | Deliverables | CC | USD |
| :---- | :---- | :---- | ---: | ---: |
| **M1 — Workbench Foundation** | Weeks 1–6 | DPM plugin launching local web app; participant explorer (packages, templates, visible contracts); live transaction feed; bearer-token auth and party context | 400,000 | $56,000 |
| **M2 — Visual Trace + Test Reporting** | Weeks 7–12 | Interactive transaction-tree rendering of `dpm trace` JSON artifacts and bundles (with Ledger API fallback); node inspection; debug/trace log panel with filter and search; visual test reports with assertion diffs | 400,000 | $56,000 |
| **M3 — Source-Aware Display + 1.0** | Weeks 13–16 | #382 debug-metadata consumption for source spans (graceful fallback); end-to-end docs; walkthrough video; 1.0 release under MIT | 200,000 | $28,000 |
| **Total** | 16 weeks | | **1,000,000** | **$140,000** |

---

## Acceptance Criteria

**M1 — Workbench Foundation (400,000 CC)**
- `dpm-debug` installs as a DPM plugin via the standard DPM workflow on macOS and Linux and launches a localhost web app.
- The workbench connects to a local Canton participant and an authorized remote participant endpoint with bearer-token auth and explicit `read-as` party context.
- Deployed packages and templates are listed; contracts visible to the party context are browsable; a live transaction feed renders new updates.
- All views are labeled as participant-visible projections. Code public with CI.

**M2 — Visual Trace + Test Reporting (400,000 CC)**
- A normalized JSON trace artifact produced by `dpm trace` renders as an interactive transaction tree (creates, exercises, archives, nesting) with node inspection of payloads and choice arguments.
- A versioned trace bundle opens in the workbench and renders its saved trace.
- With `dpm trace` absent, the same tree renders for a committed update via direct Ledger API queries.
- Log panel displays execution logs with level filtering and full-text search.
- A Daml test suite run produces a visual report: pass/fail summary, per-test status, assertion diffs.

**M3 — Source-Aware Display + 1.0 (200,000 CC)**
- Where a #382 debug-metadata artifact is present for a package, transaction events and test failures display linked source spans; where absent, views degrade cleanly with no errors.
- Complete documentation (installation, usage, troubleshooting) and a public walkthrough video.
- Version 1.0 tagged and released under MIT.

---

## Funding Request and Payment

- **Total request:** 1,000,000 CC (~$140,000 USD at $0.14/CC)
- **Payment:** milestone-based in Canton Coin, released after acceptance of each milestone per the fund's payment terms
- **Breakdown:** M1 — 400,000 CC; M2 — 400,000 CC; M3 — 200,000 CC

---

## Team and Capability

[Lazer Technologies](https://www.lazertechnologies.com/industries/crypto) is a North America-based product studio with 200+ senior engineers specializing in developer tooling, wallet infrastructure, and AI-forward engineering for crypto and fintech clients including Coinbase, Kraken, Privy, Dynamic, Turnkey, and Crossmint. Product-grade web UX for developer tools is the core of what we ship.

This is Lazer's first Canton Development Fund proposal, deliberately scoped as a modest, credible first ask (~$8.75K/week over 16 weeks) at the layer that matches our strengths, leaving the low-level trace and compiler work to the team best suited for it.

---

## Adoption and Distribution Plan

- Distributed through DPM's plugin mechanism for one-command installation.
- Coordinated with the Walnut team on artifact and metadata formats so both tools reinforce each other's adoption.
- Announced through Canton community channels with a walkthrough video at 1.0 release.
- MIT license enables any team or vendor to build on and extend the workbench.
