# Development Fund Proposal: AlphaPilot Canton RWA Market Access Reference Layer

## Dev Fund 2.0 Alignment

**Relevant RFP category:** **Financial Markets, Standards & Verification → RWA Standards → Daml and Institutional RWA Workflow Standards** (RFP 12 / `rfp-12:rwa-standards`).

**Why the ecosystem needs this:** Canton provides the network and privacy infrastructure for institutional assets, but application teams still have to independently bridge issuer metadata, eligibility and supported actions, transaction submission, settlement status, and confirmed holdings. Rebuilding these layers for every issuer and application increases integration time and cost, produces incompatible asset and transaction-state models, and slows real assets from becoming usable across the network. This project turns that repeated work into an open, provider-neutral reference implementation instead of another proprietary connector.

**Who benefits:**
- **RWA issuers and market-infrastructure providers** gain a documented, repeatable path for making assets usable by Canton applications without bespoke frontend integrations for every distribution partner.
- **Canton dApp builders, wallets, portfolio tools, and market-access applications** gain reusable schemas, adapter interfaces, transaction and settlement state models, conformance tests, and a working end-to-end example.
- **Institutions and eligible end users** gain clearer asset information and more reliable transaction, settlement, and portfolio experiences across applications.
- **The Canton ecosystem** gains faster application launches, broader distribution for Canton-native assets, less fragmented integration work, and more real transaction activity.

**How this drives adoption:**
- provide a cloneable Apache-2.0 starting point that reduces the time and specialist knowledge required to integrate a Canton RWA;
- prove reuse with a second provider or asset using the same interfaces and conformance tests;
- use AlphaPilot as the first consuming application and pilot distribution surface while keeping the funded layer public and application-neutral;
- require external builder review and reuse evidence through an integration, proof of concept, fork, or documented technical evaluation; and
- publish setup, API, troubleshooting, and maintenance guidance so subsequent teams can move from discovery to a settled transaction without rebuilding the stack.

The result is a practical onboarding path from Canton RWA standards to working applications: more issuers can expose assets through reusable interfaces, more builders can ship interoperable products, and those products can generate sustained Canton transaction and settlement activity.


## Applicant
**Organization:** AlphaPilot
**Author / Primary Contact:** Abdul Adams
**Champion:** Parth: Canton Foundation / accelerator
**Suggested SIGs:** Financial Workflows & Composability; dApp Integration; Token Standards / Asset Standards

## Proposal Classification
**Proposal Type:** RFP-aligned proposal
**Primary Roadmap Area:** Financial Markets, Standards & Verification: RWA Standards: Daml and Institutional RWA Workflow Standards
**Secondary Alignment:** App Building and Developer Experience.

## Funding & Timeline
**Working Funding Request:** 1,000,000 CC
**Project Duration:** 12 weeks

Funding is structured around three independently verifiable milestones, with the largest allocation attached to the end to end Canton transaction, settlement and portfolio-reconciliation implementation. The 1,000,000 CC request reflects the full engineering, open-source reference implementation, integration hardening, external reuse proof and developer enablement scope rather than a single proprietary AlphaPilot integration.

## Abstract
AlphaPilot proposes to build and open-source a reusable Canton RWA Market Access Reference Layer: a reference implementation showing how an application can discover a Canton-based real-world asset, normalize issuer and asset metadata, present the asset to an end user, submit an eligible investment or transaction through Canton-connected infrastructure, track the resulting transaction and settlement state, and reflect confirmed ownership in a portfolio.

The first implementation will be demonstrated inside AlphaPilot, but the funded work will be open and reusable by other Canton builders. The grant is not for AlphaPilot's proprietary platform. It is for the reference integration layer, schemas, adapters, transaction state model, documentation, example application, and test flows that other teams can use when integrating Canton RWA products.

The project will start with one Canton-connected asset or DevNet reference asset and one end to end workflow, then generalize the integration so a second issuer or asset can be connected through the same interfaces.

## 1. Problem Statement
Canton can connect issuers, custodians, market infrastructure providers, and applications across tokenized financial markets. Application developers still face a practical gap between discovering a Canton-based financial product, presenting its verified metadata and terms, determining available actions, submitting a transaction, tracking real settlement state, and reconciling the resulting holding into an application portfolio.

If each commercial application solves these problems privately, every new builder recreates similar adapters, state models and transaction logic. This proposal turns that integration work into a reusable public reference.

## 2. Objective
Publish a production-ready reference implementation demonstrating:

**Asset discovery, asset details, eligibility and supported actions, review, Canton transaction submission, settlement status, and confirmed portfolio holding.**

An external developer should be able to understand how to:
- normalize Canton RWA asset metadata;
- map application records to Canton or provider identifiers;
- keep application data separate from Canton transaction state;
- distinguish transaction submission from final settlement;
- reconcile confirmed settlement into a portfolio;
- add a second asset/provider without rewriting the frontend;
- understand where issuer, compliance, custody, and execution responsibilities begin and end.

## 3. Proposed Solution

