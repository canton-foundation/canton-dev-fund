  
# **Canton Launchpad**

Infrastructure Wizard & Key Generation Toolkit

| Submitted by | Launchnodes |
| :---- | :---- |
| **Funding Requested** | $170,000 USD |
| **Timeline** | April 2026 – July 2026 (4 months) |
| **Target Networks** | Devnet → Testnet → Mainnet |

# **Executive Summary**

This proposal requests funding to develop Canton Launchpad, an open-source developer infrastructure toolkit designed to simplify the deployment and operation of Canton nodes.

Canton Launchpad consists of two integrated components:

Key Generation Tool: a secure key ceremony interface for generating and safeguarding Canton node cryptographic material.

Infrastructure Wizard: a guided deployment tool that generates production ready infrastructure configurations for cloud and bare metal environments.

Deploying a Canton node today requires deep familiarity with distributed infrastructure, Canton node architecture, and the management of multiple cryptographic keys. For many developers and organisations evaluating Canton, this complexity slows experimentation and increases the cost of adoption.

Canton Launchpad addresses this challenge by providing a guided deployment experience that can reduce node deployment time from one to two days to less than one hour.

The project will deliver a production ready open source toolkit within four months and will be maintained as a public good for the Canton ecosystem.

# **Why This Tool Is Needed Now**

Canton Network is entering a phase of accelerating adoption among financial institutions, infrastructure providers, and enterprise developers building privacy enabled digital asset systems.

However, despite the maturity of the underlying protocol, the developer onboarding experience remains complex.

Deploying a Canton node currently requires developers to:

* manually generate and safeguard cryptographic keys

* configure distributed infrastructure

* write infrastructure scripts and configuration files

* validate network connectivity and role configuration

For experienced infrastructure engineers this is manageable, but for many developers evaluating the network it represents a significant barrier to entry.

In practice, teams often spend one to two days setting up infrastructure before they can begin building applications or testing network integrations.

A key driver of adoption of blockchain ecosystems has been the availability of developer infrastructure tooling that simplifies node deployment.

Canton Launchpad addresses this gap by providing the first guided infrastructure deployment experience for Canton nodes.

By reducing operational friction, the Launchpad supports several strategic goals for the Canton ecosystem:

* accelerating canton application development and deployment

* enabling more independent node operators

* simplifying enterprise proof of concept deployments

* improving network decentralisation

In this sense, Canton Launchpad will be more than a convenience tool, but rather core developer infrastructure supporting Canton applications and node operators to deploy faster and more easily.

# **Problem Statement: Key Generation**

Key generation is a foundational step in operating a node on the Canton Network, because the network’s security and identity model relies heavily on cryptographic keys. Each participant must manage multiple key types such as namespace keys, node signing keys, and participant keys that define identity, trust relationships, and message authenticity within the network.

These keys are not merely operational credentials; they form the root of a participant’s identity and authorisation within Canton’s synchronisation and privacy model. If they are generated incorrectly, stored insecurely, or lost, the consequences can include the inability to operate a node, compromised security guarantees, or complex recovery procedures. For production deployments particularly those involving financial institutions or regulated environments key generation and custody must therefore follow careful operational processes comparable to those used for other high assurance cryptographic systems.

Despite its importance, the complexity of key generation on Canton is often underestimated or poorly understood by developers approaching the network for the first time. Much of the existing documentation and tooling assumes familiarity with cryptographic key ceremonies, infrastructure security practices, and the operational model of distributed ledger systems.

In practice, this means that developers and operators must manually assemble processes for generating, protecting, and rotating keys while ensuring compatibility with node configuration and infrastructure deployment.

Unlike many other aspects of blockchain development, this step is rarely supported by dedicated developer tooling, leaving teams to rely on fragmented documentation and ad hoc operational procedures. As a result, one of the most security critical components of operating a Canton node remains an area where developer experience and ecosystem tooling have not yet fully caught up with the sophistication of the underlying protocol.

# **Problem Statement: Node Set Up**

Deploying nodes on the Canton Network requires a level of infrastructure preparation that is often greater than many developers initially expect. A typical deployment involves configuring multiple services, defining network roles such as participant, sequencer, or validator nodes, establishing secure connectivity between components, and ensuring that configuration files align with the network environment being targeted.

These environments development, testnet, and production each introduce their own requirements. Development environments often prioritise speed and flexibility, test networks require stable interoperability with other participants, and production deployments demand strict operational security, monitoring, and resilience. Moving between these environments is not always straightforward, as configuration changes related to networking, authentication, storage, and monitoring must be carefully managed to ensure that nodes behave correctly in each context.

