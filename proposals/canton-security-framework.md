# Canton Security Framework (CSF) — Security Grant Proposal

**Proposer:** CredShields Technologies Pte. Ltd.  
**Prepared for:** Canton Foundation  
**Created:** 2026-03-12  
**Contact:** info@credshields.com | credshields.com
**Tech and Ops Committee Champion:** Canton Foundation

---

## Objective and Scope

CredShields proposes the development of the **Canton Security Framework (CSF)** — a structured, open-source security methodology purpose-built for DAML-based applications on Canton — alongside a **Canton-native security validation tool** that enables developers to apply CSF principles during active development.

**Problem Statement:**  
DAML-based applications present a categorically different security challenge from EVM smart contracts. Canton application security risks emerge from workflow design, authorization model construction, privacy configuration, cross-domain coordination, and package lifecycle governance. No structured, publicly available security framework currently exists for this class of application.

**Scope of Work:**
- Research and enumerate Canton-specific vulnerability classes into a formal risk taxonomy (CSF)
- Produce a DAML Workflow Security Checklist for developer and auditor use
- Develop CIP-56 Security Validation Guidelines addressing token lifecycle risks and authentication gaps
- Build a Canton-native AI-powered security validation CLI tool implementing CSF-aligned detection rules
- Publish two reference security analyses applying CSF to real Canton application patterns
- Launch a public developer documentation site covering DAML security design patterns

All outputs will be publicly accessible and open-source, free to use by the entire Canton ecosystem.

---

## Technical Approach

### Canton Security Framework — Risk Taxonomy

The CSF is modelled on the Smart Contract Weakness Enumeration (SCWE), which CredShields co-authored with the OWASP Foundation. SCWE covers 156 enumerated weakness entries for EVM-based contracts. The CSF introduces an equivalent for DAML-based Canton applications, derived from direct codebase review experience, the DAML SDK security documentation, the CIP-56 specification, and Canton protocol research.

| ID | Risk Category | Severity | Description |
|----|--------------|----------|-------------|
| CSF-01 | Signatory Controller Misconfiguration | Critical | Incorrectly assigning a party as both signatory and controller grants unilateral execution rights. In financial settlement workflows, a single participant can unilaterally archive a counterparty's position without consent. |
| CSF-02 | Unintended Divulgence via Transitive Consequences | High | In complex DvP workflows, transitive contract consequences expose positions and holdings to settlement participants who were never meant to observe them — violating the need-to-know privacy model. |
| CSF-03 | Cross-Domain Byzantine Participant Exploit | Critical | A Byzantine signatory can silently block or delay settlement by refusing to confirm cross-domain transactions with no default timeout guarantee — a contract-level denial-of-service vector for SLA-bound workflows. |
| CSF-04 | Package Upgrade Compatibility Gap (LF 1.15/1.17) | High | Upload-time compatibility checks for LF 1.17 packages with LF 1.15 data dependencies compare only package names, versions, and module identifiers — not package IDs or content — potentially allowing silent runtime inconsistencies. |
| CSF-05 | CIP-56 Off-Ledger Registry Authentication Gap | High | CIP-56 explicitly defers authentication standardisation for off-ledger registry APIs. Registry endpoints exposing investor holdings and in-progress transfers have no standardised access control layer. |
| CSF-06 | Namespace Root Key Non-Rotation | Medium | Canton's permanent namespace root signing key cannot be rotated without losing the namespace. Keys are stored in cleartext by default unless KMS is explicitly configured, exposing participant node identity to compromise. |
| CSF-07 | Explicit Contract Disclosure Misuse | Medium | The ECD (Explicit Contract Disclosure) feature can be abused to submit commands referencing contracts whose visibility the submitting party has not legitimately obtained — bypassing the intended privacy model. |

---

> **Technical Note on CSF-02: Divulgence:** DAML's own documentation notes that divulgence 'needs to be considered when designing Daml models for privacy sensitive applications.' The CSF formalises this consideration into reviewable validation rules for the first time, covering the specific multi-leg settlement and DvP patterns common in Canton institutional deployments.

