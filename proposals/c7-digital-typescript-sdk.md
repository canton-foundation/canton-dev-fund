---
Author: Leonid Rozenberg (leo@c7.digital), C7
Status: Ready
Created: 2026-04-22
Label: canton-apis, daml-tooling
Champion: hrischuk-da
RFP: "#17 — SDKs in different languages (standard)"
---

# Development Fund Proposal: @c7-digital TypeScript SDK for Canton JSON API v2

## Abstract

C7 requests Development Fund support for the ongoing maintenance and development of three open-source TypeScript libraries — `@c7-digital/ledger`, `@c7-digital/react`, and `@c7-digital/scribe` — that enable TypeScript/JavaScript developers to build applications against the Canton JSON Ledger API v2. These libraries fill a critical ecosystem gap: Digital Asset's `@daml/ledger` and `@daml/react` packages are no longer supported and incompatible with Canton 3.x. C7 has already built and published working replacements targeting Canton 3.4.9. This grant funds continued maintenance, feature development, and community adoption work across a 12-month period.

---

## RFP Mapping

This proposal responds to **RFP #17 — "SDKs in different languages (standard)"** (Developer Experience, Tooling & Education) — the TypeScript equivalent of the funded Rust SDK grant ([PR #407](https://github.com/canton-foundation/canton-dev-fund/pull/407)). Per that RFP, the four items each SDK proposal must identify:

| RFP #17 requirement | This proposal |
| --- | --- |
| Target language | TypeScript / JavaScript |
| Intended developer audience | Web and fintech dApp developers on Canton (browser and Node.js) |
| APIs / workflows covered | Canton JSON Ledger API v2 — query, create, exercise, WebSocket streaming, user management |
| How compatibility is maintained | The version-tracking SLA in the Maintenance phase (patch/minor ≤ 4 weeks, major ≤ 8 weeks) plus a public compatibility matrix |

