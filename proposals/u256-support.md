## Development Fund Proposal: daml-u256, Audited U256 and Fixed-Point Math Library for DeFi on Canton

**Author:** Zhe Li, Srikanth
**Status:** Submitted  
**Created:** 2026-03-29  
**Implementing Entity:** Bit Dynamics

---

## Abstract

As institutional networks seek deeper interoperability with public EVM infrastructure, a critical gap has become clear: Daml has no native 256-bit integer type, while EVM-native DeFi protocols rely pervasively on `uint256` and `int256` for AMM pool math, oracle price payloads, bridge state, and cryptographic operations.

Daml does not currently offer a native, stateful `U256` type for application code. That does not make all DeFi impossible on Canton, but it does make a very important class of DeFi protocols impractical to implement safely on-ledger: concentrated liquidity market makers, exact AMM math, precise lending curves, fee-growth accounting, and other designs that depend on 256-bit integer arithmetic, 512-bit intermediate multiplication, and fixed-point formats such as Q64.96 and Q128.128.

Daml's built-in `Numeric` type — despite offering 38 significant digits — cannot store a single WAD-scaled asset price in `Numeric 18`, and a standard RAY × RAY intermediate produces 10^54, which is **10^16 times larger than `Numeric`'s absolute maximum** and is completely unrepresentable. This is not a niche edge case: it is the everyday arithmetic of every serious DeFi protocol.

Today, teams that need those primitives must either:

- push critical math off-ledger,
- write ad hoc multi-limb arithmetic privately, or
- avoid those protocol designs entirely.

This proposal requests funding to build `daml-u256`, an open-source Daml library that provides:

- a `U256` type implemented in pure Daml using fixed-width limbs,
- exact arithmetic and comparison utilities,
- overflow-safe `mulDiv` with 512-bit intermediate precision,
- fixed-point math modules for DeFi-style price and fee calculations,
- a reference CLMM math package showing real usage,
- comprehensive tests, benchmarks, documentation, and an external audit.

The goal is not to replace a future native numeric primitive. The goal is to give Canton developers a safe, reusable, audited math foundation for advanced DeFi before native language support exists.

---

## Specification

### 1. Objective

The objective is to make advanced DeFi math requiring U256-style arithmetic feasible and reusable in Daml today.

U256 is important for DeFi because many DeFi protocols are not merely "large-number applications." They rely on **exact integer semantics** for safety:

- price movement must be rounded consistently,
- fee growth must not drift over time,
- multiplication must not overflow before division is applied,
- the same inputs must always produce the same outputs as the published math model.

This is why battle-tested DeFi systems use fixed-width integer math and explicit fixed-point formats. 

This proposal focuses on the part of DeFi that genuinely needs U256-style arithmetic:

- concentrated liquidity math,
- exact price-step calculations,
- fee accumulator arithmetic,
- overflow-safe multiplication followed by division,
- fixed-point representations used by battle-tested DeFi systems.

Not all DeFi on Canton depends on U256. The point of `daml-u256` is that a narrower but highly important class of DeFi primitives becomes much more realistic once exact large-integer math is available as shared infrastructure.

The intended outcome is a reusable Daml library that provides:

- a `U256` application type,
- exact arithmetic and comparison operations,
- overflow-safe `mulDiv` primitives,
- fixed-point math in Q64.96 and Q128.128 formats,
- reference CLMM math functions,
- public documentation, tests, and audit artifacts.

#### Rationale
##### Why Daml's Numeric type is not sufficient

The most obvious alternative to this library is using Daml's built-in `Numeric n` type. It does not work for DeFi math. The numbers make this unambiguous:

