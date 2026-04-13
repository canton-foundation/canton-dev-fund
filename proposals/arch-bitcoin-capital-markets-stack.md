# Development Fund Proposal

## Arch-Canton Bridge and Canton Vault Standard

Author: Arch Network (Matt Mudano)

Daml Development Partner: IntellectEU

Status: Draft

Created: 2026-04-01

Total Funding Request: $150,000 USD (payable in CC equivalent)

## Abstract

This proposal requests $150,000 to build two public good infrastructure components that connect Bitcoin to Canton Network:

- Arch-Canton Bridge - a bidirectional, fee-free, open source bridge that mints CIP-56-compliant aBTC on Canton, enabling BTC holders to access Canton’s institutional ecosystem and Canton participants to access Bitcoin liquidity.
- Canton Vault Standard - a standardized, composable vault interface written in Daml (analogous to Ethereum’s ERC-4626), submitted as a formal Canton Improvement Proposal (CIP) for community adoption.

Both components are open, permissionless infrastructure available to any Canton participant at no cost. The $150K budget covers Canton-side Daml contract development, bridge relayer integration, testing, security audit, and documentation. All work will be executed by IntellectEU, a specialist Daml development firm with Canton production experience.

The underlying Arch-side infrastructure (consensus, execution, settlement) is already built and deployed. This proposal funds only the Canton integration layer.

## Specification

### 1. Objective

Connect Bitcoin’s $2T+ asset class to Canton’s $9T+ institutional ecosystem through two foundational infrastructure primitives. Specifically:

- Bridge a gap in programmable BTC access. Canton has CBTC for custodial BTC holding, but no programmable bridge with execution capabilities. The Arch-Canton Bridge provides bidirectional BTC movement with 300ms execution, enabling BTC capital to flow into Canton’s DvP settlement, lending, and yield infrastructure, and Canton participants to access Bitcoin-native liquidity.
- Fill a missing Daml primitive. Ethereum’s ERC-4626 vault standard has enabled billions in composable yield strategies. Canton has no equivalent. The Canton Vault Standard creates this primitive, enabling any Canton developer to build composable vaults for any underlying asset.

### 2. Component 1: Arch-Canton Bridge

The bridge uses a relayer-based architecture with FROST threshold signatures for security.

Bridge mechanics:

- Arch to Canton: User locks BTC on Arch. Validators produce a signed attestation. Relayer transmits to Canton. Canton bridge contract verifies and mints CIP-56 aBTC via Offer-Accept protocol.
- Canton to Arch: User transfers aBTC to bridge contract. Bridge burns aBTC and emits withdrawal attestation. Relayer transmits to Arch. Validators construct and sign Bitcoin unlock transaction. User receives native BTC.
- Security: (⌈2N/3⌉ + 1)-of-N FROST threshold signatures, per-epoch volume caps, emergency pause, reorg handling via DAG-based transaction tracking and UTXO anchoring.
- Relayer model: Permissionless. Any party can relay valid attestations. Minimum 3 independent operators recommended.

aBTC token (CIP-56):

- CIP-56 compliant, 8 decimals (matching BTC), mint authority restricted to bridge contract only.
- Configurable transfer restrictions (KYC, jurisdictional, accredited investor checks), regulatory observer support.
- Dual-oracle design (RedStone primary, Chainlink secondary), 5-minute staleness threshold, 2% divergence handling, 10-minute TWAP, circuit breaker.

Public good characteristics:

- Free and open source. Arch does not charge fees for bridging, minting, or burning aBTC.
- Reusable reference architecture. Other networks can adapt the bridge design to build their own Canton bridges.
- Bidirectional value flow. BTC holders gain access to Canton’s tokenized asset ecosystem; Canton participants gain access to Bitcoin liquidity.

### 3. Component 2: Canton Vault Standard

A Daml-based vault interface specification analogous to Ethereum’s ERC-4626, providing a standardized primitive for composable yield strategies on Canton.

Interface:

- Deposit/withdraw via CIP-56 Offer-Accept, share token accounting, compliance-gated deposits.
- View functions: totalAssets, totalShares, convertToShares, convertToAssets, maxDeposit, maxWithdraw.
- Composability: vault shares usable as collateral in existing Canton applications, settleable via DvP, nestable in other vaults.

Reference implementation:

- A reference vault using aBTC as the underlying asset, demonstrating the full deposit/withdraw/redeem lifecycle.
- The standard itself is asset-agnostic. Any CIP-56 token can serve as a vault underlying.

Public good characteristics:

- Submitted as a formal Canton Improvement Proposal (CIP) for community adoption.
- Open standard. Any Canton developer can build vaults using this interface for any asset class.
- Fills a documented gap in Canton’s smart contract primitives.

### 4. Architectural Alignment

Both components align with Canton’s architecture and ecosystem priorities:

