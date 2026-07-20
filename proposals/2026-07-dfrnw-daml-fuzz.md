# Proposal: daml-fuzz — Property-Based Fuzzing for Daml Contracts

- SIG alignment: daml-tooling
- **License:** Apache-2.0
- **Public repository (working PoC):** https://github.com/fronow/daml-fuzz-canton
- **Total requested:** 800,000 CC across three milestones (open to committee guidance)

## Abstract

daml-fuzz is an open-source (Apache-2.0) **property-based fuzzing framework** for
Daml smart contracts on the Canton Network. Developers declare invariants their
contracts must never break (e.g. "total supply is conserved", "only the owner
can act"); daml-fuzz generates thousands of randomized, multi-party transaction
sequences against a local Canton ledger and reports any violation as a minimal,
reproducible recipe. It fills a verified gap: the ecosystem has coverage
analysis (DamlCov, #323) and formal verification (B-Method, #12), but **no tool
that generates adversarial inputs** to find combinatorial, multi-party bugs.

## Specification

### Objective and scope

Deliver a CLI and CI tool that, given a compiled Daml package (`.dar`) and a set
of user-declared properties, automatically fuzzes the contracts and reports
violations with deterministic reproduction recipes. Scope covers state
invariants, authorization properties, stateful multi-party workflows, and
(uniquely to Canton) privacy/disclosure properties.

### Implementation mechanics

Four components around a local Canton ledger:
1. **DAR introspection** — read a compiled `.dar`, enumerate templates, choices,
   and argument types to form the fuzzing action space with zero manual config.
2. **Generator** — randomized, valid-shaped transaction sequences with boundary
   values, random parties, and random ordering; later coverage-guided mutation.
3. **Executor** — connect to a local Canton (sandbox / Localnet / dpm devkit) as
   multiple parties via the gRPC Ledger API; submit and record outcomes.
4. **Property checker + shrinker** — evaluate user invariants after each
   sequence; on violation, shrink to a minimal reproduction and emit a
   deterministic replay report and a self-contained `report.html`.

A working proof of concept already exists (pure Daml Script): it fuzzes a token
contract across hundreds of randomized rounds, checks conservation,
non-negativity, authorization (an adversary party), and per-party privacy, and
is validated by a **mutation-testing bug zoo**: 8 contracts, each with one
planted defect, all 8 discovered by seeded random generation — not scripted
exploits — with zero false positives on the correct contract. See the public
repository for the runnable code, the scorecard script, and a self-contained
sample report.

### Architectural alignment

Targets the **Daml 3.x / Canton Network** line and its **dpm** toolchain. The
proof of concept was verified to compile and pass identically on both Daml
2.10.4 and 3.4.11 (zero code changes), and is pinned to 3.4.11. The funded tool
builds on standard Daml/Canton interfaces — the `.dar` format and the gRPC
Ledger API against **LocalNet** — so it works with any Canton deployment, and
packages via **dpm**, consuming (not duplicating) the approved dpm devkit work
(#18). It complements DamlCov (#323, coverage) and B-Method (#12, formal
methods) by occupying the distinct "adversarial input generation" niche.

### Backward compatibility

Additive only: a developer testing tool. It introduces no protocol changes and
has no on-ledger footprint beyond ephemeral local-ledger contracts created
during a fuzzing run.

## Milestones and deliverables

**M1 — Core loop + property DSL + CLI** (~2 months) — **250,000 CC**
- Generic fuzzing engine over an introspected DAR; starter invariant pack;
  command-line interface.
- *Acceptance metric:* mutation-testing score ≥ 9/10 on the (expanded)
  planted-bug zoo, median time-to-catch < 50 rounds, reproducible via the
  published scorecard.

**M2 — Stateful multi-party + shrinking** (~2 months) — **300,000 CC**
- Stateful multi-party sequence generation; automatic shrinking to minimal
  reproductions; deterministic replay reports.
- *Acceptance metric:* run on ≥ 2 real codebases (including the CIP-0056 token
  standard reference implementation) with responsibly disclosed findings.

**M3 — Coverage-guided + GitHub Action + docs** (~2 months) — **250,000 CC**
- Coverage-guided mutation; a GitHub Action for per-PR fuzzing; full docs.
- *Acceptance metric:* ≥ 3 ecosystem teams running daml-fuzz in CI.

## Acceptance criteria

- Public Apache-2.0 repository with tagged releases.
- Each milestone's metric demonstrably met, with a reproducible scorecard.
- Documentation sufficient for a new team to add daml-fuzz to CI unaided.

## Funding request and milestone breakdown

Total: **800,000 CC**, milestone-based, paid only on committee acceptance of
each milestone:
- M1: 250,000 CC
- M2: 300,000 CC
- M3: 250,000 CC

M2 carries the largest tranche because it holds the core engineering risk (the
stateful generator and the shrinker) plus the real-codebase runs and disclosure
work. M3's payout is deliberately tied to the adoption metric — the outcome the
author controls least. The total reflects roughly six months of focused
engineering at market cost; the author is open to committee guidance on the
final figures.

## Volatility stipulation

If the timeline exceeds 6 months, milestone amounts may be renegotiated per the
fund's CC-volatility clause.

## Motivation

Canton hosts tokenized deposits, treasuries, and collateral. The dangerous bugs
are combinatorial — multi-party, multi-step interactions no example test
enumerates. The ecosystem lacks adversarial-input tooling. daml-fuzz closes that
gap and raises the security floor for the whole network.


