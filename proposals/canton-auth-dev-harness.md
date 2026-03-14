## Development Fund Proposal

**Author:** Srikanth (Bitdynamics)  
**Implementing Entity:** Bitdynamics  
**Status:** Draft  
**Created:** 2026-03-14  

---

## Abstract

This proposal requests funding for a focused open-source developer toolkit that standardizes JWT and OIDC-based local development for Canton applications.

Many Canton teams, especially hybrid and TradFi-oriented teams, get through node setup and then hit the same second-layer friction: how to stand up a usable local identity provider, mint realistic test tokens, shape claims correctly, wire `readAs` / `actAs` behavior into applications, and keep authenticated flows reproducible in CI. Today that work is repeatedly rebuilt as one-off project scaffolding.

The proposed tool, **Canton Auth Dev Harness**, packages that repeated setup into a reusable public-good toolkit with:

- a local auth harness
- token generation for common development roles
- claim presets and validation helpers
- backend and frontend integration examples
- CI-ready fixtures and diagnostics

The goal is not to build a production auth platform. The goal is to remove repeated local auth setup work from Canton application teams.

---

## Specification

### 1. Objective

The objective is to make authenticated Canton application development much easier to bootstrap and much easier to keep consistent across teams.

The intended outcome is a small, opinionated toolkit that gives application teams:

- a working local JWT / OIDC development setup
- a token generator for common developer and service roles
- reference claims, audience, and issuer configuration
- middleware and app examples for authenticated flows
- repeatable CI fixtures for auth-dependent testing
- diagnostics for common misconfiguration cases

This proposal intentionally focuses on local development, integration testing, and onboarding. It does not attempt to replace enterprise identity infrastructure.

### 2. Implementation Mechanics

The project will be delivered as:

- a CLI: `canton-auth`
- a local auth harness using a supported reference or mock IdP
- reusable token and claims tooling
- backend and frontend integration examples

#### Core Commands

- `canton-auth up`
- `canton-auth token`
- `canton-auth claims`
- `canton-auth doctor`
- `canton-auth fixtures`

#### What the tool will do

The toolkit will provide:

- local startup of a reference auth environment suitable for Canton development
- token generation for common role presets such as:
  - app backend
  - app frontend test user
  - operator / admin test flow
  - service-to-service integration
- claims templates covering common Canton-relevant fields such as issuer, audience, and party-related rights configuration
- examples showing how to validate and consume those tokens in at least one backend and one frontend integration
- CI-friendly fixtures for repeatable authenticated tests
- diagnostics that explain common failures such as:
  - token expired
  - wrong issuer
  - wrong audience
  - missing claims
  - insufficient `readAs` / `actAs`

#### Relationship to Existing Tooling

This proposal is intentionally scoped to complement, not replace, broader infrastructure and application tooling:

- it does **not** replace node-launch or deployment tools
- it does **not** replace admin consoles
- it does **not** replace user management systems
- it does **not** build a production IdP service
- it does provide a reusable local development harness for authenticated Canton application workflows

#### Explicitly Out of Scope

To keep the project realistic and non-overlapping, this proposal does **not** include:

- production auth hosting
- enterprise IdP procurement or deployment
- wallet or signing flows
- a full user management console
- a generalized security platform
- hosted infrastructure

### 3. Architectural Alignment

This proposal improves the application integration layer around Canton authentication without changing protocol behavior.

It aligns with the fund and Canton architecture in a straightforward way:

- it is a reusable developer tool
- it reduces repeated setup work across multiple teams
- it improves reliability of authenticated development and test flows
- it produces shared example configurations rather than private project scaffolding

This is exactly the kind of narrow, common-good tooling that can remove repeated friction across the ecosystem.

### 4. Backward Compatibility

No backward compatibility impact.

This is an external developer harness. Teams can adopt it incrementally or ignore it entirely.

---

## Milestones and Deliverables

### Milestone 1: Local Auth Harness and Token CLI

- **Estimated Delivery:** 4 weeks  
- **Focus:** Local auth that works out of the box  
- **Deliverables / Value Metrics:**  
  - local auth harness startup flow  
  - token generation CLI  
  - claim presets for common app and service roles  
  - local startup documentation  
  - deterministic fixture-based tests for token issuance and validation  

### Milestone 2: Middleware and App Integration Examples

- **Estimated Delivery:** 4 weeks  
- **Focus:** Practical use in real Canton application stacks  
- **Deliverables / Value Metrics:**  
  - backend middleware example  
  - frontend integration example  
  - sample environment and config templates  
  - end-to-end authenticated example flows  
  - automated tests for authenticated request handling  

### Milestone 3: CI Fixtures, Diagnostics, and Documentation

- **Estimated Delivery:** 3 weeks  
- **Focus:** Repeatable team adoption and lower debugging cost  
- **Deliverables / Value Metrics:**  
  - CI-ready auth fixtures  
  - `doctor` checks for common misconfiguration cases  
  - troubleshooting guide  
  - short end-to-end walkthrough  
  - release artifacts and usage documentation  

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- the harness can start a local auth environment and issue working test tokens
- token presets generate the documented claims successfully
- backend and frontend example integrations work end to end
- CI fixtures are repeatable across clean environments
- diagnostics identify common misconfiguration cases clearly
- documentation and troubleshooting guidance are complete
- the project is released as open source

Project-specific acceptance conditions:

- the project must remain scoped to local auth development and test workflows
- the toolkit must not require hosted infrastructure to use its local mode
- the examples must demonstrate authenticated Canton application flows rather than generic web auth only

---

## Funding

**Total Funding Request:** 330,000 CC

### Payment Breakdown by Milestone

- Milestone 1 _(Local Auth Harness and Token CLI)_: 110,000 CC upon committee acceptance  
- Milestone 2 _(Middleware and App Integration Examples)_: 120,000 CC upon committee acceptance  
- Milestone 3 _(CI Fixtures, Diagnostics, and Documentation)_: 100,000 CC upon final release and acceptance  

### Volatility Stipulation

If the project duration extends beyond 6 months due to Committee-requested scope changes, remaining milestones should be renegotiated for material CC/USD volatility.

No recurring maintenance funding or hosted-service budget is requested in this proposal.

---

## Co-Marketing

Upon release, the implementing entity will collaborate with the Foundation on:

- announcement coordination
- a short technical write-up
- one developer-facing walkthrough or demo

Specific commitments:

- publish a practical setup guide for local auth-enabled Canton development
- publish one example repository layout or app folder structure

---

## Motivation

JWT and OIDC setup is repeatedly mentioned as friction in Canton development. Teams often spend disproportionate time getting local claims, test tokens, audiences, and middleware wiring correct before they can even test real application behavior.

A small, reusable auth harness removes that setup tax across multiple teams and turns repeated private boilerplate into a shared public-good tool.

---

## Rationale

This proposal is intentionally narrow because narrow proposals are easier to verify, easier to adopt, and less likely to overlap with broader infrastructure efforts.

Why this scope is strong:

1. it solves a practical integration problem that appears across many Canton teams
2. it remains clearly distinct from deployment tools, admin consoles, and wallet proposals
3. it has objective deliverables and easy acceptance criteria
4. it is modestly priced and realistically scoped

The result is a proposal that is simple to understand, useful immediately, and aligned with the Development Fund's emphasis on shared developer tooling.
