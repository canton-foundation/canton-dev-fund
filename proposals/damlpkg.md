## Development Fund Proposal - Daml Package Registry (`damlpkg`), A Hosted Package Registry for the Canton Network

**Author:** Tolga Yaycı
**Status:** Submitted
**Created:** 2026-05-07
**Label:** daml-tooling

---

## Abstract

Sharing a Daml library today means copying a compiled `.dar` file (a Daml Archive, or DAR) by hand into every consumer project's `dars/vendored/` directory and then maintaining `data-dependencies:` entries in `daml.yaml` to point at it. There is no central index, no semantic version resolution, no provenance, no search, and no defense against typosquatting or silently replaced artifacts. Canton's 2026 Developer Experience Survey records the situation in developers' own words as "a manual, file-based process," names "Daml Dependency & Package Manager" among the top tooling opportunities, and places "Package Manager & Operational Dashboards (Cargo)" on its Magic Wand Wishlist.

Canton 3.4 closed the protocol-side prerequisites for fixing this. It introduced package-name addressing in the form `#<package-name>:<module>:<entity>`, a Smart Contract Upgrade (SCU) framework that tracks compatible upgrade lineage between versions, and a stable build interface in `dpm`, Digital Asset's official Daml package manager. The hosted registry layer above them is what is still missing.

This proposal funds **Daml Package Registry (`damlpkg`)**, the npm, crates.io, or PyPI of the Daml ecosystem. The deliverable is a hosted HTTP registry, a single-file cross-platform CLI, a public web interface for discovery, a documentation site, and an on-chain Daml template suite that anchors every published artifact directly on the chain it runs on.

Developers will publish compiled DARs by name and version through a bearer-token CLI. Consumers will install transitive dependencies through a deterministic lockfile that pins exact versions, SHA-256 hashes, and the registry's signature. Every artifact will be content-addressed by SHA-256, signed with an Ed25519 key held by the registry, and mirrored as a `PackageRecord` contract on a Canton participant. Verification is independent of the registry server, since any consumer can check provenance directly against the ledger.

The system shells out to `dpm` for builds and integrity checks. No Digital Asset toolchain component is forked or modified. The registry will run as both a public hosted service and a self-hosted deployment under Apache 2.0. This proposal funds the production build of the complete system across four milestones in 4 months.

A working reference implementation is already deployed for committee evaluation:

* **Live Reference Implementation:** https://damlpkg.dev
* **Source code:** https://github.com/tolgayayci/damlpkg
* **Demo video:** https://youtu.be/C1Rcie1JNhU
* **Documentation:** https://docs.damlpkg.dev
* **CLI installer:** https://get.damlpkg.dev/install.sh

---

## Specification

### 1. Objective

The objective is to build the layer that sits between an authored DAR and a consumer project, and to anchor that layer on Canton itself.

Canton today has a build tool in `dpm`, a participant-side package store, and a settled package addressing format, but no developer-facing distribution layer between authoring a DAR and consuming it elsewhere. Without that layer, library reuse degenerates into manual file copying, transitive dependency resolution is impossible, and supply-chain provenance is left to ad-hoc README instructions.

`damlpkg` fills that layer in a way that is comparable in shape to npm, crates.io, or PyPI but Canton-native in three concrete ways. First, every publish produces an immutable `PackageRecord` Daml contract on a participant node, so consumers verify provenance directly from the ledger rather than from a registry-operated database. Second, namespace ownership is bound to a Canton party through the `PublisherNamespace` template, so ownership lives on chain rather than in a row inside the registry operator's infrastructure. Third, dependency resolution is strictly single-registry: `daml.yaml` accepts exactly one `registry:` value. This rules out the dependency-confusion attack class, in which a malicious package published to a higher-priority registry shadows a legitimate internal package of the same name.

The system covers the full lifecycle (publish, install, search, verify, yank, ownership transfer, and organization namespaces), backed by a cryptographic supply-chain pipeline detailed in Section 2.

Out of scope: modifying `dpm`, `damlc`, or any other Digital Asset toolchain component, and competing with permissioned business-to-business Daml application distribution platforms, which target a different layer of the stack.

### 2. Implementation Mechanics

The system is four cooperating components that share state through Postgres and an S3-compatible blob store. PostgreSQL is the sole durable source of truth. The blob store and Canton contracts are content-addressable projections that can be reconstructed from Postgres rows. Canton writes are always asynchronous, so HTTP latency never depends on the round-trip times of Canton's Byzantine-fault-tolerant (BFT) consensus layer.