| Operation | Result | Daml Numeric max | Verdict |
|---|---|---|---|
| Single WAD-scaled price (1,500 at 10^18 scale) | 1.5 × 10^21 | `Numeric 18` integer part: 10^20 | **Overflows before multiplication** |
| WAD × WAD intermediate (10^18 × 10^18) | 10^36 — 43 digits for realistic values | 38 digits | **Overflows by 5 digits** |
| RAY × RAY intermediate (10^27 × 10^27) | 10^54 — needs 55 digits | 38 digits | **Exceeds Daml max by 10^16 — completely unrepresentable** |
| Single Q64.96 value | max ≈ 10^48 | 10^38 | **Q64.96 cannot be stored at all** |
| mulDiv 512-bit intermediate (U256 × U256) | up to 2^512 ≈ 10^154 | 10^38 | **Exceeds by 116 orders of magnitude** |

`Numeric` is well-suited for recording final results — a settled price, a final balance, a fee amount. It is not suited for the intermediate arithmetic that DeFi protocols depend on. Every major DeFi design — AMMs, CLMMs, lending curves, fee accumulators — requires at least one multiplication step whose intermediate product exceeds 38 decimal digits. `daml-u256` exists to handle exactly those steps.

##### Why not BigNumeric?

`BigNumeric` is not a good foundation for this proposal either:

- it was deprecated in Daml `2.9.1` and removed in `3.x`,
- it is not serializable and therefore cannot be used directly in ledger state,
- it is intended for intermediate computation rather than as a durable application type,
- it does not provide the fixed-width integer semantics that EVM-style DeFi math depends on.

That makes `BigNumeric` useful historical context, but not a viable replacement for a stateful `U256` application library.

##### Why a library instead of waiting for native support?

A native `U256` primitive would require direct language and runtime work. A library can deliver value much sooner and does not depend on internal roadmap timing.

### 2. Implementation Mechanics

The project will be delivered as a pure Daml library and reference package, with no protocol or runtime changes required.

#### Representation

Daml's `Int` is a **signed 64-bit integer** with a positive range of `0` to `2^63 - 1` (≈ 9.22 × 10^18). This imposes a hard constraint on limb-based multi-precision arithmetic: for two limbs `a` and `b` to multiply without overflow, their product must not exceed `2^63 - 1`.

A naive 4-limb design with 64 effective bits per limb is fatally broken at the storage level — values above `2^63` cannot be represented in a single Daml `Int`. An 8-limb design with 32 effective bits per limb is also unsafe: `(2^32 - 1)^2 ≈ 1.84 × 10^19`, which is approximately 2× the Daml `Int` maximum.

The safe boundary is **30 effective bits per limb**, where schoolbook column accumulation of up to 9 partial products remains within range: `9 × (2^30 - 1)^2 ≈ 9.22 × 10^18 ≈ 2^63 - 1`.

The proposed representation is therefore a **9-limb structure with 30 effective bits per limb** (270-bit capacity, sufficient for 256-bit values):

```daml
data U256 = U256
  with
    limb0 : Int  -- bits   0–29
    limb1 : Int  -- bits  30–59
    limb2 : Int  -- bits  60–89
    limb3 : Int  -- bits  90–119
    limb4 : Int  -- bits 120–149
    limb5 : Int  -- bits 150–179
    limb6 : Int  -- bits 180–209
    limb7 : Int  -- bits 210–239
    limb8 : Int  -- bits 240–255 (upper 16 bits used)
```

This design is intentionally conservative and safe:

- **fixed-width** — not variable-width, serializable as ordinary Daml data,
- **overflow-safe** — schoolbook multiplication stays within signed `Int` at every intermediate step,
- **auditable** — arithmetic is straightforward carry-propagation logic with no hidden overflow,
- **usable in contract state and pure functions** — no runtime or protocol dependency.

The implementation will publish measured benchmarks for representative operations and contract shapes. The extra limb (9 vs. 8) is the price of arithmetic safety in Daml's signed integer model and is not negotiable without introducing silent overflow risk.

The 270-bit capacity is fully adequate: the upper limb (`limb8`) uses only 16 of its 30 available effective bits to cover bits 240–255.

#### Core Library Surface

