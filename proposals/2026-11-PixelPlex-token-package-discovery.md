## Development Fund Proposal: Token Package Discovery

| Field | Value |
| --- | --- |
| Organization | PixelPlex Inc. |
| Author / Primary Contact | Eugene Birski (e.birsky@pixelplex.io); authors Nikita Gerasimenok, Uladzislaŭ Dzemidovich |
| Status | Draft |
| Champion | Needs Champion |
| Proposal Type | Individual initiative |
| RFP / Roadmap Area | N/A |
| Label | dar-app-management |
| Dev Fund PR | [#1116](https://github.com/canton-foundation/canton-dev-fund/pull/1116) |
| CIP Reference | [Token Package Discovery, CIP PR #305](https://github.com/canton-foundation/cips/pull/305) |
| Total Funding Request | 1,980,000 CC |
| Project Duration | 22 months, including a 12-month maintenance period |
| Created | 2026-10-14 |

---

## Abstract

Integrators of CIP-0056 and CIP-0112 tokens get token packages and upgrade announcements by direct message from each issuer. This grant funds the Token Package Discovery CIP, a publisher tool, a client library, and a conformance checker. With them, integrators install and upgrade tokens from claims that the instrument admin publishes in the Canton Credential Registry.

---

## Specification

### 1. Objective

Remove per-integration DAR exchange between token issuers and integrators.

### 2. Implementation Mechanics

The [CIP](https://github.com/canton-foundation/cips/pull/305) specifies the claims, publication rules, and client behavior. The grant delivers:

| Component | Description | Technology |
| --- | --- | --- |
| Specification | The CIP taken through review until the CIP editors confirm it is ready for the Super Validator vote | Markdown |
| Publisher tool | Builds the claims from a set of DARs, publishes and renews them through the Credential Registry Publication API, announces changes with `validUntil` and `validFrom`, and supports external signing | TypeScript |
| Client library | Looks up the claims with BFT reads, downloads the DARs, checks package ids and dependencies, and reports announced changes. Language-neutral test vectors for other implementations cover overlapping, expired, duplicate, and future-dated credentials, cancelled announcements, and subject fallback | TypeScript, JSON |
| Conformance checker | Checks a published instrument: claims complete, subject encoding, at most 31 packages, every DAR served without an access token with a main package id matching its claim, and the DARs together containing all listed package ids | TypeScript, runnable in CI |
| Documentation | Publisher and integrator guides with DevNet examples | Markdown |

PixelPlex adds support to CC View, its Canton explorer and indexer, and to Console Wallet outside this grant.

### 3. Architectural Alignment

- **[Canton Network Credentials CIP](https://github.com/canton-foundation/cips/pull/204).** The standard is a set of claim properties for the Canton Credential Registry. Discovery, authorization, and BFT reads come from that registry.
- **CIP-0056 and CIP-0112.** The standard covers instruments on either version.
- **[Dev Fund #533](https://github.com/canton-foundation/canton-dev-fund/pull/533), Daml Package Registry.** #533 hosts packages, and this standard lists which packages a token needs.

### 4. Backward Compatibility

*No backward compatibility impact.*

---

## Milestones and Deliverables

### Milestone 1: Specification and Tooling

- **Committed Date:** within 7 months of approval, subject to the availability of the Canton Credential Registry on DevNet
- **Focus:** the CIP and the tools that issuers and integrators use.
- **Deliverables / Value Metrics:**
  - CIP number assigned, reviewer comments resolved or answered, and the CIP editors' confirmation that the CIP is ready for the Super Validator vote.
  - Publisher tool, client library, and conformance checker released under Apache-2.0.
  - DevNet demonstration: an instrument is published, then installed and checked by a separate client node. It is then changed through an announced credential with `validFrom`.

### Milestone 2: MainNet Adoption

- **Committed Date:** within 3 months after Milestone 1, subject to the availability of the Canton Credential Registry on MainNet
- **Focus:** independent issuers and integrators using the standard on MainNet.
- **Deliverables / Value Metrics:**
  - At least 2 independent issuers publish their instruments on MainNet. The `(instrumentAdmin, instrumentId)` pairs are listed in the milestone report.
  - At least 2 independent integrators, other than those issuers, confirm in writing that they install those instruments from the published claims.

### Milestone 3: Maintenance

- **Committed Date:** 12 months after Milestone 2
- **Focus:** maintenance of the released tools.
- **Deliverables / Value Metrics:** quarterly reports covering issue triage, fixes, and compatibility with current Canton and Splice releases.

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone
- Demonstrated functionality or operational readiness
- Documentation and knowledge transfer provided
- Alignment with stated value metrics

Project-specific conditions:

- **Milestone 1:** a Committee reviewer reproduces the DevNet demonstration from the published instructions without PixelPlex assistance.
- **Milestone 2:** a public conformance-checker run passes for each listed instrument. An issuer or integrator counts as independent when PixelPlex neither owns it nor builds its integration.
- **Milestone 3:** each quarterly report links to the public issue tracker, where every issue is triaged within 5 business days.

---

## Funding

### Payment Breakdown by Milestone

| Milestone | Amount (CC) | Estimated effort | Paid upon |
| --- | --- | --- | --- |
| M1: Specification and Tooling | 1,470,000 | 2,000 hours | Committee acceptance of M1 |
| M2: MainNet Adoption | 250,000 | 340 hours | Committee acceptance of M2 |
| M3: Maintenance | 260,000 | 360 hours over 12 months | Four quarterly installments of 65,000 CC, each upon acceptance of the quarterly report |
| **Total** | **1,980,000** | **2,700 hours** | |

The estimates include specification coordination, software engineering, automated testing, documentation, integration support, and maintenance of the open-source deliverables.

### Volatility Stipulation

The project runs longer than 6 months. The grant is denominated in fixed Canton Coin and will require a re-evaluation at the 6-month mark.

---

## Maintenance

After Milestone 3, PixelPlex keeps maintaining the publisher tool, client library, and conformance checker while CC View and Console Wallet use them. The code is public, so another maintainer can take over.

---

## Co-Marketing

- A technical post at Milestone 1 explaining the claims and the client flow for integrator engineers.
- A joint announcement with the Foundation at Milestone 2, naming the adopters who agree to be named.

---

## Motivation

PixelPlex integrates CIP-0056 and CIP-0112 tokens in CC View and Console Wallet. For each token and each upgrade, the DARs arrive from the issuer in direct messages, and the package ids are checked by hand. Every wallet, exchange, custody backend, and explorer that integrates these tokens repeats the same work. Token issuers carry the same cost from their side, as noted in a [comment on CIP PR #277](https://github.com/canton-foundation/cips/pull/277#issuecomment-6919593270).

---

## Rationale

The standard extends the Credentials CIP without changing it, in the same way the Credentials CIP publishes the CIP-0056 registry URLs. Two alternatives were considered. A packages endpoint in the CIP-0056 registry API needs an API change in every registry and gives no on-ledger record. A token index inside Dev Fund #533 has no link to the instrument admin's authorization. The [CIP](https://github.com/canton-foundation/cips/pull/305) explains the remaining design choices in its Rationale.

---

## Constraints, Limitations and Out of Scope

- **Dependency on the Credentials CIP.** Milestone 1 needs the Canton Credential Registry on DevNet, and Milestone 2 needs it on MainNet. If its release slips, the affected milestone moves with it. If the registry is not on MainNet within 6 months after Milestone 1, the Committee may accept Milestone 2 on TestNet. The deliverables depend on these parts of the Credentials CIP: self-published credentials, the Credential Lookup API with `effectiveOnly`, `synchronizerTimes`, last-write-wins ordering and BFT reads, `CredentialFactory_UpdateCredentials`, the validity period fields, and the Canton Credential Registry limits. PixelPlex updates the CIP and the tools for a change to any of them before Milestone 1 closes. Other changes to the Credentials CIP do not affect this grant.
- **DAR distribution.** Digital Asset presented its view on DAR distribution to the Tech & Ops Committee on 2026-11-25. In the CIP, only the `cip-xxxx/dar-<mainPackageId>` claims depend on how DARs are distributed. PixelPlex will join any resulting special interest group.
- **CIP editors.** Milestone 1 depends on the CIP editors confirming that the CIP is ready for the Super Validator vote, which PixelPlex does not control.
- **Out of scope.** Public data about holdings, holders, and activity can become a separate, optional CIP.
- **Boundary with Dev Fund #533.** Hosting, version resolution, and audit attestations are non-goals of the CIP. No deliverable of this grant duplicates a #533 milestone.
