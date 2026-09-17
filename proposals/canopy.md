## Development Fund Proposal

**Author:** Yash Sharma (iamyxsh@icloud.com)
**Status:** Submitted
**Created:** 2026-03-16
**Champion:** Canton Foundation (Parth Chaturvedi, parth@canton.foundation)

---

## Abstract

Canopy is an open-source Daml package and draft CIP specification that gives asset managers a standard way to create and manage multi-asset funds on Canton. It handles fund creation, NAV tracking from oracle feeds, CIP-56 share token issuance, subscription/redemption with lockups, fee accrual, and automated rebalancing through CantonSwap. The entire codebase ships under the MIT license. Any Canton builder, private network operator, or institution can fork and deploy it without restrictions.

Canopy follows the Uniswap model. Uniswap started with a $65K grant from the Ethereum Foundation in 2018, shipped the protocol as open-source public good infrastructure, and later built a commercial interface on top. We are building the same thing for Canton's fund layer: an open standard anyone can use, with revenue coming from the interface and tooling built on top after launch.

Canton has $3.6 trillion in tokenized assets and processes over $6 trillion in monthly RWA volume. There is no standard way to package these assets into a fund product. Every manager building fund products on Canton today would start from zero. Canopy fills that gap as shared infrastructure, designed from day one as a Canton Improvement Proposal for ecosystem-wide adoption.

