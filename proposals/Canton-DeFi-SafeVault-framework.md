# Development Fund Proposal: Canton DeFi SafeVault Framework

**Author:** Tomas  
**Status:** Draft  
**Created:** 2026-04-29  
**Label:** Critical ecosystem infrastructure  
**Champion:** Need Champion  

# Abstract

Canton SafeVault is a reusable capital control and risk management framework for DeFi protocols built on Canton. It provides a standardized structure for capital entry, ownership recording, capital allocation approval, risk restriction, redemption, recovery, and responsibility alignment.

The framework is designed as public infrastructure for the Canton DeFi ecosystem. It does not replace the business logic of a DEX, lending protocol, perps venue, vault, RWA product, or strategy protocol. Instead, it provides a shared capital safety layer that these protocols can integrate through configurable adapters and policy modules.

Canton SafeVault uses Canton-native mechanisms, including Daml contract state, Party-based permissions, signatories, controllers, observers, multi-party workflows, and selective visibility. These mechanisms allow capital control, approval logic, risk event handling, and audit visibility to be embedded directly into protocol workflows instead of relying only on off-ledger governance, admin permissions, or external multisig arrangements.

The value to the Canton ecosystem is a reusable DeFi capital safety standard that improves LP protection, reduces duplicated protocol-specific development, strengthens risk response, and supports more institution-ready DeFi applications on Canton.

# Specification

## 1. Objective

The objective of this proposal is to deliver Canton SafeVault as a reusable capital control framework for Canton DeFi protocols.

DeFi capital safety is often handled separately by each protocol. Deposit logic, capital deployment, pause mechanisms, redemption handling, incident response, and loss allocation are frequently designed in isolated ways. This creates several recurring issues:

1. Capital may enter operating pools, strategy accounts, or protocol accounts directly without a standardized control layer.
2. Capital use may depend too heavily on admin operations, off-ledger procedures, or isolated multisig actions.
3. LPs and capital providers may absorb most residual losses while other roles share upside without proportional downside responsibility.
4. Risk event response may be reactive, fragmented, and unclear.
5. Governance participants, auditors, and institutional observers may lack structured visibility across the full capital lifecycle.
6. Different Canton DeFi teams may repeatedly rebuild similar capital control logic.

Canton SafeVault addresses these issues by separating **business logic** from **capital control logic**.

Business protocols continue to manage their own market logic, matching engines, lending rules, liquidity pools, vault strategies, RWA workflows, or settlement mechanisms. SafeVault manages the surrounding capital lifecycle:

1. Capital entry.
2. Ownership and share recording.
3. Capital allocation approval.
4. Protocol adapter execution.
5. Risk event registration.
6. Restriction mode and exit window activation.
7. Redemption and partial settlement.
8. Recovery condition tracking.
9. First-loss capital, reserve, and loss waterfall handling.
10. Audit and observer visibility.

The intended outcome is a reusable framework that helps Canton DeFi teams improve capital governance, LP protection, protocol risk management, and operational transparency.

## 2. Implementation Mechanics

Canton SafeVault will be implemented as a modular Canton-native framework composed of standardized core modules and configurable protocol-specific modules.

## 2.1 Core Components

| Component | Purpose |
|---|---|
| SafeVault Core | Common capital entry, supported asset configuration, role configuration, and operating state |
| Position / Share Layer | Records capital provider ownership, balances, shares, lock state, and redemption rights |
| Allocation Controller | Validates capital deployment requests based on target, purpose, exposure, policy, risk state, and approval tier |
| Multi-Party Approval Workflow | Routes requests to Operator, Risk Control, and Governance Parties based on risk level and policy |
| Protocol Adapter Layer | Connects SafeVault-controlled capital to downstream DEX, lending, vault, perps, RWA, or strategy protocols |
| Risk Event Engine | Registers abnormal conditions, identifies affected scope, activates restrictions, and tracks recovery |
| Redemption / Exit Engine | Handles normal redemption, queued exits, partial settlement, and emergency review |
| Incentive Alignment Layer | Manages first-loss capital, safety reserves, role bonds, and loss waterfall logic |
| Audit Record Layer | Records key lifecycle events for governance, audit, risk review, and ecosystem analysis |

