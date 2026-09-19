# **Featured App Marketplace**

**Author:** FDF Technologies  
**Status:** draft  
**Created:** 2026-13-04  
**Category:** Developer tooling \+ reference implementation \+ critical ecosystem infrastructure  
**Proposal file path:** `proposals/featured-app-marketplace.md`  
**Champion (Tech & Ops Committee):** \[REQUIRED: Name, Title\]  
**Primary contact:** Lucas Naundorf, lucas@tokino.cc

---

## **1\) Summary**

The Featured App Marketplace (FAM) is open, non-custodial infrastructure that standardizes how Featured Apps on the Canton Network receive sponsored CC commitments from capital allocators. It creates a shared coordination layer for CC bonding, replacing fragmented, bespoke sponsorship arrangements with a single audited standard.

The FAM is designed for the Featured App Locking CIP, which requires every Featured App to lock 5,000,000 CC per PartyId, continuously, with a 60-day unlock period. Existing Featured Apps have 30 days from CIP approval to comply or lose Featured App status. New applicants must lock before Foundation approval. There is no SV lock reuse provision. Every Featured App must source and maintain its own locking capital from day one of designation.

The FAM provides a simple, reusable, and non-custodial sponsorship layer for Featured Apps. It is open ecosystem infrastructure that reduces fragmentation, improves interoperability, and makes sponsorship easier to adopt for both builders and supporters.

**North-star metric:** Total CC committed through standardized sponsorship flows for Featured Apps.

**Primary ecosystem outcomes**

* Better coordination of network support  
* Stronger Featured App ecosystem growth  
* Reusable shared infrastructure for builders  
* Greater alignment between CC participation and app-driven network usage

**Why now**

The Featured App Locking CIP creates an immediate, continuous bonding requirement at CIP approval. Existing Featured Apps must lock 5M CC within 30 days or lose designation; new applicants must lock before approval. Without a shared coordination standard, every app assembles its own sponsorship path independently, fragmenting sponsor liquidity and repeating security-sensitive implementation work. Establishing the FAM standard ahead of CIP activation ensures Canton's Featured App ecosystem absorbs the bonding requirement in a coordinated, interoperable way.

---

## **2\) Objective & Scope**

### **Objective**

Deliver a production-ready, ecosystem-wide module set (standards \+ APIs \+ reference implementation) that standardizes how Featured Apps receive sponsored CC commitments and how those flows integrate with protocol-level functionality provided by the Foundation.

### **In scope**

* The FAM and lifecycle primitives  
* Application-layer integration components for protocol-supported bonding / locking flows  
* Monitoring and state tracking records like supported by final protocol design  
* Operator tooling (monitoring, lifecycle handling, runbooks)  
* Reference implementation (minimal UI/CLI \+ demo harness)  
* Security hardening \+ third-party audit \+ remediation  
* Pilot integrations to validate adoption

**Open-source commitment**

The FAM standards, schemas, and core documentation will be published early to support ecosystem alignment and review. The reference implementation is expected to be released in stages, with broader public code release aligned to external security review, remediation, and readiness for safe ecosystem use.

### **Out of scope (v1)**

* Protocol changes (FDF consumes existing/proposed Featured App bonding mechanisms; it does not define them)  
* Custodial control of sponsor funds   
* Bespoke, one-off sponsorship systems for individual apps  
* Replacing or duplicating protocol-level locking infrastructure provided by the Foundation

* FDF using its own balance sheet to provide, rent, or intermediate bond capital for Featured Apps

* Intermediating SV-to-app credit, guarantees, collateral rights, or repayment terms

---

## **3\) Problem / Motivation**

The Featured App Locking CIP (as per v0.7) introduces a single, continuous locking requirement of 5,000,000 CC per PartyId for every Featured App, with a 60-day unlock period. Existing Featured Apps have 30 days from CIP approval to lock 5M CC or lose Featured App status. New applicants must lock before Foundation approval. There is no SV lock reuse provision. Every Featured App must independently source and maintain its own locking capital from day one.

