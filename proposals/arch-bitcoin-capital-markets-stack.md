# Development Fund Proposal

## Arch–Canton Bridge: Leverage and Yield Infrastructure for CBTC

Author: Arch Network (Matt Mudano)

Daml Development Partner: IntellectEU

Decentralized Party Management: Decentralization Manager (BitSafe, open source)

Status: Draft

Created: 2026-04-01

Last revised: 2026-06-03

Total Funding Request: $150,000 USD (payable in CC equivalent)

## Abstract

This proposal requests $150,000 to build an open-source bridge that connects CBTC — BitSafe's institutional wrapped Bitcoin on Canton — to the Arch Bitcoin capital markets stack.

The bridge lets CBTC route through the same capital markets flow Arch already operates for institutional BTC: a platform of structured carry trades where Bitcoin is levered at the sharpest available rates and deployed into traditional finance vehicles managed by institutional asset managers. Today CBTC is high-quality collateral with no native path to leverage or managed yield. This bridge adds that utility.

The funded deliverable is the bridge itself — open-source, public-good infrastructure built on Canton in Daml by IntellectEU. The Decentralized Party that controls the bridge is governed by the Decentralization Manager, BitSafe's open-source application for managing Decentralized Parties on Canton. The structured-products platform the bridge unlocks, and the Canton-deployed application through which Canton participants access it, are built and maintained by Arch Network at its own cost. The grant funds the public good; Arch funds and operates the commercial layer on top of it.

The underlying Arch capital markets infrastructure (consensus, execution, settlement, credit, and the carry-trade platform) is already built and deployed. This proposal funds only the Canton-side bridge and integration layer.

## Specification

### 1. Objective

Add leverage and yield optionality to CBTC by connecting it to the Arch Bitcoin capital markets stack. Specifically:

- Route CBTC into productive capital markets flow. CBTC is a 1:1 Bitcoin-backed, CIP-56 asset built for institutional trading, lending, and settlement. It is excellent collateral, but Canton has no native mechanism to lever it and deploy the proceeds into managed yield. The Arch–Canton Bridge provides that mechanism, letting CBTC flow through Arch's existing structured carry-trade platform and return a net yield position to its holder.
- Give Canton participants institutional yield optionality on Bitcoin. Through the bridge, a CBTC holder can take a leveraged position against their Bitcoin and deploy it into traditional finance vehicles — on-chain or off-chain — managed by institutional asset managers, while holding a single, transparent structured position with a defined loan-to-value, a net yield, and accrued-income tracking.

### 2. Component: Arch–Canton Bridge (the funded public good)

The funded deliverable is a bidirectional bridge contract connecting CBTC on Canton to the Arch capital markets stack. IntellectEU leads the Canton-side Daml build. The Decentralization Manager controls the Decentralized Party that governs the bridge's authority on Canton, so no single operator controls bridge custody or attestation.

Bridge characteristics:

- Bidirectional. CBTC can be committed to the bridge to enter the Arch capital markets flow, and positions, yield, and principal settle back to the holder's CBTC on Canton.
- Decentralized authority. The bridge's controlling party is a Decentralized Party governed by the Decentralization Manager — the same coordination model that secures CBTC itself — rather than a single custodian.
- CIP-56 native. The bridge operates on CBTC as a first-class CIP-56 asset, fully compatible with Canton's Offer-Accept transfer model, sub-transaction privacy, and regulatory observer framework.
- Open source. The bridge contracts and integration interfaces are published openly. Arch charges no fee for bridging itself, and the design is a reusable reference for connecting Canton assets to external capital markets infrastructure.

This proposal deliberately keeps the bridge mechanism at the architectural level. The detailed lock, attestation, and settlement model is finalized during the design milestone (M1) with IntellectEU and BitSafe, reviewed publicly, and audited before mainnet.

### 3. What the bridge enables: the Arch structured carry-trade platform

Once CBTC can flow to Arch, it accesses the platform Arch already runs for institutional Bitcoin. This platform is built, operated, and maintained by Arch Network at its own cost — it is the commercial layer the bridge unlocks, not a funded deliverable.

