# Private Eligibility Credentials for the Canton Credentials Standard

## Development Fund Proposal

| Field | Value |
| :---- | :---- |
| **Organization** | Triple Play Labs |
| **Author / Primary Contact** | Nikitas Kassis, nik@tripleplaylabs.com |
| **Status** | Submitted |
| **Created** | 2026-11-10 |
| **Proposal Type** | RFP-aligned |
| **RFP / Roadmap Area** | RFP-12 RWA Standards, area 1: Identity, Credentials and KYC Standards for RWA Workflows |
| **Champion** | Needs Champion |
| **Total Funding Request** | 3,500,000 CC build (M1–M3), up to 800,000 CC security review at cost, 600,000 CC maintenance, up to 2,250,000 CC paid per adopter |
| **Project Duration** | 24 months (build 7 months estimated, 9 months committed; adoption payments to month 18; maintenance to month 24) |
| **License** | Apache-2.0 for new work; reused Owl ID code keeps its licence notices. Public repository from the first commit, offered for transfer to the Canton Foundation |
| **Label** | regulatory-compliance |

---

## Abstract

RWA apps on Canton have to know whether a party may hold or trade an asset: KYC done, KYB done, accredited, resident in an allowed country, or authorised to act for an institution. Today an app typically answers that with its own onboarding and its own allowlist.

