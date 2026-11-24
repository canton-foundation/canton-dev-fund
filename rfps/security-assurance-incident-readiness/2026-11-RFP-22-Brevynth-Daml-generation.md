# Brevynth for Canton — generating Daml contracts from mathematical models

**Organization:** Tokenfrastructure Group

**Author / Primary Contact:** Zakaryae Boudi (boudi@intelligenceconomy.org)

**Status:** Submitted

**Created:** 2026-11-24

**Proposal Type:** RFP-aligned

**RFP / Roadmap Area:** RFP 22, Daml Security Standards and Secure Development · Security, Assurance & Incident Readiness

**Suggested reviewers:** Daml Language & Developer Tooling SIG and Security SIG

**Champion:** Needs Champion

**Total Funding Request:** US$350,000 equivalent in Canton Coin (indicatively 4,718,317 CC)

**Project Duration:** 16 weeks from signing, followed by 90 days of maintenance for public deliverables

**Label:** daml-tooling

## Abstract

When a development agent writes a contract and its tests from the same instruction, both can encode the same mistake. For example, “two approvals” might become two approval events from a single party. In a mathematical model the issuer can state the rule precisely: settlement requires two distinct authorised parties, and a rejected instruction leaves the previous state intact. A reviewer can examine that rule before anyone generates a contract. As agents make successive changes, the same model gives the parties a way to check what each release permits.

We propose a valid-by-design generation chain for Canton. A user supplies a newly authored B-method model and configuration. Brevynth checks the model, derives its executable representation, generates the complete Daml contract, compiles it and produces independently verifiable evidence. The model and configuration are the only application-specific inputs. A Canton reviewer can rebuild and check the result without access to our private generator source.

## Specification

### 1. Objective

Enable a Canton application team to generate a complete Daml package from a new model within a documented subset of Classical B, without manual Daml edits or model-specific compiler code. A second team should be able to establish which properties were checked, against which build and with what assumptions.

### 2. Implementation Mechanics

1. **Check the input.** The first profile covers Boolean and bounded integer state, initialisation, invariants, guarded operations and atomic updates. A declarative configuration binds parties and roles, disclosure rules, numeric limits and tool versions. An unsupported construct or missing binding produces a diagnostic before packaging.
2. **Generate the contract.** The front end derives a typed executable representation. The Daml backend maps state to templates and operations to choices, assigns signatories, controllers and observers, and emits the full Daml project. For each state change, it records how the consumed contract and its successor represent a single transition of the same model instance.
3. **Compile and exercise it.** A pinned Daml SDK builds a Daml Archive (DAR). Daml Script scenarios on a local Canton ledger exercise the reference approval workflow, including who may act, what each party can see, and which state survives a rejected instruction.
4. **Check the evidence.** A public checker binds the model, configuration, executable representation, source and DAR to a manifest of hashes and tool versions. A reviewer can compare package IDs after rebuilding, replay the scenarios and compare observed transitions with the model. Each reported property is identified as proved, tested, assumed or still open. Proofs claimed as evidence must be replayable.

### 3. Architectural Alignment

The project uses Daml templates, choices and party-based authorisation, the standard Daml SDK build, and a local Canton ledger. Developers can run the public checker in their own continuous integration (CI) workflow before submitting a package for vetting. The work responds to RFP 22’s call for reusable secure-development tooling and reference implementations.

### 4. Backward Compatibility

Existing Daml packages, participant nodes and network governance require no changes. The pilot uses a separately generated package and synthetic parties.

## Milestones and Deliverables

| Milestone | Due | Deliverables and payment trigger | USD | Indicative CC |
| --- | --- | --- | ---: | ---: |
| 1. Signing and mobilisation | At signature | The parties sign the grant agreement recording scope, acceptance procedure and payment terms. The first instalment is payable upfront on signing, before engineering begins. | $150,000 | 2,022,136 |
| 2. Reference workflow | End of week 8 | On acceptance of the public model profile, Daml role mappings, evidence schema and a demonstration that the reference workflow generates a complete Daml project and builds its DAR without manual edits. | $100,000 | 1,348,090 |
| 3. Independent evaluation and release | End of week 16 | On acceptance of the independent evaluation described below and public release of the checker, worked examples, evaluation results and CI guide. | $100,000 | 1,348,091 |
| **Total** | | | **$350,000** | **4,718,317** |

