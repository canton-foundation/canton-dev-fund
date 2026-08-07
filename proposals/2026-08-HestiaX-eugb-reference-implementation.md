## Development Fund Proposal: EuGB-on-Canton, an Open-Source Reference Implementation of European Green Bond Workflows

| Field | Value |
| :---- | :---- |
| Author | OleksandrZeziulinskyi |
| Org | HestiaX Ltd |
| Status | Draft |
| Created | 2026-08-07 |
| Label | `regulatory-compliance` |
| Review routing | Primary SIG: Regulatory Compliance (`regulatory-compliance`); technical co-review: Token Standards / Asset Standards (`token-asset-standards`) and Financial Workflows & Composability (`financial-workflows-composability`) |
| Champion | Needs Champion |

---

## Abstract

The European Green Deal Investment Plan set out to mobilise at least EUR 1 trillion of sustainable investment over the decade, and most of that is raised in capital markets: Europe issued about USD 256 billion of green bonds in the first three quarters of 2025, roughly 55% of global volume. Regulation (EU) 2023/2631 governs how such a bond proves its claim. Its voluntary European Green Bond designation requires proceeds to be allocated in full to EU Taxonomy-aligned activities, subject to a limited derogation of up to 15%, together with a pre-issuance factsheet subject to independent review, allocation reporting until proceeds are fully allocated, and an impact report. That evidence and reporting layer, rather than the tokenization, is what an institution has to satisfy, and it is the label under which this asset class is now bought.

On Canton Network's own published figures (January 2025), Canton-connected platforms have been responsible for 57.5% of digital bond issuance by value since 2022. Those transactions tokenized the instrument. None of them published an open implementation of the disclosure-evidence layer that Regulation (EU) 2023/2631 now requires of every European Green Bond. A keyword and repository review for this proposal, did not identify a maintained, open-source, conformance-tested implementation of that lifecycle, so a team evaluating Canton for an EU Green Bond workflow starts from a blank page, privately re-solving the legal document lifecycle, multi-party authorization and privacy, Java integration, evidence-to-instrument linkage and conformance evidence before formal review can begin.

The regime is live and supervised: the European Commission reported more than 30 issuances totalling about EUR 30 billion since the standard became available in December 2024, and external reviewers are now registered on and supervised through ESMA's register. The external reviewer is the pivot of that lifecycle: the Regulation requires an independent, supervised conclusion the issuer cannot author or alter, and a Daml signatory makes that unforgeability a property of the contract rather than a promise about a process. The reusable asset is that pattern, which fits any regulated workflow with named documents, attesting roles, statutory deadlines and an independent reviewer; EuGB is the proving instance because it is the most exactly specified of them.

This grant delivers the missing public artifact: an Apache-2.0 reference implementation of the complete EuGB evidence lifecycle on Canton, comprising ledger-neutral schemas, importable Daml packages, a Java/gRPC integration path with a PostgreSQL/PQS read model, a generated TypeScript client with a scripted walkthrough, Token Standard V2 instrument linkage, and an open conformance suite in which every Daml choice carries a negative authorization test. All of it is executable end to end with no HestiaX service involved. Canton is built for exactly this: independent institutions acting under their own authority, confidential evidence with selective disclosure, and attributable approvals enforced by the ledger rather than by application code.

The output is public infrastructure: every deliverable is reusable by any Canton participant and independently runnable. The software models evidence, authorization and workflow state; it never declares legal compliance and performs no regulated investment service. Throughout this proposal and in the released artifacts, "conformance" means conformance to the reference implementation's own published specification, never to Regulation (EU) 2023/2631.

HestiaX Ltd, an approved Canton MainNet validator operator, is the applicant and grantee. Its two founders, senior engineers Oleksandr Zeziulinskyi and Sergii Dotsenko, deliver the funded scope full time over six months: 12.0 engineer-months. The request is up to 2,000,000 CC: 1,800,000 CC to HestiaX for engineering, plus a ring-fenced independent-review budget of up to 200,000 CC released against a Committee-approved quote and spent only on the reviewers, with no HestiaX co-funding of the six-month scope. Success is measured by external ecosystem use: 300,000 CC of the final milestone is payable only on verified reproduction and evaluation by organizations unaffiliated with HestiaX.

---

## Specification

### 1. Objective

Deliver one public, Apache-2.0 reference stack with which a Canton application can represent, validate, exchange and audit the disclosure-evidence lifecycle of a non-securitisation corporate or project-finance European Green Bond, executable without any HestiaX infrastructure, and thereby reduce the cost, risk and elapsed time of institutional Canton evaluations for regulated capital-markets workflows.

On release, an unaffiliated team can clone and build from documented commands, run the EuGB conformance profile, execute the issuer, administrator and external-reviewer workflows through the Java/gRPC path, query state through the PQS/PostgreSQL read model, use the TypeScript client and walkthrough, link exact evidence versions to a synthetic Token Standard instrument, and verify that confidential evidence is visible only to authorized parties.

Version 1 excludes sovereign-specific workflows, securitisation, prospectus production, legal opinions, underwriting, KYC/AML, placement, distribution, custody, production payment rails and SPV structuring.

### 2. Implementation Mechanics

One public monorepo:

```text
spec/            normative schemas, field dictionary, canonicalization
regulatory/      source inventory and regulation-to-control profile
daml/            core, evidence, taxonomy, review, allocation, impact,
                 programme, reference-instrument and conformance packages
sdk/java/        generated bindings, domain and command client
services/        Java reference API and CLI
sdk/typescript/  generated OpenAPI client
apps/            scripted evaluation walkthrough
conformance/     synthetic fixtures and expected results
infra/           reproducible local environment, optional network profile
docs/            architecture, privacy, operations, upgrade guides, ADRs
```

