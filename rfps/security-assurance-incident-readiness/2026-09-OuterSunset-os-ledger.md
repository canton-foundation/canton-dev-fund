## Development Fund Proposal

**Organization:** Outer Sunset (outersunset.io)
**Author / Primary Contact:** Long Do
**Status:** Submitted
**Created:** 2026-09-30
**Proposal Type:** RFP-aligned proposal
**RFP / Roadmap Area:** RFP 27, Security Monitoring, Auditability and Evidence (primary). RFP 20, Indexers (secondary). Roadmap area: Security, Assurance & Incident Readiness.
**Label:** regulatory-compliance
**Champion:** Yiannis Varelis, Five North (@zeroknowledger)
**Total Funding Request:** 10,300,000 CC (first 12 months)
**Project Duration:** 6 weeks delivery and adoption milestones at 4 and 9 months from grant approval, with a 12 month service and maintenance term from M5 acceptance

---

## Abstract

Every validator operator, app provider, and Super Validator on Canton earns Canton Coin and pays network fees every round, yet none of them can close their books without an engineer who understands Canton Network transactions and how to read them, CSV export, a spreadsheet, and one person who knows how the formulas work. The tools available today are general-purpose blockchain accounting products not built for Canton, and they are costly for small operators and high-volume applications alike. There is no open, purpose-built way to turn Canton ledger activity into double-entry journal entries, a controlled month-end close, and an audit trail that traces every reported number back to an on-chain transaction.

OS Ledger is a finance-close stack for Canton. It is in production against a Super Validator's live validator: a read-only Ledger API ingester, a categorization rule engine, double-entry journal generation, sign-aware reconciliation against the active contract set, a maker-checker approval workflow, a period-close gate, a bookkeeper web application, and an on-ledger poster that commits each approved journal entry as an OSLedger:JournalEntry Daml contract. Two Canton organizations are underway to using it in production today, with one Super Validator (Five North) as the anchor deployment with paid contracts signed for when the application is complete.

This proposal asks the Foundation to fund **releasing the stack as open source under Apache 2.0**, hardening it for self-hosted deployment, completing the remaining pieces (period-level on-ledger attestation with an independent verifier, GL exporters, audit packages that survive system shutdown), and maintaining it. Delivery completes with the open-source release 6 weeks after grant approval, followed by adoption-gated milestones and an annual service and maintenance commitment.

## RFP Alignment

OS Ledger responds to **RFP 27, Security Monitoring, Auditability and Evidence**, which asks for reusable tools for audit trails, compliance evidence, and security metrics that preserve Canton's privacy model. It also serves **RFP 20, Indexers**, as an application-level indexer for reporting and auditability.

**RFP 27 questions**

- **Threats monitored:** misstated reward income and network fees in operator financial reports. Books altered after close. Entries approved by the person who prepared them. Customer flows booked as the operator's own. Drift between on-chain holdings and booked balances.
- **Scope:** entity level. One operator's parties, one isolated deployment per organization.
- **Data sources:** the operator's own participant via Ledger API v2 (UpdateService, StateService) and Splice templates, plus the validator wallet API for CC/USD pricing. PQS is an optional read path.
- **Privacy, access control, and selective disclosure:** a revocable read-only credential for ingestion, scoped to the operator's parties by ENTITY\_PARTIES. Audit packages are held by the client. On-ledger attestations have the operator as signatory and an optional auditor co-signatory, so an auditor can verify a close without the data becoming public.

**RFP 20 questions**

1. **Data required:** the operator's own transaction stream and active contract set.
2. **Where it comes from:** node-local.
3. **If involved-party metadata is no longer public:** no impact. OS Ledger does not use Mediator or other protocol-level metadata.
4. **Privacy and access:** access is scoped to the operator's own parties and a read-only credential. Nothing is published beyond the optional on-ledger attestations the operator chooses to create.

## Licensing and Open-Source Posture

All grant-funded software — including the existing codebase — is released under Apache 2.0 with full source on public GitHub under the outer-sunset organization:

- os-ledger-core — TypeScript ingester (@grpc/grpc-js against Ledger API v2), decode and booking passes, categorization rules, reconciliation, Drizzle ORM schema and idempotent migrations (Postgres 16/17)

