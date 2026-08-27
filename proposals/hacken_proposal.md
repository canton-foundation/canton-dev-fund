# Proposal: Extractor by Hacken — Canton Monitor (v4, Co-Investment & Adoption-Weighted)

## Grant Team Feedback Incorporated

This revision responds directly to feedback from the Canton Foundation grant team. Two structural changes:

1. **Co-investment model with fixed USDT reference.** The total engineering and adoption effort for this scope is **$125,000 USDT**, fixed at the time of submission (7 May 2026). The Foundation grant covers 860,000 CC of this scope; Hacken directly covers the balance in-kind as an engineering and maintenance co-investment. Framing the total in USDT makes the scope comparable across the review cycle and independent of intra-period token movement.
2. **Adoption-weighted milestones (50/50).** Canton's 860,000 CC is split evenly between build milestones and adoption milestones. Build funds unlock on code and documentation deliverables; adoption funds unlock only when Canton participants and SV-approved compliance vendors actually deploy or consume Extractor in production. Reviewers do not pay for shelfware.

Everything below has been updated to reflect this model.

## Overview

Extractor by Hacken's Canton Monitor is an open-source, participant-local, Daml-native runtime monitoring and party-risk-scoring stack built specifically for the Canton Network. It is designed to operate next a customer's participant node, connected to the Ledger API and other exposed APIs, so it can detect topology, permission, key-management, and behavioral anomalies that off-node analytics vendors cannot observe under Canton's sub-transaction privacy model.

The monitor emits standardized, hashed, SIEM-consumable alerts and party-risk scores for validators, super validators, app providers, custodians, auditors, and compliance teams — without exfiltrating sensitive business data. Its detector schema and policy packs are published as reference infrastructure that other Canton ecosystem participants can adopt, extend, and integrate with existing SV-approved compliance providers (TRM Labs, Elliptic, Lukka) and static-analysis tools (OpenZeppelin daml-lint).

## Language and Runtime Context

Canton smart contracts are written in Daml (Digital Asset Modeling Language), a purpose-built, statically typed, purely functional language rooted in Haskell and open-sourced under Apache 2.0 in April 2019. Daml source compiles to Daml-LF (Ledger Fragment) and executes on a runtime next to participant nodes. Authorization, visibility, and obligation tracking are first-class language primitives enforced by the compiler.

This has three consequences that shape every detector in this proposal:

1. **EVM-era monitoring assumptions do not port.** There is no public mempool, no flash-loan facility, no proxy-storage-slot pattern, no shared global state. Contracts are immutable and updated by archive-then-create rather than mutation. "ERC-20 transfer" is not a native primitive; the equivalent is a Choice exercise on a Daml Asset template (CIP-56 / CIP-0086).
2. **Canton uses an extended UTXO model with lock-based conflict detection and two-phase commits.** The sequencer sees only encrypted payloads; the mediator processes informee trees. Cross-synchronizer reassignments are non-atomic two-phase operations with a "pending assignment" limbo state — a Canton-specific attack surface no existing tool covers.
3. **Sub-transaction privacy is architectural, not optional.** Only signatories, observers, and controllers see contract data. A validator that is not a stakeholder in a view sees nothing — not the payload, not the parties, not even that the sub-transaction exists. Any monitoring that respects the privacy guarantees must run next to the participant's own trust boundary.

Extractor's detectors are written to these primitives, not adapted from Solidity.

## How Extractor Differs from Existing Canton Monitoring

The Canton ecosystem already has monitoring and compliance providers, but they occupy different architectural layers. Extractor fills the missing in-node runtime tier.

| Provider | Canton status | Layer | What they cover today | Extractor complement |
| :---- | :---- | :---- | :---- | :---- |
| Hypernative | Super Validator, Weight 1, CIP-0076 Final (2025-09-09) | Off-node, SV-node view of Global Synchronizer | Canton Coin balance-change and transfer detection, configurable alerts, cross-chain risk research (much of it flagged "future"); no Daml-native detectors, no topology-drift, no in-node deployment | Extractor runs next to the client's participant node and reads Ledger API views the SV cannot see |
| TRM Labs | Super Validator, Weight ~2.5, CIP-0043 Final (2025-02-24) | Off-node SaaS via TEE + guardian-granted access | AML monitoring of Canton Coin and USDC for TRM customers, pseudonymized transaction insight on elevated risk | Extractor emits hashed, standardized alerts consumable by TRM's compliance workflows |
| Elliptic | Super Validator, Tier 4 / Weight 0.5, CIP-0044 Final (2025-02-14) | Off-node SaaS | Canton Coin and USDC transaction monitoring integrated with Elliptic's AML product (Circle-requested for USDC) | Extractor provides runtime signals (topology, key, behavioral) that Elliptic's off-chain product cannot produce |
| Lukka | GSF General Member + Super Validator | Off-node SaaS, multi-chain | KYC/AML platform, wallet monitoring, counterparty risk, crypto investigations | Extractor provides the participant-side runtime detection layer Lukka can consume via webhook exports |
| OpenZeppelin daml-lint | Rust static analyzer with six shipped detectors | Compile-time SAST | Missing ensure clauses on decimal fields, unguarded division, non-deterministic Ledger-API ordering, etc. | Extractor is the runtime / dynamic counterpart to daml-lint's static analysis — same target language, opposite phase |
| HackenProof | Canton ecosystem partner | Human-in-the-loop | Crowdsourced bug bounty, smart contract audits, dApp audits, pentesting | Extractor produces the machine signals human researchers escalate against |
| CARA | Ecosystem dApp demo | App-layer, selective disclosure | Privacy-preserving compliance dApp | Distinct layer — CARA discloses to regulators; Extractor detects for operators |

