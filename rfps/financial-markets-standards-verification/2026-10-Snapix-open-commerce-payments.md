# Proposal: Snapix Open Commerce & Payments Infrastructure for Canton

**Applicant:** Snapix Ltd. (Ontario, Canada)  
**Contact:** Mohammed Hafeji, Founder & CEO, mohammedhafeji@snapixmoney.com  
**Proposal type:** RFP-aligned — **RFP #13, Payments and DeFi**  
**Primary SIG:** **Financial Workflows & Composability** (`financial-workflows-composability`)  
**Secondary technical alignment:** dApp Integration (`dapp-integration`), for reusable API and reference-app guidance  
**Champion:** **Needs Champion**  
**Funding requested:** US$100,000 equivalent, **denominated in Canton Coin (CC)**; exact CC quantity and exchange convention to be agreed in review.  
**Proposed duration:** 6 months after approval  
**Status:** Proposed, not approved; no Canton production deployment claimed.

## Overview

Snapix Ltd. proposes an open-source Daml-based **merchant payment reference, reconciliation and privacy-preserving commerce workflow toolkit**. Merchant applications often need to coordinate external PSP transaction events, refunds, digital receipt references and merchant reporting while keeping commercial data appropriately private. The project will publish reusable Canton-native models, interfaces, SDK examples, tests and documentation for independent ecosystem developers. It will not subsidize Snapix Money's proprietary mobile application.

This concept was introduced to the Canton Development Fund community mailing list on October 7, 2026 at the Foundation's direction. Snapix Money is in MVP development and may serve as a reference consumer; no real production Canton transactions or merchant pilots are claimed.

## Deliverables

**D1. Canton Commerce Transaction Model:** Open Daml templates/interfaces and sample workflows for merchant payment *references*, externally reported transaction states, reconciliation events, refunds/adjustments, and minimal commerce metadata. Specify signatories, observers, controllers, permissions, lifecycle transitions and test coverage.

**D2. Merchant Payment & Reconciliation SDK:** Provider-neutral API contracts and sample external-event adapters with idempotency, error handling, status sync, reconciliation exports and synthetic fixtures. No claim that a PSP integration, on-chain card settlement, or partner endorsement already exists.

**D3. Privacy-Preserving Receipt & Commerce Record Pattern:** Reference architecture linking permitted ledger events to off-ledger receipt records without placing PAN, CVV, raw personal data or unnecessary customer details on Canton. Publish visibility matrix, threat model, sample schemas and tests.

**D4. Canton Payment Reference Application:** Open-source demo showing a synthetic external payment event, authorized Canton workflow state updates, reconciliation, reference refund/adjustment, and receipt lookups. This is not a regulated payment processor or production settlement rail.

**D5. Testing, Documentation & Integration Toolkit:** Daml scenario and integration tests, LocalNet quickstart, sample API clients, architecture diagrams, failure-mode documentation, onboarding instructions and maintenance plan.

## Architecture, public-good value and RFP fit

**RFP #13 Payments and DeFi** explicitly seeks open-source tooling and reference implementations that make private, auditable and interoperable payment workflows easier to build on Canton. This project aims to provide interoperable building blocks usable by multiple unrelated wallets, merchant software providers or payments apps, not merely Snapix Money.

A Canton Daml workflow layer holds minimal permissioned transaction references and status transitions. A separable off-ledger adapter receives **simulated or sandbox** PSP events and makes authorized updates; off-ledger merchant and receipt systems retain sensitive details. Crucially, Canton records do not themselves confirm external bank/card settlement. Current ecosystem projects and relevant standards must be assessed for overlap before implementation.

### Relationship to existing payment infrastructure: Payvol PR #859

