# CantonFlow — Demo Scripts

## Why This Product Makes Sense

Building multi-party smart contracts today is painful:

1. **High barrier to entry** — Writing Daml requires specialized developers who understand both the business process AND the authorization model. Most enterprises have one or the other, rarely both.

2. **Business logic lives in people's heads** — Compliance officers, trade finance analysts, and operations managers understand their workflows intimately, but they describe them in PowerPoints and meetings. Developers re-interpret these descriptions into code — introducing bugs, missing edge cases, and losing permission intent.

3. **Permission models are invisible** — Who can do what at which stage is buried in authorization logic scattered across services. When an auditor asks "can the Buyer approve their own Letter of Credit?", nobody can answer quickly.

4. **Environment lock-in** — An enterprise picks a runtime (on-chain, server, serverless, decentralized) and has to rewrite the entire workflow from scratch to evaluate an alternative. The business logic is the same — only the execution environment differs.

**CantonFlow solves all four:**

- **Visual BPMN builder** — Business users draw the process they already understand
- **Canton metadata layer** — Signatories, controllers, and observers are visible and auditable per element
- **AI generation** — Describe a workflow in plain English, get a valid BPMN diagram in seconds
- **Multi-target compiler** — One diagram compiles to any ONE of four alternative deployment environments

**The key insight:** BPMN is already the industry standard for process modeling in finance, insurance, and supply chain. By adding a Canton permission layer on top of BPMN and compiling to executable code, we bridge the gap between business process experts and smart contract developers.

---

## Demo Video

