## Axcess: Institutional Undercollateralized Credit Markets on Canton

**Author:** Rishi Thomas (rishithomas@axcess.finance) 
**Status:** Submitted
**Created:** 2026-03-11 

## Abstract

Axcess is a modular private credit platform for undercollateralized lending in digital assets, starting with curated loan vaults for institutional trading firms. On Canton, Axcess becomes an institutional‑grade credit primitive: lenders allocate into permissioned vaults, borrowers access capital under continuous on‑ledger supervision, and custody and risk partners like Ceffu and Chainrisk drive fund movements and interventions from verifiable ledger events. Over roughly 14 weeks, we will ship an open‑source Canton implementation of Axcess-AML contracts, backend services, custody bridge, automation, and documentation deployed to Canton testnet and ready for ecosystem integrations. We are requesting a grant of $50,000 USD (currently about 318,000 CC) to fund this work.

## Motivation

Crypto credit today is dominated by overcollateralized lending, where borrowers routinely post 120–150% collateral for access to working capital, which is inherently capital‑inefficient and excludes many otherwise strong institutional borrowers. At the other extreme, existing undercollateralized protocols have often relied on snapshot financial audits, opaque borrower disclosures, and passive smart contracts, leading to information asymmetry, hidden leverage, and slow or ineffective responses in stress events, as seen in prior protocol failures.

Axcess is designed to bridge this gap: it creates curated loan vaults for institutional trading firms, combining rigorous, ongoing due diligence with an infrastructure layer that includes custodian‑based fund control (via partners like Ceffu), real‑time monitoring, and active circuit breakers for risk management. By integrating partners such as Ampersan as launch borrowers and Chainrisk as a risk engine provider, Axcess turns undercollateralized credit from a pure “trust game” into a structured, continuously supervised product that can still deliver competitive yields to lenders.

## Canton Ecosystem Synergies

Canton already hosts a growing set of institutional lending and markets infrastructure, including Alpend’s privacy‑native money markets, Haven’s regulated Canton Lending platform, and ACME’s overcollateralized lending protocol. Axcess is designed to complement these rather than compete directly: we specialize in undercollateralized, relationship‑driven credit for trading firms and institutional borrowers, while these protocols focus on overcollateralized or policy‑driven money markets.

In this context, Axcess vaults can function as a dedicated private‑credit layer that other Canton participants can plug into. For example, overcollateralized platforms like ACME and Alpend could route selected institutional borrowers to Axcess facilities when working‑capital or balance‑sheet needs exceed what is efficiently addressable via overcollateralized structures, while still settling and reporting privately on Canton. Haven’s focus on regulated, permissioned lending with qualified custody is highly aligned with our model; Axcess vaults can offer Haven’s borrowers additional unsecured or partially secured credit lines backed by Axcess’s risk framework, while Haven’s distribution and KYC/KYB rails help broaden the lender base for Axcess. Over time, we also see Axcess as a credit backend for RWA issuance and trading on Canton-credit exposures originated via Axcess can sit alongside tokenized bonds and money market funds, giving institutional users a fuller spectrum of yield and duration options within the same privacy‑preserving network.

## Specification

### 1. Objective
Axcess creates loan vaults comprising curated portfolios of institutional borrowers, encoding origination, drawdown, monitoring, and repayment into smart contracts and infrastructure.

On Canton, Axcess will deliver:

- DAML templates for lender pools and borrower facilities, with on‑ledger representations of core legal terms and covenants.
- Borrower onboarding and monitoring interfaces, with hooks to risk engines such as the Axcess–Chainrisk framework.
- Lender/operator APIs and a light reference UI for pool creation, borrower onboarding, allocation, and risk monitoring.
- Interoperability and settlement patterns with tokenized cash and custodial venues, including flows modeled on Ceffu’s MirrorX/RSV architecture.

### 2. Technical Implementation

### **DAML Smart Contract Layer [Open-Source]**

| **DAML Template** | **Replaces (EVM)** | **Responsibilities** |
| --- | --- | --- |
| `VaultFactory` | `VaultFactory.sol` | Vault creation with borrower verification, asset whitelisting, parameter validation |
| `LoanVault` | `LoanVault.sol` | Core vault lifecycle: deposits, withdrawal requests, epoch transitions, fund transfers, collateral management |
| `DepositReceipt` | ERC20 share tokens | Per-lender deposit tracking with activation epoch, share calculation |
| `WithdrawalRequest` | On-chain withdrawal queue | Queued withdrawals with epoch-aware processing windows |
| `EpochRecord` | Epoch events | Immutable record of each processed epoch (amounts, rates, timestamps) |
| `AssetRegistry` | ERC20 token list | Whitelisted Canton-native assets with metadata and pricing |
| `BorrowerProfile` | Off-chain borrower table | On-ledger borrower identity and verification status |

Key DAML design decisions:

- Choices over transactions: Deposit, withdraw, process-epoch, and move-funds are modeled as DAML choices on the `LoanVault` template, with explicit signatories and observers ensuring only authorized parties can trigger state transitions.
- Epoch validation on-ledger: The 7-day epoch cycle, deposit activation windows (1-day notice), and withdrawal processing windows (3-day notice) are enforced in DAML contract logic rather than an off-chain bot, removing trust assumptions.
- Composable asset model: Instead of wrapping ERC20s, vaults natively hold DAML-based token contracts issued by participants, enabling atomic settlement with other Canton DeFi protocols.
- Open-source contract layer: The full DAML package - all templates, choices, and test scripts will be published as an open-source reference implementation. Canton developers building lending, credit, or epoch-based settlement applications can use it as a foundation, accelerating DeFi development on the network.

### **Backend Services Layer**

| **Service** | **Technology** | **Role** |
| --- | --- | --- |
| API Server | Hono (TypeScript) | User auth (JWT + Canton party identity), vault browsing, portfolio queries, borrower onboarding |
| Ledger Connector | Canton Ledger API / gRPC | Subscribe to contract events, execute DAML choices, replace Ponder indexer |
| Participant Query Store (PQS) | Canton PQS | Queryable read model of ledger state, replaces PostgreSQL `ponder` schema for indexed data |
| Epoch Automation | TypeScript Ledger API Bot (Existing) | Automated epoch processing, deposit activation, withdrawal settlement |
| Custody Bridge | Node.js service | Ceffu MirrorX integration - orchestrates off-ledger custody flows |

The existing Hono API is largely preserved, but data sources shift from Ponder (EVM indexer) to PQS (Canton query store). The epoch bot transforms from an off-chain cron worker into a Canton automation trigger that exercises DAML choices at epoch boundaries.

### **Custody Integration (Ceffu MirrorRSV)**

The Ceffu custody integration remains off-chain but is re-triggered by Canton ledger events instead of EVM events:

1. `LoanVault` choice `TransferToCustodian` creates a `CustodyTransferRequest` contract
2. Custody bridge service observes the contract, initiates Ceffu deposit → delegation flow
3. On return, the bridge exercises a `ConfirmFundsReturned` choice with settlement proof
4. Epoch processing proceeds with returned funds available

This preserves the existing Ceffu API integration (RSA-signed requests, MirrorRSV delegate/undelegate, settlement) while anchoring the trust model on-ledger.

## 3. **Architectural Alignment**

- **Canton's privacy model** directly addresses Axcess's core requirement: institutional lenders and borrowers need position privacy. DAML's party-based visibility ensures vault state is only shared with participants, unlike public EVM state.
- **DAML's authorization model** (signatory/observer/controller) maps naturally to Axcess's role-based access: protocol admin approves vaults, borrowers manage collateral, lenders deposit/withdraw, epoch automation processes transitions.
- **Composability with Canton ecosystem** - Axcess vaults can directly interact with other Canton-based protocols (e.g., tokenized securities, RWA platforms) for collateral or lending asset sourcing.

## 4. **Backward Compatibility**

No backward compatibility impact on existing Canton infrastructure. Axcess is a new application deployed as a DAML package on Canton participants. It introduces new templates and does not modify any existing Canton contracts or network configurations.

## **Milestones and Deliverables**

### **Milestone 1: DAML Smart Contract Development**

- **Estimated Delivery:** Week 4
- **Focus:** Core protocol logic in DAML
- **Deliverables / Value Metrics:**
    - `VaultFactory` template with borrower verification and asset whitelisting
    - `LoanVault` template with full lifecycle choices: deposit, request withdrawal, process epoch, move funds out/in, collateral management
    - `DepositReceipt`, `WithdrawalRequest`, and `EpochRecord` templates
    - `AssetRegistry` and `BorrowerProfile` templates
    - Epoch timing logic (7-day cycles, activation/withdrawal notice windows) enforced on-ledger
    - DAML test scripts covering all happy-path and edge-case scenarios (deposit activation timing, withdrawal windows, epoch boundary conditions)
    - DAML package compiled and deployable to Canton sandbox

### **Milestone 2: Backend Infrastructure & Ledger Integration**

- **Estimated Delivery:** Week 8
- **Focus:** API server, ledger connectivity, query layer, and automation
- **Deliverables / Value Metrics:**
    - Hono API server adapted to Canton: party-based authentication, Ledger API integration for command submission
    - PQS integration replacing Ponder indexer - vault listings, user positions, transaction history, protocol metrics all served from PQS
    - Automation Service for epoch processing (deposit activation, withdrawal settlement, interest accrual) - replacing the off-chain epoch bot cron
    - Borrower onboarding flow: vault request → admin approval → on-ledger vault creation
    - Portfolio API: cross-vault positions, pending deposits/withdrawals, transaction history
    - API documentation updated for Canton-native endpoints

### **Milestone 3: Custody Integration & End-to-End Testing**

