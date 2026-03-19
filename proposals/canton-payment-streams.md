## Development Fund Proposal: Canton Payment Streams — Continuous Token Streaming, Vesting, and Programmable Payment Flows for Canton

- **Author:** Deepthi
- **Status:** Submitted
- **Created:** 2026-03-15

---

## Abstract

This proposal requests funding for an open-source **continuous payment streaming reference implementation** for Canton Coin and one named CIP-56 asset path on Canton.

Payment streaming is common on other networks, but there is no shared open-source implementation for Canton today. This proposal brings that missing building block to Canton using Daml for privacy, authorization, and time-based accrual.

The proposed project, **Canton Payment Streams**, will provide:

- per-second continuous token streaming between parties
- configurable vesting schedules with cliff support, linear unlock, and stepped curves
- multi-recipient stream splitting for payroll and contributor compensation
- cancellable and non-cancellable stream modes
- renewable fixed-term stream flows for subscription-style and retainer-style payments
- a TypeScript SDK for programmatic stream management
- a thin reference web dashboard for creating, monitoring, and withdrawing from streams
- full privacy preservation — stream terms, rates, and balances are visible only to authorized parties

The goal is to deliver a reusable streaming primitive for Canton that teams can adopt without building the core contract and SDK layer themselves. Phase 1 is intentionally scoped to prefunded, fixed-duration streams on Canton Coin and one named CIP-56 token path, with **USDCx** as the v1 reference token.

The target use cases are straightforward: payroll-style payouts, vesting schedules, recurring service payments, and other cases where value should unlock over time instead of moving as a single lump sum.

---

## Specification

### 1. Objective

The objective is to make payment streaming available as reusable open-source infrastructure on Canton, so teams do not have to build the core contract, SDK, and dashboard pieces from scratch.

The intended outcome is that a Canton developer or team can:

- create a stream that pays a contributor 10,000 CC over 6 months, starting after a 1-month cliff
- set up payroll streaming for a team of 15, each receiving per-second salary disbursement
- configure a renewable 30-day subscription-style stream with explicit prefunding and renewal
- vest investor tokens on a stepped monthly schedule with automatic unlock
- compose streaming payments with other Canton contracts atomically

and the system will:

- enforce all streaming logic on-ledger through Daml templates
- guarantee that recipients can withdraw accrued amounts at any time up to the prefunded, unwithdrawn balance
- ensure stream terms and balances remain private to authorized parties only
- provide clear SDK methods and dashboard UI for all operations
- produce a complete audit trail without exposing private details to non-parties

This proposal treats payment streaming as shared ecosystem infrastructure — a reusable primitive, not a commercial product.

### 2. Implementation Mechanics

The project will be delivered as:

- a set of Daml smart contract templates for stream lifecycle management
- a TypeScript SDK for creating, querying, and managing streams
- a thin React-based reference dashboard for visual stream management
- a small reference proxy for browser-safe access where direct participant connectivity is not appropriate
- integration examples and developer documentation

Phase 1 is intentionally scoped to **prefunded, single-domain streams** that settle using existing CIP-56 token transfer primitives. The initial reference implementation will target Canton Coin and **USDCx** as the named reference CIP-56 token path before broadening to wider token coverage. Cross-domain flows, credit-based perpetual streams, and non-prefunded debt models are out of scope.

#### A. Token Custody and Settlement Model

The project will use a prefunded escrow model rather than a credit or debt model:

- the sender locks a prefunded CIP-56 token balance into a stream contract at creation time
- the stream contract tracks total deposited, total withdrawn, and the deterministic amount accrued over time
- each `Withdraw` choice transfers only the accrued, unwithdrawn portion from escrow to the recipient
- each `Cancel` or `Complete` choice atomically settles the amount owed to the recipient and returns any unaccrued remainder to the sender
- no stream can promise more than the prefunded escrowed amount

This keeps the design aligned with Canton and CIP-56 asset semantics and avoids introducing off-ledger credit assumptions.