> **Technical Note on CSF-04: Package Upgrade Gap:** The indicative gap in the Daml 2.10.1 release notes: the upload-time compatibility check for LF 1.17 packages with LF 1.15 data dependencies compares only package names, versions, and module identifiers not package IDs or content. The CSF will include explicit validation guidance for upgrade chains crossing the LF 1.15/1.17 boundary.

> **Technical Note on CSF-05: CIP-56 Registry Authentication:** CIP-56 itself acknowledges: 'This CIP thus does not standardize an authentication scheme for the off-ledger APIs of registries.' The CSF will document the specific attack surface this creates and provide implementation guidance for registry operators.

---

### Illustrative Technical Depth

**CSF-01: Signatory Controller Misconfiguration**

```daml
template HoldingTransfer
  with
    owner : Party
    custodian : Party  -- signatory
    amount : Decimal
  where
    signatory custodian
    observer owner
    choice Transfer : ContractId HoldingTransfer
      with newOwner : Party
      controller custodian  -- custodian can unilaterally transfer
      do create this with owner = newOwner
```

In this pattern, the custodian can reassign ownership without the owner's authorisation — a critical violation in a regulated custody context. The CSF will formalise the validation rule: no party should hold unilateral controller rights over choices that archive and recreate contracts in which another party is a stakeholder, without that party's co-authorisation.

**CSF-02: Divulgence in Multi-Leg Settlement**

In a three-party settlement (Custodian, Buyer, Seller): when Custodian exercises `SettleTrade`, Buyer gains divulged visibility into Seller's `AssetHolding` contract and Seller gains divulged visibility into Buyer's `CashPosition` — despite neither being a stakeholder on the other's contract. The CSF will provide validation patterns and design guidance for isolating settlement legs.

**CSF-05: CIP-56 Transfer Pre-Approval Misuse**

Pre-approval configurations without instrument ID constraints, amount limits, or counterparty restrictions allow any party with knowledge of the investor's contract ID to initiate unlimited inbound transfers. The CSF will define minimum required constraint parameters for production pre-approval configurations.

### Canton-Native Security Validation Tool

The CredShields Canton scanner is an **AI-powered static analysis tool** — not a test runner. Unlike `dpm test`, which executes developer-written test cases, the scanner analyses DAML workflow structure to surface security weaknesses that no test suite would catch.

**What the tool detects:**
- Signatory-controller misconfigurations granting unilateral execution rights
- Divulgence exposure in multi-party workflow consequence trees
- CIP-56 implementation risks including overly permissive pre-approval configurations
- Cross-domain trust boundary violations not modelled by `dpm sandbox`
- Package upgrade chain risks across LF 1.15/1.17 dependency boundaries

**Design:**
- Static analysis of DAML workflow structure — not test execution
- Detector logic derived from real audit findings and CSF research
- Lightweight CLI, free to use for all Canton ecosystem teams
- Developer-friendly output with finding descriptions, CSF risk category mapping, and remediation guidance

### Research Methodology

| Phase | Description |
|-------|-------------|
| Phase 1: Ecosystem Research | Direct review of Canton application codebases, DAML SDK security documentation, Canton protocol papers, CIP-56 specification, and Splice/Global Synchronizer Foundation repository. Community engagement via Canton developer forums. |
| Phase 2: Risk Classification | Structured taxonomy of Canton-specific vulnerability classes with formal descriptions, attack scenarios, detection methodology, and remediation patterns. Community review before finalisation. |
| Phase 3: Validation & Practical Application | Framework applied to reference Canton applications; validation rules translated into checklist-based reviews and the Canton-native CLI tool. |
| Phase 4: Publication & Ecosystem Release | Framework, checklist, and guidelines published with full methodology disclosure. Developer documentation site launched with supporting examples. |

