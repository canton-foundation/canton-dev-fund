# CAPS — Canton Access and Privacy Standard

*A Canton Improvement Proposal · RedStone Oracle*

## Abstract

Existing oracle models were designed for public blockchain environments and carry assumptions that are incompatible with institutional finance. Pull-based architectures where a party retrieves a price at the moment of execution provide no canonical fixing: two counterparties to the same transaction may present different yet equally valid prices, with no protocol-level mechanism to establish which governs. This is irreconcilable with audit, dispute resolution, and fiduciary documentation requirements. Conventional push models resolve the ambiguity but introduce a different failure: publishing a single globally readable price contract forces every price consumption event to be disclosed to the oracle operator, systematically leaking portfolio activity, hedging behavior, and transaction intent across carefully maintained confidentiality boundaries.

RedStone proposes a push oracle architecture redesigned from first principles for Canton's privacy model. A feed producer contract published at broad visibility encodes the validation methodology, licensing terms, and governance rules for a given data feed. A credentialed verifier creates a root price capsule from this, establishing the canonical fixing. Consuming institutions then derive scoped capsules with progressively narrower visibility: a vault exposes only the NAV relevant to its two counterparties; a lending protocol sees only the liquidation threshold; a prime broker calculates margin without revealing client identities. Each derived capsule inherits a complete, verifiable audit trail back to the root attestation. Crucially, the oracle operator sees the root and nothing downstream consumption is invisible to the data vendor.

This architecture directly enables the use cases Canton's institutional participants are building toward: NAV feeds for tokenized funds, valuation references for private asset transfers, and composite price inputs for structured products. It provides the price layer that CIP-56 asset workflows and CDM-modelled collateral events implicitly depend on but do not themselves supply, and directly supports the work of the Canton Foundation's Collateral Subcommittee. The core principle that validation correctness and licensing compliance become structural properties enforced by the contract model rather than operational conventions aligns with Canton's broader design philosophy and strengthens the network's value proposition for regulated institutions across every asset class.

By moving price attestation, derivation, and licensing enforcement on-chain as first-class Canton transactions, CAPS converts institutional data consumption into a continuous source of network traffic and burn a market that may exceed asset settlement itself in transaction volume.

## Objective

### How Canton's Unique Features Redefine the Role of Oracles

The pull oracle model presents a theoretically elegant design. Rather than maintaining continuously updated on-chain price state, it relies on cryptographically signed off-chain attestations that are retrieved and submitted on demand. At first glance, this aligns naturally with privacy-preserving execution environments: data need not be globally broadcast, and price visibility can be scoped to only those parties participating in a transaction.

Within the context of Canton Network where contracts are disclosed selectively among identified institutional counterparties and transaction visibility is strictly partitioned this paradigm appears especially coherent. Pull-based retrieval enables participants to access price data only when required, avoiding unnecessary state exposure while preserving flexibility. This architectural intuition informed the initial design direction for RedStone's Canton oracle integration.

A deeper evaluation, however, reveals fundamental limitations when assessed against institutional requirements.

The pull model places a critical responsibility on the transaction submitter: retrieving a signed price certificate from an off-chain endpoint (e.g., HTTP or WebSocket) and including it atomically in the transaction. The issue is not merely technical, but contractual. In the absence of a coordinated fixing mechanism, there is no authoritative answer to which certificate among many valid attestations produced within the same time window constitutes the canonical settlement price.

Two counterparties to the same transaction may independently retrieve certificates that differ in timestamp, aggregation methodology, or confidence interval. Each is cryptographically valid, yet economically distinct. This introduces ambiguity at the exact point where determinism is required.

Traditional financial infrastructure resolves this through formal fixing conventions such as LIBOR submissions, WM/Reuters 4pm fixes, or ISDA fallback frameworks where settlement prices are predefined, auditable, and universally agreed upon. The pull model provides no equivalent. The effective "price" becomes whichever certificate the submitting party happens to include, with no protocol-level mechanism enforcing consistency across participants.

This ambiguity is fundamentally incompatible with institutional requirements for auditability, dispute resolution, and fiduciary accountability.

