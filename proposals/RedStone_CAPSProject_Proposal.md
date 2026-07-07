**CAPS**

Canton Access and Privacy Standard

*A Canton Improvement Proposal  ·  RedStone Oracle*

# Abstract

Existing oracle models were designed for public blockchain environments and carry assumptions that are incompatible with institutional finance. Pull-based architectures — where a party retrieves a price at the moment of execution — provide no canonical fixing: two counterparties to the same transaction may present different yet equally valid prices, with no protocol-level mechanism to establish which governs. This is irreconcilable with audit, dispute resolution, and fiduciary documentation requirements. Conventional push models resolve the ambiguity but introduce a different failure: publishing a single globally readable price contract forces every price consumption event to be disclosed to the oracle operator, systematically leaking portfolio activity, hedging behavior, and transaction intent across carefully maintained confidentiality boundaries.

RedStone proposes a push oracle architecture redesigned from first principles for Canton’s privacy model. A feed producer contract — published at broad visibility — encodes the validation methodology, licensing terms, and governance rules for a given data feed. A credentialed verifier creates a root price capsule from this, establishing the canonical fixing. Consuming institutions then derive scoped capsules with progressively narrower visibility: a vault exposes only the NAV relevant to its two counterparties; a lending protocol sees only the liquidation threshold; a prime broker calculates margin without revealing client identities. Each derived capsule inherits a complete, verifiable audit trail back to the root attestation. Crucially, the oracle operator sees the root and nothing downstream — consumption is invisible to the data vendor.

This architecture directly enables the use cases Canton’s institutional participants are building toward: NAV feeds for tokenized funds, valuation references for private asset transfers, and composite price inputs for structured products. It provides the price layer that CIP-56 asset workflows and CDM-modelled collateral events implicitly depend on but do not themselves supply, and directly supports the work of the Canton Foundation’s Collateral Subcommittee. The core principle — that validation correctness and licensing compliance become structural properties enforced by the contract model rather than operational conventions — aligns with Canton’s broader design philosophy and strengthens the network’s value proposition for regulated institutions across every asset class.

By moving price attestation, derivation, and licensing enforcement on-chain as first-class Canton transactions, CAPS converts institutional data consumption into a continuous source of network traffic and burn — a market that may exceed asset settlement itself in transaction volume.

# Objective

## How Canton’s Unique Features Redefine the Role of Oracles

The pull oracle model presents a theoretically elegant design. Rather than maintaining continuously updated on-chain price state, it relies on cryptographically signed off-chain attestations that are retrieved and submitted on demand. At first glance, this aligns naturally with privacy-preserving execution environments: data need not be globally broadcast, and price visibility can be scoped to only those parties participating in a transaction.

Within the context of Canton Network — where contracts are disclosed selectively among identified institutional counterparties and transaction visibility is strictly partitioned — this paradigm appears especially coherent. Pull-based retrieval enables participants to access price data only when required, avoiding unnecessary state exposure while preserving flexibility. This architectural intuition informed the initial design direction for RedStone’s Canton oracle integration.

A deeper evaluation, however, reveals fundamental limitations when assessed against institutional requirements.

The pull model places a critical responsibility on the transaction submitter: retrieving a signed price certificate from an off-chain endpoint (e.g., HTTP or WebSocket) and including it atomically in the transaction. The issue is not merely technical, but contractual. In the absence of a coordinated fixing mechanism, there is no authoritative answer to which certificate — among many valid attestations produced within the same time window — constitutes the canonical settlement price.

Two counterparties to the same transaction may independently retrieve certificates that differ in timestamp, aggregation methodology, or confidence interval. Each is cryptographically valid, yet economically distinct. This introduces ambiguity at the exact point where determinism is required.

Traditional financial infrastructure resolves this through formal fixing conventions — such as LIBOR submissions, WM/Reuters 4pm fixes, or ISDA fallback frameworks — where settlement prices are predefined, auditable, and universally agreed upon. The pull model provides no equivalent. The effective “price” becomes whichever certificate the submitting party happens to include, with no protocol-level mechanism enforcing consistency across participants.

This ambiguity is fundamentally incompatible with institutional requirements for auditability, dispute resolution, and fiduciary accountability.

While in open DeFi environments this manifests as race conditions and exploitable inconsistencies — contributing to significant losses across oracle manipulation incidents — these outcomes are symptoms of a deeper structural issue: the absence of a canonical, consensus-enforced fixing mechanism.

