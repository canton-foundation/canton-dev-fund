# Development Fund Proposal

**Author:** Arch Network (Matt Mudano)
**Status:** Draft
**Created:** 2026-04-01

## Abstract

Arch and Canton are structurally complementary institutions. Canton provides the institutional compliance layer, sub-transaction privacy, and atomic DvP settlement that capital markets require. Arch provides Bitcoin-native execution and settlement infrastructure — 300ms blocks, ~1,000 TPS, validator-secured collateral enforcement, and native Bitcoin settlement. Together, they can create the capital markets corridor between Bitcoin's $2T+ and Canton's $9T+ institutional asset ecosystem.

Bitcoin is a $2T+ asset with no scalable form of native yield. The most viable strategy for making BTC productive — for institutions, family offices, and sophisticated investors — is the credit carry trade: borrow against BTC collateral, deploy stablecoins into yield-generating strategies (private credit, yield ETFs, money market instruments), collect yield, repay the loan, keep the spread as net BTC yield. This strategy requires fast execution, deterministic collateral enforcement, and deep liquidity — exactly what Arch's infrastructure provides.

All five of the infrastructure primitives described below are already fully built and deployed on Arch Network. This proposal does not request funding to build these products from scratch — it requests funding to build the Daml contracts and integration layer that connect Arch's existing, production-tested infrastructure to Canton Network. The $250K budget covers Canton-side Daml contract development, bridge relayer integration, testing, security audits, and documentation — executed by IntellectEU, a specialist Daml development firm with Canton production experience.

This proposal describes five infrastructure components that deliver a full Bitcoin financial services stack for Canton to facilitate this:

1. **Arch–Canton Bridge** — Foundational interoperability infrastructure connecting native BTC to Canton Network. Also serves as the connectivity layer for Arch's financial services (DEX, lending, vaults) to Canton participants. Institutions interact through existing custody relationships (Anchorage, Ceffu, Utila) — no new custody required.

2. **BTC Financial Services Access (DEX + Lending)** — Canton participants gain access to Arch Swap (deep BTC/stablecoin liquidity) and Arch Lend (stablecoin loans against BTC collateral) through the bridge. These are the financial primitives that make BTC productive — without them, BTC on Canton is a holding asset, not a working one.