The gap Extractor addresses: no existing Canton participant — including SV-approved compliance providers TRM (CIP-0043), Elliptic (CIP-0044), and Hypernative (CIP-0076) — ships an open-source, in-node, Daml-native runtime detector and party-risk-scoring engine bound to the Ledger API. Extractor is that missing tier and is designed to be consumed by, not to compete with, the vendors above.

## Core Architectural Principles

To provide mathematically sound monitoring without violating Canton's privacy guarantees or requiring heavy centralized indexing, our architecture adheres strictly to the following principles:

1. **Point-in-Time & Stateless Monitoring.** True counterparty scoring in Canton cannot rely on fabricated global histories or heavy network indexing. Our engine evaluates third-party risk strictly through active topology snapshots (Zero-Day Assessment) and live, in-memory rolling windows (Live Posture Degradation), keeping execution lightweight and real-time.
2. **Zero Data Loss & Crash-Safe Recovery.** Unlike generic block-explorers, our engine binds directly to the participant node's specific database cursor (local offsets). Detector state is causal within the local view. If the network drops or the monitor restarts, it resumes reading exactly where it left off — zero missed events, no duplicate out-of-order alerts.
3. **Privacy-Preserving Alerting (No Data Exfiltration).** Raw private contract payloads never leave the local infrastructure. When cross-participant coordination or external alerting is required, only minimal anonymized metadata is transmitted — event class, severity, timestamp, and hashed entity references. Zero leakage of sensitive business data.
4. **Strict Cryptographic Multi-Tenancy.** For infrastructure providers hosting multiple clients on a single Participant Node (Kiln, P2P.org, Fireblocks, Taurus, Blockdaemon, and similar), our engine guarantees strict Party-level isolation. All monitoring queries are bound directly to Daml Party JWTs (`readAs` claims), mathematically ensuring zero cross-tenant data leakage.

## The Counterparty Risk Engine

Because of Canton's strict sub-transaction privacy, when an unknown counterparty attempts to interact with a monitored client, their external history is mathematically invisible. Our scoring engine therefore evaluates counterparty risk strictly on what is observable within the client's authorized view — a scoring model designed for privacy-preserving networks, not ported from EVM.

We use a 3-Pillar model that assesses the counterparty at the exact moment of interaction:

### Pillar 1 — Identity and Topology Hygiene (40%)

Point-in-time assessment of the counterparty's public routing infrastructure via the Ledger API:

* Participant Node Reputation: Scores the counterparty's active `PartyToParticipant` mapping, penalizing delegation to unknown or unverified participant nodes.
* Hosting Volatility (Drift): Triggers immediate alerts if the counterparty unexpectedly changes hosting providers mid-relationship.

### Pillar 2 — Key Management and Permission Risk (35%)

Point-in-time assessment of the counterparty's cryptographic security posture:

* Active Confirmation Thresholds: Scores the party's current `PartyToParticipant` — rewarding strong multi-sig setups, penalizing single-signature vulnerabilities.
* Live Capability Drift: Detects sudden, mid-transaction grants of `Submission` or `Confirmation` capabilities to new, unverified participant nodes.

### Pillar 3 — Live Behavioral and Transactional Risk (25%)

Real-time velocity and Sybil detection executed strictly within the client's shared contracts:

* Live Velocity Spikes: Detects sudden, unnatural bursts in `Create`/`Archive` volume from the counterparty against the client's shared contracts.
* Contract Stakeholder Bloat: Monitors the total number of `signatories` and `observers` inside newly proposed contracts to flag database-bloat or Sybil-style spam attempts during the first moments of interaction.
* Reassignment Anomalies: Detects stalled or anomalous cross-synchronizer reassignments (unassign → pending → assign) — a Canton-specific attack surface no current tool covers.

### Internal Observability & System Health