The complexity of this setup process is frequently underestimated because much of the effort lies in infrastructure orchestration rather than application logic. Developers must provision cloud resources or servers, configure networking and TLS settings, establish persistent storage, and deploy the Canton node software with correctly structured configuration files.

Small misconfigurations such as incorrect ports, mismatched identities, or incompatible role definitions can prevent nodes from connecting to the wider network, often requiring time consuming troubleshooting. At present, much of this work relies on manual configuration and infrastructure scripting, and there is limited standardisation around how these environments are provisioned across teams. As a result, setting up Canton nodes across development, testing, and production environments remains one of the most operationally complex stages of working with the network, even before application development begins.

Onboarding to Canton currently requires a combination of infrastructure expertise, manual configuration, and detailed knowledge of the protocol’s cryptographic model.

This creates friction for three primary groups.

**Developers**

Developers exploring Canton must invest time configuring infrastructure before they can begin building applications.

**Enterprises**

Institutions evaluating Canton must deploy complex infrastructure simply to test the network.

**Node Operators**

Operators must manage cryptographic keys and infrastructure configuration without the benefit of guided tooling.

The process of running nodes on Canton can improve with an easy to digest standardised deployment workflow for new operators.

Reducing this friction will significantly increase the number of developers able to experiment with and build on Canton.

# **Proposed Solution**

Canton Launchpad provides a unified developer tool for deploying Canton nodes securely and efficiently.

The system consists of two integrated modules.

# **Module 1 — Key Generation Tool**

The Key Generation module provides a guided key ceremony for generating and protecting the cryptographic keys required to operate a Canton node.

Features include:

* generation of Participant, Namespace, Node Signing, JWT, and TLS keys

* visual key inventory showing required key types

* multi-step security acknowledgement before key generation

* encrypted key bundle export using AES-256-GCM

* passphrase-protected key archive

* support for Ed25519, EC-P256, and RSA-4096 algorithms

* offline key generation via downloadable HTML tool

* the goal is to enforce secure operational practices and reduce the risk of improper key management

# **Module 2 - Infrastructure Wizard**

The Infrastructure Wizard provides a guided deployment interface for configuring and deploying Canton nodes across cloud and bare metal environments.

Users select deployment parameters through a step by step interface, and the wizard generates production ready infrastructure scripts.

The primary output format is Terraform modules and shell script outputs covering AWS, GCP, Azure, and bare-metal.

## **Supported Infrastructure Environments**

* AWS

* Google Cloud Platform

* Microsoft Azure

* bare metal servers

## **Additional Configuration Options**

* TLS and mutual TLS configuration

* Canton version targeting

* domain configuration and port validation

This allows operators to launch Canton nodes without extensive infrastructure experience.

# **Architecture Overview**

The Launchpad system consists of three primary components:

1. User interface  
2. Key generation tooling  
3. infrastructure configuration generator

The architecture is illustrated below.

