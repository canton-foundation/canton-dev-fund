## Canton Party Resolution Protocol (CPRP) - Party Identity Resolution

Author: Paolo Domenighetti, CTO, Freename AG

CIP: CIP-XXXX

Status: Draft

Created: 2026-03-02

Contact: paolo@freename.io - gherardo@freename.io

## Abstract

Freename AG proposes to design, specify, and deliver a reference implementation of the Party Name Resolution layer for the Canton Network — the standardized mechanism by which Canton applications resolve human-readable names to Canton Party IDs, discover off-ledger API endpoints, and retrieve self-published party profile information.

This grant delivers the resolution infrastructure defined in CIP-XXXX (Party Name Resolution): the plumbing that takes a name and returns a Party ID with metadata. It introduces a Fully Qualified Party Name (FQPN) addressing format, a generic Resolver Interface for any identity provider, an app-configurable Resolution Strategy, and a Composition Engine that merges results from multiple sources. A companion grant (Party Identity Verification, ~1,298,701 CC) delivers the trust layer that determines whether a resolved identity should be marked as verified.

The resolution layer addresses the three problems identified by the Identity and Metadata Working Group: trustworthy human-readable names (P1), off-ledger API endpoint discovery (P2), and self-published party profiles (P3).

## Specification

### 1. Objective

Canton participants are identified by cryptographic Party IDs — opaque strings unusable for human workflows. CNS 1.0 names (`goldmansachs.unverified.cns`) are first-come-first-serve with no ownership validation. The Identity and Metadata Working Group has identified the need for a multi-resolver resolution layer that navigates from human-readable names across multiple identity sources (DNS, vLEI, CN Credentials, address books) to Canton Party IDs — with configurable resolution strategies per application.

Intended outcome: a standardized, open-source resolution service and SDK that any Canton application can embed to resolve human-readable names to Canton Party IDs, replacing opaque identifiers and `.unverified.cns` names across all user interfaces.

### 2. Implementation

The implementation delivers the following components:

FQPN Addressing: a structured identifier format `<network>/<resolver>:<namespace>:<n>` with mandatory network discrimination (mainnet/testnet/devnet) to prevent cross-environment confusion.

Resolver Interface: a generic API (`resolve`, `reverseResolve`, `resolveMulti`, `changelog`) that any identity provider can implement. Resolver plugins are delivered for DNS (DNSSEC-backed), CN Credentials (Scan API integration), local address books, and a CNS v1 compatibility wrapper for the existing `DsoAnsResolver`.

Resolution Strategy: a per-application JSON configuration defining which resolvers to query, in what order, with what weights, and what collision policy. Three resolution modes: priority (sequential), parallel (simultaneous), and quorum (N-of-M agreement).

Composition Engine: merges results from multiple resolvers using Ledger Effective Time (LET) for same-resolver conflicts and weight-based selection for cross-resolver conflicts. Detects collisions (same name, different Party IDs) and applies strict or permissive handling. Records per-claim provenance (`claim_sources`) for institutional audit trails, tracking which resolver and issuer contributed each metadata value.

Resolution Service: an off-ledger HTTPS + gRPC service exposing `/v1/resolve`, `/v1/resolve/batch`, `/v1/resolve/reverse`, and `/v1/changelog` endpoints. Stateless container alongside existing Canton infrastructure (2 vCPU, 4 GB RAM). No modification to existing SV nodes or Scan.

SDK: client libraries in TypeScript (npm), Java/Kotlin (Maven), and Python (PyPI). Applications integrate via `npm install @cprp/sdk` + a JSON configuration file.

Daml Contracts: `PartyNameRegistration` (binds name to Party ID) and `NameDelegation` (authorizes organizational subnames like `treasury.acme.com`).