While in open DeFi environments this manifests as race conditions and exploitable inconsistencies contributing to significant losses across oracle manipulation incidents these outcomes are symptoms of a deeper structural issue: the absence of a canonical, consensus-enforced fixing mechanism.

As a result, adoption of pull-based oracle systems has been limited to latency-sensitive applications such as perpetual derivatives trading. In contrast, lending protocols, collateralized products, and structured financial instruments which collectively account for the majority of on-chain value — require deterministic, reproducible pricing. These systems depend on a single agreed-upon reference price for margin, liquidation, and valuation logic, a property the pull model cannot guarantee.

This gap the absence of a canonical, auditable price fixing mechanism is precisely where Canton Network offers a unique opportunity.

Canton's deterministic execution model, combined with its privacy-preserving contract disclosure framework, allows price fixing itself to become a first-class protocol primitive. Instead of relying on whichever participant submits first, price data can be attested, validated, and consumed within a controlled participant graph, where the fixing event is explicitly defined, recorded, and agreed upon. This transforms pricing from an emergent artifact into a governed, auditable process.

### From Pull to Push: Determinism and Its Trade-offs

The push oracle model directly addresses the determinism problem.

By maintaining a single, authoritatively updated on-chain price written by a credentialed oracle network according to predefined schedules or deviation thresholds it establishes a clear and unambiguous fixing point. All participants observe the same value, and every update is permanently recorded, creating a complete audit trail.

This model simplifies integration and strengthens reliability. Consuming contracts no longer need to handle off-chain retrieval, certificate validation, or transport logic. Price access reduces to a single on-chain read, significantly minimizing implementation risk and operational complexity.

Dispute resolution is also materially improved. The price used in any transaction is directly attributable to a specific oracle update, satisfying evidentiary requirements for institutional participants.

However, applying a naïve push model to Canton introduces a critical conflict.

A globally readable price contract standard in public blockchain architectures violates Canton's core privacy guarantees. In Canton's execution model, reading a contract constitutes a disclosed event to its stakeholders. If the oracle operator is a stakeholder of the price contract, it can observe which participants are accessing which data, when, and how frequently.

This creates a non-trivial information leakage vector. Consumption patterns reveal trading intent, portfolio composition, hedging activity, and transaction timing. What appears to be a passive data lookup becomes, in practice, a signal observable by a third party.

For institutional participants operating under strict confidentiality constraints whether regulatory, contractual, or competitive this is unacceptable. A system that systematically exposes consumption metadata undermines the very privacy guarantees that make Canton valuable.

As a result, simply porting conventional push oracle architectures onto Canton is not viable. It reduces the network to a permissioned ledger with a shared, observable price feed effectively collapsing its privacy model.

The design challenge, therefore, is not choosing between pull and push, but reconciling their strengths:

- Push semantics for determinism, auditability, and canonical fixing
- Scoped visibility for privacy-preserving data consumption

This requires a fundamentally new oracle architecture.

## Implementation Mechanics

The proposed architecture introduces a hierarchical, privacy-preserving push oracle model built natively on Canton's contract system.

> **Diagram (capsule hierarchy):** The Caps Factory (validation rules · licensing · governance) *creates* the Root Capsule (canonical fixing · signed attestation) at **Layer 0 — public · all observers**. From the Root, an *institutional* branch leads to Capsule A (Institutional · sublicensable) and a *commercial* branch leads to Capsule B (Commercial · no redistribution) at **Layer 1 — authorized parties**. Capsule A derives Capsule A1 (*NAV feed*, 2 counterparties) and Capsule A2 (*settlement feed*, custodian scoped); Capsule B derives Capsule B1 (*rate feed only*, single instrument) at **Layer 2 — narrowest scope**. Derivation is strictly attenuating — a child capsule cannot assert rights its parent does not hold.

At its core is a feed producer contract, published with broad but controlled visibility. This contract defines:

- Validation rules (aggregation methodology, deviation thresholds, authorized signers, staleness constraints)
- Licensing terms (who may consume the data, under what conditions, and with what redistribution rights)
- Governance structures (who may derive downstream data capsules and under what constraints)

A credentialed verifier produces price updates by instantiating a root data capsule, which references the feed producer contract and carries a signed attestation.

