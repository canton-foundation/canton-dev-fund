## Development Fund Proposal

**Author:** Vladislav Kotsev
**Status:** Submitted
**Created:** 2026-05-28
**Label:** daml-tooling
**Champion:** Need Champion

---

## Abstract

This proposal outlines the design and implementation of a package registry as an **extension to the existing Daml Package Manager (`dpm`) tool**. The registry enables Daml developers to publish, discover, and consume reusable Daml libraries through a centralized, reliable infrastructure — all from within the `dpm` CLI they already use.

The system follows a source-distribution model: authors publish Daml source code, and compilation happens on the consumer's machine using the existing `dpm build` pipeline. No new compiler or build system is introduced; the registry adds registry-aware commands and orchestration on top of `dpm`'s existing capabilities.

The architecture separates concerns into three distinct phases — **Resolve**, **Fetch**, and **Build** — each with clear boundaries, well-defined inputs and outputs, and independent scalability characteristics.

---

## Specification

### 1. Objective

The Daml ecosystem currently lacks a centralized mechanism for distributing and reusing libraries. Developers who want to share Daml code across projects or teams must resort to manual approaches — copying source files, sharing tarballs via email or chat, or vendoring dependencies directly into repositories. This creates several compounding problems:

- **Code duplication and drift.** Without a single source of truth for shared libraries, teams maintain their own copies. Bug fixes and improvements in one copy do not propagate to others, leading to divergent codebases and duplicated effort.

- **No dependency management.** Daml projects that depend on shared code have no way to declare, resolve, or version those dependencies. Developers must manually track which versions of which libraries are compatible with each other and with the target SDK version — a process that is error-prone and does not scale.

- **Friction in collaboration.** The absence of a publish-and-consume workflow discourages library authorship. Developers who build useful abstractions have no straightforward way to make them available to the broader community, limiting the growth of the ecosystem.

- **Reproducibility risk.** Without lockfiles or checksums, there is no guarantee that two developers building the same project will use identical dependency versions. This undermines auditability and compliance — properties that are especially important in the financial and regulated industries where Daml is deployed.

This proposal brings package registry capabilities to Daml — providing a registry with a publish/resolve/fetch/build pipeline, versioned dependencies, lockfile-based reproducibility, and a discovery interface — removing the key infrastructure gap that currently limits Daml library adoption and ecosystem growth.

### 2. Implementation Mechanics

#### 2.1. Architecture Overview

The registry comprises five major components that work together but are operationally independent:

| Component | Responsibility | Technology |
| --- | --- | --- |
| Registry service | Publish API, authentication, authorization, metadata storage, index regeneration | Application server + PostgreSQL |
| Blob storage | Source tarball hosting, static index file serving for version discovery | S3/GCS/R2 behind CDN |
| Discovery service | Full-text package discovery, read-only | Application server+ Logstash + Elasticsearch |
| Web frontend | Package browsing, search UI, documentation, download stats | Web application consuming Discovery service APIs |
| CLI client | Resolve, fetch, build orchestration, lockfile management | Extension of existing `dpm` tool |

The Registry service is the only component that handles writes. Blob storage and the search service are read-only from the client's perspective, served through CDN and Elasticsearch respectively. This separation ensures that the read path (which handles orders of magnitude more traffic than writes) never touches the application server or database.

##### High-level architecture diagram

<img width="1537" height="1044" alt="image" src="https://github.com/user-attachments/assets/338c4e1a-daaf-4f24-ba43-5b49f1d6d387" />

##### Read paths diagram

<img width="2139" height="1030" alt="image 1" src="https://github.com/user-attachments/assets/8b1a892f-9bae-4131-8cba-47de2793595e" />

#### 2.2. Operational Phases

##### Phase 1: Resolve

The resolve phase answers the question: given the dependencies declared in a project's `daml.yaml`, which exact versions of which packages are needed, and in what order must they be built?

**Package version discovery**

The registry maintains one static file per package in blob storage, following a deterministic directory-sharding scheme. Each file contains newline-delimited JSON (NDJSON) with one record per published version, including the version number, dependency list, checksum, and status.

When the resolver needs to know what versions of a package exist, it fetches this single file from the CDN. The response is typically a few kilobytes and is aggressively cached.

**Index file format**

Each line in an index file is a self-contained JSON record:

- **`name`** — package name (must match the filename in the index)
- **`vers`** — version string
- **`deps`** — array of dependency objects, each with name and version requirement
- **`cksum`** — SHA-256 digest of the source tarball
- **`sdk_version`** — minimum compatible Daml SDK version
- **`status`** —  indicating the status

Example index file at path `da/ml/daml-finance`:

```json
{"name":"cip-56","vers":"1.0.0","deps":[...],"cksum":"aaa...","sdk_version":"3.3.0","status":"active"}
{"name":"cip-56","vers":"2.0.0","deps":[...],"cksum":"aaa...","sdk_version":"3.4.10","status":"active"}
```

This format is chosen for its fault isolation (a corrupt line does not invalidate other versions), append-friendliness, and streaming parseability.

**Dependency resolution algorithm**

The resolver operates as a constraint satisfaction process:

1. **Parse `daml.yaml`** to extract direct dependencies and their version requirements.
2. **Fetch index files** for each direct dependency from the CDN. All requests within a resolution round are issued in parallel.
3. **Select candidate versions** for each dependency by filtering the index file for versions matching the requirement that are not deprecated, preferring the newest compatible version.
4. **Discover transitive dependencies** by reading each candidate's dependency list from the same index file. Newly discovered packages are added to the resolution queue.
5. **Repeat** until the queue is empty. Each round may discover new transitive dependencies, triggering further index file fetches.
6. **Check constraints** across the full resolved tree. If two packages require incompatible versions of the same dependency, the resolver backtracks and tries an alternative version. Backtracking requires zero additional network requests because each index file contains all versions.

The output of the resolve phase is a complete,  dependency tree with nodes: package-name + exact-version + checksum triples. This list is written to a `daml-lock.yaml` file.

**Resolution flow diagram**

<img width="2324" height="410" alt="image 2" src="https://github.com/user-attachments/assets/25b30c0b-396f-49f9-845c-c49c3abfaa53" />

**The lockfile: `daml-lock.yaml`**

The lockfile is a critical artifact for reproducible builds. It records the exact resolution result so that subsequent builds skip the resolve phase entirely.

- **First build:** resolver runs fully, writes `daml-lock.yaml`.
- **Subsequent builds:** resolver reads `daml-lock.yaml`, skips resolution, proceeds directly to fetch.
- **Explicit update:** `dpm update` re-runs resolution and regenerates `daml-lock.yaml`.
- **CI/CD:** build with `-locked` flag, which fails if `daml-lock.yaml` is missing or out of date, ensuring reproducibility.

The lockfile should be committed to version control. It guarantees that every developer and every CI run uses identical dependency versions.

Example `daml-lock.yaml`:

```yaml
registry: https://registry.daml.com
sdk-version: 3.4.0

packages:
  canton-triggers:
    version: 1.3.0
    checksum: sha256:aaf291...
    source: https://registry.daml.com/tarballs/canton-triggers-1.3.0.tar.gz
    dependencies:
      daml-utils:
        version: 1.2.5
        checksum: sha256:ddd456...
        source: https://registry.daml.com/tarballs/daml-utils-1.2.5.tar.gz
        dependencies: {}
      json-codec:
        version: 0.8.1
        checksum: sha256:bb7e03...
        source: https://registry.daml.com/tarballs/json-codec-0.8.1.tar.gz
        dependencies:
          daml-utils:
            version: 1.2.5
            checksum: sha256:ddd456...
            source: https://registry.daml.com/tarballs/daml-utils-1.2.5.tar.gz
            dependencies: {}
  auth-lib:
    version: 0.3.0
    checksum: sha256:fff012...
    source: https://registry.daml.com/tarballs/auth-lib-0.3.0.tar.gz
    dependencies:
      daml-utils:
        version: 1.2.5
        checksum: sha256:ddd456...
        source: https://registry.daml.com/tarballs/daml-utils-1.2.5.tar.gz
        dependencies: {}
```

##### Phase 2: Fetch

Once the resolve phase produces a list of exact packages and versions, the fetch phase downloads the source tarballs. This phase is entirely decoupled from resolution — it receives a tree of deps and downloads files.

**Parallel tarball download**

Tarballs are fetched from the CDN in parallel. The parallelism strategy is organized by tree level: all packages at the same depth in the dependency tree are fetched concurrently before moving to the next level. This produces a natural batching that aligns with the build order (leaf dependencies are fetched first, which allows the build phase to begin compilation before all downloads complete).