The ecosystem gap this fills and its adoption impact are detailed under [Motivation](#motivation); adoption is gated per phase on verifiable external use.

---

## Specification

### 1. Objective

TypeScript and JavaScript are the dominant languages for web and fintech application development. Yet today there is no actively maintained, officially supported TypeScript client for the Canton JSON Ledger API v2. Digital Asset's published packages `@daml/ledger` and `@daml/react` — previously the standard for Daml/Canton TypeScript development — have not been updated to support Canton 3.4 and the redesigned v2 JSON API. Any TypeScript developer targeting a modern Canton node has no supported path forward without significant reverse-engineering.

C7 stepped in to fill this gap. The `c7_ledger` monorepo (https://github.com/C7-Digital/c7_ledger) provides three complementary packages that together cover the full TypeScript developer workflow: a runtime ledger client, React integration hooks, and a build tool for transforming DAML codegen output. All are Apache-2.0 licensed, already published to npm, and tracking Canton SDK releases. This grant enables us to sustain and grow this work as public infrastructure for the Canton ecosystem.

### 2. Implementation Mechanics

The monorepo contains three packages:

**`@c7-digital/ledger`** — A fully type-safe TypeScript client for the Canton JSON Ledger API v2. Type definitions are auto-generated from the Canton OpenAPI specification. Provides `ledger.query()`, `ledger.create()`, and `ledger.exercise()` methods with updated signatures matching the v2 API (`actAs` parameter, revised response shapes). Direct replacement for `@daml/ledger`. Currently targeting Canton 3.4+.

**`@c7-digital/react`** — React hooks for Daml ledger integration via the Canton JSON API v2. Includes `useQuery`, `useLedger`, `useUser`, and `useStreamQuery` hooks, with real-time WebSocket streaming for contract updates. Direct replacement for `@daml/react`. Applications wrap with the `DamlLedger` provider.

**`@c7-digital/scribe`** — A build tool that transforms raw DAML codegen output (`dpm codegen-js`) into clean, modern ESM TypeScript packages usable with `@c7-digital/ledger`. Handles: CJS-to-ESM conversion via Rollup, global `damlTypes.registerTemplate()` bypass with a version-aware registry, `@daml/ledger` side-effect import removal, multi-DAR package unification into a single entry point, `.d.ts` self-reference resolution, and a companion Vite plugin for consuming applications.

Funded work over 12 months covers:

- **Stable 1.0 releases** of all three packages with comprehensive test suites and full API documentation
- **Canton SDK version tracking** — updating packages within 4 weeks of Canton patch/minor releases, 8 weeks of major releases
- **Developer experience improvements** — expanded scribe scenarios, getting-started guides, and sample applications
- **Community engagement** — issue triage, PR review, blog posts, integration guides for Next.js and Vite, and outreach to Canton developers building with TypeScript

### 3. Architectural Alignment

These libraries operate entirely at the application layer over the Canton JSON Ledger API v2 — the HTTP/WebSocket interface Canton nodes expose for application integration. They introduce no changes to the Canton protocol, the Daml compiler, or node operation. They are the TypeScript equivalent of what a Java or Python SDK provides in other ecosystems.

This work falls within the Development Fund's mandate under CIP-0082 and CIP-0100 as developer tooling and critical ecosystem infrastructure. The JSON API v2 is Canton's primary integration surface for web and application developers. Without a maintained TypeScript client, this surface is effectively inaccessible to the majority of web developers.

### 4. Backward Compatibility

No backward compatibility impact on the Canton protocol or existing node deployments. These are purely additive application-layer libraries. Migration from `@daml/ledger` / `@daml/react` requires updating method call signatures to match the v2 API (principally adding `actAs` parameters); a migration guide will be published as part of Phase 1 (Stabilization).

### 5. Ledger Client Standard Alignment

RFP #17 asks SDK proposals to follow the Canton ledger client standard (the common-interface standard the Foundation is moving into the docs). `@c7-digital/ledger` already exposes the core client surface (`query`, `create`, `exercise`, streaming, user management) over the JSON Ledger API v2. As a Phase 1 (Stabilization) deliverable, C7 will map it to the ledger client standard's common interface, publish the mapping, and track any deltas as issues.

`@c7-digital/scribe` (the codegen build tool) is scoped under this SDK proposal as the pipeline that feeds the client, not split out. Should the Foundation prefer DPM-native codegen, `scribe` is a natural future DPM component (RFP #19) — noted as a direction, not part of this grant.

---

## Milestones and Deliverables

The grant runs over 12 months in three phases: Stabilization, Adoption, and Maintenance. Funding weights the Adoption phase at 50%, in line with the Development Fund's emphasis on verifiable ecosystem value.

### Phase 1 — Stabilization (T+3 months)

**Focus:** Production-ready 1.0 releases of all three packages, with documentation and a migration guide.

**Deliverables / Value Metrics:**
- Published `1.0.0` releases of `@c7-digital/ledger`, `@c7-digital/react`, and `@c7-digital/scribe` on npm
- Test suite with >80% coverage for `@c7-digital/ledger`; integration tests for `@c7-digital/react`
- Full API documentation for all three packages published to a public documentation site
- Migration guide from `@daml/ledger` / `@daml/react` to the `@c7-digital` equivalents
- Mapping of `@c7-digital/ledger` to the Canton ledger client standard's common interface, published, with any deltas tracked as issues
- Compatibility verified and documented for Canton 3.4.x
- Adoption gate: at least 2 external developers (verifiable by GitHub login, not affiliated with C7) open an issue, PR, or discussion post on https://github.com/C7-Digital/c7_ledger

### Phase 2 — Adoption (T+9 months)

**Focus:** Drive and verify external production adoption. This phase carries 50% of the funding. It is released against the tiered adoption gates below.

**Deliverables / Value Metrics:**
- `@c7-digital/scribe` expanded to handle complex multi-DAR compositions
- Integration guides for Next.js and Vite, plus a developer workshop or office-hours session (joint with the Foundation)
- Adoption gate, tier 1: at least 2 external teams build a package with `@c7-digital/scribe` against their own DAR, *or* run `@c7-digital/*` on Canton mainnet in a named application, with external reported evidence
- Adoption gate, tier 2: at least 5 public dependents on `@c7-digital/ledger`, verifiable at https://github.com/C7-Digital/c7_ledger/network/dependents and https://www.npmjs.com/package/@c7-digital/ledger?activeTab=dependents
- Adoption gate, tier 3 (target): 20 distinct public dependents across the cumulative `@c7-digital/ledger`, `@c7-digital/scan`, and `@c7-digital/react` libraries

### Phase 3 — Maintenance (T+12 months)

**Focus:** Sustained Canton SDK version tracking and the sustainability handoff. The version-tracking SLA runs from Phase 1 onward; this phase verifies it across the full grant and pays on that record.

**Deliverables / Value Metrics:**
- Compatible package releases within SLA for every Canton SDK release during the grant (patch/minor: 4 weeks; major: 8 weeks)
- Public Canton SDK compatibility matrix maintained on the repository
- Issue response time <5 business days for community-submitted GitHub issues
- Security and dependency updates applied across all three packages
- A named maintainer outside C7 identified and onboarded (sustainability requirement under CIP-0100)
- End-of-grant public report submitted to the Canton Foundation summarizing scorecard history, issues resolved, Canton SDK version compatibility achieved, named external adopters, lessons learned, and the post-grant maintenance plan

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- All three packages published to npm at `1.0.0` or later with stated Canton SDK compatibility
- Test coverage thresholds met and CI passing on public repository
- Documentation site live and migration guide published (Phase 1 — Stabilization)
- Adoption gates met, with at least 50% of funding tied to verified external adoption (Phase 2 — Adoption)
- Canton SDK compatibility releases published within stated SLAs throughout the grant period (Phase 3 — Maintenance)
- End-of-grant report delivered (Phase 3 — Maintenance)
- All code open-source under Apache-2.0 and publicly accessible throughout

---

## Funding

**Total Funding Request: 4,000,000 CC**

### Payment Breakdown by Phase

- Phase 1 — Stabilization: 1,000,000 CC (25%) upon committee acceptance of the phase deliverables
- Phase 2 — Adoption: 2,000,000 CC (50%) upon committee acceptance of the phase deliverables and adoption gates
- Phase 3 — Maintenance: 1,000,000 CC (25%) upon committee acceptance of the phase deliverables

### Volatility Stipulation

This proposal covers a 12-month period. Should the project timeline extend beyond 12 months due to Committee-requested scope changes, any remaining milestone payments may be renegotiated to account for USD/CC price volatility.

---

## Co-Marketing

Upon Phase 1 (Stabilization) completion, C7 will collaborate with the Foundation on:

- Announcement positioning `@c7-digital/ledger` and `@c7-digital/react` as the Foundation-endorsed TypeScript SDK for Canton JSON API v2
- Developer workshop or office hours session for TypeScript developers building Canton applications

---

## Motivation

**The abandoned SDK problem.** When Digital Asset stopped supporting `@daml/ledger` and `@daml/react`, developers targeting Canton 3.x discovered the incompatibility by attempting to upgrade. The v2 JSON API introduced meaningful changes — revised response shapes, new `actAs` semantics, WebSocket streaming — that make a simple version bump insufficient. Without intervention, the TypeScript ecosystem for Canton effectively ceased to exist.

**TypeScript is not optional.** Web application development — including fintech applications — is overwhelmingly TypeScript/JavaScript. The Canton ecosystem cannot grow its application developer base if the primary web development language lacks a supported integration path. Every Canton dApp targeting a browser or Node.js backend requires a solution to this problem.

**C7 has already done the work.** The `c7_ledger` monorepo is not a proposal to build something new — it is a request to sustain and grow something that already exists and works. We have 170+ commits, working npm packages, and production experience building Canton applications with these libraries. Development Fund support would allow us to make a long-term commitment to maintenance, documentation, and community growth rather than treating this as a side effort.

**Effort estimate.** The 12-month scope is sized at roughly 1 FTE (2,000 engineer hours) across the three packages: ~500 hours on `@c7-digital/ledger` (JSON API v2 tracking, AJV regeneration, WebSocket reliability), ~500 hours on `@c7-digital/react` and ~200 `@c7-digital/scribe`, ~300 hours on docs / migration guides / examples, ~300 hours on issue triage and external-contributor support, and ~200 hours on release engineering and coordination with the Foundation. The libraries comprise roughly 5,800 lines of source today; the per-package hours are sized against the actual quarterly rhythm of Canton SDK bumps, each of which touches the OpenAPI spec, AJV validation, and the downstream `splice-codegen`.

---

## Rationale

**Why three packages.** The toolchain mirrors what `@daml/ledger` + `@daml/react` provided, plus adds `@c7-digital/scribe` to address the codegen pipeline that was previously ad-hoc or missing. Splitting them as separate npm packages allows teams to adopt only what they need (e.g., non-React projects can use `@c7-digital/ledger` alone).

**Why JSON API v2, not gRPC.** The Canton JSON Ledger API v2 is the intended integration surface for application developers. The gRPC Ledger API is lower-level and better suited for infrastructure tooling. All modern Canton documentation and tooling points application developers toward the JSON API.

**Differentiation from the wallet and dApp SDKs.** The distinction from the Canton Network dApp SDK ([PR #69](https://github.com/canton-foundation/canton-dev-fund/pull/69)), PartyLayer ([PR #9](https://github.com/canton-foundation/canton-dev-fund/pull/9)), and dAppBooster is the layer each occupies. The dApp SDK and PartyLayer are CIP-0103 wallet-connectivity SDKs: they standardize how a dApp discovers a wallet, connects to it, and requests a signature. dAppBooster is a local development scaffold — a LocalNet bundle with a starter frontend and a quickstart DAR — not a published, versioned runtime library. None of the three is a maintained client for the JSON Ledger API v2 with typed query/create/exercise calls, React data and streaming hooks, and a DAML codegen pipeline. `@c7-digital/*` is exactly that layer — the replacement for the deprecated `@daml/ledger` and `@daml/react` — and it sits below the wallet SDKs, which build on top of it. The two stack rather than overlap: C7's own production applications consume the Digital Asset dApp SDK (`@canton-network/dapp-sdk`) for wallet signing alongside `@c7-digital/ledger` for ledger reads and command assembly. Lastly, `@c7-digital/*` libraries support web and server clients that do NOT use the wallet ad dApp stack as is necessary for service operators.

**Differentiation from related proposals.** The existing `proposal-daml-open-source.md` covers maintenance of the legacy `daml` repository, which contains TypeScript bindings targeting the older Ledger API v1 — not compatible with the Canton v2 JSON API. This proposal is specifically scoped to the modern v2 interface.
