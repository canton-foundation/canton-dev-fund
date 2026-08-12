## Development Fund Proposal

**Author:** Fairmint
**Org:** Fairmint, Inc.
**Status:** Submitted
**Created:** 2026-08-12
**Label:** token-asset-standards
**Champion:** IntellectEU

---

## Abstract

This proposal funds a DAML NFT standard for Canton, submitted as a new CIP and built on
CIP-0056 / CIP-0112 (Token Standard V2). The profile adds the item-level semantics the token
standards leave open: stable per-item identity, collection uniqueness, per-item metadata,
provenance, privacy rules, and whole-asset (including soulbound) lifecycle invariants.
Transferable NFTs move over the standard V2 transfer rail. This proposal defines no second
transfer protocol.

Canton has no ratified NFT-specific standard. CIP-0056 and CIP-0112 specify holdings, transfer
instructions, allocations, and settlement, and are agnostic to what the asset is. They do not
specify how a unique item keeps a durable identity across `ContractId` churn, how duplicate token
ids are prevented within a collection, how wallets render per-item metadata, or how
non-divisible transfer works. Teams that need those semantics today (marketplaces, credential
issuers, registries, RWA with per-unit identity) each invent their own, whether they use a
bespoke template or a CIP-0056 `Holding` with `amount = 1`.

Fairmint's SEC-registered Transfer Agent begins issuing production certificates on Canton
under the new standard, demonstrating a new end-to-end reference design (in Milestone 3).

---

## Specification

### 1. Objective

**Problem:** Canton lacks an NFT-specific standard that wallets, issuers, registries, and marketplaces
can implement consistently. This proposal will define and seek approval for a CIP covering the NFT
behavior described under Implementation Mechanics. The work is limited to the NFT profile, reference
implementation, conformance tests, integration documentation, and initial adoption. Marketplace mechanics,
custody models, public discovery, and regulated issuance policies remain outside scope.

### 2. Implementation Mechanics

The standard is a **new CIP defining an NFT profile on Token Standard V2**: pinned interface
packages that a template implements alongside the CIP-0112 holding and transfer interfaces
(the existing versioned `splice-api-*` packaging convention). One template is both a V2 holding
and a conforming NFT: V2 wallets, venues, and indexers already understand its ownership and
settlement, and NFT-aware applications read item semantics from the same asset.

The profile adds only what the token standards leave open (specified with RFC 2119 language in
the CIP):

1. **Stable identity.** One NFT, one identity (`registry_id`/`collection_id`/`token_id`),
   anchored to the V2 `InstrumentId` and preserved across lifecycle changes; `ContractId` is
   never the durable identifier.
2. **Whole-asset invariants.** Exactly one live holding, `amount = 1.0`, supply 0 or 1. Split,
   merge, fractional amounts, and partial transfer are rejected on every exposed path.
3. **Registry uniqueness.** A dual-authority `NftRegistry` with collection-scoped ledgers rejects
   duplicate token ids per collection lineage.
4. **Standard transfer.** Transferable NFTs use the CIP-0112 transfer flow; no second protocol.
   Soulbound NFTs advertise no transfer support and reject every ownership-changing path.
5. **Consent-based issuance.** Third-party mint requires designated-holder acceptance; issuance
   provenance appears in the standard view. *(Funded work; Milestone 2.)*
6. **Standard read model.** A thin NFT interface on the same template exposes registry,
   collection, item id, holder, metadata, confidentiality reference, and provenance.
7. **Per-item metadata.** Namespaced standard keys (`nft.canton.network/`), compatible with
   Splice `token-metadata-v1` at the asset level, plus an optional `ConfidentialityRef` so
   confidential payloads stay off-ledger.
8. **Private by default.** Visibility bounded to stakeholders; no enumeration, no public holder
   disclosure, no leakage of NFT existence through standard discovery surfaces.

**Standards compliance matrix.** Interface package versions are pinned, so conformance is
verifiable against packages:

| Standard | How the NFT profile relates |
| -------- | --------------------------- |
| **CIP-0056** (Token Standard) | Conforming NFTs are holdings; V1 wallets interoperate per CIP-0112's cross-version compatibility rules |
| **CIP-0112** (Token Standard V2, ratified 2026-06-12) | Primary rail: holdings, transfer instructions, events; profile invariants constrain V2 choices for `amount = 1.0` assets |
| **Splice `token-metadata-v1`** | Asset-level metadata surface reused; profile adds the per-item metadata layer |
| **CIP-0103** (dApp Standard) | Wallet guide specifies signing-flow composition for mint acceptance and transfers |
| **CIP-0104** (Traffic-Based App Rewards) | Produces direct traffic attribution |
| **ERC-721 / EIP-4906** | Normative semantic mapping (Appendix A) for teams and assets migrating from EVM, including metadata-update semantics |
| **DAML smart-contract upgrade (SCU)** | Interface packages versioned and pinned for upgrade compatibility, per Splice packaging conventions |

**Delivery approach:** All code develops in a public open-source repository; the specification is
submitted as a CIP to `canton-foundation/cips`, so the network governs the standard. Reference
implementation, conformance tests, and integration docs ship with the spec.

**Current implementation status:** Experimentation by the Fairmint dev team confirmed feasibility to build
a private-by-default NFT standard for the Canton ecosystem using existing Canton rails.

### 3. Architectural Alignment

**Relationship to CIP-0056 and CIP-0112 (Token Standard V2).** CIP-0056 describes itself as a
generic standard for tokenized assets, and CIP-0112 extends it with privacy-enhanced batch
settlement, account structures, and TradFi-aligned timing. A unique asset can be represented as
a `Holding` with `amount = 1` and settled through the standard's transfer and allocation rails.
What CIP-0056/CIP-0112 do not specify are the NFT-specific semantics this proposal standardizes:

- **Stable per-item identity:** no standard field or rule ties a holding to a durable token
  identity across `ContractId` churn; nothing prevents two `amount = 1` holdings from claiming the
  same logical item.
- **Collection-scoped uniqueness:** no standard mint lineage or duplicate-rejection authority per
  collection.
- **Per-item metadata:** CIP-0056 metadata is asset-class-level; there is no standard way for a
  wallet to render item-level name/description/image or a confidentiality reference.
- **Whole-asset lifecycle:** non-divisibility, consent-based whole-item transfer, and issuance
  provenance are conventions each implementer re-invents today.

A conforming NFT is a CIP-0112 holding. Transferable NFTs use the standard V2 transfer flow; the
new CIP adds only the item-semantics interfaces and invariants. Wallets keep one transfer rail
and indexers keep consuming standard holding-change events.

The standard mirrors the interface-package pattern the ecosystem already trusts (versioned
splice-api-* packages, Kaiko Data Standard) so adopting teams face a familiar shape: implement the
interface, read through the views.

**Wallet connectivity (CIP-0103).** The integration documentation includes a wallet guide showing
how conforming wallets surface the NFT view, render `nft.canton.network/` standard metadata,
execute standard CIP-0112 transfers for transferable NFTs, and present mint-acceptance requests
for consent, including how these flows compose with CIP-0103 dApp connectivity for signing
requests. A wallet with an existing V2 integration needs only the thin NFT read layer.

**Ecosystem priority fit.** The work falls under the published "App Building and Developer
Experience" priority area: token standards, interoperability across wallets, assets, and dApps,
and documentation/examples.

**Relationship to other NFT efforts in the ecosystem (non-duplication):**

Several ecosystem teams are building NFT applications and libraries (marketplaces, audited
component libraries). Those efforts implement and consume NFT semantics; none of them publish
a specification. This proposal contributes to the network-governed specification those
implementations can share, with a reference implementation and a production consumer: Fairmint's
equity certificates.

