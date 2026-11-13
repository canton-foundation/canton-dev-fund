# Open Source Canton Subledger

*Canton Development Fund proposal*

Noves, a Canton Foundation member · Ben Roy, primary contact · 11 November 2026 · Submitted

**RFP alignment:** RFP 27, Security Monitoring, Auditability and Evidence (primary), and RFP 20, Indexers

**Label:** regulatory-compliance

**Champion:** Noves

Noves requests 5,250,000 CC to release and maintain a full Canton accounting subledger under Apache 2.0. A finance team will be able to reconcile its Canton holdings, close a reporting period, import approved journals into its general ledger, and give its auditor the evidence behind each entry. The request comprises 1,800,000 CC for engineering and public release, 2,450,000 CC (57.6% of delivery and adoption funding) for verified customer adoption, and 1,000,000 CC for twelve months of maintenance.

## Existing use and delivery basis

Noves has operated its Canton data platform in production for over a year. Obsidian uses Noves’s Canton transaction data to close its books, and a third-party accounting platform uses the data in preparing its customers’ books. Noves verifies transaction streams by reconciling low level activity against opening and closing balances observed on Canton, resulting in complete and accurate results. The new subledger builds journal generation, approvals and period close on that production data.

## Source data and entity scope

Each organization identifies its own parties and grants revocable, read-only access to its participant. The subledger reads updates and holdings via Ledger API v2 or the Participant Query Store (PQS). Both paths feed a common event model. Resumable checkpoints and stable source IDs support duplicate-safe replay and trace each journal line to its source. Queries and exports retain party scope, cutoff and mapping version. Entity settings distinguish operator activity from customer activity on the same participant.

Party-scoped indexing and repeatable queries address RFP 20. The approval trail, access controls and selectively disclosed evidence address RFP 27.

The subledger uses authorized participant data and does not depend on publicly exposed involved-party metadata from Mediator messages (RFP 20 requirement).

The release covers Canton Coin transfers, validator, application and Super Validator rewards, sequencer and mediator fees, holding fees, locks, unlocks, merges and splits. It records quantities, party roles, rounds, effective dates and the round’s CC/USD price. It covers CIP-0056 as well as CIP-0112 token holdings and publishes the supported Canton and Splice versions, token interfaces and event types. Missing history or valuation inputs appear in the review queue.

### Journals and reconciliation

Each organization sets its accounting policies and chooses how to classify and recognize activity in its books. Finance users can adapt the reference chart of accounts, assign categories to transactions individually or in groups, and resolve items held in suspense. The subledger applies the organization’s account mappings to generate balanced USD journals. Each entry retains the mapping version, native asset quantity, valuation source and originating update or approved adjustment.

At each reporting cutoff, the subledger compares booked balances with authorized holdings, accounting for Canton Coin holding fees and locked balances. Differences appear by asset and party with the evidence for a proposed adjustment. A reviewer can distinguish an opening balance, a fee and an unexplained discrepancy before authorizing a posting.

## Period close and audit evidence

The finance application shows wallets, ingestion status, journals, exceptions, approvals, balances and reports. Preparers and approvers have separate roles. Once suspense items, drafts and approvals are resolved, closing freezes the journals, reconciliation results and configuration. An append-only history records who approved, closed, exported or adjusted the books.

Each close produces a portable evidence package containing journals, source references, approvals, reconciliation results and export hashes. A recipient can verify the package locally against a separately retained digest.

Organizations choose whether to post individual approved journals or a closed-period digest on Canton. Posting uses separate write credentials and retains contract IDs and receipts. A Daml contract links later adjustments to the original close. The operator controls disclosure and may invite an auditor to co-sign. An authorized recipient can also verify an attested package against its Canton commitment.

### General ledger exports

Finance users can export period summaries and mapped journals for QuickBooks Desktop (IIF), QuickBooks Online journal import, Xero and generic CSV. The period, mapping version and file digest link each export to its close.

## Engineering deliverables

### M1  Source data and accounting

Publish the direct Ledger API ingester, event schema, reference chart of accounts, mapping logic and reconciliation code. Demonstrate a full reporting period on authorized MainNet data. The committee can trace a sample journal to source, replay the period using the same account mappings, and inspect booked versus observed balances. Report balances by asset, reconciliation tolerances and any outstanding exceptions.

