# Canton Risk Engine: Open-Source Risk-Parameter Primitives and Reference Implementations for Zenith DeFi

| Field | Value |
| :---- | :---- |
| **Organization** | Woof |
| **Author / Primary Contact** | Mykola Ilchuk, Woof ([@Noosphere-314](https://github.com/Noosphere-314)) |
| **Status** | Submitted |
| **Created** | 2026-08-17 |
| **Proposal Type** | RFP-aligned |
| **RFP / Roadmap Area** | RFP 13, Payments and DeFi (Financial Markets, Standards & Verification) |
| **Champion** | `Needs Champion` |
| **Total Funding Request** | 1,560,870 CC (≈ $150,000 at $0.0961/CC, CoinGecko, 27 October 2026) |
| **Project Duration** | 6 months |
| **Label** | `defi-liquidity` |

---

# Abstract

This proposal funds the Canton Risk Engine: open-source risk-parameter primitives and reference implementations for DeFi protocols on Canton and Zenith. It generalizes three risk-management patterns proven in production on Compound Finance:

- the **Configurator pattern** for on-chain parameter governance (Compound Labs' design, which Woof operates across the markets it deploys);
- the **CAPO oracle approach** for price-induced risk (Correlated-Assets Price Oracle, which Woof implemented for Compound);
- the **Reserve Growth tracking model** for operational risk visibility (Woof's own work).

The deliverables are open-source building blocks (MIT and Apache-2.0), not a product or a paid service: an on-chain risk-parameter registry in Solidity and reference implementations in Solidity and Daml that protocols integrate into their own contracts, plus an optional open simulator and a self-hostable dashboard. Nothing depends on a service run by Woof.

**Total funding:** 1,560,870 CC, fixed, across 3 milestones (≈ $150,000 at the reference rate in the Volatility Stipulation).
**Duration:** 6 months across 3 milestones.

---

# Motivation

Canton DeFi is approaching its first production lending markets and yield vaults, and each of them has to govern its risk parameters before mainnet. Every lending market and vault answers the same questions:

1. What collateral factor should each asset have, and how does it change as the market grows?
2. What supply and borrow caps prevent single-asset concentration?
3. What liquidation threshold balances borrower comfort against insolvency risk?
4. What interest-rate curve keeps utilization in safe bounds?
5. How are these parameters updated through governance without breaking active positions?
6. What price-feed integrity is required, and how is it monitored?
7. What reserves does the protocol hold, and how do they grow?

On Ethereum these problems were solved over four years: Compound's Configurator, Aave's Risk Stewards, and commercial risk consultants such as Gauntlet, Steakhouse and Block Analitica. On Canton, OpenZeppelin's funded stack implements a baseline parameter surface and its change path and leaves calibration to the operator (see Fit with existing ecosystem tooling). We have not found an open, shared layer for governed parameter updates, simulation or public parameter history, so each team would build its own.

Teams building in this space have said the same. Mystic's author ([#99](https://github.com/canton-foundation/canton-dev-fund/pull/99), since closed, with the vault standard now in [#863](https://github.com/canton-foundation/canton-dev-fund/pull/863)) wrote that the vault standard leaves valuation, strategy, fees, access and roles to the implementer, and that their own implementation will put risk-increasing changes behind a timelock ([comment of 17 September 2026](https://github.com/canton-foundation/canton-dev-fund/pull/99#issuecomment-5717314654)). Moonsong Labs, who are building a Canton vault management product for institutions, replied to our forum notes that "the parameter layer you describe is the one we have to operate" ([forum](https://forum.canton.network/t/9098/2)); the risk-observer role in the Daml deliverable is our response to a point they raised there. Tokenisys responded to our pre-submission write-up that they "would be interested in integrating products on this type of infrastructure", naming their token risk-rating model and a Daml option-pricing / VaR-CVaR distribution ([forum post](https://forum.canton.network/t/woof-two-dev-fund-proposals-evm-side-compliance-risk-infrastructure-for-canton-seeking-feedback-champion/8796/2)).

This proposal builds that shared layer before Canton's first lending markets and vaults reach mainnet.

---

# Specification

## 1. Objective

Ship open-source risk-parameter building blocks that any Zenith DeFi protocol can use inside its own contracts. The core deliverables are:

- (a) on-chain risk-parameter primitives: a registry with standardized parameters, a governance timelock and an emergency pause;
- (b) reference implementations in Solidity and Daml showing how a protocol wires them in.

Optional open tooling on top: (c) an off-chain simulator that produces parameter-change recommendations from historical prices and stress tests, and (d) a self-hostable dashboard of risk state for integrated protocols.

Out of scope: code-level security auditing and monitoring ([Hacken #302](https://github.com/canton-foundation/canton-dev-fund/pull/302), [Daml Package Analyzer #130](https://github.com/canton-foundation/canton-dev-fund/pull/130)), external rating services and capital-flow workflows.

## 2. Who runs what

| Component | Deployed or run by | Keys and authority | Woof's role |
| :---- | :---- | :---- | :---- |
| Solidity Registry (each version) | Anyone. Woof deploys a public reference instance on Zenith testnet; a protocol may use it or deploy the same code | No owner, admin role or upgrade key | Deployer of the reference instance only; no role in it afterwards |
| A protocol's namespace in the Registry | Created by the protocol's own governance address (a Governor, timelock or Safe) | That address, plus the setter and guardian roles it appoints, for that namespace only | None |
| Solidity reference vault and lending market | Woof, on Zenith testnet, as examples | Their test governance, held by Woof for the demonstration | Example operator; integrators deploy their own |
| Daml governance example | The integrating venue, on its own participant node | The venue's governing party is signatory of the parameter set and of every executed change; risk-observer parties, named at setup and hosted on their own participants, read without authority | None in production. For acceptance, Woof runs all parties on a local Canton ledger |
| Simulator | Anyone, from the npm package or source | No keys; reads public data and Registry events | Publishes the code |
| Dashboard | Anyone, self-hosted. Woof runs one free public reference instance | No keys; reads public on-chain data and simulator output | Runs the reference instance during the grant and maintenance period |

## 3. Implementation Mechanics

Two core deliverables, the on-chain primitives and the reference implementations, plus two pieces of optional open tooling.

### Layer 1: On-Chain Risk Parameter Registry (Solidity, deployed on Zenith)

A permissionless registry that stores standardized risk-parameter sets per protocol namespace, with governance hooks for safe updates. The parameter set below is an illustrative reference design; exact fields and interface are finalized during M1 with the first integrating protocols.

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

Operations: read the current parameter set for a protocol and asset; propose an update; execute it after the timelock, or after approval alone for a change classified as risk-reducing; emergency-pause an asset to halt new positions.

Design choices:

- **Configurator pattern.** Updates go through propose, timelock, execute, after Comet's Configurator. Execution re-checks the proposal against the namespace's current bounds, value and revision, so a proposal made against an earlier state cannot apply, even if a value has since returned to what it was. Each supported parameter defines which direction of change is risk-reducing; only such changes can skip the delay, and a parameter without that definition always waits the full timelock. A change to the timelock itself waits for the current timelock.
- **Namespaces bound to the protocol's own governance.** A namespace is keyed to the address that creates it. Only that address and the setter and guardian roles it appoints can write to it, so it cannot be squatted and two protocols never collide; a readable label is metadata, not authority. Moving a namespace to a new governance address takes two steps: the current governance proposes and the new address accepts. After that the old address has no rights, the new governance confirms or replaces the appointed roles, and proposals made under the old governance can no longer execute. A pending handover can be cancelled or replaced.
- **Governance-agnostic.** Any EVM-addressable signer can be the setter: Compound Governor, a Safe, or another contract. A Canton party is not an EVM address; using a Canton-side committee as setter needs an EVM-compatible adapter (a signer or relayer holding the setter role), which is out of scope for the base Registry and scoped separately if a design partner needs it.
- **Per-namespace emergency pause.** The guardian a namespace's governance appoints can pause an asset at once; integrating contracts then stop new positions while existing ones wind down. Lifting a pause is a decision of the namespace's governance and does not wait for the timelock; it cannot carry new limits or bypass their delays, and a pause does not stop pending changes from maturing.
- **Structured events.** Dashboards and simulators can reconstruct full Registry state from emitted logs.
- **No global admin, versioned deployments.** Each version is deployed without an owner or upgrade key. No one outside a protocol's own governance, Woof included, can change its parameters or pause its assets, and no one can replace the code under a deployed version. Improvements ship as a new version at a new address, and each protocol moves when its own governance decides to. Adding any registry-wide role would change this proposal and its Milestone 1 criteria and would go to the committee first.

### Layer 2: Off-Chain Risk Simulator (TypeScript and Python), optional

An open-source baseline for the parameter-recommendation loop that protocols otherwise buy as a commercial service. It consumes Registry state and oracle history and outputs recommended adjustments.

- Historical price replay from the history of an available oracle (initially Chainlink on Canton).
- Monte Carlo price paths from observed volatility, with projected insolvency risk per parameter set.
- Stress tests with scripted shocks (for example -40% in 24h, oracle delay, liquidator failure), reporting which positions become unhealthy.
- Recommendations as JSON-Schema-typed change proposals with justifications.
- CI/cron mode posting recommendations to a configurable webhook (Slack, GitHub Issues, a governance forum).

Following CAPO, the simulator separates market-price risk, handled by parameter adjustments, from oracle-induced risk, handled by staleness thresholds, price anchor bands and circuit breakers.

### Layer 3: Risk Visualization Dashboard (React / Next.js), optional and self-hostable

An open-source dashboard over public on-chain data and the simulator's output, with no private data, modeled on Aave's Risk Dashboard and Woof's live [Compound Treasury / Reserve dashboard](https://compound.woof.software/treasury).

- Per-protocol snapshot: current parameters, pause state and recent governance actions, from Registry events.
- Timeline of parameter changes with attribution.
- Utilization and reserves for protocols with a supported adapter: at launch, the two EVM reference integrations. Other protocols add an adapter.
- Simulator output next to current values, with diff and justification.
- Stress-test playground ("what if BTC drops 30%?").

Views of private Canton state are not part of this grant: they need an access model (which party reads what, with which Ledger API credentials) that this proposal does not define.

### Layer 4: Reference Implementations (core public good)

Three open-source examples of the governance patterns in use, two on the EVM side and one Canton-native.

1. **ERC-4626 vault with risk-managed parameters** (Solidity), over an EVM-native ERC-20 underlying, reading supply caps and oracle staleness from the Registry. ERC-4626 requires an ERC-20 underlying; a CIP-56 representation on Zenith EVM is a separate dependency agreed with the token issuer, not assumed here.
2. **Simple lending protocol with risk-managed parameters** (Solidity): a stripped-down market shaped like Compound v3, using the Registry for collateral factors, liquidation thresholds and interest-rate model selection. It is a reference for parameter integration, not a competitor to Mystic or any lending product.
3. **Daml risk-parameter governance example**: the same discipline as open-source Daml templates (a governed parameter set and a minimal consuming contract), runnable on a local Canton ledger, with its own lifecycle:
   - The checks run in the transaction that executes an approved governance action, which records the new value with its effective time. The value is read as effective from that time, without a separate activation transaction.
   - Changes to the delay bounds take effect when the committee's action executes, so for that change users rely on the governing committee rather than on a notice period.
   - A **risk-observer role**: parties named at setup are observers of the parameter set and of its proposal and execution records, so risk and monitoring teams can read values and history through the Ledger API without authority. The governing party adds or revokes them. The set is deliberately small: on Canton a wide observer list grows the contract and its stakeholder set with every reader, so public views belong in an off-ledger reader over emitted events.
   - Where a Daml-side stack such as the OpenZeppelin reference implementations needs a governed parameter source, these templates are the composition point. The Solidity Registry serves protocols that execute on Zenith EVM; no synchronous read from Daml into EVM state is assumed.

All three ship with CI test suites for governance updates and emergency pause; simulator-driven flows are exercised against the EVM pair once the optional tooling lands.

**Relationship to #621.** Woof's Compliance Middleware SDK proposal ([#621](https://github.com/canton-foundation/canton-dev-fund/pull/621)) also uses a reference lending market and an ERC-4626 vault. If both are funded, that base and its test infrastructure (Zenith testnet deployment scripts, CI, test tokens) are built once and each proposal pays only for its own layer: this one for Registry integration and parameter governance, #621 for compliance gating. The effort saved goes to additional reference patterns and test coverage. If only one is funded, it builds the minimal base it needs within its own budget. Neither proposal's acceptance depends on the other.

### Canton deployment workflow

Our Canton build-and-deploy workflow is exercised end to end in a public PoC: [woof-software/canton-localnet-poc](https://github.com/woof-software/canton-localnet-poc) builds a Daml package (SDK 3.4.11) and runs it on a live Canton ledger, with the run log and DAR committed.

## 4. Backward Compatibility

None. The Registry, simulator and dashboard are new components; integration is opt-in, and the reference integrations are new code that does not modify any existing protocol.

---

## Dev Fund 2.0 Alignment

**RFP mapping.** RFP 13, Payments and DeFi. The Foundation's [2026-2028 Strategic Roadmap](https://github.com/canton-foundation/canton-dev-fund/blob/main/2026-2028-strategic-roadmap.md) asks there for "open-source tooling, reference implementations, and standards" and for proposals that "focus on reusable components or standards that can support multiple Canton applications rather than one-off application-specific work". The RWA Standards RFP (item 12.2) lists "Repo, collateral, lending, and servicing workflows"; the Registry is the parameter-governance layer such workflows consult. Under the [Review Process](https://github.com/canton-foundation/canton-dev-fund/blob/main/Development%20Fund%20Proposal%20Review%20Process.md) priority areas, it falls under Security and Resilience ("monitoring, compliance, and third-party audit capabilities") and App Building and Developer Experience ("reduced developer friction"). Security monitoring stays with dedicated work such as Hacken's approved stack ([#302](https://github.com/canton-foundation/canton-dev-fund/pull/302)).

**Beneficiaries.** Lending and vault protocols on Canton and Zenith, which otherwise each rebuild this layer as a separate audit surface; the risk and monitoring parties who observe their parameters; and auditors, who today have no common record of what changed and when.

**What Woof gets, and what the grant pays for.** Woof works with these patterns day to day: we deploy and run lending markets on EVM chains, operate the Configurator, wrote a CAPO implementation and built the reserve-growth stack (see Provenance). Our interest is to be ready if EVM lending markets, including those of the protocol we work on, come to Canton. None of the deliverables depends on a particular protocol. Woof gets experience building on Canton, a public track record and possibly separate integration work for teams that want help, contracted and paid outside this grant. The grant pays for the open deliverables in the milestones, all usable without a contract with Woof.

**Adoption path.** Milestones 1 and 2 are gated on deliverables. Milestone 3, 468,260 CC and 30% of the total budget, is gated on at least one external Canton DeFi team integrating the Registry in a test environment and confirming it publicly (see Acceptance Criteria). Interest so far is listed in Motivation, and the composition points with OpenZeppelin and RedStone under Fit with existing ecosystem tooling.

---

# Milestones and Deliverables

Every milestone is delivered as a tagged release of the public repository and an update to one documentation site (see How the committee verifies each milestone).

## Milestone 1: On-Chain Risk Parameter Registry and Governance Patterns

- **Estimated Delivery:** Month 2
- **Focus:** Solidity Registry contracts, governance integration, security baseline.
- **Deliverables / Value Metrics:**
  - `RiskParameterRegistry.sol` and supporting contracts (governance adapter, timelock integration, emergency pause module).
  - Tests for the namespace and admin model: a namespace is keyed to the address that creates it; no caller other than that governance address and the roles it appoints can change the namespace's parameters or pause its assets (fuzzed over arbitrary callers); a namespace handover takes both steps. The Registry contracts have no registry-wide owner, admin role or upgrade proxy, as their verified source on Zenith testnet shows; each namespace's governance keeps authority over that namespace only.
  - Tests for the update lifecycle: a loosening waits the full timelock while a change classified as risk-reducing applies after approval; a cap of zero and a cap below existing exposure behave as specified; changing the timelock does not bypass the current window; a change in state, bounds or governance between proposal and execution stops the proposal, and a proposal cannot execute twice or revive after a value returns to an earlier level; a handover with pending proposals and appointed roles leaves no stale authority; appointed roles cannot act beyond their permissions, for example the guardian cannot lift a pause; a pause lets pending changes mature and lifting it does not carry new limits.
  - Standardized event schema for off-chain consumers.
  - Unit and invariant test suite (Hardhat and Foundry).
  - Slither static analysis report with zero high-severity findings.
  - Integration guide for protocol authors.
  - Deployed and verified on Zenith testnet.
  - **Target:** at least 2 protocol teams from the open queue publicly indicate intent to evaluate integration (reported, not gated).

## Milestone 2: Reference Implementations (Core Public Good)

- **Estimated Delivery:** Month 4
- **Focus:** The open implementation examples firms build on, in Solidity and Daml.
- **Deliverables / Value Metrics:**
  - ERC-4626 reference vault integrated with the Registry, deployed on Zenith testnet.
  - Reference lending protocol integrated with the Registry, deployed on Zenith testnet.
  - Daml risk-parameter governance example (governed parameter-set templates, a minimal consuming contract and a designated risk-observer role with read access to the parameter set and its history), executed against a local Canton ledger with run evidence committed.
  - Migration guide for lending and vault protocols adopting the Registry.
  - CI test suites for all three examples covering governance updates and emergency pause, including repay and add-collateral staying available during a pause in the lending reference.
  - **Target:** at least 1 integration commitment from a protocol team in the open queue, with a public statement (reported, not gated).

## Milestone 3: Optional Open Tooling (Simulator and Dashboard) and Community Handoff

- **Estimated Delivery:** Month 6
- **Focus:** The optional tooling on top of the primitives, plus adoption and handoff.
- **Deliverables / Value Metrics:**
  - TypeScript Risk Simulator: historical replay, Monte Carlo, stress tests, recommendation output.
  - Python interop adapter for quantitative workflows (Jupyter, pandas).
  - CI/cron mode with webhook outputs; the recommendation flow exercised end to end against the M2 reference integrations.
  - React/Next.js Risk Dashboard (MIT, self-hostable) over public on-chain data, with a free public reference instance run by Woof.
  - Simulator API reference and dashboard customization guide on the documentation site.
  - The simulator replays at least 3 historical shock price paths (March 2020, May 2021, November 2022) against testnet protocol state, with deterministic outputs.
  - Public review on [forum.canton.network](https://forum.canton.network) with feedback incorporated.
  - Walkthrough video: "Adding risk parameter management to your Canton DeFi protocol in 30 minutes."

---

# Acceptance Criteria

Milestones 1 and 2 are gated on deliverables. Milestone 3, the optional tooling and 30% of the total budget, carries an explicit adoption gate: the ecosystem should not fund tooling on top of primitives nobody is using.

**Hard acceptance criteria (within our control):**
- **Operational readiness:** both EVM reference integrations operate end to end against the Registry: the vault for deposit, withdraw, parameter update and emergency pause; the lending market for supply, borrow, liquidation, parameter update and emergency pause. The Daml governance example runs its full cycle on a local Canton ledger: an approved change is recorded with its effective time and read as effective once that time is reached, and the designated risk-observer party reads the resulting parameter set and execution record through the Ledger API without being a signatory.
- **Reproducibility:** simulator outputs are deterministic, validated by CI golden tests.
- **Documentation completeness:** migration guide published; reviewed by at least one protocol team where available, otherwise validated against a Woof reference integration.
- **Security posture:** Solidity contracts pass Slither with zero high-severity findings.
- **Community engagement:** forum review cycle on canton.network opened; public feedback incorporated or formally addressed.

**Milestone 3 adoption gate (required for M3 acceptance; gates 468,260 CC, 30% of the total):**
- At least one external Canton DeFi team has integrated the Registry from Milestone 1 in a test environment, through its own deployment or a namespace on the reference deployment, and confirmed it publicly.

**Adoption targets (reported, not gated):**
- At least one production-track protocol publicly committing to integrate by the end of M3, and at least two evaluating.

## How the committee verifies each milestone

A reviewer can check each result without a Woof account, whitelisting or a validator.

| Milestone / payment | Result and environment | Evidence |
| :---- | :---- | :---- |
| M1, 585,330 CC | Solidity Registry, governance and security baseline; public Zenith testnet (or the agreed substitute) | Lifecycle, namespace and invariant tests, verified contracts, Slither report |
| M2, 507,280 CC | EVM vault and lending references; Daml governance example on a local Canton ledger | Runnable integrations and test reports, including pause behaviour and the risk-observer read |
| M3, 468,260 CC | Simulator, dashboard and handoff, plus one external team's integration of the M1 Registry in a test environment | Deterministic golden outputs, runnable tooling, the team's public confirmation and transactions |

- **Documentation site, one page per milestone:** every deliverable, the commands and prerequisites to reproduce it, pinned toolchain versions (Daml SDK, Solidity compiler, Hardhat, Foundry), and test counts as passed, failed and skipped. A skipped required test is not a pass.
- **Release manifest:** commit and tag, Daml package ids and DAR checksum, chain id and contract addresses with verified source, configuration and CI run. M3 may use the unchanged M1 Registry release; changed code is tested again.
- **On-chain checks:** the verified source shows the Registry has no registry-wide owner, admin or upgrade key. Governance and pause cases link to their transactions and to reproducible test assertions; a failed receipt alone does not show why a call was rejected.
- **Daml example:** one documented command, after the listed prerequisites, builds it and runs it on a local Canton ledger with test parties, using only publicly available dependencies. Its package ids and DAR checksum match the manifest. This shows the example, not an external venue's integration.
- **Simulator evidence:** golden outputs with the simulator version, input data, seed and configuration.
- **Screen recordings** of propose, timelock and execute, an emergency pause and, in M3, the dashboard and simulator. They support the tests, not replace them.
- **Completion report:** each criterion marked met, partly met or not met, with its evidence and environment, and every deviation listed for the committee to decide.
- **M3 adoption evidence:** the external team's public confirmation, the Registry version it uses, its deployment or namespace, and transactions where its own application calls the Registry. A deployment or a parameter change alone does not count, and neither does interest in the Daml example or Woof's reference applications.

**Environment note.** If public Zenith testnet is unavailable, we agree the substitute public EVM environment with the committee in advance. The Registry and the EVM references are standard EVM contracts; the Daml example stays on its local ledger. Neither shows MainNet use.

---

# Funding

**Total Funding Request:** 1,560,870 CC

## Payment Breakdown by Milestone

- **Milestone 1** (Registry and governance patterns): 585,330 CC upon committee acceptance.
- **Milestone 2** (Reference implementations, core public good): 507,280 CC upon committee acceptance.
- **Milestone 3** (Optional tooling: simulator, dashboard and handoff): 468,260 CC upon final release and acceptance, which requires the Milestone 3 adoption gate (see Acceptance Criteria).

Milestone 3 is 30% of the total budget, raised from 27.5% in the September 2026 revision in line with the Dev Fund 2.0 focus on adoption. The difference moved from Milestone 2; the total is unchanged.

## Volatility Stipulation

The grant is denominated in fixed Canton Coin. CC amounts convert the USD cost estimate of $150,000 at the CC/USD price of $0.0961 on 27 October 2026 (CoinGecko). The project duration is 6 months. Should the project timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility.

---

# Co-Marketing

On release, Woof will work with the Canton Foundation on a joint announcement at v1.0, an engineering post on bringing Compound's risk patterns to Canton as public goods, a public session on reading a protocol's parameter history from the Registry, and one or two migration workshops with protocol teams during M3.

---

# Distribution & Go-to-Market

- **Channels.** A public reference deployment of each Registry version on Zenith testnet, which a protocol can use or redeploy; the simulator as an npm package with a Python adapter; the dashboard as open source with a free reference instance; everything in one public GitHub repository.
- **Onboarding.** The reference implementations are copy-paste templates; the 30-minute walkthrough and the migration guide are the integration path. The metric is time to a first working integration, with a target under one hour.
- **Targeted adoption.** Direct outreach to lending and vault teams in the queue and to teams building vault products on Canton. Each new lending or vault protocol launching on Zenith is a candidate consumer.
- **Neighboring tools.** Registry events are public and documented, so monitoring and rating tools such as Hacken's ([#302](https://github.com/canton-foundation/canton-dev-fund/pull/302)) and rating services can read them.

---

# Rationale

## Why this approach

**Open-source patterns that already work rather than invent new ones.** The Configurator, CAPO and reserve-growth designs run in production on Compound across multiple chains and have been through the market conditions that break parameter systems.

**Loosely coupled layers.** A protocol can start with the Registry and the reference implementations, then add the simulator and the dashboard if it wants them. Each layer works on its own, and nothing in the core depends on the optional tooling.

## Alternatives considered

- **A commercial risk-consulting service (the Gauntlet model).** Rejected: risk-as-a-service is a private good, not a Dev Fund fit.
- **Registry and reference implementations only, no tooling.** Considered seriously, and the milestone order reflects it: tooling lands last. We keep the simulator and dashboard as optional, severable tooling because a registry alone gives protocols no open way to inform parameter choices and no public view of changes.
- **Defer to a future generalized DeFi framework.** Rejected: no funded work covers governed parameter updates for Solidity protocols on Zenith.

## Fit with existing ecosystem tooling

- **OpenZeppelin Canton Stack ([#262](https://github.com/canton-foundation/canton-dev-fund/pull/262)).** Funded Daml reference implementations (DEX, vaults, lending) that ship the baseline parameter surface and its change path. In the current lending design ([`lending.md` at 964142f](https://github.com/OpenZeppelin/canton-specs/blob/964142fae79ec8e5a5bc04ba6811ed1001437954/docs/reference-architectures/lending.md)), each market's `PositionFactory` carries the configuration the venue's validation consortium sets (the oracle, `maxStaleness`, the venue fee share, minimum amounts, trusted issuers and attesters) and the terms new positions take (`PositionParams`: interest rate, the two collateral ratios and the liquidation bonus), which stay fixed for the life of each position. Positions read the configuration live by key, so a change the consortium executes reaches open positions at once; revised terms apply to new positions. Beyond the token standard and pause interfaces, the design defines no Daml interfaces or hook contracts of its own. On 3 September 2026 OpenZeppelin confirmed the boundary publicly: "We do not own calibration. [...] So your proposal does not overlap with ours. It fills the layer we leave to operators." They named two composition seams ([forum reply](https://forum.canton.network/t/9059/6)): parameter governance, where they called our registry design "a natural author for VaultParams updates" (in the current design, the market configuration and the terms for new positions; both are Daml contract fields, so this seam runs through the Daml governance example, not the Solidity Registry), and the oracle interface, which their reference implementations specify but do not implement. Both are points to align on as their implementation starts, not finished integrations.
- **Mystic: curated lending ([#99](https://github.com/canton-foundation/canton-dev-fund/pull/99), closed 30 September 2026) and the vault standard ([#863](https://github.com/canton-foundation/canton-dev-fund/pull/863)).** The vault standard covers share accounting, the deposit and redemption lifecycle and the events an integrator needs; valuation, strategy, fees, access and roles stay with the implementer. The Registry is one way to govern the risk-parameter part of that surface across protocols. Mystic's own vaults will follow Morpho's curated design with risk-increasing changes behind a timelock; the Registry offers the same discipline as open code to protocols that do not build it themselves.
- **RedStone CAPS ([#497](https://github.com/canton-foundation/canton-dev-fund/pull/497), approved 18 September 2026) and the Kaiko Oracle Data Standard ([#113](https://github.com/canton-foundation/canton-dev-fund/pull/113)).** The price layer: the Registry governs the limits a protocol applies on top of prices and does not produce price data. RedStone welcomed the composition on 2 September 2026 ([reply](https://github.com/canton-foundation/canton-dev-fund/pull/497#issuecomment-5507825170)) and on 8 September confirmed that their derived capsules will implement the Data Standard's `PublishedQuote` and `DataPoint` interfaces. The Daml governance example consumes those interfaces as its price source and applies its own staleness limit to `publishedAt` and the quote timestamp; issuer validity and revocation, where needed, come from the attestation itself. On the EVM side the Registry stores an oracle address and feed identifier; the EVM-facing interface, trust model, freshness and decimals remain to be reviewed with RedStone during M1. In their [21 October update](https://github.com/canton-foundation/canton-dev-fund/pull/497#issuecomment-6317590826), RedStone expected to share a first draft the following week for review. This is a publication expectation, not an available or accepted interface; a CAPS integration is not assumed for acceptance.
- **DIA Multi-Oracle Aggregator ([#873](https://github.com/canton-foundation/canton-dev-fund/pull/873)).** Its Daml design includes governed provider and threshold changes, configurable delay and cancellation. Those are adjacent governance primitives, so delay alone is not a distinctive claim for this Registry. This proposal's Solidity namespaces, bounds and revision rechecks address EVM protocol parameters; any shared Daml component would require a separate agreed interface. DIA is not a confirmed consumer.
- **Hacken open-source monitoring ([#302](https://github.com/canton-foundation/canton-dev-fund/pull/302), approved 26 August 2026).** Post-facto observability; Hacken can consume Registry events as a data source.
- **Daml Package Analyzer ([#130](https://github.com/canton-foundation/canton-dev-fund/pull/130))** and **Tenderly Simulation for Daml ([#481](https://github.com/canton-foundation/canton-dev-fund/pull/481)).** Code-level analysis and transaction dry-runs; our simulator models parameter-level market risk instead.

**Neighboring Daml lending and vault designs.** OpenZeppelin's lending design is described above. Mystic's vault standard ([#863](https://github.com/canton-foundation/canton-dev-fund/pull/863)) defines four vault interfaces whose max and preview methods report a vault's limits and fees; none of its nineteen choices and methods sets or changes them. HyprEarn's vault extension ([#796](https://github.com/canton-foundation/canton-dev-fund/pull/796)) defines strategy registration with caps and a minimum liquid reserve, mandates, and a valuation policy with freshness limits and pause. On the Daml side this proposal defines no venue, vault interface or vault policy. Its Daml governance example covers how a governed value changes: a proposal, a delay, an effective time and a named risk-observer role with read access. A venue that wants a delay before a configuration change reaches open positions could apply that lifecycle where the change is authorized; what open positions do at the new value stays with the venue.

## Provenance

The three patterns reach this proposal by different routes.

The reserve-growth tracking stack is our own work end to end, running today against live Compound markets ([backend](https://github.com/woof-software/compound-reserve-growth-backend), [frontend](https://github.com/woof-software/compound-reserve-growth-frontend), [data sources](https://github.com/woof-software/compound-reserve-sources)).

CAPO came out of the Aave ecosystem, where BGD Labs first shipped it ([bgd-labs/aave-capo](https://github.com/bgd-labs/aave-capo)), and is now standard practice for correlated collateral. We brought it to Compound and wrote that implementation: the oracle and its adapters for wstETH, rETH, rsETH, ERC-4626 vaults and rate-based sources ([woof-software/compound-capo](https://github.com/woof-software/compound-capo)), with the design discussion on the [Compound forum](https://www.comp.xyz/t/woof-correlated-assets-price-oracle-capo/6245).

The Configurator is Compound Labs' design, and we work with it as operators. Running Compound markets means driving that update path routinely, which is where our read on its failure modes comes from, and why the reference implementations treat the update path, not the values, as the hard part.

## Pre-submission coordination

No single counterparty is a dependency. Composition with specific stacks (the OpenZeppelin reference implementations, BitSafe's Decentralization Manager) comes as adapters and examples on top of the standalone deliverables. Outreach to potential first integrators and layer-boundary notes to neighboring proposals are non-blocking.

---

# Sustainability

- **Primary steward: Woof.** At least 6 months of bug fixes, Canton SDK compatibility and Zenith version updates after delivery, security disclosures acknowledged within 48 hours, and a quarterly review of community feature requests. Registry versions have no upgrade key, so a security fix ships as an advisory and a new version, and each protocol's governance decides when to move.
- **The on-chain layer needs no operator.** Each Registry version runs without an owner, and each protocol controls its own namespace.
- **Dashboard hosting.** Woof runs the free reference instance during the grant and the six-month maintenance period. Anyone, including the relevant SIG, can run an independent instance.
- **Community handoff.** All code is MIT or Apache-2.0 with a public issue tracker; stewardship can move to or be shared with the DeFi Protocols & Liquidity SIG.

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

**Woof** ([woof.software](https://woof.software)): senior EVM engineers for DeFi and an active Compound DAO contractor team, delivering the deployments behind Compound's market expansion to Optimism, Mantle and other networks. Each market addition involves the full risk-parameter exercise this proposal generalizes.

| Risk Engine component | Woof precedent (public artifact) |
|---|---|
| On-chain parameter registry / Configurator pattern | [`comet`](https://github.com/woof-software): Compound v3 core (Configurator and Comptroller internals) |
| Price-induced risk handling / CAPO oracle | [`compound-capo`](https://github.com/woof-software/compound-capo): CAPO implementation by Woof for Compound |
| Reserve growth tracking / operational risk visibility | [Compound Treasury / Reserve dashboard](https://compound.woof.software/treasury): live Woof-built analytics for Compound DAO; precedent for the dashboard (Layer 3) |
| Risk-adjusted leverage UI patterns | [`compound-multiplier`](https://github.com/woof-software) |
| Migration of risk-managed positions | [`migrator-v2`](https://github.com/woof-software): Aave / Morpho / Spark to Compound v3 |
| ERC-4626 vault precedent | [`comet-wrapper`](https://github.com/woof-software) |

This proposal is on-chain risk parameter management. We are not proposing to be a security audit firm, static code analyzer or rating service; those domains belong to Hacken, Certora and Staking Rewards.

---

# References

**Adjacent funded work:** [#302 Hacken monitoring stack](https://github.com/canton-foundation/canton-dev-fund/pull/302), [#262 OpenZeppelin Canton Stack](https://github.com/canton-foundation/canton-dev-fund/pull/262), [#497 RedStone CAPS](https://github.com/canton-foundation/canton-dev-fund/pull/497).

**Neighboring vault designs:** [#863 Mystic vault standard](https://github.com/canton-foundation/canton-dev-fund/pull/863) (curated lending [#99](https://github.com/canton-foundation/canton-dev-fund/pull/99), closed), [#796 HyprEarn vault extension](https://github.com/canton-foundation/canton-dev-fund/pull/796).

**Ecosystem context:** [Canton DevEx Survey 2026](https://forum.canton.network/t/canton-network-developer-experience-and-tooling-survey-analysis-2026/8412), [CIP-0100](https://github.com/canton-foundation/cips/blob/main/cip-0100/cip-0100.md), [Correlated collateral and the parameter layer, with Moonsong Labs' reply](https://forum.canton.network/t/9098/2).

**External lineage:** [Compound v3 Configurator](https://github.com/compound-finance/comet/blob/main/contracts/Configurator.sol), [WOOF! Development Updates on the Compound forum](https://www.comp.xyz/t/woof-development-updates/5336), [Aave](https://aave.com/) (public risk-dashboard precedent).
