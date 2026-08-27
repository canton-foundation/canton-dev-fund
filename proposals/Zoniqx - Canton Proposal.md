## Development Fund Proposal

**Author:** Priyanshu Sinha (CSO) | Elvis Rodrigues (CPO) | Prasanth Kalangi (CEO) | Rajat Kumar (Blockchain Lead), Zoniqx Inc
**Status:** Submitted  
**Created:** 2026-02-23  
**Revised:** 2026-08-24  
**Label:** dapp-integration  
**Champion:** Need Champion  
**Funding Request:** 250,000 CC  
**Delivery window:** 12 weeks

---

## Abstract

Zoniqx proposes a Canton-native integration of zConnect and an ERC-7518 compatibility profile using Digital Asset's existing DA Registry and Canton Token Standard infrastructure.

DA Registry capabilities for token issuance, minting, burning, holdings administration, transfers, permissions, credentials, recovery and settlement will provide the foundational asset and settlement layer. The grant-funded work will focus on zConnect's institutional distribution workflows and the ERC-7518 compatibility profile.

For instruments administered through DA Registry, DA Registry provides the authoritative asset-administration and holdings workflows. zConnect will be the system of engagement for issuers, investors and deal workflows.

The grant-funded public good outputs, being the ERC-7518 Canton Compatibility Profile, the Canton integration adapters and reference implementation, and the associated SDK components, conformance tests and documentation, will be released under Apache-2.0, subject to legal and ecosystem review. Zoniqx will continue operating the hosted zConnect platform commercially.

---

## Specification

### 1. Objective

Zoniqx will build a Canton native integration of zConnect and an ERC-7518 compatibility profile on top of Digital Asset's existing DA Registry and Canton Token Standard infrastructure.

The grant-funded work will focus on two differentiated contributions:

- Translate the regulated asset semantics defined by ERC-7518 into Canton compatible Daml workflows, metadata and integration interfaces.
- Connect zConnect's issuer origination, institutional deal distribution, subscription, allocation and investor network workflows to DA Registry and Canton's standard settlement APIs.

This approach reduces duplication, shortens delivery time and ensures that assets introduced through Zoniqx remain interoperable with Canton wallets, custodians, registries and applications.

**Scope boundary.** The integration will consume DA Registry capabilities for token issuance, minting, burning, holdings administration, transfers, permissions, credentials, recovery and settlement. Cross-chain work during the initial grant will cover interface specification; production bridging would require separate approval.

### 2. Implementation Mechanics

#### 2.1 Relationship with DA Registry

For instruments administered through DA Registry, DA Registry provides the authoritative asset administration and holdings workflows used by this integration, including:

- Instrument creation and asset administration
- Mint, burn and transfer workflows
- Canton Token Standard compatibility
- Holdings and ownership records
- Credential based permissions
- Allowlists, blocklists and transfer controls
- Asset recovery and administrative actions
- Allocation and delivery-versus-payment settlement
- Connectivity with Canton wallets, custodians and applications

Zoniqx will consume these capabilities through supported Daml interfaces and APIs.

| Layer | Primary responsibility |
| --- | --- |
| DA Registry and Canton Token Standard | Asset issuance, authoritative holdings, lifecycle administration, permissions, transfers and settlement |
| ERC-7518 compatibility profile | Regulated asset semantics, partition and share class mapping, compliance policy inputs and lifecycle compatibility |
| zConnect | Issuer origination, deal room workflows, investor discovery, subscriptions, allocation controls and institutional distribution |
| Zoniqx compliance integration | Evaluation of jurisdictional, offering and investor rules using credentials and policy decisions consumed by Canton workflows |

#### 2.2 ERC-7518 Compatibility Profile

ERC-7518 is defined for Solidity and the EVM account model. Canton uses Daml contracts, privacy-aware multi-party workflows and the Canton Token Standard. The project will map ERC-7518 semantics directly to Canton-native contracts and workflows.

