## Development Fund Proposal

**Title:** Canton Agent Control Plane
**Author:** kamalbuilds. Final legal entity and contributor list to be confirmed before PR.
**Status:** Draft
**Created:** 2026-07-20
**Label:** financial-workflows-composability
**Champion:** Need Champion
**License:** Apache-2.0 for code, CC-BY-4.0 for documentation

---

## Abstract

Canton Agent Control Plane is an open-source runtime, Daml package, and operator toolkit that lets institutions run AI agents against Canton workflows with bounded authority, privacy-scoped ledger visibility, human approvals, kill switches, and audit receipts.

This proposal does not define a new agent interoperability protocol, payment rail, code assistant, wallet framework, or generic MCP server. It builds the missing execution control layer for institutions that want to use agents in production: who can act, what they can see, what value they can move, when a human must approve, how the action can be stopped, and what evidence is produced afterward.

The first public proof is a Devnet reference workflow where a treasury agent can propose and execute an approved settlement within a configured mandate, is blocked when it exceeds policy, and emits an audit receipt bundle that a reviewer can verify in under 90 seconds.

---

## Specification

### 1. Objective

Institutional Canton teams are increasingly experimenting with agents for treasury operations, settlement assistance, compliance triage, and workflow automation. The blocker is not only model quality or messaging. The blocker is operational control.

A production participant needs to answer five questions before allowing an agent near a Canton workflow:

1. Which party is the agent allowed to represent or observe?
2. Which contract templates, choices, assets, and counterparties are in scope?
3. Which actions can be submitted automatically, and which require approval?
4. How can an operator pause or revoke the agent without redeploying the app?
5. What structured evidence proves that the action respected the mandate?

Today these controls are rebuilt per application. That creates duplicated security reviews, weak audit evidence, and slow adoption. The objective of this proposal is to create a reusable Canton-native control plane for agentic workflows, packaged as:

- Daml templates for mandates, policy gates, approvals, revocations, and action receipts
- A TypeScript runtime that enforces those templates before any ledger submission
- A participant-local policy worker that reads only authorized ledger views
- Reference workflows for treasury settlement, compliance pre-checks, and service-request execution
- Operator documentation, threat model, and Devnet demo scripts

The intended outcome is a shared public-good component that app teams can extend instead of rebuilding agent authority, approval, and audit controls from scratch.

### 2. Implementation Mechanics

The work is split into five components.

#### A. Daml control templates

The Daml package defines the minimum on-ledger control surface needed by an institutional agent runtime.

| Template | Purpose |
|---|---|
| `AgentMandate` | Grants an agent scoped authority for a party, workflow type, allowed templates, counterparties, limits, and expiry. |
| `PolicyRuleSet` | Defines spend limits, allowed choices, required approvers, time windows, and counterparty constraints. |
| `ApprovalRequest` | Records a proposed action that requires human or committee approval before submission. |
| `ControlPlaneRevocation` | Lets an operator pause or revoke a mandate, either globally or for a workflow. |
| `AgentActionReceipt` | Records the structured outcome, policy decision, trace ID, relevant contract IDs, and audit observers. |

The templates are intentionally narrow. They do not attempt to standardize agent capabilities across the ecosystem. If the AI Agent Interoperability proposal in PR #484 becomes the ecosystem standard for capability advertisement and service records, this control plane can wrap those requests and receipts rather than replacing them.

#### B. TypeScript runtime

The runtime is a library and CLI that application teams embed into an agent service before it submits a Canton command.

Primary runtime calls:

```typescript
const plan = await controlPlane.planAction({
  party,
  workflowType: "treasury-settlement",
  proposedCommand,
  traceId,
});

if (plan.decision === "requires_approval") {
  await controlPlane.createApprovalRequest(plan);
  return;
}

if (plan.decision === "allowed") {
  const result = await controlPlane.submitWithReceipt(plan);
  await controlPlane.writeReceipt(result);
}
```

The library handles:

- Mandate lookup from the authorized party view
- Policy evaluation before command submission
- Optional approval request creation
- Retry-tolerant ledger submission and receipt writing
- Revocation checks before submission and before receipt finalization
- Structured logging with no raw private payload export by default

