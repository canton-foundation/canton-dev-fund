---
Author: Leonid Rozenberg (leo@c7.digital), C7
Status: Ready
Created: 2026-04-22
Label: canton-apis, daml-tooling
Champion: hrischuk-da
---

# Development Fund Proposal: @c7-digital TypeScript SDK for Canton JSON API v2

## Abstract

C7 requests Development Fund support for the ongoing maintenance and development of three open-source TypeScript libraries — `@c7-digital/ledger`, `@c7-digital/react`, and `@c7-digital/scribe` — that enable TypeScript/JavaScript developers to build applications against the Canton JSON Ledger API v2. These libraries fill a critical ecosystem gap: Digital Asset's `@daml/ledger` and `@daml/react` packages are no longer supported and incompatible with Canton 3.x. C7 has already built and published working replacements targeting Canton 3.4.9. This grant funds continued maintenance, feature development, and community adoption work across a 12-month period.

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

No backward compatibility impact on the Canton protocol or existing node deployments. These are purely additive application-layer libraries. Migration from `@daml/ledger` / `@daml/react` requires updating method call signatures to match the v2 API (principally adding `actAs` parameters); a migration guide will be published as part of Milestone 1.

---

## Milestones and Deliverables

### Milestone 1: Stable 1.0 Release (T+3 months)

**Focus:** Production-ready releases of all three packages with documentation and migration guide.

**Deliverables / Value Metrics:**
- Published `1.0.0` releases of `@c7-digital/ledger`, `@c7-digital/react`, and `@c7-digital/scribe` on npm
- Test suite with >80% coverage for `@c7-digital/ledger`; integration tests for `@c7-digital/react`
- Full API documentation for all three packages published to a public documentation site
- Migration guide from `@daml/ledger` / `@daml/react` to `@c7-digital` equivalents
- Compatibility verified and documented for Canton 3.4.x

### Milestone 2: SDK Version Tracking + DX Improvements (T+3 to T+9 months)

**Focus:** Keep pace with Canton SDK releases; expand scribe and add tooling.

**Deliverables / Value Metrics:**
- Compatible package releases within SLA for all Canton SDK releases during the period (patch/minor: 4 weeks; major: 8 weeks)
- Public Canton SDK compatibility matrix maintained on the repository
- `@c7-digital/scribe` expanded to handle complex multi-DAR compositions and advanced dependency graphs
- Getting-started guide and sample end-to-end TypeScript Canton application published
- Issue response time <5 business days for community-submitted GitHub issues

### Milestone 3: Community Growth and Ecosystem Integration (T+9 to T+12 months)

**Focus:** Broadening adoption; integration guides; external developer engagement.

**Deliverables / Value Metrics:**
- At least two technical blog posts on building Canton applications with TypeScript, co-promoted with the Foundation
- Documented engagement with at least three external Canton developer teams; feedback incorporated into package releases and project maintainer identified outside of C7
- Weekly downloads on https://www.npmjs.com/package/@c7-digital/ledger reaches 1,000 (for reference, `@daml/types` is approximately 7,000/week at time of writing)
- End-of-grant public report submitted to the Canton Foundation summarizing npm download statistics, issues resolved, Canton SDK version compatibility achieved, lessons learned, and future project oversight plan

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- All three packages published to npm at `1.0.0` or later with stated Canton SDK compatibility
- Test coverage thresholds met and CI passing on public repository
- Documentation site live and migration guide published (Milestone 1)
- Canton SDK compatibility releases published within stated SLAs throughout the grant period (Milestone 2)
- Blog posts, integration guides, and end-of-grant report delivered (Milestone 3)
- All code open-source under Apache-2.0 and publicly accessible throughout

---

## Funding

**Total Funding Request: 3,000,000 CC**

### Payment Breakdown by Milestone

- Milestone 1 (Stable 1.0 Release): 1,000,000 CC upon committee acceptance
- Milestone 2 (SDK Tracking + DX): 1,000,000 CC upon committee acceptance
- Milestone 3 (Community Growth): 1,000,000 CC upon committee acceptance

### Volatility Stipulation

This proposal covers a 12-month period. Should the project timeline extend beyond 12 months due to Committee-requested scope changes, any remaining milestone payments may be renegotiated to account for USD/CC price volatility.

---

## Co-Marketing

Upon Milestone 1 completion, C7 will collaborate with the Foundation on:

- Announcement positioning `@c7-digital/ledger` and `@c7-digital/react` as the Foundation-endorsed TypeScript SDK for Canton JSON API v2
- Developer workshop or office hours session for TypeScript developers building Canton applications

---

## Motivation

**The abandoned SDK problem.** When Digital Asset stopped supporting `@daml/ledger` and `@daml/react`, developers targeting Canton 3.x discovered the incompatibility by attempting to upgrade. The v2 JSON API introduced meaningful changes — revised response shapes, new `actAs` semantics, WebSocket streaming — that make a simple version bump insufficient. Without intervention, the TypeScript ecosystem for Canton effectively ceased to exist.

**TypeScript is not optional.** Web application development — including fintech applications — is overwhelmingly TypeScript/JavaScript. The Canton ecosystem cannot grow its application developer base if the primary web development language lacks a supported integration path. Every Canton dApp targeting a browser or Node.js backend requires a solution to this problem.

**C7 has already done the work.** The `c7_ledger` monorepo is not a proposal to build something new — it is a request to sustain and grow something that already exists and works. We have 170+ commits, working npm packages, and production experience building Canton applications with these libraries. Development Fund support would allow us to make a long-term commitment to maintenance, documentation, and community growth rather than treating this as a side effort.

---

## Rationale

**Why three packages.** The toolchain mirrors what `@daml/ledger` + `@daml/react` provided, plus adds `@c7-digital/scribe` to address the codegen pipeline that was previously ad-hoc or missing. Splitting them as separate npm packages allows teams to adopt only what they need (e.g., non-React projects can use `@c7-digital/ledger` alone).

**Why JSON API v2, not gRPC.** The Canton JSON Ledger API v2 is the intended integration surface for application developers. The gRPC Ledger API is lower-level and better suited for infrastructure tooling. All modern Canton documentation and tooling points application developers toward the JSON API.

**Differentiation from related proposals.** The existing `proposal-daml-open-source.md` covers maintenance of the legacy `daml` repository, which contains TypeScript bindings targeting the older Ledger API v1 — not compatible with the Canton v2 JSON API. This proposal is specifically scoped to the modern v2 interface.
