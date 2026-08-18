# Tenderly Simulation for Daml on Canton: Grant Proposal Outline

**Author:** Tenderly

**Updated:** 18/08/26

**Label:** developer-tooling

**Champion:** 

---

## Abstract

Tenderly will build and operate a simulation environment for Daml smart contracts running on Canton. Canton developers will be able to simulate transactions before submission. The integration covers Canton TestNet and MainNet, and is available through Tenderly's existing developer dashboard and API. The initiative is a 12-month pilot, with usage telemetry reported quarterly to the Tech & Ops Committee.

---

## Specification

### 1. Objective

Today, developers building on Canton don't have production-grade simulation tooling for Daml. That creates concrete friction in two areas.

1. **Pre-deployment validation.** Developers can't confidently simulate a Daml transaction against current ledger state before submitting it. Bugs surface only at execution time, which lengthens dev cycles and discourages complex workflow design.
2. **Post-execution investigation.** When a transaction fails or produces unexpected state on TestNet or MainNet, there's no straightforward way to replay, inspect, or share a reproducible trace. Teams resort to log archaeology and ad-hoc reproductions.

### Links for more information on simulations ⬇️

- More on Tenderly simulations → https://tenderly.co/transaction-simulator
- How Safe uses Tenderly simulations → [How Safe Integrates TX Simulations Into Their Multisig](https://blog.tenderly.co/case-studies/safe/)
- How Instadapp uses Tenderly simulations → https://blog.tenderly.co/case-studies/instadapp/
- How Enso uses Tenderly simulations → https://blog.tenderly.co/case-studies/enso/

This proposal closes that gap by bringing Tenderly's simulation, already standard tooling across EVM ecosystems, to Daml on Canton.

### 2. Implementation Mechanics

#### Architecture

Tenderly's architecture for Canton shifts from a "Global State Fork" (used in EVM) to a **"Virtual Participant"** model.

- **Virtual Participant Node (VPN).** Tenderly deploys a specialized version of a Canton Participant. This node doesn't join the consensus of the Synchronization Domain. It acts as a headless execution environment instead.
- **State Forking (ACS Snapshots).** Developers provide their Participant's **Active Contract Set (ACS)** through one of the three ingestion paths described in *ACS ingestion & data handling* below. Tenderly hydrates the VPN with this data, so the developer can simulate transactions as if they were their specific **Party ID**.
- **Daml Engine Integration.** The engine embeds the open-source **Daml-LF (Speedy) interpreter** rather than reimplementing Daml semantics (see *Daml interpreter integration* below). Simulations run the actual Daml bytecode to ensure 1:1 parity with live execution, including complex authorization checks and fetch dependencies.
- **Cross-Domain Orchestration.** The simulation engine mocks the **Global Synchronizer** behavior, so contract migrations (handovers) between multiple domains can run inside a single "Dry Run" session.

#### Daml interpreter integration

The Virtual Participant executes Daml by **embedding the open-source Daml-LF (Speedy) interpreter** (`digital-asset/daml`, Apache 2.0) rather than reimplementing Daml semantics — simulations run on the same interpreter Canton runs.

- **Interpreter.** The Daml-LF Speedy interpreter, pinned to the LF version(s) of the target Canton/Splice release; produces the same transaction-tree structure Canton produces.
- **Authorization semantics.** We reuse the open-source Daml engine — the same engine-level authorization, key-uniqueness, and privacy-projection logic Canton itself embeds. No hand-rolled authorization logic.
- **What Tenderly builds (the delta).** The harness: ACS hydration, the headless Virtual Participant, and the visualization / state-diff / failure-analysis layer. The interpreter is a dependency; the developer experience is the product.
- **Version tracking.** Interpreter and engine dependencies are version-pinned per release and bumped within the 30-day version-tracking window committed to in M4. Pinned versions are published with each release so parity is independently auditable.

#### Simulation capabilities

- **Transaction Tree Visualization.** View the full hierarchy of a transaction, including root exercises and nested children (Creates/Archives).
- **Privacy Projections.** Simulate "What Alice Sees" vs. "What Bob Sees." The engine flags if a transaction would fail due to a visibility leak or a stakeholder missing from the "need-to-know" projection.
- **Contract State Diff.** A before-and-after view of the ACS, highlighting exactly which contracts are archived and which are created.
- **Authorization Mocking.** Simulate a transaction under the authority of multiple parties to verify multi-sig or delegated workflows.
- **Failure Analysis.** Human-readable error messages for common Canton failures (e.g., *Inconsistent Transaction*, *Missing Authorization*, *Double-Spend Conflict*).

#### Developer interface

- **Tenderly Dashboard (Canton Edition).** A web-based "Sandbox" where developers paste Daml commands and see an instant visual trace of the resulting transaction tree.
- **Simulation API.** A RESTful endpoint for CI/CD pipelines, so teams can run regression simulations against a "Golden State" before every deployment.

#### ACS ingestion & data handling

Simulations require the developer's Active Contract Set (ACS) to hydrate the Virtual Participant. Because institutional teams are the primary beneficiaries, ACS handling is treated as a first-class security requirement. Three ingestion paths, in decreasing order of data exposure:

1. **Self-hosted / VPC Virtual Participant (zero data egress).** The simulation engine runs inside the customer's own environment; the ACS never leaves their network. Recommended for regulated institutions.
2. **Scoped, read-only API credential.** A least-privilege token scoped to the Party ID; no write or submission authority.
3. **Manual ACS snapshot upload.** For ad-hoc use.

**Data-handling posture (paths 2 and 3):**

- Single-tenant, ephemeral simulation environment per Party ID — no commingling of customer state.
- TLS 1.2+ in transit; encryption at rest.
- **Ephemeral-by-default retention.** Snapshots are purged at session end or within 24 hours, whichever comes first; no contract state is retained afterward. Only aggregate, non-sensitive telemetry (simulation counts, feature usage) is kept for usage reporting.
- Hosted in EU and US regions; SOC 2 audit currently in progress.
- No third-party data sharing; no model training on customer data.

A data-handling addendum ships in the M1 repository and is reviewed with each pilot partner's security team before onboarding.

#### What this is not

- Not a Canton validator, super-validator, or consensus participant
- Not a write path to Canton. Simulations execute against forked state and never submit to the canonical ledger
- Not a replacement for Daml Studio or `daml test`. Those remain primary for local TDD; this is for fork-based simulation against live network state
- Not a Canton node operator service (distinct from the Foundation's TestNet node proposal)

#### What this supports

- **Daml versions:** 2.10.3+ and 3.4.10+
- **Networks:** Canton TestNet, MainNet, and specialized Institutional Sub-domains.
- **Logic:** Support for complex `nonconsuming` choices, `fetch`, and `key`-based lookups.

#### Responsibilities: Tenderly vs. Canton Foundation

> Tenderly builds, hosts, and operates. Canton Foundation provides ecosystem access, qualification, and governance oversight.
> 

| Responsibility | Tenderly | Canton Foundation |
| --- | --- | --- |
| Simulation engine development | Responsible | Not involved |
| Simulation UI/UX | Responsible | Not involved |
| Daml language coverage and updates | Responsible | Advisory |
| State forking infrastructure | Responsible | [Provides endpoint access?] |
| Hosting, uptime, scaling | Responsible | Not involved |
| Developer onboarding & support | Responsible | Co-promotes |
| Ecosystem partner introductions | Receives | Responsible |
| Quarterly usage & impact reports | Responsible | Recipient |
| Roadmap input | Receives | Provides |
| Canton/Splice version tracking | Responsible | Coordinates release notice |

#### Adoption and Access

- Listed in Canton developer docs as a recommended tool
- Tenderly dashboard discoverable to any Canton dev
- Pre-provisioned for hackathon participants Canton Foundation sponsors
- CSM-driven onboarding for ecosystem partners during their build phase

---

## Ecosystem Demand & Adoption: Who on Canton Would Benefit from Tenderly

> The teams and companies listed below are **representative beneficiaries** drawn from public Canton ecosystem materials. They reflect who Tenderly believes would get value from this tooling. **None of them are confirmed pilot-program participants.**
> 

The Canton Network ecosystem includes 200+ partners and 183+ live projects, with institutional adopters such as Goldman Sachs, DTCC, Broadridge, BNP Paribas, HSBC, Euroclear, and JPMorgan, plus a growing builder layer shipping RWA, stablecoin, lending, and tokenized-debt workflows. The profile below maps that ecosystem to concrete use cases for Tenderly simulation. Inclusion here reflects Tenderly's view of where the tool would create value, not any current engagement.

**Potential beneficiaries by category** *(illustrative, not pilot participants)*

- **Tokenized money market funds / RWA issuers.** Hashnote (USYC, ~$1.3B AUM tokenized money market fund, now under Circle), Ctrl Alt ($1.4B+ tokenized real estate, private credit, funds, commodities as of April 2026). Pre-trade simulation matters here for privacy projections, multi-party authorization checks, and ACS diffs on every mint/redeem.
- **Tokenized debt / fixed income.** Obligate (Swiss FINMA-compliant tokenized bonds and commercial paper; Bitcoin Suisse has issued tokenized bonds on the platform). Simulating issuance, coupon, and redemption flows against forked ledger state addresses the audit and operations risk these issuers carry.
- **Institutional settlement & repo desks.** Participants in the cross-border intraday repo and tokenized-gilt programs on Canton (Goldman Sachs, BNP Paribas, HSBC, and other Foundation members). These desks need deterministic dry-runs of multi-domain handovers before live settlement.
- **Treasury & custody.** DTCC's ComposerX-based tokenization of DTC-custodied US Treasuries (targeted for 2026), Broadridge, Euroclear. Simulation gives ops teams a way to validate cross-domain transactions before they touch production rails.
- **On-chain credit & lending.** EA Finance (RWA-first lending market on Canton), BitSafe (BTC yield vaults, 4 to 8% APY on Bitcoin-backed positions). Vault and credit logic benefits directly from contract-state diffs and authorisation mocking.
- **Validators & infrastructure operators.** Super Validators including Blockdaemon, Figment, Kiln, and Everstake; 600+ validator nodes active across the ecosystem (Q4 2025). These teams use simulation to reproduce edge-case failures from MainNet without spinning up disposable test environments.
- **AI / agentic application builders.** AgenticLedger and similar teams deploying AI agents that author and execute Daml transactions. Simulation is a hard prerequisite for safely letting an autonomous agent submit to Canton.
- **Foundation-sponsored hackathon participants.** Tenderly already pre-provisions simulation access for hackathons co-run with ETHGlobal, Chainlink, and Encode Club. The same pattern applies cleanly to Canton-themed events.

**Concrete use cases driving demand**

In plain terms, simulation is about derisking. It lets institutional teams test a transaction in a safe copy of the network before it touches real funds or real counterparties. The result is fewer production incidents, shorter audit cycles, and less of the operational risk that today gets absorbed in war rooms and reconciliation work. The bullets below are concrete examples of where that matters most on Canton.

- Mint/redeem dry-runs for tokenized funds (Hashnote-class workflows) before touching reserves.
- Cross-domain handover simulation for repo and gilt settlement (Goldman / BNP / HSBC-class flows).
- Authorization mocking for multi-signatory institutional approvals.
- ACS diff replay for post-incident investigation when an institutional transaction produces unexpected state.
- CI/CD regression simulation against a "Golden State" before every release, for builder teams shipping to MainNet.

---

## Milestones and Deliverables

### Milestone 1: Daml Simulation Engine

Source code for the Canton integration layer published to a public GitHub repository at M1 completion. 

- **Estimated Delivery:** Weeks 1 to 12
- **Focus:** Adaptation of the Tenderly execution engine to handle Daml bytecode and the Canton UTXO model.
- **Hard targets:** 1 working end-to-end demo against a TestNet ACS snapshot; 2 internal Tenderly engineers fully onboarded on Daml; 100% of Daml 2.10.3+ core primitives covered.
- **Deliverables / Value Metrics:** Internal tool capable of executing a local Daml command against an uploaded ACS snapshot.
- **Tranche:** **380,000 CC**

### Milestone 2: State Sync, Cross-Domain Mocking & Parity Suite

- **Estimated Delivery:** Weeks 13 to 20
- **Focus:** Building the "Handover" logic to simulate atomic transactions that span multiple Synchronization Domains, plus the published parity suite that defines M2 acceptance.
- **Hard targets:** Multi-domain simulation working across at least 2 distinct Synchronization Domains; **100% parity on the published Canton Parity Suite v1** (defined below).
- **Deliverables:** API support for "Multi-Domain Simulation" where a single request can simulate an asset move from Domain A to Domain B; Canton Parity Suite v1 committed to the M1 repository and running in CI.
- **Tranche:** **270,000 CC**

**Parity definition (per case).** A case passes when its (a) transaction-tree structure, (b) resulting ACS delta, and (c) observed errors / authorization outcomes are semantically equivalent to the same submission on live Canton TestNet. Because the Virtual Participant embeds the same interpreter Canton runs, execution parity is structural; any failing case indicates a harness bug (ACS hydration, synchronizer mocking, handover semantics), blocks M2 acceptance, and ships with a documented root cause.

**Canton Parity Suite v1** — published, versioned, runs in CI in the M1 repository. The suite manifest is committed before M2 acceptance so the Committee evaluates a fixed, inspectable target rather than a headline percentage. Coverage:

- **Transaction types:** create, exercise (consuming and non-consuming), fetch, lookupByKey, createAndExercise, multi-command submissions.
- **Authorization patterns:** single-signatory; multi-party (signatory + controller); propose/accept delegation; explicit disclosure and interface views.
- **Multi-domain / reassignment:** unassignment → assignment across ≥2 Synchronization Domains; cross-domain contract references.
- **Failure cases:** contract-not-active, authorization failure, key conflict, and the common Canton errors the failure-analysis feature surfaces.

### Milestone 3: Public Beta + Adoption Gate 1

- **Estimated Delivery:** Weeks 21 to 24
- **Focus:** First cohort of ecosystem partners and at least one hackathon onboarded.
- **Hard targets:** Public beta live (Dashboard + API) with published documentation and ≥1 hackathon integration; **≥3 named pilot partners** committed in writing (LOI or equivalent), disclosed to the Committee; **≥5 distinct projects/teams onboarded** (account created and ≥1 simulation executed); **≥500 simulations executed** cumulatively; **≥150 transaction traces inspected** in the dashboard.
- **Deliverables / Value Metrics:** First quarterly usage report to the Tech & Ops Committee with per-metric actuals vs. targets.
- **Tranche:** **400,000 CC**

### Milestone 4a: 12-Month Operations Base

- **Estimated Delivery:** Weeks 25 to 52
- **Focus:** Ongoing operation, version tracking, support, iteration.
- **Hard targets:** Canton/Splice releases tracked within 30 days, 100% of the time; ≥ 99.5% uptime on the simulation API; two co-published pilot partner case studies.
- **Deliverables / Value Metrics:** Continuous maintenance and bug fixing of the Canton network support. Semi-annual usage reports to Tech & Ops Committee, Canton/Splice version tracking within 30 days of release, defined incident response SLA shared at M1, ongoing developer support.
- **Tranche:** **300,000 CC**

### Milestone 4b: Adoption Tranches

Two adoption-gated tranches, paid on cumulative outcomes. Definitions: a **monthly active team** is a team or organization executing ≥20 simulations in a calendar month; **sustained monthly use** means a pilot partner qualifying as monthly active in each full calendar month between public-beta launch and the gate (minimum two months for the Month-9 tranche; three months for the Month-12 tranche).

**Month 9 tranche — 150,000 CC:**

- ≥10 cumulative projects/teams onboarded;
- ≥2,000 cumulative simulations executed;
- ≥1 pilot partner converted to sustained monthly use;
- Supporting deliverables shipped: Canton simulation capabilities presented to ≥3 flagship Tenderly customers (top-20 by platform usage; names disclosed privately to the Committee), and in-product promotion of Canton support across Tenderly's full user base — in-product banner, blog post, case study, and video tutorials covering Tenderly simulation use cases on Canton.

**Month 12 tranche — 225,000 CC:**

- ≥20 cumulative projects/teams onboarded;
- ≥5,000 cumulative simulations executed;
- ≥2 pilot partners converted to sustained monthly use;
- ≥8 monthly active teams.

Optional adoption-encouragement activities Tenderly is open to adding at any point: co-authoring a talk at an ecosystem event to promote usage and Canton itself; founders available for co-marketing activities initiated by Canton; personalized onboarding, usage structuring, and setup optimization for key clients.

**Note:** Due to the recurring nature of operations, this proposal introduces a Pilot Program for 12 months.

After the Pilot Program, Tenderly submits a Performance Report to the Tech & Ops Committee no later than 30 days after the end of the Pilot Period. The Committee has 30 days to review the report and raise any material shortfalls. If no shortfalls are raised within that window, the report is deemed accepted and the program continues. If material shortfalls are identified, Tenderly has 30 days to present a remediation plan. Failure to remediate may result in suspension or termination of future disbursements.

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone
- Demonstrated functionality on Canton TestNet
- Alignment with stated value metrics (developer adoption, simulations executed, partner usage)

---

## Funding Breakdown: Per-Milestone CC Tranches

Total request: **1,875,000 CC.**

Funding is structured as per-milestone CC tranches rather than category line items, in line with Foundation guidance. Each tranche is released on Tech & Ops Committee acceptance of the milestone's deliverables and hard targets.

| **Milestone** | **Tranche (CC)** | **Gate type** | **Covers** |
| --- | --- | --- | --- |
| M1: Simulation Engine (Weeks 1 to 12) | 380,000 CC | Build | Daml integration, simulation engine adaptation, simulation UI scaffolding, initial Daml/Canton specialization ramp-up, published SLA and version-tracking policy. |
| M2: State Sync & Parity Suite (Weeks 13 to 20) | 270,000 CC | Build | Multi-domain simulation engineering, Global Synchronizer mocking, Canton Parity Suite v1 build-out, infrastructure scale-up for hydration of larger ACS snapshots. |
| M3: Public Beta + Adoption Gate 1 (Weeks 21 to 24) | 400,000 CC | Adoption | Public beta launch (Dashboard + API), pilot partner onboarding, hackathon enablement, DevRel & documentation, first quarterly usage report. |
| M4a: Operations Base (Weeks 25 to 52) | 300,000 CC | Operations | Hosting and infrastructure ops for the full pilot window, Canton/Splice version tracking, bug-fix and support channels, semi-annual reporting, coordination & partner case studies. |
| M4b: Adoption Tranches (Months 9 & 12) | 375,000 CC | Adoption | Cumulative adoption outcomes (projects, simulations, sustained pilot use, monthly active teams) plus ecosystem promotion deliverables. |
| Operational buffer | 150,000 CC | Contingency | Unforeseen scope, additional Daml version support, scaling under heavier-than-expected adoption. Released only on Tech & Ops Committee approval against a specific change request. |
| **Total** | **1,875,000 CC** |  |  |

**Gate structure.** Adoption-gated funding (M3 + M4b) totals 775,000 CC — roughly 41% of the ask. Build-gated funding (M1 + M2) is 650,000 CC (~35%), operations 300,000 CC (16%), and contingency 150,000 CC (8%), released only against Committee-approved change requests. The total covers both the full engineering build (interpreter integration, multi-domain simulation, the developer-experience layer) and 12 months of hosted operations, support, and version tracking.

---

## Post-Grant Sustainability

**Owner of record.** Tenderly develops and operates the simulation engine, dashboard, and supporting infrastructure, with the Canton integration layer published as open source. There's no hand-off to a third party at the end of the pilot.

**Path after the pilot.** Tenderly will name one of three outcomes at the end of M4, in coordination with the Tech & Ops Committee:

**Commercial operation only.** The Canton-specific integration layer remains open source regardless of commercial outcome, so the ecosystem can maintain or fork it independently. Simulations on Canton sit inside Tenderly's existing dashboard, API, and billing infrastructure, so ongoing operations don't depend on continued Foundation funding. The free tier is preserved indefinitely for individual developers and Foundation-sponsored hackathon participants.

**Maintenance commitments that continue post-pilot.**

- Canton / Splice version tracking within 30 days of release
- Incident-response SLA maintained at the level established in M1
- Public status page and uptime reporting
- Daml language coverage updates as new versions ship

**Off-ramp.** If Tenderly ever discontinues the Canton offering, Tenderly commits to a minimum 6-month sunset window, public notice to the Tech & Ops Committee, and best-effort support to hand over documentation and integration guidance to a replacement maintainer.

---

## Co-Marketing

1. Joint developer-blog post on the Canton Foundation site introducing Daml simulation as the third pillar of Canton dev experience. Tenderly amplifies via its channels (X, blog, newsletter). Co-published Loom walkthrough of architecture.
2. Hackathon. Tenderly has already co-run hackathons with ETHGlobal, Chainlink, Encode Club, and others. A Canton-themed hackathon with pre-provisioned simulation access for all participants. Foundation co-sponsorship.
3. Two named pilot partner case studies on institutional flow scenarios (RWA settlement, vault modelling, stablecoin reserve validation). Co-published on both sides.