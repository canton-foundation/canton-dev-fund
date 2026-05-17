## Development Fund Proposal: Canton Reference Data Oracle Standard (CRDOS) — Privacy-Aware On-Ledger Reference Data for Identified Participants

**Author:** blackthornlover (Bitdynamics)
**Implementing Entity:** Bitdynamics
**Status:** Submitted
**Created:** 2026-03-31

---

## Abstract

This proposal requests funding for an open-source Canton Reference Data Oracle Standard (CRDOS): a community specification and reference implementation that defines how identified, known Canton participants publish authoritative reference data — price feeds, FX fixings, benchmark rates, and index values — to authorized on-ledger consumers, using Canton's native privacy model and institutional reputation as the trust foundation rather than cryptoeconomic staking mechanisms designed for anonymous networks.

Every financial application being built on Canton — DeFi primitives, FX settlement, collateral management, lending markets, structured products — requires access to trusted off-ledger reference data to function correctly. Today there is no Canton-native standard for how such data is published, versioned, consumed, or validated on-ledger. Every team building a financial application invents a private, incompatible oracle integration from scratch, creating duplicated risk and fragmented data quality across the ecosystem.

The core insight that makes a Canton oracle standard fundamentally different from EVM oracle designs is that **Canton is a permissioned network of known, identified institutions.** There are no anonymous actors. A bank or liquidity provider publishing a fabricated FX rate on Canton does not face cryptoeconomic slashing — it faces institutional accountability, regulatory consequence, and permanent reputational damage in a network where every participant knows who they are transacting with. This changes the trust model entirely and makes a much simpler, more privacy-preserving oracle design possible.

The proposed project, **Canton Reference Data Oracle Standard (CRDOS)**, will provide:

- a versioned open specification for how identified Canton participants publish reference data on-ledger with selective disclosure controls
- a reference Daml oracle contract model supporting publication, versioning, staleness management, and consumer authorization
- a TypeScript publisher toolkit for automating reference data feeds from off-ledger data sources
- a consumer integration guide for Canton financial applications that need to read reference data on-ledger without going off-ledger at execution time

The goal is not to build a hosted oracle service, not to create a decentralized oracle network with staking and slashing, not to replicate Chainlink on Canton, and not to mandate a single canonical data source. The goal is to give the Canton ecosystem a shared, open, versioned standard for how trusted on-ledger reference data flows from identified publishers to authorized consumers, preserving Canton's privacy model at every step.

---

## Specification

### 1. Objective

The objective is to reduce the off-ledger coordination cost and data quality fragmentation caused by every Canton financial application team building its own oracle integration, by publishing a concrete, versioned specification and reference implementation for on-ledger reference data publication and consumption that teams can adopt without designing their own oracle model from scratch.

The intended outcome is that a Canton operator or financial application developer can:

- publish authoritative reference data — FX rates, benchmark rates, asset prices, index values — on-ledger under a configurable authorization policy that controls which contracts and counterparties can consume it
- consume that reference data from within Daml contract logic at transaction execution time, without requiring an off-ledger API call during the transaction
- specify staleness bounds and expiry policies so that consuming contracts can detect and reject stale data without additional off-ledger coordination
- version and supersede published data points so that downstream consumers can distinguish current from historical reference values
- operate the oracle in a multi-party Canton environment where the publisher, the consumer, and the regulated counterparties are all identified participants with real-world accountability for the accuracy of the data they publish

This proposal is explicitly framed as **ecosystem infrastructure** and a **shared open standard**, not a hosted oracle service, not a staking-based decentralized oracle network, not a protocol change, and not a KYC or regulatory data verification tool.

### 2. Why Canton's Trust Model Makes This Different

On EVM-based networks, oracle design is dominated by the need to handle anonymous, pseudonymous, and potentially adversarial data publishers. This is why Chainlink uses staking, slashing, aggregation across many nodes, reputation scores, and deviation thresholds — because no single publisher can be trusted and the system must tolerate Byzantine behavior from participants who have no real-world identity or accountability.

Canton operates under a fundamentally different trust model:

