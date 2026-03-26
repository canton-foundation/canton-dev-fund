---
title: "FX Layer: Institutional FX Settlement Infrastructure for Asia "
author: "FX Layer Team (Undefined Labs / NodeInfra)"
status: Submitted
created: 2026-03-26
---

# FX Layer: Institutional FX Settlement Infrastructure on Canton Network

## Abstract

FX Layer is an institutional settlement infrastructure that enables same-day, atomic FX settlement between Asian non-USD stablecoins and USD — replacing the correspondent banking chain with a net-settlement model built on Canton Network and Ethereum.

This proposal requests a Canton Development Fund grant to support the design, implementation, and pilot deployment of FX Layer's DAML-based settlement engine. By leveraging Canton's privacy-preserving coordination layer and DAML's formal contract guarantees, FX Layer targets the structural gap in Asia's interbank FX market — the ~$22–29B/day in KRW/USD flows that fall outside CLS coverage — with an initial pilot in Korea and planned expansion to JPY/USD, TWD, THB, and VND corridors.

This project delivers a replicable, production-grade DAML workflow for institutional FX settlement that directly demonstrates Canton's value proposition to regulated financial institutions in Asia.

**Regulatory credentials:** FX Layer Team holds a Hong Kong SFC Type 1 (Dealing in Securities) license and a Digital Asset Dealing license, providing the regulatory foundation for cross-border institutional FX operations across Asia.

**Traction to date:** FX Layer Team is actively providing blockchain adoption initiatives to leading Korean financial institutions including NH Bank, Kakao Bank, Line Bank, and Kyobo Group, and is delivering a POC to one of Korea's top 5 card companies. JPYSC — the JPY stablecoin issuer under SBI — has committed to a joint testbed with FX Layer, with a target of completing KRW and JPY stablecoin testing by June 2026. This positions FX Layer as the first live institutional FX settlement test across both corridors simultaneously.

---

## Specification

### Objective

**Problem:** The majority of Asia's interbank FX settlement still flows through correspondent banking chains, exposing banks to Herstatt risk (settlement leg mismatch), multi-day prefunding costs, and operational opacity. CLS covers ~72–76% of Korean FX flows but structurally excludes KRW same-day settlement, off-window trades, and tokenized currency legs. This residual — estimated at ~$289B/day in Korea alone — has no PvP settlement solution today.

**Intended Outcome:** FX Layer delivers two distinct functions across its two-chain architecture:

**Canton — Private post-trade coordination for Asian banks**
Asian financial institutions use Canton as the private post-trade coordination layer — not a message bus, but the infrastructure that brings multiple institutions, looking at the same trade, to the same state and the same outcome. Banks submit FX settlement instructions, confirm counterparty readiness, and track settlement state through Canton's DAML workflow, with each institution's trade details and positions visible only to direct counterparties. Canton replaces the opacity and bilateral dependency of SWIFT MT messaging with structured, privacy-preserving, multi-party coordination — without requiring trust in a central operator.

**Ethereum — Actual settlement of KRW/JPY → USD**
The net residual after Canton-coordinated netting settles atomically on Ethereum: KRW and JPY stablecoins are escrowed, collateral is posted to Sky Protocol CDPs, USDS is minted and swapped to USDC via PSM, and the USD leg is delivered to the receiving custodian. This gives Asian banks same-day, on-chain FX finality without pre-positioning USD.

**Strategic Goal — Asian institutional use case and pipeline**
FX Layer is designed as the first production deployment of Canton as institutional FX infrastructure in Asia, creating a replicable corridor template and a live pipeline of regulated financial institution participants across Korea, Japan, and subsequently Taiwan, Thailand, Vietnam, and Southeast Asia.

Specific outcomes:
- Canton adopted as the post-trade coordination layer for FX settlement among Asian financial institutions
- Atomic PvP settlement of KRW/USD and JPY/USD on Ethereum, same-day
- Multilateral netting of bilateral FX obligations, reducing gross prefunding requirements by up to 35%
- Privacy-preserving settlement: counterparty details and positions remain invisible to third parties, including other FX Layer participants
- Production pipeline of Asian institutional participants providing a reference case for Canton ecosystem expansion

