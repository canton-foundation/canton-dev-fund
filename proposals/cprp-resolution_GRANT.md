## Canton Party Name Resolution Standard - Reference Implementation

Author: Paolo Domenighetti, CTO, Freename AG

CIP: CIP-XXXX (canton-foundation/cips PR #171)

Status: Draft

Created: 2026-05-12

Updated: 2026-09-17

Contact: paolo@freename.io - gherardo@freename.io

## Abstract

Freename AG proposes to deliver the reference implementation of the Canton Party Name Resolution Standard (PR #171) — the standardized mechanism by which Canton applications resolve human-readable names to Canton Party IDs and render them consistently across UIs.

The standard defines four things: how names are represented (the Fully Qualified Party Name format), how they are resolved (a minimal OpenAPI resolver interface plus the resolution and preferred-name algorithms), how they are rendered (ASCII and GUI conventions), and how additional naming systems integrate. This grant delivers the working software behind that standard: a resolution service implementing the OpenAPI interface, the built-in party-id resolver, a CNS 1.0 compatibility wrapper, the preferred-name round-trip verification, client SDKs, and rendering components.

The design phase (Milestone A1) has already been delivered to the Canton Foundation as PR #171 — through two full review cycles with Digital Asset — and is contributed to the ecosystem at no cost. This grant requests funding only for the implementation (A2) and adoption (A3) phases, leveraging Freename's existing multi-resolver naming infrastructure and internal team to deliver the reference implementation at substantially reduced cost relative to a greenfield effort.

A companion CIP, Canton Imported Names (PR #249), specifies how names from external naming systems such as DNS are imported into Canton; its implementation is outside the scope of this grant.

## Specification

### 1. Objective

Canton participants are identified by cryptographic Party IDs — opaque strings unusable for human workflows other than copy-and-pasting. CNS 1.0 names (`goldmansachs.unverified.cns`) are first-come-first-serve with no ownership validation. The Identity and Metadata Working Group direction, converged over the May–August 2026 meetings, standardizes a uniform naming approach across the many naming systems used by Canton organizations — native (CNS) or external (DNS, LEI, ENS).

Intended outcome: a standardized, open-source resolution service and SDK that any Canton application can embed to resolve human-readable names to Canton Party IDs and render them uniformly, replacing opaque identifiers across user interfaces.

### 2. Implementation Mechanics

The implementation delivers the following components, tracking the CIP exactly:

FQPN Handling: parsing, validation, and construction of Fully Qualified Party Names in the standard's three-part format `<network>:<resolver>:<name>` (networks: mainnet, testnet, devnet, localnet; free-form printable-ASCII name interpreted per resolver).

Resolution Service: an implementation of the standard's OpenAPI 3.0 resolver interface (`/v0/resolve`, `/v0/reverse-resolve`), stateless, deriving all state from on-ledger CN Credentials. Deployment, scaling, caching, and authentication remain implementation concerns and are documented, not standardized.

Built-in Resolvers: the `party-id` resolver defined by the CIP (every Canton party always has at least one FQPN), and a `cns-v1` compatibility resolver wrapping the existing `DsoAnsResolver` so CNS 1.0 names resolve unchanged.

Credential-Backed Resolution: resolution of any naming system that materializes registrations as CN Credentials (per the CIP's integration guidelines), including expiry handling — results past `valid_until` are re-resolved, never served as current.

Preferred-Name Resolution: the CIP's reverse-direction algorithm, including the round-trip verification that prevents display-name spoofing via false preference claims, and the configured-preference fallback.

Rendering Components: UI components implementing the standard's GUI rendering convention (`<icon> <display-name>`), the ASCII rendering, the fallback chain, and the token-standard asset display convention (`<symbol> by <admin-rendered-name>`).

SDK: client libraries in TypeScript (npm), Java/Kotlin (Maven), and Python (PyPI). Applications integrate via `npm install @cprp/sdk` plus an ordered resolver configuration with optional ignore rules, as specified by the CIP.

### 3. Architectural Alignment

- Implements the Canton Party Name Resolution Standard (PR #171) as written, through two full Digital Asset review cycles
- Follows the "apps decide resolution order" principle — an ordered resolver list with ignore rules, no foundation-mandated resolution policy
- Avoids bloating the ACS of the DSO party: resolution queries are off-ledger; only registration credentials are on-ledger
- Builds on the CN Credentials Standard (PR #204) — all resolution data derives from standard credentials, no custom Daml templates
- Compatible with the Party Profile Credentials CIP (PixelPlex, PR #169) for self-published party metadata used in rendering
- Complementary to the Canton Imported Names CIP (PR #249) and the `.canton` CIP (Axymos, PR #209): this grant delivers the resolution layer they plug into

### 4. Backward Compatibility

Additive, with no breaking changes:

- CNS 1.0 names continue unchanged; the `cns-v1` resolver wraps `DsoAnsResolver` as a standard-compatible resolver
- CN Credentials interface used as-is; claim keys are additive (`cprp/` working prefix, renamed `cip-<nr>/` on number assignment)
- Adoption is entirely opt-in; non-adopting apps continue using raw Party IDs or CNS 1.0 names

## Milestones and Deliverables

### Milestone A1: CIP & Standards Design (Completed — Donated)

- Status: Delivered to `canton-foundation/cips` as PR #171; matured through two full review cycles with Digital Asset (Simon Meier) — the initial 23-comment round and the August 2026 scope-convergence round — plus Working Group alignment across the May–August 2026 meetings
- Focus: Standards design, Working Group alignment, CIP authorship and iteration
- Funding: 0 CC — contributed to the Canton ecosystem at no cost (approximately $50,000 in design and specification work)
- Delivered artifacts:
  - The Canton Party Name Resolution Standard (PR #171): FQPN representation, OpenAPI resolver interface, resolution and preferred-name algorithms, ASCII/GUI rendering conventions, naming-system integration guidelines
  - The Canton Imported Names CIP (PR #249), split out as its own proposal per review feedback
  - Working Group presentations and feedback incorporation across both review cycles
  - Exit criterion: CIP advancement to "Proposed" status by the Working Group (pending)

### Milestone A2: Resolution Service on TestNet

- Estimated Delivery: 12 weeks from grant start
- Focus: Working software on TestNet with real resolution queries
- Deliverables / Value Metrics:
  - `cprp-core` package (types, FQPN parser and validator, network discrimination)
  - `cprp-service` — Resolution Service implementing the standard's OpenAPI interface (`/v0/resolve`, `/v0/reverse-resolve`)
  - `party-id` built-in resolver and `cns-v1` compatibility resolver
  - Credential-backed resolution for naming systems publishing CN Credentials, with `valid_until` expiry handling
  - Preferred-name resolution with round-trip verification
  - Caching layer with documented staleness bounds (implementation concern, per the standard)
  - TestNet deployment with 50+ test parties across 2+ resolver types
  - Performance benchmarks (latency, throughput)
  - Exit criterion: WG confirms name resolution on TestNet via the standard OpenAPI interface; <100ms p95 latency

### Milestone A3: SDK, Rendering & Ecosystem Adoption

- Estimated Delivery: 10 weeks from A2 completion
- Focus: Developer tooling, rendering components, documentation, and initial adoption
- Deliverables / Value Metrics:
  - `@cprp/sdk` (TypeScript) published to npm
  - `cprp-sdk` (Python) published to PyPI
  - `com.cprp:cprp-sdk` (Java/Kotlin) published to Maven
  - Rendering component library implementing the GUI convention, fallback chain, and asset display convention
  - `cprp-cli` command-line tool (resolution, reverse resolution, preferred-name management)
  - Integration guide and rendering guide
  - Reference wallet app demonstrating resolution and rendering end to end
  - Adoption support: office hours, WG presentations, early adopter onboarding
  - Exit criterion: 2+ Canton ecosystem apps integrated in testnet or staging

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each funded milestone (A2, A3)
- Live TestNet deployment resolving names across 2+ resolver types via the standard OpenAPI interface (A2)
- Performance benchmark report meeting <100ms p95 target (A2)
- Published SDK packages on npm, PyPI, and Maven with documentation (A3)
- Confirmed integration by 2+ ecosystem applications (A3)
- All source code published to public GitHub repositories under Apache 2.0 license
- Working Group presentation at each milestone with feedback incorporation

Milestone A1 deliverables have already been submitted (PR #171, PR #249) and are under WG review. Acceptance of the Resolution Standard CIP to "Proposed" status is treated as a precondition to A2 work commencing, not as a payable milestone of this grant.

## Funding

Total Funding Request: 844,156 CC (equivalent to ~130,000 USD at 1 CC = $0.1540; CC amounts to be re-confirmed at the prevailing rate on submission per CIP-0100 procedures)

### Funding Rationale

The original proposal targeted ~$250,000 in grant funding. The revised request of ~$130,000 reflects three concrete reductions:

- Milestone A1 (design phase, approximately $50,000 in work) has already been completed and delivered as PR #171 and PR #249, through two full review cycles. Freename is donating this work to the Canton ecosystem at no cost, regardless of grant outcome.
- Milestone A2 (implementation) benefits from substantial reuse of Freename's existing multi-resolver naming infrastructure — DNS-anchored resolver primitives, cross-registry resolution components — adapted for Canton rather than built from scratch.
- Implementation will be carried out by Freename's existing internal team, eliminating hiring, onboarding, and ramp-up costs that a comparable greenfield grant would incur.

The remaining funding covers the actual implementation cost of A2 and A3 with a modest operating margin sufficient to absorb scope changes identified during Working Group iteration.

### Payment Breakdown by Milestone

- Milestone A1 (CIP & Standards Design): 0 CC — donated, delivered as PR #171 and PR #249
- Milestone A2 (Resolution Service on TestNet): 519,481 CC upon committee acceptance (~$80,000)
- Milestone A3 (SDK, Rendering & Ecosystem Adoption): 324,675 CC upon final release and acceptance (~$50,000)

### Volatility Stipulation

The funded portion of the project (A2 + A3) covers approximately 22 weeks (~5 months) of work from grant start. The grant is denominated in fixed Canton Coin and will require a re-evaluation at the 6-month mark per CIP-0100 procedures.

## Co-Marketing

Upon release, Freename AG will collaborate with the Canton Foundation on:

- Joint announcement of the Canton Party Name Resolution Standard reference implementation
- Technical blog post on human-readable naming across Canton's naming systems
- Developer tutorial and integration walkthrough
- Presentation at Canton ecosystem events and Working Group meetings

## Motivation

Canton's institutional participants currently interact with opaque cryptographic Party IDs and `.unverified.cns` names. This creates friction in every user-facing workflow: counterparty identification, transaction review, settlement instruction exchange, and compliance reporting.

The Working Group has converged on a family of small, focused CIPs: Digital Asset owns the credential standard and the CNS 2.0 registry; PixelPlex owns party profiles; Axymos owns `.canton`; Freename authors the resolution standard and the imported-names blueprint. The resolution standard is the layer every other piece plugs into — and a standard without a reference implementation does not get adopted. This grant delivers that implementation.

## Rationale

Why a reference implementation: the standard deliberately specifies only representation, resolution, rendering, and integration, leaving implementation free. A high-quality open-source reference implementation is what turns that freedom into adoption: applications embed the SDK instead of each re-implementing the OpenAPI interface, the algorithms, and the rendering conventions from scratch.

Why app-driven resolution: centralizing resolution policy would require the Canton Foundation to define a global standard — a governance burden the Working Group explicitly avoids. The ordered resolver list with ignore rules keeps the protocol neutral while allowing each app to enforce policies appropriate for its use case.

Why off-ledger: resolution queries are high-frequency, low-latency operations that would bloat the ACS if executed on-chain. The stateless Resolution Service derives all state from on-ledger credentials, providing the same trust guarantees without the performance cost.

Why Freename: Freename AG is an ICANN-accredited registrar operating multi-chain naming infrastructure across Polygon, Solana, Base, and BNB Chain. Cross-registry name resolution is Freename's core competency, and Freename holds patents on secure, structured resolution across naming registries. This existing infrastructure is precisely what makes the reduced grant ask feasible: A2 adapts proven components rather than building from scratch.

Why the design phase is donated: completing the Resolution Standard and the Imported Names CIP ahead of any funding decision — through two full review cycles with Digital Asset — signals Freename's commitment to the Canton ecosystem irrespective of grant outcome. The funded portion of this grant covers the work that has not yet been done.
