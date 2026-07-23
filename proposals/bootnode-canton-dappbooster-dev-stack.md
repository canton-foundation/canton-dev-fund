## Development Fund Proposal

**Author:** BootNode  
**Status:** Draft  
**Created:** 2026-05-28  
**Label:** dapp-integration  

---

## Abstract

dAppBooster for Canton v0.1 is an open-source local development stack, shipping today at [cn-dappbooster](http://github.com/BootNodeDev/cn-dappbooster), that takes a Canton developer from Daml contracts to a running dApp on a laptop. It bundles one-command local Canton infrastructure (canton-barebones); a React frontend starter with reusable UI components; and a working end-to-end example that works with any CIP-0103 wallet.

**This proposal funds evolving v0.1 into a stack that takes a developer from zero to a complete, running CIP-0103 dApp (infrastructure, and a React frontend). So teams ship in days, not weeks.** It builds on top of Canton's wallet & dApp SDKs, not alongside it: it consumes the upstream SDK, stays wallet-agnostic so any CIP-0103 wallet (including the [Foundation's reference wallet](https://github.com/canton-network/wallet/tree/main/wallet-gateway/extension)) drops straight in, and adds the environment and components that make those primitives usable. This maps directly to the Foundation's "App Building and Developer Experience" priority; lowering the barrier to building on Canton, and driving CIP-0103 adoption.

---

## Specification

### 1. Objective

This proposal maps directly to Canton's **"App Building and Developer Experience"** priority. dAppBooster for Canton **v0.1, shipping today**, already turns local setup into a one-command install. Its evolution is funded around one thesis: **building a Canton dApp should take days, not weeks**.

**The reference workflow becomes:** Three deliverables make that production-shaped. First, canton-barebones (a composable local environment that runs from its own CLI). Second, dAppBooster (a layer of reusable components). Finally, a working example, and docs that tie the loop together.

### 2. Implementation Mechanics

**The starting point is v0.1, already published.** v0.1 ships as open-source components, one of which is an end-to-end example dApp.

**canton-barebones** is the minimal Canton infrastructure layer: Splice, local dev token generation, DAR deployment scripts, and health checks. It intentionally excludes Keycloak/OIDC, so the base stays small and predictable. A developer starts from a working Canton runtime and adds only the pieces they need.

**dAppBooster** is the connection logic built on Canton's dApp SDK, with React wagmi-style hooks shipped today and a library of reusable UI components.

**At a high level, the deliverables are:**

1. canton-barebones stack;
2. dAppBooster ships React binding, and component set;
3. a working example, and documentation that ties the loop together.

### 3. Architectural Alignment

dAppBooster works with **CIP-0103: dApp Standard**. A dApp built with it delegates the signing and execution of its transactions to the user's wallet through the standard flow, so any compliant wallet works with any dApp built on dAppBooster, with no wallet-specific code. Everything beyond that interface (the wallet's internals, its signing backend, and identity) is out of dAppBooster's scope. This maps to the Q2 priority: reduced friction, interoperability, standards adherence, documentation and examples, and lower total cost of ownership.

### 4. Backward Compatibility

No backward compatibility impact.

---

## Milestones and Deliverables

### Milestone 0: dAppBooster for Canton v0.1 (already built)

