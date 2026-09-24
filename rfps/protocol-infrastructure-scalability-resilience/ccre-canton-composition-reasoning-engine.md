## Development Fund Proposal

**Organization:** Individual
**Author / Primary Contact:** Vicky Prasad ([@vickyshaw29](https://github.com/vickyshaw29))
**Status:** Submitted
**Created:** 2026-03-27 (revised 2026-09-24 for Dev Fund 2.0)
**Proposal Type:** RFP-aligned
**RFP / Roadmap Area:** RFP 5 — Multi-synchronizer support for protocol, application development and operations (Protocol, Infrastructure, Scalability & Resilience)
**Champion:** `Needs Champion` (seeking a member of the Canton Protocol & Multi-Synchronizer SIG)
**Total Funding Request:** 375,000 CC on delivery + up to 200,000 CC paid per adopting team (maximum 575,000 CC)
**Project Duration:** 9 months (delivery milestones in about 5 months; adoption-linked payments until month 9)
**Label:** canton-protocol-multi-synchronizer

---

## Abstract

Canton's roadmap targets 100+ dedicated synchronizers and 1,000+ applications transacting across them by 2028. Every one of those applications will hit the same wall: a transaction runs on exactly one synchronizer, and it only succeeds if that synchronizer hosts every stakeholder of every input contract, has every input package vetted, and can receive every input through a valid reassignment. When those conditions do not hold, Canton rejects the submission at runtime, and no pre-deployment tool tells a developer or operator in advance.

CCRE (Canton Composition Reasoning Engine) is a pre-flight checker for multi-synchronizer deployments. It takes a Daml package and a synchronizer topology — hand-written or exported from a live node — and answers, before anything is submitted: *Will this workflow route? To which synchronizer? Which contracts will be reassigned? And if it cannot route, exactly which party, participant or package vetting is missing?* It ships as a CLI, a DPM component and a CI gate.

The engine is working today. The public MVP ([github.com/vickyshaw29/ccre](https://github.com/vickyshaw29/ccre), MIT, 28 tests) includes a **synchronizer routing dry-run** that models the core of the Canton router's selection rules, demonstrated on a Canton Coin ↔ private-synchronizer DvP (see §2).

---

## Why the Ecosystem Needs It

**The problem is structural and grows with the network.** Multi-synchronizer support is currently early access (Canton 3.5, `EnableMultiSynchronizer`). RFP 5 asks for its "final hardening and rollout" together with "improvements to developer tooling". Hardening the protocol makes multi-synchronizer deployments *possible*; CCRE makes them *predictable* for the teams building on them. The Foundation's DevRel surveys rank transaction debugging and dry-run tooling as the longest-standing unmet developer need (Transaction Debugging & Observability: lowest-rated area in Q1 at 2.55, tied for lowest in Q2 at 3.26). CCRE is a dry-run for the class of failure that multi-synchronizer deployments introduce.

**The highest-value flows are the ones most exposed.** Canton Coin lives on the Global Synchronizer, and its DSO party is hosted only by Super Validator nodes. Any application that settles Canton Coin atomically against an asset on a dedicated synchronizer — the core Network-of-Networks use case — will in practice only route to the Global Synchronizer, where the DSO is hosted, and only if every stakeholder of the other leg is hosted there too. Whether that holds depends on how the counterparty's participant is connected, which the app developer typically does not control and cannot see in tests. CCRE surfaces it before go-live.

**Who benefits:**

| Beneficiary | What CCRE gives them |
|---|---|
| Application developers building cross-synchronizer workflows (DvP, repo, collateral, payments) | A CI failure with a named cause instead of a production rejection |
| Validator / participant operators and dedicated-synchronizer operators | A check that party hosting and package vetting support the apps their users run, before onboarding them |
| Featured App teams and integrators | Evidence for counterparties that a workflow routes on the intended topology |
| Security reviewers (RFP 22) | Automated detection of deployment-configuration defects that code review cannot see |
| Daml 2.x teams migrating to Canton 3.5 | Detection of code that silently assumed unique contract keys (Milestone 2) |

**Adoption path.** CCRE is distributed where developers already work: `dpm ccre` (DPM component), a GitHub Action, and machine-readable JSON output. About 35% of the maximum grant (Milestone 4) is paid only per external team that adopts CCRE.

**Early adopters.** Confirmed early adopters will be listed here as they commit. Teams building or operating across synchronizers who want to pilot CCRE are invited to comment on this PR.

---

## Specification

### 1. Objective

Give every Canton application team and operator a pre-deployment answer to one question: **will this workflow execute on this multi-synchronizer topology, and if not, why not?**

### 2. Implementation Mechanics

**2.1 The routing model.** Per the Canton multi-synchronizer documentation, a Daml transaction executes on a single synchronizer. A synchronizer is eligible when all stakeholders of all input contracts are hosted on it, all input packages are vetted on it, and each input located elsewhere can be reassigned to it. A reassignment requires every stakeholder to be hosted on a *reassigning participant* (one connected to both source and target), sufficient signatory confirmation capacity on the target, and package vetting on the target. Among eligible synchronizers, the router prefers higher priority, then fewer reassignments, then the lowest synchronizer id. CCRE evaluates these conditions statically: the MVP covers hosting, vetting, reassigning participants and tie-breaking; Milestone 1 adds signatory confirmation thresholds (CCRE-011).

**2.2 Working today (delivered, not funded by this proposal).**

- `ccre route`: synchronizer routing dry-run — stakeholder hosting, package vetting, reassigning-participant check, priority / fewest-reassignments / id tie-breaking, with per-synchronizer blocker explanations and JSON output.
- `ccre validate --topology`: CCRE-003 stakeholder-hosting analysis across a topology.
- Visibility and authorization checks for workflow steps, deterministic SHA-256 result certificates.

Demonstration (`fixtures/dvp-amulet/`, stakeholders taken from the Splice `AmuletAllocation` template):

```
$ ccre route --schema contracts.json --topology topology-blocked.json --tx settle-dvp.json
ROUTING DECISION: NO VALID SYNCHRONIZER
[BLOCKED] global-synchronizer
  - STAKEHOLDER_NOT_HOSTED: Stakeholder 'BondIssuer' of 'BondAllocation' is not hosted on 'global-synchronizer'
  - NO_REASSIGNING_PARTICIPANT: No participant hosts 'BondIssuer' on both 'bond-private-synchronizer' and 'global-synchronizer'
[BLOCKED] bond-private-synchronizer
  - STAKEHOLDER_NOT_HOSTED: Stakeholder 'DSO' of 'AmuletAllocation' is not hosted on 'bond-private-synchronizer'
  ...
$ ccre route ... --topology topology-fixed.json
ROUTING DECISION: ROUTABLE → global-synchronizer
  reassign BondAllocation: bond-private-synchronizer → global-synchronizer
```

The current MVP reads a JSON contract model and a JSON topology. Milestone 1 removes both manual inputs.

**2.3 Inputs (Milestone 1).**

- **Packages:** DAR ingestion. Template stakeholders (signatories, observers, key maintainers) and choice bodies are extracted from Daml-LF. Cross-package interaction data is consumed from the Foundation-funded [Certora Daml Package Analyzer](https://github.com/Certora/daml-analyzer) JSON output (Apache-2.0) rather than re-implemented, so CCRE extends existing tooling instead of duplicating it.
- **Topology:** `ccre topology export` reads a live node through public APIs — Admin API `TopologyManagerReadService` (`ListPartyToParticipant`, `ListVettedPackages`, `ListSynchronizerTrustCertificate`, `ListParticipantSynchronizerPermission`) and Ledger API `StateService.GetConnectedSynchronizers` — and writes the CCRE topology file. Hand-written topologies remain supported for planning deployments that do not exist yet.

**2.4 Checks.**

| Id | Check | Basis in Canton | Milestone |
|---|---|---|---|
| ROUTE | Synchronizer routing dry-run (eligibility, selection, reassignment plan) | Synchronizer router rules | MVP → M1 hardened |
| CCRE-003 | Stakeholder not hosted on a synchronizer where the template must execute | Stakeholder hosting requirement | MVP → M1 on DAR input |
| CCRE-020 | Input package not vetted by the hosting participants on the target synchronizer | VettedPackages topology mapping | M1 |
| CCRE-011 | Reassignment infeasible: no reassigning participant, or signatory confirmation threshold not met on target | Unassignment validation rules | M1 |
| CCRE-001 | Contract-key hazards under Canton 3.5 non-unique keys (see below) | LF 2.3 contract keys | M2 |
| CCRE-010 | Choice fetches/exercises a contract that may be assigned to a different synchronizer than the rest of the transaction | Single-synchronizer execution | M2 |

**CCRE-001 in detail.** Canton 3.5 (LF 2.3) reintroduced contract keys as non-unique: a key can match zero, one or many active contracts; `fetchByKey`, `lookupByKey` and `exerciseByKey` act on the first match in a defined recency order among contracts visible to the participant; negative lookups are not validated. Code written for Daml 2.x unique keys can therefore silently act on the wrong contract, or treat `lookupByKey == None` as proof that no contract exists. CCRE-001 flags (a) uniqueness guards built on negative lookups, (b) key operations on templates where the topology allows several matching contracts, and (c) key operations whose result depends on which synchronizer's contracts the submitting participant can see. This complements, and will be coordinated with, the multi-synchronizer contract-key work in Digital Asset's approved contract-keys proposal.

**2.5 Soundness boundary.** Each finding will cite the Canton rule it derives from. ROUTE, CCRE-003, CCRE-020 and CCRE-011 findings are deterministic with respect to the supplied topology. CCRE-001 and CCRE-010 will be reported as risks with the conditions under which they manifest. Each check will ship with a false-positive suite of correctly configured topologies on which it must stay silent.

**2.6 Verification against a real network.** Every blocking check will be validated by reproducing the predicted outcome on a two-synchronizer Canton 3.5 LocalNet: CCRE predicts, Canton confirms. The reproductions will be published with the test suite.

### 3. Architectural Alignment

- **RFP 5 (multi-synchronizer):** tooling for the rollout of multi-synchronizer support, usable against multi-sync sandboxes and LocalNet environments (e.g. the proposed Topology Composer, PR #93, which generates topologies CCRE can check).
- **RFP 22 (Daml security):** automated pre-deployment analysis of a defect class that source review does not reveal.
- **RFP 18 / 19 (SDLC, DPM):** DPM component and CI gate; JSON output for dashboards and audit trails.
- **Complements, does not duplicate:** Certora Daml Package Analyzer (what interacts with what — CCRE consumes it); `dpm trace` (inspects prepared, committed and failed transactions on a live participant — CCRE predicts routing statically, before anything is prepared or submitted); DA contract keys (defines key semantics — CCRE checks applications against them).
- Uses only public Canton APIs and published protocol rules. No protocol changes.
- **Coordination with Digital Asset:** Canton's synchronizer router and topology-aware package selection make these decisions at submission time. CCRE applies the published routing rules before submission and adds no runtime component. The check catalogue will be reviewed with the Canton Protocol & Multi-Synchronizer SIG to confirm rule fidelity and avoid overlap with any work in progress at Digital Asset.

### 4. Backward Compatibility

*No backward compatibility impact.* CCRE is read-only: it never submits transactions or modifies topology, packages or node configuration.

---

## Milestones and Deliverables

### Milestone 1: Real Inputs and Routing Checks
- **Estimated Delivery:** 8 weeks from approval
- **Focus:** Remove all hand-written inputs and harden the routing engine on Canton 3.5.
- **Deliverables / Value Metrics:**
  - DAR ingestion (Daml-LF stakeholders, keys, choice bodies) with Certora analyzer JSON integration
  - `ccre topology export` from a live participant via Admin and Ledger APIs
  - ROUTE, CCRE-003, CCRE-020, CCRE-011 on DAR + exported topology
  - Run on Splice DARs and Canton `cn-quickstart`, results published
  - Every blocking check reproduced on a two-synchronizer Canton 3.5 LocalNet

### Milestone 2: Canton 3.5 Contract-Key and Cross-Synchronizer Reference Safety
- **Estimated Delivery:** 6 weeks after M1 acceptance
- **Focus:** Catch silent-misbehavior classes that do not produce a rejection.
- **Deliverables / Value Metrics:**
  - CCRE-001 (non-unique key hazards, including Daml 2.x → 3.5 migration patterns) and CCRE-010
  - False-positive suites for both checks
  - Published guide: "Multi-synchronizer deployment checklist" mapping each CCRE finding to its Canton rule and fix

### Milestone 3: Distribution and Pilots
- **Estimated Delivery:** 8 weeks after M2 acceptance
- **Focus:** Make CCRE a one-command addition to existing pipelines and prove it on external codebases.
- **Deliverables / Value Metrics:**
  - `dpm ccre` DPM component, GitHub Action, npm package
  - At least 2 external teams pilot CCRE on their own DARs or topologies; findings published (anonymized where requested)
  - Onboarding guide and CI integration examples

### Milestone 4: Adoption (paid per team)
- **Window:** Opens at M1 acceptance, when CCRE runs on real DARs and topologies, and closes 9 months after grant approval
- **Focus:** Pay for real usage, not delivery.
- **Deliverables / Value Metrics:**
  - 50,000 CC per qualifying external team, up to 4 teams. A team qualifies when an organization other than the author runs CCRE in CI or as a pre-deployment gate on its own DARs and topology for at least 30 days and confirms continued use on this PR or in the CCRE repository.
  - Until the end of the grant: a compatible release within 4 weeks of each Canton minor release; issues triaged within 1 week.

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- **M1:** CCRE runs on unmodified DARs and a topology exported from a live Canton 3.5 node; for each blocking check, a published LocalNet reproduction shows Canton rejecting the transaction CCRE flagged, and the corresponding false-positive suite passes; results on Splice and `cn-quickstart` are published.
- **M2:** CCRE-001 and CCRE-010 each demonstrated on a concrete scenario and silent on their false-positive suites; checklist guide published.
- **M3:** DPM component, GitHub Action and npm package available; at least 2 external pilots with published findings.
- **M4:** Each payment is released when the committee confirms a qualifying adopting team as defined in Milestone 4.
- Deterministic output across environments; documentation delivered with each milestone.

---

## Funding

**Total Funding Request:** 375,000 CC on delivery (M1–M3) + up to 200,000 CC adoption-linked (M4); maximum 575,000 CC

### Payment Breakdown by Milestone
- Milestone 1 (Real Inputs and Routing Checks): 150,000 CC upon committee acceptance
- Milestone 2 (Contract-Key and Cross-Synchronizer Reference Safety): 90,000 CC upon committee acceptance
- Milestone 3 (Distribution and Pilots): 135,000 CC upon committee acceptance
- Milestone 4 (Adoption): 50,000 CC per qualifying adopting team, up to 200,000 CC, until 9 months after grant approval

### Cost Basis

| Milestone | Effort | CC |
|---|---|---|
| M1 | 8 person-weeks | 150,000 |
| M2 | 6 person-weeks | 90,000 |
| M3 | 8 person-weeks | 135,000 |
| M4 | Onboarding support and maintenance until month 9 | up to 200,000 |

The delivery milestones cover about 22 person-weeks of senior engineering by the author, roughly 41,000 USD at a reference rate of 0.11 USD/CC (CoinGecko, 2026-09-24). The existing MVP (routing dry-run, CCRE-003, 28 tests) is contributed at no cost; all milestone work is net-new. Adoption-linked funding is 35% of the maximum grant.

### Sustainability
- The author maintains CCRE during the grant, funded through Milestone 4, and remains its maintainer afterwards.
- If funding stops, CCRE keeps working: it reads versioned public inputs (Daml-LF, Admin and Ledger API topology data), runs no hosted service, and remains MIT-licensed and open to community contributions.

### Volatility Stipulation
The project duration is greater than 6 months. The grant is denominated in fixed Canton Coin and will require a re-evaluation at the 6-month mark.

---

## Co-Marketing

Upon release, the implementing entity will collaborate with the Foundation on:

- Announcement coordination for each milestone
- Technical blog post: "Will it route? Predicting multi-synchronizer failures before you submit"
- Worked example: Canton Coin ↔ dedicated-synchronizer DvP, from BLOCKED to ROUTABLE
- Talk or workshop for the Canton Protocol & Multi-Synchronizer SIG

---

## Motivation

The 2026–2028 roadmap commits Canton to a Network of Networks: 100+ dedicated synchronizers, 1,000+ applications and 100M+ parties, "many active across multiple synchronizers". Its stated capability goal is that "applications are able to process transactions across multiple synchronizers, as needed by the application". Each new synchronizer multiplies the hosting, vetting and reassignment combinations an application must be correct under, and single-synchronizer tests cover none of them.

Every team that deploys across synchronizers needs this check; today they must do it by hand or discover failures in production. A shared, open-source pre-flight check makes each additional synchronizer cheaper to adopt, which is the adoption lever RFP 5 is designed to pull.

---

## Rationale

**Why static, before submission.** A rejected settlement on a regulated workflow is expensive; a failed CI job is not. The information needed to predict routing — party hosting, synchronizer connections, package vetting and template stakeholders — is all available before submission through public APIs and the DAR.

**Why a separate tool rather than extending an existing one.** The template guidance is to extend what exists, and CCRE does: it consumes the Certora analyzer's output rather than re-parsing cross-package interactions, and ships as a DPM component. The routing analysis itself needs topology as an input, which no existing Daml tool (compiler, linter, package analyzer, trace viewer) takes. Adding it to the compiler would couple deployment configuration to compilation; adding it to a runtime tool would detect failures only after they occur.

**Why TypeScript.** Low-friction installation for CI and frontend-heavy teams. Daml-LF extraction uses a JVM pre-processing step where required, consistent with the Certora analyzer.

**Alternatives considered:** runtime middleware (too late), extending the compiler or linters (no topology input), manual deployment checklists (not repeatable, not enforceable in CI).
