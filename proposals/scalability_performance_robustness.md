## Development Fund Proposal

**Author:** Digital Asset 
**Status:** Draft  
**Created:** 2026-04-09  
**Label:** canton-protocol-multi-synchronizer


---

## Abstract

This proposal requests funding for important performance, scalability and reliability improvements. This topic covers a very wide range of aspects in various dimensions in order to increase the capacity and reliability of the network. The proposal aims to remove today’s growth constraints around party and validator scaling and to provide enough capacity in terms of throughput for the remainder of the year. The work is based on planned and estimated projects, which in summary should allow to reach the defined targets.

---

## Specification

### 1. Objective
The primary objective is to optimize the vertical performance of the Canton Network's core components to stay ahead of the network’s increasing scaling needs and maximize resource utilization. Throughout 2026, this work will ensure the Global Synchronizer can sustain institutional-grade volumes without degradation of Service Level Objectives (SLOs).

### 2. Implementation Mechanics

The proposal is structured around milestones lifting the validated performance capabilities of Canton Network as aligned with value to the ecosystem and providing a common good. The work consists both of realizing known opportunities for additional parallel processing, data and memory optimizations, as well as establishing and maintaining a framework and MainNet-representative test environment (CILR) to continuously validate and identify the next most impactful performance improvements. Known impactful performance improvements included in this proposal are:
- ACS commitment processor: improve memory efficiency in case of large counterparty sets as is the case for SVs.
- Topology processing: lazy loading of topology state from the sequencer APIs
- Sequencer read backend: parallelize compute-heavy parts of the pipeline and optimize API delivery backend to support more validators with lower network traffic usage.
- Protocol: optimize serialization and message definitions to reduce data on the wire.

### 3. Architectural Alignment

All of the changes correspond to internal refactorings within the existing architecture for the purpose of achieving higher vertical scalability of its components and do not pose a fundamental architectural change.

### 4. Backward Compatibility

The changes will be made available either in a backward compatible way on Splice patch releases, or they will be made available within a new protocol versions as part of minor Splice releases. Rolling out such new protocol versions will be supported through the separately filed protocol upgradability proposal.

---

## Milestones and Deliverables

### Milestone 1: _On-going Commitment: Perpetual Scale Regression Testing and Improvement (CILR)_
- **Focus:** Digital Asset will operate 7/24 a continuous test environment with 16 synchronizer nodes and 600 validator nodes, testing each release for regressions at scale. This environment is used prior to any release and major migration to detect regressions. In most cases, these issues are not fundamental but require analysis and some minor refactoring for remediation. The continuous work will be included in this milestone. The large-scale environment will be complemented by instrumenting and adapting existing per-component performance tests and integrating them into the repositories' automated CI/CD workflows.
- **Estimated Delivery:** Throughout 2026
- **Deliverables / Value Metrics:**
  - CILR: Each incremental improvement delivered as part of this effort will mention the funding through this grant through a (CIP100 / DA-SPR / Incremental) tag in the release notes of the respective repository.
  - REGT: Set of per-component performance tests integrated into the CI/CD workflow of the Canton repository, including nightly test runs, no later than Oct 1st, 2026  

### Milestone 2: _(Reliability Milestone (RM))_
- **Focus:** In order to reach consensus on a single transaction, Canton requires sufficient responses of confirming nodes. While a response may be submitted through any sequencer, and it may be submitted multiple times to reduce failures, such resubmissions introduce additional latencies. The given milestone will improve the liveness signal of a sequencer and the sequencer selection algorithm such that only healthy sequencers are used, while at the same time create the necessary data in order to monitor the quality of service by individual sequencer operators. 
- **Estimated Delivery:**  Sept 1st, 2026
- **Deliverables / Value Metrics:**  
  - Write signal health check and connection filtering, such that submissions are sent to a sequencer which will not respond with SEQUENCER_OVERLOADED due to internal processing delays.
  - A new set of health metrics exposed by the validator, segregated by sequencer, detailing the availability of individual sequencer nodes for write and read, including associated failure rates.
  - A public website where the current observed health metrics of a list of Super Validators can be published to.
  - A publishing feed of our operated nodes to this website.

### Milestone 3: _Throughput Milestones (TM)_
- **Focus:** To support higher loads, various Canton components need to be tuned to reduce computational and storage footprint and increase parallelism. Milestones to go from 100s to 1000s of TPS on the Global Synchronizer will be submitted as a follow-up grant proposal once TM2 is reached. 
- **Estimated Delivery:**
  - TM1: 50 TPS by July 1st, 2026
  - TM2: 100 TPS before EOY 2026  
- **Deliverables / Value Metrics:**
  - Throughput caps as configured in sequencer/app.conf to be set to or above the target values.
  - A CILR performance run demonstrating 24h sustained performance at the TM1/2 levels.
  
### Milestone 4: _Party Milestones (PM)_
- **Focus:** To support larger numbers of parties (and therefore users) on the network, certain components in Canton (ACS commitment processor and validator onboarding topology state processing) must be improved to run in constant memory and time, regardless of topology state size. 
- **Estimated Delivery:** 
  - PM1: 2M parties: Sept 1st, 2026, with party growth cap at 10k per-day (currently 35k per week)
  - PM2: 10M parties: Dec 1st, 2026, with party growth cap at 25k per day 
