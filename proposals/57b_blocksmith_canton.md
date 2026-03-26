## Development Fund Proposal

**Author:**  57Blocks  
**Status:** Submitted  
**Created:** 2026-03-13  

---

## Abstract

BlockSmith for Canton is an operator-first toolkit that makes deploying, connecting, monitoring, and upgrading Canton nodes feel closer to "standard practice" in mature ecosystems (EVM-style: strong deployment automation + dashboards + runbooks). It targets the ecosystem's highest-reported friction — **environment setup & node operations** — by shipping opinionated node templates, deterministic diagnostics, a **web UI** (BlockSmith Console for Canton) for one-click topology/connectivity + health visibility (including handshake-related indicators where exposed), and an upgrade/migration assistant for Canton and Daml. The grant funds an open-source common-good core; sustainability comes from optional paid Pro/Cloud add-ons (fleet management, hosted UI/dashboards, enterprise support) layered on top.

---

## Specification

### 1. Objective

Deliver an open, production-minded node-ops toolkit that:

- Reduces time-to-healthy Canton node setup from "days of infra debugging" to "hours/minutes with deterministic checks."
- Makes node connectivity and key health state visible via a simple topology dashboard.
- Provides operator-grade monitoring defaults (metrics, dashboards, alerting) as a one-command bundle.
- Makes upgrades and migrations less risky through an upgrade assistant, compatibility matrix, and scripted runbooks.

**Target users**

- **Node operators / infrastructure teams** (participants, integrators): need reliable deployment, monitoring, and upgrades.
- **App teams**: benefit indirectly from faster onboarding and fewer "infrastructure rabbit holes".

**Success looks like:**

- A new team can deploy a reference topology and reach "connected + healthy" state with deterministic checks and dashboards.
- Operators can verify connectivity and key health indicators without tailing logs, and can detect common failure modes via `doctor`.
- Upgrades are guided by a tool-generated plan and verified preflight checks, reducing downtime and trial-and-error.

---

### 2. Implementation Mechanics

#### Component overview

**1) Unified operator CLI (entrypoint)**

A single CLI (`blocksmith-canton`) that provides:

- `blocksmith-canton init`: create an opinionated node workspace (configs, secrets stubs, directory layout, environment profiles).
- `blocksmith-canton up|down|restart`: bring up/down a topology in a reproducible way (local-dev via Docker Compose in grant scope).
- `blocksmith-canton status`: health summary across nodes and APIs, including "what's broken and why".
- `blocksmith-canton logs`: structured log access and known-issue signatures.
- `blocksmith-canton doctor`: deterministic diagnostics (ports, docker prerequisites, JVM, time drift, TLS/certs where applicable, API reachability, and connectivity indicators).

**1a) DevNet/Quickstart operator automation (make the "hard parts" one command)**

Codify and automate the operational primitives that appear repeatedly in real-world guides:

- **Network info discovery**: fetch and validate values like "migration id" and active version where applicable, and persist them as artifacts for repeatable starts ([Deploy Quickstart to DevNet](https://docs.digitalasset.com/build/3.3/quickstart/operate/deploy-quickstart-to-devnet.html)).
- **Onboarding secret workflow**: support known sponsor-SV endpoints where accessible, and always support manual secret input + TTL checks (guides note secrets may be short-lived and are often the first troubleshooting step).
- **Host-based routing helpers**: generate `/etc/hosts` entries and validate required hostnames for local routing (nginx virtual hosting is used in Quickstart/validator setups).
- **Profiled start commands**: generate (or wrap) the correct `start` command arguments for common flows (e.g., sponsor SV URL, onboarding secret, party hint, migration id, wait-for-ready, auth enabled).
- **Reset semantics**: provide a safe "reset" that removes stale containers/volumes when needed (guides often recommend a clean `down -v` to resolve unhealthy/stale states).

**2) Opinionated node deployment templates ("golden paths")**

Provide versioned, well-documented templates that teams can fork and adapt:

- **Local-dev**: single-machine Docker Compose topology suitable for onboarding and integration testing.
- **Team-dev** (post-grant / commercial or follow-on): Helm charts for a shared dev cluster, with sane defaults and clear overrides.

**3) BlockSmith Console for Canton (web UI) + monitoring/observability (one-click)**

