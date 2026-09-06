# Proposal: Canton Developer Onboarding and Validation Infrastructure

Author: YUCE Team

Status: Draft

Created: 2026-03-31

## 1. Abstract

This proposal requests Development Fund support to build and operate a **public Canton developer validation environment**. The project is positioned as shared development infrastructure for the Canton ecosystem, rather than a single application or a new independent network.

The goal of the project is to fill the gap between local development and formal DevNet / TestNet validation by providing a low-barrier, reusable, and operable shared validation environment. Developers and early-stage project teams will not need to independently set up a full participant, account system, or complex onboarding flow before they can complete account registration, identity acquisition, party allocation, DAR upload, Ledger API / JSON Ledger API calls, contract validation, transaction execution, and basic debugging. The project will use Auth0 as the unified account and authentication system, and will incorporate developer onboarding, project adoption, DAR usage, and ecosystem support into clear value metrics and acceptance criteria.

This project does not serve a single product. Instead, it supports multiple ecosystem scenarios including developer onboarding, project incubation, training, hackathons, and tool validation, and therefore has clear public infrastructure characteristics.

## 2. Specification

### 1. Objectives

There is currently a clear gap in the Canton ecosystem’s developer journey: developers can use local environments for basic learning and single-machine experimentation, but when moving into a more realistic shared validation stage, they still face substantial setup, coordination, and operational costs.

This project aims to address the following core issues:
    1. There is a significant gap between local development and real shared environments.
       Local environments are suitable for learning the language and basic workflows, but they do not fully cover key elements of real shared environments, such as account systems, binding between parties and user permissions, DAR management, external access control, environment observability, and lifecycle management.

    2. There is no public intermediate layer for developers before formal DevNet / TestNet.
        For new developers and early-stage project teams, moving directly from local development into formal network environments is costly and the onboarding path is not smooth enough.

    3. Different teams repeatedly build their own early validation environments, leading to clear resource waste.
        Many teams currently have to independently build and maintain their own preliminary validation environments, duplicating infrastructure, operations, and support costs and reducing overall ecosystem efficiency.
    4. The lack of an intermediate layer reduces development workflow quality.
        When the barrier to early validation environments is too high, teams are more likely to compress the normal validation process and defer problems that should have been found earlier into later environments.
Expected outcomes of this project include:
- Lowering the practical onboarding threshold for developers and early-stage project teams entering the Canton ecosystem
- Shortening the time from registration to usable account access, and from onboarding to first successful validation
- Providing a unified, reusable path for developer onboarding and validation
- Reducing resource waste caused by repeated construction of early validation environments by different teams
- Providing shared infrastructure for training, hackathons, tool integration, and new project incubation


### 2. Implementation Mechanism

This project will build and operate a managed public developer validation environment, with the following core implementation components.

#### Account and Authentication System

The project will use **Auth0** as the unified account management and authentication service to handle developer registration, login, access token issuance, account lifecycle management, and baseline security controls.

Auth0 is chosen because this project is intended for repeated onboarding across multiple developers, projects, and usage cycles, and the number of accounts is expected to grow over time. Building an in-house account and authentication system at the initial stage would significantly increase development complexity, maintenance cost, and security responsibility, which would make it harder to quickly establish a stable and usable public validation environment. Auth0 costs will therefore be included as a formal budget item in this proposal.

### Developer Onboarding and Permission Allocation

The platform will create separate accounts for each developer or project and map them in the Canton application layer to corresponding users, parties, and minimal access permissions. After onboarding, developers will receive controlled account identities, user permissions, and party spaces, rather than participant-level or network administration rights.

### Managed Participant and Execution Layer

The platform will centrally operate the shared participant layer and expose application-level execution capabilities to developers. Developers will not need to maintain participant processes, underlying connections, upgrades, or runtime status. They will only need to use the standard interfaces provided by the platform to complete validation. This model significantly reduces onboarding friction while maintaining consistency and operability of the environment.

### DAR Upload and Package Management

The platform will provide controlled DAR upload capabilities. Developers will be able to upload DAR packages through a standardized process, and the platform will perform baseline validation, including size limits, dependency checks, naming convention checks, and runtime isolation. To prevent the public environment from being polluted by malicious or faulty packages, the platform will adopt a combined strategy of self-service uploads and manual review.

### Ledger API / JSON Ledger API Access

