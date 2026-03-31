## Development Fund Proposal: Canton Party Namespace Registry (CPNR) — Privacy-Aware Cross-Synchronizer Party Discovery

**Author:** blackthornlover <h@bitdynamics.me>, Zhe Li <zhe@bitdynamics.me>, Srikanth <srikanth@bitdynamics.me>
**Implementing Entity:** Bitdynamics
**Status:** Submitted
**Created:** 2026-03-31

---

## Abstract

This proposal requests funding for an open-source Canton Party Namespace Registry (CPNR): a community specification and reference implementation that defines a privacy-aware, decentralized registry for Canton party identifiers, enabling parties to be discovered and resolved across synchronizers without off-ledger coordination and without compromising Canton's privacy model.

Every institution or developer building a multi-party Canton application today faces the same discovery problem from scratch: there is no shared, on-ledger mechanism to find and resolve other parties across synchronizer boundaries. Teams work around this by exchanging party identifiers out of band — through emails, spreadsheets, or proprietary onboarding APIs — reintroducing off-ledger trust assumptions that Canton was designed to eliminate.

The proposed project, **Canton Party Namespace Registry (CPNR)**, will provide:

- a versioned open specification for a Canton-native party namespace: human-readable names mapped to Canton party identifiers, with selective disclosure controls
- a reference Daml registry contract model supporting registration, resolution, and revocation
- a TypeScript resolution toolkit for on-ledger and off-ledger party lookup flows
- an operator integration guide targeting multi-synchronizer deployments in regulated environments

The goal is not to build a hosted naming service, not to create a permissionless public directory, not to replace Canton's internal party management, and not to mandate a single registry topology. The goal is to give the Canton ecosystem a shared, open, versioned party discovery standard that reduces off-ledger coordination, makes cross-party workflows initiatable from on-ledger state, and provides a foundation for institutional party identity management.

---

## Specification

### 1. Objective

The objective is to reduce the off-ledger coordination cost of Canton multi-party application development by publishing a concrete, versioned specification and reference implementation for party namespace management that teams can adopt without building their own discovery layer from scratch.

The intended outcome is that a Canton operator or application developer can:

- register a human-readable name for a Canton party identifier on a shared, on-ledger registry under a configurable disclosure policy
- resolve another party's Canton identifier from their registered name without requiring an off-ledger API call or pre-shared spreadsheet
- control who can look up their registration and how much information is disclosed to each viewer, preserving Canton's privacy model
- integrate a Canton application with the registry so that workflows can be initiated from a name rather than requiring the initiator to already know the counterparty's full Canton party identifier
- operate the registry in a multi-synchronizer context, where parties registered on one synchronizer can be resolved by applications running on another

This proposal is explicitly framed as **ecosystem infrastructure** and a **shared open standard**, not a hosted naming service, not a permissionless public directory, not a protocol change, and not a KYC or AML compliance tool.

### 2. Implementation Mechanics

The project will be delivered as:

- a versioned CPNR specification document covering namespace structure, registration policies, resolution semantics, and revocation behavior
- a reference Daml registry contract model implementing the specification
- a TypeScript resolution toolkit supporting on-ledger lookup and off-ledger resolution flows
- an operator integration guide covering deployment, configuration, and multi-synchronizer usage

#### A. Scope Selection Guide

The registry is designed to occupy a well-defined layer in the Canton application stack and to avoid overlapping with adjacent concerns.

Use **Canton's existing party management APIs** (already provided by Canton participant nodes) for the low-level creation and management of party identifiers. CPNR does not replace these. It adds a human-readable naming and discovery layer on top of them.

Use **CPNR** when:

- a Canton application needs to initiate a workflow with a counterparty identified by a human-readable name or institutional identifier rather than a raw Canton party ID
- a Canton operator needs to publish their party identity to a shared registry with selective disclosure controls
- a multi-synchronizer workflow needs to resolve a counterparty's party identifier from a name without going off-ledger
- an institutional deployment needs to map Canton party identifiers to external identifiers (LEI, BIC, or similar) in a verifiable, on-ledger way

This proposal therefore does **not** present CPNR as a replacement for Canton's party management, a KYC solution, a permissionless public directory, or a universal cross-chain identity standard.

#### B. Namespace Structure

The reference specification will define an explicit namespace structure so that registered names are globally unambiguous across Canton deployments. Names will follow a hierarchical structure:

```
<registry-id>/<namespace>/<local-name>
```

where `<registry-id>` identifies the canonical registry deployment, `<namespace>` is an operator- or institution-controlled scope, and `<local-name>` is the human-readable identifier within that namespace.

