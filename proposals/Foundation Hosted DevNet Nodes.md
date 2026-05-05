## Development Fund Proposal

**Author:** Canton Foundation  
**Status:** Draft  
**Created:** 2026-04-15  
**Label:** node-deployment-operations

**Champion:** Canton Foundation

## Abstract

Canton Foundation will deploy and operate 3–4 dedicated DevNet validator nodes, exposing rate-limited JSON Ledger API endpoints. Access credentials will be issued by DevRel/BD staff after a qualification review (project legitimacy, use case fit, no bad actors). Endpoints will not appear in public documentation or on the Canton website. The Keys will be revoked after the Partner Whitelisting is done / Hackathon event is over i.e Foundation will give a limited validity time key which will be automatically revoked after that time of 14 days and after that once whitelisted, developers will continue on their own whitelisted IP. The qualification bar is intentionally low, the goal is to eliminate the timing friction of onboarding and Building.

## Specification

### 1. Objective

Every new Canton developer whether an ecosystem partner, hackathon team, or early-stage project must go through validator IP whitelisting before they can make a single API call against DevNet. Even for DevNet, this process involves submitting an IP, waiting for super validators to adopt updated config files, and a ~14 days approval window. For mainnet and testnet the wait is unavoidable, but for DevNet this delay causes friction on onboarding / lack of interest. 

This blocks two concrete use cases:

1. **Early-start Partners** that want to start into their development Prep. while their validator whitelisting is processing.
2. **Hackathons** where teams have 24–32 hours to build and cannot wait for DevNet.

