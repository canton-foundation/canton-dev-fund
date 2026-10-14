# Canton Public Market Metrics Verifier

## Proposal Path

RFP-aligned proposal.

This proposal responds to the Canton Foundation 2026–2027 RFP on **Public verifiability** under **Financial Markets, Standards & Verification**.

## Applicant

**Name:** Natthaphong Suebsri  
**Email:** viter999.shawn@gmail.com  
**GitHub:** https://github.com/viter999  
**Project identity:** TheQuantTape / Whale Lab  
**Location:** Thailand  
**Team size:** 1 independent researcher/developer

## Objective

Build an open-source reference toolkit for producing and independently verifying public aggregate market metrics from Canton applications while preserving Canton’s privacy model.

The initial scope focuses on aggregate metrics such as:

- transaction count;
- notional activity;
- volume;
- asset supply;
- price or reference-price observations where available;
- activity over fixed time windows.

The project will not expose private transaction-level data. Instead, it will define a reproducible pipeline for deriving, signing, publishing, and independently checking permitted aggregate outputs.

## Problem

Canton intentionally preserves transaction privacy, but financial markets still depend on trustworthy public signals.

A market participant may need to know whether a published aggregate such as volume or supply is accurate without gaining access to the underlying private transactions.

Today, an issuer or application can publish its own aggregate, but external users may have limited ability to verify how that number was produced.

The Canton roadmap explicitly identifies this gap and calls for approaches that improve public verifiability while preserving confidentiality.

## Proposed Solution

The project will build a reference implementation with four layers.

### 1. Aggregate Metric Specification

Define a machine-readable schema for public market metrics.

Each published metric record will include:

- metric type;
- application or asset identity;
- measurement window;
- value;
- calculation version;
- source boundary;
- generation timestamp;
- integrity metadata;
- verification status.

### 2. Deterministic Aggregation Pipeline

Build a reference pipeline that converts permitted Canton application data into deterministic aggregate outputs.

The pipeline will:

- use fixed calculation rules;
- produce identical results for identical admissible inputs;
- reject incomplete or malformed source inputs;
- preserve an audit manifest of the aggregation process;
- separate private source data from public aggregate outputs.

### 3. Verifiable Publication Layer

Create a public output format that allows consumers to verify:

- which metric definition was used;
- which software version produced it;
- when the metric was generated;
- whether the published payload has been modified;
- whether multiple observations belong to the same reporting sequence.

The first version will focus on cryptographic hashes, signed manifests, and reproducible calculation rules.

The architecture will intentionally leave room for future TEE or zero-knowledge proof integrations without pretending those advanced verification mechanisms are already implemented.

### 4. Independent Verification Tool

Build a command-line verifier that can consume a published metric manifest and validate:

- schema compliance;
- cryptographic hashes;
- signature validity where applicable;
- metric-definition version;
- consistency between reported values and provided verification evidence.

## Why This Fits Canton

This proposal directly addresses the Canton Foundation RFP for public verifiability of market metrics.

The project is intended as shared infrastructure rather than a proprietary analytics product.

It aims to provide reusable building blocks for:

- asset issuers;
- financial applications;
- market-data providers;
- researchers;
- indexers;
- auditors;
- and other Canton ecosystem participants.

The architecture will preserve Canton’s privacy boundaries by publishing only explicitly permitted aggregate information.

## Technical Approach

The initial implementation will be written primarily in Python with a small command-line interface and machine-readable JSON outputs.

The design will emphasize:

- deterministic transformations;
- typed schemas;
- explicit versioning;
- cryptographic hashing;
- test fixtures;
- fail-closed validation;
- reproducible computation;
- clear separation between private inputs and public outputs.

Where practical, Canton APIs and existing indexing/query infrastructure will be used rather than introducing a parallel data model.

The implementation will be modular so that a future contributor can replace or extend the verification backend with:

- trusted execution environment attestations;
- zero-knowledge proofs;
- decentralized attestation;
- or issuer-specific verification systems.

## Architectural Alignment

The proposal is designed around Canton’s privacy-first architecture.

It does not assume that private transaction data should become public.

Instead, the toolkit operates at the boundary where an application, issuer, or authorized participant deliberately publishes an aggregate metric.

