## Development Fund Proposal — ISO 20022 ↔ Canton Settlement Adapter

**Author:** NODEJUMPER (https://nodejumper.io/)  
**Status:** Submitted  
**Created:** 2026-06-01  
**Label:** canton-apis  
**Champion:** Canton Foundation

---

## Abstract

The ISO 20022 ↔ Canton Settlement Adapter is an open-source, bidirectional library that translates standardized ISO 20022 bank messages (`pacs.008`, `pacs.002`, `camt.05x`) into CIP-56 token transfers and Delivery-vs-Payment (DvP) settlements over the JSON/gRPC Ledger API, and back again.

In other words, it is the last step that lets banks, PSPs, and custodians initiate and reconcile settlement on Canton straight from their existing payment systems, without rewriting their core banking. We deliver it as a reusable reference library plus a public conformance test-vector suite, so the ecosystem builds this integration once instead of every institution rebuilding it privately.

It is not a message bus and not a new payment rail. It is a thin, well-specified bridge so that existing ISO 20022 systems can reach Canton's private, atomically-composable settlement.

---

## Specification

### 1. Objective

The single objective is to deliver a reusable, open-source mapping library and conformance suite between a narrow, well-defined set of ISO 20022 messages and CIP-56 settlement on Canton.

Canton's own documentation states that there is no native ISO 20022 capability, and that integrators "must build an intermediary translation layer" (ingest ISO 20022 XML, map fields, submit via the Ledger API). Today every institution that wants to drive Canton settlement from its existing payment stack has to build that layer privately, which duplicates effort, fragments mappings, and slows institutional onboarding.

This proposal closes that gap with a shared reference implementation for the most common settlement message family:

- **Inbound:** `pacs.008` (FI-to-FI customer credit transfer) is translated into a CIP-56 transfer or DvP over the Ledger API, and a `pacs.002` (payment status report) is returned. (`pain.001` payment initiation follows the same inbound path and is a stretch goal, not a v1 commitment.)
- **Outbound:** on-ledger settlement events are turned into `camt.05x` (account report / statement) for the institution's back office and reconciliation.

Scope is intentionally narrow for v1 (`pacs.008`, `pacs.002`, `camt.05x`, plus DvP). All other ISO 20022 message types are explicitly deferred / out of scope and documented as such, to keep a single, verifiable objective.

### 2. Implementation Mechanics

A technical expert in payments or Canton should be able to follow the design end to end. The adapter is made up of five components plus a conformance suite:

| Component | Responsibility |
| --- | --- |
| **Message Gateway** | Ingests/emits ISO 20022 XML over standard transports (HTTPS/SFTP), validates against XSD plus CBPR+/HVPS+ usage guidelines, and de-duplicates by `MsgId`/`EndToEndId`. |
| **Mapping Engine** | Typed, code-level translation between ISO 20022 fields and CIP-56 transfer/DvP parameters, exposed as an extensible JVM mapper interface. Canonical mappings ship in-core as code; institutions override by implementing the interface. Only genuinely tabular data (party directory, currency→`InstrumentId`) is plain configuration. |
| **Settlement Builder** | Builds the CIP-56 flow: resolves `factoryId` / `choiceContextData` / `disclosedContracts` from the registry off-ledger API and assembles `TransferFactory_Transfer` / allocation (DvP) commands. |
| **Ledger Client** | Submits and observes via the JSON/gRPC Ledger API directly (the adapter is an unattended back-office integration, not a user-facing dApp); signing uses the institution's own provider. |
| **Reconciliation & Reporting** | Observes on-ledger results, generates `pacs.002` status and `camt.05x` statements, and reconciles against the institution's records by message id. |
| **Conformance Suite** | Public golden-vector corpus plus a CI harness that verifies any deployment is spec-correct. |

End-to-end inbound settlement flow (`pacs.008` → CIP-56 → `pacs.002`):

1. Message Gateway receives and validates the `pacs.008`, rejecting malformed or duplicate messages deterministically.
2. Mapping Engine resolves debtor/creditor parties (or V2 accounts), `InstrumentId`, amount, currency, and settlement intent into CIP-56 parameters.
3. Settlement Builder queries the registry off-ledger API for `factoryId`, `choiceContextData`, and `disclosedContracts` (with ledger-derived `createdEventBlob`).
4. Ledger Client exercises the transfer through the JSON/gRPC Ledger API and tracks the resulting `TransferInstruction`.
5. Reconciliation & Reporting maps the final on-ledger state to a `pacs.002` status report and returns it to the originating system. Failures map to the corresponding ISO 20022 reason codes.

Mechanics by concern:

**a. ISO 20022 ingestion & validation.** Official ISO 20022 XSD schemas are used to generate strongly-typed message bindings (JAXB on the JVM). Inbound messages are validated against the schema and the relevant CBPR+/HVPS+ usage guideline before any ledger action. We do not hand-roll message parsing.

**b. Typed mapping interface (code, not a DSL).** Mappings are written as code against an extensible JVM mapper interface, not a custom configuration syntax — a config DSL is just code in a hand-rolled language with its own parser to maintain, whereas a typed interface gives integrators real types, tests, and IDE support. Institutions extend the canonical mappings by implementing the interface rather than forking the core. The only things kept as plain data are the genuinely tabular lookups — the party-resolution directory and the currency→`InstrumentId` map — since those are data, not logic.

Concrete field-level mapping (`pacs.008` `FIToFICstmrCdtTrf` → CIP-56 `Transfer`):

| ISO 20022 element (`pacs.008`) | CIP-56 `Transfer` field | Notes |
| --- | --- | --- |
| `CdtTrfTxInf/IntrBkSttlmAmt` (+ `@Ccy`) | `amount` | Decimal amount; currency drives instrument resolution (see below) |
| `CdtTrfTxInf/Dbtr` + `DbtrAcct` (IBAN) / `DbtrAgt` (BIC) | `sender` `Account` (V2) / party (v1) | Resolved via the Party Resolution directory; on V2 maps to a CIP-0112 `Account` (see below) |
| `CdtTrfTxInf/Cdtr` + `CdtrAcct` (IBAN) / `CdtrAgt` (BIC/LEI) | `receiver` `Account` (V2) / party (v1) | Resolved via the Party Resolution directory; on V2 maps to a CIP-0112 `Account` (see below) |
| `CdtTrfTxInf/PmtId/EndToEndId` | transfer `meta` (correlation key) | Used for idempotency and `pacs.002`/`camt` correlation |
| `GrpHdr/IntrBkSttlmDt` | `requestedAt` / `executeBefore` | Settlement date sets the execution window |
| `CdtTrfTxInf/Purp` | `meta` (purpose code) | Carried as metadata, not on-ledger PII |

**Party resolution.** The hardest mapping is bank identifier to Canton party. The adapter ships a pluggable Party Resolution directory that maps external identifiers (IBAN, BIC, LEI) to Canton party IDs. v1 supports a configurable, institution-owned directory file/service; where available, it can also resolve via CNS entries when issuers publish their party mapping. If a counterparty cannot be resolved unambiguously, the adapter fails fast with a deterministic `pacs.002` reject (reason code) rather than guessing a party.

**Account model (CIP-0112 / V2).** On the Token Standard V2 path, debtor/creditor resolve to a CIP-0112 `Account` (`{ owner, provider, id }`) rather than a flat party, which maps onto the ISO 20022 account model far more naturally: `owner` ↔ the customer (`Dbtr`/`Cdtr`), `provider` ↔ the account-servicing agent (`DbtrAgt`/`CdtrAgt` BIC), and `id` ↔ the account number (`DbtrAcct`/`CdtrAcct` IBAN). This also captures the multi-tier / custody-chain shape a single party cannot. For v1 assets live on mainnet today, resolution stays party-level (the `basicAccount` shape), so V2 is an upgrade to the mapping rather than a new dependency.

**Instrument resolution.** The settlement currency/asset (`@Ccy`, or an explicit `InstrumentId` extension) is mapped via config to the target CIP-56 `InstrumentId` (registry `admin` party plus id). This is how the adapter knows which token registry administers the cash/asset leg.

The adapter does not aim to cover all ~180 ISO 4217 currency codes. ISO 4217 is the input vocabulary; what is actually settleable is the overlap between the currencies that appear in messages and the CIP-56 instruments that exist on Canton and are configured. That overlap is small today (a handful of USD tokens and similar) and grows as more instruments are issued. A currency with no instrument behind it is a clean `pacs.002` reject, and adding one later is a config entry, not a code change.

**c. CIP-56 settlement construction (no protocol changes).** The adapter builds the standard CIP-56 flow: it calls the registry's off-ledger Transfer-Instruction API (e.g. `POST /registry/transfer-instruction/v1/transfer-factory`) to obtain `factoryId`, `choiceContextData`, and `disclosedContracts`. Where a disclosed contract's `createdEventBlob` has to be (re)fetched, it is read from the participant via the JSON Ledger API active-contracts query with `includeCreatedEventBlob=true` (or the equivalent gRPC call), cached by contract id, and attached to the submission. The adapter then exercises `TransferFactory_Transfer` (single-leg) or the allocation choices (DvP) through the JSON/gRPC Ledger API command path. We reuse the existing token-standard registry choice-context mechanism; we do not reinvent or fake `createdEventBlob`.

**d. DvP (two-leg, atomic).** For securities-vs-cash settlement, each leg is represented by a CIP-56 `Allocation` (the standard's authorization-to-settle primitive). The adapter requests an allocation from each side's registry for the asset and the cash leg, then submits a single settlement that consumes both allocations atomically, so either both legs settle or neither does. A DvP settlement instruction pairing an asset leg with a cash leg drives the two `InstrumentId`s, amounts, and counterparties; the adapter correlates the legs by their shared settlement reference and surfaces a single combined status. Cash-leg messages beyond `pacs.008` are mapped as the DvP scope is finalized in Milestone 3.

Because both legs are expressed through the token-standard `Allocation`/settlement interface, the DvP path is agnostic to the specific instruments: it works for any pair of CIP-56 instruments that expose the standard interface, not a hard-coded asset set. Atomicity relies on the standard's allocation/settlement primitives and on Canton's native synchronizer routing; the adapter does not hand-orchestrate cross-synchronizer movement at the Ledger API level. Where the asset and cash legs sit under different registries or synchronizers, routing is left to the platform and the adapter coordinates only the bilateral settlement intent.

**e. Status & reconciliation (outbound).** On-ledger transfer/settlement results are observed via the Ledger API and translated into `pacs.002` status reports and `camt.05x` statements, keyed by `EndToEndId`/`MsgId` for idempotency and straight-through reconciliation against the institution's records.

Visibility follows Canton's privacy model rather than circumventing it. The adapter runs as (or on behalf of) the institution's own party, which is a stakeholder on the settlement contracts it submits, so it observes exactly those results through that party's participant node. No global, cross-party, or otherwise privileged visibility is required or assumed; the adapter never sees contracts the institution is not already a stakeholder on, which is also why reconciliation is scoped to the institution's own settlements.

**f. Conformance suite.** A public golden-vector corpus (sample messages paired with expected CIP-56 actions) plus a CI harness lets any integrator verify their deployment is spec-correct before going live.

**g. Security & data handling.** The adapter handles regulated payment messages, so security matters from day one:

- **No PII on-ledger.** Personally identifiable and sensitive payment data stays off-ledger; only the minimal references required for settlement are mapped on-ledger, consistent with Canton's privacy model. Sensitive ISO 20022 fields are never written to ledger contracts.
- **Message authenticity & integrity.** Inbound messages are schema- and guideline-validated; the adapter relies on the institution's existing transport authentication (mTLS/SFTP) and signs/verifies its own status reports.
- **Key handling.** Ledger submission uses the institution's configured signing provider via the Interactive Submission Service (including HSM/KMS-backed providers). The adapter never holds raw signing keys itself.
- **Determinism & idempotency.** Every message is processed exactly once via `MsgId`/`EndToEndId` keys. These keys are mapped into the ledger submission's change ID (the `user_id` + `act_as` + `command_id` triple), so de-duplication is enforced at the ledger as well as in the gateway: a retried message resolves to the same command and the participant rejects the duplicate, rather than relying on gateway-side caching alone.
- **Auditability.** A complete, queryable audit trail links each ISO 20022 message to its on-ledger transaction(s) and status report, supporting institutional reconciliation and supervisory review. An independent security review is included at Milestone 3, with the auditor and scope agreed with the Tech & Ops security subcommittee. Until that review completes and critical/high findings are remediated, the adapter is published as an explicitly unaudited reference and is gated against production mainnet use.

**h. Failure handling (non-happy paths).** For a settlement adapter the exception paths are most of the work, so they are treated as first-class. The handling model is uniform: failures are classified as terminal or transient; terminal failures fail closed (the adapter never guesses a party or instrument) and return an immediate deterministic `pacs.002 RJCT` with a mandatory `ExternalStatusReason1Code` (`NARR` plus free text only where ISO has no exact code), while transient failures hold in `PDNG` with bounded retry and become a final `RJCT` only on expiry. This catalogue is maintained as a living error-handling reference alongside the code:

| Failure | Detection | `pacs.002` outcome |
| --- | --- | --- |
| Counterparty not in directory, or directory entry mismatches on-ledger topology (party absent / not hosted as expected) | Party/topology check pre-submit | `RJCT` `BE06` |
| Mapped account closed/inactive on-ledger | Party/topology check pre-submit | `RJCT` `AC04` |
| Currency with no configured CIP-56 instrument | Instrument resolution | `RJCT` `AM03` |
| Unsupported `SttlmMtd` (`COVE`/`CLRG`) | Mapping | `RJCT` `NARR` (no exact ISO code) |
| Insufficient holdings on sender | Submit result | `RJCT` `AM04` |
| Receiver does not accept before `executeBefore` | Instruction lifecycle | `PDNG`, then `RJCT` on expiry |
| Counterparty participant unreachable / settlement does not complete | Ledger timeout | `PDNG`, bounded retry, then `RJCT` `ED05` |
| Registry off-ledger API or `createdEventBlob` stale | Pre-submit fetch | refetch context / retry; persistent → `RJCT` `ED05` |
| Transient ledger contention | Completion error | retry preserving change ID; permanent → `RJCT` `ED05` |
| Duplicate `MsgId`/`EndToEndId` | Idempotency key | no second settlement; original status returned (`DU01`/`DU04` if a true duplicate, not a retry) |
| Malformed message (XSD / CBPR+ / HVPS+) | Schema/guideline validation | `RJCT` `FF01` before any ledger action |
| DvP single-leg failure | Atomic allocation settlement | both-or-neither, never partial; single combined `RJCT` `ED05` |

Two ledger properties carry much of this: change-ID de-duplication makes retries safe, and atomic allocation settlement removes partial settlement as a category. Because settlement is atomic, a failed submission leaves nothing settled, so it is always a pacs.002 reject (no funds move) rather than a pacs.004 return.

**Stack:** JVM core (Kotlin/Java, where ISO 20022 tooling is most mature and which matches both bank back offices and Canton itself), a JSON/gRPC Ledger API client, Daml only where a thin settlement-state template is required, OpenTelemetry for observability, Apache-2.0.

### 3. Architectural Alignment

- **Extends, does not replace.** It builds directly on the CIP-56 token standard (and its CIP-0112 / V2 evolution), reusing the registry/choice-context mechanisms, and adds only the external-messaging boundary that none of them cover. The integration runs on the JSON/gRPC Ledger API directly; CIP-0103 (the dApp/wallet API) is not on the primary path, since this is an unattended back-office process rather than a user-facing dApp.
- **Token Standard V2 alignment (CIP-0112).** The adapter works against CIP-56 v1 as deployed on mainnet today and needs no standard change to land — so there is no hard dependency on the V2 rollout. That said, V2 maps onto the ISO flows more directly than v1 in several places we use, and the design targets it as the forward path (discussed with the token-standard maintainers):
  - **Iterated settlement** covers the multi-leg / multi-hop `SttlmMtd` cases (`COVE`/`CLRG`, and cross-currency `pacs.008` with two instrument legs) that single-instrument v1 settlement could not.
  - **Account structures** (`{ owner, provider, id }`) map onto the ISO debtor/creditor + agent + account model, as detailed under Party/Account resolution.
  - The V2 **`Allocation_Settle` authority model** (executors + instrument admin) gives the adapter a well-defined executor role for `pacs.008`, which carries only debtor/creditor agents.
  - V2's **event-based reporting** is a cleaner source for generating `pacs.002` status and `camt.05x` reconciliation than reconstructing them from transaction trees.
  
  v1 remains supported via mixed settlement for assets that have not migrated, so V2 is an upgrade rather than a precondition.
- **Honors Canton's model.** Canton is the private, atomically-composable settlement layer; this adapter is the bridge that lets ISO 20022-speaking systems reach that layer. It does not turn Canton into a message bus: instructions are translated at the edge, and settlement composability stays native.
- **Ecosystem priority fit.** It serves App Building / interoperability and the institutional-finance thesis Canton's regulated-finance adopters are pursuing in 2026 (detailed under Motivation).

### 4. Backward Compatibility

No backward compatibility impact. There are no protocol changes, no ledger-contract changes, and no changes to CIP-56 or CIP-0112 are required; the adapter works against the current token standard as-is. It is purely additive, off-ledger integration software plus an optional thin Daml template.

---

## Milestones and Deliverables

### Milestone 1: Mapping Standard, Conformance Vectors & Working PoC
- **Estimated delivery:** Month 1.5 · **Hard deadline:** 2 months from grant approval.
- **Estimated effort:** ~45 person-days.
- **Focus:** Canonical `pacs.008` → CIP-56 transfer mapping plus a working end-to-end PoC on DevNet/LocalNet.
- **Deliverables:**
  - Published, versioned mapping specification (`pacs.008` → CIP-56 transfer) with JSON-Schema-validated rules.
  - Public golden-vector corpus (sample `pacs.008` paired with the expected CIP-56 action).
  - Working PoC: a real `pacs.008` XML drives a CIP-56 transfer over the Ledger API on DevNet and returns a `pacs.002`. Open-source, CI-green, with a recorded demo.
- **Verification:** committee or delegate confirms the PoC drives a real settlement end to end and the published vectors validate in CI.

### Milestone 2: Reverse Path, Status & Reconciliation
- **Estimated delivery:** Month 3 · **Hard deadline:** 4 months from grant approval.
- **Estimated effort:** ~55 person-days.
- **Focus:** Outbound translation and reconciliation.
- **Deliverables:**
  - `pacs.002` status generation from on-ledger results; `camt.05x` statement generation from settlement events.
  - Idempotent reconciliation keyed by `EndToEndId`/`MsgId`.
  - Reconciliation report plus test coverage across happy-path and exception paths (rejects, timeouts, duplicates) per the failure taxonomy.
- **Verification:** on-ledger results produce valid `pacs.002`/`camt.05x`; reconciliation is demonstrated across happy-path and exception paths.

### Milestone 3: Atomic DvP, Reusable Library, Conformance Harness & Security Review
- **Estimated delivery:** Month 5 · **Hard deadline:** 7 months from grant approval.
- **Estimated effort:** ~80 person-days plus the external audit window (the heaviest engineering milestone).
- **Focus:** Two-leg settlement, a consumable artifact, and production-readiness — front-loaded here so Milestone 4 is pure adoption.
- **Deliverables:**
  - DvP mapping using CIP-56 allocations (securities-vs-cash) with atomic settlement.
  - Open-source library (JVM) plus Ledger API integration layer, published with docs and a quickstart.
  - CI conformance harness any integrator can run, published and documented.
  - A complete reference integration that runs the full inbound and outbound settlement loop on testnet, packaged for direct reuse.
  - Independent security review of the gateway, mapping engine, and settlement path; the auditor and audit scope are agreed with the Tech & Ops security subcommittee and the scope document published before the review begins.
- **Verification:** DvP settles atomically end to end on DevNet; the conformance harness is green and reusable by third parties; security-review critical/high findings remediated and a remediation summary published.

### Milestone 4: Adoption & Production Settlement
- **Opens:** on Milestone 3 acceptance.
- **Deadline:** 18 months from grant approval — an explicit exception to the 9-month default (see *Deadline rationale* in §Funding). Institutional settlement adopters (banks, PSPs, custodians) and the integrators serving them run procurement and integration on 9–18 month cycles, so a 9-month gate would forfeit the very adoption this milestone is meant to reward.
- **Focus:** Real usage of the adapter to drive settlement on Canton, plus the adoption-enabling deliverables. This milestone carries the majority of the grant by design (60%), so payout tracks demonstrated adoption rather than delivery alone.
- **Payment structure:** per-event tranches for each integration that runs a real settlement flow through the adapter — escalating from testnet pilots to production on mainnet — plus a completion tranche gated on third-party conformance adoption. Partial adoption pays partially rather than forfeiting the whole milestone.
- **Deliverables / Value Metrics:**

| Deliverable | Acceptance Criteria | Tranche payout |
|---|---|---|
| Testnet pilot integration | An external team runs a real settlement flow (`pacs.008` → CIP-56 → `pacs.002`, or a DvP leg) through the adapter on testnet. Up to 2 pilots credited. Evidenced by the integrator and a reproducible run. | **60,000 CC per pilot (up to 120,000 CC)** |
| Production settlement on mainnet | An institution (bank / PSP / custodian) or the integrator serving one uses the adapter to drive settlement in production on Canton **mainnet**. Up to 3 credited. Evidenced by party IDs and on-chain settlement, or by private attestation to the Foundation under confidentiality. | **120,000 CC per deployment (up to 360,000 CC)** |
| Adoption-completion gate | ≥3 independent third parties run the public conformance suite against their own deployment; documented downstream consumption by another Canton application or funded proposal; a baseline of real settlement activity driven through the adapter on Canton **mainnet** across adopters over a rolling 30-day window (threshold agreed with the Foundation before the milestone opens); documentation site live and linked from Canton developer docs. | **120,000 CC** |
| **Milestone 4 maximum** | | **600,000 CC** |

- **Verification:** integrations evidenced by integrator confirmation and reproducible runs (testnet) or by party IDs + on-chain mainnet settlement / private attestation to the Foundation under confidentiality (production); completion gate evidenced by third-party conformance-suite runs, downstream-consumption links, mainnet settlement-activity figures, and the live docs site. Adopting teams and the proposal champion are invited to confirm milestone completion to the committee, so acceptance is corroborated by real users rather than self-reported alone.
- **Independence of adoption credit.** Nodejumper-affiliated deployments are excluded from the qualifying adoption count: credited testnet pilots and mainnet production integrations must come from teams not affiliated with Nodejumper, and the settlement activity counted toward the completion gate must originate from real usage by unaffiliated adopters.

### Post-grant maintenance (separate, not part of the 1,000,000 CC)
Following M4, Nodejumper proposes ongoing maintenance under a separate maintenance grant subject to committee review. This is credible for operational reasons, not contractual ones: we already run a monitored, 24/7 validator fleet with incident response and no slashing history, and the adapter is maintained with that same discipline rather than as a side commitment.
- **Standards cadence:** the mapping core, vectors, and conformance suite are refreshed against the annual ISO 20022 / CBPR+ / HVPS+ maintenance releases.
- **Upgrade playbook:** a documented procedure for moving the adapter to a new Canton / CIP-56 / token-standard version, so the work does not depend on a single person.
- **Issue handling:** settlement-blocking defects are triaged on the same priority track as our node incidents; security-relevant issues are patched first.
- **Release hygiene:** semantic versioning, changelogs, and migration notes on every release.

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on value to the ecosystem, not artifact delivery:

- A real `pacs.008` produces a valid CIP-56 settlement on Canton, and on-ledger results produce a valid `pacs.002`/`camt.05x` (demonstrated end to end, not mocked).
- The public conformance vectors pass in CI and are reusable by third parties.
- A complete reference integration runs the full inbound and outbound loop on testnet and is reusable by any integrator.
- The supported v1 message set (`pacs.008`, `pacs.002`, `camt.05x`, plus DvP) is live, documented, and conformance-verified.
- Independent external teams run real settlement flows through the adapter, escalating from testnet pilots to production on Canton mainnet; the Milestone 4 per-event tranches pay against those integrations.
- The Milestone 4 adoption-completion gate is met (third parties run the public conformance suite, documented downstream consumption, live docs site).
- Documentation, conformance suite, security-review results, and a sustainability/maintenance plan are published under Apache-2.0.

---

## Funding

**Total Funding Request:** 1,000,000 CC

The request is weighted **60% toward adoption** (600,000 CC) and 40% toward engineering delivery (400,000 CC), directly reflecting committee guidance that funding should track demonstrated ecosystem usage rather than delivery alone. The engineering portion covers a roughly six-month build of a multi-component adapter (Message Gateway, Mapping Engine, Settlement Builder, Ledger Client, Reconciliation & Reporting), bidirectional translation across the v1 message set, atomic DvP via CIP-56 allocations, a public conformance suite, and a reference integration. The adoption portion pays out against real settlement usage on Canton.

### Payment Breakdown by Milestone

| Milestone | Payment | % of total |
|---|---|---|
| M1 — Mapping standard, vectors, PoC | 100,000 CC upon committee acceptance | 10% |
| M2 — Reverse path, status, reconciliation | 120,000 CC upon committee acceptance | 12% |
| M3 — Atomic DvP, library, conformance harness, security review | 180,000 CC upon committee acceptance | 18% |
| M4 — Adoption & production settlement | up to 600,000 CC, per-event + completion tranches | 60% |
| **Total** | **1,000,000 CC** | **100%** |

**Engineering (M1–M3): 400,000 CC (40%).** Front-loaded so the committee evaluates quality at each acceptance — including the security review and the conformance harness — before the adoption-weighted tranche opens. M3 carries the heaviest engineering: allocation-based two-leg DvP, the published library, the conformance harness, the reference integration, and the independent security review.

**Adoption (M4): up to 600,000 CC (60%).**
- **60,000 CC per testnet pilot integration — up to 2 = 120,000 CC.** The achievable first rung: an external team runs a real settlement flow through the adapter on testnet.
- **120,000 CC per production settlement on Canton mainnet — up to 3 = 360,000 CC.** The institutional rung: a bank/PSP/custodian, or the integrator serving one, drives settlement in production.
- **120,000 CC completion tranche** on the adoption gate (≥3 third parties run the public conformance suite, documented downstream consumption, live docs site).

Per-event payouts make adoption proportional to demonstrated usage rather than gated on a single binary trigger: if both pilots and two of three production deployments ship, those tranches pay. The structure deliberately puts achievable rungs (testnet pilots, conformance adoption) alongside the higher-value institutional rung, so the 60% weighting tracks real settlement usage without resting entirely on a single bank going live.

### Security review (pass-through, separate from the 1,000,000 CC base)
The independent security review at Milestone 3 is budgeted as a pass-through cost of roughly 120,000–150,000 CC, paid alongside M3 acceptance, outside the engineering/adoption base above. The auditor and scope are agreed with the Tech & Ops security subcommittee and published before the review begins.

### Deadline rationale
The engineering milestones (M1–M3) complete in approximately six months and follow the ≤9-month dev-fund standard. Milestone 4 opens on M3 acceptance and runs to an 18-month deadline from grant approval — an explicit exception to the 9-month default. Institutional settlement adoption runs on TradFi procurement and integration cycles (routinely 9–18 months for a first production conversation) that lie outside any single contributor's control; gating 60% of the grant on a 9-month adoption window would penalise the proposal for timelines it cannot compress.

### Volatility Stipulation
The engineering scope is scoped to complete in under six months. The grant is denominated in fixed Canton Coin and is re-evaluated at the standard 6-month review point, with a second review at the 12-month mark to cover the extended M4 adoption window, per the standard template clause. Should scope change at Committee request, remaining milestones are renegotiated at the same review points to account for USD/CC volatility.

### Risk mitigation
- **Build risk** is retired by the Milestone 1 PoC (a real `pacs.008` settling on DevNet).
- **Overlap risk** is addressed by building strictly on the existing CIP-56 / Ledger API surfaces and reusing the token-standard registry mechanism rather than introducing parallel infrastructure.
- **Adoption risk** is addressed structurally: adoption is a ladder, not a single binary trigger, so achievable rungs (testnet pilots, third-party conformance adoption) carry real tranches while production-on-mainnet is the higher-value rung rather than the floor; the 18-month M4 window matches institutional cycles; and 60% of the grant is paid only against demonstrated settlement usage.
- **Maintenance risk** is addressed by Nodejumper's standing-validator commitment and the post-grant maintenance model.

---

## Co-Marketing

Upon release, Nodejumper will collaborate with the Foundation on:

- Announcement coordination tied to the institutional-settlement narrative (JPM Coin, DTCC, Visa).
- A technical blog and reference walkthrough ("driving Canton settlement from ISO 20022").
- Developer enablement: quickstart, conformance suite, and integration office hours.

---

## Adoption Path

**Who adopts.** The end consumers are regulated institutions — banks, PSPs, and custodians — and the integrators and vendors who build settlement connectivity for them. In practice institutions rarely integrate a settlement library directly; they adopt through an integrator. The adapter is therefore designed to be adopted at both points: a thin, conformance-verified library an integrator can embed, and a reference integration an institution's team can run as-is.

**Staged path.** Adoption is staged so the bar stays realistic and each step is independently creditable under Milestone 4:

1. **Testnet pilot** — an external team runs a real settlement flow (`pacs.008` → CIP-56 → `pacs.002`, or a DvP leg) through the adapter on testnet. This is the achievable first rung and the bulk of the early adoption signal.
2. **Production on mainnet** — an institution, or the integrator serving one, drives settlement in production. Higher value, longer cycle; credited at the top tranche, not required as a floor.
3. **Conformance adoption** — third parties run the public conformance suite against their own deployment, and downstream Canton applications/proposals (for example a vertical FX or settlement app) consume the adapter rather than rebuilding the mapping.

---

## Motivation

### The opportunity

Canton's reason to exist is regulated, institutional finance, and in 2026 that thesis is live: JPM Coin (Kinexys), DTCC tokenized U.S. Treasuries, and Visa as a Super Validator are all on or onboarding to Canton. Every one of those institutions runs its back office on ISO 20022, now the global standard after the end of SWIFT/CBPR+ MT coexistence (Nov 2025) and Fedwire's move to ISO 20022 (Jul 2025), with mandatory structured-address requirements landing Nov 2026. ISO 20022 is the language of the systems Canton most wants to connect to.

### The gap (Canton is currently absent here)

There is no native ISO 20022 capability on Canton, and the documentation explicitly tells integrators they "must build an intermediary translation layer" themselves. So the single biggest non-crypto onboarding question for an institution is: "How does my existing payment engine settle on Canton without a core-banking rebuild?" Today every institution answers that privately, which duplicates effort, produces fragmented and incompatible mappings, and in many cases blocks adoption because the bridge simply does not exist.

### Why the Development Fund should care

A shared, open-source ISO 20022 ↔ CIP-56 adapter is a public good that:

- **amplifies CIP-56.** Every external payment that can be expressed as a CIP-56 transfer makes the token standard more valuable.
- **benefits a large share of the institutional pipeline.** Banks, PSPs, custodians, and the integrators serving them all need this same layer.
- **removes duplicated, fragmented effort.** One conformance-verified reference replaces many private, incompatible builds.
- **advances stated ecosystem priorities.** It maps directly to App Building / interoperability and the institutional-finance mission.

## Rationale

**Why this approach.** ISO 20022 is the common language of the systems Canton wants to connect to. Meeting institutions where they already are, at the message boundary, is the lowest-friction path to settlement volume, and a reusable reference plus conformance suite is the right shape for a public good (rather than each institution rebuilding privately).

**Why a reference library, not a product.** The genuinely reusable core is the canonical mapping, the message construction, and the conformance vectors. Institution-specific usage-guideline nuances are added by implementing the mapper interface (plus the tabular party/instrument lookups), not baked into the core, so the public good stays thin and broadly reusable while real integrations remain extensible.

**Positioning vs existing proposals (no overlap):**

- **#139 Institutional FX Settlement (Asia)** is a vertical FX application; this proposal is the horizontal mapping library it (and others) could consume rather than each rebuilding the translation layer privately.
- **#94 Payment Streams** and **#108 Reference DEX / Settlement Pattern** are the precedent: approved reference implementations in the financial-workflows lane. This adapter is the same category, at the external-messaging boundary.
- We reuse the token-standard registry choice-context (for `disclosedContracts`/`createdEventBlob`) and the Splice token-standard assets rather than reinventing them.

**Why not extend CIP-56 directly.** ISO 20022 translation is an edge concern that spans many institutions and instruments; it does not belong inside the token standard. No CIP-56/CIP-0112 change is required: the adapter works with v1 as deployed today and targets the V2 account / iterated-settlement model as the forward path (see *Token Standard V2 alignment*) without taking a hard dependency on the rollout.

---

## Why Nodejumper

Nodejumper is a Proof-of-Stake validator and infrastructure provider, active since early 2022. We operate secure self-managed infrastructure across 20+ networks with 24/7 monitoring, no slashing history, and high uptime. We are a GSF-sponsored Canton Network validator, and our team are working software engineers who ship open-source tools and managed services for the networks we operate. This proposal lands where our two strengths meet: running Canton infrastructure and building reusable developer and settlement tooling.

- **We already operate Canton infrastructure.** We run the same node, Ledger, and registry APIs this adapter integrates with, so we are not learning the platform on the grant. As a long-term validator we also have a clear reason to maintain it after delivery (see below).
- **Proven multi-network reliability.** 20+ mainnets since 2022 with no slashing and automated monitoring and incident response, which is the operational track record needed to run settlement software.
- **Hands-on Canton / CIP-56 / Ledger API depth.** We work directly with the token-standard registry APIs, `choiceContextData`, `disclosedContracts`, and ledger-derived `createdEventBlob` handling, which are the exact mechanics this adapter depends on. Our prior Canton dev-fund work (Canton Token Standard Local API Compatibility & CI Harness) shows that.
- **Open-source track record.** We build and maintain reusable tooling, bots, onboarding guides, and dashboards under open licenses, the same kind of public-good work this grant funds.
- **ISO 20022 handled as a correctness problem.** Schema-driven bindings, mappings against CBPR+/HVPS+ usage guidelines, and a public conformance suite that proves every supported flow is spec-correct. Fidelity is verified by the suite, not assumed.

As a standing Canton validator, our commitment does not end at delivery: we will maintain the library against annual ISO 20022 / CBPR+ releases and work with the Foundation on long-term stewardship.