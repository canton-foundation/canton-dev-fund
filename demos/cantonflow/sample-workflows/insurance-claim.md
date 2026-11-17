# Insurance Claim — Claims Processing

## Process Description

Models claims processing between a **Claimant** and an **Insurer**. In real-world insurance, a policyholder files a claim after an incident, and the insurer has exclusive authority to assess validity, determine payout amounts (including partial approvals), and disburse funds. The claimant cannot approve their own claim, and the insurer cannot file claims on behalf of claimants.

### Flow

1. **Claimant** files a claim with type, incident date, amount, and description
2. **Insurer** reviews and assesses the claim via a **Claim Valid?** gateway
3. If valid → Insurer processes the payout → Claimant receives confirmation
4. If rejected → Insurer records the rejection reason

## Permission Gating by Stage

| Stage | Signatory | Controller | Observer | Gate Logic |
|-------|-----------|------------|----------|------------|
| **File Claim** | Claimant | Claimant | Insurer | Only the Claimant can initiate a claim. The Insurer observes the filing but cannot file claims on behalf of claimants — preventing fraudulent claim origination from the insurer side. |
| **Review & Assess Claim** | Insurer | Insurer | Claimant | Control transfers exclusively to the Insurer. Only the Insurer can exercise the gateway choice (valid/invalid). The Claimant can observe that review is underway but cannot approve their own claim. This is the central permission gate — the Insurer's `approvedAmount` field allows partial approvals (e.g., approving $8,000 of a $10,000 claim). |
| **Process Payout** (valid path) | Insurer | Insurer | Claimant | The Insurer retains control to process the actual payout. This step only exists if the Insurer exercised the "Claim Valid" choice. The Claimant observes but cannot trigger payout — only the authorized insurer can disburse funds. |
| **Receive Payout** | Claimant | Claimant | Insurer | Control returns to the Claimant to acknowledge receipt. This creates an on-ledger record that the Claimant accepted the payout amount, serving as a digital receipt. |
| **Record Rejection** (invalid path) | Insurer | Insurer | — | On rejection, only the Insurer records the reason. No observer is needed since the rejection is an internal record. The Claimant's workflow ends at the gateway — they receive no further contract to exercise. |

## Template Fields

| Stage | Field | Type | Purpose |
|-------|-------|------|---------|
| File Claim | claimType | Text | Category of claim (auto, health, property, etc.) |
| File Claim | incidentDate | Date | When the incident occurred |
| File Claim | claimedAmount | Decimal | Amount the claimant is requesting |
| File Claim | description | Text | Narrative description of the incident |
| Review & Assess | approvedAmount | Decimal | Insurer's assessed payout (may differ from claimed) |
| Record Rejection | rejectionReason | Text | Why the claim was denied |

## Why This Permission Model Matters

This models the real-world insurance process:

- **Claimants cannot approve their own claims** — the Insurer has exclusive gateway control, preventing self-service claim approval
- **Insurers cannot file claims on others' behalf** — the Claimant must initiate, ensuring consent and accurate first-party reporting
- **Partial approvals are built in** — the `approvedAmount` field allows the Insurer to assess a different amount than what was claimed, modeling real-world adjustments (deductibles, coverage limits, depreciation)
- **Rejection is an internal record** — no observer on the rejection path means the Claimant receives no further contract to act on; their workflow simply ends at the gateway
- **Receipt creates legal evidence** — the Claimant exercising the "Receive Payout" choice creates an immutable on-ledger acknowledgment of payment

## Daml Compilation Pattern

The gateway generates two exclusive choices on the review template:

```
template ReviewClaim
  with
    insurer : Party
    claimant : Party
    claimType : Text
    claimedAmount : Decimal
  where
    signatory insurer
    observer claimant

    choice ClaimValid : ContractId ProcessPayout
      with approvedAmount : Decimal
      controller insurer
      do create ProcessPayout with ..

    choice ClaimInvalid : ContractId RecordRejection
      with rejectionReason : Text
      controller insurer
      do create RecordRejection with ..
```

Both choices are controlled by the Insurer. The `approvedAmount` parameter on `ClaimValid` allows the Insurer to set the actual payout amount at exercise time — not at contract creation time — modeling the real-world assessment workflow where the approved amount is determined during review.
