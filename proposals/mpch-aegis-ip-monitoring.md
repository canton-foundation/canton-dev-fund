## Development Fund Proposal

**Author:** MPCH — Canton Foundation member, Super Validator and Validator operator  
**Status:** Submitted  
**Created:** 2026-04-30  
**Label:** regulatory-compliance

---

## Abstract

AEGIS is a policy-driven IP trust monitoring platform that strengthens the operational security and compliance posture of the Canton Network. It provides continuous monitoring of IP addresses interacting with Canton infrastructure, enriching each endpoint from multiple independent intelligence sources, detecting geopolitical and network-level drift, and maintaining an auditable record of every trust decision. By providing this as shared ecosystem infrastructure, AEGIS reduces duplicated security engineering across Canton participants and improves network-wide visibility.

---

## Ecosystem Impact

In year one, AEGIS targets coverage of all active Canton validators and at least 5 ecosystem participants — including validators, regulated token issuers, and enterprise service providers. The platform directly advances three Canton priorities: **Security and Resilience** (continuous hardening and incident-prevention monitoring), **Enterprise Readiness** (providing regulated institutions with auditable, OFAC-aligned IP controls they can evidence to regulators), and **Network Operational Integrity** (early detection of infrastructure drift before it affects validator performance or compliance standing).

**Problem Today — Canton operators have no standard way to:**

- Evidence OFAC-aligned IP controls to regulators or auditors — each institution manages this ad hoc, if at all
- Detect when their cloud-hosted infrastructure drifts into a restricted jurisdiction without any action on their part
- Get a shared view of routing and geolocation changes across overlapping cloud providers used by multiple Canton participants
- Receive early warning when validator endpoints change ASN ownership, BGP routing paths, or RPKI status between operator check-ins

---

## Specification

### 1. Objective

Canton Network participants — validators, service providers, token issuers, and application operators — connect to the network through IP endpoints distributed across global jurisdictions. These endpoints form the outermost trust boundary of the ecosystem, yet they receive almost no ongoing scrutiny after initial onboarding.

IP addresses are not static. Geolocation databases update, BGP routing paths shift, ASN ownership changes, and cloud providers reassign IP blocks across regions. Without continuous monitoring, these changes go unnoticed until they create operational or compliance exposure.

AEGIS closes these gaps with the following intended outcomes:

- Continuous monitoring of IP addresses interacting with Canton infrastructure
- Automated detection of geopolitical and network-level drift
- Policy-based alerting for restricted jurisdictions (OFAC-aligned)
- A shared monitoring capability available to Canton ecosystem participants
- An auditable history of IP trust decisions for compliance and operational review

### 2. Implementation Mechanics

**IP Enrichment Engine**

Every monitored IP is enriched from multiple independent data sources using a priority-based merge strategy. No single source is trusted in isolation.

| Data Field | Primary Source | Fallback Sources |
|---|---|---|
| Geo Country / Region / City | MaxMind GeoLite2 | ip-api, Team Cymru |
| ASN / AS Name / Organization | RIPE Stat | Team Cymru, ip-api |
| Route Prefix / Visibility | RIPE Stat | Team Cymru |
| RPKI Validation Status | RIPE Stat | — |
| Reverse DNS | Direct rDNS lookup | ip-api |
| Proxy / VPN / Tor Detection | ip-api | — |
| Abuse Contact | RIPE Stat | — |

Derived scores computed from enrichment data: Stability Score (0–100), Attribution Confidence (low/medium/high), and Risk Tier (low/medium/high/critical). All enrichment data is stored as immutable snapshots, preserving a complete historical record of how each IP's identity changes over time.

**Drift Detection**

AEGIS compares each enrichment snapshot against the previous one and generates change events when an IP's identity shifts:

| Change Type | Severity | Trigger |
|---|---|---|
| `COUNTRY_CHANGE` | High | Geolocation moved to a different country |
| `ASN_CHANGE` | Warning | Autonomous System Number changed |
| `ROUTE_CHANGE` | Warning | BGP route prefix changed |
| `RPKI_CHANGE` | Warning | RPKI validation status changed |
| `RISK_FLAG_CHANGE` | High | Proxy / VPN / Tor flag toggled |
| `RDNS_CHANGE` | Info | Reverse DNS hostname changed |

