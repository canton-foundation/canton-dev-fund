**Author:** Siam Simpson
**Status:** Submitted
**Created:** 2026-02-19

---

# Daml Security Framework

## Abstract

Canton is the settlement infrastructure for Goldman Sachs, Deutsche Börse, BNY Mellon, and Citadel Securities. The smart contracts governing these workflows are written in Daml. Despite this institutional scale — and despite three production audits in 2025 finding Critical and High severity vulnerabilities — no developer-facing security framework exists for the Daml language: no vulnerability taxonomy, no audit checklist, no scanner, and no threat model. This gap has no parallel in any other production smart contract ecosystem.

This proposal delivers Phase 1 of the Daml Security Framework: a 12-class vulnerability taxonomy, a 45-item pre-deployment audit checklist, and a command-line scanner with detectors for the 6 most serious vulnerability types findable from Daml source code. It follows the model established by CoinFabrik's Scout for Polkadot/ink! — a funded proof-of-concept that proves the taxonomy, delivers a running tool, and lays the foundation for broader framework development. A working scanner detecting two vulnerability classes is already published at https://github.com/1D0n/daml-security-framework.

---

## Specification

### 3.1 Objective

**Problem:** Daml's design prevents an entire class of bugs common in other smart contract languages — reentrancy, overflow, raw storage access. This genuine strength creates a specific danger: developers and auditors conclude that a contract which compiles and passes tests is secure. It is not. Daml's authorization model, privacy rules, and Canton's multi-party execution layer introduce a distinct set of vulnerabilities — signatory bypass, delegation abuse, privacy leakage, ledger time manipulation, cross-domain trust failures — that the compiler does not catch and that no published checklist, tool, or methodology exists to detect. The Quantstamp audit of Canton Coin (August 2025) found authorization bypass, governance flooding, and a field error that completely inverted the authorization logic of a withdrawal operation. Two Halborn audits in December 2025 found state corruption and a Critical vulnerability enabling unbacked token inflation. These findings were made without a shared taxonomy or any detection tooling. The question is how many similar issues remain in unaudited code.

**Intended outcome:** At the end of this project, any Daml developer or security auditor will have: (1) a public, citable catalogue of 12 Daml-specific vulnerability classes, each with a severity rating, code example, real-world evidence, and fix guidance; (2) a 45-item pre-deployment checklist covering authorization, privacy, state management, key management, Canton cross-domain behaviour, and economic logic; and (3) a command-line tool (`daml-check`) that scans any Daml project for the 6 most serious vulnerability types, with a test suite, automatic CI integration, and a published false-positive rate. Institutions deploying on Canton will be able to cite the taxonomy and checklist in regulatory documentation. Audit firms will have a shared vocabulary and a baseline detection tool. This is Phase 1 — the proof-of-concept that establishes the framework; broader detector coverage, IDE integration, and formal verification methodology are Phase 2 scope, documented in the repository roadmap.

### 3.2 Implementation Mechanics

**Phase 1 — Taxonomy and Architecture (Months 1–2)**

The vulnerability taxonomy is structured research, not speculation. Twelve classes have already been identified through analysis of the Daml ledger model, three published production audits (Quantstamp, Halborn × 2), the Daml developer community forum, and comparison with security frameworks for other smart contract languages (Solidity, Plutus, CosmWasm). This milestone turns that research into a published, versioned document with code examples for each vulnerability class and a specification that the scanner implements.

The tool reads Daml source files, parses them into a structured tree of tokens it understands, then runs each security rule against that tree — no Daml installation required, and new rules can be added without changing the core. A working implementation of this approach is already published at https://github.com/1D0n/daml-security-framework with two detectors; Phase 1 extends it to full coverage and formalises the rule interface so the community can contribute detectors.

**Phase 2 — Static Analysis CLI (Months 3–4)**

The scanner (`daml-check`) runs as: `daml-check scan <project-dir>`. It reports findings with severity, file, line number, rule ID, a plain-language description, and fix guidance — the same output format as Slither and Scout. Each finding links to the taxonomy entry for that class. The tool can be added to `daml build` as a pre-step, so builds automatically fail if high-severity findings are present, enabling security gatekeeping in CI/CD pipelines.