Architecture decisions of record at the proposal date, published with the repository and revisable with written notice to the Committee:

- Daml is the authoritative authorization and workflow layer.
- Source documents stay off-ledger. Digests, provenance and workflow evidence go on-ledger.
- Java/gRPC is the reference command path. PQS/PostgreSQL is a reference query projection, never an authorization source.
- One hand-authored OpenAPI contract generates both the Java server and the TypeScript client.
- Approved Canton Token Standard V2 (CIP-0112) is the primary token boundary, with a documented CIP-0056 V1 compatibility scenario.
- Daml Finance is not a version 1 dependency.
- Toolchain, DAR and package versions are pinned against measured artifacts.
- The software never exposes a legal-oracle field such as `isLegallyCompliant`.
- Every scoped deterministic control and authorization rule carries positive and negative conformance evidence.

All released artifacts, including specifications, the regulation-to-control mapping and documentation, are licensed Apache-2.0 and ship with a published no-reliance notice stating that the mapping is an engineering artifact and not legal advice, that the official text of Regulation (EU) 2023/2631 governs, and that Canton, Daml and Splice are marks of their respective owners used nominatively.

**Implementation status, in plain terms.** HestiaX has completed substantial preparatory architecture and regulatory-mapping work at its own cost: the domain model, party and authorization design, package boundaries, the off-ledger/on-ledger split, the API surface, a regulation-to-control mapping, and a catalogue of more than 140 planned conformance scenarios covering positive, boundary, negative, privacy and upgrade behaviour. That material has passed its documented internal consistency checks. No application code has been generated, compiled, integrated or executed yet: Milestone 1 converts the design into a validated executable baseline by closing the remaining interface decisions, generating the bootstrap artifacts (schemas, field dictionary, API contract, control matrix, toolchain locks), compiling the initial packages, and passing the first authorization and privacy tests before broader implementation proceeds.

Each participant acts through its own Canton party and sees only its slice: the issuer compiles the factsheet from project-level evidence; the external reviewer receives a scoped grant to the exact document version and signs a conclusion the issuer cannot author or alter; reporting runs deterministically on the Regulation's statutory clocks (270-day allocation-report publication, the guaranteed minimum of 90 days for the external reviewer inside that period, 30-day ESMA notification, 60-day CapEx assessment); corrections and supersessions preserve every prior version. The conformance suite proves both directions: authorized transitions succeed, and unauthorized or out-of-window actions fail attributably.

### 3. Architectural Alignment

**App Building and Developer Experience:** importable Daml packages for a regulated multi-party workflow; interoperability through the approved Canton Token Standard; Java and TypeScript paths generated from one contract; reusable conformance fixtures; public documentation and worked examples.

**Security and Resilience:** attributable, tamper-evident workflow evidence with authorization enforced on-ledger; explicit unrelated-party non-disclosure tests; a published independent review; pinned versions, signed releases and reproducible builds.

The evidence packages carry no Token Standard dependency, so the evidence lifecycle is reusable with a different instrument implementation. The project re-implements no token primitives and replaces no existing Canton component.

### 4. Backward Compatibility

New packages only. Schemas and package names follow semantic versioning; CI runs Daml upgrade checks against prior released DARs; breaking data-model changes require a migration note or a new package name. Token Standard V2 is the primary target; V1 compatibility is a documented scenario, with token dependencies isolated in the reference-instrument package.

---

## Milestones and Deliverables

Six months from grant commencement; four milestones at 1.5-month intervals; both engineers full time throughout (1.5 engineer-months each per milestone; 3.0 per milestone; 12.0 total). Delivery acceptance evidence supports each engineering payment on Committee acceptance, and external evaluation evidence gates only the 300,000 CC adoption component of Milestone 4. Estimated delivery dates in the milestone tables are engineering estimates rather than contract deadlines: payment follows Committee acceptance of the specified deliverables, and a milestone accepted later than its estimated date is not a breach and does not reduce its payment. Milestone payments are released within 30 calendar days of Committee acceptance. Where a milestone's acceptance evidence requires an act by a party outside HestiaX's control, HestiaX delivers the artifact and remediates confirmed findings; if that party does not act within 30 calendar days of a complete submission, the Committee determines acceptance on the evidence then available.

**Go/no-go and ordered descope.** Milestone 1 closes with an explicit architecture and toolchain go/no-go, recorded with the Committee, before broader application work proceeds. The non-negotiable core is never descoped: the complete scoped EuGB evidence lifecycle, Daml authorization and privacy correctness, the Java/gRPC command path, reproducible local and CI execution, pinned Token Standard interoperability, conformance evidence and documentation. Under schedule pressure, optional items are removed in this fixed order, each with written notice to the Committee: first the optional shared-network execution report; then the scripted evaluation walkthrough; then the documented Token Standard V1 compatibility scenario; then the generated TypeScript client. Optional items proceed only after the core vertical slice and the authorization and privacy tests pass. If the Milestone 1 go/no-go concludes that the architecture or toolchain cannot support the scoped lifecycle, HestiaX reports that to the Committee with the evidence, and the Committee determines whether to revise the scope, pause the grant or close it, with unreleased milestone amounts returning to the Fund.

### Milestone 1: Deterministic baseline and runnable vertical slice

