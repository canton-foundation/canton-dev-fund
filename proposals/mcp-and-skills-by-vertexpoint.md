## Development Fund Proposal

**Author:** [VertexPoint Labs LLC (TrustedPoint)](https://trusted-point.com) · `eazyvitya@gmail.com`
**Status:** Draft
**Created:** 2026-05-18

---

## Abstract

**This proposal proposes Canton MCP and Canton LLM Skills**, two complementary open-source packages that turn any modern LLM into a Canton-fluent developer assistant.

**Model Context Protocol (MCP) is a standard that lets AI assistants access external tools and knowledge.** Claude, ChatGPT, Cursor, Continue, Cline, JetBrains AI, and autonomous coding agents all speak MCP. With a Canton MCP server installed, a developer or AI agent says "build me a dApp on Canton" and the LLM does it: scaffolds the DAML template, generates the JSON Ledger API v2 client with correct body shapes, fetches disclosed contracts from Scan, writes the bootstrap script. **One prompt, one install command, a working Canton project ready to ship.** The same applies to autonomous AI agents: they build, validate, and deploy Canton applications without a human supplying domain expertise upfront.

This is not possible today. Canton developer onboarding takes weeks, even for senior engineers, because ~85% of developers (Stack Overflow Developer Survey 2025) use LLM assistants and those assistants regularly hallucinate Canton-specific APIs. Each Canton dApp team building with LLMs reinvents the same workarounds for template-ID format, `daml.yaml` versioning, JSON v2 body shapes, disclosed contracts, and JWT claims. The ecosystem tax compounds across every team using AI tooling.

This proposal funds two open-source packages under Apache 2.0:

1. `@canton-network/mcp`: a Model Context Protocol server with 21 deterministic tools (v1 MUST set) across four layers (docs/search, lint/validate, scaffold/generate, read-only data access), 12 versioned resources, and 8 workflow prompts. Runs in any MCP-conformant client.
2. `@canton-network/skills`: a single-source canonical knowledge base of 13 topics, transpiled into 6 platform-specific prompt-rule formats (v1): Anthropic Claude Skills, Cursor Rules, Continue.dev rules, Cline, OpenCode (SST CLI), and a generic LLM-context fallback. Reaches clients without MCP support: consumer ChatGPT, GitHub Copilot, OpenAI Codex CLI, OpenCode, and on-premise Llama/Mistral/Qwen at financial institutions.

**v1 features:**

- **Build Canton projects in minutes, not weeks.** A full DAML repo skeleton (`daml.yaml`, JSON v2 client, JWT helpers, validator bootstrap script), generated in 30 seconds from a single prompt. The LLM does the work; the developer ships.
- **Canton data accessibility for all LLMs.** Any LLM or agent can read live Featured App metrics, in real time and historically: overuse %, traffic burnt, reward markers emitted per \$1 burnt, transaction history, active-contract state, AmuletRules data, mining-round info, Amulet balances. Build complex analytics, dashboards, monitoring, and reward-tracking flows directly on Canton data, with no per-project API integration. Expose those capabilities to other projects via the MCP standard. Canton data becomes first-class context for AI workflows.
- **Composability with existing Canton dApps.** The MCP introspects published Splice templates, dApp libraries, and on-network deployments. When a developer asks the LLM to "build a tokenised asset that integrates with X" or "extend dApp Y", the LLM has the right context to compose with what already exists rather than reinventing it. Real collaboration between human builders, existing useful projects, and AI agents, all mediated by the MCP.
- **Canton documentation search** across 3 canonical sources (`docs.digitalasset.com`, `docs.sync.global`, `canton-foundation/splice`) via BM25 + vector retrieval. Any LLM gets accurate, version-current Canton answers grounded in the source documentation.
- **JSON Ledger API v2 request validation** before submission: catches body-shape mismatches, deprecated endpoints, missing `disclosedContracts`, mis-formatted JWT claims, before they hit the ledger.
- **Environment and toolchain checks**: DAML SDK, OpenJDK, DPM, Docker misconfigurations caught before they break a build.
- **Workflow prompts**: guided flows for onboarding, debugging `CONTRACT_NOT_FOUND`, reward-flow walkthroughs, validator bootstrap, JWT audits.
- **Cross-platform Skills bundle**: 6 platform builds in v1 (Claude Skills, Cursor Rules, Continue.dev, Cline, OpenCode, generic markdown). Reaches every modern LLM client, including on-prem deployments.
- **Zero training cost.** No GPU budget, no ML team, no model retraining. Works with any LLM today and after the next model release.

The two packages share canonical knowledge under a CI byte-equality gate: one source, two delivery channels, no divergence.

Total request: **675,000 CC** over 8 weeks across 3 milestones (~$101,250 USD-equivalent at $0.15/CC). 525,000 CC milestone-paid (M1 75k, M2 250k, M3 base 200k). 150,000 CC adoption-tied: 50,000 CC per verified independent adopter (capped at 3) in a 60-day window after M3, following the NODERS Dev Fund #38 precedent. External security audit (~$20-30k vendor passthrough, Cure53 / Trail of Bits / Foundation-approved) included in M3 base.

VertexPoint Labs commits to long-term open-source maintenance after launch (CI/CD, security patches, 30-day Canton-minor compat, 60-day Splice-minor compat, 48h critical-issue SLA). A continuation maintenance grant per CIP-0100 is planned at month 3, following Digital Asset's Canton OSS Maintenance and Splice Wallet Kernel Maintenance grants.

The work covers two Dev-Fund template categories: `daml-tooling` (DAML compilation, scaffolding, gotchas) and `canton-apis` (JSON Ledger API v2 body shapes, JWT claims, disclosed-contract handling, Scan API integration). Tech & Ops Committee can pick a primary label.

All deliverables released under Apache 2.0.

---

## Specification

### 1. Objective

**Problem 1: LLMs hallucinate Canton APIs.** Canton/DAML adoption is gated by developer experience. Documentation lives across four sites and two GitHub orgs. ~85% of developers rely on LLM assistants, and those assistants fail in two predictable ways.

DAML-side failures: emit non-existent SDK versions (`daml install 3.4.0`); use OpenJDK 17 instead of 21; mis-format DAML template IDs (drop the leading `#`); generate `daml.yaml` with `dependencies:` instead of `data-dependencies:` for Splice DARs; emit broken DAML syntax (e.g. `import DA.Time (Time)`, where `Time` is a built-in primitive).

Canton API failures: emit deprecated `submit-and-wait-for-transaction-tree`; confuse JSON v2 body shape (flat for `submit-and-wait`, wrapped for `submit-and-wait-for-transaction`); encode DAML `Int` as JSON number (precision loss above 2^53); omit `disclosedContracts` for AmuletRules / OpenMiningRound, producing `CONTRACT_NOT_FOUND` 404; mis-format JWT claims for the target network; mis-format `Party` (must be `name::fingerprint`) and `Time` (must be RFC3339 ISO).

Each failure costs hours per developer per occurrence. Multiplied across hundreds of Canton developers using LLM tools, this is a measurable ecosystem tax.

**Problem 2: LLMs cannot access Canton data.** There is no standardised way for an LLM or AI agent to read Canton state. An agent that wants to query active contracts, fetch Featured App metrics, check mining-round data from Scan, or look up an Amulet balance must integrate with JSON Ledger API v2 and Scan API by hand. Combined with Problem 1, those hand-rolled integrations regularly fail because of the same hallucinations. The result: Canton data is locked away from the AI workflow that 85% of developers and a growing share of agentic systems already use. Analytics, dashboards, monitoring, reward tracking, and on-network discovery: all of these require either pre-built data infrastructure (which does not exist for Canton) or hand-coded API clients per project. Today, Canton is effectively invisible to AI tooling.

**Outcome.** Provide and maintain two complementary open-source artefacts that cover every modern LLM client in active use today and over the next 12 months, including on-premise LLM deployments at financial institutions where training and fine-tuning are not feasible for compliance reasons.

**Success looks like:** median time from "I want to build on Canton" to "first dApp deployed on cn-quickstart" drops from weeks to hours; LLM-induced hallucinations decrease across the conformance prompt set (≥95% catch rate); ≥3 verified independent adopters in the public Adoption Registry within 60 days post-M3; 6 Skills platform targets shipping in v1; 6 months of maintenance with all SLAs honoured; continuation grant filed per CIP-0100 by month 3.

---

### 2. Implementation Mechanics

The proposal covers two workstreams under one objective. They share canonical-knowledge source and CI but ship as separate npm packages, following NODERS Funding Proposal #38 (three workstreams under one objective).

#### Workstream A: Canton MCP server (`@canton-network/mcp`)

A TypeScript MCP server (Node 22+) on `@modelcontextprotocol/sdk` v1.29+, supporting stdio transport.

v1 tool surface (21 tools, 4 layers):

- *Layer A. Docs & search* (read-only, 6 tools): hybrid BM25 + vector search across the 3 canonical doc sources; doc fetch; JSON Ledger API endpoint resolution; DAML stdlib symbol lookup; Splice contract source lookup; gotchas catalog lookup.
- *Layer B. Lint & validate* (read-only static analysis, 6 tools): `canton_validate_command_body`, `canton_validate_template_id`, `canton_validate_jwt_claims`, `canton_check_environment`, `canton_check_disclosed_contracts`, `canton_explain_error`.
- *Layer C. Scaffold & generate* (file emission, 4 tools): app-provider repo skeleton; single DAML template with optional Featured-App reward integration; JWT scaffold; idempotent validator bootstrap script.
- *Layer D. Live data access* (read-only, 5 tools, env-gated `CANTON_MCP_ALLOW_NETWORK=1`): `canton_query_active_contracts` (on-ledger transaction and contract-state data), `canton_query_scan` (Scan API for Featured App metrics, mining rounds, AmuletRules data), `canton_query_balance` (Amulet balances), `canton_health_check`, `canton_fetch_dar`.

12 resources cover versioned doc pages, JSON v2 OpenAPI fragments, Splice contract sources, live SV/migration/Scan info, gotchas catalog, scaffold templates, DAR cache index, canonical facts file, prompts index, per-session changelog.

8 workflow prompts: `onboard-app-provider`, `migrate-json-api-v1-to-v2`, `debug-contract-not-found`, `explain-reward-flow`, `bootstrap-validator-devnet`, `write-daml-template`, `audit-jwt`, `port-cn-quickstart`.

Doc indexing pipeline: GitHub Actions weekly cron crawls 3 canonical upstreams (`docs.digitalasset.com/build/` tracking the current stable Canton Network minor, `docs.sync.global`, and `canton-foundation/splice`) via version-pinned git clones. Chunks at 800 tokens, embeds with `nomic-embed-text-v1.5` (open weights, run locally via `@xenova/transformers`), stores in SQLite + `sqlite-vec`. Ships an ~80-200 MB `index.sqlite` as a release asset, sha256-verified.

Deferred to continuation grant: Layer D mutating tools (5), 3 additional Layer B/C tools, Streamable HTTP transport with OAuth 2.1, hosted demo MCP.

#### Workstream B: Canton LLM Skills bundle (`@canton-network/skills`)

A canonical-knowledge package authored once in markdown and transpiled by a TypeScript build pipeline (`unified` + `remark`) into 6 platform-specific prompt-injection formats. Same content in different containers. A developer using any modern LLM client gets correct Canton facts as system-prompt context, with no per-platform manual rewriting and no model retraining.

13 canonical topics (all in v1): `00-quickstart`, `01-daml-basics`, `02-daml-yaml`, `03-json-ledger-api-v2`, `04-template-ids`, `05-disclosed-contracts`, `06-jwt-auth`, `07-splice-amulet`, `08-featured-app-setup`, `09-reward-flow`, `10-validator-ops`, `11-cn-quickstart`, `12-gotchas-catalog`. Each topic encodes the exact patterns and failure modes from the canonical knowledge base.

6 v1 build targets: Anthropic Claude Skills (YAML frontmatter + body), Cursor Rules (`.mdc`), Continue.dev rules, Cline (`.clinerules/`), OpenCode (SST CLI), and a generic LLM-context markdown fallback (works in ChatGPT consumer, on-prem Llama/Mistral/Qwen).

Distribution: `npx @canton-network/skills install --client <name>` copies the bundle into the user's project. `--client claude --global` writes to `~/.claude/skills/`.

Freshness check baked into each topic. Every Skills topic opens with a Freshness check block that instructs the host LLM, on first invocation per session, to fetch `api.github.com/repos/canton-network/canton-skills/releases/latest` and the latest Canton + Splice release tags, then compare against the topic's `version`, `canton-compat`, and `splice-compat` frontmatter. If the installed Skill is behind, the LLM warns the user with the refresh command (`npx @canton-network/skills install`). In agentic file-write mode with explicit user consent, the LLM can fetch the new content from the signed GitHub release and overwrite the installed file in place. If the host LLM has no web-fetch capability, the Skill instructs it to surface an explicit manual-refresh notice to the user instead of failing silently. Releases ship under sigstore + npm provenance, so the self-refresh path only pulls from canonical signed sources.

A CI gate enforces byte-equality between Skills `12-gotchas-catalog.md` and the MCP `gotchas.json`. One canonical source, two delivery channels, no divergence.

Deferred to continuation grant: Windsurf, GitHub Copilot, ChatGPT Custom Instructions, OpenAI Codex CLI platform targets.

#### Open Source Posture

Both packages release under Apache-2.0 from v0.1, with no "open core" or "commercial-only feature" model. Public CI/CD operates from the first commit. The conformance harness (`@canton-mcp/conformance`) is publicly runnable by anyone, with no gated certification programme. On Foundation request, we will transfer repos to a Foundation-managed org under the same Apache-2.0 licence, mirroring Canton OSS and Splice Wallet Kernel transition paths.

#### Why no training is required

No GPU budget, no ML team, no model retraining cycles. The work runs on any LLM today (Claude 4.x, GPT-5, Gemini 2.5 Pro, Llama 3.1 70B, Mistral Large, Qwen 2.5) and on any LLM tomorrow without code changes. This matters for institutional users at Goldman, BNY, Broadridge, Cumberland and other Canton SVs that run LLMs on-premise for compliance and data-residency reasons. A Canton-fine-tuned model from a single vendor would lock them out from the start. MCP and Skills are deterministic artefacts that age gracefully and are explicitly versioned.

---

### 3. Architectural Alignment

The work strengthens the developer interface layers that LLM-assisted developers hit on day one.

DAML compilation and DAR ecosystem: templated `daml.yaml` generation with correct `sdk-version`, `--target=2.1`, and `data-dependencies` sets the floor for buildable projects. `canton_scaffold_daml_template` emits production-ready DAML templates with optional Featured-App reward integration. `canton_fetch_dar` provides a deterministic local cache for Splice DARs.

Canton API integration: deterministic per-endpoint validation (`canton_validate_command_body`) catches the most common LLM-emitted errors at the request-build step. `canton_check_disclosed_contracts` auto-fetches required `disclosedContracts` from Scan, removing `CONTRACT_NOT_FOUND` 404s. `canton_validate_jwt_claims` and `canton_scaffold_jwt` cover both LocalNet HMAC and DevNet/MainNet OIDC RS256 flows.

CIP and adjacent-grant alignment:

- CIP-0103 (dApp API Standard): v1 scaffolds emit CIP-0103-conformant JSON v2 client wrappers, complementing Dev Fund #69 (DA dApp SDK) rather than duplicating it.
- CIP-0100 (Recurring Maintenance Grants): maintenance commitment mirrors that framework, with continuation grant filing planned for month 3.
- NODERS Go SDKs (#38, approved): `canton_scaffold_app_provider` can emit Go output using NODERS' libraries.
- DA dApp SDK (#69, approved) and Peaceful Studio C# / .NET SDK (#46, in review): MCP scaffolds surface their SDKs; the AI-tooling layer sits above the SDK layer.
- DA Canton OSS / Splice Wallet Kernel Maintenance: doc-indexer pipeline tracks the Foundation-maintained upstreams as versioned sources without duplicating maintenance work.

The proposal does not duplicate any approved or in-flight grant. It sits in the unfilled "AI-discoverable layer" above all of them.

---

### 4. Backward Compatibility

Both packages are additive. MCP server depends on DAML SDK ≥ 3.4.11 and Splice ≥ 0.5.18; older installations are unaffected. Skills bundle is text-only output; no runtime dependencies.

*No backward compatibility impact on existing Canton ecosystem components.*

---

## Milestones and Deliverables

> Milestones run forward from week 1 = grant approval date. Total project duration: 8 weeks. M3 includes a 30-day stabilisation period plus a 60-day adoption-bonus window, following the NODERS #38 precedent. Milestones are sized by complexity, with M1 deliberately the smallest.

### Milestone 1: Foundation, docs index, Layer A MCP, Skills core

- **Estimated Delivery:** Week 3
- **Focus:** Stand up the canonical-knowledge pipeline and the always-safe read-only MCP and Skills surface.
- **Deliverables:**
  - `@canton-network/mcp` v0.1 published on npm (Apache-2.0), listed in `registry.modelcontextprotocol.io`, stdio transport, full Layer A tool surface (6 tools).
  - Doc-indexing pipeline live as a GitHub Actions weekly cron, indexing 3 canonical upstream sources; release assets `index.sqlite` and `canton-facts.json` published with sha256.
  - `@canton-network/skills` v0.1 with all 13 canonical topics authored as single-source markdown.
  - 3 v1 platform builds: Claude Skills, Cursor Rules, generic LLM context fallback.
  - Public README, contribution guide, and one Loom demo (≤5 min) showing a Claude Code session resolving 3 documented hallucination cases.
  - `@canton-mcp/conformance` v0.0.1 skeleton (CI runnable).
  - External security audit pre-engagement booked.
- **Acceptance:** Tech & Ops Committee installs both packages from npm, runs the 6 Layer-A MCP tools and inspects the 3 Skills bundles, observes schema-valid output and ≥95% catch rate on the public test prompt set (50 prompts).
- **Payment:** 75,000 CC (~$11,250, 11%) on milestone delivery.

### Milestone 2: Lint, scaffold, Layer D read-only, Skills full coverage

- **Estimated Delivery:** Week 6
- **Focus:** Complete the deterministic linting and scaffolding surface, ship Layer D read-only tools, and ship Skills coverage to all 6 v1 platform targets including OpenCode. External audit kicks off in parallel during weeks 5-6.
- **Deliverables:**
  - 14 additional MCP tools across Layers B (5), C (4), and D read-only (5). Names listed in section 2.
  - Skills bundle ships 3 additional platform targets (Continue.dev, Cline, OpenCode); 6 v1 targets total.
  - `npx @canton-network/skills install --client <name>` CLI operational for all 6 v1 clients.
  - `@canton-mcp/conformance` v0.5 with ≥40 test cases covering tracks 1-3.
  - Integration test: `canton_scaffold_app_provider` output builds cleanly with `daml build` against SDK 3.4.11.
  - External security audit kickoff: scope finalised, audit work begins.
- **Acceptance:** Conformance suite passes 100% on track 1, ≥95% on track 2, ≥95% on track 3. All 6 Skills platform installers succeed against fresh client configurations.
- **Payment:** 250,000 CC (~$37,500, 37%) on milestone delivery.

### Milestone 3: Audit completion, launch, adoption-tied bonus, 30-day stabilisation

- **Estimated Delivery:** Week 8 base + 60-day adoption-bonus window.
- **Focus:** Audit remediation, public v1.0 launch, 30-day stabilisation, ecosystem-driven adoption tracking.
- **Deliverables:**
  - External security audit completed and remediated (~$20-30k vendor passthrough at vendor invoice). All Critical and High findings remediated; Medium tracked or remediated; Low logged. Audit report published with remediation summary.
  - `@canton-network/mcp` v1.0 and `@canton-network/skills` v1.0 published on npm and MCP registry. Cursor Directory listing pursued.
  - Documentation site at `canton-mcp.dev` operational with quickstart, tool reference, prompt library, Skills install instructions per client, and the public Adoption Registry at `canton-mcp.dev/adopters`.
  - Launch blog post and 2 tutorial videos.
  - Telemetry showing ≥30 unique MCP installs and ≥100 Skills installs in 30 days post-launch.
  - 30-day fix log; ≥3 GitHub issues from independent users with ≥2 closed.
  - Adoption Registry methodology published before bonus window opens.
- **Acceptance (base 200k CC):** Audit report public; v1.0 in MCP registry; install thresholds met; documentation site live.
- **Payment Structure:**
  - 200,000 CC base (~$30,000, 30%) on milestone delivery (Week 8). Includes the external audit vendor passthrough.
  - +50,000 CC per verified independent adopter (~$7,500 each), capped at 3 = max 150,000 CC ≈ $22,500. Paid per-adopter on Tech & Ops Committee verification, in a 60-day window after M3 base delivery. Bonus payments are released per-adopter, not as a single lump.

#### Adoption Registry verification

An "adopter" is verified when they submit a PR to `canton-mcp.dev/adopters.yml` with: project name, public GitHub repo URL or production-app URL, one-line usage description, signoff from the team's technical lead. The repo must demonstrably use `@canton-network/mcp` or `@canton-network/skills` (`package.json` dependency, `.cursor/rules/canton-*.mdc` files committed, GitHub topic `canton-mcp` or `canton-skills`). Tech & Ops Committee verifies independently (≤30 min per adopter). Adopters must be independent ecosystem teams, not our own projects. Following NODERS #38, the bar is "real working integration in production or active development", not "we plan to use this".

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on deliverables completed per milestone, demonstrated functionality, documentation provided, alignment with stated value metrics, and Adoption Registry verification (M3 bonus). Project-specific conditions: both packages publicly accessible on npm under Apache 2.0; release tags include changelogs and upgrade notes; conformance suite runnable end-to-end via `npx @canton-mcp/conformance`; external audit report public; Adoption Registry methodology documented before M3 bonus window opens. Acceptance criteria are tied to ecosystem value, not artefact delivery.

---

## Funding

Total Funding Request: **675,000 CC** (~$101,250 USD-equivalent at $0.15/CC).

- 525,000 CC milestone-paid: M1 75k, M2 250k, M3 base 200k.
- 150,000 CC adoption-tied: 50,000 CC × up to 3 verified independent adopters.

| Milestone | Description | Payment | % | Estimated Delivery |
|--|--|--|--|--|
| M1 | Foundation | 75,000 CC | 11% | Week 3 |
| M2 | Lint, scaffold, Layer D read-only, Skills full | 250,000 CC | 37% | Week 6 |
| M3 base | Audit completion, launch, stabilisation, Adoption Registry | 200,000 CC | 30% | Week 8 |
| M3 adoption bonus | 50,000 CC × up to 3 adopters | up to 150,000 CC | up to 22% | Week 8 + 60 days |
| **Total** | | **up to 675,000 CC** | **100%** | |

Milestones are sized by engineering complexity. M1 stands up infrastructure and a small read-only surface. The bulk of engineering (14 new tools, full Skills coverage, conformance harness, audit kickoff) lands in M2. M3 base covers external audit completion, public launch, and 30-day stabilisation. The adoption-tied structure mirrors NODERS Funding Proposal #38 Milestone 4, which pays *100,000 CC per Featured App on mainnet (up to 5 apps = 500,000 CC) plus 200,000 CC on completion*.

### Effort Breakdown

| Workstream / Activity | Hours |
|--|--|
| MCP server (21 tools, 12 resources, 8 prompts) | 210 |
| Doc indexer pipeline (CI cron, embedder, SQLite store) | 50 |
| Skills (13 topics, 6 platform builds incl. OpenCode) | 100 |
| Skills installer CLI (6 clients) | 25 |
| Conformance harness v0.5 (≥40 tests) | 40 |
| Documentation site + Adoption Registry methodology | 30 |
| Audit coordination + remediation | 50 |
| Launch + 2 tutorial videos + DevRel | 30 |
| **VertexPoint Labs effort** | **535** |
| External auditor (vendor) | 80 |

The proposer effort delivers shared public developer infrastructure for the Canton ecosystem. External audit (~$20-30k = ~133-200k CC) is a passthrough at vendor invoice.

### Risk Mitigation

- *MCP spec evolves mid-build*: follow upstream releases; conformance harness isolates downstream impact.
- *Canton 3.4 to 3.5 transition during build*: build against 3.4.11; ship 3.5-compat track; conformance tests catch breaks.
- *External audit identifies critical issue late*: audit booked in M1, kicks off M2, lands in M3 base with 4 weeks remediation slack.
- *Adoption stalls, < 4 adopters verified*: bonus payments simply do not trigger; base milestone payments still apply.
- *Maintainer becomes unavailable*: public CI/CD, public conformance suite, public docs in `docs/maintainers/` enable any TypeScript developer with Canton knowledge to take over.

### What's deferred to a continuation grant

Layer D mutating MCP tools (`canton_submit_create`, `canton_submit_exercise`, `canton_allocate_party`, `canton_upload_dar`, `canton_claim_rewards`) gated by `CANTON_MCP_ALLOW_WRITE=1` plus elicitation consent; 3 additional Layer B/C tools (`canton_lint_daml`, `canton_scaffold_client_sdk`, `canton_scaffold_mcp_devcontainer`); Streamable HTTP transport with OAuth 2.1 + DPoP; hosted demo MCP at `mcp.canton-mcp.dev`; 4 additional Skills platform targets (Windsurf, GitHub Copilot, ChatGPT Custom Instructions, OpenAI Codex CLI); Anthropic Skills Marketplace listing; conformance v1.0 (60+ tests).

---

## Maintenance Commitment

VertexPoint Labs commits to **6-month minimum post-launch maintenance** at no additional cost beyond this grant, with continuation grant intent per CIP-0100 at month 3.

Maintenance covers six tracks: (1) doc-indexer cron weekly via GitHub Actions; fresh `index.sqlite` and `canton-facts.json` published with sha256 every Sunday. (2) Per-Canton-release update within 30 days of each new minor: pull diff, update `canton-facts.json`, run conformance suite, patch affected tools and Skills topics, cut new releases with changelog referencing upstream Canton version. (3) Per-Splice-release update within 60 days, same process. (4) MCP-spec rebases within 45 days of each major release. (5) Security patching: CVE Critical/High within 7 days; Medium within 30 days. (6) Skills content quarterly review; immediate update to `12-gotchas-catalog.md` whenever a new gotcha is reported in GitHub Issues.

Issue and PR SLAs. Critical (security, breaking API, broken install on a major client): 48h response, 7-day fix. Normal (bug, regression, missing tool): 7-day response, 30-day fix. PRs from independent contributors reviewed within 7 days. Quarterly public office-hours call.

If we become unavailable, the work degrades gracefully. Published npm packages remain available. The doc-indexer is a public GitHub Actions workflow runnable by anyone. The conformance suite is publicly runnable. Bus factor is low: any TypeScript developer with Canton knowledge can take over using only public artefacts. A 30-day handover commitment applies if a successor maintainer is designated by the Foundation, at our then-current hourly rate or pro-rated against an active continuation grant.

Following DA Canton OSS Maintenance (2,000,000 CC/month) and Splice Wallet Kernel Maintenance (400,000 CC/month) precedents, we intend to file a continuation maintenance grant per CIP-0100 at month 3 post-launch. Indicative monthly ask: ~150,000 CC/month (~$22,500 at $0.15/CC).

---

## Co-Marketing

Upon milestone delivery, VertexPoint Labs will collaborate with the Foundation on: announcement coordination for v1.0 launch (M3) and major releases; technical blog posts ("Canton in 30 seconds: from prompt to deployed dApp with Canton MCP"; "How LLM Skills make Canton onboarding tractable across Cursor, Claude Code, Continue, Cline, OpenCode, and any LLM, without training a model"; "External security audit retrospective for an AI-assisted Canton developer toolkit"); developer promotion (how-to snippets, example repos, 2 tutorial videos at launch, full 5-video series in continuation); joint workshop or office-hours session at HackCanton-style events; coordinated social posts on Foundation Twitter and `sync.global` blog at M3.

---

## Motivation

These deliverables are valuable to the Canton ecosystem because they reduce integration time for new projects (deterministic validation, scaffolding, indexed documentation-search at the LLM layer where most developers now start); reduce duplicated effort across teams (each Canton dev team building with LLMs currently re-invents the same workarounds); improve upgrade resilience as DAML-LF, protobuf schemas, and Splice versions evolve; broaden the developer base by meeting LLM users where they already are, including OpenCode users and on-premise institutional deployments; and require zero ML budget from adopters (the work runs on any existing LLM without training, fine-tuning, or vendor-specific assistant).

Estimated portion of ecosystem benefiting: ~85% of developers use LLM assistants (Stack Overflow Developer Survey 2025). For new Canton dApp and validator-side teams, we estimate ≥80% of teams will benefit either directly or indirectly. Conservative target: 200 unique developers across 30+ teams in the 12 months following M3.

This proposal addresses the developer-experience integration bottleneck that the Foundation research cited in Dev Fund #69 identified as a main barrier for dApp builders.

---

## Rationale

Two complementary delivery channels (MCP and Skills) cover the full matrix of LLM clients. MCP-only excludes consumer ChatGPT, GitHub Copilot in many configurations, OpenAI Codex CLI in non-tools mode, OpenCode, and on-prem LLM deployments at financial institutions. Skills-only lacks live validation, scaffolding, and ledger ops. Both surfaces hit the same workflow: scaffolding a DAML template and calling JSON v2 to exercise it is one continuous LLM-driven action.

Fine-tuning a Canton-specific model would lock the ecosystem into a single vendor, require GPU budget and ML expertise, go stale within months as Canton/DAML/Splice evolve, and exclude on-prem institutional users. MCP and Skills sidestep all of these. The same canonical knowledge is delivered as deterministic artefacts that any LLM can consume with zero ML cost.

The work composes with existing Canton ecosystem tooling rather than competing with it. The MCP server wraps existing tools (`damlc`, `dpm`, JSON Ledger API v2, Scan API). The doc-index pipeline indexes existing canonical documentation upstreams. The Skills bundle encodes the same canonical knowledge in formats the upstream LLM-client ecosystem expects. The proposal does not duplicate Dev Fund #69, Wallet Kernel Maintenance, Canton OSS Maintenance, Splice OSS Maintenance, NODERS Go SDKs, Peaceful Studio C# / .NET SDK (#46), or DAML training proposals. It sits in the unfilled "AI-discoverable layer" above all of them.

### Why us

**VertexPoint Labs LLC**, operating under the brand **TrustedPoint**, is a professional Proof-of-Stake infrastructure provider securing leading blockchain networks since 2020.

Track record:

- Operating validators since 2020 across 9 PoS networks: Sui, Story, Ika, Somnia, Walrus, Initia, Celestia, Zetachain, Monad.
- **$350M+ in staked assets** safeguarded by our infrastructure.
- **19,000+ delegators worldwide** trust our operations.
- Mandates from foundations and large institutional delegators across the ecosystems above.

Reliability and security are our day job. Running validators across 9 chains for 5 years has built the operational discipline this proposal needs: CI/CD pipelines that do not break, security patching with documented SLAs, version-compatibility workflows triggered on every upstream release, and incident response that does not need a human in the loop at 03:00 UTC. The MCP and Skills packages share the same operational surface as a validator: monitored CI, signed releases, public dashboards, public incident logs.

We prefer to participate in the Canton ecosystem directly rather than purely as a validator-as-a-service vendor. Operating our own infrastructure brings independence, accountability, and a direct stake in network decentralisation. The MCP and Skills work extends that stake into the developer-experience layer.

Channels: [trusted-point.com](https://trusted-point.com) · [github.com/trusted-point](https://github.com/trusted-point) · [twitter.com/Trusted_Point](https://twitter.com/Trusted_Point) · [t.me/TrustedPointCorp](https://t.me/TrustedPointCorp)
