# Trade Finance — Letter of Credit

## Process Description

Models the issuance of a Letter of Credit (LC) between a **Buyer** and a **Bank**. In real-world trade finance, a buyer needs a bank to guarantee payment to a seller — the LC is a binding commitment from the bank that payment will be made once specified conditions are met.

### Flow

1. **Buyer** submits an LC application with applicant name, amount, and currency
2. **Bank** reviews the application and decides via an **Approved?** gateway
3. If approved → Bank issues the LC with a reference number and expiry date → Buyer receives it
4. If rejected → Flow ends at the Bank

## Permission Gating by Stage

| Stage | Signatory | Controller | Observer | Gate Logic |
|-------|-----------|------------|----------|------------|
| **Submit LC Application** | Buyer | Buyer | Bank | Only the Buyer can initiate the application. The Bank is listed as observer so it can see the submitted request, but cannot modify or reject it at this stage — the contract simply exists on-ledger awaiting review. |
| **Review Application** | Bank | Bank | Buyer | Control transfers to the Bank. Only the Bank can exercise the review choice. The Buyer can observe progress but has no ability to influence the decision. This is the critical permission gate: the Bank's exclusive control over the gateway choice determines whether the workflow proceeds to issuance or terminates. |
| **Issue LOC** (approved path) | Bank | Bank | Buyer | The Bank retains signatory/controller status to issue the LC with a reference number and expiry date. The Buyer observes but cannot issue on their own behalf — preventing self-authorization of credit instruments. |
| **Receive LOC** | Buyer | Buyer | Bank | Control returns to the Buyer to acknowledge receipt. The Bank observes to confirm delivery. The workflow cannot reach this state without the Bank having first exercised the approval choice. |

## Template Fields

| Stage | Field | Type | Purpose |
|-------|-------|------|---------|
| Submit LC Application | applicantName | Text | Buyer's legal name for the LC |
| Submit LC Application | amount | Decimal | LC value |
| Submit LC Application | currency | Text | Currency code (USD, EUR, etc.) |
| Issue LOC | lcReferenceNumber | Text | Bank-assigned LC identifier |
| Issue LOC | expiryDate | Date | LC expiration date |

## Why This Permission Model Matters

In practice, this mirrors how trade finance works: a buyer requests credit, but only the issuing bank can authorize it. The on-ledger permission model ensures:

- The **Buyer literally cannot exercise the Bank's review choice** — preventing self-approval of credit instruments
- The **Bank cannot submit applications on the Buyer's behalf** — preventing unauthorized origination
- The **approval gateway is controlled exclusively by the Bank** — the binary decision (approve/reject) can only be made by the authorized party
- **Receipt acknowledgment requires the Buyer to act** — creating an on-ledger record that the Buyer received the LC, which has legal significance

## Daml Compilation Pattern

When compiled to Daml, the gateway produces two contract choices on the Review Application template:

```
-- Simplified Daml output
template ReviewApplication
  with
    bank : Party
    buyer : Party
    applicantName : Text
    amount : Decimal
    currency : Text
  where
    signatory bank
    observer buyer

    choice Approve : ContractId IssueLOC
      controller bank
      do create IssueLOC with ..

    choice Reject : ()
      controller bank
      do return ()
```

The `controller bank` clause on both choices enforces that only the Bank can decide the outcome. The Buyer's observer status means they can see the contract exists but cannot exercise either choice.
