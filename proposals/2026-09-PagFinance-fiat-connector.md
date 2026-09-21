## Development Fund Proposal

**Organization:** PagFinance
**Author / Primary Contact:** Andre Straube, Founder & CEO, PagFinance (GitHub: @andrestraube)
**Status:** Submitted
**Created:** 2026-09-21
**Proposal Type:** RFP-aligned
**RFP / Roadmap Area:** Financial Markets, Standards & Verification, RFP 13 (Payments and DeFi)
**Champion:** Needs Champion
**Total Funding Request:** 6,200,000 CC
**Project Duration:** 6 months for Milestones 1 to 4, plus a performance-based adoption bounty (Milestone 5) running up to 12 months after Milestone 4
**Label:** financial-workflows-composability
**SIG Alignment:** Financial Workflows & Composability

---

## Abstract

This proposal funds an open-source reference implementation of a fiat connector for the Canton Network: a reusable pattern that moves value in both directions between on-ledger token settlement and an off-ledger bank rail. It is proven through the first BRL (Brazilian Real) corridor on the network, settled via PIX, Brazil's central-bank instant payment system, running off-ramp (token to fiat) and on-ramp (fiat to token).

The deliverable is a rail-agnostic Daml package built on the Canton Network Token Standard (CIP-0056), plus an off-ledger connector and an integration blueprint that let any Canton participant operating a validator node connect on-ledger settlement to an off-ledger instant-payment, wire, ACH, or SWIFT rail with atomic delivery-versus-payment guarantees. Nothing in the on-ledger contracts is specific to PIX or to Brazil: the templates describe a generic fiat settlement (an amount in any currency, a hashed payout destination, a settlement reference the rail returns on confirmation), and all rail-specific knowledge lives in the off-ledger connector. PagFinance is the first implementer and operates the live BRL corridor via PIX, but the contract templates, the settlement pattern, the connector, and the documentation are released as a common good under Apache-2.0 for the whole ecosystem.

The value to Canton is a repeatable, bidirectional pattern for fiat connectivity and the network's first connection to the Brazilian market, where PIX serves over 180 million users and moves more than US$5T annually.

---

## Specification

### 1. Objective

Canton has no documented, reusable bridge between on-ledger token settlement and a genuinely off-ledger fiat rail: a wire, ACH file, or SWIFT message that clears in a bank's own system rather than as a token on Canton. What Canton documents instead is the opposite move: tokenize the cash leg through a stablecoin, tokenized deposit, or regulated issuer, then settle both legs atomically on-ledger via the CIP-0056 transfer and allocation flows. That path is mature and audited, but it sidesteps the problem rather than solving it. Every team that wants a fiat corridor backed by an actual bank rail, not a tokenized proxy for one, starts from zero. There is no reference for how to structure the escrow across that boundary, how to guarantee the token leg and the off-ledger payment leg cannot both fail open, or how to reconcile an off-ledger payment confirmation against an on-ledger state transition.

The single objective of this proposal is to deliver, in the open, a reference fiat connector that closes this gap in both directions, off-ramp and on-ramp, with the first BRL/PIX corridor as its proving ground. Because the on-ledger contracts are rail-agnostic, other builders reuse the same templates and blueprint to build corridors for other currencies and rails (MXN over SPEI, USD over ACH or wire, EUR over SEPA) by writing only the off-ledger rail adapter.

### 2. Implementation Mechanics

The core is a propose-accept escrow contract written natively in Daml against the CIP-0056 interfaces (Holding, TransferInstruction, Allocation). The on-ledger templates carry only generic fiat fields: a fiat amount, an ISO 4217 currency code, a hashed payout destination (PIX key, CLABE for SPEI, IBAN, ACH account), and a settlement reference the rail returns on confirmation. No rail-specific logic ever touches the ledger, and no raw payout identifier is written to it.

**Off-ramp (token to fiat).** The party holding tokens exercises a request that locks the tokens into a contract-controlled escrow via a CIP-0056 Allocation and creates an off-ramp request signed by both the requesting party and the operator. Neither side can unilaterally alter or cancel it. Settlement uses a strict ordering that removes open-fail risk: the fiat payment executes off-ledger first; only after the rail confirms does the operator exercise the on-ledger settle, which releases the escrowed tokens to treasury and records an immutable receipt carrying the rail's settlement reference. If the payment fails, the operator exercises refund and the tokens return intact to the requester. An expiry choice guarantees the escrow can never be stranded. At no point can a counterparty hold both the tokens and the fiat.

