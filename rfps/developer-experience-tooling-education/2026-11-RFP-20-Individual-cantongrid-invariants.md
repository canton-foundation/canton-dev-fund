## Development Fund Proposal

**Organization:** Individual  
**Author / Primary Contact:** kunal171 (GitHub)  
**Status:** Submitted  
**Created:** 2026-11-27  
**Proposal Type:** RFP-aligned  
**RFP / Roadmap Area:** RFP 20, Indexers (Developer Experience, Tooling & Education)  
**Champion:** `Needs Champion`  
**Total Funding Request:** 897,000 CC (about USD 80,000 at the reference rate below)  
**Project Duration:** 12 weeks of delivery (M1 to M3), with the adoption milestone (M4) due by month 6  
**Label:** canton-apis  

---

## Abstract

Canton applications keep their state across many contracts: reserves and
positions, collateral and loans, escrowed orders, fee pools and their shares.
When those contracts drift apart, for example because a reserve no longer covers
the outstanding positions, nothing on the participant reports it. Today a team
finds out by writing its own SQL against PQS, or not at all.

This grant funds **CantonGrid Invariants**: open-source, developer-defined
financial reconciliation checks over an application's own authorized contracts,
with SDKs for Rust, JavaScript and TypeScript.

- **Policies.** A team writes a versioned policy such as "for each market, the
  reserve's complete sets equal the positions held plus the positions escrowed
  in open sell orders", or "for each asset, collateral is at least 150% of the
  loans it backs".
- **Financial layer.** Quantities are exact and tied to their asset. Two assets
  are never added together, a ratio is checked without division, and any
  rounding tolerance must be declared and is reported.
- **Evaluation.** CantonGrid evaluates the policy exactly, with no floats and no
  silent rounding, over a single consistent snapshot of the participant's indexed
  data. It checks the caller's and the source's current permissions first.
- **Results.** Each check is satisfied (exactly, or within a declared
  tolerance), violated or unavailable, together with what was covered.
- **SDKs.** A Rust crate and one npm package, written in TypeScript and shipped
  as JavaScript with type definitions. They let a team write and validate
  policies, run checks from CI or a backend, and check a report's digest,
  without handling money as floating-point numbers.

Missing data is never treated as zero, and incomplete coverage never produces
an all-clear.