The mechanism is the credit carry trade. Arch levers the Bitcoin at the sharpest available rates and deploys the proceeds into yield-generating traditional finance vehicles. The assets can be on-chain or off-chain. Representative institutional asset managers in the category Arch deploys into include Fidelity, Wellington, KKR, and Hamilton Lane; these names are illustrative of the type of manager and strategy the platform routes to, not announced partners. Specific manager partnerships will be confirmed and disclosed as the platform onboards strategies, and may also include negotiated allocations into private credit funds, real estate funds, and reinsurance funds.

The participant controls the exposure. A liquidity provider can select a single product or build a basket across multiple products and manage the whole allocation as one structured trade — with a defined loan-to-value, a net yield position, and continuous tracking of the income accrued from the deployment. The position is held and managed as a single instrument rather than a set of disconnected legs.

Position representation on Canton. When a CBTC holder enters a structured carry position through the bridge, a CIP-56 position token is minted on Canton to represent the leveraged, yield-bearing position. This position token tracks the LTV, net yield, and accrued income for the underlying trade, and is burned on settlement back to CBTC. The final ticker for the position token will be aligned with BitSafe before mainnet; this proposal references it descriptively rather than naming it. No unleveraged-Bitcoin wrapper is introduced on Canton — the only Bitcoin-denominated holding outside an active position is CBTC.

Fee model on the carry-trade platform. Arch charges no fee for bridging itself. On the carry-trade platform, Arch's commercial revenue model is a performance fee (carry) on the strategy's net yield, with the exact rate structured per-strategy in coordination with the institutional asset manager and disclosed at the product level. This fee is separate from any management fee charged by the underlying asset manager on the off-chain or on-chain vehicle.

### 4. The Canton application

Canton participants access the platform through an application deployed on Canton, built by Arch on top of the IntellectEU bridge. The application is where a CBTC holder commits collateral, selects a product or constructs a basket, sets and monitors loan-to-value, and tracks net yield and accrued income on the position. Like the carry-trade platform, the application is built and maintained by Arch at its own cost.

Vault-agnostic by design. The Canton application does not depend on, and does not require, a Canton-side vault standard. The position-management surface is implemented as Daml interfaces that compose with the CIP-56 position token introduced in §3 and that interoperate with whatever vault providers come online on Canton. Where vault providers exist today, the application integrates with them; where they do not, the position is held and managed natively through the position token. Arch already works with Concrete on the Arch side, and the Canton-side interfaces are deliberately specified so a new Canton vault provider can plug in without changes to the bridge or the position-management interfaces. The full interface contract between the bridge and the Canton-side position-management layer is published in M3 as a deliverable, so reviewers can confirm the bridge is not tightly coupled to a single undisclosed implementation.

Audit scope. The bridge contracts and the Decentralization Manager integration are in scope for the M2 third-party security audit. The Canton-side position-management interfaces (M3) are audited in the same engagement or a separately funded follow-on audit, depending on engineering timing; Arch will not deploy a position-management interface to mainnet without third-party audit sign-off.

### 5. Architectural alignment

The bridge aligns with Canton's architecture and with BitSafe's CBTC design:

- CBTC native on Canton. The bridge treats CBTC as the underlying Bitcoin-denominated asset on Canton and operates entirely through standard CIP-56 mechanics. No new wrapper of unleveraged Bitcoin is introduced on Canton.
- Decentralized party model. By using the Decentralization Manager, the bridge inherits the same FROST-based, decentralized-threshold authority model that secures CBTC, rather than introducing a new trust assumption.
- DvP settlement. Bridge commitments and returning positions settle atomically via the Global Synchronizer.
- Daml-native. The bridge and its integration interfaces are implemented in Daml, leveraging Canton's smart-contract model and privacy guarantees.
- Credential and Registry Utility compatible. Bridge participation respects CBTC's existing KYC/AML and compliance gating, and integrates with DA's Credential and Registry Utilities without custom rework.

