## Development Fund Proposal: Canton Cross-Domain Settlement (CCDS) Reference Example and Builder Guide

- **Author:** Srikanth
- **Status:** Submitted
- **Created:** 2026-03-19

---

## Abstract

This proposal requests funding to publish, improve, and document an open-source example of cross-domain Delivery-versus-Payment (DvP) settlement on Canton.

A substantial working copy has already been built in Daml and TypeScript since Dev Grant idea has been discussed and proposed . The grant is not to start from zero, and it is not to turn this work into a production-hardened settlement product. The grant is to make the work useful to the ecosystem by:

- publishing a clean public reference release under Apache 2.0
- Improving the example based on initial feedback from Daml/Canton engineers so it is a better Canton-native example
- publishing an EVM-to-Canton builder guide that explains what changed from the original design assumptions and why

The current example already includes a Daml `Lockable` interface, bilateral and multi-leg settlement instructions, a TypeScript orchestrator, reference asset paths, and end-to-end demos. The goal of this proposal is to turn that existing implementation effort into public ecosystem infrastructure that other teams can run, study, and learn from.

---

## Specification

### 1. Objective

The objective is to lower the barrier for teams exploring cross-domain settlement on Canton by publishing a working example that is easy to run, easy to understand, and honest about its boundaries.

The intended outcome is that any team can:

- run a concrete cross-domain DvP example locally
- understand the reference topology and application-layer coordination model
- see what parts of the design feel natural in Daml/Canton and what parts needed to change from an EVM mindset
- reuse pieces of the example where useful, while understanding what remains example code rather than a general standard

This project is explicitly positioned as ecosystem infrastructure and a reference example, not a universal standard, hosted operator, or production settlement product.

### 2. Current Status and Implementation Mechanics

The starting point for this grant is not a blank page. A substantial working example already exists in Daml and TypeScript. This proposal is about turning that existing work into a clean public reference release and improving it based on early feedback from Daml/Canton engineers.

The current example already includes:

- a Daml `Lockable` interface and bilateral `DvPInstruction`
- a TypeScript orchestrator with checkpoint persistence and restart handling
- a local three-synchronizer reference environment
- reference asset paths for local `Lockable` assets, Daml Finance-style / CIP-0056-style holding adapters, Splice / `HoldingV1` / `Amulet`-style adapter paths, and a bridge-backed Canton Coin / DA Utility flow
- technical documentation, local demos, and walkthrough material

The reference topology uses a neutral settlement domain pattern with three synchronizers:

- home synchronizer A for the first leg
- home synchronizer B for the counter-leg
- one mutually trusted neutral settlement synchronizer for atomic DvP execution

The example now illustrates two settlement lanes.

The first is a generic CCDS lane for private or non-token-standard assets. That lane uses `Lockable`, explicit reassignment to a neutral settlement synchronizer, and an atomic Daml settlement transaction.

The second is a CN-native lane for Canton Network token-standard assets. That lane uses allocation workflows, Global-Synchronizer-pinned settlement, and automatic synchronizer routing where the validator can provide it.

In both lanes, the orchestrator runs on participant-controlled infrastructure and has deliberately narrow authority:

- it can act only on already-authorized settlement intent
- it may drive only the next allowed transition recorded in instruction and checkpoint state
- final settlement remains gated by the Daml transaction on the settlement synchronizer

At a high level, CCDS demonstrates both:

- a generic cross-domain settlement pattern for private or custom assets
- a more Canton-native path for CN token-standard assets that already support allocation workflows

The grant is not mainly about turning this into a production-hardened settlement product. It is about making the example public, improving it into a better Canton-native example, and documenting the lessons clearly enough that other builders can benefit.

The included reference asset scope remains intentionally bounded:

- a local reference `Lockable` asset path
- a Daml Finance-style / CIP-0056-style holding adapter path
- a Splice / `HoldingV1` / `Amulet` style adapter path
- a bridge-backed Canton Coin / DA Utility reference flow

