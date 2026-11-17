# Development Fund Proposal: Canton Launchpad

**Author:** @cvijandj (cvijandjuka@gmail.com)
**Status:** Draft
**Created:** 2026-05-26
**Label:** daml-tooling
**Champion:** Need Champion
**Live PoC:** https://canton-launchpad.vercel.app
**Video Walkthrough:** https://www.loom.com/share/65c99675b83d4d0693931e8a9c380207
**Error Glossary:** https://github.com/cvijandj/canton-error-glossary

---

## Abstract

Canton Launchpad is a visual local development control plane for Canton — the missing runtime dashboard that the Canton community explicitly requested by name in the official 2026 Developer Experience Survey. It is a browser-based (and ultimately Tauri desktop) application that lets developers launch a Canton LocalNet sandbox, see real-time synchronizer connection state on an interactive topology canvas, save and restore ledger snapshots, and decode cryptic JVM/gRPC exceptions into plain-English diagnostics. A live interactive proof-of-concept is deployed at https://canton-launchpad.vercel.app. A standalone companion resource, `canton-error-glossary`, is already live on GitHub with 12 documented Canton errors under Apache-2.0.

---

## Motivation

The official Canton Network Developer Experience and Tooling Survey (January–February 2026) established — with data — that developer onboarding friction is the ecosystem's most urgent unsolved problem:

- **Local Development Frameworks rated "Critical"** — the highest urgency score of any category in the entire survey
- **41%** of respondents cited "Environment Setup & Node Operations" as the task that took the longest to "get right"
- **80%** of active Canton developers joined within the last 12 months and are disproportionately affected by first-day friction
- **71%** come from an Ethereum/EVM background and arrive expecting tooling comparable to Hardhat, Foundry, or Anchor
- Hardhat, Anchor, or Foundry were named **11+ times** in qualitative feedback as the missing local dev standard
- **Visual debugging tools (Tenderly)** were the most specifically named missing capability for error diagnosis

Critically, the survey identified Canton Launchpad's core feature by name under "Additional Developer Tooling Opportunities":

> *"**Network Topology Visualizer:** Developers find it difficult to confirm if their Participant node is correctly 'handshaking' with the Mediator and Sequencer, often relying on complex terminal commands to diagnose connectivity issues."*

The survey's authors invited proposals that address this gap directly:

> *"If this report sparks an idea for a tool that benefits the community and you would like funding support for it, we encourage you to review CIP 100 and prepare your proposal to the Canton Development Fund Grants."*

Canton Launchpad is a direct, verifiable response to that invitation.

| Survey Request | Canton Launchpad Deliverable |
| --- | --- |
| "One-click visual dashboard" for handshake verification | Live topology canvas with real-time synchronizer connection state |
| Network Topology Visualizer (named explicitly) | React Flow map querying `ListParticipantSynchronizerPermission` |
| Visual debugger (Tenderly equivalent) | Diagnostics console + open-source `canton-error-glossary` |

---

## Specification

### 1. Objective

Deliver a visual, one-click local development control plane for Canton that eliminates the three most frequently cited onboarding friction points:

1. **No visual overview of node health** — developers cannot see at a glance whether their LocalNet is healthy without running CLI queries
2. **Opaque synchronizer handshakes** — verifying `ListParticipantSynchronizerPermission` requires Admin API queries most new developers do not know to run
3. **Unreadable error output** — nested JVM/gRPC exceptions are opaque to the 71% of Canton developers who come from non-JVM backgrounds

### 2. Implementation Mechanics

```
+--------------------------------------------------------+
|                 Canton Launchpad GUI                   |
|        (React + Vite + Tailwind + React Flow)          |
+---------------------------+----------------------------+
                            | IPC (Tauri Events)
+---------------------------v----------------------------+
|                    Tauri Rust Core (v2)                |
+------------+------------------------------+-------------+
             |                              |
             | docker compose shell calls   | Admin gRPC via tonic
             |                              | (com.digitalasset.canton.topology.admin.v30)
+------------v------------+      +-----------v------------+
|   Local Docker Engine   |      | Canton Node Admin API  |
|  (cn-quickstart stack)  |      | TopologyManagerRead    |
+-------------------------+      | ListParticipantSync... |
                                 +------------------------+
```

**Desktop App (Tauri v2 + Rust + React).** Secure 12–18 MB binary. The Rust backend handles Docker Compose process lifecycle via `tauri-plugin-shell`, port liveness checking, and all gRPC communication. The React frontend renders the topology canvas and diagnostics console.

