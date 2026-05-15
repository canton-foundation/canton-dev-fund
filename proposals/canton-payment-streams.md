## Development Fund Proposal: Canton Payment Streams — Private Continuous Payments, Vesting, Treasury Distributions, and Incentive Flows for Canton

- **Author:** Deepthi
- **Status:** Revised Submission
- **Created:** 2026-03-15

---

## Abstract

This proposal requests funding for an open-source **payment streaming reference implementation** for Canton.

Payment streaming is well-established on other networks, but there is no shared open-source implementation for Canton today. This proposal fills that gap with a reusable Daml, TypeScript, and reference UI stack for **private, programmable, time-based payments** using Canton-native privacy and interoperable assets.

The project, **Canton Payment Streams**, will provide:

- continuous token streaming between parties
- configurable vesting schedules with cliff, linear, stepped, and renewable-term flows
- batch and multi-recipient payment flows
- cancellable and non-cancellable stream modes
- both **prefunded guaranteed-settlement streams** and **non-prefunded / rolling top-up streams**
- a TypeScript SDK for programmatic stream management
- a thin reference dashboard and proxy for stream creation, monitoring, and withdrawal
- privacy preservation: stream terms, rates, balances, and settlement details visible only to authorized parties

The project is not aimed only at consumer payroll-style flows. The strongest Canton-native use cases are:

- LP incentives and market-maker retainers
- validator and infrastructure service billing
- vesting, grants, and private-round unlock schedules
- private B2B billing and recurring service payments
- private stablecoin treasury flows and vendor payouts
- institutional custody, servicing, and financing fee accrual

Current design-partner demand already points directly to these workflows. In design discussions:

- **BitDynamics** and **Lumens.fi** have requested LP incentive streaming and treasury-funded reward schedules
- **Gateway** has requested validator and infrastructure billing flows

The v1 reference asset paths are **Canton Coin** and **USDCx**, with the stream engine intentionally designed to be reusable beyond those initial paths.

---

## Motivation

Payment streaming has already proven useful on other ecosystems for vesting, grants, recurring services, and continuous treasury-managed distributions. Canton needs the same primitive, but in a form suitable for confidential, interoperable institutional workflows rather than public-by-default payment rails.

Today, Canton teams that want time-based payment flows typically rely on manual transfers, batched payouts, or app-specific logic. That creates repeated effort around the same core concerns:

- deterministic accrual over time
- withdrawal and settlement correctness
- privacy of payment terms
- cancellation and refund rules
- reusable SDK and integration surfaces
- auditability without global state exposure

This proposal treats payment streaming as shared ecosystem infrastructure — a reusable primitive, not a standalone billing product.

---

## Objective

The objective is to make payment streaming available as reusable open-source infrastructure on Canton, so teams do not need to build the core on-ledger logic, SDK, and reference integration surfaces from scratch.

The intended outcome is that a Canton developer or operator can:

- fund and run a fixed-duration LP incentive campaign
- stream validator or infrastructure service payments over time
- vest allocations for grants, launch participants, or contributors
- create treasury-managed recurring payment schedules in `CC` or `USDCx`
- compose streaming flows atomically with other Canton contracts

and the system will:

- enforce all streaming rules on-ledger through Daml templates
- preserve privacy of stream terms and balances
- support both guaranteed-settlement and capital-efficient payment models
- expose clean SDK and dashboard surfaces for integrators
- provide a complete audit trail to authorized parties without public state leakage

---

## Current Demand and Design-Partner Validation

This proposal is not based only on theoretical demand.

Current named design-partner signals include:

- **BitDynamics** — LP incentive streaming, treasury-funded liquidity campaigns, market-maker retainers, and partner reward schedules
- **Lumens.fi** — LP incentive streaming, vesting schedules, treasury-managed launch distributions
- **Gateway** — validator and infrastructure service billing through recurring or metered streaming payments

These are not abstract examples. They map directly to live workflow needs in the current Canton ecosystem, and the revised milestones are tied to partner validation and external usage rather than only implementation completeness.

---

## Canton-Native Use Cases