#### Value to Participating Institutions

Participating financial institutions gain measurable operational and financial improvements over legacy interbank FX infrastructure:

- **Settlement window:** T+1 ~ T+2 → Same-day settlement (↓ 88%)
- **Funding basis:** Gross pre-funding → Net residual only (↓ 35%)
- **Bridge liquidity required:** Full gross path → Residual-only bridge (↓ 80%)
- **Funding cost driver:** Multi-day gross carry → Intraday net fee (Gross → Net)

Beyond the quantitative impact:

- **Herstatt risk eliminated.** Atomic PvP settlement on Ethereum removes settlement leg mismatch risk — both legs settle simultaneously or neither does.
- **No USD pre-positioning required.** Sky Protocol CDP replaces the need for banks to hold gross USDC reserves; only the net residual is funded intraday against posted collateral.
- **Counterparty privacy guaranteed.** Canton's sub-transaction privacy ensures trade amounts, netting positions, and counterparty identities are visible only to direct participants — not to other network members or the Operator.
- **PFMI Principle 8 compliance.** On-chain settlement provides the legal finality clarity required by regulators for institutional FX infrastructure.
- **No core banking changes required.** Institutions integrate via Canton party registration and API; ISO 20022 compatibility is maintained throughout.

---

### Implementation Mechanics

FX Layer is structured as a three-layer architecture:

#### Layer 1 — Private Post-Trade Coordination (Canton / DAML)

Canton is not a message bus — it is the private post-trade coordination layer where multiple institutions, looking at the same trade, are brought to the same state and the same outcome. The core challenge of FX post-trade is not transmitting instructions; it is achieving consistent state across counterparties while preserving bilateral confidentiality. Canton Participants provide each institution with a private, self-sovereign computational and storage unit with a party-specific view. The Canton Synchronizer provides ordered, confidential communication and two-phase commit-based coordination — ensuring that RFQ acceptance, obligation registration, netting finalization, readiness, timeout, and rollback transitions occur in a consistent sequence across all parties. The DAML contract encodes the full settlement state machine: `INITIATED → COLLATERAL_REQUESTED → USDS_MINTED → USDC_READY → OFF_RAMP_PENDING → SETTLED` (with failure/recovery states including `AUTO_REVERTED` and `AUTO_CANCELLED`). Sub-transaction privacy ensures no institution observes another's positions or counterparties. Settlement IDs are registered on-chain for idempotency. ISO 20022 message compatibility is maintained for existing bank system integration.

#### Layer 2 — Settlement (Ethereum)

Asset movement — stablecoin escrow, CDP collateral posting, USDS minting via Sky Protocol, USDC swap via PSM, and final USD delivery — executes atomically on Ethereum. The Operator bridge listens for Canton state transitions and triggers corresponding Ethereum transactions, ensuring Canton's workflow state and Ethereum's asset state remain consistent throughout the settlement lifecycle.

#### Layer 3 — Liquidity (Sky Protocol CDP)

Custodians post fiat-backed collateral to Sky Protocol CDPs, mint USDS, and swap to USDC via PSM for intraday net residual funding. This eliminates the need for banks to hold USDC pre-positioned, replacing gross prefunding with a collateral-based intraday facility. For the KRW corridor, this role is fulfilled by BDACS — a Hana Bank subsidiary holding both a Korean VASP license and ISMS certification — providing the regulated custodian infrastructure required for institutional-grade KRW stablecoin settlement.

#### Operational Roles

- **Operator:** FX Layer Team — workflow orchestration, BD
- **Development:** NodeInfra — all DAML, Ethereum, and infrastructure development
- **Node Operator:** NodeInfra — Canton validator node operation
- **KRW Custodian:** BDACS (Hana Bank subsidiary; Korean VASP license, ISMS certified) — KRW collateral posting, off-ramp
- **JPY Stablecoin:** JPYSC (SBI subsidiary) — JPY stablecoin issuance and testbed
- **Sender / Receiver:** Participating financial institutions

