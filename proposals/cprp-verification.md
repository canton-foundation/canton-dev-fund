## Canton Party Resolution Protocol (CPRP) - Party Identity Verification

Author: Paolo Domenighetti, CTO, Freename AG

CIP: CIP-YYYY

Status: Draft

Created: 2026-03-02

Contact: paolo@freename.io - gherardo@freename.io

## Abstract

Freename AG proposes to design, specify, and deliver a reference implementation of the Party Identity Verification layer for the Canton Network — the trust model, issuer classification, verification policies, and cryptographic mechanisms that determine whether a resolved party name qualifies as verified — the condition for removing the `.unverified` prefix.

This grant delivers the verification infrastructure defined in CIP-YYYY (Party Identity Verification): the system that answers the Working Group's central question — "How do we remove the `.unverified` prefix?" It introduces a four-tier trust model (T1–T4), DNS and vLEI verification flows, post-quantum encrypted fields for confidential metadata exchange, cross-chain identity linking, and a Featured Resolver Registry governed by SV vote.

This is the second of two grants implementing the Canton Party Resolution Protocol (CPRP). The companion grant (Party Name Resolution, ~1,623,377 CC) delivers the resolver infrastructure that this grant extends with trust evaluation and verification.

## Specification

### 1. Objective

CIP-XXXX (Party Name Resolution, companion grant) solves the mechanical problem of resolving names to Party IDs. But a resolved name is meaningless without trust: anyone can register `goldmansachs` on a permissionless resolver. The Working Group's central question — "How do we remove the `.unverified` prefix?" — is fundamentally a verification question. Canton will have multiple identity sources (DNS, vLEI, CN Credentials, third-party providers), and applications need a standardized way to evaluate the trustworthiness of resolved identities based on configurable policies.

Intended outcome: a standardized trust evaluation framework and SDK that Canton applications use to determine whether a resolved party identity is VERIFIED, PARTIAL, or UNVERIFIED — enabling the removal of the `.unverified` prefix when identity is confirmed by credible sources.

### 2. Implementation

The implementation delivers the following components:

Trust Tier Classification (T1–T4): every credential issuer is classified by authority source. T1: DSO / SV consensus (highest — SV-verified DNS claims). T2: Regulated identity providers (GLEIF vLEI issuers, national KYC registries). T3: Featured resolvers (SV-approved via governance vote, annual renewal). T4: Self-attestation (party-published profile, endpoints, capabilities). T2 reflects the trust authority of the verification source (GLEIF, SEC), not the intermediary resolver. The publishing resolver must itself be at least T3 to issue T2 credentials.

Verification Policies: application-configurable JSON policies defining minimum trust requirements: minimum resolver count, minimum cumulative weight, required credential types, revocation/collision handling. Each app defines "what does verified mean for me?" Applications that adopt only CIP-XXXX (resolution without verification) may omit the verification policy; all resolved identities will default to UNVERIFIED status.

Trust Evaluation Algorithm: given a composed resolution result from CIP-XXXX, checks on-ledger credential state, classifies issuers, applies the app's policy, returns VERIFIED / PARTIAL / UNVERIFIED / COLLISION / ERROR. PARTIAL is returned when at least one resolver confirms the identity but cumulative weight is below the policy threshold. The evaluator never changes resolution results — it only attaches a trust judgment.

DNS Verification Flow: entity enables DNSSEC + publishes TXT record (`_canton.<domain> TXT "party=<party_id>"`). SV nodes verify the DNSSEC chain and record. DSO publishes a T1 `CnsDnsClaim` credential on-ledger. Re-verification every 7 days.

vLEI Verification Flow: party presents vLEI credential. Resolver queries GLEIF API (`api.gleif.org`) to verify LEI is active, legal name matches, QVI issuer is trusted. Publishes T2 credential. Supports Legal Entity and Official Organizational Role vLEIs. Re-verification every 30 days.

Post-Quantum Encrypted Fields: ML-KEM-768 (Kyber-768, NIST FIPS 203) key encapsulation + AES-256-GCM symmetric encryption + HKDF-SHA256 key derivation. Enables parties to publish recipient-specific confidential metadata (settlement instructions, private endpoints, compliance data) within CN Credentials. Each recipient has an independently encrypted copy; compromise of one key does not affect others.

Cross-Chain Identity: parties can link Canton identity to Ethereum (signature verification → T3), ENS (TXT record → T3), SWIFT (self-attested → T4). Extensible to additional chains.

