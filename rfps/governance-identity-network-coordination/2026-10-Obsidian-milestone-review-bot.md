# Milestone Review Bot for the Canton Development Fund

## Development Fund Proposal

**Organization:** Obsidian Systems  
**Author / Primary Contact:** Olaoluwa Mustapha, Obsidian Systems, ola.mustapha@obsidian.systems  
**Status:** Submitted  
**Created:** 2026-10-20  
**Proposal Type:** RFP-aligned proposal  
**RFP / Roadmap Area:** Governance, Identity & Network Coordination: RFP #9, Governance automation  
**Champion:** `Needs Champion`  
**Total Funding Request:** 2,400,000 CC  
**Project Duration:** 17 months. Delivery by month 5, adoption to month 12, maintenance for 12 months after delivery.  
**Label:** onchain-governance  

---

## Abstract

Tech & Ops Committee members check the evidence for every Development Fund milestone by hand before they vote. Obsidian Systems will build an open-source bot that a user starts from a milestone's issue. The bot verifies the evidence and checks the committee's gates, including the champion's endorsement. It reviews the code, architecture and security of the work. It checks every acceptance criterion and posts its conclusions in the milestone's issue.

Obsidian will calibrate the bot on the committee's past decisions and release it under Apache 2.0. It needs no change to Canton, Splice or Daml.

## Specification

### 1. Objective

At the end of this grant, a user can start the bot on any milestone. It posts one report in the milestone's issue and links each source it used.

### 2. Implementation Mechanics

The bot is a GitHub App. Its token can read the fund's repository and post issue comments. It holds no other permission. A user with write access starts or reruns each review with a label or command in the milestone's issue. Each report names that user.

A gate script runs before the AI model sees anything. The committee edits the gate list by pull request. The first gates check the champion's endorsement, an open vote and unmerged dependencies.

The bot then checks that each evidence link shows what the team claims. Separately, it checks every acceptance criterion in the approved proposal against the delivered work. It marks each one met, not met or needs human follow-up.

From Milestone 2 the bot also builds, tests and runs the delivered code in an isolated test environment. It compares the delivered structure with the approved design. Its security review starts with Daml authorization through signatories and controllers, observers and divulgence, secret handling and dependency versions. Other languages follow. Each finding cites a file and line.

Every finding quotes and links its evidence. The report never recommends approval. Text hidden in a team's evidence or code can steer the bot's findings. The bot cannot vote, approve or pay.

Obsidian will calibrate the bot on past milestone decisions. It will hold out 20 at random as an eval. It draws them separately from accepted and sent-back milestones. On each past milestone, the bot sees the issue only up to the team's delivery comment. The eval reports agreement per criterion and the share of sent-back milestones the bot catches. It reruns on every change to the bot's instructions or model. Obsidian merges no change that lowers agreement beyond the tolerance in the Milestone 1 design note. Users with write access mark a wrong finding with a command in the issue. Those marks feed the next calibration and never the held-out 20.

### 3. Architectural Alignment

