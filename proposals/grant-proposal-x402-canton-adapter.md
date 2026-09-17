**CANTON FOUNDATION Protocol Development Fund**

**GRANT PROPOSAL x402-Canton Adapter**

Native HTTP Micropayments for the Canton Network Ecosystem

*Categories: Developer Tooling  •  Reference Implementations March 2026*

**Executive Summary**  
The x402-Canton Adapter is an open-source, audited infrastructure layer enabling native HTTP micropayments on the Canton Network.  
It provides a standardized payment primitive for APIs, data services, and AI agents without requiring custom DAML logic or off-chain payment systems.  
This unlocks monetization for Canton-native applications while preserving privacy and composability.

The deliverable consists of three tightly scoped components:   
(1) Canton Payment Middleware for server-side payment verification,   
(2) Canton Payment SDK for client-side payment construction, and   
(3) A Reference Implementation with documentation and templates. All outputs will be released as permissive open-source under Apache 2.0.

If deployed early, this infrastructure has the potential to become the default monetization layer for data services, APIs, and AI agents operating on Canton — can become a standard monetization primitive for Canton-based services.Visa

| Proposal Title | x402-Canton Adapter: Native HTTP Micropayments for Canton Network  |
| :---- | :---- |
| Grant Categories  | Developer Tooling, Reference Implementations  |
| Requested Funding | $150,000 | 1,072,500 CC (milestone-based)  Funding Structure | Milestone-based disbursement (see Funding section) |
| Currency | Canton Coin (as per CIP-0100)  |
| Estimated Duration | 3 months (3 milestones)  |
| License | Apache 2.0 (permissive open-source license) |
| Target Network | Canton MainNet \+ DevNet/TestNet  |
| Audit  | Included in M3 milestone |
| Status  | Seeking Tech & Ops Committee Champion |

1\. Problem Statement

Canton Network is production-ready for institutional asset settlement and tokenization. However, there is currently no standard, lightweight mechanism for Canton-native applications to charge for API access or data services — a critical gap as the ecosystem grows toward broader developer adoption.

This gap is particularly acute for two categories of ecosystem participants that are essential to driving mainstream adoption. First, streaming finance protocols such as Zebec Network and Cantara, which rely on continuous, programmable payment flows and would benefit from native monetization of their Canton-based infrastructure. Second, institutional-grade key and wallet infrastructure providers like Fireblocks and Dfns, whose clients demand seamless, compliant models for accessing and paying for blockchain-based services. Large payment and infrastructure providers (e.g., Visa, Circle, Paysafe) illustrate the type of integrations that would require standardized monetization primitives.

**Today, a developer who wants to monetize a Canton-based data service must choose between:**

⦁Building bespoke payment contracts in DAML — high complexity, slow to iterate  
⦁Routing payments through external EVM chains — breaks Canton's privacy model  
⦁Using subscription-based billing — not viable for AI agents and machine-to-machine APIs  
⦁No payment at all — leaving economic value on the table

This creates a compounding problem: without a payment primitive, Canton's developer ecosystem cannot build sustainable business models around data services, oracle feeds, or AI agent interactions. The x402 protocol, developed by Coinbase, solves exactly this problem for EVM chains — but has no Canton integration.

**2\. Proposed Solution**  
The x402-Canton Adapter bridges the x402 HTTP payment standard with the Canton Network settlement layer. It enables any Canton application to participate in the emerging machine-payment economy with minimal integration effort.

**What is x402?**  
x402 is an open HTTP payment protocol that leverages the long-dormant HTTP 402 'Payment Required' status code.  
• Client makes an API request  →  Server returns 402 \+ payment details  
• Client constructs and signs a Canton transaction  →  Attaches it to the retry request  
• Server verifies on-chain settlement  →  Returns the protected resource  
This flow works natively for AI agents, automation pipelines, and any HTTP client — no human interaction required.

**2.1  Architecture Overview**  
The solution has three layers that together cover the full payment lifecycle:

| Layer | Component | Responsibility |
| :---- | :---- | :---- |
| Server | Canton Payment Middleware | Intercept HTTP requests, issue 402 challenges, verify Canton transactions, grant access |
| Client | Canton Payment SDK | Construct payment requests, sign transactions, handle retries, manage Canton wallet state  |
| Ecosystem Reference Implementation | Reference Implementation | Working demo, developer templates, deployment guide, integration tests |

**2.2  Component 1: Canton Payment Middleware**  
A server-side HTTP middleware (initially targeting Node.js and Golang) that wraps any existing API endpoint with x402 payment gating. The middleware handles the full challenge-response cycle without requiring changes to business logic.

**Core Capabilities:**  
⦁Configurable 402 challenge generation with Canton-specific payment details (asset type, amount, destination party)  
⦁Transaction extraction and validation from incoming HTTP headers  
⦁Canton Ledger API integration for real-time settlement confirmation  
⦁Pluggable authorization hooks — define custom access rules per endpoint  
⦁Support for Canton's privacy model: sub-transaction visibility for the service provider only  
⦁Rate limiting and replay-attack prevention via transaction ID deduplication

Technical Design Note — Canton Privacy Compatibility  
***Canton's sub-transaction privacy means that a payment to a service provider need only be visible to the payer and payee — no global state exposure. The middleware verifies settlement by querying the Canton Ledger API using the service provider's party credentials, fully preserving Canton's privacy guarantees. This is a key architectural advantage over EVM-based alternatives.***

**2.3  Component 2:** **Canton Payment SDK**  
A client-side SDK that enables applications, scripts, and AI agents to autonomously pay for Canton-gated APIs. The SDK abstracts Canton transaction construction, signing, and submission into a simple, idiomatic interface.

**Core Capabilities**  
⦁Canton Ledger API client with connection management and retry logic  
⦁Payment request parsing — extract asset, amount, and destination from 402 responses  
⦁Daml transaction builder for Canton Coin and custom token transfers  
⦁Wallet integration: connect to existing Canton party credentials  
⦁TypeScript \+ Golang bindings with full type safety

**2.4  Component 3: Reference Implementation**  
A complete, production-grade example application demonstrating the full stack. This is the primary learning resource for Canton developers and the reusable template for ecosystem builders.

What is Included:  
⦁Paid Data API: a Canton-native financial data service with tiered pricing (per-call and subscription-style)  
⦁Docker Compose deployment stack for instant local development  
⦁End-to-end integration tests covering happy path and failure cases (insufficient funds, replay attack, wrong asset)  
⦁Comprehensive developer documentation: setup guide, API reference, architecture diagrams, migration guide from EVM x402  
⦁Recorded walkthrough video for Canton developer community and AMA series

**3\. Technical Architecture**  
**3.1  Request Flow Diagram**  
The following describes the complete lifecycle of a payment-gated API call using the x402-Canton Adapter:

| Step | Client (SDK) | Canton Middleware | Canton Network	 | Result |
| :---- | :---- | :---- | :---- | :---- |
| 1 | HTTP GET /api/data | Returns HTTP 402 \+ payment details JSON | — | 402 issued  |
| 2 | Parses 402 payload, builds Canton transaction | Waits for retry | — | Tx built |
| 3 | Submits tx to Canton Ledger via SDK  | — | Tx committed to ledger | On-chain |
| 4 | Attaches tx proof to HTTP header, retries GET | Verifies tx on Ledger API | Returns confirmation | Verified |
| 5 | Receives 200 OK \+ protected payload  | Grants access, serves response | — | Success |

**3.2  Component Interaction Map**  
The three components interact through well-defined interfaces, enabling independent versioning and community extensions:  
**Middleware  ←→  Canton Ledger API  ←→  SDK**  
Canton Payment Middleware  
• Exposes: x402ChallengeHandler(config) — Express/FastAPI middleware factory  
• Consumes: Canton Ledger API (gRPC/HTTP) for transaction verification  
• Emits: PaymentEvent webhooks for downstream analytics

Canton Payment SDK  
• Exposes: CantonPaymentClient.pay(response402) — async payment handler  
• Exposes: CantonWallet.connect(credentials) — party credential manager  
• Consumes: Canton Ledger API for transaction submission

Reference Implementation  
• Wires Middleware \+ SDK together in a realistic scenario  
• Provides Docker Compose stack, seeded test data, and end-to-end tests

