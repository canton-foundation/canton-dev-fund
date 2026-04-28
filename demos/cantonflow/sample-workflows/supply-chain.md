# Supply Chain — Purchase Order to Payment

## Process Description

Models a full procure-to-pay cycle between a **Manufacturer** and a **Supplier**. In real-world supply chain operations, a purchase order triggers a chain of fulfillment steps where each party must complete their obligation before the other can proceed — creating a natural handoff pattern that maps directly to Canton's controller model.

### Flow

1. **Manufacturer** creates a purchase order (item, quantity, unit price)
2. **Supplier** confirms the order with an estimated delivery date
3. **Supplier** ships goods with a tracking number
4. **Manufacturer** receives and inspects goods via a **Quality OK?** gateway
5. If quality passed → Manufacturer releases payment with a reference number
6. If quality failed → Process ends (goods returned / dispute initiated)

## Permission Gating by Stage

| Stage | Signatory | Controller | Observer | Gate Logic |
|-------|-----------|------------|----------|------------|
| **Create Purchase Order** | Manufacturer | Manufacturer | Supplier | Only the Manufacturer can create the PO. The Supplier observes the order details but cannot modify quantities or prices — they can only respond in the next step. |
| **Confirm Order** | Supplier | Supplier | Manufacturer | Control transfers to the Supplier. Only they can confirm and provide an estimated delivery date. The Manufacturer cannot self-confirm. This prevents a buyer from bypassing supplier agreement. |
| **Ship Goods** | Supplier | Supplier | Manufacturer | The Supplier retains control to record shipment with a tracking number. The Manufacturer observes shipping status but cannot mark goods as shipped — only the party physically handling logistics can. |
| **Receive & Inspect** | Manufacturer | Manufacturer | Supplier | Control returns to the Manufacturer. Only they can perform quality inspection and exercise the gateway choice (pass/fail). The Supplier cannot self-certify their own goods' quality. |
| **Release Payment** (passed path) | Manufacturer | Manufacturer | Supplier | The Manufacturer retains control to release payment. This step is only reachable if the Manufacturer exercised the "Quality Passed" choice — the Supplier cannot trigger payment without inspection approval. |

## Template Fields

| Stage | Field | Type | Purpose |
|-------|-------|------|---------|
| Create Purchase Order | item | Text | Product/material identifier |
| Create Purchase Order | quantity | Int | Number of units ordered |
| Create Purchase Order | unitPrice | Decimal | Price per unit |
| Confirm Order | estimatedDeliveryDate | Date | Supplier's delivery commitment |
| Ship Goods | trackingNumber | Text | Shipment tracking reference |
| Release Payment | paymentReference | Text | Payment transaction identifier |

## Why This Permission Model Matters

The alternating controller pattern enforces a real-world handoff:

- **Each party must complete their step before the other can proceed** — a supplier cannot confirm an order that was never placed
- **No self-certification** — the Manufacturer inspects goods, not the Supplier; the Supplier ships goods, not the Manufacturer
- **Payment is gated by inspection** — the Supplier cannot trigger payment without the Manufacturer first exercising the "Quality Passed" choice
- **The ledger enforces sequential dependency** — there is no technical path to reach the payment state without every prior state having been completed by the correct party

This models the real-world "three-way match" in procurement: purchase order (Manufacturer), goods receipt (Manufacturer after Supplier ships), and invoice/payment (Manufacturer after inspection). Each step requires the correct party to act, and no party can act out of turn.

## Daml Compilation Pattern

The Daml output produces a chain of templates where each choice archives the current state and creates the next:

```
-- Simplified: each choice consumes current contract, creates next state
template CreatePurchaseOrder
  with manufacturer : Party; supplier : Party; item : Text; quantity : Int; unitPrice : Decimal
  where
    signatory manufacturer
    observer supplier
    choice ConfirmOrder : ContractId ConfirmOrder
      with estimatedDeliveryDate : Date
      controller supplier        -- Control transfers to Supplier
      do create ConfirmOrder with ..

template ConfirmOrder
  with manufacturer : Party; supplier : Party; ...; estimatedDeliveryDate : Date
  where
    signatory supplier
    observer manufacturer
    choice ShipGoods : ContractId ShipGoods
      with trackingNumber : Text
      controller supplier        -- Supplier retains control
      do create ShipGoods with ..
```

Each `controller` clause enforces the handoff. The `signatory` on each template reflects who authorized that state — creating an immutable chain of custody on the ledger.