Zoniqx will produce an ERC-7518 Canton Compatibility Profile documenting how each required regulated-asset behavior is represented through Canton-native contracts and workflows.

| ERC-7518 capability | Proposed Canton treatment |
| --- | --- |
| Partitions and share classes | Canton instrument configurations, instrument metadata and separate regulated holding classes |
| Transfer eligibility | Credential requirements, transfer preapproval, registry controls and Zoniqx compliance policy decisions |
| Transfer restrictions | Canton-native authorization and registry workflows enforcing issuer, jurisdiction and offering restrictions |
| Lock and unlock | Holding, allocation or instrument level workflow controls selected during architecture validation |
| Freeze and unfreeze | Authorized registry administration and recovery workflows with auditable role based controls |
| Forced transfer and recovery | Existing DA Registry recovery and administrative capabilities, extended only where a documented gap exists |
| Compliance vouchers | Signed or verifiable compliance decisions mapped to Canton credentials, metadata or workflow authorizations |
| Payouts and distributions | Canton Token Standard asset and cash allocations coordinated through zConnect settlement workflows |
| Asset lifecycle events | Registry native mint, burn, redemption and administration workflows |
| Cross-chain compatibility | Interface specification during the initial grant; production bridging would require separate approval |

Where DA Registry already provides the required behavior, the compatibility profile will reference and use it. Where a genuine gap exists, Zoniqx will develop the smallest reusable adapter or Daml interface necessary to represent the ERC-7518 requirement.

If the architecture review identifies functionality that would benefit the broader Canton ecosystem, Zoniqx will work with its ecosystem champion and the relevant Special Interest Group to determine whether the output should become a reusable integration pattern, open-source package or future Canton Improvement Proposal.

#### 2.3 zConnect Institutional Distribution Layer

zConnect will operate above the registry and settlement layer, focusing on the origination and controlled distribution of institutional assets to an existing buy-side network.

The Canton integration will support:

- Issuer and offering onboarding
- Secure deal rooms and offering-document access
- Investor discovery and invitation workflows
- Investor qualification and suitability checks
- Jurisdiction-specific distribution eligibility
- Subscription and indication-of-interest workflows
- Allocation approval and rejection
- Offering caps and remaining allocation calculations
- Allocation instructions for Canton settlement
- Delivery-versus-payment transaction orchestration
- Issuer and investor activity reporting

Distribution rules will be configurable per offering. The specific policy parameters will be defined with each issuer during onboarding.

#### 2.4 End-to-End Workflow

1. An issuer or authorized registrar creates a Canton-compatible instrument through DA Registry.
2. ERC-7518 asset characteristics and regulated-asset policies are attached through the agreed compatibility profile.
3. The issuer creates an offering in zConnect and defines its distribution policy.
4. Eligible institutional participants are invited from the zConnect network.
5. Investor credentials and suitability information are evaluated while personally identifiable information remains off the shared ledger.
6. zConnect applies offering, jurisdiction, investor and allocation rules.
7. Approved subscriptions are converted into Canton Token Standard allocation requests.
8. Wallets and counterparties authorize the corresponding asset and payment allocations.
9. The transaction settles using Canton-native delivery-versus-payment workflows.
10. DA Registry updates the authoritative asset holdings while zConnect updates the deal, allocation and distribution records.

#### 2.5 Technical Components

| Component | Description |
| --- | --- |
| A. DA Registry integration adapter | A reusable integration layer connecting zConnect with DA Registry workflows and Canton Token Standard APIs |
| B. ERC-7518 Canton Compatibility Profile | A public technical specification mapping regulated-asset semantics into Canton-native primitives |
| C. Compliance-policy adapter | An adapter that evaluates Zoniqx offering and jurisdictional rules, provides the corresponding policy decision or credential evidence to the Canton workflow, and consumes credential and allowlist infrastructure supplied by DA Registry |
| D. zConnect Canton transaction orchestrator | A service that converts approved subscriptions and allocations into Canton-compatible allocation and settlement instructions |
| E. SDK, documentation and conformance tests | Documentation, reference code and automated tests enabling other Canton ecosystem participants to understand and reproduce the integration pattern |

