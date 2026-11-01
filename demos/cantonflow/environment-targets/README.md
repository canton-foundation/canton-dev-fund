# CantonFlow — Alternative Deployment Environments

## Design Principle

The four compilation targets are **alternative deployment environments** — you pick ONE based on your infrastructure and trust model. They are not meant to be mixed.

Every workflow needs the same core primitives — pause/wait, automation, and recurrence — but each environment delivers them under a fundamentally different runtime model. CantonFlow's compiler translates the same BPMN diagram and permission model into whichever runtime your team operates.

## Environment Comparison

| Primitive | Daml/Canton | Camunda 8 | Cloudflare Workers | Chainlink CRE |
|-----------|------------|-----------|-------------------|---------------|
| **Runtime Model** | On-chain, ledger-native | Server-based, Zeebe engine | Serverless, edge | Decentralized, oracle-verified |
| **Pause / Wait** | Contract sits on ledger until a party exercises a choice. The contract IS the wait state. | BPMN wait states: user tasks, message catch events, receive tasks, timer events. Engine persists a process token and resumes on signal. | `step.waitForEvent()` blocks until external event. `step.sleep()` for timed waits. Durable execution survives Worker restarts. | Automation DON evaluates `checkUpkeep` off-chain every block until conditions are met, then `performUpkeep` executes on-chain. CRE workflows use async capability calls with `.result()` blocking. |
| **Automation** | Off-ledger bots subscribe to ledger events via Ledger API / PQS and submit commands back. No on-chain automation. | Service tasks with job workers (pull model). Zeebe creates jobs; external workers long-poll, execute, and call `CompleteJob`. Connectors for pre-built integrations (REST, Slack, etc.). | Event-driven: HTTP requests, Queue consumers, or Cron Triggers invoke the Worker, which creates Workflow instances via bindings. | Time-based, custom logic, or log-triggered Automation upkeeps. CRE triggers: cron, HTTP, or EVM log events fire workflow callbacks across the DON. |
| **Recurrence** | Off-ledger scheduler only. Contracts can guard with `getTime` (reject outside business hours) but cannot self-trigger on a schedule. | Native timer events: ISO 8601 repeating intervals (`R/PT2H`), cron expressions on timer start events, boundary timers for escalation. All managed internally by Zeebe brokers. | Cron Triggers in `wrangler.toml` fire `scheduled()` handler on a cron schedule. `step.sleepUntil()` for in-workflow future scheduling. | Time-based Automation upkeeps with cron expressions via `CronUpkeep` contracts. CRE `cron.Trigger()` capability for scheduled workflow execution. |
| **State Persistence** | Ledger (active contracts in the ACS) | Zeebe's append-only event log (partitioned, Raft-replicated) | Platform-managed durable step results (automatic, no external store needed) | On-chain contract state + Automation DON registry |
| **Trust Model** | Multi-party: each participant validates independently. Privacy-preserving sync domains. | Single operator runs the engine. | Single operator (Cloudflare platform). | Decentralized: multiple independent DON nodes with BFT consensus. Results are cryptographically attested. |
| **External Calls** | Off-ledger services only. Daml contracts cannot call external APIs. | Native via service tasks and job workers. Workers can call any HTTP endpoint. | Native `fetch()` from within Workflow steps. Full HTTP client. | Oracle-mediated. CRE capabilities for HTTP fetch, EVM read/write. Results go through multi-node consensus. |

## When to Choose Each

### Daml/Canton — On-Chain, Ledger-Native

**Choose when:** You need multi-party privacy, on-ledger auditability, and cryptographic authorization.

**Best for:** Regulated finance, cross-organizational workflows, trade finance, securities settlement, any process where no single operator should be the ultimate trusted orchestrator.

**How it works:** Workflows compile to Daml templates with consuming choices. Each state transition is a ledger transaction — archived old contract, created new contract. Canton's sub-transaction privacy ensures each party only sees the contracts they're stakeholders of. The permission model (signatories, controllers, observers) is enforced cryptographically by the ledger protocol itself.

**Trade-offs:** No on-chain automation (requires off-ledger bots). No scheduled execution without external orchestration. Requires Daml expertise for customization beyond generated code.

### Camunda 8 — Server-Based, Zeebe Engine

**Choose when:** You have existing BPMN infrastructure, need long-running human-in-the-loop processes, and want a mature enterprise ecosystem.

**Best for:** Enterprise BPM, operations automation, document approval workflows, any process requiring native BPMN timer events and rich task management.

**How it works:** Workflows compile to Camunda-compatible BPMN with Zeebe service task types and TypeScript job workers. The Zeebe engine manages process state in its distributed append-only log. Job workers poll for tasks, execute business logic (including Canton Ledger API calls), and report completion. Timer events handle scheduling natively.

**Trade-offs:** Server infrastructure to manage (Zeebe broker cluster). Single-operator trust model. Process state lives in the engine, not on a distributed ledger.

### Cloudflare Workers — Serverless, Edge

**Choose when:** You want zero infrastructure, global edge execution, and pay-per-use pricing.

**Best for:** SaaS automation, event-driven microservices, webhook-triggered workflows, any process where you want durable execution without managing servers.

**How it works:** Workflows compile to a TypeScript Workflow class with typed steps. Each BPMN task becomes a `step.do()` call with automatic persistence — if the Worker crashes mid-workflow, it resumes from the last completed step. Cron Triggers handle scheduling. `step.waitForEvent()` enables human-in-the-loop patterns.

**Trade-offs:** Single-platform dependency (Cloudflare). No native multi-party authorization — permission logic must be implemented in application code. Step and concurrency limits apply.

### Chainlink CRE — Decentralized, Oracle-Verified

**Choose when:** You need trustless, decentralized execution with oracle-verified results and on-chain settlement.

**Best for:** DeFi protocols, cross-chain orchestration, on-chain settlement workflows, any process requiring Byzantine fault tolerant consensus on computation results.

**How it works:** Workflows compile to CRE workflow definitions with serverless functions. The Chainlink Automation DON monitors trigger conditions (time-based, custom logic, or log-triggered) and fires workflow callbacks. Each step runs across multiple independent DON nodes with BFT consensus — results are cryptographically attested before delivery. CRE capabilities handle HTTP fetch, EVM read/write, and secrets management.

**Trade-offs:** Gas costs for on-chain execution. Oracle network fees. More complex deployment (workflow registry, DON configuration). Newer ecosystem with fewer pre-built integrations than Camunda.

## Compiler Output Summary

| Environment | Generated Files | Language |
|-------------|----------------|----------|
| Daml/Canton | `Main.daml` + `daml.yaml` | Daml |
| Camunda 8 | `process.bpmn` + `workers/*.ts` | BPMN XML + TypeScript |
| Cloudflare Workers | `workflow.ts` + `wrangler.toml` | TypeScript + TOML |
| Chainlink CRE | `workflow.cre.yaml` + `functions/*.js` | YAML + JavaScript |
