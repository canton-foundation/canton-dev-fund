# **Proposal: Open-source monitoring and risk-scoring stack for the Canton ecosystem**

## **Autor:** Denys Ivanov, Denys Matii, Andriy Kashcheyev

## **Abstract**

Extractor by Hacken’s Canton Monitor is an open-source, participant-local monitoring and risk-scoring stack built specifically for the Canton ecosystem. Designed to respect Canton’s strict sub-transaction privacy model, the monitor connects to the Ledger API and Admin API to run privacy-aware real-time detectors and score interacting party risk. It emits reusable, standardized alerts for validators, app providers, custodians, auditors, and compliance teams.

## **Objective** 

Build an open-source Canton monitoring package that any participant, validator, institution, or app provider can deploy inside its own trust boundary to:
* monitor real-time Canton ledger updates,
* detect risky or abnormal activity within the observer’s authorized view,
* score wallets / parties / participant relationships using a reference risk model,
* emit alerts and exports suitable for operations, compliance, and audit use cases.


## **Core Architectural Principles**

To provide mathematically sound monitoring without violating Canton's privacy guarantees or requiring heavy centralized indexing, our architecture strictly adheres to the following principles:

**1\. Point-in-Time & Stateless Monitoring** True counterparty scoring in Canton cannot rely on fake global histories or massive network indexing. Our engine evaluates third-party risk strictly through active topology snapshots (Zero-Day Assessment) and live, in-memory rolling windows (Live Posture Degradation), ensuring lightweight and real-time execution.

**2\. Zero Data Loss & Crash-Safe Recovery** Unlike generic block-explorers, our engine binds directly to the participant node's specific database cursor (local offsets). Detector state is causal within the local view. If the network drops or the monitor restarts, it resumes reading exactly where it left off, guaranteeing zero missed events and no duplicate out-of-order alerts.

**3\. Privacy-Preserving Alerting (No Data Exfiltration)** We respect Canton’s sub-transaction privacy model. Raw, private contract payloads never leave the local infrastructure. When cross-participant coordination or external alerting is required, we transmit only minimal, anonymized metadata (event class, severity, timestamp, and hashed entity references) to ensure zero leakage of sensitive business data.

**4\. Strict Cryptographic Multi-Tenancy** For infrastructure providers hosting multiple clients on a single Participant Node, our engine guarantees strict, party-level isolation. All monitoring queries are bound directly to Daml Party JWTs (`readAs` claims), mathematically ensuring zero cross-tenant data leakage.

---

## **The Counterparty Risk Engine**

Because of Canton’s strict sub-transaction privacy, when an unknown counterparty attempts to interact with a monitored client, their external history is mathematically invisible. Therefore, our scoring engine evaluates counterparty risk strictly based on what is observable within the client's authorized view.

We utilize a 3-Pillar scoring model that assesses the counterparty at the exact moment of interaction:

### **Pillar 1 — Identity and Topology Hygiene (40%)**

*Point-in-time assessment of the counterparty's public routing infrastructure:*

* **Participant Node Reputation:** Scores their active `PartyToParticipant` mapping, penalizing delegation to unknown or unverified participant nodes.  
* **Hosting Volatility (Drift):** Triggers immediate alerts if the counterparty unexpectedly changes hosting providers mid-relationship.

### **Pillar 2 — Key Management and Permission Risk (35%)**

*Point-in-time assessment of the counterparty's cryptographic security posture:*

* **Active Key Thresholds:** Scores the party's current `PartyToKeyMapping` (rewarding strong multi-sig setups, penalizing single-signature vulnerabilities).  
* **Live Capability Drift:** Detects sudden, mid-transaction grants of `Submission` or `Confirmation` capabilities to new, unverified participant nodes.

### **Pillar 3 — Live Behavioral and Transactional Risk (25%)**

*Real-time velocity and spam detection executed strictly within the client's shared contracts:*

* **Live Velocity Spikes:** Detects sudden, unnatural bursts in `Create`/`Archive` volume originating from the counterparty against the client's shared contracts.  
* **Contract Stakeholder Bloat:** Monitors the total number of `signatories` and `observers` inside newly proposed contracts to instantly flag database-bloat or Sybil-style spam attempts during the first moments of interaction.

---

## **Internal Observability & System Health**

