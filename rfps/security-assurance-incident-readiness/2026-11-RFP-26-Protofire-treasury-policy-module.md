# Treasury Policy Module: Open-Source Daml Multisig with Signing Policies

## Development Fund Proposal

**Organization:** Protofire
**Author / Primary Contact:** Federico Ledesma (federico.ledesma@protofire.io), Luis Medeiros (luis.medeiros@protofire.io)
**Status:** Submitted
**Created:** 2026-11-27
**Proposal Type:** RFP-aligned
**RFP / Roadmap Area:** RFP 26, Key Management and Signing Controls (Security, Assurance & Incident Readiness)
**Champion:** Needs Champion
**Total Funding Request:** 252,000 CC
**Project Duration:** About 7 weeks from approval
**Label:** attestor-pools-daos-multisig

## Abstract

Canton has strong building blocks for shared control (decentralized parties, multi-hosting, external signing), but we have not found a reusable, open policy layer for shared assets. Treasuries, funds and DAOs on the network rely on custodians' off-chain approval rules or write their own approval logic. Protofire proposes an open-source Daml-native multisig (Apache-2.0) with private voting, external signing and a guard hook that lets any attached module block a transaction. This proposal funds the full build: the base multisig, a treasury policy module that uses that hook for the signing controls institutions expect (spend limits, allow-lists, time locks, role separation, emergency pause and recovery), and the open-source tooling teams need to adopt it: human-readable proposal rendering, a CLI, a reference UI, a read API, documentation, and a published internal security review.

## Specification

### 1. Objective

Give any Canton party that holds shared assets a reusable, auditable way to enforce multi-party approval and signing policies on chain, without depending on a custodian's off-chain policy engine and without each team writing its own approval logic.

### 2. Implementation Mechanics

The base multisig will be a Daml Safe that holds assets under a shared party and acts only once a threshold of its owners approves a proposal. The threshold and the guards are enforced in Daml, so they only bind if no single operator can act alone as the shared party. The hosting guide (see Tooling) states the trust assumptions of each supported setup. The base multisig will provide:

* Owners and threshold: an owner list with a configurable approval threshold.
* Proposals: tracked with a counter, expiry and replay protection.
* External signing: owners approve with Canton's native external signing; they sign the transaction with their own keys, and any authorized node can submit it and pay the traffic fees.
* Batch and admin actions: multiple actions per proposal, plus owner, threshold and module management.
* CIP-0056 transfers: a Token Standard transfer action.
* Private voting: each owner sees only their own vote, with an optional viewer party. The nodes hosting the shared party see the votes so the threshold can be checked; the hosting guide covers this trade-off.
* Guard interface: any attached module can block execution.

#### Policy modules

Guards built on the base multisig's Guard interface, each one a separate Daml template so teams attach only what they need:

* Spend limits: per period and per asset, evaluated against the CIP-0056 transfer action.
* Allow-lists and deny-lists: for counterparties and instruments.
* Time locks and cooling periods: a minimum delay between approval and execution, configurable per action type (for example, longer delays for owner or threshold changes).
* Role separation: distinct proposer, approver and executor roles, so the party that initiates a transfer cannot also complete it.
* Emergency pause: a designated set of parties can freeze execution.
* Recovery: a separate recovery quorum can rotate owners after a key loss.
* Policy object: a single contract describing the active policy set, readable by an auditor or supervisor party through Canton's visibility model without exposing votes or signatures to other owners.

#### Tooling

* Human-readable proposal rendering: a library that decodes a pending proposal (action, amounts, counterparties, policy checks passed or failed) into plain text before an owner signs.
* Read API: proposal history, policy state and execution events per multisig, for UIs and reporting, built on Canton's Participant Query Store (PQS). Each operator runs it against its own node and it returns only what the parties on that node can see. Protofire does not host it.
* CLI: create multisigs, proposals, approvals, executions and configuration changes (owners, threshold, policies) as unsigned transaction files. Owners sign them with the tool of their choice, and the CLI submits the signed result. The CLI never holds private keys.
* Reference web UI: create a multisig, attach policies, propose, review and sign. It is a reference implementation for wallets and apps to copy, not a hosted product.
* Documentation: integration guide, policy cookbook, a threat model covering key loss, collusion below threshold, guard bypass and visibility leaks, and the supported hosting setups for the multisig party (for example, multi-hosted with a confirmation threshold) with the trust assumptions of each.
* Security review: a review of the base contracts and the policy module by Protofire's internal security team, with the report published.

All code will be released under Apache-2.0.

### 3. Architectural Alignment

