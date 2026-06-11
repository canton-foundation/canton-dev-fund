## Development Fund Proposal

**Author:** Ayush Singh (Individual contributor, ayushsinghmi711@gmail.com)
**Status:** Draft
**Created:** 2026-06-11
**Label:** wallet-apps

---

## Abstract

The wallet SDK can now send Utility Registry tokens (pre-approval work currently in progress). Three practical problems appear immediately once that lands: pre-approvals expire without warning, there is no unified read path for transaction history across registries, and there is no standard way for one Canton wallet to request a payment from another. This proposal addresses all three as a single coherent scope — the lifecycle around a token transfer, not just the transfer itself.

---

## Specification

### 1. Objective

The work in progress on Utility Registry token pre-approvals closes the send gap. It does not close the gaps around sending. A wallet that sets up a USDCx pre-approval today will fail silently when it expires — the SDK has no surface for tracking expiry or triggering renewal. A wallet that supports multiple registries has to query each one separately and stitch the history together by hand, because the SDK has no unified history read path. And when a merchant or dApp wants to ask a user to send a specific token, there is no Canton equivalent of a payment URI — every app invents a format, so wallets cannot interoperate on incoming payment requests.

These three gaps are a natural follow-on to the pre-approval work and are best handled together, because they share the same SDK surface area and the same integration tests.

### 2. Implementation Mechanics

**Pre-approval expiry management.** Add an expiry-aware layer to the pre-approval path. The SDK tracks the expiry timestamp for each pre-approval (Canton Coin and Utility Registry tokens), surfaces a `getExpiringPreapprovals(withinDays)` helper, and provides a `renewPreapproval` call that re-uses the existing factory resolution logic from the pre-approval work. No new protocol; no new contracts. This is a bookkeeping layer over what the pre-approval work already does.

**Multi-registry transfer history.** Add a unified history interface that normalises transaction records across Canton Coin and Utility Registry token registries. The adapter per registry maps amounts to the correct decimal places, attaches instrument metadata (symbol, registry ID, instrument ID), and paginates consistently. A caller gets one list regardless of how many registries a user holds tokens in. Builds on the holdings read path from Proposal 2 if merged; otherwise implements the minimal read surface needed.

**Payment request format.** Define a Canton payment URI format and ship a parser and builder in the SDK. The URI encodes receiver party ID, registry ID, instrument ID, amount, and optional fields (memo, expiry, nonce). Example: `canton:PARTY_ID?registry=REGISTRY_ID&instrument=INSTRUMENT_ID&amount=10.00&memo=invoice-42`. The builder accepts a token type, amount, and party and returns a valid URI. The parser returns a structured object that feeds directly into the transfer path. The spec is published as a short Canton Improvement Proposal.

**Upstream contribution and reference integration.** All three pieces are contributed as pull requests to `canton-network/wallet`, matching the repository's code style and test conventions. A reference integration runs end to end against real registry endpoints: set up a pre-approval, watch it approach expiry, renew it, send a Utility Registry token via a parsed payment request, and verify the transfer appears in the unified history. Kept green in CI.

### 3. Architectural Alignment

All three pieces extend the official wallet SDK rather than building a parallel library. None changes the protocol or existing SDK APIs. Pre-approval expiry sits above the existing pre-approval path. Unified history sits above the existing registry read path. Payment request format introduces a new URI scheme but does not touch the ledger. Backward compatible in all three cases.

### 4. Backward Compatibility

Additive only. No changes to existing SDK APIs, on-ledger contracts, or runtime behavior.

---

## Milestones and Deliverables

### Milestone 1 — Pre-approval expiry management
- **Estimated delivery:** 7 weeks from start
- **Focus:** Pre-approvals no longer fail silently.
- **Deliverables:** `getExpiringPreapprovals` helper and `renewPreapproval` call in the SDK token namespace; unit tests; upstream pull request to `canton-network/wallet`. A wallet can surface expiring pre-approvals to the user and renew them without a new factory lookup.

### Milestone 2 — Multi-registry transfer history
- **Estimated delivery:** 13 weeks from start
- **Focus:** One history call across all registries a user holds tokens in.
- **Deliverables:** Unified history interface with per-registry adapters normalising decimals, symbols, and instrument metadata; pagination; upstream pull request. A wallet renders a single transaction list regardless of how many registries are involved.

### Milestone 3 — Payment request format and reference integration
- **Estimated delivery:** 19 weeks from start
- **Focus:** Wallets interoperate on payment requests; all three pieces proven end to end.
- **Deliverables:** Canton payment URI spec (published as a CIP draft); parser and builder in the SDK; upstream pull request; reference integration running end to end in CI covering expiry management, payment request send, and unified history. At least 2 independent wallet teams parsing and generating payment requests using the SDK helpers.

---

## Acceptance Criteria

- Pre-approval expiry tracking and renewal merged into `canton-network/wallet`.
- Unified history interface and per-registry adapters merged into `canton-network/wallet`.
- Payment request format published as a CIP draft; parser and builder merged into `canton-network/wallet`.
- Reference integration runs end to end against real registry endpoints and is kept green in CI.
- At least 2 independent wallet teams use the payment request parser and builder.

Acceptance is based on real SDK usage, not on artifact delivery alone.

---

## Funding

**Total Funding Request:** 600,000 CC

### Payment Breakdown by Milestone
- Milestone 1 (Pre-approval expiry management): 200,000 CC upon committee acceptance
- Milestone 2 (Multi-registry transfer history): 175,000 CC upon committee acceptance
- Milestone 3 (Payment request format and reference integration): 225,000 CC upon committee acceptance of adoption evidence

### Volatility Stipulation
Project duration is under 6 months. If the timeline extends beyond 6 months due to committee-requested scope changes, remaining milestones will be renegotiated to account for CC price movement.

---

## Adoption and Go-to-Market

- All SDK changes land upstream, so every team using the wallet SDK gets them by default.
- The payment request format is proposed as a CIP so any wallet can implement it independently and remain interoperable.
- Direct outreach to wallet teams currently building on the pre-approval work, since payment lifecycle completeness is the next immediate problem for them.
- The reference integration gives teams a known-good path to copy.

---

## Maintenance and Sustainability

The SDK contributions are maintained inside `canton-network/wallet` under its existing process. The payment request CIP is maintained as a Canton standard. Ayush Singh maintains the reference integration and tracks token-standard changes including the V2 token standard.

---

## Motivation

The wallet team is building Utility Registry token pre-approvals now. The moment that lands, three gaps become the next real problem for any wallet team that uses it: silent pre-approval expiry, no unified history across registries, and no interoperability on payment requests. Each gap has been raised in community channels by builders hitting it. Addressing them as a package means the ecosystem gets payment lifecycle completeness once rather than each wallet team solving each piece separately.

---

## Rationale

The three pieces share the same SDK surface and the same integration tests, so bundling them is more efficient than three separate proposals and easier for the committee to evaluate as a coherent scope. Each piece is independently useful but they are most valuable together — a wallet that can send any token, track its pre-approvals, show a unified history, and accept incoming payment requests has a complete feature set. The payment request format in particular has the most ecosystem leverage because it enables interoperability across any wallet that implements the transfer path, including wallets the committee has no direct visibility into.