*(Note: This measures the operational health of the monitor and the client's node, and is intentionally excluded from external counterparty risk scores).*

To ensure monitoring confidence and operational stability, the stack includes native telemetry tracking:

* **Connection Stability:** Monitors the monitor's own connection health, flagging auth token churn, expiry failures, or gRPC stream disconnects.  
* **Node Telemetry (Where Authorized):** If granted administrative access to the client's Participant Node metrics, the monitor can track sequencer ingestion delays and database desynchronization to warn the client of infrastructure degradation.

### **Milestones and Deliverables**

**Milestone 1 — Canton Connector & Core Ingestion** Duration: 4 weeks | Funding: 210,000 CC

**Deliverables**

* Open-source Canton ingestion adapter connecting to the Ledger API (Update/State Services) and Admin API (Topology Manager).  
* Offset persistence and replay support for crash-safe recovery.  
* Docker and Helm reference deployment.

**Acceptance Criteria**

* Fresh deployment can bootstrap visible active state and continue from persisted offset after restart.  
* Demo environment ingests contract create / exercise / archive events and topology changes correctly.  
* Public repository, build instructions, and deployment docs are published.

---

**Milestone 2 — Privacy-Aware Detector Pack** Duration: 4 weeks | Funding: 320,000 CC

**Deliverables**

* High-level reference detector pack covering real-time Topology Drift, Submission/Confirmation Risk, and Party Behavior Anomalies (focused strictly on authorized local views).  
* Real-time alert schema with webhook export capabilities.  
* Reference policy packs defining thresholds for participant-wide and institution-local monitoring.

**Acceptance Criteria**

* Test fixtures or scripted demo scenarios trigger the expected alerts.  
* Detector outputs contain severity, entity identifier, reason, timestamp, and policy metadata.  
* Documentation explains exactly what each detector can and cannot see under Canton’s strict sub-transaction privacy assumptions.

---

**Milestone 3 — Party Risk Scoring Pack** Duration: 3 weeks | Funding: 210,000 CC

**Deliverables**

* Real-time Party Risk Scoring Engine optimized for Canton's privacy model (no global network indexing or historical profiling required).  
* 3-Pillar reference scoring logic: Identity/Topology Hygiene, Key Management Risk, and Live Behavioral Anomalies.  
* Score event export schema.  
* Reference observability configurations and machine-readable compliance export formats.

**Acceptance Criteria**

* Score updates are generated within 60 seconds of a triggering event in the reference deployment.  
* At least 3 policy profiles are included (custodian, validator / operator, institution app provider).  
* Sample exports can be consumed by downstream reporting or SIEM systems.

---

**Milestone 4 — Open Release, Docs, and Ecosystem Handoff** Duration: 3 weeks | Funding: 120,000 CC

**Deliverables**

* Full docs for deployment patterns, security hardening, privacy boundaries, and maintenance.  
* Example integrations for Ledger API and Admin API deployments.  
* Public demo / walkthrough.  
* Backlog, issue templates, maintainer guide, versioning policy.

**Acceptance Criteria**

* Public repositories, tagged release, and setup docs are available.  
* Demo shows end-to-end ingestion → alert → score update flow.  
* Maintainer and upgrade documentation is sufficient for third-party adoption.

---

### **Funding Request and Breakdown**

Total funding requested: 860,000 CC Breakdown:

* Milestone 1 — 210,000 CC  
* Milestone 2 — 320,000 CC  
* Milestone 3 — 210,000 CC  
* Milestone 4 — 120,000 CC

This scope is intentionally sized as a focused common-good infrastructure project.

---

### GTM Strategy  Canton is now at the stage where security and compliance infrastructure stops being optional and becomes ecosystem-critical. Canton has already demonstrated institutional traction: official pilot materials state that 45 financial institutions, asset managers, and service providers connected on the network, with workflows executed across 22 permissioned blockchains. The Canton Foundation’s Development Fund is explicitly intended to support security enhancements, audits, reference implementations, and critical infrastructure. Extractor / A3 fits that mandate directly.  

### Extractor’s wedge on Canton is clear: privacy-aware runtime monitoring and risk scoring at the participant level. Our proposal is an open-source, participant-local monitoring and risk-scoring stack built specifically for Canton’s privacy model, connecting directly to the Ledger API and Admin API to run real-time detectors, emit reusable alerts, and score counterparty risk without exfiltrating sensitive business data. By design, it preserves Canton’s privacy guarantees through local processing, crash-safe replay, strict party-level isolation, and minimal alert metadata. The initial reference scope already includes the core ingestion layer, privacy-aware detector pack, three-pillar party risk scoring engine, compliance export formats, public release, and ecosystem handoff.  

### Our go-to-market starts with the parts of the Canton ecosystem that have the most to lose from operational blind spots and the most to gain from runtime controls: custodians, validators, super validators, wallet and custody providers, tokenized-asset issuers, and institutional application operators. The official ecosystem already includes exactly these categories, with participants spanning custody, tokenized assets, financing, wallets, service providers, validators, and developer tooling. That gives Extractor a practical adoption path: first, land as common-good open infrastructure through the Foundation grant; second, convert that into reference deployments with live ecosystem participants; third, standardize reusable detector and policy packs that can be adopted by other node operators and app providers with minimal implementation effort. This is how Extractor becomes ecosystem infrastructure rather than a one-off integration.    

### The adoption model is intentionally simple. We land with one participant, one deployment, one critical use case: topology drift, permission and key-risk changes, abnormal behavioral patterns, and participant-node health. Once value is proven, we expand into higher-order detectors and compliance workflows. This phased approach reduces onboarding friction while raising the baseline security posture of the network. It also aligns with the deliverables already defined in the proposal: webhook exports, policy packs for custodians, validators, and institutional app providers, score updates within 60 seconds of triggering events, and full public documentation to support third-party adoption.  

### Canton’s growth increases the value of privacy, but it also increases the cost of blind spots. Every new validator, custodian, issuer, and institutional workflow expands the need for controls that are native to Canton’s architecture rather than borrowed from transparent chains. Extractor gives the ecosystem an open, reusable security and compliance layer that improves trust without compromising privacy. It helps participants detect topology and permission anomalies, monitor counterparty behavior in real time, harden supporting infrastructure, and generate standardized compliance evidence. In practical terms, this means higher security, better operational resilience, and faster institutional readiness across the Canton ecosystem. We therefore propose that the Canton Foundation fund the scope as a focused common-good infrastructure project that will materially raise the security and compliance baseline of the network and accelerate safe adoption by the next wave of institutional participants.

### **Why Extractor by Hacken**

Extractor by Hacken is already a production real-time monitoring platform with battle-tested detector and scoring concepts across multi-chain and institutional use cases. The team’s existing roadmap for Canton already includes:

* Ledger API and Admin API connectivity,  
* authoritative contract / transaction / topology ingestion,  
* Daml contract state tracking,  
* Canton-specific risk detection modules,  
* and operational dashboard support.

Relevant background strengths:

* production experience with real-time on-chain monitoring,  
* existing detector / trigger framework,  
* experience turning event streams into risk scores and dashboards,  
* institutional and regulatory monitoring experience.

---


### **Summary**

Extractor by Hacken's Canton Monitor is an open-source, participant-local monitoring and risk scoring stack for the Canton ecosystem. It runs privacy-aware real-time detectors, scores interacting party risk, and emits reusable alerts and exports for validators, app providers, custodians, auditors, and compliance teams — all while respecting Canton's sub-transaction privacy model.

Additional Extractor Possibilities that could be adapted for Canton Network integration:

| Detector Name | Description | Support (Canton Network Compatibility) |
| :---- | :---- | :---- |
| **SECURITY MONITORING** |  |  |
| **AML Detector** | Monitors blockchain transactions and flags addresses that appear on Anti-Money Laundering (AML) lists. | ✅ **Adaptable.** Can be modified to screen Party IDs or registered Splice ANS names instead of EVM addresses.(but needs a dataset) |
| **Chainabuse Monitor** | Analyzes and filters malicious crypto activity using reports from Chainabuse.com. | ✅ **Yes.** Highly useful for general threat intel, Chainabuse started tracking Canton entities. |
| **DNS Monitor** | Monitors WHOIS and DNS server records for potential attacks like DNS Hijacking. | ✅ **Yes.** Standard Web2. Crucial for protecting Canton Node API endpoints. |
| **Github Monitor** | Monitors a Github repository for participation activity. | ✅ **Yes.** Standard Web2 tracking. |
| **Network Monitor** | Monitors HTTP APIs with periodic GET/POST requests and timeout checks. | ✅ **Yes.** Standard Web2. Vital for checking Participant Node uptime. |
| **NIST Alerts Monitor** | Watches for new or updated CVE records with NIST NVD enrichment utilizing LLM analysis. | ✅ **Yes.** Standard Web2. Vital for monitoring node infrastructure vulnerabilities. |
| **Safe Multisig Monitor** | Tracks activities related to a Safe Multisig contract. | ✅  **Adaptable.** While there are no safe multisigs, but the concept of multi signatures lies in Canton’s architecture, so we could track the progress of signs. |
| **Security Sleuth** | Monitors Twitter channels for security sentiment utilizing an LLM. | ✅ **Yes.** Universal Web2 intelligence. |
| **SSL Monitor** | Downloads SSL certificates and checks them for validity, expiration, and trust. | ✅ **Yes.** Standard Web2. Necessary for Canton gRPC/REST endpoints. |
| **Tracker** | Tracks native transfers and assigns labels to addresses to monitor fund dispersal. | ✅ **Adaptable.** Can track Canton Coin ($CC) flows between public Party IDs on the Scan API. |
| **Wallet** | Monitors address balances (native and tokens) and generates alerts on balance changes. | ✅ **Adaptable.** The most likely adaptable. At least for the CC coin 100%. |
| **ADVANCED MONITORING (TRIGGERS)** |  |  |
| **ERC20 Transfer Trigger** | Alerts whenever an ERC-20 token transfer of more than a specified amount occurs. | ✅ **Adaptable.** Rebuild to detect Transfer choices on Daml Asset templates(CIP-56, CIP-0086) or public $CC transfers. |
| **Blacklisted Callers Trigger** | Alerts if a transaction is initiated from a blacklisted address. | ✅ **Adaptable.** Can trigger if a blacklisted Party ID submits a command to a monitored contract.(But i’m not sure if it makes much sense considering the nature of canton) |
| **Whitelisted Callers Trigger** | Alerts if a transaction is initiated from an address not on your whitelist. | ✅ **Adaptable.** Can trigger if an unknown Party ID interacts with a monitored contract. |
| **Transaction Parameters Trigger** | Fires whenever any transaction parameter matches customized rules. | ✅ **Adaptable.** Can read and evaluate the JSON create\_arguments of a Daml contract. |
| **Function Call Trigger** | Alerts whenever a specific function is executed on your smart contract. | ✅ **Adaptable.** In Canton, this translates to monitoring when a specific Choice is exercised on a Daml contract. |
| **Event Emitted Trigger** | Alerts whenever an event is emitted from your smart contract. | ✅ **Adaptable.** Translates to CreatedEvent or ArchivedEvent on the Ledger API. |
| **COMPLIANCE & FINANCIAL MONITORING** | *(Note: Duplicate detectors omitted for brevity, see Security/Advanced for core mechanics)* |  |
| **Circulation Supply Monitor** | Tracks token minting and burning in real time to maintain a live circulating supply. | ✅ **Adaptable.** Can aggregate public Mint and Burn operations of Canton Coin via the Scan API. (Could be adapted later for CIP-56 tokens too,but no clarity yet) |
| **Price Monitor** | Monitors price changes via an Oracle or Coingecko feed. | ✅ **Yes.** Easily applicable if Web2 oracles track Canton assets. |
| **Total Supply Monitor** | Alerts when the issued supply exceeds the expected threshold. | ✅ **Adaptable.** The CIP-56 supports totalSupply() function. |
| **TVL Monitor** | Tracks liquidity drops in native coins or tokens held by a contract. | ✅ **Adaptable.** Translates to aggregating the value of active Daml contracts where a specific Party is the custodian. |
| **Transfers Detector** | Tracks transfers  | ✅ **Adaptable.** Both for CC coin and for CIP-56(if applicable  |
| **BETA FEATURES** |  |  |
| **Contract Call Monitor** | Executes calls to a contract function (not a transaction) to extract results. | ✅ **Adaptable.**  |
| **Cron** | Triggers simple periodic tasks or events based on a predefined schedule. | ✅ **Yes.** Universal workflow. |
| **Proof of Reserves Monitor** | Monitors Proof of Reserves for configured contracts. | ✅ **Adaptable.** Conceptually valid if pulling PoR attestations into a Canton smart contract. |