Three-Layer Display Model: standardized party rendering — inline badge (L1), hover profile card (L2), full Scan profile page (L3). Profile claims (`cns-2.0/name`, `cns-2.0/avatar`, `cns-2.0/email`, `cns-2.0/website`) are informational only and must not be interpreted as verified identity attributes — verification status is determined exclusively by CIP-YYYY's trust evaluator. Social contact claims use the extensible `cprp/social:<platform>` convention (e.g., `cprp/social:telegram`, `cprp/social:x`, `cprp/social:github`, `cprp/social:discord`).

### 3. Architecture

- Follows the `<resolver>:<namespace>:<n>` addressing pattern proposed by Simon Meier in the Identity and Metadata Working Group
- Implements the "apps decide resolution strategy" principle — no foundation-mandated resolution policy
- Avoids bloating the ACS of the DSO party: resolution queries are off-ledger; only registration is on-ledger (~900 bytes/party)
- Avoids bloating the Scan API surface: additive changelog integration only
- Builds on the CN Credentials Standard Daml interface (Digital Asset) — no new credential format
- Compatible with the PixelPlex Party Profile Credentials CIP: profile claim rendering and social claim keys (`cprp/social:<platform>`) align with PixelPlex's namespace convention
- Enables CIP-56 token admin endpoint discovery via `cprp/endpoint:token-admin` claims

### 4. Backward Compatibility

CPRP is additive with no breaking changes:

- CNS 1.0 names continue unchanged; `cns-v1` resolver plugin wraps `DsoAnsResolver` as a CPRP-compatible resolver
- CN Credentials interface used as-is; new claim keys (`cprp/*`) are additive
- Scan integration is additive (changelog consumption only)
- Adoption is entirely opt-in; non-adopting apps continue using raw Party IDs or CNS 1.0 names
- Parties can upgrade via `cprp-cli upgrade` while retaining CNS 1.0 aliases

## Milestones and Deliverables

### Milestone A1: CIP & Resolution Architecture

- Estimated Delivery: 6 weeks from grant start
- Focus: Standards design, Working Group alignment, CIP submission
- Deliverables / Value Metrics:
  - Draft CIP-XXXX (Party Name Resolution) submitted to `canton-foundation/cips`
  - FQPN specification with network discrimination
  - Resolver Interface definition (JSON schema, error codes)
  - Resolution Strategy schema and composition algorithm (pseudocode)
  - Daml contract templates: `PartyNameRegistration`, `NameDelegation` (draft)
  - Address book integration and collision management specifications
  - Working Group presentation and feedback incorporation
  - Exit criterion: CIP-XXXX accepted to "Proposed" status by the Working Group

### Milestone A2: Resolver Prototype on TestNet

- Estimated Delivery: 14 weeks from A1 completion
- Focus: Working software on TestNet with real resolution queries
- Deliverables / Value Metrics:
  - `cprp-core` package (types, FQPN parser, network discriminator)
  - `cprp-resolver-api` package (plugin interface, error codes, JSON schemas)
  - `cprp-resolver-dns` plugin (DNS resolver with DNSSEC validation)
  - `cprp-resolver-cn-cred` plugin (CN Credential resolver with Scan integration)
  - `cprp-resolver-addressbook` plugin (address book resolver, local DB backend)
  - `cns-v1` compatibility plugin (wraps existing `DsoAnsResolver`)
  - `cprp-composition` module (composition engine, collision detection, LET/weight rules, per-claim provenance)
  - `cprp-cache` module (TTL-based caching, changelog subscription)
  - `cprp-service` — Resolution Service (HTTPS API)
  - `cprp-daml` contracts deployed to TestNet
  - Performance benchmarks (latency, throughput)
  - TestNet deployment with 50+ test parties across 2+ resolver types
  - Exit criterion: WG confirms prototype resolves names on TestNet; <100ms p95 latency

### Milestone A3: Resolution SDK & Ecosystem Adoption

