# Development Fund Proposal for Maintenance of Canton Open Source

**Author:**  Digital Asset
**Status:** Submitted 
**Created:** 2026-03-05  

## **Abstract**

This proposal outlines a grant for Digital Asset to continue its role as the primary maintainer of the Canton Open Source repository. It requests a recurring monthly grant of 2,000,000 Canton Coin (CC) to support the ongoing engineering efforts required to ensure the security and stability of the Canton protocol, and allow for its efficient evolution. This proposal establishes a single, recurring "maintenance" milestone commencing in March 2026\.

Major protocol upgrades and new feature development are out of scope for this maintenance grant and will be proposed in separate CIPs.

## **Motivation**

Digital Asset is the core developer of Canton and the current maintainer of the Canton Open Source codebase currently at https://github.com/digital-asset/canton. Continued professional maintenance is critical for the network's health, security, and operational reliability.

As the network scales, the demand for rigorous security patching, release management, and continuous integration increases. Ensuring that the core protocol remains stable and secure requires a dedicated team of engineers familiar with the codebase's history and architecture. This grant ensures that Digital Asset can sustain the resources necessary to perform these essential duties for the benefit of the entire ecosystem.

This proposal should be looked at in conjunction with the grant proposal which prepares the Canton Open Source repository for transition to the Canton Foundation. This grant proposal is expected to transition maintenance services for the foundation owned Canton Open Source project together with the transition of the project from Digital Asset to the foundation.

## **Specification**

### **1\. Objective**

The primary objective of this proposal is to secure the continuous maintenance and incremental improvement of the Apache 2.0 licensed Canton Open Source codebase. By fully delivering on this proposal, the Canton ecosystem will benefit from:

* **Stability:** Regular bug fixes and regression testing.  
* **Security:** Proactive identification and resolution of vulnerabilities.  
* **Reliability:** Consistent release cycles and CI/CD pipeline management.  
* **Community Support:** Expert review of external contributions and threading of upstream changes.  
* **Infrastructure:** High quality infrastructure including managed GH resources, test and release pipelines and compute infrastructure, SAST and supply chain scanning, performance regression testing,  

### **2\. Milestones and Deliverables**

In accordance with CIP-0100, this proposal utilizes a recurring "maintenance" milestone structure.

#### **Ongoing Milestone: Monthly Maintenance**

* **Start Date:** March 2026  
* **Frequency:** Monthly  
* **Description:** Digital Asset will provide comprehensive maintenance services for the Canton Open Source repository currently at [https://github.com/digital-asset/canton](https://github.com/digital-asset/canton). This service will transition to a foundation managed repo when Canton Open Source moves across.  
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
* Activity in the contributor help-channel \#canton-contributors. Response to community technical inquiries by qualified contributors within 24 hours on business days.  
* Service Level Objectives (SLOs)**:**  
  * Critical security vulnerabilities reported via the responsible disclosure process have a mitigation plan or patch available within 48 hours of discovery.  
  * Pull Requests from external contributors reviewed within 5 business days.

### **3\. Funding**

* **Funding Request:** 2,000,000 Canton Coin (CC) per month. This covers:  
  * Approximately five senior full time engineers working on the code base.  
  * All related Test, Repo, CI/CD, and Release infrastructure costs and infrastructure engineering.  
* **Payment Schedule:** By default, funding is released on a monthly basis, at the end of each month, starting March 2026\. Should committee members challenge Digital Asset’s performance with respect to the Acceptance Criteria, the voting members may proactively vote to delay payment until a decision is reached.  
* **Renewal:** Improvements and services are assessed on a quarterly cycle. This grant is expected to renew quarterly upon satisfactory review of the Acceptance Criteria by the Tech & Ops committee for the preceding quarter.  
* **Rebasing on CC price movements:** The funding request for this grant proposal will be reassessed on a quarterly basis based both on actual workload for maintenance activities and based on CC price movements.

### **4\. Co-Marketing**

There are no co-marketing needs or asks associated with this proposal.

