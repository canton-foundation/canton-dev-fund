## Development Fund Proposal

**Title:** Open-Source MiCA EMT Issuance Framework for Canton  
**Author:** Schuman Financial  
**Champion:** W. Eric Saraniecki, Co-Founder & Head of Network Strategy, Digital Asset 
**Status:** Draft  
**Created:** 2026-07-14  
**Label:** token-asset-standards  
**Proposed license:** Apache-2.0, subject to final legal review  

---

## Abstract

Schuman Financial is a leading euro stablecoin issuer and payments company. We provide the solutions, technologies and infrastructure for rebuilding euro-denominated financial services on-chain. Our core product is EURØP, a euro-denominated stablecoin issued by our French-licensed subsidiary regulated by Banque de France.

As we prepare to deploy EURØP on Canton, we have identified the need for a reusable Electronic Money Token (i.e. stablecoin) issuance framework that can support regulated fiat stablecoin activity on the network. The goal is to develop and publish an open-source framework that other regulated issuers and Canton ecosystem participants can use to deploy quickly, easily and cheaply.

The proposed framework would provide the technical and operational foundation for regulated stablecoins on Canton, including minting, burning, issuer controls, holder eligibility hooks, blacklist and freeze functionality, force-transfer support where required, reporting, regulator and auditor patterns, key ceremony documentation, deployment guidance, and issuer platform integration.

EURØP would be the first intended implementation, using Schuman’s experience as a regulated European EMT issuer as the reference point. The funded deliverable, however, would be issuer-neutral and released under an open-source license.

The framework would support stablecoins referencing one official currency, such as EUR, USD, GBP, CHF, or PLN, provided the issuer itself is properly licensed. It would create a common foundation for regulated fiat stablecoin issuance on Canton and help support wider adoption of regulated tokenisation, institutional settlement, collateral mobility, intraday repo, treasury flows, and payment use cases.

---

## Specification

### 1. Objective

The objective is to develop an open-source EMT issuance framework for Canton that can be used by regulated issuers and Canton ecosystem participants as a reusable foundation for fiat-backed stablecoin issuance.

The framework will focus first on EMT-style fiat stablecoins referencing one official currency, such as EUR, USD, GBP, CHF, or PLN, issued by licensed entities. This is the most immediate use case because regulated fiat stablecoins are the settlement asset needed for many other regulated financial workflows.

The framework is intended to become a reusable base layer for broader MiCA-regulated and institutionally regulated activity on Canton, including tokenized assets, tokenized bonds, RWA workflows, collateral mobility, intraday repo, treasury flows, and regulated payment use cases.

### 2. Implementation Mechanics

The framework will be designed as an issuance and settlement foundation for projects building on Canton.

The framework will include:

- mint and burn functionality
- issuer admin roles
- blacklist, freeze, force-transfer, and related issuer/regulator controls
- holder eligibility hooks to prevent sanctioned or flagged parties from receiving or holding the token
- supply reporting
- regulator and auditor visibility patterns
- disclosure, reserve, and attestation metadata
- documentation, tests, audit, and reference deployment

#### Technical deliverables

1. **Smart Contract**

   A default Canton/Daml smart contract framework for EMT-style stablecoin issuance, including minting, burning, issuer controls, holder eligibility hooks, blacklist/freeze/force-transfer functions, metadata, and reporting hooks.

2. **Audit**

   An independent security audit of the default smart contract and core framework, with findings either resolved or clearly documented.

3. **Deployment Scheme**

   A reference deployment scheme for issuers, covering expected infrastructure setup, cloud deployment considerations, environment separation, operational responsibilities, and production-readiness assumptions.

4. **API Integration Interface**

   An API/interface layer or integration specification that allows issuer platforms to connect to the framework for common workflows, including mint, burn, holder eligibility updates, freeze/unfreeze, reporting queries, and metadata updates.

#### Document deliverables

1. **Framework README / Overview**

   A plain-language overview explaining what the framework is, who it is for, what problem it solves, what is in scope, and what is out of scope.

