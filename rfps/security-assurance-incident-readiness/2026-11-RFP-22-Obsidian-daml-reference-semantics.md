# Daml Reference Semantics: Machine-Checked Proofs for Daml Packages and the Canton Ledger Model

## Development Fund Proposal

**Organization:** Obsidian Systems  
**Author / Primary Contact:** Alexandre Oliveira, Obsidian Systems, alexandre.oliveira@obsidian.systems  
**Status:** Submitted  
**Created:** 2026-11-03  
**Proposal Type:** RFP-aligned  
**RFP / Roadmap Area:** RFP #22, Daml Security Standards and Secure Development  
**Champion:** Ali Abrar, Obsidian Systems (@ali-abrar)  
**Total Funding Request:** 4,000,000 CC  
**Project Duration:** 12 months  
**Label:** daml-tooling

---

## Abstract

Obsidian Systems will build an executable, machine-checked semantics of Daml-LF 2.x and the Canton ledger model in Agda. Obsidian will publish it in a public repository. Teams can use it to prove theorems about a Daml package for every input and every transaction sequence. The grant delivers four theorems on authorization, Canton Coin issuance, the CIP-0098 reward cap and the CIP-0105 lock schedule. A separate project can extend the semantics to off-ledger components and their ledger interactions.

---

## Specification

### 1. Objective

Obsidian Systems will build one public machine-checked reference for Daml-LF 2.x and the Canton ledger model. Daml verification tools can test their models of Daml against it. Auditors and other teams can prove theorems about their own Daml packages with it.

### 2. Implementation Mechanics

**Semantics.** We will create Agda modules for Daml-LF 2.x values, expressions and updates, plus the authorization, consistency and privacy rules of the Canton ledger model. The modules type-check under `--safe`. Evaluation takes a step bound because Daml-LF allows recursion. The report shows when the bound runs out.

**Code generation.** A code generation module in Haskell extracts Daml-LF information and outputs relevant Agda modules.

**Runner.** Agda compiles the semantics to Haskell. One bridge module, outside `--safe`, loads Daml packages (DARs) with Digital Asset's (DA) Haskell Daml-LF decoder (`daml-lf-proto-decode`).

**Comparator.** It runs each Daml Script test in the engine. It records the submitted commands and the full transaction, with fetch and rollback nodes. It replays the commands in the semantics and compares node by node.

**Theorem library.** Machine-checked theorems about the ledger model and about real Splice packages, plus the M2 equivalence theorems. Each statement names its source: a Canton Improvement Proposal (CIP), a docs page or a Daml file.

**Distribution.** Public repository under Apache 2.0, trace-format spec, tutorial.

**Theorems Obsidian intends to prove**

| # | Property | Statement (informal) | Source | Why it needs induction |
| :---- | :---- | :---- | :---- | :---- |
| T1 | Authorization soundness (semantics) | Every transaction the semantics accepts is well-authorized: "the requesters of a change encompass the required authorizers". | Ledger model | Quantifies over all Daml programs; induction on evaluation. |
| T2 | Issuance bound | The CC that coupons of one round can mint never exceeds the issuance configured for that round, if the round summary from the DSO is accurate. | Tokenomics of the GS | All rounds and all activity records; an unbounded sequence. |
| T3 | App reward cap | Each featured app reward stays within the configured CIP-0098 cap, at the CC price recorded for its round. | CIP-0098 | All reachable states, with Daml Decimal rounding. |
| T4 | Lock release bound | Locked CC is released no faster than its vesting schedule allows, and only through the unlock paths that CIP-0127 defines. | CIP-0105, implemented in CIP-0127 | All sequences of lock, unlock and withdraw; induction on time. |

T1 proves that the semantics enforces the ledger-model rule. T2 to T4 rest on that checked base. They are theorems about Splice code that the runner loads from published DARs. Each holds for every input and transaction sequence that the semantics accepts.

T4 is proved against the Daml lock code for CIP-0127. Obsidian and DA are writing that code. That code finds and merges locks through non-unique contract keys, so M3 adds keys to the semantics.

### 3. Architectural Alignment

RFP #22 asks for "testing methodologies, automated analysis," "reference implementations, and CI/CD integration." The semantics is a public reference for the authorization, consistency and privacy rules of the Canton ledger model. The comparator tests it against the Daml engine in continuous integration (CI).

### 4. Backward Compatibility

