## Development Fund Proposal

**Author:** Ryan Wishnow  
**Status:** Draft  
**Created:** 2026-02-25  

---

## Abstract

Obsidian Systems proposes a Daml 3 Training Modernization Program to replace outdated Daml 2 training content with comprehensive, role-based learning paths for the Canton Network. The program delivers 19 new modules, ~10 updated modules, 38 live coding videos, capstone projects, and certification exams across four developer tracks, from beginner to solution architect, plus a dedicated Daml 2→3 certification bridge for experienced developers to level up without repeating content they already know. Existing training materials reference removed APIs, deprecated tooling, and patterns incompatible with Daml 3, making this a critical gap for developer onboarding and ecosystem growth. All content will be deployed to the existing LMS where Daml 2 training currently resides; Obsidian is not providing an LMS and will need access to the existing platform for content deployment. Content will be packaged in interoperable e-learning standards (SCORM, xAPI, or AICC) so that future SDK upgrades can be addressed through incremental content updates rather than a complete rewrite of the training program.

---

## Specification

### 1. Objective

Current Daml training materials are built for Daml 2 and reference APIs, libraries, and tooling that no longer exist in Daml 3, including JSON API v1, @daml/ledger, @daml/react, the daml CLI, and controller-first syntax. Developers attempting to learn Daml or migrate existing applications encounter broken examples, missing documentation for core Daml 3 capabilities (Smart Contract Upgrades, Participant Query Store, multi-synchronizer architecture), and no structured path from onboarding through certification.

This program produces a complete, role-based training curriculum covering first-time Daml developers through solution architects, with all content validated against the current Daml 3.x SDK. Content will be packaged using interoperable e-learning standards (SCORM, xAPI, or AICC) and deployed to the existing LMS where Daml 2 training currently resides, ensuring future SDK upgrades can be accommodated through modular content updates rather than a full curriculum rewrite. Obsidian will require access to the existing LMS platform for content deployment and testing.

### 2. Implementation Mechanics

**Team Composition**

| Role | Qty | Phases 1–3 | Phase 4 | Total Hours |
|------|-----|------------|---------|-------------|
| Engagement Lead | 1 | Part-time | Part-time | 598 |
| Senior Daml Engineer | 2 | Full-time | Part-time | 2,520 |
| Instructional Designer | 1 | Full-time | Part-time | 1,260 |
| Video Producer/Editor | 1 | N/A | Full-time | 920 |
| | | | **Total** | **5,298** |

**Role Descriptions**

- **Engagement Lead:** Overall project delivery and milestone tracking; primary point of contact for stakeholders; quality assurance and final review of all deliverables; risk identification and mitigation; resource coordination and scheduling.
- **Senior Daml Engineer (×2):** Develop technical training content and code examples; create and validate all code repositories and exercises; author step-by-step tutorials and technical documentation; perform screen-share live coding demonstrations (Phase 4); develop capstone project specifications and certification exam questions.
- **Instructional Designer:** Design learning path structures and module sequencing; develop competency frameworks and learning objectives; author instructional content and narrative flow; create assessment strategies and knowledge check questions; package content for LMS delivery format.
- **Video Producer/Editor:** Set up and manage recording environment and equipment; direct and coordinate live coding recording sessions; edit raw recordings into polished final deliverables; create chapter markers, timestamps, and transcripts.

**Estimated Effort by Phase**

| Role | Phase 1 (6 wks) | Phase 2 (8 wks) | Phase 3 (6 wks) | Phase 4 (23 wks) | Total |
|------|-----------------|-----------------|-----------------|------------------|-------|
| Engagement Lead | 120 hrs | 128 hrs | 120 hrs | 230 hrs | 598 hrs |
| Senior Daml Engineer 1 | 240 hrs | 320 hrs | 240 hrs | 460 hrs | 1,260 hrs |
| Senior Daml Engineer 2 | 240 hrs | 320 hrs | 240 hrs | 460 hrs | 1,260 hrs |
| Instructional Designer | 240 hrs | 320 hrs | 240 hrs | 460 hrs | 1,260 hrs |
| Video Producer/Editor | 0 hrs | 0 hrs | 0 hrs | 920 hrs | 920 hrs |
| **Phase Totals** | **840 hrs** | **1,088 hrs** | **840 hrs** | **2,530 hrs** | **5,298 hrs** |

**Learning Paths**

*Path A: Daml 3 Foundations* — Target: Developers new to Daml; Outcome: Build and test simple Daml 3 applications.

