## Development Fund Proposal

**Author:** Luiz Gustavo Abou Hatem de Liz
**Status:** Draft
**Created:** 2026-05-15
**Label:** canton-apis
**Champion:** Need Champion

---

## Abstract

This proposal requests a grant to deliver CNS V2 — an upgrade to the Canton Name Service that adds native on-ledger metadata support to ANS entry contracts. Today, CIP-0056 (Token Standard V1) and CIP-0112 (Token Standard V2, in progress) both explicitly rely on a workaround that stores structured metadata as JSON inside the free-text `description` field of CNS entries. CIP-0056 calls this out directly:

> "We expect a future CIP to address that limitation."

CNS V2 eliminates this workaround by adding a proper `metadata : TextMap Text` field to `AnsEntry` contracts, extending the Scan API with a by-metadata discovery endpoint, and providing a compatibility shim for existing V1 entries. This enables reliable, on-chain-anchored service discovery for wallets, token registries, oracle providers, and dApps — directly unblocking the service discovery needs of CIP-0112, the proposed Oracle Standard, and the broader Canton ecosystem.

---

## Specification

### 1. Objective

The Canton Name Service currently lacks a standardized mechanism for associating structured key-value metadata with on-chain identities. The description-field workaround used today breaks interoperability when different parties format JSON differently, cannot be queried by key-value pairs, and makes it impossible for wallets and apps to discover services like token registries or oracle feeds without prior knowledge of their CNS names.

CNS V2 solves this with a minimal, focused change: a native `metadata : TextMap Text` field on `AnsEntry` contracts plus a by-metadata Scan API endpoint. The outcome is permissionless, on-chain-anchored service discovery that scales with ecosystem growth, with a clean migration path from V1.

The objective is single-scoped: structured service discovery metadata on Canton Name Service entries.

### 2. Implementation Mechanics

**On-Ledger (Daml / Splice):**

The `AnsEntry` Daml template in the `splice` repository is upgraded to include:

```daml
template AnsEntry
  with
    name        : Text
    owner       : Party
    expiresAt   : Time
    description : Text   -- preserved for backwards compatibility; deprecated for metadata storage
    metadata    : TextMap Text
      -- ^ Namespaced key-value metadata. Keys follow the DNS-subdomain convention
      --   from CIP-0056: <dns-subdomain>/<name>
      --   Standard keys are prefixed with splice.lfdecentralizedtrust.org/
  where
    ...
```

Standard metadata keys defined by this CIP:

| Key | Value Format | Purpose |
|-----|-------------|---------|
| `splice.lfdecentralizedtrust.org/registryUrls` | Comma-separated URLs | Token registry API endpoints (replaces CIP-0056 workaround) |
| `splice.lfdecentralizedtrust.org/serviceType` | Enum string | `token-registry`, `wallet`, `dapp`, `oracle`, `bridge`, `validator`, `other` |
| `splice.lfdecentralizedtrust.org/logoUrl` | URL | 200×200px PNG/JPEG/WEBP logo for wallets and explorers |
| `splice.lfdecentralizedtrust.org/displayName` | UTF-8 string | Human-readable display name |
| `splice.lfdecentralizedtrust.org/homeUrl` | URL | Homepage or documentation URL |
| `splice.lfdecentralizedtrust.org/contactEmail` | Email | Operational contact for the service operator |
| `splice.lfdecentralizedtrust.org/supportedTokenStandards` | Comma-separated | Token standard versions supported, e.g. `v1,v2` |
| `splice.lfdecentralizedtrust.org/dappApiUrl` | URL | CIP-0103 dApp API base URL |

Third-party CIPs and organizations may define additional keys using their own DNS subdomain prefix without requiring a contract upgrade.

**Scan API Extensions:**

1. `GET /v0/ans-entries/by-name/{name}` and `GET /v0/ans-entries/by-party/{party}` — responses gain a `metadata` object field.
2. New endpoint `GET /v0/ans-entries/by-metadata?key={key}&value={value}` — returns a paginated list of ANS entries where the given metadata key equals the given value. Enables wallets to discover, for example, all registered token registries or oracle services without prior knowledge of their CNS names.

