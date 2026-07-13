## Development Fund Proposal: Discounted security audits

**Author:** Composable Security (composable-security.com)  
**Status:** Draft  
**Created:** 2026-02-26

## Abstract

This proposal offers **3 heavily discounted security audits** for Canton Network members at a **fixed price of $12,000 USD per audit**, delivered across three milestones (one audit per milestone). Each audit covers up to **~1200 nSLOC**. After completion of these 3 audits, all future audits requested by Canton Network members receive an **10% discount** from offer.

Composable Security's work emphasizes clarity, actionable findings, and fast remediation. We have conducted auditing of Scala-based L1 blockchains (critical bug discoveries) and security audits of Hyperledger Fabric solutions used by consortia of banks. Additional engagements include the Lido Oracle review, security research for the Uniswap Foundation around Uniswap v4, and audit work for Filecoin Foundation, RedStone, pStake, ZondaCrypto, and Tellor.

---

## Specification
 
### 1. Objective
Deliver engineering-focused audits that:

- Identify exploitable vulnerabilities and concrete attack paths in Canton applications
- Reduce ecosystem risk through consistent review standards across member projects
- Accelerate delivery with clear remediation guidance and rapid retesting
- Build a shared knowledge base on Canton-specific (Daml-specific) issues and hardening patterns

The goal is measurable improvement in security posture, not just reports.

### 2. Implementation Mechanics

**Audit process:**
- **Scope lock:** confirm commit, deployment assumptions, and threat priorities
- **Architecture review:** map trust boundaries, privileged roles, and integration surfaces
- **Code review:** deep manual analysis of state transitions, authorization, invariants, and failure handling
- **Issue reporting:** engineer-ready findings with reproduction steps, impact, and fixes
- **Fix review:** validate remediations and confirm no regressions

**Deliverables (per audit):**
- Technical report with findings, severity, and remediation
- Executive summary
- Findings tracker with retest notes
- One Q&A session and one retest window

**Scope:** up to **~1200 nSLOC** per audit. Larger codebases can be split or scoped to critical components.

### 3. Architectural Alignment

**CIP-0082 & CIP-0100 (Development Fund):** The Fund exists explicitly to sustain "security, audits" as core protocol public goods. CIP-0100 establishes the Tech & Ops Committee and Security Subcommittee to govern such proposals. This audit program is a direct application of that mandate.

**CIP-0057 (Quantstamp):** The network onboarded Quantstamp to audit core Canton Coin tokenomics. This proposal extends security coverage to **application-layer code** (the Canton apps members are building) addressing a complementary attack surface.

**CIP-0056 & CIP-0103 (Token & dApp Standards):** As adoption of these standards grows, so does the attack surface. Coordinated audits ensure consistent security review across implementations.

**CIP-0104 & CIP-0086 (App Rewards & ERC-20 Middleware):** Growth incentives will attract more apps. Audits serve as quality control for applications generating network activity.


### 4. Backward Compatibility
No backward compatibility impact.

---

## Milestones and Deliverables

### Milestone 1: First Audit (pilot)
- **Estimated Delivery:** when required, within 2 months from proposal acceptance
- **Deliverables:**  
  - 1 audit report + executive summary
  - Retest results for all remediated issues
  - Value metrics: number of issues found by severity
- **Payment:** $12,000 USD in Canton Coin ($CC) after committee acceptance

### Milestone 2: Second Audit
- **Estimated Delivery:** when required, within 2 months after Milestone 1
- **Deliverables:**  
  - 1 audit report + executive summary
  - Retest results for all remediated issues
  - Value metrics: number of issues found by severity
- **Payment:** $12,000 USD in Canton Coin ($CC) after committee acceptance

### Milestone 3: Third Audit
- **Estimated Delivery:** when required, within 2 months after Milestone 2
- **Deliverables:**  
  - 1 audit report + executive summary
  - Optional public-facing write-up(s) of non-sensitive lessons learned (member opt-in)
  - Cross-audit security checklist tailored to Canton deployments
  - Value metrics: number of issues found by severity
- **Payment:** $12,000 USD in Canton Coin ($CC) after committee acceptance

---

## Acceptance Criteria
The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone  
- Technical depth and correctness of findings  
- Actionability: clear reproduction steps, impact analysis, and concrete fixes  
- Retest quality: verified remediation status and regression checks  
- Professional execution: predictable timelines, responsive communication, and clean handoffs  

Each milestone is standalone. After any accepted milestone, Canton Network may cancel remaining milestones with no further payment obligation beyond work already delivered.

---

## Funding

**Total Funding Request:** 3 × $12,000 USD = **$36,000 USD**, paid in Canton Coin ($CC) after each milestone.

### Pricing Terms
- **Audit count:** 3 total audits, one per milestone
- **Audit size:** up to **~1200 nSLOC** per audit
- **Fixed price:** **$12,000 USD per audit**
- **Loyalty discount (future work):** after completion of these 3 audits, **all subsequent audits** requested by Canton Network members receive a **10% discount**

### Payment Schedule
- Milestone 1: $12,000 USD paid after committee acceptance of deliverables
- Milestone 2: $12,000 USD paid after committee acceptance of deliverables
- Milestone 3: $12,000 USD paid after committee acceptance of deliverables

Payments are made in Canton Coin ($CC) equivalent after acceptance of each milestone deliverables.

### Volatility Stipulation
If the program duration is **greater than 6 months**:  
The grant is denominated in fixed Canton Coin and will require a re-evaluation at the 6-month mark.

If the program duration is **under 6 months**:  
Should the program timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestone pricing must be renegotiated to account for significant USD/CC price volatility.

---

## Co-Marketing
With member consent and appropriate confidentiality safeguards, Composable Security will collaborate with the Foundation on:

- A program announcement (kickoff + completion)
- An anonymized summary of common risk patterns and recommended mitigations
- One technical talk or community presentation focused on practical audit lessons for Canton builders

No member-sensitive details will be published without explicit approval.

---

## Motivation
Canton’s goal is to accelerate ecosystem growth. We plan to do this by offering significantly reduced pricing for smaller projects, enabling broader participation and greater ecosystem diversity.

---

## Rationale
Canton Network members get 3 fast audits at a fixed, lower price. This structure eliminates the typical friction of security reviews:

- **Fixed pricing:** $12,000 USD per audit with no negotiation or scoping delays
- **Fast turnaround:** auditors ready to engage immediately, with streamlined onboarding
- **Predictable process:** consistent methodology and deliverables across all three audits
- **Low-risk execution:** milestone-by-milestone payments; cancel anytime if priorities change

Composable Security is a strong fit because we focus on the intersection where Canton applications operate: distributed trust, permissioning, integrations, and production constraints. Our audits are designed to be useful in the way engineering teams need: clear priorities, precise fixes, and validation that the fixes actually hold.