The platform will provide standard Ledger API / JSON Ledger API access, supporting party creation, DAR upload, contract creation, active contract queries, choice execution, event listening, and basic troubleshooting. The goal is not to change Canton’s development model, but to provide a lower-barrier shared validation entry point on top of the existing development model.

### Observability, Debugging, and Resource Governance

The platform will provide developers with basic observability features, including transaction results, error messages, log excerpts, request trace IDs, runtime status descriptions, and documentation for common issue diagnosis. At the same time, the platform will implement quotas, rate limiting, tenant isolation, abnormal request blocking, idle resource reclamation, and environment reset strategies to ensure sustainable operation of the public environment.


### Deliverables

The project will deliver the following core outputs:

- A functioning public developer validation environment
- An Auth0-based account opening and authentication system
- Developer user, party, and permission allocation mechanisms
- DAR upload and controlled installation capabilities
- Standard Ledger API / JSON Ledger API access capabilities
- Example projects and reusable workflow templates
- Status page, onboarding documentation, and troubleshooting documentation
- Usage statistics, impact reports, and migration guidance

### 3. Architectural Alignment

This project aligns with Canton’s architectural characteristics and ecosystem priorities.

First, it does not attempt to simplify Canton into a traditional public-chain-style public RPC model. Instead, it respects Canton’s participant-, party-, user-permission-, and Ledger API-centered development and execution model. On this basis, the project builds a managed intermediate layer that is more suitable for developer onboarding and early-stage validation, rather than introducing a new underlying network.

Second, what this project exposes externally is application-level development and validation capability, not underlying node management capability. All high-privilege operations, including participant management, environment configuration, and governance-related capabilities, will be centrally managed by the platform. Developers will receive only minimal permissions at the account, user, and party level, which is fully aligned with Canton’s layered permission model.

Third, this project does not replace DevNet, TestNet, or MainNet, nor does it introduce new protocol requirements, network forks, or compatibility burdens. Instead, it fills the missing shared validation layer between local development and formal network validation. This capability directly supports developer onboarding, ecosystem education, project incubation, and tool validation, and therefore has clear public infrastructure value.

From the perspective of ecosystem priorities, this project serves developer experience, development efficiency, onboarding quality, and shared infrastructure building, and is highly aligned with the categories of developer tools, reference implementations, and critical ecosystem infrastructure.

### 4. Backward Compatibility
**No backward compatibility impact.**

This project does not modify the Canton protocol itself, does not change the operating mechanisms of existing DevNet / TestNet / MainNet environments, and does not require existing projects to alter their current production workflows. It introduces an additional public development validation layer outside the existing system, and therefore has no backward compatibility impact on existing systems, integrations, or workflows.

## Milestones and Deliverables

### Milestone 1: Solution Design and Minimum Viable Environment Setup

**Estimated delivery time:** 8 weeks

**Focus:** Complete system design, account system, permission model, and setup of the minimum viable public validation environment.

**Deliverables / Value Metrics:**

- Complete system architecture documentation
- Complete Auth0 account system and authentication flow design
- Complete user / party / permission model design
- Complete deployment of the managed participant layer
- Complete prototype of the DAR upload mechanism
- Complete basic API access channels
- Complete the first version of the documentation site
- Deliver at least **1 reusable example DAR / workflow template**
- Complete onboarding validation for no fewer than **8 developer accounts** during internal testing
- Complete upload testing for no fewer than **4 DARs**, of which at least **2 DARs** successfully pass validation and installation

### Milestone 2: Public Validation Environment Launch

**Estimated delivery time:** 8 weeks

**Focus:** Launch the first publicly usable version and establish sustainable onboarding, usage, and resource governance mechanisms.

**Deliverables / Value Metrics:**

- Complete external onboarding entry point
- Complete developer registration and Auth0 account provisioning workflow
- Open Ledger API / JSON Ledger API usage channels
- Provide basic logging and error observability capabilities
- Provide example projects and standard workflows
- Provide status page and runtime instructions
- Provide DAR upload, installation, and usage documentation
- Establish the first version of the usage metrics dashboard
- No fewer than **12 developer accounts** successfully opened
- No fewer than **8 developers** complete their first effective onboarding
- No fewer than **2 project teams or project prototypes** complete environment onboarding
- No fewer than **6 DARs** uploaded
- No fewer than **4 DARs** successfully pass validation and installation
- No fewer than **3 DARs** actually used in validation runs
- At least **1 reusable example DAR / workflow template**
- Keep the average time from account opening to first successful contract creation for new developers within **2 business days**

