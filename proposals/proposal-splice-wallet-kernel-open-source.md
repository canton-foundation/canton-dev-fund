# Development Fund Proposal for Maintenance of Splice Wallet Kernel Open Source

**Author:**  Digital Asset
**Status:** Submitted 
**Created:** 2026-03-05  

---

## **Abstract**

This proposal outlines a grant for Digital Asset to continue its role as the primary maintainer of the Splice Open Source repository. It requests a recurring monthly grant of 400,000 Canton Coin (CC) to support the ongoing engineering efforts required to ensure the security and stability of open source wallet tooling for Canton Network as developed in the Splice Wallet Kernel project, and allow for its efficient evolution. The specific components include, but are not exclusive to the wallet SDK, dApp SDK, dApp API standards, and Wallet Gateway components. This proposal establishes a single, recurring "maintenance" milestone commencing in March 2026\.

Major upgrades to the covered components and new feature development are out of scope for this maintenance grant and will be proposed in separate CIPs.

## **Motivation**

Digital Asset is one of the core developers of the Splice Wallet Kernel components and the current maintainer of the Splice Wallet Kernel Open Source codebase currently at https://github.com/hyperledger-labs/splice-wallet-kernel. Continued professional maintenance is critical for the health, security, and operational reliability of Canton Network’s wallet ecosystem.

As the network scales and applications get more complicated, the criticality of wallet tooling that allows for the development of secure and interoperable wallets and the associated rigorous security patching, release management, and continuous integration of that tooling increases. Ensuring that the Splice Wallet Kernel tooling remains stable and secure requires a dedicated team of engineers familiar with the codebase's history and architecture. This grant ensures that Digital Asset can sustain the resources necessary to perform these essential duties for the benefit of the entire ecosystem.

This proposal should be looked at in conjunction with a grant proposal which would transition Splice Wallet Kernel from Hyperledger to the Canton Foundation. This grant proposal is expected to transition maintenance services for the foundation owned Splice Wallet Kernel Open Source project together with the transition of the project from Hyperledger to the Canton Foundation.

## **Specification**

### **1\. Objective**

The primary objective of this proposal is to secure the continuous maintenance and incremental improvement of the Apache 2.0 licensed Splice Wallet Kernel Open Source codebase. By fully delivering on this proposal, the Canton Network ecosystem will benefit from:

* **Stability:** Regular bug fixes and regression testing.  
* **Security:** Proactive identification and resolution of vulnerabilities.  
* **Reliability:** Consistent release cycles and CI/CD pipeline management.  
* **Community Support:** Expert review of external contributions and threading of upstream changes.  
* **Release Management and Rollout:** Coordination of the rollout of associated components to impacted custodians, exchanges, and wallets.  
* **Infrastructure:** High quality infrastructure including managed GH resources, test and release pipelines and compute infrastructure, SAST and supply chain scanning, performance regression testing,  

### **2\. Milestones and Deliverables**

In accordance with CIP-0100, this proposal utilizes a recurring "maintenance" milestone structure.

#### **Ongoing Milestone: Monthly Maintenance**

* **Start Date:** March 2026  
* **Frequency:** Monthly  
* **Description:** Digital Asset will provide comprehensive maintenance services for the Splice Open Source repository currently at https://github.com/hyperledger-labs/splice-wallet-kernel. This service will transition to a Canton Foundation managed repo when the Splice Wallet Kernel project moves across from Hyperledger.  
* **Detailed Services Rendered:**  
  * **Security:** Monitoring for vulnerabilities, applying security patches, and managing disclosure processes.  
  * **Bugfixes:** Triage and resolution of issues reported by the community or identified through internal testing.  
  * **Releases:** Management of the release lifecycle, including tagging, packaging, and publishing release notes for regular updates.  
  * **CI/CD:** Maintenance and optimization of Continuous Integration and Continuous Deployment pipelines to ensure build integrity.  
  * **Testing:** ongoing unit, integration, and system testing to prevent regressions.  
  * **Community Engagement:** Reviewing pull requests and working with other contributors to merge improvements.  
  * **Upstream Management:** Threading through upstream changes and dependencies to keep the codebase current.  
  * **Issue Management:** Tracking work items as GitHub issues, and organizing them in GitHub milestones and projects.  
  * **Developer Docs:** Documentation on how to build the software, how to test it locally and in CI, and how to contribute to it.  
  * **Contributor Management:** Management of permissioning on the repo per different levels of contributions, e.g. direct access to CI, permissions on protected branches, etc.

#### **Acceptance Criteria**

The Tech & Ops Committee (or the Core Contributor Group) can evaluate the completion of this milestone quarterly based on the following evidence:

* Publication of release notes for any new versions deployed during the period.  
* Visible activity in the public repository (commits, merged PRs, issue responses).   
* Activity in the contributor and community help-channel \#team-wallet-external. Response to community technical inquiries by qualified contributors on \#team-wallet-external within 24 hours on business days.  
* Service Level Objectives (SLOs)**:**  
  * Critical security vulnerabilities reported via the responsible disclosure process have a mitigation plan or patch available within 48 hours of discovery.  
  * Pull Requests from external contributors reviewed within 5 business days.

### **3\. Funding**

* **Funding Request:** 400,000 Canton Coin (CC) per month. This covers:  
  * Approximately one senior full time engineer working on the code base.  
  * All related Test, Repo, CI/CD, and Release infrastructure costs and infrastructure engineering.  
* **Payment Schedule:** By default, funding is released on a monthly basis, at the end of each month, starting March 2026\. Should committee members challenge Digital Asset’s performance with respect to the Acceptance Criteria, the voting members may proactively vote to delay payment until a decision is reached.  
* **Renewal:** Improvements and services are assessed on a quarterly cycle. This grant is expected to renew quarterly upon satisfactory review of the Acceptance Criteria by the Tech & Ops committee for the preceding quarter.  
* **Rebasing on CC price movements:** The funding request for this grant proposal will be reassessed on a quarterly basis based both on actual workload for maintenance activities and based on CC price movements.

### **4\. Co-Marketing**

There are no co-marketing needs or asks associated with this proposal.