#### B. Reference Contract Design

The initial reference design is intentionally simple and invariant-driven.

**1. StreamEscrow template**

The primary on-ledger contract is a `StreamEscrow` template holding:

- sender party
- recipient party
- optional observers
- token reference / settlement path
- total deposited amount
- total withdrawn amount
- stream start time
- optional cliff time
- stream end time
- vesting / accrual mode (`Linear`, `CliffLinear`, `Stepped`, `RenewableTerm`)
- cancellable flag
- stream status (`Active`, `Completed`, `Cancelled`)

`StreamEscrow` is the source of truth for:

- how much has been prefunded
- how much has vested / accrued at the current ledger time
- how much remains withdrawable
- how much remains refundable to the sender

**2. StreamGroup template**

`StreamGroup` is a management convenience contract for batch operations such as payroll. It groups related stream contract IDs and metadata, but does not replace the individual stream escrow contracts or their settlement rules.

**3. Settlement adapter boundary**

The implementation will keep token-transfer logic behind a narrow settlement adapter boundary that uses the existing CIP-56 transfer path. This keeps the streaming math and lifecycle logic separate from token movement details and makes it easier to verify correctness for the initial reference token path.

For v1, the named reference CIP-56 integration is **USDCx**. This is a deliberate scope choice. The stream engine itself is intended to remain token-agnostic, but CIP-56 assets can still differ in how transfer creation, holder acceptance, and settlement references are exposed by the surrounding wallet and registrar stack. The proposal therefore aims to prove one production-grade CIP-56 integration well rather than overclaim broad support too early.

For additional tokens, the intended adoption path is that teams do **not** fork the stream engine. In the common case, onboarding a new token should mean:

- configuring the instrument metadata
- pointing Canton Payment Streams at the correct transfer adapter
- wiring the host wallet's transfer-create and holder-accept paths
- confirming the settlement reference format used for finalize and withdraw

USDCx is chosen because it demonstrates the value of non-CC streaming directly and forces the proposal to prove the more operationally complex CIP-56 path rather than leaving it abstract.

**4. Choice model**

The initial choice set is:

- `Create` / initialization flow for prefunded stream creation
- `Withdraw` controlled by the recipient
- `Cancel` controlled by the sender for cancellable streams
- `MutualCancel` requiring both sender and recipient
- `Renew` / `TopUp` for renewable-term streams
- `Complete` when the stream is fully settled

**5. Core invariants**

The design will be implemented and tested against a small set of explicit invariants:

- `0 <= totalWithdrawn <= accrued(now) <= totalDeposited`
- `refundable(now) + withdrawable(now) + alreadyWithdrawn = totalDeposited`
- accrued amount is monotonic in ledger time
- once `Cancelled` or `Completed`, no further withdrawal is possible
- no withdrawal or cancellation path can create a negative remaining balance
- renewable-term top-ups must increase available prefunded balance before new accrual can be claimed

These invariants are the heart of the implementation and also the heart of the security story.

#### C. Daml Streaming Templates

The core of the project is a set of Daml templates that model the full lifecycle of a payment stream:

**Stream creation:**
- sender deposits a prefunded CIP-56 token balance into a stream contract specifying recipient, total amount, duration, start time, and optional cliff
- the ledger enforces that the sender has authorized the deposit and the recipient is a valid party
- stream parameters are recorded immutably on creation; visible only to sender, recipient, and explicitly added observers

**Accrual and withdrawal:**
- accrued amounts are calculated deterministically based on elapsed time, stream rate, and vesting curve
- recipients can exercise a `Withdraw` choice at any time to claim accrued, unwithdrawn tokens up to the prefunded stream balance
- no external oracle, keeper, or liquidator network is required — Daml's ledger time provides the temporal reference

**Cancellation and refund:**
- cancellable streams allow the sender to exercise a `Cancel` choice, which calculates the accrued amount owed to the recipient, transfers it, and returns the remainder to the sender
- non-cancellable streams omit the `Cancel` choice entirely, enforced at the template level
- mutual cancellation is also supported, requiring both parties to consent

