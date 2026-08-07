# Defero — Scheduled & Deferred Token Transactions for Canton

*A token standard **and** the execution infrastructure that runs it — letting Canton token transactions be scheduled now and executed automatically later. The "deferred transactions" primitive Canton is missing.*

- **Author:** DIGIAPP LLC (kekpool)
- **Status:** Draft
- **Created:** 2026-08-05
- **Duration:** 14 weeks
| **Website** | https://kekpool.com | https://gohash.cc
- **Label:** `token-asset-standards`
- **Champion:** need Champion

---

## Abstract

Defero lets anyone create a **deferred token transaction** on Canton: a transfer that is set up now but executes automatically at a future time or when a condition is met — for example "pay this on the 1st of next month," "release these tokens when vesting ends," or "settle once both sides have approved."

Defero delivers two tightly-coupled parts together: **a token standard** — a backward-compatible extension to the Canton Network Token Standard that expresses a persistent, funded, condition-gated transfer as an on-ledger contract — and the **execution infrastructure** that runs those transactions when they become due (a reference execution-node network with a public API and a generic adapter). Everything is managed directly through the Daml contracts (via the Ledger API) or the node's API — no separate wallet SDK is required. The underlying asset stays an ordinary Token Standard asset; existing wallets display and transfer it unchanged. Defero replaces the bespoke schedulers that issuers, wallets, and settlement applications build today with one shared standard and one interoperable execution network, all open-source.

---

## Specification

### 1. Objective

Provide Canton with a single missing primitive — **reliable deferred (scheduled and condition-gated) settlement of Token Standard assets** — as a shared standard plus the infrastructure that executes it.

Canton contracts never execute themselves. A contract with a "settle after time T" field does nothing when T arrives; it sits on the ledger until an external application submits a command. This keeps Canton deterministic and scalable, but it makes all timed and conditional settlement an application-layer responsibility. Today every team that needs it — coupon payments, vesting, escrow, payroll, treasury sweeps, delivery-versus-payment — rebuilds the same scheduler, submitter, retry logic, idempotency, and high-availability infrastructure, in incompatible and non-interoperable ways. The intended outcome is that any Token Standard asset can carry a standardized deferred instruction, and any authorized operator can run infrastructure that settles it reliably, so this stops being rebuilt per application.

### 2. Implementation Mechanics

Deliverables are organized into two workstreams that run in parallel across the milestones.

**Workstream A — Deferred Token Standard (on-ledger, Token Standard extension).**
- A **deferred-transfer interface** carrying the instrument, sender, receiver, amount, an earliest-execution time and optional expiry, and four policies — **executor**, **approval**, **funding**, and **condition**. An `Execute` choice (executor-controlled) re-validates time and condition on-ledger; a `Cancel` choice ends it early. Because correctness is re-checked in `Execute`, an off-ledger scheduler can only *propose* a valid settlement, never force an invalid one.
- **Supporting contracts:** `DeferoTransferRequest`, `DeferoAllocation`, `DeferoApproval`, `ExecutorRegistration`, `ExecutionClaim`, `DeferoExecutionReceipt`. Lifecycle: *created → funded → (approved) → executable → executed | cancelled | expired*, each transition an on-ledger event.
- **Two funding modes:** *reserved* (tokens placed in a Token Standard allocation up front — guaranteed settlement, capital locked) and *just-in-time* (nothing locked; sourced at execution time — best-effort). The mode is exposed in the interface so wallets show the correct guarantee level.
- **Three authorization models:** named executor; executor set with threshold; and open executor with a per-instruction on-ledger capability (recommended) — scoped to one asset, amount, recipient, window, and condition, never a wallet-wide allowance.
- **Deterministic, ledger-verifiable conditions:** at/after a time, within a window, after N approvals, after another contract or allocation is available, after another Defero instruction completes, and recurring calendar schedules.

**Workstream B — Execution Infrastructure (off-ledger).**
- A reference **execution node** running beside a validator/participant — **not** a new Canton protocol node: **scheduler**, **contract indexer**, **policy evaluator**, **transaction builder**, **submission worker**, **retry engine**, and **public/management API**.
- **Management via contracts and API — no separate SDK.** Instructions are created, cancelled, and approved directly as Daml contracts and choices through the Ledger API; the node's public API exposes instruction status, executor registration/discovery, and receipts.
- **Redundant, decentralized execution:** multiple nodes may serve one instruction; a short-lived `ExecutionClaim` plus on-ledger idempotency make redundancy and fail-over safe against double-settlement.
- **Executor registry** so operators are discoverable, seeding an interoperable network rather than a single operator.
- **Generic adapter** that translates Defero instructions into ordinary Allocation/Transfer operations for registries with no native support — so it works against assets that exist today.

