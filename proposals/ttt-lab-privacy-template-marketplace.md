Author: TTT Lab (Vietnam)
Status: Draft
Created: 2026-04-10

**Contact:** phil@ttt.zone · Discord: hermitrat1233
**GitHub:** https://github.com/ttt-labs
**Website:** https://ttt.zone

## Summary

The Open-Source Daml Privacy Template Marketplace is a **production-ready, GTM-launchable** web platform inspired by OpenZeppelin Contracts Wizard. Developers can browse, search, preview, customize, and instantly download production-ready Daml contract templates with built-in Canton privacy best practices. An interactive wizard allows configuration of parties, observers, and disclosure rules, with a real-time privacy preview showing exactly which data each party can see — all before writing a single line of code.

This platform serves as a **one-stop hub for high-quality, privacy-first Daml templates**, dramatically reducing boilerplate and eliminating the most common privacy configuration mistakes that new and experienced builders encounter.

**GTM-ready status:** TTT Lab has a functional prototype with 12 curated templates tested on local devnet. Upon receiving mainnet validator allocation, we will **activate the production Marketplace within 24 hours**, seed it with all templates, and begin driving real transaction volume through template downloads, live previews, and on-chain template validation flows.

---

## GTM Plan (Go-to-Market)

### Mainnet Activation Timeline

| Day | Action |
|-----|--------|
| **Day 0** | Receive mainnet validator allocation |
| **Hour 1–6** | Deploy production Marketplace backend to mainnet validator; configure preview engine against mainnet ledger |
| **Hour 6–12** | Validate all 12+ templates compile and execute correctly on mainnet |
| **Hour 12–24** | Public launch announcement via Canton Discord, Forum, X/Twitter, and TTT Lab channels |
| **Day 2–7** | Onboard first 50 developers; run "Template Sprint" kickoff event to drive downloads |
| **Week 2–4** | Launch community template submission campaign with incentive badges |
| **Month 2–3** | Apply for **Featured App** status based on transaction activity and download metrics |

### Transaction Volume Generation Strategy

Every interaction with the Marketplace generates **real on-chain transactions** against the Canton ledger:

- **Template preview transactions** — the live privacy preview engine executes Daml contracts on the ledger to display real-time visibility maps
- **Template validation transactions** — each template download triggers on-chain compilation verification and privacy correctness checks
- **Wizard customization transactions** — the interactive wizard generates and validates custom Daml code on-chain in real time
- **Community rating transactions** — template reviews and ratings are recorded as on-chain attestations for transparency and immutability
- **Version compatibility checks** — automated Canton SDK version validation generates ledger transactions

**Projected on-chain activity:**
- **Month 1:** 100 template downloads × ~6 preview/validation transactions each + 50 wizard sessions × ~10 transactions each = **~1,100 transactions/week**
- **Month 3:** 500 downloads/month × ~6 transactions + 200 wizard sessions × ~10 transactions + community submissions = **~5,500 transactions/week**
- **Month 6:** 1,000+ downloads/month with sustained community activity generating **consistent, growing transaction volume**

### Go-to-Market Channels

1. **Canton Discord & Forum** — Daily presence, weekly "Template of the Week" spotlights, builder Q&A
2. **X/Twitter** — Launch campaign, template showcases, developer success stories
3. **"Template Sprint" Campaign** — 4-week gamified hackathon encouraging community template contributions with leaderboard and badges
4. **Integration partnerships:**
   - **DamlHat**: `damlhat init --template marketplace` integration to pull templates directly from the Marketplace
   - **cn-quickstart**: Feature Marketplace templates as recommended starting points in quickstart guides
   - **Privacy Workflow Simulator**: One-click "Validate in Simulator" button on every template
5. **Content marketing** — Blog posts, video tutorials, and a "Canton Privacy Cookbook" published under Canton documentation umbrella
6. **Developer conferences** — Demos at Canton community events and blockchain developer meetups in APAC

### Featured App Qualification Path

Per Canton's Cantonomics model, Featured Applications receive **62% of the total rewards pool** based on transaction activity. TTT Lab's activation plan:

