## Development Fund Proposal

**Author:** Node Fortress
**Status:** Under Review
**Created:** 2026-05-21
**Category:** Wallet Infrastructure / Interoperability
**Related CIPs:** CIP-0082: Establish a 5% Development Fund (Foundation-Governed), CIP-0056: Token Standard, CIP-0103: dApp Standard
**Related grant proposals:** None

---

## Abstract

Node Fortress proposes to implement CIP-0103 compliance within an operational MetaMask-based wallet infrastructure deployed on Canton MainNet. This work will deliver a production-grade, provider-agnostic interoperability layer enabling standardized interaction between decentralized applications (dApps) and Canton wallet workflows.

The wallet is implemented as a MetaMask Snap, enabling Canton interaction through a widely adopted wallet interface already familiar to developers and users across broader Web3 ecosystems. By leveraging existing MetaMask workflows, this project reduces onboarding friction for both developers and end users while expanding accessibility for Canton-based applications.

Node Fortress currently operates a production multi-asset wallet architecture supporting signing, transaction execution, and ledger interaction workflows involving Canton Coin and CIP-0056 tokenized assets including USD and BTCX, deployed on Canton MainNet and validated through production transaction workflows.

Funding will support implementation of CIP-0103-compliant provider interfaces, publication of developer-facing integration resources, open-source ecosystem enablement, and code hardening and security audit work to ensure the implementation meets production-grade standards suitable for ecosystem reuse.

This project is intended to complement broader Canton wallet ecosystem initiatives by extending Canton accessibility into MetaMask-native and Snap-compatible workflows while promoting reusable, standards-oriented wallet infrastructure across the ecosystem.

---

## Specification

### 1. Objective

The Canton ecosystem currently lacks a CIP-0103 compliant wallet implementation capable of integrating Canton functionality into existing MetaMask-native workflows and broader Web3 wallet interaction patterns.

Although Canton provides powerful infrastructure for tokenized assets and decentralized workflows, integration pathways for developers and end users remain limited compared to more mature Web3 ecosystems. Existing onboarding patterns often require ecosystem-specific tooling and workflows unfamiliar to users and developers accustomed to MetaMask and browser-native wallet interaction models.

This proposal addresses several ecosystem challenges:

* Lack of CIP-0103 compliant provider infrastructure for Canton wallets
* Limited interoperability between Canton applications and established Web3 wallet workflows
* Increased onboarding friction for developers and users entering the Canton ecosystem
* Absence of a production-grade MetaMask-native Canton wallet integration path
* Limited availability of reusable open-source wallet infrastructure and implementation guidance

Unlike greenfield reference implementations, this proposal builds upon an already operational production wallet architecture deployed on Canton MainNet and validated through production transaction workflows.

The intended outcome is delivery of a reusable, standards-oriented MetaMask-native Canton wallet infrastructure layer capable of supporting ecosystem interoperability and broader developer accessibility.

### 2. Implementation Mechanics

Node Fortress will implement CIP-0103 compliant provider functionality within its existing MetaMask Snap-based wallet architecture.

The resulting infrastructure will provide:

* CIP-0103 compliant wallet provider interfaces
* Standardized dApp-to-wallet communication flows
* MetaMask-native Canton wallet integration
* Provider-agnostic wallet interaction patterns
* Open-source implementation resources and developer guidance
* Reference deployment patterns

The wallet architecture already supports:

* Canton Coin transaction workflows
* CIP-0056 tokenized asset support
* Multi-asset wallet management
* Transaction signing and submission

Implementation of CIP-0103 will enable Canton dApps to interact with the wallet using standardized provider interfaces while preserving compatibility with MetaMask-native workflows familiar to broader Web3 users and developers.

The architecture is intentionally designed around reusable, provider-agnostic integration patterns to support future interoperability and collaborative ecosystem stewardship opportunities where appropriate.

Node Fortress additionally intends to publish relevant implementation components and integration guidance under the Apache 2.0 license, initially hosted under the Node Fortress GitHub organization, with the intent to transition to a community or ecosystem stewardship structure as the project matures.

Implementation work additionally involves security-sensitive transaction signing infrastructure, MetaMask Snap integration constraints, provider interoperability validation, production-readiness hardening, and compatibility testing across browser-native wallet environments. These areas require specialized engineering and operational expertise due to the security and interoperability requirements associated with production wallet infrastructure.

### 3. Architectural Alignment

