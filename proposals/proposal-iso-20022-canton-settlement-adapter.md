## Development Fund Proposal — ISO 20022 ↔ Canton Settlement Adapter

**Author:** NODEJUMPER (https://nodejumper.io/)  
**Status:** Submitted  
**Created:** 2026-06-01  
**Label:** canton-apis  
**Champion:** Canton Foundation

---

## Abstract

The ISO 20022 ↔ Canton Settlement Adapter is an open-source, bidirectional library that translates standardized ISO 20022 bank messages (`pacs.008`, `pacs.002`, `camt.05x`) into CIP-56 token transfers and Delivery-vs-Payment (DvP) settlements via the CIP-0103 dApp / JSON Ledger API, and back again.

In other words, it is the last step that lets banks, PSPs, and custodians initiate and reconcile settlement on Canton straight from their existing payment systems, without rewriting their core banking. We deliver it as a reusable reference library plus a public conformance test-vector suite, so the ecosystem builds this integration once instead of every institution rebuilding it privately.

It is not a message bus and not a new payment rail. It is a thin, well-specified bridge so that existing ISO 20022 systems can reach Canton's private, atomically-composable settlement.

---

## Specification

### 1. Objective

The single objective is to deliver a reusable, open-source mapping library and conformance suite between a narrow, well-defined set of ISO 20022 messages and CIP-56 settlement on Canton.

Canton's own documentation states that there is no native ISO 20022 capability, and that integrators "must build an intermediary translation layer" (ingest ISO 20022 XML, map fields, submit via the Ledger API). Today every institution that wants to drive Canton settlement from its existing payment stack has to build that layer privately, which duplicates effort, fragments mappings, and slows institutional onboarding.

This proposal closes that gap with a shared reference implementation for the most common settlement message family:

- **Inbound:** `pacs.008` (FI-to-FI customer credit transfer) is translated into a CIP-56 transfer or DvP via CIP-0103, and a `pacs.002` (payment status report) is returned. (`pain.001` payment initiation follows the same inbound path and is a stretch goal, not a v1 commitment.)
- **Outbound:** on-ledger settlement events are turned into `camt.05x` (account report / statement) for the institution's back office and reconciliation.

Scope is intentionally narrow for v1 (`pacs.008`, `pacs.002`, `camt.05x`, plus DvP). All other ISO 20022 message types are explicitly deferred / out of scope and documented as such, to keep a single, verifiable objective.

### 2. Implementation Mechanics

A technical expert in payments or Canton should be able to follow the design end to end. The adapter is made up of five components plus a conformance suite:

| Component | Responsibility |
| --- | --- |
| **Message Gateway** | Ingests/emits ISO 20022 XML over standard transports (HTTPS/SFTP), validates against XSD plus CBPR+/HVPS+ usage guidelines, and de-duplicates by `MsgId`/`EndToEndId`. |
| **Mapping Engine** | Declarative, config-driven translation between ISO 20022 fields and CIP-56 transfer/DvP parameters. Canonical mappings ship in-core; institution-specific guideline nuances are overlay config. |
| **Settlement Builder** | Builds the CIP-56 flow: resolves `factoryId` / `choiceContextData` / `disclosedContracts` from the registry off-ledger API and assembles `TransferFactory_Transfer` / allocation (DvP) commands. |
| **Ledger Client** | Submits and observes via the CIP-0103 / JSON Ledger API path, the same surface a compliant wallet uses (no privileged shortcuts). |
| **Reconciliation & Reporting** | Observes on-ledger results, generates `pacs.002` status and `camt.05x` statements, and reconciles against the institution's records by message id. |
| **Conformance Suite** | Public golden-vector corpus plus a CI harness that verifies any deployment is spec-correct. |

End-to-end inbound settlement flow (`pacs.008` → CIP-56 → `pacs.002`):

1. Message Gateway receives and validates the `pacs.008`, rejecting malformed or duplicate messages deterministically.
2. Mapping Engine resolves debtor/creditor parties, `InstrumentId`, amount, currency, and settlement intent into CIP-56 parameters.
3. Settlement Builder queries the registry off-ledger API for `factoryId`, `choiceContextData`, and `disclosedContracts` (with ledger-derived `createdEventBlob`).
4. Ledger Client exercises the transfer through the normal CIP-0103 path and tracks the resulting `TransferInstruction`.
5. Reconciliation & Reporting maps the final on-ledger state to a `pacs.002` status report and returns it to the originating system. Failures map to the corresponding ISO 20022 reason codes.

Mechanics by concern:

**a. ISO 20022 ingestion & validation.** Official ISO 20022 XSD schemas are used to generate strongly-typed message bindings (JAXB on the JVM). Inbound messages are validated against the schema and the relevant CBPR+/HVPS+ usage guideline before any ledger action. We do not hand-roll message parsing.

**b. Declarative mapping engine.** A declarative rule set maps ISO 20022 fields to CIP-56 transfer/DvP parameters. Mappings are configuration-driven, so an institution can extend them to its own usage guideline without forking the core. The reusable core is the canonical mapping plus the message-construction logic; institution-specific enrichment lives in config, not in the library.

Concrete field-level mapping (`pacs.008` `FIToFICstmrCdtTrf` → CIP-56 `Transfer`):

| ISO 20022 element (`pacs.008`) | CIP-56 `Transfer` field | Notes |
| --- | --- | --- |
| `CdtTrfTxInf/IntrBkSttlmAmt` (+ `@Ccy`) | `amount` | Decimal amount; currency drives instrument resolution (see below) |
| `CdtTrfTxInf/Dbtr` + `DbtrAcct` (IBAN) / `DbtrAgt` (BIC) | `sender` (Canton party) | Resolved via the Party Resolution directory |
| `CdtTrfTxInf/Cdtr` + `CdtrAcct` (IBAN) / `CdtrAgt` (BIC/LEI) | `receiver` (Canton party) | Resolved via the Party Resolution directory |
| `CdtTrfTxInf/PmtId/EndToEndId` | transfer `meta` (correlation key) | Used for idempotency and `pacs.002`/`camt` correlation |
| `GrpHdr/IntrBkSttlmDt` | `requestedAt` / `executeBefore` | Settlement date sets the execution window |
| `CdtTrfTxInf/Purp` | `meta` (purpose code) | Carried as metadata, not on-ledger PII |

**Party resolution.** The hardest mapping is bank identifier to Canton party. The adapter ships a pluggable Party Resolution directory that maps external identifiers (IBAN, BIC, LEI) to Canton party IDs. v1 supports a configurable, institution-owned directory file/service; where available, it can also resolve via CNS entries when issuers publish their party mapping. If a counterparty cannot be resolved unambiguously, the adapter fails fast with a deterministic `pacs.002` reject (reason code) rather than guessing a party.

**Instrument resolution.** The settlement currency/asset (`@Ccy`, or an explicit `InstrumentId` extension) is mapped via config to the target CIP-56 `InstrumentId` (registry `admin` party plus id). This is how the adapter knows which token registry administers the cash/asset leg.

The adapter does not aim to cover all ~180 ISO 4217 currency codes. ISO 4217 is the input vocabulary; what is actually settleable is the overlap between the currencies that appear in messages and the CIP-56 instruments that exist on Canton and are configured. That overlap is small today (a handful of USD tokens and similar) and grows as more instruments are issued. A currency with no instrument behind it is a clean `pacs.002` reject, and adding one later is a config entry, not a code change.

**c. CIP-56 settlement construction (no protocol changes).** The adapter builds the standard CIP-56 flow: it calls the registry's off-ledger Transfer-Instruction API (e.g. `POST /registry/transfer-instruction/v1/transfer-factory`) to obtain `factoryId`, `choiceContextData`, and `disclosedContracts`. Where a disclosed contract's `createdEventBlob` has to be (re)fetched, it is read from the participant via the JSON Ledger API active-contracts query with `includeCreatedEventBlob=true` (or the equivalent gRPC call), cached by contract id, and attached to the submission. The adapter then exercises `TransferFactory_Transfer` (single-leg) or the allocation choices (DvP) through the normal CIP-0103 / JSON Ledger API command path, the same way a compliant wallet does. We reuse the existing token-standard registry choice-context mechanism; we do not reinvent or fake `createdEventBlob`.

**d. DvP (two-leg, atomic).** For securities-vs-cash settlement, each leg is represented by a CIP-56 `Allocation` (the standard's authorization-to-settle primitive). The adapter requests an allocation from each side's registry for the asset and the cash leg, then submits a single settlement that consumes both allocations atomically, so either both legs settle or neither does. A DvP settlement instruction pairing an asset leg with a cash leg drives the two `InstrumentId`s, amounts, and counterparties; the adapter correlates the legs by their shared settlement reference and surfaces a single combined status. Cash-leg messages beyond `pacs.008` are mapped as the DvP scope is finalized in Milestone 3.

**e. Status & reconciliation (outbound).** On-ledger transfer/settlement results are observed via the Ledger API and translated into `pacs.002` status reports and `camt.05x` statements, keyed by `EndToEndId`/`MsgId` for idempotency and straight-through reconciliation against the institution's records.

**f. Conformance suite.** A public golden-vector corpus (sample messages paired with expected CIP-56 actions) plus a CI harness lets any integrator verify their deployment is spec-correct before going live.

**g. Security & data handling.** The adapter handles regulated payment messages, so security matters from day one:

- **No PII on-ledger.** Personally identifiable and sensitive payment data stays off-ledger; only the minimal references required for settlement are mapped on-ledger, consistent with Canton's privacy model. Sensitive ISO 20022 fields are never written to ledger contracts.
- **Message authenticity & integrity.** Inbound messages are schema- and guideline-validated; the adapter relies on the institution's existing transport authentication (mTLS/SFTP) and signs/verifies its own status reports.
- **Key handling.** Ledger submission uses the institution's configured CIP-0103 signing provider (including HSM/KMS-backed providers). The adapter never holds raw signing keys itself.
- **Determinism & idempotency.** Every message is processed exactly once via `MsgId`/`EndToEndId` keys, which prevents double-settlement on retries.
- **Auditability.** A complete, queryable audit trail links each ISO 20022 message to its on-ledger transaction(s) and status report, supporting institutional reconciliation and supervisory review. An independent security review is included in the funding for Milestone 3/4.

**Stack:** JVM core (Kotlin/Java, where ISO 20022 tooling is most mature and which matches both bank back offices and Canton itself), a CIP-0103 / JSON Ledger API client, Daml only where a thin settlement-state template is required, OpenTelemetry for observability, Apache-2.0.

### 3. Architectural Alignment

- **Extends, does not replace.** It builds directly on CIP-56 (token standard), CIP-0112 (Token Standard V2 accounts), and CIP-0103 (dApp API), reusing their registry/choice-context mechanisms, and adds only the external-messaging boundary that none of them cover.
- **Honors Canton's model.** Canton is the private, atomically-composable settlement layer; this adapter is the bridge that lets ISO 20022-speaking systems reach that layer. It does not turn Canton into a message bus: instructions are translated at the edge, and settlement composability stays native.
- **Ecosystem priority fit.** It serves App Building / interoperability and the institutional-finance thesis (JPM Coin, DTCC tokenized treasuries, Visa as a Super Validator, all live in 2026).

### 4. Backward Compatibility

No backward compatibility impact. There are no protocol changes, no ledger-contract changes, and no changes to CIP-56 or CIP-0112 are required; the adapter works against the current token standard as-is. It is purely additive, off-ledger integration software plus an optional thin Daml template.

---

## Milestones and Deliverables

### Milestone 1: Mapping Standard, Conformance Vectors & Working PoC
- **Estimated Delivery:** Month 1.5
- **Focus:** Canonical `pacs.008` → CIP-56 transfer mapping plus a working end-to-end PoC on DevNet/LocalNet.
- **Deliverables / Value Metrics:**
  - Published, versioned mapping specification (`pacs.008` → CIP-56 transfer) with JSON-Schema-validated rules.
  - Public golden-vector corpus (sample `pacs.008` paired with the expected CIP-56 action).
  - Working PoC: a real `pacs.008` XML drives a CIP-56 transfer through the CIP-0103 path on DevNet and returns a `pacs.002`. Open-source, CI-green, with a recorded demo.

### Milestone 2: Reverse Path, Status & Reconciliation
- **Estimated Delivery:** Month 3
- **Focus:** Outbound translation and reconciliation.
- **Deliverables / Value Metrics:**
  - `pacs.002` status generation from on-ledger results; `camt.05x` statement generation from settlement events.
  - Idempotent reconciliation keyed by `EndToEndId`/`MsgId`.
  - Reconciliation report plus test coverage across happy-path and exception paths (rejects, timeouts, partials).

### Milestone 3: Atomic DvP + Reusable Library
- **Estimated Delivery:** Month 4.5
- **Focus:** Two-leg settlement and a consumable artifact.
- **Deliverables / Value Metrics:**
  - DvP mapping using CIP-56 allocations (securities-vs-cash) with atomic settlement.
  - Open-source library (JVM) plus CIP-0103 integration layer, published with docs and a quickstart.

### Milestone 4: Conformance Harness, Adoption & Sustainability
- **Estimated Delivery:** Month 6
- **Focus:** Production readiness and real ecosystem usage.
- **Deliverables / Value Metrics:**
  - CI conformance harness any integrator can run, published and documented.
  - A complete reference integration that runs the full inbound and outbound settlement loop on testnet, packaged for direct reuse.
  - Adoption enablement: quickstart, integration guide, and conformance vectors that take an integrator from zero to a passing settlement flow.
  - Documented maintenance plan for ongoing ISO 20022 / CBPR+ annual releases.

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on value to the ecosystem, not artifact delivery:

- A real `pacs.008` produces a valid CIP-56 settlement on Canton, and on-ledger results produce a valid `pacs.002`/`camt.05x` (demonstrated end to end, not mocked).
- The public conformance vectors pass in CI and are reusable by third parties.
- A complete reference integration runs the full inbound and outbound loop on testnet and is reusable by any integrator.
- The supported v1 message set (`pacs.008`, `pacs.002`, `camt.05x`, plus DvP) is live, documented, and conformance-verified.
- Documentation, conformance suite, and a sustainability/maintenance plan are published under Apache-2.0.

---

## Funding

**Total Funding Request:** 1,400,000 CC

The amount reflects the engineering scope: a roughly six-month build of a multi-component system (Message Gateway, Mapping Engine, Settlement Builder, Ledger Client, Reconciliation & Reporting) covering bidirectional translation across four ISO 20022 message types, atomic DvP via CIP-56 allocations, a public conformance suite, a reference integration, and post-grant maintenance against annual ISO 20022 / CBPR+ releases. Each tranche is sized to its engineering scope:

### Payment Breakdown by Milestone
- Milestone 1 (Mapping standard, conformance vectors & working PoC): 350,000 CC upon committee acceptance. Covers the canonical `pacs.008` mapping, the golden-vector corpus, and an end-to-end DevNet PoC.
- Milestone 2 (Reverse path, status & reconciliation): 350,000 CC upon committee acceptance. Covers `pacs.002`/`camt.05x` generation plus idempotent reconciliation and exception handling.
- Milestone 3 (Atomic DvP + reusable library): 400,000 CC upon committee acceptance. The heaviest component: allocation-based two-leg DvP and the published, consumable library.
- Milestone 4 (Conformance harness, adoption & sustainability): 300,000 CC upon final release and acceptance. Covers the CI conformance harness, reference integration, and maintenance plan.

### Volatility Stipulation
The project is scoped to complete in under six months. Should the timeline extend beyond six months due to Committee-requested scope changes, remaining milestones will be renegotiated to account for USD/CC price volatility.

---

## Co-Marketing

Upon release, Nodejumper will collaborate with the Foundation on:

- Announcement coordination tied to the institutional-settlement narrative (JPM Coin, DTCC, Visa).
- A technical blog and reference walkthrough ("driving Canton settlement from ISO 20022").
- Developer enablement: quickstart, conformance suite, and integration office hours.

---

## Motivation

### The opportunity

Canton's reason to exist is regulated, institutional finance, and in 2026 that thesis is live: JPM Coin (Kinexys), DTCC tokenized U.S. Treasuries, and Visa as a Super Validator are all on or onboarding to Canton. Every one of those institutions runs its back office on ISO 20022, now the global standard after the SWIFT/CBPR+ migration (Nov 2025) and Fedwire's move to ISO 20022 (Mar 2025), with mandatory structured-data requirements landing Nov 2026. ISO 20022 is the language of the systems Canton most wants to connect to.

### The gap (Canton is currently absent here)

There is no native ISO 20022 capability on Canton, and the documentation explicitly tells integrators they "must build an intermediary translation layer" themselves. So the single biggest non-crypto onboarding question for an institution is: "How does my existing payment engine settle on Canton without a core-banking rebuild?" Today every institution answers that privately, which duplicates effort, produces fragmented and incompatible mappings, and in many cases blocks adoption because the bridge simply does not exist.

### Why the Development Fund should care

A shared, open-source ISO 20022 ↔ CIP-56 adapter is a public good that:

- **amplifies CIP-56 / CIP-0103.** Every external payment that can be expressed as a CIP-56 transfer makes the token and dApp standards more valuable.
- **benefits a large share of the institutional pipeline.** Banks, PSPs, custodians, and the integrators serving them all need this same layer.
- **removes duplicated, fragmented effort.** One conformance-verified reference replaces many private, incompatible builds.
- **advances stated ecosystem priorities.** It maps directly to App Building / interoperability and the institutional-finance mission.

## Rationale

**Why this approach.** ISO 20022 is the common language of the systems Canton wants to connect to. Meeting institutions where they already are, at the message boundary, is the lowest-friction path to settlement volume, and a reusable reference plus conformance suite is the right shape for a public good (rather than each institution rebuilding privately).

**Why a reference library, not a product.** The genuinely reusable core is the canonical mapping, the message construction, and the conformance vectors. Institution-specific usage-guideline nuances live in configuration, not in the core, so the public good stays thin and broadly reusable while real integrations remain extensible.

**Positioning vs existing proposals (no overlap):**

- **#139 Institutional FX Settlement (Asia)** is a vertical FX application that only claims ISO 20022 compatibility; it does not build a reusable adapter. This is the horizontal mapping library it (and others) could consume.
- **#94 Payment Streams** and **#108 Reference DEX / Settlement Pattern** are the precedent: approved reference implementations in the financial-workflows lane. This adapter is the same category, at the external-messaging boundary.
- We reuse the token-standard registry choice-context (for `disclosedContracts`/`createdEventBlob`) and the Splice token-standard assets rather than reinventing them.

**Why not extend CIP-56 directly.** ISO 20022 translation is an edge concern that spans many institutions and instruments; it does not belong inside the token standard. No CIP-56/CIP-0112 change is required.

---

## Why Nodejumper

Nodejumper is a Proof-of-Stake validator and infrastructure provider, active since early 2022. We operate secure self-managed infrastructure across 20+ networks with 24/7 monitoring, no slashing history, and high uptime. We are a GSF-sponsored Canton Network validator, and our team are working software engineers who ship open-source tools and managed services for the networks we operate. This proposal lands where our two strengths meet: running Canton infrastructure and building reusable developer and settlement tooling.

- **We already operate Canton infrastructure.** We run the same node, Ledger, and registry APIs this adapter integrates with, so we are not learning the platform on the grant. As a long-term validator we also have a clear reason to maintain it after delivery (see below).
- **Proven multi-network reliability.** 20+ mainnets since 2022 with no slashing and automated monitoring and incident response, which is the operational track record needed to run settlement software.
- **Hands-on Canton / CIP-56 / CIP-0103 depth.** We work directly with the token-standard registry APIs, `choiceContextData`, `disclosedContracts`, and ledger-derived `createdEventBlob` handling, which are the exact mechanics this adapter depends on. Our prior Canton dev-fund work (Canton Token Standard Local API Compatibility & CI Harness) shows that.
- **Open-source track record.** We build and maintain reusable tooling, bots, onboarding guides, and dashboards under open licenses, the same kind of public-good work this grant funds.
- **ISO 20022 handled as a correctness problem.** Schema-driven bindings, mappings against CBPR+/HVPS+ usage guidelines, and a public conformance suite that proves every supported flow is spec-correct. Fidelity is verified by the suite, not assumed.

As a standing Canton validator, our commitment does not end at delivery: we will maintain the library against annual ISO 20022 / CBPR+ releases and work with the Foundation on long-term stewardship.