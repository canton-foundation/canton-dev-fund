# Canton Algorithmic Trading Toolkit

Open venue connector, reference liquidity bots, and an AI-agent execution interface for Canton Network trading venues.

**Organization:** Individual
**Author / Primary Contact:** Oleksii Vasiliev, independent developer ([github.com/olevasyliev](https://github.com/olevasyliev))
**Status:** Submitted
**Created:** 2026-07-14
**Updated:** 2026-09-09
**Proposal Type:** RFP-aligned
**RFP / Roadmap Area:** RFP 13, Payments and DeFi, under Financial Markets, Standards & Verification ([2026-2028 roadmap](https://github.com/canton-foundation/canton-dev-fund/blob/main/2026-2028-strategic-roadmap.md))
**Champion:** `Needs Champion`
**Total Funding Request:** 1,200,000 CC, of which 360,000 CC (30%) is payable only against verified independent operators
**Project Duration:** 5 months of development, plus an adoption window of up to 26 weeks after Milestone 4 acceptance
**Label:** defi-liquidity

---

## Abstract

Canton has venues (Cantex, Tradecraft, Ekiden, the funded DEX reference implementation) but no
trading layer: no open tooling to run automated strategies against them, and no way for the
liquidity those venues need to arrive programmatically. This proposal generalizes,
open-sources, and maintains an algorithmic trading toolkit that already exists and already
runs: a unified Python connector for Canton trading venues, a reference liquidity-bot engine
(grid and DCA strategies that place resting liquidity on thin pools), and an AI-agent
execution interface (MCP) so agent frameworks can trade on Canton with enforced risk controls.
The connector is built and runs against four Canton venues covering three market structures:
two spot AMMs on mainnet (Cantex, with a confirmed on-ledger swap, and Tradecraft), the funded
DEX reference implementation's order book and RFQ on its hosted testnet, and Ekiden's
perpetuals. The grant is not to build it from a blank page; it is to turn a working
single-integrator tool into shared infrastructure. Existing AI-facing tooling on Canton is
read-only insight and nothing executes. Venue-side tooling assumes a trader already has
infrastructure, and on Canton none exists in the open.

Every milestone below is checked by running one named script from the public repository. That
is not a proposed process: the Canton Foundation has already verified a milestone on another
grant by running this toolkit's own report script, cited under Motivation.

---

## Specification

### 1. Objective

Give Canton a single open algorithmic-trading layer: one toolkit through which software
(bots, funds, AI agents) can quote, size, execute, and risk-manage trades on Canton venues.

This is one objective rather than several deliverables sharing a technology. Each milestone
extends the same artifact and is a strict dependency of the one after it: a strategy places
its orders through the connector (M1); an order's lifecycle and risk state live in the
strategy engine (M2); M3 is what makes that lifecycle identical across market structures
rather than per-venue; and the agent interface (M4) exposes those same primitives with the
risk caps already enforced beneath them. Drop any one and the layer stops being usable by
the software it exists to serve. The milestones differ in engineering weight rather than in
kind, and the tranche split under Funding is sized to that difference; the whole sits inside
a single five-month window.

### 2. Implementation Mechanics

- **Venue connector (Python, async):** a unified interface over Canton trading venues, with
  each venue behind an adapter. Read: pools, markets, quotes, order books, balances. Write:
  swaps, orders, transfers. Handles key management, challenge-response auth, retries, and
  idempotency. `CantexAdapter` wraps the official `cantex_sdk` async client so auth, signing,
  and transport stay in the vendor SDK. The other three venues publish no Python SDK and are
  called directly over HTTP, with every integration point mapped to the source or the captured
  live response it came from.
- **Reference liquidity-bot engine:** grid and DCA strategy implementations that keep resting
  orders and positions on thin pools, which is the liquidity seeding the fund's charter names.
  Configurable pair, spacing, and budget, with state persisted and a dry-run mode.
- **AI-agent execution interface:** an MCP server exposing the connector as typed tools
  (get_quote, open_position, close_position, set_limits) with hard server-side risk caps
  (max position, max slippage, allow-listed pairs) so any MCP-capable agent framework can
  trade under constraints. This complements the read-only AI tooling already in the ecosystem.
- **Ops:** Dockerized, reproducible from a clean checkout, and documented end to end, from
  venue keys to a first bot running live.

### 3. Architectural Alignment

- **RFP 13, Payments and DeFi.** The RFP asks for open-source tooling, reference
  implementations, and standards for payments, DeFi, settlement, and liquidity workflows, and
  states that successful proposals should focus on reusable components that support multiple
  Canton applications rather than one-off application-specific work. That reusability is a
  measured property of the existing code rather than a design intention: one client already
  runs against four venues across three market structures, and porting it from the reference
  DEX's local demo mode to that venue's live Canton participant cost exactly two changes,
  both inside the adapter. The RFP's own list of prior examples includes the funded DEX reference
  implementation, whose Milestone 3 names this integration as its concrete reuse proof point,
  cited under Motivation below.
- CIP-0082 and CIP-0100 name "DeFi app(s) liquidity seeding" and developer tooling as funded
  categories. This is both in one artifact.
- Post-CIP-0047 and CIP-0104 tokenomics reward featured apps on real activity, and an open
  trading layer is the activity generator for every venue on the network.
- Consumes venue SDKs and the JSON Ledger API as designed. No protocol changes.

### 4. Backward Compatibility

No backward compatibility impact. Pure addition: new open-source components consuming
existing public interfaces.

---

## Milestones and Deliverables

Each milestone names one public script that a reviewer runs to check its claims. Where the
script does not exist yet, it is itself a deliverable of that milestone.

### Milestone 1: Venue connector across four venues and three market structures

- **Estimated Delivery:** complete at submission, verifiable on the day this PR merges (T+0)
- **Focus:** the unified client and its four adapters, auth and key handling, the offline test
  suite, the live verification scripts, and the documentation that lets a stranger reach a
  first executed trade.
- **Already built and public:**
  [github.com/olevasyliev/canton-trading-toolkit](https://github.com/olevasyliev/canton-trading-toolkit),
  Apache-2.0. Each adapter was validated against the live venue rather than against a
  specification. Cantex mainnet covers the full path: challenge-response auth, pool listing,
  quoting, and an executed swap confirmed on ledger with real funds. The DEX reference
  implementation on its hosted testnet covers swaps, the order lifecycle, RFQ with its
  best-execution receipt, and liquidity in and out. Ekiden covers perpetual market data across
  all three of its markets. Tradecraft covers mainnet AMM pricing, where the client prices
  swaps locally from pool state and agrees with the venue's own quote route on 45 of 45
  directions across all 23 pools, which is how that venue's undocumented per-leg fee model was
  measured rather than assumed.
- **Deliverables / Value Metrics:** the public Apache-2.0 repository; four adapters behind one
  interface; 52 offline tests that need no network and no credentials; five live verification
  scripts; `SOURCES.md` mapping every integration point to the upstream source or captured
  response; documentation carrying a reader from venue keys to an executed swap.
- **Verification (one command):** `python scripts/dexref_testnet_report.py --execute`, which
  allocates its own testnet parties and asserts its own results. Read-only companions:
  `python scripts/tradecraft_market_smoke.py`, `python scripts/ekiden_market_smoke.py`,
  `python scripts/live_smoke.py`. Offline: `pytest`.

### Milestone 2: Reference liquidity bots providing measurable depth

- **Estimated Delivery:** T+10 weeks
- **Focus:** the grid and DCA engine, its dry-run mode, a fee-aware minimum order size, and a
  mainnet pilot on at least one pool, with depth measured rather than asserted.
- **Design constraint (measured, not assumed):** on Cantex today the network fee is a flat
  0.95 CC on any trade below 500 CC and exactly zero from 500 CC up, charged on top of the
  sell amount, while the pool fee is a flat 0.05%. Orders below roughly 500 CC are therefore
  lossy by construction, independent of strategy. The engine derives its minimum order size
  from the live fee schedule rather than from a hardcoded constant, so the design survives a
  change to the threshold. Tradecraft's engine charges half the pool's total fee on each leg,
  so the realized fee is 0.299775% where 0.3% is published, and the same derivation absorbs
  that difference without a per-venue branch in the strategy.
- **Deliverables / Value Metrics:** the strategy engine in the public repository; a depth
  baseline for the pilot pool measured and published at milestone start; the same measurement
  repeated and published at milestone end; a written account of what the bots did to the pool
  and what it cost to do it.
- **Verification (one command, delivered by this milestone):**
  `python scripts/depth_report.py --pool <pair> --since <date>`, which reads the venue's own
  pool state, computes two-sided depth within a given band of mid over the pilot window, and
  prints the baseline and the current measurement side by side. The script is a deliverable of
  this milestone and ships in the public repository with the engine.

### Milestone 3: One strategy across market structures

- **Estimated Delivery:** T+15 weeks
- **Focus:** the connector layer is already venue-agnostic across four venues. What remains is
  the layer above it: the same strategy configuration running unmodified against an AMM and
  against an order book, which is where venue differences stop being cosmetic. Resting orders,
  cancellation, and partial fills exist on one structure and not the other, fee models differ
  per leg, and settlement latency differs by an order of magnitude. This milestone moves that
  reconciliation into the connector so that strategies stay venue-independent: an order
  lifecycle abstraction (place, amend, cancel, reconcile) that an AMM adapter satisfies by
  simulation and an order-book adapter satisfies natively, a normalized per-leg fee model, and
  a single position and inventory view across both structures.
- **Deliverables / Value Metrics:** the order lifecycle abstraction and the normalized fee
  model in the public repository; one strategy configuration file, unmodified, driving both an
  AMM venue and an order-book venue; a published run report showing the same strategy
  decisions taken on both structures and the venue differences absorbed below the strategy.
- **Verification (one command, delivered by this milestone):**
  `python scripts/strategy_parity_report.py --config <file>`, which runs one strategy config
  against an AMM adapter and against the order-book adapter, asserts that the strategy-level
  decisions match, and reports every difference the connector absorbed. The script is a
  deliverable of this milestone.

### Milestone 4: AI-agent execution interface (MCP)

- **Estimated Delivery:** T+20 weeks
- **Focus:** the MCP server with server-side risk caps, so an MCP-capable agent framework can
  trade on Canton under constraints it cannot exceed, plus the tutorial and case study that
  make it reachable by developers who have not used Canton before.
- **Deliverables / Value Metrics:** the MCP server in the public repository, exposing typed
  tools with enforced caps on position size, slippage, and the allowed pair list; a test suite
  in which every cap is exercised by an out-of-bounds call and rejects it; a published tutorial
  taking an agent-framework developer from zero to a constrained trade; a case study published
  with the Foundation; the operator report script that Milestone 5 is verified with.
- **Verification (one command, delivered by this milestone):**
  `python scripts/mcp_risk_report.py`, which starts the server, calls every exposed tool,
  drives each risk cap past its limit, and asserts that each breach is refused server-side
  rather than by the caller. The script is a deliverable of this milestone.

### Milestone 5: Verified independent operators

- **Estimated Delivery:** up to 26 weeks after Milestone 4 acceptance
- **Focus:** the toolkit in production hands other than the author's. This milestone pays nothing
  for engineering and nothing on a schedule. It pays per operator, only once the Committee has
  verified that a party independent of the author is running the toolkit against a Canton mainnet
  venue with its own funds.
- **Deliverables / Value Metrics:** up to three independent operators, each running the connector
  or the strategy engine on mainnet through the public packages; a published adoption report
  covering who integrated, which venues, what broke, and what changed in the toolkit as a result.
- **Funding:** 120,000 CC per qualifying operator, up to three, 360,000 CC in total. An operator
  qualifies when all of the following hold.
  - The operator does not control, is not controlled by, and is not under common control with the
    author, and is not the author's own pilot from Milestone 2.
  - The operator uses the public Apache-2.0 packages delivered under this grant, unmodified or
    with changes contributed back.
  - The operator executes at least ten orders or swaps through the toolkit on a Canton mainnet
    venue over a window of at least fourteen days, with its own funds.
  - The evidence is either the operator's own public statement (a comment, an issue, or a repository
    that depends on the package) or a confidential written attestation to the Canton Foundation
    naming the party, plus the venue-side record of the trades where the venue publishes one.
- **Verification (one command, delivered by Milestone 4):** `python scripts/operator_report.py
  --party <party>`, which reads the venue's public trade record for the named party over the
  window and prints the count, the venues, and the first and last execution. Where a venue publishes
  no per-party record, the operator's attestation stands and the report says so explicitly.

---

## Acceptance Criteria

The Tech and Ops Committee can evaluate each milestone by running the named script in the
public repository and reading its output on a machine the committee controls.

Engineering criteria below are countable, because a reviewer should not have to take a
grantee's word for whether something works. Within Milestones 1 to 4, adoption criteria are
deliberately qualitative, because a fixed count of external teams is not a thing a grantee can
deliver to a schedule, and stalling an engineering vote on one helps nobody. Adoption there is
evidence that the work was useful to somebody, in their words and in public. The count lives in
Milestone 5 instead, where it is paid per verified operator and nothing is owed until one exists.

### Milestone 1 (checkable on the day this PR merges)

Engineering:

- The repository is public under Apache-2.0 at `github.com/olevasyliev/canton-trading-toolkit`.
- Four venue adapters exist behind one client interface, covering three market structures
  (spot AMM, spot order book with RFQ, perpetual futures).
- `pytest` collects and passes 52 offline tests on a clean checkout, with no network access and
  no credentials.
- `python scripts/dexref_testnet_report.py --execute` completes with 58 assertions passed and
  0 failed against the hosted testnet, allocating its own parties.
- `python scripts/tradecraft_market_smoke.py` prices 45 of 45 directions across all 23 pools
  and reproduces the venue's own published quote from pool state alone.
- `python scripts/ekiden_market_smoke.py` returns markets, tickers, order book, recent trades,
  and funding history for all three perpetual markets.
- One swap executed on Cantex mainnet with real funds is recorded in the repository with the
  amounts it settled at.
- `SOURCES.md` maps every integration point to the upstream source or the captured live
  response it was derived from.

Adoption:

- The integration is cited by name as the reuse proof point in another grantee's accepted
  milestone, and the issue carrying its findings is closed as completed by that project's
  author. Both are already on the record and linked under Motivation.

### Milestone 2

Engineering:

- The strategy engine is in the public repository and runs in dry-run mode with no funds.
- The minimum order size is computed from the venue's live fee schedule at runtime, and a test
  proves it moves when the schedule moves.
- `python scripts/depth_report.py` exists in the repository and reproduces the published
  baseline and end-of-window measurements from public venue state.
- A depth baseline is published at milestone start and the same measurement, produced by the
  same script, is published at milestone end.

Adoption:

- A published pilot write-up covering what the bots did, what it cost, and what did not work.
- Documented feedback from at least one party outside the author, in their own public words,
  stating what they used the engine for or what it changed in their understanding of running
  strategies on Canton venues. Recorded as a link to their comment or issue, not as a claim in
  a report.

### Milestone 3

Engineering:

- One strategy configuration file, byte-identical, drives both an AMM venue and an
  order-book venue.
- `python scripts/strategy_parity_report.py` runs both and asserts that strategy-level
  decisions match, listing every venue difference absorbed by the connector.
- The order lifecycle abstraction and the normalized per-leg fee model are documented, with
  each venue's behavior mapped to the source or live response it was measured from.
- No venue-specific branch exists in the strategy layer, demonstrated by the parity report
  and reviewable in the diff.

Adoption:

- A published integration report for the parity work, in the same form as the report the
  Foundation has already run: a script that asserts its own results and can be rerun by a
  reviewer.
- Documented feedback, in public, from anyone who used the abstraction to reach a venue this
  project did not integrate, or who found it useful for understanding how the market
  structures differ.

### Milestone 4

Engineering:

- The MCP server is in the public repository and exposes the typed tools listed above.
- Every risk cap is exercised past its limit by `python scripts/mcp_risk_report.py`, and every
  breach is refused server-side.
- A tutorial is published that takes an agent-framework developer from an empty project to a
  constrained trade, and its steps are reproducible from a clean machine.

Adoption:

- A case study published with the Foundation.
- Documented public feedback from developers who connected an agent framework to the server,
  covering what they built or what the risk model taught them, linked to where they said it.

### Milestone 5

- Each operator meets every condition listed under the milestone, and the Committee has verified
  them from the evidence named there, not from the author's report.
- `python scripts/operator_report.py` reproduces the trade count and window for each operator
  whose venue publishes a per-party record.
- The adoption report is published in the repository and names each operator with their consent,
  or describes them without naming where the attestation was confidential.

### Across all milestones

- All code is open-source under Apache-2.0, reproducible from a clean checkout.
- Architecture notes are sufficient for a successor maintainer to take over.
- No milestone is accepted on the author's assertion alone. Every claim above has a command
  attached to it.

---

## GTM and Adoption

Adoption is the point of the work, so it is planned rather than hoped for.

- **The venues are the distribution channel.** Every venue on Canton needs flow it cannot
  generate itself. Each adapter ships with that venue's own users as its first audience, which
  is why the connector already covers four of them rather than one.
- **Working integrations travel further than announcements.** The reference DEX integration
  became that project's reuse proof point because the report was runnable, not because it was
  described well. Every later milestone ships the same way.
- **Agent frameworks are the second channel.** The MCP interface makes the toolkit reachable
  from any MCP-capable agent framework without those communities learning Canton first, and M4
  ships tutorials into those communities directly.
- **The docs are the funnel.** The M1 documentation target is time to a first executed trade
  for a stranger, because an integrator who cannot execute soon after reading never becomes an
  adopter.
- **Measurement.** Adoption is reported as public, linkable evidence that someone outside this
  project used the work or learned from it, not as downloads or stars.

---

## Maintenance

The toolkit is maintained past the grant, and the proposal is structured so that it can be.

- **Commitment.** The author maintains the repository after final release: dependency and
  venue-SDK updates, issue triage, and adapter fixes when a venue changes its API.
- **The author is also operator zero.** The same bots run on the author's own account against
  live venues, so breakage surfaces through use rather than through bug reports.
- **Designed for a successor.** Venue-specific code is confined to adapters behind one
  interface, so a new venue or a departed maintainer touches one file, not the core. Every
  integration point is mapped to the upstream SDK source in the repository.
- **No hidden dependencies.** Apache-2.0, standard Python packaging, Dockerized, reproducible
  from a clean checkout, and the offline suite runs with no venue access so regressions are
  caught without funds at risk.

---

## Funding

**Total Funding Request:** 1,200,000 CC

At the CC price measured on 2026-08-12, that is approximately **$120,000 USD**. The rate used
is $0.100 per CC, taken the same day from two independent venues rather than from a quoted
reference: the Tradecraft mainnet AMM mid at 0.0996 USD and the Ekiden perpetual index at
0.1000544 USD. USD equivalents elsewhere in this section use that same rate. It is stated for
scale, and the grant is denominated in CC.

The request splits into a development base of 840,000 CC (70%) across four engineering
milestones, and an adoption tranche of 360,000 CC (30%) that is payable only per verified
independent operator under Milestone 5. No part of the adoption tranche is owed on a schedule,
and none of it depends on the author operating a service for anyone.

### Payment Breakdown by Milestone

| Milestone | Payment | Share of total | USD at $0.100/CC | Trigger |
|---|---|---|---|---|
| M1: connector across four venues, verifiable at merge | 210,000 CC | 17.5% | ~$21,000 | Committee acceptance |
| M2: liquidity bots and measured depth | 245,000 CC | 20.4% | ~$24,500 | Committee acceptance |
| M3: one strategy across market structures | 175,000 CC | 14.6% | ~$17,500 | Committee acceptance |
| M4: MCP execution interface, final release | 210,000 CC | 17.5% | ~$21,000 | Committee acceptance |
| **Development base** | **840,000 CC** | **70%** | **~$84,000** | |
| M5: verified independent operators | 120,000 CC per operator, up to three | 30% | ~$12,000 each | Committee acceptance **and** verified operation |
| **Total** | **1,200,000 CC** | **100%** | **~$120,000** | |

**Milestone 1 (17.5%).** Four adapters across three market structures, the offline suite, the
live verification scripts, and the documentation are already built, public, and reproducible
by a reviewer today. The tranche pays for delivered and independently checkable work, and the
milestone can be voted on without waiting for anything to be written.

**Milestone 2 (20.4%).** The largest single engineering tranche: the strategy engine, its
fee-aware sizing, the measurement script, and a mainnet pilot that puts the author's own funds
on a live pool for a measured window.

**Milestone 3 (14.6%).** The order lifecycle abstraction, the normalized per-leg fee model, and
the parity report. Smaller than M2 because it builds on the four adapters that already exist,
larger than a thin adapter milestone because the reconciliation work sits in the core rather
than in one venue's file.

**Milestone 4 (17.5%).** The MCP server, its enforced risk caps and their test harness, the
tutorial, the operator report script, and the case study, plus final release and knowledge transfer.

**Milestone 5 (30%).** Paid per independent operator verified by the Committee, 120,000 CC
each, up to three. If nobody outside the author runs the toolkit on mainnet, this tranche is
never paid, and the fund has bought the development base alone. That is the intended shape: the
adoption risk sits with the grantee, not with the fund.

No engineering milestone carries more than 21% of the total, so no single vote is a referendum
on most of the grant.

### Infrastructure Line (inside the total)

Of the 840,000 CC development base above, **50,000 CC (approximately $5,000 at the anchor rate)** is
allocated to validator and receiving-party infrastructure rather than to engineering. This is
named separately, following the precedent of the merged Canton Payment Streams proposal, which
ring-fences a non-engineering line inside its own funding request rather than folding it into
a milestone. This line is not additional to the 1,200,000 CC total; it is carved out of the
development base and drawn against actual cost.

It exists for two concrete reasons:

1. **Milestone payouts are coupons that must be claimed.** A Development Fund milestone pays a
   DFM coupon, which a receiving party has to claim through running wallet automation, and an
   unclaimed coupon expires back to the pool. Standing up that receiving party is a
   prerequisite for being paid at all, not an optional convenience.
2. **The later milestones need a node of our own.** Tradecraft settles orders through Daml
   choices on the venue's own package, which requires a validator node, which is why the
   current adapter reads and prices but cannot trade. The same requirement applies to the write
   paths this proposal has to reach in M2 and M3.

The amount is built from measured numbers rather than a round figure. Cost basis, priced on
2026-08-13:

- **Validator hosting, 12 months: roughly $600.** The documented low-activity production tier
  (2 CPU / 8 GB for validator and participant, plus a small database) fits commodity European
  hosting the author already operates.
- **Synchronizer traffic: roughly $1,500.** Live parameters read from the network's
  AmuletRules contract on 2026-08-13: extra traffic is priced at $60.0 per MB, the free tier
  is 200,000 bytes per 20-minute window, and the minimum top-up is 200,000 bytes (about $12).
  Under CIP-0042 the Super Validators hold the effective cost near $1 per typical Canton Coin
  transfer. Claiming a milestone coupon fits inside a single free-tier window, so payout
  traffic itself is close to free. The budget covers settlement testing and demo runs on the
  write paths in M2 through M4.
- **Receiving-party setup: roughly $1,000.** Entity or custodial onboarding, whichever route
  the Foundation confirms for this grant.
- **The remainder is headroom against CC price movement**, since the line is denominated in
  CC and spent in USD.

Trading traffic in the M2 pilot is not billed to this line or to the fund: pilot orders
execute through venue-hosted parties, and that synchronizer traffic is carried by the venue's
own validator. This proposal does not fund market making through our own node.

### Volatility Stipulation

The development term is under 6 months. Should it extend beyond 6 months due to
Committee-requested scope changes, the remaining development milestones will be renegotiated per
the standard volatility clause. Milestone 5 is an outcome milestone verified over the 26 weeks
after Milestone 4 acceptance; any adjustment to its unpaid tranches for material CC price movement
is agreed between the author and the Committee before payment.

---

## Co-Marketing

- Announcement coordination with the Foundation on the M1 and M4 releases
- Technical blog on the M2 pilot: what the first open liquidity bots on Canton actually did to
  a live pool, including the costs
- Tutorial content for agent-framework communities at M4

---

## Motivation

This proposal follows the pattern the committee has already stated it funds. On a prior
proposal a committee member set the bar plainly: build a component out of your own commercial
interest, prove it, and request a grant only once there is concrete demand from others to
reuse it, then generalize, open-source, and maintain it. That is this proposal. The toolkit
was built without a grant, it runs against four venues across three market structures through
one client, and the ask is to turn a working single-integrator tool into shared, maintained
infrastructure.

**The Foundation has already run this toolkit and checked its output.** Reviewing another
grantee's milestone on 2026-08-12, Canton Foundation reviewer Jatin Pandya recorded: "Reuse
proof point verified, ran the toolkit's own integration report via `python
scripts/dexref_testnet_report.py --execute` with 58 passed tests and 0 failed in exercising
choices on testnet integration."
([comment](https://github.com/canton-foundation/canton-dev-fund/issues/313#issuecomment-5264482087))
The verification path attached to every milestone above is that same mechanism, applied
forward: a named public script that allocates its own resources, asserts its own results, and
can be rerun by anyone who wants to check the claim instead of trusting it.

**The reuse is documented in a funded grantee's own milestone, not in this proposal's prose.**
The connector's integration against the Canton DEX reference implementation ran over six rounds
against that project's hosted testnet. The resulting report was filed as
[issue #126](https://github.com/srikanth-bitdynamics/Canton-Dex-Reference-Implementation/issues/126)
in that repository, the findings were fixed, and the project's author closed it as completed.
His Milestone 3 submission names this integration as the concrete reuse proof point that
milestone's acceptance criteria required, describing it as an external developer integrating
the DEX as an adapter in the open-source toolkit and exercising quotes, swaps, orders,
matching, RFQ, and liquidity against the hosted testnet without operator credentials
([submission](https://github.com/canton-foundation/canton-dev-fund/issues/313#issuecomment-5159349963)).

The same pattern produced the Tradecraft integration. That venue publishes no Python SDK and
no fee documentation, so the client prices swaps locally from pool state and was checked
against the venue's own quote route on 45 of 45 directions across all 23 pools. The agreement
is what established the fee model, half the pool's total fee charged on each leg, rather than
the model being assumed and the numbers being explained afterwards.

Design partners:

- _This section is filled only from teams' own public comments on this PR, and stays empty
  until they arrive._

Beyond named partners, every trading venue on Canton shares one bottleneck: liquidity and
activity arrive only through manual UIs or private in-house tooling. An open trading layer
benefits current and future venues, since they all need programmatic flow. It benefits the
tokenomics, since featured-app rewards are metered on real activity per CIP-0104. And it
serves the stated fund goal of DeFi liquidity seeding. The addressable set is every live DeFi
venue, currently a single-digit count, which is exactly why the layer should exist before the
count grows, plus any team building funds or structured products on top.

---

## Rationale

Extending existing components was considered and rejected for cause:

- **Venue SDKs (for example Cantex's)** are single-venue by design, so a strategy written
  against one is locked to it. The connector wraps them rather than replacing them, which is
  why the Cantex adapter delegates auth, signing, and transport to the official SDK instead of
  reimplementing them.
- **General ledger SDKs (the funded Rust and C# efforts)** target ledger primitives, not
  trading workflows such as quotes, position lifecycle, and risk limits. Different layer of
  the stack.
- **The funded DEX reference implementation** is a venue, and this toolkit is the demand-side
  infrastructure venues need in order to be used. Complementary, not overlapping, which is
  precisely why that project cites this integration rather than duplicating it.
- **Existing AI tooling on Canton** (insight copilots, generic asset-operation MCP gateways)
  is read-only or transfer-level. None offers trade execution with enforced risk constraints,
  which is the piece agent frameworks are missing.

Default guidance is to extend what exists, and this proposal does exactly that: it composes
existing SDKs, venues, and the Ledger API into the missing layer, introducing no parallel
replacements.
