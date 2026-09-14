# Koschei Sentinel: Canton Security Assurance & Incident Readiness Toolkit

**Applicant:** Individual / Koschei  
**Primary Contact:** Onur Sel  
**Champion:** Needs Champion  
**Proposal Type:** RFP-aligned proposal  
**Roadmap Area:** Security, Assurance & Incident Readiness  
**Primary Alignment:** RFP 27, Security Monitoring, Auditability and Evidence  
**Secondary Alignment:** RFP 28, Security Governance and Member Assurance  
**Requested Funding:** 500,000 CC  
**Project Duration:** 12 weeks  
**Relevant SIG:** Security  
**Proposed Software License:** Apache-2.0 for Canton-specific grant deliverables

## 1. Summary

Canton participants need reusable, privacy-aware tooling that can transform security-relevant Canton artifacts and operational signals into deterministic, auditable evidence without requiring raw sensitive data to leave its trust boundary.

This proposal extends the existing Koschei Sentinel cybersecurity evidence and evaluation foundation with a new Canton-specific open-source toolkit: a Canton evidence schema and adapter, deterministic assurance rules and evidence bundles, an operator/developer API and CLI, a reproducible Canton security benchmark and test corpus, and deployment and maintenance documentation.

The grant does not fund the existing general-purpose Koschei Sentinel platform, model-training architecture, private datasets, or unrelated proprietary commercial components. It funds only the new Canton-specific public-good work described below.

## 2. Problem and Ecosystem Value

Security monitoring and assurance in privacy-preserving networks requires a careful tradeoff. Reviewers and operators need enough structured evidence to identify unsafe or abnormal conditions, while security tooling must avoid unnecessary disclosure of private transactions, credentials, identities, or operational secrets.

Canton's current roadmap calls for reusable tooling around security monitoring, auditability, evidence, assurance, and privacy-preserving operations. This project addresses that need at the evidence and assurance layer. It will not act as an autonomous enforcement authority and will not replace Canton protocol controls. It will produce bounded, machine-readable security evidence and deterministic assurance results that can be independently inspected and integrated into operator and developer workflows.

The intended shared ecosystem value is a reusable security primitive that validators, application developers, infrastructure operators, and security reviewers can use without depending on private Koschei datasets or a proprietary hosted service.

## 3. Existing Work vs. Development Fund Work

### 3.1 Existing Koschei Sentinel foundation, not funded by this proposal

The existing Sentinel foundation includes general-purpose capabilities for structured evidence-grounded security outputs, deterministic quality and privacy gates, confidence and abstention controls, benchmark and evaluation contracts, model/provider adapters, privacy and secret sanitization, deterministic release integrity checks, a baseline inference engine, and an API boundary.

The existing architecture also enforces a core rule: model-generated commentary cannot replace a signed deterministic verdict.

No Development Fund payment is requested for creation of these pre-existing components.

### 3.2 New Canton-specific work requested from the Development Fund

The grant would fund:

1. A Canton threat model and evidence-source specification.
2. A `canton.security.evidence.v1` normalized evidence schema.
3. Canton adapters that transform supported Canton artifacts and signals into that schema.
4. Privacy-aware redaction and selective-disclosure rules for Canton evidence.
5. Deterministic Canton assurance checks and integrity-bound evidence bundles.
6. Operator/developer CLI and API interfaces for Canton assurance workflows.
7. Canton-specific security fixtures and a benchmark suite.
8. Documentation, reference integrations, deployment guidance, and maintenance handoff.
9. Ecosystem validation with Canton reviewers or users.

## 4. Scope

### In scope

- Canton and Daml package/deployment security evidence ingestion where supported by public or documented interfaces.
- Validator, application, and operator evidence normalization.
- Deterministic security checks operating only on available evidence.
- Explicit `unknown` or `insufficient_evidence` states when evidence is incomplete.
- Privacy-preserving output contracts.
- Machine-readable JSON output.
- CLI and HTTP interfaces.
- Reproducible public test fixtures.
- CI-verifiable acceptance tests.
- Open-source Canton-specific artifacts and documentation.

### Out of scope

- Changes to Canton consensus or protocol implementation.
- Private-key custody or transaction signing.
- Automatic enforcement without operator policy.
- Guaranteed vulnerability detection.
- General Koschei Sentinel model training.
- The Sentinel 397B-total / 35B-active architecture target.
- Private Koschei datasets or production infrastructure.
- Commercial Sentinel features unrelated to Canton.

