# Canton Foundation Development Fund (CIP-0100)

## 2026-2028 Roadmap and 2026-2027 Request for Proposals

The Canton Foundation development fund grants 5% of total Canton Coin minting to application developers and development teams who contribute to the Open Source foundation of Canton Network. This includes enhancements to the Canton Protocol (Synchronizers and Validators), Participant Query Service, Canton APIs and developer tooling (SDKs), Splice Tokenomics and Network Governance, and other open source tooling and utilities, including the Wallet SDK, the dApp SDK, the Splice Reference Wallet, and the Canton Name Service (CNS).

Funding falls into two categories: Roadmap-based, and individual initiatives. The Roadmap consists of a technical and architectural strategy for the coming 12 to 24 months, and an associated set of requests for proposals (RFPs) mostly targeting the coming 12 months in each major area of technical and architectural interest. Individual initiatives (“initiatives”) are grant proposals that do not respond to RFPs.

This document outlines the 2026–2028 roadmap and provides brief Requests for Proposals across twenty-eight technical areas, primarily targeting work to be undertaken during 2026–2027.


## Technical and Architectural Vision: 2026-2028

By mid-2028, Canton Network expects to support the following use cases at the following scale.

<ul>
  <li>Onchain cash, US Treasuries, and repurchase agreements (repos) will settle against each other on Canton Network at a scale of at least $10 Trillion USD per year.
  </li>
  <li>DeFi protocols will process on the order of $100 Billion USD nominal value per year
  </li>
  <li>Accounts receivable factoring applications will process  on the order of $20 Billion USD per year
  </li>
  <li>Validators will burn Canton Coin and participate in Canton Coin tokenomics when they process transactions via any Canton subnet: the gSync or any dedicated synchronizers
  </li>
  <li>Party portability and independent resilience will place full control over privacy, validator hosting, redundancy and data recovery into the hands of the key holder and/or their delegate(s).
  </li>
  <li>Applications will have multiple options for public verification of private transactions, including aggregate metrics with selective disclosure to oracles, and need-to-know disclosure via trusted execution environments (TEE).
    <ul>
      <li>Initial examples of ZKP-based verification of private data will also be available on the Network.
      </li>
    </ul>
  </li>
  <li>Validator operators will be able to easily evaluate which applications they will operate on their nodes, and easily track and automate application upgrades. Individual parties will be able to decide whether or not to participate in a given application that uses a particular Daml model.
  </li>
  <li>Application providers will be able to operate applications across multiple nodes, with failover at the party level.
  </li>
  <li>Applications will be able to process transactions across multiple synchronizers, as needed by the application.
  </li>
  <li>Featured application governance will be largely automated, rarely requiring offchain governance decisions
  </li>
  <li>The Super Validator quorum actively involved in ordering messages on the Global Synchronizer will automatically rotate among synchronizer nodes, providing maximum resilience while maintaining high throughput and low latency.
  </li>
  <li>Validator operators will onboard themselves to the network, removing current scaling-based approval processes
  </li>
  <li>An active market of providers will offer credentials for onchain identity and qualification, based on a common standard for party metadata. A global asset registry will also build on this common metadata standard.
  </li>
</ul>


* Overall scale: By 2028, Canton Network will be able to support:

<ul>
  <li>Tens of millions of parties on the Global Synchronizer, with no party scaling limits
  </li>
  <li>At least 2000 transactions per second (30 MB traffic/second) average on the Global Synchronizer
  </li>
  <li>10,000 Validator nodes
  </li>
  <li>1000 Applications
  </li>
  <li>100 dedicated synchronizers connected and burning Canton Coin, with overall traffic burn rates several times that of the Global Synchronizer
  </li>
</ul>


## Requests for Proposals

To support this vision, the Technology & Operations Committee of the Canton Foundation seeks to fund grants in the following areas between September 2026 and September 2027. The Foundation will target 80% of its Development Fund budget toward proposals that respond to Foundation RFPs, while reserving up to 20% for individual initiatives that fall outside the published roadmap.  *(Note: CIPs that require a technical implementation may also be treated as Foundation Requests for Proposals once those CIPs have been approved by the Super Validators.)*

### Protocol, Infrastructure, Scalability & Resilience

