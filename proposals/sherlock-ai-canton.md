# Sherlock AI for Canton: Daml Security Tooling and ecosystem-wide coverage

## Abstract

Sherlock will customize its AI auditing engine for Daml and Canton's architecture, then provide 25 AI audit runs to projects building on Canton. Each run includes a full AI-driven security review of a project's Daml models and Canton integration code, followed by triage from security researchers who have hands-on experience with Canton's codebase. The goal is to give every project building on Canton access to security tooling that actually understands their stack, at a fraction of the cost of a traditional audit. Funding is 75,000 USD equivalent in CC: 50,000 for Daml/Canton AI customization and 25,000 for 25 ecosystem project runs.

## Specification

### 1. Objective

Canton's ecosystem is growing fast, with new applications, tokenized assets, and integrations launching on the network regularly. These projects need security review before going to production, but the options today are limited. Traditional audits are expensive and slow, the pool of auditors who understand Daml is tiny, and there's no AI security tooling that has been trained on Daml patterns or Canton's architecture.

This proposal solves that by bringing Sherlock AI to Canton with four concrete objectives:

- **Faster time to mainnet.** Canton projects will reach mainnet an estimated four weeks faster on average by catching vulnerabilities during development rather than discovering them during audit. Sherlock AI completes a full review in as little as 2 hours on a scope that might take 2 months of traditional audit time, which means teams can iterate on security findings in real time instead of waiting weeks for an auditor to become available.
- **Ecosystem cost savings.** Canton projects and the Canton Foundation will save up to an estimated $350k on audits, fix reviews, and re-audits across the 25 runs. Each medium or high severity vulnerability caught by AI before it reaches a formal audit or a live deployment is worth roughly $10,000 in avoided audit, fix, and bug bounty costs. At that rate, the savings from this pilot alone could exceed the requested grant amount multiple times over.
- **Reduced exploit risk.** Participating projects receive scans that catch vulnerabilities before exploitation or bug bounty payouts, keeping Canton projects secure as their codebases evolve. This is especially important for Canton given the institutional value flowing through the network, where a single exploit in an ecosystem application could damage trust across the entire network.
- **High signal, low noise.** Sherlock AI's triaging methodology achieves a sub-50% false positive rate, which is industry-leading for AI security tools. Combined with human triage from researchers who know Canton's codebase, development teams can focus on fixing legitimate issues rather than wading through false alarms. This matters even more for Daml, where generic security tools would flag irrelevant patterns from other ecosystems and waste developer time.

### 2. Implementation Mechanics

Sherlock AI is already in production for EVM codebases, where it provides auditor-level analysis during development and catches vulnerabilities that teams would otherwise ship to mainnet. It's trained on verified audit findings, real contest submissions, and exploited codebases from Sherlock's security programs. It uses multi-step reasoning to trace state transitions and identify logic-level issues, not just pattern matching against known vulnerability signatures. For Canton, the AI needs to be customized to understand Daml's type system, authorization model, signatory/observer patterns, and the specific vulnerability classes that apply to functional, rights-and-obligations-based smart contracts.

**Phase 1: Daml/Canton AI Customization ($50,000)**

- Training the model on Daml's authorization semantics, so it understands signatory requirements, observer visibility rules, choice authorization, and how contract keys work. These are fundamentally different from EVM access control patterns and the AI needs to reason about them natively rather than mapping them to Solidity equivalents.
- Incorporating Canton-specific vulnerability patterns. If the contest audit proposal is also approved, findings from that contest become direct training data for the AI, which means the model learns from real vulnerabilities discovered in Canton's own infrastructure. Even without the contest, Sherlock will work with Canton Foundation contributors to build a corpus of Daml-specific security patterns, edge cases, and known pitfalls.
- Training on the Scala/Daml integration boundary, which is where many Canton applications have automation code in Scala that exercises Daml choices. The AI needs to understand how state flows between these layers and where assumptions can break.
- Adapting the analysis pipeline for Canton's architecture: sub-transaction privacy implications, cross-domain transaction patterns, and the Ledger API interaction model that Canton applications use.
- The output of Phase 1 is a working Sherlock AI instance that can review Daml smart contracts and Canton application code with meaningful, Canton-aware analysis. This is a permanent capability that continues to improve as more Canton codebases are analyzed.

