## Development Fund Proposal: daml-u256 — Audited U256 and Fixed-Point Math Library for DeFi on Canton

- **Author:** Zhe Li, Srikanth
- **Org:** BitDynamics
- **Status:** Submitted
- **Created:** 2026-03-29
- **Label:** defi-liquidity
- **[Champion](https://github.com/canton-foundation/canton-dev-fund/blob/main/sig-directory.md):** need Champion

---

## Abstract

Daml has no native 256-bit integer type, while EVM-native DeFi depends pervasively on `uint256` for AMM pool math, oracle payloads, bridge state, and fixed-point formats such as Q64.96 and Q128.128. Daml's `Numeric` offers 38 significant digits, but many AMM, CLMM, and lending-curve designs require at least one multiplication whose intermediate product exceeds that — a RAY × RAY intermediate reaches 10^54 and a `mulDiv` intermediate reaches 2^512. To the best of our knowledge, no openly licensed, general-purpose 256-bit math library is available to Canton developers.

We propose to build `daml-u256`: a pure-Daml, Apache-2.0 library providing exact U256 arithmetic with checked, aborting, and wrapping tiers; overflow-safe `mulDiv` on genuine 512-bit intermediates; integer square root; Q64.96 and Q128.128 fixed-point modules; and a separate reference CLMM math package — with no protocol, runtime, or node changes.

---

## Specification

### 1. Objective

Make exact 256-bit and fixed-point arithmetic available to every Canton team as a single audited, openly licensed, and demonstrably adopted shared library — so that math-intensive DeFi protocols (concentrated liquidity, exact price-step and fee-growth accounting, overflow-safe multiply-then-divide workflows, EVM/oracle payload decoding) can be built on-ledger without each team reimplementing and separately paying to audit the same high-risk arithmetic.

This proposal covers reusable large-integer and fixed-point math, cross-validation against established DeFi math behavior, a reference CLMM math package, benchmarks, documentation, an external audit and maintenance phase. It does **not** include a full AMM or CLMM product, frontends, native Daml/Daml-LF changes, or Canton node changes. The objective is that the high-value class of protocols that does need it gets shared, audited infrastructure instead of per-team private math.

### 2. Implementation Mechanics

We will deliver two library DARs plus test packages, all pure Daml with no protocol or runtime dependencies:

- **`daml-u256`** (the core library; depends only on `daml-prim`/`daml-stdlib`, uploadable to any participant as-is): modules `U256` (type, arithmetic tiers, bit operations, conversions), `U256.Internal` (limb algorithms; explicitly not stable API), `U256.FullMath`, `U256.Sqrt`, `U256.Q64x96`, `U256.Q128x128`.
- **`daml-u256-clmm`** (reference math, consumed via data-dependency on the core DAR): `CLMM.TickMath`, `CLMM.TickMathConstants`, `CLMM.SqrtPriceMath`, `CLMM.SwapMath`, `CLMM.Examples`. Keeping the CLMM layer in a separate package keeps the core's audit surface minimal.
- **`daml-u256-tests` / `daml-u256-clmm-tests`**: Daml Script suites, outside the library DARs.

#### Representation and carry safety

Daml's `Int` is a signed 64-bit integer (positive range up to 2^63 − 1 ≈ 9.22 × 10^18) that traps on overflow. Every intermediate of every algorithm must therefore provably stay in range. A 4-limb/64-bit design cannot even store its limbs; an 8-limb/32-bit design overflows on a single partial product ((2^32 − 1)^2 ≈ 1.84 × 10^19).

`U256` will use **nine `Int` limbs of 30 effective bits**, little-endian, with the top limb bounded below 2^16 (a 270-bit container for 256-bit values). A canonical-form invariant (every limb in `[0, 2^30)`, `limb8 < 2^16`) will be maintained by all operations, with `valid`/`requireValid` exported for trust-boundary checks.

Even at 30 bits per limb, naive schoolbook column accumulation is unsafe: the middle column of a 9×9-limb product sums 9 partial products, and 9 × (2^30 − 1)^2 ≈ 1.04 × 10^19 exceeds the `Int` maximum (at most 8 fit). The library will instead use **row-wise operand scanning**, whose fused multiply-accumulate step `t = u + x·m + c` (accumulator digit, partial product, carry) is bounded by (B−1) + (B−1)^2 + (B−1) = 2^60 − 1 for limb base B = 2^30 — an 8× margin below the `Int` maximum, the standard multi-precision bound.

#### Arithmetic API: checked foundation, aborting default, explicit wrapping

Daml 3.x deprecates catchable exceptions, so an arithmetic trap must be treated as an unrecoverable transaction failure. The library will expose three tiers over one arithmetic core:

- **Tier 1 — checked (the compositional foundation):** `addChecked`, `subChecked`, `mulChecked`, `divChecked`, `modChecked`, `powChecked`, `divModChecked` return `Optional`, so protocol code can branch on overflow (clamp a swap step, fall back to a smaller trade) instead of dying.
- **Tier 2 — aborting (the safe default):** `add`, `sub`, `mul`, `div`, `mod`, `pow` are thin wrappers over Tier 1 that fail the transaction via `failWithStatusPure` with machine-readable error identifiers (`daml-u256/overflow`, `daml-u256/underflow`, `daml-u256/division-by-zero`, and analogous codes; error category `InvalidIndependentOfSystemState`). Silent wrapping never happens by default, which departs from EVM behavior.
- **Tier 3 — explicit wrapping (mod 2^256):** `addWrapping`, `subWrapping`, `mulWrapping`, named so that EVM-mirroring semantics (bridge-state reproduction, storage-slot mirroring, hash-derived values) are always a visible choice. Wrapping division is omitted. Prime-field (mod-p) arithmetic, for example elliptic-curve operations, is out of scope; `FullMath.mulMod`/`addMod` are the building blocks for a future mod-p layer.

Typeclass instances will ship with the type: derived `Eq`/`Show`, **hand-written `Ord`** (a derived ordering would compare the least-significant limb first, ordering 2^30 below 1), `Bounded`, and `Additive`/`Multiplicative` aliases of the aborting tier. Because `DA.Map` ignores user-defined `Ord`, the documentation will prescribe the fixed-width `toHex` key idiom.

#### Division: dual dividers with differential self-verification

Multi-limb division is where multi-precision libraries historically hide bugs: the correction branch of Knuth's Algorithm D fires with probability roughly 2/base and is essentially never reached by random testing. The design addresses this structurally:

- the production divider will route single-limb divisors to short division and larger ones to **Knuth Algorithm D** in a borrow-first, non-negative multiply-subtract formulation — required because Daml division truncates toward zero, so a naive C/Go port miscomputes carries;
- a binary shift-subtract divider will be kept **permanently** as a differential oracle; both run against each other over the full division corpus in CI, so any divergence fails the build;
- the add-back branch will be forced by **constructed** vectors (proven to fire it by an instrumented model), with an INV1–INV5 auditor checklist and the q̂ ≤ B+1 early-exit lemma in `SPEC.md`;
- `mulDiv` fast paths will reduce power-of-two denominators (e.g. Q96) to shifts and single-limb denominators (e.g. the 10^6 fee base) to short division, each rounding-tested.

#### FullMath, square root, and fixed point

`U256.FullMath` will provide `mulDiv`/`mulDivRoundingUp` (plus `Checked` variants) on a genuine 18-limb 512-bit schoolbook product followed by multi-limb division. The well-known EVM `mulDiv` trick (mulmod with modular-inverse division) will not be used: it requires native wrapping arithmetic mod 2^256, which Daml lacks. `mulMod` and `addMod` will provide EVM `MULMOD`/`ADDMOD` parity, documenting the EVM `m = 0` behavioral divergence (loud failure instead of silent 0). Rounding direction will be documented per function and treated as API contract; rounding-up at the maximum value will fail per the published Uniswap v3 guard.

`U256.Sqrt` will ship a division-free bit-pair restoring integer square root as the primary implementation, with an independent Newton-iteration implementation as a CI cross-check.

`U256.Q64x96` and `U256.Q128x128` will provide fixed-point multiply/divide with rounding direction expressed as paired `…Down`/`…Up` function names. `Q128x128` will additionally provide explicitly named wrapping add/sub: fee-growth accumulators in CLMM designs overflow by design, so a checked-only port would abort in production; the wrap-survival property will be tested against offline fee-growth overflow vectors.

#### Bitwise operations (arithmetic emulation) and hex decoding

Daml-LF has no native bitwise operations on `Int`, so these will be emulated arithmetically: shifts (`shiftL`/`shiftR`, EVM SHL/SHR) are per-limb multiply/divide by powers of two, and `bitwiseAnd`/`bitwiseOr`/`bitwiseXor` reduce to a single bit-serial AND kernel (minimizing audit surface) with OR/XOR derived algebraically (`xor a b = a + b − 2·(a AND b)`). These are the slowest operations; the documentation will flag them and steer hot paths to shift-and-mask idioms, with `testBit` for the common field-extraction case.

`fromHex : Text -> Optional U256` will be a fail-safe pure-Daml decoder (1–64 nibbles, optional `0x` prefix, case-insensitive, `None` on any malformed input), paired with a canonical 64-nibble lowercase `toHex`. This replaces the error-prone application-layer workarounds that oracle integrations currently hand-roll. Integer conversions will be `fromInt`/`toInt` (both `Optional`); integration with the standard library's `DA.Crypto.Text` `HasToHex`/`HasFromHex` classes is future work gated on an LF 2.3 compilation target.

#### Reference CLMM package

`daml-u256-clmm` will demonstrate protocol applicability: `CLMM.TickMath` (`getSqrtRatioAtTick` and checked variant over the full ±887272 tick range, and a binary-search `getTickAtSqrtRatioChecked` inverse), `CLMM.SqrtPriceMath` (paired rounding-direction amount deltas and next-price functions with the published v3 fallback selection), `CLMM.SwapMath.computeSwapStepChecked` (fee in pips over a 10^6 base), and `CLMM.Examples` (worked composition examples, including a between-ticks quoting workflow). Tick constants will be derived from first principles as exact rationals and pinned by hash in the generator — no Uniswap code will be ported; bit-parity will be anchored on published constants, keeping the repository license-clean. Signed quantities will be handled as bounded Daml `Int` ticks and magnitude-plus-direction deltas; full two's-complement arithmetic is left to a planned companion `daml-i256` library, which would layer signed semantics over the same limb core.

#### Verification approach

Verification is a funded deliverable in its own right. The plan is:

- **Property and vector testing:** Daml Script suites will run the arithmetic against vectors generated offline by a test-only arbitrary-precision reference-vector generator (likely Python; not part of the Daml library or runtime); CI regenerates every vector file and fails on any drift, so the tests cannot silently diverge from the reference.
- **Differential testing:** the production and reference dividers, and the two square-root implementations, will be cross-checked over their full corpora, so a bug in one is caught by the other; constructed vectors will exercise the Knuth add-back branch that random testing misses.
- **Documentation for audit:** `SPEC.md` (per-step carry-safety table, divider invariants, error-tier contract, square-root and fixed-point semantics), `AUDIT.md` (scope, artifacts, claims-to-attack), `MIGRATION.md`, and a developer walkthrough — so every overflow-relevant intermediate has a stated bound an auditor can check.
- **Adversarial internal review** before the external audit, targeting the historically bug-prone paths (division correction branch, carry propagation, rounding direction).
- **Serialized-shape freeze:** golden files will pin the compiled type's Daml-LF shape in CI; any representation change requires a new package name, so contracts holding `U256` values cannot be silently broken by an upgrade.

#### Performance expectations

Performance is not expected to be the main bottleneck: early prototype estimates on SDK 3.4.11 (single machine, to be confirmed) put a full CLMM swap step at tens of milliseconds of pure interpretation, a small fraction of a confirmation budget measured in tens of seconds. Measured benchmarks against a documented environment spec, including a swap-step comparison against an operation-count-comparable `Decimal` workflow, will be published as a Milestone 3 deliverable. The shipped core will be list-based for auditability; an unrolled-arithmetic variant is a possible post-1.0 optimization that cannot change semantics.

#### Delivery ownership, maintenance, and sustainability

- **License and home:** Apache-2.0, to be developed independently from first principles and published algorithms, with no code copied or derived from BUSL-licensed sources. The repository will be published publicly under Apache-2.0 with a tagged release and DAR assets at the corresponding delivery milestone; committee members can be granted read access during review on request, and the final public URL will be recorded in this proposal's PR thread.
- **Maintenance:** the funded scope includes a 12-month post-release maintenance window (security fixes, SDK-compatibility updates, issue triage), running concurrently with the adoption phase. As a continuity measure, the implementing entity will offer the Canton Foundation escrow administrative access to the repository.
- **Stability:** after the audited 1.0, arithmetic semantics freeze (any numeric behavior change is a major version), and the serialized representation freezes harder still via the CI shape pin and new-package-name rule.

**Delivery team:** BitDynamics will design and implement the library described above, including the nine-limb carry-safe representation, the dual-divider design with constructed correction-branch vectors, the test-only reference-vector generation infrastructure, and the `SPEC.md`/`AUDIT.md` safety documentation. Signed 256-bit arithmetic (`daml-i256`) over the same limb core is a planned companion effort. The engineering artifacts behind this proposal's claims will be directly inspectable in the public repository at the relevant milestone.

### 3. Architectural Alignment

- **Shared infrastructure, additive by construction:** pure Daml, no Daml-LF upgrade, no validator or node-operator reconfiguration, no dependency on native-language roadmap timing; uploadable to any participant.
- **A lower-level dependency for funded ecosystem work:** OpenZeppelin's approved Canton ecosystem-stack proposal notes the lack of reusable primitives for DeFi building blocks and includes DEX and lending reference implementations; `daml-u256` is positioned as the lower-level primitive such work can consume or coordinate with rather than duplicate. EVM-interop middleware and oracle connectors (Chainlink Data Streams and RedStone payloads are `uint256`-shaped) are further natural consumers. Structured outreach to these teams and to the digital-asset/daml#22827 participants is a funded Milestone 5 activity with its results reported to the committee.
- **Ecosystem priorities:** directly serves App Building and Developer Experience (removing a documented developer-friction point) and Security and Resilience (replacing per-team private math with one audited implementation).

### 4. Backward Compatibility

No backward compatibility impact. This is an additive library; teams adopt it incrementally or ignore it entirely. Post-1.0, the semantics freeze and serialized-shape pin guarantee that adopting contracts cannot be silently broken by library upgrades; any numeric behavior change is a major version under a new package name.

---

## Milestones and Deliverables

The work is split into four delivery milestones (M1–M4: build and audit) and a fifth adoption milestone (M5), so that the funding weight sits on demonstrated ecosystem value rather than delivery alone.

### Milestone 1: Core U256 Arithmetic

- **Estimated Delivery:** within 6 weeks of grant approval
- **Focus:** the `U256` type and its arithmetic core: nine-limb representation with the canonical-form invariant, the three arithmetic tiers (checked/aborting/wrapping) with machine-readable error identifiers, multi-limb multiplication by row-wise operand scanning, division including the Knuth Algorithm D divider and its shift-subtract differential oracle, comparisons with hand-written `Ord`, and `fromHex`/`toHex`.
- **Deliverables / Value Metrics:**
  - Canton teams gain a working, openly consumable 256-bit integer type where none exists today (current alternatives are BUSL-1.1 vendor fragments; see Motivation) — measured by the alpha package being consumable via `data-dependencies` on supported SDK lines.
  - Property and vector-based test suites for the arithmetic core, with dual-divider differential checks in CI.

### Milestone 2: FullMath, Square Root, and Fixed Point

- **Estimated Delivery:** within 11 weeks of grant approval
- **Focus:** the math that makes the library useful for DeFi protocol logic: `U256.FullMath` `mulDiv`/`mulDivRoundingUp` on genuine 512-bit intermediates with `mulMod`/`addMod`; the dual square-root implementations; and the `Q64x96`/`Q128x128` fixed-point modules including the wrapping fee-growth path.
- **Deliverables / Value Metrics:**
  - Overflow-safe multiply-then-divide, integer square root, and Q64.96/Q128.128 fixed point available to downstream teams, with rounding direction documented per function as API contract.
  - Cross-validation vectors for `mulDiv`, square root, and fixed-point behavior, generated by the arbitrary-precision reference generator and drift-checked in CI.
  - Documented rounding and overflow behavior for every exposed function.

### Milestone 3: Reference CLMM Package, Benchmarks, and Documentation

- **Estimated Delivery:** within 15 weeks of grant approval
- **Focus:** demonstrate real protocol applicability and complete the developer-facing materials: the `daml-u256-clmm` reference package (`TickMath` over the ±887272 range, `SqrtPriceMath`, `SwapMath`, worked `Examples`), published benchmarks, and the documentation set.
- **Deliverables / Value Metrics:**
  - A reference CLMM math package that shows how `U256`, `FullMath`, and fixed-point modules compose into real protocol math, keeping the audited core minimal.
  - Published benchmarks against a documented environment spec, including the swap-step comparison against a `Decimal` baseline.

### Milestone 4: Independent Audit and Audited 1.0 Release

- **Estimated Delivery:** within 20 weeks of grant approval (vendor lead-time dependent; the engagement is booked within 2 weeks of approval)
- **Focus:** independent external audit of the core arithmetic, remediation of findings, and the audited 1.0 release under Apache-2.0.
- **Deliverables / Value Metrics:**
  - Published audit report with all findings resolved or explicitly documented; audit scope includes the carry-safety invariant, the division correction branches, and the fixed-point semantics — not just packaging.
  - To the best of our knowledge, the ecosystem would gain its first independently audited arithmetic dependency for DeFi math, so downstream integrations can consume one reviewed implementation instead of separately auditing their own — measured by the audited 1.0 being the version consumed in Milestone 5 integrations.
  - At least **1 external team** (independent of BitDynamics as defined in Milestone 5) actively building against the audited release or its release candidate, confirmed in writing.

### Milestone 5: Adoption and Long-Term Use

- **Estimated Delivery:** 12-month window opening at the audited 1.0 release, with checkpoints at +3, +6, and +12 months. The window runs past the 9-month norm because adoption of a foundational library depends on downstream teams' own development and release cycles.
- **Focus:** convert the released library into demonstrated, durable network value: integration support, structured outreach, and the 12-month maintenance window.
- **Deliverables / Value Metrics (payment mechanics in Funding):**
  - **Qualifying integration:** an application built by a team independent of BitDynamics (as defined below) and deployed to **Canton TestNet or Canton MainNet**, whose deployed DAR depends on the `daml-u256` package **and exercises the library in the application's core workflow** — demonstrated by ledger transactions exercising choices that call the library's U256 arithmetic, `FullMath`, or fixed-point operations, not by a manifest dependency alone.
  - **Payment follows sustained use, not a one-time deployment:** an integration earns its per-integration tranche the first checkpoint at which it is verified **active** — as early as three months, so the team is paid as adoption takes hold rather than after a full year. **"Active" means in ongoing operation, not merely vetted:** the currently deployed version depends on `daml-u256` with the package vetted on the relevant participants, and the integration shows recent use — ledger transactions exercising library-calling choices within the prior 8 weeks, or, for integrations with naturally episodic transaction volume, a maintained production release published within the prior 8 weeks (initial qualification always requires the on-ledger usage evidence above).
  - **Six-month checkpoint:** at least 2 qualifying integrations are active (TestNet or MainNet).
  - **Twelve-month long-term-use checkpoint:** at least 3 cumulative qualifying integrations including at least 1 MainNet application remain active under the same definition, and maintenance duties have been performed throughout (compatibility releases tracking supported SDK versions, issue-response, frozen arithmetic semantics honored).
  - **Verification is objective and adoption-shaped:** a DAR's manifest embeds the package-ids of its dependencies, so "this application uses `daml-u256`" is checkable by any committee member with participant access via the package service, together with vetting topology showing the package active and ledger evidence of the exercised choices — the Canton analogue of on-chain adoption evidence. Two verification paths are accepted: **public** (on-ledger dependency and usage evidence, or public repository dependency plus written attestation) and **private** (attestation to the Canton Foundation under confidentiality; the Foundation confirms to the committee). **"Independent of BitDynamics" means:** no common ownership or control, no shared personnel or contractors, and no payment or subcontracting relationship with BitDynamics; each attestation must disclose the attestor's relationship, if any, to the implementing entity.

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified
- Demonstrated functionality or operational readiness
- Documentation and knowledge transfer
- Alignment with stated value metrics

Project-specific acceptance conditions:

- **Milestone 1:** the `U256` type and its arithmetic core (three tiers, division including the Knuth divider, comparisons, hex) are consumable via `data-dependencies` on supported SDK lines, with the arithmetic-core test corpus passing in CI and the per-step carry-safety argument published.
- **Milestone 2:** `FullMath` `mulDiv` on 512-bit intermediates, integer square root, and Q64.96/Q128.128 fixed point are implemented with rounding direction documented per function, and cross-validation vectors pass against the arbitrary-precision reference generator in CI.
- **Milestone 3:** the reference CLMM package is published and demonstrates composition of the lower layers; benchmarks including the `Decimal` swap-step comparison are published on a documented environment.
- **Milestone 4:** an independent audit report on the arithmetic core is published with findings resolved or documented, the audited 1.0 is released publicly under Apache-2.0, and at least 1 external team is confirmed building against it.
- **Milestone 5:** qualifying integrations verified in sustained, active use at the three-, six-, and twelve-month checkpoints as specified above (deployment networks, activity definition, and attestor independence as defined in Milestone 5), using either of the two verification paths defined in Milestone 5 (public evidence, or private attestation confirmed by the Canton Foundation); partial sustained adoption yields partial payment through the per-integration tranches, and unmet cohort checkpoints follow the explicit cure rule in Funding.
- The project remains scoped to reusable math infrastructure, not a protocol product.
- The release documents exact overflow, rounding, and fixed-point behavior, with rounding direction per function, and includes the written carry-safety argument covering every limb-arithmetic intermediate.
- Integration verification evidence is objective (package-id dependency closure on-ledger, or independent attestation as specified) and checkable by the committee — directly on the public path, or via the Canton Foundation's confirmation on the private path.

---

## Funding

**Total Funding Request:** 2,210,000 CC

### Funding Rationale

Payment tracks value to the network. The build and audit are priced across four delivery milestones and paid on delivery; the majority of the grant sits in a fifth milestone that pays only for adoption that persists.

- **Delivery (build + audit): 1,085,000 CC (49.1%)** — the arithmetic core (M1), the DeFi math layer (M2), the reference package and documentation (M3), and the external audit and audited release (M4).
- **Adoption & long-term use (M5): 1,125,000 CC (50.9%)** — every tranche requires an integration verified in sustained, active use, earnable from the three-month checkpoint onward, with payout scaling with use that lasts.

### Payment Breakdown by Milestone

- Milestone 1 _(Core U256 Arithmetic)_: 200,000 CC upon committee acceptance
- Milestone 2 _(FullMath, Square Root, and Fixed Point)_: 300,000 CC upon committee acceptance
- Milestone 3 _(Reference CLMM Package, Benchmarks, and Documentation)_: 300,000 CC upon committee acceptance
- Milestone 4 _(Independent Audit and Audited 1.0 Release)_: 285,000 CC upon publication of the audit report and committee acceptance of the audited release
- Milestone 5 _(Adoption and Long-Term Use)_: 1,125,000 CC. Every tranche is gated on sustained, active use as defined in Milestone 5, with earning starting at the three-month checkpoint. Paid incrementally so payout scales with sustained adoption:
  - 208,333 CC per integration verified **active** at a checkpoint (+3, +6, or +12 months), up to 3 integrations (208,334 CC for the third; 625,000 CC total) — earned the first checkpoint at which the integration is active.
  - 200,000 CC at the six-month checkpoint (≥ 2 integrations active, TestNet or MainNet)
  - 300,000 CC at the twelve-month long-term-use checkpoint (≥ 3 cumulative integrations active including ≥ 1 MainNet, maintenance duties performed)
  - **Cure rule (no lapsing within the window):** an integration reaching active use by any of the +3/+6/+12 checkpoints earns its per-integration tranche there; the six-month cohort checkpoint (200,000 CC), if unmet at six months, remains payable at twelve months if ≥ 2 integrations are active then. Per-integration payments are independent of the cohort checkpoints, so partial sustained adoption yields partial payment.

### Volatility Stipulation

The project duration — including the 12-month adoption and maintenance window — is greater than 6 months. Per the current template: **the grant is denominated in fixed Canton Coin and will require a re-evaluation at the 6-month mark.** (The under-6-months renegotiation clause does not apply to this proposal.)

---

## Co-Marketing

Upon release, the implementing entity will collaborate with the Canton Foundation on:

- announcement coordination for the public release and the audited 1.0,
- one technical write-up explaining why U256-style math matters for advanced DeFi on Canton,
- joint launch timing for the developer walkthrough and the published audit report (both are funded deliverables and are not double-counted here),
- Foundation-facilitated introductions to prospective integrators (DeFi teams, oracle vendors, EVM-interop projects) in support of the Milestone 5 adoption phase.

Specific commitments: publish worked examples for core arithmetic and fixed-point usage; publish reference notes for DeFi builders evaluating fit; publish the audit report and release notes publicly.

---

## Motivation

### The arithmetic gap

Serious DeFi protocols represent fractions with integer scaling factors rather than floating point: **WAD** (10^18, the convention used by MakerDAO, Aave, and Compound-style protocols), **RAY** (10^27), and binary fixed-point formats such as Uniswap v3's Q64.96. Multiplying two scaled values produces an intermediate that must fit in the language's integer type before dividing back down. In Daml, this fails at every level:

| Operation | Intermediate Result | Daml `Numeric` max | Verdict |
|---|---|---|---|
| Single WAD-scaled price (e.g. 1,500 USDC/ETH) | 1.5 × 10^21 | `Numeric 18` integer part: 10^20 | Too large at WAD's native scale; storable only by sacrificing scale, and no scale choice survives the first multiplication |
| WAD × WAD (realistic values) | ≈ 2.25 × 10^42 (43 digits) | 38 digits | Overflows by 5 digits |
| RAY × RAY | 10^54 (55 digits) | 38 digits | Exceeds max by 10^16 — unrepresentable |
| Single Q64.96 value | max ≈ 10^48 | 10^38 | Cannot be stored at all |
| `mulDiv` intermediate (U256 × U256) | up to 2^512 ≈ 10^154 | 10^38 | Exceeds max by 116 orders of magnitude |

`Numeric` is well-suited to recording final settled values; it is structurally unsuited to the intermediate arithmetic DeFi depends on. This ceiling is documented by the platform's most prominent oracle integration: Chainlink Data Streams has been live on Canton since February 2026, and Chainlink's official Canton integration guide ships a hand-written `hexToUnsignedDecimal` helper and marks `int192`/`int256` report values as unrepresentable in `Decimal`. (Those are signed types; `daml-u256` is deliberately unsigned and covers the non-negative payloads that dominate in practice, while full two's-complement arithmetic is addressed by the planned companion `daml-i256` library over the same limb core.)

### No openly licensed alternative exists

Two oracle vendors have already hand-rolled fragments of multi-limb arithmetic in their Canton Daml codebases because nothing reusable exists. Chainlink's Canton CCIP code (`smartcontractkit/chainlink-canton`) contains `mulDivDown`/`mulDivUp` on base-10^8 decimal limbs and describes itself in-source as "intentionally narrow… not as a general math library"; RedStone's Canton connector (`packages/canton-connector` in the public `redstone-finance/redstone-oracles-monorepo`) contains a partial byte-limb U256 supporting only addition, halving, and comparison. Both codebases are publicly readable but **neither is open source**: both are governed by the Business Source License 1.1 — source-available, not OSI-approved, with production use by third parties prohibited absent an explicit grant, and incompatible with reuse inside an Apache-2.0 library (Chainlink's contracts convert to MIT only in May 2030; RedStone's connector README and monorepo root LICENSE both state BUSL-1.1; established by reading the vendors' public LICENSE files, June 2026). Chainlink's separate Data Streams verifier repository (`data-streams-canton`) **is** MIT-licensed, but contains no 256-bit arithmetic at all — only narrow numeric decoders, the widest an example-code hex-to-`Decimal` fold that traps once values exceed `Decimal`'s range (its integer-part ceiling near 10^28). To the best of our knowledge, **no openly licensed, general-purpose 256-bit arithmetic library is available to Canton developers today.** `daml-u256` will be implemented independently from first principles and published algorithms, with no code copied or derived from BUSL sources, and will ship under Apache-2.0.

Reading the vendors' public source and LICENSE files establishes what that code does and does not provide. Both fragments are narrow oracle-payload utilities, and say so in-source: Chainlink's `mulDiv` is reachable only through a public API capped to 38-digit `Decimal`/`Numeric` inputs, with results beyond that unreturnable through any vendor entry point, and RedStone's fragment has no multiplication or general division at all — no full-domain 512-bit `mulDiv`, no general division with remainder, no integer square root, and neither exposes a general-purpose 256-bit type. Both fragments are well-scoped for their vendors' oracle use cases; the gap they leave is the general-purpose math layer this proposal funds.

### Ecosystem benefit estimate

Per the template's request for a quantified estimate: the merged Dev Fund portfolio already includes multiple live or in-flight Canton DeFi protocols, and many AMM, CLMM, and lending-curve designs in that class require at least one intermediate beyond 38 digits. We estimate, and offer this as an estimate rather than a measured figure, that **roughly half of DeFi-focused dApps on Canton will need this class of exact wide arithmetic**, and that **most EVM-bridge and oracle-consuming applications** (whose payloads are `uint256`-shaped) can use the decode and validation path alone. The Milestone 5 target — at least 3 sustained integrations within 12 months of 1.0, at least 1 on MainNet, with per-integration payment scaling up to 3 — is the corresponding falsifiable commitment: in DeFi, arithmetic mistakes are security bugs (balances drift, prices move incorrectly, fees accumulate wrongly, edge cases become exploitable), and one audited shared implementation would replace N private, unaudited ones.

---

## Rationale

**Why not Daml's `Numeric`?** The overflow table in Motivation shows the failure at each scale. The distinction that matters is storage versus intermediates: a single value can often be parked in a low-scale `Numeric` (`Numeric 0` holds up to ~10^38), but no scale choice survives the first WAD- or Q-format multiplication. `daml-u256` exists precisely for those intermediate steps.

**Why not `BigNumeric`?** It was deprecated in Daml 2.9.1 and does not provide stable, serializable ledger state on the Daml 3.x line; it was never serializable, so it cannot live in ledger state — it is intended for intermediate computation and must be rounded and converted to a fixed-width `Numeric` to be stored; and it lacks the fixed-width semantics EVM-style math depends on. The upstream native-uint256 request ([digital-asset/daml#22827](https://github.com/digital-asset/daml/issues/22827)) explicitly rejects reviving it, and the associated Canton forum discussion saw a Daml-side maintainer favor a fixed-width U256 for cost and serialization control.

**Why a library instead of waiting for native support?** digital-asset/daml#22827 (opened March 2026) requests a native uint256, but it is an unscheduled feature request; even if accepted, it lands in a future Daml-LF version after design, implementation, release, and ecosystem adoption. A library works on every currently supported SDK today. The two approaches are sequential, not competing: this library commits to a documented migration and deprecation path if a native primitive ships.

**Why not extend what already exists?** The template's default is to extend rather than replace, and this proposal follows it where possible: `fromHex`/`toHex` will complete the standard library's hex pipeline rather than reinvent it, and the CLMM layer will reproduce published math models rather than invent new ones. But the only existing 256-bit arithmetic on Canton is BUSL-1.1-licensed vendor code that is legally unusable as a base for an open library, explicitly self-scoped to oracle payloads, and lacking square roots entirely — RedStone's fragment has no multiplication or general division at all, and Chainlink's `mulDiv` is capped to 38-digit `Numeric` inputs at its public API, with results beyond that unreturnable through any vendor entry point (see Motivation). There is nothing open to extend; this proposal creates the extensible base. Relatedly, OpenZeppelin's approved ecosystem-stack proposal (noted under Architectural Alignment) ships DEX and lending reference implementations precisely because reusable DeFi primitives are missing; `daml-u256` supplies the arithmetic layer beneath that work (outreach to that team is a funded Milestone 5 activity).

**Why this representation and these algorithms?** Nine 30-bit limbs gives every intermediate of every algorithm a short, standard safety proof with an 8× headroom margin under Daml's trap-on-overflow `Int` (Specification §2); the row-wise operand-scanning bound is the textbook multi-precision invariant an auditor recognizes on sight, and a written per-step argument will ship in the repository. Dual dividers with constructed correction-branch vectors structurally address a notorious historical failure mode of multi-precision libraries instead of relying on testing discipline alone.

**Why a separate reference CLMM package?** It proves protocol relevance — a raw number type alone would leave reviewers asking whether the library suffices for real DeFi — while keeping the core package minimal and the audit budget focused on the arithmetic.

**Why this funding shape?** Payment should track value to the network. Delivery pays on inspectable artifacts as the build lands; the majority pays only for adoption that persists, verified in active use at the three-, six-, and twelve-month checkpoints.

**Alternatives considered:** per-project private emulation (already happening — two vendors ship partial, mutually incompatible fragments — and it multiplies audit cost across teams); off-ledger computation with on-ledger settlement (workable for some systems, but weakens transparent on-ledger protocol math); waiting for native support (not a dependable plan for teams that need these primitives now).