From this root, participants derive scoped data capsules tailored to their specific disclosure graphs. These derived capsules inherit the validation lineage of the root while restricting visibility to only the relevant counterparties.

Examples include:

- A bilateral derivatives contract exposing price data only to its two counterparties
- A lending protocol receiving only liquidation-relevant thresholds
- A market-making desk accessing pricing without revealing counterparties

Critically, derivation is strictly attenuating. A child capsule cannot grant broader access or redistribution rights than its parent. Licensing is encoded directly into the derivation structure, rather than enforced through off-chain agreements.

Equally important, the oracle operator has no visibility into downstream usage. It cannot observe which derived capsules exist, who consumes them, or how frequently they are accessed.

This architecture mirrors established patterns in enterprise data systems, where hierarchical access control separates rule definition from data consumption. By embedding this model directly into Canton's contract layer, the system achieves:

- Deterministic and auditable price fixing
- Fine-grained privacy controls
- Built-in compliance and governance guarantees

The diagram below illustrates the end-to-end data flow from RedStone's signing infrastructure through Canton's contract layer to the privacy-scoped consumption layer, including the fee distribution path that closes the data economics loop.

> **Diagram (end-to-end sequence):** Participants — RS nodes, Relayer, Factory, Root caps., Auditor, Derived, Consumer. RS nodes send *signed payloads* to the Relayer (off-chain). Crossing the **off-chain · on-chain (Canton)** boundary, the Relayer *submits the feed* to the Factory, which *creates the root* capsule. The Root *notifies the feed* to the Auditor, which responds *acknowledged*. Below the **oracle-visible · privacy-scoped** boundary, an institution *derives a capsule* from the Root; the Consumer *reads the price* from the Derived capsule and *pays an access fee*, which the Derived capsule *shares upstream* to the Factory/Root.

The flow begins off-chain, where RedStone network nodes independently sign price payloads and forward them to the Relayer, which aggregates and submits the feed to Canton. On-chain, the Feed Factory validates the attestation against its encoded rules and creates the Root Capsule establishing the canonical price fix. The Root then notifies the Auditor, which reviews and acknowledges the feed without co-signing. Below the oracle-visibility boundary, an institution derives a scoped capsule from the Root, restricting access to its specific counterparty graph. The Consumer reads the price from its Derived Capsule and pays an access fee, which the Derived Capsule forwards upstream to the Root completing the data economics loop while the oracle operator retains no visibility into who consumed what or when.

## Use Cases

### NAV Fund Feed

A tokenized money market fund publishes its net asset value (NAV) at defined dealing cut-offs. The feed producer contract encodes the calculation methodology and authorized administrators.

The root capsule is shared with transfer agents and custodians. Downstream institutions such as wealth platforms and structured product issuers derive scoped capsules for internal use.

Each participant accesses only the NAV relevant to its holdings. No institution can infer the activity or assets under management of another. Every valuation traces back to a signed, auditable root attestation.

### Private Equity Secondary Pricing

A private company enables secondary share transfers between institutional investors. A valuation agent publishes periodic fair-value assessments via the oracle system.

The root capsule is visible to the cap table administrator and transfer agent. Each transaction derives a capsule visible only to the buyer, seller, and broker.

Transaction-level privacy is preserved: no participant can observe other trades, and the valuation agent cannot infer market activity.

### Structured Products on Private Assets

A bank issues a structured note linked to a basket of private fund NAVs. Multiple underlying feeds each governed by distinct licensing terms are aggregated into a composite price.

The structured product's feed producer contract governs how this basket is consumed by issuers, paying agents, and calculation agents.

Investors receive scoped views tailored to their tranche exposure, without visibility into underlying assets or other investors' positions.

### Canonical Corporate Actions: Efficiency Across Euroclear's Custody Chain

When an issuer depository like Euroclear processes a corporate action a dividend, stock split, or tender offer multiple credentialed verifiers independently extract the event from its unstructured source using different language models and reach consensus on-chain, fixing the agreed record (rate, ratio, record and pay dates, entitlement parameters) as a single signed root capsule that mitigates extraction error.

