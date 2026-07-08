## Development Fund Proposal

**Author:** [ Tarik Riviere / Ligero, Inc ] **Status:** Draft **Created:** 2026-07-08 **Label:** compliance

**Champion:** IntellectEU

---

## Abstract

ZK Supply Cap Prover is an open-source ZK proof system that allows any Canton token issuer to cryptographically demonstrate that aggregate circulation of their token is within an advertised supply cap with no material changes to Canton, the Global Synchronizer, or existing Daml templates. Today, supply cap compliance on Canton relies on legal attestations and periodic audits. This project replaces this trust assumption with cryptographic proof compatible with Canton's selective-disclosure architecture.

---

## Specification

### 1\. Objective

Token issuers on Canton advertise supply caps as a core trust guarantee to holders, regulators, and counterparties. No cryptographic primitive currently exists to verify these caps on Canton in a fully trustless setting regarding the issuer. Some proof-of-reserve systems such as Accountable are EVM-native and architecturally incompatible with Canton’s selective-disclosure privacy model, others such as Chainlink's PoR imply trust assumptions on the issuer side.

This project delivers a working ZK proof system for supply cap compliance on Canton for CIP-56/CIP-112 compatible tokens, validated through a staged deployment from LocalNet to TestNet, culminating in an open-source release with benchmarks and issuer deployment documentation.

### 2\. Prior Art and Alternatives

**Chainlink Proof of Reserve.** Chainlink PoR relies on third party input, often the entity looking to prove adequacy of their reserves or a party contracted by them, to generate a cryptographic proof of these reserves. The trust assumption on the third party is not eliminated in the process. This setting is effective in proving that a party holds at least a certain amount of assets, but does not address the completeness issue, which is inherent in supply cap verification.

**Canton Digital Asset Registry.** The Canton registry provides a queryable ledger of all token holdings. Verifying a supply cap through it requires access to the full holder set and individual balances; there is no mechanism to surface an aggregate without also exposing the underlying positions. For a holder or regulator whose only question is whether total circulation is within the stated cap, that level of disclosure is unnecessary and frequently impermissible. The registry is all-or-nothing where the relevant question has a yes/no answer.

The ZK Supply Cap Prover addresses both gaps: it anchors to the Synchronizer log rather than an issuer-controlled feed, and proves the aggregate cap invariant without revealing any individual holder position.

### 3\. Implementation Mechanics

A naive global supply proof on Canton requires scanning all contracts assigned to one or multiple synchronizers, which is computationally prohibitive under Canton’s privacy model. Two observations make it tractable without modifying any Canton or Daml internals:

* **Issuer signature checking.** Transactions transmitted to the synchronizer carry a meta layer with signatures by parties to the transaction. In a pre-processing step, transactions not signed by the relevant issuers can be filtered out.   
* **Active contract filtering.** Archived contracts represent consumed or redeemed holdings and contribute nothing to circulating supply. Restricting the proof witness to the active contract set eliminates the bulk of state and bounds the proof to what is economically meaningful.

This yields a three-pronged proof generation mechanism:

* **Genesis proof:** A single ZK proof over the full active contract set of the asset issuer at a chosen starting block. One-time cost, O(active contracts at H₀).  
* **Delta proofs:** Incremental proofs covering only the active set diff since prior proof after a period of time. Unchanged-hash contracts carried forward by reference. Cost scales with issuance/redemption activity, not holder count.
* **On-demand proofs:** Point-in-time proofs composable from cached genesis and applicable deltas, for auditor, regulator, or counterparty use.

The prover sits on the issuer node, and asserts that the cumulative of all active contracts’ notionals across the ACS is less or equal than the threshold selected by the issuer.    
    
The verifier walks the synchronizers' sequenced logs, covering every contract in the active contract set, after initial pre-processing including issuer signature screening at the envelope level and active contract filtering. 

The synchronizers' log is the authoritative, tamper-evident source to which the proof anchors, and can be verified against. The prover operates over the issuer's view. No Canton internals are accessed or modified. 

Verifying the proof may require the hash or commitment of the encrypted contracts exposed by the validators (a post-quantum hash can be used to make sure that the data is private even if the underlying encryption is not post-quantum secure). 

**Proof system:** Ligero may be composed with an alternative proof system such as Groth16 for on-chain verification capability (TBD during M1). Decision driven by empirical benchmarks on LocalNet.

**Deployment phases:**