Fairmint's equity certificates (soulbound credentials over unique assets) are the first
production consumer application. Production certificates today are ERC-721-based on an EVM chain; a DAML
`EquityCertificate` prototype already implements the draft `Nft` interface. Milestone 3 migrates
production issuance onto the Canton standard, exercising the soulbound path.

**Featured App relevance.** Featured Asset Issuer qualification currently references CIP-0056
compliance; unique-asset issuers have no equivalent on-ramp today. A ratified NFT standard gives
Tokenomics and Accountability a conformance target for future unique-asset issuer categories.

### 4. Backward Compatibility

*Fully Backwards Compatible.* The standard ships as new interface and template packages
that **implement** the published CIP-0056/CIP-0112 interfaces without modifying Splice, the token
standard packages, or any deployed asset. Existing V2 wallets, venues, and indexers interact with
conforming NFTs through the interfaces they already support; existing V2 wallets can process
standard holdings and transfers; NFT rendering requires support for the new read interface.

---

## Milestones and Deliverables

All demos run on the V2-profile implementation produced by this grant. Each milestone ends with
an acceptance check. Fairmint builds milestones 2–4 in
parallel with CIP review; if governance amends the spec, Fairmint reworks the implementation
within the stated milestones without supplemental funds.

### Milestone 1: Feasibility Spike + Specification + CIP Submission

- **Estimated Delivery:** 1-2 Months After Approval
- **Focus:** Prove the profile is thin on the real V2 packages, lock the normative spec, open
  network governance, and make everything public.