The draft Canton Network Credentials Standard (cips PR #204) gives Canton a shared credential interface and lookup API, but only for public credentials. It leaves private credentials and a standard KYC claim set to future CIPs, and it gives an issuer no way to revoke a credential on its own.

We propose a private credential profile for that standard, following the sketch in the CIP itself:

| Deliverable | Form |
| :---- | :---- |
| `PrivateCredential` template and `CredentialPresentation` delegation, implementing the #204 `Credential` interface, with issuer revocation | Audited Daml package, Apache-2.0 |
| RWA eligibility claim vocabulary (KYC, KYB, investor qualification, licence, jurisdiction, authority to act, asset eligibility) | Spec in M1, CIP in M2 |
| `requireEligible`: the check an app calls inside its own transaction | Daml library |
| Reference issuer: verifies SD-JWT VCs and supports an extensible ISO mdoc verification adapter, including Google Wallet Digital ID presentations and off-ledger Longfellow ZK predicate verification. Both pathways produce minimal, policy-bound Canton eligibility credentials using the same #204-compatible interface | Rust service, Apache-2.0 |
| Conformance kit, issuer and app guides | Test suite + docs |

Up to 2.25M of 7.15M CC (about 31%) is paid only when independent issuers and apps use the profile on MainNet, and half of each adopter payment only when an app accepts credentials from more than one independent issuer. The reference issuer starts from the Rust SD-JWT verifier and status-list code in Owl ID, our open-source credential issuer and verifier.

---

## Specification

### 1. Objective

**An RWA app on Canton can check, inside its own transaction, that a party meets an eligibility requirement using a credential from an issuer the app trusts, without receiving the underlying personal or company records, and the check stops passing once the issuer's revocation commits.**

We verify source credentials; we do not perform the underlying customer checks. Identity-document storage, transfer-data messaging, token enforcement rules and public naming are outside the grant. The #204 interfaces, DSO registry, Scan, Canton protocol and Ledger API remain unchanged.

### 2. What exists today and what is new

| Exists | Where | How we use it |
| :---- | :---- | :---- |
| `Credential` and `CredentialFactory` interfaces, lookup API, DSO Credential Registry | cips PR #204 (draft); Daml and OpenAPI work in canton-network/splice PR #7610, targeting `meiersi/std/credential-registry`; not yet released | Depend on the interface package at a recorded commit. Add no fields, choices or endpoints to it. |
| Credential Utility (`utility-credential-v0`), used by DA Registry allowlists | Digital Asset, on MainNet | Read-only adapter or a published mapping, depending on DA's terms for the DAR (3.7). |
| Party profiles, name resolution, `.canton` names | cips PRs #169, #171, #209 | Out of scope. |
| SD-JWT VC issuance (OpenID4VCI), OpenID4VP verification with DCQL, IETF Token Status List, did:web | Owl ID, [github.com/TriplePlayLabs/OWLID_RELEASE](https://github.com/TriplePlayLabs/OWLID_RELEASE) | Starting point for the reference issuer. |
| Google Wallet Digital ID: ISO mdoc credentials over OpenID4VP 1.0 and the Digital Credentials API, with optional `mso_mdoc_zk` zero-knowledge age proofs | [Google Wallet relying-party integration](https://developers.google.com/wallet/identity/verify/accepting-ids-from-wallet-online); [Longfellow ZK](https://github.com/longfellow-zk/longfellow-zk) (Apache-2.0) | Second ingestion pathway for the reference issuer (3.8A). |

Owl ID has no Canton or Daml code, so all Daml work here is new and costed as new. The reference issuer also needs work Owl ID does not have:

- **ES256 issuer signatures.** Owl ID verifies EdDSA issuer signatures only; its holder key binding already accepts ES256. ES256 is what the Google Wallet Digital ID flow uses for signed requests.
- Fail-closed status and expiry checks.
- `transaction_data` handling.
- OpenID4VP 1.0 / HAIP signed requests.
- Durable presentation-session storage. Owl ID currently keeps sessions in memory.
- The ISO mdoc adapter (3.8A).

### 3. Implementation Mechanics

#### 3.1 One shared template

Every issuer deploys the same audited `PrivateCredential` template rather than writing its own. Apps vet one package, not one per issuer, and no issuer-written interface code runs inside an app's transaction.

- Signatories: issuer and holder (the issuer is also the registry admin); no observers. The interface view's `issuer`, `holder` and `admin` come from these contract fields.
- A typed `verifiedAt : Time` field sits next to the #204 claims, so freshness can be checked on-ledger. A `verified-at` claim mirrors it for off-ledger readers.
- `PrivateCredential` implements the #204 `Credential` interface, so existing decoders can read its view. Private presentation and lookup need client support, which the guides and reference integration cover.
- `Credential_PublicFetch` succeeds only for `actor` = issuer or holder. #204 allows this: "Registries MAY restrict the actor in case the credential is not public."
- It is not added to the DSO Credential Registry. The issuer's registry serves the #204 Info and Lookup endpoints but not the bulk `/synchronizers` and `/events` endpoints, which exist for explorers.

#### 3.2 Using a credential

A disclosed contract gives an app visibility of a credential, not the right to use it. The app needs the holder's authority, in one of two ways:

1. **The holder is acting.** When the holder is the subscriber or sender in the app's choice, the library uses the credential with the holder's authority.
2. **The holder delegates.** Otherwise (for example, checking the receiver of a transfer), the holder creates a `CredentialPresentation` for one app, one app-defined workflow id and a limited time. It can be used repeatedly until `validUntil`, and the holder withdraws it by archiving it.

```haskell
-- Sketch, not final.
template CredentialPresentation
  with
    holder        : Party
    app           : Party
    credentialCid : ContractId Credential
    workflowId    : Text      -- defined and enforced by the app's policy
    validUntil    : Time
  where
    signatory holder
    observer app

    nonconsuming choice Presentation_Use : CredentialView
      with workflow : Text
      controller app
      do
        assertWithinDeadline "presentation.validUntil" validUntil  -- ledger time, not getTime
        assertMsg "wrong workflow" (workflow == workflowId)
        found <- fetchFromInterface @PrivateCredential credentialCid
        cred <- case found of
          Some (_, c) -> pure c
          None -> abort "credential is not a PrivateCredential"
        assertMsg "wrong holder" (cred.holder == holder)
        exercise credentialCid Credential_PublicFetch with actor = holder
```

`requireEligible` takes a policy owned by the app: expected holder and subject, approved template versions, trusted issuers, accepted issuer policy versions, required claim groups, and a maximum age. It first fetches each credential as the concrete template (`fetchFromInterface @PrivateCredential`, which returns `None` for any other implementation), then exercises `Credential_PublicFetch`.

It rejects:
- missing, conflicting or malformed claims;
- a missing or future `verifiedAt`;
- a credential outside its validity window, using ledger-time bounds (`assertWithinDeadline`, `assertDeadlineExceeded`).

Status, policy and verification time for one fact must come from the same credential. Validity is normative: a credential is valid when `validFrom` (if set) ≤ ledger time < `validUntil`. The library rejects credentials without `validUntil` unless the app's policy allows them, and rejects a policy with a non-positive maximum age. In a private registry `expiresAt` equals `validUntil`.

In the delegated path the concrete fetch and the `Credential_PublicFetch` exercise happen inside `Presentation_Use`, where the holder's authority is available. `requireEligible` then applies the app's policy to the returned view within the same transaction.

The holder's wallet reads the contract blob from the holder's own participant. With CIP-103 the app either has the holder submit through `prepareExecute`, where the credential is local, or reads the blob through `ledgerApi` with the user's consent. The app is a stakeholder of the presentation but not of the credential, so a submitting participant supplies as disclosed contracts whatever it does not hold locally. In a CIP-56 transfer that checks the receiver, the registry's transfer-factory API returns both blobs among the choice context's disclosed contracts, and the presentation id travels in `extraArgs.context`.

#### 3.3 Issuance and lookup

`CredentialFactory_UpdateCredentials` needs both issuer and holder, who normally sit on different participants. The flow is propose-and-accept:

1. The issuer verifies the source (3.8 or 3.8A), then creates an immutable `CredentialOffer` (signatory issuer, observer holder) with the exact claims and validity, a reference to the issuance session, and its own factory's contract id.
2. The issuer's API returns the factory's blob with the offer. The holder's wallet attaches it as a disclosed contract and exercises the consuming `Accept` choice, passing `requestedAt` set just before submission. The factory checks it with `assertDeadlineExceeded`.
3. Accept calls the factory with both authorities. By accepting, the holder agrees to the issuer's right to revoke.

Normally a wallet reads credentials from the holder's own participant, so the issuer's Lookup endpoint is a fallback for wallets without ledger API access. There, an external-party holder answers a single-use challenge that names the registry, the holder, the query scope, a nonce and an expiry. The challenge is signed through CIP-103 `signMessage` and checked against the party's current keys and threshold in topology. It is canonical JSON (RFC 8785) under a fixed domain-separation prefix for this profile, so a signature cannot be replayed in another context. A valid answer opens a session of at most 5 minutes, limited to that holder's records and the stated query, including pagination.

#### 3.4 Revocation and status

`PrivateCredential` has a consuming template choice `RevokeAsIssuer` (`controller issuer`). It is not part of the #204 interface. Asked about issuer-initiated withdrawal on cips#204 (2026-09-23), Simon Meier wrote: "I would not expect the registry to define the interpretation, but the apps consuming the credentials and the apps producing the credentials. … the issuer could also run their own registry."

Once the archive commits, no transaction that uses the credential as an active input can commit, even if it supplies an earlier disclosed blob. An app submitting with an old blob is typically rejected at confirmation by the signatories' participants with an inactive-contract rejection (the exact code is recorded in tests). One prepared on the holder's own participant fails at interpretation. Concurrent use and revocation are resolved by ledger processing, and uses that committed earlier stand.

Relying parties that cannot read Canton get an IETF Token Status List (draft-ietf-oauth-status-list), generated from archive events with durable checkpoints, so a restart does not skip any. The profile requires:

- the list updated within 5 minutes of a committed revocation;
- signed list tokens with `exp` no more than 15 minutes after issue;
- status indexes never reused, and older tokens rejected once a newer one has been seen;
- consumers treating an expired or unreachable list as "not valid".

A consumer following these rules, allowing 1 minute of clock skew, honours a revoked credential for at most 21 minutes (the kind of bound Woof asked for on DF #632).

#### 3.5 Claim vocabulary

CIP #204 suggests that organisations "experiment with the exact claims that they need … and then use their experience to build a CIP standardizing the claims". The pilot uses our own DNS namespace until a CIP number is assigned. (#204 and splice#7610 currently differ on reverse vs plain DNS, which we will raise on the thread.) The CIP then renames the claims to `cip-<nr>/`, and the library accepts both during migration.

The profile carries no identity documents or source evidence. It does carry identifying outcomes where a requirement needs them, such as an LEI or a country, and those are personal or company data in their own right.

| Property | Example value | RFP credential type | Basis |
| :---- | :---- | :---- | :---- |
| `kyc-status`, `kyc-policy` | `verified`, issuer's versioned policy id | KYC | FATF R.10; applicable customer due-diligence rules |
| `identity-assurance` | `eidas-substantial`, kept separate from KYC status | KYC | Source identity-assurance scheme |
| `kyb-status`, `kyb-policy`, `lei` | `verified`, policy id, `506700GE1G29325QX363` (GLEIF's own LEI, as an example) | KYB | FATF R.10 and its Interpretive Note |
| `investor-qualification`, `qualification-method` | `us-reg-d-accredited`, `third-party-verified` | Accreditation | US example: Rule 501(a); verification under Rule 506(c) where applicable |
| `regulatory-licence` | `<regulator>:<licence-id>` | Licensing or regulatory status | The regulator's public register |
| `jurisdiction` | ISO 3166-1 code | Jurisdiction or residency | Applicable distribution rules and issuer policy |
| `authority-to-act` | represented entity, representative, permitted actions, limits | Authority to act for an institution | FATF R.10 Interpretive Note, para. 4; the source mandate |
| `asset-eligibility` | instrument id | Eligibility for a specific asset | The instrument's eligibility policy |
| `age-over` | `18` | Supporting claim (for example consumer-facing eligibility rules) | Source credential's verified predicate (3.8A) |

The Basis column names where a claim comes from, not a universal onboarding rule. Each issuer publishes the jurisdiction, policy version and verification method it applies.

Each credential can also carry an `evidence-ref`, an opaque reference to a record the issuer keeps. Under the EU AML Regulation (2024/1624, applicable from 10 July 2027), an institution relying on another obliged entity's checks keeps "ultimate responsibility" (Art. 48). Whether a given arrangement counts as reliance, outsourcing or something else is for the relying institution to determine, and a credential does not discharge its due diligence. `evidence-ref` gives it a route to the evidence. Access and retention are agreed between institution and issuer, not by the ledger.

For `authority-to-act`, M1 publishes a comparison with GLEIF vLEI role credentials (ISO 17442-3). Importing vLEIs is out of scope.

#### 3.6 Who sees what

- **Issuer and holder.** Both are signatories, so both are informees of every `Credential_PublicFetch` on the credential, and both participants must confirm each such transaction. The issuer therefore learns when its credential is used. Its view contains only that exercise (with `actor = holder`), not the app's enclosing choice, unless the check is the root command.
  - This makes the issuer's participant a liveness dependency: if it is down, direct checks against its credentials stop.
  - The profile requires issuers to publish a monthly availability target of at least 99.5% for that participant, and M1 measures the added confirmation latency.
  - During an outage an app may accept an unexpired `EligibilityCheck` if its own policy allows, with the limits described below.
- **Other parties to the app's transaction.** Informees of an enclosing action see everything beneath it, and nesting the check does not change that. When the check runs inside a CIP-56 transfer, the sender and the token admin see the claims used.
  - An app that must keep claims from them can run the check in a transaction of its own (app, holder and issuer only). That records an app-signed `EligibilityCheck` (signatory app, observer holder) bound to the holder, subject, policy version and permitted operation, with a short `validUntil` that the transfer enforces.
  - This cached path is exempt from the immediate revocation guarantee in the objective: a revocation after the check is not detected, and the check simply stops being accepted at expiry. The guides document both patterns.
- **Holders** keep one fact per credential where the grouping allows. A fund that needs "accredited and US-resident" receives two small credentials, not a KYC file. Credentials remain linkable to the holder's party.
- **Copies.** Anyone who has received a credential can keep what they saw. Archiving ends its use. It does not erase ledger history or copies already shared.

M1 publishes the visibility matrix for both reference workflows, tested with issuer, holder, app, counterparty and an unrelated party on five separate participants.

#### 3.7 Existing Credential Utility credentials

The Credential Utility is one provider's service with its own claim format. This profile does not replace it. It gives Credential Utility credentials and other issuers' credentials one vocabulary that apps check the same way.

Apps on DA Registry allowlists rely on `utility-credential-v0` credentials. If DA's terms allow building against that DAR, the library accepts them read-only for claim types whose meaning matches the vocabulary. If not, we publish the mapping table and leave adapters to DA.

#### 3.8 Reference issuer: SD-JWT VC in, Canton credential out

1. The holder starts a single-use issuance session that fixes the destination party, the requested claims, the source policy version, a nonce and an expiry.
2. The holder presents an SD-JWT VC from a provider the issuer accepts over OpenID4VP, disclosing only the fields needed. The request's `transaction_data` carries the session, so the key-binding JWT ties the presentation to it.
3. The issuer checks the signature (EdDSA or ES256), disclosures, key binding, audience, nonce, transaction-data hash, `exp`/`nbf` and the source status list, failing closed. Its published policy states what relationship it requires between the source subject and the destination party. Key binding shows control of the source credential's key. It cannot by itself prevent a holder from deliberately sharing that key.
4. It creates the offer (3.3), with validity no longer than the source credential's.
5. It polls source status at least every 5 minutes and revokes derived credentials when the source is revoked. The published withdrawal bound for imported credentials is the sum of:
   - the source issuer's status freshness;
   - the polling interval;
   - the time for the revocation to commit on Canton;
   - the 21 minutes in 3.4.

   Because revocation needs the issuer's and holder's participants, the hard backstop is validity: derived credentials carry a `validUntil` of at most 30 days and are reissued after a fresh source check.

Presentation sessions are stored durably, so a restart does not lose or replay a session. The service publishes its retention policy for logs and evidence records.

#### 3.8A Google Wallet Digital ID and zero-knowledge credential integration

The reference issuer has an extensible credential-verification layer, so eligibility claims can be derived from more than one external identity format without changing the `PrivateCredential` template or the #204 interfaces.

In addition to SD-JWT VCs, the reference issuer integrates **Google Wallet Digital ID**. Google Wallet supports ISO mdoc digital IDs presented over OpenID4VP 1.0 and the W3C Digital Credentials API. It also supports `mso_mdoc_zk` presentations using the `longfellow-libzk-v1` system, which let a holder show a qualifying attribute, such as being over 18, without disclosing the date of birth or identity document ([Google Wallet relying-party guide](https://developers.google.com/wallet/identity/verify/accepting-ids-from-wallet-online)). Proofs are checked with Google's open-source [Longfellow ZK](https://github.com/longfellow-zk/longfellow-zk) library (Apache-2.0).

**Implementation.** The reference issuer adds an optional ISO mdoc verification adapter:

1. **Wallet presentation.** Request supported mdoc credentials through OpenID4VP 1.0 and the Digital Credentials API, using a signed (ES256), session-bound request and explicit holder consent.
2. **Credential authenticity.** For ordinary mdoc presentations, validate issuer signatures, certificate chains, disclosed-attribute integrity and device authentication against trusted issuer IACA root certificates.
3. **Zero-knowledge verification.** Accept supported `mso_mdoc_zk` presentations using `longfellow-libzk-v1`. Verify the proof off-ledger with the Longfellow verifier, against approved circuit versions, issuer trust roots, session binding and replay protection.
4. **Derived Canton credentials.** Map verified attributes or predicates into the claim vocabulary (3.5). For example, a verified age-over-18 predicate produces a minimal Canton credential containing only:
   - the verified outcome;
   - the trusted issuer policy;
   - the verification time;
   - the validity period.

   It does not record the source identity document, the date of birth or the ZK proof.
5. **Holder binding and lifecycle.** A separate authorised binding links the wallet presentation session to the destination Canton party. Validity is short-lived, and source-status checks apply where the source supports them. The Canton credential remains subject to the profile's issuer-controlled revocation. Withdrawal of the external source credential is not assumed to be immediately observable unless the originating credential system supports it.

**Architectural boundary.** Zero-knowledge proof generation stays in the external wallet, and verification happens in the off-ledger reference issuer. No ZK verifier, cryptographic extension or Canton protocol change is needed. The resulting credential uses the same `PrivateCredential` template, delegation mechanism and `requireEligible` checks as credentials derived from SD-JWT VCs.

**Limits.** An age predicate alone does not establish KYC completion, investor accreditation, residency or institutional authority. Each derived claim must be supported by the source credential's actual assurance level and by the relying app's trust policy.

**Onboarding.** Development uses Google's sandbox mode and the Utopia Test ID Pass. Production use needs Google's production relying-party metadata and a request-signing certificate trusted by Google Wallet. These are obtained by each issuer operating the adapter, and are not a dependency of any milestone payment.

**Value to Canton.** This gives Canton institutional apps a path from government-issued and other supported digital identity credentials, while keeping data minimised and sparing each RWA app from integrating several wallet ecosystems itself. It shows the profile can consume claims from both conventional signed credentials and privacy-preserving ZK presentations, without imposing one identity provider or credential format on Canton apps.

#### 3.9 Dependencies, versions and practice

- **Upstream status.** The #204 Daml API (`splice-api-credential-registry-v1`) is not in a Splice release yet and is still changing. This proposal was checked against #7610 at commit `5edb1115` (2026-10-27), which changed the DSO registry record's signatories but not the `Credential` interface. Each milestone records the exact upstream commit, package IDs and a tested compatibility matrix. If upstream changes break compatibility, we agree scope changes with the committee.
- **If upstream is late or the CIP is rejected.** If the API has not shipped in a Splice release by month 7, M3 delivers a release clearly labelled experimental on TestNet. Subject to CIP approval under Acceptance Criteria, the committee can accept that experimental release and pay M3, or defer payment until the MainNet release. A MainNet release is in any case a precondition for every M4 payment. If the CIP is rejected, we publish how each objection was handled and agree with the committee whether to revise, narrow the profile to a library, or stop.
- **Versions.** Canton 3.6 (`3.6.0-snapshot.20260928.20326.0.v5616afeb`, as pinned at Splice 0.9.4), Daml SDK 3.5.2, LF target 2.1. V1 does not need `DA.Crypto.Text`.
- **CI.** Every PR runs Daml tests, the conformance kit and Rust tests. Negative tests cover wrong authority, wrong holder or subject, a misleading interface implementation, time boundaries, stale disclosures, replay, status-list outages, and invalid, untrusted, expired or replayed mdoc and ZK presentations.
- **Docs.** Issuer guide, app guide, claim reference, and an operator runbook (rolling issuer signing keys, revoking credentials, running the status list, managing IACA trust roots).

### 4. Architectural Alignment

- **CIP #204 (draft):** implements its interfaces for an issuer-run private registry, the case it leaves to a future CIP. No changes to #204, the DSO registry or Scan. The KYC vocabulary goes into a separate CIP, consistent with the #204 to-do item "remove KYC use-cases".
- **CIP-56 and CIP-112:** reference integration in a transfer-factory implementation and a fund-subscription choice, with every protected entry point documented.
- **CIP-103:** presentation through `prepareExecute` or `ledgerApi` (3.2). A dedicated wallet method for presenting credentials is a candidate for the follow-up CIP.
- **External identity ecosystems:** SD-JWT VC over OpenID4VP (3.8) and ISO mdoc, including Google Wallet Digital ID and Longfellow ZK presentations (3.8A). Both map onto the same on-ledger model.
- **Identity & Metadata SIG:** before the M2 CIP submission, we present the profile and vocabulary, publish the feedback with our responses, and link the discussion from cips#204.
- **Other proposals:**
  - Veilio's Access Passport (DF #853) governs access to off-ledger evidence. It complements this profile, which standardises the eligibility claim, and an `evidence-ref` can point to a passport.
  - Woof (DF #621) checks Canton credentials from EVM contracts on Zenith, and credentials under this profile could serve as its input.
  - Brickken's regulated token proposal (DF #881) keeps account eligibility (`RegulatedAccount`) separate from authority for admin-initiated movements. Its eligibility guard could consume this profile; the integration is not yet agreed.

### 5. Backward Compatibility

*No backward compatibility impact.* New packages and services implement the existing #204 interfaces. Credential Utility credentials are unchanged.

---

## Milestones and Deliverables

### Milestone 1: Profile, vocabulary and first pilot

- **Estimated Delivery:** 12 weeks after approval
- **Committed Delivery:** 16 weeks after approval
- **Focus:** Daml package, eligibility library and reference issuer, piloted on TestNet with a Triple Play Labs-run issuer and one outside app.
- **Deliverables / Value Metrics:**
  - Daml package, library and reference issuer in the public repository, with CI and the negative tests in 3.9.
  - Durable presentation-session storage in the reference issuer.
  - Draft vocabulary posted to the Identity & Metadata SIG and the cips#204 thread.
  - On TestNet, with a Triple Play Labs-run issuer and an outside app on its own participant:
    - the app accepts an eligible credential;
    - the app rejects an ineligible one;
    - the app rejects use without the holder's authority;
    - no use of a revoked credential commits (observed error codes recorded).
  - Visibility matrix (3.6) and measured confirmation latency.

### Milestone 2: Outside issuers, Google Wallet pathway, conformance kit and CIP

- **Estimated Delivery:** 20 weeks after approval
- **Committed Delivery:** 24 weeks after approval
- **Focus:** Show the profile works across independent providers and formats, and that others can implement it without us.
- **Deliverables / Value Metrics:**
  - Two outside issuers and two outside apps on TestNet. Each app accepts credentials from both issuers.
  - ISO mdoc / Google Wallet verification flow using a supported test credential (Google sandbox and Utopia Test ID Pass), including:
    - a successfully verified Longfellow ZK age predicate;
    - issuance of the corresponding derived Canton credential.

    Negative tests reject invalid proofs, untrusted issuers, expired credentials and replayed presentations. The demonstration shows that no identity document or date of birth is recorded on Canton.
  - Conformance kit with positive and negative vectors. It passes an implementation written by someone else and fails a deliberately broken one.
  - CIP for the profile and vocabulary submitted to `canton-foundation/cips`, with a log of how SIG comments were handled.
  - Credential Utility adapter or mapping table (3.7).

### Milestone 3: Security review and release

- **Estimated Delivery:** 7 months after approval
- **Committed Delivery:** 9 months after approval, subject to the upstream dependency terms in 3.9
- **Focus:** Independent review, fixes, and a release institutions can install.
- **Deliverables / Value Metrics:**
  - Security review report for a tagged commit, covering the Daml package and both ingestion pathways, with all critical and high findings fixed and re-tested.
  - Reproducible release with published package IDs, on MainNet or as described in 3.9.
  - Status-list crash and restart test: no revocation is lost and the list matches the ledger afterwards.
  - An outside operator installs the issuer from the guide and reports the result.
  - The profile and vocabulary CIP approved, or the fallback in Acceptance Criteria.

### Milestone 4: Adoption

- **Estimated Delivery:** Rolling, opens at M3 acceptance
- **Deadline:** qualifying activity and its evidence submitted by month 18
- **Focus:** Payment per independent issuer or app using the profile on MainNet, in two tranches.
- **Deliverables / Value Metrics:**
  - Up to 150,000 CC to Triple Play Labs per qualifying adopter, up to 15 adopters, paid in two 75,000 CC tranches:
    - **Integration tranche:** qualifying production use, as defined below.
    - **Interoperability tranche:** use across independent issuers, as defined below.
  - **App, integration tranche (75,000 CC):** at least 25 production transactions protected by `requireEligible` over at least 30 consecutive days, involving at least 10 distinct customers, on at least 10 different days, with credentials from at least one independently controlled issuer.
  - **App, interoperability tranche (75,000 CC):** the app accepts the same eligibility claim from a second independently controlled issuer, with no change to its policy logic or integration code, in at least 10 protected production transactions.
  - **Issuer, integration tranche (75,000 CC):** credentials issued under the profile to at least 25 distinct customer entities within a 60-day window, used by one unaffiliated production app in at least 10 protected transactions.
  - **Issuer, interoperability tranche (75,000 CC):** a second unaffiliated production app accepts its credentials in at least 10 protected transactions.
  - **Who counts.** A qualifying adopter is an independently controlled organisation, counted once across both roles together with its affiliates. Triple Play Labs services, test parties, and activity paid for to meet these thresholds do not count. Any financial arrangement between the adopter and Triple Play Labs is disclosed to the committee.
  - **Deadline exception.** We ask for month 18 as an exception to the nine-month default used in recent grants (the Rust SDK, DF #407, was given month 12). The build is estimated to finish at month 7, with a committed deadline of month 9. Adopters then need institutional onboarding and sustained production windows, and the interoperability tranche needs a second independent issuer in production. Unmet tranches lapse at month 18 unless the committee approves an amendment.
  - **Evidence.** Before measurement starts, the committee reviews the named adopter commitment and approves the window and the counting method. Evidence (package IDs, redacted transaction records with dates) is shown to the committee or a reviewer it names. A public report per adopter follows, anonymised if the adopter prefers.

### Milestone 5: Maintenance

- **Estimated Delivery:** Months 12 and 24
- **Committed Delivery:** maintenance reports at months 12 and 24
- **Focus:** Keep the profile working regardless of adoption income.
- **Deliverables / Value Metrics:**
  - Releases that track Canton and Splice upgrades and #204 changes, security fixes, and adopter support with a 5-business-day response target.
  - A public maintenance report at months 12 and 24, listing supported versions, fixes shipped and response times.

---

## Acceptance Criteria

The committee accepts each milestone against its listed deliverables and the outside validation below. Milestones are accepted in order: a milestone can't be accepted before the one before it. Validators confirm their roles before submission and comment publicly on the milestone issue when evidence is filed, as the committee asked on DF #407.

| Milestone | Outside validation |
| :---- | :---- |
| M1 | reviews the Daml design; the outside pilot app confirms its own results. |
| M2 | runs the conformance kit against an independently written implementation; both outside issuers and both apps confirm cross-issuer use. |
| M3 | The review firm confirms remediation; the outside operator reports installing from the guide. |
| M4 | Each adopter confirms its production use to the committee or a reviewer it names. |
| M5 | checks the reports against supported releases and reported issues. |

M2 requires the CIP to be submitted and reviewed outside our team. The M3 milestone payment (750,000 CC) requires CIP approval; the security-review invoice does not and is paid when the review report is delivered. If the CIP is rejected, the M3 milestone payment stays withheld unless the committee approves revised scope and acceptance criteria under 3.9. If the vote is still pending at M3, the committee either accepts the release as experimental and pays M3 once the CIP is approved, or defers payment; pending is not approval. Changes to committed deadlines need committee approval before the deadline passes, and relative dates become calendar dates once the grant is approved.

---

## Funding

**Total Funding Request:** up to 7,150,000 CC, about USD 711,000 at the rate below.

### Payment Breakdown by Milestone

- **Milestone 1** (Profile, vocabulary and first pilot): 1,300,000 CC upon committee acceptance.
- **Milestone 2** (Outside issuers, Google Wallet pathway, conformance kit and CIP): 1,450,000 CC upon committee acceptance. This includes 400,000 CC for the ISO mdoc / Google Wallet adapter.
- **Milestone 3** (Security review and release): 750,000 CC upon committee acceptance.
- **Security review:** up to 800,000 CC at cost, paid when the review report is delivered, independent of CIP status. Provider, scope, quote and conversion date are agreed with the committee before booking.
- **Milestone 4** (Adoption): up to 150,000 CC per qualifying adopter in two 75,000 CC tranches, up to 2,250,000 CC.
- **Milestone 5** (Maintenance): 300,000 CC at month 12 and 300,000 CC at month 24, when the report shows the obligations met:
  - a compatible release within 30 days of each Splice release;
  - critical fixes within 14 days;
  - the support response target.

Adoption is up to 2,250,000 CC: about 31% of the maximum including the full review allowance, or 35% without it. Unused allowances are not paid.

Milestones are accepted in order. M2 is paid only when two outside issuers and two outside apps work with each other on TestNet and the conformance kit passes an implementation we did not write. So only M1 (1,300,000 CC) can be paid before an independent implementation is shown to work.

Half of each adopter payment is earned only through cross-issuer use, the interoperability this standard exists to provide. Each 75,000 CC tranche is below Kaiko's 100,000 CC per client (DF #113); the full 150,000 CC requires both production use and independent cross-issuer use. Maintenance is funded separately, so supported releases to month 24 do not depend on adoption income.

### Use of funds

| Milestone | Person-days | Work |
| :---- | :---- | :---- |
| M1 | 130 | Daml package and library, reference issuer (ES256, status, OpenID4VP 1.0, durable sessions), CIP-103 wallet integration, threat model, first pilot |
| M2 | 145 | Conformance kit, outside issuer and app onboarding, CIP and SIG iterations, utility mapping (105); ISO mdoc / Google Wallet adapter: mdoc and CBOR parsing, IACA trust management, signed-request onboarding, Longfellow verification and tests (40) |
| M3 | 75 | Review fixes and re-tests, release engineering, recovery testing, guides, operator install support |
| M5 | 60 | Upgrades, fixes and support from month 8 to month 24 |

The build and maintenance allocations cover 410 person-days of senior Daml and Rust work at an effective blended rate of about USD 1,000 per day, using USD 0.0994 per CC (CoinGecko close, 26 October 2026).

| Item | Person-days | USD (approx.) |
| :---- | :---- | :---- |
| M1–M3 | 350 | 348,000 |
| M5 | 60 | 60,000 |
| Security review allowance | n/a | 80,000 |

All payments are made in CC. 

M4 pays Triple Play Labs up to 150,000 CC (about USD 14,900) per qualifying adopter for verified production use and cross-issuer interoperability. Integration support for adopters is funded from M1–M3 and M5.

### Volatility Stipulation

Funding is fixed in CC. Following CIP-100 and recent practice, we propose reviews of unpaid milestones at months 9 and 18 rather than month 6. (On DF #777 Shaul Kfir noted the committee "has rejected any requests to re-evaluate grants before 9 months have passed".) At those reviews either side may ask for an adjustment if the trailing 30-day average CC/USD rate differs by more than 25% from the approval-date rate. Adjustments need committee approval and are never automatic or retrospective.

---

## Co-Marketing

Upon release, Triple Play Labs will collaborate with the Foundation on:

- A joint announcement at the M3 release
- A technical post showing issuance, delegated use and revocation, with the mapping between SD-JWT VC and ISO mdoc claims and #204
- A demonstration of a Google Wallet ZK age proof verified off-ledger and enforced by `requireEligible` inside a Canton application
- A case study with the first app adopter, if it agrees to be named
- An issuer walkthrough at a SIG call or developer session

---

## Motivation

RWA flows on Canton are permissioned. DTCC's tokenised Treasury pilot is limited to DTC participants.

When each app runs its own checks, parties repeat onboarding. Fenergo's 2023 survey of more than 1,100 bank executives put the average corporate KYC review at USD 2,598 and 95 days. Reuse also needs more than a shared format. An app has to know what was checked, by whom, under which policy, and whether it still holds, and it has to accept that issuer under its own reliance rules. The pilot tests claim reuse under participating apps' own trust and reliance policies. Today at least two credential offerings exist on Canton (DA's Credential Utility and Global Settlement Network's GSX ID) with no common claim format.


---

## Rationale

**Why a profile on #204 and not a new credential model.** On myCircle's proposal, Digital Asset's Wayne Collier said identity proposals "would probably be stronger if they built on that emerging standard" (DF #632, 2026-08-17); DF #369 and #189 got similar advice. A private profile keeps the #204 data model, and the reference issuer maps external formats such as SD-JWT VC and ISO mdoc onto it, so apps support one on-ledger model.

**How this differs from earlier Canton credential work.** An earlier proposal, `canton-vc` (DF #369, closed), showed issuer-revocable KYC credentials on Canton. It was built against its own copy of an earlier #204 draft, with claims as a text map and a fetch that, by its own documentation, "returns the view to ANY actor".

This profile differs in three ways:
- It targets the current #7610 interface.
- It keeps credentials private to issuer and holder, with app use only through holder authority.
- It adds the shared vocabulary and conformance kit that let one app accept credentials from several issuers.

We would welcome `canton-vc` as a conforming implementation.

**Why not put the source credential itself on the ledger.** The pinned Daml release has no native EdDSA or ES256 verifier, so the ledger would hold source data it cannot check. We record minimised derived claims and keep source documents off-ledger.

**Why not on-ledger ZK predicates now.** V1 does not implement on-ledger ZK verification. Daml's crypto builtins are sha256 and keccak256 hashing and secp256k1 signature verification, and DF #872 proposes Daml proof-verification libraries that are not a dependency of this grant.

However, the reference issuer can consume externally verified ZK predicates, including Google Wallet Longfellow presentations, and translate their outcomes into minimal Canton eligibility credentials (3.8A). This separates the proof system from Canton's transactional eligibility enforcement, so more privacy-preserving formats can be added without changing the on-ledger standard.

V1 on-ledger claims are small and in plaintext. They do not hide which issuer is involved and do not make presentations unlinkable.

**Why us.** Triple Play Labs built Owl ID: an SD-JWT VC issuer, verifier and passkey-protected wallet, implementing OpenID4VCI (pre-authorised code flow), OpenID4VP with DCQL, IETF Token Status List and did:web. It runs as a pilot on Google Cloud against the Midnight preview testnet, and its Rust code has about 220 test functions, most of them unit tests ([release snapshot b5666c3](https://github.com/TriplePlayLabs/OWLID_RELEASE/commit/b5666c38ab6c39014790f19fe5bb1016319419f3), [green CI run](https://github.com/TriplePlayLabs/OWLID_RELEASE/actions/runs/27063637234)).

| Name | Role | Relevant work |
| :---- | :---- | :---- |
| Salama Ashoush | Lead engineer | Main author of Owl ID (Rust, TypeScript); contributor to Kadena tooling (kadena.js, pact-toolbox). |
| Randy Daal| Product and integration | Owl ID product and UX; frontend contributor to Kadena SpireKey, a passkey wallet |
| Nikitas Kassis | Project lead, adopter relationships |  |

**Sustainability.** Triple Play Labs maintains the package, library and reference issuer until month 24, funded by M5 whether or not adoption payments arrive. After month 24 we offer the repository to the Foundation. Every issuer runs its own registry and issuer service, so no part of the profile needs Triple Play Labs to keep running.

---

## Appendix: RFP-12 coverage

| RFP-12 asks for | Where answered | Evidence by |
| :---- | :---- | :---- |
| Provider-neutral issuing | 3.1, 3.3, 3.8, 3.8A | M1 pilot; M2 outside issuers and Google Wallet pathway |
| Verifying | 3.2 (`requireEligible`) | M1 pilot |
| Reusing across apps | 3.2, 3.5 | M2: two apps accept both issuers; M4 interoperability tranche |
| Updating | 3.3 (new offer through `CredentialFactory_UpdateCredentials`) | M1 tests |
| Revoking | 3.4 | M1 TestNet check; M3 restart test |
| KYC/KYB, accreditation, licensing, jurisdiction, authority to act, asset eligibility | 3.5 | M1 vocabulary; M2 CIP |
| One provider's credential recognised by other apps | 3.1, 3.2 | M2; M4 interoperability tranche |
| Less repeated verification | Motivation, M4 | M4 adopter evidence |
| Canton's privacy model | 3.6 | M1 visibility matrix |
| Proving a requirement without unnecessary disclosure | 3.5, 3.6, 3.8, 3.8A | M1 visibility matrix; M2 Longfellow ZK demonstration |
| Open standards, not proprietary services | Header, 3.9 | Public repository from the first commit |
| Integration with institutional systems | 3.7, 3.8, 3.8A (SD-JWT VC and ISO mdoc over OpenID4VP; Credential Utility mapping) | M2 |
| Identity & Metadata SIG and related CIPs | 4 | M2 SIG log; M3 CIP decision |
