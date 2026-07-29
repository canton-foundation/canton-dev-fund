## **Development Fund Proposal: Canton Application Metadata and Deployment Standardization**

| Field | Value                                                                  |
| :---- |:-----------------------------------------------------------------------|
| Author | Semyon Protas, Yury Korzun (PixelPlex), David Richards (Digital Asset) |
| Org | PixelPlex & Digital Asset                                              |
| Status | Draft                                                                  |
| Created | 2026-07-29                                                             |

---
## **Abstract**

Unlike monolithic layer-1 protocols where smart contract artifacts reside uniformly on-chain, the Canton Network requires node operators to independently ingest and host Daml Archive (DAR) packages to support decentralized applications (dApps). This structural paradigm introduces a critical bottleneck for dApp developers seeking node operator support. This proposal establishes a formalized, open standard (via CIP) and automated validation tooling to standardize how DAR metadata, security audits, and dependencies are published. Executed jointly by PixelPlex and Digital Asset, this initiative ensures ecosystem plurality by removing the operational friction of DAR deployment, culminating in verifiable adoption by 10 independent ecosystem partners.

## **Motivation & Rationale**

**Why is this valuable:**

In the Canton ecosystem, dApp builders do not deploy code to a neutral chain state; they rely on node operators to host their specific application DARs. Without a unified standard, this creates a severe bottleneck and forces fragmented, manual deployments for every new decentralized application and upgrade.

Recent ecosystem feedback solicited from 10 wallet providers who host validator nodes, carried out by Digital Asset, identified three critical deployment blockers:

* **Security Liability:** Operators highlight severe concerns regarding malicious code that could compromise validator environments or trick end-users into signing malicious transactions.
* **Audit & Source Verification:** Infrastructure providers mandate formal security assessments and require cryptographic proof that a deployed DAR exactly matches the vetted source code.
* **Dependency Management ("Version Hell"):** Unverified version compatibility and manual DAR loading introduce unsustainable operational overhead. This architectural flaw materialized recently when an application DAR failed due to a missing, un-deployed Splice dependency on MainNet.

Digital Asset has already witnessed the manual process and difficulty that application builders have in trying to get their DARs hosted by wallet providers and node operators. It's important to resolve the issues highlighted here before more application builders experience the same difficulty on the Canton Network.

**Why is this the right approach to deliver that value:**

This approach is optimal for three operational reasons:

* **Verifiable Risk Mitigation:** Currently, node operators rely on manual, high-liability heuristics to determine if a third-party DAR is safe to host. By enforcing a standardized schema for dependencies and security audits, we give the option for node operators to move to more automated, programmatic CI/CD validation.
* **Ecosystem Plurality & Anti-Rent-Seeking:** Distributing the attestation of DAR safety across multiple independent ecosystem partners (wallets, auditors, and dApp builders) creates a verifiable web of trust.
* **Compounding Public Goods:** When an independent security firm or wallet provider publishes a DAR review to this open standard, the data becomes a reusable public good. Node operators instantly gain the cryptographic and operational confidence required to host the application, reducing developer friction and accelerating network-wide dApp deployment without compromising infrastructure security.

It is expected that once longer-standing, more trusted node operators post the DARs which they support, it will give newer node operators a starting set of applications which they are more likely to trust to host.

By enforcing that 50% of the capital is locked behind the verifiable use of the standard by 10 independent entities (Wallets, dApps, Auditors), the Foundation ensures it is buying a functioning network effect, not just a static repository of code.

## **Specification & Implementation**

**1. Objective**

To design, implement, and drive adoption of a standardized metadata and DAR deployment architecture that allows any Canton network participant to programmatically verify and host dApp packages. A draft CIP has already been proposed and is receiving feedback.

**2. Implementation Mechanics**

The implementation of this proposal is bifurcated into two parallel technical and operational workstreams executed jointly by Digital Asset (DA) and PixelPlex:

* **Standardization & Protocol Design:** The metadata schema will be formalized via the CIP process, defining the strict data structures for dependencies, reproducible build instructions (`build-config.json`), and security audits (`audit-report.json`). This establishes the standardized Git repository architecture required for machine-readable package verification.
* **Tooling & Automation Engineering:** Develop the open-source CLI tooling and CI/CD GitHub Actions. This software will programmatically parse the standardized Git repositories, validate the application data, and execute the DAR upload sequence to Canton validators via the Ledger API without manual intervention.
* **Ecosystem Integration:** Following the tooling release, the integration of this schema will be driven across a target matrix of 10 independent ecosystem partners (4 Wallets, 4 dApps, 2 Auditors) to establish the verifiable network effect.

**3. Architectural Alignment**

This standardizes the interface for communicating DAR information between application developers, security auditors, and node infrastructure providers. It strictly enforces decentralization by providing open-source, non-proprietary tooling for DAR package verification.

**4. Backward Compatibility**

This proposal introduces a net-new metadata standard and therefore no backward compatibility is needed. The schema may need to be adjusted in the future as the network evolves. Any changes will ensure that older schemas remain backward compatible.

## **Milestones and Deliverables**

### **Milestone 1: CIP Submission & Initial Automations MVP**

*Estimated Delivery: 1 month after proposal approval*

Focus: Formalizing the standard and establishing the baseline tooling infrastructure.