Each custodian and sub-custodian then derives a scoped capsule exposing only the entitlement relevant to the positions it holds, narrowing at each tier until an end investor sees only its own. No participant can infer another's holdings, the originator retains no visibility into downstream consumption, and every entitlement traces back to the same consensus-validated root.

This replaces the costly, largely manual reconciliation behind today's custody chain with a single canonical fixing consumed under attenuating disclosure.

## Architectural Alignment

The feed producer contract, root capsule, and derived capsule map directly to Canton's native contract primitives: stakeholder sets, events, and the disclosure graph. Derivation attenuation is enforced by contract's code a child contract cannot assert stakeholder rights its parent contract does not hold requiring no off-chain enforcement layer. Price fixing events are recorded as Canton transactions, producing audit trails that satisfy Canton's deterministic execution guarantees without additional instrumentation.

This stands in direct contrast to pull architectures, where price retrieval, certificate validation, and licensing enforcement all occur outside the network entirely suppressing on-chain activity, extracting value from the ecosystem, and reducing Canton to a passive settlement rail. RedStone's on-chain data processing model drives direct demand for network traffic and burn: a continuous stream of attestation, derivation, and fee settlement transactions that, across the full lifecycle of institutional price consumption, may exceed asset settlement itself.

At the ecosystem level, CIP-56 defines asset issuance and DvP settlement but contains no valuation clause every price-dependent lifecycle event in a CIP-56 workflow requires an external reference this proposal supplies. The FINOS CDM implementation demonstrated on Canton models margin and collateral workflows in machine-readable form, but the core event types Valuation, MarginCallIssuance, and Reset each take a price input as a given; this oracle layer is what makes those inputs auditable and dispute-resistant on-chain. The Canton Foundation's Collateral Subcommittee is actively standardizing haircut schedules and margin thresholds, both of which require deterministic price feeds as a direct dependency. Formalizing this model as a CIP would give each of these initiatives a shared, versioned price layer with on-chain governance removing the last unspecified input in Canton's institutional workflow stack.

The CAPS framework including all Daml contracts, derivation logic, and licensing modules — will be released as open source under a permissive license. In regulated financial infrastructure, governing the flow of data is at least as consequential as governing the flow of assets: a single price fixing propagates into margin calls, collateral assessments, and regulatory reports across dozens of counterparties, and every participant in that chain needs to trust the governance envelope independently of who produced the data inside it. Open-sourcing the standard ensures that trust is verifiable, not delegated — any ecosystem participant can audit, adopt, or extend the framework without dependency on a single vendor.

## Backward Compatibility

The validation mechanism underpinning the root data capsule is fully compatible with RedStone's existing on-chain validation contract. The cryptographic primitives ECDSA signature verification over price payloads, timestamp bounds checking, and multi-signer threshold logic are identical to those deployed across RedStone's production infrastructure on EVM chains (Ethereum, Arbitrum, Base, and 70+ others) and non-EVM environments including Solana, SUI, Aptos and Stellar. No changes to RedStone's off-chain signing or aggregation infrastructure are required; the Canton integration consumes the same signed attestations already produced by the oracle network, repackaging them into Canton-native contracts at the ingestion boundary only.

At the Canton protocol level, the oracle architecture is designed to be consumed by CIP-56-compliant asset registries without modification. A CIP-56 asset registry referencing a derived price capsule does so through a standard contract read within Canton's existing stakeholder disclosure model no new APIs, ledger primitives, or wallet-layer changes are required. Any CIP-56 token workflow DvP settlement, collateral allocation, or transfer instruction — that requires a price input can reference a scoped capsule using the same patterns already used for other contract dependencies under the standard.

## Milestones and Deliverables

The following schedule outlines the objective milestones, timelines, deliverables, acceptance criteria, and payment terms for the Canton Access and Privacy Standard (CAPS) grant proposal.