**On-ramp (fiat to token).** The inverse corridor: the connector raises an off-ledger collection on the rail (a PIX charge, a pull, an inbound wire reference); only after the rail confirms the funds have cleared does the operator release tokens from treasury to the participant's party on-ledger. The same escrow, ordering, and reconciliation discipline applies in reverse, so the participant cannot receive tokens before the fiat has cleared, and the operator cannot strand a paid-in participant without tokens.

A backend connector consumes the ledger transaction stream, detects requests, validates them, drives the off-ledger payment or collection in either direction, and exercises the resulting choice. Idempotency is keyed on the contract id; the last processed ledger offset is persisted so the stream resumes without loss after a restart. Reconciliation is triple: ledger state, internal records, and the payment provider's statement. The rail-specific surface is isolated behind a documented rail-adapter interface, so a new corridor is a new adapter implementation rather than a fork of the connector.

The escrow logic, the state machine, and a five-scenario test suite (settle, refund, expiry, access control, input validation) are already validated on a local Daml sandbox, with an end-to-end script demonstrating tokens moving from requester through escrow to treasury on settle. The funded work migrates this from the sandbox mock token to CIP-0056 on DevNet, then TestNet, then a production corridor on MainNet; generalizes the validated off-ramp into the bidirectional connector; and adds the blueprint.

### 3. Architectural Alignment

The implementation programs against the Canton Network Token Standard (CIP-0056), so it composes with any standard-compliant token rather than forking a bespoke asset model. The escrow uses the standard Allocation mechanism for delivery-versus-payment, consistent with how the network expresses atomic settlement. CIP-0112 (Token Standard V2) evolves CIP-0056 in a backward-compatible way through new major versions of the token standard packages, including allocation flows aimed at prefunded and mint/burn settlement. The package is structured so the allocation and transfer calls sit behind a thin internal layer, and Milestone 2 documents the migration path to the V2 packages so the reference does not become a dead end when V2 lands.

This work responds to RFP 13, Payments and DeFi, which asks for open-source tooling, reference implementations, and standards for payments and settlement workflows that support multiple Canton applications rather than one-off application-specific work. The design targets validator node operators and is single-participant for development but inherently multi-participant for production: because requests are contracts whose parties can be hosted on different participants, a counterparty running its own node signs with its own key on its own node, with no key custody by the operator. This aligns with Canton's privacy and sovereignty model and matches how institutions actually deploy.

### 4. Backward Compatibility

No backward compatibility impact. This is additive: a new connector pattern and new contract templates. It introduces no changes to existing protocol components, tokens, or workflows, and depends only on the published CIP-0056 interfaces.

### 5. Regulatory Boundary and Reusability

The off-ledger leg of any fiat corridor touches regulated payment infrastructure, and that boundary shapes how reusable the connector can be for a third party.

PagFinance executes the BRL leg of the corridor through its regulated Brazilian payment partners, which hold the PIX rail relationship. Brazil's framework for virtual asset service providers is being implemented by the Central Bank, and PagFinance will operate under whatever authorization that framework requires of it as the rules come into force. Nothing in this proposal depends on that outcome: the funded deliverables are the on-ledger templates, the connector, and the blueprint, all of which are license-independent.

Where regulation permits, PagFinance can additionally offer the operational BRL corridor as a service to other participants who want BRL connectivity without standing up their own rail relationship. That is a convenience, not a dependency. A participant in a different jurisdiction, with a different regulatory posture, or with no agreement in place, still gets full value from the artifact: it takes the connector and the blueprint and connects them to its own licensed rail relationship. The reusable common good is the on-ledger escrow, the settlement pattern, and the connector architecture, which are rail- and license-independent by design. Licensing of fiat rails is jurisdiction-specific and cannot be open-sourced away; the reference design is what makes each new corridor an adapter rather than a rebuild.

---

## Milestones and Deliverables

### Milestone 1: CIP-0056 rail-agnostic core, off-ramp and on-ramp, on DevNet

- **Estimated Delivery:** 7 weeks from start
- **Focus:** Migrate the validated sandbox logic to the Canton Network Token Standard and deploy on DevNet. Remove the mock token; the escrow becomes a CIP-0056 Allocation. Generalize the validated off-ramp into both directions so the same core supports off-ramp (token to fiat) and on-ramp (fiat to token).
- **Deliverables / Value Metrics:** Public Apache-2.0 Daml package with rail-agnostic off-ramp and on-ramp templates and choices. Full test suite passing against CIP-0056 for both directions. A completed off-ramp and a completed on-ramp against a test token on DevNet that any reviewer or ecosystem team can run and verify from the open repository.