**Compatibility Shim:**

Scan nodes implement a shim that, for V1 entries that have not yet set the native `metadata` field, parses the `description` field as JSON and extracts any `meta` sub-object as fallback metadata. This ensures uninterrupted service discovery during migration. The shim is explicitly temporary and will be deprecated once major ecosystem participants have migrated.

**Migration Utilities:**

A command-line migration helper and documentation guide will be provided so existing CNS entry owners can populate the native `metadata` field and clear the JSON workaround from their `description` field.

**Integration Tests:**

The implementation will include tests covering:
- Roundtrip create/read of metadata-bearing ANS entries
- by-metadata endpoint query correctness
- Compatibility shim fallback for V1 entries
- Cross-version compatibility (V1 wallets reading V2 entries and vice versa)

### 3. Architectural Alignment

CNS V2 directly resolves the gap explicitly called out in two active Canton Network standards:

- **CIP-0056 (Token Standard V1):** States that storing metadata in `description` is a workaround and expects a future CIP to address it. CNS V2 is that CIP.
- **CIP-0112 (Token Standard V2, in progress):** Similarly relies on the description-field workaround for service discovery and benefits immediately from CNS V2.

Beyond those dependencies, CNS V2 enables:
- The proposed Oracle Standard (oracle service discovery by `serviceType: oracle`)
- Wallet UX improvements (logo, display name, and homepage for all registered services)
- CIP-0103 dApp connectivity (canonical `dappApiUrl` per CNS name)
- Future on-chain compliance or governance registries keyed to CNS identity

The metadata key format (`splice.lfdecentralizedtrust.org/<key>`) is already established in CIP-0056, so CNS V2 follows an existing Canton Network convention rather than introducing a new one.

### 4. Backward Compatibility

- Existing CNS V1 entries remain fully valid. The `description` field is preserved and its semantics do not change.
- New `metadata` field defaults to an empty `TextMap Text` for entries created before this upgrade.
- The Scan API compatibility shim ensures existing integrations that rely on description-embedded JSON continue to function throughout the migration period.
- Wallets and apps SHOULD prefer the native `metadata` field when present, falling back to the description-field JSON only for V1 entries.

---

## Milestones and Deliverables

### Milestone 1: Specification & CIP Approval
- **Estimated Delivery:** June 2026
- **Focus:** Finalize CNS V2 CIP, collect community feedback, and secure governance approval.
- **Deliverables / Value Metrics:**
  - CNS V2 CIP PR merged to `canton-foundation/cips` and marked "Approved" or "Proposed" (community ratification in progress).
  - Standard metadata key registry published and agreed upon by at least 2 ecosystem stakeholders (e.g., one wallet provider and one token registry operator).
  - Email to `cip-discuss` with draft CIP and explicit discussion of the CIP-0056 / CIP-0112 migration path.

### Milestone 2: Splice Implementation & DevNet Validation
- **Estimated Delivery:** August 2026
- **Focus:** Production-ready implementation of the `AnsEntry` upgrade, Scan API extensions, compatibility shim, and migration utilities, validated on DevNet.
- **Deliverables / Value Metrics:**
  - `AnsEntry` Daml template with native `metadata` field merged to `splice/main`.
  - Scan API exposing `metadata` in existing endpoints and the new `by-metadata` endpoint, live on DevNet.
  - Compatibility shim active on DevNet — existing V1 entries readable via the new API without modification.
  - Migration utility (CLI or script) published and documented.
  - Integration test suite with ≥90% scenario coverage passing in CI.

### Milestone 3: Ecosystem Adoption
- **Estimated Delivery:** September 2026
- **Focus:** Drive adoption of CNS V2 metadata by key ecosystem participants on Mainnet.
- **Deliverables / Value Metrics:**
  - At least 3 independent services migrated to native CNS V2 metadata on Mainnet, covering at least 2 different `serviceType` values (e.g., `token-registry` and `wallet`).
  - At least 1 wallet provider reading and displaying CNS V2 metadata (logo, displayName) in production.
  - Migration guide published and linked from the Canton developer documentation.

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Standard metadata keys definition approved and ratified by the Canton Foundation (M1).
- Native `metadata` field live on Splice DevNet and Mainnet (M2).
- `GET /v0/ans-entries/by-metadata` endpoint operational and documented on Scan (M2).
- Compatibility shim functional for V1 entries throughout migration window (M2).
- Verified on-chain presence of CNS V2 metadata from at least 3 independent ecosystem participants on Mainnet (M3).
- At least 1 wallet displaying CNS V2 metadata to end users in production (M3).

