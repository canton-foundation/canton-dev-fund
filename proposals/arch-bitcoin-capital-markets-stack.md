# Development Fund Proposal

## Arch-Canton Bridge and BTC Developer SDK

Author: Arch Network (Matt Mudano)

Daml Development Partner: IntellectEU

Status: Draft

Created: 2026-04-01

Label: dapp-integration

Champion: Canton Foundation

Total Funding Request: $125,000 USD (payable in CC equivalent)

## Abstract

This proposal requests $125,000 to build two public good infrastructure components that connect Bitcoin's $2T+ asset class to Canton Network:

- **Arch-Canton Bridge** - a bidirectional, fee-free, open source bridge that mints CIP-56-compliant aBTC on Canton, enabling BTC holders to access Canton's institutional ecosystem and Canton participants to access Bitcoin liquidity.

- **BTC Developer SDK** - a Daml integration layer with typed bindings, allowing any Canton developer to access Arch's BTC-native protocols (lending, yield, prime brokerage) directly from Daml contracts without building on the Bitcoin side themselves.

Both components are open, permissionless infrastructure available to any Canton participant at no cost. The $125K budget covers Canton-side Daml contract development, bridge relayer integration, SDK development, testing, security audit, and documentation. All work will be executed by IntellectEU, a specialist Daml development firm with Canton production experience. Grant funding is used exclusively for these two public goods components. Arch Network separately operates commercial products (Arch Swap, Arch Lend, Arch Prime) at its own cost; the SDK provides open access to these protocols but no grant funds are used to build, operate, or market them.

The underlying Arch-side infrastructure (consensus, execution, settlement) is already built and deployed. This proposal funds only the Canton integration layer.

## Specification

### 1. Objective

Connect Bitcoin's $2T+ asset class to Canton's $9T+ institutional ecosystem through two foundational infrastructure primitives, positioning Arch as a BTC infrastructure gateway for Canton. Specifically:

- **Bridge a gap in programmable BTC access.** Canton has CBTC for custodial BTC holding, but no programmable bridge with execution capabilities. The Arch-Canton Bridge provides bidirectional BTC movement with 300ms execution, enabling BTC capital to flow into Canton's DvP settlement, lending, and yield infrastructure, and Canton participants to access Bitcoin-native liquidity.

- **Give Canton developers access to BTC-native protocols.** Canton developers who need BTC-collateralized lending, BTC yield strategies, or Bitcoin prime brokerage in their applications currently have no way to access Bitcoin-native infrastructure from Daml. The BTC Developer SDK provides typed Daml bindings to Arch's protocols, so any Canton participant can integrate BTC primitives without building on the Bitcoin side themselves.

### 2. Implementation Mechanics: Arch-Canton Bridge

The bridge uses a relayer-based architecture with FROST threshold signatures for security.

**Bridge mechanics:**

- **Arch to Canton:** User locks BTC on Arch. Validators produce a signed attestation. Relayer transmits to Canton. Canton bridge contract verifies and mints CIP-56 aBTC via Offer-Accept protocol.

- **Canton to Arch:** User transfers aBTC to bridge contract. Bridge burns aBTC and emits withdrawal attestation. Relayer transmits to Arch. Validators construct and sign Bitcoin unlock transaction. User receives native BTC.

- **Security:** (⌈2N/3⌉ + 1)-of-N FROST threshold signatures, per-epoch volume caps, emergency pause, reorg handling via DAG-based transaction tracking and UTXO anchoring.

- **Relayer model:** Permissionless. Any party can relay valid attestations. Minimum 3 independent operators recommended.

**aBTC token (CIP-56):**

- CIP-56 compliant, 8 decimals (matching BTC), mint authority restricted to bridge contract only.

- Configurable transfer restrictions (KYC, jurisdictional, accredited investor checks), regulatory observer support.

- Dual-oracle design (RedStone primary, Chainlink secondary), 5-minute staleness threshold, 2% divergence handling, 10-minute TWAP, circuit breaker.

**Public good characteristics:**

- Free and open source. Arch does not charge fees for bridging, minting, or burning aBTC.

- Reusable reference architecture. Other networks can adapt the bridge design to build their own Canton bridges.

- Bidirectional value flow. BTC holders gain access to Canton's tokenized asset ecosystem; Canton participants gain access to Bitcoin liquidity.

### 3. Implementation Mechanics: BTC Developer SDK

A Daml integration layer that gives Canton developers typed access to Arch's BTC-native protocols through the bridge. The SDK turns Arch into a BTC primitives provider for the Canton ecosystem: any participant who needs BTC-collateralized lending, BTC yield, or Bitcoin prime brokerage can call Arch's protocols from Daml contracts via standardized APIs.

