## Development Fund Proposal

**Author:** [Noders LLC](https://noders.team/)  
**Status:** Submitted  
**Created:** 2026-03-09

---

## Abstract

This proposal requests funding for **Canton Infrastructure Admin Console** — an open-source, production-grade UI layer over Canton CLI and node administration workflows. We already have a working MVP in daily use by our own operational team, covering account, user, rights, party, and validator management across our mainnet nodes and NaaS.

This proposal takes that MVP and turns it into a full-cycle operational platform for the Canton ecosystem: hardened day-2 node operations, DAR/contract lifecycle management with package collections, upgrade readiness tooling, operational health diagnostics, and privacy-aware monitoring. The result is a reusable open-source admin layer that any Canton operator, participant, or validator team can deploy and use without rebuilding common workflows from scratch.

**Total Funding Request: 1,370,000 CC** — of which **1,200,000 CC** funds Noders development work structured across four milestones, with nearly two-thirds (63%) of the development budget allocated to the later milestones that deliver the highest-value and highest-complexity features; and **170,000 CC** covers an independent security audit by Cure53 (22,100 EUR).

---

## Specification

### 1. Objective

**Problem:** Canton node and participant operations remain operationally heavy in ways that create real risk and friction for operator teams:

- Routine admin tasks — account provisioning, rights management, party registration, validator configuration — still depend on direct CLI usage and operator knowledge rather than safe, auditable interfaces.
- Contract/DAR lifecycle (upload, deploy, version tracking, collections management) is handled ad hoc, without standardized tooling.
- There is no consistent upgrade readiness or pre-upgrade check workflow: operators discover Canton/Daml version incompatibilities at deployment time.
- Node health diagnostics are CLI-only; monitoring node liveness and connectivity in network context is manual and error-prone.
- Monitoring is either absent or built separately for each team, with no Canton-aware risk model.
- Operational events (party creation, permission changes, DAR deployments) leave no structured audit trail without custom logging solutions.

There is also a broader ecosystem problem: every new Canton operator team rebuilds the same internal admin tooling from scratch. This represents duplicated effort, inconsistent safety properties, and a higher barrier to Canton adoption for infrastructure teams.

**Outcome:** A reusable, open-source Canton operations platform:

- UI-based management for the full administrative lifecycle (accounts, users, rights, parties, validators, DAR packages, external party onboarding);
- Operational intelligence: health diagnostics, upgrade readiness, guided write flows, audit logging;
- Privacy-aware monitoring and risk scoring, respecting Canton's sub-transaction privacy model;
- Security audit by an independent external auditor, with full remediation.

**Success looks like:**

- Operators can perform routine Canton node workflows through a safer, auditable interface without touching the CLI.
- Teams reduce reliance on custom internal scripts and manual CLI for participant and validator operations.
- Contract/DAR deployment is managed through a structured lifecycle tool rather than ad hoc commands.
- Operators know their node is ready for a Canton upgrade before they attempt it.
- Security-sensitive operations generate structured audit logs for compliance and incident response.
- A monitoring module detects key management anomalies and behavioral risk — without exposing private contract payloads.
- The tool is adopted by ≥3 independent Canton operator or participant teams outside Noders.

---

### 2. Production Evidence

This proposal is not speculative. Noders LLC is:

- **Infrastructure provider for 5+ years**; in Canton since summer 2025 as a validator and contributor.
- **ISO/IEC 27001:2022 certified** — operational security is a first-class concern.
- Already a recipient of **Canton Dev Fund grant #38** (Go DAML SDK, Go Wallet SDK, upstream Python DAZL contributions) — accepted and approved by the Tech & Ops Committee. That track record demonstrates both technical execution capability and commitment to delivering open-source ecosystem infrastructure.

The MVP underlying this proposal is already in daily use by our operational team for account/user/rights/party/validator management, including DAR upload, deployment, and package display organized by package name and ID — operators see exactly what is deployed on the node at a glance. The milestones below are an expansion of real infrastructure, not a greenfield build.

---

### 3. Implementation Mechanics

This proposal covers four workstreams that together produce a complete operational platform.

---

#### Workstream A — Core Node Administration UI (Hardening + Production-Grade)

**What it is**

A hardened, production-ready UI layer over Canton CLI and admin workflows, covering the full identity and operations lifecycle — including DAR package management, external Party ID onboarding, collections management, and transfer preapprovals.

**What is already delivered in MVP**
- Account management (add, remove, configure)
- User management
- Rights / permission management
- Party management
- Validator management and parameter configuration (including traffic purchase)
- DAR upload, deployment, and validation workflows
- DAR display grouped by ID and name

**What this milestone adds**
- Open-source packaging: clean repository structure, Docker/Helm deployment, setup documentation
- **External Party ID onboarding** — interface for onboarding parties from outside the organization (including multisig party patterns)
- RBAC with role definitions for operator, admin, and read-only personas (scoped to a single organization)
- **OIDC / Keycloak authentication** — production-grade SSO integration (scoped to a single organization's Keycloak realm)
- **Audit logging** as first-class: every identity, permission, party, and validator action produces a structured, queryable audit record
- **Multi-environment support** (DevNet / TestNet / MainNet) — manage multiple Canton environments from a single console
- **Guided write flows** for operationally sensitive actions (party creation, rights grants, validator parameter changes) — step-by-step confirmation dialog to reduce operator error
- **Transfer preapprovals** — Party ID management interface for configuring transfer pre-approval properties on Canton parties
- Identity backup and restore workflows
- **Package management**: DAR file collections, versioning, diff between versions, activate/deactivate workflows

**Why it matters**

These are the most common and most operationally risky Canton workflows. The combination of RBAC, OIDC, audit logging, guided confirmation flows, and structured package management transforms a useful utility into infrastructure-grade tooling that meets real compliance and operational safety requirements.

---

#### Workstream B — Operational Intelligence: Health Diagnostics, Upgrade Readiness, and Node Observability

**What it is**

A set of operational intelligence features that move the tool from reactive management to proactive operations.

**Planned scope**

**Node health diagnostics:**
- Integrated health monitor — node liveness and connectivity in network context (super-validator and synchronizer connections, ledger state)
- Alerting to supported notification channels (Slack, Telegram, email via SMTP, webhook)
- Continuous health status panel with configurable thresholds

**Upgrade readiness checker:**
- Pre-upgrade validation: check DAR dependencies and known compatibility requirements against the target Canton/Daml version
- Upgrade checklist with documented steps and automated precondition verification
- Detects incompatible packages and configuration gaps before they cause downtime

**Traffic and fee operational visibility:**
- Traffic and fee display — current traffic balance and available traffic parameters accessible via the admin API
- Fee estimation and actuals comparison

**Why it matters**

Upgrade incompatibilities are one of the most disruptive operational events for Canton teams. Knowing node liveness and connectivity status at a glance — without parsing CLI output — saves significant operator time and reduces incident response time.

---

#### Workstream C — Privacy-Aware Monitoring + Risk Scoring

**What it is**

A participant-local, privacy-preserving monitoring module that brings security and risk observability to Canton operations without violating Canton's sub-transaction privacy model — combined with an integrated API explorer that lets operators query Canton Admin API and Ledger API endpoints directly from the console UI.

**Planned scope**

*Key management and permission risk:*
- Detection of sudden capability grants to unverified users
- Permission anomaly alerting — structured notifications when admin-level changes occur on the node (unexpected new admin domains, rights grants to new actors)
- Alert routing to supported notification channels (Slack, Telegram, email, webhook)

*Alert schema:*
- Structured alert records with severity, entity identifiers, reasons, and timestamps

**Integrated API explorer:**
- Interactive browser for Canton Admin API and Ledger API endpoints — query the node directly from the console UI without external tooling
- Request builder with session-authenticated passthrough; structured response viewer with field descriptions
- Enables ad-hoc node state inspection when investigating monitoring alerts — see the alert and query the node, all in one workflow

**Why it matters**

No current open-source Canton tool provides a privacy-aware, Canton-native monitoring module. By integrating monitoring into the admin console, we give operators a unified operational platform: manage, deploy, diagnose, and monitor from a single tool — while maintaining the strict privacy guarantees that make Canton valuable.

---

#### Workstream D — Security Audit Remediation + Ecosystem Adoption

**What it is**

Full remediation of all critical and high findings from an independent external security audit of the admin console codebase — followed by production hardening and ecosystem adoption work.

**Audit scope** (performed by Cure53; audit fee of 170,000 CC is included in the total 1,370,000 CC funding request)
- Authentication and session management (OIDC/Keycloak integration, token handling)
- Authorization and RBAC enforcement at API and UI layers
- Audit logging integrity and tamper resistance
- Monitoring module: privacy guarantees, data handling, offset persistence
- DAR deployment flows: any code execution or deserialization risks

**Deliverables**
- Published audit scope document before audit starts
- Full audit report (published post-remediation)
- All critical and high findings remediated within 30 days of audit report delivery; documented rationale for accepted/deferred medium and low findings
- Patched release with changelog entries referencing the audit
- Post-audit remediation summary published in the repository

*Monitoring enhancement:*
- Configurable alert policies with threshold configuration and policy profiles
- Alert export formats: JSON + Prometheus-compatible metrics endpoint
- Documentation: alert configuration guide and policy profiles

*Production hardening:*
- Expanded test coverage: unit + integration tests for core workflows, audit logging integrity, monitoring privacy guarantees
- End-to-end operational reference: documented runbook for a full Canton node operational lifecycle using the console
- Upgrade playbook: documented procedure for updating the console with new Canton/Daml versions
- Performance and reliability hardening for multi-node / multi-environment deployments

*Ecosystem adoption:*
- Minimum 3 independent Canton operator or participant teams using the tool outside Noders (documented, with team confirmation)
- Workshop or technical walkthrough session for Canton ecosystem (HackCanton, Canton developer community)
- Technical blog post: "Canton node operations at scale with open-source tooling"
- Maintained issue tracker with defined response SLA (≤3 business days for critical issues)

---

### 4. Explicitly Out of Scope

The following are explicitly out of scope for this proposal:

- **Node provisioning from scratch** (0→healthy node): Noders assumes the node is already running.
- **Full blockchain explorer / ledger browser**: Noders does not provide transaction history browsing or smart contract state inspection beyond operational visibility.
- **Smart contract development tooling** (IDE integration, DAML compilation): this is developer tooling, not operator tooling.
- **Multi-chain/non-Canton deployments**: the tool is Canton-specific.
- **Full standalone security monitoring product**: the monitoring module is an operational dashboard, not a replacement for a dedicated SIEM or security monitoring platform.
- **REST API for external automation**: out of scope for this proposal; may be addressed in a future iteration.
- **Multi-organization / multi-realm management**: OIDC and RBAC are scoped to a single organization's Keycloak realm.
- **Auto top-up configuration**: Canton node auto top-up is configured at the node level and is not accessible via the admin API; display of current configuration is supported.

---

### 5. Architectural Alignment

This proposal aligns with Canton architecture by strengthening the operator-facing layer at multiple levels:

- **Implementation:** React/TypeScript web application communicating with Canton nodes via the Canton Admin API and Ledger API — no custom node modifications required.
- **CLI-backed operational interface:** the tool builds on existing Canton operational capabilities — it does not replace the Canton CLI, it makes it more accessible, auditable, and safe.
- **OIDC/Keycloak:** aligns with Canton's enterprise authentication model; scoped to a single organization's realm, with console-internal RBAC layered on top.
- **Participant and validator administration:** accounts, users, rights, parties, and validator parameters are core parts of real Canton node operations.
- **Contract lifecycle:** DAR deployment, versioning, collections management, and version diff connect operational tooling with the contract/package lifecycle.
- **Upgrade readiness:** pre-upgrade validation protects the network by reducing incompatible deployments.
- **Privacy-aware monitoring:** designed around Canton's sub-transaction privacy model — monitoring queries are bound to Daml Party JWTs, no cross-tenant data leakage.
- **Ecosystem reuse:** open-source under Apache 2.0; any Canton operator team can deploy and extend the tool.

---

### 6. Backward Compatibility

- The tool will remain aligned with the underlying Canton CLI and administration workflows.
- As Canton operational commands and admin surfaces evolve, compatibility updates will be delivered through normal release and maintenance cycles.
- Multi-version support: the tool will target the current Canton/Daml stable version and maintain compatibility across at least one prior minor version.
- Any breaking UI changes introduced by the tool itself will be versioned with migration notes.

**Expected impact:** minimal disruption; the tool acts as an operator-facing layer on top of existing Canton administration capabilities.

---

## Milestones and Deliverables

> Note: Since an MVP already exists and is in production use by Noders' own operational team, Milestone 1 focuses on hardening and open-sourcing that foundation. Milestones 2–4 expand it into a full-cycle operational platform over approximately 6 months.

### Milestone 1: Open-Source Release + Core Admin Hardening

- **Payment:** 200,000 CC — upon committee acceptance
- **Estimated Delivery:** 2 months after grant approval
- **Focus:** Turn the current MVP into a publicly deployable, documented open-source tool with production-grade auth, RBAC, audit logging, multi-environment support, guided write flows, external party onboarding, and package management.
- **Deliverables / Value Metrics:**
  - Open-source release under Apache 2.0 with clean repository structure, Docker/Helm deployment, and setup documentation
  - Hardened and tested account / user / rights / party / validator management workflows
  - **External Party ID onboarding** — interface for onboarding external parties (including multisig party patterns)
  - **OIDC / Keycloak authentication** integrated and documented (single-organization scope)
  - **RBAC** with role definitions for operator, admin, and read-only personas
  - **Audit logging** for all identity, permission, party, and validator actions — structured, queryable records
  - **Multi-environment support** (DevNet / TestNet / MainNet) — environment switcher in UI
  - **Guided write flows** — step-by-step confirmation dialog for sensitive operations
  - **Transfer preapprovals** — Party ID management interface for transfer pre-approval properties
  - **Package management** — DAR collections, versioning, version diff, activate/deactivate
  - Identity backup and restore workflows
  - Live demo deployment or recorded screencast demonstrating core workflows
  - Documentation: operational model, supported workflows, deployment guide

### Milestone 2: Operational Intelligence — Health Diagnostics, Upgrade Readiness, Node Observability

- **Payment:** 250,000 CC — upon committee acceptance
- **Estimated Delivery:** 3 months after grant approval
- **Focus:** Add proactive operational intelligence: node health and connectivity monitoring, upgrade readiness, and traffic/fee visibility.
- **Deliverables / Value Metrics:**
  - **Node health monitor** — liveness and connectivity in network context (super-validator, synchronizer connections, ledger state)
  - Alerting to supported notification channels (Slack, Telegram, email, webhook)
  - Continuous health status panel with configurable thresholds
  - **Upgrade readiness checker:** pre-upgrade validation against target Canton/Daml version, upgrade checklist with automated precondition verification
  - Traffic accounting dashboard — per-party volume display and traffic configuration visibility
  - Fee estimation and actuals comparison
  - Documentation and operational runbook for all Milestone 2 features

### Milestone 3: Privacy-Aware Monitoring + Risk Scoring Module

- **Payment:** 250,000 CC — upon committee acceptance
- **Estimated Delivery:** 4 months after grant approval
- **Focus:** Integrate a Canton-native, privacy-preserving monitoring and permission anomaly alerting module into the admin console.
- **Deliverables / Value Metrics:**
  - **Permission anomaly alerting** — structured notifications when admin-level changes occur (new admin domains, unexpected rights grants to unverified actors)
  - **Detection of sudden capability grants to unverified users**
  - Structured alert schema: severity, entity identifiers, reasons, timestamps
  - Alert routing to supported notification channels (Slack, Telegram, email, webhook)
  - Privacy guarantees: raw contract payloads never leave local infrastructure; all monitoring queries bound to Daml Party JWTs
  - **Integrated API explorer** — interactive browser for Canton Admin API and Ledger API endpoints; request builder with session-authenticated passthrough and structured response viewer for ad-hoc node queries
  - Documentation: privacy model, alert schema, and API explorer usage guide

### Milestone 4: Security Audit Remediation + Ecosystem Adoption

- **Payment:** 500,000 CC — upon completion and committee acceptance
- **Estimated Delivery:** 6 months after grant approval (plus audit timeline; audit itself ~4 weeks)
- **Focus:** Full remediation of all critical and high findings from the external security audit, production hardening, and ecosystem adoption.
- **Deliverables / Value Metrics:**

  *Security remediation:*
  - Remediation of all critical and high findings; documented rationale for accepted/deferred medium/low findings
  - Post-audit patched release with changelog referencing audit findings
  - Published audit report and remediation summary in repository

  *Production hardening:*
  - Expanded test coverage: unit + integration tests for core workflows, audit logging integrity, monitoring privacy guarantees
  - End-to-end operational runbook for a full Canton node operational lifecycle using the console
  - Upgrade playbook: documented procedure for updating the console with new Canton/Daml versions
  - Performance and reliability hardening for multi-node / multi-environment deployments

  *Ecosystem adoption:*
  - Minimum 3 independent Canton operator or participant teams using the tool outside Noders (documented, with team confirmation)
  - Workshop or technical walkthrough session for Canton ecosystem (HackCanton, Canton developer community)
  - Technical blog post: "Canton node operations at scale with open-source tooling"
  - Maintained issue tracker with defined response SLA (≤3 business days for critical issues)

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone
- Demonstrated functionality in a running environment (live demo or recorded screencast per milestone)
- Documentation and setup guidance sufficient for external teams to deploy and use the tool
- Evidence that the tool reduces reliance on direct CLI usage for covered operational workflows

**Project-specific conditions:**

- The tool must be released as open-source (Apache 2.0)
- Core workflows must be documented with sufficient detail for a new operator team to onboard without Noders assistance
- OIDC integration must be documented with a Keycloak reference configuration
- Audit logging must produce tamper-evident structured records, documented with schema
- Monitoring module must not transmit raw contract payloads outside local infrastructure (verified in audit)
- Security audit must be performed by an independent external vendor; audit report to be published
- Ecosystem adoption milestone: minimum 3 teams confirmed as users (not just installations) by final milestone

---

## Funding

**Total Funding Request: 1,370,000 CC** — of which **1,200,000 CC** covers Noders development work across four milestones, and **170,000 CC** covers the Cure53 security audit (22,100 EUR).

### Payment Breakdown by Milestone

| Milestone | Description | Payment | % of dev budget |
| --- | --- | --- | --- |
| M1 | Open-Source Release + Core Admin Hardening | 200,000 CC | 17% |
| M2 | Operational Intelligence: Health, Upgrade Readiness | 250,000 CC | 21% |
| M3 | Privacy-Aware Monitoring + Risk Scoring | 250,000 CC | 21% |
| M4 | Audit Remediation + Ecosystem Adoption | 500,000 CC | 41% |
| **Noders development** |  | **1,200,000 CC** | **100%** |
| **Cure53 security audit** | Independent security audit (22,100 EUR) | **170,000 CC** | — |
| **Total** |  | **1,370,000 CC** | — |

**Early milestones (M1 + M2): 450,000 CC (37%)**  
**Later milestones (M3 + M4): 750,000 CC (63%)**

This structure reflects the proposal's risk profile: early milestones deliver hardened, proven workflows (low execution risk, existing MVP); later milestones deliver novel, high-complexity features — monitoring, risk scoring, and production hardening — that represent the largest technical and security investments.

### Funding rationale

**M1 (200,000 CC):** Core admin hardening reflects the effort of productionizing an existing MVP and extending its scope: OIDC integration, RBAC, audit logging, multi-environment support, guided confirmation flows, external party onboarding, transfer preapprovals, package management with versioning and diff, packaging, documentation, and demo deployment.

**M2 (250,000 CC):** Node health diagnostics and upgrade readiness require integrating with Canton network topology APIs and building a reliable, version-resilient compatibility checker. Multi-environment traffic and fee visibility add further engineering scope.

**M3 (250,000 CC):** Privacy-aware monitoring with permission anomaly alerting is the most architecturally novel component: Canton-native detection, JWT-scoped queries, crash-safe offset persistence, and alert routing to supported channels — all while maintaining strict privacy guarantees.

**M4 (500,000 CC):** Covers full remediation of all critical and high audit findings (authentication, authorization, audit logging, monitoring module, DAR deployment flows), the configurable alert policy framework and export formats carried over from the monitoring workstream, regression testing, production hardening, performance work for multi-node deployments, and documented ecosystem adoption with a minimum of 3 external teams.

### Why backloaded payments?

The later milestones — M3 (250,000 CC) and M4 (500,000 CC) — deliver the highest-complexity and highest-value capabilities: privacy-aware monitoring and production hardening with ecosystem adoption. Backloading 750,000 CC of the 1,200,000 CC total to M3 and M4 aligns Noders' financial incentives with ecosystem value delivery and gives the committee a natural gate before the most substantial payments.

---

## Co-Marketing

Upon milestone completion, Noders LLC will collaborate with the Canton Foundation on:

- Announcement coordination for major releases (M1 open-source release, M4 audit completion)
- Technical blog posts:
  - *"Day-2 operations for Canton nodes: open-source admin tooling from Noders"*
  - *"Privacy-aware monitoring on Canton: how we built risk scoring without violating sub-transaction privacy"*
  - *"Security audit results: what we found and fixed in Canton Infrastructure Admin Console"*
- Demo sessions and workshops for the Canton developer and operator community (HackCanton, Canton developer calls)
- Documentation and how-to materials for Canton operators adopting the tool

---

## Motivation

Canton infrastructure teams face a recurring problem: the operational layer around running nodes is underdeveloped relative to the sophistication of the Canton protocol itself. Every operator team rebuilds the same internal tools — admin scripts, DAR deployment automation, health checks, monitoring dashboards — with inconsistent safety properties and no shared foundation.

Canton Infrastructure Admin Console addresses this gap directly. It is not a new idea: we have built the MVP because we need it ourselves. The proposal extends proven internal tooling into an ecosystem-grade shared resource.

**Why this proposal, specifically:**

- **Real production evidence.** Noders has operated infrastructure for over 5 years and has been active in Canton since summer 2025 as a validator and contributor. The MVP exists, is in use, and has already proven its operational value. Noders also has an existing approved grant (#38), demonstrating commitment to delivering open-source ecosystem infrastructure. The committee is funding an expansion of working software, not a speculative build.

- **Widest management scope.** The current MVP covers more Canton administrative workflows (account / user / rights / party / validator / DAR) than any comparable tool. External party onboarding, transfer preapprovals, and package management with versioning and diff further extend this scope.

- **Security-first.** An ISO/IEC 27001:2022 certified operator building operational tooling for the Canton ecosystem is accountable to security in a way that general-purpose tooling projects are not. The dedicated security audit reflects this commitment.

- **Privacy-aware monitoring fills a real gap.** There is no open-source, Canton-native, privacy-preserving monitoring tool for operators today. The monitoring module in this proposal is designed around Canton's privacy model — not adapted from a generic blockchain monitoring template.

- **Day-2 operations are underserved.** Most funded tooling in this space addresses provisioning, developer SDKs, or analytics. Day-2 operations — ongoing management of a running participant or validator node — has no dedicated open-source tool. This proposal fills that gap.

---

## Rationale

Funding an operational tool — rather than only net-new protocol features — is the most effective way to grow the Canton ecosystem's operator base. Every team that runs a Canton node needs the same management workflows. Right now, each team solves that problem privately, with inconsistent safety and no shared foundation. One well-maintained open-source admin layer eliminates that duplication permanently.

**Why a security audit as a dedicated milestone?**

Admin consoles are high-value attack targets: they carry privileged access to Canton node operations, can modify identity and rights, and deploy contracts to the ledger. An external audit by an independent vendor is not optional for a tool that aims to be ecosystem infrastructure. It signals to adopters — and to the committee — that the security properties claimed in this proposal are independently verifiable, not just asserted. Noders engaged Cure53 for the grant #38 security audit; Cure53 has provided a quote for the admin console scope at 22,100 EUR (170,000 CC).

**Why backloaded payments?**

The later milestones deliver the highest-complexity and highest-value capabilities: M3 (250,000 CC) for privacy-aware monitoring and permission anomaly alerting, and M4 (500,000 CC) for production hardening, configurable alert policies, full audit remediation, and ecosystem adoption. Together, M3 and M4 represent 750,000 CC — 63% of the 1,200,000 CC total — backloaded to align Noders' financial incentives with ecosystem value delivery and to give the committee a natural gate before the most substantial payments.

**Why Noders?**

We're building this tool because we need it. We are the team with a working MVP, an approved grant (#38), ISO/IEC 27001:2022 certification, and active operation of Canton infrastructure as a validator and contributor. We are expanding the tool because the rest of the Canton ecosystem needs it too.