**Stream types:**

| Stream Type | Behavior | Use Case |
|---|---|---|
| Linear | Fixed rate per second from start to end | Payroll, simple vesting |
| Cliff + Linear | Zero accrual until cliff date, then linear | Team/investor vesting |
| Stepped | Fixed amount unlocked at regular intervals | Monthly grant disbursement |
| Renewable Term | Fixed-duration stream that can be renewed or topped up explicitly before expiry | Subscriptions, retainers |

**Multi-recipient streams:**
- a single funding source can create multiple streams in a batch operation
- a `StreamGroup` template tracks related streams (e.g., a team payroll batch) for management convenience
- each individual stream remains a separate contract with independent withdrawal rights

#### D. Authorization and Privacy Model

Canton Payment Streams leverages Daml's native authorization model rather than reimplementing access control:

- **Sender (signatory):** creates the stream, deposits funds, can cancel (if cancellable)
- **Recipient (signatory):** can withdraw accrued funds, must consent to stream creation
- **Observer (optional):** can view stream status but cannot modify it — useful for compliance, treasury oversight, or auditing

Privacy guarantees:

- stream terms (rate, total, cliff date) are visible **only** to signatories and observers
- no global state exposure — unlike Ethereum, where anyone can read stream parameters from on-chain storage
- withdrawal and settlement visibility follow Canton party and observer visibility rules rather than public-chain global visibility
- this makes Canton Payment Streams suitable for salary streaming, where compensation amounts must remain confidential

This is a fundamental advantage over public-chain streaming systems where all stream parameters are publicly visible on-chain.

#### E. TypeScript SDK

The SDK provides programmatic access to all stream operations:

```
// Create a linear stream
const stream = await client.createStream({
  recipient: "party::alice",
  token: "CC",
  totalAmount: 10000,
  durationSeconds: 180 * 86400,  // 6 months
  cliffSeconds: 30 * 86400,      // 1-month cliff
  cancellable: true,
});

// Check accrued balance
const balance = await client.getAccruedBalance(stream.contractId);

// Withdraw accrued tokens
await client.withdraw(stream.contractId);

// Cancel stream (returns remainder to sender)
await client.cancel(stream.contractId);

// Create batch payroll
const payroll = await client.createBatch([
  { recipient: "party::alice", totalAmount: 5000, duration: 30 * 86400 },
  { recipient: "party::bob",   totalAmount: 7500, duration: 30 * 86400 },
  { recipient: "party::carol", totalAmount: 6000, duration: 30 * 86400 },
]);
```

The SDK will:
- connect to a Canton participant node via the Ledger API
- handle Daml command submission, contract ID tracking, and event streaming
- provide TypeScript types generated from the Daml templates
- support both Node.js (server-side) and browser (via JSON API) environments

#### F. Web Dashboard

A React-based dashboard for non-programmatic stream management:

- **Create stream:** form-based stream creation with token selection, recipient lookup, duration, cliff, and curve type
- **Active streams:** table view of all streams where the user is sender or recipient, showing real-time accrued amounts, withdrawal history, and time remaining
- **Withdraw:** one-click withdrawal of accrued balance from any stream
- **Cancel:** cancel a cancellable stream with confirmation dialog showing the settlement breakdown
- **Batch payroll:** CSV upload for bulk stream creation (recipient, amount, duration per row)
- **Stream detail:** individual stream view showing accrual curve visualization, transaction history, and contract metadata

The dashboard will connect through standard Canton participant / JSON API access and authenticate via the existing Canton identity infrastructure. For privacy-sensitive deployments, the expected mode is self-hosted or operator-managed deployment behind standard Canton auth rather than a fully public client.

#### Explicitly Out of Scope

To keep the project focused and avoid overlap with existing ecosystem tools:

- **production identity provider** — the project uses Canton's existing identity and party management, not its own auth system
- **stablecoin issuance** — streams can carry any CIP-56 token; the project does not issue or manage stablecoins
- **lending, borrowing, or yield** — streaming is a payment primitive, not a DeFi protocol
- **subscription billing platform** — Cantara already provides subscription billing; this project provides the lower-level streaming primitive that platforms like Cantara could optionally adopt
- **cross-network bridging** — streams operate within a Canton domain; cross-domain streaming is a future extension
- **credit-based perpetual streams** — phase 1 supports prefunded fixed-duration or explicitly renewable streams only
- **mobile application** — the dashboard targets desktop browsers; mobile can be added later
- **Featured App Rewards optimization** — the proposal does not rely on rewards from recurring `Withdraw` actions and does not include rewards-related anti-abuse design in scope

#### Relationship to Existing Ecosystem

This proposal complements existing Canton ecosystem tools:

- it does **not** replace Cantara — Cantara provides subscription billing UX; Canton Payment Streams provides the underlying streaming primitive
- it does **not** replace the Wallet SDK — streams interact with token holdings managed through the standard CIP-56 token interface
- it does **not** compete with Denex Gas Station — gas management and payment streaming are orthogonal concerns
- it does **not** require changes to the Canton protocol, Global Synchronizer, or validator behavior
- it **does** provide a reusable building block that other ecosystem projects can compose with

#### Future Extensions Roadmap

The following items are intentionally positioned as follow-on extensions rather than phase 1 deliverables:

- **policy-based delegated automation:** allow a sender or treasury operator to authorize a delegate or automation agent to perform bounded actions such as renewals, top-ups, pause/resume flows, or scheduled settlements under explicit policy constraints, spending limits, and party visibility rules
- **conditional stream controls:** support policy gates tied to milestones, approvals, or service-delivery conditions before certain actions can execute
- **cross-domain streaming research:** evaluate how the reference model could evolve beyond a single-domain settlement path once the base primitive is proven

Positioning these as roadmap items keeps the initial grant focused on the core streaming primitive while showing a credible path toward more advanced treasury and automation workflows.

### 3. Operational Model and Maintenance

The core stream logic lives on-ledger in Daml. Around that, the reference implementation ships the client pieces needed to use it in practice:

- Daml templates run on a Canton participant node and remain the source of truth for stream state
- the TypeScript SDK can be used directly from server-side applications
- the dashboard can be self-hosted and can connect either through JSON API or the reference proxy, depending on the deployment model
- no keeper network, liquidator bots, or external oracle dependencies are required
- the release artifacts are a Daml package, npm SDK, reference dashboard, reference proxy, reproducible demo environment, and operator/developer documentation

Post-release maintenance:

- the Daml templates are the source of truth; they can be upgraded through standard Daml package versioning
- the SDK and dashboard follow standard open-source maintenance (dependency updates, bug fixes)
- community contributions can extend stream types, add new curve models, or build integrations
- the final milestone includes a 90-day post-release bug-fix and documentation window so early adopters can report issues before the project transitions to normal community maintenance

### 4. Demo Environment Plan

The project will ship with a reproducible demo environment so reviewers and developers can verify the primitive end to end.

The demo plan includes:

- a local Canton sandbox with one reference CIP-56-compatible token path and seeded test balances
- two primary demo personas: `employer` / `recipient` for payroll-style streams and `issuer` / `beneficiary` for vesting-style streams
- scripted example flows for:
  - linear payroll stream creation and partial withdrawal
  - cliff-plus-linear vesting stream with post-cliff withdrawal
  - cancellable stream settlement and refund
  - renewable-term subscription-style stream creation and renewal
  - batch payroll creation for at least 5 recipients
- one public testnet demonstration deployment showing at least one prefunded stream lifecycle from creation through withdrawal
- walkthrough documentation that explains setup, seeded balances, expected outputs, and verification steps

The local demo will be the primary acceptance environment. The testnet deployment is intended as a public reference environment, not as a production service commitment.

