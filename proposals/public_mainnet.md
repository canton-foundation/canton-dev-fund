## Development Fund Proposal

**Author:** Kevin  
**Status:** Draft  
**Created:** 2026-03-28  

---

## Abstract

This proposal introduces **Canton Public RPC**, a shared, permissionless infrastructure service that provides standard RPC endpoints for the Canton Network — analogous to what Infura and Alchemy provide for Ethereum. Today, deploying a Daml application on Canton mainnet requires obtaining a dedicated participant node — a process with high barriers, long approval cycles, and complex traffic-cost negotiations. This friction is the single largest bottleneck to Canton ecosystem growth.

Canton Public RPC eliminates this barrier by providing production-ready RPC endpoints, a standardized API specification, comprehensive documentation, and client SDKs. Any developer, anywhere in the world, can connect to Canton mainnet with a single API key — no node application, no traffic negotiation, no infrastructure management.

---

## Specification

### 1. Objective

Canton's architecture is powerful but its developer onboarding path has a critical gap. To deploy a Daml application on mainnet today, a developer must:

1. Apply for a validator/participant node — a process that can take weeks to months.
2. Provision and maintain server infrastructure for the node.
3. Negotiate traffic arrangements with existing validators, since on-chain activity consumes shared network resources.
4. Manage ongoing node operations, upgrades, and connectivity.

For an experienced infrastructure team, this is manageable. For a product-focused developer or a small team trying to ship an MVP, it is a dealbreaker. The result is predictable: promising projects stall at the deployment stage, developers choose easier-to-access networks, and Canton's ecosystem growth falls behind networks with lower infrastructure barriers.

**Canton Public RPC** solves this by providing:

1. **Public RPC Endpoints** for Canton Mainnet — accessible via standard HTTPS with API key authentication.
2. **A Standardized RPC API Specification** that wraps Canton's Ledger API and JSON API into a clean, well-documented, developer-friendly interface — following patterns familiar to developers from Ethereum's JSON-RPC.
3. **Client SDKs** (JavaScript/TypeScript) that abstract the RPC layer into idiomatic library calls.
4. **Comprehensive Developer Documentation** including quickstart guides, API references, code examples, and migration guides from direct Ledger API usage.
5. **A Developer Dashboard** for API key management, usage monitoring, rate limit visibility, and error diagnostics.

### 2. Implementation Mechanics

**Infrastructure Layer**

- Dedicated Canton participant nodes operated on Canton Mainnet, provisioned with sufficient resources to serve shared traffic.
- Load-balanced RPC gateway fronting the participant nodes, providing high availability, automatic failover, and geographic distribution.
- API key authentication and rate limiting to prevent abuse while ensuring fair access.
- Request logging and analytics pipeline for usage monitoring and capacity planning.

**RPC API Specification**

A standardized API layer that exposes Canton's core functionality through a clean, versioned REST + WebSocket interface:

- **Party Management**: Create and manage parties on the shared participant.
- **Contract Operations**: Create, exercise choices, and query active contracts via Daml templates.
- **Transaction Streams**: WebSocket-based real-time transaction and event subscriptions.
- **Package Management**: Upload and manage Daml packages (DAR files).
- **Identity & Auth**: JWT-based authentication tied to API keys and party access control.
- **Health & Status**: Network status, sync state, and endpoint health checks.

All endpoints follow a consistent naming convention, error format, and pagination model — documented in OpenAPI 3.0 specification.

**Client SDKs**

- **JavaScript/TypeScript SDK** (`@canton/rpc-client`): Typed client with auto-generated Daml contract bindings, WebSocket stream helpers, and retry logic. Compatible with Node.js and browser environments.
- The SDK provides a "3-line quickstart" experience:
  ```javascript
  const canton = new CantonRPC({ apiKey: "your-key", network: "mainnet" });
  const contracts = await canton.query("MyModule:MyTemplate", { owner: partyId });
  await canton.exercise(contractId, "MyChoice", { arg: value });
  ```

**Developer Dashboard**

- API key creation and management (multiple keys per project, per-environment).
- Real-time usage analytics: request volume, latency percentiles, error rates.
- Rate limit status and upgrade paths.
- Daml package deployment interface with version management.
- Integrated log viewer for debugging failed requests.

**Usage Tiers & Sustainability Model**

To ensure long-term sustainability without ongoing grant dependency:

- **Free Tier**: Generous free quota for development and small projects (sufficient for MVP development and early traction).
- **Growth Tier**: Higher rate limits and priority support, paid in CC — creating organic CC demand and consumption.
- **Enterprise Tier**: Dedicated capacity, SLA guarantees, and custom configurations.

Traffic fees are denominated in CC, creating a **self-sustaining economic loop**: developers pay CC for API access, which funds infrastructure operations and supports the Canton ecosystem's growth — a virtuous cycle aligned with Canton's incentive model.