| Module ID | Module Name | Description | Est. Duration |
|-----------|-------------|-------------|---------------|
| F1 | Functional Programming in Daml | Core language, types, pattern matching, do notation | 4–6 hrs |
| F2 | Templates & Choices | Contract modeling, signatories, authorization patterns | 4–6 hrs |
| F3 | Development Environment | dpm tooling, project setup, sandbox, build workflow | 3–4 hrs |
| F4 | Testing in Daml 3 | Daml Script patterns, test organization, failure handling | 4–6 hrs |
| F5 | Basic Ledger Integration | JSON API v2 fundamentals, authentication, basic queries | 4–6 hrs |
| F6 | Daml 2 vs. Daml 3 Overview | High-level orientation on key differences; serves as an on-ramp to Path D (Certification Bridge) for developers with Daml 2 experience | 2–3 hrs |

*Path B: Daml 3 Application Developer* — Target: Developers with Daml fundamentals; Outcome: Build production-grade Daml applications.

| Module ID | Module Name | Description | Est. Duration |
|-----------|-------------|-------------|---------------|
| A1 | Advanced Daml Patterns | Interfaces, advanced authorization, privacy controls | 4–6 hrs |
| A2 | Smart Contract Upgrades | SCU patterns, semantic versioning, migration strategies | 6–8 hrs |
| A3 | JSON Ledger API v2 Deep Dive | Full API coverage, streaming, WebSockets, error handling | 4–6 hrs |
| A4 | Participant Query Store | PQS setup, query optimization, integration patterns | 4–6 hrs |
| A5 | Daml Triggers & Automation | Event-driven patterns, automation workflows | 4–6 hrs |
| A6 | Application Testing & Quality | Integration testing, CI/CD patterns, quality assurance | 4–6 hrs |

*Path C: Daml 3 Solution Architect* — Target: Technical leads and architects; Outcome: Design and oversee Daml 3 solutions on Canton Network.

| Module ID | Module Name | Description | Est. Duration |
|-----------|-------------|-------------|---------------|
| S1 | Multi-Synchronizer Architecture | Cross-application transactions, network topology | 6–8 hrs |
| S2 | Canton Network Integration | Network participation, validators, Canton Coin | 6–8 hrs |
| S3 | Security & External Signing | HSM integration, signing algorithms, key management | 4–6 hrs |
| S4 | Non-Functional Requirements | Performance, scalability, monitoring, observability | 4–6 hrs |
| S5 | Migration & Upgrade Strategy | Daml 2→3 migration, production rollout planning | 4–6 hrs |

*Path D: Daml 2→3 Certification Bridge (Delta Course)* — Target: Developers who have completed Daml 2 certifications; Outcome: Level up to Daml 3 proficiency and certification without repeating foundational content already mastered in Daml 2.

| Module ID | Module Name | Description | Est. Duration |
|-----------|-------------|-------------|---------------|
| M1 | What's Changed in Daml 3 | Key language, tooling, and architectural differences from Daml 2; terminology updates (domain→synchronizer, application_id→user_id); removed vs. replaced features | 3–4 hrs |
| M2 | New Daml 3 Capabilities | Smart Contract Upgrades, Participant Query Store, multi-synchronizer architecture, dpm tooling — topics with no Daml 2 equivalent | 4–6 hrs |
| M3 | API & Integration Migration | JSON API v1→v2 endpoint mapping, @daml/ledger replacement patterns, new authentication and query approaches | 3–4 hrs |
| M4 | Daml 3 Development Workflow | dpm-based project setup, build process, updated testing patterns with Daml Script, CI/CD changes | 3–4 hrs |

**Material Components Per Module**

- *Instructional Content:* Written course content with learning objectives; concept explanations with diagrams and illustrations; step-by-step tutorials with annotated code; quick reference cards for key concepts and commands.
- *Code Resources:* Working code examples tested against current Daml 3.x SDK; starter project templates; hands-on exercise repositories with solutions; integration examples (TypeScript, Java).
- *Assessment Materials:* Knowledge check questions (5–10 per module); hands-on exercises with acceptance criteria; module completion criteria.
- *Supporting Materials:* Troubleshooting guides for common issues; links to official documentation; glossary of terms.

**Capstone Projects**

| Capstone | Associated Path | Description |
|----------|----------------|-------------|
| Foundations Capstone | Path A | Simple multi-party application with testing |
| Developer Capstone | Path B | Production-ready application with SCU and API integration |
| Architect Capstone | Path C | Multi-synchronizer solution design and documentation |

**Certification Exam Content**

