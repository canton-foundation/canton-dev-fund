## Canton Imported Names - Decentralized DNS Name Importer Implementation

Author: Paolo Domenighetti, CTO, Freename AG

CIP: CIP-ZZZZ (canton-foundation/cips PR #249)

Status: Draft

Created: 2026-09-17

Contact: paolo@freename.io - gherardo@freename.io

## Abstract

Freename AG proposes to deliver the reference implementation of the Canton Imported Names CIP (PR #249) — the Decentralized DNS Name Importer that brings DNS-registered domain names onto the Canton Network as on-ledger credentials resolvable through the Canton Party Name Resolution Standard (PR #171).

The importer establishes that the holder of a Canton Party ID controls a DNS domain (DNSSEC-validated `_canton.<domain>` TXT records), issues the corresponding CN Credential on-ledger, re-verifies bindings on the cadence the CIP mandates, and archives credentials when the underlying DNS state changes. This grant delivers that software as open source: the verification engine, the credential issuance and lifecycle pipeline, the registrar-facing tooling for import requests, and attestor-mode packaging so the same software can operate standalone under a single registrar or as a node in a future decentralized (multi-attestor) deployment.

The design phase has already been delivered as PR #249 and is contributed to the ecosystem at no cost. This grant requests funding only for implementation and productionization, leveraging Freename's operating DNS and registrar infrastructure — ICANN accreditation, DNSSEC validation operations, registry integrations — to deliver at substantially reduced cost relative to a greenfield effort.

Importers for further naming systems (LEI/vLEI, ENS, email) follow the blueprint in PR #249 as separate CIPs and are outside the scope of this grant.

## Specification

### 1. Objective

Canton's institutional participants already hold authoritative external identities — above all, DNS domains. The Working Group direction makes DNS import the first external naming-system integration: a domain owner proves control via a DNSSEC-validated TXT record, and the binding to their Canton Party ID becomes an on-ledger credential that any application resolves through the standard resolution layer.

Intended outcome: an open-source, production-grade DNS importer that any approved registrar or attestor can operate, giving every domain-holding institution a verified, human-readable Canton name anchored in infrastructure they already control.

### 2. Implementation Mechanics

The implementation delivers the following components, tracking PR #249 exactly:

Verification Engine: DNSSEC-validated resolution of `_canton.<domain>` TXT records (`party=<party-id>`), full chain validation to the DNS root, deterministic pass/fail with auditable evidence records. Domains without a validatable DNSSEC chain fail verification, per the CIP.

Credential Pipeline: issuance of the CIP's credential encoding on-ledger via the CN Credentials Standard (publisher = importer registrar, subject = holder = verified party; claims `cprp/fqpn`, `cprp/network`, `cprp/source`, `cprp/verification-method`, `cprp/verified-at`, `cprp/valid-until`), plus archival and re-issuance flows.

Re-Verification Scheduler: continuous enforcement of the CIP's 7-day maximum re-verification cadence, on-demand re-checks, and prompt archival when the TXT record is removed or the DNSSEC chain breaks.

Import Request Flow: registrar-facing CLI and service endpoints through which a party requests import of a domain, tracks verification status, and receives its credential; apex domains and subdomains supported per the CIP.

Attestor-Mode Packaging: the same verification engine packaged so that multiple independent operators can execute the procedure and jointly attest, ready for a future decentralized deployment on shared attestor infrastructure. Standing up and governing such a deployment is a network governance decision outside this grant; this grant delivers the software that makes it possible.

Operations Tooling: monitoring of verification outcomes, credential expiry dashboards, and an operations runbook for registrars.

### 3. Architectural Alignment

- Implements the Canton Imported Names CIP (PR #249) as written
- Resolves through the Canton Party Name Resolution Standard (PR #171): imported names are ordinary `dns` FQPNs to every application
- Builds on the CN Credentials Standard (PR #204) — all importer output is standard credentials, no custom Daml templates
- Complementary to the `.canton` CIP (Axymos, PR #209): DNS import and Canton-native allocation coexist and do not overlap
- Import model per the Working Group direction: names are materialized on-ledger so Daml code can reference them where needed

### 4. Backward Compatibility

Additive, with no breaking changes:

- DNS continues to operate as-is; the importer only reads public DNS state
- Credentials are additive on-ledger state; applications not adopting the resolution standard are unaffected
- A party can archive its imported name at any time by removing the TXT record; the re-verification cycle propagates the removal

## Milestones and Deliverables

### Milestone C1: CIP & Importer Design (Completed — Donated)

- Status: Delivered to `canton-foundation/cips` as PR #249, split out as its own proposal per Working Group review feedback; under review
- Focus: Verification procedure design, credential encoding, blueprint structure for follow-up importers
- Funding: 0 CC — the design contribution is part of Freename's donated standards work and is accounted once, in the Resolution Standard grant; it is not double-counted here
- Delivered artifacts:
  - The Canton Imported Names CIP (PR #249): DNSSEC verification procedure, credential encoding, re-verification cadence, attestor-based operation model, blueprint for LEI/vLEI, ENS, and email importers
  - Exit criterion: CIP advancement to "Proposed" status by the Working Group (pending)

### Milestone C2: DNS Importer on TestNet

- Estimated Delivery: 12 weeks from grant start
- Focus: Working importer on TestNet issuing real credentials from real DNS state
- Deliverables / Value Metrics:
  - `cprp-importer-core` (verification engine: DNSSEC chain validation, TXT parsing, evidence records)
  - `cprp-importer-pipeline` (credential issuance, archival, re-issuance via CN Credentials)
  - `cprp-importer-scheduler` (7-day cadence enforcement, on-demand re-verification, change-driven archival)
  - Import request CLI and service endpoints (request, status, credential retrieval)
  - TestNet deployment importing 25+ real DNSSEC-enabled domains end to end
  - Resolution of imported names demonstrated through the standard resolution interface (PR #171)
  - Verification evidence audit log with documented format
  - Exit criterion: WG confirms end-to-end import and resolution on TestNet; re-verification and revocation demonstrated live
- Explicit precondition: CN Credentials Standard (PR #204) deployable on TestNet

### Milestone C3: Production Hardening, Attestor Mode & Adoption

- Estimated Delivery: 8 weeks from C2 completion
- Focus: Production readiness, attestor-mode packaging, operator adoption
- Deliverables / Value Metrics:
  - Attestor-mode packaging: independent operators run the verification engine and jointly attest; deployment guide for a multi-attestor topology
  - Operations tooling: monitoring, expiry dashboards, alerting, operations runbook
  - Security review of the verification path (DNSSEC handling, evidence integrity) with published findings
  - Registrar onboarding guide and importer integration guide
  - Adoption support: office hours, WG presentations, onboarding of the first external operator
  - Exit criterion: 1+ operator other than Freename running the importer software in testnet or staging
- All source code published under Apache 2.0

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each funded milestone (C2, C3)
- Live TestNet deployment importing 25+ real DNSSEC-enabled domains with end-to-end resolution (C2)
- Demonstrated re-verification cadence enforcement and revocation propagation (C2)
- Attestor-mode deployment guide validated by an operator other than Freename (C3)
- Published security review of the verification path (C3)
- All source code published to public GitHub repositories under Apache 2.0 license
- Working Group presentation at each milestone with feedback incorporation

Milestone C1 deliverables have already been submitted (PR #249) and are under WG review. Acceptance of the Imported Names CIP to "Proposed" status is treated as a precondition to C2 work commencing, not as a payable milestone of this grant.

## Funding

Total Funding Request: 714,285 CC (equivalent to ~110,000 USD at 1 CC = $0.1540; CC amounts to be re-confirmed at the prevailing rate on submission per CIP-0100 procedures)

### Funding Rationale

The request reflects the same posture as the Resolution Standard grant:

- The design phase (PR #249) is donated, accounted once in the Resolution Standard grant and not double-counted here.
- Implementation reuses Freename's operating DNS infrastructure — DNSSEC validation operations, registrar tooling, registry integrations run in production by an ICANN-accredited registrar — adapted for Canton rather than built from scratch. This is the difference between building a DNS verification service and operating one already.
- Implementation is carried out by Freename's existing internal team, eliminating hiring and ramp-up costs.

The funded amount covers the actual implementation cost of C2 and C3 with a modest operating margin. Ongoing operation of the importer after delivery is not funded by this grant: operating costs are borne by importer operators and covered by the registry economics defined in the registry CIPs, keeping build funding and operating revenue cleanly separated.

### Payment Breakdown by Milestone

- Milestone C1 (CIP & Importer Design): 0 CC — donated, delivered as PR #249
- Milestone C2 (DNS Importer on TestNet): 454,545 CC upon committee acceptance (~$70,000)
- Milestone C3 (Production Hardening, Attestor Mode & Adoption): 259,740 CC upon final release and acceptance (~$40,000)

### Volatility Stipulation

The funded portion of the project (C2 + C3) covers approximately 20 weeks (~4.5 months) of work from grant start. The grant is denominated in fixed Canton Coin and will require a re-evaluation at the 6-month mark per CIP-0100 procedures.

## Co-Marketing

Upon release, Freename AG will collaborate with the Canton Foundation on:

- Joint announcement of DNS name import availability on the Canton Network
- Technical blog post on anchoring Canton identity in DNSSEC-validated domain ownership
- Operator tutorial: running the DNS importer
- Presentation at Canton ecosystem events and Working Group meetings

## Motivation

Every institution on Canton already owns and operates DNS domains under established governance, with DNSSEC providing cryptographic proof of control. Importing those names is the fastest path to verified, human-readable counterparty names at institutional scale: no new registrations, no new authorities — the trust anchor already exists.

The Working Group structure assigns this integration its own CIP and its own DevFund proposal, separate from the CNS 2.0 registry work. PR #249 is that CIP; this grant is that proposal. Without a funded reference implementation, the CIP remains a paper standard: the verification engine, the credential lifecycle, and the attestor packaging are the difference between a specified importer and an operating one.

## Rationale

Why fund open-source infrastructure a registrar could build anyway: the importer is network infrastructure, not a Freename product. It is Apache 2.0, operable by any approved registrar or attestor, with attestor-mode packaging explicitly designed so that no single operator — Freename included — is structurally privileged. The grant buys the network an importer anyone can run; Freename's registrar expertise is what makes it the cheapest and fastest builder, not the sole beneficiary.

Why DNS first: DNS is the largest identifier system institutions already hold, with a workable cryptographic verification mechanism (DNSSEC) and mature tooling. LEI/vLEI, ENS, and email importers follow the blueprint as separate CIPs once the pattern is proven in production.

Why attestor-mode packaging now: the Working Group has discussed operating shared external importers on decentralized attestor infrastructure. Building the software attestor-ready from the start avoids a costly retrofit and leaves the deployment decision — single registrar versus decentralized operation — where it belongs, with network governance.

Why operations are excluded: re-verification is a continuous obligation, and funding it through a one-time grant would create an unfunded liability at grant end. Operating costs sit with operators, covered by the per-name registry economics, so the network funds the build once and the operation sustains itself.

Why Freename: Freename AG is an ICANN-accredited registrar operating DNSSEC validation and multi-registry naming infrastructure in production across Polygon, Solana, Base, and BNB Chain. DNS verification at registrar scale is Freename's daily business; this grant adapts that operating capability to Canton rather than paying to create it.
