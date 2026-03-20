# Proposal: Flowryd OS — Canton Workflow Engine

**Applicant:** Liz Towler, Founder & CEO, Flowryd
**Contact:** liz@flowryd.xyz
**Canton Status:** Featured App — approved January 2026, grant funds go-live on Canton MainNet
**Technical Champion:** IntellectEU (Catalyst deployment platform, Canton node host)
**Date:** March 2026
**Fund:** CIP-0082 — Protocol Development Fund

---

## Summary

Canton has demonstrated extraordinary production proof. The race to liquidity and transaction volume requires interoperability at scale. The bottleneck is not technology. It is coordination.

**Flowryd proposes to build and open-source the Canton Workflow Engine** — an open, standards-mapped, production-proven set of Flows, Functions, and Accelerators that eliminates this coordination tax for the entire ecosystem. Think of it as what ERC standards did for Ethereum: a shared foundation every builder compiles from, not around.

> *"When one very large company ignites agentic workflows in a way that actually works — that people are using, maybe even without their knowledge — whatever chain that's running on is going to be made. Because the flood of people and developers thinking about how do I monetize the human eyeballs, or how do I monetize the downline human interest to pay other machines — because there is now an incentive and a technical infrastructure for rewarding that — it's going to be very exciting."*
>
> — Ben Milne, CEO, Brale · Stable Minded Podcast, S7E1 · Timestamp 53:22

Every institution entering Canton today independently translates TradFi standards — ICMA BDT, ISDA SOP, SEC/CFTC Token Taxonomy — into on-chain workflow logic. That coordination tax is paid over and over, inconsistently. Developers reinvent the same Daml patterns from scratch. Implementations diverge. And if institutions simply copy-paste legacy workflows without evolving them, they lose the very benefits the technology unlocks.

Flowryd opens onchain markets for all — so finance not only flows, it scales to become deep and liquid global markets. This living data engine is how Canton secures leadership advantage.

---

## What Flowryd Has Already Built