---

### Architectural Alignment

FX Layer's use of Canton is a deliberate architectural decision rooted in the specific requirements of institutional FX post-trade processing. Each of Canton's core design properties maps directly to a non-negotiable requirement of the use case.

#### Private by Design

In institutional FX, trade amounts, counterparty identities, netting results, readiness status, and exception details are commercially sensitive. This information must be shared between relevant parties — but has no business being visible to the broader network. Canton Participants store only the state within their signatory and observer scope, and sub-transaction privacy ensures that unauthorized payloads and metadata remain invisible to parties without a stake in that specific transaction. The result is a system where only the parties who need to see specific data can see it — enforced structurally, not by policy.

#### Ordered Coordination

FX post-trade requires that multiple institutions process a defined sequence of state transitions — RFQ acceptance, obligation registration, netting finalization, readiness confirmation, timeout, rollback — in the same order. The Canton Synchronizer sequences these messages like a secure message queue; the mediator collects participant validation results and issues a binding verdict. This makes Canton a coordination layer that enforces consistent state-transition ordering across all participants — not a transport layer that merely delivers messages and leaves consistency to the application.

#### State Agreement, Not Just Messaging

SWIFT is formally a financial messaging infrastructure, not a payment or settlement system. The gap between "a message was sent" and "all parties have agreed on the same state" is precisely where FX settlement failures occur. Canton closes this gap: whether a trade is matched, an obligation registered, netting finalized, PvPReady confirmed, `settled_onchain`, or `fiat_completed` — these states carry the same meaning to every participant. This — state agreement across institutions without requiring trust in a central operator — is the most fundamental reason for using Canton in FX Layer.

#### Ethereum Settles, Canton Coordinates

This architecture assigns each layer its appropriate role. Ethereum handles final asset settlement and public proof of finality. Canton handles the sensitive pre-settlement workflow: RFQ, quote acceptance, obligation registration, bucket lifecycle, readiness, timeout, rollback, and exception handling. Only the final settlement batch surfaces on Ethereum. This role separation is what makes it possible to achieve both public on-chain finality and institutional confidentiality simultaneously — without compromise on either.

#### Expansion Path

Initial deployment runs on a corridor-specific private synchronizer — the appropriate configuration for a controlled institutional pilot. As broader ecosystem connectivity becomes necessary, the architecture supports expansion to a Global Synchronizer: a decentralized, transparently governed interoperability service that enables atomic cross-chain transactions while preserving each participant's privacy and independent control. Canton's design thus provides a clear and natural expansion path from a narrow bilateral corridor to a multi-corridor, multi-jurisdiction institutional network.

---

### Backward Compatibility

FX Layer is a greenfield deployment. It does not modify existing Canton infrastructure, DAML standard library, or Canton Network consensus mechanisms.

Participating financial institutions interact with FX Layer via Canton party registration and API integration — no changes to their existing core banking systems are required. SWIFT/ISO 20022 messaging compatibility is maintained for settlement instruction intake.

*No backward compatibility impact on existing Canton deployments.*

---

## Milestones and Deliverables

### Milestone 1: POC — Canton Testnet Deployment

- **Estimated Delivery:** Month 2
- **Focus:** Design and deploy the FX Layer DAML settlement workflow on Canton testnet as a functional POC
- **Deliverables / Value Metrics:**
  - DAML settlement state machine (all states, transitions, and guards: `INITIATED → COLLATERAL_REQUESTED → USDS_MINTED → USDC_READY → OFF_RAMP_PENDING → SETTLED`, plus `AUTO_REVERTED` / `AUTO_CANCELLED`)
  - Party registration and permission model
  - Settlement ID registry contract (idempotency)
  - Canton testnet deployment with documented test results
  - Full test coverage: unit tests, happy path, all failure/recovery scenarios
  - Technical documentation: contract specification and state transition diagram

### Milestone 2: KRW & JPY Stablecoin Testnet Testing