- CIP-56 compliance: aBTC is a native CIP-56 token, fully compatible with Canton’s Offer-Accept transfer model, sub-transaction privacy, and regulatory observer framework.
- DvP settlement: aBTC and vault shares settle atomically via the Global Synchronizer.
- Daml-native: Bridge contracts and vault standard are implemented in Daml, leveraging Canton’s smart contract model and privacy guarantees.
- Credential Utility compatible: aBTC holder requirements and vault deposit gates integrate with DA’s existing Credential Utility for KYC/AML enforcement.
- Registry Utility compatible: Once minted, aBTC participates in DA’s Registry Utility workflows (transfer, allocation, settlement) with no custom integration required.

### 5. Backward Compatibility

No backward compatibility impact. Both components are additive:

- aBTC is a new CIP-56 token. Does not modify existing token contracts or standards.
- The Canton Vault Standard is a new primitive. Does not change existing Daml contracts.
- The bridge introduces new contracts (BridgeController, DepositAttestation, MintAuthority, WithdrawalRequest) that interact with Canton via standard CIP-56 mechanics.

## Ecosystem Benefits

Once the bridge and vault standard are live, they enable a broader set of use cases for the Canton ecosystem. These are not funded deliverables but represent the downstream value of the public good infrastructure:

- BTC financial services access. Canton participants can bridge aBTC and access BTC/stablecoin liquidity (via Arch Swap) and stablecoin loans against BTC collateral (via Arch Lend). These services are operated and funded by Arch Network independently.
- Composable yield strategies. The vault standard enables institutional yield strategies on Canton: private credit, yield ETFs, debt tranches, and other tradfi yield products, all through a standardized interface.
- BTC-denominated capital markets. aBTC as a CIP-56 token can participate in DA’s existing Registry Utility workflows, enabling BTC-denominated subscriptions into tokenized securities issued via DA’s Registry App. No additional integration infrastructure is needed beyond the bridge itself.
- BTC as collateral. aBTC can be used in DA’s Collateral Utility for margin agreements and collateral settlement, bringing Bitcoin into Canton’s existing institutional collateral framework.

## Milestones and Deliverables

All milestones cover Canton-side Daml integration work only. The underlying Arch primitives (consensus, execution, settlement) are already built and deployed. IntellectEU will lead Daml contract development across all milestones.

### Milestone 1A: Bridge Testnet Delivery

| | |
|---|---|
| **Delivery** | Q2 2026 (April–May) |
| **Funding** | $50,000 |
| **Focus** | Bridge design, Daml contract development, aBTC token deployment on testnet, relayer prototype |

Deliverables:

- Bridge design specification. Published technical document covering architecture, security model, message format, and failure modes. Reviewed by at least one independent Daml ecosystem developer.
- Daml bridge contracts. BridgeController, DepositAttestation, MintAuthority, WithdrawalRequest implemented with >90% unit test coverage. Source code published on GitHub. Reviewed by IntellectEU.
- Arch-side lock/burn contracts. UTXO-based contracts deployed on Arch testnet with passing integration tests.
- aBTC CIP-56 token. Compliant token contract with compliance hooks, transfer restrictions, and DvP support. Deployed on Canton testnet. Passes Canton token standard conformance tests.
- Relayer prototype. Functional relayer transmitting attestations between Arch testnet and Canton testnet. At least 100 successful cross-chain transfers demonstrated.
- Integration tests. End-to-end tests (Arch deposit to Canton mint, Canton burn to Arch unlock). Minimum 50 test cases covering normal and failure paths. Test suite published.
- Documentation. Developer guide for bridge integration. aBTC token specification. Published on GitHub with README and quickstart.

### Milestone 1B: Bridge Mainnet Readiness

| | |
|---|---|
| **Delivery** | Q2–Q3 2026 (June–July) |
| **Funding** | $50,000 |
| **Focus** | Bridge security audit, mainnet deployment, aBTC mainnet launch |

Deliverables:

- Bridge security audit. Third-party audit by a recognized firm (Certora, Trail of Bits, or equivalent). 0 critical findings, 0 unresolved high findings. Audit report published publicly.
- Bridge mainnet deployment. Contracts deployed on Arch mainnet and Canton mainnet. Relayer operational with uptime monitoring and alerting. At least 10 mainnet bridge transfers processed.
- aBTC mainnet launch. aBTC live on Canton mainnet, mintable via bridge. At least one institutional participant has minted aBTC.
- Documentation. Bridge operational runbook, aBTC integration guide. Published on GitHub.

### Milestone 2: Canton Vault Standard CIP

| | |
|---|---|
| **Delivery** | Q3 2026 (August–September) |
| **Funding** | $50,000 |
| **Focus** | Vault standard specification, reference implementation, CIP submission |

Deliverables:

