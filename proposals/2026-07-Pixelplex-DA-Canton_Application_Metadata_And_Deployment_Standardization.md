## Development Fund Proposal: Canton Application Metadata and Deployment Standardization

**Organization:** PixelPlex & Digital Asset  
**Author / Primary Contact:** Semyon Protas, Yury Korzun (PixelPlex), David Richards (Digital Asset)  
**Status:** Under Review  
**Created:** 2026-07-29  
**Proposal Type:** RFP-aligned  
**RFP / Roadmap Area:** RFP #3 Automated Application Management (Protocol, Infrastructure, Scalability & Resilience)  
**Champion:** David Richards (@davidrichards-da)  
**Total Funding Request:** 2,500,000 CC  
**Project Duration:** 9 months  
**Label:** dar-app-management

---

## Abstract

Canton applications depend on node operators to host their Daml Archive (DAR) packages. Before an operator hosts a DAR, they need to know what code it contains, whether an audit covers this exact package, whether its dependencies are present on their participant, and how to upload and vet it safely. PixelPlex wrote the draft standard "Standard Package Validation and Distribution for Daml Applications" ([CIP PR #168](https://github.com/canton-foundation/cips/pull/168)), and Obsidian Systems' approved proposal [#533](https://github.com/canton-foundation/canton-dev-fund/pull/533) already builds its package registry on that schema. This proposal finishes and stabilizes the standard. It adds open-source inspection of compiled Daml-LF that does not depend on publisher-supplied source, and it automates the operator side: dependency checks against the target participant, upload, and package vetting after the operator approves it. Where Obsidian's registry and attestations are available, the tooling uses them. PixelPlex and Digital Asset do the work together, and the last milestone pays out only after 10 independent ecosystem partners publish metadata that passes validation and wallet providers run the tooling against their own participants.

---

## RFP Alignment

The RFP asks for "new Validator node tooling that integrates mechanisms for Daml application management including application discovery, review & security analysis; approval, installation and upgrading," and states that "Individual parties, including both the node operator party and hosted parties, may choose to vet and/or unvet Daml packages, across all Validators with hosting rights for a given party." The metadata and audit schema and the operator tooling in this proposal implement that vetting workflow. Obsidian #533 covers how packages are published, found and traced to their source. This proposal covers what happens after an operator receives a DAR: review, approval, upload, and vetting or unvetting on their participant. For a party hosted on several validators, the tooling builds a plan for each hosting participant and reports on which of them the change has not been applied yet.

**Ecosystem need and adoption:**

- Node operators and wallet providers get a machine-checkable way to decide whether to host a third-party DAR, plus a plan of upload and vetting actions that they approve before anything changes on their participant. Today the operator decides by hand, which is how the missing Splice dependency described in Motivation reached MainNet.
- dApp builders get one standard path to hosting instead of a separate conversation with every operator.
- Auditors get a shared publication format, so many operators can rely on one audit and nobody has to redo it for each relationship.
- Milestone 3 measures adoption. It is paid when 10 independent entities (4 wallets, 4 dApps, 2 auditors) publish conformant metadata and the wallet providers run the review and dependency check on their own participants.

---

## Related Work

### CIP PR #168 and Obsidian #533

PixelPlex is the author of the CIP "Standard Package Validation and Distribution for Daml Applications" ([CIP PR #168](https://github.com/canton-foundation/cips/pull/168)), which does not have a final CIP number yet. This proposal uses that name for the standard. Obsidian Systems' approved proposal [#533](https://github.com/canton-foundation/canton-dev-fund/pull/533) uses this schema for audit metadata in its package registry. Both projects need the CIP finished, and finishing it is the first deliverable of this proposal.

The two proposals cover different parts of the package lifecycle. #533 covers the supply chain: publisher and auditor keys, signed audit attestations, OCI package distribution, the `dpm-registry` plugin, and source-to-DAR and Nix build verification. This proposal covers the operator side once a DAR arrives: reading the compiled Daml-LF without publisher source, checking dependencies against the target participant, and uploading and vetting the package after the operator approves it. #533 explicitly leaves participant vetting workflows unchanged.

A valid signature or a successful source-to-DAR rebuild tells the operator who published a package and what it was built from. It does not show what the compiled code does or whether this participant should host it. Daml-LF reconstruction answers the first of those questions. It cannot prove a package safe either, so operators get the most from using both.

The `damlc unpack-dar` command planned in #533 takes the `.daml` sources the publisher embedded in the DAR, recompiles them with the same `damlc`, and checks that the main DALF's package ID matches. It confirms that these sources produce this DAR, and it has nothing to work with when the DAR ships without sources or the operator does not trust the embedded ones. The commands available today do not fill that gap: `damlc inspect-dar` lists the packages, modules and IDs in a DAR, and `damlc inspect` prints the compiled Daml-LF as low-level text, with typeclass dictionaries and compiler helpers, that cannot be compiled back. This proposal starts from the compiled Daml-LF that will run and produces readable Daml that compiles again. A round-trip comparison of data types, template and choice signatures, and expression bodies shows how close the reconstruction is. The result is not the publisher's original source: comments and local names are lost, and a recompiled package can have a different package ID while matching in structure. When the publisher's sources are available, the operator can compare them with the reconstruction.

Where #533 tools are available, this proposal uses them: audit attestations, keys from the #533 keys repository, and hash-pinned OCI references. #533 plans the keys repository in its Milestone 1, the registry and audit metadata pipeline in Milestone 2, the `dpm-registry` plugin in Milestone 3 and the `damlc` source-to-DAR verifier in Milestone 4. This proposal does not depend on that schedule. Until a part is released, the tooling works with a DAR file and Git-hosted metadata, and the integration is tested against fixtures.

### Daml Deployment Toolkit (#322)

The approved [#322](https://github.com/canton-foundation/canton-dev-fund/pull/322) adds a `dpm canton-deploy` component that uploads DARs and vets them as an explicit step. It covers deployment by the party that owns the release, including an upload-only mode for operators. It does not check a third-party DAR against its metadata, audits or the target participant's package state, which is what this proposal adds. An operator-approved plan can be executed by our CLI, and the plan format will be documented so that a deployment tool such as `dpm canton-deploy` can execute it too.

### DAR Relay (#746)

The open proposal [#746](https://github.com/canton-foundation/canton-dev-fund/pull/746) from K2F Labs, also under RFP 3, is a service that a validator provider runs for the teams it hosts. Developers submit DARs through a web portal or `dpm canton-deploy`, the provider's operators approve them, and the service installs and vets the packages on every node that hosts the developer's parties, forwarding requests to other providers where needed. #746 lists a package metadata standard as out of its scope and names this proposal as a source of metadata it consumes. This proposal defines that standard and gives an operator the tools to inspect a DAR, check it against their participant and approve a plan. A service such as DAR Relay can use the same metadata and inspection results in its own review step.

### Daml Package Analyzer (#130)

The approved [#130](https://github.com/canton-foundation/canton-dev-fund/pull/130) from CCTools analyzes a project's source and maps where one package can call into another, for auditors. This proposal checks whether a DAR's dependencies are present and vetted on a participant, and reconstructs code when sources are missing. An analyzer report can be referenced from the audit metadata as evidence.

---

## Specification

### 1. Objective

Design, implement and drive adoption of a standard for metadata and DAR deployment that lets any Canton network participant verify and host dApp packages programmatically. PixelPlex has already published the draft CIP (PR #168), which is receiving feedback. PixelPlex also has a working proof of concept that reconstructs reviewable Daml from compiled Daml-LF 2.x, validated on 23 MainNet packages, and the Milestone 2 estimate turns it into a production tool. The proposal covers the operator's half of the DAR lifecycle: independent inspection of the artifact that will run, and the automation that checks, uploads and vets the accepted DAR on a participant node.

### 2. Implementation Mechanics

Digital Asset (DA) and PixelPlex run the work as three workstreams:

* Standardization and protocol design. The CIP process will formalize the metadata schema, defining the data structures for dependencies, audits (`audit-report.json`) and build provenance (`build-config.json`). `build-config.json` only records which external build-verification system can replay a package's build and which inputs it needs. Running that verification is out of scope (see Scope Boundaries). Together these define the metadata layout that tools read to verify packages, whether it is published in a Git repository or through a #533 OCI registry.
* Tooling and automation. We build open-source CLI tools and CI/CD GitHub Actions. They read metadata from Git repositories or #533 OCI references, validate the application data, reconstruct reviewable Daml from a package's compiled Daml-LF so an operator can inspect a DAR without publisher-supplied sources, check the DAR's dependencies against the packages already on the target participant, and upload the DAR to Canton validators through the Ledger API. The CLI can also ship as a DPM component, the way #322 and #533 ship theirs, if the DPM component interface fits; the core logic is a library in either case.
* Ecosystem integration. After the tooling release, we bring the schema to 10 independent ecosystem partners (4 wallets, 4 dApps, 2 auditors).

The operator workflow runs in separate steps, and nothing changes on the participant before the operator approves:

1. Inspect the DAR: verify its identity, read its metadata and attestations, and reconstruct the code.
2. Check its dependencies against the packages uploaded and vetted on the target participant.
3. Produce a plan of upload and vetting actions. The plan is a dry run and changes nothing.
4. The operator approves the plan.
5. Upload the DAR with `vetAllPackages = false`, then vet the approved packages with a separate call to `/v2/package-vetting/update` (JSON Ledger API, or the gRPC equivalent), as Digital Asset recommended in the review of this proposal.
6. Record the resulting state. If the participant changed between planning and applying, the tool stops and asks for a new plan.

Uploading and vetting need participant admin rights. Only the apply step holds a token with those rights. Inspection, dependency checks and planning use read access, and CI runs that produce a plan never touch the participant with write access before the operator approves.

Unvetting can break workflows that already use a package, so the plan lists it separately, shows which packages are affected, and asks for its own approval. A plan is built for one participant. For a party hosted on several participants, the tool builds a plan for each of them, and each operator approves their own.

### 3. Scope Boundaries

This proposal starts where an operator receives a compiled artifact. It does not and will not build:

* a package registry or package distribution ecosystem;
* a publisher or auditor identity registry, signing-key service, or signing consortium;
* a package manager, or a replacement for existing package-management tooling;
* a reproducible-build verification service.

Where that infrastructure exists, for example in Obsidian #533, this tooling uses it. `audit-report.json` points to audits wherever they are published, signature verification takes keys from the trust infrastructure the operator already uses, and `build-config.json` points at an external build-verification system. An operator who already runs such infrastructure gets one more independent check and nothing new to adopt.

This proposal builds the operator's side of the same interface: inspection of the Daml-LF artifact without a publisher-supplied source tree, and automation that validates dependencies, uploads the accepted DAR to a participant node over the Ledger API, and vets it after the operator approves.

### 4. Architectural Alignment

The standard defines how application developers, auditors and node operators exchange information about a DAR. The tooling is open source and does not depend on any single operator or registry.

### 5. Backward Compatibility

This proposal introduces a new, versioned metadata schema. The first stable version is the compatibility baseline. Later versions will keep older documents parseable where possible, document any breaking change, and include migration rules. A metadata document stays verifiable against the schema version it was written for.

---

## Milestones and Deliverables

### Milestone 1: CIP Finalization & Initial Automations MVP

- **Committed Date:** 1 month after proposal approval
- **Focus:** a stable version of the standard and the first working tool.
- **Deliverables / Value Metrics:**
    * **Deliverable 1.1: Stable version of the CIP.** Update CIP PR #168 to a stable, versioned schema (v1.0 release candidate) with a JSON Schema, valid and invalid example files, and a log of how each review comment was handled. The schema records which package an audit applies to (package ID and DAR hash, which are different things), who the auditor is and how the report is signed, the audit scope and exclusions, the severity scale and any open Critical or High findings, accepted risks, and privileged roles and upgrade rights. The required core stays small, and other data goes into optional extensions. A public summary can point to a full report that stays private. Next to source reproducibility, the schema supports an auditor-attested route: a signed statement that binds the source hash the auditor reviewed to a DAR hash, in the same format #533 consumes. Validation reports which route was used: `source-reproducible` (build evidence from an external system such as #533, which this proposal does not run), `auditor-attested` or `lf-reconstructed`.
        * *Acceptance Criterion:* The updated PR is published, the JSON Schema accepts every valid example and rejects every invalid one, and the PR is submitted to the CIP editors for acceptance. Merging the CIP depends on the CIP process and is not a condition for accepting this milestone.
    * **Deliverable 1.2: MVP of DAR uploading automations.**
        * *Acceptance Criterion:* A CLI tool or script, published in a public repository, parses the proposed metadata schema and uploads a DAR through the Ledger API to a local Canton sandbox without errors. Upload and vetting are separate steps, and the MVP does not vet packages automatically.

### Milestone 2: Automation Hardening & Release

- **Committed Date:** 6 months after the delivery of Milestone 1
- **Focus:** production-ready automation that ecosystem participants can use.
- **Deliverables / Value Metrics:**
    * **Deliverable 2.1: Production release of the automation suite.**
        * *Acceptance Criterion:* V1.0 of the automation tooling is released. It includes CI/CD GitHub Action templates that parse the DAR dependency tree and validate it against the CIP schema. The release can reconstruct reviewable Daml from a DAR with no embedded `.daml` sources and shows how faithful the reconstruction is by a round trip: the tooling builds a project from the package's Daml-LF, compiles it with a pinned `damlc` targeting the package's LF version, and produces a structural comparison with the original covering data types, template and choice signatures, top-level value types, and expression bodies after alpha-normalisation. Results are published for a corpus of at least 20 MainNet packages, with a per-package table that lists every remaining difference. The suite also checks a DAR's dependencies against the packages present on a target participant, produces a plan of upload and vetting actions, and vets packages only after explicit operator approval. Each check, in the CLI and in CI, ends as pass, fail, manual review or unsupported. Unknown Daml-LF versions or constructs are reported as unsupported and never pass. The suite accepts metadata from a Git repository or a #533 OCI registry reference, using the same schema.

**Milestone 2 Engineering Estimate**

| Task | Task Details | Hours | Funding Required (CC) |
| :---- | :---- | ----: | ----: |
| DAR Dependency Analysis Engine | DAR parsing, Dalf package extraction, recursive dependency resolution, package fingerprinting, dependency graph construction, comparison with the packages uploaded and vetted on the target participant | 180 | 120,000 |
| Metadata & Schema Validation Engine | Validation of application metadata, CIP schema enforcement, audit artifact verification including #533 attestations, consistency checks between declared metadata and DAR contents, validation reporting framework | 140 | 90,000 |
| Daml-LF Decoding Layer | Archive/payload parsing for Daml-LF 2.x, interning resolution, version detection with unsupported versions reported, support for packages served by participant APIs, performance tuning for large packages | 140 | 93,000 |
| Decompilation Engine | Removal of compiler-generated code (typeclass dictionaries, specialised helpers, join points, temporaries), capture-safe rewriting, reconstruction of patterns, `do` blocks, records, conditionals and template/choice structure | 240 | 160,000 |
| Source Generation & Type Recovery | Layout-correct Daml output, module and import resolution, Prelude/stdlib mapping, recovery of type applications and annotations needed for compilable output | 200 | 133,000 |
| Project Reconstruction | Buildable project generation, dependency closure and packaging, upgrade-chain linkage | 100 | 67,000 |
| Round-trip Verification Framework | Decompile to compile to structural comparison pipeline, reference corpus of public packages, CI across SDK versions and platforms | 130 | 87,000 |
| DAR Integrity & Signature Verification | DAR integrity validation, signed metadata support, verification of signatures against keys from the #533 keys repository or other published keys (consumed, not built), operator policy for accepted signers | 60 | 40,000 |
| Production Automation CLI | Operator CLI with inspect, validate, plan, apply and status commands; upload and vetting as separate approved steps; packaging as a DPM component where the component interface allows; configuration management, structured logging, error handling, release management, cross-platform support | 120 | 80,000 |
| GitHub Actions & CI/CD Automation Suite | Reusable GitHub Actions for operator validation with an approval step before upload or vetting, PR validation workflows, release validation workflows, automated compliance reporting, reference CI templates | 100 | 65,000 |
| End-to-End Testing & Security Hardening | Canton sandbox infrastructure, automated integration testing, negative testing, plan drift and partial failure handling, parser hardening with resource limits, safe archive extraction, sandboxed tool runs and timeouts, security validation, regression test suite | 100 | 65,000 |
| Documentation & Reference Implementations | Integrator guide, operator guide with upload and vetting, #533 integration notes, architecture documentation, schema reference, example repositories, reference implementations | 60 | 40,000 |
| **Total** | | **1,570** | **1,040,000 CC** |

### Milestone 3: Ecosystem Adoption

- **Committed Date:** 2 months after the delivery of Milestone 2
- **Focus:** independent organizations across the ecosystem use the standard, and the use can be checked.
- **Deliverables / Value Metrics:**
    * **Deliverable 3.1: Adoption by 10 distinct ecosystem entities.**
        * *Acceptance Criterion:* 4 wallet providers and 4 dApp builders publish application metadata, and 2 audit firms publish `audit-report.json` for packages they audited, in a public Git repository or a #533 OCI registry entry, conforming to the standard defined in Milestone 1. All 10 entries pass validation by the Milestone 2 suite, with no fail or unsupported result. Wallet providers take part as operators and run the review and dependency check against their own participant. At least 2 of them run the full workflow in a test environment: inspection, dependency check, plan, approval, upload and vetting. Each partner confirms its participation in a comment on this proposal's PR. Entities affiliated with PixelPlex or Digital Asset do not count. A partner that also takes part in #533 counts here only for work done with this tooling; publishing to the registry alone is not enough. Partners do not have to publish confidential packages or full audit reports.
    * **Deliverable 3.2: Blog article.**
        * *Acceptance Criterion:* A joint technical case study is published. It explains the standard and the problem it solves, shows the 10 adoption entries, and releases the CI/CD templates as open source for the wider developer community.

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone
- Demonstrated functionality or operational readiness
- Documentation and knowledge transfer provided
- Alignment with stated value metrics

Project-specific conditions:

- The tooling never vets or unvets a package without explicit operator approval, and unvetting needs its own approval.
- Unknown Daml-LF versions, constructs or schema versions are reported as unsupported and never pass.
- Digital Asset validates adoption in Milestone 3 against the criteria in Deliverable 3.1, and each partner also confirms its participation in a comment on this proposal's PR. Affiliates of PixelPlex or Digital Asset do not count.

---

## Funding

**Total Funding Request:** 2,500,000 CC

* PixelPlex Allocation: 1,500,000 CC
* Digital Asset Allocation: 1,000,000 CC

### Payment Breakdown by Milestone

| Milestone | Funding | PixelPlex / Digital Asset Split |
| :---- | ----: | :---- |
| Milestone 1: CIP Finalization & Initial Automations MVP | 460,000 CC | 260,000 PP / 200,000 DA |
| Milestone 2: Automation Hardening & Release | 1,040,000 CC | 1,040,000 PP / 0 DA |
| Milestone 3: Ecosystem Adoption | 1,000,000 CC | 200,000 PP / 800,000 DA |

Each milestone is paid when the committee accepts its deliverables. Milestone 3 is paid after the final release and verified adoption.

PixelPlex's allocation covers the CIP draft and the upload MVP in Milestone 1, all engineering in Milestone 2, and integration support for partners in Milestone 3. Digital Asset's allocation covers coordinating the CIP review with ecosystem participants and collecting operator requirements in Milestone 1, and partner onboarding, adoption validation and the case study in Milestone 3.

### Volatility Stipulation

The project runs longer than 6 months. The grant is denominated in fixed Canton Coin and will require a re-evaluation at the 6-month mark.

### Timeline Risk Management

* **SLA Penalty:** Delays beyond the Committed Date for Milestone 3 are reviewed by the Committee, which may reduce the Milestone 3 payout by up to 25% of its original amount (250,000 CC) for every full 30 days of delay. The reduction does not compound, and the payout cannot go below zero.
* **Fallback Logic:** If a Canton Network core upgrade introduces breaking changes to the Ledger API while Milestone 2 is in progress, PixelPlex documents the impact and the Committee decides whether to extend the timeline by up to 30 days without SLA penalties.

---

## Licensing

All code, schemas and GitHub Actions produced under this grant are released under Apache-2.0 in public repositories. Once the CIP is accepted, schema changes go through the CIP process.

---

## Co-Marketing

After the release, PixelPlex and Digital Asset will work with the Foundation on the joint technical case study from Deliverable 3.2: it explains the standard and the problem it solves, shows the 10 adoption entries, and releases the CI/CD templates as open source.

---

## Motivation

On Canton, dApp builders cannot deploy code to a shared chain. Node operators have to host each application's DARs themselves. With no common standard, every new application and every upgrade goes through its own manual deployment, and builders wait on each operator in turn.

Digital Asset asked 10 wallet providers who run validator nodes what blocks them from hosting third-party DARs. They named three problems:

* Security. Operators worry about code that could compromise the validator or trick end users into signing harmful transactions.
* Audit and source verification. Operators require formal audits, but what they are asked to host is compiled Daml-LF. Rebuilding from publisher sources does not help when the vendor ships binaries only, embeds sources that no longer match the code, or is not trusted to supply them. This proposal reconstructs reviewable Daml from the compiled Daml-LF instead (see Related Work).
* Dependency management. Version compatibility goes unchecked and DARs are loaded by hand, which costs operators a lot of time. Recently an application DAR failed on MainNet because a Splice dependency it needed had not been deployed.

Digital Asset has seen first hand how hard it is for application builders to get their DARs hosted by wallet providers and node operators, and more builders will run into the same problem as the network grows.

---

## Rationale

Today operators decide whether a third-party DAR is safe to host by manual checks, and they carry the risk if they get it wrong. A standard schema for dependencies and audits lets them move those checks into automated CI/CD validation.

When several independent parties (wallets, auditors and dApp builders) each attest to a DAR, operators can see who vouched for it and do not depend on one party's word.

When an independent audit firm or wallet provider publishes a DAR review in this format, anyone can reuse it. Operators get checkable evidence for the hosting decision and do not have to start from zero for every application. The evidence does not prove the code is safe, but it lowers the cost of getting an application deployed across the network.

Once established node operators publish the DARs they support, newer operators will have a starting list of applications they can host with more confidence.

The proposal builds on existing tooling. Related Work explains how it fits with #533, #322, #746 and #130, and Implementation Mechanics describes the option to ship the CLI as a DPM component.