- every Canton participant is a known, identified institution or operator that has been onboarded through the Canton Foundation's governance process
- every on-ledger action is cryptographically signed by the publishing party and permanently attributable to them
- publishing fabricated or manipulated reference data on Canton is not a cryptoeconomic attack — it is fraud, regulatory violation, and contractual breach committed by an identified party against other identified parties
- the institutional consequences of publishing bad reference data on Canton are orders of magnitude more severe than any cryptoeconomic slashing mechanism

This means that a Canton oracle does not need staking, does not need aggregation across untrusted nodes, and does not need deviation thresholds designed to tolerate Byzantine publishers. A single identified, regulated institution publishing an FX fixing or benchmark rate on Canton is a credible, auditable, legally attributable data source — because that institution already publishes the same data through regulated channels in traditional finance and is accountable for it.

CRDOS is therefore designed around **identity-backed publication** rather than cryptoeconomic trust, and around **Canton-native selective disclosure** rather than public broadcast.

### 3. Implementation Mechanics

The project will be delivered as:

- a versioned CRDOS specification document covering data model structure, publication policies, consumer authorization, staleness semantics, and versioning behavior
- a reference Daml oracle contract model implementing the specification
- a TypeScript publisher toolkit for automating reference data feeds from off-ledger sources
- a consumer integration guide covering how Canton financial application contracts read oracle data at execution time

#### A. Scope Selection Guide

CRDOS is designed to occupy a well-defined layer in the Canton application stack and to avoid overlapping with adjacent concerns.

Use **off-ledger API calls** when the consuming application does not need the reference data value to be part of the on-ledger transaction record — for example, for display purposes, pre-trade analytics, or non-binding indicative quotes.

Use **CRDOS** when:

- a Daml contract needs to read a reference data value as part of its execution logic — for example, applying an FX rate to a payment amount, checking whether a price is within a defined bound, or computing a margin requirement using a benchmark rate
- the consuming application requires the reference data value to be part of the auditable, on-ledger transaction record so that all signatories can verify what data was used at execution time
- the publisher requires control over which Canton participants and contracts are authorized to consume their published data — for example, a bank publishing proprietary rates only to counterparties with whom they have an active relationship
- the consuming application needs to detect and reject stale data without going off-ledger during transaction execution

This proposal therefore does **not** present CRDOS as a replacement for off-ledger data APIs, a universal data marketplace, or a real-time streaming data layer. It defines the narrow on-ledger reference data primitive that Canton financial applications need at transaction execution time.

#### B. Data Model Structure

The reference specification will define an explicit data model structure so that published reference data is unambiguous, versionable, and consumable by Daml contracts without additional off-ledger translation.

A canonical CRDOS data point will include, at minimum:

- `oracleId` — identifies the canonical oracle feed (e.g., `EUR/USD-ECB-FIXING` or `SOFR-ICE-DAILY`)
- `publisher` — the Canton party identifier of the publishing institution
- `dataType` — one of `FxRate`, `BenchmarkRate`, `AssetPrice`, `IndexValue`, or `CustomScalar`
- `value` — the published scalar value with explicit precision and rounding mode
- `valueCurrency` — denominating currency or unit where applicable
- `effectiveTime` — the ledger time at which the value becomes valid for consumption
- `expiryTime` — the ledger time after which the value must be treated as stale
- `sequenceNo` — monotonically increasing per-feed publication counter for ordering and gap detection
- `sourceReference` — optional external reference to the off-ledger source (e.g., a fixing publication URI or message reference)
- `publicationPolicy` — controls which Canton parties are authorized to consume this data point
- `specVersion` — CRDOS specification version the data point conforms to

#### C. Daml Oracle Contract Model

The reference implementation will define four Daml primitives:

**`OracleFeedPolicy`** — the top-level feed ownership contract. A publisher holds one `OracleFeedPolicy` per oracle feed. The policy records the feed identity, the publisher's authorization to publish for that feed, the publication frequency and staleness bounds, and the consumer authorization model. Only the publisher can create `OracleDataPoint` contracts under a given feed policy.

**`OracleDataPoint`** — the per-publication data contract. Records the reference value, effective time, expiry time, sequence number, source reference, and publication policy. The publication policy determines which Canton parties are authorized to observe this contract and consume its value in Daml choice logic. Superseded by the next publication in the sequence; the previous data point is archived when the next one is published.

