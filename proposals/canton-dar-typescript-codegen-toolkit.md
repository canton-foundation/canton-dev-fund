## Development Fund Proposal

**Author:** Srikanth <srikanth@bitdynamics.me>  
**Status:** Submitted  
**Created:** 2026-03-11  

---

## Abstract

This proposal is for a focused open-source developer tool that reads a compiled `.dar` and generates a TypeScript package with package IDs, template IDs, choice names, and a manifest file for drift checks.

The problem it addresses is practical and recurring. Teams often complete `daml build` and then still have to inspect the `.dar`, extract identifiers by hand, wire them into application code, and repeat that work after upgrades. That step rarely gets treated as a product in its own right, but it is a real source of fragile integrations and release risk.

The goal is not to build another broad SDK. The goal is to make the contract-to-application handoff predictable for TypeScript teams building on Canton.

---

## Specification

### 1. Objective

The gap this proposal targets sits between contract compilation and application integration.

That gap is easy to miss because each individual step looks small. In practice, it becomes a repeated source of glue code, local scripts, and upgrade-time mistakes. This proposal treats that handoff as a first-class developer workflow instead of leaving it to each team to solve privately.

Once a team has a `.dar`, there is still manual work that often ends up spread across scripts, frontend code, or middleware:

- finding the current package ID
- building full template identifiers
- tracking choice names against those templates
- updating hardcoded values after a rebuild
- adding ad hoc checks so stale generated values do not reach deployment

That work is repetitive and error-prone. It also tends to become invisible technical debt because it lives in application setup code rather than in a reusable tool.

The intended outcome is a small but opinionated tool with a predictable workflow:

1. build the `.dar`
2. run one generator command
3. import generated identifiers from a single place
4. run a CI check that fails when generated output is stale

This proposal stays intentionally narrow so that the deliverables remain easy to verify, easy to adopt, and realistic to deliver within a grant milestone structure.

### 2. Implementation Mechanics

The project will be delivered as:

- a CLI: `canton-dar-ts`
- a generated TypeScript output format
- a small helper package for consuming the generated output

#### What the tool will do

The CLI will inspect a `.dar` and generate a TypeScript package containing:

- `packageIds.ts`
- `templates.ts`
- `choices.ts`
- `manifest.json`
- `index.ts`

The generated output will give application teams a single source of truth for:

- the current package ID
- full template identifiers
- choice names associated with those templates

The CLI will support a small set of commands:

- `canton-dar-ts inspect --dar .daml/dist/app.dar`
- `canton-dar-ts generate --dar .daml/dist/app.dar --out ./generated/canton`
- `canton-dar-ts check --dar .daml/dist/app.dar --out ./generated/canton`
- `canton-dar-ts diff --dar .daml/dist/app.dar --against ./generated/canton/manifest.json`

`generate` writes the files.  
`check` fails if committed generated output is stale.  
`diff` gives a readable comparison when identifiers change.

#### What the helper package will do

The helper package will stay small. It is meant to make the generated output easier to use, not to introduce another large dependency surface. It will provide:

- lookup helpers around the generated registries
- stable error messages when a template or choice cannot be found
- a thin manifest consistency check for runtime use

It will not try to become a full transport client, wallet layer, or indexing SDK.

#### What the tool will not do

To keep the scope realistic, this proposal does not include:

- wallet integration
- signing flows
- transport abstractions
- frontend framework bindings
- hosted infrastructure
- broad runtime decoding across every Canton read path

#### Relationship to Existing Tooling

| Existing Tool | What It Does | Toolkit Relationship |
|---|---|---|
| `daml build` / `dpm` | Builds DARs and supports core Daml workflows | This proposal starts after the DAR exists. |
| Existing Daml JS codegen | Generates language bindings | This proposal focuses on registry generation and drift checks. |
| CIP-103 dApp SDK / wallet tooling | Wallet connectivity and signing | No overlap in scope. |
| JSON API / PQS clients | Read-path access | This proposal does not replace them. It provides safer generated identifiers to use with them. |

### 3. Architectural Alignment

This work aligns with Canton in a straightforward way.