2. **Key Ceremony Documents**

   Documentation for institutional strength key ceremony and certification as generally required by regulators and auditors, covering issuer keys, admin keys, mint/burn permissions, emergency roles, key rotation, separation of duties, and governance over sensitive functions such as freeze, blacklist, and force-transfer.

3. **Regulator and Auditor Framework**

   Documentation explaining how the framework supports regulator and auditor visibility, including observer patterns, control-event records, admin action history, and metadata references.

4. **Reporting**

   Documentation and reference outputs for supply reporting, mint/burn reporting, movement reporting, control-event reporting, and related issuer reporting needs.

### 3. Architectural Alignment

Regulated stablecoin is a core fungible unit that serves as the critical building block and settlement asset for all TradFi activity on Canton.

Projects working on institutional settlement, tokenized assets, collateral mobility, intraday repo, treasury flows, and regulated payments need a compliant settlement asset. In Europe, that means MiCA-regulated EMT issued by licensed entities.

At the moment, each issuer would need to build its own Canton implementation from scratch: minting, burning, admin roles, blacklist and freeze functions, reporting, key ceremony documentation, regulator and auditor patterns, deployment setup, and issuer platform integration. This creates unnecessary duplication and slows down adoption. An open source issuance framework will enable others building on Canton to leverage this framework to develop their own smart contract, but also help in addressing regulatory, legal, compliance and audit issues for deployment.

This proposal would give the Canton ecosystem a common starting point with an audited, open-source EMT issuance framework that regulated issuers can adapt and build on. It would serve as a backbone for regulated financial activity on Canton, starting with regulated fiat stablecoins and extending to the wider set of use cases that depend on a compliant settlement asset.

### 4. Backward Compatibility

No backward compatibility impact.

The proposal introduces a new open-source reference framework for EMT-style stablecoin issuance on Canton. It does not require changes to existing Canton protocols, deployed applications, existing token implementations, or current integrations. Any compatibility assumptions, dependencies, or limitations will be documented as part of the framework README, deployment scheme, and release notes.

---

## Milestones and Deliverables

### Milestone 1: Specification and architecture

- **Estimated Delivery:** 30 days after approval
- **Focus:** Define the framework in detail before development begins.
- **Deliverables / Value Metrics:**
  - framework overview
  - technical architecture
  - smart contract functional specification
  - key ceremony outline
  - regulator and auditor framework outline
  - reporting model
  - deployment scheme outline
  - API integration outline
  - review of existing Canton / Digital Asset utilities that may be reused

**Acceptance criteria:**

The Champion and Canton reviewers can confirm that the scope is clear, useful to the ecosystem, not duplicative of existing work, and suitable for implementation.

### Milestone 2: Smart contract implementation

- **Estimated Delivery:** 60 days after approval
- **Focus:** Deliver the core smart contract framework.
- **Deliverables / Value Metrics:**
  - open-source Canton/Daml implementation
  - mint and burn functionality
  - issuer admin roles
  - blacklist, freeze, and force-transfer functions
  - holder eligibility hooks
  - metadata references
  - supply reporting hooks
  - tests
  - local reference deployment

**Acceptance criteria:**

A developer can deploy the framework locally, configure a sample EMT, mint and burn tokens, apply issuer controls, restrict ineligible holders, and inspect the resulting state changes.

### Milestone 3: Reporting, deployment, and integration layer

- **Estimated Delivery:** 90 days after approval
- **Focus:** Add the supporting tools needed by issuers and platforms.
- **Deliverables / Value Metrics:**
  - reporting documentation and reference outputs
  - regulator and auditor visibility patterns
  - deployment scheme
  - API integration interface
  - example platform workflows
  - expanded tests for reporting and control events

**Acceptance criteria:**

The framework gives issuers a practical basis for supply reporting, transaction/movement reporting, audit review, regulator visibility, and integration into issuer platforms.

### Milestone 4: Audit and final release