The project is led by a protocol engineer with 5 years of experience across multiple chains, including building a cross-chain composable fund protocol on another L1 and smart account-based rebalancing for Enzyme Finance funds. A working proof-of-concept is at [github.com/iamyxsh/canopy-poc](https://github.com/iamyxsh/canopy-poc).

4 milestones, 7 months, ~1,000,000 CC (approximately $150,000 USD at $0.15/CC). The output is a working fund protocol on mainnet with at least two live funds, a security audit, an SDK other developers can use, and a formal CIP submission for a Canton Fund Standard co-sponsored with the Foundation.

---

## Specification

### 1. Objective

Ship a Daml package and CIP specification that lets any Canton participant create and manage an on-chain fund.

Specifically:

- Fund creation with configurable baskets, target weights, and denomination assets
- CIP-56 share tokens with transfer restrictions and investor permissioning. Each fund's share tokens carry unique metadata (fund name, manager, basket composition) to differentiate between different funds' CIP-56 tokens, since all share tokens are fungible within their own fund but distinct across funds.
- NAV computed on-ledger from RedStone oracle price feeds (RedStone is live on Canton as a Featured App)
- Subscription and redemption with lockup periods enforced in contract logic
- Automated rebalancing through CantonSwap when allocations drift past a threshold
- Management, performance, entrance, and exit fees with transparent accrual
- Investor permissioning via configurable KYC credential providers and Canton's native credential system
- A draft CIP spec for a Canton Fund Standard, intended for formal submission with Foundation co-sponsorship

The CIP thread runs through all four milestones. M1 builds the reference implementation alongside a draft spec. M2 iterates the spec based on committee feedback and adds production integrations. M3 hardens the protocol through security audit. M4 submits the CIP formally through Canton's governance process.

### 2. Implementation Mechanics

**Daml Contracts [Open-Source, MIT License]**

| Template | What it does |
| --- | --- |
| `FundFactory` | Creates funds. Configures basket, weights, denomination asset. Manager as signatory. |
| `Fund` | The fund itself. Choices for NAV updates, subscribe, redeem, rebalance, accrue fees. |
| `FundShare` | CIP-56 share token. Implements the CIP-56 `Holding`, `TransferFactory`, and `TransferInstruction` interfaces with custom transfer logic. Recipient must hold a valid credential from the fund's configured KYC provider before a transfer completes. Each fund gets a unique token with its own metadata (fund name, manager, basket info). Fungible within a fund, distinct across funds. |
| `Subscription` | Processes deposits. Calculates shares from current NAV. Allocates cash across basket by weight. |
| `Redemption` | Burns shares. Liquidates proportional holdings. Checks lockup before payout. |
| `BasketHolding` | Tracks per-asset positions inside a fund. Quantity and current valuation. |
| `NAVReport` | Immutable snapshot: per-asset prices, total fund value, per-share price, timestamp. |
| `RebalanceProposal` | Records drift, proposed trades, price bounds. Must be authorized before execution. |

Design decisions:

- All fund state lives in Daml contracts. No off-chain database holds the "real" state.
- NAV isn't computed off-chain and pushed in as a number. Oracle prices come in via Daml choices, and the per-asset aggregation happens on-ledger. NAV is verifiable, not just reported.
- All NAV, share price, and fee calculations use Daml's `Numeric` type with high precision (up to 37 digits) to prevent rounding errors from compounding across subscriptions and redemptions.
- Lockup enforcement is a timestamp check inside the `Redemption` choice. If the lockup hasn't expired, the choice fails. No admin override.
- Rebalancing is constrained: the `ExecuteRebalance` choice can only move allocations toward pre-defined target weights, within price bounds set at fund creation.
- **Fund asset custody via CIP-56 locks**: When assets enter the fund through subscription, the underlying CIP-56 holdings are locked with the fund's dedicated party as the lock holder. The fund manager cannot move locked assets unilaterally. only fund operations (rebalance, redeem) carry the fund party's authority to unlock and move assets. This provides the same custody guarantee as a Solidity contract holding assets, without requiring an external custodian. For institutions that require it, Canopy also supports an optional custodian co-signatory on asset movements.
- **KYC/AML is provider-agnostic**: Canopy does not embed KYC/AML directly. The fund manager configures a credential issuer (a KYC provider or tokenisation platform) at fund creation. The `Subscribe` choice checks that the investor holds a valid credential from that issuer before processing. This allows different funds to use different compliance providers without protocol changes.
- The full Daml package (all templates, choices, test scripts) ships under MIT license.

**Fee Mechanics**

All fees are computed on-ledger inside the `Fund` contract and recorded transparently:

- **Management fee**: Annualized rate (e.g., 2%) accrued proportionally on each NAV update based on elapsed time since last accrual. Deducted from fund AUM before per-share NAV calculation.
- **Performance fee**: Percentage (e.g., 20%) applied to gains above a high-water mark. The high-water mark is the highest per-share NAV at which performance fees were last accrued. Fees are only charged on new highs. No double-charging after drawdowns.
- **Entrance fee**: Percentage deducted from the subscription amount at deposit time. Applied to the gross deposit before share calculation.
- **Exit fee**: Percentage deducted from the redemption proceeds at withdrawal time. Applied before payout to the investor.

All fee parameters are set at fund creation and recorded in the `Fund` contract. Fee accrual events are captured in `NAVReport` snapshots for full auditability.

**Upgrade Path**

Canopy is designed for upgradeability using Canton's Daml package upgrade mechanism:

- Templates follow Daml's upgrade-compatible patterns: new optional fields can be added without breaking existing contracts.
- Live funds on mainnet can migrate to updated package versions through Canton's standard upgrade workflow. Existing contracts are upgraded in place without disrupting fund operations.
- Breaking template changes (if ever required) use a controlled migration path: new template versions are deployed alongside existing ones, and fund managers migrate via an explicit `UpgradeFund` choice that preserves all state.
- The architecture document (M1 deliverable) includes a versioning and upgrade strategy section.

**Off-Chain Services**

| Service | Stack | Purpose |
| --- | --- | --- |
| NAV Oracle | TypeScript / RedStone SDK | Pulls asset prices from RedStone (Featured App on Canton), submits NAV update choices to fund contracts |
| Rebalance Trigger | TypeScript / Canton Ledger API | Watches drift from target weights, submits proposals when thresholds are breached |
| Dashboard | React / Canton Ledger API | Fund creation, portfolio view, rebalance controls, investor management |

These services are intentionally thin. They don't hold state or make decisions. They feed external data into contracts and give managers a UI. All logic lives in Daml.

**Rebalancing Flow (via CantonSwap)**

1. Drift detection runs against current vs. target weights
2. If any asset is beyond threshold, a `RebalanceProposal` is created with specific trade quantities and maximum acceptable price deviation
3. Manager (or automation) exercises `ExecuteRebalance`
4. Trades go through CantonSwap atomically
5. `BasketHolding` contracts update, new `NAVReport` published

### 3. Architectural Alignment

- **Canton's privacy model**: Fund positions and NAV visible only to manager and authorized investors. Competing funds can't observe each other's holdings or rebalancing. This is a fundamental requirement for institutional fund management that public chains can't provide.
- **Daml's authorization model**: Signatory/observer/controller maps directly to fund roles. Manager creates and controls the fund, investors subscribe and redeem, oracle services update prices, compliance is enforced at the language level.
- **CIP-56 composability**: Fund shares are standard CIP-56 tokens with fund-specific metadata. They work with existing Canton wallets, explorers, and any future distribution platform without custom integration.
- **CIP alignment**: Designed from day one as a proposed Canton Fund Standard, similar to how CIP-56 standardized token transfers. The spec and code co-evolve across milestones.
- **Protocol layer architecture**: Canopy is the fund logic layer. NAV, baskets, subscriptions, redemptions, rebalancing, fees. It does not embed KYC, custody, or distribution. Instead, it exposes hooks (credential checks, lock holders, co-signatories) that tokenisation platforms and fund administrators plug into. This keeps the protocol jurisdiction-agnostic and reusable across different compliance setups.
- **No protocol modifications**: Canopy is a standalone Daml package. It does not modify any existing Canton contracts or network configurations.

**Relevant CIPs:**
- **CIP-0082** (Development Fund): Canopy is common-good infrastructure funded through the Development Fund, open-source under MIT license for ecosystem-wide use
- **CIP-0100** (Governance): the formal CIP submission at M4 follows the Canton governance framework; the draft spec is designed for this process from M1
- **CIP-0056** (Token Standard): fund shares are CIP-56 tokens; every subscription mints CIP-56 tokens, every redemption burns them, and every rebalance generates CIP-56 swap volume
- **CIP-0047** (Activity Markers): fund rebalancing generates multi-asset swap activity across CIP-56 tokens, contributing to App Provider reward eligibility and network activity metrics
- **CIP-0103** (Wallet Protocol): fund shares are displayable and transferable through CIP-103 compatible wallets without custom integration

### 4. Security Design

**On-Ledger Security (Daml Contract Level)**

- **Signatory enforcement**: Fund manager is the sole signatory on `Fund`, `FundFactory`, and `RebalanceProposal` contracts. No choice can execute without the manager's authorization at the Daml runtime level.
- **Fund asset custody**: Basket assets are locked using CIP-56's native lock mechanism upon subscription. The fund's dedicated party is the lock holder. Unlocking requires the fund party's authorization, which is only available through fund contract choices (`ExecuteRebalance`, `Redemption`). The fund manager cannot transfer locked assets outside of fund operations. Optional custodian co-signatory supported for institutional deployments.
- **Investor permissioning**: Subscription and redemption choices validate that the investor holds a valid credential from the fund's configured KYC/compliance provider. The fund manager sets the accepted credential issuer at fund creation. Unauthorized parties cannot subscribe, redeem, or view fund state.
- **Transfer restrictions**: `FundShare` implements the CIP-56 `TransferFactory` interface with custom transfer logic. The `transferFactory_transferImpl` checks that the recipient holds a valid credential from the fund's KYC provider before completing the transfer. Non-verified wallets cannot receive fund shares. This is enforced at the token level, not just at subscribe/redeem.
- **Lockup enforcement**: Timestamp-based lockup check inside the `Redemption` choice. If the lockup period has not elapsed, the choice fails deterministically. No admin override exists by design.
- **Rebalancing constraints**: `ExecuteRebalance` can only move allocations toward pre-defined target weights. Price bounds are set at fund creation and enforced at execution. The choice rejects trades where the execution price deviates beyond the acceptable range from the oracle-reported NAV price.
- **Fee transparency**: All fee accrual (management, performance, entrance, exit) is computed in contract logic and recorded on-ledger. No off-chain fee calculations.

**Oracle Price Feed Security**

- **Stale price protection**: NAV update choices reject oracle prices older than a configurable staleness threshold (default: 5 minutes). Stale prices cannot propagate into NAV calculations.
- **Outlier rejection**: Price feeds are validated against a configurable deviation band from the last accepted price. Prices outside the band require manual manager confirmation before NAV update.
- **Source verification**: Only the designated oracle service party can exercise the `UpdateNAV` choice. Oracle party identity is set at fund creation and enforced by Daml's authorization model.
- **Manual override fallback**: If oracle feeds are unavailable for an extended period, the fund manager can exercise a separate `OverrideNAV` choice with an explicit justification field recorded on-ledger. This choice is distinct from the oracle-driven `UpdateNAV` and produces a flagged `NAVReport` for auditability.

**Rebalancing Safety**

- **Partial failure handling**: If a CantonSwap trade fails mid-rebalance (insufficient liquidity, price bounds exceeded), the entire `ExecuteRebalance` choice fails atomically. No partial state updates. The fund remains in its pre-rebalance state.
- **Cooldown periods**: Configurable cooldown between rebalance executions prevents rapid-fire rebalancing during volatile markets.
- **Drift-only rebalancing**: The rebalancing engine can only propose trades that reduce drift from target weights. It cannot propose arbitrary trades.

**Independent Security Audit (Milestone 3)**

- Full audit of all Daml templates and choices by an independent security firm
- All critical and high findings resolved before mainnet deployment
- Audit report published publicly

### 5. Backward Compatibility

No backward compatibility impact. Canopy is a new Daml package deployed on Canton participants. It introduces new templates and does not modify any existing contracts, configurations, or infrastructure.

---

## Milestones and Deliverables

### Milestone 1: Reference Implementation + Draft CIP Spec + Architecture

- **Estimated Delivery:** Month 2
- **Focus:** Build on the existing proof-of-concept ([github.com/iamyxsh/canopy-poc](https://github.com/iamyxsh/canopy-poc)) to deliver a complete reference implementation with a draft CIP spec
- **Deliverables / Value Metrics:**
  - Draft CIP specification for Canton Fund Standard (fund template, share token, NAV, subscription/redemption interfaces)
  - Architecture document explaining design decisions, CIP vision, Canton alignment, and versioning/upgrade strategy
  - `FundFactory`, `Fund`, `FundShare`, `Subscription`, `Redemption`, `BasketHolding`, `NAVReport` templates
  - Full fund lifecycle: create, subscribe, compute NAV (mocked prices), redeem, accrue fees
  - CIP-56 share tokens with per-fund metadata differentiation
  - Lockup enforcement and investor whitelisting in contract logic
  - Daml Script test suite covering happy paths and edge cases
  - Package compiled and deployable to Canton sandbox via `dpm build` / `dpm test`

### Milestone 2: Production Protocol + Testnet + CIP Iteration

- **Estimated Delivery:** Month 4
- **Focus:** Oracle/DEX integration, testnet deployment, CIP spec iteration, initial partner engagement
- **Deliverables / Value Metrics:**
  - RedStone oracle integration for live NAV calculation
  - CantonSwap integration for automated rebalancing with atomic settlement
  - Drift detection engine with configurable thresholds and cooldown periods
  - Investor credential whitelisting via Canton's native credential system
  - Off-chain rebalancing trigger service
  - Updated CIP spec based on Tech & Ops and community feedback
  - Testnet deployment with live oracle feeds
  - End-to-end demo on testnet: fund creation -> subscription -> NAV update -> rebalance -> redemption

### Milestone 3: Security Audit + SDK + Developer Tooling

- **Estimated Delivery:** Month 6
- **Focus:** Security hardening, developer tooling, documentation
- **Deliverables / Value Metrics:**
  - Independent security audit of Daml contracts, all critical findings resolved
  - Open-source SDK: another developer can deploy a custom fund using it
  - Developer documentation and integration tutorial

### Milestone 4: Mainnet + CIP Submission + Dashboard + Live Funds

- **Estimated Delivery:** Month 7
- **Focus:** Production deployment, formal CIP submission, fund manager dashboard, live funds with locked TVL
- **Deliverables / Value Metrics:**
  - Mainnet deployment
  - Fund manager dashboard (React frontend)
  - Formal CIP submission to Canton governance, co-sponsored with Canton Foundation
  - At least two live funds on mainnet

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone
- Demonstrated functionality or operational readiness
- Documentation and knowledge transfer provided
- Alignment with stated value metrics

Project-specific conditions:

**Milestone 1:**
- All Daml templates compile and pass tests on Canton sandbox via `dpm build` / `dpm test`
- Daml Script test suite: >80% line coverage across all templates
- Full fund lifecycle (create -> subscribe -> NAV (mocked) -> redeem -> accrue fees) completes in sandbox
- Lockup enforcement rejects early redemption attempts (negative test coverage required)
- Investor whitelisting rejects unauthorized subscription attempts (negative test coverage required)
- CIP-56 share tokens carry correct per-fund metadata and are distinguishable across funds
- Architecture document published covering design decisions, CIP vision, Canton alignment, and versioning/upgrade strategy
- Draft CIP spec document published and shared with Tech & Ops for initial feedback

**Milestone 2:**
- NAV update latency: <5s from oracle price feed arrival to on-ledger NAV report publication
- Rebalancing end-to-end execution: <30s from drift detection to settled CantonSwap trades
- Subscribe/redeem settlement: <10s from choice exercise to confirmed state update
- Default drift threshold: 5% (configurable per fund at creation)
- Testnet deployment with live RedStone oracle feeds running continuously for >72 hours without failure
- End-to-end demo on testnet: fund creation -> subscription -> NAV update -> rebalance -> redemption
- Investor credential whitelisting functional via Canton's native credential system on testnet
- Updated CIP spec incorporating Tech & Ops and community feedback

**Milestone 3:**
- Security audit published, all critical and high findings resolved
- SDK confirmed usable: an external Canton developer deploys a custom fund using only SDK and documentation
- All code MIT licensed with tests and deployment documentation

**Milestone 4:**
- Full lifecycle completes on mainnet with live oracle feeds and real CantonSwap liquidity
- At least two live funds on mainnet with distinct basket compositions
- Fund manager dashboard functional: fund creation, portfolio view, rebalance controls, and investor management workflows demonstrated
- Fund shares transferable through standard Canton wallets
- Formal CIP submitted to Canton governance process

**Overall:**
- Draft CIP spec reviewed by Tech & Ops, shared with community for feedback
- Formal CIP submitted to Canton governance process for review

---

## Funding

**Total Funding Request:** ~1,000,000 CC (approximately $150,000 USD at $0.15/CC)

### Payment Breakdown by Milestone

- Milestone 1 (Reference Implementation + Draft CIP + Architecture): ~166,667 CC upon committee acceptance
- Milestone 2 (Production Protocol + Testnet + CIP Iteration): ~233,333 CC upon committee acceptance
- Milestone 3 (Security Audit + SDK + Developer Tooling): ~333,333 CC upon committee acceptance
- Milestone 4 (Mainnet + CIP Submission + Dashboard + Live Funds): ~266,667 CC upon final release and acceptance

Budget allocation:

| Item | Duration | Milestone | Cost (CC at $0.15) |
|------|----------|-----------|------|
| Protocol Lead (Yash Sharma) | 7 months | M1-M4 | ~520,000 CC |
| Off-chain Integration Engineer (Dhruv Sharma, [@illegalcall](https://github.com/illegalcall)) | 3 months | M2-M3 | ~80,000 CC |
| Frontend Developer (Vicky Shaw, [@vickyshaw29](https://github.com/vickyshaw29)) | 2 months | M3-M4 | ~66,667 CC |
| Security Audit | M3 | M3 | ~266,667 CC |
| Infrastructure & Oracle Costs | Ongoing | M2-M4 | ~33,333 CC |
| Contingency | - | - | ~33,333 CC |
| **Total** | | | **~1,000,000 CC** |

### Volatility Stipulation

The project duration is **under 7 months**. Should the project timeline extend beyond 7 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility.

---

## Co-Marketing

Upon release, the implementing entity will collaborate with the Foundation on:

- Joint announcement of the Canton Fund Standard CIP submission
- Technical blog post walking through fund creation on Canton using the Canopy SDK
- Developer-focused content: integration tutorial, SDK quickstart, example fund walkthrough
- Participation in Canton community calls and developer forums
- Case studies showing live fund management workflows on Canton

The CIP process itself creates natural public touchpoints: draft publication, community review period, governance vote.

---

## Motivation

Canton has $3.6 trillion in tokenized real-world assets across 600+ institutions. It's the infrastructure behind Goldman Sachs GS DAP, HSBC Orion, DTCC Tokenization Service, Broadridge DLR, BNP Neobonds, and Nasdaq Calypso. CIP-56 and the Global Synchronizer make these assets composable at the settlement layer. The December 2025 strategic investment in Digital Asset by iCapital, BNY, Nasdaq, and S&P Global confirms that fund distribution infrastructure is coming to Canton.

But there's a missing layer. iCapital distributes fund products to wealth managers. Those fund products need to be composed on-chain first. Today there is no standard way for an asset manager to package Canton-native assets into a fund with NAV tracking, weighted allocations, compliant share issuance, and automated rebalancing. Every manager would build from scratch.

This is a common good problem. No single asset manager will build open infrastructure for everyone. It needs grant funding, the same way Uniswap needed the Ethereum Foundation's grant before any revenue model existed.

Canton's Tech & Ops committee has stated a preference for projects that build public utilities which other network members can use. Canopy is exactly that: a plug-and-play fund standard. Any participant can clone it and run their own fund, whether public or on a private Canton deployment. The MIT license ensures zero restrictions.

Canopy generates direct ecosystem value. Every fund rebalance produces multi-asset swap volume across CIP-56 assets, increasing App Provider reward eligibility. With 4 billion CC allocated to app builders in 2026 and higher payout multipliers for Featured Apps, Canopy has a path to Canton's reward system from mainnet launch. Every new CIP-56 asset added to the network becomes a potential basket holding automatically. The fund universe grows with Canton.

There are no similar proposals in the current canton-dev-fund batch. First mover advantage is real here. As Parth put it: Canton needs a token standard for funds, similar to how NFTs needed ERC-721.

Post-launch, the protocol sustains itself through App Provider / Featured App rewards from rebalancing swap volume, protocol-level fees (management fee surcharge, rebalancing execution fees), and interface-level revenue (premium dashboard, analytics). The grant funds the build. Canton's reward system and protocol fees sustain it after.

---

## Rationale

**Why a CIP standard, not just a protocol.** Building a non-standard fund implementation and then retrofitting it to a CIP later means building twice. Designing as a standard from day one means the spec and code co-evolve. M1 delivers the draft spec alongside working code, so the committee can evaluate both the architecture and the standard before approving further funding. If adopted, every fund on Canton follows the same template structure, share token interface, and NAV reporting format.

**Why Daml's model is the right fit.** Fund management has clear roles: manager, investor, compliance, oracle. Daml's signatory/observer/controller model maps to these roles at the language level. Privacy is built into Canton's sub-transaction model. Lockups and compliance checks are contract-level guarantees. This is why building on Canton rather than a public chain makes sense for institutional fund infrastructure.

**Why this team.** I've been building fund and DeFi infrastructure across multiple chains for 5 years. I built a cross-chain composable fund protocol on another L1, wrote smart contracts using smart accounts to rebalance Enzyme Finance funds on Ethereum, and built threshold ECDSA and ZK proof systems in Rust. Fund composition and rebalancing is the problem I keep coming back to. A working proof-of-concept is already up at [github.com/iamyxsh/canopy-poc](https://github.com/iamyxsh/canopy-poc), demonstrating Daml fluency and the core fund lifecycle on Canton sandbox.

The team is lean by design. Daml contracts are the backend, so there's no traditional server to build.

- **Vicky Shaw ([@vickyshaw29](https://github.com/vickyshaw29), Frontend Developer, M3-M4)** - Developed UI for Europe's top educational apps. Built frontend interfaces for EVM and Radix chains in React, React Native, and Svelte. Joins once APIs are stable to build the fund manager dashboard and SDK docs site.
- **Dhruv Sharma ([@illegalcall](https://github.com/illegalcall), Off-chain Integration Engineer, M2-M3)** - Software engineer at Wells Fargo. Experience building off-chain services in EVM ecosystems and contributor to validators like Agave. Handles oracle integration, rebalancing trigger service, and off-chain infrastructure. Dhruv is also the lead on PR #51 (Canton Event Indexer), which provides the data infrastructure layer Canopy fund events are indexed through. funding both proposals creates a multiplier effect.

**Alternatives considered.** Composable fund protocols exist on Ethereum (Enzyme Finance being the most established), but they're built for retail DeFi with fully transparent on-chain state. Canton's privacy model, credential system, and institutional asset base require a purpose-built Daml implementation designed around Canton's strengths. A CIP-first approach ensures the result is a reusable standard, not a one-off.

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| **RedStone oracle downtime or delayed price feeds** | NAV calculations stall, subscriptions/redemptions blocked | Stale price protection rejects feeds older than configurable threshold. Fund manager can pause subscriptions/redemptions until feeds resume. Fallback: manager can exercise the `OverrideNAV` choice with an explicit justification field recorded on-ledger for auditability (see Security Design §4). |
| **CantonSwap liquidity insufficient for rebalancing** | Rebalance trades fail or execute at unfavorable prices | Price bounds enforced at contract level. Trades where execution price deviates beyond the acceptable range are rejected atomically. If a rebalance fails, the fund remains in its pre-rebalance state and the manager can retry with adjusted bounds or smaller target allocations. Cooldown periods prevent rapid-fire attempts in thin markets. |
| **CIP governance process takes longer than 7 months** | Formal CIP submission delayed beyond M4 | Draft CIP spec is delivered at M1 and iterated at M2, ensuring the standard is community-reviewed well before formal submission. The protocol ships and operates independently of CIP adoption status. CIP submission is a deliverable; CIP ratification is not. |
| **CC price volatility beyond the stipulation window** | Budget shortfall if CC drops significantly against USD | Volatility stipulation covers Committee-requested scope changes beyond 7 months. Lean team structure minimizes burn rate. |
| **Daml or Canton breaking changes mid-build** | Templates need rework, timeline slips | Version compatibility matrix maintained from M1. Integration tests pinned to specific Canton/Daml versions. Upgrade playbook documented. M2 testnet deployment validates against latest stable release. |
| **Insufficient partner interest for two live funds at M4** | Mainnet launch with fewer than two funds | Partner engagement starts at M2 (not M4). Champion (Parth) facilitates introductions to Canton network participants. Fallback: team deploys two demonstration funds with real assets to meet the deliverable. |
| **Single protocol lead risk** | Bus factor of one for Daml contract development | Architecture document at M1 ensures any Daml developer can understand and extend the codebase. All code MIT licensed with comprehensive test suites. Dhruv joins at M2 and gains full protocol context. |

---

## Ecosystem Integration

Canopy is designed as composable infrastructure. The following proposals in the current Development Fund batch would directly benefit from or integrate with a Canton Fund Standard:

| Proposal | How Canopy Integrates |
|----------|----------------------|
| **#51 Canton Event Indexer** (Dhruv Sharma) | Fund lifecycle events (create, subscribe, redeem, rebalance, NAV update) are indexable. The indexer's typed schema generation can produce `proj_fund`, `proj_fundshare`, `proj_navreport` tables for real-time fund analytics. |
| **#66 Canton Bilateral Discovery Library** (StablePort) | Fund shares are CIP-56 tokens. CBDL enables institutional OTC discovery and trading of fund shares without revealing positions publicly. |
| **#90 Open Source Reference Wallet** (Digital Asset) | Fund shares display natively in the reference wallet as CIP-56 tokens with fund-specific metadata (fund name, NAV, basket composition). |
| **#69 dApp SDK and Tooling** (Digital Asset) | Canopy serves as a reference dApp for the SDK. A non-trivial, multi-template application demonstrating real fund management workflows. |
| **#79 Canton Agent Kit** (Peter Swierzy) | AI agents can manage fund rebalancing, monitor drift, and execute subscription/redemption workflows through the Agent Kit's TypeScript SDK. |
| **#87 Commodity Reserve Infrastructure** (Hawkrel/ARU) | Commodity-backed tokens created by the Reserve protocol can be included as basket assets in Canopy funds, enabling commodity exposure within diversified fund products. |
| **#77 Cantool Developer CLI** (Eric Mann) | Canopy's Daml package can be scaffolded, built, tested, and deployed through Cantool, serving as a real-world validation case for the CLI's fund-specific workflows. |
| **#99 Mystic Finance** (Curated Lending) | Canopy fund shares (CIP-56 tokens) can serve as collateral in Mystic's isolated lending vaults, enabling fund share-backed borrowing. Mystic's curated vaults can allocate to Canopy-managed funds as yield sources. |
| **#44 Yield OS** (Yield Segmentation SDK) | Principal tokens (PT) and yield tokens (YT) created by the Yield Segmentation framework can be included as basket assets in Canopy funds, enabling structured credit exposure within diversified fund products. |

**Potential Integration Partners:**

| Partner | Integration |
|---------|-------------|
| **Hydra X** (Featured App, Licensed Custodian) | Hydra X provides custody, KYC/AML, and fund distribution on Canton. Canopy provides the fund logic layer. Fund managers using Canopy can plug in Hydra X as their custodial co-signatory, KYC credential provider, and licensed distributor for tokenised fund shares. |

Every new CIP-56 asset added to Canton automatically becomes a potential basket holding for Canopy funds. The fund universe grows with the network.

---

## Assumptions

- RedStone oracle remains available as a Featured App on Canton through the project duration
- CantonSwap has sufficient liquidity for multi-asset rebalancing at the time of M2-M3 integration
- CIP governance process accepts external submissions co-sponsored by the Foundation
- Tech & Ops Committee provides feedback on draft CIP spec and milestone deliverables within agreed review windows
- Canton testnet and mainnet remain stable and accessible during deployment phases (M2-M4)
- The Ledger API surfaces used by off-chain services remain available or deprecate with documented migration paths
- External security audit firm availability aligns with the M3 hardening window

---

## Out of Scope

- **Custodial services**: Fund assets are secured via CIP-56 locks at the protocol level, with optional custodian co-signatory support. Canopy does not operate as a custodian. Custody infrastructure is provided by external parties (e.g., licensed custodians on Canton).
- **KYC/AML provider**: Canopy enforces credential checks but does not perform identity verification. KYC/AML is handled by the fund manager's chosen credential provider (tokenisation platforms, licensed fund administrators, etc.).
- **Investment advice or compliance opinions**: The protocol enforces configurable rules (lockups, credential checks, transfer restrictions, fees) but does not provide legal, regulatory, or investment guidance.
- **Retail-facing frontend**: The M4 dashboard is a fund manager tool. A retail investor-facing application is a post-grant commercial opportunity, not a grant deliverable.
- **Cross-network deployment**: Canopy is Canton-only. Bridging to other networks or multi-chain fund management is out of scope.
- **Canton core protocol modifications**: Canopy is a standalone Daml package. It does not modify Canton nodes, synchronizer configuration, or any existing contracts.
- **Guaranteed CIP ratification**: The grant delivers a formal CIP submission through governance. Ratification is a community governance outcome, not a deliverable the team controls.
- **Hosted multi-tenant SaaS**: Canopy ships as an open-source package. Running it as a hosted service is a post-grant commercial decision.

---

## Maintenance and Post-Grant Plan

Post-grant, Yash Sharma remains the primary maintainer for **12 months** after final milestone acceptance.

**Support window:** 12 months from M4 acceptance.

**Severity SLA:**
- **P1** (security vulnerability / fund-affecting bug): acknowledge <4 hours, mitigation <24 hours
- **P2** (functional regression in core fund lifecycle): acknowledge <1 business day, patch <5 business days
- **P3** (non-critical bug / enhancement request): acknowledge <3 business days, scheduled in next planned release

**Compatibility:** Maintain compatibility matrix for supported Canton/Daml versions. Upgrade notes published for every release.

**Security process:** Coordinated vulnerability disclosure workflow. Emergency patch path for critical findings.

**CIP stewardship:** Continue iterating the CIP spec based on community feedback and governance process requirements through the 12-month maintenance window.

**Sustainability:** Post-maintenance, the protocol sustains itself through:
- App Provider / Featured App rewards from rebalancing swap volume
- Protocol-level fees (management fee surcharge, rebalancing execution fees)
- Community contributions under MIT license
- If maintenance demand exceeds assumptions, a continuation grant can be proposed with usage metrics and support load evidence.

---