- It addresses a concrete problem surfaced in the recent Canton developer research.
- It improves the contract-to-application handoff without changing Canton protocol behavior.
- It is a shared developer tool rather than a private application feature.
- It fits the public-good category because the same identifier drift problem appears across teams.

The proposal is also intentionally smaller than the wallet SDK and broader language SDK efforts already under discussion. That is a feature, not a limitation. It focuses on one integration step, aims to do it well, and leaves adjacent concerns out of scope.

### 4. Backward Compatibility

No backward compatibility impact.

This is an external tool. Teams can adopt it gradually or ignore it entirely.

---

## Milestones and Deliverables

### Milestone 1: Public Alpha for DAR Inspection and TypeScript Generation

A new TypeScript team can point the CLI at a compiled `.dar` and generate deterministic TypeScript outputs from published documentation alone.

### Milestone 2: Evaluation-Ready Integration Workflow

The generated output, helper package, and reference integration demonstrate replacement of hand-maintained identifiers and provide a documented upgrade and diff workflow for DAR rebuilds.

### Milestone 3: Hardened CI-Ready Release

`check` mode, readable `diff` output, migration guidance, and release documentation are hardened through documented evaluation feedback and clean-environment reruns.

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone  
- The CLI can read a `.dar` and generate the documented TypeScript outputs  
- Repeated runs against the same `.dar` produce stable output  
- `check` mode fails when generated output is stale  
- The example integration demonstrates removal of hand-maintained identifiers from application code  
- Documentation and knowledge transfer provided  
- Alignment with the stated value metrics: less manual identifier management and safer upgrades  

Project-specific acceptance conditions:

- The tool must stay scoped to generation, registry lookup, and drift detection
- The project must be released as open source
- The generated output must compile under modern strict TypeScript settings

---

## Funding

**Total Funding Request:** 330,000 CC

### Payment Breakdown by Milestone

- Milestone 1 _(DAR Inspection and TypeScript Generation)_: 120,000 CC upon committee acceptance  
- Milestone 2 _(Minimal Helper Package and Example Integration)_: 120,000 CC upon committee acceptance  
- Milestone 3 _(CI Workflow, Hardening, and Documentation)_: 90,000 CC upon final release and acceptance  

### Volatility Stipulation

If the project duration is **under 6 months**:  
Should the project timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility.

---

## Co-Marketing

Upon release, the implementing entity will collaborate with the Foundation on:

- Announcement coordination  
- A short technical write-up showing the generator workflow  
- One developer-facing walkthrough, demo, or office-hours-style session  

Specific commitments:

- publish a migration guide for teams using hardcoded package or template identifiers
- provide a small example repository layout or example app folder structure

---

## Motivation

This proposal is valuable because it focuses on a real integration problem that frequently sits outside the headline tooling discussions.

Much of the conversation around developer experience centers on wallets, explorers, dashboards, and IDE-like tooling. Those are important, but teams also lose time on smaller pieces of glue work that are repeated from project to project. DAR inspection and identifier management is one of those pieces.

The Canton developer research called out this exact problem: teams manually extract hash strings from compiled artifacts and carry them through frontend and middleware code by hand. That is not just inconvenient. It creates a weak point in the path from smart contract changes to application releases.

A modest tool that removes that step will not solve every DevEx problem in Canton, but it can remove one recurring source of friction across multiple teams without requiring a large platform effort.

If the tool is successful, the payoff is simple:

- less repeated glue code
- fewer stale identifier mistakes during upgrades
- a cleaner handoff from compiled contracts to TypeScript application code

That is a limited goal, but it is the kind of limited goal that improves day-to-day developer experience in a concrete way.

---

## Rationale

This is the right scope because it is small enough to deliver cleanly and still broad enough to be reused by multiple teams.

A broader version of this idea could include larger runtime helpers, more read-path integrations, or framework-specific layers. Those pieces were intentionally left out for two reasons:

1. they start to overlap with existing SDK efforts
2. they make milestone verification less crisp

The narrower version is easier to evaluate and easier to trust. Either the generator exists and produces stable files, or it does not. Either the CI check catches drift, or it does not. Either the example integration removes hardcoded identifiers, or it does not.

That keeps the proposal grounded in concrete deliverables instead of broader platform claims, while still addressing a problem that shows up repeatedly in real Canton application work.