**Registry server.** A stateless HTTP service that owns all read and write paths and is the only component holding database, blob, and Canton participant credentials. Authentication covers GitHub OAuth alongside email and password.

**Registry worker.** A stateless background process that drains the outbound Canton write queue, runs reconciliation sweeps, generates supply-chain sidecars, and performs nightly maintenance.

**Cross-platform CLI.** A single-file static binary for macOS, Linux, and Windows. The CLI mediates every authoritative action through the registry HTTP API.

**Web UI and documentation site.** A public web interface for discovery, namespace and package browsing, and account management, plus a separate Astro Starlight build at `docs.damlpkg.dev` covering documentation, an interactive OpenAPI explorer, and the project's architecture decision records.

**Publish flow.** The CLI reads `daml.yaml`, shells out to `dpm build`, computes a SHA-256 over the resulting DAR, requests an Ed25519 signature from the registry over a deterministic canonical message, and uploads the artifact with its content hash and signature attached. The server re-verifies the signature, runs `dpm inspect-dar --json` to extract package metadata, and runs `dpm upgrade-check` to gate Smart Contract Upgrade compatibility. An explicit override is available when intentionally cutting a major-version boundary.

**Install flow.** The CLI resolves `registry-dependencies:` against semantic-version ranges, or against `daml.lock` exactly when running in frozen mode. It consults the local content-addressed cache, downloads cache misses while verifying their SHA-256 in transit, writes the DAR into the project's local DAR directory, and rewrites `daml.lock` with exact pins, hashes, and registry signature metadata. The CLI then materializes everything into standard `data-dependencies:` entries that `dpm build` resolves the same way it always has. The registry is a pre-build dependency synchronizer, not a `dpm` replacement.

**Asynchronous Canton writes.** Every operation that requires an on-chain projection inserts a row into the Canton write queue with a deterministic command id. The worker submits via `@canton-network/core-ledger-client` against the JSON Ledger API and advances the row through pending, in-flight, and committed states. HTTP write endpoints return immediately with the queued status, so the publish call never waits for ledger finality. Deterministic command ids make resubmits idempotent at the participant level. A reconciliation sweep runs periodically, walking rows that require on-chain projection and re-enqueueing missing contracts. A reset of the participant's Active Contract Set (ACS) therefore becomes a replay event rather than data loss.

**On-chain template suite.** A set of Daml templates is deployed to the registry's Canton participant. `PublisherNamespace` records a claimed handle. `PackageRecord` records a published version, binding the artifact's content hash and supply-chain attestations to its publisher and timestamp. `UpgradeClaim` records explicit upgrade lineage between versions to support SCU visualization. `YankRecord` is an append-only event capturing yank actions. `OwnershipTransfer` implements two-phase namespace transfer with explicit acceptance by the receiving party. `OrganizationNamespace` supports multi-publisher namespaces with on-chain role-based access control.

Every template includes a parameter named `publicObserver : Party`. In Daml, a contract is only visible to its signatories and observers. Third parties cannot read it otherwise. By naming a single public-observer party on every template, the registry makes every record auditable from any participant configured to host that party. A cross-participant integration test verifies that the observer party can read every contract without being a signatory.

**Identity and authorization.** Bearer tokens are scoped per namespace and support per-package narrowing. Namespace claims pass through a reserved-names list seeded before public signup to block impersonation of well-known handles.

**Signing pipeline.** The Ed25519 signing key is held in a Hardware Security Module so the private key never leaves managed hardware. The canonical signing message is deterministic JSON binding the artifact's content hash to its publisher identity, version coordinates, and signing key id. Any client can reconstruct the same bytes and verify the signature independently against the registry's public key. Key rotation is supported: each retired key remains addressable by its key id, and an endpoint returns the matching public key on demand, so historical signatures stay verifiable across rotations.

**Supply-chain pipeline.** Alongside each published DAR, the registry produces a CycloneDX Software Bill of Materials (SBOM) and an in-toto SLSA provenance attestation. Both are content-addressed in the blob store and hash-referenced from the version row.

