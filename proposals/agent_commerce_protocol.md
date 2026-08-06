## Development Fund Proposal

**Author:** Celeste Ang, Jon Eilerman, Sean Kim
**Status:** Under Review  
**Created:** 2026-03-13

---

## Abstract
EVM-based projects have historically been unable to access Canton without rebuilding their entire stack, creating a significant barrier for many active agent ecosystems in crypto. Virtuals Protocol, one of the fastest growing AI agent platforms, faces the same limitation.

Virtuals Protocol is also a co-author of ERC-8183 (Agentic Commerce), an emerging Ethereum standard developed with the Ethereum Foundation’s dAI team to enable trustless commerce between AI agents. ERC-8183 introduces a programmable Job primitive where payment escrow, deliverable submission, and evaluator attestation are enforced on-chain, providing foundational infrastructure for a decentralized agent economy.

This proposal outlines an integration that solves Canton accessibility directly. By leveraging Zenith’s EVM compatibility layer, Virtuals Protocol can deploy its existing contracts and AI agents onto Canton without modifying its current stack, delivering a production-ready integration that brings Virtuals’ agent ecosystem to Canton while enabling access to its privacy, compliance, and settlement infrastructure.

Key deliverables include deploying Virtuals’ contracts on Canton via Zenith EVM, validating cross-environment wallet compatibility, and completing end-to-end testing through to Canton Mainnet settlement. The work is scoped across three milestones with an estimated delivery timeline of 6 weeks from grant approval.

The expected outcome is the first integration of an agent commerce protocol onto Canton, bringing an established developer community and user base into the ecosystem while demonstrating how open standards like ERC-8183 can enable decentralized AI agents to transact securely across chains and networks. This integration also establishes a repeatable model for onboarding EVM-based protocols into the Canton ecosystem at scale.

---

## Specification

### 1. Objective
Any EVM project seeking to build on Canton today must rewrite its entire stack in Daml. The consequence is that Canton's privacy model, compliance infrastructure, and settlement rails remain inaccessible to the majority of active web3 developers, including Virtuals Protocol.
This proposal seeks funding to deploy Virtuals Protocol's existing Solidity contracts and AI agent infrastructure onto Canton Mainnet via Zenith's EVM execution environment. The intended outcome is production-grade infrastructure and tooling that enables developers to easily onboard AI agents and participate in agentic commerce within the Canton ecosystem.

### 2. Implementation Mechanics
Virtuals Protocol will deploy its existing contracts through Zenith's EVM execution layer. EVM wallet and developer tooling compatibility will be tested and validated against Canton's identity and transaction model. All transactions route through Canton, settling atomically on Canton MainNet. Testing will cover the full integration: contract execution, AI agent transaction flows, and end-to-end Mainnet settlement propagation. The work is structured across 3 milestones over a 6-week period.

### 3. Architectural Alignment
Zenith is not a bridge or workaround. It runs natively inside Canton's Global Synchronizer as a Tier-1 Super Validator under CIP-0091. Building through Zenith means Virtuals Protocol accesses Canton's privacy controls, compliance infrastructure, and settlement finality through the sanctioned path, not around it.
This also fits squarely within the fund's objectives. Bringing an established EVM protocol onto Canton expands network utility, widens the developer base, and proves that onboarding no longer requires a full rebuild.

### 4. Backward Compatibility
No backward compatibility impact. Virtuals Protocol's contracts are deployed as net-new workloads on Zenith EVM and introduce no changes to existing Canton synchronization domains, Daml models, or validator configurations. All existing Canton participants and workflows remain entirely unaffected.

---

## Milestones and Deliverables

### Milestone 1: EVM Integration and MVP
- **Estimated delivery:** 3 weeks from grant approval
- **Focus:** Deploy Zenith’s EVM compatibility layer on Canton and validate that Virtuals Protocol contracts can run without modification.
- **Deliverables / Value Metrics:** 
  - Deploy Virtuals Protocol EVM smart contracts through Zenith EVM
  Validate transaction execution and contract interactions between Virtuals Protocol and the Zenith EVM environment.
  - Demonstrate a working ACP job lifecycle execution on the Canton test environment.
  - Document the developer workflow for deploying EVM contracts onto Canton via Zenith.

### Milestone 2: End-to-end implementation ready for TestNet deployment
- **Estimated Delivery:** 5 weeks from grant approval 
- **Focus:** Integrate supporting infrastructure and validate the end-to-end system for production deployment.
- **Deliverables / Value Metrics:**  
  - Integrate Privy for wallet authentication and onboarding within the Virtuals ecosystem, and developer tooling support (e.g. SDKs)
  - Validate end-to-end execution of ACP jobs including authentication, contract interaction, and settlement via Zenith EVM testnet.
  - Conduct final integration testing and system validation.
  - Prepare deployment documentation and readiness for testnet deployment.