No backward compatibility impact. Smart Contract Upgrade does not apply because the grant produces no Daml contracts. A Phase 2 proposal will cover Smart Contract Upgrade in the semantics.

### Prior work

Obsidian used Agda on a production Daml system for a client. The proofs showed that an optimized code path computes the same results as the code it replaced. Machine-checked specifications covered the system's decision logic. The work is private. No formal model of Daml-LF existed, so the proofs stopped at the Daml and Canton boundary and assumed how the ledger behaves. This grant builds that model.

---

## Milestones and Deliverables

| Milestone | Deliverable | Month | CC |
| :---- | :---- | :---- | :---- |
| M1 | Core semantics + engine comparator. Loads 20 real packages and agrees with the engine on their Daml Script tests. Rejects 5 seeded authorization defects. Public repo, CI green. | 3 | 885,000 |
| M2 | Agda code generator that outputs the AST. For each of the 20 M1 packages, a proof that the generated Agda modules equal the Daml-LF AST the runner decodes from the same DAR. | 5 | 310,000 |
| M3 | Interfaces, non-unique contract keys (lookupNByKey) + dpm component. CIP-0056 packages and the CIP-0127 lock package load; trace format, 1 adapter for another tool's model, tutorial. T1 type-checks under `--safe`. | 7 | 664,500 |
| M4 | Theorems on Splice code. T2 to T4 type-check under `--safe` against pinned Splice DARs. Each file names its source and assumptions. Plain-language report for reviewers who do not read Agda. Each theorem is 221,500 CC. If the CIP-0127 lock code misses a Splice release by month 9, T4's 221,500 CC pays at month 12. | 9 | 664,500 |
| M5 | Adoption. 246,000 CC per adopting outside team, up to 5, plus 246,000 CC at the fifth. | to 12 | up to 1,476,000 |
| **Total** |  |  | **4,000,000** |

---

## Acceptance Criteria

Adopter: an outside team counts after one month using the tool on its own code or model in automated tests in a public repository, or after publishing a proof or audit report that uses it, confirmed to Tech & Ops. Obsidian's own use does not count. The adoption window runs to month 12. Unearned tranches lapse.

---

## Funding

**Total Funding Request:** 4,000,000 CC

