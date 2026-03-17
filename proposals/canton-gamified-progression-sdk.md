## Development Fund Proposal

**Author:** Tap Ants Core Development Team  
**Champion / Reference:** Vinh Nguyen (CTO, Five North)  
**Status:** Submitted  
**Created:** 2026-03-04

---

## Abstract
We are proposing the development of the "Canton Gamified Progression SDK" (extensible as a Universal Credentialing Bridge)—an open-source reference implementation that allows any Web2 platform to securely log user progression and verifiable credentials on the Canton Network *before* the user creates a crypto wallet. This architecture bridges the gap between off-chain Web2 databases and Canton's on-chain state, enabling frictionless onboarding, batched syncing, and high-volume transaction generation for the Canton ecosystem.

---

## Specification

### 1. Objective
A massive friction point in Web3 adoption is forcing users to create a wallet and secure seed phrases before they can interact with an application. The objective of this SDK is to delay the wallet creation hurdle until *after* the user has accrued value (e.g., game levels, missions, or KYC compliance). 

This project provides the Canton developer community with a plug-and-play architecture to record "ownerless" user achievements on-chain. When the user is ready, they can seamlessly claim their on-chain history using a Canton wallet, transforming an institutional record into a fully self-sovereign, co-signed credential.

### 2. Implementation Mechanics
The solution utilizes a hybrid architecture bridging off-chain Web2 databases with Canton's on-chain state, consisting of two core components:

**Component A: The Open-Source Daml Models (Propose-Accept Pattern)**
1. **`GameProgress`**: An "ownerless" initial record, signed only by the Admin (Game Studio). It maps a Web2 `userId` to their `level` and `missionsCompleted`, utilizing a `batchId` to track updates before the user has a wallet.
2. **`ClaimCoupon`**: A secure right issued by the Admin, authorizing a newly generated Canton Wallet to accept the profile.
3. **`PlayerProfile`**: The foundational identity co-signed by the Admin and the user, linking the Web2 ID to their Canton identity.
4. **`ClaimedGameProgress`**: The final sovereign state. The Admin periodically exercises `UpdateProgress` to sync data, while the player maintains cryptographically-signed authority.

**Component B: The Node.js Integration SDK & Frontend**
We will build a middleware SDK utilizing the Direct Canton Ledger API (gRPC/JSON) to handle:
* **The Batcher:** A worker polling Web2 databases and aggregating events (e.g., `{ userId: "player_123", level: 5, missionsCompleted: ["intro", "boss"] }`).
* **The Submitter:** Authenticates via OAuth2 and submits batches to a Canton Validator in a single, stateless transaction.
* **The Demonstrator UI:** A drop-in frontend component allowing users to visually "Claim" their Web2 history.

### 3. Architectural Alignment
This work directly aligns with Canton's privacy and authorization architecture. It leverages Daml's exact signatory requirements to facilitate a secure Propose-Accept pattern for data ownership transfer. 
*No backward compatibility impact.* This is a net-new reference implementation and SDK designed to run in parallel with existing Canton infrastructure.

---

## Milestones and Deliverables

### Milestone 1: Daml Core & Security Hardening
- **Estimated Delivery:** 3 Weeks  
- **Focus:** Smart Contract Architecture & Security.  
- **Deliverables / Value Metrics:** Finalized logic for `GameProgress`, `ClaimCoupon`, and `PlayerProfile` models. Collaborative code review with the Tech & Ops Committee and Node.js penetration testing.

### Milestone 2: Integration SDK & Middleware
- **Estimated Delivery:** 4 Weeks  
- **Focus:** Backend routing and Ledger API wrappers.  
- **Deliverables / Value Metrics:** Delivery of the Node.js batching worker, Direct Ledger API wrappers, and automated verification of `batchId` handling.

### Milestone 3: Frontend Demonstrator & Open-Source Tooling
- **Estimated Delivery:** 3 Weeks  
- **Focus:** Developer experience and UI.  
- **Deliverables / Value Metrics:** Working drop-in "Claim UI" component, comprehensive GitHub repo, developer runbooks, API schema docs, and CI/CD pipelines.

### Milestone 4: Universal Extensibility Framework
- **Estimated Delivery:** 3 Weeks  
- **Focus:** Broadening the SDK for enterprise utility.  
- **Deliverables / Value Metrics:** Abstracting the `GameProgress` Daml templates into a generic `GenericCredential` / W3C standard framework, supporting arbitrary payload proofs (e.g., KYC, Diplomas) utilizing the same SDK pipeline.

### Milestone 5: Live Reference Deployment
- **Estimated Delivery:** 2 Weeks  
- **Focus:** Mainnet Validation.  
- **Deliverables / Value Metrics:** Full integration into Tap Ants (Convex DB to Five North Validator) serving as the live Mainnet case study, bringing 50,000 Web2 users and generating real progression traffic on the Canton network.

---

## Acceptance Criteria
The Tech & Ops Committee will evaluate completion based on:
- Deliverables completed as specified for each milestone.
- Demonstrated functionality of the Propose-Accept workflow on Canton DevNet/TestNet.
- Delivery of comprehensive open-source documentation and GitHub repositories.
- Successful batch submission of progression data via the Node.js SDK.

---

## Funding

**Total Funding Request:** 742,000 CC

### Payment Breakdown by Milestone
- **Milestone 1 (Daml Core & Security Hardening):** 161,304 CC upon committee acceptance
- **Milestone 2 (Integration SDK & Middleware):** 193,565 CC upon committee acceptance
- **Milestone 3 (Frontend Demonstrator & Open-Source Tooling):** 161,304 CC upon committee acceptance
- **Milestone 4 (Universal Extensibility Framework):** 129,044 CC upon committee acceptance
- **Milestone 5 (Live Reference Deployment):** 96,783 CC upon final release and acceptance

### Volatility Stipulation
The projected timeline for this project is under 6 months. Should the project timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility.

---

## Co-Marketing
Upon release, Tap Ants will collaborate with the Foundation on:
- A joint announcement highlighting the bridge between Web2 gaming and Canton Web3 infrastructure.
- A technical case study detailing how Tap Ants acted as "Client Zero" to seamlessly port 50,000 active users on-chain.
- Developer ecosystem promotion to encourage other game studios and enterprise platforms to adopt the SDK.

---

## Motivation
This SDK fills a massive gap in Web2-to-Web3 onboarding. By allowing applications to issue "ownerless" records off-chain and port them on-chain post-wallet creation, we drastically lower the barrier to entry for retail adoption. Because the SDK is "white-label" and headless, enterprise partners can maintain total brand control while routing high-volume verification traffic directly to the Canton Network. 

## Rationale
Unlike EVM-based chains where "airdropping" data to non-existent wallets is clunky and public, Daml's strict signatory requirements allow for the safe, private transition of data ownership from an Institution to an Individual. We chose to build a custom middleware SDK using the Direct Canton Ledger API (rather than the standard Loop SDK) because it is the only way to support custom contract logic while executing the high-volume stateless batching required to maximize CIP-0047 utility generation without bloating the active contract set.