**`OracleConsumerAuthorization`** — an explicit authorization contract between the publisher and a consuming party or application. Allows the publisher to grant or revoke a specific counterparty's right to consume a feed without modifying the feed policy itself. Supports time-bounded authorizations and relationship-specific access grants.

**`OracleConsumptionRecord`** — an optional audit artifact created when a Daml contract reads and uses an `OracleDataPoint` value. Records which data point was consumed, at what ledger time, and in what contract context. Provides an immutable on-ledger audit trail of what reference data was used in a given transaction.

#### D. Publisher Trust Model

The publisher trust model is the core design choice that differentiates CRDOS from EVM oracle patterns and makes it appropriate for Canton's permissioned, identity-backed network.

CRDOS does not include staking, slashing, aggregation, or deviation-threshold logic. Instead, the trust model relies on three layers:

**Institutional accountability:** every publisher is a known, identified Canton participant. Publishing fabricated or manipulated data is legally and reputationally attributable to that specific institution. The consequences of data manipulation in Canton are real-world consequences — regulatory action, contractual breach, loss of counterparty relationships — not token slashing.

**On-ledger attribution:** every `OracleDataPoint` is signed by the publisher's Canton party key and permanently recorded on-ledger. There is no ambiguity about who published what value at what time. Disputes about reference data quality can be resolved by examining the on-ledger record.

**Consumer authorization:** publishers control which consuming parties are authorized to use their feeds. A publisher can restrict their FX fixing feed to counterparties with whom they have an established relationship, can revoke access if a consumer misuses the data, and can require that consumers agree to specific data use terms before receiving authorization. This is a bilateral trust relationship, not a permissionless public data broadcast.

CRDOS explicitly documents that applications requiring independent validation of reference data accuracy — for example, comparing a publisher's rate against an external benchmark — must implement that validation in their own application logic. CRDOS provides the on-ledger data delivery mechanism; it does not provide a trust oracle for the accuracy of the published values themselves.

#### E. Consumer Integration Model

The consumer integration model defines how Canton financial application contracts read CRDOS data points at execution time.

A consuming Daml contract reads reference data by:

1. Holding or being authorized to observe the relevant `OracleDataPoint` contract for the required feed
2. Reading the data point value as a contract input to the consuming choice
3. Checking that the data point's `expiryTime` is after the current ledger time — rejecting stale data
4. Checking that the data point's `effectiveTime` is at or before the current ledger time — rejecting future-dated values
5. Optionally creating an `OracleConsumptionRecord` as an audit artifact

This design ensures that the reference data value used in any on-ledger transaction is part of the transaction record, is attributable to a specific publisher, and is verifiable by all transaction signatories.

The consumer integration guide will document reference integration patterns for common financial application scenarios: applying an FX rate to a cross-currency payment, checking a margin requirement against a benchmark rate, and computing a price-adjusted settlement amount.

#### F. Selective Disclosure and Privacy Preservation

The selective disclosure model is the mechanism by which CRDOS preserves Canton's privacy guarantees for sensitive reference data.

Not all reference data is public. A bank publishing proprietary FX rates — rates derived from their own order flow and position management — may not want those rates visible to all Canton participants, because doing so would leak information about their trading book. CRDOS supports this through the publication policy and consumer authorization model.

A publisher can configure their feed as:

**Public** — any Canton participant with a valid `OracleConsumerAuthorization` can observe and consume the data point. Appropriate for publicly available benchmark rates (e.g., ECB FX fixings, SOFR, SONIA) where the publisher is simply providing an on-ledger attestation of a publicly known value.

**Relationship-restricted** — only Canton parties listed in the publisher's consumer authorization allowlist can observe the data point. Appropriate for proprietary rates, indicative quotes, or data with contractual access restrictions.

**Application-scoped** — only specific Daml contract templates authorized by the publisher can consume the data point. Ensures that even authorized counterparties can only consume the data within approved contract contexts, preventing unauthorized re-use or extraction of the reference value.

The privacy model is enforced in the Daml contract model through Canton's standard observer and disclosure mechanisms, not through off-ledger access controls that can be bypassed.

#### G. Staleness and Versioning

The staleness and versioning model ensures that consuming contracts can detect and handle outdated reference data without going off-ledger during transaction execution.