### Milestone 3: End-to-end implementation ready for Mainnet deployment
- **Estimated delivery:** Starts one week before mainnet launch, with targeted duration of 1 week
- **Focus:** Promote the validated implementation to Canton MainNet and enable production usage.
- **Deliverables / Value Metrics:**  
  - Deploy Virtuals Protocol contracts to Canton MainNet via Zenith EVM.
  - Validate MainNet compatibility with Alchemy RPC infrastructure and Privy wallet authentication.
  - Demonstrate successful execution of ACP transactions on Canton MainNet.
  - Publish deployment documentation and developer guidance for building ACP agents on Canton Network.

### Milestone #4: Daml Builder Competition

**Estimated delivery:** 2–4 weeks following the successful deployment of Zenith EVM and Virtuals Protocol contracts on Canton Mainnet, with a targeted duration of 1 month.

**Focus:** Launch a global builder competition to accelerate the development of Daml-focused agents within the Canton ecosystem using the Agent Commerce Protocol (ACP).

- **Deliverables / Value Metrics:** 
- Launch a public builder competition focused on Daml developer agents
- Publish a builder board outlining problem statements and submission guidelines
- Support developers building ACP-enabled agents for Daml development
- Evaluate submissions and award prizes to the top projects

---

## Acceptance Criteria
Milestone 1:
- Virtuals Protocol EVM smart contracts are successfully deployed through Zenith EVM in the Canton test environment.
- At least one full smart contract transaction (deployment + invocation) is successfully executed and verified on the Zenith EVM environment running on Canton.
- A complete ACP job lifecycle (job creation → acceptance → completion → settlement) is successfully demonstrated within the Canton test environment.
- Contract interactions show deterministic and consistent results across multiple test runs.
- Documentation is published describing the developer workflow for deploying EVM contracts onto Canton via Zenith.


Milestone 2:
- Privy wallet authentication is successfully integrated and can be used to authenticate users interacting with ACP agents.
- Authenticated users can submit and complete ACP jobs through the Zenith EVM testnet environment.
- End-to-end execution of ACP jobs (authentication → job creation → contract interaction → settlement) is demonstrated successfully.
Integration tests confirm system stability across multiple job executions without critical errors.
- Deployment documentation and operational guidelines for running the system on testnet are completed and published.

Milestone 3:
- Virtuals Protocol contracts are successfully deployed to Canton MainNet through Zenith EVM.
- Privy authentication and Alchemy RPC infrastructure function correctly in the MainNet environment.
At least one successful ACP transaction lifecycle is executed and verified on Canton MainNet.
- The deployed system demonstrates stable execution across multiple MainNet transactions.
- Public documentation is published describing how developers can deploy and build ACP agents on Canton using Zenith EVM.

Milestone 4:
- The Daml Builder Competition is publicly announced with documentation describing the challenge, submission requirements, and evaluation criteria.
- Developers submit ACP-enabled agents capable of assisting with Daml development tasks such as coding, debugging, documentation, or onboarding.
- Submissions are evaluated based on technical quality, innovation, and ecosystem impact.
- Winning teams are selected and awarded prizes according to the published prize structure.

---

## Performance Metrics
This integration brings one of the most active ecosystems in Web3 directly onto Canton. Here's what that means for the network:
- **More wallets, immediately**. Virtuals has nearly 18,000 public agents operating onchain today. Canton gains a material jump in daily active addresses from day one of MainNet deployment.
- **Real settlement volume**. Every ACP job flows through Canton's Global Synchronizer. Extending existing volume to a new network.
- **A faster path for every EVM project that comes after**. This integration becomes the template. What took months of Daml rewrites before now takes weeks.
- **A stake in a market projected to hit $1T**. Virtuals agents are already generating roughly $1B in annual economic value. Canton becoming the settlement layer for even a portion of that trajectory is a meaningful long-term position.
- **Early Adopter**. No major AI-native protocol has landed on Canton before. That changes with this integration, and it's the kind of milestone that makes other teams pay attention.

## Funding

**Total Funding Request:**  

### Payment Breakdown by Milestone

- **Milestone 1 (Zenith EVM Integration and MVP)**: $24,000 upon committee acceptance  
- **Milestone 2 (End-to-End Testnet Implementation)**: $16,000 upon committee acceptance  
- **Milestone 3 (MainNet Deployment and Validation)**: $8,000 upon committee acceptance  
- **Milestone 4 (Daml Builder Competition)**: $6,000 upon final release and acceptance

## Funding Commercials

### Milestone #1 (3 Weeks)

| Resource | Day Rate | Days | Total (USD) |
|----------|----------|------|-------------|
| Developer | $800.00 | 15 | $12,000.00 |
| Developer | $800.00 | 15 | $12,000.00 |
| **Subtotal** |  |  | **$24,000.00** |