- Estimated Delivery: 10 weeks from A2 completion
- Focus: Developer tooling, documentation, and initial adoption
- Deliverables / Value Metrics:
  - `@cprp/sdk` (TypeScript) published to npm
  - `cprp-sdk` (Python) published to PyPI
  - `com.cprp:cprp-sdk` (Java/Kotlin) published to Maven
  - `cprp-cli` command-line tool (registration, delegation, CNS 1.0 upgrade)
  - Integration guide, migration guide (CNS 1.0 → CPRP), display model guide
  - Reference wallet app demonstrating resolution + address book integration
  - Adoption support: office hours, WG presentations, early adopter onboarding
  - Exit criterion: 2+ Canton ecosystem apps integrated in testnet or staging

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone
- CIP-XXXX accepted to "Proposed" status (A1)
- Live TestNet deployment demonstrating name resolution across 2+ resolver types (A2)
- Performance benchmark report meeting <100ms p95 target (A2)
- Published SDK packages on npm, PyPI, and Maven with documentation (A3)
- Confirmed integration by 2+ ecosystem applications (A3)
- All source code published to public GitHub repositories under Apache 2.0 license
- Working Group presentation at each milestone with feedback incorporation

## Funding

Total Funding Request: 1,623,377 CC (equivalent to ~250,000 USD at today's rate of 1 CC = $0.1540)

### Payment Breakdown by Milestone

- Milestone A1 (CIP & Resolution Architecture): 324,675 CC upon committee acceptance
- Milestone A2 (Resolver Prototype on TestNet): 779,221 CC upon committee acceptance
- Milestone A3 (Resolution SDK & Ecosystem Adoption): 519,481 CC upon final release and acceptance

### Volatility Stipulation

The project duration is approximately 30 weeks (~7 months). The grant is denominated in fixed Canton Coin and will require a re-evaluation at the 6-month mark per CIP-0100 procedures.

## Co-Marketing

Upon release, Freename AG will collaborate with the Canton Foundation on:

- Joint announcement of CPRP resolution layer availability
- Technical blog post: "From .unverified to Verified — How CPRP Transforms Canton Party Identity"
- Developer tutorial and integration walkthrough
- Presentation at Canton ecosystem events and Working Group meetings
- Case study documenting the CNS 1.0 → CPRP migration path

## Motivation

Canton's institutional participants currently interact with opaque cryptographic Party IDs and `.unverified.cns` names that provide no trust signal. This creates friction in every user-facing workflow: counterparty identification, transaction review, settlement instruction exchange, and compliance reporting.

The Identity and Metadata Working Group has identified three concrete gaps: no trustworthy human-readable names (P1), no standard endpoint discovery (P2), and no uniform profile display (P3). Digital Asset is building credential formats; PixelPlex is exploring credential storage. Nobody is building the resolution layer — the mechanism that navigates from a name, across multiple identity sources, to a Party ID. This grant fills that gap.

The resolution layer is independently valuable: even without the verification layer (companion grant), applications get human-readable names, endpoint discovery, profile display, and CNS 1.0 backward compatibility.

## Rationale

Why multi-resolver: a single naming authority fails Canton's institutional reality. Financial institutions operate across jurisdictions with different identity regimes (DNS, vLEI, national regulators, internal directories). The multi-resolver architecture accommodates this diversity without requiring global consensus on a single identity standard.

Why app-driven resolution: centralizing resolution policy would require the Canton Foundation to define a global standard — a governance burden the Working Group explicitly wants to avoid. Pushing decisions to applications keeps the protocol neutral while allowing each app to enforce policies appropriate for its use case.

Why off-ledger: resolution queries are high-frequency, low-latency operations that would bloat the ACS and degrade ledger performance if executed on-chain. The stateless Resolution Service derives all state from on-ledger credentials, providing the same trust guarantees without the performance cost.

Why Freename: Freename AG is an ICANN-accredited registrar operating multi-chain naming infrastructure across Polygon, Solana, Base, and BNB Chain. Multi-resolver composition and cross-registry collision resolution are Freename's core competency. Freename holds patents on secure, structured resolution across naming registries.

Why two grants: resolution and verification are separable concerns. Splitting allows the WG to evaluate each scope independently, enables this grant to deliver value even if the companion is delayed, and avoids artificial coupling of milestones with different technical prerequisites.
