Development Fund Proposal: EventualX
Author: EventualX Team 
Status: Draft 
Created: 2026-02-28 

Abstract: EventualX is a privacy-first parimutuel prediction market protocol designed for institutional macro-hedging on the Canton Network. By leveraging Daml 3.2, EventualX allows participants to stake USDC.x on real-world outcomes with sub-second settlement and absolute transaction privacy. This proposal delivers a robust framework for decentralized "Ritual Staking," providing the Canton ecosystem with a high-liquidity financial primitive that demonstrates the power of the Global Shared Ledger.

Specification
1. Objective
Currently, prediction markets on public blockchains (e.g., Ethereum/Polygon) suffer from a "transparency tax"—large institutional participants cannot hedge macro-economic risks without revealing their positions to the entire market. EventualX solves this by using Canton’s sub-net privacy model. The objective is to provide a regulated-grade parimutuel engine where the outcome is public and verifiable, but the identity and size of individual stakes are private.
2. Implementation Mechanics
* Smart Contracts: Written in Daml 3.2, utilizing the AssetDeposit and Staking templates to handle atomic USDC.x flows.
* Identity: Integration with Nightly Wallet and the Canton Identity Provider (IdP) to map browser-based wallets to permissioned Loop nodes.
* Oracle Integration: A specialized "Resolver" service that ingests verified data from institutional sources (e.g., Kalshi API) to trigger contract settlement.
* Frontend: A "Brutalist" React/Next.js interface providing real-time "Heartbeat" updates via WebSockets to reflect market sentiment without compromising privacy.
3. Architectural Alignment
EventualX aligns with the Canton Global Shared Ledger priorities by:
* Utilizing Daml’s atomic composability to ensure that payouts can only occur if the Oracle signal and Staking Pool are cryptographically matched.
* Adhering to Privacy-by-Design principles, ensuring that transaction data stays on the participant's node and is only shared with necessary counterparties (the Resolver).
* Supporting the adoption of USDC.x as the primary settlement asset for the ecosystem.
4. Backward Compatibility
No backward compatibility impact.

Milestones and Deliverables
Milestone 1: Canton Loop Prototype (The ETH Denver MVP)
Estimated Delivery: 2026-03-15 Focus: Core staking logic and wallet integration. Deliverables / Value Metrics:
* Functional Daml 3.2 staking templates.
* Nightly Wallet integration for participant onboarding.
* Successful demo of parimutuel odds calculation on a local Canton Node.
Milestone 2: Institutional Oracle Integration & Scaling
Estimated Delivery: 2026-05-15 Focus: Hardening the "Resolver" and scaling pool capacity. Deliverables / Value Metrics:
* Production-grade bridge to Kalshi/Institutional data feeds.
* Support for "Queued Candidates" (Community signaling for future markets).
* Deployment to the Canton Testnet with multi-node participation.
Milestone 3: Mainnet Readiness & Audit
Estimated Delivery: 2026-07-15 Focus: Security and ecosystem promotion. Deliverables / Value Metrics:
* Full security audit of Daml settlement contracts.
* Open-source release of the useCantonWallet frontend hook.
* Mainnet deployment with a minimum of 3 institutional participant nodes.

Acceptance Criteria
1. Successful execution of a "Staking Ritual" where USDC.x is moved atomically.
2. Verified privacy: Confirming that Node A cannot see the stake size of Node B.
3. Oracle-triggered settlement: Automatic payout distribution within <2 seconds of signal receipt.
4. Documentation: Complete technical guide for developers to build "Prophecies" on the protocol.

Funding
Total Funding Request: 50,000 Canton Coin (CC)
Payment Breakdown by Milestone:
* Milestone 1: 15,000 CC upon committee acceptance.
* Milestone 2: 20,000 CC upon committee acceptance.
* Milestone 3: 15,000 CC upon final release and acceptance.

Co-Marketing
EventualX will collaborate with the Foundation on:
* Official announcement of the first institutional-grade prediction market on Canton.
* A technical deep-dive blog post on "Privacy in Prediction Markets via Daml."
* A live workshop at a future Digital Asset/Canton developer event.

Motivation
Prediction markets are the "purest" form of data aggregation. By bringing this to Canton, we provide a reason for high-net-worth and institutional users to hold and move USDC.x on the network. EventualX turns Canton into a hub for macro-economic "truth," increasing the network's strategic importance as the bridge between traditional finance and decentralized settlement.
Rationale
Parimutuel markets were chosen over order-book markets because they offer guaranteed liquidity. In a Canton sub-net, order-matching is difficult due to privacy constraints; however, parimutuel pools (where "Yes" vs "No" weights determine price) are mathematically transparent while allowing individual contributions to remain opaque. This is the only viable approach for high-integrity, private institutional hedging.

