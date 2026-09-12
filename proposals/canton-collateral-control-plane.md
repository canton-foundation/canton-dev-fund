## Development Fund Proposal

**Author:** Charles Dusek / Merged.One (@cgdusek, cgdusek@merged.one)
**Status:** Draft
**Created:** 2026-03-30

---

## Abstract

We propose **Canton Collateral Control Plane**, an open-source reference control layer for **collateral eligibility, haircuting, concentration limits, encumbrance state, substitution, allocation, pre-positioning, release control, and atomic collateral mobility** on the Canton Network.

The Control Plane is designed as shared public-good infrastructure for the Canton ecosystem. It gives applications and institutions a common way to express, evaluate, optimize, and execute collateral policy across workflows such as **variation margin, initial margin, bilateral collateralization, repo, securities lending, treasury optimization, collateral recall, and close-out**. Rather than building a private venue or a point solution for one member, it creates a reusable **collateral control plane** that can sit underneath financing apps, bilateral derivatives apps, tokenized-asset platforms, stablecoin rails, and custodial workflows.

This is a strong fit for Canton because the network is already converging around collateral mobility and 24x7 financing. Public ecosystem activity includes on-chain U.S. Treasury financing against USDC, cross-border intraday repo using tokenized deposits, tokenized DTC- and Fed-eligible securities, tokenized collateral pilots with Euroclear, and stablecoin plus treasury products such as USDCx, USYC, and USDM1. At the same time, the public open-source surface already includes Canton, Quickstart, Daml Finance, and the Canton token standard work, but not a neutral collateral standard and optimizer that others can plug into.

The goal of the Control Plane is to make collateral reusable, inspectable, and programmable across Canton apps without forcing every app, venue, or infrastructure provider to reinvent collateral rules.