Moreover, adding to more facts to the problem support, Foundation members have seen friction to continue retention of early start projects, this problem extends into developer adoption initiatives too such as an example of ETH Denver hackathon where foundation had put a bounty but majorly trying to find a way around by hosting devnet nodes and share via static IPs, yet the friction to handle this nature of network access still become a major pain point, check detailed report here: [ETH Denver Hackathon Report on Dev Challenges - Google Docs](https://docs.google.com/document/d/1LKY1opIGqP6RJwe9ukQ-5TjJVt8VLAQCUpELgy91vSE/edit?tab=t.0)

### 2. Implementation Mechanics

**Infrastructure:**

- 3 – 4 validator nodes deployed on Canton DevNet, meeting standard requirements.
- Nodes operated and maintained by Canton Foundation or a trusted NaaS provider under Foundation direction.

**Access control:**

- API key issuance managed by DevRel/BD team via an internal tracking sheet.
- Per-key rate limits enforced at the API gateway layer (requests/minute, transaction volume caps, and more!)
- For Canton Ledger API authentication, Developers receive both the gateway API key for endpoint access and a shared signing secret for generating valid JWT tokens with correct actAs/readAs claims. The Canton Admin API is not exposed through the gateway configuration.
- Keys scoped to DevNet only, non-transferable, revocable
- Revoking API Endpoints allocated after the Partner Whitelisting is completed.

**What this is not:**

- Not a public sandbox, no open registration, no docs listing
- Not a replacement for running your own validator /  Working with a NaaS, projects are expected to run their own node / Setup a NaaS for TestNet/MainNet and Get whitelisted for DevNet.
- It's not mainnet or testnet infrastructure, only for DevNet.
- Nodes are planned to be reset on a bi-weekly cadence, mirroring DevNet's own reset behavior as well. Active key holders are notified 3 Working days before each reset.

**Adoption and Access** (Access to these endpoints will not be publicly listed.)

- **Hackathons:** Canton Foundation sponsoring a hackathon will pre qualify all participating teams and issue keys at event kickoff and will be auto revoked by end of the event.
- **Inbound ecosystem projects:** BD qualifies projects during initial discovery calls, promising early start projects receive keys while their own validator whitelisting processes / NaaS setup process gets done, removing overall onboarding frction on DevNet.

## Milestones and Deliverables

### Milestone 1: Node Deployment
- **Estimated Delivery:** Weeks 1 – 3
- **Focus:** Deploy 3 – 4 DevNet validator nodes
- **Deliverables / Value Metrics:** 3 – 4 DevNet validator nodes live, passing standard health checks, connected to DevNet synchronizer

### Milestone 2: Setup Infra and Access Control Guidelines
- **Estimated Delivery:** Weeks 3 – 4
- **Focus:** API gateway and rate limiting setup
- **Deliverables / Value Metrics:** API gateway deployed with per-key rate limiting

### Milestone 3: Pilot Cohort
- **Estimated Delivery:** Week 4-6
- **Focus:** First pilot projects onboarded and Hackathon Testing done
- **Deliverables / Value Metrics:** Usage telemetry report shared with Tech & Ops Committee

### Milestone 4: 12 Month Operations
- **Focus:** Ongoing operations
- **Deliverables / Value Metrics:** Ongoing node operation, key management, and quarterly usage reports to Tech & Ops Committee. Node upgrades aimed to be applied within a week of each DevNet/Splice release. Bi-weekly node resets on a published schedule with 3 Working day advance notice to active key holders. Monitoring and alerting on node health with defined incident response SLA under the NaaS service agreement (shared with committee at M1). Database maintenance and log retention managed by NaaS operator.


**Note:* Due to the recurring nature of funding, this proposal introduces a Pilot Program for working with Projects and supporting Developer Initiatives for 12 Months.

After Pilot Program, Canton Foundation submits a Performace Report to the Tech & Ops Committee. The Review Report shall be submitted no later than 30 days following the end of Pilot Program. 

Upon submission, the committee shall have 30 days to review the report and raise any material shortfalls. If no such shortfalls are raised within this period, the report shall be deemed accepted and the Program Continues.

If the committee identifies material shortfalls, Foundation has 30 days to present a remediation plan. Failure to remediate within this period may result in suspension or termination of future disbursements.

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone
- Demonstrated functionality or operational readiness
- Alignment with stated value metrics

## Funding Breakdown by Milestone
 
The exact CC amount subject to volatility adjustment, Initial 12-month Pilot, with quarterly reviews and automatic renewal after 12 Months subject to satisfactory performance during the Pilot Period.

Review Plan: Quarterly evaluation by the Tech & Ops Committee based on the proposed quarterly reporting including projects supported and Dev Adoption Initatives Used. The Committee may terminate future payments after the Pilot Program if Delivrables were not met. Monthly disbursements at the end of each month.

| Category | Amount | Detail |
| :---- | ----- | :---- |
| **Node Infrastructure (Setup)** | 40,871 CC | Initial provisioning of 4 validator nodes i.e compute instances, managed PostgreSQL databases, static IPs, TLS certificates, DNS configuration |
| **Node Infrastructure (12 mo ops)** | 102,180 CC | Ongoing hosting for compute + DB + network + storage for 4 Nodes. |
| **API Gateway & Monitoring** | 40,871 CC | API gateway setup + 12-month licensing/ops including rate limiting, key management, request logging, abuse detection |
| **DevOps Setup** | 40,871 CC | API gateway integration & rate limit tuning, monitoring/alerting setup. |
| **DevOps Upgrades (12-mo ops)** | 68,118 CC | ongoing for node upgrades to track DevNet releases, key issuance/revocation, incident response, quarterly telemetry reports. |
| **Team for Coordination and Management** | 34,059 CC | Qualification review for inbound projects, hackathon key distribution & Support by Foundation, partner onboarding calls + Support |
| **Buffer** | 13,624 CC | Unforeseen infrastructure scaling, DevNet reset recovery, additional node if demand exceeds capacity |
| **Total** | **340,600 CC** | |


## Co-Marketing

Foundation will handle the Marketing needs of the Initiative but there is no Major "Marketing" required but on this one as it's an internal service for better dev adoption and onboarding.