| Milestone | Timeline (in months) | Deliverable | Acceptance Criteria (Concrete Proof of Usage) | Payment (in %) of total 15,775,000 CC |
|---|---|---|---|---|
| 1. Design, Architecture, Technical Specification and Prototyping | M2=M0+2 | Approved Daml data model design, formal threat model (covering oracle-operator communication), and traffic-cost measurement plan vs. Canton fee parameters. | ● Full protocol specification, licensing, and fees management modules published to an open-source GitHub repository.<br>● Derivation scoped read successfully demonstrated, evidenced by a reproducible transaction hash.<br>● Formal CIP accepted by the Canton Foundation committee. | 30% |
| 2. Core Implementation & Zenith ecosystem integrations JGB Repo Integration | M4=M2+2 | EVM/Solidity-facing read interface, SDK scaffolding, and feed configuration logic implemented natively for Zenith EVM environments. | ● Successful execution of the E2E push model utilizing Zenith's EVM external call primitives, evidenced by a documented Mainnet transaction log.<br>● **Production Usage Metric:** Deployment of at least 20 active price feeds on Zenith Mainnet, proven by a verifiable on-chain ledger history of a minimum of **10,000 successful price updates** over a continuous 30-day epoch.<br>● **Targeted Use Case Proof:** Active deployment of rates/pricing feeds to support Zenith's enterprise targets, specifically providing verifiable on-chain collateral valuation pricing for assets deployed for one of Paxos Lab or Ctrl+Alt or another key ecosystem partner to facilitate 10,000 transaction events | 30% |
| 3. Complex Data Processing & Bridge Verification (Memora) | M6=M4+2 | Design of a custom data format for cross-chain asset verification. Indexers and connectors developed for bridging external assets to Canton as native CIP-56 holdings. | ● Implementation of a tailored data structure serving as the independent attestation layer for cross-chain bridging.<br>● **Usage Metric:** Verifiable Mainnet attestation of the initial **$1M+ LP liquidity bridged from Solana or other networks like Stellar and Base to Canton** via Memora's lock-and-mint contracts, relying explicitly on the CAPS framework.<br>● Verifiable transaction logs demonstrating the CAPS framework successfully processing a minimum of 100 distinct bridging events. | 20% |
| 4. Mainnet Rollout with Institutional Grade Price Feeds | M10=M6+4 | Architecture guide, operator runbooks, Daml/EVM consumer quickstarts, monitoring dashboards, and final reference implementations (doc packets) are created and delivered. | ● **Usage Metric:** Active facilitation of Mainnet price data for Temple Digital Group's live trading venues or upcoming physical commodities expansion<br>● (**Volume Metric:** The infrastructure demonstrably processes price updates corresponding to a **threshold of $1M to $2M in facilitated monthly transaction volume** across Temple trading pairs or other DEX trading pairs. | 10% |
| 5. Institutional Asset Onboarding & Final Acceptance | M12=M10+2 | Final project review, CIP supporting evidence compilation, and external security audit. Price/Data feed deployment customized for Tier-1 TradFi asset onboarding. | ● Audit remediation cycle (punch-list items) is closed, and all deliverables are formally accepted by the grant committee.<br>● **Concrete Institutional Proof:** Mainnet deployment of pricing/NAV feeds for a major financial institution (e.g., Hamilton Lane, Apollo, or Spiko). Proven via API access logs or joint public announcement of expanding on Canton or a formal Letter of Dependency provided to the committee, or a verifiable Mainnet transaction hash demonstrating an institutional asset event utilizing CAPS. | 10% |

- **Baseline Valuation:** The total grant request of 15,775,000 CC is calculated using a baseline exchange rate of 1 CC = 0.1160 USD, representing a total project cost of 1,830,000 USD.
- **TWAP Adjustment Mechanism:** To ensure the continuous and reliable funding of RedStone's engineering and audit deliverables, disbursements at each milestone will be adjusted using a 7-day Time-Weighted Average Price (TWAP) immediately preceding the formal acceptance date. This mechanism maintains the baseline fiat equivalent of the milestone budget, protecting the project's operational runway against market volatility while maintaining alignment with the Canton network's long-term utility.

## Cost Proposal

### Cost Breakdown and Estimate