```
Token Standard Registry  →  Defero Settlement Contracts (A)  →  Defero Execution Nodes (B)
   Holding/Allocation/Transfer     window · funding · conditions       observe · build · submit · retry · receipt
```

### 3. Architectural Alignment

Defero extends the Canton Network Token Standard rather than competing with it: every deferred operation references a Token Standard instrument and settles through the standard Transfer/Allocation APIs, so no issuer mints a special "deferred token." It is expressed as Daml **interfaces**, the compatibility mechanism the Token Standard itself relies on, so existing templates can gain deferred behaviour through interfaces and contract upgrades. It respects Canton's **passive-ledger** design — the network takes on no scheduling or consensus role; execution stays in an application-level node. It preserves Canton's **privacy and authorization** model — instructions are visible only to entitled parties, and executors receive only per-instruction, least-authority capabilities.

### 4. Backward Compatibility

No breaking impact; the layer is strictly additive. Compatibility is defined in levels so no issuer is forced to upgrade: **Level 1 (required)** references a Token Standard instrument and settles through the standard APIs — works with assets that exist today; **Level 2 (optional)** lets a registry add native deferred factories for efficiency; **Level 3** is a generic adapter that translates Defero instructions into ordinary Allocation/Transfer operations for registries with no native support. Existing wallets continue to display and transfer the underlying asset unchanged.

---

## Security Considerations

- **On-ledger enforcement of correctness.** Timing and conditions are re-checked inside the `Execute` choice, so a compromised, buggy, or malicious off-ledger scheduler can only *propose* a valid settlement — it can never force one that is early, expired, or condition-unmet.
- **Least-authority executors.** An executor receives only a per-instruction capability scoped to one asset, amount, recipient, window, and condition; it never holds a reusable, wallet-wide spending allowance. Every choice remains permissioned to its declared controllers.
- **No double-settlement.** A short-lived `ExecutionClaim` plus on-ledger idempotency ensure that redundant nodes serving the same instruction, and retries after failures, settle it at most once.
- **Funding guarantee levels.** Reserved funding locks tokens up front (guaranteed settlement); just-in-time funding is best-effort and can fail if balance is insufficient. The mode is exposed in the interface so wallets/applications surface the correct guarantee to users rather than assuming settlement.
- **Privacy.** Instructions and their state are visible only to entitled parties under Canton's authorization model; a node serves only the parties that authorized it.
- **Bounded lifetime.** Every instruction has an earliest-execution time and optional expiry; expired instructions cannot execute, and cancellation is controlled by designated parties.
- **External conditions excluded in v1.** A node is never trusted to assert an off-ledger fact. Only deterministic, ledger-verifiable conditions are supported; external conditions, when added later, are consumed exclusively as verifiable on-ledger attestations.
- **Liveness / no single point of failure.** The open-executor model and redundant nodes mean settlement does not depend on any single operator remaining online.

---

## Milestones and Deliverables

### Milestone 1: Specification & working proof of concept
- **Estimated Delivery:** Week 4
- **Focus:** Publish the draft standard and prove it end-to-end with a working minimal path.
- **Deliverables / Value Metrics:**
  - (A) Specification extending the Token Standard — deferred-transfer interface, funding modes, authorization models, condition set, layered compatibility — plus a Defero-to-Token-Standard implementation-relationship map.
  - (A) Minimal on-ledger implementation: a `DeferoTransferRequest` with reserved funding and a time condition, plus the `Execute` and `Cancel` choices.
  - (B) Execution-node walking skeleton (indexer + scheduler + submission worker) that automatically settles that minimal deferred transfer on a Canton test environment; public Apache-2.0 repository initialized.
  - *Value:* by week 4 a scheduled token transfer can already be created and auto-settled end-to-end on a test network — a working result, not just a document.

### Milestone 2: Full standard & execution-node core
- **Estimated Delivery:** Week 8
- **Focus:** Extend the proof of concept to the complete, correct v1 standard and a node that settles all of it.
- **Deliverables / Value Metrics:**
  - (A) All v1 contracts; both funding modes; all three authorization models; the full deterministic condition set; test suite with negative tests proving `Execute` rejects out-of-window, expired, and unmet-condition submissions.
  - (B) Complete execution-node core (scheduler, indexer, policy evaluator, transaction builder, submission worker, retry engine) settling both reserved- and JIT-funded instructions across the full condition set on a Canton test environment.
  - *Value:* every deferred-transaction variant in scope can be created and automatically settled end-to-end.