Out of scope for this grant:

- production hardening or audit work beyond what is needed for a good public example
- hosted settlement services
- bespoke adapters for proprietary institutional platforms
- broad package-by-package adapter coverage beyond the included reference paths
- formal standardization or CIP authorship work
- speculative third-party audit funding

This proposal has also benefited from an early feedback loop with Daml/Canton engineers. In particular, feedback from Shaul and Simon helped sharpen both the architecture and the presentation of the example, especially around better Canton-native paths for token-standard assets and clearer separation between generic and CN-native settlement flows.

### 3. Architectural Alignment

This proposal aligns with Canton’s Network of Networks model because it focuses on an application-layer coordination problem rather than asking for protocol changes.

It is aligned with Development Fund priorities because it delivers:

- a public example of a cross-domain settlement pattern that other teams can learn from
- reusable open-source infrastructure for DvP-oriented application developers
- a practical bridge for EVM-native builders who are trying to understand what changes when they build on Daml/Canton

The included reference suite is intentionally limited to representative paths that make the example concrete while keeping the scope realistic.

### 4. Backward Compatibility

*No backward compatibility impact.*

This project is additive. It introduces a new public example and supporting client library without requiring protocol changes or changes to existing Canton core behavior.

---

## Milestones and Deliverables

### Milestone 1: _(Public Reference Release of the Existing CCDS Example)_
- **Estimated Delivery:** 2-4 weeks from project start
- **Focus:** Publish the current CCDS baseline as a clean, runnable public reference example that external teams can inspect, run, and evaluate.
- **Deliverables / Value Metrics:**
  - public Apache 2.0 repository for the CCDS example
  - current Daml contracts, TypeScript orchestrator, bridge helpers, and minimal demo app published
  - local three-synchronizer reference environment published
  - current supported reference paths documented clearly
  - architecture and run instructions published for external reviewers

### Milestone 2: _(Improve the Example Based on Daml/Canton Feedback)_
- **Estimated Delivery:** 2-4 weeks after Milestone 1
- **Focus:** Improve the example so it is a better Daml/Canton example rather than just a working port of earlier assumptions.
- **Deliverables / Value Metrics:**
  - updated code and docs incorporating initial Daml/Canton feedback
  - clearer distinction between the generic `Lockable` lane and the CN-native allocation-based lane
  - example boundaries and non-goals clarified more sharply
  - at least one architecture note explaining what changed from the initial version and why
  - supported reference paths and example flows cleaned up so external teams can review them more easily

### Milestone 3: _(EVM-to-Canton Builder Guide and Walkthroughs)_
- **Estimated Delivery:** 2 weeks after Milestone 2
- **Focus:** Publish the lessons learned for builders coming from the EVM world.
- **Deliverables / Value Metrics:**
  - a written guide explaining what is different when building this kind of flow in Daml/Canton
  - explicit notes on which assumptions from the initial design were too EVM-shaped and how the example evolved
  - end-to-end walkthroughs showing the example flow and reference topology
  - integration guidance for teams adapting the example to their own asset model


---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- deliverables completed as specified for each milestone
- demonstrated functionality for the published example flows
- documentation and knowledge transfer provided
- alignment with the stated public-good scope

Project-specific acceptance conditions:

- the CCDS example is released publicly under Apache 2.0
- the published example includes the Daml package, TypeScript orchestrator, and local reference environment
- the example remains runnable across three local synchronizers representing two home domains and one neutral settlement domain
- the published release includes the supported reference asset paths and at least one bridge-backed Canton Coin / DA Utility example flow
- documentation clearly defines the settlement intent object, coordinator authority model, and reuse boundary
- documentation clearly distinguishes what is included in the public example from direct integrations that remain future work
- the published guide explains the difference between the generic `Lockable` lane and the CN-native allocation-based lane, and why the example evolved in that direction
- the EVM-to-Canton builder guide is published and explains the main design lessons from building the example