3. **Canton Vault Standard** — A standardized, composable vault interface written in Daml (analogous to Ethereum's ERC-4626) that enables institutional yield strategies on Canton. Once credit infrastructure exists, vaults become the vehicle for deploying it — private credit strategies, yield ETFs, debt tranches, corporate bonds, subscription agreements with fund asset managers, and other tradfi yield strategies, all accessible through a standard interface.

4. **BTC Capital Markets Integration for DA's Tokenization Utility** — An integration layer connecting Arch's financial services to DA's existing issuance infrastructure, enabling aBTC as a native subscription and settlement asset for tokenized securities on Canton.

5. **Compliant Tokenization Service** — A compliant securities issuance service that enables the tokenization of yield instruments, fund shares, structured products, and other securities on top of the BTC infrastructure with proper regulatory compliance. This is a public good for Canton's ecosystem: any issuer can use it to create compliant tokenized securities backed by or denominated in BTC.

Together, these components deliver a complete Bitcoin capital markets stack for Canton: bridge access, deep swaps, institutional lending, tradfi yield infrastructure, compliant securities tokenization — and the capital markets integration that connects all of it to Canton's existing $9T+ tokenized asset base.

## Specification

### 1. Objective

Connect Bitcoin's $2T+ asset class to Canton's $9T+ institutional ecosystem through purpose-built financial infrastructure. Specifically: enable institutional BTC holders to earn yield on their Bitcoin without leaving the Canton compliance framework, and enable Canton-native asset issuers to access BTC-denominated capital for the first time.

The five infrastructure components solve three problems that Canton cannot solve internally:

- **No programmable BTC bridge with execution capabilities.** Canton has CBTC (custodial holding), but no mechanism for BTC capital to flow into lending, trading, or yield strategies. The Arch–Canton Bridge solves this.
- **No standardized vault primitive.** Ethereum's ERC-4626 has enabled billions in composable DeFi strategies. Canton has no equivalent. The Canton Vault Standard fills this gap.
- **No BTC capital onramp for tokenized assets.** DA's Tokenization Utility provides world-class issuance infrastructure, but there is no mechanism for BTC capital to subscribe to Canton-issued securities. The BTC Capital Markets Integration builds that connection.
### 2. Implementation Mechanics

**Arch–Canton Bridge**

The bridge uses a relayer-based architecture with FROST threshold signatures for security:

- Arch → Canton: User locks BTC on Arch → validators produce signed attestation → relayer transmits to Canton → Canton bridge contract verifies and mints CIP-56 aBTC token via Offer-Accept protocol.
- Canton → Arch: User transfers aBTC to bridge contract → bridge burns aBTC and emits withdrawal attestation → relayer transmits to Arch → validators construct and sign Bitcoin unlock transaction → user receives native BTC.
- Security: (⌈2N/3⌉ + 1)-of-N FROST threshold signatures, per-epoch volume caps, emergency pause, reorg handling via DAG-based transaction tracking and UTXO anchoring.
- Relayer model: Permissionless — any party can relay valid attestations. Minimum 3 independent operators recommended.

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
- Vault Share Composability: Vault share tokens registered as eligible collateral and subscription assets within DA's credential layer.
- BTC Settlement Pairs: aBTC/tokenized-treasury, aBTC/money-market-fund, aBTC/private-credit DvP settlement pairs.
- Open source integration guides, Daml templates, and TypeScript examples for issuers.

**Compliant Tokenization Service**

- Compliant issuance of securities as tokens on Canton — open, permissionless infrastructure.
- Supports yield instruments, fund shares, structured products, and other securities with proper regulatory compliance.
- KYC/AML, accreditation, and jurisdictional controls enforced at issuance level.

### 3. Architectural Alignment

This proposal aligns with Canton's architecture and ecosystem priorities:

- **CIP-56 compliance:** aBTC is a native CIP-56 token, fully compatible with Canton's Offer-Accept transfer model, sub-transaction privacy, and regulatory observer framework.
- **DvP settlement:** All components support Canton's atomic DvP settlement — aBTC subscriptions, vault share trades, and BTC settlement pairs all settle atomically via the Global Synchronizer.
- **Daml-native:** Bridge contracts, vault standard, and tokenization protocol are implemented in Daml, leveraging Canton's smart contract model and benefiting from its privacy and composability guarantees.
- **Canton Improvement Proposal:** The Canton Vault Standard will be submitted as a formal CIP for community adoption, contributing to Canton's standards ecosystem.
- **DA Tokenization Utility integration:** The BTC Capital Markets Integration builds on top of DA's existing issuance infrastructure rather than replacing it — aBTC becomes a new payment and collateral leg for assets already issued via DA's Tokenization Utility.
- **Institutional compliance model:** Vault-level compliance gating (KYC, accreditation, jurisdictional rules) enforced at deposit, aligned with Canton's institutional-grade compliance framework.
### 4. Backward Compatibility

No backward compatibility impact. All components are additive:

- aBTC is a new CIP-56 token — does not modify existing token contracts or standards.
- The Canton Vault Standard is a new primitive — does not change existing Daml contracts.
- The bridge introduces new contracts (BridgeController, DepositAttestation, MintAuthority, WithdrawalRequest) that interact with Canton via standard CIP-56 mechanics.
- BTC Capital Markets Integration adds subscription and settlement interfaces on top of DA's existing Tokenization Utility — no modifications to DA's contracts required.
- Compliant Tokenization Service is independent infrastructure, available to any Canton participant.

## Milestones and Deliverables

All milestones below cover Canton-side Daml integration work only. The underlying Arch primitives (bridge logic, DEX, lending protocol, vault infrastructure, tokenization service) are already built and deployed. IntellectEU will lead Daml contract development across all milestones.

### Milestone 1A: Bridge Testnet Delivery (Q2 2026)

- **Estimated Delivery:** Q2 2026 (April–May)
- **Funding:** $50,000
- **Focus:** Bridge design, Daml contract development, aBTC token deployment on testnet, relayer prototype
- **Deliverables / Value Metrics:**
  - Bridge design specification — published technical document covering architecture, security model, message format, and failure modes. Reviewed by at least one independent Daml ecosystem developer.
  - Daml bridge contracts — BridgeController, DepositAttestation, MintAuthority, WithdrawalRequest implemented with >90% unit test coverage. Source code published on GitHub. Reviewed by IntellectEU.
  - Arch-side lock/burn contracts — UTXO-based contracts deployed on Arch testnet with passing integration tests.
  - aBTC CIP-56 token — Compliant token contract with compliance hooks, transfer restrictions, and DvP support. Deployed on Canton testnet. Passes Canton token standard conformance tests.
  - Relayer prototype — Functional relayer transmitting attestations between Arch testnet and Canton testnet. At least 100 successful cross-chain transfers demonstrated.
  - Integration tests — End-to-end tests (Arch deposit → Canton mint, Canton burn → Arch unlock). Minimum 50 test cases covering normal and failure paths. Test suite published.
  - Documentation — Developer guide for bridge integration. aBTC token specification. Published on GitHub with README and quickstart.
### Milestone 1B: Bridge Mainnet Readiness (Q2–Q3 2026)

- **Estimated Delivery:** Q2–Q3 2026 (June–July)
- **Funding:** $50,000
- **Focus:** Bridge security audit, mainnet deployment, aBTC mainnet launch
- **Deliverables / Value Metrics:**
  - Bridge security audit — Third-party audit by a recognized firm (Certora, Trail of Bits, or equivalent). 0 critical findings, 0 unresolved high findings. Audit report published publicly.
  - Bridge mainnet deployment — Contracts deployed on Arch mainnet and Canton mainnet. Relayer operational with uptime monitoring and alerting. At least 10 mainnet bridge transfers processed.
  - aBTC mainnet launch — aBTC live on Canton mainnet, mintable via bridge. At least one institutional participant has minted aBTC.
  - Documentation — Bridge operational runbook, aBTC integration guide. Published on GitHub.

### Milestone 2: Vault Standard + Financial Services Integration (Q3 2026)

- **Estimated Delivery:** Q3 2026 (August–September)
- **Funding:** $75,000
- **Focus:** Canton Vault Standard specification and reference implementations, financial services integration
- **Deliverables / Value Metrics:**
  - Canton Vault Standard specification — Published standard with Daml interface definitions, deposit/withdraw flows, share accounting, compliance integration. Formally submitted as a Canton Improvement Proposal (CIP).
  - Reference vault implementation — Daml vault contract using aBTC as underlying. Deposit, withdraw, redeem, share accounting functional on Canton testnet with >90% unit test coverage. Reviewed by IntellectEU.
  - Vault composability demonstration — Vault shares used as collateral in an atomic DvP settlement with another CIP-56 asset on Canton testnet. Documented with transaction logs.
  - Documentation — Vault standard developer guide. Published on GitHub.
### Milestone 3: BTC Capital Markets Integration + Ecosystem Launch (Q4 2026)

- **Estimated Delivery:** Q4 2026 (October–December)
- **Funding:** $75,000
- **Focus:** DA Tokenization Utility integration, aBTC subscription interfaces, BTC settlement pairs, compliant tokenization service integration, ecosystem launch
- **Deliverables / Value Metrics:**
  - aBTC Subscription Interface — CIP-56 Daml contract enabling atomic DvP subscriptions denominated in aBTC into DA Tokenization Utility-issued assets. Tested end-to-end on Canton testnet.
  - Vault Share Composability — Canton Vault Standard share tokens registered as eligible collateral and subscription assets within DA's credential layer. Demonstrated on Canton testnet.
  - BTC Settlement Pairs — aBTC/tokenized-treasury and aBTC/money-market-fund DvP settlement pairs live on Canton mainnet. At least 2 atomic DvP settlements using aBTC executed and documented.
  - Compliant Tokenization Service — Canton-side Daml integration for compliant securities issuance. Functional on Canton testnet with documentation.
  - Integration documentation & templates — Open source guides, Daml templates, and TypeScript examples. Published on GitHub. Validated by at least one external developer.
  - Live demonstration — At least one end-to-end aBTC subscription into a Canton-issued asset on mainnet. Documented with transaction logs and participant attestation.
  - Full documentation suite — Complete user guides, API reference, and integration guides for all five components. Published on GitHub.

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone
- Demonstrated functionality or operational readiness
- Documentation and knowledge transfer provided
- Alignment with stated value metrics
- Security audit results (Milestone 1B) — 0 critical, 0 unresolved high findings
- Mainnet operational status (Milestones 1B–3) — bridge operational, aBTC mintable, vaults live
- Adoption evidence (Milestone 3) — minimum TVL thresholds met, at least one institutional participant engaged
## Funding

**Total Funding Request:** $250,000 USD (payable in CC equivalent)

This budget covers Canton-side Daml contract development, bridge relayer integration, security audits, testing, and documentation. All underlying Arch primitives (DEX, lending protocol, vault infrastructure, tokenization service) are already built and funded by Arch Network independently.

### Payment Breakdown by Milestone

- **Milestone 1A (Bridge Testnet Delivery):** $50,000 upon committee acceptance
- **Milestone 1B (Bridge Mainnet Readiness):** $50,000 upon committee acceptance
- **Milestone 2 (Vault Standard + Financial Services Integration):** $75,000 upon committee acceptance
- **Milestone 3 (BTC Capital Markets Integration + Ecosystem Launch):** $75,000 upon committee acceptance

### Volatility Stipulation

Should the project timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility.

## Co-Marketing

Upon release, Arch Network will collaborate with the Foundation on:

- Announcement coordination
- Case study or technical blog
- Developer or ecosystem promotion
## Motivation

Canton hosts over $9 trillion in tokenized assets and processes approximately $350 billion in daily volume. Institutional participants — including Goldman Sachs (DAP), Broadridge (DLR), and Versana — use Canton for compliant, privacy-preserving financial operations.

However, Canton's connection to Bitcoin — a $2T+ asset class and the most widely held digital asset among institutions — remains underdeveloped. While CBTC provides custodial wrapped BTC on Canton, there is no programmable bridge to Bitcoin-native infrastructure with execution capabilities (lending, trading, structured products), no standardized vault primitive for composable yield strategies, and no mechanism for BTC capital to subscribe to Canton-issued securities.

These gaps mean Canton participants who hold BTC — or whose clients hold BTC — cannot put that capital to work within Canton's compliance framework.

This proposal directly addresses these gaps by delivering open infrastructure that connects Bitcoin's $2T+ asset class to Canton's institutional ecosystem — creating new utility for existing participants and lowering the barrier for new ones.

**Public Good / Ecosystem Value Justification:**

Two of the five components are genuine public goods — open, permissionless infrastructure available to any Canton participant at no cost:

- **Arch–Canton Bridge:** Free, open source bridging infrastructure. Arch does not charge fees for bridging, minting, or burning aBTC. The bridge is a reusable reference architecture — other networks can adapt it to build their own Canton bridges. This is the foundational interoperability layer that makes every other use case possible.
- **Compliant Tokenization Service:** Open issuance infrastructure for compliant tokenized securities. Any Canton issuer can use it to tokenize securities with proper regulatory compliance on top of the BTC infrastructure. This is classic public good infrastructure that lowers the barrier for all Canton participants.

These two public goods are the critical infrastructure that makes a broader set of commercially viable use cases possible. Arch also offers three commercially operated services that Canton participants gain access to through the public infrastructure:

- **BTC Financial Services Access (DEX + Lending):** Makes Bitcoin productive on Canton — deep BTC/stablecoin swaps and stablecoin loans against BTC collateral.
- **Canton Vault Standard:** An open CIP for community adoption, enabling composable institutional yield strategies.
- **BTC Capital Markets Integration:** Connects Canton's $9T+ asset base to BTC capital for the first time.

The commercial revenue Arch generates from these services is Arch's skin in the game. Arch is economically incentivized to maintain, scale, and improve the entire stack — including the public goods layer — precisely because the commercial services depend on it. This makes the ecosystem more durable than grant-funded-only infrastructure, where maintenance incentives disappear when grant funds are exhausted. Canton gains infrastructure with built-in, perpetual maintenance incentives that persist long after the grant term ends.
## Rationale

**Why Arch Network is the right team:**

Arch Network is an $18M-funded Bitcoin infrastructure company with a 20-person team that has been building for over 2.5 years. The team has delivered: a production-grade blockchain with BFT consensus, 300ms blocks, and ~1,000 TPS; a Bitcoin-native DEX (Arch Swap); a credit and lending protocol (Arch Lend); and an institutional portfolio dashboard (Arch Prime).

**Why this approach:**

The vertically integrated approach (bridge + financial services + vault standard + capital markets integration + tokenization) is deliberate. Each component's value is amplified by the others — the bridge enables aBTC, aBTC enables lending, lending enables vaults, vaults enable structured products, and the capital markets integration connects all of it to Canton's existing asset base. Delivering these as an integrated stack rather than independent components creates a self-reinforcing adoption flywheel.

**Why not CBTC alone:**

CBTC serves BTC custody and holding on Canton. It does not support programmable lending, vault strategies, or capital markets integration. Critically, CBTC requires 6 Bitcoin confirmations (~60 minutes) for issuance or redemption, creating a collateral enforcement bottleneck that constrains safe LTVs to 25–30% and limits carry trade competitiveness. Arch's 300ms execution eliminates this bottleneck, structurally enabling higher LTVs and more capital-efficient credit markets. CBTC and aBTC are complementary — CBTC for custody, aBTC (and Arch's service stack) for capital markets.