* [RFP 26](https://github.com/canton-foundation/canton-dev-fund/blob/main/2026-2028-strategic-roadmap.md#L256-L258). The RFP asks for signing policies, multi-party approval, segregation of duties, recovery and human-readable transaction verification across institutional, hosted and self-operated setups. The guards and the rendering library cover those items. Custody of individual signer keys, HSMs and signer key rotation are out of scope.
* [CIP-0056](https://github.com/canton-foundation/cips/blob/main/cip-0056/cip-0056.md). Transfers go through the Token Standard, so policies apply to any compliant asset.
* [CIP-0103](https://github.com/canton-foundation/cips/blob/main/cip-0103/cip-0103.md) and wallet issue [#2597](https://github.com/canton-network/wallet/issues/2597). Owners use external signing, so the same contract can later be driven by CIP-0103 wallets, by custodians through the Wallet Gateway, or by software agents. Wallet integration is deliberately out of scope here and will be proposed separately under RFP 14.
* Canton privacy model. Owners see proposals but not each other's votes, and observer rights are granted explicitly to auditor parties.

### 4. Backward Compatibility

No backward compatibility impact. The policy module is additive: multisigs deployed without guards keep working unchanged.

## Milestones and Deliverables

Dates are counted from proposal approval, and each milestone is due by the end of the week stated. TestNet and MainNet milestones assume validator access. Approval typically takes 2 to 3 weeks plus up to a week for IP allowlisting, so Protofire requests it at filing, in parallel with the review, and development runs on LocalNet in the meantime. If access is still pending at a network milestone, that milestone's date moves by the same number of days and nothing else changes.

### Milestone 1: Discovery and Base Multisig

* **Committed Date:** Week 1 after approval
* **Focus:**
  * Discovery: requirements and privacy design.
  * Core interfaces: actions and guards.
  * Base multisig: owners and threshold, proposals with expiry and replay protection, external signing, batch and admin actions, CIP-0056 transfer action and private voting.
* **Deliverables / Value Metrics:**
  * Base multisig merged to the public repository with tests, including per-party visibility tests.
  * Value metric: a developer outside the project team, or one nominated by the committee, creates a 2-of-3 multisig and executes a CIP-0056 transfer from it using only the README, without help from Protofire.

### Milestone 2: Policy Module Core

* **Committed Date:** Week 3 after approval
* **Focus:**
  * All policy modules listed above: spend limits, allow-lists and deny-lists, time locks and cooling periods, role separation, emergency pause, recovery, and the policy object with auditor visibility.
  * Reference web UI design.
* **Deliverables / Value Metrics:**
  * Guards merged to the public repository with tests, including per-party visibility tests across nodes.
  * Deployed and tested on TestNet.
  * Reference web UI design completed.
  * Value metric: a developer outside the project team, or one nominated by the committee, attaches a spend limit and a time lock to a multisig on TestNet and sees a non-compliant transfer blocked, using only the README.

### Milestone 3: Adoption Tooling

* **Committed Date:** Week 5 after approval
* **Focus:**
  * Human-readable proposal rendering.
  * CLI for creating and managing multisigs (owners, threshold, policies), and for creating, signing and submitting their transactions.
  * Read API.
  * Reference web UI.
* **Deliverables / Value Metrics:**
  * Tooling released as open source.
  * End-to-end demo on TestNet.
  * Reference web UI deployed for showcase (temporary, not a hosted product).
  * Value metric: a developer outside the project team, or one nominated by the committee, creates a multisig, proposes, signs with their own signer and executes on TestNet, through both the CLI and the web UI, using only the published docs.

### Milestone 4: Security Review and MainNet Release

* **Committed Date:** Week 7 after approval
* **Focus:**
  * Security review of the base multisig and the policy module.
  * Fixing any security issues found.
  * Threat model.
  * Documentation: integration guide, policy cookbook, hosting setups and reference docs.
  * MainNet release: DARs published with package IDs, and a reference policy-governed multisig running on MainNet.
* **Deliverables / Value Metrics:**
  * Published security review report with all critical and high findings resolved.
  * MainNet release: DARs published with package IDs, and a reference policy-governed multisig running on MainNet.
  * Documentation published: integration guide, policy cookbook and hosting setups.
  * Value metric: a team outside Protofire, or one nominated by the committee, creates a policy-governed multisig on MainNet using only the integration guide and policy cookbook. If no outside team with MainNet access is available by week 7, the committee can accept the same run on TestNet plus Protofire's own MainNet run, and the first MainNet adopter is reported when it happens.

## Acceptance Criteria

The Tech & Ops Committee will evaluate each milestone on:

* Value metric met and reproducible: a developer not on the project team reproduces the milestone result using only the published docs and repositories (Apache-2.0), without help from Protofire beyond access to a TestNet node if they do not have one. Evidence (run log or recording) is posted in the milestone issue. The committee can nominate the developer if it prefers.
* Deliverables completed as specified for the milestone, publicly verifiable in the open-source repositories and published documentation.
* Working on network: functionality demonstrated on TestNet (and MainNet for Milestone 4), including per-party privacy across nodes.
* Security (Milestone 4): security review report published with no open critical or high findings.

At each milestone we will also report which external teams are testing or integrating the module. Adoption is how we expect to be judged after delivery: 3 and 6 months after Milestone 4 we will publish an adoption report (external teams running or integrating the module, MainNet multisigs they agree to disclose, outside issues and contributions). Payment is not tied to it.

## Funding

**Total Funding Request:** 252,000 CC

The request is based on 320 hours of work (one full-time engineer for 7 weeks, plus one week of UI/UX design during Milestone 2) at USD 60/hour, converted at CC = USD 0.0762 (CoinGecko, 2026-11-27) and rounded to the nearest 500 CC per milestone.

### Payment Breakdown by Milestone

* Milestone 1 (Discovery and Base Multisig, 40 hours): 31,500 CC upon committee acceptance
* Milestone 2 (Policy Module Core, 120 hours including design): 94,500 CC upon committee acceptance
* Milestone 3 (Adoption Tooling, 80 hours): 63,000 CC upon committee acceptance
* Milestone 4 (Security Review and MainNet Release, 80 hours): 63,000 CC upon final release and committee acceptance

### Volatility Stipulation

The project is expected to take under 6 months. If committee-requested scope changes extend it beyond 6 months, the remaining milestones will be renegotiated to account for USD/CC volatility.

## Co-Marketing

* Coordinate the MainNet release announcement with the Canton Foundation.
* Publish a technical blog post on applying Canton's privacy model to treasury governance, aimed at builders arriving from EVM ecosystems.
* Write a case study with the first MainNet adopter, if they agree.
* Present the module in the DAOs & MultiSig SIG and at a Canton community call.

## Motivation

Every DAO, fund, treasury and agent application that holds shared assets on Canton needs multi-party approval and spending controls first. Today each team writes its own approval logic or relies on a custodian's off-chain policy engine. That is duplicated work and hard to audit. Institutions coming to Canton expect the controls they already use elsewhere (limits, segregation of duties, recovery), and they need an auditor to be able to check them.

EVM shows what happens when this exists as open infrastructure. Safe smart accounts hold $57.6B, including DeFi positions, across 65.7M accounts on 400+ chains ([Safe Q3 2026 report](https://safefoundation.org/reports/q3-2026)). Circle's Arc launched with Safe smart accounts from day one, and Robinhood Chain went live with them in July 2026. Shared custody became a standard layer instead of something every team rebuilds.

Canton already has the base pieces: decentralized parties, multi-hosting, external signing, BitSafe's Decentralization Manager for m-of-n control of a decentralized party, and wallets such as Diviko that offer M-of-N threshold vaults. What we have not found is an open policy layer on top of them: per-action rules such as spend limits, allow-lists, time locks and role separation, in a form an auditor can read.

Who benefits: any Canton application that holds assets for more than one party, including DAO and foundation treasuries, funds, payment and settlement apps, and agent workflows. Institutions that run their own treasury on Canton get a shared, open and reviewed set of controls instead of custom approval logic.

Protofire has deployed and operated Safe on 120+ EVM networks, and we know its guard and module patterns from running them in production. This proposal brings those patterns to Canton and adds what Safe on public chains does not give by default: owners cannot see each other's votes, and an auditor can be given read access to the policy without opening it to everyone.

## Rationale

**Why a new base multisig.** Guards need a hook that runs on every execution, and we have not found an open Daml multisig that exposes one. During Milestone 1 discovery we will check with BitSafe whether the same guards can attach to the Decentralization Manager, and publish the answer. The module sits on top of Canton's existing shared-control primitives and does not replace any of them.

**Contract-level policies alongside party-level decentralization.** Decentralized parties and multi-hosting answer who controls a party. They do not express per-action rules such as "transfers above X need a 24-hour delay and a different executor" or "this counterparty is blocked". The policy module works at that level and can sit on top of a decentralized party. We see it as complementary to existing work in this area, including BitSafe's Decentralization Manager, whose Generalized Governance Core and Custody Daml template already cover propose, confirm and execute voting for a decentralized party. The base multisig here overlaps with that flow only as far as the guard hook requires (see "Why a new base multisig"). What this proposal adds is per-action policy guards, private voting among owners and external signing by owners. The scope was shared with the DAOs & MultiSig SIG for feedback before filing ([forum thread](https://forum.canton.network/t/feedback-wanted-treasury-policy-module-open-source-daml-multisig-with-signing-policies-rfp-26/9550)).

**Modular guards.** Separate guard templates keep each policy small and auditable, and let teams adopt only what they need.

**Security.** The security review in Milestone 4 is performed by Protofire's internal security team and published in full. We are open to an independent audit, proposed separately under RFP 21 (Independent security assessments), and to third-party formal verification, subject to tooling support for Daml.

**Maintenance.** Protofire will maintain the repositories (bug fixes, compatibility with new Canton and Daml SDK releases, and issue triage) for 6 months after the final milestone, renewable.

**What comes next.** Wallet integration and agent mandates depend on this policy layer. Wallet integration will be proposed separately under RFP 14 once this proposal is in review.