**Phase 2: 25 Ecosystem Project runs ($25,000)**

Sherlock makes 25 AI audit runs available to projects building on Canton. Each run includes:

- A full AI-driven security review of the project's Daml models and any Scala automation code that interacts with them. The AI flags potential vulnerabilities, authorization logic issues, privacy model violations, and integration risks, and it does this in hours rather than weeks.
- Human triage of every finding by security researchers who are familiar with Canton's codebase. This is what keeps the false positive rate below 50% and makes the output actually useful. Someone who understands Daml confirms whether a flagged issue is real, assesses its severity, and provides remediation guidance. The triage team will include researchers who participated in the Canton contest audit (if approved), meaning they've already spent weeks inside Canton's codebase and understand its patterns.
1. A findings report for each project with confirmed issues, severity ratings, and specific remediation steps. Projects get something they can act on immediately rather than raw AI output they need to interpret themselves.
- The Canton Foundation and Tech & Ops Committee can distribute these runs however they see fit: to Featured Applications going through the FAV-C process, to new projects applying to build on Canton, to existing ecosystem participants upgrading their Daml models, or as part of onboarding programs for new builders. Each run costs the ecosystem $1,000 in $CC, which is a fraction of what even a lightweight traditional audit would run, and the 2-hour turnaround means projects aren't blocked waiting for security review.

### 3. Architectural Alignment

The AI customization directly addresses Canton's ecosystem scaling challenge. As more projects build on Canton, the security review bottleneck gets worse because the number of people who can audit Daml isn't growing as fast as the number of projects that need auditing. AI tooling trained on Daml fills that gap by making baseline security review accessible to every project in the ecosystem, not just the ones that can afford a full audit or get lucky with researcher availability.

The run distribution model aligns with the Canton Foundation's role in facilitating ecosystem growth. The Foundation already runs Featured Application evaluation through the FAV-C committee, and AI audit runs can plug directly into that process as a security checkpoint.

If both this proposal and the contest audit are approved, they create a flywheel: the contest produces real Canton vulnerability data that trains the AI, the AI provides ongoing security coverage for ecosystem projects, and the researchers who triage AI findings build deeper Canton expertise over time. Each cycle makes the next one better.

Structured per CIP-0082/CIP-0100 requirements.

### 4. Backward Compatibility

No impact. This is a security tooling and service offering. Nothing gets modified in Canton's core infrastructure.

## Milestones and Deliverables

### Milestone 1: AI Customization for Daml/Canton

- **Estimated Delivery:** 6 to 8 weeks from approval
- **Focus:** Train and validate Sherlock AI on Daml and Canton-specific patterns
- **Deliverables:** Working Sherlock AI instance capable of analyzing Daml smart contracts and Canton application code, validated against known Daml security patterns, documentation of the Canton-specific vulnerability model the AI uses, demo review on a reference Canton application or open-source Daml codebase to demonstrate capability and confirm the sub-50% false positive rate holds for Daml analysis

### Milestone 2: First 10 Ecosystem runs

- **Estimated Delivery:** 4 to 6 weeks after M1
- **Focus:** Run the first batch of project runs, refine based on results
- **Deliverables:** 10 completed AI audit run with human-triaged findings reports delivered to projects, feedback collected from each project on report quality and usefulness, AI model refined based on patterns discovered during runs, tracking of estimated time and cost savings per project compared to traditional audit

### Milestone 3: Remaining 15 runs and Final Report

- **Estimated Delivery:** 6 to 8 weeks after M2
- **Focus:** Complete remaining runs, publish ecosystem findings
- **Deliverables:** 15 additional completed runs with triaged reports, aggregated ecosystem security report (anonymized) highlighting common vulnerability patterns across Canton projects including total vulnerabilities caught, estimated cost savings, and average time to completion, updated Daml security patterns documentation incorporating run findings, recommendations to the Canton Foundation on ongoing AI security coverage

## Acceptance Criteria

The Tech & Ops Committee evaluates completion based on deliverables per milestone, demonstrated AI capability on Daml codebases, completed run reports with meaningful findings, and project feedback on usefulness. The AI must demonstrate Canton-aware analysis (not just generic code review) on a reference codebase before runs begin (M1 gate), triage must be performed by researchers with Canton codebase experience, and the aggregated ecosystem report must be approved by a Canton/Daml domain expert before publication.

