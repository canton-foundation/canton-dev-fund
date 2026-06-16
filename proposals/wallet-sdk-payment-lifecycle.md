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

**Multi-registry transfer history.** Add a unified history interface that normalises transaction records across Canton Coin and Utility Registry token registries. The adapter per registry maps amounts to the correct decimal places, attaches instrument metadata (symbol, registry ID, instrument ID), and paginates consistently. A caller gets one list regardless of how many registries a user holds tokens in. This proposal implements the full read surface needed for history independently.

**Payment request format.** Define a Canton payment URI format and ship a parser and builder in the SDK. The URI encodes receiver party ID, registry ID, instrument ID, amount, and optional fields (memo, expiry, nonce). Example: `canton:PARTY_ID?registry=REGISTRY_ID&instrument=INSTRUMENT_ID&amount=10.00&memo=invoice-42`. The builder accepts a token type, amount, and party and returns a valid URI. The parser returns a structured object that feeds directly into the transfer path. The spec is published as a short Canton Improvement Proposal.

**Upstream contribution and reference integration.** All three pieces are contributed as pull requests to `canton-network/wallet`, matching the repository's code style and test conventions. A reference integration runs end to end against real registry endpoints: set up a pre-approval, watch it approach expiry, renew it, send a Utility Registry token via a parsed payment request, and verify the transfer appears in the unified history. Kept green in CI.

### 3. Architectural Alignment

All three pieces extend the official wallet SDK rather than building a parallel library. None changes the protocol or existing SDK APIs. Pre-approval expiry sits above the existing pre-approval path. Unified history sits above the existing registry read path. Payment request format introduces a new URI scheme but does not touch the ledger. Backward compatible in all three cases.

### 4. Backward Compatibility

Additive only. No changes to existing SDK APIs, on-ledger contracts, or runtime behavior.

---

## Milestones and Deliverables

### Milestone 1 — Pre-approval Expiry Management
- **Duration:** Weeks 1–7
- **Deliverables:** `getExpiringPreapprovals` helper and `renewPreapproval` call in the SDK token namespace; unit tests; upstream pull request to `canton-network/wallet`.

| Task | Hours |
|---|---|
| Research existing pre-approval path and expiry logic | 10h |
| Implement `getExpiringPreapprovals(withinDays)` helper | 20h |
| Implement `renewPreapproval` call with factory resolution reuse | 20h |
| Unit tests and edge case coverage | 15h |
| Upstream PR preparation and review cycles | 10h |
| Documentation and inline examples | 5h |
| **Milestone 1 Total** | **80h** |

---

### Milestone 2 — Multi-Registry Transfer History
- **Duration:** Weeks 8–13
- **Deliverables:** Unified history interface with per-registry adapters normalising decimals, symbols, and instrument metadata; pagination; upstream pull request.

| Task | Hours |
|---|---|
| Design unified history interface and adapter pattern | 10h |
| Implement unified history interface | 25h |
| Per-registry adapters (decimals, symbols, instrument metadata) | 20h |
| Pagination implementation with consistent cursor behaviour | 10h |
| Integration tests against Canton Coin and Utility Registry | 15h |
| Upstream PR preparation and review cycles | 10h |
| Documentation and runnable examples | 5h |
| **Milestone 2 Total** | **95h** |

---

### Milestone 3 — Payment Request Format and Reference Integration
- **Duration:** Weeks 14–19
- **Deliverables:** Canton payment URI spec published as a CIP draft; parser and builder in the SDK; upstream pull request; reference integration running end to end in CI.

| Task | Hours |
|---|---|
| Draft Canton payment URI CIP spec | 15h |
| Implement URI builder | 10h |
| Implement URI parser with structured output | 15h |
| End-to-end reference integration (expiry → payment request → history) | 25h |
| CI setup and green-build maintenance | 10h |
| Outreach and onboarding of 2 independent wallet teams | 10h |
| Upstream PR preparation and review cycles | 10h |
| Documentation and integration guide | 5h |
| **Milestone 3 Total** | **100h** |

---

### Milestone 4 — External Security Audit
- **Duration:** Weeks 20–23
- **Deliverables:** Full audit of all SDK additions by an independent third-party security firm; remediation of all critical and high findings; published audit report.

| Task | Hours |
|---|---|
| Audit scope document preparation and briefing | 5h |
| External auditor engagement and coordination | 5h |
| Remediation of critical and high findings | 20h |
| Remediation of medium findings | 10h |
| Re-test and sign-off with auditor | 5h |
| Final audit report publication | 5h |
| **Milestone 4 Total** | **50h** |

---

## Complete Project Roadmap

| Week | Milestone | Focus |
|---|---|---|
| 1 | M1 | Research existing pre-approval path and expiry logic |
| 2–3 | M1 | Implement `getExpiringPreapprovals` helper |
| 4–5 | M1 | Implement `renewPreapproval` call |
| 6 | M1 | Unit tests and edge cases |
| 7 | M1 | Upstream PR and docs — **M1 delivery** |
| 8 | M2 | Design unified history interface and adapter pattern |
| 9–10 | M2 | Implement unified history interface |
| 11 | M2 | Per-registry adapters |
| 12 | M2 | Pagination and integration tests |
| 13 | M2 | Upstream PR and docs — **M2 delivery** |
| 14–15 | M3 | CIP spec draft and URI builder |
| 16 | M3 | URI parser implementation |
| 17–18 | M3 | End-to-end reference integration and CI setup |
| 19 | M3 | Wallet team outreach, upstream PR, docs — **M3 delivery** |
| 20 | M4 | Audit scope prep and auditor briefing |
| 21–22 | M4 | Audit execution and remediation |
| 23 | M4 | Re-test, final report publication — **M4 delivery** |

**Total project duration:** 23 weeks
**Total estimated hours:** 325h

---

## Acceptance Criteria

- Pre-approval expiry tracking and renewal merged into `canton-network/wallet`.
- Unified history interface and per-registry adapters merged into `canton-network/wallet`.
- Payment request format published as a CIP draft; parser and builder merged into `canton-network/wallet`.
- Reference integration runs end to end against real registry endpoints and is kept green in CI.
- At least 2 independent wallet teams use the payment request parser and builder.
- External audit completed with all critical and high findings remediated; audit report published.

Acceptance is based on real SDK usage, not on artifact delivery alone.

---

## Funding

**Total Funding Request:** 600,000 CC

### Payment Breakdown by Milestone

| Milestone | Deliverable | Hours | CC |
|---|---|---|---|
| M1 — Pre-approval expiry management | SDK helpers + upstream PR | 80h | 150,000 CC |
| M2 — Multi-registry transfer history | Unified history + adapters | 95h | 150,000 CC |
| M3 — Payment request format | CIP + SDK + reference integration | 100h | 175,000 CC |
| M4 — External security audit | Audit + remediation + report | 50h | 125,000 CC |
| **Total** | | **325h** | **600,000 CC** |

Payment for each milestone is triggered upon committee acceptance of that milestone's deliverables.

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
