# Development Fund Proposal

**Author:** Arch Network (Matt Mudano)
**Status:** Draft
**Created:** 2026-04-01

## Abstract

Arch and Canton are structurally complementary institutions. Canton provides the institutional compliance layer, sub-transaction privacy, and atomic DvP settlement that capital markets require. Arch provides Bitcoin-native execution and settlement infrastructure â 300ms blocks, ~1,000 TPS, validator-secured collateral enforcement, and native Bitcoin settlement. Together, they can create the capital markets corridor between Bitcoinâs $2T+ and Cantonâs $9T+ institutional asset ecosystem.

Bitcoin is a $2T+ asset with no scalable form of native yield. The most viable strategy for making BTC productive â for institutions, family offices, and sophisticated investors â is the credit carry trade: borrow against BTC collateral, deploy stablecoins into yield-generating strategies (private credit, yield ETFs, money market instruments), collect yield, repay the loan, keep the spread as net BTC yield. This strategy requires fast execution, deterministic collateral enforcement, and deep liquidity â exactly what Archâs infrastructure provides.

This proposal describes five infrastructure components that deliver a full Bitcoin financial services stack for Canton to facilitate this:

1. **ArchâCanton Bridge** â Foundational interoperability infrastructure connecting native BTC to Canton Network. Also serves as the connectivity layer for Archâs financial services (DEX, lending, vaults) to Canton participants. Institutions interact through existing custody relationships (Anchorage, Ceffu, Utila) â no new custody required.

2. **BTC Financial Services Access (DEX + Lending)** â Canton participants gain access to Arch Swap (deep BTC/stablecoin liquidity) and Arch Lend (stablecoin loans against BTC collateral) through the bridge. These are the financial primitives that make BTC productive â without them, BTC on Canton is a holding asset, not a working one.

3. **Canton Vault Standard** â A standardized, composable vault interface written in Daml (analogous to Ethereumâs ERC-4626) that enables institutional yield strategies on Canton. Once credit infrastructure exists, vaults become the vehicle for deploying it â private credit strategies, yield ETFs, debt tranches, corporate bonds, subscription agreements with fund asset managers, and other tradfi yield strategies, all accessible through a standard interface.

4. **BTC Capital Markets Integration for DAâs Tokenization Utility** â An integration layer connecting Archâs financial services to DAâs existing issuance infrastructure, enabling aBTC as a native subscription and settlement asset for tokenized securities on Canton.

5. **Compliant Tokenization Service** â A compliant securities issuance service that enables the tokenization of yield instruments, fund shares, structured products, and other securities on top of the BTC infrastructure with proper regulatory compliance. This is a public good for Cantonâs ecosystem: any issuer can use it to create compliant tokenized securities backed by or denominated in BTC.

Together, these components deliver a complete Bitcoin capital markets stack for Canton: bridge access, deep swaps, institutional lending, tradfi yield infrastructure, compliant securities tokenization â and the capital markets integration that connects all of it to Cantonâs existing $9T+ tokenized asset base.

## Specification

### 1. Objective

Connect Bitcoinâs $2T+ asset class to Cantonâs $9T+ institutional ecosystem through purpose-built financial infrastructure. Specifically: enable institutional BTC holders to earn yield on their Bitcoin without leaving the Canton compliance framework, and enable Canton-native asset issuers to access BTC-denominated capital for the first time.

The five infrastructure components solve three problems that Canton cannot solve internally:

- **No programmable BTC bridge with execution capabilities.** Canton has CBTC (custodial holding), but no mechanism for BTC capital to flow into lending, trading, or yield strategies. The ArchâCanton Bridge solves this.
- **No standardized vault primitive.** Ethereumâs ERC-4626 has enabled billions in composable DeFi strategies. Canton has no equivalent. The Canton Vault Standard fills this gap.
- **No BTC capital onramp for tokenized assets.** DAâs Tokenization Utility provides world-class issuance infrastructure, but there is no mechanism for BTC capital to subscribe to Canton-issued securities. The BTC Capital Markets Integration builds that connection.

### 2. Implementation Mechanics

**ArchâCanton Bridge**

The bridge uses a relayer-based architecture with FROST threshold signatures for security:

- Arch to Canton: User locks BTC on Arch, validators produce signed attestation, relayer transmits to Canton, Canton bridge contract verifies and mints CIP-56 aBTC token via Offer-Accept protocol.
- Canton to Arch: User transfers aBTC to bridge contract, bridge burns aBTC and emits withdrawal attestation, relayer transmits to Arch, validators construct and sign Bitcoin unlock transaction, user receives native BTC.
- Security: FROST threshold signatures, per-epoch volume caps, emergency pause, reorg handling via DAG-based transaction tracking and UTXO anchoring.
- Relayer model: Permissionless â any party can relay valid attestations. Minimum 3 independent operators recommended.

**aBTC Token (CIP-56)**

- Standard: CIP-56 compliant, 8 decimals (matching BTC), mint authority restricted to bridge contract only.
- Compliance: Configurable transfer restrictions (KYC, jurisdictional, accredited investor checks), regulatory observer support.
- Oracle: Dual-oracle design (RedStone primary, Chainlink secondary), 5-minute staleness threshold, 2% divergence handling, 10-minute TWAP, circuit breaker.

**Canton Vault Standard**

- Daml-based interface analogous to ERC-4626: deposit/withdraw via CIP-56 Offer-Accept, share token accounting, compliance-gated deposits.
- View functions: totalAssets, totalShares, convertToShares, convertToAssets, maxDeposit, maxWithdraw.
- Composability: Vault shares usable as collateral in Acme/Palladium, settleable via DvP, nestable in other vaults.
- Reference implementations: HoneyB vault (private credit yield via Simplify, $13B AUM ETF platform), delta-neutral vault (funding rate capture).

**BTC Capital Markets Integration**

- aBTC Subscription Interface: Enables atomic DvP subscriptions denominated in aBTC into DA Tokenization Utility-issued assets.
- Vault Share Composability: Vault share tokens registered as eligible collateral and subscription assets within DAâs credential layer.
- BTC Settlement Pairs: aBTC/tokenized-treasury, aBTC/money-market-fund, aBTC/private-credit DvP settlement pairs.
- Open source integration guides, Daml templates, and TypeScript examples for issuers.

**Compliant Tokenization Service**

- Compliant issuance of securities as tokens on Canton â open, permissionless infrastructure.
- Supports yield instruments, fund shares, structured products, and other securities with proper regulatory compliance.
- KYC/AML, accreditation, and jurisdictional controls enforced at issuance level.

### 3. Architectural Alignment

This proposal aligns with Cantonâs architecture and ecosystem priorities:

- **CIP-56 compliance:** aBTC is a native CIP-56 token, fully compatible with Cantonâs Offer-Accept transfer model, sub-transaction privacy, and regulatory observer framework.
- **DvP settlement:** All components support Cantonâs atomic DvP settlement â aBTC subscriptions, vault share trades, and BTC settlement pairs all settle atomically via the Global Synchronizer.
- **Daml-native:** Bridge contracts, vault standard, and tokenization protocol are implemented in Daml, leveraging Cantonâs smart contract model and benefiting from its privacy and composability guarantees.
- **Canton Improvement Proposal:** The Canton Vault Standard will be submitted as a formal CIP for community adoption, contributing to Cantonâs standards ecosystem.
- **DA Tokenization Utility integration:** The BTC Capital Markets Integration builds on top of DAâs existing issuance infrastructure rather than replacing it â aBTC becomes a new payment and collateral leg for assets already issued via DAâs Tokenization Utility.
- **Institutional compliance model:** Vault-level compliance gating (KYC, accreditation, jurisdictional rules) enforced at deposit, aligned with Cantonâs institutional-grade compliance framework.

### 4. Backward Compatibility

No backward compatibility impact. All components are additive:

- aBTC is a new CIP-56 token â does not modify existing token contracts or standards.
- The Canton Vault Standard is a new primitive â does not change existing Daml contracts.
- The bridge introduces new contracts (BridgeController, DepositAttestation, MintAuthority, WithdrawalRequest) that interact with Canton via standard CIP-56 mechanics.
- BTC Capital Markets Integration adds subscription and settlement interfaces on top of DAâs existing Tokenization Utility â no modifications to DAâs contracts required.
- Compliant Tokenization Service is independent infrastructure, available to any Canton participant.