**SDK components:**

- Daml bindings for Arch Lend (BTC-collateralized lending), Arch Prime (institutional portfolio and prime brokerage), and bridge operations (mint/burn aBTC).

- Typed API wrappers: loan terms, collateral ratios, yield positions, bridge status, aBTC balances.

- Composability: SDK calls can be embedded in existing Canton workflows, enabling BTC operations within DvP settlement, collateral management, and other Daml-native applications.

**Reference integration:**

- A reference Canton application demonstrating a BTC-collateralized loan and yield position executed entirely from Daml via the SDK.

- The SDK is protocol-agnostic on the Canton side. Any Daml application can call Arch's BTC primitives through the typed bindings.

**Public good characteristics:**

- Open source SDK published on GitHub with permissive license. Any Canton developer can use it.

- Removes the need for Canton developers to understand Bitcoin infrastructure. BTC primitives become callable from Daml like any other Canton service.

- Positions Canton as a distribution layer for Bitcoin-native financial services, expanding the use cases available to Canton participants.

### 4. Architectural Alignment

Both components align with Canton's architecture and ecosystem priorities:

- **CIP-56 compliance:** aBTC is a native CIP-56 token, fully compatible with Canton's Offer-Accept transfer model, sub-transaction privacy, and regulatory observer framework.

- **DvP settlement:** aBTC settles atomically via the Global Synchronizer. SDK-initiated operations (loans, yield positions) settle on Arch with results reflected on Canton through the bridge.

- **Daml-native:** Bridge contracts and SDK bindings are implemented in Daml, leveraging Canton's smart contract model and privacy guarantees.

- **Credential Utility compatible:** aBTC holder requirements and SDK access controls integrate with DA's existing Credential Utility for KYC/AML enforcement.

- **Registry Utility compatible:** Once minted, aBTC participates in DA's Registry Utility workflows (transfer, allocation, settlement) with no custom integration required.

### 5. Backward Compatibility

No backward compatibility impact. Both components are additive:

- aBTC is a new CIP-56 token. Does not modify existing token contracts or standards.

- The BTC Developer SDK is a new integration layer. Does not change existing Daml contracts.

- The bridge introduces new contracts (BridgeController, DepositAttestation, MintAuthority, WithdrawalRequest) and the SDK adds typed Daml bindings. Both interact with Canton via standard CIP-56 mechanics.

## Ecosystem Benefits (Not Grant-Funded)

The bridge and SDK enable downstream use cases available to builders and participants in the Canton ecosystem which can be accessed via APIs.

- **BTC financial services.** BTC/stablecoin liquidity/swaps (Arch Swap) and BTC-collateralized lending (Arch Lend) accessible to Canton participants via the SDK.

- **Institutional yield.** Existing partnerships (HoneyB, Pantera, DAT partners, Anchorage, Maple with $10–20M pilots) provide ready demand for BTC yield on Canton.

- **BTC capital markets and collateral.** aBTC's CIP-56 compliance makes it eligible for listing in DA's Registry Utility and use in the Collateral Utility, enabling BTC-denominated securities subscriptions and collateral in margin agreements.

## Committed Reference Implementation: HoneyB

HoneyB, a BTC-native asset management firm, has committed to using the Arch-Canton bridge and BTC Developer SDK as the infrastructure layer for bringing Bitcoin yield products to Canton. This is not a hypothetical use case — HoneyB is an active Arch ecosystem partner already building BTC private credit strategies on Arch's lending infrastructure. HoneyB has also established a partnership with a fixed income ETF provider with a 15-year track record and $15 billion in AUM, led by an ex-PIMCO fixed income team, to bring traditional fixed income yield strategies to Bitcoin holders. Their commitment to Canton integration provides an immediate, real-world reference implementation from day one.

**What this means for Canton:** Once the bridge and SDK ship, HoneyB will use them to offer BTC yield strategies — including private credit, structured lending products, and traditional fixed income strategies sourced through their institutional ETF partnership — directly to Canton participants via aBTC. This brings a unique convergence to Canton: institutional-grade tradfi yield expertise (backed by a team with a 15-year track record managing $15B in fixed income) paired with Bitcoin-native infrastructure. Canton's institutional ecosystem gains not just a new asset class (BTC yield), but a bridge between traditional fixed income and digital assets, without any Canton participant needing to interact with Bitcoin infrastructure directly. HoneyB's integration adds a live, revenue-generating application to the Canton ecosystem that would not exist without the grant-funded public goods.

