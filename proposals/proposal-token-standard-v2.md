## Development Fund Proposal

**Author:**  Digital Asset
**Status:** Submitted  
**Created:** 2026-03-17  

---

### **Abstract**

This proposal requests a grant to fund the specification, core implementation, and ecosystem rollout of a V2 Token Standard (CIP-0056 upgrade). TradFi players have provided multiple requests for improvements to the current standard regarding the achievable privacy, and its compatibility with the timing parameters and multi-tier accounting common in traditional settlement systems. This grant delivers an upgraded standard enabling privacy-enhanced batch settlement, minimized locked holdings, high-performance execution, TradFi-aligned timing controls, and account information on holdings. The project culminates in adoption by tier-1 institutional infrastructure, establishing a neutral, high-performance reference architecture for Real World Asset (RWA) settlement on the Canton Network.

### **Motivation & Rationale**

This upgrade delivers specific, high-leverage protocol enhancements that make the CIP-0056 token standard more compatible with settlement practices in traditional finance:

1. **Enhanced Privacy:** Cryptographically restricts leg-visibility during batch settlements strictly to relevant counterparties.  
2. **Enhanced UX:** Trading and settlement flows that can execute with on-chain user actions by trading parties.  
3. **Capital Efficiency:** Minimizes locked holdings during complex allocations.  
4. **Support for Account structures and controls:** Optionally allows token-standard compatible assets to encode holdings managed through accounts that are wholly or partially controlled by account providers \- for example to model traditional custody.  
5. **Throughput Optimization:** Consolidates settlement into minimal numbers of views, reducing latency for batch processing.  
6. **Timing Parity:** Introduces settlement timing parameters that natively map to legacy settlement systems.

By implementing the improved interfaces on key network assets (e.g., USDCx) and integrating them into the Splice core and Canton Coin, the Foundation funds a public good: a token standard that works for crypto and TradFi alike and can further drive their on-chain convergence. The above improvements are detailed below.

### **Specification & Backwards Compatibility**

#### Implementation Mechanics

We propose to evolve the Canton Network token standard defined in CIP-0056 by adding new major versions of the token standard’s API packages:

* splice-api-token-allocation-instruction-v2  
* splice-api-token-allocation-request-v2  
* splice-api-token-allocation-allocation-v2  
* splice-api-token-holding-v2  
* Splice-api-token-transfer-instruction-v2

These new packages will provide new capabilities as described below.  
These new packages will have a high degree of cross-version compatibility with the V1 standards as described below.  
Canton Coin and other key assets like USDCx will implement both V1 and V2 standards.

#### Architectural Alignment

This is an iteration on CIP-0056 that allows assets to further draw on Canton’s unique privacy capabilities, allows more assets and types of settlements to participate in the token standard ecosystem, and allows token standard settlement to be done in a more performance optimized way. Overall it improves architectural alignment of Canton and the token standard compared to CIP-0056.

#### Privacy Enhanced Batch Settlement

In traditional multi-tier accounting, the transfer of an asset involves the debiting and crediting of potentially multiple intermediary accounts between sender and receiver. Neither the sender nor the receiver see the intermediate steps, but only the debits/credits to their accounts. The only entities with full visibility into a settlement are the settlement systems/processors which in the Canton token standard correspond to the executor party. Other key parties like custodians or asset registries, corresponding to the admin party on CIP-0056 tokens, have visibility across the assets managed by them.

Mirroring the above privacy model allows for privacy preserving settlements that CIP-0056 does not currently support. For example, let’s imagine this scenario in the context of a trading and settlement system (TSS) that acts as executor:

* Alice sold 1.0X for $10 to Bob. Alice needs to send the TSS $0.1 fee.  
* Bob sold 1.0X for $11 to Carol. Bob needs to send the TSS $0.11 fee.  
* Carol sold 1.0X back to Alice for $12. Carol needs to send the TSS $0.12 fee.

There are a total of nine legs here:

* Three legs of 1.0X between the traders  
* Three legs of $ between the traders  
* Three legs of $ for the TSS fees.

The visibilities should be exactly this:

* **Traders** each see…   
  * … the two X transfer legs for the incoming and outgoing transfers.  
  * … the two $ transfer legs incoming and outgoing payments to other traders.  
  * … the one outgoing fee leg to TSS.  
* **X admin** sees the three X legs.  
* **$ admin** sees the six $ legs.  
* **TSS** sees all nine legs.

Furthermore, in such a settlement, no X should have to move at all, and the only party that should need to deliver any assets at all is Alice for her $2.1 loss.

Other examples of privacy preserving batch settlement with mult-tier account chains could be found in a number of industry initiatives like the US RSN project, or in general by Daml Finance’s batch settlement code.

The token standard V2 proposed here makes the above possible via the standard whereas it is not with the CIP-0056 token standard V1.

#### Improved User Flows with Trusted Venues

Assets like Canton Coin require sender and receiver authorization to move. Consequently, for any trade, the traders need to at some point to sign a transaction that authorizes the settlement of that trade. In the CIP-0056 example DvP, this is done twice: First through a propose-accept flow where a buyer and seller agree to trade on-chain, and then a second time to create the allocations. 

