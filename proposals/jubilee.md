# Jubilee — Open-Source Non-Fungible Asset Infrastructure & Reference Marketplace for Canton

| | |
|---|---|
| **Author** | Jubilee Team |
| **Status** | In Review |
| **Created** | 2026-04-29 |
| **Updated** | 2026-07-24 |
| **Website** | https://jubilee.markets |
| **X (Twitter)** | https://x.com/JubileeMarkets |
| **Champion** | Jack Charlesworth — @jackcharlesworth |

---

## Abstract

Jubilee is building open-source non-fungible asset and atomic settlement infrastructure for Canton, with the full DAML contract suite and atomic payment distribution logic independently audited, together with a production marketplace that serves as its first end-to-end reference implementation. With its on-ledger contract logic built entirely in DAML, the system combines party-based ownership, contract-enforced authorization, fully backed on-ledger offers, and atomic multi-party settlement.

The proposal distinguishes two connected workstreams:

- **Workstream A — Open-source non-fungible asset infrastructure:** an Apache 2.0-licensed, NFT-focused implementation layer built on the Canton Network Token Standard; reusable collection, issuance, ownership, transfer, listing, offer, counter-offer, escrow, and atomic payment distribution primitives; developer documentation; two independent security audits covering the full DAML contract suite and atomic payment distribution logic; and a documented path for gradual adoption of CIP-0112 V2 features from the current CIP-0056 V1-compatible implementation. The self-custody wallet reference implementation is released as a separate public-good component and is not included in the DAML audit scope.
- **Workstream B — Jubilee reference marketplace:** the production application used to validate those primitives end to end through creator, user, marketplace, wallet, bridge, and operator flows.

Art, PFPs, and digital collectibles are the first reference use case because they are familiar to crypto-native users and provide the lowest-friction path to real adoption and repeated production validation. They are the starting point, not the limit of the infrastructure. The same reusable building blocks are intended to reduce the engineering and audit burden for Canton teams developing other unique assets and rights, including certificates, licenses, memberships, tokenized documents, property-related rights, private-market positions, and other financial or real-world instruments. No specific regulated asset product or native fractionalization layer is included in the current grant scope.

Since the original submission, Jubilee has progressed from testnet validation to a private MainNet review deployment. Collection creation, minting, listing, purchasing, offers, counter-offers, cancellations, direct transfers, and atomic settlement are now operational on MainNet under controlled internal testing.

This proposal seeks funding to harden the existing MainNet deployment, complete two independent security audits covering the full DAML contract suite and atomic payment distribution logic, remediate critical and high-severity findings, deliver USDCx-denominated settlement and additional onboarding integrations, and release the reusable infrastructure as Canton ecosystem public goods. The browser-encrypted self-custody wallet reference implementation will be released separately and is not represented as part of the audited DAML scope. Third-party bridge code is outside the audit scope.

---

## Delivered Work — Current Platform State (MainNet Private Review)

Jubilee is currently deployed on Canton MainNet in a controlled private-review environment. The core platform flows are operational end to end. This proposal funds production hardening, public-launch readiness, supplementary features, two independent security audits, and the release of reusable open-source infrastructure for the Canton ecosystem.

### Core marketplace & DAML architecture (MainNet private review)

- Full DAML contract suite (6+ templates): collection management, token ownership, marketplace listings, offer/counter-offer, transfer requests
- End-to-end marketplace flows: mint, list, buy, sell, offer, counter-offer, transfer
- Party-based ownership model, enforced via DAML controller rules
- Current review-build fees of 0.1 CC per completed sale and 0.1 CC per minted NFT, with creator royalty and seller distribution settled atomically

### Marketplace discovery & browsing

- Top Collections / Ledger of Rank — sortable list with floor, best offer, sales, volume, listed, owners, and trend graph; 1D/7D/30D/ALL time filters
- Featured Collections and Trending Collections carousels
- Explore Collections page — sortable columns (Floor, 1D/7D Change, Volume, Owners, Supply), favoriting
- Latest Activity feed (mint, list, sale, transfer, offer events)
- Activity page — fully filterable event history (All/Sale/List/Offer/Mint/Transfer), LIVE indicator
- Collection detail and NFT detail pages

### Mint experience

- Jubilee Mint page — Opening Soon (with countdown), Minting Now (progress bar, stage display), Allowlist/Public stage flows
- Minting Right Now live cards — minted/supply, price, stage info
- Editor's Note curation, Submit a Collection flow

### Collection creation & management

- 4-step creator wizard: Details → Media & Metadata → Mint Stages → Review
- Multi-file media upload (GIF/JPG/MP3/MP4/PNG/SVG)
- CSV metadata upload: tokenID, name, file_name (required); description, external_url (optional); attributes[trait_name] (traits)
- Mint settings: total supply, mint price, start/end time, royalty %, per-wallet mint limit
- Staged mint + whitelist management
- Editorial Office (platform admin panel) — launch permissions, users, collection management, platform revenue tracking

### Creator tools & analytics

- Creator Dashboard — total volume, royalties earned, NFTs minted, collection count
- Royalty earnings graph (7D/30D/90D/1Y/ALL)
- Avg per sale, all-time royalty, royalty rate metrics
- CSV export
- Per-collection management — mint progress, volume, sales, holders, floor, royalties

### User portfolio & operations

- Portfolio page — Owned / Listed / Offers / Activity tabs
- Multi-select mode — multiple NFT selection for bulk operations
- Bulk list modal — single price application or per-NFT override, subtotal and avg calculation
- Bulk send flow

### Self-custody wallet

- Wallet Overview — balance, wallet type, Canton Party ID
- Deposit address for CC reception
- Send Canton Coin — signing with private key
- Send NFTs — via transfer button
- Bridge (USDCx) shortcut

### Trading primitives & discovery enhancements