[RFP #9](https://github.com/canton-foundation/canton-dev-fund/blob/main/2026-2028-strategic-roadmap.md) names "proposal lifecycle tracking" and "automation of repeatable governance workflows" as focus areas. Milestone review is one such workflow. The bot's gates check the champion requirement in the fund's review process.

### 4. Backward Compatibility

No backward compatibility impact. Smart Contract Upgrade does not apply because the bot creates no Daml contracts.

## Milestones and Deliverables

Deadlines count from grant approval.

| Milestone | Deadline | Done when |
|---|---|---|
| 1. Report Bot | Month 2 | The bot reports on another team's real milestone. A reviewer says in the issue what it got right and wrong. |
| 2. Build and Review | Month 5 | The bot builds and runs another team's milestone code. A reviewer says in the issue what it got right and wrong. |
| 3. Adoption | Months 2 to 12 | Reviewers mark the bot's reports useful on other teams' milestones. |
| 4. Maintenance | 12 months from Milestone 2 | Obsidian publishes a maintenance note each quarter. |

A reviewer is a committee member outside Obsidian or the milestone's champion. The Milestone 1 repository holds the bot, its instructions, the gate list and the calibration result. A design note chooses the agent framework, Flue or a custom harness. Another team's milestone may not reach review within 30 days of installation. A user then starts the bot on a past milestone the committee names, and that run counts.

Each Milestone 2 run gets a fresh Nix-built Docker container, isolated under gVisor and deleted afterward. It holds no keys, has no route to any other network, and reaches only approved package sources. Each run has a time limit and a cost limit. The bot follows the team's build, test and demo steps and links the logs.

A Milestone 3 report qualifies when the bot posts it on a real milestone from a team other than Obsidian. A reviewer must say in the issue that the report was useful. Each milestone counts once.

Maintenance covers defect fixes, outside contributions and updates for Canton, Daml and model changes. Each update reruns the held-out test. Each quarterly note links its pull requests. The committee decides on renewal by month 17. Obsidian transfers the repository to the Foundation's GitHub organization if the committee does not renew.

## Acceptance Criteria

The Tech & Ops Committee accepts each milestone against the criteria above.

## Funding

**Total Funding Request:** 2,400,000 CC

| Milestone | Deadline | CC | Paid upon |
|---|---|---|---|
| 1. Report Bot | Month 2 | 550,000 CC | Committee acceptance |
| 2. Build and Review | Month 5 | 550,000 CC | Committee acceptance |
| 3. Adoption | Months 2 to 12 | up to 700,000 CC | 20,000 CC per qualifying report, up to 30, plus 100,000 CC at the 30th |
| 4. Maintenance | 12 months from Milestone 2 | 600,000 CC | 150,000 CC per quarter |
| Total |  | 2,400,000 CC |  |

### Volatility Stipulation

The project duration is greater than 6 months. The grant is denominated in fixed Canton Coin. Obsidian may request a re-evaluation of the remaining milestones at month 9. The trigger is a CC price more than 25 percent above or below its price at approval. The Tech & Ops Committee runs the re-evaluation.

## Co-Marketing

At release, Obsidian will announce the bot with the Foundation, publish a technical post and demonstrate it to the committee.

## Motivation

On 19 October 2026 the fund's repository held 77 closed and 185 open [milestone issues](https://github.com/canton-foundation/canton-dev-fund/issues?q=is%3Aissue+milestone+in%3Atitle). On 14 October 2026 Obsidian had an AI model read the evidence of three past milestones. Reading alone could not settle 7 of their 28 acceptance criteria. Four of those 7 needed the code built or run. From installation, a user can start the bot on any milestone. Every funded team and committee member benefits.

## Rationale

The bot extends the fund's GitHub process. The user named in each report answers for it under the fund's [AI policy](https://github.com/canton-foundation/canton-dev-fund/blob/main/AI_POLICY.md). General AI code-review services review pull requests. They do not check a milestone against its approved proposal or calibrate on the committee's decisions. Neither RFP #9 prior example reviews milestones. They are Avro's SV Governance dApp ([PR #223](https://github.com/canton-foundation/canton-dev-fund/pull/223)) and Obsidian's [CIP-0105 design grant](https://github.com/canton-foundation/canton-dev-fund/blob/main/proposals/2026-04-Obsidian-CIP-0105.md).

## Constraints, Limitations and Out of Scope

Each report is marked as the bot's automated output. The bot does not vote, approve or pay. The Tech & Ops Committee reviews and votes on every milestone. The review does not replace a security audit.

The bot reads public links. It marks criteria that need private Canton data, a private repository or Canton TestNet for a person to check. It uses one model provider.

Foundation staff own the installation. Obsidian's milestones take the same path as every other team's. Changes to the bot's instructions go through public pull requests.

Obsidian pays the model provider from the grant. Obsidian hosts the test environment. Builds or monthly runs above the limits in the Milestone 1 design note trigger a re-scope with the committee. So does a change in the model provider's price or terms.