## Milestones and Deliverables

### Milestone 1: Bridge Architecture + aBTC Token (Q2 2026)

- **Estimated Delivery:** Q2 2026 (AprilâJune)
- **Focus:** Bridge design, Daml contract development, aBTC token deployment on testnet, relayer prototype
- **Deliverables / Value Metrics:**
  - Bridge design specification â published technical document covering architecture, security model, message format, and failure modes.
  - Daml bridge contracts â BridgeController, DepositAttestation, MintAuthority, WithdrawalRequest implemented with >90% unit test coverage.
  - Arch-side lock/burn contracts â UTXO-based contracts deployed on Arch testnet with passing integration tests.
  - aBTC CIP-56 token â Compliant token contract with compliance hooks, transfer restrictions, and DvP support. Deployed on Canton testnet.
  - Relayer prototype â Functional relayer with at least 100 successful cross-chain transfers demonstrated.
  - Integration tests â End-to-end tests. Minimum 50 test cases covering normal and failure paths.
  - Documentation â Developer guide for bridge integration. aBTC token specification. Published on GitHub.

### Milestone 2: Vault Standard + Bridge Production (Q3 2026)

- **Estimated Delivery:** Q3 2026 (JulyâSeptember)
- **Focus:** Canton Vault Standard specification, reference implementations, bridge security audit, mainnet deployment
- **Deliverables / Value Metrics:**
  - Canton Vault Standard specification â Published standard. Formally submitted as a Canton Improvement Proposal (CIP).
  - Reference vault implementation â Daml vault contract using aBTC as underlying with >90% unit test coverage.
  - Vault composability demonstration â Vault shares used as collateral in an atomic DvP settlement.
  - Bridge security audit â Third-party audit. 0 critical findings, 0 unresolved high findings. Audit report published publicly.
  - Bridge mainnet deployment â Contracts deployed on Arch mainnet and Canton mainnet. At least 10 mainnet bridge transfers.
  - aBTC mainnet launch â aBTC live on Canton mainnet, mintable via bridge.
  - Documentation â Vault standard developer guide, bridge operational runbook, aBTC integration guide.

### Milestone 3: BTC Capital Markets Integration + Ecosystem Launch (Q4 2026)

- **Estimated Delivery:** Q4 2026 (OctoberâDecember)
- **Focus:** DA Tokenization Utility integration, aBTC subscription interfaces, BTC settlement pairs, ecosystem launch
- **Deliverables / Value Metrics:**
  - aBTC Subscription Interface â CIP-56 Daml contract enabling atomic DvP subscriptions into DA Tokenization Utility-issued assets.
  - Vault Share Composability â Share tokens registered as eligible collateral within DAâs credential layer.
  - BTC Settlement Pairs â aBTC/tokenized-treasury and aBTC/money-market-fund DvP settlement pairs live on Canton mainnet.
  - Integration documentation and templates â Open source guides, Daml templates, and TypeScript examples.
  - Live demonstration â At least one end-to-end aBTC subscription into a Canton-issued asset on mainnet.
  - Full documentation suite â Complete user guides, API reference, and integration guides for all five components.

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone
- Demonstrated functionality or operational readiness
- Documentation and knowledge transfer provided
- Alignment with stated value metrics
- Security audit results (Milestone 2) â 0 critical, 0 unresolved high findings
- Mainnet operational status (Milestones 2â3) â bridge operational, aBTC mintable, vaults live
- Adoption evidence (Milestone 3) â minimum TVL thresholds met, at least one institutional participant engaged

## Funding

**Total Funding Request:** $250,000 USD (payable in CC at prevailing rate)

### Payment Breakdown by Milestone

- **Milestone 1 (Bridge Architecture + aBTC Token):** $100,000 upon committee acceptance
- **Milestone 2 (Vault Standard + Bridge Production):** $87,500 upon committee acceptance
- **Milestone 3 (BTC Capital Markets Integration + Ecosystem Launch):** $62,500 upon committee acceptance

### Volatility Stipulation

Should the project timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility.

## Co-Marketing

Upon release, Arch Network will collaborate with the Foundation on:

- Announcement coordination
- Joint case study or technical blog highlighting the Arch-Canton integration
- Developer or ecosystem promotion

**Economic Design Audit & Bitcoin Credit Markets Study:** Arch is currently underway on a comprehensive economic design audit and case study of Bitcoin credit markets that supports the thesis behind this proposal. The study demonstrates that Arch's architecture is structurally more efficient for scaling Bitcoin lending than existing alternatives. We would welcome the opportunity to include Canton in this study — examining how Canton's institutional settlement layer combined with Arch's execution infrastructure creates a uniquely efficient credit market design for institutional BTC participants. This joint research could serve as a powerful co-marketing asset for both ecosystems.

## Motivation

Canton hosts over $9 trillion in tokenized assets and processes approximately $350 billion in daily volume. Institutional participants â including Goldman Sachs (DAP), Broadridge (DLR), and Versana â use Canton for compliant, privacy-preserving financial operations.

However, Cantonâs connection to Bitcoin â a $2T+ asset class and the most widely held digital asset among institutions â remains underdeveloped. While CBTC provides custodial wrapped BTC on Canton, there is no programmable bridge to Bitcoin-native infrastructure with execution capabilities, no standardized vault primitive for composable yield strategies, and no mechanism for BTC capital to subscribe to Canton-issued securities.

These gaps limit Cantonâs ability to attract Bitcoin-denominated capital, restrict yield strategies available to institutional participants, and raise the barrier to entry for new issuers.

This proposal directly addresses these gaps by delivering open infrastructure that connects Bitcoinâs $2T+ asset class to Cantonâs institutional ecosystem â creating new utility, new capital flows, and new reasons for institutional participants to build on Canton.

**Public Good / Ecosystem Value Justification:**

Two of the five components are genuine public goods â open, permissionless infrastructure available to any Canton participant:

- **ArchâCanton Bridge:** Free, open source bridging infrastructure. Arch does not charge fees for bridging, minting, or burning aBTC.
- **Compliant Tokenization Service:** Open issuance infrastructure for compliant tokenized securities. Any Canton issuer can use it.

The remaining three generate ecosystem value with built-in maintenance incentives:

- **BTC Financial Services Access (DEX + Lending):** Makes Bitcoin productive on Canton.
- **Canton Vault Standard:** Open CIP for community adoption.
- **BTC Capital Markets Integration:** Connects Cantonâs $9T+ asset base to BTC capital.

## Rationale

**Why Arch Network is the right team:**

Arch Network is an $18M-funded Bitcoin infrastructure company with a 20-person team building for over 2.5 years. Our funding rounds were led by Multicoin Capital and Pantera Capital — two of the most respected institutional crypto investors — reflecting deep conviction in Arch's technical approach and market positioning. Delivered: production-grade blockchain with BFT consensus, 300ms blocks, ~1,000 TPS; Bitcoin-native DEX (Arch Swap); credit and lending protocol (Arch Lend); institutional portfolio dashboard (Arch Prime).

**Why this approach:**

The vertically integrated approach is deliberate. Each componentâs value is amplified by the others â bridge enables aBTC, aBTC enables lending, lending enables vaults, vaults enable structured products, capital markets integration connects all of it to Cantonâs existing asset base. Self-reinforcing adoption flywheel.

**Why not CBTC alone:**

CBTC serves BTC custody and holding. It does not support programmable lending, vault strategies, or capital markets integration. CBTC requires 6 Bitcoin confirmations (~60 minutes) for issuance/redemption, creating a collateral enforcement bottleneck. Archâs 300ms execution eliminates this. CBTC and aBTC are complementary â CBTC for custody, aBTC for capital markets.

**Daml development partnership:**

Arch aims to engage IntellectEU or Obsidian Systems as specialist Daml development partner. Both are recognized Canton ecosystem developers with production experience.

**Existing ecosystem partnerships providing day-one demand:**

- Institutional custodian integrations: Anchorage, Ceffu, Utila
- HoneyB: Active asset management partnership for BTC private credit yield strategies
- Institutional liquidity providers: Galaxy, Pantera â committed to seeding initial vault liquidity
- DAT partners: Digital Asset Trusts going live with $10â20M BTC yield pilots