- os-ledger-app — Next.js bookkeeper web app (dashboard, wallets, transactions, categories, approvals, close, reports, audit log)

- os-ledger-poster — on-ledger journal poster over JSON Ledger API v2 (Node CLI and Cloudflare Worker), cursor and receipt store

- os-ledger-daml — OSLedger Daml package (JournalEntry, FinalizedRollup, RollupAdjustment) and verifier CLI

- os-ledger-deploy — Docker Compose and Kubernetes (k3s) manifests, operator runbooks

- Documentation: architecture, accounting treatment notes per Splice event type, discovery log, schema specification

Any organization may self-host the full stack with no dependency on Outer Sunset. Self-hosted and hosted deployments run the same code with the same features.

![Bookkeeper dashboard](./2026-09-OuterSunset-os-ledger-dashboard.png)

**Caption:** OS Ledger bookkeeper dashboard showing ingester health, period totals, uncategorized count and registered wallets. Deployment identity is redacted and the figures shown are test data.

Should the Canton Foundation be interested in Outer Sunset operating a subsidized managed service for the ecosystem, we will consider submitting a subsequent grant for such a managed service.

## Specification

### 1. Objective

Give every organization operating on Canton an open, verifiable way to produce accounting records from ledger activity — from raw participant events to balanced journal entries, a controlled close, and an attestation an auditor can check independently — and get it into production use across the validator ecosystem.

### 2. Implementation Mechanics

**Ingest (Ledger API → decoded events).** A TypeScript ingester streams UpdateService.GetUpdates and StateService.GetActiveContracts over gRPC from the operator's participant using an OAuth M2M read-only client. A decode pass recognizes Splice templates — Amulet, LockedAmulet, TransferInstruction, AmuletRules\_Transfer results, ValidatorRewardCoupon / AppRewardCoupon / SvRewardCoupon, FeaturedAppActivityMarker — and writes normalized rows carrying round number, amuletPrice (CC↔USD at ledger time), tx\_kind, per-reward-type breakdown, per-output sequencer/mediator fees, and Amulet decay metadata (initialAmount, createdAtRound, ratePerRound). Ingestion resumes from a stored offset and is idempotent. An ENTITY\_PARTIES filter scopes books to the operator's own parties so a wallet-as-a-service provider hosting customer parties does not book customer transfers as its own.

![Canton reference chart of accounts](./2026-09-OuterSunset-os-ledger-chart-of-accounts.png)

**Caption:** The Canton reference chart of accounts as configured in the application, with per-category usage counts. Deployment identity is redacted.