### A. Provider-Neutral RWA Asset Model
Open schema covering asset ID, network/Canton identifier, issuer, category, price or NAV where supplied, currency, yield where applicable, maturity, minimum investment, status, supported actions, settlement method, documentation links, environment and source timestamps.

The reference will not fabricate regulatory status, backing, custody, yield, Shariah status, insurance or investor protections.

### B. Canton / Issuer Adapter Interface
A documented interface covering asset retrieval, asset details, supported transaction actions, user or party context where required, transaction preparation, submission, transaction reference, settlement-state retrieval and confirmed ownership state.

At least one working Canton DevNet or partner-accessible adapter will be implemented. The interface will support a second asset/provider without rebuilding the frontend.

### C. Shared Transaction and Settlement State Model
Reusable lifecycle such as:
- Draft
- Quote Ready
- Awaiting Approval
- Submitted
- Processing
- Settling
- Completed
- Failed
- Cancelled / Expired where supported

The reference must never mark a transaction Completed until the connected Canton or provider flow confirms the required final state.

### D. Portfolio Reconciliation Reference
Demonstrate how confirmed Canton ownership becomes an application portfolio holding, including asset/network identity, quantity, current value where available, settlement/ownership state, source transaction reference and timestamps.

No invented cost basis or P&L.

### E. Reference UI and Documentation
Small reference interface demonstrating browse → asset detail → review → submit → status → confirmed portfolio holding. The reusable interfaces, schemas, backend patterns, tests, and documentation are the main public good outputs.

## 4. Initial AlphaPilot Demonstration
AlphaPilot is building a multi-asset trading intelligence and execution platform. For Canton, the first pilot is intentionally narrow: bring one regulated tokenized investment product into a Canton market experience, let a user understand the product and underlying asset, monitor it alongside their portfolio, and demonstrate the transaction and settlement lifecycle through Canton-connected infrastructure.

The existing AlphaPilot x Canton concept materials identify Franklin Templeton, 1exchange, and Archax as potential market-infrastructure/design-partner routes and S&P Dow Jones Indices as a potential benchmark/data layer. These are proposed paths, not confirmed commitments.

The public reference does not depend on any one named partner. If partner access is not ready, a clearly labelled Canton DevNet or reference asset will be used.

## 5. Canton-Native Architectural Alignment
The project is a Canton integration reference rather than an EVM-style wrapper.

**Application UI / Strategy Layer > RWA Reference API > Provider Adapter > Canton connected workflow > settlement state > transaction record > portfolio reconciliation**

The reference will compose existing Canton APIs, standards and provider interfaces rather than create a private alternative standard.

## 6. Public-Good Boundary

### Funded / Open
- provider neutral RWA schema;
- Canton or provider adapter interface;
- transaction/settlement state model;
- portfolio reconciliation pattern;
- reference backend;
- example Canton adapter;
- reference UI;
- automated tests;
- DevNet demo;
- integration guide;
- second provider or asset guide;
- architecture docs;
- adoption/feedback report.

### Out of Scope
- AlphaPilot proprietary market ranking logic;
- proprietary AI models/prompts;
- proprietary Smart Money intelligence;
- proprietary standard crypto execution infrastructure;
- subscription/billing/growth features;
- brokerage, exchange or custody licensing;
- issuer specific code that cannot be reused;
- operating as broker/exchange/custodian;
- inventing a new RWA token standard where existing Canton standards apply.

## 7. Strategy and Automation Boundary
The longer-term AlphaPilot product may let users build strategies around supported assets. For the public reference, automation is limited to safe state based patterns such as monitoring asset availability, preparing an action when a user condition is met, pausing when eligibility or status changes, and monitoring submitted transactions.

Automated execution is only in scope if the selected Canton infrastructure provides an explicit secure user authorized mechanism. Otherwise final user approval is required.

## 8. Security, Privacy and Data Handling
The reference will:
- never store private keys or seed phrases;
- separate provider and public asset data from user-specific state;
- avoid exposing private Canton transaction details as public market data;
- document authorization assumptions;
- include failure handling and idempotency requirements;
- distinguish submission from settlement;
- document whether each field originates from Canton, the provider or the application.

Production KYC, accreditation, and residency logic remains the responsibility of the relevant provider or integration. The reference defines the boundary but does not create a proprietary identity service.

## 9. Milestones and Deliverables

### Milestone 1: Open Architecture, Schema and DevNet Baseline
**Timeline:** Weeks 1–4
**Funding:** 250,000 CC

Deliverables:
- public Apache-2.0 repository;
- architecture document;
- normalized RWA asset schema;
- provider adapter interface;
- transaction state schema;
- portfolio holding schema;
- one DevNet or reference asset through the adapter;
- basic browse and asset detail UI;
- unit tests;
- setup and run instructions;
- public walkthrough/demo.

Acceptance:
- external developer can clone and run;
- asset loads through adapter, not hardcoded UI;
- source/environment visible;
- missing fields remain unavailable;
- interfaces documented;
- at least one external Canton builder or SIG reviewer gives documented feedback.

