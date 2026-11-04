# Noves Canton Indexing and Audit Evidence

*Development Fund Proposal*

**Organization:** Noves

**Author and primary contact:** Ben Roy

**Status:** Submitted

**Created:** 2 November 2026

**Revised:** 3 November 2026

**Proposal type:** RFP aligned

**Label:** regulatory-compliance

**RFP and roadmap area:** RFP 20 Indexers and RFP 27 Security Monitoring, Auditability and Evidence. [1]

**Champion:** Noves

**Total funding request:** 3,500,000 CC, comprising 3,000,000 CC for delivery and adoption plus 500,000 CC for 12 months of maintenance. Adoption milestones total 1,750,000 CC, or 50% of the entire request.

**Project duration:** 6 months for development, followed by up to 6 months for adoption milestones. Maintenance runs for 12 months from M2 acceptance.

## Abstract

Noves proposes an independently usable public toolkit that turns authorized Canton activity into understandable, traceable records for applications and authorized reviewers, including auditors and finance teams. It combines ingestion and indexing with activity normalization, coverage checks, access and configuration history, monitoring, and portable evidence verification. These components share source references and access scope so a reported result can be traced to the records and processing that produced it.

The project builds on existing Noves infrastructure and makes its ingestion, indexing, normalization, monitoring, and evidence capabilities available through a public release with documented interfaces. Application teams and service providers can integrate these components into their own workflows. Half of the funding request depends on production adoption and continued use.

## RFP alignment and scope

| RFP objective | Funded response |
| --- | --- |
| RFP 20 data visibility | An authorized participant data path, indexed and normalized activity and state records, query and export interfaces, and source-coverage indicators. |
| RFP 20 privacy and source resilience | Party-scoped authorized source access, revocable credentials, and documented source requirements. |
| RFP 27 security monitoring | Audit records and alerts for defined ingestion, access, configuration, and evidence-integrity conditions. |
| RFP 27 auditability and evidence | Source provenance, selective evidence exports, integrity manifests, and a standalone verifier. |

The toolkit monitors an organization’s authorized Canton activity. Its source path, normalization coverage, supported versions, log inputs, and alert rules will be specified in the approved deliverable schedule. The indexing and evidence functions preserve the source access and disclosure boundaries described in RFPs 20 and 27. [1] The funded workflow uses authorized participant data and does not depend on publicly exposed involved-party metadata from Mediator messages.

## Existing foundation and relevant experience

### Customer outcomes

Multiple Canton application teams use Noves data products as part of their financial workflows, along with a 3rd party accounting platform for closing customer books. These relationships demonstrate demand for interpretable source data and provide potential adoption routes.

### Operational and distribution experience

Noves has experience interpreting blockchain activity, delivering reporting and accounting-data exports, and operating infrastructure alongside customer Canton validators. Existing ingestion, storage, activity normalization, query, and permission-aware processing provide a starting point. This request credits that reuse and funds the incremental public release and capabilities described here.

### Foundation and ecosystem contributions

Noves operates a public Canton data dashboard, performs on-demand calculations for the Foundation and committees, and provides Featured App compliance tracking. These activities inform the proposed reporting, source-coverage, and evidence interfaces.

## Specification

### Authorized source access and indexing

Provide one complete supported reference ingestion path through the Ledger API or PQS. Consume authorized participant updates and relevant holding state with read-only credentials, resumable checkpoints, and duplicate-safe processing. Initial coverage centers on Canton Coin transfers, rewards, fees, and holding-state activity. The approved deliverable schedule will enumerate the supported event types, asset and package identifiers, and Canton and Splice versions.

### Activity normalization and source records

The normalization layer converts supported Canton source activity into documented technical records, including activity classifications, party roles, assets, quantities, fees, and source context. Schema documentation distinguishes source-reported fields from derived technical interpretation and identifies the applicable transformation versions. Party roles identify whether an authorized party observed or participated in the activity.

Preserve stable source-linked record identifiers, party and asset or package identifiers, exact quantities, source timestamps, checkpoints, and schema and transformation versions. Document event versus state records, duplicate and replay behavior, and how corrected or reprocessed outputs are identified.

### Application interfaces and repeatable outputs

Provide documented query and export interfaces plus a minimal user interface for operators and authorized reviewers for event search, provenance, coverage, alerts, and evidence history. Query and export examples identify the source checkpoint or snapshot, party scope, filters, schema and transformation versions, and known coverage limits associated with the returned record set. Document how event history relates to holding state and which historical views the supported source can provide.

Applications can consume these interfaces and retain source-record or evidence references with their own outputs. Public examples will demonstrate integration with a simple consumer and show how to reproduce results using the documented dataset scope and versions.

