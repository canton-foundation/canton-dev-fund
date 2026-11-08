# AnChain.AI Insights: Canton Fraud and AML Evidence Agent

## Development Fund Proposal

**Organization:** AnChain.AI, Inc.  
**Author / Primary Contact:** Victor Fang, Ph.D., Founder and CEO; v@anchain.ai; GitHub @victorfang  
**Status:** Submitted  
**Created:** 2026-11-08  
**Proposal Type:** RFP-aligned  
**RFP / Roadmap Area:** RFP 27, Security Monitoring, Auditability and Evidence; Security, Assurance and Incident Readiness [1]  
**Champion:** Needs Champion  
**Total Funding Request:** 1,600,000 Canton Coin (CC)  
**Project Duration:** 24 weeks from an agreed start date following approval  
**Label:** regulatory-compliance; RFP label: rfp-27:security-monitoring  
**RFP Maximum Amount / Duration:** N/A; neither is specified for RFP 27.

## Abstract

AnChain.AI proposes an open toolkit that lets Canton application operators and investigators use AI agents to review authorized payment activity, flag defined fraud and AML indicators, and produce evidence-backed cases for human review. The toolkit will connect party-authorized Canton records to deterministic review policies and optional intelligence providers, including AnChain.AI Insights, while preserving data visibility and disclosure boundaries. The complete reference workflow will run without an Insights subscription; Canton-specific production support is proposed development, not a claimed existing integration.

## Specification

### 1. Objective

Enable a Canton operator to turn its authorized activity into a reproducible fraud/AML review case, with the rule, source evidence, coverage limitations and reviewer disposition preserved. Intended users are payment applications, asset platforms and their authorized compliance or incident-response teams. RFP 27 establishes ecosystem demand for monitoring and compliance evidence; we have not secured Canton pilot commitments or completed SIG consultation and request champion assistance validating the scope before approval.

Success means independent organizations operate the public components on their authorized Canton data and use the resulting alerts or cases in real review workflows. This is an entity-level monitoring proposal. It does not assume visibility into other parties' private activity or propose network-wide surveillance.

### 2. Implementation Mechanics

**Authorized input.** Build one supported read-only ingestion path using the participant Ledger API and a documented TypeScript client. Pin Canton/Splice and API versions at M1. An operator supplies credentials restricted to the necessary read rights and an explicit party allowlist. Credentials stay in the operator's environment. Resume checkpoints, replay deduplication, bounded history and unavailable/pruned-history states will be documented. Initial coverage is a tested allowlist of Canton Coin and CIP-56 transfer event shapes; arbitrary Daml applications and complete historical backfills are outside v1. Application-provided payment references and decision logs are separate inputs with their own provenance.

**Evidence and review policies.** Publish a versioned evidence schema and policy engine. Records retain network, source participant, authorized party scope, update/event/contract references as available, asset/package identity, exact amounts, timestamps, ingestion checkpoint, parser version and source coverage. Rules initially cover operator-configured amount/frequency anomalies, rapid onward movement within the visible dataset, a supplied counterparty risk indicator, and stale or incomplete inputs. Observed patterns are review signals, not proof of fraud. Missing visibility, unsupported events or unavailable identity mappings return an explicit unknown/review state.

**Identity and intelligence.** Canton party identifiers do not establish a legal identity or an external-chain address. Screening requires an operator-supplied identity or address mapping with provenance and effective dates. Ship a provider-neutral interface, a local indicator-list reference provider, and an optional AnChain intelligence adapter. Each result records provider, query time, list/version information where available, scope and evidence. Licensed data is not redistributed. No commercial feed is required to exercise the full reference workflow.

**Agent and case workflow.** Supply TypeScript SDK/CLI and read-only MCP tools to retrieve scoped evidence, evaluate rules and prepare a review case. Two runnable examples cover payment/counterparty triage and investigator case handoff. The agent may summarize evidence with linked references; deterministic rules produce the review state. The operator can disable LLM use and run template-based case generation locally. Human reviewers decide case disposition. Tools cannot sign transactions, change on-ledger permissions, move assets or file regulatory reports.

**Privacy and selective disclosure.** Enforce tenant and party scope across authorization, caches, search, logs and exports; enforce authorization before data reaches any agent context. Do not infer permission from a user-supplied party ID. External intelligence and LLM calls are disabled by default and require operator-configured field allowlists and destinations. An authorized reviewer can explicitly export a minimized case package to an approved recipient; redactions, omitted fields, coverage and export access decisions are recorded. Toolkit exports do not grant ledger access or retroactively revoke copies already shared. Default logs exclude private payloads and credentials. Retention and deletion are operator-configurable.