**What the grant does not fund.** It does not pay for general indexing,
document queries, new typed GraphQL schema generation, Scan, a stateful runtime,
Ledger API or wallet SDKs, prices or valuation, or accounting workflows. Section 3 shows how this
complements Canton Index (#319), PQS (#67), the Rust SDK (#407) and the
Noves subledger (#970), rather than duplicating them.

---

## Specification

### 1. Objective

The objective is to give Canton application teams and operators a shared, exact
and privacy-preserving way to answer one question: **do my application's
contracts still add up, asset by asset, right now, and how much of the data
could the check actually see?**

The deliverables are:

- a policy engine with a financial reconciliation layer;
- an indexed evaluation API;
- a library of reusable financial policies;
- reproducible check reports;
- SDKs for Rust, JavaScript and TypeScript.

They are built on CantonGrid's existing read-only PQS ingestion, and tested on
LocalNet and on an authorized DevNet or TestNet participant.

### 2. Implementation Mechanics

**Already built and not funded by this grant.** CantonGrid is Apache-2.0
([repository](https://github.com/kunal171/cantongrid)). 0.4.0 (stable) and
0.5.0-alpha.1 are on crates.io. 0.5.0-alpha.2, which adds the REST and GraphQL
reconciliation API and its LocalNet acceptance, is tagged on GitHub.

The table lists what is already built:

| Area | Behaviour today | Evidence |
| --- | --- | --- |
| Source | Read-only paging of PQS `active`, `creates` and `archives` through a SELECT-only role, with explicit offset bounds. Pruned or regressed bounds stop progress; history is never invented. | LocalNet |
| Authorization | Current Ledger API rights of the source user, and every API caller's current grants. Grouped reads require the caller to cover the full party scope, so hidden membership cannot be inferred. | Owned PostgreSQL and LocalNet |
| Per-contract policies | A strict policy grammar, exact arithmetic, fingerprints, and a model-schema preflight. Indexed checks run over one repeatable-read snapshot, with projection drift detection and fail-closed limits. Operator-pinned REST and GraphQL. | Owned PostgreSQL; 7 retained LocalNet contracts |

These features predate the proposal and are documented with their evidence
level in [`docs/verification.md`](https://github.com/kunal171/cantongrid/blob/v0.5.0-alpha.2/docs/verification.md). The grant builds on them and does not fund them.
CantonGrid has no SDK today; its API is used directly over HTTP.

**What this grant adds:**

1. **Cross-contract and cross-model invariants.** A version 2 policy declares:
   - 1–4 inputs, each a model over one template;
   - a typed group key shared by every input (for example the market key);
   - count and sum measures;
   - per-input cardinality: `any`, `at_least_one` or `exactly_one`;
   - checks that compare measures and derived fields.

   It follows these rules:
   - an empty group's sum is *absent*, never 0, unless the policy says otherwise;
   - two inputs cannot select the same template, which blocks double counting;
   - every limit is a hard budget, and going over it gives `unavailable`;
   - version 1 policies are unchanged.
2. **Financial reconciliation layer.** These rules apply to every measure and
   check:
   - **Asset-scoped quantities.** Every sum declares its asset or unit, either as
     a constant or taken from a group field such as an instrument ID. One policy
     can then check many assets, one group per asset. Measures in different
     assets cannot be added or compared; the compiler rejects the policy.
   - **Exact amounts.** Daml `Numeric` values keep their declared scale, with no
     implicit rescaling. `Int64` sums widen safely. An overflow gives
     `unavailable`, never a wrapped or rounded total.
   - **Directional checks.** A check can be `=`, `≥` or `≤`, so "backing covers
     liabilities" is a check in its own right, not an equality with a tolerance.
   - **Ratios without division.** A requirement such as "collateral ≥ 150% of
     debt" is evaluated as `collateral × 100 ≥ debt × 150`, in exact integers or
     decimals.
   - **Declared rounding tolerance.** The default is zero. A policy may declare
     a tolerance as an exact amount in the measure's own asset and scale, such as
     one smallest unit for a pro-rata fee split, up to a fixed maximum. The
     tolerance is part of the policy fingerprint. Reports count groups that pass
     exactly separately from groups that pass only within the tolerance.
   - **No prices, FX or valuation.** Nothing is converted between assets, so a
     check never depends on a price feed.
3. **One evaluation path.** Offline fixtures and indexed reads run the same Rust
   grouping and arithmetic. SQL only selects and verifies inputs. All inputs are
   read in one snapshot at one completed source boundary, with each input's
   active model revision pinned. Leases and grants are rechecked before and after
   the read.
4. **Indexed API.** The existing operator-pinned REST and GraphQL endpoints gain
   version 2 policies through additive fields. The existing guards stay:
   authentication before lookup, full scope before name resolution, and final
   delivery checks.
5. **Financial policy library.** Each template documents its assumptions,
   required fields, assets, tolerance and counterexamples:
   - **backing and coverage:** reserves ≥ liabilities, per asset;
   - **collateral ratio:** collateral ≥ a declared ratio of the debt it backs;
   - **supply conservation:** minted − burned = outstanding holdings;
   - **balance partition:** free + locked = total;
   - **escrow coverage:** locked funds = what open orders require;
   - **settlement balance:** buy notional = sell notional + fees;
   - **fee allocation:** the platform share plus the operator share equals the
     fee pool, within a declared rounding tolerance;
   - **reference mapping:** binary supply conservation on Outcomia's Canton
     contracts (`MarketReserve`, `PositionLot`, `LimitOrder`).
6. **Reproducible check reports.** A versioned, canonically serialized report with
   a digest. It binds the policy, model and source identity, an opaque boundary
   handle, the coverage and the results.
   - A `verify` command recomputes the report from the same retained inputs and
     confirms the digest.
   - Operator-only findings say which groups failed and by how much, for example
     the shortfall in the asset's own units, with redaction and revocation.
   - A digest proves the report was not altered. It does not prove solvency or
     compliance, and the report says so.
7. **SDKs for Rust, JavaScript and TypeScript.** They cover the invariant API
   only:
   - **Rust crate (`cantongrid-sdk`, proposed name).**
     - Policy builders and validation, using the engine's own compiler, so errors
       match the server exactly.
     - Offline evaluation over fixtures, for tests and CI.
     - A typed REST and GraphQL client.
     - Report digest checking.
   - **npm package (proposed name `@cantongrid/sdk`).**
     - Written in TypeScript and shipped as JavaScript (ESM and CommonJS) with
       type definitions. It works in Node.js and in browsers.
     - Typed policy builders and validation against the published version 2 JSON
       Schema.
     - A typed REST and GraphQL client.
     - Report digest checking.
   - **Money is never a JavaScript `number`.** Amounts travel as exact decimal
     strings and are compared as scaled `bigint`s, with no new runtime
     dependency.
   - **No shortcut to "all clear".** A result is a typed union of satisfied,
     satisfied within tolerance, violated and unavailable. Nothing collapses it
     into a boolean that could read `unavailable` as a pass.
   - **No extra access.** The SDKs call the same guarded API with the caller's
     own credentials. The guides say to keep operator credentials on the server.
   - **Kept in step with the API.** Shared conformance vectors make both SDKs
     produce the same validation errors, decimal parsing and report digests as
     the server. Types are generated from the published API schema, and CI fails
     on drift.
8. **Remote evidence.** The full flow is run and recorded on an authorized DevNet
   or TestNet participant, kept separate from LocalNet evidence.

### 3. Architectural Alignment

**RFP 20 requirements:**

| RFP 20 asks | CantonGrid Invariants |
| --- | --- |
| Which data it requires | Active contracts of the templates named in the operator's policies, for the parties the source user is authorized to read |
| Node-local, application-provided or public | Node-local: the operator's own PQS and Ledger API (read-only). Policies are provided by the application. Nothing comes from the public network, including prices. |
| Behaviour if involved-party metadata stops being public | No change. It never uses Mediator or other protocol metadata. |
| Privacy, access control, selective disclosure | <ul><li>The source user's current rights bound the input.</li><li>Every evaluation requires the caller to cover the policy's full party scope; partial visibility never becomes a partial total.</li><li>Reports contain counts and identities only, with no payloads, contract IDs, offsets or amounts.</li><li>Group-level findings, including shortfall amounts, are operator-only and revocable.</li><li>The SDKs get no access the caller doesn't already have.</li></ul> |

RFP 20 names "reporting" and "auditability" as goals. This proposal provides the
checking and evidence part of that.

**Relationship to funded and proposed work.** This is the boundary we commit to.

| Project | What it does | How this proposal relates |
| --- | --- | --- |
| **PQS (#67)** | Participant-local source of ledger data | Read-only consumer through its documented SQL functions. No PQS changes, schema migrations or writes. |
| **Canton Index (#319)** | Phase 1 (funded): `jq`-style filters into JSONB documents, plus a document query API. Roadmap: Phase 2 Scan connector, Phase 3 stateful WASM runtime with roll-ups and cross-template joins, Phase 4 typed GraphQL. | **No overlap in funded scope.** <ul><li>This grant builds none of Canton Index's phases: no document query API, no Scan connector, no WASM runtime, no general aggregation layer, no new typed GraphQL schema generation.</li><li>Its deliverables are invariant semantics, coverage evidence and reports, which Canton Index's phases do not include.</li><li>The SDKs are clients for the invariant API only, not general typed query clients over contracts.</li><li>The policy format is source-neutral. M2 publishes an example that runs a policy offline over Canton Index documents, labelled "coverage unverified", so Canton Index users can use the policy library.</li><li>If Canton Index's Phase 3 ships entities, a source adapter for them is a natural follow-up. We will coordinate with InfraDAO rather than build a competing runtime.</li></ul> |
| **Noves Canton Subledger (#970, open)** | For finance teams: Canton Coin and CIP-0056/CIP-0112 token holdings reconciled against booked balances, USD journals, period close, auditor evidence packages with digests, accounting exports | **Different users and questions.** <ul><li>Noves answers "do our books match our holdings?" for a holder's finance team.</li><li>This proposal answers "do this application's contracts agree with each other, asset by asset?" for the team that builds or operates the application.</li><li>"Financial reconciliation" here means consistency between an application's own contracts, such as reserves, positions and escrow, in each asset's own units. Nothing is valued in USD or any other currency, and token holdings and Canton Coin activity are not modelled.</li><li>No journals, periods, prices, valuation or accounting exports are in scope.</li><li>Both produce digest-checked outputs, but for different records. The two can run side by side.</li></ul> |
| **RFP 17 SDKs: Rust SDK (#407), the dApp and Wallet SDKs (`canton-network/wallet`)** | Clients for the Ledger API and for wallets: submitting commands, reading the ledger, connecting dApps | **Not rebuilt, and not an RFP 17 SDK.** <ul><li>The CantonGrid SDKs never talk to the Ledger API or a wallet, and submit nothing.</li><li>They call only CantonGrid's invariant API and run its policy compiler, so the ledger client standard does not apply to them.</li><li>A team can use both.</li></ul> |
| **Daml Shell (#752), DPM Trace (#327)** | Interactive PQS investigation, transaction tracing | Not in scope. Invariant reports may link to these tools for investigation. |

**Other components:**

- **Ledger API:** read-only, used only to check current user rights.
- **CIPs:** policies operate on the DAR's own types. Nothing is special-cased for
  any one application.

### 4. Backward Compatibility

No impact on the network or on other projects. Within CantonGrid:

- version 1 policies, fingerprints, manifests and API responses are unchanged;
- version 2 is additive;
- the only planned owned-destination migration is for stored reports (M3). It is
  explicit and checksummed, with backup-based rollback documented;
- PQS is never migrated or written to;
- the SDKs are new packages under semantic versioning. Each states which API
  versions it supports, and API changes stay additive within a major version.

---

## Milestones and Deliverables

### Milestone 1: Policy engine, financial layer and Rust SDK preview

- **Committed Date:** Week 4 after approval
- **Focus:** Version 2 grammar, financial rules, offline grouped evaluator,
  multi-model preflight, CLI, Rust SDK preview
- **Deliverables / Value Metrics:**
  - A published semantics document covering grouping, absent versus zero,
    cardinality, assets and units, scale, directional and ratio checks, declared
    tolerance, double counting and budgets.
  - The version 2 compiler and exact evaluator, with fixture tests:
    - values above 2^53 and last-digit differences;
    - sum overflow and ratio cross-multiplication overflow;
    - scale and asset mismatch;
    - tolerance edges: exactly at, just over, and zero tolerance;
    - empty, absent and cardinality cases;
    - budget edges;
    - a version 1 regression suite.
  - A multi-model preflight that binds every model identity.
  - A prerelease on crates.io, including a preview of the Rust SDK with policy
    builders, validation and offline evaluation.
  - **Value metric:** the semantics document is reviewed by a member of the
    Canton APIs SIG or a PQS maintainer, and their feedback is addressed in the
    repository.

### Milestone 2: Indexed evaluation, financial policy library and JS/TS SDK

- **Committed Date:** Week 8 after approval
- **Focus:** Snapshot reads across several inputs, API, financial policies,
  SDK clients, LocalNet acceptance
- **Deliverables / Value Metrics:**
  - Indexed evaluation of version 2 policies over one snapshot. Owned PostgreSQL
    tests cover:
    - concurrent ingestion and model promotion;
    - missing, extra, archived and filtered contracts;
    - many assets in one policy, kept separate;
    - pruned or partial coverage;
    - lease and caller revocation;
    - narrow-scope denial that is the same with or without hidden data.
  - REST and GraphQL support, with equal results on both.
  - The seven financial policy templates plus the Outcomia reference mapping,
    each with documented assumptions, tolerance and counterexamples.
  - The Rust SDK API client and a prerelease of the npm package (JavaScript and
    TypeScript), with:
    - typed policy builders and JSON Schema validation;
    - REST and GraphQL clients;
    - exact decimal handling;
    - shared conformance vectors that pass in Rust, Node.js and a browser test
      run.
  - LocalNet acceptance on real application contracts: an independent oracle
    recomputes the same group sums from a Ledger snapshot at the same boundary,
    and a deliberate violation is detected and then restored. The acceptance
    script uses the SDKs.
  - An offline example running a policy over Canton Index documents.
  - **Value metric:** the LocalNet acceptance scripts are reproduced by someone
    other than the author, and the result is reported in a public issue.

### Milestone 3: Reproducible reports, stable SDKs and remote evidence

- **Committed Date:** Week 12 after approval
- **Focus:** Report format, digest and verification, operator findings, SDK
  releases, remote run
- **Deliverables / Value Metrics:**
  - A versioned report with canonical serialization and digest, stored in owned
    storage under explicit retention and access rules.
  - `verify`: independent recomputation, with tamper and missing-evidence tests.
  - Operator-only group findings, including the shortfall amount in the asset's
    units, with redaction and revocation tests.
  - Stable releases of the Rust crate and the npm package:
    - report digest checking that matches the server on the conformance vectors;
    - access to operator findings;
    - API reference docs and a quick-start guide for each language;
    - a CI example that fails a build when a policy is violated or unavailable.
  - The full flow (ingestion, a version 2 policy, a report and `verify`) run on an
    authorized DevNet or TestNet participant, with dated evidence recorded
    separately from LocalNet.
  - **Value metric:** the remote evidence and a sample report are published, and
    `verify` and both SDKs reproduce the published digest.

### Milestone 4: Adoption

- **Committed Date:** Month 6 after approval
- **Focus:** External teams checking their own applications
- **Deliverables / Value Metrics:**
  - At least two external teams, not affiliated with the author (validator
    operators or application teams), each running at least one financial
    invariant policy against their own contracts, through the API, CLI or an SDK,
    in development or production.
  - Evidence for each team: a public attestation, a published policy or
    configuration, or a public issue or discussion.
  - One case study written with an adopting team.

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone
- Demonstrated functionality or operational readiness
- Documentation and knowledge transfer provided
- Alignment with stated value metrics

Project-specific conditions:

- **M1** is accepted only if a policy that mixes assets is rejected at compile
  time, and a group outside its declared tolerance is reported as violated.
  Neither may ever pass.
- **M2** is accepted only if every negative case fails closed, with a documented
  code. An incomplete input that yields "satisfied" fails acceptance. The SDKs
  must pass the same conformance vectors as the server.
- **M3** is accepted only with evidence from DevNet or TestNet; LocalNet results
  alone do not count. If an authorized participant cannot be obtained, the author
  will report the blocker. M3 is then not claimed until the evidence exists.
- **M4** is accepted only with evidence from two external teams. The author's own
  applications, including Outcomia, do not count.

---

## Funding

**Total Funding Request:** 897,000 CC

**Reference rate:** USD 0.0892 per CC, the 30-day average on 2026-11-24
(CoinGecko). That makes about USD 80,000. Once approved, the grant is
denominated in fixed CC.

**Effort:** about 540 engineering hours over 12 weeks for M1 to M3. That
includes about 120 hours for the SDKs. Adoption support continues until
month 6.

### Payment Breakdown by Milestone

- Milestone 1 (Policy engine, financial layer and Rust SDK preview): 179,400 CC upon committee acceptance
- Milestone 2 (Indexed evaluation, financial policy library and JS/TS SDK): 179,400 CC upon committee acceptance
- Milestone 3 (Reproducible reports, stable SDKs and remote evidence): 179,400 CC upon committee acceptance
- Milestone 4 (Adoption): 358,800 CC upon committee acceptance

Forty percent of the request depends on external adoption.

### Volatility Stipulation

The project duration is 6 months. Should the project timeline extend beyond 6
months due to Committee-requested scope changes, any remaining milestones must
be renegotiated to account for significant USD/CC price volatility.

---

## Co-Marketing

Upon release, the implementing entity will collaborate with the Foundation on:

- Announcement coordination
- A case study or technical blog (the M4 case study)
- Developer or ecosystem promotion

The author will also present the financial policy library and the SDKs to the
Canton APIs SIG after M2.

---

## Motivation

- **Lowest-rated area.** Transaction debugging and observability is the
  lowest-rated area in the Foundation's DevRel surveys: 2.55 in Q1, and 3.26 and
  still tied for lowest in Q2 (2026–2028 strategic roadmap).
- **The cost of failure.** Applications that move value across many contracts
  need more than a way to read them. They need to know when the contracts stop
  agreeing. A reserve that no longer backs its positions, collateral that falls
  below its ratio, or fees that don't add up to their shares is a financial
  incident, not a display bug.

Today every team writes these checks itself, usually as ad hoc SQL or scripts.
These checks:

- use floating-point aggregates, or JavaScript numbers that lose precision above
  2^53;
- treat missing rows as zero;
- add amounts in different assets together;
- ignore which parties' data the query could actually see.

That last point matters on Canton. A check that can see only part of the data
can report "all clear" while hidden contracts disagree. CantonGrid Invariants
makes the checks shared and exact, and makes coverage explicit: an evaluation
that cannot see everything says "unavailable" instead of "satisfied".

CantonGrid is written in Rust, and many Canton application backends and
frontends are written in TypeScript (the roadmap lists both among the existing
Canton SDK languages). SDKs in both languages let teams add these checks to the
code and CI they already have, without reimplementing the decimal and coverage
rules, which is where hand-written checks usually go wrong.

M4 is how this proposal measures whether the benefit is real. The author does
not claim adoption that has not happened yet.

---

## Rationale

**Why not build on Canton Index instead?**

- Canton Index's funded phase is stateless document projection. Its
  aggregation runtime and typed API are future, separately scoped phases.
- Invariant checks need exact typed arithmetic, a single consistent snapshot
  across several templates, and full-scope authorization at evaluation time.
- CantonGrid's existing engine already has these properties, so the grant funds
  only the new invariant layer.
- The policy format is source-neutral, and the M2 example shows it running
  offline over Canton Index documents. That leaves room for a Canton Index source
  adapter once its stateful phase exists, instead of a parallel runtime.

**Why not the Noves subledger?** It reconciles a holder's books against its
holdings, in USD, for accounting. This proposal checks that an application's
contracts agree with each other, in each asset's own units, for the people who
build and run the application. These are different questions, asked by
different people.

**Why a financial layer rather than generic sums?** Generic aggregation gets the
hard cases wrong: absent versus zero, mixed assets, ratios that lose precision
through division, and rounding that is silently accepted. Making these rules
part of the policy language means that every policy in the library, and every
policy a team writes, follows them.

**Why SDKs, and why only for the invariant API?**

- Without SDKs, every team writes its own HTTP client and its own decimal
  handling, and the second is where errors come in.
- The Rust SDK reuses the engine's compiler, and the npm package is checked
  against shared vectors, so a policy that validates locally behaves the same on
  the server.
- Limiting the SDKs to the invariant API keeps them small, and keeps them clear
  of the Ledger API SDKs and Canton Index's typed query plans.

**Why deterministic policies rather than plugins or SQL?**

- Policies are data with a fingerprint, so they can be reviewed, pinned and
  reproduced.
- Arbitrary SQL or code would make results unreproducible and could bypass the
  authorization checks.

**Why "unavailable" instead of best effort?** On a privacy-preserving ledger, a
silently partial check is worse than no check.

**Known limits, stated up front:**

- **Current state only.** Checks cover current active state at a completed
  boundary, not history before the index's first snapshot.
- **Supported field types.** List elements and variant payloads can't be used as
  inputs yet. That rules out some multi-outcome invariants, which are documented
  as gaps.
- **Token Standard holdings.** Interface views, such as CIP-0056 holdings, are
  not supported yet. A check can use a concrete holding template once its DAR is
  indexed. Cash backing held through interfaces is documented as a gap.
- **Assets and units are declared, not proven.** CantonGrid enforces consistency
  between them, but cannot prove that a field really holds a given asset.
- **No valuation.** Checks never compare different assets, so they can't say
  whether a multi-asset portfolio is solvent in total.
- **Credentials in browsers.** The npm package runs in browsers, but operator
  credentials and findings belong on a server. The guides say so.
- **Remote evidence depends on access.** It depends on getting an authorized
  participant (M3).

---

## Sustainability

The author uses CantonGrid as the indexer behind Outcomia, an application on
Canton, and will keep using these checks after the grant.

For 6 months after M4, the author commits to:

- security fixes;
- compatibility with new PQS and Scribe releases;
- SDK releases in step with API changes, with the conformance vectors kept
  current;
- triage of public issues;
- keeping the financial policy library current.

This maintenance is included in this request. The repository is
Apache-2.0-licensed and its contribution and security policies are already
published. The SDKs use the same license and policies.
