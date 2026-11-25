## Development Fund Proposal

**Organization:** Intain Inc  
**Author / Primary Contact:** Sanjay Nishank, COO, Intain; sanjay.nishank@intainft.com; GitHub: @IntainFT  
**Status:** Submitted  
**Created:** 2026-11-24  
**Proposal Type:** RFP-aligned  
**RFP / Roadmap Area:** Financial Markets, Standards & Verification. RFP 12 RWA Standards, sub-area "Daml and Institutional RWA Workflow Standards": item 1 (token and asset representation standards), item 2 (asset metadata standards), item 3 (issuance, transfer, redemption and cancellation workflows), item 8 (interoperability between Canton applications), item 9 (integration mappings for existing institutional systems), item 11 (conformance tests and reference implementations). Related: RFP 10 (discovery of asset registries).  
**Champion:** `Needs Champion`  
**Suggested SIGs:** Token Standards / Asset Standards (primary); Financial Workflows & Composability; Identity & Metadata  
**Total Funding Request:** Up to 2,640,000 CC: 1,540,000 CC fixed (Milestones 1, 2 and 4) plus up to 1,100,000 CC paid per independent adopter (Milestone 3)  
**Project Duration:** About 12 months. Delivery by month 6, adoption to month 12, then maintenance for 12 months after Milestone 2.  
**Label:** token-asset-standards

---

## Abstract

The 2026-2028 roadmap expects "a common standard for party credentials and metadata", and that "a network-wide asset registry builds on this common metadata standard". The party side is being worked on under RFP 10 and RFP 12.1. The asset side has no standard today. The token standards (CIP-0056, CIP-0112) say how a holding moves. They do not say what real-world asset a holding represents, whether that asset was verified, or whether the same asset is already tokenized somewhere else. Every RWA application on Canton answers those questions in its own contracts, so a second application cannot read or check the answer. A token proves ownership of a claim, not the truth of the collateral behind it.

We propose an open Asset Registry Standard for real-world credit assets. Version 1 covers loans and receivables. It has four parts:

- a metadata schema with privacy-preserving commitments in place of personal or commercial data;
- a Daml interface package for asset records, verification attestations and lifecycle status, which links to token-standard holdings;
- a registration rule that stops the same underlying asset being registered twice across issuers, without relying on one trusted operator;
- an off-ledger registry API, a mapping specification from institutional loan tapes to the schema, a reference implementation and a conformance suite.

Everything is Apache-2.0.

The work starts from a system that is already in use. Intain's Asset Registry serves live issuers today (more than 5 issuers and more than 10,000 assets): it ingests their loan tapes, verifies their assets and maintains their records on Intain's Avalanche production subnet. Intain's verification workflow behind it has checked more than 400,000 loans and assets across more than 100 deals. In Intain's test environment, the same registry mints each verified asset on Intain's Avalanche test subnet and on Canton DevNet. As a proof of concept, the dual mint has also run on Canton TestNet, with Entra-authenticated ledger access. This grant turns the Intain-specific parts into an open standard that other issuers and applications can adopt, and takes it to TestNet and MainNet.

---

## Specification

### 1. Objective

Make the identity, metadata and verification status of a real-world credit asset readable and checkable by any Canton application, with one registered record for each underlying asset.

Today an RWA token on Canton has three gaps:

1. **No shared asset record.** No standard object says "this holding represents receivable X, face amount Y, due date Z, verified on date D by source S". Each application defines its own.
2. **No shared verification evidence.** Applications cannot tell whether the underlying asset was verified, by whom, under which rule version, or against which evidence, without a bilateral integration with the issuer. Today most asset reviews check a sample, often about 5% of loans. Where every asset is checked, the evidence stays inside the verifier's own system.
3. **No protection against duplicate registration across issuers or applications.** The same receivable or loan can be tokenized in two places. An application has no standard way to check for this. Off-chain, this is how lenders recently lost money. Three 2025 US failures involved, as alleged, collateral that was pledged to more than one lender or did not exist:
   - **Tricolor** (subprime auto loans, Chapter 7). Prosecutors allege the same collateral was pledged to several lenders: about $2.2 billion pledged against about $1.4 billion of real collateral ([American Banker](https://www.americanbanker.com/news/tricolor-ceo-coo-and-cfo-indicted-in-1b-auto-finance-fraud)).
   - **First Brands** (trade receivables, Chapter 11). It had about $2.3 billion in factoring liabilities, and receivables are alleged to have been financed more than once ([GTR](https://www.gtreview.com/news/americas/first-brands-faces-investigation-into-double-financing-of-receivables-inventory/)).
   - **Bankim Brahmbhatt's telecom companies.** Lenders led by HPS allege that about $500 million of loans were secured on fake invoices and receivables ([Business Today](https://www.businesstoday.in/latest/corporate/story/blackrock-backed-lender-alleges-500-million-fraud-by-indian-origin-telecom-entrepreneur-report-500400-2025-10-31)).

   In each case, no lender could check independently that an asset existed and had not already been financed elsewhere.

Out of scope for version 1: pricing, servicing and corporate actions (see PixelPlex #944), settlement, collateral locks, and asset classes other than loans and receivables. Each can be a profile or a separate package later.

### 2. Implementation Mechanics

**2.1 Metadata schema v1.** A core record plus asset-class profiles.

- *Core:* asset type, registry-unique ID, issuer party, currency, key amounts and dates, lifecycle status, verification status, verification source, evidence fingerprint and rule version.
- *Receivable profile:* taken from the schema Intain already uses on Avalanche (`RNFTMetadata` in Intain's `ReceivablesNFT.sol`).
  - Commitments (hashes) for seller identity, obligor identity, invoice number, PO reference and delivery or acceptance reference.
  - Invoice date, due date, face amount and net eligible amount.
- *Loan profile:* taken from the schema Intain already uses for residential mortgage loans (`RRENFTMetadata` in Intain's `RRENFT.sol`, with the loan-tape mapping in its registry service).
  - Commitments (hashes) for the loan ID, servicer loan ID, originator identity, borrower identity, property address and MERS or recording reference.
  - Origination and maturity dates, currency, original principal, rate type, lien position, and property, occupancy and co-borrower classifications.
  - Version 1 starts from these residential mortgage fields. Other loan types are added as sub-profiles.
- *Privacy:* the schema keeps personal and commercial identifiers off-ledger.
  - **Disclosure commitments.** On-ledger fields are HMAC-SHA256 commitments over canonicalised values (uppercased, with whitespace and punctuation collapsed), under a separate key for each issuer. This is the scheme Intain's registry uses today. The issuer can show a party entitled to see the data that a value matches its commitment, without the data being published.
  - **Evidence fingerprint.** A Merkle root over the document manifest ties each record to one fixed set of documents. Certificates and encrypted reference data can sit in content-addressed storage such as IPFS, while the documents stay under existing custodial arrangements.
  - **Uniqueness key.** Duplicate detection cannot use these commitments, because the same asset under two issuers' keys gives two different hashes. It uses a separate key, described in §2.3.
- *Identifiers that work across asset classes:*
  - Every profile can carry the originator's LEI or DUNS number, the originator and servicer loan numbers, the note or instrument number, and the manifest Merkle root.
  - Where a strong collateral identifier exists, it carries uniqueness without personal data: for mortgages, the parcel number (APN) and MERS MIN or recording reference.
  - Classes with weak collateral identifiers need commitments over personal data as well. These are added as later sub-profiles, for example vehicle IDs for auto loans, or contract and UCC filing numbers for merchant cash advances.
- *How the schema is published:* field names, types and the commitment scheme are published as a versioned specification with JSON Schema and test vectors.

**2.2 Daml interface package (working name `cn-asset-registry-v1`; name to be confirmed with the Token Standards SIG).**

The package targets Daml SDK 3.5 (Intain's current model builds on 3.5.5). It depends on the token-standard interface packages (`splice-api-token-holding-v1` and `splice-api-token-metadata-v1`, or their CIP-0112 V2 successors). It is an interface package: implementations supply the templates. The working shape:

| Interface | Key fields | Signatories / observers | Choices |
|---|---|---|---|
| `AssetRecord` | `registryId`, `assetType`, `profile` (receivable or loan), `issuer`, `currency`, amounts and dates, disclosure commitments, `status`, `holdings` (references) | Signatory: issuer. Observers: the holders and the parties the issuer names. No operator sees every record | `UpdateStatus` (issuer), `LinkHolding` / `UnlinkHolding` (issuer, with the instrument admin) |
| `VerificationAttestation` | `assetRecord` reference, `verifier`, `verificationSource`, `ruleVersion`, `evidenceFingerprint` (empty for data-only), `verifiedAt`, `expiresAt` | Signatory: verifier. Observers: the issuer and the holders | `Revoke` (verifier) |
| `Registration` | the request, plus the uniqueness key from §2.3 | Signatory: issuer, plus whichever uniqueness party the §2.3 design uses | `Register` creates the `AssetRecord` or rejects a duplicate |

- *Lifecycle (RFP 12.2 item 3):*
  - `status` covers `ACTIVE`, `REDEEMED` (repaid and closed), `DEFAULTED`, `CANCELLED` (registered in error or withdrawn) and `RETIRED`.
  - Issuance is `Register`. Redemption, default and cancellation are `UpdateStatus` transitions.
  - Transfer of ownership stays with the token standard: the record follows the holding and does not move it.
- *Link to holdings:* an `AssetRecord` references the CIP-0056/CIP-0112 holdings that represent it. A holding refers back through the `meta` field of the token-standard holding view, using a namespaced key (for example `asset-registry/record-id`).
  - The instrument admin sets `meta`, so the back-reference needs the admin's cooperation. Where the issuer is the admin, as in Intain's case, it can set it directly.
  - No token-standard interface changes. The exact keys are agreed with the Token Standards SIG at Milestone 1.

**2.3 Uniqueness across issuers.**
- *Current state:* Intain's current DevNet model serialises registration through one contract held by one trusted operator, which keeps a list of registered keys. The code says plainly that this "is not a network-wide uniqueness primitive".
  - Intain's commitments today are keyed per issuer, so the same asset under two issuers never produces the same value.
  - Intain's fingerprint design describes a consortium-held secret, so members' fingerprints match, but everything then rests on one shared secret.
  - Version 1 takes the next step: no single party holds the secret (Design A below).
- *Version 1:* replaces that list with a design in which:
  - the uniqueness key is a deterministic function of the asset's defining fields (for a receivable: seller, obligor, invoice number, amount and date; for a mortgage: the parcel number and MERS MIN where present, otherwise originator, borrower, property address, original principal and origination date), so two issuers registering the same asset produce the same key;
  - registration does not require any single operator to see every asset;
  - a duplicate attempt is rejected, or flagged to the parties entitled to know.
- *Existing Limitation:* a deterministic key cannot be salted per issuer. These fields also have low entropy, so a plain hash of them could be reversed by trying likely values. The key therefore has to be computed under a secret that no single party holds.
- *Two questions to be answered by the solution design:* who holds the secret that turns an asset's fields into its key, and who holds the index of registered keys and enforces that the first registration wins.
- *Design A, decentralised party (primary):*
  - A decentralised party, hosted on the participants of several independent operators with an m-of-n confirmation threshold, holds the index.
  - The same members jointly compute the key with a threshold oblivious PRF. An issuer gets the key for its asset without learning the secret, and the members never see the asset's fields.
  - It builds on Canton's multi-hosted parties and on BitSafe's Decentralization Manager (approved; it runs CBTC governance on MainNet). It needs no special hardware.
  - Risks: members reaching the threshold could collude to brute-force keys. An issuer could probe guessed values, so key requests need issuer credentials and rate limits.
- *Design B, trusted execution environment (alternative):*
  - The secret and the index sit inside a TEE-hosted participant whose operator sees only ciphertext, for example Financial Privacy Inc's TEE co-validator (#642, approved). The attestation measurements are published.
  - Issuers integrate more simply. The cost is trust in the hardware vendor and its side-channel record, and a dependency on #642 being delivered.
- *Requirements for either design:*
  - **Throughput.** Canton 3.x does not give network-wide key uniqueness, so "first wins" is enforced by index contracts that serialise registrations. The index is sharded by key prefix and accepts batch registration, so a portfolio of tens of thousands of assets does not queue behind one contract. Intain alone holds more than 10,000 assets.
  - **Duplicate leakage.** A rejected issuer learns that the asset is already registered somewhere. The disclosure table states who is told about a duplicate and what each party learns from it.
- *Design gate:* at Milestone 1 we choose with the SIG between A and B, and publish the trade-offs: what each party learns, what an index holder could infer, and what happens if a key holder colludes or goes offline.
- *Delivery:* the Milestone 2 reference registry implements the chosen design at a small threshold (for example 2-of-3 key holders). Larger operator sets and hardening follow under maintenance or a later proposal.

**2.4 Off-ledger registry API.** An OpenAPI specification for discovering asset records and attestations by issuer, asset type or registry-unique ID, and for serving the choice contexts that registration needs. It follows the shape of the existing token-standard registry API. Discovery of registries themselves is aligned with the RFP 10 name-service work where it exists.

**2.5 Integration mapping.** A specification that maps common institutional loan-tape and receivables-file fields to the schema, with a small reference mapper (CSV or JSON in, schema-valid records out). This covers RFP 12.2 item 9. Intain's commercial ingestion engine is not part of the grant.

**2.6 Reference implementation and conformance suite.** A reference registry (Daml package plus a minimal service) and a conformance package that another registry runs against its own implementation. Scenarios include registration, duplicate rejection, attestation and revocation, each lifecycle status transition, and holding linkage on token-standard V2.

**Deliverables:** the specification and JSON Schema; the Daml interface package and DAR; the OpenAPI specification; the mapping specification and reference mapper; the reference registry; the conformance suite; and documentation and integration guides for issuers, verifiers and reading applications. All are in a public Apache-2.0 repository.

### 3. Architectural Alignment

- **Roadmap:** the roadmap's "Capabilities" section expects "a common standard for party credentials and metadata" and "a network-wide asset registry builds on this common metadata standard". This proposal delivers the asset side of that.
- **RFP 12.2:** this covers asset representation, asset metadata standards, the issuance, redemption, cancellation and retirement workflow (transfer stays with the token standard), interoperability, integration mappings, and conformance tests and reference implementations (items 1, 2, 3, 8, 9 and 11). It supports multiple issuers and applications by design, as RFP 12 requires.
- **Token standards:** this builds on CIP-0056/CIP-0112 holdings and does not change them.
- **Privacy:**
  - Only commitments go on-ledger.
  - Observers are limited to the issuer, the holders, named verifiers and parties the issuer names. No registry operator observes every record.
  - Milestone 1 publishes a disclosure table showing what each party learns, including for the uniqueness check.
- **Identity:** verifier and issuer identity is designed to use the party credentials and metadata work under RFP 10 and RFP 12.1, for example the Private Eligibility Credentials proposal (#969), and the Identity & Metadata SIG. It does not use a proprietary scheme. The asset registry builds on that party metadata; it does not replace it.
- **Verifiers:**
  - Every attestation records *how* the asset was verified and *by whom*. Its `verificationSource` takes one of three values, the same three Intain's registry uses today:
    - `CERTIFIED`: checked by a Verification Agent;
    - `SELF_CERTIFIED`: certified by the issuer, with evidence commitments;
    - `SELF_CERTIFIED_DATA_ONLY`: certified by the issuer, without evidence.
  - For self-certification the verifier party is the issuer itself.
  - Who certifies is chosen per transaction: an independent verification agent or custodian, the investor itself, or clearly identified self-certification. The record always names who verified, not only that verification happened.
  - At launch the verifiers are the issuers themselves and Intain's Verification Agent service.
  - Intain's verification already runs in three models, and in each a named party signs off. These map to `SELF_CERTIFIED` and `CERTIFIED` attestations:
    - the issuer's own team;
    - Intain's review service;
    - a custodian the issuer appoints.
  - A regulated custodian already acts as a Verification Agent: UMB Financial Corporation deployed Intain's Verification Agent in 2022 ([press release](https://www.prnewswire.com/news-releases/umb-financial-corporation-becomes-first-bank-to-deploy-intains-verification-agent-activates-key-module-of-administration-service-for-structured-finance-301553938.html)).
  - Any other firm (a due-diligence provider, trustee or auditor) can act as a Verification Agent by signing attestations with its own party. No change to the standard is needed.
  - The standard does not rank sources. Each reading application decides which sources and which verifiers it accepts. For example, a lender might require `CERTIFIED` from an agent it trusts, while a data service might show all three.
  - An independent Verification Agent that adopts the standard counts toward Milestone 3.

#### Non-duplication

| Adjacent work | Its scope | Boundary with this proposal |
|---|---|---|
| Token Standard V2 / CIP-0112 (Digital Asset, approved) | Holdings, transfers, accounts | We link asset records to its holdings. We define no holding or transfer |
| PixelPlex Canton Asset Servicing #944 (open, RFP 12.2) | Lifecycle events, entitlements and payments for tokenized securities | Servicing of an instrument. We define the record of the underlying asset that is serviced. A servicing event could reference an `AssetRecord` |
| AlphaPilot RWA Market Access Reference Layer #758 (open, RFP 12) | Off-chain schemas and adapters for asset discovery, eligibility, transaction and settlement tracking | An application-side normalisation layer. We define the on-ledger asset record and attestation such a layer could read |
| Canton Common Asset #232 (open) | `IAsset`/`ILockedAsset` primitives, lock, unlock and liquidate, atomic DvP | Encumbrance and settlement. We define no lock or DvP |
| Token Data Disclosure Standard #878 (PixelPlex, open) | Token package publication and admin verification | Token-level publication. We cover the real-world asset behind the token |
| Kaiko Data Standard (approved) | Provider-neutral publication of market data | Market data feeds. We cover per-asset identity and verification records |
| Fairmint Canton Asset Data Feed #890 (RFP 11, approved) | Issuer-published aggregate metrics | Aggregates. A registry under this standard could publish its totals through such a feed |
| Calend Open RWA Credit & Collateral Standard #948 (open, RFP 12 / 13) | Borrower credit credentials from attestors, vault-share valuation guard, lending facility with pre-agreed liquidation | Credit of the *borrower* and use of shares as collateral. We attest to the *underlying asset*. A lender using Calend could also require an `AssetRecord` attestation for the receivables behind the collateral |
| Tokenized Vault Standard #863 (Mystic, approved, RFP 12 / 13) | Vault share issuance, pricing and redemption | Vault shares. A credit vault holding loans or receivables could point to `AssetRecord`s for its underlying assets |
| Regulated Token Standard #881 (open) | Controls on who may hold a token | Holder eligibility. We define no transfer restriction |
| Private Eligibility Credentials #969 (open, RFP 12.1) | Party credentials proving eligibility without disclosure | Credentials about *parties*. We reuse this kind of credential to identify issuers and verifiers |
| Daml Package Registry #401 (open) | Publication and discovery of Daml packages | Unrelated despite the name: it registers code packages, not assets |

### 4. Backward Compatibility

No backward compatibility impact on Canton or the token standards; this is a new package that modifies no shipped package. Intain will migrate its own DevNet records from the current `Intain.Tokenization` model to the standard as part of Milestone 2.

---

## Prior Work and Current Status

Stated precisely so reviewers can check it:

- **Code access:** the code cited here (`ReceivablesNFT.sol`, `RNFTMetadata`, `RRENFT.sol`, `RRENFTMetadata`, the `Intain.Tokenization` Daml model, and the registry and dual-mint services) is in Intain's private repositories. Committee members and reviewers can have read access on request: contact sanjay.nishank@intainft.com.

- **Live system:** Intain's Asset Registry serves live issuers. It ingests their loan tapes, maps them to standard fields, verifies their assets and maintains their asset records on Intain's Avalanche production subnet (chain ID 151122), in two live contracts: `ReceivablesNFT` for receivables and `RRENFT` for residential mortgage loans.
- **Scale:** more than 5 issuers and more than 10,000 assets, as of November 2026.
- **Verification workflow:** Intain's verification has checked more than 400,000 loans and assets across more than 100 deals, as of October 2026. These count verification across all of Intain's work; the scale figures above count only records in the on-chain registry. The workflow:
  1. Loan files and tapes are ingested.
  2. AI-assisted diligence reconciles the documents against the tape.
  3. A custodian or verification agent clears exceptions and signs off. Self-certification is optional.
  4. The certificate is hashed on Intain's permissioned ledger.
  5. One non-duplicate token is minted per loan.

  - Asset classes verified so far: residential mortgages, equipment finance, medical receivables, auto loans and merchant cash advances.
  - Duplicate prevention works today inside Intain's platform. The standard extends it across issuers.
  - The AI verification engine (IntainAI) is Intain's commercial product and is not part of the grant.
- **Dual-ledger minting, in Intain's test environment:** the same registry mints each verified asset on two ledgers:
  - as an NFT on Avalanche (`ReceivablesNFT`, on Intain's Avalanche test subnet, chain ID 101122);
  - as Canton records on **Canton DevNet**, and, in a completed proof of concept, on **Canton TestNet**.
  - Dual minting is switched off in Intain's production environment until the Canton path is merged and reaches MainNet.
- **Issuer consent for Canton:** live issuers' records are on Avalanche today. Moving or mirroring any issuer's records to Canton needs that issuer's agreement. Intain is discussing this with its issuers, so the milestones below do not depend on any one issuer taking part.
- **The Canton code is not yet merged into Intain's main line.**
  - The current Daml model (`Intain.Tokenization`) has a registry with duplicate rejection, a per-asset identity with lifecycle versioning, holder-consented transfer and cross-ledger evidence.
  - It is built with Daml SDK 3.5.5. It runs under a single trusted operator, carries no asset metadata beyond a business key, and does not use the token-standard interfaces. This grant removes those limits.
- **Existing metadata schemas:** both profiles in §2.1 are already in use with live issuers on the production subnet. The receivables schema is `RNFTMetadata` in `ReceivablesNFT`, and the loan schema is `RRENFTMetadata` in `RRENFT`. Both carry identity commitments, amounts, dates, verification source and evidence fingerprint.
- **A live tokenized receivables settlement (July 2026):** Intain ran asset verification, the asset register and the financing as one process.
  - **Parties:** the seller was the US subsidiary of a global steel and chemicals group, and the buyer a bank-affiliated trade-finance company. Its banking shareholder provided the financing. Counterparties are anonymised.
  - **What the verification caught:** ten fields were tested per receivable. Exceptions were recorded as exceptions, for example an unexplained credit note and a certificate date that didn't match the shipment.
  - **The gate held:** minting was blocked until every exception was cleared or accounted for, and manual overrides on a live call with both counterparties did not unblock it.
  - **Outcome:** the verification rule was updated to cover the case, and the receivable tokens were minted and the financing settled two days later.
- **Redemption on the Avalanche side:** after a repayment settles, the investor can burn the deal's receivable NFTs. This is the redemption step of the lifecycle in RFP 12.2 item 3, which the standard would also represent on Canton.
- **Path to MainNet:** Intain's Canton integration authenticates to the ledger through Microsoft Entra. This has been implemented and tested on Canton TestNet as part of the dual-mint proof of concept. Only the MainNet integration remains untested. DevNet continues to use the unauthenticated mode.

---

## Milestones and Deliverables

Months count from the proposal's approval. Each deadline shifts by the committee's review time for the previous milestone.

### Milestone 1: Open standard v1 and design gate
- **Committed Date:** Month 3
- **Focus:** specification, schema and profiles, Daml interfaces, uniqueness design, disclosure table.
- **Deliverables / Value Metrics:**
  - Public Apache-2.0 repository with the specification, JSON Schema, test vectors and the `cn-asset-registry-v1` interface package.
  - CIP for the standard approved through the CIP process, with review by the Token Standards / Asset Standards SIG.
  - Written reviews from at least 3 organizations other than Intain, including at least one issuer and one reading application.
  - Uniqueness design chosen at the gate and published with its trade-offs.
  - Records registered through the standard on Canton DevNet, built from anonymised or sample loan tapes in Intain's production format, or from an Intain issuer that has agreed to take part.

### Milestone 2: Reference implementation, conformance suite and TestNet
- **Committed Date:** Month 6
- **Focus:** reference registry, conformance suite, registry API, mapping specification and reference mapper, migration of Intain's records.
- **Deliverables / Value Metrics:**
  - Reference registry and conformance suite released.
  - At least one SIG member or outside developer runs the suite from the public repository and confirms the result publicly.
  - Intain's existing DevNet records migrated to the standard.
  - At least one Intain issuer that has agreed to take part registers assets on **TestNet**, alongside any outside adopters.
  - At least one application not operated or authored by Intain reads asset records and attestations on TestNet.

### Milestone 3: Adoption (paid per adopter)
- **Committed Date:** Month 6 to month 12
- **Focus:** independent adoption and MainNet.
- **Deliverables / Value Metrics:**
  - Each independent registry, issuer or Verification Agent that implements the standard on its own participant, passes the conformance suite and, for a Verification Agent, issues attestations under it: 100,000 CC, for up to 5 (500,000 CC maximum).
  - Each independent application (wallet, custodian, lender or data service) that reads asset records or attestations in production on **MainNet**: 150,000 CC, for up to 4 (600,000 CC maximum).
  - Goal, subject to issuer consent and not a paid deliverable: Intain issuers registering their assets on MainNet.
  - "Independent" means neither operated nor authored by Intain. Each adopter is confirmed by a public repository or a public comment from the adopting team. Unclaimed amounts lapse at month 12.

### Milestone 4: Maintenance
- **Committed Date:** 12 months from Milestone 2 acceptance
- **Focus:** compatible releases for Canton and Splice upgrades, security fixes, issue triage, outside contributions.
- **Deliverables / Value Metrics:** a maintenance note each quarter. A compatible release within 4 weeks of each Canton or Splice release that affects the package.

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone
- Demonstrated functionality on DevNet, TestNet and MainNet as stated per milestone
- Documentation and knowledge transfer provided
- Alignment with stated value metrics

Project-specific conditions:

- Adoption is the measure of value: issuers registering through the standard, outside applications reading it, and outside registries and Verification Agents passing the conformance suite. Delivering code alone does not complete Milestones 2 or 3.
- The CIP goes through the standard CIP process. If the Token Standards SIG directs the design differently at the Milestone 1 gate, the later milestones are adjusted with the Committee.

---

## Funding

**Total Funding Request:** Up to 2,640,000 CC. Of this, 1,540,000 CC is fixed and up to 1,100,000 CC (42%) is paid only for independent adoption.

### Payment Breakdown by Milestone

| Milestone | CC | Paid |
|---|---|---|
| 1. Open standard v1 and design gate | 600,000 | upon committee acceptance |
| 2. Reference implementation, conformance suite and TestNet | 700,000 | upon committee acceptance |
| 3. Adoption | up to 1,100,000 | per adopter: 100,000 per independent registry, issuer or Verification Agent (max 5) and 150,000 per independent MainNet reading application (max 4); unclaimed amounts lapse at month 12 |
| 4. Maintenance | 240,000 | 60,000 per quarter for 4 quarters, each on its maintenance note |
| **Total** | **up to 2,640,000** | |

Reference rate: about USD 0.075 per CC (CoinGecko, 2026-11-24). The grant is denominated and paid in CC.

### Cost Basis
- **Team:** two full-time contributors for the 6-month build, 12 person-months in total.
  - A Daml and architecture lead: specification, uniqueness design, SIG and CIP work.
  - An engineer: reference registry, conformance suite, registry API and reference mapper.
- **What the grant covers:** Milestones 1 and 2 (1,300,000 CC) come to about USD 101,000 at the reference rate. Intain co-funds the rest of the build cost, because it runs the standard in its own production registry.
- **Adoption and maintenance:** Milestone 3 is paid only when independent teams adopt the standard. Milestone 4 covers compatible releases, security fixes and issue triage for 12 months.
- **Comparison:** the structure and amounts follow approved standards grants: the Tokenized Vault Standard (#863) at 500,000 + 500,000 CC plus 100,000 CC per adopter, and the Kaiko Data Standard at 900,000 + 400,000 CC plus 100,000 CC per adopter. Our fixed amounts are slightly higher because the scope adds the cross-issuer uniqueness design, the registry API, the conformance suite and the mapper.

### Volatility Stipulation
The project duration is greater than 6 months. The grant is denominated in fixed Canton Coin and will require a re-evaluation at the 6-month mark, which coincides with Milestone 2.

---

## Sustainability

Intain maintains the specification, package and reference implementation for at least 12 months after Milestone 2 (Milestone 4) and uses the standard in its own production registry, so it has a continuing operational reason to keep it current. Governance of the specification moves to the Token Standards SIG through the CIP. Contributions are accepted under Apache-2.0. If the Committee prefers, the repository will be transferred to a Canton Foundation organization.

---

## Co-Marketing

Upon release, Intain will collaborate with the Foundation on:

- Announcement coordination
- A case study of issuers moving to MainNet on the standard, with the agreement of the issuers involved
- A SIG walkthrough for issuers, verifiers and applications that want to adopt it

---

## Motivation

- **RWA activity on Canton depends on trust in the underlying asset.** A lender, custodian or wallet needs to know what a token represents, whether that was verified, and that the asset is not financed twice.
- **Today that answer is local.** It lives in each issuer's application, so every reader integrates with every issuer separately.
- **A shared record changes this:** any application reads one interface, and any issuer that implements it is readable by all of them.
- **Who benefits:** every RWA issuer, verifier and reading application on Canton that holds, finances, services or reports on tokenized loans or receivables.
  - **Lenders and investors:** can confirm before funding that an asset exists, reconciles and is registered only once, and can build eligibility from records rather than an emailed file.
  - **Verification agents and custodians:** issue a signed attestation that travels with the asset to every later transfer.
  - **Trustees, rating agencies and auditors:** read one verified asset-level record instead of reconciling across parties.
  - **Originators:** verify once and finance many times.
- **How much of the ecosystem:** there is no public count of RWA applications on Canton, so we do not give a percentage. The category is clearly active. Several open or approved RFP 12 proposals would read or reference an asset record like this one:
  - AlphaPilot's RWA market access layer (#758);
  - Mystic's tokenized vault standard (#863), through credit vaults that hold loans or receivables;
  - PixelPlex's asset servicing (#944);
  - Calend's credit and collateral standard (#948).
- **A concrete case:** in May 2026 Intain verified 14,600 medical receivables in two days, every asset rather than the usual 5% sample. Lenders funding those receivables could see per-asset evidence only through Intain's own reports. A shared attestation would let them check it on Canton.
- **Who uses it first:** on the issuer side, Intain's issuers (more than 5 today) are the first users, subject to their consent.

## Rationale

- **Why extend, not replace:** extending the token standards rather than creating a parallel token keeps holdings, transfers and wallets as they are. The standard adds the asset record they currently lack.
- **Why an asset record beneath the token:** asset-backed finance needs two layers.
  - **The asset record:** identity, verified attributes and certification, issued only after verification passes.
  - **The financing token:** a holding, vault share (#863), facility or collateral position (#948). It references the asset record and never replaces it.
  - **Why it pays:** an asset verified once can then be referenced by every structure it moves through (whole-loan sale, participation, warehouse facility, securitization), with no fresh diligence round at each hand-off.
  - **Why open:** this only works if the asset fingerprint and record ID are a standard that warehouses, trustees and buyers can all query, with several certification options and no lock-in to one platform.
- **Why start from a working schema:** it reduces design risk. Both the receivables and loan profiles are already used with live issuers, and the Canton model already handles identity, lifecycle and cross-ledger evidence on DevNet, and in a TestNet proof of concept.
- **Why a design gate on uniqueness:** it addresses the hard part first, in public. That's the property the current single-operator design cannot provide at network scale.
- **Why loans and receivables first:** they keep version 1 small enough to deliver and adopt. Other asset classes are added as profiles once the core is proven.

## Demand Evidence

The demand is already visible in Intain's own asset register: issuers register through it, verification agents and custodians certify through it, and lenders fund against it. The register is proprietary today, so only Intain's own participants can read these records. This proposal makes the same record open on Canton.

### What the existing asset register already shows

| Evidence | Figure | Source |
|---|---|---|
| Issuers recording assets in the register | More than 5 issuers and more than 10,000 assets, in ReceivablesNFT and RRENFT on Intain's Avalanche production subnet (November 2026) | Intain data |
| Assets verified through the workflow behind it | More than 400,000 loans and assets across more than 100 deals (October 2026) | Intain data |
| Asset classes verified | Residential mortgages, equipment finance, medical receivables, auto loans and merchant cash advances | Intain data |
| A regulated bank acting as Verification Agent | UMB Financial Corporation deployed Intain's Verification Agent in 2022 | [Public press release](https://www.prnewswire.com/news-releases/umb-financial-corporation-becomes-first-bank-to-deploy-intains-verification-agent-activates-key-module-of-administration-service-for-structured-finance-301553938.html) |
| Custodian-reviewed verification at full coverage | 14,600 medical receivables verified in two days, with custodian partners, instead of a 5% sample (May 2026) | Intain data |
| A lender relying on per-file verification | A Canadian financier of non-bank equipment lenders reviews every financing document against its underwriting rules (more than 30 checks across more than 20 document types) | Intain data |
| Financing that depends on the register | A live tokenized receivables settlement, funded by a global bank. Asset tokens were minted only after every verification exception was cleared (July 2026) | Prior Work; counterparties anonymised |

These figures show that issuers, verifiers and lenders already use a verified, per-asset record inside one platform. They do not yet show any outside organization committing to the **open Canton standard**. That commitment is what this section asks for next.

### Endorsements we are inviting

We are inviting public comments on this pull request from:
- Intain's issuers, and the lenders and investors who finance their assets;
- the custodians, verification agents, bank partner and specialty lenders already using Intain's verification workflow;
- trustees, rating agencies and auditors that would read the records;
- teams whose RFP 12 work would read or reference asset records: Vigente (Calend, #948), AlphaPilot (#758) and PixelPlex (#944);
- data publishers on Canton: Fairmint (#890) and Kaiko.

Endorsements and review commitments will be posted as comments on this PR, and we will list them here as they arrive. Milestone 1 requires written reviews from at least 3 organizations other than Intain.