The public artifact contains only the permitted aggregate and the metadata/evidence required to verify how that aggregate was produced.

This aligns with the roadmap’s stated goal of increasing trust in public market signals without defeating transaction confidentiality.

## Milestone 1 — Specification and Reference Aggregator

**Duration:** 4 weeks  
**Funding requested:** $2,000

### Deliverables

- metric manifest JSON schema;
- versioned metric definitions;
- deterministic aggregation engine;
- input validation;
- integrity manifest generation;
- unit tests;
- example datasets;
- architecture documentation.

### Acceptance Criteria

- identical admissible inputs produce byte-stable aggregate outputs;
- invalid or incomplete inputs fail closed;
- metric definitions are versioned;
- public output contains no private transaction-level data;
- automated tests cover core validation and aggregation behavior.

## Milestone 2 — Publication and Verification Tooling

**Duration:** 4 weeks  
**Funding requested:** $2,500

### Deliverables

- signed/hash-linked public metric manifests;
- CLI publisher;
- CLI verifier;
- schema validation;
- integrity verification;
- sequence/version validation;
- example reporting workflow;
- automated integration tests.

### Acceptance Criteria

- altered published payloads are detected;
- unsupported schema versions are rejected;
- verifier can independently validate a reference publication;
- verification does not require access to unrelated private transaction data.

## Milestone 3 — Canton Reference Integration and Documentation

**Duration:** 4 weeks  
**Funding requested:** $2,500

### Deliverables

- reference integration with a Canton test/application environment;
- example public metrics pipeline;
- end-to-end reproducibility test;
- developer documentation;
- deployment instructions;
- sample public dashboard or machine-readable feed;
- final technical report.

### Acceptance Criteria

- at least one Canton-based reference workflow produces and verifies public aggregate metrics end to end;
- setup can be reproduced from public documentation;
- all grant-funded source code is publicly available;
- test suite passes in a clean environment.

## Total Funding Request

**$7,000 USD equivalent in Canton Coin, milestone-based.**

| Milestone | Amount |
|---|---:|
| Specification and reference aggregator | $2,000 |
| Publication and verification tooling | $2,500 |
| Canton integration and documentation | $2,500 |
| **Total** | **$7,000** |

## Timeline

Estimated project duration: **12 weeks**

- Month 1: specification and deterministic aggregation
- Month 2: publication and verification tooling
- Month 3: Canton integration, testing, documentation, and reference implementation

## Open Source

All grant-funded software will be released publicly.

Proposed software license: **Apache-2.0**

Proposal documentation may be published under the repository’s existing CC0 terms.

## Maintenance Plan

After the funded milestones, I intend to maintain the toolkit as open-source infrastructure.

Likely follow-on improvements include:

- additional metric types;
- richer Canton indexer integrations;
- support for issuer-specific adapters;
- external attestation backends;
- TEE integration;
- zero-knowledge verification experiments;
- dashboard and API integrations.

The core manifest and verifier will remain intentionally lightweight so other Canton projects can reuse them without adopting a large proprietary stack.

## Relevant Experience

I am an independent crypto market-microstructure researcher and developer.

I have built:

- multi-exchange market-data collectors;
- open-interest and volume monitoring systems;
- market-state and order-flow research tooling;
- APIs and dashboards;
- prospective research pipelines;
- integrity and reconciliation systems;
- automated testing infrastructure;
- reproducibility and evidence-preservation workflows.

My current research work increasingly focuses on making quantitative analysis difficult to manipulate accidentally: fixed rules, evidence preservation, fail-closed checks, and independently inspectable outputs.

Relevant repositories:

- https://github.com/viter999/quant-market-research
- https://github.com/viter999/crypto-signal-null-results

## Community Champion

**Status: seeking Champion.**

I am an external individual contributor and understand that Canton Development Fund rules require external proposals to have a Development Fund Champion.

I am submitting this proposal for technical review and community feedback and would welcome guidance from the relevant Financial Markets / public-verifiability contributors or SIG toward identifying an appropriate Champion.

## Contact

Natthaphong Suebsri  
TheQuantTape  
Email: viter999.shawn@gmail.com  
GitHub: https://github.com/viter999  
X: https://x.com/TheQuantTape
