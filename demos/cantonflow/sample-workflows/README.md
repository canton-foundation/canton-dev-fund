# CantonFlow Sample Workflows — Permission Gating Reference

## Overview

These four sample workflows demonstrate how Canton's permission model (Signatories, Controllers, Observers) maps to real-world multi-party business processes through BPMN 2.0 diagrams. Each workflow is designed as a reference implementation for the CBP-v1 (Canton-BPMN Profile v1) canonical mapping rules.

## Canton Permission Model

Every BPMN element in CantonFlow carries three permission properties that compile directly to Daml contract authorization:

| Property | Daml Mapping | Real-World Meaning |
|----------|-------------|-------------------|
| **Signatory** | `signatory` clause | Who is legally bound by this contract state. Must authorize the transaction. |
| **Controller** | `controller` clause on choices | Who has the right to execute this step. Only this party can exercise the choice. |
| **Observer** | `observer` clause | Who can see the contract data without acting on it. Read-only visibility. |

**How permission gating works:** At each stage of a workflow, the Controller is the only party that can advance the process to the next state. The previous contract is archived (consumed) and a new contract is created for the next state — with potentially different Signatories, Controllers, and Observers. This consuming-choice pattern ensures:

1. **No skipping steps** — You cannot create a later-stage contract without exercising the choice on the current-stage contract
2. **No unauthorized actions** — Only the designated Controller can exercise the choice
3. **No forged history** — The ledger records every state transition with cryptographic proof
4. **Selective visibility** — Observers see contract state without the ability to modify it

## Sample Workflows

| # | Workflow | Parties | Gateways | Key Permission Pattern |
|---|----------|---------|----------|----------------------|
| 1 | [Trade Finance](trade-finance.md) | Buyer, Bank | 1 (Approved?) | Cross-party authorization gate |
| 2 | [Supply Chain](supply-chain.md) | Manufacturer, Supplier | 1 (Quality OK?) | Alternating controller handoff |
| 3 | [Insurance Claim](insurance-claim.md) | Claimant, Insurer | 1 (Claim Valid?) | Single-authority gateway control |
| 4 | [KYC Onboarding](kyc-onboarding.md) | Client, Compliance | 1 (Risk OK?) | Selective observer removal for confidentiality |

## CBP-v1 Elements Demonstrated

These workflows collectively exercise the following CBP-v1 required elements:

- **Pools/Lanes → Parties** — Each pool maps to a Canton Party
- **Start/End Events → Contract creation/archival** — Process lifecycle
- **User Tasks → Choices on contracts** — Controlled by the lane party
- **Exclusive Gateways → Mutually exclusive choices** — Decision points with guards
- **Sequence Flows → State transitions** — Consuming choices creating next-state contracts
- **Message Flows → Cross-participant actions** — Permission handoffs between pools
- **Template Fields → Daml `with` parameters** — Typed data at each state
