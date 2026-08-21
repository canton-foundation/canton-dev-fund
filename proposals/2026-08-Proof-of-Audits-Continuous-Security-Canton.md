# Development Fund Proposal

| Field | Value |
| :---- | :---- |
| Author | MK Veerendra Vamshi |
| Org | Proof of Audits |
| Status | Draft |
| Created | 2026-08-21 |
| PR | (add link after PR opened) |

---

# Abstract
Proof of Audits is the contest platform whose output does not expire. Contest-style discovery (pre-audit readiness, T4->T1 core audit, post-audit fix proof) becomes living evidence: deployed-code match, authority controls, Native v5 scoring /1400, Trust Passport. We propose to build Canton-specific, open-source extensions: Daml-aware Pre-Audit Engine, Privacy-Preserving Trust Passport (permissioned evidence vault), and Canton support for Contract Shield (bytecode + authority match). Delivers shared security infra for all Canton apps. Live at https://proofofaudits.com - public beta 30 Jul 2026, pre-revenue, 40+ auditors scored.

# Specification

## 1. Objective
**What we are:** Proof of Audits - contest for discovery, proof for protection. Public website + operational app that makes proof easier to trust than a badge or PDF. Trust boundary: we present evidence and remaining risk, not a safety guarantee. Positioning: #contest-to-proof -> #how-we-do-it -> #how-we-are-better.

**What we do:** 4 sequential phases: Pre-Audit (X-Ray + Antigravity bundle: invariants, Halmos verification), Core Audit (4-tier waterfall T4 Function -> T3 Contract -> T2 Cross-Contract -> T1 System, sequential validation), Post-Audit (independent fix verification), Scoring & Evidence (/1400 VTI, Trust Passport, Contract Shield).

**Why for Canton:** Canton is privacy-by-default (need-to-know, Daml signatory/observer/controller, synchronizer sees only metadata). Institutions (Goldman, DTCC, Euroclear) cannot use public EVM static PDFs. Daml authorization leaks and cross-package authority delegation are invisible to Solidity tools (Slither/Halmos). Canton needs continuous compliance proof.

## 2. Implementation Mechanics
1. **Daml Pre-Audit Adapter:** Parse `.dar` + `daml.yaml`, build call graph for templates/interfaces/choices, port 7-step invariant taxonomy (conservation, guard lift, ratio, state machine, temporal, cross-contract, economic) to Daml choices.
2. **Cross-Package Analyzer:** Input compiled `.dar`, output for every cross-package interaction: source file, line/col, calling package/version, referenced package/interface, template/choice, consuming flag. Produces stable JSON + visual graph (Graphviz/Mermaid), like 2026-03 Certora proposal but for audit scoping.
3. **Permissioned Trust Passport:** Public: VTI /1400 + green check + freshness timestamp. Private vault: full Evidence Bundle + key-holder interview, KYC-gated decrypt + ZK attestation (proves keys verified without revealing identities). Solves privacy conflict for banks.
4. **Contract Shield for Canton:** Extension at /extension + /verify-contract verifies `deployed DAR hash == reviewed DAR hash` and authority controls (party allocation, signatory thresholds) before signing. 100% free for users. Integrates with `dpm`/`daml build` CI.

## 3. Architectural Alignment
Operates at package level on compiled `.dar` - same artifact deployed. Static only, no ledger mutation, no runtime change. Respects Canton privacy: need-to-know visibility. Complements Zenith EVM (CIP-0091, `external_call`) by covering Daml-native and Daml<>EVM composability. Aligns with Canton polyglot vision.

## 4. Open-Source
Apache-2.0. All code repos public under Proof of Audits. Proposal docs CC0-1.0.

## 5. Backward Compatibility
No impact. Tool only reads `.dar`, does not modify code or ledger state.

---

# Milestones and Deliverables

## Milestone 1: Daml Pre-Audit Adapter & Analyzer - 2 months
CLI that takes `.dar` input, outputs stable JSON + visual graph. Detects choice exercise + template usage with all 6 fields per interaction. Includes docs, validated on representative Daml projects.

## Milestone 2: Permissioned Trust Passport + Pilot - 1 month
Passport service with public/private split + ZK demo live. Run on Splice + 5 voting member apps / representative deployments (with Foundation intro support). Feedback incorporated, docs updated.

## Milestone 3: Contract Shield for Canton + Broad Adoption - 1 month
Extension verifies DAR hash + authority on Canton validator. Run on 5 additional production-scale deployments. CI template + tutorial video published.

| Milestone | Duration | Start After Approval | Funding |
| :---- | :---- | :---- | :---- |
| M1: Daml Adapter & Analyzer | 2 months | Month 0 | 150,000 CC |
| M2: Passport Pilot | 1 month | Month 2 | 135,000 CC |
| M3: Shield Adoption | 1 month | Month 3 | 135,000 CC |
| **Total** | **4 months** |  | **420,000 CC** |

Volatility: denominated in CC at 0.15 USD reference, 30-day MA band 33.3% (0.10-0.225), monthly rebase if outside band per Zenith model.

---

# Acceptance Criteria

**M1:**
- CLI runs on Linux/MacOS/Windows, accepts `.dar`, outputs stable JSON + visual
- Reports all interactions with: source file path, line/col, calling package/version, referenced package/interface, template/choice, consuming flag
- Detects both choice exercise and template usage
- Documentation explains usage and interpretation
- Released Apache-2.0, 3 voting members review and accept

**M2:**
- Passport live with public score + private vault + ZK attestation demo
- Splice + 5 voting members/representative deployments have run tool on their codebases
- Each endorses milestone and expresses interest to continue use
- Feedback incorporated, docs updated

**M3:**
- 5 additional production-scale deployments have run tool, endorsed milestone
- Extension published and verifies deployed DAR matches reviewed DAR on Canton validator
- CI integration example live, tutorial published

---

# Funding
**Total: 420,000 Canton Coin**, milestone-based, released after acceptance per CIP-0100. Quarterly reporting. Funding administered by Tech & Ops Committee.

# Co-Marketing
Joint blog on Daml cross-package security, technical deep-dive on permissioned proof, workshop for Canton devs, demo at quarterly report.

# Motivation
Makes Canton audits faster, deterministic, privacy-preserving. Reduces manual review time, catches unintended authority delegation in multi-party workflows. Essential for multi-party finance where delegated control over money movement is hardest to detect.

# Rationale
Analyzing deployed `.dar` is most reliable - reflects exact deployed code and allowed authority. Deterministic, faster and more consistent than manual review, easy to integrate into CI. Complements rather than replaces audits.

# Team
MK Veerendra Vamshi - solo founder, Proof of Audits. Top 10 Sherlock, 180+ GitHub repos, Cyfrin certified. Full-stack Web3.

# Maintenance
12 months maintenance included (bug fixes, Daml SDK updates). Future work via follow-on proposal if needed.

# License
Proposal CC0-1.0, Code Apache-2.0