## 5. Technical Approach and Architectural Alignment

### 5.1 Evidence-first architecture

The Canton adapter will convert supported input into a canonical evidence object. Records will contain applicable fields for evidence identity, type, source class, observation time or artifact version, privacy-safe subject reference, provenance, integrity metadata, bounded security attributes, disclosure classification, quality/confidence metadata, and explicit unavailable fields.

The toolkit will avoid copying raw secrets or unnecessary personally identifiable data into evidence bundles.

### 5.2 Deterministic assurance layer

The first release will implement a small, auditable ruleset rather than treating an opaque model output as security authority. Initial rule families will cover at least five documented assurance conditions selected with champion and reviewer input. Candidate conditions include malformed or unsupported evidence, package or dependency risk signals exposed by supported artifacts, configuration/policy drift against a declared baseline, missing expected evidence, integrity/provenance failures, security-relevant metadata changes, and privacy-policy violations in evidence bundles.

Every factual finding will cite the evidence IDs that support it.

### 5.3 Sentinel intelligence boundary

Optional Sentinel or model commentary may explain a deterministic result, but it cannot change the deterministic verdict, invent missing Canton facts, or silently raise confidence. Factual claims must cite known evidence IDs, and unsupported situations must return an abstention or unknown state.

### 5.4 Interfaces

The project will provide a local/CI CLI, versioned JSON contracts, a small HTTP API suitable for operator tooling, reference integration examples, and fixtures usable without access to private production data.

## 6. Milestones

### Milestone 1: Canton Threat Model, Evidence Contract & Adapter Skeleton

**Duration:** Weeks 1-3  
**Funding:** 90,000 CC

#### Deliverables

- Canton-focused threat model for the initial supported evidence sources and trust boundaries.
- Documented privacy and data-handling model.
- `canton.security.evidence.v1` JSON schema.
- Adapter interface and at least one working Canton-specific adapter against reproducible public/test fixtures.
- Conformance tests.
- Architecture documentation describing the boundary between Sentinel analysis and Canton/operator authority.

#### Acceptance Criteria

- Schema validates all included positive fixtures and rejects included malformed fixtures.
- Every accepted evidence record has provenance and a stable evidence ID.
- Secret and credential fixtures are rejected or sanitized according to documented policy.
- Unsupported or missing fields are represented explicitly rather than synthesized.
- CI runs the adapter and schema conformance suite from a clean checkout.
- Canton-specific milestone code and documentation are published under the declared open-source license.

### Milestone 2: Deterministic Canton Assurance Engine

**Duration:** Weeks 4-6  
**Funding:** 150,000 CC

#### Deliverables

- Versioned Canton assurance-rule contract.
- Deterministic rules covering at least five documented security/assurance conditions.
- Integrity-bound evidence-bundle format.
- Finding format with evidence citations, severity/risk class, limitations, and machine-readable status.
- Regression suite containing positive, negative, and insufficient-evidence cases.

#### Acceptance Criteria

- Identical input produces canonically equivalent deterministic assurance output in the documented environment.
- Every factual finding references one or more input evidence IDs.
- Insufficient-evidence fixtures return `unknown` or `insufficient_evidence`, not a fabricated pass/fail result.
- Tampered evidence-integrity fixtures are detected.
- At least five rule families have documented test cases and expected outputs.
- CI blocks release when a hard assurance regression test fails.

### Milestone 3: Operator API/CLI, Benchmark & Reference Integration

**Duration:** Weeks 7-9  
**Funding:** 150,000 CC

#### Deliverables

- CLI suitable for developer and CI workflows.
- HTTP API for evidence submission and assurance-report retrieval.
- Canton-specific benchmark/test corpus using redistributable fixtures.
- Reproducible benchmark runner.
- Reference CI integration.
- Operational documentation and an example workflow.

#### Acceptance Criteria

- Clean installation instructions reproduce the CLI and API locally.
- API rejects invalid schema versions and malformed evidence.
- Benchmark runner produces a versioned report with pass/fail gates.
- Test corpus contains documented cases for each supported rule family and privacy failure mode.
- Reference CI workflow fails on known-bad fixtures and passes on known-good fixtures.
- No test requires private Koschei production data or credentials.