### 3. Architectural Alignment

| Canton principle | This proposal |
| --- | --- |
| Sub-transaction privacy | Investor credentials and suitability information are evaluated while personally identifiable information remains off the shared ledger |
| Composable Daml contracts | Integration adapters consume DA Registry workflows and Canton Token Standard APIs through supported interfaces |
| Multi-party workflows | Issuer, distributor, investor and registry participate in origination, subscription, allocation and settlement with their respective visibility |
| Reuse existing capabilities | The DA Registry overlap and reuse assessment is a Milestone 1 deliverable; every proposed adapter must be justified against a documented gap |

The integration uses standard Daml packages and integration services while preserving the Canton core protocol and SDK.

### 4. Backward Compatibility

No backward compatibility impact. All components are additive and consume published DA Registry and Canton Token Standard interfaces. The compatibility profile will state its version assumptions and will be maintained against supported Token Standard versions.

---

## Milestones and Deliverables

Each funded milestone has objective technical outputs within Zoniqx's delivery control, with objective acceptance criteria. Post-launch commercial adoption is measured separately and is set out after Milestone 4.

### Milestone 1: Architecture and Compatibility Validation

**Timeline:** Weeks 1 to 2

**Deliverables**

- Complete DA Registry overlap and reuse assessment
- ERC-7518-to-Canton capability mapping
- zConnect and DA Registry integration architecture
- Canton participant, application and service topology
- Compliance and credential data-flow specification
- Distribution-policy model
- Public versus proprietary component definition
- Security and privacy threat-model outline
- Implementation and conformance-test plan
- Review with the ecosystem champion and technical partners

**Acceptance criteria**

- Every ERC-7518 capability is classified as supported directly by DA Registry, supported through Canton Token Standard interfaces, requiring a Zoniqx adapter, or deferred from the initial grant scope
- The architecture reuses existing registry, credential and settlement infrastructure
- The champion or designated Canton technical reviewer confirms architectural alignment
- All public deliverables and proposed licenses are documented
- Daml scaffolding and the integration-test environment are operational

**Adoption readiness.** Zoniqx will provide the committee a confidential, categorized summary of its active issuer pipeline relevant to Canton. This includes issuers across private credit, government invoice factoring, sovereign-backed bonds, regulated fund vehicles and commodity tokenization. Issuer identities will be shared with the committee under confidentiality where required. This evidence supports the adoption case; milestone acceptance remains based on the technical criteria above.

### Milestone 2: ERC-7518 Compatibility and End-to-End Proof of Concept

**Timeline:** Weeks 3 to 5

**Deliverables**

- First version of the ERC-7518 Canton Compatibility Profile
- DA Registry integration adapter
- Compliance-policy adapter
- Representative regulated instrument configured on Canton testnet
- zConnect deal and subscription workflow
- Canton Token Standard allocation request
- End-to-end testnet delivery-versus-payment demonstration
- Automated tests for eligible and ineligible transfers

**Acceptance criteria**

- Creation or configuration of a regulated test instrument through existing Canton infrastructure
- ERC-7518 partition or share-class representation
- Investor-eligibility evaluation
- Rejection of an ineligible subscription or transfer
- Approval of an eligible subscription
- Creation of the corresponding allocation request
- Successful testnet settlement
- Reconciliation between DA Registry holdings and zConnect deal records

A synthetic but commercially representative asset structure may be used to keep completion independent of external timelines.

### Milestone 3: Testnet Release and External Validation

**Timeline:** Weeks 6 to 9

**Deliverables**

