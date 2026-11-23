# Canton Node Operator: Automatically update a Canton deployment

## Development Fund Proposal

**Organization:** [Upflam](https://upflam.com)
**Author / Primary Contact:** Vinh <v@upflam.com>, [github.com/v9n](https://github.com/v9n)
**Status:** Submitted
**Created:** 2026-11-22
**Proposal Type:** RFP-aligned
**RFP / Roadmap Area:**


- RFP #6: Continuous Resilience & Scaling Improvements on the Global Synchronizer ("operate without downtime, with minimal oversight and intervention ... ever-more streamlined upgrades")
- RFP #7: Expanded Network Access and Validator Onboarding

**Champion:** Alexei Dulub, @PixelPlex

**Total Funding Request:** 3,500,000 CC

**Project Duration:** 6 months

**Label:** node-deployment-operations

**Code repository:** [github.com/upflam/canton-operator](https://github.com/upflam/canton-operator)


---

## Abstract

Splice releases a new version about once a week, and validators are expected to keep up. Falling behind has hard consequences:

- **Logical Synchronizer Upgrades (LSU).** When the network moves to a new synchronizer, a validator on an old version will not recognize the LSU announcement and will not follow the new synchronizer. The previous synchronizer is only kept for a limited time. After that, the validator cannot complete the LSU even if the operator upgrades it.
- **Daml model upgrades.** When a Daml model used by the network is upgraded, a validator on an old version does not have the new package version vetted, so it cannot take part in transactions that use it.

In both cases the validator stops working until the operator notices and fixes it by hand.

Canton Node Operator is an open-source agent that runs next to a validator and upgrades it when the network upgrades. Each Super Validator publishes the version it runs on its `/info` endpoint. When at least two-thirds of SVs run the same version, the agent uses that as the target. It reads the release notes for that version, and if nothing needs the operator's attention, it upgrades the validator during the operator's maintenance window. It keeps the operator's existing configuration (auth, TLS, external database, KMS, volumes). After a successful upgrade, it posts the new version and a link to the release notes to the operator's Slack channel. If a release needs manual steps, such as adding a new environment variable, the agent does not upgrade right away. It reports this to the Slack channel so the operator can make the change and approve the upgrade. If no one approves within 48 hours, the agent applies the upgrade anyway in the next maintenance window, so the validator does not fall behind.

**Current status: prototype.** We have a Docker based prototype ([github.com/upflam/canton-operator](https://github.com/upflam/canton-operator)) that runs the full cycle on a DevNet validator: read SV versions, check release notes, pull images, recreate containers, check health. We hope to make this prototype production ready, support the Kubernetes deployment, and get adoption with this grant.

The project is open source under Apache-2.0. It delivers:

1. **A production-ready agent for Docker Compose validators**, the most common setup for smaller operators.
2. **A Kubernetes operator** for institutional and node-as-a-service operators who deploy Splice through the official Helm charts.
3. **Ecosystem adoption**, paid per independent organization that runs the agent or operator on MainNet.

Milestones 1 and 2 deliver the product. Milestone 3 pays per verified external adopter.

---

## Specification

### 1. Objective

**Objective: make node upgrades easier and more autonomous, so node operators have fewer outages.**

Keeping a validator current is a recurring job on a weekly cadence. Each Splice release means checking the release notes for required action, pulling new images or charts, upgrading components in the right order and checking that the node came back healthy.

Teams without automation can easily fall behind. Teams with automation still have to watch for the release announcement on Slack or the [SV calendar](https://sv-cal.canton.foundation/), then kick off their CI pipeline. Either way, someone has to notice each release, review it, and act on it.

This shows on the network today:

- **MainNet validators run a wide spread of versions.** At the time of writing, [Lighthouse](https://lighthouse.cantonloop.com/validators) shows MainNet validators on every version from 0.9.4 to 0.10.3.
- **Lagging nodes need hands-on recovery.** The Validator Operations channel has had several cases of validators that fell behind, missed an upgrade, and needed help from the Digital Asset team to recover.

Falling behind is no longer just running old software. A validator that is not on a compatible version when the network moves to a new synchronizer stops receiving events. If it is not upgraded before the previous synchronizer is retired, it cannot complete the LSU at all. A validator that misses a Daml model upgrade does not have the new package version vetted and cannot take part in transactions that use it.

This proposal makes that job autonomous. A validator running this agent upgrades whenever the SVs upgrade, inside the operator's maintenance window they choose. The operator only steps in when a release actually needs their action, and the agent tells them when that is.

Expected outcomes:

- Validators running the agent track SV consensus to detect the version that the network should follow.
- Agent-managed validators get through LSUs with no manual upgrade step.
- Both deployment methods Splice documents, Docker Compose and Kubernetes/Helm, are supported.

### 2. Implementation Mechanics

#### The update cycle

```text
one cycle
  poll SV /info  ──►  < 2/3 agree ............... do nothing
                      outside rollout window .... defer
                      classifier says alert ..... alert (Slack, Approve button)
                      otherwise ................. apply via engine
                                                  (participant → validator → rest)
                                                  → health-check → notify
```

The classifier run an openweight Laya model, using only CPU to detect whether an update require manual action from operator, such as adding a new env var or config.

#### Components

The table below describes the target design. The prototype already implements a first version of each layer for Docker; the `rollout/kube` engine and controller (section B) do not exist yet. Everything in sections A–C is new work funded by this grant.

| Layer | Responsibility |
| --- | --- |
| `release` | Discovers the SV set from one seed scan (`<seed>/api/scan/v0/scans`, `scan.` → `info.`), polls each SV's `/info`, and returns a target only when **≥ 2/3** report the same `deploymentInfo.sv.version`. If too few respond or they disagree, it does nothing. |
| `classify` | With `UPDATE_MODE=ai`, the Laya decision model (Python sidecar), LoRA-trained on past Splice release notes, reads the official release notes and answers one question: *does the operator need to act before this upgrade?* A deterministic safety-net rule catches clear must-act signals (removed config key, new required env var, documented boot workaround). The rule can only escalate auto → alert, never the reverse. If the model fails or is uncertain, the result is alert. Verdicts are cached per version. With `UPDATE_MODE=always`, every consensus version is applied. |
| `rollout` | Engine interface (`Managed`, `NeedsUpdate`, `Apply`, `Kind`) with one implementation per runtime: Docker and Kubernetes. The runner stays the same. |
| `window` | Daily rollout window (`HH:MM-HH:MM`, IANA timezone, may cross midnight). |
| `notify` / `slack` | Slack notifications for successful upgrades and for releases that need manual steps (see Notifications below). Socket Mode **Approve** button, so no inbound port is needed. |
| `agent` | Engine-agnostic runner. Order is participant → validator-app → UIs / wallet-gateway / portfolio. Waits for each component's health check before moving on. Stops and alerts on failure. No automatic rollback, by design. |

#### Notifications

The agent reports every outcome to the operator's Slack channel:

- **Upgrade succeeded.** A message with the new version and a link to its release notes, so the operator knows what changed without checking the node.
- **Manual steps needed.** When the release notes call for operator action, such as a new required environment variable or a removed config key, the agent does not upgrade. It posts the version, what the notes ask for, and a link to the release notes. The operator makes the change and clicks **Approve** (or runs the equivalent CLI command) to upgrade right away. If no one approves within 48 hours, the agent applies the upgrade on the next cycle inside the rollout window. The message says this up front, so operators know the deadline. This keeps a missed alert from leaving the validator behind before an LSU.
- **Upgrade failed.** The cycle stops at the failing component and the agent posts which component failed and why. There is no automatic rollback.

The agent follow minimal configuration approach, only thing that really require is the Slack Token, almost all other config is automatically discovered through the validator config itself.


#### A. Docker engine and MainNet hardening

- The Docker engine uses the Docker API, not the CLI. It recreates containers from their inspected configuration and changes only the image. A local `:auto` tag keeps `docker compose up` and host reboots from silently downgrading the validator. Images are published to GHCR, and the agent can update itself through the same mechanism.
- **Supply-chain hardening:** signed release images ([cosign](https://docs.docker.com/dhi/explore/security-concepts/signatures/)), an [SBOM](https://docs.snyk.io/developer-tools/snyk-cli/commands/sbom) per release, digest-pinned install docs, and reproducible builds in CI.
- **Least privilege:** a Docker socket-proxy with a minimal API allowlist as the default deployment, so the agent runs as nonroot instead of with raw socket access.
- **Reliability hardening:** timeouts and retries on every network and registry call, idempotent and resumable cycles (a restart in the middle of an upgrade continues safely), clear detection and warnings for unsupported setups, and structured logs suitable for existing log pipelines.
- **Test coverage:** unit tests for consensus, ordering, classification and rollout windows; integration tests against a real Docker engine; and continuous runs on DevNet/TestNet validators across real Splice releases.
- **Classifier training:** we LoRA-train the Laya model on the history of Splice release notes, labelled by whether each release needed operator action. As new releases come out, they are labelled and added, and the model is retrained.
- **Classifier evaluation:** a published evaluation set built from real Splice release notes, with the results of every model update reported. Any regression in alert recall (a release that needs operator action being labelled auto) blocks the release.

#### B. Kubernetes operator

Splice validators on Kubernetes are deployed as per-component OCI Helm charts (`splice-participant`, `splice-validator`, and the UI charts). The chart `--version` is the same string as the Docker `IMAGE_TAG`, so the consensus and classifier layers work unchanged. Only a new `rollout.Engine` and a controller are needed.

- **`rollout/kube` engine** using the Helm Go SDK: discover managed releases by chart name, run `upgrade --version <target> --reuse-values` in dependency order (participant → validator → UIs), and wait for the Deployment/StatefulSet rollout and `readyz` before continuing. User values are never rewritten.
- **Controller mode** (controller-runtime): a `ValidatorUpdatePolicy` CRD declares namespace/release selectors, mode (`ai` | `always`), rollout window, and alert sinks. Its status reports the current version, consensus target, last decision, and last result, so `kubectl get validatorupdatepolicy` shows the fleet state.
- **Multi-validator / multi-tenant.** One controller can manage many validator namespaces, each with its own version and policy. This is what node-as-a-service providers that host many validators need.
- Least-privilege RBAC scoped to the managed namespaces, a Helm chart for the operator itself, and Kind-based e2e tests in CI against the official Splice charts.

#### C. Adoption program

- Hands-on onboarding for validator operators: install guides for Docker and Kubernetes, a short install video, monthly office hours, and direct help for operators who ask for upgrade help in public channels.
- Partnerships with node-as-a-service and hosting providers to make the agent part of their deployments.
- **Opt-in** install registry: operators can register their validator party hint so adoption can be counted. There is no telemetry by default.

### 3. Architectural Alignment

- **RFP 06 (Continuous Resilience).** The Global Synchronizer can only run LSUs on a fixed calendar if validators keep up. Every validator stranded on a predecessor synchronizer costs operator downtime and Foundation/DA support time. This work automates the validator side of "ever-more streamlined upgrades" and complements [Logical Synchronizer Upgrades](../../proposals/2026-03-DA-Logical-Synchronizer-Upgrades.md).
- **RFP 07 (Validator Onboarding).** The roadmap targets 10,000+ validators with self-service onboarding. Manual weekly upgrades do not scale to that, for operators or for the support channel.
- **Decentralization.** The version source is SV consensus, not Upflam and not any single party. If Upflam disappeared, every installed agent would keep working. The classifier runs locally, and release notes come from the official source.
- **No protocol or Splice changes.** The agent uses only public interfaces: SV `/info`, Scan, release notes, and the Docker/Helm APIs.

### 4. Backward Compatibility

*No backward compatibility impact.* The agent is opt-in and runs beside an unmodified validator. On Docker, the only change for the operator is switching the image tag to `:auto` once. On Kubernetes, existing Helm releases and values are kept. Uninstalling the agent leaves the validator exactly as it was last deployed.

---

## Milestones and Deliverables

The project is divided into three milestones. Milestone 1 delivers the Docker agent, Milestone 2 delivers the Kubernetes operator, and Milestone 3 pays per verified independent organization that adopts either one. Dates are measured from grant approval and include one week for Committee review. Once the grant is approved, absolute dates will be added next to each committed date.

### Milestone 1: Docker Agent Production Release

- **Committed Date:** Month 2 after approval
- **Focus:** Turn the Docker prototype into a production-ready, public Apache-2.0 release for Docker Compose validators, hardened for MainNet.
- **Deliverables / Value Metrics:**
  - Public repository and published images: SV-consensus version resolver with seed-scan discovery, release-note classifier sidecar with safety-net rules, Docker rollout engine with `:auto` drift protection, rollout windows, Slack notifications with the Approve button, and self-update.
  - Supply-chain and least-privilege defaults: signed images (cosign), an SBOM per release, digest-pinned install docs, and a [socket-proxy](https://github.com/tecnativa/docker-socket-proxy) deployment so the agent runs as nonroot.
  - Reliability hardening: timeouts and retries, idempotent and resumable cycles, unsupported-setup detection, structured logs.
  - The Laya LoRA training pipeline and labelled release-note dataset, and a published classifier evaluation set built from real Splice release notes, with results reported for every model update.
  - Unit and Docker integration tests in CI, plus continuous runs on Upflam DevNet/TestNet validators across real Splice releases.
  - Docker install guide, DevNet/TestNet/MainNet runbook, and the opt-in install registry.

### Milestone 2: Kubernetes Operator Release

- **Committed Date:** Month 4 after approval
- **Focus:** Helm-SDK rollout engine and `ValidatorUpdatePolicy` controller for validators deployed from the official Splice Helm charts, including multi-namespace support for hosting providers.
- **Deliverables / Value Metrics:**
  - `rollout/kube` engine (Helm Go SDK, `--reuse-values`, ordered upgrades, rollout and `readyz` waits) and controller-mode operator with the `ValidatorUpdatePolicy` CRD and status reporting.
  - Multi-namespace / multi-tenant management from one controller.
  - Least-privilege RBAC, a Helm chart for the operator itself, and signed images with SBOM.
  - Kind-based e2e CI against the official Splice Helm charts across real Splice releases.
  - Kubernetes install guide and operator runbook.

### Milestone 3: Ecosystem Adoption

- **Committed Date:** As each organization is verified, from Milestone 1 acceptance until Month 6 after approval
- **Focus:** Get independent validator operators and hosting providers running the agent or operator on MainNet.
- **Deliverables / Value Metrics:**
  - Up to five independent organizations run the Docker agent or Kubernetes operator on their MainNet validators, evidenced as defined in the Acceptance Criteria.
  - Each verified organization releases one Milestone 3 payment (see Funding). Payments are independent of each other and of Milestone 2 acceptance.
  - Supporting program: install video, monthly office hours, onboarding sessions with the Validator Operations community, and outreach to hosting / node-as-a-service providers.
  - A public report covering every upgrade and LSU the agent handled for adopting organizations, published with the final Milestone 3 claim.

### Maintenance

After Milestone 2, Upflam commits to 12 months of maintenance: a compatible release within one week of each Splice release that changes image layout, chart names, the `/info` format or the release-note format, plus security and dependency updates, issue triage and outside contributions. Upflam publishes a short maintenance note each quarter. The repository is offered for transfer to the Foundation's GitHub organization at release, so the agent does not depend on Upflam to keep working. Maintenance is not separately funded by this grant.

---

## Acceptance Criteria

The Tech & Ops Committee will assess each milestone against its listed deliverables and the criteria below. Each submission includes the release tag, documentation, and reproducible evidence such as CI runs, logs, a registry export or a live demonstration.

### Milestone 1

- A clean install from the published docs on a DevNet or TestNet validator follows SV consensus through at least one Splice release with no manual step, in order (participant → validator → UIs).
- The agent does nothing when fewer than 2/3 of SVs agree, and defers outside the rollout window.
- A release that needs operator action is held back and alerted, demonstrated with a real past Splice release from the evaluation set.
- A forced failure (e.g. a failing health check) stops the cycle and sends an alert. A restart in the middle of an upgrade resumes safely.
- Released images verify against their cosign signatures, and an SBOM is published.
- An agent-managed validator gets through at least one LSU on TestNet or DevNet with no manual intervention.

### Milestone 2

- Kind-based e2e CI upgrades a validator deployed from the official Splice Helm charts across at least one real Splice release, in order, without changing user values.
- One controller manages at least two validator namespaces with different policies, and `kubectl get validatorupdatepolicy` shows current version, consensus target, last decision and last result for each.
- The operator runs under the documented least-privilege RBAC scoped to the managed namespaces.
- A Kubernetes-hosted validator on TestNet or DevNet follows SV consensus through at least one Splice release with no manual step.

### Milestone 3

An organization qualifies when all of the following hold:

- It is a company or team independent of Upflam.
- It runs the Docker agent or Kubernetes operator in a managed mode (`ai` or `always`) on at least one of its own MainNet validators.
- The agent or operator has applied at least one Splice release on MainNet for that organization, shown in the opt-in install registry (party hint, version history, agent version). For company that is privacy sensitive and opt-out of telemetry, Upflam will ask them confirm in a Github comment or a Slack message with the Canton foundation.
- None of its agent-managed validators was stranded on a predecessor synchronizer because the agent let it fall behind. Failures caused by operator-side infrastructure outside the agent's control are reported but do not disqualify.
- It gives written confirmation identifying the validator(s) and that the agent performed the upgrade. This is sufficient evidence alongside the registry record.

A hosting or node-as-a-service provider counts as one organization, however many validators it hosts. Each qualifying organization triggers one Milestone 3 payment, up to five.

### Review and Scope

- Supported Splice versions and test configurations will be agreed with the Committee at the start of delivery. Material scope changes require agreement on the corresponding schedule and funding.
- Review feedback should identify the unmet deliverable or acceptance criterion. A consolidated response is requested within 15 business days of each milestone submission.
- Defects that prevent the required workflows from working must be fixed before acceptance. Minor issues that do not prevent those workflows may be recorded with an agreed correction plan.
- If no LSU takes place on TestNet or DevNet during a milestone period, or external factors (network availability, upstream Splice changes) block a required demonstration, Upflam will document the blocker and agree an alternative validation method or revised schedule with the Committee.
- Milestones 1 and 2 can be accepted independently of Milestone 3. If adoption evidence needs more time than Month 6, an extension may be agreed; each Milestone 3 payment remains conditional on a verified organization.
- Code is public under Apache-2.0 with signed releases.

---

## Funding

**Total Funding Request:** 3,500,000 CC

### Payment Breakdown by Milestone

| Milestone | Committed Date | Payment | Payment Trigger |
| --- | --- | --- | --- |
| Milestone 1: Docker Agent Production Release | Month 2 | 875,000 CC | Committee acceptance of Milestone 1 deliverables and criteria |
| Milestone 2: Kubernetes Operator Release | Month 4 | 875,000 CC | Committee acceptance of Milestone 2 deliverables and criteria |
| Milestone 3: Ecosystem Adoption | From Milestone 1 acceptance, as verified, until Month 6 | 1,750,000 CC | 350,000 CC per verified independent organization; maximum of 1,750,000 CC or five organizations |
| **Total** | **6 months** | **3,500,000 CC** | |

50% of the grant (1,750,000 CC) is Milestone 3, paid per organization as each adoption is accepted. Completing the technical work or running the onboarding program alone does not trigger Milestone 3 payments. The other 50% is split equally between the Docker agent and the Kubernetes operator.

Payments for accepted Milestones 1 and 2 are not conditional on Milestone 3. Milestone 3 payments do not require all five organizations at once: each verified organization releases 350,000 CC until the 1,750,000 CC cap.

### Volatility Stipulation

The grant is denominated in a fixed total of 3,500,000 CC for the agreed scope. If an agreed extension beyond the committed dates results from Committee-requested scope changes or documented delays outside Upflam's reasonable control, Upflam and the Committee will review the remaining milestone amounts in light of significant USD/CC price movements.

Any adjustment to funding, scope or schedule requires written agreement. Previously accepted milestones and their agreed payments will not be repriced, and an extension does not remove the per-organization evidence requirement for remaining Milestone 3 payments.

---

## Co-Marketing

Upon release, Upflam will collaborate with the Foundation on:

- Announcement coordination for the Docker agent release (M1) and the Kubernetes operator (M2).
- A technical blog post: *"Never miss an LSU: weekly upgrades on autopilot."*
- Listing in the validator operator docs and onboarding material as a recommended upgrade tool.
- Joint sessions with the Validator Operations community and hosting providers.
- A case study with one of the adopting organizations.

---

## Motivation

**The upgrade cadence is not going to slow down, and upgrades are now cliff-edged.** Before LSU, a lagging validator kept working in a degraded way. After an LSU, a validator that cannot speak the successor protocol version simply stops. Every miss today means:

- **Operator downtime and lost rewards** while the node is stranded.
- **Foundation and DA support load.** Each missed upgrade turns into a support request and a custom recovery walk-through.
- **Erosion of trust in Canton as institutional infrastructure.** Validators are the network's edge, and a validator that silently stalls is a bad first impression for new operators.

Today the standard answer is "follow the calendar and upgrade every week." That works for operators with dedicated SRE teams, and it fails for the long tail. The roadmap expects most growth to come from that long tail: 10,000+ validators and self-service onboarding.

**Who benefits:** every validator operator. Docker Compose and Helm are the two deployment methods Splice documents, so between the Docker engine and the Kubernetes operator, the work covers essentially all validators. Long-tail Docker operators gain the most from automatic weekly upgrades. Institutional and hosting operators on Kubernetes gain the most from fleet-wide policy and status. The Foundation and DA gain fewer stranded-node support cases on every LSU.

---

## Rationale

**Why SV consensus as the version source.** The network already says which version is current: the version ≥ 2/3 of Super Validators are running. Following it means there is no new trusted party and no release server to compromise or keep online, and the agent's idea of "current" is by construction the network's. SVs upgrade ahead of validators and ahead of LSU deadlines. As long as the SVs upgrade, validators running the agent follow within their maintenance window.

**Why a classifier plus deterministic rules, and why it can only say "wait".** Most Splice releases need no operator action. The rare ones that do (a new required env var, a removed config key) are hard to catch with rules alone. The model can only move a decision from auto to alert, never the reverse, and any error or uncertainty means alert. An alert gives the operator 48 hours to act before the agent upgrades anyway. That is long enough to add a config change, and short enough that the validator does not miss an LSU. Operators who want none of this set `UPDATE_MODE=always`.

**Why no automatic rollback.** Splice releases run database migrations. Rolling a participant back onto a database a newer version has already migrated can corrupt it. The safe action after a failure is to stop and alert, which is what the agent does.

**Why extend rather than replace.** The agent does not replace the Splice Docker Compose bundle or Helm charts, and it does not ask operators to adopt a new deployment tool or CLI. It drives the official artifacts through their own APIs (Docker API, Helm SDK) and keeps every operator-specific setting. Kubernetes support is a second implementation of the same rollout interface, not a separate tool.

**Alternatives considered.**

- *Generic image updaters (Watchtower, Renovate, Argo CD Image Updater):* they follow registry tags, not network consensus, so they would upgrade on publish rather than when the network moves. They do not understand component ordering or release-note gating.
- *Documentation and reminders only:* validators still fall behind despite a published operations calendar. Reminders do not upgrade nodes.
- *A hosted, centrally managed update service:* it adds a central trust point and a single point of failure, which runs against the network's decentralization goals.

**Why Upflam.** We operate Canton validators ourselves. We built a [prototype of the agent](https://github.com/upflam/canton-operator) and ran it against a real DevNet validator with live SV consensus, from consensus through pull, recreate and health check, including the no-consensus, classifier-alert and failure paths. A first version of the release-note classifier has been tried on real Splice release notes. The prototype de-risks the design; it is not yet production-ready, and making it so is the bulk of Milestone 1.

---

## Constraints, Limitations and Out of Scope

- **No automatic rollback.** After a failed upgrade the agent stops and alerts (see Rationale).
- **Unsupported setups are detected, not fixed.** Heavily customized deployments (registry-pinned tags, `pull_policy: always`, non-standard container names, forked charts) are reported as unsupported rather than upgraded.
- **Not a recovery tool.** The agent keeps validators current so they do not miss an LSU. It does not perform late-LSU repair (`participant.repair.perform_late_lsu`) for a validator that is already stranded.
- **Not a version authority.** If the SVs do not reach 2/3 agreement, the agent does nothing. It never picks a version on its own.
- **The classifier is advisory and conservative.** It can only hold back an upgrade, for up to 48 hours or until the operator approves. It does not replace reading the release notes for operators who run `UPDATE_MODE=always`.
- **Out of scope:** SV node upgrades, non-Splice deployment methods (bare-metal, Nomad, custom orchestrators), and hosted or managed upgrade services.

---

## Team Experience

Upflam operates Canton validators and builds infrastructure tooling for the Canton ecosystem. We built the Canton Node Operator prototype described above, and we run DevNet and TestNet validators that will be used for continuous testing throughout the grant.