---

## Funding

**Total Funding Request:** 700,000 CC

### Payment Breakdown by Milestone

- Milestone 1 (Specification & CIP Approval): 175,000 CC upon committee acceptance
- Milestone 2 (Splice Implementation & DevNet Validation): 350,000 CC upon merged PR and live DevNet deployment
- Milestone 3 (Ecosystem Adoption): 175,000 CC upon verified Mainnet adoption by 3+ services

### Volatility Stipulation

Since this project is scoped to under 6 months, there is no rebasing on CC price changes. Should the project timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility.

---

## Co-Marketing

Upon release, the implementing entity will collaborate with the Foundation on:

- Announcement blog post describing the CNS V2 upgrade and its ecosystem impact.
- Technical documentation and developer guide on the Canton developer portal.
- Coordination with CIP-0112 (Token Standard V2) and Oracle Standard marketing where applicable, positioning CNS V2 as a shared infrastructure upgrade for the Canton ecosystem.

---

## Motivation

The `description`-field workaround for CNS metadata is explicitly acknowledged as a technical debt in two active Canton Network standards (CIP-0056 and CIP-0112). As the Canton ecosystem scales — with multiple independent token registries, wallets, oracle providers, bridges, and dApps registering Canton Name Service identities — the absence of structured, queryable metadata creates compounding interoperability problems:

- Wallet providers must parse inconsistent JSON formats embedded in a free-text description field.
- There is no way to enumerate "all registered token registries" or "all oracle services" without maintaining an off-ledger directory.
- New ecosystem participants have no authoritative standard to follow when registering their service metadata.

CNS V2 addresses this for the entire Canton ecosystem at once. Every participant that registers a CNS name — estimated to be the majority of the Canton dApp and infrastructure ecosystem as it grows — benefits from reliable service discovery. Token registries, wallets, and oracle providers in particular gain an immediate quality-of-life improvement for both developers and end users.

The implementation scope is narrow and self-contained: a single template field addition and two Scan API extensions. The risk is low, the payoff is high, and the need is explicitly documented in already-approved CIPs.

---

## Rationale

### Why now?

CIP-0112 (Token Standard V2) is currently in progress and explicitly relies on CNS metadata for service discovery. Delivering CNS V2 in parallel with or slightly ahead of the Token Standard V2 rollout (targeting June 2026) ensures that CIP-0112 integrators have the native metadata API available when they go live, rather than having to implement the workaround first and then migrate.

### Why `TextMap Text` rather than a structured record?

The same rationale as CIP-0056 applies: a generic key-value map allows standards, CIPs, and organizations to define new metadata keys independently without requiring a smart-contract upgrade. This design follows the Kubernetes Annotations model and is already the Canton Network convention for token standard metadata.

### Why not store metadata off-ledger?

CNS entries are the canonical on-chain identities for parties and services on Canton Network. Service discovery metadata must be anchored to the on-ledger identity to be trustworthy. Purely off-ledger metadata can become stale or be spoofed without an on-chain anchor. The metadata values themselves are small (URLs, strings), so the on-chain cost is minimal.

### Why not extend CNS with a separate registry contract?

A separate global registry contract would require managing an additional privileged contract, introduce a single point of failure for service discovery, and duplicate identity information already captured in the CNS entry itself. Adding a field to the existing `AnsEntry` template keeps the architecture simple, minimizes new authorization surface area, and leverages the existing CNS governance for all metadata operations.

### Fit into existing ecosystem tooling

This proposal extends what exists rather than replacing it. The `description` field is preserved. The Scan API is extended additively. No existing integration is broken. The compatibility shim explicitly bridges the gap for the migration period. CNS V2 is the minimal change needed to resolve the documented gap.