**Why this matters for the proposal:** A committed reference implementation de-risks the grant. The bridge and SDK are not speculative infrastructure waiting for adoption — they have a confirmed first user with an active business ready to deploy on Canton as soon as the integration is live. This accelerates time-to-value for the Canton ecosystem and demonstrates that the public goods funded by this grant will generate immediate, tangible ecosystem activity.

HoneyB's integration is commercially operated and funded entirely by Arch and HoneyB — no grant funds are used. It is listed here because it validates the infrastructure this proposal builds and provides the Canton Foundation with confidence that the grant-funded components will see real usage upon delivery.

## Milestones and Deliverables

All milestones cover Canton-side Daml integration work only. The underlying Arch primitives (consensus, execution, settlement) are already built and deployed. IntellectEU will lead Daml contract development across all milestones.

### Milestone 1A: Bridge Testnet Delivery

| | |
|---|---|
| **Delivery** | Q2 2026 (April–May) |
| **Funding** | $50,000 |
| **Focus** | Bridge design, Daml contract development, aBTC token deployment on testnet, relayer prototype |

Deliverables:

- **Bridge design specification.** Published technical document covering architecture, security model, message format, and failure modes. Reviewed by at least one independent Daml ecosystem developer.

- **Daml bridge contracts.** BridgeController, DepositAttestation, MintAuthority, WithdrawalRequest implemented with >90% unit test coverage. Source code published on GitHub. Reviewed by IntellectEU.

- **Arch-side lock/burn contracts.** UTXO-based contracts deployed on Arch testnet with passing integration tests.

- **aBTC CIP-56 token.** Compliant token contract with compliance hooks, transfer restrictions, and DvP support. Deployed on Canton testnet. Passes Canton token standard conformance tests.

- **Relayer prototype.** Functional relayer transmitting attestations between Arch testnet and Canton testnet. At least 100 successful cross-chain transfers demonstrated.

- **Integration tests.** End-to-end tests (Arch deposit to Canton mint, Canton burn to Arch unlock). Minimum 50 test cases covering normal and failure paths. Test suite published.

- **Documentation.** Developer guide for bridge integration. aBTC token specification. Published on GitHub with README and quickstart.

### Milestone 1B: Bridge Mainnet Readiness

| | |
|---|---|
| **Delivery** | Q2–Q3 2026 (June–July) |
| **Funding** | $50,000 |
| **Focus** | Bridge security audit, mainnet deployment, aBTC mainnet launch |

Deliverables:

- **Bridge security audit.** Third-party audit by a recognized firm (Certora, Trail of Bits, or equivalent). 0 critical findings, 0 unresolved high findings. Audit report published publicly.

- **Bridge mainnet deployment.** Contracts deployed on Arch mainnet and Canton mainnet. Relayer operational with uptime monitoring and alerting. At least 10 mainnet bridge transfers processed.

- **aBTC mainnet launch.** aBTC live on Canton mainnet, mintable via bridge. At least one institutional participant has minted aBTC.

- **Documentation.** Bridge operational runbook, aBTC integration guide. Published on GitHub.

### Milestone 2: BTC Developer SDK

| | |
|---|---|
| **Delivery** | Q3 2026 (July–August) |
| **Funding** | $25,000 |
| **Focus** | SDK development, Daml bindings for Arch protocols, reference integration, documentation |

Deliverables:

- **BTC Developer SDK.** Typed Daml bindings for Arch Lend, Arch Prime, and bridge operations. Published on GitHub with permissive open source license. Reviewed by IntellectEU.

- **Reference integration.** Reference Canton application demonstrating a BTC-collateralized loan and yield position via SDK. Functional on Canton testnet with >90% unit test coverage. Reviewed by IntellectEU.

- **End-to-end integration test.** Canton application executes a BTC-collateralized loan and uses proceeds in a DvP settlement with another CIP-56 asset on Canton testnet. Documented with transaction logs.

- **Documentation.** SDK developer guide with API reference and integration examples. Published on GitHub.

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone.

- Demonstrated functionality or operational readiness.

- Documentation and knowledge transfer provided.

- Security audit results (Milestone 1B): 0 critical, 0 unresolved high findings.

- Mainnet operational status (Milestone 1B): bridge operational, aBTC mintable.

- SDK delivery (Milestone 2): BTC Developer SDK published on GitHub with documentation and reference integration.

## Funding

**Total Funding Request:** $125,000 USD (payable in CC equivalent)

This budget covers Canton-side Daml contract development by IntellectEU, bridge relayer integration, SDK development, security audit, testing, and documentation. All underlying Arch primitives are already built and funded by Arch Network independently. No grant funds are used to build, operate, or market Arch's commercial products (Arch Swap, Arch Lend, Arch Prime), which Arch develops and maintains at its own cost.

