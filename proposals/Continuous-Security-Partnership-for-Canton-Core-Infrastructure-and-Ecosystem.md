# Development Fund Proposal: Continuous Security Partnership for Canton Core Infrastructure and Ecosystem

**Author:** VulSight (vulsight.com) — ZeroCipher(Lead Researcher) ( https://x.com/zerocipher002) and Salman [TG/X: @ItsShad0wWalker](https://twitter.com/ItsShad0wWalker) & 
**Status:** Submitted  
**Created:** 2026-03-04

---

## Abstract

VulSight is proposing a long term security partnership for the Canton Network structured in two stages: a **pay-per-vulnerability core protocol audit, zero-upfront-cost** followed by a **milestone-funded ecosystem security buildout**.

**Stage 1 — Core Protocol Audit (Pay-Per-Vulnerability):** VulSight will carry out deep, manual security audit of Canton's Scala infrastructure with an attacker mindset. This will cover the sequencer, mediator, participant nodes, cross-domain protocols, Daml runtime, Splice components, and API surfaces. 
There is no upfront cost to the Canton Foundation. Payment is only made if VulSight finds real, exploitable vulnerabilities in the codebase and those findings are confirmed.

In other words, the Foundation only pays for validated security findings:

- **$20,000 per Critical vulnerability**
- **$10,000 per High vulnerability**
- **$5,000 per Medium vulnerability**

If VulSight finds nothing, Canton does not pay anything but gets a complete audit report. The Foundation's downside is zero.

**Stage 2 — Ecosystem Security Buildout (Milestone-Funded):** Stage 1 is demonstrating value, VulSight will deliver permanent ecosystem security capabilities: 
- Daml-specific security research 
- a public vulnerability knowledge base 
- quarterly protocol re-audits
- ecosystem application audit capacity
- security office hours
- incident response retainer

Canton is now important infrastructure for institutional finance. Major institutions and hundreds of ecosystem participants depend on its protocol layer working correctly. 

This proposal puts VulSight's reputation and resources at risk before asking the Foundation to commit a single Canton Coin because we are confident enough in our ability to find real vulnerabilities in Canton's Scala codebase that we are willing to work for free if we can't.

---

## Specification

### 1. Objective

Canton's security guarantees 
- sub-transaction privacy
- BFT consensus integrity
- cross-domain atomic transactions
- Daml authorization enforcement 

These are ultimately delivered by Scala code running on sequencers, mediators, and participant nodes operated by independent organizations. Bugs at this layer do not cause individual application failures; they break the trust model for the entire network.

**The problem:** Canton's codebase is huge, complex, and changing rapidly. A One-time audit, whether traditional or contest-based will only find issues in the version being reviewed at that time. It does not provide security against new vulnerabilities or regressions that may appear in subsequent releases. At the same time, teams building on Canton do not always have access to security experts who truly understand Daml’s unique permission model and Canton’s privacy focused design.

**The intended outcome:** A more secure Canton protocol stack that keeps getting stronger with every release, with retained audit context across releases.
A public Daml security knowledge base that helps all builders understand the main risks and avoid common mistakes.
And a clear, funded way for any team building in the Canton ecosystem to get a security audit from experts who truly understand Canton, starting with a zero risk model where the Foundation only pays when real, verified security issues are found.

### 2. Implementation Mechanics

#### Stage 1 — Core Protocol Security Audit (Pay-Per-Vulnerability)

A deep, manual security review of Canton’s Scala codebase, done with an attacker mindset.

VulSight will take on all the cost and effort. The Foundation only pays if real, validated vulnerabilities are found, and also receives a full audit report.

**Methodology:**

- **Key threat derivation and ranking:** Identify the 15 to 25 highest-impact threats against Canton's protocol guarantees (transaction forgery, privacy boundary violation, consensus manipulation, unauthorized state changes, liveness denial, cross-domain atomicity failure). Will be ranked by damage potential and feasibility based on Canton's actual deployment topology.
- **Attack surface mapping:** For each ranked threat, trace code paths from entry points (Ledger API, gRPC interfaces, network protocol messages, operator commands) through internal logic (sequencer message ordering, mediator confirmation flows, topology manager decisions, Daml interpreter execution) to state changes.
- **Deep manual code review:** Focused review of mapped paths targeting logic errors, concurrency bugs, serialization mishandling, cryptographic misuse, cross-domain edge cases, and authorization bypass vectors.
- **Exploitation validation:** Every suspected vulnerability is validated with a proof-of-concept exploit or detailed exploitation scenario. Findings without a credible attack path are downgraded to Informational (unpaid). No padding the report with theoretical concerns. We will only get paid for real bugs.
- **Remediation support:** Code-level fix recommendations and suggested regression tests for every paid finding, plus one round of remediation verification for all Critical and High findings at no additional cost.

**Target components:**

- **Sequencer and Mediator:** Message ordering integrity, confirmation request/response validation, encrypted sub-transaction routing, conflict resolution logic. Includes new processing paths introduced in the Canton 3.3/3.4 migration (CIP-0089) that have not been independently reviewed.
- **Participant Nodes:** Daml interpreter execution, authorization model enforcement, contract visibility boundary integrity, private contract store isolation, DAR package deployment validation.
- **Cross-Domain Protocols:** Atomicity and coordination guarantees across independently operated sync domains. This is Canton's most architecturally unique and complex attack surface.
- **Topology Manager:** Topology state transitions, identity management, key rotation and certificate chain validation.
- **Ledger API and gRPC Surfaces:** External input validation, party authentication, event stream integrity. The Canton Network Token Standard (CIP-0056) and dApp Standard (CIP-0103) have introduced new API surfaces expanding the attack surface.
- **Splice Open-Source Components:** Token standard implementations, validator node deployment logic and governance application attack surface.

**Severity classification:** Severity ratings follow industry standard definitions aligned with Canton's architecture:

- **Critical:** This is a serious exploit that an attacker can actually use to steal funds, permanently lock or lose assets, bypass consensus rules, or completely break the privacy model. It can be exploited by an outside attacker or even one bad operator acting alone, without needing help from others.
- **High:** This is a vulnerability that can be exploited to make major unauthorized changes, leak private data in a meaningful way, cause the system to stall for many users, or gain higher privileges across the trust boundaries. It might need certain conditions to line up first.
- **Medium:** This is a vulnerability that enables smaller, limited abuse. It can include minor data leakage (not a full privacy break), denial-of-service against a single part of the system, or permission weaknesses that are unlikely but still possible to exist.
- **Informational / Low:** This is not a direct exploit. These are code quality problems, best-practice gaps, or mostly theoretical risks with no clear attack path. They can still be mentioned in the final audit report, but they’re typically not eligible for payment.

**Why this model works for both parties:**

- **For Canton Foundation:** There is no financial risk for Canton Foundation. The Foundation commits no budget unless VulSight finds real, exploitable vulnerabilities with proof-of-concept demonstrations. If the codebase turns out to be clean, the Foundation pays nothing and still receives a detailed audit report confirming the protocol’s security. This itself is a valuable deliverable for institutional participants evaluating Canton.

- **For VulSight:** We are confident enough in our process and track record to take on the cost of a multi month audit ourselves. This pay per vulnerability model shows that we care more about real results than billing for time. We recently discovered CVE-2026-26314 in Ethereum’s Geth client, a high severity issue in the most widely used L1 execution client, and it was something others had missed. We do not suggest engagements where we believe there is no real value to deliver.

#### Stage 2 — Ecosystem Security Buildout (Milestone-Funded, Contingent on Stage 1)

Activated after Stage 1 proves its value. Then it moves into a milestone based model focused on building long term security capabilities for the Canton ecosystem.

**Phase 2A — Daml Security Tooling and Public Knowledge Base (Months 1–2 of Stage 2)**

- **Daml Security Audit Framework:** Open-source, Canton-specific vulnerability pattern guide covering authorization logic flaws, signatory/observer privilege escalation, contract archival race conditions, cross-domain atomicity violations, time-handling edge cases, visibility boundary leakage, and DAR package dependency attacks.
- **Canton Vulnerability Pattern Database:** Structured repository of 20+ attack patterns with severity ratings, affected components, detection methods, and remediation strategies.
- **Automated Daml Security Linting Rules:** Static analysis rules for common Daml misconfigurations, packaged for CI/CD integration.

**Phase 2B — Continuous Security Partnership (Months 3–9 of Stage 2)**

- **Quarterly Protocol Re-Audit:** Review of protocol changes, CIP implementations, and version upgrades with full retained context from Stage 1.
- **Ecosystem Application Audit Pipeline:** Dedicated audit capacity for Canton ecosystem projects.
- **Security Office Hours:** Monthly open sessions for Canton developers.
- **Incident Response Retainer:** Emergency security response and coordinated disclosure support.
- **CIP Security Review:** Proactive security review of Canton Improvement Proposals before implementation.

### 3. Architectural Alignment

This work directly supports the Canton Foundation’s goals under CIP-0082, which treats security as an important public good, and CIP-0100 that focuses on ecosystem fund governance.

**Privacy model validation:** Audit will validate sub-transaction privacy guarantees under adversarial conditions, including malicious participant nodes attempting to extract information beyond authorized visibility scope, and colluding parties attempting to reconstruct private transaction data from individual views.

**Consensus integrity testing:** The Global Synchronizer's 2/3 BFT consensus will be stress-tested against Byzantine fault scenarios including colluding Super Validators, message reordering, and governance vote manipulation.

**Cross-domain atomicity assurance:** Specific focus on atomic cross-domain composition security — ensuring atomicity holds across independently operated sync domains even when one or more domains behave adversarially.

### 4. Backward Compatibility

*No backward compatibility impact.* 
All findings will be shared responsibly with the Tech and Ops Committee before anything is communicated publicly. The recommended fixes will be designed so they can be applied without breaking existing integrations.


---

## Milestones and Deliverables

### Stage 1: Core Protocol Audit (Pay-Per-Vulnerability)

#### Milestone 1: Threat Model, Attack Surface Map, and Audit Kickoff

- **Estimated Delivery:** 3 weeks from approval
- **Focus:** Key threat identification, attack surface mapping, audit plan coordination with Canton engineering
- **Deliverables:**
  - Ranked threat catalog (15–25 threats)
  - Attack surface map with targeted code modules and entry points
  - Agreed audit plan with Canton core engineering team
- **Funding:** $0 (VulSight-funded)

#### Milestone 2: Core Audit Report and Findings

- **Estimated Delivery:** 8 weeks after Milestone 1
- **Focus:** Deep manual code review. Consolidated findings with exploitation validation
- **Deliverables:**
  - Full audit report with all findings, severity ratings, root cause analysis, proof-of-concept exploits, and code-level fix recommendations
  - Executive summary for non-engineering stakeholders
  - Threat coverage matrix
- **Funding:** Pay-per-vulnerability ($20K USD Critical / $10K USD High / $5K USD Medium) Equivalent in CC

#### Milestone 3: Remediation Verification

- **Estimated Delivery:** 2 weeks after Canton engineering completes Critical/High fixes
- **Focus:** Verify all Critical and High fixes are correct and do not introduce new issues
- **Deliverables:**
  - Remediation verification results with documented pass/fail for each fix
  - Updated final report reflecting fix status
- **Funding:** $0 (included in Stage 1)

---

### Stage 2: Ecosystem Security Buildout (Milestone-Funded)

*Dependent on Stage 1 demonstrating value. to be Submitted to committee for approval after completion of Stage 1.*

#### Milestone 4: Daml Security Framework and Research

- **Estimated Delivery:** within 8 weeks after approval of stage 2
- **Focus:** Public Daml security research knowledge base
- **Deliverables:**
  - Published Daml Security Audit Framework (v1.0, open-source)
  - Canton Vulnerability Pattern Database (multiple patterns)
  - Co-Marketing such as publishing multiple blog posts with Canton
- **Funding:** $25,000 USD equivalent in CC upon committee acceptance

#### Milestone 5: Continuous Security Partnership — Operational

- **Estimated Delivery:** Estimated time of delivery will be 6 months of stage2 
- **Focus:** Continuously covering the security and ecosystem audit capacity
- **Deliverables:**
  - 2 quarterly protocol re-audits completed
  - Atleast 2 application will be audited from the ecosystem
  - Security office hours sessions of Minimum 6 hours
  - Incident response retainer active
  - CIP security review participation documented
- **Funding:** $25,000 USD equivalent in CC upon committee acceptance

#### Milestone 6: Annual Security Review and Year 2 Proposal

- **Estimated Delivery:** Month 9 of Stage 2
- **Focus:** Year-end assessment and forward planning
- **Deliverables:**
  - Annual security report
  - Up to date vulnerability pattern database for Canton
  - Third quarterly re-audit completed
  - Audit of atleast 3 ecosystem built application
  - Minimum 9 total security office hours sessions
  - Updated proposal for year two engagement
- **Funding:** $15,000 USD equivalent in CC upon committee acceptance

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

**Stage 1 (Pay-Per-Vulnerability):**

- All deliverables (threat model, audit report, remediation verification) will be completed to a high professional standard no matter how many vulnerabilities are found.
- Every paid finding will come with either a working proof of concept or a clear, step by step exploitation scenario. These will be real issues that can be demonstrated, not just theoretical concerns.
- Fix recommendations will be tied directly to the affected code and will include suggested regression tests where needed. This will be practical guidance, not broad or generic advice.
- Severity levels will follow the definitions set in this proposal. If there is any disagreement, they can be reviewed by the committee.
- Remediation verification will cover all Critical and High severity findings, with the re review results clearly documented.
- Even if no vulnerabilities are found, the Foundation will still receive the full audit report, threat model, and attack surface map as valuable public deliverables.

**Stage 2 (Milestone-Funded):**

- Each milestone will be completed with the promised deliverables.
- The public Daml security research should be used by multiple Canton ecosystem teams within six months of release.
- Quarterly re audits will stay on schedule, with no delay longer than 30 days beyond the planned delivery date.
- All work will follow Canton Foundation governance processes and responsible disclosure standards.
---

## Funding

### Stage 1 — Total: Variable (Pay-Per-Vulnerability)

| Severity | Payment per Finding |
|----------|-------------------|
| Critical | $20,000 USD equivalent in CC |
| High     | $10,000 USD equivalent in CC |
| Medium   | $5,000 USD equivalent in CC |
| Low / Informational | $0 (reported but unpaid) |

- After the acceptance of each finding, the payment against it will be initiated
- If no vulnerabilities are found, the Canton Foundation pays nothing and still receives the full audit report, threat model, and attack surface map.
- There is no payout cap in Stage 1. Every confirmed vulnerability will be paid based on its severity level.
- If there is any disagreement about severity, it will be resolved by the Tech and Ops Committee with input from Canton’s core engineering team and Vulsight.

### Stage 2 — Total: $65,000 USD equivalent in CC

- Milestone 4 *(Daml Security Framework)*: $25,000 USD equivalent in CC
- Milestone 5 *(Continuous Security — Operational)*: $25,000 USD equivalent in CC
- Milestone 6 *(Annual Review)*: $15,000 USD equivalent in CC

### Combined Value Proposition

Stage 1 carries no risk for the Foundation.

Stage 2 only moves forward if Stage 1 clearly proves its value.

The maximum commitment for Stage 2 is $65,000, and in return the Foundation gets long term security support for the Canton ecosystem. This includes permanent open source security research, three quarterly re-audits, at least three ecosystem application audits, nine security office hours sessions, and incident response support.

Overall, this is a very cost effective way to build strong, ongoing security coverage across the Canton ecosystem.

### Volatility Stipulation

Stage 1 payments are denominated in USD equivalent, converted to CC at the time of each finding's acceptance. Stage 2 milestone payments are denominated in USD equivalent and paid in CC. Should Stage 2 extend beyond 6 months due to Committee-requested scope changes, remaining milestones will be renegotiated to account for significant USD/CC price volatility.

---

## Co-Marketing

To initiate the efforts, VulSight and Canton Foundation will comarket on follwing:

- **Joint announcement** of the security partnership through Canton Foundation and VulSight channels
- **Technical blog series** (minimum 4 posts over the engagement) covering Canton security architecture, Daml security patterns, and selected findings after responsible disclosure
- **Developer education:** Security workshops at Canton hackathons, contributions to Canton Core Academy content, and developer community participation
- **Conference presence:** Joint presentations at fintech and blockchain security conferences positioning Canton's security rigor
- **Audit transparency:** Published audit summary reports as trust signals for institutional participants evaluating Canton

---

## Motivation

Canton Network is important infrastructure for institutional finance. The Canton Foundation created this Development Fund under CIP-0082 because it sees security as a core public good. The fact that multiple teams are now proposing security work for Canton shows how important and urgent this need is. But the Foundation should look closely at what each proposal really offers and what level of financial risk it creates.

VulSight’s pay per vulnerability model is different because it puts no financial risk on the Foundation for the core protocol audit. We are not asking Canton to pay for time spent or for a process on paper. We are asking to be paid only if we deliver real security value through confirmed, exploitable vulnerabilities.

We can make that offer because we have the track record to stand behind it:

- **CVE-2026-26314**: 
We responsibly disclosed a high severity vulnerability in Ethereum’s Geth client, the most widely used L1 execution client in production. This was deep protocol level security research, which is the same kind of work needed for Canton’s Scala codebase.

- **Top 15 all-time on Cantina**:  
Cantina is one of the leading competitive audit platforms, where researchers are tested directly against other top security experts. Our results there are strong, consistent, and publicly verifiable.

- **100+ completed security audits**: 
across EVM, Move such as Aptos and Sui, and Rust ecosystems such as Solana. Canton’s architecture is broad and complex, so it benefits from a team with experience across multiple systems and security models.

- **$500K+ in bug bounties**:
rewards earned through responsible disclosure across live protocols and multiple chains.

This model reflects how we work. We take on the effort and the risk first, and we ask to be paid for proven results.

## Rationale

**Why pay-per-vulnerability for Stage 1?**

Because it aligns incentives in the clearest possible way.

With a traditional audit, you pay for the team’s time whether they find important issues or not. With a contest, you still pay for the setup, coordination, and platform costs regardless of the outcome.

A pay per vulnerability model works differently. It gives VulSight a strong reason to find every real, exploitable issue in the codebase, while also protecting the Foundation if the codebase is cleaner than expected.

In simple terms, it removes one of the biggest concerns in grant decisions: "what if money is spent but nothing truly useful comes out of it?"

**Why continuous partnership for Stage 2?**

A one time audit only gives you a snapshot of the code at that moment, and that value starts to fade as soon as the code changes.

Canton is evolving continuously. New updates like CIP-0089, CIP-0092, and CIP-0094 each introduce new paths, features, and risks, which means the attack surface keeps changing too.

That is why VulSight’s Stage 2 matters. Instead of starting from scratch every time, it keeps security review ongoing and carries forward everything learned in Stage 1. This means each quarterly reaudit builds on real context and deeper understanding, rather than repeating the same work from zero.

**Why VulSight specifically for Canton?**

Canton is a very unique system: Scala-based distributed system, functional smart contract language (Daml), privacy-preserving sub-transaction visibility, BFT consensus, and a permissioned-but-public deployment model with institutional operators. 
VulSight’s experience across EVM, Move, Rust, and core L1 infrastructure fits well with that kind of design. We are used to working across different architectures, execution models, and security assumptions.

Our Geth CVE is a strong example of that. It shows that we can find serious bugs in core protocol implementations, not just in application level smart contracts.

**Complementary to other security approaches:**

VulSight's model is designed to be the anchor security engagement that other activities layer on top of. Contest-based audits are valuable for broad coverage; they discover different bug classes than focused manual review. But they require a knowledgeable team to triage findings, validate severity, and ensure correct remediation.

That is where VulSight adds long term value. With an ongoing role, we provide the technical context and continuity needed to make those other security efforts more effective, no matter what additional programs the Foundation decides to run.


## Separately scoped work
Included in quarterly re-audit (covered by milestone funding):

Patch-level changes and minor bug fixes
Configuration and parameter changes
Small CIP implementations that modify existing code paths (under ~2,000 lines changed)
Regression testing of previously identified vulnerabilities against new versions

Triggers a separately scoped engagement (not covered by milestone funding):

New subsystem integrations (oracle systems, new token standards, bridge implementations)
Major version upgrades that restructure core components
CIP implementations introducing entirely new code modules (over ~2,000 lines of new code)
New consensus mechanism changes or validator architecture modifications

For separately scoped work, VulSight would submit a lightweight addendum proposal with scope, timeline, and pricing, either funded through the Development Fund as a new milestone, or paid directly by the requesting party.
