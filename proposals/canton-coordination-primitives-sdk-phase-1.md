## Development Fund Proposal

Author: Levent Ceyhan (LeventLabs), Canton Catalyst builder with a working Canton DevNet implementation
Status: Draft
Created: 2026-03-27

* * *

## Abstract

This proposal requests support for a narrowly scoped first release of reusable Daml coordination primitives for Canton. The work extracts a small set of privacy-preserving multi-party workflow patterns from a working Canton DevNet implementation and publishes them as open-source building blocks that other Canton developers can reuse. The AML implementation that produced these patterns is only the reference use case; the funded output is the reusable SDK itself.

* * *

## Specification

### 1. Objective

The objective is to deliver a small reusable set of workflow-level coordination primitives for privacy-preserving multi-party applications on Canton.

Canton provides privacy, selective disclosure, and multi-party workflows, but reusable coordination patterns remain limited. Teams building privacy-preserving shared decision workflows often need to design signal submission, aggregation, and follow-on action logic from scratch. This increases implementation time, reduces standardization, and makes it harder for new builders to ship protocol-aligned applications quickly.

Phase 1 intentionally focuses on the smallest independently useful release:

- `BeliefCommitment`: a standard template for confidential signal submission
- `SignalAggregator`: reusable weighted and median aggregation logic
- `ThresholdAction`: configurable trigger logic based on aggregate outcomes

### 2. Implementation Mechanics

The proposed SDK will be extracted from a working Canton DevNet implementation developed through the Canton Catalyst and mentorship process.

Reference implementation repository: https://github.com/LevCey/aml-prediction-network

Reference demo: https://amlprediction.network

Implementation scope for Phase 1:

- Package three reusable Daml templates from the existing working implementation
- Support weighted linear and median aggregation strategies
- Provide a Daml Script test suite for documented flows and core edge cases
- Publish the SDK in a public GitHub repository with CI
- Release the code under Apache 2.0
- Produce DevNet deployment proof for the Phase 1 templates
- Provide basic documentation, usage examples, and local/devnet setup notes
- Tag a `v0.1.0` release

The implementation is intentionally narrow. It does not include a full AML application, frontend, API layer, or additional use cases. The goal is a small reusable coordination SDK, not a standalone end-user product.

### 3. Architectural Alignment

This proposal aligns with Canton architecture and ecosystem priorities in several ways:

- It is protocol-native and built around Canton's privacy and selective disclosure model
- It provides reusable developer tooling rather than a single-purpose application
- It creates reference implementation value for other builders
- It requires no protocol changes
- It focuses on shared infrastructure that can be reused across multiple regulated workflow categories

The same primitive set can support AML, sanctions screening, credit risk coordination, market abuse signaling, and similar workflows where parties need shared outcomes without raw data sharing.

### 4. Backward Compatibility

No backward compatibility impact.

* * *

## Milestones and Deliverables

### Milestone 1: Core Coordination Primitives SDK v0.1

- Estimated Delivery: 6 weeks from committee approval
- Focus: deliver a narrowly scoped reusable coordination SDK extracted from an existing working implementation
- Deliverables / Value Metrics:
  - `BeliefCommitment`, `SignalAggregator`, `ThresholdAction` Daml templates
  - Weighted linear and median aggregation support
  - Daml Script test suite covering documented flows and core edge cases
  - Public GitHub repository with CI
  - Apache 2.0 licensing
  - DevNet deployment proof
  - Basic documentation and setup guide
  - Tagged `v0.1.0` release
  - Compatibility verified with Canton SDK 3.4+

* * *

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for the milestone
- Demonstrated functionality and DevNet deployment readiness
- Documentation and knowledge transfer provided
- Alignment with the stated value metrics

Project-specific acceptance conditions:

- All three Phase 1 primitives compile and deploy on Canton DevNet
- Aggregation behaves correctly across multi-party scenarios
- Threshold actions trigger correctly under configured conditions
- Tests pass for the documented Phase 1 scope
- All code is open-source under Apache 2.0
- Documentation includes working examples

* * *

## Funding

Total Funding Request: 70,000 CC

### Payment Breakdown by Milestone

- Milestone 1 (Core Coordination Primitives SDK v0.1): 70,000 CC upon committee acceptance

This funding request reflects a six-week engineering effort covering extraction from working code, abstraction into reusable templates, testing, documentation, packaging, and DevNet deployment proof.

The scope is intentionally narrow to keep delivery risk low while still producing a reusable public-good output for the Canton ecosystem.

### Volatility Stipulation

If the project timeline extends beyond 6 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility.

* * *

## Co-Marketing

Upon release, the implementing entity will collaborate with the Foundation on:

- Announcement coordination
- A short technical write-up or case study on the reusable coordination primitives
- Developer and ecosystem promotion as appropriate

* * *

## Motivation

This proposal is valuable because it turns a working Canton DevNet implementation into reusable public-good developer infrastructure.

Canton's strongest differentiators are privacy, selective disclosure, and multi-party workflow coordination. A small reusable set of workflow-level coordination primitives helps other builders adopt those capabilities faster and with less custom design effort. Even as a narrow Phase 1, the output can reduce time-to-build for similar privacy-preserving multi-party applications and provide a concrete reference implementation for the ecosystem.

The proposal is also lower risk than a greenfield effort because it is extracted from a working implementation already running on DevNet.

* * *

## Rationale

This is the right approach because it keeps scope small, outputs reusable, and delivery risk bounded.

A single-purpose application benefits one use case. A reusable coordination SDK compounds value across multiple builders and workflow categories. Starting from working code reduces delivery risk and allows the proposal to focus on extraction, cleanup, documentation, and packaging rather than speculative greenfield design.

The Phase 1 scope is intentionally limited to three primitives so that:

- review is straightforward
- acceptance criteria are objective
- value is delivered even if no later phase is funded

Future phases can extend the SDK with observer, audit, reputation, and broader coordination patterns if there is ecosystem demand and positive committee feedback.
