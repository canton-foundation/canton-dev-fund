## Development Fund Proposal

**Author:** FranklinDAO Research and Development Committee
**Status:** Submitted
**Created:** 2026-03-10  

---

## Abstract

Credix is an open-source, full-stack reference implementation of privacy-preserving microlending on the Canton Network.

The prototype has already been implemented using: Next.js + TypeScript frontend, Spring Boot (Java 21) backend, Canton ledger with Daml smart contracts, and PostgreSQL via PQS for reads. It supports a borrower-lender interaction with built-in privacy and credit scoring primitives.  

This proposal requests funding to harden Credix into “reference-grade” infrastructure for the Canton ecosystem: improved documentation, reproducible end-to-end token-settled lending flows, automated tests and CI, security-focused invariants (privacy + authorization), and packaging guidance so other teams can adopt the framework for production-grade credit markets.

---

## Specification

### 1. Objective

Deliver a reusable, well-documented, testable reference implementation demonstrating how to build a micro‑lending marketplace on Canton with:

- On-ledger privacy by default (Daml stakeholders + selective disclosure)
- Token-settled loan funding and repayment (via Splice token APIs)
- Realistic, end-to-end full-stack architecture suitable for developers to clone and extend

Primary outcome: reduce developmental burden for other Canton builders creating credit products (microloans, credit lines, receivables lending) by providing readily auditable building blocks and patterns.


---

### 2. Implementation Mechanics

We will turn the existing prototype into a reference implementation with three workstreams:

**(A) Contract library hardening + invariants**
- Formalize a “privacy & authorization spec” per template (stakeholders, observers, controllers, disclosure surface)
- Add Daml tests that prove invariants such as:
  - Credit profile data is not observable to unintended parties
  - Loan lifecycle choices require correct authorization
  - Disclosed lender views reveal only the intended subset of borrower request details
- Normalize the contract module layout so the lending primitives are reusable independently of the demo UI

**(B) Token-settled E2E flows (fund + repay)**
- Provide deterministic scripts and integration tests that demonstrate the token-settled lifecycle:
  1) Borrower creates a loan request (visible to borrower + platform operator)
  2) Platform operator discloses the request to lender(s) via lender-specific views
  3) Lender creates a loan offer
  4) Borrower accepts the offer **with token settlement**, creating a FundingIntent
  5) Lender confirms FundingIntent, creating a LoanPrincipalRequest (AllocationRequest-based)
  6) Borrower + lender complete funding by executing the Allocation transfer (creating the active Loan)
  7) Borrower initiates repayment by creating a LoanRepaymentRequest (AllocationRequest-based)
  8) Lender completes repayment by executing the Allocation transfer (LoanRepaymentRequest_CompleteRepayment)
  9) Lender + borrower finalize repayment on the Loan (Loan_CompleteRepaymentReceived), completing the lifecycle and updating credit
- Document token preconditions and operational assumptions clearly (deadlines, request lifetimes, allocation/settle timing, common failure modes)

**(C) Developer usability + distribution**
- Interfacing Credix such that a new developer can readily transform clone to running stack to completing a lending flow
- Cleanup of current repository processes:
  - Daml packages
  - backend API
  - PQS indexing + database schema assumptions
  - frontend flows
- Add CI checks for repeatable builds and test pass/fail signals

---

### 3. Architectural Alignment

The Credix prototype directly aligns with Canton’s architecture and priorities as a **reference implementation** that exercises:

- Daml smart contract privacy primitives (built-in contract visibility + authorization)
- A full Canton application architecture using:
  - gRPC writes to the Canton ledger
  - PQS event indexing into Postgres for reads
  - a standard web stack (frontend + backend service)
- Token integration patterns via Canton’s token standard APIs (CIP-0056), using the Splice token DARs included in the repo:
  token metadata, token holdings, allocation, and allocation request (DVP-style execution).

This combination is explicitly useful to the ecosystem because it demonstrates how to implement real lending workflows without leaking sensitive credit information. It takes advantage of Canton's inherent "confidential DeFi"-aligned structure and implements a technically practical package.

---

### 4. Backward Compatibility

*No backward compatibility impact.*  

---

# Milestones and Deliverables

**Schedule Basis:** Timelines are relative to **Project Kickoff (T0)**.

**Total Duration:** Approximately **4 months (120 days)**.

---

## Milestone 1 — Product Finalization, Testing, and Network Deployment

**Estimated Delivery:** T0 + 30 days