### Milestone 2: Open connector and integration blueprint

- **Estimated Delivery:** 6 weeks after Milestone 1
- **Focus:** Publish the open backend connector that consumes the ledger stream, drives the off-ledger payment or collection in either direction, and exercises settle, refund, and expire, with idempotency and offset-based recovery. Publish the written blueprint other teams follow to build their own fiat corridors on other rails, including the documented path from the CIP-0056 packages to the CIP-0112 V2 packages.
- **Deliverables / Value Metrics:** Public connector reference code with a documented rail-adapter interface. The integration blueprint document. A worked triple-reconciliation example. At least one external party or reviewer, outside PagFinance, runs the full off-ramp and on-ramp cycle on DevNet from the blueprint, including the forced-failure refund path, and confirms it in the tracking issue.

### Milestone 3: External security audit

Milestone 3 is split into two tranches so the audit is funded ahead of the spend rather than reimbursed after it. See Funding.

### Milestone 3.1: Audit engagement signed

- **Estimated Delivery:** 1 week after Milestone 2
- **Focus:** Commission an independent, reputable security firm to audit the Daml package and the connector, covering the escrow state machine, the settlement ordering that prevents both legs failing open, the access-control boundary, and the reconciliation logic.
- **Deliverables / Value Metrics:** A signed engagement naming the audit firm and the agreed scope, posted to the milestone tracking issue.

### Milestone 3.2: Audit report published and findings remediated

- **Estimated Delivery:** 4 weeks after Milestone 3.1
- **Focus:** Complete the audit and remediate findings in the open.
- **Deliverables / Value Metrics:** A published audit report covering the on-ledger templates and the connector. Every finding classified as Critical or High has a verifiable patch merged into the public main branch before this milestone is accepted, so the ecosystem inherits an audited reference rather than an audited snapshot.

### Milestone 4: Live BRL corridor on MainNet and public enablement

- **Estimated Delivery:** 8 weeks after Milestone 3.2
- **Focus:** Operate the first BRL/PIX corridor on MainNet, off-ramp and on-ramp, and publish a public technical write-up so other teams can replicate the pattern for other currencies and rails.
- **Deliverables / Value Metrics:** A documented off-ramp and a documented on-ramp settling on MainNet against the live PIX rail, with settlement references published. A public post-implementation report covering what the corridor cost to operate, where the reconciliation edges were, and what a second corridor would need. The reference package positioned as the starting point for additional fiat corridors, with the BRL corridor as evidence the bidirectional pattern works against a real central-bank rail.

### Milestone 5: Institutional adoption bounty

- **Estimated Delivery:** up to 12 months after Milestone 4
- **Focus:** Drive verifiable institutional adoption of the connector, whether by institutions deploying Canton fiat connectivity for the first time or by participants replicating the pattern on their own rail.
- **Deliverables / Value Metrics:** Verification that the connector was integrated, in a production or staging environment, by financial institutions (defined as finance organizations of 100 or more employees) running their own validator nodes. Each integration is evidenced by a named organization, a working corridor, and confirmation from that organization in the tracking issue. Structured as a performance-based bounty, paid per verified integration, so the Foundation takes on zero upfront risk for this allocation.

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone, all open-source under Apache-2.0 in a public repository
- Demonstrated functionality: a reviewer or external team can independently run each milestone's artifacts and complete both an off-ramp and an on-ramp cycle, including the failure path
- Documentation and knowledge transfer: the blueprint enables a third party to build a fiat corridor on its own rail without dependency on PagFinance's private infrastructure, evidenced by an external party completing the DevNet cycle in Milestone 2
- Ecosystem value: the reference package is reusable by any participant running a validator node, the bidirectional pattern is proven, and the live BRL corridor demonstrates the first fiat connection of its kind on Canton, opening the Brazilian market to the network
- Adoption (Milestone 5 only, performance-based): verified institutional integrations as defined in the milestone, with the Foundation bearing zero upfront risk

---

## Funding

**Total Funding Request:** 6,200,000 CC

The request is sized against ecosystem value, not engineering effort alone. The connector unlocks an entire capability category for Canton, fiat moving both into and out of the network against real bank rails, and proves it on the first corridor into a market of more than 180 million users moving over US$5T annually. CC amounts assume the Foundation's reference valuation and are subject to the volatility stipulation below.

