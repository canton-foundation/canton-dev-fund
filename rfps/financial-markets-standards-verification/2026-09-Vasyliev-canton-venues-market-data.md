# Canton Venues: An Independent Execution Benchmark for Canton Trading Venues

A free, open comparison of what every Canton venue returns for the same trade after fees, how far
Canton prices sit from outside markets, and the history of both, with the connector, schema and key-free
API behind it.

**Organization:** Individual
**Author / Primary Contact:** Oleksii Vasiliev, independent developer ([github.com/olevasyliev](https://github.com/olevasyliev))
**Status:** Submitted
**Created:** 2026-07-14
**Updated:** 2026-10-10 (scope revised from "Canton Algorithmic Trading Toolkit"; see the revision note in the PR thread)
**Proposal Type:** RFP-aligned
**RFP / Roadmap Area:** RFP 13, Payments and DeFi, under Financial Markets, Standards & Verification ([2026-2028 roadmap](https://github.com/canton-foundation/canton-dev-fund/blob/main/2026-2028-strategic-roadmap.md)). Also serves RFP 11 (public verifiability, the "public aggregates of activity and value" tier) and RFP 20 (network-wide observability from public sources only).
**Champion:** `Needs Champion`
**Total Funding Request:** 1,200,000 CC, of which 600,000 CC (50%) is payable only per verified independent adopter
**Project Duration:** 3 months of development, plus an adoption window of up to 26 weeks after Milestone 3 acceptance
**Label:** defi-liquidity (SIG: DeFi Protocols & Liquidity; also relevant: financial-workflows-composability)

---

## Abstract

Canton has eleven trading venues this project knows of, across three market structures. Each reports
its own volume, liquidity and prices in its own format, and the community dashboards we know of list
the venues side by side without comparing what the same trade returns on each. A trader, a wallet or
a treasury has no neutral way to see which venue gives the most back at their size, or how far a
Canton price sits from the outside market. [Canton Venues](https://cantonvenues.com), live since
2 October 2026, is that comparison. It reads seven venues every five minutes through one open
connector and ranks them on the same trade at $100, $1K, $10K and $50K, after pool fees, price impact
and each venue's network fee. It also tracks Canton prices against outside markets, publishes it all
as a key-free JSON API and an MCP server, and builds a page and a share card per venue. Venues have
used it in public: Cantex and Tradecraft each published their own ranking from it under their own
names, and Cantex endorsed this application on this PR as "an open component to integrate with".

The grant makes this independent benchmark a maintained public asset. A published schema and adapter
specification let any venue add itself and be ranked on the same method. The hourly execution record,
kept since 8 October 2026 and not yet public, becomes an open dataset. The MCP server becomes an
installable package, and the whole is maintained for twelve months. Half of the request is payable
only when independent parties have used it.

Every milestone is checked by running a named script from the public repository. The Canton
Foundation has already verified a milestone on another grant by running this project's own report
script, cited under Motivation.

---

## Specification

### 1. Objective

Give Canton one neutral, reproducible answer to two questions, published openly: which venue gives
the most back for this trade at this size after fees, and how far is a Canton price from the outside
market. The means are a connector that reads every venue with public market data, a common schema
those readings are published in, an open history, and a live reference implementation anyone can run,
so that no wallet, aggregator or treasury has to integrate each venue separately to answer them.

### 2. What Already Exists vs. What Is Net-New

**Already built, public and running** (Apache-2.0, [github.com/olevasyliev/canton-venues-sdk](https://github.com/olevasyliev/canton-venues-sdk), v0.3.0):

- **Best execution across venues:** for 19 token pairs, the same trade in both directions at $100,
  $1K, $10K and $50K, priced on every venue from its live pool reserves with the venue's own formula
  or from its order book, and ranked after each venue's network fee. Network fees are kept in one
  table with their basis stated: measured from live quotes (Cantex), documented by the venue
  (OneSwap, Tradecraft) or assumed (Temple, Rocky, Pool Party). A best-price claim is made only
  where it survives the least favourable reading of that table.
- **Canton against outside markets:** how far Canton prices sit from outside prices (CBTC against BTC,
  cETH against ETH, the gold and silver tokens, CC against the global CC price) and every stablecoin
  against $1, with the venue behind each figure; plus a round-trip scan that shows where buying on one
  venue and selling on another still clears after network cost.
- **History:** an hourly record of best execution per pair, side and size, before and after fees,
  kept since 8 October 2026, each sample carrying the fee table it was netted with.
- **Venue connector:** one Python client with nine adapters behind one interface, covering eight
  venues: Cantex (a public-data adapter and an authenticated one), Tradecraft, OneSwap and Pool
  Party (spot AMMs), Temple and Rocky (spot order books), Rocky and Ekiden (perpetuals), and the
  funded DEX reference implementation (order book and RFQ, hosted testnet). Every integration point
  is mapped in `SOURCES.md` to the upstream source or the captured live response it came from.
- **Canton Venues, the reference implementation** (`examples/canton_venues` in the same repository):
  a collector that reads seven mainnet venues every five minutes and publishes a public JSON API
  (venues, tokens, pools, perps, execution, venue history); a dashboard; a page and share card per
  venue; a rolling weekly card; a Telegram channel; an MCP server with ten read-only tools, hosted at
  `cantonvenues.com/mcp` and answering from the same JSON, so an agent's numbers match the site.
  Today it covers 33 tokens, 57 pools and 9 perpetual markets.
- **Tests and verification:** 200 tests pass on a clean checkout without venue credentials; live
  read-only smoke scripts per venue.

**Net-new under this grant:**

- A versioned **venue schema** (venue, pool, book level, perpetual market, quote and execution row) and
  an **adapter specification with a conformance script**, so a venue joins the benchmark by submitting
  one adapter file or by publishing a conforming feed, with no change to the core, and is ranked on
  the same method as everyone else.
- The hourly history published as an **open dataset**, with a script that rebuilds any published
  card from it.
- The MCP server as an installable package with tool schemas tied to the same data schema, and an
  **adoption report script** the adoption milestone is verified with.
- A twelve-month maintenance commitment and a successor path.

### 3. Implementation Mechanics

- **Connector (Python, async):** one `VenueAdapter` interface for pools, quotes and swaps, one
  `MarketDataAdapter` interface for order books and perpetuals. Venue-specific code lives in one
  file per venue. Pools are priced from live reserves with each venue's own formula; order books from
  their books. The Cantex adapter wraps the official `cantex_sdk`; the others call public HTTP APIs
  directly. Temple's book is read with the author's own read-only API key and is marked as such on
  the site.
- **Collector and API:** one loop writes static JSON under `/api/v1/`, refreshed every five minutes,
  served by nginx. No database, no keys in the public path. The deployment is reproducible from the
  repository's deploy script.
- **Schema and conformance (M2):** JSON Schema files under `schema/v1/`, a `scripts/conformance.py`
  that runs an adapter against its live venue and checks every record against the schema, and a
  feed mode in which the collector reads a venue-published JSON document instead of an adapter.
- **History and agents (M3):** daily publication of the hourly series as JSONL under
  `/api/v1/history/`, `scripts/history_report.py` to rebuild a period from it, the MCP server on
  PyPI, and `scripts/adoption_report.py` reading the server's request log in aggregate (no personal
  data) plus the registry of self-listed venues.

### 4. Architectural Alignment

- **RFP 13, Payments and DeFi** asks for open-source tooling, reference implementations and
  standards for DeFi and liquidity workflows, and for reusable components that support multiple
  Canton applications rather than one-off work. Execution quality across venues is the input every
  swap, router and treasury workflow needs, and this is one component already read by multiple
  parties: the venues themselves, who republish it, and the aggregators and treasuries a venue named
  on this PR.
- **RFP 11, Public verifiability** lists, as its simplest tier, standardized tooling for publishing
  public aggregates of activity and value so that markets get reliable signals of price, demand and
  volume. Canton Venues publishes exactly those aggregates per venue, computed from the venues' own
  public data with the method stated on every page.
- **RFP 20, Indexers and observability** asks applicants to say which data they need and what
  happens if protocol metadata stops being public. This project reads only each venue's public
  market-data API (plus one read-only venue key held by the author). It uses no mediator or
  protocol-level metadata, so it is unaffected by changes to Canton's privacy boundaries.
- **The roadmap's vision** names "AI integration standards like MCP make on-chain data available
  directly to agentic tooling". The MCP server is that, for venue market data, running today.
- Consumes venue APIs as designed. No protocol changes.

### 5. Backward Compatibility

No backward compatibility impact. Pure addition: open-source components consuming existing public
interfaces. The existing `/api/v1/` responses are frozen under the schema in M2; later changes go to
`/api/v2/`.

---

## Milestones and Deliverables

Each milestone names one public script that a reviewer runs to check its claims. Where the script
does not exist yet, it is itself a deliverable of that milestone.

### Milestone 1: The execution benchmark and its connector, live across seven venues

- **Estimated Delivery:** complete at submission, verifiable on the day this PR merges (T+0)
- **Focus:** the net-of-fees best-execution benchmark and the premium board, with the connector
  (nine adapters), the collector, the public API, the per-venue pages and cards, the MCP server and
  the fee table behind them, all public and running.
- **Deliverables / Value Metrics:** the Apache-2.0 repository; nine adapters behind one interface
  across three market structures; cantonvenues.com reading seven mainnet venues every five minutes;
  the JSON API and the MCP server answering from the same data; 200 passing tests; `SOURCES.md`.
- **Verification (one command):** `pytest` on a clean checkout. Live: `python
  examples/canton_venues/collect.py --out <dir> --once` writes the full API from the venues'
  public endpoints with no credentials (Temple's order book additionally needs a read-only Temple
  API key; without one Temple is listed with its volume only), and the committee can compare its
  output with the public `/api/v1/` files. The Foundation's earlier run of `python
  scripts/dexref_testnet_report.py --execute` (58 assertions, cited under Motivation) still
  reproduces.

### Milestone 2: Venue schema and self-listing, so more venues join the benchmark

- **Estimated Delivery:** T+6 weeks
- **Focus:** turn the connector's internal models into a published, versioned schema, and make
  listing a venue something the venue can do itself.
- **Deliverables / Value Metrics:** `schema/v1/` (venue, pool, book level, perpetual market, quote,
  execution row; versioned); an adapter specification document; `scripts/conformance.py` passing on
  all nine adapters; feed mode, in which a venue publishes one conforming JSON document at a URL and
  is listed without an adapter; a "list your venue" guide; `/api/v1/` frozen under the schema.
- **Verification (one command, delivered by this milestone):** `python scripts/conformance.py
  --all`, which runs every adapter against its live venue, validates each record against the
  schema, and exits non-zero on the first violation.

### Milestone 3: Open execution history, agent access and the adoption report

- **Estimated Delivery:** T+12 weeks
- **Focus:** publish the series that only this project has been recording, make the agent interface
  installable, and deliver the script the adoption milestone is verified with.
- **Deliverables / Value Metrics:** the hourly best-execution series published daily as JSONL under
  `/api/v1/history/` from its first sample on 8 October 2026, with the fee table per sample; the
  MCP server on PyPI with tool schemas derived from `schema/v1/`; a published method note per
  metric; `scripts/adoption_report.py`; the maintenance window starts at acceptance.
- **Verification (one command, delivered by this milestone):** `python scripts/history_report.py
  --since <date> --until <date>`, which rebuilds a period's figures from the published JSONL and
  reproduces the card the site published for that period.

### Milestone 4: Verified independent adopters

- **Estimated Delivery:** up to 26 weeks after Milestone 3 acceptance
- **Focus:** the component in hands other than the author's. This milestone pays nothing for
  engineering and nothing on a schedule. It pays per adopter, once the Committee has verified one.
- **Funding:** 150,000 CC per qualifying adopter, up to four, 600,000 CC in total. An adopter is
  either of the following, and in both cases does not control, is not controlled by, and is not
  under common control with the author, and has not been paid by the author.
  - **A venue that integrated itself:** its team submitted the adapter (merged) or publishes a
    conforming feed, and the venue says so in public (a comment on this PR, an issue, or its own
    channel).
  - **An independent application on mainnet** (a wallet, an aggregator or router, a treasury or
    analytics tool, an agent product) that reads the API, the SDK or the MCP server in production
    for at least thirty days, evidenced by the team's public statement or a public dependency on the
    package, plus the request log in aggregate.
- **Deliverables / Value Metrics:** up to four adopters; a published adoption report naming each
  with their consent, covering what they integrated, what broke, and what changed in the component
  as a result.
- **Verification (one command, delivered by Milestone 3):** `python scripts/adoption_report.py
  --since <date>`, which lists self-listed venues from the registry and distinct API and MCP
  consumers from the aggregate request log over the window, and prints the evidence links recorded
  for each adopter.

---

## Acceptance Criteria

The Tech and Ops Committee can evaluate each milestone by running the named script in the public
repository and reading its output on a machine the committee controls. No milestone is accepted on
the author's assertion alone.

### Milestone 1 (checkable on the day this PR merges)

- The repository is public under Apache-2.0 at `github.com/olevasyliev/canton-venues-sdk`.
- Nine venue adapters exist behind one client interface, covering spot AMMs, spot order books and
  perpetual futures.
- `pytest` collects and passes 200 tests on a clean checkout with no venue credentials.
- `python examples/canton_venues/collect.py --out <dir> --once` completes without credentials and
  writes venues, tokens, pools, perps and execution JSON for seven mainnet venues (Temple priced
  only when a read-only Temple key is supplied, as on the reference deployment).
- cantonvenues.com serves the same files under `/api/v1/` and the MCP server under `/mcp`, with a
  page and a share card per venue.
- `SOURCES.md` maps every integration point to its upstream source or captured response.

Adoption, already on the record (links under Motivation): a venue's endorsement on this PR; two
venues' own publications of the project's figures; the Foundation's run of the project's report
script; the DEX reference implementation's citation of the integration in its accepted milestone.

### Milestone 2

- `schema/v1/` exists, is versioned, and every `/api/v1/` document validates against it.
- `python scripts/conformance.py --all` passes for all nine adapters against their live venues.
- Feed mode: a venue-published JSON document at a URL, conforming to the schema, is listed by the
  collector with no code change, demonstrated with a test fixture and documented in the guide.
- The adapter specification and the listing guide are published in the repository.

### Milestone 3

- `/api/v1/history/` publishes the hourly series daily as JSONL, from 8 October 2026 onward, each
  sample carrying its fee table.
- `python scripts/history_report.py` rebuilds a named period and matches the card the site
  published for it.
- The MCP server installs from PyPI and its tool schemas are generated from `schema/v1/`.
- `python scripts/adoption_report.py` exists and runs against the reference deployment.

### Milestone 4

- Each adopter meets every condition listed under the milestone, and the Committee has verified
  them from the evidence named there, not from the author's report.
- The adoption report is published in the repository.

### Across all milestones

- All code is open-source under Apache-2.0, reproducible from a clean checkout, deployable with the
  script in the repository.
- Every claim above has a command attached to it.

---

## Adoption Plan

- **The venues distribute it.** Each venue gets a page and a share card with its strongest measured
  fact, computed the same way for every venue. In the first week two of seven venues published
  those figures under their own names. Every venue added by M2's self-listing gets the same.
- **The consumers are named.** Aggregators and routers, treasuries, wallets and agent products all
  need one neutral comparison across venues, and the data under it, before they can route or price
  anything across venues; a venue said so on this PR. M2 gives them one schema; M3 gives agents an
  installable package.
- **Evidence, not counts.** Adoption is recorded as links to what adopters said and did in public,
  and paid only in M4 against verified adopters.

---

## Maintenance

- **Commitment.** The author maintains the repository and the reference deployment for twelve months
  after Milestone 3 acceptance: adapter fixes when a venue changes its API, schema versioning,
  dependency updates, issue triage.
- **Runs unattended today.** The collector, cards, channel posts and alerts run from systemd timers
  on one small server with a five-minute refresh, and have since 2 October 2026.
- **Designed for a successor.** Venue code is confined to one file per venue behind one interface;
  the deployment is a script in the repository; every integration point is mapped to its source.
  Anyone can run a copy of the reference deployment from a clean checkout.
- **No hidden dependencies.** Apache-2.0, standard Python packaging, static JSON over nginx, no
  database, no paid data source.

---

## Funding

**Total Funding Request:** 1,200,000 CC

Stated for scale: about $146,000 at the CC price the site measured on 9 October 2026 ($0.122 per
CC, from Canton's own stablecoin pools). The grant is denominated in CC.

The request splits into a development base of 600,000 CC (50%) across three milestones, of which
the first is already delivered and checkable today, and an adoption tranche of 600,000 CC (50%)
payable only per verified independent adopter under Milestone 4. If nobody outside the author ever
integrates, the adoption tranche is never owed, and the fund has paid 600,000 CC for a public,
Apache-2.0 component that is already in use, plus its standard, its open history and twelve months
of maintenance.

### Payment Breakdown by Milestone

| Milestone | Payment | Share of total | Trigger |
|---|---|---|---|
| M1: the execution benchmark and its connector, live across seven venues (delivered) | 240,000 CC | 20% | Committee acceptance |
| M2: venue schema and self-listing | 180,000 CC | 15% | Committee acceptance |
| M3: open history, agent access, adoption report | 180,000 CC | 15% | Committee acceptance |
| **Development base** | **600,000 CC** | **50%** | |
| M4: verified independent adopters | 150,000 CC per adopter, up to four | 50% | Committee acceptance **and** verified adoption |
| **Total** | **1,200,000 CC** | **100%** | |

**Milestone 1 (20%)** pays for delivered, independently checkable work: nine adapters, the collector,
the API, the MCP server, the per-venue pages and the net-of-fees method, built without a grant and
running in public for a week with venues already republishing its output.

**Milestone 2 (15%)** is the standard: schema, adapter specification, conformance, feed mode, guide.

**Milestone 3 (15%)** is the open history, the installable agent package, the adoption report
script, and the start of the maintenance window.

**Milestone 4 (50%)** is paid per adopter the Committee has verified. The adoption risk sits with
the grantee, not with the fund.

### Volatility Stipulation

The development term is three months. Should it extend beyond six months due to Committee-requested
scope changes, the remaining development milestones are renegotiated per the standard volatility
clause. Milestone 4 is an outcome milestone verified over the 26 weeks after Milestone 3 acceptance;
any adjustment to its unpaid tranches for material CC price movement is agreed between the author
and the Committee before payment.

---

## Co-Marketing

- Announcement coordination with the Foundation on M2 (the standard) and M3 (the open dataset).
- A short write-up with the Foundation on what a week of cross-venue best-execution data on Canton
  shows, from the published series.

---

## Motivation

**It is already used, and by the parties it is for.**

- Cantex, a venue the project reads, endorsed this application on this PR on 8 October 2026,
  calling the analytics "invaluable resources for the community" and the project "an open component
  to integrate with" for aggregators and treasuries
  ([comment](https://github.com/canton-foundation/canton-dev-fund/pull/778#issuecomment-6060563655)).
- Cantex published its own chart from the project's best-execution data on 5 October 2026
  ([post](https://x.com/cantex_io/status/2107116473806111134)), and Tradecraft published a video
  of its own per-token ranking from the same data on 9 October 2026, citing the site as its source
  ([post](https://x.com/tradecraftfi/status/2108619246746145167)), each under the venue's own name.
- The forum thread announcing the site is open for feedback
  ([forum.canton.network](https://forum.canton.network/t/canton-venues-open-market-data-across-canton-dexes-feedback-welcome/9268)).

**The Foundation has already run this project's code and checked its output.** Reviewing another
grantee's milestone on 2026-08-12, Canton Foundation reviewer Jatin Pandya recorded: "Reuse proof
point verified, ran the toolkit's own integration report via `python scripts/dexref_testnet_report.py
--execute` with 58 passed tests and 0 failed in exercising choices on testnet integration"
([comment](https://github.com/canton-foundation/canton-dev-fund/issues/313#issuecomment-5264482087)).
The verification attached to every milestone above is that same mechanism applied forward.

**The reuse is documented in a funded grantee's own milestone.** The connector's integration against
the Canton DEX reference implementation ran over six rounds against that project's hosted testnet;
the report was filed as
[issue #126](https://github.com/srikanth-bitdynamics/Canton-Dex-Reference-Implementation/issues/126)
there, the findings were fixed, and the project's author closed it as completed. His Milestone 3
submission names this integration as the reuse proof point its acceptance criteria required
([submission](https://github.com/canton-foundation/canton-dev-fund/issues/313#issuecomment-5159349963)).

**This follows the pattern the committee has said it funds.** On another proposal, Shaul Kfir
wrote that teams should build components when they have a commercial reason and open-source them
when they have a reason to, and that a grant fits once there is "concrete demand by others to
reuse it", as when BitSafe built the Decentralization Manager itself and requested a grant "to
enhance/generalize/open-source/maintain it" only after it was "proven out"
([comment](https://github.com/canton-foundation/canton-dev-fund/pull/162#issuecomment-4843166738)).
That is the order here. The connector, the site, the API and the MCP server were built without a
grant, and venues have since used them in public (above); the ask is the standard, the open
history and the maintenance that make it everyone's. The demand evidence is the venues' own
posts and endorsement, and Milestone 4 pays only when more of it is verified.

---

## Rationale

- **Why not each venue's own API?** Each venue publishes in its own format, and none of them can
  compare itself with the others. A consumer integrating venues one by one rebuilds this connector
  privately every time; a venue listing itself once through a common schema is read by every
  consumer.
- **Relation to the Kaiko Data Standard** (approved under RFP 12): that standard defines how a data
  point is published on the ledger in Daml. This project is the off-ledger layer that reads venue
  market data and compares it; a conforming feed could later be published on-ledger through such an
  interface. Different layer, no overlap.
- **Relation to CCTools** (approved in April): CCTools is a community toolkit (ecosystem directory,
  portfolio, governance, earn). As of 10 October its Markets Hub lists TVL, volume and APR for Tradecraft,
  Pool Party and OneSwap pools, Temple and Alpend deposits, Ekiden perpetuals and CC prices by exchange,
  and its REST API needs a key. It does not list Cantex or Rocky, and it does not compare what each venue
  returns for the same trade. Canton Venues does that comparison, after each venue's network fee, and
  reads Cantex, Temple and Rocky books and pools, keeps the history, and serves it without a key. The two
  are complementary, and CCTools is a natural consumer of the open API.
- **Relation to the previous scope of this PR.** The connector is unchanged and remains Milestone 1.
  The execution layer the earlier text proposed on top of it (liquidity bots and a trade-execution
  MCP) is withdrawn from this request and deferred to a separate proposal once there is a public ask
  for it; what venues and consumers have said in public they use is the comparison and the data under it.
- **Why a standard rather than more adapters?** Four of the eleven venues known to the project
  cannot be read without credentials or are not yet live. Self-listing lets a venue join on its own
  terms instead of waiting for the author to integrate it.