Flowryd OS is operational at [app.flowryd.xyz](https://app.flowryd.xyz) — the orchestration layer for institutional multi-party workflows. The platform and data architecture are built. This grant funds two critical remaining steps: (1) going live on Canton MainNet via IntellectEU, and (2) the open standards layer that makes the engine a common good for the ecosystem.

| Component | Status |
|---|---|
| Platform Core — 57 API routes, deal state machine, participant onboarding | Live |
| 80+ institutional participant profiles mapped to Canton roles | Live |
| Canton Intelligence Dashboard — live CC price feeds, ecosystem intelligence | Live |
| Behind the Headline — curated headline-to-workflow feed | Live |
| Intel Briefs — deep-dive event intelligence, Stripe-gated | Live |
| Deal Room — workflow setup, monthly orchestration with CC settlement | Live |
| Workbench 1.0 — interactive standards integration layer (ICMA/ISDA/SEC/BCG) | Live |
| Data architecture — 270+ mapped organisations, 24 role types | Live |

**Live tools:** [flowryd-io-accelerator.vercel.app](https://flowryd-io-accelerator.vercel.app)

---

## The Problem — The Coordination Tax

Today, institutions navigate ICMA BDT, ISDA SOP, and the SEC/CFTC Token Taxonomy across PDFs, working group papers, Google Sheets, and bilateral email threads. The standards exist. The Flows are proven. The code patterns are knowable. But they live in disconnected silos — and every institution entering Canton pays the translation tax independently.

Three structural risks this creates (per Blockworks Research, March 2026):

- Activity concentrated in private synchronization environments not contributing to the Global Synchronizer
- Token ownership concentrated — institutions outside larger transaction flows cannot access the network efficiently
- Burn-to-mint ratio approaching but not yet exceeding 1.0 — the network needs consistent, recurring workflow activity to tip into deflation

Each risk is a coordination problem. The Canton Workflow Engine is the solution.

Further standards can be incorporated as required — including agentic AI frameworks as autonomous agents begin operating within institutional workflows — so the engine remains flexible and adaptive to emergent best practices.

---

## The Proposal — Functions + Flows + Accelerators + GTM

Four reinforcing components, one common good:

### Functions
13 reusable role templates (Custody, Settlement Rail, Registry, Tokenize/Issuer, Exchange, Compliance Check, Collateral Agent, Oracle/Pricing, Liquidity Provider, Identity Provider, Wallet Provider, Bridge, Explorer) — published openly so any Canton developer builds from the same role primitives.

### Flows
11 proven workflow patterns extracted from real Canton transactions:

| Flow | Status | Production Evidence |
|---|---|---|
| FLOW-001: Intraday Repo | ACCELERATOR | Canton GCN Rounds 1–4, Aug 2025–Feb 2026 |
| FLOW-002: Bilateral Derivatives Margin | DESIGN | Canton Derivatives Initiative, 6 LP design partners |
| FLOW-003: Token Issuance | ACTIVE | 12+ issuances, $4.7B+, 5 jurisdictions |
| FLOW-004: Cross-Border Collateral Transfer | ACCELERATOR | First tokenized Gilt repo, Jan 2026, LSEG DiSH/Euroclear |
| FLOW-005: Securities Lending | PLANNED | OG Capital Markets Use Cases |
| FLOW-006: Fund Subscription / Redemption | PLANNED | OG Capital Markets Use Cases |
| FLOW-007: Secondary Trading | PLANNED | OG Capital Markets Use Cases |
| FLOW-008: Corporate Actions | PLANNED | OG Capital Markets Use Cases |
| FLOW-009: Tokenized MMF | PLANNED | Franklin Templeton Benji live |
| FLOW-010: ETF Creation / Redemption | PLANNED | OG Capital Markets Use Cases |
| FLOW-011: Distribution / Bookbuilding | PLANNED | ICMA PMIP NextGen U-01/U-02/U-04/U-05 |

### Accelerators
Proven transaction packages — each mapping a live Canton transaction to Functions, standards frameworks, and Daml code. FLOW-001 (Intraday Repo) and FLOW-004 (Cross-Border Collateral) are already Accelerators. Every proven Flow graduates to an Accelerator.

### GTM — Behind the Headlines
Intel Briefs as worked examples. Each brief takes a real Canton transaction, maps it through the engine, shows which standards it satisfies, and identifies the code pattern to replicate it. SocGen brief live. Gilts Repo brief in build. Institutions learn by example. Developers build from proof.

---

## Standards Mapped

| Standard | Scope | Mapping |
|---|---|---|
| ICMA Bond Data Taxonomy v1.2 | 126 fields | Primary issuance U-01–U-05 series. Party roles mapped to Canton participants. |
| ISDA Standard Operating Procedures (Feb 2026) | 14 sections | Derivatives collateral workflows. §5.5 single source of truth = Canton smart contract. |
| SEC/CFTC Token Taxonomy (March 2026) | 5 categories | CC = Digital Commodity. Tokenized bonds = Digital Securities. Asset classification as workflow eligibility gate. |
| BCG Interoperability Framework | 6 building blocks | ALP-1 to ALP-6 mapped across all 11 Flows. ALP-6 Intermediary Responsibilities fulfilled by Flowryd orchestration. |

---

## Milestones & Funding

### Phase 1 — Design, Documentation & Go-Live | ~$100,000 USD | Q2 2026

| Milestone | Deliverable | Budget | Timeline | Verification |
|---|---|---|---|---|
| M1 — IEU Design Phase | Integration Architecture (C4 diagrams, Catalyst CBM/CPM). Daml Smart Contract Scope for 11 Flows. Technical Backlog with acceptance criteria. T&M Resource Plan for Phase 2. | ~$36,000 USD (£28,600 fixed) | Weeks 1–4 | IEU Design Phase Report delivered. Architecture diagrams published. |
| M2 — Gravity / Will Lee — Intel Layer & Standards UI | Intel Dashboard completion. Behind the Headline tab live. Workbench 1.0 standards toggle layer (ICMA/ISDA/SEC/BCG). Volume reporting dashboard. Flow activation UI. Admin CMS. Ryd AI — agentic Daml contract authoring layer, validated against canonical Canton patterns. | $50,000 USD | Weeks 1–8 | Live at app.flowryd.xyz. Public URLs verifiable. Standards mapping visible in Workbench. |
| M3 — IEU Go-Live — Node & Canton Integration | LiveCantonService replacing MockCantonService. Catalyst production environment live. Atomic CC settlement via Fireblocks. Audit log on Canton. End-to-end deal lifecycle on-ledger. | ~$14,000 USD (2 weeks T&M) | Weeks 5–6 | Live Canton node active. Atomic settlement verified on Canton MainNet. |

**Phase 1 Total: ~$100,000 USD**

### Phase 2 — Daml Reference Implementations | Budget TBD after M1 | Q3–Q4 2026

Phase 2 funding will be confirmed following the IEU Design Phase Report (M1). The Daml implementation cost across all 11 Flows depends on findings from the technical specification. The Tech & Ops Committee will receive a fully costed Phase 2 proposal before any Phase 2 funding is released.

Expected scope:
- Daml contract templates for all 11 Flows — published openly on GitHub, forkable by any Canton developer
- Standards compliance gates encoded — ICMA BDT, ISDA SOP, SEC/CFTC taxonomy as executable workflow conditions
- IntellectEU delivery via Catalyst — production-grade, Canton MainNet compatible
- Estimated scope: 11 Flows × 5–8 Daml templates each — precise estimates in M1 IEU report

---

## Why This is a Common Good

The Canton Workflow Engine is not a Flowryd product. It is public infrastructure:

- Open Functions — any app builds from the same 13 role templates
- Open Flows — any institution uses them, not locked to Flowryd
- Open standards mapping — any developer annotates their app against ICMA/ISDA/SEC using the same schema
- Open Daml code — forkable reference implementations anyone can adapt
- Open volume data — Global Synchronizer transaction reporting for the whole ecosystem
- Community data layer — 270+ org matrix and role taxonomy open to oracle providers, index builders, data vendors

---

## Team

| Entity | Role | Canton Credentials |
|---|---|---|
| Flowryd (Liz Towler, CEO) | Engine design, Flow codification, standards mapping, GTM | Featured App since Jan 2026. Former CMO, Canton Network (Digital Asset). Led UST, UK Gilts, Gold tokenization pilots. First CC/CBTC atomic swap. Active ICMA PMIP NextGen contributor. |
| IntellectEU | Daml development, reference implementations, Catalyst deployment, go-live support | Canton Catalyst deployment platform operator. Node host for Flowryd. Established Daml development capability across Canton ecosystem. Technical champion. |
| Gravity (Will Lee) | Frontend development — Intel Dashboard, Workbench 1.0, Behind the Headlines tooling, volume reporting | Full-stack developer building the Flowryd product layer. Responsible for all public-facing tools and the GTM / Intel component of the engine. |

---

## Network Impact

- Each activated Flow routes cross-institutional transactions through the Global Synchronizer — direct CC burn events
- Broadridge DLR benchmark: $365B/day ADV, $7.3T monthly, 508% YoY growth — the downstream demand signal
- Cross-border intraday repo (FLOW-004) alone involves 8–10 institutional counterparties per transaction
- 270+ mapped institutions gain access to larger transaction flows without independently solving the translation problem
- Oracle and data providers (Kaiko, Chainlink, The Tie) can build workflow-activity indexes on top of the open data layer

---

## Reference Materials

**Live Tools**
- Flowryd.io Engine (all tools): https://flowryd-io-accelerator.vercel.app
- Flowryd App: https://app.flowryd.xyz

**Grant & Governance**
- CIP-0082: https://github.com/canton-foundation/cips/blob/main/cip-0082/cip-0082.md
- Canton Foundation Grants Program: https://canton.foundation/grants-program/

**Standards**
- ICMA Bond Data Taxonomy v1.2: https://www.icmagroup.org/resources/bond-data-taxonomy/
- ISDA SOP (February 2026): https://www.isda.org/
- SEC/CFTC Token Taxonomy 33-11412 (March 2026): https://www.sec.gov/files/rules/interp/2026/33-11412.pdf

**Production Evidence**
- Blockworks Research — Canton Network: Wall Street's Blockchain (March 2026): https://blockworks.co/
- Canton Network Pilot Report 1: https://www.canton.network/
- Global Collateral Network — Cross-Border Intraday Repo: https://www.canton.network/newsroom/cantons-industry-working-group-advances-cross-border-collateral-mobility

---

## Closing

The Canton Workflow Engine eliminates the coordination tax. Every institution that joins Canton after this engine exists spends zero time solving the translation problem independently. They discover a Flow. They activate. They build markets.

That is how the network scales. That is how the burn ratio tips. That is how institutions outside larger transaction flows become active participants.

Flowryd opens onchain markets for all — so finance not only flows, it scales to become deep and liquid global markets. This living data engine is how Canton secures leadership advantage.

**Liz Towler**
Founder & CEO, Flowryd
liz@flowryd.xyz
March 2026