**Focus:** Finalize the Credix protocol implementation and ensure the full lending lifecycle is production-ready across Canton development environments.

### Deliverables

- Final implementation of the full loan lifecycle including request, offer, funding, repayment, and completion flows
- Completion of all remaining core protocol features required for the reference implementation
- Full automated test coverage of lending flows and contract invariants
- Testing across the full Canton deployment lifecycle:
  - Local development environment
  - Devnet deployment
  - Testnet deployment
  - Mainnet deployment validation
- Security and authorization testing of contract logic and privacy boundaries
- Verification that token-settled funding and repayment flows operate correctly in network environments
- Updated developer documentation reflecting final architecture and deployment setup

### Acceptance Criteria

- All core lending lifecycle flows execute successfully across Canton environments
- Automated tests validate contract invariants and privacy boundaries
- Protocol successfully deploys to Canton development networks
- Developer documentation accurately reflects architecture and deployment steps

This milestone ensures the protocol is **fully functional, tested, and operational on Canton networks**.

---

## Milestone 2 — Ecosystem Growth, Adoption, and Developer Expansion

**Estimated Delivery:** T0 + 120 days

**Focus:** Expand Credix from a working protocol into a **widely usable ecosystem reference implementation**, while driving developer adoption and early lending activity.

### Deliverables

#### Developer Adoption

- Publish a complete **Quickstart guide** enabling developers to:
  - clone the repository
  - run the full stack locally
  - execute a complete loan lifecycle
- Create detailed architectural documentation covering:
  - privacy and selective disclosure model
  - lending lifecycle mechanics
  - token settlement flows
  - PQS read architecture
- Provide extension documentation for developers building on top of Credix, including:
  - underwriting model integrations
  - credit scoring integrations
  - identity/KYC adapters
  - lender strategy modules
- Provide example configurations and deployment instructions for Canton environments

These resources position Credix as a **reference implementation for developers exploring lending infrastructure on Canton**.

---

#### Ecosystem Integrations

Establish integrations with ecosystem participants to demonstrate real-world lending workflows.

Potential integrations include:

- identity / KYC providers
- credit scoring providers
- tokenized asset issuers
- liquidity providers
- institutional lending platforms exploring on-chain credit markets

These integrations demonstrate how Canton enables **coordinated financial workflows while preserving borrower data privacy**.

---

#### Developer Outreach and Ecosystem Engagement

Increase developer awareness and ecosystem participation through:

- publishing a **technical blog post** explaining the protocol architecture and privacy model
- producing **demo videos and architecture walkthroughs**
- sharing development updates across Canton developer channels
- supporting early teams interested in extending or forking the protocol
- engaging with the open-source community through GitHub and developer discussions

The goal is to position Credix as a **flagship financial application built on Canton**.

---

#### Go-To-Market and Adoption Strategy

Credix will pursue a developer-led go-to-market strategy focused on enabling teams to build lending applications using the protocol.

Key activities include:

- promoting Credix as a **reference architecture for private credit infrastructure**
- enabling developers to fork or extend the protocol for their own lending markets
- demonstrating the benefits of Canton’s privacy architecture for financial applications
- publishing example use cases illustrating how institutions could deploy lending markets using Credix

These efforts will help establish Credix as a **foundational building block for privacy-preserving financial infrastructure on Canton**.

---

#### Protocol Usage and Liquidity Activation

To demonstrate real-world usage of the protocol:

- Launch the lending protocol with **initial liquidity provisioning**
- Execute at least **one complete lending cycle** through the protocol
- Demonstrate automated loan origination, funding, and repayment flows
- Collect feedback from early users and developers
- Iterate on the protocol based on real usage insights

This ensures Credix becomes **not only a working protocol but an actively used ecosystem tool**.

---

# Funding

**Total Funding Request:** **320,000 CC**

### Funding Usage

Requested funds will support:

- Development work required to complete testing and finalize the protocol
- Documentation, tooling, and developer onboarding resources
- Infrastructure and operational costs associated with deployment and testing
- Developer outreach and ecosystem growth activities
- **Initial liquidity provisioning for the Credix lending protocol**, enabling early borrowing and lending activity

---

### Payment Breakdown

Milestone 1 — Product Finalization and Network Testing  
**250,000 CC**

Milestone 2 — Ecosystem Growth and Adoption  
**70,000 CC**

Payments will be released upon milestone acceptance by the Tech & Ops Committee.
