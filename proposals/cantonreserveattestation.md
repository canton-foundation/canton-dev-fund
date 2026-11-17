## Canton Reserve Attestation: Structural Proof-of-Reserves for Custodians

**Author:** Amar Mujezinovic (amarmujezinovic1@gmail.com)
**Status:** Draft
**Created:** 2026-09-02
**Label:** `regulatory-compliance`
**Champion:** Needs Champion

## Abstract

Since the FTX collapse, proof-of-reserves has become a baseline expectation for any custodian or exchange, but current approaches force a tradeoff: Merkle-tree audits expose aggregate structure that can leak individual balances, while signed attestations offer no real cryptographic guarantee. This proposal builds an open-source Daml reference implementation where, for assets and client claims that are both native Canton contracts, insolvency becomes structurally impossible rather than something that is merely detected after the fact: a withdrawal cannot execute if it would drop holdings below total client claims. Over roughly 14 weeks, I will ship the Daml contract layer, an off-ledger aggregation service for scaling to many client claims, and a simulated custodian environment demonstrating the full flow end to end on testnet. I am requesting a grant of $35,000 USD (approximately 320,000 CC at current prices) to fund this work.

## Motivation

Custodians today prove solvency in one of two ways: periodic Merkle-tree snapshots (a point-in-time claim that can be stale minutes after publication, and that can leak information about individual account sizes if not carefully constructed) or a third-party auditor's signed statement (a trust assumption with no on-chain enforcement). Neither approach prevents insolvency. They only report on it after it has already happened.

Canton's privacy model is not decorative here, it is the actual mechanism this problem needs. A regulator or auditor needs full visibility into a custodian's holdings and claims. The custodian's clients need to verify their own claim is included without seeing anyone else's balance. The public needs only a yes/no solvency signal. This is exactly the shape of Daml's signatory/observer model, applied to a problem where selective disclosure is the requirement, not an add-on.

Several custodians are already building on Canton, including BitGo, Copper, Dfns, and BitSafe, giving this a concrete first customer base rather than a hypothetical one.

### Evidence of Need

This is not a hypothetical gap. Three concrete data points:

1. **BitGo's own Canton custody offering currently has no reserve-attestation layer.** BitGo's published Canton case study describes qualified custody of Canton Coin and CIP-56 assets with cold/hot wallet security, but makes no mention of proof-of-reserves or solvency verification specific to Canton. The gap is confirmed directly from the leading custodian's own materials, not inferred.
2. **Even BitGo's best current practice, off Canton, is explicitly periodic and point-in-time.** BitGo's own public writeup on proof-of-reserves describes their most rigorous method (third-party Merkle-tree audit) as a snapshot process, and states plainly that proof-of-reserves alone does not prevent an entity from becoming insolvent between snapshots. This is the exact limitation this proposal is built to remove for Canton-native holdings.
3. **There is a live, named regulatory trigger on Canton today.** Circle's USDCx is issued on Canton via Circle xReserve, and Circle operates under MiCA in the EU. MiCA requires daily reconciliation between circulating token supply and reserves, with any mismatch above 0.1% reportable to regulators within 24 hours, on top of quarterly independent attestation. A mechanism that makes under-collateralization structurally detectable in real time, rather than caught at the next periodic check, serves this specific, legally mandated requirement for an issuer already live on the network, not a speculative future one.

## Canton Ecosystem Synergies

This proposal is infrastructure for custody, not a competing custody product. BitGo, Copper, and Dfns already provide custody and wallet infrastructure on Canton; Canton Reserve Attestation is designed as a layer these providers (or any custodian issuing Canton-native claim tokens to clients) can adopt to prove solvency to their own institutional clients, auditors, and regulators, without needing to build the attestation logic themselves.

## Specification

### 1. Objective

Deliver an open-source Daml framework that lets a custodian holding Canton-native assets prove, continuously and cryptographically, that total holdings meet or exceed total client claims with each party (auditor, regulator, individual client, public) seeing only the slice of information relevant to them.

### 2. Technical Implementation

**Daml Contract Layer [Open Source]**

