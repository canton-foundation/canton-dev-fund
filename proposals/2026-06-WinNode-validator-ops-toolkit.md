# Development Fund Proposal: Canton Validator Operations & Observability Toolkit (COOT)

**Author:** WinNode — Canton Network validator & infrastructure operator
**Status:** Draft
**Created:** 2026-06-09
**Label:** node-deployment-operations
**Champion:** _Seeking Champion from the **Node Deployment & Operations** SIG._ Candidate reviewers in that SIG include operators well placed to evaluate this work — e.g. Andrew Pohl (Liquify), Caleb Bolden / Marijus Kasperavicius (Blockdaemon), Jeremy Alons (Cumberland), Lucas Naundorf (FCS), Stanislav German-Evtushenko (SBI Security Solutions), Vinh Nguyễn (Five North), and Zhe Li (Gateway.FM). See Notes for Reviewers.

---

## Abstract

The Canton Validator Operations & Observability Toolkit (COOT) is an open-source, vendor-neutral operations stack for anyone running a Canton validator, participant, or super-validator (SV) node. It packages the operational concerns every node operator currently rebuilds in isolation — metrics collection, curated dashboards, alerting, backup/restore automation, pruning, and disaster-recovery runbooks — into a single, reproducible, documented toolkit released under Apache-2.0.

Canton is scaling rapidly as institutional participants (e.g. tokenization and settlement platforms built on Canton/Daml) onboard. Each new node operator today reinvents the same observability and operations layer: writing Prometheus scrape configs, building Grafana dashboards from scratch, guessing alert thresholds, and assembling backup and recovery procedures with no shared reference. COOT removes this duplicated effort and raises the operational reliability baseline of the whole network.

WinNode operates production validator infrastructure across 28+ networks and runs live Canton infrastructure today. This proposal turns that hands-on operational experience into a reusable public good for every Canton operator.

This proposal requests **240,000 CC** across three milestones over a 9-week period (3–3–3 structure).

### Evidence of Technical Capability (Working Prototype)

This is not a description-only proposal. A working prototype of the Milestone 1 surface already exists and is runnable today:

| Evidence | What it demonstrates |
| --- | --- |
| One-command observability stack (`docker compose up`) | Prometheus + Alertmanager + Grafana + a Canton metrics exporter, wired and provisioned-as-code |
| `canton_exporter` (Python) | Read-only exporter surfacing derived signals (ledger-API reachability, participant DB size and growth rate, metrics-endpoint reachability) as Prometheus metrics |
| Alerting rule library | Documented Prometheus rules with rationale for node-unreachable, ledger-API-down, runaway DB growth, and exporter-stall conditions |
| "Canton Node Health" Grafana dashboard | Provisioned-as-code dashboard populated from exporter metrics |
| `healthcheck.py`, `backup.sh`, `restore.sh` | Operational-readiness report and consistent backup + checksum-verified restore (Milestone 2 preview) |
| Helm chart skeleton | Intended Kubernetes packaging shape (Milestone 3 preview) |

The prototype is intentionally read-only and additive: it only consumes endpoints a Canton node already exposes and never modifies node binaries, the protocol, ledger state, reward logic, or traffic accounting. The funded milestones harden and broaden this prototype into production-grade tooling with full validator/SV coverage, tested DR, and Kubernetes packaging. *(The public repository URL will be added here on submission.)*

---

## Specification

### 1. Objective

**Problem:** Point solutions exist, but no *cohesive, maintained, end-to-end* operations standard does. There are individual community Grafana dashboards (e.g. the public "Canton Validator Monitoring" dashboard) and official Splice/Digital Asset backup and disaster-recovery documentation. What is missing is a single, version-pinned toolkit that ties these fragments together — exporter, curated dashboards, an alerting rule library, backup/restore *automation*, pruning, tested DR runbooks, and Kubernetes packaging — maintained against successive Canton/Splice releases. Today each operator stitches these pieces together independently and re-derives alert thresholds and recovery procedures from scratch. This duplicated effort raises the barrier to running a reliable node, produces inconsistent operational quality across the network, and increases the risk of outages, data loss, and missed protocol upgrades as the validator set grows.

**Outcome:** A single, well-documented, reproducible toolkit that a new operator can deploy to get production-grade observability and operational tooling for a Canton validator/participant/SV node in hours instead of weeks — improving the reliability and resilience baseline of the entire Canton Network.

This proposal has a single objective: **deliver shared, open-source operations and observability tooling for Canton node operators.** It deliberately excludes wallet, dApp, or protocol-layer work, which are separate concerns addressed by other proposals.

### 2. Implementation Mechanics