**3.3  Canton-Specific Design Decisions**

| Privacy preservation | Middleware verifies settlement via provider party credentials only — no global ledger scan. Payer details are not exposed to the API server beyond what Canton's privacy model allows.  |
| :---- | :---- |
| **Daml contract design** | Payment verification uses a minimal Daml template — a PaymentReceipt contract visible only to payer and payee. No new token standards; uses Canton Coin or existing Canton tokens.  |
| **Canton Coin denomination** | Pricing configuration accepts amounts in Canton Coin microdivisional units. Exchange rate oracle integration is provided as an optional plugin for fiat-pegged pricing.  |
| **Ledger API version** | Targets Canton 3.x Ledger API (gRPC \+ JSON/HTTP). Compatibility shim for Canton 2.x DevNet provided.  |
| **Auth model**  | Service provider authenticates to Canton Ledger using their existing party JWT — no new key management infrastructure required. |

**4\. Engineering Roadmap**  
The project is structured in three milestones across five months, with milestone-based funding releases as per Canton Foundation grant policy.

**Milestone 1 — Foundation  (Months 1–2)**  
Deliverables  
• Canton Payment Middleware v0.1 — Node.js (Express) \+ Golang  implementations  
• Core 402 challenge generation and transaction verification logic  
• Canton Ledger API integration (Canton 3.x, DevNet/TestNet)  
• Daml PaymentReceipt template (minimal, auditable)  
• Unit test suite (\>80% coverage)  
• Internal technical documentation

Acceptance Criteria: Middleware correctly gates a test endpoint. Payment verified end-to-end on Canton DevNet.

**Milestone 2 — SDK \+ Integration  (Months 3–4)**  
Deliverables  
• Canton Payment SDK v0.1 — Node.js+ Golang  
• Full payment lifecycle: parse 402, build tx, sign, submit, attach proof  
• Wallet integration module for Canton party credentials  
• Integration tests: end-to-end on TestNet  
• SDK API documentation (TypeDoc/Sphinx)

Acceptance Criteria: SDK client successfully pays for and retrieves resources from Milestone 1 middleware. AI agent demo functional on TestNet.

**Milestone 3 — Reference Implementation \+ Launch  (Month 5\)**  
**Deliverables**  
• Reference Implementation: Paid Data API   
• Docker Compose deployment stack  
• End-to-end test suite covering: happy path, insufficient funds, replay attack, expired challenge, wrong asset  
• Developer documentation: setup guide, API reference, architecture diagrams, migration guide  
• Canton developer community launch: blog post, recorded walkthrough, Discord/Slack presence  
• MainNet deployment of reference app  
• Security Audit Report

|  | Month 1 | Month 2  | Month 3  |
| :---- | :---- | :---- | :---- |
| Middleware | Design \+ Core | Complete \+ Tests  | Hardening |
| SDK | \- | Design | Core Complete \+ Tests  |
| Reference Impl. | \- | Build | Launch |
| Documentation  | Ongoing | Review | Final Review |
| Community | \- | Beta | Launch |

**5\. Alignment with Grant Program Thesis**  
This proposal addresses two explicit funding categories from the Canton Foundation Protocol Development Fund, as stated in CIP-0082 and the grant program documentation:

| Grant Category | How This Proposal Qualifies |
| :---- | :---- |
| Developer Tooling  | The Canton Payment Middleware and SDK are purpose-built tools that make it faster and easier for developers to build monetized applications on Canton. A developer can add payment gating to any API endpoint in under 30 minutes. |
| Reference Implementations | The Reference Implementation is explicitly designed to be forked and reused. It provides templates for the most common Canton monetization patterns (data APIs, oracle services, AI agent interactions) and serves as the canonical example for future Canton ecosystem projects.  |

***On 'Common Good' for the Canton Ecosystem***  
*The Canton Foundation's core criterion is whether a proposal 'delivers a common good for the Canton ecosystem.' The x402-Canton Adapter is foundational infrastructure — not a competing application. Every data service, oracle provider, and AI agent framework that launches on Canton can use this adapter. Its value compounds with the growth of the network: more API providers adopting x402 means more economic activity on Canton, which benefits all network stakeholders including Super Validators.*

