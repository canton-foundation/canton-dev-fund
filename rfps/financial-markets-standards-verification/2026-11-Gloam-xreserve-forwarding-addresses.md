## Development Fund Proposal

**Organization:** Gloam
**Author / Primary Contact:** Duke (Akachukwu Egboluche), Founder. hello@gloam.trade, Telegram @dukedotsol, GitHub @cryptoduke01
**Status:** Submitted
**Created:** 2026-11-20
**Proposal Type:** RFP-aligned
**RFP / Roadmap Area:** RFP-13 Payments and DeFi (Financial Markets, Standards & Verification)
**Champion:** `Needs Champion`
**Total Funding Request:** 800,000 CC
**Project Duration:** 4 months, plus 12 months of maintenance funded inside Milestone 3
**Label:** financial-workflows-composability

---

## Abstract

USDCx moves between Ethereum and Canton through Circle xReserve. Both directions need an Ethereum wallet that can make contract calls. A deposit needs an `approve` and a `depositToRemote` call. A withdrawal pays out to a plain Ethereum address, where the user's Canton privacy ends. Exchanges, custodians and payroll providers send plain transfers, so they can't fund a Canton party directly. Institutions that chose Canton for privacy lose it the moment USDC lands on Ethereum.

This proposal funds **xReserve forwarding addresses**: deterministic Ethereum addresses that forward whatever USDC they receive to a fixed destination, with no custodian and no admin keys.

- **Deposit addresses (inbound).** One address per Canton party. Any plain USDC transfer to it, from an exchange withdrawal, a payroll run or another wallet, is forwarded into xReserve for that party.
- **Private exit addresses (outbound).** A fresh address per USDCx withdrawal. The USDC released by xReserve is deposited straight into a shielded pool on Ethereum, so the exit never touches an address linked to the user. The first pool supported is Gloam's live Ethereum vault. The interface is open to any pool that accepts value-bound deposits.

The grant ships audited open-source contracts (Apache-2.0), a TypeScript SDK that builds both the Ethereum and the Canton (Ledger API) side, a permissionless keeper, and live integrations with Canton wallets and dApps.

---

## Specification

### 1. Objective

Let any sender fund a Canton party with USDC, and let any Canton party exit to Ethereum without exposing their history there, using one primitive: a counterfactual forwarding address bound to a fixed destination.

Success means Canton wallets and dApps offer "deposit from any exchange" and "withdraw privately" to their users, and real USDCx volume flows through both on MainNet.

### 2. Implementation Mechanics

**Contracts (Ethereum mainnet, Solidity, no owner, not upgradeable)**

`ForwarderFactory` deploys EIP-1167 clones with CREATE2. An address is known before it is deployed, and the clone is created on first use. Every parameter that decides where funds go is part of the CREATE2 salt, so no caller can redirect funds.

`XReserveDepositForwarder` (inbound)
- Salt: `remoteRecipient` (keccak256 of the Canton party ID, the same encoding xReserve uses), `owner` (an Ethereum address the user controls, used only for rescue), `maxFee`, `keeperFee`.
- `forward()` is callable by anyone. It pays `keeperFee` to the caller, approves xReserve, and calls `depositToRemote(balance, 10001, remoteRecipient, USDC, maxFee, "")` on Circle's xReserve contract (`0x8888888199b2Df864bf678259607d6D5EBb4e3Ce` on mainnet).
- `rescue(token, to)` needs an EIP-712 signature from `owner`. It covers tokens sent by mistake and any case where xReserve refuses the deposit.

