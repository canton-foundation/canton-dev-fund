# CIP-0100 Grant for Ledger Investigation for Development and Support (Daml Shell)

| Field | Value |
| :---- | :---- |
| Organization | Digital Asset |
| Author / Primary Contact | hrischuk-da |
| Status | Draft |
| Created | 2026-08-20 |
| Proposal Type | RFP-aligned |
| RFP / Roadmap Area | RFP 20 — Indexers (Developer Experience, Tooling & Education) |
| Champion | Curtis Hrischuk |
| Total Funding Request | 1,050,000 CC |
| Project Duration | Approximately 8 months |
| Label | daml-tooling |
| Approved |  |
| PR |  |

---

# Abstract

This proposal is to open-source the [Daml Shell](https://docs.canton.network/sdks-tools/cli-tools/daml-shell#daml-shell), a high-performance REPL and forensic investigation tool for Canton 3 ledgers. Built on the Participant Query Store (PQS), the Daml Shell enables validator operators and dApp teams to perform historical root-cause analysis and inspection.  These are necessary capabilities to diagnose development or production issues like stalled continuations, unexpected delegations, and automation errors. Unlike public block explorers, Daml Shell uniquely queries both Global and Dedicated Synchronizer data from PQS, serving as a critical diagnostic tool for institutional multi-synchronizer workloads.

This grant covers the transition to an open-source model. It seeks 1,050,000 Canton Coin (CC) over approximately 8 months. Most of that time allows new adoption to occur and be recorded.

Ongoing maintenance and major architectural upgrades are out of scope for this grant and will be addressed through separate funding proposals.

# Motivation

Standard network inspection tools are architecturally insufficient for institutional dApp support on the Canton Network. Public explorers are restricted to the Global Synchronizer and cannot see into Dedicated Synchronizer data. The Ledger API (LAPI) is designed for real-time throughput, not historical investigation; it lacks the efficiency to easily answer complex temporal questions, and it cannot answer them at all once data has been archived or pruned. PQS holds the historical data, but investigation with it is inefficient and error-prone because SQL queries must be written by hand.

The Daml Shell facilitates the complex archival navigation and state reconstruction needed for development and production diagnostics. Daml Shell's CLI obviates the need to write manual SQL queries for investigation, ensuring the full potential of PQS is realized. It is a human-centric tool for interpreting deep ledger data. This proposal makes the Daml Shell a common good, in line with the purpose of the ecosystem development fund, and standardizes these investigation capabilities across the network. This also opens it up to enhancements by the community.

The Foundation's [Q2 2026 DevRel Survey](https://docs.google.com/document/d/1_2LaIJiYo3-6NHM1H1HqvTP1NFlhCH6Czr2yjV2Q_3k/edit) rates Transaction Debugging & Observability the weakest-rated area of the builder experience. Of its 35 respondents, 9 already use the Daml Shell regularly and a further 4 were unaware the tool exists — so open-sourcing and announcing it addresses 13 of 35 respondents, about 37% of the surveyed ecosystem. These counts are derived from the survey's raw responses and can be presented on request.

The Daml Shell has proven essential for rapidly diagnosing real-world production issues such as:

- Query the state of an archived or active contract ID
- Review the current Active Contract State
- Diagnose a stalled workflow
- Identify contract state inconsistencies
- Investigate unexpected state or delegations
- Correlate log information (e.g., `application-id`, `workflow-id`, or `command-id`) with the associated transaction
- Resolve automation errors

These are real world issues diagnosed by developers, operators, or support teams already using Daml Shell. By reconstructing historical transaction flows and contract states, the Daml Shell accelerates the diagnosis of complex dApp support requests, and helps to maintain low time-to-resolve service level objectives.

The Daml Shell bridges the "semantic gap" between raw database tables and business logic with the following capabilities:

- **Native Data Interface:** Navigates JDBC/PostgreSQL schemas for high-performance querying directly against the PQS database.
- **Forensic Export:** Exports verifiable "data packages" in CSV or JSON for seamless peer review and audit.
- **External Integration:** Supports Unix piping (e.g., `grep`, `wc`, `less`) to manipulate and paginate production data using standard command-line utilities.
- **Low-Friction UX Discovery:** Offers deep semantic tab-completion for Template IDs, Contract IDs, and query parameters.
- **Interactive "Time Travel":** Shifts the operator's viewpoint to any historical ledger moment by adjusting offsets, with automatic state reflection.
- **Advanced Debugging Utilities:**
  - **Difference Engine (`diff`):** Highlights deltas between contract IDs to pinpoint subtle state changes.
  - **Conditional Filtering:** Refines contract list queries using `where` clauses on specific payload fields.
- **Semantic Metadata Insights:** Provides instant visibility into template versioning (Package IDs) and ledger event details (Create vs. Consuming Exercise) directly in the prompt.
- **Scalability:** It has proven itself in Canton 2.x production environments with millions of contracts, and this will extend to Canton 3 environments.

# Rationale

The Daml Shell is already deployed in Canton 2.x production environments, delivering the following critical benefits:

- **Actionable Support:** Because it transforms raw SQL into a human-navigable environment, a support engineer can identify a root cause in minutes rather than days.
- **Validator Sovereignty:** Empowers validator operators to audit their own private environments locally, ensuring that institutional privacy does not come at the cost of operational blindness.
- **Auditability:** The export functionality allows data to be presented as evidence to stakeholders or regulators.

Daml Shell is a third-generation implementation which incorporates the learnings from the prior two generations. Rather than building a new investigation tool from scratch, this grant open-sources an existing, production-proven codebase — the same approach taken for [PQS](https://github.com/canton-foundation/canton-dev-fund/blob/main/proposals/2026-03-DA-OSS-validator-indexer-pqs.md), on which the Daml Shell depends. Extending the Ledger API or PQS to cover this need is not a viable alternative: LAPI is architecturally optimized for real-time event streaming rather than historical query, and PQS deliberately exposes a raw SQL surface. The Daml Shell is the human-facing UX over that surface, not a replacement for either.

# Specification

## 1. Objective

The Daml Shell is production-proven but not Open Source. This grant makes it a common good: relicensed under [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0), publicly available, and released with no lock-in or licensing risk for validator operators and dApp teams who need to navigate local ledger data via the Participant Query Store. Eventual governance may transfer to the [Canton Foundation](https://canton.foundation/) in line with the PQS transition.

## 2. Implementation Mechanics

Making the Daml Shell functionality available as a common good to the ecosystem includes:

- **Codebase Sanitization:** Removal of proprietary dependencies and formal release under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0).
- **CI/CD builds:** Verifiable CI/CD pipeline execution passing 100% of participant-level integration tests.
- **Dual-Repository Handover:** Transfer of the sanitized Daml Shell repository to [canton-foundation](https://github.com/canton-foundation) if and when PQS transitions.
- **SDK Integration:** Automating build alignment to ensure the Daml Shell is included in minor SDK releases.
- **User adoption:** Demonstrate value by having developers, operators, or support teams attest to adopting the Daml Shell.

## 3. Architectural Alignment

Architecturally, the Daml Shell functions as a lightweight, stateless console application, designed for on-demand deployment against the Participant Query Store. Upon transition to open source, the repository will support community-driven enhancements and contributions.

This proposal responds to **RFP 20 (Indexers)** in the [2026–2028 Strategic Roadmap](https://github.com/canton-foundation/canton-dev-fund/blob/main/2026-2028-strategic-roadmap.md), which seeks node-local indexers and debugging tools that preserve Canton's privacy boundaries. The RFP asks applicants to identify four things:

- **Data required.** Contract create and archive events, contract payloads, transaction metadata (`application-id`, `workflow-id`, `command-id`), ledger offsets, and package IDs — all read from the Participant Query Store.
- **Data provenance.** Entirely node-local. PQS is populated from the operator's own participant node via the Ledger API. The Daml Shell reads no publicly observable protocol data and does not query Scan or any block explorer.
- **Resilience to metadata changes.** Unaffected. The Daml Shell does not depend on Mediator-exposed metadata or on involved-party information being publicly visible, so restricting that exposure does not degrade it.
- **Privacy and access control.** The Daml Shell inherits the participant node's existing authorization boundary — an operator sees only the contracts their own node is party to. Forensic exports are written locally and disclosed at the operator's discretion.

## 4. Backward Compatibility & Continuity

The transition to open source will have no impact on the Daml Shell's existing functionality or user experience, ensuring complete backward compatibility. Existing workflows remain unchanged, and all current documentation remains valid and accessible in the [Canton Network Docs](https://docs.canton.network/sdks-tools/cli-tools/daml-shell#daml-shell).

# Milestones and Deliverables

## M1: Daml Shell as a common good

| Field | Value |
| :---- | :---- |
| Start Date | One month after approval of the grant proposal |
| Estimated Delivery | 4 months after approval |
| **Focus** | Codebase sanitization, decoupling from proprietary dependencies, Daml Shell build and release, public deployment |

**Deliverables / Value Metrics:**

- CI/CD builds using GitHub Actions
- Open-source Apache 2.0 git repository
- Automated build alignment so the Daml Shell is included in minor SDK releases
- Documentation is already available at [docs.canton.network](https://docs.canton.network/sdks-tools/cli-tools/daml-shell#daml-shell); no new documentation deliverable is required

**Acceptance Criteria:**

- Build and test logs are provided
- Verified inclusion of the Daml Shell in an official Daml SDK minor release

## M2: Five additional ecosystem teams adopt the Daml Shell in development or production

| Field | Value |
| :---- | :---- |
| Start Date | Upon acceptance of Milestone 1 |
| Estimated Delivery | 4 months after M1, to allow for awareness and adoption by the community |
| **Focus** | Use by the ecosystem |

**Deliverables / Value Metrics:**

- At least five **additional** PQS users adopt the Daml Shell in development or production, after M1 is delivered.

**Acceptance Criteria:**

- Signed attestations from the adopting validator operators or dApp teams, published technical case studies, or verifiable deployment configurations.

# Funding

**Total Funding Request: 1,050,000 Canton Coin (CC).**

| Milestone | Amount (CC) | Trigger |
| :---- | :---- | :---- |
| M1 — Daml Shell as a common good | 300,000 | Committee acceptance of the OSS repository |
| M2 — Ecosystem adoption | 750,000 | Verification of five users adopting the Daml Shell who were not users prior to Milestone 1 being achieved |

## Maintenance

This grant is strictly for the open-source transition and does not cover ongoing operational maintenance. Following the successful completion of Milestone 1, all repository stewardship — including security SLAs, bug fixes, CI/CD pipeline management, and external PR reviews — will transition to the purview of the [Development Fund Proposal for Maintenance of Daml Open Source](https://github.com/canton-foundation/canton-dev-fund/blob/main/proposals/2026-03-DA-daml-open-source.md), approved 2026-04-15.

## Volatility Stipulation

The project duration is approximately 8 months, exceeding the 6-month threshold, and is denominated in fixed Canton Coin. At the 6-month mark, the Committee may request a scope checkpoint to confirm the project remains on schedule and within the agreed deliverables.

## Timeline Risk Management

**Acceleration Bonus:** Delivery of Milestone 2 at least one month ahead of schedule (by Month 7 post-approval) triggers a +10% bonus on the final milestone payout.

**SLA Penalty:** A 10% reduction in the respective milestone payment will be applied for every full month of delay beyond the original estimated delivery date. If a milestone is more than three full months delayed, the terms of this agreement will be revisited.

# Co-Marketing

Following Milestone 1, the open-source release will be announced in the [Canton Network forum](https://forum.canton.network/), the Canton release notes, and through documentation updates. No further co-marketing support is requested from the Foundation.