- **Deliverables / Value Metrics:**  
  - Both target numbers validated in CILR.
  - Party growth cap adjusted accordingly
  - Validator onboarding time is to be constant, not linear, in the topology state.

### Milestone 5: _Node Counterparties (NC)_
- **Focus:** The core architectural target principle of Canton is network scalability, so that any resource contention can be scaled away elastically by adding more validators or synchronizers and sharding the workflow across the available infrastructure. As there is no global state to store, each node needs only to store the subset of data it is privy to, theoretically reducing the storage footprint. This milestone ensures that the network can support locally dense relationship graphs between nodes where single validator nodes have large sets of counterparties. The SV validator nodes hosting the DSO party are a good example, as they have relationships with all network validators and most active wallets. This requires investing in the vertical scalability of a single validator node and the Scan backend to preserve operability with large contract sets and a large number of counterparties. 
- **Estimated Delivery:**  
  - NC1: 1M direct holders: no later than Sept 1st, 2026
  - NC2: 5M direct holders: no later than Dec 1st, 2026
- **Deliverables / Value Metrics:**
  - Both target numbers validated in CILR.    

### Milestone 6: _KMS Cost Milestones (KM)_
- **Focus:** Each message across the Canton Network carries the signatures of the involved nodes (submitting and delivering node). The keys used for such signatures should be kept in a KMS for security reasons. Cloud KMS systems have limited bandwidth and incur costs per request. By introducing session signing keys, this cost overhead and performance penalty can be reduced such that on-demand, in-memory held signing keys can be used temporarily, while the HSM key remains the authoritative, but infrequently used key. 
- **Estimated Delivery:** July 1st, 2026 
- **Deliverables / Value Metrics:** 
  - Functionality is integrated into Canton as a configurable option, including public documentation on usage and trade-offs.
  - HSM cost reduction by at least 90% for signature operations confirmed by DA SV ops team. This is to be measured relative to Splice 0.5.12 for equivalent TPS numbers.
  - Public documentation extended.

### Milestone 7: _(Validator Scalability (VM)_
- **Focus:** Right now, the onboarding rate of validators is throttled to a rate of 25 validators per week in order to guarantee the stability of the network. This falls short of the current demand. The sequencer backend needs to be continuously upgraded to support a larger number of validators, as all validators perform expensive BFT reads from f+1 sequencer backends. This also requires appropriate simulation testing in order to validate the behaviour with thousands of connected nodes. 
- **Estimated Delivery:** 
  - VM1: July 1st 2026: onboarding rate of 50 validators per week with a cap at 1500
  - VM2: Sept 1st 2026: onboarding rate of 100 validators per week with a cap at 3000 
- **Deliverables / Value Metrics:**  
  - Improvements such that the tokenomics committee may start to onboard new validators at the above-defined rates up to the given cap.


---

## Acceptance Criteria
The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone  
- Demonstrated functionality or operational readiness  
- Documentation and knowledge transfer provided  
- Alignment with stated value metrics  

---

## Funding

**Total Funding Request:** 20,350,000 CC

### Payment Breakdown by Milestone
- Milestone 1 (CILR): 715,000 CC per month commencing March 2026.
- Milestone 1 (REGT): 1,230,000 CC upon final release and acceptance.
- Milestone 2 (RM): 1,080,000 CC upon committee acceptance of deliverables.
- Milestone 3 (TM1): 710,000 CC upon final release and acceptance.
- Milestone 3 (TM2): 1,780,000 CC upon final release and acceptance.
- Milestone 4 (PM1): 1,590,000 CC upon final release and acceptance.
- Milestone 4 (PM2): 2,870,000 CC upon final release and acceptance.
- Milestone 5 (NC1): 1,240,000 CC upon final release and acceptance.
- Milestone 5 (NC2): 940,000 CC upon final release and acceptance.
- Milestone 6 (KMS): 880,000 CC upon final release and acceptance.
- Milestone 7 (VM1): 470,000 CC upon final release and acceptance.
- Milestone 7 (VM2): 410,000 CC upon final release and acceptance.

### Volatility Stipulation & CILR funding and renewal

This proposal has the following milestones beyond the 6 month mark: (REGT, TM2, PM2, NC2)  and one continuous item (CILR). All other milestones are denominated in fixed Canton Coin. REGT, TM2, PM2 and NC2 funding may be re-evaluated after 6 months if not yet delivered and Canton Coin price movement has been significant.

CILR funding is released on a monthly basis, at the end of each month, starting March 2026. Should committee members challenge Digital Asset’s performance with respect to the Deliverables, the voting members may proactively vote to delay payment until a decision is reached. Beyond that, CILR deliverables are assessed on a quarterly cycle. The CILR milestone is expected to renew quarterly upon satisfactory review of the deliverables by the Tech & Ops committee for the preceding quarter, and significant CC price movements can be taken into account as part of that evaluation and renewal.

### Timeline Risk Management

Milestones not delivered within <60 days of the estimated delivery date are subject to review and renegotiation by the tech & ops committee.

---

## Co-Marketing

N/A

---

## Motivation

As demand for Canton Network capacity and validators remains strong, the network's scaling capabilities must keep up. The work defined here will allow further growth throughout 2026 to 10M+ wallets, 3000+ validators, and 100+ TPS, meaning $100/s or more in burn for traffic fees. 

