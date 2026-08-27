## Development Fund Proposal — Canton Failure-Classification Engine

**Author:** Jitin Jain (InfraSingularity)
**Status:** Proposed
**Created:** 2026-05-04
**Updated:** 2026-08-27
**Label:** `daml-tooling`
**Champion:** TBD

---

## Abstract

A Canton-native, **community-extensible failure-classification engine** that turns failed or rejected Ledger API submissions into a deterministic, categorized root cause with ranked next checks — and lets any team contribute new decoders and diagnoses to a shared, versioned **knowledge base** without engine access. Seeded from real production Canton failures and grown by the ecosystem, it aims to move time-to-root-cause on covered failures from hours to minutes.

Structurally this is three things, not a suite: **one engine** (a deterministic, rules-based classifier, installed through `dpm` like any other component), **one public rules repository** (the failure taxonomy and the decoder rules the engine runs on, extended by pull request), and **one test suite** (a labeled set of real and induced failures the engine's accuracy is measured against, run in CI). A versioned output format lets other tools consume diagnoses programmatically. The engine does not duplicate the official Canton error-code inventory — it consumes it (Section 2.0): the inventory defines what each code means; the engine determines which concrete root cause produced a specific failed submission. Distribution and community extension reuse `dpm`'s existing component mechanisms end to end; the mechanics are in Section 2.3.

It complements the emerging family of DPM diagnostic components — DPM Trace (PR #327), DPM Debug (PR #494), and the Transaction Profiler DPM Component (PR #379) — all of which operate on transactions that exist. This engine addresses submissions that **never committed**, and publishes the taxonomy, decoder format, evaluation harness, and a stable integration contract that each of them can consume. The governed multi-tenant bundle store, shareable escalation bundles, transaction replay, bespoke UI, and the bespoke plugin registry from earlier revisions are all out of scope (see Scope Boundaries).

---

## Specification

### 1. Objective

Reduce time-to-root-cause for failed Canton submissions from hours to minutes by producing a **deterministic, categorized diagnosis with ranked next checks**, delivered as a reference engine plus an **open, community-extensible knowledge base** of decoders, distributed through the toolchain Daml teams already use rather than alongside it.

Single objective: the failure-classification engine and the mechanisms that let the community add to its knowledge base safely. Presentation, navigation, diffing, and any shareable-artifact layer are out of scope.

### 2. Implementation Mechanics

The work divides into **open components** (contributed, so the community and other tools build on them) and a **funded reference deliverable** (built by InfraSingularity). All of it consumes the existing Canton Ledger API surface and the existing `dpm` component surface; neither is forked or modified.

#### 2.0 Relationship to the Canton error-code inventory

Canton already ships a complete, machine-generated error-code inventory: every error carries a structured code, and the reference documentation pairs each code with an explanation and a generic resolution, maintained at the source to guarantee consistency. This proposal depends on that inventory and does not reproduce any part of it.

The two sit at different layers. The inventory is a **dictionary of codes** — one entry per code, the same text for every occurrence, and by design context-free: a documentation page cannot read the rejection payload, the submitted command, the party set, or the package-vetting state of the environment that produced a specific failure. In practice one code covers many distinct root causes. A single authorization or visibility rejection may be a missing controller in the template design, an act-as/read-as claim absent from the token, a party hosted on a different participant than assumed, a divulgence gap, or vetting drift on a counterparty's node. The inventory entry cannot say which of these it was; distinguishing them is this engine's entire job — it takes the code **plus** the structured payload and submission context and returns which known cause produced this particular failure, with the specific next checks, at a measured accuracy.

The dependency runs one way: decoder matchers key on the official error codes and structured payload fields (Section 2.1); taxonomy families cross-reference the official code identifiers they cover; and every diagnosis links back to the official inventory entry for its code, so the inventory remains the single source of truth for what a code means. None of this could be contributed upstream as documentation, because a static page cannot consume instance data.

#### 2.1 Open components (Apache-2.0)

- **Rejection-family taxonomy + declarative decoder format** — the open catalog of failure families and a versioned, schema-validated rule format (match on error code / rejection family / structured payload fields → primary diagnosis + 2–5 ranked next checks + playbook) authorable **without touching engine internals**. Every decoder carries an explicit **applicability contract**: the SDK, Canton protocol, LF, and error-code generations it is valid for, resolvable against the SDK version `dpm` reports at run time.
- **Public rules repository (the knowledge base)** — the git repository holding the taxonomy, decoder rules, and playbooks, as the single source of truth. Releases are checksummed and immutable, so any diagnosis can name the exact rule-set release that produced it (packaging mechanics in Section 2.3). Extended by community pull requests.
- **Contribution pipeline (the repository's CI and review)** — every submitted decoder ships with examples it must classify correctly, examples it must not match, and its expected classification; CI validates the format, runs it against the frozen test suite on every supported SDK version, and rejects anything that lowers an existing family's measured accuracy; lightweight acceptance via the Daml tooling SIG keeps the canonical set coherent.
- **Test suite (labeled corpus + evaluation harness)** — the ground-truth failures the classifier is measured against. Labels come from two sources: **fault injection** (deliberately induced failures whose true cause is known by construction — remove a controller from a template and the class is known) and **real production rejections labeled blind** (by an adjudicator who has not seen the engine's output, so the engine is never grading its own homework). Part of the set is a **frozen held-out split** contributors never tune against; the remainder is the open development set. The harness reports three things, each published: the **risk-coverage curve** (how accuracy trades off against how often the engine answers rather than abstains), the **per-family confusion matrix** (a table of where wrong answers land between failure families — e.g. how often a visibility failure is mislabeled as an authorization failure — so a headline accuracy number cannot hide one weak family), and **confidence calibration** (whether stated confidence levels match observed accuracy). Every test case is tagged with the SDK version it came from, and the whole suite re-runs against each supported SDK version, so a release that changes error formats fails the build instead of producing wrong diagnoses in the field.
- **Diagnosis output format and library API (the "integration contract")** — a versioned JSON schema for the diagnosis plus a small, stable library interface, so DPM Trace, DPM Debug, the Transaction Profiler, CI runners, and IDE or ticketing integrations can call a measured classifier and consume the result programmatically instead of each reimplementing failure heuristics.

#### 2.2 Funded reference deliverable

- **Reference classification engine** — deterministic and rules-based. It loads decoders from the resolved pack set and maps a rejection to a primary diagnosis plus ranked next checks. Below its confidence threshold it returns `insufficient signal` with the observed facts — it never fabricates a category, and there is no LLM dependency for correctness. Ships with a **seed set of 6–8 decoders** across the named families, exposed as a **library, a CLI, and a published DPM component**. Output carries category, ranked next checks, decoded context, and the producing pack's namespace and digest.
- **Daml-aware decoding** — decoders read template ID, choice name (including interface choices), and act-as/read-as parties from the rejection and the client submission context, mapping directly to Canton rejection families (missing controller authority; contract not found / not visible; package drift / vetting mismatch; contention; and the remaining named families).

#### 2.3 Delivery and extensibility on `dpm` — reusing the mechanism, not rebuilding it

`dpm` describes itself as a package manager for DARs, components, and templates, an extensible launcher for arbitrary subcommands, and a publisher for components — and it already supports third-party components published to arbitrary OCI registries. This proposal therefore ships **no plugin registry, no installer, and no version-resolution machinery of its own**.

**Engine packaging.** The engine is published with `dpm publish component oci://<registry>/<path>/cfce:<version>`, platform-aware as `dpm` requires, with a `component.yaml` (`apiVersion: digitalasset.com/v1`, `kind: Component`) declaring the engine's subcommand under `spec.commands` with a name, description, and aliases so it appears in `dpm` available commands and `dpm --help`. The engine is implemented in **Go**, matching `dpm`'s own toolchain, so the four required platform artifacts (darwin/arm64, darwin/amd64, linux/amd64, linux/arm64) are static binaries produced by one cross-compile matrix with no runtime dependency; OCI annotations record commit SHA and branch on every publish, feeding the provenance chain. Publication targets a public OCI registry operated by the project — Digital Asset's own registries are not written to — and `dpm`'s semver checks on component URIs apply. Because `dpm` supports airgapped installation, air-gapped and regulated operators can adopt the engine through the same path.

**Decoder packs use `exports`, not a custom loader.** A `component.yaml` may declare `spec.exports` as a map from a key to a list of paths with a `conflict-strategy`; under `extend`, several components may contribute the same key and the effective path list is the **concatenation** of their contributions, delivered to the component through the resolution file `dpm` generates at run time. Decoder distribution is therefore native:

- The engine component defines the export key for decoder packs.
- Canonical, experimental, and organization-private packs are published as **data-only components** — a `component.yaml` declaring only `exports`, with no `commands` and no `jar-commands`, which the component schema permits — containing decoder documents, fixtures, and playbooks and nothing executable.
- A consuming project lists the engine and whichever packs it wants; `dpm` resolves and concatenates them, and `spec.dependency-paths` supplies the engine with the injected absolute path to any pack it depends on.
- Organizations host private packs in their own registry using standard `dpm` registry and credential configuration, so proprietary failure families never leave their infrastructure and no fork is required.

**`dpm` concatenates; the engine arbitrates.** `extend` produces a merged path list, not a resolved decision, so the determinism guarantees remain the engine's responsibility and are unchanged: most-specific matcher first, ties broken by declared priority then confidence, irreducible ambiguity surfaced as `ambiguous`. **Namespace precedence is enforced against a signed canonical index**: a pack may claim the `canonical` namespace only if its digest appears in the signed index published from the public repository; unindexed packs load as `experimental` regardless of what they assert, and `org-private` packs are ranked explicitly by the adopting project. This closes the shadowing hole that a naive concatenation would otherwise open, in which an untrusted pack could outrank a reviewed decoder. Every diagnosis names the pack, namespace, and digest that produced it.

**Version-gating keyed to what the toolchain resolved.** `dpm` dynamically injects the resolved SDK version into the component environment and participates in component resolution on `sdk-version`, and `dpm install` reports installed, remote, and active versions in machine-readable form. The engine selects the applicable decoder set from that injected value rather than from an assumption, and CI enumerates the matrix from the same source.

#### 2.4 Extensibility and knowledge-base governance

- **Decoders are declarative data, not code.** A decoder is a versioned, schema-validated document of matcher predicates over the rejection mapping to a category, confidence, ranked next checks, and a playbook. The engine interprets decoders; no contributed code executes in it. Matcher expressiveness is bounded by schema — no unbounded backtracking constructs — so a contributed decoder cannot degrade engine performance. Packaging packs as data-only components preserves this invariant end to end.
- **Fixture-gated, regression-proof contributions.** Every decoder ships positive fixtures (rejections it must classify) and negative fixtures (rejections it must not match). CI schema-validates, then runs the decoder against the frozen corpus: it must be correct on its fixtures and must not lower any existing family's measured precision. A contribution that regresses the corpus is rejected automatically.
- **Deterministic conflict resolution.** The same rejection plus the same resolved pack digests always yields the same diagnosis.
- **Verified version-gating.** CI replays the frozen corpus against a matrix of **at least 3 SDK versions** installed through `dpm`, asserting every decoder classifies correctly *inside* its declared range and **abstains outside it**. A decoder that fires on an undeclared generation fails CI. Deprecation and supersession are first-class lifecycle states; a new SDK release is handled by extending the matrix.
- **Namespacing with enforced precedence.** Canonical (signed index), experimental (default for unindexed packs), organization-private (explicitly ranked by the adopter). Every diagnosis reports its source.
- **Governed acceptance.** Promotion into the canonical set follows a documented rubric — has fixtures; no regression; actionable diagnosis; correct next checks; version-gated and matrix-verified — reviewed via the Daml tooling SIG with CODEOWNERS.
- **Versioned format + provenance.** The decoder-format schema is semver'd with a compatibility layer; each decoder records author, origin, date, and applicability; each pack records commit SHA and digest.
- **Optional, payload-free feedback loop.** Teams may opt in to report whether a diagnosis was correct — aggregate signal only, no payloads or party data — to refine calibration and flag decoders for review. Off by default.
- **Local reproducibility.** `dpm component init` scaffolds a local component, and local packs can be referenced by path, so a contributor develops and verifies a pack against the full matrix before opening a pull request.

#### 2.5 Signal contract — grounded in what Canton actually exposes

- *Guaranteed (Ledger API):* completion status, error codes and rejection payloads, environment metadata; a client-supplied correlation ID where the client chooses to set one.
- *Guaranteed (toolchain):* the resolved SDK version injected by `dpm`; the resolved decoder-pack path list and digests.
- *Optional (best-effort, only if the deployment exposes it):* gateway markers, participant logs.
- *Out of scope:* participant-internal execution traces and any inferred stage markers from undocumented internals.

### 3. Architectural Alignment

- Consumes the **Canton Ledger API** (rejection payloads, completions) — the stable, public signal surface. No fork of the participant, the Daml runtime, or the synchronizer.
- Consumes the **`dpm` component, export, registry, and SDK-resolution mechanisms** for distribution, extensibility, and version keying. No fork of `dpm` and no upstream change required: third-party components at arbitrary OCI URIs and multi-component `extend` exports are already supported. Reference documentation: the Digital Asset SDK development-tools overview on `docs.canton.network`.
- **Open, versioned taxonomy, decoder format, knowledge base, and integration contract** — consumable by the community and by other tooling without depending on this project's engine.
- **Complements the DPM diagnostic component family.** DPM Trace (PR #327) inspects, navigates, diffs, and source-links; DPM Debug (PR #494) provides visual debugging; the Transaction Profiler (PR #379) measures execution cost. All operate on committed transactions. This engine classifies submissions that never committed, where there is no transaction to inspect, and offers each of them classification as a call rather than a reimplementation.
- Aligned with **CIP-0082** (Development Fund allocation) and **CIP-0100** (governance and review process).
- Relevant SIGs: **Daml Language & Developer Tooling**, **Canton APIs (Ledger API, SQL API, Admin API)**, **dApp Integration**.

### 4. Backward Compatibility

No backward compatibility impact. The engine is a net-new developer-tooling component — a library, CLI, and opt-in DPM component that takes a rejection and returns a diagnosis. It does not modify Canton protocol, node, ledger, Daml runtime, or `dpm` behavior, and requires no change to existing submission flows. Adoption is additive: a project that does not list the component is unaffected, and removing it restores the prior state exactly.

### 5. Scope Boundaries

Explicitly **out of scope**:

- **Any bespoke plugin registry, installer, decoder loader, or component-distribution mechanism.** *Rationale:* `dpm` already provides third-party component publication to arbitrary OCI registries, opt-in via project configuration, semver checks, credentialed private registries, airgapped installation, and multi-component `extend` exports. A parallel mechanism would duplicate funded upstream work and fragment how teams obtain Canton tooling. (Present in earlier revisions; removed.)
- **A governed multi-tenant bundle store.** *Rationale:* for a failed submission there is no cross-party information asymmetry to resolve — the submitter already holds the fullest relevant view, and preparation-stage errors are visible only to the submitter. (Present in the original submission; removed.)
- **Shareable / escalation diagnostic bundles.** *Rationale:* as above; the diagnosis output serves the requesting team's own analysis.
- **A bespoke web inspection or debugger UI.** DPM Trace, DPM Debug, and existing tooling own presentation and consume the open components.
- **Transaction / localnet replay.** May be proposed separately if demand emerges.
- **Participant-internal execution tracing or a compiler debug-info format.** Not exposed as a stable API; not attempted.
- **Source-level line mapping.** Maps to failure families, not source spans; source-linking is DPM Trace's domain.

---

## Milestones and Deliverables

All week numbers are relative to grant acceptance (T+0).

### Milestone 1: Taxonomy, Decoder Format, Governance Rules & Multi-Version Evaluation Harness

- **Estimated Delivery:** Week 3
- **Focus:** Rejection-family taxonomy; decoder-format schema and validation, including the applicability contract keyed to `dpm`-resolved SDK / Canton / LF / error-code generations; governance rules — deterministic conflict resolution, verified version-gating with deprecation lifecycle, namespacing with signed-canonical-index precedence; labeled corpus (fault injection plus blind-adjudicated production rejections, with a frozen held-out split); evaluation harness parameterised by SDK version and runnable against a `dpm`-installed matrix. All Apache-2.0.
- **Deliverables / Value Metrics:** (1) At least **1** third party authors a schema-valid decoder from the published format alone, without engine internals. (2) Conflict-resolution, version-gating, and namespace-precedence rules are specified and testable, with the signed-index scheme documented. (3) The harness runs green across a matrix of **at least 3** SDK versions installed through `dpm` and is runnable in CI by others. (4) A measured precision/coverage **baseline** is published on the frozen held-out corpus, so M2's numeric target is set from what Canton's real rejection payloads support rather than asserted up front.
- **Staffing:** 2.0 FTE engineering × 3 weeks.

### Milestone 2: Reference Engine, Seed Decoders & DPM Component Packaging

- **Estimated Delivery:** Week 6
- **Focus:** Reference engine implementing deterministic conflict resolution, verified version-gating, namespace precedence, and pack resolution from `dpm` exports; `insufficient signal` first-class; 6–8 seed decoders plus per-family playbooks; library, CLI, and **published DPM component across 4 platforms**, with the canonical decoder pack published as a **data-only component** and a signed canonical index.
- **Deliverables / Value Metrics:** (1) Each decoder ships matcher rules, positive and negative fixtures, and unit tests in CI. (2) The engine is deterministic (same rejection + same pack digests → same diagnosis) and, verified across the **≥3-version** matrix, applies each decoder only within its declared range and abstains outside it. (3) On the frozen held-out corpus: **macro-averaged precision (the average of per-family precision, so a large family cannot mask a weak one) ≥ 90% on emitted diagnoses, no covered family below 80%**, at a coverage (non-abstain rate) fixed at M1 from the baseline with a floor of **≥ 50%** of covered-family failures, with the risk-coverage curve, per-family confusion matrix, and calibration published. (4) A team adopts the engine by adding **1 line** of project configuration and obtains a first diagnosis; the install path is reproduced independently by at least **1** external team. (5) A second decoder pack, published separately, is resolved and concatenated alongside the canonical pack via `extend`, demonstrated end to end, with an unindexed pack correctly demoted to `experimental`.
- **Staffing:** 2.0 FTE engineering × 3 weeks.

### Milestone 3: Contribution Pipeline, Integration Contract, Docs, Validation & Community Launch

- **Estimated Delivery:** Week 10
- **Focus:** Full contribution and review pipeline (PR → schema-validate → CI across the SDK matrix with no-regression gate → SIG rubric acceptance → published pack → resolved by `dpm`); experimental and organization-private packs with provenance; published integration contract with reference adapter; optional payload-free feedback loop; local reproducibility via `dpm component init` and path-referenced packs; golden-path docs, decoder-authoring guide, and starter repo covering both the wholesale opt-in and SDK-override configuration paths; validation on InfraSingularity's own production Canton failures; lean observability.
- **Deliverables / Value Metrics:** (1) The pipeline is demonstrated **end-to-end** — a decoder is authored, schema-validated, CI-checked across the matrix with no regression, accepted under the rubric, published as a pack, and resolved by `dpm`. (2) At least **2** teams with no prior contact with InfraSingularity run a diagnosis and author a decoder from documentation alone. (3) The engine is **validated on real rejection payloads from InfraSingularity's own production Canton operations**, with confirmed-correct diagnoses and **median time-to-root-cause under 30 minutes** on covered categories, measured over at least **20** real failure cases. (4) The integration contract is published with a reference adapter and at least **1** external consumer integration attempted; consumption by a DPM diagnostic component is an explicit target where timelines align. (5) Independent uptake and external contributions are pursued and **reported as a target (aim: 3 teams or contributors)**, not a release condition.
- **Staffing:** 1.5 FTE engineering + 0.25 FTE technical writer/DevRel × 4 weeks.

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion on **ecosystem value**, not artifact delivery alone:

- **Community extensibility, loopholes closed:** a third party adds a decoder pack **without forking the engine**, demonstrated end to end, with every guarantee enforced — declarative data only (no contributed code executes in the engine, and packs are data-only components), fixture-gated with an automated no-regression check, deterministic conflict resolution, version-gating verified across a **≥3-version** `dpm`-installed SDK matrix, namespace precedence enforced against a signed canonical index so an untrusted pack cannot outrank a reviewed decoder, and governed acceptance via the SIG rubric. External contributions are a reported target (aim: 3), not a gate.
- **Toolchain-native distribution:** the engine installs as a **DPM component** from a public OCI registry with one line of project configuration, across 4 platforms, with packs digest-pinned and private packs supported through standard registry credentials; **no bespoke registry, loader, or installer is shipped**. Reproduced by at least 1 external team.
- **Adoption and real-world function:** the committed criterion is validation on **real rejection payloads from InfraSingularity's own production Canton operations**, with confirmed-correct diagnoses. Independent adoption is a **reported target, not a gate** — with no design partners committed and a short usable window, payment is not held against external teams' timelines.
- **Diagnostic effectiveness (selective classification):** measured on the **frozen held-out corpus** labeled by fault injection and blind adjudication. On emitted (non-abstain) diagnoses: **macro-averaged precision ≥ 90%**, **no covered family below 80%**, at the **M1-fixed coverage** (floor ≥ 50%). Below threshold the engine returns `insufficient signal`. Risk-coverage curve, per-family confusion matrix, and calibration published; precision reported per confidence bucket. Precision is the internal build-quality gate; extensibility and adoption are the ecosystem-value measures.
- **Durability against Canton's evolution:** every canonical decoder's declared applicability is verified — correct in range, abstaining out of range — on every SDK version in the matrix, so knowledge-base rot is a build failure.
- **Time-to-root-cause:** median time from failed submission to identified root cause on covered categories **below 30 minutes**, over at least 20 real cases.
- **Support load:** a measurable reduction in "send me your logs" round-trips on covered categories is reported.
- **Open artifacts:** taxonomy, decoder format, decoders, fixtures, evaluation harness, integration contract, governance rules, signed-index scheme, and playbooks published under **Apache-2.0** (proposal text **CC0-1.0**).

---

## Risks and Mitigations

- **The `dpm` component surface is young.** Component publication, URI support, exports, and SDK-version injection have all landed recently and may churn. *Mitigation:* the engine ships as a **library and plain CLI as well as** a component; the component is a distribution path, not a hard dependency, and no funded milestone fails if component packaging must be revised.
- **Absorption by an adjacent DPM component.** A component that already holds transaction context could bolt on ad-hoc classification. *Mitigation:* publish the integration contract early (M3, with the interface fixed at M2) so calling a measured classifier is cheaper than reimplementing one; the moat is the corpus, harness, and governed knowledge base, not the engine binary.
- **Insufficient real rejection volume for a credible corpus.** *Mitigation:* fault injection supplies deterministic true labels independent of production volume, and the coverage floor is set at M1 from the measured baseline rather than promised up front.
- **Community contributions degrade quality.** *Mitigation:* the fixture-gated no-regression CI, matrix-verified applicability, and signed-index namespace precedence are all automated gates, not review conventions.
- **No champion at submission.** Acknowledged. This proposal is submitted with Champion: TBD and InfraSingularity is actively seeking a Tech & Ops sponsor; the proposal is scoped so no milestone depends on unfunded external commitments.

---

## Funding

**Total Funding Request: 450,000 CC**

Revised down from 720,000 CC. Delivering on `dpm`'s existing component and export mechanisms **removes** the bespoke plugin registry, decoder loader, and version-resolution machinery that earlier revisions budgeted for, and the multi-version CI matrix and the platform build matrix are absorbed within the staffing already planned. Scope and milestone deliverables are unchanged from the previous revision: the reduction reflects a smaller build, not a smaller deliverable.

### Payment Breakdown by Milestone

| Milestone | Scope | Amount (CC) |
| --- | --- | --- |
| M1 | Taxonomy, Decoder Format, Governance Rules & Multi-Version Evaluation Harness | 110,000 |
| M2 | Reference Engine, Seed Decoders & DPM Component Packaging | 180,000 |
| M3 | Contribution Pipeline, Integration Contract, Docs, Validation & Community Launch | 160,000 |
| **Total** | | **450,000** |

Each milestone is paid only upon committee acceptance.

### Payment Structure — Delivery vs Verified Outcome

Each milestone's payment splits between artifact delivery and an independently verifiable outcome, weighted so that outcome share rises across the grant, and **half of the total (225,000 CC) is gated on measured value**.

| Milestone | Amount (CC) | Delivery tranche | Outcome tranche (release condition) |
| --- | --- | --- | --- |
| M1 | 110,000 | 80,000 | 30,000 — precision/coverage baseline published on the frozen held-out corpus; harness green across a ≥3-version `dpm`-installed SDK matrix; taxonomy, format, governance rules, or corpus consumed by ≥ 1 external tool or validated in external CI |
| M2 | 180,000 | 80,000 | 100,000 — on the frozen held-out corpus: **macro precision ≥ 90% on emitted diagnoses**, no covered family below 80%, at the M1-fixed coverage (≥ 50% floor); determinism verified; **version-gating verified across the matrix (correct in range, abstaining out of range)**; engine installable as a DPM component in 1 configuration line across 4 platforms and reproduced by ≥ 1 external team; a second, separately published pack resolved via `extend` with an unindexed pack correctly demoted; curve, confusion matrix, and calibration published |
| M3 | 160,000 | 65,000 | 95,000 — contribution pipeline demonstrated end to end (authored → schema-validated → CI no-regression across the matrix → SIG-accepted → published → resolved by `dpm`); **integration contract published with a reference adapter**; engine validated on **real production failures from InfraSingularity's own Canton operations** with median TTRC **< 30 min** over ≥ 20 cases; ≥ 2 cold-start teams complete diagnosis and decoder authoring from docs alone. Independent uptake reported as a target (aim: 3), not a release condition |
| **Total** | **450,000** | **225,000 (50%)** | **225,000 (50%)** |

### Volatility Stipulation

Project duration is **under 6 months** (10 weeks). Should the timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility.

---

## Co-Marketing

Upon release, InfraSingularity will collaborate with the Foundation on:

- Announcement coordination at **feature-complete (Week 6)** and at **community launch (Week 10)**
- A **technical case study** showing before-and-after time-to-root-cause on at least one real failure class
- A **contribution guide and "call for decoders"** inviting the ecosystem to publish packs
- Conference and community talk submissions to relevant Canton and Daml developer venues

---

## Motivation

Developer-velocity tooling is a force multiplier for Canton adoption. Failed transactions on Canton are uniquely hard to diagnose because root cause depends on Canton-specific context — parties, act-as/read-as, disclosure and visibility, package vetting, environment drift — that no single log line surfaces, and today there is **no shared, growing knowledge base of these failure modes**. Every team re-learns the same rejections from scratch. A community-extensible classification engine converts that tacit, repeatedly-relearned knowledge into a versioned, machine-checkable asset that compounds as the ecosystem contributes; and because distribution and pack discovery ride `dpm`, teams acquire it through the toolchain they already have rather than as one more thing to install, track, and update.

**Estimated portion of the ecosystem that benefits:**

- **~100% of dApp teams building on Canton** hit at least one targeted failure category during integration and on every environment promotion. Direct beneficiaries.
- **~80% of infrastructure and support teams** spend material time triaging Canton-specific failures; a categorized diagnosis with ranked next checks replaces that guesswork.
- **CI pipelines** for any team running Canton integration tests classify failures automatically, using the same configuration as local development.
- **Tooling authors** (DPM Trace, DPM Debug, the Transaction Profiler) and operators consume the open taxonomy, decoder format, and knowledge base through the integration contract rather than rebuilding failure-diagnosis logic.

Adoption is expected to start with teams already shipping on Canton and to compound as packs accumulate.

---

## Rationale

This proposal **extends the existing ecosystem** rather than replacing any component:

- Consumes the **Canton Ledger API** — the stable, public surface — with no fork of the participant, runtime, or synchronizer.
- Consumes the **`dpm` component mechanism** for distribution, opt-in, private registries, airgapped installation, and SDK-version keying instead of building a parallel registry. This is the sharpest change from earlier revisions: the original draft specified a bespoke plugin/registry model that duplicated funded upstream work and would have placed the engine outside the channel through which Daml teams obtain tooling.
- **Uses `dpm`'s `extend` exports as the extensibility mechanism.** Community and organization-private decoder packs are ordinary data-only components exporting under a shared key; `dpm` discovers and concatenates them, and the engine arbitrates deterministically with namespace precedence enforced against a signed index. This is strictly less code, strictly more standard, and it preserves the no-code-execution guarantee that a plugin-of-executables design would have destroyed.
- **Turns version-gating from a claim into a test.** Declaring that a decoder applies to a given Canton generation is worthless if nothing checks it. Because `dpm` installs and reports SDK versions, the frozen corpus replays across a matrix of generations, so every applicability claim is enforced in CI and rot becomes a build failure rather than a silent field regression.
- **Complements existing observability** — logs, metrics, tracing — by adding a Canton-aware diagnosis layer on top rather than competing with logging or APM tooling.
- **Complements the DPM diagnostic component family rather than duplicating it.** PRs #327, #494, and #379 all operate on transactions that exist. This engine addresses submissions that never committed. The only overlap with any of them is decoding a rejection against DAR metadata; the classification engine, the community knowledge base, and the measured, published precision-coverage discipline have no counterpart in any of them. Publishing a stable integration contract converts the natural risk — a component with transaction context bolting on ad-hoc classification — into an integration.
- **Community-extensible by design, robust by construction.** The taxonomy, decoder format, knowledge base, harness, integration contract, and governance rules are open and versioned, so the ecosystem grows diagnostic coverage; and the automated gates — declarative data, fixture-gated no-regression CI, deterministic resolution, matrix-verified applicability, signed-index precedence, governed acceptance — keep quality and determinism intact as it grows. That is what makes this ecosystem infrastructure rather than a single vendor's tool.

---

## Copyright

This proposal text is licensed under **CC0-1.0**. All code and published artifacts — taxonomy, decoder format, decoders, fixtures, evaluation harness, integration contract, governance rules, signed-index scheme, and playbooks — are licensed under **Apache-2.0**.
