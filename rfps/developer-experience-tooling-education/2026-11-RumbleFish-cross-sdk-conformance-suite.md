## Development Fund Proposal

**Organization:** Rumble Fish Poland Sp. z o.o.  
**Author / Primary Contact:** Marek Kowalski (CTO)  
**Status:** Submitted  
**Created:** 2026-11-25  
**Proposal Type:** RFP-aligned  
**RFP / Roadmap Area:** Developer Experience, Tooling & Education: RFP 17, SDKs in different languages; RFP 18, Integration into SDLCs  
**Champion:** `Needs Champion`  
**Total Funding Request:** 1,931,000 CC  
**Project Duration:** about 17 months (build by month 5, adoption by month 12, maintenance for 12 months after Milestone 3)  
**Label:** canton-apis  

---

## Abstract
RFP 17 asks every SDK to follow the [Ledger Client Standard](https://github.com/canton-network/cf-docs/blob/b9b0f9a94aa41519954950f3be741f5bc5b3d6d7/docs-main/sdks-tools/language-bindings/client-standard.mdx). Today there is no shared way to check that: Nodejumper's
Rust SDK grant ([#407](https://github.com/canton-foundation/canton-dev-fund/pull/407)) plans its own conformance suite against the Standard, and Noders' Go SDK grant ([#38](https://github.com/canton-foundation/canton-dev-fund/pull/38))
and Peaceful Studio's C# SDK grant ([#46](https://github.com/canton-foundation/canton-dev-fund/pull/46)) plan their own integration tests, so the results cannot be compared. We
propose one open, language-neutral conformance suite. It runs the same 112 cases against 6 SDKs on a pinned LocalNet,
compares every result with the raw JSON Ledger API, and publishes a 6-SDK matrix keyed to the Standard's row IDs. Of
its 90 rows, the grant tests 56 against a live ledger and reviews 10 (codegen and documentation) by hand. The other 24
are deferred or not yet final; see Specification. It serves two RFPs: RFP 17 asks SDKs to include tests and to show
how they stay compatible as Canton evolves, and RFP 18 asks for testing frameworks and CI tooling for Canton
development.

---

## Specification

### 1. Objective
Give SDK maintainers, the Standard's owners and application teams one public, repeatable answer to "does SDK X
implement row Y correctly on Canton version Z?".

### 2. Implementation Mechanics
- **Scenarios.** Each scenario is a YAML file with its cases, the Standard rows it checks and its known divergences,
  linked to their findings. The runner executes one test per case and SDK, and CI fails on new failures and on fixes
  nobody recorded.
- **Adapters.** Each SDK gets one executable that speaks a JSON-lines driver protocol over stdin/stdout. Adding an
  SDK means writing its adapter and registering it; the scenarios and the runner stay the same.
- **Oracle.** A reference adapter calls the JSON Ledger API v2 directly. Signing cases use the
  [hash vectors](https://github.com/canton-network/wallet/tree/main/core/tx-hashing/vectors) that FTP built and
  published in DA's wallet repo under its "Verify before sign" grant ([#617](https://github.com/canton-foundation/canton-dev-fund/pull/617)). A fault-injection proxy and a fake
  participant cover retries, de-duplication and signing.
- **Verdicts.** pass, fail (wrong result), diverges (correct but different), or unsupported (valid, not a
  failure). CI runs the matrix against one pinned Canton/Splice version and publishes it.
- **Not in this grant.** 20 Required rows need infrastructure: a gRPC Admin API oracle
  (the 12 Topology rows and decentralized party creation), a second synchronizer (4 multi-synchronizer rows) and
  traffic charging on LocalNet (3 Traffic rows). The matrix marks them "not tested in this grant", and M3
  delivers a plan for covering them.

### 3. Architectural Alignment
- Rows come from the Ledger Client Standard as published in `canton-network/cf-docs`
  ([`client-standard.mdx`](https://github.com/canton-network/cf-docs/blob/b9b0f9a94aa41519954950f3be741f5bc5b3d6d7/docs-main/sdks-tools/language-bindings/client-standard.mdx), 90 rows, Canton 3.5). The Standard has no row IDs, so we derive them from section
  and row names (`section__row`, e.g. `basic_infrastructure__retry_logic`) and keep all 90 in a
  machine-readable `capabilities.yaml`. Every scenario is tagged with these IDs.
- Row IDs follow the `section__row` convention of the Rust SDK's
  [`capabilities.toml`](https://github.com/nodejumper-org/canton-rust-sdk/blob/v0.3.2/conformance/capabilities.toml),
  so its self-claims and our results compare row by row.
- Value cases reuse Peaceful Studio's Apache-2.0
  [`richtypes`](https://github.com/peacefulstudio/canton-dotnet-sdk/tree/ca748b9/conformance/richtypes)
  package from their C# SDK grant, pinned and credited. Our own small package adds only the templates the
  scenarios need (retries, de-duplication, ACS completeness).

### 4. Backward Compatibility
*No backward compatibility impact.* The suite only reads SDKs and a local network.

### 5. Already built: a prototype (not funded by this grant)
Before writing this proposal we built a prototype to test two things: whether one runner with a thin adapter per SDK
works across languages, and whether it finds real divergences. It covers DA's TypeScript wallet SDK and Nodejumper's
Rust SDK: 24 published cases covering 15 of the 56 rows tested in this grant, run on a Canton 3.7.3 LocalNet
([rumblefishdev/canton-client-conformance](https://github.com/rumblefishdev/canton-client-conformance), Apache-2.0).

The result went beyond what we expected. Besides minor differences, it found problems that silently lose data
or break documented behaviour (see Motivation). We reported them to the maintainers, and one is already fixed. This grant does not pay for that work.
The same repository becomes the grant's repository at M1.

---

## Milestones and Deliverables

### Milestone 1: Core rows, 6 adapters, public CI
- **Committed Date:** estimate month 3, hard deadline month 4
- **Focus:** the core of the Ledger Client Standard: its 46 rows (requirements) in the Basic infrastructure,
  Commands, Streams, Parties and Packages sections
- **Deliverables / Value Metrics:**
  - Two cases for each of the 46 rows (92). 69 of them are new, because the prototype covers only 15 of these rows.
  - Divergences are filed upstream with a repro as soon as they are found, from M1 onwards.
  - Adapters for C#, Go, Rust (Zenith) and Python; TS and Rust (Nodejumper) extended. Python is tested
    through dazl's generated v2 client (its hand-written client is Canton 2.x only), so many Python results will be
    "unsupported".
  - Results for the 46 rows across all 6 SDKs, published as a public CI matrix.
  - Effort: 836 person-hours.

### Milestone 2: Application rows and SDK review
- **Committed Date:** estimate month 3.5, hard deadline month 5
- **Focus:** the application-level part of the Ledger Client Standard: its 10 rows (requirements) in the Token
  Standard and User sections, plus listing synchronizers from the multi-synchronizer section
- **Deliverables / Value Metrics:**
  - 20 new cases, on a LocalNet with a Token Standard registry and funded parties.
  - Written review of the 10 codegen and documentation rows for all 6 SDKs.
  - Effort: 150 person-hours.

### Milestone 3: Findings upstream and adapter guide
- **Committed Date:** estimate month 4.5, hard deadline month 6
- **Focus:** Hand results to maintainers
- **Deliverables / Value Metrics:**
  - A final triage pass: every divergence found in M1 and M2 is checked against the reference adapter and the API
    specs, and any not yet filed upstream is filed with a repro.
  - A guide that lets an SDK team add its own adapter.
  - A plan for the 20 deferred rows: Admin API oracle, multi-synchronizer LocalNet, traffic.
  - Effort: 220 person-hours.

### Milestone 4: Adoption
- **Committed Date:** hard deadline month 12. The gates depend on other teams' review and release cycles, so the
  window is longer than the build milestones' (FTP's "Verify before sign" grant allows up to 18 months).
- **Focus:** The suite is used outside our team
- **Deliverables / Value Metrics:** SDK teams merge a CI job that runs the suite (up to 3 teams), and maintainers
  confirm 10, then 20, findings. Details under Acceptance Criteria and Funding.

### Maintenance: 12 months after Milestone 3
About 20 h/month. Covers each Canton minor release, SDK releases that break an adapter, and triage of new
divergences. Paid quarterly in arrears. Rumble Fish remains the maintainer.

---

## Acceptance Criteria
- **M1–M3:** M1 and M2 are accepted when their cases run in public CI against all 6 SDKs and design partners (below)
  have checked the results for their SDK. M3 is accepted when every divergence has an upstream issue with a repro and
  the adapter guide is published.
- **If an SDK stops being maintained:** it can be replaced by another Canton client SDK with the Committee's
  agreement, with no change to the milestone payments.
- **M4:** the adoption gates listed under Milestone 4, each verified by the Committee.
- **Design partners:** the maintainers of the SDKs we have already reported findings to (DA's wallet SDK, Nodejumper's
  Rust SDK) are invited to review results for their SDK in this PR.

---

## Funding

**Total Funding Request:** 1,931,000 CC (at $0.0744/CC, the CoinGecko price on 2026-11-25, about $144k; $100/h for
about 1,436 h)

### Payment Breakdown by Milestone
- Milestone 1 (Core rows, 6 adapters, public CI): 564,000 CC upon Committee acceptance
- Milestone 2 (Application rows and SDK review): 101,000 CC upon Committee acceptance
- Milestone 3 (Findings upstream and adapter guide): 148,000 CC upon Committee acceptance
- Milestone 4 (Adoption), up to 806,000 CC, each part paid when the Committee has verified its gate:
  - 186,000 CC per SDK team that merges a CI job running the suite into its default branch, up to 3 teams
    (558,000 CC).
  - 124,000 CC when at least 10 findings are confirmed by maintainers, and 124,000 CC more at 20.
- Maintenance: 4 × 78,000 CC, quarterly in arrears, each against a short report of the Canton and SDK releases
  covered and the adapters fixed.

About half of the non-maintenance budget depends on adoption.

### Effort
| Work | Basis | Hours | Milestone |
|---|---|---:|---|
| New test cases (89) | 4 h each | 356 | M1 276, M2 80 |
| Adapters for 4 new SDKs | 80 h each | 320 | M1 |
| Extend the TypeScript and Rust adapters | 40 h each | 80 | M1 |
| CI on LocalNet and the public report | estimate | 120 | M1 |
| Test Daml package for the new scenarios | estimate | 40 | M1 |
| Token Standard setup on LocalNet | estimate | 40 | M2 |
| Hand review of the 10 codegen and documentation rows | 5 h per SDK | 30 | M2 |
| Triage and file about 40 divergences | 4 h each | 160 | M3 (spent from M1 onwards) |
| Adapter guide | estimate | 40 | M3 |
| Plan for the 20 deferred rows | estimate | 20 | M3 |
| **Build** | | **1,206** | M1 836, M2 150, M3 220 |
| Maintenance, 12 months | about 20 h/month | 230 | quarterly |

The unit costs come from the prototype. The divergence count applies the prototype's rate (4 problems in 69 results)
to the 672 results of the full suite. Two engineers at about 140 h/month each finish the build in under 5 months.

### Volatility Stipulation
The project duration is greater than 6 months. The grant is denominated in fixed Canton Coin. Rumble Fish may request
a re-evaluation of the remaining milestones, including maintenance, at month 9. The trigger is a CC price more than 25
percent above or below its price at approval. The Tech & Ops Committee runs the re-evaluation.

---

## Co-Marketing
- A post with the Foundation when the first full matrix is published.
- A short talk or office hour for SDK maintainers on writing an adapter.

---

## Motivation
- **Many SDKs, no shared check.** The suite covers six SDKs in five languages. This fund already pays for
  client-library work in several grants (among them DA's dApp SDK, the Go, C# and Rust SDKs, and Python codegen), and
  RFP 17 invites more. Each grant brings its own tests, so "conformant" means whatever that SDK's own tests check.
- **The approach finds real problems.** A prototype covering 2 SDKs and 15 of the 56 rows already found issues that a
  capability checklist would miss: the TypeScript SDK's "read until complete" call returns no contracts when a
  template's party field is not named `owner`
  ([canton-network/wallet#3035](https://github.com/canton-network/wallet/issues/3035)), and its retry logic never fires
  on the JSON Ledger API ([canton-network/wallet#2682](https://github.com/canton-network/wallet/issues/2682), confirmed
  live by the prototype). Nodejumper's Rust SDK did not bind a requested deadline into the signature under its
  default hashing scheme; the maintainer fixed it in v0.3.3 a week after our report
  ([nodejumper-org/canton-rust-sdk#26](https://github.com/nodejumper-org/canton-rust-sdk/issues/26)).
  Testing all 56 rows on 6 SDKs is likely to find more; at the prototype's rate we expect about 40 divergences.
- **Agreement is evidence too.** In the prototype, both SDKs return byte-identical values on a 21-field round-trip and
  compute the participant's hash for 83 of 83 valid transactions.
- **Who benefits:** application teams choosing an SDK, SDK maintainers (regression tests against an oracle),
  and the Standard's owners (evidence per row).

---

## Rationale
- **Extends, not replaces.** The suite consumes the Standard, the hash vectors from FTP's "Verify before sign" grant
  and Peaceful Studio's test DARs. It ships no SDK and no hashing library. FTP's grant delivers the hashing package
  and its test vectors; this suite runs those vectors against every SDK's signing path. SDK grants that promise
  conformance tests, such as Nodejumper's Rust SDK grant, can run against it instead of building their own.
- **Not the same as DA's CIP-103 conformance suite.** DA's
  [CIP-103 conformance CLI](https://github.com/canton-network/wallet/tree/main/tools/conformance-cli) tests wallets
  against the dApp API. This suite tests client SDKs against the Ledger Client Standard.
- **Alternative considered: each SDK publishes self-attested conformance** (the Rust SDK's `capabilities.toml`
  does this). It is cheap but not comparable across SDKs, and it cannot detect wrong results. The two approaches
  combine: our results can confirm or contest each self-claim.
- **Cost:** 1,931,000 CC for 6 SDKs, about $100/h at $0.0744/CC. For comparison, Noders' Go SDK grant asked 2,260,000 CC
  for about 2,390 h, about $139/h at the CC price on its merge date ($0.147). The CC price has fallen since, so
  compare in USD.