This proposal aligns with broader Canton ecosystem goals around interoperability, standards adoption, and open ecosystem infrastructure.

By implementing CIP-0103 within a MetaMask Snap architecture, the project extends Canton accessibility into existing Web3 wallet interaction patterns while supporting standardized communication flows between dApps and wallet providers.

The project additionally promotes:

* Open standards adoption
* Provider interoperability
* Reusable wallet infrastructure
* Reduced ecosystem fragmentation
* Developer onboarding accessibility

While other ecosystem wallet efforts focus on broader reference wallet implementations, Node Fortress focuses specifically on interoperability between Canton and existing Web3 wallet interaction patterns already familiar to developers and users across the Ethereum ecosystem.

This proposal directly aligns with:

* CIP-0103 provider interoperability goals
* CIP-0056 tokenized asset workflows
* Ecosystem accessibility and onboarding initiatives
* Open-source infrastructure objectives

### 4. Backward Compatibility

No backward compatibility impact.

The proposed implementation extends existing wallet interoperability capabilities without requiring modification to existing Canton applications, ledger infrastructure, or CIP-0056 asset workflows.

---

## Milestones and Deliverables

### Milestone 1: CIP-0103 Provider Implementation

* **Estimated Delivery:** 8 weeks after CIP approval
* **Focus:** Implementation of CIP-0103 compliant provider functionality and standardized dApp interaction flows
* **Deliverables / Value Metrics:**

  * CIP-0103 provider support
  * Standardized provider interfaces
  * Wallet connection workflows
  * Signing compatibility updates
  * Provider event handling and session management
  * Successful interoperability testing with Canton dApps
  * Compatibility validation across supported MetaMask environments

### Milestone 2: Open Source Ecosystem Enablement

* **Estimated Delivery:** 6 weeks following committee acceptance of Milestone 1
* **Focus:** Publication of reusable wallet infrastructure resources and developer integration guidance
* **Deliverables / Value Metrics:**

  * Publication of CIP-0103 compliant wallet infrastructure components to the Node Fortress GitHub organization under Apache 2.0
  * Developer quickstart and integration guidance covering CIP-0103 wallet connection and provider interaction workflows
  * At least one end-to-end sample dApp integration demonstrating CIP-0103 provider interaction with the MetaMask Snap
  * Reusable provider utilities and reference configuration examples for Canton dApp developers

### Milestone 3: Code Hardening, Security Audit, and Reference Architecture Finalization

* **Estimated Delivery:** 8 weeks following committee acceptance of Milestone 2
* **Focus:** Polishing the implementation into a production-grade reference architecture suitable for ecosystem reuse, including security audit, code hardening, and general infrastructure guidance for deployers
* **Deliverables / Value Metrics:**

  * Independent security audit with all critical and high severity findings resolved
  * Code hardening and remediation based on audit findings
  * General infrastructure deployment guidance and operational recommendations for ecosystem adopters
  * Reference architecture documentation and configuration examples
  * Production resilience patterns and best practices for Canton Snap deployments

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

* Deliverables completed as specified for each milestone
* Demonstrated functionality or operational readiness
* Documentation and knowledge transfer provided
* Alignment with stated value metrics
* Successful CIP-0103 interoperability validation
* Public availability of committed open-source resources
* Demonstrated MetaMask-native Canton wallet workflows validated on Canton MainNet

---

## Funding

**Total Funding Request:** 5,000,000 CC

### Payment Breakdown by Milestone

* Milestone 1 (CIP-0103 Provider Implementation): 2,000,000 CC upon committee acceptance
* Milestone 2 (Open Source Ecosystem Enablement): 1,250,000 CC upon committee acceptance
* Milestone 3 (Code Hardening, Security Audit, and Reference Architecture Finalization): 1,750,000 CC upon final release and acceptance

### Budget Allocation

The majority of the requested funding supports engineering and implementation effort, including CIP-0103 compliance work, interoperability validation, and implementation hardening. The remainder covers an independent security review. While Node Fortress is already whitelisted for MetaMask Snap distribution, the scope of changes introduced by this work warrants a fresh review to ensure production-grade security standards are maintained. Independent security reviews of this nature typically cost $15,000–$18,000 USD equivalent.

### Open-Source Adoption Considerations

As with many open-source reference implementations, direct measurement of downstream ecosystem adoption may be inherently limited, as integration patterns, code reuse, and internal implementation dependencies are not always publicly visible. Public repository activity and ecosystem engagement will be used as lightweight indicators of external adoption and developer interest following publication.