- **Deliverables / Value Metrics:**
  - **Feasibility spike on current CIP-0112 packages:** one transferable and one soulbound asset,
    each a single template implementing both the V2 holding and the NFT profile, demonstrating a
    standard V2 transfer with stable identity at `amount = 1.0`; rejection of fractions, split,
    merge, aggregation, and partial transfer; standard holding-change events; and the metadata /
    provenance view. Spike results (pass, or the exact V2 constraint found) published; any hard
    incompatibility is raised with the Token Standards SIG before the spec locks.
  - **Public open-source repository** containing the specification, the existing prototype packages
    (re-published from Fairmint's private repository), the spike code, tests, and built `.dar`
    artifacts.
  - CIP draft PR opened against `canton-foundation/cips` with a CIP number assigned, announced on
    `cip-discuss`, with pinned interface-package versions per the compliance matrix.
  - Spec review session held with the Token Standards / Asset Standards SIG (calendar evidence +
    published minutes).
  - Explicit "enforceability boundary" section in the spec documenting what is enforced on-ledger
    versus trust-based.

### Milestone 2: Reference Implementation on the V2 Rails

- **Estimated Delivery:** 1-2 Months
- **Focus:** Build the new reference design: the profile's interface packages and reference
  templates on CIP-0112, closing the known authorization gaps from the prototype.
- **Deliverables / Value Metrics:**
  - Profile interface packages (identity, registry/uniqueness, per-item metadata, provenance,
    soulbound marker) plus reference templates implementing them alongside the V2 holding and
    transfer interfaces.
  - Whole-asset invariants enforced across every exposed V2 choice (supply 0/1, no
    split/merge/partial paths), with negative tests proving rejection.
  - Holder-authorized third-party issuance (mint acceptance path) and issuance provenance in the
    standard view. A user-held NFT cannot appear without designated-holder consent.
  - Documented mitigation or explicit trust-boundary statement for the dual-authority
    off-path-create gap, plus registry-scaling benchmarks for large collections.
  - **End-to-end demo on DevNet on the new reference design:** mint acceptance → standard V2
    transfer of the transferable NFT → rejected ownership change on the soulbound NFT, executed
    from a generic V2 wallet flow, with on-chain transaction references published so a second,
    independent reviewer can verify without deep context.

### Milestone 3: CIP Acceptance + Production Migration + Ecosystem Adoption

- **Estimated Delivery:** 1-2 Months
- **Focus:** CIP approval, production migration, external integrations, and the integration
  guides.
- **Deliverables / Value Metrics:**
  - **Production migration on the new reference design:** Fairmint's equity certificates,
    ERC-721-based on an EVM chain today, issued as conforming soulbound NFTs on Canton, with
    on-chain evidence (DevNet, MainNet where applicable) and the migration documented as a
    reusable EVM-to-Canton case study.
  - At least **2 independent integrators** (wallet, marketplace, registry, or issuer) with
    verifiable DevNet or MainNet integrations against the standard, confirmed via written
    attestations or on-chain/repository evidence from entities independent of Fairmint. Target
    profile: one Featured Wallet rendering the NFT view via its existing V2 integration, plus one
    marketplace, registry, or issuer.
  - **CIP Accepted:** the CIP reaches "Approved" status in `canton-foundation/cips`. Fairmint
    carries the governance-timing risk on this gate (see Acceptance Criteria).
  - Public adoption report: integrations, feedback received, changes made, and a maintenance
    roadmap.
  - Wallet integration guide: reading the NFT view, rendering standard metadata, executing
    standard V2 transfers for NFTs, handling mint acceptance, CIP-0103 signing-flow composition.
  - Application builder guide with the equity-certificate worked example and the ERC-721 /
    EIP-4906 semantic mapping for teams and assets arriving from EVM.
  - Docs usability check: a named external developer completes a working integration from the
    published docs alone and attests to it in writing.

### Milestone 4: Production Equity Volume at Scale

- **Estimated Delivery:** 12/31/2026
- **Focus:** Issue certificates against Fairmint's production cap tables at scale. Fairmint
  operates cap tables for hundreds of companies.
- **Deliverables / Value Metrics:**
  - **Equity certificates representing at least 18M shares** (aggregate across Fairmint-managed
    cap tables) issued as conforming soulbound NFTs on Canton.
  - **Privacy-preserving verification methodology** published with the milestone claim: aggregate
    share counts, certificate counts, and issuer counts reported with on-chain evidence
    sufficient for an independent reviewer to confirm scale without seeing per-holder positions.
  - **Registry and issuance throughput validated at production scale:** collection-scoped
    uniqueness ledgers and mint-acceptance flows benchmarked under the full certificate load,
    with results published (extending the Milestone 2 registry-scaling benchmarks from synthetic
    to production volumes).
  - **Ongoing issuance wired to the standard:** new equity positions on Fairmint-managed cap
    tables receive conforming certificates by default, so the volume figure grows after the grant
    rather than being a one-time migration snapshot (pending holder's KYC/KYB completion).

*Acceptance for M4: aggregate certificate coverage ≥ 18M shares confirmed by the published
verification methodology against on-chain evidence; throughput benchmark report published;
default-issuance path live in production.*

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone.
- Demonstrated functionality: working demos backed by on-chain transaction references that an
  independent reviewer can verify without deep context.
- Documentation and knowledge transfer: an external team can implement or integrate the standard
  from published materials alone (explicitly tested in M3).
- Each milestone lists an acceptance check the committee can answer yes/no from
  published evidence (repository state, CIP status, attestations, on-chain transaction
  references) without interpretation.
- Alignment with stated value metrics: M3 is accepted on CIP Acceptance plus external
  integrations, and M4 on production equity volume (at least 18M shares represented on the
  standard).

Project-specific conditions:

- **CIP Acceptance is a payment gate.** Milestone 3 payment releases only when the CIP reaches
  "Approved" status. Fairmint accepts that governance timing is not fully within its control and
  carries that risk; build work (M2) proceeds in parallel, and if governance requests spec
  changes, Fairmint implements them within the stated milestones without supplemental funds.
- **Independent verification.** For M2–M4, Fairmint will provide demo access and on-chain
  references sufficient for a second reviewer designated by the committee to confirm the
  functionality, consistent with established accountability practice. For M4 specifically, the
  reviewer receives the aggregate-verification methodology and on-chain evidence to confirm the
  equity-volume claim without access to per-holder data.

---

## Sustainability

Fairmint operates production infrastructure on Canton today (validator, Featured App
"Onchain Transfer Agent", the Open Cap Table Protocol DAML packages) and is the standard's first
production consumer, so maintenance is tied to Fairmint's own operations:

- Fairmint commits to maintaining the reference implementation, conformance suite, and
  documentation for a minimum of 12 months after final milestone acceptance (security fixes,
  compatibility with Canton/Splice releases, integration support for adopters).
- Once the CIP is ratified, evolution of the standard itself is governed by the CIP process, not by
  Fairmint unilaterally.
- Extension proposals (DVP above the core, discovery, soulbound/credential semantics, regulated
  registry policy) will be brought as separate, independently fundable proposals.

---

## Funding

**Total Funding Request:** **4,500,000 CC**

### Payment Breakdown by Milestone

- Milestone 1 *(Feasibility Spike + Specification + CIP Submission)*: **700,000 CC** upon committee
  acceptance
- Milestone 2 *(Reference Implementation on the V2 Rails)*: **300,000 CC** upon committee
  acceptance
- Milestone 3 *(CIP Acceptance + Production Migration + Ecosystem Adoption)*:
  **1,500,000 CC** upon committee acceptance
- Milestone 4 *(Production Equity Volume at Scale)*: **2,000,000 CC** upon final release and
  acceptance

Adoption-based share: **3,500,000 of 4,500,000 CC (78%)** is gated on adoption outcomes (CIP
Acceptance, independent third-party integrations, and production equity volume), exceeding the
fund's ≥50% adoption-based requirement. Build milestones (M1–M2, 1,000,000 CC) are priced at
development cost; the adoption milestones carry the margin because Fairmint bears the risk of
missing them.

### Cost Basis

Build milestone pricing, by engineering effort and skillset:

- **M1 (700,000 CC):** senior DAML architecture, 2 engineers × 1.5 months for the spike, spec
  finalization, and CIP drafting, plus governance/SIG coordination through CIP review.
- **M2 (300,000 CC):** mixed DAML and test engineering, 1 engineer × 1.5 months for the profile
  packages, reference templates, and conformance/negative test suites.
- **M3 / M4:** integration and production engineering (≈ 2 engineers × 1.5 months) for the
  migration and adopter support, plus the adoption-risk margin described above.

CC amounts convert from USD estimates at the 30-day average CC/USD price (CoinGecko) on the
submission date, to be recalculated upon committee approval.

### Volatility Stipulation

The project duration is under 6 months. Should the timeline extend beyond 6 months, remaining
milestone payments will be revalued for USD/CC price volatility per Development Fund policy;
scope remains as stated in the Milestones section, and Fairmint absorbs rework from
governance-requested spec changes without supplemental funds.

---

## Demand Evidence

- **Fairmint** (production issuer): equity certificates issued under its SEC-registered transfer
  agent operations, per Milestones 3–4.
- Several data providers are in direct conversations with Fairmint to expose relevant NFT data
  into their data pipelines for public consumption.

---

## Co-Marketing

Upon release, Fairmint will collaborate with the Foundation on:

- Announcement coordination for the CIP submission and for the standard's ratification.
- A technical blog / case study: designing an NFT standard for a privacy-first network, including
  the equity-certificate worked example.
- Developer promotion: a walkthrough session or workshop for wallet and application teams (offered
  through the Token Standards SIG), and joint announcements with the first external adopters.

---

## Motivation

Why this is valuable to the Canton ecosystem:

- Ecosystem teams already define their own item conventions for lack of a standard. Each
  additional bespoke NFT model is another integration wallets and indexers must build separately.
- Beneficiaries: wallets (one integration renders any conforming unique asset) and unique-asset
  applications: marketplaces, credential issuers, RWA registries, equity and fund tokenization.
- The item-semantics layer runs today as a prototype with tests and built artifacts. The grant
  funds the V2-rails implementation, CIP governance, and adoption.
- The privacy properties (no global enumeration, no public holder disclosure, consent-based
  transfer) are not available in public-chain NFT standards and matter to institutions holding
  regulated unique assets.

---

## Rationale

**Need Beyond CIP-0056.** An `amount = 1` holding is a valid settlement representation of a unique item,
but CIP-0056/CIP-0112
say nothing about how that holding's identity survives `ContractId` churn, how a collection rejects
duplicate token ids, how a wallet finds item-level metadata, or what non-divisible lifecycle looks like.
Two independent `amount = 1` implementations do not interoperate on any of those dimensions. This profile
specifies them on the same rails.

**Use Token Standard V2.** Fairmint's original
prototype had its own transfer lifecycle (offer / accept / expire) with zero Splice dependencies.
We abandoned that shape after CIP-0112 ratified: a standalone standard would force wallets,
custodians, venues, and indexers to support a second ownership and transfer model. The profile
reuses the V2 account, holding, transfer, and event surfaces and adds only identity, uniqueness,
metadata, provenance, privacy, and whole-asset rules. The Milestone 1 spike tests this on the
real V2 packages; if a hard incompatibility surfaces, we document the constraint and raise it
with the Token Standards SIG.

**Doesn't ratified CIP-0112 already make this unnecessary?** No. CIP-0112 deepens settlement
(batch privacy, accounts, timing). It neither addresses nor intends to address per-item identity,
uniqueness, per-item metadata, or whole-asset lifecycle.

**Why not wait for a library to define the pattern?** Library components in funded ecosystem
grants define no identity model, uniqueness authority, consent-based mint path, or privacy
visibility rules, and a library import does not guarantee interoperability between wallets,
registries, and marketplaces. A ratified specification does, and gives those libraries a target
to implement.

**Why is the registry first-class?** The profile needs an on-ledger mint lineage and uniqueness
authority. Keeping `NftRegistry` / `CollectionRegistry` separate from live asset state
means transfer lifecycle changes never weaken uniqueness tracking, and collection-scoped ledgers
keep write costs bounded per collection rather than per registry.

**Why move beyond authority-only mint?** A user-held asset should not appear in a holder's private
asset set solely because the registry authority decided to place it there. Requiring
designated-holder acceptance makes issuance match the transfer security model and makes provenance
meaningful to wallets and auditors. This is the main funded implementation change (M2).

**Fairmint Implementation Role.** Fairmint operates a Canton validator and a Featured App in production, authored
the Open Cap Table Protocol DAML packages, and built the NFT prototype because its
equity-certificate roadmap requires it. This grant funds the work for the broader Canton ecosystem.

---

## Appendix A — ERC-721 / EIP-4906 semantic mapping

Normative mapping for teams migrating EVM NFT assets to Canton. Fairmint uses it in
Milestones 3–4 for its own production ERC-721 equity certificates.

| ERC-721 / EVM concept | Canton NFT profile equivalent |
| --------------------- | ----------------------------- |
| `(contractAddress, tokenId)` | Stable item identity anchored to the V2 `InstrumentId`, independent of ledger `ContractId` |
| `ownerOf` | Owner of the single live `amount = 1.0` V2 holding |
| `tokenURI` | Structured per-item metadata plus optional `confidentiality_ref` |
| ERC-721 Metadata JSON (name/description/image) | Reserved `nft.canton.network/` standard metadata keys |
| `safeTransferFrom` | Standard CIP-0112 transfer flow (recipient consent native to Canton) |
| EIP-4906 `MetadataUpdate` events | Standard holding-change events plus versioned metadata in the profile view |
| Soulbound (e.g. EIP-5192-style) | Profile soulbound mode: no advertised transfer support; every ownership-changing path rejected |
| Minting to a third party | Mint acceptance path (designated-holder consent required) |
| Per-token approval / operator-for-all / enumeration | Not standardized in the profile (enumeration conflicts with privacy-by-default) |
| Atomic swap / DVP | Native via CIP-0112 allocations; no NFT-specific extension needed |
