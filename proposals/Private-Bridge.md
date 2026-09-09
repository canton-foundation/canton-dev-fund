## Development Fund Proposal

**Author:** [Encrypt.trade](https://x.com/encifherio)

**Status:** Draft  
**Created:** 2026-03-02  

---

## Abstract
[encrypt.trade](https://encrypt.trade/) is building a privacy-enabled cross-chain bridge that allows institutions to move assets from Solana and EVM chains onto Canton Network without exposing their source chain identity breaking the cross-chain address linkage that currently makes institutional entry into Canton publicly traceable.

We have already demonstrated this capability in production. encrypt.trade was the first team to enable private bridging to ZCash from Solana in 2025, processing $15M+ in volume [see announcement](https://x.com/encifherio/status/1976641950452523328?s=20). In February 2026, we shipped encrypt.trade v2, bringing institutional-grade UX to private bridging for the first time.

Our privacy stack is built on top of Predicate for on-chain policy enforcement, ensuring all private transfers remain compliant.

This proposal funds the integration of that same architecture with Canton delivering critical infrastructure that removes a direct blocker to institutional adoption of the network.

---

## Specification

### 1. Objective
Canton Network is purpose-built for institutional finance. Its configurable privacy model is a compelling differentiator but that privacy begins only *after* assets arrive on Canton.

The bridging transaction itself is public. Anyone can observe that address A on Solana sent assets, and address B on Canton received them permanently linking the two identities across chains.

For institutions managing client funds, proprietary positions, or sensitive treasury operations, this linkage is unacceptable. It prevents serious institutional participants from using Canton as a destination chain without exposing their broader on-chain footprint.

encrypt.trade solves this. We are building a production-ready, open-source, compliance-enforced privacy bridge between Solana and Canton Network.

Any institution, application, or user can use it to move assets onto Canton privately. Any Canton ecosystem developer can build on top of it as a reference implementation.

### 2. Implementation Mechanics
encrypt.trade operates as a two-leg privacy system. The first leg enforces compliance and breaks the on-chain identity linkage at the source chain. The second leg handles private delivery of the desired Canton token to the user's party. All compliance enforcement happens at the source chain entry point no additional compliance infrastructure is required within Canton.

---

Step 1: Source chain compliance check

Before any bridge intent is processed, the user's source Solana address is screened through Predicate's on-chain compliance infrastructure. Predicate integrates TRM Labs, Elliptic, and Chainalysis at configurable risk severity thresholds. This check occurs at the smart contract level not at the API or UI layer. A bad actor cannot bypass it by interacting with the protocol directly or circumventing the frontend.

```
User submits bridge intent with Solana source address
            ↓
Predicate screens address:
TRM Labs     → risk score check
Elliptic     → fund classification
Chainalysis  → sanctions + exposure check
            ↓
Flagged?  → Bridge request rejected. No ephemeral address generated.
No funds enter the system.
Clean?    → Proceed to Step 2.
```

Operators can configure which risk thresholds are accepted and which are denied. New compliance providers can be added without changes to the core protocol. This gives institutions blockchain-certified proof that every counterparty initiating a transfer through the protocol has been cleared at the point of entry.

---

Step 2: Encrypted intent and ephemeral address generation

Once the source address clears compliance, the server generates a Turnkey-controlled ephemeral address unique to this order. The ephemeral address is policy-bound, it is authorised only for the wrapping/deposting operation and nothing else. The user sends funds to this ephemeral address, not to any bridge directly.

This is the first privacy layer: the user's source Solana address is linked only to the ephemeral address, never to their Canton destination party. The Canton party ID is encrypted and is transmitted server-side only it never appears in any on-chain data structure.

---

Step 3: Privacy Pool routing with randomised time delay

Once funds arrive at the ephemeral address, a randomised time delay is introduced before it gets wrapped/deposited into the Privacy Pool. This prevents timing correlation an external observer cannot link a deposit event to any downstream Canton activity by timestamp.

The Privacy Pool is the core unlinkability mechanism. Deposits and withdrawals are structurally disconnected: assets enter from the ephemeral address and exit to a separate Solving Pool address. No on-chain link exists between the two.

---

Step 4: Cross-chain settlement and Canton delivery

Delivery routing splits based on the user's desired Canton output token.

---

```
Path A: USDCx delivery

Solving Pool (Solana)
        ↓
Cross Chain Bridge (Solana → Ethereum USDC)
        ↓
Solving Pool (Ethereum)
        ↓
Circle xReserve depositToRemote()
        ↓
USDCx Holding → User's Canton Party
```

Bridge routes USDC from the Solving Pool on Solana to Ethereum via its solver network. The Solving Pool on Ethereum then calls depositToRemote() on Circle's xReserve contract xReserve mints a corresponding USDCx Holding on Canton and delivers it directly to the user's Canton party.

USDCx is a CIP-56 compliant Canton-native token backed 1:1 by USDC locked in xReserve on Ethereum. Holdings and transfers are private by default not publicly visible to uninvolved Canton participants.

---

Path B: CC delivery

```
Solving Pool (Solana)
        ↓
CC Bridge (directly bridges CC to user's Canton party)
        ↓
CC Holding → User's Canton Party
```

For users requesting Canton Coin, encrypt.trade routes through a dedicated bridge provider that natively supports CC token delivery to Canton.

The Solving Pool on Solana initiates the bridge, which delivers CC directly to the user's Canton party. CC's Amulet package is pre-installed on all 600+ Canton validators — making it the universally receivable token regardless of which participant node the user operates on.

Technology stack:

- Predicate on-chain compliance at source chain entry (TRM Labs, Elliptic, Chainalysis)
- On-chain Privacy Pool (Rust)
- Bridge provider (Solana → Ethereum USDC cross-chain settlement) (External Integration)
- Dedicated CC bridge provider (direct CC delivery to Canton)

### 3. Architectural Alignment
Privacy infrastructure for bridges not another bridge

Encrypt.trade is not building a Solana-Canton bridge. Existing bridge providers solve the transport problem. Encrypt.trade solves the bridge privacy problem and does so in a way that is composable with Canton's full token ecosystem.

Today, any institution bridging into Canton exposes their on-chain identity in the process regardless of which transport layer they use. The source address, destination party, and amount are all observable. Encrypt.trade removes this exposure entirely. Our architecture sits on top of existing infrastructure Bridge provider for cross-chain transport, xReserve for USDCx minting, a dedicated CC bridge for CC delivery — and adds the privacy and compliance layer that none of these provide individually.

---

Compliance-first at the source chain the right model for Canton

Compliance enforcement in encrypt.trade happens at the earliest possible point: before any funds enter the system, before bridging is even initiated. If a source address is flagged by Predicate's multi-provider compliance screening, the bridge
request is rejected entirely. No funds move. No footprint is created.

This is the correct model for Canton's institutional base. A single contaminated source of funds entering a shared protocol can create regulatory exposure for every participant downstream. The enforcement at the source chain level ensures bad actors are excluded at the point of entry, protecting the integrity of every transfer processed through the protocol.

This approach also simplifies the Canton-side architecture: because compliance is fully resolved before assets approach Canton, no additional compliance infrastructure is required within Canton's internal operations. Assets land on Canton as standard CIP-56 Holdings with no encrypt.trade-specific contract layer required.

---

Two-token delivery covering the full Canton validator base

Canton's package vetting architecture means participant nodes must explicitly approve Daml packages for each token they wish to hold. Not all 600+ Canton validators have vetted every CIP-56 token. Encrypt.trade's delivery model accounts for this directly:

- USDCx: delivered via xReserve to nodes that have vetted the USDCx package, a growing set actively supported by the Canton Foundation
- CC: elivered via dedicated CC bridge, universally receivable since the Amulet package is pre-installed on all Canton validators at the protocol level

Together, USDCx and CC cover the full Canton validator base at launch. As Canton's token ecosystem matures and more nodes vet additional CIP-56 packages, encrypt.trade's delivery surface expands naturally in later milestones.

---

Fully permissionless USDCx path

The USDCx delivery path Bridge (which ever is supported) from Solana to Ethereum, followed by xReserve depositToRemote() — requires no partnership agreement, no third-party approval, and no solver integration beyond existing cross-chain infrastructure. Any address holding USDC on Ethereum can call depositToRemote(). This means encrypt.trade can launch the USDCx path without dependency on any external party's business development timeline.

---

Complementary to Canton's native privacy, not duplicative

Canton's configurable privacy governs activity within the network. Encrypt.trade addresses the orthogonal problem of cross-chain identity linkage at the entry point. Once assets land on Canton, they behave as standard CIP-56 Holdings governed entirely by Canton's native privacy model. The two systems compose together to deliver end-to-end privacy that neither achieves alone.

---

No new trust assumptions introduced on Canton

Encrypt.trade's privacy and compliance layers operate entirely at the bridge entry point on the source chain side. No encrypt.trade infrastructure is required within Canton's internal consensus, synchronisation, or smart contract execution. No changes to Canton's protocol are needed. Existing Canton applications and users are unaffected.


### 4. Backward Compatibility
No backward compatibility impact. encrypt.trade's privacy bridge operates as an external protocol layer on top of existing Canton bridge infrastructure. It introduces no changes to Canton's protocol, DAML contracts, consensus mechanism, or existing integrations. Existing Canton applications and users are unaffected.

---

## Milestones and Deliverables

Milestone 1: Integration Scoping and Technical Design (2 Weeks)

- Estimated Delivery: End of Week 2
- Focus: Confirm all external integrations, finalise architecture, obtain Canton Foundation sign-off before any code is written

Deliverables:

- Detailed technical architecture document covering the full two-leg system: source chain compliance check, Privacy Pool routing, External Bridge Solana-to-Ethereum transport, xReserve USDCx minting, and CC bridge delivery — published to this repository
- Predicate compliance policy design reviewed with Canton Foundation — source address screening logic, multi-provider severity thresholds (TRM Labs, Elliptic, Chainalysis), and operator configuration model
- Confirmation of Near Intents integration for Solana → Ethereum USDC routing — Solving Pool integration and solver network confirmation
- Identification and confirmation of CC bridge provider supporting direct CC delivery to Canton participant nodes
- Canton package vetting research: full mapping of which participant nodes have vetted USDCx, frxUSD, cbBTC — establishing routing logic and adoption baseline for all planned delivery tokens
- Bridge provider research for cbBTC and frxUSD delivery paths to Canton — confirming availability and integration requirements for Milestone 4

---

Milestone 2: Testnet Integration, USDCx and CC Private Bridge Live (2-3 Weeks)

- Estimated Delivery: End of Week 5
- Focus: Deliver a working private bridge on Canton Testnet with both USDCx and CC delivery paths live and compliance enforcement active at the source chain

Deliverables:

- Functional private bridge on Canton Testnet institutions can initiate Solana → Canton private transfers and receive USDCx or CC with no observable source/destination address linkage
- Predicate compliance enforcement active at source chain address screening via TRM Labs and Elliptic operational before ephemeral address generation, flagged addresses rejected before any on-chain activity
- Privacy Pool deployed on Solana testnet with fixed denomination enforcement and randomised time delay
- Bridge integration live on testnet — Solana USDC → Ethereum Sepolia USDC routing confirmed through Solving Pool
- xReserve depositToRemote() integration live on testnet — Ethereum Sepolia USDC → USDCx on Canton Devnet confirmed
- CC bridge integration live on testnet — direct CC delivery to Canton Devnet confirmed
- Canton package vetting check implemented — USDCx routed to vetted nodes, CC delivered universally as fallback
- End-to-end test suite covering: address unlinkability, timing correlation resistance, denomination bucketing, compliance rejection at source,
USDCx delivery accuracy, CC delivery accuracy, and node vetting fallback behaviour
- Integration with at least one Canton testnet application — target: Unhedged — confirming delivered USDCx and CC Holdings are immediately composable with a live Canton application

---

Milestone 3: Mainnet Launch, USDCx and CC Live (4-5 Weeks)

- Estimated Delivery: End of Week 10
- Focus: Ship USDCx and CC delivery to production, project audit, open-source the implementation, drive initial ecosystem adoption

Deliverables:

- Private bridge live on Canton Mainnet, publicly accessible at [https://encrypt.trade](https://encrypt.trade/) — supporting USDCx and CC delivery from Solana with source
chain compliance enforcement active
- Open-source reference implementation published: Privacy Pool adapter, Predicate source chain compliance integration, Near Intents Solana-to-Ethereum routing, xReserve depositToRemote() integration, CC bridge integration, and Canton CIP-56 Holding delivery
- Developer documentation covering: full two-leg architecture, Predicate compliance configuration guide, integration guide for Canton application developers, node vetting requirements for USDCx delivery
- Co-announcement published with Canton Foundation
- Validator node operational on Canton Mainnet

---

Milestone 4: Multi-Token Expansion — cbBTC, frxUSD, and Beyond (Optional)

- Estimated Delivery: End of Week 16
- Focus: Expand deliverable Canton tokens beyond USDCx and CC, covering the institutional demand for other tokens like cbBtc, fraxUsd etc

Deliverables:

- cbBTC, fraxUsd and other assets delivery live: By integration with temple or cantonswap for swapping of USDCx with these assets
- Node vetting outreach active coordination with major Canton validator operators (Copper, Dfns, Zodia, Galaxy Digital) to expand frxUSD, cbBTC etc tokens package vetting coverage ahead of launch
- Updated open-source documentation covering cbBTC, frxUSD.. assets delivery paths, bridge provider integrations, and extended vetting requirements
- Ethereum as second source chain, Ethereum mainnet added as a source chain alongside Solana, enabling institutions to bridge USDC and ETH-denominated assets from Ethereum directly through encrypt.trade's privacy layer
---

## Acceptance Criteria
The Tech & Ops Committee will evaluate completion based on:

Milestone 1: Integration Scoping and Technical Design

Milestone 1 is considered complete when:

- A technical architecture document has been published to the project repository
- At least one viable path has been confirmed for each core integration: Near Intents, Circle xReserve, and a CC bridge provider
- The Predicate compliance policy design has been shared with the Canton Foundation

---

Milestone 2: Testnet Integration, USDCx and CC Private Bridge Live

Milestone 2 is considered complete when:

- A user can successfully initiate a bridge on Canton Testnet and receive either USDCx or CC on their Canton Devnet party
- The Predicate compliance check is active and rejects at least one flagged test address before funds enter the system
- At least 10 successful private bridge transactions have been completed on testnet

---

Milestone 3: Mainnet Launch — USDCx and CC Live

Milestone 3 is considered complete when:

- The private bridge is live and accessible on Canton Mainnet
- At least one real mainnet bridge transfer has been completed successfully end-to-end
- The open-source reference implementation has been published to a public repository
- The encrypt.trade validator node is operational on Canton Mainnet

---

## Funding

**Total Funding Request: 572,000 CC (~$100,000 at reference price of $0.1748/CC)**

### Payment Breakdown by Milestone

**Milestone 1 — Integration Scoping & Technical Design: 85,900 CC (~$15,000)**

- Architecture design & documentation: $6,000
- Predicate compliance policy design & provider configuration: $5,000
- DAML integration scoping with DA technical team: $4,000

**Milestone 2 — Testnet Integration: 286,000 CC (~$35,000)**

- Core development: $15,000
- Predicate compliance integration (multi-provider: TRM Labs, Elliptic, Chainalysis): $10,000
- Testnet deployment, end-to-end test suite, and Unhedged integration: $10,000

**Milestone 3 — Mainnet Launch & Open Documentation: 200,100 CC (~$50,000)**

- Mainnet deployment, code audits, mitigation implementation: $30,000
- Developer documentation: integration guide, API reference, operator compliance setup: $10,000
- Co-marketing coordination and ecosystem outreach: $10,000

### Volatility Stipulation
Project duration is under 6 months (estimated 8–10 weeks). Should the project timeline extend beyond 6 months due to Committee-requested scope changes or bridge availability delays, any remaining milestones will be renegotiated to account for significant USD/CC price volatility.

---

## Co-Marketing
Upon release, encrypt.trade will collaborate with the Canton Foundation on:

- **Launch announcement coordination** — joint announcement across Canton Foundation and encrypt.trade channels on Mainnet launch day
- **Technical blog post** — co-authored article covering the privacy bridge architecture, institutional use case, and integration guide for Canton ecosystem developers
- **Ecosystem promotion** — active outreach to Solana and EVM institutional participants to drive bridge usage and liquidity to Canton
- **App integration feature** — working with Unhedged to feature the private bridge natively within their product flow, as a concrete demonstration of the institutional use case

---

## Motivation
Canton's institutional value proposition is undermined at the bridge layer. Institutions considering Canton as a settlement or DeFi infrastructure layer face a fundamental problem today: the act of moving assets onto Canton is publicly visible, permanently linking their Solana or EVM identity to their Canton identity.

For institutions that require strict separation of on-chain identities across networks, whether for regulatory, competitive, or operational reasons, this is a blocker, not a minor inconvenience.

The impact is concrete. The institutions most active on Canton today, Broadridge running $350B+ in daily repo settlements, Goldman Sachs DAP settling tokenized securities, DTCC tokenizing U.S. Treasuries, JPMorgan issuing JPM Coin natively on Canton, all have one thing in common: they cannot afford to have their cross-chain movements publicly traceable. A fund moving collateral from Solana into a Canton repo application does not want that transfer visible on-chain. A treasury desk bridging assets into Canton Swap does not want to signal its position to the market before the trade is complete. These institutions are willing to use Canton. They are not willing to be exposed in the process.

The cross-chain linkage problem is one that Canton's internal privacy model was not designed to solve, and it remains unsolved today. Even as bridge infrastructure matures, the identity linkage problem persists, it requires a dedicated privacy layer, not a better bridge. Funding both together delivers what institutions actually need: the ability to move assets into Canton without exposing who they are or where they came from.

encrypt.trade solves this. We have been building in the privacy space long enough to know what production-grade systems actually require, not just the cryptography, but the UX, the compliance layer, the edge cases, and the operational discipline to keep it running at scale. In February 2026, we shipped encrypt.trade v2, a significant UX overhaul that makes private bridging accessible to institutional users without requiring them to understand the underlying mechanics. Private bridging that only works if you're a developer is not a real product. v2 closes that gap.

The architecture itself has already been proven in production. We were the first team to enable private bridging to ZCash from Solana in 2025, processing $15M+ in volume. That track record matters, it means the Canton integration is not a research project, it is an extension of a system we have already built, shipped, and scaled. Bringing this to Canton removes a direct blocker to institutional adoption, expands Canton's addressable market, and ensures that the privacy Canton offers internally is accessible from the moment an institution first enters the network.

---

## Rationale

**Why a privacy wrapper on top of the bridge, rather than modifying the bridge itself?**

Modifying any underlying bridge would require coordination with external teams and introduce delays and dependencies outside our control. A privacy wrapper is composable, deployable independently, and reusable across multiple bridge providers — which is exactly the kind of shared infrastructure the Canton Development Fund is designed to support. It also means the Canton ecosystem benefits from this privacy layer regardless of which bridge ultimately wins adoption.

**Why Predicate for compliance?**

Predicate provides programmable, on-chain policy enforcement that is already designed for the institutional DeFi context. Rather than building a bespoke compliance layer, integrating Predicate gives institutions configurable access control rules they can audit and customize, aligned with Canton's own compliance-first positioning.

## Team

**Rishabh Gupta — CEO & Co-Founder**

- Goldman Sachs and Amazon (AI and finance)
- MS, IIT Kharagpur (Computer Science)
- Cryptography: MPC, SNARKs, STARKs, polynomial commitment schemes, folding-based proof systems
- Designed production-ready ZK systems for distributed environments, including Account Abstraction SDKs in live B2B deployments
- Institutional background: understands the compliance and operational standards that institutional infrastructure must meet

**Nitanshu Lokhande — CTO & Co-Founder**

- Software Engineer, MathWorks
- B.Tech, IIIT Vadodara (Computer Science)
- ZK rollups (Avail), client-side proving systems (Polygon Miden)
- Schnorr stateless signature aggregation, ElGamal encryption, elliptic curve cryptography in production
- Multi-agent constructions for scalable on-chain systems

**Track record:**

- First team to enable private bridging to ZCash from Solana (2025)
- encrypt.trade v2 shipped February 2026 — institutional-grade UX for private bridging
- Backed by Alliance
- Live product: https://encrypt.trade
- Live integrations: Jupiter Exchange (Solana), Near Intents (cross-chain)
- Compliance infrastructure: Predicate (on-chain policy enforcement)

---

## References

- encrypt.trade: https://encrypt.trade
- Canton Foundation champion: Parth Chaturvedi (parth@canton.foundation)
- Digital Asset contacts: James Webb (james.webb@digitalasset.com), Bayo Akins (bayo.akins@digitalasset.com)
- Predicate (compliance partner): https://predicate.io
- Canton Development Fund repo: https://github.com/canton-foundation/canton-dev-fund
- CIP-0082: https://github.com/canton-foundation/cips/blob/main/cip-0082/cip-0082.md
- CIP-0100: https://github.com/canton-foundation/cips/blob/main/cip-0100/cip-0100.md