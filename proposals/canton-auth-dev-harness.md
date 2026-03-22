## Development Fund Proposal: Canton Auth Dev Harness -- Reproducible Local JWT/OIDC Development Toolkit

**Author:** Srikanth (Bitdynamics)  
**Implementing Entity:** Bitdynamics  
**Status:** Submitted  
**Created:** 2026-03-14  

---

## Abstract

This proposal requests funding for a focused open-source developer toolkit that standardizes JWT and OIDC-based local development for Canton applications.

Many Canton teams, especially hybrid and TradFi-oriented teams, get through node setup and then hit the same second-layer friction: how to stand up a usable local identity provider, mint realistic test tokens, shape claims correctly, wire `readAs` / `actAs` behavior into applications, and keep authenticated flows reproducible in CI. Today that work is repeatedly rebuilt as one-off project scaffolding, and the result is that every team spends time rediscovering the same auth misconfiguration problems before they can test real application behavior.

The proposed tool, **Canton Auth Dev Harness**, packages that repeated setup into a reusable public-good toolkit with:

- a local auth harness
- a deterministic fixture mode for CI and smoke tests
- token generation for common development roles
- claim presets and validation helpers
- backend and frontend integration examples
- CI-ready fixtures and diagnostics

The goal is not to build a production auth platform, a hosted IdP, or a generic web-auth starter kit. The goal is to remove repeated local auth setup work from Canton application teams by shipping a small, opinionated toolkit for the specific claim-shaping and token-validation problems Canton builders hit repeatedly.

---

## Specification

### 1. Objective

The objective is to make authenticated Canton application development much easier to bootstrap and much easier to keep consistent across teams.

The intended outcome is a small, opinionated toolkit that gives application teams:

- a working local JWT / OIDC development setup
- a realistic local discovery and JWKS flow when teams need OIDC-like behavior
- a deterministic fixture mode when teams need fast CI and integration tests
- a token generator for common developer and service roles
- reference claims, audience, and issuer configuration
- middleware and app examples for authenticated flows
- repeatable CI fixtures for auth-dependent testing
- diagnostics for common misconfiguration cases

This proposal intentionally focuses on local development, integration testing, and onboarding. It does not attempt to replace enterprise identity infrastructure.

The problem this solves is Canton-specific in two ways:

- application teams repeatedly need JWTs and claims that line up with Canton-facing backend expectations, not only generic login flows
- misconfiguration around issuer, audience, expiry, `readAs`, and `actAs` claims is often discovered late and debugged privately rather than being addressed through a shared reusable harness

The first-wave users for this toolkit are expected to be:

- application teams building authenticated Canton-facing backends
- frontend teams that need realistic local tokens and issuer configuration during app development
- teams running CI for auth-protected application flows
- operators or integration engineers reproducing auth failures locally before debugging them on shared environments

### 2. Implementation Mechanics

The project will be delivered as:

- a CLI: `canton-auth`
- a local auth harness with both reference-IdP mode and deterministic fixture mode
- reusable token and claims tooling
- backend and frontend integration examples

#### Operating Modes

To keep the scope practical while still useful across different teams, the harness will support two explicit local-development modes:

- `fixture mode`: deterministic token issuance and validation for CI, smoke tests, and simple local app testing without depending on a full IdP flow
- `reference IdP mode`: a supported local OIDC-style setup for teams that need issuer discovery, JWKS-based verification, and a more realistic auth environment during development

This split keeps the tool from becoming overly broad while still covering the two most common needs: fast repeatable CI and more realistic local integration.

To keep feasibility strong in the initial funded scope:

- the first release will support one reference IdP implementation, not multiple vendor-specific adapters
- the first release will ship one backend and one frontend integration example, not a broad framework matrix
- fixture mode will remain the baseline path for CI and deterministic testing even if teams do not use the reference IdP mode

#### Core Commands

- `canton-auth up`
- `canton-auth token`
- `canton-auth claims`
- `canton-auth doctor`
- `canton-auth fixtures`

#### What the tool will do

The toolkit will provide:

- local startup of a reference auth environment suitable for Canton development
- deterministic token issuance for clean test and CI environments
- token generation for common role presets such as:
  - app backend
  - app frontend test user
  - operator / admin test flow
  - service-to-service integration
- claims templates covering common Canton-relevant fields such as issuer, audience, subject, expiry, scope, and party-related rights configuration
- examples showing how to validate and consume those tokens in at least one backend and one frontend integration
- CI-friendly fixtures for repeatable authenticated tests
- diagnostics that explain common failures such as:
  - token expired
  - wrong issuer
  - wrong audience
  - missing claims
  - insufficient `readAs` / `actAs`

#### Why this is not generic web auth

The value of this toolkit is not that it can mint any JWT. The value is that it ships with Canton-oriented defaults, examples, and diagnostics for the mistakes that repeatedly slow down real Canton application development:

- wrong issuer or audience values between local issuer and application middleware
- missing or malformed role and rights claims needed by application backends
- inconsistent token-generation logic between local dev and CI
- hard-to-debug auth failures that only appear once teams try to exercise real authenticated application paths

#### Relationship to Existing Tooling

This proposal is intentionally scoped to complement, not replace, broader infrastructure and application tooling:

- it does **not** replace node-launch or deployment tools
- it does **not** replace admin consoles
- it does **not** replace user management systems
- it does **not** build a production IdP service
- it does **not** standardize Canton-wide auth for all environments
- it does provide a reusable local development harness for authenticated Canton application workflows

#### Explicitly Out of Scope

To keep the project realistic and non-overlapping, this proposal does **not** include:

- production auth hosting
- enterprise IdP procurement or deployment
- multiple vendor-specific IdP adapters in the first funded release
- wallet or signing flows
- a full user management console
- a generalized security platform
- hosted infrastructure

### 3. Feasibility Posture

This proposal is intentionally shaped to stay feasible and easy to verify.

- It asks for one focused toolkit, not a full auth platform.
- It separates deterministic fixture mode from more realistic local OIDC-style development so CI and local developer workflows do not depend on the same moving parts.
- It limits the first funded release to one reference IdP path, one backend example, and one frontend example.
- It avoids hosted services, multi-provider support, and production identity operations.

That makes the project easier for the Committee to evaluate: the outputs are concrete, testable, and narrow enough to ship credibly.

### 4. Architectural Alignment

This proposal improves the application integration layer around Canton authentication without changing protocol behavior.

It aligns with the fund and Canton architecture in a straightforward way:

- it is a reusable developer tool
- it reduces repeated setup work across multiple teams
- it improves reliability of authenticated development and test flows
- it produces shared example configurations rather than private project scaffolding
- it provides a common local auth workflow that multiple app teams can reuse without each team rebuilding issuer, token, and claims setup privately

This is exactly the kind of narrow, common-good tooling that can remove repeated friction across the ecosystem.

### 5. Backward Compatibility

No backward compatibility impact.

This is an external developer harness. Teams can adopt it incrementally or ignore it entirely.

---

## Milestones and Deliverables

### Milestone 1: Local Auth Harness and Token CLI

- **Estimated Delivery:** 4 weeks  
- **Focus:** Local auth that works out of the box  
- **Deliverables / Value Metrics:**  
  - local auth harness startup flow for both fixture mode and reference-IdP mode  
  - token generation CLI  
  - claim presets for common app and service roles  
  - issuer, audience, and rights-oriented claims templates for Canton application development  
  - local startup documentation  
  - deterministic fixture-based tests for token issuance and validation  
  - support for one documented reference IdP integration in the first funded release  
  - value metric: a team can start the harness and obtain working local tokens for documented developer roles in under 10 minutes from a clean environment

### Milestone 2: Middleware and App Integration Examples

- **Estimated Delivery:** 4 weeks  
- **Focus:** Practical use in real Canton application stacks  
- **Deliverables / Value Metrics:**  
  - backend middleware example for token validation and claims consumption  
  - frontend integration example for authenticated local development flows  
  - sample environment and config templates  
  - end-to-end authenticated example flows  
  - automated tests for authenticated request handling  
  - value metric: example applications can exercise authenticated Canton-facing flows end to end without ad hoc auth setup outside the documented harness

### Milestone 3: CI Fixtures, Diagnostics, and Documentation

- **Estimated Delivery:** 3 weeks  
- **Focus:** Repeatable team adoption and lower debugging cost  
- **Deliverables / Value Metrics:**  
  - CI-ready auth fixtures  
  - `doctor` checks for common misconfiguration cases including expired token, wrong issuer, wrong audience, missing claims, and insufficient `readAs` / `actAs`  
  - troubleshooting guide  
  - short end-to-end walkthrough  
  - release artifacts and usage documentation  
  - value metric: teams can reproduce documented auth fixtures in CI and receive clear diagnostics for at least the common failure modes listed in the proposal

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
- the toolkit must support a deterministic fixture mode suitable for CI in addition to a more realistic local auth mode
- the first funded release must remain limited to one documented reference IdP integration rather than a multi-provider compatibility matrix

---

## Funding

**Total Funding Request:** 330,000 CC

### Payment Breakdown by Milestone

- Milestone 1 _(Local Auth Harness and Token CLI)_: 110,000 CC upon committee acceptance  
- Milestone 2 _(Middleware and App Integration Examples)_: 120,000 CC upon committee acceptance  
- Milestone 3 _(CI Fixtures, Diagnostics, and Documentation)_: 100,000 CC upon final release and acceptance  

### Funding Rationale

- Milestone 1 funds the core developer utility of the project: startup flow, token issuance, claim shaping, and the dual-mode local auth model that makes the tool useful in both CI and realistic local development.
- Milestone 2 funds proof that the harness works in practice rather than only in isolation: backend validation, frontend consumption, and documented application integration flows.
- Milestone 3 funds adoption and reliability work: CI fixtures, diagnostics, troubleshooting, and release-quality documentation that reduce repeated debugging costs across teams.
- No recurring maintenance or hosted-service budget is requested in this proposal; the request is for a one-time open-source tooling release with milestone-based acceptance.

## Team Background

### BitDynamics

BitDynamics brings deep experience in building and operating blockchain infrastructure. The team has worked across Ethereum client infrastructure, validator operations, and production-grade hosting systems supporting validator infrastructure securing more than 2 billion AUD in assets. This background is directly relevant to building reliable, auditable, and security-conscious public infrastructure for a grants program. Team is also building actively on Canton. 

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

As the ecosystem grows, this kind of friction matters more, not less. The cost of every team rebuilding local issuer setup, token presets, and auth debugging logic privately is wasted ecosystem effort. A shared harness makes authenticated development more reproducible, easier to onboard, and less dependent on project-specific tribal knowledge.

---

## Rationale

This proposal is intentionally narrow because narrow proposals are easier to verify, easier to adopt, and less likely to overlap with broader infrastructure efforts.

Why this scope is strong:

1. it solves a practical integration problem that appears across many Canton teams
2. it remains clearly distinct from deployment tools, admin consoles, and wallet proposals
3. it keeps scope realistic by separating deterministic CI fixtures from more realistic local auth flows
4. it is modestly priced and realistically scoped

The result is a proposal that is simple to understand, useful immediately, and aligned with the Development Fund's emphasis on shared developer tooling.