**Immutability defense-in-depth.** Once a `(name, version)` tuple is visible to consumers it is never rewritten or hard-deleted. The guarantee is enforced at four independent layers: a database UPDATE/DELETE policy, an application-layer repository that refuses protected-column writes, R2 bucket-lock retention, and the on-chain `PackageRecord` history. Yank is a state transition that hides a version from new resolution but preserves it for already-pinned consumers, so existing lockfiles never break.

**OIDC trusted publishing.** A registered allowlist maps `(provider, repository, workflow)` tuples to namespaces. A continuous-integration job presents an OpenID Connect token issued by its CI provider, the registry verifies the claims, and a short-lived single-use signing session is minted for the normal publish path. This eliminates the need for long-lived secrets in CI configuration. A reusable plugin ships for GitHub Actions. The OIDC verifier on the registry side is designed against the standard claim set, so other CI providers can be supported later without registry-side changes.

**Stack.** The backend runs on Node with Hono, Drizzle ORM, PostgreSQL with `pg_trgm` for fuzzy text search, Cloudflare R2, Better Auth, `graphile-worker`, and `@canton-network/core-ledger-client`. The frontend is built with Vite, React, React Router, Tailwind, shadcn/ui, TanStack Query, React Hook Form with Zod resolvers, and `react-markdown`. The CLI is built with Bun and esbuild, Commander, and a comment-preserving YAML library for `daml.yaml` edits. Daml templates compile with `dpm`, the documentation site is built with Astro Starlight, cryptography uses Ed25519 via Node's native crypto module, and all services are containerized with Docker for a single-command local development boot.

**Reference implementation.** A working reference implementation is deployed at `https://damlpkg.dev`, with documentation at `https://docs.damlpkg.dev`, the CLI installer at `https://get.damlpkg.dev/install.sh`, source at `https://github.com/tolgayayci/damlpkg`, and a demo video at `https://youtu.be/C1Rcie1JNhU`. It exists to give committee reviewers a way to evaluate the architectural choices in a running system. The grant funds the full production build described in this proposal as planned development across the four milestones below.

### 3. Architectural Alignment

The work aligns with three established directions in current Canton architecture.

The first is package-name addressing. Canton 3.4 deprecated raw 64-character package-id references in favor of `#<package-name>:<module>:<entity>`, which means a registry naturally owns the mapping between stable semantic names, semver versions, and underlying package payloads. SCU compatibility is checked at publish time through `dpm upgrade-check`, with the `UpgradeClaim` template providing on-chain upgrade lineage. The registry never imposes its own upgrade rules; it surfaces the toolchain's verdict.

The second is the privacy-preserving observer pattern Canton's tooling encourages. A naïve design that invited every consumer participant to be an observer would explode participant storage, since contracts replicate to every participant hosting an observer party. Naming a single public-observer party on every template keeps the on-ledger surface compact while preserving auditability, because anyone who wants independent verification can configure their own participant to host that party.

The third is the separation between off-ledger control and on-ledger projection. Every HTTP write commits its Postgres transaction first and enqueues a Canton submission with a deterministic command id; the worker then handles ledger-side retries, idempotency, and the latency introduced by Byzantine-fault-tolerant consensus.

The project sits within the Canton Development Fund's `daml-tooling` and `dar-app-management` categories, and the Apache 2.0 license posture matches the Foundation's standard for shared developer tooling.

### 4. Backward Compatibility

There is no impact on existing systems, integrations, or workflows. The registry is purely additive. Projects that prefer the current vendored-DAR approach continue to work without change. Projects that adopt the registry continue to use unmodified `dpm`, unmodified `daml.yaml` semantics for `data-dependencies:`, and the existing Canton participant package vetting workflow at runtime. The CLI converts `registry-dependencies:` entries into standard `data-dependencies:` entries during install, which `dpm build` already understands. The on-chain templates are net-new contracts on a registry-controlled participant that do not interact with any existing application contracts and require no protocol or topology changes on consumer participants.

---

## Milestones and Deliverables

The total development duration is 4 months across four milestones, each producing a verifiable deliverable that can be evaluated independently of the others.

### Milestone 1: Registry Core, On-Chain Templates, and Publish/Install Loop

* **Estimated Delivery:** June 15, 2026
* **Focus:** Stand up the durable data plane, the foundational on-chain templates, the asynchronous Canton write pipeline, the authentication surface, and the minimum CLI flow that exercises the full system end-to-end. Acceptance establishes that the load-bearing architectural properties hold under integration tests before higher-level features are layered on. These properties are: PostgreSQL as the durable source of truth, asynchronous Canton writes, content addressing by SHA-256 throughout, immutability across all four enforcement layers, single-registry resolution at parse time, and observer correctness on every Daml template.