- **Focus:** Recognition of the developer-experience foundation already shipped, published, and live before submission. The starting line for the work ahead.
- **Description:** v0.1 collapses the local Canton dApp setup into a one-command install and demonstrates CIP-0103 end-to-end. Open-source components (one of which is an end-to-end example dApp) were built and operated by BootNode, out of its operations budget.
- **Deliverables / Value Metrics:**
  - canton-barebones: working local Canton runtime with one-command bring-up.
  - Carpincho: CIP-0103 Sync browser wallet with encrypted local vault and Ed25519 signer.
  - wallet-service: CIP-0103 Async server (external party creation, transaction prepare/sign/execute).
  - react-starter: React frontend integrated with the upstream Canton dApp SDK and Carpincho.
  - An end-to-end example dApp exercising the full Daml-contracts -> working-dApp-UI loop.
  - Repository: [github.com/BootNodeDev/cn-dappbooster](https://github.com/BootNodeDev/cn-dappbooster), MIT licensed.
  - Public landing page: [dappbooster.cc](https://dappbooster.cc).
  - Used to build the Dark Pool project, winner of the EthGlobal NYC 2026 Canton Foundation track.
- **Estimated Effort:** 0 weeks (already built and live at submission).

### Milestone 1: dAppBooster MVP

- **Focus:** The smallest adoptable slice of the stack: take a developer from zero to a running CIP-0103 dApp on a local Canton environment.
- **Description:** Combines two pieces into one MVP:
  - (1) canton-barebones. Evolves from a fixed runtime into a composable CLI that assembles a local Canton environment from modules (the Splice bundle, wallet-gateway, PQS optional), building no auth of its own.
  - (2) A minimal version of dAppBooster:
    - Family of hooks, wagmi-canonical with connection logic CIP-0103 compatible
    - Family of React components: connect button, party input, explorer link, hash handling, token component.
    - This hardens the v0.1 proof-of-concept into a reusable starter others build on; productionizing it, not rebuilding it.
- **Deliverables / Value Metrics:**
  - canton-barebones composable CLI, released in a public GitHub repo; documented module composition and workspace bring-up.
  - dAppBooster connection logic plus one React binding (wagmi-canonical), and a series of reusable components, released in a public, documented, GitHub repo.
  - One working example dApp: running CIP-0103 dApp, connecting to any CIP-0103 wallet to sign.
  - Agentic-ready documentation, CLI commands, scaffold, module composition.
- **Estimated Effort: 5 weeks**

### Milestone 2: Adoption

- **Focus:** Demonstrate real, externally verifiable developer adoption of the MVP. This is the explicit gate: the fuller vision is not requested in this proposal and returns only as follow-on proposals if the adoption evidence here supports them.
- **Description:** A 12-week adoption window from Milestone 1 acceptance, with a single committee review at its close. The bar is calibrated to what an MVP can get in 12 weeks: external developers getting through the loop, choosing to build on it, and engaging with its evolution. Production deployments are the adoption bar for follow-on proposals, not this one. Usage by BootNode or affiliated parties does not count.
- **Enablement program:** 2 public workshops or hackathon sessions, a getting-started tutorial per release, and office hours through the window on a public schedule.
- **Adoption tiers:** assessed once at window close on composite evidence (written attestations, repository/issue evidence, public hackathon submissions, recorded demos).
  - **Tier 1: Validated.** At least 10 external developers complete the zero-to-running-dApp path. 150,000 CC.
  - **Tier 2: Building.** Validated + at least 2 external prototypes, PoCs, or hackathon projects on the stack (public repo or recorded demo) and at least 3 external contributions or substantive feedback items. 150,000 CC.
  - Reported but not paid: npm downloads, forks, stars, workshop attendance.
- **Deliverables:** Published adoption report (evidence per tier, external feedback, usage patterns) plus a recommended follow-on scope. This report is the evidence base for any future proposal.
- **Payment:** 375,000 CC at the window-close review: 75,000 CC against the enablement program and adoption report, plus the tier payouts above (cumulative).
- **Time window:** 12 weeks from Milestone 1 acceptance; review date fixed.

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone.
- Demonstrated functionality or operational readiness.
- Documentation and knowledge transfer provided.
- Alignment with the adoption tiers and verification methods defined in Milestone 2.

**Already shipped as v0.1 (live at proposal submission; it will be replaced by this MVP):**

- canton-barebones: one-command local Canton runtime.
- react-starter: React frontend on Canton's dApp SDK, with reusable components.
- End-to-end example dApp exercising the full loop.
- Repository: [github.com/BootNodeDev/cn-dappbooster](https://github.com/BootNodeDev/cn-dappbooster), MIT licensed
  - Open to upstreaming into [canton-network/wallet](https://github.com/canton-network/wallet), in coordination with the Foundation.
- Public landing page: [dappbooster.cc](https://dappbooster.cc)

---

## Funding

**Total Funding Request:** 750,000 CC

### Payment Breakdown by Milestone

- Milestone 1 - dAppBooster MVP: 375,000 CC. Trigger: Tech & Ops Committee acceptance of all Milestone 1 deliverables.
- Milestone 2 - Adoption: 375,000 CC. Trigger: a single committee review at the close of the adoption window, releasing:
  - 75,000 CC against the delivered adoption program and the published adoption report
  - 150,000 CC if the Validated adoption tier is met
  - 150,000 CC if the Building tier is met (cumulative with Validated)

Payments are released on Tech & Ops Committee acceptance only. No funds are requested upfront or retroactively.

### Volatility Stipulation

The delivery phase (Milestone 1) runs 5 weeks, and the Milestone 2 adoption window closes approximately 4.5 months from grant approval, keeping the full engagement within the 6-month horizon of CIP-0100. The grant is denominated in fixed Canton Coin, and BootNode assumes price volatility risk. No interim re-evaluation of un-minted milestones is expected. If Committee-requested scope changes or delays outside BootNode's control extend the engagement beyond 6 months from approval, the remaining un-minted milestone will be renegotiated to account for material CC/USD volatility, per CIP-0100.

### Timeline Accountability

- **SLA Penalty:** A 10% reduction of the Milestone 1 payment will be applied for each full month of delay beyond the estimated delivery date. If Milestone 1 is more than 2 full months delayed due to reasons within BootNode's control, the terms of the agreement will be revisited by BootNode and the Tech & Ops Committee. The Milestone 2 review date is fixed at Milestone 1 acceptance plus 12 weeks and does not move with adoption results; if the adoption report is not delivered at the review date, the same 10%-per-month reduction applies to the enablement portion of the Milestone 2 payment.
- **Audit funding:** Not required in this proposal.

---

## Why BootNode?

BootNode is a high-trust engineering collective partnering with founding teams, foundations, and protocols to build, launch, and scale Web3 products. Our team of engineers has been building Web3 products together **since 2017**, with 30+ dApps shipped across the Ethereum ecosystem.

Major projects we have contributed to include **MakerDAO, Aave, Derive, Hyperlane, Eigenlayer, Gelato Network, Nexus Mutual, and Uniswap**. We were a **core contributor to Safe** (Gnosis Safe) in earlier years, shipping work on the Safe React App, the Safe Apps SDK, and the Safe Apps ecosystem. We have shipped on **POA Network** (EVM bridges, Proof-of-Authority validator-set governance App, Token Wizard) and continued through its pivot into **xDAI Chain**, which became **Gnosis Chain** (Unified Bridge + Explorer, Gnosis Pay, Cow Protocol, and others). Recent engagements include **Infinex, Wormhole, and the Open Intents Framework** (funded by the Ethereum Foundation). More project case studies are at [bootnode.dev/case-studies](https://www.bootnode.dev/case-studies).

The contribution model is consistent across these engagements: an interdisciplinary POD team that takes full ownership of the work from ideation through adoption, partnering with the organization rather than acting as an external vendor.

### Aligned incentives

BootNode routinely accepts project tokens as a portion of compensation, and at times, the full payment is in tokens. The intent is long-term alignment: BootNode succeeds when the project succeeds, and our work directly contributes to the token's utility rather than being treated as a one-shot deliverable.

### Capability areas

| Area | Examples from BootNode's portfolio |
| :---- | :---- |
| Smart contracts and protocol design | MakerDAO, Aave, Synthetix, Eigenlayer, Nexus Mutual, Hyperlane, Revert / Uniswap (Uniswap v4 StableSwap hook) |
| dApp / frontend / UI | NTT Launchpad (Wormhole) and Portal, xERC20 Launchpad (Everclear), Derive Finance, Covenant Finance |
| **DevEx and dev tooling** | **dAppBooster for EVM** (the direct EVM analog of this proposal), DMe notification framework, Uniswap Frontend SDK, reference implementations across multiple ecosystems |
| Cross-chain and bridges | Hyperlane, Wormhole, Connext / Everclear, Khalani, Gnosis Bridge + Explorer |
| Wallets and account abstraction | **Safe** (prior core contributor), NFTfi Rights Management Wallet, **zkSync** Azure SSO multisig wallet, Aztec privacy wallet PoC, BootNode Agentic Wallet (ERC-7702 + passkeys + MCP) |
| Infrastructure | Gnosis Chain validators, The Graph Indexers, relayers (Hyperlane OIF, Warp Rebalancer) |
| Privacy | Zama Confidential Payroll dApp (FHE), Optimism anonymous-voting, Aztec privacy wallet PoC |

BootNode runs infrastructure when it adds value to the ecosystems we work with, rather than as a separate commercial line.

### Direct analog: dAppBooster for EVM

The dAppBooster for Canton stack is built by the same team, with the same architectural conventions, that produced [dAppBooster for EVM](https://dappbooster.dev): an open-source development stack for the Ethereum ecosystem, distilled from BootNode's experience shipping 30+ dApps and supported by **Optimism** and the **Ethereum Foundation**. The project is actively maintained at [github.com/bootnodedev/dappbooster](https://github.com/bootnodedev/dappbooster). The Canton version applies the same architecture, conventions, and developer-experience lessons learned, adapted for the Canton ledger and CIP-0103.

### Support from other teams

> *"dAppBooster pairs perfectly with Daml Autopilot: write and validate your Daml with Autopilot, then ship a running full-stack dApp fast with dAppBooster. It makes building on Canton much easier."*
> — Colin Schwarz, Program Lead, ChainSafe

## Maintenance

- All code produced under this grant is published open source (MIT)
- Contributions are welcomed via GitHub Issues and PRs.
- During the Milestone 2 adoption window, BootNode triages issues and ships fixes as part of driving adoption; feedback and requests collected there are documented in the adoption report.
- Maintenance beyond the adoption window is intentionally not funded by this proposal. If the adoption bar is met, maintenance will be brought as part of a separate grant.

---

## Co-Marketing

Upon MVP release, BootNode will coordinate with the Canton Foundation on:

- A joint announcement.
- A technical blog post documenting the new components and their integration patterns.
- A walkthrough video showing a dApp built end-to-end against the milestone's deliverables.
- An updated entry in the Canton developer documentation linking to the stack and the example.

---

## Motivation

Building a Canton dApp today means wiring up a participant, synchronizer, JSON Ledger API, persistence, auth, and a wallet, then implementing CIP-0103 discovery, connection, and signing in application code. Weeks of setup before any business logic runs. That friction is the biggest tax on Canton's "App Building and Developer Experience" priority: reduced friction, interoperability, standards adherence, documentation and examples, and lower total cost of ownership.

dAppBooster collapses that setup: canton-barebones removes the local-environment work; the wagmi-canonical hooks and React components remove the CIP-0103 wiring; and the working example gives teams a running, wallet-agnostic dApp to fork. Nothing here reimplements Canton's SDK, wallet, or standards work. It consumes them, so a team's first day goes to their product, not their plumbing.

**Expected adoption.** Every new Canton dApp building under CIP-0103 is a potential consumer of the stack, particularly developers arriving from an Ethereum or Solana background, for whom the wagmi-style surface is immediately familiar. The stack was validated end-to-end by BootNode's own Dark Pool build, winner of the EthGlobal NYC 2026 Canton Foundation track. The committed adoption bar, its tiers, and its verification methods are defined in Milestone 2.

**Built on years of dAppBooster for EVM.** dAppBooster for Canton is not new from thin air. The EVM-side [dAppBooster](https://dappbooster.dev) has been shipping and improving with web3 builders for years (see [github.com/BootNodeDev/dAppBooster](https://github.com/BootNodeDev/dAppBooster) for the project history). The Canton version is built by the same BootNode team and applies the same architecture, best practices, and developer-experience lessons learned, adapted for the Canton ledger and CIP-0103.

---

## Rationale

Why a dedicated developer-first dApp stack? The Canton ecosystem already has wallet and SDK proposals in flight. This section names them and draws the lines of differentiation, so the Committee can see this proposal extends and consumes existing work rather than duplicating it. Besides, rather than keeping the result as a standalone stack, BootNode is open to contributing suitable components upstream into the relevant Canton repositories (including [canton-network/wallet](https://github.com/canton-network/wallet)), where the Foundation and repo maintainers see a fit and with scope agreed together.

[**PR #90: Open Source Reference Wallet (Digital Asset, Approved)**](https://github.com/canton-foundation/canton-dev-fund/issues/90)**.** PR #90 ships the Splice Portfolio dApp UI and the Splice Wallet browser extension. dAppBooster does not ship a wallet. It is wallet-agnostic, targeting the CIP-0103 dApp API so any compliant wallet serves any dApp built with it. The reference wallet drops straight into dAppBooster's loop as a default signer; there is no overlap to reconcile.

[**PR #69: Canton Network dApp SDK and Tooling (Digital Asset, Approved)**](https://github.com/canton-foundation/canton-dev-fund/pull/69)**.** PR #69 ships the production dApp SDK, a Wallet Compliance Test Suite, a React Wrapper Library, and a dApp Starter Template by end of Q4 2026. dAppBooster is downstream of it: its hooks build on @canton-network/dapp-sdk rather than reimplementing it, and stay wagmi-canonical so they can later delegate to PR #69's React Wrapper without breaking consumers. dAppBooster's CLI complements (not replaces) PR #69's Starter Template.

Audiences differ: PR #69 targets top production dApps retrofitting CIP-0103; dAppBooster targets developers who need a working answer today.

[**PR #318: Denex Localnet (Denex, Approved)**](https://github.com/canton-foundation/canton-dev-fund/issues/318)**.** PR #318 ships a declarative Canton topology engine: a Testcontainers-style SDK, a single YAML config format, a CLI for managing localnets via the Docker API, and runtime state inspection.

**canton-barebones** sits at a different abstraction level. Where Denex Localnet describes which Canton nodes exist and how they connect, canton-barebones assembles a running environment (Splice bundle, optional PQS and upstream wallet-gateway) that a dApp runs against out of the box.

Topology configuration is not the deliverable; the workflow is.

The two complement each other: a developer modeling a custom Canton topology reaches for Denex Localnet, while a developer who just wants a working environment to build against reaches for canton-barebones. Where custom topology is needed, canton-barebones can consume Denex Localnet for the underlying node orchestration, treating it as an Approved upstream rather than reimplementing the topology layer.

[**PR #109: Wallet Gateway Reference Implementation (Approved) & self-issued OIDC.**](https://github.com/canton-foundation/canton-dev-fund/issues/109) Both are consumed, not rebuilt. canton-barebones optionally composes the upstream wallet-gateway; authentication in production-like contexts relies on the validator's OIDC / self-issued OIDC. dAppBooster adds no wallet-gateway fork and no identity provider of its own.

**Why not just extend an existing component?** Each piece: Canton participant, Daml SDK, CIP-0103 spec, dApp SDK, wallet-gateway reference, is available, but no project assembles them into a single one-command path from zero to a running dApp (infrastructure, backend, and frontend). That integration layer is the gap this proposal closes.