Without a shared sponsorship standard, each app must assemble and manage its own bespoke path to secure that capital. That fragments sponsor liquidity, slows ecosystem growth, and repeats security-sensitive implementation work across multiple teams.

The FAM addresses this by creating one marketplace standard and one reusable application-layer integration approach, so sponsorship becomes easier to adopt across the ecosystem while relying on the protocol-level locking primitives defined in the CIP.

---

## **4\) Proposed Solution** 

The FAM consists of:

1. Standard schemas for sponsorship demand and sponsorship offers  
2. A reusable lifecycle that matches allocator offers with app listings  
3. Integration flows that connect marketplace to the relevant protocol-level bonding / locking functionality once defined  
4. Monitoring and distribution records like supported by the final architecture  
5. Operator tooling for monitoring, lifecycle operations, and runbooks

---

## 

## 

## 

## **5\) Technical Approach** 

### **Foundation: Tokino Locking Primitives** 

* The FAM is not a greenfield build. FDF Technologies created, launched, and maintains Tokino, a production Daml application on Canton that implements CC locking mechanics.   
* The FAM adapts and extends Tokino's locking templates to a marketplace model, accelerating development and reducing security surface area relative to a new implementation.   
* Halborn security audits for both of our Canton Featured Apps Tokino (and Vala Wallet) are available to the committee upon request.

### **Core marketplace objects**

* **App Listing:** app identifier, requested amount (or bond target), term parameters, protocol incentive and service-fee disclosure model, required disclosures, and limited contact metadata  
* **Allocator Offer:** sponsor amount, term, constraints, required participation terms or software-fee disclosures (if applicable), and expiry  
* **Sponsorship Match:** binds listing \+ offer and references the relevant protocol-level commitment flow, plus any managed monitoring or state tracking needed at the application layer.  
* **Wallet Integration Reference:** wallet-facing connection and signing flow that links sponsors and their wallets to Marketplace actions such as offer creation, sponsorship acceptance, and position management.

### **On-ledger vs off-ledger**

* **On-ledger:** Match state, sponsorship position state, records, distribution events  
* **Off-ledger:** discovery UI/UX and indexing (must map 1:1 to on-ledger state)

### **Sponsorship position (Non-custodial invariant)**

* Funds are locked under the sponsor’s party via a locking template  
* No operator/admin key can unlock sponsor funds  
* Any delegated actions are narrowly scoped authorizations (e.g., renewals) and cannot change principal or seize funds

* FAM does not withdraw or transfer sponsor principal, and protocol rewards do not flow through FDF before reaching the entitled party

### **Core on-ledger components (initial design)**

* Sponsorship Match / Position Reference: links sponsor intent and app intent to the relevant protocol-level position or lock  
* Authorization / Delegation components: if needed for lifecycle handling or integrations  
* Tracking templates: on-ledger records for entitlements, state tracking, and distributions where appropriate

### **Economic model (Network participation incentives)**

* Network participation incentives, if any, are expected to depend on the final native Featured App bonding / locking mechanism once specified.  
* Optional app-defined participation incentives or service-fee terms may be supported at the FAM layer where feasible, but final scope depends on protocol, operational, and legal feasibility.

---

## **6\) Architectural Alignment**

This is shared infrastructure that increases network utility by:

* **Liquidity coordination:** one standard reduces fragmentation and repeated implementations  
* **Featured App growth:** standardized sponsorship lowers bonding barriers for new apps  
* **Security & resilience:** audited integration components, explicit invariants, standardized monitoring/runbooks  
* **Interoperability:** shared schemas and templates allow multiple apps/operators to adopt without bespoke integrations

---

## **7\) Milestones (Deliverables, Acceptance Criteria, Funding)**

