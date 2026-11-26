## Development Fund Proposal: Canton Gift Kit

**Author:** Askardex
**Status:** Draft
**Created:** 2026-07-23
**Label:** financial-workflows-composability
**[Champion](https://github.com/canton-foundation/canton-dev-fund/blob/main/sig-directory.md):** Need Champion

---

## Abstract

Canton Gift Kit is an open source toolkit for building programmable gift and reward distribution workflows on Canton. It will provide reusable Daml contracts, a TypeScript integration library, reference application components, tests, and operating guidance for single claim gifts, multi claim gift pools, and committed variable reward distributions.

Single claim and multi claim gift funds, authorization, claim state, payout, expiry, and reclaim are enforced on ledger in Daml. Lucky Gift uses a hybrid model only where secrecy is required: the reward order is shuffled and encrypted off ledger before creation. Funding, commitment verification, claimant reservation, payout, receipts, expiry, and reclaim remain enforced on ledger.

The total proposal is capped at 950,000 CC, but funding is staged. The initial public release phase requests 350,000 CC. The remaining 600,000 CC becomes eligible only after the first phase is accepted and the later audit, production hardening, adoption, and maintenance milestones are completed.

---

## Specification

### 1. Objective

The objective is to publish one reusable gift distribution primitive for Canton, with a common claim protocol and three funding patterns: one recipient, multiple equal recipients, and multiple recipients with a committed variable reward schedule.

Today, a wallet or application that wants to offer QR gifts, event rewards, community distributions, or promotional reward pools must design the complete workflow itself. The difficult parts are not the presentation of a gift card. They are the authorization and settlement rules behind it:

* funds must be committed before a gift is shared
* the recipient may not be known when the gift is created
* a scanned claim must not be replayed or redirected to another party
* two people attempting to claim the same gift must not both succeed
* unused funds must have a clear expiry and recovery path
* an operator may help relay a transaction, but must not be able to take or redirect the funds
* variable reward campaigns must commit their reward composition before claims begin

The intended outcome is a public toolkit that another Canton team can use without depending on a hosted service from the implementing organization. The three modes are variants of the same primitive rather than separate consumer products. They share the same QR format, claimant binding, expiry rules, settlement boundary, integration library, and operator model:

1. **Single Claim Gift Escrow.** One prefunded gift is claimed once by a valid recipient or returned to its creator after expiry. Financial state and authorization are on ledger.
2. **Multi Claim Gift Pool.** A prefunded pool is divided into equal claims and remains active until all claims are taken or the pool expires. Financial state and authorization are on ledger.
3. **Committed Variable Reward Pool.** A prefunded pool contains regular and higher value rewards. The financial workflow is on ledger, but the reward order is shuffled and encrypted off ledger before creation so future reward positions are not exposed. The resulting commitment is fixed on ledger and each payout must open the commitment for its claim position.

The third mode is intended for creator funded promotional and community reward distributions. It does not include paid entry, wagering, operator selected winners, or an unfunded promise of future rewards.

### 2. Implementation Mechanics

#### On-ledger gift workflows

The project will publish vendor neutral Daml packages for the three distribution modes. The contracts will enforce the financial lifecycle of each gift on ledger, including creation, reservation where required, claim, payout, expiry, and reclaim.

The initial Canton Coin implementation will use supported Canton Coin locking and transfer primitives. The creator will authorize the funding transaction. A successful claim will settle only to the party bound to that claim. Any remaining funds will return only to the creator through the documented expiry path. The API and reference interface do not maintain a separate spendable gift balance outside the ledger.

The core authorization rules will be explicit and tested:

* the creator funds and creates a gift
* the claimant authorizes a claim or reservation
* an optional relay may assist with settlement but cannot choose the receiver or amount
* only the creator can recover expired funds
* no administrator or operator withdrawal choice will exist

The contracts will produce receipts that authorized parties can use for history, reconciliation, and support.

#### QR claim protocol

The repository will define a versioned QR payload and canonical encoding rules. A QR payload will carry the information needed by a claimant without containing a wallet private key.

Only a cryptographic commitment will be stored in the gift contract. A claim will bind the QR secret to the claimant party and a one time nonce before settlement. The protocol is intended to reject replay after a claimant authenticated reservation. Its specification will define secret entropy, domain separation, claimant binding, reservation expiry, disclosure assumptions, and idempotent retry behavior. Each property will have a public adversarial test and canonical test vector.

Before reservation, the QR remains a bearer secret. A party that obtains it first may be able to reserve the gift. Claimant binding protects the reservation and later settlement from reuse or redirection; it does not recover a QR that was disclosed before reservation. The reference documentation and interface will state this limitation clearly.

#### Hybrid boundary for Lucky Gift

The variable reward workflow needs an off-ledger component because a secret reward order cannot be generated and kept secret inside deterministic Daml execution. Before pool creation, a cryptographically secure process shuffles the reward positions, creates per-position commitments, encrypts the schedule, and signs the overall composition.

The off-ledger shuffle does not directly select or control a claimant. Claimants receive positions according to the order in which valid reservations are accepted on ledger. The hidden shuffled position determines whether that claimant receives a regular or higher value reward.

The reference implementation will include an HSM or KMS attestation adapter. Attestation keys will be configured per deployment. Key versions, rotation, and retirement will be documented. At creation, the contract will verify a signed statement that binds the pool, reward counts, reward amounts, total funding, commitment root, and key version. At settlement, the amount and nonce for the reserved claim index must open the corresponding prelaunch commitment.

The attestor remains trusted to construct and protect the initial hidden schedule correctly. The HSM signature makes that attestor accountable for the composition it approved, while the per claim opening lets the ledger reject a payout that does not match the committed index. This is the only semi-onchain part of the reference design. It is not on-ledger randomness and is not described as a trustless random number generator.

The following Lucky Gift actions remain on ledger:

* creator authorization and prefunding of all reward locks
* commitment root and ordered commitment list
* claimant reservation and one claim per party checks
* reservation expiry and release
* verification that the revealed amount and nonce match the reserved position
* payout only to the reserved claimant
* claim receipt, remaining pool state, expiry, and creator reclaim

#### Developer library and reference integration

The project will publish a TypeScript library covering:

* QR encoding, decoding, and validation
* commitment and reserve hash calculation
* preparation of create, claim, and reclaim operations
* gift state and history queries
* error types and recovery guidance
* an attestation provider interface with a KMS reference adapter

A thin reference relay and reference user interface will demonstrate one end to end integration. They will be examples, not required hosted dependencies. The library will be designed to sit above existing Canton wallet and dApp connectivity surfaces.

The project will not build another general purpose wallet SDK. It will provide a domain specific gift workflow library that can be used with the Canton dApp SDK, Wallet SDK, or direct Ledger API integrations as appropriate.

#### Deployment configuration

Application fees are outside the funded scope. The core contracts and reference integration will not depend on a proprietary fee contract.

Deployment specific values such as operator parties, attestation keys, and network identifiers will be factory configuration. The open source packages will not contain production identifiers or credentials from the implementing organization.

#### Testing and operations

The repository will include Daml tests, TypeScript tests, integration scenarios, and an adversarial test suite. The security test matrix will cover at least:

* duplicate and concurrent claim attempts
* replay of a previous reservation or reveal
* a valid secret submitted by the wrong claimant
* claim and reclaim at the expiry boundary
* malformed and oversized QR payloads
* altered reward commitments and invalid attestations
* attestation key version mismatch
* relay interruption and safe retry
* database and ledger reconciliation after a partial application failure

Operational documentation will cover deployment, package compatibility, monitoring, recovery, key rotation, and safe upgrades.

### 3. Architectural Alignment

Canton Gift Kit is intended to complement existing Canton components.

* Daml contracts hold the authorization and lifecycle rules on ledger.
* Canton privacy limits workflow data to the parties and observers involved in each contract.
* Existing token transfer and wallet connectivity surfaces remain responsible for asset movement and user authorization.
* Interactive submission supports users and externally hosted parties signing their own gift and claim operations.
* The reference application will use existing wallet and dApp integration tooling rather than define a competing connection standard.

The first release will be explicit about its Canton Coin dependency. It will not claim support for every Canton asset merely because the contracts carry an instrument identifier. The project will document an adapter boundary for other assets if they provide equivalent lock and settlement semantics.

This work aligns with the Development Fund priorities for financial workflows and composability, application developer experience, wallet interoperability, security, and reusable reference implementations. The core value is an on-ledger gift state machine and claim protocol. Lucky Gift adds a narrowly defined off-ledger secrecy service without moving ownership or payout authority away from Daml.

#### Relationship to funded ecosystem work

| Existing component | Reused by Canton Gift Kit | Gift specific work in this proposal |
| --- | --- | --- |
| Canton dApp SDK and Wallet SDK | wallet discovery, connectivity, signing, and transaction transport | gift lifecycle bindings, QR codec, claimant reservation, gift queries, and conformance vectors |
| Canton Token Standard and Canton Coin workflows | holding discovery, transfer context, and settlement | prefunded gift state, unknown recipient authorization, expiry, reclaim, and claim receipts |
| Canton Payment Streams | architectural lessons for prefunded workflows and SDK integration | no replacement or extension of stream accrual; this proposal covers bearer style QR claims and gift pool state |

Funding is limited to gift specific contracts, claim semantics, test vectors, integration bindings, security review, and adoption support. General wallet connectivity, transaction transport, and time based payment streaming are not duplicated.

### 4. Backward Compatibility

No backward compatibility impact.

The toolkit will introduce new packages and integration libraries. It will not require changes to Canton core, existing wallets, existing gift applications, or the Token Standard. Package and network compatibility will be documented for each release.

---

## Milestones and Deliverables

### Milestone 1: On-ledger Gift Core

* **Estimated Delivery:** 6 weeks from project start
* **Focus:** Publish the reusable on-ledger single claim and multi claim workflows in a form that an external team can run and review.
* **Deliverables / Value Metrics:**
  * public Apache 2.0 repository with vendor neutral package names
  * protocol specification, authorization matrix, and initial threat model
  * single claim gift escrow and multi claim gift pool Daml packages
  * versioned QR format and canonical commitment test vectors
  * initial TypeScript library for create, claim, reclaim, and query flows
  * reproducible local development environment and reference Canton Coin flow
  * technical review completed with at least one relevant Canton SIG
  * at least one external builder runs the reference lifecycle from the published documentation and provides written feedback

### Milestone 2: Hybrid Lucky Gift and Integration Library

* **Estimated Delivery:** 8 weeks after Milestone 1
* **Focus:** Complete the hybrid variable reward workflow and prove that it can be integrated without a hosted dependency from the implementing organization.
* **Deliverables / Value Metrics:**
  * committed variable reward Daml package
  * configurable, versioned attestation key model
  * HSM or KMS reference adapter and encrypted schedule example
  * reservation, settlement, expiry, and recovery workflows
  * expanded TypeScript library and reference relay
  * thin reference interface for creating and claiming all three gift modes
  * examples for at least two wallet or signing models
  * clear documentation separating off-ledger shuffle and schedule protection from on-ledger fund control and settlement
  * one unaffiliated ecosystem team integrates the tagged release into a test application and completes create, reserve, claim, expiry, and reclaim cases
  * the external team provides a public or Committee visible validation report
  * published report describing feedback and resulting design changes

### Milestone 3: Public Release and Independent Review

* **Estimated Delivery:** 6 weeks after Milestone 2
* **Focus:** Publish a release candidate, complete an independent technical security review, and establish evidence for a later audit and adoption proposal.
* **Deliverables / Value Metrics:**
  * complete Daml, TypeScript, integration, and adversarial test suites
  * written assessment by a Committee approved independent reviewer with relevant Daml, Canton, and application security experience
  * assessment scope covering Daml fund authorization, QR disclosure and replay, attestation and schedule confidentiality, relay behavior, expiry, reclaim, and operational recovery
  * published review summary and remediation status
  * no Critical finding remains unresolved; any unresolved High finding must block production positioning and be carried into the proposed formal audit scope
  * deployment, monitoring, incident response, package upgrade, and key rotation runbooks
  * release candidate that an external team can deploy without private credentials or deployment specific source changes
  * at least one integration, fork, or controlled pilot outside the implementing organization using the release candidate

### Milestone 4: Formal Audit and Production Hardening

* **Estimated Delivery:** 8 weeks after Milestone 3 acceptance
* **Focus:** Complete a formal independent audit and prepare the tagged release for production adoption.
* **Deliverables / Value Metrics:**
  * Committee approved audit scope and third party assessor
  * audit coverage of Daml fund authorization, concurrent claims, QR disclosure and replay, attestation and schedule confidentiality, relay behavior, expiry, reclaim, package compatibility, and operational recovery
  * published audit summary and remediation status
  * no Critical or High finding remains unresolved unless the Committee explicitly accepts the documented risk
  * production hardening of monitoring, reconciliation, retry safety, key rotation, deployment, and incident response
  * production release with signed artifacts, release notes, and a supported package compatibility matrix
  * at least two unaffiliated applications or wallets complete end to end pilot integrations using the production release

### Milestone 5: Ecosystem Adoption and Maintenance

* **Estimated Delivery:** 12 months after Milestone 4 acceptance
* **Focus:** Demonstrate independent usage and maintain the production release for early adopters.
* **Deliverables / Value Metrics:**
  * at least two applications or wallets outside the implementing organization operate completed end to end pilots
  * at least one external adopter operates a production deployment or a public test deployment accepted by the Committee
  * public adoption report covering completed gift lifecycles, integration feedback, security events, and unresolved limitations
  * twelve months of compatibility updates, security fixes, release notes, and adopter support from Milestone 4 acceptance
  * maintained public issue tracker and package compatibility matrix

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

* completion of each milestone and its value metrics
* demonstrated single claim, multi claim, and committed variable reward lifecycles
* preservation of the documented authorization and fund safety rules
* a public Apache 2.0 repository that does not depend on Askardex production infrastructure
* an external builder being able to run the local reference environment from documentation alone
* public canonical QR and commitment test vectors that match across Daml and TypeScript implementations
* successful concurrent claim, replay, wrong claimant, expiry, reclaim, and attestation failure tests
* independent technical security review and remediation of all Critical findings during the initial public release phase
* one unaffiliated team publishes or privately provides the Committee with a validation report covering create, claim, expiry, and reclaim
* formal audit completed before production positioning, with no unresolved Critical or High finding unless the Committee explicitly accepts the documented risk
* at least two external pilot integrations by Milestone 4
* at least one externally operated production or Committee accepted public test deployment by the final milestone
* twelve months of published maintenance evidence, release notes, and package compatibility guidance

The project will not be considered complete based only on code delivery or test coverage. External evaluation, independent reuse, security review, and evidence of adoption are required outcomes.

---

## Funding

**Total Funding Request:** Up to 950,000 CC, released in stages. The initial public release phase is limited to 350,000 CC. The remaining 600,000 CC is conditional on acceptance of the later milestones.

### Payment Breakdown by Milestone

* Milestone 1, On-ledger Gift Core: 125,000 CC upon committee acceptance
* Milestone 2, Hybrid Lucky Gift and Integration Library: 125,000 CC upon committee acceptance
* Milestone 3, Public Release and Independent Review: 100,000 CC upon committee acceptance
* Milestone 4, Formal Audit and Production Hardening: up to 200,000 CC upon committee acceptance, including the Committee approved third party audit cost
* Milestone 5, Ecosystem Adoption and Maintenance: 400,000 CC upon final acceptance

The first three milestones total 350,000 CC. No Milestone 4 or Milestone 5 funds become due before Milestone 3 is accepted.

### Delivery Effort Assumptions

The development allocation is based on the following planning assumptions. Roles may overlap within the implementing team, but the work and acceptance obligations remain separate.

| Work area | Estimated effort |
| --- | ---: |
| Phase 1: Daml design, implementation, and package compatibility | 12 person weeks |
| Phase 1: TypeScript library, reference relay, and integration examples | 10 person weeks |
| Phase 1: Reference interface and wallet integration | 6 person weeks |
| Phase 1: Security engineering, adversarial testing, and review remediation | 8 person weeks |
| Phase 1: Documentation, external evaluation support, and release engineering | 6 person weeks |
| Phase 2: Audit support, remediation, and production hardening | 12 person weeks plus third party audit |
| Phase 3: External adoption support and maintenance coordination | 12 person weeks across 12 months |
| **Total internal effort** | **66 person weeks** |

The initial 350,000 CC covers 42 person weeks through the public release. Milestone 4 reserves up to 200,000 CC for the formal audit, remediation, and production hardening. Milestone 5 ties the final 400,000 CC to external adoption evidence and a completed twelve month maintenance obligation.

### Volatility Stipulation

The full proposal extends beyond six months. The fixed CC allocation will be re-evaluated at the six month mark before any remaining Milestone 4 or Milestone 5 payment is approved. Material Committee requested scope changes may also require renegotiation.

---

## Co-Marketing

Upon release, the implementing entity will collaborate with the Foundation on:

* announcement coordination for the public repository and release candidate
* a technical article explaining the gift authorization and QR security model
* at least one developer workshop or recorded walkthrough
* a case study based on an external pilot, subject to the adopter's approval
* integration guidance for wallets, community applications, and reward platforms

---

## Motivation

Gift and reward distribution is a common application workflow, but a safe implementation requires more than generating a QR code. Builders must solve escrow, unknown recipient authorization, replay protection, expiry, recovery, signing, transaction disclosure, history, and operational reconciliation. Variable reward campaigns also require a credible way to prove that the operator did not change the reward order after claims began.

Without a shared implementation, each team must make its own security decisions and repeat the same integration work. This increases the chance of inconsistent authorization rules, unsafe relay services, secrets appearing in logs, and incomplete recovery paths.

A public toolkit would benefit:

* wallets that want to support person to person gifts
* community and loyalty applications distributing prefunded rewards
* event organizers using QR based claims
* merchants issuing promotional gifts
* treasuries running limited distribution campaigns
* developers who need a working Canton example for unknown recipient settlement

The implementing team has working internal prototypes for the three gift modes, including Daml contract builds, external signing flows, commitment test vectors, and an HSM backed attestation path. A controlled development deployment has been used for integration work without end user funds. Technical evidence can be demonstrated to the Committee without exposing production configuration or private user data.

Askardex will lead delivery with the same application, Daml, wallet, and operations disciplines used to build the prototypes. Named contributors and role allocation will be provided during review before a funding vote. No milestone depends on undisclosed proprietary software.

The grant is not intended to reimburse private product development. It funds extraction of the reusable core, removal of deployment specific assumptions, public specifications and tests, independent review, external integrations, and maintenance.

There is no reliable public dataset that identifies how many Canton applications currently plan gift or QR reward workflows. Rather than claim an unsupported ecosystem percentage, the proposal uses staged evidence: one unaffiliated integration during the public release phase, two completed external pilots after the formal audit, and at least one externally operated deployment by the final milestone.

---

## Rationale

This is a workflow toolkit and reference implementation, not a hosted gift card business or a general purpose connectivity SDK.

The three distribution modes belong in one proposal because they share one objective, one QR and claimant binding model, one lifecycle vocabulary, one settlement boundary, and one integration library. Splitting them would duplicate the security model and make it harder for adopters to understand which components can be combined safely.

The design keeps fund movement in Daml rather than trusting a backend balance table. It uses prefunding so a gift cannot promise more than has been committed. It gives the creator a defined recovery path and limits a relay to actions whose receiver and amount are already constrained by the contract.

For variable rewards, the design uses a precommitted schedule with an attestation adapter because deterministic Daml execution cannot create and conceal a shuffled reward order. The off-ledger service shuffles and protects that order. The attestor is accountable for the initial composition it signs. Each payout must then open the commitment for its reserved claim index, and the Daml contract rejects an amount or nonce that does not match. The public work will make the attestor configurable so each adopter can operate its own key infrastructure or implement another reviewed attestation model.

There is a bounded liveness dependency on the relay in workflows where a settlement step needs operator participation. The relay cannot seize or redirect funds, but it may delay settlement. The creator controlled expiry and reclaim path limits that failure mode. The threat model, operator responsibilities, and recovery procedures will be documented rather than hidden behind a broad non custodial claim.

The toolkit extends existing wallet connectivity and token transfer components. Its scope begins at the gift lifecycle and QR claim protocol, above the connectivity and settlement layers already funded elsewhere.

The initial release is scoped to Canton Coin because the current locking workflow relies on Canton Coin specific primitives. A future asset adapter is possible where another token provides equivalent lock and settlement guarantees, but broad asset support is not part of this funding request.

---

## Risks and Mitigations

### Security of locked funds

Gift contracts control prefunded assets. A contract error could delay or prevent a valid claim or reclaim. The project mitigates this through explicit authorization invariants, adversarial tests, an independent review, and a release gate requiring remediation of Critical and High findings.

### Relay availability

Some workflows may require a relay to complete a preauthorized settlement. An unavailable relay can affect liveness but must not affect fund ownership. The creator retains the documented expiry recovery path. Monitoring and recovery guidance will be included.

### Attestor centralization

The reference variable reward workflow uses an HSM or KMS backed attestor. The proposal will make the attestor key deployment specific, publish rotation procedures, and clearly document what the attestation proves and does not prove. Decentralized randomness or attestor consensus is outside the initial scope.

### Regulatory interpretation

The reference variable reward mode will not include paid entry or wagering. That design choice does not determine the legal classification of a campaign. Deployers must obtain jurisdiction specific review and implement eligibility rules, disclosures, geographic restrictions, sanctions controls, and tax reporting where applicable.

### Upstream package changes

The current Canton Coin lock workflow depends on supported Splice package semantics. The project will publish a compatibility matrix, pin tested package versions, and include upgrade tests and release notes.

### Adoption risk

Implementation alone does not establish ecosystem value. Only 350,000 CC is attached to the initial public release. The remaining 600,000 CC is conditioned on a formal audit, production hardening, external pilots, an externally operated deployment, and twelve months of maintenance evidence.

---

## Maintenance

Askardex will maintain the public release during the initial phase and for twelve months following Milestone 4 acceptance. Maintenance includes security fixes, compatibility updates for supported Canton and Splice releases, documentation corrections, release notes, and reasonable integration support for early adopters.

The repository will use public issues, release notes, versioned artifacts, and a compatibility matrix. Material feature expansion beyond the funded scope will be proposed separately rather than added silently to maintenance work.

---

## Out of Scope

Funded scope is limited to gift specific contracts, QR claim semantics, a domain specific integration library, reference components, tests, independent security review and audit, production hardening, external adoption support, and twelve months of maintenance. Hosted services, paid entry games, wagering, general purpose wallet connectivity, Token Standard work, broad asset adapters, decentralized randomness, custody of wallet keys, cross chain settlement, application fees, and private product features are out of scope.
