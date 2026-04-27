# Development Fund Proposal for Maintenance of Daml Open Source

**Author:**  Digital Asset
**Status:** Submitted 
**Created:** 2026-03-05  

---

## **Abstract**

This proposal outlines a grant for Digital Asset to continue its role as the primary maintainer of the Daml and Daml SDK Open Source repositories. It requests a recurring monthly grant of 1,000,000 Canton Coin (CC) to support the ongoing engineering efforts required to ensure the security and stability of the Daml SDK as developed in related open source projects, and allow for its efficient evolution. The specific components include, but are not exclusive to the Daml Smart Contract language, its compiler and IDE, the dpm CLI assistant, client libraries and related code generation, the Participant Query Store (PQS), Daml Shell, Daml Script, and all related documentation. This proposal establishes a single, recurring "maintenance" milestone commencing in March 2026\.

Major language and SDK upgrades and new feature development are out of scope for this maintenance grant and will be proposed in separate CIPs.

## **Motivation**

Digital Asset is the core developer of Daml and the current maintainer of the Open Source Daml SDK codebase currently housed in a number of repositories in the [https://github.com/digital-asset/](https://github.com/digital-asset/) organization. Continued professional maintenance is critical for the network's health, security, and developer experience.

As the network scales, the demands on its developer tooling increase, requiring rigorous security patching, release management, and continuous integration across all related projects. Ensuring that all core Daml developer tooling remains stable and secure requires a dedicated team of engineers familiar with the codebase's history and architecture. This grant ensures that Digital Asset can sustain the resources necessary to perform these essential duties for the benefit of the entire ecosystem.

This proposal should be looked at in conjunction with grant proposals which would transition the Daml SDK from Digital Asset to the Canton Foundation, and which would open source PQS and Shell. This grant proposal is expected to transition maintenance services for the foundation owned Daml projects together with the transition of the projects from Digital Asset to the Canton Foundation.

## **Specification**

### **1\. Objective**

The primary objective of this proposal is to secure the continuous maintenance and incremental improvement of the Apache 2.0 licensed Splice Open Source codebases. By fully delivering on this proposal, the Canton Network ecosystem will benefit from:

* **Stability:** Regular bug fixes and regression testing.  
* **Security:** Proactive identification and resolution of vulnerabilities.  
* **Reliability:** Consistent release cycles and CI/CD pipeline management.  
* **Community Support:** Expert review of external contributions and threading of upstream changes.  
* **Release Management and Rollout:** Coordination of the rollout of Splice release to Super Validators and Validators.  
* **Infrastructure:** High quality infrastructure including managed GH resources, test and release pipelines and compute infrastructure, SAST and supply chain scanning, performance regression testing,  

### **2\. Milestones and Deliverables**

In accordance with CIP-0100, this proposal utilizes a recurring "maintenance" milestone structure.

#### **Ongoing Milestone: Monthly Maintenance**

* **Start Date:** March 2026  
* **Frequency:** Monthly  
* **Description:** Digital Asset will provide comprehensive maintenance services for the Splice Open Source repositories listed below. This service will transition to a Canton Foundation managed repos when Daml moves across from Digital Asset.  
* **Repositories and Projects Covered:**  
  * [https://github.com/digital-asset/daml](https://github.com/digital-asset/daml) containing Daml language, compiler, IDE, Script, Java & Typescript Bindings and codegen.  
  * [https://github.com/digital-asset/dazl-client](https://github.com/digital-asset/dazl-client) containing a Python language binding.  
  * [https://github.com/digital-asset/dpm](https://github.com/digital-asset/dpm) containing the dpm command line assistant.  
  * [https://github.com/digital-asset/docs](https://github.com/digital-asset/docs) containing the developer documentation.  
  * PQS and Daml Shell repositories as of when they are open sourced.  
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
* Activity in the contributor and community help-channel \#canton-contributors. Response to community technical inquiries by qualified contributors within 24 hours on business days.  
* Service Level Objectives (SLOs)**:**  
  * Critical security vulnerabilities reported via the responsible disclosure process have a mitigation plan or patch available within 48 hours of discovery.  
  * Pull Requests from external contributors reviewed within 5 business days.

### **3\. Funding**

* **Funding Request:** 1,000,000 Canton Coin (CC) per month. This covers:  
  * Approximately three senior full time engineers working on the code base.  
  * All related Test, Repo, CI/CD, and Release infrastructure costs and infrastructure engineering.  
* **Payment Schedule:** By default, funding is released on a monthly basis, at the end of each month, starting March 2026\. Should committee members challenge Digital Asset’s performance with respect to the Acceptance Criteria, the voting members may proactively vote to delay payment until a decision is reached.  
* **Renewal:** Improvements and services are assessed on a quarterly cycle. This grant is expected to renew quarterly upon satisfactory review of the Acceptance Criteria by the Tech & Ops committee for the preceding quarter.  
* **Rebasing on CC price movements:** The funding request for this grant proposal will be reassessed on a quarterly basis based both on actual workload for maintenance activities and based on CC price movements.

### **4\. Co-Marketing**

There are no co-marketing needs or asks associated with this proposal.