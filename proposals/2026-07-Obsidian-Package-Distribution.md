**Title:** Daml Package Registry with Reproducible Build Specifications

**Author:** John Ericson, Dylan Green, and Cale Gibbard @ Obsidian Systems

**Status:** Submitted

**Label:** daml-tooling, security, ecosystem

**Champion:** Shaul Kfir (Digital Asset)

---

## **Abstract**

Daml lacks shared package distribution infrastructure. Today's developers exchange DARs as files, with no central place to publish, discover, audit, or version them. Transitive dependencies are tracked by hand, and integrators have no automated way to check whether a package has been audited or whether the binary they're loading matches the reviewed source. This proposal funds the infrastructure to change that.

This work also addresses supply-chain attack vectors to which the current ad-hoc distribution mechanisms are vulnerable. npm's 2025-2026 compromises (Shai-Hulud, Axios, credential-stealing campaigns; see [Supply-chain attacks on package ecosystems](#supply-chain-attacks-on-package-ecosystems)) show that the architectural pattern most ecosystems have settled on does not defend against maintainer compromise, build-environment tampering, or social engineering. For the Canton Network, running in regulated financial infrastructure where every consumer is a validator node operating under compliance constraints, the stakes are higher than in general-purpose ecosystems. The proposal is structured in two phases. A **registry baseline** that provides **package discovery**, **audit-aware metadata**, and identity-verified attestations, so that audit status can become a first-class concept in Daml's tooling. A **deeper-verification layer** offers two paths: **source-to-DAR verification** via damlc, and **hermetic Nix-derivation builds** (binding source, compiler, SDK, and build environment into a single content-addressed hash) with independent-rebuilder attestations for auditors. The audit publication pipeline will be available to any audit partner who wishes to participate. Auditors active in the Canton ecosystem such as Halborn have already expressed their support. Sources reviewed by auditors will be made traceable through SHA-256 hashing and audit metadata so that information about specific reviewed revisions is publicly available. Artifact distribution will be multi-mirror (via both OCI and Nix substituters).

This proposal extends Canton's existing `dpm` toolchain via its OCI component model without requiring forking or protocol changes. The **registry baseline** requires no changes to upstream toolchains and plugs into `dpm`'s existing component model. The damlc source-to-DAR verification path requires a small, additive extension to damlc that will be coordinated with the team that builds and maintains that tooling, as a parallel non-blocking work stream. Publication of existing core DARs from Canton open-source repositories (Splice, the Daml SDK) will help bootstrap the infrastructure and establish a contribution path for further organic growth and collaboration.

This project falls under both the Canton Development Fund's `daml-tooling` and `dar-app-management` categories.

---

## **Motivation**

### Current state of Daml package distribution

The Canton Network Developer Experience and Tooling Survey (Q1 2026\) characterizes the current package-sharing workflow in developers' own words as a "manual, file-based process" in which developers are "manually downloading files, moving them between folders, and struggling to resolve version mismatches." The survey places **"Daml Dependency & Package Manager"** among the top tooling opportunities and lists **"Package Manager & Operational Dashboards (Cargo)"** on its Magic Wand Wishlist. The survey also reports that **75% of respondents rated Security & Auditing Tools as either "Important" (51%) or "Critical" (24%)**, the second-highest priority category. Demographically, 83% of respondents work on TradFi or hybrid (TradFi \+ Crypto) projects, and 71% bring an Ethereum/EVM background, meaning they have first-hand experience with the supply-chain attacks that have compromised the npm ecosystem repeatedly through 2025-2026. The community is asking for this work, and they are asking for it in part because they recognize what happens to ecosystems that do not address it.

Concretely, Daml dependency management today consists of entries in `daml.yaml/multi-package.yaml` pointing either directly at `.dar` file paths or at remote OCI URIs (as of Daml SDK 3.5.2). Widely used utility DARs (canton-coin, splice-amulet, registry-app, credential-app, etc.) are distributed as direct downloads or OCI URLs with SHA-256 checksums. That's the best the ecosystem currently offers, and only a few participants are doing so. Outside DA and CF's own pipelines, distribution is ad-hoc: developers send or git-vendor DARs, transitive dependencies are tracked by hand, and there is no mechanism for an integrator to ask "has this been audited?" with a reliable, easily-verifiable answer.

The compounding effects of this ad-hoc model are:

- **Repeated reinvention without consolidation.** Every team using interval arithmetic, currency primitives, or common authorization patterns builds them anew. Fixes in one implementation don't propagate to the others; vulnerability findings patched in one team's copy stay open in every other. The result is a fleet of subtly-different implementations of the same ideas, each carrying its own bugs and its own subset of the fixes that have been independently discovered elsewhere. We at Obsidian have experienced this ourselves across client projects. Relevant dev fund proposals include: [daml-u256](https://github.com/canton-foundation/canton-dev-fund/pull/177), [NFT reference implementation](https://github.com/canton-foundation/canton-dev-fund/pull/267), [tokenized vaults](https://github.com/canton-foundation/canton-dev-fund/pull/99), each of which would be a good candidate for shared, open source implementation.
- **No supply chain clarity for integrators.** A validator node operator integrating a third-party package today cannot ask "has this been audited?", "does this binary match the source someone reviewed?", or "is this version compatible with my application's SCU constraints?" and get a clear, checkable answer. Those questions are answered, when they are answered, entirely manually.
- **Reproducibility that stops at transport.** Regulated consumers need to be able to prove a correspondence between deployed binaries and audited sources. Source checksums in a lockfile catch transport tampering, but nothing else: compiler versions, SDK versions, build environments, and build flags can all vary, and the resulting `.dar` files differ even when their source matches. This creates a gap between "audited code" and "delivered binary".

Mature language ecosystems (npm for JavaScript, crates.io for Rust, PyPI for Python, Maven Central for Java, Hackage for Haskell) solve the venue, discovery, and shared-composition problems by giving their communities a place to publish and find work. Each transformed its respective ecosystem accordingly. But those ecosystems' security and reproducibility models do not suit regulated financial infrastructure: they catch transport tampering but not build-environment tampering; they surface community-curated metadata but not first-class audit status; they help with discovery but not with the human-review and auditing that real-world Canton users actually need. Recent npm history demonstrates what happens when the registry pattern is deployed without these additional layers. Daml is in a position to learn from those ecosystems' successes while addressing, from day one, the gaps the financial-infrastructure context exposes.

### The opportunity

Daml is used to encode financial infrastructure: trade lifecycle workflows, custody arrangements, regulatory reporting, payments, settlement, and so on. These applications need a reliable way to distribute the DARs they depend on, with provenance from source to binary, with audit status that can be checked at integration time, and with versioning that respects Canton's Smart Contract Upgrade semantics. None of those needs are met by the current ad-hoc distribution methods.

An audited, hash-verified Daml package registry makes a number of things possible:

- A team starting a new project can pull dependencies through `dpm registry add` with verifiable provenance, instead of git-vendoring DARs and tracking transitive dependencies by hand.
- A validator node operator integrating a third-party package can check audit status, see the audit's source-hash provenance, and refuse to materialize packages that don't meet their policy.
- Core open-source DARs (the Daml standard libraries, Splice libraries) can be distributed through one consistent mechanism rather than bundled into the SDK or checked into version control as large artifacts.
- New Canton Network dApp providers onboard with access to a familiar discovery and distribution model instead of learning the local DAR-handoff conventions of each codebase they touch.

Mature language ecosystems have package distribution infrastructure, and the infrastructure is rarely the most interesting part. What matters is the ecosystem that grows around it. Hackage made Haskell viable for industry by providing a venue where shared work could accumulate and be found. crates.io let Rust's ecosystem cohere by giving contributors a shared, standardized path to publication. Daml's properties and regulatory positioning give it a foothold in financial infrastructure that other languages cannot easily challenge. What it lacks today is the distribution venue,  protocol, and mechanism. This proposal addresses that gap in a way that also provides a security model that matches the financial infrastructure context.

### Supply-chain attacks on package ecosystems {#supply-chain-attacks-on-package-ecosystems}

The traditional registry model (single hosted registry plus lockfile with source checksums) has been refined for 15+ years across npm, PyPI, Cargo, Maven Central. The same architectural pattern has, demonstrably, been the surface attackers have learned to exploit at scale. Recent incidents include:

- **Shai-Hulud worm** (September 2025): self-replicating malware that compromised 500+ npm packages via automated maintainer account takeover and malicious republishing. Existing lockfile mechanisms cached the malicious versions perfectly. Checksums verified transport integrity but could not verify authorized intent.
- **Axios hijack** (March 2026): a package with 100M+ weekly downloads was compromised by a North Korean threat actor, who added a hidden dependency that installed a remote access trojan across developer machines and CI/CD pipelines globally.
- **May 2026 credential-stealing campaigns**: 14 malicious packages were published in a four-hour window, harvesting AWS credentials, HashiCorp Vault tokens, and CI/CD secrets. Concurrent dependency-confusion attacks published public packages matching organizational-scope names, tricking build systems into installing malicious versions instead of trusted internal packages.

The architectural lesson we've drawn from this is: **transport-layer integrity (checksums, lockfiles) does not defend against compromised maintainers, compromised build environments, or social-engineering attacks**. Mitigating those threats requires a different architecture.

### Regulated financial infrastructure

Daml runs in regulated financial infrastructure. Validator Node Operators are often regulated entities. "A validator node operator loads a third-party Daml package" is a security-critical operation. The same threat model applied to a system where every package mediates financial transactions is a larger problem than in general-purpose ecosystems. This proposal helps ensure that only benign packages are used in production by Canton Network users, and streamlines the audit, code publication, and library adoption process.

### Why Nix in Phase 2

Nix is the mature, existing infrastructure for producing reproducible, hash-verified builds. It is the best-in-class solution for software supply-chain security (see [Reproducible Builds as a Security Primitive](https://blog.obsidian.systems/daml-nix-reproducible-builds-as-a-security-primitive/)). This proposal builds on it instead of reinventing it. The hash covers the whole build (source, compiler, SDK, and environment) which proves a package was built from the exact source that was audited. Nix is already in production for Daml builds at financial institutions on Linux, macOS, and Windows, while the Phase 1 baseline serves consumers who do not adopt it.

Nix's has become more user-friendly and will not adversely impact `dpm`'s ease of adoption. We are planning on using newer features in Nix that will circumvent needing any non-trivial installation at all. Top-notch supply chain security and also installer-free usage on Linux, macOS, and Windows is now possible.

### Consuming without additional tooling

For institutions whose IT policies limit installation of new tooling (including the dpm-registry plugin), the registry remains usable through standard OCI and HTTP tooling. Every published package will be reachable via a stable OCI link (for compatibility with the [remote DAR features of dpm](https://docs.canton.network/appdev/modules/m5-environment-configuration#remote-dars)) or URL, with the SHA-256 DAR hash, the source hash (where source is distributed), the Nix derivation hash, and the audit reference all published as plain metadata. A user can fetch a DAR by URL, verify its SHA-256 against the published DAR hash, cross-check the audit reference against the same DAR hash, and place the file wherever their authorized build tooling expects to find it. The metadata that is used by `dpm registry add` is the same metadata a manual consumer would retrieve.

This access path is documentation and convention rather than a separate code path. The artifacts the registry serves are the artifacts a manual consumer downloads, and the hashes they verify against are the same hashes used by the audit pipeline. The automated tooling provides better ergonomics, but is not required for consuming the registry. This ensures the registry remains reachable from environments where tooling cannot be easily changed.

### What this proposal addresses

The proposal positions the Daml package ecosystem on a superior architectural footing from the start. The features fall into two groups: what makes the ecosystem *productive*, and what makes it *secure*. Section 1 lists the deliverables; this section frames what they add up to.

**Productivity** covers what makes the ecosystem work as a venue (all in the Phase 1 registry baseline): discovery and documentation surfaces with search, per-package pages, version history, and dependency graphs; SemVer-based version constraints on top of Canton's SCU semantics; and a `dpm`\-native developer experience that extends the existing toolchain via its OCI component model without requiring changes to upstream tooling. Any author with a published DAR gets a publication path, a discovery surface, and an opt-in audit pipeline.

**Security** covers what makes the ecosystem safe to build on. The **Phase 1 registry baseline** provides audit-aware metadata traceable to specific reviewed revisions (per the [Audit Metadata Schema](#audit-metadata-schema)); publisher- and auditor-signed attestations that a consumer verifies against the DAR they received; audit status as a first-class concept in the CLI, lockfile, and discovery surface, with tooling that refuses to auto-update across audit boundaries; and multi-mirror distribution via OCI with content-addressed hashes. The **Phase 2 deeper-verification layer** adds two paths: **damlc source-to-DAR verification** for consumers who need to check source-to-artifact correspondence without adopting Nix, and **Nix derivation hashing** (binding source, compiler, SDK, and build environment into a single content-addressed hash) with independent-rebuilder attestations, for auditors and organizations bootstrapping trust in the compiler itself.

These two groups compose. Distribution improvements without the security model would recreate the npm attack surface for a higher-stakes ecosystem. Security improvements without distribution changes would leave the current ad-hoc workflow in place. Financial infrastructure requires both, so this proposal addresses both.

This proposal primarily addresses pure code reuse: libraries, stdlib-style packages, utility modules, type classes and instances. Template-sharing across applications raises distinct architectural questions (vetting coordination, contract instance scoping, upgrade behavior) that require non-trivial Canton protocol work and careful coordination between users.  Initially, we expect most distributed packages to avoid these issues by not including templates. However, in cases where the architectural details have been worked out, the package management and distribution of code and/or binaries for agreed-upon templates is possible and beneficial.

A complementary pattern enabled by this proposal is vendoring: consumers can vendor a published package's source (repackaging it under their own name and namespace) to retain SCU control while still pulling upstream fixes through the registry, subject to any applicable licensing restrictions.

---

## **Specification**

### 1\. Objective

Build a package management infrastructure for Daml, structured as a `dpm` component (per DPM's documented OCI extension model), that delivers:

1. **Audit-aware tooling** that consumes auditor-produced audit metadata and surfaces audit status as a first-class concept in the CLI, the discovery surface, and the lockfile, including a `dpm registry audit` subcommand for standalone DAR verification.
2. **Multi-mirror distribution** via OCI and Nix substituters, with potential long-term preservation of source artifacts.
3. **A discovery surface** (website \+ `dpm-registry` plugin) for browsing packages, audit results, version history, and dependency graphs.
4. **Distribution and discovery mechanism for standard libraries**, including both Daml stdlib and core Splice libraries.
5. **Support distribution of open source and binary-only packages**, as long as artifact redistribution is allowed by the license, and audit can be provably linked to the binary.
6. **Source-to-DAR verification via damlc**, without requiring Nix, so damlc-only environments can verify source-to-artifact correspondence.
7. **Hermetic, reproducible builds** for Daml packages via Nix derivations, with verifiable provenance from source to compiled `.dar`.

Out of scope: on-chain registry contracts; modifications to `dpm` or the Canton protocol; funded library author seeding and funded library audits (to be proposed as separate work).

### 2\. Implementation Mechanics

The system has four architectural layers that compose: a **repository defining keys of publishers and auditors** (a GitHub repository with a consortium of parties who decide which key submissions are valid, similar to [ERC-7730](https://github.com/ethereum/clear-signing-erc7730-registry) or [cargo-vet](https://mozilla.github.io/cargo-vet)), a **metadata layer** (consuming the [Audit Metadata Schema](#audit-metadata-schema) where present), a **source-and-build layer** (OCI distribution in Phase 1; Nix derivations and substituters added in Phase 2), and an **orchestration layer** (the `dpm-registry` plugin, with a `nix` subcommand tree for Phase 2 operations).

#### Two phases of work

The proposal delivers two phases with distinct roles; they compose architecturally (Phase 2 layers on top of Phase 1\) but can be developed in parallel.

**Phase 1: Registry baseline.** The registry, discovery, audit metadata pipeline, publisher/auditor identity governance, dpm-integrated fetching (via hash-pinned OCI references), and the `dpm-registry` plugin with an `audit` subcommand for DAR-hash and audit-attestation verification (see [Audit check](#audit-check-phase-1-verification)). This is the groundwork exercised regardless of which deeper verification path a consumer chooses. The trust anchor is the auditor's signed attestation.

**Phase 2: Deeper verification paths.** For consumers who need to verify source-to-DAR correspondence themselves rather than trusting the auditor attestations alone, this proposal provides two paths that can be chosen based on threat model and available tooling:

- **damlc source-to-DAR verification** (see [Source-to-DAR verification](#source-to-dar-verification-damlc)): unpacks source, recompiles under damlc installed via DPM, checks the main DALF's package ID. No Nix required. The trust anchor is the SDK distribution channel through which damlc is delivered.
- **Nix hermetic builds and independent-rebuilder attestations**: reproducible builds that verify the compiler binary itself, for auditors and organizations that need to bootstrap trust in the compiler from source. The trust anchor is a set of multi-party reproducible-build attestations.

Phase 1 stands independently. Phase 2 is opt-in and layers on top; a project's `daml.yaml` is the same regardless of which phase is used, so consumers pick the trust anchor at build time without changing the project configuration. The subsections below describe the constituent components, each of which contributes to one phase or spans both.

#### Keys of Publishers and Auditors

Publisher and auditor keys will be managed in a GitHub repository maintained by a consortium of trusted parties who decide which key submissions are valid. This follows the [cargo-vet](https://mozilla.github.io/cargo-vet/how-it-works.html) pattern: human review and publisher trust are represented as repository-managed metadata, importable and checkable by tooling. The Daml registry extends this pattern by adding Daml package IDs, DAR hashes, Nix derivation hashes, and auditor identities while using [gittuf/TUF-style](https://gittuf.dev/documentation) repository policy to protect the trust metadata itself.

#### Distribution

- **The `dpm-registry` plugin will be distributed via OCI** through DPM's component model. Users will install it with `dpm install dpm-registry` (or by direct OCI reference per [DPM's component configuration](https://docs.digitalasset.com/build/3.4/dpm/configuration.html)). Phase 2 Nix operations will be exposed as a subcommand tree (`dpm registry nix ...`) within the same plugin.
- **Registry packages are distributed via OCI, with Nix substituters added in Phase 2\.** OCI will support multi-mirror through registry replication and Nix substituters are inherently multi-mirror by design. A breach or sunset of any single endpoint will not strand the ecosystem. DARs and sources will be content-addressed by SHA-256 hash and traceable through the audit metadata to a specific reviewed revision. In the future, integration with long-term source archives like Software Heritage or IPFS archives is a natural extension for dependency preservation.
- **The damlc source-to-DAR verification extensions ship via future SDK releases.** The DAR-format additions, unpacker, and verifier command will be upstream contributions to damlc coordinated with the maintainers. Consumers will receive them by upgrading damlc through the standard SDK distribution channel, not through this registry.
- **The discovery website will be hosted by Obsidian** and will provide package browsing, search, per-package pages, version history, and dependency graphs. It will link to OCI or URL locations for DAR retrieval.
- **Publisher and auditor identity metadata will be distributed via a public git repository** (see [Keys of Publishers and Auditors](#keys-of-publishers-and-auditors)). Consumers will clone or fetch specific revisions to obtain the current registered keys and audit references. Signature verification will run against the state of the repo at the revision the consumer pinned.

#### Project model

A user adds a registry dependency:

```
$ dpm registry add interval-tree@^1.2
Resolving interval-tree@^1.2 -> 1.2.3 in registry...
✓ Adding oci://registry.example.com/interval-tree:1.2.3@sha256:def456...
✓ 3 transitive dependencies added
✓ Updated daml.yaml
```

The plugin wraps DPM's existing OCI-DAR mechanism (see [remote DAR features of dpm](https://docs.canton.network/appdev/modules/m5-environment-configuration#remote-dars)) with registry-side version resolution. The resulting `daml.yaml`:

```
sdk-version: 3.4.0
name: my-app
version: 1.0.0
source: daml

dependencies:
  - daml-prim
  - daml-stdlib
  - oci://registry.example.com/interval-tree:1.2.3@sha256:def456...     # tool-managed
  - oci://registry.example.com/canton-finance:1.0.0@sha256:abc789...    # tool-managed
  - oci://registry.example.com/interval-helpers:2.1.0@sha256:123abc...  # tool-managed (transitive)

registry-dependencies:                                                      # user-edited; dpm-registry tracks the version constraint
  - interval-tree@^1.2

components:
  - damlc:3.5.2
  - daml-script:3.5.2
```

Each tool-managed OCI reference includes both a tag (`:1.2.3`) and a digest (`@sha256:...`). The digest pins the exact DAR content, so `daml.yaml` itself records the specific hashes that will be fetched on subsequent builds; whatever DAR hash the consumer verified against the audit is what they will receive. DPM's existing OCI-DAR mechanism handles the fetch at build time.

The `components:` section pins damlc and daml-script versions. This is DPM's existing toolchain-pinning mechanism; the registry plugin ensures the pinned versions match what the registry's audit metadata assumes. The [Phase 2 damlc source-to-DAR verifier](#source-to-dar-verification-damlc) uses this same entry to know which damlc to install and recompile against, giving Phase 2 verification a stable anchor to work from.

**The same `daml.yaml` is used regardless of build tool.** Phase 1 users run `dpm build` and DPM fetches the OCI references. Phase 2 users can run `dpm registry nix build` on the same file; the Nix path materializes the OCI references into the Nix store internally and produces a hermetic build, without requiring `daml.yaml` edits, separate add commands, or any symlink paths in the user-facing config. A project should be able to be built either way at any time.

`registry-dependencies:` is a field used to record version-range constraints. `daml.yaml` parsing in DPM is not strict (cf: `pkg/damlpackage/damlproject.go`) so unknown fields are silently ignored. No changes to DPM or the `daml.yaml` schema are required.

#### Phase 2 build state (`daml-nix.lock`)

The user-facing integrity record is the hash-pinned OCI references in `daml.yaml`; that record is sufficient for building either way. Phase 2's hermetic Nix build path produces `daml-nix.lock` as its own persistent record of the specific Nix closure used, pinning source hashes, **Nix derivation hashes**, and audit metadata. This file is a Phase 2 artifact (committed to version control for teams that want to record which Nix closure produced a release), but not required to build a project (`dpm build` and `dpm registry nix build` both work from `daml.yaml` alone). Note that the design of the lock file and other metadata schemas are subject to change during implementation; we plan to submit a CIP to formalize the format once the design is finalized. Example:

```
schema-version: 1
sdk-version: 3.4.0
packages:
  interval-tree:
    version: 1.2.3
    main_package_id: 1234abdc...
    source-hash: sha256:def456...
    nix-derivation-hash: sha256:abc123...
    audit:
      auditor: halborn
      status: passed
      expires: 2027-04-15
      report: https://github.com/halborn/audits/.../interval-tree-1.2.3.json
    dependencies:
      - daml-stdlib
```

From the lock file, a fully resolved nix hash is generated that locks down the full build closure (source, compiler version, SDK version, build environment, build flags, and transitive build inputs) into a single hash. Any third party with the same lockfile and Nix can reproduce the exact `.dar` and verify the hash for their platform. The fully resolved nix hash is stable across rebuilds per-platform. This is different from a source-checksum-only lockfile, which catches transport tampering but does not bind the build environment. The inclusion of the package ID in the lockfile clarifies the relationship between the vetting states on ledger and the packages referenced in the lockfile.

#### Support for dpm build

`dpm build` (existing DPM command, unchanged) reads `daml.yaml`'s `dependencies:` and compiles, using DPM's existing OCI-DAR fetching (SDK 3.5.2+) to retrieve any hash-pinned OCI references.

`dpm registry nix build` (new) reads the same `daml.yaml` and hermetically builds the project as a Nix derivation. Internally, it materializes the referenced DARs into the Nix store (via a symlink farm at `./.dpm-nix/deps/`, hidden from the user-facing config), then produces a content-addressed output at `<hash>-<name>/<name>.dar` in the Nix store. This is the path used for release artifacts, audit submissions, and CI verification. Any third party with the same `daml.yaml` and `daml-nix.lock` can reproduce the exact artifact and verify the hash matches. The full closure can be reproduced as long as the relevant sources are available in some form (repository, mirror, cache, and so on; cf. our work with Software Heritage Foundation for future long-term availability options).

#### Audit pipeline

When an author requests an audit the audit partner reviews the source, writes a signed audit report conforming to the [Audit Metadata Schema](#audit-metadata-schema), and publishes to the audit git repository. **The audit report includes the source hash of the exact revision reviewed** (per the schema's `package_hash` field), as well as the corresponding `nix-derivation-hash` where a Phase 2 build is available. The registry is scanned for new audits. Consumers see updated audit status on the next `dpm registry update` or `dpm registry audit`. Because the audit is a separately-published artifact indexed asynchronously, a package can be published before any audit exists. Audits can be attached later as they are produced. This lets publishing throughput exceed audit throughput, and lets time-critical patches reach consumers before the audit pipeline can run.

Auditor identities are managed through the keys repository described in [Keys of Publishers and Auditors](#keys-of-publishers-and-auditors); the same repository indexes published audit results.

This establishes source-binary trust: the auditor reviews source, the audit report names a specific source hash, the lockfile records that source hash, and any consumer can verify the binary they're loading was built from exactly the source the audit partner signed off on.

The Phase 2 lockfile records the audit's source hash and `nix-derivation-hash` of the audited version. **Tooling refuses to auto-update across audit boundaries**: if a project's dependency pins an audited version (via `daml.yaml` hash-pinning in Phase 1 or `daml-nix.lock` in Phase 2\) and a newer unaudited version is available, `dpm registry update` warns and requires an explicit override. This is the operational realization of "don't auto-update from an audited to an unaudited version."

#### Audit check (Phase 1 verification)

The `dpm-registry` plugin provides an `audit` subcommand for Phase 1 verification. Given a DAR file or OCI reference, `dpm registry audit <dar>` fetches the corresponding audit report from the keys repository, verifies the publisher and auditor signatures against registered keys, and confirms the audit report attests to this exact DAR hash. The consumer gets a clear yes-or-no answer to "has this been audited by a trusted party?" using only hash and signature checks. No Nix or damlc recompilation involved.

Consumers who want only audit verification (without the rest of the registry workflow) still install just `dpm-registry`; the audit subcommand does not require any Phase 2 tooling.

#### Source-to-DAR verification (damlc)

The registry supports source-to-DAR correspondence verification without requiring Nix. Given a DAR, the tooling unpacks the source, drives damlc (installed via DPM at the version pinned in `components:`) to recompile, and confirms the main DALF's package ID matches. This lets damlc-only organizations verify source-to-artifact correspondence using tooling they already trust.

```
$ dpm registry damlc verify
Reading dependencies from daml.yaml...
Installing damlc 3.5.2 (from components:) via DPM...
Fetching sources from registry...
Verifying interval-tree 1.2.3...
✓ Main DALF matches (package ID 1234abdc...)
Verifying canton-finance 1.0.0...
✓ Main DALF matches (package ID 5678efab...)
Verifying interval-helpers 2.1.0...
✓ Main DALF matches (package ID 9012cdef...)
✓ All 3 dependencies verified against source
```

The verifier reads the `components:` entry from `daml.yaml` to determine which damlc version to install, then walks the dependency closure verifying each DAR's main DALF against a fresh recompilation. Because `components:` is pinned by the registry plugin at `dpm registry add` time (matching what the audit metadata assumes), the verifier has a stable damlc anchor to work from.

The mechanism requires small extensions to the DAR format (module prefixes, build options, damlc version) and a DAR-unpacking CLI. Where the full dependency closure is available through the registry, verification folds across every DAR in the tree, giving full-closure source-to-DALF coverage without leaving the SDK-provided toolchain.

Verification against the compiler binary itself, reproducing the compiler from source rather than trusting the SDK distribution channel, is provided by the Nix path within Phase 2\.

#### Binary-only packages

For packages distributed as binary-only DARs (i.e., with no public source), the audit pipeline preserves source-binary trust without exposing the source. The author can keep the source private as long as the audit partner can review it under whatever access arrangement they negotiate, and the published audit report names both the source hash the auditor reviewed and the DAR hash being distributed. A consumer can see that *the auditor reviewed source at hash X, attested that hash X produces the DAR at hash Y, the registry serves DAR Y* without needing source access. Trust here rests on the auditor's attestation rather than on the consumer's ability to re-verify the source. License terms governing redistribution still apply.

### 3\. Architectural Alignment

The proposal aligns with established directions in Canton and Daml architecture:

- **DPM component model.** The system is distributed as a `dpm-registry` component published to an OCI registry, registered via the documented manifest format (`apiVersion: digitalasset.com/v1`, `kind: Component`). User invocation goes through `dpm registry <subcommand>` with internal dispatch, the same pattern as `kubectl` plugins, `git` extensions, and `cargo` plugins.
- <a name="audit-metadata-schema"></a>**Audit Metadata Schema.** The `dpm-registry` registry consumes the audit metadata schema defined by PixelPlex's draft CIP ([PR \#168](https://github.com/canton-foundation/cips/pull/168); numbering caveats in [References](#references)). References throughout this proposal to "the Audit Metadata Schema" mean this format.
- **Smart Contract Upgrades and package-name addressing.** Canton 3.4's package-name addressing (`#<package-name>:<module>:<entity>`) and Tri-State Vetting model are the substrate the registry's resolution semantics build on. `dpm-registry` uses `dpm upgrade-check` internally to gate SCU-compatible upgrades.
- **Pure code reuse.** The proposal primarily targets pure code, stdlib-extension, utility libraries, and daml-script code. Tooling and discovery surfaces will reflect this.
  - Once [https://github.com/digital-asset/daml/issues/21964](https://github.com/digital-asset/daml/issues/21964) is resolved, Daml script code would be another valuable artifact that could be shipped this way.
- **No fork, minimal upstream modifications.** No changes to `dpm`, the Canton protocol, or SCU/vetting workflows. The damlc source-to-DAR verifier requires small, additive extensions to `damlc` (DAR-format additions, unpacker and verifier commands) coordinated with the Daml language team; these are the only upstream toolchain changes required.

### 4\. Team and Prior Art

Obsidian Systems has been building infrastructure for Nix, Haskell, and blockchain for over a decade.

**Nix infrastructure for Daml (production):**

- [nix-daml-sdk](https://github.com/obsidiansystems/nix-daml-sdk): Nix packaging of the Daml SDK with reproducible `.dar` builds, an Obsidian-operated S3 binary cache, and nix-shell development environments. Used in production by Obsidian and by Daml development teams that have adopted it. This is the technical foundation the proposed work productizes and extends.
- [nix-thunk](https://github.com/obsidiansystems/nix-thunk): a Nix dependency manager built on directories that stand in for full git repositories ("thunks"). Directly analogous to the symlink-farm pattern this proposal uses for materialized registry dependencies.

**Source preservation and decentralized distribution:**

- Obsidian holds an NLnet Foundation grant with Software Heritage Foundation on bridging IPFS and the Software Heritage archive ([blog announcement](https://blog.obsidian.systems/kicking-off-peer-to-peer-access-to-our-software-heritage-with-ipfs/)). The grant builds on Obsidian's prior work interfacing Nix with IPFS. This establishes the technical foundation for any future SWH integration the registry grows into.

**Core Nix and build systems expertise:**

- Active member of the Nix team responsible for maintaining and releasing the Nix package manager. Verifiable from Nix project records.
- GHC contributor (cross-compilation infrastructure; runtime system configure-script work).
- Prior speaking and infrastructure work on Haskell-to-mobile (iOS \+ Android) via GHC \+ Reflex \+ Nix.

**Enterprise blockchain and shipped tooling:**

- Trusted partner in the enterprise Daml and Canton ecosystem
- [Obelisk](https://github.com/obsidiansystems/obelisk): a functional-reactive web and mobile application framework. Haskell codebase ships to web, iOS, and Android. Years of production use.
- Security-critical hardware wallet work on many blockchains, with a published vulnerability disclosure policy.

### 5\. Backward Compatibility

There is no impact on existing systems, integrations, or workflows.

- Projects that prefer the current vendored-DAR approach continue to work without change.
- Projects that adopt `dpm-registry` continue to use unmodified `dpm`, unmodified `daml.yaml` semantics for documented fields, and the existing Canton participant package vetting workflow at runtime.
- `daml.yaml` parsing is permissive about unknown fields (verified in DPM source). The `registry-dependencies:` field is silently ignored by `dpm build`; the tool-managed `dependencies:` entries it generates are standard.
- Daml Studio works without modification: the standard extension reads `daml.yaml` and follows the symlinks transparently.
- Multi-package projects (`multi-package.yaml`) work via per-package configuration. Future shared-declaration at the multi-package root level would require schema collaboration with DA but is not required for V1.

### 6\. Threat Model

The system addresses four distinct attack vectors with distinct mechanisms:

| Attack vector | Examples | Mechanism |
| :---- | :---- | :---- |
| **Build-time supply-chain compromise** | Compromised build environments, malicious build-time dependencies, non-reproducible compilation hiding tampering | Nix derivation hashing binds source \+ compiler \+ SDK \+ build environment into a single hash. Independent verifiability. |
| **Transport-layer tampering** | Mirror compromise, MITM on download | SHA-256 source hashes in the lockfile (table stakes; also caught by Nix). |
| **Maintainer compromise / merged-PR attacks** | Account takeover, social engineering, malicious PR merged upstream (Axios pattern) | Human audits via audit partner; tooling refuses auto-update across audit boundaries. |
| **Dependency confusion / typosquatting** | Org-scope mirroring, name-similarity attacks | Single-registry with publisher identity verification (see [Keys of Publishers and Auditors](#keys-of-publishers-and-auditors)). |

Daml's runtime threat model is narrower than npm's: compiled Daml packages run in a Daml VM with no runtime dependencies on the rest of the ecosystem, so the attack surface for pure code run-time exploitation is limited.  The template threat model (exploiting signatory authority) is mitigated by human audits. The build-time and audit-time attack vectors are where the risk is, and where this proposal focuses.

---

## **Milestones and Deliverables**

Eight milestones organized in three phases. Each milestone is independently deliverable and payable. Within each phase, milestones are ordered from least dependencies to most; progress can be marked and paid out as each milestone lands, without waiting for later work.

### Phase 1: Registry baseline

#### Milestone 1: Keys repository

- **Estimated delivery:** Month 2
- **Estimated effort:** 2.5 person-months
- **Focus:** The consortium-managed identity-verification infrastructure. Independently usable for identity and audit verification beyond this proposal.
- **Dependencies:** None.

Deliverables:

- Public GitHub repository protected by gittuf/TUF-style repository policy. Repository rules require multi-key authorization to add or modify identities.
- Initial consortium established with multi-key sign-off procedure documented.
- Initial publisher and auditor identities registered.
- Submission and consortium review workflow documented.

#### Milestone 2: Registry backend and base audit metadata pipeline

- **Estimated delivery:** Month 5
- **Estimated effort:** 5 person-months
- **Focus:** The OCI registry backend hosting packages, and the base audit metadata pipeline built on the keys repository from M1.
- **Dependencies:** M1 (uses keys repo for identity verification).

Deliverables:

- Registry OCI backend operated by Obsidian, hosting the plugin and initial reference packages. Apache 2.0 self-hostable deployment.
- Base audit metadata pipeline: producer generates audit reports conforming to the [Audit Metadata Schema](#audit-metadata-schema) and publishes to the keys repository; consumer-side library (usable by the plugin or independently) fetches and verifies against registered keys.
- Reference example package published end-to-end with a real audit attestation.

#### Milestone 3: `dpm-registry` plugin

- **Estimated delivery:** Month 8
- **Estimated effort:** 8.75 person-months
- **Focus:** The client-side plugin providing Phase 1 CLI commands built on DPM's OCI-DAR mechanism.
- **Dependencies:** M1 (verifies against keys repo), M2 (fetches from registry backend).

Deliverables:

- `dpm-registry` published as a DPM component to a public OCI registry (Apache 2.0).
- Phase 1 CLI under `dpm registry`: `init`, `add`, `remove`, `update`, `info`, `search`, `tree`, `publish`, `audit`.
- Version-constraint resolution and hash-pinned OCI reference generation for `daml.yaml`'s `dependencies:` field. `registry-dependencies:` maintained by the plugin for version-constraint tracking. `components:` updated to pin `damlc` and `daml-script` per registry audit metadata.
- `dpm registry audit <dar>` verifies the DAR hash, publisher signature, and auditor signature against the keys repository at a specified revision.
- Integration with `dpm upgrade-check` to gate SCU-compatible upgrades.
- Cross-platform support: Linux (x86\_64 \+ arm64), macOS (Apple Silicon \+ Intel), Windows.

### Phase 2: Deeper verification (parallel)

#### Milestone 4: `damlc` source-to-DAR verification

- **Estimated delivery:** Month 9
- **Estimated effort:** 6.25 person-months (includes \~1.75 PM for upstream coordination with the Daml language team)
- **Focus:** Phase 2 verification path via `damlc` recompile. Delivered by Obsidian under standard grant terms because the Daml language team has not prioritized this work in the near term.
- **Dependencies:** M3 (extends the plugin with a Phase 2 CLI subtree).

Deliverables:

- `damlc` upstream PR: DAR-format extensions (module prefixes, build options, `damlc` version), unpacker CLI (`damlc unpack-dar`), and verifier command. Coordinated with the Daml language team and shepherded through review.
- Phase 2 CLI under `dpm registry damlc`: `verify`, `unpack`.
- `dpm registry damlc verify` walks the dependency closure, drives the upstreamed `damlc` at the version pinned in `components:` to recompile source, and confirms main-DALF package IDs match. Handles closure-fold across multiple DARs (see [Source-to-DAR verification](#source-to-dar-verification-damlc)).

#### Milestone 5: Nix hermetic-build path

- **Estimated delivery:** Month 10
- **Estimated effort:** 5.25 person-months (Obsidian-funded; not in committee ask)
- **Focus:** Phase 2 hermetic-build verification via Nix. Co-funded by Obsidian (see [Phase 2 co-funding](#phase-2-co-funding)).
- **Dependencies:** M3 (extends the plugin with a Phase 2 CLI subtree).

Deliverables:

- Phase 2 CLI under `dpm registry nix`: `build`, `shell`, `verify`, `install`, `clean`.
- Nix derivation generator: `dpm registry nix build` reads the same `daml.yaml` as `dpm build`, materializes referenced DARs into the Nix store via an internal symlink farm at `./.dpm-nix/deps/` (not exposed in user config), and produces content-addressed output at `<hash>-<name>/<name>.dar`.
- `daml-nix.lock` internal Phase 2 build state, recording source hashes, Nix derivation hashes, and [Audit Metadata Schema](#audit-metadata-schema) fields per dependency.
- Nix binary cache substituters operated by Obsidian (building on existing nix-daml-sdk S3 cache infrastructure). Substituter architecture supports multi-mirror operation; substituter operation is documented and reproducible by any third party.
- Independent-rebuilder integration test confirming hermetic build hash reproducibility across environments.

### Bootstrap and launch

#### Milestone 6: Discovery and documentation

- **Estimated delivery:** Month 10
- **Estimated effort:** 5.25 person-months
- **Focus:** User-facing surfaces for browsing packages and learning the tooling.
- **Dependencies:** M2 (backend surfaces package data), M3 (plugin surfaces CLI docs). Can incorporate M4/M5 Phase 2 docs as those land, but ships useful docs for Phase 1 first.

Deliverables:

- Discovery website maintained and operated by Obsidian: package index, search, per-package pages (README, version history, audit status badges with DAR hash, dependency graph), author/organization pages, and category browsing.
- Documentation site operated by Obsidian: quickstart, CLI reference for `dpm registry` and its subcommand trees (`damlc` and `nix` as they are available), conceptual guides covering the threat model, the [Audit Metadata Schema](#audit-metadata-schema), both build modes (`dpm build` and `dpm registry nix build`), publisher onboarding, and migration from vendored DARs.

#### Milestone 7: Mature identity governance and audit pipeline

- **Estimated delivery:** Month 11
- **Estimated effort:** 3.5 person-months
- **Focus:** Expanding beyond the initial M1 consortium and demonstrating the full audit pipeline across participants.
- **Dependencies:** M1 (keys repo), M2 (audit pipeline), M3 (plugin).

Deliverables:

- Expanded publisher/auditor onboarding workflow: standardized submission process, review procedures, and multi-key sign-off documented and operational beyond the initial M1 consortium.
- Cross-participant integration test that an audit published per the [Audit Metadata Schema](#audit-metadata-schema) surfaces in `dpm registry info` within one sweep cycle.
- `dpm registry publish` workflow generating audit metadata as a side effect of publication; round-trip verified.

#### Milestone 8: Bootstrap migrations

- **Estimated delivery:** Month 13
- **Estimated effort:** 3 person-months (primarily upstream PR shepherding and coordination).
- **Focus:** Adoption via publication of core Canton open-source DARs through the registry.
- **Dependencies:** M3 (plugin exists for consumers), M7 (`dpm registry publish` workflow).

Deliverables:

- PR to the Splice repository updating its release process to publish DARs through this registry instead of checking them into git, removing the per-version 16MB git burden Splice currently carries. Shepherded through review; merge target negotiated with Splice maintainers.
- PR to the Daml SDK release process to publish the Daml standard library and `daml-script` DARs through this registry, so they can be consumed via the same mechanism as any other registry package and the SDK bundle no longer needs to ship them. Same shepherding commitment.
- Where upstream priorities block merge within the funding window, alternate adoption demonstration (e.g., publishing the same DARs from a maintained mirror) documented and counted toward the adoption metric.

---

## **Acceptance Criteria**

The Tech & Ops Voting Committee will evaluate completion against the following. Each milestone can be evaluated and paid out independently.

**Cross-cutting:**

- Each milestone's deliverables completed as specified, with runnable artifacts demonstrating each capability.
- Apache 2.0 throughout. All code, schemas, and documentation under Apache 2.0; all infrastructure self-hostable.

**M1 (keys repository):**

- Public GitHub repository with gittuf/TUF-style policy operational; multi-key sign-off enforced on identity changes.
- Initial consortium established with at least one publisher and one auditor identity registered.
- Submission and review workflow documented and operational.
- Independent verification: a third party can clone the repository at a specified revision and reproduce signature verification using standard cryptographic tooling, without any of the Phase 1 plugin tooling.

**M2 (registry backend and base audit pipeline):**

- Registry OCI backend hosts the plugin and at least one reference example package.
- Audit metadata pipeline: a producer generates an audit report conforming to the [Audit Metadata Schema](#audit-metadata-schema) and publishes it to the keys repository; a consumer-side library fetches and verifies against registered keys. Consumer library usable independently of the Phase 1 plugin.
- Reference example package published end-to-end with a real audit attestation.

**M3 (`dpm-registry` plugin):**

- Phase 1 CLI subcommands (`init`, `add`, `remove`, `update`, `info`, `search`, `tree`, `publish`, `audit`) functional against the running registry backend from M2.
- `dpm registry add <package>@^1.2` produces hash-pinned OCI references in `daml.yaml`'s `dependencies:`, updates `registry-dependencies:` for the version constraint, and pins `damlc`/`daml-script` in `components:`.
- `dpm registry audit <dar>` verifies the DAR hash, publisher signature, and auditor signature against the keys repository at a specified revision. Passes on audited packages; fails on tampered DARs or unrecognized signatures. Tooling refuses to auto-update across audit boundaries.
- Cross-platform support demonstrated on Linux, macOS, and Windows.
- End-to-end Phase 1 workflow: `dpm install dpm-registry`, `dpm registry init`, `dpm registry add <example-package>@^1.2`, `dpm registry audit <dar>` (passes), `dpm build` (produces a valid `.dar`).

**M4 (`damlc` source-to-DAR verification):**

- `damlc` upstream PR: DAR-format extensions, unpacker CLI (`damlc unpack-dar`), and verifier command opened and shepherded through review. Merged, or on a documented path to merge, by milestone acceptance.
- `dpm registry damlc verify` walks the dependency closure, recompiles source under the `damlc` version pinned in `components:`, and confirms each main DALF's package ID matches. Passes on audit-matched sources; fails on tampered source.

**M5 (Nix hermetic-build path):**

- `dpm registry nix build` produces content-addressed output. An independent rebuilder with the same `daml.yaml` and `daml-nix.lock` produces the same `nix-derivation-hash` on the same platform.
- `daml-nix.lock` records source hash, Nix derivation hash, and audit reference for each dependency. Where an audit exists, the audit report's stated source hash matches the entry in the lock file.
- Nix binary cache substituters operational and documented; substituter architecture supports multi-mirror operation.

**M6 (discovery and documentation):**

- Discovery website live and operational: package index, search, per-package pages (README, version history, audit status badges with DAR hash, dependency graph), author/organization pages, and category browsing.
- Documentation site live: complete CLI reference for `dpm registry` and its `damlc` and `nix` subcommand trees (or the subset available at delivery), conceptual guides covering the threat model and the [Audit Metadata Schema](#audit-metadata-schema), both build modes documented, publisher onboarding guide, and migration guide.

**M7 (mature identity governance and audit pipeline):**

- Expanded publisher/auditor onboarding workflow beyond the initial M1 consortium, with standardized submission and multi-key sign-off procedures documented and operational.
- Cross-participant integration test: an audit published per the Audit Metadata Schema surfaces in `dpm registry info` within one sweep cycle, verified across multiple parties.
- `dpm registry publish` workflow: publishing a package generates audit metadata as a side effect; round-trip verified.

**M8 (bootstrap migrations):**

- PR to Splice opened and shepherded through review; merge landed or alternate adoption documented.
- PR to the Daml SDK opened and shepherded through review; merge landed or alternate adoption documented.

---

## **Funding**

**Committee base ask:** 5,500,000 CC, covering M1-M4 and M6-M8. M5 is delivered by Obsidian at no cost to the committee (see [Phase 2 co-funding](#phase-2-co-funding)).

**Committee ceiling with acceleration bonuses and full adoption tranche:** 6,560,000 CC.

### Payment Breakdown by Milestone

| Milestone | Phase | Description | CC | Notes |
| :---- | :---- | :---- | ----: | :---- |
| M1 | Phase 1 | Keys repository | 400,000 |  |
| M2 | Phase 1 | Registry backend and base audit metadata pipeline | 800,000 |  |
| M3 | Phase 1 | `dpm-registry` plugin | 1,400,000 |  |
| M4 | Phase 2 | `damlc` source-to-DAR verification | 1,000,000 | Includes upstream coordination |
| M5 | Phase 2 | Nix hermetic-build path | 0 | Obsidian-funded |
| M6 | Bootstrap and launch | Discovery and documentation | 850,000 |  |
| M7 | Bootstrap and launch | Mature identity governance and audit pipeline | 550,000 |  |
| M8 | Bootstrap and launch | Bootstrap migrations | 500,000 | Upstream PR work \+ adoption coordination |
|  |  | **Committee base total** | **5,500,000** |  |

### Phase 2 co-funding

Phase 2 has two paths: `damlc` source-to-DAR verification (M4) and Nix hermetic builds with independent-rebuilder attestations (M5).

The **Nix path (M5)** is co-funded by Obsidian and requested at 0 CC from the committee. Obsidian delivers M5 regardless of committee funding: roughly 5.25 person-months of engineering, valued at ~850,000 CC on the same basis as the other milestones, drawing on existing `nix-daml-sdk` infrastructure. This is Obsidian's skin-in-the-game contribution to the ecosystem, and it means the committee receives the full two-path Phase 2 verification story without paying for the Nix half.

The **damlc path (M4)** is delivered by Obsidian under standard grant terms. The Daml language team has not prioritized this work in the near term, and Obsidian is willing to do it. The estimate carries an explicit line item for upstream coordination with the Daml language team; landing the DAR-format extensions and verifier command through multiple review rounds is the load-bearing risk on this milestone.

Phase 1 (M1-M3) and the Bootstrap and launch phase (M6-M8) stand as complete work on their own; the committee can approve them in full without requiring the Phase 2 milestones (M4 and M5).

### Acceleration bonuses

Two milestones carry acceleration bonuses tied to early delivery:

- **M3 (Phase 1 baseline complete): \+15% on M3 base (210,000 CC)** if M1 \+ M2 \+ M3 are all delivered and accepted by the end of Month 6 (two months ahead of the M3 target). Rewards getting the Phase 1 registry into ecosystem hands while Phase 2 work continues in parallel.
- **M8 (bootstrap migrations): \+20% on M8 base (100,000 CC)** if all M8 acceptance gates (Splice PR merged, Daml SDK PR merged, first external integration verified) are met by the end of Month 12 (one month ahead of the M8 target).

Both bonuses are all-or-nothing on the specified gates; partial delivery does not trigger a proportional bonus.

### Adoption tranche on M8

Beyond the base M8 award, adoption is rewarded per external mainnet integration demonstrated within twelve months of M8 acceptance:

- **150,000 CC per external mainnet integration** demonstrating registry consumption in production
- Cap at 5 integrations \= **750,000 CC adoption ceiling**
- Adoption window: 12 months post-M8 acceptance

The per-integration figure is higher than typical adoption tranches (comparable proposals use \~100K) because the target integrators here are validator node operators and protocol maintainers rather than small dev shops; each represents a materially larger ecosystem win. Specific integration definitions and verification criteria will be finalized with the committee before M8 delivery.

### Committee ceiling

| Component | CC |
| :---- | ----: |
| Base (M1-M4, M6-M8; excluding M5) | 5,500,000 |
| M3 acceleration bonus (if met) | \+210,000 |
| M8 acceleration bonus (if met) | \+100,000 |
| M8 per-integration adoption (up to 5\) | \+750,000 |
| **Committee ceiling** | **6,560,000 CC** |
| **Committee floor (base only)** | **5,500,000 CC** |

### Volatility Stipulation

If the project duration extends beyond six months, the grant is denominated in fixed CC and requires re-evaluation at the six-month mark. Should the timeline extend beyond six months due to committee-requested scope changes, remaining milestones may be renegotiated to account for USD/CC price volatility.

### Operating costs

Hosted infrastructure for the initial public deployment (discovery site, generated documentation, metadata backend, S3-backed binary cache) should run in the low hundreds of dollars per month. The main scaling variable is binary-cache storage and download traffic. S3 Standard storage runs roughly $24/TB-month at the first tier, and CloudFront flat-rate plans keep CDN delivery predictable within their request and data-transfer allowances.

Obsidian operates and pays for this infrastructure during launch and early adoption. This commitment holds while operating costs stay in the range of a small hosted service. If adoption grows past that point, the architecture does not require a single operator. Nix substituters are natively multi-mirror (see [Distribution](#distribution)), so additional substituters can be added without protocol changes: Foundation-hosted, partner-hosted, or community-hosted. Obsidian will publish operating-cost data as the project matures so that any move to shared operations can be based on real numbers.

---

## **Co-Marketing**

Obsidian Systems will collaborate with the Foundation on coordinated announcements, technical write-ups, and adoption materials as each milestone lands. Specific commitments, tied to the milestone structure:

**Keys repository launch (after M1):**

- Announcement of the identity governance repository, framed as independently usable infrastructure for Canton identity and audit verification beyond this proposal.
- Technical write-up on the gittuf/TUF policy pattern applied to Daml, with reference to cargo-vet and ERC-7730 as prior art.

**Phase 1 baseline launch (after M3):**

- Coordinated announcement across Foundation and Obsidian channels marking the Phase 1 registry baseline going live and consumable through `dpm registry`.
- Technical write-up on the registry model: hash-pinned OCI references, audit-attestation verification, and how the Phase 1 baseline stands independently of Nix.
- Getting-started guide for Phase 1 consumers (adding a registry dependency, verifying an attestation) and publishers (publishing to the registry, requesting an audit).
- Reference example package plus recorded walkthrough of the end-to-end flow.

**Phase 2 launches (after M4 and M5):**

- **damlc source-to-DAR verification (M4):** announcement paired with the upstream `damlc` PR landing. Technical write-up on source-to-DALF verification for consumers who need it without adopting Nix.
- **Nix hermetic-build path (M5):** announcement paired with the substituter infrastructure going live. Technical write-up on Nix-derivation hashing as a supply-chain primitive (extending [Obsidian's existing blog post](https://blog.obsidian.systems/daml-nix-reproducible-builds-as-a-security-primitive/)) and independent-rebuilder attestations. Covers multi-mirror architecture and the Software Heritage integration path.

**Discovery and documentation launch (after M6):**

- Announcement of the discovery website and documentation site going live.
- Publisher-onboarding materials targeted at other Canton open-source projects considering publication.

**Bootstrap migrations (after M8):**

- Case study on the Splice and Daml SDK migrations: what changed, what the benefits are, what other projects can learn from the process.
- Recorded walkthrough of a fully bootstrapped consumer workflow using registry-sourced core DARs.

**Ongoing across the grant period:**

- Presence in the `sig-dar-app-management` Slack channel with milestone updates and community Q\&A.
- Presentations at Canton Foundation events and developer meetups as milestones land.
- CIP submissions coordinated in the open, including the Audit Metadata Schema (in support of PixelPlex's draft) and a lockfile-format CIP for Phase 2 build state.
- All technical write-ups licensed for republication on Foundation channels.

---

## **References**

- **Canton Network Developer Experience and Tooling Survey (2026)**: 41 active developers across the ecosystem; characterizes current Daml package distribution as a "manual, file-based process"; places "Daml Dependency & Package Manager" among top tooling opportunities and "Package Manager & Operational Dashboards (Cargo)" on the Magic Wand Wishlist; 75% rate Security & Auditing Tools as Important or Critical. [https://forum.canton.network/t/canton-network-developer-experience-and-tooling-survey-analysis-2026/8412](https://forum.canton.network/t/canton-network-developer-experience-and-tooling-survey-analysis-2026/8412)
- **Reproducible Builds as a Security Primitive (Obsidian)**: [https://blog.obsidian.systems/daml-nix-reproducible-builds-as-a-security-primitive/](https://blog.obsidian.systems/daml-nix-reproducible-builds-as-a-security-primitive/)
- **Audit Metadata Schema (PixelPlex's draft CIP, PR \#168)**: Standard Package Validation and Distribution for Daml Applications; source of the Audit Metadata Schema this proposal builds on. Provisionally numbered CIP-0106 in the PR text; the actual number on acceptance is pending. Note: the already-accepted CIP-0106 is a different, unrelated CIP. [https://github.com/canton-foundation/cips/pull/168](https://github.com/canton-foundation/cips/pull/168)
- **DPM**: Digital Asset Package Manager (Apache 2.0, Go). [https://github.com/digital-asset/dpm](https://github.com/digital-asset/dpm)
- **Canton 3.4 Smart Contract Upgrades**: Tri-State Vetting and package-name addressing.
- **Hackage**: long-running self-contained Haskell package repository; reference model for multi-mirror operation.
- **NPM supply-chain incidents (2025-2026)**: Shai-Hulud worm, Axios hijack, credential-stealing campaigns.
- **Halborn**: security audit firm active in the Canton ecosystem; expressed support for participating in the audit pipeline.
- **Cargo-vet**: Cargo-vet records human audit results and trusted publisher entries as metadata in public repositories. This is a close analog to this proposal. [https://mozilla.github.io/cargo-vet/index.html](https://mozilla.github.io/cargo-vet/index.html)
- **RustSec**: A package security metadata repository (on GitHub) and associated audit tooling for the Rust ecosystem. [https://rustsec.org](https://rustsec.org)

Team and prior-art references:

- **nix-daml-sdk (Obsidian Systems)**: Nix packaging of Daml SDK with reproducible `.dar` builds, S3 binary cache, dev shells. [https://github.com/obsidiansystems/nix-daml-sdk](https://github.com/obsidiansystems/nix-daml-sdk)
- **nix-thunk (Obsidian Systems)**: Lightweight Nix dependency manager using git-thunk directories. [https://github.com/obsidiansystems/nix-thunk](https://github.com/obsidiansystems/nix-thunk)
- **Obelisk (Obsidian Systems)**: Functional reactive web and mobile application framework. [https://github.com/obsidiansystems/obelisk](https://github.com/obsidiansystems/obelisk)
- **Obsidian \+ Software Heritage Foundation NLnet grant**: IPFS-SWH archive bridge, building on prior Nix-IPFS work. [https://blog.obsidian.systems/kicking-off-peer-to-peer-access-to-our-software-heritage-with-ipfs/](https://blog.obsidian.systems/kicking-off-peer-to-peer-access-to-our-software-heritage-with-ipfs/)
- **Software Heritage Foundation \+ Nix collaboration (Tweag, NLnet)**: Reference precedent for source archival of nixpkgs. [https://www.softwareheritage.org/2020/06/18/welcome-nixpkgs/](https://www.softwareheritage.org/2020/06/18/welcome-nixpkgs/)
- **John Ericson (Nix maintainer)**: Active member of the Nix team; GHC contributor; speaker on Haskell-to-mobile via GHC \+ Reflex \+ Nix.

---

## **Limitations and Future Work**

#### Vetting state integration

Per-network vetting states are not part of the current scope of the proposal, but are something that we would eventually be interested in integrating into the audit workflow.

#### DAR and DALF

This proposal is built around the DAR (Daml Archive) as the unit of distribution and audit. The on-ledger reality is one layer deeper: a DAR is a zip bundle of one or more compiled Daml-LF modules (DALFs) plus metadata, and **package IDs on the ledger are the SHA-256 of the DALF bytes, not of the enclosing DAR**. The common practice is to treat the DAR as representing its main DALF, and this proposal follows that convention.

The audit metadata's `main_package_id` field is a partial bridge: it lets a consumer cross-reference a DAR-level entry to the DALF identity the ledger uses, and ties the on-ledger vetting state to the DAR distributed through this system. Phase 2 damlc source-to-DAR verification tightens the bridge further by recompiling from source and confirming the main DALF's package ID matches the reviewed source. The remaining asymmetry (a DAR and its primary DALF have distinct hashes, and Phase 1's audit-to-binary chain terminates at the DAR) is not resolved by this proposal.

A fuller resolution, for example addressing and distributing at the DALF level, or formalizing the DAR-to-DALF correspondence so audit references can attach to either, is left for a follow-on proposal.