As a result, adoption of pull-based oracle systems has been limited to latency-sensitive applications such as perpetual derivatives trading. In contrast, lending protocols, collateralized products, and structured financial instruments — which collectively account for the majority of on-chain value — require deterministic, reproducible pricing. These systems depend on a single agreed-upon reference price for margin, liquidation, and valuation logic, a property the pull model cannot guarantee.

This gap — the absence of a canonical, auditable price fixing mechanism — is precisely where Canton Network offers a unique opportunity.

Canton’s deterministic execution model, combined with its privacy-preserving contract disclosure framework, allows price fixing itself to become a first-class protocol primitive. Instead of relying on whichever participant submits first, price data can be attested, validated, and consumed within a controlled participant graph, where the fixing event is explicitly defined, recorded, and agreed upon. This transforms pricing from an emergent artifact into a governed, auditable process.

## From Pull to Push: Determinism and Its Trade-offs

The push oracle model directly addresses the determinism problem.

By maintaining a single, authoritatively updated on-chain price — written by a credentialed oracle network according to predefined schedules or deviation thresholds — it establishes a clear and unambiguous fixing point. All participants observe the same value, and every update is permanently recorded, creating a complete audit trail.

This model simplifies integration and strengthens reliability. Consuming contracts no longer need to handle off-chain retrieval, certificate validation, or transport logic. Price access reduces to a single on-chain read, significantly minimizing implementation risk and operational complexity.

Dispute resolution is also materially improved. The price used in any transaction is directly attributable to a specific oracle update, satisfying evidentiary requirements for institutional participants.

However, applying a naïve push model to Canton introduces a critical conflict.

A globally readable price contract — standard in public blockchain architectures — violates Canton’s core privacy guarantees. In Canton’s execution model, reading a contract constitutes a disclosed event to its stakeholders. If the oracle operator is a stakeholder of the price contract, it can observe which participants are accessing which data, when, and how frequently.

This creates a non-trivial information leakage vector. Consumption patterns reveal trading intent, portfolio composition, hedging activity, and transaction timing. What appears to be a passive data lookup becomes, in practice, a signal observable by a third party.

For institutional participants operating under strict confidentiality constraints — whether regulatory, contractual, or competitive — this is unacceptable. A system that systematically exposes consumption metadata undermines the very privacy guarantees that make Canton valuable.

As a result, simply porting conventional push oracle architectures onto Canton is not viable. It reduces the network to a permissioned ledger with a shared, observable price feed — effectively collapsing its privacy model.

The design challenge, therefore, is not choosing between pull and push, but reconciling their strengths:

* Push semantics for determinism, auditability, and canonical fixing
* Scoped visibility for privacy-preserving data consumption

This requires a fundamentally new oracle architecture.

---

# Implementation Mechanics

The proposed architecture introduces a hierarchical, privacy-preserving push oracle model built natively on Canton’s contract system.

![Implementation Mechanics Diagram](images/image2.png)

At its core is a feed producer contract, published with broad but controlled visibility. This contract defines:

* Validation rules (aggregation methodology, deviation thresholds, authorized signers, staleness constraints)
* Licensing terms (who may consume the data, under what conditions, and with what redistribution rights)
* Governance structures (who may derive downstream data capsules and under what constraints)

A credentialed verifier produces price updates by instantiating a root data capsule, which references the feed producer contract and carries a signed attestation.

From this root, participants derive scoped data capsules tailored to their specific disclosure graphs. These derived capsules inherit the validation lineage of the root while restricting visibility to only the relevant counterparties.

Examples include:

* A bilateral derivatives contract exposing price data only to its two counterparties
* A lending protocol receiving only liquidation-relevant thresholds
* A market-making desk accessing pricing without revealing counterparties

Critically, derivation is strictly attenuating. A child capsule cannot grant broader access or redistribution rights than its parent. Licensing is encoded directly into the derivation structure, rather than enforced through off-chain agreements.

Equally important, the oracle operator has no visibility into downstream usage. It cannot observe which derived capsules exist, who consumes them, or how frequently they are accessed.

This architecture mirrors established patterns in enterprise data systems, where hierarchical access control separates rule definition from data consumption. By embedding this model directly into Canton’s contract layer, the system achieves:

* Deterministic and auditable price fixing
* Fine-grained privacy controls
* Built-in compliance and governance guarantees

The diagram below illustrates the end-to-end data flow from RedStone’s signing infrastructure through Canton’s contract layer to the privacy-scoped consumption layer, including the fee distribution path that closes the data economics loop.

![End-to-End Data Flow](images/image1.png)