### Volatility Stipulation

The grant is denominated in fixed Canton Coin and the proposer assumes price volatility risk. Should the project extend beyond the planned timeline due to requested scope changes by the committee, the remaining un-minted milestones must be renegotiated.

### Acceleration Bonus

If all milestones are delivered and accepted by the committee:
* 30 days prior to the Milestone 3 estimated delivery date, a +20% bonus on the final payout will be awarded
* 15 days prior to the Milestone 3 estimated delivery date, a +10% bonus on the final payout will be awarded

### Late Penalty

In case the project delivers its final milestone later than the predicted timeline, the final payment will be reduced each month by 10 percent of the nominal project total for the first four months after the original planned completion date, then holding at 10% of the baseline total.

### Maintenance

Long-term maintenance is intended to be supported through the transition to community or ecosystem stewardship outlined above, with the open-source publication under Apache 2.0 enabling any ecosystem participant to contribute fixes and improvements.

---

## Ecosystem Impact

The delivery of CIP-0103 compliant MetaMask-native Canton wallet infrastructure addresses existing interoperability and onboarding gaps within the Canton ecosystem:

* **Expanded Ecosystem Reach:** By bridging Canton into MetaMask-native workflows, this project extends Canton applications and tokenized asset workflows into an established Web3 wallet ecosystem already familiar to a broad base of developers and end users.
* **Reduced Developer Onboarding Friction:** CIP-0103 compliant provider interfaces and open-source reference implementations give dApp developers a standardized, familiar integration path — eliminating the need to engineer custom Canton wallet connectivity from scratch.
* **Standards Adoption and Interoperability:** Full CIP-0103 compliance within a production-grade MetaMask Snap establishes a reusable interoperability pattern that benefits the broader Canton wallet ecosystem and supports consistent dApp integration across wallet providers.
* **Open-Source Ecosystem Enablement:** Publication of implementation components and integration guidance under Apache 2.0 reduces fragmentation across Canton wallet integrations and provides a foundation for community-driven stewardship and future ecosystem contributions.

---

## Co-Marketing

Upon release, Node Fortress will collaborate with the Foundation on:

* Announcement coordination
* Technical blog and implementation overview
* Developer onboarding and ecosystem promotion
* Demonstrations of MetaMask-native Canton wallet interoperability workflows
* Educational materials related to CIP-0103 wallet integration patterns

---

## Motivation

This proposal expands accessibility to the Canton ecosystem by introducing a MetaMask-native interoperability layer built around open standards and reusable wallet infrastructure.

MetaMask is among the most widely adopted and recognized wallet interfaces in the broader Web3 ecosystem, with deep familiarity among crypto-native developers and end users. Despite Canton's growing infrastructure for tokenized assets and institutional workflows, no integration path currently exists for this user base. Bridging Canton into MetaMask-native workflows extends Canton's reach into an established and widely trusted wallet ecosystem, reducing onboarding friction through familiar interaction patterns for developers and end users already accustomed to broader Web3 tooling.

By building upon an already operational production wallet architecture rather than a greenfield implementation, this proposal accelerates ecosystem value delivery while reducing execution risk. Because the resulting infrastructure is intended to operate as reusable open-source ecosystem tooling, the proposal includes investment into documentation, interoperability validation, and reusable deployment guidance intended to benefit broader Canton ecosystem adoption beyond the immediate implementation itself.

---

## Rationale

Implementing CIP-0103 within an existing MetaMask Snap architecture represents a pragmatic and ecosystem-aligned approach to expanding Canton interoperability.

Alternative approaches considered included:

* Building a standalone wallet implementation
* Restricting functionality to proprietary integrations
* Delaying standards implementation pending broader ecosystem maturity

These alternatives were rejected because they would either:

* Increase onboarding friction
* Reduce interoperability
* Fragment wallet interaction patterns
* Limit reuse across the ecosystem

MetaMask-native integration was selected because it leverages an already widely adopted wallet interaction model familiar to developers and users across broader Web3 ecosystems.

Using a Snap-based architecture additionally allows Canton functionality to coexist within established browser-native wallet workflows while preserving security isolation and standards-oriented provider interfaces.

This approach maximizes ecosystem reuse potential while reducing long-term fragmentation across Canton wallet integrations and supporting future collaborative stewardship opportunities.
