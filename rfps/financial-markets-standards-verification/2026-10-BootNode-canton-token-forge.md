# Development Fund Proposal: canton-token-forge

| Field | Value |
| :---- | :---- |
| Authors | Pablo Fullana <pablo@bootnode.dev> |
| Org | [BootNode](https://bootnode.dev) |
| Status | Draft |
| Created | 2026-10-09 |
| PR | [TBD] |
| Proposal Type | RFP-aligned |
| RFP / Roadmap Area | Primary: RFP-12 RWA Standards, Daml and Institutional RWA Workflow Standards (Financial Markets, Standards & Verification). Secondary: RFP-19 DPM Components and Extension Ecosystem |
| Champion | Needs Champion |
| Total Funding Request | 750,000 CC |
| Project Duration | ~4 months (Milestone 1 within 2 months, Milestone 2 within 4 months; Milestone 0 is the delivered baseline) |
| Label | token-asset-standards |

---

## Abstract

**canton-token-forge** is an open-source (MIT) reference token for the Canton Network Token Standard: a Daml package that implements the standard interfaces, plus the off-ledger registry HTTP service a wallet or dApp needs to actually submit transfers and allocations against it. Version 0.3.0 is the current release and covers the registry side of CIP-0056 (v1): holdings, both transfer paths, allocations for DvP settlement, burn-mint, a faucet, and many instruments per admin.

This proposal funds taking it to **1.0 with CIP-0112 (Token Standard v2) support alongside v1**, packaging it as a standalone dpm component that deploys it against any participant, Splice LocalNet included, and then proving it as the second, non-Amulet token backend in real test suites: the canton-network/wallet repository, dAppBooster for Canton, and at least one external team. The value to the ecosystem is a maintained, deployable token that every wallet, dApp and settlement venue can test against, so that token-standard integrations stop being accidentally Amulet-specific and v2 adoption has a registry to exercise from day one.

---

## Specification

### 1. Objective

Give every team integrating the Canton Network Token Standard a single, reusable, non-Amulet token that implements both v1 (CIP-0056) and v2 (CIP-0112) through the standard interfaces and the standard registry APIs, and that is wired into the test suites where integrations are written.

This is, in RFP-12's own terms, a **reference implementation with conformance tests**. Its "Daml and Institutional RWA Workflow Standards" area asks for "Token and asset representation standards", "Issuance, transfer, redemption, and cancellation workflows", "Delivery-versus-payment and settlement-flow patterns" and "Conformance tests and reference implementations", and requires that proposals "support multiple issuers and applications rather than a single proprietary implementation". canton-token-forge is precisely that: a multi-instrument reference token any issuer can deploy from the same package, each running its own registry service, that any application can test against. The standard it implements was itself funded under this same RFP, whose prior example is the Token Standard v2 proposal; canton-token-forge is the deployable, registry-backed counterpart to it.

It secondarily responds to RFP-19, DPM Components and Extension Ecosystem: it ships as a standalone, broadly reusable dpm component (a testing utility a team installs with `dpm add component`), which is the kind of first-class, reusable extension that RFP calls for.

Milestone 1 implements CIP-0112, approved in June 2026. The roadmap notes that CIPs requiring a technical implementation "may also be treated as Foundation Requests for Proposals once those CIPs have been approved by the Super Validators", and a registry-side implementation of v2 is that kind of work.

The proposal has a single objective: a reference token for both standard versions, and its adoption by real test suites. Milestone 0 is the v1 implementation already delivered; Milestone 1 builds v2 and the 1.0; Milestone 2 proves real projects use it.

### 2. Implementation Mechanics

**What exists today.** Two components, released together as a tagged GitHub release with a byte-reproducible DAR:

- **The Daml package.** Six templates (`InstrumentConfig`, `Token`, `LockedToken`, `TokenTransferPreapproval`, `TokenTransferInstruction`, `TokenAllocation`) exposing seven interface instances. It data-depends only on the `splice-api-token-*` interface DARs, never on `splice-amulet`. Holdings are co-signed by the admin and the owner, matching Amulet's authority model, so a flow that works here does not rely on weaker authorization than a real registry would enforce.
- **The registry HTTP service** (TypeScript, Express). Serves the metadata, transfer-instruction, allocation and allocation-instruction APIs from the upstream OpenAPI specs, including the choice contexts and `disclosedContracts` a client forwards untouched when it submits the exercise itself. It is read-only: the service never holds keys or submits on anyone's behalf, which is exactly the boundary a real registry has.

Verification today: 80 Daml Script scenarios, 246 registry unit tests, and 18 end-to-end tests that drive both transfer paths against a live participant (verified against Canton 3.5.12) by asking the service for the factory and choice context, then submitting over the JSON Ledger API as a wallet would.

**What Milestone 1 adds.** CIP-0112 v2 next to v1 on the same holdings, so existing v1 clients keep working while v2 clients are added. It follows CIP-0112's backward-compatibility rules (section 5) and the pattern Splice's own `splice-test-token-v2` uses, rather than inventing a second migration model. Interface by interface:

- **Holding v2 and TransferInstruction v2.** New v2 interface instances on the existing holding and transfer-instruction templates.
- **TransferFactory v2 and AllocationFactory v2.** On `InstrumentConfig`, next to its v1 factories.
- **Allocation v2 (section 5.1).** Two allocation implementations, as CIP-0112 requires: a v1/v2 dual-compatible one and a v2-only one, since the v1 `Allocation` interface must not sit on an allocation that the v1 flow cannot settle.
- **SettlementFactory (section 4.3.1).** On `InstrumentConfig`. Settles a batch of allocations under configurable executors, so a venue can run a privacy-preserving batch settlement across many traders.
- **EventLog (section 4.3.5, `splice-api-token-transfer-events-v2`).** On `InstrumentConfig`. Makes every holding change visible in a standard, side-effect-free form, so wallets and indexers can parse transfers without token-specific logic.
- **Mint and burn special accounts (section 4.3.2.1).** CIP-0112 has no v2 successor to the v1 burn-mint interface: a mint is a transfer from the admin-managed account `cip-112/mint` and a burn is a transfer to `cip-112/burn`. Supporting both lets a venue include mint and burn legs in the same atomic settlement as ordinary transfers (delivery versus burn/mint), each reported through `EventLog`, so burn-mint carries over to v2 rather than ending at v1.

Around those interfaces:

- **Splice and SDK.** The build moves from Splice 0.6.7 / SDK 3.4.11 to the Splice 0.8.x line and SDK 3.5.2, which ship the v2 packages.
- **v2 registry endpoints.** The service gains the v2 transfer-instruction and allocation APIs and the v2 allocation-factory endpoint from the upstream v2 OpenAPI specs, next to the v1 ones, with the same choice-context and disclosure contract.
- **Standard-only conformance runs.** A suite that exercises every advertised flow through the standard interfaces and registry APIs only, never through a template's own choices (setup aside), plus a recorded run of the CN Token Standard CLI against the service, so a claim of compliance is backed by the standard's own tooling rather than by our tests.
- **dpm component.** canton-token-forge ships as a standalone dpm component, published to an OCI registry, so a team installs it with `dpm add component` and runs it as `dpm canton-token-forge`. It is configured with the participant's JSON Ledger API URL, its authentication and the admin party, runs on Linux and macOS with Node.js installed, and needs nothing else from the environment: one command uploads the DAR and seeds an admin and an instrument, another starts the registry service. The same commands work against a plain Splice LocalNet, any other local Canton environment or a DevNet participant, so a team gets a second token next to Amulet without adopting a particular local stack. The service is also published to npm (today it installs only from a git tag), and the DAR as a release asset.

#### Example

A wallet or dApp test that must not become Amulet-specific talks to canton-token-forge exactly as it would talk to any registry:

```ts
// 1. Discover the instrument from the registry.
const { instruments } = await registry.get('/registry/metadata/v1/instruments')

// 2. Ask the registry for the transfer factory and its choice context.
const factory = await registry.post('/registry/transfer-instruction/v1/transfer-factory', {
  choiceArguments: { expectedAdmin, transfer, extraArgs },
})

// 3. Submit the exercise as the sender, forwarding the context and disclosures untouched.
await ledger.submit({
  actAs: [sender],
  commands: [exerciseTransferFactory(factory.factoryId, transfer, factory.choiceContext.choiceContextData)],
  disclosedContracts: factory.choiceContext.disclosedContracts,
})
```

Nothing in that code names canton-token-forge. That is the point: a suite written against it runs against any compliant registry, and a suite written only against Amulet gains a second backend without changing its client code.

#### Scope and assumptions

**It is a reference and test token, not a production issuer.** There are no economics: no fees, decay, mining rounds, rewards or governance. Issuance is authorized by the instrument admin together with the recipient, and each instrument can enable a faucet with a per-tap cap so an unfunded test party can fund itself. It is suitable for LocalNet, DevNet, CI and demos; a production issuer would add the compliance and custody controls that are out of scope here.

**The settlement venue side stays out of scope.** `AllocationRequest` (v1 or v2) is the venue's interface, not the registry's, and is not implemented, as in v1 today. Every registry-side interface CIP-0112 requires is in scope, including `SettlementFactory` and `EventLog`, as are the special mint and burn accounts. The optional pending allocation instruction (`AllocationInstruction`) is not: CIP-0112 leaves it to the registry whether allocating needs a second party's approval, and here, as in Amulet, allocations complete immediately. The wallet-side batching utility (section 4.3.9, shipped in a wallet package) is also out of scope.

**The service is read-only by design.** It prepares choice contexts; the client signs and submits. It will not be turned into a custodial transfer API.

### 3. Architectural Alignment

canton-token-forge is built only on interfaces the ecosystem already standardizes: the `splice-api-token-*` DARs from CIP-0056 and CIP-0112, and the upstream registry OpenAPI specifications. It forks nothing and adds no protocol. Because it depends on the interfaces and not on `splice-amulet`, it is exactly the kind of second backend the standard needs: a deployable, registry-backed implementation that exposes integrations which quietly assumed Amulet.

It supports RFP-12's "Conformance tests and reference implementations" item directly, and its allocation support for DvP settlement serves the RFP's settlement-flow items; shipped as a standalone dpm component, it also answers RFP-19's call for broadly reusable DPM extensions. It complements rather than duplicates the existing token work: CIP-0112 defines v2, and Splice ships Daml test tokens for both versions; canton-token-forge is the deployable implementation with a running registry service that those standards and test tokens do not include.

### 4. Backward Compatibility

No backward compatibility impact on the network or on other applications. v2 is added alongside v1, never instead of it: v1 clients keep working against the 1.0 unchanged. The 1.0 DAR keeps the package name, and a participant accepts a package under an existing name only if it is a valid Daml smart-contract upgrade of the version already installed. The 1.0 is therefore built and checked as an upgrade of the v0.x package, so a participant already running v0.x accepts it and existing holdings carry over; a change that cannot be expressed as an upgrade ships under a new package name instead. This is how Splice moved Amulet to v2: `splice-amulet` kept its name from 0.1.19 (Splice 0.6.7) to 0.1.23 (Splice 0.8.4), added the v2 interface instances to its existing holding, transfer-instruction and allocation templates, and added a separate `AmuletAllocationV2` template for v2-only allocations. Consumers pinned to an existing v0.x tag keep that artifact until they choose to upgrade. The registry service keeps its v1 routes and adds the v2 ones under their own paths.

---

## Milestones and Deliverables

### Milestone 0: canton-token-forge v0.3.0 (delivered baseline, not evaluated)

- **Estimated Effort:** Delivered. ~4.5 weeks, funded by BootNode.
- **Focus:** The CIP-0056 v1 reference token, already shipped and released before submission, with its first downstream integration under way. It is the delivered baseline Milestones 1 and 2 build on.
- **Deliverables / Value Metrics:**
    - Daml package: six templates, seven interface instances, both transfer paths (two-step offer and one-step against a receiver preapproval), multi-output batch transfer, allocations (the registry side of DvP), burn-mint, per-instrument faucet, many instruments per admin with on-ledger name, symbol and decimals.
    - Registry HTTP service: metadata, transfer-instruction, allocation and allocation-instruction APIs, with choice contexts and explicit disclosure.
    - 80 Daml Script scenarios, 246 registry unit tests, 18 end-to-end tests against a live participant; CI on every pull request.
    - Three tagged releases (`v0.1.0`, `v0.2.0`, `v0.3.0`) with a byte-reproducible DAR verified by the release workflow.
    - First downstream consumer: dAppBooster for Canton's example dApp is moving its vesting flow from Canton Coin onto a canton-token-forge instrument (integration open as [canton-dappbooster PR #199](https://github.com/BootNodeDev/canton-dappbooster/pull/199)).
    - Repository: [github.com/BootNodeDev/canton-token-forge](https://github.com/BootNodeDev/canton-token-forge), MIT licensed.

### Milestone 1: canton-token-forge 1.0 (v1 + v2)

- **Estimated Effort:** ~5 weeks
- **Focus:** Add CIP-0112 v2 next to v1 and productize the result into a 1.0 that a team outside BootNode can add to its own environment and rely on.
- **Deliverables / Value Metrics:**
    - v2 interface instances for holding, transfer-instruction, allocation, the transfer factory and the allocation factory, coexisting with v1 on the same holdings, with the dual-compatible and v2-only allocation implementations CIP-0112 section 5.1 requires.
    - `SettlementFactory` batch settlement and the `EventLog` transfer event log.
    - Mint and burn through the `cip-112/mint` and `cip-112/burn` special accounts, including mint and burn legs in allocation-based settlement.
    - v2 registry endpoints in the service, next to the v1 ones.
    - Build moved to the Splice 0.8.x line and SDK 3.5.2.
    - A standard-only conformance suite covering v1, v2 and mixed v1/v2 flows, plus a recorded CN Token Standard CLI run against the service.
    - A standalone dpm component (`dpm canton-token-forge`), configured with the participant, authentication and admin party it targets, that uploads the DAR, seeds an admin and an instrument, and runs the registry service against a Splice LocalNet or any other participant, with a README an outside developer can follow.
    - 1.0 release: DAR versioned 1.0.0 (the v0.x releases ship it as 0.0.1) as a release asset, registry service published to npm, each release stating the SDK and Splice versions it was built against and the Canton version it was tested against.

### Milestone 2: Proving it on real test suites

- **Estimated Effort:** ~3 weeks
- **Focus:** Prove that the token is used as a second backend where token-standard integrations are actually tested, measured by suites running green against it.
- **Description:** Three consumers outside this repository. First, and most important, the canton-network/wallet repository, whose token-standard work ([canton-network/wallet#2105](https://github.com/canton-network/wallet/issues/2105), with the end-to-end test in [canton-network/wallet#2109](https://github.com/canton-network/wallet/issues/2109) and the LocalNet DAR in [canton-network/wallet#2115](https://github.com/canton-network/wallet/issues/2115) still open) today runs on a v1-only test registry, with a v2 registry planned in [canton-network/wallet#2510](https://github.com/canton-network/wallet/issues/2510). Second, the dAppBooster for Canton example dApp, completing the migration already under way. Third, at least one team outside BootNode using it in its own test suite or demo.
- **Deliverables / Value Metrics:**
    - A pull request to canton-network/wallet that runs its token-standard end-to-end tests against canton-token-forge as a second backend, v1, and v2 where the suite covers it, with all tests passing; scope agreed with the maintainers before the work starts.
    - A walkthrough session with the wallet repository maintainers at Digital Asset, held before that pull request is reviewed: what the second backend covers, how it is seeded, and how to extend the suites with it.
    - The dAppBooster for Canton example dApp running its vesting flow on the 1.0.
    - At least one external team using it, verified by a written attestation from that team plus a public artifact where possible (repository, announcement or demo).
    - A short report on what the integrations surfaced: gaps in the token or service, and standard or tooling behaviors worth raising upstream.

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion against the following. Milestones 1 and 2 can each be evaluated and paid out independently. Milestone 0 is not evaluated; it is the public baseline that Milestones 1 and 2 build on.

1. **Milestone 1** is accepted when the 1.0 is released and a developer outside the team can, following only the README, add it to a Splice LocalNet with the dpm component and complete a v1 and a v2 transfer through the registry API with a client that never names canton-token-forge. The signal is adoptability by an outside team, not the presence of code.
2. **Milestone 2** is accepted when the token is proven in real suites: the wallet repository pull request runs its token-standard end-to-end tests against canton-token-forge with all tests passing, accompanied by the maintainer walkthrough; the dAppBooster example runs against the 1.0; at least one external team's usage is attested; and the integration report is delivered. The signal is real suites running on a second backend and maintainers able to keep using it without us.

Documentation and knowledge transfer for each milestone are part of its acceptance. Payment is released on the Committee's acceptance of that value.

---

## Funding

**Total Funding Request:** 750,000 CC

### Payment Breakdown by Milestone

Two milestones are evaluated and paid: Milestone 1 and Milestone 2. Milestone 0 is the delivered baseline (v0.3.0, public on GitHub before submission) and has no evaluation or payment event of its own.

- Milestone 1 (canton-token-forge 1.0, v1 + v2): 300,000 CC, released on Tech & Ops Committee acceptance of the Milestone 1 criteria. Target: within 2 months of grant approval.
- Milestone 2 (proving it on real suites): 450,000 CC, released on Tech & Ops Committee acceptance of the Milestone 2 criteria. Target: within 4 months of grant approval. This amount is 180,000 CC for the Milestone 2 work plus 270,000 CC in retroactive recognition of the Milestone 0 baseline.

Retroactive recognition of already-delivered open-source work follows the approved Noders Go SDKs proposal ([canton-dev-fund #38](https://github.com/canton-foundation/canton-dev-fund/issues/38)), which paid its retroactive milestone on approval. This proposal defers it to Milestone 2 instead: nothing is paid before the Committee has accepted the work, and nothing retroactive is paid before adoption is proven. Nothing is requested upfront.

### Volatility Stipulation

The grant is denominated in fixed Canton Coin. The project runs under 4 months (Milestone 1 within 2 months, Milestone 2 within 4 months of grant approval), well under 6 months. Should the timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones will be renegotiated to account for significant USD/CC price volatility.

---

## Co-Marketing

Upon the 1.0 release, BootNode will coordinate with the Canton Foundation on:

- A joint announcement.
- A technical blog post on testing token-standard integrations against a second backend, covering mixed v1/v2 workflows.
- A walkthrough video: adding canton-token-forge to a LocalNet and running a wallet test suite against it.
- An updated entry in the Canton developer documentation linking to the token, the registry service and the dpm component.

---

## Motivation

Every team integrating the token standard needs a registry to test against, and today the realistic choice is Amulet. Amulet is the right token to ship with, and the wrong one to be the only token a suite has ever seen: it carries holding fees, mining rounds and DSO-operated rules that a generic integration should not depend on, and a wallet or dApp tested only against it can pass while quietly assuming Amulet-specific behavior. The canton-network/wallet team names exactly this problem as the reason for its own test-token work: a second, non-Amulet backend so application tests do not become Amulet-specific.

v2 raises the stakes. CIP-0112 was approved in June 2026, and Splice now ships the v2 interfaces together with a Daml test token that implements them. What a wallet or dApp integration also needs, and what no public implementation we know of serves for v2 today, is a registry service in front of a non-Amulet token: the off-ledger APIs that hand out the factory, the choice context and the disclosed contracts a client must forward when it submits. The test-token registry in canton-network/wallet serves v1 only; a v2 one is an open item there ([canton-network/wallet#2510](https://github.com/canton-network/wallet/issues/2510)). A deployable token with a running v1 and v2 registry service gives every wallet, dApp and venue a v2 backend to integrate against without each building its own.

The same gap exists for demos, hackathons and DevNet pilots, where teams want a token they control, can mint as its admin with the recipient's consent, and whose test parties can fund themselves through a faucet without an admin in the loop. dAppBooster for Canton hit it directly and is moving its example dApp's vesting flow onto canton-token-forge for that reason.

**Expected adoption:** every wallet, dApp and settlement venue that integrates the token standard is a potential user, in its CI or its demos. The adoption path is concrete rather than speculative: the canton-network/wallet repository has an open test-token effort this plugs into, dAppBooster for Canton's integration is already open, and the external-team criterion makes adoption outside BootNode an acceptance condition. As a measure of reach, a GitHub code search on 2026-10-01 finds at least 61 public repositories, outside the canton-network organization and BootNode, that reference the token-standard registry APIs; each is a project whose tests could run against a second backend.

---

## Rationale

**Why a separate reference token rather than more Amulet test tooling.** Splice already ships an Amulet test harness (`splice-token-standard-test`) for exercising Amulet itself. The gap is the opposite one: a deployable, registry-backed implementation that is not Amulet, so a suite can prove it works against the standard rather than against one token.

**How it fits the existing tooling, and why it is not a duplicate.**

- **Splice's `splice-test-token-v1` and `splice-test-token-v2`** are Digital Asset's Daml tokens for validating the standard itself. The v2 token is thorough: it implements v1 and v2 on the same contracts, including batch settlement, the transfer event log and a generic account-authorization model, and its own documentation suggests removing or specializing that model before using it as a template. Both are Daml packages only: neither ships a registry service, v1 defines no issuance choice and v2 issues only through the admin, by a mint offer or a settlement leg from the `cip-112/mint` account, neither implements a faucet, and neither carries instrument metadata (name, symbol, decimals) on-ledger. canton-token-forge is not a replacement for them as the standard's validation token. It is the deployable counterpart: a running registry service, self-service funding through a per-instrument faucet, on-ledger metadata for many instruments per admin, and tagged releases a downstream project can pin.
- **canton-network/wallet's `test-token-v1-registry`** puts a registry service in front of `splice-test-token-v1`. It is v1 only. Building a v2 registry is an open issue there ([canton-network/wallet#2510](https://github.com/canton-network/wallet/issues/2510)), which the Milestone 2 pull request can close with canton-token-forge as that backend, if the maintainers agree. That pull request is written with them so the two meet rather than compete; if they prefer to adopt canton-token-forge outright, or upstream parts of it into their repository, that work is part of the scope agreed with them.
- **OpenZeppelin's `canton-token-template`** is a Daml starting point for teams writing their own token (AGPL-3.0). It ships Daml packages only, with no off-ledger registry service, and is meant to be forked and renamed. canton-token-forge is meant to be deployed as is and tested against, under MIT.
- **BitDynamics' Canton DevKit** ([canton-dev-fund #18](https://github.com/canton-foundation/canton-dev-fund/issues/18), approved) adds LocalNet token commands on the v2 path that wrap the Ledger and Registry APIs. It is a client of a registry; canton-token-forge is a registry. The two compose: DevKit's commands should be able to drive a canton-token-forge instrument once the 1.0 ships v2.

**Why not extend what exists.** The upstream test tokens exist to validate the standard and live in Splice's release cadence; growing them into a registry-backed, multi-instrument token would change their purpose. The wallet repository's registry is the closest shared code, and Milestone 2 is structured as a contribution to it, agreed with its maintainers, rather than a fork. What cannot be extended into existence is a second, independently maintained backend that is deployable with its own registry service, which is what makes the rest testable.

---

## Maintenance

- All code produced under this grant is published open source (MIT licensed).
- Contributions are welcomed via GitHub Issues and PRs.
- Each release states the Daml SDK and Splice version it was built against, and the release workflow checks that the DAR is byte-reproducible. From 1.0, releases also state the Canton version they were tested against.
- Through Milestone 2, while integrating the consumers, BootNode triages issues and ships fixes, and the gaps found are documented in the Milestone 2 report.
- BootNode is moving dAppBooster for Canton onto it, so keeping it current with Splice releases serves BootNode's own work.
- Maintenance beyond the funded work is intentionally not part of this proposal; if adoption warrants it, continued maintenance will be brought as a separate grant.

---

## Why BootNode?

BootNode is a high-trust engineering collective partnering with founding teams, foundations, and protocols to build, launch, and scale Web3 products. Our team of engineers has been building Web3 products together **since 2017**, with 30+ dApps shipped across the Ethereum ecosystem.

On Canton, BootNode built **dAppBooster for Canton** ([canton-dev-fund #390](https://github.com/canton-foundation/canton-dev-fund/pull/390)), the full-stack dApp starter, whose Milestone 1 the Tech & Ops Committee has accepted and paid. We ship the way the ecosystem does: **canton-barebones** is published as a `dpm` component, and we contribute upstream to the **canton-network/wallet** repository. canton-token-forge is part of that same track record: its v1 (Milestone 0) is already released and is being integrated into dAppBooster's example dApp ([canton-dappbooster PR #199](https://github.com/BootNodeDev/canton-dappbooster/pull/199)). This proposal continues work BootNode is already doing on Canton, not only on EVM.

Major projects we have contributed to include **Safe Wallet, MakerDAO, Aave, Derive Finance, Open Intents Framework, EigenLayer, Nexus Mutual, and Uniswap**. We were a **core contributor to Safe** (Gnosis Safe) in earlier years, shipping work on the Safe React App, the Safe Apps SDK, and the Safe Apps ecosystem. We have shipped on **POA Network** (EVM bridges, Proof-of-Authority validator-set governance App, Token Wizard) and continued through its pivot into **xDAI Chain**, which became **Gnosis Chain** (Unified Bridge + Explorer, Gnosis Pay, CoW Protocol, and others). Recent engagements include **Infinex, Wormhole, and the Open Intents Framework** (funded by the Ethereum Foundation). More case studies are at [bootnode.dev/case-studies](https://www.bootnode.dev/case-studies).

The contribution model is consistent across these engagements: an interdisciplinary POD team that takes full ownership of the work from ideation through adoption, partnering with the organization rather than acting as an external vendor.

### Aligned incentives

BootNode routinely accepts project tokens as a portion of compensation, and at times, the full payment is in tokens. The intent is long-term alignment: BootNode succeeds when the project succeeds, and our work directly contributes to the token's utility rather than being treated as a one-shot deliverable.

### Direct analog: token standards on EVM

BootNode's token experience comes from the EVM ecosystem, where shared token standards and reference implementations are the foundation that wallets and dApps integrate against. canton-token-forge applies that experience to the Canton Network Token Standard.