| Exam | Question Types |
|------|---------------|
| Daml 3 Foundations | Multiple choice, code analysis |
| Daml 3 Application Developer | Multiple choice, code analysis, scenario-based |
| Daml 3 Solution Architect | Multiple choice, scenario-based, design analysis |
| Daml 2→3 Certification Bridge | Multiple choice, code analysis, migration scenario-based |

**Content Gap Analysis**

*Content Requiring Replacement:*

| Obsolete Topic | Reason | Replacement |
|----------------|--------|-------------|
| JSON API v1 tutorials | Removed in Daml 3.4 | JSON API v2 content |
| @daml/ledger usage | Library removed | New integration patterns |
| @daml/react tutorials | Library removed | Alternative approaches |
| daml start with hot reload | Incompatible with SCU | dpm-based workflows |
| daml package / daml merge-dars | Commands removed | Updated build patterns |
| Query-by-attribute examples | Not supported in API v2 | PQS-based querying |

*New Content Required:*

| Topic | Justification |
|-------|---------------|
| Smart Contract Upgrades (SCU) | Core Daml 3 capability; no existing coverage |
| JSON Ledger API v2 | Mandatory for all integrations; replaces v1 |
| Digital Asset Package Manager (dpm) | Required tooling for Daml 3.4+ |
| Participant Query Store (PQS) | Replaces deprecated query patterns |
| Multi-Synchronizer Applications | Key Canton Network capability |
| Canton Network Integration | Production network deployment |
| External Signing Updates | New security model (V2 hashing) |

**Existing Content Updates**

| Update Category | Scope |
|----------------|-------|
| Code Example Replacement | Remove all deprecated patterns (JSON API v1, @daml/ledger, controller-first syntax) |
| Terminology Updates | Update domain→synchronizer, application_id→user_id throughout |
| Tooling References | Replace daml CLI references with dpm |
| API Documentation | Update all Ledger API references to v2 |

**Phased Delivery (43 weeks)**

| Phase | Weeks | Modules Delivered | Outcome |
|-------|-------|-------------------|---------|
| 1: Critical Migration Content | 1–6 | What's Changed, New Capabilities, API Migration, Dev Workflow, Development Environment, Basic Ledger Integration, JSON API v2 Deep Dive + existing content updates | Teams can begin Daml 3 development and migration; Daml 2 certified developers can begin leveling up |
| 2: Core Development Paths | 7–14 | Functional Programming in Daml, Templates & Choices, Testing in Daml 3, Advanced Daml Patterns, Smart Contract Upgrades, Participant Query Store, Triggers & Automation, Application Testing & Quality + Foundations capstone | Foundations and Application Developer paths complete |
| 3: Advanced Architecture | 15–20 | Multi-Synchronizer Architecture, Canton Network Integration, Security & External Signing, Non-Functional Requirements, Migration & Upgrade Strategy + remaining capstones + certification exams | Full written training program operational |
| 4: Live Code Engineering Media | 21–43 | 38 narrated videos (~14.5 hrs) covering all modules across all 4 learning paths | Complete multimedia training program delivered |

**Content Formats**

| Deliverable Type | Format |
|------------------|--------|
| Written materials | Markdown and HTML, packaged for LMS import via SCORM, xAPI, or AICC |
| Code examples | Git repositories, tested against current stable Daml 3.x SDK |
| Videos | Edited files with companion repos (timestamp-tagged), transcripts, chapter markers, and metadata |

**Deliverables Summary**

| Category | Deliverable | Quantity |
|----------|-------------|----------|
| Course Design | Training path definitions | 4 |
| Course Design | Role mapping documentation | 1 |
| Course Design | Competency frameworks | 4 |
| New Modules | Complete module packages | 19 |
| Updated Modules | Revised existing modules | ~10 |
| Code Resources | Exercise/example repositories | 19+ |
| Capstone Projects | Project specifications | 3 |
| Certification | Exam question banks | 4 |
| Migration/Bridge Guides | Daml 2→3 certification bridge documentation | 4 |
| Video Recordings | Edited live coding sessions with narration | ~38 |

### 3. Architectural Alignment

The curriculum is structured around Daml 3 and Canton Network architecture:

- **Daml 3 language and tooling:** Modules cover the dpm package manager, Daml Script, the JSON Ledger API v2, and Smart Contract Upgrades, which are the core primitives for Daml 3 development.
- **Canton Network topology:** The Solution Architect path (S1–S5) teaches multi-synchronizer architecture, validator participation, Canton Coin integration, and external signing with HSM, directly supporting network decentralization and participation.
- **Participant Query Store (PQS):** Dedicated module (A4) covers the replacement for deprecated query-by-attribute patterns, aligning with the Canton team's architectural direction for off-ledger querying.
- **CIP-0082 alignment:** The Development Fund was established to support developer tools and shared infrastructure. A training program that lowers the barrier to building on Canton falls squarely within this scope.

