## Development Fund Proposal

**Author:** Alhassan Mohammed (alhassan.mohammed.erc3643@gmail.com) | [GitHub: dahlinomine](https://github.com/dahlinomine)  
**Status:** Submitted  
**Created:** 2026-03-23  

---

## Abstract

`hyperledger-labs/splice` — the Canton Coin reference implementation — has never been publicly indexed on the OpenSSF Scorecard dashboard and currently scores **5.9/10** on its first-ever independent baseline assessment (2026-03-23, commit `6e6f63a`). Five checks score 0/10: Security-Policy, SAST, Token-Permissions, Vulnerabilities (45 active CVEs), and CII-Best-Practices. This proposal funds three milestones to close these gaps systematically, with all deliverables verifiable via merged PRs and updated Scorecard scores on scorecard.dev.

---

## Specification

### 1. Objective

Close the five zero-score OpenSSF Scorecard gaps in `hyperledger-labs/splice` and establish a recurring security monitoring cadence for the Tech & Ops Committee. The intended outcome is a publicly-visible, continuously-updated security posture for Canton's reference implementation — raising Splice's Scorecard from 5.9/10 to ≥7.5/10 within two milestones and maintaining it thereafter.

### 2. Implementation Mechanics

**M1 — Security Baseline & Policy** (~6 weeks):
- Author and merge `SECURITY.md` following OpenSSF and GitHub Advisory best practices (Security-Policy target: ≥8/10)
- Remediate Token-Permissions across all 14 affected workflows: add `permissions: read-all` top-level blocks and scope write permissions to individual job level only (Token-Permissions target: ≥7/10)
- Run full CVE triage against the 45 advisories in GitHub's Advisory Database for Splice's dependency graph; classify each by exploitability in a Splice validator/synchronizer deployment context; produce a prioritized remediation backlog for top-10
- Submit Splice to the public OpenSSF Scorecard dashboard by merging the `ossf/scorecard-action` workflow with `publish_results: true` (permanently indexed at scorecard.dev — a PR implementing this has already been opened: [hyperledger-labs/splice#4571](https://github.com/hyperledger-labs/splice/pull/4571))

**M2 — SAST Integration & Dependency Pinning** (~8 weeks from M1):
- Add CodeQL CI workflow covering Scala, TypeScript, and Java on all PRs and pushes to main (SAST target: ≥7/10)
- Pin all 31 unpinned Docker container images to SHA256 digests (Pinned-Dependencies target: ≥7/10)
- Pin unpinned `pip install`, `npm install`, and `downloadThenRun` commands in build scripts

**M3 — Quarterly Security Monitoring** (recurring from Q3 2026):
- Quarterly Scorecard re-run against current HEAD + dashboard update
- New CVE triage delta since previous quarter
- 1-page security summary for the Tech & Ops Committee with score delta and material findings

All code changes are submitted as PRs to `hyperledger-labs/splice` (or the Foundation-controlled repo post-S7 migration), subject to normal maintainer review.

### 3. Architectural Alignment

- **CIP-0082**: This work directly serves the Development Fund's "security reviews, audits, and hardening" and "critical ecosystem infrastructure" categories.
- **CIP-0100**: Submitted under the external track; milestone-based format matches CIP-0100 Section: Proposal Generation → External.
- **Canton architecture**: All deliverables are additive (CI config, docs, tooling). No changes to Daml contracts, Canton protocol, Scala/TypeScript application code, Docker images, or deployment configuration. Zero risk of breaking changes.
- **Hyperledger Labs alignment**: Splice's use by institutional partners (DTCC Digital Asset for U.S. Treasury tokenization, EDX Markets) makes public security transparency a reputational priority for the Foundation. For comparison, `digital-asset/daml` scores 7/10 on the same tool — confirming this is a systemic gap across Canton's OSS surface, not an isolated case.

### 4. Backward Compatibility

*No backward compatibility impact.* All deliverables are additive. CI workflows, SECURITY.md, and CVE triage reports do not modify any runtime behavior.

---

## Milestones and Deliverables

### Milestone 1: _Security Baseline & Policy_
- **Estimated Delivery:** ~6 weeks from approval
- **Focus:** Security-Policy, Token-Permissions, CVE triage, Scorecard public indexing
- **Deliverables / Value Metrics:**
  - SECURITY.md merged to `hyperledger-labs/splice` main → Scorecard Security-Policy ≥8/10
  - Token-Permissions remediation PRs merged across all 14 affected workflows → Scorecard Token-Permissions ≥7/10
  - CVE triage report published (GitHub Security Advisory or committee-shared document): all 45 advisories classified; top-10 prioritized with remediation backlog
  - Scorecard action workflow merged (`publish_results: true`) → Splice permanently indexed at scorecard.dev; baseline score publicly visible

### Milestone 2: _SAST Integration & Dependency Pinning_
- **Estimated Delivery:** ~8 weeks from M1 acceptance
- **Focus:** SAST, Pinned-Dependencies
- **Deliverables / Value Metrics:**
  - CodeQL CI workflow merged covering Scala, TypeScript, Java → Scorecard SAST ≥7/10
  - All 31 unpinned Docker images pinned to SHA256 digests → Scorecard Pinned-Dependencies ≥7/10
  - Unpinned pip/npm/downloadThenRun commands in build scripts pinned
  - Updated Scorecard score on scorecard.dev reflecting M2 changes (target: overall ≥7.5/10)

### Milestone 3: _Quarterly Security Monitoring_ (recurring)
- **Estimated Delivery:** Q3 2026 (first report), then quarterly
- **Focus:** Ongoing monitoring and committee reporting
- **Deliverables / Value Metrics:**
  - Quarterly Scorecard re-run against current HEAD with updated scorecard.dev result
  - CVE triage delta: new advisories classified since previous quarter
  - 1-page security summary for Tech & Ops Committee: score delta, material findings, recommended actions

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone
- Demonstrated functionality or operational readiness (merged PR links + updated Scorecard scores on scorecard.dev)
- Documentation and knowledge transfer provided (CVE triage reports, committee security summaries)
- Alignment with stated value metrics (Scorecard check scores verified via public scorecard.dev dashboard)

Milestone-specific acceptance:
- **M1**: Scorecard Security-Policy ≥8/10 AND Token-Permissions ≥7/10 AND CVE triage report delivered AND Splice indexed on scorecard.dev
- **M2**: Scorecard SAST ≥7/10 AND Pinned-Dependencies ≥7/10 AND overall score ≥7.5/10
- **M3**: Each quarter — updated scorecard.dev result + CVE delta + committee summary delivered within 30 days of quarter-end

Sensitive CVE findings will be routed through GitHub Security Advisories or the Security Subcommittee as appropriate before any public disclosure.

---

## Funding

**Total Funding Request:** ~$10,500 USD equivalent in Canton Coin (Year 1: M1 + M2 + 2× M3)

### Payment Breakdown by Milestone
- Milestone 1 _(Security Baseline & Policy)_: ~$3,000 USD equiv. in CC upon committee acceptance
- Milestone 2 _(SAST & Dependency Pinning)_: ~$4,000 USD equiv. in CC upon committee acceptance
- Milestone 3 _(Quarterly Monitoring, per quarter)_: ~$1,500 USD equiv. in CC upon quarterly report acceptance

### Volatility Stipulation
Project duration is under 6 months for M1+M2. Should the timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility.

For M3 (recurring): each quarterly engagement is evaluated and priced independently.

---

## Co-Marketing

Upon M1 release, I will collaborate with the Foundation on:

- Announcement coordination (e.g., noting that Splice is now publicly indexed on scorecard.dev)
- A technical blog post or committee report documenting the baseline findings and M1 remediation
- Ecosystem promotion via my LinkedIn presence in the RWA/tokenization compliance community

---

## Motivation

`hyperledger-labs/splice` is Canton's primary reference implementation — the codebase that institutional partners, Super Validator operators, and external developers study to understand how to build on Canton. Its security posture is visible to the entire ecosystem.

A public Scorecard score of 5.9/10 with five zero-score checks (including 45 unaddressed CVEs and no published security policy) understates the actual security investment in Splice, and creates reputational risk for Foundation-affiliated projects that use Splice as a baseline. More practically: as Canton adoption grows toward institutional DeFi and tokenized asset infrastructure, regulators and institutional partners increasingly screen OSS dependencies by their OpenSSF Scorecard posture.

This work delivers a shared good: it does not benefit a single operator or application — it improves the public security signal for every project built on or evaluated against Splice.

---

## Rationale

The OpenSSF Scorecard is the most widely-cited automated supply-chain security metric for OSS projects and is increasingly used by institutional buyers and compliance teams to evaluate dependencies. Raising Splice's score is the minimal-overhead path to public security credibility: all deliverables are additive (no protocol changes), all results are objectively verifiable, and the Scorecard action itself (once merged) provides continuous monitoring with zero ongoing manual effort.

An alternative approach — a one-time manual audit — would cost more, deliver a point-in-time finding with no update mechanism, and not address the structural CI/tooling gaps that cause the zero-score checks. The Scorecard-based approach is more cost-effective, more durable, and more visible to the community.