|  Phase | Environment | Goals |
| :---- | :---- | :---- |
| Phase 1 (Milestones 1-3) | LocalNet | Genesis prover correctness, initial benchmarks, Open-source delivery |
| Phase 2 (Milestone 4\) | DevNet / TestNet | Delta pipeline, hash caching, upgrade scenarios, realistic scale |
| Phase 3 (Milestone 5\) | Mainnet | Benchmarks published, issuer deployment documentation |

### 4\. Architectural Alignment

The construction is fully Canton-native and additive:

* Leverages the **issuer’s structural visibility** over their holdings — a property of Canton’s selective-disclosure model where the issuer is a stakeholder on every contract they issue

* Uses the **sequencer’s ordered, authenticated transaction log** as a tamper-evident input to the active set diff

* Operates entirely over the **JSON Ledger API** — no protocol changes, no Daml template modifications

The prover is non-overlapping with existing ecosystem tooling. It does not interfere with DamlHat, Canton Explorer, or cn-quickstart, and requires minimal cooperation from holders, validators and the Global Synchronizer.

### 5\. Backward Compatibility

No backward compatibility impact. The prover is fully external to the Canton protocol and requires no changes to existing Daml templates, participant node configuration, or Canton infrastructure. Issuers can adopt or discontinue the tooling at any point without affecting their existing deployments.

### 6\. Constraints and Limitations

A few boundaries worth stating upfront:

**Token standard scope.** The prover targets CIP-56/CIP-112 compatible tokens. Assets governed by non-standard Daml templates are out of scope; circuit modifications would be required to support them.

**Issuer-side deployment.** The prover runs on the issuer's participant node and depends on their ledger view. It cannot be operated by a third party without the issuer providing data access, which is a coordination requirement, not a technical limitation.

**Verifier hash dependency.** Independent proof verification requires that relevant operators expose the hash or commitment of the encrypted contracts they hold. This is a data availability assumption that falls on the validator set, not a Canton protocol change, but it does require cooperation from these operators.

**On-demand proof latency.** On-demand proofs are fast because they compose a cached genesis with pre-computed deltas. Latency degrades when the gap since the last cached delta is large, which occurs when delta generation cannot keep pace with activity levels. The compute load is structurally right-sided: verification is cheap and can be performed by many parties concurrently, while proof generation is a single-party operation run by the issuer. M4 establishes the practical limits by simulating realistic on-demand request volumes over a 24-hour period.

**Prover availability.** If the prover is offline for an extended period, reconstructing continuity may require a partial re-genesis over the gap interval rather than a straight delta catch-up, depending on contract lifecycle activity during the downtime.

**Off-chain proofs only.** Proofs are produced and verified off-chain. There is no on-chain enforcement mechanism on Canton today. Groth16 composition (evaluated in M1) could open a path toward on-chain verifiability, but this is outside the current grant scope.

### 7\. Extensibility to Other Invariants

The ACS fetcher, delta pipeline, and proof composition machinery built for supply cap compliance are reusable across a broader class of on-chain invariants. What changes between proofs is the circuit, not the data access layer or the proof lifecycle.

Two natural extensions worth noting:

**Reserve ratios.** An issuer could prove that circulating supply does not exceed some multiple of committed reserves, where reserves are anchored as on-chain commitments, an oracle mechanism such as Chainlink's PoR, or attested by a custodian. The proof binds both the ACS-derived circulation figure and the reserve commitment in a single statement, without revealing either quantity in the clear.

**Concentration limits.** A prover could demonstrate that no single holder exceeds a specified percentage of circulating supply, without revealing individual balances. On-chain, enforcing this would require exposing holder positions; ZK lets the issuer prove the constraint is satisfied while preserving Canton's selective-disclosure guarantees. This maps directly onto regulatory concentration thresholds common in tokenized fund and structured product contexts.

A more ambitious direction is a derivatives **clearinghouse capital adequacy**. A central clearinghouse on Canton, as a party to all cleared contracts, holds structural visibility over the full set of member positions, similar to the issuer's visibility over their token holdings. It could use the same proof construction to demonstrate that net exposures per cleared instrument fall within capital adequacy thresholds, without revealing individual institution positions to other members. The clearinghouse runs the prover; members and regulators verify the proof. This is closer in architecture to the supply cap construction than it may appear, and represents a meaningful application of the same ideas to systemic risk transparency.

All three extensions are out of scope for this grant. They are noted here to signal that the infrastructure has value beyond a single invariant, and to invite follow-on proposals or community contributions targeting them.

---

## Milestones and Deliverables

### Milestone 1: Specification & Circuit Design

