## Development Fund Proposal — Canton Failure-Classification Engine

**Organization:** InfraSingularity
**Author / Primary Contact:** Jitin Jain, tech@infrasingularity.com (GitHub: @infrasingularity)
**Status:** Submitted (resubmission of [#297](https://github.com/canton-foundation/canton-dev-fund/pull/297))
**Created:** 2026-05-04 · **Updated:** 2026-10-16
**Proposal Type:** RFP-aligned
**RFP / Roadmap Area:** Developer Experience, Tooling & Education — **RFP 19, DPM Components and Extension Ecosystem** (debugging workflows, observability tools). Secondary: RFP 20, Indexers (debugging tools) and RFP 18, Integration into SDLCs (CI classification of failed submissions).
**Champion:** «Name, Organization» **OR** `Needs Champion`
**Total Funding Request:** 450,000 CC
**Project Duration:** 3 months (12 weeks)
**Label:** daml-tooling
**Suggested SIGs:** Daml Language & Developer Tooling (primary); Canton APIs
**Prior Development Fund work:** «PR #NNN — project name», all milestones accepted («dates»).

---

## Abstract

A deterministic, community-extensible **failure-classification engine** for Canton, delivered as a DPM component. It takes a rejected submission — a Ledger API completion, a synchronous prepare error, or a `dpm trace` completion file — and returns one named failure family, two to five ranked next checks, and a link to the official error-code entry, at a published, measured precision. Where the signal cannot distinguish causes it returns `insufficient signal` rather than a guess.

Structurally it is **one engine** (rules-based, installed through `dpm`), **one public rules repository** (the taxonomy and decoders, extended by pull request), and **one test suite** (a labeled corpus the engine's accuracy is measured against in CI). Decoder rules are declarative data shipped as data-only DPM components, so anyone can extend the knowledge base without engine access, and CI rejects any contribution that lowers measured accuracy. A versioned diagnosis schema lets DPM Trace, cantonsim, CI runners and SDK error handlers call a measured classifier instead of each re-implementing failure heuristics.

This is the final #297 scope (single engine, open knowledge base, DPM-native distribution; no bundle store, no replay, no UI), restructured for Dev Fund 2.0 and repositioned against DPM Trace Milestone 3, which shipped after the last #297 revision.

---

## Problem and Evidence

**The problem.** When a Canton submission is rejected, no update-id is created and nothing commits. The developer has an error code and a rejection payload. One code covers many root causes: a single authorization or visibility rejection may be a missing controller in the template, an act-as/read-as claim absent from the token, a party hosted on a different participant than assumed, a divulgence gap, or package-vetting drift on a counterparty's node. The official error-code inventory explains what the code means; it cannot say which cause produced *this* failure, because a documentation page cannot read the payload, the command, the party set or the vetting state. Teams reconstruct that by hand, on every environment promotion, and every team re-learns the same rejections.

**Evidence.**

- The 2026–2028 roadmap records that Transaction Debugging & Observability was the lowest-rated experience area in the Q1 2026 DevRel survey (2.55) and remained tied for lowest in Q2 (3.26), and identifies the debugging/observability gap as the longest-standing unmet need in the dataset.
- RFP 19 lists debugging workflows and observability tools as wanted DPM components and has no prior grant examples.
- DPM Trace (#327) Milestone 3 now renders a failed submission's completion status and error details (`dpm trace --command-id`, `--completion-file`), and Debug Info Metadata (#743) links failures to Daml source lines. Neither classifies: both show the failure; neither names the cause or the next check. The gap has moved from "cannot see the failure" to "cannot interpret it".
- The Foundation's hands-on review of that milestone (#823) found that a command rejected during interpretation never reaches the completion stream and can only be read from a captured file. A classifier therefore has to accept both the synchronous prepare error and the captured completion — the two inputs this engine takes.
- cantonsim (#879) proposes structured attribution of routing rejections with its own registry. Two unmeasured, incompatible classification layers is the fragmentation RFP 19 exists to prevent; one measured, shared layer is the alternative.
- In the #297 review, a Core Contributor wrote that the failure-classification engine "could have high value" and asked that it be community-extensible; this design is the answer to that ask.
- InfraSingularity operates Canton validators as a service. In «period» our support queue logged «N» rejected-submission tickets across «M» hosted parties; «P»% fell in the six seed families below; median time-to-root-cause was «T». These tickets seed the labeled corpus.

---

## Specification

### 1. Objective

Reduce time-to-root-cause for failed Canton submissions from hours to minutes by producing a deterministic, categorized diagnosis with ranked next checks, delivered as a DPM component plus an open, community-extensible knowledge base, distributed through the toolchain Daml teams already use.

Single objective: the engine and the mechanisms that let the community extend it safely. Presentation, navigation, diffing, replay and any shareable-artifact layer are out of scope.

### 2. Implementation Mechanics

#### 2.0 Relationship to the Canton error-code inventory

The engine depends on the inventory and reproduces none of it. The inventory is a context-free dictionary: one entry per code, the same text for every occurrence. The engine takes the code **plus** the structured payload and submission context and returns which known cause produced this failure. Decoder matchers key on the official codes and payload fields; taxonomy families cross-reference the code identifiers they cover; every diagnosis links back to the official entry. The inventory stays the single source of truth for what a code means.

#### 2.1 Open components (Apache-2.0)

- **Rejection-family taxonomy and declarative decoder format.** A versioned, schema-validated rule format: match on error code, rejection family and structured payload fields → primary diagnosis, 2–5 ranked next checks, a playbook, and a link to the official error-code entry. Every decoder carries an applicability contract (SDK, Canton protocol, LF and error-code generations it is valid for), resolved against the SDK version `dpm` injects at run time.
- **Public rules repository (the knowledge base).** Taxonomy, decoders and playbooks as the single source of truth. Releases are checksummed and immutable, so every diagnosis names the rule-set release that produced it.
- **Contribution pipeline.** A decoder arrives as a PR with positive fixtures (rejections it must classify), negative fixtures (rejections it must not match) and its expected classification. CI schema-validates it, runs the frozen test suite on every supported SDK version, and rejects anything that lowers an existing family's measured precision. Promotion into the canonical set follows a documented rubric, reviewed through the Daml tooling SIG with CODEOWNERS.
- **Test suite (labeled corpus plus evaluation harness).** Labels from two sources: fault injection (failures induced so the true cause is known by construction) and real production rejections labeled blind by an adjudicator who has not seen the engine's output. A frozen held-out split contributors never tune against. The harness publishes the risk-coverage curve, a per-family confusion matrix (so a headline number cannot hide one weak family) and confidence calibration. Every case is tagged with its SDK version and the suite re-runs on each supported version, so a release that changes error formats fails the build instead of producing wrong diagnoses in the field.
- **Integration contract.** A versioned JSON schema for the diagnosis plus a small, stable library interface.

#### 2.2 Funded reference deliverable

- **Reference engine** — deterministic, rules-based, Go, no LLM dependency for correctness. Loads decoders from the resolved pack set; returns a primary diagnosis with ranked next checks, decoded context, and the producing pack's namespace and digest; below its confidence threshold returns `insufficient signal` with the observed facts. Ships as a library, a CLI, and a published DPM component (`dpm cfce`, alias `dpm diagnose`).
- **Seed decoders (6–8)** across: missing controller authority; act-as/read-as scope; contract not found or not visible (disclosure/divulgence); malformed command; package drift and vetting mismatch; contention. Decoders read template ID, choice name (including interface choices) and act-as/read-as parties from the rejection and the submission context.

#### 2.3 Distribution and extensibility on `dpm` (DPM component conventions)

`dpm` already supports third-party components published to arbitrary OCI registries, opt-in via project configuration, semver checks, credentialed private registries, airgapped installation, SDK-version injection, and multi-component `extend` exports. This proposal ships **no plugin registry, installer, loader or version-resolution machinery of its own**.

- **Engine packaging.** Published with `dpm publish component` to a public OCI registry operated by the project, with a `component.yaml` (`apiVersion: digitalasset.com/v1`, `kind: Component`) declaring the subcommand under `spec.commands`, static binaries for all four platforms `dpm` requires (darwin/arm64, darwin/amd64, linux/amd64, linux/arm64), and OCI annotations recording commit SHA on each publish.
- **Decoder packs use `spec.exports`, not a custom loader.** The engine declares the export key; canonical, experimental and organization-private packs are data-only components (a `component.yaml` declaring only `exports`, nothing executable) that export under that key with `conflict-strategy: extend`. `dpm` concatenates the path lists at run time; the engine arbitrates: most-specific matcher first, ties broken by declared priority then confidence, irreducible ambiguity surfaced as `ambiguous`.
- **Namespace precedence against a signed index.** A pack may claim the `canonical` namespace only if its digest appears in the signed index published from the rules repository; unindexed packs load as `experimental`; `org-private` packs are ranked explicitly by the adopting project. An untrusted pack cannot outrank a reviewed decoder.
- **Version-gating keyed to what the toolchain resolved.** The engine selects the applicable decoder set from the SDK version `dpm` injects; CI enumerates its matrix (at least three SDK versions) from the same source and asserts each decoder classifies inside its declared range and abstains outside it.
- **Private packs stay private.** Organizations host them in their own registry with standard `dpm` credentials; proprietary failure families never leave their infrastructure and no fork is required. `dpm component init` and path-referenced packs give contributors local reproduction before opening a PR.
- **Governance invariants.** Decoders are declarative data with schema-bounded matchers, so no contributed code executes and no contribution can degrade engine performance; the decoder schema is semver'd; each decoder records author, origin, date and applicability; deprecation and supersession are first-class lifecycle states.

#### 2.4 Inputs

- *Guaranteed (Ledger API):* completion status, error codes and rejection payloads; synchronous prepare-stage gRPC errors (the only record of a command rejected during interpretation); environment metadata; a client-supplied correlation ID where set.
- *Guaranteed (toolchain):* the `dpm`-injected SDK version; the resolved pack path list and digests; a `dpm trace --completion-file` document, so a failure already captured for DPM Trace is classified without re-capture.
- *Optional:* gateway markers and participant logs, used only to raise confidence, never required.
- *Not used:* participant-internal execution traces or inferred stage markers from undocumented internals.

#### 2.5 Data and privacy (RFP 20 questions)

- **Which data is required:** only the submitter's own rejection (completion or prepare error), the submitted command context, and the local SDK version.
- **Where it comes from:** node-local and application-provided. The engine runs where the submitter runs and reads only what the submitter's own participant returns to it. It uses no publicly observable or network-wide data.
- **Mediator metadata:** none is used, so the engine is unaffected if involved-party metadata stops being publicly exposed.
- **Privacy and access control:** diagnoses are computed locally; nothing leaves the user's environment. Private packs live in the organization's own registry. The optional correctness feedback is off by default, opt-in, and payload-free (no payloads, party IDs or contract data).

### 3. Relationship to adjacent work

| Work | Status | What it does | What this engine adds |
| --- | --- | --- | --- |
| DPM Trace #327 (Walnut) | Approved; M1–M3 delivered | Renders committed, prepared and failed submissions; diffs; source links | Classification of the failure DPM Trace renders; consumes its completion file; publishes a schema DPM Trace can display |
| Debug Info Metadata #743 (Walnut) | Merged, RFP 19 | Links execution results and failures to Daml source lines | Orthogonal: a line is *where*; a family is *why*. Decoders may cite the metadata reader when present |
| cantonsim #879 (PixelPlex) | Open | Pre-submission preview, pre-flight, routing-rejection attribution | A shared, measured classifier it can call instead of building its own registry; no duplication of preview or pre-flight |
| Daml Shell #752 (DA) | Open, RFP 20 | Interactive ledger investigation for support | Different layer: Shell queries state; this names the cause of a rejection |
| DPM Debug #494, Profiler #379, Tenderly #481 | Closed | Visual debugging, cost profiling, hosted simulation | No overlap |

We will propose the completion-file input and the diagnosis schema to the Walnut team at M1 so the two tools agree on one format. If DPM Trace adopts the schema, that is the first external consumer; the acceptance criteria do not depend on it.

### 4. Architectural Alignment

Consumes the Canton Ledger API (completions, rejection payloads) and the `dpm` component, export, registry and SDK-resolution mechanisms. No fork of the participant, the Daml runtime, the synchronizer or `dpm`; no upstream change required. The taxonomy, decoder format, knowledge base and integration contract are open and versioned, consumable without depending on this project's engine. Aligned with CIP-0082 and CIP-0100.

### 5. Backward Compatibility

*No backward compatibility impact.* The engine is net-new and opt-in: a project that does not list the component is unaffected, and removing it restores the prior state exactly. It does not change Canton protocol, node, ledger, Daml runtime or `dpm` behavior.

### 6. Out of scope

A bespoke plugin registry, installer or loader (`dpm` provides them); a multi-tenant bundle store or shareable escalation bundles (the submitter already holds the fullest view, and prepare-stage errors are visible only to the submitter); a web or inspector UI (DPM Trace owns presentation); transaction or localnet replay; participant-internal tracing; source-level line mapping (#743 owns it). Each was in an earlier revision and was removed on reviewer feedback.

---

## Milestones and Deliverables

Weeks are relative to grant acceptance (T+0). Each milestone pays only on committee acceptance.

### Milestone 1: Taxonomy, Decoder Format, Governance Rules and Evaluation Harness

- **Estimated Delivery:** Week 3
- **Focus:** Rejection-family taxonomy; decoder-format schema and validator with the applicability contract; governance rules (deterministic conflict resolution, version-gating with deprecation lifecycle, signed-index namespace precedence); labeled corpus with frozen held-out split, seeded from InfraSingularity production rejections and fault injection; evaluation harness parameterised by SDK version and runnable in CI against a `dpm`-installed matrix of at least three versions; completion-file input format proposed to the DPM Trace team.
- **Deliverables / Value Metrics:** (1) At least one third party authors a schema-valid decoder from the published format alone. (2) Harness green across the three-version matrix and runnable by others in CI. (3) A measured precision/coverage baseline published on the held-out corpus; M2's coverage target is fixed from it.
- **Staffing:** 2.0 FTE engineering × 3 weeks.

### Milestone 2: Reference Engine, Seed Decoders and DPM Component

- **Estimated Delivery:** Week 7
- **Focus:** Engine implementing conflict resolution, version-gating, namespace precedence and pack resolution from `dpm` exports; `insufficient signal` as a first-class result; 6–8 seed decoders with playbooks; library, CLI and published DPM component on four platforms; canonical pack published as a data-only component with a signed index; `dpm trace` completion-file input.
- **Deliverables / Value Metrics:** (1) Every decoder ships matcher rules, positive and negative fixtures and CI tests. (2) Determinism verified: same rejection plus same pack digests gives the same diagnosis; each decoder fires only inside its declared range across the matrix. (3) On the frozen held-out corpus: macro-averaged precision ≥ 90% on emitted diagnoses, no covered family below 80%, at the M1-fixed coverage with a floor of 50% of covered-family failures; risk-coverage curve, confusion matrix and calibration published. (4) One line of project configuration installs the component; reproduced from documentation by at least one external team. (5) A second, separately published pack resolves alongside the canonical pack via `extend`, with an unindexed pack correctly demoted to `experimental`.
- **Staffing:** 2.0 FTE engineering × 4 weeks.

### Milestone 3: Contribution Pipeline, Integration Contract, Documentation and Adoption

- **Estimated Delivery:** Week 12
- **Focus:** Contribution pipeline end to end (PR → schema validation → CI across the matrix with no-regression gate → SIG rubric → published pack → resolved by `dpm`); integration contract with a reference adapter; decoder-authoring guide, starter repository, examples and golden-path documentation; validation on InfraSingularity production failures; adoption work with the teams named in the Adoption plan.
- **Deliverables / Value Metrics:** (1) Pipeline demonstrated end to end on a real external contribution. (2) Validated on at least 20 real production rejections with confirmed-correct diagnoses and median time-to-root-cause under 30 minutes on covered families. (3) Adoption gate met (see Acceptance Criteria). (4) Integration contract published with a reference adapter and at least one external consumer integration attempted.
- **Staffing:** 1.5 FTE engineering + 0.25 FTE technical writer × 5 weeks.

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion on ecosystem value, not artifact delivery.

- **Adoption (release condition for the M3 outcome tranche).** Within the grant period or an eight-week window after M3 delivery: (a) at least three independent organisations, of which at most one is an existing InfraSingularity client, run the engine on real (non-fixture) rejections and confirm so in writing on the PR or tracking issue, stating the family coverage they saw; (b) at least two decoders merged from contributors outside InfraSingularity; (c) at least one external tool, CI pipeline or SDK consumes the diagnosis schema in a shipped or merged change. If the window closes with the gate unmet, the outcome tranche is forfeited, not deferred.
- **Community extensibility.** A third party adds a decoder pack without forking the engine, with every guarantee enforced: declarative data only; fixture-gated no-regression CI; deterministic conflict resolution; version-gating verified across a three-version matrix; signed-index namespace precedence; governed acceptance.
- **Toolchain-native distribution.** Installs as a DPM component from a public OCI registry with one line of project configuration on four platforms; packs digest-pinned; private packs via standard registry credentials; no bespoke registry, loader or installer shipped; reproduced by at least one external team.
- **Diagnostic effectiveness.** On the frozen held-out corpus: macro-averaged precision ≥ 90% on emitted diagnoses, no covered family below 80%, at the M1-fixed coverage (floor 50%); curve, confusion matrix and calibration published.
- **Durability.** Every canonical decoder's applicability verified in and out of range on every SDK version in the matrix; knowledge-base rot is a build failure.
- **Time-to-root-cause.** Median under 30 minutes on covered families over at least 20 real cases, tool-timestamped from first classification to a resolved mark.
- **Documentation and knowledge transfer.** Decoder-authoring guide, starter repository, worked examples and golden-path docs published.
- **Open artifacts.** Taxonomy, decoder format, decoders, fixtures, harness, integration contract, governance rules, signed-index scheme and playbooks under Apache-2.0; proposal text CC0-1.0.

---

## Adoption plan

- **Consumers approached by name at M1:** Walnut (DPM Trace: completion-file input and schema display); PixelPlex (cantonsim: classification call for explained failures); «SDK maintainer, e.g. Rust or Python SDK team» (typed error handling over the schema); «two InfraSingularity hosting clients» (CI classification).
- **Distribution:** listed in the DPM component index maintained by Foundation DevRel; a "call for decoders" with the starter repository at M3; one recorded walkthrough; talk submissions to Canton developer venues.
- **Measurement:** written confirmations on the tracking issue; merged external decoders; schema consumers; opt-in, payload-free correctness feedback aggregated in the harness (off by default).

---

## Maintenance and sustainability

- **Owner after the grant:** InfraSingularity («named engineer») for a minimum of 12 months after M3 acceptance, funded from our validator-operations business, which runs the engine in production.
- **Cadence:** a canonical rule-set release within 30 days of every Canton SDK release that changes an error surface; CI matrix extended to each new supported version; security and schema fixes within 14 days.
- **Community governance:** CODEOWNERS on the rules repository shared with at least one Daml tooling SIG member from another organisation by M3; the acceptance rubric is public.
- **Transfer path:** repository, OCI namespace and signing key documented for handover to the Foundation or a SIG if InfraSingularity stops maintaining it. The engine is also a library and plain CLI, so no consumer depends on our registry staying up.

---

## Funding

**Total Funding Request: 450,000 CC** over 12 weeks. Unchanged from the final #297 revision (itself reduced from 720,000 CC when `dpm`'s native component and export mechanisms replaced a bespoke registry).

### Payment Breakdown by Milestone

- Milestone 1 (Taxonomy, Format, Governance, Harness): 110,000 CC upon committee acceptance
- Milestone 2 (Engine, Seed Decoders, DPM Component): 180,000 CC upon committee acceptance
- Milestone 3 (Pipeline, Contract, Docs, Adoption): 160,000 CC upon final release and acceptance

### Delivery vs outcome tranches

| Milestone | Amount (CC) | Delivery tranche | Outcome tranche (release condition) |
| --- | --- | --- | --- |
| M1 | 110,000 | 80,000 | 30,000 — baseline published; harness green on the three-version matrix; one third-party decoder authored from the format alone |
| M2 | 180,000 | 80,000 | 100,000 — precision targets met on the held-out corpus; determinism and version-gating verified; one-line install reproduced externally; second pack resolved via `extend` |
| M3 | 160,000 | 65,000 | 95,000 — adoption gate met (three organisations, two external decoders, one schema consumer); 20-case production validation with median TTRC < 30 min; pipeline demonstrated on an external contribution |
| **Total** | **450,000** | **225,000** | **225,000** |

### Volatility Stipulation

Project duration is under 6 months. Should the timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility.

---

## Co-Marketing

Upon release, InfraSingularity will collaborate with the Foundation on:

- Announcement coordination at M2 (component published) and M3 (call for decoders)
- A technical case study showing before-and-after time-to-root-cause on a real failure class
- Developer promotion: decoder-authoring guide, starter repository, recorded walkthrough and talk submissions

---

## Motivation

Failed submissions on Canton are uniquely hard to diagnose because root cause depends on Canton-specific context — parties, act-as/read-as, disclosure and visibility, package vetting, environment drift — that no single log line surfaces, and there is no shared, growing knowledge base of these failure modes. A community-extensible classification engine turns that repeatedly re-learned knowledge into a versioned, machine-checkable asset that compounds as the ecosystem contributes.

**Estimated portion of the ecosystem that benefits:**

- **dApp teams building on Canton:** effectively all hit at least one seed family during integration and on environment promotion.
- **Infrastructure and support teams** triaging hosted-party failures replace guesswork with a categorized diagnosis and ranked next checks.
- **CI pipelines** running Canton integration tests get a classified failure instead of a raw gRPC status, with the same configuration as local development.
- **Tool authors** (DPM Trace, cantonsim, language SDKs) call one measured classifier instead of each maintaining their own heuristics.

---

## Rationale

- **Extends what exists.** Consumes the Ledger API and the official error-code inventory; distributes through `dpm` components and `extend` exports instead of a parallel registry. This is the main change from the original #297 draft, which specified a bespoke plugin model.
- **Complements, not competes.** DPM Trace and #743 show *what* failed and *where*; this engine says *why* and *what to check next*, and consumes DPM Trace's completion file rather than re-capturing.
- **Data-only extensibility.** Packs are declarative data, so the no-code-execution guarantee holds end to end and quality is enforced by automated gates, not review conventions.
- **Version-gating as a test, not a claim.** Because `dpm` installs and reports SDK versions, the corpus replays across a matrix of generations and rot becomes a build failure.
- **Pay for value.** Half the grant is gated on measured outcomes, and the M3 outcome tranche is forfeited if independent adoption does not materialize.

---

## Risks and Mitigations

- **`dpm` component surface churn.** The engine ships as a library and plain CLI as well as a component; no milestone fails if packaging must be revised.
- **Absorption by an adjacent tool.** The integration contract is proposed to Walnut and PixelPlex at M1 and fixed at M2, so calling a measured classifier is cheaper than building one; the durable asset is the corpus, harness and governed knowledge base.
- **Insufficient real rejection volume.** Fault injection supplies deterministic labels independent of volume; coverage targets are set at M1 from the measured baseline.
- **Adoption gate missed.** The outcome tranche is forfeited; delivery tranches still require the artifacts and precision targets.
- **Contributions degrade quality.** Fixture-gated CI, matrix-verified applicability and signed-index precedence are automated gates.


## Change log against the final #297 revision (27 Aug 2026)

- Moved to `rfps/developer-experience-tooling-education/` and reformatted for Dev Fund 2.0: RFP mapping (19 primary; 20, 18 secondary), Problem and Evidence, RFP 20 data and privacy answers, Adoption plan, Maintenance plan, Team.
- Adoption is now a release condition for the M3 outcome tranche, with a forfeiture rule, replacing "reported target, not a gate".
- Repositioned against DPM Trace M3 and #743, which shipped after 27 Aug: the engine consumes `dpm trace` completion files and no longer claims to be the only tool that reads failed submissions. cantonsim and Daml Shell added to the adjacency table.
- Duration 10 → 12 weeks to hold an adoption window; funding unchanged at 450,000 CC.
- No mechanism removed.

---

## Copyright

This proposal text is licensed under CC0-1.0. All code and published artifacts — taxonomy, decoder format, decoders, fixtures, evaluation harness, integration contract, governance rules, signed-index scheme and playbooks — are licensed under Apache-2.0.