### Milestone 4: Ecosystem Validation, Hardening & Maintenance Release

**Duration:** Weeks 10-12  
**Funding:** 110,000 CC

#### Deliverables

- Feedback cycle with Canton ecosystem reviewers/users coordinated with the champion and relevant SIG/reviewers.
- At least two documented external evaluations, pilot uses, or structured technical reviews, subject to participant availability.
- Hardening based on review findings.
- Security limitations document.
- Versioned v1.0 Canton toolkit release.
- Maintenance policy, contribution guide, and post-grant roadmap.

#### Acceptance Criteria

- v1.0 is reproducibly buildable and testable from the public software repository.
- At least two external Canton ecosystem participants have run the toolkit against representative fixtures/workflows or completed a structured technical review, subject to ecosystem participation.
- Material review findings are tracked and dispositioned as fixed, accepted limitation, or future work.
- The public maintenance policy identifies the owner, issue process, security-reporting path, and compatibility policy.
- Documentation states deployment assumptions, unsupported scenarios, and privacy boundaries.

## 7. Funding Breakdown

| Milestone | Funding |
|---|---:|
| M1: Threat Model, Evidence Contract & Adapter | 90,000 CC |
| M2: Deterministic Assurance Engine | 150,000 CC |
| M3: API/CLI, Benchmark & Reference Integration | 150,000 CC |
| M4: Ecosystem Validation & Maintenance Release | 110,000 CC |
| **Total** | **500,000 CC** |

The requested amount and the exact initial evidence-source scope are intentionally reviewable and may be refined with the champion and Tech & Ops reviewers. Payments are expected to follow the Development Fund milestone-acceptance process.

## 8. Open-Source Deliverables

Canton-specific grant outputs will be released publicly. Software is proposed for Apache-2.0 licensing and will include the Canton evidence schema, funded Canton adapter code, funded deterministic assurance rules, CLI/API integration code, public fixtures, benchmark/conformance suite, reference CI integration, technical documentation, and contribution/maintenance documentation.

The general Koschei Sentinel commercial platform, unrelated model architecture, private datasets, private infrastructure, and non-Canton proprietary components are not grant deliverables.

## 9. Dependencies and Risks

The project depends on stable access to Canton public developer documentation and redistributable test artifacts, reviewer agreement on the preferred initial evidence sources, ecosystem participation for validation, and no requirement for confidential participant production data.

If an intended source is unavailable or unsuitable for public tooling, the adapter will use documented fixtures and a defined interface so operators can integrate locally without sending sensitive data to Koschei. Scope changes that materially affect milestones or funding will be brought back to the champion and reviewers rather than silently substituted.

## 10. Privacy and Security

The project is designed to preserve Canton's privacy model. It will minimize collected data, avoid requiring raw private transaction data for the public benchmark, keep secrets and credentials out of evidence bundles, represent unavailable information explicitly, produce deterministic evidence-backed findings, keep model output subordinate to deterministic authority, permit local/operator-controlled deployment for sensitive evidence, and document supported and unsupported trust assumptions.

## 11. Adoption Plan

The initial user groups are validator/operators needing repeatable assurance evidence, Canton application developers integrating security checks into CI, and security reviewers/auditors needing machine-readable reproducible evidence bundles.

Adoption during the grant will focus on representative workflows rather than production secrets. Milestone 4 makes ecosystem usage or structured external review an explicit acceptance requirement so delivery is not measured only by code completion.

## 12. Maintenance Plan

Koschei will maintain the Canton-specific open-source toolkit after the grant period through issue triage and security-report intake, compatibility updates when supported Canton interfaces change, regression-test maintenance, semantic versioning, quarterly review of open security/tooling issues during the first 12 months after v1.0, and a public contribution process.

Any later commercial services for private deployment or advanced Sentinel capabilities will remain separate from the grant-funded public artifacts.

## 13. Requested Champion Review

This proposal is submitted with **Needs Champion** status following guidance from Canton Foundation staff. The primary classification is RFP 27, with RFP 28 noted as secondary alignment; final classification remains subject to Tech & Ops review.

A potential champion's early review is requested on the initial Canton evidence sources, the 500,000 CC scope, milestone acceptance criteria, and any additional adoption or architectural requirements needed before the proposal advances.