[![CantonFlow Demo](https://img.youtube.com/vi/FWytayNgJyo/maxresdefault.jpg)](https://youtu.be/FWytayNgJyo)

---

## Main Demo (12–15 min)

**Audience:** Developers, enterprise architects, Canton/Daml community, hackathon judges
**Setup:** Live browser at [canton-canvas.primelayer.workers.dev](https://canton-canvas.primelayer.workers.dev) or localhost:8080

### Act 1: The Problem (2 min) — Talk track

> "Imagine you're a trade finance team at a bank. You have a well-understood process for issuing Letters of Credit — the Buyer applies, the Bank reviews, approves or rejects, issues the LC. Everyone on the team knows this flow.
>
> Now you want to put this on Canton. You need a Daml developer who understands templates, choices, signatories, controllers, observers, and the state machine pattern. They'll spend days translating a process that took your ops team 5 minutes to sketch on a whiteboard.
>
> What if the whiteboard sketch WAS the smart contract?"

### Act 2: Load a Sample Workflow (2 min) — Live demo

**Action:** Click **Samples** → **Trade Finance — Letter of Credit**

> "Here's that Letter of Credit process as a visual BPMN diagram. Two pools — Buyer and Bank. Tasks flow left to right. There's a gateway where the Bank decides: approved or rejected."

**Action:** Click on the **Review Application** task → show the Properties panel

> "This is where CantonFlow differs from a regular BPMN tool. Every element carries Canton metadata — who are the signatories, who controls this step, who can observe it. The Bank is the signatory and controller on this review task. The Buyer is an observer — they can see it's being reviewed, but they cannot exercise the approval choice. This IS your permission model, right here on the diagram."

**Action:** Click on **Submit LC Application** → show Buyer as signatory/controller

> "And here, the Buyer controls submission. The Bank cannot submit applications on the Buyer's behalf. The permission gating is bidirectional — each party can only do what the process explicitly allows."

### Act 3: Compile to Daml (3 min) — Live demo

**Action:** Click the **Code** tab → select **Daml** from the target dropdown

> "One click, and we have a complete Daml module. Let me walk through what it generated."

**Action:** Scroll through `Main.daml`, pointing out:

- **Templates** for each state (SubmitApplication, ReviewApplication, IssueLOC, ReceiveLOC)
- **Choices** with `controller` clauses matching the Properties panel
- **Signatory/observer** declarations on each template
- **State transitions**: each choice archives the current contract and creates the next
- **Gateway logic**: ReviewApplication has two choices — Approve → IssueLOC, Reject → terminate

> "Notice the ReviewApplication template. It has two choices — `Approve` controlled by the Bank, which creates an IssueLOC contract, and `Reject` controlled by the Bank, which ends the flow. This is exactly the gateway from the diagram. The permission model you drew IS the authorization model in the contract."

**Action:** Click **Download Bundle** → show the zip contains `Main.daml` + `daml.yaml`

> "This is deployable. Drop it into a Daml project, run `daml build`, deploy to Canton."

### Act 4: Alternative Deployment Environments (3 min) — Live demo

> "Now here's the key question every team faces: where do I run this? On-chain? On a server? Serverless? Decentralized oracle network? Each environment has the same core workflow primitives — pause and wait, automation triggers, scheduled recurrence — but delivered differently."

**Action:** Switch target to **Camunda 8**

> "If your team runs Camunda — same diagram. Tasks become Zeebe user tasks and service tasks. Pause/wait is handled by Zeebe's native wait states — the engine persists a token and resumes when a job worker completes. Recurrence uses timer start events with cron expressions. Server-based equivalent of what Daml does on-ledger."

**Action:** Switch to **Cloudflare Workers**

> "If you want serverless — zero infrastructure, pay-per-execution — same diagram. Each task becomes a durable step in a Cloudflare Workflow. Pause/wait uses `step.waitForEvent()`. Recurrence uses Cron Triggers. Same capability as Camunda's wait states, no server to manage."

**Action:** Switch to **Chainlink CRE**

> "And if you need decentralized, trustless execution — same diagram, compiled to a Chainlink CRE workflow. Pause/wait is handled by the Automation DON evaluating conditions off-chain every block. Recurrence uses cron-triggered upkeeps. Same workflow logic, oracle-verified."

> "These are not meant to be mixed. You pick ONE environment based on your trust model, infrastructure, and operational requirements. The BPMN diagram is the source of truth."

### Act 5: AI Generation (3 min) — Live demo

**Action:** Click **AI Generate** to open the chat panel

> "What if you don't want to draw the diagram at all? Describe your process in plain English."

**Action:** Type or click the example prompt:
`A loan approval process between Borrower and Lender with credit check gateway`

> "The AI generates a structured workflow spec, and the server builds valid BPMN from it — no fragile XML generation. The AI handles the business logic, our builder handles the BPMN structure."

**Action:** Wait for generation → show the new diagram on canvas

> "From a one-line description to a visual, compilable workflow in under 5 seconds."

**Action:** Click **Code** tab → show Daml output for the AI-generated workflow

> "And it compiles immediately. Same 4-stage pipeline — parse, normalize, validate, generate. Same production-grade output."

### Act 6: Validation (1 min) — Live demo

**Action:** Click the **Validation** tab

> "The validation engine runs CBP-v1 conformance checks in real-time. Missing controllers, disconnected flows, unbalanced gateways, invalid identifiers — caught before you compile. Click any error to jump to the element."

### Act 7: The Pitch (1 min) — Talk track

> "CantonFlow turns a 2-week smart contract development cycle into a 20-minute design session. Business analysts draw the process. The permission model is visible and auditable on the diagram. The compiler generates production-grade code for four alternative environments. And the AI lets you prototype from a sentence.
>
> This isn't a toy — the sample workflows model real trade finance, supply chain, insurance, and KYC processes with real permission gating. Every signatory, controller, and observer assignment reflects how these processes work in regulated industries.
>
> BPMN is the Rosetta Stone between business and engineering. We just taught it to speak Daml."

---

## Demo Variants

### Short Demo (5 min) — Conference booth / elevator pitch

1. Load Trade Finance sample (30s)
2. Show Properties panel with permission model (1 min)
3. Compile to Daml, highlight choices + controllers (2 min)
4. AI generate a new workflow from one sentence (1.5 min)

### Technical Deep Dive (20 min) — Developer audience

Add after the main demo:
- Walk through the 4-stage compiler pipeline (Parse → Normalize → Validate → Generate)
- Show the WorkflowIR intermediate representation
- Modify a sample workflow: add a task, reassign controllers, recompile
- Show validation catching a missing controller in real-time
- Compare Daml output vs Camunda output for the same diagram
- Discuss ProcessState contract pattern vs per-task templates

### Business Audience (10 min) — Enterprise / compliance

Focus on:
- Permission gating tables — who can do what, when, and why
- Audit trail: every state transition recorded on-ledger with cryptographic proof
- Compliance visibility: observers see process state without control
- KYC example: risk assessment stage with no observers models AML confidentiality
- Time-to-first-workflow: from description to deployed DAR in < 30 minutes

---

## Objection Handling

| Objection | Response |
|-----------|----------|
| "Can't I just write Daml directly?" | You can, but your compliance team can't read it. CantonFlow makes the permission model visual and auditable by non-developers. |
| "AI-generated code isn't production-ready" | The AI only generates a JSON spec. The compiler builds actual code deterministically — same input always produces same output. |
| "BPMN is too simplistic for real workflows" | CantonFlow supports gateways, multi-party pools, typed template fields, and the full CBP-v1 conformance spec. The sample workflows model real regulated processes. |
| "Why four targets?" | They're alternative environments, not a mix. Every workflow needs pause/wait, automation, and recurrence — Daml does it on-chain, Camunda on a server, Cloudflare serverless, Chainlink decentralized. You pick one. |
| "Can I use multiple targets together?" | No — each is a complete deployment environment. But you can switch targets instantly to evaluate which fits your requirements before committing. |
| "What about complex workflows with parallel execution?" | The compiler supports parallel gateways and topological sorting. The validation engine catches unbalanced gateways before compilation. |

---

## Setup Checklist

- [ ] Browser open to app (deployed or localhost)
- [ ] Start with empty canvas (default state)
- [ ] Network connectivity for AI generation (calls Cloudflare Workers AI)
- [ ] Screen resolution >= 1280px (all three panels visible)
- [ ] If demoing locally: `npm run dev` running on port 8080