- **Estimated Delivery:** 180 days after approval
- **Focus:** Complete the framework and prepare it for ecosystem use.
- **Deliverables / Value Metrics:**
  - independent security audit
  - treatment of audit findings
  - final documentation
  - final reference deployment
  - final demo / acceptance test guide
  - open-source release
  - release notes

**Acceptance criteria:**

The framework can be reviewed, deployed, tested, and adapted by a Canton ecosystem participant other than Schuman. The final release is public, documented, audited, and issuer-neutral.

---

## Acceptance Criteria

The proposal will be considered successful if:

- the Champion and Canton reviewers confirm that the scope is clear, useful to the ecosystem, not duplicative of existing work, and suitable for implementation
- a developer can deploy the framework locally, configure a sample EMT, mint and burn tokens, apply issuer controls, restrict ineligible holders, and inspect the resulting state changes
- the framework gives issuers a practical basis for supply reporting, transaction/movement reporting, audit review, regulator visibility, and integration into issuer platforms
- the framework can be reviewed, deployed, tested, and adapted by a Canton ecosystem participant other than Schuman
- the final release is public, documented, audited, and issuer-neutral

---

## Funding

Total funding request: **approximately 1,312,471 CC**, targeting an equivalent budget of **€150,000**.

The approximate CC amount is calculated using a reference price of **$0.1303 per CC** and **EUR/USD 1.1401** on 2026-07-14. Final CC amounts should be confirmed with the Canton Foundation at approval.

| Milestone | EUR equivalent | Approx. USD equivalent | Approx. CC |
|---|---:|---:|---:|
| Specification and architecture | €15,000 | 131,247 CC |
| Smart contract implementation | €55,000 | 481,239 CC |
| Reporting, deployment and integration | €35,000 | 306,243 CC |
| Audit and final release | €45,000 | 393,741 CC |
| **Total** | **€150,000** | **1,312,471 CC** |

### Volatility stipulation

The Canton Coin amounts above are calculated at the time of proposal submission for an intended budget equivalent of €150,000.

Schuman Financial agrees to absorb exchange-rate volatility of up to 10% between the submitted CC amount and the intended EUR budget equivalent. If the CC/EUR or CC/USD exchange rate moves by more than 10% before approval or before a milestone payment, Schuman Financial and the Canton Foundation may mutually agree to renegotiate the remaining CC-denominated milestone amounts or payment methodology, subject to the Foundation’s approval process.

---

## Co-Marketing

Schuman Financial will support reasonable co-marketing with the Canton Foundation and relevant ecosystem participants once the framework is approved, released, or used as part of EURØP’s intended Canton deployment.

This may include announcement coordination, a technical blog post or case study, ecosystem communications, and participation in relevant Canton ecosystem discussions or events.

---

## Motivation

This project would give Canton a reusable framework for regulated stablecoin issuance.

It would reduce the work required for future EMT issuers to launch on Canton, provide a common reference point for audits and integrations, and make regulated fiat stablecoins easier to use in institutional settlement, tokenized asset workflows, collateral mobility, and other regulated Canton-based applications.

Schuman is willing to build this framework openly because EURØP needs the same foundation. The benefit to Canton is that the generic layer becomes public infrastructure rather than a private Schuman-only implementation.

---

## Rationale

Schuman proposes to contribute an open-source EMT issuance framework for Canton.

While EURØP is expected to be the first intended implementation, the framework will be developed as public, issuer-neutral infrastructure for the Canton ecosystem. The objective is to make regulated fiat-backed stablecoin issuance easier to evaluate, implement and integrate for other qualified issuers and ecosystem participants.

If approved, the project would provide Canton with a reusable reference framework for EMT-style stablecoins, helping reduce duplication and simplifying deployment of new EMTs, while supporting future regulated settlement, payment and tokenisation workflows.

---

## Maintenance

Schuman expects to maintain the framework after delivery for a defined initial period, subject to final agreement.

At minimum, Schuman will keep the repository public, document known limitations, respond to material issues during the post-release period, and support reasonable ecosystem review. Longer-term maintenance can be discussed with the Canton Foundation and ecosystem participants if the framework becomes widely used.