| Sr. No | Item | Cost (in CC) |
|---|---|---|
| A | Development Costs | 11,075,000 |
| | - Dev team, 9 FTE - 6 months | 9,450,000 |
| | - External security audit | 800,000 |
| | - Infrastructure (validator, DevNet/TestNet/MainNet, monitoring) | 825,000 |
| B | Support, 12 months | 4,300,000 |
| | - Maintenance engineer, 2.0 FTE - Daml/backend: protocol upgrades, bugfixes, feed config | 2,600,000 |
| | - SRE on-call, 0.5 FTE - 24/7 feed ops with SLA, incident response | 600,000 |
| | - Infrastructure - Validator node, monitoring stack, environments | 500,000 |
| | - Integration support pool ~250 engineer-hours on demand | 200,000 |
| | - Quarterly audits with regular release related audits | 400,000 |
| C | Production Readiness and engineering risk reserve<br>- Production Hardening and reliability improvements<br>- Edge cases identified during customer/partner acceptance | 400,000 |
| | **Total (A+B+C)**\*\* | **15,775,000** |

- **Baseline Valuation:** The total grant request of 15,775,000 CC is calculated using a baseline exchange rate of 1 CC = 0.1160 USD, representing a total project cost of 1,830,000 USD.
- **TWAP Adjustment Mechanism:** To ensure the continuous and reliable funding of RedStone's engineering and audit deliverables, disbursements at each milestone will be adjusted using a 7-day Time-Weighted Average Price (TWAP) immediately preceding the formal acceptance date. This mechanism maintains the baseline fiat equivalent of the milestone budget, protecting the project's operational runway against market volatility while maintaining alignment with the Canton network's long-term utility.

## Motivation

Canton lacks a standardized, compliant valuation infrastructure the missing primitive that prevents price-dependent workflows from reaching production. Without it, collateral management, NAV-based settlement, and margin workflows cannot meet the audit and evidentiary requirements that regulated institutions are legally held to. This proposal fills that gap directly.

The ecosystem impact is concrete across three dimensions. Canonical fixing eliminates the need for bespoke per-application pricing solutions, reducing operational overhead and integration costs for every participant building on Canton. Privacy-preserving consumption means sophisticated institutional players who cannot accept a data vendor observing their portfolio activity as a side effect of a price lookup can deploy on Canton without compromising their confidentiality obligations, expanding the network's addressable participant base. And auditable lineage, traceable from every valuation event back to a signed, methodology-governed root attestation, gives auditors and regulators a verifiable chain of evidence that satisfies their oversight requirements by construction making Canton a viable venue for regulated financial activity, not just settlement infrastructure.

## Rationale

RedStone evaluated the straightforward path adapting either the pull or push oracle models already deployed across other chains and rejected both. Pull oracles cannot produce a canonical fixing; conventional push oracles leak consumption to the oracle operator. Neither failure can be patched at the integration layer. Rather than forcing either pattern onto an environment it was not designed for, the architecture was built from Canton's own primitives stakeholder-scoped contracts, the disclosure graph, and deterministic transaction execution treating these not as constraints to work around but as the design substrate.

The design satisfies Canton's three non-negotiable requirements by construction. Canonical fixing is produced at the root capsule by a credentialed verifier, establishing a single, unambiguous price event recorded as a Canton transaction. Consumption privacy is preserved because the oracle operator's visibility terminates at the root derived capsules exist outside its stakeholder graph entirely. Auditable lineage is structural: every derived capsule carries a cryptographic reference to its parent, producing an unbroken chain back to the root attestation that satisfies institutional evidentiary standards without additional instrumentation.

The hierarchical architecture is what makes this scalable across complex institutional workflows. Each derived capsule inherits the full validation lineage of its parent but is free to introduce narrower visibility scopes and additional access policies appropriate to its context a bilateral derivatives contract, a fund administrator's NAV feed, a prime broker's margin desk. Attenuation is enforced by the contract model itself: a child cannot assert rights its parent does not hold, making compliance a structural property rather than an operational convention. The result is a single credentialed root that can serve an entire participant graph, with each node consuming exactly the price data it is entitled to and nothing more.

## Appendix - Implementation Draft

The modules below illustrate how CAPS can be expressed in Daml. They are non-normative the specification in the body of this proposal governs but are included to make the contract model concrete and to show that the layering, attenuation, and fee-settlement invariants are enforceable with Canton's native primitives alone.