---

## Funding

**Total Funding Request:** 1,600,000 CC

### Payment Breakdown by Milestone
- Milestone 1 _(Public Reference Release of the Existing CCDS Example)_: 700,000 CC upon committee acceptance
- Milestone 2 _(Improve the Example Based on Daml/Canton Feedback)_: 500,000 CC upon committee acceptance
- Milestone 3 _(EVM-to-Canton Builder Guide and Walkthroughs)_: 400,000 CC upon committee acceptance


### Volatility Stipulation
If the project timeline extends beyond 6 months due to Committee-requested scope changes, any remaining milestones should be renegotiated to account for material CC/USD volatility.

---

### Team Background

BitDynamics brings deep experience in building and operating blockchain infrastructure. The team has worked across Ethereum client infrastructure, validator operations, and production-grade hosting systems supporting validator infrastructure securing more than 2 billion AUD in assets. This background is directly relevant to building reliable public infrastructure and also directly informs the EVM-to-Canton guide proposed here. The team is also building actively on Canton.

---

## Potential Ecosystem Beneficiaries

This proposal is intended as public-good infrastructure for the wider Canton ecosystem. A few ecosystem teams appear well aligned with this feature set and with the kinds of problems CCDS is designed to illustrate, including Zynk , Gateway, Lumens.fi, and Hashrupt.

More broadly, the project is intended to benefit:

- teams exploring cross-domain settlement workflows
- multi-synchronizer application builders
- builders coming from EVM who need practical Canton examples rather than abstract descriptions

## Adoption and Reuse Boundary

Adoption is intended to be straightforward but explicit about the reuse boundary. Teams can reuse the TypeScript orchestrator, selected helper logic, and parts of the Daml package directly, while adapting their own asset model on the Daml side by implementing the `Lockable` interface in a thin package-local adapter.

In that sense, CCDS is designed to be reused partly as library code and partly as a reference blueprint. The builder guide is an equally important part of the proposal: it should help teams understand what to reuse, what to replace, and what lessons came out of building the example in the first place.

## Co-Marketing

Upon release, the implementing entity will collaborate with the Foundation on:

- announcement coordination
- a technical blog post or written walkthrough
- at least one developer-facing demo or walkthrough session

Specific commitments:

- publish integration guidance for teams evaluating the reference pattern
- publish at least one developer-facing walkthrough or demo
- publish at least one end-to-end example showing the reference DvP flow

---

## Motivation

Canton’s value proposition is not only privacy or institutional messaging. It is also the ability to coordinate across independently operated domains.

But many builders, especially those coming from EVM, do not yet have a good public example of what a cross-domain settlement flow on Canton should look like, which parts feel familiar, and which parts change.

A public CCDS example would give the ecosystem:

- a concrete starting point for cross-domain DvP experimentation
- a worked example that other teams can run instead of starting from scratch
- a clearer explanation of what changes when moving from EVM assumptions to Daml/Canton design
- a reusable code and documentation base that can improve through community feedback

This makes CCDS a strong candidate for Development Fund support as reusable open-source ecosystem infrastructure and as a bridge for new builders entering the Canton ecosystem.

---

## Rationale

This proposal is intentionally scoped as a public reference example rather than a universal settlement standard or a hardening program.

That is the right approach because:

- a substantial working example already exists, so the main public-good task is to publish it cleanly, improve it, and explain it well
- the ecosystem benefits more right now from a good example and a good builder guide than from prematurely positioning the work as production-hardened settlement infrastructure
- the Daml/Canton-specific lessons are strategically valuable for bringing more builders over from EVM-style mental models
- keeping the scope bounded avoids turning the proposal into a broad product or standards effort

The `1.6M CC` request prices CCDS as the work of turning an already-built example into public ecosystem infrastructure: public release, example improvement, builder education, and feedback-driven iteration.