Disclosure on aBTC. Arch operates its own Bitcoin representation, aBTC, internally on the Arch chain as part of its native execution and settlement flow. aBTC is not bridged to Canton, is not visible to CBTC holders, and is not the asset participants interact with through the Canton application. On Canton, the only Bitcoin-denominated assets are CBTC and — only while a structured position is open — the CIP-56 position token described in §3, which is burned on settlement back to CBTC. The bridge therefore does not fragment Bitcoin liquidity on Canton: CBTC remains the single Bitcoin asset on Canton, and the position token is a position receipt, not a competing Bitcoin wrapper.

### 6. Backward compatibility

No backward compatibility impact. The component is additive:

- It uses the existing CBTC token. It does not modify or replace CBTC, its issuance, or its custody model.
- It introduces new bridge and integration contracts that interact with CBTC through standard CIP-56 mechanics.
- It changes no existing Daml contracts or standards on Canton.

## Ecosystem Benefits

Once the bridge is live, it enables a broader set of use cases for the Canton ecosystem. These are downstream value of the public-good bridge, not funded deliverables:

- Leverage and managed yield for CBTC. CBTC holders gain a native path to lever their Bitcoin and deploy it into institutional, professionally managed yield — without leaving Canton's compliance framework.
- Bitcoin-denominated structured products. Canton participants can build and hold structured carry positions denominated in Bitcoin, with transparent loan-to-value and net-yield accounting.
- Access to traditional finance vehicles. Through the bridge and the platform it unlocks, Canton's Bitcoin liquidity can reach on-chain and off-chain TradFi products managed by major asset managers and specialist funds.
- Deeper utility for an existing Canton asset. The bridge increases the productive utility of CBTC specifically, strengthening an asset already adopted by institutional desks on Canton rather than fragmenting Bitcoin liquidity across a new wrapper.

## Milestones and Deliverables

All milestones cover Canton-side bridge and integration work only. The underlying Arch capital markets stack and the structured carry-trade platform are already built, operated, and funded by Arch Network independently. IntellectEU leads Daml contract development across all milestones; the Decentralization Manager is integrated as the control plane for the bridge's Decentralized Party.

### Milestone 1: Bridge Design and Testnet Delivery

| | |
|---|---|
| **Delivery** | Q3 2026 (July–August) |
| **Funding** | $50,000 |
| **Focus** | Bridge design specification, Daml contract development, Decentralization Manager integration, CBTC bridging on testnet |

Deliverables:

- Bridge design specification. Published technical document covering architecture, the CBTC commit/settle model, the Decentralized-Party authority model, message format, and failure modes. Reviewed by at least one independent Daml ecosystem developer.
- Daml bridge contracts. Bridge controller, commitment, attestation, and settlement contracts implemented with >90% unit test coverage. Source code published on GitHub. Reviewed by IntellectEU.
- Decentralization Manager integration. The Decentralization Manager integrated to govern the bridge's Decentralized Party on Canton testnet, with documented configuration and operator set.
- CBTC bridging on testnet. CBTC committed to the bridge and routed to the Arch capital markets stack on testnet, with positions settling back to CBTC. At least 100 successful round-trip transfers demonstrated.
- Integration tests. End-to-end tests (CBTC commit to Arch position, Arch settlement back to CBTC). Minimum 50 test cases covering normal and failure paths. Test suite published.
- Documentation. Developer guide for bridge integration. Published on GitHub with README and quickstart.

### Milestone 2: Security Audit and Mainnet Readiness

| | |
|---|---|
| **Delivery** | Q3–Q4 2026 (September–October) |
| **Funding** | $50,000 |
| **Focus** | Bridge security audit, mainnet deployment, operational readiness |

Deliverables:

- Bridge security audit. Third-party audit by a recognized firm (Certora, Trail of Bits, or equivalent). 0 critical findings, 0 unresolved high findings. Audit report published publicly. Scope covers the bridge contracts and the Decentralization Manager integration.
- Bridge mainnet deployment. Bridge contracts deployed on Canton mainnet with the Decentralized-Party authority live under the Decentralization Manager. Relayer/attestation operational with uptime monitoring and alerting. At least 10 mainnet round-trip transfers processed.
- Operational readiness. CBTC bridgeable on mainnet via the bridge, with at least one institutional participant completing a round trip.
- Documentation. Bridge operational runbook and integration guide. Published on GitHub.

### Milestone 3: Capital Markets Integration Layer and Adoption

| | |
|---|---|
| **Delivery** | Q4 2026 (November–December) |
| **Funding** | $50,000 |
| **Focus** | Asset-agnostic Canton-side integration interfaces, position-token implementation, second-asset reference integration, and protocol adoption |

Deliverables:

- Integration interface specification. Published Daml interfaces (asset-agnostic) for the position-management layer: minting and burning the CIP-56 position token, expressing loan-to-value, tracking net yield and accrued income, and settling back to the underlying Canton asset. The interfaces are explicitly specified so they apply to any CIP-56 Canton asset, not just CBTC. Reviewed by IntellectEU.
- Position token implementation. Daml contracts for the CIP-56 position token (mint, transfer, settle, burn) implemented with >90% unit test coverage. Source code published on GitHub. Reviewed by IntellectEU.
- CBTC reference integration. End-to-end working path on Canton mainnet demonstrating a CBTC holder taking a structured position (defined LTV, net yield, accrued income) through the bridge, with results documented and transaction logs published.
- Second-asset reference integration. A documented, worked example of the same integration interfaces applied to a second Canton asset (an additional CIP-56 asset selected with the Foundation and a counterparty during M1–M2). Delivered as a testnet demonstration with code, configuration, and transaction logs published, evidencing that the integration layer is reusable infrastructure, not bespoke CBTC plumbing.
- Composability demonstration. Bridged-position settlement demonstrated in an atomic DvP flow with CBTC on Canton mainnet. Documented with transaction logs.
- Adoption demonstration. At least **$10,000,000 in TVL** bridged into the protocol and actively deployed into yield strategies by the close of the milestone. Reported with on-chain evidence.
- Documentation. Integration developer guide for parties building on the bridge and the position-management layer. Published on GitHub.

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone.
- Demonstrated functionality or operational readiness.
- Documentation and knowledge transfer provided.
- Security audit results (Milestone 2): 0 critical, 0 unresolved high findings.
- Mainnet operational status (Milestone 2): bridge operational, CBTC bridgeable.
- Integration readiness (Milestone 3): asset-agnostic interfaces published, CBTC reference integration on mainnet, second-asset reference integration on testnet, and ≥$10M TVL deployed into yield through the protocol.

## Funding

Total Funding Request: $150,000 USD (payable in CC equivalent)

This budget covers Canton-side bridge and integration development by IntellectEU, Decentralization Manager integration, security audit, testing, the second-asset reference integration, and documentation. The underlying Arch capital markets stack and the structured carry-trade platform are already built, operated, and funded by Arch Network independently. The Canton application Arch builds on top of the bridge is also funded by Arch.

### Payment Breakdown

| Milestone | Amount | Timeline |
|---|---|---|
| M1: Bridge Design and Testnet Delivery | $50,000 | Q3 2026 |
| M2: Security Audit and Mainnet Readiness | $50,000 | Q3–Q4 2026 |
| M3: Capital Markets Integration Layer and Adoption | $50,000 | Q4 2026 |
| **Total** | **$150,000** | |

### Budget rationale

A note on M3 relative to the prior revision of this proposal. In the earlier version, a $25K SDK line item sat alongside a separate vault-standard primitive. In this revision, the vault standard is removed, and the M3 budget consolidates: (a) IntellectEU's Daml build for the asset-agnostic integration interfaces and the CIP-56 position token, (b) Decentralization Manager integration work attributable to M3, and (c) the second-asset reference integration added in response to reviewer feedback to substantiate the public-good claim. IntellectEU's quote for this scope is at minimum the $50K line item; consolidating reduces total proposal complexity without changing the headline budget. The overall $150K request is unchanged from the prior revision.