Each download is verified against the SHA-256 checksum recorded in the index file. If the checksum does not match, the fetch fails and the tarball is discarded. This provides integrity verification end-to-end: the checksum was written during publish, stored in the index, and checked on fetch.

**Local caching**

Fetched tarballs are cached locally in a content-addressable store under the dpm home directory. The cache layout separates raw tarballs from unpacked source:

- **`cache/`** — raw `.tar.gz` tarballs, keyed by package name and version. These are the files exactly as downloaded from the CDN.
- **`.deps/`** — unpacked source directories, created by extracting the cached tarball. This is what the compiler reads.

On subsequent builds, the fetch phase checks the local cache before issuing any network request. If the tarball is present and its checksum matches, the download is skipped entirely. This makes repeated builds within the same environment effectively free from a network perspective.

The cache persists across projects. If two projects on the same machine depend on the same version of a package, the tarball is downloaded once and shared through the cache.

**Fetch flow diagram**

<img width="753" height="1115" alt="image 3" src="https://github.com/user-attachments/assets/5a4b87e2-3efc-4a54-83cd-a3b758c9db23" />

**Fetch-build overlap**

Because tarballs are fetched by tree level, leaf dependencies become available before deeper packages finish downloading. The implementation may optionally begin compilation of fully-fetched leaves while inner packages are still being downloaded. This pipelining reduces total wall-clock time for cold builds with deep dependency trees.

##### Phase 3: Build

The build phase compiles all fetched source packages and the user's project code into DAR archives. This phase reuses the existing `dpm build` tool — the registry does not introduce a new compiler or build system.

**Topological compilation order**

The dependency graph from the resolve phase is topologically sorted to produce a valid compilation order. Packages with no dependencies (leaf nodes) are compiled first. Each subsequent compilation step can reference the compiled outputs of its dependencies.

The build orchestrator invokes `dpm build` for each package in order, passing the appropriate dependency DAR paths. Multiple independent packages at the same tree level are compiled in parallel.

**Build orchestration flow diagram**

- **Wave 1:** compile all leaf packages (zero dependencies) in parallel. These produce `.dar` files in the local build output directory.
- **Wave 2:** compile packages whose dependencies are all in wave 1. Each compilation receives the `.dar` outputs from wave 1 as `data-dependency` references.
- **Wave N:** continue until the user's project is reached. The user's project is always compiled last.

<img width="812" height="1119" alt="image 4" src="https://github.com/user-attachments/assets/26da0c35-052a-42d6-8d84-bb114a286605" />

**Integration with `dpm build`**

The build phase does not replace `dpm build`. Instead, the CLI orchestrator invokes `dpm build` once per package in the resolved dependency tree, constructing the appropriate `daml.yaml` and `data-dependencies` configuration for each invocation. The user's project's `daml.yaml` remains unchanged — the orchestrator synthesizes temporary build configurations for dependencies behind the scenes.

This approach ensures full compatibility with existing Daml SDK versions, feature flags, and compiler options. The registry introduces no new compilation semantics.

Each compiled `.dar` is stored in a local build cache keyed by package name, version, and SDK version. If a dependency has already been compiled with the same SDK version in a previous build, the cached `.dar` is reused without recompilation.

#### 2.3. System Components

##### Registry Service

The Registry service handles all write operations and serves as the control plane for the registry.

**Publish path**

When an author publishes a package, the backend server performs the following operations as an atomic sequence:

1. **Authenticate and authorize** the request using the author's API token. Verify that the token has publish scope for the target package namespace.
2. **Validate** the package manifest: name conforms to naming rules, version follows semantic versioning, version does not already exist (immutability guarantee), declared dependencies are resolvable, and tarball size is within limits.
3. **Store metadata** in Relational DB: version record, dependency list, ownership and SDK compatibility.
4. **Upload tarball** to blob storage at a deterministic key derived from the package name and version.
5. **Regenerate index file** by querying all versions of the package from the database, serializing to NDJSON, and uploading to blob storage, replacing the previous file.
6. **Invalidate CDN cache** for the updated index file path so that subsequent resolver requests receive the latest version.
7. Logstash uses JDBC Pull to update ElasticSearch

**Publish flow diagram**

<img width="1300" height="1138" alt="image 5" src="https://github.com/user-attachments/assets/7269ba69-3ede-47d6-afd7-fe1f83429449" />