The grant gives every Daml verification tool one shared reference to test against. It gives the network machine-checked bounds on Canton Coin issuance, app rewards and locked CC. The Canton Foundation approved Peaceful Studio's C#/.NET SDK (PR #46) at 2,705,000 to 2,855,000 CC and IntellectEU's Daml Code Assistant (PR #10) at 6,997,227 CC.

Post-grant: a separate annual retainer of 740,000 CC. Obsidian tracks each Daml-LF minor version in `LanguageVersion.scala` and each Splice release that changes a theorem target. Precedent: Obsidian's LMS Maintenance Grant (PR #459). The committee renews the retainer each year. If it declines, Obsidian transfers the repository to the Foundation's GitHub organization.

### Volatility Stipulation

The project duration is greater than 6 months. The grant is denominated in fixed Canton Coin. Obsidian may request a re-evaluation of the remaining milestones at month 9. The trigger is a CC price more than 25 percent above or below its price at approval. The Tech & Ops Committee runs the re-evaluation.

---

## Co-Marketing

At release, Obsidian will announce with the Foundation and publish a technical post.

---

## State of the art

Sources: proposal files in github.com/canton-foundation/canton-dev-fund, as of 2026-10-21.

| Project | Method | Guarantee | Funding |
| :---- | :---- | :---- | :---- |
| This proposal (Obsidian, draft) | Machine-checked Daml-LF semantics in Agda, tested node by node against the engine. Proofs T1 to T4 on Splice code. | Every input the semantics accepts, under stated assumptions. | 4,000,000 CC, 12 months. 36.9% on adoption. |
| Certora Package Analyzer (#130, merged) | Static map of cross-package calls in a DAR. | None on properties. | 2,010,000 CC, 5 months. |
| Dedaub DamlSec (#194, closed) | Automatic symbolic execution of the compiled DAR, with SMT. | Bounded: "within the explored depth". | 250,000 CC, 14 weeks. |
| TKNFRA B-Method (#12, open) | Hand-written B models of CIP-0056 and CIP-0047. | Proof "where feasible" and bounded checks, on the model only. | 410,000 CC. |
| OpenZeppelin daml-verify (#262, merged) | Z3 over hand-written Python models of Daml logic. | On the model: "only as faithful as the model". | - |
| Informal Systems Quint (#56, closed) | Quint model; traces replayed on Canton Sandbox. | Testing only. | USD 150,000. |
| Sigli.ai DAWE (#400, open) | Adversarial Daml Script tests. | "Not a proof of contract correctness". | 487,000 CC, 6 months. |
| ChainSafe corpus (#197, open) | AI retrieval corpus of Daml patterns. | Similarity score only. | 882,352 CC, 6 months. |
| PixelPlex cantonsim (#879, open) | Dry-run through the participant. | "A test standard, not a claim of correctness". | 2,400,000 CC, 6 months. |
| Quantstamp DamlFuzz (#52, open) | Stateful fuzzing on the engine. | Probabilistic. | 2,450,000 CC. |
| Quantstamp DamlCov (#323, open) | Test coverage by Daml-LF instrumentation. | None; a metric. | 1,300,000 CC. |
| Digital Asset research | Isabelle/HOL proofs of Canton Merkle trees; ledger model started. | On the model. No Daml-LF semantics. | Not a grant. |

Tests, fuzzers, coverage and simulation (DAWE, DamlFuzz, DamlCov, cantonsim) run on the Daml engine and claim no correctness for every input. DamlSec is automatic but bounded. TKNFRA, OpenZeppelin and Quint work on hand-written models, which can differ from the code. Digital Asset's proofs do not cover Daml-LF.

No other competitor offers a machine-checked Daml-LF semantics tested against the engine. This proposal builds one and proves T1 to T4 on Splice code. DamlSec (250,000 CC) finds bugs automatically to a bound; TKNFRA (410,000 CC) checks models of two standards, not the code. The budget covers the Daml-LF core with interfaces and contract keys, plus about 130 to 170 Splice and CIP-0127 definitions. 36.9% of the 4,000,000 CC pays only on outside adoption.

---

## Motivation

AI makes vulnerabilities fast to find and exploit. A machine-checked proof covers every input the semantics accepts. Each Daml analysis tool works from its own interpretation of Daml. No public reference exists to test those interpretations. A tool with a wrong model of Daml can report an unsafe package as safe. The Canton Foundation funded Certora's Daml Package Analyzer (PR #130). It maps which package can call which. Dedaub's DamlSec (PR #194, closed) runs symbolic checks on Daml packages. OpenZeppelin published Z3 models of Daml logic.

The comparator can help turn a wrong model into a failing test in continuous integration. The grant targets adoption by up to five outside teams by month 12.

OpenZeppelin checks each model "line-by-line against the Daml source" (OpenZeppelin). The check is manual today. A formal semantics could be a first step toward automating it.

DA started to formalize the ledger model in Isabelle/HOL (research page). No public, executable, machine-checked Daml-LF 2 semantics exists (searched 2026-10-06).

---

## Rationale

A Satisfiability Modulo Theories solver such as Z3 decides one formula at a time within the encoded bounds. A property over all transaction sequences needs an inductive invariant that a person writes. The solver can return "unknown" for such properties. A proof assistant checks the induction argument itself. The grant's proofs are about the same semantics that the comparator tests against the engine. The comparator in a CI pipeline can fail a test when the proof and the package diverge.

### Scope and Other Grants

A team writes each package proof by hand with Obsidian's library. Agda checks the proof against the semantics.

| Work | Owner | Relation |
| :---- | :---- | :---- |
| Cross-package authority in DARs | Certora (PR #130, funded) | Certora maps which package can call which. With Obsidian's semantics, an auditor can prove what such a call can do, for example that it never moves a holding without the owner's authority. |
| Symbolic bug detection on DARs | Dedaub DamlSec (PR #194, closed) | DamlSec can run the comparator to test its own semantics of Daml against Obsidian's. |
| Lint, property tests, Z3 models | OpenZeppelin | Obsidian delivers 1 adapter in M3, chosen with the design partners. Candidate: replay the Z3 models' counterexamples and witnesses in the semantics. |
| B-Method models of CIP-0056 and CIP-0047 | TKNFRA (PR #12, open) | The comparator can replay traces from those models in the semantics. Proving their invariants on the Daml code takes extra theorems, which TKNFRA can write with the library. |
| Transaction simulation | PixelPlex cantonsim (PR #879, open) | cantonsim can call the semantics to check authorization of each simulated transaction. |

The Canton synchronization protocol is out of scope. Phase 2 (separate proposal): exceptions, Smart Contract Upgrade, multi-synchronizer reassignment, and a throughput ceiling from the traffic rule.
