## **Development Fund Proposal**

**Author:** Moonsong Labs
**Status:** Submitted
**Created:** 2026-03-19
**Updated:** 2026-07-02
**Label:** daml-tooling
**Champion:** Curtis Hrischuk

---

## **Abstract**

Git-Based DAR Dependencies for `dpm` proposes a targeted enhancement to Digital Asset’s `dpm` CLI: support for resolving Daml dependencies from Git-hosted prebuilt DARs.

Today, Daml projects can depend on SDK-provided packages, packages published in an OCI registry, and local DAR files. Custom, external DAR dependencies are often handled through manual downloads, checked-in artifacts, or project-specific scripts. This proposal adds upstream `dpm` support for declaring Git-hosted prebuilt DARs in project configuration, resolving and pinning them through the existing `dpm` dependency pipeline, and making them available to `damlc` through the same resolution mechanism used for OCI dependencies.

The result is a more repeatable dependency workflow for Canton/Daml projects without introducing a separate application CLI, hosted package registry, or package marketplace.

---

## **Specification**

### **1. Objective**

This proposal addresses friction in Canton/Daml development caused by manual handling of external DAR dependencies.

Daml projects can already depend on SDK-provided packages such as `daml-prim`, `daml-stdlib`, and `daml-script`, packages published in an OCI registry, and local DAR files through existing dependency configuration. However, when projects rely on external DARs that are not available through those means, teams often use custom scripts, checked-in artifacts, or manually managed paths to make those dependencies available across local and CI environments.

The intended outcome is an upstream `dpm` enhancement that lets Daml projects reference Git-hosted prebuilt DARs in project configuration. `dpm` resolves those references into cached local DARs, records the resolved state, and exposes the cached DAR paths to `damlc` through the standard resolution flow.

### **2. Implementation Mechanics**

This proposal requires direct changes to the `dpm` codebase and coordination with the Daml team.

The work extends `dpm` so Daml projects can declare Git-hosted prebuilt DAR dependencies in `daml.yaml` in a way that aligns with the existing OCI dependency model. `dpm` parses, fetches, caches, pins, and resolves those dependencies, then provides resolved local DAR paths to `damlc` through the existing resolution mechanism.

#### **Proposed Git-based dependency pattern**

Git-hosted DARs can be declared in both `dependencies` and `data-dependencies`, reflecting the current Daml dependency model. This preserves today’s distinction between regular `dependencies` and `data-dependencies`, including cases where a DAR should be consumed with `data-dependency` semantics. Resolved artifacts will be made available through `resolved-dependencies` and `resolved-data-dependencies` as appropriate.

```yaml
dependencies:
  - daml-prim
  - daml-stdlib
  - daml-script
  - git:github.com/example-org/example-repo.git#main?path=packages/loyalty/loyalty-1.0.0.dar
```

The initial implementation will support HTTPS Git repositories with explicit refs and repo-relative DAR paths. During install, `dpm` fetches the repository, locates the specified DAR, stores it in the local cache, and pins branch or tag refs to resolved commit SHAs.

During build, test, IDE, and multi-package workflows, `dpm` provides `damlc` with resolved local DAR paths through the existing resolution mechanism. `damlc` continues to work with local DAR files and does not perform Git network operations.

#### **Scope limits**

The initial scope intentionally excludes a hosted registry, package index, package marketplace, and package discovery. These areas may be valuable follow-on work (see Future Work section) but they are not part of this proposal’s committed scope.

### **3. Architectural Alignment**

This proposal aligns with Canton ecosystem priorities by extending existing `dpm` capabilities rather than introducing a separate application CLI or package-management tool. It improves the developer experience where `dpm` is already the natural entry point: Daml project configuration and dependency handling.

Architecturally, the work fits inside the existing Daml SDK / `dpm` workflow. Git-hosted DARs follow the existing remote-dependency architecture used for OCI: `dpm` resolves remote artifacts and `damlc` consumes resolved local DAR paths.

The proposal does not require Canton protocol changes, new node infrastructure, LocalNet orchestration, deployment tooling, or a network-wide package registry. It is a targeted extension to existing developer tooling.

Relevant governance alignment:

- CIP-0082: Development Fund support for common-good ecosystem development
- CIP-0100: milestone-based funding and transparent review process

### **4. Backward Compatibility**

*No backward compatibility impact.*

This work is additive. Existing `daml.yaml`, SDK-provided dependencies, local DAR dependencies, and standard `dpm` commands continue to work as they do today.

---

## **Milestones and Deliverables**

### **Milestone 1: Design, Implementation, and Upstream PR**