Each `OracleDataPoint` has an explicit `expiryTime`. A consuming contract that receives a data point whose `expiryTime` has passed must treat the data as stale and reject the transaction. This prevents stale reference data from being used in contract execution without the consuming application explicitly handling it.

Publishers update their feeds by creating a new `OracleDataPoint` with a higher `sequenceNo`. The previous data point is archived as part of the same transaction, ensuring that only one current data point exists per feed at any ledger time. Consumers can detect gaps in the sequence by checking that the new `sequenceNo` is exactly one greater than the last consumed value.

The specification will define minimum publication frequency requirements for common data types: intraday for FX rates, daily for benchmark fixings, and configurable for custom scalar feeds. Publishers who fail to publish within the required frequency will have their feed data points expire, causing consuming contracts to reject transactions that depend on the stale feed rather than silently using outdated values.

#### H. Multi-Publisher and Redundancy Patterns

The specification will document reference patterns for scenarios where consuming applications need redundancy across multiple publishers for the same feed:

- a primary-and-fallback pattern where the consuming contract prefers one publisher's feed and falls back to a secondary publisher if the primary is stale
- a median-of-N pattern where the consuming contract computes the median of data points from N authorized publishers and uses the result, appropriate for scenarios where institutional accountability alone is insufficient and additional validation is desired
- a range-check pattern where the consuming contract validates that a single publisher's value falls within a pre-agreed tolerance band of an independent benchmark before accepting it

These patterns are optional and documented as reference integration guidance. The base CRDOS standard does not require any of them.

#### I. Explicitly Out of Scope

To keep the project feasible and non-overlapping, the following are explicitly out of scope:

- staking, slashing, or cryptoeconomic incentive mechanisms for publishers
- a hosted oracle service or centralized data publisher
- real-time streaming data with sub-second latency requirements
- cross-chain data delivery beyond the Canton network
- KYC, AML, or regulatory verification of the accuracy of published values
- dispute resolution mechanisms for contested reference data values
- a data marketplace or commercial licensing layer
- frontend dashboards or data exploration UIs beyond a minimal reference demo

### 4. Architectural Alignment

This proposal aligns with Canton's network-of-networks philosophy because on-ledger reference data is a prerequisite for Canton financial applications to execute their business logic fully on-ledger rather than requiring off-ledger data calls during transaction execution. It is aligned with Development Fund priorities because it delivers:

- shared infrastructure that eliminates duplicated oracle integration work across every Canton financial application
- a public-good specification that makes reference data publication portable and interoperable across the Canton ecosystem
- a trust model that is honest about Canton's actual trust properties — institutional accountability and identity-backed publication — rather than importing EVM oracle designs that were built for a different threat model
- lower barriers to entry for Canton financial application developers who currently have no on-ledger alternative to ad-hoc off-ledger data injection

This is ecosystem infrastructure, not a proprietary data product.

### 5. Delivery Readiness

The initial specification scope is bounded by deliberate choices. The reference implementation covers:

- four Daml primitives covering the full publication, authorization, consumption, and audit lifecycle
- three disclosure tiers (public, relationship-restricted, application-scoped)
- three data types in the initial release (FxRate, BenchmarkRate, AssetPrice)
- one canonical TypeScript publisher integration pattern
- one Canton version range (current stable and one prior) for compatibility

This keeps the first deliverable reviewable and makes the early milestones easy to verify against observable, operator-confirmed outputs.

### 6. Risks and Mitigations

- **Publisher data quality:** CRDOS does not verify the accuracy of published values — it provides attribution and accountability. The specification clearly states that CRDOS is not a data verification tool and that consuming applications requiring validated accuracy must implement their own range checks or multi-publisher patterns.
- **Stale data in long-running contracts:** the staleness model enforces expiry at the Daml contract level, so consuming contracts cannot silently use expired data. Publishers who fail to update their feeds will cause dependent contracts to reject rather than execute on stale values.
- **Privacy of consumer access patterns:** which parties are consuming which oracle feeds is itself sensitive information. The consumer authorization model ensures that publisher-consumer relationships are bilaterally visible to the publisher and the authorized consumer, not to the broader network.
- **Scope creep into a hosted service:** the reference implementation is a deployable contract model and toolkit, not a hosted service. Data sourcing, publishing infrastructure, and commercial data licensing are explicitly out of scope.
- **Backward compatibility of published feeds:** the specification is versioned from day one. Breaking changes to the data model will be managed through a documented migration path and a `specVersion` field on every data point.