The initial library is expected to contain four modules:

1. `U256`
   - constructors and canonical normalization
   - `add`, `sub`, `mul`, `div`, `mod`
   - comparisons: `eq`, `lt`, `lte`, `gt`, `gte`
   - shifting and limb-aware helpers
   - conversions to and from bounded Daml numeric forms where safe

2. `FullMath`
   - `mulDiv`
   - `mulDivRoundingUp`
   - exact handling of 512-bit intermediates for multiplication-before-division workflows

3. `FixedPoint`
   - Q64.96 helpers
   - Q128.128 helpers
   - multiply/divide helpers
   - square-root support suitable for DeFi price math

4. `CLMMMath`
   - reference formulas for price movement and amount deltas
   - a small set of CLMM-style math utilities demonstrating how the lower layers are composed

#### Scope Boundaries

This proposal includes:

- reusable large-integer and fixed-point math,
- cross-validation against established DeFi math behavior,
- a reference CLMM math layer,
- benchmarks, documentation, and audit work.

This proposal does **not** include:

- a full AMM or CLMM product,
- frontend applications,
- liquidity management UX,
- native Daml or Daml-LF changes,
- Canton node changes,
- an entire DeFi protocol suite.

### 3. Architectural Alignment

This proposal aligns with the fund as shared developer infrastructure:

- it is reusable by multiple teams,
- it addresses a missing application-layer primitive,
- it helps DeFi-oriented builders without changing protocol behavior,
- it reduces repeated private reimplementation of high-risk math.

It also aligns well with Canton specifically because it keeps the solution additive:

- no Daml-LF upgrade,
- no validator or node-operator reconfiguration,
- no dependency on the timing of native language support.

### 4. Backward Compatibility

No backward compatibility impact.

This is an additive library. Teams can adopt it incrementally or ignore it entirely.

---

## Milestones and Deliverables

### Milestone 1: Public Alpha of Core U256 Arithmetic

- **Estimated Delivery:** 5 weeks from grant approval
- **Focus:** Publish a usable alpha of the `U256` type and its core arithmetic surface.
- **Deliverables / Value Metrics:**
  - `U256` type and normalization helpers
  - core arithmetic and comparison functions
  - shifting and basic low-level helpers needed by later modules
  - property-based and edge-case tests published in the repository
  - alpha package and usage notes published publicly

### Milestone 2: Exact FullMath and Fixed-Point Beta

- **Estimated Delivery:** 10 weeks from grant approval
- **Focus:** Deliver the math that makes the library genuinely useful for DeFi protocol logic.
- **Deliverables / Value Metrics:**
  - `mulDiv` and `mulDivRoundingUp`
  - Q64.96 and Q128.128 helper modules
  - documented rounding and overflow behavior
  - cross-validation against established external test vectors where applicable
  - beta release with benchmark notes

### Milestone 3: Reference DeFi Math Package

- **Estimated Delivery:** 14 weeks from grant approval
- **Focus:** Demonstrate real protocol applicability rather than shipping only primitives in isolation.
- **Deliverables / Value Metrics:**
  - reference CLMM math package
  - representative price-step and amount-delta functions
  - worked examples showing composition of `U256`, `FullMath`, and fixed-point modules
  - a minimal Daml reference module illustrating library usage in a DeFi-style workflow

### Milestone 4: Audit, Hardening, and Audited Release

- **Estimated Delivery:** 18 weeks from grant approval
- **Focus:** Turn the library from a promising package into a credible shared dependency.
- **Deliverables / Value Metrics:**
  - independent external audit
  - audit shortlist: Halborn or Composable Security, with final selection subject to scope fit, availability, and budget alignment
  - audit findings resolved or documented
  - public documentation and migration guidance
  - final open-source release with tagged version and CI
  - developer-facing walkthrough or technical write-up

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- the library being published as open source,
- the documented module surface being implemented,
- test suites passing in the published CI environment,
- cross-validation artifacts being included in the repository,
- the audit report being completed and publicly disclosed,
- documentation being sufficient for an external team to adopt the library without reverse-engineering the source first.

