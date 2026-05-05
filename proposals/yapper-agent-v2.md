## Development Fund Proposal

**Author:** IndoYaps / Yapper Agent Team (contact@yapperagent.xyz)
**Status:** Draft
**Created:** 2026-05-05
**Label:** dapp-integration
**[Champion](https://github.com/canton-foundation/canton-dev-fund/blob/main/sig-directory.md):** Nguyan Vinh ([@v9n](https://github.com/v9n))

**Platform:** yapperagent.xyz (LIVE)
**Community:** 15,000+ creators - X, Discord, Telegram  
**Partnerships:** Bitget Wallet, Numbers Protocol  
**Category:** Community & Ecosystem Growth  
**Duration:** 6 months - 3 milestones  
**Requested Funding:** 400,000 CC (~$59,600 USD at current price)

---

## Abstract

Yapper Agent ([yapperagent.xyz](https://yapperagent.xyz), [hnfdm/yapper-agent](https://github.com/hnfdm/yapper-agent)) is a live crypto-native micro-task marketplace serving 15,000+ Web3 creators across Southeast Asia. This proposal funds two complementary initiatives over 6 months:

1. **Canton Coin (CC) integration** as a native payment option on Yapper Agent — the first micro-task marketplace to support CC, turning the existing 15k+ community into active CC users
2. **SEA Creator & Builder Onboarding Roadshow** — an Indonesia-pilot event series (4–5 cities) co-organized with established local builder communities, combining meetups, Canton workshops, mini hackathons, and creator-builder panels

The result is a full-stack Canton adoption loop targeting both segments simultaneously: creators onboard through earning CC on Yapper Agent; builders onboard through hands-on workshops and hackathons. Together they form a self-reinforcing Canton ecosystem in Indonesia.

---

## Specification

### 1. Objective

Canton Network lacks grassroots adoption among two critical segments in Southeast Asia: Web3 content creators and independent blockchain builders. Most Canton Dev Fund proposals address institutional infrastructure, leaving both segments without a practical entry point to the Canton ecosystem.

Indonesia is the region's largest crypto market and a top-5 global crypto adoption country, with organized builder groups and a thriving creator economy. These communities are ready to adopt new technology, but Canton has no presence or touchpoint with them today.

Yapper Agent bridges both gaps: the platform already serves creators at scale and has existing relationships with established Web3 builder communities that can be activated for on-the-ground events, starting in Indonesia.

### 2. Implementation Mechanics

**Part 1 — Canton Coin Integration (Months 1–3)**

- **CC Wallet** — Canton wallet auto-created on sign-up via X account (Reown AppKit + Canton Ledger API with Keycloak JWT authentication)
- **CC Payment Rails (existing)** — job posters denominate in CC; live CC/USD price fetched from CoinMarketCap (10-min cache, ceiling-rounded to 0.1 CC); DAML `JobEscrow` contract created server-side on job post; `ClaimReward` exercises CC transfer to creator on proof verification; `CancelEscrow` handles client refunds
- **Automated Verification (existing)** — ScrapeBadger API validates tweet URLs, follower counts, and engagement metrics before credits are issued; admin dashboard for batch approvals across both payment chains
- **Creator Dashboard** — CC balance, claim button, and transaction history UI
- **Education Layer** — in-app Canton onboarding content, tooltips, and FAQ for the 15k+ community
- **Open-source module** — CC wallet + payment rails published Apache-2.0 on GitHub at M1 delivery; reusable by any Canton platform building micro-task or escrow flows
- **Agent lanes (existing)** — x402 (`/.well-known/x402`) and MCP (`/mcp` JSON-RPC 2.0) endpoints for AI agents to post jobs autonomously; CC integration extends these lanes to settle in Canton Coin

**Stack:** Next.js 15 (App Router), Reown AppKit, Supabase PostgreSQL, Tailwind CSS. Canton: Ledger API + Keycloak JWT + DAML. Solana: Anchor escrow program (existing, unchanged).

**Part 2 — SEA Creator & Builder Onboarding Roadshow — Indonesia Pilot (Months 3–6)**

A 4–5 city event series co-organized with established local builder and creator communities. Each event is a full-day program:

| Format | Description |
|---|---|
| Meetup & Networking | Creator × builder cross-community intro and Canton ecosystem overview |
| Canton Workshop | Hands-on: Canton wallet setup, first CC transaction, DAML basics |
| Mini Hackathon | 2–4 hour build sprint — teams build a Canton integration or CC-powered feature; prize pool in CC |
| Panel Discussion | Creator × builder dialogue on Canton's creator economy potential; live Q&A |

- Cities: Jakarta, Surabaya, Bandung, Yogyakarta, Medan (phased rollout — 2 cities first in M2, remaining in M3)
- Target: 100 attendees per city (50% creators, 50% builders); 400–500 total
- Co-branded with Canton Foundation — official Canton presence at every event
- Full documentation: event recaps, project showcases, on-chain wallet activation metrics

### 3. Architectural Alignment

| Canton Priority | Yapper Agent Contribution |
|---|---|
| Ecosystem growth & adoption | 15,000+ online creators + 400–500 offline attendees onboarded to CC |
| Southeast Asia expansion | Indonesia pilot — top-5 global crypto market — as launchpad for broader SEA presence |
| App Building & Developer Experience | CC integration open-sourced Apache-2.0; x402 + MCP lanes extended to CC; hackathons generating 10–20 Canton integration projects |
| Canton Coin utility & tx volume | Direct CC micro-task payouts across 15k creator base + hackathon CC prize pool |
| Developer tooling / reference impl. | Open-source CC wallet + payment module reusable by any Canton platform |
| Marketing & developer relations | Aligns with CIP-0100: developer marketing pulling builders into the ecosystem |

Directly aligns with CIP-0082 ("dev tools, reference implementations, critical infra") and CIP-0100 ("developer marketing activities that pull more developers into the ecosystem").

### 4. Backward Compatibility

No backward compatibility impact. New CC integration layer added to the existing platform. All USDC/Solana payment functionality remains fully unchanged.

---

## Milestones and Deliverables

### Milestone 1: Canton Wallet & Payment Rails (Month 1–2)
- **Estimated Delivery:** 2026-07-05
- **Focus:** Live CC payment rails on testnet; open-source module published.
- **Deliverables / Value Metrics:**
  - Canton wallet auto-created on user sign-up via X account
  - Job posters can select CC as payment denomination; CC transferred on proof verification via `ClaimReward`
  - ≥50 CC-paid jobs completed end-to-end on testnet (verified)
  - Integration code open-sourced on GitHub (Apache-2.0) with developer documentation

### Milestone 2: Creator Dashboard + Online Onboarding + First 2 Event Cities (Month 3–4)
- **Estimated Delivery:** 2026-09-05
- **Focus:** CC fully live on mainnet; creator dashboard shipped; first 2 city events activated.
- **Deliverables / Value Metrics:**
  - Creator dashboard live: CC balance, claim button, transaction history
  - Canton onboarding content live in-app and across all community channels
  - ≥300 creators with active CC wallets on mainnet
  - First 2 city events completed (Jakarta + Surabaya): meetup + workshop + mini hackathon + panel
  - ≥200 total attendees (creators + builders) across 2 cities
  - Mini hackathon conducted with CC prize pool distributed to winning teams
  - Public milestone report: CC metrics, event attendance, hackathon project outcomes

### Milestone 3: Roadshow Completion + Final Report (Month 5–6)
- **Estimated Delivery:** 2026-11-05
- **Focus:** Full roadshow delivered; ecosystem metrics published; co-authored case study.
- **Deliverables / Value Metrics:**
  - Remaining 2–3 city events completed (Bandung, Yogyakarta, Medan): 200–300+ additional attendees
  - Total roadshow: 400–500 attendees (creators + builders) across 4–5 cities
  - ≥500 creators with active CC wallets on mainnet
  - ≥1,000 CC-denominated jobs completed on mainnet
  - All hackathon projects documented and published (open-source where applicable)
  - Final public report: all metrics, wallet activations, per-city event recaps, project showcases
  - Co-authored blog post / case study with Canton Foundation

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- On-chain evidence of CC transactions and wallet activations meeting the stated numerical thresholds per milestone.
- Testnet job completion (M1) evidenced by transaction logs; mainnet completions (M2, M3) evidenced by Canton Ledger records.
- Roadshow attendance evidenced by sign-in sheets, event photos, and co-branded Canton documentation per city.
- Hackathon projects publicly documented (GitHub repos or write-ups) before M2 and M3 payment release.
- Open-source CC integration module publicly accessible on GitHub with documentation by M1 delivery.
- Final report and co-authored case study published before M3 payment release.

---

## Funding

**Total Funding Request: 400,000 CC**

### Payment Breakdown by Milestone

| Milestone | Amount | Trigger |
|---|---|---|
| M1 — Canton Wallet & Payment Rails | 135,000 CC | Committee acceptance of M1 deliverables |
| M2 — Dashboard + First 2 Event Cities | 135,000 CC | Committee acceptance of M2 deliverables |
| M3 — Roadshow Completion + Final Report | 130,000 CC | Committee acceptance of M3 deliverables |
| **Total** | **400,000 CC** | |

*At current price (~$0.149/CC): 400,000 CC ≈ $59,600 USD | Per milestone: ~$19,900 USD*

### Budget Breakdown

| Category | Item | CC |
|---|---|---|
| Tech | Canton SDK, wallet integration, payment rails backend | 60,000 |
| Tech | Frontend: creator dashboard, CC wallet UX | 38,000 |
| Tech | QA, testing, security review | 15,000 |
| Tech | Open-source docs & developer guide | 12,000 |
| Onboarding | In-app content, community education, social campaigns | 15,000 |
| Event | Venue, AV, logistics — 4–5 cities | 70,000 |
| Event | Workshop facilitation & Canton technical speakers | 25,000 |
| Event | Mini hackathon prize pool (CC rewards to winning teams) | 30,000 |
| Event | Co-branded Canton collateral & printed materials | 15,000 |
| Event | Travel & accommodation — multi-city team | 10,000 |
| Contingency | Buffer (5%) | 10,000 |
| **Total** | | **400,000 CC** |

### Volatility Stipulation

Project duration is under 6 months. Should the timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones will be renegotiated to account for significant USD/CC price volatility.

---

## Co-Marketing

Upon each milestone acceptance, IndoYaps / Yapper Agent will collaborate with the Canton Foundation on:

- Announcement coordination (Foundation blog, X posts) featuring CC wallet activations and on-chain job completions as headline metrics
- Co-authored technical blog post on the open-source CC wallet + DAML escrow integration pattern, targeted at the Canton developer community
- Event recap posts and hackathon project showcases from each roadshow city, co-branded with Canton Foundation
- Promotion through Yapper Agent's existing channels (15,000+ X, Discord, Telegram) framing Canton as the settlement layer for the creator economy in Southeast Asia

---

## Motivation

Twitter and social media engagement is a high-frequency, measurable economic activity. Yapper Agent brings this volume on-chain — replacing agency intermediaries (20–40% commissions) with DAML-based escrow and verifiable proof of work. CC integration extends this to a live consumer platform with an established 15,000+ member user base, providing immediate and measurable CC transaction volume.

The Indonesia pilot roadshow occupies a lane no other Canton Dev Fund proposal addresses: physical community activation in Southeast Asia, targeting both creators and builders simultaneously. Indonesia's high crypto engagement and cost-effective event logistics make it the highest-impact geography for Canton's first grassroots presence in the region.

**Expected impact — end of Month 6:**

| Metric | Target |
|---|---|
| Creators with active Canton wallets | 500+ on mainnet |
| CC-denominated jobs completed | 1,000+ on mainnet |
| Community members reached online | 15,000+ |
| Event attendees (creators + builders) | 400–500 across 4–5 cities |
| New wallet activations at events | 200+ |
| Mini hackathon projects built on Canton | 10–20 projects |
| Cities with Canton community presence | 4–5 cities (Indonesia pilot) |
| Open-source CC integration module | 1 reusable module — Apache-2.0 |

---

## Rationale

**Why integrate CC into an existing platform rather than build new?**
Yapper Agent has live traction: 15,000+ community members, an operational verification pipeline (ScrapeBadger API), partnerships with Bitget Wallet and Numbers Protocol, and x402 + MCP lanes already live. Starting from this base means CC adoption is immediate and measurable — no user acquisition costs, no cold-start problem. The 220-commit codebase reduces execution risk compared to a greenfield proposal.

**Why a Creator × Builder event format?**
Combining the two segments creates a self-reinforcing loop: creators provide the demand side (jobs in CC), builders provide the supply of Canton-native integrations and tools. The mini hackathon generates tangible on-chain output — projects built on Canton — providing concrete evidence of developer adoption beyond attendance counts.

**Why Indonesia as the SEA pilot?**
Indonesia is a top-5 global crypto adoption market with established, organized Web3 builder communities in multiple cities. Event targets are deliberately conservative (100 attendees/city) to ensure reliable, verifiable delivery. A phased rollout (2 cities first in M2, remaining in M3) further de-risks logistics.

**Relationship to existing proposals:**
- **PR #78 (x402 Integration):** Yapper Agent already supports x402 for AI Agent jobs. CC integration makes Yapper a live Canton x402 reference implementation at zero additional protocol cost.
- **PR #159 (CCTools):** Focuses on on-chain data dashboards — complementary, no overlap with creator micro-tasks or offline community activation.
- No existing proposal addresses creator micro-task platforms, builder community onboarding, or physical hackathon events in Southeast Asia. This lane is unoccupied.

**Risks & mitigations:**

| Risk | Mitigation |
|---|---|
| Canton SDK complexity | Team has live Solana wallet integration — same architectural pattern |
| Low CC adoption vs USDC initially | CC-bonus jobs in M1 to incentivize early adopters |
| Attendance below 100/city | Pre-registration via 15k community + local builder network; target is conservative |
| Low hackathon participation | Short format (2–4 hours), beginner-friendly, CC prize incentive, pre-briefed teams |
| Tech timeline slippage | Tech milestones front-loaded in M1–M2; events in M3 are an independent deliverable |
| Multi-city logistics | Phased rollout — 2 cities first (M2), remaining 2–3 in M3 |
| CC price volatility | Funding fixed in CC per template; milestones renegotiated if Committee requests scope changes |
