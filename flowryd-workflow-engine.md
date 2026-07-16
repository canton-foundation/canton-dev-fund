# Proposal: Flowryd OS — Canton Workflow Engine

**Applicant:** Liz Towler, Founder & CEO, Flowryd  
**Contact:** liz@flowryd.xyz  
**Canton Status:** Featured App — approved November 2025, grant funds go-live on Canton MainNet  
**Technical Champion:** IntellectEU (Catalyst deployment platform, Canton node host)  
**Date:** March 2026  
**Fund:** Canton Protocol Development Fund — CIP-0082

---

## Summary

The Canton Network in 2026 is the Internet in 1998. The infrastructure exists. The technology works. What's missing is the layer that makes coordination usable for every participant — not just those with early access, capital, and working group seats.

Google didn't invent search. It made the Internet accessible at scale. Flowryd OS does the same for Canton.

Each participant builds their app, or tokenises their asset. But finance doesn't flow unless it connects. Every jurisdiction and industry body publishes their own standards and templates — each one another barrier to entry. Every participant independently solves the same translation problem, or at best bilaterally. Despite most transactions requiring five or more parties to execute.

**Everyone pays the coordination tax, each time.**

The data shows something more serious. The largest transactions on Canton involve the same small cluster of participants. The rest of the network — enrolled, but not participating. Not because the technology fails them. Because the coordination layer doesn't exist. It's unclear how to form markets and flywheels from the headline transactions. TPS won't meaningfully ramp one transaction at a time.

**We need a smarter, more scalable coordination layer. Flowryd OS can be the central nervous system for on-chain finance — connecting apps, assets and participants so markets actually flow.**

> *"When one very large company ignites agentic workflows in a way that actually works — that people are using, maybe even without their knowledge — whatever chain that's running on is going to be made. It's going to be very exciting."*
>
> — Ben Milne, CEO, Brale · Stable Minded Podcast, S7E1 · Timestamp 53:22

---

## What Flowryd Has Already Built