- **Delivery Effort / Status:** 1 month of work; substantially complete and ready for review.
- **Focus:** Complete the technical design, implement Git-based DAR dependency resolution, and submit the upstream `dpm` contribution.
- **Deliverables / Value Metrics:**
    - documented technical design for Git-based DAR dependencies in `dpm`
    - implementation of `dpm install` and resolution support for public HTTPS Git repositories
    - support for Git references such as branch, tag, or commit SHA, with branch or tag refs pinned to commit SHAs
    - basic tests covering supported Git dependency resolution paths and failure cases
    - upstream PR or agreed contribution branch submitted to the `dpm` repository

### **Milestone 2: Review Feedback and Merge Readiness**

- **Estimated Delivery:** 2 weeks after Milestone 1
    - **External Dependency:** This milestone depends on timely review feedback from the Daml / `dpm` maintainers. If maintainer review is delayed, the delivery timeline may be impacted.
- **Focus:** Incorporate review feedback from the Daml / `dpm` maintainers and update the contribution for final maintainer review.
- **Deliverables / Value Metrics:**
    - maintainer feedback addressed on the upstream `dpm` PR or agreed contribution branch
    - updated implementation, tests, and documentation based on review comments
    - updated reference project showing Git-hosted DAR dependency resolution using representative Splice DARs stored in Git, without custom download scripts
    - contribution ready for merge or accepted through the agreed upstream process

### **Milestone 3: Ecosystem Validation and Enablement**

- **Estimated Delivery:** 1 month after Milestone 2
- **Focus:** Validate the completed Git dependency workflow with ecosystem developers and publish lightweight adoption materials.
- **Deliverables / Value Metrics:**
    - at least 3 organizations, projects, or ecosystem teams have used the Git dependency workflow with adoption evidenced by written confirmation, successful demo runs, supportive comments or open issues on the project repository, or other Committee-verifiable artifacts
    - documentation updates based on validation feedback, including any remaining limitations or follow-up items
    - 1 recorded demo or walkthrough showing a Daml project resolving a Git-hosted DAR dependency through `dpm install` and the normal `dpm build` workflow
    - 1 short technical writeup or case study explaining the workflow and its value for Canton/Daml developers
    - optional live walkthrough or office-hours session for interested ecosystem developers, coordinated with the Canton Foundation if useful

### **Post-Completion: Ongoing Maintenance**

Given the role of `dpm` as shared developer tooling, maintenance may become important as Canton/Daml SDK behavior evolves. Ongoing maintenance is not in scope for this proposal, but Moonsong Labs would be available to discuss a separate maintenance agreement if the feature sees meaningful ecosystem adoption.

---

## **Acceptance Criteria**

Project-specific acceptance conditions:

- Developers can declare Git-hosted DAR dependencies in `daml.yaml` using `dependencies`.
- `dpm install package` / `dpm install` can fetch, cache, and pin supported Git-hosted DAR dependencies.
- `dpm build` can compile a package using the resolved Git-hosted DAR dependencies through the normal Daml build workflow.
- `dpm test` works with Git-hosted DAR dependencies, including test dependency workflows.
- `dpm add dar` supports adding GitHub HTTPS DAR references and inserts the resolved dependency into `daml.yaml`.
- `dpm update` can resolve supported HTTPS artifact references to pinned SHA references.
- Git-hosted DARs can be resolved from both `dependencies` and `data-dependencies`.
- Repository aliasing is supported for repeated DAR references from the same source.
- Documentation explains the required Git dependency syntax, including any limitations.
- A reference or representative project demonstrates the workflow replacing a manual DAR download script, checked-in DAR artifact, or manually managed dependency path.

---

## **Funding**

**Total Funding Request:** 550,000 CC

### **Payment Breakdown by Milestone**

- **Milestone 1 Design, Implementation, and Upstream PR:** 275,000 CC upon committee acceptance
- **Milestone 2 Review Feedback and Merge Readiness:** no separate payment; payment for review feedback incorporation is deferred to Milestone 3
- **Milestone 3 Ecosystem Validation and Enablement:** 275,000 CC upon final release and acceptance

---

## **Volatility Stipulation**

The project timeline is under 6 months. Should the project timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility.

---

## **Co-Marketing**

Co-marketing will be aligned with Milestone 3 and focused on helping Canton/Daml developers understand and evaluate the Git-based dependency workflow.

Specific commitments for this proposal:

- coordinate announcement timing with the Canton Foundation
- prioritize co-marketing of a technical writeup or case study
    - include the recorded demo or walkthrough as supporting material where useful
