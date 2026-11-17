## Development Fund Proposal

| Field | Value |
| :---- | :---- |
| Organization | Fairmint Inc., in partnership with Blockworks |
| Author / Primary Contact | Fairmint: Boris Nelkin (Head of Strategic Initiatives) and Nick Mancuso (Protocol Lead) |
| Status | Submitted |
| Created | 2026-09-17 |
| Proposal Type | RFP-aligned |
| RFP / Roadmap Area | RFP-11 Public Verifiability (Financial Markets, Standards and Verification) |
| Champion | IntellectEU |
| Total Funding Request | 2,400,000 CC |
| Project Duration | Delivery 4 months. Maintenance commitment 12 months after Milestone 2, funded inside Milestone 2 |
| Label | canton-apis |

Confirmed individual at the champion organization: Jonathan Mayeur
([@jonathan-ieu](https://github.com/jonathan-ieu)).

---

## Abstract

Canton keeps asset activity private by design, so analysts, media, and index
providers lack the aggregate facts every market runs on: how much of an asset
exists, how much was issued or redeemed, how much moved. An application that
wants coverage today hands a bespoke API to each data platform, and each
platform writes a one-off integration.

This proposal funds the Canton Asset Data Feed (CADF): an open, pull-based feed
format for asset-level metrics, modeled on RSS. Any Canton application can
publish one, and any data platform can poll it with a generic client. One
envelope carries every asset class, and a short profile per class fixes the
vocabulary. Each daily snapshot is committed on Canton, as a Merkle root or in
full, so what a publisher declared, and how, can later be checked by anyone
against the record and by authorized parties against the underlying books.

The grant ships the specification, an open-source reference publisher and
consumer, a conformance validator, a governance process for the standard, and
two production feeds: Fairmint's onchain private-company equity registers
(Milestone 1), and a second asset class published by another party, which
adopts the format for its own data (Milestone 2). Blockworks is the first
consumer.

---

## Specification

### 1. Objective

**Problem:** A Canton application has no standard way to publish aggregate
asset metrics, and the numbers it does publish carry no evidence a reader can
check. RFP-11 names this gap: standardized tooling for issuers to publish
public aggregates of activity and value.

**Outcome:** A specification with two publication modes and the declaration
contract. Two feeds, Fairmint's `equity` feed and a second publisher's, both
anchored on Canton daily and polled by Blockworks in production. An
open-source publisher, consumer, and validator anyone can run against any
feed URL, a governance process that revises definitions without breaking
consumers, and documentation from which an outside developer can publish
unaided.

Restricted profiles are permitted by the format but not delivered here. Out
of scope: an indexer, a proof system, a dashboard, a price oracle, and any
CIP. The publisher decides what it discloses and to whom.

### 2. Implementation Mechanics

#### 2.1 The feed document

A feed is a JSON document served over HTTPS by one publisher, a Canton party.
Items are metric observations.

| Level | Field | Meaning |
| ----- | ----- | ------- |
| Feed | `spec_version` | CADF version, for example `1.0` |
| Feed | `publisher` | Party id, Canton Name Service (CNS) name, display name, signing key id |
| Feed | `network` | `mainnet` or `devnet` |
| Feed | `generated_at`, `next` | Generation time and the cursor for the next page |
| Item | `item_id` | Identifies one immutable observation; consumers dedupe on it like an RSS `guid` |
| Item | `asset` | `id_scheme` (`cip0056-instrument`, `registry-scoped`, `isin`, `cusip`), `id`, `asset_class`, optional `name` and `symbol` |
| Item | `metric` | Vocabulary key, for example `equity/shares_outstanding`; extensions use a DNS-prefixed key |
| Item | `value`, `unit` | Decimal as string; unit from the profile (`shares`, `count`, `usd`, `face_usd`) |
| Item | `as_of` | Point in time, or `period_start` and `period_end` for flows |
| Item | `dimensions` | Profile-defined breakdown keys, for example `class_type=common` |
| Item | `trust` | `declared`, `recomputed`, or `proven` |
| Item | `evidence` | Source ledger coordinates where they exist (record time, migration id, update id, package ids), methodology URL and hash, and the `anchor` block (declaration contract id, update id, record time, mode, root, leaf salt, inclusion path), excluded from the leaf hash |
| Item | `privacy` | `visibility` (`public` or `restricted`), aggregation level (`publisher`, `asset`, or `record`), and the suppression rule applied where the profile requires one |
| Item | `source` | Optional. Data provider and license class when the publisher is not the origin of the data |
| Item | `replaces` | Optional. The `item_id` this item corrects |
| Item | `signature` | Publisher signature over the canonical item, including the anchor |

The same items are served as Atom 1.0 at `/feed.atom` (Appendix C).
Appendix A shows a complete document.

#### 2.2 Asset-class profiles

The envelope is class-agnostic. A profile is a one-page document fixing the
metric vocabulary, required dimensions, and units for one asset class.
Version 1 ships `equity` (Appendix B) and a profile template. A new class such as
`commodity` or `fund` is a new profile; envelope, poller, and validator do not
change.

#### 2.3 Trust and evidence

Every item states how it was produced: `declared`, computed by the publisher
from its own records; `recomputed`, reproducible by anyone from public data,
as Scan allows for Canton Coin; or `proven`, carrying a proof over committed
state, so proof systems proposed in this RFP lane can ride the same feed.
Every item carries the `evidence` block, including, when the snapshot is
anchored, the anchor of the declaration that committed it (section 2.4), and
a publisher signature whose
key is published in the publisher's CNS entry metadata and the feed's
discovery document.

#### 2.4 Declarations and the audit trail

Each daily snapshot produces one **Declaration** on Canton: the Merkle root of
its items, spec and profile versions, methodology hash, `as_of`, and signing
key id. A consumer checks any item it holds against the root; an auditor
later establishes what was declared, when, and under which method. The anchor
does not show the values are correct. That takes access to the underlying
records or a proof in the `proven` tier.

**Two publication modes.**

  **Root mode** puts only the root on-ledger; items travel off-ledger.

  **Full mode** adds the canonical items (the leaf payloads) to the declaration,
  so the signatory and observers read them from Canton without the feed, which
  still serves the stamped, signed items.

In either mode the publisher MAY name observers on the declaration. Public
items are served on the public feed, and restricted items reach only
authorized clients or, in full mode, observers on Canton. Visibility on
Canton is per contract, so a publisher with items for different audiences
uses root mode, where salts hide undisclosed items, or splits full-mode
declarations by audience. Full mode is how records reach an auditor or
regulator on Canton without being published.

**Salted leaves.** Each leaf is `SHA-256(0x00 || salt || item)`: 32 fresh
random bytes and the item as canonical JSON (RFC 8785) without
`evidence.anchor` and `signature`. Interior nodes are
`SHA-256(0x01 || left || right)` as in RFC 6962, and an inclusion path lists
sibling hashes with sides. Salts are independent per leaf and revealed only
with their item, so holding the root and some items does not let anyone
confirm guesses about the rest. A publisher for whom the item count is
sensitive MAY pad the tree with empty salted leaves to a fixed depth. Order
of operations: compute the root, create the declaration, stamp each item's
`anchor` (contract id, update id, record time, salt, inclusion path), sign
the completed item. The publisher never archives a declaration: a superseded
one stays active beside its correction, and its created-event blob verifies
either way.

- **Implementation.** A minimal `CadfDeclaration` Daml template with the
  fields above (plus the items in full mode), publisher as signatory. If the
  Kaiko Data Standard `DataPoint` interface lands in Splice and fits this
  payload, the template implements it without changing the feed. CADF adds
  no other on-ledger vocabulary.
- **Corrections.** A correction is a new declaration referencing the
  contract id it supersedes. Items are never mutated, so committed leaves
  keep verifying: the replacement carries a new `item_id` for the same
  `as_of` and names the original in `replaces`, and the feed lists
  supersessions at document level.
- **Archive.** `/archive/<date>` retains every snapshot with its declaration
  reference, methodology version, salts, and evidence manifest for the life
  of the feed, under the items' visibility rules. The archive is part of
  conformance.
- **Observers and disclosure.** Observers named at creation read
  declarations from their own participants. The public feed carries the
  created-event blob of every root-mode declaration, and of a full-mode
  declaration only when all its items are public, because the blob is the
  payload. With the blob, a Canton application can reference the declaration
  in its own transactions through explicit contract disclosure. Confirming a
  declaration on Canton takes Ledger API access as the publisher or an
  observer; offline, a reader verifies items against the signed root. Both
  observer naming and blob publication are automatic in the reference
  publisher.
- **Rule strength.** The launch feeds MUST anchor every snapshot. Other
  publishers SHOULD in version 1.0; `cadf validate` reports `anchored` per
  snapshot either way, so consumers can prefer anchored feeds, and the review
  group may promote SHOULD to MUST later.

Mode and frequency tradeoffs:

| Option | On-ledger footprint | Cost | Timestamp precision | Complexity |
| ------ | ------------------- | ---- | ------------------- | ---------- |
| Root mode, daily (default) | One small contract per feed per day, a few kilobytes | Negligible at current extra-traffic prices | Daily | Low; the publisher already runs a daily job |
| Root mode, event-driven | One declaration per event or correction, minutes after it | Scales with event volume | Minutes | Higher; the publisher must sequence declarations continuously |
| Full mode, either frequency | Adds the items to each declaration | Grows with item count and observer count | As chosen | One observer set per contract; split declarations when audiences differ |

The launch feeds use root mode daily and MAY add event-driven declarations
for corrections. Full mode and restricted items are options, never required.

#### 2.5 Visibility and disclosure rules

Each item states its visibility and aggregation level. Disclosure rules live
in profiles, not the envelope, so one format serves public aggregates and
authorized private records:

- A **public aggregate profile** requires `public` visibility and a
  suppression rule (for example a minimum count below which a value is
  withheld), and forbids holder party ids and single position quantities.
- A **restricted profile** MAY carry record-level items marked `restricted`.
  They never appear on the public feed and reach only authorized clients or,
  in full mode, observers on Canton, as section 2.4 describes.

Every version 1 metric is application-provided. The format reads no mediator
metadata or other protocol exposure that may change.

#### 2.6 Transport and discovery

Consumers pull. `/.well-known/canton-asset-feed.json` lists a publisher's
feeds, signing keys, observer parties, and profiles. Feed pages support
`since` cursors and `ETag` with `If-None-Match`, so a daily poll costs one
request when nothing changed. Publishers SHOULD emit a daily snapshot at UTC
close and MAY emit event items between. The discovery URL is also written to
the publisher's CNS entry metadata, the `meta` record CIP-0056 specifies for
registry discovery (stored in the entry's description field until CNS gains
native metadata). A publisher that already advertises a Token Standard
registry URL there serves the discovery document under that prefix instead,
with no extra CNS key.

#### 2.7 Reference publisher

An open-source service (Apache-2.0) driven by a metric definition file that
maps each profile metric to a query against the Participant Query Store
(PQS), an application database, a provider API, or Canton Index output. It
applies the profile's disclosure rules, salts and hashes items, writes the
daily declaration in root or full mode, stamps and signs, archives, and
serves JSON and Atom. Fairmint runs the equity feed on it; the second
publisher runs its own instance, or its own implementation checked by the
validator.

#### 2.8 Reference consumer and validator

`cadf validate <url>` checks schema, signatures, profile conformance and
visibility rules, cursor behavior, archive availability, and anchoring, and
prints a report. Anchor checks run offline: salted leaves and inclusion paths
against the signed root. Given Ledger API credentials for the publisher or an
observer, it also confirms the declaration, its contract id, and its root on
Canton; otherwise it reports that step as not performed. The
reference consumer polls feeds into CSV and JSONL for a warehouse, and a
mapping guide written against the Blockworks integration shows how a data
platform maps profile metrics to its own catalog.

#### 2.9 Milestone 1 feed: Fairmint onchain equity (private companies)

Fairmint, an SEC-registered transfer agent, operates the Open Cap Table
Protocol on Canton for private companies. It publishes the `equity`
profile (public aggregate) as a single daily aggregate across every
private-company register it operates, computed from the official projections
it commits onchain: shares outstanding, split into common and preferred,
shares issued in the period, holders of record, and the aggregate valuation
of the companies in scope at their most recent priced round. No company-level
item is published, with or without consent: a single aggregate, with the
profile's suppression rule applied to daily changes, is what keeps any one
register unidentifiable. Public-company equity recorded natively on
Canton will be a separate profile under section 2.11, since public issuers
control their own disclosures. Fairmint is the registry, not the issuer, and
does not sell customer data.

#### 2.10 Milestone 2 feed: a second publisher

Another Canton application or data provider will publish a conforming feed
using its own data. Its profile is proposed and merged under section 2.11,
the first run of the governance process. Fairmint supplies the publisher
software, the validator, and onboarding support, and does not republish the
second publisher's data.

#### 2.11 Governance of the standard

- **Canonical home.** One public repository: `spec/` for the envelope,
  `profiles/<class>/` for versioned profiles, `extensions/` where any
  publisher registers a DNS-prefixed key without approval.
- **Who approves.** A review group of publishers and consumers on record,
  Fairmint and Blockworks at launch. Every change is a pull request with a
  public comment window and needs one publisher and one consumer approval.
- **Adding a metric or profile.** A proposal carries a definition, unit,
  dimensions, and methodology note; a new profile also states its disclosure
  rules (public aggregate or restricted record-level). An extension used by
  two publishers, or requested by a consumer, is proposed for the profile.
- **Versioning.** A published definition never changes meaning; a revision
  is a new key. Profiles carry versions, and every declaration names the
  profile version and methodology hash it was computed under, so historical
  statements keep their meaning.
- **Deprecation.** Deprecated keys carry a sunset date and a validator
  warning, never a hard break inside a major version. Corrections follow
  section 2.4.
- **Ownership.** Fairmint stewards the repository during the funded window.
  Afterwards Blockworks and Fairmint co-steward under the same process,
  Blockworks leading the consumer side, and any publisher or consumer on
  record may join the review group. No further grant funding is needed:
  consumer-side stewardship serves Blockworks' data business, and
  publisher-side stewardship is part of running Fairmint's equity feed and
  onboarding publishers.

### 3. Architectural Alignment

**RFP-11 Public Verifiability.** The RFP's ladder runs from standardized
issuer-published aggregates to trusted execution and zero-knowledge proofs.
CADF is the first rung, committed daily on the Global Synchronizer, and
through the `trust` field the delivery format for the higher rungs. Full mode
with observers uses ordinary Daml visibility for the selective disclosure to
approved parties the RFP describes. RFP-20 asks data proposals to name their
data class and survive changes in publicly exposed metadata; CADF is
publisher-provided and declares its class.

**CIP-0056 and CIP-0112.** Token Standard instruments are identified by
`InstrumentId`, which CIP-0112 keeps, so one `id_scheme` covers V1 and V2
registries; `registry-scoped` identity exists because many Canton assets, cap
table positions among them, are not Token Standard instruments. The Token
Metadata API returns current instrument facts, including total supply where
the registry reports it; CADF adds history and flows, and reuses the CNS
metadata record CIP-0056 defines for discovery (section 2.6).

**2026 to 2028 roadmap.** The roadmap names public verification of private
transactions through aggregate metrics with selective disclosure as a target
capability. CADF is the publisher-provided path to that capability, and it
builds no indexer of its own.

#### Non-duplication

| Existing work | What it does | Relationship |
| ------------- | ------------ | ------------ |
| Kaiko Data Standard (PR #113, approved 2026-05-27; Splice publication pending) | Proposed on-ledger `DataPoint` and `Quote` Daml interfaces for oracle data and application metrics | Different layer. CADF delivers off-ledger; its declaration template implements the Kaiko interface once published, if the payload fits |
| Kaiko Data On-Ramp and Off-Ramp (commercial) | Publishes reference rates on Canton and distributes aggregated Canton data to subscribers through Kaiko's API | Adjacent. Off-Ramp is licensed distribution of one provider's data; CADF is the open format any publisher, Kaiko included, can use for what it makes public, and leaves licensed distribution untouched |
| Merkle ACS Sidecar (o1Labs, PR #577, open, RFP-11 lane) | Per-participant service that Merkle-commits selected ACS contract fields, anchors roots externally (Canton to EVM bridge first), and serves inclusion and non-inclusion proofs | Different object. The sidecar attests raw ledger state to external verifiers; CADF publishes declared aggregate metrics in a shared vocabulary with roots anchored on Canton. A CADF publisher could back `recomputed` or `proven` items with sidecar commitments |
| Temple to Blockworks integration (live dashboard) | One venue's bespoke API feeding one data platform | The pattern CADF standardizes so the next application does not need a bespoke build |

### 4. Backward Compatibility

*No backward compatibility impact.* CADF is a new off-ledger format whose only
ledger writes are its own declaration contracts. It does not modify Splice,
Token Standard packages, OCP, or any deployed asset.

---

## Milestones and Deliverables

Two milestones. Build work can overlap.

### Milestone 1: Specification v1 and the Fairmint equity feed

- **Estimated Delivery:** 2 months after approval
- **Focus:** Publish the envelope and the `equity` profile, release the
  tooling, and put Fairmint's equity feed live on MainNet data with a
  consumer pulling it.
- **Deliverables / Value Metrics:**
  - Public repository (Apache-2.0) with the CADF specification: envelope,
    both publication modes, salted leaf construction, the `equity` profile,
    a profile template for further classes (definition, unit, dimensions,
    methodology note, disclosure rules), JSON Schema, Atom mapping, signing
    and discovery rules, visibility rules, and a written enforceability
    boundary (what the validator checks versus what stays publisher trust).
  - Reference publisher and `cadf validate` released with test vectors.
  - **Fairmint equity feed live** at a public URL: at least 14 daily
    snapshots within 21 days on MainNet data, passing `cadf validate`, each
    anchored by a MainNet declaration with a published contract reference, at
    least one of them a superseding declaration exercising the corrections
    path, and every snapshot served from the archive.
  - **Blockworks, first adopter:** Blockworks fetches and validates the feed
    and attests to it in writing.
  - Verification methodology published: how any reader checks a
    declaration's integrity (signature, salted leaves, inclusion paths, root),
    and how a reviewer with access to the underlying records recomputes a
    declared aggregate under the stated method.
  - Governance document version 1 (section 2.11) published, and the review
    group formed with Fairmint and Blockworks on record.

*Acceptance for M1: the Fairmint feed URL with 14 daily snapshots within 21
days, their declaration contract references including one superseding
declaration, a passing validator report, and a written pull attestation from a
non-Fairmint party.*

### Milestone 2: Second publisher, Blockworks in production, and 1.0

- **Estimated Delivery:** 2 months after Milestone 1 (may start in parallel)
- **Focus:** Prove the format with a second publisher in a second asset
  class, on the consumer side in production, and freeze it.
- **Deliverables / Value Metrics:**
  - **Second publisher live** (section 2.10): the feed passes
    `cadf validate`, is anchored daily, and carries the publisher's written
    confirmation; its profile is merged under section 2.11 with the public
    record.
  - **Blockworks consumes CADF in production:** at least one Canton series
    from each launch feed is live on a public Blockworks analytics page or in
    its data API, with written confirmation from Blockworks.
  - Reference consumer with CSV and JSONL sinks, and the data-platform mapping
    guide (section 2.8).
  - Discovery through CNS entry metadata demonstrated for both feeds.
  - **Docs usability check:** an external developer, to be named, stands up a
    conforming feed from the published documentation alone and attests to it
    in writing with a public feed URL.
  - **Specification 1.0 freeze**, after the second publisher's profile has
    been merged under section 2.11.
  - Adoption note and maintenance start: who published, who consumed, what
    changed before 1.0, and the 12-month maintenance contact.
  - **Further publishers (unfunded commitment):** onboarding of additional
    publishers and profiles continues through the maintenance window at no
    cost to the fund.

*Acceptance for M2: the second publisher's feed URL with its daily
declaration references, and written confirmation from that publisher and
from Blockworks.*

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on the deliverables
listed for each milestone and the italic acceptance lines above. The italic
lines are the payment gates; each is a yes/no check from published evidence.

Project-specific conditions:

- **Verification access.** For the launch feeds, a reviewer designated by the
  committee can pick any past date, resolve its declaration on Canton, match
  the archived snapshot, salts, and inclusion paths to it, and recompute the
  declared aggregates with access to the underlying records under
  confidentiality terms: Fairmint's official projections for the equity
  feed, and the second publisher's records under the same condition, which
  its written confirmation accepts.
- **Privacy floor.** No single position, holder party id, or single company's
  value appears on either launch feed. An item that does fails validation and
  counts toward no milestone.

---

## Sustainability

Fairmint runs a Canton validator and Featured App infrastructure today and will
run the equity feed in production and support the second publisher's, so
maintenance is tied to Fairmint operations:

- Maintain the specification, reference publisher, consumer, validator, and
  documentation for 12 months after Milestone 2 acceptance: security fixes,
  Canton and Splice compatibility, profile reviews for new asset classes, and
  publisher onboarding. This window is funded inside Milestone 2.

---

## Funding

**Total Funding Request:** **2,400,000 CC**

### Payment Breakdown by Milestone

- Milestone 1 *(Specification v1 and the Fairmint equity feed)*:
  **1,000,000 CC** upon committee acceptance
- Milestone 2 *(Second publisher, Blockworks in production, and 1.0)*:
  **1,400,000 CC** upon committee acceptance

**1,400,000 of 2,400,000 CC (58%)** is paid only on the second publisher's
feed in another asset class. Milestone 1 is priced at cost and requires Blockworks to pull the feed.

### Cost Basis

CC amounts use the 30-day average CC/USD price on the submission date
(CoinGecko), recalculated on committee approval.

| Milestone | Effort | Covers |
| --- | --- | --- |
| M1, 1,000,000 CC | About three and a half senior person-months | The specification, the reference publisher and validator, and the Fairmint equity feed. About 1/3 of the time is review cycles, legal review of the disclosure rules, governance set-up, and coordination with Blockworks and the champion |
| M2, 1,400,000 CC | About two and a half senior person-months, plus the 12-month maintenance window | Second-publisher onboarding and profile review, the reference consumer and mapping guide, the external docs trial, and the 1.0 freeze. Maintenance and publisher onboarding for 12 months after acceptance |

---

## Demand Evidence and Adoption

- **Blockworks** (partner and first consumer) operates tokenized-asset
  analytics for public chains and already integrates one Canton venue through
  a bespoke API. Blockworks will consume both launch feeds in production
  (Milestone 2) and has told Fairmint it intends to extend coverage to further
  Canton asset classes through the same format.
- **Second publisher** (Milestone 2): discussions with a candidate are under
  way. It is named here when its written confirmation is received.
- **Third-party analytics demand on the public forum.** On 2026-07-21 Top
  Ledger asked which read path a third-party analytics provider should use on
  Canton; the only answer pointed to PQS, the node operator docs, and an
  onboarding sequence. No standard publication path exists for applications
  to meet that demand.

---

## Co-Marketing

Upon release, Fairmint will collaborate with the Foundation on:

- Announcement of the specification and the first two production feeds.
- A joint Blockworks research note using CADF data, and a Foundation technical
  blog on publishing public facts from a private network.
- A SIG walkthrough for application teams that want to publish a feed, and a
  listing of conforming feeds in ecosystem documentation (if required).

---

## Motivation

Regulated assets are settling on Canton, and almost none of that shows up
where markets form opinions. CADF changes that without giving up transaction
privacy.

---

## Rationale

Consumers of the public feed need no account and no contract with the
publisher, which is what lets a data platform without a Canton party consume
it. Waiting for proof systems was considered and rejected: they still need a
delivery format, and the `trust` field makes proven items consumable when
they land.

---

## Appendix A: Example feed document

```json
{
  "spec_version": "1.0",
  "publisher": {
    "party_id": "fairmint-ocp::1220...",
    "cns_name": "fairmint.cns",
    "display_name": "Fairmint Onchain Transfer Agent",
    "signing_key_id": "cadf-2026-a"
  },
  "network": "mainnet",
  "generated_at": "2026-09-17T00:05:00Z",
  "next": "eyJzaW5jZSI6IjIwMjYtMDktMTcifQ",
  "items": [
    {
      "item_id": "fairmint-ocp:equity/shares_outstanding:all:2026-09-16",
      "asset": {
        "id_scheme": "registry-scoped",
        "id": "fairmint-ocp:all-registers",
        "asset_class": "equity"
      },
      "metric": "equity/shares_outstanding",
      "value": "184213977",
      "unit": "shares",
      "as_of": "2026-09-16T23:59:59Z",
      "dimensions": { "class_type": "all" },
      "trust": "declared",
      "evidence": {
        "record_time": "2026-09-17T00:04:12Z",
        "migration_id": 4,
        "update_id": "1220...",
        "package_ids": ["<ocp-package-id>"],
        "methodology": "https://<publisher>/cadf/methodology/equity-v1.md",
        "methodology_sha256": "<hash>",
        "anchor": {
          "contract_id": "00ab...",
          "update_id": "1220...",
          "record_time": "2026-09-17T00:06:40Z",
          "mode": "root",
          "merkle_root": "<hash>",
          "leaf_salt": "<base64, 32 bytes>",
          "inclusion_path": [
            { "hash": "<hash>", "side": "right" },
            { "hash": "<hash>", "side": "left" },
            { "hash": "<hash>", "side": "right" }
          ]
        }
      },
      "privacy": { "visibility": "public", "aggregation": "publisher", "suppression": "min-count-5" },
      "signature": { "key_id": "cadf-2026-a", "alg": "ed25519", "sig": "<base64>" }
    }
  ]
}
```

Values shown are illustrative; the example shows one item from a larger
snapshot. The leaf hash covers the salt and the item without
`evidence.anchor` and `signature`; the signature covers the completed item.
An item whose data originates with a third party adds
`"source": { "provider": "<name>", "license": "<license class>" }`. A
correction adds `"replaces": "<item_id>"`.

## Appendix B: Version 1 profile

The `equity` profile is a public aggregate profile (section 2.5). Restricted
record-level profiles (a holder statement, an auditor extract) fit the same
envelope and are not part of version 1.

### `equity`

Version 1 covers private-company registers and is deliberately small: one
aggregate across every register the publisher operates. Further metrics are
added as profile revisions under section 2.11.

| Metric | Unit | Notes |
| ------ | ---- | ----- |
| `equity/shares_outstanding` | shares | Outstanding quantity across all registers at `as_of`, repeated per `class_type`; a scale measure, not a value |
| `equity/shares_issued` | shares | Quantity issued across all registers in the period |
| `equity/holders_count` | count | Holders of record at `as_of`, summed across registers |
| `equity/valuation_usd` | usd | Sum over the companies in scope of the valuation recorded at each company's most recent priced round. The valuation rule is part of the profile methodology and hashed into every declaration |

Dimensions: `class_type`, either an OCF stock class type (common, preferred)
or `all` for the total. Only `shares_outstanding` is split by class; the
other metrics carry `all`. There is no `company` dimension: any
company-level item would let a reader count and identify registers, so the
profile publishes one aggregate only. Public-company equity is a separate
profile (section 2.9).

## Appendix C: Atom mapping

| Atom 1.0 | CADF |
| -------- | ---- |
| `feed/id`, `feed/title`, `feed/author` | Publisher party id, display name, CNS name |
| `feed/updated` | `generated_at` |
| `entry/id` | `item_id` |
| `entry/updated` | `as_of`, or `period_end` for flows |
| `entry/title`, `entry/summary` | Human-readable metric, value, unit, and `as_of` |
| `entry/category` | `asset_class` and `metric` |
| `entry/link rel=alternate` | Methodology URL |
| `entry/content type=application/json` | The full JSON item, including `trust`, `evidence` with its `anchor`, and `signature` |
| Autodiscovery | `/.well-known/canton-asset-feed.json` and CNS entry metadata |

A generic Atom reader renders title, summary, and links. Verification uses
the embedded JSON item.