### 7. Backward Compatibility

No backward compatibility impact on Canton itself. This project is entirely additive. The specification and reference Daml contracts introduce no changes to Canton protocol behavior, core Canton data structures, or existing Canton node configuration. Applications can adopt CRDOS for new feeds while continuing to use their existing off-ledger data injection patterns for existing contracts during migration.

---

## Milestones and Deliverables

### Milestone 1: Specification Published and First Publisher Feed Validated

- **Estimated Delivery:** 4 weeks
- **Adoption Goal:** At least one Canton operator or financial application team has reviewed the CRDOS specification, provided written feedback incorporated into the final document, and confirmed that the data model structure, publication policy, and staleness semantics are applicable to a real reference data requirement they face without requiring ad-hoc off-ledger data injection.
- **Deliverables / Adoption Criteria:**
  - a versioned CRDOS specification document covering data model structure, publication policies, consumer authorization, staleness semantics, and versioning behavior for the initial three data types (FxRate, BenchmarkRate, AssetPrice)
  - a compatibility matrix documenting which CRDOS features apply to each targeted Canton version
  - a contribution guide and amendment process that at least one external reviewer has used to submit a comment or improvement
  - written confirmation from at least one Canton operator or financial application team that the specification maps cleanly to a reference data requirement they face in a real application without requiring proprietary translation

### Milestone 2: Daml Oracle Contracts Deployed and Validated in a Live Environment

- **Estimated Delivery:** 5 weeks
- **Adoption Goal:** At least one Canton operator or financial application team has deployed the reference Daml oracle contracts against a real (non-sandbox) Canton participant node, published at least one data point for each of the three initial data types, and confirmed that the selective disclosure model correctly controls consumer access in their environment.
- **Deliverables / Adoption Criteria:**
  - reference Daml contracts for `OracleFeedPolicy`, `OracleDataPoint`, `OracleConsumerAuthorization`, and `OracleConsumptionRecord` deployed and confirmed working against a live Canton participant node by at least one external team
  - Daml Script scenarios for publication, consumer authorization, staleness rejection, sequence gap detection, and audit record creation, confirmed correct by at least one external reviewer
  - at least one operator-confirmed deployment demonstrating that the three disclosure tiers (public, relationship-restricted, application-scoped) correctly control consumer access in a non-sandbox environment
  - written confirmation from at least one Canton financial application team that the Daml contract model is legible and correctly models their reference data consumption requirement

### Milestone 3: TypeScript Publisher Toolkit Adopted by at Least One Publisher

- **Estimated Delivery:** 4 weeks
- **Adoption Goal:** At least one Canton operator or financial institution has integrated the TypeScript publisher toolkit into an automated reference data publication workflow, confirmed that the toolkit correctly publishes and supersedes data points on schedule, and confirmed that a consuming Daml contract correctly rejects stale data when publication is delayed.
- **Deliverables / Adoption Criteria:**
  - TypeScript publisher toolkit with feed configuration, data point publication, sequence management, and staleness expiry automation, adopted by at least one external Canton operator or financial institution
  - at least one automated publisher integration confirmed by an external party who has connected the toolkit to a real off-ledger data source and confirmed correct on-ledger publication behavior
  - consumer integration guide reviewed and confirmed complete by at least one developer who has followed it to integrate CRDOS data consumption into a Daml contract without prior knowledge of the implementation
  - written confirmation from at least one Canton financial application team that the consumer integration pattern reduces their off-ledger data injection requirement in a real workflow

### Milestone 4: Multi-Publisher Pattern Validated and Standard Publicly Released