**Restricted Jurisdiction Policy Engine**

Policy profiles define configurable lists of restricted country codes (ISO 3166-1 alpha-2) per tenant. The engine evaluates every monitored IP against its tenant's assigned policy on each enrichment cycle and flags restricted IPs in real-time. Default restricted jurisdictions: KP, IR, SY, CU, RU. All flagging uses *"inferred"* language with confidence levels — AEGIS provides intelligence for human decision-making, not automated enforcement.

**Canton Network Integration**

AEGIS integrates with CantonScan to provide real-time validator and super-validator data alongside IP monitoring. Per-validator metrics include: version, sponsor, activity status, round participation, and reward change detection (24-hour delta). This gives operators a single pane of glass for both network health and IP trust posture.

**Geospatial Visualization**

A global map view displays all monitored IPs with risk-based color coding (green/orange/red), animated pulse rings for high-risk endpoints, and interactive marker selection for full enrichment detail and change history.

**Multi-Tenancy and Access Control**

Each organization receives a dedicated tenant with isolated IP lists, policies, and change histories. Four RBAC roles enforce strict data isolation: `customer_viewer`, `customer_admin`, `mpch_analyst`, `mpch_admin`. Authentication uses Auth0 SSO with a local credential fallback.

**Whitelist Request Workflow**

New IP additions follow a controlled approval workflow: participant submits → MPCH triages with enrichment data → approved (IP auto-added) or rejected (reason recorded). Every state transition is logged with reviewer identity, timestamp, and notes.

**Audit Trail**

Every platform action is recorded to an immutable, append-only audit log: authentication events, IP lifecycle changes, whitelist request transitions, policy changes, user management, and data exports. Default retention: 365 days (configurable per tenant).

**Technology Stack**

| Component | Technology |
|---|---|
| Frontend | Next.js, React, TypeScript |
| Backend API | Python 3.12, FastAPI, SQLAlchemy (async) |
| Database | PostgreSQL 16 |
| Job Queue | Celery + Redis |
| Enrichment Providers | MaxMind GeoLite2, RIPE Stat, Team Cymru, ip-api, rDNS |
| Deployment | Docker Compose, Caddy reverse proxy, GCP |

### 3. Architectural Alignment

AEGIS supports several existing CIPs by strengthening the operational security of infrastructure used by ecosystem participants:

**CIP-0056 — Canton Token Standard**: Token registries, wallets, and asset issuers rely on stable infrastructure endpoints. AEGIS detects infrastructure drift and jurisdiction changes that could affect token infrastructure security.

**CIP-0103 — Wallet and Application Integration Standard**: AEGIS improves the trust posture of infrastructure supporting wallet and app integrations by monitoring geolocation, ASN ownership, routing integrity, and proxy indicators for the endpoints involved.

**CIP-0104 — Traffic-Based Application Rewards**: AEGIS detects infrastructure migrations, routing anomalies, or identity changes that could affect traffic attribution or operational integrity underlying reward calculations.

AEGIS also directly addresses the **Security and Resilience** Q2 priority area: security auditing, hardening, network resilience, and monitoring.

### 4. Backward Compatibility

No backward compatibility impact. AEGIS is a new, additive monitoring platform with no changes to existing Canton protocols, APIs, or on-chain state.

---

## Milestones and Deliverables

### Milestone 1: Production Deployment
- **Estimated Delivery:** 4 weeks from approval
- **Focus:** Core platform operational on production infrastructure
- **Deliverables / Value Metrics:**
  - AEGIS deployed to production GCP infrastructure with TLS, reverse proxy, and monitoring
  - Multi-source IP enrichment pipeline operational (MaxMind, RIPE Stat, Team Cymru, ip-api, rDNS)
  - Drift detection generating change events with severity classification
  - Immutable audit trail logging all platform actions
  - Daily scheduled enrichment worker running at 02:00 UTC

### Milestone 2: Canton Network Integration
- **Estimated Delivery:** 10 weeks from approval
- **Focus:** Canton-specific visibility and geospatial monitoring
- **Deliverables / Value Metrics:**
  - CantonScan integration delivering real-time validator and super-validator data
  - Validator monitoring dashboard with activity tracking and round metrics
  - Geospatial map with risk-based markers and interactive enrichment detail
  - Single pane of glass for IP trust posture alongside network health