- **On-ledger CC offer escrow:** When a buyer submits an offer, their CC is locked on-ledger into an escrow contract before the seller ever sees the offer. This eliminates unfunded offers and materially reduces the unbacked-offer spam pattern common in EVM-based marketplaces, where offers can be made without committed funds and then withdrawn arbitrarily. Every marketplace offer that reaches a seller is fully backed at the moment of receipt.
- **OpenRarity-based rarity scoring:** Industry-standard rarity computation engine implemented for all collections, providing deterministic and reproducible rarity rankings across traits.
- **Indexed prefix-search optimization:** Search infrastructure tuned for low-latency collection and NFT discovery via indexed prefix-matching, supporting marketplace-grade browse experience.

### Notifications

- Dropdown notification center and dedicated Notifications page
- Event types: NFT minted, new offer received, offer accepted, counter-offer received, counter-offer accepted, sale completed, transfer received
- Unread counter, mark all read, all/unread filtering

### USDCx bridge (Ethereum ↔ Canton)

- Bidirectional bridge via Circle's xReserve infrastructure, operational on MainNet under private review — USDC on Ethereum is wrapped to USDCx on Canton

### Production infrastructure & operations (live)

Beyond the application layer, Jubilee has shipped production-grade operational infrastructure indicating execution capability beyond DAML contract development:

- **Live production landing site** at [jubilee.markets](https://jubilee.markets) deployed via Cloudflare Pages with custom domain and active SSL
- **Email infrastructure:** Resend Pro with DKIM-verified sending domain, Cloudflare Queues, Batch API, and retry/backoff handling
- **Waitlist system:** Cloudflare D1 + KV with rate limiting, throughput-tested to handle 10,000+ signup requests per minute
- **Operational maturity:** monitoring, deployment automation, and zero-downtime release practices in place

This demonstrates that the team can not only ship Canton smart contracts but also operate the production-side infrastructure required to support a consumer-grade application.

---

## Specification

> **Note on terminology:** Within this document, references to "USDC" in the context of assets held or transacted on Canton refer specifically to **USDCx** — USDC wrapped onto Canton via Circle's xReserve infrastructure. References to "USDC" in the context of external EVM chains refer to native USDC.
### 1. Objective

Canton's ecosystem currently lacks an audited, reusable, NFT-focused implementation layer atop the Canton Network Token Standard and a publicly launched production marketplace that validates those components end to end. Jubilee currently implements the CIP-0056 V1 interfaces. CIP-0056 provides generic token interfaces, but it intentionally does not define application-level behavior for collections, unique supply, staged issuance, allowlists, creator royalties, listings, backed offers, counter-offers, or marketplace payment distribution.

Jubilee addresses that gap through two connected but separately evaluated workstreams:

#### Workstream A — Open-source non-fungible asset infrastructure

- An Apache 2.0-licensed NFT-focused reference implementation built on CIP-0056 V1, with the full DAML contract suite and atomic payment distribution logic covered by two independent audits, with a documented path for gradual adoption of CIP-0112 V2 features
- Reusable collection, issuance, ownership, transfer, listing, offer, counter-offer, escrow, and atomic payment distribution primitives
- A browser-encrypted self-custody wallet reference implementation
- Developer documentation, integration examples, and security-audit outputs

#### Workstream B — Jubilee reference marketplace

- A hardened MainNet marketplace validating the primitives in a complete production application
- A launchpad enabling Canton ecosystem projects to issue and distribute digital asset collections
- Creator, user, wallet, marketplace, bridge, embedded OneSwap, and operator surfaces
- A first Jubilee reference collection and external collection onboarding

Success looks like:

- The Workstream A public goods are documented and released for reuse by Canton developers, with the full DAML contract suite and atomic payment distribution logic covered by two independent audits
- The Workstream B marketplace is publicly operational on Canton MainNet and demonstrates the infrastructure end to end
- Multi-chain onboarding and the embedded OneSwap integration reduce friction for users entering the marketplace
- External Canton teams can evaluate and reuse the open-source modules without rebuilding the same infrastructure from scratch
- Collectibles provide the first production validation vertical while the infrastructure remains applicable to broader unique-asset and financial use cases

### 2. Implementation Mechanics

Jubilee's on-ledger contract logic is built entirely in DAML and follows Canton's native execution model:

- Users interact through a web interface
- Backend (Node.js) constructs DAML commands and submits via Canton Ledger API
- DAML engine enforces all authorization, preconditions, and contract rules
- State transitions are atomic and follow a strict create-and-archive model
- Ownership is party-based, stored directly in contract state, and enforced via DAML controller rules
- Self-custody wallet runs entirely in the browser using an Ed25519 keypair encrypted at rest, with a prepare/sign/submit flow over the validator's external-party surface

The browser-encrypted wallet is one reference client and is not a dependency of the asset layer. Jubilee's CIP-0056-compatible asset and transfer interfaces can be integrated by other compatible wallets, custodians, and settlement venues, including through CIP-0103 dApp API flows. This proposal does not claim an existing institutional custody integration.

Marketplace transactions combine asset transfer, payment settlement, and royalty distribution within a single atomic operation — eliminating the partial-fill and failed-royalty problems common in EVM-based marketplaces. Buyer offers are similarly placed into on-ledger escrow at submission time, ensuring every offer reaching a seller is fully backed by locked CC.

The current MainNet review build uses placeholder fees of 0.1 CC per completed sale and 0.1 CC per minted NFT. The planned public-launch model uses a flat 3 CC platform fee per completed sale and a flat 3 CC platform fee per minted NFT, with no percentage-based platform commission. Creator royalties are optional percentages configured per collection and apply only to secondary sales. The public-launch minimum listing price will be set so that seller proceeds cannot become negative after the flat platform fee and any applicable royalty.

### 3. Architectural Alignment

Jubilee is fully aligned with Canton's architecture and is positioned as an opinionated, NFT-focused reference implementation of CIP-56 — not a fork, not a competing standard.

**Native execution alignment:**

- DAML-native execution — all contract logic runs natively in DAML, no EVM adaptation
- Party-based identity — ownership tied to Canton parties, not addresses
- Sub-transaction privacy — ownership visibility restricted to relevant parties only
- Atomic state transitions — every trade is all-or-nothing, no intermediate states
- Create-and-archive model — immutable contract lifecycle, no mutable state

**Disclosure model:** Ownership contracts and private settlement legs are visible only to the relevant ledger stakeholders. Jubilee, as marketplace operator, can see the marketplace contracts required to provide the service. Public listings intentionally disclose selected asset metadata and asking prices through the application. Collection statistics are application-published aggregates, not globally replicated ownership records.

**Canton Network Token Standard alignment: CIP-0056 V1 and CIP-0112 V2**

Jubilee currently implements the CIP-0056 V1 interfaces. CIP-0056 defines the general DAML interfaces required for Canton tokens to interoperate with wallets, exchanges, custody applications, and settlement venues without bespoke integration code: Holding, TransferInstruction, TransferFactory, Allocation, AllocationRequest, AllocationInstruction, AllocationFactory, and Metadata/InstrumentId types. It is intentionally generic and does not define NFT-specific behavior such as collections, mint stages, allowlists, supply caps, creator royalties, or escrowed marketplace offers.

Jubilee's implementation layer fills that application-level gap with NFT-specific primitives built on the V1 interfaces:

| Jubilee component | CIP-0056 V1 relationship |
|---|---|
| NFToken / NFTokenV2 (amount = 1.0) | Implements **Holding** |
| JubileeTransferFactory | Implements **TransferFactory** |
| Atomic settlement flows (buy, offer accept, counter accept) | Exercise Splice's official **AllocationFactory / Allocation** implementations for the Canton Coin legs |
| JubileeBackedOfferV4 (backed-offer escrow) | Locks the buyer's committed CC in a standard **Allocation** |

Official Splice v0.5.18 CIP-0056 DARs are currently vendored as data-dependencies, with interface instance declarations provided against them for the Holding and TransferFactory surfaces. Rather than reimplementing the allocation surfaces, Jubilee's settlement contracts consume Splice's canonical CIP-0056 implementations directly. This means the existing Jubilee implementation interoperates with CIP-0056-compatible infrastructure while the collection and marketplace layer remains opinionated scaffolding above the standard, not a replacement for it.

CIP-0112 is the approved V2 evolution of the Canton Network Token Standard. It is designed as a backwards-compatible progression of CIP-0056 and adds capabilities relevant to privacy-preserving settlement, traditional account structures, committed allocations, standardized batching, and transaction parsing. Workstream A therefore includes a staged V1-to-V2 compatibility track focused on the applicable Holding and Transfer surfaces: an interface and phased V2-adoption map in MS1, compatibility scaffolding and tests in MS2, extension of those tests across the marketplace settlement examples in MS3, and a published V2 adoption guide with tested examples in MS4. Jubilee will preserve V1 interoperability during the transition and add applicable Holding and Transfer V2 interface support where the target Splice packages are available and production-suitable during the grant period. A full V2 Allocation implementation is not committed within this grant.

The analogy is ERC-721: the standard defines the interoperable interface, a reusable library provides application-level building blocks, and a marketplace validates them in a complete product. Jubilee is currently compatible with CIP-0056 V1. CIP-0112 V2 is designed for a high level of backward compatibility with CIP-0056 V1 and supports a gradual cross-version transition. Jubilee's open-source library is the opinionated non-fungible asset implementation layer, while jubilee.markets is the production application built above it.

**Other CIP alignment:**

- **CIP-0082** — contributes ecosystem utility through asset infrastructure and reference implementations, both explicitly named eligible categories
- **CIP-0100** — structured with milestone-based delivery, measurable outputs, and acceptance criteria
- **CIP-0104** — qualifying marketplace operations where the Jubilee marketplace party is a signatory produce confirmer-based traffic attribution, while generic Canton Coin sends, bridge operations, and one-time account setup remain outside Jubilee attribution

### 4. Backward Compatibility

The Jubilee asset protocol is additive to the Canton ecosystem. It does not require changes to Canton core, Splice, or DAML. It currently implements CIP-0056 V1 rather than modifying or forking it. CIP-0112 V2 is designed for a high level of backward compatibility with CIP-0056 V1 and supports a gradual cross-version transition. The proposed V2 work is therefore framed as gradual feature adoption rather than a mandatory replacement of the existing V1 implementation.

*No backward compatibility impact is introduced by the current implementation or the proposed staged V2 compatibility work.*

---

## Milestones and Deliverables

The marketplace and the open-source infrastructure remain technically connected, but each milestone identifies which deliverables belong to **Workstream A** and which belong to **Workstream B**.

### Milestone 1: MainNet Hardening, Audit Readiness & Public Architecture

- **Estimated Delivery:** 2 weeks
- **Focus:** Hardening Jubilee's existing private MainNet deployment, preparing the security-critical code for independent review, and opening the public architecture layer. The MS1 allocation, available upon acceptance of the MS1 deliverables, is intended to finance the two independent audits commencing at the start of MS2.

**Workstream A — Open-source infrastructure**

- Finalize the public module inventory and Jubilee-to-CIP-0056 V1 implementation-relationship map
- Produce a CIP-0056 V1 to CIP-0112 V2 compatibility and phased V2-adoption map for the applicable Holding and Transfer surfaces, while documenting that a full V2 Allocation implementation is outside the current grant scope
- Open a public Apache 2.0 repository containing the architecture overview, module boundaries, interface mappings, release roadmap, threat model, security invariants, and initial integration-surface documentation
- Finalize the audit package for the full DAML contract suite and atomic payment distribution logic
- Finalize commercial terms and provisional schedules with two independent security audit firms, one being Canton Network's official audit solution partner and the other an independent firm with DAML expertise, ready for commissioning upon MS1 acceptance
- Expand private test coverage and prepare the audit code freeze

**Workstream B — Reference marketplace**

- Production hardening of all DAML contract templates and application services already deployed to Canton MainNet
- Live MainNet validation of mint, list, buy, sell, offer, counter-offer, cancellation, and direct-transfer flows
- MainNet validation of the planned launch fee configuration: 3 CC per completed sale and 3 CC per minted NFT, with no percentage-based platform commission
- Production monitoring, logging, incident-response, rate-limiting, and edge-case hardening
- Load and stability testing under controlled MainNet conditions

### Milestone 2: Independent Audits, Core Primitive Preview & Product Readiness

- **Estimated Delivery:** 3 weeks
- **Focus:** Commissioning and completing two independent audits of the full DAML contract suite and atomic payment distribution logic; remediating critical and high-severity findings; publishing the first implementation preview; and validating the complete MainNet product surface. The reference collection launch is not dependent on the grant-disbursement schedule and may occur before the audits are completed. If that occurs, exposure will remain controlled through the collection's fixed 1,000-NFT supply and allowlist-gated access at launch. The audits will be commissioned immediately after MS1 acceptance and disbursement; if the grant schedule advances quickly enough, they may still complete before launch. In all cases, audit completion and remediation of critical and high-severity findings are required before allowlist restrictions are removed and the platform is opened to broad public onboarding, and before the final stable public-good release is published.

**Workstream A — Open-source infrastructure**

- Completion of two independent security audits covering the full DAML contract suite and atomic payment distribution logic
- Remediation and documentation of all critical and high-severity findings before the affected modules are designated audit-complete
- Following completion of the audits and remediation of all critical and high-severity findings affecting those modules, publication of the first open-source implementation preview covering the core non-fungible asset modules: collection, issuance, ownership, holdings, and transfer
- Publication of the corresponding core tests and preliminary developer documentation, clearly labelled as a preview rather than the final stable release
- CIP-0112 compatibility scaffolding and tests for the applicable core Holding and Transfer surfaces, while preserving CIP-0056 V1 interoperability
- Live MainNet validation of platform fee, creator royalty, seller proceeds, and NFT ownership transfer executing in one atomic operation
- Committee delivery of both complete audit reports; public release of reports or summaries will follow the applicable auditor disclosure terms

**Workstream B — Reference marketplace**

- Collection creator panel operational on MainNet: four-step wizard, CSV metadata upload, multi-file media upload, mint settings, staged mint, and allowlist management
- Self-custody wallet operational on MainNet: browser-encrypted private key, login/recovery, Canton Party ID management, Send CC, Send NFTs, and deposit address
- Live bidirectional Ethereum ↔ Canton MainNet USDCx bridge via Circle's xReserve infrastructure
- MainNet validation of bulk-list and bulk-send features
- Creator Dashboard operational on MainNet: volume, royalties, NFTs minted, per-collection management, earnings graph, and CSV export
- Complete MainNet lifecycle validation for Jubilee's 1,000-piece reference collection, including collection configuration, issuance, minting, secondary settlement, and monitoring
- Stability iterations and reporting based on any live reference-collection activity available during the milestone

### Milestone 3: Settlement Module Preview, Ecosystem Onboarding & Embedded OneSwap Integration

- **Estimated Delivery:** 4 weeks
- **Focus:** Publishing the reusable marketplace and settlement implementation surfaces, validating their V2 compatibility path, enabling external Canton projects to use the Jubilee launchpad, and giving users an embedded OneSwap route through Jubilee's built-in self-custody wallet without leaving the product.

**Workstream A — Open-source infrastructure**

- Publish the preview implementation of the listing, offer, counter-offer, cancellation, allocation-backed escrow, and atomic payment-distribution modules
- Publish integration examples and a draft developer guide covering collection, issuance, transfer, listing, offer, escrow, and atomic settlement
- Extend the CIP-0112 compatibility scaffolding and tests across the applicable Holding and Transfer surfaces used by the marketplace settlement examples, while maintaining the existing CIP-0056 V1 path; a full V2 Allocation implementation is not committed within this grant
- Document the technical onboarding path for external collections and applications evaluating the modules
- Collect structured integration feedback for incorporation into the final stable public-good release

**Workstream B — Reference marketplace**

- Operational launchpad infrastructure with a documented submission process and technical onboarding guide, accepting external collection submissions
- OneSwap integration embedded within Jubilee and executable through Jubilee's built-in self-custody wallet without leaving the interface
- External-project onboarding, launch support, and marketplace reporting

### Milestone 4: USDCx Settlement, Multi-Chain Onboarding & Full Stable Public-Good Release

- **Estimated Delivery:** 4 weeks
- **Focus:** Delivering USDCx-denominated marketplace settlement, expanding asset onboarding, and publishing the complete stable public-good release following the staged MS1-MS3 disclosures, with the full DAML contract suite and atomic payment distribution logic covered by the two independent audits.

**Workstream A — Open-source infrastructure**

- Complete NFT-focused reference library covering collection grouping, mint stages, allowlists, supply caps, per-wallet limits, royalty-aware settlement, and fully backed offers
- Complete marketplace primitives for listings, offers, counter-offers, cancellations, allocation-backed escrow, and atomic settlement
- Atomic payment distribution templates
- Browser-encrypted Ed25519 self-custody wallet reference implementation using the prepare/sign/submit flow, published as a separate public-good component outside the DAML audit scope
- USDCx bridge reference integration
- Final developer documentation, integration examples, test suite, remediation notes, and public audit reports or summaries consistent with the applicable auditor disclosure terms; both complete reports will have been delivered to the Committee in MS2
- CIP-0056 V1 to CIP-0112 V2 adoption guide and tested cross-version examples
- A documented, runnable non-collectible worked example, such as a unique license entitlement or private membership certificate, demonstrating how the same issuance, ownership, transfer, permissioning, and settlement modules can be used outside art and PFP collections
- V2 interface support for applicable Holding and Transfer modules where the target Splice packages are available and production-suitable during the grant period, while preserving the documented V1 interoperability path; a full V2 Allocation implementation is outside the current grant scope
- Complete stable release of all public-good modules published in the public GitHub repository under **Apache License 2.0**, with the full DAML contract suite and atomic payment distribution logic covered by the two independent audits

**Workstream B — Reference marketplace**

- NFT listing, offer, and purchase flows denominated in USDCx on Canton
- Atomic USDCx settlement distributing seller proceeds, platform fee, and creator royalty where applicable
- At least one additional external bridge route or complementary onboarding path demonstrably operational
- Production reporting for USDCx-denominated marketplace activity

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate milestone completion primarily against technical deliverables under Jubilee's direct control:

- deliverables completed as specified;
- demonstrated functionality and operational readiness;
- audit completion and remediation where applicable;
- documentation and knowledge transfer;
- staged open-source publication and integration usability;
- alignment with the stated value metrics.

Adoption figures, public-launch timing, and third-party participation are retained as **operational targets and reporting metrics**, not conditions of milestone acceptance. This preserves measurable adoption reporting without creating a grant-disbursement incentive for artificial transaction volume or making delivery dependent on external timing or third parties outside Jubilee's control.

### MS1 — MainNet Hardening, Audit Readiness & Public Architecture

**Workstream A acceptance conditions**

- Public module inventory and Jubilee-to-CIP-0056 V1 implementation-relationship map completed
- CIP-0056 V1 to CIP-0112 V2 compatibility and phased V2-adoption map completed for the applicable Holding and Transfer surfaces, with the full V2 Allocation implementation explicitly outside the current grant scope
- Public Apache 2.0 repository opened with architecture, module boundaries, interface mappings, release roadmap, threat model, security invariants, and initial integration-surface documentation
- Audit package documented for the full DAML contract suite and atomic payment distribution logic
- Commercial terms and provisional schedules finalized with two independent audit firms, one being Canton Network's official audit solution partner and the other an independent firm with DAML expertise, ready for commissioning upon MS1 acceptance
- Audit code freeze and expanded private test suite prepared

**Workstream B acceptance conditions**

- All production DAML templates and core services operational in the controlled MainNet environment
- Mint, list, buy, sell, offer, counter-offer, cancellation, and direct-transfer flows demonstrable to a Committee member or representative
- Planned flat launch-fee configuration demonstrable: 3 CC per completed sale and 3 CC per minted NFT, with no percentage platform commission
- Production monitoring, logging, rate-limiting, and incident-response infrastructure active

### MS2 — Independent Audits, Core Primitive Preview & Product Readiness

**Workstream A acceptance conditions**

- Two independent security audit reports covering the full DAML contract suite and atomic payment distribution logic completed and delivered in full to the Committee
- All critical and high-severity findings remediated and documented before the affected code is designated audit-complete, before allowlist restrictions are removed for broad public onboarding, and before the final stable public-good release is published
- Following completion of the audits and remediation of all critical and high-severity findings affecting the previewed modules, the core collection, issuance, ownership, holding, and transfer implementation preview is published with tests and preliminary documentation.
- Applicable CIP-0112 compatibility scaffolding and tests published for the core Holding and Transfer surfaces while preserving the CIP-0056 V1 path
- Atomic distribution of platform fee, creator royalty, seller proceeds, and NFT ownership demonstrated on MainNet in a single operation

**Workstream B acceptance conditions**

- Creator panel, self-custody wallet, USDCx bridge, bulk operations, and creator dashboard accessible and operational on MainNet
- Jubilee's 1,000-piece reference collection configured and its complete issuance, minting, secondary-settlement, and monitoring lifecycle demonstrable on MainNet
- If the reference collection launches before both audits and critical/high remediation are complete, its launch supply remains capped at 1,000 NFTs and access remains allowlist-gated until the audit gate for broad public onboarding is satisfied
- Primary mint activity reported separately from secondary marketplace activity where live activity exists
- Available marketplace metrics reported to the Committee, including minted and listed supply, transaction count, completed sales, unique holders, royalties, seller proceeds, platform fees, and sales volume

**Operational adoption targets, reported but not acceptance conditions**

- Public launch and full mint completion of the first reference collection
- At least 3,000 post-launch non-mint, user-initiated marketplace transactions
- At least 1,000 completed purchase or sale transactions

### MS3 — Settlement Module Preview, Ecosystem Onboarding & Embedded OneSwap Integration

**Workstream A acceptance conditions**

- Preview source published for listings, offers, counter-offers, cancellations, allocation-backed escrow, and atomic payment distribution
- Draft developer integration documentation and runnable examples published for the reusable issuance, transfer, escrow, and settlement surfaces
- CIP-0112 compatibility scaffolding and tests extended across the applicable Holding and Transfer surfaces used by the settlement examples while preserving CIP-0056 V1 interoperability; no full V2 Allocation implementation is required within this grant
- External-collection technical onboarding path documented
- A structured process for collecting and incorporating external integration feedback is operational

**Workstream B acceptance conditions**

- Launchpad accepts external collection submissions through a documented process
- A user can execute a swap through the embedded OneSwap integration using Jubilee's built-in self-custody wallet without leaving the Jubilee interface
- Marketplace and onboarding metrics are reported to the Committee

**Operational adoption targets, reported but not acceptance conditions**

- At least three external collections or ecosystem projects enter the onboarding pipeline
- At least two external collections launch on MainNet through Jubilee
- At least one external technical team reviews the integration surface
- At least 5,000 cumulative non-mint, user-initiated marketplace transactions
- At least 2,000 cumulative completed purchase or sale transactions

### MS4 — USDCx Settlement, Multi-Chain Onboarding & Full Stable Public-Good Release

**Workstream A acceptance conditions**

- Complete stable release of all public-good components published in the public repository under Apache License 2.0, with the full DAML contract suite and atomic payment distribution logic covered by the two independent audits
- Repository includes the NFT-focused implementation layer, marketplace primitives, atomic payment distribution templates, allocation-backed offer escrow, the separately published self-custody wallet reference implementation, tests, remediation notes, public audit reports or summaries consistent with auditor disclosure terms, and final developer documentation
- CIP-0056 V1 alignment demonstrated through documented Holding and TransferFactory interface relationships, canonical AllocationFactory / Allocation usage for Canton Coin settlement legs, and runnable example flows
- CIP-0056 V1 to CIP-0112 V2 adoption guide and tested cross-version examples published
- A documented, runnable non-collectible example is published and demonstrates the reusable issuance, ownership, transfer, permissioning, and settlement modules outside an art or PFP use case
- Applicable Holding and Transfer V2 interfaces implemented where the target Splice packages are available and production-suitable during the grant period; otherwise, the repository includes completed compatibility scaffolding and a tested phased V2-adoption path. A full V2 Allocation implementation is outside the current grant scope
- The documented examples can be run and evaluated without access to Jubilee's private application code

**Workstream B acceptance conditions**

- An NFT can be listed, offered, and purchased in USDCx on Canton
- Atomic USDCx payment distribution functions for completed settlements
- At least one external bridge route or complementary onboarding path is demonstrably operational
- USDCx marketplace metrics are reported to the Committee

**Operational adoption targets, reported but not acceptance conditions**

- At least 200 completed non-mint, user-initiated USDCx marketplace transactions
- At least 100 completed USDCx purchase or sale transactions

---

## Funding

Total Funding Request: 600,000 CC

This amount is intended as a working ask to level-set the review conversation. Jubilee remains open to discussion and calibration with Jack Charlesworth, the Tech & Ops Committee, and Canton Foundation reviewers based on ecosystem norms, comparable proposals, milestone scope, and Committee guidance.

Consistent with the Tech Ops request to separate the marketplace from the NFT-focused standard and public-good infrastructure, the two workstreams are separately scoped in the milestone deliverables and acceptance criteria. Jubilee can provide and calibrate a workstream-level funding allocation with the Committee during review; the milestone totals below remain the current working request, and this revision does not impose an unreviewed numerical split.

Payment Breakdown by Milestone

Milestone 1: 200,000 CC
Milestone 2: 160,000 CC
Milestone 3: 110,000 CC
Milestone 4: 130,000 CC

### Cost Drivers per Milestone

To support that discussion, the principal cost drivers across the four milestones are:

- **MS1:** MainNet hardening, audit-readiness work, public architecture release, and the capital that becomes available upon MS1 acceptance to commission two independent audits at the start of MS2
- **MS2:** Two independent audits of the full DAML contract suite and atomic payment distribution logic; remediation; core primitive preview release; atomic payment distribution validation on MainNet; and controlled reference-collection lifecycle readiness
- **MS3:** Marketplace and settlement module preview release, ecosystem onboarding for non-Jubilee projects, and embedded OneSwap integration through Jubilee's built-in self-custody wallet
- **MS4:** USDCx settlement support, an additional external bridge route or complementary onboarding path, the complete stable public-good release, publication of audit materials, and CIP-0056 V1 to CIP-0112 V2 adoption documentation and examples.

### Volatility Stipulation

Project duration is approximately 13 weeks (~3 months), well under the six-month threshold defined in CIP-0100. Should the project timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility.

---

## Co-Marketing

Upon each milestone delivery, Jubilee will collaborate with the Canton Foundation on:

- **Milestone 1:** Coordinated MainNet launch announcement
- **Milestone 2:** Technical blog covering DAML contract architecture, security audit outcomes, the core primitive preview, and the Jubilee reference-collection lifecycle
- **Milestone 3:** Developer-preview content covering the settlement modules, an ecosystem onboarding case study, and a joint announcement of the embedded OneSwap integration
- **Milestone 4:** Developer-focused content promoting the full stable public-good release and its audited DAML and atomic-payment components, CIP-0056 V1 interoperability, the CIP-0112 V2 phased V2-adoption path, and the marketplace primitives as Canton ecosystem public goods

---

## Motivation

### The Gap

Canton has rapidly matured into institutional-grade infrastructure, with participants including DTCC, BNY, Goldman Sachs, BNP Paribas, and others operating on the network. However, the ecosystem currently lacks a standardized, privacy-native surface for issuing, discovering, and trading non-fungible digital assets at consumer scale.

Today there is:

- No NFT-focused reference implementation atop CIP-56
- No publicly launched production-grade NFT marketplace running on Canton MainNet
- No unified asset onboarding interface for Canton-native NFT projects
- No open-source primitives that future builders can reuse for non-fungible asset issuance and exchange

This creates a structural gap: Canton ecosystem projects cannot easily launch asset collections, institutions lack a native asset interaction layer, and builders lack reusable primitives for asset issuance and exchange.

### Why Privacy Matters for Non-Fungible Assets

On public blockchains, every NFT ownership record is globally visible. This is fundamentally incompatible with use cases where ownership confidentiality is required — institutional certificates, sensitive documents, premium collections, regulated financial instruments, or any scenario where revealing "who owns what" creates competitive, legal, or privacy risk.

Canton's sub-transaction privacy model solves this natively: only the relevant parties can see a contract's existence. Jubilee is designed to fully exploit this advantage — providing the first non-fungible asset layer where ownership privacy is built in from the protocol level, not bolted on.

### Why the Development Fund Should Care

CIP-0082 explicitly targets "core R&D, dev tools, security, audits, reference implementations, DeFi app(s) liquidity seeding, and critical infra" as eligible work. Jubilee delivers across multiple eligible categories:

- **Reference implementation** — an NFT-focused implementation layer on the Canton Network Token Standard, currently built on CIP-0056 V1 with a staged compatibility path toward CIP-0112 V2
- **Developer tooling** — open-source library for collection management, mint mechanics, royalty enforcement, on-ledger offer escrow (eliminating unbacked-offer spam), and atomic payment distribution that any Canton builder can reuse
- **Critical infrastructure** — without a non-fungible asset layer, Canton's ecosystem of institutional and consumer participants has no standardized way to issue, trade, or manage unique digital assets
- **Security and audits** — the proposal includes two independent security audits as a milestone deliverable, contributing to the ecosystem's overall security posture

Beyond the formal grant scope, Jubilee's existence as an opinionated, production-grade consumer application atop CIP-56 produces additional ecosystem value:

- **Canton Network Token Standard validation at consumer scale** — Jubilee validates the current CIP-0056 V1 interfaces under consumer-style flows including bulk listings, counter-offers, atomic settlement under marketplace load, and browser-based Ed25519 self-custody, while documenting the forward compatibility path toward CIP-0112 V2.
- **CIP-0104 traffic-economics data point** — Jubilee operations produce confirmation-request envelopes with clean attribution profiles, providing Canton governance with real consumer-app traffic data on the new traffic-based reward model. Today this data is largely modeled, not observed.
- **Self-custody UX precedent** — most Canton applications assume institutional custodian. Jubilee's browser-encrypted Ed25519 + prepare/sign/submit pattern is a complete model running on the validator's external-party surface. Other Canton consumer apps can adopt this pattern directly.

---

## Rationale

### Why Canton-Native, Not EVM-Adapted?

Jubilee is designed specifically for Canton rather than adapting EVM-based asset models. Key architectural decisions:

- **Contract-level ownership** instead of global mappings — each asset is an independent contract instance
- **Party-based identity** instead of address-based — aligned with Canton's identity model
- **Atomic multi-party settlement** — asset transfer + payment + royalty in a single operation
- **Create-and-archive state transitions** — immutable contract lifecycle
- **Contract-enforced authorization** — DAML controller rules, not application-level checks

Alternative approaches (EVM-style assets, mutable state, off-chain ownership tracking) were evaluated and rejected due to fundamental misalignment with Canton's privacy model and weaker security guarantees.

### Why Atomic Payment Distribution Matters

In EVM-based marketplaces, royalty enforcement has been a persistent challenge — platforms like OpenSea famously struggled with enforcing creator royalties, as sellers could bypass them through direct transfers. Jubilee's DAML contract architecture addresses this within its marketplace settlement flow: every sale executed through that flow atomically distributes platform fee, creator royalty, and seller payment within a single indivisible operation. A creator royalty cannot be selectively bypassed while completing the rest of the Jubilee settlement.

This atomic payment distribution pattern is one of the key public goods deliverables. Any Canton builder can reuse it for their own marketplace or settlement workflows.

### On-Ledger Offer Escrow as a Public-Goods Security Primitive

A second protocol-level primitive that Jubilee contributes to the Canton ecosystem is the on-ledger offer escrow pattern. In EVM-based marketplaces, buyer offers are typically off-chain signed messages with no committed funds — leading to widespread unbacked-offer spam, where attackers flood collections with offers they cannot or will not honor, polluting collection analytics and frustrating sellers. Jubilee solves this at the contract level: when a buyer submits an offer, the offered CC is moved into an on-ledger escrow contract before the seller is even notified. Every marketplace offer that reaches a seller is therefore fully collateralized at the moment of receipt; sellers can accept it without unfunded-offer counterparty risk.

The public repository and integration surface will be opened in Milestone 1, with the audited stable implementation of this escrow pattern delivered in Milestone 4 as a reusable security primitive that any Canton marketplace, auction, or P2P-trade application can adopt directly.

Jubilee's backed-offer escrow pattern was built as custom application logic on CIP-0056 V1. CIP-0112 V2 introduces committed allocations, which standardize a related model for locking prefunded assets for an application or settlement venue. Jubilee's contribution remains the NFT-marketplace-specific offer and counter-offer layer built around that funding guarantee; documenting how this pattern can align with the V2 model is part of the compatibility work.

### Why Build on the Canton Network Token Standard Rather Than Fork It

Jubilee's open-source NFT library builds on the Canton Network Token Standard rather than creating a competing standard. The current implementation uses CIP-0056 V1, which defines interoperable Holding, Transfer, and Allocation interfaces but intentionally leaves NFT-specific application behavior to implementers. Jubilee fills that application-level gap with reusable non-fungible asset and marketplace primitives.

CIP-0112 is the approved V2 evolution of the standard. CIP-0112 V2 is designed for a high level of backward compatibility with CIP-0056 V1 and supports a gradual cross-version transition. It adds capabilities useful to more complex settlement and traditional-account workflows. Jubilee therefore remains V1-compatible and defines a gradual path for adopting applicable V2 features rather than treating V2 as a mandatory replacement of the current implementation. This avoids ecosystem fragmentation, preserves existing wallet and app interoperability, and keeps the public-good release aligned with the standard's forward direction.

### Why Sequence Audit Readiness in MS1 and Audit Execution in MS2

Since the original submission, Jubilee has progressed from testnet validation to a controlled private MainNet review deployment. MS1 hardens the production-target architecture, freezes the audit code, prepares the full DAML contract suite and atomic payment distribution logic for review, finalizes arrangements with two independent firms, and completes the deliverables required for the MS1 allocation. Once MS1 is accepted and disbursed, both audits are commissioned immediately at the start of MS2.

The reference collection launch is not dependent on the grant-disbursement schedule and may occur before the audits are completed. In that scenario, economic exposure remains deliberately contained through the collection's fixed 1,000-NFT supply and allowlist-gated access at launch. If the grant process advances quickly enough, the audits may still complete before launch.

The meaningful audit gate is broader access and the stable public-good release. Allowlist restrictions will not be removed for broad public onboarding until both audits are complete and all critical and high-severity findings have been remediated. The same audit and remediation requirement applies before the DAML components are presented as audit-complete and before the final stable public-good release is published.

The audit scope covers the full DAML contract suite and atomic payment distribution logic. The self-custody wallet reference implementation is published as a separate public-good component and is not represented as part of the audited DAML scope. Third-party bridge code is also outside the audit scope.

---

## Team

The Jubilee team consists of a focused core group covering DAML architecture, wallet and product engineering, validator infrastructure, full-stack systems, ecosystem development, and go-to-market execution.

**Kerem Kubilay** — Technical Lead / DAML Architect — kerem@jubilee.markets

Kerem leads Jubilee's Canton-native technical architecture and DAML contract development. He is responsible for the DAML contract suite behind Jubilee's collection, ownership, listing, offer, counter-offer, transfer, and atomic settlement flows, as well as the work required to map Jubilee's NFT primitives onto the current CIP-0056 V1 interfaces and the staged CIP-0112 V2 compatibility path.

Kerem has been an active crypto application developer across multiple ecosystems before Jubilee, including Solana, Base, Arc, and MegaETH. His work has covered wallet infrastructure, transaction flows, user-facing blockchain applications, and on-chain product logic across both EVM and non-EVM environments. He has hands-on experience with key management, transaction signing, user onboarding, asset custody, and reliable execution under real user conditions.

Before Jubilee, Kerem developed an Arc-native wallet implementation, available at https://chromewebstore.google.com/detail/casarc-wallet/ddmjmbkgdcknajaomkmpmonaeafgkdhn, and also created a mining-style game being built on MegaETH. This background across wallet UX, transaction execution, and consumer-facing crypto products directly informs Jubilee's self-custody wallet, prepare/sign/submit flow, and marketplace execution model.

Within Jubilee, Kerem's focus is DAML correctness, contract-level authorization, party-based ownership, atomic payment distribution, escrowed offers, and the technical design of reusable NFT primitives for Canton builders.

**Gokay Sourled** — Infrastructure Lead / Full-Stack Engineer — gokay@jubilee.markets

Gokay leads Jubilee's full-stack implementation, backend services, deployment infrastructure, and integration layer. He is responsible for the production application surface that connects the web interface, backend services, Canton Ledger API interaction, creator tools, portfolio flows, notification systems, waitlist infrastructure, and operational monitoring.

Gokay is also responsible for Huginn's and Jubilee's validator infrastructure and validator tooling. Huginn has operated as a Cosmos Hub mainnet validator for years, runs validators across multiple Cosmos-based Layer 1 networks, and was selected as a Monad genesis mainnet validator. Gokay runs Huginn's validator systems and has built internal tooling used for validator operations, monitoring, alerting, and ecosystem infrastructure.

He has also built and maintained several Huginn products and infrastructure tools, including validator monitoring and ecosystem tooling. This includes Monadoring Bot, a real-time monitoring solution for Monad validators with instant timeout and skipped block alerts, chain halt detection, Telegram and PagerDuty integration, and Discord bridge support. Huginn's broader product surface also includes Cosmos.Wiki, Huginn Guard, Monval, and Monadoring.

This infrastructure background is directly relevant to Jubilee's production operations, monitoring, deployment reliability, and the technical discipline required to run user-facing financial applications on Canton.

Within Jubilee, Gokay's focus is product reliability, user-facing execution, creator dashboard infrastructure, collection onboarding tooling, bridge/OneSwap integration surfaces, deployment infrastructure, and production operations.

**Utku Huginn** — Ecosystem & Product Lead — utku@jubilee.markets

Utku leads Jubilee's ecosystem strategy, product direction, creator onboarding, community distribution, partnerships, documentation, and co-marketing coordination.

He is part of Huginn, an infrastructure and ecosystem team active across the Cosmos and modular blockchain ecosystem. Huginn has contributed to ecosystem growth through community management, validator ecosystem support, localized education, user onboarding, and long-term participation in networks such as Cosmos Hub, Initia, Berachain, Babylon, Monad, and other Cosmos-aligned ecosystems.

Utku has extensive experience building and coordinating crypto-native communities, especially across Turkish and modular blockchain ecosystems. He has worked on ecosystem onboarding, local community growth, campaign coordination, creator relationships, and go-to-market distribution for multiple blockchain communities and projects.

Utku also has direct NFT community experience through Celestine Sloth Society, one of the earliest Celestia-aligned NFT communities, where he has contributed to holder coordination, community campaigns, creator relationships, and cross-ecosystem visibility efforts.

Within Jubilee, Utku's focus is converting Jubilee from a working Canton product into a live ecosystem venue: onboarding creators, coordinating launch partners, building community demand, managing external communications, and ensuring the platform is positioned as useful infrastructure for Canton-native asset issuance.

The team has already progressed Jubilee from a fully functional testnet marketplace to a controlled MainNet review deployment, including minting, trading, offers, counter-offers, wallet flows, creator tooling, bridge flows, and marketplace discovery. This demonstrates the ability to execute and operate production-grade systems aligned with Canton's architecture.

---

## Post-Grant Maintenance

Following completion of all milestones, Jubilee will continue maintaining the open-source components without requiring additional grant funding.

The marketplace introduces a sustainable revenue model through fixed platform fees applied at the contract level during atomic settlement. The planned public-launch schedule is 3 CC per completed sale and 3 CC per minted NFT, with no percentage-based platform commission. Creator royalties are configured separately per collection and, for third-party collections, pass directly to the creator. Marketplace revenue supports continued development, maintenance, and long-term operation of the reference application and public-good infrastructure.

---

## Champion

External contributor proposals to the Canton Development Fund require sponsorship from a Tech & Ops Committee member, per CIP-0100. Jubilee has received champion confirmation from Jack Charlesworth and the proposal is now in review.

---

## Links

- **Website:** https://jubilee.markets
- **X (Twitter):** https://x.com/JubileeMarkets
- **Public GitHub repository (open-source library):** architecture and interface materials in MS1; core asset implementation preview in MS2; settlement-module preview in MS3; complete stable public-good release in MS4, with the full DAML contract suite and atomic payment distribution logic covered by the two independent audits