The flow begins off-chain, where RedStone network nodes independently sign price payloads and forward them to the Relayer, which aggregates and submits the feed to Canton. On-chain, the Feed Factory validates the attestation against its encoded rules and creates the Root Capsule — establishing the canonical price fix. The Root then notifies the Auditor, which reviews and acknowledges the feed without co-signing. Below the oracle-visibility boundary, an institution derives a scoped capsule from the Root, restricting access to its specific counterparty graph. The Consumer reads the price from its Derived Capsule and pays an access fee, which the Derived Capsule forwards upstream to the Root — completing the data economics loop while the oracle operator retains no visibility into who consumed what or when.

# Use Cases

## NAV Fund Feed

A tokenized money market fund publishes its net asset value (NAV) at defined dealing cut-offs. The feed producer contract encodes the calculation methodology and authorized administrators.

The root capsule is shared with transfer agents and custodians. Downstream institutions — such as wealth platforms and structured product issuers — derive scoped capsules for internal use.

Each participant accesses only the NAV relevant to its holdings. No institution can infer the activity or assets under management of another. Every valuation traces back to a signed, auditable root attestation.

## Private Equity Secondary Pricing

A private company enables secondary share transfers between institutional investors. A valuation agent publishes periodic fair-value assessments via the oracle system.

The root capsule is visible to the cap table administrator and transfer agent. Each transaction derives a capsule visible only to the buyer, seller, and broker.

Transaction-level privacy is preserved: no participant can observe other trades, and the valuation agent cannot infer market activity.

## Structured Products on Private Assets

A bank issues a structured note linked to a basket of private fund NAVs. Multiple underlying feeds — each governed by distinct licensing terms — are aggregated into a composite price.

The structured product’s feed producer contract governs how this basket is consumed by issuers, paying agents, and calculation agents.

Investors receive scoped views tailored to their tranche exposure, without visibility into underlying assets or other investors’ positions.

## Canonical Corporate Actions: Efficiency Across Euroclear's Custody Chain

When an issuer depository like Euroclear processes a corporate action — a dividend, stock split, or tender offer — multiple credentialed verifiers independently extract the event from its unstructured source using different language models and reach consensus on-chain, fixing the agreed record (rate, ratio, record and pay dates, entitlement parameters) as a single signed root capsule that mitigates extraction error.

Each custodian and sub-custodian then derives a scoped capsule exposing only the entitlement relevant to the positions it holds, narrowing at each tier until an end investor sees only its own. No participant can infer another's holdings, the originator retains no visibility into downstream consumption, and every entitlement traces back to the same consensus-validated root.

This replaces the costly, largely manual reconciliation behind today's custody chain with a single canonical fixing consumed under attenuating disclosure.

# Architectural Alignment

The feed producer contract, root capsule, and derived capsule map directly to Canton’s native contract primitives: stakeholder sets, events, and the disclosure graph. Derivation attenuation is enforced by contract’s code — a child contract cannot assert stakeholder rights its parent contract does not hold — requiring no off-chain enforcement layer. Price fixing events are recorded as Canton transactions, producing audit trails that satisfy Canton’s deterministic execution guarantees without additional instrumentation.

This stands in direct contrast to pull architectures, where price retrieval, certificate validation, and licensing enforcement all occur outside the network entirely — suppressing on-chain activity, extracting value from the ecosystem, and reducing Canton to a passive settlement rail. RedStone's on-chain data processing model drives direct demand for network traffic and burn: a continuous stream of attestation, derivation, and fee settlement transactions that, across the full lifecycle of institutional price consumption, may exceed asset settlement itself.

At the ecosystem level, CIP-56 defines asset issuance and DvP settlement but contains no valuation clause — every price-dependent lifecycle event in a CIP-56 workflow requires an external reference this proposal supplies. The FINOS CDM implementation demonstrated on Canton models margin and collateral workflows in machine-readable form, but the core event types — Valuation, MarginCallIssuance, and Reset — each take a price input as a given; this oracle layer is what makes those inputs auditable and dispute-resistant on-chain. The Canton Foundation’s Collateral Subcommittee is actively standardizing haircut schedules and margin thresholds, both of which require deterministic price feeds as a direct dependency. Formalizing this model as a CIP would give each of these initiatives a shared, versioned price layer with on-chain governance — removing the last unspecified input in Canton’s institutional workflow stack.

The CAPS framework — including all Daml contracts, derivation logic, and licensing modules — will be released as **open source** under a permissive license. In regulated financial infrastructure, governing the flow of data is at least as consequential as governing the flow of assets: a single price fixing propagates into margin calls, collateral assessments, and regulatory reports across dozens of counterparties, and every participant in that chain needs to trust the governance envelope independently of who produced the data inside it. Open-sourcing the standard ensures that trust is verifiable, not delegated — any ecosystem participant can audit, adopt, or extend the framework without dependency on a single vendor.