- **Estimated Delivery:** Week 10
- **Focus:** Ceffu MirrorX custody bridge and full system integration
- **Deliverables / Value Metrics:**
    - Custody bridge service: listens to Canton ledger events (`TransferToCustodian`, `TransferToVault`), orchestrates Ceffu deposit → delegate → unwind → undelegate → return flows
    - Idempotent custody action tracking (preserving existing audit trail pattern)
    - Per-vault mutex and retry logic for custody operations
    - End-to-end integration tests: full vault lifecycle from creation → lender deposits → epoch activation → borrower fund access via custody → fund return → epoch settlement → lender withdrawal
    - Docker Compose deployment configuration for Canton sandbox + all services
    - Deployment runbook and operator documentation

### **Milestone 4: Deployment & Documentation**

- **Estimated Delivery:** Week 14
- **Focus:** Canton testnet deployment, hardening, and ecosystem-ready documentation
- **Deliverables / Value Metrics:**
    - Deployment to Canton testnet with real participant nodes
    - Stress testing: concurrent deposits/withdrawals, epoch processing under load, custody flow resilience
    - Security review of DAML contracts (authorization model, signatory correctness, no unauthorized choices)
    - Developer documentation: architecture guide, DAML contract reference, API reference, deployment guide
    - Walkthrough of full protocol flow on Canton testnet

## **Acceptance Criteria**

- All DAML templates compile, deploy, and pass test scripts on Canton sandbox and testnet
- Epoch processing (deposit activation, withdrawal settlement, interest accrual) executes autonomously via Canton automation without manual intervention
- API serves vault data, user portfolios, and protocol metrics from PQS
- Custody bridge correctly orchestrates Ceffu MirrorX flows triggered by Canton ledger events, with idempotent retry handling
- End-to-end vault lifecycle (create → deposit → activate → borrow → return → withdraw) completes successfully on testnet
- All code delivered with test coverage, structured logging, and deployment documentation
- No authorization vulnerabilities in DAML contracts (verified via security review)

## Funding

We request a grant of $50,000 USD, which at current market prices corresponds to approximately 318,000 CC 

## Growth Strategy

- **Institutional launch vaults**
    - Launch Axcess vaults on Canton with an initial set of institutional trading‑firm borrowers drawn from our existing pipeline, then scale to 3–4 curated firms as per the roadmap.
    - Focus on depth over breadth by demonstrating stable performance across multiple epochs, disciplined underwriting, and predictable liquidity for early lenders.
- **Vaults‑as‑a‑Service and protocol integrations**
    - Offer Axcess vaults as **Vaults‑as‑a‑Service** so other Canton protocols (money markets, RWA/tokenization platforms, trading and structured‑product apps) can plug them in as a credit backend instead of building their own undercollateralized credit stack.
    - Provide clear integration points (APIs, Daml templates, and reference flows) so front ends and portfolio applications can surface Axcess vaults and credit lines natively in their own products.
- **Borrower expansion and product diversification**
    - Expand beyond trading firms to a broader mix of institutional and corporate borrowers over time, aligned with our roadmap, while maintaining strict underwriting and monitoring standards.
    - Broaden the range of supported assets and custodial setups so Axcess can serve diverse strategies and treasuries operating on Canton.
- **Yield token and DeFi composability**
    - Once vault performance is sufficiently seasoned, explore a **yield‑bearing Axcess token** that reflects vault returns and can be integrated by other Canton DeFi and RWA protocols as a building block in their strategies.
    - Use this token, together with Vaults‑as‑a‑Service, to make Axcess a default undercollateralized credit and yield primitive across the Canton ecosystem rather than a standalone application.

## Marketing & Ecosystem Activation

### 1. Co‑marketing on social channels

- Joint announcements with partners (e.g. Ceffu, Chainrisk) highlighting Axcess vaults as institutional undercollateralized credit infrastructure on Canton.
- Regular updates on X/Telegram/LinkedIn covering launch milestones, first vaults, and ecosystem integrations.

### 2. PR: “Private Credit on Canton” narrative

- A press release and accompanying content that explain why bringing private credit to Canton is a natural fit given the network’s institutional positioning and growing influx of regulated capital and attention.
- Positioning Axcess as the reference undercollateralized credit primitive for Canton—something other applications (tokenization, custody, trading, RWAs) can plug into to offer yield and credit exposure to their own users.

### 3. Ecosystem storytelling and case studies

- Technical and business case studies (e.g., “How institutional trading firms access undercollateralized credit on Canton via Axcess”) to be shared via blogs, ecosystem newsletters, and partner channels.
- Participation in Canton community calls, AMAs, and events to explain the architecture, risk design, and integration paths for other teams.

## Team

Axcess (https://www.axcess.finance/) comprises of:

- Rishi Thomas (Co‑Founder & CEO) – Previously led business development at Sign ($SIGN) and growth at Cypherock, with a background in structured products and digital assets and a degree in business administration from USC.

- Daniel Ku Co‑Founder – Trading and liquidity specialist with experience as Founder & CEO of Ampersan and prior work experience for 13+ years at Optiver, shaping Axcess’s borrower design and market‑structure.

- Sameer Kumar (Head of Engineering) – Protocol and infrastructure engineer with prior roles at Raga Finance and Nethermind, leading engineering at Axcess.