#### C. Participant-local policy worker

The policy worker runs inside the institution's own infrastructure. It reads only what the configured party and participant credentials can already see. It does not create a global index and does not request cross-party visibility.

Responsibilities:

- Subscribe to relevant mandate, revocation, approval, and receipt contracts
- Maintain a local policy cache keyed by party and workflow type
- Expose a local API to agent services running in the same trust boundary
- Emit OpenTelemetry-compatible metrics for policy decisions, approval latency, rejections, and revocations
- Export redacted audit summaries for compliance teams

#### D. Reference workflows

The proposal delivers three reference workflows that demonstrate how the control plane composes with existing and funded ecosystem work.

| Workflow | What it proves | Non-overlap |
|---|---|---|
| Treasury settlement agent | Agent can propose a settlement, pass policy, submit within limit, and emit receipt | Uses app-level Canton commands. Does not define a settlement protocol. |
| Compliance pre-check agent | Agent can request approval when a counterparty or limit is outside policy | Complements monitoring proposals by controlling pre-submit actions. |
| Service-request executor | Agent can wrap an external service request and produce a control receipt | Can wrap PR #484 service requests if that proposal is accepted. |

#### E. Devnet proof and reviewer artifact

The public demo is designed for fast committee review.

A reviewer can run one script or watch one short recorded flow:

1. Create parties for operator, agent, approver, and counterparty.
2. Create an `AgentMandate` with a small per-action limit.
3. Submit an in-scope action and see an `AgentActionReceipt`.
4. Submit an over-limit action and see an `ApprovalRequest` instead of a ledger submission.
5. Revoke the mandate and verify the agent is blocked.
6. Export a redacted audit bundle with trace ID, policy decision, approver, and receipt references.

The acceptance artifact is not a passive dashboard. It is a working repo and Devnet script that proves bounded agent execution under Canton privacy constraints.

### 3. Architectural Alignment

This proposal aligns with Canton architecture and Development Fund review expectations in five ways.

| Priority | Alignment |
|---|---|
| Public good | The templates, runtime, demo app, and documentation are open-source and reusable across app teams. |
| Sustainability | The control plane is a small extension layer around existing Ledger API usage, not a hosted dependency. Teams can self-host it. |
| Adoption-driven delivery | Milestones require Devnet proof, external integration feedback, and at least two non-author teams testing the runtime. |
| Privacy | The worker runs participant-local and respects Canton sub-transaction visibility. Redacted exports are derived from authorized views only. |
| Financial workflows | The initial workflow focuses on treasury and settlement controls for institutional parties. |

Relevant ecosystem alignment:

- Extends existing app workflows rather than changing the Canton protocol.
- Uses Ledger API and Daml contracts as the source of authority.
- Can call Canton x402 middleware for paid agent services where appropriate, but does not duplicate the x402 facilitator or client SDK.
- Can call Daml-specific MCP tools from the Daml Code Assistant work during development, but does not build a code generation tool.
- Can consume a future PR #484 agent service request as an input, but does not define capability advertisement or a new standard.

### 4. Backward Compatibility

No backward compatibility impact.

The implementation adds new optional Daml templates and off-ledger libraries. It does not modify the Canton protocol, existing Daml packages, wallet behavior, synchronizer behavior, x402 payment flows, or application-specific workflows.

---

## Non-Overlap With Funded and Open Work