The sketch is organized as three modules, one per layer of the disclosure hierarchy.

**CAPS.FeedProducer** is the Layer 0 contract the operator signs alone. It carries the feed's identity, validation rules, licensing terms, and the two visibility audiences that govern everything below it: governance (parties permitted to derive) and observers (the broader audience that sees fixings but cannot act on them). Its CreateRoot choice runs the payload through validatePayload and mints a RootCapsule.

**CAPS.Capsule** contains the two templates that do the real work. RootCapsule sits at the oracle-visibility boundary: the auditor can Acknowledge it to leave a timestamped ledger event, and authorized parties call Derive to mint scoped children. Derive enforces the three core CAPS invariants atomically — governance membership, license attenuation against the parent, and upstream fee settlement — before the child exists. DerivedCapsule drops the operator as a stakeholder and lives entirely within a DisclosureScope: a bounded graph of consumers who can ReadPrice, a subset of sub-derivers who can DeriveChild, and an optional expiry. DeriveChild re-applies the same attenuation and fee checks recursively, so rights and audience can only narrow as the chain grows.

**CAPS.Validation** is the shared gate: feed-id equality, m-of-n signatures over an authorized signer set, two-sided timestamp bounds, and ECDSA verification over the canonical payload encoding.

```haskell
module CAPS.FeedProducer where

import CAPS.Licensing (LicensingTerms)
import CAPS.Validation (FeedId, ValidationRules, SignedPricePayload, validatePayload)

-- Layer 0: the governance-bearing contract, widest audience in the chain ----
template FeedProducer
  with
    operator   : Party -- updates the feed and mints Root Capsules
    auditor    : Party -- independent reviewer
    feedId     : FeedId
    rules      : ValidationRules
    licensing  : LicensingTerms -- opaque; defined in CAPS.Licensing
    governance : [Party] -- parties permitted to derive
    observers  : [Party] -- broad visibility audience
  where
    signatory operator
    observer auditor, governance, observers

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
```

