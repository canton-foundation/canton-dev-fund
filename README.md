# Canton Development Fund

The Canton Development Fund supports open development that strengthens the Canton ecosystem.

This repository is used to submit **Development Fund proposals** through GitHub Pull Requests.

## Start Here

Before submitting a Development Fund proposal, please review the Foundation's current strategic roadmap and Requests for Proposals.

- [2026–2028 Strategic Roadmap & 2026–2027 Requests for Proposals](./2026-2028-strategic-roadmap.md)
- [Requests for Proposals and Submission Guidance](./rfps/README.md)
- [Proposal Review Process](/Development%20Fund%20Proposal%20Review%20Process.md)
- [SIG Directory](sig-directory.md)
- [Proposal Lifecycle Board](https://github.com/orgs/canton-foundation/projects/3/views/1)

Development Fund proposals follow one of two paths:

- **RFP-aligned proposals** respond to a published Foundation Request for Proposals and should be submitted under the appropriate category in `/rfps/`.
- **Individual initiatives** are community-generated proposals outside the published roadmap and should continue to be submitted under `/proposals/`.

Applicants should review the roadmap before submitting and clearly identify which path applies to their proposal.
---

## Overview

The Development Fund accelerates high-quality contributions that increase the utility, security, and long-term resilience of the Canton Network.

The fund supports work such as:

- Core protocol research and development  
- Developer tools and SDKs  
- Security reviews, audits, and hardening  
- Reference implementations  
- Critical ecosystem infrastructure  
- DeFi liquidity seeding where required for early utility  

If your proposal delivers a **shared benefit to the Canton ecosystem**, it may be eligible.

---

## How the Fund Works

The program was established through governance:

- **[CIP-0082](https://github.com/canton-foundation/cips/blob/main/cip-0082/cip-0082.md)** allocates **5% of future Canton Coin emissions** to the Development Fund  
- **[CIP-0100](https://github.com/canton-foundation/cips/blob/main/cip-0100/cip-0100.md)** defines the governance and review process  

Unlike many networks, Canton does **not** use a premine or treasury. Funding comes from future network rewards to create a durable, predictable source.

The Canton Foundation acts as a neutral facilitator.

Funding decisions are made by the **Tech & Ops Committee**, with final approval by the **Voting Group**.

**Program structure**

- Quarterly funding allocation  
- Milestone-based payments  
- Funding denominated in Canton Coin (CC)  
- Transparent, community-visible process  

---

## Who Can Submit

You may submit a proposal if you are:

- A Canton Foundation member  
- A contributor organization  
- An external team or individual  

External contributors must have a **Champion** to support the proposal.

All proposals are evaluated based on **impact, quality, feasibility, and alignment**, not on who submits them.

The committee will review no more than 3 proposals a week from one organization / champion. 

---

## How to Submit a Proposal

All proposals are submitted via Pull Request.

### Step 1: Review the PR Template

Use the Development Fund template located at:

```
.github/pull_request_template.md
```

The template requires:

- Objective and scope  
- Technical approach  
- Architectural alignment  
- Milestones and deliverables  
- Acceptance criteria  
- Funding request and milestone breakdown  

---

### Step 2: Create Your Proposal

1. Fork this repository  
2. Create a new branch  
3. Add your proposal as a Markdown file under:

```
proposals/<project-name>.md
```

4. Complete the content using the PR template structure  

---

### Step 3: Open a Pull Request

Use the following title format:

```
Proposal: <Project Name>
```

Once submitted, your proposal will enter the review process.

---

## Review Process

- Please see the [Review Process](/Development%20Fund%20Proposal%20Review%20Process.md)

---

## What Makes a Strong Proposal

Successful proposals typically include:

- A clear problem and ecosystem value  
- Deliverables that can be objectively verified  
- Realistic timelines and scope  
- Open-source or reusable outputs where appropriate  
- Evidence of technical capability  
- Adoption or distribution plan  

---

## Strategic Roadmap & Requests for Proposals

The Technology & Operations Committee publishes a strategic roadmap identifying areas where the Canton Foundation is actively seeking community contributions and expects to prioritize Development Fund resources.

Review the current roadmap here:

[2026–2028 Strategic Roadmap & 2026–2027 Requests for Proposals](./2026-2028-strategic-roadmap.md)

RFP-aligned proposals should be submitted under the appropriate category in:

`/rfps/`

Individual initiatives that do not respond to a published RFP may still be submitted under:

`/proposals/`

A published RFP does not guarantee funding. All proposals remain subject to technical review, milestone review, available budget, and Technology & Operations governance.

---

## Governance Structure (CIP-0100)

The Development Fund is administered through:

**Voting Group**
- 5 voting members and 2 alternates  
- Final approval of funding decisions  

**Security Subcommittee**
- Reviews security-sensitive proposals  

**Core Contributors Group**
- Provides technical input and prioritization  

**Operations Subcommittee**
- Oversees reporting, communications, and operational coordination  

---

## Payment Terms

- Funding is denominated in **Canton Coin (CC)**  
- Payments are milestone-based and released after acceptance  
- Projects longer than 6 months may be re-evaluated for price volatility  
- Funding may be paused or stopped if milestones are not met  

---

## Scope Guidance

Eligible work includes contributions that are a **common good** for the ecosystem:

- Protocol improvements  
- Shared developer tooling  
- Security and reliability enhancements  
- Reference implementations  
- Infrastructure used by multiple participants  

The fund does **not** support purely private or proprietary work.

---

## Questions

Email: **dev-fund@canton.foundation**

Additional information:

- [CIP-0082](https://github.com/canton-foundation/cips/blob/main/cip-0082/cip-0082.md)
- [CIP-0100](https://github.com/canton-foundation/cips/blob/main/cip-0100/cip-0100.md) 

---

## Why This Fund Exists

Canton adoption is growing rapidly. The Development Fund ensures the network evolves with:

- Open participation  
- Transparent governance  
- Predictable funding  
- Long-term ecosystem resilience  

**Goal:** Support development that makes Canton stronger for everyone.

## Repository License

Proposal documents in this repository are dedicated to the public domain under **[CC0-1.0 (Creative Commons CC0 1.0 Universal)](https://creativecommons.org/publicdomain/zero/1.0/)**.


This allows proposals to be freely discussed, quoted, and referenced during the governance and review process.

If a proposal includes software or technical artifacts, those components should specify their own license (commonly **[Apache-2.0](https://www.apache.org/licenses/LICENSE-2.0)** within the proposal or associated repository.

## Questions

For community discussion, feedback, or broader ecosystem input:

Mailing list: **[grants-discuss@lists.sync.global](mailto:grants-discuss@lists.sync.global)**

For private questions about a proposal or submission process:

Email: **[dev-fund@canton.foundation](mailto:dev-fund@canton.foundation)**