`ShieldedExitForwarder` (outbound)
- Salt: `pool`, `asset`, `owner` (a one-time key derived from the user's note secret, so the address links to nothing the user already uses).
- `flush(commitment, amount, tip, proof, signature)` is callable by anyone holding a valid `owner` signature over `(commitment, amount, tip, forwarder, chainId)`. It pays `tip` to the caller, approves the pool, and calls the pool's value-bound deposit with `amount + tip == balance`.
- A value-bound deposit checks a zero-knowledge proof that the note commitment opens to the public `(amount, asset)`. On Gloam this is `shieldBound(asset, amount, commitment, proof)`, a Groth16 proof over BN254 with Poseidon commitments. The note can never claim more than the funds that arrived.
- If the released amount differs from what was expected (for example, a fee change between request and release), the user signs again for the actual balance. Nothing is stuck, and no one else can choose the note.
- `rescue(to)` with an `owner` signature sends the funds to a public address as a last resort.

**Canton side (TypeScript, Ledger API JSON)**

The SDK builds the commands that wallets already need for xReserve, using the published `utility-bridge-v0` DAR and the utilities backend:
- `BridgeUserAgreementRequest` for onboarding, with pre-approval as an option so deposits through a deposit address mint without a manual step.
- `BridgeUserAgreement_Mint` for pending `DepositAttestation`s.
- `BridgeUserAgreement_Burn` with `destinationRecipient` set to a fresh `ShieldedExitForwarder` address and the amount set so the release matches the note.

**SDK (`@gloamtrade/xreserve-forwarders`, TypeScript, Apache-2.0)**
- `depositAddress(partyId, owner, options)` and `exitAddress(pool, asset, ownerKey)` compute addresses offline.
- Command builders for onboarding, mint and burn, plus helpers to fetch the burn-mint factory and disclosed contracts.
- `prepareExit(...)` creates the note, the proof for the expected amount, the owner signature and the burn command in one call. The note stays on the user's device.
- Status tracking from burn request to xReserve release to shielded deposit.

**Keeper (open source, permissionless)**

A small service watches registered forwarding addresses and calls `forward()` or `flush()` when funds arrive. It is paid by the fee fixed in the address, so anyone can run one. We run a public instance and document how to self-host.

**What stays visible.** We are explicit about this in the docs:
- xReserve, Circle and the xReserve operator see every deposit and burn, as they do today. Nothing here bypasses their checks.
- On Ethereum, the release amount and the fresh forwarder address are public. What is hidden is who the funds belong to and where they go next.
- Exiting and later withdrawing the same unusual amount can be correlated. The SDK warns users and suggests splitting or rounding.
- The pool adds auditability: a note holder can produce a receipt that proves a specific payment to an auditor without revealing anything else.

### 3. Architectural Alignment

- Uses USDCx as a CIP-56 standard token and the existing xReserve `utility-bridge` choices. No new Daml templates and no change to Circle or Digital Asset components.
- Responds directly to RFP-13: reusable, open-source tooling for payment and settlement workflows that are "private, auditable, and interoperable", usable by many applications rather than one.
- Supports the roadmap goal of interoperability for cash, including stablecoins, by removing the main friction on the Ethereum leg for exchanges, custodians and payroll providers.
- Keeps Canton's privacy model intact at the boundary, where today it stops.

### 4. Backward Compatibility

*No backward compatibility impact.* Everything is additive. Wallets that integrate nothing keep working as they do today.

---

## Milestones and Deliverables

### Milestone 1: Contracts, SDK and end-to-end on testnet
- **Committed Date:** approval + 6 weeks
- **Focus:** working inbound and outbound flows on Ethereum Sepolia and Canton TestNet.
- **Deliverables / Value Metrics:**
  - Public repo, Apache-2.0: both forwarders, the factory, a full Foundry test suite and invariant tests (funds can only reach the salted destination or the owner).
  - SDK on npm with docs and runnable examples for onboarding, deposit address, mint, private exit and rescue.
  - Keeper, open source, with a public testnet instance.
  - Recorded demo: a plain transfer to a deposit address mints USDCx on TestNet, and a TestNet USDCx burn lands in a shielded balance on Sepolia.
  - Integration calls held with at least 3 Canton wallet or dApp teams, with their written feedback attached to this PR.

### Milestone 2: Security review, MainNet and first outside integration
- **Committed Date:** approval + 11 weeks
- **Focus:** production readiness and first adoption outside Gloam.
- **Deliverables / Value Metrics:**
  - Independent security review of the forwarder contracts, with the report and our fixes published in the repo.
  - Contracts deployed and verified on Ethereum mainnet, and a public keeper running.
  - At least 1 Canton wallet or dApp other than Gloam live on MainNet with deposit addresses or private exits.
  - Gloam app support: "Withdraw privately from Canton" and "Fund a Canton party" on gloam.trade.

### Milestone 3: Adoption
- **Committed Date:** approval + 4 months
- **Focus:** usage across the ecosystem.
- **Deliverables / Value Metrics:**
  - At least 3 Canton wallets, dApps or exchanges live with one or both flows.
  - At least 50 MainNet transfers through forwarding addresses from integrations other than Gloam.
  - An integration guide, published with the Foundation's documentation where possible.
  - A 12-month maintenance commitment: fixes, SDK updates when the xReserve DAR or APIs change, and keeper uptime.

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone
- Demonstrated functionality or operational readiness
- Documentation and knowledge transfer provided
- Alignment with stated value metrics

Project-specific conditions:
- Milestone 2 is accepted only once the security review report is public and every finding rated Medium or above is fixed or answered in writing.
- Adoption counts in Milestones 2 and 3 are verifiable on-chain: forwarder deployments and transfers on Ethereum, with integrators named in the milestone report.
- The contracts have no owner, no pause and no upgrade path. Reviewers can confirm this from the verified source.

---

## Funding

**Total Funding Request:** 800,000 CC

### Payment Breakdown by Milestone
- Milestone 1 (Contracts, SDK and end-to-end on testnet): 200,000 CC upon committee acceptance
- Milestone 2 (Security review, MainNet and first outside integration): 300,000 CC upon committee acceptance. This includes the external review.
- Milestone 3 (Adoption): 300,000 CC upon final release and acceptance. This includes 12 months of maintenance and keeper operation.

### Volatility Stipulation
The project duration is under 6 months. Should the timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones will be renegotiated to account for significant USD/CC price volatility.

---

## Co-Marketing

Upon release, Gloam will collaborate with the Foundation on:

- Announcement coordination at MainNet launch (Milestone 2)
- A technical blog post on forwarding addresses and what stays private at the Canton and Ethereum boundary
- A short demo film and a developer walkthrough for wallet teams

---

## Motivation

**Deposits are limited to senders that can make contract calls.** Today a deposit to Canton needs an Ethereum wallet that signs `approve` and `depositToRemote`. Exchanges, custodians, payroll providers and most payment APIs send plain transfers, and can't attach a call. A deposit address turns every one of them into a way to fund a Canton party, with no change on their side. This applies to every Canton wallet and exchange that supports USDCx, which is the main stablecoin on the network.

**Privacy stops at the exit.** Institutions use Canton because their positions and counterparties stay private. When USDCx is redeemed, Circle releases USDC to a public Ethereum address, and that address's whole history becomes linkable to the redemption. Private exit addresses keep the funds unlinked after they leave Canton, while xReserve's own compliance checks stay exactly as they are.

**No one has to trust a new custodian.** Hosted bridging services exist, but they take custody and require an account. Forwarding addresses are non-custodial and permissionless, and they don't depend on Gloam staying online: anyone can run the keeper or call the contracts directly.

We expect most wallets that add xReserve support to want deposit addresses, since exchange funding is the most common way users bring stablecoins onto a new network. Private exits serve a smaller group with high value per user: institutions, treasuries and payroll payers.

---

## Rationale

**Extend what exists.** The proposal uses xReserve, USDCx and the `utility-bridge` choices exactly as published. It adds an Ethereum-side primitive that xReserve does not offer, and an SDK that wraps the Canton commands wallets already have to implement.

**Why counterfactual addresses.** A sender only needs an address, which is the one thing every exchange and payment API supports. CREATE2 makes the address safe to share before deployment. Putting the destination in the salt means no keeper, relayer or operator can redirect funds.

**Why a shielded pool on Ethereum and not on Canton.** Canton already keeps transaction details private between participants, so a pool there would duplicate the protocol. The gap is on the public chain at the far end of xReserve. A pool that accepts value-bound deposits solves it without trusting the depositor's claimed amount.

**Why Gloam's vault first.** It is live on Ethereum mainnet, holds USDC, and already exposes `shieldBound`, a deposit that checks a proof binding the note to the public amount. The forwarder speaks a small interface, so another pool with the same property can be added with an adapter and no change to the contracts.

**Alternatives considered.**
- A custodial bridge account: rejected, because it adds custody and counterparty risk.
- Asking exchanges to add contract calls to withdrawals: unrealistic across the industry.
- Changes to xReserve itself: outside our control and slower. This design needs nothing from Circle or Digital Asset.

**Team.**
- Gloam runs private stablecoin payments live on six mainnets, including Ethereum, with a TypeScript SDK and an MCP server published on npm.
- The proving keys come from a 13-contributor trusted setup ceremony, finalized with a public drand round.
- Duke has 5 years of full-stack work and 3 in blockchain, leads audits at SMC, and has 14 bug bounty findings.
- An external audit of the core vault has been requested.

**Known limits.**
- Gloam's Ethereum vault runs beta per-deposit limits. Exits above the limit are split into several forwarders, or wait until limits rise.
- Ethereum finality (about 13 to 15 minutes) and xReserve processing times apply as they do today.