The existing [Payvol proposal #859](https://github.com/canton-foundation/canton-dev-fund/pull/859) describes open payment intents, authorization/handoff, execution profiles, transaction lifecycle and reconciliation on Canton. Our proposal should **not** create another generic payment-intent standard, wallet handoff, or Canton Token Standard settlement implementation.

The proposed distinct work, **subject to SIG validation**, is a narrowly scoped, provider-neutral bridge from *external merchant/PSP event records* into permissioned Canton-native payment references and merchant-facing reconciliation/receipt state. This includes deterministic synthetic event ingestion, refund/adjustment correlation, idempotent processing, privacy boundaries for off-ledger customer and receipt data, and independently reproducible samples. Where Payvol or relevant Canton standards already solve a subproblem, we intend to reuse them rather than fork competing interfaces. No integration partnership, production transaction flow or Payvol endorsement is claimed.

**Specific questions for the SIG:** Is this external-PSP reconciliation boundary a useful common-good gap? Which established Canton standards or open-source projects should be reused? Which deliverables should be narrowed or dropped to avoid duplication?

## Proposed milestones and objective acceptance criteria

| Milestone | Target | Grant share (USD equivalent) | Public acceptance evidence |
|---|---|---:|---|
| M1: Scope, Canton architecture and repo/CI | Month 1 | $15,000 | Reviewed model, permissions/privacy matrix, working LocalNet quickstart, public architecture |
| M2: Daml transaction and reconciliation models | Month 2 | $25,000 | Source and reproducible lifecycle, authorization and negative scenario tests |
| M3: Provider-neutral SDK and privacy receipt pattern | Months 3–4 | $25,000 | Documented APIs, mock event adapter, retries/idempotency tests, privacy threat model |
| M4: Open-source reference app and controlled tests | Month 5 | $20,000 | Public executable end-to-end demo with synthetic fixtures and reconciliation failure scenarios |
| M5: Public release, adoption feedback and handoff | Month 6 | $15,000 | Versioned release, developer docs, reproducible tests, external technical feedback and maintenance plan |
| **Total** | **6 months** | **$100,000** | **Subject to Canton governance review and CC-denominated funding approval** |

The **original functional budget** circulated for community feedback on October 7 was: $35K Canton/Daml engineering; $20K SDK/backend; $15K security/QA/testing; $15K reference app/pilot; $10K docs/examples; $5K infrastructure/monitoring. Those categories are the internal cost view of the same $100K request; the milestone table above is a proposed payment/acceptance view, **not additional funds**.

## Delivery, risks and sustainability

Snapix has an early-stage, part-time contributor team and will plan resources against milestones before funding approval. The initial month gates continuation on Canton SDK feasibility, SIG reviewer input, code overlap check and agreed acceptance tests. Risks include external PSP event integrity, private-party authorization, real-world integration costs, model upgrades and inadequate third-party adoption. Proposed mitigations include mocked connectors, testable data boundaries, code review, modest scopes and publishing provider-neutral interfaces.

The project will be released under a permissive open-source license (proposed **Apache-2.0**) with public issues, documentation, security contact and a six-month post-release issue triage and compatibility review plan, resourcing to be finalized. Snapix commits only the grant-funded shared components to open source; its unrelated proprietary code remains separate.

**Adoption plan:** seek technical feedback from the relevant SIG and at least two independent Canton developers/teams, publish a reproducible local demonstration, and collect documented integration attempts or feedback before declaring adoption. External adoption is a target, **not a current achievement**.

**Proposed adoption verification (for reviewer discussion, not achieved):** track independent teams that clone and run the reference flow, can reproduce the documented local tests, and provide publicly attributable or consented technical feedback. A team counts as an adopter only when it supplies evidence of a working integration or reproducible end-to-end run outside Snapix. The initial objective is feedback from two independent technical teams; the Foundation and a Champion may request stronger independent usage gates or revised milestone allocations before voting. We will not report interest, outreach or our own demo as independent adoption.

## Requested review and next steps

1. Confirm **RFP #13** alignment and the appropriate SIG.
2. Identify a **Tech & Ops Champion** or mark this PR **Needs Champion**.
3. Identify existing Canton payment/SDK work that must be reused rather than duplicated.
4. Agree on the precise CC-denominated request, conversion, milestones, acceptance criteria and governance process.
5. Review feasibility, privacy and security before any approval.

**Community contact:** Mohammed Hafeji — mohammedhafeji@snapixmoney.com  
**Project:** https://snapixmoney.com
