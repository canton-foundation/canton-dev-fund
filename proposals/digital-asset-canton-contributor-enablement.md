## **Development Fund Proposal: Canton Open Source Contributor Enablement & Transition Readiness**

**Author:** Digital Asset **Status:** Draft **Created:** 2026-03-10

### **Abstract**

This proposal requests a one-time grant of 2,000,000 CC to execute the engineering migrations necessary to eliminate external contribution friction and prepare the Canton Open Source repository for a future governance handover to the Canton Foundation. The scope includes open-sourcing all remaining proprietary core features (e.g., the DB replication-based High Availability component), migrating all integration test and release pipeline code to the public repository, transitioning the core development teams' workflows to public GitHub, and establishing secure private issue tracking for the Foundation's Security Subcommittee. While CI/CD execution will remain on DA infrastructure, the underlying pipeline logic will be entirely open-sourced to enable ecosystem auditability. Actual handover of the codebase and governance to the Foundation is out of scope for this specific grant.

### **Specification**

#### **1\. Objective**

To systematically decentralize the development lifecycle of Canton Open Source and drastically reduce the barrier to entry for external contributors. By delivering this proposal, the repository will achieve operational transparency, enabling any external developer to independently compile, test, and audit the Canton node environment, while concurrently satisfying the prerequisite infrastructural readiness for the handover mandated in CIP-0082 (S7).

#### **2\. Implementation Mechanics**

Digital Asset engineers will open-source all integration test, release, and CI/CD pipeline code. While official CI/CD execution will continue to run on DA-hosted infrastructure and be triggered by DA engineers, the build mechanics will be fully transparent. In a second step, all CI/CD will be migrated to GH Actions. All remaining closed-source core features—such as the DB replication-based HA component—will be refactored and merged into the public `main` branch under Canton Open Source’s license. Digital Asset will transition team workflows, roadmap tracking, and issue management from internal systems to public GitHub boards. A segregated, private tracking environment will be configured specifically for the Security Subcommittee to handle undisclosed security work.

#### **3\. Architectural Alignment**

This proposal executes the preparatory work required for CIP-0082, specification item S7, which mandates the migration of the Canton code repositories to Foundation control. It aligns with the Development Fund’s mandate to sustain long-term investment in dev tools and core protocol plurality. This proposal also enables external contributors to contribute more, and more easily to Canton by making available Digital Asset’s integration test suite and build systems.

#### **4\. Backward Compatibility**

The migration of testing logic, release code, and issue tracking introduces no breaking changes to the Canton protocol itself.

---

### **Milestones and Deliverables**

**Milestone 1: Feature Parity & Test Logic Migration**

* **Estimated Delivery:** May 2026  
* **Focus:** Codebase completeness and public test visibility.  
* **Deliverables / Value Metrics:**  
  * All remaining closed-source core features (e.g., DB replication-based HA) merged into the open-source repository.  
  * 100% of integration test code migrated to the open-source codebase.  
  * **Acceptance Criteria (AC):** Any external developer can clone the public repository and successfully execute all integration tests locally with only few exceptions (e.g. KMS integration tests which relies on keys managed by the repo maintainers \- initially DA). The official CI/CD pipeline codebase is publicly visible in the repository.

**Milestone 2: Release Pipeline Code & Security Tracking**

* **Estimated Delivery:** July 2026  
* **Focus:** Auditability of releases and vulnerability management.  
* **Deliverables / Value Metrics:**  
  * Release process logic fully migrated and visible via the open-source codebase.  
  * Establishment of private issue tracking infrastructure designated for the Security Subcommittee.  
  * Migration of CI/CD to GitHub Actions.  
  * **Acceptance Criteria (AC):** The complete Canton release and CI/CD pipeline logic is documented, GH Actions based, and available in the open-source repository. Security infrastructure permissions and isolation parameters are validated by the Tech & Ops Committee.

**Milestone 3: Complete Team Workflow Transition**

* **Estimated Delivery:** August 2026  
* **Focus:** Open Development.  
* **Deliverables / Value Metrics:**  
  * Digital Asset core development teams transition planning and roadmap tickets to Open Source GitHub.  
  * **Acceptance Criteria (AC):** Verifiable evidence that active Canton protocol development tasks, epics, and team workflows are managed transparently in the public repository for a period of no less than one month.

---

### **Funding**

**Total Funding Request:** 2,000,000 CC

**Payment Breakdown by Milestone:**

* **Milestone 1:** 500,000 CC upon committee acceptance of deliverables (25%).  
* **Milestone 2:** 500,000 CC upon committee acceptance of deliverables (25%).  
* **Milestone 3:** 1,000,000 CC upon final release workflow transition (50%).

**Volatility Stipulation:** As this project is expected to complete within 6 months, the grant is denominated in fixed Canton Coin. Should the project timeline extend beyond 6 months due to requested scope changes by the Committee, the remaining un-minted milestones must be renegotiated to account for any significant USD/CC price volatility.

---

### **Maintenance**

Ongoing maintenance after delivery of M3 is covered by the grant proposal [*Development Fund Proposal for Maintenance of Canton Open Source*](https://github.com/canton-foundation/canton-dev-fund/pull/48)*.*  
---

### **Co-Marketing**

No co-marketing needed for this grant as marketing is expected to align with a transition of the codebase to the foundation.  