| Field | Value |
|---|---|
| Estimated delivery | End of month 1.5 |
| Ecosystem value | Public, consumable artifacts plus a running first workflow: the earliest point at which outside engineers can inspect real code |
| Effort | Oleksandr 1.5 + Sergii 1.5 = 3.0 engineer-months |
| Deliverables | Public repository with reproducible build and CI; JSON schemas, field dictionary and canonicalization rules (RFC 8785 + SHA-256) with cross-language golden fixtures; hand-authored OpenAPI contract; regulation-to-control matrix; exact toolchain and package locks; core and evidence Daml packages; runnable issuer-to-reviewer vertical slice |
| Engineering payment | 450,000 CC |
| Delivery acceptance evidence | Architecture and toolchain go/no-go recorded; the build and vertical slice reproduce from documentation alone on a clean machine in public CI, and HestiaX offers the same reproduction to an unaffiliated or Committee-designated engineer, whose availability does not gate acceptance; published schemas and fixtures are consumable as released artifacts; no unpinned mandatory dependency |
| External evaluation step | Candidate evaluator categories and the objective evidence form for each Milestone 4 adoption outcome identified and shared with the Committee |
| Dependencies / descope | No third-party engineering dependency; acceptance evidence is produced in public CI |

### Milestone 2: Core EuGB workflow and Java institutional integration

| Field | Value |
|---|---|
| Estimated delivery | End of month 3 |
| Ecosystem value | Complete evidence lifecycle plus the primary institutional integration path via familiar Java, gRPC and PostgreSQL surfaces |
| Effort | Oleksandr 1.5 + Sergii 1.5 = 3.0 engineer-months |
| Deliverables | Taxonomy-assessment, review, allocation, impact and programme Daml packages; publication and notification evidence; Java bindings, command client, reference API and CLI; PQS/PostgreSQL projections and migrations; positive, boundary, negative and privacy fixtures; complete local end-to-end scenario in CI |
| Engineering payment | 450,000 CC |
| Delivery acceptance evidence | Every Daml choice in the funded packages has an authorization-negative test; every confidential object in the funded packages has an unrelated-party non-disclosure test; no private document, bearer token or secret on-ledger; the end-to-end scenario runs in CI; a CI check fails the build on any uncovered choice or object and on any secret detected in on-ledger payloads |
| External evaluation step | Reviewer candidates for both assurance tracks (proposed at the end of Milestone 1) engaged under the Committee-approved mechanism |
| Dependencies / descope | No third-party engineering dependency; acceptance evidence is produced in public CI |

### Milestone 3: Token Standard interoperability, conformance and independent review

| Field | Value |
|---|---|
| Estimated delivery | End of month 4.5 |
| Ecosystem value | Instrument-to-evidence linkage on the approved standard plus published third-party assurance |
| Effort | Oleksandr 1.5 + Sergii 1.5 = 3.0 engineer-months |
| Deliverables | Synthetic reference instrument on Token Standard V2; documented V1 compatibility scenario with package/version report; TypeScript client and scripted evaluation walkthrough; cross-language canonical-hash identity tests; full conformance suite green against the published scenario catalogue; independent review (both tracks) completed and published; optional shared-network execution report where sponsor access exists |
| Engineering payment | 450,000 CC |
| Delivery acceptance evidence | Reference instrument linked to exact factsheet and review versions; Token Standard transfer scenarios pass; token holders gain no visibility into confidential evidence; no unresolved Critical or High security finding and no material unresolved mapping defect |
| External evaluation step | Committee acceptance of the Milestone 4 evaluator categories and evidence standard (or the Committee-approved equivalent) recorded before Milestone 4 begins |
| Dependencies / descope | Reviewers engaged under the Committee-approved mechanism; Token Standard pins bind to the Splice release current at Milestone 1 (an upgrade is a planned lock regeneration, not a scope change); the shared-network report is optional, never load-bearing |

### Milestone 4: v1.0 release, external validation and handover

| Field | Value |
|---|---|
| Estimated delivery | End of month 6 |
| Ecosystem value | A maintained, signed v1.0 that an institution can cite in an internal evaluation, with adoption demonstrated by organizations unaffiliated with HestiaX |
| Effort | Oleksandr 1.5 + Sergii 1.5 = 3.0 engineer-months |
| Deliverables | Signed `v1.0.0` with SBOM and checksums; architecture, privacy, operations, integration and upgrade guides; final conformance report; maintenance and vulnerability-disclosure policy; adoption evidence packets |
| Engineering payment | 450,000 CC: 150,000 CC delivery component; 300,000 CC adoption-contingent (two independently verifiable outcomes × 150,000 CC, defined under Funding) |
| Delivery acceptance evidence | Signed release; a Committee-designated engineer independently executes the conformance run against the released version; independent reproduction without HestiaX infrastructure; all funded artifacts under Apache-2.0 |
| External evaluation step | The two adoption outcomes defined under Funding, determined by the Committee within the agreed 30-day evidence-review window |
| Dependencies / descope | Committee determination of adoption evidence against the pre-agreed standard |

---

## Acceptance Criteria

The Fund's review process states that "adoption should be the primary indicator of success"; these criteria combine technical delivery with ecosystem value, and each names its evidence:

1. **Public good:** no deliverable requires a HestiaX service, party, endpoint, API, licence or commercial relationship; the release, including specifications, the regulatory mapping and all documentation, is Apache-2.0 in its entirety.
2. **Regulatory fidelity:** evidence and attributable judgment only, with no software-generated legal-compliance assertion anywhere in the schema or API surface; 100% of published conformance scenarios, including boundary scenarios (day-270, day-60, the 15% flexibility ceiling), produce their expected result in CI. No conformance result, report or artifact is evidence that any bond, issuer or programme satisfies the Regulation, and every published conformance report carries that statement.
3. **Independent reproducibility:** an unaffiliated engineer reproduces the build and the full local end-to-end scenario from documentation alone; the documented path targets completion within one working day, and the published report records actual elapsed time.
4. **Authorization and privacy:** every Daml choice in the funded packages has a passing authorization-negative test; every confidential object in the funded packages has a passing unrelated-party non-disclosure test; both are enforced by a CI check published with each release.
5. **Interoperability:** the reference instrument uses approved Token Standard V2 interfaces, with the documented V1 compatibility scenario.
6. **Institutional integration:** the Java path executes the complete workflow; the PQS read model exposes offset-aware, auditable projections; one OpenAPI contract drives both generated clients.
7. **External adoption:** the two Milestone 4 outcomes are verified technical reuse or reproduction by an unaffiliated organization, and a completed institutional-domain evaluation, each evidenced under the Committee-agreed standard. Stars, downloads, page views and testimonial quotes are not evidence.
8. **Maintainability and assurance:** pinned versions, upgrade checks, signed release, SBOM, security-disclosure policy, the published two-track independent review with no unresolved Critical or High finding and no material unresolved mapping defect, and a published maintenance and vulnerability-disclosure policy.

### Public-good boundary

| Grant-funded public infrastructure (Apache-2.0) | HestiaX commercial activity (not funded, not required) |
|---|---|
| EuGB schemas, identifiers, canonicalization rules | Origination, structuring and advisory services |
| Daml evidence packages and reviewer workflow | Hosted issuance, administration or custody services |
| Conformance fixtures and scenario catalogue | Project pipeline and counterparty relationships |
| Java reference integration, OpenAPI contract, TypeScript client | Commercial SLAs and production operations |
| Documentation, walkthrough and release artifacts | Any hosted API, party or endpoint |

---

## Funding

### Total funding request

**Up to 2,000,000 CC:** 1,800,000 CC to HestiaX for engineering, plus a ring-fenced independent-review budget of up to 200,000 CC released against a Committee-approved quote. HestiaX engineering compensation is 1,800,000 CC; the review budget is spent only on the reviewers, is not HestiaX compensation, and is unused to the extent not spent.

HestiaX co-funding for the funded six-month scope: **0 CC / 0%.** The grant request funds the complete proposed engineering scope. HestiaX's pre-grant architecture, regulatory-mapping and validator work are sunk prior contributions at its own cost: not future co-funding, and not requested for reimbursement.

### Payment breakdown by milestone

| Milestone | Engineering payment | Of which adoption-contingent |
|---|---:|---:|
| M1: deterministic baseline and runnable vertical slice | 450,000 CC | – |
| M2: core EuGB workflow and Java institutional integration | 450,000 CC | – |
| M3: Token Standard interoperability, conformance and independent review | 450,000 CC | – |
| M4: v1.0 release, external validation and handover | 450,000 CC | 300,000 CC |
| Independent review, both tracks (ring-fenced ceiling) | up to 200,000 CC | – |
| **Total** | **up to 2,000,000 CC** | **300,000 CC** |

Engineering totals 1,800,000 CC (4 × 450,000 CC). The review ceiling is not HestiaX compensation and is unused to the extent not spent.

### Cost basis

The engineering request funds **12.0 senior engineer-months**: two named engineers, full time, six months, at a blended **150,000 CC per engineer-month** (1,800,000 ÷ 12.0). This is a budgeted, fully loaded blended cost of senior delivery capacity, not a claim about either person's net salary.

The rate is fully loaded: tooling, infrastructure and administration are included, with no separate add-on. Post-release maintenance is provided at HestiaX's own cost outside the funded scope (see Maintenance and Sustainability). At a reference price of $0.094/CC, the average of CoinGecko and CoinMarketCap on 2026-08-08, the engineering request is approximately $169,000 and the maximum total approximately $188,000. Those USD figures are context only, not a repricing right.

### Adoption-contingent component (300,000 CC)

300,000 CC, 16.7% of the engineering request and 15.0% of the maximum total request, is payable only on external adoption evidence, as two independent 150,000 CC outcomes:

1. **Canton technical reuse or reproduction.** An organization unaffiliated with HestiaX imports a funded package, executes the released conformance workflow in its own environment, or completes the full integration exercise against the tagged release, and supplies a reproducible report.
2. **Institutional-domain evaluation.** An issuer, arranger, appropriately authorized investment firm, bank or platform team, external reviewer, auditor, asset manager or comparable institutional-domain organization unaffiliated with HestiaX completes a structured technical, architecture or compliance evaluation against the tagged release and supplies a signed report identifying scope, environment, workflow and findings.

"Unaffiliated" means no shareholding, common control, employment or subcontracting relationship with HestiaX, and no commercial relationship in respect of the funded artifacts. Evidence may be public, redacted, or provided confidentially to the Committee where institutional policy prevents publication, but must be verifiable by the Committee. A meeting, marketing quote, memorandum of understanding, expression of interest, pipeline relationship, star, download or validator operation does not satisfy either outcome.

**How the adoption component is set.** Both outcomes require hands-on work by a named third party rather than a countable metric, which is a deliberately high bar and a correspondingly slow one. HestiaX has set the amount so that what is staked can be verified by the Committee rather than asserted. If the Committee prefers a larger adoption-gated share, HestiaX is willing to discuss moving further engineering value into the adoption component and broadening the qualifying outcomes accordingly.