COOT operates entirely at the node-operations layer. It does not modify the Canton protocol, the participant/sequencer/mediator binaries, or any ledger semantics. It consumes the metrics, health endpoints, and administrative APIs that Canton nodes already expose, and packages operational best practices around them.

**Components:**

- **Metrics & Exporters.** Pre-configured scrape targets for the metrics Canton nodes already expose (participant, sequencer, mediator, and SV-app processes), plus a thin exporter for derived operational signals not directly exposed (e.g. ledger lag, DB growth rate, pruning backlog, traffic balance trends). Built on the standard Prometheus model so it composes with existing operator stacks.
- **Curated Grafana Dashboards.** A versioned dashboard library covering node health (uptime, sync status, ledger lag), resource pressure (CPU/memory/disk, Postgres growth), traffic and cost trends, sequencer/mediator throughput, and SV-specific views. Dashboards are provisioned as code (JSON + provisioning configs), not click-built.
- **Alerting Rule Library.** A documented set of Prometheus/Alertmanager rules with rationale and recommended thresholds for the conditions that actually cause Canton incidents (node falling behind, disk exhaustion, pruning failure, certificate/key expiry, traffic exhaustion, upgrade-window readiness). Operators can adopt as-is or tune.
- **Operations Automation.** Scripted, idempotent procedures for participant database backup and restore (including key material handling guidance), automated pruning helpers aligned to safe pruning windows, and a health-check CLI that produces a single pass/fail operational readiness report.
- **Disaster-Recovery Runbooks.** Step-by-step, tested recovery runbooks (node loss, DB corruption, region failover, upgrade rollback) written from real operational experience.
- **Packaging.** Everything ships as a Docker Compose bundle for single-node/dev use and a Helm chart for Kubernetes operators, with a quick-start that stands up the full observability stack against an existing node.

**Operational approach:** All artifacts are version-pinned to documented Canton/Splice releases, validated against DevNet and a live node, and published with reproducible build/run instructions. The toolkit is modular — operators can adopt only the dashboards, only the alerting, or the full stack.

### 3. Architectural Alignment

COOT aligns with Canton's priority area of **node deployment and operations** and supports **global synchronizer scaling** by making it cheaper and safer to run reliable nodes as the validator/SV set grows. It reinforces the network's decentralization goals: lowering the operational barrier to running a node increases the number of independent, well-run operators.

Relevant standards/components consumed (read-only, no modification):

- **Splice** reference applications and validator/SV node topology — COOT observes and operates these nodes; it does not fork or alter them.
- **CIP-0104** traffic/cost fields — surfaced as operational dashboards (traffic balance, cost trends) to help operators avoid traffic exhaustion. No modification of traffic accounting or reward logic.
- **Logical Synchronizer Upgrades** — the upgrade-readiness checks and rollback runbooks are designed to align with the synchronizer upgrade process, helping operators stay upgrade-ready.
- **Standard Canton Validator infrastructure suite** — COOT's Helm chart is designed to integrate as an opt-in deployment alongside the standard validator infrastructure suite (the same pattern other ecosystem components such as the validator indexer/PQS use), rather than as a separate parallel stack. Subject to confirmation with the Node Deployment & Operations SIG, COOT targets release under the Canton Foundation GitHub organization so it sits alongside existing Splice components as shared network infrastructure.

COOT does not participate in consensus, reward distribution, traffic accounting, or any protocol-level logic.

### 4. Backward Compatibility

COOT introduces no protocol changes and modifies no node binaries. It is additive operational tooling, version-pinned to upstream Canton/Splice releases.

*No backward compatibility impact.*

### 5. Prior Art & Differentiation

COOT deliberately builds on what already exists rather than reinventing it. The relevant prior art and how COOT extends it:

| Existing prior art | What it covers | What COOT adds |
| --- | --- | --- |
| Public community Grafana dashboards (e.g. "Canton Validator Monitoring") | Visualization of node metrics in a single dashboard | A *maintained, version-pinned* dashboard library spanning validator/participant/sequencer/mediator **and** SV/multi-synchronizer views, provisioned as code — plus the missing alerting, automation, and DR layers around it |
| Official Splice / Digital Asset backup & disaster-recovery docs | Written procedures for backup and restore | Executable, idempotent backup/restore **automation** with checksum-verified restore, a pass/fail readiness CLI, and tested DR runbooks derived from those procedures |
| Built-in Canton node metrics endpoints | Raw Prometheus metrics | A derived-metrics exporter for operational signals not exposed directly (ledger lag, DB growth, pruning backlog, traffic-balance trends) |
| Per-operator private ops stacks | Each operator's own glue | One cohesive, open, reusable bundle (Compose + Helm) maintained against successive Canton/Splice releases |

