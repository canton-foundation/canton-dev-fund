# **SVM compatibility for Canton with atomic composability**

   
**Authors:** Norbert Vadas, Teemu Päivinen, Heslin Kim, Henri Kämäräinen  
**Status:** Submitted  
**Created:** 2026-02-24

# **Abstract**

Zenith proposes to build a SolanaVM (SVM)-based execution environment for Canton, enabling Canton participants to run SVM-based applications that are atomically composable across Canton subnets and settled on Canton MainNet.

This work extends Zenith's existing CIP-0091 engagement for EVM-compatibility by also delivering SVM-compatibility for Canton.

The SVM extension leverages the same core Daml primitive, `external_call()`, implemented by Zenith ([PRs](https://github.com/digital-asset/canton/pulls) pending), while addressing the additional complexity of the SVM execution engine.

The end result connects the largest developer ecosystem in Web3 (Solana) with Canton, extending its global composability along the vision of the Polyglot Canton Whitepaper.

# **Specification**
## **1\. Objective**

Within this grant, Zenith delivers a production-ready SVM execution environment for Canton that:

* Enables Zenith SVM to provide atomic composability across Canton-based and SVM-based applications.  
* Connects Canton subnets through Zenith SVM to the broader Solana ecosystem.

## **2\. Implementation mechanics**

All SVM transactions are routed through Canton, with subsequent settlement and finality on Canton MainNet. This ensures that Zenith SVM is not value extractive to Canton.

Zenith SVM runs in a trusted execution model where the Canton participant serves dual roles: 

1. Operating a node on the Canton subnet, and   
2. Also acting as the sequencer or operator of the SVM environment.

The SVM extension uses the same primitive implemented by Zenith in Daml as the Zenith EVM solution described in [CIP-0091](https://github.com/canton-foundation/cips/blob/main/cip-0091/cip-0091.md):

* The `external_call()` **function:** Allows Canton contracts to invoke a deterministic, locally running SVM execution service and receive results. This is used to (1) confirm the result of native SVM execution back to Canton in an atomically, and (2) verify the state roots of Zenith SVM on Canton, to reach finality and settlement.

## **3\. Architectural alignment**

This work directly advances Canton’s polyglot vision by delivering an SVM-compatible execution extension for Canton, strengthening global composability across different runtimes. It allows developers to write applications in Solidity (for EVM) or Rust (for SVM) that are atomically composable with Canton-native applications.

This aligns with ecosystem priorities to broaden developer participation, expand Canton’s addressable market, and attract new DeFi and Web3 builders, while ensuring all EVM- and SVM-related activity remains routed through and settled to Canton.

## **4\. Backward Compatibility**

The `external_call()` primitive is **fully backwards compatible**:

* Existing DAML packages and Canton deployments are unaffected.  
* The `external_call()` is a new, opt-in primitive; only DARs that explicitly reference it depend on the feature.  
* No ledger schema migration or replay changes are required for existing data.

# **Milestones and deliverables**

## 

## **Milestone 1: SVM Integration and MVP**

**Focus:** Core SVM execution engine integration, `external_call()` integration with Zenith SVM, deployment of Zenith SVM on a local multi-node Canton test network.

* **Estimated delivery:** 4 months from grant approval

**Deliverables:**

* Integrate the core SVM execution engine into Zenith’s framework.  
* Integrate the `external_call()` function with the SVM execution service.  
* Deploy Zenith SVM on a local multi-node Canton test environment.  
* Demonstrate transaction processing between Canton and Zenith SVM.


## **Milestone 2: End-to-end implementation ready for MainNet deployment**

**Focus:** MainNet-ready end-to-end implementation, ready for production launch.

* **Estimated delivery:** 8 months from grant approval


**Deliverables:**

* Zenith SVM ready for Canton MainNet deployment.  
* Demonstrate atomic composability between Zenith SVM and Canton TestNet (similar composability features as Zenith EVM).  
* Complete security review and audit of Zenith SVM.

Once Milestone2 is accepted, Zenith commits to deploy Zenith SVM to Canton MainNet.

## **Milestone 3: Ecosystem enablement and developer tooling**

**Focus:** Developer experience, documentation, and ecosystem onboarding support.

* **Estimated delivery:** 2 months from Milestone 2 completion

**Deliverables:**

* Deliver SDK and developer tooling for deploying SVM-based applications on Zenith SVM.  
* Publish comprehensive integration guides, tutorials, and reference implementations.  
* Provide onboarding support for early adopters.  
* Deliver monitoring and observability tooling for Zenith SVM.


# **Acceptance criteria**

The completion of the grant will be evaluated based on the following:

**Milestone 1:** 

* Demonstration of transaction processing between a local multi-node Canton test environment and Zenith SVM using `external_call()`.  
  * **Timeline**: 4 months from grant approval.

**Milestone 2:** 

* Zenith SVM is deployed on Canton TestNet.  
* Demonstrate end-to-end transaction processing and atomic composability between Zenith SVM and Canton TestNet (similar composability features as Zenith EVM).  
  * **Timeline**: 8 months from grant approval.  
  * Subject to clock suspension if `external_call()` is not rolled out to Canton TestNet by the time Zenith is ready to demonstrate Milestone 2, until the primitive is available to allow end-to-end demonstration.

**Milestone 3:** 

* Published SDK and developer tooling,  
* At least one reference implementation deployed;   
* Documentation  delivered.  
  * **Timeline**: 2 months from Milestone 2 acceptance.

# **Funding**

**Total funding request:** 2,466,667 CC (370K USD at 0.15 CC/USD rate)

**Payment breakdown by Milestone:**

* **Milestone 1 — SVM integration and MVP:** 1,066,667 CC (160K USD at 0.15 CC/USD rate) upon committee acceptance of the criteria.  
    
* **Milestone 2 — End-to-end implementation:** 1,066,667 CC (160K USD at 0.15 CC/USD rate) upon committee acceptance of the criteria.  
    
* **Milestone 3 — Ecosystem enablement and developer tooling:** 333,333 CC (50K USD at 0.15 CC/USD rate) upon final release and acceptance.

**Volatility handling**

The milestone amounts are denominated in Canton Coin (CC) using a baseline reference price of 0.15 USD per CC. 

For each milestone period, the 30-day moving average (MA) of the CC/USD price will be evaluated.

* If the 30-day MA remains within the band of 0.10–0.22.5 USD, no adjustment will be made.  
* If the 30-day MA falls below 0.10 USD or rises above 0.22.5 USD, the milestone tranche will be recalculated to preserve its value using the applicable 30-day moving average price.


Example:  
For Milestone 1, which spans four months, the total milestone amount will be divided into four equal monthly tranches, each evaluated independently under the above mechanism for the respective month. The adjusted total funding for Milestone 1 will be the sum of the monthly tranches after rebase to the 30-day MA price.

# **Co-Marketing**

Upon each milestone release, Zenith will collaborate with Canton Foundation on:

* Joint announcement of SVM compatibility on Canton.  
* Co-authored blog posts and technical deep-dives highlighting the SVM–Canton integration.  
* Presentations at Canton ecosystem events and Solana ecosystem conferences.  
* Developer outreach targeting the Solana builder community for Canton adoption.


# **Motivation**

Canton's Polyglot vision aims for global composability, privacy, and regulatory compliance across execution environments. While Zenith EVM (built under CIP-0091) addresses EVM compatibility, Solana represents the largest active developer community in Web3 and a rapidly growing DeFi ecosystem.

In Q4 2025, Zenith observed rapid and consistent growth of interest from Solana ecosystem participants for composability with Canton. Zenith SVM would:

* **Expand Canton's addressable market** by connecting it to Solana's developer base and application ecosystem.  
* **Strengthen the polyglot thesis** by demonstrating Canton's ability to host multiple VM paradigms (Daml, EVM, SVM) with atomic composability.  
* **Sustain ecosystem momentum** and attract new builders and participants.  
* **Enable new use cases** such as SVM-native DeFi protocols composing atomically with Canton's regulated financial infrastructure.


# **Rationale**

Zenith is uniquely well-positioned to deliver this extension:

* **Existing infrastructure:** The new `external_call()` primitive in Daml, and Zenith’s framework, are already built and currently being tested under CIP-0091 for EVM. Extending them to SVM is an incremental though technically complex addition rather than a ground-up rebuild.  
* **Deep Solana expertise:** The team building Zenith has a track record of working with the Solana Foundation on core protocol development, providing direct expertise in SVM internals.  
* **Parallel delivery model:** By building SVM alongside EVM rather than sequentially, Zenith accelerates Canton's polyglot roadmap.  
* **Proven accountability and delivery:** Zenith's has already submitted the PR for the `external_call()` primitive, and is about to demonstrate its MVP for transaction processing between Canton and Zenith EVM in the coming days.