### Milestone 3: Policy and Compliance Engine
- **Estimated Delivery:** 18 weeks from approval
- **Focus:** Restricted jurisdiction detection, compliance tooling, security hardening
- **Deliverables / Value Metrics:**
  - Policy-driven restricted jurisdiction detection and alerting (OFAC-aligned defaults)
  - Configurable per-tenant restricted country lists
  - Controlled whitelist request workflow with enrichment-informed review and approval trail
  - Penetration test completed, dependency audit performed, access review documented

### Milestone 4: Ecosystem Onboarding
- **Estimated Delivery:** 28 weeks from approval
- **Focus:** External tenant provisioning, documentation, operational handoff
- **Deliverables / Value Metrics:**
  - At least one external Canton participant successfully onboarded as a tenant
  - Operator guides, API reference, and integration playbooks published
  - Monitoring, alerting, and incident response procedures documented
  - Tenant provisioning workflow validated end-to-end

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone
- Demonstrated functionality or operational readiness at each milestone gate
- Documentation and knowledge transfer provided
- Alignment with stated value metrics

Project-specific acceptance conditions:

- IP enrichment draws from at least four independent intelligence sources
- Drift detection accurately identifies all six change types with correct severity classification
- Restricted jurisdiction detection produces no false-negatives for default OFAC-restricted countries in testing
- Multi-tenant architecture demonstrates strict data isolation between organizations
- At least one external Canton participant successfully onboarded and actively monitoring IPs

---

## Funding

**Total Funding Request: 450,000 CC**

### Payment Breakdown by Milestone
- Milestone 1 — Production Deployment: 90,000 CC upon committee acceptance
- Milestone 2 — Canton Network Integration: 110,000 CC upon committee acceptance
- Milestone 3 — Policy and Compliance Engine: 150,000 CC upon committee acceptance
- Milestone 4 — Ecosystem Onboarding: 100,000 CC upon final release and acceptance

### Volatility Stipulation
The project duration is 28 weeks, which exceeds 6 months. The grant is denominated in fixed Canton Coin. Should the project timeline extend further beyond 6 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility.

---

## Co-Marketing

Upon release, MPCH will collaborate with the Canton Foundation on:

- Announcement coordination for public availability of the AEGIS platform
- Technical blog post covering the IP enrichment and drift detection architecture
- Case study featuring the first external Canton participant onboarded
- Developer and ecosystem promotion through existing Canton community channels

---

## Motivation

Infrastructure drift is a persistent and undermonitored risk in modern cloud environments. Canton Network participants connect through IP endpoints that span global jurisdictions — yet these endpoints receive almost no ongoing scrutiny after initial onboarding.

Today, there is no standardized mechanism within the Canton ecosystem to continuously verify the geographic and network identity of infrastructure endpoints, detect when those endpoints drift into restricted jurisdictions, or maintain an auditable record of IP trust decisions. Each participant that needs this capability must build it independently.

AEGIS closes these gaps by providing shared monitoring infrastructure purpose-built for the Canton ecosystem. Shared tooling is particularly valuable here because many participants rely on overlapping infrastructure providers and network paths — a single platform improves ecosystem-wide visibility while reducing duplicated security engineering effort across operators.

The platform directly addresses compliance exposure for regulated institutions operating on Canton, and provides early-warning detection for infrastructure changes that could affect validator operations, token issuers, and application services.

---

## Rationale

Operational security depends on visibility. By monitoring the network-layer identity of endpoints interacting with Canton services, AEGIS enables operators to detect issues before they escalate into incidents.

The multi-source enrichment approach — combining MaxMind, RIPE Stat, Team Cymru, ip-api, and rDNS — is preferred over single-provider solutions because no single geolocation or ASN database is authoritative. Cross-validating across independent sources produces more reliable confidence scores and reduces the risk that a poisoned or outdated database entry triggers a false alert or masks a real one.

The decision to operate as MPCH-managed shared infrastructure (rather than open-source self-hosted tooling) reflects the operational reality that tenant provisioning, provider API key management, and continuous enrichment require ongoing operational ownership. A managed service model ensures consistent security posture across participants without requiring each operator to stand up and maintain their own instance.