<ol type="1">
  <li value="1">Enable frictionless party hosting
    <ol type="a">
      <li value="1">RFP
        <ol type="i">
          <li value="1">Enhancements to the Canton Protocol, Ledger API, and the Wallet SDK, to allow parties to move easily among Validator nodes and enable operators to manage their hosting configurations. This will include offboarding from nodes and removing data from nodes where parties have offboarded. Parties should be able to grant hosting rights to Validators by signing a transaction and submitting these transactions through the Ledger API, e.g. via a wallet application, and transfer or revoke hosting rights in the same way. Parties should be able to designate backup services that retain a streamed, encrypted copy of that party’s active contract state, and recover their full contract state to any Validator node, even when all nodes actively hosting the party’s data have failed or blocked the party’s access.
          </li>
          <li value="2">We anticipate approving multiple grants in this area as work progresses over the coming year.
          </li>
        </ol>
      </li>
    </ol>
  </li>
  <li value="2">Application Decentralization
    <ol type="a">
      <li value="1">RFP
        <ol type="i">
          <li value="1">Applications, workflows, and tooling that support the decentralized control and execution of applications. Such tooling should support managing a decentralized party on a decentralized deployment, and should furthermore support the trustless asynchronous execution of off-ledger logic.
          </li>
        </ol>
      </li>
      <li value="2">Prior Examples of grants issued in this area include:
        <ol type="i">
          <li value="1"><a href="https://github.com/canton-foundation/canton-dev-fund/blob/main/proposals/2026-05-BitSafe-decentralization-manager.md">2026-05-BitSafe-decentralization-manager.md</a>
          </li>
        </ol>
      </li>
    </ol>
  </li>
  <li value="3">Automated Application Management
    <ol type="a">
      <li value="1">RFP
        <ol type="i">
          <li value="1">New Validator node tooling that integrates mechanisms for Daml application management including application discovery, review & security analysis; approval, installation and upgrading. Individual parties, including both the node operator party and hosted parties, may choose to vet and/or unvet Daml packages, across all Validators with hosting rights for a given party.
          </li>
          <li value="2">We anticipate approving multiple grants in this area as work progresses over the coming year.
          </li>
        </ol>
      </li>
      <li value="2">Prior Examples of grants issued in this area include:
        <ol type="i">
          <li value="1"><a href="https://github.com/canton-foundation/canton-dev-fund/blob/main/proposals/2026-03-Certora-daml_package_analyzer_proposal%20.md">2026-03-Certora-daml_package_analyzer_proposal .md</a>
          </li>
        </ol>
      </li>
    </ol>
  </li>
  <li value="4">Application-level resilience and party-level Highly Available failover
    <ol type="a">
      <li value="1">RFP
        <ol type="i">
          <li value="1">Enhancements to the Canton Protocol and Ledger API making it simple for an application provider to build, deploy and upgrade applications that are able to fail gracefully across multiple nodes operating that same application, using Daml parties multi-hosted across those nodes.
          </li>
        </ol>
      </li>
      <li value="2">Prior Examples:
        <ol type="i">
          <li value="1">None
          </li>
        </ol>
      </li>
    </ol>
  </li>
  <li value="5">Multi-synchronizer support for protocol, application development and operations
    <ol type="a">
      <li value="1">RFP
        <ol type="i">
          <li value="1">Canton has been designed for horizontal scalability, enabling the extension of the network by adding additional synchronizers. The core capability exists in an initial form but must be matured and proliferated across the existing tooling to support the further expansion and growth of the network. As part of this, we expect a series of projects targeting the final hardening and rollout of the capabilities, as well as improvements to developer tooling, including multi-sync sandboxes, documentation updates, and tooling updates.
          </li>
          <li value="2">We anticipate approving multiple grants in this area as work progresses over the coming year.
          </li>
        </ol>
      </li>
    </ol>
  </li>
  <li value="6">Continuous Resilience & Scaling Improvements on the Global Synchronizer
    <ol type="a">
      <li value="1">RFP
        <ol type="i">
          <li value="1">The Global Synchronizer forms the backbone of Canton Network MainNet. It is in the interest of all network participants to improve its ability to operate without downtime, with minimal oversight and intervention, while scaling to support the targets mentioned above. We welcome proposals for enhancing operational resilience and automation, throughput, data scaling, and ever-more streamlined upgrades.
          </li>
          <li value="2">We anticipate approving multiple grants in this area as work progresses over the coming year.
          </li>
        </ol>
      </li>
      <li value="2">Prior Examples
        <ol type="i">
          <li value="1">Synchronizer resilience
            <ol type="1">
              <li value="1"><a href="https://github.com/canton-foundation/canton-dev-fund/blob/main/proposals/2026-03-DA-Logical-Synchronizer-Upgrades.md">2026-03-DA-Logical-Synchronizer-Upgrades.md</a>
              </li>
            </ol>
          </li>
          <li value="2">Validator and Synchronizer throughput
            <ol type="1">
              <li value="1"><a href="https://github.com/canton-foundation/canton-dev-fund/blob/main/proposals/2026-04-DA-scalability_performance_robustness.md">2026-04-DA-scalability\_performance\_robustness.md</a>
              </li>
              <li value="2"><a href="https://github.com/canton-foundation/canton-dev-fund/blob/main/proposals/2026-02-DA-ISS-based-BFT.md">2026-02-DA-ISS-based-BFT.md</a>
              </li>
            </ol>
          </li>
        </ol>
      </li>
    </ol>
  </li>
  <li value="7">Expanded Network Access and Validator Onboarding
    <ol type="a">
      <li value="1">RFP
        <ol type="i">
          <li value="1">The Development Fund is interested in proposals that enable open, scalable validator onboarding without manual scaling gates. Proposals may include self-service onboarding tooling, topology and identity workflows, tokenomics changes, security and availability enhancements, automated readiness checks, capacity monitoring, and operational dashboards. Successful proposals should reduce or eliminate Foundation and committee coordination of network access while preserving network reliability, security, and resilience.
          </li>
        </ol>
      </li>
      <li value="2">Prior examples:
        <ol type="i">
          <li value="1">None
          </li>
        </ol>
      </li>
    </ol>
  </li>