# Backward Compatibility

The validation mechanism underpinning the root data capsule is fully compatible with RedStone’s existing on-chain validation contract. The cryptographic primitives — ECDSA signature verification over price payloads, timestamp bounds checking, and multi-signer threshold logic — are identical to those deployed across RedStone’s production infrastructure on EVM chains (Ethereum, Arbitrum, Base, and 70+ others) and non-EVM environments including Solana, SUI, Aptos and Stellar. No changes to RedStone’s off-chain signing or aggregation infrastructure are required; the Canton integration consumes the same signed attestations already produced by the oracle network, repackaging them into Canton-native contracts at the ingestion boundary only.

At the Canton protocol level, the oracle architecture is designed to be consumed by CIP-56-compliant asset registries without modification. A CIP-56 asset registry referencing a derived price capsule does so through a standard contract read within Canton’s existing stakeholder disclosure model — no new APIs, ledger primitives, or wallet-layer changes are required. Any CIP-56 token workflow — DvP settlement, collateral allocation, or transfer instruction — that requires a price input can reference a scoped capsule using the same patterns already used for other contract dependencies under the standard.

# Milestones and Deliverables

## Milestone 1: Specification & Architecture
* **Estimated Delivery:** Week 3
* **Focus:** Finalize the formal specification of the feed producer contract, root capsule, derived capsule data models, and attenuation rules. Define the licensing module — including consumption rights, redistribution conditions, and license class encoding. Design the flow of funds model governing data economics between producers, verifiers, and consumers. Specify contract interfaces for all integration points.
* **Deliverables / Value Metrics:** Published technical specification; Daml data model definitions; licensing module specification; flow of funds design document; contract interface definitions.

## Milestone 2: Core Contract Implementation
* **Estimated Delivery:** Week 14
* **Focus:** Full implementation of the feed producer contract, root capsule, derived capsule hierarchy, attenuation enforcement, licensing module, and flow of funds logic in Daml. Integrate RedStone’s cryptographic validation logic at the root boundary and verify equivalence with production deployments on other chains.
* **Deliverables / Value Metrics:** Complete contract suite deployed on Canton testnet; passing validation and attenuation test suite; licensing and fee distribution logic verified; documented cryptographic equivalence with RedStone’s existing signing infrastructure.

## Milestone 3: Off-Chain SDK & Services
* **Estimated Delivery:** Week 19
* **Focus:** Build the off-chain layer required for production integration: client SDK for consuming derived capsules, relayer infrastructure for publishing root price updates to Canton, and connectors and indexers as tooling for projects and consumers building on top of the oracle layer.
* **Deliverables / Value Metrics:** Published SDK with documented API; deployed relayer service on devnet; connector and indexer implementations covering primary consumption patterns; end-to-end integration test suite covering on-chain and off-chain components.

## Milestone 4: Production Deployment & Operations
* **Estimated Delivery:** Week 23
* **Focus:** Mainnet deployment to production-grade service standards. Establish monitoring, alerting, and incident response procedures. Validate SLA commitments for price update latency, availability, and staleness thresholds. Commission independent security audit of all Canton contracts and off-chain components.
* **Deliverables / Value Metrics:** Mainnet deployment; operational runbook; monitoring dashboard; documented SLAs; external audit initiated and in progress.

## Milestone 5: Audit Resolution, Documentation & Ecosystem Integration
* **Estimated Delivery:** Week 26
* **Focus:** Receive and address all audit findings — implementing fixes, improvements, and mitigations. Produce all materials required for ecosystem adoption: developer documentation, integration guides, training materials, and onboarding resources for new participants. Deliver reference implementations and annotated examples covering the primary use cases — NAV fund feed, private equity secondary pricing, and structured product basket price. Submit the oracle data governance standard as a formal Canton Improvement Proposal.
* **Deliverables / Value Metrics:** Published audit report with all findings resolved; complete developer documentation and integration guide; training and onboarding materials; three reference implementations with annotated examples on mainnet; formal CIP submission to the Canton Foundation.

## Adoption Milestone 1: First Production Integration
* **Timeline:** Month 1–2
* **Deliverable:** Onboard the first commercial partner with 10 high-frequency price feeds updating every 10 seconds. Validate end-to-end performance, latency SLAs, and fee distribution under sustained production load. One partner live on mainnet with published performance report and validated fee distribution through the capsule hierarchy.
* **Annualized Traffic:** (4 KB + 10 ? 12 KB) ? 259,200 updates/month ? 12 = ~350 GB/year (~150M CC/year)