**Authentication and authorization**

The Registry Service uses scoped API tokens for publish operations. Tokens are created through the web interface or CLI and can be scoped to specific packages or namespaces. All publish operations require a valid token; read operations (resolve, fetch) are unauthenticated and served entirely from the CDN.

The authorization model supports package ownership: only the original publisher or explicitly added co-owners can publish new versions of an existing package. Ownership transfers require confirmation from both parties.

**Metadata storage**

The relational DB serves as the source of truth for all registry metadata. The index files in blob storage are derived views regenerated from the database on every publish or status update. This ensures consistency: if an index file is corrupted or lost, it can be regenerated deterministically from the database.

Metadata stored in the database includes: package name and description, all version records, dependency list per version.

**Status semantics**

Published versions cannot be deleted. They can only be deprecated, which hides the version from new dependency resolutions while still serving it to existing lockfiles that reference it. This balances supply-chain safety (a malicious version can be suppressed) with build stability (existing projects do not break).

##### Package Discovery Service

Package discovery is served by a read-only Elasticsearch instance, decoupled from the Registry service. This service answers cross-package queries that the per-package index files cannot serve: keyword search, category filtering, and author lookup.

The Elasticsearch index is updated asynchronously on each publish. It is not on the critical path for resolution or fetching — a temporary lag in search indexing does not affect builds. If the search service goes down entirely, resolution and builds continue unaffected; only the web frontend's search functionality degrades.

The Discovery service API is exposed as a read-only HTTP endpoint consumed by the web frontend and optionally by the CLI for a `dpm search` command.

##### Web Frontend

The registry includes a web frontend for browsing, searching, and discovering packages. This is the primary interface for developers who don't yet know the name of the package they need — the discovery use case that the CLI's `dpm search` also serves, but with a richer visual experience.

**Architecture**

The web frontend is a standalone web application that consumes the **Discovery Service API (Elasticsearch).**

The frontend does not interact with blob storage or index files directly. Those are consumed exclusively by the CLI during resolve and fetch.

**Pages and features**

**Search page** — the landing experience. A prominent search bar with type-ahead suggestions. Results display package name, short description, latest version, and last updated date. Filtering by category, SDK version, and sort order (recently updated). Pagination with infinite scroll or numbered pages.

**Package detail page** — displayed when a user clicks a search result or navigates to `registry.daml.com/packages/{name}`. Shows:

- Package name, current version, and one-line description
- Install command (`dpm add {name}`) with copy-to-clipboard
- README rendered from the package source (extracted during publish and stored in the database)
- Version history with publication dates and SDK compatibility
- Dependency list
- Owner/author information with links to their other packages

**Author/organization page** — lists all packages published by a specific author or organization, with aggregate download statistics.

**Category browser** — faceted navigation by category (finance, testing, utilities, etc.) and SDK version. Categories are assigned by the author in the package manifest and validated during publish.

##### CLI Client

The CLI client is an extension of the existing `dpm` tool, adding registry-aware commands to the toolchain developers already use. All three phases (resolve, fetch, build) are orchestrated by `dpm`; the registry backend is passive after the publish step.

**New commands**

| Command | Description |
| --- | --- |
| `dpm add <pkg>` | Add a dependency to `daml.yaml` and run resolve + fetch |
| `dpm remove <pkg>` | Remove a dependency from `daml.yaml` and re-resolve |
| `dpm update` | Re-resolve all dependencies, updating `daml-lock.yaml` to latest compatible versions |
| `dpm publish` | Package source, validate, and upload to the registry |
| `dpm search <query>` | Search the registry for packages matching a query |
| `dpm login` | Authenticate with the registry and store API token locally |
| `dpm depricate <ver>` | Depricate  a published version (hide from new resolutions, still serve to existing lockfiles) |
| `dpm info <pkg>` | Display package metadata, versions, and dependency list |
| `dpm tree` | Display the dependency tree |

The existing `dpm build` command is extended to automatically run resolve and fetch if `daml-lock.yaml` is missing or stale, providing a seamless experience where a single `dpm build` command handles the full pipeline.

**CLI interaction flow diagram**

<img width="2313" height="665" alt="image 6" src="https://github.com/user-attachments/assets/c0defe8a-983c-4469-9462-edb74b9cb700" />

#### 2.4. Phase Summary