*Critically, this infrastructure does not exist today on Canton. Being early matters: an open-source adapter released under Apache 2.0 and championed by the Canton Foundation is likely to become the default standard, preventing fragmentation from competing proprietary implementations.*

**5.1  Strategic Value to the Network**

| New business models | API monetization becomes viable for Canton-native data providers, oracle services, and analytics platforms without custom Daml payment infrastructure. |
| :---- | :---- |
| **AI agent economy**  | AI agents operating autonomously on Canton can pay for data and computation natively — a prerequisite for the agentic use cases that institutional players are beginning to explore. |
| **Developer attraction**  | A well-documented, easy-to-use payment primitive lowers the barrier to entry for new Canton developers and increases the surface area of the ecosystem. |
| **Economic activity** | Per-call micropayments create a new category of on-chain transaction volume, contributing to network utility metrics and Canton Coin demand. |
| **Ecosystem composability**  | As a common standard, x402-Canton enables payment interoperability between Canton applications — a data provider built by one team can be consumed by an agent built by another without bespoke integration. |

**6\. Risk Assessment & Mitigation**

| Risk  | Likelihood | Mitigation |
| :---- | :---- | :---- |
| Canton Ledger API changes breaking integration  | Medium | Pin to Canton 3.x LTS; maintain compatibility matrix; automated regression tests against DevNet on each Canton release |
| x402 protocol evolves in incompatible direction | Low | Adapter is versioned; x402 is an open standard with stable HTTP semantics at its core; Coinbase has public roadmap |
| Low developer adoption | Medium | Reference Implementation \+ documentation investment; community launch plan; Discord presence; outreach to existing Canton app builders  |
| Daml PaymentReceipt template security issues  | Low | Minimal template design limits attack surface; invite Canton core team review; optional security audit as stretch goal  |
| Milestone delays | Low-Medium | **3-month timeline** is conservative; Month 1-2 scope is tightly bounded; clear acceptance criteria per milestone |

**Long-Term Maintenance**

Post-grant, the adapter will be maintained as an open-source project. The maintenance plan includes:  
⦁Automated CI/CD against Canton DevNet to catch compatibility regressions early  
⦁Semantic versioning with a documented deprecation policy  
⦁Community contribution guidelines (CONTRIBUTING.md) to enable ecosystem participation  
⦁Issue tracker and Discord channel for Canton developer community support  
⦁Annual compatibility review with Canton core team to align on protocol evolution

**7\. Team & Capabilities**  
This section to be completed by the applying team. The following outlines the expertise profile required to successfully deliver this proposal:  
The core Asterizm team has successfully launched multiple projects, including:

* **Asterizm.io** – cross-chain messaging protocol integrated with Canton and 30+ EVM and non-EVM networks
* **OmyPayments.com** – crypto payment service: acquiring, invoicing, payouts, exchange, corporate cards, settlement engine
* **Liqvid.xyz** – marketplace for tokenized LP interests and GP stakes of boutique asset managers
* **Chainspot.io** – aggregator of bridges

Asterizm is a well-coordinated Web3 team, working together since 2020\. Our team includes PhDs in Physics, Mathematics, and Computer Science. Founders and developers are Techstars (Polygon) and Y Combinator alumni. We got prizes at hackathons including ETH Global and 10 grants (Cardano, Stellar, Arbitrum, RedBelly, Bahamut, etc.) Previously, the team built multiple DeFi and fintech solutions such as Chainspot, PointPay, Omnypayments, and IndaCoin. Asterizm Protocol was recognized as Top DeFi Infrastructure at multiple competitions and conferences.

