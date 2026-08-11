# Compliance Middleware SDK for EVM Developers on Zenith

| Field | Value |
| :---- | :---- |
| **Author** | Woof |
| **Status** | Submitted |
| **Created** | 2026-08-06 |
| **Label** | `regulatory-compliance` · `token-asset-standards` |
| **Champion** | Open to any member of the Regulatory Compliance or Token & Asset Standards SIG; outreach in progress. |

---

# Abstract

This proposal funds an open-source **Compliance Middleware SDK** that makes Canton's CIP-56 compliance primitives natively callable from Solidity contracts deployed on Zenith EVM. The SDK delivers a Solidity contract layer (base contracts and interfaces), a TypeScript middleware layer, and a set of production-shaped reference dApps demonstrating common compliant DeFi patterns (e.g. permissioned lending, compliant vaults, KYC-gated trading).

The SDK is the **EVM-side complement** to [PR #231 TokenProof (Compliledger)](https://github.com/canton-foundation/canton-dev-fund/pull/231), which builds the on-ledger `ComplianceGuard` primitive on the DAML side. Without an EVM-facing surface, the 71% of Canton developers entering the ecosystem from Ethereum cannot consume TokenProof from their dApps without writing the bridge themselves — each team repeating compliance integration work in the highest-stakes part of the stack.

**Total funding:** $120,000 USD, denominated in Canton Coin at the prevailing USD/CC rate at each milestone's acceptance, across 2 milestones. The volatility-adjustment mechanism required by CIP-0100 is set out in the Funding section.
**Duration:** 6 months across 2 milestones.

---

# Motivation

Canton processes $9T+ monthly volume across institutional rails, and Zenith EVM opens the ecosystem to the 71% of Canton developers who come from an Ethereum background (DevEx Survey 2026). 83% of Canton projects are TradFi or hybrid — domains where regulatory compliance is non-negotiable.

Canton's CIP-56 token standard, party-based privacy, and atomic Delivery-vs-Payment (DvP) settlement provide institutional-grade compliance primitives — but only on the DAML side. EVM developers deploying through Zenith face a structural gap:

- **KYC/AML checks from Solidity.** TokenProof enforces compliance via the DAML `ComplianceGuard` interface. No Solidity interface exists for EVM contracts to query compliance state.
- **Atomic DvP between ERC-20 and CIP-56.** TokenProof demonstrates DvP on the Canton side. [LynoBridge (#147)](https://github.com/canton-foundation/canton-dev-fund/pull/147) bridges EVM tokens to Canton but does not enforce compliance during settlement. No PR atomically settles ERC-20 transfer on Zenith against CIP-56 transfer with compliance gating.
- **Reference DeFi implementations.** [OpenZeppelin Canton Stack (#262)](https://github.com/canton-foundation/canton-dev-fund/pull/262) ships Daml libraries. EVM-side compliance-integrated DeFi primitives (vaults, lending, AMM) are absent from every active PR.
- **Party ↔ address mapping for EVM.** Solidity contracts speak `address`. Canton speaks `Party`. No reusable mapping layer exists.

**A note on native registry controls.** Canton's token layer is not compliance-blind. Digital Asset's Registry App gives registrars both a party **blocklist** (the `checkBlocklist` field on `InstrumentConfiguration`, since Registry App v0.13 — blocked parties cannot transfer, mint, or burn) and a credential-based **allowlist** (per-instrument rules restricting holding, transfers, and mint/redeem to credentialed parties). These are **asset-model controls** — the issuer deciding who may hold or move *their instrument*. DA's own docs draw the line precisely: "[r]ather than application-layer logic, the DA Registry embeds authorization directly into the asset model" ([blocklist](https://docs.digitalasset.com/registry/guides/blocklist), [allowlist](https://docs.digitalasset.com/registry/features/allowlist)).

This SDK operates on the other side of that line — the **application layer**: giving a dApp developer on Zenith a Solidity-native way to enforce *their own* per-action permissions inside their contract ("may this address open a position in my lending market", "may it swap in my KYC-gated pool"), across whatever assets the dApp handles — including app-level objects (positions, LP shares, app permissions) that are not registry instruments at all. The layers compose: a party barred at the registry cannot move the instrument regardless of what any dApp does, while nothing at the instrument level expresses a dApp's own business-logic permissions — and no native control surface of either kind currently exists for Solidity on Zenith. The SDK deliberately reimplements neither blocklisting nor instrument-level allowlisting. Its compliance interface is backend-agnostic, so registry-level state can serve as one signal source where a registry exposes it — but nothing in the SDK's design depends on that: the layers compose by default, because instrument-level controls enforce themselves at the token layer no matter what any dApp does.

A large share of dApps deploying through Zenith will need **application-level compliance gating beyond instrument-level registry controls** — permissions expressed in their own contract logic rather than at the token layer — and today every team rebuilds it from scratch. This SDK eliminates that duplication and reduces ecosystem-wide compliance-implementation risk.

**This is a distinct layer from other EVM↔CIP-56 work in the queue.** Several proposals touch the broad "EVM meets CIP-56" space, but at different layers — none deliver compliance enforcement embedded in Solidity contracts:

- [CIP-56/ERC-20 Middleware (#453)](https://github.com/canton-foundation/canton-dev-fund/pull/453) is a **transport/wallet layer** — a MetaMask-compatible Ethereum JSON-RPC facade over CIP-56 tokens, plus an indexer and a bridge relayer. It lets EVM wallets and tooling *reach* CIP-56 tokens; it does not give a Solidity developer compliance modifiers (`onlyKYC`), atomic ERC-20↔CIP-56 DvP, or party-based gating inside their own contract. The two are complementary: #453 is how an EVM wallet connects, this SDK is how an EVM *contract* enforces compliance.
- [BlockTravel (#190)](https://github.com/canton-foundation/canton-dev-fund/pull/190) is an **off-ledger decisioning service** (pre-transaction Travel-Rule/AML checks). It is a compliance data source, not a Solidity contract layer; it could sit behind our `ICantonKYC` interface as one possible backend.
- [TokenProof (#231)](https://github.com/canton-foundation/canton-dev-fund/pull/231) is the **DAML-side primitive** this SDK consumes (see below).

Our layer — security-reviewed Solidity base contracts and interfaces that a Zenith dApp inherits to enforce CIP-56 compliance via `external_call()` — is unaddressed by any of them.

---

# Specification

## 1. Objective

Deliver a single, security-reviewed, MIT-licensed SDK that lets a Solidity developer with no prior Canton experience add CIP-56-compliant KYC/AML gating, party-based permissions, and atomic ERC-20 ↔ CIP-56 DvP settlement to their Zenith dApp in under one hour following the quickstart guide.

The scope explicitly does **not** include DAML-side compliance enforcement (that is TokenProof's domain), full Canton DevNet orchestration (that is [Denex LocalNet's domain](https://github.com/canton-foundation/canton-dev-fund/pull/318)), or institutional API gateway / enterprise IAM bridging (out of Woof's core competency).

## 2. Implementation Mechanics

A two-layer SDK published under `@woof-software/canton-compliance` (TypeScript, npm) and `woof-software/canton-compliance-contracts` (Solidity).

### Layer 1 — Solidity contract layer on Zenith EVM

A set of inherit-and-extend base contracts and interfaces that wrap `external_call()` invocations to TokenProof's `ComplianceGuard`, so that a developer adds compliance to their dApp by inheriting from the SDK rather than hand-rolling cross-VM calls. In practice a developer inherits a base contract and annotates a function with a modifier such as `onlyKYC("DEPOSIT")` — the SDK resolves the relevant compliance state via `external_call()` and reverts if the caller is not authorized, so the developer writes only business logic. Atomic settlement (e.g. an ERC-20 transfer on Zenith against a CIP-56 transfer on Canton) is exposed through a single SDK call that succeeds or reverts as one cross-VM operation. The exact contract decomposition, naming, and number of contracts/interfaces will be finalized during implementation.

The contract layer covers the following functional areas (delivered across however many contracts/interfaces prove cleanest in implementation):

- **Compliance gating** — reusable base contract(s) exposing modifiers/guards (e.g. KYC-gated, permission-gated, party-gated entry points) that resolve compliance state via `external_call()` to TokenProof's `ComplianceGuard`.
- **KYC / permission queries** — interface(s) letting EVM contracts read KYC/AML status and party permissions from the DAML side.
- **Atomic settlement (DvP)** — interface(s) for atomic ERC-20 ↔ CIP-56 settlement that succeeds or reverts as a single cross-VM operation.
- **CIP-56 token interaction** — interface(s) for interacting with CIP-56 tokens from Solidity.
- **Party ↔ address mapping** — a resolution layer mapping EVM `address` to Canton `Party`, with attestation-based linkage.

The intent is to give EVM developers a familiar inherit-and-compose surface; the precise breakdown into individual contracts and interfaces will be driven by what produces the cleanest, most auditable API during M1.

### Layer 2 — TypeScript middleware

A TypeScript package that gives application and frontend developers typed, high-level access to the compliance layer without hand-writing cross-VM plumbing. It covers the following functional areas (the exact module/class breakdown is determined during implementation):

- **Typed compliance access** — typed client utilities wrapping the Solidity contract layer, so reads/writes against compliance state are type-safe.
- **Party ↔ address resolution** — a mapping service with caching and on-chain attestation verification, exposed as reusable helpers.
- **Hybrid transaction assembly** — helpers for composing transactions that must pass both EVM and DAML validation, or fail atomically.
- **Frontend integration** — a set of UI building blocks (e.g. React components/hooks) surfacing KYC status, permissions, and settlement history for a connected wallet.

The goal is a `wagmi`/`viem`-style developer experience: a thin, well-typed layer over the contracts. Final package structure (number of modules, components, and helpers) will follow what is cleanest in implementation.

### Reference implementations

A set of open-source reference dApps (Apache-2.0), each with Solidity + DAML + deployment scripts + a test suite, demonstrating how the SDK is used for the most common compliant DeFi patterns. The planned patterns — finalized during M2 based on community demand — include:

- **Permissioned lending** — Compound-shaped: KYC-gated deposits, CIP-56 collateral, compliant liquidations.
- **Compliant vault** — ERC-4626 wrapping CIP-56 tokens with compliance enforcement on entry/exit.
- **KYC-gated trading** — an AMM-style pool that enforces party permissions on swaps.

These are illustrative of the patterns we expect to be most valuable; the final set and count of reference dApps will be confirmed with the community during M2.

### Technologies and operational approach

- Solidity contract layer deployed on Zenith, published as an open-source package.
- TypeScript middleware published to npm.
- Hardhat as the primary test/dev environment; complementary tooling (e.g. Foundry) for invariant/fuzz coverage where useful.
- Static analysis (Slither) as part of the security baseline, targeting zero high-severity findings.
- Any DAML packages used pass [Daml Package Analyzer (PR #130, Certora)](https://github.com/canton-foundation/canton-dev-fund/pull/130) where available — leveraging a funded ecosystem tool as an audit baseline.

### Proof of concept (already built)

The core pattern is already validated in public PoCs — this is not greenfield:

- [woof-software/canton-compliance-poc](https://github.com/woof-software/canton-compliance-poc) — the EVM-side pattern: a base contract with an `onlyKYC` modifier resolving compliance through a pluggable interface, with a mock standing in for the Canton side. Passing CI.
- [woof-software/canton-localnet-poc](https://github.com/woof-software/canton-localnet-poc) — the DAML-side counterpart, built with SDK 3.4.11 and executed on a live Canton ledger: the script creates and reads back an on-ledger compliance decision. Run log and DAR are committed as evidence.

The SDK productionizes these PoCs and replaces the mock with the real `external_call()` bridge once Zenith access is available.

### Dependency isolation: `external_call()`

We name the proposal's primary platform risk explicitly: Zenith's `external_call()` is not yet publicly exercisable, and the PoCs above validate the two sides separately (Solidity gating against a mock guard; DAML compliance state on a live Canton ledger) — not the cross-VM call itself. The SDK isolates this risk by design: all `external_call()` invocations are confined to a single adapter contract behind stable interfaces, so if the shipped semantics differ from current documentation (atomicity guarantees, error propagation, gas/metering), the changes localize to that adapter rather than rippling through the SDK or integrators' code. Cross-VM atomicity is verified on Zenith testnet as access becomes available; until then, the mock harness verifies all SDK-level behavior under documented assumptions.

## 3. Architectural Alignment

- **CIP-56 (Token Standard).** This SDK is the EVM consumption surface for CIP-56. Practical adoption of CIP-56 by EVM developers depends on tooling like this existing.
- **TokenProof ([PR #231](https://github.com/canton-foundation/canton-dev-fund/pull/231)).** Explicit complement: TokenProof provides the on-ledger primitive, this SDK provides the EVM-facing consumption layer. Co-existence is by design.
- **Zenith EVM atomic transactions.** The SDK relies on `external_call()` for cross-VM atomicity — the architectural feature that distinguishes Zenith from traditional bridges.
- **Canton Foundation institutional DeFi narrative.** The Zenith launch release frames the gap directly: "financial applications such as lending protocols, automated market coordination systems, and structured yield strategies are overwhelmingly developed on Ethereum" ([Zenith launch, Mar 2026](https://www.globenewswire.com/news-release/2026/03/09/3252106/0/en/Zenith-launches-as-the-EVM-layer-for-Canton-Network-merging-Ethereum-s-developer-ecosystem-into-Wall-Street-s-blockchain.html)). Zenith brings that EVM logic onto Canton's institutional rails; this SDK is the compliance-enforcement layer that lets it deploy compliantly.
- **Ecosystem priority areas.** This proposal maps directly onto two of the priority areas set out in the [Development Fund Proposal Review Process](https://github.com/canton-foundation/canton-dev-fund/blob/main/Development%20Fund%20Proposal%20Review%20Process.md): **Security and Resilience** (which lists "monitoring, compliance, and third-party audit capabilities") and **App Building and Developer Experience** ("reduced developer friction", "interoperability across wallets, assets, and dApps"). The SDK delivers compliance capability and removes friction for the 71% of Canton developers writing Solidity. (Quoted phrases are verbatim from that document.)

## 4. Backward Compatibility

No backward compatibility impact on existing Canton or DAML systems. The SDK deploys new Solidity contracts on Zenith EVM and consumes existing TokenProof `ComplianceGuard` via the documented `external_call()` interface. Existing DAML applications, CIP-56 token issuers, and TokenProof PoC users are unaffected.

If TokenProof modifies its `ComplianceGuard` interface during its hardening milestones, this SDK will track those changes through versioned compatibility releases. Pre-submission coordination with the Compliledger team (see Rationale) is intended to align interface evolution timing.

The SDK also does not hard-depend on TokenProof's funding outcome. Our DAML-side PoC ([canton-localnet-poc](https://github.com/woof-software/canton-localnet-poc)) already contains a minimal open-source compliance-status template that can serve as the interim guard implementation behind the same Solidity interfaces — so the EVM surface remains functional and interface-compatible while the on-ledger primitive matures, and swaps to TokenProof's `ComplianceGuard` as it lands.

---

# Milestones and Deliverables

## Milestone 1: Core Compliance Layer + Middleware Foundation

- **Estimated Delivery:** Month 3
- **Focus:** Build, security-review, and publish the core SDK; first end-to-end integration on testnet.
- **Deliverables / Value Metrics:**
  - Solidity contract layer covering the functional areas in Specification §2 (compliance gating, KYC/permission queries, atomic settlement, CIP-56 interaction, party↔address mapping) — deployed and verified on Zenith testnet.
  - TypeScript middleware published to npm (beta), covering typed compliance access, party resolution, and hybrid transaction assembly.
  - Local testing support (Hardhat-based) with mock compliance responses.
  - Security baseline established: static analysis (Slither) report with zero high-severity findings, published.
  - At least one integration exercising the < 1-hour quickstart — an external developer team if available, otherwise a Woof-built reference integration distinct from the SDK repo.

## Milestone 2: Reference dApps + Documentation

- **Estimated Delivery:** Month 6
- **Focus:** Reference dApps demonstrating common compliant patterns + complete documentation + community handoff.
- **Deliverables / Value Metrics:**
  - A set of open-source reference dApps covering the most-demanded compliant DeFi patterns (e.g. permissioned lending, compliant vault, KYC-gated trading) — deployed and operable on Zenith testnet.
  - Frontend integration building blocks (e.g. React components/hooks) for surfacing compliance state.
  - Documentation site: architecture overview, party-model walk-through, settlement (DvP) flow, error handling, and a "deploy a compliant dApp" walkthrough.
  - **Target adoption signal:** ≥ 3 external Canton-ecosystem teams publicly committing to evaluate integration (reported as a value metric, not a hard gate).
  - Community review iteration via [forum.canton.network](https://forum.canton.network) with feedback incorporated.

---

# Acceptance Criteria

Milestone acceptance is gated on the deliverables under our control; adoption is the primary success indicator we optimize for and report, but is tracked as a target rather than a pass/fail gate (it depends on third parties and on Zenith mainnet timing).

**Hard acceptance criteria (within our control):**
- **Time-to-first-integration:** A Solidity developer with no prior Canton experience can deploy a compliance-enabled contract (inheriting from the SDK base layer) and complete a compliance-gated operation in under 1 hour following the quickstart — demonstrated by a Woof-built reference integration (and by an external team's integration where available).
- **Cross-VM atomicity correctness:** Atomic DvP between a CIP-56 token and an ERC-20 executes successfully and rolls back symmetrically when either side reverts. Verified through an invariant test suite and at least 3 distinct revert scenarios — on Zenith testnet where available (see "Dependency isolation" in Specification §2 and the environment note below).
- **Security posture:** Solidity contracts pass Slither with zero high-severity findings. DAML helpers (if any) pass Certora Daml Package Analyzer with zero high-severity findings. (A third-party external audit is not budgeted within this grant; the security baseline is static analysis plus internal manual review, and the SDK is deliberately scoped as a thin, reviewable layer.)
- **Boundary acknowledgement:** obtained pre-submission — the TokenProof team confirmed the efforts are complementary ([PR #231 reply](https://github.com/canton-foundation/canton-dev-fund/pull/231#issuecomment-4718622123)). Ongoing coordination on `ComplianceGuard` interface stability continues in the PR threads as both efforts mature.

**Adoption targets (primary success indicator, reported not gated):**
- Outreach to the EVM-background and TradFi/hybrid teams entering via Zenith, with **≥ 3 external teams publicly committing to evaluate integration** as the target by end of M2.
- At least one integration exercised end-to-end (external team if available; otherwise the Woof reference integration above).

**Environment note.** Where these criteria reference "Zenith testnet", an equivalent public EVM test environment may be substituted if public Zenith testnet access is not yet available at execution time; the SDK's mock-`external_call()` test harness ensures all functional criteria remain verifiable independently of Zenith availability.

---

# Funding

**Total Funding Request:** $120,000 USD, denominated in Canton Coin at the prevailing USD/CC rate at each milestone's acceptance.

## Payment Breakdown by Milestone

- **Milestone 1** (Core Compliance Layer + Middleware Foundation): $60,000 USD in CC upon committee acceptance.
- **Milestone 2** (Reference dApps + Documentation): $60,000 USD in CC upon final release and acceptance.

## Volatility Stipulation

[CIP-0100](https://github.com/canton-foundation/cips/blob/main/cip-0100/cip-0100.md) requires proposals with milestones at or beyond six months to state explicitly how CC price volatility is handled. This proposal handles it by denominating the engineering budget in USD and converting to Canton Coin at the prevailing USD/CC rate on the date each milestone is accepted. Payment is made in CC; no CC amount is fixed in advance, so neither party carries an open-ended exposure to rate movement between approval and delivery.

The rationale is that the cost of the work is a USD cost, and Canton Coin has moved across a wide range in its short trading history. Fixing a CC quantity at submission would make the real value of delivery a function of the rate on an arbitrary date rather than of the work performed. Should the project timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones are renegotiated on the same basis.

---

# Co-Marketing

Upon release, Woof will collaborate with the Canton Foundation on:

- **Announcement coordination** — joint blog post or press release at v1.0 launch.
- **Technical blog** — engineering deep-dive on the EVM ↔ DAML compliance integration pattern, published on Canton Foundation channels.
- **Developer outreach** — 1 conference talk or workshop session at a Canton ecosystem event during the milestone window (in-person or virtual).
- **Reference dApp showcase** — Foundation may feature the reference implementations in ecosystem marketing materials.

---

# Distribution & Go-to-Market

How developers discover, adopt, and depend on the SDK:

- **Distribution channels.** Published as a versioned npm package and an open-source Solidity package verified on the Zenith block explorer, with a public GitHub repository. Standard `npm install` / inherit-and-import flow — zero bespoke setup, the path EVM developers already expect.
- **Discovery.** A documentation site with a "deploy a compliant dApp" quickstart; launch announcement on forum.canton.network and Canton ecosystem channels; a technical blog post; and a short walkthrough video. Inclusion in the Canton ecosystem tooling listings (e.g. CCTools directory) once live.
- **Onboarding funnel.** The reference dApps (e.g. permissioned lending, compliant vault, KYC-gated trading) double as copy-paste starting points — a developer forks the closest pattern and adapts it, rather than starting from a blank file. The < 1-hour quickstart is the conversion metric.
- **Targeted adoption.** Direct outreach to the EVM-background teams entering via Zenith (71% of Canton developers per the DevEx Survey), plus the TradFi/hybrid teams (83%) for whom compliance is mandatory. Adoption is tracked as an explicit acceptance criterion (≥ 3 external teams committing to evaluation by end of M2).
- **Ecosystem pull.** As the EVM-side complement to TokenProof, the SDK rides the same demand curve as CIP-56 adoption — every team that needs on-ledger compliance is a candidate consumer of the Solidity surface.

---

# Rationale

## Why this approach

**Solidity-side wrappers are the lowest-friction surface for EVM developers.** Inherit-and-extend with familiar modifiers (`onlyKYC`, `onlyParty`) maps to standard EVM patterns; developers do not need to learn DAML or Canton's party model to add compliance gating. The cost of building this once as security-reviewed infrastructure is recovered many times over across the ecosystem.

**Two-layer architecture (Solidity + TypeScript) follows Ethereum precedent.** OpenZeppelin Contracts + Ethers.js / Viem is the canonical model that EVM developers expect. This SDK adopts that mental model for Zenith.

## Alternatives considered

- **Extend TokenProof to include Solidity bindings ourselves, contributing to that repo.** Considered. The Compliledger team is staffed for DAML protocol work; Solidity contract authorship and EVM-dApp reference implementations sit outside their scope per their own PR statement. Splitting ownership cleanly (DAML primitive vs EVM consumption layer) is healthier than concentrating both layers in one team's roadmap.
- **Build a higher-level abstraction (single-call "do everything compliant" wrapper) instead of base contracts.** Rejected: prevents composition, locks developers into our opinions. Base contracts + interfaces match Solidity ergonomics and let developers compose with their existing inheritance hierarchies.
- **Defer Solidity work until OpenZeppelin Canton Stack ships its Reference Implementations.** Rejected: OpenZeppelin's stack is Daml-centric per their own scope description; their Reference Implementations are not Solidity contracts on Zenith. There is no overlap.
- **Leave the EVM-side compliance surface to the platform's own roadmap.** Considered. Digital Asset's Registry App scopes itself to asset-model authorization (see the boundary in Motivation), and no public roadmap covers an application-layer compliance surface for Solidity developers on Zenith. The Dev Fund exists precisely to fund open, MIT-licensed infrastructure that composes with the platform's products. If the platform later ships native equivalents, we would align interfaces rather than compete, and the reference dApps retain their value as open app-layer patterns.

## Fit with existing ecosystem tooling

- Consumes [TokenProof #231](https://github.com/canton-foundation/canton-dev-fund/pull/231) — explicit complement, coordinated before submission.
- Uses [Daml Package Analyzer #130 (Certora)](https://github.com/canton-foundation/canton-dev-fund/pull/130) as audit baseline for any DAML helpers.
- Coexists with [OpenZeppelin Canton Stack #262](https://github.com/canton-foundation/canton-dev-fund/pull/262) — different layers (Daml libraries vs EVM contracts).
- Independent of [LynoBridge #147](https://github.com/canton-foundation/canton-dev-fund/pull/147) — bridge is token-transfer; this SDK is compliance enforcement.
- Complementary to [CIP-56/ERC-20 Middleware #453](https://github.com/canton-foundation/canton-dev-fund/pull/453) — that is a JSON-RPC/wallet transport layer over CIP-56; this SDK is contract-level compliance logic. Composable, not overlapping.
- Complementary to [BlockTravel #190](https://github.com/canton-foundation/canton-dev-fund/pull/190) — an off-ledger compliance decisioning service that can act as one backend behind our `ICantonKYC` interface.
- Complementary to native registrar controls in [Digital Asset's Registry App](https://docs.digitalasset.com/registry/guides/blocklist) — party blocklisting (`checkBlocklist`, since v0.13) and credential-based instrument [allowlisting](https://docs.digitalasset.com/registry/features/allowlist) are issuer-side **asset-model** controls; this SDK is the **application-layer** counterpart on the EVM side (full boundary in Motivation). The SDK reimplements neither.

## Pre-submission coordination

We coordinated with the Compliledger team (@Mharris40) via PR #231 before opening this proposal. The TokenProof team reviewed our scope and **confirmed the two efforts are complementary, not overlapping**, and is open to coordinating on `ComplianceGuard` interface stability as both efforts progress ([their reply](https://github.com/canton-foundation/canton-dev-fund/pull/231#issuecomment-4718622123), in response to [our note](https://github.com/canton-foundation/canton-dev-fund/pull/231#issuecomment-4718506264)). We will keep our Solidity wrappers adaptable to their interface as it firms up. If their design later expands to cover the Solidity side directly, we will revise our scope rather than duplicate, and would offer to contribute to their milestones.

---

# Sustainability

Who operates and maintains the SDK after the grant period:

- **Primary steward: Woof.** As an active Compound DAO contractor team building EVM infrastructure long-term, Woof commits to maintaining the SDK as part of its ongoing open-source footprint — minimum 6 months of bug fixes, CIP-56 spec compatibility, and Zenith version updates post-delivery, with security disclosures addressed within 48 hours.
- **Low maintenance surface by design.** The SDK is a thin, security-reviewed layer over TokenProof's `ComplianceGuard`; most spec evolution is absorbed on the DAML side, limiting our long-term maintenance burden.
- **Community handoff path.** All code is MIT/Apache-2.0 with a public issue tracker and contribution guide. As the Token Standards / Regulatory Compliance SIG matures, stewardship can transition to or be shared with the relevant SIG, so the SDK does not depend on a single vendor indefinitely.
- **No ongoing protocol fees or hosted dependency** — the SDK is a library consumed by other teams' deployments, so it does not require Woof to run infrastructure to keep functioning.

---

# Open Source

- Solidity contracts: MIT.
- TypeScript middleware: MIT.
- Reference implementations: Apache-2.0.
- Documentation: CC-BY-4.0.
- Repositories: `github.com/woof-software/canton-compliance` (TypeScript middleware) and `github.com/woof-software/canton-compliance-contracts` (Solidity contracts).

---

# Team

**Woof** ([woof.software](https://woof.software)) — senior EVM engineers for DeFi. Active Compound DAO contractor team. Public artifacts directly relevant to this proposal:

- **[`comet`](https://github.com/woof-software)** — Compound v3 core contributions.
- **[`comet-wrapper`](https://github.com/woof-software)** — production Solidity ERC-4626 + ERC-7246 wrapper for Compound III; precedent for the Compliant Token Vault reference implementation.
- **[`compound-multiplier`](https://github.com/woof-software)** — risk-adjusted DeFi engineering on EVM.
- **[`migrator-v2`](https://github.com/woof-software)** — cross-protocol position migration; precedent for hybrid (multi-protocol) transaction building.

Operational track record: delivering the deployments behind Compound's market expansion to Optimism, Mantle, and additional networks. Solidity, security review (Slither, manual review), and audit-grade engineering are daily practice.

We do not present ourselves as DAML protocol experts. This proposal is scoped accordingly — the EVM / Solidity side specifically, with the DAML side deferred to TokenProof.

---

# References

- [PR #231 TokenProof](https://github.com/canton-foundation/canton-dev-fund/pull/231) — the on-ledger primitive this SDK consumes
- [PR #130 Daml Package Analyzer (Certora)](https://github.com/canton-foundation/canton-dev-fund/pull/130) — audit baseline
- [PR #262 OpenZeppelin Canton Stack](https://github.com/canton-foundation/canton-dev-fund/pull/262) — adjacent Daml library work
- [PR #147 LynoBridge](https://github.com/canton-foundation/canton-dev-fund/pull/147) — bridging context
- [PR #453 CIP-56/ERC-20 Middleware](https://github.com/canton-foundation/canton-dev-fund/pull/453) — adjacent JSON-RPC/wallet transport layer (complementary)
- [PR #190 BlockTravel](https://github.com/canton-foundation/canton-dev-fund/pull/190) — adjacent off-ledger compliance decisioning service
- [CIP-56 Token Standard](https://github.com/global-synchronizer-foundation/cips/blob/main/cip-0056/cip-0056.md)
- [Canton DevEx Survey 2026](https://forum.canton.network/t/canton-network-developer-experience-and-tooling-survey-analysis-2026/8412)
- [CIP-0100 Dev Fund governance](https://github.com/canton-foundation/cips/blob/main/cip-0100/cip-0100.md)
- [Zenith atomic transactions (The Block, March 2026)](https://www.theblock.co/post/394288)