* **Estimated Delivery:** 4 weeks from start [Hard Commitment: 8 weeks]

* **Estimated Effort:** 50 FTE-days (Full Time Employee Days)

* **Focus:** Formal construction definition, proof system selection, threat model

* **Deliverables / Value Metrics:**

  * Technical specification: circuit definition, trust model, threat model

  * Proof system composition decision and selection with justification (Groth16 composition)

  * Active set fetcher design against JSON Ledger API

  * Public specification document

* **Validation:** Design validation of the issuer workflow, deployment architecture, and data access assumptions against Canton

### Milestone 2: Genesis Prover on LocalNet

* **Estimated Delivery:** 3 weeks from M1 [Hard Commitment: 6 weeks]

* **Estimated Effort:** 40 FTE-days

* **Focus:** Working genesis prover with correctness validation and initial benchmarks

* **Deliverables / Value Metrics:**

  * Genesis prover running against Canton LocalNet on a .dar that is used in production on Canton mainnet

  * Active set filtering implemented and validated

  * Benchmarks: proof size and generation time at 100 / 1,000 / 10,000 contracts

  * LocalNet demo with reference output

* **Validation:** Data access validation against Canton’s architecture and interfaces, with an independent light review of the implementation.

### Milestone 3: Delta Prover with Hash-Based Caching on LocalNet

* **Estimated Delivery:** 2 weeks from M2 [Hard Commitment: 3 weeks]

* **Estimated Effort:** 25 FTE-days

* **Focus:** Incremental proof pipeline with hash-based caching

* **Deliverables / Value Metrics:**

  * Delta proof pipeline with hash cache

  * Composition with genesis proof validated

  * Caching efficiency benchmarks: % reuse vs. synthetic churn rates

  * Correct behavior on simulated contract upgrade (hash invalidation)

  * Test scale and estimate points where delta and realtime proofs break 

* **Validation:** Independent review of correctness of template upgrade and lifecycle semantics handling, and validation of ACS reconstruction and historical transactions retrieval.

### Milestone 4: Stress Testing & On-Demand Proving Limits

* **Estimated Delivery:** 3 weeks from M3 [Hard Commitment: 4 weeks]  
* **Estimated Effort:** 30 FTE-days  
* **Focus:** Establishing performance baselines for on-demand proof generation under realistic load, and identifying the conditions under which latency becomes impractical  
* **Deliverables / Value Metrics:**  
  * LocalNet scale tests across progressively larger active contract sets, producing a benchmark report that maps active-set size, delta window size, and on-demand request volume to proof-generation latency; request volume is swept across a simulated 24-hour period to establish how the system behaves under sustained demand
  * A key property of the construction is that compute load is right-sided: verification is lightweight and can be performed by many parties concurrently, while proof generation is a single-party operation run by the issuer. The benchmark report will quantify this asymmetry explicitly.
  * Prover deployed against DevNet / TestNet at realistic active-set sizes  
  * Delta pipeline validated across multiple template upgrade scenarios  
  * On-demand proof interface (CLI \+ library) and standalone verifier CLI  
* **Validation:** Benchmark report reviewed and accepted by ecosystem partners: on-demand latency must remain within acceptable bounds under normal and moderately stressed conditions; prover successfully operated by an independent party, with separate review of verifier performance and UX on DevNet / TestNet.

### Milestone 5: External Production Validation

* **Estimated Delivery:** 6 weeks from M4 [Hard Commitment: 8 weeks]  
* **Estimated Effort:** 25 FTE-days (core team) \+ partner allocation  
* **Focus:** Independent, real-world operation of the prover against production assets on MainNet, run by external parties (not the grant recipient)  
* **Deliverables / Value Metrics:**  
  * A Super Validator partner (e.g. Obsidian Systems or IntellectEU) runs the prover in real time against Canton Coin on MainNet, demonstrating scale against the network's most active native asset  
  * A token issuer (e.g. Digital Asset or BitSafe) runs the prover in real time against a production CIP-56 token on MainNet, demonstrating completeness proofs over a live, privately-held asset  
  * Written attestations from both partners confirming successful operation, including observed latency, resource usage, and any issues encountered  
* **Validation:** Independent confirmation from a designated ecosystem partner that the prover operated correctly and continuously against MainNet for a minimum agreed period.

### Milestone 6: Production Adoption