## 2.2 Canton Party-Based Role Model

SafeVault will use Canton Parties as the primary role and permission boundary.

| Party Role | Responsibility |
|---|---|
| Capital Provider Party | Provides capital, holds position or share rights, requests redemption |
| SafeVault Party | Receives and controls capital according to SafeVault contract state |
| Operator Party | Proposes ordinary capital allocation requests |
| Risk Control Party | Reviews risk-sensitive actions and may trigger restrictions |
| Governance Party | Approves high-risk actions, recovery actions, and major parameter changes |
| Auditor / Observer Party | Observes workflows without execution rights |
| Protocol Adapter Party | Connects SafeVault capital to downstream protocol modules |
| Reserve / Insurance Party | Holds first-loss capital, safety reserves, or responsibility bonds |

This structure allows multiple organizations to participate in a controlled workflow while avoiding concentration of authority in a single admin address or off-ledger process.

## 2.3 Daml Workflow Model

SafeVault will express key rights, approvals, and state transitions through Daml contracts and choices.

Core contract objects may include:

| Contract Object | Purpose |
|---|---|
| SafeVaultContract | Defines vault configuration, supported assets, role Parties, and operating state |
| PositionContract | Records provider ownership, shares, locked status, and redemption rights |
| AllocationRequest | Records proposed capital use, target adapter, asset, amount, purpose, and risk level |
| ApprovalRecord | Records required Party approvals |
| RiskEventContract | Records incident type, affected scope, restrictions, and recovery status |
| RedemptionRequest | Records redemption state, queue status, partial settlement, and final settlement |
| ReserveContract | Records first-loss capital, reserves, role bonds, and loss waterfall rules |

Capital movement should only be executable when the required contract states and approvals are satisfied.

## 2.4 Capital Lifecycle Workflow

The capital lifecycle follows a structured flow:

1. The Capital Provider Party transfers assets to the SafeVault Party.
2. SafeVault confirms asset receipt and acceptance where required.
3. The Position / Share Layer records the provider's economic entitlement.
4. The Operator Party submits an allocation request.
5. The Allocation Controller validates policy, target, amount, exposure, and current risk state.
6. Required approvals are collected based on risk level.
7. Approved capital is released to the Protocol Adapter.
8. The Adapter executes the downstream protocol action.
9. The Adapter reports position, execution, yield, or exposure data back to SafeVault.
10. Capital may return to SafeVault through a controlled return flow.
11. Users may redeem through the Redemption / Exit Engine.
12. When abnormal conditions occur, the Risk Event Engine may restrict new allocation, open an exit window, or escalate to governance.

## 2.5 Risk Event Workflow

SafeVault formalizes abnormal conditions as Risk Events.

Risk trigger categories include:

| Category | Example |
|---|---|
| Price Risk | Oracle failure, price deviation, stale valuation |
| Liquidity Risk | Liquidity deterioration, withdrawal capacity decline |
| Permission Risk | Unauthorized change, abnormal admin action |
| Adapter Risk | Adapter reporting failure or execution mismatch |
| Protocol Risk | Downstream protocol pause, settlement failure, insolvency signal |
| External Dependency Risk | Custodian, bridge, validator, or off-ledger dependency issue |
| Concentration Risk | Asset, protocol, or strategy exposure limit breach |
| Redemption Risk | Redemption pressure, queue imbalance, liquidity shortfall |

Risk event handling supports:

1. Risk event registration.
2. Affected scope identification.
3. Restriction mode activation.
4. New capital allocation pause.
5. Adapter restriction.
6. Exit window opening.
7. Governance escalation.
8. Recovery condition tracking.
9. Normal operation restoration.

## 2.6 Protocol Adapter Mechanics

SafeVault integrates with downstream protocols through adapters. This keeps the SafeVault core standardized while allowing protocol-specific behavior to remain configurable.

Adapter types include:

| Adapter Type | Example Use Case |
|---|---|
| DEX Liquidity Adapter | Add or remove liquidity from a Canton DEX |
| Lending Adapter | Supply or withdraw assets from a lending protocol |
| Perps Margin Adapter | Allocate margin to perps trading or market-making modules |
| Vault Strategy Adapter | Deploy assets into managed strategies |
| RWA Adapter | Allocate capital to real-world asset structures |
| Market Making Adapter | Allocate inventory or collateral to market-making strategies |

Standard adapter interfaces include:

| Interface | Purpose |
|---|---|
| validateTarget | Confirms the target protocol or strategy is eligible |
| validatePurpose | Confirms that the requested use matches SafeVault policy |
| executeAllocation | Executes approved capital deployment |
| reportPosition | Reports position, exposure, value, or execution result |
| returnFunds | Returns capital, yield, or residual assets to SafeVault |
| emergencyWithdraw | Executes emergency withdrawal under risk restrictions |
| provideAuditData | Provides records for audit and governance review |

## 2.7 On-Ledger and Off-Ledger Boundary

SafeVault places ownership, approvals, risk state, exit state, and critical action records on-ledger. Complex monitoring and computation can remain off-ledger and be submitted by authorized Reporter Parties.

### On-Ledger

| Category | Content |
|---|---|
| Ownership | Positions, shares, lock status, redemption rights |
| Control | Allocation requests, approvals, execution status |
| Risk | Risk event state, affected scope, restrictions |
| Exit | Redemption queue, partial settlement, final settlement |
| Responsibility | First-loss capital, reserves, role bonds, loss waterfall |
| Audit | Party approvals, critical state transitions, execution records |

### Off-Ledger

| Category | Content |
|---|---|
| Monitoring | Price, liquidity, exposure, and external dependency monitoring |
| Valuation | NAV, LP position value, strategy performance |
| Simulation | Stress testing, withdrawal modeling, concentration analysis |
| Reporting | Risk reports, audit reports, operational dashboards |
| Alerting | Notifications and escalation workflows |

Authorized Reporters may include Oracle Reporter, Risk Reporter, Valuation Reporter, Adapter Reporter, and Governance Reporter.

## 2.8 Activity Record Boundary

SafeVault may generate auditable Activity Records for key events in the capital lifecycle. These records improve capital flow transparency, risk review, governance review, and ecosystem-level data analysis.

Recordable events include:

| Activity Type | Description |
|---|---|
| Capital Entry Completed | Capital enters SafeVault and receipt is confirmed |
| Position Created | A Position or Share record is created for the capital provider |
| Allocation Requested | Operator submits a capital allocation request |
| Allocation Approved | Required approving parties complete approval |
| Allocation Executed | SafeVault releases approved capital to the specified adapter |
| Adapter Execution Reported | Adapter reports execution result, position, or exposure information |
| Risk Event Registered | A risk event is formally registered |
| Restriction Activated | Restrictions are activated for affected assets, protocols, strategies, or adapters |
| Exit Window Opened | An exit window is opened under defined conditions |
| Redemption Requested | User submits a redemption request |
| Redemption Settled | Redemption is completed and settlement result is recorded |
| Recovery Status Updated | Recovery conditions or recovery status for a risk event are updated |

These records do not change capital ownership and do not replace SafeVault contract state. They serve as an audit layer for the capital lifecycle, helping protocols, risk teams, governance participants, capital providers, and observers understand how capital moves from entry to allocation, use, risk handling, and exit.

Activity Record design principles include:

1. Records should cover only key events related to the capital lifecycle, permission approval, risk state, or exit handling.
2. Each record should be linked to the relevant Party, asset, amount, timestamp, status, and upstream or downstream contract object.
3. Activity Records should support audit, governance review, risk analysis, and operational transparency.
4. Activity Records should not replace core state contracts such as Position, Allocation, Risk Event, or Redemption contracts.
5. Activity Records should avoid operations with no meaningful capital lifecycle relevance, such as pure UI actions, read-only queries, duplicate submissions, internal calculations with no state change, or artificially created circular behavior.