Standard fields for a registry entry will include, at minimum:

- `partyId` — the canonical Canton party identifier
- `displayName` — human-readable name within the namespace
- `namespaceOwner` — the party that controls the namespace
- `registrationTime` — ledger time of registration
- `externalIdentifier` — optional mapping to an external institutional identifier (LEI, BIC, DID, or similar)
- `disclosurePolicy` — controls which parties can resolve this entry and what fields are visible to each viewer
- `registryVersion` — CPNR specification version the entry conforms to

#### C. Daml Registry Contract Model

The reference implementation will define four Daml primitives:

**`NamespaceRoot`** — the top-level namespace ownership contract. A namespace owner holds one `NamespaceRoot` per namespace scope. Only the namespace owner can register entries under their namespace. The `NamespaceRoot` records the namespace policy: whether registrations are open (any party can request), curated (namespace owner approves each entry), or closed (namespace owner registers on behalf of others).

**`PartyRegistration`** — the per-party registry entry. Records the party identifier, display name, external identifier fields, and disclosure policy. The disclosure policy determines which parties can observe this contract and which fields are visible to each observer tier. Supports amendment and revocation by the namespace owner or the registered party.

**`ResolutionRequest`** — a lightweight on-ledger lookup primitive. A party that wants to resolve a name creates a `ResolutionRequest` referencing the target name. The registry automation responds with a `ResolutionResponse` containing the fields the requester is authorized to see under the entry's disclosure policy.

**`RegistryIndex`** — a namespace-scoped index contract maintained by the namespace owner that maps display names to `PartyRegistration` contract IDs. Enables efficient lookup without requiring a requester to iterate all registrations in a namespace.

#### D. TypeScript Resolution Toolkit

The resolution toolkit will provide:

- a client library for submitting `ResolutionRequest` contracts and reading `ResolutionResponse` results
- a local cache layer for resolved entries, with configurable TTL and staleness handling
- integration helpers for Canton Ledger API applications that need to resolve party names at workflow initiation time
- reference integration showing how a Canton application replaces an off-ledger party lookup API call with an on-ledger CPNR resolution flow

#### E. Disclosure Policy Model

The disclosure policy model is the core privacy-preserving mechanism that differentiates CPNR from a naïve public directory. Each `PartyRegistration` entry defines one of three disclosure tiers:

**Public** — the display name and Canton party identifier are visible to any party that submits a valid `ResolutionRequest`. No external identifier fields are disclosed to unauthenticated requesters.

**Permissioned** — the namespace owner maintains an allowlist of parties authorized to resolve this entry. Unauthorized requesters receive a confirmation that the name exists but no further details.

**Private** — only parties explicitly listed in the entry's disclosure policy can resolve it. The entry is not visible in namespace indexes available to unauthenticated requesters.

The disclosure policy is enforced in the Daml model, not in the resolution toolkit, so it cannot be bypassed by a misbehaving automation layer.

#### F. Multi-Synchronizer Resolution

For multi-synchronizer deployments, the reference implementation will document and implement:

- a canonical registry deployment pattern where the `NamespaceRoot` and `PartyRegistration` contracts live on a designated home synchronizer
- a cross-synchronizer resolution pattern using Canton-native contract reassignment to bring a `ResolutionRequest` to the home synchronizer and return the `ResolutionResponse` to the requesting synchronizer
- compatibility notes for deployments where the requester and the registry are on different synchronizers without a direct reassignment path

#### G. Explicitly Out of Scope

To keep the project feasible and non-overlapping, the following are explicitly out of scope:

- changes to Canton's internal party management or participant node APIs
- a hosted naming service or centralized registry operator
- KYC, AML, or legal identity verification
- permissionless public registration without namespace owner authorization
- cross-chain identity resolution beyond Canton synchronizers
- frontend directory UIs or search interfaces
- enforcement of external identifier accuracy (the registry records what parties declare, not what has been verified)
- governance of the canonical registry namespace beyond a reference deployment

### 3. Architectural Alignment

This proposal aligns with Canton's network-of-networks philosophy because party discoverability is a precondition for Canton's multi-party workflows to be initiated from on-ledger state rather than off-ledger coordination. It is aligned with Development Fund priorities because it delivers:

- shared infrastructure that reduces duplicated off-ledger coordination work across every Canton multi-party application
- a public-good specification that makes party identity portable and transferable across synchronizer boundaries
- a concrete reference implementation that other proposals can build on — multi-party workflows (CMWC), cross-domain messaging (CCDM), and DeFi applications (CLMM) all require party discovery as a prerequisite
- lower barriers to entry for new Canton application developers who currently have no on-ledger alternative to off-ledger party identifier exchange