Where an existing community dashboard is suitable, COOT references and incorporates it rather than duplicating it. The proposal's value is the **cohesive, maintained, end-to-end toolkit** — exporter + dashboards + alerting + automation + DR + packaging, kept current across releases — which no single existing artifact provides today.

---

## Adoption & Success Metrics

While milestone acceptance is tied to concrete open-source deliverables (public repos, Helm chart, dashboards, runbooks, working DevNet/live-node demonstration), the following ecosystem-health signals are tracked alongside delivery:

- Number of independent Canton operators deploying COOT (target: adoption by multiple validators/SVs beyond WinNode within the grant period)
- Reduction in time-to-production-observability for a new operator (target: hours vs the current multi-week effort)
- Community contributions (issues, PRs, dashboard/alert additions) indicating the toolkit becomes a shared maintained asset
- Coverage of operator node types (validator, participant, SV) by the dashboard and alerting library

The portion of the ecosystem that benefits is high: **every Canton node operator** has these operational needs, and the toolkit is directly reusable by all of them.

---

## Milestones and Deliverables

Each milestone is approximately 3 weeks of engineering effort, balanced across implementation, validation against a live node, and documentation.

### Milestone 1 — Observability Pack
- **Estimated Delivery:** End of Week 3
- **Focus:** Metrics, dashboards, and alerting for validator/participant/sequencer/mediator nodes.
- **Deliverables / Value Metrics:**
  - Prometheus scrape configuration + derived-metrics exporter (ledger lag, DB growth, pruning backlog, traffic balance) published to GitHub under Apache-2.0
  - Curated Grafana dashboard library (node health, resource pressure, traffic/cost trends, throughput) provisioned as code
  - Alerting rule library (Prometheus/Alertmanager) with documented thresholds and rationale
  - Docker Compose quick-start that stands up the full observability stack against an existing node
  - Documentation + a working demonstration against a live DevNet node

### Milestone 2 — Operations Automation & Disaster Recovery
- **Estimated Delivery:** End of Week 6
- **Focus:** Backup/restore, pruning, health checks, and recovery runbooks.
- **Deliverables / Value Metrics:**
  - Idempotent participant DB backup & restore automation with key-material handling guidance
  - Automated pruning helper aligned to safe pruning windows
  - Health-check CLI producing a single operational readiness report (pass/fail with remediation hints)
  - Tested disaster-recovery runbooks (node loss, DB corruption, region failover, upgrade rollback)
  - Documented restore drill executed and reproduced on a clean environment

### Milestone 3 — Kubernetes Packaging, SV/Multi-Synchronizer Support & Hardening
- **Estimated Delivery:** End of Week 9
- **Focus:** Production packaging, super-validator and multi-synchronizer coverage, security hardening, and knowledge transfer.
- **Deliverables / Value Metrics:**
  - Helm chart deploying the full COOT stack on Kubernetes with reproducible install instructions
  - Super-validator-specific dashboards and alerts; multi-synchronizer operational views
  - Upgrade-readiness checks aligned with the Logical Synchronizer Upgrade process
  - Security & operations hardening checklist (key custody, network exposure, least-privilege, backup verification)
  - Capacity-planning guide and a public reference deployment + an operator-facing workshop/walkthrough (recorded)

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Each milestone's deliverables published open-source on GitHub under Apache-2.0 with versioned releases and reproducible build/run instructions
- Demonstrated operational readiness: the observability stack and operations tooling shown working against a live Canton node (DevNet and/or MainNet operator node)
- A documented, reproduced disaster-recovery drill (Milestone 2) and a successful Kubernetes deployment (Milestone 3)
- Documentation and knowledge transfer provided, including the recorded operator workshop
- Ecosystem value demonstrated through adoption by at least one independent Canton operator beyond WinNode by the end of the grant, with the toolkit positioned for broader operator adoption