![Architecture Overview](https://launchnodeslogo.s3.eu-west-2.amazonaws.com/Canton+Infrastructure-2026-03-10-064725.png)

# **Developer Workflow**

1. The Launchpad enables a simple workflow for deploying Canton nodes.  
2. Generate node cryptographic keys using the Key Generation Tool.  
3. Configure deployment parameters using the Infrastructure Wizard.  
4. Download generated deployment scripts.  
5. Execute scripts to provision infrastructure.  
6. Verify node connectivity and begin application development.

This workflow reduces a multi day infrastructure setup process to a guided deployment that can be completed in under an hour.

# **Project Scope**

To ensure reliable delivery within four months, the project distinguishes between core deliverables and extended capabilities that will be delivered over the 12 months of the grant beyond the initial 4 month core delivery of the key generation tool and infrastructure wizard.

## **Core Deliverables**

**Key Generation Tool**

* full key generation workflow

* encrypted key bundle export

* offline key generation capability

**Infrastructure Wizard**

* guided deployment configuration

* Terraform and shell script outputs

* AWS, GCP, Azure, and bare-metal deployment

* configuration validation

## **Extended Capabilities**

Additional features to be delivered over the 12 months of the grant:

* cloud cost estimation module

* post-deployment node monitoring dashboard

# **Milestones and Funding**

| Milestone | Description | Funding |
| :---: | ----- | ----- |
| **M1** | Requirements specification, architecture design, key generation prototype | $25,000 |
| **M2** | Core development of key generation tool and infrastructure wizard | $35,000 |
| **M3** | Third-party security audit and remediation | $55,000 |
| **M4** | Feature hardening for Devnet, Testnet and Mainnet | $30,000 |
| **M5** | Documentation, onboarding materials, mainnet release | $25,000 |
|  | Total Funding Requested | **$170,000** |

# **Security Strategy**

Security is a central design principle for Launchpad.

## **Key Generation**

A dedicated milestone will fund a third-party security audit for the key generation tool to include:

* entropy generation

* passphrase encryption

* memory handling for key material

* infrastructure script validation

* protection against injection vulnerabilities

Potential security auditors include:

* Halborn

* Trail of Bits

* NCC Group

* Cure53

All High and Critical findings will be resolved prior to public release.

## **Infrastructure Wizard**

In addition to the cryptographic audit of the key generation components, the project will include a dedicated security review of the infrastructure automation outputs produced by the Launchpad, specifically the Terraform modules and shell-based deployment scripts. These outputs provision cloud infrastructure and configure servers for Canton nodes, making them critical to the operational security of deployments. A third party security review will assess these artefacts to ensure they follow established best practices for secure infrastructure automation and do not introduce configuration risks.

The audit will focus on the following security outcomes:

* Secure infrastructure defaults: Terraform modules provision infrastructure with secure configurations, including correct identity and access management policies, least privilege permissions, and appropriate network boundaries.

* Secure server configuration: Shell scripts follow secure provisioning practices, including safe service configuration, restricted ports, and correct file permissions.

* Protection against unsafe execution patterns: Scripts avoid patterns that could expose deployments to command injection or privilege escalation risks.

* Deterministic and reproducible infrastructure: Generated deployment outputs produce consistent, predictable environments across development, test, and production deployments.

* Secure networking between Canton components: Proper TLS configuration and secure communication between node roles.

* Alignment with cloud security best practices including infrastructure definitions secure logging, monitoring, and avoid insecure defaults.

All findings from the review will be documented and remediated prior to public release, with any High or Critical issues resolved and independently verified before deployment templates are published.

Potential security auditors include:

* Halborn

* Trail of Bits

* NCC Group

* Cure53

# **Impact Metrics**

The Launchpad will deliver measurable improvements to the developer experience.

Expected outcomes include:

## **Deployment Efficiency**

Reduce Canton node deployment time from 1–2 days to under 1–2 hours.

## **Developer Accessibility**

Enable developers and application developers without deep infrastructure expertise to deploy nodes.

## **Network Participation**

Target onboarding of 20 new DevNet and mainnet nodes within the first six months through user engagement.

## **Ecosystem Growth**

Increase the number of independent Canton node operators and make it easier for applications on the Canton Network to run nodes.

# **Adoption Strategy**

Canton Launchpad will be distributed as an open source developer tool.

Adoption will be supported through:

* public GitHub repository

* deployment tutorials and documentation

* example infrastructure templates

* walkthrough videos demonstrating node deployment

* integration with Canton developer documentation

The goal is for Launchpad to become the standard onboarding tool for deploying Canton nodes.

# **Open Source Commitment**

All code will be released under the Apache 2.0 licence.

The repository will include:

* source code

* deployment examples

* documentation

* contribution guidelines

* security audits

The team commits to maintaining the project for at least 12 months after the grant.

# **Why Launchnodes Is Well Positioned to Deliver This**

Launchnodes is a blockchain infrastructure company specialising in node deployment, distributed systems infrastructure, and validator operations. Launchnodes is listed on [ethereum.org](http://ethereum.org) as a provider of solo staking solutions and has built similar infrastructure and key generation wizards for Ethereum validator node deployments.

The team operates infrastructure across multiple blockchain networks and has extensive experience building and maintaining production grade infrastructure for distributed systems.

This experience includes:

* operating validator and infrastructure nodes across blockchain networks

* designing infrastructure automation and DevOps tooling

* managing secure key infrastructure for distributed systems

* delivering developer infrastructure used by blockchain operators

Because of this operational experience, the team has direct insight into the challenges faced by developers and operators deploying blockchain infrastructure.

Canton Launchpad is a natural extension of this work, applying infrastructure automation expertise to improve the developer experience for the Canton ecosystem.

# **Alignment with Canton Ecosystem Goals**

Canton Launchpad directly supports several strategic priorities.

| Developer Onboarding | Reduces the time required for developers to deploy Canton infrastructure. |
| :---- | :---- |
| **Security** | Provides structured key management workflows that enforce best practices. |
| **Ecosystem Growth** | Lowers the barrier to entry for application developers and node operators. |
| **Open Infrastructure** | Provides open-source tooling for the community. |
| **Decentralisation** | Enables more independent node operators to participate in the network. |

# **Final Notes**

Canton Launchpad addresses an important infrastructure gap in the Canton ecosystem.

By simplifying node deployment and enforcing secure operational practices, the Launchpad will enable more developers and operators to participate in the network.

The project will deliver a production ready open source toolkit within four months and will remain maintained as long term infrastructure for the Canton ecosystem.