### Coverage and data quality checks

Detect stale ingestion, processing failures, duplicate records, unavailable source history, unsupported schemas, and consistency issues that the supported source can establish. Display coverage and unresolved conditions with the affected records or outputs. Checks follow the source API, checkpoint, and party-filter semantics. Coverage status describes the authorized data available for the requested scope and period.

### Access records and monitoring

Record the toolkit's access decisions, authentication failures, configuration and permission changes, exports, and administrative actions. Use the same access scope and source or output references to connect these records to the indexed data and evidence they affect. Include a standard event format for application-provided logs. Configured rules identify ingestion failures, access failures, material configuration changes, and evidence-integrity mismatches, with alerts in the operator view and through one generic output interface.

The monitoring guide maps each rule to the authorized source events or application logs it uses, including logs for application-side events such as rejected actions and access attempts.

### Portable evidence and verification

Export a selected record set with source references, schema and transformation versions, extraction scope, coverage information, relevant audit history, and an integrity manifest (a file list with checksums). Document stable references that consuming applications can retain with their own reports or records. The package and its verification reference can be retained independently of the application or temporary export job that produced them. A standalone verifier checks package consistency against a digest or signature reference retained separately by the intended recipient. Document the trust model, reference-distribution procedure, and which records the verifier checks.

### Public deployment and supported interfaces

Provide the required code, schemas, sample configuration, containerized deployment, operator documentation, and verification examples. The approved compatibility matrix will define supported versions and interfaces. A qualified technical reviewer outside the delivery team, selected in agreement with the committee, will review party-access boundaries and the evidence-verification mechanism. Critical and high-severity findings within that scope will be remediated before M2 acceptance.

## Licensing

The approved software components, including pre-existing Noves code incorporated into them, will be released under Apache 2.0. The public release will provide the code, schemas, documentation, and deployment tooling needed to operate the complete funded workflow independently. Required Noves functionality will be released or supplied through a documented open alternative; third-party dependencies retain their respective licenses.

## Milestones and deliverables

M1 and M2 allocate 1,250,000 CC to technical delivery and public release. M3 and M4 allocate 1,750,000 CC to production adoption and continued use, or 50% of the entire request. A separate 500,000 CC covers 12 months of maintenance.

**Proposed schedule:** Month 1 begins on the project start date agreed with the committee as part of grant approval. The milestone targets below are relative to the agreed start date. Milestones may be accepted earlier when their acceptance criteria are met.

### M1 Ingestion and normalization interfaces

**Proposed target completion:** end of Month 3.

**Deliverables:** A supported reference ingestion path; a source and normalization coverage inventory; read-only access configuration; resumable checkpoints and duplicate-safe processing; normalized activity records with stable identifiers, provenance, and revision semantics; documented query and export interfaces; coverage and data-quality indicators; and a minimal user interface for operators and authorized reviewers.

**Acceptance evidence:** Public code is demonstrated against a representative authorized MainNet dataset within the published coverage. The demonstration covers party scope and roles, activity normalization, resume and replay behavior, identification of corrected or reprocessed records, and visible handling of unavailable history. Published interfaces and a consumer example allow the committee to trace outputs to source records and reproduce selected queries under the documented checkpoint or snapshot, filters, versions, and coverage limits.

### M2 Monitoring and evidence toolkit release

**Proposed target completion:** end of Month 6.

**Deliverables:** Access, configuration, administrative, and export records connected to the relevant source or output; one structured log-input format; defined alert rules and one generic alert-output interface; the evidence-package schema, integrity manifest, trusted-reference procedure, and standalone verifier; documentation for selective disclosure and downstream evidence references; and the complete public toolkit with deployment materials, operator guide, compatibility matrix, and scoped access-boundary and verification review.

**Acceptance evidence:** Published code and controlled scenarios demonstrate party-access boundaries, audit records, and configured alerts. A package built from authorized MainNet records is verified independently of a running Noves service or the originating export job. Tests detect altered records against a separately retained reference and explicitly report missing source history or missing inputs needed for verification. A team outside Noves can deploy and operate the complete funded workflow using the public code and deployment documentation. The agreed technical reviewer tests evidence verification; critical and high-severity findings from the scoped review are remediated and the report is published.

### M3 Initial production adoption

**Proposed target completion:** end of Month 9.

**Deliverables:** Onboarding support, practical examples, and an adoption report for the funded public toolkit.

**Acceptance evidence:** At least three independent end-customer organizations demonstrate qualifying use of the public release with real MainNet activity by using its outputs for financial reporting, operational checks, security alerts, or audit evidence. At least one evidence package is successfully checked by its intended recipient using the standalone verifier.

