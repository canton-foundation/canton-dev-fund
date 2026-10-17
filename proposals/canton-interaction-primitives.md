## Development Fund Proposal

**Author:** Erkan Efe (erknfe@gmail.com)  
**Status:** Submitted  
**Created:** 2026-04-03  

---

## Abstract
This proposal is based on direct observation of repeated interaction patterns and inconsistencies encountered while building multi-party workflows on Canton. Canton Interaction Primitives is a reusable Daml primitive kit for modeling multi-party interaction lifecycles on Canton. The project addresses a recurring ecosystem gap: teams repeatedly re-implement the same approval and lifecycle patterns from scratch. This proposal requests funding to deliver a staged, production-oriented primitive layer across 5 milestones: core intent/consent primitives, negative path and resolution semantics, multi-party approval patterns, stabilization, and documentation/release.

---

## Specification

### 1. Objective
Establish a reusable application-layer interaction standard for Canton that reduces duplicated workflow logic and improves consistency across projects.

Target outcome:
- a minimal but composable primitive set for interaction lifecycle modeling
- explicit and verifiable state transitions
- reusable reference flows that teams can adopt directly

Core lifecycle model:
- `Intent -> Consent -> Resolution`

### 2. Implementation Mechanics
The solution is implemented as modular Daml primitives plus reference flows and validation scripts.

Scope by capability:
- **Interaction initiation and authorization**
  - `Intent` primitive for structured interaction requests
  - `Consent` primitive for approval formation
- **Interaction resolution**
  - explicit execution boundary
  - reject/cancel/expiry semantics for stalled or failed interactions
- **Composition and validation**
  - reference flows for single-party and multi-party approval models
  - script-based validation for allowed and forbidden transitions

Implementation principles:
- minimal abstractions
- explicit transitions over hidden mutable state
- composability over framework-style orchestration

### 3. Architectural Alignment
This work aligns with Canton ecosystem priorities by improving application-layer developer ergonomics without changing protocol behavior.

Alignment points:
- uses native Daml authorization and visibility semantics (signatories/controllers/choices)
- complements existing infrastructure/tooling rather than replacing it
- provides reusable patterns that can be applied across domains (payments, asset flows, coordination workflows)
- reduces friction in onboarding and prototyping for multi-party app teams

### 4. Backward Compatibility
No backward compatibility impact.

This project introduces reusable application-layer primitives and examples. It does not require protocol changes or breaking migrations to existing Canton infrastructure.

### 5. Risks and Mitigation
- **Risk: scope creep from trying to model every workflow shape**
  - Mitigation: strict milestone scope and explicit out-of-scope definitions
- **Risk: over-abstraction that harms usability**
  - Mitigation: incremental delivery, real-flow validation, refinement in Milestone 4
- **Risk: authorization edge-case regressions in multi-party extensions**
  - Mitigation: script-based validation of allowed/forbidden transitions and reference composition tests

---

## Milestones and Deliverables

### Milestone 1: Core Interaction Primitives
| Detail | Description |
|---|---|
| **Estimated Delivery** | Weeks 1-3 |
| **Focus** | Minimal `Intent` and `Consent` primitives with explicit state transitions |

**Deliverables / Value Metrics:**
- minimal Daml modules for core interaction primitives
- working reference flow: intent -> consent -> state transition
- script validation of lifecycle and authorization boundaries

**Acceptance Criteria:**
- at least 1 reference interaction flow implemented and executable
- full lifecycle validation via script (intent -> consent -> state transition)
- requester/approver authorization boundaries verified

**Out of Scope:**
- multi-party approval patterns
- threshold or sequential approvals
- execution or broader resolution logic

### Milestone 2: Interaction Resolution and Negative Paths
| Detail | Description |
|---|---|
| **Estimated Delivery** | Weeks 4-6 |
| **Focus** | Reject/cancel transitions and minimal resolution semantics |

**Deliverables / Value Metrics:**
- primitives extended with negative interaction outcomes
- script validation of allowed and forbidden transitions

**Acceptance Criteria:**
- explicit `reject` and `cancel` transitions implemented
- script tests cover success and failure paths
- transition validity checks included in validation scripts

**Out of Scope:**
- workflow orchestration frameworks
- participant/network-level operations
- UI/devtool surfaces

### Milestone 3: Multi-Party Approval Patterns
| Detail | Description |
|---|---|
| **Estimated Delivery** | Weeks 7-8 |
| **Focus** | Basic multi-party approval models and composability |

**Deliverables / Value Metrics:**
- reference implementations for multi-party approval flows
- composability examples with existing primitives

**Acceptance Criteria:**
- at least 2 multi-party approval patterns implemented
- composability with existing primitives demonstrated
- script-based validation of multi-party behavior

### Milestone 4: Refinement and Stabilization
| Detail | Description |
|---|---|
| **Estimated Delivery** | Weeks 9-10 |
| **Focus** | API/primitive boundary cleanup and consistency hardening |

**Deliverables / Value Metrics:**
- stabilized primitive APIs
- reduced abstraction noise and cleaner composition boundaries

**Acceptance Criteria:**
- primitive interfaces remain minimal and internally consistent
- redundant abstractions removed
- stable composition patterns documented in code/docs

### Milestone 5: Documentation and Release
| Detail | Description |
|---|---|
| **Estimated Delivery** | Week 11 |
| **Focus** | Documentation, release readiness, and open-source publication |

**Deliverables / Value Metrics:**
- public repository with primitives, examples, and usage docs
- end-to-end documented reference flow

**Acceptance Criteria:**
- documentation covers all core primitives and usage patterns
- at least one complete reference flow documented end-to-end
- repository is usable as a starting point for new Canton applications

---

## Funding

**Total Funding Request: 400,000 CC**

### Payment Breakdown by Milestone
- Milestone 1 (Core Interaction Primitives): 110,000 CC upon committee acceptance
- Milestone 2 (Interaction Resolution and Negative Paths): 90,000 CC upon committee acceptance
- Milestone 3 (Multi-Party Approval Patterns): 100,000 CC upon committee acceptance
- Milestone 4 (Refinement and Stabilization): 60,000 CC upon committee acceptance
- Milestone 5 (Documentation and Release): 40,000 CC upon final release and acceptance

### Volatility Stipulation
The project duration is under 6 months.

If delivery extends beyond 6 months due to Committee-requested scope changes, remaining milestones should be re-evaluated to account for significant USD/CC volatility.

---

## Co-Marketing
Upon release, the implementing entity will collaborate with the Foundation on:

- announcement coordination
- a technical write-up/case study covering lifecycle primitive design
- ecosystem-facing developer education and onboarding content

---

## Motivation
Canton provides strong protocol and authorization primitives, but application teams still repeatedly rebuild multi-party interaction lifecycle logic. This causes duplicated effort, inconsistent state handling, and subtle lifecycle bugs across projects.

The proposed primitive layer addresses this structural gap by providing a shared interaction language that is explicit, composable, and reusable across application domains.

---

## Rationale
This is the right approach because it targets the highest-leverage missing layer: reusable application interaction structure on top of existing Canton capabilities.

Why this design:
- minimal primitives reduce adoption friction
- explicit transitions improve correctness and auditability
- incremental milestones prevent overengineering
- reference flows turn abstractions into practical integration guidance

Alternatives considered:
- building a full workflow framework: rejected due to heavy adoption overhead and reduced flexibility
- relying on ad-hoc project templates: rejected because it does not create a stable reusable interaction standard