**Monitoring and evaluation.** Record tool access decisions, denied requests, policy/configuration changes, case exports and data freshness. Provide structured alerts through one webhook/output interface. Publish synthetic multi-party fixtures and a threat model covering cross-party leakage, prompt injection, untrusted labels, false attribution, missing data and malicious tool requests. Reports distinguish observed facts, deterministic signals and generated narrative. Cases include a content digest for change detection; that digest does not independently prove ledger authenticity or completeness.

### 3. Architectural Alignment

The design consumes published APIs and authorized application data. Canton distributes stakeholder-specific views; Scan is not a source of unrestricted private contract data. The toolkit operates within the operator's visibility and cannot reconstruct hidden transaction branches. [2] It requires no protocol, Global Synchronizer, token-standard or existing contract changes. Additional auditor visibility, if desired, must be established through the application's own authorization and disclosure mechanisms.

This proposal addresses RFP 27's monitoring, evidence, privacy and access-control requirements. It focuses on fraud/AML policy evaluation and bounded agent investigation. It will consume compatible existing SDKs and indexing interfaces where practical, rather than build a general indexer. Noves proposal #949 covers adjacent indexing and audit evidence; we will discuss schema interoperability during M1, without assuming its approval, delivery or collaboration. [3]

### 4. Backward Compatibility and Licensing

No backward compatibility impact. Deployment is opt-in; versioned adapters and schemas document supported source versions and migration behavior.

New standalone connectors, policy engine, SDK/MCP tools, schemas, fixtures and examples will be released under Apache-2.0, following dependency review. The complete reference workflow must be deployable independently using public code. Existing Insights services remain separately licensed and optional. The existing AnChain data MCP is AGPL-3.0; it will not be relabeled or incorporated into Apache-2.0 components without compatible rights. [4] This proposal document follows the repository's CC0-1.0 dedication.

## Milestones and Deliverables

Dates below are proposed commitments relative to the approved start date. Every payment follows committee acceptance.

| Milestone | Target | CC | Deliverables and ecosystem acceptance evidence |
| --- | --- | ---: | --- |
| M1: Scoped source and evidence model | Week 4 | 200,000 | Public architecture, threat model, supported-version/event inventory, working read-only source path, schema and multi-party fixtures. One developer outside AnChain completes a documented source-to-case walkthrough and confirms the proposed interface addresses its review needs. Publish feedback and agreed scope; no partner commitment is claimed today. |
| M2: Independently usable reference workflow | Week 10 | 400,000 | Policy engine, local reference provider, SDK/CLI/MCP, both examples, deployment guide and privacy tests. An independent operator deploys the public workflow on local/DevNet data without a proprietary account, reproduces seeded signals, and demonstrates denied cross-party queries and selective export. Publish limitations and results. |
| M3: Reviewed release and first live adoption | Week 16 | 500,000 | Versioned release, optional Insights/intelligence adapter and a scoped independent security review. One independent organization uses the funded public components with authorized MainNet records in an actual fraud/AML review workflow and confirms a resulting case or alert was reviewed. Resolve all critical/high findings within the agreed authorization, agent-tool and disclosure review scope before acceptance. |
| M4: Repeat adoption and operational handover | Week 24 | 500,000 | At least two independent organizations in total use the public components with authorized MainNet records. Each evidences use during at least 30 consecutive days, with at least two dated review sessions or case dispositions during that period. Deliver operator feedback, measured coverage/error/latency results, maintenance records and a handover session. |
| **Total** | **24 weeks** | **1,600,000** | **M3/M4 account for 62.5% of requested funding and require live adoption.** |

## Acceptance Criteria

Adopters are separate end-user organizations outside AnChain.AI; subsidiaries of the same parent count once per milestone. Use through an integrating application qualifies only when the end-user organization confirms actual use of the funded public components. Demonstrations, registrations, artificial traffic and AnChain's own deployments do not count as live adoption.

Acceptance evidence includes release identifiers, reproducible demonstrations, operator/recipient confirmations and scoped usage or case records. Customer data and identities may be reviewed privately by the committee with a public aggregate summary. Synthetic fixtures are clearly labeled and cannot satisfy MainNet adoption criteria.

