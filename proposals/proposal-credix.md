## Development Fund Proposal

**Author:** FranklinDAO Research and Development Committee
**Status:** Submitted
**Created:** 2026-03-10
**Label:** financial-workflows-composability

**Champion:** Champion

---

## Abstract

Credix is an open-source peer-to-peer lending protocol on the Canton Network. Alongside building the protocol, Credix includes a full-stack implementation of a microloan exchange for privacy-preserving microlending.

The protocol is built on the Canton ledger with Daml smart contracts, a Spring Boot (Java 21) backend, and PostgreSQL via PQS for reads. The microlending application is built on top with a Next.js + TypeScript frontend and supports peer-to-peer lending interactions with built-in privacy and credit scoring primitives.

This proposal requests funding to iterate and complete Credix into robust loan infrastructure for the Canton ecosystem, including improved documentation, reproducible token-settled lending flows, automated testing and CI, security-focused invariants (privacy and authorization), and packaging guidance for production adoption.

---

## Specification

### 1. Objective

Deliver a reusable, well-documented, and testable reference implementation for loan markets on Canton with:

* On-ledger privacy by default (Daml stakeholders + selective disclosure)
* Token-settled loan funding and repayment (via Splice token APIs)
* Realistic full-stack architecture suitable for developers to clone and extend

Primary outcome: provide Canton builders and partners with infrastructure to create credit products such as microloans, credit lines, and receivables lending. Credix's team has backgrounds in and a network of private credit institutions who have shown interest in the product, who we hope to be initial users of the product.

---

### 2. Implementation Mechanics

The prototype will be developed into a reference implementation across four workstreams:

**(A) Library Hardening + Invariants**

* Define a privacy and authorization specification per contract template
* Add Daml tests validating:

  * Credit data privacy guarantees
  * Proper authorization across loan lifecycle actions
  * Controlled disclosure of borrower information
* Modularize contract structure for reuse independent of UI

**(B) Token-Settled End-to-End Flows**

* Implement deterministic scripts and integration tests covering:

  1. Loan request creation
  2. Selective disclosure to lenders
  3. Loan offer creation
  4. Borrower acceptance with token settlement
  5. Funding intent and allocation requests
  6. Loan activation
  7. Repayment initiation
  8. Repayment settlement
  9. Loan completion and credit updates
* Document operational assumptions (timing, deadlines, failure modes)

**(C) Developer Usability + Distribution**

* Enable clone-to-running-stack developer experience
* Standardize:

  * Daml packages
  * Backend APIs
  * PQS indexing and schema
  * Frontend workflows
* Add CI for reproducibility and testing

**(D) Modularity and Reusability**

* Structure lending primitives for independent reuse
* Allow integration without requiring full Credix stack
* Support extensibility across underwriting models and lending types

---

### 3. Architectural Alignment

Credix aligns with Canton architecture as a reference implementation demonstrating:

* Daml privacy and authorization primitives
* Full-stack Canton application design:

  * gRPC ledger writes
  * PQS indexing to PostgreSQL
  * Standard frontend/backend architecture
* Token integration via Canton token APIs (CIP-0056), including:

  * Token metadata
  * Holdings
  * Allocation and settlement flows

This demonstrates practical confidential DeFi workflows while preserving sensitive financial data.

---

### 4. Backward Compatibility

No backward compatibility impact.

---

## Milestones and Deliverables

**Schedule Basis:** Relative to Project Kickoff (T0)
**Total Duration:** ~4 months (120 days)

---

### Milestone 1: Product Finalization, Testing, and Network Deployment

* **Estimated Delivery:** T0 + 60 days
* **Focus:** Production-ready protocol and full lifecycle validation

**Deliverables / Value Metrics:**

* Complete loan lifecycle implementation
* Full automated testing and invariant validation
* Deployment across:

  * Local
  * Devnet
  * Testnet
  * Mainnet validation
* Security and privacy testing
* Verified token-settled flows
* Updated developer documentation

---

### Milestone 2: Ecosystem Growth, Adoption, and Developer Expansion

* **Estimated Delivery:** T0 + 120 days
* **Focus:** Adoption, integrations, and ecosystem positioning
* **Focus:** Adoption, integrations, and ecosystem positioning

**Deliverables / Value Metrics:**

**Developer Adoption**

* Quickstart guide (clone → run → execute loan lifecycle)
* 3–5 technical documentation modules
* Extension guides (credit scoring, KYC, underwriting, integrations)

**Ecosystem Integrations**

* Integrations with:

  * Identity/KYC providers
  * Credit scoring systems
  * Tokenized asset issuers
  * Liquidity providers

**Developer Outreach**

* Technical blog
* Demo videos and walkthroughs
* Community engagement and support

**Go-To-Market**

* Position Credix as reference architecture
* Enable forks and extensions
* Publish institutional use cases

**Success Metrics**

* 1 Quickstart guide
* 3–5 documentation modules
* **1–2 external forks** or serious integrations

**Protocol Usage**

* Initial liquidity provisioning
* Demonstrated loan activity
* Feedback-driven iteration

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

* Deliverables completed per milestone
* Demonstrated functionality across Canton environments
* Verified privacy and authorization guarantees
* Documentation and developer onboarding readiness
* Evidence of ecosystem engagement and adoption

---

## Funding

**Total Funding Request:** 320,000 CC

### Payment Breakdown by Milestone

* Milestone 1: 250,000 CC upon acceptance
* Milestone 2: 70,000 CC upon acceptance

---

### Volatility Stipulation

Project duration is under 6 months.
If extended beyond 6 months due to Committee-requested scope changes, remaining milestones will be renegotiated to account for price volatility.

---

## Co-Marketing

Upon release, the team will collaborate with the Foundation on:

* Announcement coordination
* Technical blog or case study
* Developer and ecosystem promotion
* Demo content and architecture walkthroughs

---

## Motivation

Credix provides foundational infrastructure for lending on Canton, which is a core DeFi primitive in any decentralized network. A robust lending protocol especially adds value to the Canton network because Canton has such strong DeFi use cases. As a result an open source lending protocol will be vital to the ecosystem growth of Canton.

While other lending protocols are being built on Canton, our protocol intends to utilize the privacy preserving features of the Canton network. There has been a history of unfair bias in loan markets, and our protocol intends to address that by providing privacy for borrowers and lenders, while still being able to verify credit scoring and trustworthiness. Especially in the sector of microlending (which is a untapped but open market for Canton to supply infrastructure), a balance of privacy and trustworthiness is vital. Our project plans to deliver this by abstracting the data of a borrower with a credit scoring mechanism for borrowers to verify borrower trustworthiness without exposing borrower's personal data.

Credix both improves the lending infrastructure which Canton needs as a Blockchain network with strong financial use cases, and fills a gap in microlending infrastructure through privacy focus and a peer to peer marketplace with an orderbook structure.

---

## Rationale

This approach prioritizes:

* Reusable public-good infrastructure over isolated applications
* Full-stack reference implementation to accelerate developer adoption
* Strong privacy guarantees aligned with Canton’s architecture
* Real-world validation through token-settled flows and liquidity testing

Alternative approaches (e.g., partial tooling or abstract SDKs) were not chosen, as they do not provide the same level of end-to-end clarity or adoption readiness.

Credix is designed to be both a practical application and a foundational building block for the ecosystem.