Milestones focus on staged progress from concept validation and devnet deployment to pilot readiness and mainnet preparation. As protocol-level functionality is still evolving, the scope is intentionally kept practical and aligned with what the Foundation provides.

## Milestone 1 \- Devnet Implementation Against Published Specification (Months 1-2)

### **Funding: 475,000 CC (12.5%)**

**Pre-condition:**

* FAM specification (derived from Tokino architecture) published and made available prior to grant activation.

**Deliverables**

* Initial marketplace design and sponsorship lifecycle  
* Working devnet MVP covering listing, sponsor participation, and basic sponsorship lifecycle  
* Demo of the core sponsorship flow on devnet  
* Security assumptions, known limitations, and controlled-release plan for the reference implementation  
* Security audit engagement initiated: scope defined, including lock, unlock, match, distribution, and unfeature response controls, and fieldwork start date confirmed

**Acceptance criteria**

* Reviewers can assess the MVP architecture, documentation, and devnet flow  
* A live devnet demo shows the end-to-end core flow  
* The MVP is concrete, reviewable, and testable by reviewers  
* Protocol dependencies and assumptions are clearly documented

## Milestone 2 \- Pilot-Ready MVP and Reference Documentation (Months 3-4)

### **Funding: 950,000 CC (25%)**

**Deliverables**

* Expanded devnet MVP with improved lifecycle handling  
* UI for core Marketplace interactions  
* Initial integration of available protocol-level functionality  
* Documentation for onboarding, operation, and testing  
* Monitoring and support approach for devnet operations  
* Security audit fieldwork in progress; preliminary findings documented  
* Audit fieldwork underway with preliminary findings report delivered to committee

**Acceptance criteria**

* MVP supports the main sponsorship flow on devnet  
* A third party can test the FAM flow on devnet using the documentation   
* Core monitoring, maintenance and operational processes are in place  
* Implementation remains adaptable to final Foundation design decision

## Milestone 3 \- Marketplace MVP and Ecosystem Pilot (Months 4-5)

### **Funding: 1,425,000 CC (37.5%)**

**Deliverables**

* At least one live pilot or structured pilot with an ecosystem participant  
* Public documentation for app onboarding and sponsor participation    
* Security audit complete: all High and Critical findings remediated; Medium findings documented with resolution planStaged code release plan for the reference implementation aligned to review findings    
* Initial usage reporting and pilot learnings

**Acceptance criteria**

* Marketplace MVP supports the intended sponsorship lifecycle  
* At least one pilot is completed or running on the MVP stack   
* Security findings and remediation priorities are documented clearly  
* Documentation reflects the MVP and pilot setup clearly  
* Pilot feedback is captured and reflected in the implementation plan

## Milestone 4 \- Hardening, Mainnet Preparation, and Open-Source Release (Months 5-6) 

### **Funding: 950,000 CC (25%)**

**Deliverables**

* Security and reliability improvements for the MVP  
* Mainnet readiness review and final documentation  
* Monitoring, support, and operational runbooks  
* Final alignment with Foundation-delivered protocol functionality  
* Pilot feedback review and follow-up actions  
* Full open-source release of the reference implementation (conditional on zero open High or Critical findings from security audit)

**Acceptance criteria**

* Mainnet readiness package is complete and reviewable  
* Key risks and dependencies are documented  
* Monitoring and operational processes are in place  
* Pilot feedback has been captured and reflected where relevant  
* Zero open security findings from an external security auditor at severity High or above

### **Maintenance and Sustainability (Quarterly, post-delivery; starts after Milestone 4\)**

Initial maintenance is included because the FAM is intended as shared ecosystem infrastructure. Rather than relying only on ongoing grant support, the FAM is expected to transition to a simple software service-fee model: a transparent per-listing or per-match service charge, denominated in CC or fiat, charged outside any protocol reward-distribution path and only once live usage flows are available.

**Deliverables**

* Compatibility updates for Featured App sponsorship changes  
* Security fixes and dependency updates  
* Ongoing operational and documentation support

