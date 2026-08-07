# KYC Onboarding — Identity Verification

## Process Description

Models Know Your Customer onboarding between a **Client** and a **Compliance** officer. In real-world regulated finance, KYC is mandatory before opening accounts — a client submits identity documents, compliance verifies them, performs a risk assessment, and either approves the account or flags the client for enhanced due diligence. The risk assessment stage is deliberately opaque to the client, reflecting AML/KYC regulatory requirements.

### Flow

1. **Client** submits identity documents (name, DOB, document type/number)
2. **Compliance** verifies identity and assigns a verification score
3. **Compliance** performs risk assessment via a **Risk OK?** gateway
4. If low risk → Compliance opens the account → Client receives confirmation
5. If flagged → Compliance records the flag reason for manual review

## Permission Gating by Stage

| Stage | Signatory | Controller | Observer | Gate Logic |
|-------|-----------|------------|----------|------------|
| **Submit Documents** | Client | Client | Compliance | Only the Client can submit their own identity documents. Compliance observes the submission but cannot fabricate document submissions — ensuring the client has actively provided consent and data. |
| **Verify Identity** | Compliance | Compliance | Client | Control transfers to Compliance. Only they can assign a `verificationScore` (Int) after checking documents. The Client observes that verification is underway but cannot self-verify. This typed score becomes an immutable on-ledger record of the compliance decision. |
| **Risk Assessment** | Compliance | Compliance | — | Compliance retains exclusive control with **no observers**. The risk assessment is deliberately opaque to the Client — the `riskLevel` (Text) field and gateway decision are internal compliance matters. This models real-world AML/KYC where risk scoring methodology is confidential. |
| **Open Account** (low risk path) | Compliance | Compliance | Client | Only reachable if Compliance exercised the "Risk OK" choice. Compliance opens the account — the Client cannot self-onboard without passing the risk gate. The Client is added back as observer to see account confirmation. |
| **Receive Confirmation** | Client | Client | Compliance | Control returns to the Client to acknowledge their new account. This creates an on-ledger timestamp of when the client was informed, satisfying regulatory record-keeping requirements. |
| **Flag for Review** (high risk path) | Compliance | Compliance | — | On flagging, Compliance records the reason with no observers. The Client is deliberately excluded — they should not know the specific flag reason as it could compromise ongoing investigations or screening processes. |

## Template Fields

| Stage | Field | Type | Purpose |
|-------|-------|------|---------|
| Submit Documents | fullName | Text | Client's legal name |
| Submit Documents | dateOfBirth | Date | Client's date of birth |
| Submit Documents | documentType | Text | Passport, driver's license, national ID, etc. |
| Submit Documents | documentNumber | Text | Document identifier |
| Verify Identity | verificationScore | Int | Numeric identity confidence score (0-100) |
| Risk Assessment | riskLevel | Text | Low, Medium, High, Critical |
| Flag for Review | flagReason | Text | Why the client was flagged (internal only) |

## Why This Permission Model Matters

This workflow demonstrates the most nuanced permission model of the four samples:

- **Client consent** — Only the Client can submit documents, ensuring active participation and data protection compliance (GDPR right to be informed)
- **No self-verification** — The Client cannot assign their own verification score; only Compliance can attest to identity validity
- **Confidential risk assessment** — The deliberate removal of observers at the risk assessment stage reflects real regulatory requirements:
  - **Anti-tipping-off rules** (EU 4AMLD Art. 39, US BSA/AML) prohibit disclosing to a client that they are subject to a suspicious activity review
  - **Risk scoring methodology** is proprietary and confidential — revealing it would allow bad actors to game the system
  - **Ongoing investigations** must not be compromised by premature disclosure
- **Selective observer restoration** — The Client is added back as observer only on the happy path (account opened), maintaining the information asymmetry required by regulation
- **Flagged path is fully opaque** — The Client receives no contract, no notification, and no ability to act; from their perspective, the process simply does not progress — which is exactly how real-world enhanced due diligence works

## Daml Compilation Pattern

The risk assessment contract has no observers, making it invisible to the Client on the ledger:

```
template RiskAssessment
  with
    compliance : Party
    -- Note: no client party reference here
    riskLevel : Text
    verificationScore : Int
  where
    signatory compliance
    -- No observer clause = invisible to client

    choice RiskOK : ContractId OpenAccount
      controller compliance
      do create OpenAccount with
           compliance
           client = clientParty  -- Client added back as observer
           ..

    choice FlagForReview : ContractId FlagRecord
      with flagReason : Text
      controller compliance
      do create FlagRecord with ..  -- No observer on flag record either
```

The absence of an `observer` clause on `RiskAssessment` means the Client's participant node never receives this contract — it is cryptographically invisible to them. Canton's sub-transaction privacy ensures that even the existence of the risk assessment is hidden from the Client, not just its contents.
