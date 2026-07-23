Development Fund Proposal

Author: Margarita Finance (margarita.finance)
Status: Draft  
Created: 2026-04-10  
Label: defi-liquidity

Champion: Melvis Langyintuo

---

Abstract

Margarita Finance proposes to deploy CC20 — a Canton Coin-denominated agentic yieldcoin 
targeting ~20% APY — on the Canton Network. CC20 tokenizes an institutional-grade revolving 
covered call strategy on CC/USDC into a permissionless, DEX-tradeable yield token. The 
strategy is executed via multi-counterparty RFQ with Tier 1 institutional market makers, 
managed by an regulated portfolio manager, and settled via a bankruptcy-remote Luxembourg 
SPV. Margarita Finance has deployed this infrastructure for NEAR20 (NEAR 
Protocol) with foundation-backed liquidity and SOL20 with Solana backed liqudity coming next. CC20 brings the same battle-tested 
yield infrastructure natively to Canton, creating a flagship DeFi yield primitive for the 
Canton Coin economy.

---

Specification

1. Objective

Canton currently lacks a native, on-chain yield product for CC holders. CC holders have no 
passive yield mechanism denominated in their native token. This proposal delivers CC20: a 
Canton-native yieldcoin that generates yield by running a systematic and propriatory covered call strategy 
on CC with institutional market makers, wrapping the accrued option premium into a 
continuously appreciating token. The target APY is ~20% based on backtesting and market 
maker quotes; this is a target, not a guarantee. CC20 gives the Canton ecosystem its first 
institutional-grade yield primitive — composable, permissionless at the DEX layer, and 
compliant at the issuance layer.

2. Implementation Mechanics

Strategy: Daily rebalancing into weekly ATM covered calls on CC. Each day, 1/5th 
tranche of the NAV is deployed into a fresh 1-week option position. Competitive quotes are 
collected from multiple Tier 1 institutional market makers (including STS Digital, GSR, and 
others) via multi-counterparty RFQ. The best execution is selected by the regulated 
portfolio manager. Collected option premium accrues daily 
into the CC20 token's NAV.

Tokenization: CC20 is issued by a Luxembourg bankruptcy-remote SPV as independent Portfolio Manager and 
Calculation Agent. Margarita Finance acts as product sponsor — providing strategy parameters, 
smart contract infrastructure, and agentic operational tooling. Assets are held in Fireblocks 
institutional custody. Trade execution and counterparty selection are fully independent of 
Margarita Finance.

On-chain Settlement: CC20 smart contracts are deployed on Canton. Token mints and burns 
are publicly verifiable on-chain. NAV is calculated daily by Verified Assets Limited and 
published as a price feed. Investors hold CC20 tokens whose price reflects the growing 
strategy NAV; yield accrues continuously into the token price with no fixed maturity.

DEX Access: CC20 tokens are distributed to qualified investors via the permissioned 
issuance layer (KYC at SPV level) and made available permissionlessly on Canton-compatible 
DEX infrastructure for secondary trading. This dual-layer structure — permissioned issuance, 
permissionless secondary — replicates the architecture proven with SOL20 on Raydium and 
NEAR20 on RHEA Finance.

Agentic Operations: Operational workflows (RFQ issuance, on-chain product minting, NAV 
reporting) are automated via an agent-powered backend. AI is not used in investment 
decision-making or portfolio management, which remains the exclusive domain of Verified 
Assets Limited.

 3. Architectural Alignment

CC20 aligns directly with Canton's architecture and ecosystem priorities:

- Privacy-preserving settlement: Canton's native privacy model is well-suited to 
  institutional OTC derivative workflows, where trade-level confidentiality is a requirement 
  for Tier 1 market maker participation. CC20's settlement layer benefits from and 
  demonstrates Canton's privacy primitives in a live financial product.
- Financial-grade composability: Canton is designed for institutional financial 
  workflows. CC20 is a production financial instrument — not a prototype — bringing 
  real institutional capital flows and regulated infrastructure onto Canton rails.
- DeFi liquidity: CC20 creates the first sustainable, non-inflationary yield source 
  denominated in CC. This is foundational for DeFi composability: yield-bearing CC20 can 
  serve as collateral, be integrated into lending protocols, and attract external liquidity 
  to the Canton ecosystem.
- CIP alignment: CIP-0082 explicitly targets "DeFi app(s), liquidity seeding, and 
  critical infrastructure." CC20 fulfills all three: it is a live DeFi application, seeds 
  CC liquidity via institutional market maker participation, and provides reusable 
  tokenization infrastructure for future Canton-native yield products.

 4. Backward Compatibility

No backward compatibility impact. CC20 is a net-new smart contract deployment and DEX 
liquidity pool. No existing Canton contracts, integrations, or workflows are modified.

---

 Milestones and Deliverables

 Milestone 1: Smart Contract Deployment & Audit

- Estimated Delivery: 3 weeks post-approval  
- Focus: Deploy and independently audit CC20 smart contracts on Canton testnet  
- Deliverables / Value Metrics:  
  - CC20 token contract deployed on Canton testnet  
  - Independent security audit completed (Hacken, consistent with existing MF audit 
    engagement)  
  - Audit report published publicly  
  - Contract addresses and deployment documentation published  

 Milestone 2: Market Maker Integration & Strategy Go-Live

