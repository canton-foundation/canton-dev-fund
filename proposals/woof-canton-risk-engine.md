# Canton Risk Engine — Open-Source Risk-Parameter Primitives & Reference Implementations for Zenith DeFi

| Field | Value |
| :---- | :---- |
| **Author** | Woof |
| **Status** | Submitted |
| **Created** | 2026-08-17 |
| **Label** | `defi-protocols` |
| **Champion** | Open to any member of the DeFi Protocols & Liquidity SIG; outreach in progress. |

---

# Abstract

This proposal funds the **Canton Risk Engine** — open-source risk-parameter primitives and reference implementations for Canton/Zenith DeFi protocols. It extracts and generalizes three risk-management patterns developed during Woof's contribution to Compound Finance — the **Configurator pattern** (on-chain parameter governance), the **CAPO oracle approach** (Correlated-Assets Price Oracle, price-induced risk handling), and the **Reserve Growth tracking model** (operational risk visibility) — and ships them as Canton-native public goods that any protocol can leverage inside its own contracts.

**This is not a product or a hosted service.** The deliverables are MIT-licensed building blocks: an on-chain risk-parameter registry (Solidity) and open reference implementations (Solidity + DAML) that firms integrate when their contracts need these parameters — plus an optional open-source simulator and a self-hostable dashboard as tooling on top. Nothing is operated by Woof as a paid service.

**Total funding:** $150,000 USD, denominated in Canton Coin at the prevailing USD/CC rate at each milestone's acceptance, across 3 milestones. The volatility-adjustment mechanism required by CIP-0100 is set out in the Funding section.
**Duration:** 6 months across 3 milestones.

---

# Motivation

Canton DeFi is approaching its first production lending markets and yield vaults. At least **6 lending/vault proposals in the open Dev Fund queue** require risk parameter management before mainnet, and none of them propose to solve it themselves:

[Mystic #99](https://github.com/canton-foundation/canton-dev-fund/pull/99), [Cantopy #235](https://github.com/canton-foundation/canton-dev-fund/pull/235), [D2 Finance #144](https://github.com/canton-foundation/canton-dev-fund/pull/144), [Margarita CC20 #186](https://github.com/canton-foundation/canton-dev-fund/pull/186), [Meria #65](https://github.com/canton-foundation/canton-dev-fund/pull/65), [Institutional Yield Segmentation #44](https://github.com/canton-foundation/canton-dev-fund/pull/44). SafeVault ([PR #266](https://github.com/canton-foundation/canton-dev-fund/pull/266)) sits at a higher layer (capital flow workflows) but is a natural integration partner.

The demand is not hypothetical. After we published the pre-submission write-up, Tokenisys responded publicly on the forum that they "would be interested in integrating products on this type of infrastructure", naming two concrete candidates — their token risk-rating model and a DAML option-pricing / VaR-CVaR distribution ([forum thread](https://forum.canton.network/t/woof-two-dev-fund-proposals-evm-side-compliance-risk-infrastructure-for-canton-seeking-feedback-champion/8796)).

Every one of these protocols faces the same questions before mainnet:

1. **What collateral factor** should each asset have, and how does it change as the market grows?
2. **What supply cap and borrow cap** prevents single-asset concentration?
3. **What liquidation threshold** balances borrower comfort against insolvency risk?
4. **What interest rate model curve** keeps utilization in safe bounds?
5. **How are these parameters updated** through governance without breaking active positions?
6. **What price feed integrity** is required, and how is it monitored?
7. **What reserves** does the protocol hold, and what is their growth pattern?

On Ethereum these problems were solved over 4+ years of evolution: Compound's Configurator, Aave's Risk Stewards, Gauntlet / Steakhouse / Block Analitica as commercial risk consultants. **On Canton no equivalent exists** — open-source primitives, governance patterns, simulators, dashboards. Each team rolls their own, badly, and never publishes.

This proposal addresses that shared dependency before any of them hits mainnet. We expect the Risk Engine to be evaluated by at least 50% of the lending/vault proposals listed above during M2-M3, and integrated by at least 2 of them within 6 months post-delivery.

---

# Specification

## 1. Objective

Ship open-source, MIT-licensed risk-parameter building blocks that any Zenith DeFi protocol can leverage inside its own contracts — not a product Woof operates. The core deliverables are: (a) on-chain risk-parameter primitives (a registry with standardized parameters, governance timelock, and emergency pause), and (b) reference implementations in Solidity + DAML showing how a protocol wires them in. Optional open tooling on top: (c) an off-chain simulator producing parameter-change recommendations from historical price data and stress tests, and (d) a self-hostable dashboard visualizing risk state for integrated protocols.

The scope explicitly does **not** include code-level security auditing (different domain from [Hacken #302](https://github.com/canton-foundation/canton-dev-fund/pull/302), [DamlSec #194](https://github.com/canton-foundation/canton-dev-fund/pull/194), [Daml Package Analyzer #130](https://github.com/canton-foundation/canton-dev-fund/pull/130)), external rating services ([Staking Rewards #131](https://github.com/canton-foundation/canton-dev-fund/pull/131)), or capital-flow workflows ([SafeVault #266](https://github.com/canton-foundation/canton-dev-fund/pull/266)). Layer boundaries are explicit in the Rationale.

## 2. Implementation Mechanics

Two core deliverables — **on-chain primitives** and **reference implementations** (the public good firms build on) — plus two pieces of **optional open tooling** (simulator, dashboard). Nothing is a hosted/paid product.

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
| (extension points) | CIP-56 compliance flags and protocol-specific fields |

**Registry operations (illustrative):** read the current parameter set for a given protocol/asset; propose a parameter update subject to a timelock; execute a proposed update after the timelock elapses; and emergency-pause an asset to halt new positions. The registry will cover the following functional areas (final contract decomposition driven by the cleanest, most auditable design during M1):

- **Standardized parameter storage** — a canonical, per-protocol-namespaced set of the risk parameters above.
- **Governed updates** — a propose → timelock → execute lifecycle for every parameter change.

Key design choices:
- **Configurator pattern.** Every parameter update goes through propose → timelock → execute, borrowed from Comet's Configurator architecture.
- **Per-protocol namespacing.** Mystic and Cantopy can register independently without colliding.
- **Governance-agnostic.** Supports Compound Governor, Safe multisig, or custom Canton-party multi-sig as authorized parameter setter.
- **Emergency circuit breaker.** Pauses new positions while existing positions wind down safely.
- **Structured events.** Off-chain consumers (dashboards, simulators) can reconstruct full Registry state from emitted logs.

### Layer 2 — Off-Chain Risk Simulator (TypeScript + Python) — optional open tooling

Open-source simulator that consumes Registry state + oracle history and outputs recommended parameter adjustments — an open-source baseline for the core parameter-recommendation loop that protocols otherwise buy as a commercial service (Gauntlet-style).

- **Historical price replay.** Fetch oracle history (initially from Chainlink-on-Canton; from [CRDOS #155](https://github.com/canton-foundation/canton-dev-fund/pull/155) once live).
- **Monte Carlo simulation.** Generate N future price paths from observed volatility, project insolvency risk per parameter set.
- **Stress test runner.** Apply scripted shocks (e.g. -40% in 24h, oracle delay, liquidator failure) and report which positions become unhealthy.
- **Parameter recommendation engine.** JSON-Schema-typed change proposals with justifications.
- **CI/cron mode.** Runs on a schedule, posts recommendations to a configurable webhook (Slack, GitHub Issues, governance forum).

CAPO design lineage is explicit: the simulator distinguishes between **market-price risk** (handled by parameter adjustments) and **oracle-induced risk** (handled by staleness thresholds, price anchor bands, circuit breakers). This split codifies the operational lesson from CAPO.

### Layer 3 — Risk Visualization Dashboard (React / Next.js) — optional, self-hostable tooling

Public dashboard for every registered protocol's risk state. Inspired by Aave's Risk Dashboard and Woof's own live [Compound Treasury / Reserve dashboard](https://compound.woof.software/treasury).

- Per-protocol risk snapshot — current parameters, utilization, reserves, recent governance actions.
- Historical timeline of parameter changes with attribution.
- Simulator output viewer — recommended changes alongside current values, with diff and justification.
- Interactive stress-test playground — "what if BTC drops 30%?".
- Per-party views (Canton-native) — when a protocol uses party-based visibility, the dashboard respects that scoping for authorized users.

Public good — hosted as a static site by Woof, source published so any party can self-host.

### Layer 4 — Reference Implementations (core public good)

Three production-shaped, open-source implementation examples demonstrating the parameter-governance patterns in use — two consuming the Registry on the EVM side, one Canton-native in DAML.

1. **ERC-4626 vault with risk-managed parameters** (Solidity) — CIP-56-compatible vault consulting the Registry for supply caps and oracle staleness checks. Suitable as a template for the 4+ vault proposals in the queue.
2. **Simple lending protocol with risk-managed parameters** (Solidity) — stripped-down Compound v3-shaped market using the Registry for collateral factors, liquidation thresholds, and IRM selection. Not intended to compete with Mystic or any other lending product — explicitly a reference for parameter integration.
3. **DAML risk-parameter governance example** — the same propose → timelock → execute pattern expressed as open-source DAML templates (a governed risk-parameter set plus a minimal consuming contract), runnable against a local Canton ledger. This gives Canton-native firms an OSS example to leverage when their own DAML contracts require governed parameters — with no dependency on the EVM side.

All three ship with CI test suites exercising governance update flows and emergency-pause paths; simulator-driven recommendation flows are exercised against the EVM pair once the optional tooling lands (final milestone).

### Canton deployment workflow (validated)

Our Canton build-and-deploy workflow is already exercised end-to-end in a public PoC: [woof-software/canton-localnet-poc](https://github.com/woof-software/canton-localnet-poc) builds a DAML package (SDK 3.4.11) and runs it on a live Canton ledger, with the run log and DAR committed as evidence. The risk primitives themselves are drawn from our production Compound work (see Team).

## 3. Architectural Alignment

- **CIP-0100 Dev Fund priorities.** Public good infrastructure, MIT-licensed, deployed permissionlessly.
- **DeFi readiness.** Multiple lending/vault proposals in the open queue need this before mainnet. These open primitives accelerate the entire EVM-side DeFi ecosystem.
- **2026 DevEx Survey alignment.** "Security & Auditing" ranks 24% Critical / 51% Important. Risk parameter management is the **market-level** risk-mitigation layer distinct from code-level audits.
- **Institutional fit.** 83% of Canton developers build TradFi/hybrid apps. Institutional CRO offices need transparent parameter governance and stress-test infrastructure.
- **Independent positioning.** Sits in a layer (parameter management) that does not duplicate or require coordination with any single DAML-side team. Friendly co-existence with SafeVault, Risk Ratings, Collateral Control Plane, Hacken — different layers, all useful.
- **Q2 ecosystem priority areas.** This proposal maps directly onto two of the priority areas in the [Development Fund Proposal Review Process](https://github.com/canton-foundation/canton-dev-fund/blob/main/Development%20Fund%20Proposal%20Review%20Process.md): **Security and Resilience** (which lists "security auditing and tooling" and "monitoring, compliance, and third-party audit capabilities") and **App Building and Developer Experience** ("reduced developer friction"). The Risk Engine provides market-level risk tooling and monitoring that every lending/vault protocol needs before mainnet. (Quoted phrases are verbatim from that document.)

## 4. Backward Compatibility

No backward compatibility impact on existing Canton or DAML systems. The Registry, Simulator, and Dashboard are new components deployed alongside existing protocols. Integration is opt-in — a protocol chooses to register and consult the Registry. Existing deployments are unaffected.

Reference integrations are new code; they do not modify any existing protocol.

---

# Milestones and Deliverables

## Milestone 1: On-Chain Risk Parameter Registry + Governance Patterns

- **Estimated Delivery:** Month 2
- **Focus:** Solidity Registry contracts, governance integration, security baseline.
- **Deliverables / Value Metrics:**
  - `RiskParameterRegistry.sol` and supporting contracts (governance adapter, timelock integration, emergency pause module).
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
  - DAML risk-parameter governance example (governed parameter-set templates + minimal consuming contract), executed against a local Canton ledger with run evidence committed.
  - Migration guide for existing protocols (Mystic, Cantopy, D2, others) to adopt the Registry.
  - CI test suites for all three examples covering governance update flows and emergency-pause paths.
  - **Target:** at least 1 integration commitment from a protocol team in the open queue, with public statement (adoption signal, reported not gated).

## Milestone 3: Optional Open Tooling (Simulator + Dashboard) + Community Handoff

- **Estimated Delivery:** Month 6
- **Focus:** The optional tooling layer on top of the primitives, plus adoption catalysis and handoff.
- **Deliverables / Value Metrics:**
  - TypeScript Risk Simulator engine: historical replay, Monte Carlo, stress tests, recommendation output.
  - Python interop adapter for quantitative-team workflows (Jupyter, pandas).
  - CI/cron mode with webhook outputs; simulator-driven recommendation flow exercised end-to-end against the M2 reference integrations.
  - React/Next.js Risk Dashboard published as static site (self-hostable, MIT).
  - Documentation site with simulator API reference and dashboard customization guide.
  - **Simulator demonstrably replays** at least 3 canonical historical shock price-paths (March 2020, May 2021, November 2022) against testnet protocol state, with deterministic outputs.
  - Public review iteration via [forum.canton.network](https://forum.canton.network) with feedback incorporated.
  - Walkthrough video: "Adding risk parameter management to your Canton DeFi protocol in 30 minutes."

---

# Acceptance Criteria

Milestones 1 and 2 are gated on deliverables, since the primitives must exist before anyone can adopt them. Milestone 3, the optional tooling layer, carries an explicit adoption gate: the ecosystem should not fund tooling on top of primitives nobody is using.

**Hard acceptance criteria (within our control):**
- **Operational readiness:** Both EVM reference integrations operate end-to-end (deposit, borrow, liquidation, parameter update, emergency-pause flow); the DAML governance example executes its full propose → timelock → execute cycle on a local Canton ledger.
- **Reproducibility:** Simulator outputs are deterministic — same inputs produce same outputs, validated by CI golden tests.
- **Documentation completeness:** Migration guide published; reviewed by ≥ 1 protocol team where available, otherwise validated against a Woof reference integration.
- **Security posture:** Solidity contracts pass Slither with zero high-severity findings.
- **Community engagement:** Forum review cycle on canton.network opened; public feedback either incorporated or formally addressed.

**Milestone 3 adoption gate (must be met for M3 acceptance):**
- **≥ 1 external Canton DeFi team** has deployed the Registry from Milestone 1 in a test environment and confirmed it publicly.

**Adoption targets (reported, not gated):**
- ≥ 1 production-track protocol publicly committing to integrate by end of M3, ≥ 2 evaluating.

**Environment note.** Where these criteria reference "Zenith testnet", an equivalent public EVM test environment may be substituted if public Zenith testnet access is not yet available at execution time. The on-chain Registry and reference integrations are standard EVM contracts and the off-chain Simulator/Dashboard are environment-agnostic, so all functional criteria remain verifiable independently of Zenith availability.

---

# Funding

**Total Funding Request:** $150,000 USD, denominated in Canton Coin at the prevailing USD/CC rate at each milestone's acceptance.

## Payment Breakdown by Milestone

- **Milestone 1** (Registry + governance patterns): $56,250 USD in CC upon committee acceptance.
- **Milestone 2** (Reference implementations — core public good): $52,500 USD in CC upon committee acceptance.
- **Milestone 3** (Optional tooling: simulator + dashboard + handoff): $41,250 USD in CC upon final release and acceptance.

## Volatility Stipulation

[CIP-0100](https://github.com/canton-foundation/cips/blob/main/cip-0100/cip-0100.md) requires proposals with milestones at or beyond six months to state explicitly how CC price volatility is handled. This proposal handles it by denominating the engineering budget in USD and converting to Canton Coin at the prevailing USD/CC rate on the date each milestone is accepted. Payment is made in CC; no CC amount is fixed in advance, so neither party carries an open-ended exposure to rate movement between approval and delivery.

The rationale is that the cost of the work is a USD cost, and Canton Coin has moved across a wide range in its short trading history. Fixing a CC quantity at submission would make the real value of delivery a function of the rate on an arbitrary date rather than of the work performed. Should the project timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones are renegotiated on the same basis.

---

# Co-Marketing

Upon release, Woof will collaborate with the Canton Foundation on:

- **Announcement coordination** — joint blog post at v1.0 launch.
- **Technical deep-dive** — engineering post on extracting Compound's risk patterns as Canton public goods, published on Canton Foundation channels.
- **Dashboard launch event** — public introduction of the Risk Visualization Dashboard as a Canton DeFi resource.
- **Migration workshops** — 1-2 live sessions with protocol teams during M3, supporting adoption.

---

# Distribution & Go-to-Market

How protocols discover, adopt, and depend on the Risk Engine:

- **Distribution channels.** On-chain Registry deployed at a single canonical address per chain (one integration target for everyone); off-chain Simulator published as an npm package with a Python interop adapter; the Risk Visualization Dashboard hosted publicly by Woof and published open-source for self-hosting; everything under a public GitHub repository.
- **The dashboard is its own marketing surface.** A public dashboard showing every registered protocol's risk state is continuously visible to institutions, LPs, and other builders — adoption by one protocol advertises the Registry to the next. This compounds discovery without paid distribution.
- **Onboarding funnel.** The reference implementations (ERC-4626 vault + simple lending market in Solidity, plus the DAML governance example for Canton-native teams) are copy-paste templates; the "add risk parameter management in 30 minutes" walkthrough and a migration guide for existing protocols are the conversion path. The < 1-hour integration claim is the metric.
- **Targeted adoption.** Direct outreach to the 6 lending/vault teams already in the open queue (Mystic, Cantopy, D2 Finance, Margarita, Meria, Institutional Yield Segmentation) as first integrators — their public integration commitments are tracked as a target adoption metric. Each new lending/vault protocol launching on Zenith is a candidate consumer.
- **Ecosystem alliances.** Registry-emitted events feed neighboring tools (Hacken monitoring, Staking Rewards ratings), so adjacent projects have an incentive to point their users at Registry-integrated protocols — distribution through partners, not just direct.

---

# Rationale

## Why this approach

**Extract and open-source patterns that already work, rather than invent new ones.** Compound's Configurator + CAPO + Reserve Growth design has been load-tested on $5B+ TVL across multiple chains. Generalizing these patterns as Canton public goods is faster, safer, and more defensible than inventing a new risk-management framework from first principles.

**Loosely-coupled layers let teams adopt incrementally.** A protocol can start with the on-chain Registry for governance hygiene and copy from the reference implementations — the core public good — then optionally add the Simulator for parameter recommendations and the Dashboard for public transparency. Each layer delivers independent value; integration cost is opt-in, and nothing downstream depends on the optional tooling.

## Alternatives considered

- **Build a commercial risk-consulting service (Gauntlet model).** Rejected — not a Dev Fund fit. Risk-as-a-service is a private good; open-source primitives are a public good.
- **Build only the on-chain Registry and reference implementations, drop the tooling entirely.** Considered seriously — the registry + reference implementations are the core public good, and the milestone order reflects that (tooling lands last). We keep the simulator and dashboard in scope as optional open tooling because a registry alone gives protocols no open way to inform parameter choices and no public transparency surface — but they are explicitly severable, and nothing in the core depends on them.
- **Defer to a future generalized DeFi framework.** Rejected — no such framework exists or is funded in the queue. The risk infrastructure gap is immediate and concrete.

## Fit with existing ecosystem tooling

This proposal sits at a layer that does not overlap with any single funded or proposed work:

- **SafeVault ([#266](https://github.com/canton-foundation/canton-dev-fund/pull/266))** — capital flow workflows (entry / allocation / redemption / recovery). Different layer (transaction-level workflows, not parameter management). Natural integration partner.
- **Independent DeFi Risk Ratings ([#131](https://github.com/canton-foundation/canton-dev-fund/pull/131))** — external AAA-D rating service from Staking Rewards. Different model (rating-as-a-service vs on-chain primitives). The Risk Engine produces the parameters their service could rate against.
- **Canton Collateral Control Plane ([#149](https://github.com/canton-foundation/canton-dev-fund/pull/149))** — collateral-specific subset. Potential integration point for the Registry.
- **Hacken open-source monitoring ([#302](https://github.com/canton-foundation/canton-dev-fund/pull/302))** — post-facto observability. Hacken can consume Registry events as a data source.
- **Daml Package Analyzer ([#130](https://github.com/canton-foundation/canton-dev-fund/pull/130))** — static code analysis. Different domain (code-level vs market-level).
- **Tenderly Simulation for Daml ([#481](https://github.com/canton-foundation/canton-dev-fund/pull/481))** — transaction-level dry-run simulation before submission. Different domain again: our simulator models parameter-level market risk (price-path replay, Monte Carlo), not individual transaction execution.

## Unique provenance

CAPO + Configurator + Reserve Growth is Woof-specific code and operational experience contributed to Compound Finance. We are positioned to extract these patterns as Canton public goods because we built them. No other team in the open Dev Fund queue has the same direct lineage to these specific risk primitives.

## Pre-submission coordination

Low coordination overhead — this is one of the proposal's strengths. No required outreach to any single counterparty.

Light-touch coordination recommended (not blocking):
- Brief forum post mentions to SafeVault (#266), Staking Rewards (#131), Collateral Control Plane (#149), and Hacken (#302) confirming layer boundary alignment.
- Outreach to Mystic, Cantopy, D2 Finance, Margarita, Meria as potential first integrators — public integration intent strengthens M1 / M3 deliverables.
- SIG Champion volunteer search via `DeFi Protocols & Liquidity` SIG (7 members).

---

# Sustainability

Who operates and maintains the Risk Engine after the grant period:

- **Primary steward: Woof.** Woof commits to maintaining the primitives and reference implementations as part of its ongoing open-source footprint — minimum 6 months of bug fixes, Canton SDK compatibility, and Zenith version updates post-delivery, with security disclosures addressed within 48 hours, plus quarterly review of community feature requests.
- **On-chain layer is self-sustaining.** The Risk Parameter Registry is a permissionless contract with one canonical instance per chain; once deployed it requires no operator to keep functioning. Integrating protocols read from it directly.
- **Dashboard hosting.** Woof hosts the public Risk Visualization Dashboard during and after the grant; because the source is published (MIT) and reads only on-chain Registry events, any party — or the relevant SIG — can self-host an independent instance, so the public good does not depend on Woof's infrastructure surviving.
- **Community handoff path.** All code is MIT/Apache-2.0 with a public issue tracker. Stewardship can transition to or be shared with the DeFi Protocols & Liquidity SIG as it matures, avoiding indefinite single-vendor dependency.

---

# Open Source

- Solidity contracts: MIT.
- TypeScript / Python simulator: MIT.
- React dashboard: MIT.
- Reference integrations: Apache-2.0.
- Documentation: CC-BY-4.0.
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

**Woof public artifacts (each component verifiable):**
- [`compound-capo`](https://github.com/woof-software), [`comet`](https://github.com/woof-software), [Compound Treasury / Reserve dashboard](https://compound.woof.software/treasury), [`compound-multiplier`](https://github.com/woof-software), [`migrator-v2`](https://github.com/woof-software), [`comet-wrapper`](https://github.com/woof-software)

**External lineage references:**
- [Compound v3 Configurator](https://github.com/compound-finance/comet/blob/main/contracts/Configurator.sol)
- [WOOF! Development Updates on Compound Community Forum](https://www.comp.xyz/t/woof-development-updates/5336)
- [Aave](https://aave.com/) — public risk-dashboard precedent, design reference for visualization