---

### Milestone #2 (2 Weeks)

| Resource | Day Rate | Days | Total (USD) |
|----------|----------|------|-------------|
| Developer | $800.00 | 10 | $8,000.00 |
| Developer | $800.00 | 10 | $8,000.00 |
| **Subtotal** |  |  | **$16,000.00** |

---

### Milestone #3 (1 Week)

| Resource | Day Rate | Days | Total (USD) |
|----------|----------|------|-------------|
| Developer | $800.00 | 5 | $4,000.00 |
| Developer | $800.00 | 5 | $4,000.00 |
| **Subtotal** |  |  | **$8,000.00** |

---

### Daml Builder Competition

| Resource | Day Rate | Days | Total (USD) |
|----------|----------|------|-------------|
| Rewards Pool | $6,000.00 | 1 | $6,000.00 |
| **Subtotal** |  |  | **$6,000.00** |

---

### Total Funding Requested

| Item | Amount (USD) |
|------|-------------|
| Milestone #1 | $24,000.00 |
| Milestone #2 | $16,000.00 |
| Milestone #3 | $8,000.00 |
| Daml Builder Competition | $6,000.00 |
| **Grand Total** | **$54,000.00** |

### Volatility Stipulation
If the project duration is **greater than 6 months**:  
The grant is denominated in fixed Canton Coin and will require a re-evaluation at the 6-month mark.

If the project duration is **under 6 months**:  
Should the project timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility.

---

## Co-Marketing
Virtuals Protocol will coordinate the following with Canton Network:

Announcement 
- Canton Network will post the adoption announcement from their own channels. The required anchor line is: "Canton Network is adopting ERC-8183, the open standard for agentic commerce." 
- Beyond this, Canton Network is encouraged to add their own narrative highlighting Canton's strengths in institutional DeFi, privacy-preserving transactions, and regulated asset infrastructure.
- Virtuals Protocol will amplify via quote tweet from @virtuals_io. Full marketing requirements, reference banner, and timeline details are outlined in the partner proposal linked below.

Timeline 
- Announcements begin the week of March 16, 2026. Preferred date to be confirmed.

Full proposal: [link](https://docs.google.com/document/d/1mNUJDTBlCmaLwuihcPTULKNzvapGb7gp/edit?usp=sharing&ouid=110635435840179571576&rtpof=true&sd=true)

---

## Motivation
Canton's long-term vision is a network where multiple execution environments can interoperate while preserving privacy, regulatory compliance, and atomic settlement. However, today most Web3 applications are built on EVM-based stacks. Requiring these projects to rebuild their infrastructure in Daml creates a significant barrier to entry for many of the most active developer communities.

Virtuals Protocol represents one of the fastest growing ecosystems for AI agents in Web3, with a rapidly expanding developer base and production usage across agent registries, marketplaces, and on-chain coordination primitives. Enabling Virtuals to deploy directly onto Canton without rewriting its stack would significantly lower the onboarding friction for EVM-native projects while demonstrating Canton's ability to integrate emerging AI-driven applications.

By leveraging Zenith's EVM compatibility layer introduced through CIP-0091, this integration allows Virtuals Protocol to deploy its existing contracts and agent infrastructure onto Canton while preserving its current developer tooling and codebase. This approach accelerates the path for EVM ecosystems to access Canton's privacy guarantees, regulated financial infrastructure, and atomic settlement model.

The outcome is not only the integration of a major AI-native protocol into Canton, but also a repeatable pathway for onboarding EVM ecosystems at scale.

---

## Rationale
Zenith provides the most direct and technically aligned path for bringing EVM-based applications onto Canton without requiring fundamental architectural changes.

Unlike external bridges or compatibility layers that operate outside of Canton’s core consensus model, Zenith runs natively within Canton's Global Synchronizer as a Tier-1 Super Validator under CIP-0091. This allows EVM workloads to execute within Canton's infrastructure while preserving the network's guarantees around privacy, composability, and deterministic settlement.

Because Zenith already provides the execution framework for EVM compatibility on Canton, deploying Virtuals Protocol through this environment requires minimal modification to existing infrastructure. Virtuals can deploy its Solidity contracts using the same Hardhat and Foundry tooling currently used across its stack, while maintaining compatibility with standard EVM wallets such as MetaMask.

This architecture ensures that the integration does not introduce fragmentation or parallel execution environments outside of Canton. Instead, it demonstrates a native pathway for EVM ecosystems to participate directly within Canton’s regulated and privacy-preserving infrastructure.

By completing this integration, the project establishes a proven technical model for onboarding EVM-native protocols, validating Zenith’s compatibility layer while expanding Canton’s developer ecosystem with a rapidly growing AI agent platform.