**Proposed terms, subject to Committee agreement.** Evaluator categories and the evidence form for each outcome are identified by the end of Milestone 1 and accepted by the Committee before Milestone 4 begins. A 30-calendar-day review window applies to a complete evidence packet. Where an evaluator has done the work but cannot publish, the Committee may accept confidential evidence, approve a substitute, or extend. The adoption window runs 12 months from Milestone 4 acceptance; amounts not earned lapse to the Fund, which is not a delivery failure and does not affect prior payments.

### Independent review (up to 200,000 CC, ring-fenced, two tracks)

A provisional ceiling, not a verified cost: no quote exists yet. Because the ceiling is an estimate rather than a priced commitment, if the Committee-approved scopes and quotes for the two tracks together exceed 200,000 CC, HestiaX submits the quotes and the Committee elects one of three routes before the review begins: raise the ring-fenced amount to the approved total, narrow the approved review scope to fit the ceiling, or contract and pay the reviewers directly. HestiaX does not fund any part of the independent review from the engineering budget, and Milestone 3 acceptance is not conditioned on a review whose approved cost exceeds the funds released for it. Reviewers of this kind invoice in EUR or GBP, so each approved quote is recorded in the reviewer's invoicing currency and the released CC amount is fixed against that figure on the date the Committee approves the quote. The ceiling covers two separately identifiable assurance tracks:

1. **Security and architecture:** Daml authorization correctness, Canton privacy and disclosure boundaries, package boundaries, off-ledger/on-ledger integrity, and upgrade safety.
2. **EuGB implementation mapping:** a technical review that the implemented document fields, roles, deadlines and external-review boundaries correctly reflect Regulation (EU) 2023/2631, including the boundary that the software asserts no legal conclusion. This track is a technical implementation-mapping review, not a legal opinion, compliance certification or EuGB approval.

Reviewers must have no commercial or personnel relationship with HestiaX, with demonstrated Daml/Canton security competence for the first track and EuGB or sustainable-finance implementation competence for the second. Reviewer selection, scopes, quote approval, payee, evidence and unused-balance treatment follow the Committee-approved grant mechanism; unused amounts are simply not spent and are not paid to HestiaX. Following the mechanism the Committee has already accepted for a ring-fenced review budget, HestiaX submits each reviewer's scope and quote to the Committee for approval after Milestone 2, and the corresponding amount is released at the start of Milestone 3 so that HestiaX can engage the reviewer against approved funds. The Foundation may instead contract and pay a reviewer directly, whichever it prefers. Findings are published with the release. Severity follows CVSS v3.1 base score, with Critical at 9.0 or above and High at 7.0 or above; HestiaX has 15 working days from a confirmed finding to remediate and request re-test, or a longer period agreed with the Committee where the finding requires a change to the authorization model or the package boundaries, and time spent awaiting reviewer re-test does not count against that period. A finding is resolved once remediated and re-tested. An unresolved Critical or High security finding, or a material unresolved mapping defect, defers Milestone 3 acceptance until remediation and re-test are complete, and does not reduce or forfeit the Milestone 3 payment. Where HestiaX contests a finding or its severity, HestiaX documents the basis in writing and the Committee determines acceptance on the evidence then available, on the same rule that governs the other milestones.

### Volatility stipulation

The planned duration is six months and all amounts are fixed in CC. HestiaX accepts the CIP-0100 default that the recipient carries upside and volatility risk. If Committee-requested scope changes extend the project beyond six months, the treatment of unearned remaining amounts, including whether significant USD/CC movement requires adjustment, is agreed with the Committee before the additional work begins.

---

## Co-Marketing

On release, HestiaX will coordinate with the Foundation on a release announcement and a technical article, and will make the published walkthrough materials and external validation results available for Foundation use. Further joint activity, including live demonstrations and events, is by agreement and scheduled subject to team availability.

---

## Motivation

### Why EU Green Bonds, and why now

The European Green Deal Investment Plan set out to mobilise at least EUR 1 trillion of sustainable investment over the decade, and most of that has to be raised in capital markets. Europe issued about USD 256 billion of green bonds in the first three quarters of 2025, roughly 55% of global volume, and the segment is structural rather than niche: green bonds reached 6.9% of all EU corporate and government bond issuance in 2024, up from 5.3% in 2023.

**Why the label exists.** A market that size cannot be run on self-declared greenness. Regulation (EU) 2023/2631 answers that with the voluntary European Green Bond designation, and the bar it sets is the point: proceeds allocated in full to EU Taxonomy-aligned activities under Article 4 subject to the Article 5 derogation, a pre-issuance factsheet independently reviewed before a bond is sold, allocation reports published until proceeds are fully allocated, at least one impact report, statutory publication and notification deadlines throughout, and external reviewers supervised by ESMA. No voluntary framework before it required an independent, supervised conclusion the issuer can neither author nor alter. The label is a reporting and evidence obligation first and a marketing asset second, and it runs for the life of the bond.

**Why institutions recognize it.** More than 30 European green bonds totalling about EUR 30 billion have been issued since the standard became available in December 2024, from utilities, banks and municipalities as well as a sovereign issuer, consistently oversubscribed. For an institutional buyer, an internal risk function or an auditor, "European Green Bond" now names a known, supervised evidence package rather than a claim to be investigated one issuer at a time. That is what makes it the practical entry point for institutional adoption, and the reporting obligations are what an institution's reviewers actually examine.