### Payment Breakdown by Milestone

| Milestone | Focus | Funding |
| :--- | :--- | :--- |
| Milestone 1 | CIP-0056 rail-agnostic core, off-ramp and on-ramp, on DevNet | 1,350,000 CC |
| Milestone 2 | Open connector and integration blueprint | 1,350,000 CC |
| Milestone 3.1 | External security audit, engagement signed | 300,000 CC |
| Milestone 3.2 | External security audit, report published and findings remediated | 400,000 CC |
| Milestone 4 | Live BRL corridor on MainNet and public enablement | 1,800,000 CC |
| Milestone 5 | Institutional adoption bounty (performance-based) | 1,000,000 CC |
| **Total** | | **6,200,000 CC** |

Engineering and corridor delivery (Milestones 1, 2, and 4) total 4,500,000 CC. The external audit (Milestone 3) totals 700,000 CC. The adoption bounty (Milestone 5) is 1,000,000 CC and is strictly performance-based: it is paid only on verified institutional integrations.

**Audit funding sequence.** Independent security firms bill on engagement, not on delivery, so the audit allocation funds the spend rather than reimbursing it. Milestone 3.1 (300,000 CC) is released when the engagement is signed and the firm is named, which is the deliverable that unblocks the audit. Milestone 3.2 (400,000 CC) is released on the published report with every Critical and High finding verifiably patched in the public main branch.

### Volatility Stipulation

Milestones 1 to 4 are scoped to run within 6 months. Milestone 5 is an adoption bounty that runs on a longer horizon by design and is paid per verified integration as it occurs, which takes the total project duration beyond 6 months. Per the Development Fund terms for projects longer than 6 months, the grant is denominated in fixed Canton Coin and PagFinance accepts a re-evaluation of the unpaid milestone amounts at the 6-month mark.

Separately from that re-evaluation, either party may request a good-faith review of unpaid milestone amounts if the CC reference valuation moves materially between approval and payout. As a guideline, a move of more than 20% from the valuation used to set this request, in either direction, may trigger such a review. Any adjustment is by mutual agreement between PagFinance and the Tech & Ops Committee and applies only to milestones not yet accepted and paid; amounts already disbursed are not clawed back or topped up. This protects the project against a sharp CC decline eroding the real value of the remaining work, and protects the Foundation symmetrically against a sharp appreciation.

---

## Adoption and Distribution Plan

Adoption is the primary success measure for this proposal, and the milestones are ordered so that each one produces something another team can pick up.

**Who adopts it.** Three groups: teams building a fiat corridor for a currency Canton does not reach yet, who reuse the templates and write only a rail adapter; institutional participants who want BRL connectivity and consume the live corridor; and application teams settling tokens against fiat who need the escrow pattern rather than the rail.

**How it reaches them.** The repository is public from Milestone 1, so the artifact is reviewable before it is finished. Milestone 2 is not accepted until a party outside PagFinance has run the full cycle from the blueprint on DevNet, which makes third-party usability a payment condition rather than a hope. The blueprint, the rail-adapter interface, and the worked reconciliation example are written for a team that has never spoken to PagFinance. Distribution runs through the Financial Workflows & Composability SIG, a public technical write-up at Milestone 4, and Foundation co-marketing as set out below.

**How adoption is measured.** Milestone 2: at least one external party completes the DevNet cycle. Milestone 4: a live MainNet corridor with published settlement references. Milestone 5: named financial institutions running the connector in production or staging on their own nodes, each confirmed in the tracking issue.

**Share of the ecosystem served.** Every participant that needs fiat to enter or leave the network is in scope: stablecoin issuers, payment applications, treasury operators, and institutional participants settling tokens against fiat. Today none of them have an open pattern for the off-ledger leg, so the reachable share is the whole fiat-facing segment of the ecosystem rather than a slice of it.

---

## Maintenance and Sustainability

PagFinance maintains the repository after the grant period. The commercial reason is direct and is stated plainly: PagFinance runs the BRL corridor as a production business, so the reference package is the code PagFinance itself depends on. Maintenance is not a post-grant obligation the team has to be reminded of, it is the team's own production dependency.

