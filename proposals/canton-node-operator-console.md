## Development Fund Proposal

**Author:** Krews  
**Status:** Draft  
**Created:** 2026-03-30  

---

## Abstract

**Canton Node Operator Console** is a proposed **open-source, self-hosted** dashboard for Canton/Splice node operators. It provides a **single, user-friendly interface** for observing and managing a deployment, instead of relying on scattered documentation, terminal sessions, and ad-hoc API calls.

A Splice validator node exposes a broad HTTP surface: the **JSON Ledger API** on the Canton participant, the **Splice Validator App REST API** (wallet, user management, external signing, management, scan proxy), and **public Scan**. Using these well requires familiarity with multiple APIs, authentication models, and docs. The Canton Node Operator Console **brings them together in one dashboard**, showing data in a readable way and turning authorized write operations into guided, role-controlled, audited flows.

The console is an **operator control plane**, not a retail wallet or end-user application.

---

## Specification

### 1. Objective

A typical Splice validator operator needs to check node health and synchronizer connectivity, inspect hosted parties and their activity, monitor traffic budget, manage users, work with Daml flows such as MergeDelegation and TransferPreapproval, and occasionally upload DARs or inspect package state. Today, those tasks are spread across different APIs, docs, and authentication flows.

There is no single interface for this workflow today. The Canton Node Operator Console is meant to fill that gap.