### 5. Adoption and Validation Plan

This proposal is stronger if it demonstrates not only technical completeness but practical ecosystem usefulness.

The validation plan includes:

- publish at least three end-to-end reference walkthroughs covering payroll, vesting, and renewable-term payments
- run at least two feedback sessions with Canton ecosystem builders or operators and publish a short summary of the feedback incorporated before final release
- publish at least one reference integration example or implementation guide showing how streaming composes with another Canton workflow such as escrow, milestone payments, or treasury operations
- document the boundaries of phase 1 clearly so follow-on requests can be evaluated separately instead of being implied in the initial grant

These validation activities are designed to create reusable artifacts for the ecosystem even if early production adoption remains limited.

Early ecosystem conversations indicate relevance for teams such as `Gateway.fm`, `Lumens.fi`, and `Hashrupt`, all of which have workflow shapes that could benefit from reusable streaming infrastructure. There has also been positive exploratory feedback from people around `Copper`, especially for vesting-oriented and custody-adjacent workflows, although formal adoption would naturally depend on a working implementation. Cantara and the DA Utility are natural downstream integration targets, but they are not treated as milestone dependencies in the current proposal.

### 6. Architectural Alignment

This proposal aligns with the Development Fund priorities:

- **developer tooling:** provides a reusable primitive that saves every team from building custom payment logic
- **ecosystem growth:** payment streaming is a proven adoption driver on other networks (Sablier, Superfluid); bringing it to Canton fills a gap
- **institutional readiness:** privacy-preserving streaming is directly relevant to salary, vesting, and vendor payment use cases that Canton's institutional users need
- **composability:** the Daml template design allows streams to be composed with other contracts (escrow, service agreements, milestone-based payments) atomically
- **open source:** all deliverables are released under Apache 2.0

### 7. Delivery Feasibility

This proposal is technically grounded in familiar patterns:

- payment streaming itself is a well-understood primitive
- Daml's authorization, privacy, and time semantics fit the core contract model well
- the initial version stays within a prefunded, single-domain settlement model
- the SDK, dashboard, and proxy follow normal TypeScript/React service patterns rather than introducing new protocol work

Each milestone produces independently usable artifacts: Daml templates can be used without the SDK, the SDK can be used without the dashboard.

The contract design is also deliberately sequenced to reduce implementation risk:

1. prove escrow invariants for a single stream type first
2. add cancellable / non-cancellable settlement paths
3. add stepped and cliff logic
4. add renewable-term top-up behavior
5. add batch/group orchestration and UI last

This sequencing is also intended to keep the funding request cost-effective: the most reusable on-ledger artifacts arrive first, while the dashboard and broader ecosystem validation are pushed to the end.

### 8. Risks and Mitigations

- **Ledger time precision:** Canton's ledger time has bounded skew relative to wall-clock time. Streaming calculations will use ledger time consistently and document the precision guarantees. For most use cases (payroll, vesting), second-level precision is more than sufficient.
- **Token standard compatibility:** The project will target CIP-56 tokens through an explicit prefunded escrow/transfer settlement path, starting with Canton Coin and **USDCx** as the named reference CIP-56 token. CIP-56 support is intentionally proven through one concrete reference integration because transfer creation, holder acceptance, and settlement references can vary across token-hosting stacks. If the token standard evolves, the Daml templates can be updated through standard package versioning.
- **Open-ended stream complexity:** Phase 1 avoids perpetual underfunded streams by limiting the initial release to prefunded fixed-duration and renewable-term streams.
- **Overlap with Cantara:** The proposal explicitly scopes Canton Payment Streams as a lower-level primitive, not a billing platform. Cantara could optionally adopt streaming contracts as an implementation detail, but neither project depends on the other.
- **Dashboard auth and deployment:** the dashboard will assume standard Canton auth and operator-managed deployment patterns for privacy-sensitive use cases rather than requiring a universally public static client model.
- **Demo realism:** the initial demo environment will target one reference token path and one public testnet flow to keep the release verifiable without overpromising broad production coverage on day one.
- **Security review scope:** milestone 3 includes a documented threat model, invariant verification, adversarial test cases, internal hardening review, and explicit validation by an experienced Daml/Canton ecosystem team before the release is positioned as mainnet-ready. Once the implementation stabilizes, external review scope can be priced against the actual code and reference token path rather than estimated prematurely.
- **Featured App Rewards abuse risk:** Featured App Rewards are not part of the current proposal scope or economic justification. If reward linkage to recurring `Withdraw` actions is ever explored, it should be treated as a separate workstream with explicit anti-abuse analysis.
- **Daml upgrade path:** If Daml template interfaces change in a future SDK version, the streaming templates can be migrated using Daml's standard upgrade mechanisms.
- **Adoption uncertainty:** the project may ship before broad market pull is proven on Canton. The proposal mitigates this by delivering a reusable reference package, demo environment, and integration guides that remain valuable as ecosystem infrastructure even if adoption ramps gradually.