Featured Resolver Registry: on-ledger `ResolverFeaturedStatus` Daml contract, created by SV governance vote, granting T3 issuer status. Annual renewal required. The Tech & Ops Committee can also designate featured resolvers.

Scan Integration: three-layer display model with verification badges, trust path visualization, and profile pages. Changelog consumer for verification state changes. Profile claims are informational only and must not be interpreted as verified identity attributes — verification status is determined exclusively by the trust evaluator defined in this CIP.

Revocation Semantics: credential expiry (immediate, client-side), issuer revocation (≤60 seconds via changelog), featured status revocation (≤60 seconds), DNS record removal (≤7 days re-verification cycle).

### 3. Architecture

- Answers the WG's central question: "How do we remove the .unverified prefix?"
- Four-tier model maps to Canton's existing governance layers: SV consensus (T1), external regulation (T2), SV-approved participants (T3), permissionless (T4)
- Implements the "apps decide" principle for verification — no foundation-mandated trust standard
- Builds on the CN Credentials Standard Daml interface — all verification data stored as standard credentials
- Profile claims are informational only (aligned with PixelPlex Party Profile Credentials CIP); verification status is determined exclusively by the trust evaluator
- Post-quantum encryption (ML-KEM-768) meets the long-term confidentiality needs of Canton's institutional users holding assets with multi-decade time horizons
- References CIP-XXXX for the resolver interface, FQPN format, and composition engine that this grant extends

### 4. Backward Compatibility

No backward compatibility impact.

- CN Credentials interface used unchanged; new claim keys (`cprp/*`) are additive
- Trust tier classification is a CPRP-internal concept that apps opt into
- Scan verification badges and profile cards are additive UI elements
- Existing out-of-band KYC and bilateral verification workflows continue to work; CPRP provides a standardized alternative, not a replacement

## Milestones and Deliverables

### Milestone B1: CIP & Verification Architecture

