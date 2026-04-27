# **Technology and ecosystem development for a multi-VM capable Canton**  
   
**Authors:** Norbert Vadas, Teemu Päivinen, Heslin Kim, Henri Kämäräinen  
**Status:** Submitted  
**Created:** 2026-02-24
**Updated:** 2026-04-07

# **Abstract**

Zenith requests a recurring Development Fund grant with an initial term of 12 months to develop, maintain and evolve the EVM-compatible execution environment being delivered under [CIP-0091](https://github.com/canton-foundation/cips/blob/main/cip-0091/cip-0091.md), as long-term, production-grade infrastructure for Canton Network.

Enabling Canton's Polyglot vision, Zenith allows Canton participants to deploy native EVM applications that are atomically composable across Canton subnets, with all activity settled on Canton MainNet. Building and sustaining it as a production-grade requires predictable operational funding, which this recurring grant provides.

We have strong, validated interest from top-tier DeFi protocols and other counterparties to bring billions of dollars in assets on-chain as RWAs, and we believe that this is highly complementary to Canton’s institutional positioning. 

Zenith is committed to being a long-term holder of Canton Coin, and given the approval of CIP-105 (Super Validator Locking & Long-Term Commitment Framework) in March 2026, a significant portion of Zenith’s SV rewards must now be locked to maintain Super Validator weight. This locking mechanism materially limits the liquid rewards available to fund ongoing development operations. This Development Fund grant proposal is therefore designed to complement Zenith’s SV rewards, ensuring that Zenith can sustain continuous development, maintenance, and evolution of Canton’s EVM- and SVM-compatible execution environments, as a strategic long-term partner. 

This proposal establishes a structured, quarterly evaluation framework covering:

* Ongoing maintenance of Zenith EVM and continuous Ethereum protocol compatibility (EIPs, hard forks).  
* Deployment stability and security.  
* Developer tooling, SDKs, documentation, and ecosystem onboarding.  
* Ecosystem growth through technical events, workshops, and integration support.

# **Specification**

### **1\. Objective**

As stated in CIP-0091, Zenith is building an EVM-based execution environment for Canton that enables Canton participants to deploy native EVM applications, with atomic composability across Canton subnets, settled on Canton MainNet. The `external_call()` primitive, implemented by Zenith, is the Daml-native mechanism underpinning this composability between Canton-native contracts and EVM-based smart contracts. 

This recurring grant funds continued development of a production-grade EVM environment for Canton. Specifically, Zenith commits to:

* Build and maintain the EVM environment as production-grade infrastructure for Canton, with atomic composability between Daml-native and EVM-based smart contracts.  
* Track and implement Ethereum protocol upgrades, EIPs and hard forks, etc., on a continuous basis to ensure sustained EVM compatibility.  
* Deliver and maintain developer tooling, SDKs, documentation, and onboarding support to drive developer onboarding to Canton through the EVM.  
* Support ecosystem growth through technical workshops, conferences, and developer events.  
* Ensure protocol security through continuous monitoring, observability tooling, and external audits.  
* Implement performance optimizations and state verification improvements as the network scales.

### **2\. Implementation mechanics**

All EVM transactions are routed through Canton, with subsequent settlement and finality on Canton MainNet. This design ensures that the EVM environment is not value extractive to Canton, as all activity flows through Canton directly.

The EVM environment for Canton runs in a trusted execution model where the Canton participant serves dual roles: 

* Operating a node on the Canton subnet, and   
* Also acting as the sequencer or operator of the EVM extension.

Atomic composability is enabled by the `external_call()` function implemented by Zenith in Daml (PRs submitted already). This function allows Daml contracts to invoke a deterministic, locally running EVM execution service and receive results back within the same atomic transaction. Specifically, it is used to:

* Confirm the result of native EVM execution back to Canton atomically.  
* Verify EVM state roots in Canton, enabling finality and settlement.

### **3\. Architectural alignment**

Zenith’s work directly advances Canton’s polyglot vision by delivering an EVM-compatible execution extension for Canton, strengthening global composability. 

It allows developers to write applications in Solidity for EVM that are atomically composable with Canton-native applications, making Canton's regulated financial infrastructure accessible to Ethereum’s developer ecosystem for the first time. 

This aligns with Canton’s ecosystem priorities to broaden developer participation, expand Canton’s addressable market, and attract new builders and users. 

To maximize value alignment and to function as a value additive runtime extension to Canton, Zenith routes all EVM activity through Canton.

Through the EVM compatibility built by Zenith, isolated Hyperledger Besu chains will have a migration path to running EVM applications that are atomically composable with Canton.

### **4\. Backward Compatibility**

**No backward compatibility impact.** 

The `external_call()` primitive is fully backwards compatible:

* Existing DAML packages and Canton deployments are unaffected.  
* The `external_call()` is a new, opt-in primitive; only DARs that explicitly reference it depend on the feature.  
* No ledger schema migration or replay changes are required for existing data.

# **Milestones and deliverables**

Due to the recurring nature of funding, this proposal introduces a **quarterly reporting framework**.

Each quarter, Zenith submits a Quarterly Review Report to the Tech & Ops Committee covering all three metrics below, including live technical demonstrations as needed.

The Quarterly Review Report shall be submitted no later than 30 days following the end of each calendar quarter. Upon submission, the committee shall have 30 days to review the report and raise any material shortfalls. If no such shortfalls are raised within this period, the report shall be deemed accepted.

If the committee identifies material shortfalls, Zenith has 30 days to present a remediation plan. Failure to remediate within this period may result in suspension or termination of future disbursements.

### 

### **Evaluation metric 1: Protocol maintenance and Ethereum compatibility**

**Focus:** Ensure the EVM execution environment for Canton is stable and secure, and follows upstream Ethereum development.

**Deliverables:**

* Implement and rollout Ethereum upgrades to the EVM.  
* Maintain bytecode compatibility.  
* Ensure deterministic execution consistency.  
* Do performance benchmarking and optimizations.  
* Perform regression tests and MainNet validation.

Note: If necessary, Zenith may decide to defer EVM upgrades to preserve network integrity, and adjust upgrade timelines in the event of force majeure.

### 

### **Evaluation metric 2: Reliability and security**

**Focus:** Ensure production reliability and security.

**Deliverables:**

* Continuous monitoring and observability tooling.  
* Security reviews and external audits (as needed).  
* Performance benchmarking and optimization.

### 

### **Evaluation metric 3: Developer experience and ecosystem enablement**

**Focus:** Builder adoption and ecosystem growth.

**Deliverables:**

* SDK and developer tooling updated to reflect any protocol or API changes in the quarter.  
* At least one new tutorial, integration guide, or reference implementation published.  
* Direct onboarding support provided to teams building on the EVM environment for Canton.  
* Ecosystem activations completed (workshop, hackathon, conference, or co-marketing initiative).

# **Acceptance criteria**

### **Evaluation metric 1: Protocol maintenance and Ethereum compatibility**

**Acceptance criteria:**

* Zenith EVM passes the compatibility tests against the current EVM release.
* Ethereum and EIP upgrades implemented within 120 days of Ethereum mainnet activation, unless deferred for network integrity reasons (with written justification provided to the committee).  
* Quarterly Compatibility Report delivered, including EVM test suite pass rates.  
* Performance benchmarking results delivered quarterly, demonstrating transaction throughput and latency targets are met.

### 

### **Evaluation metric 2: Reliability and security**

**Acceptance criteria:**

* No critical or high-severity security vulnerabilities unresolved at quarter end.  
* Stable operation on Canton MainNet, as per uptime KPIs.
* Quarterly Incident Report provided, documenting any downtime events, root cause analyses, and corrective actions taken.

### **Evaluation metric 3: Developer experience and ecosystem enablement**

**Acceptance criteria:**

* At least one new EVM-based application onboarded per quarter, starting from EVM rollout to MainNet.  
* Updated developer documentation published for each network upgrade.  
* At least one ecosystem activation (event, workshop, or co-marketing initiative).
* Quarterly Ecosystem Report summarizing developer engagement metrics, activations and ecosystem enablement.

# **Funding**

**Grant Cessation Clause**: If Zenith successfully closes its Series A (with confirmation of capital call), this grant will immediately cease. Zenith will notify the Committee promptly upon closing.

**Funding request**: 2,000,000 CC per month on a recurring basis, benchmarked against the core Canton protocol maintenance grant (PR #48).

* The exact CC amount subject to volatility adjustment as described below.

**Term:** Initial 12-month period, with quarterly reviews and automatic renewal subject to satisfactory performance.

**Review and off-ramps**: Quarterly evaluation by the Tech & Ops Committee (or Core Contributor Group) based on the proposed quarterly reporting framework including published release notes, repository activity, SLO achievement (critical vulnerabilities mitigated within 48 hours, external PRs reviewed within 5 business days), and ecosystem deliverables. The Committee may suspend or terminate future payments after any quarter if performance falls short.

**Payment schedule**: Monthly disbursements at the end of each month, starting upon approval. Payment may be delayed if the Committee raises a performance challenge and voting members approve the delay.

**SV reward alignment**:

For the duration of the Ecosystem Grant:
* **Prior to mainnet launch:** 100% of Zenith's SV rewards will be locked.  
* **Upon mainnet release:** 30% of SV rewards will be used exclusively for liquidity bootstrapping in Canton Foundation-approved pools.

**Monthly budget breakdown:** 

Zenith’s monthly funding request reflects the operational resources required to sustain a production-grade EVM execution environment on Canton. The costs are driven by a dedicated cross-functional team spanning engineering (7), product (1), and business development (2), marketing (1), and operations (2).

Together, these components enable continuous protocol maintenance, Ethereum compatibility, operational resilience, and ongoing ecosystem growth, positioning Zenith as long-term infrastructure rather than a one-off delivery.

**Volatility handling**

The monthly grants are denominated in Canton Coin (CC) using an initial reference price of 0.15 USD per CC. 

For every month, the 30-day moving average (MA) of the CC/USD price will be evaluated.

* If the 30-day MA remains within the band of 33.3% (0.10–0.22.5 USD for the initial reference price of 0.15), no adjustment will be made.  
* If the 30-day MA leaves the above band, the milestone tranche will be recalculated to preserve its value using the applicable 30-day moving average price.

Example:

* In case of a quarterly grant distribution, the total quarterly amount will be divided into 3 equal monthly tranches, each evaluated independently under the above mechanism for the respective month. The adjusted total funding for a quarter will be the sum of the monthly tranches after the rebase to the 30-day MA price.

# **Co-Marketing**

Upon each quarterly review period, Zenith will collaborate with Canton Foundation on:

* Joint announcements of major ecosystem developments and upgrades.  
* Co-authored technical blog posts.  
* Technical deep-dives on cross-VM composability (Daml and EVM).  
* Developer-focused events.  
* Representation at conferences.


# **Motivation**

[Canton's Polyglot vision](https://www.canton.network/hubfs/Canton%20Network%20Files/whitepapers/Polyglot_Canton_Whitepaper_11_02_25.pdf) aims for global composability, privacy, and regulatory compliance across execution environments. Zenith addresses EVM-compatibility, with plans to extend this to SVM-compatibility (subject to the approval of a separate grant submitted), connecting the two largest ecosystems and developer communities in Web3 with Canton Network.

Considering the growing interest from EVM applications to becoming composable with Canton, Zenith:

* **Expands Canton's addressable market** by connecting it to Ethereum's developer base and application ecosystem.  
* **Strengthens the polyglot thesis** by allowing Canton to host multiple VM environments (Daml, EVM, SVM) with atomic composability.  
* **Significantly contributes to ecosystem growth** by opening up Canton to the largest developer communities in Web3.  
* **Enables new use cases** such as EVM-native RWA and DeFi protocols composing atomically with Canton's regulated financial infrastructure.  
* Offers a **migration path for isolated Hyperledger Besu chains** to running EVM applications that interact atomically with Canton and compose with Canton’s regulated financial infrastructure.

EVM compatibility is not a one-time feature implementation but needs consistent maintenance. Ethereum and the EVM evolves continuously, through hard forks, EIPs, tooling changes, and security improvements, and staying up-to-date requires sustained engineering effort. 

The predictable operational funding through this grant ensures continuous, production-grade EVM-compatibility for Canton through a robust, fully maintained EVM execution environment.

### **Commitment to growth and adoption**

While the current grant proposal focuses primarily on the productionization, maintenance, and further evolving of EVM execution environments for Canton, Zenith is equally committed to driving growth and adoption that benefit both Canton and Zenith. Ambitious [adoption milestones](https://github.com/canton-foundation/cips/blob/main/cip-0091/cip-0091.md#growth-and-adoption-weight--predicated-upon-demonstration-of-daml-to-vb-composability) are already part of CIP-0091, including: 1\. onboarding enterprise deployments with over $10M TVL to Canton via Zenith; 2\. generating 10M $CC burn (per 0.5 weight) through EVM transactions; and 3\. reaching over $1B of RWAs issued.

In the past three months, Zenith has conducted hundreds of conversations, including active pilot discussions, with a diverse range of counterparties across two key verticals:

* **Institutional demand:** Financial institutions, fund managers, tokenized asset issuers, and telcos, including one LOI signed.  
* **DeFi and protocol ecosystem:** Decentralized and centralized exchanges, lending markets, perpetual DEXs, and prediction markets, including the top-tier Ethereum and Solana protocols.

Based on the demand pipeline, Zenith is confident it can meet its adoption and growth milestones, along with consistently increasing user activity, to Canton through Zenith.

# **Rationale**

Zenith is committed to enabling and strengthening Canton’s polyglot vision by delivering and maintaining production-grade EVM compatibility.

Through CIP-0091, Zenith is a core stakeholder in realizing Canton’s EVM compatibility. The `external_call()` primitive is already implemented and under active testing, with transaction processing between Canton and the EVM environment being demonstrated on March 3. This proposal formalizes and sustains infrastructure elements that are already functional and advancing.

Zenith combines deep EVM and SVM expertise with hands-on experience implementing deterministic execution within Canton’s architecture. Our 13-person team works exclusively on bringing the EVM execution environment to Canton with atomic composability. 

The recurring grant provides Zenith with the stability needed to proactively: 

* Implement protocol upgrades,   
* Maintain rigorous security standards,   
* Optimize performance, and   
* Support the developer ecosystem over time. 

Our objective is not a short-term collaboration, but a strategic, long-term alignment to build and deliver EVM-compatibility for Canton, while also ensuring operational stability for Zenith.