### 9. Backward Compatibility

No backward compatibility impact.

This is a new set of Daml templates and client tooling. It does not modify existing Canton protocol behavior, token standards, or participant node operations.

### 10. Technical Comparison: Why Canton Is Better Suited Than EVM

| Aspect | EVM Streaming (Sablier/Superfluid) | Canton Payment Streams |
|---|---|---|
| **Privacy** | All stream parameters publicly visible on-chain | Sub-transaction privacy — only authorized parties see stream terms |
| **Authorization** | Solidity `require` checks; callback-driven designs need careful reentrancy and access-control handling | Daml signatory/controller model enforced by ledger runtime; avoids the callback-style reentrancy class common in EVM designs |
| **Time handling** | Block timestamps with miner manipulation risk | Bounded ledger time with causal monotonicity guarantees |
| **Liquidation** | Requires external liquidator networks (Superfluid) or debt tracking (LlamaPay) | No liquidation needed — authorization model prevents unauthorized state changes |
| **Composability** | Separate contract calls with atomicity risk | Atomic multi-contract transactions guaranteed by Canton protocol |
| **Auditability** | Public but noisy — all transactions visible to everyone | Private audit trail — full history available to authorized parties only |
| **Institutional workflows** | Limited confidentiality; typically needs off-chain privacy/compliance layers | Better aligned with confidential and regulated workflows through Canton privacy and selective observer models |

---

## Milestones and Deliverables

### Milestone 1: Public OSS Repo, Threat Model, and CC Reference Flow

A new evaluator can clone the open-source repository, run the sandbox, create streams, and validate lifecycle behavior for the base stream types from published documentation alone.

- **Estimated Delivery:** 3 weeks
- **Focus:** public OSS repo, license, architecture, threat model, CC reference flow, and integrator docs
- **Deliverables / Value Metrics:**
  - public GitHub repository published under Apache 2.0 with initial project structure, contribution guide, and milestone tracking
  - architecture note and initial threat model for the escrow, withdrawal, and settlement model
  - Daml templates for linear and cliff+linear stream types
  - explicit prefunded CIP-56 escrow and settlement path
  - stream lifecycle: create, withdraw, cancel, mutual-cancel, complete
  - non-cancellable stream variant
  - Daml test scripts covering the base stream types and edge cases, including zero cliff, full withdrawal, partial cancel, and expired-stream behavior
  - CLI tool for stream creation, status query, and withdrawal via Canton Ledger API
  - reproducible local sandbox demo with seeded balances and scripted payroll and vesting flows for the Canton Coin reference path
  - initial integrator documentation for the Canton Coin reference flow
  - contract and demo coverage for the milestone-1 stream lifecycle surface

### Milestone 2: USDCx Reference Integration and Generic CIP-56 Adapter Path

An external builder should be able to use the SDK, examples, and docs to test payroll, vesting, or subscription-style workflows, including the named USDCx reference integration.