Concretely, after the final milestone PagFinance commits to: keeping the package compatible with the current Canton Network Token Standard, including the CIP-0112 V2 packages as they roll out; triaging issues and reviewing pull requests in the public repository; and publishing a release whenever a Canton version or token standard change breaks the package. The code is Apache-2.0, so if PagFinance ever stops maintaining it, any participant can fork it without permission or negotiation. The blueprint is written so that a fork is viable rather than theoretical.

---

## Co-Marketing

Upon release, PagFinance will collaborate with the Foundation on:

- Announcement coordination for the first BRL corridor on Canton, covering both on-ramp and off-ramp
- A technical blog post and case study on the rail-agnostic fiat connector pattern and the bidirectional delivery-versus-payment guarantee
- Developer enablement so other teams can build corridors for additional currencies and rails, including a walkthrough session for the Financial Workflows & Composability SIG

---

## Team and Track Record

PagFinance is a Brazilian payments infrastructure company that converts stablecoins to BRL and settles over PIX in production today. The team operates the fiat rail integrations, the reconciliation, and the treasury flows that this proposal generalizes, which is why the escrow state machine and its test suite were already built and validated on a Daml sandbox before this proposal was written.

- **Andre Straube**, Founder and CEO. 23 years in technology, 7 focused on Web3. Previously Tech Lead and partner at Mottu, scaling the platform from launch to 60,000 users across Seed to Series C.
- **Alexandre Bencz**, CTO. Leads the ledger, settlement, and infrastructure work.

The existing sandbox implementation, its five-scenario test suite, and the end-to-end settle script are available for review on request and are published publicly at Milestone 1.

---

## Risks and Mitigations

- **Token standard evolution.** CIP-0112 introduces V2 packages. Mitigation: the allocation and transfer calls sit behind a thin internal layer and Milestone 2 documents the migration path, so V2 is a version bump rather than a rewrite.
- **Rail dependency.** The PIX leg depends on regulated payment partners. Mitigation: the on-ledger artifact is rail-agnostic and carries no PIX-specific logic, so the reusable deliverable survives any change in PagFinance's rail arrangements.
- **Reconciliation edge cases.** Off-ledger confirmations can be delayed, duplicated, or reversed. Mitigation: contract-id idempotency, persisted ledger offsets, expiry choices that prevent stranded escrows, and triple reconciliation against the provider statement. These paths are in the audit scope.
- **Adoption risk.** A reference nobody uses is worth little. Mitigation: external usability is a payment condition at Milestone 2, and the adoption allocation is a performance-based bounty rather than upfront funding.

---

## Motivation

Brazil's PIX serves over 180 million users and is among the highest-volume instant-payment systems in the world, moving more than US$5T annually. No fiat connector to BRL exists on Canton today, and more broadly there is no reusable reference for connecting any off-ledger bank rail to Canton settlement in either direction.

This work benefits the entire portion of the ecosystem that needs fiat on-ramps and off-ramps: stablecoin issuers, payment applications, treasury operators, and any institutional participant settling tokens against fiat. The reference package and blueprint are directly reusable by every team building a fiat corridor, and the BRL corridor itself connects the network to a major new market. The strategic importance is that bidirectional fiat connectivity is a precondition for real-world payment adoption: value has to get into the network and back out against the rails people actually use, and Canton currently has no open pattern for it.

---

## Rationale

This is a reference implementation, not a one-off integration, because the gap is shared across the ecosystem and the value compounds when the pattern is reusable. RFP 13 asks specifically for reusable components rather than application-specific work, which is why the on-ledger contracts carry no rail-specific fields at all: that choice is what turns a single BRL integration into a template for every fiat corridor, since a new rail needs only a new off-ledger adapter, not a new ledger model.

Extending the existing standard was preferred over building alongside it. Building on CIP-0056 rather than a bespoke asset model ensures composability with any compliant token, and the Allocation mechanism already expresses the atomic settlement primitive this pattern needs, so nothing new had to be introduced at the standard level. The alternative of tokenizing the cash leg, which is the path Canton documents today, was considered and rejected for this objective: it solves a different problem, since it requires a tokenized proxy for fiat to already exist in the target currency. For BRL, and for most currencies, it does not.

Targeting validator node operators and sovereign key custody aligns the pattern with how institutions actually join Canton. Structuring the adoption allocation as a performance-based bounty puts the network's risk on outcomes rather than promises.

---

## Open Source and Licensing

All code and technical artifacts produced under this grant are released under **Apache-2.0** in a public repository. This proposal document is contributed under **CC0-1.0**, consistent with the repository license.
