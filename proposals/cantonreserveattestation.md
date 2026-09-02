## Canton Reserve Attestation: Structural Proof-of-Reserves for Custodians

**Author:** Amar Mujezinovic (amarmujezinovic1@gmail.com)
**Status:** Draft
**Created:** 2026-09-02
**Champion:** Jatin Pandya

## Abstract

Since the FTX collapse, proof-of-reserves has become a baseline expectation for any custodian or exchange, but current approaches force a tradeoff: Merkle-tree audits expose aggregate structure that can leak individual balances, while signed attestations offer no real cryptographic guarantee. This proposal builds an open-source Daml reference implementation where, for assets and client claims that are both native Canton contracts, insolvency becomes structurally impossible rather than something that is merely detected after the fact: a withdrawal cannot execute if it would drop holdings below total client claims. Over roughly 14 weeks, I will ship the Daml contract layer, an off-ledger aggregation service for scaling to many client claims, and a simulated custodian environment demonstrating the full flow end to end on testnet. I am requesting a grant of $35,000 USD (approximately 320,000 CC at current prices) to fund this work.

## Motivation

Custodians today prove solvency in one of two ways: periodic Merkle-tree snapshots (a point-in-time claim that can be stale minutes after publication, and that can leak information about individual account sizes if not carefully constructed) or a third-party auditor's signed statement (a trust assumption with no on-chain enforcement). Neither approach prevents insolvency. They only report on it after it has already happened.

Canton's privacy model is not decorative here, it is the actual mechanism this problem needs. A regulator or auditor needs full visibility into a custodian's holdings and claims. The custodian's clients need to verify their own claim is included without seeing anyone else's balance. The public needs only a yes/no solvency signal. This is exactly the shape of Daml's signatory/observer model, applied to a problem where selective disclosure is the requirement, not an add-on.

Several custodians are already building on Canton, including BitGo, Copper, Dfns, and BitSafe, giving this a concrete first customer base rather than a hypothetical one.

## Canton Ecosystem Synergies

This proposal is infrastructure for custody, not a competing custody product. BitGo, Copper, and Dfns already provide custody and wallet infrastructure on Canton; Canton Reserve Attestation is designed as a layer these providers (or any custodian issuing Canton-native claim tokens to clients) can adopt to prove solvency to their own institutional clients, auditors, and regulators, without needing to build the attestation logic themselves.

## Specification

### 1. Objective

Deliver an open-source Daml framework that lets a custodian holding Canton-native assets prove, continuously and cryptographically, that total holdings meet or exceed total client claims with each party (auditor, regulator, individual client, public) seeing only the slice of information relevant to them.

### 2. Technical Implementation

**Daml Contract Layer [Open Source]**

| Daml Template | Responsibility |
| --- | --- |
| `ReserveAccount` | Custodian's on-ledger holding of a given asset; `ensure` clause blocks any withdrawal choice that would drop the balance below aggregated client claims |
| `ClientClaim` | Individual client's claim against the custodian; signatories are custodian + client, observer includes auditor party |
| `ClaimAggregate` | Periodic snapshot contract produced by fetching the active `ClientClaim` set and computing the total, signed by the custodian |
| `SolvencyAttestation` | Public-facing contract exposing only a boolean (solvent: yes/no) plus timestamp, observer set to "public" party |
| `AuditorView` | Full-detail contract restricted to the auditor/regulator party, giving complete visibility into `ReserveAccount` and every `ClientClaim` |

Key design decisions:
- Solvency-by-construction for the withdrawal path: the `ensure` clause and the choice logic on `ReserveAccount` make an under-collateralized withdrawal a contract that simply cannot be created, not a violation that is caught later.
- Aggregation at scale: summing every `ClientClaim` inside a single atomic transaction does not scale past a few hundred contracts. `ClaimAggregate` is computed off-ledger via the Participant Query Store (PQS) on a fixed cadence (e.g. every block or every N minutes) and then committed on-ledger as a signed snapshot, which is the basis for `SolvencyAttestation`.
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
- Withdrawal choice logic enforcing the solvency invariant via `ensure` and in-transaction fetch checks
- Daml test scripts covering solvent, under-collateralized, and boundary-condition scenarios
- Package compiled and deployable to Canton sandbox

### Milestone 2: Off-Ledger Aggregation Service
- **Estimated Delivery:** Week 10
- **Deliverables:**
- PQS-based aggregation service computing `ClaimAggregate` on a fixed cadence at scale (target: tens of thousands of active `ClientClaim` contracts)
- Automation trigger committing signed snapshots on-ledger
- Load testing results and documented scaling limits

### Milestone 3: Simulated Custodian Integration and Testnet Deployment
- **Estimated Delivery:** Week 14
- **Deliverables:**
- Realistic simulated custodian environment on Canton testnet, standing in for a real custodian's balance sheet and client claim set
- Auditor-facing and public-facing views demonstrated end to end
- Internal security self-review of the Daml authorization model (no unauthorized party can read or forge a claim); a third-party audit is out of scope for this grant's budget and would be a natural follow-on ask
- Developer documentation: architecture guide, contract reference, deployment guide

## Acceptance Criteria

- All Daml templates compile, deploy, and pass test scripts on Canton sandbox and testnet
- A withdrawal that would breach the solvency invariant is provably rejected by the ledger, not just flagged
- `ClaimAggregate` computation scales to the target claim volume within the documented cadence
- Auditor party can see full underlying data; public party can see only the solvency boolean; individual clients can see only their own claim, verified via test scenarios from each party's perspective
- Code published under an open-source license with test coverage and deployment documentation
- No authorization vulnerabilities in the Daml contracts, confirmed via security review

## Funding

Requesting a grant of $35,000 USD, approximately 318,182 CC at $0.11/CC (to be recalculated at the 30-day average CC/USD price at time of committee approval).

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