- Canton Vault Standard specification. Published standard with Daml interface definitions, deposit/withdraw flows, share accounting, compliance integration. Formally submitted as a Canton Improvement Proposal (CIP).
- Reference vault implementation. Daml vault contract using aBTC as underlying. Deposit, withdraw, redeem, share accounting functional on Canton testnet with >90% unit test coverage. Reviewed by IntellectEU.
- Vault composability demonstration. Vault shares used as collateral in an atomic DvP settlement with another CIP-56 asset on Canton testnet. Documented with transaction logs.
- Documentation. Vault standard developer guide. Published on GitHub.

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone.
- Demonstrated functionality or operational readiness.
- Documentation and knowledge transfer provided.
- Security audit results (Milestone 1B): 0 critical, 0 unresolved high findings.
- Mainnet operational status (Milestone 1B): bridge operational, aBTC mintable.
- CIP submission (Milestone 2): vault standard formally submitted as a Canton Improvement Proposal.

## Funding

Total Funding Request: $150,000 USD (payable in CC equivalent)

This budget covers Canton-side Daml contract development by IntellectEU, bridge relayer integration, security audit, testing, and documentation. All underlying Arch primitives are already built and funded by Arch Network independently.

### Payment Breakdown

| Milestone | Amount | Timeline |
|---|---|---|
| M1A: Bridge Testnet Delivery | $50,000 | Q2 2026 |
| M1B: Bridge Mainnet Readiness | $50,000 | Q2–Q3 2026 |
| M2: Canton Vault Standard CIP | $50,000 | Q3 2026 |
| **Total** | **$150,000** | |

### Volatility Stipulation

Should the project timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility.

## Co-Marketing

Upon release, Arch Network will collaborate with the Foundation on:

- Announcement coordination
- Case study or technical blog
- Developer or ecosystem promotion

## Motivation

Canton hosts over $9 trillion in tokenized assets and processes approximately $350 billion in daily volume. Institutional participants, including Goldman Sachs (DAP), Broadridge (DLR), and Versana, use Canton for compliant, privacy-preserving financial operations.

Canton’s connection to Bitcoin, a $2T+ asset class and the most widely held digital asset among institutions, remains underdeveloped. While CBTC provides custodial wrapped BTC on Canton, there is no programmable bridge to Bitcoin-native infrastructure with execution capabilities, and no standardized vault primitive for composable yield strategies.

These gaps mean Canton participants who hold BTC, or whose clients hold BTC, cannot put that capital to work within Canton’s compliance framework.

This proposal addresses these gaps with two open infrastructure components:

- The Arch-Canton Bridge is free, open source bridging infrastructure. Arch does not charge fees for bridging, minting, or burning aBTC. The bridge is a reusable reference architecture that other networks can adapt to build their own Canton bridges.
- The Canton Vault Standard is an open CIP for community adoption. Any Canton developer can build composable vaults using this standard for any asset class, not just aBTC.

Once these public goods exist, they enable commercially viable use cases that Arch Network will build and maintain at its own cost: BTC/stablecoin trading, BTC-collateralized lending, and institutional yield strategies. Arch’s commercial revenue from these services creates perpetual maintenance incentives for the entire stack, including the public goods layer, that persist long after the grant term ends.

## Rationale

Why Arch Network:

Arch Network is an $18M-funded Bitcoin infrastructure company with a 20-person team that has been building for over 2.5 years. The team has delivered a production-grade blockchain with BFT consensus, 300ms blocks, and approximately 1,000 TPS; a Bitcoin-native DEX (Arch Swap); a credit and lending protocol (Arch Lend); and an institutional portfolio dashboard (Arch Prime).

Why not CBTC alone:

CBTC serves BTC custody and holding on Canton. It does not support programmable lending, vault strategies, or capital markets integration. CBTC requires 6 Bitcoin confirmations (approximately 60 minutes) for issuance or redemption, creating a collateral enforcement bottleneck that constrains safe loan-to-value ratios to 25-30%. Arch’s 300ms execution eliminates this bottleneck, enabling higher LTVs and more capital-efficient credit markets. CBTC and aBTC are complementary: CBTC for custody, aBTC for capital markets.

Why a dedicated bridge rather than an existing EVM bridge:

Canton’s privacy model and CIP-56 standard require native Daml integration. EVM bridges cannot provide sub-transaction privacy or Canton’s Offer-Accept transfer model.

Daml development partner: IntellectEU

Arch has selected IntellectEU as its specialist Daml development partner for Canton-side contract work across all milestones. IntellectEU is a recognized Daml ecosystem developer with Canton production experience.

Existing ecosystem partnerships:

- Institutional custodians: Anchorage, Ceffu, Utila, providing custody and distribution for aBTC vault strategies.
- HoneyB: Active asset management partnership for BTC private credit yield strategies.
- Institutional liquidity providers: Galaxy, Pantera, committed to seeding initial vault liquidity.
- DAT partners: Digital Asset Trusts going live with $10-20M BTC yield pilots.
