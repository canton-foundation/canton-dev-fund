# DamlHat — Unified Canton Developer Toolchain & Local Devnet

**Contact:** riccardo.ravaro@datatamer.ai

## Summary
DamlHat is a Hardhat/Foundry-inspired developer toolchain for the Canton Network. A single CLI scaffolds Daml projects, spins up a full multi-node local devnet in Docker, generates typed client SDKs, simulates transactions, and deploys to testnet — with an integrated transaction trace viewer for debugging. The goal is to collapse the current multi-day "infrastructure engineer" onboarding into a single `damlhat init && damlhat node up` command.

## Objective and Scope
The 2026 Canton Developer Experience Survey identified infrastructure complexity as the #1 pain point (41% of respondents) and a unified CLI framework as the most requested tool. DamlHat directly addresses both. Scope:

- A unified CLI (`damlhat`) covering scaffold, build, test, deploy, and node management.
- A one-command local devnet bundling participant nodes, sequencer, mediator, and a test wallet — reproducible across macOS/Linux/Windows via Docker.
- Typed client SDK codegen for TypeScript and Python from compiled DAR files, removing manual hash/package-ID extraction.
- A transaction trace viewer (CLI + minimal web UI) that decodes Daml transaction trees, exercised choices, and failures — inspired by Tenderly.
- Reference project templates: a token, a simple DEX, and a multi-party workflow.

Out of scope: mainnet validator operation, custom consensus work, non-Daml language frontends.

## Technical Approach
- **CLI core**: TypeScript, published to npm as `@damlhat/cli`. Plugin architecture so the community can extend commands.
- **Local devnet**: Docker Compose topology pinned to current Canton releases, with health checks, deterministic party allocation, and a pre-funded faucet. Optional Kind/k3d mode for Kubernetes parity.
- **Codegen**: Wraps `daml codegen` and emits ergonomic typed clients with full JSDoc/typing, plus Python `pydantic` models. Handles Package ID discovery automatically against the JSON API.
- **Trace viewer**: Parses ledger API transaction trees into a timeline view (exercised choices, created/archived contracts, observers). Ships as `damlhat trace <tx-id>` plus an optional local web UI served by the CLI.
- **Testing**: Jest-style test runner that boots ephemeral ledgers per test file, with snapshot-based assertions on contract state.

## Architectural Alignment
DamlHat is additive and does not modify the Canton protocol. It consumes the public Ledger API, JSON API, and Canton admin APIs. It complements ongoing work on `cantonctl` by focusing squarely on the *application developer* loop (local devnet + typed SDKs + trace debugging) rather than operator tooling. All output artifacts remain compatible with stock Canton tooling — developers can drop DamlHat at any time without lock-in.

## Milestones and Deliverables

**M1 — CLI core & local devnet (6 weeks)**
- `damlhat init`, `damlhat build`, `damlhat node {up,down,reset}`
- Dockerized multi-node devnet with faucet and pre-allocated parties
- Public alpha release on npm, CI for macOS/Linux

**M2 — Typed SDK codegen (5 weeks)**
- TypeScript + Python codegen from DAR files
- Automatic Package ID resolution helper
- Two worked examples (token, escrow) with end-to-end tests

**M3 — Transaction trace viewer (6 weeks)**
- `damlhat trace` CLI command
- Local web UI with timeline visualization, choice decoding, error explanations
- Integration with the test runner for failed-assertion traces

**M4 — Templates, docs, community release (5 weeks)**
- Three reference templates (token, DEX, multi-party workflow)
- Full documentation site, quickstart video, migration guide from bare Daml SDK
- v1.0.0 tagged release, Apache 2.0 license

## Acceptance Criteria
- A new developer with no prior Canton experience can reach a deployed testnet contract in under 30 minutes following the quickstart.
- `damlhat node up` produces a working multi-node devnet in under 2 minutes on a standard laptop.
- Typed SDK codegen produces zero-warning TypeScript and passes `mypy --strict` for Python.
- Trace viewer correctly decodes at least 95% of transaction types on a regression corpus of 200+ recorded transactions.
- All deliverables published as open source (Apache 2.0) with CI, test coverage ≥80%, and public documentation.

## Funding Request and Milestone Breakdown
Total requested: **150,000 USD equivalent in Canton Coin**, milestone-based.

| Milestone | Deliverable | Payment |
|---|---|---|
| M1 | CLI core & local devnet alpha | 40,000 |
| M2 | Typed SDK codegen | 35,000 |
| M3 | Transaction trace viewer | 40,000 |
| M4 | Templates, docs, v1.0 release | 35,000 |

Duration: ~22 weeks from grant approval.

## Strategic Alignment
DamlHat is a common-good piece of infrastructure that lowers the barrier to entry for every new Canton builder — directly supporting the Foundation's priority areas of *developer tools* and *reference implementations*. It compounds the value of Zenith's EVM onramp by giving native Daml developers the same quality of loop that Hardhat/Foundry users expect, and it turns the most-cited survey pain point into a solved problem.

## Notes for Reviewers
- This proposal is intentionally scoped around the *application developer inner loop*. It does not overlap with operator/validator tooling covered by other proposals such as `cantonctl`.
- All code will be developed in the open from day one, with weekly progress updates posted to the forum.
- Maintenance commitment: the team will provide bug fixes and Canton version compatibility updates for 12 months post-v1.0 at no additional cost.
