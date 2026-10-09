# Canton Risk Engine — Open-Source Risk-Parameter Primitives & Reference Implementations for Zenith DeFi

| Field | Value |
| :---- | :---- |
| **Organization** | Woof |
| **Author / Primary Contact** | Mykola Ilchuk, Woof ([@Noosphere-314](https://github.com/Noosphere-314)) |
| **Status** | Submitted |
| **Created** | 2026-08-17 |
| **Proposal Type** | RFP-aligned |
| **RFP / Roadmap Area** | RFP 13, Payments and DeFi (Financial Markets, Standards & Verification) |
| **Champion** | `Needs Champion` |
| **Total Funding Request** | $150,000 USD, paid in Canton Coin at each milestone's acceptance rate |
| **Project Duration** | 6 months |
| **Label** | `defi-liquidity` |

---

# Abstract

This proposal funds the **Canton Risk Engine** — open-source risk-parameter primitives and reference implementations for Canton/Zenith DeFi protocols. It extracts and generalizes three risk-management patterns proven in production on Compound Finance — the **Configurator pattern** (on-chain parameter governance, Compound Labs' design, which Woof operates across the markets it deploys), the **CAPO oracle approach** (Correlated-Assets Price Oracle, price-induced risk handling, which Woof implemented for Compound), and the **Reserve Growth tracking model** (operational risk visibility, Woof's own work) — and ships them as Canton-native public goods that any protocol can use inside its own contracts.

**This is not a product or a paid service.** The deliverables are open-source building blocks (MIT and Apache-2.0): an on-chain risk-parameter registry (Solidity) and open reference implementations (Solidity + DAML) that firms integrate when their contracts need these parameters, plus an optional open-source simulator and a self-hostable dashboard as tooling on top. Nothing depends on a service run by Woof: Woof runs one free public instance of the dashboard as a reference, and the Registry and the reference implementations work without it.

**Total funding:** $150,000 USD, denominated in Canton Coin at the prevailing USD/CC rate at each milestone's acceptance, across 3 milestones. The volatility-adjustment mechanism required by CIP-0100 is set out in the Funding section.
**Duration:** 6 months across 3 milestones.

---

# Motivation

Canton DeFi is approaching its first production lending markets and yield vaults, and each of them has to govern its risk parameters before mainnet. Mystic's author ([#99](https://github.com/canton-foundation/canton-dev-fund/pull/99), now a curated lending proposal, with the vault standard moving to a separate proposal) wrote that the vault standard leaves valuation, strategy, fees, access and roles to the implementer, which is also their own design for the CIP. Their own implementation will put risk-increasing changes behind a timelock ([comment of 17 September 2026](https://github.com/canton-foundation/canton-dev-fund/pull/99#issuecomment-5717314654)). Lending and vault proposals listed under References are candidate integrators. SafeVault ([PR #266](https://github.com/canton-foundation/canton-dev-fund/pull/266)) sits at a higher layer (capital flow workflows) but is a natural integration partner.

Moonsong Labs, who are building a Canton vault management product for institutions to run in their own environment, replied to our forum notes on this layer that "the parameter layer you describe is the one we have to operate" ([forum](https://forum.canton.network/t/9098/2)). The risk-observer role in the DAML deliverable below is our response to a point they raised there. After we published the pre-submission write-up, Tokenisys responded on the forum that they "would be interested in integrating products on this type of infrastructure", naming two candidates: their token risk-rating model and a DAML option-pricing / VaR-CVaR distribution ([forum post](https://forum.canton.network/t/woof-two-dev-fund-proposals-evm-side-compliance-risk-infrastructure-for-canton-seeking-feedback-champion/8796/2)).

Every lending market and vault faces the same questions before mainnet:

1. **What collateral factor** should each asset have, and how does it change as the market grows?
2. **What supply cap and borrow cap** prevents single-asset concentration?
3. **What liquidation threshold** balances borrower comfort against insolvency risk?
4. **What interest rate model curve** keeps utilization in safe bounds?
5. **How are these parameters updated** through governance without breaking active positions?
6. **What price feed integrity** is required, and how is it monitored?
7. **What reserves** does the protocol hold, and what is their growth pattern?

On Ethereum these problems were solved over 4+ years of evolution: Compound's Configurator, Aave's Risk Stewards, Gauntlet / Steakhouse / Block Analitica as commercial risk consultants. On Canton, OpenZeppelin's funded stack will implement a baseline parameter surface and its change path, and leaves calibration to the operator (see Fit with existing ecosystem tooling). We have not found an open, shared layer for governed parameter updates across protocols, for simulation or for public parameter history, so each team would build its own.

This proposal builds that shared layer before Canton's first lending markets and vaults reach mainnet.

---

# Specification

## 1. Objective

Ship open-source (MIT and Apache-2.0) risk-parameter building blocks that any Zenith DeFi protocol can use inside its own contracts — not a product Woof operates. The core deliverables are: (a) on-chain risk-parameter primitives (a registry with standardized parameters, governance timelock, and emergency pause), and (b) reference implementations in Solidity + DAML showing how a protocol wires them in. Optional open tooling on top: (c) an off-chain simulator producing parameter-change recommendations from historical price data and stress tests, and (d) a self-hostable dashboard visualizing risk state for integrated protocols.

The scope explicitly does **not** include code-level security auditing (different domain from [Hacken #302](https://github.com/canton-foundation/canton-dev-fund/pull/302), [DamlSec #194](https://github.com/canton-foundation/canton-dev-fund/pull/194), [Daml Package Analyzer #130](https://github.com/canton-foundation/canton-dev-fund/pull/130)), external rating services ([Staking Rewards #131](https://github.com/canton-foundation/canton-dev-fund/pull/131)), or capital-flow workflows ([SafeVault #266](https://github.com/canton-foundation/canton-dev-fund/pull/266)). Layer boundaries are explicit in the Rationale.

## 2. Implementation Mechanics

Two core deliverables, **on-chain primitives** and **reference implementations** (the public good firms build on), plus two pieces of **optional open tooling** (simulator, dashboard). Nothing is a paid product, and nothing depends on a service run by Woof.

### Layer 1 — On-Chain Risk Parameter Registry (Solidity, deployed on Zenith)

A permissionless on-chain registry that any Zenith DeFi protocol can integrate, storing standardized risk-parameter sets per protocol namespace with governance hooks for safe parameter updates. The parameter set below is an **illustrative reference design** showing the intended shape — the exact fields and interface surface will be finalized during M1 in consultation with the first integrating protocols.

**Standardized risk parameters (illustrative reference set):**

| Parameter | Purpose |
| :---- | :---- |
| Collateral factor | Borrowing power granted per unit of collateral |
| Liquidation threshold | Health-factor boundary that triggers liquidation |
| Supply cap | Maximum total supply per asset (concentration limit) |
| Borrow cap | Maximum total borrow per asset |
| Reserve factor | Share of interest routed to protocol reserves |
| Interest-rate model | Reference to the asset's rate-curve contract |
| Price oracle | Reference to the asset's price source |
| Oracle staleness threshold | Maximum acceptable price age before fail-safe |
| Attestation validity window | For issuer-attested values (for example a fund NAV) rather than market feeds: maximum attestation age and a revocation check before the value may be used |
| (extension points) | CIP-56 compliance flags and protocol-specific fields |

**Registry operations (illustrative):** read the current parameter set for a given protocol/asset; propose a parameter update; execute it after the timelock, or after approval alone for a change classified as risk-reducing; and emergency-pause an asset to halt new positions. The registry will cover the following functional areas (final contract decomposition driven by the cleanest, most auditable design during M1):

- **Standardized parameter storage** — a standard set of the risk parameters above, per namespace.
- **Governed updates**: a propose → timelock → execute lifecycle for changes that loosen risk; a change classified as risk-reducing for its parameter may take effect without additional delay after the required approval.

Key design choices:
- **Configurator pattern.** Parameter updates go through propose → timelock → execute, borrowed from Comet's Configurator architecture. The execute step re-checks the proposal against the namespace's current bounds, value and revision, so a proposal made against an earlier state cannot apply, even if a value has since returned to what it was. Each supported parameter defines which direction of change is risk-reducing; only such changes can skip the delay, and a parameter without that definition always waits the full timelock. Changes to the timelock itself wait for the current timelock, so shortening the delay cannot bypass the notice it was meant to give.
- **Namespaces bound to the protocol's own governance.** A namespace is keyed to the address that creates it, normally the protocol's own governance (a Governor, a timelock or a Safe). Only that address, and the setter and guardian roles it appoints for that namespace, can write to it, so it cannot be squatted and two protocols never collide. A readable label, if any, is metadata, not authority. A namespace keeps its identifier when it moves to a new governance address, which takes two steps: the current governance proposes the handover and the new address accepts it. After that the old address has no rights, the new governance confirms or replaces the appointed roles, and proposals made under the old governance can no longer execute; a pending handover can be cancelled or replaced.
- **Governance-agnostic.** Supports Compound Governor, Safe multisig, or any EVM-addressable signer as authorized parameter setter. A Canton party is not an EVM address; using a Canton-side committee as setter requires an EVM-compatible adapter (a signer or relayer holding the setter role), which is out of scope for the base Registry and is scoped separately if a design partner needs it.
- **Per-namespace emergency pause.** The guardian that a namespace's governance appoints can pause an asset in that namespace at once; integrating contracts then stop new positions while existing ones wind down. Lifting a pause is a decision of the namespace's governance and does not wait for the timelock; it cannot carry new limits or bypass their delays, and a pause does not stop pending changes from maturing.
- **Structured events.** Off-chain consumers (dashboards, simulators) can reconstruct full Registry state from emitted logs.
- **No global admin, versioned deployments.** Each Registry version is deployed without an owner or upgrade key. Only a protocol's own governance, and the roles it appoints, can change its parameters or pause its assets; no one outside it, Woof included, can do either, and no one can replace the code under a deployed version. Improvements ship as a new version at a new address, and each protocol moves only when its own governance decides to. Adding any registry-wide role would change this proposal and its Milestone 1 criteria, and would go to the committee before it is built.
- **A reference deployment, not a canonical one.** Woof deploys a public reference instance of each version on Zenith testnet. It has no special status: a protocol can use it or deploy the same code itself.

### Layer 2 — Off-Chain Risk Simulator (TypeScript + Python) — optional open tooling

Open-source simulator that consumes Registry state + oracle history and outputs recommended parameter adjustments — an open-source baseline for the core parameter-recommendation loop that protocols otherwise buy as a commercial service (Gauntlet-style).

- **Historical price replay.** Fetch oracle history (initially from Chainlink-on-Canton; from [CRDOS #155](https://github.com/canton-foundation/canton-dev-fund/pull/155) once live).
- **Monte Carlo simulation.** Generate N future price paths from observed volatility, project insolvency risk per parameter set.
- **Stress test runner.** Apply scripted shocks (e.g. -40% in 24h, oracle delay, liquidator failure) and report which positions become unhealthy.
- **Parameter recommendation engine.** JSON-Schema-typed change proposals with justifications.
- **CI/cron mode.** Runs on a schedule, posts recommendations to a configurable webhook (Slack, GitHub Issues, governance forum).

CAPO design lineage is explicit: the simulator distinguishes between **market-price risk** (handled by parameter adjustments) and **oracle-induced risk** (handled by staleness thresholds, price anchor bands, circuit breakers). This split codifies the operational lesson from CAPO.

### Layer 3 — Risk Visualization Dashboard (React / Next.js) — optional, self-hostable tooling

Open-source dashboard for the risk state of protocols that use the Registry, built on public on-chain data and the open simulator's output, with no private data. Inspired by Aave's Risk Dashboard and Woof's own live [Compound Treasury / Reserve dashboard](https://compound.woof.software/treasury).

- Per-protocol snapshot: current parameters, pause state and recent governance actions, read from Registry events.
- Historical timeline of parameter changes with attribution.
- Utilization and reserves for protocols with a supported adapter: at launch, the two EVM reference integrations from Layer 4. Other protocols add an adapter; none is assumed.
- Simulator output viewer: recommended changes alongside current values, with diff and justification.
- Interactive stress-test playground: "what if BTC drops 30%?".

Views of private Canton state are not part of this grant. They need an access model (which party reads what, with which Ledger API credentials) that this proposal does not define; a team that needs them can build on the self-hostable code.

Woof runs one free public instance as a reference. The source is MIT, so any party can run its own, and nothing in the Registry or the reference integrations depends on Woof's instance.

### Layer 4 — Reference Implementations (core public good)

Three production-shaped, open-source implementation examples demonstrating the parameter-governance patterns in use — two consuming the Registry on the EVM side, one Canton-native in DAML.

1. **ERC-4626 vault with risk-managed parameters** (Solidity) — a vault over an EVM-native ERC-20 underlying, consulting the Registry for supply caps and oracle staleness checks. ERC-4626 requires an ERC-20 underlying; a CIP-56 representation on Zenith EVM is a separate dependency that is agreed with the token issuer, not assumed by this deliverable. Suitable as a template for vault proposals in the queue.
2. **Simple lending protocol with risk-managed parameters** (Solidity) — stripped-down Compound v3-shaped market using the Registry for collateral factors, liquidation thresholds, and IRM selection. Not intended to compete with Mystic or any other lending product — explicitly a reference for parameter integration.
3. **DAML risk-parameter governance example**: the same governance discipline expressed as open-source DAML templates (a governed risk-parameter set plus a minimal consuming contract), runnable against a local Canton ledger, with a different lifecycle from the Solidity Registry. The checks run in the transaction that executes an approved governance action, which records the new value with its effective time; the value is read as effective from that time, without a separate activation transaction. Changes to the delay bounds take effect when the committee's action executes, so for that change users rely on the governing committee rather than on a notice period. This gives Canton-native firms an OSS example to follow when their own DAML contracts require governed parameters — with no dependency on the EVM side. Because visibility on Canton is a stakeholder property, the templates also define a designated **risk-observer role**: one or more parties named at setup, made observers of the governed parameter set and of its proposal and execution records, so that risk management and monitoring can read current values and history through the Ledger API without holding any authority over them, and can be added or revoked by the governing party. The role is deliberately a small named set rather than a broad observer list: on Canton a wide observer list grows the contract and its stakeholder set with every reader, a scaling concern other teams have raised on their own designs, so aggregate or public views belong in an off-ledger reader over emitted events rather than in the parameter contract's stakeholders. Where a Daml-side stack such as the OpenZeppelin reference implementations needs a governed parameter source, these templates are the composition point; the Solidity Registry serves protocols that execute on Zenith EVM, and no synchronous read from Daml into EVM state is assumed.

All three ship with CI test suites exercising governance update flows and emergency-pause paths; simulator-driven recommendation flows are exercised against the EVM pair once the optional tooling lands (final milestone).

**Relationship to #621.** Woof's Compliance Middleware SDK proposal ([#621](https://github.com/canton-foundation/canton-dev-fund/pull/621)) also uses a reference lending market and an ERC-4626 vault. Where both proposals are funded, that base and its test infrastructure (Zenith testnet deployment scripts, CI, test tokens) are built once, and each proposal pays only for its own layer on it: this one for Registry integration and parameter governance, #621 for compliance gating. The effort saved goes to additional reference patterns and test coverage rather than being billed twice. Where only one proposal is funded, it builds the minimal base it needs within its own budget. Each proposal's static-analysis report covers its own contracts. A pool where a deposit passes both checks, the eligibility decision and the Registry's limit, would show how the two compose; it is not a deliverable or an acceptance condition of either proposal, and neither proposal's acceptance depends on the other.

### Canton deployment workflow (validated)

Our Canton build-and-deploy workflow is already exercised end-to-end in a public PoC: [woof-software/canton-localnet-poc](https://github.com/woof-software/canton-localnet-poc) builds a DAML package (SDK 3.4.11) and runs it on a live Canton ledger, with the run log and DAR committed as evidence. The risk primitives are drawn from patterns proven on Compound, which we implemented or operate there (see Provenance).

## 3. Architectural Alignment

- **CIP-0100 Dev Fund priorities.** Public good infrastructure, open source (MIT and Apache-2.0), deployed permissionlessly.
- **DeFi readiness.** Lending and vault proposals in the open queue have to govern risk parameters before mainnet, and the Registry is one shared way to do it. These open primitives accelerate the entire EVM-side DeFi ecosystem.
- **2026 DevEx Survey alignment.** "Security & Auditing" ranks 24% Critical / 51% Important. Risk parameter management is the **market-level** risk-mitigation layer distinct from code-level audits.
- **Institutional fit.** 83% of projects in the Foundation's 2026 Developer Experience survey (41 respondents) identify as TradFi or hybrid. Institutional CRO offices need transparent parameter governance and stress-test infrastructure.
- **Independent positioning.** Sits in a layer (parameter management) that does not duplicate or require coordination with any single DAML-side team. Friendly co-existence with SafeVault, Risk Ratings, Collateral Control Plane, Hacken — different layers, all useful.
- **2026-2028 roadmap, RFP 13 (Payments and DeFi).** The Foundation's [2026-2028 Strategic Roadmap](https://github.com/canton-foundation/canton-dev-fund/blob/main/2026-2028-strategic-roadmap.md) asks under Payments and DeFi for "open-source tooling, reference implementations, and standards" for DeFi and liquidity workflows, and specifies that successful proposals "focus on reusable components or standards that can support multiple Canton applications rather than one-off application-specific work". That is this proposal's shape: a parameter registry plus reference implementations that any protocol integrates, MIT and Apache-2.0 licensed, operated by no one. The RWA Standards RFP (item 12.2) separately lists "Repo, collateral, lending, and servicing workflows"; the registry is the parameter-governance layer such workflows consult.
- **Review Process priority areas.** The [Development Fund Proposal Review Process](https://github.com/canton-foundation/canton-dev-fund/blob/main/Development%20Fund%20Proposal%20Review%20Process.md) now directs reviewers to weigh alignment with the 2026-2027 Requests for Proposals, and its priority areas still apply: **Security and Resilience** (which lists "security auditing and tooling" and "monitoring, compliance, and third-party audit capabilities") and **App Building and Developer Experience** ("reduced developer friction"). The Risk Engine provides the parameter-governance layer that lending and vault protocols need before mainnet, with optional market-risk tooling on top; security monitoring stays with dedicated work such as Hacken's approved stack ([#302](https://github.com/canton-foundation/canton-dev-fund/pull/302)). (Quoted phrases are verbatim from those documents.)

## 4. Backward Compatibility

No backward compatibility impact on existing Canton or DAML systems. The Registry, Simulator, and Dashboard are new components deployed alongside existing protocols. Integration is opt-in — a protocol chooses to register and consult the Registry. Existing deployments are unaffected.

Reference integrations are new code; they do not modify any existing protocol.

---

## Dev Fund 2.0 Alignment

**RFP mapping.** RFP 13, Payments and DeFi, under Financial Markets, Standards & Verification. The proposal supplies the parameter-governance layer that lending and vault workflows need before they can be operated at institutional scale.

**Ecosystem need and beneficiaries.** Every lending market and every curated vault on Canton has to govern the same values: collateral factors, caps, liquidation thresholds, oracle staleness limits. OpenZeppelin confirmed the boundary publicly on 3 September 2026: they ship the baseline parameter surface and its change path, and leave calibration and the risk engine to the operator. Without shared primitives each team rebuilds that layer alone, and each rebuild is a separate audit surface. The beneficiaries are lending and vault protocols on Canton and Zenith, the risk and monitoring parties who have to observe those values, and auditors who currently have no common record of what changed and when. The deliverables are open source (MIT and Apache-2.0) and severable; the optional tooling lands last.

**What Woof gets, and what the grant pays for.** Woof works with these patterns day to day: we deploy and run lending markets on EVM chains, operate the Configurator, wrote a CAPO implementation and built the reserve-growth stack (see Provenance). Our interest is to be ready if EVM lending markets, including those of the protocol we work on, come to Canton. None of the deliverables depends on a particular protocol. From this work Woof gets experience building on Canton, a public track record and possibly separate integration work for teams that want help. Any such work would be contracted and paid outside this grant. The grant pays for the open deliverables in the milestones: the Registry, the reference implementations, the optional simulator and dashboard, their tests and documentation, all usable without a contract with Woof.

**Adoption path.** Milestones 1 and 2 are gated on deliverables, since the primitives must exist before anyone can adopt them. Milestone 3, $45,000 and 30% of the total budget, carries one hard adoption gate: at least one external Canton DeFi team has integrated the Registry in a test environment, through its own deployment or a namespace on the reference deployment, and confirmed it publicly. The reported targets, not gated, are at least one production-track protocol publicly committing to integrate by end of Milestone 3 and at least two evaluating. Tokenisys stated interest in integrating two of their own products. Moonsong Labs, replying to our forum notes, wrote that the parameter layer described there is the one they have to operate, and their point on observers shaped the DAML deliverable. The composition points with OpenZeppelin and RedStone are recorded in this file, and RedStone confirmed that its derived capsules will implement the Kaiko Data Standard's interfaces.

---

# Milestones and Deliverables

## Milestone 1: On-Chain Risk Parameter Registry + Governance Patterns

- **Estimated Delivery:** Month 2
- **Focus:** Solidity Registry contracts, governance integration, security baseline.
- **Deliverables / Value Metrics:**
  - `RiskParameterRegistry.sol` and supporting contracts (governance adapter, timelock integration, emergency pause module).
  - Tests for the namespace and admin model: a namespace is keyed to the address that creates it; no caller other than that governance address and the roles it appoints can change the namespace's parameters or pause its assets (fuzzed over arbitrary callers); a namespace handover takes both steps. The Registry contracts have no registry-wide owner, admin role or upgrade proxy, as their verified source on Zenith testnet shows; each namespace's governance keeps authority over that namespace only.
  - Tests for the update lifecycle: a loosening waits the full timelock while a change classified as risk-reducing applies after approval; a cap of zero and a cap below existing exposure behave as specified; changing the timelock does not bypass the current window; a change in state, bounds or governance between proposal and execution stops the proposal, and a proposal cannot execute twice or revive after a value returns to an earlier level; a handover with pending proposals and appointed roles leaves no stale authority; appointed roles cannot act beyond their permissions, for example the guardian cannot lift a pause; a pause lets pending changes mature and lifting it does not carry new limits.
  - Standardized event schema for off-chain consumers.
  - Unit + invariant test suite (Hardhat + Foundry).
  - Slither static analysis report with zero high-severity findings.
  - Integration guide for protocol authors.
  - Deployed and verified on Zenith testnet.
  - **Target:** at least 2 protocol teams from the open queue publicly indicate intent to evaluate integration (adoption signal, reported not gated).

## Milestone 2: Reference Implementations (Core Public Good)

- **Estimated Delivery:** Month 4
- **Focus:** The open implementation examples firms build on — Solidity + DAML.
- **Deliverables / Value Metrics:**
  - ERC-4626 reference vault integrated with the Registry, deployed on Zenith testnet.
  - Reference lending protocol integrated with the Registry, deployed on Zenith testnet.
  - DAML risk-parameter governance example (governed parameter-set templates + minimal consuming contract + designated risk-observer role with read access to the parameter set and its history), executed against a local Canton ledger with run evidence committed.
  - Migration guide for lending and vault protocols adopting the Registry.
  - CI test suites for all three examples covering governance update flows and emergency-pause paths, including repay and add-collateral staying available during a pause in the lending reference.
  - **Target:** at least 1 integration commitment from a protocol team in the open queue, with public statement (adoption signal, reported not gated).

## Milestone 3: Optional Open Tooling (Simulator + Dashboard) + Community Handoff

- **Estimated Delivery:** Month 6
- **Focus:** The optional tooling layer on top of the primitives, plus adoption catalysis and handoff.
- **Deliverables / Value Metrics:**
  - TypeScript Risk Simulator engine: historical replay, Monte Carlo, stress tests, recommendation output.
  - Python interop adapter for quantitative-team workflows (Jupyter, pandas).
  - CI/cron mode with webhook outputs; simulator-driven recommendation flow exercised end-to-end against the M2 reference integrations.
  - React/Next.js Risk Dashboard (MIT, self-hostable) over public on-chain data, with a free public reference instance run by Woof.
  - Documentation site with simulator API reference and dashboard customization guide.
  - **Simulator demonstrably replays** at least 3 canonical historical shock price-paths (March 2020, May 2021, November 2022) against testnet protocol state, with deterministic outputs.
  - Public review iteration via [forum.canton.network](https://forum.canton.network) with feedback incorporated.
  - Walkthrough video: "Adding risk parameter management to your Canton DeFi protocol in 30 minutes."

---

# Acceptance Criteria

Milestones 1 and 2 are gated on deliverables, since the primitives must exist before anyone can adopt them. Milestone 3, the optional tooling layer and 30% of the total budget, carries an explicit adoption gate: the ecosystem should not fund tooling on top of primitives nobody is using.

**Hard acceptance criteria (within our control):**
- **Operational readiness:** Both EVM reference integrations operate end-to-end against the Registry, each for its own operations: the vault for deposit, withdraw, parameter update and emergency pause; the lending market for supply, borrow, liquidation, parameter update and emergency pause; the DAML governance example runs its full cycle on a local Canton ledger, an approved change recorded with its effective time and read as effective once that time is reached, and the designated risk-observer party reads the resulting parameter set and execution record through the Ledger API without being a signatory.
- **Reproducibility:** Simulator outputs are deterministic — same inputs produce same outputs, validated by CI golden tests.
- **Documentation completeness:** Migration guide published; reviewed by ≥ 1 protocol team where available, otherwise validated against a Woof reference integration.
- **Security posture:** Solidity contracts pass Slither with zero high-severity findings.
- **Community engagement:** Forum review cycle on canton.network opened; public feedback either incorporated or formally addressed.

**Milestone 3 adoption gate (must be met for M3 acceptance; gates $45,000, 30% of the total):**
- **≥ 1 external Canton DeFi team** has integrated the Registry from Milestone 1 in a test environment, through its own deployment or a namespace on the reference deployment, and confirmed it publicly.

**Adoption targets (reported, not gated):**
- ≥ 1 production-track protocol publicly committing to integrate by end of M3, ≥ 2 evaluating.

**Environment note.** Where these criteria reference "Zenith testnet", an equivalent public EVM test environment may be substituted if public Zenith testnet access is not yet available at execution time. The on-chain Registry and reference integrations are standard EVM contracts and the off-chain Simulator/Dashboard are environment-agnostic, so all functional criteria remain verifiable independently of Zenith availability.

---

# Funding

**Total Funding Request:** $150,000 USD, denominated in Canton Coin at the prevailing USD/CC rate at each milestone's acceptance.

## Payment Breakdown by Milestone

- **Milestone 1** (Registry + governance patterns): $56,250 USD in CC upon committee acceptance.
- **Milestone 2** (Reference implementations — core public good): $48,750 USD in CC upon committee acceptance.
- **Milestone 3** (Optional tooling: simulator + dashboard + handoff): $45,000 USD in CC upon final release and acceptance, which requires the Milestone 3 adoption gate (see Acceptance Criteria).

Milestone 3 is 30% of the total budget, raised from $41,250 in the September 2026 revision in line with the Dev Fund 2.0 focus on adoption. The $3,750 moves from Milestone 2; the total is unchanged.

## Volatility Stipulation

[CIP-0100](https://github.com/canton-foundation/cips/blob/main/cip-0100/cip-0100.md) requires proposals with milestones at or beyond six months to state explicitly how CC price volatility is handled. This proposal handles it by denominating the engineering budget in USD and converting to Canton Coin at the prevailing USD/CC rate on the date each milestone is accepted. Payment is made in CC; no CC amount is fixed in advance. This is the mechanism we request, subject to the committee's agreement.

The rationale is that the cost of the work is a USD cost, and Canton Coin has moved across a wide range in its short trading history. Fixing a CC quantity at submission would make the real value of delivery a function of the rate on an arbitrary date rather than of the work performed. Should the project timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones are renegotiated on the same basis.

---

# Co-Marketing

Upon release, Woof will collaborate with the Canton Foundation on:

- **Announcement coordination** — joint blog post at v1.0 launch.
- **Technical deep-dive** — engineering post on extracting Compound's risk patterns as Canton public goods, published on Canton Foundation channels.
- **Dashboard walkthrough.** A public session on reading a protocol's parameter history from the Registry, on the reference instance or a self-hosted one.
- **Migration workshops** — 1-2 live sessions with protocol teams during M3, supporting adoption.

---

# Distribution & Go-to-Market

How protocols discover, adopt, and depend on the Risk Engine:

- **Distribution channels.** A public reference deployment of each Registry version on Zenith testnet, which a protocol can use or redeploy from the same code; the off-chain Simulator published as an npm package with a Python interop adapter; the Risk Visualization Dashboard as open source, with a free reference instance run by Woof; everything under a public GitHub repository.
- **The public dashboard instance doubles as documentation.** The parameter history of protocols that use the Registry is visible to LPs, institutions and other builders, so one protocol's integration shows the next team what the Registry does.
- **Onboarding.** The reference implementations (ERC-4626 vault + simple lending market in Solidity, plus the DAML governance example for Canton-native teams) are copy-paste templates; the "add risk parameter management in 30 minutes" walkthrough and the migration guide are the integration path. Time to a first working integration, with a < 1-hour target, is the metric.
- **Targeted adoption.** Direct outreach to lending and vault teams in the queue (see References) and to teams building vault products on Canton, as first integrators. Public integration commitments are tracked as a target adoption metric. Each new lending or vault protocol launching on Zenith is a candidate consumer.
- **Neighboring tools.** Registry events are public and documented, so monitoring and rating tools such as Hacken's ([#302](https://github.com/canton-foundation/canton-dev-fund/pull/302)) or Staking Rewards' ([#131](https://github.com/canton-foundation/canton-dev-fund/pull/131)) can read them if they choose.

---

# Rationale

## Why this approach

**Extract and open-source patterns that already work, rather than invent new ones.** The Configurator, CAPO and reserve-growth designs run in production on Compound across multiple chains, and have been through the market conditions that break parameter systems. Generalizing these patterns as Canton public goods is faster, safer, and more defensible than inventing a new risk-management framework from first principles.

**Loosely-coupled layers let teams adopt incrementally.** A protocol can start with the on-chain Registry for governance hygiene and copy from the reference implementations — the core public good — then optionally add the Simulator for parameter recommendations and the Dashboard for public transparency. Each layer delivers independent value; integration cost is opt-in, and nothing downstream depends on the optional tooling.

## Alternatives considered

- **Build a commercial risk-consulting service (Gauntlet model).** Rejected — not a Dev Fund fit. Risk-as-a-service is a private good; open-source primitives are a public good.
- **Build only the on-chain Registry and reference implementations, drop the tooling entirely.** Considered seriously — the registry + reference implementations are the core public good, and the milestone order reflects that (tooling lands last). We keep the simulator and dashboard in scope as optional open tooling because a registry alone gives protocols no open way to inform parameter choices and no public transparency surface — but they are explicitly severable, and nothing in the core depends on them.
- **Defer to a future generalized DeFi framework.** Rejected: no funded work covers governed parameter updates for Solidity protocols on Zenith, and the gap is immediate and concrete.

## Fit with existing ecosystem tooling

How this proposal relates to adjacent funded and proposed work:

- **OpenZeppelin Canton Stack ([#262](https://github.com/canton-foundation/canton-dev-fund/pull/262))** — funded Daml reference implementations (DEX, vaults, lending) that ship the baseline parameter surface and its change path: `VaultParams`, `maxStaleness`, `maxDeviation`, the `PriceOracle` interface requirements, role transfer through access control. Calibration is explicitly outside their scope: section 7 of their lending design lists buffer sizing, debt ceilings and insurance-fund stress evidence as open questions for the operator, and on 3 September 2026 OpenZeppelin confirmed the boundary publicly: "We do not own calibration. [...] So your proposal does not overlap with ours. It fills the layer we leave to operators." They named two composition seams: parameter governance, where they called our registry design "a natural author for VaultParams updates" (VaultParams is a Daml contract, so that seam runs through the DAML governance example in deliverable 3, not the Solidity Registry), and the oracle interface, which their reference implementations specify but do not implement ([forum reply](https://forum.canton.network/t/9059/6)). Both are points to align on as their implementation starts, not finished integrations.
- **Mystic: curated lending ([#99](https://github.com/canton-foundation/canton-dev-fund/pull/99)) and a vault standard in a separate proposal.** The vault standard, in their words, covers share accounting, the deposit and redemption lifecycle and the events an integrator needs; valuation, strategy, fees, access and roles stay with the implementer ([comment of 17 September 2026](https://github.com/canton-foundation/canton-dev-fund/pull/99#issuecomment-5717314654)). The Registry is one way to govern the risk-parameter part of that surface (caps, collateral factors, oracle references, staleness limits) across protocols. Mystic's own implementation will follow Morpho's curated vaults, with risk-increasing changes behind a timelock. That is their choice for their own vaults; the Registry offers the same discipline as open code to protocols that do not build it themselves.
- **RedStone CAPS ([#497](https://github.com/canton-foundation/canton-dev-fund/pull/497), approved 18 September 2026) and Kaiko Oracle Data Standard ([#113](https://github.com/canton-foundation/canton-dev-fund/pull/113))** — the price layer. The Registry consumes prices and governs the limits a protocol applies on top of them; it does not produce or distribute price data. A lending protocol on Zenith reads its price from a CAPS feed and its risk limits from the Registry. RedStone welcomed the composition on 2 September 2026 ([reply](https://github.com/canton-foundation/canton-dev-fund/pull/497#issuecomment-5507825170)), and on 8 September confirmed that their derived capsules will implement the `PublishedQuote` and `DataPoint` interfaces from the approved Data Standard (#113). Those are Daml interfaces, so the composition is direct on the Canton side: the DAML governance example (deliverable 3) consumes `PublishedQuote` and `DataPoint` as its price source, reads `publishedAt` and the quote timestamp from their view and applies its own staleness limit; issuer validity and revocation are not part of that interface and, where an attested value needs them, come from the attestation itself. On the EVM side the Solidity Registry stores an EVM oracle address and feed identifier, and the reference integrations read prices through an EVM-compatible oracle adapter; whether a CAPS-derived feed is available on Zenith EVM through such an adapter, and with which trust model, freshness and decimals, is confirmed with RedStone during M1 rather than assumed from the Daml interface support.
- **SafeVault ([#266](https://github.com/canton-foundation/canton-dev-fund/pull/266))** — capital flow workflows (entry / allocation / redemption / recovery). Different layer (transaction-level workflows, not parameter management). Natural integration partner.
- **Independent DeFi Risk Ratings ([#131](https://github.com/canton-foundation/canton-dev-fund/pull/131))** — external AAA-D rating service from Staking Rewards. Different model (rating-as-a-service vs on-chain primitives). The Risk Engine produces the parameters their service could rate against.
- **Canton Collateral Control Plane ([#149](https://github.com/canton-foundation/canton-dev-fund/pull/149))** — collateral-specific subset. Potential integration point for the Registry.
- **Hacken open-source monitoring ([#302](https://github.com/canton-foundation/canton-dev-fund/pull/302), approved 26 August 2026)** — post-facto observability. Hacken can consume Registry events as a data source.
- **Daml Package Analyzer ([#130](https://github.com/canton-foundation/canton-dev-fund/pull/130))** — static code analysis. Different domain (code-level vs market-level).
- **Tenderly Simulation for Daml ([#481](https://github.com/canton-foundation/canton-dev-fund/pull/481))** — transaction-level dry-run simulation before submission. Different domain again: our simulator models parameter-level market risk (price-path replay, Monte Carlo), not individual transaction execution.

## Provenance

Each of the three patterns reaches this proposal by a different route, and the difference is worth setting out.

The reserve-growth tracking stack is our own work end to end, running today against live Compound markets ([backend](https://github.com/woof-software/compound-reserve-growth-backend), [frontend](https://github.com/woof-software/compound-reserve-growth-frontend), [data sources](https://github.com/woof-software/compound-reserve-sources)).

CAPO came out of the Aave ecosystem, where BGD Labs first shipped it ([bgd-labs/aave-capo](https://github.com/bgd-labs/aave-capo)), and it is now standard practice for correlated collateral. We brought it to Compound and wrote that implementation: the oracle and its adapter layer for wstETH, rETH, rsETH, ERC-4626 vaults and rate-based sources ([woof-software/compound-capo](https://github.com/woof-software/compound-capo)), with the design discussion on the [Compound forum](https://www.comp.xyz/t/woof-correlated-assets-price-oracle-capo/6245).

The Configurator is Compound Labs' design, and we work with it as operators. Deploying and running Compound markets means driving that update path routinely, which is where our read on its failure modes comes from, and why the reference implementations here treat the parameter update path as the hard part rather than the parameter values themselves.

For a proposal about parameter management, the operating view is the credential that matters, and we would rather set it out precisely than round it up.

## Pre-submission coordination

Low coordination overhead — this is one of the proposal's strengths. No required outreach to any single counterparty. Composition with specific stacks (the OpenZeppelin reference implementations, BitSafe's Decentralization Manager) is delivered as adapters and examples on top of the standalone deliverables, not as a dependency of them.

Light-touch coordination recommended (not blocking):
- Brief forum post mentions to SafeVault (#266), Staking Rewards (#131), Collateral Control Plane (#149), and Hacken (#302) confirming layer boundary alignment.
- Outreach to Mystic, Cantopy, D2 Finance, Margarita, Meria as potential first integrators — public integration intent strengthens M1 / M3 deliverables.
- Review volunteers sought via the `DeFi Protocols & Liquidity` SIG (7 members); the formal Champion comes from the Tech & Ops Committee, per CIP-0100.

---

# Sustainability

Who operates and maintains the Risk Engine after the grant period:

- **Primary steward: Woof.** Woof commits to maintaining the primitives and reference implementations as part of its ongoing open-source footprint — minimum 6 months of bug fixes, Canton SDK compatibility, and Zenith version updates post-delivery, with security disclosures acknowledged within 48 hours, plus quarterly review of community feature requests. Registry versions have no upgrade key, so a security fix ships as an advisory and a new version, and each protocol's governance decides when to move.
- **On-chain layer needs no operator.** Each Registry version is a contract without an owner or upgrade key, and each protocol controls its own namespace; once deployed it needs no operator to keep functioning, and moving to a new version is each protocol's own decision. Integrating protocols read from it directly.
- **Dashboard hosting.** Woof runs the free public reference instance during the grant and the six-month maintenance period. The source is MIT and reads public on-chain data and simulator output, so any party, or the relevant SIG, can run an independent instance, and nothing depends on Woof's instance.
- **Community handoff path.** All code is MIT/Apache-2.0 with a public issue tracker. Stewardship can transition to or be shared with the DeFi Protocols & Liquidity SIG as it matures, avoiding indefinite single-vendor dependency.

---

# Open Source

- Solidity contracts: MIT.
- TypeScript / Python simulator: MIT.
- React dashboard: MIT.
- Reference integrations: Apache-2.0.
- Documentation: CC-BY-4.0.
- The deliverables are new code implementing the patterns described above. Compound III and Woof's CAPO implementation for Compound are published under the Business Source License 1.1, and their code is not copied into these deliverables.
- Repository: `github.com/woof-software/canton-risk-engine`.

---

# Team

**Woof** ([woof.software](https://woof.software)) — senior EVM engineers for DeFi. Active Compound DAO contractor team. Every component this proposal generalizes has a verifiable Woof code precedent:

| Risk Engine component | Woof precedent (public artifact) |
|---|---|
| On-chain parameter registry / Configurator pattern | [`comet`](https://github.com/woof-software) — Compound v3 core (Configurator + Comptroller internals) |
| Price-induced risk handling / CAPO oracle | [`compound-capo`](https://github.com/woof-software/compound-capo) — Correlated-Assets Price Oracle implementation by Woof for Compound |
| Reserve growth tracking / operational risk visibility | [Compound Treasury / Reserve dashboard](https://compound.woof.software/treasury) — live Woof-built reserve-and-treasury analytics for Compound DAO; direct precedent for the Risk Visualization Dashboard (Layer 3) |
| Risk-adjusted leverage UI patterns | [`compound-multiplier`](https://github.com/woof-software) |
| Migration of risk-managed positions | [`migrator-v2`](https://github.com/woof-software) — AAVE / Morpho / Spark → Compound v3 |
| ERC-4626 vault precedent | [`comet-wrapper`](https://github.com/woof-software) |

Operational track record: active Compound DAO contractor team, delivering the deployments behind market expansion to Optimism, Mantle, and additional networks. Each market addition involves the full risk-parameter exercise this proposal generalizes.

This proposal is on-chain risk parameter management. We are not proposing to be a security audit firm, static code analyzer, or rating service — those domains belong to Hacken, Certora, and Staking Rewards respectively.

---

# References

**Direct queue context:**
- [PR #266 Canton DeFi SafeVault Framework](https://github.com/canton-foundation/canton-dev-fund/pull/266)
- [PR #131 Independent DeFi Risk Ratings (Staking Rewards)](https://github.com/canton-foundation/canton-dev-fund/pull/131)
- [PR #149 Canton Collateral Control Plane](https://github.com/canton-foundation/canton-dev-fund/pull/149)
- [PR #302 Hacken monitoring stack](https://github.com/canton-foundation/canton-dev-fund/pull/302)

**Consumer protocols (potential first integrators):**
- [PR #99 Mystic Curated Lending](https://github.com/canton-foundation/canton-dev-fund/pull/99)
- [PR #235 Cantopy Yield Optimizer](https://github.com/canton-foundation/canton-dev-fund/pull/235)
- [PR #144 D2 Finance Vault](https://github.com/canton-foundation/canton-dev-fund/pull/144)
- [PR #186 Margarita CC20](https://github.com/canton-foundation/canton-dev-fund/pull/186)
- [PR #65 Meria DeFi](https://github.com/canton-foundation/canton-dev-fund/pull/65)
- [PR #44 Institutional Yield Segmentation](https://github.com/canton-foundation/canton-dev-fund/pull/44)

**Ecosystem context:**
- [Canton DevEx Survey 2026](https://forum.canton.network/t/canton-network-developer-experience-and-tooling-survey-analysis-2026/8412)
- [CIP-0100 Dev Fund governance](https://github.com/canton-foundation/cips/blob/main/cip-0100/cip-0100.md)
- [Correlated collateral and the parameter layer, with Moonsong Labs' reply](https://forum.canton.network/t/9098/2)

**Woof public artifacts (each component verifiable):**
- [`compound-capo`](https://github.com/woof-software), [`comet`](https://github.com/woof-software), [Compound Treasury / Reserve dashboard](https://compound.woof.software/treasury), [`compound-multiplier`](https://github.com/woof-software), [`migrator-v2`](https://github.com/woof-software), [`comet-wrapper`](https://github.com/woof-software)

**External lineage references:**
- [Compound v3 Configurator](https://github.com/compound-finance/comet/blob/main/contracts/Configurator.sol)
- [WOOF! Development Updates on Compound Community Forum](https://www.comp.xyz/t/woof-development-updates/5336)
- [Aave](https://aave.com/) — public risk-dashboard precedent, design reference for visualization