* **Deliverable 1.1 — Finalize the CIP:** Submit the CIP to the `canton-foundation/cips` repository.
    * *Acceptance Criterion:* PR is open, passes initial formatting checks, and is actively under review by the CIP editorial team.
* **Deliverable 1.2 — MVP of DAR uploading automations.**
    * *Acceptance Criterion:* A CLI tool/script is published to a public repository capable of parsing the proposed metadata schema and executing a successful Ledger API upload on a local Canton sandbox without errors.

### **Milestone 2: Automation Hardening & Release**

*Estimated Delivery: 4 months after the delivery of Milestone 1*

Focus: Production-ready automation workflows for ecosystem consumption.

* **Deliverable 2.1 — Production release of the automation suite.**
    * *Acceptance Criterion:* V1.0 of the automation tooling is released. Includes automated CI/CD GitHub Action templates that parse the DAR dependency tree and output a strict pass/fail validation against the CIP schema.

**Milestone 2 Engineering Estimate** *(CC price assumption: $0.15 / CC)*

| Task | Task Details | Hours | Funding Required (CC) |
| :---- | :---- | ----: | ----: |
| DAR Dependency Analysis Engine | DAR parsing, Dalf package extraction, recursive dependency resolution, package fingerprinting, dependency graph construction, compatibility analysis against deployed Canton packages | 180 | 120,000 |
| Metadata & Schema Validation Engine | Validation of application metadata, CIP schema enforcement, audit artifact verification, source code verification, integrity checks, validation reporting framework | 140 | 90,000 |
| Cryptographic Verification Framework | DAR integrity validation, source-to-DAR reproducibility checks, signed metadata support, signature verification, trust-chain validation mechanisms | 120 | 80,000 |
| Production Automation CLI | Production-grade CLI implementation, configuration management, structured logging, error handling, packaging, release management, cross-platform support | 120 | 80,000 |
| GitHub Actions & CI/CD Automation Suite | Reusable GitHub Actions, PR validation workflows, release validation workflows, automated compliance reporting, reference CI templates | 100 | 65,000 |
| End-to-End Testing & Security Hardening | Canton sandbox infrastructure, automated integration testing, negative testing, parser hardening, security validation, regression test suite | 100 | 65,000 |
| Documentation & Reference Implementations | Integrator guide, operator guide, architecture documentation, schema reference, example repositories, reference implementations | 60 | 40,000 |
| **Total** | | **820** | **540,000 CC** |

### **Milestone 3: Ecosystem Adoption (The "Public Good" Trigger)**

*Estimated Delivery: 2 months after the delivery of Milestone 2*

Focus: Verifiable, cross-ecosystem integration of the standard.

* **Deliverable 3.1 — Provable adoption by 10 distinct ecosystem entities.**
    * *Acceptance Criterion:* 4 Wallet Providers, 4 dApp Builders, and 2 Security Auditing Firms successfully publish their application information, strictly conforming to the standard defined in Milestone 1, via a public Git repository. The automation suite (Milestone 2) must return a `Validation: SUCCESS` state for all 10 repositories.
* **Deliverable 3.2 — Publish Blog Article.**
    * *Acceptance Criterion:* Publishing a joint technical case study explaining the standard and the problem that it solves, demonstrating the 10 adoption repositories and open-sourcing the CI/CD templates for the broader developer community.

## **Funding**

* **Total Funding Request:** 2,000,000 Canton Coin (CC)
    * PixelPlex Allocation: 1,000,000 CC
    * Digital Asset Allocation: 1,000,000 CC

**Payment Breakdown by Milestone:**

| Milestone | Funding | PixelPlex / Digital Asset Split |
| :---- | ----: | :---- |
| Milestone 1: CIP Submission & Initial Automations MVP | 460,000 CC | 260,000 PP / 200,000 DA |
| Milestone 2: Automation Hardening & Release | 540,000 CC | 540,000 PP / 0 DA |
| Milestone 3: Ecosystem Adoption | 1,000,000 CC | 200,000 PP / 800,000 DA |

Payments are released upon committee acceptance of each milestone's deliverables, with Milestone 3 released upon final release and verifiable adoption.

**Volatility Stipulation**

Should the project timeline extend beyond 6 months due to requested scope changes by the Committee, the remaining un-minted milestones must be renegotiated to account for any significant USD/CC price volatility.

**Timeline Risk Management**

* **Acceleration Bonus:** If Milestone 3 is delivered and verified more than 1 month ahead of the Estimated Delivery schedule, the final payout will receive a +20% adjustment (to 1,200,000 CC for Milestone 3).
* **SLA Penalty:** For every 30 days of delay beyond the Estimated Delivery date for Milestone 3, the final milestone payout decreases by 25%.
* **Fallback Logic:** Should a Canton Network core upgrade introduce breaking changes to the Ledger API during the execution of Milestone 2, the delivery timeline will automatically pause for up to 30 days to allow PixelPlex to refactor the automation suite without incurring SLA penalties.

## **Co-Marketing**

Upon release, PixelPlex and Digital Asset will collaborate with the Foundation on publishing a joint technical case study explaining the standard and the problem that it solves, demonstrating the 10 adoption repositories and open-sourcing the CI/CD templates for the broader developer community.
