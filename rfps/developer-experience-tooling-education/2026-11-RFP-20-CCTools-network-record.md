# CCTools Network Record: a public daily record of Canton activity, network-wide and per application

## Development Fund Proposal

**Organization:** CCTools  
**Author / Primary Contact:** João Matheus (Scoutr), GitHub `0xScoutr`  
**Status:** Submitted  
**Created:** 2026-11-09  
**Proposal Type:** RFP-aligned  
**RFP / Roadmap Area:** RFP 20 (rfp-20), Indexers: network-wide and application-level visibility. Developer Experience, Tooling & Education.  
**Champion:** `Needs Champion`  
**Total Funding Request:** US$200,000, converted to CC at approval (about 2,635,000 CC at the five-day mean of US$0.0759 to 2026-11-26; 2,222,222 CC at the US$0.090 sizing price). US$39,600 is for work already built. US$95,400, including half of Milestone 1, pays only on verified outside use.  
**Project Duration:** 15 months  
**Label:** tokenomics  

---

## Abstract

In the 30 days to 2026-11-22, featured applications were allotted between 51.7% and 58.9% of each day's scheduled Canton Coin issuance, yet explorers show what each earned over windows of 30 or 31 days, and longer histories sit behind paid keys. We know of no keyless, licensed daily file of what each application earned and was credited with, and no open, reconciled series of the network's burn on traffic.

CCTools already publishes the network half: one row per UTC day since 2026-03-26 (Milestone 2 extends its round and snapshot series back to 2024-06-26), keyless, CC BY 4.0, with the source of every value, gap reasons, revisions and a public verifier.

This proposal pays for that work and funds the per-application half: rewards, attributed traffic and transactions per featured application, and traffic purchases per node with the network's traffic burn, reconciled per round, checked across Super Validator operators and maintained for 12 months.

---

## Specification

### 1. Objective

A public daily record of Canton activity, network-wide and per application.

It is one outcome: the per-application reward series split the network's featured-app issuance by application, and one per-round reconciliation checks both. For every day from 2026-06-12, the first day Scan serves CIP-0104 activity records, the files say what each featured application earned, how much traffic was attributed to it and how much CC the network burned on traffic. Every value names its source and method, is checked against round totals wherever Scan states one, and survives Scan's pruning.

**Non-goals:** a query engine, a dashboard or CCTools' own pages; per-user activity profiles beyond what Scan publishes; volume, users or TVL per application; applications without a featured-app right; per-application history before June 2026.

### 2. Implementation Mechanics

#### 2.1 Delivered: the network record (Milestone 1, retroactive)

