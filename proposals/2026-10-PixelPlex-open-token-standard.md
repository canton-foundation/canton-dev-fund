## Development Fund Proposal

**Author:** PixelPlex Inc. (Nikita Gerasimenok, Vladislav Demidovich)
**Status:** Draft
**CIP Reference:** [https://github.com/canton-foundation/cips/pull/277](https://github.com/canton-foundation/cips/pull/277)
**Created:** 2026-10-05
**Label:** token-asset-standards

**[Champion](https://github.com/canton-foundation/canton-dev-fund/blob/main/sig-directory.md):** Need Champion

---

## Abstract

CIP-0056 says how to hold, transfer, allocate, and settle a token. It does not say how a node outside the issuer's gets the packages written for that token, or where the token's registry lives. Today both arrive by personal message, and every wallet keeps its own map from admin party to registry URL. This proposal funds the **Open Token Standard**, which closes that gap on top of the token standard (CIP-0056 and CIP-0112) without changing it:

- a public, per-package distribution route, so a node downloads, audits, and vets exactly the packages a token adds;
- one small on-ledger contract per token, implementing the `OpenToken` interface, whose contract id is the token's id, whose view names the instrument and its publication URL, and whose choice `OpenToken_Ping` changes nothing and checks the instrument and publication URL the client passes against that view;
- version and migration announcements, so integrators learn what is changing, and whether they have to act, before a transfer or an allocation;
- a default token: a complete, audited V1 and V2 token-standard implementation that issuers deploy as is or copy as the starting point for their own token;
- mutual exchange of publication URLs between admins, so finding one publication leads to the others;
- public reads of holdings, holders, activities, and transaction history under that same contract id. The body is that token's values. A response that is only a message means the token has none of that read.

The routes are public, under their own path segment `/registry/open-token/v1`. An admin serves them at a publication URL: the same URL as its CIP-0056 registry, or its own URL when an operator runs the registry. Either way the registry needs no change.

The normative documents already exist as drafts and are part of this submission:

- [cip-xxx-open-token-standard.md](https://github.com/canton-foundation/cips/pull/277/changes#diff-039e3088c54bd4ccdd24f4c2811a84dc03dc2970e3a369628624d5730689f341): the CIP (what the publisher owes, the on-ledger contract, the public reads, the default token, peer exchange, verification).
- [open-token-http-api.md](https://github.com/canton-foundation/cips/pull/277/changes#diff-3625ffb3794a2a181f145097f4099e3bd0188195ab6fc4f97a96806a4ca917d0): the HTTP API for version 1 (paths, JSON shape, errors).

This grant funds taking those drafts through public CIP review, the reference implementation, a conformance suite, an audit, adoption on MainNet, and 12 months of subsequent maintenance. CIP ratification remains a governance decision rather than a guaranteed project deliverable.

---



## Specification



### 1. Objective

Make any CIP-0056 token installable on any node from one public publication URL, with a check the node runs on its own participant, and without bilateral coordination between the issuer's developers and the integrator's.

The single objective is **adoption of one open standard for publishing CIP-0056 tokens**. Every deliverable below serves it: the specification, the Daml packages and token test kit, the reference tooling, the conformance suite, the client verifier, and the launch with real publishers and integrators.

### 2. Implementation Mechanics

**The** `OpenToken` **contract.** Each open token has one active contract that implements the `OpenToken` interface. The view is the CIP-0056 pair `(instrumentAdmin, instrumentId)` and the token's `publicationUrl`, so the admin signs which publication speaks for the token. The interface defines one non-consuming choice, `OpenToken_Ping`. The client passes the `instrumentAdmin`, `instrumentId`, and `publicationUrl` it expects. The choice checks those against the view, checks that `instrumentAdmin` signed the contract, and changes nothing. The body lives in the interface, so no implementation can change it. The contract id is the token's id in the API. Holdings, transfer, allocation, and settlement keep using the pair and never depend on this contract.

**Independent verification.** A client reads the token card, confirms through the CIP-0056 metadata route on the token's registry URL that the admin is `instrumentAdmin`, downloads the interface package and the template package, audits them (for the reference template: three fields and an interface instance), uploads them to its own participant, and exercises `OpenToken_Ping` against the disclosed contract. The ping arguments are the card's `instrumentAdmin`, the card's `instrumentId`, and the publication URL the card came from. The disclosed-contract blob goes through unchanged. The client's participant checks the disclosed contract against its contract id, the admin's participant confirms that the contract is active, and the ping checks that the view matches the arguments. Success means the admin created this contract and its view names that instrument and that publication URL. `registryUrl` is not in the view. After the ping succeeds, the client trusts the card served at that URL, including its `registryUrl`. The package list, the version, the migrations, and the peer links stay statements of that server, bound to the admin through `publicationUrl`. A ping is a real transaction, so a client runs it once per contract id.

**Packages.** The publication lists the packages the token adds beyond Splice, which already carries the token-standard interface packages, by Daml package name and package id, each marked `current`, `planned`, or `deprecated`, with a `dependsOn` order. A second route downloads one package per request as a one-package DAR, and only when the package is `current`. A `planned` package is announced with a date and is served only after it becomes `current`. The client checks that each upload introduces that package id and no other, and decides itself whether to vet.

**Version and migrations.** A version label with a note of what changed, and announcements that say whether action is required, which version they belong to, when they take effect, and what to change. A client reads them before it builds against the token and before it calls the CIP-0056 registry for a transfer or an allocation, and again before each later change. When the card's default flag is false, it reads the migrations before it assumes the free-form argument maps. This covers changes that are not a new package, such as a new required key in a free-form argument map.

**Default token.** The reference package `open-token-default` holds `DefaultOpenToken` and holding, transfer, and allocation factories that require no extra argument keys. They implement both the V1 interfaces of CIP-0056 and the V2 interfaces of CIP-0112, as CIP-0112 recommends, so V1 and V2 wallets can use the token from the first day. It is a complete asset under CIP-0056 and CIP-0112, on the ledger and on the registry routes, with issuance and burning by the admin, and it is built to be copied: an issuer who needs its own rules starts from this package and its tests instead of from an empty project. The tooling deploys it in one step, with its registry and publication on the same URL, and adds `"open-token-api-v1": 1` to the instrument's `supportedApis`. An admin with a token already deployed publishes it by creating one `OpenToken` contract instead; its packages, flows, and registry stay as they are, even when another operator runs that registry.

**Public reads.** Holdings, holders, activities, and transaction history are public routes under `/registry/open-token/v1/tokens/{contractId}/`. The body is that token's values. A response that is only a message means the token has none of that read. These reads do not move the token. Transfer and allocation stay on the registry URL.

**Peer exchange.** Two admins exchange publication URLs. The offer carries a nonce, and the receiving operator accepts in their own tooling. A first offer is only stored and submits no ledger command. On accept, the receiver runs the registration check, then sends the return. The initiator runs the same check while handling the return, which submits `OpenToken_Ping`, lists the peer, and answers `active`. The receiver lists the peer when that answer arrives. A client follows a peer URL only when both publications list it. There is no public accept route and no network-wide directory. Since every publication lists its peers, the links form a graph, and a client starting from any one publication URL can walk it to reach every connected publication, with no central list behind it. Walking the graph does not verify a token. The client still runs the registration check on each token it uses.

**Work to be delivered by this grant:**


| Component                    | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Technology                                                                                                   |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| Specification                | Take the CIP and HTTP API v1 through the CIP process; incorporate reviewer feedback; obtain a CIP number; publish an OpenAPI description                                                                                                                                                                                                                                                                                                                                                         | Markdown, OpenAPI 3.x                                                                                        |
| Interface package            | `open-token-api-v1`: `OpenToken`, `OpenTokenView`, `OpenToken_Ping`; tests; DAR published with its package id                                                                                                                                                                                                                                                                                                                                                                                    | Daml, Daml Script                                                                                            |
| Default token package        | `open-token-default`: a complete token-standard asset. `DefaultOpenToken`, holdings, and transfer and allocation factories with no extra argument keys, implementing every API CIP-0056 (V1) and CIP-0112 (V2) expect an asset to implement; issuance and burning by the admin                                                                                                                                                                                                                   | Daml, Daml Script                                                                                            |
| Token test kit               | Daml Script tests for every CIP-0056 and CIP-0112 flow, written against the interfaces so an issuer can run them unchanged against a custom token built from the default one                                                                                                                                                                                                                                                                                                                     | Daml Script                                                                                                  |
| Reference tooling            | Open-source publisher server and operator tooling, built as small services with documented interfaces between them: deploy the default token; publish an existing token; serve the CIP-0056 registry routes for the default token; serve catalog, token card, registration, holdings, activities, holders, updates, package list, per-package download, version, migrations, and peers; run peer exchange with operator accept; rate limiting and basic request protections on the public routes | TypeScript (Node.js) by default; any service replaceable in any language; Ledger JSON API; pluggable storage |
| Conformance suite            | Black-box tests that any other implementation runs against its own server to show it satisfies the CIP and HTTP API                                                                                                                                                                                                                                                                                                                                                                              | TypeScript, runnable in CI                                                                                   |
| Client verifier              | Library and CLI for the full client flow: read the card, confirm the admin on the registry URL, download and check one-package DARs, upload in `dependsOn` order, exercise `OpenToken_Ping` with the card's admin, instrument id, and publication URL, then read the version and migrations before a transfer or an allocation                                                                                                                                                                   | TypeScript; usable from any backend                                                                          |
| Security review              | Independent review of both Daml packages (the default factories hold value) and the reference tooling (package serving, peer exchange, input validation)                                                                                                                                                                                                                                                                                                                                         | External auditor                                                                                             |
| Documentation and onboarding | Publisher guide, integrator guide, migration-announcement guide, token developer guide (building a custom token from the default one), worked examples on LocalNet and DevNet                                                                                                                                                                                                                                                                                                                    | Markdown                                                                                                     |


**Operational approach.** The reference tooling runs beside a publisher's own participant with a small data store. It never prepares, executes, or submits an end user's transaction; the client submits that on its own participant. On a peer-offer return the tooling submits its own `OpenToken_Ping` before it answers `active`. A first offer submits no ledger command.

The tooling is split into services, each with one job and a documented HTTP interface to the others:

- a **node connector** that talks to the publisher's participant over the Ledger API (reads contracts, uploads and exports packages, creates the `OpenToken` contract and the default token, and on a peer-offer return exercises `OpenToken_Ping`);
- the **publication API**, the public routes of the HTTP API, with rate limiting and basic request protections;
- the **CIP-0056 registry** for the default token;
- a **package store** that serves one-package DARs from the node or from storage;
- **peer exchange**, with the operator's accept;
- an **operator CLI** that drives deployment, publication, migrations, and peers.

TypeScript is the default for every service. A publisher can replace any one of them with its own, in any language, for example to put the publication API inside an existing backend or to keep its own registry, as long as it keeps the interface. Hosting, language, and URL layout are left to the publisher, and the conformance suite checks the public result.

**Effort estimate (basis for the funding request).**


| Milestone                | Estimated effort                                                             | Notes                                                                                                                                                                                                                                         |
| ------------------------ | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| M1                       | ~10 person-months                                                            | Specification, compatibility and reuse review, and CIP process (~1.5); `open-token-api-v1` and registration tests (~1); production default token implementation (~6); interface-based token test kit (~1.5)                                   |
| M2                       | ~12 person-months                                                            | Node connector and default-token registry (~3.5); publication API and package store (~2); peer exchange and request protections (~1); operator CLI (~1); conformance suite (~2); client verifier (~1.5); LocalNet and DevNet integration (~1) |
| M3                       | ~8 person-months + external audit                                            | Audit preparation, remediation and retesting (~3); production hardening, deployment and MainNet launch (~2); guides and worked examples (~2); first-publisher onboarding (~1)                                                                 |
| M4                       | ~6 person-months for adoption + ~4 person-months for post-launch maintenance | Independent publisher and integrator onboarding (~3); migration and interoperability support (~2); release handover and maintenance setup (~1); maintenance during the 12 months following adoption acceptance (~4)                           |
| **Total planned effort** | **~40 person-months** + external audit                                       | 36 person-months through adoption acceptance and 4 person-months of subsequent maintenance. Labor at 34,000 CC per person-month: 1,360,000 CC.                                                                                                |


The delivery phase lasts approximately 10 months, followed by 12 months of funded maintenance. Delivery requires an average of 3.6 full-time equivalents, with approximately 4 during the implementation and audit phases. Staffing combines Daml engineering, backend/client engineering, QA and integration, with security and operations support. The effort figures include testing, documentation and coordination; they are not all allocated to feature development.

The external audit is a separate allowance of up to **150,000 CC**, drawn at invoiced cost. Its scope covers both Daml packages and the reference tooling, including the value-holding default token, package handling and peer exchange. The auditor and scope are agreed before the review starts, with a code freeze and audit preparation beginning during M2. Unused audit allowance is not drawn.

A separate **140,000 CC contingency reserve** covers approved unplanned engineering, such as Canton/Splice compatibility changes, audit findings beyond the planned remediation effort, or integration issues revealed by independent adopters. At the stated labor rate this is approximately 4.1 additional person-months. It is not part of the planned 40 person-months, is not automatically payable, and requires a documented scope, effort estimate and Committee approval before use. Unused reserve is not drawn. Shared work funded by another grant is excluded.

**Maximum funding request: 1,650,000 CC** = 1,360,000 CC planned labor + up to 150,000 CC external audit + up to 140,000 CC approved contingency.

### 3. Architectural Alignment

- **CIP-0056 and CIP-0112 (Token Standard V1 and V2).** The CIP `Requires: 0056, 0112`. It works for any token-standard instrument, whether it implements the V1 interfaces, the V2 interfaces, or both, and the default token implements both. A token stays the pair `(instrumentAdmin, instrumentId)`, and transfer and allocation keep going through the CIP-0056 registry routes. The standard follows the CIP-0056 conventions: the `supportedApis` key `open-token-api-v1` is the interface package name, like `splice-api-token-metadata-v1`, and the routes sit at `/registry/open-token/v1` next to `/registry/metadata/v1`. A wallet that already reads `supportedApis` finds the standard without a new rule. The routes are separate from the metadata API, so that API keeps evolving with CIP-0056 and CIP-0112 untouched. The migrations route gives tokens a way to announce when they add V2 next to V1.
- **CIP-0103 (dApp Standard).** A CIP-0103 wallet is a natural client: it can install a token through the package routes and run the ping before showing the token to its user, with no change to the dApp API.
- **CIP-0086 (ERC-20 middleware).** `OpenToken` defines no token operations, so it does not compete with an operations interface. Middleware can use the package routes to install a token and the ping to check it.
- **Existing registry deployments.** A registry needs no change for its tokens to be published. The admin serves the publication at the registry URL when it runs the registry, or at its own URL when an operator runs it for many admins. The routes use their own path segment and do not touch any route a registry already serves. An existing token joins by creating one `OpenToken` contract; its packages, factories, holdings, and registry stay as they are.
- **Canton vetting and authorization.** Verification relies on Canton's own checks: package vetting on the client's participant, contract-id authentication of the disclosed contract, confirmation by the admin's participant, and the interface choice, which checks that the view's `instrumentAdmin`, `instrumentId`, and `publicationUrl` match the arguments and that `instrumentAdmin` is a signatory. No new trust root is introduced.
- **Ecosystem priority.** Lower integration cost per token means more applications support more tokens, and new issuers start from a complete, audited token-standard implementation with its tests instead of writing one from scratch.



### 4. Backward Compatibility

*No backward compatibility impact.* The standard is additive and opt-in per instrument. Instrument identifiers, packages, and registry routes that exist today are unchanged, and a registry needs no change for its tokens to be published. An instrument with no `OpenToken` contract and no publication is outside the standard. A registry lists `"open-token-api-v1": 1` in `supportedApis` only when it also serves the publication, and clients that do not recognize the key ignore it. Clients that never read the new routes are unaffected. Changing the meaning of the package list, the registration check, or the two-sided rule for peer links is a breaking change and a new major version (`open-token-api-v2`).

---



## Milestones and Deliverables



### Milestone 1: Reviewed Specification and Daml Packages

- **Estimated Delivery:** Month 3 from approval
- **Estimated Effort:** 10 person-months
- **Focus:** Finalize the proposed standard and its compatibility boundaries, and deliver the on-ledger packages and token test kit.
- **Deliverables / Value Metrics:**
  - CIP submitted to the public CIP process, with reviewer comments resolved or answered. A CIP number and Proposed status are pursued; ratification is not a payment condition because it depends on external governance.
  - HTTP API v1 published as an OpenAPI description consistent with the CIP.
  - Published component-level reuse and funding boundary covering existing package-management work, including Obsidian and PixelPlex's App Metadata & Deployment Standardization proposal. No shared component is charged twice.
  - Supported Canton/Splice release baseline and V1/V2 feature matrix published, including supported account, transfer, allocation and settlement behavior.
  - `open-token-api-v1` and `open-token-default` published as DARs, with package ids recorded in the specification. The default token passes the token test kit for every flow in the published feature matrix.
  - Tests cover supply conservation, mint/burn authority, transfer and allocation authorization, expiry, V1/V2 compatibility, and rejection of an unrecognized registration interface package.
  - Token test kit published with documented setup adapters for custom token implementations.
  - Written feedback from at least 2 external parties, including a token publisher and an integrating backend or wallet, with resulting changes recorded.
- **Planned Labor Funding:** 340,000 CC
- **Contingency Allocation:** Up to 30,000 CC, subject to prior Committee approval.



### Milestone 2: Reference Tooling, Conformance Suite, and Client Verifier

- **Estimated Delivery:** Month 6 from approval
- **Estimated Effort:** 12 person-months
- **Focus:** Implement and verify both sides of the standard, and prepare a stable release candidate for independent audit.
- **Deliverables / Value Metrics:**
  - Open-source reference tooling implements every route in HTTP API v1, default-token deployment, publication of an existing token, and peer exchange.
  - Conformance suite runs in CI and covers successful flows, malformed inputs, package/dependency validation, registration replacement, migration handling, and peer-exchange failure and retry cases.
  - Client verifier library and CLI perform the complete installation and registration flow, with recognized interface package ids and explicit package-vetting decisions.
  - End-to-end LocalNet and DevNet demonstration includes a default token and an existing token whose registry remains on a separate, unchanged server; both are installed and verified by a separate client node.
  - Demonstration includes a migration announcement acted on by the client and a peer link between two independently operated publishers.
  - A Committee reviewer can reproduce the demonstration using published instructions without PixelPlex assistance.
  - Repositories are Apache-2.0, with public issue trackers, deployment instructions and reproducible release artifacts.
  - Auditor selected, review scope agreed, and audit release candidate frozen before M3 review begins.
- **Planned Labor Funding:** 408,000 CC
- **Contingency Allocation:** Up to 50,000 CC, subject to prior Committee approval.



### Milestone 3: Independent Audit and MainNet Launch

- **Estimated Delivery:** Month 8 from approval
- **Estimated Effort:** 8 person-months, plus external audit
- **Focus:** Complete independent review, remediate findings, validate production operations and launch with initial publishers.
- **Deliverables / Value Metrics:**
  - Independent security review of both Daml packages and the reference tooling completed, including remediation retesting within the agreed audit scope.
  - Audit report and remediation status published. No unresolved critical or high-severity finding remains in the production release unless the Committee explicitly accepts a documented exception before launch.
  - Production deployment, backup/restore and upgrade procedures demonstrated, including publication registration replacement and a token migration rehearsal.
  - Publisher, integrator and token developer guides published. Documentation distinguishes the audited default implementation from modified forks requiring their own review.
  - At least 2 tokens published on MainNet, at least one operated by an organization other than PixelPlex, each independently verified with the client verifier.
  - Published compatibility matrix identifies the exact audited package ids, supported releases and known limitations.
- **Planned Labor Funding:** 272,000 CC
- **External Audit Allowance:** Up to 150,000 CC at invoiced cost.
- **Contingency Allocation:** Up to 40,000 CC, subject to prior Committee approval.



### Milestone 4: Ecosystem Adoption and Maintenance

- **Estimated Delivery:** Adoption acceptance at Month 10 from approval; maintenance completion 12 months after adoption acceptance, approximately Month 22.
- **Estimated Effort:** 6 person-months for adoption and handover, plus 4 person-months distributed over the subsequent maintenance period.
- **Focus:** Demonstrate independent adoption and sustain the delivered standard and tooling.
- **Deliverables / Value Metrics:**
  - At least 5 distinct tokens published on MainNet by at least 3 distinct publishers.
  - At least 3 independent integrators use the installation or registration flow in production or a documented pilot.
  - At least 2 active peer links on MainNet between distinct publishers.
  - At least 1 organization other than PixelPlex operates its own deployment and passes the conformance suite. A separately authored implementation is reported as an additional interoperability outcome, not treated as equivalent to operating the reference software.
  - At least 2 independent integrations report time to first successful installation/registration and the number of manual issuer interactions required.
  - Maintenance policy, supported release matrix, security-reporting channel and operational handover published at adoption acceptance.
  - Four quarterly maintenance reports document issue triage, fixes, dependency and supported Canton/Splice updates, release artifacts, and conformance results. Issue triage occurs within 5 business days; security reports receive initial acknowledgement within 2 business days.
  - New protocol major versions, new token features and additional delivery scope require separate agreement; the maintenance commitment covers the declared supported release lines and their compatible updates.
- **Planned Labor Funding:** 340,000 CC: 204,000 CC for adoption and handover, plus 136,000 CC for maintenance.
- **Contingency Allocation:** Up to 20,000 CC, subject to prior Committee approval.

---



## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone
- Demonstrated functionality or operational readiness
- Documentation and knowledge transfer provided
- Alignment with stated value metrics

Project-specific acceptance conditions:

- **M1** requires the published specification submission, OpenAPI description, Daml packages, passing token tests, compatibility and reuse boundaries, and recorded external feedback. CIP ratification or an externally controlled review timeline does not block payment for accepted technical deliverables.
- **M2** requires a Committee reviewer to reproduce the conformance and client flows on DevNet without PixelPlex involvement, plus delivery of the agreed audit release candidate.
- **M3** requires accepted security-review and remediation evidence, production operating procedures, and live MainNet publications verified by a third party. Deployment alone is insufficient.
- **M4 adoption** requires independently confirmed publishers, integrators and deployments. Adopters may be named publicly or confirmed privately to the Committee.
- **M4 maintenance** is accepted quarterly against the published support commitment and maintenance report. Maintenance funding is not released in full at adoption acceptance.
- **Contingency** is payable only for separately approved additional work, evidenced in the relevant milestone report. It does not cover work already included in planned effort or another grant. Moving reserve between milestones requires Committee approval and cannot increase the total funding cap.
- **Sustainability:** PixelPlex maintains the reference tooling, both Daml packages, token test kit, conformance suite and client verifier for 12 months after M4 adoption acceptance. This work is explicitly funded within M4. The code and standard remain public goods, independent of a PixelPlex-hosted service, with documentation sufficient for another maintainer to take over.

---



## Funding

**Total Funding Request:** Up to **1,650,000 CC** (1,360,000 CC planned labor + up to 150,000 CC external audit + up to 140,000 CC approved contingency).

The planned labor comprises **40 person-months at 34,000 CC per person-month**: 36 person-months through adoption acceptance and 4 person-months of post-launch maintenance. Contingency is additional, conditional funding rather than an automatic labor payment. Unused audit and contingency allowances are not drawn.

### Payment Breakdown by Milestone


| Milestone                                                      | Planned labor    | External audit allowance | Conditional contingency | Maximum funding  |
| -------------------------------------------------------------- | ---------------- | ------------------------ | ----------------------- | ---------------- |
| M1 — Reviewed Specification and Daml Packages                  | 340,000 CC       | —                        | 30,000 CC               | 370,000 CC       |
| M2 — Reference Tooling, Conformance Suite, and Client Verifier | 408,000 CC       | —                        | 50,000 CC               | 458,000 CC       |
| M3 — Independent Audit and MainNet Launch                      | 272,000 CC       | 150,000 CC               | 40,000 CC               | 462,000 CC       |
| M4 — Ecosystem Adoption and Maintenance                        | 340,000 CC       | —                        | 20,000 CC               | 360,000 CC       |
| **Total**                                                      | **1,360,000 CC** | **150,000 CC**           | **140,000 CC**          | **1,650,000 CC** |


- **M1:** 340,000 CC upon Committee acceptance, plus up to 30,000 CC for approved and accepted contingency work.
- **M2:** 408,000 CC upon Committee acceptance, plus up to 50,000 CC for approved and accepted contingency work.
- **M3:** 272,000 CC upon Committee acceptance, plus the accepted external audit at invoiced cost up to 150,000 CC, and up to 40,000 CC for approved and accepted contingency work.
- **M4 adoption:** 204,000 CC upon acceptance of the adoption and handover deliverables. Up to 20,000 CC of contingency is payable against approved and accepted additional adoption or maintenance work.
- **M4 maintenance:** 136,000 CC paid in four quarterly tranches of 34,000 CC after acceptance of each maintenance period and report.



### Volatility Stipulation

The delivery phase is approximately **10 months**, followed by **12 months of maintenance**. Funding is denominated in Canton Coin. Remaining scope and funding are reviewed with the Committee at the 6-month mark and before the maintenance phase. Any adjustment requires written agreement; absent an approved amendment, the maximum request remains **1,650,000 CC**.

---



## Co-Marketing

Upon release, the implementing entity will collaborate with the Foundation on:

- Announcement coordination
- Case study or technical blog
- Developer or ecosystem promotion

Specific commitments:

- A technical blog post at the M2 release explaining the standard and the `OpenToken_Ping` check, written for integrator engineers.
- A publisher walkthrough (written and recorded) at M3: deploying the default token, publishing an existing token, and starting a custom token from the default one.
- A joint announcement and a short adopter case study at M4, naming adopters who agree to be named.
- A presentation of the standard at one Canton ecosystem developer call or meetup.

---



## Motivation

A Canton token is not usable on a node outside its issuer's until that node has the packages written for the token and knows where the token's registry is. CIP-0056 standardizes everything after that point. Before it, the issuer's developers and the integrator's developers arrange both by personal message, and again at every change. Wallets keep the map from admin party to registry URL by hand. Many tokens are served by a registry the admin does not run, and their admins have no way to publish this on their own.

That fails in the same way for three groups. Issuers have no standard place to put the packages their contracts need. Integrators learn each token from scratch. Users inherit the cost, since applications support few tokens.

**Ecosystem impact.** The standard applies to every CIP-0056 token that wants to be integrated by parties other than its issuer. Wallets, custody backends, exchanges, and application backends that integrate more than one token benefit, because the steps are the same for each token. Issuers who only need a fungible token get a working default deployment, and issuers with their own rules get a complete implementation and test kit to start from. M4 sets concrete adoption targets (5 tokens, 3 publishers, 3 integrators, 2 peer links) rather than a share of the ecosystem.

**Public good.** The CIP and HTTP API are CC0. The Daml packages, token test kit, reference tooling, conformance suite, and client verifier are open source. Any publisher can run its own deployment or write its own implementation and prove interoperability with the conformance suite.

**Sustainability.** See the maintenance commitment in Acceptance Criteria.

---



## Rationale

**Why a new CIP rather than extending CIP-0056.** CIP-0056 defines how to hold, transfer, allocate, and settle an instrument, and how a registry returns choice context once a client knows that registry. It does not cover getting the packages onto a node, a verifiable token id, change announcements, or finding the registry. Adding these to CIP-0056 would touch flows that work today in every implementation. This standard requires CIP-0056 and CIP-0112, follows their naming, and adds only new routes and one new contract per token. The metadata API has grown by adding fields; package bytes and a disclosed contract need routes of their own, so they sit in a separate segment.

**Why one contract with a ping defined in the interface.** A contract id returned over HTTP is only the server's claim. Exercising a choice makes Canton authenticate the disclosed contract against its id, and makes the admin's participant confirm that it is active. Because the choice body lives in the interface, every token runs the same check: the view matches the `instrumentAdmin`, `instrumentId`, and `publicationUrl` the client passes, and that admin is a signatory, regardless of how the template is written. The client passes the disclosed-contract blob through unchanged. The reference template is small enough to audit in minutes. One contract per token gives one id and one thing to audit.

**Why one package per download.** Nodes vet package ids one at a time. A bundle that mixes packages, or a list of CDN links, skips that. One package per route is the unit a node uploads, audits, and vets.

**Why version, package status, and migrations are separate.** Package status says which package ids are `current`, `planned`, or `deprecated`. The download route serves a package only when it is `current`. Status does not say what an integrator has to change, and a new required key in a free-form argument map is not a new package at all. A migration says whether an integrator has to act, by when, and how. The client reads the version and the migrations before a transfer or an allocation.

**Why a default token.** Many issuers only need a fungible instrument. A deployment with no extra argument keys, implementing V1 and V2, lets any token-standard wallet integrate it with no token-specific code, and gives the network an audited baseline. It differs from CIP-0112's `TestTokenV2`, which exists to exercise every V2 workflow in testing: the default token is a production deployment that the tooling sets up in one step. It is also the fastest way to start a custom token: an issuer copies a complete, audited implementation and its test kit, changes only its own rules, and publishes the result under the same standard.

**Why a publication URL separate from the registry URL.** Registries are often run by an operator for many admins. If the routes had to sit on the registry URL, each admin would need its operator to add them. With a separate publication URL, signed into the `OpenToken` contract, any admin publishes on its own and no registry changes.

**Why mutual exchange and not a directory.** A directory of every registry is a different problem, closer to a public list of RPC endpoints, and is left to community lists. A two-sided exchange, with each side verifying the other on the ledger, lets admins point at each other without anyone listing a publication that did not agree to it. The initiator lists the peer as it answers `active`, and the receiver lists it when that answer arrives. A client follows the URL only when both publications list it.

**Alternatives considered.**

- A separate registration contract beside the instrument was rejected: two ids and two templates for one token.
- Requiring the publication on the registry URL was rejected: admins whose registry an operator runs could not publish on their own.
- An off-ledger signed list of token ids was rejected: it moves the trust root off the ledger, which the registration check exists to avoid.
- Optional access-token reads for holdings and history were rejected. The four routes are public under the `OpenToken` contract id. A response that is only a message means the token has none of that read.
- Standardizing every free-form argument map was rejected: custom tokens differ there on purpose. Migrations announce the differences instead.
- Standardizing hosting, language, or URL layout was rejected: two publishers interoperate when they serve the same routes and the same check, which the conformance suite tests.