### Milestone 3: Redundancy, management API & generic adapter
- **Estimated Delivery:** Week 12
- **Focus:** Reliability, interoperability, and real-world use cases.
- **Deliverables / Value Metrics:**
  - (A) Executor registry and open-executor capability finalized; multi-party approval and cancellation flows.
  - (B) Redundant execution via `ExecutionClaim` (idempotency demonstrated under concurrent nodes and induced failures); node public/management API (status, executor discovery, receipts); generic adapter.
  - Worked examples: vesting, payroll, escrow, delivery-versus-payment.
  - *Value:* multiple independent operators can serve the same instructions safely, and the standard runs against assets that exist today.

### Milestone 4: Security hardening, stable release & handover
- **Estimated Delivery:** Week 14
- **Focus:** Production readiness and open-source public good.
- **Deliverables / Value Metrics:**
  - (A+B) Security hardening and internal review of the Daml package and node authority model, with all identified high/critical issues remediated; reproducible reference deployment; operator and integration guides.
  - Full stable release under Apache-2.0; standardization path documented.
  - *Value:* a hardened, reusable standard and infrastructure any ecosystem participant can adopt and operate.

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on value delivered to the ecosystem, not the delivery of an artifact:

- The standard is published as an open specification and accepted for community review, extending (not duplicating) the Canton Network Token Standard.
- A Committee member can create a deferred transaction and observe it settle automatically on a Canton test environment, in both reserved and just-in-time funding modes.
- The four reference workflows (vesting, payroll, escrow, delivery-versus-payment) are demonstrably settled through Defero.
- Redundant execution nodes serving the same instruction never double-settle, demonstrated under induced failures.
- At least one third-party operator can stand up and run an execution node from the public documentation.
- Security hardening completed with all identified high/critical issues remediated; all code released under Apache-2.0.

---

## Funding

**Total Funding Request:** 800,000 CC

### Payment Breakdown by Milestone
- Milestone 1 (Specification & working proof of concept): 160,000 CC (20%) upon committee acceptance
- Milestone 2 (Full standard & execution-node core): 240,000 CC (30%) upon committee acceptance
- Milestone 3 (Redundancy, management API & generic adapter): 240,000 CC (30%) upon committee acceptance
- Milestone 4 (Security hardening, stable release & handover): 160,000 CC (20%) upon final release and acceptance

### Volatility Stipulation
The project duration is under 6 months. Should the timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones will be renegotiated to account for significant USD/CC price volatility.

---

## Co-Marketing

Upon release, DIGIAPP LLC will collaborate with the Foundation on:
- Announcement coordination for the standard and the reference implementation.
- A technical blog / case study covering deferred settlement and the execution-node network.
- Developer and operator promotion, including guidance for third parties running execution nodes.

---

## Motivation

Deferred and standing settlement is a foundational financial primitive: scheduled coupon payments, vesting and lockups, recurring distributions, payroll and supplier payments, delivery-versus-payment, treasury sweeps, margin top-ups, multi-party approvals, escrow release, and corporate-action distributions. On Canton today each of these is a bespoke automation project, and none interoperate. Because deferred settlement underpins a large share of institutional financial workflows — essentially any application that issues or settles a Token Standard asset on a schedule or on a condition — the addressable benefit is broad: Defero turns each of these from a custom scheduler into a few lines against a shared standard, lowers the barrier for regulated institutions building on Canton, and makes deferred obligations portable across every Token Standard asset instead of siloed per issuer and per wallet.

---

## Rationale

The weak framing — "Canton cannot schedule token transfers" — is false; Canton can model scheduled workflows in Daml, and a thin "execute-after-T" template would merely duplicate the Allocation API. Per the fund's default, the right approach is to **extend what exists** rather than replace it: Defero layers on the Canton Network Token Standard through interfaces, reuses the Allocation API for reserved funding, and settles through the standard Transfer/Allocation APIs. What the Token Standard does *not* provide — and what cannot be obtained by extending the Allocation API alone — is a standardized, discoverable *intent* with funding and condition policies, plus an interoperable network that reliably executes it; those are the pieces this proposal adds. Alternatives considered were rejected: per-application schedulers (the status quo) produce incompatible, non-interoperable silos; Daml Triggers and one-off automation services solve execution for a single app but establish no shared standard, no discovery, and no redundancy. Anchoring correctness on-ledger, granting executors least-authority capabilities, and providing a redundant off-ledger network with a generic adapter is the combination that delivers the value while remaining fully backward-compatible.

---

## Non-Goals

This grant will not deliver: arbitrary cron/temporal grammars beyond simple recurring schedules; price oracles or other external-condition sources; multi-step workflow graphs; executor penalty/slashing or bonding; cross-synchronizer execution; or consumer "send money tomorrow" UX. External conditions, when added later, will be consumed only as verifiable on-ledger attestations — never as node-local claims. The execution infrastructure is a general primitive that future standards (escrow, vesting, subscription, auction, governance) can reuse; that generalization is a candidate for a separate follow-up proposal once v1 is adopted.