### Payment Breakdown

| Milestone | Amount | Timeline |
|---|---|---|
| M1A: Bridge Testnet Delivery | $50,000 | Q2 2026 |
| M1B: Bridge Mainnet Readiness | $50,000 | Q2–Q3 2026 |
| M2: BTC Developer SDK | $25,000 | Q3 2026 |
| **Total** | **$125,000** | |

### Volatility Stipulation

Should the project timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility.

## Co-Marketing

Upon release, Arch Network will collaborate with the Foundation on:

- Announcement coordination

- Case study or technical blog

- Developer or ecosystem promotion

## Motivation

Canton hosts over $9 trillion in tokenized assets and processes approximately $350 billion in daily volume. Institutional participants, including Goldman Sachs (DAP), Broadridge (DLR), and Versana, use Canton for compliant, privacy-preserving financial operations.

Canton's connection to Bitcoin, a $2T+ asset class and the most widely held digital asset among institutions, remains underdeveloped. While CBTC provides custodial wrapped BTC on Canton, there is no programmable bridge to Bitcoin-native infrastructure with execution capabilities, and no way for Canton developers to access BTC-native protocols (lending, yield, prime brokerage) from Daml.

These gaps mean Canton participants who hold BTC, or whose clients hold BTC, cannot put that capital to work within Canton's compliance framework. Arch Network's existing BTC infrastructure (DEX, lending, prime brokerage) already serves this market on the Bitcoin side; this proposal funds the Canton integration that makes those capabilities accessible to Canton participants.

This proposal addresses these gaps with two open infrastructure components:

- **The Arch-Canton Bridge** is free, open source bridging infrastructure. Arch does not charge fees for bridging, minting, or burning aBTC. The bridge is a reusable reference architecture that other networks can adapt to build their own Canton bridges.

- **The BTC Developer SDK** is an open source integration layer. Any Canton developer can access Arch's BTC protocols (lending, yield, prime brokerage) from Daml contracts through typed bindings, without building on the Bitcoin side themselves.

Once these public goods exist, they enable commercially viable use cases that Arch Network already operates at its own cost, with no grant funding: BTC/stablecoin trading (Arch Swap), BTC-collateralized lending (Arch Lend), and institutional yield strategies (HoneyB partnership, Galaxy and Pantera liquidity commitments, $10-20M DAT pilots). These are Arch's commercial products, not public goods. Arch's revenue from operating them creates a direct financial incentive to maintain the public goods layer long after the grant term ends.

## Rationale

**Why Arch Network:**

Arch Network is an $18M-funded Bitcoin infrastructure company with a 20-person team that has been building for over 2.5 years. The team has delivered a production-grade blockchain with BFT consensus, 300ms blocks, and approximately 1,000 TPS; a Bitcoin-native DEX (Arch Swap); a credit and lending protocol (Arch Lend); and an institutional portfolio dashboard (Arch Prime).

**Why not CBTC alone:**

CBTC serves BTC custody and holding on Canton. It does not support programmable lending, vault strategies, or capital markets integration. CBTC requires 6 Bitcoin confirmations (approximately 60 minutes) for issuance or redemption, creating a collateral enforcement bottleneck that constrains safe loan-to-value ratios to 25-30%. Arch's 300ms execution eliminates this bottleneck, enabling higher LTVs and more capital-efficient credit markets. CBTC and aBTC are complementary: CBTC for custody, aBTC for capital markets.

**Why a dedicated bridge rather than an existing EVM bridge:**

Canton's privacy model and CIP-56 standard require native Daml integration. EVM bridges cannot provide sub-transaction privacy or Canton's Offer-Accept transfer model.

**Daml development partner: IntellectEU**

Arch has selected IntellectEU as its specialist Daml development partner for Canton-side contract work across all milestones. IntellectEU is a recognized Daml ecosystem developer with Canton production experience.

**Existing ecosystem partnerships:**

- **Institutional custodians:** Anchorage, Ceffu, Utila, providing custody and distribution for aBTC strategies on Canton.

- **HoneyB:** Active asset management partnership for BTC private credit yield strategies, with an established partnership with a fixed income ETF provider ($15B AUM, 15-year track record, ex-PIMCO team) bringing tradfi yield to Bitcoin holders.

- **Institutional liquidity providers:** Galaxy, Pantera, committed to seeding initial liquidity.

- **DAT partners:** Digital Asset Trusts going live with $10-20M BTC yield pilots.