| Phase | Input | Output | Network | Cached by |
| --- | --- | --- | --- | --- |
| Resolve | `daml.yaml` + version requirements | `daml-lock.yaml` (exact versions + checksums) | CDN index files | `daml-lock.yaml` |
| Fetch | `daml-lock.yaml` | Source tarballs on disk | CDN blob storage | Local tarball cache |
| Build | Unpacked source + dependency DARs | Compiled `.dar` archives | None | Local build cache |

Each phase completes fully before the next begins (with optional fetch-build pipelining for leaf dependencies). Each phase has its own caching layer, making repeated operations progressively faster: a fully cached build touches zero network and skips straight to compilation of changed source files.

### 3. Architectural Alignment

This proposal is designed as an **extension to the existing Daml Package Manager (`dpm`) tool**, not a standalone tool. The `dpm` CLI already provides project scaffolding and build orchestration. This proposal adds registry-aware capabilities — dependency resolution, package fetching, publishing, and discovery — on top of that foundation. By building on `dpm` rather than introducing a separate tool, we preserve the developer workflows that Daml users already know, minimize adoption friction, and ensure full compatibility with existing `daml.yaml` project configurations and the Daml SDK toolchain.

Mature language ecosystems solve the library distribution problem with package registries: npm for JavaScript, crates.io for Rust, PyPI for Python, Maven Central for Java. Each of these transformed their respective ecosystems by making code reuse trivial, dependency management automatic, and builds reproducible. This proposal brings the same proven pattern to Daml.

### 4. Backward Compatibility

This proposal extends the existing `dpm` tool rather than replacing it. The user's project's `daml.yaml` remains unchanged — the orchestrator synthesizes temporary build configurations for dependencies behind the scenes. The build phase does not replace `dpm build`; it invokes `dpm build` once per package in the resolved dependency tree. This approach ensures full compatibility with existing Daml SDK versions, feature flags, and compiler options. The registry introduces no new compilation semantics.

Projects that do not use registry dependencies continue to work exactly as before — no changes to existing workflows are required.

---

## Milestones and Deliverables

### Milestone 1: Core Registry Service
- **Estimated Delivery:** Sprint 1
- **Effort:** 240 man-hours
- **Focus:** Database schema, authentication & authorization, publish API, and index file system
- **Deliverables / Value Metrics:**

| Deliverable | Description |
| --- | --- |
| Database schema | Design and implement metadata storage: packages, versions, dependencies, ownership |
| Authentication & authorization | Scoped API token generation, validation, package namespace ownership model |
| Publish API | Full publish path: validate manifest, store metadata, upload tarball, regenerate index file, invalidate CDN cache |
| Index file system | NDJSON index file format, deterministic directory-sharding scheme, index regeneration from database |

### Milestone 2: CLI Resolve Phase & Lockfile
- **Estimated Delivery:** Sprint 2
- **Effort:** 280 man-hours
- **Focus:** Index file fetching, dependency resolution algorithm, lockfile generation, and CLI commands
- **Deliverables / Value Metrics:**

| Deliverable | Description |
| --- | --- |
| Index file fetching | Parallel CDN index file retrieval with caching |
| Dependency resolution algorithm | Constraint satisfaction resolver with backtracking, transitive dependency discovery, version selection |
| Lockfile generation | `daml-lock.yaml` creation with exact versions, checksums, and source URLs |
| Lockfile-aware builds | Skip resolution when `daml-lock.yaml` is present and current; `-locked` flag for CI/CD reproducibility |
| CLI commands | `dpm add`, `dpm remove`, `dpm update`, `dpm info`, `dpm tree` |

### Milestone 3: CLI Fetch & Build Phases
- **Estimated Delivery:** Sprint 3
- **Effort:** 280 man-hours
- **Focus:** Parallel tarball download, local caching, build orchestration, and DAR build cache
- **Deliverables / Value Metrics:**

| Deliverable | Description |
| --- | --- |
| Parallel tarball download | Level-ordered parallel fetching from CDN with SHA-256 checksum verification |
| Local caching layer | Content-addressable tarball cache (`cache/`) and unpacked source directories (`.deps/`), shared across projects |
| Build orchestration | Topological sort of dependency graph, wave-based parallel compilation via `dpm build` |
| DAR build cache | Compiled `.dar` caching keyed by package name, version, and SDK version to skip recompilation |