- Estimated Delivery: 6 weeks from grant start (can begin in parallel with companion grant's Milestone A2)
- Focus: Standards design, trust model specification, CIP submission
- Deliverables / Value Metrics:
  - Draft CIP-YYYY (Party Identity Verification) submitted to `canton-foundation/cips`
  - Trust tier model specification (T1–T4 classification rules, weight ranges, governance requirements)
  - Verification policy schema (JSON format, reference policies)
  - Credential mapping specification (`cprp/*` claim keys, `cns-2.0/*` profile claims, key registry conventions)
  - Encrypted field cryptographic specification (ML-KEM-768 + AES-256-GCM + HKDF-SHA256)
  - Daml contract templates: `ResolverFeaturedStatus`, `CollisionArbitration` (draft)
  - Working Group presentation and feedback incorporation
  - Exit criterion: CIP-YYYY accepted to "Proposed" status by the Working Group

### Milestone B2: Verification Implementation

- Estimated Delivery: 14 weeks from B1 completion (begins after companion grant's A2 delivers resolver infrastructure)
- Focus: Trust evaluator, verification flows, encrypted fields, Scan integration
- Deliverables / Value Metrics:
  - `cprp-trust` module (trust evaluator, issuer tier classifier, verification policy engine)
  - `cprp-resolver-vlei` plugin (vLEI resolver with GLEIF API client, legal name matching, QVI validation, periodic re-verification)
  - `cprp-crypto` module (ML-KEM-768 KEM, AES-256-GCM, HKDF-SHA256, key management)
  - DNS verification flow (SV consensus integration, `CnsDnsClaim` credential lifecycle)
  - Scan integration (three-layer display with verification badges, changelog consumer)
  - Cross-chain identity claims (Ethereum signature verification, ENS TXT record verification)
  - `ResolverFeaturedStatus` and `CollisionArbitration` Daml contracts deployed to TestNet
  - Network discriminator enforcement (cross-network rejection rules)
  - Explorer demo — Scan showing verified names, trust paths, and profiles
  - Privacy review — query privacy audit, encrypted field security review, threat model documentation
  - Exit criterion: E2E demo where an app resolves a name to a verified party (T1 DNS + T2 vLEI) and executes a Canton transaction using the resolved identity; Scan displays verified name + profile; encrypted field round-trip demonstrated

### Milestone B3: Verification SDK & Ecosystem Adoption

- Estimated Delivery: 8 weeks from B2 completion
- Focus: SDK extensions, documentation, and initial adoption of verification features
- Deliverables / Value Metrics:
  - Verification extensions to all 3 SDKs (TypeScript, Python, Java): trust evaluator API, encrypted field manager API, credential verifier API
  - `cprp-keygen` tool (ML-KEM-768 key pair generation and secure storage)
  - Reference custody app demonstrating resolution + encrypted field exchange between counterparties
  - Architecture guide (component diagram, dependency graph, data flow)
  - Operational playbook for resolver operators (deployment, monitoring, failure modes)
  - Verification-specific integration guide (trust policies, encrypted fields, vLEI setup)
  - Adoption support: office hours, WG presentations, early adopter onboarding
  - Exit criterion: 1+ Canton ecosystem app integrated verification SDK extensions in testnet or staging

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone
- CIP-YYYY accepted to "Proposed" status (B1)
- End-to-end demo: name → verified party → Canton transaction using resolved identity (B2)
- Scan displaying verified names with trust badges for demo parties (B2)
- Encrypted field round-trip demonstrated between two test parties (B2)
- Privacy review report delivered (B2)
- Updated SDK packages published with verification extensions (B3)
- Confirmed integration by 1+ ecosystem application (B3)
- All source code published to public GitHub repositories under Apache 2.0 license
- Working Group presentation at each milestone with feedback incorporation

## Funding

Total Funding Request: 1,298,701 CC (equivalent to ~200,000 USD at today's rate of 1 CC = $0.1540)

### Payment Breakdown by Milestone

- Milestone B1 (CIP & Verification Architecture): 259,740 CC upon committee acceptance
- Milestone B2 (Verification Implementation): 714,286 CC upon committee acceptance
- Milestone B3 (Verification SDK & Ecosystem Adoption): 324,675 CC upon final release and acceptance

### Volatility Stipulation

The project duration is approximately 28 weeks (~6.5 months). The grant is denominated in fixed Canton Coin and will require a re-evaluation at the 6-month mark per CIP-0100 procedures.

## Co-Marketing

Upon release, Freename AG will collaborate with the Canton Foundation on:

- Joint announcement of CPRP verification layer and "verified identity" capability
- Technical blog post: "Removing .unverified — Trust Tiers and Post-Quantum Security on Canton"
- Developer tutorial for verification policy configuration and encrypted field usage
- Live demo at Canton ecosystem events showing the full resolution + verification flow
- Case study documenting institutional identity verification on Canton (DNS + vLEI path)

## Motivation

CIP-XXXX (companion grant) delivers human-readable names, but a resolved name without trust is no better than CNS 1.0's first-come-first-serve model. The Working Group's central question — "How do we remove the `.unverified` prefix?" — requires a verification answer: a standardized way to evaluate issuer credibility, apply per-application trust policies, and display verification status consistently across the ecosystem.

Canton's institutional users additionally need confidential metadata exchange (settlement instructions, private endpoints) that remains secure for decades — requiring post-quantum encryption. And they need cross-chain identity linking as they operate across Canton, Ethereum, and traditional systems simultaneously.

Without this verification layer, CPRP resolution is informational only. With it, Canton applications can display `Goldman Sachs ✓` instead of `goldmansachs.unverified.cns`, backed by cryptographic proof from SV consensus and regulated identity providers.

## Rationale

Why four tiers: maps to Canton's existing governance layers — SV consensus (T1), external regulation (T2), SV-approved participants (T3), and permissionless (T4). Adding more tiers would increase complexity without adding governance clarity.

Why app-driven verification: different applications legitimately have different risk tolerances. A block explorer might accept any name; a settlement system requires vLEI + DNS verification. Centralizing trust policy would require the Foundation to define a global standard — a governance burden the WG explicitly wants to avoid.

Why post-quantum encryption: Canton's institutional users hold assets with multi-decade time horizons (30-year Treasury securities, long-dated derivatives). ML-KEM-768 provides NIST-standardized post-quantum security for encrypted metadata that may remain sensitive for the full asset lifecycle.

Why separate from resolution: resolution and verification are independently useful and independently evolvable. An explorer resolves without verifying. A compliance tool verifies without resolving (receives a Party ID directly). Coupling them would force unnecessary dependencies.

Why Freename: ICANN-accredited registrar with patented collision resolution technology across identity registries, multi-chain naming infrastructure, and operational experience with cross-registry dispute arbitration — all directly applicable to Canton's multi-resolver trust model.