**Sandbox Orchestrator.** Executes `docker compose` commands against the user's `cn-quickstart` directory. Validates Docker Desktop has ≥8 GB RAM allocated via the `sysinfo` crate before launch to prevent silent container crashes.

**Handshake Engine.** Rust `tonic` gRPC client queries `TopologyManagerReadService.ListParticipantSynchronizerPermission` (proto: `com.digitalasset.canton.topology.admin.v30`) per node to verify synchronizer registration. Polls liveness via HTTP health and gRPC health ports before issuing topology queries.

**Admin API port reference (cn-quickstart defaults):**

| Node | Admin gRPC | HTTP Health | gRPC Health |
| --- | --- | --- | --- |
| Super Validator Participant | 4902 | 4900 | 4961 |
| App Provider Participant | 3902 | 3900 | 3961 |
| App User Participant | 2902 | 2900 | 2961 |

**Diagnostic Interpreter.** Intercepts JVM exceptions and gRPC transport errors, maps them to plain-English alerts. The underlying error dictionary is published as `canton-error-glossary` on GitHub — a community resource that is already live and independent of the desktop app.

**Local Status API.** A secure `localhost` HTTP endpoint from the Tauri backend returns structured JSON of active node statuses and Admin API ports, enabling future VS Code extension integrations without requiring the desktop app to be open.

### 3. Architectural Alignment

Canton Launchpad is a **pure operational overlay** — it requires no modifications to the Canton protocol, Daml runtime, or `cn-quickstart` configuration. It runs zero on-ledger smart contracts.

It aligns with the Q2 priority area **"App Building and Developer Experience"** by directly addressing: reduced developer friction, documentation and examples, and lower total cost of ownership.

The tool wraps the official `cn-quickstart` Docker Compose stack — it does not replace it. The Handshake Engine queries Canton's existing Admin gRPC APIs using the published proto definitions. Nothing new is added to the Canton network layer.

### 4. Backward Compatibility

No backward compatibility impact. Canton Launchpad is a read-and-orchestrate layer that wraps existing Canton infrastructure. It does not modify Canton node behaviour, ledger state, or configuration formats.

---

## Milestones and Deliverables

### Milestone 1: LocalNet Orchestrator & Topology Visualiser

| Detail | Description |
|--------|-------------|
| **Estimated Delivery** | Weeks 1–4 from grant approval |
| **Focus** | Desktop app core, Docker orchestration, live topology canvas |
| **Funding** | 80,000 CC |

**Deliverables:**

- Tauri v2 + React desktop application: node control panel (left), live React Flow topology canvas (centre), diagnostics console (right)
- Workspace detector locating `.env` and `compose.yaml` from the `cn-quickstart` directory
- Process manager for graceful container boot, shutdown, and purge via `docker compose`
- System health guardrail: warning modal if Docker Desktop RAM allocation < 8 GB (checked via `sysinfo` crate before boot sequence begins)
- Live topology canvas showing real-time connection state between Participant nodes and the Global Synchronizer (Sequencer + Mediator group), with edges turning green on active synchronizer registration

**Acceptance Criteria:**

- Canton LocalNet launches via GUI without opening a terminal; node badges transition Offline → Starting → Running in the documented boot order
- Topology canvas edges update live: stopping the sequencer container turns its connections gray within one polling cycle (≤5 seconds)
- At least 5 Canton developers from the community (beta testers or forum volunteers) have successfully launched a LocalNet using the app on macOS or Linux

---

### Milestone 2: Snapshot/Restore Engine & Local Status API

| Detail | Description |
|--------|-------------|
| **Estimated Delivery** | Weeks 5–8 from grant approval |
| **Focus** | State persistence, iteration speed, VS Code integration surface |
| **Funding** | 90,000 CC |

**Deliverables:**

- State snapshot manager: one-click capture of PostgreSQL volume state and node data directories, saved as a portable snapshot file
- State restore: restore any saved snapshot without a full sandbox restart, reducing iteration time from ~10 minutes cold start to under 3 minutes by skipping all initialization scripts
- Secure `localhost` HTTP endpoint returning structured JSON of active node statuses and Admin API ports

**Acceptance Criteria:**

- Full snapshot round-trip demonstrated in a recorded session: capture state with active contracts → mutate ledger → restore snapshot → confirm ledger state matches the capture, completing in under 3 minutes from restore trigger
- Local status API documented with an OpenAPI spec and a working curl example; JSON payload covers all active node IDs, statuses, and Admin API ports

---