- **Estimated Delivery:** 3 weeks
- **Focus:** USDCx reference integration, generic CIP-56 adapter path, and onboarding docs for new tokens
- **Deliverables / Value Metrics:**
  - stepped and renewable-term stream types added on top of the verified base templates
  - multi-recipient batch stream creation template
  - StreamGroup management template for payroll and team compensation
  - TypeScript SDK packaged for npm distribution with full type safety
  - SDK methods: createStream, createBatch, getAccruedBalance, withdraw, cancel, listStreams, getStreamHistory
  - support for both gRPC (Ledger API) and HTTP (JSON API) transport
  - event subscription for real-time stream state updates
  - named **USDCx** reference integration demonstrating the CIP-56 settlement path against a concrete token
  - documented generic CIP-56 adapter boundary for downstream token integrations
  - onboarding guide describing how a new token can be connected without forking the core stream engine
  - integration examples: payroll script, vesting schedule, subscription flow
  - developer documentation with quickstart guide, API reference, and code examples
  - SDK test suite covering the core client commands and transports

### Milestone 3: Hardening, Ecosystem Team's DAML/Canton Validation, and Mainnet-Ready Candidate

The dashboard, SDK, hardening artifacts, Daml/Canton validation, runbooks, and walkthroughs are published as a release candidate that another team can evaluate without one-off setup help.

- **Estimated Delivery:** 4 weeks
- **Focus:** hardening, ecosystem team's validation on DAML/Canton, remediation, production runbooks, and a mainnet-ready release candidate
- **Deliverables / Value Metrics:**
  - React reference dashboard and proxy with stream creation, monitoring, withdrawal, and batch payroll support
  - real-time accrual visualization with curve rendering
  - CSV import for bulk stream creation
  - stream history and transaction audit view
  - documented threat model, invariant verification, and internal hardening review of Daml templates
  - validation by an experienced Daml/Canton ecosystem team, together with remediation of material findings before the release is positioned as mainnet-ready
  - performance benchmarks: stream creation throughput, withdrawal latency, batch size limits
  - public release under Apache 2.0
  - release documentation, deployment guide, contribution instructions, and production-oriented runbooks
  - demo deployment on Canton testnet and a documented mainnet-ready release candidate for the open-source project
  - published reference walkthroughs for payroll, vesting, and renewable-term flows
  - maintenance and handoff documentation covering package structure, demo environment, upgrade boundaries, and issue triage expectations

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Daml templates implementing linear, cliff+linear, stepped, and renewable-term stream types
- prefunded settlement and refund behavior implemented for Canton Coin and the named **USDCx** reference path
- stream lifecycle (create, withdraw, cancel, complete) working correctly in the local demo environment
- batch creation and StreamGroup support available for multi-stream workflows
- non-cancellable stream variant enforced at the template level (no Cancel choice available)
- TypeScript SDK available as a reusable package and functional for create, query, withdraw, cancel, renew, and history flows
- SDK test suite passing for the reusable client package
- web dashboard and reference proxy available for stream creation, monitoring, withdrawal, and batch creation
- privacy and authorization behavior documented and enforced in the Daml templates
- integration examples runnable against a local Canton sandbox
- local demo scripts covering payroll, vesting, cancellation, and renewal flows
- a documented testnet reference flow for the named token path
- documentation complete: quickstart, API reference, deployment guide, operations guide, and contribution guide
- at least one reference integration example or implementation guide published for another Canton workflow
- maintenance and handoff documentation included in the public release
- project released as open source under Apache 2.0

Project-specific acceptance conditions:

- the project must remain a streaming primitive, not evolve into a billing platform or DeFi protocol
- all stream state and settlement rules must remain on-ledger in Daml templates, not in a proprietary backend
- the SDK, dashboard, and reference proxy must remain open-source integration surfaces rather than a hosted product dependency
- phase 1 must remain within prefunded, single-domain stream semantics
- stream privacy must be maintained — no global state exposure of stream terms or balances

