# LedgerShield: Authorization Gateway for the Canton JSON Ledger API

| Field | Value |
| :---- | :---- |
| Authors | Vinh <v@upflam.com>, [github.com/v9n](https://github.com/v9n) |
| Org | [Upflam](https://upflam.com) |
| Status | Submitted |
| Created | 2026-09-14 |
| PR | [#788](https://github.com/canton-foundation/canton-dev-fund/pull/788) |
| Proposal Type | RFP-aligned |
| RFP Category | Security, Assurance & Incident Readiness. RFP 25, Identity and Access Control (rfp-25:identity-access-control). Secondary: RFP 27, Security Monitoring, Auditability and Evidence(rfp-27:security-monitoring) |
| Champion | Akash Gaurav [github.com/akashgaurav](https://github.com/akashgaurav), Brandon Young [github.com/beezybarg](https://github.com/beezybarg) |
| Total Funding Request | 1,650,000 CC |
| Project Duration | 3 months build, a 6-month adoption window from Milestone 1 |
| Label | node-deployment-operations |

---

## Abstract

LedgerShield is an open-source API proxy that runs on top of the Canton JSON Ledger API. It holds OIDC credentials to talk to the Ledger API. It provides an alternative layer of access token issuance and granular permission control without requiring the operator to manually create an OIDC app or give out an OIDC access token to share access to the ledger. It issues opaque API Bearer tokens that can be used to access the ledger and are scoped down to endpoints, parties, templates, choices, argument values, and spending budgets. Clients change the base URL to point to the LedgerShield URL and use its API token instead of hitting the Participant Ledger API directly. Each API Bearer token is bound to Open Policy Agent (OPA) policies to grant or deny the request. If the request is granted, it is then forwarded to the ledger, and the request is also recorded for audit purposes. These audit records are stored in DuckDB, an embedded OLAP engine. Besides audit records, quotas are also stored in this database. Both audit and quota data are batch-written to DuckDB. They are first written to a WAL and fsynced, then periodically batch-flushed to DuckDB for performance reasons.

Today, the smallest credential we can assign to a party on a participant are `CanActAs`, `CanExecuteAs`, `CanExecuteAsAnyParty`, `CanReadAs`, `CanReadAsAnyParty`, `ParticipantAdmin`. Whoever holds it can submit, or read any data that party holds, and hit any API endpoints on ledger that party can hit. LedgerShield gives operators more granular access control, with no protocol change and no new identity provider.

It's very useful for operators who usually share a single OIDC (client id/secret) of the validator machine-to-machine credential, to now have an easily revocable, time based or IP-bound, filter down to endpoint, command (create or exercise) as well as Daml transaction body through OPA.

Deliverables: a single binary Go API proxy that includes the API layer, an admin UI to define policies and issue tokens, and query the audit log.

---

## Motivation

### Current state of Ledger API access

Every node that exposes its Ledger API to more than one consumer has this problem. A validator running an app usually has a few consumers:

- the app itself
- an indexer (usually just needs read-only)
- CI/CD system: A CI probably just needs the ability to create and set up initial/bootstrap contracts
- The engineers who operate the app
- An external vendor for accounting or analytical purpose (SyncInsight)

More often than not, each holds a credential that can do more than its job. Access control can also be escalated. Example, a user with participant admin can escalate their own permission by granting more rights to themselves.

There are a few common problem with this access mechanism:

- **Overhead.** Access to OIDC system can escalate the privileges so usually only a few key team member has admin access to provision access.
- **Friction.** Because the smallest credential is large, operators issue few, and teams share one. That is also why the audit trail is unusable.
- **Blast radius.** A leaked debug credential is a leaked node key credential to act as operator party. Increasingly it is handed to an AI coding agent. Note that this is not applied to external signing, in external signing it's always require the signature belong to the private key of that party.
- **Duplicated work.** Teams that need scoped access build a bespoke backend that wraps the ledger. Every team builds it again, and it covers only their app.

### Existing work

Upflam has developed a bespoke proxy and is currently using it in-house to share access among team members and the app. We take this opportunity to open source this work, streamline it further to benefit every operator in the network.

### Who benefits

Every participant operator benefits, without a node upgrade. Institutional deployments benefit most, because separation of duties and per-credential audit are compliance requirements for them.

Both service provider and node operator benefit because how quick it's to share Ledger API access.

### How adoption is drive

By reducing this friction to gain access to Ledger API, we believe it will drive adoption. Once people see how quickly and safely they can expose or share Ledger API access, while at the same time gaining access to an audit log, they will do it more. For example, a validator can quickly share a read-only credential with a third-party indexer, which is a common need in accounting and private data exploring.

Development will also be easier and safer. Devs, engineers, and contractors can easily get scoped, limited access to help debug and work on the validator.

Today, many validators download and run those accounting/explorer tools inside their infrastructure. That increases friction and lowers adoption. By making it safe to expose Ledger API to the outside, operators don't need to run these tools themselves, and service providers can onboard validators quicker.


### Fit with existing tooling

LedgerShield sits between existing SDKs and an unmodified participant, and between an unmodified OPA and the ledger. Clients keep their SDK, policy authors keep Rego, and nothing is forked. Transaction mode reuses the prepared-transaction hashing from the Canton wallet SDK.

---

## Specification

### 1. Objective

Align with [RFP 25, Identity and Access Control](https://github.com/canton-foundation/canton-dev-fund/blob/main/2026-2028-strategic-roadmap.md) and [RFP 27, Security Monitoring, Auditability and Evidence](https://github.com/canton-foundation/canton-dev-fund/blob/main/2026-2028-strategic-roadmap.md).

We aim to give Canton node operators a way to provide least-privilege access control over their own Ledger API, as well as logging calls and figuring out who does what.

Today, the Ledger API authorizes a JWT access token, tied to a party through the sub field that binds to a Canton party by its `actAs`, `readAs`, `execute as` party sets plus a participant-admin flag. Participant user management adds `CanActAs`, `CanReadAs` and `ParticipantAdmin`, also party-scoped. That is the full granularity.

A common operator mode is that an app, or an engineer will use the client id/secret of the machine to machine app, exchange for an access token, then use actAs to perform command for internal party, or rely on `execute as` for external party.

In practice:

- An engineer who simply wants to read the ACS to debug holds a credential that can also transfer funds.
- An indexer that only reads gets `readAs` on every party it indexes, usually `readAsAnyParty`.
- A CI job that just needs to exercise one choice on a specific template, can exercise every choice on every vetted package as that party.
- A team shares one OIDC client, so the participant logs one user id for five people. If it leaks, we don't know who leaked it.
- Rotating a client secret requires downtime.

The workaround is to create multiple OIDC clients, define sub field mapping to an existing party, or create another participant user per consumer app, configure party permission. Revoking means now we have to deactivate the OIDC app, and off-board the party, or revoke its relevant permission.

A very common scenario in Canton is we want to provide data for some external party, in read-only manner, such as for indexing data, or for accounting purpose. Also, when a team has access to client id or client secret/password, it is now impossible to track who leaked what because all are issued under same client id/secret and there is no ability to inspect log at that state.

More often than not, we sometimes have to give operator party access to some consultants to create contracts or debug, but we don't want them to be able to access the funds of operator party. Configuring that properly is not trivial.

LedgerShield aims to solve the above problems. There is no more extra OIDC or party permission to configure. An operator can do:

- **Issue API bearer token/access token without relying on OIDC**. No more auth ceremony at OIDC level
- **Providing audit log per bearer token per endpoint, command.** Based on this we can answer which credential was used to hit which endpoint, or to create which contract.
- **Providing temporary access.** A developer, or the coding agent they run, needs to create bootstrap contracts on the validator operator's party, which also holds the node's rewards. The operator issues a short-lived API bearer token that reads the ACS and creates the bootstrap templates at most 20 times. Every exercise is refused.
- **Providing granular access.** Two external people evaluate an accounting tool for 30 days. They get bearer tokens scoped to the parties and templates the tool reads, with an expiry. Revoking them touches no IdP and no participant user.
- **Different credential per developer or app.** Each person gets their own based on their own policy that grants relevant access. The audit log names the api bearer token, so it names the person. Offboarding is one revocation.
- **IP binding per bearer token.** A bearer token for an app to use should only be invoked from the infrastructure IP. A partner access should be whitelisted from their own IP address only.

LedgerShield's goal is to enable a node operator to issue credentials that are scoped to specific API operations, down to API operations, parties, and request body (templates, choice), bound to approved IPs, see who used it, and revoke it easily without affecting other credentials.

### 2. Implementation Mechanics

#### Request path

```
client (unchanged SDK)                LedgerShield                    participant
  Authorization: Bearer slk_...  -->   lookup bearer token (constant time) and find policy
                                       check expiry, IP and rate limit
                                       check endpoint + party scope
                                       parse body, check Daml scope
                                       check quota
                                       attach real JWT               -->  JSON Ledger API
                                  <--  response                      <--
                                       audit record, update quota usage

                                       any check above fails:
                                  <--  403, naming the failed rule
                                       audit record, nothing forwarded
```

We deploy a single static Go binary that powers both the gateway and an admin UI. The state is stored in one DuckDB file holding hashed bearer token, policies, quota counters and the audit log. The gateway holds one upstream credential, an OIDC client-credentials grant or a participant user per party, and never hands it to a client. SDKs already send `Authorization: Bearer <token>`, so clients need no code change.

When a request comes in, LedgerShield extracts the bearer token, and looks up the policies bound to that bearer token to evaluate their access. It has knowledge of the underlying endpoint, not just a dumb proxy so it can inspect the request body to evaluate against the policy as well. Such as, a user can only exercise choice on a specific contract template.

The gateway is entirely config driven, with an optional UI for operators who want to have a UI to issue API Bearer tokens, as well as viewing and querying audit log. The admin UI can be used to create and manage policies. An API Bearer token can be issued, and bound to policies. Authentication of this admin UI is based on OIDC, similar to how common apps like wallet, or utility are set up in Canton by creating a dedicated OIDC Single Page Application (SPA) without secret. Authorization is based on a predefined list of `sub` or `groups` property of the JWT.

LedgerShield uses [DuckDB](https://duckdb.org/) to store, and query audit log as well as API Bearer tokens and policies.

#### Policy

The gateway normalizes each request into a **decision document** and hands it to an embedded [Open Policy Agent](https://www.openpolicyagent.org/).

The decision document contains information about the incoming requests that users provide: (endpoint, payload, etc) and information about the request that LedgerShield knows (quota). At the core, it describes a ledger API request as plain JSON: who is asking, which endpoint, which parties, and the resolved Daml operations with package name, module, entity, choice and extracted argument fields.

```json
{
  "principal": { "key": "settlement-bot", "parties": { "actAs": ["operator::122..."] } },
  "endpoint": "POST /v2/commands/submit-and-wait",
  "operations": [
    { "kind": "exercise",
      "package": "upflam-token-allocation", "module": "Upflam.Token.Allocation",
      "entity": "TokenAllocation", "choice": "Allocation_ExecuteTransfer",
      "args": { "amount": "250.0", "receiver": "bob::122..." } }
  ],
  "quota": { "remaining": { "calls": 7, "rules": { "0": { "calls": 3, "sum": { "amount": "3100.0" } } } } }
}
```

Policy is written in [Rego](https://www.openpolicyagent.org/docs/policy-language), evaluated against that decision document.

```rego
package ledgershield

default allow := false

allow if {
    input.endpoint == "POST /v2/commands/submit-and-wait"
    some op in input.operations
    op.package == "upflam-token-allocation"
    op.choice == "Allocation_ExecuteTransfer"
    to_number(op.args.amount) <= 1000
    input.quota.remaining.calls > 0
}
```

Rego is deny-by-default, testable with `opa test`, and known to the security teams who review these policies. It is also very flexible and allows us to express conditions a fixed schema would not be able to support such as: only during market hours, only for counterparties in a list, only while today's total is under a number etc.

Most token need less than that level of granular permission. The gateway accepts a YAML shorthand that compiles to Rego, to allow users who are not familiar with Rego to easily edit it. Example:

```yaml
key: settlement-bot
parties:
  actAs: [operator::122...]
endpoints:
  - POST /v2/commands/submit-and-wait
allow:
  - exercise:
      package: upflam-token-allocation      # package name, never package id
      module: Upflam.Token.Allocation
      entity: TokenAllocation
      choice: Allocation_ExecuteTransfer
      where:
        amount: { lte: "1000.0" }        # per call
    quota:
      calls: 10                          # 10 calls, ever
      sum:
        amount: "5000.0"                 # 5000 in total across them
quota:
  calls: 200                             # whole-key budget
rate: 60/min
ip: [10.0.0.0/8]
expires: 2026-10-01T00:00:00Z
```

Templates and interfaces are matched by package name, module and entity.

The gateway intersects the client's request by endpoint, method, filter with the bearer token's party and template scope, so a token scoped to one party and one template will only be able to query data(ACS) for that party and exercise the choice of that template only. Their request will be rejected and abort if the policies cannot be matched.

#### Quotas

Besides rate limits that cap how fast a key is used, we also have quota: it caps how much it can do. A quota in LedgerShield is very powerful, not just how many times the key can be used, but also deep into how much a key can spend. By inspecting and parsing the request, LedgerShield understands transfer, allocation, lock and tracks this spending. Example, a key can be used to exercise a choice that transfers CC, but it can only exercise that as long as the total sum of the amount is less than X.

The end user can define a field that can be read to define quota consumption. Example in a transfer it's `transfer.amount` in `choice_argument`. Counters/Sum are decremented inside the same DuckDB transaction that writes the audit line, through a single writer to avoid race condition.

Rego is pure. On every request the decision document is built and enriched based on policies, then Rego can evaluate and reject.

#### Web UI

A web UI is bundled right into the Go binary, no need to deploy a separate UI. This allows an admin to log in, manage API Bearer tokens, policies and query audit log.

#### Admin Authentication

Admin authentication is done through OIDC, either through a list of sub field or a property on the JWT issued by the OIDC app. Canton operators are already familiar with OIDC, and set them up in a similar manner such as for Utility app.

We leverage the same mechanism here by having an extra SPA OIDC app (no secret).

#### Audit Log

One record per request: key id, policy version, decision, matched rule, parties, template and choice, command id, resulting update id, latency. JSON lines are written to a WAL (write ahead log) buffer and then batch inserted into DuckDB every 10 seconds (configurable). DuckDB is a columnar storage, so the log is queryable in place efficiently. Data is partitioned by day/week (configurable). An evidence bundle is a Parquet export of a time window that an auditor can open with any DuckDB client.

#### Pruning

To avoid data storage going out of bounds, LedgerShield allows auto pruning data. Optionally, Parquet files can be exported to object storage such as S3, GCS.

#### Operations

- Issue, rotate and revoke keys over the admin API, the CLI and the console. Keys are hashed at rest. Revocation takes effect on the next request.
- Operators sign in to the console and the admin API through their own OIDC provider, as a public client with PKCE. Admins are named by subject or group in the config. The CLI signs in with a device-style flow approved in the console. No admin password or static admin token exists.
- The console lists live keys with their scope and remaining budget, streams denials, and explains each rejection by naming the rule and the node that failed it. Policies can be dry-run against recorded traffic before they apply: would this policy have allowed yesterday's requests?
- Break-glass keys carry a short TTL and log at a distinct level, so use of the emergency credential is an alert.
- Prometheus metrics on a separate listener: requests by key, endpoint and decision, request and upstream latency, policy evaluation time, remaining budget per key and scope. Denials, quota exhaustion and key expiry are each one query away.
- One binary, one file. Compose and Helm are provided. Reference policies ship for the four common consumers: read-only indexer, debugging engineer, CI, scoped app service account.


#### Why OPA

Another policy language is Cedar, backed by AWS. We choose Rego because

- It's a CNCF project with a more open community.
- It's Go native.
- It's more flexible than Cedar, uses a language that is more generic syntax.

#### Why DuckDB

- Why DuckDB, not Postgres or SQLite. We aim to keep the deployment as simple as possible. The goal is to minimize disruption or extra work to the end-user. We would pick SQLite for simplicity, but from our actual usage, storing log-like data in DuckDB, we benefit more from its columnar storage, compression.


### 3. Architectural Alignment

- **No protocol change.** LedgerShield is a client of the participant, using the documented JSON Ledger API and interactive submission service.
- **Keeps the existing auth model.** The operator keeps their IdP and participant users. Every existing component continues to work as is. LedgerShield is an opt-in additional layer an app can choose to use. And its protocol payload is exactly the same. A customer can in fact choose to talk directly to Ledger API, but use LedgerShield for external vendor or cross team access.
- **SCU-safe.** There is no Daml code to change.
- **Reuses an existing standard.** Policy is Rego on OPA. What Canton lacks is a description of a ledger request that a policy engine can read. That description is the deliverable.
- **RFP 25.** Service accounts, privileged access, role-based controls, onboarding and offboarding, administrative monitoring, delivered as tooling plus a written schema.
- **RFP 27.** All data is node-local and operator-owned. The gateway reads only what the underlying credential already permits.

### 4. Team and Prior Art

Upflam runs Canton validators on DevNet, TestNet and MainNet with automated release reconciliation. We already maintain a [CIP-0056 and CIP-0112 token registry](https://docs.upflam.com/payments/flam-registry) with an off-ledger registry API in Go. We also develop [Superscan](https://superscan.upflam.com), a Super Validator monitoring tool and a [unified routing layer for CIP-56 registry](https://docs.upflam.com/super-scan/api-registry). Before Upflam, the team built [Loop Wallet](https://cantonloop.com) and [Lighthouse](https://lighthouse.xyz) at 5N.

LedgerShield will sit in front of our own MainNet validator and our payments platform. We maintain it because we run it.

#### Screenshots

A lighweight version that we're currently use in-house (lack audit log and some more advance features)

<p>
  <img src="https://asset.upflam.com/ledgershield/upflam-ledgershield-mockup1.png" alt="LedgerShield policies" width="32%">
  <img src="https://asset.upflam.com/ledgershield/upflam-ledgershield-mockup2.png" alt="LedgerShield create key" width="32%">
  <img src="https://asset.upflam.com/ledgershield/upflam-ledger-shield-mockup3.png" alt="LedgerShield view key and attach policies" width="32%">
</p>

#### Relation to the Wallet Gateway

The [Wallet Gateway](https://github.com/canton-network/wallet/tree/main/wallet-gateway), part of the Apache-2.0 [wallet](https://github.com/canton-network/wallet/) project, also holds an OIDC credential and issues API keys, so there are some overlap and similarity, or whether we can extend Wallet Gateway. We evaluate based on

- What problem they solve
- Who are the consumer that will use them.

Based on that we think the 2 are solving different problem.

- **Different problem** The Wallet Gateway focus on supporting a wallet operation. It connects CIP-0103 dApps to an operator's validator and signing provider, and routes each transaction through user approval and a signer (participant, Fireblocks, Blockdaemon, DFNS). LedgerShield focus on drop-in replacement for Ledger API, with ACL policies to decides what a given credential may do on the Ledger API. It has no wallets, sessions or signing.
- **Different API** The Wallet Gateway exposes its own JSON-RPC APIs (`/api/v0/dapp`, `/api/v0/user`). Additionally, there are also API surface that are pass through to Ledger API, right now only GET and POST is routed, PATCH/DELETE or not. It also has no stream functionality yet. LedgerShield exposes the unchanged JSON Ledger API. Indexers, CI jobs, SDK-based backends and vendor tools only change their base URL. 
- **Different audience** Wallet Gateway is also serve end-user through the dApp UI. LederShield server majority service(app, indexer, CI/CD) and internal user/team. This set of users don't need the wallet provisioning or dapp functionality.
- **API key/token permission** A Wallet Gateway API key stores a name, owner and network only. It has no expiry, IP binding, endpoint, party, template or choice scope, and no quota. A request made with the key runs with the ledger token of the network's `serviceAccountAuth` OIDC client. The CIP-0103 `ledgerApi` passthrough forwards the request body unchanged to any GET or POST route in the Ledger API OpenAPI spec. Those routes include command submission, DAR upload (`/v2/dars`), package vetting updates, party allocation, user creation and rights grants. There is no permission tie to that key, as long as it's valid the request are pass through with the permission of the OIDC service account. LedgerShield adds the missing layer: deny-by-default Rego policies over the parsed command, quota system, and a queryable audit record for each request.

We chose to write a new service rather than extend the Wallet Gateway. Wallet Gateway is a very sophisticated software solving a complex problem with many moving part already(interface with all the components in dApp stack), extending it would mean adding a policy engine, request-body parsing and an audit store to a wallet product whose API is set by CIP-0103. It would also cover only traffic that already goes through a wallet. The consumers in §1 (indexers, CI, engineers, external vendors) call the Ledger API directly, and they are the ones LedgerShield serves.



**Design partners:**

[CanPocket](https://canpocket.ai/) and [EA Finance](https://ea.finance/) have agreed to review the decision-document schema before it is frozen, run a scoped key against their own participant on DevNet at Milestone 1 and MainNet at Milestone 2, and report on the milestone issues whether the acceptance criteria were met. Both will confirm on this PR. We are recruiting further operators from the Node Deployment & Operations SIG and will add names here.

### 5. Backward Compatibility

No backward compatibility impact. Clients that do not use LedgerShield are unaffected. Clients that adopt it change a base URL and a token value.

---

## Milestones and Deliverables

Three milestones. Each milestone is independently deliverable and payable.

### Milestone 1: API Gateway, Admin UI, Open Source Repository with all CI/CD pipeline

- **Estimated delivery:** Month 2
- **Estimated effort:** 600 hours
- **Focus:** The full gateway, open source GitHub repository with full CI/CD for unit test, release artifact.
- **Dependencies:** None.

Deliverables:

- Open Source repository published under Upflam org with all CI/CD pipeline for unit test and release pipeline.
- Deployment artifacts are binaries uploaded to GitHub and Docker images, Helm charts are also on GitHub registry.
- One static binary for both API gateway + UI, one DuckDB file. Docker image, Helm chart on GitHub registry. Apache-2.0 repository, CI, container image, operator guide.
- Decision-document schema published as a versioned spec.
- Key lifecycle over admin API, CLI and console. TTL, rate limit, IP allowlist.
- Policies can evaluate the keys and requests. Demonstrated through read narrowing for ACS and update queries.
- Quotas: durable call counters and `sum` budgets at key, package, template and choice level.
- Console: live keys and budgets, denial stream, policy editor.
- Demonstrated on Upflam's DevNet validator: the five access-control cases in §1 end to end, plus a transaction-mode rejection where a choice body creates a contract outside the policy and the offending node is named. Recorded walkthrough and a reproducible LocalNet test case.
- Design partners run a scoped key against their own DevNet participant and report on the milestone issue.

### Milestone 2: Security, Observability, Hardening and Policy Fuzzer

- **Estimated delivery:** Month 3
- **Estimated effort:** 500 hours
- **Focus:** Improving security by building common policies and developing a fuzzer to continuously test against the implementation
- **Dependencies:** Milestone 1.

Deliverables:

- Audit log: one record per request in DuckDB, quota counters decremented with the audit write. Logs are searchable and filterable from the admin UI. Console audit explorer with Parquet export.
- Provide a set of common policies for common consumers: app operator, indexer, team, third party access.
- Prometheus metrics exporter: requests by key, endpoint and decision, latency, remaining budget per key.
- Policy fuzzer in CI. The bug class is a parser differential: the gateway reads a command one way and the participant executes it another. The fuzzer generates hostile command payloads (unicode and homoglyphs in party ids, duplicate object keys, deep nesting, numeric boundaries, alternate encodings of the same template id, oversized and truncated arguments) and checks one property against LocalNet: if the gateway allowed it, the resulting transaction contains only nodes the policy permits, and the quota usage is updated both for the api call and the sum of value moved.
- Failure behaviour defined and tested: the gateway denies when it cannot evaluate and never fails open. API bearer token rotation under load. Break-glass api-token that allow emergency pass through.
- Prometheus metrics endpoint. Dashboards and alert rules for denials, break-glass use, quota exhaustion and key expiry.
- Load and performance testing: a reproducible load test suite against LocalNet measuring gateway throughput, added latency over direct Ledger API calls, and policy evaluation cost. Methodology and results published in the repository.
- Video walkthrough sharing screen against Upflam MainNet validator to demonstrate the functionality.
- Design partners run a scoped key against their own MainNet participant and report on the milestone issue.

### Milestone 3: Ecosystem Adoption

- **Estimated delivery:** Month 8 (6-month window opening on Milestone 1 acceptance)
- **Estimated effort:** 400 hours
- **Focus:** Other operators running LedgerShield and community can make PRs against the open source repository.
- **Dependencies:** Milestone 1.

Deliverables:

- At least 3 operators running LedgerShield in front of a real participant, each reporting on the milestone issue what they scoped, what it replaced and what broke. Private attestation to the Foundation where an operator prefers to stay unnamed.
- At least 3 PRs from the community, each more than 1,000 LOC, merged and released.
- Documentation site: install, policy authoring, decision-document reference, migration from OIDC-per-consumer, troubleshooting.
- At least 4 public, recorded office-hour sessions covering LedgerShield usage and use cases.
- Contributor guide, architecture document, and a release process an outside contributor can follow.

---

## Acceptance Criteria

The Tech & Ops Voting Committee will evaluate completion against the following. Each milestone can be evaluated and paid out independently.

**Cross-cutting:**

- The committee, or a design partner it delegates to, can check each criterion on a participant we do not control.
- Apache-2.0 for all code and specifications.

**M1 (API gateway, admin UI, release artifact on public):**

1. **Keys and policies management UI.** Create keys, create policies, add policies to a key to govern its permission.
2. **A bootstrap credential cannot move asset.** A 24-hour key on the validator operator party reads the ACS and creates the bootstrap templates. Every exercise is refused, including on contracts it just created. It expires on its own and can be revoked in one command.
3. **A service account does one job.** A key permitted one choice is refused on a sibling choice of the same template and on a different template under the same party.
4. **A key with a quota limit runs out of usage.** A key permitted 10 transfers of at most 1,000 each and 5,000 in total is refused on the 11th call, or earlier when the running total would pass 5,000.
5. **Policy request effects.** In the prepare and execute flow (2 steps instead of a single submit-and-wait command), policies are enforced at both the prepare and the execute step.


**M2 (Security, Observability, Hardening and policy fuzzer):**

6. **Every call is attributable.** For any window, the operator can produce which key made which submission, which rule allowed it and which update it produced, as a query, and export it as a file an auditor can open.
7. **A policy change is checked before it ships.** An operator edits a policy, can run `opa test` from the UI, and dry-runs it against recorded traffic before it affects a live request.
8. **Admin UI to explore the log.** An admin can view and query the log, see who did what. Logs can also be exported.
9. **Common policies are shared** on the docs, as well as bundled into the web UI.
10. **Fuzzer public.** Threat model and fuzzer public and in CI.
11. **Prometheus and Grafana dashboard** configs are committed to the repository.
12. **Automated benchmark and publish result.** Automated code to perform benchmarking that can run on CI. The final benchmark result will also be shared in the docs to show some estimated workload performance.

**M3 (ecosystem adoption):**

13. **Another operator can run it.** Three operators run it in front of a real participant and report the result themselves.
14. **Community can contribute.** Three PRs with more than 1,000 LOC contributed by external contributors.
15. **Record office-hours.** At least 4 record office-hours session to walk through LedgerShield will be shared and document online.

---

## Funding

**Total Funding Request:** 1,650,000 CC

### Payment Breakdown by Milestone

| Milestone | Description | CC | Payment trigger |
| :---- | :---- | ----: | :---- |
| M1 | API Gateway, Admin UI | 600,000 | Committee acceptance. Schema and Apache-2.0 release public. Both modes demonstrated on DevNet. Design partners report on the milestone issue |
| M2 | Security, Observability, Hardening and Policy Fuzzer | 500,000 | Committee acceptance of criteria 6–12. Running on Upflam's MainNet validator |
| M3 | Ecosystem Adoption | up to 550,000 | Community adoption, contribution, see more below |
| M4 | Audit | TBD | Perform security audit on the repository |
| | **Total** | **1,650,000** | |

### Adoption measurement

| Trigger | CC |
| :---- | ----: |
| Each operator running LedgerShield in front of a real participant and reporting the result, up to 3 | 75,000 each, 225,000 total |
| Documentation site is live, at least 3 advanced policies are shared on docs site and at least 4 office-hour sessions held | 100,000 |
| Pull requests with more than 1,000 LOC (lines of code) contributed by the community, up to 3 | 75,000 each, 225,000 total |

Adoption is reported by the adopting operator, so partial adoption pays partially.

### Effort basis

| Milestone | Hours | Work |
| :---- | ----: | :---- |
| M1 | 600 | Gateway, policy compiler, UI, operator guide, demo |
| M2 | 500 | Audit log, threat model, fuzzer and corpus, observability, load and performance testing, MainNet rollout |
| M3 | 400 | Operator onboarding, documentation site, office hours |


### Audit

We plan to engage an independent vendor to audit the code after M1+M2. Currently, we don't know how much the audit will cost to request the right funding for it. We estimate it will be in the range of $20,000-$40,000. We left this blank.

We will submit an amendment, subject to approval from the Security Committee, once we reach the milestone and get a quote from the auditor based on the state of the repository at that time.


### Timeline

Milestones 1 and 2 land inside 3 months. Right after Milestone 1 is completed, we will concurrently work on Milestone 3. We estimate Milestone 3 will complete 6 months from Milestone 1 because it depends on community and external vendor.

### Volatility Stipulation

The grant is denominated in fixed Canton Coin and will be re-evaluated at the 6-month mark, or when Canton Coin value increases or decreases by 30%.

### Sustainability

Upflam voluntarily commits to maintain it for 12 months after the final milestone, without any additional funding required, to prove our commitment to keeping this up. LedgerShield stays in production in front of Upflam's own MainNet validator, which is the durable reason it is maintained. Should Upflam stop, the codebase is one Go binary with a published schema and fuzzer, small enough for another operator or the core contributors to pick up.

**License:** Apache-2.0 for all code and specifications.

---

## Co-Marketing

- Announcement coordination at Milestones 1 and 2.
- A technical write-up on scoped Ledger API access and ability to filer based on transaction payload.
- Publishing the fuzzy design and implmentation write-up, including bypasses found in our own gateway if found any. Other tooling that parses Canton commands has the same exposure, and the corpus and the design is reusable against it.
- Public, recorded office hours, run with the Foundation's DevRel team where useful.
