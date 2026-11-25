## Development Fund Proposal

**Author:** Boris Nelkin, Nick Mancuso
**Org:** Fairmint, Inc.
**Status:** Submitted
**Created:** 2026-08-12
**Proposal Type:** RFP-aligned
**RFP / Roadmap Area:** RFP-12 RWA Standards (Financial Markets, Standards and Verification)
**Label:** token-asset-standards
**Champion:** IntellectEU

---

## Abstract

This proposal funds a DAML NFT standard for Canton, submitted as a new CIP and built on
CIP-0056 / CIP-0112 (Token Standard V2). The profile adds the item-level semantics the token
standards leave open: stable per-item identity, a uniqueness declaration, per-item metadata,
a soulbound mode, and whole-asset lifecycle invariants.
Transferable NFTs move over the standard V2 transfer rail. This proposal defines no second
transfer protocol.

Canton has no ratified NFT-specific standard. CIP-0056 and CIP-0112 specify holdings, transfer
instructions, allocations, and settlement for any tokenized asset. They do not
specify how a unique item keeps a durable identity across `ContractId` churn, how a registry
declares uniqueness, how wallets render per-item metadata, or how non-divisible transfer works.
Teams that need those semantics today (marketplaces, certificate issuers, registries, RWA with
per-unit identity) each invent their own, whether they use a
bespoke template or a CIP-0056 `Holding` with `amount = 1`.

Milestone 1 delivers the reference design. Fairmint's SEC-registered Transfer Agent issues
production certificates on Canton under the standard in Milestone 4.

---

## Specification

### 1. Objective