- share the reference workflow and documentation through relevant Moonsong Labs, Canton Foundation, and ecosystem channels

---

## **Motivation**

Canton/Daml developers still spend extra time on project-level dependency glue, especially when external DARs are fetched through custom scripts, checked-in artifacts, or manually managed paths.

By adding Git-hosted DAR dependencies to the normal `dpm` workflow, this proposal reduces manual artifact handling and makes external dependencies easier to reproduce across local and CI environments.

Expected benefits include:

- fewer manual `.dar` handling steps
- less duplicated scripting across projects
- commit-based pinning of Git-hosted dependencies
- standard install, build, and test behavior through `dpm`
- a foundation for future dependency-management improvements inside `dpm`

---

## **Rationale**

Daml developers have clear workflows for SDK packages and local DAR files, but external DARs can still require manual downloads, checked-in artifacts, or project-specific scripts. That makes reusable Daml artifacts harder to adopt across projects and harder to keep consistent across local and CI environments.

This proposal addresses that gap with a bounded extension to `dpm`: Git-hosted prebuilt DAR dependencies. Git is a practical first source because it lets teams reference artifacts from repositories they already control, without expanding the proposal into a broader package registry or discovery system.

---

## **Future Work**

This proposal is intended as a first step toward better Daml dependency management inside `dpm`. If the Git-based DAR dependency workflow proves useful, the natural next step would be a broader package-management design for Daml projects.

That broader system could define a more complete standard for dependency declaration, versioning, package metadata, publishing conventions, discovery, and documentation. It could also explore support for private repositories, clone-and-build-from-source workflows, package/interface discovery, and eventually a registry or package index if the ecosystem decides shared registry infrastructure is needed.

Separately, there are other possible `dpm` improvements that may be worth exploring later, such as richer project initialization, formatting, SDK selection, configuration validation, and broader component management.

These areas are not part of the committed scope for this proposal.

---

## **Why Moonsong Labs**

Moonsong Labs is a blockchain and AI engineering firm with a dedicated Canton practice for regulated financial institutions, and is listed on `cantonecosystem.com` as a Canton service provider. Our Daml-certified engineers work across the Canton stack on tokenized asset workflows, institutional vault products, atomic DvP settlement, stablecoin infrastructure, and collateral mobility.

More broadly, Moonsong Labs engineers have shipped production systems across Polkadot, Ethereum, ZKsync, Solana, and other ecosystems. This includes developer tooling, chain infrastructure, and operational automation used by external teams.

Work directly relevant to this proposal includes:

- Canton Readiness Guide and launch campaign, developed to help institutions understand Canton’s operating model, adoption path, node options, and readiness considerations. This demonstrates Moonsong Labs’ ability to translate Canton ecosystem concepts into practical adoption materials for institutional audiences.
    
    Press release: https://moonsonglabs.com/blog/moonsong-labs-joins-canton-ecosystem-launches-institutional-readiness-guide/
    Canton Network post: https://www.linkedin.com/posts/canton-network_for-the-leaders-moving-institutions-forward-activity-7475572960196698112-2qVl/
    
- Canton Network demo application, compliant stablecoin plus yield vault, used to validate Daml Finance composition patterns and Canton privacy. The work included a devcontainer for one-click setup and practical experience wiring Daml package dependencies into a usable developer workflow.
    
    Case study: https://moonsonglabs.com/casestudy/demonstrating-a-baseline-for-building-advanced-financial-applications-on-canton/
    Repo: https://github.com/Moonsong-Labs/canton-apps
    
- ZKsyncOS Foundry and related developer tooling, Rust-based tooling derived from the Foundry stack to support Ethereum development workflows on ZKsyncOS, plus testing utilities for Foundry ZKsync.
    
    https://github.com/Moonsong-Labs/zksync-os-foundry
    https://github.com/Moonsong-Labs/forge-zksync-std
    
- Moonbeam and Moonkit, production chain engineering paired with reusable developer utilities and operational tooling.
    
    https://github.com/Moonsong-Labs/moonbeam-tools
    https://github.com/Moonsong-Labs/moonkit
    
- DataHaven and StorageHub, multi-component systems with reproducible builds and automation across chains and services.
    
    https://github.com/datahaven-xyz/datahaven
    https://github.com/Moonsong-Labs/storage-hub
    

These projects reflect a consistent pattern: building developer-facing tooling that reduces setup friction while keeping engineering boundaries explicit. This experience aligns with Canton’s current DevEx needs and supports delivery of targeted `dpm` improvements that teams can adopt incrementally.