## Acceptance Criteria

We will invite two Canton application teams to evaluate the workflow. The week-16 acceptance criterion is one independent evaluator completing the following on a clean machine. We will provide the release binary, checker and setup instructions.

- After the generator version and profile are frozen, the evaluator authors a new in-profile B model and configuration, generates complete Daml with the unchanged binary, builds its DAR and replays its evidence. A manual Daml edit or a compiler change to accommodate the model fails this test.
- The evaluator changes the controller of a generated choice in the reference workflow and rebuilds. The checker must identify the disagreement with the original role configuration even though the modified package compiles. An out-of-profile input must report the unsupported construct.
- A reviewer using only the published reference artifacts, public checker and documented toolchain can reproduce the reference results locally. We publish which checks passed, failed or remained open, with instructions for integrating the checks into an existing Canton application’s CI.

## Funding

The grant supports an estimated 30 person-weeks for the public Canton model profile, reference examples, checker, tests, integration, documentation and independent evaluation, plus maintenance of the public deliverables for 90 days after acceptance. Our team contributes the existing Solidity chain, shared modelling infrastructure and engineering of the proprietary Daml generator.

The CC figures use the proposal’s planning assumption of US$0.074179 per CC. We propose fixing all three CC instalments at an agreed spot rate on signing. We request express approval for the US$150,000-equivalent signing advance. The remaining two payments fall due on committee acceptance in their fixed CC amounts. Should committee-requested changes extend delivery beyond six months, the parties will revisit remaining milestones and funding to account for significant USD/CC volatility.

## Co-Marketing

We will coordinate a release announcement with the Foundation and offer a technical walkthrough showing a Canton developer how to generate a package and a reviewer how to reproduce its checks.

## Motivation

Application developers need to know whether a change to an approval or disclosure rule survives translation into Daml. Package reviewers need evidence they can run themselves. The worked example and CI guide give both groups a practical entry point. The first adoption target is one independent completion from two invitations. We claim no committed pilot partner.

An earlier TKNFRA proposal concerned B models of two specific Canton standards, CIP-0056 and CIP-0047. This request funds reusable tools for newly authored models. The budget contains no work on the two standards-specific models. ([Earlier proposal](https://github.com/canton-foundation/canton-dev-fund/pull/12))

## Rationale

We already have a working Solidity generation and compilation chain. For its supported scalar profile, it checks a B model, derives an executable representation, emits Solidity and invokes a pinned compiler to produce the contract interface and EVM bytecode. Reusing the front end lets us focus on what Canton requires: party authority, disclosure, contract succession and Daml packaging. Publishing the checks lets developers evaluate the resulting packages independently of the generator.

## Intellectual property and access

Tokenfrastructure Group owns the Brevynth intellectual property and retains ownership of all intellectual property it develops under this project, including the new Daml backend, compiler transformations, generator, workbench and improvements. Tokenfrastructure Group reserves ownership, private source access and commercial licensing rights to these components. The grant conveys no assignment, joint ownership or exclusivity. Pilot evaluators receive a local generator binary under a non-exclusive evaluation licence.

We will publish the evidence checker, schema, synthetic examples, generated reference Daml and CI scripts under Apache 2.0. Tokenfrastructure Group retains copyright in the public software it authors. Third-party components and participant-supplied models remain subject to their owners’ rights. The repository’s CC0 dedication applies to this proposal text.

## Work beyond this grant

Following this project, we will pursue independent certification of the generation chain itself. We will also develop B models of key financial instruments, including bonds and fund units, and formally verify instrument-specific properties such as coupon entitlement and the reconciliation of units after issuance and redemption. Those efforts have their own scope and funding and fall outside all three milestones.