(This measures the operational health of the monitor and the client's node, and is intentionally excluded from external counterparty risk scores.)

To ensure monitoring confidence and operational stability, the stack includes native telemetry:

* Connection Stability: Monitors the monitor's own connection health, flagging auth-token churn, expiry failures, or gRPC stream disconnects.
* Node Telemetry (Where Authorized): If granted administrative access to the client's Participant Node metrics, the monitor tracks sequencer ingestion delays and database desynchronization and warns the client of infrastructure degradation.

## Regulatory Rationale

Institutional participants on Canton — custodians, tokenized-asset issuers, wallet providers, and application operators — are already subject to statutory transaction-monitoring and operational-resilience obligations. Canton's sub-transaction privacy model means banks and custodians cannot rely on a public block explorer or a purely off-chain analytics vendor to discharge these obligations — the vendor only ever sees what has been permissioned to it. A participant-local monitor that emits standardized, hashed, exportable alerts inside the institution's own trust boundary is the natural architectural answer, and it produces evidence a regulator will accept (immutable, timestamped, party-scoped, SIEM-consumable) without violating Canton's privacy design.

Top-priority regimes for Canton institutional participants:

* **EU — MiCA + AMLR + DORA.** Since 30 December 2024, CASPs must run ongoing monitoring of the business relationship and transactions on a risk-sensitive basis; perform sanctions and PEP screening; conduct market-abuse surveillance under Article 92; and comply with ICT risk-management and third-party resilience under DORA.
* **US — NYDFS 3 NYCRR Part 504.** All NYDFS-regulated institutions, including New York-licensed virtual currency businesses (BitLicense) since 2018, must maintain reasonably designed transaction-monitoring and filtering programs for BSA/AML and OFAC sanctions, with an annual senior-officer certification filed by 15 April. NYDFS enforced this against Coinbase in a USD 100M consent order.
* **FATF Recommendations 10, 15, and 16 (Travel Rule).** Ongoing customer and transaction monitoring, sanctions screening on originator and beneficiary, and Travel Rule data transmission on VA transfers at or above the USD/EUR 1,000 threshold in most jurisdictions.
* **UAE — VARA (Dubai) and ADGM FSRA (Abu Dhabi).** Both require transaction-monitoring systems, Travel Rule compliance, and sanctions screening for licensed VASPs — directly relevant to Canton's tokenized-asset issuer footprint in the region.
* **Global — Basel Committee SCO60.** Banks holding tokenized or crypto exposure must demonstrate risk-management infrastructure, including transaction monitoring for the underlying networks.

Additional regimes addressed in the appendix: US FinCEN/BSA, US OFAC, UK FCA MLR 2017, Singapore MAS PSN02.

Extractor is the runtime and evidence-generation layer these obligations increasingly demand for privacy-preserving institutional blockchains.

## Prospective Design Partners and Launch Cohort

Extractor is being specified with design partners drawn from the Canton ecosystem rather than built to a Hacken-internal roadmap. Design partners will commit to three things: reviewing the detector specification before implementation, running a pre-release build next to their own participant node, and providing written feedback on false-positive rates and operational fit before each milestone is submitted for acceptance.

Each partner confirms in writing the scope of their participation, and whether they consent to be named publicly, before Milestone 1 begins.

**Prospective Design partners**

* **Obsidian Systems** - Super Validator; Digital Asset's official Daml 3 and Canton Network training provider; builds regulated capital-markets infrastructure on Canton in production. Scope: review of detector semantics against idiomatic Daml, and validation that detectors correctly interpret Ledger API state under real institutional workflows. Named contact: Ali Abrar, Co-Founder and Partner.
* **Zenith** - Tier-1 Super Validator on the Global Synchronizer; the canonical EVM and SVM execution layer for Canton. Scope: monitoring coverage for participants running EVM workloads that compose atomically with Daml contracts, a deployment profile that combines Daml-native detection with Extractor's existing EVM detector set. Named contact: Heslin Kim, Co-Founder and CBO.
* **IntellectEU** — Premier Member of the Canton Foundation and a founding member of the Canton Network; operates Super Validator and 100+ validator node deployments on the Global Synchronizer through its CatalyX platform, ran the node infrastructure behind Société Générale's first US digital bond issuance on Canton and the Canton Industry Working Group's cross-border intraday repo rounds with DTCC, LSEG, Euroclear and Tradeweb, and built Catalyst Package Manager, the Canton application registry. Scope: operational fit at fleet scale — validation that Extractor installs, upgrades and routes alerts cleanly inside a managed, multi-tenant node operation, and that false-positive rates are tolerable against a professional operator's on-call and SLA model rather than a single security-literate team's. Named contact: Jonathan Mayeur, Head of Product and Canton Foundation Board Member.

**Why this cohort**

The three partners cover the deployment surface end to end. Obsidian validates that the detectors are correct in native Daml terms. Zenith validates that the monitor holds up where Solidity execution composes with Daml settlement, which is where the runtime attack surface is least understood today. IntellectEU validates that the monitor is *operable* — that it can be deployed, upgraded and triaged by the operator running a large share of the network's participant infrastructure on behalf of institutions, not just by a security team on a single node it owns. None of the three is a Hacken customer of the monitoring product, so their feedback is not commercially conflicted.

The launch cohort is open. Any Canton participant willing to run a pre-release build and report findings can join by opening an issue in the project repository.

## Funding Model — Co-Investment Structure

**Total scope value: $125,000 USDT.** This is the fully-loaded engineering and adoption cost of the deliverables below, denominated in USDT so the review committee can assess the scope on a stable reference. The value was fixed at the time of proposal submission (7 May 2026) and does not float with intra-period Canton Coin market movement. The commitment is split between a Canton Foundation grant and a Hacken co-investment.

| Source | Amount | USDT equivalent | Share of total |
| :---- | :---- | :---- | :---- |
| Canton Foundation grant | 860,000 CC | ~$78,000 USDT | ~62% |
| Hacken co-investment (in-kind engineering and maintenance) | Balance of the $125,000 USDT scope | ~$47,000 USDT | ~38% |
| **Total** |  | **$125,000 USDT** | **100%** |

Canton Coin equivalents in this table are calculated at the submission-date price of approximately $0.091 per CC and are indicative only. The Foundation grant is fixed at 860,000 CC and Hacken's co-investment is fixed at approximately $47,000 of engineering and maintenance, so neither side is exposed to CC price movement inside the delivery window.

Hacken commits internal engineering and security-research time at its own cost as the co-investment tranche. This gives Hacken direct financial skin in the game and ensures the delivery team is not merely fulfilling a paid scope — Hacken is contributing capital alongside the Foundation. The USDT anchor lets the Foundation, Hacken, and any subsequent reviewer agree on scope value on a stable reference.

The Canton Foundation's 860,000 CC is further split **50/50 between build and adoption milestones**, per the grant team's guidance that a meaningful share of grant funds should track ecosystem impact and client uptake rather than pure deliverable payouts.

| Envelope | Amount | Share | Trigger type |
| :---- | :---- | :---- | :---- |
| Build milestones (M1–M4) | 430,000 CC | 50% of grant | Code, docs, releases |
| Adoption milestones (A1–A4) | 430,000 CC | 50% of grant | Production integrations, vendor uptake, ecosystem-standard adoption |

Reference for scale: the Canton Foundation Development Fund has committed ~230M CC and allocated ~70M CC to date across 20 funded teams; the largest individual grant publicly known is BitSafe Decentralization Manager at ~8.5M CC. This request is a small fraction of typical infrastructure allocations, and 50% of it is contingent on measurable Canton adoption.

## Build Milestones (Grant Envelope A — 430,000 CC)

### Milestone 1 — Canton Connector & Core Ingestion

Duration: 4 weeks | Funding: 105,000 CC

Deliverables:

* Open-source Canton ingestion adapter connecting to the Ledger API (Update/State Services).
* Support for data ingest and data events replay for crash-safe recovery.
* Docker and Helm reference deployment.

Acceptance Criteria:

* Fresh deployment can bootstrap visible active state and continue from persisted offset after restart.
* Demo environment ingests contract `Create` / `Exercise` / `Archive` events and topology changes correctly.
* Public repository, build instructions, and deployment docs are published.

### Milestone 2 — Privacy-Aware Detector Pack

Duration: 4 weeks | Funding: 160,000 CC

Deliverables:

* Reference detector pack covering, in Daml/Canton primitives:
  * Topology drift (`PartyToParticipant`, hosting-provider volatility)
  * Key and capability drift (`PartyToParticipant` threshold drops, mid-relationship `Submission`/`Confirmation` grants)
  * Contract stakeholder / observer anomaly (Sybil and database-bloat detection)
  * Reassignment limbo (stalled or anomalous cross-synchronizer unassign→pending→assign)
  * Informee-tree anomaly signals within authorized local views
* Real-time alerts with webhook capabilities.
* Reference detectors policy packs defining thresholds for participant-wide and institution-local monitoring.

Acceptance Criteria:

* Test fixtures and scripted demo scenarios trigger the expected alerts.
* Detector outputs contain severity, entity identifier, reason, timestamp, and policy metadata.
* Documentation explains exactly what each detector can and cannot see under Canton's strict sub-transaction privacy assumptions.

### Milestone 3 — Party Risk Scoring Pack

Duration: 3 weeks | Funding: 105,000 CC

Deliverables:

* Real-time Party Risk Scoring Engine optimized for Canton's privacy model (no global network indexing or historical profiling required).
* 3-Pillar reference scoring logic: Identity/Topology Hygiene, Key Management Risk, Live Behavioral Anomalies.
* Score event export schema.
* Reference observability configurations and export and integration capabilities with common SIEM and GRC platforms.

Acceptance Criteria:

* Score updates are generated within 60 seconds of a triggering event in the reference deployment.
* At least three policy profiles included: custodian, validator / operator, institutional app provider.
* Sample exports can be consumed by downstream reporting or SIEM systems.

### Milestone 4 — Open Release, Docs, and Ecosystem Handoff

Duration: 3 weeks | Funding: 60,000 CC

Deliverables:

* Full docs for deployment patterns, security hardening, privacy boundaries, and maintenance.
* Example integrations for Ledger API deployments.
* Public demo and walkthrough.
* Backlog, issue templates, maintainer guide, versioning policy.

Acceptance Criteria:

* Public repositories, tagged release, and setup docs are available.
* Demo shows end-to-end ingestion → alert → score update flow.
* Maintainer and upgrade documentation is sufficient for third-party adoption.

## Adoption Milestones (Grant Envelope B — 430,000 CC)

Adoption milestones unlock only after Extractor is deployed or consumed in production. Each milestone has a binary, externally verifiable trigger. Reviewers do not pay for shelfware. The adoption phase runs for a target of six months following completion of Milestone 4, with the Foundation retaining the right to re-baseline timing on request.

### A1 — First Production Deployment on an SV or GSF-Member Participant Node

Funding: 103,200 CC (24% of adoption envelope)

Trigger:

* Signed integration agreement with one Canton Super Validator, GSF member, or infrastructure provider hosting an SV-approved participant node.
* Extractor running in production against that participant for a minimum of 30 continuous days.
* At least one real-world alert or party-risk-score event triaged during the deployment window.

Target counterparties (or equivalent): Kiln, P2P.org, Fireblocks, Taurus, Blockdaemon, Bitcoin Suisse.

Verification: written attestation from the counterparty + public reference (case study or CIP-thread post) with sensitive details redacted.

### A2 — Three Additional Production Integrations Across Custodian / Wallet / Issuer Categories

Funding: 154,800 CC (36% of adoption envelope)

Trigger:

* Three additional production integrations across at least two of: institutional custodians, wallet providers, tokenized-asset issuers, and institutional application operators.
* Each integration must be live for ≥30 continuous days.
* Each integration must produce at least one triaged alert or party-risk-score event.

Verification: three separate written attestations from counterparties + aggregated public case-study post via HackenProof or Canton Foundation blog.

### A3 — Consumed by an SV-Approved Compliance Vendor

Funding: 86,000 CC (20% of adoption envelope)

Trigger:

* At least one SV-approved compliance vendor (TRM Labs, Elliptic, Lukka, or Hypernative) formally ingests Extractor's alert schema via webhook or API in one of their production compliance workflows.
* Signed integration agreement OR a public CIP-addendum documenting the integration OR a joint blog post from the vendor and Hacken.

Verification: signed integration agreement or public CIP/joint post referencing Extractor as an upstream data source.

### A4 — Ecosystem-Standard Detector Schema Adoption

Funding: 86,000 CC (20% of adoption envelope)

Trigger (any one of the following):

* Extractor's detector or policy pack schema referenced or adopted by at least two other Canton ecosystem grantees.
* Merged into a Canton Foundation reference-implementation repository.
* Proposed as, or accepted into, a formal CIP.

Verification: public repository references, merged pull requests, or CIP-repo activity.

## Target Adoption Funnel (Named Logos)

Extractor's go-to-market targets the Canton participants with the most operational blind spots and the strongest institutional compliance obligations. Named targets by category:

| Category | Named targets |
| :---- | :---- |
| Institutional custodians | Taurus, Fireblocks, Bitcoin Suisse |
| SV and GSF-member infrastructure providers | Kiln, P2P.org, Blockdaemon |
| Wallet / custody providers | (subset of above plus institutional wallet operators) |
| Tokenized-asset issuers | GSF-member issuers publishing on the Global Synchronizer |
| SV-approved compliance vendors (integration consumers) | TRM Labs, Elliptic, Lukka, Hypernative |

Hacken already has existing commercial or ecosystem relationships across a subset of these targets via HackenProof, Extractor's multi-chain footprint, and Hacken's role as an official Canton Network auditing provider (announced June 2026). Adoption milestones will draw from this pipeline; substitutions with equivalent Canton participants are permitted subject to Foundation approval.

## Long-Term Maintenance and CVE Response

Extractor is committed to post-grant maintenance as a first-class deliverable, addressing the Canton Foundation's explicit evaluation criterion of "provisions for long-term maintenance":

* **Maintainer commitment:** Hacken assigns a dedicated maintainer for a minimum of 24 months after Milestone 4 completion, funded from Hacken's co-investment envelope where applicable.
* **Release cadence:** Semantic-versioned minor releases at least quarterly; patch releases as needed.
* **CVE response SLA:** Critical CVEs affecting Extractor or its detectors are triaged within 24 hours and patched within a target of 7 days, with coordinated disclosure through HackenProof's established vulnerability-handling process.
* **Canton protocol tracking:** Compatibility with each Canton major release (e.g., 3.3 → 3.4) is guaranteed within 30 days of the release, subject to Daml-LF API stability.
* **Backlog and governance:** All roadmap, backlog, and issue triage is public in the project repository under an OSS governance model that welcomes third-party maintainers.
* **Security disclosure channel:** A dedicated security@ inbox and a HackenProof bounty scope for Extractor itself.

## GTM Strategy

Canton is now at the stage where security and compliance infrastructure stops being optional and becomes ecosystem-critical. Official pilot materials state that 45 financial institutions, asset managers, and service providers are connected on the network, with workflows executed across 22 permissioned blockchains, and public trackers now reference more than 200 partners and over USD 6 trillion in tokenized real-world assets. The Canton Foundation's Development Fund is explicitly intended to support security enhancements, audits, reference implementations, and critical infrastructure. Extractor fits that mandate directly.

**Extractor's wedge:** no existing Canton participant — including SV-approved compliance providers TRM Labs (CIP-0043), Elliptic (CIP-0044), and Hypernative (CIP-0076) — ships an open-source, next-to-node, Daml-native runtime detectors and party-risk-scoring engine. Extractor fills that architectural gap while remaining privacy-compatible with, and consumable by, those vendors.

**Adoption model.** Our go-to-market starts with the parts of the Canton ecosystem that have the most to lose from operational blind spots and the most to gain from runtime controls: custodians (Taurus, Fireblocks, Bitcoin Suisse), validators and super validators, wallet and custody providers, tokenized-asset issuers, and institutional application operators. We land with one participant, one deployment, one critical use case — topology drift, permission and key-risk changes, abnormal behavioral patterns, and participant-node health. Once value is proven, we expand into higher-order detectors and compliance workflows. Adoption milestones A1–A4 make this progression contractually measurable rather than aspirational.

**Ecosystem positioning.** Extractor is designed to be complementary, not competitive, with:

* Compile-time Daml linting (OpenZeppelin daml-lint) — Extractor is the runtime counterpart.
* Off-node AML analytics (TRM Labs, Elliptic, Lukka) — Extractor emits hashed, standardized alerts these vendors can consume.
* SV-side event indexing (Hypernative) — Extractor covers the in-node signals Hypernative cannot see from its SV vantage point.
* Crowdsourced audit (HackenProof) — Extractor generates the machine signals human researchers escalate against.

**Champion and outreach path.** As an external proposal, we plan to secure a Tech & Ops Committee champion via targeted engagement with the Canton Foundation, Digital Asset, and compliance-track Super Validators (TRM Labs, Elliptic, Lukka, Hypernative) who benefit directly from Extractor's alert schema as an upstream data source. Hacken's status as an official Canton Network auditing provider gives a natural entry point.

**Distribution.** Standardization on Extractor's detectors and policy packs turns it into reference infrastructure the rest of the ecosystem can adopt with minimal implementation effort — exactly the "reference implementation" grant category and the Foundation's stated common-good ethos. Adoption milestone A4 formally rewards this outcome.

## Why Extractor by Hacken

Extractor by Hacken is already a production real-time monitoring platform with battle-tested detector and scoring concepts across multi-chain and institutional use cases. The team's existing Canton roadmap already includes:

* Ledger API connectivity
* Authoritative contract / transaction / topology data ingestion
* Daml contract state tracking
* Canton-specific risk-detection and anomaly detectors
* Operational dashboard support

Relevant background strengths:

* Production experience with real-time on-chain monitoring across multiple chains.
* Existing detector / trigger framework proven in institutional environments.
* Experience turning event streams into risk scores and dashboards.
* Institutional and regulatory monitoring experience — Hacken Group services 300+ Web3 projects and operates HackenProof, a Canton ecosystem partner.
* **Hacken is an official Canton Network auditing provider** (announced June 2026), giving direct working relationships with financial institutions, tokenized-asset issuers, and application developers on Canton.
* Access to Daml practitioner expertise for language-native detector authoring.
* MESA (Middle East Stablecoin Association) board presence, giving direct regulatory exposure to VARA, ADGM, and regional compliance regimes relevant to Canton's tokenized-asset issuer footprint.
* **Certified Daml practitioners on staff:** Team members hold Digital Asset certifications including Daml Contract Developer and Daml Philosophy. Detectors are authored by people who have passed Digital Asset's own bar, not adapted from Solidity by analogy.
* **Published Canton security research:** Hacken's comparative analysis of CIP-0056 against ERC-20, including a template-by-template review of OpenZeppelin's canton-token-template, sets out precisely why Canton's token model eliminates a family of EVM attack classes and replaces them with registry integrity risk, off-ledger infrastructure exposure, and application-level invariants the ledger no longer enforces automatically. Those residual risks are runtime properties. Neither an audit nor a static analyser can observe an invariant holding over time. That finding is the technical basis for this proposal.
* **HackenProof** is listed in the Canton ecosystem as a crowdsourced security platform serving Canton participants.

## Summary

Extractor by Hacken's Canton Monitor is an open-source, participant-local, Daml-native runtime monitoring and party-risk-scoring stack for the Canton Network. It connects to the Ledger API, runs privacy-aware real-time detectors, scores interacting party risk, and emits standardized alerts and exports for validators, app providers, custodians, auditors, and compliance teams — all while respecting Canton's sub-transaction privacy model. It occupies the missing in-node runtime detection layer and is designed to complement, not compete with, existing SV-approved compliance vendors (TRM Labs, Elliptic, Lukka, Hypernative) and static-analysis tools (OpenZeppelin daml-lint).

**Funding structure:** Total scope value **$125,000 USDT** (fixed at submission on 7 May 2026). Canton Foundation grant of **860,000 CC** (~$78,000 / ~62%) covers the majority of this scope, paid on milestones; Hacken co-invests the balance of ~$47,000 (~38%) in-kind at its own cost. Grant funds are split 50/50 between build milestones and adoption milestones tied to real Canton participant deployments and SV-approved vendor integrations.

## Appendix A — Additional Regulator Regimes

Beyond the top-priority regimes summarized above, Extractor is designed to produce evidence compatible with:

* **US — FinCEN / BSA (31 CFR Chapter X).** MSBs and money transmitters, including most Canton-connected custodians and stablecoin issuers, must file SARs and maintain effective transaction-monitoring programs.
* **US — OFAC.** Strict-liability sanctions screening and blocking obligations apply to any US person or US-touching transaction, regardless of chain privacy model.
* **UK — FCA (MLR 2017 as amended).** Registered cryptoasset firms must perform ongoing monitoring, sanctions screening, and SAR filing.
* **Singapore — MAS Payment Services Act (PSN02).** Ongoing transaction monitoring, Travel Rule, and STR filing are mandatory for DPT providers.
* **ESMA MiCA Article 92 market-abuse surveillance.** ESMA designated Solidus Labs as sole official trade-surveillance provider for the 30 NCAs in July 2025 — Extractor's runtime alerts are designed to feed into such surveillance workflows via SIEM-consumable exports.

## Appendix B — Extractor Detector Catalog Adapted for Canton

Detectors reframed in Daml/Canton primitives rather than EVM analogs.

### Security Monitoring

| Detector | Description | Canton adaptation |
| :---- | :---- | :---- |
| AML Detector | Screens interacting parties against AML lists | Adaptable — screens Daml Party IDs and registered Splice ANS names; integrates with SV-approved feeds from TRM, Elliptic, and Lukka as initial dataset sources |
| Chainabuse Monitor | Filters malicious activity via Chainabuse.com reports | Yes — Chainabuse has begun tracking Canton entities |
| DNS Monitor | WHOIS/DNS record monitoring for hijacking | Yes — critical for Canton Node API endpoints |
| GitHub Monitor | Tracks activity on a GitHub repository | Yes — standard Web2 supply-chain tracking |
| Network Monitor | HTTP API uptime with periodic GET/POST | Yes — vital for Participant Node uptime |
| NIST Alerts Monitor | Tracks new CVEs with LLM-enriched NIST NVD analysis | Yes — vital for node-infrastructure vulnerability monitoring |
| Multi-signature Monitor | Tracks signing activity on multi-sig contracts | Adaptable — Canton's Daml authorization model is natively multi-party; we track signatory progress on shared contracts |
| Security Sleuth | Twitter security-sentiment monitor with LLM analysis | Yes — universal Web2 intelligence |
| SSL Monitor | Certificate validity and expiration checks | Yes — necessary for Canton gRPC/REST endpoints |
| Tracker | Tracks native transfers with address labelling | Adaptable — tracks Canton Coin ($CC) flows between public Party IDs via the Scan API |
| Wallet | Native and token balance monitoring with change alerts | Adaptable — Canton Coin balance monitoring is directly supported |

### Advanced Monitoring (Triggers) — Daml-native

| Detector | Description | Canton adaptation |
| :---- | :---- | :---- |
| Asset-Transfer Choice Trigger | Alerts on asset-transfer choices above a threshold | Native — monitors Transfer choices on Daml Asset templates (CIP-56, CIP-0086) and public $CC transfers |
| Blacklisted-Party Trigger | Alerts if a blacklisted party initiates a command | Native — triggers when a blacklisted Party ID submits a command to a monitored contract |
| Whitelisted-Party Trigger | Alerts if an unknown party initiates a command | Native — triggers when an unwhitelisted Party ID interacts with a monitored contract |
| Choice-Argument Trigger | Fires when choice arguments match customized rules | Native — evaluates `create_arguments` JSON of a Daml contract at Choice exercise |
| Choice-Exercise Trigger | Alerts when a specific choice is exercised | Native — monitors Choice exercises on any Daml template |
| Event Trigger | Alerts on contract events | Native — translates to `CreatedEvent` or `ArchivedEvent` on the Ledger API |
| Reassignment Trigger | Alerts on cross-synchronizer reassignments | Canton-native (no EVM analog) — covers unassign→pending→assign anomaly detection |

### Compliance & Financial Monitoring

| Detector | Description | Canton adaptation |
| :---- | :---- | :---- |
| Circulation Supply Monitor | Real-time mint/burn tracking | Adaptable — aggregates public mint and burn operations of Canton Coin via the Scan API; extensible to CIP-56 tokens |
| Price Monitor | Oracle or CoinGecko price feed monitoring | Yes — applicable where Web2 oracles track Canton assets |
| Total Supply Monitor | Alerts when issued supply exceeds threshold | Adaptable — CIP-56 supports a `totalSupply()` function |
| TVL Monitor | Tracks liquidity drops in native coins or tokens held by a contract | Adaptable — aggregates value of active Daml contracts where a specific Party is custodian |
| Transfers Detector | Tracks transfers | Adaptable — Canton Coin flows and CIP-56 transfers |

### Beta Features

| Detector | Description | Canton adaptation |
| :---- | :---- | :---- |
| Contract Call Monitor | Executes contract calls to extract results | Adaptable |
| Cron | Periodic tasks or events on a schedule | Yes — universal workflow |
| Proof of Reserves Monitor | Monitors PoR attestations for configured contracts | Adaptable — conceptually valid if PoR attestations are pulled into a Canton smart contract |

## Sources and References

* Canton Foundation Grants Program: [https://canton.foundation/grants-program/](https://canton.foundation/grants-program/)
* Canton Development Fund GitHub: [https://github.com/canton-foundation/canton-dev-fund](https://github.com/canton-foundation/canton-dev-fund)
* Canton Dev Fund tracker: [https://cantonnews.org/network/dev-fund](https://cantonnews.org/network/dev-fund)
* CIP-0043 (TRM Labs) and CIP-0044 (Elliptic): [https://deepwiki.com/canton-foundation/cips/6.2-compliance-and-monitoring-services](https://deepwiki.com/canton-foundation/cips/6.2-compliance-and-monitoring-services)
* CIP-0076 (Hypernative): [https://deepwiki.com/canton-foundation/cips/6.1-data-and-analytics-providers](https://deepwiki.com/canton-foundation/cips/6.1-data-and-analytics-providers)
* TRM Labs on Canton: [https://www.trmlabs.com/resources/blog/trm-labs-partners-with-canton-network-to-strengthen-risk-management-on-privacy-enabled-networks](https://www.trmlabs.com/resources/blog/trm-labs-partners-with-canton-network-to-strengthen-risk-management-on-privacy-enabled-networks)
* Lukka on Canton: [https://canton.foundation/gsf-welcomes-lukka-membership/](https://canton.foundation/gsf-welcomes-lukka-membership/)
* OpenZeppelin on Canton smart contract security (incl. daml-lint): [https://www.openzeppelin.com/news/smart-contract-security-for-institutional-finance-on-canton-an-entirely-different-problem](https://www.openzeppelin.com/news/smart-contract-security-for-institutional-finance-on-canton-an-entirely-different-problem)
* Canton privacy model: [https://docs.canton.network/appdev/modules/m7-compliance](https://docs.canton.network/appdev/modules/m7-compliance) and [https://canton.wiki/learn/canton-network-privacy](https://canton.wiki/learn/canton-network-privacy)
* Daml language reference: [https://canton.wiki/learn/daml-smart-contracts-guide](https://canton.wiki/learn/daml-smart-contracts-guide) and [https://arxiv.org/pdf/2303.03749](https://arxiv.org/pdf/2303.03749)
* Hacken as official Canton Network auditing provider: [https://cantonnews.org/hacken-becomes-official-auditing-provider-for-canton-network](https://cantonnews.org/hacken-becomes-official-auditing-provider-for-canton-network)
* NYDFS 3 NYCRR Part 504: [https://www.dfs.ny.gov/industry_guidance/transaction_monitoring](https://www.dfs.ny.gov/industry_guidance/transaction_monitoring)
* FATF VA/VASP Targeted Update (June 2023): [https://www.fatf-gafi.org/content/dam/fatf-gafi/guidance/June2023-Targeted-Update-VA-VASP.pdf.coredownload.inline.pdf](https://www.fatf-gafi.org/content/dam/fatf-gafi/guidance/June2023-Targeted-Update-VA-VASP.pdf.coredownload.inline.pdf)
* MiCA CASP compliance stack: [https://didit.me/blog/mica-casp-compliance-stack/](https://didit.me/blog/mica-casp-compliance-stack/)
* ESMA MiCA final report: [https://www.esma.europa.eu/sites/default/files/2024-07/ESMA75-453128700-1229_Final_Report_MiCA_CP2.pdf](https://www.esma.europa.eu/sites/default/files/2024-07/ESMA75-453128700-1229_Final_Report_MiCA_CP2.pdf)