</ol>


### Governance, Identity & Network Coordination

<ol type="1">
  <li value="8">Canton Coin Tokenomics
    <ol type="a">
      <li value="1">RFP
        <ol type="i">
          <li value="1">Canton Coin Tokenomics manage the process through which network participants work to earn Canton Coin rewards. Tokenomics are designed both to incentivize useful work and to secure the network from harmful activity. Tokenomics should be designed such that offchain governance decisions are limited, both in time and scope, allowing the network to scale while rewarding useful activity. Proposals in this area should focus on incentives for featured application providers that reduce the overhead of featured application governance and limit malicious or counterproductive behavior by application providers; support the economics of hosting parties on Validator nodes, and encourage active participation in Super Validator governance processes.
            <ol type="1">
              <li value="1">A CIP is a co-requirement for these RfPs
              </li>
            </ol>
          </li>
          <li value="2">We anticipate approving multiple grants in this area as work progresses over the coming year.
          </li>
        </ol>
      </li>
      <li value="2">Prior Examples:
        <ol type="i">
          <li value="1"><a href="https://github.com/canton-foundation/canton-dev-fund/blob/main/proposals/2026-02-DA-Traffic-Based-App-Rewards.md">2026-02-DA-Traffic-Based-App-Rewards.md</a>
          </li>
        </ol>
      </li>
    </ol>
  </li>
  <li value="9">Governance automation
    <ol type="a">
      <li value="1">RFP
        <ol type="i">
          <li value="1">Build tools that reduce manual governance overhead and improve the reliability, transparency, and participation of Canton governance processes.Proposals may focus on expanded Super Validator voting, operator rotation, proposal lifecycle tracking, voting dashboards, notification systems, governance audit logs, and automation of repeatable governance workflows.
          </li>
          <li value="2">We have not yet determined how many grants may be approved in this area
          </li>
        </ol>
      </li>
      <li value="2">Prior Examples:
        <ol type="i">
          <li value="1"><a href="https://github.com/canton-foundation/canton-dev-fund/blob/main/proposals/2026-04-Avro-SV_Governance_dApp.md">2026-04-Avro-SV\_Governance\_dApp.md</a>
          </li>
          <li value="2"><a href="https://github.com/canton-foundation/canton-dev-fund/blob/main/proposals/2026-04-Obsidian-CIP-0105.md">2026-04-Obsidian-CIP-0105.md</a>
          </li>
        </ol>
      </li>
    </ol>
  </li>
  <li value="10">Federated Canton Name Service
    <ol type="a">
      <li value="1">RFP
        <ol type="i">
          <li value="1">Develop and improve naming, identity discovery, and party metadata infrastructure for Canton. Proposals should support a federated Canton Name Service and related metadata standards that help users, applications, validators, and institutions discover and verify parties, applications, credentials, and asset registries. Successful proposals should improve interoperability across party metadata on Canton, with good usability and trust while preserving Canton’s privacy and permissioning model.
          </li>
          <li value="2">We anticipate approving multiple grants in this area as work progresses over the coming year.
          </li>
        </ol>
      </li>
      <li value="2">Prior examples:
        <ol type="i">
          <li value="1">None
          </li>
        </ol>
      </li>
    </ol>
  </li>
</ol>


### Financial Markets, Standards & Verification