1. **Pre-launch:** Functional devnet/testnet deployment with 12+ templates and reference link provided to Canton Foundation
2. **Launch day:** Activate on mainnet within 24 hours of validator allocation
3. **Month 1–2:** Demonstrate consistent download volume, template previews, and community engagement metrics
4. **Month 2–3:** Apply for Featured App status via sync.global with documented activity reports
5. **Ongoing:** Implement `FeaturedAppActivityMarker` on all template preview and validation transactions to enable reward tracking

---

## Objective and Scope

Building privacy-correct Daml contracts from scratch is time-consuming and error-prone, even for experienced developers. Common patterns — escrow, credential issuance, multi-party voting, delegated authority — are reimplemented project after project with varying quality and inconsistent privacy practices.

This project provides:

- A **curated template library** launching with 12+ production-ready Daml templates covering the most common use cases: escrow, credential/attestation, multi-party voting, delegated authority, atomic settlement, access control, KYC/AML workflow, subscription/licensing, supply chain provenance, insurance claim, asset tokenization, and confidential auction.
- An **interactive wizard** (inspired by OpenZeppelin Contracts Wizard) that guides developers through template customization: party configuration, observer policies, key visibility rules, and optional features — generating clean, ready-to-compile Daml code with real-time on-chain validation.
- A **live privacy preview** that displays the resulting `signatory`, `observer`, and `visibleTo` configuration in a visual diagram before download, executing real transactions on the Canton ledger for accurate visibility mapping.
- **One-click download** of customized templates as standalone Daml projects with `daml.yaml`, test scaffolding, and README — plus a "Fork on GitHub" option for version-controlled projects.
- A **community submission system** where ecosystem developers can contribute, rate, review, and version templates through a GitHub PR-based workflow with on-chain rating attestations.
- A **version compatibility checker** that validates template compatibility with the current Canton/Daml SDK release and flags upgrade requirements.

Out of scope: Canton protocol modifications, runtime services, validator/operator tooling, non-Daml languages.

## Technical Approach

- **Frontend**: Next.js 15 + React 19 with TailwindCSS v4. Interactive wizard built with multi-step form components and real-time code generation. Syntax-highlighted code preview using Shiki. Responsive design supporting desktop and tablet form factors.
- **Template storage**: Dedicated GitHub repository (`ttt-labs/canton-privacy-templates`) serving as the single source of truth. Each template includes: source `.daml` files, metadata (`template.json` — title, description, tags, party schema, version compatibility), test files, and documentation.
- **Metadata layer**: Lightweight Supabase (PostgreSQL) database for search indexing, download counts, ratings, and community profiles. All template content remains in Git for full auditability.
- **Preview engine**: Canton mainnet validator executes template contracts in real time, generating actual transaction trees. Client-side React Flow diagram renders the resulting party visibility maps.
- **Community system**: PR-based submission workflow on GitHub. Template submissions undergo automated linting (Daml compilation check, privacy pattern validation) and human review before merging. On-chain rating attestations for transparency.
- **Transaction tracking**: All preview, validation, and rating interactions emit `FeaturedAppActivityMarker` transactions for Canton reward pool eligibility.
- **Deployment**: Vercel (frontend) + Canton mainnet validator (preview engine backend) + Supabase (metadata). Fully open-source, self-hostable via Docker Compose.

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Browser Client                        │
│  ┌────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │  Template   │  │  Interactive │  │  Privacy        │  │
│  │  Browser &  │  │  Wizard      │  │  Preview &      │  │
│  │  Search     │  │  (Config)    │  │  Code Export    │  │
│  └─────┬──────┘  └──────┬───────┘  └────────┬────────┘  │
│        │                │                    │           │
│        └────────────────┴────────────────────┘           │
│                         │ REST API + WebSocket           │
└─────────────────────────┼───────────────────────────────┘
                          │