## Adoption Milestone 2: Broad Ecosystem penetration
* **Timeline:** Month 2–6
* **Deliverable:** Achieve broad adoption with 5+ commercial partners spanning tokenized funds, fixed income, and structured products. CAPS established as the default data governance layer for price-dependent Canton workflows, with community contributions to the open-source framework and a formal governance process for new data profiles and capsule types.
* **Annualized Traffic:** ~750 GB/year (~300M CC/year)

## Adoption Milestone 3: Bringing flagship partners to Canton
* **Timeline:** Month 1-12
* **Deliverable:** Bring flagship projects and institutions from the RWA frontier — tier-one asset managers, global custodians, and large-scale tokenization platforms — onto Canton with CAPS as the price and data-governance layer for their tokenization programs. Each engagement is backed by dedicated solutions architecture, embedded engineering support, and a capsule hierarchy tailored to the institution's full distribution graph. Each flagship integration produces a reference architecture and co-authored case study, lowering the barrier for the next wave of institutional adoption and turning every onboarding into an accelerant for the one that follows.

**Shortlist of partners actively exploring Canton expansion with RedStone:**
* **Hamilton Lane (SCOPE - Private Credit).** Hamilton Lane ($900B+ AUM) offers SCOPE, an evergreen senior private credit fund already tokenized across Polygon, Solana, Aptos, Sei and more networks. Canton is the natural next step to reach institutional, privacy-sensitive TradFi allocators, with RedStone providing the NAV and price feeds for the fund.
* **Re (reUSD - Reinsurance).** Re is a decentralized onchain reinsurance marketplace, with reUSD as a principal-protected, yield-accruing senior token tracking risk-free rate +250bps. Canton's privacy-preserving design is uniquely suited for further growth of the asset, which has gained strong momentum with a 130% increase in AUM YTD, and RedStone supplies the NAV feeds that make reUSD usable as collateral.
* **Fasanara (F-ONE - Alternative Credit).** Fasanara is an FCA-regulated alternative credit manager (~$1B+ AUM), with the F-ONE fund covering fintech receivables, SME lending, and delta-neutral digital strategies. F-ONE is already tokenized via Midas as mF-ONE and scaled to ~$190M AUM as the leading RWA market on Morpho. Canton expansion unlocks the bank and asset-manager segment that demands privacy and settlement guarantees, with RedStone providing the underlying credit NAV feeds.
* **Spiko (EUTBL, USTBL & SPKCC - Treasury Bills).** Spiko runs the first AMF-approved tokenized money market funds in the EU, backed by Eurozone and U.S. T-Bills with $1B+ AUM. The Cash & Carry product (SPKCC) offers an alternative asset for allocators looking for higher-yield exposure. Their regulated, daily-liquid structure is the cleanest cash-equivalent primitive for Canton's institutional users, with RedStone delivering the NAV and reference data.

# CAPS-Development and Support Plan

Six-month development program delivering CAPS to Canton MainNet — core protocol, fee and royalty add-ons, off-chain components, tooling, and EVM L2 readiness — followed by 18 months of support. Total budget: $2.0M at market-rate engineering.

The plan is anchored to the existing Canton governance and standards landscape: contract interfaces follow the CIP-0056 token-standard pattern, fee and metering events are structured for CIP-0104 traffic-based app rewards, and the upgrade path reflects Splice 0.6.0 / Canton 3.x operational lessons (CIP-0089). The CIP itself proceeds through the standard CIP-0000 process with community consultation in Stage 1.

**Timeline at a glance**

| Stage | Timing | Outcome |
| :--- | :--- | :--- |
| 1. Foundation & CIP consultation | M1–M2 | Spec locked, DevNet demo, CIP in community review |
| 2. Core protocol | M2–M4 | Core suite feature-complete on DevNet |
| 3. Protocol add-ons | M4 | Fees and royalties live on DevNet |
| 4. Off-chain components & tooling | M2–M5 | Partner-operable deployment |
| 5. EVM L2 readiness | M5 | Atomic cross-environment read demo |
| 6. Hardening & MainNet | M5–M6 | MainNet live, CIP approval target |
| 7. Docs, examples, first integrations | M5? | Integration-ready, first partners onboarded |
| Support | M7–M24 | Ops, upgrades, integration support |

## Stage 1 — Foundation & CIP Consultation (M1–M2)
**Protocol spec**
* Daml data model: root capsule, derivation tree, entitlement schema, party topology
* Entitlement semantics: read scopes, delegation, revocation, expiry
* CDM event mapping: Valuation, MarginCallIssuance, Reset ? capsule lifecycle
* Interfaces follow the CIP-0056 Daml-interface pattern; direct alignment with token-standard DvP flows