**Alternatives considered:**

- *Build on an existing EVM bridge:* Canton's privacy model and CIP-56 standard require native Daml integration. EVM bridges cannot provide sub-transaction privacy or Canton's Offer-Accept transfer model.
- *Wait for Canton-native BTC lending:* No Canton-native protocol has the execution speed (300ms) or liquidation infrastructure required for safe BTC-collateralized lending at scale.
- *Use CBTC as collateral base:* The 6-confirmation bottleneck structurally constrains LTVs and makes downstream carry trades less competitive. A purpose-built execution layer is required.

**Daml development partnership: IntellectEU**

Arch has selected IntellectEU as its specialist Daml development partner for Canton-side contract work across all milestones. IntellectEU is a recognized Daml ecosystem developer with Canton production experience. This converts the Daml learning curve from a team capability risk to a managed vendor relationship with defined deliverables and review gates.

**Existing ecosystem partnerships providing day-one demand:**

- Institutional custodian integrations: Anchorage, Ceffu, Utila — custody partners who will distribute aBTC vault strategies to their client bases.
- HoneyB: Active asset management partnership for BTC private credit yield strategies. The HoneyB credit carry trade (LP deposits BTC → borrow stables via Arch Lend → deploy into tradfi yield → collect yield → repatriate to BTC via Arch Swap → distribute to LPs) demonstrates the complete service stack in a single workflow.
- Institutional liquidity providers: Galaxy, Pantera — committed to seeding initial vault liquidity.
- DAT partners: Digital Asset Trusts going live with $10–20M BTC yield pilots.