## Development Fund Proposal

**Author:** BlockyDevs
**Status:** Submitted
**Created:** 2026-03-12  

---

## Abstract

x402 is an open payment protocol for internet-native payments built around HTTP 402 and a facilitator model. It is explicitly designed to support multiple networks and schemes, and new `(scheme, network)` pairs can be added through contributions to the protocol and its reference implementations.

Canton is currently not supported in x402. This means Canton builders cannot natively use x402 to monetize APIs, AI tools, or machine-to-machine services with Canton-settled payments, and Canton is absent from a fast-growing ecosystem of agent-native payment infrastructure.

This proposal delivers a complete **Canton integration for x402** in the correct two-step upstream contribution process:

1. **Specification phase** — design, propose, and submit a Canton payment scheme specification for x402 v2  
2. **Reference implementation phase** — after the specification is accepted and merged by the x402 maintainers, implement and submit a Canton reference implementation

In parallel, BlockyDevs will integrate Canton into **Blocky402**, our independent open-source x402 facilitator platform, and operate a public Canton-compatible facilitator for **12 months**. As part of this operated ecosystem support, BlockyDevs will also allocate **100,000 CC** exclusively for subsidizing the Canton-side transaction costs of qualifying Blocky402 Canton facilitator transactions.

BlockyDevs is well positioned to deliver this work. We already completed this exact upstream process for Hedera:
- **Proposed, accepted, and merged** Hedera x402 scheme specification [PR](https://github.com/coinbase/x402/pull/792)
- **Currently developing** the Hedera reference implementation [PR](https://github.com/coinbase/x402/pull/1360)
- Built and operate **Blocky402**, an independent open-source x402 facilitator stack intended to support multi-network adoption

Because of this prior work, BlockyDevs already has an established working relationship and active communication channels with the x402 team, which reduces coordination risk and increases the likelihood of an efficient upstream contribution process for Canton.

---

## Specification

### 1. Objective

The objective of this proposal is to make **Canton Coin usable as a first-class payment rail within the x402 ecosystem**.

Today, x402 is designed to support multiple `(scheme, network)` pairs, but each new network requires explicit specification work and explicit implementation work. Canton does not yet have either. As a result:

- Canton builders cannot use standard x402 payment middleware to monetize APIs and services with Canton Coin
- AI agents and automated clients cannot programmatically pay x402-protected endpoints using Canton Coin
- Canton is excluded from an emerging machine-to-machine payment ecosystem centered around HTTP-native payments

This proposal solves that gap by delivering the upstream specification work, the reference implementation work, and a production-grade operated facilitator deployment.

The intended outcome is that a Canton builder will be able to:
- define x402 payment requirements for an HTTP endpoint
- accept Canton Coin via a facilitator rather than running custom payment verification logic
- use a maintained, documented, open-source reference implementation
- rely on a public facilitator operated by BlockyDevs through Blocky402 for production and experimentation
- onboard quickly through examples, middleware patterns, and documentation

The first version of the integration will focus on **Canton Coin** and an **exact-payment** flow suitable for pay-per-request APIs and agent-to-agent service calls.

### 2. Implementation Mechanics

This project must follow the actual x402 contribution path for a new chain integration.

#### Two-Step x402 Contribution Process

A new x402 chain integration is not simply a matter of writing a package or launching a facilitator. It is a **two-step upstream process**:

1. **Specify and propose a payment scheme specification for Canton**
2. **After the specification is accepted and merged by the x402 team, develop and submit the reference implementation**

This proposal is intentionally structured around that process.

This is also the process BlockyDevs has already followed for Hedera:
- Hedera x402 scheme specification PR was proposed, reviewed, accepted, and merged
- Hedera reference implementation PR is currently in progress

That prior execution experience materially reduces risk for the Canton integration.

#### Proposed Scope

The implementation consists of four main workstreams:

1. **Canton x402 Scheme Specification**
2. **Canton Reference Implementation**
3. **Blocky402 Canton Integration**
4. **12-Month Operated Facilitator + Transaction-Cost Subsidy**

#### Workstream A — Canton x402 Scheme Specification

BlockyDevs will design and submit a Canton payment scheme specification for x402 v2, focused on **exact payments in Canton Coin**.

The specification work will define:
- the Canton-specific `exact` payment payload format
- the `(scheme, network)` pair and interoperability expectations
- Canton-specific verification requirements
- Canton-specific settlement requirements
- transaction safety constraints
- timeout / expiry considerations
- how Canton’s external-party transaction model maps into x402’s `verify` and `settle` flow

Because x402 schemes are network-specific even when they share the same logical scheme name, the Canton design must be explicit about how `exact` is implemented on Canton rather than assuming EVM or SVM semantics carry over unchanged.

The proposal assumption for v1 is that the Canton design will be based on **externally signed, exact-value Canton Coin transfers**, using Canton’s external-party transaction preparation and signing model.

#### Workstream B — Canton Reference Implementation

Once the Canton specification has been accepted and merged upstream, BlockyDevs will implement the reference Canton integration and submit it upstream to the x402 repository.

The implementation scope will include:
- client-side payment payload construction and signing helpers
- facilitator-side Canton payment verification
- facilitator-side Canton payment settlement
- server-side middleware integration patterns
- end-to-end tests and examples
- developer documentation

The primary implementation goal is to make Canton support usable through the same x402 developer ergonomics expected on other supported networks.

#### Workstream C — Blocky402 Canton Integration

BlockyDevs will integrate Canton support into **Blocky402**, our independent open-source x402 facilitator platform.

This work will include:
- adding Canton as a supported network in Blocky402
- exposing Canton support through the Blocky402 public facilitator environment
- integrating Canton-related documentation into the Blocky402 developer flow
- making it possible for Canton builders to use a live facilitator endpoint without first self-hosting
- publishing setup guidance for self-hosted and public-facilitator usage

Blocky402 is already positioned as an open facilitator for x402 and is designed to be self-hostable and network-extensible. Canton support will therefore be added in a way that benefits both the public operated service and self-hosted adopters.

#### Workstream D — 12-Month Operated Facilitator and Subsidy

BlockyDevs will operate a **public Canton-compatible x402 facilitator for 12 months** as part of Blocky402.

This operated infrastructure component is important because upstream code alone is not sufficient for ecosystem adoption. Builders need a working facilitator endpoint, operational documentation, examples, and a low-friction environment for early adoption.

The operated service component includes:
- public Canton-compatible facilitator availability through Blocky402
- basic monitoring and incident response
- maintenance updates needed to keep the facilitator operational
- release and migration support as the upstream Canton integration evolves
- ecosystem onboarding support through documentation and examples

In addition, BlockyDevs will allocate **100,000 CC** exclusively for subsidizing the Canton-side transaction costs of qualifying **Blocky402 Canton facilitator transactions**.

This subsidy:
- applies only to transaction gas / Canton-side transaction costs incurred in the facilitator settlement flow
- applies only to transactions routed through the operated **Blocky402 Canton facilitator**
- cannot be used for general development, operations, salaries, or unrelated infrastructure
- is subject to a hard budget cap of **100,000 CC**
- will be governed by fair-use and anti-abuse rules
- may be rate-limited or restricted in cases of abusive or non-ecosystem usage

The purpose of this subsidy is to reduce adoption friction for Canton builders experimenting with x402 and to accelerate early ecosystem usage during the first year of support.

#### Architectural Approach

The Canton x402 integration will be **Canton Coin-first** and **exact-payment-first** in v1.

This is intentional. The purpose of the first release is to create a secure, clear, and mergeable Canton integration that fits the x402 model and can be deployed and operated with confidence. Broader asset support and more advanced payment schemes can be proposed later.

The design assumption is that Canton’s **external-party** transaction model is the correct basis for x402 integration, because it allows a payer-controlled signing flow while preserving the x402 trust-minimization principle that the facilitator must not be able to move funds outside of the payer’s explicit intent.

In practical terms, the Canton integration is expected to map x402’s flow as follows:
- client receives `402 Payment Required`
- client selects the Canton payment requirement
- client constructs a Canton-specific exact-payment payload
- client signs the required authorization material as the paying external party
- resource server calls facilitator `/verify`
- facilitator validates the Canton payload against the requested payment requirements
- resource server performs the work
- resource server or middleware calls facilitator `/settle`
- facilitator submits the Canton settlement transaction and returns the settlement result

The specification phase will finalize the exact payload shape and settlement semantics in collaboration with the x402 maintainers.

#### Relevant Implementation Experience

BlockyDevs is especially well suited to deliver this proposal because we already have direct, recent execution experience with x402 chain integration work.

Most importantly:
- we proposed and delivered the Hedera x402 scheme specification that was accepted and merged upstream
- we are currently implementing the Hedera x402 reference implementation upstream
- we built and operate Blocky402, an independent open-source x402 facilitator intended to serve as network-extensible ecosystem infrastructure
- through this work, we already have an established working relationship and active communication channels with the x402 team

Beyond x402 specifically, BlockyDevs operates as a long-term R&D partner for blockchain ecosystems and has experience delivering:
- developer tooling
- SDKs
- reference implementations
- infrastructure integrations
- agent and middleware abstractions
- production-oriented ecosystem support

This matters because the proposal is not simply about writing code. It requires protocol understanding, upstream contribution discipline, operational delivery, and sustained ecosystem support over 12 months.

#### Team and Delivery Structure

The project will be delivered by a focused BlockyDevs team with experience across protocol R&D, TypeScript infrastructure, blockchain integration, and operated ecosystem tooling.

The core delivery model assumes:
- senior technical leadership for specification design, upstream contribution process, and architecture
- implementation support for the reference integration, Blocky402 integration, testing, and documentation
- operational support for the 12-month facilitator deployment, maintenance, and subsidy program

This structure is intentionally aligned with the project shape: a combination of upstream protocol work, implementation work, and operated public infrastructure.

#### Maintenance and Sustainability

The requested funding covers:
- the specification work
- the reference implementation work
- the Blocky402 Canton integration work
- the launch and onboarding materials
- the 12-month operated facilitator period
- the dedicated transaction-cost subsidy pool

Maintenance beyond the 12-month operated period is not included in the requested funding.

However, BlockyDevs intends to continue supporting the integration beyond the initial funded period if ecosystem adoption justifies it. As a long-term R&D partner working with multiple blockchain ecosystems, we regularly maintain SDKs, integrations, and public-goods infrastructure beyond their initial release when they prove strategically useful.

The project will be designed for long-term sustainability, including:
- open-source implementation
- clear documentation
- self-hostable deployment model
- modular network integration boundaries
- compatibility with future ecosystem-led stewardship if appropriate

#### Explicitly Out of Scope

The following items are explicitly out of scope for this proposal:
- non-Canton-Coin payment schemes in v1
- broad asset support beyond the initial Canton Coin integration
- unrelated application-layer products
- retroactive funding for pre-existing unrelated applications
- a Canton-specific proprietary alternative to x402
- indefinite public facilitator operation beyond the funded period

### 3. Architectural Alignment

This proposal is strongly aligned with both **Canton architecture** and the goals of the Canton Development Fund.

First, the Development Fund explicitly targets **developer tooling, reference implementations, and critical infrastructure**. This proposal fits all three categories:
- it creates developer tooling for x402 on Canton
- it contributes a reference implementation to the x402 ecosystem
- it operates public infrastructure through a Canton-compatible facilitator

Second, the proposal aligns with Canton’s architecture because it uses Canton’s **external-party** submission model rather than trying to force an EVM-style payment authorization flow onto Canton.

Canton external parties explicitly sign transaction-related authorization material while transaction preparation and submission are mediated through Canton-compatible infrastructure. This is a good fit for x402 because it preserves payer intent, keeps signing authority with the payer side, and allows the facilitator to validate and submit a payment without becoming a custodian.

Third, the proposal aligns with Canton ecosystem priorities by making Canton usable in an increasingly important application category: **agent-native and API-native payments**. x402 is designed around HTTP-native machine payments, facilitator-mediated settlement, and minimal integration friction. Adding Canton support opens the door for:
- paid APIs
- AI tool monetization
- machine-to-machine service usage
- metered application access
- future commerce and agent infrastructure on Canton

Fourth, the project aligns with open ecosystem principles because the result is not a proprietary payment rail. The main outputs are:
- an upstream protocol contribution
- an open-source reference implementation
- a self-hostable public infrastructure component
- documented developer onboarding

### 4. Backward Compatibility

*No backward compatibility impact.*

This proposal is additive. It does not require changes to Canton core, Splice, Daml, or existing Canton application workflows.

---

## Milestones and Deliverables

### Milestone 1: Canton x402 Scheme Specification
- **Estimated Delivery:** May 2026
- **Focus:** Define and upstream the Canton-specific x402 exact payment scheme.
- **Deliverables / Value Metrics:**
  - technical design for Canton x402 `exact` payment flow
  - draft specification document for Canton x402 v2 integration
  - upstream issue/discussion with x402 maintainers if required
  - submitted upstream PR for Canton scheme specification
  - maintainers’ review feedback incorporated
  - merged or maintainers-approved Canton scheme specification PR

### Milestone 2: Canton Reference Implementation
- **Estimated Delivery:** June 2026
- **Focus:** Build and submit the Canton reference implementation after specification acceptance.
- **Deliverables / Value Metrics:**
  - open-source Canton x402 reference implementation
  - client-side payload construction and signing helpers
  - facilitator `/verify` implementation for Canton
  - facilitator `/settle` implementation for Canton
  - resource-server integration pattern and examples
  - upstream PR submitted to x402 for Canton implementation
  - end-to-end integration tests
  - developer documentation and usage examples

### Milestone 3: Blocky402 Canton Launch
- **Estimated Delivery:** July 2026
- **Focus:** Integrate Canton into Blocky402 and make a public facilitator available.
- **Deliverables / Value Metrics:**
  - Canton network support integrated into Blocky402
  - public Canton-compatible facilitator endpoint available
  - Canton documentation added to Blocky402 docs
  - self-hosting documentation for Canton facilitator deployment
  - example paid endpoint using Canton + x402
  - operational runbook for the public facilitator
  - public launch materials

### Milestone 4: Operated Facilitator — First 6 Months
- **Estimated Delivery:** December 2026
- **Focus:** Sustain the public Canton-compatible facilitator and support first-wave adoption.
- **Deliverables / Value Metrics:**
  - first 6 months of public facilitator operations completed
  - incident handling and maintenance updates during the period
  - quarterly usage and adoption reporting
  - transaction-cost subsidy active for qualifying traffic
  - documented early adopter onboarding support
  - evidence of real Canton x402 settlement activity through the public facilitator

### Milestone 5: Operated Facilitator — Second 6 Months
- **Estimated Delivery:** June 2027
- **Focus:** Complete the full 12-month operated infrastructure period and close out the subsidy program.
- **Deliverables / Value Metrics:**
  - full 12 months of public facilitator operations completed
  - final subsidy utilization report
  - final adoption report including usage, integrations, and lessons learned
  - maintenance and transition playbook for post-funded continuation or handover
  - final ecosystem documentation refresh
  - public close-out summary

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:
- Deliverables completed as specified for each milestone
- Demonstrated functionality or operational readiness
- Documentation and knowledge transfer provided
- Alignment with stated value metrics

Project-specific acceptance conditions:
- A Canton-specific x402 specification PR is submitted and accepted upstream as part of the x402 contribution path
- The reference implementation is developed and submitted upstream after the specification phase is accepted
- The Canton integration demonstrates working `/verify` and `/settle` flows through a facilitator
- A public Canton-compatible facilitator is available through Blocky402
- Documentation exists for both public-facilitator usage and self-hosted deployment
- The 12-month operated period is completed with usage reporting and subsidy reporting
- The dedicated 100,000 CC subsidy pool is used only for Canton-side transaction costs of qualifying Blocky402 Canton facilitator transactions
- The transaction-cost subsidy is applied only within the documented budget cap and fair-use rules
- The final delivery includes a clear post-funded maintenance or transition plan

---

## Funding

**Total Funding Request:** 760,000 CC (at 0.145$ = 110,200 usd)

### Payment Breakdown by Milestone
- Milestone 1 _(Canton x402 Scheme Specification)_: 180,000 CC upon committee acceptance
- Milestone 2 _(Canton Reference Implementation)_: 180,000 CC upon committee acceptance
- Milestone 3 _(Blocky402 Canton Launch)_: 180,000 CC upon committee acceptance
- Milestone 4 _(Operated Facilitator — First 6 Months)_: 60,000 CC upon committee acceptance
- Milestone 5 _(Operated Facilitator — Second 6 Months)_: 60,000 CC upon final release and acceptance
- **Dedicated Blocky402 Canton transaction-cost subsidy pool**: **100,000 CC**

### Subsidy Allocation Restriction

The dedicated **100,000 CC** subsidy pool may be used **only** to cover Canton-side transaction gas / transaction costs for qualifying transactions routed through the public **Blocky402 Canton facilitator**.

It may not be reallocated to salaries, implementation work, general operations, unrelated infrastructure, or any non-subsidy purpose.

### Volatility Stipulation

The project duration is greater than 6 months.

The grant is denominated in fixed Canton Coin and will require a re-evaluation at the 6-month mark.

---

## Co-Marketing

Upon release, the implementing entity will collaborate with the Foundation on:
- announcement coordination
- technical blog or case study
- developer and ecosystem promotion
- launch coverage for the Canton x402 support in Blocky402
- at least one public workshop or demo showing Canton x402 payments end to end
- post-launch adoption updates during the operated facilitator period

---

## Motivation

This proposal is valuable to the Canton ecosystem because it connects Canton to a meaningful emerging payment standard for **internet-native, API-native, and agent-native commerce**.

Without this work, Canton remains absent from x402 and therefore unavailable in a growing set of developer workflows built around HTTP 402, facilitator-mediated settlement, and programmatic service payments. That absence has practical consequences:
- developers cannot use Canton Coin in x402-enabled API monetization
- AI agents cannot pay Canton-based x402 endpoints
- Canton misses an adoption channel centered on recurring machine-driven transactions rather than occasional manual user actions

The proposal is also valuable because it produces more than code. It creates:
- an upstream standard contribution
- a reference implementation
- a live public facilitator
- a documented operational environment
- an adoption subsidy to reduce early friction

This combination matters. Many ecosystem integrations fail not because the protocol cannot be extended, but because no one provides the full path from specification to implementation to operated infrastructure to actual developer onboarding.

BlockyDevs can provide that full path. We have already demonstrated that we can navigate x402’s upstream integration model through our Hedera contribution work, and we already operate Blocky402 as an open facilitator platform. That allows us to bring Canton into x402 in a way that is both technically credible and adoption-oriented.

Finally, this proposal is strategically aligned with the role the Development Fund should play. Rather than funding a narrow app or a proprietary payment product, it funds reusable ecosystem infrastructure that can serve many builders.

---

## Rationale

This is the right approach because it respects the actual structure of x402 contributions.

A Canton x402 integration cannot responsibly begin with “just build a facilitator.” A new supported network requires:
1. an accepted upstream payment scheme specification
2. a reference implementation built against that accepted design

By structuring the proposal around that reality, the project reduces protocol-design risk, aligns with x402 maintainers’ expectations, and avoids building an implementation on top of an unaccepted specification.

This is also the right approach for Canton because the design can be based on Canton’s actual transaction model rather than on assumptions borrowed from EVM or Solana. Canton’s external-party model provides a cleaner trust boundary for x402 than trying to invent a more custodial or more proprietary design.

The proposal is also preferred over narrower alternatives:

- **A standalone proprietary Canton payment gateway** would create less ecosystem value than an upstream x402 integration.
- **A self-host-only implementation** would reduce adoption because most builders want a public facilitator option before they self-host.
- **A reference implementation without operated infrastructure** would limit real-world usage.
- **An operated facilitator without upstream protocol contribution** would be strategically weaker and less reusable.

The Blocky402 component is especially important in this rationale. It gives Canton a credible path not only to theoretical protocol support, but to immediate practical usage through a maintained facilitator environment and a branded adoption surface that already exists.

Finally, the 12-month operated period and transaction-cost subsidy are included because developer infrastructure adoption usually lags code delivery. The ecosystem benefits far more from a solution that is:
- specified
- implemented
- launched
- operated
- and made economically easy to try

than from one that stops at “PR merged.”

That is why this proposal is the right combination of protocol contribution, infrastructure delivery, and ecosystem enablement.