**Efficiency baseline (spec constraints, not later optimization)**
* Compact binary encoding for fixings
* Batched multi-feed format: one transaction = N feeds in single payload
* Verification cost scalability in regard to payload size
* Traffic-cost model vs. Canton fee parameters (informee scaling, read/write factors), validated on DevNet and retested on Mainnet

**CIP process**
* Draft per CIP-0000; discussion on cip-discuss; GitHub PR prepared with a CIP editor
* Consultation rounds: asset issuers, data licensors, Super Validators, Digital Asset, broader Canton community
* Feedback log with accept/reject rationale; spec lock at end of M2

**Engineering setup**
* DevNet deployment, CI/CD, Daml test harness
* Feed adapter skeleton: RedStone source ? signing ? submission

*Milestone: Fixing ? derivation ? scoped read on DevNet; CIP in community review; traffic-cost model published.*

## Stage 2 — Core Protocol (M2–M4)
**Contracts**
* Root fixing: canonical attestation, versioning, signing scheme
* Derive/DeriveChild flows building the scoped disclosure graph
* Per-consumer access entitlements enforced at contract level
* Update triggers: deviation thresholds, scheduled cut-offs, settlement-event materialization
* Capsule lifecycle: rotation, archival, supersession, dispute/audit views
* Minimal informee set per capsule — privacy guarantee doubles as cost guarantee under Canton's UTXO/stakeholder model
* Evaluate Daml explicit disclosure for one-shot reads by non-stakeholders

**Payload size optimization**
* Batched multi-feeds
* Possible delta encoding for high-cadence updates
* Bytes-per-fixing and bytes-per-derivation tracked in CI with regression gates

**Verification efficiency**
* Batched verification
* Derived capsules inherit validity from parent — no signature re-verification downstream
* Validation-cost benchmarks on DevNet (Super Validator confirmation load)

**Quality**
* Adversarial and negative-path test suites; property-based tests on the derivation tree
* Internal security checkpoint at feature-complete

*Milestone: Core feature-complete on DevNet; payload and verification benchmarks published; audit surface locked.*

## Stage 3 — Protocol Add-ons (M4, 1 month)
**Fee & royalty module (separate layer, independently upgradeable)**
* Access-fee settlement: per-read and subscription, CC-denominated
* Royalty / revenue-share for upstream data licensors
* On-chain licensing terms: usage class, redistribution rights, term limits
* Usage metering and billing-event emission for off-chain reconciliation
* Settlement paths simplified by CIP-0078 (no CC transfer fees)

**Tokenomics alignment**
* Fee/metering events structured so traffic accrues to RedStone and licensors under CIP-0104 (traffic-based app rewards)
* Compatibility notes for CIP-0047 activity markers (or other introduced economic models)
* One-page tokenomics note: expected burn per integration profile (CIP supporting material + BD collateral)

*Milestone: Fees and royalties live on DevNet; tokenomics note published.*

## Stage 4 — Off-chain Components & Tooling (M2–M5, parallel track)
In priority order:
1. **Relayers & NAV connectors (core)**
   * Production relayer: retry, failover, multi-region redundancy
   * Signer key management with rotation procedures
   * Trigger engine: full-cadence off-chain evaluation, on-chain materialization only on threshold/cut-off
   * NAV connector scaffolding: standardized intake formats, validation rules, scheduled publication windows
   * One reference connector for a live fund-administrator format
2. **Indexing**
   * Capsule-tree indexer reconstructing the derivation graph
   * Consumption and fee-event indexing
   * Query API for audit/reporting; OpenAPI shape per CIP-0056 pattern, Scan-API-compatible
3. **Monitoring dashboards**
   * Feed health, staleness, SLA metrics, alerting wired to on-call
   * Traffic/burn per capsule — ties operations directly to CIP-0104 rewards
4. **CLI**
   * Deployment, capsule creation/derivation, entitlement management, feed configuration, key ceremony helpers
5. **GUI (last)**
   * Compliance interface: entitlement administration, fixing setup, audit-trail views with exportable evidence

*Milestone: A partner deploys and operates CAPS without our engineers in the loop.*