This is ecosystem infrastructure, not a private naming product.

### 4. Delivery Readiness

The initial specification scope is bounded by deliberate choices. The reference implementation is restricted to:

- three namespace tiers (public, permissioned, private)
- four Daml primitives covering the full registration, resolution, and revocation lifecycle
- one canonical multi-synchronizer resolution pattern
- a single Canton version range (current stable and one prior) for compatibility

This keeps the first deliverable reviewable and makes the early milestones easy to verify against observable outputs.

### 5. Delivery Feasibility

This proposal is intentionally narrow enough to be built and verified:

- one versioned specification document covering namespace structure, registration policies, resolution semantics, and disclosure tiers
- one reference Daml registry contract model with four primitives
- one TypeScript resolution toolkit with on-ledger and off-ledger resolution flows
- one multi-synchronizer resolution pattern with compatibility documentation
- one operator integration guide

The implementation is technically meaningful but bounded. It does not attempt to solve all Canton identity concerns, cover every possible deployment topology, or produce an enterprise-grade identity platform.

### 6. Risks and Mitigations

- **Namespace squatting:** the namespace model requires ownership of a `NamespaceRoot` before registrations can be made under a namespace. This prevents arbitrary parties from registering names in a namespace they do not own. Governance of the canonical top-level namespace is documented but out of scope for this proposal.
- **Disclosure policy bypass by automation:** disclosure policy enforcement is implemented in the Daml model, not in the resolution toolkit, so it cannot be bypassed by a misbehaving client.
- **Multi-synchronizer resolution latency:** the cross-synchronizer resolution pattern introduces additional reassignment round-trips. The specification will document expected latency characteristics and recommend caching strategies for latency-sensitive applications.
- **External identifier accuracy:** the registry records what parties declare, not what has been externally verified. The specification will clearly state that CPNR is not a KYC tool and that applications requiring verified identity must layer a separate attestation mechanism on top.
- **Scope creep into a hosted service:** the reference implementation is a deployable contract model and toolkit, not a hosted service. Governance, hosting, and canonical namespace management are explicitly deferred.
- **Backward compatibility of registered entries:** the specification will be versioned from day one. Breaking changes to the registry schema will be managed through a documented migration path rather than silent incompatibility.

### 7. Backward Compatibility

No backward compatibility impact on Canton itself. This project is entirely additive. The specification and reference Daml contracts introduce no changes to Canton protocol behavior, core Canton data structures, or existing Canton node configuration. Operators who adopt the registry alongside an existing off-ledger party discovery setup can run both in parallel during migration.

---

## Milestones and Deliverables

### Milestone 1: Specification Published and First Namespace Validated

- **Estimated Delivery:** 4 weeks
- **Adoption Goal:** At least one Canton operator or application team has reviewed the CPNR specification, provided written feedback incorporated into the final document, and confirmed that the namespace structure and disclosure policy model are applicable to their party discovery requirement without requiring off-ledger workarounds.
- **Deliverables / Adoption Criteria:**
  - a versioned CPNR specification document covering namespace structure, registration policies, resolution semantics, disclosure tiers, and revocation behavior
  - a compatibility matrix documenting which CPNR features apply to each targeted Canton version
  - a contribution guide and amendment process that at least one external reviewer has used to submit a comment or improvement
  - written confirmation from at least one Canton operator or application team that the specification is legible and maps cleanly to their party discovery requirement without requiring proprietary translation

### Milestone 2: Daml Registry Contracts Deployed and Validated in a Live Environment

- **Estimated Delivery:** 5 weeks
- **Adoption Goal:** At least one Canton operator or application team has deployed the reference Daml registry contracts against a real (non-sandbox) Canton participant node, registered at least one party entry, and confirmed that the disclosure policy model correctly controls resolution access in their environment.
- **Deliverables / Adoption Criteria:**
  - reference Daml contracts for `NamespaceRoot`, `PartyRegistration`, `ResolutionRequest`, and `RegistryIndex` deployed and confirmed working against a live Canton participant node by at least one external team
  - Daml Script scenarios for registration, resolution, amendment, revocation, and disclosure policy enforcement, confirmed correct by at least one reviewer
  - at least one operator-confirmed deployment demonstrating that the three disclosure tiers (public, permissioned, private) correctly control resolution access in a non-sandbox environment
  - written confirmation from at least one Canton team that the Daml contract model is legible and correctly models their party identity requirements