### M2  Controlled close and individual journal posting

Publish the finance application, role controls, audit history, journal-attestation contracts and posting component. Demonstrate separate approvals and show how resolving an outstanding item allows a reference period to close. Noves will post an approved journal on MainNet from an authorized reference deployment and supply its contract ID, source reference and receipt for inspection.

Noves will publish a worked Canton accounting example with representative transactions, the applicable account mappings and expected journal entries. The M2 demonstration will run that example through the finance application so reviewers can compare the generated journals with the expected entries, verify that an unresolved item blocks close, and observe approval and close after resolution.

### M3  Full public release

Publish the complete Apache 2.0 workflow with the PQS adapter, period and adjustment contracts, verifier and mapped GL exporters. Release versioned container images, Docker Compose and Kubernetes deployment files, schema migrations, sample configuration, CI and operator runbooks. Operators and service providers can deploy and maintain the released software independently.

Demonstrate the PQS read path and provide example files for each export format. An outside reviewer verifies a closed-period package against a MainNet attestation from the reference deployment. Publish an independent security review of the funded Daml contracts and hashing implementation. Resolve critical and high-severity findings within that review scope before submitting M3.

### Ecosystem adoption and outreach

Noves will coordinate a release announcement with the Foundation, walk finance teams and accounting platforms through an actual close, and publish case studies with consenting users.

## Milestone schedule and payment

Dates run from grant approval. The committed deadline for each of M1 through M5 is two calendar months after its estimated delivery date. Under the proposed terms, Noves delivers a milestone when it has met the stated criteria and submits the completion evidence for committee review. The submission date determines timeliness. Payment follows committee acceptance. Any change to a committed deadline requires an approved amendment before that deadline.

| Milestone | Estimated delivery | Payment on acceptance |
| --- | --- | --- |
| M1 · Source data, journals and reconciliation | Week 3 | 600,000 CC |
| M2 · Finance application and journal attestations | Week 6 | 650,000 CC |
| M3 · Public release and independent verification | Week 8 | 550,000 CC |
| M4 · First production closes | Month 6 | 1,150,000 CC |
| M5 · Expanded adoption and repeat closes | Month 12 | 1,300,000 CC |

### Qualifying customer use

An independent end customer qualifies when it, or a provider acting on its behalf, uses the released subledger components to reconcile its authorized Canton MainNet activity, produce approved journals and close a real reporting period. Each customer counts once per milestone, whether it uses the software directly or through an integration.

### M4  First production closes

Four independent organizations have each completed a qualifying close. At least one imports the resulting journals into its production general ledger. Noves will provide the component version used, a close record for each organization, and confirmation of the GL import.

### M5  Expanded adoption and repeat closes

Ten independent organizations have each completed a qualifying close. At least four of the ten have closed three consecutive monthly periods each. An accounting or audit firm has accepted one client’s evidence package in support of its close. Noves will publish an adoption report covering organizations, repeat closes and export usage. The Foundation may inspect confidential evidence privately. The committee may approve proportionate payment for partial achievement of M4 or M5.

### Maintenance and funding terms

The maintenance term runs for twelve months from M3 acceptance. Each quarter, Noves will maintain compatibility with supported Canton and Splice releases, triage issues and security advisories, and publish fixes, current deployment images and documentation. A quarterly report will identify releases tested, issues resolved and outstanding compatibility items. Four payments of 250,000 CC are earned on committee acceptance of the quarterly maintenance work.

M1 through M5 total 4,250,000 CC. The adoption milestones, M4 and M5, account for 2,450,000 CC, or 57.6% of that budget. Annual maintenance is budgeted separately. The grant is denominated in fixed CC, with a volatility review at month 6. Any adjustment to outstanding payments requires committee approval.

**Program references:** [Canton roadmap and RFPs 20 and 27](https://github.com/canton-foundation/canton-dev-fund/blob/main/2026-2028-strategic-roadmap.md) · [Development Fund governance](https://github.com/canton-foundation/cips/blob/main/cip-0100/cip-0100.md)