**Acceptance criteria**

* Quarterly updates are published  
* Critical issues are addressed within agreed timelines  
* Documentation and operational guidance remain current

---

## **10\) Risks & Mitigations**

* **Featured App bonding design changes:** keep schemas versioned; isolate a bonding adapter layer  
* **Registry/eligibility verification unclear:** support pluggable verification (registry/attestation) and ship with a default adapter once source of truth is confirmed  
* **Security risk (locking \+ auth):** strict non-custodial invariant; formal threat model covering lock, unlock, match, distribution, and unfeature response controls; third-party audit \+ remediation  
* **Protocol-level functionality** not yet fully specified: keep milestones broad, isolate protocol adapters, and avoid overcommitting to implementation details before Foundation / SV write-up is available

---

## **11\) Funding Request**

**Total request:** 3,800,000 CC 

**Milestone breakdown**

* Milestone 1: 475,000 CC (12.5%)  
* Milestone 2: 950,000 CC (25%)  
* Milestone 3: 1,425,000 CC (37.5%)  
* Milestone 4: 950,000 CC (25%)

**Cost rationale (high level)**

Cost build-up

| Role | FTE | Est. Monthly Cost | Months | Total |
| :---- | :---: | :---: | :---: | :---- |
| Product Manager | 1 | \~EUR 9,000 | 6 | \~EUR 54,000 |
| Senior Daml / Canton Engineer | 2 | \~EUR 11,500 each | 6 | \~EUR 138,000 |
| DevOps / Infrastructure Engineer | 1 | \~EUR 8,500 | 6 | \~EUR 51,000 |
| Product / UI Designer | 0.5 | \~EUR 8,000 | 6 | \~EUR 24,000 |
| UI/UX Frontend Developer | 1 | \~EUR 9,500 | 6 | \~EUR 57,000 |
| Subtotal: Product, Engineering & Design | n/a | n/a | n/a | \~EUR 324,000 |
| External security audit (confirmed) | n/a | n/a | n/a | \~USD 90,000 |
| Tooling, infrastructure, devnet/mainnet environments, misc. | n/a | n/a | n/a | \~EUR 30,000 |
| Protocol integration, pilot support, security remediation & delivery reserve | n/a | n/a | n/a | \~EUR 86,000 |
| Total | n/a | n/a | n/a | \~EUR 440,000 \+ USD 90,000(approx. EUR 523,000 / USD 570,000) |

All rates are planning-level, fully loaded Berlin market estimates, including contractor/company overhead. Final FTE rates to be confirmed at contract signing.  
Reference rates used to size the 3,800,000 CC ask: 1 CC \= \~USD 0.15; implied total \= \~USD 570,000. For table conversion purposes, EUR 1 \= \~USD 1.09, so the ask is approximately \~EUR 523,000 including the USD-denominated audit.

## **12\) CC Price Volatility**

Expected duration is under 6 months. If committee-requested scope changes push remaining milestones beyond 6 months, remaining milestone funding will be renegotiated to account for material USD/CC volatility.

---

## **13\) Go-to-Market**

**Strategic posture**

The Featured App Locking CIP requires every Featured App to lock 5,000,000 CC per PartyId, continuously, with a 60-day unlock period. Existing Featured Apps have 30 days from CIP approval to comply or lose designation. New applicants must lock before Foundation approval. The GTM job is to be the path of least resistance when that demand materialises at CIP activation, not to manufacture it.

Three phases tied to the CIP timeline:

| Phase | Window | Objective | Output |
| :---- | :---- | :---- | :---- |
| Pre-launch | Months 1-4 | Sign Launch App Partners and Launch Liquidity Partners via LOI | 5+ App LOIs, 2+ Allocator LOIs |
| Launch | Months 4-6 | Convert launch partners into live listings; activate Foundation co-marketing | 20+ listings, 100M+ CC committed |
| Scale | Months 6-12 | Move from launch partners to ecosystem default ahead of the CIP lock-up activation | 50+ listings, 250M+ CC committed |