- Estimated Delivery: 5 weeks post-approval  
- Focus: Connect CC covered call RFQ workflow to Canton settlement; first live 
  strategy cycle executed  
- Deliverables / Value Metrics:  
  - Minimum 2 institutional market makers quoting CC covered calls via RFQ  
  - NAV price feed live and publicly accessible  
  - Luxembourg SPV compartment activated for CC20 issuance
  - First weekly option cycle executed and settled  

 Milestone 3: Mainnet Launch & DEX Liquidity

- Estimated Delivery: 6 weeks post-approval  
- Focus: CC20 live on Canton mainnet with permissionless DEX access and seeded liquidity  
- Deliverables / Value Metrics:  
  - CC20 deployed on Canton mainnet  
  - DEX liquidity pool launched with seed liquidity  
  - Permissionless secondary market trading live  
  - Technical documentation and integration guide published for Canton developers  

---

 Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone  
- Demonstrated functionality or operational readiness  
- Documentation and knowledge transfer provided  
- Alignment with stated value metrics  

Project-specific conditions:

- Security audit report must be from an independent, qualified auditor with findings 
  addressed or formally acknowledged  
- NAV price feed must be live, and updated at minimum daily  
- Market maker participation must include minimum 2 independent Tier 1 counterparties  
- DEX liquidity pool must demonstrate active trading on Canton mainnet  
- All on-chain activity (mints, burns, NAV updates) must be publicly verifiable  

---

 Funding

Total Funding Request: 200,000.00 CC

*Note: Margarita Finance requests that the Committee provide guidance on benchmark CC 
amounts for comparable infrastructure proposals, as CC/USD rate at time of award will 
affect real-value calibration.*

 Payment Breakdown by Milestone

- Milestone 1 — Smart Contract Deployment & Audit: 100,000.00 CC upon committee acceptance  
- Milestone 2 — Market Maker Integration & Strategy Go-Live: 50,000.00 CC upon committee 
  acceptance  
- Milestone 3 — Mainnet Launch & DEX Liquidity: 50,000.00 CC upon final release and acceptance  

 Volatility Stipulation

Project duration is under 2 months. Should the project timeline extend beyond 2 months 
due to Committee-requested scope changes, any remaining milestones must be renegotiated 
to account for significant CC price volatility.

---

 Co-Marketing

Upon mainnet launch, Margarita Finance will collaborate with the Canton Foundation on:

- Joint announcement coordinated with Canton Foundation communications  
- Technical blog post covering the CC20 architecture, strategy mechanics, and Canton 
  integration  
- Inclusion of CC20 in Margarita Finance's ecosystem partner communications across 
  Solana Foundation, NEAR Foundation, and other active partnerships  
- Developer documentation published to Canton ecosystem resources  
- Margarita Finance will reference Canton Network in all CC20 investor-facing materials  

---

 Motivation

Canton Coin currently has no native yield product. CC holders who wish to earn yield on 
their position must bridge assets off-chain or accept custodial risk in CEX staking 
programs. This is a structural gap: without a native yield primitive, CC has limited DeFi 
composability and reduced attractiveness as a reserve or treasury asset for protocols and 
institutions building on Canton.

CC20 fills this gap with a production-grade solution backed by a track record: Margarita 
Finance's x20 yieldcoin infrastructure is live on Solana (SOL20) and NEAR Protocol 
(NEAR20), with foundation-backed liquidity and institutional market maker 
participation. The underlying strategy — revolving covered calls executed via multi-dealer 
RFQ — has been backtested across market cycles and is managed by Verified Assets Limited, 
an FCA-regulated portfolio manager.

For the Canton ecosystem, CC20 delivers: a non-inflationary CC yield source for holders 
and protocols; a flagship DeFi application demonstrating Canton's suitability for 
institutional financial products; and reusable tokenization infrastructure that can 
support future Canton-native yield instruments across additional asset classes.

---

 Rationale

The covered call yieldcoin structure is the preferred approach for three reasons:

Proven infrastructure. SOL20 and NEAR20 are live, not prototypes. The smart contracts, 
SPV structure, regulated portfolio manager relationship, and market maker network are 
operational. Deploying CC20 is an extension of proven infrastructure to a new chain, not 
a greenfield build.

Institutional-grade compliance. The Luxembourg SPV / regulated PM structure 
provides a compliance layer that pure DeFi yield approaches cannot. This is important for 
Canton, which explicitly targets institutional adoption. CC20 is the yield product 
institutions can hold without regulatory ambiguity.

Sustainable yield mechanics. Unlike liquidity mining or inflationary reward schemes, 
covered call premium is a real economic return derived from market maker demand for 
options exposure. The yield does not dilute CC supply and is not dependent on protocol 
token emissions. This makes CC20 a durable, market-driven yield source rather than a 
temporary incentive program.

Alternative approaches considered: (1) staking rewards — rejected as inflationary and 
not Canton-native; (2) lending protocol yield — rejected as dependent on borrower demand 
and not yet available on Canton at scale; (3) cross-chain yield bridging — rejected as 
introducing unnecessary bridge risk. The covered call yieldcoin approach delivers 
sustainable, compliant, Canton-native yield with the lowest implementation risk given 
existing infrastructure.
