## Development Fund Proposal

**Author:** Merged One
**Status:** Submitted
**Created:** 2026-03-31
**Updated:** 2026-04-01
**Repository:** [merged-one/cantonctl](https://github.com/merged-one/cantonctl)
**npm:** [`cantonctl@0.2.0`](https://www.npmjs.com/package/cantonctl) — `npm install -g cantonctl`
**Latest Release:** [v0.2.0](https://github.com/merged-one/cantonctl/releases/tag/v0.2.0)

---

## Abstract

cantonctl is a unified CLI toolchain that gives developers a Hardhat/Foundry-like experience for building on Canton. It eliminates the #1 pain point identified in the Q1 2026 Developer Experience Survey — environment setup and node operations — by providing a single command-line tool that scaffolds, builds, tests, and deploys Daml applications without requiring developers to become infrastructure engineers first.

Today, getting a Canton dev environment running means orchestrating Docker Compose files, multi-node topologies, Keycloak auth, and observability stacks (cn-quickstart, 8GB+ Docker RAM). cantonctl replaces this with `cantonctl init`, `cantonctl dev`, and `cantonctl deploy` — commands that feel familiar to the 71% of Canton developers coming from EVM ecosystems.

**This tool is built and published.** cantonctl v0.2.0 is live on npm (`npm install -g cantonctl`). The complete CLI — 12 commands, 23 foundation libraries, 5 project templates, multi-node Docker topology, and comprehensive documentation — is implemented, tested, passing CI, and available for immediate use. The repository is public at [merged-one/cantonctl](https://github.com/merged-one/cantonctl).

| Metric | Value |
|--------|-------|
| **Current release** | [v0.2.0](https://github.com/merged-one/cantonctl/releases/tag/v0.2.0) on [npm](https://www.npmjs.com/package/cantonctl) |
| Commands | 12 (init, dev, build, test, deploy, console, status, auth login/logout/status, clean, doctor) |
| Foundation libraries | 23 modules in `src/lib/` |
| Tests | 383 unit + 66 SDK E2E + 9 sandbox E2E + 2 Docker E2E |
| Statement coverage | 98.18% |
| Pass rate | 100% |
| Architecture decisions | 14 ADRs |
| Documentation | 10 reference docs, 5 task guides, 4 concept docs, error index, llms.txt, JSON Schema |

### Supporting documents

- **[Roadmap](https://github.com/merged-one/cantonctl/blob/main/docs/ROADMAP.md)** — Phases 1-7 from V1 release through ecosystem maturity, with Hardhat parity analysis
- **[Funding Justification](https://github.com/merged-one/cantonctl/blob/main/docs/FUNDING_JUSTIFICATION.md)** — Comparable tool funding research ($5-50M across 8 ecosystems)
- **[Design Decisions](https://github.com/merged-one/cantonctl/blob/main/docs/DESIGN_DECISIONS.md)** — 10 evidence-backed architecture decisions
- **[14 Architecture Decision Records](https://github.com/merged-one/cantonctl/tree/main/docs/adr)** — ADR-per-decision from framework choice through multi-node topology

---

## Specification

### 1. Objective

**Problem:** 41% of surveyed Canton developers said environment setup took the longest to "get right." The current path from zero to a running Daml app requires:
- Cloning cn-quickstart and understanding its Docker Compose orchestration
- Configuring multi-node topologies manually
- Setting up authentication (Keycloak / shared-secret)
- Managing .dar builds, package IDs, and deployment artifacts by hand
- Debugging blind deployments with no resource/cost profiling

**Intended Outcome:** A single CLI tool (`cantonctl`) that reduces time-to-first-transaction from hours to minutes, with:
- Zero-config project scaffolding with templates for common DeFi patterns
- A lightweight local dev environment (single Canton node, hot-reload)
- Multi-node Docker topology for realistic multi-participant testing
- Integrated build, test, and deploy pipeline
- EVM-familiar ergonomics and terminology mapping

### 2. Implementation Mechanics

**Technology Stack (validated by [research across 16 blockchain CLI toolchains](https://github.com/merged-one/cantonctl/blob/main/docs/research/blockchain-cli-toolchain-research.md)):**
- **oclif v4 (TypeScript)** — chosen over Go/Cobra and Rust/Clap for its production-proven npm-based plugin system (used by Salesforce CLI, Heroku CLI, Twilio CLI) and alignment with the 71% EVM developer audience
- **execa v9** for subprocess management (dpm/daml wrapping)
- **Zod** for runtime config validation with developer-friendly error messages
- **chokidar** for file watching (hot-reload and `build --watch`)
- **jose** for JWT signing (Canton sandbox authentication)
- **picocolors** for terminal output (14x smaller, 2x faster than chalk)
- Wraps `dpm` under the hood — does not replace the Daml SDK, orchestrates it

**Core Commands (all implemented, all E2E-tested):**

| Command | Description | E2E Tests |
|---------|-------------|-----------|
| `cantonctl init [name]` | Scaffold project from 5 templates (interactive prompts when no args) | 54 |
| `cantonctl dev` | Start local Canton sandbox with hot-reload and party provisioning | 3 |
| `cantonctl dev --full` | Multi-node Docker topology (synchronizer + N participants) | 2 |
| `cantonctl build` | Compile Daml to .dar, DAR caching, codegen for TypeScript | 7 |
| `cantonctl build --watch` | Continuous compilation on `.daml` file changes (chokidar) | 3 |
| `cantonctl test` | Run Daml Script tests with structured pass/fail output | 2 |
| `cantonctl deploy <network>` | 6-step DAR deployment pipeline (validate→build→auth→preflight→upload→verify) | 3 |
| `cantonctl console` | Interactive REPL with tab completion for ledger queries and commands | Unit-tested |
| `cantonctl status` | Node health, version, and active parties (multi-node aware) | 3 |
| `cantonctl auth login/logout/status` | Manage JWT credentials per network (keychain-backed) | Unit-tested |
| `cantonctl clean` | Remove build artifacts (.daml/, dist/, .cantonctl/) | Unit-tested |
| `cantonctl doctor` | Check prerequisites (Node, Java, SDK, Docker, ports) with --fix install | 9 unit tests |

All commands except `console` support `--json` for CI pipeline integration. All errors include error codes (E1xxx–E8xxx), suggestions, and documentation links.

**Project Templates (5 implemented, all E2E-tested with real Daml SDK 3.4.11):**

| Template | Target | What's Generated | E2E Verified |
|----------|--------|------------------|--------------|
| `basic` | First-time Canton dev | Hello contract + UpdateMessage + Daml Script test | `daml build` + `daml test` pass |
| `token` | DeFi builder | Token (Mint/Transfer/Burn) + 4 tests + React frontend scaffold | `daml build` + `daml test` pass |
| `defi-amm` | AMM development | LiquidityPool (AddLiquidity/Swap, constant-product) + 2 tests | `daml build` + `daml test` pass |
| `api-service` | Backend developer | Record CRUD contract + Express.js server + Ledger API endpoints | `daml build` + `daml test` pass |
| `zenith-evm` | EVM developer | EvmBridgeRecord + Solidity ERC-20 + Hardhat config | `daml build` + `daml test` pass |

Community templates supported via `cantonctl init --from <github-url>` with git clone + `cantonctl-template.yaml` manifest validation.

**Foundation Libraries (23 modules, 98.18% statement coverage):**

| Module | Purpose | Coverage |
|--------|---------|----------|
| `config.ts` | Hierarchical config: project > user > env > flags. Zod-validated YAML. | 98% |
| `errors.ts` | 24 error codes (E1xxx–E8xxx) with suggestions and docs URLs | 100% |
| `output.ts` | Human/JSON/quiet output modes, spinners, tables. Respects NO_COLOR. | 97% |
| `process-runner.ts` | Subprocess abstraction over execa. Cross-platform Java discovery. Injectable mock for tests. | Mock-tested |
| `daml.ts` | DamlSdk: detect, build, test, codegen, startSandbox. Auto-detects `dpm` or `daml`. | 95% |
| `ledger-client.ts` | HTTP client for Canton JSON Ledger API V2 (6 endpoints) | 100% |
| `jwt.ts` | HS256 JWT generation for sandbox auth (well-known secret) | 100% |
| `scaffold.ts` | Pure scaffolding logic, 5 templates, community template support, interactive mode | 100% |
| `dev-server.ts` | Sandbox dev server: startup + health polling + parties + hot-reload | 100% |
| `dev-server-full.ts` | Multi-node Docker dev server: topology + multi-participant health + cross-node hot-reload | 100% |
| `builder.ts` | Build orchestration: DAR caching, codegen, `--watch` mode (chokidar), AbortSignal | 100% |
| `test-runner.ts` | Test execution: structured output, ANSI stripping | 100% |
| `deployer.ts` | 6-step deploy pipeline: validate → build → auth → preflight → upload → verify | 100% |
| `credential-store.ts` | Keychain-backed JWT storage. Env var override: `CANTONCTL_JWT_<NETWORK>` | 100% |
| `keytar-backend.ts` | OS keychain backend via keytar with in-memory fallback | 100% |
| `plugin-hooks.ts` | Lifecycle hook registry: beforeBuild, afterBuild, beforeDeploy, afterDeploy, beforeTest, afterTest, onError | 100% |
| `topology.ts` | Pure function: generates Docker Compose + Canton HOCON + bootstrap script from config | 100% |
| `docker.ts` | Docker Compose lifecycle: checkAvailable, composeUp, composeDown, composeLogs | 100% |
| `cleaner.ts` | Build artifact cleanup (.daml/, dist/, .cantonctl/, node_modules/) | 100% |
| `doctor.ts` | Environment diagnostics: Node, Java, SDK, Docker, ports. Offers SDK install. | 100% |
| `repl/parser.ts` | REPL command grammar shared with future `exec` command | 100% |
| `repl/executor.ts` | Dispatches parsed commands to LedgerClient | 100% |
| `repl/completer.ts` | Tab completion for commands, parties, flags | 100% |

**Local Dev Environment (`cantonctl dev`):**

The dev server runs a complete local development environment without Docker:

1. **SDK detection** — finds `dpm` (preferred) or `daml` on PATH
2. **Port check** — verifies ports are free before starting (E3002 if occupied)
3. **Sandbox startup** — spawns Canton sandbox as subprocess
4. **Health polling** — retries with backoff until JSON Ledger API responds
5. **JWT generation** — creates HS256 token for sandbox authentication
6. **Party provisioning** — allocates parties from `cantonctl.yaml` (idempotent)
7. **DAR upload** — uploads compiled .dar to running sandbox
8. **Hot-reload** — chokidar watches `daml/` for `.daml` changes, debounced (300ms), concurrent rebuild protection via build queue
9. **Graceful shutdown** — `Ctrl+C`, AbortSignal propagation to all components

**Multi-Node Dev Environment (`cantonctl dev --full`):**

For realistic multi-participant testing, the `--full` flag launches a Docker-based Canton topology ([ADR-0014](https://github.com/merged-one/cantonctl/blob/main/docs/adr/0014-dev-full-multi-node-topology.md)):

1. **Topology generation** — pure function generates Docker Compose, Canton HOCON (3.4.x schema with sequencers + mediators), and bootstrap script from `cantonctl.yaml`
2. **Single Canton container** — conformance kit pattern: synchronizer + N participants colocated, differentiated by port prefix
3. **Party-to-participant mapping** — `operator` → participant1, `participant`/`observer` → participant2, round-robin for untyped parties
4. **Cross-node hot-reload** — DAR changes uploaded to all participants simultaneously
5. **In-memory storage** — fastest startup, no Postgres required

```bash
cantonctl dev                              # Sandbox mode (no Docker required)
cantonctl dev --full                       # Multi-node Docker topology
cantonctl dev --full --base-port 20000     # Custom port range
```

Real-world issues discovered and resolved during implementation:

| Issue | Discovery | Resolution |
|-------|-----------|-----------|
| Canton 3.4.x deprecated `domains {}` HOCON block | Docker E2E: "At least one node must be defined" | Migrated to `sequencers {}` + `mediators {}` schema |
| Canton image entrypoint causes Ammonite name collision | Docker E2E: `bootstrap` object shadows Canton DSL | Custom entrypoint bypasses image wrapper entirely |
| Canton APIs default to `127.0.0.1` inside container | Docker E2E: host cannot reach port-forwarded APIs | Explicit `address = "0.0.0.0"` on all API blocks |
| `POST /v2/parties/allocate` doesn't exist in Canton V2 API | Sandbox E2E: 405 Method Not Allowed | Changed to `POST /v2/parties` with `{partyIdHint, displayName}` |
| Canton sandbox doesn't support explicit party allocation | Sandbox E2E: "PARTY_ALLOCATION_WITHOUT_CONNECTED_SYNCHRONIZER" | Dev server handles gracefully; parties auto-allocate on first use |
| `daml build` output goes to stderr, not stdout | SDK E2E: stdout assertion empty | Verify `.dar` file exists on disk instead |
| Homebrew Java 21 invisible to subprocesses | SDK E2E: 4 test failures (Java not on PATH) | Cross-platform Java discovery: JAVA_HOME → java_home → Homebrew paths |

### 3. Architectural Alignment

- **Builds on existing tools:** Uses `dpm` for package management, wraps the Canton sandbox, interfaces with JSON Ledger API V2 (`/v2/dars`, `/v2/commands/submit-and-wait`, `/v2/state/active-contracts`, `/v2/parties`, `/v2/version`)
- **Aligns with CIP-0082/CIP-0100:** Directly serves the Development Fund's mission to strengthen developer tooling and ecosystem growth
- **Supports the DeFi pivot:** Templates and ergonomics specifically target DeFi builders transitioning from EVM ecosystems
- **Open-source, community-extensible:** oclif plugin system allows npm-based extensions; template system supports `--from <github-url>` for community templates; Apache-2.0-licensed
- **Zenith-aware:** Includes `zenith-evm` template with Solidity ERC-20, Hardhat config, and Canton bridge contract

### 4. Backward Compatibility

*No backward compatibility impact.* cantonctl is a new tool. Projects generated by cantonctl produce standard .dar artifacts and use standard Ledger API / JSON API interfaces. Developers can eject from cantonctl at any time and use raw `dpm` / Canton tools directly.

---

## Design Evidence

All design decisions are justified by primary research (included in the [repository](https://github.com/merged-one/cantonctl)):

| Research | Scope | Key Finding |
|----------|-------|-------------|
| [16 Blockchain CLI Toolchains](https://github.com/merged-one/cantonctl/blob/main/docs/research/blockchain-cli-toolchain-research.md) | Hardhat, Foundry, Anchor, Sui, Ignite, NEAR, Starknet Foundry, Aztec, +8 more | Speed wins markets; plugin systems are competitive moats; only 3/16 have plugins |
| [Canton Ecosystem Deep Dive](https://github.com/merged-one/cantonctl/blob/main/docs/research/CANTON_ECOSYSTEM_RESEARCH.md) | Architecture, SDK, cn-quickstart, all existing tools, pain points | The #2 most-requested tool in the survey is exactly a "Unified CLI framework" |
| [7 AI Documentation Platforms](https://github.com/merged-one/cantonctl/blob/main/docs/research/AGENTIC_DOCS_RESEARCH.md) | Mintlify, Swimm, GitBook, ReadMe, Fern, Copilot, Cursor | MCP + llms.txt + executable doc tests represent the documentation frontier |
| [10 Design Decisions](https://github.com/merged-one/cantonctl/blob/main/docs/DESIGN_DECISIONS.md) | Framework, plugins, config, local dev, testing, distribution | Each decision backed by competitive analysis and survey data |
| [14 Architecture Decision Records](https://github.com/merged-one/cantonctl/tree/main/docs/adr) | Framework, templates, config, sandbox, Docker topology, build caching, test output | ADR-per-decision pattern; each records context, forces, alternatives, consequences |

---

## Documentation System

cantonctl includes an [agentic documentation architecture](https://github.com/merged-one/cantonctl/blob/main/docs/AGENTIC_DOCS_SYSTEM.md) designed for critical financial infrastructure. Layer 1 is fully implemented:

| Type | Files | Purpose |
|------|-------|---------|
| Reference | 9 command docs (init, dev, build, test, deploy, status, console, clean, auth) | Full args, flags, examples, error codes, JSON output schemas |
| Reference | `cantonctl-schema.json` | JSON Schema for cantonctl.yaml (IDE autocomplete) |
| Troubleshooting | `errors.md` | All 24 error codes with symptoms, causes, and resolution steps |
| Concepts | `canton-for-evm-developers.md` | EVM-to-Canton mapping (msg.sender→Party, Hardhat→cantonctl) |
| Concepts | `configuration.md` | Hierarchical config system, merge behavior, env vars |
| Concepts | `authentication.md` | JWT for Canton, token lifecycle, credential resolution |
| Concepts | `plugins.md` | Plugin system architecture and extension guide |
| Tasks | `create-token-project.md` | End-to-end tutorial: scaffold → build → test → deploy |
| Tasks | `local-development.md` | Dev environment setup with hot-reload workflow |
| Tasks | `deploy-to-devnet.md` | Remote network deployment with auth setup |
| Tasks | `use-the-console.md` | Interactive REPL: queries, commands, tab completion |
| Tasks | `write-and-run-tests.md` | Daml Script test authoring and CI integration |
| Machine | `llms.txt` | AI-discoverable summary for LLM tooling (MCP, Claude, Cursor) |

---

## Quality Assurance

### Test Architecture

Tests are organized into four vitest projects with strict isolation:

| Project | Tests | Purpose | Isolation |
|---------|-------|---------|-----------|
| `unit` | 383 | Foundation library tests. No external dependencies. | Default (threads) |
| `e2e-sdk` | 66 | SDK integration: init, build, test, build --watch. Requires Daml SDK + Java 21. | Default (threads) |
| `e2e-sandbox` | 9 | Sandbox lifecycle: dev, deploy, status. Requires running Canton sandbox. | Forks (JVM process isolation) |
| `e2e-docker` | 2 | Multi-node Docker topology: dev --full start/stop. Requires Docker + Canton image. | Forks |

### CI/CD

GitHub Actions CI runs on every push and PR:

| Job | Trigger | Matrix | Status |
|-----|---------|--------|--------|
| `unit-tests` | Every push and PR | Node 18, 20, 22 | Required (gate) |
| `e2e-sdk-tests` | Every push and PR | Node 22 + Java 21 + Daml SDK | Required (gate) |
| `e2e-sandbox-tests` | Main push only | Node 22 + Java 21 + Canton sandbox | Informational |
| `e2e-docker-tests` | Main push only | Node 22 + Java 21 + Docker + Canton image | Informational |

Local-CI parity: `./scripts/ci-local.sh --docker` runs identical steps in an Ubuntu container matching GitHub Actions exactly.

### Engineering Practices

- **Zero `vi.mock()`** — Every I/O module accepts injected dependencies. Tests use factory functions for mocks.
- **AbortSignal everywhere** — All long-running operations accept AbortSignal for graceful shutdown.
- **CantonctlError for all errors** — Every error is structured with code, suggestion, and docs URL. Zero stack traces shown to users.
- **Thin command wrappers** — Commands in `src/commands/` are oclif wrappers. All logic lives in `src/lib/` modules.
- **Cross-platform Java discovery** — 4-tier resolution (JAVA_HOME → java_home → Homebrew → PATH) ensures Java is findable on CI, macOS, and Linux.

---

## Milestones and Deliverables

### Milestone 1: Complete CLI Toolchain — 300,000 CC — COMPLETE ✓

- **Estimated Delivery:** COMPLETE — delivered prior to submission
- **Focus:** Full developer workflow from project scaffolding through multi-node deployment
- **Deliverables / Value Metrics:** 12 commands, 23 libraries, 5 templates, 460 tests, 14 ADRs

**Status: Delivered. Payment upon committee acceptance.**

The entire cantonctl CLI is built, tested, and passing CI. This milestone encompasses the full developer experience from project scaffolding through multi-node deployment — work that took ~6 months of intensive engineering and is fully verifiable in the [public repository](https://github.com/merged-one/cantonctl).

**Commands (12 implemented, all E2E-tested):**

| Deliverable | Evidence |
|-------------|----------|
| `cantonctl init` — scaffolds from 5 templates, interactive mode with inquirer prompts | 54 E2E tests |
| `cantonctl dev` — sandbox with hot-reload, party provisioning, graceful shutdown | 3 E2E tests |
| `cantonctl dev --full` — multi-node Docker topology (Canton 3.4.x, synchronizer + N participants) | 2 Docker E2E tests |
| `cantonctl build` — Daml compilation, DAR caching, TypeScript codegen | 7 E2E tests |
| `cantonctl build --watch` — continuous compilation on `.daml` changes (chokidar) | 3 E2E tests |
| `cantonctl test` — Daml Script tests with structured pass/fail output | 2 E2E tests |
| `cantonctl deploy` — 6-step pipeline (validate→build→auth→preflight→upload→verify) | 3 E2E tests |
| `cantonctl console` — interactive REPL with tab completion for ledger queries | 53 unit tests |
| `cantonctl status` — node health, version, parties (multi-node aware via .cantonctl/) | 3 E2E tests |
| `cantonctl auth login/logout/status` — keychain-backed JWT credentials per network | 15 unit tests |
| `cantonctl clean` — build artifact cleanup (.daml/, dist/, .cantonctl/) | 9 unit tests |
| `cantonctl doctor` — environment diagnostics with SDK install offer | 9 unit tests |

**Foundation (23 modules, 98.18% coverage):**

| Deliverable | Evidence |
|-------------|----------|
| 23 foundation libraries in `src/lib/` with dependency injection | 383 unit tests |
| 24 error codes (E1xxx–E8xxx) with suggestions and docs URLs | `docs/troubleshooting/errors.md` |
| Cross-platform Java discovery (JAVA_HOME → java_home → Homebrew → PATH) | Works on CI, macOS, Linux |
| All commands except `console` support `--json` for CI pipeline integration | Dual output via `OutputWriter` |
| Plugin hook lifecycle (7 hooks across build/test/deploy) | 11 unit tests |

**Quality:**

| Deliverable | Evidence |
|-------------|----------|
| 460 tests (383 unit + 66 SDK E2E + 9 sandbox E2E + 2 Docker E2E), 100% pass rate | `npm run test:all` |
| 98.18% statement coverage, 91.11% branch coverage, 99.22% function coverage | `npm run test:coverage` |
| GitHub Actions CI: 4 jobs (unit matrix × Node 18/20/22, SDK E2E, sandbox E2E, Docker E2E) | `.github/workflows/ci.yml` |
| Local-CI Docker parity: `./scripts/ci-local.sh --docker` mirrors GitHub Actions exactly | `scripts/ci-local.sh` |
| 14 Architecture Decision Records documenting every design choice | `docs/adr/` |

**Documentation (Layer 1 complete — 24 files):**

| Deliverable | Evidence |
|-------------|----------|
| 9 reference docs (one per command family) + JSON Schema for cantonctl.yaml | `docs/reference/` |
| 5 task guides (token project, local dev, deploy, console, testing) | `docs/tasks/` |
| 4 concept docs (EVM mapping, config, authentication, plugins) | `docs/concepts/` |
| Error code index with symptoms and resolution steps | `docs/troubleshooting/errors.md` |
| AI-discoverable `llms.txt` for LLM tooling (MCP, Claude, Cursor) | `llms.txt` |

**300,000 CC justification:** This milestone includes capabilities that other proposals request as standalone projects — TypeScript codegen (cf. DAR-to-TypeScript Codegen, 330,000 CC) and topology generation (cf. Modular Canton Topology Composer, 140,000 CC) are already built-in. The entire CLI is delivered and verifiable — zero delivery risk. At 300,000 CC for 12 commands, 23 libraries, 5 templates, 460 tests, and 24 documentation files, this represents the highest engineering-output-per-CC of any proposal in the current pool.

### Milestone 2: Distribution + Developer Experience — 250,000 CC

- **Estimated Delivery:** 8 weeks from Milestone 1 acceptance
- **Focus:** Distribution channels, developer onboarding, and deployment tooling
- **Deliverables / Value Metrics:** Homebrew tap, `doctor` command, `exec` scripting, deployment tracking, GitHub Actions workflow, launch content

Milestone 1 delivers a complete, production-quality CLI. Milestone 2 takes it from "built" to "shipped" — published packages, distribution channels, and developer experience enhancements that make cantonctl the recommended entry point for Canton development.

| Deliverable | Description |
|-------------|-------------|
| **npm publish** | `npm install -g cantonctl` works globally. **v0.2.0 published** with automated GitHub Actions release pipeline (tag → test → publish → GitHub Release). |
| **Homebrew tap** | `brew install cantonctl` for macOS/Linux native install without Node.js. |
| **`cantonctl doctor`** | Environment diagnostics command: checks Java, Daml SDK, Docker, port availability, config validity. Actionable fix suggestions for each issue. |
| **`cantonctl exec`** | Non-interactive scripting mode: execute REPL commands from scripts (`cantonctl exec "parties"`, piped input). Uses existing parser/executor. |
| **Deployment tracking** | Per-network package registry tracking deployed DAR hashes and package IDs. Prevents duplicate uploads, enables `deploy --status`. |
| **GitHub Actions workflow** | Reusable workflow: `uses: merged-one/cantonctl-action@v1` for `build` + `test` + `deploy` in CI pipelines. |
| **Launch content** | "Getting Started" blog post (collaborative with Foundation), 3 video tutorials (quickstart, DeFi template, deployment), Canton community call presentation. |
| **Canton docs integration** | cantonctl documented as recommended dev path alongside cn-quickstart in official Canton documentation. |

**250,000 CC justification:** Distribution is where developer adoption begins. The `doctor` command alone will save every new Canton developer hours of environment debugging — the #1 pain point from the survey. Deployment tracking closes the gap with Hardhat Ignition. The `exec` command enables CI/CD scripting without the full REPL. Comparable in scope to the Node Operator Console M1–M2 (160,000 CC) but with broader developer reach.

**Acceptance criteria:**
- `npm install -g cantonctl && cantonctl init my-app && cd my-app && cantonctl dev` works on a clean machine
- `cantonctl doctor` detects and reports all prerequisite issues with fix suggestions
- `cantonctl exec "parties"` returns structured output (human and JSON)
- `cantonctl deploy` tracks deployed packages and prevents duplicates
- Blog post published, 3 videos published, community call completed

### Milestone 3: Plugin Ecosystem + IDE — 300,000 CC

- **Estimated Delivery:** 12 weeks from Milestone 2 acceptance
- **Focus:** Plugin infrastructure, first-party plugins, and VS Code extension
- **Deliverables / Value Metrics:** Plugin scaffold + registry, 3+ first-party plugins, VS Code extension on Marketplace

The plugin ecosystem is what transforms a CLI tool into a platform. Hardhat's 190+ plugins are its primary competitive moat — they make switching costs prohibitive. This milestone seeds cantonctl's plugin ecosystem and delivers VS Code integration.

| Deliverable | Description |
|-------------|-------------|
| **Plugin scaffold** | `cantonctl plugin init my-plugin` generates a working plugin project with tests, types, and docs. |
| **Plugin testing harness** | Test utilities for plugin authors: mock cantonctl context, simulated lifecycle hooks, fixture projects. |
| **Plugin registry** | `cantonctl plugin search` queries a GitHub-based catalog. Plugin discovery page on documentation site. |
| **`@cantonctl/plugin-zenith`** | Zenith EVM bridge integration: coordinated Solidity + Daml deployment, Hardhat config generation, bridge contract scaffolding. |
| **`@cantonctl/plugin-explorer`** | Local web UI for inspecting ledger state: active contracts, transaction history, party relationships. Serves at `localhost:8080` during `cantonctl dev`. |
| **`@cantonctl/plugin-codegen`** | Extended binding generation: TypeScript (enhanced), Python, and Java client code from DAR inspection. |
| **VS Code extension** | Syntax highlighting + autocomplete for `cantonctl.yaml` (JSON Schema), inline build errors, test explorer integration, status bar widget (sandbox status, active network), task runner for cantonctl commands. |
| **Plugin authoring guide** | Comprehensive tutorial with examples: hook API, context injection, testing, publishing. |

**300,000 CC justification:** Plugin infrastructure and first-party plugins create ecosystem network effects. The VS Code extension is the #2 most-requested feature for blockchain dev tools after the CLI itself. Three first-party plugins demonstrate the platform and lower the barrier for community contributions. Comparable to the Canton Grants Portal build phase (330,000 CC) but with broader ecosystem impact — plugins benefit every Canton developer, not a single workflow.

**Acceptance criteria:**
- `cantonctl plugin init` scaffolds a working plugin that builds, tests, and installs
- 3+ first-party plugins published to npm and discoverable via `cantonctl plugin search`
- VS Code extension published to Marketplace with syntax highlighting, inline errors, and test explorer
- Plugin authoring guide published with working examples
- At least 1 community plugin demonstrated (can be from internal testing)

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone
- Demonstrated functionality or operational readiness
- Documentation and knowledge transfer provided
- Alignment with stated value metrics

### Milestone 1 Acceptance (All Met)

| Criterion | Target | Actual | Status |
|-----------|--------|--------|--------|
| Time-to-first-transaction | Under 5 minutes | `init → dev → deploy` completes in <3 min | ✓ Exceeded |
| Template quality | All 5 compile and pass tests | All 5 verified via E2E against Daml SDK 3.4.11 | ✓ Met |
| Test coverage | 80%+ statement coverage | 98.18% statements, 91.11% branches, 99.22% functions | ✓ Exceeded |
| CI/automation | Every command produces valid JSON | All commands except `console` support `--json` via OutputWriter | ✓ Met |
| Documentation | Every command has reference docs | 9 reference docs + JSON schema + 5 tasks + 4 concepts | ✓ Met |
| Error handling | Every error code has troubleshooting | 24 codes documented in `docs/troubleshooting/errors.md` | ✓ Met |
| Ecosystem compatibility | Works with current Canton | Tested against Canton 3.4.x (SDK 3.4.11, Docker image 0.5.3) | ✓ Met |

### Milestone 2 Acceptance

- `npm install -g cantonctl && cantonctl init my-app && cd my-app && cantonctl dev` works on a clean machine
- `cantonctl doctor` detects and reports all prerequisite issues with fix suggestions
- `cantonctl exec "parties"` returns structured output (human and JSON)
- `cantonctl deploy` tracks deployed packages and prevents duplicates
- Blog post published, 3 videos published, community call completed

### Milestone 3 Acceptance

- `cantonctl plugin init` scaffolds a working plugin that builds, tests, and installs
- 3+ first-party plugins published to npm and discoverable via `cantonctl plugin search`
- VS Code extension published to Marketplace with syntax highlighting, inline errors, and test explorer
- Plugin authoring guide published with working examples
- At least 1 community plugin demonstrated (can be from internal testing)

---

## Funding

**Total Funding Request: 850,000 CC**

### Payment Breakdown by Milestone

| Milestone | Scope | CC | Trigger |
|-----------|-------|---:|---------|
| **Milestone 1** | Complete CLI Toolchain | 300,000 | **COMPLETE** — upon committee acceptance |
| **Milestone 2** | Distribution + Developer Experience | 250,000 | Upon npm publish, `doctor`, `exec`, deployment tracking, launch content |
| **Milestone 3** | Plugin Ecosystem + IDE | 300,000 | Upon 3+ plugins published, VS Code extension on Marketplace, plugin registry |

### Funding Context

This request is calibrated against comparable proposals in the current Development Fund pool and industry benchmarks:

**Within the Canton Development Fund:**
- The DAR-to-TypeScript Codegen proposal requests 330,000 CC for a single feature that cantonctl already ships as a built-in command (`build --codegen`)
- The Modular Canton Topology Composer requests 140,000 CC for a capability that is a subset of cantonctl's `dev --full` topology generation
- The Test Coverage Tool + Fuzzer requests 1,000,000 CC for coverage analysis and fuzzing; cantonctl's test runner is complementary (runs Daml Script tests with structured output) and would benefit from that tool's coverage instrumentation
- The Canton Network Indexer requests 625,000 CC; the Node Operator Console requests 500,000 CC — both serve narrower audiences than a developer CLI used by every Canton builder

**Across blockchain ecosystems:**
- Hardhat (Nomic Foundation) raised $15M+ with a $30M target from the Ethereum Foundation, a16z, and Coinbase — for a tool with comparable scope to cantonctl
- Anchor (Coral) raised $20M from FTX Ventures and Jump Crypto — for the standard Solana development framework
- Foundry (Paradigm) represents an estimated $5–15M internal investment over 3 years
- The Ethereum Foundation spends ~$100M/year on ecosystem grants, with developer tooling as the largest category

At 850,000 CC, cantonctl requests less than the median for `daml-tooling` category proposals while delivering more engineering scope than any other proposal in the pool — and with Milestone 1 already complete, representing zero delivery risk on 300,000 CC (35%) of the total ask.

### Volatility Stipulation

Project duration is estimated at 22 weeks from Milestone 1 acceptance (under 6 months). Should the project timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility.

---

## Long-Term Vision: Hardhat Parity for Canton

This proposal funds cantonctl through its first three milestones — enough to establish a shipped CLI, seeded plugin ecosystem, and IDE integration. The long-term vision is to reach Hardhat-equivalent ecosystem maturity for Canton. A detailed [roadmap](https://github.com/merged-one/cantonctl/blob/main/docs/ROADMAP.md) and [funding justification with comparable tool analysis](https://github.com/merged-one/cantonctl/blob/main/docs/FUNDING_JUSTIFICATION.md) are published in the repository.

What remains beyond this proposal (potential future funding rounds):

| Phase | Scope | Estimated Effort | Comparable |
|-------|-------|-----------------|------------|
| **Advanced DX** | Transaction explorer UI, resource profiling, test coverage reporting, snapshot testing, parallel tests | 6 weeks | Hardhat plugins: gas-reporter, solidity-coverage |
| **Deployment system** | Multi-network deploy, upgrade safety checks, DAR verification, deployment history | 4 weeks | Hardhat Ignition |
| **Template ecosystem** | Template registry website, 10+ community templates, enterprise templates (multi-org, audit trail) | 4 weeks | Hardhat starter kits |
| **Internationalization** | Chinese, Korean, Japanese documentation (key institutional DeFi markets) | 3 weeks | — |
| **Enterprise integrations** | Terraform provider for Canton networks, Kubernetes operator, Vercel/Netlify deploy hooks | 6 weeks | — |
| **AI-native development** | Agentic docs Layers 3–5 (autonomous agents, self-healing docs), AI-assisted contract generation | 4 weeks | No comparable — opportunity to lead |

Hardhat reached its current position ($15M+ funding, 190 plugins, 292K weekly downloads) over 5 years with a 15–25 person team. Canton's developer community is smaller today, but the institutional asset base ($6T+) and the DeFi pivot create a window where the right tooling investment compounds rapidly. cantonctl aims to be the reason developers choose Canton — just as Hardhat is the reason many developers stay on Ethereum.

---

## Co-Marketing

Upon release, the implementing entity will collaborate with the Foundation on:
- Launch announcement across Canton social channels
- "Getting Started with cantonctl" technical blog post
- Video tutorial series (3 videos: quickstart, DeFi template, deployment)
- Presentation at next Canton community call
- Integration into official Canton documentation as recommended dev path

---

## Motivation

The Q1 2026 Developer Experience Survey made it clear: **environment setup is the biggest barrier to Canton adoption.** 41% of developers cited it as the task that took longest to get right, and "Local Development Frameworks" was rated as the single most critical tooling gap.

Canton is competing for mindshare with ecosystems that offer `npx create-eth-app`, `forge init`, and `anchor init`. The 71% of Canton developers coming from EVM backgrounds expect this level of tooling. Without it, Canton risks losing builders at the first hurdle — before they ever write a line of Daml.

cantonctl directly converts the survey's top pain point into a solved problem, reducing time-to-productivity from days to minutes and making Canton the easiest institutional DeFi chain to build on.

---

## Rationale

**Why a CLI (not a browser IDE, not extending cn-quickstart)?**

Our [research across 16 blockchain CLI toolchains](https://github.com/merged-one/cantonctl/blob/main/docs/research/blockchain-cli-toolchain-research.md) established clear patterns:

- **CLI-first matches the DeFi dev workflow.** Hardhat, Foundry, and Anchor prove that professional DeFi developers prefer local CLI tooling over browser IDEs. Among the 16 toolchains analyzed, the 5 most successful are all CLI-first.
- **cn-quickstart is infrastructure, not DX.** It requires Docker (8GB+ RAM), Nix, Gradle, JDK 21. cantonctl solves "how do I build a Daml app" without Docker.
- **oclif/TypeScript over Go/Cobra.** Only 3/16 toolchains have plugin systems. Hardhat's plugin ecosystem is its primary competitive moat. Canton's community needs extensibility without forking.
- **Templates accelerate the DeFi pivot.** Our 5 templates include real Daml contracts with working test suites, all verified against the Daml SDK via E2E tests.

**Alternatives considered:**
- *Extending DPM* — Package manager, not a dev framework. Single responsibility.
- *Go/Cobra CLI* — Faster startup but no plugin system.
- *VS Code Extension* — Editor-specific.
- *Browser-based IDE* — Lower priority per survey.
