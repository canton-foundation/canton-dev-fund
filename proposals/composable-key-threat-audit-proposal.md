## Development Fund Proposal: Key-Threat-Based Security Audit

**Author:** Composable Security (composable-security.com)  
**Status:** Draft  
**Created:** 2026-02-26  

## Abstract
This proposal delivers a key-threat-based security audit of Canton's Scala codebase. Composable Security will (1) identify and rank the key threats against Canton's protocol, (2) perform deep code audits of the critical paths - consensus, transaction validation, authorization, cross-domain messaging, sequencer/mediator logic, participant nodes, and API surfaces, and (3) deliver a findings report with severity ratings, proof-of-concept demonstrations, fix recommendations, and remediation verification for all Critical and High findings. This key-threat-based methodology is particularly effective for large codebases, where exhaustive line-by-line auditing is extremely expensive and doesn't add proportional value.

Composable Security specializes in off-chain components and blockchain implementations and has conducted key-threat-based auditing of Scala-based L1 blockchains (critical bug discoveries) and security audits of Hyperledger Fabric solutions used by consortia of banks - permissioned, multi-operator environments with trust assumptions similar to Canton. We are currently auditing the full Lido off-chain stack, and our approach has been well received for its clarity, prioritization, and practicality. Additional engagements include security research for the Uniswap Foundation around Uniswap v4, and audit work for projects like RedStone, Berachain, Constellation, Filecoin Foundation, pStake, ZondaCrypto, Tellor and more.

---

## Specification

### 1. Objective
Deliver a threat based security review that answers, with code-level evidence:

- Are there exploitable vulnerabilities in the Canton components that handle consensus, transaction processing, authorization, and cross-domain coordination?
- Do the Scala implementations correctly enforce the trust boundaries and privacy guarantees that Canton's design assumes?
- Where do implementation details (concurrency, serialization, error handling, cryptographic usage) diverge from protocol intent in ways an attacker can exploit?
- What specific code changes are needed to fix confirmed vulnerabilities, and what regression tests should accompany them?

The intended outcome is a prioritized set of confirmed findings, each with enough detail for Canton engineers to reproduce, fix, and verify - not a list of theoretical concerns.

### 2. Implementation Mechanics
Instead of spreading review effort uniformly across the codebase, we rank threats by damage potential first, then focus deep manual review on the code paths where those threats materialize. This approach concentrates effort where it reduces risk the most and is much cheaper and faster than traditional audit.

**Methodology:**
- **Key threat identification:** Derive the highest-impact threats from Canton's architecture and protocol spec (transaction forgery, privacy breach, consensus manipulation, unauthorized state changes, liveness denial). Rank by impact and feasibility.
- **Scenarios generation**: For each threat, identify scenarios that materialize the threat.
- **Attack surface mapping:** For each scenario, trace the code paths from entry points (APIs, network messages, operator commands) through internal logic to state changes.
- **Deep manual review:** Review of mapped paths, targeting logic errors, concurrency bugs, serialization mishandling, cryptographic misuse, cross-domain edge cases and other.
- **Exploitation validation:** Build a proof of concept or detailed exploitation scenario for each suspected vulnerability. Findings without a credible attack path are downgraded to informational.
- **Fix recommendations:** Each confirmed finding ships with code-level fix guidance and suggested regression tests.


**Outputs:**
- Findings report with severity ratings, root cause analysis, exploitation scenarios, and fix recommendations
- Executive summary for non-engineering stakeholders
- List of verified scenarios
- Remediation verification for all Critical and High findings (one round)
- "Lessons learned" note on recurring bug patterns

### 3. Architectural Alignment
The audit is structured around Canton's component boundaries and reflects the ecosystem's current priorities as expressed in recent CIPs.

**Component-level alignment:**
- Sequencer, mediator, and topology manager - the domain-level components where ordering, confirmation, and topology decisions happen. The recent migration to Canton 3.4 (CIP-0089) introduced scaling optimizations and new sequencer processing paths that have not been independently reviewed.
- Participant nodes - where transaction submission, validation, and ledger state management occur. The growing operator base (CIP-0045 sets operating requirements for SVs above weight 2.5) means more independently operated nodes running this code in production.
- Cross-domain protocols - where atomicity and coordination guarantees must hold across independently operated domains.
- API and integration surfaces - where external input enters the system. The Canton Network Token Standard (CIP-0056) and the dApp Standard (CIP-0103) have introduced new on-ledger and off-ledger API surfaces (FOP/DVP transfer workflows, wallet-to-registry interactions, dApp API provider methods) that expand the attack surface available to external callers.

**Ecosystem priority alignment:**
- CIP-0082 established the Development Fund explicitly to sustain investment in "security, audits" as core protocol public goods. This audit is a direct application of that mandate.
- The network is scaling: new Super Validators, new token registries, new dApp integrations. Each addition increases the number of parties relying on the correctness of the core protocol code without changing who reviews it.

Each area is reviewed in the context of how Canton is actually deployed and operated (multi-operator, permissioned, with varying trust levels between participants and domains), not as isolated code units.