**Demand-side: Featured Apps**

Starting market: \~148 live Featured Apps (CCView.io, May 2026). After \~50% attrition driven by the 5M CC bond requirement, the addressable target from the existing cohort is \~74 apps. Net new applicants ramp from 10 to 50 per month over Year 1, expanding the TAM continuously.

| Segment | Size | Motion |
| :---- | :---- | :---- |
| Existing Featured Apps preparing for the bonding cutover | \~74 | Structured outreach via FDF partner network |
| New Featured App applicants | 10-50 per month, ramping over Year 1 | 48-hour outbound on every new applicant from the Canton tokenomics mailing list |
| Builders deferring Featured App status due to bond cost | unknown | Surfaced via conference presence and Foundation channels |

**Why apps choose FAM over building their own:** 

* Time-to-bond drops from months to a standardised listing; no internal engineering on locking, distribution, or lifecycle; pre-aggregated allocator pool from the FDF network; third-party-audited Tokino-derived core removes security review overhead; standardised disclosures cut allocator due-diligence friction per deal.

**Funnel math.** 

* 20 listings in 6 months at a 25% close rate requires \~80 qualified app conversations. Combined flow from the \~74 existing addressable cohort and new mailing list applicants supplies a multiple of that. The constraint is conversion, not lead volume.

**Launch App Partners.** 

* 5+ Featured Apps via signed LOI before mainnet, selected for category diversity (DeFi, RWA, infrastructure, consumer). Launch App Partners receive waived onboarding and case-study placement in exchange for launch participation.

**Supply-side: capital allocators**

Allocator demand resolves into four buyer types:

| Allocator type | Decision driver | Engagement path |
| :---- | :---- | :---- |
| Super Validators | Reputational alignment with ecosystem health | FDF validator-operator relationships |
| Canton ecosystem funds | Mandate-driven Featured App exposure | Foundation introductions plus direct |
| Institutional CC holders (treasuries, market makers) | Audited, on-ledger participation rewards with standardised disclosures | Wallet and custodian integration, plus direct |
| Wallet and custodian platforms | Product differentiation through integrated participation flows and service-fee model | Integration partnership |

**Launch Liquidity Partners.** 

* 2+ allocator LOIs before launch, sized to fully cover the Launch App Partners. This removes matching risk from the launch window.

**Execution and KPIs**

* GTM is owned by FDF business development. 48-hour outbound on every new mailing list applicant; structured outreach to all \~74 existing Featured Apps from Month 1; monthly allocator briefings during pre-launch, quarterly during scale; public dashboard and quarterly written report to the Tech & Ops Committee.

| Horizon | Apps Listed | CC Committed | Active Allocators |
| :---- | :---- | :---- | :---- |
| 6 months | 20+ | 100,000,000+ CC | 5+ |
| 12 months | 50+ | 250,000,000+ CC | 12+ |

**KPI derivation.** 

CC Committed targets are derived from the locking requirement specified in the Featured App Locking CIP: 5,000,000 CC per PartyId, continuously, with a 60-day unlock period. Every Featured App must lock this amount independently; there is no tier structure and no SV reuse provision.

* 6-month: 20 apps × 5M CC \= 100M CC committed  
* 12-month: 50 apps × 5M CC \= 250M CC committed

Actual onboarding rate and CC committed will be reported quarterly to the Tech & Ops Committee.

---

## **14\) Co-Marketing**

Co-marketing is sequenced against the GTM phases. Every activity is tied to a measurable outcome.

### **Phase 1: Pre-launch (Months 1-4)**

Establish the FAM as the credible standard for CIP locking before mainnet.