The strongest use cases for payment streams on Canton are:

1. **LP incentives and market-maker retainers**
   Treasury-funded, fixed-term reward programs for liquidity providers and market makers, including launch incentives, LP mining, market-maker retainers, and partner reward schedules.

2. **Validator and infrastructure service billing**
   Recurring payments for validator hosting, node operations, RPC access, infrastructure services, or other metered or term-based platform services.

3. **Vesting, grants, and private-round unlock schedules**
   Time-based token or stablecoin distributions for grants, contributor allocations, launch programs, treasury schedules, and private fundraising unlocks.

4. **Private B2B billing and recurring service payments**
   Confidential recurring commercial payments for software, analytics, data, advisory, and enterprise service relationships.

5. **Private stablecoin treasury flows and vendor payouts**
   Treasury-managed payment schedules using stable settlement assets such as `USDCx`, including recurring vendor payouts and internal treasury operations.

6. **Institutional custody, servicing, and financing fee accrual**
   Recurring fees for custody, servicing, administration, or financing relationships where terms and balances are commercially sensitive.

These use cases fit Canton particularly well because payment terms, counterparties, and balances are often sensitive, while the assets themselves increasingly need to interoperate across applications.

---

## Standards Alignment

Canton Payment Streams is designed as a CIP-conformant primitive from day one:

- **CIP-56 (Token Standard) — V1 and V2:** the settlement adapter boundary consumes CIP-56 token interfaces, allowing the stream engine to remain asset-agnostic. V2 support is delivered alongside or shortly after V2 ratification.
- **CIP-103 (dApp API):** all stream lifecycle operations (`Create`, `Withdraw`, `Cancel`, `MutualCancel`, `Renew`, `TopUp`, `Complete`) are exposed through the CIP-103 JSON-RPC surface. Any CIP-103-compliant wallet — including Splice Wallet Kernel implementations and external-party signing wallets — can authorize stream operations without bespoke integration.
- **Wallet SDK alignment:** integrates with `@canton-network/wallet-sdk` as the preferred ledger backend where applicable.


----

## Implementation Mechanics

### 1. Two Streaming Models

The project supports two payment models, matched to different use cases.

#### A. Prefunded Guaranteed-Settlement Streams

In the prefunded model:

- the sender locks a prefunded balance into a stream escrow at creation time
- the stream contract tracks total deposited, total withdrawn, and the amount accrued over time
- each `Withdraw` transfers only the accrued, unwithdrawn portion from escrow to the recipient
- each `Cancel` or `Complete` settles the accrued amount owed and returns any unaccrued remainder
- no stream can promise more than the funded balance

This model is intentionally prioritized first because it gives the strongest guarantees and removes:

- credit risk
- insolvency handling
- liquidation mechanics
- dependence on continuous top-ups
- ambiguity about whether promised funds are actually reserved

It is especially well-suited to:

- LP incentive programs
- vesting schedules
- grants and launch distributions
- fixed-term validator retainers
- milestone escrow
- prepaid subscriptions
- treasury-budgeted campaigns

#### B. Non-Prefunded / Rolling Top-Up Streams

The project also includes a non-prefunded path for open-ended recurring flows:

- streams can remain active without locking the full lifetime amount upfront
- the sender maintains funding through top-ups or rolling funded balance
- withdrawals remain bounded by what has actually been funded and accrued
- the design improves capital efficiency without relying on unsecured off-ledger credit assumptions

This model is better suited to:

- open-ended subscriptions
- recurring infrastructure billing
- ongoing service retainers
- long-lived incentive programs
- metered or usage-shaped recurring payment relationships

The proposal does not treat prefunded and non-prefunded streams as competing ideas. It treats them as two valid payment models that fit different Canton-native use cases.

### 2. Reference Assets and Settlement Boundary

The initial reference asset paths are:

- **Canton Coin**
- **USDCx**

The stream engine is designed to remain asset-agnostic, with token movement behind a narrow settlement adapter boundary. This allows the core streaming logic to stay reusable while the surrounding token transfer mechanics remain configurable.

### 3. Core Contract Design

The core reference contracts are:

- **StreamEscrow**
  Holds sender, recipient, optional observers, token reference, deposited amount, withdrawn amount, timing configuration, stream mode, and status.

- **StreamGroup**
  Groups related streams for batch workflows such as LP incentive campaigns or payroll-like distributions.

### 4. Stream Types

Supported stream types:

- `Linear`
- `CliffLinear`
- `Stepped`
- `RenewableTerm`

These cover the main partner-requested flows for incentives, vesting, recurring billing, and renewable service payments.

### 5. Choice Model

The initial choice set includes:

- `Create`
- `Withdraw`
- `Cancel`
- `MutualCancel`
- `Renew`
- `TopUp`
- `Complete`

### 6. Privacy and Authorization

Canton Payment Streams relies on Daml’s native signatory/controller and privacy model:

- **Sender** creates and funds the stream, and can cancel where allowed
- **Recipient** can withdraw accrued funds
- **Observers** can view status where required, for treasury, compliance, or audit use cases

Privacy guarantees:

- stream terms are visible only to signatories and observers
- no global public state exposure of rates, balances, or payment terms
- full auditability remains available to authorized parties

This is a major advantage for institutional and commercially sensitive flows.

### 7. SDK, Dashboard, Proxy, and Wallet Integration

The project will ship with:

- a TypeScript SDK for create/query/withdraw/cancel/renew/top-up/history flows
- a thin reference React dashboard
- a small reference proxy for browser-safe deployments
- CIP-103 dApp API bindings for wallet-driven authorization
- integration examples and operator/developer docs

The SDK and UI are reference integration surfaces, not a hosted product dependency.


### 8. Core Invariants

The reference implementation will be tested against explicit invariants:

- `0 <= totalWithdrawn <= accrued(now) <= totalFunded`
- `alreadyWithdrawn + withdrawable + refundable = totalFunded`
- accrued amount is monotonic in ledger time
- no negative remaining balances
- once `Cancelled` or `Completed`, no further withdrawal is possible
- non-prefunded flows cannot pay more than the actually funded balance

These invariants are the heart of the correctness and security story.

---

## Validation from Comparable Ecosystems

There is already strong evidence that both prefunded and non-prefunded streaming models can succeed when matched to the right use case.

- **Sablier Lockup** validates the prefunded model. Sablier reports over **$1B in cumulative payment volume**, with strong fit in vesting and other committed payment programs.
- **Superfluid** validates the non-prefunded / buffer-based model. Superfluid publicly reports over **$1.25B streamed** to more than **1.04 million recipients**.
- **Sablier Flow** further validates the need for both models by extending beyond pure lockup into top-up and open-ended recurring payment flows.

The lesson is not that one model is universally better, but that each fits different payment categories. Canton Payment Streams is designed around that same principle.

---

## Adoption and Validation Plan

The revised project is tied to external validation, not only implementation delivery.

The validation plan includes:

- published reference walkthroughs covering LP incentives, vesting, and recurring infrastructure billing
- at least one structured ecosystem feedback sessions
- written design-partner validation checkpoints
- at least one external Testnet integration or guided pilot using the SDK / reference implementation
- at least one published reference integration example showing how streams compose with another Canton workflow
- explicit documentation describing when to use prefunded vs non-prefunded models

The named design-partner workflows from BitDynamics, Lumens.fi, and Gateway are intended to anchor this validation.

---

## Architectural Alignment

This proposal aligns with Development Fund priorities because it provides:

- a reusable on-ledger primitive rather than app-specific duplicated logic
- a real missing building block for the Canton ecosystem
- privacy-preserving payment infrastructure aligned with institutional workflows
- composability with other Daml contracts and Canton applications
- an open-source SDK, UI, proxy, demo, and documentation package that others can adopt directly

---

## Milestones and Deliverables

### Milestone 1: Public OSS Repo, Threat Model, and Prefunded CC Reference Flow

A new evaluator can clone the repository, run the sandbox, create streams, and validate the base lifecycle from documentation alone.

