# Open Source Canton Subledger

*Canton Development Fund proposal*

Noves, a Canton Foundation member · Ben Roy, primary contact · 11 November 2026 · Submitted

**RFP alignment:** RFP 27, Security Monitoring, Auditability and Evidence (primary), and RFP 20, Indexers

**Label:** regulatory-compliance

**Champion:** Noves

Noves requests 8,700,000 CC to release and maintain a full Canton accounting subledger under Apache 2.0. A finance team will be able to reconcile its Canton holdings, close a reporting period, import approved journals into its general ledger, and give its auditor the evidence behind each entry. The request comprises 1,200,000 CC for engineering and public release, up to 6,500,000 CC for verified customer adoption, and 1,000,000 CC for twelve months of maintenance. Adoption accounts for 84.4% of delivery and adoption funding, or 74.7% of the total request.

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

Deliver the direct Ledger API ingester, event schema, reference chart of accounts, mapping logic and reconciliation code for hosted use. Provide the source and documentation to the committee and its designated reviewers for private inspection. Demonstrate a full reporting period on authorized MainNet data. The committee can trace a sample journal to source, replay the period using the same account mappings, and inspect booked versus observed balances. Report balances by asset, reconciliation tolerances and any outstanding exceptions.

### M2  Controlled close and individual journal posting

Deliver the finance application, role controls, audit history, journal-attestation contracts and posting component for hosted use. Provide the source and documentation to the committee and its designated reviewers for private inspection. Demonstrate separate approvals and show how resolving an outstanding item allows a reference period to close. Noves will post an approved journal on MainNet from an authorized reference deployment and supply its contract ID, source reference and receipt for inspection.

Noves will publish a worked Canton accounting example with representative transactions, the applicable account mappings and expected journal entries. The M2 demonstration will run that example through the finance application so reviewers can compare the generated journals with the expected entries, verify that an unresolved item blocks close, and observe approval and close after resolution.

### M4  Full public release

Publish the complete Apache 2.0 workflow with the PQS adapter, period and adjustment contracts, verifier and mapped GL exporters. Release versioned container images, Docker Compose and Kubernetes deployment files, schema migrations, sample configuration, CI and operator runbooks. The release includes the M1 and M2 components and the functionality required to satisfy M3, including any functionality used to earn that payment. Operators and service providers can deploy and maintain the released software independently, including that qualifying close workflow, without proprietary Noves components.

Demonstrate the PQS read path and provide example files for each export format. An outside reviewer verifies a closed-period package against a MainNet attestation from the reference deployment. Publish an independent security review of the funded Daml contracts and hashing implementation. Resolve critical and high-severity findings within that review scope before submitting M4.

### Ecosystem adoption and outreach

Noves will coordinate a release announcement with the Foundation, walk finance teams and accounting platforms through an actual close, and publish case studies with consenting users.

## Milestone schedule and payment

Dates run from grant approval. The committed deadline for each of M1 through M8 is two calendar months after its estimated delivery date. Under the proposed terms, Noves delivers a milestone when it has met the stated criteria and submits the completion evidence for committee review. The submission date determines timeliness. Payment follows committee acceptance. Milestones may be submitted and paid before their estimated delivery dates once all acceptance criteria and payment prerequisites are satisfied. Any change to a committed deadline requires an approved amendment before that deadline.

| Milestone | Estimated delivery | Payment on acceptance |
| --- | --- | --- |
| M1 · Source data, journals and reconciliation | Week 3 | 400,000 CC |
| M2 · Finance application and journal attestations | Week 6 | 400,000 CC |
| M3 · First production closes: 4 organizations | Month 6 | 1,300,000 CC |
| M4 · Public release and independent verification | Month 9 | 400,000 CC |
| M5 · Expanded adoption and repeat closes: 10 organizations | Month 12 | 1,300,000 CC |
| M6 · Continued adoption: 18 organizations | Month 15 | 1,300,000 CC |
| M7 · Continued adoption: 28 organizations | Month 18 | 1,300,000 CC |
| M8 · Continued adoption: 40 organizations | Month 21 | 1,300,000 CC |

M3 payment requires M1 and M2 acceptance. The M4 release deadline does not depend on adoption. Payments for M5 through M8 require M4 acceptance.

### Qualifying customer use

An independent end customer qualifies when it, or a provider acting on its behalf, uses the subledger components funded by this proposal to reconcile its authorized Canton MainNet activity, produce approved journals and close a real reporting period. Each customer counts once per milestone, whether it uses the software directly or through an integration. Organization targets are cumulative: each milestone’s total includes organizations counted at earlier milestones, provided they continue to meet the qualifying-use requirements. Multiple users, wallets or parties belonging to one organization do not count as separate customers.

M3 may be satisfied through Noves-hosted deployments of the funded implementation. Noves will identify the deployed component versions and provide source access to the committee and its designated reviewers to verify that the qualifying functionality is included in the funded implementation. For M5 through M8, qualifying closes must use the Apache 2.0 release, whether self-hosted, hosted or accessed through an integration. Each organization counted at those milestones must have completed a qualifying close within the preceding three months.

### M3  First production closes

Four independent organizations have each completed a qualifying close. At least one imports the resulting journals into its production general ledger. Noves will provide the component version used, a close record for each organization, and confirmation of the GL import.

### M5  Expanded adoption and repeat closes

Ten independent organizations have each completed a qualifying close. At least four of the ten have closed three consecutive monthly periods each. An accounting or audit firm has accepted one client’s evidence package in support of its close. Noves will publish an adoption report covering organizations, repeat closes and export usage. The Foundation may inspect confidential evidence privately. The committee may approve proportionate payment for partial achievement of M3 and M5 through M8.

### M6 through M8  Continued adoption and repeat closes

M6 requires 18 independent organizations with qualifying closes, including at least eight that have each closed three consecutive monthly periods. M7 requires 28 organizations, including at least twelve with three consecutive monthly closes. M8 requires 40 organizations, including at least sixteen with three consecutive monthly closes. Each series of three consecutive closes must end within the preceding three months and use the Apache 2.0 release.

For each milestone, Noves will provide component versions, close records and an updated adoption report distinguishing direct installations, hosted customers and customers reached through integrations. The report will identify newly counted organizations and repeat use. The Foundation may inspect confidential evidence privately.

### Maintenance and funding terms

The maintenance term runs for twelve months from M4 acceptance. Each quarter, Noves will maintain compatibility with supported Canton and Splice releases, triage issues and security advisories, and publish fixes, current deployment images and documentation. A quarterly report will identify releases tested, issues resolved and outstanding compatibility items. Four payments of 250,000 CC are earned on committee acceptance of the quarterly maintenance work. Adoption deadlines do not extend this maintenance term. Later adoption payments still require qualifying production use if the maintenance term has ended.

M1 through M8 total up to 7,700,000 CC. The five adoption milestones, M3 and M5 through M8, account for up to 6,500,000 CC, or 84.4% of that budget and 74.7% of the total request including maintenance. Annual maintenance is budgeted separately. The grant is denominated in fixed CC, with a volatility review at month 6. Any adjustment to outstanding payments requires committee approval.

**Program references:** [Canton roadmap and RFPs 20 and 27](https://github.com/canton-foundation/canton-dev-fund/blob/main/2026-2028-strategic-roadmap.md) · [Development Fund governance](https://github.com/canton-foundation/cips/blob/main/cip-0100/cip-0100.md)