### 3. Architectural Alignment

**Shared Participant Model**  
Canton Public RPC operates a shared participant node on which multiple developers' applications coexist. Each developer's party is isolated through Canton's native party-based access control — ensuring that one developer cannot access another's contracts or transaction data. This leverages Canton's built-in privacy guarantees without requiring custom isolation logic.

**Canton JSON API Compatibility**  
The RPC API specification is a superset of Canton's existing JSON API, adding developer-friendly abstractions (simplified authentication, automatic party management, enhanced error messages) while remaining fully compatible with existing Daml tooling.

**Ecosystem Multiplier Effect**  
Every barrier removed from the developer onboarding path has a multiplicative effect on ecosystem growth. Canton Public RPC does not compete with existing validators — it feeds them. Projects that start on the public RPC and grow to significant scale will naturally migrate to dedicated participant nodes, expanding the validator ecosystem.

### 4. Backward Compatibility

*No backward compatibility impact.*

Canton Public RPC is an additive infrastructure layer. It does not modify the Canton protocol, existing participant nodes, or any on-chain contracts. Developers who currently operate their own nodes are unaffected. The public RPC is a new, optional access path to the same Canton network.

---

## Milestones and Deliverables

### Milestone 1: Base Infrastructure & Alpha API (Mainnet Beta)
- **Estimated Delivery:** 5 weeks from approval
- **Focus:** Base participant node setup, RPC gateway architecture, and Alpha API specification
- **Deliverables / Value Metrics:**
  - Base participant nodes deployed and synchronized on Canton Mainnet (Beta/Internal access)
  - Load-balanced RPC gateway with initial API key authentication and rate limiting
  - RPC API Specification v1.0 Alpha published as OpenAPI 3.0 document
  - Core API endpoints functionally verified: party management, contract operations, and basic transaction queries
  - WebSocket transaction stream endpoint (Initial testing phase)
  - Internal API key management and monitoring tools
  - Functional end-to-end request flow on Mainnet for invited Beta users

### Milestone 2: SDKs, Developer Dashboard & Documentation
- **Estimated Delivery:** 5 weeks from Milestone 1 acceptance
- **Focus:** Client libraries, developer experience, and documentation
- **Deliverables / Value Metrics:**
  - JavaScript/TypeScript SDK published to npm with full API coverage, type definitions, and WebSocket support
  - Developer Dashboard: API key management, usage analytics, package deployment, and log viewer
  - Developer Documentation site: quickstart guides (deploy first contract in <10 minutes), API reference, SDK guides, code examples, and FAQ
  - "3-line quickstart" verified for the SDK

### Milestone 3: Production Public Launch & Sustainability
- **Estimated Delivery:** 3 weeks from Milestone 2 acceptance
- **Focus:** Public production deployment, usage tiers, and long-term operational excellence
- **Deliverables / Value Metrics:**
  - Public Production Launch: Mainnet RPC service opened to the public, capable of serving high-volume production traffic
  - Usage tier system fully active: Integration of CC-based payments for Growth/Enterprise tiers
  - Production-grade monitoring, alerting, and auto-scaling infra for 99.5%+ availability
  - Operations runbook: Detailed incident response and upgrade procedures for zero-downtime maintenance
  - Open-source release: Full RPC API spec, SDK source code, and documentation released under Apache 2.0 license
  - Sustainability report: Detailed financial and usage forecast for CC-based self-funding

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone
- Demonstrated functionality or operational readiness
- Documentation and knowledge transfer provided
- Alignment with stated value metrics

**Project-specific acceptance conditions:**

- RPC endpoints must achieve ≥99.5% uptime during the evaluation period (measured from gateway health checks)
- API response latency must be ≤200ms at p95 for standard query operations under normal load
- SDKs must pass comprehensive test suites covering all API endpoints, with verified compatibility on their respective platforms
- A new developer must be able to deploy a "Hello World" Daml contract to Mainnet using only the public documentation and SDK, without any assistance, in under 10 minutes
- The shared participant model must demonstrate effective party isolation — no cross-party data leakage under adversarial testing

---

## Funding

**Total Funding Request:** 3,000,000 CC

### Payment Breakdown by Milestone
- Milestone 1 (Core Infrastructure & RPC Specification): **1,000,000 CC** upon committee acceptance
- Milestone 2 (SDKs, Developer Dashboard & Documentation): **1,200,000 CC** upon committee acceptance
- Milestone 3 (Mainnet Launch & Sustainability): **800,000 CC** upon final release and acceptance

### Volatility Stipulation
The project duration is **under 6 months** (estimated 13 weeks total).

Should the project timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility.

---

## Co-Marketing

Upon release, the implementing team will collaborate with the Canton Foundation on:

- **Announcement coordination**: Joint launch announcement positioning Canton Public RPC as the official developer gateway to the Canton Network.
- **Case study or technical blog**: A technical blog post and walkthrough detailing the architecture and developer experience.
- **Developer or ecosystem promotion**: 
  - "Build on Canton in 10 Minutes" developer tutorial and video walkthrough.
  - Integration into Canton's official developer documentation and onboarding materials.
  - Quarterly developer adoption reports showcasing ecosystem growth enabled by the public RPC.

---

## Motivation

Developer adoption is the lifeblood of any blockchain ecosystem. The networks that win are not necessarily the most technically advanced — they are the ones where developers can go from idea to deployed application with the least friction.

Canton's current developer onboarding path has a structural bottleneck: the requirement for a dedicated participant node to deploy on mainnet. This creates a multi-week, multi-party coordination process that kills momentum at the most critical moment — when a developer is excited about their idea and ready to build.

Consider the contrast:
- **Ethereum**: A developer can deploy a smart contract to mainnet in minutes using a free Infura/Alchemy RPC endpoint, MetaMask, and Remix.
- **Canton today**: A developer must apply for a node, wait for approval, provision infrastructure, negotiate traffic arrangements, and manage ongoing operations — before writing a single line of Daml.

This gap is not a reflection of Canton's technical capabilities — it is an infrastructure gap that can and should be filled.

Canton Public RPC provides the **missing on-ramp**:

- **For new developers**: Zero-to-mainnet in minutes, not weeks. The free tier removes all financial barriers to experimentation.
- **For existing projects**: Faster iteration cycles — deploy, test with real users, and iterate without infrastructure concerns.
- **For the Canton Foundation**: A measurable developer adoption funnel — API key registrations, active projects, and contract deployments become trackable ecosystem growth metrics.
- **For the validator ecosystem**: A growth engine, not a competitor. Projects that outgrow the shared RPC become candidates for dedicated participant nodes, expanding the validator network.
- **For Canton's competitive position**: Parity with Ethereum, Solana, and other developer-friendly networks on the most basic infrastructure requirement — accessible RPC endpoints.

The question is not whether Canton needs public RPC infrastructure. The question is how quickly it can be delivered.

---

## Rationale

**Why a horizontally scalable, shared-participant architecture?**

Canton's architecture supports multiple parties on a single participant node with cryptographic isolation, ensuring each developer's data remains private by design. This is the most capital-efficient way to provide shared infrastructure. To ensure high availability and performance, Canton Public RPC fronts **multiple shared participant nodes** with a **load-balanced gateway**. This architecture eliminates single points of failure — if one node fails, traffic is automatically rerouted to healthy nodes — and allows for seamless horizontal scaling as ecosystem demand grows.

**Why build a new RPC specification rather than expose the raw JSON API?**

Canton's JSON API is powerful but designed for operators, not application developers. It assumes familiarity with Canton's architecture, party model, and Daml-specific concepts. A developer-friendly RPC layer abstracts these complexities, provides familiar patterns (REST + WebSocket, API keys, SDK auto-configuration), and dramatically reduces the learning curve. The raw JSON API remains available for advanced users who need direct access.

**Why include SDKs rather than just documentation?**

Documentation tells developers what to do. SDKs do it for them. The difference in adoption between "read the docs and construct HTTP requests" and "npm install and call a function" is typically 10x or more. SDKs also provide type safety, auto-completion, and error handling that prevent common mistakes and reduce support burden.

**Why a CC-based sustainability model?**

Grant-funded infrastructure without a revenue model becomes a liability after the grant ends. By pricing API access in CC from the start, Canton Public RPC creates organic CC demand (developers need CC to access the API), supports network activity, and builds toward financial independence — ensuring the infrastructure persists regardless of future grant availability.

**Why this team?**

The implementing team operates an active Canton validator node on mainnet and has direct experience with the full lifecycle of Canton node deployment, Daml application development, and the operational challenges of the current onboarding process. This proposal is born from firsthand experience with the exact problem it solves.

**Alternatives considered:**

- *Waiting for individual validators to offer shared access*: No economic incentive exists for validators to do this voluntarily, as it consumes their traffic allocation without clear revenue.
- *Foundation-operated RPC service*: Possible but creates centralization concerns and operational burden on the Foundation. A community-operated, grant-funded service with a path to sustainability is more aligned with Canton's decentralization principles.
- *Third-party cloud blockchain platforms (e.g., QuickNode)*: Canton's unique architecture (Daml, sub-transaction privacy, party model) requires purpose-built tooling. Generic blockchain infrastructure providers lack the Canton-specific expertise to deliver an effective developer experience.

Canton Public RPC is the highest-leverage infrastructure investment the ecosystem can make. Every other Canton application — current and future — benefits from a lower barrier to entry.