### Milestone 3: TypeScript Resolution Toolkit Adopted by at Least One Application

- **Estimated Delivery:** 4 weeks
- **Adoption Goal:** At least one Canton application team has integrated the TypeScript resolution toolkit into their application, replaced an off-ledger party lookup with an on-ledger CPNR resolution flow, and confirmed that the integration reduces their off-ledger coordination requirement.
- **Deliverables / Adoption Criteria:**
  - TypeScript resolution toolkit with on-ledger `ResolutionRequest` flow, local cache layer, and Ledger API integration helpers, adopted by at least one external Canton application developer
  - at least one application integration confirmed by an external team that has replaced an off-ledger party lookup with the CPNR resolution flow
  - operator integration guide reviewed and confirmed complete by at least one developer who has followed it end to end without prior knowledge of the implementation
  - written confirmation from at least one Canton application team that the resolution toolkit reduces their off-ledger coordination requirement in a real workflow

### Milestone 4: Multi-Synchronizer Resolution Validated and Standard Publicly Released

- **Estimated Delivery:** 3 weeks
- **Adoption Goal:** At least three independent Canton operator or application teams have adopted some portion of CPNR — specification, registry contracts, or resolution toolkit — and the project has been publicly released with documented adoption evidence, so that future teams can start from a validated baseline rather than building off-ledger discovery from scratch.
- **Deliverables / Adoption Criteria:**
  - multi-synchronizer resolution pattern confirmed working by at least one operator who has run a cross-synchronizer `ResolutionRequest` flow end to end
  - at least three independent adoption confirmations documented in the public repository (operator testimonials, linked deployments, or recorded integration walkthroughs)
  - the full CPNR stack — specification, Daml contracts, TypeScript toolkit, and operator guide — released as open source under a permissive license
  - a recorded end-to-end walkthrough demonstrating CPNR deployed in a multi-party Canton environment, from namespace registration through cross-synchronizer resolution, usable as an onboarding reference for future Canton application builders
  - at least one community contribution (issue, amendment, or extension) submitted and addressed through the published contribution process

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- a versioned CPNR specification document covering namespace structure, registration policies, resolution semantics, disclosure tiers, and revocation behavior
- reference Daml contracts implementing the full registration, resolution, and revocation lifecycle, validated by at least one operator against a live Canton node
- Daml Script scenarios proving correct behavior for all three disclosure tiers under registration, resolution, amendment, and revocation
- a TypeScript resolution toolkit confirmed working in at least one non-sandbox application integration
- an operator integration guide covering deployment, configuration, and multi-synchronizer usage
- multi-synchronizer resolution pattern confirmed working end to end
- at least three independent adoption confirmations documented in the public repository
- the full project released as open source

Project-specific acceptance conditions:

- the specification must be versioned and include a documented process for community amendments
- the Daml disclosure policy enforcement must be in the contract model, not delegated to the resolution toolkit
- the documentation must clearly state that CPNR is not a KYC tool and does not verify the accuracy of external identifier mappings
- the namespace model must require `NamespaceRoot` ownership before registrations can be made, preventing namespace squatting
- the documentation must clearly state that CPNR is additive and does not require changes to Canton core party management

---

## Funding

**Total Funding Request:** 1,400,000 CC

### Payment Breakdown by Milestone

- Milestone 1 _(Specification Published and First Namespace Validated)_: 300,000 CC upon committee acceptance
- Milestone 2 _(Daml Registry Contracts Deployed and Validated in a Live Environment)_: 500,000 CC upon committee acceptance
- Milestone 3 _(TypeScript Resolution Toolkit Adopted by at Least One Application)_: 400,000 CC upon committee acceptance
- Milestone 4 _(Multi-Synchronizer Resolution Validated and Standard Publicly Released)_: 200,000 CC upon final release and acceptance

### Funding Rationale

- Milestone 1 is smaller because it produces a specification document and a first adopter validation rather than running software, but it is the most critical dependency: every subsequent artifact is only as good as the namespace and disclosure model it implements.
- Milestone 2 is the largest because the Daml contract model must correctly enforce three disclosure tiers across registration, resolution, amendment, and revocation — and must be validated by a real operator against a live Canton node rather than a sandbox.
- Milestone 3 is substantial because replacing an off-ledger party lookup with an on-ledger resolution flow requires genuine application-layer integration work and operator adoption effort to validate correctly.
- Milestone 4 is smaller because it packages and documents the now-proven, operator-validated stack for the broader community rather than introducing a new technical layer.
- No hosted-service budget is requested in this proposal.