- **Estimated Delivery:** Month 4
- **Focus:** Multi-party testnet validation of KRW/USD and JPY/USD settlement corridors — KRW stablecoin with BDACS (Hana Bank subsidiary; Korean VASP license, ISMS certified), JPY stablecoin with JPYSC (SBI subsidiary)
- **Deliverables / Value Metrics:**
  - Canton testnet deployment with production-equivalent multi-party configuration
  - Multi-party onboarding: Operator, KRW custodian, KRW stablecoin counterparty, JPY stablecoin counterparty
  - KRW/USD corridor: minimum 30 test settlements with documented results
  - JPY/USD corridor: minimum 20 test settlements with documented results
  - KPIs: settlement state consistency rate, timeout/recovery handling, netting efficiency vs. gross baseline
  - Joint testbed findings report

### Milestone 3: Mainnet Launch & Live Transactions

- **Estimated Delivery:** Month 6
- **Focus:** Production deployment on Canton Network and Ethereum mainnet; first live settlement transactions executed
- **Deliverables / Value Metrics:**
  - Production deployment: Canton Network + Ethereum mainnet
  - Live settlement transactions executed on mainnet
  - Multi-sig operator key management (production security standard)
  - Automated monitoring, alerting, and incident response runbook
  - Post-launch settlement volume and performance metrics report
  - Developer documentation and corridor integration guide (open-sourced as Canton reference implementation)

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone
- Demonstrated functionality or operational readiness (live settlement execution, not mock)
- Documentation and knowledge transfer provided (DAML contract docs, integration guide, runbook)
- Alignment with stated value metrics (prefunding reduction, settlement lead time, failure rate)

**Project-specific criteria:**

- Milestone 1: All DAML contracts deployed to Canton testnet; unit tests and all failure/recovery scenarios pass
- Milestone 2: Minimum 30 KRW/USD and 20 JPY/USD test settlements completed with consistent state results across all parties
- Milestone 3: Canton Network and Ethereum mainnet deployment verified; live settlement transactions executed on mainnet; multi-sig operator keys active

---

## Funding

**Total Funding Request:** $300,000 USD equivalent in CC
*(CC amount to be confirmed based on CC/USD rate at time of acceptance)*

### Payment Breakdown by Milestone

- **Milestone 1** — POC Canton Testnet Deployment: $100,000 USD equiv. in CC
- **Milestone 2** — KRW & JPY Stablecoin Testnet Testing: $100,000 USD equiv. in CC
- **Milestone 3** — Mainnet Launch & Live Transactions: $100,000 USD equiv. in CC
- **Total: $300,000 USD equiv. in CC**

Payment is milestone-gated: each tranche is released upon Tech & Ops Committee acceptance of the respective milestone deliverables.

### Volatility Stipulation

Project duration is 6 months. The grant is denominated in fixed Canton Coin. Should the Committee request scope changes that extend the timeline beyond 6 months, remaining milestones will be renegotiated in accordance with standard Foundation policy.

---

## Co-Marketing

Upon completion of each pilot milestone, FX Layer Team and NodeInfra will collaborate with the Canton Foundation on:

- **Announcement coordination:** Joint press release on KRW/USD pilot launch with named Korean financial institution participants (subject to institutional approval)
- **Technical blog / case study:** Deep-dive on DAML settlement state machine design, Canton privacy model application in institutional FX, and pilot results (prefunding reduction metrics, settlement performance)
- **Ecosystem promotion:** Presentation at Canton developer / ecosystem events; FX Layer positioned as reference implementation for institutional finance on Canton
- **Open-source contribution:** Canton corridor integration guide and DAML settlement template published as open-source reference for future institutional deployments

---

## Motivation

**Why is this valuable to the Canton ecosystem?**