*Design note:* the original design read from PQS. During Phase 0 the vendor PQS Scribe failed against a Canton 3.5.1 ingress in production (UNAVAILABLE, isolated to Scribe's HTTP/2 client behavior) while grpc-js succeeded, so the ingester talks to the Ledger API directly. A PQS-backed read path is added in M5.

**Post (events → journal).** A priority-ordered categorization rule engine maps decoded events to accounts in a Canton-specific chart of accounts (1000 Digital Assets – CC, 2900 Suspense/Clearing, 3000 Opening Balance Equity, 4100/4200/4300 Validator/App/SV Reward Income, 6100 Network Holding Fees, 6200 Sequencer/Mediator Fees, with uncategorized income and payment buckets). Every entry is double-entry, balanced in USD, carries the CC amount, and links to its source update ID. Anything unmatched falls to suspense via a fallback-suspense rule and blocks the close. Rules and account codes are versioned configuration with a changelog.

**Reconcile.** A sign-aware reconciliation snapshot compares ACS holdings (net of Amulet decay) with booked balances. A positive gap proposes an opening-balance entry; a negative gap proposes a holding-fee adjustment. Proposals go through the approval queue; the pipeline reconciles to fractions of a cent on the anchor deployment.

**Close.** Periods carry a period\_close\_state. Close is refused while any uncategorized or draft entry remains in the period; on close the readiness counters are frozen into the close record. Maker-checker separation is enforced at the database level (chk\_approval\_maker\_not\_checker); role-based policy gates propose, approve, and period:close. Every action lands in an append-only audit\_log. Export and audit-package history records file hashes, config-snapshot hash, and audit-log hash per run.

**Attest (journal → ledger).** The poster reads approved entries (read-only against the accounting DB), maps each to OSLedger:JournalEntry create arguments — entry ID, source update ID, effective date, CC and USD amounts, lines, status — and submits via POST /v2/commands/submit-and-wait-for-transaction, recording the contract ID and advancing a cursor. It runs as one Cloudflare Worker per tenant on a cron, with a POSTING\_ENABLED kill switch and manual-only MainNet deploys. Period-level FinalizedRollup / RollupAdjustment templates are specified in the schema and are completed in M5 along with an independent verifier.

**Export.** Journal and rollup CSV exports compatible with QuickBooks and other accounting software, plus QuickBooks IIF and Online journal import, Xero, and a generic GL CSV with account-code mapping (M5).

**Operational model.** Single-tenant by construction: own ingester, own database, own service per client. Access is a client-issued, revocable, read-only credential on whitelisted IPs. OS Ledger writes to the ledger only through the explicit attestation flow.

### 3. Architectural Alignment

- Consumes the public **Ledger API v2** and Splice/Amulet templates directly; no protocol changes and no privileged access.

- Tracks **CIP-0056** holdings (Splice.Api.Token.HoldingV1 deduplicated against Amulet) and will track **CIP-0112 (Token Standard V2)** as ratified.

- Respects Canton's **privacy model**: the ingester sees only the operator's own parties, so the accounting view is scoped exactly to what the participant already holds.

- On-ledger records use ordinary Daml templates with the operator (and optionally the auditor) as signatories.

- Complements the funded OSS validator/indexer/PQS work by offering a PQS-backed read path as an alternative ingestion source.

### 4. Backward Compatibility

None. OS Ledger is read-only against the participant and adds an optional Daml package. Existing participants, apps, and wallets are unaffected.

## Milestones and Deliverables

Milestones 1–5 cover the engineering deliverables and complete with the open-source release **6 weeks after grant approval**. Milestones 6 and 7 gate on ecosystem adoption after release. Maintenance is a separate annual commitment. Each milestone is verified by the committee against the public repository and on-ledger evidence.

Estimated delivery dates are measured from grant approval. The deadline for each milestone is 2 months after its estimated delivery date.

### Milestone 1: Ledger API Ingester and Canton Accounting Event Model

- **Estimated Delivery:** 2 weeks after grant approval

- **Focus:** Direct gRPC ingester with OAuth M2M auth; decode pass for Splice templates; normalized schema (7 clusters, Drizzle ORM, idempotent migrations); round number, amuletPrice, per-reward-type and per-output-fee columns; Amulet decay metadata; offset store and resumable streaming; ENTITY\_PARTIES party-scoping filter; Splice transaction-type coverage map and discovery log.

- **Deliverables / Value Metrics:**

  - Ingester source, schema specification, and migrations published to the public repository and available for committee review.

  - Architecture and design documents (Ledger API data flow, decode rules, schema DDL, security and privacy model, Scribe → direct gRPC architecture decision record) published to the public repository.

  - Ingester running continuously against a Super Validator's live validator on Canton 3.5.x, processing on the order of 7,000 journal entries per month, verifiable by committee against the deployment's ingester health metrics.

- **Amount:** 0.75M CC

### Milestone 2: Journal Engine, Chart of Accounts, and Reconciliation

- **Estimated Delivery:** 2 weeks after grant approval

- **Focus:** Priority-ordered categorization rule engine with suspense fallback; double-entry booking with USD and CC on every line and a source update ID; Canton reference chart of accounts (1000–6999); sign-aware ACS reconciliation with opening-balance and holding-fee adjustment proposals; in-process projector; journal and rollup CSV exports compatible with QuickBooks and other accounting software.

- **Deliverables / Value Metrics:**

  - Rule engine, chart of accounts, reconciliation module, and accounting treatment notes published to the public repository and available for committee review.

  - Reconciliation of booked balances to on-chain holdings within 0.01 CC on a live MainNet or DevNet deployment, demonstrated to the committee.

  - Full monthly periods booked for **2 organizations**, with automatic categorization covering ≥ 95% of transaction volume and the remainder routed to suspense.

- **Amount:** 0.7M CC

### Milestone 3: Maker-Checker, Period Close, and Bookkeeper Application

- **Estimated Delivery:** 4 weeks after grant approval

- **Focus:** Approval queue with database-enforced maker/checker separation; role-based authorization; period-close state with an uncategorized/draft gate; append-only audit log; export and audit-package history with file, configuration-snapshot, and audit-log hashes; web application (dashboard with ingester health, wallets, transactions with bulk categorization, categories, approvals, close, reports, audit log); Docker Compose and Kubernetes deployment options with runbooks.

- **Deliverables / Value Metrics:**

  - Application source, control model documentation, and deployment runbooks published to the public repository and available for committee review.

  - Committee-verifiable demonstration that a period cannot be closed while uncategorized or draft entries remain, and that the preparer of an entry cannot approve it.

  - Finance owners at **2 organizations** complete month-end close in the application, producing a Journal Entry Summary in which every line traces to its on-chain update ID.

- **Amount:** 0.7M CC

### Milestone 4: On-Ledger Journal Attestation

- **Estimated Delivery:** 4 weeks after grant approval

- **Focus:** OSLedger:JournalEntry Daml template; poster over JSON Ledger API v2 with cursor and receipt store, Node CLI and scheduled Worker runtimes, per-tenant deployment, posting kill switch, and manual-only MainNet deploys; mining-round CC/USD pricing on receipts via the validator wallet API; network-free test suite.

- **Deliverables / Value Metrics:**

  - Daml package, poster source, and deployment configuration published to the public repository and available for committee review.

  - JournalEntry contracts committed on MainNet for at least **1 organization**, with contract IDs and receipts provided to the committee for verification against the ledger.

- **Amount:** 0.45M CC

### Milestone 5: Period Attestation, Exporters, and Open-Source Release

- **Estimated Delivery:** 6 weeks after grant approval

- **Focus:**

  - Apache 2.0 relicense and repository split; tenant-specific configuration moved to documented deploy variables; multi-ENTITY\_PARTIES profiles per database; PQS-backed read path as an alternative ingestion source; hardened Compose and k3s manifests; operator guide.

  - FinalizedRollup and RollupAdjustment templates with optional auditor co-signatory; SHA-256 canonical hash chain over a closed period; self-contained audit package readable with no running system; verifier CLI that recomputes the chain from the package and checks it against the on-ledger contract.

  - QuickBooks (IIF and Online journal import), Xero, and generic GL CSV exporters with account-code mapping.

  - CPA-reviewed accounting treatment notes (reward recognition timing, Amulet decay, merge/split, two-phase transfers, unclaimed reward residue) published with the reference chart of accounts.

  - Third-party review of the Daml package and hashing implementation; critical/high findings remediated, report published under docs/audits/.

- **Deliverables / Value Metrics:**

  - All repositories public under Apache 2.0 with CI and published images.

  - Period attestations committed on MainNet for the **2 current organizations**; verifier run end-to-end on a real closed period by someone outside Outer Sunset.

- **Amount:** 1.0M CC

### Milestone 6: Ecosystem Adoption I

- **Estimated Delivery:** 4 months after grant approval

- **Scope:** Onboarding office hours, a validator-operator working session with the Foundation, and case studies.

- **Deliverables / Value Metrics (evidenced on-ledger or by attestation; confidential-to-Foundation path available):**

  - At least **4 independent organizations** have each closed at least one period on MainNet using the Apache 2.0 release.

  - At least **1 organization** imports an OS Ledger export into its production GL.

  - **≥ 3 period attestations** committed on MainNet across those organizations.

- **Amount:** 2.3M CC (pro rata at committee discretion)

### Milestone 7: Ecosystem Adoption II

- **Estimated Delivery:** 9 months after grant approval

- **Scope:** Onboarding support, accounting-firm outreach, case studies, and an adoption report.

- **Deliverables / Value Metrics (evidenced on-ledger or by attestation; confidential-to-Foundation path available):**

  - At least **6 independent organizations** have each closed at least one period on MainNet using the Apache 2.0 release.

  - At least **4** of those organizations have closed **3 consecutive monthly periods**.

  - At least **1 accounting or audit firm** has accepted an OS Ledger audit package as close evidence for a client.

  - **≥ 6 period attestations** committed on MainNet across those organizations.

  - Published adoption report: organizations live, self-hosted vs. hosted, retention, attestation count, exporter usage.

- **Amount:** 2.6M CC (pro rata at committee discretion)

### Service and Maintenance: Annual, Paid Quarterly

- **Term:** 12 months from M5 acceptance, renewable annually by committee decision.

- **Scope:** Each quarterly tranche has two components.

  - *Upkeep (0.25M CC):* compatibility with every Canton/Splice MainNet release that quarter (release tags); CVE triage within severity-based SLAs; CIP-0112 (Token Standard V2) decoder support kept current; docs, images, and manifests current; issue triage and community PR review; a public DevNet demo and a MainNet reference deployment; quarterly maintenance report.

  - *Active use (0.20M CC):* at least **6 organizations** (Q1–Q2) and **10 organizations** (Q3–Q4) close a period on MainNet using OS Ledger during the quarter; quarterly adoption report.

- **Amount:** 0.45M CC per quarter (1.8M CC per year). This covers engineering upkeep and the reference deployments (compute, Postgres, poster runtime, monitoring, CI and image hosting, and Canton traffic fees for attestations). Bespoke integration, white-label work, and support contracts are excluded.

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified and available in the public repositories under Apache 2.0.

- Demonstrated operational readiness: real MainNet operators closing real periods, not fixture data.

- Documentation and knowledge transfer sufficient for an operator to self-host without Outer Sunset.

- Alignment with stated value metrics, evidenced by on-ledger attestations, operator or auditor attestations, or public repository evidence.

Project-specific conditions:

- Milestones 1–4 are verified by the committee against the public repository, so acceptance of each is conditional on the corresponding code being released.

- Independent third-party review of the Daml package and hash-chain implementation before M5 acceptance, report published.

- An organization counts toward adoption only once it has closed a real period on MainNet.

- No milestone is accepted on the basis of test coverage or feature completeness alone.

## Funding

**Total Funding Request:** 8.5M CC for delivery, plus 1.8M CC per year of service and maintenance (10.3M CC for the first 12 months)

### Payment Breakdown

| **Milestone**                                          | **Estimated Delivery** | **Trigger**          | **Amount (CC)** |
| ------------------------------------------------------ | ---------------------- | -------------------- | --------------- |
| M1: Ingester and Event Model                           | 2 weeks                | Committee acceptance | 0.75M           |
| M2: Journal Engine, CoA, Reconciliation                | 2 weeks                | Committee acceptance | 0.7M            |
| M3: Maker-Checker, Close, Application                  | 4 weeks                | Committee acceptance | 0.7M            |
| M4: On-Ledger Journal Attestation                      | 4 weeks                | Committee acceptance | 0.45M           |
| M5: Period Attestation, Exporters, Open-Source Release | 6 weeks                | Committee acceptance | 1.0M            |
| M6: Ecosystem Adoption I                               | 4 months               | Adoption evidence    | 2.3M            |
| M7: Ecosystem Adoption II                              | 9 months               | Adoption evidence    | 2.6M            |
| **Delivery total**                                     |                        |                      | **8.5M**        |
| Service & maintenance Q1                               | Months 1–3 after M5    | Upkeep + active use  | 0.45M           |
| Service & maintenance Q2                               | Months 4–6 after M5    | Upkeep + active use  | 0.45M           |
| Service & maintenance Q3                               | Months 7–9 after M5    | Upkeep + active use  | 0.45M           |
| Service & maintenance Q4                               | Months 10–12 after M5  | Upkeep + active use  | 0.45M           |
| **Service & maintenance total (year 1)**               |                        |                      | **1.8M**        |
| **Total, first 12 months**                             |                        |                      | **10.3M**       |

M6, M7, and the active-use component of every service and maintenance tranche are contingent on verified ecosystem adoption.

### Volatility Stipulation

Delivery completes within 6 weeks and adoption milestones within 9 months; the service and maintenance term runs 12 months. The grant is denominated in fixed Canton Coin and the service and maintenance portion will be re-evaluated at the 9-month mark.

## Co-Marketing

Upon release, Outer Sunset will collaborate with the Foundation on:

- Announcement coordination for the open-source release (M5) and the adoption reports (M6 and M7).

- A technical blog series on accounting treatment of Canton activity (reward income, Amulet decay, merge/split, two-phase transfers, FMV), co-published with the Foundation.

- A validator-operator working session on month-end close, run with the Foundation's operations subcommittee.

- Case studies with consenting operators and accounting firms, starting with the anchor Super Validator deployment.

- Foundation-channel promotion of OS Ledger and the Outer Sunset team.

## Motivation

Every party that earns or spends Canton Coin has an accounting problem, and today none of them have an open tool for it:

- **Validator operators and Super Validators** — all of them receive rewards and pay holding and sequencer fees every round and must report that income. Most close from Scan exports and spreadsheets.

- **App providers** earning app rewards on customer transactions.

- **Wallet-as-a-service providers** who host customer parties and must keep customer flows out of their own books.

- **Enterprise participants** whose finance, compliance, and audit teams will not let on-chain activity scale until it reconciles to the GL and is defensible to an auditor.

- **Accounting and audit firms** serving the above, who currently have no standard evidence format for Canton activity.

Two organizations run OS Ledger in production today, including a Super Validator. The gap between that and ecosystem-wide use is licensing, self-hostability, period-level attestation, and GL integration — exactly what this grant funds. We target 6 organizations live within 4 months of approval, 10 within 9 months, and 20+ by the end of the first service year.

## Demand

Within two months, during the initial build phase, OS Ledger has drawn commercial demand from across the Canton ecosystem.

- **Contracts:** Six Canton organizations, Five North, Temple, MPCH, Send, BitSafe and Loop Technologies, are (signed/in final contracting) for OS Ledger, spanning validator operators and application providers.

- **Production use:** Five North runs OS Ledger as the anchor deployment, closing periods from live PQS data.

- **Co-development with clients:** We're working directly with clients to find new use cases and extensions beyond the core close workflow, including forensic accounting with MPCH.

- **Scale:** With Temple, one of the highest transaction-volume applications on Canton, we're extending OS Ledger to handle volume at that level.

The grant funds open-sourcing the stack these clients already depend on, so any validator operator can close their books without a bespoke engagement.

## Rationale

**Why fund a stack with existing production users.** The engine exists because two clients funded their own deployments. Open-sourcing it turns those clients' investment into the ecosystem's, but only if the codebase is generalized, relicensed, and maintained — none of which a two-client commercial engagement pays for. The Foundation gets a proven, running system rather than a plan.

**Why open-source the core rather than sell a hosted product only.** Accounting treatment for a new asset class is a public good: it only becomes trustworthy when the rules are readable, reviewable, and the same for everyone. Outer Sunset's commercial interest is in running and supporting the stack, not owning the rules.

**Why direct Ledger API ingestion.** It was forced by a production incompatibility, but it also means no intermediate PQS deployment is required per operator, and a PQS-backed path is offered in M5 for operators who already run one.

**Why a Canton-specific journal engine.** General-purpose crypto sub-ledgers assume account-balance chains with global visibility. Canton's eUTXO model, Amulet decay, merge/split, two-phase locked transfers, per-round rewards, and party-scoped visibility have no clean mapping onto them; each operator currently re-derives the treatment in a spreadsheet.

**Why on-ledger attestation.** Off-chain audit packages prove what was recorded; they do not prove it was not altered afterward. Per-entry JournalEntry contracts already anchor each approved entry; period-level FinalizedRollup contracts with an optional auditor co-signatory and a standalone verifier close the loop so any auditor can verify a close without trusting Outer Sunset or the operator's infrastructure.

**Alternatives considered.** Extending an existing indexer with accounting views would reproduce ingestion but not the close controls, audit package, or attestation. Waiting for a general-purpose crypto accounting vendor to add Canton leaves the treatment rules closed and the timeline outside the ecosystem's control.
