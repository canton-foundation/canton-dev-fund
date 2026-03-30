## Development Fund Proposal

**Author:**  Digital Asset

**Status:** Submitted

**Created:** 2026-03-16

**Category:** Reference implementations

**Related CIPs:** CIP 0082: Establish a 5% Development Fund (Foundation-Governed), CIP-103: dApp Standard

**Related grant proposals:** Maintenance Grant for Splice Wallet Kernel Open Source, Development Fund Proposal: Wallet Gateway Reference Implementation

---

## Abstract

This proposal requests funding from the CIP-0082 Development Fund to architect and deliver two production-grade, open-source reference wallet packages: the Splice Portfolio dApp UI and the Splice Wallet Browser Extension. Operating strictly as provider-agnostic ecosystem public goods, these repositories provide end-to-end operational blueprints for integrating critical Canton Network protocol features, including CIP-0056 (Token Standard), CIP-0103 (dApp API), and multi-party hosting capabilities.

The deliverables are bifurcated to address distinct integration vectors:

* **Splice Portfolio dApp UI:** A portfolio wallet UI implementation which provides example integration patterns and along with the Wallet Gateway, upgrades and directly replaces the existing Splice Amulet Wallet within the current validator stack, adding baseline support for external parties and network standards.
* **Splice Wallet Browser Extension:** A comprehensive, end-to-end reference wallet browser extension implementation.

By establishing standardized, fully audited integration patterns, these reference implementations are designed to tangibly reduce external integrator onboarding timelines and accelerate network-wide feature parity for dApps, exchanges and wallet providers.


---

## Specification

### 1. Motivation

Digital Asset is one of the core developers of the Splice Wallet SDK and the current maintainer of the Splice Wallet SDK Open Source codebase at https://github.com/hyperledger-labs/splice-wallet-kernel/tree/main/sdk/wallet-sdk. The Wallet SDK and documentation provides excellent raw tools and individual code examples for wallet providers and exchanges to integrate with the Canton Network. However, Digital Asset sees the need to augment the current Wallet SDK with comprehensive, end-to-end reference wallet and dApp UI implementations which are provider-agnostic to maximize the velocity of wallet provider and exchange partner onboarding. Such reference wallet implementations would also serve as a developer tools for those developing dApps against the latest network features even before they hit MainNet.