Milestone 2 delivers detectors for a minimum of 6 vulnerability classes: CLASS-1 (Signatory Bypass, Critical), CLASS-2 (Delegation Abuse, Critical), CLASS-4 (Choice Replay, High), CLASS-6 (Ledger Time Manipulation, High), CLASS-7 (fetchByKey TOCTOU, High), and CLASS-8 (Cross-Contract Binding, High). Two of these (CLASS-6 and CLASS-9) are already built and published. The remaining 4 complete coverage of all Critical and High severity classes that can be detected from source code alone. The 4 Medium-severity classes that require the compiled contract binary to analyse — not just the source — are documented in the taxonomy and specced as Phase 2 detectors.

Milestone 2 also delivers: a test suite with one vulnerable and one fixed contract per detector; a false-positive rate measured against 2 or more public Daml repositories; and a GitHub Actions integration example.

**Technical stack:** Python 3.10+ (scanner, no external runtime dependencies), Daml (test contracts). All components MIT licensed.

### 3.3 Architectural Alignment

Digital Asset has already built and published the platform security layer: key management documentation, TLS configuration guides, a reference secure deployment, and — critically — mathematically verified proofs of how Daml's authorization model, privacy guarantees, and transaction ordering work. These proofs verify the platform itself is sound. This proposal adds the missing layer above: tools to check that applications built on top of it are sound. No other smart contract platform has this kind of verified foundation to build application-layer security tooling on.

Canton deployments at Goldman Sachs, BNY Mellon, and Deutsche Börse must be auditable to meet regulatory requirements. The Daml Security Framework provides that reference: a taxonomy a compliance officer can cite, a checklist an auditor can apply, and a scanner a developer can run in their build pipeline.

### 3.4 Backward Compatibility

No backward compatibility impact. The scanner is read-only — it does not modify the Daml compiler, the Canton runtime, or any existing contract. Contracts that pass the scan require no changes; contracts that produce findings can be updated at the developer's discretion.

---

## Milestones and Deliverables

### Milestone 1: _Vulnerability Taxonomy and Architecture_
- **Estimated Delivery:** Month 2
- **Focus:** Publish the knowledge base and lay the technical foundation for the scanner
- **Deliverables / Value Metrics:**
  - Daml Smart Contract Vulnerability Taxonomy v1.0 — 12 documented classes, each with severity rating, description, Daml code example, real-world evidence citation, and fix guidance. Published under MIT at https://github.com/1D0n/daml-security-framework
  - 45-item pre-deployment audit checklist across 6 categories (Authorization, Privacy, State Management, Key Management, Canton Cross-Domain, Economic Logic). Published in the same repository.
  - Scanner architecture document: how the tool reads Daml files, the rule interface that new detectors must implement, and a guide for community contributions.
  - Repository scaffolding committed with the two existing detectors (CLASS-6, CLASS-9) ported to the new rule interface and passing their test contracts.

