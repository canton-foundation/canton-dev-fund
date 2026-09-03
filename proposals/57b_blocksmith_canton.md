## Development Fund Proposal

**Author:** 57Blocks  
**Status:** Submitted, revised 2026-05-26  
**Created:** 2026-03-13

---

## Abstract

Setting up a Canton validator today is a multi-step process that spans a Foundation notification form, an IP whitelist form, two separate quorum-acceptance flows, sponsor super-validator selection, version-aligned dependencies, and a deployment-shape decision tree, then keeping the result healthy as the active contract set grows over months. Each step is well documented on docs.sync.global; BlockSmith adds the connective tissue that coordinates across them and holds state across what is typically a multi-week timeline.

**BlockSmith for Canton is a guided UX surface on top of that existing tooling.** It composes `validator_compose`, the Splice Helm charts, PQS, and the rest of the Canton stack rather than replacing them. It walks the operator through what's already there, holds state across the steps, plans every mutation before applying it, and is what the operator keeps using for day-2 maintenance, monitoring, scaling, and data archive.

Two surfaces share one workspace:

- **CLI**, the deterministic substrate. Scriptable, auditable, the surface for known operations and CI.
- **AI assistant via the Model Context Protocol (MCP)**, the operator companion for configuration, debugging, scaling, and upgrades. The MCP server runs on the validator with a small deterministic tool surface; the model and the agent loop run on the operator's own host over an existing SSH connection. No LLM runs on the production validator.

**Where the scope comes from.** Two operator perspectives shape every feature in this proposal. 57Blocks's own DevNet bring-up in May 2026 surfaced the day-0 friction that motivated the guided workflow and the AI assistant: Foundation notification, IP whitelist, quorum waits, sponsor super-validator selection, and the 503 sequencer-reachability case used as a worked example later. Direct review from an active Canton MainNet validator operator before submission reinforced what hurts after DevNet at production scale: the MCP-on-validator architecture (no LLM on the production node), plan-then-apply transparency, cloud infrastructure templates, dynamic scaling, the plugin catalog, and the data-extraction pipeline. What follows is what these two perspectives said hurt the most, not what we guessed might.

**In 2026, AI-assisted tools are the baseline. BlockSmith brings that baseline to Canton validator operations. Running a Canton validator should feel as supported as everything else we use today — that's what we're building.**

Delivered across three milestones over 12 weeks for **375,000 CC**, based on a 30-day average price of **$0.16 per CC**, validated against 57Blocks's own validator as it moves through DevNet, TestNet, and a MainNet-ready configuration.

---

## Specification

### 1. Objective

Canton validator setup is multi-step today, and the operational side after setup adds its own complexity. The validator API may return 503 because one sequencer endpoint is currently unreachable from the operator's network. A given sponsor super-validator's onboarding-secret endpoint may be temporarily unavailable, so the operator selects an alternate from the dozen-plus candidates listed by the Scan API. Upgrades can encounter Migration ID mismatches that need resolution. The validator's own Splice ans-web-ui needs to be locked down before a wider audience touches it. For cloud deployments, aligning cloud resources (VPC, IAM, RDS, security groups, storage classes) with what the validator needs is itself a significant effort. After bring-up the participant needs more CPU and disk, and the operator wants to extract ledger data to long-term object storage for compliance.

Today the typical operator loop is to run a CLI command, copy a log slice into a separate tab, paste it into a general-purpose chat tool alongside whatever context can be manually assembled, and apply suggested fixes back in. 57Blocks worked through this loop while bringing up our own DevNet validator, and BlockSmith is the tool we're building to turn the entire flow into a single guided experience on top of what Canton already ships.

**Target users.** Validator operators running Canton participant nodes on DevNet, TestNet, and MainNet, on Docker Compose or Kubernetes, on a self-managed VM or a cloud account. Application developers benefit indirectly: the same bring-up shipped for operators is what they would use if they want a real node alongside their Daml work. Sandbox and `cn-quickstart` remain the right entry points for daily contract iteration.