┌─────────────────────────┼───────────────────────────────┐
│                  Backend Services                        │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  GitHub API   │  │  Supabase    │  │  Canton       │  │
│  │  (Templates)  │  │  (Metadata,  │  │  Validator    │  │
│  │              │  │   Ratings)   │  │  (Preview)    │  │
│  └──────────────┘  └──────────────┘  └───────────────┘  │
│  ┌────────────────────────────────────────────────────┐  │
│  │  FeaturedAppActivityMarker Transaction Logger      │  │
│  └────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────┼───────────────────────────────┐
│         GitHub: ttt-labs/canton-privacy-templates         │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐            │
│  │  Escrow   │  │  Voting   │  │  Atomic   │  ...12+    │
│  │  Template │  │  Template │  │  Settle.  │  templates  │
│  └───────────┘  └───────────┘  └───────────┘            │
└─────────────────────────────────────────────────────────┘
```

## Architectural Alignment

The Privacy Template Marketplace is **fully additive** to the Canton ecosystem and does not modify the Canton protocol. It extends the value of existing tools:

- **vs. `cn-quickstart`**: cn-quickstart provides a single project scaffold; the Marketplace provides a library of 12+ specialized, privacy-optimized templates covering diverse use cases.
- **vs. DamlHat**: DamlHat scaffolds generic Daml projects via CLI; Marketplace templates are use-case-specific and privacy-audited. DamlHat's `init` command could integrate with Marketplace templates as an optional template source.
- **vs. Privacy Workflow Simulator**: The Simulator validates existing code; the Marketplace provides starting code that is privacy-correct by design. They are complementary: developers can download a template from the Marketplace, then validate their customizations in the Simulator.

All generated code is standard Daml, compilable with the stock Daml SDK. No runtime dependencies on TTT Lab infrastructure.

## Milestones and Deliverables

**M1 — Core Marketplace UI & Initial Template Library (2 weeks)**
- Marketplace web application: search, filter by category/tag, template detail pages
- 12 initial production-ready privacy templates:
  1. Simple Escrow (2-party)
  2. Multi-Party Escrow (3+ parties)
  3. Verifiable Credential / Attestation
  4. Multi-Party Weighted Voting
  5. Delegated Authority / Power of Attorney
  6. Atomic Settlement (DvP)
  7. Role-Based Access Control (RBAC)
  8. KYC/AML Workflow
  9. Subscription / Time-Limited License
  10. Supply Chain Provenance
  11. Insurance Claim Lifecycle
  12. Confidential Sealed-Bid Auction
- Each template includes: Daml source, test file, `daml.yaml`, privacy documentation, and metadata
- Devnet deployment with functional build reference
- Public beta deployment

**M2 — Interactive Wizard & Live Privacy Preview (1 week)**
- Multi-step wizard for template customization: party naming, observer configuration, optional features toggle
- Real-time code generation reflecting wizard choices
- Interactive privacy preview diagram showing party visibility — powered by real Canton ledger transactions
- Syntax-highlighted code preview with copy-to-clipboard and download
- Testnet deployment with live demo

**M3 — Community Submission & Rating System (1 week)**
- GitHub PR-based template submission workflow with contribution guide
- Automated template validation: Daml compilation check, privacy pattern lint, metadata schema validation
- On-chain rating attestation system (1–5 stars) with written reviews
- Contributor profiles and leaderboard
- Download analytics dashboard (public)
- FeaturedAppActivityMarker integration for transaction tracking

**M4 — Mainnet Launch & GTM Activation (1 week)**
- **Mainnet deployment within 24 hours of validator allocation**
- Canton mainnet integration for production-grade template previews and validation
- Canton/Daml SDK version compatibility checker for each template
- Template versioning system with upgrade migration notes
- Comprehensive documentation: contributor guide, template authoring guide, API docs
- v1.0.0 public launch, open source (Apache 2.0)
- "Template Sprint" campaign launch across all GTM channels
- Featured App status application submitted to Canton Foundation

## Acceptance Criteria

### Technical Criteria
- Launch with **minimum 12 production-ready privacy templates**, each passing Daml compilation and a privacy correctness review.
- Interactive wizard generates valid, compilable Daml code for **100% of supported template configurations**.
- Wizard-generated code preserves **privacy rules** — no customization option can produce a privacy leak compared to the base template.
- Live privacy preview accurately reflects the visibility configuration of generated code with **zero false positives** in the preview diagram.
- All deliverables published as open source (Apache 2.0) with CI, documentation, and a clear contribution guide.

### GTM & Adoption Criteria
- **Mainnet activation within 24 hours** of receiving validator allocation.
- At least **100 template downloads** in the first 30 days after mainnet launch.
- At least **500 template downloads** in the first 60 days.
- At least **8 community-submitted templates** accepted in the first 60 days.
- **200+ active developers** using the platform within 60 days of mainnet launch.
- **≥1,100 on-chain transactions per week** by end of Month 1 (template previews, validations, ratings).
- Average community rating of **≥4.5/5** from Canton developers (minimum 10 ratings).
- Featured App status application submitted within **60 days** of mainnet launch.

## Funding Request and Milestone Breakdown

**No funding requested for MVP.** This project is fully self-funded by TTT Lab as a contribution to the Canton ecosystem.

We are seeking:
1. **Mainnet validator allocation** via GTM Priority Lane — we meet all criteria: functional devnet/testnet build, clear GTM plan, and 24-hour activation capability.
2. **Feedback** from the Tech & Ops Committee and community on the template scope and marketplace design.
3. **Potential future grant** for Phase 2 (advanced features listed below) after MVP demonstrates adoption and transaction volume.
4. **Featured App status** upon demonstrating sustained mainnet transaction activity.

### Phase 2 (Future — Post-MVP, Subject to Separate Proposal)

| Feature | Description |
|---|---|
| AI Template Generator | Natural-language-to-Daml generation: describe a use case → get a privacy-correct template |
| Advanced Wizard | Multi-contract workflow composer with inter-contract dependency visualization |
| IDE Extensions | VS Code and IntelliJ plugins that integrate template browsing and insertion directly into the developer's editor |
| Enterprise Templates | Industry-specific template packs (trade finance, digital identity, securities settlement) developed with domain experts |

## Strategic Alignment

This project directly supports Canton's Q2 2026 priority areas and is designed to **drive real ecosystem GTM momentum**:

1. **App Building and Developer Experience** — Provides production-ready starting points for the most common Canton use cases. New builders can launch a privacy-correct workflow in minutes instead of weeks. The wizard design eliminates the need to understand complex privacy semantics before writing a first contract. This directly accelerates GTM timelines for every Canton application.

2. **Security and Resilience** — Every template is privacy-audited and designed with the principle of minimum necessary disclosure. By providing correct defaults, the Marketplace raises the baseline privacy standard across the entire ecosystem and reduces security-related deployment delays.

3. **Driving Transaction Volume and Developer Adoption on MainNet** — Every template preview, wizard session, and community rating generates real on-chain transactions. The Marketplace is designed to be a **high-frequency transaction generator** that scales with ecosystem adoption: more templates → more developers → more transactions → stronger network utilization metrics. This creates a positive flywheel that benefits the entire Canton ecosystem.

By lowering the barrier for new builders, raising the quality floor for production applications, and generating consistent mainnet transaction volume, the Marketplace directly supports Canton's goal of building unstoppable GTM momentum through high-quality, privacy-first developer tooling.

## Team & Background

**TTT Lab** — A Vietnam-based software engineering lab specializing in blockchain developer tooling, privacy-first application architecture, and Web3 infrastructure. TTT Lab operates with a lean, senior-heavy engineering culture focused on shipping high-quality open-source tools that solve real developer pain points.

- **Website:** https://ttt.zone
- **GitHub:** https://github.com/ttt-labs
- **Track record:** Production experience building developer tools, DeFi frontends, and privacy-focused smart contract systems across multiple blockchain ecosystems. Successfully delivered template generators, contract wizard platforms, and developer marketplace tools used by hundreds of developers.
- **Canton commitment:** Active in the Canton community since early 2026; motivated by the unique privacy guarantees of the Daml/Canton model and committed to long-term ecosystem contribution.

**Key team members:**

- **Phil** — **Tech Lead & Head of Technology**, IT Department, TTT Lab. Senior full-stack engineer with 8+ years of production experience across Web3 infrastructure, blockchain integration, and developer tooling. Core expertise in React/Next.js, Node.js, and smart contract development. Previously architected and shipped contract wizard tools, template generators, and developer marketplace platforms for Solidity/EVM ecosystems. Responsible for technical vision, architecture decisions, and hands-on development of all TTT Lab Canton initiatives. Phil drives the end-to-end delivery of both the Privacy Template Marketplace and the Privacy Workflow Simulator, ensuring alignment with Canton's privacy model and developer experience standards.

- **Senior Backend Engineer** — 6+ years of experience in distributed systems, API design, and blockchain node infrastructure. Expertise in Node.js, Python, PostgreSQL (Supabase), Docker, and Kubernetes. Responsible for the template metadata layer, GitHub API integration, community submission pipeline, and search/indexing infrastructure.

- **Senior Frontend Engineer** — 5+ years of experience in modern web application development. Specialized in React, Next.js, interactive wizard UX, and design systems. Responsible for the marketplace UI, interactive template customizer, live privacy preview, and responsive design implementation.

**Work split:**
- *Phil (Tech Lead)* — Architecture, specification, Canton/Daml integration, template privacy review, code review, and project coordination.
- *Backend Engineer* — Supabase metadata layer, GitHub PR-based submission system, template validation pipeline, API layer, and DevOps.
- *Frontend Engineer* — Marketplace UI, interactive wizard, React Flow privacy preview, Shiki code highlighting, and UX polish.

Contact (Tech Lead): phil@ttt.zone · Discord: hermitrat1233

## Maintenance Commitment

TTT Lab commits to **12 months of free maintenance** post-v1.0 release, including:
- Update all templates for new Canton/Daml SDK versions within 2 weeks of each release
- Moderate community template submissions (review queue target: ≤5 business days)
- Critical bug fixes (≤48h response time for security issues)
- Quarterly template quality audits
- Continuous transaction activity generation on mainnet

## Co-Marketing

TTT Lab will collaborate with the Canton Foundation on visibility and ecosystem promotion:

- **Launch announcement coordination** at v1.0 mainnet release
- **"Template Sprint" campaign** — 4-week gamified hackathon to drive community template contributions
- **Technical blog posts** on the TTT Lab engineering blog and the Canton Forum at each milestone
- **"Template of the Week" series** — Weekly spotlights on Canton Discord & Forum highlighting specific templates with privacy best practices walkthrough
- **Video content** — Quickstart screencast, wizard tutorial, and "Build Your First Privacy-First Canton App in 5 Minutes" video
- **Open development** — Weekly progress posts on the Canton Forum during the build period
- **Cross-promotion** with DamlHat and other developer tool teams in the ecosystem

## Notes for Reviewers

- **GTM-ready:** This tool is launchable and will be **activated on mainnet within 24 hours** of receiving validator allocation. TTT Lab has infrastructure and deployment pipelines ready for immediate production deployment.
- **Transaction volume generator:** Every template preview, wizard customization, and community rating creates real on-chain transactions, making this tool a consistent contributor to Canton's network utilization metrics.
- **Featured App candidate:** TTT Lab will apply for Featured App status within 60 days of mainnet launch, with documented transaction activity and developer adoption metrics.
- **Self-funded:** No Canton Coin is requested for MVP delivery. This demonstrates TTT Lab's confidence and long-term commitment to the Canton ecosystem.
- **Ecosystem multiplier:** Unlike tools that serve individual developers, the Marketplace has a **compounding effect** — every template published makes it easier for the next developer to build, creating a positive flywheel for Canton adoption.
- **Non-overlapping:** Scoped to privacy-first template creation and distribution. Complementary to DamlHat (CLI scaffolding), Privacy Simulator (code validation), and cn-quickstart.
- **SIG alignment:** This proposal aligns with the **Daml Language & Developer Tooling** SIG and the **DAR Package Management & App Lifecycle** SIG.
- All code will be developed in the open from day one (Apache 2.0), with progress updates posted to the Canton Forum at each milestone.
- Template quality standards are intentionally high: every template must compile, include tests, and pass a privacy correctness review before publication.