### Milestone 2: End to End Canton Transaction and Settlement Reference
**Timeline:** Weeks 5–8
**Funding:** 450,000 CC

Deliverables:
- review transaction flow;
- preparation/submission integration;
- persistent transaction record;
- status page;
- supported lifecycle states;
- status retrieval that remains consistent across page refreshes;
- portfolio reconciliation;
- successful transaction and failure tests;
- troubleshooting notes.

Acceptance:
- one complete transaction demonstrated on selected Canton environment;
- no premature Completed status;
- transaction survives refresh;
- confirmed state creates portfolio holding;
- failures are explicit;
- state source boundaries documented;
- at least two external ecosystem reviewers or builders evaluate the flow.

### Milestone 3: Reuse Proof, Second Adapter and Builder Package
**Timeline:** Weeks 9–12
**Funding:** 300,000 CC

Deliverables:
- second provider or asset integration or independently configured second asset proving reuse;
- adding a provider or asset guide;
- reference API docs;
- architecture diagrams;
- adapter conformance tests;
- AlphaPilot integration consuming the public reference;
- ecosystem feedback report;
- public demo;
- maintenance plan.

Acceptance:
- second integration reuses the same interfaces;
- at least one external builder shows reuse via fork, proof of concept, integration or documented evaluation;
- AlphaPilot consumes the public reference rather than a private incompatible version;
- another builder can implement an adapter from the docs;
- versioning and maintenance ownership documented.

## 10. Adoption Plan
Target adopters:
- Canton dApp builders;
- RWA issuers;
- wallets and portfolio apps;
- investment/market access apps;
- Financial Workflows & Composability SIG;
- Token Standards / Asset Standards SIG;
- dApp Integration SIG.

Evidence:
- technical reviews;
- forks/integrations;
- second adapter;
- AlphaPilot production/pilot use;
- builder feedback;
- external issues/PRs.

## 11. Sustainability
AlphaPilot will maintain the reference repository after the grant period with documented maintainers, releases, compatibility notes, issue handling, security reporting instructions and at least 12 months of best-effort maintenance after Milestone 3.

## 12. Team
**Abdul Adams: Founder:** Product strategy, application design, ecosystem coordination and delivery ownership.
**Braden Gordon: COO:** Operations, delivery coordination, partner execution and cross-functional project management.
**Prem Jaiswal: Lead Engineer:** Technical implementation lead.
**Jamal Eddine: CFO / Markets:** Commercial and traditional markets workflow input.

The relevant SIG and Development Fund Champion will review the technical approach before the architecture is finalized.

## 13. Potential Design and Ecosystem Partners
Potential routes identified in existing concept work:
- Franklin Templeton: potential tokenized investment product source/design partner;
- 1exchange: potential regulated market infrastructure;
- Archax: potential tokenization, brokerage, trading or custody infrastructure;
- S&P Dow Jones Indices: potential benchmark/market data context.

These are proposed routes only and must not be represented as signed integrations or endorsements unless separately confirmed.

## 14. Risks and Mitigations
**Partner access delay:** use Canton DevNet or reference asset.
**Upstream interface changes:** isolate adapters behind stable application facing interface.
**Scope creep:** limit grant to one end to end workflow plus one reuse proof.
**Public-good dilution:** acceptance tied to open interfaces, docs, second integration and external adoption evidence.
**Eligibility differences:** surface provider-supported state; do not create independent compliance determinations.

## 15. Funding
**Working Total: 1,000,000 CC**

**Milestone 1:** 250,000 CC
**Milestone 2:** 450,000 CC
**Milestone 3:** 300,000 CC
**Total:** 1,000,000 CC

## 16. Funding Rationale

The 1,000,000 CC request is intended to fund a complete public good implementation, not only an AlphaPilot feature.

The funded scope includes:
- reusable application and provider interfaces;
- an open Canton RWA asset schema;
- a working Canton transaction and settlement reference flow;
- persistence, failure handling and portfolio reconciliation;
- automated tests and integration validation;
- a second adapter or independently reusable asset integration;
- reference UI and developer documentation;
- public demos and external technical review;
- ecosystem reuse proof;
- post-delivery maintenance and compatibility work.

The milestone structure deliberately places 45% of the funding on the end to end transaction and settlement implementation because this is the most technically demanding and most valuable engineering component. The final 30% is tied to reuse and adoption evidence rather than AlphaPilot feature completion alone.

The funding request reflects the work required to deliver a useful open-source Canton reference implementation that other teams can actually use.

## 17. License
Public reference implementation: **Apache-2.0**.
Proposal text in the Canton Development Fund repository follows the repository's **CC0** policy.

## 18. End Result
A Canton application builder can clone the reference, connect a Canton RWA asset through a documented adapter, display verified product data, submit a supported transaction, track real settlement state, and reconcile confirmed ownership into a portfolio.

AlphaPilot serves as the first consuming application and adoption proof, while the public output remains reusable by other Canton builders without requiring AlphaPilot's proprietary platform.