Flowryd OS is operational at [app.flowryd.xyz](https://app.flowryd.xyz/login) — the orchestration layer for institutional multi-party workflows on Canton. The platform and data architecture are built. This grant funds two critical remaining steps: (1) going live on Canton MainNet via IntellectEU, and (2) the open standards layer that makes the engine a common good for the ecosystem.

| Component | Status |
|---|---|
| Platform Core — 57 API routes, deal state machine, participant onboarding | Live |
| 80+ institutional participant profiles mapped to Canton roles | Live |
| Canton Intelligence Dashboard — live CC price feeds, ecosystem intelligence | Live |
| Behind the Headline — curated headline-to-workflow feed | Live |
| Intel Briefs — deep-dive event intelligence, Stripe-gated | Live |
| Deal Room — workflow setup, monthly orchestration with CC settlement | Live |
| Workbench 1.0 — interactive standards layer (ICMA/ISDA/SEC/BCG) | Live |
| Ryd AI — Canton Network Assistant, agentic AI layer embedded in Flowryd OS | Live |
| Data Architecture — 270+ mapped organisations, 24 role types, 11 Flows, 4 standards frameworks | Live |

**Live tools:** [flowryd-io-accelerator.vercel.app](https://flowryd-io-accelerator.vercel.app)

---

## The Problem — Making Deals Frictionless

Today, every participant that wants to transact on Canton arrives at the same problem: navigate a fragmented landscape of PDFs, working group papers, bilateral email threads, and pilot reports — then translate all of it into on-chain workflow logic independently. The deal is possible. The friction is enormous.

The grant funds the layer that removes that friction permanently — for every participant, on every Flow, from the moment they arrive.

| Today — high friction, slow deals | With Flowryd OS — frictionless |
|---|---|
| ICMA BDT lives in a 126-field PDF taxonomy | ICMA BDT fields annotate workflow steps — required schema injected automatically |
| ISDA SOP is a manually-followed bilateral procedures document | ISDA SOP sections become executable workflow gates — §5.5 single source of truth = Canton smart contract |
| SEC/CFTC taxonomy is a 68-page interpretive release | Asset classification is a pre-workflow eligibility check — CC, tokenized bonds, stablecoins classified before activation |
| Flow logic lives in working group presentations and pilot reports | Flow logic is open Daml code — forkable, testable, version-controlled on GitHub |
| Participants spend weeks navigating before they can start building | Participants arrive at an actionable transaction — roles matched, standards satisfied, code available |

**Roles matched. Standards satisfied. Code ready. Deal live.**

---

## The Proposal — Functions + Flows + Accelerators + Code

### Fund Criteria Alignment

| Fund Criterion | Flowryd OS Delivers |
|---|---|
| Core R&D that advances the Canton protocol | The standards integration layer — mapping ICMA BDT, ISDA SOP, SEC/CFTC, and BCG Interop to Canton Flows — is net-new protocol R&D. No shared standards schema exists on Canton today. |
| Developer tools that make it easier to build on Canton | Ryd AI generates compiler-validated Daml contract stubs from structured Function specifications. Workbench 1.0 and 13 published Function templates cut build time from weeks to days. |
| Reference implementations other builders can reuse | 11 Flows × open Daml templates = reference implementations any Canton developer can fork, adapt, and deploy. Published on GitHub. Built on Catalyst. |
| Critical infrastructure the ecosystem relies on | The coordination layer IS infrastructure. Flowryd OS solves the translation problem once, openly, for all participants. |

### Functions
13 reusable role templates (Custody, Settlement Rail, Registry, Tokenize/Issuer, Exchange, Compliance, Collateral Agent, Oracle/Pricing, Liquidity Provider, Identity, Wallet, Data & Analytics, Bridge) — published openly so any Canton developer builds from the same role primitives.

### Flows

| Flow | Status | Standards |
|---|---|---|
| FLOW-001: Intraday Repo | Accelerator | GMRA · ICMA BDT |
| FLOW-002: Bilateral Derivatives Margin | Design | ISDA CSA · ISDA DADD |
| FLOW-003: Token Issuance | Active | ICMA BDT U-03 |
| FLOW-004: Cross-Border Collateral Transfer | Accelerator | GMRA · ICMA BDT · ISO 20022 |
| FLOW-005: Securities Lending | Planned | ICMA BDT |
| FLOW-006: Fund Subscription / Redemption | Planned | ICMA BDT |
| FLOW-007: Secondary Trading | Design | ICMA BDT |
| FLOW-008: Corporate Actions | Planned | ICMA BDT |
| FLOW-009: Tokenized MMF | Design | ICMA BDT |
| FLOW-010: ETF Creation / Redemption | Design | ICMA BDT |
| FLOW-011: Distribution / Bookbuilding | Planned | ICMA BDT U-01–U-05 |

### Accelerators
Proven transaction packages — each mapping a live Canton transaction to Functions, standards frameworks, and Daml code. FLOW-001 (Intraday Repo) and FLOW-004 (Cross-Border Gilt Repo) are confirmed Accelerators today. Every proven Flow graduates to an Accelerator.

### Canton Protocol Standards

Flowryd OS is built on and extends Canton's native protocol standards:

- **CIP-56** — Canton Token Standard (counterpart to ERC-20). FNC-003, FNC-004, FNC-007 implement CIP-56 interfaces so assets are discoverable across all Canton wallets.
- **CIP-0103** — Canton dApp Standard (counterpart to EIP-1193). Flowryd OS uses CIP-0103 to decouple workflow logic from key management — any compliant wallet connects to any Flowryd Flow.
- **Flowryd Workflow Orchestration CIP (proposed)** — The missing coordination layer above CIP-56 and CIP-0103. Defines Flow state machines, role assignment, compliance gates, and participant onboarding. To be drafted in Phase 2 following production deployment of reference implementations.

### Standards Mapped

| Standard | Scope | Mapping |
|---|---|---|
| ICMA Bond Data Taxonomy v1.2 | 126 fields | Primary issuance U-01–U-05. Party roles mapped to Canton participants. |
| ISDA SOP (Feb 2026) | 14 sections | Derivatives collateral workflows. §5.5 = Canton smart contract. |
| SEC/CFTC Token Taxonomy (March 2026) | 5 categories | CC = Digital Commodity. Tokenized bonds = Digital Securities. |
| BCG Interoperability Framework | 6 building blocks | ALP-1 to ALP-6 mapped across all Flows. |
| CIP-56 (Canton Token Standard) | Token interface | FNC-003, FNC-004, FNC-007 implement CIP-56 for wallet discoverability. |
| CIP-0103 (Canton dApp Standard) | dApp-to-wallet API | Decouples workflow logic from key management across all Flows. |

---

## Milestones & Funding

### Phase 1 — Design, Documentation & Go-Live | ~$100,000 USD | Q2 2026

| Milestone | Deliverable | Budget | Timeline | Verification |
|---|---|---|---|---|
| M1 — IEU Design Phase | Integration Architecture (C4 diagrams, Catalyst CBM/CPM). Daml Smart Contract Scope for all Flows. Technical Backlog with acceptance criteria. T&M Resource Plan for Phase 2. | ~$36,000 USD (£28,600 fixed) | Weeks 1–4 | IEU Design Phase Report delivered. Architecture diagrams published. |
| M2 — Gravity / Will Lee | Intel Dashboard. Workbench 1.0 standards toggle. Ryd AI. Volume reporting. Flow activation UI. Admin CMS. | $50,000 USD | Weeks 1–8 | Live at app.flowryd.xyz. Standards mapping visible in Workbench. |
| M3 — IEU Go-Live | LiveCantonService replacing MockCantonService. Catalyst production environment. Atomic CC settlement. Audit log on Canton. End-to-end deal lifecycle on-ledger. | ~$14,000 USD (2 weeks T&M) | Weeks 5–6 | Live Canton node. Atomic settlement verified on Global Synchronizer. |

**Phase 1 Total: ~$100,000 USD**

### Phase 2 — Daml Reference Implementations + Workflow CIP | Budget TBD after M1 | Q3–Q4 2026

Phase 2 funding confirmed following IEU Design Phase Report. Committee receives fully costed Phase 2 proposal before any Phase 2 funds released.

- Daml contract templates for all Flows — published openly on GitHub, forkable by any Canton developer
- Standards compliance gates encoded — ICMA BDT, ISDA SOP, SEC/CFTC taxonomy as executable workflow conditions
- IntellectEU delivery via Catalyst — production-grade, Global Synchronizer compatible
- **M4: Flowryd Workflow Orchestration CIP** — proposed Canton standard for multi-party institutional workflow coordination. Builds on CIP-56 and CIP-0103. Published for community review. Flowryd OS = canonical reference implementation.

---

## Why This is a Common Good

- Open Functions — any app builds from the same 13 role templates
- Open Flows — any participant uses them, not locked to Flowryd
- Open standards mapping — any developer annotates against ICMA/ISDA/SEC using the same schema
- Open Daml code — forkable reference implementations anyone can adapt
- Open volume data — Global Synchronizer transaction reporting for the whole ecosystem
- Community data layer — 270+ org matrix open to oracle providers, index builders, data vendors

The concentration risk identified in Blockworks Research is a participation problem. Flowryd OS is the participation solution — it expands the active middle from a handful of inner-circle participants to every participant that can find a Flow, slot in, and activate.

---

## Team

| Entity | Role | Canton Credentials |
|---|---|---|
| Flowryd (Liz Towler, CEO) | Engine design, Flow codification, standards mapping, GTM | Canton Featured App approved November 2025. Former CMO, Canton Network (Digital Asset). Led UST, UK Gilts, Gold tokenization pilots. First CC/CBTC atomic swap. Active ICMA PMIP NextGen contributor. |
| IntellectEU | Daml development, Catalyst deployment, go-live support | Canton Catalyst platform operator. Node host for Flowryd. Technical champion. |
| Gravity (Will Lee) | Ryd AI, Intel Dashboard, Workbench 1.0, volume reporting | Full-stack developer building the Flowryd product layer. |

---

## Network Impact

- Each activated Flow routes cross-participant transactions through the Global Synchronizer — direct CC burn events
- Broadridge DLR: $365B/day ADV, $7.3T monthly, 508% YoY — the downstream demand signal
- FLOW-004 alone involves 8–10 participants per transaction
- 270+ mapped participants gain access to larger transaction flows without independently solving the translation problem
- Kaiko, Chainlink, The Tie can build workflow-activity indexes on top of the open data layer

---

## Reference Materials

- Flowryd OS app: https://app.flowryd.xyz/login
- Flowryd OS data architecture: https://flowryd-io-accelerator.vercel.app
- Canton Foundation Grants: https://canton.foundation/grants-program/
- CIP-56: https://www.canton.network/
- CIP-0103: https://www.canton.network/
- SEC/CFTC Token Taxonomy (March 2026): https://www.sec.gov/files/rules/interp/2026/33-11412.pdf
- Global Collateral Network: https://www.canton.network/newsroom/cantons-industry-working-group-advances-cross-border-collateral-mobility

---

## Closing

Every infrastructure moment in finance starts the same way.

A small group proves it works. Then someone builds the rails that let everyone else in. SWIFT did it for payments. ISDA did it for derivatives. ERC-20 did it for Ethereum. In each case, the moment the shared standard existed, participation exploded. Not because the technology changed. Because the coordination cost dropped to zero.

Canton has done the hard part. The technology works. The participants are enrolled, apps, participants and transactions are growing. Usability is the last hurdle.

You are funding orchestration infrastructure, not a product. The OS for on-chain markets, with Canton Network at the forefront setting the standard. Flowryd OS builds it, opens it, and maintains it. What the ecosystem does with it is unlimited.

Flowryd OS opens on-chain markets for all — so finance not only flows, it scales to become deep and liquid global markets.

**Let's Flow**

**Liz Towler**  
Founder & CEO, Flowryd  
liz@flowryd.xyz  
March 2026