| Daml Template | Responsibility |
| --- | --- |
| `ReserveAccount` | Custodian's on-ledger holding of a given asset; carries `holdings` and a running `totalClaims` counter as fields on the contract itself. Every state change (issuing a claim, settling a claim, or withdrawing) archives the current `ReserveAccount` and creates its replacement with the counter already updated, in the same atomic transaction. The withdrawal choice simply checks `holdings - amount >= totalClaims` against its own fields, no fetching of other contracts required |
| `ClientClaim` | Individual client's claim against the custodian; signatories are custodian + client, observer includes auditor party; can only be created as a side effect of `ReserveAccount`'s `IssueClaim` choice, and only archived as a side effect of its `SettleClaim` choice, which is what keeps `totalClaims` authoritative |
| `ClaimAggregate` | Cross-account reporting rollup produced off-ledger by PQS: historical record and dashboard data (claim counts, trends over time) for auditors and the custodian's own ops team. Purely informational; never consulted by the withdrawal check |
| `SolvencyAttestation` | Public-facing contract exposing only a boolean (solvent: yes/no) plus timestamp, derived from the authoritative `ReserveAccount` state, observer set to "public" party |
| `AuditorView` | Full-detail contract restricted to the auditor/regulator party, giving complete visibility into `ReserveAccount` and every `ClientClaim` |

Key design decisions:
- **The solvency check is a running on-ledger counter, not a fetch-and-sum at withdrawal time, and this is a correction from the original design.** The earlier draft had the withdrawal choice fetch and sum the live `ClientClaim` set inside the transaction, which raises real questions in Daml about how a choice enumerates an unbounded set of related contracts, and about transaction-size limits as the claim count grows. The corrected design avoids the question entirely: `totalClaims` lives as a field on `ReserveAccount` and is updated atomically every time a claim is issued or settled, by the only two choices permitted to touch it. A withdrawal is then an O(1) comparison against the contract's own current fields. There is no separate aggregation step to go stale, because the balance that gates a withdrawal is maintained transactionally, not recomputed.
- **This replaces the staleness risk with a concurrency one, and that is the real engineering problem Milestone 1 solves.** Because every claim issuance, settlement, and withdrawal archives-and-recreates the same `ReserveAccount` contract, two of those operations submitted at the same instant will contend for the same contract: the ledger accepts the first and rejects the second, which must then retry against the new contract. For a custodian issuing many claims per second this is a real throughput ceiling, not a hypothetical one, and it is the honest reason to shard: a custodian's holdings for one asset are split across multiple `ReserveAccount` shards (keyed by, for example, a hash of the client ID), each maintaining its own `holdings`/`totalClaims` pair, so concurrent claims against different clients do not contend on the same contract. Global solvency for an asset is then the sum of its shards' states, read off their current fields, not off a cached snapshot.
- **Authorization, not just convention, is what keeps `totalClaims` trustworthy.** `ClientClaim` requires the custodian's party as a signatory, so it cannot be created without the custodian's authority regardless of who proposes it; by only ever granting that authority through `ReserveAccount`'s `IssueClaim` choice in the deployed application code, there is a single code path that can bring a claim into existence, and that path is the same transaction that increments `totalClaims`. Milestone 1 includes test scripts that attempt to construct a `ClientClaim` outside that path and confirm the ledger rejects it.
- Scope boundary, stated plainly: this construction gives a hard guarantee only for assets and claims that are native Canton contracts. For custodians holding off-chain assets (fiat, BTC on Bitcoin, etc.), the model reduces to today's oracle-attestation pattern. `ReserveAccount` would be fed by a signed oracle report instead of a real ledger balance. This proposal's core deliverable targets the native-asset case; off-chain oracle integration is called out as Phase 2, not promised as solved here.

### 3. Architectural Alignment

Canton's sub-transaction privacy is the reason this is worth building here specifically rather than on a public chain: the same underlying data (holdings, individual claims) needs three different visibility levels (public boolean, client's own claim, auditor's full view) from a single source of truth, which is a direct fit for Daml's signatory/observer model rather than something bolted on with a separate ZK circuit per audience.

### 4. Backward Compatibility

