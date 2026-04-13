## Development Fund Proposal: Canton Auth Dev Harness -- Reproducible Local JWT/OIDC Development Toolkit

**Author:** Srikanth (Bitdynamics)  
**Implementing Entity:** Bitdynamics  
**Status:** Submitted  
**Created:** 2026-03-14  

---

## Abstract

This proposal requests funding for a focused open-source developer toolkit that standardizes JWT- and OIDC-based local development for Canton applications.

Many Canton teams, especially hybrid and TradFi-oriented teams, get through node setup and then hit the same second-layer friction: how to stand up a usable local identity provider, mint realistic test tokens, shape claims correctly, wire `readAs` / `actAs` behavior into applications, and keep authenticated flows reproducible in CI. Today that work is repeatedly rebuilt as one-off project scaffolding, and the result is that every team spends time rediscovering the same auth-misconfiguration problems before they can test real application behavior.

The proposed tool, **Canton Auth Dev Harness**, packages that repeated setup into a reusable public-good toolkit with:

- a local auth harness
- a deterministic fixture mode for CI and smoke tests
- token generation for common development roles
- claim presets and validation helpers
- backend and frontend integration examples
- CI-ready fixtures and diagnostics
- a CLI available both as `canton-auth` and as a DPM-oriented component command via `dpm canton-auth`

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

- a CLI available both as `canton-auth` and as a DPM component command via `dpm canton-auth`
- a local auth harness with both reference-IdP mode and deterministic fixture mode
- reusable token and claims tooling
- backend and frontend integration examples

#### Operating Modes

To keep the scope practical while still useful across different teams, the harness will support two explicit local-development modes:

- `fixture mode`: deterministic token issuance and validation for CI, smoke tests, and simple local app testing without depending on a full IdP flow
- `reference IdP mode`: a supported local OIDC-style setup for teams that need issuer discovery, JWKS-based verification, and a more realistic auth environment during development. In the first funded release, this will be one embedded standards-based implementation built on `oidc-provider`, not a Keycloak distribution, Auth0-compatible mock, or multi-vendor emulation layer.

This split keeps the tool from becoming overly broad while still covering the two most common needs: fast repeatable CI and more realistic local integration.

To keep feasibility strong in the initial funded scope:

- the first release will support one embedded reference IdP implementation based on `oidc-provider`, not multiple vendor-specific adapters
- the first release will ship one backend and one frontend integration example, not a broad framework matrix
- fixture mode will remain the baseline path for CI and deterministic testing even if teams do not use the reference IdP mode

#### Core Commands

- `canton-auth up`
- `canton-auth token`
- `canton-auth claims`
- `canton-auth doctor`
- `canton-auth fixtures`

The same command surface will also be documented through the DPM component path as `dpm canton-auth ...` so the tool can align with existing Digital Asset developer tooling rather than existing only as a separate top-level CLI.

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

- it does **not** replace `dpm` as the entry point for Daml build, test, code generation, or sandbox workflows
- it does **not** replace node-launch or deployment tools
- it does **not** replace admin consoles
- it does **not** replace user management systems
- it does **not** build a production IdP service
- it does **not** standardize Canton-wide auth for all environments
- it does provide a reusable local development harness for authenticated Canton application workflows

To avoid fracturing CLI contributions, the tool will be packaged both as a standalone CLI and as a DPM component command, while remaining focused on local auth and runtime test workflows rather than package-management concerns.

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

### Milestone 1: First Reproducible Team Adoption

Adoption outcome:

- a new team can adopt the harness from a clean environment through either the standalone CLI path or the documented `dpm canton-auth` component path
- that team can use fixture mode as the default adoption path for local development and CI-style testing
- that team also has a documented reference IdP option through the embedded `oidc-provider` implementation when realistic local OIDC behavior is needed
- one documented authenticated Canton flow is published end to end and is usable without bespoke setup

For this proposal, the documented authenticated Canton flow is:

- start fixture mode from a clean checkout
- mint an `app-backend` token
- validate that token against Canton-specific checks for `party`, `readAs`, `actAs`, and `scope=daml_ledger_api`
- use that token against the example Canton-facing backend and successfully call a documented endpoint such as `/api/canton/whoami`

This makes the milestone verifiable through a Canton-specific claims-and-authorization flow rather than only through generic JWT issuance.

### Milestone 2: Evaluator and Example Adoption

Adoption outcome:

- the backend and frontend example packages are adoption-ready for an evaluator or ecosystem team, with setup instructions, expected claims, protected routes, and documented local auth behavior
- evaluator-facing documentation explains how an adopter can use the examples in fixture mode and in reference IdP mode
- outreach is initiated to at least one external evaluator or ecosystem team so the package is positioned for real adoption feedback; completion of this milestone is not blocked on external availability, but the materials must be structured for an actual handoff rather than only internal use

The intended acceptance evidence for this milestone is not just "examples exist", but that:

- the backend example accepts a valid harness-issued token and returns the authenticated Canton identity and rights on a documented route
- a non-admin token is rejected from a documented admin-only route, demonstrating Canton-aware authorization behavior
- the frontend example can complete the documented local auth flow and make an authenticated request using the harness
- the expected claims, issuer, audience, and route behavior are documented clearly enough for an evaluator to reproduce

### Milestone 3: Repeatable Multi-Environment Adoption

Adoption outcome:

- evaluation findings and hardening work from Milestone 2 are incorporated so adoption gets easier after first use
- teams can adopt the harness repeatedly across clean environments for CI and local debugging without ad hoc support
- `canton-auth fixtures` exports named CI artifacts including `jwks.json`, `tokens.json`, per-role token files, `.env`, and config metadata
- `canton-auth doctor` and the DPM component packaging remain functional as part of the repeatable adoption path

The intended acceptance evidence for this milestone is externally reproducible:

- an evaluator can run `canton-auth fixtures` in two separate clean directories and confirm that the generated `tokens.json` and `jwks.json` outputs match
- an evaluator can run `canton-auth doctor --token <token>` and see checks covering harness health, JWKS reachability, issuer, audience, and Canton-specific claim requirements
- release documentation and troubleshooting guidance are complete enough to reproduce the documented flows without ad hoc setup

---

## Potential Ecosystem Beneficiaries

This proposal is intended as public-good infrastructure for the wider Canton ecosystem, and a few ecosystem teams appear well aligned with this feature set and with the kinds of local-auth and integration problems the toolkit is designed to address, including `H20Nodes`, `Lumens.fi`, `Gateway`, and `Hashrupt`.

These capabilities target recurring setup and integration pain points that teams in this category face when building or operating Canton-based systems, especially where authenticated backend, frontend, and CI flows need to be reproducible across local and shared environments.

More broadly, the project is intended to benefit teams building authenticated Canton applications, standardizing auth-enabled local development, and reducing repeated JWT / OIDC setup friction in build and test workflows.

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- the harness can start a local auth environment and issue working test tokens
- token presets generate the documented claims successfully, including Canton-relevant `party`, `readAs`, `actAs`, and `scope` values
- the documented Canton flow in Milestone 1 can be reproduced from a clean environment
- backend and frontend example integrations work end to end and expose the documented authenticated behavior
- CI fixtures produce the documented artifacts and can be reproduced across clean environments
- diagnostics identify common misconfiguration cases clearly, including issuer, audience, and insufficient Canton rights claims
- documentation and troubleshooting guidance are complete
- the project is released as open source

Project-specific acceptance conditions:

- the project must remain scoped to local auth development and test workflows
- the toolkit must not require hosted infrastructure to use its local mode
- the examples must demonstrate authenticated Canton application flows rather than generic web auth only
- the toolkit must support a deterministic fixture mode suitable for CI in addition to a more realistic local auth mode
- the first funded release must remain limited to one documented embedded reference IdP integration based on `oidc-provider`, rather than a multi-provider compatibility matrix
- the CLI must be documented both as a standalone tool and through its DPM component packaging path

---

## Funding

**Total Funding Request:** 330,000 CC

### Payment Breakdown by Milestone

- Milestone 1 _(First Reproducible Team Adoption)_: 110,000 CC upon committee acceptance  
- Milestone 2 _(Evaluator and Example Adoption)_: 120,000 CC upon committee acceptance  
- Milestone 3 _(Repeatable Multi-Environment Adoption)_: 100,000 CC upon final release and acceptance  

### Funding Rationale

- Milestone 1 funds the first real adoption path: enough product, documentation, and Canton-specific flow coverage for a new team to get from clean checkout to a working authenticated flow.
- Milestone 2 funds adoption beyond the core tool itself: backend and frontend example handoff, evaluator-ready guidance, and the work needed to make the harness understandable and usable by other teams.
- Milestone 3 funds repeatability and confidence for broader reuse: CI fixtures, diagnostics, troubleshooting, release-quality documentation, and hardened packaging that reduce repeated debugging costs across teams.
- No recurring maintenance or hosted-service budget is requested in this proposal; the request is for a one-time open-source tooling release with milestone-based acceptance.

## Team Background

### BitDynamics

BitDynamics brings deep experience building and operating blockchain infrastructure, including Ethereum client infrastructure, validator operations, and production-grade hosting systems supporting validator infrastructure securing more than 2 billion AUD in assets. This background is directly relevant to delivering reliable, auditable, and security-conscious public infrastructure.

In the Canton ecosystem specifically, BitDynamics is not approaching this only as a general infrastructure team. The team is currently building Canton-facing application ( AMM already approved as Featured App) and integration tooling, and this proposal comes out of direct hands-on work with the auth and claims-shaping friction that appears after initial node setup.


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

As the ecosystem grows, this kind of friction matters more, not less. The cost of every team rebuilding local issuer setup, token presets, claims defaults, and auth-debugging logic privately is wasted ecosystem effort. A shared harness makes authenticated development more reproducible, easier to onboard, and less dependent on project-specific tribal knowledge.

---

## Rationale

This proposal is intentionally narrow because narrow proposals are easier to verify, easier to adopt, and less likely to overlap with broader infrastructure efforts.

Why this scope is strong:

1. it solves a practical integration problem that appears across many Canton teams
2. it remains clearly distinct from deployment tools, admin consoles, and wallet proposals
3. it keeps scope realistic by separating deterministic CI fixtures from more realistic local auth flows
4. it now aligns its CLI packaging with existing Digital Asset tooling through a DPM component path rather than introducing only a disconnected standalone binary
5. it is modestly priced and realistically scoped

The result is a proposal that is simple to understand, useful immediately, and aligned with the Development Fund's emphasis on shared developer tooling.