| Existing work | Status as of 2026-07-20 | What it does | How this proposal differs |
|---|---:|---|---|
| PR #484, AI Agent Interoperability for Institutions | Open | Defines agent role contracts, service requests, service records, capability advertisement, and service lifecycle | This proposal does not define interoperability. It gates execution before submission and records policy evidence around any workflow, including PR #484 flows if accepted. |
| FTP x402 Canton integration | Approved | Facilitator, payer SDK, middleware, and CanTrustAI reference for machine payments | This proposal does not implement payments. It may use x402 for paid services, but focuses on authority, approval, revocation, and audit. |
| IntellectEU Daml Code Assistant | Approved | Daml autocompletion, code generation, test generation, and MCP tooling | This proposal does not generate code. It ships runtime controls for deployed agent services. |
| PartyLayer Wallet SDK | Approved | Application-layer wallet and dApp developer experience | This proposal is not a wallet or dApp UI layer. It runs inside institutional agent services and participant-local infrastructure. |
| BitDynamics DevKit | Approved | LocalNet, dpm component, explorer UI, and developer tooling | This proposal does not provide a general DevKit. It uses ordinary project tooling and targets agent policy control. |
| Hacken monitoring and risk-scoring stack | Open | Participant-local monitoring, alerting, and party risk scoring | This proposal acts before and during agent execution. Monitoring can observe outcomes, but the control plane decides whether an agent may act. |
| GBBC RMF operationalization framework | Open | Operational risk framework, KRI methodology, and reporting guidance | This proposal produces executable controls and receipt artifacts that can feed RMF reporting. It is not a framework-only proposal. |
| Generic MCP server proposals or adapters | Varies | Tool exposure for agents | This proposal is tool-transport agnostic. MCP is one possible caller interface, not the grant output. |

---

## Milestones and Deliverables

### Milestone 1: Control Templates and Local Runtime

- **Estimated Delivery:** 4 weeks after approval
- **Funding:** 200,000 CC upon committee acceptance
- **Focus:** Define the on-ledger control surface and prove local policy gating.
- **Deliverables / Value Metrics:**
  - Open-source Daml package containing `AgentMandate`, `PolicyRuleSet`, `ApprovalRequest`, `ControlPlaneRevocation`, and `AgentActionReceipt` templates.
  - Daml tests covering allowed action, approval-required action, revoked mandate, expired mandate, and audit observer visibility.
  - TypeScript runtime with policy evaluation, approval request creation, and receipt writing.
  - Threat model covering prompt injection, over-broad visibility, stale mandates, approval bypass, revocation races, and private payload leakage.
  - Local demo script that a reviewer can run in under 10 minutes.

### Milestone 2: Devnet Reference Workflows

- **Estimated Delivery:** 8 weeks after approval
- **Funding:** 250,000 CC upon committee acceptance
- **Focus:** Demonstrate real Canton workflows under bounded agent authority.
- **Deliverables / Value Metrics:**
  - Devnet deployment of the control plane templates.
  - Treasury settlement reference workflow with below-limit execution and above-limit approval.
  - Compliance pre-check reference workflow with redacted audit export.
  - Service-request executor that can wrap an external agent request without redefining the external protocol.
  - Reviewer artifact: one command or hosted walkthrough proving allowed, approval-required, and revoked states.
  - At least one external Canton builder or SIG member runs the Devnet demo and files feedback in GitHub issues.

### Milestone 3: Ecosystem Hardening and Adoption

- **Estimated Delivery:** 12 weeks after approval
- **Funding:** 300,000 CC upon committee acceptance
- **Focus:** Turn the proof into reusable ecosystem infrastructure.
- **Deliverables / Value Metrics:**
  - Versioned npm package and Daml package release with migration notes.
  - Operator guide for participant-local deployment, credentials, logging, redaction, and recovery.
  - OpenTelemetry metrics and redacted audit bundle exporter.
  - Integration guide showing how to wrap PR #484-style service requests, x402-paid services, and ordinary app commands without changing those protocols.
  - Two non-author teams test the runtime against their own sample workflow or forked demo.
  - Public adoption report summarizing integrations, issue feedback, fixes shipped, and remaining roadmap.

---

## Acceptance Criteria

The Tech & Ops Committee can evaluate completion based on ecosystem value rather than artifact existence alone.

- A reviewer can verify, on LocalNet and Devnet, that an agent is allowed to execute an in-scope workflow, blocked or routed to approval when out of policy, and blocked after revocation.
- The audit receipt bundle contains enough structured evidence for a reviewer to understand who authorized the agent, which policy was applied, which action was attempted, what decision was made, and where the final receipt lives.
- The runtime never requires visibility beyond the parties and credentials supplied by the deploying participant.
- The non-overlap matrix remains current at final acceptance and documents any integration or design changes caused by PR #484, x402, Hacken, GBBC, or Daml Code Assistant progress.
- At least two non-author teams or SIG reviewers have attempted to run the demo or integrate the runtime, with their feedback captured and addressed or explicitly deferred.
- Documentation explains what this control plane can and cannot protect against, including model hallucination, malicious tools, compromised keys, and operator misconfiguration.