The work aligns with the Canton Development Fund remit (**critical ecosystem infrastructure** and **operator-facing tooling** that many deployments can reuse). **[CIP-0082](https://github.com/canton-foundation/cips/blob/main/cip-0082/cip-0082.md)** establishes the Development Fund; **[CIP-0100](https://github.com/canton-foundation/cips/blob/main/cip-0100/cip-0100.md)** defines **milestone-based** governance, **quarterly** budgeting, **continuation votes** after each accepted milestone, and (for grants longer than six months) **CC volatility** stipulations (see **Funding governance**). The console does **not** replace public Scan; it focuses on **your node** and the parties it hosts.

The console is designed and tested for the **standard Splice validator stack** (Canton participant + Validator App).

### 2. Architecture: SPA + Minimal Companion Service

The console is a **React SPA** that talks to the deployment’s **HTTP APIs**: **JSON Ledger API**, **Validator App REST**, and **Scan**, using the operator’s OIDC-backed JWTs where required. It follows the **published OpenAPI/AsyncAPI** and the official Ledger API docs on the participant, rather than older or deprecated HTTP surfaces.

A **small companion service** ships alongside the SPA for:

- **Persistent audit log:** append-only record of mutating actions initiated from the console.
- **Background alerting:** threshold checks (e.g. traffic budget, lag) that must run without an open browser session.

The companion is not a second application layer for normal API traffic; it exists for **stateful operator features** (audit, alerts). Deployments are packaged as **Docker Compose** from M2 onward; **Helm** and production-oriented packaging ship in the **final milestone (M4)**.

```
[Browser (React SPA)]
        │
        ├─ HTTP ──► Validator App REST API   (JWT)
        ├─ HTTP ──► JSON Ledger API           (JWT): ACS, commands, packages/DAR
        ├─ HTTP ──► Scan API                 (public)
        │
        └─ HTTP ──► Companion Service
                        ├─ Audit log (SQLite / Postgres)
                        └─ Alert engine (webhooks / email)
```

### 3. Authentication

Authentication follows the same pattern as a typical Splice validator deployment: the operator configures the console with their **OIDC provider** and **API base URLs**; users sign in via OIDC; the resulting **JWT** is used with the Validator App and **JSON Ledger API** as configured on the node.

### 3.1 Scope boundaries (accuracy)

- **Ledger API:** Use the **current** HTTP/JSON surface documented for Canton participants; follow **OpenAPI/AsyncAPI** shipped with the stack. Old HTTP client patterns may need updates when upstream changes query or streaming behavior; **ADRs** record choices per release and migration when upstream deprecates paths.
- **Where it runs:** The Ledger API is served by the **Canton participant** when enabled in configuration; it is **not** the same process as the Validator App. **CORS** and ingress remain the **operator’s** responsibility.
- **DAR and packages:** The **Validator App** participates in participant management including DAR-related flows; the console uses **Ledger API** package operations where exposed, and aligns operator workflows with current Splice validator documentation for anything still automation- or CLI-oriented in a given release.
- **MergeDelegation** and similar items are **Daml application workflows**: the console guides **command preparation and submission** via the Ledger API, not a single dedicated “MergeDelegation REST” surface.
- **Transfer preapproval** appears in wallet and **admin / external-party** routes under the Validator App; the console focuses on **operator-relevant** paths per deployment, not replacing the hosted **CN Wallet** for end users.
- **External-party onboarding** evolves across Ledger API and Validator App routes; **M1 ADRs** fix which endpoints are used and **migrate** when upstream deprecates them.
- **Transaction history** is **whatever the participant serves** after upgrades. **Major synchronizer upgrades** can **truncate** prior update history while preserving active contracts; operators should consult the upgrade documentation for their network.
- **“Node health” in the UI** is a **composed** view from Validator **management** endpoints, **Scan Proxy**, and network context, not necessarily one canonical `/health` resource. Metrics outside these APIs (e.g. Prometheus) are **optional** integrations, not implied as built-in for the first release.

### 4. API Surface Covered

| API | Protocol | What it gives us |
|-----|----------|-----------------|
| **JSON Ledger API** | HTTP/JSON | Active contract set, transaction stream / history as exposed, command submission, package/DAR upload per published contracts |
| **Splice Validator App: User Wallet API** | REST (external, stable) | Wallet balance; **traffic purchase** (`BuyTrafficRequest`); legacy transfer-offer flows are deprecated upstream in favor of Token Standard flows |
| **Splice Validator App: User Management API** | REST (internal) | Register / offboard users hosted on the validator |
| **Splice Validator App: Validator Management API** | REST (internal) | Participant identities, synchronizer connection config, domain data snapshot |
| **Splice Validator App: External Signing API** | REST (internal) | External-party onboarding and **TransferPreapproval** admin flows; **exact** routes **per upstream release** (Ledger API may supersede some validator-local steps over time) |
| **Splice Validator App: Scan Proxy API** | REST | BFT-proxied Scan reads: DSO party, mining rounds, amulet rules, traffic state |
| **Public Scan API** | REST | Network-wide context: rounds, CC reference data, ANS, validators |

*Internal API stability: Splice marks some surfaces as stable; many Validator App APIs are internal with no backward-compatibility guarantee; the console follows upstream.*

### 4.1 Release and compatibility policy

The console is developed and tested against the **current recommended Splice / Canton stack** at each release. **Release notes** and the **README** describe compatibility and what was exercised in CI, **without** freezing a long matrix of historical stacks.

**There is no commitment to long-lived support for obsolete deployments.** Operators should run a supported upstream stack to use current console releases, or fork under Apache 2.0. Maintenance stays **forward-looking** (security, compatibility with new upstream baselines).

### 5. What Operators Will See and Do

**Dashboard overview:** synthesized operational picture from Validator management and Scan Proxy data (identities, synchronizer/domain context, rounds, traffic-related signals), plus activity visible through the Ledger API; **uptime** may require the operator’s existing observability stack if not derivable from these APIs alone.

**Parties & Contracts:** list parties on the node, browse active contracts and recent transactions via the **JSON Ledger API** within documented query/stream capabilities.

**Users:** view and manage users hosted on the validator (register, offboard) through the user management API.

**DAR & Packages:** list and upload DARs via the **JSON Ledger API** where the participant exposes it.

**Daml workflow flows:** step-by-step, confirm-before-submit UI for **ledger command** flows that implement Splice patterns (e.g. merge delegation, transfer preapproval) using the **JSON Ledger API** and, where applicable, **External Signing** admin routes, not a promise to mirror every CN Wallet-only endpoint.

**Traffic:** synchronizer traffic state (via Scan Proxy); guided flow to create a `BuyTrafficRequest` via the wallet API.

**Scan context:** DSO party, open mining rounds, amulet rules, ANS entries, next to your node’s data.

**Alerts:** configurable threshold notifications (low traffic, lag, errors) via webhook or email.

### 6. Architectural Alignment

The console is primarily an API-driven operator interface, with a minimal companion service for audit and alerting. It does not change Canton protocol behavior, DAML semantics, or existing deployments. Terminology aligns with Canton and Splice documentation: rounds, traffic, synchronizer, DSO, MergeDelegation, TransferPreapproval, DAR vetting.

### 7. Adoption and standardization

**Success (how we measure impact):**

- **Usage:** documented trial or production deployments, issue and discussion activity, and, where feasible, structured feedback from **multiple independent operator teams** after M3–M4.
- **Reduction of bespoke tooling:** qualitative goal: fewer one-off scripts and ad-hoc dashboards per team for the same recurring tasks (health, traffic, preapproval, DAR), because the shared console covers them with a documented path.
- **Validation from adjacent builders:** evidence that teams building validator-integrated products, such as wallets or internal operator tooling, can use the console to reduce repeated API and operations work.

**Standardization posture:** The console is intended as a **reference operational layer** for Splice/Canton validator operations: **open source, self-hosted, and optional**. It is not a protocol requirement or a mandated stack. If it becomes a common operational layer, that should happen through adoption and documentation quality, not through enforcement. The Canton Foundation and operators remain free to use official docs, Canton Console, or custom tools alongside or instead of this project.

---

## Milestones and Deliverables

### Milestone 1: Architecture, repository, release policy
**50,000 CC · indicative ~weeks 1–4 (~1 month)**

Public **Apache 2.0** repository; **ADRs** for SPA + companion architecture, OIDC integration with node APIs, **JSON Ledger API** usage, write path and audit model, threat model, and **documented compatibility / release policy** (forward maintenance, no promise to chase obsolete stacks forever); monorepo skeleton (SPA, companion, Docker Compose); **CI** (lint, test, typecheck); README with goals, non-goals, and **how compatibility is described** for each release.

### Milestone 2: Unified read dashboard (Validator focus)
**110,000 CC · indicative ~weeks 5–12 (~months 2–3)**

Read integration across **JSON Ledger API**, Validator App REST, and Scan for **CN Validator** deployments on a **reference environment**: **Canton Network DevNet** (or the Foundation-documented successor public testnet), with the **same upstream baseline** documented for reproducibility. Unified dashboard: composed operational view, parties/contracts, users, traffic-related signals, package listing, Scan context. **Docker Compose** deployment; configuration documentation.

### Milestone 3: Operational write flows
**125,000 CC · indicative ~weeks 13–20 (~months 4–5)**

**Minimum three objectively verifiable write flows** (demonstrable on the same **DevNet / reference** stack as M2):

1. **Hosted user management:** create or offboard a user via Validator **user management** admin API (success verified via subsequent read).
2. **Package upload:** upload a DAR or package artifact via the **JSON Ledger API** package path (hash or package id visible in listing afterward).
3. **Traffic purchase request:** create a **`BuyTrafficRequest`** via the documented **wallet external** HTTP API (status endpoint or contract state confirms pipeline started).

**Additional** guided flows in scope where time allows: **ledger command** steps for token-standard / app workflows (e.g. merge-related batching patterns) and **external-party / preapproval** steps using **Validator admin** and/or **Ledger API** paths **per ADR**. This milestone also delivers operator RBAC, an append-only audit log, and end-to-end tests on the **reference** network configuration.

To keep the **six-month** schedule realistic, this milestone also locks the M4 baseline: the main write flows are in place, the audit and role models are frozen, and the material for the third-party security assessment is prepared before the final hardening phase starts.

### Milestone 4: Alerts, RBAC, export, security review, and production packaging
**215,000 CC · indicative ~weeks 21–26 (final stretch to month 6)**

**Security and product hardening:** threshold alerts (webhook / email). **Viewer / operator / admin** RBAC on SPA and companion. **JSON/CSV export**. Third-party **security assessment** with remediation of critical and high findings.

**Production packaging and handoff:** **Helm** chart validated on a **documented** reference Kubernetes profile; **SBOM** per release; operator **hardening guide**; community handoff and stated maintenance expectations for the supported release line. **GitHub Releases** artifacts and documentation for installation, OIDC, and compatibility.

This final milestone is intentionally weighted toward **hardening and release readiness**, not net-new product work. By the time M4 starts, the core operator workflows are already delivered. The remaining work is to make the console safe, auditable, reproducible, and easier for other validator operators to adopt.

---

## Acceptance Criteria

- **M1:** Repo public (Apache 2.0), ≥4 ADRs merged (auth, **JSON Ledger API** integration strategy, write/audit, release/compatibility policy, **external-party** endpoint strategy), CI green, non-goals documented.
- **M2:** On **Canton Network DevNet** (or successor), operator can configure OIDC + URLs and see a unified **read** dashboard; **documented** reference baseline for reproducibility; config reference published.
- **M3:** The **three** write flows listed under Milestone 3 are demonstrable end-to-end; every write audited and UI-confirmed; ADR updated if any flow uses Ledger vs Validator routes; delivery baseline for the security review frozen and documented.
- **M4:** Security report published; critical/high closed; RBAC enforced; alerts working in staging; export functional; Helm install **documented** on reference cluster; SBOM on releases; hardening guide published; maintenance window stated in the repository.

---

## Funding

**Total funding request:** **500,000 Canton Coin**

| Milestone | Scope | CC |
|-----------|-------|-----|
| M1 | Architecture, ADRs, release policy, repo, CI | 50,000 |
| M2 | Unified read dashboard (Validator node) | 110,000 |
| M3 | Operational write flows + audit | 125,000 |
| M4 | Alerts, RBAC, export, security review, Helm, SBOM, handoff | 215,000 |
| **Total** | | **500,000** |

*Approximate USD equivalent (illustrative, at $0.1568/CC): ~$78,400. This is **not** a price guarantee; CC is the obligation.*

Milestone-based payments per the Canton Development Fund process and **CIP-0100**.

### Funding governance (CIP-0100 alignment)

Per **CIP-0100 Funding, Milestone Assessment, and Continuation**:

- **No lump-sum prepayment:** **500,000 CC** is the **sum of four milestone tranches**. Each tranche is **paid after** the Tech & Ops Committee accepts that milestone against the **acceptance criteria** (with Core Contributors Group input for technical milestones as per CIP-0100).
- **Continuation votes:** After each milestone, the committee **votes on continuation** to the next. On-time acceptance **should** lead to continuation as laid out, unless governance decides otherwise under CIP-0100 (dispute, halt, or renegotiation).
- **Quarterly budgeting:** The Foundation budgets **per quarter**; milestone schedules are **indicative** and **reviewable** in increments aligned with CIP-0100 guidance on incremental milestones.
- **Canton Coin volatility:** Milestones are **fixed in CC** at grant acceptance. **CIP-0100** sets additional **CC/USD volatility** rules for grants **longer than six months**; this proposal’s **indicative delivery window is six months** end-to-end. Any adjustment follows CIP-0100 and mutual agreement with the committee where applicable.

### Budget justification

| Area | Role of funds (indicative) |
|------|----------------------------|
| **Engineering (majority)** | React SPA, companion service (audit, alerts), Ledger API client, Validator/Scan integration, tests, CI, DevNet smoke paths |
| **Security (M4)** | Third-party **security assessment** and remediation of critical/high findings (dedicated line item within M4) |
| **Release & ops (M4)** | Helm, SBOM generation, hardening documentation, release handoff |
| **Coordination** | Milestone demos, ADR maintenance, documentation |

The funding is intentionally weighted toward **M2-M4**, where most of the reusable ecosystem value is created: multi-API integration, verified write flows, and production hardening for self-hosted operation. **M4** is the largest tranche because it combines third-party security-review cost, remediation time, packaging, operator documentation, and release-readiness work. This request is therefore for a maintained, reusable operator product, not just a prototype.

**Team:** delivery assumes a **small core team** (named applicants plus engineering capacity) working **full-time equivalent** across the **six-month** indicative schedule; exact headcount is internal to the grantee and does not change milestone **CC** amounts.

---

## Motivation

Canton node operators often repeat the same integration work: wiring OIDC, finding the right endpoint for traffic or preapproval, and correlating Scan with local state, usually with little shared tooling. An open-source console gives operators a common baseline: one place to see the node and act on it safely.

This proposal is also informed by direct implementation experience at **Krews**. While building a Canton-specific wallet, one recurring source of effort has been **ledger and validator API management** on the node side: user management, permissions, MergeDelegation-related flows, transfer preapprovals, and the validator operations needed to make those flows usable in practice. A reusable operator console would have reduced that research and integration burden significantly, and the same friction is likely to recur for other teams building validator-integrated products.

---

## Rationale

**Naming.** The product is called a **console** because it combines **observation** (dashboards, lists, Scan context) with **actions** (writes, confirmations, audit). “Dashboard” alone suggests read-only monitoring; this scope includes operational controls.

**Companion service.** Browser sessions alone cannot persist a tamper-evident audit trail or run scheduled alert checks. A small sidecar process next to the SPA solves that without turning the project into a monolithic backend: API calls remain from the SPA to the node’s HTTP endpoints where the deployment allows.

**Focus.** The Splice **validator** stack (participant + Validator App) is the deployment shape this project targets end-to-end.

**Compatibility.** Each release documents **what upstream baseline was used for testing**. The team **tracks current upstream**; **abandoned stacks are not a support target**. Operators upgrade or self-support via the open license.

---

## Applicant background

**Krews** operates validator infrastructure across **Canton, Celestia, Monad, Story, Avail, Espresso, and Sunrise** and has shipped ecosystem tooling including **Celestia Dashboard**, **Story Dashboard**, **Risescan** (Rise Chain explorer), and **Tempo Explorer**. The team brings experience from infrastructure and blockchain projects, with a focus on reliable operations and operator-facing tooling.

---

## Security and operational safety

**Authentication and authorization**

- Operators integrate the console with their existing **OIDC**; session users receive **JWTs** used toward the Validator App and **JSON Ledger API** as already configured on the node.
- **RBAC** on the console: at minimum **viewer** (read-only), **operator** (approved writes), **admin** (integrations and user management for the console itself). **Default least privilege:** new users land in the most restrictive role unless an admin promotes them.

**Sensitive operations**

- **Mutating actions** require an authenticated user with the right role, an **explicit confirmation step** in the UI (high-impact flows are not one-click), and an **append-only audit record** on the companion (who, what, when, outcome).
- **Export** of audit and dashboard snapshots (M4) supports internal review and ticketing; export access is **admin-gated** where configured.

**Operational safety and guardrails**

- UI copy and flow design distinguish **read** vs **write** paths; destructive or irreversible actions are **labeled** and confirmed.
- **Third-party security assessment** and remediation of critical/high findings are **M4 deliverables** (see milestones).

**Backups and data scope**

- The console stores **audit logs and alert state** on the companion (SQLite or Postgres). **Backup and retention** of that database are **documented in the operator hardening guide (M4)** and are the operator’s responsibility in their own environment, alongside their existing **node and database backup** practices (the console does not replace validator or participant backups).
- **Secrets** (OIDC client configuration, etc.) stay in env / K8s secrets as per deployment docs; not embedded in the frontend bundle.

**Scalability**

- One console deployment per operator environment; no multi-tenant product design.

---

## Long-term maintenance

The **final milestone** covers packaging, SBOM, and handoff. Security patches and dependency updates for the supported release line are covered in the maintenance window stated in the repository. Apache 2.0 keeps the project forkable.

---

## Distribution

- **Docker Compose** (from M2)
- **Helm** (M4)
- **GitHub Releases** with SBOM
- Documentation: installation, OIDC, compatibility notes per release, security model