### Milestone 4: Discovery Service
- **Estimated Delivery:** Sprints 3–4
- **Effort:** 160 man-hours
- **Focus:** Elasticsearch index, Logstash pipeline, Discovery API, and CLI search integration
- **Deliverables / Value Metrics:**

| Deliverable | Description |
| --- | --- |
| Elasticsearch index | Schema design for package metadata: name, description, keywords, author, categories, SDK version |
| Logstash pipeline | JDBC pull from PostgreSQL to Elasticsearch, triggered on publish events |
| Discovery API | Read-only HTTP API: full-text search, category filtering, author lookup |
| CLI search integration | `dpm search <query>` command consuming the Discovery API |

### Milestone 5: Web Frontend
- **Estimated Delivery:** Sprint 4
- **Effort:** 200 man-hours
- **Focus:** Search page, package detail page, author/organization page, and category browser
- **Deliverables / Value Metrics:**

| Deliverable | Description |
| --- | --- |
| Search page | Landing page with search bar, filtering by category/SDK version, sort order, pagination |
| Package detail page | Package name, version, description, install command with copy-to-clipboard, rendered README, version history, dependency list, author info |
| Author/organization page | List of packages by author, aggregate download statistics |
| Category browser | Faceted navigation by category and SDK version |

### Milestone 6: Integration Testing, Stabilization & Documentation
- **Estimated Delivery:** Sprint 5
- **Effort:** 180 man-hours
- **Focus:** End-to-end testing, error handling, CLI polish, and documentation
- **Deliverables / Value Metrics:**

| Deliverable | Description |
| --- | --- |
| End-to-end testing | Full publish → resolve → fetch → build pipeline tests across multiple SDK versions and dependency graph shapes |
| Error handling & edge cases | Corrupt index recovery, network failure resilience, checksum mismatch handling, version conflict diagnostics |
| CLI polish | `dpm login`, `dpm deprecate`, error messages, progress indicators, help text |
| Documentation | Registry API documentation, CLI command reference, package author guide, contributor onboarding guide |

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone
- Demonstrated functionality or operational readiness
- Documentation and knowledge transfer provided
- Alignment with stated value metrics

**Milestone-specific acceptance criteria:**

- **M1 — Core Registry Service:** An author can authenticate, publish a Daml package via API, and the resulting index file and tarball are accessible from blob storage/CDN.
- **M2 — CLI Resolve Phase & Lockfile:** Running `dpm add <pkg>` resolves the full transitive dependency tree, produces a correct `daml-lock.yaml`, and subsequent runs skip resolution using the lockfile.
- **M3 — CLI Fetch & Build Phases:** A cold `dpm build` on a project with a multi-level dependency tree fetches all tarballs, compiles in correct topological order, produces valid `.dar` outputs, and a subsequent build hits cache with zero network requests.
- **M4 — Discovery Service:** Newly published packages are searchable within the indexing interval. The Discovery API returns relevant results for keyword, category, and author queries. The registry continues to function normally if the Discovery service is unavailable.
- **M5 — Web Frontend:** Users can discover packages via search and browse, view full package details including README and dependency information, and copy install commands directly from the web interface.
- **M6 — Integration Testing, Stabilization & Documentation:** All end-to-end scenarios pass. CLI provides clear error messages for all failure modes. Documentation covers all user-facing commands and workflows.

---

## Funding

**Total Funding Request:** 815,000 CC

### Payment Breakdown by Milestone
- Milestone 1 (Core Registry Service): 145,000 CC upon committee acceptance
- Milestone 2 (CLI Resolve Phase & Lockfile): 170,000 CC upon committee acceptance
- Milestone 3 (CLI Fetch & Build Phases): 170,000 CC upon committee acceptance
- Milestone 4 (Discovery Service): 100,000 CC upon committee acceptance
- Milestone 5 (Web Frontend): 120,000 CC upon committee acceptance
- Milestone 6 (Integration Testing, Stabilization & Documentation): 110,000 CC upon final release and acceptance

| Milestone | Description | Effort (man-hours) | Funding |
| --- | --- | --- | --- |
| M1 | Infrastructure Setup & Core Registry Service | 240 | 145,000 CC |
| M2 | CLI Resolve Phase & Lockfile | 280 | 170,000 CC |
| M3 | CLI Fetch & Build Phases | 280 | 170,000 CC |
| M4 | Discovery Service | 160 | 100,000 CC |
| M5 | Web Frontend | 200 | 120,000 CC |
| M6 | Integration Testing, Stabilization & Documentation | 180 | 110,000 CC |
| | **Total** | **1,340** | **815,000 CC** |

