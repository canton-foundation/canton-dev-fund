# Milestone Review Bot for the Canton Development Fund

## Development Fund Proposal

**Organization:** Obsidian Systems and FTP  
**Author / Primary Contact:** Olaoluwa Mustapha, Obsidian Systems, ola.mustapha@obsidian.systems; Daniel Hansley, FTP  
**Status:** Submitted  
**Created:** 2026-10-20  
**Proposal Type:** RFP-aligned proposal  
**RFP / Roadmap Area:** Governance, Identity & Network Coordination: RFP #9, Governance automation  
**Champion:** Shaul Kfir, Digital Asset ([@shaul-da](https://github.com/shaul-da))  
**Total Funding Request:** 2,400,000 CC  
**Project Duration:** 12 months. Delivery by month 5, adoption to month 12. Maintenance from Milestone 2 is a separate quarterly grant.  
**Label:** onchain-governance  

---

## Abstract

Foundation reviewers and Tech & Ops Committee members check the evidence for every Development Fund milestone by hand before the committee votes. Obsidian Systems and FTP will build an open-source bot that runs when a team posts its delivery report, or when a user starts it from a milestone’s issue. The bot checks the committee's gates, including the champion's endorsement, and then checks that the evidence is complete. It builds, tests and runs the delivered code in an isolated container with a LocalNet. It reviews the code, architecture and security of the work. It checks every acceptance criterion and gives the reviewer a heads-up where a criterion needs a quality call. A separate job without model access re-checks every source the bot cites, then posts the conclusions in the milestone's issue. The bot keeps the milestone's status on the fund's board current.

Obsidian and FTP will calibrate the bot on past milestone reviews and release it under Apache 2.0. It needs no change to Canton, Splice or Daml. This proposal combines FTP's [PR #912](https://github.com/canton-foundation/canton-dev-fund/pull/912) and Obsidian's [PR #917](https://github.com/canton-foundation/canton-dev-fund/pull/917).

## Specification

### 1. Objective

At the end of this grant, the bot reviews every milestone when its delivery report is posted. A listed reviewer can also start it on any milestone. It posts one report in the milestone's issue, links each source it used and keeps the milestone's status on the board current.

### 2. Implementation Mechanics

The bot is a GitHub App. Its token can read the fund's repository, post issue comments and update project boards in the Foundation's GitHub organization. It holds no other permission. On project boards the bot changes only the Status field of the Dev Fund Milestones board. A review starts when the grantee or a listed reviewer posts or edits a delivery report. A daily pass catches any report the bot missed and skips unchanged ones. A listed reviewer or the grantee can start or rerun a review with a label or command in the milestone’s issue. A report started this way names that user. The grantee gets three runs a day, report edits included. Listed reviewers are SIG members and Canton Foundation or Digital Asset staff, on a list in the fund's repository. No job holds both model access and write access. A separate job without model access re-checks every cited source, then posts.

A gate script runs before the AI model sees anything. The committee edits the gate list by pull request. The first gates check the champion's endorsement, an open vote and unmerged dependencies. Gates report their result in the review and do not stop it.

Scripts also check links, files, license, CI, package versions and whether the README's settings match the code. The bot then checks that the evidence is complete. The delivery report should name the delivered version, give evidence for each acceptance criterion and include what reviewers usually ask for on this kind of milestone. The evidence checklist of what reviewers ask for is built from their comments on past milestones and kept current. If the evidence falls short, the bot posts what is missing and goes no further until the report changes or a listed reviewer reruns the review. When a criterion likely needs someone's sign-off, the bot tags the champion or the relevant core contributors from the tagging list in the fund's repository. It tags at most three people.

Next the bot checks that each evidence link shows what the team claims. Separately, it checks every acceptance criterion in the approved proposal against the delivered work. It marks each one met, partly met, not met or can't verify, with a one-line reason. A criterion that needs a quality call, such as how clear the docs are, gets no verdict. The bot gives the reviewer a heads-up instead, with what it checked and what it found. Every fact behind a verdict or a heads-up has a location, such as file lines, a registry entry, a test-log line or a Scan record. The posting job opens each location itself and drops any fact it cannot confirm. A met verdict needs at least one fact the bot read or ran itself, not only the team's own words. A second pass tries to disprove each verdict, and a verdict it cannot confirm becomes can't verify.

The bot also builds, tests and runs the delivered code in an isolated test environment. Steps that need a node run there against a LocalNet with test parties.

From Milestone 2 a headless browser in the same environment goes through the web UI steps the delivery describes and keeps screenshots. A linked public web UI is opened from outside the test environment. The bot compares the delivered structure with the approved design. It also checks how the work fits existing Canton tooling, such as the official SDKs, the token standard, Ledger API versions and Daml package upgrades. Its security review starts with Daml authorization through signatories and controllers, observers and divulgence, secret handling and dependency versions. Other languages follow. Each finding is rated critical, high, medium or low and cites a file and line.

Every finding quotes and links its evidence. The report never recommends approval. Text hidden in a team’s evidence or code can steer the bot’s findings. The posting job removes any link that is not a confirmed source and any tag of someone other than the milestone's champion or a person on the tagging list. The bot cannot vote, approve or pay.

The teams will calibrate the bot on the problems reviewers raised in past milestone reviews. They will hold out 20 past milestones at random as an eval. They draw them separately from accepted and sent-back milestones, by a method published at grant start. They leave out both teams' milestones and any milestone the bot's notes or the evidence checklist already use. Later updates to the notes and the checklist never use the held-out 20. On each past milestone, the bot sees the issue only up to the team’s delivery comment. The eval reports agreement per criterion and the share of sent-back milestones the bot catches. It reruns on every change to the bot's instructions or model. The teams merge no change that lowers agreement beyond the tolerance in the Milestone 1 design note. Anyone can mark a wrong verdict or finding with a command in the issue, and the teams answer every mark. Marks by listed reviewers count toward Milestone 3. Those marks feed the next calibration and never the held-out 20.

### 3. Architectural Alignment

[RFP #9](https://github.com/canton-foundation/canton-dev-fund/blob/main/2026-2028-strategic-roadmap.md) names "proposal lifecycle tracking" and "automation of repeatable governance workflows" as focus areas. Milestone review is one such workflow. The bot's gates check the champion requirement in the fund’s review process. The bot also fills in the Status field of the existing Dev Fund Milestones board, which is set by hand today. It never moves a milestone into Ready for Vote or a later column, and leaves the fund's other workflows unchanged.

### 4. Backward Compatibility

No backward compatibility impact. Smart Contract Upgrade does not apply because the bot creates no Daml contracts.

## Milestones and Deliverables

Deadlines count from grant approval.

The Foundation pays each team its agreed share of each milestone directly.

| Milestone | Deadline | Done when |
|---|---|---|
| 1. Report Bot on LocalNet | Month 3 | Requirements from committee members are gathered and published. The bot runs on every new delivery report, checks evidence and gates, posts its verdicts and heads-ups, and sets board statuses. It builds, tests and runs the delivered code in the test environment, with a LocalNet for steps that need a node. The Security SIG has reviewed the workflow. The bot reports on another team's real milestone. A reviewer says in the issue what it got right and wrong. On this milestone's own delivery and on at least 10 milestones from other grants outside the held-out 20, a grader the committee names from outside both teams finds at least 85% of evidence checks and verdicts correct. At least 3 of the milestones from other grants need a LocalNet, and the bot runs their LocalNet steps itself. |
| 2. Code and UI Review | Month 5 | The bot goes through another team's web UI steps in a headless browser. It posts its code, architecture and security review. A reviewer says in the issue what it got right and wrong. The bot runs twice on this milestone's own delivery and on at least 20 new deliveries from other grants outside the held-out 20. The grader finds at least 90% of the first run's evidence checks and verdicts correct. Findings and how often the two runs agree are reported separately. |
| 3. Adoption | Months 3 to 12 | Reviewers mark the bot's reports useful on other teams' milestones. The bot also reviews this milestone's own delivery. |

A reviewer is a committee member, Foundation reviewer or the milestone's champion, from outside Obsidian and FTP. The Milestone 1 repository holds the bot, its instructions, the gate list, the evidence checklist and the calibration result. A design note chooses the agent framework, such as FTP's existing review harness, Flue or a custom harness. Another team's milestone may not reach review within 30 days of installation. A listed reviewer then starts the bot on a past milestone the committee names, and that run counts. In each measurement the grader records their own verdict first. Can't verify counts as correct only where the bot could not have checked. A heads-up counts as correct only where the criterion needs a quality call. Measurement runs check every criterion even when the evidence check fails.

From Milestone 1, each run gets a fresh Nix-built Docker container, isolated under gVisor and deleted afterward. It holds no keys, has no route to any other network, and reaches only approved package sources. Each run has a time limit and a cost limit. The bot follows the team's build, test and demo steps and links the logs.

A Milestone 3 report qualifies when the bot posts it on a real milestone from a team other than Obsidian or FTP. That milestone must then go to a vote. A reviewer must say in the issue that the report was useful. Listed reviewers must mark fewer than 20% of its verdicts and findings wrong. Each milestone counts once.

Maintenance from Milestone 2 is a separate quarterly grant, subject to committee review. It pays for running the bot on every delivery, including the model usage and the test environment. It also covers defect fixes, outside contributions, replies to verdicts and findings marked wrong, the evidence checklist and updates for Canton, Splice, Daml and model changes. Each update reruns the held-out test. Each quarterly note links its pull requests. The repository sits in the Foundation's GitHub organization from the start, and both teams maintain it.

## Acceptance Criteria

The Tech & Ops Committee accepts each milestone against the criteria above. The bot reviews every milestone of this grant itself, using what has been delivered up to that point, and the grader checks that report with the rest. Acceptance depends on it and on the reports for other grants.

## Funding

**Total Funding Request:** 2,400,000 CC

| Milestone | Deadline | CC | Paid upon |
|---|---|---|---|
| 1. Report Bot on LocalNet | Month 3 | 700,000 CC | Committee acceptance |
| 2. Code and UI Review | Month 5 | 700,000 CC | Committee acceptance |
| 3. Adoption | Months 3 to 12 | up to 1,000,000 CC | 10,000 CC per qualifying report, up to 100 |
| Total |  | 2,400,000 CC |  |

Maintenance from Milestone 2 is a separate quarterly grant of 300,000 CC a quarter, outside the 2,400,000 CC, paid when the committee accepts that quarter's note.

### Volatility Stipulation

The project duration is greater than 6 months. The grant is denominated in fixed Canton Coin. Obsidian and FTP may request a re-evaluation of the remaining milestones at month 9. The trigger is a CC price more than 25 percent above or below its price at approval. The Tech & Ops Committee runs the re-evaluation.

## Co-Marketing

At release, Obsidian and FTP will announce the bot with the Foundation, publish a technical post and demonstrate it to the committee.

## Motivation

On 19 October 2026 the fund's repository held 77 closed and 185 open [milestone issues](https://github.com/canton-foundation/canton-dev-fund/issues?q=is%3Aissue+milestone+in%3Atitle). From June to September 2026 reviewers received 14 to 23 deliveries a month. On 14 October 2026 Obsidian had an AI model read the evidence of three past milestones. Reading alone could not settle 7 of their 28 acceptance criteria. Four of those 7 needed the code built or run. From installation, the bot reviews every new delivery, and a listed reviewer can start it on any milestone. Every funded team and committee member benefits.

## Rationale

The bot extends the fund's GitHub process. It posts under its own account as an automated reviewer and decides nothing. Obsidian and FTP answer for it as maintainers, and the reviewers who vote stay responsible for acceptance. The teams will ask the Foundation to confirm how the fund’s [AI policy](https://github.com/canton-foundation/canton-dev-fund/blob/main/AI_POLICY.md) applies to the bot's account. General AI code-review services review pull requests. They do not check a milestone against its approved proposal or calibrate on past milestone reviews. Neither RFP #9 prior example reviews milestones. They are Avro's SV Governance dApp ([PR #223](https://github.com/canton-foundation/canton-dev-fund/pull/223)) and Obsidian's [CIP-0105 design grant](https://github.com/canton-foundation/canton-dev-fund/blob/main/proposals/2026-04-Obsidian-CIP-0105.md).

## Constraints, Limitations and Out of Scope

Each report is marked as the bot's automated output. It says that it may contain mistakes and that the reviewers remain responsible for acceptance. The bot does not vote, approve or pay. The Tech & Ops Committee reviews and votes on every milestone. The review does not replace an independent audit.

The bot reads public links. It marks criteria that need private Canton data, a private repository or Canton TestNet as can't verify. It does not assess usage or affiliation and quotes the report line that states them. It uses one model provider.

Foundation staff own the installation and the GitHub App. Obsidian's and FTP's milestones take the same path as every other team's. Apart from the bot's review of this grant's own milestones, neither team's milestones count toward any measurement or payment, and neither do runs started by either team's staff. Changes to the bot's instructions go through public pull requests.

Ali Abrar of Obsidian is a voting member of the Tech & Ops Committee. Ali will not vote on this grant, its milestones or changes to the bot's instructions. FTP is a Development Fund grantee. The champion and the grader of every measurement come from outside both teams.

Obsidian and FTP pay the model provider from the grant, with a cost limit on each run. Obsidian hosts the test environment. Builds or monthly runs above the limits in the Milestone 1 design note trigger a re-scope with the committee. So does a change in the model provider's price or terms.