**Prototype repository:** [merged-one/canton-collateral-control-plane](https://github.com/merged-one/canton-collateral-control-plane)

A public prototype already exists and now demonstrates the core delivery path on a pinned Quickstart runtime: Control Plane DAR deployment, one concrete reference token-adapter path, and Quickstart-backed confidential margin-call, substitution, and return flows with machine-readable conformance and demo-pack artifacts.

---

## Specification

### 1. Objective

The objective of the Canton Collateral Control Plane is to provide the Canton ecosystem with a shared, inspectable, machine-executable framework for:

- collateral eligibility evaluation
- haircut and lendable-value calculation
- concentration-limit monitoring
- encumbrance and release control
- collateral substitution
- best-to-post and cheapest-to-deliver allocation
- atomic collateral movement across workflows
- machine-readable collateral decision and execution reports

The intended outcome is that a Canton builder or operator can define a collateral policy once and reuse it across multiple application workflows, while counterparties can independently verify why a collateral set is accepted, rejected, substituted, delivered, or returned.

#### Problem Statement

Canton already has public evidence of financing, collateral mobility, and tokenized-cash/tokenized-securities activity. However, those efforts are currently expressed through specific apps, pilots, or member-specific implementations. What is missing publicly is the **neutral policy layer** that standardizes how a collateral obligation is evaluated and fulfilled across different apps and asset types.

Without such a layer, the network risks recreating the fragmentation of traditional collateral silos:
- each app defines its own eligibility grammar
- each venue hardcodes its own haircuting logic
- substitution rules remain app-specific
- encumbrance state becomes difficult to reuse across workflows
- interoperability stops at asset transfer instead of extending to collateral control

The Canton Collateral Control Plane addresses that gap.

### 2. Implementation Mechanics

The Control Plane will be delivered as an open-source reference stack with five layers.

#### A. Control Plane vs. Data Plane

The architecture is intentionally split into:

**Control plane**
- Collateral Policy Language (CPL)
- eligibility evaluation
- haircut and lendable-value calculation
- concentration-limit monitoring
- encumbrance and release control
- substitution rights and execution rules
- optimization and allocation logic
- conformance and reporting

**Data plane**
- token-standard-style assets
- Daml Finance-style assets
- ledger contracts and holdings state
- settlement / DvP rails
- Quickstart / LocalNet reference environment
- application-specific financing, repo, treasury, or derivatives workflows

This separation mirrors institutional market infrastructure. Settlement and transfer rails remain distinct from collateral policy, eligibility, and optimization logic.

#### B. Layer 1: Collateral Policy Language (CPL)

A versioned, machine-readable policy schema for:
- eligible asset classes, issue types, and issuers
- haircut schedules
- cross-currency treatment
- custodian and jurisdiction filters
- encumbrance state
- concentration limits
- wrong-way-risk exclusions
- segregation and reuse flags
- substitution rights
- settlement windows, cutoffs, and expiries

#### C. Layer 2: Policy Engine

A deterministic engine that evaluates:
- eligibility
- lendable value after haircuts
- concentration utilization
- policy failures
- remediation options
- release conditions

#### D. Layer 3: Optimization Engine

A reference optimizer for:
- best-to-post / cheapest-to-deliver allocation
- collateral substitution
- concentration-aware allocation across multiple obligations
- pre-positioned versus mobilizable inventory selection
- explanation traces that justify optimizer output

#### E. Layer 4: Workflow Library

Reference Daml workflows for:
- initial margin call
- variation margin call
- collateral delivery
- collateral substitution
- collateral return
- close-out transfer / seizure
- exception and dispute handling

#### F. Layer 5: Conformance Suite

A formal invariant catalog plus executable tests covering:
- eligibility determinism
- haircut conservation
- concentration-limit enforcement
- no double encumbrance
- authorization and secured-party control
- atomic substitution
- replay safety
- report fidelity
- atomic settlement across legs

#### G. Industry Design Basis

The Control Plane is intentionally modeled on how high-value collateral systems operate in established markets.

**Central bank and CSD pattern.** The Federal Reserve separates settlement plumbing from collateral policy. The Fedwire Securities Service provides book-entry securities transfer and real-time DvP settlement finality, while the Federal Reserve's discount window and related facilities apply explicit lendable values and haircuts to pledged collateral. Restricted accounts are used to pledge collateral and typically require pledgee approval for release. The Eurosystem similarly provides credit only against adequate collateral under a common eligibility framework, and the Bank of England emphasizes pre-positioning, operational pool control, concentration limits, and haircuts calibrated to stress.

The Control Plane follows the same pattern:
- settlement and token transfer remain separate from policy evaluation
- collateral policy is explicit, versioned, and portable
- encumbrance and release control are first-class concepts
- pre-positioned inventory and just-in-time mobilization are both supported

**Tri-party and collateral utility pattern.** Tri-party agents and collateral utilities handle eligibility evaluation, valuation, substitution, allocation, collateral optimization, and operational control. That is the right model for Canton. The Control Plane is not a venue and not a CCP. It is a reusable **collateral utility layer**.

**CCP and FMI risk pattern.** CCPs and FMIs publish acceptable collateral schedules, haircut schedules, concentration limits, legal control requirements, and operational timing rules. PFMI-style thinking implies that collateral infrastructure should have a clear legal and operational basis, conservative haircuting, concentration controls, deterministic settlement and release behavior, and auditable exception handling. The Control Plane therefore treats policy, control, and auditability as primary design goals rather than optional implementation details.

#### H. Explicitly Out of Scope

To keep the proposal bounded, the following are out of scope for the initial funded phase:

- building a CCP, custodian, or central bank facility
- operating a price oracle business
- legal-document automation
- building a proprietary collateral management product
- replacing specific repo, derivatives, or venue apps already being built on Canton
- full formal verification of Canton
- hosted SaaS collateral services
- broad UI/dashboard product development

The Control Plane is the shared reference layer that such applications can reuse.

### 3. Architectural Alignment

This proposal is a direct fit for Canton.

Canton's value proposition is not generic token transfer. It is:
- application heterogeneity
- privacy by design
- party-specific visibility
- composable workflows across multiple applications and domains
- atomic synchronization without bridges

The Canton white paper explicitly emphasizes application heterogeneity, programmable privacy, sub-transaction privacy, and atomic composition across applications and sync domains. That is exactly the architecture needed for collateral workflows, where the pledgor, secured party, custodian, issuer, venue, and optimizer should not all have identical visibility or control.

Daml's model of signatories, observers, controllers, authorization, and nonconsuming choices is especially well suited to collateral workflows. The Canton token standard work already targets arbitrary Canton Network assets and multi-legged DvP. Daml Finance already provides tokenization building blocks. The Control Plane sits one layer above those components: it tells applications **which assets are acceptable as collateral, in what amount, under what control conditions, and with what substitution and return rights**.

Quickstart is also a good fit for the prototype and demo path because it provides a modular LocalNet environment built from Docker Compose layers, including validator nodes and supporting services, and is intended to be extended during development.

All proposal-funded deliverables will be released as open-source artifacts under a permissive license, with public schemas, reference Daml packages, integration docs, example adapters, test assets, and scenario runner and report formats. The goal is to create reusable infrastructure for the network, not a proprietary product.

### 4. Backward Compatibility

*No backward compatibility impact.*

The project is entirely additive. Existing Canton apps can integrate it incrementally. It does not require protocol changes to Canton itself.

---

## Milestones and Deliverables

### Milestone 1: Control Plane Policy Model and Formal Specification
- **Estimated Delivery:** 4 weeks from project start
- **Focus:** Establish the CPL specification, formal invariant catalog, policy schema, and reference policy profiles
- **Deliverables / Value Metrics:**
  - CPL v0.1 specification
  - schema for eligibility, haircuts, concentration limits, encumbrance state, substitution rights, and release control
  - formal invariant catalog
  - architecture and data model documentation
  - sample policy profiles:
    - bilateral CSA / GMRA style
    - tri-party style
    - CCP style
    - central-bank style

### Milestone 2: Control Plane Policy Engine and Asset Adapters
- **Estimated Delivery:** 5 weeks from Milestone 1 acceptance
- **Focus:** Deliver the deterministic policy engine, haircut and concentration-limit evaluation, and token-standard-style asset adapter boundary
- **Deliverables / Value Metrics:**
  - deterministic policy engine
  - haircut and lendable-value calculator
  - concentration-limit evaluator
  - token-standard-style asset adapter boundary
  - reference adapters for Quickstart-based assets and Daml Finance-style assets
  - machine-readable policy evaluation reports

### Milestone 3: Control Plane Optimization and Substitution Engine
- **Estimated Delivery:** 5 weeks from Milestone 2 acceptance
- **Focus:** Deliver the allocation optimizer, substitution engine, and explanation trace generation for collateral decisions
- **Deliverables / Value Metrics:**
  - best-to-post / cheapest-to-deliver optimizer
  - substitution engine
  - pre-positioned versus mobilizable inventory logic
  - concentration-aware multi-obligation allocation
  - deterministic explanation traces for optimizer decisions

### Milestone 4: Control Plane Workflows, Atomic Execution, and Conformance
- **Estimated Delivery:** 5 weeks from Milestone 3 acceptance
- **Focus:** Deliver end-to-end Daml workflows for margin and collateral lifecycle, atomic execution against a real Canton reference environment, and conformance suite
- **Deliverables / Value Metrics:**
  - Daml workflows for margin call, margin return, substitution, and close-out transfer
  - atomic multi-leg execution against a real Canton reference environment
  - conformance suite and invariant reports
  - negative-path scenarios:
    - ineligible asset
    - expired call
    - insufficient lendable value
    - concentration breach
    - unauthorized release
    - duplicate / replayed instruction

### Milestone 5: Public Release, Demo Environment, and Adoption Package
- **Estimated Delivery:** 4 weeks from Milestone 4 acceptance
- **Focus:** Prepare the toolkit for wider ecosystem use with public release, demo environment, documentation, and adoption guidance
- **Deliverables / Value Metrics:**
  - public release
  - Quickstart-based demo environment
  - maintainer, operator, and integration documentation
  - reference machine-readable and human-readable reports
  - recorded walkthrough
  - adoption guide for venues, custodians, financing apps, treasury desks, and collateral service providers

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone
- Demonstrated functionality or operational readiness
- Documentation and knowledge transfer provided
- Alignment with stated value metrics

Project-specific acceptance conditions:

**Milestone 1:**
- CPL is published and versioned
- at least 12 named invariants are specified
- at least one policy profile each exists for bilateral, tri-party, CCP-style, and central-bank-style usage
- at least one spec-to-scenario traceability example is published

**Milestone 2:**
- policy engine evaluates eligibility and lendable value deterministically
- haircut and concentration-limit results are reproducible
- reports identify specific policy failures
- token-standard-style assets can be evaluated by the engine

**Milestone 3:**
- optimizer produces deterministic allocations under documented assumptions
- substitution logic respects policy, encumbrance state, and concentration limits
- explanation traces show why selected assets were chosen
- multiple obligations can be evaluated in one run

**Milestone 4:**
- margin call, return, and substitution workflows execute end to end on a real Canton-based environment
- atomicity holds across all supported legs
- negative-path scenarios fail cleanly and reproducibly
- invariant reports are generated from actual execution

**Milestone 5:**
- public repo, docs, and demo are released
- a third party can run the demo from documented commands
- at least two sample policy profiles and two sample execution reports are published
- integration guidance is complete enough for external adopters

---

## Funding

**Total Funding Request:** **650,000 CC**

### Payment Breakdown by Milestone
- **Milestone 1 _(Control Plane Policy Model and Formal Specification)_: 100,000 CC upon committee acceptance**
- **Milestone 2 _(Control Plane Policy Engine and Asset Adapters)_: 140,000 CC upon committee acceptance**
- **Milestone 3 _(Control Plane Optimization and Substitution Engine)_: 160,000 CC upon committee acceptance**
- **Milestone 4 _(Control Plane Workflows, Atomic Execution, and Conformance)_: 150,000 CC upon committee acceptance**
- **Milestone 5 _(Public Release, Demo Environment, and Adoption Package)_: 100,000 CC upon final release and acceptance**

### Volatility Stipulation

If the project duration is **under 6 months**:
Should the project timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility.

---

## Co-Marketing

Upon release, the implementing entity will collaborate with the Foundation on:

- announcement coordination
- a technical write-up on collateral policy design for Canton
- a live demo of confidential collateral substitution and margin optimization
- developer or ecosystem promotion

Specific commitments:
- publish example policy profiles and execution reports
- publish setup and execution guidance for external adopters
- operator and integrator education for apps building on the stack
- present the project as shared ecosystem infrastructure rather than a private product

---

## Motivation

The Canton ecosystem is becoming a **collateral network**.

Public ecosystem activity now includes:
- Tradeweb financing on Canton
- DTCC work on tokenized DTC- and Fed-eligible securities
- Euroclear collateral mobility pilots
- Broadridge DLR repo at scale
- USDCx / USYC and USDM1 as high-utility cash and Treasury-linked instruments
- public marketing around confidential collateral, 24x7 financing, and capital efficiency

In that environment, the absence of a neutral collateral control plane will become a structural bottleneck. The Control Plane solves that bottleneck without competing with member businesses. It gives venues, financing apps, bilateral derivatives apps, tokenized-asset issuers, custodians, and treasury teams a common open layer for policy expression, eligibility checking, substitution, optimization, and execution.

That is much more adoptable than a single private app or a winner-take-all venue.

---

## Rationale

This proposal is intentionally shaped by existing institutional collateral-market practice rather than generic DeFi convention.

The right analogue is not "another DEX with collateral support." The right analogue is:
- central-bank-style collateral schedules
- tri-party collateral selection and substitution
- CCP haircuting and concentration control
- cross-border collateral utility
- programmable settlement with explicit control and auditability

The Fedwire model is especially relevant: securities transfer and DvP settlement are handled on the settlement rail, while collateral eligibility, lendable value, and haircut logic are governed separately. The Control Plane adopts the same separation and maps it onto Canton's programmable, privacy-preserving application model.

Canton is unusually well suited to implement that layer because it combines:
- programmable privacy
- party-specific views
- contract-level authorization
- composable workflows
- atomic cross-application execution

The Canton Collateral Control Plane therefore targets the most obvious missing public-good layer in the ecosystem: **a shared, reusable collateral control utility that other Canton apps can integrate.**

A public prototype already exists at [merged-one/canton-collateral-control-plane](https://github.com/merged-one/canton-collateral-control-plane), demonstrating DAR deployment into a pinned Quickstart runtime, a concrete reference token-adapter path, and Quickstart-backed confidential margin-call, substitution, and return flows with machine-readable conformance artifacts. This working prototype directly de-risks Milestones 2 through 5 by providing evidence that the proposed architecture, execution model, and workflow pipeline are technically feasible and already producing real outputs.

### Design Basis References

1. Canton Foundation Protocol Development Fund — https://canton.foundation/grants-program/
2. Canton Foundation launch announcement for the Development Fund — https://canton.foundation/canton-foundation-launches-protocol-development-fund/
3. Canton Network White Paper — https://www.canton.network/hubfs/Canton/Canton%20Network%20-%20White%20Paper.pdf
4. CN Quickstart project structure and LocalNet overview — https://docs.digitalasset.com/build/3.5/quickstart/configure/project-structure-overview.html
5. Fedwire Securities Service — https://www.frbservices.org/financial-services/securities/
6. Federal Reserve collateral lendable value and haircuts — https://www.federalreserve.gov/monetarypolicy/bsd-monetary-policy-tools-201708.htm
7. ECB collateral framework — https://www.ecb.europa.eu/mopo/coll/html/index.en.html
8. Bank of England eligible collateral and pre-positioning guidance — https://www.bankofengland.co.uk/markets/eligible-collateral
9. PFMI / CPMI-IOSCO — https://www.bis.org/cpmi/publ/d101.htm
10. Canton collateral / financing ecosystem references — https://www.canton.network/ecosystem/tradeweb, https://www.canton.network/ecosystem/broadridge-dlr, https://www.canton.network/ecosystem/euroclear, https://www.canton.network/ecosystem/circle, https://www.canton.network/ecosystem/usdm1, https://www.canton.network/on-chain-collateral