The purpose of this layer is to provide a unified, auditable, and reviewable capital lifecycle record so that SafeVault can be reused as a public framework across different Canton DeFi protocols.

## 3. Architectural Alignment

Canton SafeVault aligns closely with Canton architecture and ecosystem priorities.

## 3.1 Alignment with the Canton Party Model

SafeVault uses Parties as the core identity and control primitive. Capital providers, operators, risk controllers, governance participants, observers, and adapters can each be represented as distinct Parties.

This is naturally aligned with Canton architecture because control rights are not reduced to a single wallet address. Instead, authority is distributed across role-based Parties and encoded in Daml workflows.

## 3.2 Alignment with Daml Authorization

SafeVault uses Daml contracts, signatories, controllers, and choices to express:

1. Who can create a request.
2. Who can approve a request.
3. Who can execute a request.
4. Who can observe a request.
5. Which state conditions must be satisfied before capital can move.

This allows business permissions and capital safety constraints to be enforced at the workflow layer.

## 3.3 Alignment with Multi-Party Financial Workflows

Canton is well suited for multi-party financial coordination. SafeVault applies this model to DeFi capital management, allowing different institutions or roles to share a workflow while preserving clear responsibility boundaries.

Examples:

1. A capital provider can hold economic rights without operating strategy execution.
2. An Operator can submit an allocation request without unilateral control over funds.
3. A Risk Party can restrict new exposure without taking user principal.
4. Governance can approve recovery actions without directly rewriting ownership records.
5. An Observer can audit the workflow without execution rights.

## 3.4 Alignment with Selective Visibility

SafeVault supports scoped visibility:

1. Capital providers see their own positions and redemption state.
2. Risk control sees exposure and risk-related records.
3. Governance sees high-risk actions and recovery decisions.
4. Auditors see complete or scoped workflow records.
5. Adapters see only protocol-relevant allocation and reporting data.

This is important for institutional DeFi, RWA, managed liquidity, and shared-control financial applications.

## 3.5 Alignment with Ecosystem Priorities

Canton SafeVault supports the following ecosystem priorities:

1. Safer DeFi capital deployment.
2. More reusable DeFi infrastructure.
3. Stronger LP protection.
4. Better auditability and operational transparency.
5. More institution-ready DeFi workflows.
6. Better composability between DeFi protocols through adapter interfaces.
7. Clearer capital lifecycle records for review, governance, and risk management.

## 3.6 Relevant CIP / Label Alignment

This proposal is primarily aligned with Canton ecosystem goals around critical ecosystem infrastructure, DeFi liquidity, financial workflow composability, and operationally safe application-layer infrastructure.

The selected label is **Critical ecosystem infrastructure** because SafeVault is intended to provide a reusable capital control and risk management layer that multiple Canton DeFi protocols can adopt.

Related areas include:

1. **defi-liquidity**
2. **financial-workflows-composability**
3. **attestor-pools-daos-multisig**
4. **regulatory-compliance**

## 4. Backward Compatibility

No backward compatibility impact.

Canton SafeVault is an application-layer framework and reference implementation. It does not require changes to Canton protocol rules, Global Synchronizer behavior, existing wallet infrastructure, existing Daml APIs, or existing protocol deployments.

Existing DeFi protocols may adopt SafeVault voluntarily through adapter integrations. Protocols that do not adopt SafeVault will not be affected.

# Milestones and Deliverables

## Milestone 1: Framework Specification and Canton-Native Architecture

**Estimated Delivery:** Month 1  
**Focus:** Public framework design, Canton-native role model, architecture, and lifecycle specification  
**Funding:** 500,000 CC upon committee acceptance

### Deliverables / Value Metrics

1. Public SafeVault framework specification.
2. Canton Party-based role model.
3. SafeVault capital lifecycle architecture.
4. Core module boundary description.
5. On-ledger and off-ledger boundary document.
6. Activity Record and audit boundary document.
7. DEX liquidity reference scenario design.
8. Architecture diagrams covering capital entry, allocation, risk event, and exit flows.

### Value Metrics