---

## Architectural Alignment

The CSF is purpose-built for Canton's architecture and DAML's workflow-first model:

- **Canton-native:** All tooling and taxonomy is designed specifically for DAML-based application development — not adapted from EVM or generic smart contract tooling.
- **DAML SDK aligned:** Risk categories and validation rules are derived directly from DAML SDK security documentation, CIP-56, and hands-on Canton application codebase reviews.
- **Open-source:** The Canton Security Framework will be published as a public GitHub repository under an open-source licence, accessible to all Canton developers, auditors, and institutions.
- **CI/CD compatible:** The validation CLI is designed for lightweight integration into existing developer workflows and enterprise CI/CD pipelines.
- **Standards-based:** Modelled on the OWASP Smart Contract Security Standards (which CredShields co-authored), providing a familiar structure for the institutional and developer community.

---

## Milestones and Deliverables

| Milestone | Description | Target |
|-----------|-------------|--------|
| M1.1 | Canton architecture research and initial CSF taxonomy draft | Week 4 |
| M1.2 | CSF risk taxonomy and report finalised; research phase complete | Week 4 |
| M2.1 | DAML Workflow Security Checklist v1 published for community review | Week 10 |
| M2.2 | CIP-56 Security Validation Guidelines v1 published | Week 10 |
| M2.3 | Initial release of Canton-native security validation tool (CLI) with CSF-aligned validation rules and developer usage documentation | Week 14 |
| M2.4 | Checklist, guidelines, and validation rules refined based on ecosystem feedback | Week 18 |
| M3.1 | Reference security analyses (×2) completed and published | Week 18 |
| M3.2 | Canton Security Framework (CSF) v1.0 published on GitHub | Week 18 |
| M3.3 | Developer documentation site live; final grant report submitted | Week 18 |

### Full Deliverables

| Deliverable | Definition of Done |
|-------------|-------------------|
| Initial Risk Taxonomy Draft & Research Report | Research memo published in a public repository covering Canton architecture analysis, DAML workflow security observations, CIP-56 risk surfaces, and the initial CSF taxonomy draft. |
| DAML Workflow Security Checklist | Standalone PDF + Markdown checklist with per-template validation questions for signatory/controller roles, choice permissions, observer configuration, divulgence exposure, cross-domain workflows, and upgrade governance. |
| CIP-56 Security Validation Guidelines | Technical document defining validation rules for CIP-56 implementations including lifecycle security, transfer workflows (FOP/DvP), off-ledger registry authentication, and pre-approval constraints. |
| Canton-Native Security Validation Tool (Initial Release) | CLI tool implementing CSF-aligned validation rules. Includes sample usage, developer documentation, and onboarding guide. |
| Reference Security Analyses | Two public case studies applying CSF methodology to real Canton application patterns (CIP-56 + cross-domain workflows), with full methodology, findings, and remediation guidance. |
| Canton Security Framework (CSF) | Public GitHub repository containing full CSF taxonomy, validation rules, reviewer methodology, and annotated DAML examples across all risk categories. Licensed as open-source. |
| Developer Security Documentation | Hosted documentation site (GitHub Pages) covering DAML security design patterns, workflow validation, authorization models, divulgence-aware design, upgrade governance, and validation tool usage. |

---

## Acceptance Criteria

- [ ] CSF risk taxonomy published with a minimum of 7 enumerated weakness categories, each including formal description, attack scenario, detection methodology, and remediation pattern
- [ ] DAML Workflow Security Checklist published as both PDF and Markdown, structured for internal and third-party audit use
- [ ] CIP-56 Security Validation Guidelines cover lifecycle security, FOP/DvP workflows, registry authentication gaps, and pre-approval constraints
- [ ] Canton-native security validation CLI released publicly, implementing CSF-aligned detection for all in-scope risk categories
- [ ] Two reference security analyses published with full methodology and findings
- [ ] CSF v1.0 published as an open-source GitHub repository
- [ ] Developer documentation site live with onboarding guidance and usage examples
- [ ] 5+ Canton teams applying CSF within 90 days of publication
- [ ] CSF referenced in at least one external audit report within 6 months of publication
- [ ] Validation tool adopted by 3+ active Canton teams within the grant period