---

## Funding

**Total Funding Request:** 750,000 CC.

### Payment Breakdown by Milestone

- Milestone 1, Control Templates and Local Runtime: 200,000 CC upon committee acceptance
- Milestone 2, Devnet Reference Workflows: 250,000 CC upon committee acceptance
- Milestone 3, Ecosystem Hardening and Adoption: 300,000 CC upon committee acceptance

### Volatility Stipulation

The planned project duration is under 6 months. Should the project timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant CC price volatility.

---

## Co-Marketing

Upon release, the implementing team will collaborate with the Foundation on:

- A technical blog showing bounded agent execution on Canton.
- A short demo video focused on the three reviewer states: allowed, approval-required, revoked.
- A SIG walkthrough for Financial Workflows and Regulatory Compliance.
- A public adoption report after Milestone 3.

---

## Motivation

Canton's privacy and authorization model is well suited to institutional agents, but institutions will not delegate meaningful work to agents without controls that match their operational risk standards.

The expected adopter base is Canton application teams and participant operators that want to add agentic automation to financial workflows. The first addressable group is small but high value: teams building treasury, settlement, compliance, tokenized-asset, or service-request workflows where an agent can propose or execute actions under explicit limits. We expect the control plane to be relevant to most app teams that expose any write capability to an AI agent, and immediately useful to teams experimenting with agent workflows after PR #484 and x402.

This proposal creates a narrow reusable layer that every such team would otherwise rebuild:

- Mandates for what an agent may do
- Policy gates for when it may act
- Approval requests when it needs a human
- Revocations when it must stop
- Receipts that prove what happened

That is a shared ecosystem asset, not a private application.

---

## Rationale

The design intentionally extends the existing ecosystem instead of replacing it.

A new agent protocol would collide with PR #484. A new payment rail would collide with x402. A new Daml code agent would collide with the IntellectEU Daml Code Assistant. A new wallet or app framework would collide with PartyLayer and the Canton dApp SDK. A passive compliance dashboard would collide with Hacken and GBBC.

The control plane is the layer between an agent's intention and a Canton command submission. It asks whether the proposed action is allowed by an on-ledger mandate, whether it needs approval, whether the mandate is still active, and what receipt should be written afterward. That is a distinct problem with a clear adoption path.

Alternatives considered:

| Alternative | Why not |
|---|---|
| Build another Canton agent standard | Too much overlap with PR #484 and too review-heavy for a fund proposal. |
| Build only an MCP server | MCP is a transport, not an institutional control model. |
| Build a compliance reporter | Cleaner competitive lane, but it does not solve pre-submit agent authority. |
| Build a full agent app | Too private and too hard for other teams to reuse. |
| Build a dashboard-first product | Weak proof artifact. Reviewers need to see an agent allowed, blocked, approved, and revoked. |

The chosen approach keeps scope tight, produces a verifiable Devnet proof, and creates a reusable component that can compose with other funded work.

---

## Initial Product Loop

This section is included to make the adoption path explicit.

- **Exact user:** Canton application engineer or participant operator adding an AI agent to a treasury, settlement, or compliance workflow.
- **10 second action:** Create a bounded agent mandate from a CLI or script and run a sample action.
- **Return trigger:** Daily or per-deployment review of approval queue, revoked mandates, and policy decision metrics.
- **Share or invite trigger:** Export a redacted audit receipt bundle that a counterparty, SIG champion, or reviewer can verify.
- **Proof artifact:** Devnet script proving allowed, approval-required, and revoked states in one workflow.
- **Technical primitive used deeply:** Canton party visibility, Daml authorization, Ledger API command submission, and contract-level receipts.
- **Kill list:** No generic DevKit, no AI Daml coder, no visual debugger, no wallet adapter layer, no new agent standard, no passive dashboard-only compliance product.