- Production-quality testnet integration
- Issuer and investor workflow interfaces
- Configurable distribution-policy controls
- SDK and API documentation
- Deployment guide
- Compatibility and conformance-test suite
- Operational monitoring and reconciliation
- External technical validation with the champion or another Canton participant
- Pilot onboarding package prepared for an initial design partner issuer drawn from the Zoniqx pipeline, with buy-side participants from the zConnect network invited for testnet feedback

**Acceptance criteria**

- An external Canton ecosystem reviewer completes the documented workflow
- At least one representative offering is processed end to end
- Distribution rules enforce eligibility and allocation constraints
- The SDK and documentation enable a third party to reproduce the integration
- Critical security or architecture findings are resolved or documented with an approved remediation plan

### Milestone 4: Production Readiness and Mainnet Deployment

**Timeline:** Weeks 10 to 12

**Deliverables**

- Production Canton packages and integration services
- Final ERC-7518 Canton Compatibility Profile
- Security review and remediation report
- Mainnet deployment configuration
- Operational runbook and incident procedures
- Upgrade and maintenance policy
- Opensource release of the grant funded public components
- Controlled mainnet transaction or equivalent production readiness validation approved by the champion

**Acceptance criteria**

- Public packages compile, deploy and pass the conformance suite
- The integration works with applicable Canton Token Standard and DA Registry interfaces
- All critical security findings are resolved
- A production operator can deploy and maintain the public components using the documentation
- The production workflow demonstrates instrument configuration, eligibility validation, allocation and settlement
- Zoniqx begins its 12 month maintenance period

### Post-Launch Adoption Commitments

Technical milestone completion and post launch commercial adoption are measured separately. Zoniqx commits to the following adoption effort in the 12 months following production release, reported transparently to the foundation:

- Onboard 2 to 3 issuers onto the Canton integration in the first 6 months, drawn from Zoniqx's existing pipeline of regulated issuers across private credit, government receivables, sovereign backed instruments and fund tokenization
- Target 5 or more issuers entering implementation within 12 months
- Activate institutional buy side participants from the zConnect network, which includes family offices, broker dealer networks, hedge funds and DeFi capital allocators, for Canton offerings
- At least one live regulated instrument with completed allocations and settled transactions on Canton within 12 months, subject to the issuer's legal and compliance approvals

Zoniqx currently supports issuance across 29 jurisdictions and will prioritize asset classes with the strongest institutional demand for Canton's privacy enabled settlement.

---

## Acceptance Criteria

The Tech & Ops Committee may evaluate completion based on the per-milestone acceptance criteria set out above, together with:

- **Demonstrated reuse.** Every ERC-7518 capability is classified against DA Registry and Canton Token Standard capabilities, and the architecture reuses existing registry, credential and settlement infrastructure
- **External validation.** An external Canton ecosystem reviewer completes the documented workflow at Milestone 3
- **Reproducibility.** The SDK and documentation enable a third party to reproduce the integration
- **Production readiness.** Public packages compile, deploy and pass the conformance suite at Milestone 4, with all critical security findings resolved
- **Maintenance.** Zoniqx begins its 12 month maintenance period on the grant funded packages

---

## Funding

**Total Funding Request:** 250,000 CC

### Payment Breakdown by Milestone

- Milestone 1, Architecture and Compatibility Validation: 50,000 CC upon committee acceptance
- Milestone 2, ERC-7518 Compatibility and End-to-End Proof of Concept: 62,500 CC upon committee acceptance
- Milestone 3, Testnet Release and External Validation: 75,000 CC upon committee acceptance
- Milestone 4, Production Readiness and Mainnet Deployment: 62,500 CC upon final release and acceptance

The first payment becomes due upon committee acceptance of Milestone 1.

### Volatility Stipulation

Total duration is 12 weeks, under six months. Should Committee requested scope changes extend the project beyond six months, remaining milestones will be renegotiated per Development Fund volatility policy.

---

## Co-Marketing

Upon production release, Zoniqx and the Canton Foundation will collaborate on:

- Announcement coordination anchored on the first live offering distributed through the integration
- A technical blog and implementation guide covering the integration pattern and the ERC-7518 Canton Compatibility Profile, aimed at teams bringing regulated assets to Canton from EVM ecosystems
- A developer workshop or reference walkthrough for Canton builders integrating against the published SDK
- Maintenance of the grant funded packages and compatibility profile for at least 12 months following production release

Any issuer specific case study requires that issuer's prior written authorisation.

---

## Motivation

For instruments administered through DA Registry, DA Registry provides the authoritative asset administration and holdings workflows, including permissions, transfers and delivery-versus-payment(DvP) settlement. The Canton Token Standard provides the standard interfaces through which those instruments are held and settled.

This proposal adds the zConnect integration layer for the origination and controlled distribution of institutional assets to an existing buy-side network. Issuers may otherwise need to integrate investor qualification, jurisdiction specific distribution eligibility, subscription handling and allocation control independently.

The proposal also provides a documented representation of regulated asset semantics for issuers arriving from EVM ecosystems. ERC-7518 is defined for Solidity and the EVM account model, and the compatibility profile will provide a common reference for teams reasoning about the same instrument across both environments.

This proposal addresses both. It ensures that assets introduced through Zoniqx remain interoperable with Canton wallets, custodians, registries and applications, and it publishes the integration pattern, SDK, conformance tests and compatibility profile so other Canton ecosystem participants can understand and reproduce it.

---

## Rationale

**Building on DA Registry.** DA Registry already provides instrument creation, mint, burn and transfer workflows, Canton Token Standard compatibility, holdings and ownership records, credential-based permissions, allowlists and blocklists, asset recovery, and allocation and delivery-versus-payment settlement. Zoniqx will consume these capabilities through supported Daml interfaces and APIs. This approach reduces duplication and shortens delivery time.

**Validating the boundary before implementation.** The DA Registry overlap and reuse assessment is the first deliverable and validates the integration boundary before implementation. Every ERC-7518 capability is classified as supported directly by DA Registry, supported through Canton Token Standard interfaces, requiring a Zoniqx adapter, or deferred from the initial grant scope. Where DA Registry already provides the required behavior, the compatibility profile references and uses it. Where a genuine gap exists, Zoniqx develops the smallest reusable adapter or Daml interface necessary.

**Canton-native compatibility specification.** ERC-7518 is defined for Solidity and the EVM account model, while Canton uses Daml contracts and privacy aware multiparty workflows. The compatibility profile documents how each regulated-asset behavior is represented through Canton-native contracts and workflows so other ecosystem participants can use it.

**Configurable policy.** Distribution rules are configurable per offering, with the specific policy parameters defined with each issuer during onboarding, because regulated distribution requirements vary by issuer, jurisdiction and offering structure.

**Separating public good from commercial product.** The grant funds the ERC-7518 Canton Compatibility Profile, the Canton integration adapters and reference implementation, and the associated SDK components, conformance tests and documentation, released under Apache-2.0 subject to legal and ecosystem review. Zoniqx continues operating the hosted zConnect platform commercially. If the architecture review identifies functionality that would benefit the broader ecosystem, Zoniqx will work with its champion and the relevant Special Interest Group to determine whether the output should become a reusable integration pattern, open-source package or future Canton Improvement Proposal.

---

## Reference Links

- [DA Registry](https://www.digitalasset.com/registry)
- [Canton Development Fund SIG Directory](https://github.com/canton-foundation/canton-dev-fund/blob/main/sig-directory.md)
- [CIP-0056, Canton Network Token Standard](https://github.com/canton-foundation/cips/blob/main/cip-0056/cip-0056.md)
- [CIP-0112, Canton Network Token Standard V2](https://github.com/canton-foundation/cips/blob/main/cip-0112/cip-0112.md)
- [ERC-7518](https://eips.ethereum.org/EIPS/eip-7518)