## Stage 5 — EVM L2 Readiness (M5, 1 month)
* Solidity-facing read interface for Zenith-class EVM environments on Canton
* Adapter preserving scoped disclosure across the Daml?EVM boundary — no privacy bypass via EVM reads
* Reference consumer contracts: price read, staleness check, settlement trigger
* EVM payload reuses RedStone calldata-optimized verification; Merkle-batched root maps to per-feed calldata proofs (gas parity with existing RedStone EVM deployments)
* Hardhat tooling and integration tests
* Joint atomic cross-environment read demo with the Zenith team (Tier-1 Super Validator)

*Scoped to readiness, not productization — production hardening of the EVM path falls under support or a follow-on engagement.*

## Stage 6 — Hardening & MainNet (M5–M6)
**Security**
* Internal review: signature aggregation, key rotation, derivation integrity, proof verification
* Threat model sign-off: oracle-operator compromise, entitlement escalation, stale-data attacks
* External audit (Daml core + add-ons + EVM interface) with remediation cycle

**Performance**
* Load testing at institutional cadence
* Verification-cost and payload benchmarks at scale, published as CIP supporting evidence
* Traffic-cost model validated against measured MainNet-configuration numbers

**Operations & upgrade readiness**
* Clean smart-contract-upgrade path, minimal package lineage (per Splice 0.6.0 / Canton 3.x validator-burden lessons, CIP-0089) evaluated against SCU
* Runbooks, incident playbooks, key ceremonies
* Staged MainNet rollout

*Milestone: MainNet live; CIP approval target; audit report and benchmark annex published.*

## Stage 7 — Docs, Examples, First Integrations (M5 onward, into support)
* Architecture guide, entitlement and fee configuration docs
* Quickstarts for Daml-native and EVM consumers
* Reference implementations: DvP against CIP-0056 token-standard assets, collateral/margin (CDM), lending thresholds, NAV publication
* Worked cost examples: bytes and CC per integration pattern
* Hands-on support for first integrations as they arrive
* Early-integrator feedback feeds the tooling backlog

## Support (M7–M24)
* Protocol maintenance: upgrades tracking Canton/Daml/Splice releases with orchestration for connected parties, bugfixes, feed configuration changes
* 24/7 feed operations with SLA, incident response, monitoring upkeep
* Maintenance of tooling and the EVM consumption layer
* Integration support pool: ~250 engineer-hours on demand for partner integrations

*Work beyond the integration pool — heavy institutional integrations, new asset-class connectors — is scoped as a separate engagement.*

## Cost Estimate

**Team — development phase (M1–M6, 9 FTE)**

| Role | FTE | Focus |
| :--- | :--- | :--- |
| Tech lead / Canton architect | 1.0 | Spec, CIP |
| Daml engineers | 2.0 | Core + add-ons |
| Oracle/backend engineers | 2.0 | Relayers, connectors, pipeline |
| EVM/Solidity engineer | 1.0 | Zenith readiness |
| QA / tester | 1.0 | Test suites |
| Full-stack engineer | 0.5 | GUI, dashboards |
| Security engineer | 0.5 | Internal audits, crypto checks |
| DevOps / SRE | 0.5 | Environments, monitoring |
| Integration / delivery lead | 0.5 | Docs, partners |

**Budget (~$2.0M total)**

| Item | Cost |
| :--- | :--- |
| Dev team, 9 FTE ? 6 months @ blended $260k/yr loaded | $990k |
| External security audit | $180k |
| Infrastructure (validator, DevNet/TestNet/MainNet, monitoring) | $100k |
| Development subtotal | $1,270k |
| Support, 18 months (detail below)** | $510k |
| Contingency | $50k |
| **Total** | **$1,830k** |

**\*\*Support detail (M7–M24, $500k)**

| Item | Scope | Cost |
| :--- | :--- | :--- |
| Maintenance engineer, 1.0 FTE | Daml/backend: protocol upgrades, bugfixes, feed config | $325k |
| SRE on-call, 0.3 FTE | 24/7 feed ops with SLA, incident response | $95k |
| Infrastructure | Validator node, monitoring stack, environments | $54k |
| Integration support pool | ~250 engineer-hours on demand | $36k |
| **Total** | | **$510k** |

---

# Motivation

Canton lacks a standardized, compliant valuation infrastructure — the missing primitive that prevents price-dependent workflows from reaching production. Without it, collateral management, NAV-based settlement, and margin workflows cannot meet the audit and evidentiary requirements that regulated institutions are legally held to. This proposal fills that gap directly.

The ecosystem impact is concrete across three dimensions. Canonical fixing eliminates the need for bespoke per-application pricing solutions, reducing operational overhead and integration costs for every participant building on Canton. Privacy-preserving consumption means sophisticated institutional players — who cannot accept a data vendor observing their portfolio activity as a side effect of a price lookup — can deploy on Canton without compromising their confidentiality obligations, expanding the network’s addressable participant base. And auditable lineage, traceable from every valuation event back to a signed, methodology-governed root attestation, gives auditors and regulators a verifiable chain of evidence that satisfies their oversight requirements by construction — making Canton a viable venue for regulated financial activity, not just settlement infrastructure.