| Activity | Partner | Outcome target |
| :---- | :---- | :---- |
| FAM specification publication | FDF | Spec referenced in Foundation communications on CIP locking |
| Technical blog series on Tokino-derived locking | FDF | 3 posts; cross-posted by Foundation |
| Launch App Partner LOI announcements (rolling) | Launch App Partners | 5+ Featured Apps publicly named |
| Launch Liquidity Partner commitment | Launch Liquidity Partners | 2+ allocators publicly named with indicative liquidity |
| Security audit engagement announcement | FDF / audit firm | Audit scope and timeline published |

**Phase 2: Launch (Months 4-6)**

Convert pre-launch credibility into live participation.

| Activity | Partner | Outcome target |
| :---- | :---- | :---- |
| Joint launch announcement | Canton Foundation | Foundation channel placement on launch day |
| Launch blog post on the audited integration | FDF / Foundation | Cross-published; security audit summary linked |
| Twitter Space: launch partner showcase | Launch App Partners \+ Foundation | 500+ live attendees |
| Builder and operator workshops | Canton Foundation | 20+ builder teams; 10+ operators |
| Launch partner case studies | Launch App Partners | 3+ written case studies within 60 days |

### **Phase 3: Scale (Months 6-12)**

Move from launch partners to ecosystem default ahead of CIP lock-up activation.

| Activity | Partner | Outcome target |
| :---- | :---- | :---- |
| Allocator AMA series | Allocators | Quarterly; each tied to a new listing wave |
| Cohort expansion announcements | New Featured Apps | Monthly batches once flow is steady |
| Activation at Canton focused conference | Canton Foundation | Booth & speaking slots |
| Wallet and custodian integration launches | Wallet partners | 2+ integrations live by month 12 |
| Public KPI dashboard | FDF | Monthly updates; referenced in Committee reports |

### **Positioning and measurement**

* Channels: owned (FDF, FAM docs site, public dashboard), partner (Canton Foundation as primary distribution; Launch App Partners and Launch Liquidity Partners; the security audit firm for security messaging), earned (Canton tokenomics list and Discord, ecosystem media, conferences).  
* Open-source publication is a positioning decision as much as a technical one: it is the only stance that supports default-standard adoption. The full reference implementation releases in Milestone 4, post-audit and post-pilot.  
* Each activity is logged against pipeline impact (leads generated, listings sourced, allocator conversations initiated).

## **15\) \- Team & Qualifications**

FDF Technologies partners with Finoa Consensus Services (FCS) as its technical service provider. FCS is a German-incorporated, AAA-rated digital asset infrastructure firm that secures billions of dollars in assets across custody and validator services, and enables both institutions and individuals to move capital into the onchain economy. 

Backed by institutional backers including Balderton Capital, Maven11, and Signature Ventures, the broader Finoa platform operates infrastructure for 100+ digital assets and 10,000+ deployed nodes across networks, supported by a strong governance and risk framework, institutional-grade controls, operational reliability, and a consistent track record of compliance and regulatory discipline.

### **Daml & Canton Experience**

* The team created, launched, and maintains Vala Wallet, providing deep hands-on experience in Daml smart contract development, Canton node integration, and production-grade application delivery. The team also built and maintains Tokino, a Daml-based CC locking application on Canton, which forms the direct technical foundation of the FAM. Halborn security audits for both of our Canton Featured Apps Vala Wallet and Tokino are available to the committee upon request.

### **Infrastructure & Validator Operations**

* As a Node-as-a-service operator, the team operates a proven validator footprint on Canton supporting 15+ customer validators on the network. This existing infrastructure, operational experience, and network relationships directly accelerate both Marketplace development and go-to-market execution.

### **Liquid Staking & Restaking Expertise**

* The team also brings deep experience in liquid staking and restaking infrastructure. It operates infrastructure for more than 5% of capital restaked on EigenLayer and is running \+7k Ethereum Validator for leading Liquid Staking Protocols, demonstrating meaningful scale and operational credibility across some of the most important staking and restaking ecosystems in the market.