<ol type="1">
  <li value="11">Public verifiability
    <ol type="a">
      <li value="1">RFP
        <ol type="i">
          <li value="1">Canton intentionally keeps transaction details private. But markets rely on reliable, often publicly available information to provide accurate signals of price, demand, total supply, and volume. Asset issuers and transaction participants have the option to make private data public, but this presents meaningful tradeoffs: An aggregate value published by an issuer might not be trusted by the market, and private transaction disclosure defeats confidentiality. We’re looking for proposals that progress Canton toward public verifiability of key metrics.  Approaches to consider, from simple (and less trusted) to complex (but more trustworthy) might include: Standardized tooling for asset issuers – including decentralized asset issuers – to publish public aggregates of activity and value; mechanisms to allow issuers to disclose private data streams to Trusted Execution Environments (TEEs), and then allow selective disclosure from that TEE to approved external parties; Zero-knowledge proofs of aggregate data, operated by decentralized attestor pools.
          </li>
          <li value="2">We have not yet determined how many grants may be approved in this area
          </li>
        </ol>
      </li>
      <li value="2">Prior examples: None
      </li>
    </ol>
  </li>
  <li value="12">RWA Standards
    <ol type="a">
      <li value="1">RFP
        <ol type="i">
          <li value="1">Develop open standards, tooling, and reference implementations that improve interoperability across Canton applications and make traditional asset workflows easier to represent onchain and integrate with existing institutional systems. Proposals may respond to one of the following discrete areas:
            <ol type="1">
              <li value="1">Identity, Credentials and KYC Standards for RWA Workflows
                <ol type="a">
                  <li value="1">Develop provider-neutral standards for issuing, verifying, reusing, updating, and revoking credentials required for real-world asset and institutional financial workflows. Relevant credentials may include:
                    <ol type="i">
                      <li value="1">KYC or KYB status
                      </li>
                      <li value="2">Accreditation or investor qualification
                      </li>
                      <li value="3">Licensing or regulatory status
                      </li>
                      <li value="4">Jurisdiction or residency
                      </li>
                      <li value="5">Authority to act on behalf of an institution
                      </li>
                      <li value="6">Eligibility to hold or transact in a particular asset
                      </li>
                    </ol>
                  </li>
                  <li value="2">Standards should allow a credential issued or verified by one provider to be recognized by other Canton applications where appropriate, reducing the need for parties to repeat the same verification process.
                  </li>
                  <li value="3">Proposals should preserve Canton’s privacy model and support proving that a party satisfies a requirement without unnecessarily disclosing the underlying personal or institutional data. Work should focus on open standards, interfaces, and reference implementations rather than proprietary identity or compliance services.
                  </li>
                  <li value="4">Proposals should account for relevant work already underway through the Identity and Metadata SIG and any associated CIP or standards initiatives.
                  </li>
                </ol>
              </li>
              <li value="2">Daml and Institutional RWA Workflow Standards
                <ol type="a">
                  <li value="1">Develop reusable Daml models, interfaces, APIs, tooling, and reference implementations for real-world assets and institutional transaction workflows on Canton. Proposals may include:
                    <ol type="i">
                      <li value="1">Token and asset representation standards
                      </li>
                      <li value="2">Asset metadata standards
                      </li>
                      <li value="3">Issuance, transfer, redemption, and cancellation workflows
                      </li>
                      <li value="4">Corporate actions and other asset lifecycle events
                      </li>
                      <li value="5">Post-trade processing and settlement standards
                      </li>
                      <li value="6">Delivery-versus-payment and settlement-flow patterns
                      </li>
                      <li value="7">Repo, collateral, lending, and servicing workflows
                      </li>
                      <li value="8">Interoperability between Canton applications
                      </li>
                      <li value="9">Integration mappings for existing institutional systems
                      </li>
                      <li value="10">API-level compatibility standards
                      </li>
                      <li value="11">Conformance tests and reference implementations
                      </li>
                    </ol>
                  </li>
                  <li value="2">Successful proposals should support multiple issuers and applications rather than a single proprietary implementation.
                  </li>
                </ol>
              </li>
            </ol>
          </li>
          <li value="2">We have not yet determined how many grants may be approved in this area
          </li>
        </ol>
      </li>
      <li value="2">Prior Examples:
        <ol type="i">
          <li value="1"><a href="https://github.com/canton-foundation/canton-dev-fund/blob/main/proposals/2026-03-DA-token-standard-v2.md">2026-03-DA-token-standard-v2.md</a>
          </li>
          <li value="2"><a href="https://github.com/canton-foundation/canton-dev-fund/blob/main/proposals/2026-05-Kaiko-data-standard.md">2026-05-Kaiko-data-standard.md</a>
          </li>
        </ol>
      </li>
    </ol>
  </li>
  <li value="13">Payments and DeFi
    <ol type="a">
      <li value="1">RFP
        <ol type="i">
          <li value="1">Develop open-source tooling, reference implementations, and standards, for payments, DeFi, settlement, and liquidity workflows on Canton. Proposals should support real economic activity, improve composability, and make it easier for applications to build financial workflows that are private, auditable, and interoperable. Successful proposals should focus on reusable components or standards that can support multiple Canton applications rather than one-off application-specific work.
          </li>
          <li value="2">We have not yet determined how many grants may be approved in this area
          </li>
        </ol>
      </li>
      <li value="2">Prior Examples:
        <ol type="i">
          <li value="1"><a href="https://github.com/canton-foundation/canton-dev-fund/blob/main/proposals/2026-03-Deepthi-canton-payment-streams.md">2026-03-Deepthi-canton-payment-streams.md</a>
          </li>
          <li value="2"><a href="https://github.com/canton-foundation/canton-dev-fund/blob/main/proposals/2026-03-FTP-x402-protocol-integration.md">2026-03-FTP-x402-protocol-integration.md</a>
          </li>
          <li value="3"><a href="https://github.com/canton-foundation/canton-dev-fund/blob/main/proposals/2026-03-Srikanth-reference-implementation-of-settlement-pattern-and-reference-dex-implementation.md">2026-03-Srikanth-reference-implementation-of-settlement-pattern-and-reference-dex-implementation.md</a>
          </li>
          <li value="4"><a href="https://github.com/canton-foundation/canton-dev-fund/blob/main/proposals/2026-04-OpenZeppelin-canton-ecosystem-stack.md">2026-04-OpenZeppelin-canton-ecosystem-stack.md</a>
          </li>
        </ol>
      </li>
    </ol>
  </li>