## Funding

**Total:** 75,000 USD equivalent in Canton Coin (CC).

- 50,000 for Daml/Canton AI customization (training data preparation, model fine-tuning, validation, Canton-specific vulnerability model development)
- 25,000 for 25 ecosystem project runs (AI compute, researcher triage time, findings reports)

**Milestone breakdown:**

- M1 (AI Customization): 50,000 CC equivalent upon demo validation
- M2 (First 10 runs): 12,500 CC equivalent upon run completion
- M3 (Remaining 15 runs + Report): 12,500 CC equivalent upon completion and publication

**Volatility:** The engagement is estimated at 16 to 22 weeks, well under 6 months. If Committee-requested scope changes push beyond 6 months, remaining milestones get renegotiated to account for USD/CC price movement.

## Co-Marketing

Sherlock and the Canton Foundation will jointly announce the availability of AI audit runs to the Canton ecosystem, which serves as both a security initiative and a builder attraction signal showing that Canton provides real security infrastructure for its projects. Each project that completes a run can optionally be featured in a joint case study, and Sherlock will highlight Canton as the first non-EVM ecosystem with dedicated AI security tooling in its communications. The aggregated ecosystem security report, including total vulnerabilities caught, estimated cost savings across all 25 runs, and average review turnaround time, gets published through both organizations' channels and positions Canton as an ecosystem that takes proactive, scalable security seriously. If both the contest and AI proposals are approved, the combined narrative (open contest to find vulnerabilities and discover talent, followed by AI tooling trained on those findings and triaged by those researchers) is a compelling story for institutional participants evaluating Canton's security posture and for builders deciding where to deploy their applications.

## Motivation

Every project building on Canton needs security review before production, but the current options don't scale. Traditional audits cost tens of thousands of dollars per engagement, take weeks to schedule, and depend on a tiny pool of Daml-capable auditors. As Canton's ecosystem grows, this bottleneck gets worse. AI security tooling customized for Daml and Canton gives every project in the ecosystem access to a meaningful security review at $1,000 per run with a 2-hour turnaround, with human triage to ensure quality. It also creates a growing dataset of Canton-specific vulnerability patterns that makes the AI better over time, which means the ecosystem's security infrastructure improves as it scales rather than falling behind. The estimated $350k in cost savings across the 25 runs, combined with the four-week average acceleration to mainnet per project, means this proposal pays for itself many times over in ecosystem value.

## Rationale

**Why AI?** The security talent pool for Daml is small and won't grow fast enough to keep up with Canton's ecosystem expansion. AI tooling doesn't replace human auditors but it gives every project a baseline security review they can actually access in hours instead of weeks, and it makes human reviewers more effective by surfacing the issues that matter before a researcher even starts looking.

**Why customize instead of using generic tools?** Daml's authorization model, signatory patterns, and rights-and-obligations framework are fundamentally different from EVM or Rust smart contracts. Generic AI security tools would either miss Daml-specific issues entirely or flag irrelevant patterns from other ecosystems, driving up false positive rates and wasting developer time. The $50,000 customization cost is a one-time investment that makes the tooling actually useful for Canton and maintains the sub-50% false positive rate that makes Sherlock AI worth using.

**Why bundle with runs?** Customized AI with no distribution doesn't help the ecosystem. The 25 runs put the tooling to work immediately, generate real-world validation data that improves the model, and give the Canton Foundation a concrete benefit to offer projects building on the network. The human triage layer ensures projects get quality results rather than AI noise.

**Why Sherlock for this?** Sherlock AI is already in production for top protocols including Aave, the Arbitrum ecosystem, Centrifuge and more. It is trained on the largest dataset of verified vulnerability findings in Web3 from years of contest and audit programs. The infrastructure for running AI analysis, managing triage workflows, and delivering findings reports already exists. What needs to be built is the Canton/Daml-specific training layer on top of it, and Sherlock's existing relationship with researchers who have functional programming expertise (including the Lead Senior Watson candidates from the contest proposal) means the human triage component is staffed by people who can actually evaluate Daml findings.