```haskell
module CAPS.Capsule where

import CAPS.Validation (SignedPricePayload)
import CAPS.Licensing (LicensingTerms, isAttenuated, narrowerThan)
import CAPS.Fees (settleAccessFee)
import DA.Time
import DA.Assert (assertWithinDeadline)

-- A bounded disclosure graph attached to a derived capsule
data DisclosureScope = DisclosureScope with
    consumers   : [Party] -- may read the price via ReadPrice
    subDerivers : [Party] -- subset of consumers; may DeriveChild
    expiresAt   : Optional Time
  deriving (Eq, Show)

-- Layer 1: canonical fixing — oracle-visibility boundary ---------------------
template RootCapsule
  with
    operator   : Party -- feed operator
    auditor    : Party
    governance : [Party] -- inherited from FeedProducer
    observers  : [Party] -- inherited from FeedProducer
    payload    : SignedPricePayload
    licensing  : LicensingTerms
  where
    signatory operator
    observer auditor, governance, observers

    -- Auditor acknowledges the fixing. The choice body is empty on
    -- purpose: its sole effect is the Canton transaction event, which
    -- leaves a signed, timestamped record of the auditor's participation
    -- in the ledger. The Root is already canonical from the moment it
    -- is created; Acknowledge neither gates nor alters it.
    nonconsuming choice Acknowledge : ()
      controller auditor
      do return ()

    -- Authorized institutions derive scoped capsules below the
    -- oracle-visibility boundary. `governance` defines who is
    -- authorized to derive; broader `observers` can see the fixing
    -- but not create derived capsules.
    nonconsuming choice Derive : ContractId DerivedCapsule
      with
        deriver           : Party
        scope             : DisclosureScope
        attenuatedLicense : LicensingTerms
      controller deriver
      do
        assertMsg "deriver not authorized by feed governance"
          (deriver `elem` governance)

        -- Structural attenuation: child rights ⊆ parent rights.
        assertMsg "license attenuation violated"
          (isAttenuated licensing attenuatedLicense)

        -- Atomic fee settlement upstream to the operator. The deriver
        -- pays for the act of obtaining a scoped capsule from this
        -- root; the resulting DerivedCapsule can then be read by its
        -- consumers without further per-read charges.
        settleAccessFee deriver operator licensing

        create DerivedCapsule with
          rootRef   = self -- cryptographic lineage
          operator         -- propagated for downstream provenance
          parent    = licensing
          licensing = attenuatedLicense
          deriver
          scope
          price      = payload.price
          fixingTime = payload.timestamp

-- Layer 2 (and below): scoped to a specific counterparty graph ---------------
-- The operator is intentionally NOT a stakeholder here.
template DerivedCapsule
  with
    rootRef   : ContractId RootCapsule
    operator  : Party -- feed operator; inherited from the
                      -- parent capsule at derive time and
                      -- thus structurally immutable along
                      -- the chain
    parent    : LicensingTerms
    licensing : LicensingTerms
    deriver   : Party
    scope     : DisclosureScope
    price     : Decimal
    fixingTime : Time
  where
    signatory deriver
    observer scope.consumers

    -- Recursive derivation; attenuation must hold at every step.
    nonconsuming choice DeriveChild : ContractId DerivedCapsule
      with
        childDeriver : Party
        childScope   : DisclosureScope
        childLicense : LicensingTerms
      controller childDeriver
      do
        assertMsg "childDeriver not authorized to sub-derive"
          (childDeriver `elem` scope.subDerivers)
        assertMsg "cannot widen disclosure"
          (childScope.consumers `narrowerThan` scope.consumers)
        assertMsg "sub-derivers must be a subset of consumers"
          (childScope.subDerivers `narrowerThan` childScope.consumers)
        assertMsg "cannot widen license"
          (isAttenuated licensing childLicense)

        -- Sub-derivation fee flows upstream to the feed operator.
        settleAccessFee childDeriver operator licensing

        create DerivedCapsule with
          rootRef
          operator
          parent    = licensing
          licensing = childLicense
          deriver   = childDeriver
          scope     = childScope
          price
          fixingTime

    -- Consumer reads the fixed price.
    nonconsuming choice ReadPrice : (Decimal, Time)
      with
        consumer : Party
      controller consumer
      do
        assertMsg "consumer not in scope"
          (consumer `elem` scope.consumers)

        case scope.expiresAt of
          Some deadline -> assertWithinDeadline "scope expired" deadline
          None          -> return ()

        return (price, fixingTime)
```

```haskell
module CAPS.Validation where

import CAPS.Crypto (verifySignatures)
import DA.Time
import DA.Assert (assertWithinDeadline, assertDeadlineExceeded)
import DA.List (length, all)

-- Common types ----------------------------------------------------------------
type FeedId    = Text
type SignerKey = Text -- hex-encoded public key
type Signature = Text -- hex-encoded ECDSA signature

data ValidationRules = ValidationRules with
    authorizedSigners  : [SignerKey]
    signatureThreshold : Int     -- m-of-n
    maxDelay           : RelTime -- payload may trail ledger time by this much
    maxAhead           : RelTime -- payload may lead ledger time by this much
  deriving (Eq, Show)

data SignedPricePayload = SignedPricePayload with
    feedId     : FeedId
    price      : Decimal
    timestamp  : Time
    signers    : [SignerKey]
    signatures : [Signature]
  deriving (Eq, Show)

-- The validation gate -------------------------------------------------------
validatePayload
  : ValidationRules
  -> FeedId
  -> SignedPricePayload
  -> Update ()
validatePayload rules expectedFeedId payload = do
  assertMsg "feedId mismatch"
    (payload.feedId == expectedFeedId)

  assertMsg "insufficient signatures"
    (length payload.signatures >= rules.signatureThreshold)

  assertMsg "unauthorized signer in set"
    (all (`elem` rules.authorizedSigners) payload.signers)

  assertWithinDeadline
    "payload too stale"
    (addRelTime payload.timestamp rules.maxDelay)

  assertDeadlineExceeded
    "payload timestamp too far in the future"
    (addRelTime payload.timestamp (negate rules.maxAhead))

  -- ECDSA verification over the payload's canonical encoding.
  assertMsg "signature verification failed"
    (verifySignatures
      payload
      rules.authorizedSigners
      rules.signatureThreshold)
```