</ol>


### Developer Experience, Tooling & Education

<ol type="1">
  <li value="14">Wallet and dApp Integration tooling
    <ol type="a">
      <li value="1">RFP
        <ol type="i">
          <li value="1">Wallets are a primary interface for users, hosted parties, application providers, and institutional workflows on Canton. The Development Fund is interested in proposals that improve wallet integration tooling, reusable wallet components, signing flows, account/party management, and application-to-wallet interactions.
          </li>
          <li value="2">We anticipate approving multiple grants in this area as work progresses over the coming year.
          </li>
        </ol>
      </li>
      <li value="2">Prior Examples:
        <ol type="i">
          <li value="1"><a href="https://github.com/canton-foundation/canton-dev-fund/blob/main/proposals/2026-02-Cayvox%20Labs-PartyLayer-Wallet-SDK.md">2026-02-Cayvox-Labs-PartyLayer-Wallet-SDK.md</a>
          </li>
          <li value="2"><a href="https://github.com/canton-foundation/canton-dev-fund/blob/main/proposals/2026-03-DA-Canton-Network-dapp-sdk-and-tooling.md">2026-03-DA-Canton-Network-dapp-sdk-and-tooling.md</a>
          </li>
          <li value="3"><a href="https://github.com/canton-foundation/canton-dev-fund/blob/main/proposals/2026-03-DA-splice-wallet-kernel-open-source.md">2026-03-DA-splice-wallet-kernel-open-source.md</a>
          </li>
        </ol>
      </li>
    </ol>
  </li>
  <li value="15">Canton 3.x Training and Documentation
    <ol type="a">
      <li value="1">RFP
        <ol type="i">
          <li value="1">Create practical, developer-facing documentation, onboarding kits, training materials, and examples that reduce the time required for new teams to build on Canton. Proposals should focus on reusable public materials that help application developers, validator operators, Featured App teams, and institutional integrators understand how to design, build, test, deploy, and operate Canton applications. Proposals may include quickstart guides, reference architectures, deployment checklists, sample applications, troubleshooting guides, recorded training, workshops, exercises, and onboarding material for validators, application developers, and Featured App teams.
          </li>
          <li value="2">We anticipate approving multiple grants in this area as work progresses over the coming year. Our recommendation for this RFP is small, incremental proposals to enhance existing training materials.
          </li>
        </ol>
      </li>
      <li value="2">Prior Examples:
        <ol type="i">
          <li value="1"><a href="https://github.com/canton-foundation/canton-dev-fund/blob/main/proposals/2026-02-Obsidian-daml-training-proposal-v4.md">2026-02-Obsidian-daml-training-proposal-v4.md</a>
          </li>
        </ol>
      </li>
    </ol>
  </li>
  <li value="16">Daml / Developer Usability Gaps (Daml U256 Support)
    <ol type="a">
      <li value="1">RFP:
        <ol type="i">
          <li value="1">The Development Fund is interested in proposals to close usability gaps in Daml, including support for unsigned 256-bit integer workflows commonly needed in token, DeFi, and digital asset applications, as well as native bytes type support.
          </li>
          <li value="2">This is a specialized RFP that will require deep Daml expertise. It may be suitable for experienced teams with sufficient language, compiler, or financial application development background.
          </li>
        </ol>
      </li>
      <li value="2">Prior examples:
        <ol type="i">
          <li value="1">None
          </li>
        </ol>
      </li>
    </ol>
  </li>
  <li value="17">SDKs in different languages (standard)
    <ol type="a">
      <li value="1">RFP
        <ol type="i">
          <li value="1">The Development Fund is interested in proposals to develop, extend and maintain SDKs or client libraries in programming languages commonly used by application developers, financial institutions, and infrastructure providers. Proposals should follow the ledger client standard (<a href="https://docs.google.com/spreadsheets/d/1iR3GqKx6ktqqBiNIwRhoOuzOh0jf_7H-pQ7QRGOLl9s/edit?gid=541890420#gid=541890420">https://docs.google.com/spreadsheets/d/1iR3GqKx6ktqqBiNIwRhoOuzOh0jf\_7H-pQ7QRGOLl9s/edit?gid=541890420#gid=541890420</a>; the standard is going to move into the docs) common interface standards where possible and should include documentation, examples, tests, versioning practices, and a maintenance plan. SDKs should make it easier for developers to interact with Canton APIs, wallets, validators, application services, and network tooling without needing to build low-level integrations from scratch.
          </li>
          <li value="2">The number of proposals will depend on the number submitted with each needing to identify the target language, the intended developer audience, the APIs or workflows covered, and how compatibility will be maintained as Canton evolves.
          </li>
          <li value="3">Currently supported languages and existing kits are: Java, Typescript, Go, C#, Rust, Python (but more work is required to align them with the ledger client standard).
          </li>
          <li value="4">Not yet known fully featured SDK: C++, Scala
          </li>
          <li value="5">Prior examples:
            <ol type="1">
              <li value="1"><a href="https://github.com/canton-foundation/canton-dev-fund/blob/main/proposals/2026-06-Nodejumper-rust-sdk.md">2026-06-Nodejumper-rust-sdk.md</a>
              </li>
              <li value="2"><a href="https://docs.canton.network/sdks-tools/api-reference/json-api">https://docs.canton.network/sdks-tools/api-reference/json-api</a>
              </li>
            </ol>
          </li>
        </ol>
      </li>
    </ol>
  </li>
  <li value="18">Integration into SDLCs
    <ol type="a">
      <li value="1">RFP
        <ol type="i">
          <li value="1">Build tooling that helps teams integrate Canton development into existing software development lifecycles, including CI/CD pipelines, testing frameworks, deployment workflows, package vetting, environment management, and release automation.
          </li>
        </ol>
      </li>
      <li value="2">Prior examples:
        <ol type="i">
          <li value="1">None
          </li>
        </ol>
      </li>
    </ol>
  </li>
  <li value="19">DPM Components and Extension Ecosystem
    <ol type="a">
      <li value="1">RFP
        <ol type="i">
          <li value="1">Proposals that extend DPM as a standard CLI for Canton smart contract development by creating reusable DPM components for the broader developer community. Proposals may include custom project templates, scaffolding tools, deployment helpers, testing utilities, fee estimators, local dashboards, package registry integrations, debugging workflows, observability tools, or other first-class extensions that make it easier to build, test, deploy, and maintain Canton applications. Successful proposals should follow DPM component conventions, be broadly reusable, include documentation and examples, and include a clear maintenance plan.
          </li>
        </ol>
      </li>
      <li value="2">Prior examples:
        <ol type="i">
          <li value="1">No prior grant examples. However, the Foundation DevRel team has compiled a list of suggestions for this area:
            <ol type="1">
              <li value="1"><a href="https://docs.google.com/document/d/1TCkM0Cq4bxIct55wvfZLmr720yhiUCXskN3AKX99lcY/edit?usp=sharing">DPM Plugin &amp; Component Use Cases</a>
              </li>
            </ol>
          </li>
        </ol>
      </li>
    </ol>
  </li>
  <li value="20">Indexers
    <ol type="a">
      <li value="1">RFP
        <ol type="i">
          <li value="1">Indexers and observability tools are essential for application development, debugging, reporting, auditability, and network analytics. The Development Fund is interested in proposals that improve both node-local, application-level, and network-wide visibility while preserving Canton’s privacy boundaries. Proposals may include node-local indexers, application-level indexers, debugging tools, observability dashboards, network activity reporting, and deployable on-premise or hosted visibility tools. Proposals should not assume that all information currently available from protocol messages will remain publicly exposed. Publicly observable activity, such as certain Canton Coin transfers, may remain available, but the metadata currently exposed through the Mediator may change. Applicants should therefore clearly identify:
            <ol type="1">
              <li value="1">Which data their proposal requires
              </li>
              <li value="2">Whether that data is node-local, application-provided, or publicly observable
              </li>
              <li value="3">How the proposal will continue to function if involved-party metadata is no longer publicly available
              </li>
              <li value="4">How privacy, access controls, and selective disclosure will be handled
              </li>
            </ol>
          </li>
          <li value="2">Preference will be given to approaches that do not depend on unintended protocol-level metadata exposure and that remain useful as Canton’s privacy protections evolve.
          </li>
          <li value="3">We have not yet determined how many grants may be approved in this area
          </li>
        </ol>
      </li>
      <li value="2">Node-local
        <ol type="i">
          <li value="1">Prior Examples:
            <ol type="1">
              <li value="1"><a href="https://github.com/canton-foundation/canton-dev-fund/blob/main/proposals/2026-03-DA-OSS-validator-indexer-pqs.md">2026-03-DA-OSS-validator-indexer-pqs.md</a>
              </li>
            </ol>
          </li>
        </ol>
      </li>
      <li value="3">Network-wide
      </li>
    </ol>
  </li>
</ol>


*Note: The* <a href="https://docs.google.com/document/d/1IQybhCKoM1NRecLp2ei1WjmDwJ9Js5n74uPAljP1xnU/edit?usp=sharing">*Canton Foundation Q2 DevRel Survey*</a> *highlighted the following two areas for improvement:*

<ul>
  <li>Transaction simulation / dry-run tooling (Tenderly-equivalent) was requested by Q1 respondents and reappears in Q2 as a repeated ask, the debugging/observability gap looks like the longest-standing unmet need in the dataset.
  </li>
</ul>




* Transaction Debugging & Observability was the lowest-rated area in Q1 at 2.55 and remained tied for lowest in Q2 at 3.26. Although the score improved, it continued to rank below the other experience areas in both quarters.

### Security, Assurance & Incident Readiness

<ol type="1">
  <li value="21">Independent Security Assessments and Audits
    <ol type="a">
      <li value="1">RFP
        <ol type="i">
          <li value="1">Conduct independent security assessments of Canton Network infrastructure, protocols, software components, and related tooling, either individually or as an integrated system. Proposals may cover protocol and architecture reviews, implementation audits, penetration testing, threat modeling, dependency and supply-chain analysis, or targeted assessments of high-risk components. Work should identify actionable findings, remediation recommendations, and appropriate retesting or validation. Proposals may build on the security assessment scope and requirements previously discussed in [Development Fund PR #410](https://github.com/canton-foundation/canton-dev-fund/pull/410).
          </li>
          <li value="2">We anticipate approving multiple grants in this area as work progresses over the coming year.
          </li>
        </ol>
      </li>
      <li value="2">Prior examples:
        <ol type="i">
          <li value="1">None
          </li>
        </ol>
      </li>
    </ol>
  </li>
  <li value="22">Daml Security Standards and Secure Development
    <ol type="a">
      <li value="1">RFP
        <ol type="i">
          <li value="1">Develop security standards, best practices, tooling, and reference materials for the secure design, development, testing, and deployment of Daml applications. Proposals may include secure coding guidance, threat models, testing methodologies, automated analysis, security-focused linting or static analysis, common vulnerability patterns, review checklists, reference implementations, and CI/CD integration.
          </li>
          <li value="2">Work should help application developers consistently identify and prevent security weaknesses before Daml packages are deployed or vetted.
          </li>
          <li value="3">We anticipate approving multiple grants in this area as work progresses over the coming year.
          </li>
        </ol>
      </li>
      <li value="2">Prior examples:
        <ol type="i">
          <li value="1">None
          </li>
        </ol>
      </li>
    </ol>
  </li>
  <li value="23">Validator and Shared Infrastructure Security and Resilience
    <ol type="a">
      <li value="1">RFP
        <ol type="i">
          <li value="1">Develop reusable tools, controls, and standards that improve the security, reliability, availability, and recoverability of Validator infrastructure and other shared Canton components. Proposals may include hardened configurations, automated assessments, backup and recovery, resilience testing, supply-chain security, or security controls for hosted Validator services.
            <ol type="1">
              <li value="1">Successful proposals should be broadly applicable across multiple Validator operators or infrastructure providers and should account for the operational realities of both self-operated and hosted Validator environments. Proposals should explain how the work complements, rather than duplicates, existing resilience, scalability, and application-management initiatives.
              </li>
            </ol>
          </li>
          <li value="2">We anticipate approving multiple grants in this area as work progresses over the coming year.
          </li>
        </ol>
      </li>
      <li value="2">Prior examples:
        <ol type="i">
          <li value="1">None
          </li>
        </ol>
      </li>
    </ol>
  </li>
  <li value="24">Incident Reporting and Coordinated Response
    <ol type="a">
      <li value="1">RFP
        <ol type="i">
          <li value="1">Develop tools, standards, and playbooks that improve security incident detection, escalation, reporting, communication, recovery, and post-incident review across the Canton ecosystem. Proposals may include common severity classifications, secure reporting channels, coordinated response procedures, tabletop exercises, or vulnerability-disclosure processes.
          </li>
          <li value="2">We anticipate approving multiple grants in this area as work progresses over the coming year.
          </li>
        </ol>
      </li>
      <li value="2">Prior examples:
        <ol type="i">
          <li value="1">None
          </li>
        </ol>
      </li>
    </ol>
  </li>
  <li value="25">Identity and Access Control
    <ol type="a">
      <li value="1">RFP
        <ol type="i">
          <li value="1">Develop reusable standards and tooling for authentication, authorization, privileged access, role-based controls, service accounts, administrative monitoring, and secure onboarding and offboarding across Canton infrastructure and applications.
          </li>
          <li value="2">We anticipate approving multiple grants in this area as work progresses over the coming year.
          </li>
        </ol>
      </li>
      <li value="2">Prior examples:
        <ol type="i">
          <li value="1">None
          </li>
        </ol>
      </li>
    </ol>
  </li>
  <li value="26">Key Management and Signing Controls
    <ol type="a">
      <li value="1">RFP
        <ol type="i">
          <li value="1">Develop standards, tooling, and reference architectures for key custody, signing policies, ClearSigning and human-readable transaction verification, segregation of duties, key rotation, recovery, hardware security modules, and multi-party approval. Proposals may include approaches that allow users and institutional signers to verify transaction intent, counterparties, amounts, permissions, and other material parameters before authorization, reducing reliance on blind signing. Proposals should address practical requirements for institutional, hosted, and self-operated environments.
          </li>
          <li value="2">We anticipate approving multiple grants in this area as work progresses over the coming year.
          </li>
        </ol>
      </li>
      <li value="2">Prior examples:
        <ol type="i">
          <li value="1">None
          </li>
        </ol>
      </li>
    </ol>
  </li>
  <li value="27">Security Monitoring, Auditability and Evidence
    <ol type="a">
      <li value="1">RFP
        <ol type="i">
          <li value="1">Develop reusable tools and standards for security logging, monitoring, alerting, audit trails, compliance evidence, and security metrics while preserving Canton’s privacy model. Proposals should identify the threats being monitored, whether the scope is at the entity or network level, required data sources and how privacy, access controls, and selective disclosure will be handled.
          </li>
          <li value="2">We anticipate approving multiple grants in this area as work progresses over the coming year.
          </li>
        </ol>
      </li>
      <li value="2">Prior examples:
        <ol type="i">
          <li value="1">None
          </li>
        </ol>
      </li>
    </ol>
  </li>
  <li value="28">Security Governance and Member Assurance
    <ol type="a">
      <li value="1">RFP
        <ol type="i">
          <li value="1">Develop common security baselines, control frameworks, assessment tools, attestations, and assurance processes for Canton participants. Proposals should provide practical standards that can be adopted across Validators, application providers, infrastructure providers, and other ecosystem participants.
          </li>
          <li value="2">We anticipate approving multiple grants in this area as work progresses over the coming year.
          </li>
        </ol>
      </li>
      <li value="2">Prior examples:
        <ol type="i">
          <li value="1">None
          </li>
        </ol>
      </li>
    </ol>
  </li>
</ol>


NOTE Any CIP requiring technical implementation would become an area of interest automatically, and acts as its own RFP. For example, CIP-0111 calls for the ability to “burn unminted escrowed rewards”, which would require a new technical implementation.
