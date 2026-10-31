## Development Fund Proposal

**Organization:** Independent (Rume Dominic / O'Rume Dominic Uririe)  
**Author / Primary Contact:** Rume Dominic, dominicrume@gmail.com, github.com/dominicrume  
**Status:** Draft  
**Created:** 2026-09-06 (Updated 2026-10-17)  
**Proposal Type:** RFP-aligned  
**RFP / Roadmap Area:** Security, Assurance & Incident Readiness. **RFP 27, Security Monitoring, Auditability and Evidence**  
**Champion:** `Needs Champion`  
**Total Funding Request:** 300,000 CC  
**Project Duration:** 16 weeks  
**Label:** regulatory-compliance  

---

## Abstract

Canton keeps transaction details private, which means an institution cannot prove its own operational conduct to a counterparty, auditor, or regulator simply by showing them the ledger. The compliance gap is sharpest for actions that were **refused**: an ordinary internal audit log contains only what an application recorded, and the party writing that log is the exact party under examination.

This proposal delivers:

> **A reusable Daml module that records refused authorisations as contracts, and discloses them to a named auditor party without disclosing the actions that were allowed.**

Every element directly addresses **RFP 27** (*"audit trails, compliance evidence... and how privacy, access controls, and selective disclosure will be handled"*). Under Canton's sub-transaction privacy model, a refused transaction normally aborts via `assertMsg`, leaving zero trace on-ledger. This module turns refused attempts into tamper-evident, committed contracts observed exclusively by designated auditing parties.

The specification, a 20-vector conformance suite, and a working Daml reference implementation (`canton-refusal-record`) already exist under the MIT licence. This grant funds the formalization of the module, an independent Daml contract review, and direct integration into production-ready Canton applications. In direct alignment with Foundation guidance that adoption is the primary indicator of success, **30% of the total budget (90,000 CC) is dedicated to ecosystem adoption, partner co-integration, and developer enablement**.

---

## Specification

### 1. Objective

**One objective: a reusable Daml module that records refused authorisations as contracts, and discloses them to a named auditor party without disclosing the actions that were allowed.**

The problem is concrete:
1. Under Canton's privacy model, a participant sees only the sub-transactions in which it is a stakeholder. Compliance evidence cannot be reconstructed by an outside observer; it must be produced by the participant whose conduct is under review. Self-attested log files are only as trustworthy as the operator hosting them.
2. The acute vulnerability lies in **refusals**. When an authorisation check stops an execution, the transaction aborts and nothing durable is recorded on-ledger. The attempt exists only in local application logs. 
3. RFP 27 specifically requests audit trails and compliance evidence while preserving Canton's privacy model, with selective disclosure and access controls handled explicitly.

By committing a refusal record as an explicit Daml contract (`ChargeRefused` / `RejectedAttempt`), refusals become first-class, tamper-evident ledger artefacts. Selective disclosure allows a participant to prove every refused authorisation to an auditor without exposing any settled, allowed transactions.

**In scope:**
- Written specification of the canonical record format and hashing scheme.
- A language-neutral conformance suite (20+ vectors) and automated grader.
- A reusable Daml reference module (`canton-refusal-record`) with mutation-tested authorisation fences.
- An on-ledger anchor contract that binds record sequences to the ledger without disclosing transaction contents.
- A zero-dependency browser verifier requiring no installation, wallet, or network connection.
- Co-integration and verified adoption across at least two independent Canton applications (e.g., delegated automation runners and deterministic settlement rails).

**Out of scope:**
- Custodial storage, cryptographic key lifecycle, payment licensing, identity issuance, and formal regulatory endorsement.

### 2. Implementation Mechanics

**The record.** An entry is a JSON object naming what was attempted, the rule that refused it, the outcome, and the ledger timestamp. Its seal is `sha256(canonical(entry_without_seal) + previous_seal)`, where `canonical` produces deterministic JSON with sorted keys, standard separators (`","` and `":"`), and non-ASCII character escapes. Entries form an immutable hash chain where altering or omitting any historical record invalidates all subsequent seals.

**Why a hash chain rather than signatures.** Verification must be possible without complex PKI distribution, specialised nodes, or external network connectivity. A counterparty or auditor with the disclosure file and a SHA-256 implementation can independently verify integrity offline. Ledger anchoring establishes proof of origin.

**The ledger anchor.** A self-contained hash chain proves internal consistency, but cannot prove that an entire chain was not fabricated. To resolve this, the head seal and entry count are committed to Canton as a Daml anchor contract. An auditor queries the ledger to confirm whether a given head seal was registered. A fabricated chain answers `NOT ANCHORED`. **No entry content reaches the ledger**, only the head seal and count, fully preserving transaction confidentiality.

**The Daml refusal module.** The reference implementation enforces authorization boundaries via choice bodies: spending caps, periodic rate limits, allow-lists, cooldown windows, and expiration constraints. When a boundary is breached, instead of aborting the transaction and leaving no trace, the ledger creates a `ChargeRefused` contract witnessed by the designated auditor party.

**Existing technical baseline (verified from clean clone):**

| Component | Verified Metric |
|---|---|
| Daml test scripts | 100 of 100 passing; 30 of 44 template choices exercised (remaining 14 are Daml's internal `Archive`) |
| Fence coverage | 30 of 30 assertion fences mutation-tested; removing any single check fails a named test |
| Suite integrity | 23 deliberate defects introduced; test harness caught 100% |
| Conformance agreement | 3 independent implementations (Python, JavaScript, Go) passing 20 conformance vectors |
| Robustness | 553 malformed request variants across all routes; 0 server crashes or dropped connections |
| Baseline Daml package | `kya-rails-mandate` built on SDK 3.4.11; vetted on Canton DevNet |
| Self-test harness | Offline test runner reporting 20/20 conformance vectors without external network calls |

**Operational approach.** Zero external runtime dependencies in core libraries. The verifier operates as a single standalone HTML/JS page runnable directly from local disk.

### 3. Architectural Alignment

This module uses Canton for the exact capability unique to Canton: binding private audit evidence to a shared ledger without publishing confidential transaction data.

It is deliberately scoped beneath broader identity and credential frameworks rather than conflicting with them. While identity working groups define authority structures and institutional signing credentials, this module provides the execution-level audit trail whenever an authorization check succeeds or fails.

Prior art relationship:
- Canton static analysis tools (`daml-lint`, `daml-verify`) inspect source code before deployment.
- Monitoring frameworks (such as Hacken's Canton Monitor, Dev Fund #302) operate at node boundaries to emit operational SIEM alerts.
- This module sits at the contract execution boundary: it produces the tamper-evident, selectively-disclosed artifact an operator hands to an auditor who does not trust internal logs.

### 4. Backward Compatibility

Zero breaking changes. The format is strictly additive and `canton-refusal-record` is an independent Daml package. Applications that do not integrate it remain entirely unaffected.

---

## Milestones and Deliverables

Sixteen weeks across four milestones. In accordance with Foundation and DevRel guidance that **adoption is the primary indicator of success**, the budget allocates **30% (90,000 CC) explicitly to adoption, integration engineering, and developer enablement**.

### Milestone 1: Specification Hardening & Multi-Language Conformance (Week 4)
- **Allocation:** 60,000 CC (50,000 CC Engineering / 10,000 CC Conformance Tooling & Grader)
- **Focus:** Ensure the record format and canonicalisation standard are unambiguous and implementable by third parties from documentation alone.
- **Deliverables:**
  - Hardened specification document with formal edge-case canonicalisation rules.
  - Conformance vector suite expanded beyond 20 vectors, covering adversarial formatting.
  - Language-neutral test grader executable across any runtime via standard I/O pipes.
- **Value Metric:** At least one external implementation in an unrepresented language passing the full conformance suite from documentation alone.

### Milestone 2: Reusable Daml Refusal Module & Independent Audit (Week 8)
- **Allocation:** 60,000 CC (35,000 CC Module Engineering / 25,000 CC Third-Party Audit)
- **Focus:** Package `canton-refusal-record` as a battle-tested, reusable library ready for ecosystem integration.
- **Deliverables:**
  - Generalised Daml template library with documented extension points for common authorization models (spending caps, period limits, cooldowns).
  - Independent Daml contract review and architecture audit conducted by a reputable third party; all findings and remediation logs published in full.
  - Threat model and privacy matrix documenting signers, observers, and disclosure boundaries for every contract.
- **Value Metric:** Published third-party audit report with all critical and high-severity findings remediated.

### Milestone 3: Adoption & Integration into Two Canton Rails (Week 12)
- **Allocation:** 90,000 CC (45,000 CC Adapters & Core Integration / 45,000 CC Direct Adoption Engineering & Partner Support)
- **Focus:** Real-world integration into two live Canton applications outside the applicant's control.
- **Target Adopters & Use Cases:**
  1. **Delegated Contract Automation:** Integration with delegated automation runners (such as Vacuumlabs' Delegated Automation Capability, Dev Fund PR #627 / forum #9084). In delegated automation, bounded tasks run on-chain checks (cooldown, run count, cap). When an automated check fails, the transaction aborts and leaves zero on-ledger evidence. This integration captures those refusals as committed `RejectedAttempt` contracts.
  2. **Deterministic Settlement / Collateral Rails:** Integration with an OTC remittance or collateral engine, ensuring refused transactions create selective audit contracts.
- **Deliverables:**
  - Two merged pull requests into external Canton application repositories.
  - Minimal reusable adapter templates published in this repository so subsequent integrations require zero custom plumbing.
  - Written alignment note agreed with the Identity and Metadata SIG regarding the boundary between this evidence layer and institutional authorization frameworks.
- **Value Metric:** **Two merged pull requests in repositories outside the applicant's control, each actively producing conforming refusal records verified by the grader.**

### Milestone 4: Production Handover & Ecosystem Adoption Enablement (Week 16)
- **Allocation:** 90,000 CC (55,000 CC Production Verification Library / 35,000 CC Developer Documentation, Runbooks & Ecosystem Adoption)
- **Focus:** Live deployment, ecosystem distribution, and long-term project sustainment.
- **Deliverables:**
  - Standalone verifier library and zero-dependency web interface published for public verification.
  - Complete integration documentation and developer guide published in the Canton Developer Hub.
  - Ecosystem onboarding runbooks and developer support to assist builders adopting refusal auditing.
  - Maintainer handover documentation, with a named second maintainer committed to repository maintenance.
- **Value Metric:** **At least one integration running against a live Canton environment (TestNet/MainNet) producing anchored records**, with open-source reference verification.

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:
1. Deliverables completed as specified for each milestone.
2. Verified functionality and operational readiness.
3. Documentation and knowledge transfer provided.
4. Alignment with stated ecosystem value metrics.

Project-specific acceptance conditions:
1. **Milestones 3 and 4 require verified external adoption.** Integrations must be delivered as merged pull requests in repositories the applicant does not own, each generating conforming refusal records.
2. **Third-party implementation independently passes conformance.** A separate implementation written from the specification alone must pass the 20+ vector test suite.
3. **Independent Daml contract review published in full.** All findings and remediations must be public.
4. **Second maintainer onboarded.** A second maintainer with commit rights must accept in writing before final milestone acceptance.
5. **Every quantitative claim reproducible.** Reviewers can verify all benchmark and coverage claims from a clean clone using documented commands.

---

## Funding

**Total Funding Request:** 300,000 CC

Total scope for the sixteen weeks is estimated at **$36,000 USDT** fixed at submission. The Foundation grant covers the milestone payments below; the applicant covers the balance as an in-kind co-investment (existing MIT codebase, specification, 3 implementations, and test suites).

### Budget Allocation Overview

| Category | CC Allocation | Percentage | Focus |
|---|---|---|---|
| **Core Engineering & Audit** | 210,000 CC | 70.0% | Specification hardening, Daml module generalization, third-party audit, verifier library |
| **Ecosystem Adoption & Enablement** | 90,000 CC | 30.0% | Partner co-integration (delegated automation, settlement), adapter templates, developer runbooks, pilot support |
| **Total** | **300,000 CC** | **100.0%** | |

### Payment Breakdown by Milestone

- **Milestone 1 (Specification Hardening & Conformance):** 60,000 CC (50k engineering / 10k conformance tooling)
- **Milestone 2 (Daml Module & Independent Review):** 60,000 CC (35k module / 25k third-party audit)
- **Milestone 3 (Two Rails Integration & Adoption):** 90,000 CC (45k adapters / 45k partner co-integration)
- **Milestone 4 (Production Handover & Adoption Enablement):** 90,000 CC (55k production library / 35k runbooks & developer bounties)

### Adoption-Led Acceptance

Milestones 3 and 4 are accepted on verified ecosystem adoption. Rather than asking the committee to fund abstract engineering, payment is tied to merged pull requests in repositories the applicant does not own and live verification on Canton.

### Volatility Stipulation

Project duration is **under 6 months**. Should the timeline extend beyond six months due to Committee-requested scope changes, remaining milestones may be renegotiated to account for significant USD/CC volatility.

---

## Co-Marketing

Upon release, the applicant will collaborate with the Canton Foundation on:
- Formal release announcement coordination.
- A technical write-up on producing compliance evidence under a privacy-preserving ledger model, including transparent disclosure of what the approach does **not** prove.
- Developer workshops and promotion through the Canton Developer Hub and relevant SIGs.

Specific commitment: The applicant will document failure cases and conformance vector discoveries as prominently as successes, reinforcing an engineering-first culture.

---

## Motivation

**Who benefits.** Any Canton participant required to demonstrate its operational compliance to an external counterparty or regulator. The immediate beneficiaries are applications running regulated workflows or bounded delegated execution—such as delegated contract automation (e.g., Vacuumlabs' delegated automation capability, Dev Fund #627)—where on-chain checks abort on failure and leave zero trace on-ledger.

**The originating case.** This work originated from an over-the-counter and remittance desk in Nigeria that lost funds to two specific failures: a payout account substituted after a quote was locked, and a single quote executed twice. Neither was a cryptographic failure; both were authorization failures that could not be proven after the fact. Both are now fenced in Daml with named mutation tests. Small operational businesses are where this evidence gap costs money first.

**Adoption strategy.** An evidence layer cannot wait for passive discovery. By actively co-engineering integrations with active ecosystem tooling—such as delegated automation runners and settlement rails—this proposal provides ready-to-merge adapters that immediately give Canton applications auditable refusal records.

---

## Rationale

**Why extend rather than replace.** The module builds on existing Canton strengths. It does not replace static analysis or node-level SIEM monitoring; it provides the tamper-evident record an operator provides to an external party when an internal log is insufficient.

**Why a hash chain rather than heavy proving systems.** Heavy proving systems sit at the complex end of verifiability. This proposal deliberately targets lightweight, immediate adoption: a tamper-evident hash chain verifiable in any browser with zero runtime dependencies, adoptable today by any institution or desk with standard hardware.

**Why refusals specifically.** Successful transactions produce contracts. Refused actions abort, leaving nothing. Refusals are therefore the part of an audit trail easiest to dispute and hardest to verify. Recording them as explicit ledger contracts closes Canton's most critical audit vulnerability.

**Why this applicant.** The foundational code, specification, and test harness are already built, public, and MIT-licensed. Milestone 4 explicitly requires a named second maintainer to eliminate single-contributor risk.

---

**Verification.** All baseline metrics are reproducible from a clean clone of `https://github.com/dominicrume/cantor8_kya_rails` (MIT). Exact commands to reproduce every quantitative claim will be provided on request.