Acceptance is based on value to the ecosystem (reusable, adopted operations tooling that raises the network's reliability baseline), not solely on artifact delivery.

---

## Funding

**Total Funding Request: 240,000 CC**

### Payment Breakdown by Milestone
- Milestone 1 (Observability Pack): 80,000 CC upon committee acceptance
- Milestone 2 (Operations Automation & DR): 80,000 CC upon committee acceptance
- Milestone 3 (K8s Packaging, SV/Multi-Sync & Hardening): 80,000 CC upon final release and acceptance

**Total projected duration:** 9 weeks (3–3–3 structure).

### Volatility Stipulation
The project duration is under 6 months. Should the timeline extend beyond 6 months due to Committee-requested scope changes, remaining milestones will be renegotiated to account for USD/CC price volatility.

### Timeline Risk Management
- **SLA Penalty:** A 10% reduction in the respective milestone payment applies for every full month of delay beyond its estimated delivery date for reasons within WinNode's control. If any milestone is more than 3 full months delayed, the agreement terms will be revisited with the Tech & Ops Committee.
- **Acceleration Bonus:** Delivery of Milestone 3 more than one month ahead of schedule, with all acceptance criteria met, triggers a +10% bonus on the Milestone 3 payout.

---

## Co-Marketing

Upon release, WinNode will collaborate with the Foundation on:

- Announcement coordination for each milestone
- A technical blog / case study on operating reliable Canton nodes
- An open operator workshop and ongoing developer/operator promotion
- Publication of the reference deployment as a persistent, zero-friction demonstration of Canton node operations best practice

---

## Post-Grant Maintenance & Sustainability

COOT is released under Apache-2.0 and operated as a permanent public good.

- **Maintenance Owner:** WinNode remains primary maintainer.
- **Commitment Horizon:** Active maintenance for a minimum of 12 months following Milestone 3, with intent to continue as part of WinNode's ongoing Canton operations.
- **Funding Model:** Post-grant maintenance is self-funded through WinNode's operational budget; no additional ecosystem funding requested for maintenance.
- **Scope:** Compatibility updates aligned to new Canton/Splice releases, dashboard/alert additions, bug fixes, security patches, and community issue/PR triage.
- **Continuity:** All deliverables are Apache-2.0 and freely forkable; the project can continue through community operators without licensing or governance restrictions.

---

## Motivation

Canton adoption is accelerating with institutional participants onboarding tokenization and settlement workloads. Network resilience depends directly on the operational quality of its validators and super-validators. Today every operator rebuilds the same observability and operations layer from scratch, producing inconsistent reliability and unnecessary risk.

Roughly **100% of Canton node operators** face these operational needs, and COOT is directly reusable by all of them. By turning a leading multi-network operator's real production experience into shared open-source tooling, this proposal raises the reliability and resilience baseline of the entire network and lowers the barrier to running a well-operated node — directly strengthening Canton's decentralization and scaling goals.

---

## Rationale

The right approach is shared, open operational tooling rather than another per-operator private stack. Most ecosystem operators already use Prometheus/Grafana/Alertmanager and Kubernetes; COOT builds on these standard, widely-adopted tools rather than introducing a novel framework, so it composes with operators' existing stacks instead of replacing them.

This proposal deliberately extends and observes existing components (Canton/Splice node topology, CIP-0104 cost fields, the synchronizer upgrade process) rather than forking or modifying them — all artifacts are additive and version-pinned. WinNode is uniquely positioned to deliver this credibly, operating validator infrastructure across 28+ networks and running live Canton nodes today.

Alternatives considered:

- **Leaving operations tooling to each operator** — rejected, as it perpetuates duplicated effort and inconsistent reliability.
- **Relying on the existing point solutions** (a community Grafana dashboard plus written DA/Splice backup/DR docs) — rejected as *sufficient on their own*, but explicitly adopted as a foundation. A standalone dashboard has no alerting, automation, DR, or packaging around it; written DR docs are not executable or verifiable. COOT's contribution is to tie these into one cohesive, maintained toolkit and add the missing executable layers (exporter, alerting library, backup/restore automation with verification, tested runbooks, Helm packaging), kept current across Canton/Splice releases. The template's default of "extend what exists" is followed directly: COOT references and incorporates suitable prior art rather than rebuilding it.
- **A closed/proprietary operations product** — rejected, as it does not serve the ecosystem as a common good and would not be eligible for this fund.

An open-source, vendor-neutral toolkit that builds on existing prior art is the approach that maximizes shared ecosystem value.

---

## Notes for Reviewers

- **SIG alignment:** This proposal aligns with the **Node Deployment & Operations** SIG and is seeking a Champion from that group. We welcome an introduction via the dev-fund mailing list or the relevant SIG Slack channel.
- **Production track record (evidence):** WinNode operates validator infrastructure across 28+ networks and runs live Canton infrastructure (the Grofty wallet's backend). The Milestone 1 surface already exists as a runnable prototype (see Evidence of Technical Capability above); the funded work hardens and broadens it. We can share node details, uptime history, and the prototype repository on request.
- **Single objective:** COOT is scoped to node operations & observability only, and explicitly excludes wallet/dApp/protocol work, to keep milestones objectively verifiable.
- **Builds on prior art:** COOT references and incorporates existing community dashboards and official DA/Splice DR documentation rather than duplicating them (see Prior Art & Differentiation).
- **Open-source destination:** COOT is Apache-2.0 and, subject to SIG agreement, targets the Canton Foundation GitHub organization as shared network infrastructure.
