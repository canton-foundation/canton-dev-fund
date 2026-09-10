# Development Fund Proposal: myCircle — The Human Trust Layer for Canton

**Author:** Leon Gomez, myCircle Technologies PBC  
**Applicant:** myCircle Technologies PBC  
**Implementing team:** myCircle Technologies PBC and Envazia Technologies  
**Status:** Draft  
**Created:** 2026-08-11  
**Label:** regulatory-compliance  
**[Champion](https://github.com/canton-foundation/canton-dev-fund/blob/main/sig-directory.md):** Viv Diwakar, Canton Foundation  
**Primary SIG alignment:** Identity & Metadata  
**Secondary SIG alignment:** Regulatory Compliance and dApp Integration

---

## Abstract

myCircle requests **1,500,000 CC** to deliver an open-source Human Trust Layer for Canton over five months. The project will turn an off-ledger identity-verification decision into a reusable, privacy-preserving Canton credential, provide wallet and dApp integration tools for credential- and token-gated access, and prove adoption through a live Canton Builders Circle.

The public deliverables will include a Verified Person Credential Profile built on the existing Canton Credential Utility, a provider-neutral issuer adapter with Stripe Identity and mock-provider examples, a TypeScript consumer SDK, CIP-0103 wallet integration, CIP-0056 token-gating examples, conformance tests, documentation, and audited reference deployments. The work will let wallets, dApps, issuers, and regulated-asset workflows evaluate a credential without receiving the user's raw identity documents or biometric evidence.

myCircle's existing community platform and Wingmate AI are pre-existing proprietary products contributed to the project in kind. Development Fund money will pay only for Canton-specific open-source components, security work, identity-verification subsidies, infrastructure, and the public adoption pilot. It will not fund unrelated development of the proprietary myCircle product.

For this proposal, a **verified person** is a Canton party for whom a named issuer has completed the checks described in a published issuer policy. The credential reduces bot, duplicate-account, and Sybil risk, but it is not a universal or network-governed proof that one biological human can hold only one account.

---

## Specification

### 1. Objective

The single objective is to make a verified-person decision portable and reusable across Canton applications, then demonstrate its ecosystem value in a live community environment.

Bots, fake profiles, duplicate accounts, and opaque counterparties undermine digital communities and create fraud, governance, and compliance risk. Today, a Canton application that requires identity or liveness checks generally has to build its own provider integration and store the result in an application-specific database. Other Canton applications cannot readily reuse that decision, so users repeat verification and builders repeat the same integration work.

The intended outcome is a common path in which:

1. A user connects a Canton account through a CIP-0103-compatible wallet or another approved Ledger API flow.
2. An identity provider completes document, selfie, liveness, or other configured checks off ledger.
3. An authorized issuer maps the provider result to the open Verified Person Credential Profile.
4. The existing Canton Credential Utility issues the credential to the user's Canton party.
5. An authorized wallet, dApp, community, or regulated-asset workflow evaluates the trusted issuer, subject, claim set, policy version, and validity period.
6. Expiry or revocation causes later credential-gated actions to fail closed.

The Canton Builders Circle will serve as the first production-oriented adoption environment. The funded integrations and specifications will remain vendor-neutral and reusable by organizations that do not use myCircle.

### 2. Implementation Mechanics

#### A. Verified Person Credential Profile v1

The project will publish a versioned profile for the existing `Utility.Credential.V0.Credential:Credential` model. The profile will define:

- Required and optional property/value claims.
- Canton-party subject binding.
- Assurance levels and the verification methods accepted at each level.
- Issuer-policy and schema-version identifiers.
- Issuance, acceptance, renewal, expiry, revocation, and replacement behavior.
- Privacy rules prohibiting raw identity documents, selfie images, biometric templates, home addresses, full dates of birth, and other direct KYC evidence from being written to Canton.
- Conformance cases for valid, expired, revoked, malformed, wrong-subject, and wrong-issuer credentials.

The minimal claim set will identify the credential type, schema version, issuer policy, verification status, assurance level, verification method, and validity window. Optional claims such as liveness or uniqueness will be namespaced and may be asserted only when the issuer's documented process supports them.

The project will use the Credential Utility rather than introduce a competing identity contract. If the Identity & Metadata SIG and Champion determine that ecosystem standardization requires a CIP, the team will prepare a CIP draft for review.

#### B. Provider-Neutral Issuer Adapter

The open-source issuer adapter will convert an approved provider result into a Credential Utility issuance workflow. It will include:

- A provider-neutral interface for identity and liveness vendors.
- A reference integration for Stripe Identity document and selfie verification.
- A mock provider for local development and automated testing.
- A documented extension point for Persona or another provider as a contingency.
- Party binding, holder-authorized credential acceptance, idempotent issuance, renewal, expiry, revocation, and replacement.
- Signed-webhook validation, replay protection, reconciliation, audit events, health checks, and operational metrics.
- OpenAPI documentation and reproducible DevNet and TestNet deployment instructions.

Raw verification evidence will remain with the identity provider or issuer under the applicable consent and retention policy. Only the minimum attestation claims required by the relying workflow will be represented on Canton. Supabase Vault may be used for service secrets and provider API keys; it will not be described or used as a repository for on-ledger biometric data. Application access will use least privilege and row-level security where the off-ledger service stores operational records.

#### C. Consumer SDK, Wallet Connectivity, and Access Controls

The project will publish a TypeScript SDK and reference user interface that allow Canton applications to:

- Connect an account through the CIP-0103 dApp interface where supported.
- Discover and parse visible Credential Utility contracts through supported Canton APIs.
- Validate trusted issuer, subject, schema version, required claims, validity window, and active-contract state.
- Return deterministic allow/deny decisions with machine-readable reasons.
- Gate a community or dApp action based on credential status.
- Combine credential status with CIP-0056 token holdings in a reference token-gated access policy.
- Test integrations against public fixtures and a provider-independent conformance suite.

The project will target interoperability with any conforming CIP-0103 provider. Loop, Send, Nightly, Bron, and Fireblocks are intended outreach targets, not commitments made on those organizations' behalf. Acceptance will require successful end-to-end tests with at least two independent wallet implementations available during the project.

The SDK will not take custody of private keys. It will also avoid presenting issuer trust as universal: each relying application chooses the issuers, assurance levels, and policies appropriate to its use case.

#### D. Canton Builders Circle Adoption Environment

myCircle will provide its existing community platform as an in-kind base for a live Canton Builders Circle. Grant-funded work will be limited to the open Canton-specific adapters, access modules, documentation, hosted reference environment, and pilot support.

The pilot will provide:

- A public Canton Builders Circle using wallet connection and the Verified Person Credential Profile.
- Credential- and token-gated community access examples.
- White-labelled pilot Circles for at least ten Canton ecosystem groups.
- Onboarding support for at least 500 verified, active participants.
- Privacy-preserving aggregate adoption reporting and public adopter references where participants consent.
- Reusable setup instructions so another community platform or dApp can implement the same trust layer without access to myCircle's proprietary code.

General messaging, feeds, contact management, calendars, AI matching, conference tooling, and unrelated myCircle features are outside the funded scope.

#### E. Security, Privacy, and Operations

The project will publish a threat model covering party misbinding, forged provider callbacks, replay, duplicate issuance, privilege escalation, compromised issuer keys, stale credentials, malicious relying applications, and PII leakage. It will include:

- Data-flow, data-classification, retention, consent, and deletion documentation.
- Negative tests demonstrating that prohibited PII is not submitted to Canton.
- Credential expiry, revocation, issuer-key incident, and service-recovery runbooks.
- Dependency, secret, and software-bill-of-materials scanning.
- Signed and versioned releases.
- An independent security and privacy review before final acceptance.

All critical and high-severity findings must be remediated before final acceptance. Medium and low findings may remain only with a documented rationale, owner, and remediation date.

#### Scope Boundaries

Development Fund money will not be used for:

- General development of myCircle's proprietary SaaS platform or Wingmate AI.
- Storing raw KYC documents or biometric evidence on Canton.
- Creating a proprietary replacement for the Canton Credential Utility.
- Claiming regulatory approval, zero-knowledge proof functionality, or universal proof of personhood that the implementation does not provide.
- Committing third-party wallets, institutions, universities, or ecosystem partners without their written participation.
- EVM bridging, token issuance, a myCircle token-generation event, or the separate ValidatedVoices concept.

### 3. Architectural Alignment

The project extends Canton's existing components at the application and integration layers:

- **Canton Credential Utility:** The existing W3C-inspired credential model provides issuer, holder, subject claims, validity, observers, and revocation through archival. This proposal standardizes an application profile and integration path above it.
- **Registry Utility:** The profile can be evaluated through issuer, claim, validity, and holder requirements for regulated-asset workflows.
- **Canton privacy model:** Credential visibility remains limited to authorized stakeholders under Daml's need-to-know model. Raw identity evidence remains off ledger.
- **Canton JSON Ledger API:** The issuer service and SDK will use supported ledger interaction patterns rather than a private gateway.
- **[CIP-0103 dApp Standard](https://github.com/canton-foundation/cips/blob/main/cip-0103/cip-0103.md):** Wallet connection, account discovery, consent, and transaction execution will use the vendor-neutral dApp interface where available.
- **[CIP-0056 Canton Network Token Standard](https://github.com/canton-foundation/cips/blob/main/cip-0056/cip-0056.md):** Token-gated reference flows will consume existing token holdings and will not define a new asset standard.

Any proposed change to an existing utility package or network-wide claim standard will be submitted upstream for review rather than maintained as an incompatible fork.

### 4. Backward Compatibility

*No backward compatibility impact.*

The profile, adapter, SDK, and examples use existing Canton contracts and APIs. Existing issuers and credentials that do not implement the profile continue to operate unchanged. Profile evolution will use explicit schema versions, and the SDK will support the current and immediately preceding profile version during the maintenance period.

---

## Milestones and Deliverables

The delivery period is five months from grant approval. Dates are relative to approval so committee review time does not reduce implementation time.

### Milestone 1: Open Credential Profile and Issuer Stack

- **Estimated Delivery:** End of Month 1
- **Funding:** 500,000 CC
- **Focus:** Publish the identity profile and working issuer path on DevNet.
- **Deliverables / Value Metrics:**
  - Release the Verified Person Credential Profile, claim dictionary, issuer-policy requirements, lifecycle rules, privacy boundary, and conformance fixtures under Apache-2.0.
  - Release the provider-neutral issuer adapter, mock provider, and Stripe Identity reference integration.
  - Demonstrate issue, accept, verify, expire, revoke, and replace flows on DevNet.
  - Pass positive and negative cases for valid, expired, revoked, malformed, wrong-subject, and wrong-issuer credentials.
  - Complete structured design and usability reviews with at least two independent Canton builders who are not myCircle or Envazia personnel.
  - Publish evidence that the reference flow writes no prohibited raw identity or biometric evidence to Canton.

### Milestone 2: Wallet and Token-Gating Interoperability

- **Estimated Delivery:** End of Month 3
- **Funding:** 500,000 CC
- **Focus:** Make the credential usable by independent wallets and dApps.
- **Deliverables / Value Metrics:**
  - Release the TypeScript consumer SDK, CIP-0103 connection module, access-policy examples, React helpers, and framework-neutral APIs.
  - Release a CIP-0056 token-plus-credential gating example and a Registry Utility credential-requirement example.
  - Complete end-to-end tests with at least two independent wallet implementations.
  - Complete integrations with at least two independent Canton dApp or community teams, with at least one integration using the credential to authorize or deny a real workflow.
  - Publish conformance results, integration time measurements, developer documentation, and changes made from adopter feedback.
  - Operate the reference deployment on TestNet with monitoring, incident procedures, and reproducible deployment instructions.

### Milestone 3: Builders Circle Adoption, Audit, and Handoff

- **Estimated Delivery:** End of Month 5
- **Funding:** 500,000 CC
- **Focus:** Demonstrate ecosystem adoption and leave the public components secure and maintainable.
- **Deliverables / Value Metrics:**
  - Launch the Canton Builders Circle and at least ten Canton ecosystem group Circles using the funded access integrations.
  - Reach at least 500 unique verified participants who complete a credential-gated workflow; applicant- or contractor-controlled test accounts do not count.
  - Complete an independent security and privacy review with no unresolved critical or high-severity findings.
  - Maintain at least 99.5% availability for the hosted TestNet reference issuer and verification service during a continuous 30-day observation window, excluding published Canton outages and pre-announced maintenance.
  - Publish the final v1 specification, versioned releases, audit and remediation summary, operator runbooks, integration cookbook, adopter evidence, and five-year maintenance roadmap.
  - Conduct a public technical workshop and provide a recorded integration walkthrough.

Adopters may be evidenced through a public repository or deployment, a statement from the adopting team, or confidential verification by the Canton Foundation where the adopter cannot be named publicly.

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on the milestone-specific ecosystem outcomes and these cross-project conditions:

- All funded software and specifications are publicly available with versioned releases and reproducible builds under Apache-2.0.
- The implementation uses the existing Canton Credential Utility rather than an incompatible credential model.
- An independent issuer and an independent relying application can integrate without access to proprietary myCircle code.
- Credential decisions correctly enforce trusted issuer, subject, claims, schema version, validity, and active-contract state.
- Revoked, expired, malformed, wrong-subject, and wrong-issuer credentials fail closed.
- No raw identity document, selfie image, biometric template, home address, full date of birth, or equivalent KYC evidence is written to Canton in reference or pilot flows.
- Two independent wallet implementations and two independent Canton applications complete the Milestone 2 flows.
- Ten ecosystem groups and 500 unique verified participants complete the Milestone 3 adoption criteria.
- Adoption evidence excludes applicant-controlled and contractor-controlled test accounts.
- No critical or high-severity security findings remain open at final acceptance.
- Documentation and knowledge transfer are sufficient for community operation or forking of the public components.

If an upstream utility or API change makes a specified mechanism obsolete, the applicant and Champion may substitute the current supported mechanism without reducing the milestone's adoption, privacy, interoperability, or security outcome.

---

## Funding

**Total Funding Request:** 1,500,000 CC

### Payment Breakdown by Milestone

- Milestone 1 _(Open Credential Profile and Issuer Stack)_: 500,000 CC upon committee acceptance
- Milestone 2 _(Wallet and Token-Gating Interoperability)_: 500,000 CC upon committee acceptance
- Milestone 3 _(Builders Circle Adoption, Audit, and Handoff)_: 500,000 CC upon final acceptance

### Cost Allocation

| Category | Amount | Share | Funded work |
| --- | ---: | ---: | --- |
| Engineering | 900,000 CC | 60% | Open profile, adapters, SDK, access modules, tests, documentation, deployments, and pilot support |
| Independent security and privacy review | 300,000 CC | 20% | Threat-model review, audit, remediation verification, and public summary |
| Identity-verification subsidies | 150,000 CC | 10% | Provider costs for eligible pilot participants, subject to privacy and anti-abuse controls |
| Infrastructure | 150,000 CC | 10% | DevNet/TestNet services, monitoring, logging, CI, and hosted reference environment |
| **Total** | **1,500,000 CC** | **100%** | |

The detailed milestone budgets will preserve the total category allocations above. Any unused pass-through audit or identity-provider amount will not be claimed unless the Committee approves reallocation to remediation or another in-scope milestone cost.

The core myCircle platform, Wingmate AI, existing customer base, and general product operations are in-kind contributions and are not funded by this request.

### Volatility Stipulation

The planned delivery period is under six months. Should the timeline extend beyond six months because of Committee-requested scope changes or delayed access to required Canton environments, remaining milestones must be renegotiated to account for significant USD/CC price volatility.

---

## Co-Marketing

Upon release, the implementing team will collaborate with the Foundation on:

- Coordinated announcements for the public profile, SDK, and Builders Circle.
- A technical case study on privacy-preserving verified-person credentials on Canton.
- A public developer workshop and recorded walkthrough.
- Adopter spotlights where participating organizations consent.
- Outreach to wallets, dApps, communities, Registry Utility teams, and regulated-asset builders that can reuse the profile.

All communications will distinguish issuer attestation from regulatory approval or universal proof of personhood.

---

## Motivation

[myCircle](https://mycircle.co/) is an existing B2B community and professional-networking product built around trusted communities, identity, and Web3 access. The applicant reports that the product has been commercially available since May 2026 and has 840 paid `.mycircle` domain customers. Before the proposal proceeds to a vote, myCircle will provide the Foundation with redacted transaction evidence or another verifiable attestation supporting that figure.

That existing product provides an initial adoption channel, but the funded value is broader. The Credential Utility already supplies the network primitive for an issuer to make privacy-respecting claims to a holder. The Registry Utility can use credentials in onboarding and token workflows. The missing piece is a reusable profile and provider-neutral integration path that connects an off-ledger verification decision to those native capabilities and gives applications consistent relying-party logic.

Without a shared path, every application repeats provider callbacks, party binding, claim mapping, expiry, revocation, audit evidence, wallet consent, and access logic. The open profile, adapter, SDK, and tests make that work reusable. The proposal measures impact through independent integrations, wallet interoperability, ten ecosystem groups, and 500 verified active participants rather than an unsupported claim about the percentage of Canton that will adopt the product.

The applicant's longer-term pipeline and partnership forecasts are not counted as grant acceptance metrics. Only completed, independently verifiable adoption will count.

---

## Rationale

The project extends what Canton already provides.

A new private Daml identity contract would fragment the ecosystem and duplicate the Credential Utility's issuer, holder, claim, validity, observer, and revocation semantics. Keeping the result only in myCircle's database would prevent other Canton applications from relying on it. Publishing only a proprietary API would create a vendor dependency and would not compose with Canton-native credential requirements.

The proposed layered approach avoids those outcomes:

1. The Credential Utility remains the source of Canton-native attestation state.
2. The open profile standardizes claim meaning and issuer policy.
3. The provider adapter handles off-ledger verification events and Canton issuance mechanics.
4. The consumer SDK provides deterministic evaluation and conformance tests.
5. The Builders Circle supplies a real adoption environment while independent integrations prove portability.

This separation also limits data exposure. The identity provider does not receive ledger authority, the relying application does not receive raw KYC evidence, and the Canton credential states only what the named issuer's published policy supports.

---

## Sustainability and Maintenance

myCircle Technologies PBC and Envazia Technologies will maintain the open-source profile, adapter, SDK, examples, and reference deployment for **five years** after final acceptance.

Maintenance will be funded through myCircle SaaS subscriptions, enterprise community services, and optional paid integration and support. The open specification, SDK, mock provider, conformance suite, and reference code will remain available without a myCircle commercial account.

The maintenance commitment includes:

- A named public maintainer and security-reporting process.
- Acknowledgement of security reports within two business days.
- A critical-issue mitigation or remediation target of seven days.
- Compatibility updates for supported Credential Utility, JSON Ledger API, and CIP-0103 releases.
- Semantic versioning, public changelogs, migration guides, and quarterly dependency reviews.
- Continued availability of a reproducible local environment if the hosted reference service is later discontinued.

The Apache-2.0 license and reproducible deployments will allow community forking or maintenance transfer if the implementing team can no longer operate the project.

---

## Risks and Dependencies

- **Champion confirmation:** The applicant confirms that written consent from Viv Diwakar has been obtained and will retain that confirmation for Foundation review.
- **Identity provider dependency:** Stripe Identity or another provider may change pricing, supported countries, verification behavior, or API terms. A provider-neutral interface and mock provider reduce lock-in.
- **Wallet participation:** Specific wallet integrations depend on third-party availability and consent. Acceptance is based on two independent implementations, with substitutions allowed if the named outreach targets are unavailable.
- **Canton environments and utilities:** TestNet or MainNet access, supported package versions, or commercial agreements may affect deployment timing. DevNet and reproducible local delivery remain available.
- **Privacy and regulatory obligations:** Each issuer remains responsible for consent, retention, deletion, KYC, biometric, and jurisdictional requirements. The software is not legal advice or a compliance certification.
- **Issuer trust is contextual:** The project standardizes how an issuer attests and how an application evaluates the attestation; it does not require any relying party to trust myCircle.
- **Adoption dependency:** Ecosystem groups and external integrators must participate voluntarily. The team will recruit design partners in Milestone 1 and report participation risk before Milestone 2 funding is released.
- **Security risk:** Identity and access systems are high-value targets. The project uses staged deployments, least privilege, signed callbacks, negative privacy tests, incident runbooks, and an independent final review.

---

## Applicant and Current-State Evidence

- Applicant: myCircle Technologies PBC, represented by Leon Gomez, founder and CEO.
- Technical lead: Ahmed Ali, co-founder and CTO of myCircle and CEO of Envazia Technologies.
- Delivery team: Envazia engineers working in React, TypeScript, APIs, PostgreSQL, row-level security, and AI-assisted search.
- Public product: [myCircle](https://mycircle.co/) and [myCircle application](https://app.mycircle.co/).
- Public profiles: [LeonMyCircle](https://github.com/LeonMyCircle) and [Envazia](https://github.com/Envazia).

The team does not claim an established public Daml or Canton delivery history. Milestone 1 therefore includes independent Canton design reviews, and payment is tied to working public deliverables and external validation. The applicant confirms that evidence supporting the reported 840 paid customers is available for confidential Foundation review. Private technical blueprints, customer records, partnership letters, and security materials may also be provided confidentially where publication would disclose personal or commercially sensitive information.

---

## References

- [Canton Credential Utility introduction](https://docs.digitalasset.com/utilities/mainnet/overview/credential-user-guide/introduction.html)
- [Credential contract reference](https://docs.digitalasset.com/utilities/0.7/credential-model/Utility-Credential-V0-Credential.html)
- [Registry Utility credential requirements](https://docs.digitalasset.com/utilities/mainnet/overview/registry-user-guide/credential-requirements.html)
- [Canton ledger privacy model](https://docs.digitalasset.com/overview/3.5/explanations/ledger-model/ledger-privacy.html)
- [Canton JSON Ledger API](https://docs.digitalasset.com/build/3.4/explanations/json-api/index.html)
- [CIP-0056: Canton Network Token Standard](https://github.com/canton-foundation/cips/blob/main/cip-0056/cip-0056.md)
- [CIP-0103: dApp Standard](https://github.com/canton-foundation/cips/blob/main/cip-0103/cip-0103.md)
- [Stripe Identity verification checks](https://docs.stripe.com/identity/verification-checks?locale=en-GB&type=selfie)
- [Supabase Vault documentation](https://supabase.com/docs/guides/database/vault)
