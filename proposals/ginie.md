# Ginie: AI-Powered Canton Smart Contract & dApp Generator

> **Development Fund Proposal — BlockX AI Ltd**
>
> **Live:** [canton.ginie.xyz](https://canton.ginie.xyz) — Full pipeline live, LocalNet sandbox deployed
> **Repository:** [github.com/BlockX-AI/Canton_Ginie](https://github.com/BlockX-AI/Canton_Ginie) — CI passing · Apache 2.0

---

| Field | Value |
|-------|-------|
| **Author** | BlockX AI Limited — [blockxai.xyz](https://blockxai.xyz) |
| **Contact** | info@blockxai.xyz |
| **Status** | Submitted |
| **Created** | 2026-03-23 |
| **Champion** | Canton Foundation |

---

## Abstract

Ginie transforms plain English into fully compiled, deployed Daml smart contracts on Canton — **in under 90 seconds, with zero Daml knowledge required.**

**This is not a proposal for an idea. Ginie already works.**

The full pipeline is live today on GinieNet — intent parsing → RAG retrieval → Daml generation → `dpm build` compilation → 5-gate security audit → Canton Ledger API deployment → CantonScan Contract ID. The LocalNet Canton sandbox is deployed and publicly accessible. CI is green. The repo has 4 contributors and 9 production deployments. The Core USP is the audit and compliance layer of Ginie, Where each contract before deployment goes under a pre deploymnet audit and compliance check to make sure the quality and complaince from all angles. 

| Metric | Result |
|--------|--------|
| End-to-end pipeline | **5/5 — 100% success rate** |
| Concurrent jobs | **3/3 passed** — no race conditions |
| Average time | **~35 seconds** per contract |
| Audit & Compliance Check Gating | Working in real on the app |
| CI status | **Passing** — lint-and-test green on every push |
| Production deployments | **9 deployments** on Railway (Canton-Ginie + Canton_Sandbox + Postgres + Redis — all online) |
| Active Social Media | https://x.com/giniedev |

Every Ginie contract passes an automated pre-deployment security audit — missing signatory checks, unchecked controllers, unguarded choices, known Daml anti-patterns, and SCU upgrade compatibility. **No other Canton tooling project builds this.**

Example finding on a generated IOU contract: CRITICAL — Choice Iou_Transfer: controller Alice is not in signatories. This choice can be exercised without the asset owner's authorization. Deployment blocked. This is the class of Canton-specific authorization vulnerability that AI-generated code introduces and that no other tool catches before the contract touches the ledger.

---

## The Problem

Deploying on Canton requires Daml fluency — a Haskell-derived language with strict type rules, party semantics, and a complex SDK. A Goldman Sachs PM, a DeFi developer, a university student, or a compliance officer at Euroclear **cannot deploy on Canton today without months of training.**

Ginie solves this with a verified 7-stage AI pipeline:

```
1. Intent Agent    → English description → structured JSON contract spec
2. RAG Layer       → matches 500+ verified Daml patterns (ChromaDB)
3. Writer Agent    → generates complete, idiomatic Daml module
4. Compile Agent   → runs dpm build (Canton 3.4), captures errors precisely
5. Fix Agent       → handles 11 error types, retries up to 3×
6. Audit & Compliance Layer → 5-gate scan: missing signatories · unchecked controllers · unguarded choices · known anti-patterns · SCU field compatibility + @daml.upgrade annotation (Gate 5)
7. Deploy Agent    → DAR upload → Canton Ledger API → real Contract ID returned
```
Canton Skills (github.com/BlockX-AI/Canton_skills · npm: canton-skills) is a companion open-source skill pack for AI coding agents — Claude Code, Codex, Cursor — grounded in Jatin Pandya's Canton DevRel MCP data. It is live, versioned, CI-passing, and MIT licensed independently of this grant.

**SCU compatibility (mandatory per Canton Foundation):** Gate 5 checks every generated module for additive-only field structure and correct `@daml.upgrade` annotation usage before any DAR upload. Every export includes `UPGRADE_NOTES.md` documenting the upgrade path for already-deployed contracts.

---

## What's Already Built

| Component | Status |
|---|---|
| Full pipeline (English → Contract ID) | Live on GinieNet |
| LocalNet Canton sandbox | Deployed on Railway (online) |
| CI / lint-and-test | Passing on every push |
| Pre-deployment audit (4 gates) | Live |
| Python SDK on PyPI | To be published soon `pip install ginie` |
| Docker self-hosting | `docker-compose.yml` |
| Apache 2.0 |  Open source from day one |
| Canton 3.4 / `dpm build` |  Current SDK |
| Canton Skills (npm: canton-skills) | To be Published Soon · MIT · CI passing · npx canton-skills install |

---

## Implementation

| Component | Technology |
|---|---|
| AI Orchestration | LangChain + LangGraph |
| Primary LLM | Claude claude-sonnet-4 |
| Additional LLMs | Gemini 2.5 Flash, GPT-4o (user-selectable) |
| RAG | ChromaDB — 500+ curated Daml patterns |
| Smart Contract Runtime | Canton 3.4 — `dpm build`, `dpm test` |
| Backend | FastAPI + Redis + Celery |
| Frontend | Next.js + TypeScript |
| Ledger | Canton JSON Ledger API (port 7575) |
| Public Sandbox | GinieNet — no DevNet credentials required |
| SDK | `pip install ginie` |
| M4: Native LLM | Ginie-1 — fine-tuned on Daml corpus with RLCF |

---

## Team

**BlockX AI Ltd** is a UK-registered company (Companies House: [16254630](https://find-and-update.company-information.service.gov.uk/company/16254630)). Team members are paid through **Nehvij Tech**, the Indian contractor entity, on a contractual basis at UK startup offshore contractor rates.

Every person below is funded **exclusively for their Ginie grant deliverables.**

| Person | Role | Deliverables | Rate |
|---|---|---|---|
| Vijendra Dhanotiya | Product Director | Architecture, milestone delivery, Canton BD, grant reporting | $1,400/mo |
| Satyam Singhal | AI/ML & Daml Lead | LLM pipeline, RAG, agents, Ginie-1 RLCF, ginie-eval | $1,400/mo |
| Sarthak Vyas | Backend Engineer | FastAPI, GinieNet infra, CI/CD, SDK, Canton Ledger API | $1,000/mo |
| Agrim | Frontend Engineer | Next.js, contract editor, IDE plugin UI | $400/mo |
| Senior Daml Engineer *(hire M2–M3)* | Canton specialist | Validates all 50 RAG patterns. IDL Extractor. SCU Gate 5. | $2,000/mo · 3mo |
| ML/FT Engineer *(hire M4)* | Training specialist | Ginie-1 training. RLCF pipeline. M4 full run. | $3,800/mo · 1mo |

**Salary total: $35,000.** All 4 core members active in every milestone.

---

## Milestones

### Milestone 1 — Production MVP
**Week 4 · 118,800 CC · ~$18,000**

Pipeline is already live. M1 delivers the full public release: 20 validated institutional templates, SCU audit gate, SDK on PyPI, CI/CD benchmark.

**Deliverables:**
- 20 institutional templates: repo, bond, DvP, custody, IOU, AML, multi-party — each with a live Contract ID on GinieNet
- SCU Gate 5: `@daml.upgrade` validation + `UPGRADE_NOTES.md` in every export bundle
- Python SDK v0.1.0 on PyPI
- Docker + `docker-compose.yml` one-command self-hosting
- GitHub Actions CI/CD + 100-prompt benchmark
- `schemas/idl-spec.json` — canonical IDL spec unlocking M2
- More than **≥100 distinct parties** on Canton Mainnet ledger
- LocalNet — **≥300 distinct parties** on ledger, verifiable at [canton.ginie.xyz/explorer](https://canton.ginie.xyz/explorer) (baseline: 23 today)
- SCU upgrade agent (M2 scaffold): Writer Agent updated to generate additive-only field structure by default; daml.yaml version field set to 0.0.1 with documented upgrade path in UPGRADE_NOTES.md
- POST /admin/refresh-rag endpoint: API-accessible RAG refresh so external Daml repo ingestion (splice, daml-finance, cn-quickstart) can be triggered without filesystem access

| Line Item | Amount |
|---|---|
| Team salaries — all 4 core × 1mo | $4,200 |
| Server (GCP + Digital Ocean) | $900 |
| External Daml QA — audit spec + benchmark review | $1,700 |
| Contingency + M1–M2 bridge | $11,200 |
| **Total M1** | **$18,000** |

---

### Milestone 2 — Full-Stack dApp Builder + MCP
**Week 12 · 182,820 CC · ~$27,700**

**Deliverables:**
- IDL Extractor: Daml templates → JSON spec
- Frontend Agent: JSON → complete Next.js dApp with CIP-0103 wallet
- Ecosystem MCP integration: `canton_lookup` into RAG · `canton_check` into Fix Agent · `canton_network_info` into Deploy Agent
- Audit layer v1: PDF report + on-ledger certificate
- Monaco Daml editor with live linting
- GitHub Action: ginie-deploy-action on GitHub Marketplace
- Full project export: Daml source + daml.yaml + audit report + Contract ID + UPGRADE_NOTES.md
- More than **≥500 distinct parties** on Canton Mainnet ledger
- More than 5 community-deployed dApps each with a verifiable GitHub repo and commit history
- GitHub integration: every Ginie generation auto-commits Daml source, daml.yaml, audit report, and UPGRADE_NOTES.md to a user-owned GitHub repo. Each /iterate call creates a pull request against that repo — auditable version history, re-compilable after any SDK upgrade, zero dependency on Ginie for ongoing maintenance.
- SCU upgrade agent: accepts existing .daml source + current version → generates new version with upgradeFrom annotation → validates additive-only field compatibility → bumps daml.yaml version. Completes the upgrade workflow that Gate 5 enforces at deploy time.
- Canton Skills library (Apache 2.0): community PR workflow for external Daml pattern contributions. harvest_patterns.py targets digital-asset/daml, daml-finance, splice, cn-quickstart, ex-models. Any OSS repo added via POST /admin/refresh-rag — no filesystem access required. https://github.com/BlockX-AI/Canton_skills

| Line Item | Amount |
|---|---|
| Team salaries — 4 core + Sr Daml Eng × 2mo | $12,400 |
| Server | $700 |
| LLM API — Claude claude-sonnet-4 (~2M input · ~400K output tokens) | $6,000 |
| GPU — A100 data pre-processing (243 hrs @ $2.06/hr) | $500 |
| CIP-0103 compliance review | $1,600 |
| MCP security review | $1,500 |
| M2–M3 bridge buffer | $5,000 |
| **Total M2** | **$27,700** |

---

### Milestone 3 — IDE Extensions + ML Data Collection + Canton Skills
**Week 20 · 273,240 CC · ~$41,400**

**Deliverables:**
- IDE extensions: VS Code + Cursor + JetBrains — inline generation, deploy from IDE, audit sidebar
- Canton Skills: open-source Daml pattern library, Apache 2.0, community PR workflow
- Policy engine: org-level rules and approval gates
- Multi-workspace org management for the Instituional enterprise grade usage. 
- RAG expanded to 50 validated institutional patterns — Senior Daml Engineer validates every one
- External corpus ingestion: Canton Skills library accepts community PRs and operator-submitted git repos via POST /admin/refresh-rag. Enterprise users can point the RAG indexer at their own internal Daml codebase for fully air-gapped operation with private patterns.
- H100 ablation study: 3 base model comparisons + hyperparameter search → optimal M4 training config
- ML Engineer joins: RLCF pipeline design + M1–M2 data prep + M3 GPU ablations
- More than **≥2000 distinct parties** on Canton Mainnet ledger

| Line Item | Amount |
|---|---|
| Team salaries — 4 core + Sr Daml Eng (final month) × 2mo | $10,400 |
| Server | $1,000 |
| LLM API — Claude claude-sonnet-4 (~1.8M input · ~350K output tokens) | $5,000 |
| GPU — H100 ablations (767 hrs @ $11.08/hr) | $8,500 |
| Canton docs + Daml internals access | $2,000 |
| External Daml specialist — 10 highest-risk patterns | $1,500 |
| External security audit — full system | $2,000 |
| M3–M4 bridge buffer | $11,000 |
| **Total M3** | **$41,400** |

---

### Milestone 4 — Ginie-1 Full Training + Apache 2.0 Release
**Week 24 · 151,140 CC · ~$22,900**

M3 does the preparatory work. M4 executes the full training programme, evaluation, and open-source release.

**Deliverables:**
- **Ginie-1:** SFT 3-epoch + 5-round RLCF on M1–M3 Canton compiler feedback corpus · ≥95% first-pass compile on ginie-eval · GGUF/ONNX CPU inference · Docker air-gapped image · Apache 2.0 on HuggingFace
- **ginie-eval results:** Ginie-1 vs Claude vs GPT-4o — published openly including failure modes
- **Ginie SDK v2.0:** Ginie-1 as default backend · full CI/CD · multi-party archival patterns
- **Full Apache 2.0 release:** GinieNet infra scripts · RAG corpus (50 patterns) · model weights · training pipeline
- Canton Featured App nomination submitted
- More than **≥5000 distinct parties** on Canton Mainnet ledger

| Line Item | Amount |
|---|---|
| Team salaries — 4 core + ML Eng × 1mo | $8,000 |
| Server | $400 |
| LLM API — evaluation + ginie-eval benchmark | $2,000 |
| GPU — 2× H100 parallel (406 hrs each · 60% utilisation) | $9,000 |
| External smart contract audit — Ginie-1 output on 20 institutional templates | $900 |
| Independent ML engineer review — RLCF reward function validation | $1,000 |
| Contingency | $1,600 |
| **Total M4** | **$22,900** |

---

## Funding Summary

| Milestone | CC | USD | Delivery |
|---|---|---|---|
| M1: Production MVP | 118,800 CC | ~$18,000 | Week 4 |
| M2: Full-Stack dApp Builder + MCP | 182,820 CC | ~$27,700 | Week 12 |
| M3: IDE Extensions + ML Data Collection | 273,240 CC | ~$41,400 | Week 20 |
| M4: Ginie-1 Full Training + Apache 2.0 | 151,140 CC | ~$22,900 | Week 24 |
| **Total** | **726,000 CC** | **~$110,000** | **6 months** |

*Rate: 6.6 CC per USD. All CC allocations are exact multiples of 6.6.*

| Category | Amount | Share |
|---|---|---|
| Team salaries | $35,000 | 31.8% |
| Infrastructure + APIs | $16,000 | 14.5% |
| GPU compute | $18,000 | 16.4% |
| Research + QA + security | $12,200 | 11.1% |
| Contingency + buffer | $28,800 | 26.2% |
| **Total** | **$110,000** | **100%** |

---

## Ginie-1 — Canton's Native AI Layer

Every AI contract tool today depends on external API providers. For regulated institutions this creates cost dependency, privacy risk, and reliability risk. **Ginie-1 solves all three permanently.**

| Attribute | Specification |
|---|---|
| Base model | Mistral 7B or Qwen 2.5-Coder |
| Training | SFT + RLCF — Canton compiler feedback as reward signal |
| Target | ≥95% first-pass compile on ginie-eval |
| Runtime | GGUF/ONNX — CPU inference, no GPU required |
| Deployment | Single Docker image — fully air-gapped for banks |
| License | Apache 2.0 — open weights on HuggingFace |

Any Canton ecosystem project can self-host Ginie-1. No third-party API cost. No external dependency. No compliance risk.

---

## What Changes After Ginie

| User | Today | After Ginie |
|---|---|---|
| Wall Street PM | Needs Daml developer hired first | Describes contract, gets Contract ID in 90s |
| Euroclear compliance officer | No path exists | Prototypes from domain knowledge |
| University student | Months of Daml training | Deploys first Canton contract in 90 minutes |
| Regulated bank | Can't route specs through external APIs | Runs Ginie-1 fully air-gapped |
| EVM developer | Entirely different paradigm | Ginie handles Daml translation |

```
More users can build on Canton
         ↓
More contracts deployed on the Global Synchronizer
         ↓
Stronger Burn-Mint Equilibrium → Higher CC utility
         ↓
More institutions join Canton
```

---

## Long-Term Sustainability

- **GinieNet** runs as a public Canton sandbox post-grant, maintained by BlockX AI
- **RAG corpus and Canton Skills** are Apache 2.0 — community-maintained via PR
- **Ginie-1 weights** published Apache 2.0 on HuggingFace — runs independently of BlockX AI infrastructure permanently
- **If BlockX AI ceases operations:** entire stack is Apache 2.0 and forkable by any Canton community member

---

## Links

| Resource | URL |
|---|---|
| Live app | [canton.ginie.xyz](https://canton.ginie.xyz) |
| Repository | [github.com/BlockX-AI/Canton_Ginie](https://github.com/BlockX-AI/Canton_Ginie) |
| BlockX AI Ltd (UK) | [Companies House 16254630](https://find-and-update.company-information.service.gov.uk/company/16254630) |
| Contact | info@blockxai.xyz |
