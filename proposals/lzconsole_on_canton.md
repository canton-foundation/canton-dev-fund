## Development Fund Proposal

**Author:** LayerZero
**Status:** Draft
**Created:** 2026-05-20
**Label:**  Pick 1 below
- financial-workflows-composability

**[Champion](https://github.com/canton-foundation/canton-dev-fund/blob/main/sig-directory.md):**  Bernhard Elsner *OR* need Champion


---

## Abstract
A key focus of the Canton ecosystem is supporting interoperability, enabling asset issuers and applications that operate across multiple blockchain environments to extend their deployments into Canton. As a result, Canton is expected to onboard institutional participants that are already multichain by design and require the ability to coordinate deployments, governance, and operations across multiple networks.

To support this shift, the ecosystem requires infrastructure that allows teams to operate across Canton and other environments in a consistent, secure, and scalable manner, without introducing additional operational complexity.

Over the past eight months, LayerZero has been developing its integration with the Canton ecosystem. This integration enables asset transfers between Canton and external blockchain networks, building on LayerZero's existing infrastructure, which has supported over $250B in cross-chain volume to date.

With interoperability now established via LayerZero, the next phase is enabling asset issuers to operate on top of this infrastructure in a scalable and efficient manner.

To achieve this, this proposal extends two products to Canton which will be built and maintained by LayerZero Labs, both of which will require significant engineering investment (see Milestones below).

The first is LzConsole, an enterprise control plane for issuing, governing, and operating assets across chains. It provides a unified interface that abstracts the complexity of interacting with individual environments, enabling asset issuers to manage their deployments, configurations, and operations through a single system.

The second is a multichain signing layer named [OneSig](https://x.com/LayerZero_Core/status/1925223887685800347?s=20) which allows teams to bundle multiple on-chain actions into a single approval flow, review them in a structured and human-readable format, and execute them deterministically across networks, with full auditability and gas abstraction handled as part of the service.

By extending both of these products to Canton, the ecosystem gains a unified control plane that enables applications to deploy, govern, and scale across Canton and other networks in a secure, consistent, and operationally efficient manner.

---

## Specification

### 1. Objective
#### Problem

Operational complexity is a critical challenge for teams that deploy assets across multiple ecosystems, especially as they scale across non-EVM chains. This is a real issue today, that LayerZero witnesses when working with teams. Asset issuers must:

- Deploy and configure contracts independently across each environment
- Coordinate signer approvals across multiple tools and workflows
- Execute governance actions and configuration updates on a per-chain basis
- Manage gas, execution requirements, and infrastructure across networks
- Maintain consistency of business logic, permissions, and compliance rules across environments

And as asset count and network footprint increase, this results in:

- Significant operational overhead and manual coordination
- Increased reliance on engineering teams for what should be routine actions
- Configuration drift across chains and environments
- Fragmented governance processes across wallets and tools
- Elevated risk of human error in transaction approval and execution

For institutional issuers, these challenges are further amplified by requirements for auditability, role separation, and consistent enforcement of policies across all environments.

Without a unified control plane, issuers must replicate infrastructure and workflows for each new environment, creating friction in onboarding to ecosystems like Canton and limiting the ability to scale interoperable applications efficiently.

#### Intended Outcome

The objective of this proposal is to introduce two core infrastructure components to the Canton ecosystem:
- **Console:** a unified control plane for asset issuance, governance, and operations
- **OneSig:** a multichain transaction coordination and signing layer for secure signing on Canton.

##### Console

Console is designed to remove the operational friction associated with deploying and managing assets across multiple environments. It abstracts the complexity of interacting with different virtual machines and execution systems through a single, consistent interface.

Through Console, asset issuers will be able to:
- Deploy assets on Canton through guided, production-ready workflows.
- Extend existing multichain assets to Canton seamlessly, without re-architecting their deployment or operational processes
- Interact with Canton and other environments through a unified interface that abstracts VM-specific complexity
- Maintain a single system of record for configuration, governance, and state across all environments

##### OneSig
OneSig is a coordination and signing layer that enables secure, verifiable execution of transactions across multiple chains and execution environments.

Teams on Canton will be able to:
- Bundle multiple on-chain actions into a single executable transaction, including actions that span multiple chains and VMs.
- Approve complex, multi-environment operations with a single signature.
- Review transactions through a verification-first workflow, with human-readable decoding and structured approval flows.
- Execute transactions across environments without managing gas or execution mechanics on a per-chain basis

By introducing OneSig to Canton, the ecosystem gains a standardized and scalable approach to transaction approval and execution. This completely reduces the reliance on fragmented multisig tooling and enabling more secure and efficient signing workflows.

### 2. Implementation Mechanics
LayerZero Console will be implemented as a multi-layered system that abstracts the complexity of deploying, configuring, and operating assets across Canton and other blockchain environments. The system is composed of four primary layers: contract layer, orchestration layer, API layer, and frontend interface.

1. **Contract Layer**

Building on top of the existing contract work LayerZero has completed on Canton, both lzConsole and OneSig introduce a number of additional OFT standards. These include:
- [RWA OFT](https://docs.layerzero.network/v2/developers/evm/tokenized-rwas-oft/overview#tokenized-rwas-oft-overview): A standardized contract framework for issuing and managing tokenized real-world assets on Canton, aligned with LayerZero OFT design patterns and supporting cross-environment interoperability.
- [Stablecoin OFT](https://docs.layerzero.network/v2/developers/evm/stablecoin-oft/): A production-ready stablecoin contract framework for Canton, supporting issuance, supply control, and cross-environment behavior for institutional use cases
- **OneSig Contract Standard**: A Canton-native implementation of OneSig that enforces transaction approval and execution enabling coordinated, multi-environment operations via a single approval flow.

2. **Orchestration Layer (Workflow Runner & OneSig)**

This layer is responsible for coordinating deployments, configuration updates, and transaction execution across environments. OneSig is embedded within this layer as the signing and coordination engine which is responsible for:
- Aggregating multiple, on-chain actions into a single execution workflow
- Constructing bundles of transactions on Canton and other environments
- Generating a verifiable representation of the bundle for approval by signers
- Coordinating multi-party approval flows
- Triggering execution across all target environments

3. **API Layer**

The API layer provides programmatic access to Console functionality and serves as the control plane for all operations. The API layer is the primary interface for interacting with Console programmatically and enforces all access and permission boundaries. Responsibilities include:
- Managing:
    - Accounts, projects, and deployments
    - Configuration and state
    - Workflow execution and tracking
- Provides authentication and authorization through SSO
- Enforces role-based access control across organization, account, and project levels

4. **Frontend Layer**

The frontend is the primary user interface for interacting with Console. This is built as a web-based application that provides a unified experience for managing assets and workflows and enables users to:
- Deploy and configure assets
- Propose and review transactions
- Monitor system state and activity

The frontend layer ensures that complex multichain operations can be managed through a simple, structured interface.

#### Example Workflow

The system follows a structured workflow for signing on Canton:

**Configuration & Proposal**
- Users define desired state changes through the Console interface
- Configurations are translated into structured deployment or transaction workflows

**Workflow Resolution**
- The orchestration layer expands configurations into full chain and pathway states
- Required actions across all environments are determined

**Bundling & Approval**
- Actions are grouped into a single executable bundle
- Users review operations in a human-readable format
- Multi-party approval is collected through the embedded signing layer

**Execution**
- Approved workflows are executed across all target environments
- Execution is handled as a service, abstracting gas and network-specific requirements

**Verification & State Tracking**
- Execution results are tracked and verified
- System state is updated and reflected across all environments
- A complete audit trail is maintained

### 3. Architectural Alignment

The proposed implementation of LayerZero Console aligns closely with Canton's architecture, ecosystem priorities, and ongoing interoperability initiatives.

- **Alignment with Canton's Target Users:** Console is designed specifically for institutional asset issuers operating in regulated environments. It provides structured governance, role-based access control, auditability, and operational clarity as core product features. This aligns directly with the Canton ecosystem, which is focused on enabling institutional-grade applications and attracting asset issuers that require strong guarantees around control, compliance, and operational integrity.
- **DAML-based Implementation:** All contract components introduced as part of this proposal will be implemented using DAML, ensuring compatibility with Canton's execution model and architectural principles.
- **Alignment with Interoperability Priorities (CIP-0065):** Canton is prioritizing interoperability as a core ecosystem focus, as outlined in CIP-0065. For this to succeed, the appropriate operational and governance tooling must be in place to support applications and asset issuers operating across multiple environments. Console directly supports this by providing a unified control plane for managing assets, coordinating transactions, and enforcing consistent governance across Canton and other networks. It enables teams to operate across environments without introducing additional complexity, making interoperability practical on Canton and scalable for institutional use cases.

### 4. Backward Compatibility

No protocol-level backward compatibility impact is expected. The proposed work is an application-layer reference implementation and support layer. Existing Canton applications and protocol behavior remain unchanged.

---

## Milestones and Deliverables

### Milestone 1: Contract Development
- **Estimated Duration:** 14–16 weeks (10 weeks development · 4–6 weeks audit, sequential)
- **Deliverables:**
  - OFT Standards (Canton Compatible):
    - RWA OFT
    - Stablecoin OFT
  - A Canton implementation of OneSig; the on-chain signature aggregation contract that governs administrative operations on deployed OFTs.
  - Full independent audit of all Canton contracts listed above

### Milestone 2: Console Integration
- **Estimated Duration:** 8–10 weeks (parallelizable with late-stage contract development)
- **Deliverables:**
  - Deploy and wire tooling that facilitates the full end-to-end Console flow for managing OFTs on Canton including contract deployment, ownership configuration, and post-deployment wiring.
  - Implementation of metadata and state persistence for Canton deployments, including contract addresses, identifiers, and configuration data, enabling Console to maintain a canonical system of record.
  - Front-end support for Canton within Console, including human-readable decoding of OneSig transactions and structured approval workflows that enable clear, verifiable transaction review prior to execution.

| Milestone | Start | Duration | Est. Completion |
|-----------|-------|----------|-----------------|
| M1 - Contract development + audit | Week 1 | 14–16 weeks | Week 15–17 |
| M2 - Console support | Week 10 (overlap) | 8–10 weeks | Week 19–20 |
| End-to-end | | | ~20 weeks from start |

---

## Acceptance Criteria

The successful delivery of this proposal will be evaluated against the following criteria:

- **Security audit results:** Independent security audits are completed with 0 critical findings and 0 unresolved high-severity findings
- **Mainnet operational status:** Console is fully operational on Canton Mainnet

---

## Funding

**Total Funding Request:** 20,000,000 CC

### Payment Breakdown by Milestone

- **Milestone 1: Contracts developed and audited:** 10,000,000 CC upon committee acceptance
- **Milestone 2: Console Integration:** 10,000,000 CC upon committee acceptance

### Volatility Stipulation
If the project duration is **greater than 6 months**:
The grant is denominated in fixed Canton Coin and will require a re-evaluation at the 6-month mark.

If the project duration is **under 6 months**:
Should the project timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility.

---

## Motivation

LayerZero has been operating in production since 2021, supporting applications and asset issuers across a growing number of blockchain environments. Through this, we have experienced firsthand the operational challenges associated with managing deployments, configuration, and governance across multiple chains.

In practice, teams are required to coordinate complex workflows across environments, often relying on fragmented tooling and repeated manual processes. This introduces operational overhead, increases the risk of human error, and slows down the ability to deploy and scale across new networks.

To address these challenges, we developed internal systems to streamline multichain operations. OneSig, for example, is used in production across LayerZero to manage all cross-chain signing workflows, enabling coordinated execution across environments through a structured and verifiable process.

Console builds on this foundation. It is designed to abstract the complexity of multichain operations into a unified, user-friendly interface, allowing teams to deploy, manage, and govern assets without needing to interact directly with each underlying environment.

The motivation for this proposal is to bring this improved operational experience to the Canton ecosystem. As Canton continues to onboard institutional asset issuers, it is critical that these teams have access to infrastructure that reduces friction, improves security, and enables them to operate across environments with confidence.

By introducing Console, we aim to ensure that asset issuers deploying on Canton can do so with a streamlined, production-grade experience, while also contributing to the development and growth of the broader ecosystem.

---

## Rationale

LayerZero is the leading interoperability protocol in the market, supporting applications and asset issuers across a broad range of blockchain environments. Today, LayerZero facilitates connectivity across 165+ blockchains, supports 700+ applications, and has enabled over $230B in value transfer, all while maintaining a strong security track record.

This scale of adoption reflects deep experience in managing the complexities of multichain deployment, coordination, and governance. As a result, LayerZero is uniquely positioned to develop Console as a control plane for interoperable asset operations on Canton, translating these challenges into structured, production-ready workflows for institutional users.

LayerZero infrastructure is already used by leading asset issuers and institutions, including USDT0, BitGo (for wBTC), PayPal, and others. These teams operate in environments where security, reliability, and operational consistency are critical, and require infrastructure that can support complex, multi-environment workflows.

LayerZero has also recently expanded its footprint to include the Canton ecosystem, further strengthening its ability to support applications operating across both Canton and other blockchain environments.

Given Canton's focus on interoperability and its target audience of institutional asset issuers, Console represents a natural extension of LayerZero's capabilities. It provides the operational infrastructure required to ensure that interoperability is not only technically possible, but also practical, secure, and scalable.