The first milestone delivers a working registry server with the full PostgreSQL schema under Drizzle migrations, the content-addressable R2 blob store with bucket-lock retention, and the Canton write queue plus worker machinery, including the reconciliation sweep that recovers from a participant ACS reset.

The HTTP API exposes the core public read endpoints (package listing, semver range resolution, single-version detail, blob download, recent feed, full-text search) and the core authenticated write endpoints (multipart DAR publish, namespace claim, signature minting). Email and password authentication is wired in via Better Auth, alongside basic per-IP rate limiting on the write and signing paths.

The foundational Daml templates `PublisherNamespace`, `PackageRecord`, and `UpgradeClaim` are deployed to a self-hosted Canton 3.4 participant and validated by the cross-participant observer integration test. Ed25519 signing is implemented over the canonical-message field set; every successful publish issues a signature persisted alongside the version row and re-verified before commit. Immutability is enforced at the database, application repository, R2 bucket-lock, and on-chain layers, with independent tests at each.

The CLI v0 ships as single-file binaries for the supported platforms, covering `login`, `whoami`, `publish`, `install`, `add` (with `--init` to bootstrap a minimal `daml.yaml`), `remove`, and `search`. Streaming SHA-256 in the publish path, lockfile generation with exact pins, and a content-addressed local cache are all in place.

* **Deliverables / Value Metrics:**
  * Containerized registry stack with the full schema migrated and the foundational read and write endpoints exposed under basic rate limiting.
  * Asynchronous Canton writer queue with deterministic command ids and a reconciliation sweep verified against a simulated ACS reset.
  * Email and password authentication via Better Auth, plus namespace-scoped bearer tokens.
  * Namespace claim flow with a reserved-names list seeded before public signup.
  * Single-registry resolution defense at parse time.
  * `PublisherNamespace`, `PackageRecord`, and `UpgradeClaim` templates deployed and gated by the cross-participant observer integration test.
  * Ed25519 signing pipeline with canonical-message determinism verified by a third-party reconstruction test.
  * Immutability defense-in-depth verified by independent tests at each of the four layers.
  * CLI v0 binaries for the supported platforms covering `login`, `whoami`, `publish`, `install`, `add`, `remove`, and `search`, completing the publish, install, and `dpm build` loop end-to-end against a fresh fixture project.

### Milestone 2: CLI Completeness, Web Interface, and Documentation

* **Estimated Delivery:** July 15, 2026
* **Focus:** Complete the developer-facing surfaces: the lifecycle CLI, the public web interface, and the documentation site.

The CLI gains the verbs needed to operate at namespace and package scope. New verbs include `update` and `info` for discovery, `verify` for signature verification, `verify --on-chain` that queries the Canton participant directly, `tree` for the dependency tree, and the lifecycle verbs `yank --reason`, `unyank`, and `owner add|remove|list`, each of which produces the corresponding state transitions and on-chain projections. Every verb supports `--json` for scripting, alongside `--frozen`, `--dry-run`, and `--allow-breaking` where meaningful. The lockfile carries the registry signature, signing key id, and signature timestamp per package, so installs can re-verify Ed25519 signatures against the persisted metadata.

GitHub OAuth ships in this milestone alongside email-and-password authentication.

The web UI v1 covers the home page with recent and popular feeds, the search page, namespace pages, sign-in, sign-up, and password-reset routes, and account settings. The package detail page surfaces a header with install snippet, signature card, on-chain contract status badge, sanitized README, versions table, a textual dependency listing, and download counts. The UI is mobile-responsive and supports dark/light/system theming.

The documentation site goes live at `docs.damlpkg.dev` with quickstart, installation, first publish, CLI reference (one page per verb and flag), API reference rendered from the auto-generated OpenAPI spec with an interactive explorer, the conceptual layer covering signing, on-chain anchor, immutability, single-registry resolution, and observer correctness, and the changelog.

* **Deliverables / Value Metrics:**
  * GitHub OAuth authentication alongside email-and-password.
  * The full lifecycle CLI surface beyond the M1 verbs: `update`, `info`, `verify`, `verify --on-chain`, `tree`, `yank`, `unyank`, and `owner`, each with a JSON-Schema-validated `--json` output shape and documented exit codes.
  * Web UI v1 with the full route set, responsive layouts, and dark/light/system theming.
  * OpenAPI specification with an interactive explorer.
  * Documentation site live at `docs.damlpkg.dev` covering quickstart, CLI reference, API reference, and the conceptual layer.