# Rationale

RedStone evaluated the straightforward path — adapting either the pull or push oracle models already deployed across other chains — and rejected both. Pull oracles cannot produce a canonical fixing; conventional push oracles leak consumption to the oracle operator. Neither failure can be patched at the integration layer. Rather than forcing either pattern onto an environment it was not designed for, the architecture was built from Canton’s own primitives — stakeholder-scoped contracts, the disclosure graph, and deterministic transaction execution — treating these not as constraints to work around but as the design substrate.

The design satisfies Canton’s three non-negotiable requirements by construction. Canonical fixing is produced at the root capsule by a credentialed verifier, establishing a single, unambiguous price event recorded as a Canton transaction. Consumption privacy is preserved because the oracle operator’s visibility terminates at the root — derived capsules exist outside its stakeholder graph entirely. Auditable lineage is structural: every derived capsule carries a cryptographic reference to its parent, producing an unbroken chain back to the root attestation that satisfies institutional evidentiary standards without additional instrumentation.

The hierarchical architecture is what makes this scalable across complex institutional workflows. Each derived capsule inherits the full validation lineage of its parent but is free to introduce narrower visibility scopes and additional access policies appropriate to its context — a bilateral derivatives contract, a fund administrator’s NAV feed, a prime broker’s margin desk. Attenuation is enforced by the contract model itself: a child cannot assert rights its parent does not hold, making compliance a structural property rather than an operational convention. The result is a single credentialed root that can serve an entire participant graph, with each node consuming exactly the price data it is entitled to and nothing more.

# Appendix - Implementation Draft

The modules below illustrate how CAPS can be expressed in Daml. They are non-normative — the specification in the body of this proposal governs — but are included to make the contract model concrete and to show that the layering, attenuation, and fee-settlement invariants are enforceable with Canton's native primitives alone.

The sketch is organized as three modules, one per layer of the disclosure hierarchy.

CAPS.FeedProducer is the Layer 0 contract the operator signs alone. It carries the feed's identity, validation rules, licensing terms, and the two visibility audiences that govern everything below it: governance (parties permitted to derive) and observers (the broader audience that sees fixings but cannot act on them). Its CreateRoot choice runs the payload through validatePayload and mints a RootCapsule.

CAPS.Capsule contains the two templates that do the real work. RootCapsule sits at the oracle-visibility boundary: the auditor can Acknowledge it to leave a timestamped ledger event, and authorized parties call Derive to mint scoped children. Derive enforces the three core CAPS invariants atomically — governance membership, license attenuation against the parent, and upstream fee settlement — before the child exists. DerivedCapsule drops the operator as a stakeholder and lives entirely within a DisclosureScope: a bounded graph of consumers who can ReadPrice, a subset of sub-derivers who can DeriveChild, and an optional expiry. DeriveChild re-applies the same attenuation and fee checks recursively, so rights and audience can only narrow as the chain grows.

CAPS.Validation is the shared gate: feed-id equality, m-of-n signatures over an authorized signer set, two-sided timestamp bounds, and ECDSA verification over the canonical payload encoding.

```daml
module CAPS.FeedProducer where

import CAPS.Licensing (LicensingTerms)
import CAPS.Validation (FeedId, ValidationRules, SignedPricePayload, validatePayload)

-- Layer 0: the governance-bearing contract, widest audience in the chain ----

template FeedProducer
  with
    operator   : Party              -- updates the feed and mints Root Capsules
    auditor    : Party              -- independent reviewer
    feedId     : FeedId
    rules      : ValidationRules
    licensing  : LicensingTerms     -- opaque; defined in CAPS.Licensing
    governance : [Party]            -- parties permitted to derive
    observers  : [Party]            -- broad visibility audience
  where
    signatory operator
    observer  auditor, governance, observers

    nonconsuming choice CreateRoot : ContractId RootCapsule
      with
        payload : SignedPricePayload
      controller operator
      do
        validatePayload rules feedId payload

        create RootCapsule with
          operator
          auditor
          governance
          observers
          payload
          licensing

------------------------------------------------------------------------

module CAPS.Capsule where

import CAPS.Validation (SignedPricePayload)
import CAPS.Licensing (LicensingTerms, isAttenuated, narrowerThan)
import CAPS.Fees (settleAccessFee)
import DA.Time