---

## Funding Request and Milestone Breakdown

**Total Funding Request: $62,500 USD**

| Milestone | Scope | Effort | Amount |
|-----------|-------|--------|--------|
| Security Research & Framework Design | Canton ecosystem research, CSF taxonomy development, initial validation rules, and community review | 2 Senior Researchers × 4 weeks | $10,000 |
| Checklist & Guidelines Development | DAML workflow checklist and CIP-56 validation guidelines, aligned with CSF methodology and validation logic mapping | 2 Senior Researchers × 6 weeks + Audit Team | $25,000 |
| Canton-Native Validation Tool (Initial Development) | Design and implementation of the Canton-specific validation tool, including validation logic engineering, CLI development, and developer usability layer | Core Engineering & Dev Team × 4 weeks | $15,000 |
| Reference Analyses, Framework Publication & Documentation | Reference analyses, CSF v1.0 publication, developer documentation site, and final reporting | 2 Researchers + 1 Technical Writer × 4 weeks | $12,500 |
| **Total** | | | **$62,500** |

All outputs produced under this grant will be delivered as publicly accessible security infrastructure, with free-to-use tooling and open standards accessible to the entire Canton ecosystem.

---

## Team

**Shashank — Co-Founder & CEO**  
Previously: HackerOne, Cobalt, Deriv, Avalanche. 10+ years identifying and disclosing vulnerabilities to global organisations. Listed in the Security Hall of Fame of Apple (CVE-2017-7063, CVE-2017-7062, CVE-2017-2458), Google, Twitter, Facebook, Dropbox, and 40+ others.

**Indranil Roy — Co-Founder & CBO**  
Previously: Deloitte Cyber Risk. Enterprise security background with experience building security solutions for multinational corporations. Listed in the Security Hall of Fame of Tesla, Samsung, Nokia, Philips, Cisco, Mailgun, SoundCloud, and 10+ others.

**Senior Security Researchers (×2)**  
Hands-on DAML and Canton application codebase review experience, having collectively led and contributed to security engagements across two DAML-based applications prior to this proposal. The CSF risk categories — including CSF-01, CSF-02, CSF-04, and CSF-05 — were derived from findings identified in that first-hand work.

**Team Competencies:**
- Functional programming background in Haskell
- Working knowledge of the full DAML SDK toolchain
- CIP-56 specification literacy
- Formal authorization reasoning across choice permission hierarchies
- Multi-party workflow threat modelling
- Sub-transaction privacy model analysis
- Hands-on experience with DAML package versioning and upgrade chain validation across LF versions

**Credentials:**
- SOC 2 certified
- OWASP Smart Contract Top 10 Authors
- 700+ AI vulnerability detectors; 6 million+ scans completed
- 350+ security audits published at [github.com/Credshields/audit-reports](https://github.com/Credshields/audit-reports)
- Ethereum Foundation Grant recipient
- Active pilots with KPMG and RBC

---

## Long-Term Maintenance Commitment

CredShields commits to the following maintenance terms for all grant deliverables:

1. **Active maintenance for 12 months** post-publication, covering framework updates triggered by Canton protocol upgrades, DAML SDK releases, and CIP changes
2. **Community issue response within 5 business days** on the public GitHub repository
3. **At least one framework revision** within the 12-month period incorporating ecosystem feedback
4. After 12 months, the framework transitions to community-maintained status under its open-source licence, with CredShields retaining the right — but not the obligation — to continue updates based on commercial engagement with the Canton ecosystem

---

*CredShields Technologies Pte. Ltd. | 20A Tanjong Pagar Road, Singapore 088443*  
*credshields.com | info@credshields.com*