### Milestone 3: OIDC Trusted Publishing, Organization Namespaces, and Lifecycle Templates

* **Estimated Delivery:** August 15, 2026
* **Focus:** Build out the OIDC trusted-publishing path and the collaboration features needed for shared library maintenance across teams.

Three additional Daml templates are deployed in this milestone. `YankRecord` is an append-only event preserving history through subsequent unyanks. `OwnershipTransfer` implements two-phase transfer with on-chain acceptance. `OrganizationNamespace` supports multi-publisher namespaces with on-chain role-based access control. Each template is included in the cross-participant integration test.

OIDC trusted publishing implements the registered `(provider, repository, workflow)` allowlist with verified token claims, minting short-lived single-use signing sessions. A reusable GitHub Action ships alongside it. The flow eliminates the need for long-lived publishing secrets in CI configuration and lets a project bind publishing rights to a specific repository and workflow rather than to a developer-held token.

Organization namespaces introduce role-based membership in four roles (owner, maintainer, publisher, viewer) backed by the `OrganizationNamespace` template. Role changes propagate to the on-chain access-control list (ACL) within one reconciliation cycle, and per-role permission checks are enforced server-side. Namespace transfers run as a two-phase flow with a 7-day expiration, a 30-day cooldown blocking consecutive transfers, and bilateral email confirmations. A token management page in the web UI lets users view their bearer tokens, scopes, and expiration, and revoke them.

* **Deliverables / Value Metrics:**
  * `YankRecord`, `OwnershipTransfer`, and `OrganizationNamespace` templates deployed and gated by the cross-participant observer integration test.
  * OIDC trusted publishing with a reference GitHub Action, binding publishing rights to a specific repository and workflow.
  * Organization namespaces with on-chain ACL propagation across the four roles.
  * Two-phase namespace transfer with on-chain acceptance, 30-day cooldown, and bilateral email confirmations.
  * Token management UI for viewing and revoking bearer tokens.

### Milestone 4: Editor Integration, Web UI Completion, and Operational Hardening

* **Estimated Delivery:** September 15, 2026
* **Focus:** Take the system from feature-complete to production-grade. This milestone closes out the editor integration, the remaining web UI surfaces, the operational substrate, and the self-hosted deployment story.

A Visual Studio Code extension ships to the marketplace with autocomplete in `registry-dependencies:`, hover documentation, a quick-fix to add a dependency, and an inline new-version-available badge.

The web UI completes with a dependency-graph visualization marking yanked versions, alongside reverse-dependency listing.

Production observability ships in the form of structured logging, metrics, and distributed tracing across the server, worker, and CLI.

A self-hosted deployment artifact provides a single-command boot of the full stack, packaged so an operator can run the registry against their own infrastructure under Apache 2.0.

The full quality matrix runs end-to-end: unit tests, integration tests with `testcontainers`, end-to-end tests with Playwright for the UI and scripted CLI fixtures, Daml template tests via `dpm test`, the cross-participant observer integration test, k6 load tests for read paths, and fuzz tests for the DAR parser and signature verifier. A failing test on the supported runtime matrix blocks the milestone from being considered complete.

* **Deliverables / Value Metrics:**
  * VS Code extension published to its marketplace.
  * Web UI completion: dependency-graph visualization and reverse-dependency listing.
  * Production observability via structured logging, metrics, and distributed tracing.
  * Self-hosted deployment artifact with single-command boot under Apache 2.0.
  * Full test matrix passing on the supported runtime matrix.

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on the following criteria:

* Deliverables completed as specified for each milestone, with a runnable artifact demonstrating each capability and the documented end-to-end test scenarios passing on a clean checkout.
* The load-bearing architectural properties hold under independent integration tests: PostgreSQL is the durable source of truth, Canton writes are always asynchronous, content addressing by SHA-256 binds every layer, immutability holds across all four enforcement layers, the CLI has no back-channel to durable state, single-registry resolution is enforced at parse time, and every Daml template satisfies observer-correctness on a cross-participant test.
* The full publish, install, and verify loop succeeds end-to-end, including local SHA-256 verification, registry Ed25519 signature verification, and on-chain `PackageRecord` cross-check from a third-party participant configured as `publicObserver`.
* Reconciliation correctness: a simulated participant ACS reset is fully recovered within one reconciliation cycle.
* Comprehensive CLI and HTTP API reference covering every public surface, with the OpenAPI specification auto-generated and an interactive explorer published.
* The hosted registry is live at `https://damlpkg.dev` with the CLI installer at `https://get.damlpkg.dev/install.sh` and the documentation at `https://docs.damlpkg.dev`. All three endpoints serve production traffic at the close of Milestone 4.
* The self-hosted deployment artifact boots the full stack from a clean clone of the repository with a single command, against a fresh PostgreSQL database, R2-compatible blob store, and Canton 3.4 participant, and passes the cross-participant observer integration test on first boot.
* The CLI installer script provisions a working single-file binary on macOS (Apple Silicon and Intel), Linux (x86_64 and arm64), and Windows (x86_64), with `damlpkg --version` returning the tagged release version and `damlpkg login` completing against the live registry.
* A documented smoke-test script runs the full publish-install-verify loop against the live hosted registry from a fresh fixture project, completing without error and producing a `daml.lock` whose pins resolve back to the published `PackageRecord` contracts on the registry's Canton participant.
* The source repository is publicly available under Apache 2.0 with one Git tag per accepted milestone, a `README` that includes the install command and links to documentation, and a `CHANGELOG` documenting per-milestone deliverables.
* The VS Code extension is published to the Visual Studio Marketplace under a stable identifier, installable via the standard marketplace flow, and provides autocomplete in `registry-dependencies:` against the live registry on a fresh project.

---

## Funding

**Total Funding Request:** 1,100,000 CC

The funding covers a single developer working full-time across 4 months on the registry server, registry worker, CLI, web UI, documentation site, and Daml templates, plus the infrastructure required to run the system as a hosted service throughout the build. Infrastructure costs are part of development costs and are included in the requested amount. They cover the managed compute environment, the PostgreSQL database, object storage, the Canton participant, signing-key custody, error tracking, and the CDN edge. No marketing, community management, or non-development expenses are included.

### Payment Breakdown by Milestone

* Milestone 1, Registry Core, On-Chain Templates, and Publish/Install Loop: **275,000 CC** upon committee acceptance.
* Milestone 2, CLI Completeness, Web Interface, and Documentation: **275,000 CC** upon committee acceptance.
* Milestone 3, OIDC Trusted Publishing, Organization Namespaces, and Lifecycle Templates: **275,000 CC** upon committee acceptance.
* Milestone 4, Editor Integration, Web UI Completion, and Operational Hardening: **275,000 CC** upon final acceptance.

---

## Co-Marketing

**Launch announcement.** A coordinated launch post on the project's channels and the Canton Foundation's developer-communication channels covering the registry, the on-chain provenance model, and the CLI quickstart. The Foundation's amplification reaches the Daml developer audience the registry depends on for adoption; the project provides the technical content, demo recordings, and screenshots.

**Technical content for the developer ecosystem.** A long-form technical write-up of the on-chain provenance pattern, covering `PackageRecord` semantics, the canonical Ed25519 signing message, the public-observer pattern, and the asynchronous reconciliation design. The piece is written for Daml and Canton developers and is licensed for republication on the Foundation's documentation or blog channels. It serves as a reference for other projects integrating off-chain services with Canton, which is a pattern the ecosystem will need repeatedly as application-layer infrastructure grows.

**Onboarding and migration material.** A getting-started guide that walks a new builder from CLI install through publishing a first package and verifying it independently against a Canton participant, plus a migration guide for projects currently consuming vendored DARs. The Foundation can link to these from its own developer onboarding paths to shorten the time-to-first-publish for new ecosystem members.

**Reference example packages.** Two reference packages published to the live registry, one demonstrating organization namespaces with on-chain ACL roles and the other demonstrating OIDC trusted publishing from a CI workflow. Other ecosystem teams can adapt these directly, and the Foundation gains canonical examples it can point to when teaching the patterns.

---

## About the Author

**Tolga Yaycı.** Software engineer with over four years of blockchain development experience, focused on developer tooling, infrastructure, and frontend systems. Holds a Bachelor's degree in Computer Science and has shipped multiple developer tools across blockchain ecosystems.

Recent grantee projects:

* **NearPlay**, an online IDE for NEAR smart contracts ([nearplay.app](https://nearplay.app/))
* **Hedera VS Code Extension**, a toolkit for building on Hedera ([marketplace](https://marketplace.visualstudio.com/items?itemName=tolgayayci.hedera-vscode))
* **Sora**, a desktop application for interacting with the Stellar network ([repo](https://github.com/tolgayayci/sora))
* **Arbitrum Stylus VS Code Extension**, a developer suite for Stylus ([marketplace](https://marketplace.visualstudio.com/items?itemName=tolgayayci.stylussuite))
* **ICP Dashboard**, a desktop application for interacting with the Internet Computer ([repo](https://github.com/tolgayayci/dfx-dashboard))

---

## Motivation

A package registry is the missing piece between Canton's settled package addressing model and the developer ecosystem expected to build on it. The 2026 Developer Experience Survey makes the gap concrete. A developer base that is 80% new to the ecosystem in the prior year, and 71% from Ethereum Virtual Machine backgrounds, repeatedly named registry-style tooling such as Cargo, Hardhat, and Foundry as the experience they expect. The same survey describes the current Daml dependency workflow, in respondents' own words, as "a manual, file-based process" of "manually downloading files, moving them between folders, and struggling to resolve version mismatches."

No proposal in the Canton Development Fund repository currently addresses this gap, despite `dar-app-management` and `daml-tooling` both being eligible categories. A community-built registry, anchored on the chain it serves and licensed openly under Apache 2.0, fills exactly the kind of shared developer infrastructure the Foundation's mandate prioritizes.

The technical contribution is the on-chain anchor. No traditional registry such as npm, crates.io, PyPI, or Maven Central anchors provenance on a blockchain. The only meaningful precedent is Sui's Move Registry, which uses possession of a SuiNS NFT as implicit signing authority. `damlpkg` goes further: every published `(name, version, darSha256)` is bound by an explicit Ed25519 signature embedded in a `PackageRecord` Daml contract, with a public observer party that lets any third-party participant witness every record. A consumer who does not trust the registry server can verify integrity end-to-end against the ledger.

---

## Rationale

**Off-ledger primary, on-ledger as projection.** PostgreSQL is the source of truth, while the blob store and Canton contracts are content-addressable projections recoverable by replay from Postgres. Making Canton authoritative was considered and rejected. Daml templates are an excellent venue for invariants but a poor venue for arbitrary metadata such as READMEs, search tokens, download statistics, and SBOMs, and recovery from a participant reset becomes structurally harder when the ledger is the source of truth. Treating Postgres as durable and the on-chain projection as recoverable yields more operability without weakening integrity, because every byte that ever served a consumer is bound to a SHA-256 that the on-chain `PackageRecord` independently witnesses.

**Async Canton writes rather than synchronous on-chain commit.** Synchronous writes were considered and rejected because BFT consensus round-trips would push HTTP publish latency into multi-second territory and would couple registry availability to ledger availability. The queue-plus-worker pattern with deterministic command ids absorbs this latency entirely, makes resubmits idempotent at the participant level, and lets the reconciliation sweep recover from any out-of-band participant reset.

**On-chain provenance via Canton, not via an external transparency log.** A first-pass design used Sigstore, but Sigstore depends on infrastructure entirely outside the network the packaged code is built for. Anchoring `PackageRecord` contracts on a Canton participant binds provenance to the same blockchain platform that runs the packaged code, and lets observers replicate every record without trust in the registry server.

**Immutable-with-yank rather than free deletion.** Hard-deletion of a published version corrupts every downstream consumer's lockfile, which is why crates.io's permanent-archive model and PyPI's PEP 592 yank semantics both preserve the underlying artifact. The four enforcement layers (the database policy, application code, R2 retention lock, and on-chain `PackageRecord` history) ensure that bypassing any one layer is detectable by another.

**Materialize into `data-dependencies:`, do not fork `dpm`.** The CLI shells out to `dpm build` for compilation, calls `dpm inspect-dar --json` for metadata, and uses `dpm upgrade-check` to gate SCU compatibility. Install resolves registry coordinates to local DAR paths and writes them into the project's standard `data-dependencies:` block, which `dpm build` already understands. This honors the constraint that no Digital Asset toolchain component is modified, keeps the project resilient across `dpm` releases, and makes adoption reversible: a project that adopts the registry can drop back to file-path dependencies later without losing any code.