### Milestone 3: Stability Enhancement and Ecosystem Adoption Validation

**Estimated delivery time:** 8 weeks

**Focus:** Validate public value through real usage and improve stability, account management, DAR adoption paths, and developer support mechanisms.

**Deliverables / Value Metrics:**

- Complete optimization of quotas and cleanup strategies
- Complete optimization of Auth0 account management and cost strategy
- Complete optimization of package review and tenant isolation
- Complete iteration of troubleshooting documentation and templates
- Produce usage data and impact reports
- Provide developer, team, or workshop usage cases
- Complete an improved migration guide for formal environments
- Deliver complete metrics statistics and a quarterly impact report
- No fewer than **20 developer accounts** successfully opened
- No fewer than **12 developers** complete their first effective onboarding
- No fewer than **8 developers** complete at least one full application validation workflow
- No fewer than **4 project teams or project prototypes** complete onboarding
- No fewer than **3 projects** complete at least one real validation cycle
- No fewer than **2 projects** continue using the environment for more than one development cycle
- No fewer than **12 DARs** uploaded
- No fewer than **8 DARs** successfully pass validation and installation
- No fewer than **6 DARs** actually used in validation runs
- At least **2 reusable example DAR / workflow templates**
- Support no fewer than **2** training sessions, hackathons, or workshop scenarios
- Bring in no fewer than **6 new developers** through those activities
- Achieve a self-service documentation resolution rate of over **50%** for common onboarding issues
- Keep the average troubleshooting time after first onboarding failure within **3 business days**


## Acceptance Criteria

**The Tech & Ops Committee will evaluate project completion based on the following standards:**

- Deliverables for each milestone have been completed as agreed
- Functional capabilities or operational readiness have been demonstrated
- Complete documentation and knowledge transfer materials have been provided
- Outcomes are consistent with the listed value metrics

**Project-specific acceptance conditions include:**

- The public environment is usable for controlled developer onboarding and validation
- The Auth0-based account opening and account lifecycle management functions operate as designed
- A complete developer workflow can be demonstrated, including account opening, party allocation, DAR upload, contract creation, transaction execution, and basic debugging support
- Evidence has been provided, according to milestone metrics, for developer adoption, project adoption, DAR adoption, and ecosystem support
- Upon completion of Milestone 3, a full quarterly impact report, issue summary, and follow-up expansion recommendations must be submitted

## Funding

**Total funding requested:** **CC equivalent to USD 180,000**

### Milestone-Based Payment Schedule

- **Milestone 1 (Solution Design and Minimum Viable Environment Setup):** CC equivalent to **USD 55,000** payable upon committee acceptance
- **Milestone 2 (Public Validation Environment Launch):** CC equivalent to **USD 60,000** payable upon committee acceptance
- **Milestone 3 (Stability Enhancement and Ecosystem Adoption Validation):** CC equivalent to **USD 65,000** payable upon final release and acceptance

## Volatility Stipulation

The expected project duration is less than 6 months.

If the project timeline extends beyond 6 months due to scope adjustments requested by the committee, the remaining milestones should be renegotiated in light of significant USD / CC price volatility.

## Co-Marketing

After release, the implementing party will coordinate with the Foundation on the following activities:

- Joint announcement coordination
- Case studies or technical blog content
- Developer or ecosystem promotion
- Public sharing of onboarding materials, workflow templates, and ecosystem adoption experience
- Support for showcasing the environment in ecosystem workshops, hackathons, or developer education activities

## Motivation

The value of this project lies in directly addressing a practical bottleneck in the Canton ecosystem’s developer onboarding process: there is a clear disconnect between local learning and real shared-environment validation. Many developers are not lacking interest; rather, before they even begin building, they are blocked by the complexity of environment setup, permission onboarding, account systems, and validation workflows.

Building a public developer validation environment can significantly lower the barrier to entry, enabling more developers and early-stage project teams to move into hands-on validation more quickly. At the same time, it reduces resource waste from different teams repeatedly building their own early-stage validation environments, allowing fragmented effort to be turned into shared ecosystem-wide capability.

From the ecosystem perspective, this project serves not a single product but multiple scenarios including developer onboarding, project incubation, training, hackathons, and tool validation. It is therefore more consistent with the positioning of public infrastructure and developer tooling grants.