### Milestone 2: _Static Analysis CLI — `daml-check`_
- **Estimated Delivery:** Month 4
- **Focus:** Deliver a working, testable scanner covering the highest-severity vulnerability classes
- **Deliverables / Value Metrics:**
  - `daml-check scan` CLI with a minimum of 6 detectors: CLASS-1 (Signatory Bypass, Critical), CLASS-2 (Delegation Abuse, Critical), CLASS-4 (Choice Replay, High), CLASS-6 (Ledger Time Manipulation, High), CLASS-7 (fetchByKey TOCTOU, High), CLASS-8 (Cross-Contract Binding, High)
  - Test suite: one vulnerable contract + one fixed contract per detector (minimum 12 contracts), all passing
  - Documentation for adding `daml-check` as a pre-build step so CI pipelines can block on findings
  - GitHub Actions workflow example
  - False-positive rate measured against 2+ public Daml repositories, published as a report; target < 15% (consistent with Slither's published metrics)
  - Phase 2 roadmap published in repository: the 6 deferred detectors, IDE integration, and compiled-binary analysis as the next funded phase

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

**Milestone 1:**
- [ ] Vulnerability taxonomy is publicly accessible at the stated GitHub URL with all 12 classes documented to the specified format
- [ ] Audit checklist contains a minimum of 45 items across all 6 categories
- [ ] Architecture document is published and describes how the scanner reads Daml files, the rule interface, and the contribution guide
- [ ] Repository is public and licensed under MIT
- [ ] Two existing detectors (CLASS-6, CLASS-9) are ported to the new rule interface and passing their test contracts

**Milestone 2:**
- [ ] `daml-check scan <dir>` runs without error on a standard Daml project directory
- [ ] All 6 committed detectors are present and individually listable via `daml-check rules`
- [ ] Test suite passes: each detector flags the vulnerable contract and produces no finding on the fixed contract
- [ ] False-positive rate report is published showing < 15% FP rate against the evaluated repositories
- [ ] GitHub Actions integration example runs successfully in a public repository
- [ ] Phase 2 roadmap is published in the repository
- [ ] Following Milestone 2, the repository will be maintained for a minimum of 12 months: SDK version compatibility updates within 2 weeks of new Daml releases, and community-contributed detectors reviewed on a monthly basis.
---

## Funding

### 6.1 Total Funding Request

**Total Funding Request:** $36,000 USDC

_Budget basis:_ 1 senior engineer × $600/day × 60 working days (4 months at approximately 3 days/week) = $36,000. This is the market rate for senior blockchain security engineers, positioning this as a PoC-tier first grant following the same model CoinFabrik used before securing follow-on funding for the full Scout prototype.

### 6.2 Payment Breakdown by Milestone

- Milestone 1 _(Taxonomy and Architecture)_: $14,000 USDC upon committee acceptance
- Milestone 2 _(Static Analysis CLI)_: $22,000 USDC upon committee acceptance

### 6.3 Volatility Stipulation

The project duration is **4 months**, within the 6-month threshold. No volatility re-evaluation clause is required.

---

## Co-Marketing

Upon release, the implementing entity will collaborate with the Foundation on:

- Joint announcement on the Canton Network blog and developer forum (discuss.daml.com) at Milestone 2 release, positioning `daml-check` as the first dedicated security tool for Daml
- Technical blog post at Milestone 2 summarising the vulnerability taxonomy, tool capabilities, and Phase 2 roadmap — targeted at Daml developers and enterprise security teams evaluating Canton
- Presentation at a Canton developer event or community call (virtual or in-person, at Foundation discretion)
- Canton Dev Fund acknowledgment in all repository documentation, publications, and public presentations

---

## Motivation

Canton is not a DeFi experiment. It is the settlement infrastructure selected by Goldman Sachs, Deutsche Börse, BNP Paribas, BNY Mellon, and Citadel Securities for tokenized real-world assets, repo transactions, and post-trade settlement. Goldman Sachs alone executes approximately $280 billion in daily repo volume, a significant portion of which is actively migrating to Canton-based infrastructure. Under SOX, DORA, MiFID II, and Basel III, a settlement failure does not result in cryptocurrency losses absorbed by retail investors. It triggers mandatory regulatory notification, potential trading halts, and capital adequacy recalculations. Security review of the code governing these workflows is a compliance requirement. The tools to perform it credibly do not exist.

No other production smart contract ecosystem at Canton's institutional scale lacks dedicated security tooling. The SWC Registry and Slither exist for Solidity. CIP-52 and Scout exist for Cardano/Plutus. Daml has none of these. The Daml Security Framework closes this gap — as the first systematic, open-source security framework for the Daml language and Canton Network.

---

## Rationale

**Why this approach over alternatives?**

Publishing the taxonomy before building the tool is deliberate. Every comparable security framework — Slither for Solidity, Scout for ink! — required a published vulnerability catalogue before detector development began. The taxonomy defines what each detector is supposed to find and gives auditors a shared language to describe findings. Without it, detectors cannot be independently validated and findings cannot be communicated without the tool author present. The 12-class taxonomy in this proposal was built from three production audits, the Daml developer community forum, and comparable frameworks in other ecosystems — it is grounded in evidence, not speculation.

Phase 1 focuses on the 6 highest-severity classes that can be detected from source code without needing the compiled contract. This covers both Critical-severity classes and 4 of the 5 High-severity classes. The deferred classes are Medium severity and require analysing the compiled contract binary — a meaningful technical step up that is the right scope for Phase 2, not a proof-of-concept grant.

**Why this team?**

The scanner at https://github.com/1D0n/daml-security-framework demonstrates working capability before this proposal asks for funding. The two detectors already built produce zero false positives on fixed contracts and correctly flag all four vulnerable patterns in the test suite. The full 12-class taxonomy has been researched and documented. The gap analysis, ecosystem benchmarks, and milestone structure are grounded in comparable funded projects.

**Why now?**

The February 2025 Polyglot Canton whitepaper proposes extending Canton to support Solidity smart contracts. This would bring an entirely new set of vulnerabilities — common in Ethereum but currently absent from Canton — into a production environment used by systemically important financial institutions. Security standards not established before that transition reaches production are very hard to retrofit: in regulated environments, changing production specifications triggers compliance review cycles. The window is closing.