**Where Canton stands.** Canton-connected platforms have been responsible for 57.5% of digital bond issuance by value since 2022 on Canton Network's own published figures, so the instrument side is well established. What those transactions tokenized was the bond. The disclosure evidence that the label consists of, the factsheet and its independent review, the allocation and impact reports, the statutory deadlines and the attribution of every judgment, stayed off the ledger inside private systems. Canton therefore has the issuance record for the instrument and no public implementation of the label attached to it, which is precisely the artifact an institution's compliance, architecture and security reviewers ask to see before an evaluation can start. The solution this proposal funds is that artifact: an open, runnable, conformance-tested implementation of the EuGB evidence lifecycle on Canton, not another tokenization demonstration.

### What exists, and what is missing

| Layer | What exists | What is missing | What this proposal contributes |
|---|---|---|---|
| Issuer and arranger know-how | Mature issuance practice, frameworks, professional reviewers | Nothing is missing here, and this proposal adds nothing to it | Software modelling the workflow those professionals already run |
| Legal text and templates | Regulation (EU) 2023/2631, Annex templates, delegated acts | An implementation-level translation into schemas, deadlines, authorization rules | Ledger-neutral schemas; deterministic deadline and threshold calculations |
| Data standards | ICMA's Bond Data Taxonomy and comparable vocabularies | The multi-party workflow: who may attest what, when, visible to whom | Daml packages enforcing attribution, authorization and privacy |
| Digital-bond platforms | Proprietary platforms, several built on Daml/Canton | Anything the open ecosystem can inspect or reuse | An Apache-2.0 reference any Canton participant can run |
| Canton infrastructure | Token Standard, Ledger API, PQS, developer tooling | A regulated-workflow reference built on them end to end | Evidence-to-instrument linkage and institutional integration paths |
| Conformance evidence | Vendor claims | Machine-checkable proof that controls behave correctly both ways | An open suite of positive and negative conformance scenarios |

### Who uses it, concretely

| Participant | Current friction | Funded artifact | Evidence of use |
|---|---|---|---|
| Issuer | The EuGB evidence trail is re-assembled manually for each mandate | Programme, evidence, allocation and impact Daml packages with statutory clocks computed | Structured evaluation report (adoption outcome 2) |
| External reviewer | Document versions move by PDF and email with live-version ambiguity | Digest-bound review workflow with scoped disclosure; the conclusion remains reviewer-authored | Reviewer walkthrough of the review workflow |
| Custodian / tokenization platform | Bespoke, per-deal linkage between instrument and disclosure evidence | Token Standard V2 evidence-linkage pattern, reused without duplicating token infrastructure | Package import or conformance execution (adoption outcome 1) |
| Canton application / infrastructure team | Regulated-workflow plumbing rebuilt per project | Apache-2.0 packages, schemas, fixtures and conformance harness | Conformance execution in the team's own environment (adoption outcome 1) |
| Taxonomy and sustainability-disclosure data consumer | Allocation and impact figures arrive as unstructured issuer documents and are re-keyed per fund | Structured allocation and impact projections carrying reviewer attribution and digest-bound provenance, queryable through the PQS read model | Package import or conformance execution against the published schemas (adoption outcome 1) |

No organization named here is committed. Before a funding vote, this proposal is materially stronger with two conditional commitments: an unaffiliated Canton team willing to reproduce or import the implementation, and an institutional-domain organization willing to conduct a structured evaluation. Neither is evidenced today, and both are pre-vote actions in the Pre-Submission Checklist. HestiaX's own pipeline and validator do not count toward the adoption criteria.

### From EuGB evidence to institutional execution

Regulation (EU) 2023/2631 governs the issuer side of the label. Separate financial-services and securities-law obligations continue to govern placement, distribution, advice, underwriting, execution and custody, and appropriately authorized firms retain those responsibilities. Recording an instrument on distributed-ledger technology removes none of them. The reference implements the EuGB evidence and authorization workflow and performs no regulated placement, distribution, investment advice, custody, prospectus approval, legal classification or EuGB certification. The seam it exposes is neutral data and identifiers, consumed by each institution's existing regulated controls, so the software never determines legal classification, approves a document, or recreates an attributed judgment.

### Why this belongs in the Development Fund

HestiaX brings the demand side to the design: an active pipeline of renewable-energy and storage projects grounds the profile in real data. That pipeline is not adoption of the funded code and counts toward none of the adoption criteria. What the Committee can verify from Foundation and ecosystem records is narrower and more relevant: HestiaX is an approved Canton MainNet validator operator and a member of the Canton ecosystem.

**Why this is not a company component the Fund is being asked to subsidise.** The usual sequence is that a firm builds a component for its own need, proves it, and only then asks the Fund to generalise it. That is unavailable here, for reasons that are properties of the artifact rather than of HestiaX. There is no smaller commercially useful version to build first, because the authorization claim only becomes checkable once the issuer and external-reviewer packages exist together. And a privately proven version would be the wrong artifact even if it worked, because its value is that reviewers can read the authorization rules before anyone trusts it, which a proprietary implementation cannot expose. No funded artifact carries a HestiaX endpoint, party, fee, licence or SLA, and every deliverable is Apache-2.0 from the first commit rather than opened after the fact.

**Relationship to funded reference implementations.** The Fund has already backed reference implementations on Canton, including Concordia, the settlement-pattern and reference DEX implementation, and those inside the OpenZeppelin ecosystem stack. This proposal does not overlap with any of them in scope, deliverables or Daml surface. What is specific here is a named EU disclosure regime with statutory documents, attesting roles, exact deadlines and a supervised external reviewer, and what it contributes is that pattern, reusable by whatever regime comes next.

