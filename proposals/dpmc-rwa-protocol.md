**Proposal Title:** DPMC – Bridging Idle Stablecoins to Real-World Asset Yield

**Proposal Type:** RWA Protocol

**Requested Amount:** $150,000 USD equivalent in USDC/T

**Proposer information**  
- Name: Vadim Zolotokrylin (GitHub: @zolotokrylin) / DPMC Team  
- Email / Contact: <admin@dpmc.io>  
- Previous work: https://holdex.io/portfolio
- Affiliation: Canton Node Validator
- GitBook: https://dpmcdefi.gitbook.io/dpmc-litepaper

**Project Summary**  
DPMC activates ~75% of idle stablecoin supply (> $185B of the $250B+ market) by channeling on-chain liquidity into Australian commercial real estate — a historically stable, income-generating real-world asset class. Through on-chain yield distribution from real rental cash flows, the protocol delivers predictable, asset-backed returns to DeFi participants while providing efficient financing to traditional sectors.  
All core components will be open-source to enable reuse across the ecosystem.

**Objective and Scope**  
**What specific problem are you solving?**  
Approximately 75% of stablecoins remain dormant or in low-yield positions, representing massive capital inefficiency in DeFi. Traditional high-quality yield sources (e.g. commercial real estate) remain inaccessible to most due to high barriers (capital minimums, illiquidity, jurisdiction). This creates a structural disconnect between abundant on-chain liquidity seeking yield and proven real-economy cash flows.

**What is the objective of this proposal?**  
Build and launch DPMC — an open protocol that:  
- Accepts stablecoin deposits  
- Allocates capital to Australian commercial real estate
- Obtain +10% yield from lending 
- Distributes real-world rental yield on-chain  
- Establishes a reusable model for secure RWA yield integration in DeFi  

**What is explicitly in scope?**  
- Core smart contracts (vault, allocation, yield distribution, governance)  
- Reference tokenization pipeline for Australian commercial property  
- DAO governance module  
- Testnet + mainnet deployment  
- Open-source release under a permissive license  
- Initial live portfolio with real yield distribution  

**What is explicitly out of scope?**  
- Proprietary off-chain asset management  
- Non-RWA strategies  
- Consumer-facing wallet / mobile app (focus on protocol layer)  
- Multi-jurisdiction regulatory wrappers beyond initial structure  

**Technical Approach** 

DPMC uses a hybrid design:  
- **On-chain**: Deposit vault collects stablecoins → allocation to RWA positions → proportional yield claiming  
- **Tokenization**: Real estate assets structured via legal entities → fractional ERC-20/ERC-4626-like tokens minted on-chain  
- **Off-chain → on-chain bridge**: Rental income collected → tokenized → distributed via smart contract (net of fees/reserves)  
- **Governance**: Standard DAO (e.g. Governor-style) controls parameters, investments, upgrades  
- **Risk controls**: Conservative LTV, diversification rules, legal wrappers, optional insurance  

The architecture emphasizes composability, auditability, and modularity for future RWA classes.

**Alignment with Canton / Broader Ecosystem**  
How does this proposal benefit the Canton Network, interoperability, or the broader blockchain/DeFi ecosystem?

DPMC is designed with interoperability in mind (standard token interfaces, modular adapters). It demonstrates secure RWA onboarding — a key missing primitive — and can serve as a reference implementation for projects building on Canton or similar networks seeking real-economy yield integration.

**Milestones & Deliverables**

**Milestone 1 – Foundation & MVP Contracts** (Months 2–3)  
- Deliverables: Architecture spec, core contracts (vault + basic allocation + governance), first audit kickoff  
- Acceptance: Code compiles, unit tests pass 100% coverage, audit firm engaged, spec published  

**Milestone 2 – Tokenization Pilot & Testnet** (Months 4–6)  
- Deliverables: Reference tokenized property (legal + on-chain), testnet deployment, basic frontend/dashboard, public demo  
- Acceptance: End-to-end test flow verifiable on testnet, documentation live, demo video / session  

**Milestone 3 – Mainnet Launch & First Live Position** (Months 7–9)  
- Deliverables: Audited contracts deployed (verified), first real tokenized Australian property funded, first yield cycle distributed  
- Acceptance: Mainnet contracts verified on explorer, position & yield verifiable on-chain, repo public (MIT)  

**Milestone 4 – Stabilization & Reusability** (Months 10–12)  
- Deliverables: Monitoring tools, quarterly report template, modular RWA adapter spec, integration guide  
- Acceptance: Tools live, first report published, adapter design approved, ≥1 external POC/integration demonstrated  

**Acceptance Criteria (overall)**  
- All deliverables verifiable on-chain or via public repo/docs  
- Core protocol open-source under a permissive license  
- Critical audit issues resolved  
- At least one live RWA position distributing real yield  
- DAO operational with ≥3 governance proposals voted on  

**Funding Request & Milestone Breakdown**

**Total Requested:** $150,000

**Milestone Breakdown**  
- Milestone 1: 25% ($37,500) – upon acceptance of MVP contracts & architecture  
- Milestone 2: 30% ($45,000) – upon testnet pilot & demo  
- Milestone 3: 30% ($45,000) – upon mainnet launch & first live yield distribution  
- Milestone 4: 15% ($22,500) – upon stabilization deliverables & first integration POC  

**Long-term sustainability plan**  
Protocol fees (e.g. 10–20% performance/management) directed to DAO treasury → fund ongoing development, audits, bug bounties, and contributor incentives.

**Additional Information**  
- Any dependencies or risks? Audits, legal structuring of RWAs, oracle reliability for off-chain valuation.  
- License: MIT  

Ready for community feedback and PR review.
