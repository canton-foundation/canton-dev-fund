# Development Fund Proposal

| Field | Value |
| :---- | :---- |
| Author | MK Veerendra Vamshi |
| Org | Proof of Audits |
| Status | Draft |
| Created | 2026-08-21 |
| Champion | TBD - Tech & Ops Champion to be assigned via SIG daml-tooling (per CIP-0100 external proposal flow) |
| SIG | daml-tooling |
| PR | https://github.com/canton-foundation/canton-dev-fund/pull/654 |

---

# Abstract
**Proof of Audits is the contest platform whose output does not expire.** Our main is the **T4->T1 sequential waterfall** - the only audit model that guarantees full coverage with zero duplicate pay and zero blind spots. We propose to ship this T4->T1 engine for Canton as open-source, Canton-native infrastructure: Daml-aware analysis + continuous proof (DAR match + authority) + permissioned Trust Passport. All at once - one unified delivery, not piecemeal.

**Core thesis:** Most contests have 10 auditors looking at same high-value lines while boring edge cases are missed. Our T4 (Function) -> T3 (Contract) -> T2 (Cross-Contract) -> T1 (System) waterfall is sequential: T3 must validate T4 findings before work, T2 validates T3, T1 validates T2. No redundancy, 100% coverage. This is the missing shared infra for Canton.

# Specification

## 1. What Proof of Audits is (correct wording)
Proof of Audits - contest for discovery, proof for protection. Public website + operational app that makes proof easier to trust than a badge or PDF. Trust boundary: we present evidence and remaining risk, not a safety guarantee. Live at https://proofofaudits.com - public beta 30 Jul 2026, pre-revenue, 40+ auditors scored, solo founder MK Veerendra Vamshi. Positioning: #contest-to-proof -> #how-we-do-it -> #how-we-are-better.

## 2. Why Canton needs T4->T1
Canton is privacy-by-default (need-to-know, Daml signatory/observer/controller, synchronizer sees only metadata). Institutions cannot trust static PDFs. Daml failures are not Solidity reentrancy - they are **authorization leaks, cross-package choice exercise delegation, and multi-party workflow breaks**. These live exactly in T2 (cross-contract) and T1 (system) - the layers every other audit model ignores. Without T4->T1, Canton has no guarantee those layers were reviewed.

## 3. Implementation - all at once
**Single unified CLI + Passport + Shield - built together, shipped together:**

**T4 Engine (Function):** Granular edge cases per choice - delta writes, guard predicates, fund flows per function. Synthetic Halmos-style checks on Daml choices.

**T3 Engine (Contract):** Whole-contract invariant checks per template/interface. Must validate T4 findings first.

**T2 Engine (Cross-Contract):** The Canton-critical layer. Parses compiled `.dar`, builds call graph, reports every place package A can exercise a choice or create a template of package B with file:line, package versions, template/choice, consuming flag. Produces stable JSON + Graphviz/Mermaid (as in Certora 2026-03 proposal but wired into T4->T1 chain). This catches delegated money movement.

**T1 Engine (System):** Global workflow, economics, governance across subnets. Validates T2 findings before system verdict.

**Continuous Proof (all tiers):** DAR hash matching (`deployed DAR == reviewed DAR`), authority controls (party allocation, signatory thresholds), Native v5 scoring /1400, permissioned Trust Passport (public VTI + green check, private vault with KYC-gated full bundle + ZK attestation so banks don't leak IP).

**Contract Shield for Canton:** Extension /verify-contract checks DAR match + authority before signing. 100% free. Integrates with `daml build`/`dpm` CI.

## 4. Architectural Alignment
Operates at package level on compiled `.dar` - same artifact deployed. Static only, no ledger mutation. Respects need-to-know privacy. Complements Zenith EVM (CIP-0091 `external_call`) by covering Daml-native + Daml<>EVM composability. No backward compatibility impact - only reads `.dar`.

## 5. Open-Source
Apache-2.0 for code, CC0-1.0 for proposal. All repos public.

---

# Milestones and Deliverables - all at once, 4 months

We deliver T4->T1 as one integrated system, but payments stay milestone-based per fund rules:

## Milestone 1: T4->T1 Daml Engine (Core) - 2 months - 210,000 CC
- T4+T3+T2+T1 engines working on `.dar` input
- CLI on Linux/MacOS/Windows outputs JSON + visual for all tiers
- T2 cross-package reports with 6 fields (file, line/col, calling pkg/version, referenced template/interface/choice, consuming flag)
- T4->T3->T2->T1 validation chain enforced (can't skip tier)
- Docs + Apache-2.0 + validated on 2 representative Daml projects

## Milestone 2: Pilot on Live Canton Apps - 1 month - 105,000 CC
- Run integrated engine on Splice + 5 voting member apps / representative deployments (with Foundation intros)
- Issue permissioned Trust Passports (public /1400 + private vault)
- Each deployment endorses milestone, feedback incorporated

## Milestone 3: Contract Shield + Broad Adoption - 1 month - 105,000 CC
- Shield extension live verifying DAR hash + authority on Canton validator
- 5 additional production deployments run integrated T4->T1 engine, endorse
- CI template for `daml build` + tutorial video

| Milestone | Duration | Funding |
| :---- | :---- | :---- |
| M1: T4->T1 Engine | 2 months | 210,000 CC |
| M2: Pilot | 1 month | 105,000 CC |
| M3: Shield + Adoption | 1 month | 105,000 CC |
| **Total** | **4 months** | **420,000 CC** |

Volatility: denominated CC at 0.15 USD ref, 30-day MA band 33.3% (0.10-0.225).

---

# Acceptance Criteria

**M1 (T4->T1 Engine):**
- CLI accepts `.dar`, runs all 4 tiers sequentially, enforcement verified (T3 can't run without T4 pass)
- T2 detects both choice exercise + template usage with all 6 fields
- JSON stable + visual graph available
- 3 voting members review and accept, Apache-2.0 released

**M2 (Pilot):**
- Splice + 5 members run full T4->T1 engine, passports issued
- Each endorses and expresses interest to continue

**M3 (Shield):**
- Extension verifies deployed DAR == reviewed DAR + authority
- 5 additional deployments run full engine, endorse
- CI example + tutorial published

---

# Funding
**Total: 420,000 Canton Coin**, milestone-based per CIP-0100. Quarterly reporting via Tech & Ops Committee.

# Co-Marketing
Joint blog: "Why T4->T1 is the missing coverage model for Daml", deep-dive on cross-package delegation risk, workshop for Canton devs.

# Motivation
Canton has EVM compatibility (Zenith) and a Daml analyzer (Certora) but no guaranteed-coverage audit model. T4->T1 fills that gap - the only model that proves every layer was reviewed by the right specialist with no overlap and no blind spot.

# Rationale
Deployed `.dar` analysis is most reliable - reflects exact deployed code. T4->T1 sequential validation is faster and more deterministic than crowd re-review, easy CI integration.

# Team
MK Veerendra Vamshi - solo founder, Proof of Audits. Top 10 Sherlock, 180+ GitHub repos, Cyfrin certified. Full-stack Web3.

# Maintenance
12 months maintenance (bug fixes, Daml SDK updates).

# License
Proposal CC0-1.0, Code Apache-2.0