Project-specific acceptance conditions:

- the project must remain scoped to reusable math infrastructure rather than a full protocol product,
- the release must document exact overflow, rounding, and fixed-point assumptions,
- benchmark results must be published for representative operations and example contract usage,
- the audit scope must include the arithmetic and fixed-point logic, not just packaging or documentation.

---

## Funding

**Total Funding Request:** 1,370,000 CC

### Funding Rationale

This request is structured as:

- `800,000 CC` for implementation, testing, benchmarks, documentation, and release work
- `570,000 CC` for an independent external audit, addressing audit findings and public release. The amount is flexible based on the audit findings.

This pricing treats `daml-u256` as a serious shared math library, not a small utility script:

- it requires non-trivial multi-precision arithmetic in pure Daml,
- correctness matters because arithmetic bugs in DeFi are financially exploitable,
- the value comes from shared reuse and auditability, not just from "making something compile,"
- a real external audit is included as an explicitly budgeted workstream.
- audit vendor selection is expected to come from the shortlist of Halborn or Composable Security, subject to final scope confirmation.

This ask is intentionally positioned between a narrow developer utility and a much larger language/runtime proposal:

- it is **lower** than a native Daml or Canton-core change because it avoids protocol, runtime, and node changes entirely,
- it is **higher** than a lightweight toolkit because it includes multi-precision arithmetic, fixed-point math, protocol-relevant reference modules, benchmark publication, and a dedicated external audit,
- it is priced as reusable public-good infrastructure for multiple future DeFi builders rather than as a one-off internal implementation.

At a high level, this assumes:

- senior engineering time for arithmetic implementation, test harnesses, and cross-validation,
- additional hardening time for reference DeFi math and release quality,
- external audit cost,
- documentation and developer enablement work.

### Payment Breakdown by Milestone

- Milestone 1 _(Public Alpha of Core U256 Arithmetic)_: 180,000 CC upon committee acceptance
- Milestone 2 _(Exact FullMath and Fixed-Point Beta)_: 260,000 CC upon committee acceptance
- Milestone 3 _(Reference DeFi Math Package)_: 360,000 CC upon committee acceptance
- Milestone 4 _(Audit, Hardening, and Audited Release)_: 570,000 CC upon final release and acceptance

### Volatility Stipulation

If the project timeline extends beyond 6 months due to Committee-requested scope changes, remaining milestones should be renegotiated for material CC/USD volatility.

---

## Co-Marketing

Upon release, the implementing entity will collaborate with the Canton Foundation on:

- announcement coordination,
- one technical write-up explaining why U256-style math matters for advanced DeFi on Canton,
- one developer-facing walkthrough or demo showing how to use the library safely.

Specific commitments:

- publish worked examples for core arithmetic and fixed-point usage,
- publish reference notes for DeFi builders evaluating whether the library fits their protocol design,
- publish the audit report and release notes publicly.

---

## Motivation

The strongest reason to fund this work is not "large numbers are nice to have." It is that a specific category of DeFi protocol math depends on exact integer behavior that Daml does not provide directly today.

### The Arithmetic Gap

Every serious DeFi protocol uses scaling factors to represent fractions without floating point. The two industry standards are **WAD** (10^18, used in Uniswap, Compound) and **RAY** (10^27, used in Aave, MakerDAO). Multiplying two scaled values produces an intermediate product that must fit in the language's integer type before dividing back down to the final result. In Daml, this fails at every level:

| Operation | Intermediate Result | Daml `Numeric` max | Verdict |
|---|---|---|---|
| Single WAD-scaled price (e.g. 1,500 USDC/ETH) | 1.5 × 10^21 | `Numeric 18` integer part: 10^20 | **Overflows before any multiplication** |
| WAD × WAD | up to 10^42 (43 digits) | 38 digits | **Overflows by 5 digits** |
| RAY × RAY | 10^54 (55 digits) | 38 digits | **Exceeds max by 10^16 — unrepresentable** |
| Single Q64.96 value | max ≈ 10^48 | 10^38 | **Cannot be stored at all** |
| `mulDiv` intermediate (U256 × U256) | up to 2^512 ≈ 10^154 | 10^38 | **Exceeds max by 116 orders of magnitude** |

`Numeric` is well-suited for recording final settled values. It is structurally unsuited for the intermediate arithmetic that DeFi protocols depend on. Every AMM, CLMM, and lending curve requires at least one multiplication step whose intermediate product exceeds 38 decimal digits. Without `daml-u256`, those steps have no safe home on-ledger.

That matters because approximate or privately reimplemented math is not just inconvenient. In DeFi, arithmetic mistakes are security bugs:

- balances drift,
- prices move incorrectly,
- fees accumulate inaccurately,
- edge cases become exploitable.

A shared, audited `daml-u256` library improves the ecosystem in three ways:

- it lowers the cost of building advanced DeFi designs on Canton,
- it reduces repeated private implementations of the same risky math,
- it gives the ecosystem a reusable foundation even if native language support arrives later.

---

## Appendix A: Finalized U256 Design Decisions

This appendix documents the specific design decisions incorporated into the `daml-u256` library standard, capturing key implementation choices that affect safety, predictability, and ecosystem compatibility.

### 1. Type Definition

`U256` is defined as a strict, fixed-width unsigned 256-bit integer type implemented in pure Daml using **nine `Int` limbs with 30 effective bits per limb**. This conservative layout is chosen specifically to keep addition, carry propagation, and schoolbook multiplication within Daml's signed 64-bit `Int` safety boundary while still covering the full 256-bit unsigned range.

It is designed to safely encapsulate EVM `uint256` token balances, cryptographic nonces, and unsigned EVM storage slots without requiring any Daml runtime or protocol changes.

### 2. Mandatory Trap-on-Overflow Arithmetic

Standard arithmetic operations (`add`, `sub`, `mul`, `div`) applied to `U256` will default to trapping and reverting the transaction upon detecting overflow or underflow. This preserves Daml's commitment to strict financial predictability and prevents silent data wrapping vulnerabilities in DeFi applications.

This is a deliberate departure from EVM default behavior (which wraps silently). For on-ledger DeFi math, trapping is the correct and safer default.

### 3. Explicit Wrapping Operations for Cryptographic Use Cases

To support cryptographic hash manipulations and elliptic curve operations that require modulo arithmetic, a secondary suite of explicit wrapping functions is defined within the library:

```
addWrapping : U256 -> U256 -> U256
subWrapping : U256 -> U256 -> U256
mulWrapping : U256 -> U256 -> U256
```

These are named explicitly so that wrapping behavior is always a deliberate, visible choice in the source code — never an accidental default. Division wrapping is intentionally omitted as it does not carry the same semantic meaning.

### 4. Native Bitwise Logic Module

To support efficient unpacking of tightly compressed 256-bit oracle reports or EVM storage slots, the library includes a native bitwise module tailored for `U256`:

```
shiftL     : U256 -> Int -> U256
shiftR     : U256 -> Int -> U256
bitwiseAnd : U256 -> U256 -> U256
bitwiseOr  : U256 -> U256 -> U256
bitwiseXor : U256 -> U256 -> U256
```

### 5. Deterministic Hexadecimal Parsing

The library provides a native, fail-safe hexadecimal string decoder explicitly built for 256-bit unsigned conversion, replacing error-prone application-layer workarounds such as manual `hexToUnsignedDecimal` implementations:

```
fromHex : Text -> Optional U256
```

This eliminates a common class of integration bugs when consuming Chainlink Data Streams, EVM bridge payloads, or raw EVM storage slot values in Daml applications.