Settlement venues like the TSS in the above example may not actually do execution on-chain like the CIP-0056 example. For such venues, it would be ideal if the creation of the allocation could be taken as the authorization of the trade so that traders only have to take that singular action. The flow should be:

1. The TSS writes the executed trade to the chain, authorized only by the TSS.  
2. Alice, Bob, and Carol see the request to allocate and authorize the trade in their wallets and accept in a single action.  
3. The TSS can now do the privacy preserving settlement shown above.

The V2 token standard proposed here makes this simple flow possible by creating AllocationRequests in 1., Allocations in 2., and then settling them in 3\. With CIP-0103 dApp connectivity, it’s also possible for the TSS to skip Step 1 by making a signing request to the wallets as part of Step 2\.  
In the token standard V1 this flow is not possible. Step 1 can create the needed AllocationRequests, and Step 2 can create the needed Allocations. But there is no way to assemble the authority of the allocations to execute them. So trading venues that execute off-chain have to get additional signatures from the traders to actually settle.

#### 

#### Accountable Holdings

In traditional finance, holdings are held or custodied in Accounts with custodians and account keepers playing a key role in enforcing compliance on assets and/or controlling the held assets based on requests and instructions from the beneficial owners. As discussed above, settlement may involve debits and credits on multiple accounts in multi-tier account chains. The current token standard offers ways to capture some of this in metadata, but cannot adequately capture the implications to authorization rules that are implied by assets held on managed accounts.

Case in point, CIP-0056 Allocations which are core to the settlement flows relevant to 4.1.2 are an authorization mechanism. An Allocation is supposed to represent an *authorization* from all needed stakeholders for the executor(s) to settle, and if triggered, settlement should be near-guaranteed to go through. For assets that employ traditional accounting structures, the authority of account managers or custodians become key in preparing and settling Allocations. 

The token standard V2 proposed here systematically replaces the beneficial owner as represented by a Party with an Account structure to capture the information in a standardized way and allow wallets and settlement venues to make use of the information. It also adds flexible authorization to all the interfaces allowing different tokens to encode different authorization rules for holdings held in a traditional account.

### 

#### Improvements to Timing Parameters

In line with practices in traditional financial markets, the time-related fields within SettlementInfo are changed to allow more flexibility. The previously mandatory inclusion of settleBefore and allocateBefore deadlines is too restrictive for workflows where settlement is not driven by time but by external business events or bilateral agreements.

### 

#### Guidance for compatibility and Performance

The V2 token standard, unlike V2, makes clear recommendations to apps, wallets, and assets on how to create, handle, and settle allocations. If followed correctly, a very good tradeoff between universal compatibility and performance is achieved.  
Optional extra fields like choice observers and extra authorizers are added in some places to allow for additional performance and process optimization in cases where apps and wallets have specific information about the mechanics of an asset.

#### Backwards Compatibility

1. The V2 standard will specify rules for apps, assets, and wallets which maximize compatibility.   
2. Incompatible cases are avoided as far as possible by making them detectable by apps. Mechanisms will be in place to prevent apps from starting workflows that cannot succeed.  
3. Where implementations need to support V1 and V2 interfaces, it is made easy through standard-supplied upcast and downcast functions as well as standard implementations of the V1/V2 choices based on the other version.

The compatibility matrix *expected* to be achievable is shown below.

For transfers:

| Sender Wallet | Receiver Wallet | Asset | Compatible | Comments on Flow/Limitations |
| :---- | :---- | :---- | :---- | :---- |
| V1 | V1 | V1 | YES |  |
| V1 | V1 | V2 | YES |  |
| V1 | V2 | V1 | YES |  |
| V1 | V2 | V2 | LIMITED | Sender cannot cleanly specify receiver account info. |
| V2 | V1 | V1 | YES |  |
| V2 | V1 | V2 | YES | V1 wallets can be addressed through the V2 accountable holdings interfaces. |
| V2 | V2 | V1 | YES |  |
| V2 | V2 | V2 | YES |  |

This gives *almost* full cross-version compatibility for transfers.

The equivalent is shown for allocations below. “Settlement” refers to whether the settlement involves the advanced control and privacy features introduced by V2.

| App | Settlement | Wallet | Asset | Compatible | Comments on Flow/Limitations |
| :---- | :---- | :---- | :---- | :---- | :---- |
| V1 | V2 | V1 | V1 | N/A | A V1 app never triggers V2 settlement features. |
| V1  | V1  | V1 | V1 | YES |  |
| V1  | V1  | V1 | V2 | YES |  |
| V1  | V1  | V2 | V1 | YES |  |
| V1  | V1  | V2 | V2 | LIMITED | The same limitation applies as for a transfer from a V1 to a V2 wallet on a V2 asset. The app has no notion of accounts. |
| V2  | V1 | V1 | V1 | YES |  |
| V2  | V1  | V1 | V2 | YES |  |
| V2  | V1  | V2 | V1 | YES |  |
| V2  | V1  | V2 | V2 | YES |  |
| V2  | V2 | V1 | V1 | NO | V2 settlement on V1 Asset is not possible. Apps will have a mechanism to avoid initiating this case. |
| V2  | V2 | V1 | V2 | LIMITED | Flow via AllocationRequest is not possible. A workaround via dApp API is likely possible. |
| V2  | V2 | V2 | V1 | NO | V2 settlement on V1 Asset is not possible. Apps will have a mechanism to avoid initiating this case. |
| V2  | V2 | V2 | V2 | YES |  |

