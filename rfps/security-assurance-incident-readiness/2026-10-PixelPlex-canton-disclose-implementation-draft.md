# Canton Disclose: implementation draft

Companion to PixelPlex's Development Fund proposal. It covers how the format works, what each claim costs in evidence, and what the protocol does not give us.

| Source | Version | Used for |
| --- | --- | --- |
| Canton runtime | 3.5.6, `canton-open-source-3.5.6.jar`, protocol version 35, one sequencer and one mediator with one and then two participants | the measurements in §2 and §8 |
| Canton sources and protos | tag `v3.5.6` | every Canton file and line cited |
| Splice | 0.9.4 | Scan, token standard |
| DA Registry Proof of Transfer | public docs and Utilities API v2.1.0, read 2026-10-22 | §1, §12 |
| Daml SDK | 3.5.2, `--target=2.1` | the consent package in §4 |

## 1. Goal and non-goals

**Goal.** A subject exports a chosen subset of its retained ledger history to a named recipient. The recipient checks specific claims about that export without ledger access. For anchored items it does not need to trust the subject. Beyond the authorized items it learns only the protocol metadata listed in §10.

**Position.** For Registry token transfers, [DA Registry Proof of Transfer](https://docs.digitalasset.com/registry/guides/proof-of-transfer) answers "was this transfer accepted" online: `POST /api/utilities/v0/registry/transfer/v0/proof` takes an `updateId` and the Transfer Object and returns `{status: Success|Failure|Pending}` ([Utilities API v2.1.0](https://docs.digitalasset.com/registry/apis/open-api-specs/utility.yaml)). This format covers records of any Daml application, checked offline from bytes the recipient keeps, released under an on-ledger grant naming that recipient. If Digital Asset publishes a retained, independently checkable proof object, the package carries it as an item.

**Non-goals.** Aggregate publication with TEEs or ZK. Proof of reserves. Continuous assurance. A transformation proof binding a redacted record to the original transaction (§5). Any claim that a contract is active now, that an export is complete, that a derived figure is correct, or that an action inside a rollback was committed. Settlement, completion of a transfer or of a multi-step workflow: acceptance is a protocol fact, and what a transaction accomplished is an application question. A transfer-status adapter is outside the funded scope. The CIP leaves an extension point for it. No change to Canton is required, though the interfaces the exporter reads carry no stability guarantee for this use (§8), and Milestone 1 proposes one to the Canton maintainers.

## 2. Projections, protocol views, contracts

| | Projection | Protocol view | Contract |
| --- | --- | --- | --- |
| Unit | one LF node (`node_id`) | one `TransactionView` of the transaction Merkle tree | one `FatContractInstance` |
| Boundary | per-party filtering by `witness_parties` | a `NewView` root plus every `SameView` descendant | the contract itself |
| Cryptographic material | the contract salt inside `created_event_blob` | per-leaf salts, view hashes, the blinded tree that yields the root hash | the salt in `authentication_data` |
| Retrieval | Ledger API with the subject's rights | decrypt `EncryptedViewMessage` with the participant's private encryption key | Ledger API |
| Supports | `content_integrity` | `transaction_acceptance` | `id_authenticated` |

**View boundaries follow participants.** `TransactionViewDecompositionFactory` keeps a node in the enclosing view when `node.participants.subsetOf(currentParticipants)`, with the comment "a change in the informees triggers a new view only if a new informee participant enters the game." Observed on a two-participant network (§8): dave@P1 exercises a choice on a contract signed by carol@P2 with dave as observer, and the choice creates a note for alice@P1. alice's Ledger API projection shows only the note. The one view P1 received also carries the carol and dave contract with all its fields and dave's choice argument. Opening a view can therefore disclose content about parties and actions the grant never named (§10).

A view usually spans several LF nodes, and the boundary is not visible on the Ledger API. The exporter maps the `node_id`s it selected to the `view_position` that contains them. That mapping is a claim until the verifier establishes it (§7, step 7).

**The decrypted view is self-contained.** `TransactionViewTree` carries the whole transaction tree, blinded except for this view, and defines `rootHash = tree.rootHash` and `updateId = UpdateId.fromRootHash(rootHash)`. The verifier needs no separate Merkle path. Every participant performs this derivation and discards views with a wrong root hash.

**Redaction is leaf-granular.** `ViewParticipantData` has one `salt` over `coreInputs`, `createdCore`, `createdInSubviewArchivedInCore`, `keyResolution`, `actionDescription`, `rollbackContext` and `externalCallResults`. Removing any field changes the leaf hash, so a field mask cannot keep an item anchored.

## 3. Actors, trust and key access

| Actor | Has | Trusts |
| --- | --- | --- |
| Subject | its projections and contracts, a signing key, a Ledger API user | its participant and that participant's operator |
| Recipient | a package, the verifier, a trust anchor and a policy file obtained out of band | the synchronizer's topology governance and the signers it anchors to |
| Exporter, projection mode | the subject's Ledger API rights | the participant |
| Exporter, anchored mode | read access to the participant's stored sequenced events, and a decrypt capability for the participant's encryption key | the participant and its operator |

**Capture.** The default capture path is read-only access to the participant's own store of sequenced events (`common_sequenced_events`). It needs no sequencer credential, only read access to the participant's database, but couples the exporter to one patch release's schema. The access is a separate database role with `SELECT` on `common_sequenced_events` and the topology tables only. The same database holds `common_crypto_private_keys`, the node's private keys, so a wider read grant hands the exporter every key of the node unless the private store is encrypted with a KMS key (`wrapper_key_id`). The alternative is a second sequencer subscription for the participant (§8). That needs the participant's sequencer authentication key, and whoever holds it can also send messages as the participant, so we document it as an option and do not recommend it.

**Decryption.** Protocol views travel as `EncryptedViewMessage`. The per-recipient session-key randomness opens only with the participant's private encryption key, and `SessionKeyStore` is in memory only. The options in Canton 3.5.6:

- **KMS-held key** (`CryptoProvider.Kms`). The key never leaves the KMS and decryption is `Kms.decryptAsymmetric`. The exporter's capability is a decrypt permission on one key id, scoped and logged by the KMS. Canton's AWS and GCP KMS integrations accept only RSA-2048 encryption keys (`AwsKms.scala:605–609`, `GcpKms.scala:768–772`). ECIES keys (`EcP256` with `EciesHkdfHmacSha256Aes128Cbc`) can sit in a KMS only through a KMS driver that declares them (`KmsDriverSpecsConverter.scala:37–47`). The node we measured used an ECIES key.
- **Node-held key.** Canton gives no sanctioned way to let an outside process decrypt with it. `VaultService.ExportKeyPair` would hand the key out in one command, and reading it from the node's database is the same extraction. The standard does not sanction either.

Milestone 1 documents these options and their trust cost. Milestone 3 supports the KMS paths. A participant with a node-held key runs projection mode until Canton offers a sanctioned path. The question is part of the interface proposal to the Canton maintainers.

The recipient never needs a participant and never contacts the mediator. It does need a trust anchor and a policy file that did not come from the package.

## 4. Consent on the ledger

Daml package `Canton.Disclose.Consent`. It compiles on SDK 3.5.2 with `--target=2.1`.

```daml
module Canton.Disclose.Consent where

import DA.List (dedup, sort)
import DA.Optional (fromOptional)

data RecipientId
  = OnLedger Party
  | OffLedger with externalRef : Text; keyId : Text
  deriving (Eq, Show)

recipientParties : RecipientId -> [Party]
recipientParties (OnLedger p) = [p]
recipientParties (OffLedger _ _) = []

data ItemKind = Projection | ProtocolView | Contract
  deriving (Eq, Ord, Show)

data Scope = Scope with
    updates          : Optional [Text]
    fromTime         : Optional Time
    toTime           : Optional Time
    templates        : Optional [Text]
    counterparties   : Optional [Party]
    permittedParties : [Party]
    fieldMask        : Optional [Text]
    itemKinds        : [ItemKind]
  deriving (Eq, Show)

-- Narrowing only. A None filter is the universal filter, so a Some is always at
-- least as tight as a None, and a Some must be a subset of the outer Some.
scopeSubsumes : Scope -> Scope -> Bool
scopeSubsumes outer inner =
  narrower outer.updates inner.updates
    && laterOrEqual outer.fromTime inner.fromTime
    && earlierOrEqual outer.toTime inner.toTime
    && narrower outer.templates inner.templates
    && narrower outer.counterparties inner.counterparties
    && subset inner.permittedParties outer.permittedParties
    && narrower outer.fieldMask inner.fieldMask
    && subset inner.itemKinds outer.itemKinds
  where
    subset xs ys = all (`elem` ys) xs
    narrower None _ = True
    narrower (Some _) None = False
    narrower (Some o) (Some i) = subset i o
    laterOrEqual None _ = True
    laterOrEqual (Some _) None = False
    laterOrEqual (Some o) (Some i) = i >= o
    earlierOrEqual None _ = True
    earlierOrEqual (Some _) None = False
    earlierOrEqual (Some o) (Some i) = i <= o

-- Lists in a Scope are sets: order and duplicates carry no meaning.
normalizeScope : Scope -> Scope
normalizeScope s = s with
    updates          = fmap norm s.updates
    templates        = fmap norm s.templates
    counterparties   = fmap norm s.counterparties
    permittedParties = norm s.permittedParties
    fieldMask        = fmap norm s.fieldMask
    itemKinds        = norm s.itemKinds
  where
    norm : Ord a => [a] -> [a]
    norm = dedup . sort

-- How the grant treats parties other than the subject, and other than the
-- grant's policyExempt list, that an anchored item would name. Fixed at grant
-- time; the verifier reads it from the grant.
data CounterpartyPolicy
  = ConsentRequired  -- each such party holds a CounterpartyConsent covering the item
  | NotifyOnly       -- each such party is sent a DisclosureNotice at export
  | ProjectionOnly   -- no anchored item may name a party other than the subject
  deriving (Eq, Show)

template DisclosureRequest
  with
    requester : Party
    subject   : Party
    recipient : RecipientId
    scope     : Scope
    purpose   : Text
    expiresAt : Time
  where
    signatory requester
    observer subject

    choice Accept : ContractId DisclosureGrant
      with
        grantId       : Text
        narrowedScope : Optional Scope
        standing      : Bool
        delegates     : [Party]
        counterpartyPolicy : CounterpartyPolicy
        policyExempt  : [Party]
      controller subject
      do
        let effective = fromOptional scope narrowedScope
        assertMsg "narrowedScope must not widen the requested scope"
          (scopeSubsumes scope effective)
        create DisclosureGrant with
          grantId; requester; subject; recipient
          scope = effective; purpose; expiresAt; standing; delegates
          counterpartyPolicy; policyExempt

    choice Decline : ()
      controller subject
      do pure ()

    choice Withdraw : ()
      controller requester
      do pure ()

template DisclosureGrant
  with
    grantId   : Text
    requester : Party
    subject   : Party
    recipient : RecipientId
    scope     : Scope
    purpose   : Text
    expiresAt : Time
    standing  : Bool
    delegates : [Party]
    counterpartyPolicy : CounterpartyPolicy
    -- Parties the counterparty policy does not apply to, such as the admin of
    -- each instrument in scope. The CLI fills in those admins by default.
    policyExempt : [Party]
  where
    signatory subject
    observer requester, delegates, recipientParties recipient

    choice Revoke : ContractId DisclosureRevocation
      with revokedAt : Time
      controller subject
      do create DisclosureRevocation with
           grant = self; grantId; subject; requester; revokedAt

    choice Narrow : ContractId DisclosureGrant
      with tighter : Scope
      controller subject
      do
        assertMsg "Narrow must not widen" (scopeSubsumes scope tighter)
        assertMsg "Narrow must actually narrow"
          (normalizeScope tighter /= normalizeScope scope)
        create this with scope = tighter

    -- One-shot. Consuming, so an export taken through this choice spends the
    -- grant. This is not an invariant: see the properties list below.
    choice AuthorizeExport : ContractId ExportAuthorization
      with
        packageHash  : Text
        authorizedAt : Time
      controller subject
      do
        assertMsg "AuthorizeExport is for one-shot grants" (not standing)
        create ExportAuthorization with
          grant = self; grantId; subject; requester; recipient
          packageHash; authorizedAt

    -- Standing. Non-consuming: one authorization per delivery, grant unchanged.
    nonconsuming choice AuthorizeStandingExport : ContractId ExportAuthorization
      with
        packageHash  : Text
        authorizedAt : Time
      controller subject
      do
        assertMsg "AuthorizeStandingExport needs a standing grant" standing
        create ExportAuthorization with
          grant = self; grantId; subject; requester; recipient
          packageHash; authorizedAt

-- The authorization of one package to one recipient. It carries no copy of the
-- grant's scope or policy: the verifier reads those from the grant it cites.
-- The subject is its only signatory and can also create it directly.
template ExportAuthorization
  with
    grant        : ContractId DisclosureGrant
    grantId      : Text
    subject      : Party
    requester    : Party
    recipient    : RecipientId
    packageHash  : Text
    authorizedAt : Time
  where
    signatory subject
    observer requester, recipientParties recipient

template DisclosureRevocation
  with
    grant     : ContractId DisclosureGrant
    grantId   : Text
    subject   : Party
    requester : Party
    revokedAt : Time
  where
    signatory subject
    observer requester

-- The subject's own statement. Not a receipt.
template DeliveryAssertion
  with
    grant       : ContractId DisclosureGrant
    authz       : ContractId ExportAuthorization
    subject     : Party
    requester   : Party
    recipient   : RecipientId
    packageId   : Text
    packageHash : Text
    deliveredAt : Time
  where
    signatory subject
    observer requester, recipientParties recipient

    -- Only the recipient acknowledges. A requester who is not the recipient
    -- cannot acknowledge on its behalf. For an OffLedger recipient the
    -- controller list is empty and this choice cannot be exercised at all;
    -- that recipient acknowledges by signing the package hash under its
    -- registered key instead.
    choice Acknowledge : ContractId DisclosureAcknowledgement
      with acknowledgedAt : Time
      controller recipientParties recipient
      do
        case recipient of
          OnLedger r -> create DisclosureAcknowledgement with
            grant; subject; recipient = r; requester
            packageId; packageHash; acknowledgedAt
          OffLedger _ _ -> abort "off-ledger recipients acknowledge by signature"

-- Signed by the subject and the recipient. This is a receipt.
template DisclosureAcknowledgement
  with
    grant          : ContractId DisclosureGrant
    subject        : Party
    recipient      : Party
    requester      : Party
    packageId      : Text
    packageHash    : Text
    acknowledgedAt : Time
  where
    signatory subject, recipient
    observer requester

-- A counterparty's own consent to appear in anchored items the subject exports
-- to this recipient. Signed by the counterparty alone, so the subject cannot
-- create it. Not tied to a grant contract id, which Narrow and Revoke change.
template CounterpartyConsent
  with
    counterparty : Party
    subject      : Party
    recipient    : RecipientId
    scope        : Scope
    expiresAt    : Time
  where
    signatory counterparty
    observer subject

    choice WithdrawConsent : ()
      controller counterparty
      do pure ()

-- The subject's notice to a counterparty under NotifyOnly. Tells the
-- counterparty that an item naming it went to this recipient.
template DisclosureNotice
  with
    authz        : ContractId ExportAuthorization
    subject      : Party
    counterparty : Party
    recipient    : RecipientId
    packageHash  : Text
    noticedAt    : Time
  where
    signatory subject
    observer counterparty
```

**Properties.**

- `scopeSubsumes` constrains the propose-accept path only. `DisclosureGrant` has one signatory, so the subject can create a grant of any scope, and with any counterparty policy, without a request. The grant is the authorization, and the request is advisory.
- Revocation and one-shot consumption are what the ledger enforces. Expiry is a verifier check: nothing archives an expired grant.
- A grant is standing authority. Each export needs an `ExportAuthorization` naming the recipient and the package hash, and the verifier requires it.
- Single use is not a ledger invariant. `ExportAuthorization` has the subject as its only signatory, so the subject can create one directly without spending the grant. The consuming choice records what an honest export does. A recipient with ledger access can check whether its authorization is the exercise that archived the grant. An offline verifier cannot. `DisclosureRevocation` is directly creatable in the same way.
- `ExportAuthorization` cites the grant and copies none of its scope or policy. The verifier reads both from the grant.
- The time fields (`authorizedAt`, `revokedAt`, `deliveredAt`, `acknowledgedAt`, `noticedAt`) are set by the caller and can be backdated. The verifier ignores them and uses the record time of the anchored transaction that created the contract (§6).
- `Narrow` compares normalized scopes, so a reordered or duplicated list does not count as narrowing. One-shot therefore means one export per grant contract id, which is still not one export per accepted request.
- `Narrow` and `Revoke` archive the grant, so a stored `ContractId DisclosureGrant` may point to an inactive contract. The verifier matches the contract id the authorization cites and reports activeness separately as `current_revocation_status`.
- Only the recipient party controls `Acknowledge`. An `OffLedger` recipient has no controller and acknowledges by signing the package hash under its registered key.
- Any party can create a `DisclosureRequest` naming any subject. The exporter and the CLI filter by requester.
- `delegates` are observers of the grant and have no choice on it: parties the subject lets see and track the grant, such as its account provider. Delegation is fixed at grant time. Delegates receive no package. The verifier cannot see where a package was physically delivered. It checks that the authorization names this recipient.
- Downstream templates carry `ContractId DisclosureGrant`, not `grantId`. Canton 3.x has no contract-key uniqueness, so `grantId` is a label.
- An all-`None` scope with every `ItemKind` is the universal scope. An empty `itemKinds` admits nothing. Both are corpus cases.
- `permittedParties` is the deny-by-default list for anchored items: an item is exportable only if every party in the opened component is in it.
- `policyExempt` lists parties the counterparty policy does not apply to. The CLI fills in the admin of each instrument in scope (`InstrumentId.admin` of the holdings the items touch), because the admin takes part in every movement of its asset, and for Amulet it is the DSO party, which will not sign a consent for each audit. The subject can edit the list. That adds no power the subject lacks, since it chooses the policy itself, and the recipient sees the list in the anchored grant.
- `counterpartyPolicy` is chosen by the subject and enforced by the subject's exporter and by the verifier from evidence in the package. It protects counterparties from an honest operator's mistakes. It cannot protect them from a subject that decides to disclose what it already sees. Under `ConsentRequired` every party other than the subject and the `policyExempt` parties named in an anchored item needs a `CounterpartyConsent` covering the subject, recipient and item. The package carries each consent as anchored evidence, and a missing one is `consent_missing`. Under `NotifyOnly` the package carries an anchored `DisclosureNotice` for each named party, and a missing one is `notice_missing`. Under `ProjectionOnly` no anchored item may name anyone but the subject.
- `CounterpartyConsent` has the counterparty as its only signatory and the subject as observer, so the subject cannot create it and the subject's participant receives the view of its creation. It binds subject, recipient, scope and expiry, not a grant contract id, because `Narrow` and `Revoke` replace that id. Offline, the verifier checks that the consent existed at the record time of the export authorization. Withdrawal is visible only online and does not retract a delivered package.

The Daml Script scenarios live in a separate test package that depends on this one, so a participant vets the consent templates without `daml-script`. They all pass. A subject cannot create a consent on a counterparty's behalf, and the counterparty can withdraw it. `Accept` cannot widen the requested scope. The authorization cites its grant. Reordered or duplicated scopes are rejected by `Narrow`, and `policyExempt` survives `Narrow`. A `DisclosureNotice` is visible to the counterparty.

## 5. Claims and the evidence each one costs

| Claim | Establishes | Does not establish | Evidence | Needs node decrypt |
| --- | --- | --- | --- | --- |
| `content_integrity` | the item is what the manifest commits to | anything about the ledger | package hashes | no |
| `id_authenticated` | payload and authentication data recompute the contract-id suffix (unicum); the discriminator is not covered | that the contract was created or accepted | `created_event_blob` | no |
| `transaction_acceptance` | the transaction was accepted at the stated record time and this view is a leaf of its tree | activeness, completeness, settlement, derived values, that the action was not rolled back | mediator-signed confirmation result, its sequencer-signed delivery, historical topology, the decrypted view | yes |
| `disclosure_authorization` | the subject authorized this package to this recipient at the record time of the authorization | current revocation status | grant and `ExportAuthorization`, each as anchored evidence; in projection mode only their `created_event_blob`s, reported `subject_attested` | yes, for `verified_as_of` |
| `recipient_acknowledged` | the recipient confirmed receipt of this `content_hash` | that the recipient read or accepted the contents | `DisclosureAcknowledgement` as anchored evidence, or a signature under `OffLedger.keyId` | for the contract form |
| `scope_completeness` | nothing cryptographic | that nothing in scope was omitted | subject attestation | no |

A projection-only package is a signed export: its records are as trustworthy as the subject, and the fabricated-but-consistent contract in the corpus passes `id_authenticated`.

**Rollback.** A view whose root action sits inside a rollback carries a non-empty `rollbackContext`. The verifier reports such an item as an action the transaction executed and discarded. Corpus case.

**What `id_authenticated` covers.** Everything that enters the unicum: template id, create argument, signatories, non-signatory stakeholders, key and maintainers, `created_at` and the salt. Canton 3.5.6 has four contract-id versions: `AuthenticatedContractIdVersionV10`, `V11`, `V12` and `CantonContractIdV2Version0`, the last with absolute and relative suffixes. The release names which versions it supports. A relative V2 suffix is `unsupported_feature`.

**Completeness.** `scope_completeness` is a subject attestation. Neither this format nor ACS commitments answer "Is this everything about contract X". ACS commitments compare participants and do not attest to an export.

**Redaction.** `submitterMetadata` and `participantMetadata` are separately blindable subtrees, and blinding them preserves the root hash. So the options are: disclose a smaller component where the tree allows; prefer a non-top-level view, which already has `submitterMetadata` blinded (§10); or produce a subject-attested redaction with `content_integrity` only. The exporter never blinds a subtree Canton requires unblinded, because the result would no longer be a valid Canton view tree.

## 6. Package format

One package is one grant and one exporter run. JSON envelope with binary attachments, schema `canton-disclose/package/1`. The structure is published as a versioned JSON Schema in the project repository, so implementers can validate packages and generate code from it. A new field or a changed field is a new schema version and needs no change to the CIP.

```json
{
  "schema": "canton-disclose/package/1",
  "manifest": {
    "package_id": "uuid",
    "created_at": "2026-03-14T09:12:03Z",
    "subject": "party::fingerprint",
    "recipient": { "kind": "off_ledger", "external_ref": "…", "key_id": "…" },
    "grant": { "contract_id": "…", "grant_id": "…" },
    "synchronizer": "da::…::<protocol-version>-<serial>",
    "topology_as_of": "…",
    "digest_algorithm": "sha-256/rfc8785",
    "evidence_digest": "…",
    "content_hash": "…",
    "exporter": { "name": "canton-disclose", "version": "…", "key_id": "…" }
  },
  "items": [
    {
      "id": "item-1",
      "kind": "protocol_view",
      "update_id": "1220…",
      "view_position": [0, 1],
      "covers_node_ids": [3, 4, 5],
      "rollback_context": [],
      "claims": ["content_integrity", "transaction_acceptance"],
      "view_tree": "base64"
    },
    {
      "id": "item-2",
      "kind": "contract",
      "contract_id": "00…",
      "contract_id_version": "AuthenticatedContractIdVersionV12",
      "claims": ["content_integrity", "id_authenticated"],
      "created_event_blob": "base64"
    }
  ],
  "evidence": {
    "updates": {
      "1220…": {
        "confirmation_result": {
          "bytes": "base64",
          "mediator_group": 0,
          "signatures": [ { "signer": "MED::…", "signature": "…" } ]
        },
        "result_delivery": {
          "bytes": "base64",
          "signature": { "signer": "SEQ::…", "signature": "…" },
          "timestamp": "…"
        }
      }
    },
    "authorization": {
      "grant": { "update_id": "1220…", "view_tree": "base64" },
      "export_authorization": { "update_id": "1220…", "view_tree": "base64" },
      "counterparty_consents": [ { "update_id": "1220…", "view_tree": "base64" } ],
      "notices": [],
      "acknowledgement": null
    },
    "topology": { "transactions": "base64", "serial_chains": { "…": [3, 4, 5] } }
  },
  "signatures": [
    { "signer": "subject", "key_role": "party_to_key", "key_id": "…", "signature": "…", "covers": "manifest+items+evidence" }
  ]
}
```

**Design rules.**

- Every item lists the claims it asserts. A claim without evidence is `unavailable`. Evidence for a claim no item lists is `extraneous_evidence`.
- Per transaction the package carries the mediator's `ConfirmationResultMessage` with the mediator group's signatures, and the sequencer-signed event that delivered that result to the exporting participant. Canton addresses the result to each participant in its own recipient group (`VerdictSender.scala:259–262`) and the sequencer trims recipients per member before signing (`SequencerReader.scala:842`, `RecipientsTree.forMember`), so this delivery names only the exporting participant. The decrypted view tree binds to the result through its root hash. The delivery of the confirmation request, whose envelopes and `session_key_lookup` name other participants, is not carried.
- Authorization contracts are anchored. The grant, the export authorization, each counterparty consent or notice, and an on-ledger acknowledgement are carried as decrypted views of their own creating transactions, each with an entry in `evidence.updates`. Their record times come from the signed confirmation results, which is why caller-set time fields cannot backdate an authorization. These transactions involve the subject, the requester, delegates, the recipient party and the consenting counterparty, so carrying them adds no third party.
- Topology is carried once, in `evidence.topology`. `manifest.topology_as_of` is the record time the verifier evaluates at.
- `covers_node_ids` is the exporter's claimed mapping. §7 step 7 says when the verifier can establish it.
- `content_hash` is what gets authorized and acknowledged. It covers the items, the evidence block without `evidence.authorization.export_authorization` and `acknowledgement`, and the manifest without `content_hash` and `evidence_digest`. `ExportAuthorization.packageHash` and `DisclosureAcknowledgement.packageHash` carry that value.
- Digests use [RFC 8785](https://www.rfc-editor.org/rfc/rfc8785) canonicalization over the covered subtree, binary attachments as base64url without padding, and SHA-256 with a domain-separation tag per digest (`canton-disclose/content-hash/1`, `canton-disclose/evidence-digest/1`). An algorithm the verifier does not implement is `unsupported_version`.
- An off-ledger recipient acknowledges with a detached signature over `content_hash` under `OffLedger.key_id`, carried in `signatures` with `signer: "recipient"`.
- `serial_chains` gives the contiguous serials for each topology mapping the verification relies on, so a filtered export cannot drop a superseding change. A gap is `incomplete_topology`.
- There is no threshold field. Thresholds come from topology and the policy file.
- The package carries protocol messages as raw bytes so the verifier re-derives hashes with the protocol version's own encoding.
- Only the subject signs the package. `key_role` says how that signature resolves (§7 step 3).

## 7. Verification algorithm

1. **Outside inputs.** The trust anchor (synchronizer id and the namespace keys the recipient accepts) and the policy file. A package that supplies its own anchor verifies nothing.
2. **Schema.** Parse, and reject unknown schema versions.
3. **Keys, then signatures.** Validate the carried topology against the anchor: namespace delegations, owner-to-key mappings, mediator and sequencer group states, each with its signature set and validity window, evaluated at the record time of the update being verified. The chain must be complete for that time, with contiguous serials, or bind to a topology checkpoint the recipient already trusts. A gap is `incomplete_topology`. Then check the subject signature, which resolves as `party_to_key` (a `PartyToKeyMapping` for an externally signing party) or `anchor_supplied` (a key in the trust anchor). A hosted party with neither is not a signer this format recognises.
4. **Evidence per update.** Verify the mediator signatures on the confirmation result. Acceptance rests on these: count distinct authorized mediators and compare with the mediator group threshold from topology and with the policy. Confirm the result is an approval and extract the root hash and record time. Then verify the one sequencer signature on the result delivery. In Canton 3.5 a sequenced event carries one sequencer's signature (`SignedContent.scala:105`, "TODO(i12076): Start using multiple signatures"), so it evidences delivery time from that sequencer only. A sequencer threshold needs the same event captured from several sequencer connections, which the exporter supports where the participant has them. Cross-check root hash, synchronizer id, mediator group and request id between result, delivery and item.
5. **`contract` items.** Recompute the contract id for the declared version and compare → `id_authenticated`.
6. **`protocol_view` items.** Deserialize the view tree, recompute `tree.rootHash`, compare with step 4 → `transaction_acceptance`. Report a non-empty `rollback_context`. Compare recomputed hashes, never bytes. Canton accepts a view tree whose nested version tags differ and re-serializes it to the original, so in our run three bytes of a 2,572-byte tree sat outside the hash. No change to content left the hash unchanged.
7. **`covers_node_ids`.** Create nodes match by contract id. Exercise and fetch nodes match by `(contract id, choice, argument hash)` where that triple is distinct in the transaction. Two identical actions on one contract in one transaction are `unverified` by rule. A mapping that cannot be established never upgrades a claim.
8. **Authorization.** Verify the anchored grant and the anchored `ExportAuthorization` with steps 4 and 6. The authorization must cite this grant, name this recipient, and carry this package's `content_hash`, or the result is `invalid_evidence`. Check every item against the grant scope at record level and against the subject's visibility. An item outside either is `scope_violation`. Apply the grant's `counterpartyPolicy`: derive the parties each anchored item names, drop the subject and the grant's `policyExempt` parties, and require an anchored consent existing at the authorization's record time (`consent_missing`) or an anchored notice (`notice_missing`), or no other party at all under `ProjectionOnly` (`scope_violation`). Check the acknowledgement if present and reject one not signed by the recipient. `disclosure_authorization` is `verified_as_of` the authorization's record time, or `subject_attested` when the grant and authorization are carried only as `created_event_blob`s. If the recipient has ledger access, query revocation and, for a one-shot grant, whether this authorization is the exercise that archived it. Otherwise `current_revocation_status` is `unknown_offline`.
9. **Result.** One line per claim per item, plus a package verdict from the policy file.

**Result vocabulary.** The vocabulary is normative, and the CIP's error codes use the same tokens.

| Token | Meaning | Appears for |
| --- | --- | --- |
| `verified` | evidence present and checks passed | any claim |
| `verified_as_of <T>` | verified against state at record time T | `disclosure_authorization` |
| `unverified` | not decidable from the package by rule | `covers_node_ids` |
| `unavailable` | the item lists the claim and carries no evidence | any claim |
| `insufficient` | authorized mediator signers below the required threshold | `transaction_acceptance` |
| `unauthorized_signer` | a signer is not authorized by topology at the record time | `transaction_acceptance` |
| `unknown_offline` | needs ledger access the recipient lacks | `current_revocation_status` |
| `subject_attested` | asserted by the subject only | `scope_completeness`, `disclosure_authorization` in projection mode |
| `rejected` | the result says the transaction was not approved | `transaction_acceptance` |
| `conflicting_evidence` | two different results for one `update_id` | `transaction_acceptance` |
| `out_of_window` | carried topology does not span the record time | topology-dependent claims |
| `incomplete_topology` | the serial chain has a gap | topology-dependent claims |
| `invalid_evidence` | well-formed evidence that does not bind to this item, package or recipient | any claim |
| `malformed_evidence` | evidence does not parse | any claim |
| `unsupported_feature` | a protocol feature, contract-id version or scheme this release does not cover | any claim |
| `unsupported_version` | package, protocol or schema version outside the supported set | package level |
| `scope_violation` | an item outside the grant scope or the subject's visibility | package level |
| `consent_missing` | under `ConsentRequired`, a named counterparty has no anchored consent covering the item | package level |
| `notice_missing` | under `NotifyOnly`, a named counterparty has no anchored notice | package level |
| `missing_update` | an item references an `update_id` with no evidence entry | `transaction_acceptance` |
| `extraneous_evidence` | evidence for a claim no item lists | package level |
| `empty` | no items, or no claims on an item | package level |

`current_revocation_status` is a report line, not a claim.

**Policy file and aggregation.** A policy names, per claim, the set of tokens it accepts, the thresholds used in step 4, and whether `unverified` is fatal. The CIP fixes aggregation:

1. `scope_violation`, `consent_missing`, `notice_missing`, `unsupported_version`, `malformed_evidence`, `extraneous_evidence` and `empty` fail the package whatever the policy says.
2. Otherwise the verdict covers only the claims the policy requires. A required claim passes when every item whose kind can carry it (§5) reaches an accepted token.
3. A required claim no item can carry fails the package as `empty`. A claim an item could carry but did not list is `unavailable`, and the policy decides whether that is accepted.
4. A policy may set a freshness bound on `verified_as_of <T>`. Exceeding it fails that claim.

The verdict names the first failing claim and its token. Steps 1 to 7 are offline and deterministic given the anchor and the policy. The revocation query in step 8 is the only network call and is optional.

## 8. Evidence access

Measured on Canton 3.5.6 with a participant, sequencer and mediator and two real transactions: the `update_id` the Ledger API returns appears byte for byte inside the mediator's confirmation result, the result carries the mediator's Ed25519 signature, and it is delivered inside a sequencer-signed event. A second run on two participants took the chain through decryption (below).

| Needed | On a participant API | In the participant's sequenced-event store or subscription | Opens without node decrypt |
| --- | --- | --- | --- |
| root hash (`update_id`) | Ledger API | yes | yes |
| mediator signatures over the result | no | yes | yes |
| sequencer signature over the result delivery | no | yes | yes |
| protocol view content and salts | no | as ciphertext | no |
| contract salt | `created_event_blob` | no | yes |
| historical topology with signature sets | `TopologyManagerReadService` | yes | yes |

**The two-participant run.** The run placed alice on P1 and carol and bob on P2, on protocol version 35. From P1's own sequenced-event store we took the confirmation request (a `RootHashMessage` and one `EncryptedMultipleViewsMessage` for P1 and P2) and the mediator's result, addressed to P1 only. The view opened with P1's encryption key, EC-P256 with `EciesHkdfHmacSha256Aes128Cbc`, the default: the asymmetric layer gives 16 bytes of randomness, which derive the symmetric key for the view, and the plaintext deserializes to a `LightTransactionViewTree`. Its recomputed root hash equals the root hash in the `ConfirmationResultMessage`, the one in the `RootHashMessage`, and the `update_id`. The mediator and sequencer signatures, one Ed25519 signature each, verify against keys from P1's topology store at the request time. A one-bit change to the view content or to the result breaks the check. One command reproduces the run, and every check passed.

**The member subscription.** `SequencerService.Subscribe` returns "Serialized `SignedContent[SequencedEvent[ClosedEnvelope]]`", the same object the participant stores in `common_sequenced_events`. A subscription is admitted above the sequencer's pruning lower bound and the member's registration time, and `SubscriptionPool` keeps several subscriptions per member. It authenticates as the member with a key topology binds to the participant, it delivers the member's whole stream, and it ends where sequencer pruning starts. So it is a capture path, not an archive, and the exporter filters to the grant itself.

**Stability.** `protobuf-continuity-check/` has three buf configs. `forwards-buf.yaml` applies `FIELD_NO_DELETE`, `FIELD_SAME_TYPE`, `RPC_NO_DELETE` and the rest to every proto, so `SignedContent` and `GenTransactionTree` are covered going forward. Two gaps remain. `backwards-buf.yaml` ignores `com/digitalasset/canton/protocol/v30/mediator.proto`, which defines `ConfirmationResultMessage`, with the comment "Ignore messages created by the mediator, because a malicious mediator can't break transparency". And no rule checks hash derivation: the configs check field shape and wire compatibility, not whether the same content still hashes to the same value. `created_event_blob` is documented in `event.proto` as an "opaque representation". The compatibility matrix therefore pins exact patch releases.

**What the participant APIs do not give.** None of the participant admin services in 3.5.6 returns a sequenced event, a confirmation request, a verdict or a transaction signature. `ParticipantInspectionService` covers ACS commitments, offset lookup and in-flight counts. `participant.testing.sequencer_messages` reaches the stored events but only on an in-process node with `enable-testing-commands`. `MediatorInspectionService.Verdicts` streams verdicts with informees and quorums but no signature. If it carried the mediator signature, proving acceptance would need no read access to the participant database, though opening a view would still need decryption. This is the narrow request in the Milestone 1 interface proposal. On the global synchronizer Splice Scan republishes that stream on `/v0/events`, so acceptance and view party structure are already public there for anyone holding the update id. The answer carries no signature. Splice validators trust Scan by querying several SV Scans and accepting an answer only when f+1 agree (`BftScanConnection`, `targetSuccess = f + 1`), and a recipient can do the same while it is online. For a wholly private transaction Scan returns the verdict only, without the update.

**What the runs did not establish.** The event bytes came from an in-memory store through internal members of the participant, not from the `common_sequenced_events` table or a sequencer subscription. Decryption used a key exported with `ExportKeyPair`, which the standard does not sanction (§3). No KMS and no RSA key were tested. Verification ran inside Canton's JVM with Canton's own classes, so there is no second implementation of parsing or hashing yet. Topology came from P1's store and its signatures, namespace chain and trust anchor were not checked. The network had one mediator and one sequencer with threshold 1, no key rotation, and one view per transaction. No unicum was recomputed and the submitting participant's signature was not checked. Milestone 1 repeats the chain through a KMS-held key with topology validated up to a trust anchor. Milestone 2 implements contract-id recomputation in the verifier, and Milestone 4 view-tree hashing. Later 3.5 patch releases were not tested.

## 9. Coverage, retention and pruning

A package states its coverage: `earliest_recoverable`, `capture_started_at`, whether `backfill` recovered history from unpruned stores, `retention_window` and `gaps`.

Three retention clocks are independent: Ledger API pruning removes projections, store pruning removes sequenced events, sequencer pruning moves the subscription's lower bound. The exporter captures ahead of all three. A package verifies after the source participant has pruned, because the evidence travels in it.

Anchored export opens a view with the encryption key valid at its record time. A deployment offering anchored history must keep every historical encryption key for the window it claims. `VaultService.DeleteKeyPair` after a rotation makes that history unrecoverable.

Retention tests in Milestone 3: verification after the source participant pruned; capture interrupted and resumed; exporter restart mid-run; verification across a historical topology-key rotation; anchored export across an encryption-key rotation.

## 10. Disclosure boundary and privacy

What the participant received, what the subject can see and what the grant authorizes are three different sets. Being an informee somewhere in an update does not make the whole update exportable for the subject.

**The boundary check.** Because a view follows participants (§2), a leaf can carry an action whose informees do not include the subject. The exporter checks every opened component three ways: every party in it against `permittedParties`; the component against the subject's own visibility; the record against the rest of `Scope` (update list, time window, templates, item kinds). It falls back to a projection item, or refuses, when a component fails. The verifier repeats the check (§7 step 8). Milestone 1 measures how often the fallback fires, on a local network with parties placed on separate participants as in production (registry admin, each holder and the executor each on their own participant), and reports the number per placement, together with the share of items that passes under each counterparty policy.

**What each side learns.**

| Who | Learns |
| --- | --- |
| Recipient | the items in scope; the subject's identity; any party in a disclosed leaf (subject to the counterparty policy); root hashes and record times; the mediator and sequencer identities and group state at that time; the sibling-hash structure of the blinded tree, which shows the transaction's view count; the metadata every view tree carries unblinded: `uuid`, `ledgerTime`, `preparationTime`, `workflowIdO`; on a top-level view also `actAs`, `userId`, `commandId`, `submittingParticipant`, `submissionId`, `dedupPeriod`, `maxSequencingTime` and `externalAuthorization`; the grant, its scope and purpose text; the requester and delegates |
| Exporter | everything the subject sees within scope, and in anchored mode everything in the decrypted views, including the parties that trigger a fallback |
| Delegates | the grant: scope, purpose, recipient id, other delegates |
| Requester, standing grant | one `DeliveryAssertion` per delivery, which reveals the exporter's schedule and, from the gaps, when nothing was in scope |
| Counterparty on a disclosed transaction | a `policyExempt` party, nothing; otherwise under `ConsentRequired`, what it consented to; under `NotifyOnly`, that an item naming it went to this recipient; under `ProjectionOnly`, nothing. The protocol itself never tells a counterparty that another participant exported a view |
| Mediator operator | unchanged by this project |

The package carries the delivery of the mediator result only, which names the exporting participant alone. It does not carry the confirmation request's delivery, so the recipient does not see the other participants that received views or their encryption-key fingerprints in `session_key_lookup`.

**What a root hash reveals.** On a synchronizer with Scan, `/v0/events/{update_id}` gives anyone holding the update id the verdict, mediator group, `submitting_parties`, `submitting_participant_uid`, and per view the `informees` and `confirming_parties`. An anchored item therefore gives the recipient a lookup key into the party structure of the whole transaction, because the update id is the root hash the verifier recomputes. Where that is too much, the item has to be a projection item. A projection item carries no update id by default: items from one transaction share a package-local `tx_ref`, and the record time and Ledger API offset stay in the item. No claim on a projection item uses its update id. If the recipient wants to look the transaction up online, the operator runs the exporter with `--include-update-ids`. The manifest records that choice, and the Scan exposure above then applies to projection items too.

**Topology filter.** An unfiltered export is the synchronizer's whole membership. The package carries only the namespace chain to the mediator and sequencer group states in force and any `PartyToKeyMapping` the subject signature uses, with the contiguous serial chain for each. The corpus rejects an unfiltered export.

**Submitter metadata.** Canton requires `commonMetadata` and `participantMetadata` unblinded in every view tree, and `submitterMetadata` unblinded exactly when the view is top-level. Blinding them would keep the root hash and produce an object Canton's own deserialization rejects. The exporter therefore carries views as Canton produced them and prefers a non-top-level view, which has `submitterMetadata` blinded already. Where only the top-level view covers the nodes and its submitter metadata is too much to disclose, the item is a projection item.

**Exporter compromise.** Filtering inside the exporter does not protect against a compromised exporter, which holds a decrypt capability. The mitigations are a KMS-scoped capability where available, process isolation, audit logging, and a stated residual risk. The standard specifies encryption of packages at rest and in transit.

## 11. Security

| Threat | Mitigation |
| --- | --- |
| Forged package | subject signature over manifest, items and evidence; keys resolve through the trust anchor |
| Evidence of transaction A with data of B | root hash, synchronizer, mediator group and request id cross-checked (§7 step 4) |
| Fabricated but consistent contract | passes `id_authenticated`; corpus case that must fail `transaction_acceptance` |
| Rolled-back action presented as committed | `rollback_context` reported; corpus case |
| Forged `covers_node_ids` | `unverified` unless established; never upgrades a claim |
| Threshold downgrade | thresholds from topology and policy only |
| Backdated authorization | record time from the anchored creating transaction; caller-set time fields ignored; corpus case |
| Authorization for a different package | `packageHash` must equal the recomputed `content_hash` |
| One-shot grant exported twice | not prevented; visible only to a recipient with ledger access (§4) |
| Counterparty named without consent or notice | `consent_missing` or `notice_missing` from anchored evidence; corpus cases |
| Requester acknowledging for the recipient | acknowledgement must be signed by the recipient |
| Superseding topology change withheld | contiguous serial chain; `incomplete_topology` |
| Record in scope by party, out of scope by filter | per-component check against visibility and the whole `Scope`; `scope_violation` |
| Subject key compromise | grants revocable; short expiries for standing grants |
| Malicious topology | validated through the namespace chain to an out-of-band anchor |
| Node encryption key leaving the node | `ExportKeyPair` and database extraction are not sanctioned configurations |
| Exporter credential misuse | the default capture reads the store and holds no sequencer credential |

## 12. Integrations

- **DA Registry Proof of Transfer.** Online status for Registry transfers over `TransferOffer`, `TransferRule` and the Token Standard's `TransferInstruction`. We do not build a second status service.
- **CIP-0112 (approved) and the custodial case.** Account providers "MUST have visibility on all asset movements" of the accounts they provide (`cip-0112.md:544`), so the provider's participant holds the views of its clients' transfers. Who is the subject decides whose authorization the package carries. Both cases work with the consent package as it is:
  - *The client discloses.* The subject is the account owner. The owner signs the grant and can list the provider as a delegate. The exporter runs at the participant hosting the owner, which is often the provider's. The provider is named in every item, so under `ConsentRequired` it signs a `CounterpartyConsent` or the owner puts it in `policyExempt`.
  - *The provider discloses.* The provider answers its own auditor or regulator for the accounts it keeps and is the subject. The owner is then a named counterparty of every item, and the policy decides. Under `ConsentRequired` the owner signs a `CounterpartyConsent`, for example once in the account agreement, scoped to the provider's regulator. Under `NotifyOnly` the owner gets a `DisclosureNotice` for each package. Where the law obliges the provider to disclose without the client's consent, `NotifyOnly` is the policy, and the recipient sees that choice in the grant.

  The format does not decide which case a regulated custodian must use. That depends on the jurisdiction and the account agreement, and Milestone 1 names it for each target workflow. For events going forward an observer arrangement is simpler.
- **#853 Veilio.** If their authorization object lands first, our grant evidence cites it.
- **#577.** Participant-attested commitments. We reuse components only after checking the licence.
- **#786 Koschei Sentinel.** If their bundle format lands first, we carry our items inside it.
- **#860 refused actions.** We propose a common envelope convention.
- **#879 cantonsim.** cantonsim predicts view decomposition before submission. This format reads views Canton produced and needs no model. Both recompute contract ids for different jobs, and if both are funded they share test vectors.

## 13. Surfaces

```
dpm disclose request --subject P --scope scope.json --purpose "annual audit" --expires 2026-12-31
dpm disclose grant   --request CID --grant-id G [--narrow scope.json] [--standing] [--policy consent-required]
dpm disclose export  --grant CID --out package.json [--deliver sftp://…]
dpm disclose verify  package.json --anchor anchor.json --policy policy.json
```

Libraries: `@canton-disclose/core`, `@canton-disclose/verifier` (browser-safe, no network) and `@canton-disclose/exporter`. The browser verifier is one static page with no backend. A standing-feed service (`dpm disclose feed`) is not in the funded release.

## 14. The CIP

The CIP specifies what the claims mean, the result vocabulary, the policy format and the aggregation rule, and references the package JSON Schema by version for the structure. It requires a conforming verifier to reject every tampered package in the corpus with the specified token. For view-tree and contract-id hashing it references the named Canton release and the test vectors published with this project. If the Canton maintainers publish their own specification of that derivation (option (b) of the Milestone 1 proposal), the CIP adopts it.

## 15. Validation

- **Conformance corpus.** Valid packages for each claim and each token, plus: modified field, swapped item, evidence from another transaction, wrong salt, forged signature, insufficient mediator signatures, duplicate signer, unauthorized signer, wrong synchronizer, historical key change, expired grant, revoked grant, unfiltered topology, non-empty `rollback_context`, universal scope, empty `itemKinds`, the fabricated-but-consistent contract, a directly created `ExportAuthorization` against a live one-shot grant, a second authorization for a second package hash, a missing authorization, a mismatched `packageHash`, an authorization whose time field predates a revocation it follows on the ledger, an acknowledgement signed by the requester, a removed superseding topology serial, an item permitted by party but outside the scope, a named counterparty without consent, a consent whose scope does not cover the item, a consent created after the authorization, a missing notice under `NotifyOnly`, and an instrument admin in `policyExempt` with no consent, which passes.
- **Boundary test.** One transaction with informees on two participants and a sub-node whose informees sit inside the parent's participant set; export for one party; the other party's node must be absent.
- **Non-Registry demonstration (Milestone 4).** One end-to-end disclosure from a custom Daml application that is not a Registry transfer, for a business question from the Milestone 1 workflows: capture and decryption through a KMS path, content bound to accepted transaction evidence, historical signer authority verified, the authorization anchored, nothing outside the scope, and verification repeated with the exporter unreachable.
- **Separability measurement (Milestone 1).** Over the shipped token-standard scenarios with parties on separate participants, published with the tool and the placement.
- **Retention tests.** The five in §9.

## 16. Risks

| Risk | Mitigation |
| --- | --- |
| Views too coarse to disclose on real shapes | measured in Milestone 1 and published; the Committee decides at the gate |
| No sanctioned decrypt path for a node-held key | KMS paths supported; node-held participants run projection mode; question raised with the Canton maintainers |
| Sequencer pruning outruns capture | coverage fields state the earliest recoverable update and gaps |
| Encryption-key rotation destroys anchored history | retention requirement stated as a deployment condition and tested |
| A patch release changes hash derivation silently | raw bytes in the package; exact patch pinning; CI runs the corpus against each release; covered by maintenance |
| The maintainers decline an evidence-export interface | the answer is published; the exporter stays on the current path |
| Contract-id versions differ in recomputation | per-version test vectors from a running node; unsupported versions are a named result |
| Store schema changes between patch releases | the store reader is versioned per patch release and covered by the re-validation CI |
| No external adopter within the window | adoption tranches are not paid; the format and tools still ship |

## 17. Open design questions

1. Does `permittedParties` stay the grant-level expression of the leaf check, or does the grant carry an explicit per-item-kind policy?
2. For a hosted party with no `PartyToKeyMapping`, is `anchor_supplied` the only signer resolution, or should a participant signature count as a weaker signer role?
3. If the Canton maintainers decline an evidence-export interface, is an RSA-2048 participant encryption key in AWS or GCP KMS an acceptable deployment requirement for anchored mode, or should a KMS driver with ECIES be the documented default?