1. External teams can understand SafeVault’s role as a reusable capital control layer.
2. Key roles can be mapped to Canton Parties.
3. The full capital lifecycle is clearly documented.
4. The framework can be reviewed by product, engineering, risk, and governance stakeholders.

## Milestone 2: Core Module Design and Daml Workflow Model

**Estimated Delivery:** Month 2 to Month 3  
**Focus:** Core contract model, module design, state machines, and approval workflows  
**Funding:** 800,000 CC upon committee acceptance

### Deliverables / Value Metrics

1. SafeVault Core module design.
2. Position / Share Layer design.
3. Allocation Controller design.
4. Multi-Party Approval Workflow design.
5. Risk Event Engine design.
6. Redemption / Exit Engine design.
7. Incentive Alignment Layer design.
8. Core Daml contract object model.
9. Policy Profile design.
10. Approval Matrix design.
11. Risk Trigger Library design.
12. Redemption Policy template.

### Value Metrics

1. Module boundaries are clear enough for implementation.
2. Daml contract objects and states are specified.
3. Approval routes by risk level are defined.
4. Risk event restriction and recovery paths are complete.
5. Redemption queue, partial settlement, and emergency review flows are documented.
6. The design can be used by engineering teams to begin implementation.

## Milestone 3: Reference Implementation and DEX Adapter Demo

**Estimated Delivery:** Month 4 to Month 5  
**Focus:** Working reference implementation and DEX liquidity adapter demonstration  
**Funding:** 1,200,000 CC upon committee acceptance

### Deliverables / Value Metrics

1. SafeVault reference implementation.
2. DEX Liquidity Adapter reference implementation.
3. Capital deposit and position creation demo.
4. Allocation request and approval demo.
5. Adapter execution and position reporting demo.
6. Risk event and Restricted Mode demo.
7. Normal redemption demo.
8. Queued or partial redemption demo.
9. Observer visibility demo.
10. Technical demo documentation.

### Value Metrics

1. Capital entry into SafeVault can be demonstrated.
2. Position or share creation can be demonstrated.
3. Policy-based capital allocation can be demonstrated.
4. Required approval workflows can be demonstrated.
5. Adapter-based DEX liquidity deployment can be demonstrated.
6. Risk restriction after an event can be demonstrated.
7. Normal and abnormal exit flows can be demonstrated.
8. Observer visibility can be demonstrated without execution rights.

## Milestone 4: Ecosystem Reuse Package and Integration Toolkit

**Estimated Delivery:** Month 6  
**Focus:** Documentation, integration toolkit, reusable templates, and ecosystem adoption materials  
**Funding:** 500,000 CC upon final release and acceptance

### Deliverables / Value Metrics

1. SafeVault integration guide.
2. Adapter development guide.
3. Capital safety review checklist.
4. Risk Event template.
5. Governance Escalation template.
6. Redemption Policy template.
7. Audit Observation guide.
8. Example configuration package for new protocol integrations.
9. Final public documentation package.
10. Knowledge transfer materials for Canton DeFi teams.

### Value Metrics

1. External Canton DeFi teams can understand how to integrate SafeVault.
2. Protocol teams can design their own adapters using the reference pattern.
3. Reviewers can evaluate whether a protocol adopts a complete capital safety structure.
4. Documentation supports reuse across DEX, lending, vault, perps, RWA, and strategy protocols.
5. The final materials are suitable for public review and ecosystem adoption.

# Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

1. Deliverables completed as specified for each milestone.
2. Demonstrated functionality or operational readiness.
3. Documentation and knowledge transfer provided.
4. Alignment with stated value metrics.
5. Clear mapping of SafeVault roles to Canton Parties.
6. Clear use of Daml contract state, controllers, signatories, and observers.
7. Demonstrated capital entry, allocation, risk event, and exit lifecycle.
8. Demonstrated DEX adapter reference flow.
9. Demonstrated observer visibility without execution authority.
10. Clear on-ledger and off-ledger boundary.
11. Clear integration path for other Canton DeFi protocols.
12. Public documentation suitable for ecosystem reuse.

# Funding

## Total Funding Request

