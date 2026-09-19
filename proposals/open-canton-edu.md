## Development Fund Proposal

**Author:** Hashclaw.AI  
**Created:** 2026-04-11  
**SIG alignment:** **Application developers** — **App Building and Developer Experience** (documentation, examples, training), per [Development Fund Proposal Review Process](https://github.com/canton-foundation/canton-dev-fund/blob/main/Development%20Fund%20Proposal%20Review%20Process.md).  
**Label:** daml-tooling  

**Champion:** Nguyan Vinh — **@v9n**

---

## Abstract

**CC Privacy Club** ([HashClawAI/canton-edu](https://github.com/HashClawAI/canton-edu)) is an independent, open-source hub for **Canton Network** learning material (EN/ZH today), with explicit **non-official** positioning and links to **official** documentation.

This proposal requests **Canton Coin (CC)** to implement **Agentic Education** for Canton: **software agents** (e.g. Cursor **Skills**, scripted bots, or CI companions) that **assist maintainers**—**proposing** aggregation refreshes, **drafting** bilingual units (**news / digest / chronicle**, **research reader guides**, **video cards**, glossary & explainers—§1.4), **preflighting** i18n key coverage, and **summarizing** public on-chain/indexer series—while **every publish path** stays **human-reviewed**, **PR-based**, and **source-anchored**. Concretely, **(1) agent-orchestrated aggregation** (allow-listed sources, dedup, **daily** rebuild/deploy), **(2) agent-assisted education generation** (draft → checklist → maintainer merge, **primary-source URLs**), and **(3) agent-informed on-chain / explorer analysis** (reproducible snapshots, **explicit methodology**, **not** official statistics). Milestones also cover **`ja`/`ko` i18n**, **production launch + IA**, **agent playbooks + evaluation logs**, and **12 months** maintenance with quarterly updates. **Developer-community event series are out of scope** (§1.3). Deliverables are **objectively verifiable** (manifests §1.4, **`docs/agentic-education/`**). **Funding request: 200,000 CC** (§6.2).

---

## 1. Objective and scope

### 1.1 Problem and ecosystem value

| Dimension | Problem | Ecosystem value |
|-----------|---------|-----------------|
| **Signal vs noise** | Official and community Canton signals are **scattered** (CIPs, forums, blogs, APIs); learners lack a **single neutral index** that still **points upstream**. | **Aggregation** with transparent sources reduces duplicate hunting and improves **CIP / doc literacy**. |
| **Education throughput** | Turning raw updates into **structured explainers** (EN/ZH, later JA/KO) is **labor-intensive**; quality drops without checklists. | A **repeatable generation + review** pipeline produces **consistent** educational snippets without posing as authoritative specs. |
| **Trust** | Unofficial summaries can read “official.” | **Disclaimers**, **verify-at-source** links, and **Development Fund** credit. |
| **Sustainability** | Aggregators rot when feeds break. | **12-month maintenance SLA**, **daily** automated rebuild where configured, monitoring, and documented runbooks. |
| **On-chain / indexer literacy** | Learners see headlines but not **how** to relate claims to **public explorer or API data**. | **Reproducible** on-chain or indexer-backed figures and **methodology** improve critical reading—**always** labelled as third-party index data, not Canton Foundation truth. |
| **Agentic maintainability** | Ad-hoc LLM chats **lack traceability**; teams burn time re-explaining the same merge policy. | **Documented agent playbooks** (prompts, tools, **refusal rules**) turn recurring education updates into **repeatable** human–agent **work items** without autonomous publishing. |

### 1.2 In scope

- **M1 — Site launch & IA for aggregation:** Production readiness (§4): disclaimers, performance/accessibility smoke, deploy reliability, **information architecture** notes for which surfaces are **aggregated vs hand-authored**, **launch announcement** + baseline metrics.  
- **M2 — Multilingual:** **i18n helper** (docs + scripts) with **distinct `ja` and `ko`** checks (e.g. `i18n:check:ja` / `i18n:check:ko`), `docs/i18n.md` + `docs/i18n/ja.md` + `docs/i18n/ko.md`, **two** parity reports; **ship** `ja` + `ko` UI on home + nav + **Learn** entry (minimum) or documented **`gaps-ja.md` / `gaps-ko.md`**.  
- **M3 — Agentic aggregation, daily refresh, assisted generation & on-chain analysis:** **Agentic education layer:** shipped under **`docs/agentic-education/`** — `README.md` (scope), **`playbooks.md`** (maintainer-facing agent workflows: aggregation PR prep, EN/ZH draft, i18n gap triage, on-chain digest), **`guardrails.md`** (must-cite-official, must-not-claim-endorsement, stop conditions), and **`eval-log.md`** with **≥10** recorded trial scenarios (input → agent output → human verdict). **Aggregation + daily refresh:** `docs/aggregation/sources.md`, `docs/aggregation/runbook.md`, **`docs/operations/daily-update.md`** tying **≥1×/calendar-day** **GitHub Actions** full build + deploy to refresh allow-listed feeds and **on-chain snapshot** jobs (**~20:00 CST** cadence per repo). **≥8** **aggregation integration PRs** in **`docs/grants/m3-aggregation-prs.md`**. **Generation:** `docs/content-generation/workflow.md` (**human-in-the-loop agentic** pipeline: agent proposes diff → maintainer edits → merge), checklist, **`docs/grants/m3-generation-units.md`** with **≥18** units (§1.4); **≥6** rows flagged **`agentic: true`** with **`playbook_id`** referencing `playbooks.md`; **≥4** rows **`onchain:true`** with **`docs/onchain/methodology.md`** + **`docs/onchain/sources.md`**. No narrative ship without **maintainer** approval per §1.4.  
- **M4 — Maintenance:** **12 months** from M1: **≥10** maintenance PRs (or batched equivalents), **≥4** quarterly public update posts, `docs/grants/maintenance-log.md` including **weekly** rollup of **daily** build success/failure (link to Actions), and `docs/grants/final-report.md` covering **agentic workflow adoption** (time saved, failure modes), **aggregation**, **daily refresh**, **generation quality**, and **on-chain analysis** outcomes.

### 1.3 Out of scope (explicit)

- **Not** protocol, node, or synchronizer engineering. **Not** custody, trading, or token sales.  
- **Not** implying Canton Foundation / Digital Asset / Canton Network **endorsement**.  
- **Not in this proposal:** **Developer-community event programs** (meetups, salons, conferences, travel budgets, RSVP campaigns, or **Canton Foundation–coordinated** physical/hybrid event series).  
- **Not** fully automated “write production DAML” systems; generation stays **educational**, **source-linked**, and **human-gated**.  
- **Not** **unsupervised** agent merges to `main`: agents **propose**; **humans** approve (see **`docs/agentic-education/guardrails.md`**).  
- **Not** operating a **validator**, **not** using **non-public** chain or participant data; on-chain work uses **public explorer/API** endpoints only, per **`docs/onchain/sources.md`**.

### 1.4 Definitions & counting rules

**Education content unit** — counts toward **≥18** only if the row is in **`docs/grants/m3-generation-units.md`** *after* human merge. **One row = one shipped learning artifact** (site or agreed `docs/education/` surface), any of the shapes below; same mechanical rules for all.

| Shape | One unit |
|-------|----------|
| **News / digest / chronicle** | Dated item or digest block: **what changed**, **why it matters to builders**, **≥1 primary URL** (official post, CIP, repo release). |
| **Research / long reads** | Short **reader guide** (not a full reprint): thesis in plain language, **link to PDF / repo / canonical page**. |
| **Video** | **Curated card**: title, **≤2 sentence** context, **canonical watch URL** (official or allow-listed channel); transcript pull-quote optional if permitted by source. |
| **Glossary / Learn blurb / explainer** | As today: coherent paragraph(s) with **verify-at-source** links. |

**Mechanical thresholds (every unit row):** **EN ≥90 characters** (excluding URLs) **or** substantive **ZH** equivalent in the same row; **≥1 canonical primary-source URL** per shipped language (ZH deferral allowed if noted in the row). **≥6** / **18** rows: **`agentic: true`** + **`playbook_id`** (anchor in **`playbooks.md`**) + **merge SHA** (agents **never** self-merge). **≥4** / **18** rows: **`onchain:true`** — includes a **chart, table, or numeric call-out** from **`docs/onchain/sources.md`**, interpreted per **`docs/onchain/methodology.md`** (lag, reorgs, non-official). *`onchain:true` may overlap `agentic:true`.*

**Aggregation integration PR** — counts toward **≥8** only in **`docs/grants/m3-aggregation-prs.md`**: merged PR whose **primary diff** stays inside allow-listed paths in **`docs/aggregation/sources.md`** (e.g. `scripts/**`, `.github/workflows/**`, `docs/aggregation/**`, agreed `public/generated/**` or `src/data/**`). **≤2** PRs may add **trivial** `translations.ts` **labels only**, flagged `aggregation+labels`; they count for **8**, **not** for **18**, unless a **separate** generation-unit row exists.

**GitHub routine maintenance** — **does not** count toward **8** or **18**; it satisfies **M4** when logged in **`docs/grants/maintenance-log.md`**. Examples: **dependency / security updates** within policy, **Actions** or Pages pipeline fixes, **issue / label triage**, README or runbook nips, branch-protection or token hygiene (**GitHub-only** secrets). Net-new learner copy belongs in **generation units** or **aggregation** manifests per rules above, not “maintenance” by label alone.

**Double-count:** one merge may not bump **8** and **18** unless the **`aggregation+labels`** exception applies **and** a **distinct** generation-unit row is added.

**Reviewer sign-off:** **`MAINTAINERS.md`** — **≥2** merge-capable reviewers for **generation** PRs; **Champion @v9n** — **≥4** spot-checks on merged **generation** PRs (**including agent-opened or agent-assisted** drafts); notes in milestone thread or **`docs/grants/champion-spotchecks.md`**.

---

## 2. Technical approach

| Workstream | Approach | Verifiable outputs |
|------------|----------|---------------------|
| **Site** | Astro static site, `src/i18n/translations.ts`, GitHub Actions → Pages; open `LICENSE`. | Tag + CI green + live URL in milestone note. |
| **Launch (M1)** | Checklist + link sweep + **IA doc** `docs/grants/m1-aggregation-ia.md` listing which pages are **aggregated feeds** vs static narrative; stub **`docs/operations/daily-update.md`** pointing to Actions schedule; stub **`docs/agentic-education/README.md`** (1-page vision). | Artifacts under `docs/grants/m1-launch/` + IA + stubs on `main`. |
| **i18n (M2)** | Per-locale **`ja` / `ko`** checks; reports `i18n-report-ja.*`, `i18n-report-ko.*`. | Helper + routes + reports merged. |
| **Aggregation + daily refresh (M3a)** | Allow-listed HTTP/RSS/mail-public sources; rate limits; **daily** workflow refresh in CI; normalize to typed entries; fail-soft with **uploaded** CI logs on failure. | `docs/aggregation/runbook.md` + `docs/operations/daily-update.md` + **≥8** PRs listed in **`m3-aggregation-prs.md`**. |
| **Agentic education (M3d)** | Maintainer **agents** (Cursor **Skills** under `.cursor/skills/` and/or documented CLI flows) run **bounded** tasks: open PR with prefilled template, never push to `main` alone. | **`docs/agentic-education/`** complete set + **`eval-log.md`** (**≥10** scenarios); **`.cursor/skills/`** updates as needed. |
| **Education generation (M3b)** | **Agent proposes** diff from playbook → human edits → PR checklist → merge; **manifest** `m3-generation-units.md`. | `docs/content-generation/workflow.md` + **≥18** manifest rows (**≥6** `agentic: true`). |
| **On-chain analysis (M3c)** | **Agent may draft** chart captions; **human** validates methodology; read-only public APIs. | `docs/onchain/methodology.md` + **≥4** `onchain:true` rows + frozen artifact paths. |
| **Maintenance (M4)** | `MAINTAINERS.md`, `docs/sustainability.md`, `docs/grants/maintenance-log.md` with **weekly** digest of **daily** build health. | Log + quarterly links + final report. |

**i18n helper — `ja` vs `ko`**

- **Japanese (`ja`):** Missing-key / orphan-key diffs; line-length hints as needed.  
- **Korean (`ko`):** **Separate** entrypoint and report from `ja`; formal-register UI baseline notes.  
- **Shared:** Fail-closed or documented manual gate under agreed coverage thresholds.

**Backward compatibility:** No Canton protocol, node, or SDK changes.

---

## 3. Architectural alignment

- **Developer experience & training** — per [Development Fund Proposal Review Process](https://github.com/canton-foundation/canton-dev-fund/blob/main/Development%20Fund%20Proposal%20Review%20Process.md); **agentic** workflows are **maintainer-facing** (draft PRs, checklists), not learner-facing autonomous tutors.  
- **CIP / official docs literacy** — [canton-foundation/cips](https://github.com/canton-foundation/cips) and official docs are **cited**, not replaced.  
- **Program fit** — [Canton Development Fund](https://github.com/canton-foundation/canton-dev-fund): public good, transparent milestones, CC reporting (**CIP-0082**, **CIP-0100** as context).

---

## 4. Milestones and deliverables

### Milestone 1 — Site launch, IA & production readiness (Week 8)

- **Deliverables:** `docs/grants/m1-launch/checklist.md`; Lighthouse or equivalent export; `m1-links.md`; **`docs/grants/m1-aggregation-ia.md`**; **`docs/operations/daily-update.md`** (stub, **daily** rebuild Actions); **`docs/agentic-education/README.md`** (**Agentic Education** scope); public launch post URL; `docs/grants/m1-traffic.md` baseline.  
- **Verification:** Tag `milestone-m1` + paths on `main`.

### Milestone 2 — Multilingual support & i18n helper (`ja` + `ko`) (Week 18)

- **Deliverables:** `docs/i18n.md`, `docs/i18n/ja.md`, `docs/i18n/ko.md`; helper + **two** reports; shipped **`ja`/`ko`** routes (or gap files + plan); EN/ZH CI clean.  
- **Verification:** CI logs + URLs in milestone note.

### Milestone 3 — Agentic aggregation, daily refresh, assisted generation & on-chain analysis (Week 32)

- **Agentic education package:** `docs/agentic-education/playbooks.md`, **`guardrails.md`**, **`eval-log.md`** (**≥10** scenarios), cross-links from `docs/content-generation/workflow.md`; **`.cursor/skills/`** updates on `main` if applicable.  
- **Aggregation + daily refresh:** `docs/aggregation/sources.md`, `docs/aggregation/runbook.md`, completed **`docs/operations/daily-update.md`** (cron, secrets policy **none** or GitHub-only, failure alerting path); **≥8** PRs in **`docs/grants/m3-aggregation-prs.md`**; **≥30** consecutive calendar days **≥95%** daily workflow success (documented; platform-wide outages excluded).  
- **On-chain analysis:** `docs/onchain/sources.md` + **`docs/onchain/methodology.md`**; snapshot scripts + **≥4** `onchain:true` manifest rows with artifacts.  
- **Generation:** `docs/content-generation/workflow.md` + checklist; **`m3-generation-units.md`** **≥18** rows; **≥6** with **`agentic: true`** + valid **`playbook_id`**.  
- **Verification:** Spot-check **3** random `agentic:true` rows against **`eval-log.md`** patterns; **all 4** `onchain:true` rows; Champion **≥4** spot-checks on agent-opened or agent-assisted PRs.

### Milestone 4 — Ongoing maintenance & annual close-out (Month 12 from M1)

- **Deliverables:** `docs/grants/maintenance-log.md` (**≥10** editorial/engineering cycles **plus** **≥48 weekly** one-line summaries of **daily** build health—**~1 per week** over the grant), **≥4** quarterly update links, `docs/grants/final-report.md` (**agentic** adoption metrics, **daily** refresh reliability, **aggregation** error budgets, **generation** throughput, **on-chain** lessons).  
- **Verification:** Merged files + links.

---

## 5. Acceptance criteria

1. **M1:** All §4 M1 artifacts on `main` (including **`docs/operations/daily-update.md`** stub + **`docs/agentic-education/README.md`**); disclaimers accurate; **IA doc** lists aggregation boundaries.  
2. **M2:** Separate **`ja`/`ko` validation**; shipped routes or documented gaps + plan.  
3. **M3:** **`docs/agentic-education/`** contains **`playbooks.md`**, **`guardrails.md`**, **`eval-log.md`** (≥10 scenarios); **`m3-aggregation-prs.md`** ≥8; **`m3-generation-units.md`** ≥18 per §1.4 with **≥6** `agentic:true` + **`playbook_id`** and **≥4** `onchain:true`; **daily** workflow **≥30** days **≥95%** green; allow lists respected; **Champion** ≥4 spot-checks; **no** agent-only merges to `main`.  
4. **M4:** Maintenance log (including **weekly daily-build** rollup) + quarterly posts + final report.  
5. **No false authority** throughout.  
6. **Public good:** repo public; new prose defaults **CC-BY 4.0** where not otherwise constrained by third-party quotes.

---

## 6. Funding request and milestone breakdown

### 6.1 Total request

**200,000 CC** = **30,000 (M1) + 20,000 (M2) + 30,000 (M3) + 120,000 (M4)**. **M1:** launch and aggregation IA. **M2/M3:** i18n and agentic pipelines. **M4:** **12 × 10,000 CC** for twelve months of maintenance (ops, quarterly posts, final report). Final amounts follow **Canton Development Fund** Committee process.

### 6.2 Requested CC (**200,000 CC**)

| Milestone | CC | Rationale |
|-----------|-----|-----------|
| M1 — Launch + aggregation IA | **30,000** | Production hardening, IA, analytics baseline, first public cut of **daily** + agentic stubs. |
| M2 — Multilingual + i18n (`ja` + `ko`) | **20,000** | Helper + **separate `ja`/`ko` QA** + shipped routes or documented gaps. |
| M3 — Agentic aggregation + assisted generation + on-chain | **30,000** | Pipelines, **playbooks/eval**, editorial, **agent API** if used (§6.3). |
| M4 — 12-month maintenance (**12 × 10,000 CC**) | **120,000** | Ops; **CC** at maintenance **month 1** and **month 6** (below). |
| **Total** | **200,000** | |

**M4 CC release:** **60,000 CC** after **maintenance month 1** acceptance (`maintenance-log.md` started, **weekly** daily-build rollup, §5 M4 on track); **60,000 CC** after **maintenance month 6** acceptance (mid-grant review). **120,000 CC** total M4 = **12 × 10,000 CC** planning basis. Invoicing per **Fund / Committee** rules.

### 6.3 M3 budget — example mapping (**30,000 CC**)

| Sub-item | CC (band) | Notes |
|----------|------------|-------|
| Aggregation + **daily** CI engineering (scripts, workflows, monitoring) | 7,000–11,000 | Rate limits, retries, **per-day** job reliability |
| **Agentic education** (playbooks, guardrails, **eval-log**, Skill wiring) | 3,000–5,000 | Maintainer-facing; **no** unsupervised prod bots |
| Human editorial + fact-check for generated units | 6,000–9,000 | **≥18** units × review depth (**includes** agentic rows) |
| **On-chain / explorer API** usage & snapshot storage | 2,000–5,000 | Public indexers only; ToS-respecting quotas |
| Optional **agent** LLM/API (draft assist only) | 0–5,000 | Omit if no third-party LLM budget |
| Source hygiene / legal spot-check (quotes, logos) | 2,000–4,000 | Brand-kit compliance for on-site graphics |
| Contingency | remainder | Feed/API or upstream schema changes |

**Payment:** **M1–M3:** CC on milestone **acceptance** (§5). **M4:** **§6.2** (months **1** and **6**). **>6-month** grants: **6-month re-evaluation** if required by program rules.

---

## Adoption and distribution plan

| Channel | Action |
|---------|--------|
| **Site** | RSS/sitemap where applicable; **“Last refreshed”** on aggregated and **on-chain** sections; README badge or link to **Actions** daily workflow. |
| **Repository** | Runbooks, **`docs/agentic-education/`**, and Skills **reusable by forks** (swap disclaimers + sources). |
| **Public venues** | **≥4** quarterly posts (forum / X / Discord—**follow channel rules**) pointing **first** to official docs for normative claims; **≥1** post may highlight a **reproducible on-chain** chart with methodology link. |
| **Quantitative habit** | Maintenance log captures **weekly** **daily** build pass rate; final report states **median** days-to-recover from aggregation failure (if any). |
| **Foundation** | Co-marketing when offered; **no** event-series obligations in this grant. |

---

## Evidence of technical capability

- Shipped stack: [HashClawAI/canton-edu](https://github.com/HashClawAI/canton-edu) — Astro, bilingual `translations.ts`, GitHub Actions.  
- **Live site** URL at submission.  
- **Scheduled refresh:** documented **daily ~20:00 CST** build/deploy and chart jobs (`translations.ts` **`home.buildSyncIntro`** / **`buildSyncItems`**, `npm run chart:build`, CI)—extended here to **allow-listed aggregation** and **on-chain snapshots** under the same **daily** gate.  
- **Maintainer agents:** **`.cursor/skills/`** in repo; this work **formalizes** **`docs/agentic-education/`** playbooks and **`eval-log.md`**.  
- **EN/ZH:** prior `translations.ts` PRs at scale.

---

## Open-source and reusable outputs

| Output | License |
|--------|---------|
| Site + scripts | Repo `LICENSE` |
| Runbooks, **agentic-education** docs, workflow templates, on-chain methodology | **CC-BY 4.0** (default) |
| i18n helper | Same as repo |

---

## Co-Marketing

Milestone notes for Foundation channels where appropriate; **Canton Development Fund** credit in contribute / about per [brand kit](https://www.canton.network/brand-kit-trademark-use).

---

## Rationale (summary)

**Agentic Education** for maintainers (**agents propose**, **humans merge**): aggregation, **daily** refresh, on-chain explainers, assisted generation, **`ja`/`ko`**, **12-month** maintenance—verified via **manifests**, **`eval-log.md`**, and repo artifacts. **CC** funds **playbooks, evaluation, and guardrails** for auditable public-good delivery.

---

## Mapping to `proposals/_template.md`

| `_template.md` section | Location in this proposal |
|------------------------|---------------------------|
| Abstract | Abstract |
| Specification — Objective | §1 Objective and scope |
| Specification — Implementation | §2 Technical approach |
| Specification — Architectural alignment | §3 Architectural alignment |
| Specification — Backward compatibility | §2 (footer) |
| Milestones and deliverables | §4 |
| Acceptance criteria | §5 |
| Funding | §6 |
| Co-Marketing | Co-Marketing |
| Motivation | Abstract; §1.1 |
| Rationale | Rationale (summary) |

---

## References

- [github.com/canton-foundation/canton-dev-fund](https://github.com/canton-foundation/canton-dev-fund)  
- **CIP-0082**, **CIP-0100**  
- **grants-discuss@lists.sync.global** · **dev-fund@canton.foundation**  
- [Canton brand & trademark use](https://www.canton.network/brand-kit-trademark-use)