### Milestone 3: Visual Debugger & Open-Source Error Glossary

| Detail | Description |
|--------|-------------|
| **Estimated Delivery** | Weeks 9–12 from grant approval |
| **Focus** | Error decoding, community resource, documentation |
| **Funding** | 70,000 CC |

**Deliverables:**

- Diagnostics console intercepting raw JVM/gRPC exceptions and rendering decoded, plain-English troubleshooting steps in real time inside the app
- `canton-error-glossary` expanded to ≥25 documented errors (currently 12 live), covering all error classes from the official Canton troubleshooting docs
- Video walkthrough series (3 videos: LocalNet boot, snapshot workflow, error diagnosis)
- Developer documentation site (GitHub Pages or similar)

**Acceptance Criteria:**

- Diagnostics console decodes at least 10 distinct Canton error patterns into actionable instructions, demonstrated in a recorded test session
- `canton-error-glossary` has ≥25 documented errors and at least 3 external community contributors (PRs merged from outside this project)
- At least 10 Canton forum or Discord users cite the glossary as helpful in a support thread

---

## Acceptance Criteria (Global)

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified per milestone
- Demonstrated real-user adoption (not just feature delivery in isolation)
- All tools open-source under Apache-2.0
- Documentation sufficient for a new Canton developer to use the tool without prior knowledge of this project

---

## Funding

**Total Funding Request: 240,000 CC**

| Milestone | Focus | Amount |
| --- | --- | --- |
| Milestone 1 | LocalNet Orchestrator & Topology Visualiser | 80,000 CC |
| Milestone 2 | Snapshot/Restore Engine & Local Status API | 90,000 CC |
| Milestone 3 | Visual Debugger & Open-Source Error Glossary | 70,000 CC |
| **Total** | | **240,000 CC** |

All amounts denominated in Canton Coin (CC), disbursed per milestone upon committee acceptance of deliverables.

**Volatility Stipulation:** Project duration is 12 weeks (under 6 months). Should the timeline extend beyond 6 months due to Committee-requested scope changes, remaining milestones will be renegotiated to account for significant USD/CC price volatility.

---

## Co-Marketing

Upon completion of each milestone, I will collaborate with the Canton Foundation on:

- Announcement coordination via the Canton forum and developer channels
- Technical blog post covering the architecture, key decisions, and how the tool addresses the DevEx survey findings
- Case study on LocalNet iteration time improvement (baseline vs. with snapshot/restore)
- Inclusion of Canton Foundation acknowledgement in all release materials

The `canton-error-glossary` will explicitly credit the Canton Foundation's DevEx survey as the motivating source for each error category.

---

## Rationale

**Why this approach?**

The PoC is already live at https://canton-launchpad.vercel.app. The core interaction — launching nodes, watching the topology canvas fill with green edges, decoding a TLS error in real time — is demonstrable today. This is grant funding for a maturing and shipping a working concept, not speculative R&D.

**How does this fit with Denex Localnet?**

Canton Launchpad and Denex Localnet are **complementary, not competing**. Denex solves the configuration problem: replacing 80–120 files with a single declarative YAML and a programmatic API. Canton Launchpad solves the **runtime visibility problem**: once a LocalNet is running (however it was configured), Canton Launchpad shows you what's happening inside it. A developer could use Denex to define and launch their network, and Canton Launchpad to observe its health and decode errors as they develop. The two tools occupy different parts of the developer workflow.

**Why not extend an existing tool?**

The Canton Console is a terminal REPL with no visual rendering. The Scan UI and SV UI are end-user transaction monitors, not developer operations dashboards. No existing Canton tool visualises synchronizer topology or decodes JVM exceptions into human-readable guidance. Canton Launchpad is not a replacement for any existing tool — it fills a gap that the DevEx survey named explicitly.

**Sustainability post-grant:**

The desktop app and error glossary will be maintained as open-source (Apache-2.0) community resources. Maintenance overhead for a read-only topology dashboard is low: it only needs updates when Canton Admin API proto definitions change, which is infrequent. The glossary is community-driven by design — the goal is for it to grow through external contributions rather than depending on a single maintainer.

---

## Team

| Name | Role | Background |
| --- | --- | --- |
| @cvijandj | Solo Developer | React and Rust developer; familiar with the Canton ecosystem through direct work with Canton Network validators and application teams. Built the live PoC (https://canton-launchpad.vercel.app) and the existing `canton-error-glossary` (12 errors, Apache-2.0) prior to grant approval to demonstrate execution capability. |