### Volatility Stipulation
If the project duration is **greater than 6 months**:
The grant is denominated in fixed Canton Coin and will require a re-evaluation at the 6-month mark.

If the project duration is **under 6 months**:
Should the project timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility.

---

## Co-Marketing
Upon release, the implementing entity will collaborate with the Foundation on:

- Announcement coordination
- Case study or technical blog
- Developer or ecosystem promotion

---

## Motivation

The Daml ecosystem currently lacks a centralized mechanism for distributing and reusing libraries. Developers who want to share Daml code across projects or teams must resort to manual approaches — copying source files, sharing tarballs via email or chat, or vendoring dependencies directly into repositories. This creates several compounding problems:

- **Code duplication and drift.** Without a single source of truth for shared libraries, teams maintain their own copies. Bug fixes and improvements in one copy do not propagate to others, leading to divergent codebases and duplicated effort.

- **No dependency management.** Daml projects that depend on shared code have no way to declare, resolve, or version those dependencies. Developers must manually track which versions of which libraries are compatible with each other and with the target SDK version — a process that is error-prone and does not scale.

- **Friction in collaboration.** The absence of a publish-and-consume workflow discourages library authorship. Developers who build useful abstractions have no straightforward way to make them available to the broader community, limiting the growth of the ecosystem.

- **Reproducibility risk.** Without lockfiles or checksums, there is no guarantee that two developers building the same project will use identical dependency versions. This undermines auditability and compliance — properties that are especially important in the financial and regulated industries where Daml is deployed.

Mature language ecosystems solve these problems with package registries: npm for JavaScript, crates.io for Rust, PyPI for Python, Maven Central for Java. Each of these transformed their respective ecosystems by making code reuse trivial, dependency management automatic, and builds reproducible.

This proposal brings the same capabilities to Daml. By providing a registry with a publish/resolve/fetch/build pipeline, versioned dependencies, lockfile-based reproducibility, and a discovery interface, we remove the key infrastructure gap that currently limits Daml library adoption and ecosystem growth.

Importantly, this proposal is designed as an **extension to the existing Daml Package Manager (`dpm`) tool**, not a standalone tool. The `dpm` CLI already provides project scaffolding and build orchestration. This proposal adds registry-aware capabilities — dependency resolution, package fetching, publishing, and discovery — on top of that foundation. By building on `dpm` rather than introducing a separate tool, we preserve the developer workflows that Daml users already know, minimize adoption friction, and ensure full compatibility with existing `daml.yaml` project configurations and the Daml SDK toolchain.

---

## Rationale

This proposal extends the existing `dpm` tool rather than introducing a standalone registry client. This is the right approach because:

- **Preserves existing workflows.** Daml developers already use `dpm` for project scaffolding and build orchestration. Adding registry capabilities to `dpm` means no new tool to install, learn, or integrate into CI/CD pipelines.

- **Source-distribution model.** Authors publish Daml source code, and compilation happens on the consumer's machine using the existing `dpm build` pipeline. No new compiler or build system is introduced. This ensures compatibility across SDK versions and avoids the complexity of pre-compiled binary distribution.

- **Three-phase architecture (Resolve → Fetch → Build).** Each phase has clear boundaries, independent caching, and well-defined inputs/outputs. This separation makes the system debuggable, testable, and extensible. Alternative approaches (e.g., a monolithic build tool that combines all phases) were rejected because they conflate concerns and are harder to evolve.

- **Static index files over live API queries.** The resolver reads static NDJSON files from a CDN rather than querying a live API. This design was chosen because it eliminates the registry server as a bottleneck on the read path, enables aggressive CDN caching, and allows offline resolution when index files are cached locally. The alternative — a live resolution API — was rejected because it creates a single point of failure and does not scale as well.

- **Lockfile-based reproducibility.** The `daml-lock.yaml` lockfile captures exact versions and checksums, guaranteeing identical builds across developers and CI environments. This is especially critical for financial and regulated industries where Daml is deployed.

- **Fits into the existing ecosystem.** This proposal does not replace any existing component. It extends `dpm`, reuses `daml.yaml` project configurations, and integrates with the Daml SDK toolchain. The default approach of extending what exists was followed rather than building from scratch.
