## Development Fund Proposal

**Author:** Digital Asset - Joel Lovera
**Status:** Draft
**Created:** 2026-07-13
**Label:** wallets
**Champion:** Digital Asset

---

# Proposal: Enabling User-Paid Traffic Accounting on Canton Network

# Objective and scope

Today, Canton traffic is paid exclusively by the submitting validator. While this works when the validator is serving one operator, it becomes a significant bottleneck when the validator is a wallet that serves many users, parties, applications, or customers. In that setup, the validator itself lacks the native primitives to attribute traffic costs or enforce per-user limits. While wallets can attempt to mitigate this by placing a custom application layer between the user and the validator, doing so forces a trade-off that compromises ecosystem composability and creates an inherently fragmented operational environment

Currently, some wallets try to work around this by batching two separate transaction legs, one for the core transaction or application interaction, and another to pull the traffic fee. This usually increases transaction costs for the user and forces a duplicated transaction experience into the wallet UI, making the flow confusing and harder to understand. Furthermore, these custom batching methods are unreliable and frequently break down or introduce friction when trying to interoperate with dApps.

This challenge increases as wallets begin operating across multiple synchronizers. Each synchronizer can have its own traffic accounting model and its own traffic token. A wallet should not be forced to expose all of this multi-token, multi-balance complexity to the user. The user experience should stay simple, enough balance, not enough balance, sponsored transaction, or billed later.

The objective of this proposal is to deliver the necessary participant node primitives, including APIs, hooks, and extension points, for traffic accounting and enforcement. These primitives will allow wallets and other providers to build local accounting models where the wallet manages the user-facing relationship while the validator handles actual traffic payment at the synchronizer level. Additionally, this grant will fund a well-documented open-source reference implementation of a Traffic Enforcement App (TEA) to provide a practical starting point for wallets.

While the network's long-term roadmap includes decentralized traffic accounts at the synchronizer level (where external parties directly own, fund, and maintain separate accounts on-chain to remove strict validator-operator coupling), synchronizer-level accounts are explicitly out of scope for this grant. This proposal decouples the traffic account from the participant node to enable more flexible local setups, such as shared accounts or multiple accounts per validator. By focusing strictly on these local validator-level accounting primitives, the project accelerates immediate wallet capabilities, while synchronizer-level traffic account upgrades will be proposed separately.

# Technical Approach

To allow wallets to manage user traffic without forcing a single rigid charging pattern on the ecosystem, this proposal delivers a local accounting model. The wallet determines how to attribute, price, and recover costs, and its internal debit does not need to be identical to the synchronizer-level traffic cost. This allows the wallet to apply its own pricing policies, fiat payment rails (e.g., Stripe or PayPal), subsidies, billing methods or conversion rates.

The Traffic Enforcement App (TEA) is the component responsible for executing the traffic accounting and enforcement rules for the participant node. By isolating this operational logic, the system allows node operators to supply a pluggable TEA configured to their specific tracking, pricing, or billing policies.

Based on feedback from early wallet providers, the technical architecture implements a built-in version of the TEA within the validator node that works out of the box. The integration between the TEA and the PN is kept at a modular gRPC API boundary (Ledger API and TEA gRPC API). This protects node performance and ensures that a wallet provider wanting to build an independent, external TEA service down the road can seamlessly do so using the exact same API specifications.

To ensure that what we build completely satisfies real-world wallet operations, development will not happen in an engineering silo. We are establishing a tight feedback loop by engaging four wallet providers (Cantor 8, Console, Loop and Send) directly during the active development phase to review, test, and implement these capabilities in parallel. Providing this hands-on support guarantees the final deliverables are hardened against actual ecosystem requirements from day one.

# Architectural Alignment

This proposal aligns with Canton's core architectural principle of isolating transaction execution states from application-specific operational logic. The local account identifier is handled purely as non-breaking metadata passed along with command submissions, ensuring trackability through transaction completions without altering the core transaction hashing mechanics. By handling multiple synchronizer complexities via an external app that maps balances, this design allows a wallet to manage traffic accounting consistently across its entire multi-node infrastructure without requiring custom consensus alterations.

This design is backward compatible and optional to enable, allowing existing validators and wallet integrations to continue operating unchanged unless an operator explicitly adopts the new traffic accounting primitives.

# Milestones and Deliverables

### **Milestone 1: Local Accounting Node Primitives & Core Framework**

#### **Estimated Delivery:** End August 2026

#### **Deliverables**

* **TEA API Definition:** A completed gRPC API specification for the TrafficService implemented natively within the participant node, explicitly outlining the interface surface for three foundational methods exposed via the Ledger API: GetAccount, UpdateAccount, and ListAccounts.  
* **“Prepare” Phase Implementation:** Modifications to the participant node (PN) to call the TEA during the transaction preparation phase to fetch available local accounts and their eligible synchronizers. For this initial phase, the account setup is strictly constrained 1:1 with the submitting actAs party of the transaction. The PN will filter out ineligible synchronizers based solely on whether the account traffic balance is greater than zero, without performing a full transaction cost estimation. The chosen account is returned in the prepare response and is explicitly excluded from the transaction hash. If no accounts are eligible or the TEA is unreachable, the request is immediately rejected.  
* **“Execute” Phase Implementation:** Upgrades to the transaction submission pipeline allowing users to submit transactions with their chosen account ID (structurally tied to their party ID). The PN will run a mandatory gateway check to verify the user's account balance before submitting the transaction to the sequencer. Submissions will be rejected if the account does not have enough traffic at evaluation time. Traffic is not reserved dynamically in this phase, meaning concurrent submissions may cause the balance to temporarily drop into the negative. Upon execution, the account ID is passed through internal protocol layers to surface natively within completion events.  
* **Documentation:** Comprehensive technical documentation detailing the gRPC APIs and node hook properties, providing the necessary context for any wallet provider to implement a custom TEA.  
* **Testing Framework:** A lightweight, non-persistent test implementation of the TEA to accompany the automated integration test suite. The communication loops and network interaction profiles between this mock TEA and the participant node will remain identical to a production setup to guarantee behavioral parity.  
* **Ledger API Endpoint for GetAccounts:** Native integration of the authenticated TrafficService on the Ledger API, enabling connected client applications to query local account balances through existing channels. Accounts are created lazily on the first encountered debit or via administrative pre-funding using UpdateAccount.