| Canton / Daml expertise | Experience building applications on Canton Network; familiarity with Canton Ledger API, Daml contract design, and party credential management Languages: Golang, TypeScript, Solidity, Daml, Rust, Haskel  | Experience: Asterizm expertise: deployed cross-chain messaging including on-chain smart contracts DAML (Canton), EVM, TVM. mooveVM, eUTXO); lending contracts with lock/mint and burn/release functions for cross-chain assets  |
| :---- | :---- | :---- |
| **HTTP protocol & middleware**  | Deep experience with Node.js and Golang server frameworks; understanding of HTTP interceptor patterns, header manipulation, and API design Languages: Golang, TypeScript, Solidity, Daml, Rust, Haskel | **Experience:****Asterizm expertise:** implemented secure messaging transport layers, cross-chain API integration, event-driven workflows for on-chain/off-chain messaging |
| **Blockchain payment systems** | Familiarity with x402 protocol or comparable payment-channel systems; experience with transaction construction and signing Languages: Golang, TypeScript, Solidity | **Experience:** OmyPayments crypto payment service: Crypto Acquiring Invoicing Payouts Exchange & On-/Off-Ramp Corporate Cards Settlement Engine API (White-label solution)  |
| **Developer experience**  | Track record of releasing well-documented open-source developer tools; SDK design experience Languages: Golang, TypeScript, Solidity  | **Experience: [asterizm.io](http://asterizm.io)** Asterizm cross-chain messaging protocol (30+ EVM and non-EVM networks) [omypayments.com](http://omypayments.com) \- crypto payment service [chainspot.io](https://chainspot.io)  cross-chain bridge aggregator (40+ chains integrated) [Liqvid.xyz](http://Liqvid.xyz) \-  *40+ chains integrated) Liqvid.xyz \- marketplace for tokenized LP interests and GP stakes of boutique* |
| **Technical writing**  | Ability to produce clear, accurate developer documentation, architecture diagrams, and community content | The team is skilled at producing clear, high-quality developer and user documentation Example project documentation: Asterizm Protocol: docs.asterizm.io OmyPayments: docs.omypayments.com Liqvid: docsend.com/view/fs3kukj7z45este3 Chainspot: docs.chainspot.io |

**8\. Conclusion.**  
The x402-Canton Adapter addresses a genuine, immediate gap in the Canton developer ecosystem: the absence of a standard, lightweight payment primitive for API monetization. By building this infrastructure now — open-source, well-documented, and production-tested — the Canton ecosystem gains a compounding advantage.

Developers building data services, oracle feeds, AI agent pipelines, and analytics platforms on Canton will have a ready-made solution rather than reinventing payment logic in every application. The Reference Implementation ensures this is not just available infrastructure, but genuinely accessible infrastructure.

The proposal fits squarely within the Canton Foundation's mandate to fund 'common goods for the Canton ecosystem' — and represents the kind of early-stage, high-leverage infrastructure investment that creates the conditions for sustained ecosystem growth.

**9\. Funding.**

**Total Funding Request: $150,000 | 1,072,500 CC**

Payment Breakdown by Milestone

**Milestone 1 (Foundation — Middleware & Core Infrastructure):**  
**$50,000 | 357,500 CC upon committee acceptance**

\- Canton Payment Middleware (Node.js \+ Golang)  
\- Canton Ledger API integration  
\- Daml PaymentReceipt template  
\- Unit testing (\>80% coverage)

**Tranche 1 Total: $50,000 | 357,500 CC**

**Milestone 2 (SDK & Integration):**  
**$50,000 | 357,500 CC upon milestone completion**

\- Canton Payment SDK (Node.js \+ Golang)  
\- Full payment lifecycle (build, sign, submit, verify)  
\- Wallet integration (party credentials)  
\- End-to-end TestNet validation

**Tranche 2 Total: $50,000 | 357,500 CC**

**Milestone 3 (Reference Implementation & Launch):**  
**$50,000 | 357,500 CC upon milestone completion**

\- Production-grade reference implementation (Paid API)  
\- Docker deployment stack  
\- End-to-end testing (including failure scenarios)  
\- Full developer documentation  
\- Security audit  
\- MainNet deployment

**Tranche 3 Total: $50,000 | 357,500 CC**

CC amounts are calculated based on a reference conversion rate and may be adjusted according to the agreed Canton Coin (CC) rate at the time of each milestone disbursement.

Final allocation per milestone can be adjusted in coordination with the Canton Foundation Tech & Ops Committee based on scope prioritization and audit scope.

All payments are expected to be released upon successful completion and validation of the corresponding milestone deliverables.  