**The record.** 243 final days, 2026-03-26 to 2026-11-23, in 20 series: eight round and snapshot series (rounds, the Super Validators' voted reference price, Super Validators and their voting threshold, featured-app rights and validator licenses) from 2026-03-26; supply from 2026-09-02; issuance by category and reward coupons from 2026-10-01. The issuance and coupon days before 2026-10-01 were filled from the `StartIssuing` exercises captured from Scan's update history, published as 1,860 revisions on 2026-11-24. On that day 351 of the 4,860 values (7%) were empty, each with a reason, mostly supply before 2026-09-02, and every series was filled on every day since 2026-10-01. CCTools has also captured the network's daily ACS state for every day from 2024-06-26; Milestone 2 brings those days into the record.

Files: [daily.csv](https://api.cctools.network/api/open/network-record/v1/daily.csv) and [daily.json](https://api.cctools.network/api/open/network-record/v1/daily.json), one row per day; [values.csv](https://api.cctools.network/api/open/network-record/v1/values.csv) and [days/2026-11-12.json](https://api.cctools.network/api/open/network-record/v1/days/2026-11-12.json), each value with its host and method; [gaps.csv](https://api.cctools.network/api/open/network-record/v1/gaps.csv); [revisions.csv](https://api.cctools.network/api/open/network-record/v1/revisions.csv); [methodology.json](https://api.cctools.network/api/open/network-record/v1/methodology.json), [datapackage.json](https://api.cctools.network/api/open/network-record/v1/datapackage.json) and [status.json](https://api.cctools.network/api/open/network-record/v1/status.json), with freshness and sha256.

**How a day is made.** Collectors capture each round's `StartIssuing` exercise every five minutes and the supply every 15 minutes. A value that fails a sanity gate is held, and a final value changes only through a logged revision. Since 2026-11-07 the record reads Super Validators' Scans first, with an automatic fallback to the public proxy `api.cantonnodes.com`. Every value names the host that served it, so a day that needed the fallback says so.

**The verifier.** `verify` checks each file against its sha256, re-renders it and re-derives every series except supply from Scan with the collector's own code; on 2026-11-06 it re-derived 2026-11-04 through the public proxy with 18 series equal. The code is public under Apache-2.0 at [github.com/0xScoutr/cctools-network-record](https://github.com/0xScoutr/cctools-network-record), and its daily check (file hashes and re-render) passed every day from 2026-11-14 to 2026-11-23. From 2026-11-24 it failed on one file: the re-render of revisions.csv ordered rows that share a second differently from the published file. The fix (d758e2e) is in the repository and in production since 2026-11-27, and the published file will be re-rendered with it on 2026-11-28.

#### 2.2 Per-application series (Milestone 2)

**The reader.** Scan's `POST /v0/events` returns each confirmation request's verdict and traffic and, since June 2026, CIP-0104 activity records with the traffic bytes attributed to each featured-application provider, plus the DSO-visible update. The reader has run since 2026-11-10 against Super Validators' Scans only, within a strict request budget. On 2026-11-23 it held every day from 2026-08-21 to 2026-11-22: 91.6 million confirmation requests.

**What is kept.** A stripped copy that can rebuild a day after Scan prunes it. Informees, submitting parties, confirmers, observers and marker beneficiaries are never stored. The submitting participant of each request (Mediator metadata) and per-node request rows are kept but never published; the files carry traffic purchases per member node, with the party that paid.

**The series** (schema 1.1, additive on the same `/v1/` path): app rewards and activity markers per provider (`apps/rewards.csv`), from `AppRewardCoupon` and `FeaturedAppActivityMarker` and, after the CIP-0104 switch, from the DSO's one coupon per provider and round above the coupon threshold, as scheduled issuance in CC, not minted CC; attributed traffic and transactions per provider (`apps/traffic.csv`), from the activity records, with traffic at list price (US$60 per MB on 2026-11-23), labelled "CIP-0104 attributed traffic per application, at list price", because the submitting node pays for traffic; traffic purchases per node (`nodes/purchases.csv`), from `AmuletRules_BuyMemberTraffic` and the purchase path Splice 0.10.0 adds, with the paying party; and `traffic_burn_cc` and `active_featured_apps` in `daily.csv`. `apps/daily.csv` joins rewards and attributed traffic per provider and day, with rewards per MB of attributed traffic; providers are listed by party id and named only from public sources.

**Reconciliation.** A day is final only when its rounds reconcile: before the switch, provider coupons must equal each round's `totalFeaturedAppRewardCoupons`, and attributed bytes are compared with the Super Validators' reward-accounting totals where our validator can read them. A day that does not reconcile stays provisional and raises an alarm.

**History and both reward methods.** Per-application history starts at Scan's first activity record, 2026-06-12T00:00:00Z. The CIP-0104 switch is targeted for February 2027, subject to Tokenomics Committee approval, so both reward methods are in scope; the new one is first tested against the Super Validators' dry-run minting allowances, which our validator has read since 2026-11-14.

**Network history.** The eight round and snapshot series extend back to 2024-06-26 from the captured state, with first round and round count derived from each day's last round, and traffic purchases per node and the network's traffic burn are derived from its per-member traffic totals where it allows. Each value names its method, and any day that cannot be read or derived carries a gap reason, never an estimate.

Each new series gets a row in `methodology.json`, and `verify` and the public repository are extended to cover it.

#### 2.3 Checked across operators (Milestone 3)

For each day the record also reads the round inputs, the snapshot series and a sample of activity records from a second Super Validator operator, and compares them exactly. A host behind on the snapshot is `lagging` and retried; a real difference is held under `sources_disagree` and logged in public, never averaged. Each day gains `scan_agreement` (`single` or `cross`, which needs two different operators, never the public proxy), and `freshness.csv` records when each day became final.

#### 2.4 Upkeep (Milestone 4)

Compatibility with Splice releases, method versions when reward or fee rules change, issue triage, support for readers and a quarterly public report.

### 3. Architectural Alignment

RFP 20 asks four questions: the table answers the first three per series, and Privacy answers the fourth.

| Series | Data required | Class | If involved-party metadata stops being public |
|---|---|---|---|
| Network series, traffic purchases and burn | DSO round and rules contracts, `FeaturedAppRight`, `ValidatorLicense`, registry supply, `AmuletRules_BuyMemberTraffic`, member traffic totals in the ACS state | Publicly observable (DSO-visible) | Unaffected |
| App rewards, markers and active applications | `AppRewardCoupon`, `FeaturedAppActivityMarker`, `FeaturedAppRight` | Publicly observable (DSO-visible) | Unaffected. Markers end at the switch |
| Attributed traffic per provider | CIP-0104 activity records on `/v0/events` | Publicly observable on Scan (CIP-0104 output), computed from Mediator data | Moves to per-round totals if Scan publishes them, or stops with a gap reason |
| Transactions per provider | The same records | Publicly observable on Scan (CIP-0104 output); depends on Mediator metadata | Fallback: the application's own signed daily count, labelled application-provided |

**Privacy.** Rows are per featured-application provider, a right granted by public Super Validator vote, or per node, with the party that paid for each traffic purchase. Everything in the files is already public on Scan, so there is no access tier, and an application-provided count is published only when the application signs it.

**Why the metadata-dependent series are in.** The activity records are intended: CIP-0104 (approved 2026-02-12, amended 2026-10-27) extends the Scan API to publish them, and its implementing grant (#107) runs the new rewards in dry-run mode for at least four weeks before paying on them, so that "explorers and app builders" can compare the results "to existing marker-based rewards". The record leads with the series that do not depend on them.

Two routes it reads are tagged internal (`/v0/migrations/last` and the reward-accounting totals); shape checks fail loudly rather than publish a wrong value.

### 4. Backward Compatibility

*No backward compatibility impact.* New series and files are additive under schema 1.x on the same `/v1/` path, and existing files keep their columns.

---

## Milestones and Deliverables

### Milestone 1: Delivered network record (retroactive)

- **Committed Date:** Half on approval; half on verified outside use of the network series.
- **Focus:** Recognize the network record, its verifier and the move to Super Validator Scans, delivered before this proposal.
- **Deliverables / Value Metrics:** The record in 2.1, published daily since 2026-09-30 with a row for every day since 2026-03-26, with its pipeline and verifier public under Apache-2.0; one outside team using the network series.
- **Conditions:** The record is published for every day up to approval and complete since 2026-10-01; the repository's daily check is green; a reviewer re-derives a day Scan still serves with one documented command, which reports PASSED or names the failing value.
- **Payment:** US$14,400 on approval when the conditions above hold; US$14,400 on the first outside use verified under the tests of Milestone 5, by month 15, or it lapses and stays in the Fund. That consumer does not count for Milestone 5.

### Milestone 2: Per-application series

- **Committed Date:** 12 weeks after approval
- **Focus:** Publish what every featured application earned and was credited with, every day.
- **Deliverables / Value Metrics:** The series in 2.2 with both reward methods; the issuance and coupon series for the same days; the eight round and snapshot series back to 2024-06-26, with traffic purchases per node and network traffic burn from the same daily state; the verifier and reader public; the design posted in the forum's Tokenomics category first, with every comment answered.
- **Acceptance tests:**
  - At least 95% of the days from 2026-06-12 to acceptance are final and reconciled per round, and the ten issuance and coupon series are filled for at least 95% of them; the rest are provisional or carry a gap reason.
  - The eight round and snapshot series are filled for at least 95% of the days from 2024-06-26 to 2026-03-25, and traffic purchases and traffic burn for at least 95% of the days from 2024-06-26 to 2026-06-11; the rest carry a gap reason.
  - Both reward methods work: 30 consecutive final days under the new method if the switch has happened, otherwise 7 consecutive days of its results, published with their inputs and compared with the dry-run minting allowances.
  - A reviewer re-derives any day Scan still serves, for any application, with one documented command and no help from CCTools.
  - At least one featured-application team compares its own series with its records and posts the result in the milestone issue.
- **Payment:** US$10,800 for the reader on approval if the capture then holds at least 95% of the days from 2026-06-12, otherwise with the rest; US$34,400 on committee acceptance.

### Milestone 3: Checked across operators

- **Committed Date:** 18 weeks after approval
- **Focus:** Publish, for every day, whether two Super Validator operators agree.
- **Deliverables / Value Metrics:** `scan_agreement` on every day from the start date, the disagreement log and `freshness.csv`.
- **Acceptance tests:**
  - For 30 consecutive final days, at least 27 are graded `cross`, and the rest are `single` with a stated reason.
  - Every disagreement in the window is in the public log with its resolution.
  - A validator operator or reviewer outside CCTools re-derives at least one of those days, while Scan still serves it, and posts the result in the milestone issue.

### Milestone 4: Twelve months of upkeep

- **Committed Date:** Quarterly for 12 months from Milestone 2 acceptance
- **Focus:** Keep the record true and on time as the network changes.
- **Deliverables / Value Metrics:** Compatibility updates, method versions, issue triage, support for readers, and one public report each quarter.
- **Acceptance tests, each quarter:**
  - At least 95% of the quarter's days are final by D+1 03:00 UTC, measured from `freshness.csv`.
  - Every empty value in a final row has a reason, and every change to a final value is in `revisions.csv`.
  - A change to the network's reward or fee rules ships as a new method version within 30 days.
  - A quarter below the 95% line pays half its tranche, and the other half lapses.

### Milestone 5: Verified outside use

- **Committed Date:** Per consumer, after Milestone 2 acceptance and until month 15
- **Focus:** Pay for use, not for delivery.
- **Deliverables / Value Metrics:** Up to six qualifying consumers of the per-application series.
- **Use tests, for each consumer:**
  - An organization with no common ownership with CCTools uses the per-application files, or the verifier on them, in a production or published output: a dashboard, report, paper, application page or committee document.
  - The use is shown by a public link, or by a signed attestation when the output is private.
  - A continuing use (a dashboard or an application page) is live when verified and has read the files for at least 30 days; a one-off output counts once, when it is published.
  - CCTools paid nothing for it, and it is not a term of a commercial agreement with CCTools.
  - Market feeds, including the DefiLlama adapters on CCTools' market endpoints, do not count. Foundation or committee use counts once. The consumer that releases the second half of Milestone 1 is not counted here.

Unearned Milestone 5 tranches lapse at month 15 and stay in the Fund. A milestone whose tests are met before approval is paid on approval against the same tests.

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone
- Demonstrated functionality or operational readiness
- Documentation and knowledge transfer provided
- Alignment with stated value metrics

Project-specific conditions:

- Every test can be run outside CCTools from public code, files and the public proxy for days Scan still serves, except a private consumer's attestation and three checks on Super Validator routes open only to validators (the `cross` grade, the traffic reconciliation and the dry-run comparison).
- Each milestone's code is public when submitted, and each review named as a deliverable has taken place and is linked.
- More than half of the money for work still to build, and half of Milestone 1, pay only on outside use.

---

## Funding

**Total Funding Request:** US$200,000, sized in US dollars and converted to CC at approval, as Canton Index ([#319](https://github.com/canton-foundation/canton-dev-fund/pull/319)) was; the rate is the mean of the Super Validators' voted CC/USD price over the five days to approval, after which the grant is fixed in CC. At the five-day mean to 2026-11-26 (US$0.0759) it is about 2,635,000 CC; the tables below use the US$0.090 sizing price (the mean over the five days to 2026-11-12 was US$0.0899), at which it is about 2,222,222 CC.

### Payment Breakdown by Milestone

| Milestone | USD | CC at US$0.090 | Trigger |
|---|---:|---:|---|
| 1. Delivered network record (retroactive) | 28,800 | 320,000 | Half on approval, when its conditions hold; half on first outside use |
| 2. Per-application series | 45,200 | 502,222 | Reader 10,800 on approval if its capture condition holds, or else with the rest; 34,400 on acceptance |
| 3. Checked across operators | 13,500 | 150,000 | Committee acceptance |
| 4. Upkeep, 12 months | 31,500 (7,875 a quarter) | 350,000 (87,500 a quarter) | Quarterly, in arrears |
| **Milestones 1 to 4** | **119,000** | **1,322,222** | |
| 5. Outside use of the per-application series | 81,000 (13,500 each, up to 6) | 900,000 (150,000 each) | Per verified consumer |
| **Total** | **200,000** | **2,222,222** | |

Built work: US$39,600, Milestone 1 and the reader. Still to build: US$160,400, of which US$81,000 is Milestone 5.

### Cost basis

Hours are priced at US$130, Canton Index's blended rate (#319), as contractor-equivalent estimates. Milestone 1's US$28,800 is 222 hours, the low end of the 220 to 340 estimated; the reader's US$10,800 is 83 hours, within its 60 to 100. Paying delivered work on approval has precedent in Noders ([#38](https://github.com/canton-foundation/canton-dev-fund/pull/38)) and Digital Asset's Contract Keys proposal ([#75](https://github.com/canton-foundation/canton-dev-fund/pull/75)).

The rest of Milestones 2 to 4 is estimated at 660 to 1,030 hours: 240 to 410 for Milestone 2, including network history back to 2024 (40 to 70), 120 to 200 for Milestone 3 and 300 to 420 for upkeep. US$79,400 pays about 611 hours at US$130, 72% of the 845-hour midpoint and 93% of the low estimate; CCTools carries the rest and all infrastructure. Milestone 5 is priced per consumer at US$13,500 (150,000 CC at the sizing price), below the 260,000 CC per adopter that Canton Venues ([#778](https://github.com/canton-foundation/canton-dev-fund/pull/778), open) asks since its 2026-11-24 revision; Kaiko's approved Data Standard proposal ([#113](https://github.com/canton-foundation/canton-dev-fund/pull/113)) pays 100,000 CC per client, about US$15,558 at the Super Validators' voted price on its merge date, against US$13,500 per consumer here.

### Volatility Stipulation

The project runs longer than 6 months. The grant is in fixed Canton Coin, locked at approval, and re-evaluated at the 6-month mark without rebasing delivery milestones. Only tranches not yet minted 9 months after approval may be renegotiated, by mutual agreement with the Committee, if the CC/USD price has moved significantly.

---

## Co-Marketing

Upon release, the implementing entity will collaborate with the Foundation on:

- Announcement coordination
- A technical post on how a per-application day is built, reconciled and checked
- Developer and ecosystem promotion through the forum's SIG categories

---

## Motivation

**Half the issuance, no open file per application.** About half of each day's issuance goes to featured applications (147 rights in force on 2026-11-22), and #107 names the need: to let app providers "track the source of their rewards in each round".

**Short or closed history.** The Tie shows app rewards per party over 30 days and CCView's featured-app API 31 days per query; longer histories need paid keys, and Noves labels its per-application burn splits estimates.

**A closing window.** The pruning tracker ([splice#6248](https://github.com/canton-network/splice/issues/6248)) targets update history pruning on MainNet for 2026-12-07, and per-round reward accounting is already kept only about a week. After that, an old day is checkable only where someone kept the inputs, or through the bulk history API, which is pre-alpha.

**Missing burn.** Traffic purchases were 94.8% of all CC burned from 2025-05-14 to 2025-08-14 (CIP-0078), which then removed transfer fees; a traffic burn series back to 2024-06-26 is part of Milestone 2.

**Who benefits.** Featured-app rights holders, the Foundation and its committees, researchers, and explorers that can read the files instead of rebuilding them. We expect six direct consumers of the per-application series.

---

## Rationale

**Why a record.** A dashboard or query engine leaves the definitions to each reader; a record publishes one set of definitions, the source of each value and a way to check it. Scan runs only inside a Super Validator node, so the record reads it rather than extending it, and would reconcile against per-application aggregates if Scan adds them. A keyed feed cannot be republished, so nobody could check it.

**Relationship to grant 1.** Grant 1 ([#159](https://github.com/canton-foundation/canton-dev-fund/pull/159), merged 2026-04-15, 500,000 CC, all three milestones paid) funded the CCTools product, including featured-app pages (its Milestone 1) and the `cctools.network/network` page with its asset tracker (its last milestone, delivered on 2026-09-10, [#221](https://github.com/canton-foundation/canton-dev-fund/issues/221)). As delivered under grant 1, those pages showed lifetime totals, with no daily series, file, method or verifier; the record's day pages were added to /network later, from code first written on 2026-09-25, after that delivery. CIP-0104 data exists on Scan only since June 2026, and RFP 20 was published on 2026-08-25.

| Work | What it does | How this differs |
|---|---|---|
| Traffic-Based App Rewards ([#107](https://github.com/canton-foundation/canton-dev-fund/pull/107)) | Computes CIP-0104 rewards and publishes activity records | Publishes the outcome per application and day |
| User-paid traffic accounting ([#527](https://github.com/canton-foundation/canton-dev-fund/pull/527)) | Node-local traffic accounting | Public network data only; complementary |
| Canton Index ([#319](https://github.com/canton-foundation/canton-dev-fund/pull/319)) | A query engine a team deploys; a Scan connector is planned for its separately funded Phase 2 | A published dataset with fixed definitions and a verifier, which Phase 2 could check against |
| Explorers: CCView, The Tie, CC Space, Loop Data, Noves | Short per-application views; longer histories behind paid keys | Keyless daily files with provenance, which they can consume |

---

## Team

We delivered grant 1, with all three milestones paid, and run the record pipeline, the per-application reader, our own MainNet validator (onboarded 2026-10-02) and a public API in production. DefiLlama's adapters for Temple, Alpend, Tradecraft and Ibex read our keyless market feeds, which republish each protocol's own data.

| Role | Who |
|---|---|
| Technical lead, pipeline and validator operations | João Matheus (Scoutr), founder |
| Head of Data, second maintainer of the record | Lari |
| Curators, CCTools application directory | Erick, Rhulyo |
| Social and community moderation | Avocado |
| Support and community moderation | Jove |

---

## Sustainability

CCTools runs and pays for the record after the grant from its paid data products, sold on freshness and support, never on access to the daily facts, so the daily files stay free and keyless. A runnable example, a daily check and a second maintainer, Lari, keep it from depending on one person. If CCTools stops, the data is CC BY 4.0, the code is Apache-2.0, and we will hand the repository to the Foundation or a designee on request.

---

## Licensing

- **Code** (pipeline, reader, verifier): Apache-2.0.
- **Published data and methodology:** CC BY 4.0, covering the daily aggregates CCTools derives, not the underlying Scan data.
- **Test fixtures** (recorded Scan answers) stay under the terms of the host that served them, as the repository's NOTICE states.

Canton is a registered trademark of Digital Asset (Switzerland) GmbH. Digital Asset is not affiliated with, and has not sponsored or endorsed, CCTools.