### Volatility Stipulation

Should the project timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility.

## Co-Marketing

Upon release, Arch Network will collaborate with the Foundation and BitSafe on:

- Announcement coordination
- Case study or technical blog
- Developer or ecosystem promotion

## Motivation

Canton hosts over $9 trillion in tokenized assets and processes approximately $350 billion in daily volume. Institutional participants, including Goldman Sachs (DAP), Broadridge (DLR), and Versana, use Canton for compliant, privacy-preserving financial operations.

BitSafe's CBTC brought institutional wrapped Bitcoin to Canton: a 1:1 Bitcoin-backed, CIP-56 asset, secured by a FROST-based decentralized custody network, built for institutional trading, lending, and settlement. CBTC has established Bitcoin as first-class collateral on Canton.

What CBTC does not yet have is a native path to leverage and managed yield. A CBTC holder can hold and settle Bitcoin on Canton, and post it as margin, but cannot lever it and deploy the proceeds into professionally managed traditional finance vehicles from within Canton. That capital sits as collateral rather than working.

This proposal closes that gap with one open infrastructure component:

- The Arch–Canton Bridge is free, open-source bridging infrastructure connecting CBTC to the Arch capital markets stack. Arch charges no fee for bridging. The bridge uses the Decentralization Manager for decentralized authority and is a reusable reference — with a worked second-asset example delivered in M3 — for connecting Canton assets to external capital markets infrastructure.

Once the bridge exists, it enables a commercially viable platform that Arch Network builds and maintains at its own cost: a structured carry-trade platform that levers Bitcoin at the sharpest rates and deploys it into managed yield, accessed through a Canton application. Arch's commercial revenue from operating this platform creates perpetual maintenance incentives for the bridge that persist long after the grant term ends.

## Rationale

Why Arch Network:

Arch Network is an $18M-funded Bitcoin infrastructure company with a 20-person team that has been building for over 2.5 years. The team has delivered a production-grade blockchain with BFT consensus, 300ms blocks, and approximately 1,000 TPS; a Bitcoin-native DEX (Arch Swap); a credit and lending protocol (Arch Lend); an institutional portfolio dashboard (Arch Prime); and the structured carry-trade platform this bridge connects CBTC to.

Why bridge to CBTC rather than mint a new Bitcoin representation:

CBTC is already the institutional wrapped Bitcoin on Canton, with established custody, compliance, and institutional adoption. Bridging CBTC into Arch's capital markets flow adds utility to an asset Canton participants already hold and trust, rather than fragmenting Bitcoin liquidity across a competing wrapper. The bridge complements CBTC; it does not duplicate it.

Why Arch for the capital markets layer:

CBTC's strength is custody, settlement, and margin on Canton. It does not provide leverage at sharp rates or managed deployment into traditional finance vehicles. Arch's 300ms execution and credit infrastructure enable capital-efficient leverage and deterministic collateral enforcement, and Arch's asset-manager relationships provide the deployment venues. CBTC and Arch are complementary: CBTC for institutional Bitcoin on Canton, Arch for putting it to work.

Build partners:

- IntellectEU leads the Canton-side Daml development across all milestones. IntellectEU is a recognized Daml ecosystem developer with Canton production experience.
- The Decentralization Manager (BitSafe, open source) governs the bridge's Decentralized Party, aligning the bridge's trust model with the decentralized-threshold model that already secures CBTC.

Existing ecosystem partnerships:

- Institutional custodians: Anchorage, Ceffu, Utila, providing custody and distribution for Arch capital markets strategies.
- HoneyB: Active asset management partnership for BTC private credit yield strategies.
- Institutional liquidity providers: Galaxy, Pantera, committed to seeding initial liquidity.
- DAT partners: Digital Asset Trusts going live with $10-20M BTC yield pilots.