---

### **Milestones and Deliverables**

| Milestone / Target Date | Focus & Deliverables | Acceptance Criteria (SLOs) |
| :---- | :---- | :---- |
| **M1: March 2026** | **Specification Definition** Drafting the V2 Token Standard CIP. | PR merged into canton-foundation/cips. Draft explicitly covers enhanced privacy logic, timing parameters, SettleBatch APIs, Accountable Holdings, and guidance for apps, assets, and wallets. |
| **M2: April 2026** | **TokenStdDevNet Validation** Deployment of a V2 token standard development network. | Dedicated TokenStdDevNet live with Draft implementations of the token standard and Canton Coin. At least one institutional app provider, asset provider, and wallet onboarded (meaning nodes connected) into TokenStdDevNet for integration testing. A dedicated network is used to allow resetting the network in case the new token standard APIs need to be mutated. |
| **M3: April 2026** | **Privacy Reference Architecture** Delivery of a Daml-only reference example of a privacy-preserving V2 token. | Verifiable execution of batch settlement demonstrating one view for executors and isolated views per trader, restricting data access to owned legs. |
| **M4: May 2026** | **Performance-Optimized Core Implementation** Production ready native implementation of V2 on Canton Coin. | Integration tests demonstrating settlement execution utilizing a single view (Canton Coin) or one executor view plus one view per trader (Private settlement example). Integration tests demonstrating cross-version compatibility between V1 and V2 token standards. |
| **M5: May 2026** | **Standard Ratification** Securing governance approval for the CIP. | CIP marked "Approved" by the Canton Foundation. Note that the intent is to secure this approval much sooner than June, but that timing is not fully under the control of Digital Asset so this milestone is deliberately set late.  |
| **M6: June 2026** | **Splice Core Integration** Engineering integration of the V2 standard into the Splice June release. | 1\. V2 standard logic successfully merged into hyperledger-labs/splice main branch. 2\. Demonstrated transfer and allocation on MainNet. |
| **M7: July 2026** | **V2 support on network-critical tokens managed by DA tooling** Upgrading major network assets to V2. | Successful deployment of the V2 standard on DA-managed tokenization tooling underlying system-critical tokens (e.g., USDCx). |
| **M8: August 2026** | **Ecosystem Adoption & Network Effect** Driving verifiable adoption of the standard by critical third-party infrastructure. | Verifiable mainnet/testnet integration by: 1 TradFi settlement venue, 1 independent RWA issuer, and 1 institutional wallet provider utilizing the V2 API suite. |

---

### **Funding & Financial Matters**

**Total Funding Request:** 12,000,000 CC

**Payment Breakdown by Milestone:**

* **M1:** 1,200,000 CC  
* **M2:** 1,200,000 CC  
* **M3:** 1,200,000 CC  
* **M4:** 1,200,000 CC  
* **M5:** 1,200,000 CC  
* **M6:** 1,200,000 CC  
* **M7:** 1,200,000 CC  
* **M8:** 3,600,000 CC 

**Financial Protocols on Acceleration/Delay:**

* **Acceleration Bonus:** A \+20% bonus (2,400,000 CC) will be applied to the M8 payout if the institutional adoption targets are fully verified on Mainnet prior to July 31, 2026\.  
* **SLA Penalties:** \* **M5 Ratification Penalty:** If governance approval (M5) is delayed beyond June 30, 2026, a strict 20% (2,400,000 CC) haircut will be applied to the total grant payout as part of the M8 payout.  
  * **Cascading Exemption:** Any delivery delays for subsequent milestones (M6, M7, M8) that are demonstrably caused by a delay in M5 approval are exempt from further SLA penalties.  
  * **Standard Penalty:** For all other milestones, a 20% reduction of the milestone payout applies if delivered \>30 days past the stated target date.

**Volatility Stipulation:**

Since this proposal spans less than 6 months, there is no rebasing on CC price changes.

**Timeline & Scope Risk Management:**

Digital Asset explicitly assumes the financial risk of executing engineering phases (M2,3,4,6) parallel to the CIP approval process (M5). Should the governance discussion amend or reject the proposed CIP, Digital Asset absorbs the wasted work of working against an in-flux specification without requesting supplemental Foundation funds. Only if major scope is added to the CIP as part of the governance discussion will the delivery milestone rewards be revisited. 

### **Co-Marketing**

We request that the foundation aligns some technical marketing around the V2 standards to accompany any marketing by the financial institutions that go live on the V2 token standard.