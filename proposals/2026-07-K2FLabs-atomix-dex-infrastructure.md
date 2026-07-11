# Development Fund Proposal: Atomix, Open-Source Order-Book Exchange Infrastructure for Canton

**Author:** [K2F Labs](https://k2flabs.com), Kevin Ko (kko@k2flabs.com)
**Status:** Draft
**Created:** 2026-07-11
**Label:** defi-liquidity
**Champion:** open to any Tech & Ops Committee member organization (e.g., Digital Asset, IntellectEU); determined during committee review

---

## Abstract

Atomix is a non-custodial order-book exchange stack for CIP-56 token-standard assets on Canton, pairing an off-chain matching engine with on-chain settlement through token-standard workflows, so that order matching runs at sub-1ms latency while settlement, custody, and the traded assets all stay on the ledger. Atomix is the exchange infrastructure behind [Nexode](https://nexode.io), a prediction market venue in production on Canton mainnet since May 2026.

This proposal funds turning that production stack into public ecosystem infrastructure:

1. **Open-sourcing** the production backend stack under Apache-2.0: order book and matching engine, settlement engine, Daml contracts, API service and client, persistence layer, and Helm charts.
2. **Hardening** it for third-party operators, with operator documentation, runbooks, observability, and a public reference deployment on testnet.
3. **Migrating** settlement to Token Standard V2 committed allocations and iterated settlement as those packages land.
4. **Building** a browser trading frontend for the stack, released end to end as its own milestone (net-new work, not part of the backend release).
5. **Supporting** external adopters through 6 months of adopter-facing maintenance, with adoption-based payments for independent venues that go live on the stack.

The result is that any team can deploy an exchange venue on Canton from public code and documentation alone.

---

## Specification

### 1. Objective

Turn a production-proven exchange stack into deployable public infrastructure that any team can use to run a venue on Canton. The grant open-sources the stack, hardens it for third-party operators, migrates its settlement to Token Standard V2, and supports adoption by independent venues.

**Out of scope:**

- Operating a commercial venue. The public reference deployment is for evaluation, not trading services.
- Liquidity provision, market making, or token issuance.
- Protocol, ledger, or standard changes. The stack consumes published Canton surfaces unchanged.

### 2. Implementation Mechanics

Atomix runs an off-chain order book with on-chain settlement. Orders and the book live off-chain, in memory, so matching runs at in-process speed rather than at ledger-transaction speed, and the matching engine holds no funds. Custody, settlement, and the token-standard assets stay on the ledger, where matched trades resolve to on-ledger transactions. The subsystems below describe the system as built and running today, and naming may change as the code is generalized for release.

```
 MATCHING  (off-chain, in-memory)                  SETTLEMENT & CUSTODY  (Canton ledger)
 -------------------------------                   -------------------------------------
 order -> atomix-api -> matching engine
                            |  (WAL-journaled, crash-recoverable)
                            v
                          match -> settlement worker ==SubmitAndWait==> Daml settlement
                                    (FSM: at-most-once,                 TradeDelegation +
                                     self-healing)                      token-standard transfer
                                                                               |
                         market data <- projection <- WAL                      v
                         (OHLCV, ticker/depth)                          holdings move,
                                                                        holder keeps custody
```

#### 2.1 Off-chain order book

The book is a price-time-priority limit order book. It accepts limit orders with the full set of time-in-force policies (good-till-cancel, immediate-or-cancel, fill-or-kill, good-till-date, day), and enforces venue rules at the boundary: tick and lot sizing, minimum and maximum quantity, notional bounds, price bands, self-trade prevention, and a maker/taker fee schedule.

Because the book is in memory, durability comes from write-ahead logging, not from a database. Every book mutation is appended to a memory-mapped, segmented write-ahead log (WAL) with a per-entry CRC and an inline fsync before the in-memory index is updated, so a committed order is recoverable even if the process dies immediately after. The engine recovers by loading the latest snapshot and replaying the WAL tail from the snapshot's checkpoint. Snapshots are written atomically and old WAL segments are compacted against the older of the newest snapshot and the market-data projection checkpoint, so recovery time is bounded and always crash-consistent. This journal-and-snapshot path carries dedicated integration tests for compaction and failover.

Market data is served today as historical OHLCV through the TradingView Universal Data Feed contract, aggregated by a projection worker that drains the WAL into Postgres, plus live ticker and depth read from the in-memory engine. Push-based streaming over WebSocket is designed and on the roadmap, not yet shipped.

Order intake and queries are exposed by `atomix-api`, an Axum service with a signature-authenticated, rate-limited REST surface: order placement and cancellation, market and order-book queries, trades, fee quotes, token listing, the trader-signed trade-delegation preparation endpoint, and an admin surface for market lifecycle and venue statistics. An OpenAPI specification is generated from the handlers and committed to the repository.

The order book engine sustains a throughput of 165,000 to 185,000 ops/sec on commodity hardware.

#### 2.2 On-chain settlement

Settlement is what makes off-chain matching safe to pair with on-chain custody. It splits into a Rust worker that drives submission and a Daml layer that executes the transfers.

The worker is a pure finite state machine wrapped by a 3-stage async loop (discover, schedule, drain). The FSM has 5 states (Pending, Submitted, Retrying, Completed, Failed) and a pure transition function covered by more than 20 unit tests across every arm.

- **At-most-once on-chain settlement.** Each attempt mints a fresh command id and submits a single `SubmitAndWait` under a Canton deduplication period. A submission stuck past the dedup window is reaped to a terminal state rather than blindly resubmitted, and attempts are bounded.
- **Self-healing.** The drain stage subscribes to the ledger completion stream. A completion that arrives late, after the scheduler already moved a settlement to Retrying or Failed, heals it forward to Completed, so the database converges on the actual ledger outcome after a crash or a slow completion.
- **Pre-submission checks.** A preflight stage validates funding against a cached on-ledger holdings view and rejects underfunded trades before they consume a submission, and RPC failures are classified transient versus terminal by status code.
- **Concurrency safety.** The worker holds a Postgres advisory lock, so overlapping instances cannot double-settle the same trade.

Settlement is non-custodial: the venue never holds a trader's keys or funds. A trader unilaterally creates a `TradeDelegation` contract on which the trader is the signatory and Atomix is only an observer. That contract grants a single capability: move the trader's own holdings through the Canton token-standard transfer factory, guarded by an on-ledger assertion that the sender is the delegator. The delegation contributes the trader's authority and the token issuer's transfer factory contributes the issuer authority. Atomix contributes neither and cannot move anyone else's assets.

The Daml layer (`AtomixRules`, `Trade`, `Settlement`, `TradeDelegation`, `RebateCoupon`) composes these into a batch: it nets fills per sender, receiver, and instrument and executes each leg through the token standard's transfer instruction. Settlement today is optimistic: there is no on-ledger lock, so if a holding moved out from under a leg the underlying transfer fails and the whole batch rolls back atomically, after which the engine re-nets and retries. This is the on-ledger counterpart of the worker's retry logic. Atomix runs on CIP-56 transfer-instruction (v1) today. Milestone 3 migrates settlement onto Token Standard V2 committed allocations and iterated settlement, which replace optimistic rollback with an on-ledger reservation of funds.

Operating this settlement path in production surfaced failure modes that are not yet fully handled in code, most importantly sequencer traffic-budget exhaustion and non-retryable insufficient-funds interpretation errors. These are documented from live incident logs, and building the venue's response to them (traffic-aware submission, and quarantine of trades whose outcome cannot change until counterparty holdings change) is part of the operator-hardening scope in Milestone 2, not a claim of current behavior.

#### 2.3 Persistence

`atomix-db` is a SQLx and Postgres layer covering the order, trade, and settlement lifecycle, with a joined view of trades and their settlement state. Balances are deliberately not stored, but read live from the ledger through a holdings cache, consistent with the non-custodial design.

A browser trading frontend is not part of the production backend above. It is delivered end-to-end as Milestone 4.

#### 2.4 Deployment and hardening

The stack was built for a single production deployment and carries assumptions from that context: environment-specific configuration, deployment paths tied to K2F infrastructure, operational knowledge held in K2F runbooks, and continuous integration that only builds and ships rather than gating on tests. Milestones 1 and 2 remove these: self-contained builds, generalized configuration, test-gating public CI, operator documentation, observability guidance, and published Helm charts alongside the existing Docker Compose and localnet quickstart. Milestone 2 also stands up a public testnet deployment, operated by K2F for the duration of the grant, that external teams can inspect and trade against.

### 3. Architectural Alignment

The work aligns with the App Building and Developer Experience, DeFi liquidity, and Security and Resilience priority areas, and it completes a pattern the fund has already invested in. It also helps the network scale: because only settlements reach the ledger, a high-volume venue adds settlement traffic and token-standard activity without flooding the synchronizer with order-level messages.

Token Standard V2 introduces committed allocations, iterated settlement, and an off-chain executor settlement path. The stated purpose of those primitives, echoed across merged proposals, is to enable prefunded trading and an off-chain order book settled on-chain. Atomix is a production implementation of it: the matching engine and settlement worker are the off-chain executor, and token-standard settlement is the on-chain leg. It runs today on CIP-56 transfer-instruction with optimistic settlement, and the Milestone 3 migration onto V2 committed allocations is what carries it onto the reserved-funds executor model those primitives were designed for.

K2F provided design input on off-chain executor settlement and the allocation redesign during the Token Standard V2 design process, through direct engagement with Wayne Collier (Digital Asset). The migration milestone in this proposal is the same team carrying that design work through to a running system.

The stack is a downstream consumer of published surfaces: the Ledger API, CIP-56 token-standard workflows, and the Token Standard V2 packages as they land. No changes to Canton, Daml, or Splice are requested.

### 4. Backward Compatibility

No backward compatibility impact. The project is additive: it publishes a new application stack and does not modify existing Canton components, standards, or workflows.

### 5. Risks and Dependencies

Only Milestone 3 depends on Canton core, namely the Token Standard V2 packages landing. The other milestones have no such dependency and ship on published surfaces available today.

| Risk or dependency | Mitigation |
|---|---|
| Token Standard V2 package timing (Milestone 3) | Settlement runs on CIP-56 today, so the stack ships and operates without V2. Milestone 3's acceptance is preservation of the design intent on the best available V2 surface, with the dependency documented in the repository. |
| Fair execution in an operator-run matching engine | Matching and sequencing are operated by the venue operator, the same trust model as any operated exchange. Custody and settlement are non-custodial and enforced on the ledger, so the operator can never move funds, and the journaled trade log makes execution auditable. |
| Production failure modes not yet fully handled (sequencer traffic exhaustion, non-retryable insufficient-funds errors) | Documented from live incident logs and scoped into the Milestone 2 operator-hardening work. |
| Key-person and stewardship continuity | K2F operates the stack in production and maintains it commercially. If stewardship capacity becomes impaired, repository ownership transfers to the Foundation by mutual agreement. |
| Low external adoption | The Milestone 6 tranches pay only when independent venues go live, so the Foundation pays nothing for adoption that does not occur. |
| Security of settlement-critical code | A third-party audit of the settlement paths, scoped with the Tech and Ops security subcommittee, covers the settlement worker, the Daml settlement and trade-delegation contracts, deduplication, and funding preflight, with critical and high findings remediated and a public summary. |

---

## Milestones and Deliverables

### Milestone 1: Open-Source Release (partially retroactive)

- **Estimated Delivery:** Month 2
- **Hard deadline:** Month 4 from grant approval
- **Focus:** Publish the production stack as a public good in a form external builders can run.
- **Deliverables / Value Metrics:**
  - An external developer can stand up a working venue (place orders, match, settle against a local ledger) from public code and documentation alone.
  - Backend stack released under Apache-2.0 at the public repository github.com/k2flabs/openatomix with public CI: order book and matching, `atomix-core`, settlement worker, `atomix-api`, `atomix-client`, Daml package `atomix-v1` with tests, `atomix-db`, Helm charts, and Docker Compose.
  - Localnet quickstart, published OpenAPI specification, and architecture documentation covering the settlement worker design and the production fault-tolerance scenario catalog.
  - This milestone recognizes the delivered, production-validated stack alongside the release work.

### Milestone 2: Operator Hardening and Public Reference Deployment

- **Estimated Delivery:** Month 4
- **Hard deadline:** Month 6 from grant approval
- **Focus:** Make the stack deployable and operable by teams other than K2F.
- **Deliverables / Value Metrics:**
  - Single-operator assumptions removed, with configuration generalized and documented.
  - Operator guide and runbooks: deployment, upgrade, recovery, and incident handling.
  - Observability: metrics, dashboards guidance, and health endpoints documented for operators.
  - Public reference deployment live on testnet, operated by K2F through the end of the grant period, that external teams can inspect and trade against.
  - At least 2 external teams evaluating the stack or reference deployment, with documented feedback incorporated.

### Milestone 3: Token Standard V2 Settlement Migration

- **Estimated Delivery:** Month 6
- **Hard deadline:** Month 9 from grant approval
- **Focus:** Move settlement onto Token Standard V2 semantics.
- **Deliverables / Value Metrics:**
  - The public reference deployment demonstrably settles live trades on Token Standard V2 committed allocations, verified by external evaluators.
  - Settlement migrated to V2 committed allocations and iterated settlement, verified end-to-end on the reference deployment.
  - Prefunded order flows backed by V2 allocations, with cancellation, expiry, and recovery paths documented.
  - A migration note for operators moving a live venue from CIP-56 flows to V2.
  - If V2 package timing shifts outside the team's control, the acceptance criterion is preservation of the design intent on the best available V2 surface, with the dependency documented in the repository.

### Milestone 4: Trading Frontend

- **Estimated Delivery:** Month 7
- **Hard deadline:** Month 9 from grant approval
- **Focus:** Build and release a browser trading frontend for the stack, end to end.
- **Deliverables / Value Metrics:**
  - The frontend is usable in a browser against the public reference deployment (place and manage orders, view the order book and trades), and an external operator can serve it against their own venue from public code and documentation alone.
  - A trading frontend built and released under Apache-2.0 against the live backend: order entry and management, order book and trade views, portfolio, wallet and authentication integration, and charting driven by the stack's market data feed.
  - Deployed against the public reference deployment so external teams can trade through it in a browser.
  - Wallet and authentication integration documented for operators.

### Milestone 5: Adopter-Facing Maintenance (6 months)

- **Estimated Delivery:** Months 6 through 12
- **Hard deadline:** Month 12 from grant approval (end of the maintenance window)
- **Focus:** Keep the public release current, compatible, and consumable as Canton evolves.
- **Deliverables / Value Metrics:**
  - Throughout the window the stack builds and runs against each current Canton, Daml, and Splice release, so any team evaluating or deploying it gets working, up-to-date code rather than an abandoned snapshot.
  - Stack verified against every Canton, Daml, and token-standard release published in the window, with a public compatibility matrix.
  - External issues receive a first response within 5 business days, critical security fixes within 7 days, and high-severity fixes within 30 days.
  - Upgrade guides, release notes, and a public maintenance log.
  - Scope note: this milestone funds external-facing support and compatibility work. K2F maintains its own production instance (Nexode) regardless of grant status.

### Milestone 6: External Adoption

- **Opens:** on Milestone 2 acceptance. **Deadline:** 12 months from grant approval.
- **Focus:** Independent venues operating on the stack. The adoption tranches reward venues that go live independently during the grant. The existing Nexode deployment is standing evidence and does not count toward them.
- **Deliverables / Value Metrics:**

| Deliverable | Acceptance Criteria | Tranche |
|-------------|---------------------|---------|
| Independent venue operator | A separate organization, not affiliated with K2F, that deployed the stack itself and operates a venue with real order flow on Canton testnet or mainnet, evidenced publicly or by attestation to the Foundation. Up to 4 credited | 500,000 CC per venue (up to 2,000,000 CC) |
| Adoption completion gate | At least 5 external GitHub issues or PRs from distinct organizations, community-reported issues triaged to resolution, and at least 1 public operator walkthrough delivered | 300,000 CC |

Partial adoption pays partially: each venue tranche fires on its own, so if 2 independent venues go live, 2 tranches pay. Adoption is evidenced by on-ledger activity (party identifiers and mainnet or testnet submissions), or, where an adopter prefers confidentiality, by attestation to the Foundation, which confirms completion to the committee.

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on ecosystem value:

- An external developer can stand up a working venue on localnet from public code and documentation alone (Milestone 1).
- An external operator can deploy a venue on testnet from the published Helm charts and operator guide alone (Milestone 2).
- The public reference deployment is reachable and demonstrates end-to-end trading and settlement (Milestone 2).
- The reference deployment settles trades on Token Standard V2 to external evaluators (Milestone 3).
- The trading frontend is released and usable in a browser against the reference deployment, and an external operator can serve it against their own venue (Milestone 4).
- Through the maintenance window the stack is verified against each Canton, Daml, and token-standard release with a public compatibility matrix and maintenance log, and external issues receive first responses within 5 business days (Milestone 5).
- Adoption tranches pay only against independent venues: organizations that deploy and run the stack themselves. The existing Nexode deployment does not qualify.
- Documentation clearly distinguishes venue application logic, token-standard logic, and operator responsibilities.

---

## Funding

**Total Funding Request: up to 5,500,000 CC** (up to 5,780,000 CC including the early-delivery bonus, plus a separate audit pass-through of approximately 200,000 CC, for a maximum committee outlay of approximately 5,980,000 CC)

### Payment Breakdown by Milestone

| Milestone | Payment | % of total |
|---|---|---|
| M1: Open-source release (partially retroactive) | 1,500,000 CC upon committee acceptance | 27% |
| M2: Operator hardening and public reference deployment | 400,000 CC upon committee acceptance (300,000 CC hardening, 100,000 CC operating the public reference deployment through the end of the grant period) | 7% |
| M3: Token Standard V2 settlement migration | 500,000 CC upon committee acceptance | 9% |
| M4: Trading frontend | 400,000 CC upon committee acceptance | 7% |
| M5: Adopter-facing maintenance (6 months) | 400,000 CC upon committee acceptance | 7% |
| M6: External adoption | up to 2,300,000 CC, per-venue and completion tranches | 42% |
| **Total** | **up to 5,500,000 CC** | **100%** |

Engineering and maintenance (Milestones 1 through 5) is 3,200,000 CC, 58% of the request. The remaining 42% pays only against demonstrated adoption: the Milestone 6 tranches fire as independent venues go live, and pay nothing if none do. Milestone 1 is the largest single payment because it delivers the complete production backend. Percentages are rounded to the nearest whole number and may not sum to exactly 100. Each milestone carries a hard deadline, and a milestone not accepted by that deadline returns its allocated budget to the dev fund.

### Basis for Payment

Milestone 1 delivers the complete production backend, the bulk of the system's value and of the work behind it:

- **Already built, recognized by this milestone:** the off-chain order book and matching engine, the on-chain settlement layer (the settlement worker and the Daml contract suite), the API service and client, and the persistence layer, all validated in production and in use by the Nexode venue.
- **New work funded by this milestone:** generalizing the stack for third-party operators, test-gating public CI, published build artifacts, operator documentation and a localnet quickstart, and Helm charts.

The stack was built by 3 engineers over 4 months and hardened in production. Milestone 5's 400,000 CC prices 6 months of adopter-facing support at approximately 67,000 CC per month.

### Retroactive Compensation

Part of Milestone 1 recognizes work completed before this grant's approval. Where a deliverable's acceptance criteria were met and verifiable before the grant's effective date, K2F requests the Foundation authorize retroactive payment for it. Verification rests on dated evidence that becomes public at release: the project's git history, with commit and tag dates predating approval, the production deployment record on Canton mainnet, and the technical documentation already in the repository. The new Milestone 1 work (generalization for third-party operators, public CI, published artifacts, operator documentation, Helm charts) is delivered after approval and is not retroactive.

### Early-Delivery Bonus

Consistent with conventions in merged Development Fund grants, each engineering milestone (M1 through M4) delivered at least 1 month ahead of its estimated delivery date earns a bonus of 10% of that milestone's payment, up to 280,000 CC in total.

### Security Audit (pass-through, outside the base)

A third-party security audit of the settlement-critical paths is budgeted as a pass-through cost of approximately 200,000 CC, commissioned after Milestone 3 when the V2 settlement scope is stable, with vendor and scope agreed with the Tech & Ops security subcommittee beforehand. Including this pass-through and the early-delivery bonus, the maximum committee outlay is approximately 5,980,000 CC.

### Volatility Stipulation

The grant is denominated in fixed Canton Coin and will require a re-evaluation at the 6-month mark, with the Milestone 6 adoption window reviewed at the 12-month mark.

---

## Co-Marketing

Upon release, K2F Labs will collaborate with the Foundation on:

- A joint announcement of the open-source release.
- A technical deep-dive on the architecture: off-chain matching with non-custodial on-chain settlement through token-standard workflows.
- An operator workshop: deploying a venue from the published Helm charts.
- A case study of Nexode, a production venue running on Atomix.

---

## Motivation

Modern trading infrastructure is built around low latency and fast execution. A single active order book processes thousands of order placements, amendments, and cancellations per second, and matching must return far faster than a ledger transaction can commit. Canton's global synchronizer has a finite transaction rate, and running order placement and matching on-ledger cannot meet the latency and execution speed required by market makers and liquidity providers who run complex, high-frequency trading automation.

Atomix separates these concerns. Order matching runs off-chain in an in-memory order book written in Rust, at sub-1ms latency, and the matching engine holds no funds. Settlement is delegated on-chain, where the ledger processes non-custodial fund transfers through token-standard workflows. Custody, settlement, and token-standard activity all stay on Canton, while order matching scales with venue hardware and ledger traffic scales with actual trades. This is the pattern Token Standard V2's off-chain executor settlement path was designed to serve.

Canton's institutional asset base is growing faster than its trading infrastructure. Teams that want a trading surface for token-standard assets today face a substantial build-from-scratch problem. The workflow design is documented in references, but the operational system (a matching engine that stays consistent with ledger state, settlement that survives crashes and partial failures, market data that feeds real charting) is months of engineering and production learning.

Atomix removes that problem for the categories most likely to need a venue: tokenized-asset and RWA platforms that need a secondary market, brokers and regional venues extending onto Canton, and teams running RFQ or auction surfaces that want order-book infrastructure underneath. This direct beneficiary segment grows as Canton's institutional and RWA asset base grows. Indirectly, every token-standard issuer benefits, because an asset is more useful when there are venues where it can trade, so more venues deepen liquidity across the network. Market makers benefit from a standard venue API instead of per-venue integrations. Nexode shows the model working in production, a live prediction market venue on Canton mainnet running on Atomix today.

Every independent venue that launches on the stack brings order flow, settlement traffic, and token-standard adoption to the network, which is the outcome the fund's adoption-driven principle is designed to buy.

---

## Rationale

**Why this approach.** The ecosystem has funded the settlement primitive (Token Standard V2), a workflow-first reference DEX (#108), and a contracts library with a DEX reference implementation (the OpenZeppelin ecosystem stack). These are references and building blocks, not an operable venue. Getting from a reference to a production system (fault tolerance, recovery, observability, deployment) is the hard part, and Atomix has already done it in production.

**Relationship to other proposals.**

- **Reference DEX (#108):** complementary, not competing. That project is explicitly workflow-first, keeps order state on-chain as a learning reference, and states it is not a hosted exchange. Atomix occupies the production lane: off-chain order state for latency, on-chain funds state for custody, and operator packaging. Builders can learn the workflow model from the reference and deploy Atomix when they need a venue.
- **Token Standard V2:** Atomix is a consumer and a proof point. The off-chain executor settlement path lands in V2, and Milestone 3 puts a production venue on it, which is evidence the primitive works at operational scale.
- **OpenZeppelin ecosystem stack:** a contracts library and reference implementations on a 24-month cadence, with audit-and-teach goals. Atomix is operating infrastructure available now. Different layer, different timescale.
- **K2F Rust SDK proposal:** Atomix's ledger integration is built on the production Rust SDK that K2F has separately proposed to open-source and upstream. Both proposals are independent and neither depends on the other's approval, but they open-source complementary layers of the same production stack: the SDK for any Rust team integrating Canton, Atomix for teams operating venues. An adopter deploying Atomix gets a fully open toolchain from ledger client to trading frontend. Atomix is released with its SDK dependency satisfied under Apache-2.0, so it builds from public code regardless of whether the SDK proposal is funded.

**Why off-chain matching.** No ledger matches orders at venue latency, and no serious trading system asks it to. The architecture every production venue uses separates matching (fast, off-chain) from settlement (authoritative, on-chain). Canton is distinctive in making the settlement leg non-custodial through token-standard workflows. Atomix uses that to keep custody and settlement on the ledger while matching stays fast.

**Cost effectiveness.** The engineering was carried out and validated in production. The grant delivers it to the ecosystem at a fraction of the cost of a greenfield build, funds the work that makes internal software a public good (generalization, documentation, standards migration, operator support), and ties the largest share to externally verified adoption. Open-sourcing also surrenders the commercial exclusivity of the stack, and the adoption tranches compensate for equipping future competitors.

**Sustainability.** K2F runs Atomix in production powering Nexode, so core maintenance continues regardless of grant status. Milestone 5 funds the external-facing portion (adopter support, compatibility documentation) that commercial self-interest does not cover. If K2F's stewardship capacity ever becomes impaired, ownership of the repository (github.com/k2flabs/openatomix) transfers to the Foundation by mutual agreement.

---

## Team Background

K2F Labs is a Canton Foundation participant that has built on Canton for over a year and operates production infrastructure on Canton mainnet. The team is led by Kevin Ko (kko@k2flabs.com), an ex-Google engineer. Alongside Atomix, K2F built and maintains Walley, a self-custodial wallet on Canton mainnet.

During the Token Standard V2 design process, K2F provided design input on off-chain executor settlement and the allocation redesign through direct engagement with Wayne Collier (Digital Asset), grounded in the requirements of running exactly the settlement path this proposal open-sources.
