CANTON DEVELOPMENT FUND · PROPOSAL

**Proof of Audits - Continuous T4->T1 Security for Canton**

| AUTHORS | MK Veerendra Vamshi — Proof of Audits (https://proofofaudits.com) |
| :---- | :---- |
| STATUS | Draft |
| CREATED | 2026-08-21 |
| LABEL | daml-tooling |
| CHAMPION | (TBD) |

**Abstract**

Proof of Audits runs a contest platform where the report does not die after the audit. We run T4->T1: Function -> Contract -> Cross-Contract -> System in sequence. T3 must validate T4, T2 must validate T3, T1 must validate T2. No duplicate pay, no blind spots. For Canton we will ship this T4->T1 engine as open-source, Canton-native infra - a Daml-aware CLI + permissioned Trust Passport + Contract Shield. All at once, not piecemeal. Live at proofofaudits.com (beta 30 Jul 2026, 40+ auditors scored).

**Specification**

**1. Objective**

Ship one unified, open-source system that guarantees every Canton layer was reviewed by the right specialist. Currently 10 auditors check the same high-value lines while T2/T1 are missed. Our T4->T1 fixes that and gives institutions a living proof that the deployed DAR equals the reviewed DAR.

**2. Implementation Mechanics**

We build on the compiled `.dar` - the same file you deploy. It only reads, it never changes the ledger.

* **T4 Engine (Function):** Checks granular edge cases per choice - delta writes, guard predicates, fund flows.
* **T3 Engine (Contract):** Checks whole-contract invariants per template/interface. Must validate T4 first.
* **T2 Engine (Cross-Contract):** The Canton-critical layer. Parses `.dar`, builds the call graph, and lists every place where package A can exercise a choice or create a template of package B - with file, line, package versions, template/choice name, and consuming flag. JSON for CI + visual graph.
* **T1 Engine (System):** Checks global workflows and governance across subnets. Must validate T2 first.
* **Permissioned Trust Passport:** Public sees green check + /1400 score. Private vault holds full bundle and interview - only a KYC'd counterparty you approve can open it. ZK attestation option.
* **Contract Shield for Canton:** Free extension at proofofaudits.com/verify-contract - checks "deployed DAR == reviewed DAR" and signatories before you sign. Fits into `daml build`/`dpm` CI.

**3. Architectural Alignment**

Operates at package level on compiled `.dar`. Static only, no protocol changes. Respects Canton's need-to-know privacy (signatory/observer/controller, synchronizer sees only metadata). Complements Zenith EVM (CIP-0091 `external_call`) and Certora analyzer (2026-03) by covering Daml-native T4->T1.

**4. Backward Compatibility**

Purely additive. Only reads `.dar`. No topology or ledger changes.

**Milestones**

| # | MILESTONE | EST. DELIVERY | FOCUS AND DELIVERABLES |
| :---- | :---- | :---- | :---- |
| **M1** | T4->T1 Daml Engine | Week 8 | CLI on Linux/Mac/Windows running T4->T3->T2->T1 in order, T2 reports 6 fields, JSON + graph, docs, Apache-2.0, validated on 2 Daml projects |
| **M2** | Pilot on live apps | Week 12 | Run on Splice + 5 voting member apps, permissioned passports issued, feedback incorporated |
| **M3** | Shield + broad adoption | Week 16 | Shield live on validator (DAR hash + authority), 5 more production apps run engine, CI template + video |

**Acceptance Criteria**

* **M1:** Reviewer outside our team reproduces build, runs `prove --dar app.dar`, gets JSON + graph with 6 fields, and confirms T3 blocks until T4 passes. 3 voting members accept.
* **M2:** Splice + 5 members each ran engine, got passports, and endorse to continue.
* **M3:** Shield shows green for correct DAR and red for wrong DAR on validator. 5 more members ran engine and endorsed. CI template works.

**Funding**

Total: **420,000 CC** ( ~63k USD at 0.15 ref). Milestone-based per CIP-0100, 30-day MA band 33.3% (0.10-0.225).

* Milestone 1: 210,000 CC
* Milestone 2: 105,000 CC
* Milestone 3: 105,000 CC

Covers engineering, infra, docs, and 12-month maintenance.

**Co-Marketing**

Joint blog on cross-package delegation risk with Foundation, verification walkthrough, workshop for operators in M3.

**Motivation**

Canton hides data by default - that hides the exact risk. In Daml the bug is package A quietly using package B's choice to move money. That lives in T2/T1 where no one guarantees coverage. T4->T1 closes that gap.

**Rationale**

Deployed `.dar` is most reliable - reflects exact deployed code. T4->T1 sequential validation is deterministic, fast, and CI-integrable. Builds on existing co-validation, not a parallel trust system.

Proposal text CC0-1.0 · software artifacts Apache-2.0