**Problem:** Canton lacks an NFT-specific standard that wallets, issuers, registries, and marketplaces
can implement consistently. The CIP was filed on 6 October 2026 as
[cips #276](https://github.com/canton-foundation/cips/pull/276); this grant funds the reference
implementation, conformance tests, documentation, and adoption. Marketplace mechanics, custody models, public discovery, and regulated issuance policies remain outside scope.

### 2. Implementation Mechanics

The standard is a **new CIP defining an NFT profile on Token Standard V2**: pinned interface
packages that a template implements alongside the CIP-0112 holding and transfer interfaces
(the existing versioned `splice-api-*` packaging convention). One template is both a V2 holding
and a conforming NFT: V2 wallets, venues, and indexers already understand its ownership and
settlement, and NFT-aware applications read item semantics from the same asset.

The profile adds only what the token standards leave open (specified with RFC 2119 language in
the CIP):

1. **Stable identity.** One item, one `InstrumentId`. `instrumentId.admin` is the registry
   party, and `instrumentId.id` is
   `cip-<nr>/id:nft/<collectionId>/<tokenId>`. `collectionId` must not contain `/`. Transfer,
   lock, and any recreation of the holding preserve the instrument id. `ContractId` is never
   the durable identifier.
2. **Whole-asset invariants.** Exactly one live holding, `amount = 1.0`, supply 0 or 1,
   `decimals = 0`. The template exposes no split, merge, or partial-transfer choice.
3. **Uniqueness.** A registry must not have two active holdings of the same instrument. It may
   declare `enforced` (issuance fails on-ledger, checked against a uniqueness record the
   registry and its operators sign) or `policy` (an off-ledger undertaking). If the declaration
   is absent, no claim is made. An id is never issued again after burn or revocation; a
   replacement is a new item with a new id that may point to the old one.
4. **Standard transfer.** Transferable items use the CIP-0112 transfer and allocation flows;
   no second protocol. A transferable item should also implement the CIP-0056 V1 interfaces.
   Soulbound mode rejects every transfer and allocation except a mint from `cip-112/mint` or a
   burn to `cip-112/burn`. The transfer factory may exist for those.
5. **Consent-based issuance.** A mint should be a transfer offer from the CIP-0112 mint account
   that the recipient accepts. *(Funded work; Milestone 1.)*
6. **Standard read model.** One interface, `Nft`, in `splice-api-token-non-fungible-v1`
   (`Splice.Api.Token.NonFungible.V1`). The view carries only `mode`, `uniqueness`,
   `revocable`, and `supersedes`. Identity, owner, and content stay on the CIP-0112 holding
   view. The interface has one read choice, `Nft_PublicFetch`, for a party who is not a
   stakeholder and has been shown the contract.
7. **Per-item metadata.** Content lives in holding metadata under `cip-<nr>/nft-*` (name,
   description, image, document URI, content hash, and an optional confidentiality reference).
   A new metadata key is an amendment to the CIP and needs no new package. A new typed view
   field ships as `splice-api-token-non-fungible-v2`. The registry may change content by
   recreating the holding, keeping the instrument id, mode, uniqueness, and account, and must
   not recreate a locked holding.
8. **Private by default.** An item is private unless the registry lists it. A listed item shows
   that it exists, how many a collection has, and the token ids. It does not show who holds it.
   Lookup by id stays open so a wallet can read an item it already holds, so an unlisted
   item's token id should be unguessable. A registry may instead answer that lookup only for
   callers it has authorized to read that item, and must then answer everyone else the same
   way whether or not the item exists. Active holdings are visible to the
   owner, the account provider, the registry, any operator signatory, and the parties CIP-0112
   requires. Holder enumeration is out of scope.

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

**Delivery approach:** All code develops in a public open-source repository; the specification has been
submitted to `canton-foundation/cips` as #276, so the network governs the standard. Reference
implementation, conformance tests, and integration docs ship with the spec.

**Current implementation status:** The CIP was filed on 6 October 2026 as
[canton-foundation/cips #276](https://github.com/canton-foundation/cips/pull/276). 5North offered
to act as its SV sponsor on cip-discuss. Digital Asset reviewed it on #276.

### 3. Architectural Alignment

**Relationship to CIP-0056 and CIP-0112 (Token Standard V2).** CIP-0056 is the Canton Network
token standard, and CIP-0112 extends it with privacy-enhanced batch
settlement, account structures, and TradFi-aligned timing. A unique asset can be represented as
a `Holding` with `amount = 1` and settled through the standard's transfer and allocation rails.
What CIP-0056/CIP-0112 do not specify are the NFT-specific semantics this proposal standardizes:

- **Stable per-item identity:** no standard field or rule ties a holding to a durable token
  identity across `ContractId` churn. This profile puts that identity in `instrumentId.id`.
- **Uniqueness:** nothing in CIP-0112 stops two active holdings from using the same instrument.
  This profile adds an optional declaration, `enforced` or `policy`.
- **Per-item metadata:** CIP-0056 metadata is asset-class-level. This profile adds
  `cip-<nr>/nft-*` keys on the holding so a wallet can render a name, description, and image.
- **Whole-asset lifecycle:** non-divisibility, consent-based whole-item transfer, and a
  soulbound mode are conventions each implementer re-invents today.

A conforming NFT is a CIP-0112 holding. Transferable NFTs use the standard V2 transfer flow; the
new CIP adds only the item-semantics interfaces and invariants. Wallets keep one transfer rail
and indexers keep consuming standard holding-change events.

The standard mirrors the interface-package pattern the ecosystem already trusts (versioned
splice-api-* packages, Kaiko Data Standard) so adopting teams face a familiar shape: implement the
interface, read through the views.

**Wallet connectivity (CIP-0103).** The integration documentation includes a wallet guide showing
how conforming wallets surface the NFT view, render `cip-<nr>/nft-*` metadata,
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

Fairmint's equity certificates (soulbound NFTs over unique assets) are the first
production consumer application. Production certificates today are ERC-721-based on an EVM chain; a DAML
`EquityCertificate` prototype already implements the draft `Nft` interface. Milestone 4 migrates
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
an acceptance check. Milestone 1 pays when the reference implementation is delivered and the CIP
is Approved. Fairmint builds milestones 2–4 on that implementation; if governance amends the
spec, Fairmint reworks the implementation inside Milestone 1 without supplemental funds.

### Milestone 1: Reference Implementation + CIP Approved

- **Estimated Delivery:** 1-2 Months After Approval
- **Payment:** **1,200,000 CC**, released only when the reference implementation is delivered and the CIP is Approved
- **Focus:** Build the reference design on CIP-0112, and carry the CIP to Approved.
- **Deliverables / Value Metrics:**
  - **Reference templates on current CIP-0112 packages:** one transferable and one soulbound asset,
    each a single template implementing both the V2 holding and the NFT profile, demonstrating a
    standard V2 transfer with a stable instrument id at `amount = 1.0`; rejection of fractions,
    split, merge, and partial transfer; rejection of a soulbound transfer other than a burn;
    each create and each archive of a holding reported in exactly one
    `EventLog_HoldingsChange` event; and `cip-<nr>/nft-*`
    metadata on the holding. Results are published. Any hard incompatibility is raised with the
    Token Standards SIG.
  - **Public open-source repository** containing the specification, the reference implementation
    reworked onto CIP-0112 (`splice-api-token-non-fungible-v1` and the reference templates),
    tests, and built `.dar` artifacts.
  - The `Nft` interface package plus reference templates implementing it alongside the V2
    holding and transfer interfaces.
  - Whole-asset invariants enforced across every exposed V2 choice (supply 0/1, no
    split/merge/partial paths), with negative tests proving rejection.
  - Issuance through a mint offer the holder accepts (mint acceptance path), as the profile
    recommends. In the reference implementation a user-held NFT does not appear without the
    holder's acceptance.
  - Documented trust boundary for off-path creation (Daml cannot prove which choice created a
    holding; registries should require an independent operator signatory), plus notes on how a
    reader finds one item by id and that the registry lists an item only when it means that
    item to be publicly discoverable.
  - **End-to-end demo on DevNet on the new reference design:** mint acceptance → standard V2
    transfer of the transferable NFT → rejected ownership change on the soulbound NFT, executed
    from a generic V2 wallet flow, with on-chain transaction references published so a second,
    independent reviewer can verify without deep context.
  - **CIP Approved:** the CIP reaches "Approved" status in `canton-foundation/cips`. Fairmint
    carries the governance-timing risk on this gate (see Acceptance Criteria).
  - Spec review session held with the Token Standards / Asset Standards SIG (calendar evidence +
    published minutes).
  - Explicit "enforceability boundary" section in the spec documenting what is enforced on-ledger
    versus trust-based.

### Milestone 2: Verification, Wallet Tooling, and Docs Test

- **Estimated Delivery:** 1-2 Months
- **Payment:** **300,000 CC** on committee acceptance
- **Focus:** Verify the reference implementation, publish the wallet and builder guides, and
  show that an outside developer can integrate from the published docs.
- **Deliverables / Value Metrics:**
  - Wallet integration guide: reading the `Nft` view and holding metadata, rendering
    `cip-<nr>/nft-*` keys, executing standard V2 transfers for transferable items, offering a
    burn and no other transfer for a soulbound item, handling mint acceptance, and CIP-0103
    signing-flow composition.
  - Application builder guide with the equity-certificate worked example and the ERC-721 /
    EIP-4906 semantic mapping for teams and assets arriving from EVM.
  - Docs usability check: a named external developer completes a working integration from the
    published docs alone and attests to it in writing.

### Milestone 3: Independent Integrators

- **Estimated Delivery:** claims open from M2 acceptance through month 12 after committee approval with unpaid claims to expire
- **Payment:** **500,000 CC** per verified independent integrator, up to three (**1,500,000 CC**).
- **Focus:** Independent integrations against the standard.
- **Deliverables / Value Metrics:**
  - At least **2 independent integrators** (wallet, marketplace, registry, or issuer) with
    verifiable DevNet or MainNet integrations against the standard, confirmed via written
    attestations or on-chain/repository evidence from entities independent of Fairmint. Target
    profile: one Featured Wallet rendering the NFT view via its existing V2 integration, plus one
    marketplace, registry, or issuer. A third integrator may be verified on the same terms.
  - Public adoption report: integrations, feedback received, changes made, and a maintenance
    roadmap.

### Milestone 4: Production Equity Certificates

- **Estimated Delivery:** within 9 months of committee approval
- **Payment:** **1,500,000 CC** when certificates covering at least 18M shares are issued
- **Focus:** Issue certificates against Fairmint's production cap tables at scale. Fairmint
  operates cap tables for hundreds of companies.
- **Deliverables / Value Metrics:**
  - **Production migration on the new reference design:** Fairmint's equity certificates,
    ERC-721-based on an EVM chain today, issued as conforming soulbound NFTs on Canton, with
    on-chain evidence (DevNet, MainNet where applicable) and the migration documented as a
    reusable EVM-to-Canton case study.
  - **Equity certificates representing at least 18M shares** (aggregate across Fairmint-managed
    cap tables) issued as conforming soulbound NFTs on Canton.
  - **Privacy-preserving verification methodology** published with the milestone claim: aggregate
    share counts, certificate counts, and issuer counts reported with on-chain evidence
    sufficient for an independent reviewer to confirm scale without seeing per-holder positions.
  - **Registry and issuance throughput validated at production scale:** the optional on-ledger
    uniqueness record and mint-acceptance flows benchmarked under the full certificate load,
    with results published.
  - **Ongoing issuance wired to the standard:** new equity positions on Fairmint-managed cap
    tables receive conforming certificates by default, so the volume figure grows after the grant
    rather than being a one-time migration snapshot (pending holder's KYC/KYB completion).

*Acceptance for M4: aggregate certificate coverage ≥ 18M shares, issued within 9 months of
committee approval, confirmed by the published verification methodology against on-chain
evidence; throughput benchmark report published; default-issuance path live in production.*

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone.
- Demonstrated functionality: working demos backed by on-chain transaction references that an
  independent reviewer can verify without deep context.
- Documentation and knowledge transfer: an external team can implement or integrate the standard
  from published materials alone (explicitly tested in M2).
- Each milestone lists an acceptance check the committee can answer yes/no from
  published evidence (repository state, CIP status, attestations, on-chain transaction
  references) without interpretation.
- Alignment with stated value metrics: M1 is accepted on the reference implementation plus CIP
  Approval, M3 is accepted when two independent integrators are verified, and M4 on production
  equity volume (at least 18M shares within 9 months of committee approval).

Project-specific conditions:

- **CIP Approval is a Milestone 1 payment gate.** Milestone 1 pays 1,200,000 CC only when the
  reference implementation is delivered and the CIP reaches "Approved" status. Fairmint accepts
  that governance timing is not fully within its control and carries that risk. If governance
  requests spec changes, Fairmint implements them inside Milestone 1 without supplemental funds.
- **Milestone 3 pays per integrator.** Each verified independent integrator releases 500,000 CC,
  up to three (1,500,000 CC). The milestone is accepted at two integrators (1,000,000 CC).
- **Independent verification.** For M1–M4, Fairmint will provide demo access and on-chain
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
- Extension proposals (settlement above the core, discovery, and credential semantics, which
  this profile does not cover) will be brought as separate, independently fundable proposals.

---

## Funding

**Total Funding Request:** **4,500,000 CC**

### Payment Breakdown by Milestone

- Milestone 1 *(Reference Implementation + CIP Approved)*: **1,200,000 CC** when both are done
- Milestone 2 *(Verification, Wallet Tooling, and Docs Test)*: **300,000 CC** on acceptance
- Milestone 3 *(Independent Integrators)*: **500,000 CC** per verified integrator, up to three
  (**1,500,000 CC**). Accepted at two (**1,000,000 CC**).
- Milestone 4 *(Production Equity Certificates)*: **1,500,000 CC** when certificates covering
  at least 18M shares are issued, within 9 months of committee approval

Adoption-based share: **3,000,000 of 4,500,000 CC (67%)** cannot be paid without an adoption
outcome. Milestone 3 pays per verified integrator and Milestone 4 pays on production volume. This exceeds the fund's ≥50% adoption-based requirement.

### Cost Basis

- **M1 (1,200,000 CC):** reference implementation on the CIP-0112 rails, plus carrying the CIP
  to Approved.
- **M2 (300,000 CC):** verification, wallet and application guides, and the external docs test.
- **M3 (1,500,000 CC):** 500,000 CC per verified independent integrator, up to three. The
  milestone is accepted at two.
- **M4 (1,500,000 CC):** production certificates covering at least 18M shares, within 9 months
  of committee approval.

CC amounts convert from USD estimates at the 30-day average CC/USD price (CoinGecko) on the
submission date, to be recalculated upon committee approval.

### Volatility Stipulation

The project duration is 12 months. Should the timeline extend beyond 12 months, remaining
milestone payments will be revalued for USD/CC price volatility per Development Fund policy;
scope remains as stated in the Milestones section, and Fairmint absorbs rework from
governance-requested spec changes without supplemental funds.

---

## Demand Evidence

- **Fairmint** (production issuer): equity certificates issued under its SEC-registered transfer
  agent operations, per Milestone 4.
- **5North** offered to act as the CIP's SV sponsor on cip-discuss.
- Several data providers are in direct conversations with Fairmint to expose relevant NFT data
  into their data pipelines for public consumption.

---

## Co-Marketing

Upon release, Fairmint will collaborate with the Foundation on:

- Announcement coordination for the standard's ratification.
- A technical blog / case study: designing an NFT standard for a privacy-first network, including
  the equity-certificate worked example.
- Developer promotion: a walkthrough session or workshop for wallet and application teams (offered
  through the Token Standards SIG), and joint announcements with the first external adopters.

---

## Motivation

A wallet or venue that wants to show unique assets on Canton today has to integrate each
issuer's item model on its own. That work repeats for every new issuer. One shared profile
is one implementation for the wallet and one spec for the issuer. Institutions also get
private, consent-based item semantics.

Fairmint will issue its equity certificates under the standard. Milestone 3 also requires
at least two independent integrators.

---

## Rationale

**Need Beyond CIP-0056.** An `amount = 1` holding is a valid settlement representation of a unique item,
but CIP-0056/CIP-0112
say nothing about how that holding's identity survives `ContractId` churn, how a registry
declares uniqueness, how a wallet finds item-level metadata, or what a non-divisible lifecycle
looks like.
Two independent `amount = 1` implementations do not interoperate on any of those dimensions. This profile
specifies them on the same rails.

**Use Token Standard V2.** Fairmint's original
prototype had its own transfer lifecycle (offer / accept / expire) with zero Splice dependencies.
We abandoned that shape after CIP-0112 ratified: a standalone standard would force wallets,
custodians, venues, and indexers to support a second ownership and transfer model. The profile
reuses the V2 account, holding, transfer, and event surfaces and adds identity, a uniqueness
declaration, metadata, mode, and whole-asset rules. The Milestone 1 reference implementation
tests this on the real V2 packages; if a hard incompatibility surfaces, we document the
constraint and raise it with the Token Standards SIG.

**Doesn't ratified CIP-0112 already make this unnecessary?** No. CIP-0112 deepens settlement
(batch privacy, accounts, timing). It neither addresses nor intends to address per-item identity,
uniqueness, per-item metadata, or whole-asset lifecycle.

**Why not wait for a library to define the pattern?** Library components in funded ecosystem
grants define no identity model, uniqueness authority, consent-based mint path, or privacy
visibility rules, and a library import does not guarantee interoperability between wallets,
registries, and marketplaces. A ratified specification does, and gives those libraries a target
to implement.

**Why is uniqueness a declaration?** On-ledger enforcement needs a record that grows with the
collection and serializes concurrent issuance. The profile lets a registry declare `enforced`
or `policy`, and makes no claim when the declaration is absent. Identity lives in the
instrument id, so the `Nft` view does not repeat it.

**Why move beyond authority-only mint?** A user-held asset should not appear in a holder's private
asset set solely because the registry authority decided to place it there. The profile
recommends a mint offer the holder accepts, and the reference implementation issues that way,
so issuance matches the transfer security model. This is the
main funded implementation change (M1).

**Fairmint Implementation Role.** Fairmint operates a Canton validator and a Featured App in production, authored
the Open Cap Table Protocol DAML packages, and built the NFT prototype because its
equity-certificate roadmap requires it. This grant funds the work for the broader Canton ecosystem.

---

## Appendix A — ERC-721 / EIP-4906 semantic mapping

Normative mapping for teams migrating EVM NFT assets to Canton. Fairmint uses it in
Milestones 2 and 4 for its own production ERC-721 equity certificates.

| ERC-721 / EVM concept | Canton NFT profile equivalent |
| --------------------- | ----------------------------- |
| `(contractAddress, tokenId)` | The full V2 `InstrumentId`: the registry party as `admin` plus `cip-<nr>/id:nft/<collectionId>/<tokenId>` as `id`, independent of ledger `ContractId`. The `id` alone does not identify an item, since two registries can issue the same string |
| `ownerOf` | Owner of the single live `amount = 1.0` V2 holding |
| `tokenURI` | `cip-<nr>/nft-uri`, with image, name, and description keys beside it |
| ERC-721 Metadata JSON (name/description/image) | `cip-<nr>/nft-*` metadata keys; the document at `nft-uri` should follow the ERC-721 JSON schema |
| `safeTransferFrom` | Standard CIP-0112 transfer flow (recipient consent native to Canton) |
| EIP-4906 `MetadataUpdate` events | The registry recreates the holding. Each create and each archive of a holding is reported in exactly one `EventLog_HoldingsChange` event. The view has no metadata version |
| Soulbound (e.g. EIP-5192-style) | Soulbound mode: no transfer or allocation except a mint from `cip-112/mint` or a burn to `cip-112/burn` |
| Minting to a third party | Mint offer the holder accepts (recommended by the profile; the reference implementation requires it) |
| Per-token approval / operator-for-all / holder enumeration | Not standardized. An item is private unless the registry lists it. A listed item shows its token id and not its holder |
| Atomic swap / DVP | Native via CIP-0112 allocations; no NFT-specific extension needed |