In a recent Canton Network developer survey conducted by the Canton Foundation, the following quotes were obtained (Wallet and dApps feedback report can be seen [here](https://docs.google.com/document/d/1ld_xpOjrVmz0NnEZefYLgqMq5I0-b5nQFFh323lNnkI/edit?tab=t.0)).

* “Core products such as standard tokens and wallets for local development (would help me ship faster).”
* “Official crypto wallet (would help me ship faster) — in the form of browser extension and mobile app like MetaMask or Trust Wallet.”
* “A MetaMask/WalletConnect-style non-custodial wallet & signing standard (is missing compared to my previous ecosystem).”
* “User onboarding & key management — getting identity, signing flows, and permission boundaries production-grade (took longest to get right on the Canton Network).”
* “Import/export of external accounts on the validator for both CC and CIP-56 assets (took longest to get right on the Canton Network) — a huge operational risk for any company building on Canton today.”

Observations from the ETHDenver 2026 hackathon also showed the following:

* Both major Canton wallets ... required manual access approval — gating builders from testing wallet flows during the event.
* Multiple builders could not demonstrate a Canton Coin transfer in their final submission due to wallet integration friction — despite working dApp logic.
* No canonical “which wallet do I use” decision tree exists for dApp builders today.

The above quotes and observations strongly show that there's a strong need for a full end-to-end reference wallet implementaiton to show how to implement even simple, core wallet workflows.

Reference implementations would upgrade the existing "Splice Amulet Wallet" with the following features

1. External Party Support: Support for parties where the key is held outside the node operator's domain.
2. Token Standard Support: Support for CIP-0056
3. dApp Standards: Integration with dApps via CIP-0103.

By adding the developer tools included in the Splice Amulet Wallet to Splice Portfolio dApp UI, and adding support for external parties and CIP-0056 support, the default Splice Validator deployment can switch to this new wallet UI, along with the Wallet Gateway for connectivity to the validator, as a strict improvement over the existing Splice Amulet Wallet.

A reference wallet implementation aims to provide high-fidelity blueprints with production-grade implementation patterns of existing and future features. This will ensure that integration partners (including wallet providers and exchanges) can more quickly and consistently support the full spectrum of Canton Network features without needing to engineer the implementations from scratch using baseline documentation.

For established integration partners, this project provides a standardized path for future-proofing. As the network scales to support complex financial workflows, these reference implementations ensure that integration partners can adopt advanced protocol features with high consistency and minimal integration lag.

Reference implementations also improve a dApp builder’s experience at developing against CIP-0103 as it would provide a wallet with full support for the standard which can be used on any environment from localNet to MainNet. Currently, to develop against the Canton Network, a dApp developer must use an existing wallet on the network which often means obtaining a sign up code adding operational delays.

Without a reference wallet implementation, every new integration partner must "reinvent the wheel" implementing each new feature using the raw tools provided, increasing costs and delaying network effects.


### 2. Objective

The objective is to deliver two reference implementations; Splice Portfolio dApp UI, a portfolio dApp wallet UI giving the user a webpage view of their assets, and Splice Wallet Browser Extension, a full, end-to-end reference wallet browser extension implementation.
Integration partners will be able to use both as a basis for implementation or simply to better understand how to integrate the feature to increase the speed of integration and add new features. The technical scope includes:

1. **Production Patterns, Not Just Code:** deliver best-practice implementations for common wallet and exchange workflows: party creation, pre-approvals, transaction history etc.
2. **Provider independence:** Each delivery will be a provider agnostic reference wallet implementation.
3. **CIP Compliance:** Full support for CIP-0056 (token standard) and CIP-0103 (dApp support), ensuring wallets can handle complex asset lifecycles and conform to network standards. The reference wallet will also support future CIP additions which will require wallet features.
4. **Security First:** Internal and external audits carried out to give production-grade workflows.

The scope of these reference implementations is derived from continuous, direct technical engagements Digital Asset has with enterprise and retail wallet providers, exchanges, and dApp developers integrating with the Canton Network. While specific active partners are omitted from this public proposal to preserve vendor confidentiality, Digital Asset is prepared to brief the Foundation's Tech & Ops Committee on these relationships privately. Ultimately, the strategic ROI of these deliverables is the transition from a high-touch integration support model from any ecosystem organization to a self-serve model. By providing functional reference implementations, the ecosystem ensures that future, unanticipated partners can integrate independently, systematically eliminating the manual operational overhead and hand-holding currently required from core ecosystem organizations.


### 4. Backward Compatibility
*No backward compatibility impact.*

---

## Milestones and Deliverables
The milestones are aligned to product deliveries, not necessarily implementation timelines. Some features from different milestones will be worked on in parallel. Milestone deliverables and funding has been based on community benefit and need, not based on eng effort.

### Milestone 1: Splice Portfolio dApp UI
- **Estimated Delivery:**  4 months after CIP approval: by 31st July 2026
- **Focus:**  Building a portfolio dApp UI with the foundational wallet features.
- **Deliverables / Value Metrics & Acceptance Criteria:**  
    * Splice Portfolio, a wallet dApp UI with wallet feature reference implementations.
        * Splice Portfolio is a dApp and therefore, delegates party management to the CPI-0103 API provider (in this architecture, the Wallet Gateway)
    * Release in a public GitHub repo (Apache 2.0)
    * CIP-0056 token standard support
    * CIP-0103 dApp API compliant
    * Publicly accessible docker image and helm chart 
    * Integrating with the Wallet Gateway via CIP-0103 giving the following features:
        * Integration for external party key storage
        * Self-hosted validator connection
        * Support for internal parties
    * Internal security audit
    * Transaction history
    * Canton Coin and DA Registry pre-approval support (in preparation for Preapproval support via standards)
    * Fully documented code and documentation of features added

### Milestone 2: Splice Wallet Browser Extension
- **Estimated Delivery:**  3 months after delivery of Milestone 1: by 31st October 2026.
- **Focus:**  Provide a deployable browser extension package as a reference wallet implementation including party management.
- **Deliverables / Value Metrics & Acceptance Criteria:**  
    * End-to-end reference wallet implementation through a browser extension deployment including all features of the Splice Portfolio dApp UI outlined in Milestone 1 plus:
        * In-browser key storage
        * Ability to create a party
        * Connection to the Splice Portfolio dApp UI
        * Chrome and firefox browser compatible
    * Third-Party Security Audit Report (Critical/High issues resolved)

### Milestone 3: Future known improvements
- **Estimated Delivery:**  1 month after delivery of Milestone 2: by 30th November 2026
- **Focus:**  Add known future features which wallet providers and exchanges will have to implement.
- **Deliverables / Value Metrics & Acceptance Criteria:**  
Since not all of the features are delivered or fully defined, this milestone’s scope, ability to be completed and timeline may need to be adjusted depending on the state of the features that it depends on.
    * Provide a reference implementation showing the ability to allow parties to pay for traffic fees via the wallet UI.
    * WalletConnect integration
    * Token Standard v2 support
    * Flows demonstrated for multi-hosting parties

### Milestone 4: Splice Portfolio replaces the Splice Amulet Wallet
- **Estimated Delivery:**  2 months after delivery of Milestone 3: by 31st January 2027
- **Focus:**  The Splice Amulet Wallet is replaced by Splice portfolio and the Wallet Gateway as the default wallet in the splice stack.
- **Deliverables / Value Metrics & Acceptance Criteria:**  
    * Sufficient feature parity with the current Splice Amulet Wallet. In addition to the features listed in Milestones 1 and 2, adding support for:
        * DevNet CC tap
        * DevNet featured app self-registering
    * The replacement of the Splice Amulet Wallet with Splice Portfolio in the validator stack.

---

## Funding

**Total Funding Request:**  8,500,000

### Payment Breakdown by Milestone
- Milestone 1 Splice Portfolio dApp UI: 4,000,000 CC upon committee acceptance  
- Milestone 2 Splice Wallet Browser Extension: 2,500,000 CC upon committee acceptance  
- Milestone 2 Future known improvements: 1,000,000 CC upon committee acceptance  
- Milestone N Splice Portfolio replaces the Splice Amulet Wallet: 1,000,000 CC upon final release and acceptance  

### Maintenance

Following the completion of M4, support for Splice Portfolio will be merged into the Maintenance Grant for Splice Wallet Kernel Open Source grant proposal. Splice Portfolio will be included in the splice-wallet-kernel repo (held at https://github.com/hyperledger-labs/splice-wallet-kernel) and therefore it makes sense to include the maintenance of Splice Portfolio into that grant proposal to ensure there’s not two payments for the same work.

Maintenance of Splice Portfolio will cover bug fixes, future wallet features and updates. The Tech & Ops Committee (or the Core Contributor Group) can evaluate the completion of the maintenance in the same way as outlined in the Maintenance Grant for Splice Wallet Kernel Open Source grant proposal.

An estimation for the increase to that maintenance burden is currently estimated at 100,000 CC per month

## Ecosystem Impact

The delivery of the Splice Portfolio dApp UI and Splice Wallet Browser Extension directly addresses the integration bottlenecks identified in the recent Canton Network developer survey. By providing open-source, provider-agnostic reference architectures, the project drives the following specific ecosystem outcomes:

* **Reduction of Integrator Friction:** The provision of production-grade reference implementations for CIP-0056 (Token Standard) and CIP-0103 (dApp API) eliminates the requirement for external integrators to engineer custom wallet connectivity and party management from scratch. This reduces the baseline time-to-production for new wallet providers, exchanges, and dApp developers.
* **Acceleration of Protocol Feature Adoption:** By serving as a functional testing baseline, the reference wallets enable developers to build against new network capabilities (e.g., Token Standard v2) independent of existing third-party wallet access approvals. 
* **Validator Infrastructure Upgrade:** Replacing the legacy Splice Amulet Wallet with the Splice Portfolio in the default validator stack structurally aligns the baseline node infrastructure with external parties, CIP-0056 token standard support, and CIP-0103 dApp support.

### Timeline Accountability & Volatility Stipulation

* **Volatility Stipulation:** The grant is denominated in fixed Canton Coin and the proposer assumes price volatility risk. Should the project extend beyond the planned timeline due to requested scope changes by the Committee, the remaining un-minted milestones must be renegotiated.
* **Acceleration Bonus:** If all final technical deliverables (Milestones 1, 2, 3 & 4) are met, audited, and approved:
    * 30 days prior to the Estimated Delivery date, a +20% bonus on the final payout will be awarded
    * 15 days prior to the Estimated Delivery date, a +10% bonus on the final payout will be awarded
* **Late Penalty:** In case the project delivers its final milestone later than the predicted timeline, the final payment will be reduced each month by 10 percent of the nominal project total for the first four months after the original planned completion date, then holding at 10% of the baseline total.  This results in a final payment of just 10% of the total proposal if delivered more than four months after the original proposed completion date.

---

## Co-Marketing
Upon the release of the reference implementations of Milestones 1 and 2, Digital Asset will collaborate with the Foundation on a blog post explaining the benefits and use of each.