The Canton DevEx survey explicitly calls for "one-click visual dashboards" to validate node handshakes without complex terminal commands, and a more visual, human-friendly debugging experience ([survey analysis](https://discuss.daml.com/t/canton-network-developer-experience-and-tooling-survey-analysis-2026/8412)). BlockSmith for Canton ships a real UI as a first-class deliverable:

- `blocksmith-canton ui up|down`: start the BlockSmith Console for Canton locally (and connect it to your topology).
- **Setup wizard**: guided bring-up of a "golden path" topology (local-dev first), including routing prerequisites and connectivity checks.
- **Topology/connectivity graph**: participant↔synchronizer connectivity and health indicators, with actionable next steps on failure. Handshake-specific status is shown where exposed by the deployment's health/status surfaces.
- **Health & readiness**: unified health view (gRPC/HTTP/admin where available), plus links to the relevant logs and suggested fixes.
- **Observability bundle**: `blocksmith-canton obs up|down` starts a bundled stack (Prometheus + Grafana + log aggregation where feasible) and the UI deep-links into relevant dashboards.
- **Diagnostics center**: download a single support-quality archive (`collect-diagnostics`) and view what is inside (versions, health summaries, key logs).
- **Connection artifact export**: export a single machine-readable file (JSON) that captures "what to connect to" for operators and app teams (endpoints/ports/hostnames, enabled auth mode, and detected version info where available). This directly reduces the "opaque discovery" friction called out in the survey.
- **Auth/JWT checklist page**: a guided checklist for common auth setups (OIDC/JWT), plus "is auth enabled?" checks where visible from configuration/health surfaces. (This is guidance + validation, not a full managed identity product.)
- **Package visibility (where exposed)**: a simple "Packages" page that lists installed packages/DARs when the deployment exposes a supported API for it; otherwise, the UI shows the operator which API/setting to enable to make package discovery possible.

In addition to the BlockSmith Console for Canton UI, prebuilt dashboards covering "golden signals" for node operations (liveness, API availability, error rates, resource usage) and Canton-specific connectivity indicators where available will be provided.

Observability choices explicitly align with established component patterns where available. For example, PQS exposes metrics (including Prometheus exposition), structured logging controls, and diagnostics export (metrics + thread dumps) that are natural inputs to a bundled operator dashboard and "collect diagnostics" command ([PQS Observe](https://docs.digitalasset.com/build/3.3/component-howtos/pqs/observe.html)).

**4) Upgrade & migration assistant (Canton + Daml)**

Reduce the operational burden of upgrades:

- `blocksmith-canton upgrade plan`: detect current versions, compare against a target, and generate a step-by-step plan (including preflight checks).
- `blocksmith-canton upgrade preflight`: validate prerequisites, config compatibility, and run smoke checks in a staging profile.
- Maintain a public **compatibility matrix** and "known pitfalls" playbooks for supported versions.

The upgrade assistant is grounded in the official "upgrade to a new release" model: upgrading binaries/config and applying database schema migrations (e.g., Flyway), then separately coordinating protocol version changes across nodes — with explicit emphasis on backups/testing and the reality that certain migrations cannot be rolled back once started ([Upgrade To a New Release](https://docs.digitalasset.com/operate/3.3/howtos/upgrade/index.html)).

The assistant focuses on repeatable operational steps and validations. It does not attempt to "magically fix" protocol-level incompatibilities; instead it makes them visible early and provides safe, operator-friendly workflows.

#### Technical approach (high level)

- CLI implemented in a widely adopted language for devops tooling (Rust or Go), designed for extensibility (subcommands/plugins).
- Orchestration via Docker Compose in grant scope (lowest friction); Helm charts are post-grant/follow-on.
- Health checks via HTTP/gRPC endpoints where available; plus log signature detection for known failure states.
- Observability shipped as versioned assets and started via a single command.
- Upgrade assistant built around explicit version detection, preflight validation, and scripted steps with checkpoints.

#### Non-goals (explicitly out of scope)

- Replacing Canton core components or modifying protocol behavior.
- Building a full explorer/indexer.
- Providing a proprietary-only solution: the funded deliverables are open-source and usable by the whole ecosystem (commercial options are additive).

#### Sustainability model (open core)

To ensure long-term sustainability, BlockSmith for Canton uses an **open-core** model:

- **Open-source core (grant-funded)**: CLI, templates, BlockSmith Console for Canton, dashboards, diagnostics, upgrade playbooks, and compatibility matrix.
- **Paid Pro/Cloud add-ons (post-grant, optional)**: fleet management across multiple environments, hosted Console UI/dashboards + alert routing (Slack/PagerDuty), role-based access control, compliance reporting, long-term support (LTS) builds, and enterprise onboarding/support packages.

This structure keeps the ecosystem's fundamentals open while enabling a sustainable business to maintain and evolve the tool.

---

### 3. Architectural Alignment

This proposal aligns with Development Fund priorities as it delivers:

- **Critical ecosystem infrastructure** and **developer/operator tooling** used by multiple participants ([fund repo](https://github.com/canton-foundation/canton-dev-fund)).
- Direct response to the survey's top friction: environment setup & node operations, plus the high-demand area of observability/topology dashboards ([survey analysis](https://discuss.daml.com/t/canton-network-developer-experience-and-tooling-survey-analysis-2026/8412)).

The scope is deliberately bounded to operator tooling and does not touch Canton core protocol components, smart contract execution, or ledger storage. All deliverables are additive, open-source, and composable with existing Canton infrastructure.

---

### 4. Backward Compatibility

*No backward compatibility impact.* BlockSmith for Canton is entirely additive — a standalone CLI, web UI, and observability bundle that wraps and observes existing Canton components via published health/gRPC/HTTP APIs. It does not modify Canton core components, protocol behavior, or existing node configurations. Teams can adopt incrementally without disrupting any running infrastructure.

---

## Milestones and Deliverables

### Milestone 1: Golden-path bootstrap + console foundation

- **Estimated Delivery:** ~4–5 weeks from project kickoff
- **Focus:** Core CLI, environment automation, and the initial BlockSmith Console for Canton web UI
- **Deliverables / Value Metrics:**
  - `blocksmith-canton init/up/down/status/logs/doctor`
  - `blocksmith-canton preflight`: environment readiness checks (Docker resources, ports, routing prereqs)
  - `blocksmith-canton reset --mode safe|full` with explicit "what will be removed" output
  - `blocksmith-canton env doctor` detecting common corporate TLS/proxy failure modes with actionable remediation
  - DevNet operator automation: network info discovery, onboarding secret workflow, host-based routing helpers, profiled start commands, and reset semantics
  - **BlockSmith Console for Canton**: local web UI showing topology status, node health summary, and "next actions" on common failures
  - **Connection artifact export**: export endpoints/ports/hostnames and operator notes into a single JSON file
  - Versioned Local-dev template (Docker Compose) with a reference topology
  - Documentation: "operator quickstart" and troubleshooting guide
  - CI for releases and reproducible artifacts

### Milestone 2: Observability + console expansion + diagnostics

- **Estimated Delivery:** ~4–5 weeks after Milestone 1
- **Focus:** Full observability bundle, expanded web UI, and diagnostics tooling
- **Deliverables / Value Metrics:**
  - `blocksmith-canton obs up|down` to run the observability bundle
  - Prebuilt dashboards + basic alert rules for the reference topology
  - **BlockSmith Console for Canton (expanded)**:
    - Topology/connectivity graph with actionable guidance
    - Health drill-down (link to failing component checks)
    - Deep links to relevant Grafana dashboards/log views
    - Auth/JWT checklist page + basic validations
    - Package visibility page (where exposed)
  - `blocksmith-canton collect-diagnostics`: gather logs, metrics snapshots, and component diagnostics exports into a single archive suitable for issue reports (where supported by components such as PQS)
  - `blocksmith-canton health`: unified health view (gRPC/HTTP health + operator-friendly summary)
  - `blocksmith-canton logs capture`: standardized log capture with optional `lnav` bootstrap for trace-id and component filtering

### Milestone 3: Upgrade planning + hardening + adoption package

- **Estimated Delivery:** ~4–6 weeks after Milestone 2
- **Focus:** Upgrade and migration assistant, expanded diagnostics, and external pilot onboarding
- **Deliverables / Value Metrics:**
  - `blocksmith-canton upgrade plan/preflight` (guarded workflows)
  - Version detection + compatibility matrix + "known pitfalls" playbooks
  - Staging profile + smoke-test script for upgrades
  - **Upgrade Wizard (in the BlockSmith Console for Canton)**:
    - Detects current node versions and protocol versions where exposed via health/status surfaces
    - Generates an operator runbook aligned with Canton's documented upgrade flow (backup → config parse with `--manual-start` → `db.migrate` when needed → reconnect/ping)
    - Generates copy/paste-ready Canton console scripts for the safest verifications (e.g., `health.status`, `health.dump`, `health.ping`, `synchronizers.list_connected`)
    - Provides protocol-upgrade guidance (plan-only) that reflects Canton's constraints: protocol upgrades require a new synchronizer and participant migration (no in-place protocol upgrade for a synchronizer)
  - `blocksmith-canton daml check`: SDK/runtime consistency verification and guided "repair" workflow for common local SDK corruption scenarios
  - `blocksmith-canton compat report`: compatibility report (node version, protocol version, client API expectations) for change management and approvals
  - Expanded doctor rules and dashboards based on pilot feedback
  - Adoption package: onboarding docs, runbooks, and sample CI checks
  - Stable versioning and a published roadmap
  - At least 2 pilot teams/operators (external or partner teams) complete documented onboarding and provide actionable feedback/issues

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone
- Demonstrated functionality or operational readiness
- Documentation and knowledge transfer provided
- Alignment with stated value metrics

**Milestone 1 — specific criteria:**

- A fresh machine (Docker installed) can bring up the reference topology and reach "healthy" status in a deterministic way.
- `status` clearly indicates each node/service as Healthy/Unhealthy with an actionable reason.
- `doctor` detects at least 10 common setup/connectivity failures with clear remediation steps.
- The tool can generate/validate host-based routing prerequisites for local setups (where required by the topology), and can "reset" cleanly to remove stale volumes when troubleshooting calls for it (mirroring common guidance in operational docs).

**Milestone 2 — specific criteria:**

- With one command, an operator can open dashboards and verify "connected + healthy" without tailing logs.
- Topology view reflects current health/connectivity indicators with short periodic refresh and suggests next actions on failure.
- Diagnostics command produces a single archive that materially improves bug reports (includes timestamps, versions, and the key health signals).

**Milestone 3 — specific criteria:**

- Given a supported source→target upgrade pair, the tool generates an upgrade plan and preflight checks catch misconfigurations before changes are applied.
- Upgrade preflight produces a clear checklist and documented rollback guidance (tool-generated runbook).
- Protocol upgrade plan includes the concrete documented steps and prerequisites (e.g., enable repair commands, idle participants, disconnect/reconnect, and run a migration command) without executing them automatically.
- At least 2 pilot teams/operators (external or partner teams) complete documented onboarding and provide actionable feedback/issues.

---

## Funding

**Total Funding Request:** $98,000 USD equivalent in Canton Coin (CC), milestone-based

Funding on the Development Fund is denominated in **Canton Coin (CC)**. The budget below is a **USD-equivalent** to make the request concrete; milestone payments would be paid in CC using an agreed conversion method at the time of payment (e.g., a spot or trailing-average CC/USD rate agreed with Tech & Ops).

**Team & cost assumptions**

- **Tech lead**: 0.25 FTE for ~14 weeks (architecture, delivery, code review, integrations, stakeholder coordination)
- **Developers**: 2.0 FTE for ~14 weeks (CLI + backend services + UI implementation)
- **DevRel / technical writing**: included in the tech lead allocation (docs owned by the team; no separate FTE assumed)
- **Fully-loaded rates**: Tech lead: $14,000/month · Developer: $11,000/month
- **Non-labor**: $4,000 total (CI minutes, small test environments, design assets, incidentals)
- **Contingency**: 5% for schedule risk and unknowns

> Scope note: this budget focuses the grant deliverables on (1) a golden-path local-dev topology, (2) the BlockSmith Console for Canton web UI for topology/connectivity + health, (3) diagnostics capture, and (4) upgrade planning + preflight checks. Team-dev Helm templates and any "Tenderly-like" stretch features are deferred to post-grant work.

**Budget summary (USD-equivalent)**

- Tech lead: 3.5 months × $14,000 × 0.25 FTE = **$12,250**
- Developers: 3.5 months × $11,000 × 2 FTE = **$77,000**
- Labor subtotal: **$89,250**
- Non-labor: **$4,000**
- Contingency (5%): **$4,750**
- **Total: $98,000 USD equivalent in CC**

### Payment Breakdown by Milestone

- Milestone 1 — Golden-path bootstrap + console foundation: **$35,000 in $CC** upon committee acceptance
- Milestone 2 — Observability + console expansion + diagnostics: **$35,000 in $CC** upon committee acceptance
- Milestone 3 — Upgrade planning + hardening + adoption package: **$28,000 in $CC** upon final release and acceptance

### Volatility Stipulation

The project duration is **under 6 months** (~14 weeks). Should the project timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility.

---

## Co-Marketing

Upon release, 57blocks will collaborate with the Canton Foundation on:

- Announcement coordination for each major milestone release
- A technical blog post or case study covering how BlockSmith for Canton addresses the top DevEx pain points identified in the 2026 survey
- Developer and ecosystem promotion (e.g., presentation at a Canton community call, forum posts, and tooling showcase)
- Feedback loops with pilot teams to validate adoption and publish usage outcomes

---

## Motivation

### Problem: environment setup & node operations are Canton's highest-friction area

The Canton Foundation's 2026 DevEx survey highlights that **environment setup & node operations** are the longest-to-get-right task for many developers. It also repeatedly calls out the need for **one-click visual dashboards** to validate node handshakes (Sequencer/Mediator/Participant) without relying on complex terminal commands, plus broader **observability & monitoring** as a high-consensus priority ([survey analysis](https://discuss.daml.com/t/canton-network-developer-experience-and-tooling-survey-analysis-2026/8412)).

For teams used to EVM ecosystems, there is an expectation of reliable "golden path" node deployment templates, standardized metrics + dashboards + alerts (and a usable UI, not only CLI), and predictable upgrade/migration playbooks. Today, deploying a Canton topology, connecting correctly, keeping it healthy, and migrating across version changes (including Daml upgrades) often requires teams to become infrastructure specialists before they can ship product.

A concrete example is the Quickstart DevNet workflow, which includes steps like VPN connectivity, managing host-based routing (`/etc/hosts` + nginx virtual hosting), retrieving network "migration id" and matching versions, generating short-lived onboarding secrets, and passing the right flags to startup scripts — none of which are "product work", but all of which are required to get a node connected and stable ([Deploy Quickstart to DevNet](https://docs.digitalasset.com/build/3.3/quickstart/operate/deploy-quickstart-to-devnet.html)).

### Specific operator difficulties observed in official documentation

**Environment + orchestration friction**

- **Docker resources / unhealthy containers**: Quickstart highlights that LocalNet commonly becomes "unhealthy" due to insufficient Docker memory and recommends allocating ≥ 8GB and sometimes disabling observability to fit smaller machines ([CNQS FAQ](https://docs.digitalasset.com/build/3.3/quickstart/troubleshoot/cnqs-faq.html)).
- **Dependency management complexity (direnv/nix/JVM)**: Quickstart uses `direnv`, `nix`, and Docker Compose, and the FAQ calls out corporate proxy / TLS certificate issues (Nix SSL certs, JVM trust stores) that can block setup in enterprise environments ([CNQS FAQ](https://docs.digitalasset.com/build/3.3/quickstart/troubleshoot/cnqs-faq.html)).
- **Stale state + "reset" runbooks**: Docs recommend sequences like `make stop`, `make clean-all`, or `docker compose down -v` to clear stale containers/volumes and recover from unhealthy states ([CNQS FAQ](https://docs.digitalasset.com/build/3.3/quickstart/troubleshoot/cnqs-faq.html); [Deploy Quickstart to DevNet](https://docs.digitalasset.com/build/3.3/quickstart/operate/deploy-quickstart-to-devnet.html)).

**Versioning, upgrades, and migrations**

- **Daml SDK / runtime version drift**: FAQ highlights that the Daml SDK version is pinned via environment variables (e.g., `DAML_RUNTIME_VERSION`) and that interrupted installs can corrupt SDK snapshots and require manual cleanup ([CNQS FAQ](https://docs.digitalasset.com/build/3.3/quickstart/troubleshoot/cnqs-faq.html)).
- **Database migrations and upgrade sequencing**: Canton console docs note that persistent nodes require explicit database migrations (`db.migrate`) when upgrading, that `migrate-and-start` can be enabled, and that data continuity is only guaranteed across minor/patch updates ([Canton Console](https://docs.digitalasset.com/operate/3.3/howtos/operate/console/console.html)).
- **Client/API breaking changes across versions**: The gRPC Ledger API migration guide documents concrete breakpoints (e.g., `domain`→`synchronizer`, `application_id`→`user_id`, event identifier changes), which are easy to miss during upgrades ([gRPC Ledger API Migration Guide](https://docs.digitalasset.com/build/3.3/reference/lapi-migration-guide.html)).

**Monitoring, diagnostics, and "what is healthy?"**

- **Multiple health surfaces**: Participant health is exposed via gRPC health checks, optional HTTP health endpoints, and richer console/admin status (`health.status`) with component-level details ([Participant Node Health](https://docs.digitalasset.com/operate/3.3/howtos/observe/health.html)).
- **Health dumps are essential for troubleshooting**: Docs describe `health.dump()` producing a ZIP with sanitized config, logs extract, metrics snapshot, and thread dumps, and note this is commonly needed when troubleshooting or working with support ([Participant Node Health](https://docs.digitalasset.com/operate/3.3/howtos/observe/health.html)).
- **Log analysis complexity**: Quickstart recommends capturing container logs (`make capture-logs`) and using `lnav` with a Canton-specific log format config to filter by component, errors, and OpenTelemetry trace IDs across services ([lnav guide](https://docs.digitalasset.com/build/3.5/quickstart/operate/lnav-in-cn.html); [CNQS FAQ](https://docs.digitalasset.com/build/3.3/quickstart/troubleshoot/cnqs-faq.html)).

### How BlockSmith for Canton directly addresses the survey's top pain points

- **Environment setup & node operations (highest friction)**: Golden-path local topology (`docker compose`) + deterministic `preflight`, `doctor`, and safe `reset` flows. Localhost UI (BlockSmith Console for Canton) that shows "what's running, what's unhealthy, and what to do next". Grounded in documented operational runbooks and failure modes (e.g., resource constraints, stale volumes) ([CNQS FAQ](https://docs.digitalasset.com/build/3.3/quickstart/troubleshoot/cnqs-faq.html)).
- **"One-click visual dashboards" for operators**: BlockSmith Console for Canton provides topology/connectivity view + health drill-down, and deep-links into Grafana dashboards where enabled. Handshake-specific indicators are shown where exposed by health/status surfaces (avoids over-promising topology introspection everywhere) ([Participant Node Health](https://docs.digitalasset.com/operate/3.3/howtos/observe/health.html)).
- **Observability & monitoring (broad consensus priority)**: One-command observability bundle for local-dev (Prometheus + Grafana), plus "collect diagnostics" archives for reproducible bug reports. PQS metrics integration aligns with documented OTel/Prometheus approaches where PQS is part of the topology ([PQS Observe](https://docs.digitalasset.com/build/3.3/component-howtos/pqs/observe.html)).
- **Integration friction ("opaque discovery", repeated JWT/auth hurdles)**: Connection artifact export (single JSON) so app teams/operators don't reverse-engineer endpoints/ports/hostnames. Auth/JWT checklist UI: guidance + validation for common OIDC/JWT setups (reachability and configuration sanity checks), without becoming an identity platform. Package visibility (where exposed): best-effort listing of installed packages/DARs when a supported API is available; otherwise, clear guidance on what to enable.
- **Upgrades and migrations (Canton + Daml)**: Upgrade Wizard (plan/preflight) generates runbooks aligned with the official upgrade flow (config parse with `--manual-start`, `db.migrate()` when needed, reconnect/ping verification). Protocol upgrades are supported as runbook/script generation only (no unsafe automation), matching Canton's constraint that synchronizer protocol upgrades require deploying a new synchronizer and migrating participants ([Upgrade To a New Release](https://docs.digitalasset.com/operate/3.3/howtos/upgrade/index.html)).

### Why this matters for Canton specifically

1. **Canton's developer base is 83% TradFi or hybrid.** These teams have a compliance-conscious, uptime-critical mindset. They need hardened tooling that bridges traditional finance workflows with on-chain infrastructure — not bespoke tribal knowledge spread across docs.
2. **The survey is unambiguous.** Environment setup & node operations top the friction list, and visual dashboards / observability are high-consensus asks. This is not speculative — it is a direct response to reported needs.
3. **Multi-chain onboarding expertise is essential.** Teams moving from EVM to Canton face a paradigm shift (global state → need-to-know privacy, party-based identity). Reducing the infrastructure overhead lets them focus on that paradigm shift, rather than fighting the operational stack first.
4. **An open-source common good raises all boats.** All operators — new teams, existing participants, integrators — benefit from a shared baseline of deployment templates, runbooks, and dashboards. This is infrastructure the ecosystem cannot afford to re-create individually.

---

## Rationale

### Why 57blocks is the right team to deliver this

57blocks has already shipped **BlockSmith**, a developer/operator toolchain for Stellar Soroban that unifies local node lifecycle management (`start/stop/reset`) into a deterministic workflow, one test suite runnable against both in-memory and real-node environments, and operational feedback loops like resource/limit measurement and developer-friendly outputs ([BlockSmith](https://www.blocksmith.co/)).

BlockSmith emerged from the same insight driving this proposal: developers on newer chains are forced to become infrastructure specialists before they can build product. The toolchain was funded through multiple **Stellar Community Fund grants** (SCF #27, #29, #31) and evolved into a suite of four developer tools — a Timelock Smart Contract framework, an AutoAction DevTool for scheduled/event-driven smart contract execution, and a Resource Usage monitor that connects directly to localnet with alerts on overuse. This grant-funded-to-sustained-tooling arc is the exact model intended for Canton.

**Deep Web3 infrastructure expertise across 20+ DeFi categories**

57Blocks has been building and investing in Web3 since 2018. With 200+ product designers, AI experts, and engineers across six global offices (San Francisco, Seattle, Bogotá, Medellín, Wrocław, and three cities in China), the team brings full-stack depth: protocol design, smart contract development, chain infrastructure, backend services, frontend dApps, testing frameworks, CI/CD pipelines, and 24/7 monitoring.

Trusted by 20+ protocols, we have built and invested across every major layer of the Web3 stack — from L1 infrastructure (Ethereum, Solana, Stellar, Canton, Cosmos, Sui) through DeFi protocols, wallets, compliance tools, cross-chain bridges, analytics platforms, and RWA applications. Our Web3 tech stack directly overlaps with BlockSmith for Canton's requirements: Docker, Kubernetes, Prometheus/Grafana monitoring, Daml, Go, Node.js, Java, Python, React, and deep experience with Hardhat, Foundry, and Soroban development environments.

We have a trained engineering team and hands-on experience designing and building on Canton using Daml for a commercial, production-deployed solution.

**Directly relevant case studies**

**Huma Finance — Private Credit Protocol ($10.2B+ financed, 0% default)**
We co-designed and implemented Huma's smart contract architecture from inception, led the development of V1/V2 Ethereum contracts, and subsequently drove the full migration to Solana. This engagement is relevant because Huma is a TradFi/DeFi hybrid — the same profile as 83% of Canton's developer base — and required building production-grade infrastructure that bridges traditional finance workflows with on-chain settlement. Our pod structure (2 smart contract engineers, 1 tokenomics advisor, 1 frontend architect) mirrors the focused team we'll deploy for BlockSmith for Canton.

**Rain — Web3 Stablecoins Payments Platform**
For Rain, we built the blockchain layer from scratch: smart contracts for settlement and liquidity, cross-chain interoperability, on/off-chain reconciliation, and secure upgrade-ready deployments. The technical parallels to BlockSmith for Canton are strong — we solved multi-chain system abstraction (refactoring a tightly-coupled EVM system to support Solana and Stellar), asynchronous transaction throughput with concurrent processing, idempotency and concurrency control, and automated transaction recovery with fault-tolerant event processing. These are exactly the kinds of operational resilience patterns that Canton node operators need.

**Undisclosed Stablecoin Issuer — Stablecoin Platform Chain Expansion**
57Blocks serves as the customer's strategic engineering partner for expanding their fiat-backed stablecoin platform across 20+ chains. One of four workstreams is explicitly "Delivery Excellence & Tooling" — streamlining integrations, standardizing developer interfaces, enabling faster onboarding, and building more scalable, maintainable platform evolution. This is the same mission as BlockSmith for Canton, applied to a different chain ecosystem.

**LI.FI — Multi-Chain DEX Aggregation (50+ L2 chains)**
We led development of LI.FI's DEX aggregator service, building scalable architecture to integrate DEXes across 50+ L2 chains with optimized swap routing algorithms. This engagement demonstrates our ability to build cross-chain infrastructure at scale — adapting to each chain's idiosyncrasies while maintaining a unified developer and operator experience.

**Why this approach is preferred over alternatives**

1. **We've done this before.** BlockSmith for Stellar proves we can identify operator pain points in a non-EVM ecosystem, translate them into opinionated tooling, secure ecosystem grant funding, and ship iteratively. The pattern is identical.
2. **Enterprise/TradFi DNA.** Our deepest engagements — Huma (private credit), Rain (stablecoin payments), Brale (fiat-backed stablecoin issuance), Paxos (cross-chain token issuance) — are all regulated financial infrastructure. We understand the compliance-conscious, uptime-critical mindset these teams bring to Canton.
3. **Multi-chain onboarding expertise.** We have repeatedly helped teams expand from EVM to non-EVM chains (Rain: EVM → Solana + Stellar; Undisclosed Stablecoin Issuer: 20+ chains; Huma: Ethereum → Solana & Stellar). This gives us firsthand understanding of the paradigm-shift friction Canton developers report.
4. **Full-stack operator tooling capability.** BlockSmith for Canton requires CLI tooling, web dashboards, Docker orchestration, Prometheus/Grafana integration, and upgrade automation. Our team runs this exact stack in production across multiple clients — this is applying proven patterns to a new domain, not R&D.
5. **Sustained delivery at scale.** Top client retention rate, 97% of clients report higher delivery quality, and a 200+ person team means we can commit a dedicated pod to BlockSmith for Canton without straining other obligations.

## **Team Background**

### Core team

Diogo Silveira Mendonça, Ph.D., PMP (Product & Engineering Lead): Full-stack engineer and Web3 specialist with over 20 years of experience in software engineering and around 7 years in the Web3 space, with leadership experience delivering blockchain related projects. Currently Head of Web3 LATAM at 57Blocks and a Canton / Daml Certified professional.

Implementation Team: 57Blocks will allocate experienced engineers with knowledge of and experience with Canton as needed to execute the grant milestones under Diogo’s technical direction and product leadership. The company currently has engineers certified in Canton / Daml skillset, hands-on with Canton production deployments, and we are actively expanding our team of Canton professionals.

## Contact

For questions, feedback, or to coordinate review please reach out:

Diogo Silveira Mendonça, Head of Web3 LATAM - diogo.silveira@57blocks.com  
Kamil Krupa, Head of Web3 BU - kamil@57blocks.com  

## Sponsorship

This proposal is sponsored by the Canton Foundation.

---

## References

- Canton Development Fund process: https://github.com/canton-foundation/canton-dev-fund
- 2026 Canton DevEx survey analysis: https://discuss.daml.com/t/canton-network-developer-experience-and-tooling-survey-analysis-2026/8412
- BlockSmith (57blocks): https://www.blocksmith.co/
- Deploy Quickstart to DevNet (representative operator workflow): https://docs.digitalasset.com/build/3.3/quickstart/operate/deploy-quickstart-to-devnet.html
- PQS observability primitives (metrics/logs/diagnostics): https://docs.digitalasset.com/build/3.3/component-howtos/pqs/observe.html
- Upgrade to a new release (operator upgrade model): https://docs.digitalasset.com/operate/3.3/howtos/upgrade/index.html
- CN App Quickstart FAQ (resource constraints, resets, ops gotchas): https://docs.digitalasset.com/build/3.3/quickstart/troubleshoot/cnqs-faq.html
- Participant node health checks and health dumps: https://docs.digitalasset.com/operate/3.3/howtos/observe/health.html
- Canton console operations (remote admin, db.migrate/migrate-and-start): https://docs.digitalasset.com/operate/3.3/howtos/operate/console/console.html
- Log debugging with lnav (trace-id correlation, capture logs): https://docs.digitalasset.com/build/3.5/quickstart/operate/lnav-in-cn.html
- gRPC Ledger API migration guide (3.2→3.3 breaking changes): https://docs.digitalasset.com/build/3.3/reference/lapi-migration-guide.html
