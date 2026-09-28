# Canton Validator Reliability Suite: Horizon

| Field | Value |
| :---- | :---- |
| Organization | Equilibrium ([equilibrium.co](https://equilibrium.co/)) |
| Author / Primary Contact | Olli Tiainen <olli@equilibrium.co> |
| Status | Published |
| Created | 2026-09-28 |
| Proposal Type | RFP-aligned |
| RFP / Roadmap Area | RFP #23: Validator and Shared Infrastructure Security and Resilience |
| Champion | Heslin Kim, Zenith ([@heslin-zenith](https://github.com/heslin-zenith)) |
| Total Funding Request | Up to 800,000 CC |
| Project Duration | ~3 months engineering, adoption window to month 12, quarterly maintenance |
| Label | node-deployment-operations |

---

## Table of Contents

- [Abstract](#abstract)
- [Motivation](#motivation)
- [Specification](#specification)
  - [1. Objective](#1-objective)
  - [2. Implementation Mechanics](#2-implementation-mechanics)
  - [3. Architectural Alignment](#3-architectural-alignment)
  - [4. Backward Compatibility](#4-backward-compatibility)
- [Milestones and Deliverables](#milestones-and-deliverables)
- [Acceptance Criteria](#acceptance-criteria)
- [Funding](#funding)
- [Co-Marketing](#co-marketing)
- [Rationale](#rationale)
- [Why Equilibrium](#why-equilibrium)

## Abstract

Canton's ambition is to grow to 10,000 validators, while making each one secure, resilient, and increasingly straightforward to operate. Much of the knowledge required already exists, but it is spread across deployment defaults, monitoring rules, documentation, source code and expert support rather than being verifiable by the operator running the node.

The **Canton Validator Reliability Suite** turns that knowledge into something an operator can run: one command, `canton-reliability`, that checks a running validator against explicit, versioned references and reports each departure with its consequence. It is read-only and safe to run against a production node. Its four modules cover configuration (Canton Norm + Canton Drift), runtime health (Canton Vitals), recoverability (Canton Reentry) and traffic and Canton Coin runway (Canton Horizon), each proposed separately.

**This proposal delivers the runway module, Canton Horizon.** It reads the node's traffic counters, its wallet balance, the network's fee parameters and the operator's top-up settings. It prints each balance's runway, how long it lasts at the node's measured consumption rate, and whether the top-up settings keep pace with that rate.

The work is one Apache-2.0 tool, `canton-reliability horizon`, for both deployment shapes, Kubernetes and Docker Compose. It reads the node and answers three questions:

- How long the node's purchased traffic will last
- How long the node's Canton Coin will last
- Whether the top-up settings buy traffic as fast as the node uses it

Each answer is one line of the report, showing:

- The current value, and how fast it is changing
- The threshold it is measured against, and where that threshold came from
- The time until the value reaches the threshold
- A verdict

Two more lines show how much traffic each application used, and how much was charged but never delivered. The output is JSON, with a table for reading in a terminal.

Engineering is scoped at three months; adoption pays per qualified organisation until month 12, and quarterly maintenance follows. The base grant assigns 60 percent to engineering and 40 percent to adoption; the amounts are set under [Funding](#funding).

---

## Motivation

### The top-up automation runs on two numbers the operator sets once

The validator app buys traffic automatically. The operator sets a target throughput and a minimum interval between purchases. Digital Asset's [traffic documentation](https://github.com/canton-network/splice/blob/main/docs/src/deployment/traffic.rst) describes the trade-off:

> "a shorter interval reduces the risk of traffic running out between top-ups, but increases the risk of CC being spent quickly before the operator has time to notice it; a longer interval gives the operator more time to notice problems, but increases the risk of running out of traffic. Both failure modes occur in practice: a node can stop transacting either because it ran out of traffic, or because it ran out of CC to purchase more."

The shipped Helm example and Compose bundle set the same two numbers on every node: 20,000 bytes per second, every minute (at the documentation's example fee of 60 USD per megabyte, a node that uses all of that traffic spends 72 USD in Canton Coin per minute, 4,320 USD per hour). There doesn't seem to be a way for the operator to tell whether 20,000 bytes per second is more or less than what their node uses (or will use) in practice. For applications other than the validator app, the documentation recommends watching the balance by hand: "we recommend monitoring the traffic balance and pausing that app if you run out of traffic."

The validator app keeps 200,000 bytes of purchased traffic in reserve, so that it can always buy its next top-up. While the purchased balance is below that reserve, the app refuses the low-priority submissions it makes for the operator. Accepting a transfer of coin is one of them. Free base-rate traffic does not count toward the reserve. The shipped Helm example and Compose bundle both turn top-ups on. So a new node with an empty wallet cannot accept the coin that would fill it.

That has happened twice this year. On 9 May 2026 an operator [reported](https://forum.canton.network/t/validator-traffic-balance-0-in-new-validator/8630) that their new MainNet validator, deployed the day before, could not onboard a party or accept a transaction. They posted this log line:

> `ABORTED: Traffic balance below reserved traffic amount (0 < 200000)`

A month later a TestNet operator [hit the same refusal](https://forum.canton.network/t/cold-start-deadlock-cant-accept-incoming-1000-cc-transfer-offer-due-to-traffic-balance-below-reserved-traffic-amount-0-200000/8701): 0 CC in the wallet, an incoming 1,000 CC transfer offer, and the attempt to accept it refused with the same message.

> "This seems like a cold-start deadlock: accepting the offer requires extra traffic, buying extra traffic requires CC, but the CC is locked in the offer I can't accept yet."

Other forum members suggested to turn top-ups off until the wallet has balance. The troubleshooting page mentions turning top-ups off only for operators who want free traffic alone. It does not say that a new node with an empty wallet needs to.

### The measurement method exists only as a forum answer

Every value a runway needs already exists, as a metric, on the ledger, or in the node's configuration. The shipped dashboard charts the balances. It does not show a time to exhaustion. The top-up trigger computes on every poll whether the wallet can afford the next top-up and exposes the answer only as a log warning. No shipped alert rule reads a traffic-control metric.

On 30 July 2026 a forum member [asked](https://forum.canton.network/t/consumed-traffic-over-a-given-time-window/9027) for "programmatic access to… the base-rate traffic which my node consumed, the paid traffic which my node consumed" over a time window. A Community Tech Partner answered five days later with the counter arithmetic. That answer is the method Canton Horizon uses. The documentation does not yet give it.

### Every validator consumes traffic

Roughly 980 validators were mapped by community tooling in March 2026. Onboarding caps are rising toward 3,000 through September 2026, and the 2028 target is 10,000 validator nodes. Every one of them uses traffic. Those on the shipped configuration have top-ups switched on, so they buy traffic with Canton Coin whenever their load exceeds the free base rate.

---

## Specification

### 1. Objective

**A Canton validator operator can see three things about their node: how long its purchased traffic lasts, how long its Canton Coin lasts, and whether its top-up settings buy traffic at least as fast as the node consumes it.**

### 2. Implementation Mechanics

#### What the tool reads

`canton-reliability horizon` reads three sources:

- The participant's and validator app's metrics, directly or through the operator's Prometheus
- The fee parameters and current CC price, through the node's Scan proxy
- The currently active top-up settings, from the running node deployment

#### The three items

Canton Horizon performs three checks. Each is a condition on the node. For each item it prints whether the condition holds, and how long until it stops holding.
  
| Item | Passes when | Runway printed | Outcome when it fails |
| :--- | :--- | :--- | :--- |
| `extra_traffic_above_reserve` | The node has more purchased traffic left than the reserve (checked only with top-ups on, which is when the app enforces the reserve) | Time to the reserve, and time to zero if no top-up clears | Every low-priority submission the validator app makes is refused, including its hourly activity report. At zero purchased traffic, once the free base rate is exhausted too, the sequencer denies all writes |
| `cc_covers_next_topup` | The wallet's unlocked Canton Coin covers one top-up | Time until the coin no longer covers a top-up, at the current round's price | The automation logs a warning and buys nothing, and the purchased balance drains to the reserve. A node with no coin and no purchased traffic cannot accept the transfer offer that would fund it |
| `load_within_purchasing_capacity` | The node's charged traffic per second stays within the free base rate plus the target throughput; within the free base rate alone with top-ups off | Where load exceeds capacity, time until the purchased balance reaches the reserve, at consumption minus what top-ups buy | The node uses more traffic in one interval than a top-up buys, and no top-up can happen sooner than the interval, so the balance runs out between top-ups. With top-ups off, the node is held to the free base rate and writes are denied until the base rate refills |

Traffic state is scoped to a single synchronizer. Every item is evaluated per synchronizer and the report names the synchronizer it read.

Two items print more. `extra_traffic_above_reserve` notes when a top-up is due: the purchased balance is below the top-up amount and the wallet can fund it. `load_within_purchasing_capacity` prints three figures:

- The interval in force
- The bytes and coin of one top-up
- The most coin the automation can spend in an hour at that configuration

#### How the runways are computed

`extra_traffic_above_reserve` prints the traffic runway $t_{\text{traffic}}$ and `cc_covers_next_topup` the Canton Coin runway $t_{\text{coin}}$:

$$t_{\text{traffic}} = \frac{P - C - R}{r} \qquad\qquad t_{\text{coin}} = \frac{B - K}{r \cdot c}$$

where the coin price of a byte $c$ and the cost of one top-up $K$ are

$$c = \frac{f}{10^6 \cdot p} \qquad\qquad K = T \cdot I \cdot c$$

`load_within_purchasing_capacity` holds when

$$L \le b + T$$

$r$ is the increase in $C$ over the measurement window, and $L$ is the increase in charged cost over the same window. Every other symbol is read from the node or the ledger:

| Symbol | Value | Read from |
| :--- | :--- | :--- |
| $P$, $C$ | Purchased and consumed traffic, in bytes | Participant `/metrics`, the `daml_sequencer_client_traffic_control_extra_traffic_purchased` and `_consumed` gauges |
| $L$ | The charged cost of every event, labelled by application; $L$ is its rate of increase | Participant `/metrics`, the `daml_sequencer_client_traffic_control_event_delivered_cost` and `_event_rejected_cost` meters |
| $B$ | The wallet's unlocked Canton Coin | Validator app `/metrics`, the `splice_wallet_unlocked_amulet_balance` gauge, labelled with the owning party |
| $f$, $b$, $p$ | The fee per megabyte in USD, the free base rate in bytes per second, and the current round's CC price in USD | `AmuletRules` and the open mining round, through the validator app's own Scan proxy |
| $T$, $I$, $R$ | The target throughput in bytes per second, the top-up interval in force in seconds, and the reserve in bytes | The validator app's effective configuration on the running deployment. The reserve defaults to 200,000 bytes; Helm can override it; the Compose bundle has no setting for it. The interval in force is the configured interval, rounded up to the trigger's polling interval and stretched to meet the network's minimum top-up |

#### How the rate is measured

The rates $r$ and $L$ are measured over a window. Two things decide them: the window, and the counters they are read from.

- **The window.**
  - Against Prometheus: the operator's choice, defaulting to 24 hours
  - Against the node's endpoints alone: two samples a stated interval apart, with the runway labelled with that interval. No rate is printed if the node restarted between the samples
- **The counters.**
  - Total traffic used: the increase in delivered plus rejected event cost
  - Purchased traffic used: the increase in the consumed counter
  - Free traffic used: total minus purchased

#### Provenance

Every threshold the report compares against carries one of four labels to indicate where its value came from:

| Label | Where the value is read | Effect on the verdict |
| :--- | :--- | :--- |
| `published` | The ledger, through Scan or the node's Scan proxy: the fee parameters, the round price | Computed and labelled |
| `configured` | The node's effective configuration: the target throughput, the interval, the reserve | Computed and labelled |
| `declared` | The operator | Computed and labelled, with the source recorded |
| `unknown` | Nowhere: not supplied and not readable | Not computed. The projection that needs it is withheld, and the report names the missing input |

With no deployment access and no declared configuration, the top-up settings are `unknown`, and:

- `extra_traffic_above_reserve` reports the distance to zero only and names the missing reserve
- `cc_covers_next_topup` reports the balance, with `not determined` for the cost of a top-up
- `load_within_purchasing_capacity` reports `not determined`; the shipped example values do not show what this node is configured with

#### The report

One line per item, with four fields:

- `observed`: the current value on this node, and how fast it is draining
- `reference`: the threshold it is compared against, and where that threshold was read from
- `runway`: how long until the value reaches the threshold
- `verdict`: whether the item's condition holds, does not hold, or could not be determined

Two more lines: how much traffic each application used, and how much was charged but never delivered. Output is JSON, with a terminal table for reading.

The verdict is one of three:

| Verdict | When |
| :--- | :--- |
| `holds` | The observed state satisfies the item's condition. The runway is printed with the window its rate was measured over. Where nothing is draining the balance, no runway is printed and the reason is named |
| `violated` | The observed state does not satisfy the condition. The cost is printed alongside |
| `not determined` | An input is `unknown`, the metrics are not exposed, or the window holds no charged traffic. The report names which |

```
$ canton-reliability horizon --prometheus http://prom:9090 --window 24h --k8s-context prod

synchronizer: global-domain::1220…  round: 4,912  price: 0.12 USD/CC (published)  fees: 60 USD/MB, base 400,000 B / 20m (published)

item                              observed                       reference                                   runway at the 24h rate                                 verdict
extra_traffic_above_reserve       1,050,000 B · 277 B/s extra    reserve 200,000 B (configured)               51m to reserve · 1h 3m to zero, if no top-up clears    holds · top-up due within 1m
cc_covers_next_topup              4,210 CC unlocked · 0.14 CC/s  600 CC per top-up (published + configured)   7h 14m                                                 holds
load_within_purchasing_capacity   610 B/s total                  20,333 B/s (published + configured)          none: load under capacity                              holds · interval in force 1m · 1,200,000 B and 600 CC per top-up · at most 36,000 CC/h

charged cost by application, 24h:  wallet-ui 61%  splice-validator 27%  my-settlement-app 12%
sequenced and not delivered, 24h:  0.4% of 52.7 MB
```

#### Where it runs

- On one node, once or on a timer. Each run is independent; the tool keeps no state between runs
- Over many nodes: fleet mode gives the same report for every node the operator can scrape, rolled up per item
- Without node access: a provider reads the traffic item for every validator it operates from Scan's traffic status, through its own node. Scan carries neither the node's metrics nor its top-up settings, so this path reports the traffic item against a declared reserve; the other two items need the node

#### Upstream contributions

We will also propose four changes to Splice. None is a precondition: if all are declined, `canton-reliability horizon` works the same.

- **A gauge for the cost of the next top-up.** The validator app already computes it on every poll and exports nothing but a warning when the wallet falls short. As a gauge, it lets any operator alert on "the wallet can no longer fund a top-up" without installing Canton Horizon.
- **A runway panel** on the *Synchronizer Fees (validator view)* dashboard.
- **An alert rule on purchased traffic** in [Splice's own alerting](https://github.com/canton-network/splice/tree/main/cluster/pulumi/observability/grafana-alerting), which today has no rule on any traffic-control metric.
- **Documentation.** From the guides where an operator enables top-ups, link to the troubleshooting entries for the reserve refusal, and state the remedy there. Add a method for choosing the target throughput from measured consumption.

#### Data and privacy

| Concern | Answer |
| :--- | :--- |
| What it writes | Nothing. It never buys traffic, never changes a setting, and holds no key |
| Party identifiers | The wallet balance metric is labelled with the operator's party id. The report marks that line as not safe to export off the node |
| What leaves the node | Nothing, unless the operator chooses to share a result. Shared results follow the Milestone 0 anonymisation rule |

### 3. Architectural Alignment

Everything runs against existing interfaces:

- The metrics the participant and validator app already expose
- The validator app's Scan proxy
- The deployment's own configuration

No protocol change is required. The one upstream change to the validator app itself adds a gauge for the cost of the next top-up. Licensed Apache-2.0, matching Splice.

#### Related work

We found four related pieces of work. None does what Canton Horizon does:

| Work | What it does | How Canton Horizon differs |
| :--- | :--- | :--- |
| [Digital Asset's per-user traffic accounting](https://github.com/canton-foundation/canton-dev-fund/blob/main/proposals/2026-07-DA-user-paid-traffic-accounting.md), an approved grant | Splits a node's traffic cost among its users and enforces per-user limits, inside the node | Horizon measures the node's distance to exhaustion and never touches a user account |
| [HALO](https://github.com/canton-foundation/canton-dev-fund/pull/745), a pending proposal under RFP #4 | Application failover across participants, with an optional top-up that buys traffic from measured consumption | Horizon reports how long traffic and coin last, and spends nothing |
| [Open Source Traffic Purchase App](https://github.com/canton-foundation/canton-dev-fund/pull/855), a pending proposal under RFP #7 | A wallet app with which any Canton Coin holder buys traffic for a validator, including one that can no longer transact on its own | Horizon reports when a node will reach that state, and buys nothing. A sponsor purchase through this app is one way to clear a `violated` traffic or coin report |
| [CC Space](https://cc.itrocket.space), a hosted alerting service | Advertises low-runway warnings on traffic, priced per alert | Horizon is open source, runs where the operator runs it, transmits nothing, and prints how every figure was computed |

#### The Suite

The Canton Validator Reliability Suite has four modules, each proposed separately:

| Module | Checks | Proposed under |
| :--- | :--- | :--- |
| Canton Norm + Canton Drift | configuration | RFP #23 |
| Canton Vitals | runtime health | RFP #27 |
| Canton Reentry | recoverability | RFP #23 |
| **Canton Horizon** (this proposal) | traffic and Canton Coin runway | RFP #23 |

All four modules share a common frame:

- **The runner**, which evaluates each module's checks against a node
- **The report format**, with `not determined` as the verdict every module shares
- **The provenance label** on every reference value
- **The result-sharing format and anonymisation rule**
- **The contribution guide**

The common frame ships with whichever module the Foundation funds first, as that proposal's Milestone 0. Each of the four proposals carries one quarter of its cost in its Milestone 1. If fewer than four are funded, Equilibrium absorbs the rest.

The Suite's repository moves to a neutral ecosystem home, such as the Node Deployment & Operations SIG or the `canton-network` organisation, once 5 contributors from outside Equilibrium have landed changes or 50 operators are running the Suite. Equilibrium stays on as maintainer-of-record.

### 4. Backward Compatibility

*The proposal has no backward compatibility impact.* `canton-reliability horizon` is read-only and installs nothing on the node. The proposed gauge, dashboard panel and alert rule are additive and change nothing about how existing metrics, dashboards or rules are produced or consumed.

---

## Milestones and Deliverables

### Milestone 0: The Suite frame

- **Estimated Delivery:** ~1 month from grant start. If another Suite module has already shipped the frame, this milestone closes at approval
- **Focus:** The `canton-reliability` command and the parts every module shares:
  - The runner
  - The report format, with `not determined` as its third verdict
  - The provenance label
  - The result-sharing format and anonymisation rule
  - The contribution guide
- **Deliverables / Value Metrics:**
  - `canton-reliability` published Apache-2.0, with the contribution guide
  - The result-sharing format and anonymisation rule published

### Milestone 1: Canton Horizon published

- **Estimated Delivery:** ~1 month from grant start
- **Focus:** The tool an operator can run on Kubernetes or Docker Compose, with or without Prometheus. The first upstream change, a gauge for the cost of the next top-up, submitted to Splice.
- **Deliverables / Value Metrics:**
  - `canton-reliability horizon` published Apache-2.0. It reports all three items, per synchronizer, on both deployment shapes, with or without Prometheus, as JSON and as a terminal table
  - The two extra report lines: how much traffic each application used, and how much was charged but never delivered
  - A recorded run on a TestNet validator we run, with top-ups on and an empty wallet, showing `extra_traffic_above_reserve` and `cc_covers_next_topup` both `violated`
  - The tool's documentation. It lists every metric the tool reads, with its labels, confirmed by a scrape of that validator, and cites the source for what happens when each item does not hold
  - The gauge for the cost of the next top-up submitted to `canton-network/splice`

### Milestone 2: The path for providers without node access, and the upstream contributions

- **Estimated Delivery:** ~2 months from grant start
- **Focus:** Canton Horizon for a provider that operates validators it cannot scrape. It reads the traffic item for each of them from Scan, through the provider's own node. Examples for running the tool on a timer, on both shapes. Each of the four upstream changes merged, declined, or in review.
- **Deliverables / Value Metrics:**
  - The path without node access shipped. For every validator a provider operates, one per run, it reports `extra_traffic_above_reserve` and the consumption rate from Scan's traffic status alone, against a reserve the provider declares
  - `systemd` timer and Kubernetes `CronJob` examples for running on a timer
  - Each of the four upstream changes merged into `canton-network/splice`, declined with a stated reason, or in review for at least 30 days

### Milestone 3: Release tracking, fleet mode and handover

- **Estimated Delivery:** ~3 months from grant start
- **Focus:** `canton-reliability horizon` verified against every Splice release shipped since grant start, with any change to the metrics, configuration keys or endpoints it reads called out. Fleet mode: the same report over many nodes, rolled up per item. The maintenance plan published.
- **Deliverables / Value Metrics:**
  - `canton-reliability horizon` verified against each Splice release shipped since grant start, with changes to what it reads called out
  - Fleet mode shipped: the same report over many nodes, rolled up per item
  - A published maintenance plan naming Equilibrium as maintainer-of-record and the conditions under which the repository moves to a neutral ecosystem home

### Milestone 4: Adoption

- **Opens:** on Milestone 3 acceptance. **Deadline:** 12 months from grant approval.
- **Focus:** Verified adoption of Canton Horizon, per the table below. Partial adoption earns partial payment.
- **Payment structure:** the adoption pool is 280,000 CC: 120,000 CC for the first Super Validator operator running Canton Horizon on the validators it operates, and 40,000 CC per further qualified organisation for up to four organisations. The completion tranche is 40,000 CC. It is payable only once at least one organisation has qualified and every criterion in the completion row is met.
- **Deliverables and tranches:**

| Deliverable | Acceptance criteria | Tranche payout |
| :--- | :--- | :--- |
| Super Validator adoption | One Super Validator operator running `canton-reliability horizon` on the validator nodes it operates. Its SV node is out of scope, since SV traffic is unlimited. Evidence: a public statement by the Super Validator, or its attestation to the Foundation, naming the Splice release it ran against | 120,000 CC |
| Organisation adoption | Each further qualified organisation: a further Super Validator operator, a Node-as-a-Service provider running it across the validators it operates, or an organisation consuming its JSON output in its own monitoring or tooling. Evidence: for an open-source consumer, the public code consuming the output; otherwise the organisation's public statement or attestation to the Foundation, naming what it runs and across how many validators | 40,000 CC per organisation, up to 160,000 CC |
| Milestone completion | All of: `canton-reliability horizon` in use by 10 distinct validator operators across both deployment shapes; 5 of those running it on a timer; 3 operators having changed their top-up settings or funded their wallet after a `violated` report; a published count of items found violated and later corrected, drawn from the shared results, with at least 3 corrected; 10 operators choosing to share a result, with the published share of shared nodes whose Canton Coin runway was under a day; and 2 contributions to the module from outside Equilibrium, merged. Evidence: operator attestations to the Foundation for usage, timer runs and corrections; the shared results themselves for the corrected count and the published share; the merged pull requests for the contributions | 40,000 CC |
| **Milestone 4 maximum** | | **320,000 CC** (40% of the base) |

- **Verification:** attestations go to the Foundation directly, and shared results identify a node only as far as the Milestone 0 anonymisation rule allows.

### Maintenance: Canton Horizon verified against every Splice release

- **Estimated Delivery:** Quarterly, from the quarter after Milestone 3, for 4 quarters
- **Focus:** `canton-reliability horizon` kept working against every Splice release, contributions reviewed, and the Suite frame kept working.
- **Deliverables / Value Metrics:**
  - `canton-reliability horizon` verified against every Splice release shipped in the quarter, within 14 days of each, with changes to what it reads called out
  - Every contribution reviewed, and merged or declined with a stated reason
  - The Suite frame working against the current Splice release

---

## Acceptance Criteria

Each milestone is accepted against its deliverables, with the published artifacts as evidence.

- **Milestones 0 through 3:** the named artifacts are published and accepted by the committee.
- **Milestone 4:** the Foundation receives the evidence named in the adoption table.
- **Maintenance:** each quarter's deliverables are published as specified.

Every release must satisfy the following conditions:

- No item is reported `holds` on a value the tool had to assume
- Every runway names the window its rate was measured over
- `canton-reliability horizon` never buys traffic and never changes a setting

---

## Funding

**Total Funding Request:** Up to 800,000 CC base. Maintenance is priced separately at 45,000 CC per quarter for four quarters, so 980,000 CC is the maximum. The base assigns 60 percent to engineering across Milestones 1 through 3 and 40 percent to adoption in Milestone 4.

### Payment Breakdown by Milestone

- Milestone 0 (The Suite frame): 0 CC. Its cost sits in Milestone 1; each of the four Suite proposals carries one quarter of it
- Milestone 1 (Canton Horizon published): **250,000 CC** upon committee acceptance (~31% of the base)
- Milestone 2 (The path for providers without node access, and the upstream contributions): **160,000 CC** upon committee acceptance (~20% of the base)
- Milestone 3 (Release tracking, fleet mode and handover): **70,000 CC** upon committee acceptance (~9% of the base)
- Milestone 4 (Adoption): up to **320,000 CC** (40% of the base), paid as an adoption pool (280,000 CC) plus a completion tranche (40,000 CC), per the Milestone 4 table
- Maintenance (Canton Horizon verified against every Splice release): **45,000 CC** per quarter, for 4 quarters, upon quarterly acceptance

Milestone 1 prices Canton Horizon as reusing two parts built under our open Suite proposals: the metrics observer from Canton Vitals ([PR #749](https://github.com/canton-foundation/canton-dev-fund/pull/749)) and the deployment observer from Canton Norm + Canton Drift ([PR #748](https://github.com/canton-foundation/canton-dev-fund/pull/748)). Should Canton Horizon be approved before them, Equilibrium builds those parts at its own cost; this request does not change with the order of approval.

### Volatility Stipulation

Should the engineering timeline extend beyond six months due to Committee-requested scope changes, any remaining milestones will be renegotiated to account for CC/USD price volatility. Milestone 4 and Maintenance run beyond six months: their amounts are denominated in Canton Coin against the CC/USD reference price stated at approval, and re-evaluated at each payment.

---

## Co-Marketing

Upon release, Equilibrium will collaborate with the Foundation on:

- Announcement coordination
- A technical write-up for new operators: the reserve, the refusal a new node hits, and how to set the target throughput from measured consumption
- Publication of the aggregate measurement from Milestone 4: the share of shared validator nodes whose Canton Coin runway was under a day. We found no published equivalent
- Presentation to the Node Deployment & Operations SIG

---

## Rationale

This proposal makes three choices worth explaining.

The first is the tool itself. We could have shipped only a Prometheus alert rule on the traffic runway. Every operator with Prometheus would import one file. But a rule can only read metrics, and two of the three items cannot be computed from metrics at all:

- The coin runway needs the price of a byte, which lives on the ledger
- The load check needs the target throughput, which lives in the node's configuration

The TestNet lockout was a wallet that could not fund a top-up. A traffic rule would have shown the balance at zero, not that nothing would refill it. So the tool reads all three sources, and the alert rule goes upstream as one of the contributions.

The second is what the tool does with what it finds. The obvious next step after measuring that a node is about to run dry is to buy traffic, or to raise the target throughput. We do neither. Buying traffic spends the operator's Canton Coin, and the operator already chose the settings the validator app spends on. Canton Horizon prints where the node sits against the documented trade-off. The operator decides what to change.

The third is the line of the report that shows how much traffic each application used. When a node runs out of traffic, the documentation tells the operator to pause the application that is using it. To do that, the operator has to know which one. That line tells them.

## Why Equilibrium

Equilibrium builds, secures, and funds verifiable systems for finance and AI. We're a global team of 30 engineers, cryptographers and economists ([company team page](https://equilibrium.co/who-we-are)).

Relevant previous work includes:

- **Canton and Daml engineering.** We are building a proof-of-concept SVM execution layer on Canton for Zenith, mapping Solana's account and runtime model onto Canton. We also maintain [awesome-daml](https://github.com/equilibriumco/awesome-daml/), an openly licensed guide to Daml and the Canton developer ecosystem.

- **Node specification and protocol testing.** With Ziggurat, our P2P network-testing framework, we've reverse-engineered the network layers of Solana, Zcash [(write-up)](https://forum.zcashcommunity.com/t/ziggurat-3-0/43350/46), XRP [(blog)](https://xrpl.org/blog/2022/ziggurat) and Algorand into a published specification (e.g. [Solana's spec](https://github.com/solana-foundation/specs/blob/main/gossip/gossip-protocol-spec.md)) and automated test catalogue.

- **Production node engineering and operation.** We've built and continue to maintain [Pathfinder](https://github.com/eqlabs/pathfinder), the open-source Rust full node for Starknet. We are long-standing contributors to [snarkOS](https://github.com/ProvableHQ/snarkOS), Aleo's P2P node software and consensus, and [snarkVM](https://github.com/ProvableHQ/snarkVM), its zkVM, alongside Aleo's core engineering team. We also operate our own Aleo validator, with publicly verifiable uptime ([explorer](https://aleoscan.io/address?a=aleo1cxk6pkrucemg7fmxhhrxymus9vnr00mtmgzvx95nkcwpdj5qhsrswgdgfr)). Other node infrastructure work includes [Lumina](https://github.com/celestiaorg/lumina), the Rust Celestia light node, [Strawberry](https://github.com/eigerco/strawberry), a full Go implementation of the Polkadot JAM protocol, [zkSync state reconstruction](https://github.com/equilibriumco/zksync-state-reconstruct) tooling, which rebuilds zkSync Era state from Ethereum L1 data and verifies it against on-chain commitments.

- **Regulated finance engineering.** We incubated and provided engineering for Membrane Finance, acquired by Paxos in 2025, the company behind [EUROe](https://euroe.com), the first EU-regulated euro stablecoin.
