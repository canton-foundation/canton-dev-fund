## Development Fund Proposal

**Author:** BootNode  
**Status:** Draft  
**Created:** 2026-05-28  
**Label:** dapp-integration, wallet-apps  

---

## Abstract

dAppBooster for Canton **v0.1** is an open-source local development stack, shipping today at [https://github.com/BootNodeDev/cn-dappbooster](https://github.com/BootNodeDev/cn-dappbooster), that lets a Canton dApp developer go from Daml contracts to a working dApp UI on a laptop. It includes a self-custodial CIP-0103 browser wallet (Carpincho), a CIP-0103 Async dApp API bridge (wallet-service), one-command local Canton infrastructure (canton-barebones), a React frontend starter, and a working end-to-end example dApp. v0.1 removes the OIDC, custodial-wallet-provider, and production-backend setup that currently sits between a Canton developer and the application code they write.

**This proposal funds the evolution of v0.1 toward its core thesis: a Canton user should be able to install one self-custodial wallet, create their external parties within it, and use those same parties to connect to any dApp on any validator. The keys never leave the wallet. The same identities work everywhere. No dApp or validator can lock the user in.**

---

## Specification

### 1\. Objective

Canton's Q2 "App Building and Developer Experience" priority area lists reduced developer friction, interoperability across wallets and dApps, wallet gateway and dApp standards, documentation and examples, and lower total cost of ownership. dAppBooster for Canton **v0.1, shipping today**, already collapses local environment setup into a one-command install and demonstrates CIP-0103 end-to-end.

**This proposal funds the evolution of v0.1 around a single thesis:** in Canton's external party model, a user's identities and signing keys belong to the user, not to any one validator or any one dApp. The reference workflow this stack must demonstrate is therefore **a single self-custodial wallet that holds keys for the user's external parties and interacts with multiple dApps across multiple validators.** The v0.1 establishes the local loop; this proposal delivers the components needed to make that cross-validator, cross-dApp workflow production-shaped: wallet-based identity at the validator boundary (SIWC), per-account scoped sessions via the upstream wallet-gateway, a composable scaffold that can stand up production-like contexts, and a developer-grade wallet that holds up across real apps and real validators.

### 2\. Implementation Mechanics

**The starting point is v0.1, already published.** v0.1 ships as five open-source components, one of which is an end-to-end example dApp.

**Architecture**

![bootnode-canton-dappbooster-dev-stack-architecture](https://www.dappbooster.cc/share/components-flow.jpeg)

**canton-barebones** is the minimal Canton infrastructure layer: a Canton participant, a local synchronizer, Postgres, the JSON Ledger API, local dev token generation, DAR deployment scripts, and health checks. It intentionally excludes Keycloak/OIDC, PQS, the Splice layer, the business backend, and the frontend app, so the base stays small and predictable. A developer starts from a working Canton runtime and adds only the pieces they need.

**Carpincho** is a self-custodial browser wallet that implements the Synchronous variant of the CIP-0103 dApp API. Keys are created and stored locally in the browser, and a single Carpincho instance can hold keys for any number of the user's external parties. Carpincho signs prepared Canton hashes locally only after the user approves in the wallet. Private keys never leave Carpincho.

**wallet-service** is the bridge between Carpincho and Canton, implementing the Asynchronous variant of CIP-0103. It exposes the operations Carpincho needs while wallet-gateway migration is not yet done: external party creation, transaction preparation, user-approval handoff, local signing, and execution of signed, prepared transactions. It does not store private keys and contains no example-specific business logic.

**react-starter** is a ready-to-start React frontend using the upstream Canton dApp SDK to connect to a wallet provider, build generic Daml commands, list accounts, read ledger state, and approve transactions. It works with any Daml application; the example is pre-wired.

**The example** is an end-to-end Canton dApp (backend plus frontend). One command brings the entire stack up. It exercises every step of the loop, including a Daml template, a DAR deploy, a paired browser wallet, and a signed Canton transaction, and serves as the fork point for developers building their own dApp.

**TL;DR:** One command brings the entire stack up. It exercises every step of the loop: a Daml template, a DAR deploy, a paired browser wallet, and a signed Canton transaction. It serves as the starting point for a developer to fork their own dApp.

**This proposal funds the evolution of the above into a stack that delivers the single-wallet, multi-party, multi-dApp, multi-validator workflow as a working reference.**

The milestones describe the work in detail. At a high level:

1. **Sign-with-Canton (SIWC)** replaces username/password-style auth at the validator boundary with JWTs issued against the party's own protocol signing keys, so the same wallet that signs Daml transactions also proves identity to every validator it talks to. This is what makes the workflow practical at the network level: the same wallet, the same keys, and the user's parties across many validators.
2. **The wallet-gateway external-wallet-signing-provider** closes the integration gap between the upstream Wallet Gateway (which today assumes server-reachable keys) and browser-resident wallets. This replaces wallet-service's broad technical user with per-account-scoped sessions, closing the v0.1 limitation where a single technical user wraps all of a user's external parties.
3. **canton-barebones becomes a CLI** that composes the Splice bundle, wallet-gateway, and SIWC IdP into production-like environments. This is the substrate against which the multi-validator workflow can actually be demonstrated, exercised, and tested.
4. **Carpincho hardens** into a developer-grade Canton wallet, with CIP-0056 token standard support, Canton Coin, transaction history, UTXO management, and headed and headless modes for Playwright-driven e2e CI.
5. **dAppBooster** unifies the toolset under a single CLI with reference UI components, updated docs, and a new example dApp showcasing the full single-wallet, multi-dApp, multi-validator workflow.

### 3\. Architectural Alignment

The stack is aligned with [**CIP-0103**](https://github.com/canton-foundation/cips/blob/main/cip-0103/cip-0103.md)**: dApp Standard**. Carpincho implements the Synchronous variant of the dApp API; wallet-service implements the Asynchronous variant. Any CIP-0103 dApp client can connect to Carpincho. Any CIP-0103 dApp SDK can drive the wallet service. This is what makes the thesis enforceable in practice: a wallet that speaks the standard interface can serve any dApp that speaks it, regardless of which validator hosts that dApp.

The stack consumes (does not duplicate or fork) the existing upstream components:

- The upstream **Canton dApp SDK** (used by react-starter).
- The **Wallet Gateway Reference Implementation** (PR \#109, Approved). The wallet-gateway milestone migrates from wallet-service to the upstream Splice wallet-gateway-remote and adds the external-wallet-signing-provider needed for browser-resident keys.

Q2 priority area: **App Building and Developer Experience**. The stack maps directly to the named sub-priorities: reduced developer friction, interoperability across wallets and dApps, adherence to wallet gateway and dApp standards, documentation and examples, and lower total cost of ownership for Canton dApp builders.

### 4\. Backward Compatibility

No backward compatibility impact.

---

## Milestones and Deliverables

### Milestone 0: dAppBooster for Canton v0.1 (Already Built)

- **Focus:** Recognition of the v0.1 work already shipped, published, and live before the grant submission. Establishes the starting line from which Milestones 1 to 5 evolve.
- **Description:** v0.1 collapses the local Canton dApp setup into a one-command install and demonstrates CIP-0103 end-to-end. The five open-source components (one of which is an end-to-end example dApp) were built and operated by BootNode out of its operations budget.
- **Deliverables / Value Metrics:**
  - canton-barebones: working local Canton runtime with one-command bring-up.
  - Carpincho: CIP-0103 Sync browser wallet with encrypted local vault and Ed25519 signer.
  - wallet-service: CIP-0103 Async server (external party creation, transaction prepare/sign/execute).
  - react-starter: React frontend integrated with the upstream Canton dApp SDK and Carpincho.
  - An end-to-end example dApp exercising the full Daml-contracts-to-working-dApp-UI loop.
  - Repository: [github.com/BootNodeDev/cn-dappbooster](https://github.com/BootNodeDev/cn-dappbooster), MIT licensed.
  - Public landing page: [dappbooster.cc](https://dappbooster.cc).
- **Estimated Effort:** 0 weeks (already built and live at submission).

### Milestone 1: Sign-with-Canton (SIWC) identity provider

- **Focus:** Building a wallet-based authentication service for Canton Network external parties. It acts as a standards-compliant OIDC issuer that Canton Validator nodes can configure as a trusted Identity Provider.
- **Description:** Instead of issuing JWTs based on username/password or social login (as Keycloak or Auth0 do today), this service issues JWTs based on the party proving control of its protocol signing keys, the same keys it already uses to sign Daml transactions.
- **Deliverables / Value Metrics & Acceptance Criteria:**
  - Release in a public GitHub repo
  - Publicly accessible Docker image and Helm chart
  - Agentic readiness: as we see fit. Documentation, tools.
  - Fully documented code and documentation
- **Estimated Effort:** 4 weeks

### Milestone 2: Extending wallet-gateway

- **Focus:** Extending wallet-gateway with an external-wallet-signing-provider.
- **Description:** The Wallet Gateway's existing signing providers all assume server-reachable keys (its own database, a participant node, or a custody backend like Fireblocks, Blockdaemon, or Dfns). A self-custodial web wallet, whose keys live in the browser, has no path. This milestone closes the gap by adding a Wallet Gateway signing provider for browser-resident wallets, plus the wire protocol and reference SDK that a web wallet needs to integrate.  
- **Deliverables / Value Metrics:**
  - PR created and merged in wallet-gateway repository:
    - Supporting signing with self-custodial wallets
    - Fully documented
    - Fully compliant with existing policies
- **Estimated Effort:** 2 weeks

### Milestone 3: canton-barebones

- **Focus:** Go from a single opinionated Canton runtime (canton-barebones) into a configurable scaffold that developers compose from a CLI to provide the dApp with a production-like running context.
- **Description:** Replace canton-barebones with a minimal CLI that assembles a Canton environment from composable modules (Splice bundle \+ wallet-gateway \+ IdP from milestone 2). One scaffold serving first-day local dev.
- **Deliverables / Value Metrics:**
  - CLI released in a public GitHub repo
  - Documentation covering CLI commands, module composition, and workspace bring-up.
  - Agentic readiness: as we see fit. Documentation, tools.
- **Estimated Effort:** 3 weeks

### Milestone 4: Carpincho

- **Focus:** Making Carpincho a developer-oriented canton wallet.
- **Description:** Extend Carpincho’s feature set with required features (and more) to become a complete development wallet. Aiming for a great user experience without losing focus on the dev-first oriented original approach.
- **Deliverables / Value Metrics:**
  - A developer-oriented wallet shipped as a browser extension, featuring:
    - Support for the CIP-0056 token standard
    - Support specifically for Canton Coin
    - Transaction history
    - Token Standard V2
  - Assessment of:
    - Canton Coin pre-approvals
    - Hold and transfer USDCx
    - Pre-approvals for DA Registry-issued assets
    - Memo tag support to allow deposits to be sent to exchanges
    - UTXO management to reduce the number of UTXOs
  - Headed and headless modes, which will make Carpincho play nice with Playwright and be useful for e2e testing/CI.
  - Release in a public GitHub repo
  - Documentation covering setup, supported token operations, and Playwright integration patterns.
- **Estimated Effort:** 6 weeks

### Milestone 5: dAppBooster

- **Focus:** Releasing a new version of dAppBooster, bundling all previous milestones’ deliverables.  
- **Description:** Unify the entire toolset developed to date under the dAppBooster umbrella into a single CLI that helps and guides developers through the dApp development workflow. Providing UI components from the EVM dAppBooster, agentic-friendly documentation, and easy workspace setup. Making it super easy to add and remove components.
- **Deliverables / Value Metrics:**
  - Demo components, including but not limited to: Token selection, token input, connect button, explorer link, and hash handling.  
  - Full CLI workflow
  - Updated dAppBooster Canton landing page
  - Updated dAppBooster Canton documentation
  - A worked end-to-end example exercising the proposal's thesis: a single Carpincho instance holding keys for multiple external parties, connecting to multiple dApps deployed across multiple Canton validators, signing across all of them with (sign-in) or without (sign-up) per-app identity creation or custodial trust (sign-in).
- **Estimated Effort:** 4 weeks

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone.
- Demonstrated functionality or operational readiness.
- Documentation and knowledge transfer provided.
- Alignment with the stated adoption metrics.

**Already shipped as v0.1 (live at proposal submission):**

- canton-barebones: working local Canton runtime with one-command bring-up.
- Carpincho: CIP-0103 Sync browser wallet with encrypted local vault and Ed25519 signer.
- wallet-service: CIP-0103 Async server, external party creation, transaction prepare/sign/execute.
- react-starter: React frontend integrated with the Canton dApp SDK and Carpincho.
- An end-to-end example dApp exercising the full loop.
- Repository: [github.com/BootNodeDev/cn-dappbooster](https://github.com/BootNodeDev/cn-dappbooster), MIT licensed.
- Public landing page: [dappbooster.cc](https://dappbooster.cc)

**Per-milestone acceptance signals (funded work):** see the Payment Trigger column in the Funding section.

---

## Funding

**Total Funding Request:** 1,750,000 CC

### Payment Breakdown by Milestone

| Milestone | Effort | Payment on Acceptance | Payment Trigger |
| :---- | :---- | :---- | :---- |
| M0: dAppBooster for Canton v0.1 (already built) | 0 weeks | 0 CC | Already delivered; no payment requested |
| M1: Sign-with-Canton (SIWC) identity provider | 4 weeks | 370,000 CC | Committee acceptance \+ SIWC identity provider released in a public GitHub repo \+ docker image and helm chart published |
| M2: wallet-gateway external-wallet-signing-provider | 2 weeks | 180,000 CC | Committee acceptance \+ PR merged into the wallet-gateway repository, with the external-wallet-signing-provider live in a published release |
| M3: canton-barebones CLI | 3 weeks | 280,000 CC | Committee acceptance \+ composable CLI released in a public GitHub repo with documented module composition and workspace bring-up |
| M4: Carpincho developer wallet | 6 weeks | 550,000 CC | Committee acceptance \+ browser extension released in a public GitHub repo supporting CIP-0056 and Token Standard V2, with headed and headless modes for Playwright |
| M5: dAppBooster v1 bundle \+ worked example | 4 weeks | 370,000 CC | Committee acceptance \+ unified CLI shipped \+ worked end-to-end example demonstrating a single Carpincho instance signing across multiple dApps deployed on multiple Canton validators |
| **Total** | **19 weeks** | **1,750,000 CC** | |

Per-milestone payments are released on Tech & Ops Committee acceptance against the deliverables and acceptance signals stated for that milestone.

### Volatility Stipulation

The grant duration is 19 weeks. The grant is denominated in fixed Canton Coin, and the proposer assumes price volatility risk. Should scope changes requested by the Committee push the project past 6 months, the remaining un-minted milestones will be renegotiated.

### Timeline Accountability

- **SLA Penalty:** A 10% reduction of the respective milestone payment will be applied for each full month of delay beyond the estimated delivery date. If any milestone is more than 3 full months delayed due to reasons within BootNode's control, the terms of the agreement will be revisited by BootNode and the Tech & Ops Committee.
- **Audit funding:** Not requested in this proposal. The deliverables in M1 to M5 are developer infrastructure rather than financial primitives; security review will be handled inside the engineering scope (threat model documentation, dependency review, CI security gates).

---

## Why BootNode?

BootNode is a high-trust engineering collective partnering with founding teams, foundations, and protocols to build, launch, and scale Web3 products. Our team of engineers has been building Web3 products together **since 2017**, with 30+ dApps shipped across the Ethereum ecosystem.

Major projects we have contributed to include **MakerDAO, Aave, Derive, Hyperlane, Eigenlayer, Gelato Network, Nexus Mutual, and Uniswap**. We were a **core contributor to Safe** (Gnosis Safe) in earlier years, shipping work on the Safe React App, the Safe Apps SDK, and the Safe Apps ecosystem. We have shipped on **POA Network** (EVM bridges, Proof-of-Authority validator-set governance App, Token Wizard) and continued through its pivot into **xDAI Chain**, which became **Gnosis Chain** (Unified Bridge \+ Explorer, Gnosis Pay, Cow Protocol, and others). Recent engagements include **Infinex, Wormhole, and the Open Intents Framework** (funded by the Ethereum Foundation). More project case studies are at [bootnode.dev/case-studies](https://www.bootnode.dev/case-studies).

The contribution model is consistent across these engagements: an interdisciplinary POD team that takes full ownership of the work from ideation through adoption, partnering with the organization rather than acting as an external vendor.

### Aligned incentives

BootNode routinely accepts project tokens as a portion of compensation, and at times, the full payment is in tokens. The intent is long-term alignment: BootNode succeeds when the project succeeds, and our work directly contributes to the token's utility rather than being treated as a one-shot deliverable.

### Capability areas

| Area | Examples from BootNode's portfolio |
| :---- | :---- |
| Smart contracts and protocol design | MakerDAO, Aave, Synthetix, Eigenlayer, Nexus Mutual, Hyperlane, Revert / Uniswap (Uniswap v4 StableSwap hook) |
| dApp / frontend / UI | NTT Launchpad (Wormhole) and Portal, xERC20 Launchpad (Everclear), Derive Finance, Covenant Finance |
| **DevEx and dev tooling** | **dAppBooster for EVM** (the direct EVM analog of this proposal), DMe notification framework, Uniswap Frontend SDK, reference implementations across multiple ecosystems |
| Cross-chain and bridges | Hyperlane, Wormhole, Connext / Everclear, Khalani, Gnosis Bridge \+ Explorer |
| Wallets and account abstraction | **Safe** (prior core contributor), NFTfi Rights Management Wallet, **zkSync** Azure SSO multisig wallet, Aztec privacy wallet PoC, BootNode Agentic Wallet (ERC-7702 \+ passkeys \+ MCP) |
| Infrastructure | Gnosis Chain validators, The Graph Indexers, relayers (Hyperlane OIF, Warp Rebalancer) |
| Privacy | Zama Confidential Payroll dApp (FHE), Optimism anonymous-voting, Aztec privacy wallet PoC |

BootNode runs infrastructure when it adds value to the ecosystems we work with, rather than as a separate commercial line.

### Direct analog: dAppBooster for EVM

The dAppBooster for Canton stack is built by the same team, with the same architectural conventions, that produced [dAppBooster for EVM](https://dappbooster.dev): an open-source development stack for the Ethereum ecosystem, distilled from BootNode's experience shipping 30+ dApps and supported by **Optimism** and the **Ethereum Foundation**. The project is actively maintained at [github.com/bootnodedev/dappbooster](https://github.com/bootnodedev/dappbooster). The Canton version applies the same architecture, conventions, and developer-experience lessons learned, adapted for the Canton ledger and CIP-0103.

## Maintenance

- All code produced under this grant will be published as open source. Contributions welcomed.
- BootNode commits 8 engineer-hours per month for the first 6 months post-grant to maintenance of the components listed above.
- Issues are submitted via GitHub Issues for the dAppBooster repository on Canton.
- Should the Canton Foundation require a formal maintenance commitment beyond the grant period, this can be structured as a separate recurring maintenance grant.

---

## Co-Marketing

Upon each milestone release, BootNode will coordinate with the Canton Foundation on:

- A joint announcement at each milestone release.
- A technical blog post documenting the new components and their integration patterns.
- A walkthrough video showing a dApp built end-to-end against the milestone's deliverables.
- A presentation at an upcoming Canton or developer ecosystem event (specific event to be agreed with the Foundation).
- An updated entry in the Canton developer documentation linking to the stack and the example.

---

## Motivation

Canton's "App Building and Developer Experience" priority area calls out reduced developer friction, interoperability across wallets and dApps, wallet gateway and dApp standards, documentation and examples, and lower total cost of ownership. A developer who wants to ship a Canton dApp today has to wire up a local participant, synchronizer, JSON Ledger API, persistence, auth, and a wallet, then implement CIP-0103 wallet discovery, connection, and transaction signing in their own application code. Each step is solvable, but together they amount to weeks of setup before any business logic runs.

dAppBooster for Canton collapses that setup into one install. canton-barebones removes the local-environment work. Carpincho gives developers a published CIP-0103 wallet they can use on day one. wallet-service handles the CIP-0103 Async server-side until the wallet-gateway migration. react-starter and the example give developers a working frontend and a working flow to fork.

**Adoption target.** Every new Canton dApp building under CIP-0103 is a potential consumer of the stack. Particularly those developers who have an Ethereum and Solana background.

**Built on years of dAppBooster for EVM.** dAppBooster for Canton is not new from thin air. The EVM-side [dAppBooster](https://dappbooster.dev) has been shipping and improving with web3 builders for years (see [github.com/BootNodeDev/dAppBooster](https://github.com/BootNodeDev/dAppBooster) for the project history). The Canton version is built by the same BootNode team and applies the same architecture, best practices, and developer-experience lessons learned, adapted for the Canton ledger and CIP-0103.

---

## Rationale

Why a dedicated developer-first dApp development stack? The Canton ecosystem already has wallet and SDK proposals in flight. This Rationale names them and explicitly draws the lines of differentiation so the committee can see that this proposal extends, rather than duplicates, existing work.

[**PR \#90: Open Source Reference Wallet (Digital Asset, Approved)**](https://github.com/canton-foundation/canton-dev-fund/issues/90)**.** PR \#90 ships the Splice Portfolio dApp UI and the Splice Wallet Browser Extension. The Splice wallet extension overlaps directly with Carpincho: both are CIP-0103 browser extensions, both open-source, both target the same dApp connection flow. The two proposals differ in three ways:

1. First, the reference workflow each one demonstrates. dAppBooster's reference is a different shape: a single self-custodial wallet that holds keys for any number of the user's external parties, interacting with multiple dApps across multiple validators, using the same keys and the same identities throughout. That is the network-topology side of CIP-0103, which the standard enables but which no existing reference demonstrates.
2. Second, timing. Carpincho ships today as part of dAppBooster v0.1; the wallet extension from PR #90 lands by October 2026\.
3. Third, implementation diversity. CIP-0103 hardens faster when multiple independent implementations exercise it, especially across different reference workflows. Two wallets pushing on the spec from different angles is a feature, not a redundancy.

The two proposals complement rather than compete. PR \#90 is the production reference a wallet provider or exchange will look to; dAppBooster (and Carpincho with it) is the dev-loop reference a dApp team will fork from.


[**PR \#318: Denex Localnet (Denex, Approved)**](https://github.com/canton-foundation/canton-dev-fund/issues/318)**.** PR \#318 ships a declarative Canton topology engine: a Testcontainers-style SDK, a single YAML config format, a CLI for managing localnets via the Docker API, and runtime state inspection.

canton-barebones is at a different abstraction level. Where Denex Localnet describes which Canton nodes exist and how they connect, canton-barebones assembles the components needed to exercise this proposal's thesis end-to-end (Splice bundle, the wallet-gateway with the external-wallet-signing-provider extension, SIWC OIDC, and Carpincho) into a running environment that demonstrates the single-wallet, multi-party, multi-validator workflow out of the box.

Topology configuration is not the deliverable; the workflow is.

The two stacks complement each other in practice: a developer modeling a custom Canton topology reaches for Denex Localnet, while a developer wanting the thesis workflow ready to run reaches for canton-barebones. Where topology demands require it, Canton-barebones can consume Denex Localnet for the underlying node orchestration, treating it as an Approved upstream rather than reimplementing the topology layer.

[**PR \#69: Canton Network dApp SDK and Tooling (Digital Asset, Approved)**](https://github.com/canton-foundation/canton-dev-fund/pull/69)**.** PR \#69 ships the production dApp SDK, a Wallet Compliance Test Suite, a React Wrapper Library, and a dApp Starter Template CLI by the end of Q4 2026.

dAppBooster builds on the outputs of PR \#69 rather than competing with them. The React layer in react-starter is already running against the current `@canton-network/dapp-sdk`, with a wagmi-style hook surface and working browser extension and WalletConnect connectors. Developers starting a Canton dApp now have a usable React entry point.

The dependency direction stays downstream: dAppBooster's hooks build on `@canton-network/dapp-sdk` rather than reimplementing it. Hook signatures are deliberately wagmi-canonical, so the implementation underneath can later delegate to PR \#69's React Wrapper without breaking any consuming dApp.

react-starter wraps those hooks inside an opinionated environment with Carpincho, canton-barebones, and Playwright fixtures (the same dependency direction as `create-next-app` to React). Milestone 5's CLI is a workspace orchestrator that would consume PR \#69's Starter Template as one of its scaffolds, not a file-structure generator of its own.

Audiences differ: PR \#69's Milestone 4 targets the top-15 production dApps retrofitting CIP-0103. dAppBooster targets developers who need a working answer today.

Carpincho commits to passing PR \#69's Wallet Provider Compliance Test Suite at v1.0 as part of the acceptance criteria for Milestone 4.

**Approved precedents this proposal builds on, not against.** This proposal explicitly consumes rather than replaces: the Canton dApp SDK (used by react-starter) and the Wallet Gateway Reference Implementation (PR \#109, Approved, target of the v1.0 wallet-service migration).

**Why not extend an existing component?** This proposal is the missing integration layer between several existing components. Each individual piece (Canton participant, Daml SDK, CIP-0103 spec, wallet-gateway reference) is available, but no project assembles all of them into a single one-command developer entry point with a self-custodial wallet ready to sign on day one. That is the gap this proposal closes.
