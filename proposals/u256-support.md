## Development Fund Proposal

**Proposal:** daml-u256 — Audited U256 and Fixed-Point Math Library for DeFi on Canton

- **Author:** Zhe Li, Srikanth
- **Org:** BitDynamics
- **Status:** Submitted
- **Created:** 2026-03-29
- **Label:** defi-liquidity
- **[Champion](https://github.com/canton-foundation/canton-dev-fund/blob/main/sig-directory.md):** Nate ( Obsidian)

---

## Abstract

Daml has no native 256-bit integer type, while EVM-native DeFi depends on `uint256` for AMM math, oracle payloads, bridge state, bit fields, and fixed-point formats such as Q64.96 and Q128.128. Daml's `Numeric` is a 38-digit decimal type: it handles ordinary scaled amounts, but it cannot represent the full raw `uint256` domain, reproduce fixed-width EVM wrapping and bitwise semantics, or hold the up-to-512-bit product required by exact full-domain `floor(a × b / d)`. To the best of our knowledge, Canton has no openly licensed, general-purpose U256 math library.

We propose to build `daml-u256`: a pure-Daml, Apache-2.0 library with checked, aborting, and explicitly wrapping arithmetic; 512-bit `mulDiv`; integer square root; Q64.96 and Q128.128 fixed point; conversions; and a separate CLMM reference package. The work requires no Daml-LF, runtime, protocol, or Canton node change.

---

## Specification

### 1. Objective

The objective is to make exact unsigned 256-bit and fixed-point arithmetic available as one reusable, independently audited dependency. Canton teams building concentrated liquidity, exact price-step and fee-growth accounting, EVM/oracle decoding, and overflow-safe multiply-then-divide workflows should not each reimplement and separately audit the same carry, division, overflow, and rounding logic.

The funded scope covers the core and fixed-point library, independent verification, a separate CLMM reference package, benchmarks, documentation, external audit, remediation, release, adoption, and 12 months of maintenance. It excludes a deployable AMM/CLMM protocol, frontends, signed I256, prime-field/cryptographic arithmetic, Daml-LF or runtime changes, and Canton node changes.

All functionality described below is a commitment for the future funded delivery phase. Milestone acceptance will depend on tagged artifacts, tests, audit evidence, and release outputs meeting the stated criteria; pre-award feasibility work will not by itself satisfy a milestone.

### 2. Implementation Mechanics

#### Packages and Public Boundary

The project will deliver two production DARs and separate test packages:

- **`daml-u256`**, depending only on `daml-prim` and `daml-stdlib`: `U256`, `U256.Internal`, `U256.Convert`, `U256.FullMath`, `U256.Sqrt`, `U256.Q64x96`, and `U256.Q128x128`.
- **`daml-u256-clmm`**, consuming the core DAR as a data dependency: `CLMM.TickMath`, `CLMM.TickMathConstants`, `CLMM.SqrtPriceMath`, `CLMM.SwapMath`, and `CLMM.Examples`.
- **Test packages**, including generators, Daml Script suites, independent references, benchmarks, and downstream/codegen fixtures, outside the production DARs.

`U256.Internal` will contain raw limb kernels and will not be a stable consumer API. Named public functions will be normative. A release-time `PUBLIC_API.md` will enumerate supported names, preconditions, failure behavior, rounding direction, EVM compatibility, and versioning guarantees.

#### Representation and Arithmetic Safety

Daml `Int` is signed 64-bit and traps on overflow. Four 64-bit limbs cannot be represented, and even one 32-bit-by-32-bit partial product can exceed the positive `Int` range. `U256` will therefore use a fixed nine-field little-endian record with 30 effective bits per limb and 16 used bits in the top limb. Canonical form requires every limb in `[0, 2^30)` and the top limb below `2^16`.

The fixed record guarantees exactly nine limbs and avoids list-length or redundant-encoding ambiguity. Public safe operations will validate operands themselves so malformed values arriving from contract fields, choice arguments, decoded payloads, or the Ledger API return `None`, a typed `InvalidRepresentation`, or a structured abort rather than reaching a limb kernel and trapping. `valid` and `requireValid` will remain available for explicit contract-boundary checks. Only `U256.Internal` may assume canonical operands.

Multiplication will use row-wise operand scanning rather than unsafe column accumulation. For limb base `B = 2^30`, the fused step `u + x·m + c` is bounded by `2^60 − 1`, below the signed 64-bit maximum. `SPEC.md` will provide the complete per-intermediate bounds, carry/borrow invariants, and serialized representation; the proposal records the design choice without duplicating the auditor-facing proof.

The safety argument will cover executable host arithmetic, not only mathematical U256 results. For every addition, subtraction, normalization, carry, borrow, multiplication, shift, quotient-estimation, and conversion step, the bound table will state the expression, required operand invariant, maximum and minimum intermediate, and the code location implementing it. Boundary tests will exercise the neighboring values around each limit. Because Daml consumers can construct the public record directly, validation itself will also be safe for arbitrary signed-64-bit field values; no checked or result API will enter a limb kernel until every operand is canonical.

#### Public Arithmetic Semantics

The library will expose three visibly distinct tiers over one core:

- **Checked:** `addChecked`, `subChecked`, `mulChecked`, `divChecked`, `modChecked`, `powChecked`, and `divModChecked` return `Optional` and remain total for every publicly constructible input.
- **Typed result:** corresponding `…Result` functions return `Either U256Error`, distinguishing `Overflow`, `Underflow`, `DivisionByZero`, `InvalidRepresentation`, `InvalidShift`, and `InvalidConversion`.
- **Aborting and wrapping:** `add`, `sub`, `mul`, `div`, `mod`, and `pow` fail with stable `daml-u256/...` status identifiers; only explicitly named `addWrapping`, `subWrapping`, and `mulWrapping` compute modulo `2^256`.

Silent wrapping will never be the default. Division by zero will abort or return failure; there will be no silent-zero division. Safe `mulMod`/`addMod` will reject a zero modulus, while `mulModEvm`/`addModEvm` will return zero to match EVM semantics.

These surfaces will share one arithmetic implementation. The checked/result layer will determine the outcome, the aborting layer will translate the same error one-to-one into the documented status identifier, and the wrapping layer will invoke only the explicitly documented modular path. Tests will assert this correspondence so that convenience APIs cannot drift into different arithmetic behavior. Overflow checks will apply at each exponentiation step, and shift and conversion failures will remain distinct from arithmetic overflow.

The type will provide numeric comparison, fixed-width hexadecimal `Show`, and `U256Key` with most-significant limbs first so Daml's builtin map/set ordering agrees with numeric ordering. Typeclass instances will be convenience syntax only; cross-SDK consumers and specifications will use named functions.

The ordering distinction is material: the serialized record is least-significant-limb first, so a derived record ordering would not be numeric. `Ord` will therefore compare from the top limb down, while `U256Key` will reverse the field significance for builtin Daml key ordering. Round-trip and ordered-map tests will cover zero, adjacent limb boundaries, `2^255`, and the maximum. `Show` will expose a stable 32-byte hexadecimal value rather than the internal record layout.

#### Division, FullMath, Square Root, and Fixed Point

Single-limb divisors will use short division; larger divisors will use Knuth Algorithm D. The production formulation will normalize the divisor, estimate and correct each quotient digit, perform multiply-subtract without relying on negative division, and add the divisor back when an estimate is one too large. This borrow-first, non-negative structure is important because Daml integer division truncates toward zero, so a mechanical port that temporarily divides negative values can silently change carry behavior. `SPEC.md` will state the normalization, quotient-estimate, multiply-subtract, add-back, and denormalization invariants as an auditor checklist.

A permanent binary shift-subtract divider will remain as an algorithmically different CI oracle. Both dividers will run over the same multi-limb corpus. Constructed inputs, confirmed by an instrumented reference model, will force q-hat decrement and add-back branches that random generation is unlikely to reach. Power-of-two denominators will route through shifts, and one-limb denominators such as common fee bases will route through short division; each fast path will be checked against the general divider for quotient, remainder, and rounding.

`U256.FullMath` will first construct the complete 18-limb product, then divide without truncating the high half. Checked and aborting `mulDiv` will fail when the quotient does not fit U256; `mulDivRoundingUp` will increment only when the remainder is non-zero and will report overflow if the floor result is already the maximum. `mulMod` will reduce the full 512-bit product, not only its low 256 bits. Safe and EVM-compatible zero-modulus behavior will remain separate and visibly named.

`U256.Sqrt` will use a division-free restoring square root as the production implementation, with Newton iteration retained as an independent cross-check. Verification will assert the defining postcondition `r² ≤ x < (r + 1)²` at zero, perfect squares, adjacent non-squares, powers of two, and the maximum value, in addition to agreement between both algorithms.

`Q64x96` and `Q128x128` will be distinct wrappers so price, fee-growth, and raw U256 values cannot be mixed accidentally. Q64.96 will enforce `raw < 2^160`, accept an integer part only below `2^64`, and range-check every constructor and arithmetic result; Q128.128 will use the full 256-bit raw domain. Multiply/divide names will encode rounding direction as `…Down`/`…Up`. Q128.128 will additionally expose explicitly wrapping fee-growth addition/subtraction because some CLMM accumulator designs overflow modulo `2^256` by definition; the wrap-survival behavior will receive dedicated vectors.

#### Bits, Codecs, and Decimal Interoperability

Because Daml-LF has no native `Int` bit operations, shifts and AND/OR/XOR will be emulated per limb with bounded arithmetic. Shifts of at least 256 will return zero, matching EVM SHL/SHR. `testBit` will cover common extraction paths, while documentation will identify bit-serial operations as relatively expensive.

To minimize the audited kernel surface, the implementation will use one bit-serial AND primitive and derive XOR and OR per 30-bit limb: `xor(x,y) = x + y − 2·and(x,y)` and `or(x,y) = x + y − and(x,y)`. Applying those identities per limb keeps the intermediates bounded; it will never form a full-width `x + y`. Boundary vectors will include maximum-with-maximum, maximum-with-zero, the high bit, limb boundaries, and shifts immediately below, at, and above 256.

Hex APIs will distinguish fixed `bytes32` encoding (`toHexFixed`/`fromHexFixed`) from minimal JSON-RPC quantities (`toHexQuantity`/`fromHexFlexible`). Decoders will accept an optional `0x`, be case-insensitive, and return failure on malformed or out-of-range input; encoders will emit lowercase.

`U256` will complement, not replace, `Numeric`/`Decimal`. Exact Numeric conversions will return failure when the target cannot represent the value. Decimal scaling APIs will require an explicit rounding direction or return the remaining raw units, so bridge and token code cannot silently lose precision. For example, an 18-decimal raw amount converted to Canton `Decimal` can return the ten-decimal representable value plus the unrepresented remainder.

For a concrete boundary case, raw amount `1,234,567,890,123,456,789` at 18 decimals represents `1.234567890123456789`. A ten-decimal Canton value can represent `1.2345678901`; `toDecimalScaledWithRemainder` will also return the remaining `23,456,789` raw units. A caller seeking one value must choose down or up explicitly. This keeps display and settlement values in Decimal while preserving exact raw-unit accounting in U256.

| Use case | Representation |
| --- | --- |
| Settlement, invoice, interest, or legal quantity | `Decimal`/`Numeric` |
| Raw EVM token unit, storage value, Q format, or wide intermediate | `U256` |
| Heavy non-verifiable computation | Compute off-ledger and settle an agreed result on-ledger |

EVM parity will be an explicit compatibility mode, not an ambient default:

| Operation | Safe library behavior | Explicit EVM-compatible behavior |
| --- | --- | --- |
| Add/subtract/multiply overflow | abort or checked failure | named wrapping operation modulo `2^256` |
| Division by zero | abort or checked failure | no silent-zero variant |
| `MULMOD`/`ADDMOD` with zero modulus | abort or checked failure | `mulModEvm`/`addModEvm` return zero |
| Shift by at least 256 | zero | already identical |
| Hex output | fixed 32-byte form | minimal JSON-RPC quantity form |

#### Reference CLMM Package

`daml-u256-clmm` will demonstrate applicability without becoming a protocol product. It will provide TickMath over `[-887272, 887272]` and its checked inverse; amount0/amount1 deltas with explicit rounding; next-price functions; `computeSwapStepChecked` for exact-input and exact-output paths; and worked composition examples. Tick constants will be derived independently from exact rationals and hash-pinned. Outputs will be compared with an independent EVM/Rust reference rather than only with the constant generator.

Swap-step coverage will include both price directions, exact-input and exact-output paths, fee-in-pips behavior over the `10^6` base, minimum/maximum sqrt-price boundaries, target reached and target not reached, and the fallback rounding branches used by next-price calculations. The inverse tick function will be checked around exact tick prices and the adjacent ratios where floor behavior changes.

The public CLMM interface will use Q64.96/Q128.128 wrappers where they express the domain and will enforce the equivalent `uint160`/`uint128` bounds at every relevant downcast. Signed quantities will use bounded Daml ticks and magnitude-plus-direction values; full two's-complement I256 remains out of scope.

The CLMM DAR is a reference consumer of the core library. It will not include pool state, positions, authorization, liquidity accounting, protocol fees, or economic-security claims. It is also outside the future M4 audit opinion defined below and must be described as **unaudited reference math**, unless a later vendor scope and committee amendment expressly add it.

#### Verification and Performance

Verification will be a deliverable rather than an implementation detail:

- **Independent expected values:** CI will compare immutable golden vectors, freshly regenerated Python arbitrary-precision vectors, and an independently maintained EVM/Rust reference for EVM-compatible behavior, FullMath, and CLMM outputs. Generator seeds, dependency versions, and reference commits will be pinned; regeneration drift will fail the build.
- **Algorithmic differential checks:** the production and reference dividers and both square-root algorithms will run over their shared corpora. Algebraic properties will cover inverse relations and rounding identities only where their preconditions hold. Instrumentation will prove that constructed division cases reach the correction branches they claim to test.
- **Fault-oriented coverage:** mutation testing will alter canonicality, carry/borrow, comparison, overflow, division correction, width, wrapping, and rounding logic. Reduced-width exhaustive models will enumerate carry, borrow, multiplication, and division behavior in a small limb/base configuration, providing evidence that does not depend on random input selection.
- **Consumer and upgrade evidence:** serialization round trips, LF-shape pins, Java and TypeScript codegen builds, a downstream `data-dependencies` application for every declared SDK/LF target, and package upgrade/migration checks will verify the compiled interface rather than source compilation alone.

`SPEC.md`, `AUDIT.md`, `MIGRATION.md`, `PUBLIC_API.md`, generated API documentation, and a developer walkthrough will map each correctness claim to the relevant implementation, invariant, test command, and artifact. An internal adversarial review before M4 will focus on malformed public records, division correction, 512-bit truncation, fixed-point range enforcement, wrapping, and rounding.

M3 will publish reproducible benchmarks on a pinned environment. The harness will amortize build/JVM startup with repeated operations in one process, include warm-up, publish raw samples plus median and p95, and compare a representative CLMM swap step with an operation-count-comparable Decimal workflow. The comparison will be diagnostic, not a claim of identical semantics.

The report will publish the exact inputs and iteration count, CPU/OS/JVM/SDK identifiers, harness commit, warm-up policy, every measured sample, and an empty/no-op harness result so startup and orchestration overhead are visible. Core add, multiply, both division routes, `mulDiv`, square root, and the representative swap step will be reported separately. The benchmark is intended to show interpreter cost and relative hotspots; it will not be presented as ledger throughput or as proof that Decimal and U256 have identical semantics.

#### Delivery, Governance, and Sustainability

The repository and release will be Apache-2.0, independently implemented from published algorithms without copying BUSL code. Tagged releases will include DAR assets, checksums, documentation, and security/reporting guidance. The funded scope includes 12 months of security fixes, SDK compatibility updates, and issue triage, concurrent with adoption. BitDynamics will offer the Canton Foundation escrow administrative access as a continuity measure.

Repository governance will identify a primary maintainer, backup maintainer, release authority, and private security contact. Arithmetic kernels, generated constants, serialization, public semantics, dependencies, and release configuration will require passing CI and review by a second qualified contributor. Release records will bind the tag, full commit SHA, DAR package IDs, dependency inventory, checksums, supported SDK/LF targets, and reproducibility commands. Security advisories will identify affected versions and package IDs, impact, mitigation, and fixed release; fixes touching the audited scope will follow the delta-review rule below.

### 3. Architectural Alignment

The project is additive pure Daml: it requires no Daml-LF upgrade, node configuration, validator change, or protocol dependency. It supports App Building, Developer Experience, and Security and Resilience by making one reviewed dependency available to multiple projects.

### 4. Backward Compatibility

*No backward compatibility impact.*

Adoption is optional, but consumers acquire an explicit package-ID and serialized-shape dependency. The serialized U256 shape will therefore be pinned before 1.0. After the audited release, numeric semantics will freeze; any behavioral or incompatible representation change will require a major version/new package name and documented migration. If native U256 ships later, the library will publish a migration and deprecation path.

---

## Milestones and Deliverables

The future delivery phase contains four build/audit milestones and one outcome-contingent adoption milestone.

### Milestone 1: Core U256

- **Estimated Delivery:** Within 6 weeks of grant approval
- **Deliverables and value evidence:** Canonical fixed-width type; total checked/result APIs; aborting/wrapping tiers; multiplication, comparison, bits, codecs, dual division; carry-safety specification; core vectors; and downstream consumption.

### Milestone 2: DeFi Math

- **Estimated Delivery:** Within 11 weeks of grant approval
- **Deliverables and value evidence:** 512-bit FullMath, modular forms, dual square root, Q64.96/Q128.128, conversions, rounding/overflow documentation, and independent cross-validation.

### Milestone 3: CLMM and Release Evidence

- **Estimated Delivery:** Within 15 weeks of grant approval
- **Deliverables and value evidence:** Wrapper-safe reference CLMM DAR; independent CLMM parity; benchmarks; SDK/LF/codegen/upgrade checks; mutation/exhaustive testing; `SPEC.md`, `AUDIT.md`, `MIGRATION.md`, API docs, and walkthrough.

### Milestone 4: Audit and 1.0

- **Estimated Delivery:** Within 20 weeks of grant approval, subject to vendor lead time
- **Deliverables and value evidence:** Audit freeze; independent review of the exact scope below; remediation/retest; public report; signed audited `v1.0.0`; and one external team confirmed building against the release or RC.

### Milestone 5: Adoption

- **Estimated Delivery:** After acceptance of audited 1.0
- **Deliverables and value evidence:** Verified MainNet production adoption by one qualifying company earns 750,000 CC. Adoption by two qualifying companies earns 1,400,000 CC in total, including the first-company payment.

At least one qualifying company must be independent of BitDynamics. Its production application must depend on the audited package and exercise U256, FullMath, or fixed-point operations in a core MainNet workflow—not merely list the DAR. Evidence will be a committee-checkable dependency/transaction path or a Canton Foundation-confirmed confidential attestation.

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion by the specified milestone deliverables, demonstrated functionality and operational readiness, documentation and knowledge transfer, and alignment with the stated ecosystem-value metrics. Project-specific acceptance requires each future deliverable to be published at an immutable source tag, reproducible through CI, and supported by the required evidence:

- **M1:** the core DAR is consumable through `data-dependencies`; public safe functions are total for canonical and malformed publicly constructible inputs; arithmetic and dual-divider corpora pass; and every limb-arithmetic intermediate appears in the published bound table.
- **M2:** FullMath, both square roots, conversions, and fixed-point APIs pass independent vectors across zero, maxima, overflow, invalid representation/range, exact/remainder, and both rounding directions. Q64.96 explicitly accepts `2^160 − 1` raw, rejects `2^160`, accepts integer `2^64 − 1`, and rejects integer `2^64`.
- **M3:** the reference CLMM DAR demonstrates the lower layers; independent tick/price/swap parity, mutation and reduced-width reports pass; the declared SDK/LF downstream and Java/TypeScript codegen matrix is green; and the reproducible benchmark report is published.
- **M4:** the audit/commit/severity rules below are satisfied; all release artifacts reproduce from the final tag; and one independent external team is confirmed building against the audited release or RC.
- **M5:** one qualifying company yields 750,000 CC and two yield 1,400,000 CC in total, based on the production and independence evidence above.

### Exact Future Audit Scope

The future M4 audit opinion will cover every production source file in the **`daml-u256` core and fixed-point DAR**:

- `u256-impl/daml/U256.daml`
- `u256-impl/daml/U256/Internal.daml`
- `u256-impl/daml/U256/Convert.daml`
- `u256-impl/daml/U256/FullMath.daml`
- `u256-impl/daml/U256/Sqrt.daml`
- `u256-impl/daml/U256/Q64x96.daml`
- `u256-impl/daml/U256/Q128x128.daml`

The review will cover canonical representation and untrusted-input validation; checked/result/aborting/wrapping semantics; carry, borrow, multiplication, both division algorithms and correction paths; comparison, shifts, bitwise emulation, codecs and conversions; 512-bit product/division and modular behavior; both square roots; Q64.96/Q128.128 width, overflow and rounding; serialized shape; and public error behavior. Tests, generators, CI, `SPEC.md`, `AUDIT.md`, `MIGRATION.md`, and independent references will be supplied as assurance evidence, but the audit opinion applies to the production files above.

The opinion will explicitly exclude `daml-u256-clmm`, examples and consumer applications, protocol economics, pool/position state machines, Daml compiler/runtime correctness, Canton participant/node software, and future `daml-i256`. Any statement that CLMM itself is audited will require a separately quoted scope and committee approval.

At M3 completion, BitDynamics will create immutable tag `v1.0.0-rc1`. The audit statement of work and initial report will identify its full 40-character Git commit SHA, source-tree hash, SDK/LF targets, and candidate DAR package IDs. Remediation changes will be separate commits and returned to the auditor. The final report or addendum must identify the final remediated SHA and closed findings; public tag `v1.0.0` must resolve exactly to that auditor-reviewed SHA.

There may be no unresolved Critical or High findings. A Medium finding must be fixed and retested or explicitly accepted by the committee with published impact and mitigation. Low/Informational findings may remain only when documented with an owner and disposition. Any finding capable of producing an incorrect arithmetic result, accepting a non-canonical value, violating a stated bound, or bypassing an overflow, width, or rounding rule will block release regardless of vendor severity. Any post-retest change to in-scope code, dependencies, generated constants, SDK/LF target, serialized interface, or security-relevant build configuration will require auditor delta review before the release may be described as audited.

Before fieldwork, the statement of work will reproduce the in-scope file list, exclusions, frozen commit, SDK/LF targets, expected review effort, report format, included remediation retest, and disclosure terms. Audit kickoff will cover the threat model, public trust boundaries, arithmetic claims, package-consumer assumptions, and the evidence map. Each substantive finding will identify the affected function or invariant, triggering input or reproducer where feasible, consequence, severity rationale, and disposition.

BitDynamics will maintain a finding-to-commit remediation ledger. The auditor will retest the final candidate rather than close findings from written explanations alone. The public final report or addendum will state the methodology and limitations, initial and final commit SHAs, reviewed SDK/LF targets and package IDs, and the disposition of every finding. An `AUDIT_STATUS.md` beside the release will state plainly that the opinion covers the core and fixed-point DAR and excludes the CLMM reference DAR.

---

## Funding

**Total Funding Request:** 2,200,000 CC for build and adoption (Milestones 1–3 and 5), plus the independent external audit (Milestone 4) at cost — quoted from the selected partner (Halborn or Quantstamp) and submitted for committee approval before the engagement begins.

### Funding Rationale

Payment tracks value to the network. The build is paid on inspectable milestone delivery; M4 is a separately funded audit pass-through; and most fixed funding is contingent on independent MainNet adoption.

- **Build (M1–M3): 800,000 CC** — core arithmetic, DeFi math, reference CLMM, verification, documentation, and benchmarks.
- **Independent audit (M4): at cost (TBD)** — the selected vendor's accepted quotation, approved before engagement.
- **Adoption (M5): up to 1,400,000 CC** — 750,000 CC for the first qualifying MainNet adopter and an additional 650,000 CC after a second qualifying adopter, for 1,400,000 CC in total. At 63.6% of the fixed ask, the majority is outcome-contingent.

### Payment Breakdown by Milestone

- M1: 200,000 CC upon committee acceptance
- M2: 300,000 CC upon committee acceptance
- M3: 300,000 CC upon committee acceptance
- M4: accepted audit cost, paid on publication of the report and acceptance of audited 1.0
- M5: 750,000 CC for one qualifying company; 1,400,000 CC in total for two

### Volatility Stipulation

The project, including maintenance and adoption, exceeds six months. Funding is denominated in fixed CC and **may be re-evaluated at the six-month mark** under the fund's volatility policy.

---

## Co-Marketing

BitDynamics will coordinate the public and audited-release announcements with the Canton Foundation; publish one technical write-up, developer walkthrough, worked examples, audit report, and release notes; and participate in Foundation-facilitated introductions to prospective M5 integrators.

---

## Motivation

### The arithmetic gap

Daml `Numeric n` is a 38-digit base-10 fixed-point type: ordinary decimal values such as `1500 × 1500` fit. The missing capability is exact fixed-width binary-integer behavior:

| Requirement | Why `Numeric` cannot serve it |
| --- | --- |
| Raw values through `2^256 − 1` (approximately `1.16 × 10^77`) | Exceeds the 38-digit domain |
| EVM floor, wrapping, shifts, masks, packing, `MULMOD`/`ADDMOD` | Decimal scaling has no equivalent fixed-width bit semantics |
| Q64.96/Q128.128 | Exact binary fractions and raw encodings are not decimal values |
| Full-domain `floor(a × b / d)` | The exact product may require up to 512 bits before division |

`Numeric` remains correct for settlement and display; U256 is the raw-integer layer beneath it. The same limitation is visible in oracle integration material that decodes unsigned hex into Decimal and identifies wider signed report fields as unrepresentable. `daml-u256` deliberately covers unsigned values; signed two's-complement behavior belongs in a future companion library.

### Existing alternatives

Chainlink's Canton `/contracts` code contains narrow base-10 limb `mulDiv` helpers and is BUSL-1.1 licensed; other parts of its mixed-license repository are MIT. RedStone's BUSL-licensed connector contains partial byte-limb addition, halving, and comparison, but no general multiplication, division, square root, or full-domain `mulDiv`. Chainlink's separate MIT Data Streams verifier contains no general U256 arithmetic. These are appropriate vendor utilities but not an Apache-compatible, general-purpose library base.

The upstream [native U256 request](https://github.com/digital-asset/daml/issues/22827) is unscheduled. A library addresses teams' nearer-term need and will provide a migration/deprecation path if a native primitive ships.

### Ecosystem benefit

AMM, CLMM, lending, EVM-bridge, and oracle-consuming applications are plausible consumers, but the proposal does not treat demand as proven. M5 makes the adoption claim falsifiable: payment requires one or two companies to exercise the audited package in a core Canton MainNet workflow, with at least one company independent of BitDynamics. Shared audited arithmetic can then replace multiple private implementations and repeated security review.

---

## Rationale

`BigNumeric` was never suitable for serializable fixed-width ledger state and does not provide U256 wrapping, bit, cost, or compatibility semantics. Waiting for native support has an uncertain schedule; if it arrives, migration is preferable to maintaining redundant infrastructure. Per-project emulation repeats audit cost, while off-ledger math is useful for some applications but cannot replace transparent on-ledger protocol arithmetic in every design. Nine 30-bit limbs, bounded row-wise multiplication, dual dividers, and independently checked rounding provide a compact audit surface; the separate CLMM package demonstrates relevance without expanding the audited core into a protocol.
