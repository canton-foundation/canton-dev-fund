## Development Fund Proposal

**Author:** Hawkrel Limited (ARU / Acua Reserve Unit)
**Architect:** Christoph Richter (Co-founder, ARU)
**Website:** [www.arureserve.com](https://www.arureserve.com)
**Status:** Final
**Created:** 2026-03-14
**Champion:** Canton Foundation

*Harder than money. ARU is the reserve value backed by physical hard assets -- inflation-resilient, on-chain, and permissionless.*

---

## Abstract

ARU (Acua Reserve Unit) is a 100% physically-backed commodity reserve token anchored in a diversified basket of precious metals, industrial metals, and strategic materials held in Swiss and Singaporean custody. It is designed as an inflation-resistant, permissionless store of value with institutional-grade legal architecture and a dual-track distribution model (ERC-20 token + Swiss ETP on SIX Exchange).

Canton processes trillions in tokenized treasuries, bonds, and deposit tokens, but has no standardized infrastructure for physical commodity-backed assets. This proposal delivers open-source Daml contracts and Proof-of-Reserves verification tooling that make physically-backed commodity tokens a first-class asset type on Canton.

The deliverables are generic: any project tokenizing physical gold, silver, industrial metals, agricultural commodities, or other custodied assets can reuse the contracts and tooling. ARU (Acua Reserve Unit), a 100% physically-backed commodity reserve token targeting a Q2/Q3 2026 launch, serves as the reference deployment to validate the implementation against real custody, oracle, and settlement workflows.

---

## Specification

### 1. Objective

Canton's RWA ecosystem currently covers treasuries (DTCC), deposit tokens (JPM Coin/Kinexys), money market funds, and credit instruments. Physical commodities remain underserved despite being identified as a target asset class for the network. Castleton Commodities pairs natural gas trades on Canton via Eleox, and CBTC provides wrapped Bitcoin, but no reusable contract standard exists for physically-custodied commodity tokens with verifiable reserves.

This proposal addresses three gaps:

1. **No commodity token contract standard.** There is no Daml template for tokens representing direct beneficial ownership of physical assets held in custody. Existing token patterns on Canton assume financial instruments, not warehouse receipts or documents of title for physical goods.

2. **No Proof-of-Reserves verification module.** Institutions considering commodity-backed assets on Canton lack a standardized way to verify that on-chain token supply matches independently attested physical reserves. This requires connecting oracle price feeds (RedStone, already integrated with Canton) to custody attestation data and on-chain supply accounting.

3. **No reference implementation.** Without a working deployment against real custody and oracle infrastructure, the contracts remain theoretical. A live reference asset de-risks adoption for subsequent commodity tokenization projects.

The intended outcome is a production-ready, open-source toolkit that any team can fork and adapt to tokenize physically-custodied assets on Canton.

### 2. Implementation Mechanics

The implementation follows a **defensive-by-design** philosophy: keep the core token as simple as possible, push all complexity into surrounding modules, and require human oversight for irreversible operations. All components are open-source under Apache 2.0.

The architecture consists of five modules:

```
                        COMMODITY TOKEN INFRASTRUCTURE
                        ==============================

    ┌─────────────────────────────────────────────────────────────┐
    │                    Module 5: Management UI                  │
    │              (Operator / AP / Public views)                 │
    └────────┬──────────────────┬──────────────────┬──────────────┘
             │                  │                  │
    ┌────────▼────────┐  ┌─────▼──────────┐  ┌────▼──────────────┐
    │  Module 1:      │  │  Module 2:     │  │  Module 4:        │
    │  Commodity Token │  │  Multisig      │  │  NAV Oracle +     │
    │  (CIP-56)       │  │  Mint/Burn     │  │  Collateralization │
    │                 │  │  Controller    │  │                   │
    │  - Transfer     │  │                │  │  - RedStone       │
    │  - Balance      │  │  - 24h window  │  │  - Chainlink      │
    │  - Privacy      │  │  - N-of-M sigs │  │  - Accountable    │
    │  - No mint/burn │  │  - Batch settle│  │    (ext. PoR)     │
    └────────▲────────┘  └──┬──────▲──────┘  └────────┬──────────┘
             │              │      │                   │
             │  mint/burn   │      │ collateral check  │ NAV + PoR
             │  execution   │      │                   │ verification
             │              │      │                   │
             │         ┌────▼──────┴───────────────────▼──┐
             │         │  Module 3: AP Queue               │
             │         │                                   │
             │         │  - Mint requests (deposit USDCx)  │
             │         │  - Burn requests (lock tokens)    │
             │         │  - Request lifecycle tracking     │
             └─────────┤  - Atomic settlement              │
                       └───────────────────────────────────┘
```

**Module 1: Minimal Token Contract (CIP-56 compatible)**

A deliberately simple Daml token template implementing the CIP-56 token standard (Canton's equivalent of ERC-20), with near-zero logic in the token itself. CIP-56 compatibility ensures the token works out of the box with Canton wallets (Dfns, etc.), settlement infrastructure, and DvP workflows. The token represents a pro-rata beneficial interest in a defined basket of physical assets. It supports transfer, balance queries, and privacy-scoped visibility via Canton's sub-transaction model. Minting and burning are not embedded in the token contract; they are controlled exclusively by the multisig module (below). This separation keeps the token's attack surface minimal and its behavior predictable.

The token contract is generic: it does not encode any asset-specific logic. Whether the underlying is gold, a diversified metal basket, or agricultural commodities, the token contract is identical. Asset-specific parameters (reserve composition, NAV source, custody provider) live in configuration, not in the token.

**Module 2: Multisig Mint/Burn Controller**

All token supply changes (minting and burning) require execution through a multisig controller built on Daml's native Multiple Party Agreement pattern. Unlike EVM multisig wallets (e.g., Gnosis Safe) which are smart contracts bolted on top of a single-signer execution model, Daml's authorization model is inherently multi-party: contracts define explicit signatories, and actions only execute when all required parties have authorized them. This makes multisig a language-level primitive, not an application-level workaround.

The controller enforces:

- **24-hour settlement window.** Mint and burn requests from Authorized Participants accumulate in a queue throughout the day. At the close of each 24-hour window, a `SettlementBatch` Daml contract is created listing all pending requests, their collateral references, and the resulting supply change. The batch contract requires threshold signatures (N-of-M) from designated operator parties before it can be finalized. Once the signature threshold is met, any signer can exercise the `Finalize` choice, which atomically executes all mints and burns in the batch. This design eliminates real-time oracle dependency at the token level and gives operators time to verify that collateral has been deposited on-chain before minting.

- **Human signatures required.** Settlement of each batch requires threshold signatures from designated operator parties. No automated minting or burning occurs without human review. Each operator reviews the batch (confirming that on-chain collateral deposits match requested mints, that redemption amounts are correct) and exercises the `Sign` choice on the `SettlementBatch` contract. The Daml runtime enforces that finalization is impossible until the signature threshold is met. This is inherently safer than EVM multisig patterns because the authorization check is enforced by the ledger, not by contract logic that could contain bugs.

- **Circuit breaker by design.** The system defaults to "do nothing." If oracles report anomalous prices, a custody attestation is missing, or any operational concern arises, the multisig signers simply do not sign. No signature means no settlement means no tokens minted or burned. There is no separate pause function, no emergency admin key, no privileged address. The multisig window itself is the circuit breaker. The system can only advance when humans actively confirm that conditions are correct.

- **Auditable batch log.** Each settled batch is recorded as a Daml contract with full details: request timestamps, AP identifiers, collateral contract references, amounts, settlement signatures, and resulting supply change. Visible to designated observers (auditors, trustees) via Canton's privacy model.

**Module 3: Authorized Participant Queue**

A Daml module where registered APs submit mint and burn requests with on-Canton settlement assets:

- **Eligible settlement assets.** Minting requires the AP to deposit eligible on-Canton collateral into the queue contract. At launch, the supported settlement asset is USDCx (Circle's USDC-backed stablecoin with configurable privacy, already live on Canton). As JPM Coin (JPMD) completes its phased rollout on Canton through 2026, it will be added as a second eligible settlement asset. The module's collateral interface is generic: adding a new settlement asset requires only a configuration update specifying the asset's Daml contract type and pricing source, not a contract upgrade.

- **Mint requests (fully atomic).** AP deposits USDCx (or JPMD when available) into the queue contract and specifies the amount of commodity tokens requested. The collateral is locked in the queue contract from the moment of deposit. At settlement, the multisig batch atomically: (1) verifies the locked collateral matches the requested mint amount at current NAV, (2) transfers the collateral to the issuer, and (3) mints new commodity tokens to the AP. Because both the cash leg and the token leg are Daml contracts on Canton, the entire operation is atomic. There is no state where tokens exist without collateral or collateral is taken without tokens being issued.

- **Burn/redemption requests.** AP deposits commodity tokens into the queue contract and specifies the amount to redeem. Tokens are locked in the queue contract upon submission. At settlement, if the multisig approves, the batch atomically: (1) burns the locked tokens, and (2) transfers the corresponding USDCx/JPMD value to the AP. The physical commodity redemption process (for APs who want to take delivery of metals rather than cash) is coordinated off-chain through the custody providers, with the on-chain burn reflecting the completed redemption.

- **Request lifecycle.** Pending (collateral locked, awaiting next window), settled (batch finalized by multisig), rejected (multisig declines, collateral returned to AP), or expired (auto-cancel after configurable timeout, collateral returned). All state transitions are recorded on-ledger.

- **No backdoors.** The queue is the only entry point for supply changes. There is no admin mint function, no emergency issuance, no privileged address that bypasses the queue and multisig. If operations need to halt, the multisig signers simply stop signing.

```
                         MINT FLOW (24h settlement cycle)
                         ================================

  AP                  Queue Contract         Multisig (N-of-M)       Token
  ──                  ──────────────         ─────────────────       ─────

  1. Deposit USDCx ──────► Lock collateral
     + mint request        (pending state)
                                │
                     ┌──────────┘
                     │  ... 24h window accumulates requests ...
                     │
                     ▼
              2. Window closes ──────► SettlementBatch created
                                       (lists all pending requests)
                                              │
                                    ┌─────────┤
                                    │         │
                              3a. Operator 1: Sign ✓
                              3b. Operator 2: Sign ✓
                              3c. Operator N: Sign ✓
                                    │
                                    ▼
                              4. Threshold met
                                    │
                                    ▼
              ┌─────────────────────────────────────────┐
              │  ATOMIC FINALIZE (single Daml tx):      │
              │                                         │
              │  - Verify collateral matches NAV        │
              │  - Check PoR attestation is current     │
              │  - Transfer USDCx to issuer             │
              │  - Mint commodity tokens to AP          │
              │  - Record batch in audit log            │
              └─────────────────────────────────────────┘
```

**Module 4: NAV Oracle and Collateralization Module**

A provider-agnostic oracle module that aggregates commodity price data to calculate NAV and display the current collateralization ratio:

- **Multi-oracle support.** The module is designed to consume price feeds from at least two independent oracle providers. RedStone (already a Canton ecosystem member) and Chainlink (Canton Super Validator) are the reference integrations. The interface is generic: any provider conforming to the data shape (asset identifier, price, timestamp, source signature) can be plugged in. The module can be configured to require consensus across providers or to use a primary/fallback model.

- **External Proof-of-Reserves integration.** The module connects to external PoR verification services (Accountable is the reference integration for ARU) that independently attest reserve holdings. The PoR provider interface accepts attestation data (asset quantities, custody locations, verification timestamp, provider signature) without prescribing a specific provider. This separates the "what do we own" question (answered by the PoR provider) from the "what is it worth" question (answered by the oracle).

- **Collateralization dashboard.** A simple, real-time display showing: total reserve value (from oracle), total token supply (from on-chain data), current collateralization ratio (over/under), per-asset breakdown, and last attestation timestamp from each PoR provider. Published as a Daml contract readable by designated observers, and also surfaced via the management interface (Module 5).

- **Asset-class extensibility.** While the reference deployment covers commodity metals, the NAV oracle interface is designed to support any asset class with a reliable price feed. Future deployments could use the same module for tokenized real estate, carbon credits, or other physically-custodied assets, provided an oracle source exists.

**Module 5: Management Interface**

A simple open-source web application for token operators and Authorized Participants:

- **Operator view.** Dashboard showing pending AP requests, current settlement window status, collateralization ratio, recent batch history, and multisig signature status. Operators can review pending requests and initiate batch settlement (which then requires multisig signatures).

- **AP view.** Interface for registered APs to submit mint/burn requests, view their request history, and track settlement status.

- **Public view.** Read-only display of current NAV, collateralization ratio, reserve composition, and PoR attestation history. No authentication required.

The interface is intentionally minimal: it reads from and writes to the Daml contracts and does not embed business logic. All rules (settlement windows, multisig thresholds, queue behavior) are enforced at the contract level.

**Development approach.** Daml development will be contracted to experienced Daml engineers, with architectural oversight from Christoph Richter (Co-founder, ARU; 2x exited entrepreneur with 20+ years technical experience, including building the first DeFi Yield ETF listed on SIX Swiss Exchange via MC2 Finance). The proposing team brings commodity tokenization domain expertise; the contracted team brings Daml and Canton-specific implementation skills. The open-source repository will follow Canton community contribution standards.

### 3. Architectural Alignment

**Privacy model.** The contracts leverage Canton's sub-transaction privacy throughout. Holder positions are visible only to the holder and issuer. Reserve attestations are visible to designated observers (auditors, trustees) but not to individual holders. AP mint/redeem operations are private between the AP and issuer. Multisig settlement batches are visible to signers and auditors only. This aligns with institutional requirements for commodity trading confidentiality.

**Atomic reserve verification.** A Canton-native commodity token enables something a bridged ERC-20 cannot: atomic on-chain verification that the asset is actually 100% backed, within the same transaction context as a trade or collateral posting. When an institution accepts ARU as collateral on Canton, it can verify in the same atomic transaction that the PoR attestation is current and the collateralization ratio meets its threshold. On a public EVM chain, this verification is either impossible (the PoR data lives off-chain) or non-atomic (requires a separate oracle call that can be stale). Canton's composability model makes reserve verification a first-class participant in settlement workflows.

**Interoperability and atomic settlement.** Commodity tokens minted via these contracts can participate in Canton's atomic settlement. An institution holding a commodity token on Canton can use it as collateral in a DvP transaction with DTCC-custodied treasuries or JPM Coin, settled atomically via the Global Synchronizer. This extends Canton's collateral universe beyond financial instruments to physical assets. The mint/burn process itself is also fully atomic: the AP's collateral deposit (USDCx or JPMD) and the corresponding token issuance settle in a single Daml transaction, eliminating the settlement risk that exists in off-chain or cross-chain minting models.

**Settlement asset composability.** The AP queue accepts USDCx (live on Canton) and will support JPMD as it rolls out. Both are Daml-native assets on Canton, meaning the collateral verification and transfer happen within the same transaction as the token mint. This is a direct demonstration of Canton's atomic composability: a single transaction can verify collateral, check the oracle NAV, confirm the PoR attestation, and mint the token. No other blockchain offers this level of settlement atomicity for physically-backed assets.

**Oracle integration.** RedStone is already integrated with Canton as a foundation member. The PoR module's reference implementation connects directly to RedStone's Canton data feeds. Chainlink, as a Super Validator and strategic partner, provides an alternative oracle path.

**CIP alignment.** The commodity token implements the CIP-56 token standard, ensuring compatibility with Canton wallets, settlement infrastructure, and DvP workflows from day one. The proposal supports the development fund's stated scope of "reference implementations" and "DeFi app(s) liquidity seeding, critical infra" (CIP-0082). The commodity token contracts serve as a reference implementation for a new asset class. The PoR module is shared infrastructure reusable across any physical RWA project.

### 4. Backward Compatibility

*No backward compatibility impact.* All deliverables are new contracts and modules. No existing Canton contracts, applications, or workflows are modified. The commodity token contracts use standard Daml patterns and do not require protocol-level changes.

---

## Milestones and Deliverables

**Total project duration: 23 weeks (~5.5 months), under the 6-month threshold.**

```
  M1: Spec + Design     M2: Implementation + Testnet     M3: Mainnet + Live
  ┌────────────────┐     ┌────────────────────────────┐   ┌──────────────────┐
  │    5 weeks     │────►│        10 weeks            │──►│     8 weeks      │
  └────────────────┘     └────────────────────────────┘   └──────────────────┘
  Wk 1           5       Wk 6                      15     Wk 16           23
  250K CC paid           750K CC paid                      400K CC paid
```

### Milestone 1: Specification and Design

- **Estimated Delivery:** 5 weeks from approval
- **Focus:** Architecture, contract design, and community review.
- **Deliverables / Value Metrics:**
  - Published architecture document covering all five modules: CIP-56-compatible commodity token, multisig mint/burn controller (Daml Multiple Party Agreement pattern), AP queue with on-Canton atomic settlement, NAV oracle and collateralization module, and management interface.
  - Settlement asset specification defining the collateral interface, with USDCx as the launch settlement asset and JPMD as the planned second asset.
  - Oracle provider integration specification supporting at least two providers (RedStone and Chainlink as reference), with a generic provider interface.
  - External PoR provider integration specification (Accountable as reference), with a generic attestation interface.
  - Open GitHub repository with all specifications published for community review.

### Milestone 2: Reference Implementation and Testnet

- **Estimated Delivery:** 10 weeks after M1 acceptance
- **Focus:** Working code, testnet deployment, developer documentation.
- **Deliverables / Value Metrics:**
  - Open-source Daml contracts (Apache 2.0) implementing all five modules per M1 specifications: CIP-56 token, multisig controller, AP queue with USDCx settlement, NAV oracle with multi-provider support, and collateralization display module.
  - Reference oracle integrations for RedStone and Chainlink.
  - Reference PoR provider integration for Accountable.
  - Management interface (open-source web application) with operator, AP, and public views.
  - Canton testnet deployment demonstrating the full atomic lifecycle: AP deposits USDCx, request queued, 24-hour window closes, `SettlementBatch` created, multisig signs, batch finalized atomically (collateral transferred + tokens minted in single transaction), NAV calculated, collateralization displayed, PoR attestation published.
  - Developer documentation: setup guide, integration tutorial, module API reference, and settlement asset configuration guide.
  - Automated test suite covering core workflows, edge cases (rejected mints, expired requests, oracle disagreement, undercollateralization detection), and multisig threshold enforcement.

### Milestone 3: Mainnet Deployment and Reference Asset

- **Estimated Delivery:** 8 weeks after M2 acceptance
- **Focus:** Production deployment, live validation, ecosystem handoff.
- **Deliverables / Value Metrics:**
  - ARU live on Canton mainnet as reference commodity token. Reserve: 60% precious metals, 28% industrial metals, 12% strategic materials. Connected to production custody (BFI/Loomis Switzerland, Silver Bullion Singapore), dual oracle feeds (RedStone + Chainlink), and external PoR verification (Accountable).
  - Management interface deployed and operational against live data.
  - Public collateralization dashboard showing real-time reserve ratio, per-asset breakdown, oracle source status, and PoR attestation history.
  - Integration case study and community handoff: contribution guide, issue templates, roadmap for post-grant maintenance.

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone.
- All code published under Apache 2.0 in a public repository.
- All five modules (token, multisig, AP queue, oracle/collateralization, management interface) implemented and functional.
- Demonstrated functionality on Canton testnet (M2) and mainnet (M3), including a full atomic mint/burn cycle: AP collateral deposit (USDCx), 24-hour settlement window, Daml-native multisig approval, and atomic batch settlement.
- Multisig controller implemented using Daml's Multiple Party Agreement pattern with configurable N-of-M threshold.
- NAV oracle module consuming price data from at least two independent providers.
- External PoR integration demonstrated with at least one independent attestation provider.
- Developer documentation sufficient for an independent team to deploy a new commodity token using the contracts without direct assistance from the proposing team.
- Collateralization module correctly reflecting over/undercollateralization status against live oracle feeds.
- Management interface operational for operator, AP, and public views.
- Community feedback from M1 specification review is addressed and documented.

---

## Funding

**Total Funding Request:** 1,400,000 CC (approximately $200,000 at current CC/USD rate of ~$0.145)

### Payment Breakdown by Milestone

- Milestone 1 (Specification and Design): 250,000 CC upon committee acceptance
- Milestone 2 (Reference Implementation and Testnet): 750,000 CC upon committee acceptance
- Milestone 3 (Mainnet Deployment and Reference Asset): 400,000 CC upon final release and acceptance

### Volatility Stipulation

The project duration is **under 6 months** (estimated 23 weeks). Per CIP-0100, milestones are fixed in Canton Coin terms. Should the project timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones will be renegotiated to account for significant USD/CC price volatility.

### Cost Breakdown

The funding covers:

- Contracted Daml development: core contracts, multisig controller, AP queue, oracle module (estimated 50-60% of total).
- Management interface development: operator, AP, and public views (estimated 15-20%).
- Oracle and PoR provider integration engineering (RedStone, Chainlink, Accountable).
- Documentation, testing, and community engagement.
- Infrastructure costs (testnet/mainnet deployment, CI/CD, monitoring).

ARU's own operational costs (custody fees, compliance, business development) are funded separately and are not included in this request. The grant funds exclusively the open-source common-good deliverables.

---

## Co-Marketing

Upon release, the implementing entity will collaborate with the Foundation on:

- Joint announcement of the first physically-backed commodity token on Canton, positioning Canton as a multi-asset-class institutional settlement network.
- Technical blog post walking through the commodity token architecture and its relevance to Canton's institutional RWA thesis.
- Developer-focused case study showing how to deploy a new commodity token using the open-source contracts.
- Presentation at a Canton ecosystem event or webinar demonstrating the PoR verification workflow.
- Co-branded materials highlighting Canton's expansion from financial instruments to physical commodity assets.

---

## Motivation

Canton's value proposition to institutional finance rests on being the settlement network where regulated assets move atomically with privacy. Today, that asset universe is weighted toward financial instruments: treasuries, bonds, money market funds, deposit tokens. Physical commodities represent a multi-trillion-dollar asset class that institutions already trade, hedge, and hold as collateral, but Canton has no standardized infrastructure to support them.

Adding a reusable commodity token primitive expands Canton's addressable market:

- **Atomic reserve verification.** Canton becomes the only network where an institution can verify that a commodity-backed asset is fully collateralized within the same atomic transaction that settles a trade. This is not possible on public EVM chains, where PoR data is either off-chain or non-atomic. It is a unique capability that strengthens Canton's value proposition for any asset class requiring proof of backing.

- **Collateral diversification.** Institutions using Canton for repo and settlement gain access to commodity collateral alongside existing financial instruments. A fund holding tokenized gold on Canton can post it as margin in the same atomic transaction that settles a treasury trade.

- **New institutional participants.** Commodity trading firms, mining companies, and physical commodity funds currently have no on-ramp to Canton. A standardized commodity token lowers the barrier.

- **Network activity.** Each commodity token deployment generates ongoing Canton network activity: daily NAV calculations, periodic rebalancing, AP mint/redeem operations, and PoR attestations all consume Canton bandwidth and contribute to the CC burn-mint equilibrium.

- **Ecosystem completeness.** Canton's stated vision includes commodities as a target asset class. This proposal delivers the infrastructure to realize that vision with production-grade tooling.

The PoR verification module has independent value beyond commodity tokens. Any Canton project involving physically-custodied assets (real estate, art, wine, carbon credits) can adapt the attestation pipeline.

---

## Rationale

**Why Daml-native contracts, not a bridge?** Wrapping an ERC-20 commodity token onto Canton via a cross-chain bridge would be faster but defeats the purpose. Canton's value is sub-transaction privacy, atomic settlement, and institutional-grade compliance, none of which survive a bridge.

More importantly, a Canton-native commodity token enables **atomic reserve verification**: within the same transaction where an institution accepts the token as collateral or settles a trade, it can verify that the asset is actually 100% backed. The PoR attestation, oracle NAV, and collateralization ratio are all Daml contracts composable in the same atomic transaction. On a public EVM chain, this verification is either impossible (PoR data lives off-chain), non-atomic (separate oracle call that can be stale), or trust-dependent (relying on a single oracle with no fallback). Canton's composability model makes reserve verification a first-class settlement primitive, not an afterthought.

The same atomicity applies to the minting process itself. An AP depositing USDCx or JPMD to mint commodity tokens executes a single Daml transaction: collateral deposit, NAV verification, and token issuance are inseparable. A bridged ERC-20 cannot offer this because the cash leg and the token leg live on different ledgers with different finality guarantees. This is the core reason to build natively rather than bridge.

**Why open-source commodity contracts, not a proprietary deployment?** The development fund exists to fund common goods. A proprietary ARU deployment would benefit one project. Open-source contracts that any commodity tokenizer can reuse benefit the ecosystem. ARU as reference deployment validates the contracts; the contracts themselves are the deliverable.

**Why ARU as the reference asset?** A reference implementation without a live deployment is theoretical. ARU brings production-ready custody relationships (BFI/Loomis, Silver Bullion), existing oracle integrations (RedStone, already on Canton), an independent PoR/NAV agent (Accountable), and $20M+ in committed institutional AUM from EU family offices. The architect, Christoph Richter, previously built the first DeFi Yield ETF listed on SIX Swiss Exchange and brings direct experience in bridging traditional financial infrastructure with on-chain systems. This is not a testnet demo; it is a live commodity token with real assets, real custody, and real institutional capital validating the contracts in production.

**Why the defensive-by-design approach?** Even though the collateral (USDCx/JPMD) settles atomically on Canton, the 24-hour settlement window with multisig oversight remains essential. The commodity tokens represent claims on physical metals in custody. The oracle prices used to calculate NAV, the PoR attestations from custody providers, and the collateralization ratio all need human verification before new tokens enter circulation. An automated instant-mint system would trust oracle data and PoR attestations programmatically, creating risk from stale data, oracle manipulation, or custody discrepancies. The settlement window gives operators time to cross-reference on-chain data against off-chain reality (custody confirmations, metal shipment tracking, market anomalies) before authorizing the batch. The multisig itself serves as a natural circuit breaker: if anything is wrong, the signers simply do not sign, and the system stays in its safe default state. No separate pause mechanism, no emergency admin key, no privileged address. This is a feature, not a limitation. It keeps the core token contract maximally simple while ensuring that the link between on-chain tokens and physical assets remains human-verified.

**Alternatives considered:**

- *Pure specification without implementation:* Rejected. Canton's value is in operational infrastructure, not paper standards. The ecosystem needs working code.
- *Single-asset (gold-only) token:* Rejected as too narrow. The contracts support both single-asset and multi-asset baskets, making them useful for a wider range of commodity tokenization projects.
- *Automated real-time minting:* Rejected. Physical assets do not settle instantly. Automated minting creates a backing gap between token issuance and physical delivery. The 24-hour settlement window with multisig oversight is the operationally safe choice for any physically-backed asset. It also eliminates the need for a separate circuit breaker mechanism: if anything is wrong, the signers do not sign, and the system remains in its safe default state.
- *Single oracle provider:* Rejected. Dependence on a single price feed is a single point of failure for collateralization verification. Multi-provider support with consensus or fallback logic is the minimum standard for institutional-grade infrastructure.
- *EVM compatibility layer:* Canton's EVM compatibility efforts are separate. This proposal builds native Daml infrastructure that leverages Canton's privacy, composability, and atomic verification model directly.