- **Estimated Delivery:** 3 weeks
- **Adoption Goal:** At least three independent Canton operator or financial application teams have adopted some portion of CRDOS — specification, oracle contracts, or publisher toolkit — and the project has been publicly released with documented adoption evidence, so that future teams can start from a validated, community-reviewed baseline rather than designing ad-hoc oracle integrations from scratch.
- **Deliverables / Adoption Criteria:**
  - at least one of the multi-publisher reference patterns (primary-and-fallback, median-of-N, or range-check) confirmed working by at least one operator who has deployed two or more publisher feeds for the same data type
  - at least three independent adoption confirmations documented in the public repository (operator testimonials, linked deployments, or recorded integration walkthroughs)
  - the full CRDOS stack — specification, Daml contracts, TypeScript toolkit, and consumer integration guide — released as open source under a permissive license
  - a recorded end-to-end walkthrough demonstrating a Canton financial application contract consuming an oracle data point at execution time, with staleness rejection demonstrated, usable as an onboarding reference for future Canton financial application builders
  - at least one community contribution (issue, amendment, or extension) submitted and addressed through the published contribution process

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- a versioned CRDOS specification document covering data model structure, publication policies, consumer authorization, staleness semantics, and versioning behavior for the initial data types
- reference Daml contracts implementing the full publication, authorization, consumption, and audit lifecycle, validated by at least one operator against a live Canton node
- Daml Script scenarios proving correct behavior for all three disclosure tiers under publication, consumer authorization, staleness rejection, and sequence gap detection
- a TypeScript publisher toolkit confirmed working in at least one automated, non-sandbox publication workflow
- a consumer integration guide covering how Daml contracts read CRDOS data at execution time for at least two financial application scenarios
- at least one multi-publisher reference pattern confirmed working end to end
- at least three independent adoption confirmations documented in the public repository
- the full project released as open source

Project-specific acceptance conditions:

- the specification must be versioned and include a documented process for community amendments and new data type additions
- the specification must clearly state that CRDOS relies on institutional accountability as its trust model and is not appropriate for anonymous or pseudonymous publisher environments
- the Daml staleness enforcement must be in the contract model, not delegated to off-ledger automation
- the documentation must clearly state that CRDOS does not verify the accuracy of published values and that applications requiring validated accuracy must implement their own range checks or multi-publisher patterns
- the namespace model must require `OracleFeedPolicy` ownership before data points can be published, preventing unauthorized parties from publishing under a feed identity they do not own

---

## Funding

**Total Funding Request:** 1,300,000 CC

### Payment Breakdown by Milestone

- Milestone 1 _(Specification Published and First Publisher Feed Validated)_: 300,000 CC upon committee acceptance
- Milestone 2 _(Daml Oracle Contracts Deployed and Validated in a Live Environment)_: 450,000 CC upon committee acceptance
- Milestone 3 _(TypeScript Publisher Toolkit Adopted by at Least One Publisher)_: 350,000 CC upon committee acceptance
- Milestone 4 _(Multi-Publisher Pattern Validated and Standard Publicly Released)_: 200,000 CC upon final release and acceptance

### Funding Rationale

- Milestone 1 is smaller because it produces a specification document and a first adopter validation rather than running software, but it is the most critical dependency: the data model and disclosure policy design must be correct before any downstream artifact is useful.
- Milestone 2 is the largest because the Daml contract model must correctly enforce three disclosure tiers, staleness semantics, sequence ordering, and audit record creation — and must be validated by a real operator against a live Canton node rather than a sandbox.
- Milestone 3 is substantial because replacing ad-hoc off-ledger data injection with an automated, on-ledger publisher workflow requires genuine application-layer integration work and operator adoption effort to validate correctly.
- Milestone 4 is smaller because it packages and documents the now-proven, operator-validated stack for the broader community and demonstrates multi-publisher redundancy patterns.
- No hosted-service or data sourcing budget is requested in this proposal.

### Volatility Stipulation

If the project duration extends beyond 6 months due to Committee-requested scope changes, remaining milestones should be renegotiated for material CC/USD volatility. No hosted oracle service budget is requested in this proposal. If a later stage justifies broader data type coverage or a governance framework for canonical feed identifiers, a follow-on proposal can extend the CRDOS model under the same versioning framework.

---

## Maintenance and Evolution

The initial grant funds the specification, reference Daml contracts, TypeScript publisher toolkit, and public release. After release, the project will be maintained in the open through repository-based contribution workflows, issue tracking, and versioned releases.

