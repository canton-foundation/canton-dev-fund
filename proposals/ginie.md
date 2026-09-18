# Ginie: AI-Powered Canton Smart Contract & dApp Generator

> **Development Fund Proposal: BlockX AI Ltd**
>
> **Live:** [canton.ginie.xyz](https://canton.ginie.xyz) 
> **Repository:** [github.com/BlockX-AI/Canton_Ginie](https://github.com/BlockX-AI/Canton_Ginie) 

---

| Field | Value |
|-------|-------|
| **Author** | BlockX AI Limited: [blockxai.xyz](https://blockxai.xyz) |
| **Contact** | info@blockxai.xyz |
| **Status** | Submitted |
| **Created** | 2026-03-23 |
| **Champion** | Canton Foundation |

---

## Abstract

We kept watching EVM developers and Rust builders look at Canton, understand why it was the right infrastructure for what they wanted to build, and then leave the moment they saw Daml. Nobody was solving that specific problem: getting someone who already knows web3 through the door without months of training. That is what Ginie does.

This is not a proposal for an idea. Ginie already works.

402 contracts deployed. 156 parties registered on LocalNet. Two months of live operation. Real Canton community members building on it today: unprompted feedback from users calling it a game-changer for non-developers who want to build on Canton without writing a line of code.
The pipeline is live on LocalNet: intent parsing → RAG retrieval → Daml generation → dpm build compilation → 5-gate security audit → Canton Ledger API deployment → Contract ID returned. What makes Ginie different from every other Canton tool is the pre-deployment audit: every contract passes a 5-gate security check before any DAR touches the ledger, because AI-generated Daml has specific, predictable failure modes that no developer can catch without deep Canton expertise.
| Metric | Result |
|--------|--------|
| Parties Registered on Localnet | 156 |
| Contracts Deployed by Canton Community | 402 |
| Average time | ~55 seconds per contract |
| Audit & Compliance Check Gating | Working in real on the app |
| Production Infra | Railway for the backend and Sandbox. Vercel for the frontend |
| Validator Node | Approved, but yet to Migrate to Testnet |

Every Ginie contract passes an automated pre-deployment security audit: missing signatory checks, unchecked controllers, unguarded choices, known Daml anti-patterns, and SCU upgrade compatibility. 
Example finding on a generated IOU contract: CRITICAL: Choice Iou_Transfer: controller Alice is not in signatories. This choice can be exercised without the asset owner's authorization. Deployment blocked. This is the class of Canton-specific authorization vulnerability that AI-generated code introduces and that no other tool catches before the contract touches the ledger.

---

## The Problem

The barrier is not motivation. Every EVM developer and Rust builder we talked to understood why Canton was the right infrastructure for what they wanted to build. The barrier is Daml: a Haskell-derived language that requires weeks of study before you can write a contract that compiles, and months before you write one that is safe. Most people see that and go back to chains they already know. Canton loses developers not because it is the wrong choice but because the entry cost is too high relative to staying on EVM.
This is a problem we have solved before. BlockX AI's EVI SDK: an AI-powered English-to-Solidity contract layer for EVM chains: reached 47,000 weekly downloads on NPM without a marketing budget. The demand for "describe it in plain language, get a working contract" is real and proven. We built Ginie because the same problem exists on Canton and nobody was solving it.
Canton Skills (github.com/BlockX-AI/Canton_skills · npm: canton-skills) is a companion open-source skill pack for AI coding agents: Claude Code, Codex, Cursor: grounded in Jatin Pandya's Canton DevRel MCP data. It is live, versioned, CI-passing, and MIT licensed independently of this grant.

SCU compatibility is a hard requirement from the Canton Foundation. Gate 5 checks every generated module for additive-only field structure and correct @daml.upgrade annotation usage before any DAR upload. Every export includes UPGRADE_NOTES.md documenting the upgrade path for already-deployed contracts.

---

## What's Already Built

| Component | Status |
|---|---|
| Full pipeline (English → Contract ID) | Live on LocalNet with 402 contracts deployed |
| LocalNet Canton sandbox | Live on Railway |
| Pre-deployment audit | Live all gates passing |
| Python SDK on PyPI | Working Code in repo but to be published soon |
| Docker self-hosting | `docker-compose.yml` |
| Apache 2.0 |  Open source from day one |
| Canton 3.4 / `dpm build` |  Current SDK |

---

## Implementation

| Component | Technology |
|---|---|
| AI Orchestration | LangChain + LangGraph |
| Primary LLM | Claude claude-sonnet-4 |
| Additional LLMs | Gemini 2.5 Flash, GPT-4o (user-selectable) |
| RAG | ChromaDB: 500+ curated Daml patterns |
| Smart Contract Runtime | Canton 3.4: `dpm build`, `dpm test` |
| Backend | FastAPI + Redis + Celery |
| Frontend | Next.js + TypeScript |
| Ledger | Canton JSON Ledger API (port 7575) |
| Public Sandbox | Currently on Localnet, Will add other Sandboxes(Devnet, Testnet and Mainnet) in future |
| SDK | `pip install ginie` |
| M4: Native LLM | Ginie-1: fine-tuned on Daml corpus with RLCF |

---

## Team

BlockX AI Ltd is a UK-registered company (Companies House: [16254630](https://find-and-update.company-information.service.gov.uk/company/16254630)) Working at the intersection of innovation around AI to bring easier solutions for developers in Web3. We have been doing this for over a year: our EVI SDK, an AI-powered English-to-smart-contract layer for EVM chains, reached 47,000 weekly downloads on NPM and is used by developers building on Ethereum, Polygon, and Base who had never written Solidity before. That product taught us the demand is real: developers want to describe what a contract should do and get something that works. We built Ginie because the same gap exists on Canton and the stakes are higher: Daml is significantly harder than Solidity, and the institutional finance use case means the contracts need to be genuinely safe, not just compilable. That is why the audit layer is the core of what we built.

Every person below is funded exclusively for their Ginie grant deliverables.

| Person | Role | Deliverables | Rate |
|---|---|---|---|
| Vijendra Dhanotiya | Product Director | Architecture, milestone delivery, Canton BD, grant reporting | $1,400/mo |
| Satyam Singhal | AI/ML & Daml Lead | LLM pipeline, RAG, agents, Ginie-1 RLCF, ginie-eval | $1,400/mo |
| Sarthak Vyas | Backend Engineer | FastAPI, GinieNet infra, CI/CD, SDK, Canton Ledger API | $1,000/mo |
| Agrim | Frontend Engineer | Next.js, contract editor, IDE plugin UI | $400/mo |
| Senior Daml Engineer *(hire M2–M3)* | Canton specialist | Validates all 50 RAG patterns. IDL Extractor. SCU Gate 5. | $2,000/mo · 3mo |
| ML/FT Engineer *(hire M4)* | Training specialist | Ginie-1 training. RLCF pipeline. M4 full run. | $3,800/mo · 1mo |

All 4 core members active in every milestone.

---

## Milestones

### Milestone 1: Production MVP
**Week 4 · 118,800 CC · ~$18,000**

Pipeline is already live. M1 delivers the full public release: 20 validated institutional templates, SCU audit gate, SDK on PyPI, CI/CD benchmark.

**Deliverables:**
- 20 institutional templates: repo, bond, DvP, custody, IOU, AML, multi-party: each with a live Contract ID on GinieNet
- SCU Gate 5: `@daml.upgrade` validation + `UPGRADE_NOTES.md` in every export bundle
- Python SDK v0.1.0 on PyPI
- Docker + `docker-compose.yml` one-command self-hosting
- GitHub Actions CI/CD + 100-prompt benchmark
- `schemas/idl-spec.json`: canonical IDL spec unlocking M2
- ≥100 distinct parties on Canton Mainnet ledger: contingent on Testnet migration completing within M1 window. If migration extends beyond M1, this target moves to M2.
- LocalNet: **≥500 distinct parties** on ledger, verifiable at [canton.ginie.xyz/explorer](https://canton.ginie.xyz/explorer) (baseline: 156 today)
- SCU upgrade agent (M2 scaffold): Writer Agent updated to generate additive-only field structure by default; daml.yaml version field set to 0.0.1 with documented upgrade path in UPGRADE_NOTES.md
- POST /admin/refresh-rag endpoint: API-accessible RAG refresh so external Daml repo ingestion (splice, daml-finance, cn-quickstart) can be triggered without filesystem access

| Line Item | Amount |
|---|---|
| Team salaries: all 4 core × 1mo | $4,200 |
| Server (GCP + Digital Ocean) | $900 |
| External Daml QA: audit spec + benchmark review | $1,700 |
| Contingency + M1–M2 bridge | $11,200 |
| **Total M1** | **$18,000** |

---

### Milestone 2: Full-Stack dApp Builder + MCP
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
- GitHub integration: every Ginie generation auto-commits Daml source, daml.yaml, audit report, and UPGRADE_NOTES.md to a user-owned GitHub repo. Each /iterate call creates a pull request against that repo: auditable version history, re-compilable after any SDK upgrade, zero dependency on Ginie for ongoing maintenance.
- SCU upgrade agent: accepts existing .daml source + current version → generates new version with upgradeFrom annotation → validates additive-only field compatibility → bumps daml.yaml version. Completes the upgrade workflow that Gate 5 enforces at deploy time.
- Canton Skills library (Apache 2.0): community PR workflow for external Daml pattern contributions. harvest_patterns.py targets digital-asset/daml, daml-finance, splice, cn-quickstart, ex-models. Any OSS repo added via POST /admin/refresh-rag: no filesystem access required. https://github.com/BlockX-AI/Canton_skills

| Line Item | Amount |
|---|---|
| Team salaries: 4 core + Sr Daml Eng × 2mo | $12,400 |
| Server | $700 |
| LLM API: Claude claude-sonnet-4 (~2M input · ~400K output tokens) | $6,000 |
| GPU: A100 data pre-processing (243 hrs @ $2.06/hr) | $500 |
| CIP-0103 compliance review | $1,600 |
| MCP security review | $1,500 |
| M2–M3 bridge buffer | $5,000 |
| **Total M2** | **$27,700** |

---

### Milestone 3: IDE Extensions + ML Data Collection + Canton Skills
**Week 20 · 273,240 CC · ~$41,400**

**Deliverables:**
- IDE extensions: VS Code + Cursor + JetBrains: inline generation, deploy from IDE, audit sidebar
- Canton Skills: open-source Daml pattern library, Apache 2.0, community PR workflow
- Policy engine: org-level rules and approval gates
- Multi-workspace org management for the Instituional enterprise grade usage. 
- RAG expanded to 50 validated institutional patterns: Senior Daml Engineer validates every one
- External corpus ingestion: Canton Skills library accepts community PRs and operator-submitted git repos via POST /admin/refresh-rag. Enterprise users can point the RAG indexer at their own internal Daml codebase for fully air-gapped operation with private patterns.
- H100 ablation study: 3 base model comparisons + hyperparameter search → optimal M4 training config
- ML Engineer joins: RLCF pipeline design + M1–M2 data prep + M3 GPU ablations
- More than **≥2000 distinct parties** on Canton Mainnet ledger

| Line Item | Amount |
|---|---|
| Team salaries: 4 core + Sr Daml Eng (final month) × 2mo | $10,400 |
| Server | $1,000 |
| LLM API: Claude claude-sonnet-4 (~1.8M input · ~350K output tokens) | $5,000 |
| GPU: H100 ablations (767 hrs @ $11.08/hr) | $8,500 |
| Canton docs + Daml internals access | $2,000 |
| External Daml specialist: 10 highest-risk patterns | $1,500 |
| External security audit: full system | $2,000 |
| M3–M4 bridge buffer | $11,000 |
| **Total M3** | **$41,400** |

---

### Milestone 4: Ginie-1 Full Training + Apache 2.0 Release
**Week 24 · 151,140 CC · ~$22,900**

M3 does the preparatory work. M4 executes the full training programme, evaluation, and open-source release.

**Deliverables:**
- **Ginie-1:** SFT 3-epoch + 5-round RLCF on M1–M3 Canton compiler feedback corpus · ≥95% first-pass compile on ginie-eval · GGUF/ONNX CPU inference · Docker air-gapped image · Apache 2.0 on HuggingFace
- **ginie-eval results:** Ginie-1 vs Claude vs GPT-4o: published openly including failure modes
- **Ginie SDK v2.0:** Ginie-1 as default backend · full CI/CD · multi-party archival patterns
- **Full Apache 2.0 release:** GinieNet infra scripts · RAG corpus (50 patterns) · model weights · training pipeline
- Canton Featured App nomination submitted
- More than **≥5000 distinct parties** on Canton Mainnet ledger

| Line Item | Amount |
|---|---|
| Team salaries: 4 core + ML Eng × 1mo | $8,000 |
| Server | $400 |
| LLM API: evaluation + ginie-eval benchmark | $2,000 |
| GPU: 2× H100 parallel (406 hrs each · 60% utilisation) | $9,000 |
| External smart contract audit: Ginie-1 output on 20 institutional templates | $900 |
| Independent ML engineer review: RLCF reward function validation | $1,000 |
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

## Ginie-1: Canton's Native AI Layer

Every AI contract tool today depends on external API providers. For regulated institutions this creates cost dependency, privacy risk, and reliability risk. A regulated bank can run Ginie-1 on their own infrastructure with no external API call, no data leaving their network, and no compliance exposure: the weights are Apache 2.0 on HuggingFace and the Docker image runs fully air-gapped.

| Attribute | Specification |
|---|---|
| Base model | Mistral 7B or Qwen 2.5-Coder |
| Training | SFT + RLCF: Canton compiler feedback as reward signal |
| Target | ≥95% first-pass compile on ginie-eval |
| Runtime | GGUF/ONNX: CPU inference, no GPU required |
| Deployment | Single Docker image: fully air-gapped for banks |
| License | Apache 2.0: open weights on HuggingFace |

---

## What Changes After Ginie

Canton today has less developers globally. The ecosystem grows when institutions join but the developer base that actually builds on it stays thin. Ginie is our attempt to change that by removing the one thing that stops most web3 developers from even trying: Daml.

We saw this problem up close. The EVI SDK we built for EVM chains hit 47,000 weekly downloads not because we marketed it but because developers wanted to describe a contract and get something working without spending weeks on syntax. The same demand exists on Canton. We know because we watched people try and leave.

| User | Today | After Ginie |
|---|---|---|
| EVM developer | Looks at Daml, finds it hard to build, goes back to Solidity | Describes the contract, deploys on Canton, stays |
| Rust | Party semantics and Haskell-derived types have no equivalent in anything they've built before | Ginie handles that translation, they focus on the logic |
| DeFi protocol founder | Has to hire a Daml specialist before prototyping anything | Prototypes themselves, validates the idea, then brings in Daml expertise for production |
| Web3 indie builder | Months of training before a single contract compiles cleanly | First Canton contract deployed the same day they find the ecosystem |
| Regulated bank | Cannot send financial contract specs through an external AI API | Runs Ginie-1 on their own server, nothing leaves their infrastructure |
| Institutional PM | Needs a developer briefed and available before anything gets built | Describes the workflow from domain knowledge, has something to show the technical team |

We already have 402 contracts deployed from community members who had never written Daml. That is not a projection. That is what happened in two months with private invite-only access.

```
Daml barrier drops
         ↓
EVM and Rust builders enter Canton for the first time
         ↓
More contracts on the Global Synchronizer
         ↓
Stronger Burn-Mint Equilibrium
         ↓
Institutions see working proof-of-concept on their own workflows
         ↓
Canton grows from both ends at once
```

---

## Long-Term Sustainability

Ginie will keep running after the grant ends because we are not building infrastructure that depends on grant funding to stay alive. The RAG corpus and Canton Skills library are Apache 2.0 from day one: the community owns them and can maintain them independent of BlockX AI. Ginie-1 ships with open weights on HuggingFace, which means the model runs on anyone's infrastructure permanently with no dependency on us. We have done this before: the EVI SDK has been running on NPM for five months at 47,000 weekly downloads with no grant support. The same model applies here.

The sandbox environment follows the same principle. Ginie currently supports Localnet for immediate development and testing. As permissions are granted, we will progressively integrate Devnet, Testnet, and Mainnet: giving developers a clear, structured path from building an MVP on Localnet, validating on Devnet, stress-testing on Testnet, and deploying with confidence on Mainnet. Each sandbox serves a distinct stage of the development lifecycle, and users will be able to select the appropriate environment directly within Ginie based on their use case. This progression is built into the roadmap, not dependent on it.

And if BlockX AI ever ceased to operate, every piece of this stack: including the sandbox integrations: is forkable by any Canton community member the same day.

---

## Rationale

Ginie is the right use of Dev Fund resources for three reasons. First, it exists and works: 402 contracts deployed, 156 parties, two months of live operation, and unsolicited community feedback calling it a game-changer for non-Daml builders. Second, it fills a gap no other funded project addresses. CCTools helps users discover Canton. Seaport and Daml Autopilot serve developers already inside Canton. Ginie gets developers to Canton who would otherwise never arrive. Third, the Apache 2.0 release strategy means the RAG corpus, Ginie-1 model weights, and infrastructure scripts become permanent ecosystem assets: not BlockX AI proprietary products. The EVI SDK proved this model works: open tooling that solves a real developer problem grows without a marketing budget.

---

## Links

| Resource | URL |
|---|---|
| Live app | [canton.ginie.xyz](https://canton.ginie.xyz) |
| Social Media Community handle | [@giniedev](https://x.com/giniedev) |
| Repository | [github.com/BlockX-AI/Canton_Ginie](https://github.com/BlockX-AI/Canton_Ginie) |
| BlockX AI Ltd (UK) | [Companies House 16254630](https://find-and-update.company-information.service.gov.uk/company/16254630) |
| Contact | info@blockxai.xyz |