FX Layer addresses one of the most structurally important unmet needs in institutional finance: real-time, privacy-preserving PvP settlement for interbank FX. The target market — Asia's non-USD stablecoin FX corridors — is large ($22–29B/day in Korea's KRW/USD residual alone), growing rapidly (Korea's daily FX turnover increased 17% YoY in 2025), and underserved by existing infrastructure (CLS does not cover KRW same-day settlement; CLSNow excludes KRW entirely).

For Canton, FX Layer delivers:

1. **Canton as the SWIFT replacement for Asian FX.** FX Layer positions Canton not as a generic blockchain but as a purpose-built institutional coordination rail for FX — directly competing with SWIFT MT in the Asian interbank market. This is the highest-value institutional narrative available for Canton: regulated financial institutions adopting Canton for the same core function SWIFT has served for 50 years, with stronger privacy guarantees and programmable settlement finality.
2. **Proven Asian institutional pipeline.** FX Layer is not a speculative build — it enters the grant period with a live pipeline of regulated financial institutions already engaged. FX Layer Team is actively delivering blockchain adoption initiatives to NH Bank, Kakao Bank, Line Bank, and Kyobo Group in Korea, and a POC with one of Korea's top 5 card companies. JPYSC (the JPY stablecoin issuer under SBI) has committed to a joint testbed targeting June 2026. This is the most advanced institutional FX pipeline on Canton to date, and its expansion into TWD, THB, VND, and broader Southeast Asia represents a direct and growing Canton Network footprint across the region.
3. **DAML ecosystem depth.** FX Layer's settlement state machine is one of the most complex, real-world DAML applications to date, producing reusable patterns (multi-party FX workflow, ISO 20022 integration, Ethereum bridge) that the broader Canton developer ecosystem can build on.
4. **NodeInfra alignment.** As the Canton Network official developer team, NodeInfra's ownership of FX Layer's development ensures the deepest possible alignment between the application layer and Canton infrastructure — and signals to other institutional developers that Canton is production-ready for regulated finance.

---

## Rationale

**Why is this the right approach?**

#### Why Canton as the Private Coordination Layer for Asian FX Post-Trade?

SWIFT MT messaging is stateless — it carries instructions but cannot enforce settlement workflow, guarantee counterparty readiness, or provide privacy beyond bilateral message exchange. More fundamentally, SWIFT confirms that a message was delivered; it cannot confirm that all counterparties have reached the same state. The gap between "a message was sent" and "all parties have agreed on the same outcome" is precisely where FX settlement failures occur — matched trade disputes, netting discrepancies, readiness mismatches, and rollback coordination failures. Canton closes this gap structurally. Whether a trade is matched, an obligation registered, netting finalized, or PvP readiness confirmed — these states carry the same meaning to every participant, enforced by Canton's two-phase commit coordination and DAML's formal contract guarantees, without requiring trust in any central operator. For Asian banks, Canton is not a messaging replacement they need to relearn — it is an upgrade to the post-trade coordination infrastructure that SWIFT has never been able to provide. Alternative approaches — permissioned EVM chains, SWIFT overlay networks, or centralized settlement engines — either sacrifice privacy, lack formal state guarantees, or reintroduce the single-operator trust model that Canton's architecture is designed to eliminate.

#### Why Net Settlement Over Gross?

CLS's own data shows that multilateral netting reduces funding liquidity requirements by 95.6% across its member banks. FX Layer applies the same netting logic to the residual flows CLS cannot handle, delivering equivalent capital efficiency to the CLS-excluded segment.

#### Why Sky Protocol for Liquidity?

Sky Protocol's CDP mechanism allows custodians to access intraday USDC liquidity against fiat-backed collateral without requiring pre-positioned USD. This eliminates the largest operational barrier to same-day settlement — the need for banks to maintain gross USDC reserves. The PSM's 1:1 USDS→USDC conversion at zero fee provides a predictable, zero-slippage swap path for the liquidity bridge.

#### Why Start with KRW/USD and JPY/USD?

KRW/USD represents 77.6% of Korea's FX turnover and is structurally excluded from CLSNow. JPY/USD is the largest FX pair in Asia-Pacific ($440B/day). Both markets have identified VASP-licensed custodians, regulatory clarity on stablecoin participation, and institutional counterparties ready to engage. They provide the highest-confidence path to a production pilot while establishing the template for subsequent corridor expansion.