Functional gates also require multi-party isolation tests, denied out-of-scope agent requests, stale/missing-input behavior, source-linked cases and repeatable deterministic policy decisions. Publish a reviewer-agreed evaluation set and per-rule false-positive/false-negative and coverage results; no unmeasured fraud-detection accuracy is promised. Unmet criteria require committee-approved changes or remain unpaid.

## Funding

**Total request: 1,600,000 CC**, fixed in CC and paid by the milestone table. No award or payment is assumed.

The proposed cost allocation is 1,200,000 CC for eight person-months of Canton-specific engineering/integration and evaluation (150,000 CC average per person-month), 200,000 CC for additional QA and independent security review, 100,000 CC for technical documentation and onboarding, and 100,000 CC for development infrastructure and test operations. This cost view totals the same request; it is not additional to the milestone payments. The allocation assumes reuse of existing product experience and published Canton interfaces. Named staffing and reviewer selection will be agreed before project start.

Scope and accounting will separate Canton deliverables from existing Insights development and other ecosystem grants or applications. No duplicate reimbursement will be sought for shared platform work, previously funded deliverables or overlapping personnel time.

### Volatility Stipulation

The planned duration is under six months and the request is fixed in CC, without a guaranteed USD value. If committee-requested scope changes extend the project beyond six months, remaining milestones must be renegotiated for significant USD/CC volatility under the program rules. Other material scope, timing or payment changes require documented committee agreement.

## Maintenance and Distribution

AnChain.AI will own release maintenance and security triage during the grant and for 90 days after final acceptance at its own cost. Publish dependency updates, supported versions, issue triage, configuration/restore instructions and security-contact details. The open license, deployment documentation and release artifacts allow another maintainer to continue the public components. Further feature work or a longer funded support term requires a separate agreement.

Recruit operators through the relevant Canton SIG and developer channels and AnChain's existing investigator/developer audience. M1 validates demand; M2 removes deployment barriers; M3/M4 reserve most funding for actual use. Pilot recruitment is a delivery risk: no Canton customers, endorsements or usage counts are claimed. Failure to recruit adopters does not satisfy adoption milestones.

## Co-Marketing

Offer a joint release announcement subject to Foundation agreement, a technical walkthrough and one case study with the adopter's consent. We request champion/SIG introductions and technical feedback; we do not assume Foundation endorsement or guaranteed distribution.

## Motivation and Rationale

Insights already provides AI-assisted blockchain investigations, tracing, risk assessment and reports. [5] AnChain.AI was founded in 2018 and brings AI, cybersecurity and blockchain-investigation experience; Victor Fang will coordinate the proposed work. [6] Canton requires a new integration and privacy-specific validation, which this request funds explicitly.

Building public source adapters, evidence contracts and deterministic review tools lets multiple applications use the same workflow while choosing their intelligence and agent providers. A required hosted subscription would limit that shared benefit. Extending published Canton interfaces and interoperating with existing indexers keeps the scope focused. Initial adoption targets are two independent organizations; we do not estimate an unsupported percentage of the Canton ecosystem.

AI assistance was used for research and preparation of this proposal.

## References

1. [Canton Foundation roadmap, RFP 27](https://github.com/canton-foundation/canton-dev-fund/blob/main/2026-2028-strategic-roadmap.md), [program](https://canton.foundation/grants-program/), [review process](https://github.com/canton-foundation/canton-dev-fund/blob/main/Development%20Fund%20Proposal%20Review%20Process.md), and [CIP-0100](https://github.com/canton-foundation/cips/blob/main/cip-0100/cip-0100.md).
2. [Canton privacy model](https://docs.canton.network/appdev/deep-dives/privacy-model).
3. [Noves indexing/audit evidence proposal #949](https://github.com/canton-foundation/canton-dev-fund/pull/949), a pending proposal rather than an assumed available dependency.
4. [AnChain data MCP and its existing license](https://github.com/AnChainAI/anchain-data-mcp).
5. [Insights product](https://www.anchain.ai/insights) and [application](https://insights.anchainai.com/). Product descriptions are not evidence of current Canton support.
6. [AnChain.AI company](https://www.anchain.ai/company), [company LinkedIn](https://www.linkedin.com/company/anchainai/), [Victor Fang](https://www.linkedin.com/in/drvictorfang).