**Success criteria.** The operator experience improves measurably across the full validator lifecycle, from DevNet through TestNet to a MainNet-ready configuration. Some steps will always live outside the tool (submitting forms to the Foundation, running `terraform apply` with the operator's own credentials, waiting for network acceptance); BlockSmith generates the inputs for those steps, holds state across the wait, and resumes the operator into what comes next.

- Operators get guided support at every step. When they need something, BlockSmith either configures it directly or makes the manual step clearly actionable with the right inputs and the next command ready to run.
- Onboarding decisions reduce to a small number of upfront choices (environment, deployment shape); everything else is generated from those choices.
- Persistent state on disk survives interruptions: operators close the laptop while Foundation review is pending and resume from where they left off.
- Day-2 operations (maintenance, monitoring, scaling, plugins, data archive) live in the same tool as the bring-up, so the operator doesn't switch tools or re-read docs as the deployment matures.
- Every mutating command shows a plan before applying. The operator reviews the diff before BlockSmith touches anything.
- The AI assistant is available across the lifecycle (configuration, debugging, scaling, upgrades) and accepts natural-language questions when the right CLI command isn't obvious to the operator yet.
- At the end of the engagement, operators describe the setup as more tractable than expected and the tool as supportive at each step, not as a black box or a pointer to more documentation to read.

### 2. Implementation Mechanics

#### Walkthrough (DevNet, Docker Compose, dev configuration)

The walkthrough below is the bring-up 57Blocks is running on our own validator: two CLI sessions separated by a week of Foundation-paced waiting, and then the AI assistant for the part where something goes wrong.

**Day 0. Workspace setup and the onboarding ceremony.**

```
$ blocksmith-canton init

  ? What environment? .................. DevNet
  ? Deployment shape? .................. Docker Compose, dev

  Workspace created at ./my-validator
  Sizing check: disk 40 GB, RAM 16 GB, CPU 4 vCPU       ok
  Dependency check: docker compose, curl, jq            ok

  Step 1 of 4: Notify the Foundation
    Form payload generated. Submit at https://forms.canton.foundation/...
  Step 2 of 4: Whitelist your IP for DevNet
    Detected 34.28.122.5. Submitted.
  Step 3 of 4: Wait for network acceptance (typically 2 to 7 days)
    Polling hourly in the background. Close the terminal anytime.
      Super-validators:  ██████████████░░░░░░    14/20 (70%)   reached
      Sequencers:        █████████░░░░░░░░░░░     9/20 (45%)   waiting
```

The workspace holds the tool's state on disk. The operator closes the terminal, comes back days later, and `blocksmith-canton` picks up where it left off.

**Day 7. Both quorums met. Plan, then apply the bring-up.**

```
$ blocksmith-canton up --plan
  Selecting sponsor super-validator... 4 of 13 currently responding with valid secrets.
    Using: sv-candidate-04 (selection redacted; chosen automatically by reachability).
  Files to write:    .env (MIGRATION_ID=1, IMAGE_TAG=0.6.3), compose.override.yaml
  Containers to start: postgres, participant, ans-web-ui, validator
  Apply with: blocksmith-canton up --apply

$ blocksmith-canton up --apply
  Writing .env, compose.override.yaml                  ok
  splice-validator-postgres-splice-1      healthy
  splice-validator-participant-1          healthy
  splice-validator-ans-web-ui-1           healthy
  splice-validator-validator-1            unhealthy (still trying)

  Validator API returns 503. Run `blocksmith-canton ask` to investigate.
```

A meaningful share of the DevNet bring-ups we've watched land here on the first attempt: most containers come up healthy, one container does not.

**Day 7, a few minutes later. The AI assistant investigates.**

```
$ blocksmith-canton ask "validator readyz keeps returning 503"
  [connecting to my-validator via mcp-over-ssh ... ok]
  [model: claude-sonnet-4 · 7 sec]

  The participant container can't reach one of the configured sequencers from this
  network position.
  Recent log line: "Stopping internal-sequencer-connection-SEQ:: sequencer-02 ..."
  Source: docs.sync.global validator network requirements 3.2.

  Probing sequencer reachability...
    sequencer-01    reachable
    sequencer-02    unreachable (TCP timeout)
    sequencer-03    reachable
    sequencer-04    reachable

  3 of 4 reachable. Quorum is 2/3; you meet it.
  Restart to force fresh sequencer selection? [y/N]
```

Every fact in this example is from a real debugging session during our own bring-up between May 7 and May 13, 2026. We will publish recordings and logs of the bring-up and an AI-assisted debugging slice with the M1 release so reviewers can see BlockSmith working in practice against a real Canton DevNet rather than evaluating a sketch.

#### Commands

Every mutating command goes through plan first. Lifecycle commands use `--plan` / `--apply` flags; workflow commands use explicit `plan` / `apply` subcommands. File diffs are unified-diff, container diffs are before/after summaries, cloud IaC diffs reuse `terraform plan` and `cdk diff` so the operator applies with their existing pipeline.

| Command | Purpose |
|---|---|
| `init` | Create workspace; choose environment and deployment shape; run sizing and dependency checks. |
| `onboard notify\|whitelist\|quorum` | Run individual onboarding sub-flows: form payloads, IP whitelist, quorum tracking. |
| `up\|down\|restart` | Lifecycle of the deployment with `--plan` / `--apply`. |
| `reset --mode safe\|full` | Clean reset; `full` also drops volumes (useful for DevNet recovery scenarios). |
| `status`, `doctor`, `logs`, `collect-diagnostics` | Health, deterministic checks, structured log access, redacted support bundle. |
| `ask`, `chat` | One-shot or interactive AI assistant via MCP. From M2, proposes mutating actions for operator approval. |
| `monitor up\|down` | Bring up Prometheus + Grafana + Loki alongside the deployment with BlockSmith's pre-built dashboards (handshake state, sequencer connectivity, ledger advancement, sponsor SV history, alerts). |
| `topology` | Topology and connectivity graph as an interactive Grafana panel or self-contained HTML artifact. Answers the 2026 DevEx survey's "one-click visual dashboard" ask. |
| `connection-info` | Emit machine-readable JSON of reachable endpoints, auth mode, and version info for integrating teams. |
| `upgrade plan\|preflight\|apply` | Guided upgrade workflow grounded in the Splice validator-upgrade documentation. |
| `infra plan\|apply --cloud=aws\|gcp\|azure --shape=docker\|k8s-dev\|k8s-prod` | Generate reference IaC sized to the workspace (Terraform module for AWS in M2). BlockSmith never holds cloud credentials; the operator runs `terraform apply`. |
| `pqs up\|down\|status` | Deploy and lifecycle-manage the Participant Query Store as a sibling component. |
| `archive plan\|apply\|status` | Stream PQS data to S3 (M3), GCS, or Azure Blob in partitioned Parquet, with operator-defined redaction. Resumable against the PQS offset. |
| `scaling status` | Read CPU/RAM/disk pressure and ACS growth from PQS; emit a sizing recommendation with concrete numbers; feed into `infra plan --resize-from-recommendation`. |
| `plugin list\|enable\|disable` | Catalog of optional Splice components (utility UI, darsyncer, PQS) shipped as first-party plugins. Documented contract for third-party plugins. |

#### Monitoring, cloud, day-2, data archive

BlockSmith does not add a parallel operations console. Canton operators already use Grafana for metrics, Loki for logs, and the validator's own Splice UIs for participant operations. `monitor up` deploys Prometheus + Grafana + Loki with BlockSmith's pre-built dashboards aligned to the Canton-published observability baseline. `topology` and `connection-info` produce artifacts that open in the operator's existing tools, not a new browser tab to bookmark.

For cloud, `infra plan --cloud=aws --shape=k8s-prod` generates a Terraform module for an EKS-based validator (VPC, IAM, EKS, RDS, security groups, storage classes) sized to the workspace. The operator runs `terraform init && plan && apply` with their own credentials. M2 ships AWS + EKS validated against a real AWS account; GCP and Azure architectures use the same templating engine and are follow-on paths.

For day-2 operations, `scaling status` reads the participant's CPU/RAM/disk and ACS growth from PQS and emits a sizing recommendation that feeds back into `infra plan`. The `plugin` catalog ships utility UI, darsyncer, and PQS as first-party plugins; the contract is documented so third parties can add their own.

For long-term data storage, `pqs up` deploys the Participant Query Store as a managed sibling component (we don't replace it; we package and operate it), and `archive plan|apply` streams its output into S3 in partitioned Parquet with operator-defined redaction, resumable against the PQS offset. Cold-storage targets in M3 are S3-first; GCS and Azure Blob are follow-on paths on the same engine.

#### AI assistant via MCP

The AI assistant is the operator companion across the lifecycle: configuration choices on first setup, cloud walkthroughs, debugging, scaling decisions, upgrade reasoning. The CLI is the deterministic substrate for known operations; the assistant is the surface for the open-ended ones.

```
[operator's host]
  blocksmith-canton ask "..."
       │  ssh validator-vm "blocksmith-mcp serve --stdio"
       ▼
[validator] blocksmith-mcp serve --stdio
            started by SSH, dies when the CLI exits, runs as the operator's SSH user
            ~30-tool surface: read logs, check ports, query Scan API, inspect
            workspace, generate Compose/Helm/Terraform diffs, query PQS,
            archive status (from M2: gated mutating tools)
```

No new port on the validator, no TLS cert to provision, no daemon. The MCP server is small, audited, and deterministic. There is no LLM, no embeddings, no outbound network call on the validator. The model backend is the operator's choice (Claude, AWS Bedrock, Azure OpenAI, OpenAI, or a local Ollama on the laptop), configured once in `~/.blocksmith/config.yaml`. Because the protocol is the open Anthropic MCP standard, operators already using Claude Code or Cursor can point those at the same server.

Read-only across the wire in M1 (logs, port checks, workspace inspection). M2 adds a small set of mutating tools (apply config diff, restart container, advance archive offset) that always go through the plan/apply seam. M3 writes every assistant suggestion and operator approval to the audit-trail described in the MainNet milestone.

#### How BlockSmith fits with existing Canton tooling and differs from existing alternatives

BlockSmith composes upstream Canton tooling rather than replacing it. The table below covers the components we call into and the proposals adjacent to ours:

| Existing component or alternative | Relationship |
|---|---|
| `validator_compose`, Splice Helm charts | BlockSmith generates `.env`, compose overrides, and `values.yaml` against the upstream files. Not vendored. |
| Scan API | Polled to compute quorum, sponsor SV selection, and the topology graph. |
| Validator notification + IP whitelist forms | BlockSmith generates form payloads; submission and Foundation review remain human-in-the-loop. |
| Validator upgrade documentation | `upgrade plan/preflight/apply` reproduces the documented procedure as a guided flow. |
| Participant Query Store (PQS / `scribe`) | Deployed and lifecycle-managed by `pqs`; output flows into the `archive` bridge. Not replaced. |
| Splice utility UI, darsyncer | First-party plugins in the catalog. |
| Anthropic Model Context Protocol | BlockSmith ships an MCP server with operator tools. Any MCP client (Claude Code, Cursor, BlockSmith CLI) can connect. |
| **`cantonctl`** | Project-local, Splice-aware developer orchestration. Its scope is the developer's local workspace; BlockSmith covers the complementary surface of validator onboarding to real networks and ongoing operations. The two are compatible alongside one another. |
| **Canton DevKit (#18)** | Local Daml developer environment for application developers. Sits next to BlockSmith rather than overlapping with it. |
| **#324 Canton MCP + Skills** | MCP server for Daml/Canton **developers** (docs search, scaffolds, lint). BlockSmith's MCP is for **operators** (logs, container health, infra diffs, PQS, archive). Complementary; both can be plugged into Claude Code or Cursor on the same workstation. |
| **#148 Operator Console** | Runtime-admin Web UI for already-running nodes. BlockSmith targets the onboarding-through-day-2 lifecycle and uses Grafana plus the existing Splice UIs for browser views, so the two surfaces are complementary. |
| **#136 Observability Standard** | Adopted by the monitoring helper, not redefined. |
| **#64 Launchpad** | Adjacent infra config generation; BlockSmith wraps the workflow around it. |

Each of the components above covers an important slice of the ecosystem. The slice BlockSmith focuses on is the operator's path from "I want to be a Canton validator" to a healthy MainNet validator, plus the day-2 operations that follow.

#### Non-goals

- Not a replacement for any upstream Canton component (`validator_compose`, Helm charts, PQS, observability standard). BlockSmith composes them.
- Not a cloud-provisioning service. BlockSmith generates reference IaC; the operator runs `terraform apply` with their own credentials.
- Not a runtime-admin Web UI. We ship Grafana dashboards and a topology export, not a new operations console.
- Not an autonomous operator. The AI assistant is read-only in M1 and gated by operator approval through the plan/apply seam from M2 onward.

### 3. Milestones and Funding

Three end-to-end milestones in a 12-week build, one milestone per environment. Total funding: **375,000 CC**, based on a 30-day average price of **$0.16 per CC**. The weight of the milestones reflects the weight of the deliverables: M3 carries HA topology, audit trail, scaling, plugins, and the data-extraction pipeline, and gets the most weeks and the most budget.

| Milestone | Scope | Timing | Funding |
|---|---|---|---|
| **M1: DevNet** | Onboarding ceremony, Compose / dev bring-up against upstream `validator_compose`, full CLI for the lifecycle (`init`, `onboard`, `up/down/restart`, `reset`, `status`, `doctor`, `logs`, `collect-diagnostics`, `monitor`, `topology`, `connection-info`), plan/apply seam across mutating commands, pre-built Prometheus + Grafana + Loki dashboards, topology export (Grafana panel + standalone HTML), MCP server with the ~20-tool read-only surface, BlockSmith CLI MCP client with bring-your-own-model. AI assistant ships in read-only mode covering configuration help and debugging. | Weeks 1–3 | 112,500 CC |
| **M2: TestNet** | TestNet onboarding ceremony, production deployment paths (Compose prod, K8s dev, K8s prod), operator security primitives (key handling, secret management via `.env` + bring-your-own external store, TLS via Let's Encrypt + bring-your-own-cert). Cloud infrastructure templates for AWS + EKS, validated against a real AWS account. AI assistant gains the command proposal flow and interactive walkthroughs of `infra plan` for operators new to AWS, all gated by operator approval through the plan/apply seam. | Weeks 4–7 | 125,000 CC |
| **M3: MainNet** | MainNet-ready HA topology profile (multi-replica participant + synchronizer with documented failover), signed audit-trail JSON export covering operator actions and AI assistant approvals, scaling estimation (`scaling status`) reading PQS, plugin catalog with utility UI / darsyncer / PQS, managed PQS deployment, archive bridge to S3 in partitioned Parquet, security checklist aligned with Canton's operational guidance ready for a follow-on third-party security review. AI assistant gains scaling and plugin reasoning on top of the audit trail. | Weeks 8–12 | 137,500 CC |

**Build vs. acceptance windows.** The 12-week timeline above is the *build* effort. Operator validation depends on Foundation-paced onboarding (notification review, IP whitelist, network acceptance) and can extend past the build window; milestone payments release on milestone *acceptance*. Where acceptance would otherwise depend on third-party approvals 57Blocks does not control (MainNet network acceptance, third-party security review), those approvals are reported as follow-on events and do not gate the milestone.

**Development methodology.** 57Blocks engineers use AI coding agents in production every day on other Web3 client engagements. The 12-week scope reflects that velocity: a small dedicated pod with AI-assisted development covers ground a larger team or a longer timeline would otherwise need. Deliverables, code, and documentation are produced and reviewed by the human team.

### 4. Acceptance Criteria

Each milestone is accepted on operator-validated outcomes. The primary operator is 57Blocks itself, driving its own validator through DevNet, TestNet, and a MainNet-ready configuration on BlockSmith.

**M1 (DevNet) accepted when:**

- 57Blocks's DevNet validator is up and healthy (Validator API responsive, ledger advancing, super-validator and sequencer quorum confirmed), brought up end-to-end through the BlockSmith CLI with the four-step ceremony driven by the tool.
- At least one mutating command is exercised through the plan/apply seam, with the plan output published.
- The monitoring helper produces a working Prometheus + Grafana + Loki stack with BlockSmith's pre-built dashboards.
- The topology export is generated successfully in both Grafana panel and standalone HTML forms.
- The MCP server runs on our validator and the CLI MCP client connects over SSH from an operator host. At least one real debugging scenario from our own bring-up is resolved using the AI assistant with citations.
- Recordings and logs of the bring-up and an AI-assisted debugging run are published with the release.
- The BlockSmith for Canton repository is public on GitHub under the Apache 2.0 license, with contribution guidelines so the Canton community can open issues, submit pull requests, and review the implementation.

**M2 (TestNet) accepted when:**

- 57Blocks's validator is promoted to TestNet using BlockSmith.
- At least one production deployment path (Compose prod, K8s dev, K8s prod) is exercised end-to-end and passes operator security checks (key handling, TLS, no plaintext secrets in the workspace). The other two production paths are smoke-validated in a staging deployment.
- The AWS + EKS Terraform module is generated by `infra plan`, validated against a real AWS account, and the operator's `terraform apply` is documented and executed end-to-end.
- The AI assistant's command proposal flow is functional. Every mutating tool call passes through operator approval via the plan/apply seam.

**M3 (MainNet) accepted when:**

- BlockSmith drives 57Blocks's validator to a MainNet-ready configuration with the HA topology profile, validated against a production-equivalent deployment.
- The signed audit-trail export is produced (covering operator actions, AI suggestions, operator approvals) and the Canton-aligned security checklist is in place.
- PQS is deployed via `blocksmith-canton pqs` and feeding the archive bridge. At least one archive run lands in S3 in partitioned Parquet and is queryable from an analytics workspace.
- The plugin catalog has utility-ui and darsyncer enabled successfully on at least one deployment.
- `scaling status` produces a recommendation on a real workload.
- MainNet network acceptance and any independent third-party security review are reported as follow-on events and do not gate this milestone.

---

## Ecosystem Benefit

The 2026 Canton Developer Experience and Tooling Survey identified environment setup and node operations as a top friction across the ecosystem. The Canton validator population is small relative to the Daml developer population, which makes the per-operator value of any onboarding-time reduction high: every new validator that joins the network after BlockSmith ships is in the addressable population, as is every existing operator promoting across environments.

BlockSmith reduces operator effort and tribal-knowledge cost for:

- New validator teams onboarding to DevNet for the first time.
- Existing validators promoting their setup across DevNet, TestNet, and MainNet.
- Operators on Kubernetes / EKS: aligning cloud resources with the validator's needs is condensed into a reproducible cycle of `infra plan` plus `terraform apply` with the operator's own credentials.
- Recovery scenarios where an operator must rebuild a node from a workspace.
- Hackathon and proof-of-concept validator deployments that today get blocked on infrastructure setup before they reach application work.
- Operators carrying ledger data for compliance and analytics: BlockSmith deploys PQS and bridges its output into cold object storage.
- Operators in regulated environments who cannot run an LLM on the production validator: the MCP architecture keeps the model on the operator's chosen host.

Canton's validators are mostly institutional operators with strict compliance and uptime requirements. An open-source tool that builds on the existing Canton tooling raises the baseline for every operator on the network while keeping the ecosystem consolidated on the same upstream stack. The 57Blocks dogfooding loop means every UX gap surfaces against our own deployment before it lands on anyone else's.

## Rationale

57Blocks has shipped this kind of guided UX tooling for blockchain workflows before. BlockSmith for Stellar Soroban, funded by the Stellar Community Fund, is a developer toolchain that helps smart contract teams build, test, and deploy on Soroban (Stellar's architecture doesn't require users to run their own nodes, so the natural audience there is the contract developer rather than the operator). The transferable observation is the same: complex multi-step blockchain workflows become friction that blocks teams from shipping, and a guided CLI + AI experience meaningfully changes that. The difference on Canton is that we're targeting validator operators, we're the first operator using the tool so it gets validated on a real validator before anything ships externally, and the scope was shaped by direct review from another active Canton operator before submission.

## Team Background

**57Blocks.** Building Web3 infrastructure since 2018. 200+ engineering organization across six offices. Operator and developer tooling experience across Ethereum, Solana, Stellar, and Canton.

**Diogo Silveira Mendonça, PhD, PMP.** Product and Engineering Lead. 20+ years in software engineering, ~7 years in Web3, Canton and Daml certified. Currently leading the bring-up of 57Blocks's own Canton validator.

**Implementation team.** A dedicated pod with at least one Canton-certified engineer at all times. The Canton-certified roster is being expanded in anticipation of the grant. Implementation is accelerated by AI coding agents and validated against our own validator deployment as it progresses through DevNet, TestNet, and a MainNet-ready configuration.

## Open-source maintenance 

BlockSmith for Canton will be maintained as an open-source project under Apache 2.0. 57Blocks will assign a project lead responsible for reviewing community issues and pull requests, accepting external contributions when they fit the roadmap and quality bar, and keeping the tool updated as we continue using it internally for our own Canton validator operations.


## Contact

- Diogo Silveira Mendonça, Head of Web3 LATAM, [diogo.silveira@57blocks.com](mailto:diogo.silveira@57blocks.com)
- Kamil Krupa, Head of Web3 BU, [kamil@57blocks.com](mailto:kamil@57blocks.com)

## Sponsorship

Sponsored by the Canton Foundation. Please contact Bo Zhang for additional context.

## References

- 2026 Canton DevEx survey analysis: [https://discuss.daml.com/t/canton-network-developer-experience-and-tooling-survey-analysis-2026/8412](https://discuss.daml.com/t/canton-network-developer-experience-and-tooling-survey-analysis-2026/8412)
- Validator deployment via Docker Compose: [https://docs.sync.global/validator_operator/validator_compose.html](https://docs.sync.global/validator_operator/validator_compose.html)
- Validator upgrade procedure: [https://docs.sync.global/validator_operator/validator_upgrades.html](https://docs.sync.global/validator_operator/validator_upgrades.html)
- Validator observability: [https://docs.sync.global/deployment/observability/index.html](https://docs.sync.global/deployment/observability/index.html)
- Participant Query Store (PQS): [https://docs.digitalasset.com/build/3.5/component-howtos/pqs/index.html](https://docs.digitalasset.com/build/3.5/component-howtos/pqs/index.html)
- Anthropic Model Context Protocol: [https://modelcontextprotocol.io](https://modelcontextprotocol.io)
- Canton Dev Fund #324 (Canton MCP + Skills, VertexPoint Labs): [https://github.com/canton-foundation/canton-dev-fund/pull/324](https://github.com/canton-foundation/canton-dev-fund/pull/324)
- BlockSmith for Stellar (precedent project): [https://www.blocksmith.co/](https://www.blocksmith.co/)