### M4 Expanded adoption and continued use

**Proposed target completion:** end of Month 12. This includes three consecutive calendar months of qualifying use before acceptance; qualifying use completed earlier may also count.

**Deliverables:** Continued onboarding, consenting case studies, and a report covering actual workflows, repeat use, exports, and deployment models.

**Acceptance evidence:** At least ten independent end-customer organizations demonstrate qualifying production use. At least three of those organizations demonstrate qualifying use in each of three consecutive calendar months. The total is cumulative and may include M3 adopters.

## Adoption and acceptance rules

- Qualifying adoption requires actual use of the funded public components with authorized MainNet activity and use of their outputs for financial reporting, operational checks, security alerts, or audit evidence.

- Use may be direct or through any application integrating the funded components. Adoption is counted by the independent end-customer organization whose data is processed and whose workflow uses the outputs. Existing and new end customers may qualify.

- Evidence may include software-version and usage records, query or report outputs, evidence packages, and operator or recipient confirmation. Confidential evidence may be reviewed privately by the Foundation with a public summary that protects customer information.

- Each end-customer organization counts once within a milestone and may count at successive adoption milestones when it meets the conditions. The committee may approve proportionate payment for partial achievement of M3 or M4.

## Annual maintenance

The annual term is 12 months from M2 acceptance. Software maintenance totals 500,000 CC, paid in four quarterly installments of 125,000 CC under the agreed maintenance schedule. It covers the funded components, supported interfaces and versions, prioritized fixes, security triage and remediation under the agreed schedule, dependency updates, current deployment materials, documentation, and issue handling. Quarterly acceptance is based solely on delivery of the agreed maintenance work, evidenced by release, issue, compatibility, and maintenance records.

The installments form one annual maintenance allocation under the agreed payment and approval schedule. Renewals and additional work require a separate agreement.

## Funding

**Total request:** 3,500,000 CC. The proposed allocation includes 3,000,000 CC for delivery and adoption and 500,000 CC for 12 months of maintenance. The estimate reflects the specified deliverables and reuse of existing Noves capabilities.

### Milestone payments

| Milestone | Requested CC | Payment type | Acceptance focus |
| --- | --- | --- | --- |
| M1 Ingestion and normalization interfaces | 500,000 | Delivery | Authorized source path, normalized records, provenance, repeatable queries, and coverage |
| M2 Monitoring and evidence release | 750,000 | Delivery | Audit records, alerts, evidence verification, deployment, and review |
| M3 Initial adoption | 750,000 | Adoption | 3 end-customer organizations; recipient verifies evidence |
| M4 Expanded adoption and continued use | 1,000,000 | Adoption | 10 end-customer organizations; at least 3 use in each of 3 consecutive months |
| Delivery and adoption total | 3,000,000 |  | M1 through M4 |

### Maintenance payments

| Annual component | Annual CC | Quarterly CC | Payment condition |
| --- | --- | --- | --- |
| Software maintenance | 500,000 | 125,000 | Accepted maintenance of funded components |

Adoption-dependent payments total 750,000 + 1,000,000 = 1,750,000 CC, exactly 50% of the 3,500,000 CC request. Technical delivery and maintenance total the other 1,750,000 CC. Adoption is assessed through M3 and M4.

### Budget basis

The estimate credits existing ingestion, normalization, and data-processing foundations. It funds the work to define and release reusable components, publish independently usable interfaces, implement the monitoring and evidence functions, validate access and integrity controls, and support the released software. Adoption payments recognize delivery investment and the demonstrated value of the released software.

### Volatility and changes

Funding is denominated in fixed Canton Coin. At the six-month mark from the agreed project start date, the committee and Noves will review outstanding adoption and maintenance payments for significant USD/CC price changes. Any adjustment requires committee approval. Committee-approved scope or schedule changes will be documented in the grant terms. [2][3]

## Co-marketing and ecosystem value

Noves proposes a coordinated public-release announcement, practical documentation, an operator or application-team working session, and consenting adoption examples. Foundation communications may promote the toolkit and the Noves team. The intended result is reusable access to normalized Canton activity and source evidence that applications and service providers can integrate into their own products and workflows.

## Program references

[1] Canton Foundation Development Fund Roadmap and Requests for Proposals, RFP 20 and RFP 27.

<https://github.com/canton-foundation/canton-dev-fund/blob/main/2026-2028-strategic-roadmap.md>

[2] Canton Foundation Development Fund Proposal Template.

<https://github.com/canton-foundation/canton-dev-fund/blob/main/proposals/_template.md>

[3] Canton Development Fund Program Guidance.

<https://github.com/canton-foundation/canton-dev-fund/blob/main/README.md>