---

## Rationale

**Why Canton and Daml.** EuGB workflows involve exact document versions, attributable approvals, confidential evidence and independent institutions acting under their own authority. Canton's sub-transaction privacy makes "who can see this contract" a ledger property rather than separately audited application code; Daml signatories and controllers let the contract itself guarantee that an issuer cannot author a reviewer's conclusion; synchronized state keeps allocation totals, review states and deadlines consistent across parties without reconciliation. Where the Regulation requires professional judgment, the software preserves and attributes that judgment rather than simulating it.

**Why Java, PQS and PostgreSQL; why no Daml Finance.** Java is the institutional integration reality; the Ledger API remains the command and authorization path, with PQS/PostgreSQL as a replaceable, offset-aware projection. The evidence lifecycle needs no financial-contract framework; a small native synthetic instrument minimizes version risk, and Daml Finance can be evaluated later through a separate published architecture decision.

**Rejected alternatives.** HestiaX considered and rejected a proposal without runnable code, documents or access tokens held on-ledger, issuer-controlled reviewer conclusions, a standalone demo application, mandatory shared-network availability, and production issuance or regulated distribution as a condition of grant acceptance.

---

## Delivery Team

**Canton commitment.** HestiaX is a member of the Canton ecosystem, listed in the official Canton ecosystem directory. HestiaX Ltd was approved as a validator operator in the Global Synchronizer Foundation's batch approval and runs its MainNet validator as company-operated infrastructure. The approval and allocation records are verifiable from Global Synchronizer Foundation records; public validator explorers are access-gated at the revision date, so continuing operation is evidenced by HestiaX's operational records, available to the Committee.

**Engineering ownership.**

| Person | Primary ownership |
|---|---|
| Oleksandr Zeziulinskyi | Product and technical lead; EuGB implementation profile; Daml architecture and implementation; Token Standard and evidence linkage; conformance scenarios; institutional validation and adoption engagement |
| Sergii Dotsenko | Distributed-systems and integration lead; Java/gRPC; PQS/PostgreSQL; OpenAPI; security hardening; CI and release engineering; shared Daml implementation and performance work |

Oleksandr Zeziulinskyi has worked in software engineering for 18 years and in blockchain infrastructure since 2014, including at Bitcoin mining operator KnCMiner. His engineering background includes work at Spotify and Scania. While at Bitfly he contributed to the beaconcha.in Ethereum consensus explorer under the handle across notifications, dashboards, CI and validator reward calculations, and he has a public record of open-source contributions on GitHub (`https://github.com/OleksandrZeziulinskyi`).

Sergii Dotsenko is a senior Java and distributed-systems engineer with 20 years of experience, including work at Barclays, Sony Mobile, Ericsson and Avid. His expertise includes Java and JVM performance, networking, cybersecurity and agentic AI. Most of that work is under commercial licence and is not publicly citable; references are available to the Committee on request.

Both engineers work full time for the entire six-month grant. Daml implementation is deliberately shared between them rather than concentrated in one lane, and the go/no-go plus ordered descope rule under Milestones keeps 12.0 engineer-months credible without hidden third-party engineering. Independent reviewers are separately procured third parties, not part of the delivery team. If illness, incapacity, departure or other circumstances prevent a named engineer from continuing, HestiaX may substitute an engineer of equivalent seniority on written notice to the Committee, with the funded scope and amounts unchanged. Where the interruption is material, HestiaX and the Committee will agree a revised delivery schedule for the affected milestones before work resumes.

**Public-good incentive.** Apache-2.0 foundation available to every adopter (Public-good boundary, above). The Fund pays for reusable ecosystem infrastructure.

---

## Maintenance and Sustainability

HestiaX will provide a 12-month post-release maintenance commitment at its own cost, outside the funded six-month scope: not co-funding of grant delivery, and not part of the 12.0 funded engineer-months. The commitment is given to the Canton Foundation on a reasonable-endeavours basis, bounded at a total of 30 engineer-days across the 12 months. It is not a warranty, service level agreement or support contract to downstream users, whose rights are governed solely by the Apache-2.0 licence, and it does not include production operations, hosting or unlimited support. It covers compatibility assessment and corrective releases against supported Canton and Token Standard releases, security fixes under a published vulnerability-disclosure policy, public-issue and pull-request triage, and migration notes for any breaking change. Once the 30 engineer-days are exhausted, HestiaX continues on a best-efforts basis or initiates the stewardship transfer below.

If HestiaX ceases to maintain the repository, becomes unable to continue, or HestiaX and the Canton Foundation agree that stewardship should move, HestiaX will transfer the repository to a Foundation-controlled organization under Apache-2.0 on 60 days' written notice, so continuity does not depend on HestiaX. HestiaX may retain a public fork, and the transfer discharges the maintenance commitment above from the transfer date. Contributions are accepted under the Developer Certificate of Origin, so the provenance of every contribution is recorded with the commit.

The evidence layer is instrument-independent by construction: the reusable asset is the pattern rather than the EuGB profile itself, so any regime with named documents, attesting roles, statutory deadlines and an independent reviewer can be expressed as a further profile over the same packages. No such extension is scoped or funded here.

---

## Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Two-person capacity against the specified surface | Both engineers full time; Daml shared across both; substantial preparatory design as the starting point; the Milestone 1 go/no-go and the ordered descope rule protect the window without touching core scope |
| Independent-review timeline | Reviewer candidates for both tracks proposed at the end of Milestone 1; mechanism agreed with the Committee before grant approval; review runs inside Milestone 3 with remediation time reserved |
| Adoption evidence timing outside HestiaX control | Evaluator categories and evidence standard pre-agreed with the Committee; 30-day review window; confidential-evidence and substitute-evaluator fallbacks; 300,000 CC bounded exposure |
| Token Standard package pins invalidated by a Splice upgrade | Pins bind to a measured Splice release; an upgrade is a planned lock-regeneration event, not a scope change |
| Legal-automation overclaim | No legal-oracle field anywhere; attributable judgments only; the institutional-execution boundary enforced through conformance scenarios and the mapping-review track |
| Private evidence leakage | Off-ledger immutable storage, scoped disclosure, unrelated-party non-disclosure tests, independent review of privacy boundaries |
| Stale or divergent read models | Ledger-authorized writes only; offset-aware PQS projections; explicit lag handling |
| Shared-network reset or access delay | Local and CI acceptance are authoritative; the network profile is optional and never load-bearing |

---

## References

**Legal and regulatory:**

- Regulation (EU) 2023/2631 (European Green Bonds): `https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R2631`
- European Commission, EuGB delegated and implementing acts: `https://finance.ec.europa.eu/regulation-and-supervision/financial-services-legislation/implementing-and-delegated-acts/european-green-bond-standard-regulation_en`
- European Commission, "Shaping a sustainable future: key updates on EU Green Bonds" (2026-03-19): `https://finance.ec.europa.eu/news/shaping-sustainable-future-key-updates-eu-green-bonds-2026-03-19_en`
- ESMA, register of external reviewers published (2026-06-22): `https://www.esma.europa.eu/press-news/esma-news/esma-publishes-register-external-reviewers-under-eugb-regulation`
- Directive 2014/65/EU (research authority for the investment-services boundary): `https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32014L0065`
- Regulation (EU) 2022/858 (DLT Pilot; financial-instrument definition includes DLT-issued instruments): `https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32022R0858`
- ICMA, Bond Data Taxonomy: `https://www.icmagroup.org/fintech-and-digitalisation/fintech-advisory-committee-and-related-groups/bond-data-taxonomy/`

**EU policy and market context:**

- European Commission, COM(2020) 21, Sustainable Europe Investment Plan / European Green Deal Investment Plan (mobilising at least EUR 1 trillion over the decade): `https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:52020DC0021`
- European Commission, NextGenerationEU Green Bonds (programme of up to EUR 250 billion, funding up to 30% of NextGenerationEU): `https://commission.europa.eu/strategy-and-policy/eu-budget/eu-borrower-investor-relations/nextgenerationeu-green-bonds_en`
- Council of the European Union, ST 8202/2026 (15 April 2026), EU-Bonds outstanding at end-2025 including EUR 78.5 billion of NextGenerationEU green bonds: `https://data.consilium.europa.eu/doc/document/ST-8202-2026-INIT/en/pdf`
- European Environment Agency, "Green bonds in Europe" indicator (green bonds at 6.9% of EU corporate and government bond issuance in 2024, corporate share 12.8%): `https://www.eea.europa.eu/en/analysis/indicators/green-bonds-8th-eap`
- LSEG, "Green debt market passes $3 trillion milestone" (Europe at about USD 256 billion of green bond issuance in 2025, roughly 55% of global volume): `https://www.lseg.com/en/insights/green-debt-market-passes-3-trillion-milestone`

**Canton Development Fund and standards:**

- Canton Development Fund repository and submission rules: `https://github.com/canton-foundation/canton-dev-fund`
- Development Fund Proposal Review Process: `https://github.com/canton-foundation/canton-dev-fund/blob/main/Development%20Fund%20Proposal%20Review%20Process.md`
- SIG directory: `https://github.com/canton-foundation/canton-dev-fund/blob/main/sig-directory.md`
- CIP-0100 (Development Fund governance, Champion and volatility rules): `https://github.com/canton-foundation/cips/blob/main/cip-0100/cip-0100.md`
- Canton Token Standard V2, CIP-0112: `https://github.com/global-synchronizer-foundation/cips/blob/main/cip-0112/cip-0112.md`
- Canton Token Standard V1, CIP-0056: `https://github.com/global-synchronizer-foundation/cips/blob/main/cip-0056/cip-0056.md`
- Canton Network, "Canton Network Accounts for Over Half of All Digital Bond Issuances" (2025-01-13): `https://www.canton.network/blog/canton-network-accounts-for-over-half-of-all-digital-bond-issuances`

**HestiaX and team:**

- Canton ecosystem directory, HestiaX: `https://www.cantonecosystem.com/ecosystem/hestiax`
- Global Synchronizer Foundation, validator operator batch approval naming HestiaX Ltd (2026-06-10), with the MainNet allocation record linked from it: `https://lists.sync.global/g/tokenomics-announce/message/343`
- HestiaX: `https://hestiax.org/`
- Oleksandr Zeziulinskyi, GitHub: `https://github.com/OleksandrZeziulinskyi`; LinkedIn: `https://www.linkedin.com/in/oleksandr-zeziulinskyi/`
- Sergii Dotsenko, Github: `https://github.com/sdotsenko`; LinkedIn: `https://www.linkedin.com/in/sdotsenko/`

**Market context:**

- Canton Coin price: CoinGecko (`https://www.coingecko.com/en/coins/canton`) and CoinMarketCap (`https://coinmarketcap.com/currencies/canton-network/`)
