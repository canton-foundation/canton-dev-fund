# BlockSmith for Canton: Self-Service Validator Onboarding and Lifecycle

**Organization:** 57Blocks ([57blocks.com](https://57blocks.com/))  
**Author / Primary Contact:** Diogo Silveira Mendonça \<diogo.silveira@57blocks.com\> · GitHub: [dsm-57b](https://github.com/dsm-57b)  
**Status:** Submitted  
**Created:** 2026-09-15  
**Proposal Type:** RFP-aligned  
**RFP / Roadmap Area:** RFP 7: Expanded Network Access and Validator Onboarding (primary); RFP 23: Validator and Shared Infrastructure Security and Resilience (secondary)  
**Champion:** `Needs Champion`  
**Total Funding Request:** 375,000 CC  
**Project Duration:** 2 months development, then quarterly maintenance  
**Label:** node-deployment-operations

---

## Abstract

BlockSmith for Canton is an operator CLI that takes a self-hosted validator from "I want to join the network" to a healthy node on DevNet, TestNet, or MainNet, and then owns the mutations that follow: upgrade, restore, cleanup, hardening, re-onboarding. Two rules govern every command. Readiness is proven from live evidence, never from operator attestation. Nothing mutates a node until the operator has reviewed a plan and passed its hash back.

The product is the deterministic CLI. No API key, no model, and no assistant are required for any onboarding or day-2 command. `ask` is an optional, read-only complement for operators who want a conversation on top of the same code. It never applies a plan.

BlockSmith composes official Splice artifacts rather than vendoring, forking, or replacing them. This grant covers the Docker Compose path (`validator_compose`); Kubernetes/Helm parity is a named follow-on proposal, and PQS is not touched. Apache 2.0.

This proposal supersedes [#84](https://github.com/canton-foundation/canton-dev-fund/pull/84), narrowed to one module in response to reviewer feedback and the published 2026–2028 RFPs. The request keeps #84's 375,000 CC figure, which at the current Canton Coin price is a materially smaller dollar ask — a smaller grant for a smaller, faster scope.

A working prototype already runs on 57Blocks' own DevNet validator. Two recordings are linked below so reviewers can watch the default CLI path and the optional `ask` path. They are preview evidence, not a milestone claim. The grant pays for opening the tool, finishing the one missing command, and publishing TestNet and MainNet-ready dogfood the rest of the network can replay.

**CLI path (default).** Deterministic commands only: plan, hash, apply, doctor, status, logs. No model and no API key.

[CLI demo (no model)](https://drive.google.com/file/d/14VC3Qf1fWOX_c0mnqJyM8mVfFRlnpB07/view?usp=drive_link)

**Optional `ask` path.** Same node and the same underlying commands, driven as a conversation. The assistant is read-only; the operator still runs every mutation.

[`ask` demo (optional assistant)](https://drive.google.com/file/d/1zXbm5MpGM-nvaCeJl_24kbi-4uEXSwPR/view?usp=drive_link)



---

## Specification

### 1. Objective

An operator can onboard a validator to a live Canton network, verify its readiness from evidence, and perform every subsequent lifecycle mutation through a reviewable plan — without a support channel, a committee thread, a pile of ad-hoc scripts, or an AI provider.

Self-service onboarding and capacity assessment answer RFP 7. Reviewable day-2 mutations answer RFP 23. The assistant is optional and is not a second objective.

### 2. Implementation Mechanics

Three installables, one workspace: `blocksmith-canton` (operator CLI, laptop or node), `blocksmith-mcp` (stdio server on the validator, short reviewable dependency list), `blocksmith-core` (shared library). Secrets never reach git, diagnostics output, or the model. Redaction is applied before anything leaves the node.

**Self-service onboarding (RFP 7).**

- `init` creates a workspace: environment, deployment shape, sizing and dependency checks. State survives the multi-week ceremony; the operator closes the laptop and resumes.
- `onboard notify` generates the Foundation form payloads. `onboard quorum` proves allowlist membership from live evidence: 2/3 unique Scan HTTP and sequencer `SERVING` answers, measured from the notified egress IP. Bookkeeping never gates a probe, and a failing probe demotes stale evidence so a later step cannot run on it.
- `up --plan` inspects the official Splice bundle and ceremony state and prints a numbered plan with its hash — including the literal shell recipe for operators who prefer to run every command by hand. `up --apply` requires the reviewed hash.

**Reviewable day-2 mutations (RFP 23).**

- `upgrade` plans a version-agnostic upgrade against the official release asset and its published SHA-256 digest, budgets backup and disk, takes a cold database volume archive as an exact rollback point, and requires ledger progress after start. `upgrade-restore` returns to that archive.
- `reclaim` frees disk by removing leftover images, leftover containers, and leftover BlockSmith operation directories — never the running version, never the live project, never the newest reset or upgrade rollback.
- `harden`, `reset`/`reset-restore`, and `reonboard` (recovery of a `MemberDisabled` identity) follow the same plan/hash/apply contract.
- `doctor`, `status`, `logs --why`, and `collect-diagnostics` are read-only. `doctor` reads ledger progress from the participant store: `readyz=200` without recent sequenced events is reported as up but not on the network.

**Capacity assessment (RFP 7).**

- `scale --plan` reads disk, memory, and active-contract-set growth (including per-package growth) and emits a sizing recommendation as a reviewable plan. Assessment only; no unattended writes.

**Assistant, optional and strictly read-only.**

- `ask` is not the product and is not required to use the product. It answers operator questions over a small MCP server started on the validator via the operator's existing SSH session. No new port, no daemon, no LLM on the validator, and it never applies a plan. Every deterministic command works identically without it. The default invocation of the CLI will be the command list and help — not the assistant.

We validate against 57Blocks' own validator across DevNet, TestNet, and a MainNet-ready configuration, and publish recordings and logs so reviewers evaluate a working flow, not a sketch.

What already runs on 57Blocks' DevNet validator: ceremony, evidence-based readiness, hash-gated `up`, day-2 `upgrade` / `reclaim` / `harden` / `reset` / `reonboard`, read-only diagnostics, and optional `ask`.

What this grant still pays for: the public Apache 2.0 repository and runbooks; a CLI-first default; `scale --plan`; `upgrade-restore --plan --show-commands`; TestNet and MainNet-ready dogfood with published evidence; and a documented 12-month maintenance window.

Named as candidate follow-on proposals: Kubernetes/Helm parity, policy-gated remediation, and fleet tooling. Non-goals at any stage: no health-threshold catalogue or dashboards, no operations web console, no DAR vetting or package management, no wallet or party management, and BlockSmith never holds cloud credentials.

### 3. Architectural Alignment

- Composes official Splice artifacts; no protocol, Splice, or node changes required.
- Evidence over attestation matches the roadmap's zero-trust posture: the tool never asks the operator to assert what it can probe.
- Plan-before-mutate with `--show-commands` keeps the operator, not the tool, in control of a production validator — including operators who choose to copy the commands and never run `--apply` at all.
- The default path has no model dependency. `ask` is an optional laptop-side client over a short-lived stdio MCP process. The validator-side component is started by SSH and gone when the session ends. No new port, no TLS certificate, no daemon.

### 4. Backward Compatibility

No backward compatibility impact.

BlockSmith composes the official `validator_compose` bundle. It does not vendor, fork, or replace Splice, Canton, PQS, or Helm. Existing nodes keep their current start path; operators adopt the CLI when they choose.

---

## Milestones and Deliverables

The prototype already exists. An 8-week clock is the remaining public-good work, not a from-scratch build. Foundation-paced waits (form review, network acceptance) do not gate milestone acceptance; they are reported as they occur.

### Milestone 1: Public CLI and DevNet evidence

- **Estimated Delivery:** Weeks 1–2
- **Focus:** Open the tool and publish a DevNet path that can be replayed without a model.
- **Deliverables / Value Metrics:**
  - Public Apache 2.0 repository with contribution guidelines and operator runbooks
  - CLI-first default (`blocksmith-canton` is help and subcommands; `ask` is opt-in)
  - DevNet bring-up completed on 57Blocks' validator through the published CLI and runbooks, with no model
  - Published DevNet bring-up pack: recordings, plans, and logs another operator can follow

### Milestone 2: Lifecycle, capacity, TestNet

- **Estimated Delivery:** Weeks 3–6
- **Focus:** Finish the missing assessment command and publish repeatable day-2 evidence, including TestNet.
- **Deliverables / Value Metrics:**
  - `scale --plan` sizing assessment from live disk, memory, and ACS growth
  - `upgrade-restore --plan --show-commands`
  - Published evidence of `upgrade` / `upgrade-restore`, `reset` / `reset-restore`, `reclaim`, `harden`, and `reonboard` on 57Blocks' validator
  - TestNet promotion completed through the tool, with published evidence another operator can follow

### Milestone 3: MainNet-ready dogfood

- **Estimated Delivery:** Weeks 7–8
- **Focus:** Publish a full-lifecycle evidence pack on a MainNet-ready configuration.
- **Deliverables / Value Metrics:**
  - Ceremony, bring-up, one upgrade-and-restore cycle, reclaim, harden, and the sizing assessment run on 57Blocks' validator in a MainNet-ready configuration
  - Recordings, plans, and logs published so any reviewer or operator can replay the lifecycle without `ask`
  - Documented maintenance plan; quarterly maintenance follows

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone
- Demonstrated functionality or operational readiness
- Documentation and knowledge transfer provided
- Alignment with stated value metrics

Dogfood on 57Blocks' validator is how we prove each command. The published repository, runbooks, and evidence packs are what other operators can use; one operator has already expressed interest in the published path.

- **Milestone 1:** The repository is public under Apache 2.0. 57Blocks' DevNet validator is healthy (API responsive, ledger advancing, quorum proven) through the published CLI and runbooks, with no model. Bring-up recordings and logs are in that repository so other operators can replay the flow.
- **Milestone 2:** Published evidence from 57Blocks' validator: one full upgrade with verified artifacts and a demonstrated restore from the cold archive; one `reclaim` and one `harden` through the plan/hash gate; `scale --plan` produces a sizing recommendation from live disk, memory, and ACS growth. Restore is inspectable with `--plan --show-commands` before `--apply`. TestNet promotion completed through the tool.
- **Milestone 3:** The full grant command set has been run on 57Blocks' live validator — not a sandbox — and the recordings, plans, and logs are published so any reviewer or operator can replay the lifecycle without `ask`. The maintenance plan is public.

---

## Funding

**Total Funding Request:** 375,000 CC

### Payment Breakdown by Milestone

- Milestone 1 _(Public CLI and DevNet evidence)_: 100,000 CC upon committee acceptance
- Milestone 2 _(Lifecycle, capacity, TestNet)_: 175,000 CC upon committee acceptance
- Milestone 3 _(MainNet-ready dogfood)_: 100,000 CC upon final release and acceptance

This keeps #84's CC figure while the scope narrowed. At the ~$0.10 30-day average at submission it represents roughly $37,500 — versus roughly $60,000 at the $0.16 anchor when #84 was filed. We consider that the right shape for this RFP area: a focused module, a smaller grant, and results in weeks rather than quarters, with each milestone independently verifiable before the next is funded.

57Blocks funds continued quarterly maintenance windows for 12 months after Milestone 3 within this request.

### Volatility Stipulation

The project duration is under 6 months. Should the project timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility.

---

## Co-Marketing

Upon release, 57Blocks will collaborate with the Foundation on:

- Announcement coordination
- A technical write-up or case study of the self-service DevNet / TestNet / MainNet-ready path
- Developer or ecosystem promotion of the public CLI and runbooks

---

## Motivation

The roadmap targets 10,000 validators and operators who "can self-onboard to the network, merely requiring a traffic purchase." Today onboarding is a multi-week ceremony: a Foundation notification form, an IP allowlist, sponsor super-validator selection, two quorum-acceptance waits, and a first bring-up whose failures only tribal knowledge explains. There is no shared tool that holds state across the wait, proves network acceptance from evidence, or makes the first start reviewable before it runs.

The same gap continues into day 2. A validator that returns `readyz=200` can still be off the network. An upgrade can fail on disk that leftover images consumed. A node offline too long comes back `MemberDisabled` with no tooling path back. Each of these is documented somewhere; none of them is executable.

RFP 7 asks for "self-service onboarding tooling," "automated readiness checks," and "capacity monitoring" that "reduce or eliminate Foundation and committee coordination of network access." It lists no prior grants, and no open proposal responds to it. Every self-hosted Compose validator is the beneficiary: the same ceremony and the same day-2 mutations.

---

## Rationale

This is an operator CLI that composes official Splice artifacts. The default approach is to extend what exists: `validator_compose`, published release SHA-256s, and the current onboarding ceremony. BlockSmith does not replace those components.

More than one implementation for validator operations is healthy for the network: it adds competition and avoids tying 10,000 validators to a single tool vendor that could exit, stall, or change terms. RFP 23 itself anticipates "approving multiple grants in this area as work progresses," and asks that proposals complement rather than duplicate existing work.

| Work | Relationship |
| :--- | :--- |
| Official Splice artifacts: `validator_compose`, Helm charts, PQS ([#67](https://github.com/canton-foundation/canton-dev-fund/pull/67)) | Never vendored. This grant composes the Compose bundle, generating overlays and pointers against it. The Helm charts become relevant only in the Kubernetes follow-on; PQS is not deployed or operated by this grant. |
| Canton Validator Reliability Suite ([#747](https://github.com/canton-foundation/canton-dev-fund/pull/747), [#748](https://github.com/canton-foundation/canton-dev-fund/pull/748), [#749](https://github.com/canton-foundation/canton-dev-fund/pull/749)) | Complementary halves. The suite assesses read-only and by design "writes nothing." BlockSmith is the reviewable path that onboards and changes the node. An operator can run the suite to find a finding and BlockSmith to act on it. We ship no competing check catalogue, thresholds, or dashboards. |
| Hacken Canton Monitor ([#302](https://github.com/canton-foundation/canton-dev-fund/pull/302), accepted) | Party-risk monitoring. No overlap; we do not define health metrics. |
| DevKit ([#18](https://github.com/canton-foundation/canton-dev-fund/pull/18)), Denex ([#318](https://github.com/canton-foundation/canton-dev-fund/pull/318)), dAppBooster ([#390](https://github.com/canton-foundation/canton-dev-fund/pull/390)) | Developer onboarding to LocalNet. BlockSmith onboards a validator operator to a live network. Different persona, no overlap. |
| Canton CRO ([#573](https://github.com/canton-foundation/canton-dev-fund/pull/573)), CantonVet ([#746](https://github.com/canton-foundation/canton-dev-fund/pull/746)) | Party replication and DAR vetting are out of our scope by design. |
| Bare Metal Toolkit ([#462](https://github.com/canton-foundation/canton-dev-fund/pull/462)) | Bare-metal systemd path. BlockSmith covers the containerized path. Complementary deployment shapes. |

**Why narrower than #84.** That filing described a full operator platform. Reviewers asked for a concrete product and a clear difference from existing work. Since then the Foundation published the RFPs, which fund focused modules, and adjacent slices we had listed — dashboards, health ranges, configuration assessment, PQS operation — are now accepted or champion-confirmed elsewhere. This filing keeps the original ask and concentrates it on the lane that is still open.

57Blocks is a 300-engineer firm focused on Web3 infrastructure. We operate our own Canton validator and built this tool against our own DevNet bring-up — every failure mode in this proposal is one we hit ourselves. BlockSmith is 57Blocks' toolchain brand: [blocksmith.co](https://www.blocksmith.co/) is the same one-workflow idea for Stellar Soroban developers; this proposal is its Canton edition, for validator operators. Deliverables, code, and documentation are produced and reviewed by our human engineering team, with AI-assisted development used as standard practice under the repository's AI policy.
