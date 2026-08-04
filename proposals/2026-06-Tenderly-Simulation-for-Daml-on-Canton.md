# Tenderly Simulation for Daml on Canton: Grant Proposal Outline

**Author:** Tenderly

**Updated:** 16/06/26

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
- **State Forking (ACS Snapshots).** Developers provide a secure API key or snapshot of their Participant's **Active Contract Set (ACS)**. Tenderly hydrates the VPN with this data, so the developer can simulate transactions as if they were their specific **Party ID**.
- **Daml Engine Integration.** We integrate directly with the **Daml Interpreter**. Simulations run the actual Daml bytecode to ensure 1:1 parity with live execution, including complex authorization checks and fetch dependencies.
- **Cross-Domain Orchestration.** The simulation engine mocks the **Global Synchronizer** behavior, so contract migrations (handovers) between multiple domains can run inside a single "Dry Run" session.

#### Simulation capabilities

- **Transaction Tree Visualization.** View the full hierarchy of a transaction, including root exercises and nested children (Creates/Archives).
- **Privacy Projections.** Simulate "What Alice Sees" vs. "What Bob Sees." The engine flags if a transaction would fail due to a visibility leak or a stakeholder missing from the "need-to-know" projection.
- **Contract State Diff.** A before-and-after view of the ACS, highlighting exactly which contracts are archived and which are created.
- **Authorization Mocking.** Simulate a transaction under the authority of multiple parties to verify multi-sig or delegated workflows.
- **Failure Analysis.** Human-readable error messages for common Canton failures (e.g., *Inconsistent Transaction*, *Missing Authorization*, *Double-Spend Conflict*).

#### Developer interface

- **Tenderly Dashboard (Canton Edition).** A web-based "Sandbox" where developers paste Daml commands and see an instant visual trace of the resulting transaction tree.
- **Simulation API.** A RESTful endpoint for CI/CD pipelines, so teams can run regression simulations against a "Golden State" before every deployment.

#### Access control

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
- **Tranche:** **460,000 CC**

### Milestone 2: State Sync & Cross-Domain Mocking

- **Estimated Delivery:** Weeks 13 to 20
- **Focus:** Building the "Handover" logic to simulate atomic transactions that span multiple Synchronization Domains.
- **Hard targets:** Multi-domain simulation working across at least 2 distinct Synchronization Domains; ≥ 95% parity vs. live Canton execution on the agreed regression test suite.
- **Deliverables:** API support for "Multi-Domain Simulation" where a single request can simulate an asset move from Domain A to Domain B.
- **Tranche:** **325,000 CC**

### Milestone 3: Public Beta + Pilot Partners

- **Estimated Delivery:** Weeks 21 to 24
- **Focus:** First cohort of ecosystem partners and at least one hackathon onboarded.
- **Hard targets:** [X projects onboarded TBD]; [Y simulations executed TBD]; [Z traces inspected TBD]; [N named pilot partners TBD] live and using the tool. Final numbers to be agreed and locked with the Tech & Ops Committee before submission.
- **Deliverables / Value Metrics:** Usage telemetry shared with Tech & Ops Committee: number of projects onboarded, simulations executed, and traces inspected (final thresholds agreed with the Committee).
- **Tranche:** **290,000 CC**

### Milestone 4: 12-Month Operations & Version Tracking

- **Estimated Delivery:** Weeks 25 to 52
- **Focus:** Ongoing operation, version tracking, support, iteration.
- **Hard targets:** Canton/Splice releases tracked within 30 days, 100% of the time; ≥ 99.5% uptime on the simulation API; [X support tickets resolved within SLA TBD]; two co-published pilot partner case studies.
- **Deliverables / Value Metrics:** Continuous maintenance and bug fixing of the Canton network support. Bi-yearly usage reports to Tech & Ops Committee, Canton/Splice version tracking within 30 days of release, defined incident response SLA shared at M1, ongoing developer support.
- **Tranche:** **620,000 CC**

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

| **Milestone** | **Tranche (CC)** | **Covers** |
| --- | --- | --- |
| M1: Internal (Weeks 1 to 12) | 460,000 CC | Daml integration, simulation engine adaptation, simulation UI scaffolding, initial Daml/Canton specialization ramp-up, published SLA and version-tracking policy. |
| M2: State Sync & Cross-Domain (Weeks 13 to 20) | 325,000 CC | Multi-domain simulation engineering, Global Synchronizer mocking, regression suite build-out, infrastructure scale-up for hydration of larger ACS snapshots. |
| M3: Public Beta + Pilot Partners (Weeks 21 to 24) | 290,000 CC | Public beta launch (Dashboard + API), pilot partner onboarding, hackathon enablement, DevRel & documentation, first quarterly usage report. |
| M4: 12-Month Operations & Version Tracking (Weeks 25 to 52) | 620,000 CC | Hosting and infrastructure ops for the full pilot window, Canton/Splice version tracking, bug-fix and support channels, bi-yearly reporting, coordination & partner case studies. |
| Operational buffer | 180,000 CC | Unforeseen scope, additional Daml version support, scaling under heavier-than-expected adoption. Released only on Tech & Ops Committee approval against a specific change request. |
| **Total** | **1,875,000 CC** |  |

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