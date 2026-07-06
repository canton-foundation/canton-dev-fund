## Development Fund Proposal

**Author:** FractiFi — submitted by Slava Zhygulin (Co-founder & CTO)
**Status:** Draft
**Created:** 2026-07-06
**Label:** token-asset-standards
**Champion:** need Champion

---

## Abstract
FractiFi proposes an open-source Daml reference implementation of a tokenized bank-deposit template on Canton: deposit tokens with a protocol-enforced 1:1 reserve invariant, mint / redeem / transfer flows, and an on-ledger reserve-attestation pattern. The design is already validated on Ethereum — a working Sepolia testnet proof-of-concept with real on-chain transactions, a verified contract, and Merkle-based proof-of-reserves — and is ported here into Canton-native Daml. It closes a concrete ecosystem gap: token standards and reference implementations are an explicit Canton priority, and no existing Canton reference implementation demonstrates a bank-deposit token with a live, auditable backing invariant. FractiFi operates a live Canton validator (Splice, DevNet), giving the team direct operating familiarity with the target environment.

---

## Specification

### 1. Objective
Ship an open-source Daml reference implementation of a 1:1-backed tokenized bank deposit — mint, redeem, and transfer contract templates plus an on-ledger reserve-attestation pattern — as reusable, documented Canton ecosystem infrastructure. Single objective: a reference implementation others can learn from and build on. FractiFi's proprietary white-label product is explicitly out of scope and is not funded by this request.

### 2. Implementation Mechanics
Port FractiFi's existing Sepolia `DepositToken` design into Daml contract templates. Where the Ethereum version uses Solidity role-based `AccessControl`, the Daml version uses Canton's native signatory / observer / controller authorization model. Each bank is represented as a distinct Daml party; the reserve-attestation registry is a Daml contract whose signatories are the bank party plus (optionally) an independent attestor party — giving Canton's sub-transaction privacy a genuine advantage over the public-EVM version, since counterparties observe only their own view rather than the whole ledger. Deliverables: contract templates (mint / redeem / transfer), a reserve-attestation module, a test suite, and adoption-oriented documentation (quickstart + architecture diagram) so that a third-party team can deploy and exercise the implementation from the repository alone.

### 3. Architectural Alignment
Implements the reference template against the Canton token-standard interfaces (CIP-0112 / Token Standard V2), so future standard upgrades are absorbed at the interface layer. Aligns with the ecosystem priorities of token & asset standards, developer experience (documentation and examples that reduce integration friction), and security & resilience (the reserve-attestation module is designed for third-party audit; an audit-readiness pass is included in Milestone 3).

### 4. Backward Compatibility
No backward compatibility impact — this is a new, standalone reference implementation with no existing Canton contracts to break. It is versioned against the CIP-0112 interface.

---

## Milestones and Deliverables

### Milestone 1: Design doc + prototype
- **Estimated Delivery:** Month 1–2
- **Focus:** Daml contract design (party model, authorization rules, reserve-invariant enforcement) and a working prototype on DevNet.
- **Deliverables / Value Metrics:** A public design document reviewed by at least one SIG member; a prototype that a third party can deploy from the repository README alone.

### Milestone 2: Reference implementation + docs
- **Estimated Delivery:** Month 2–4
- **Focus:** Full mint / redeem / transfer implementation with test suite, deployed to TestNet, plus adoption-oriented documentation.
- **Deliverables / Value Metrics:** A named third-party team (not FractiFi) can deploy and exercise the reference implementation from documentation alone.

### Milestone 3: Ecosystem adoption + audit-readiness
- **Estimated Delivery:** Month 4–6
- **Focus:** Outreach to the token-asset-standards / dapp-integration SIGs, a short technical writeup/demo for the community, and a security-audit-readiness pass on the reserve-attestation module.
- **Deliverables / Value Metrics:** At least one concrete adoption signal (a fork, an integration inquiry, or a SIG-hosted demo) by the milestone deadline; an audit-readiness checklist published.

---

## Acceptance Criteria
The Tech & Ops Committee will evaluate completion based on:

- The design document reviewed and accepted by the named SIG.
- The reference implementation independently deployable and exercised by a third party from documentation alone.
- At least one concrete adoption signal (fork, integration inquiry, or SIG-hosted demo) by the Milestone 3 deadline.
- The reserve-attestation module documented to an audit-ready standard.

Value is measured by ecosystem adoption and reuse, not by artifact delivery or CI status.

---

## Funding

**Total Funding Request:** 300,000 CC  *(proposed figure — to be confirmed by FractiFi before this proposal is marked ready for review)*

### Payment Breakdown by Milestone
- Milestone 1 (Design doc + prototype): 100,000 CC upon committee acceptance
- Milestone 2 (Reference implementation + docs): 100,000 CC upon committee acceptance
- Milestone 3 (Ecosystem adoption + audit-readiness): 100,000 CC upon final release and acceptance

**Canton receiving party (for disbursement):** _[to be provided — FractiFi validator party ID]_

### Volatility Stipulation
Project duration is planned at approximately 6 months. Should the timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones will be renegotiated to account for USD/CC price volatility. The grant is denominated in fixed Canton Coin.

---

## Co-Marketing
Upon release, FractiFi will collaborate with the Foundation on:

- Announcement coordination
- A technical blog / case study on the reference implementation's design and adoption
- A SIG or community-call demo, if invited

---

## Motivation
Tokenized bank deposits are FractiFi's core domain. Canton's Daml authorization model and sub-transaction privacy make a materially better version of the pattern possible than what exists on public EVM chains — per-counterparty visibility, native authorization, and an on-ledger attestation of backing. Rather than pitch the proprietary product (out of scope for the fund), FractiFi is scoping the underlying reference pattern as ecosystem infrastructure — the same motivation under which the fund's precedent proposals (reference implementations of settlement patterns, wallet SDKs, and similar) were supported. The team ships real infrastructure today: a working Ethereum Sepolia PoC (live demo at demo.fracti.fi) and a live Canton validator on DevNet.

---

### Draft notes — to resolve before marking Ready for review (delete this section then)
- Confirm the **Total Funding Request** (300,000 CC is a proposed figure benchmarked to comparable first-time reference-implementation grants in this fund).
- Provide the **FractiFi Canton receiving party ID** for the disbursement line.
- Secure a **SIG Champion** (currently `need Champion`); FractiFi's Splice / DevNet validator relationship is the natural channel.
- Confirm the **legal entity name** for the Author line if the Foundation requires it.
- Source code currently lives in a **private** repository. Either offer the Committee read access on request, or open-source the reference-implementation repo at Milestone 1 (the deliverable already implies a public repo).
