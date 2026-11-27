
## Development Fund Proposal

| Field | Value |
| :---- | :---- |
| Organization | Trade Proto Inc. |
| Author / Primary Contact | Joshua Spooner, Founder & CEO  ([@tradeproto](https://github.com/tradeproto))|
| Status | Submitted |
| Created | 2026-12-27 |
| Proposal Type | RFP-aligned |
| RFP / Roadmap Area | RFP-12 RWA Standards, area 2: Daml and Institutional RWA Workflow Standards (Financial Markets, Standards & Verification) |
| Champion | Needs Champion |
| Total Funding Request | 1,800,000 CC |
| Project Duration | Delivery 5 months. Maintenance commitment 12 months after Milestone 3 |
| Label | financial-workflows-composability |

---

## Abstract

Bank guarantees and standby letters of credit underpin trade finance, lending and collateral. They live in bank systems and move as authenticated SWIFT Category 7 messages (MT760, MT767, MT765, MT769, MT785 and related). Today, any Canton application that wants to rely on one must build its own model of the instrument, its own message mapping and its own rules for when the guarantee is live, reduced, drawn or finished. Each app does it differently, so a guarantee recognised by one app cannot be relied on by another.

This proposal delivers an open **Bank Guarantee Evidence Standard** for Canton:
- Daml interfaces for a bank-confirmed guarantee record and its lifecycle;
- a reference mapping from SWIFT Category 7 messages to those lifecycle steps;
- a reservation interface, so a lender can rely on a guarantee for one exposure at a time;
- a conformance test kit.

It is published under Apache-2.0 and maintained by Trade Proto,  which is building its own credit product on it.

---

## Specification

### 1. Objective

One objective: give Canton applications a shared, conformance-tested way to represent and rely on a bank-confirmed guarantee, where the issuing bank's own records remain the controlling record.

### 2. Implementation Mechanics

**Guarantee evidence interface.** A Daml interface for a record that mirrors one bank undertaking. It carries:
- issuing bank, beneficiary, applicant, undertaking reference, amount, currency and expiry;
- the instrument class (financial standby, performance standby, trade item);
- the status.

Lifecycle choices: issue, amend, demand, demand refused, demand paid (partial or full), reduce, release and expiry.

**Invariants the standard fixes:**
- One record per issuer and undertaking reference. A record that has been closed can never be issued again.
- A record closes only on a full release, a fully paid demand, or expiry with no demand pending and confirmed by the bank. A non-extension notice (MT785) does *not* close it: the guarantee remains live and drawable.
- No transfer choice. Reliance is by the named beneficiary only.
- Every lifecycle step references an authenticated bank message and the bank's confirmation. The issuing bank, or its appointed attestors, are signatories. Other parties see only what they are stakeholders to.

**Attestation gate.** Lifecycle steps can require an M-of-N quorum of distinct, unexpired attestor confirmations, each usable once. No single key can move a record.

**Reservation interface.** A lender reserves a guarantee against one exposure, and the beneficiary must consent. The record cannot back two exposures at once. Release occurs on repayment, and an amendment that cuts cover is surfaced to every reservation holder.

**SWIFT Category 7 reference mapping.** A specification and reference parser that turn MT760, MT767, MT765, MT786, MT769 and MT785 into the lifecycle choices above. It refuses unauthenticated, unmatched, open-ended or unreadable messages. The mapping is validated against the SWIFT standards release in force and against anonymised bank sample messages. It is read-only: it never moves money.

**Conformance test kit.** Daml Script tests any implementation of the interfaces must pass: lifecycle, invariants, quorum and reservation. A Daml Script package lets other apps prove conformance in CI.

**Starting point.** Trade Proto has built and tested a version of this model internally: 46 Daml tests and 21 connector tests. The grant pays to:
- turn it into a provider-neutral standard;
- separate the interfaces from our implementation;
- validate the message mapping with banks;
- support adoption by other teams.

### 3. Architectural Alignment

- **RFP-12, area 2:** answers "Repo, collateral, lending, and servicing workflows", "Integration mappings for existing institutional systems" and "Conformance tests and reference implementations".
- **Privacy:** uses Canton's sub-transaction privacy as designed. Each party sees only its part, and nothing is published to the global synchronizer beyond what the participants choose.
- **Daml interfaces:** follows the interface style of the Canton token standard (CIP-0056). The guarantee record is a *non-transferable evidence record*, not a token. It is designed to compose with token-standard assets when a guarantee backs a tokenised exposure.
- **Identity and credentials:** compatible with the Identity and Metadata SIG's credential work. A bank's identity and attestor status are referenced, not redefined.

### 4. Backward Compatibility

*No backward compatibility impact.* This is a new, additive package.

---

## Milestones and Deliverables

### Milestone 1: Open standard and reference implementation
- **Committed Date:** 6 weeks after approval
- **Focus:** publish the interfaces, invariants and reference implementation for public review.
- **Deliverables / Value Metrics:**
  - Apache-2.0 repository with Daml interfaces, reference implementation, documentation and worked examples.
  - Specification reviewed in the Financial Markets SIG, with written feedback from at least 2 other Canton teams incorporated.

### Milestone 2: Bank message mapping and conformance kit
- **Committed Date:** 12 weeks after approval
- **Focus:** make the standard usable against real bank traffic.
- **Deliverables / Value Metrics:**
  - SWIFT Category 7 mapping specification and reference parser, validated against anonymised sample messages from at least 1 bank.
  - Conformance test kit, published as a Daml Script package.
  - Trade Proto's own implementation passes the kit.

### Milestone 3: Ecosystem adoption
- **Committed Date:** 5 months after approval
- **Focus:** adoption beyond Trade Proto.
- **Deliverables / Value Metrics:**
  - At least 2 Canton applications other than Trade Proto integrate the interfaces, or pass the conformance kit, on DevNet or TestNet.
  - At least 1 bank runs the mapping in read-only shadow mode against its own guarantee messages.

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:
- deliverables completed as specified for each milestone;
- demonstrated functionality or operational readiness;
- documentation and knowledge transfer provided;
- alignment with the stated value metrics.

**Project-specific:**
- **M1:** independent SIG review, and incorporated feedback from at least 2 other teams.
- **M2:** mapping validated against real bank sample messages.
- **M3:** independent adoption, meaning at least 2 non-Trade Proto applications and 1 bank in shadow mode. Payment for M3 depends on this adoption, not on code delivery.

---

## Funding

**Total Funding Request:** 1,800,000 CC

### Payment Breakdown by Milestone
- Milestone 1 (open standard and reference implementation): 600,000 CC upon committee acceptance
- Milestone 2 (bank message mapping and conformance kit): 600,000 CC upon committee acceptance
- Milestone 3 (ecosystem adoption): 600,000 CC upon final release and acceptance, including the 12-month maintenance commitment

**Other funding disclosed:** Trade Proto has applied to the Palladium Labs Genesis Fund for related Canton work. No deliverable will be paid twice. If any milestone here overlaps a funded Palladium milestone, we will reduce this request accordingly before the vote.

### Volatility Stipulation
The project duration is under 6 months. Should the timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones will be renegotiated to account for significant USD/CC price volatility.

---

## Co-Marketing

Upon release, Trade Proto will collaborate with the Foundation on:
- announcement coordination;
- a technical blog post on modelling bank undertakings on Canton;
- a walkthrough for developers integrating the interfaces.

---

## Motivation

Guarantees and standby letters of credit are among the most common bank instruments in trade and commodity finance. They are also exactly the kind of bank-confirmed fact that Canton's institutional users need to rely on, in lending, collateral and settlement workflows.

Without a standard:
- every app that touches them rebuilds the same model and the same message mapping;
- results differ;
- no app can rely on another's records.

A shared standard means one implementation of the hard parts (the lifecycle rules, the non-extension edge case, the burn rules, the message mapping) and conformance that other apps and banks can check.

We expect the main users to be Canton lending, trade-finance, collateral and RWA applications that need bank-backed cover.

---

## Rationale

We chose to extend, not replace:
- **Interface style** follows the existing Daml interface conventions and the token standard.
- **Bank messages:** the standard maps the bank's own authenticated messages rather than inventing a new message format, so banks change nothing.
- **Controlling record:** the issuing bank's ledger stays the controlling record. The Canton record is evidence that mirrors it and refuses anything it cannot reconcile.

**Alternatives considered:**
- *Modelling the guarantee as a transferable token:* rejected. A guarantee is a promise to a named beneficiary, so making it transferable misrepresents the legal instrument.
- *Leaving each app to build its own model:* this is the status quo, and it prevents interoperability.

**Sustainability:** Trade Proto builds its own product on this standard. We will maintain the repository for at least 12 months after Milestone 3, review outside contributions, and propose it as a CIP if adoption warrants.