**Deliverables**
- public GitHub repo under Apache 2.0
- architecture note and initial threat model
- Daml templates for the base prefunded stream lifecycle
- Canton Coin reference flow implemented end to end
- reproducible local sandbox demo
- initial SDK surface for create/query/withdraw/cancel
- initial integrator documentation

### Milestone 2: USDCx Reference Integration, Rolling Top-Up Path, and External Validation

An external builder should be able to test LP incentives, vesting, or recurring billing workflows using the SDK and examples.

**Deliverables**
- named `USDCx` reference integration
- documented generic adapter boundary for downstream tokens
- non-prefunded / rolling top-up reference path
- expanded TypeScript SDK and event/query surfaces
- integration examples for LP incentives, vesting, and recurring billing
- onboarding guide for new tokens and host-wallet integrations
  
### Milestone 3: Hardening, Audit/Review, Maintenance Window, and Adoption Validation

The full reference stack is published as a release candidate another team can evaluate without one-off setup help.

**Deliverables**
- React reference dashboard and proxy
- documented prefunded and non-prefunded reference flows
- independent smart contract audit or experienced Daml/Canton review
- remediation of material findings
- production-oriented runbooks and deployment documentation
- defined maintenance/support window
- adoption validation tied to named design-partner workflows
- public release candidate suitable for real ecosystem evaluation

### Milestone 4: Adoption on Mainnet 

Canton Payment Streams transitions from a release candidate to a production-validated primitive demonstrably in use across the ecosystem, with measurable adoption, audit certification, and a public maintenance commitment.

Deliverables

- at least 5 featured apps integrating Canton Payment Streams in production on Mainnet
- a minimum of 50 active streams running on Mainnet across these integrations over a rolling 30-day window
- external security audit certification with all Critical and High findings remediated and the audit report published
- Apache 2.0 release of the full reference stack including Daml packages, TypeScript SDK, React dashboard, and reference proxy
- final adoption report submitted to the Canton Dev Fund Committee summarizing usage metrics, integrator feedback, and lessons learned

---

## Acceptance Criteria

The Committee can evaluate completion based on:

- Daml templates implementing the promised stream types and lifecycle
- prefunded settlement and refund behavior working for `CC` and `USDCx`
- non-prefunded / rolling top-up path implemented and documented
- SDK available as a reusable package for create/query/withdraw/cancel/renew/top-up/history flows
- CIP-103 dApp API integration covering all stream lifecycle operations
- CIP-56 V1 and V2 token standard conformance
- dashboard and reference proxy available for stream creation, monitoring, and withdrawal
- privacy and authorization behavior documented and enforced
- local demo scripts covering the core flows
- documented Testnet reference flow
- at least two design-partner validation checkpoints documented
- at least one external Testnet integration or guided pilot completed
- independent audit/review plus remediation of Critical and High findings
- maintenance/support window documented and committed
- at least 5 featured apps using the system in production on Mainnet, with ≥50 active streams sustained over a rolling 30-day window.
- release artifacts published as open source under Apache 2.0

Project-specific acceptance conditions:

- the project remains a streaming primitive, not a billing platform or DeFi protocol
- stream state and settlement rules remain on-ledger in Daml templates
- the SDK, dashboard, and proxy remain open integration surfaces
- the proposal clearly distinguishes between prefunded guaranteed-settlement streams and non-prefunded rolling-top-up streams, and does not blur them into an unsecured credit model
- stream privacy is preserved; no global public exposure of stream terms or balances


---

## Funding

**Total Funding Request:** 900,000 CC (development) +  200,000 CC (independent audit by reputed audit firm) 

The audit quote will be submitted to the Committee for approval after Milestone 2.

### Breakdown by Milestone

| Milestone | Payment on Acceptance |
|---|---|
| Milestone 1 — Public OSS Repo, Threat Model, Prefunded CC Reference Flow | 150000 CC |
| Milestone 2 — USDCx, Rolling Top-Up, CIP Alignment, External Validation | 0 CC |
| Milestone 3 — Hardening, Audit/Review, Maintenance Window, Adoption Validation | 0 CC + audit funding (200,000 CC, against approved quote) |
| Milestone 4 — Mainnet Adoption | 750,000 CC |
| **Total** | **900,000 CC + 200,000 CC audit** |

