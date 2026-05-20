# Development Fund Proposal

## Canton Network Credentials — Full Integration Layer (Reference HTTP Client, Daml Engineering Contributions, and Integrator's Guide)

**Author:** Vlad Kokosh ([v.kokosh@pixelplex.io](mailto:v.kokosh@pixelplex.io))  
**Organization:** PixelPlex  
**Website:** <https://ccview.io>  
**CIP Reference:** <https://github.com/canton-foundation/cips/pull/204>  
**Related Implementation:** <https://github.com/hyperledger-labs/splice/pull/3416>  
**Tech & Ops Champion:** _[To be confirmed — required for external submissions]_  
**Status:** Submission Draft  
**Created:** 2026-05-14  
**Label:** canton-apis

---

## Abstract

This proposal requests funding from the Canton Development Fund to deliver an open-source **full integration layer** for the Canton Network Credentials standard ([CIP draft, PR #204](https://github.com/canton-foundation/cips/pull/204)), published under the Apache 2.0 license.

The standard has two production-facing surfaces: an on-ledger Daml implementation (see [Splice PR #3416](https://github.com/hyperledger-labs/splice/pull/3416)) and an off-ledger HTTP API consumed by wallets, explorers, and dApps. This grant funds the work that turns both surfaces into something the ecosystem can adopt with confidence:

- a maintained, neutral **reference HTTP client** for the registry API;
- a **conformance corpus** that defines correct client behavior;
- **engineering contributions on the Daml side** of the standard implementation, submitted upstream alongside Splice work;
- a single **Integrator's Guide** that consolidates everything for adopters.

The result is ecosystem public-good infrastructure: one coherent layer that takes the standard from spec to working integrations, instead of leaving each team to assemble the pieces independently.

---

## About the Proposer

PixelPlex is a General Partner of the Canton Foundation and an active contributor to the Canton ecosystem. The team has delivered and operates several production systems that are in daily use across the network:

- **CCView Block Explorer** ([ccview.io](https://ccview.io)) — a Canton Network explorer widely used across the ecosystem, including by the Canton Foundation itself. CCView's API layer serves data to top parties including Canton Foundation, Modulo Finance, CBTC, Circle, and others. CCView is also one of the primary consumers of credential data on the network.
- **Console Wallet** — one of the largest wallet products on Canton, supporting EVM compatibility, bridges, swaps, and other features across browser extension and mobile apps. Console Wallet is one of the primary consumers of party / registry metadata.
- **Governance contributions** — PixelPlex co-authored the dApp CIP, authored the Party Profile Credentials CIP ([#169](https://github.com/canton-foundation/cips/pull/169)), and is actively engaged in the review of the Canton Network Credentials Standard ([#204](https://github.com/canton-foundation/cips/pull/204)).

This proposal is a natural continuation of that work: a full integration layer for the standard PixelPlex is already integrating with through both CCView and Console Wallet, and reviewing as a CIP contributor.

---

## Ecosystem Demand

The Canton Network Credentials Standard ([#204](https://github.com/canton-foundation/cips/pull/204)) is a foundational primitive for service discovery, profile publication, name resolution, and verified identity flows. Once it ships, every wallet, explorer, and dApp on the network will need to interact with it — both on-ledger (Daml workflows) and off-ledger (HTTP API).

Today the on-ledger implementation is being actively built by the Splice team, while the off-ledger consumer layer has no neutral, maintained reference. Even on the on-ledger side, infrastructure of this kind benefits from additional engineering capacity working alongside the core team.

PixelPlex is already engaged in the PR #204 review process and operates two of the primary applications (CCView and Console Wallet) that will adopt this standard. Funding the full integration layer once, as a public good, lets the entire ecosystem absorb the standard faster and more consistently than it would otherwise.

---

## Problem Statement

Foundational standards deliver value only when the surrounding integration layer is in place. The Canton Network Credentials Standard currently has:

- a draft CIP under review;
- a draft on-ledger implementation in Splice;
- **no neutral HTTP client** for ecosystem consumers;
- **no shared conformance corpus** that defines correct client behavior;
- **no integrator-facing documentation** beyond the spec itself.

The two possible outcomes are:

1. **No grant.** Each ecosystem team builds its own client, derives behavior from server code, runs its own ad-hoc validation, and the Splice maintainers absorb both ongoing support and the full implementation workload alone. Coverage and consistency depend entirely on the bandwidth of one team.
2. **This grant.** A neutral, reusable integration layer — client, conformance, additional Daml engineering capacity, and a guide — funded once and reused by every subsequent integrator.

This proposal pays for outcome (2): the smallest, most reusable set of artifacts that lets the ecosystem adopt the standard with confidence on both surfaces.

---

## Objective and Ecosystem Value

### Objective

Deliver a maintained, open-source integration layer that covers both the off-ledger consumer side (HTTP client, conformance vectors) and the on-ledger side (Daml engineering contributions), wrapped by a single Integrator's Guide.

### Ecosystem Value

- **Reduces duplicated engineering effort** across wallets, explorers, and dApps by providing a shared, tested integration surface for both API and Daml usage.
- **Adds engineering capacity** to the Daml implementation of the standard, alongside the Splice team, accelerating its path to production-readiness.
- **Ensures consistent behavior** across integrators by anchoring the conformance corpus and the Integrator's Guide to a single source of truth.
- **Lowers adoption cost** for the standard — teams integrate against a library plus documented Daml patterns, instead of reverse-engineering behavior from server code.
- **Creates reusable public-good infrastructure** under Apache 2.0 that compounds in value with each new integrator.

This proposal is aligned with CIP-0082's stated purpose of supporting dev tools, reference implementations, and long-term ecosystem utility.

---

## Scope

### In Scope

- Open-source reference HTTP client for the Credential Registry API (one language at kickoff: TypeScript by default; Rust or Go on committee request)
- Versioned conformance vector catalog (language-agnostic, reusable across future client ports)
- Continuous compatibility validation against the Splice implementation as it lands
- Daml engineering contributions to the on-ledger implementation of the standard, submitted upstream as PRs (best effort, not conditional on merge for payment)
- Daml test engineering: comprehensive integration test scenarios covering end-to-end flows
- Integrator's Guide covering both surfaces (HTTP and Daml), consolidating onboarding, usage patterns, error handling, and security expectations
- All deliverables published under Apache 2.0 with CI

### Out of Scope

- Changes to the Canton protocol
- Hosting or operating a registry service
- Ledger signing, transaction submission, or wallet-side workflow logic in the client
- Independent security review or formal audit of the Daml implementation (separate engagement if desired, not part of this grant)

---

## Technical Approach

The work is organized into three tracks that run in parallel and converge across the milestones below.

### Track 1 — Daml Implementation Support

**A. Daml engineering and test contributions.**  
Additional engineering capacity on the Daml side of the standard implementation, contributed upstream to Splice as PRs. Includes code work and a comprehensive integration test suite covering end-to-end flows of the standard's on-ledger surfaces. Submissions are coordinated with the Splice maintainers; **payment is tied to submission of PRs and their review, not to merge.** Where a contribution is not accepted upstream, it is retained in our public repository as an integration aid, and the corresponding outcome remains a deliverable of the grant.

### Track 2 — HTTP Integration Layer

**B. Reference HTTP client (open source, Apache 2.0).**  
Maintained client library for the Credential Registry HTTP API: registry info, lookup, and related read flows. One language at kickoff. Models generated from / validated against a pinned OpenAPI revision. Versioned semver releases with documented OpenAPI pins.

**C. Conformance vectors and CI.**  
Public, versioned catalog of golden fixtures covering happy-path, failure-path, ordering, and multi-source scenarios. CI validates fixture schema and runs vectors against the reference client. Language-agnostic so future client ports can reuse the corpus without modification.

**D. Compatibility validation against Splice.**  
As the Splice implementation lands, we run the reference client and the vectors against it on a regular cadence and publish a short compatibility report each milestone. Discrepancies surface as upstream issues or PRs to Splice on a best-effort basis; their merge is **not** a payment gate for this grant.

### Track 3 — Documentation

**E. Integrator's Guide.**  
A practical guide written **after** the other tracks have produced enough stable surface area for it to be accurate. Outlined and seeded during M1 and M2 (rough notes, recipes, README content), then consolidated and published as **Integrator's Guide v1.0** at M3 as the primary documentation deliverable of the grant. Covers both on-ledger (Daml usage patterns referencing the contributed implementation) and off-ledger (HTTP client usage) integration paths.

### Operating Model

- Each milestone pins a specific OpenAPI revision and a specific Splice build for compatibility runs and Daml work.
- Daml contributions are submitted upstream as PRs; payment is based on submission, review interaction, and quality of the submitted work, not on merge outcome.
- Spec or OpenAPI ambiguities surfaced during the work are reported upstream as a normal contributor activity. No grant milestone is conditional on upstream merges.

### Architectural Alignment

- Sits at the seam between [PR #204](https://github.com/canton-foundation/cips/pull/204) and the application ecosystem, on both the off-ledger and on-ledger sides.
- Supports CIP-56 discovery linkage as defined in PR #204.
- Does not change the protocol; on-ledger contributions stay within the scope of the existing Daml interfaces and templates defined in the standard.
- A `canton-apis` / developer-experience grant whose value compounds with every new wallet, explorer, or dApp that integrates credentials.

---

## Milestones

### Milestone 1 — Alpha Client, Initial Conformance, Daml Engineering Foundation

**Funding requested:** ~171,000 CC  
**Estimated delivery:** ~6 weeks from kickoff

#### Deliverables

- **Alpha release of the reference client:** registry info call and basic lookup, typed models from the pinned OpenAPI, single canonical error type, minimal but real test suite — installable from the public repo.
- **Initial conformance vector catalog (target: 10+ scenarios)** covering core happy paths and a first set of failure paths, with CI validating fixture schema and behavior.
- **Pinned OpenAPI revision and pinned Splice build** documented in the repository as the working baseline.
- **Compatibility validation harness** in place (code that can run client + vectors against a Splice build).
- **First Daml engineering contributions** submitted upstream to Splice (code and tests). Scope and acceptance are evaluated on submission quality and review engagement, not on merge.
- **Integrator's Guide v0:** "Getting started" stub plus the full table of contents committed to the repo.

#### Acceptance Criteria

- Alpha client package release tag is publicly installable, with changelog and OpenAPI pin documented.
- CI passes for client and vector validation.
- Compatibility harness code is committed and runnable.
- At least one Daml contribution PR is open upstream and under active review.
- Guide v0 is visible in the repo with a populated table of contents.

---

### Milestone 2 — Beta Client, Conformance Expansion, First Compatibility Run, Daml Engineering Scale-up

**Funding requested:** ~256,000 CC  
**Estimated delivery:** ~2.5 months from kickoff

#### Deliverables

- **Beta release of the reference client:** full registry info and lookup flows, proper error model, retry / timeout behavior, BFT-style multi-base-URL read pattern, public API stable enough for ecosystem teams to begin integrating against.
- **Expanded vector catalog (target: 20+ total scenarios)** including ordering and multi-source cases plus a broader failure-path set.
- **End-to-end runnable example** (clean-checkout reproducible) demonstrating a realistic wallet- or explorer-style flow.
- **First compatibility report** from running the beta client and vectors against the then-current Splice implementation; defects raised upstream as issues / PRs (best effort, non-blocking for payment).
- **Continued Daml engineering contributions** submitted upstream: additional code and an expanded Daml Script test suite. Scope and pace coordinated with the Splice team.
- **Integrator's Guide v0.x:** sections covering installation, usage of beta client APIs, and initial Daml usage patterns based on the contributed implementation.

#### Acceptance Criteria

- Beta client package release tag is publicly installable; CI passes for client + vectors.
- Example integration runs end-to-end from a clean checkout.
- Compatibility report against Splice is committed to the repo.
- A meaningful set of Daml contributions has been submitted upstream and is in review or merged.
- Guide v0.x covers installation, primary HTTP usage flows, and initial Daml usage notes.

---

### Milestone 3 — Stabilization, 1.0 Release, and Integrator's Guide v1.0

**Funding requested:** ~176,000 CC  
**Estimated delivery:** ~3.5 months from kickoff

#### Deliverables

- **1.0 release of the reference client** with documented OpenAPI pin and stable public API.
- **Compatibility matrix** (client version × OpenAPI revision × Splice build) based on a final compatibility run.
- **Upgrade / migration notes** from beta to 1.0.
- **Final round of Daml engineering contributions** submitted upstream. Final summary of contributed work (PRs, status, outcomes) committed to the repo.
- **Integrator's Guide v1.0** as the primary documentation deliverable: end-to-end onboarding, usage patterns, error handling, security expectations (`expectedAdmin`, trust boundaries), operations against the registry HTTP API, on-ledger Daml usage patterns, and references back to the conformance corpus and the contributed implementation.
- **Maintenance plan** for the remainder of the grant period (issue triage, release cadence, security policy).

#### Acceptance Criteria

- 1.0 client release tag is publicly installable, with OpenAPI pin and migration notes documented.
- Compatibility matrix is published in the repo.
- Final summary of Daml contributions is committed to the repo with PR links and status.
- Integrator's Guide v1.0 is published in the repo and links to the client, vectors, and the contributed Daml work.
- Maintenance plan is committed to the repo.

---

## Proposed Scope of Work Estimate

Assumptions:

- Average development rate: **$80/hour**

- Estimated CC conversion rate: **1 CC ≈ $0.15**

- Formula: `Estimated CC = Estimated USD / 0.15`

| Milestone | Description | Estimated Hours | Estimated USD | Estimated CC |

|---:|---|---:|---:|---:|

| 1 | Alpha Client + Initial Conformance + Daml Engineering Foundation | 320h | $25,600 | ~171,000 CC |

| 2 | Beta Client + Conformance Expansion + First Compatibility Run + Daml Engineering Scale-up | 480h | $38,400 | ~256,000 CC |

| 3 | Stabilization, 1.0 Release + Integrator's Guide v1.0 | 330h | $26,400 | ~176,000 CC |

| **Total** |  | **1,130h** | **$90,400** | **~603,000 CC** |

## Recommended Funding Summary

| Category | Hours | USD | CC |

|---|---:|---:|---:|

| Development subtotal | 1,130h | $90,400 | ~603,000 CC |

| Optional 10% contingency | 113h | $9,040 | ~60,000 CC |

| **Total with contingency** | **1,243h** | **$99,440** | **~663,000 CC** |

| **Recommended rounded funding request** |  | **~$99,750 equivalent** | **665,000 CC** |

## Milestone Funding Summary

| Milestone | Description | Funding Requested |

|---:|---|---:|

| 1 | Alpha Client + Initial Conformance + Daml Engineering Foundation | ~171,000 CC |

| 2 | Beta Client + Conformance Expansion + First Compatibility Run + Daml Engineering Scale-up | ~256,000 CC |

| 3 | Stabilization, 1.0 Release + Integrator's Guide v1.0 | ~176,000 CC |

| **Total without contingency** |  | **~603,000 CC** |

| **Recommended total with contingency** |  | **665,000 CC** |

---

## Volatility Stipulation

This proposal is expected to complete within ~3.5 months. Milestone funding is denominated in fixed Canton Coin, and the recipient carries upside and volatility risk.

If delivery extends beyond that window due to committee-requested scope changes or material dependencies outside the proposer's control (including upstream coordination delays in Splice), remaining milestones should be reviewed with the Tech & Ops Committee to account for significant CC/USD volatility.

---

## Delivery Timeline

| Phase | Estimated Timing |
|-------|-----------------|
| Milestone 1 — Alpha Client + Initial Conformance + Daml Foundation | ~6 weeks from kickoff |
| Milestone 2 — Beta + Expanded Conformance + First Compatibility Run + Daml Scale-up | ~2.5 months from kickoff |
| Milestone 3 — Stabilization, 1.0 + Integrator's Guide v1.0 | ~3.5 months from kickoff |

---

## Open Source and Public Good

The entire integration layer — reference client, conformance vectors, compatibility reports, Daml contributions, and the Integrator's Guide — will be published under permissive open-source licensing (Apache 2.0). Daml contributions follow the upstream license of the Splice repository.

This is a public-good infrastructure project. The output is designed to be adopted and maintained by the broader ecosystem, not locked to a single application or vendor. Vectors are intentionally language-agnostic so subsequent ports of the client (Rust, Go, etc.) can reuse the same corpus and continue to converge on consistent behavior.

---

## Dependencies and Assumptions

This proposal assumes:

- The Canton Network Credentials Standard ([#204](https://github.com/canton-foundation/cips/pull/204)) continues progressing toward acceptance. The implementation tracks the CIP/OpenAPI text in force at time of each milestone delivery.
- The Splice implementation ([#3416](https://github.com/hyperledger-labs/splice/pull/3416)) continues to evolve in coordination with the CIP. Daml engineering contributions and compatibility validation track whatever Splice build is current at milestone time.
- The Splice maintainers and the Canton Foundation are open to receiving upstream Daml contributions and integration test additions. Best-effort coordination is assumed; merge / acceptance of any specific PR is **not** a condition for milestone payment.
- No mandatory core protocol changes are required for the implementation.

If OpenAPI revisions, Daml interfaces, or naming conventions change before finalization, the implementation follows the final merged text and ships explicit upgrade notes. Material scope expansion beyond the agreed surfaces would require re-evaluation with the Tech & Ops Committee.

---

## Backward Compatibility

This proposal is entirely additive. Applications that do not adopt the integration layer can continue operating as they do today. Daml contributions are made within the scope of the existing standard interfaces and do not introduce protocol changes. Client releases use semver and explicit OpenAPI pinning.

---

## Security Considerations

The reference client is a client-side tooling package. It does not:

- custody user funds or keys,
- initiate transactions or sign messages,
- operate as a service or daemon,
- require privileged access to any ledger or network component.

Daml contributions stay within the scope of the existing standard interfaces and respect the upstream review process.

The Integrator's Guide includes a section on safe client assumptions (`expectedAdmin`, trust boundaries, package vetting expectations) so integrators can adopt the layer with the right operational posture from day one.

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| Upstream OpenAPI or Daml interfaces evolve during execution | High | Medium | Each milestone pins a specific revision; upgrades shipped as explicit PRs with changelog |
| Splice implementation lands later than expected | Medium | Medium | Compatibility validation is best-effort and non-blocking for payment |
| Daml contributions are not accepted upstream | Medium | Low | Payment tied to submission and review engagement, not merge; rejected work is retained in the public repo as an integration aid |
| Scope creep into protocol-level work | Low | High | Out-of-scope clauses are explicit; any expansion requires a separate proposal |
| Ecosystem prefers a different client language than the one chosen at kickoff | Low | Medium | Vectors are language-agnostic; a second-language port is a candidate for a follow-on grant |
| Integrator's Guide drifts from final client or Daml behavior | Medium | Low | Guide v1.0 is finalized in M3 against the stable 1.0 client, the final compatibility run, and the final state of contributed Daml work |

---

## Co-Marketing and Ecosystem Contribution

Upon release, PixelPlex will collaborate with the Canton Foundation on:

- Coordinated announcement of the reference client, the contributed Daml work, and the Integrator's Guide
- A technical write-up positioned as the recommended integration path for CN Credentials, covering both HTTP and on-ledger surfaces
- Optional developer session or workshop coordinated with the Foundation
- Continued engagement in [PR #204](https://github.com/canton-foundation/cips/pull/204) and related discussions, surfacing any spec-level findings as upstream contributions

---

## Maintenance and Sustainability

All output is published under permissive open-source licensing in public repositories. Within the grant period, PixelPlex maintains the client, the vector catalog, and the Integrator's Guide (security fixes, OpenAPI upgrades, issue triage, doc corrections). PixelPlex also operates the two largest immediate consumers of the standard (CCView and Console Wallet), which gives the project a continued real-world incentive to keep the integration layer working and current.

Daml contributions live upstream in Splice once accepted, where they are maintained by the Splice team under the existing maintenance arrangements. Contributions that remain in our repo are maintained by PixelPlex for the grant period.

Beyond the grant, the artifacts are structured so that any maintainer can take them over, and a continuation grant can be evaluated based on demonstrated usage and ecosystem demand.

---

## Rationale

**Why a full integration layer.**  
The HTTP layer alone solves only half of the adoption problem — applications also need to interact with credentials on-ledger. Adding parallel Daml engineering capacity, alongside the off-ledger client and conformance work, lets one coherent grant deliver the whole end-to-end picture instead of scattering it across multiple smaller efforts.

**Why include Daml work alongside the integration layer.**  
The Splice team owns the core Daml implementation. This proposal adds parallel engineering capacity to the same work — additional code, additional validation, additional test coverage — submitted upstream as contributions. The two efforts are complementary: more hands on the same goal, not a separate or competing track.

**Why fund this through the Development Fund.**  
The output is open, reusable, and beneficial to multiple teams — not just one application. CIP-0082 explicitly names dev tools, reference implementations, and public-good infrastructure as fund targets. This proposal fits that mandate directly.

**Why not let each team implement independently.**  
Independent implementations create inconsistent behavior, higher integration costs, and more support load on core maintainers. A shared reference under a permissive license, validated against the real Splice implementation and complemented by upstream Daml contributions, is the most scalable path to ecosystem-wide adoption.

**Why PixelPlex.**  
PixelPlex operates CCView and Console Wallet — two of the primary consumers of this standard — and is already engaged in the review of PR #204. PixelPlex is also the author of CIP #169 (Party Profile Credentials), which builds on top of the Canton Network Credentials Standard, so the team has an ongoing interest in keeping this integration layer healthy beyond the grant period.