### 4. Backward Compatibility

The program handles backward compatibility through the Daml 2→3 Certification Bridge path (Path D), which provides a focused delta course for Daml 2 certified developers covering what's changed, new Daml 3 capabilities, API migration patterns, and updated development workflows. This allows experienced developers to level up to Daml 3 certification without repeating foundational content, while also giving teams the knowledge needed to migrate existing applications.

No impact on existing Canton Network systems or integrations. The program produces educational content only.

---

## Milestones and Deliverables

### Milestone 1: Critical Migration Content

- **Estimated Delivery:** 6 weeks from project start
- **Focus:** Unblock Daml 2→3 migration and new developer onboarding with the highest-priority content
- **Deliverables / Value Metrics:**
  - Certification bridge modules M1–M4 (what's changed, new capabilities, API migration, development workflow)
  - Development environment module (F3) and basic ledger integration module (F5)
  - JSON API v2 deep dive module (A3)
  - All deprecated patterns removed from existing training content (~10 modules updated)
  - Teams can begin Daml 3 development and migration immediately upon completion

**Week-by-week breakdown:**

| Week | Deliverables |
|------|-------------|
| 1–2 | M1–M2 (What's Changed, New Capabilities), F3 (Development Environment) |
| 3–4 | M3–M4 (API Migration, Dev Workflow), F5 (Basic Ledger Integration), A3 (JSON API v2 Deep Dive) |
| 5–6 | Existing content updates (deprecated pattern removal) |

### Milestone 2: Core Development Paths

- **Estimated Delivery:** 14 weeks from project start (8 weeks after Milestone 1)
- **Focus:** Complete the Foundations and Application Developer learning paths
- **Deliverables / Value Metrics:**
  - 8 new modules: F1, F2, F4, A1, A2, A4, A5, A6
  - Foundations capstone project specification
  - Code repositories and exercises for all delivered modules
  - Paths A and B fully operational; new developers have a complete onboarding-to-production learning path

**Week-by-week breakdown:**

| Week | Deliverables |
|------|-------------|
| 7–8 | A2 (Smart Contract Upgrades), A4 (Participant Query Store) |
| 9–10 | F1–F2 (Foundations core modules) |
| 11–12 | F4 (Testing), A1 (Advanced Patterns) |
| 13–14 | A5–A6 (Triggers, Testing & Quality), Foundations Capstone |

### Milestone 3: Advanced Architecture & Certification

- **Estimated Delivery:** 20 weeks from project start (6 weeks after Milestone 2)
- **Focus:** Complete the Solution Architect path and certification framework
- **Deliverables / Value Metrics:**
  - 5 new modules: S1–S5 (multi-synchronizer, Canton Network, security, NFRs, migration strategy)
  - Developer and Architect capstone project specifications
  - 4 certification exam question banks (Foundations, Application Developer, Solution Architect, Daml 2→3 Bridge)
  - All 4 learning path definitions, role mapping documentation, and competency frameworks
  - Full written training program operational

**Week-by-week breakdown:**

| Week | Deliverables |
|------|-------------|
| 15–16 | S1–S2 (Multi-Synchronizer, Canton Network) |
| 17–18 | S3–S5 (Security, NFRs, Migration Strategy) |
| 19–20 | Capstone projects, Certification exam content, Final QA |

### Milestone 4: Live Code Engineering Media

- **Estimated Delivery:** 43 weeks from project start (23 weeks after Milestone 3)
- **Focus:** Produce narrated live coding videos supplementing all written content
- **Deliverables / Value Metrics:**
  - 38 edited live coding videos (~14.5 hours total): Path A (10 videos, ~3.5 hrs), Path B (13 videos, ~5 hrs), Path C (10 videos, ~4 hrs), Path D (5 videos, ~2 hrs)
  - Companion code repositories with timestamp-tagged commits
  - Video chapters, transcripts, thumbnails, and metadata files
  - Complete multimedia training program delivered

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone
- Demonstrated functionality or operational readiness
- Documentation and knowledge transfer provided
- Alignment with stated value metrics

**Project-specific acceptance conditions:**

- All code examples compile and pass tests against the current stable Daml 3.x SDK at time of delivery
- Written materials are delivered in Markdown/HTML formats packaged via SCORM, xAPI, or AICC for import into the existing LMS
- Deprecated Daml 2 patterns (JSON API v1, @daml/ledger, @daml/react, daml CLI, controller-first syntax) are fully absent from all delivered content
- Video deliverables include companion repos, transcripts, and chapter markers as specified
- One round of revisions per deliverable is included based on Committee feedback

---

## Funding

**Total Funding Request:** 9,271,000 CC

### Payment Breakdown by Milestone

- Milestone 1 (Critical Migration Content): 1,470,000 CC upon committee acceptance
- Milestone 2 (Core Development Paths): 1,904,000 CC upon committee acceptance
- Milestone 3 (Advanced Architecture & Certification): 1,470,000 CC upon committee acceptance
- Milestone 4 (Live Code Engineering Media): 4,427,500 CC upon final release and acceptance

### Volatility Stipulation

The project duration is 43 weeks (approximately 10 months), exceeding the 6-month threshold and is denominated in fixed Canton Coin (CC). A scope checkpoint will be performed at 6 months to ensure the project remains on schedule and within the agreed deliverables.

---

## Co-Marketing

Upon release, Obsidian Systems will collaborate with the Canton Foundation on:

- Announcement coordination for each milestone delivery
- Announcement coordination of the launch of the completed Daml 3 training curriculum
- Promotion through Obsidian's developer community and Canton ecosystem channels

---

## Motivation

Canton Network adoption depends on developers being able to learn Daml 3 and build applications effectively and grow the Canton Network as a whole. Today, the primary training materials are broken, referencing removed APIs, deprecated tools, and patterns that no longer work. This creates a compounding problem: new developers bounce off outdated content, existing teams delay migration, and the ecosystem's growth is bottlenecked by a skills gap rather than a technology gap. Daml proficiency is the biggest limiting factor for increasing network participation.

A complete, role-based training program is shared infrastructure in the same way that SDKs and documentation are. It benefits every participant in the network (validators, app developers, solution architects, and the organizations that employ them) by reducing the time and cost of building on Canton.

---

## Rationale

**Why a structured curriculum rather than updated docs?** Documentation tells developers what exists; training teaches them how to use it. The gap in the Canton ecosystem is not missing reference pages but missing learning paths: sequenced, hands-on, role-appropriate content that takes a developer from zero to production. Updating docs alone would leave developers to assemble their own learning path from scattered sources.

**Why role-based paths?** Different roles need different content at different depths. A new developer needs foundations and simple exercises. An architect needs multi-synchronizer topology and security integration. A developer who already holds Daml 2 certifications needs a focused delta course covering only what's new and changed in Daml 3, without repeating the 40+ hours of foundational content they've already mastered. Four distinct paths serve these audiences without forcing anyone through irrelevant material.

**Why include video?** Written content works well for reference and self-paced learning, but live coding demonstrations show real development workflows (debugging, tooling usage, and decision-making) that are difficult to convey in text. The 38 videos supplement rather than replace written modules, giving developers a second way to absorb the material.

**Why Obsidian Systems?** Obsidian has delivered Daml projects across financial services and enterprise applications and has direct experience with the Daml 2→3 transition. The team's existing familiarity with Daml architecture, tooling, and common developer pain points means content development can begin immediately without a ramp-up period.

---

## Assumptions

- Digital Asset subject matter experts will be available for technical review; Obsidian will streamline review cycles to minimize the time commitment, targeting 2–4 hours per week with flexibility for heavier review during milestone acceptance windows. This time investment is reflected in the proposed 10% coin payment allocation to Digital Asset in recognition of their ongoing subject matter contribution across the 43-week program
- Training materials will be delivered in Markdown and HTML formats, packaged for import into the existing LMS (where Daml 2 content currently resides) using SCORM, xAPI, or AICC standards to ensure future upgradability
- Obsidian will require access to the existing LMS platform for content deployment and testing
- All code examples will target the current stable Daml 3.x SDK release at time of development
- Certification exam question development is in scope; exam platform configuration is not
- Obsidian will have access to Daml 3 SDK and development environments for testing
- Videos will be recorded by Obsidian engineers; talent provided by Obsidian
- Basic editing included (cuts, transitions, lower-thirds); motion graphics/animation not included
- One round of revisions included per video based on feedback
- Branding assets (logos, intro/outro templates) will be provided by the Canton Foundation if applicable
- Videos are delivered as files; LMS embedding/configuration is the Foundation's responsibility

---

## Out of Scope

- LMS platform provisioning, administration, or configuration (Obsidian requires access to the existing LMS for content deployment only)
- Certification exam proctoring setup
- Instructor-led training delivery
- Translation or localization
- Ongoing content maintenance post-delivery
- Marketing materials for training programs