### Volatility Stipulation

If the project duration extends beyond 6 months due to Committee-requested scope changes, remaining milestones should be renegotiated for material CC/USD volatility. No hosted naming service budget is requested in this proposal. If a later stage justifies a broader specification covering governance of the canonical top-level namespace, a follow-on proposal can extend the CPNR model under the same versioning framework.

---

## Maintenance and Evolution

The initial grant funds the specification, reference Daml contracts, TypeScript resolution toolkit, and public release. After release, the project will be maintained in the open through repository-based contribution workflows, issue tracking, and versioned releases.

The CPNR specification is designed to be versioned from day one so that breaking changes to the namespace structure or disclosure model can be managed through a documented deprecation cycle rather than silent incompatibility.

The intended long-term path is to keep the specification aligned with Canton's evolving party management APIs and multi-synchronizer capabilities as Canton matures. If appropriate, the specification may be adopted as a Foundation-endorsed standard and the reference contracts may be upstreamed into a broader ecosystem tooling repository. If that path is not immediately appropriate, the project will remain in a public standalone repository with versioned releases, contribution guidelines, and clear Canton version compatibility documentation so that external teams and operators can adopt and extend it with minimal friction.

### High-Level Architecture

CPNR is designed as a narrow standard with three layers:

- a versioned specification layer defining namespace structure, registration policies, resolution semantics, and disclosure tiers
- a reference implementation layer consisting of the Daml registry contracts and the TypeScript resolution toolkit
- an operator documentation layer covering deployment, integration, and multi-synchronizer usage for all shipped artifacts

At a high level, a Canton operator deploys the reference Daml contracts alongside their Canton participant node. A namespace owner creates a `NamespaceRoot` and registers `PartyRegistration` entries for their parties under configurable disclosure policies. Applications that need to initiate workflows with a counterparty submit a `ResolutionRequest` on-ledger and receive a `ResolutionResponse` containing the fields they are authorized to see. The TypeScript resolution toolkit automates this flow and provides a local cache layer for latency-sensitive applications.

The initial release covers single-synchronizer and two-synchronizer deployment patterns.

## Co-Marketing

Upon release, the implementing entity will collaborate with the Foundation on:

- announcement coordination
- a short technical write-up explaining the CPNR namespace model, the disclosure policy design, and the correct extension process for community contributors
- one operator-facing walkthrough or demo

Specific commitments:

- publish integration guidance for Canton application teams that want to replace off-ledger party discovery with CPNR
- publish at least one end-to-end example showing a Canton multi-party workflow initiated from a CPNR name resolution rather than a pre-shared party identifier

---

## Motivation

Canton's value proposition depends on parties being able to coordinate directly on-ledger without requiring trusted central intermediaries. But coordination requires discoverability: before two parties can transact on Canton, they need to know each other's Canton party identifiers. Today, that discovery happens off-ledger — through emails, onboarding portals, spreadsheets, or proprietary APIs — reintroducing the off-ledger trust assumptions and coordination costs that Canton was designed to eliminate.

A party namespace registry would give the Canton ecosystem:

- a common on-ledger mechanism for party discovery that eliminates the need for off-ledger identifier exchange in multi-party workflow initiation
- a privacy-aware disclosure model that preserves Canton's privacy guarantees rather than publishing party identifiers to a fully public directory
- a foundation for institutional party identity management that can map Canton identifiers to external institutional identifiers (LEI, BIC) in a verifiable, on-ledger way
- lower barriers to entry for new Canton application developers who currently have no on-ledger alternative to manual party identifier exchange

This makes CPNR a strong candidate for Development Fund support because it is ecosystem infrastructure with compounding returns: every Canton application that adopts the registry reduces the off-ledger coordination cost of every future workflow it initiates.

---

## Rationale

This proposal is intentionally scoped as a specification and reference implementation rather than a hosted naming service or a Canton core identity effort. That discipline matters for three reasons:

- if Canton's internal party management APIs evolve, the specification and contract model absorb the translation rather than requiring all adopters to update their applications simultaneously
- if institutions need to extend the namespace model for proprietary deployment-specific identity requirements, the versioned namespace and contribution process allow that without fragmenting the canonical core
- if the Foundation later decides to adopt CPNR as an endorsed standard, the versioned, open-source, reference-implementation-first approach makes that adoption path straightforward

The project is therefore designed to give Canton operators and application builders a shared party discovery foundation without claiming to solve every identity concern, cover every possible deployment topology, or produce a production-grade commercial naming product in one proposal.