The CRDOS specification is designed to be versioned from day one so that new data types, additional disclosure tiers, or changes to the staleness model can be managed through a documented deprecation cycle rather than silent incompatibility.

The intended long-term path is to keep the specification aligned with Canton's evolving privacy and multi-synchronizer capabilities as the network matures. If appropriate, the specification may be adopted as a Foundation-endorsed standard for reference data publication on the Canton Network. If that path is not immediately appropriate, the project will remain in a public standalone repository with versioned releases, contribution guidelines, and clear Canton version compatibility documentation.

### High-Level Architecture

CRDOS is designed as a narrow standard with three layers:

- a versioned specification layer defining data model structure, publication policies, consumer authorization, staleness semantics, and versioning behavior
- a reference implementation layer consisting of the Daml oracle contracts and the TypeScript publisher toolkit
- an operator documentation layer covering publisher setup, consumer integration, and multi-publisher redundancy patterns for all shipped artifacts

At a high level, an identified Canton institution deploys the reference Daml contracts alongside their Canton participant node, creates an `OracleFeedPolicy` for each data feed they wish to publish, and grants `OracleConsumerAuthorization` to their authorized consuming counterparties. The TypeScript publisher toolkit automates the publication of `OracleDataPoint` contracts on schedule from an off-ledger data source. Canton financial application contracts read the current `OracleDataPoint` as a contract input at execution time, check staleness, and optionally create an `OracleConsumptionRecord` for audit purposes.

## Co-Marketing

Upon release, the implementing entity will collaborate with the Foundation on:

- announcement coordination
- a short technical write-up explaining why Canton's identity-backed trust model enables a simpler and more privacy-preserving oracle design than EVM oracle patterns, and what the correct extension process is for adding new data types
- one operator-facing walkthrough or demo showing a Canton financial contract consuming an FX rate oracle at execution time

Specific commitments:

- publish integration guidance for Canton financial application teams that want to replace off-ledger data injection with CRDOS on-ledger publication
- publish at least one end-to-end example showing a Canton contract applying an FX rate from a CRDOS feed to a cross-currency payment amount

---

## Motivation

Every financial application on Canton ultimately needs to consume off-ledger reference data — FX rates for cross-currency payments, benchmark rates for floating-rate instruments, asset prices for margin calculations, index values for structured product settlements. Today, every team solving this problem independently produces a different, incompatible, and privately maintained oracle integration. Some inject data directly into contract choices as unverified parameters. Some use off-ledger API calls that are not part of the on-ledger transaction record. Some build ad-hoc publisher contracts with no versioning, no staleness management, and no consumer authorization model.

A Canton oracle standard would give the ecosystem:

- a common on-ledger mechanism for reference data consumption that makes the data used in any financial transaction auditable, attributable, and verifiable by all transaction signatories
- a privacy-aware publication model that preserves Canton's privacy guarantees rather than broadcasting reference data to all participants regardless of their authorization
- a trust model honest about Canton's actual properties — institutional accountability and identity-backed publication — rather than importing cryptoeconomic complexity designed for anonymous networks where it does not belong
- lower barriers to entry for Canton financial application developers who currently have no on-ledger standard for reference data and must design their own from scratch for every application

This makes CRDOS a strong candidate for Development Fund support because it is ecosystem infrastructure with compounding returns: every Canton financial application that adopts the standard reduces the off-ledger coordination and data quality risk of every transaction it executes.

---

## Rationale

This proposal is intentionally scoped as a specification and reference implementation for on-ledger reference data publication, not as a hosted oracle service, a decentralized oracle network, or a commercial data licensing product.

That discipline matters for three reasons:

- if the reference data publication model needs to evolve as Canton's privacy and multi-synchronizer capabilities change, the versioned specification and contract model absorb that evolution without requiring all adopters to update simultaneously
- if individual institutions need to extend the data model for proprietary data types or disclosure requirements, the versioned feed policy and contribution process allow that without fragmenting the canonical core
- if the Foundation later decides to adopt CRDOS as an endorsed standard for reference data on the Canton Network, the versioned, open-source, reference-implementation-first approach makes that adoption path straightforward

The project is therefore designed to give Canton financial application builders a shared reference data foundation without claiming to verify data accuracy, provide a commercial data service, or solve every possible oracle topology in one proposal.