**3,000,000 CC**

## Payment Breakdown by Milestone

| Milestone | Payment |
|---|---:|
| Milestone 1: Framework Specification and Canton-Native Architecture | 500,000 CC upon committee acceptance |
| Milestone 2: Core Module Design and Daml Workflow Model | 800,000 CC upon committee acceptance |
| Milestone 3: Reference Implementation and DEX Adapter Demo | 1,200,000 CC upon committee acceptance |
| Milestone 4: Ecosystem Reuse Package and Integration Toolkit | 500,000 CC upon final release and acceptance |
| **Total** | **3,000,000 CC** |

## Volatility Stipulation

The planned project duration is approximately 6 months.

The grant is denominated in fixed Canton Coin. If the project timeline extends beyond 6 months due to Committee-requested scope changes, any remaining milestones should be renegotiated to account for significant USD / CC price volatility.

# Co-Marketing

Upon release, the implementing entity will collaborate with the Foundation on:

1. Announcement coordination.
2. Case study or technical blog.
3. Developer or ecosystem promotion.
4. Reference implementation walkthrough.
5. Promotion of the integration guide to Canton DeFi builders.
6. Joint educational content around Canton-native DeFi capital safety, LP protection, and multi-party workflow design.

# Motivation

Canton DeFi needs reusable capital safety infrastructure as the ecosystem grows.

As more DEX, lending, vault, perps, RWA, and strategy products are deployed on Canton, protocols will repeatedly face similar capital control questions:

1. How capital enters safely.
2. How ownership is recorded before capital deployment.
3. How capital use is approved before execution.
4. How risk events pause new exposure.
5. How LPs exit under normal and stressed conditions.
6. How responsibility is allocated among capital providers, operators, protocols, and governance.
7. How auditors and observers can receive visibility without being granted execution power.

Without a reusable framework, each protocol must solve these issues separately. That creates inconsistent standards, duplicated engineering work, uneven LP protection, and weaker ecosystem-level risk controls.

Canton SafeVault provides a shared structure that can improve the quality and consistency of DeFi capital management across the Canton ecosystem.

The project helps Canton DeFi move from protocol-specific safety design toward a reusable capital control layer that can support institutional capital, managed liquidity, RWA products, and more complex financial workflows.

# Rationale

Canton SafeVault is the right approach because it uses Canton’s native strengths instead of copying EVM-style admin and multisig patterns.

In many EVM systems, capital control is built around admin wallets, multisig approvals, off-chain monitoring, and protocol-specific pause functions. These mechanisms are useful, but they often remain outside the core business workflow.

Canton can support a stronger model:

1. Roles can be represented as Parties.
2. Permissions can be expressed through Daml signatories and controllers.
3. Observers can receive visibility without execution rights.
4. Workflows can require multiple Parties before state transitions occur.
5. Sensitive financial data can be selectively visible.
6. Capital lifecycle state can be audited without exposing unnecessary information to all participants.

SafeVault applies these capabilities directly to DeFi capital management.

Alternatives considered:

| Alternative | Limitation |
|---|---|
| Protocol-specific safety logic | Leads to duplicated work and inconsistent standards across DeFi protocols |
| External multisig-only control | Provides admin protection but does not fully embed risk logic into capital lifecycle states |
| Pure off-ledger risk monitoring | Useful for alerts, but insufficient for enforceable capital restrictions |
| Single-purpose vault design | Solves one protocol’s needs but does not provide reusable ecosystem infrastructure |
| Fully on-ledger computation | Inefficient for complex monitoring, valuation, and simulation workloads |

The preferred approach is a hybrid Canton-native framework:

1. Put ownership, approvals, risk state, redemption state, and execution records on-ledger.
2. Keep complex monitoring, valuation, and reporting off-ledger.
3. Allow authorized Reporter Parties to submit validated reports.
4. Use adapters to connect SafeVault to different protocol types.
5. Keep the SafeVault core standardized while allowing protocol-specific behavior to remain configurable.

This design provides a practical balance across security, composability, privacy, implementation feasibility, and ecosystem reuse.