* **Estimated Delivery:** Tranches measured at 2, 4, 6 and 8 months following M5 completion [Hard Commitments: 4, 7, 10, and 13 months]   
* **Focus:** Proven real-world adoption by Canton asset issuers running the system in production  
* **Acceptance Criteria** (tranched payouts on cumulative asset value covered by proofs in production):  
  * Tranche A: $1M cumulative covered  
  * Tranche B: $100M cumulative covered  
  * Tranche C: $1B cumulative covered   
  * Tranche D: $100B cumulative covered

  A pre-requisite for tranches C and D is a Security Audit by a Foundation Approved Auditor and a Foundation Approved Scope, as well as remediating all high and critical issues. Names such as **Certora** and **Cure53** are being currently considered. 

* **Validation:** On-chain attestation of covered asset values, plus signed confirmation from each participating issuer that the system is in production use.

### Validation Partners

Two ecosystem partners are expected to support milestone validation:

**Noves** specializes in Canton's data layer and network architecture. Their role focuses on validating data access assumptions against the JSON Ledger API, ACS reconstruction correctness, historical transaction retrieval, and verifier performance and UX.

**PixelPlex** brings hands-on Canton deployment experience. Their role covers implementation review, correctness validation of lifecycle and template upgrade semantics, independent operation of the prover on DevNet/TestNet, and confirmation of MainNet operation at M5.

Partner engagement is subject to mutual agreement and will be formalized through separate arrangements ahead of each milestone.

---

## Open-Source Maintenance

The repository will be released publicly under MIT and Apache 2.0 licenses and will remain accessible indefinitely. Ligero Inc commits to maintaining the codebase for a minimum of 18 months following M5 close.

Critical and high-severity security vulnerabilities in the prover or verifier will be triaged and patched within 30 days of disclosure. Issues are tracked publicly on GitHub.

The prover targets the Canton JSON Ledger API, which is the most stable public-facing Canton interface. Compatibility will be maintained on a best-effort basis as that interface evolves. Breaking changes introduced by the Canton protocol may require a scoped update; Ligero will assess and communicate any such work through the repository's issue tracker before committing to a fix timeline.

Pull requests are welcome. Contributions that fall within the existing scope (prover, ACS fetcher, verifier CLI) will be reviewed within two weeks of submission. Extensions to new token standards or proof systems are encouraged but fall outside the maintenance commitment and would require a separate engagement or a community maintainer willing to take ownership.

After the 18-month maintenance window, stewardship may transfer to the Canton Foundation or a community-designated maintainer, subject to mutual agreement.

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

* Deliverables completed as specified for each milestone

* Genesis prover produces a verifiable output accepted by the standalone verifier CLI

* Delta proofs correctly carry forward contracts with unchanged hashes without re-proving; hash cache correctly invalidates on contract upgrade

* On-demand proofs match composition of genesis \+ applicable deltas at any queried block

* Benchmark report documents proof generation time, proof size, and caching efficiency at LocalNet (small scale) and TestNet (realistic scale)

* All code open-sourced under MIT and Apache 2.0 licences with CI and public documentation sufficient for issuer self-deployment

* Public write-up published through Canton Foundation channels before M5 close

---

## Funding

**Total Funding Request:** To be confirmed with the Tech & Ops Committee, denominated in Canton Coin, milestone-gated. Open to staged commitment: initial funding through M2 with continuation subject to demonstrated results.

A portion of the milestone budget, currently estimated at 166,700 CC, will be allocated to partner organizations to cover their operational and engineering costs.
 
### Payment Breakdown by Milestone

* Milestone 1: 321,152 CC upon committee acceptance
* Milestone 2: 321,152 CC upon committee acceptance
* Milestone 3: 321,152 CC upon committee acceptance
* Milestone 4: 107,336 CC upon committee acceptance
* Milestone 5: 214,671 CC upon committee acceptance
* Milestone 6:
  * 414,863 CC upon committee acceptance
  * 829,725 CC upon committee acceptance
  * 1,661,158 CC upon committee acceptance
  * 4,142,124 CC upon committee acceptance

### Volatility Stipulation

Project duration is estimated at approximately 12 months. Should the timeline extend beyond 12 months due to Committee-requested scope changes, any remaining milestones will be renegotiated to account for significant USD/CC price volatility.

---

## Co-Marketing

Upon release, the implementing entity will collaborate with the Foundation on:

* Announcement coordination upon grant approval and at M5 open-source release

* Technical blog post on the construction, benchmarks, and deployment guide published through Canton Foundation channels

* Public write-up targeting regulated asset issuers evaluating Canton, distributed via Canton developer forum and relevant institutional DeFi channels

* Engagement with 2–3 active Canton token issuers during TestNet phase to generate reference deployments and real-world benchmark data
