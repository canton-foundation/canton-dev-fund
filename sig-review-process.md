# Development Fund Proposal Review
## Ways of Working

To manage the growing number of Development Fund proposals, the community will use a structured review workflow coordinated through the proposal board:

[https://github.com/orgs/canton-foundation/projects/3/views/1](https://github.com/orgs/canton-foundation/projects/3/views/1)

This process relies on participation from SIG members, Core Contributors, the Security group, and the Voting Committee.

---

# 1. Proposal Assignment

Proposal authors should indicate which **Special Interest Group (SIG)** they believe their proposal best aligns with when submitting their proposal. This helps reviewers quickly identify proposals that match their expertise.

Members of the various SIGs are encouraged to review proposals aligned with their area of interest and may **self assign proposals they want to review directly on the proposal board.**

Special Interest Groups are open to any ecosystem participant, including:

- Application developers  
- Node operators  
- Foundation members  

Participation in SIGs is **not limited to Foundation members**.

When reviewing proposals:

- Having an assignee will move the proposal to `In Review`
- A proposal may be moved to **Needs Champion** by Core Contributors or members of the Voting Committee if it appears promising but requires additional refinement before it can move forward

Champions help guide the proposal toward clarity, ensuring the **milestones, scope, and acceptance criteria are well defined.**

Anyone in the ecosystem is welcome to provide feedback on proposals. The goal is to collectively improve the quality of submissions and ensure proposals meet the bar expected for Development Fund grants.

---

# 2. Guidance for Reviewing Proposals

When reviewing proposals, consider how they align with the **Q2 priority areas for the ecosystem.**

## Stability and Maintainability

Examples include:

- Operational simplicity  
- Super Validator accountability and monitoring  
- Improvements to maintainability of the codebase  

## Scaling the Network

Examples include:

- Multi-synchronizer architecture  
- Increased BFT throughput  
- Improvements to parties, validators, and network scale  

## App Building and Developer Experience

Examples include:

- Reduced developer friction  
- Interoperability across wallets, assets, and dApps  
- Token standards  
- Wallet gateway and dApp standards  
- Documentation, examples, and training  
- Simplified traffic accounting and application rewards  
- Simpler network upgrades and decentralized parties  
- Lower total cost of ownership (TCO)  

## Security and Resilience

Examples include:

- Security auditing and tooling  
- Hardening against malicious disruption  
- Network resiliency and failover improvements  
- Liveness improvements  
- Monitoring, compliance, and third-party audit capabilities  

---

# 3. Grant Evaluation Expectations

All Development Fund proposals must follow several core principles.

### Public Good

The proposal should create a **shared asset for the Canton ecosystem** rather than primarily benefiting a single organization.

### Sustainability

The proposal must explain **who will operate and maintain the software after the grant period.**

### Adoption-Driven Delivery

Adoption should be the **primary indicator of success.** Milestones should include clear criteria demonstrating real ecosystem usage.

### Alignment with Ecosystem Priorities

Each proposal should clearly explain how it contributes to the **network’s core priorities.**

A more detailed evaluation rubric is provided in the **Grant Guidance document.**

---

# 4. Moving Proposals Toward a Vote

Once a champion believes a proposal is ready for consideration:

- Move the proposal to **“Ready for Vote.”**

This column is reviewed by:

- Voting Committee members  
- Core Contributors  
- The Security Group  

If the champion believes the proposal requires deeper technical review before voting, it can instead be moved to:

**“Needs Review by Core Contributors / Security.”**

---

# 5. Review Timeline

Proposals placed in **“Ready for Vote”** will generally remain in that column for approximately **one week.**

This gives all reviewers time to:

- Read the proposal  
- Provide feedback  
- Raise concerns or suggestions before voting begins  

Given the growing number of proposals, **active participation from all reviewers is critical.** Constructive feedback early in the process helps ensure proposals reach a higher standard before the committee votes.

```mermaid
flowchart LR
    A[Proposal Submitted] --> B[SIG Reviewer Picks Up Proposal]
    B --> C[In Review]
    C --> D{Needs Refinement?}
    D -->|Yes| B
    D -->|No| E[Ready for Vote]
    E --> F[Voting Committee, Core Contributors, Security Review]
    F --> G[Vote]
```   