#### **Acceptance Criteria**

* The TrafficService gRPC specification is finalized and published.  
* The participant node successfully intercepts preparation calls, rejects them if an account has zero or insufficient traffic, and excludes the account string from the transaction hash.  
* Synchronizers are filtered accurately during transaction preparation based on a positive traffic balance check.  
* The submission engine successfully blocks transaction execution during the execution phase if an account lacks sufficient traffic, while allowing concurrent submissions to temporarily drop the balance negative due to the absence of active reservations.  
* The submitted account ID string successfully flows through transaction lifecycle states and outputs visibly on the Ledger API completion stream.  
* The Ledger API proxy successfully serves authenticated account data to authorized clients.

### **Milestone 2: Reference Traffic Enforcement App Implementation**

#### **Estimated Delivery:** End October 2026

#### **Deliverables**

* **Decoupled User-Defined Account IDs:** Expansion of the metadata schema to support custom, user-defined account text strings that are completely decoupled from a specific party ID requirement.  
* **On-Ledger Traffic Purchase Flow & Daml Reference Models:** Implementation of on-ledger traffic purchase capabilities via a set of singleton Daml templates (PurchaseTraffic, PaymasterSignal, and EligiblePaymentAssetConversionRate). This includes integrating the Top-Up purchase DAR templates and dApp UI to automate asset transfers to a designated non-lockable purchase-traffic account, allowing the TEA to asynchronously credit accounts from the ledger stream.  
* **TEA API:** Add ListAccounts method exposed via the Ledger API.

#### **Acceptance Criteria**

* The on-ledger purchase workflow successfully processes token transfers through the dApp UI, allows users with 0 balance to transact via the purchase account without self-lockout risk, and updates the TEA bookkeeping state asynchronously.

### **Milestone 3: Reservations and minimal Multi-synchronizer building blocks**

#### **Estimated Delivery:** End December 2026

#### **Deliverables**

* **Reservations:**  
  * Implement a mechanism to reserve traffic in the TEA prior to the submission being made to the synchronizer. This mechanism will prevent an account from consuming more traffic than available even with concurrent submissions.  
* **Account permissioning:**   
  * Implement a permissioning mechanism to restrict account usage per synchronizer and an interface for participant operators to set / view those permissions.

#### **Acceptance Criteria**

* The TEA must atomically reserve traffic before submitting to the synchronizer, ensuring concurrent submissions cannot consume more traffic than the account has available.  
* Participant operators can restrict the synchronizers on which accounts can be used to submit transactions

### **Milestone 4: Ecosystem Guidance and Adoption**

#### **Estimated Delivery:** End December 2026

#### **Deliverables**

* **Parallel Co-Development & Hands-On Support:** Continuous engagement with four specific wallet providers throughout the lifecycle of Milestone 1 and Milestone 2. This includes driving a tight feedback loop where these partners review, test, and actively implement the primitives alongside our core development team, backed by hands-on technical and engineering support from Digital Asset.  
* **Ongoing Traffic Management Implementation Support:** Provision of continuous, hands-on technical guidance to wallet teams during and beyond the initial rollout, assisting them closely as they implement, configure, and optimize their specific traffic management policies and charging models.  
* **Ecosystem Integration Support:** Broad technical alignment and documentation support for remaining network wallet providers to seamlessly integrate the finalized accounting capabilities.

#### **Acceptance Criteria**

* At least 3 of the top 10 wallets by volume in Q2 on the Canton Network successfully adopt and integrate this new traffic accounting capability into their production or live staging environments.  
* Continuous support channels or regular technical touchpoints are active, verified by ongoing engineering assistance provided to partner wallets for their traffic management implementations.

# Funding

Total Funding Request: 2,372,500 CC

## Payment Breakdown by Milestone

* M1: 695'500 CC  
* M2: 695'500 CC  
* M3: 481'500 CC  
* M4: 500,000 CC

**Volatility Stipulation:** As this project is expected to be completed within 6 months, the grant is denominated in fixed Canton Coin, and the proposer assumes price volatility risk.

**Maintenance:** This proposal requests funding strictly for the activity required to execute the development of the work defined in the milestones. It does not request funding for ongoing operational maintenance. Upon the successful completion of milestones, the day-to-day maintenance will seamlessly roll into the purview of the active 2026-Maintenance Grant for Wallet Kernel Open Source.

**Scope Flexibility:** Requirements may adapt dynamically based on partner wallet feedback to ensure maximum real-world utility. The Foundation will be notified of any functional shifts, if the total engineering effort remains unchanged, no grant extensions or additional funding requests will be made

**Timeline Risk Management:** Milestones not delivered within \<60 days of the estimated delivery date are subject to review and renegotiation by the tech & ops committee.

## Co-Marketing

We request Foundation support for ecosystem communication and adoption once the deliverables are ready.

This includes support for announcing the availability of the solution, sharing the corresponding documentation and reference materials, and helping drive visibility with wallet providers and other relevant ecosystem participants.

The goal of co-marketing is not promotional activity for a single team or product. It is to accelerate awareness and adoption of a reusable protocol-level solution for user-paid traffic on Canton.  