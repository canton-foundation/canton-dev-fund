## Development Fund Proposal

**Organization:** Aeon (open-source project, [github.com/aeonfun/aeon](https://github.com/aeonfun/aeon))
**Author / Primary Contact:** Nurstar (@NurstarK), Aeon contributor
**Status:** Submitted
**Created:** 2026-11-24
**Proposal Type:** RFP-aligned
**RFP / Roadmap Area:** RFP 22, Security, Assurance & Incident Readiness: Daml Security Standards and Secure Development (secondary: RFP 18, Integration into SDLCs)
**Champion:** `Needs Champion`
**Total Funding Request:** CC equivalent of 45,000 USD
**Project Duration:** 6 months
**License:** Code under MIT; catalogue and checklist under CC0-1.0
**Label:** daml-tooling

## Abstract

Aeon is an MIT-licensed autonomous agent that runs skills on a schedule in GitHub Actions and logs every run in git. Its `vuln-scanner`, `sc-audit` and `vuln-tracker` skills already scan open-source repos, verify findings, ship fixes and track disclosure through to merge. [Aeon's security page](https://aeon.fun/security) reports 156 vulnerabilities found and fixed across 116 repositories as of November 2026.

This proposal adds Daml to that pipeline. We will build a `daml-audit` skill and publish an open Daml weakness catalogue with a benchmark. We will also run scheduled scans of public Canton and Daml repositories with private disclosure, and package the skill as a GitHub Actions check that any Daml team can run before it deploys or vets a package.

## Specification

### 1. Objective

Give every Daml team a free, open-source, automated security review that runs in its own CI. Alongside it, publish a shared catalogue of Daml weakness patterns that reviewers, auditors and tool builders can reuse.

### 2. Implementation Mechanics

The new `daml-audit` skill lives in `aeonfun/aeon/skills/daml-audit` and follows the structure of the existing `sc-audit` skill:

1. **Detect and build.** Find the Daml packages in the repo and build and test them with the project's own toolchain (DPM), so that every finding points to code that compiles.
2. **Model first.** For each template, record the signatories, observers, controllers, choices and how each choice consumes the contract, the `ensure` conditions and the upgrade lineage. Then write down the intended authorization and the business invariants.
3. **Hunt.** For each invariant, a time-limited agent pass looks for a way to break it. Targets: controllers with too much power, missing `ensure` checks, choices that reveal data to the wrong observers, unchecked numbers and times, upgrades that break compatibility, and unsafe use of disclosed contracts.
4. **Prove.** A finding counts only if it has a failing Daml Script test that reproduces it. Findings without one are dropped.
5. **Adversarial check.** A second pass tries to disprove each finding before it is reported, to keep false positives low.
6. **Route.** Findings go through Aeon's existing disclosure process: a private GitHub advisory, or a private email if advisories are turned off. Fix PRs are made public only once the maintainer agrees, and `vuln-tracker` follows each finding to merge.

**Daml weakness catalogue and benchmark.** A public list of Daml weakness patterns. Each entry has a description, a vulnerable example, a fixed example and a Daml Script test. The vulnerable examples double as a benchmark: they measure the skill's detection rate, and other Daml security tools can use them too.

**CI integration.** A reusable GitHub Actions workflow that runs `daml-audit` on pull requests and before a release. It writes SARIF for GitHub code scanning plus a Markdown summary, and each team sets the severity that fails the build.

### 3. Architectural Alignment

The work sits outside Canton and needs no changes to the protocol, nodes or APIs. It reads only the source code of the repo it scans and runs in that repo's own CI, so no ledger data leaves the team. It complements the human audits funded under RFP 21: it catches common weaknesses early, so paid audit time goes to the harder problems.

### 4. Backward Compatibility

It has no effect on existing Canton components. During the maintenance period (Milestone 4), the skill keeps up with Canton 3.x and Daml releases.

## Milestones and Deliverables

| # | Timing | Deliverable | Funding (USD in CC) |
| --- | --- | --- | --- |
| M1 | Months 1–2 | `daml-audit` skill merged into `aeonfun/aeon`; first 15 catalogue entries with benchmark cases; benchmark results published | 12,000 |
| M2 | Months 2–4 | Catalogue grown to 30 entries plus a review checklist; scheduled scans of at least 15 public Canton/Daml repos; every verified finding disclosed privately and tracked | 13,000 |
| M3 | Months 4–5 | Reusable GitHub Actions workflow with SARIF output; setup docs and an example repo | 10,000 |
| M4 | Month 6 | At least 5 Canton teams running the CI check; public report; 6 months of maintenance for Canton/Daml updates after delivery | 10,000 |

## Acceptance Criteria

- **M1:** The skill is public under MIT. On the published benchmark it detects at least 80% of the seeded weaknesses, and no more than 20% of the findings it reports are false positives. Every reported finding comes with a Daml Script test that reproduces it.
- **M2:** The catalogue and checklist are public under CC0. Scan logs for at least 15 repositories are committed to the Aeon repo, with findings redacted until they are disclosed. Every verified finding has a disclosure record, and each one's status is shared with the Security Subcommittee.
- **M3:** A Daml team can add the check to an existing repo in under 30 minutes by following the docs. The workflow passes on the example repo and fails on a commit with a seeded vulnerability.
- **M4:** At least 5 Canton teams have the check enabled, shown by links to their workflow files (with their consent). The public report gives results and false-positive rates, and summarizes disclosures without revealing any that are still unfixed.

## Funding

**Total Funding Request:** CC equivalent of 45,000 USD, paid per milestone on acceptance.

### Payment Breakdown by Milestone

- M1: 12,000 USD in CC
- M2: 13,000 USD in CC
- M3: 10,000 USD in CC
- M4: 10,000 USD in CC

### Volatility Stipulation

Amounts are set in USD and converted to CC at the rate on the approval date. If the committee asks for a milestone to be delayed by more than six months, either side may renegotiate the CC amount.

## Co-Marketing

Aeon will publish the benchmark results and an end-of-grant write-up on its [blog](https://www.aeon.fun/blog) and [YouTube channel](https://www.youtube.com/@aeonfun), and will credit the Canton Development Fund in the skill's README. A disclosure is written up only after the affected team has shipped a fix.

## Motivation

RFP 22 asks for security tooling that catches weaknesses *before* packages are deployed or vetted. Most Daml teams cannot pay for a full audit of every release. An open check that runs on a schedule in their own CI covers the releases between audits, and the catalogue gives the whole ecosystem a shared list of weakness patterns.

## Rationale

- **It builds on a pipeline that already works.** Scanning, verification, disclosure and tracking already run in production in Aeon. The grant pays for the Daml-specific work (threat model, catalogue, reproductions, CI packaging), not for building a new scanner.
- **It is open, not a subscription.** Everything ships under MIT or CC0, and teams run it in their own GitHub Actions with no Aeon service involved.
- **Every finding is proven.** A finding has to come with a Daml Script test that reproduces it and survive the adversarial check, so maintainers are not asked to triage noise.

## About Aeon

Aeon is an open-source autonomous agent framework (MIT, public since March 2026). Aaron (@aaronjmars) created it, and community contributors help maintain it. As of November 2026, the repo has about 800 stars, 310 forks and more than 90 skills, and it exposes an MCP server.

As of November 2026, [aeon.fun/security](https://aeon.fun/security) reports 156 vulnerabilities found and fixed across 116 repositories with 5.7M combined stars. That includes 6 critical and 87 high findings, with fixes in repositories from NVIDIA, Google, Microsoft, Alibaba and Tencent.

- Website: https://aeon.fun
- GitHub: https://github.com/aeonfun/aeon
- Security record: https://aeon.fun/security
- Skill catalog: https://aeon.fun/#skills
- Blog: https://www.aeon.fun/blog
- Demo videos: https://www.youtube.com/@aeonfun