---

## Funding

**Total Funding Request:** 560,000 CC

### Payment Breakdown by Milestone

- Milestone 1 _(Public OSS Repo, Threat Model, and CC Reference Flow)_: 210,000 CC upon committee acceptance
- Milestone 2 _(USDCx Reference Integration and Generic CIP-56 Adapter Path)_: 190,000 CC upon committee acceptance
- Milestone 3 _(Hardening, Ecosystem Team's DAML/Canton Validation, and Mainnet-Ready Candidate)_: 160,000 CC upon final release and acceptance


## Team Background

Strong product engineering experience building scalable software systems in large enterprise environments, including work with Fortune 100 organizations such as Accenture. This background includes delivering high-scale products, working across structured operational workflows, and translating complex business processes into dependable software systems.

The implementing team is also actively building on Canton. To keep the security posture credible for shared open-source infrastructure, the proposal explicitly includes milestone-3 validation from an experienced Daml/Canton ecosystem team rather than relying only on general product-engineering background.

### Funding Rationale

- Milestone 1 carries the highest share because the main delivery risk sits in the on-ledger primitive: stream invariants, settlement correctness, and the reproducible sandbox.
- Milestone 2 funds the reusable developer surface area: additional stream types, batch flows, the TypeScript SDK, and the named USDCx reference integration that proves the CIP-56 path concretely.
- Milestone 3 is intentionally smaller and centered on validation and adoption readiness: a thin reference dashboard, ecosystem-team DAML/Canton validation, docs, runbooks, and public demonstration artifacts.
- No recurring maintenance or hosted-service funding is requested in this initial proposal; the scope remains a reusable open-source primitive rather than an ongoing product operation.



### Security Review Pointer

This proposal intentionally does **not** include a speculative third-party audit budget before implementation details and reference token integrations are finalized.

The expected security process is:

- milestone 3 internal hardening with explicit threat model and invariants
- milestone 3 validation by an experienced Daml/Canton ecosystem team before the release is described as mainnet-ready
- stabilization of the initial codebase and reference token path
- scoping external review based on actual contract surface, not estimated assumptions
- if the Foundation or Canton ecosystem can help arrange a review, the project can take advantage of that
- otherwise, a follow-on proposal can request a scoped independent review once real auditor quotes are available


### Volatility Stipulation

If the project duration extends beyond 6 months due to Committee-requested scope changes, remaining milestones should be renegotiated for material CC/USD volatility.

## Co-Marketing

Upon release, the implementing entity will collaborate with the Foundation on:

- announcement coordination
- a technical blog post explaining the streaming architecture and Canton's privacy advantages
- one live demo or walkthrough showing payroll streaming and vesting schedule creation

Specific commitments:

- publish integration guide for ecosystem projects wanting to compose with streaming templates
- publish at least one end-to-end example (e.g., team payroll or investor vesting) with walkthrough documentation
- coordinate with Cantara team on potential integration path (optional, not a dependency)

---

## Motivation

Payment streaming is already familiar on other networks for payroll, vesting, and recurring payments. Canton teams have the same need today, but there is no shared open-source implementation they can reuse.

Right now, these flows are usually handled through manual transfers, batches, or app-specific logic. That works, but every team ends up rebuilding the same core rules around accrual, withdrawal, cancellation, and visibility.

This proposal fills that gap with a reusable Daml and TypeScript reference stack that other Canton projects can adopt or adapt.

---

## Rationale

This proposal is framed as a reusable primitive and reference implementation, not a product.

The scope is intentionally practical:

1. it focuses on a missing building block rather than a full billing product
2. it stays within prefunded, single-domain semantics for the first release
3. it uses normal Canton and Daml patterns instead of asking for protocol changes
4. it ships the contracts, SDK, dashboard, proxy, demo, and docs together so other teams can actually try it

That keeps the proposal concrete, reviewable, and easy to reuse.