No impact on existing Canton infrastructure. This introduces new templates only; it does not modify any existing custody, token, or synchronizer contracts.

## Milestones and Deliverables

### Milestone 1: Daml Contract Layer
- **Estimated Delivery:** Week 5
- **Deliverables:**
- `ReserveAccount`, `ClientClaim`, `ClaimAggregate`, `SolvencyAttestation`, `AuditorView` templates
- `IssueClaim`, `SettleClaim`, and `Withdraw` choices on `ReserveAccount` implementing the running `totalClaims` counter, with the solvency check as an O(1) comparison against the contract's own fields
- Test scripts proving `ClientClaim` cannot be created or archived outside the `IssueClaim`/`SettleClaim` path, confirming `totalClaims` cannot be bypassed
- Daml test scripts covering solvent, under-collateralized, boundary-condition, and concurrent-submission (contention/retry) scenarios
- Sharding design for splitting one custodian/asset pair's `ReserveAccount` across multiple shards to spread write throughput, with the global solvency rollup defined as the sum of shard states
- Package compiled and deployable to Canton sandbox

### Milestone 2: Off-Ledger Aggregation Service
- **Estimated Delivery:** Week 10
- **Deliverables:**
- PQS-based aggregation service computing `ClaimAggregate` as a cross-account, cross-shard reporting rollup for dashboards and audit history, explicitly informational and never consulted by the withdrawal check
- Automation trigger committing signed rollup snapshots on-ledger, with snapshot age exposed alongside `SolvencyAttestation` for transparency about the reporting layer's own latency
- Throughput benchmarking of the sharded `ReserveAccount` design under concurrent claim issuance, with documented contention/retry behavior and measured claims-per-second per shard

### Milestone 3: Simulated Custodian Integration and Testnet Deployment
- **Estimated Delivery:** Week 14
- **Deliverables:**
- Realistic simulated custodian environment on Canton testnet, standing in for a real custodian's balance sheet and client claim set
- Auditor-facing and public-facing views demonstrated end to end
- Internal security self-review of the Daml authorization model (no unauthorized party can read or forge a claim); a third-party audit is out of scope for this grant's budget and would be a natural follow-on ask
- Developer documentation: architecture guide, contract reference, deployment guide

## Acceptance Criteria

- All Daml templates compile, deploy, and pass test scripts on Canton sandbox and testnet
- A withdrawal that would breach the solvency invariant is provably rejected by the ledger, verified by an O(1) check against the `ReserveAccount`'s own current fields, not a snapshot or external fetch
- `ClientClaim` cannot be created or archived outside the `IssueClaim`/`SettleClaim` choices, confirmed by test scripts that attempt to bypass the counter
- Sharded `ReserveAccount` design benchmarked under concurrent load, with measured claims-per-second per shard and documented contention/retry behavior
- `ClaimAggregate` rollup computation scales to the target claim volume within the documented cadence, for reporting purposes only, and never gates a withdrawal
- Auditor party can see full underlying data; public party can see only the solvency boolean and snapshot age; individual clients can see only their own claim, verified via test scenarios from each party's perspective
- Code published under an open-source license with test coverage and deployment documentation
- No authorization vulnerabilities in the Daml contracts, confirmed via security review

## Funding

Requesting a grant of $35,000 USD, approximately 320,000 CC at current prices (to be recalculated at the 30-day average CC/USD price at time of committee approval).

| Milestone | Focus | % of Total |
| --- | --- | --- |
| M1 (Week 5) | Contract layer | 35% |
| M2 (Week 10) | Aggregation service | 30% |
| M3 (Week 14) | Simulated integration + testnet + docs | 35% |

## Growth Strategy

- Post-grant, pursue a real pilot with one of the custody providers already building on Canton (BitGo, Copper, Dfns, BitSafe) rather than launching as a standalone product; the simulated environment built under this grant is what makes that conversation concrete
- Publish the contract layer as a reusable reference implementation so any future custodian entering the ecosystem can adopt solvency attestation without rebuilding it
- Phase 2 (not funded under this proposal): oracle-based extension for custodians holding off-chain assets, and a third-party security audit once a real integration partner is in place

## Team

Solo builder.