### Funding Rationale

The funding structure is intentionally back-loaded against demonstrated adoption rather than implementation completeness:

- **Milestone 1 releases 150,000 CC** against verifiable delivery of the public OSS repo, threat model, base prefunded stream lifecycle in Daml, Canton Coin reference flow, initial SDK surface, and reproducible local sandbox demo. This represents 17% of development funding — a bounded delivery payment sized to sustain the team into Milestone 2, not a reward for code completion.
- **Milestones 2 and 3 are unfunded delivery milestones.** The team carries delivery risk for the USDCx integration, the non-prefunded / rolling top-up path, CIP-103 + CIP-56 V2 alignment, the expanded SDK surface, the React reference dashboard and proxy, runbooks, design-partner validation checkpoints, and the release-candidate hardening — all delivered before any further development payment is released. This directly addresses prior reviewer feedback that funding should be conditioned on demonstrated validation, not on code delivery alone.
- **Audit funding (200,000 CC) is ring-fenced and separate from the development budget.** It is released at the start of Milestone 3 against a Committee-approved audit quote so the team can engage an independent audit firm. This is not a Milestone 3 development payment; it is a pass-through to the auditor for security validation work that conditions Milestone 4.
- **Milestone 4** releases 750,000 CC — 83% of development funding — only after Mainnet adoption is demonstrated through 5 featured apps, 50+ active streams , audit certification, and Apache 2.0 release.

This structure ensures the largest tranche of funding is paid only when the primitive has been independently validated in production usage by the ecosystem.

---

## Team Background

The implementing team combines strong product engineering experience from top teams with active hands-on Canton implementation work. The proposal is not only conceptual: the team is already building and validating the stack in practice, including Daml templates, TypeScript SDK/proxy components, and live Testnet flows for both Canton Coin and USDCx.

Because the project is intended to become shared ecosystem infrastructure, the final milestone explicitly includes independent audit/review and validation by experienced Daml/Canton practitioners before the release is positioned as production-ready.

---

## Security and Maintenance

This revised proposal includes explicit security validation and continuity in the final phase.

The expected security process is:

- documented threat model and invariant verification
- adversarial and edge-case testing
- independent smart contract audit or experienced Daml/Canton review
- remediation of material findings before production-oriented positioning
- publication of deployment and operational guidance

The revised proposal also includes a defined maintenance/support window so early adopters are not asked to rely on an unsupported release immediately after delivery.

---

## Risks and Mitigations

- **Model mismatch risk:** not every payment flow should be prefunded. The proposal mitigates this by supporting both prefunded and non-prefunded models and documenting the intended boundary for each.
- **Token integration complexity:** the project starts with `CC` and `USDCx` to prove real settlement paths without overclaiming universal token support.
- **Adoption risk:** mitigated by tying milestones to named design-partner validation and external Testnet usage.
- **Security risk:** mitigated by explicit invariants, adversarial tests, independent review/audit, and remediation before production-oriented release.
- **Scope creep risk:** mitigated by keeping the project focused on the streaming primitive, SDK, UI, proxy, and reference integrations rather than expanding into a full billing platform.

---

## Co-Marketing

Upon release, the implementing entity will collaborate with the Foundation on:

- announcement coordination
- a technical blog post explaining the streaming architecture and Canton’s privacy advantages
- at least one live demo or walkthrough covering LP incentives, vesting, or recurring billing
- publication of integration guidance for ecosystem teams wanting to adopt the primitive

---

## Rationale

This proposal is framed as reusable ecosystem infrastructure rather than a standalone commercial product.

The scope is intentionally practical:

1. it solves a missing primitive rather than a broad category of business software
2. it matches payment model to use case instead of forcing one pattern everywhere
3. it stays within normal Canton and Daml implementation patterns
4. it ships contracts, SDK, dashboard, proxy, demo, docs, audit/review, and adoption validation together so other teams can realistically evaluate and use it

That makes the proposal easier to assess on both technical merit and real ecosystem usefulness.