The deliverables are usable by:
- Canton core engineers for direct remediation and regression testing
- The Tech & Ops Committee and Security Subcommittee for risk-informed prioritization of hardening work
- Network members for assessing the security posture of components they operate

### 4. Backward Compatibility
No backward compatibility impact.

---

## Milestones and Deliverables

### Milestone 1: Key Threat Identification and Audit Planning
- **Estimated Delivery:** 2 weeks from approval  
- **Focus:** Identify the key threats that will drive audit focus; establish audit targets in the codebase  
- **Deliverables / Value Metrics:**  
  - Ranked list of key threats (10-20) derived from Canton's architecture and protocol specification  
  - Attack surface map: for each key threat, the specific scenario, code modules and entry points to be reviewed  
  - Audit plan with time allocation per target area, agreed with the Canton engineering team  

### Milestone 2: Code Audit and Report
- **Estimated Delivery:** 5 weeks after Milestone 1  
- **Focus:** Deep code review across all target areas and delivery of the consolidated report  
- **Deliverables / Value Metrics:**  
  - Consolidated report with all findings, severity ratings, and fix recommendations, covering sequencer, mediator, topology manager, transaction validation pipeline, participant node internals, cross-domain protocols, ledger API authorization, and network-layer message handling  
  - Executive summary for non-engineering stakeholders  
  - Value metrics: scenarios reviewed, number and severity of confirmed findings, percentage of key threats with code-level coverage  

### Milestone 3: Remediation Verification
- **Estimated Delivery:** 1 week after Canton team completes fixes  
- **Focus:** Verify that fixes for Critical and High findings are correct and do not introduce new issues  
- **Deliverables / Value Metrics:**  
  - Remediation verification results for all findings (one round of re-review)  
  - Updated final report reflecting fix status for each finding  
  - Value metrics: fix verification rate, number of fixes confirmed vs. requiring further work  

---

## Acceptance Criteria
The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone  
- Demonstrated functionality or operational readiness  
- Documentation and knowledge transfer provided  
- Alignment with stated value metrics  

Project-specific acceptance conditions:
- Each Critical and High finding includes a reproducible exploitation scenario or proof of concept  
- Fix recommendations are specific to the affected code (not generic guidance)  
- Remediation verification covers all Critical and High findings with documented re-review results  

---

## Funding

**Total Funding Request:** $40,000 USD equivalent, paid in Canton Coin ($CC) after acceptance of each milestone deliverable.

### Payment Breakdown by Milestone
- Milestone 1 (Key Threat Identification and Audit Planning): $5,000 USD equivalent in $CC, paid after committee acceptance  
- Milestone 2 (Code Audit and Report): 35,000 USD equivalent in $CC, paid after committee acceptance  
- Milestone 3 (Remediation Verification): $0 USD 

### Volatility Stipulation
If the project duration is **greater than 6 months**:  
The grant is denominated in fixed Canton Coin and will require a re-evaluation at the 6-month mark.

If the project duration is **under 6 months**:  
Should the project timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility.

---

## Co-Marketing
Upon release, the implementing entity will collaborate with the Foundation on:

- Announcement coordination (kickoff + results)  
- Case study or technical blog describing the audit approach and selected findings (after responsible disclosure and remediation)  
- Joint promotion of the final report summary through Canton channels and Composable Security channels  
- Developer or ecosystem promotion (community call, newsletter, and partner amplification)  

---

## Motivation
Canton's protocol is specified at a high level of abstraction, but the security guarantees it promises are ultimately delivered by Scala code running on participant nodes, sequencers, and mediators operated by independent parties. Bugs at this layer can silently break guarantees that the rest of the ecosystem depends on.

A key-threat-based audit is the right tool for this situation because:
- The codebase is too large for uniform line-by-line review within a reasonable budget and timeline
- The most dangerous bugs tend to cluster around the code paths that implement the hardest protocol guarantees (atomicity, privacy, authorization across trust boundaries)
- Canton's Scala implementation involves concurrency, distributed coordination, and serialization patterns where experience-driven review consistently outperforms automated tooling
- A findings-first approach gives Canton engineers immediately actionable results, not a backlog of informational notes

---

## Rationale

Threat modeling tells you where to worry. A key-threat-based audit tells you whether those worries are justified at the code level - and hands you the specific bugs and fixes. The two are complementary: the threat model gives Canton the map; the audit gives it ground truth.

Composable Security is well positioned for this engagement. Our key-threat-based auditing of Scala-based L1 blockchains followed the same methodology proposed here and resulted in the discovery of critical vulnerabilities - bugs that a conventional review approach would likely have missed because they sat at the intersection of protocol logic and Scala-specific implementation patterns. 

Our Hyperledger Fabric audit experience with banking consortia means we already understand the security dynamics of permissioned, multi-operator ledger systems: the trust assumptions are different from public chains, the attack surface includes operational and configuration paths, and findings need to be actionable by teams that operate - not just develop - the software. Combined with our work for the Uniswap Foundation, Lido, Filecoin Foundation, and others, we bring both the depth in code-level security and the discipline to turn findings into fixes that ship.
