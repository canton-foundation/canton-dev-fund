# Development Fund Proposal

## SV Lock Insights — Operational Intelligence for Canton Super Validators

**Author:** Yury Korzun ([yury.korzun@pixelplex.io](mailto:yury.korzun@pixelplex.io))  
**Organization:** PixelPlex  
**Website:** <https://ccview.io>  
**Existing Prototype:** <https://ccview.io/super-validators/?table=svLocking>  
**Tech & Ops Champion:** _[To be confirmed — required for external submissions]_  
**Status:** Submission Draft  
**Created:** 2026-04-09  
**Updated:** 2026-04-14

---

## Abstract

This proposal requests funding from the Canton Development Fund to deliver **SV Lock Insights**, a production-grade operational intelligence layer for Canton Network Super Validators.

SV Lock Insights builds on an existing, publicly available prototype and expands it into a full operational product that helps Super Validators:

- maintain compliance with locking and tier requirements,
- understand current and future unlocking exposure,
- reconcile rewards and lock-related value flows,
- receive proactive alerts before operational issues become incidents.

The project delivers read-only analytics infrastructure — a developer and operator tool aligned with CIP-0082's stated scope of dev tools, critical infrastructure, and long-term ecosystem utility.

---

## About the Proposer

PixelPlex is a General Partner of the Canton Foundation and an active contributor to the Canton ecosystem. The team has delivered several production systems that are in daily use across the network:

- **CCView Block Explorer** ([ccview.io](https://ccview.io)) — a Canton Network explorer widely used by the entire ecosystem and the Canton Foundation itself. CCView's API layer serves data to numerous top parties including Canton Foundation, Modulo Finance, CBTC, Circle, and others.
- **Console Wallet** — one of the largest wallet ecosystems on Canton, supporting EVM compatibility, bridges, swaps, and other features across web browser extension and mobile apps.
- **Governance contributions** — PixelPlex co-authored the dApp CIP and is actively working on additional proposals for network improvements.

The existing SV locking dashboard prototype at [ccview.io/super-validators](https://ccview.io/super-validators/?table=svLocking) demonstrates both the technical approach and the team's ability to deliver Canton-specific analytics infrastructure. This proposal extends proven work rather than starting from scratch.

---

## Problem Statement

Super Validators are expected to monitor locking positions, tier thresholds, reward flows, unlocking schedules, and operational buffers with a high degree of accuracy. In practice, much of this analysis is fragmented across raw wallet activity, manual calculations, spreadsheets, and ad hoc interpretation of transaction history.

This creates several concrete problems:

1. **Compliance risk.** Operators may not immediately see how much additional locking is required to preserve a tier, or how much can be safely unlocked without falling below a threshold.
2. **Poor visibility into future state.** Unlocking tranches, gradual unlock rates, and reward interactions are difficult to reconstruct from raw data alone.
3. **Delayed reaction time.** Without alerts, operators only discover problems after a threshold is crossed or a buffer has already become too thin.
4. **High manual overhead.** Wallets and transactions require manual interpretation to distinguish lock, unlock, treasury, reward, or ambiguous flows.
5. **No standard operational view.** Different operators may arrive at different conclusions from the same data because there is no consistent analytics layer focused on SV operations.

---

## Objective and Ecosystem Value

### Objective

Turn the current dashboard prototype into a production-ready Super Validator intelligence and risk management system with notification capabilities, unlock flow visibility, and a structured maintenance period.

### Ecosystem Value

- **Reduces avoidable operator error** by translating protocol state into clear, actionable views.
- **Improves resilience** by surfacing warnings before tier, locking, or reward issues become urgent.
- **Standardizes visibility** across Super Validators through a shared, repeatable analytics model.
- **Lowers operational overhead** by automating classification, monitoring, and reconciliation.
- **Creates reusable ecosystem tooling** that can inform future analytics, reporting, and operational best practices across the Canton network.

This proposal is aligned with CIP-0082's stated purpose of supporting dev tools, critical infrastructure, and long-term ecosystem utility.

---

## Scope

### In Scope

- Super Validator lock and tier compliance analytics
- Recommendation logic and action-oriented UI
- Unlocking tranche detection and projections
- Email-based notifications for configurable alert conditions
- Documentation, operator feedback loops, and production support

### Out of Scope

- Validator custody or transaction execution
- Protocol-level changes to Canton Network or Splice
- Guaranteed predictive calculations for all future validator actions or tier changes
- Custom operator workflows outside the general product scope

---

## Technical Approach

SV Lock Insights is delivered as an extension of the existing [ccview.io](https://ccview.io) analytics stack.

### Data Sources

The system connects to the Canton Ledger API, subscribes to the relevant event streams, and parses all lock, unlock, reward, and wallet-related events into a structured database for efficient querying and analytics. This approach gives the system access to the full history of validator-relevant activity and allows near-real-time updates as new events are committed to the ledger.

No private or permissioned data access is required. The system operates entirely on publicly observable network state.

### Architecture

The system uses a layered architecture:

1. **Data ingestion layer.** A Rust-based pipeline that connects to the Ledger API, subscribes to event streams, parses and normalizes raw transaction and locking data, and persists it into a structured relational store. Handles deduplication, gap detection, and schema versioning as the upstream API evolves.

2. **Rules and computation layer.** Applies tier logic (thresholds, grace periods), computes unlocking schedules (tranche timing, gradual release rates), calculates buffer margins, and evaluates alert conditions. This layer encodes the current SV locking rules as documented in CIP-0105 and related governance decisions.

3. **Presentation layer.** Web-based dashboard views including: current tier status and compliance gaps, historical locking/unlocking timelines, projected unlock exposure, and action-oriented recommendation panels. Built on the existing ccview.io frontend stack.

4. **Notification layer.** Configurable alert engine that evaluates conditions from the rules layer and delivers notifications via email. Includes deduplication logic, delivery confirmation, and threshold configuration per operator.

### Tech Stack

- **Backend:** Rust-based data pipeline and API services
- **Database:** PostgreSQL for structured event storage and historical analytics
- **Frontend:** React-based dashboard (existing ccview.io stack)
- **Infrastructure:** Cloud-hosted, with monitoring and uptime tracking

---

## Architectural Alignment

SV Lock Insights is **additive infrastructure** that sits on top of Canton's existing public data layer. It does not require changes to Canton core, Splice, Daml, or any protocol-level component.

- **Read-only.** The system only reads publicly available data from the Canton Ledger API. It does not custody funds, sign transactions, initiate transfers, or alter any on-ledger state.
- **No protocol dependencies.** The system does not depend on custom endpoints, privileged access, or protocol modifications. It consumes the same public ledger events that any participant can observe.
- **Complementary to existing tooling.** SV Lock Insights provides an operator-focused analytics layer that complements the raw data access available through Canton explorers and the Ledger API.

---

## Current State

A proof-of-concept version of the SV locking dashboard is live at [ccview.io/super-validators](https://ccview.io/super-validators/?table=svLocking) and demonstrates the feasibility of the analytics approach. The existing prototype provides:

- Basic SV locking position views
- Tier assignment visibility
- Initial data collection and normalization pipeline

The prototype does **not** yet provide:

- Recommendation logic for maintaining or improving tier status
- Unlocking tranche analytics and forward-looking timelines
- Email alerting for operational conditions
- Structured support and iteration after initial delivery

The requested funding hardens this prototype into a production-ready product and extends it with the capabilities listed above.

---

## Milestones

### Milestone 1 — Production Baseline and Hardening

**Funding requested:** 150,000 CC  
**Deliverables are forward-looking** — while the prototype exists, this milestone covers the production hardening work required to turn it into a reliable operational baseline.

#### Deliverables

- Production-hardened Rust data pipeline with monitoring and automated error recovery
- Validated tier calculation logic with test coverage against known SV states
- Baseline API for programmatic access to locking and tier data
- Operator-facing documentation covering data model, update frequency, and known limitations
- Public availability of the production dashboard at a stable URL

#### Acceptance Criteria

- Dashboard is publicly accessible and displays current SV locking positions and tier assignments
- A committee member or delegate can verify that tier calculations match independently observed on-ledger state for at least 3 Super Validators
- Data pipeline runs without manual intervention for at least 7 consecutive days with documented uptime
- Documentation is published and covers data sources, refresh cadence, and known edge cases

---

### Milestone 2 — Notification Mechanism

**Funding requested:** 160,000 CC  
**Estimated duration:** 3–4 weeks after Milestone 1 acceptance

#### Deliverables

- Configurable alerting framework with support for threshold-based conditions (e.g., "notify if buffer drops below X%" or "notify if tier change is projected within Y days")
- Dashboard-native notification center
- Email delivery channel with per-operator configuration
- Operator-facing configuration UI for alert rules and delivery preferences
- Alert deduplication and delivery confirmation logic

#### Acceptance Criteria

- A committee member or delegate can configure a tier-drop alert for a specific SV and receive a notification via email when the condition is triggered
- Alerts fire within 15 minutes of the triggering condition being detected in the data pipeline
- At least 3 distinct alert condition types are available for configuration
- Alert delivery is logged and auditable

---

### Milestone 3 — Unlock Flow Visibility

**Funding requested:** 120,000 CC  
**Estimated duration:** 3–4 weeks after Milestone 2 acceptance

#### Deliverables

- Unlock flow monitoring showing active, pending, and completed unlock tranches per SV
- Historical unlock timeline view
- Forward-looking projection of upcoming unlocks with estimated dates and amounts (where data quality permits)
- Integration of unlock data into the existing alert framework (e.g., "large unlock completing within X days")

#### Acceptance Criteria

- A committee member or delegate can view the unlock history and upcoming unlock schedule for at least 3 Super Validators and verify consistency with on-ledger data
- The dashboard displays a timeline-style view of unlock progression
- Unlock-related alert conditions are available in the notification framework

---

### Milestone 4 — Maintenance and Continuous Improvement

**Funding requested:** 300,000 CC (50,000 CC per month, 6 monthly payouts)  
**Duration:** 2 years after Milestone 3 acceptance (6 months funded, 18 months continued at no additional cost)

**Months 1–6 (funded):** Each monthly cycle includes:

- Bug fixes and stability improvements
- At least one dashboard or UX update per month incorporating operator feedback
- Adjustments to data mapping, tier logic, or alert conditions if governance rules change
- Incremental feature improvements based on production usage patterns

**Months 7–24 (unfunded commitment):** PixelPlex commits to continued maintenance of the dashboard at no additional cost, including:

- Bug fixes and stability improvements
- Data pipeline adjustments if upstream APIs or protocol parameters change
- System uptime and operational continuity

#### Acceptance Criteria (Months 1–6, funded)

- Active maintenance with response to critical issues within 48 hours
- At least one documented update per month (UX improvement, feature addition, or data model adjustment based on operator feedback)
- Published changelog of all updates made during the period
- System maintains at least 95% uptime (excluding planned maintenance windows)

Monthly payouts are contingent on the above criteria being met for the preceding month.

#### Commitment (Months 7–24, unfunded)

- Continued system availability and uptime
- Response to critical bugs and data pipeline issues
- Adjustments necessary to maintain compatibility with protocol or API changes

---

## Funding Summary

| Milestone | Description | Funding (CC) |
|-----------|-------------|-------------|
| 1 | Production Baseline and Hardening | 150,000 |
| 2 | Notification Mechanism | 160,000 |
| 3 | Unlock Flow Visibility | 120,000 |
| 4 | Maintenance and Continuous Improvement (6 × 50,000 funded + 18 months unfunded) | 300,000 |
| **Total** | | **730,000** |

---

## Volatility Stipulation

Per CIP-0100:

- Milestones 1–3 are fixed in Canton Coin. The recipient carries upside and volatility risk.
- Milestone 4 includes 6 months of funded maintenance with monthly payouts. If the CC/USD exchange rate moves ±40% relative to the rate at the time of Milestone 3 acceptance, either party may request renegotiation of the remaining monthly amounts. The subsequent 18-month unfunded maintenance commitment is not subject to renegotiation.

---

## Delivery Timeline

| Phase | Estimated Timing |
|-------|-----------------|
| Milestone 1 — Production Baseline | Within 2–3 weeks of approval |
| Milestone 2 — Notifications | 3–4 weeks after M1 acceptance |
| Milestone 3 — Unlock Visibility | 3–4 weeks after M2 acceptance |
| Milestone 4 — Maintenance | 2 years after M3 acceptance (6 months funded + 18 months unfunded) |

Total new development (M1–M3): approximately **2–2.5 months** after approval, followed by a **2-year maintenance commitment** (6 months funded with monthly updates, 18 months continued maintenance at no additional cost).

---

## Open Source and Public Good Considerations

The SV Lock Insights frontend — including all tier calculation logic, recommendation rules, and unlock projection math — will be published as open-source under the Apache 2.0 license. Any explorer, analytics app, or tooling provider on Canton may freely use, integrate, or build on these components at no cost.

The backend indexer and data pipeline remain privately operated by PixelPlex, where the dashboard is hosted at [ccview.io](https://ccview.io) as a free, publicly accessible service for any Super Validator or ecosystem participant.

This approach ensures the analytical value of the project is fully reusable across the ecosystem, while maintaining a reliable hosted service backed by the 2-year maintenance commitment in Milestone 4.

---

## Dependencies and Assumptions

This proposal assumes:

- Continued availability of the Canton Ledger API and related public endpoints needed to observe lock, unlock, reward, and wallet activity.
- No mandatory core protocol changes are required for the implementation.
- Timely clarification of edge-case tier rule interpretation from the Tech & Ops Committee if required during development.

If protocol or endpoint changes occur during the maintenance period (Milestone 4), they will be handled within that milestone's scope where feasible. Changes requiring substantial rework beyond the maintenance budget would be scoped as a separate follow-up proposal.

---

## Security and Operational Considerations

SV Lock Insights is a **read-only operational intelligence tool**. It will not:

- custody user funds,
- initiate transactions,
- sign on behalf of validators,
- alter validator or protocol state.

Notification configuration and any administrative features are restricted to authorized maintainers. No privileged access to operator wallets or keys is required or requested.

---

## Co-Marketing and Ecosystem Contribution

No separate co-marketing budget is requested. However, this proposal would benefit from normal ecosystem coordination after approval, including:

- Permission to publicly announce the grant
- Permission to publish milestone updates
- One shared ecosystem demo or walkthrough upon material completion
- Inclusion of the delivered dashboard in relevant Canton ecosystem tooling references if the committee finds it appropriate

---

## Backward Compatibility

This proposal is entirely additive. SV Lock Insights does not require changes to Canton core, Splice, Daml, or any existing protocol or smart contract component.

---

## Rationale

**Why a dedicated SV operations dashboard?**
Super Validators currently rely on manual analysis of raw on-ledger data to monitor compliance, locking positions, and tier status. A shared analytics layer reduces duplicated effort across operators and lowers the risk of misinterpretation.

**Why fund this through the Development Fund?**
This is operator tooling that serves the common good of the validator set. It is infrastructure-like analytics — not a private product — that improves how ecosystem participants operate. CIP-0082 explicitly names dev tools, critical infrastructure, and reference implementations as fund targets.

**Why include a maintenance milestone?**
The Canton network is actively evolving. Tier rules, locking parameters, and data endpoints may change. A dashboard that is not maintained quickly becomes unreliable. PixelPlex commits to a full 2-year maintenance window — 6 months of funded updates and improvements with monthly payouts, followed by 18 months of continued maintenance at no additional cost. This ensures the tool remains useful well beyond its initial delivery.

**Why PixelPlex?**
As a Canton Foundation General Partner and the team behind CCView and Console Wallet, PixelPlex has deep familiarity with Canton's data layer, governance processes, and operator needs. The existing prototype demonstrates both the technical approach and the team's track record of delivering production Canton infrastructure used daily across the ecosystem.
