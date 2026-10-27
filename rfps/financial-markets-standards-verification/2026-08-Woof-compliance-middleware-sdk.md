# Compliance Middleware SDK for EVM Developers on Zenith

| Field | Value |
| :---- | :---- |
| **Organization** | Woof |
| **Author / Primary Contact** | Mykola Ilchuk, Woof ([@Noosphere-314](https://github.com/Noosphere-314)) |
| **Status** | Submitted |
| **Created** | 2026-08-06 |
| **Proposal Type** | RFP-aligned |
| **RFP / Roadmap Area** | RFP 12 (RWA Standards), item 12.1: Identity, Credentials and KYC Standards for RWA Workflows |
| **Champion** | `Needs Champion` |
| **Total Funding Request** | 1,248,700 CC (≈ $120,000 at $0.0961/CC, CoinGecko, 27 October 2026) |
| **Project Duration** | 6 months |
| **Label** | `regulatory-compliance` |

---

# Abstract

This proposal funds an open-source **Compliance Middleware SDK** that lets Solidity contracts on Zenith EVM act on compliance decisions recorded on Canton. The decision stays on Canton; the contract verifies an authorization issued on the basis of that Canton state. The SDK has a Solidity contract layer (base contracts and interfaces), a TypeScript middleware layer, and reference dApps for common compliant DeFi patterns: permissioned lending, a compliant vault and KYC-gated trading.

Holder-level facts come from a record the issuer or operator controls on Canton, such as an issuer's approval contract or the minimal compliance-status template in our Daml PoC. Asset-level facts can come from the public `ComplianceGuard` Daml interface, whose reference implementation is CompliLedger's [TokenProof](https://github.com/Compliledger/canton_tokenproof); CompliLedger withdrew its funding proposal ([#231](https://github.com/canton-foundation/canton-dev-fund/pull/231)) on 8 September 2026, so the SDK treats the interface as public rather than as a funded dependency. Without an EVM-facing surface, each Zenith team that needs compliance builds its own authorization path, in the highest-stakes part of the stack.

**Total funding:** 1,248,700 CC, fixed, across 2 milestones (≈ $120,000 at the reference rate in the Volatility Stipulation).
**Duration:** 6 months across 2 milestones.

---

# Motivation

Zenith opens Canton to EVM-background developers, 71% of respondents to the Foundation's 2026 Developer Experience survey (41 respondents); 83% of the projects in that survey are TradFi or hybrid, where compliance is mandatory. Canton's CIP-56 token standard, party-based privacy and atomic settlement provide compliance primitives on the Daml side. EVM developers on Zenith face four gaps:

- **Compliance facts are not reachable from Solidity.** Canton holds them: holder-level records such as an issuer's approval or an operator's own compliance record, and asset-level proofs such as TokenProof's `ComplianceProof`. Zenith's cross-VM primitive, `external_call()`, is invoked from a Daml workflow, not from an EVM contract, so a Solidity contract cannot consult them. The check has to happen on the Canton side and reach the EVM contract as an authorization. This proposal targets action-specific authorization; adjacent Canton-state attestation work is compared under Fit with existing ecosystem tooling.
- **Compliance-gated settlement.** Zenith's Gateway demonstrates atomic settlement between a CIP-56 asset and an ERC-20, coordinated from a Canton workflow (September 2026). This SDK proposes the compliance precondition from the EVM developer's side.
- **Reference DeFi implementations.** [OpenZeppelin's Canton Stack (#262)](https://github.com/canton-foundation/canton-dev-fund/pull/262) ships Daml libraries. No active PR provides compliance-integrated EVM primitives (vaults, lending, AMM).
- **Party to address mapping.** Solidity speaks `address`, Canton speaks `Party`. [#453](https://github.com/canton-foundation/canton-dev-fund/pull/453) registers EVM addresses to external parties, and Zenith's Gateway links them only to route tokens; no reusable layer exposes a verified address-to-party link to a dApp.

**Registry controls and the application layer.** Digital Asset's Registry App gives registrars a party blocklist (`checkBlocklist` on `InstrumentConfiguration`, since v0.13) and credential-based allowlists per instrument. DA's documentation places these in the asset model: "[r]ather than application-layer logic, the DA Registry embeds authorization directly into the asset model" ([blocklist](https://docs.digitalasset.com/registry/guides/blocklist), [allowlist](https://docs.digitalasset.com/registry/features/allowlist)). This SDK works at the application layer: a dApp's own per-action permissions ("may this address open a position in my market", "may it swap in my KYC-gated pool"), including over objects that are not registry instruments, such as positions and LP shares. The layers compose: a party barred at the registry cannot move the instrument whatever a dApp does, and the SDK reimplements neither blocklisting nor instrument allowlisting.

**A separate layer from other EVM and CIP-56 work.** [#453](https://github.com/canton-foundation/canton-dev-fund/pull/453) is a transport and wallet layer: a MetaMask-compatible JSON-RPC facade over CIP-56 tokens, an indexer and a bridge relayer. It is how an EVM wallet reaches CIP-56 tokens; this SDK is how an EVM contract enforces a Canton-side decision, and it uses #453's address registration rather than duplicating it. TokenProof provides the Daml-side `ComplianceGuard` interface the SDK implements against.

---

# Specification

## 1. Objective

A single, security-reviewed, MIT-licensed SDK that lets a Solidity developer with no prior Canton experience add Canton-backed compliance gating and party-based permissions to a Zenith dApp in under one hour following the quickstart, and compose with Zenith's Gateway settlement path where it is available.

Out of scope: a compliance-decision engine or evidence pipeline (the domain of providers such as CompliLedger), Canton DevNet orchestration ([Denex LocalNet, #318](https://github.com/canton-foundation/canton-dev-fund/pull/318)), and institutional API gateways or enterprise IAM.

## 2. Who runs what

Woof hosts nothing in an integrator's deployment. Each dApp operator runs its own authorizing service.

| Component | Run by | Keys and authority | Woof's role |
| :---- | :---- | :---- | :---- |
| The dApp's guarded Solidity contracts (inheriting the SDK base contracts) | The dApp operator, on Zenith EVM | The dApp's own admin configures the trusted signer set and the senders allowed to write revocations | None |
| Authorizing service | The dApp operator, on its own infrastructure | Holds the EIP-712 permit signing key. Acts as a Canton party hosted on a participant node the operator runs or uses, with read access to the compliance fact | Publishes the reference implementation as code |
| Holder-level compliance fact | The issuer (its own approval contract) or the operator (its compliance-status template), on their participant | Issuer or operator is signatory; the authorizing service's party is an observer; archiving the record withdraws approval | None |
| Asset-level proof (TokenProof, where used) | The issuer or evaluator | Read access by disclosure to the operator's party | None |
| EVM address to Canton party link | The #453 middleware, on ChainSafe's deployment or on one the operator runs | The user's middleware-issued login token (middleware signature verified through JWKS), or `FingerprintMapping` records for users registered on the operator's own deployment | None |
| Subject to party link (when a credential names a subject handle) | The credential issuer, for example the issuer or Owner in Veilio's Access Passport V1 | Attested by that issuer | None |
| TypeScript middleware and frontend components | The dApp's backend and frontend | No keys of their own | Publishes the code |
| Reference dApps and the acceptance runs | Woof, on Zenith testnet and a Canton test environment | Test signer key, test Canton party and test issuer, held by Woof for the demonstration | Example operator only; integrators deploy their own |

## 3. Implementation Mechanics

Two packages: `@woof-software/canton-compliance` (TypeScript, npm) and `woof-software/canton-compliance-contracts` (Solidity).

### Layer 1: Solidity contract layer on Zenith EVM

The compliance fact lives on Canton; what reaches the EVM contract is a bound authorization. (An earlier draft had Solidity contracts calling `external_call()`; that is not how Zenith composes the two sides, per CIP-0091, Zenith's documentation and its atomic-swap write-up of 1 September 2026, and the September 2026 revision corrected it.)

A developer inherits a base contract and annotates a function with a modifier such as `onlyCantonAuthorized("DEPOSIT")`. The contract checks that a valid authorization, bound to that account, action and parameters, accompanies the call, and reverts otherwise. Two authorization paths share that surface:

- **Operator-signed permit (buildable today, the Milestone 1 path).** The authorizing service performs a fresh Ledger API read of the fact when it issues (an active-contract query or a disclosed-contract fetch, never a cache) and signs a short-lived EIP-712 permit bound to chain, contract, account, call and parameters, with a single-use nonce. It refuses to issue when the read fails, the source is unreachable, or the fact is older than a configured maximum age, measured from an evidence time the source records as an explicit field, not from the contract's creation time. The contract verifies signature, window and nonce. The EVM side can establish only that a signer the dApp trusts vouched for the action; freshness of the Canton state is that signer's commitment, bounded by the window and the maximum age, and revocation inside the window is bounded, not eliminated. A confirmed issuer block can invalidate an unexpired permit through the revocation path below. This path needs neither the Gateway nor `external_call()` and is testable on the public Zenith EVM testnet now.
- **Gateway-coordinated authorization (as Zenith opens it to third-party workflows).** Design goal: the same contract surface accepts an authorization produced inside a Canton workflow that runs the compliance check as a transaction precondition and coordinates the EVM leg through Zenith's Gateway, so the check and the EVM effect commit or fail together, the pattern Zenith demonstrated with bound vouchers in September 2026. It depends on Zenith exposing the Gateway path to third-party Daml workflows, and on MainNet also on `external_call()` shipping with Canton 3.6 (delivered in Canton's dev protocol version, canton#513, July 2026). Whether it fits behind the same interface without changes to integrators' contracts is to be confirmed with Zenith; its acceptance criteria are added by a separate revision once agreed and do not replace the permit-path criteria.

**Revocation of issued permits.** An issuer asked for a confirmed sanctions or legal block to override an authorization already issued ([#600](https://github.com/canton-foundation/canton-dev-fund/pull/600#issuecomment-5999724519)). Milestone 1 adds a revocation path to the permit path. It acts on a block the issuer has recorded and made available to the service; the issuer's record, not the service, says which change is a confirmed block. Each property has its own test:

- Once a revocation is delivered, the contract rejects a permit issued before it, even inside its validity window.
- Only senders the dApp configures can write to the revocation path.
- Guarded calls revert once the published freshness bound for the revocation source has passed. Freshness comes from reports, by the configured senders, of how far the issuer's records have been processed; a liveness report alone is not enough. An unavailable source therefore fails closed within the published bound. The application chooses which calls carry the guard, so a lending market can leave repayment or exit unguarded.
- A revocation update carries no identifier of the blocked address, and the contract keeps no public per-address blocklist.
- Delivery is not instant; the target delay is a published parameter.

The concrete form (for example a revocation epoch per contract, with fresh permits for accounts that are not blocked) is set in a design note published with Milestone 1. The path does not use `external_call()`, which Zenith's testnet documentation lists as not included in the current Gateway release ([Zenith documentation](https://docs.zenith.network/zenith-testnet)). A token-layer freeze stays the issuer's own control.

**Two issuer control models.** Some issuers gate minting and redemption and leave transfers free; others need holder eligibility on every transfer. Gating mint and redemption is a per-action decision, and both paths fit it. For eligibility on every transfer, the right mechanism depends on the token and application flow, volume, signer availability and the required revocation bound: per-action authorizations, or an eligibility record kept in step with Canton with a published revocation latency. The revocation path is a narrow form of the second (confirmed blocks only) and does not replace the per-action check. We have not selected one for that case; it is scoped into the Milestone 2 reference dApps only once a concrete issuer workflow names it.

The contract layer covers these functional areas; the split into contracts follows what is cleanest and most auditable in M1:

- **Canton-authorized entry points.** Base contracts with modifiers (KYC-gated, permission-gated, party-gated) that verify signer set, binding to account, action and parameters, expiry, single use and, on the permit path, the revocation checks.
- **Authorization producers.** Daml templates and a reference authorizing service that evaluate a compliance fact and produce the authorization. Holder-level facts in Milestone 1 come from a source the operator already controls: its own compliance-status template (the pattern in our `canton-localnet-poc`) or the issuer's credential-based allowlist decision in the Registry App. Where an issuer records approval in its own contract, it adds the service's party as an observer; scope, evidence time and any expiry are explicit fields; archiving the record withdraws approval. This is also the pattern ChainSafe's engineers recommended in those answers, rather than a shared proof template. The draft credentials standard ([cips#204](https://github.com/canton-foundation/cips/pull/204)) covers public credentials only, leaves private credentials and KYC claims to later work, and gives the issuer no way to withdraw a credential on its own, so withdrawal is read from the issuer's record. For asset-level facts from TokenProof, the adapter checks the proof's binding to the expected asset, issuer, evaluator and policy version, not only that its status is Active. Reading a fact, using it in a Daml operation and being a signer a dApp trusts are three separate rights.
- **Compliance-gated settlement.** Reference wiring that places a compliance precondition on Zenith's Gateway settlement path; the Gateway does the settlement.
- **CIP-56 asset interaction.** Off-chain, TypeScript helpers over the #453 facade, not duplicating it. On-chain, a Solidity contract can only hold an EVM representation of a Canton asset, so contract-level CIP-56 helpers are conditional on such a representation being available to third parties.
- **Party to address resolution.** Helpers over existing registration flows, not a new registry. With the #453 middleware the service verifies an EVM address's party through the user's middleware-issued login token, which carries both and whose signature the service verifies through the deployment's JWKS, or by reading `FingerprintMapping` records on a middleware deployment the operator runs; the link never changes and is checked for each permit. ChainSafe's middleware engineers confirmed both paths, and that the link is immutable, in written answers to our authorization flow (October 2026). Where a credential names a subject handle, the SDK also checks the subject's binding to a Canton party, attested by the credential's issuer; candidate sources include credentials under [cips#204](https://github.com/canton-foundation/cips/pull/204) and Veilio's Access Passport ([#853](https://github.com/canton-foundation/canton-dev-fund/pull/853)), whose authors state that in V1 the issuer or Owner attests the link from a subject handle to a party ([comment of 5 October 2026](https://github.com/canton-foundation/canton-dev-fund/pull/853#issuecomment-5997703604)). The service refuses to issue if a required link is missing or withdrawn at its read. The SDK is not tied to one provider. ChainSafe's completion report distinguishes the MainNet API (release 0.8.0) from the DevNet deployment with SIWE/JWT enabled (release 0.9.1); it does not establish that this login path is deployed on MainNet. Each acceptance run pins the middleware version and deployment it actually uses, or uses the operator's own local deployment.

### Layer 2: TypeScript middleware

Typed, high-level access to the compliance layer for application and frontend developers, in the style of `wagmi` and `viem`:

- **Authorization flow.** Request an authorization for an action (from the operator's service, or from the Gateway workflow when available) and submit the EVM call with it, as one typed call.
- **Party to address resolution** over the registration flows above, checked for each request.
- **Settlement assembly.** On the Gateway path, a settlement with a compliance precondition; on the permit path, the authorize-then-call sequence with explicit handling of expiry and revocation between the two steps.
- **Frontend building blocks** (React components and hooks) for authorization status, permissions and settlement history, read through the operator's backend rather than a public on-chain mirror.

### Reference implementations

Open-source reference dApps (Apache-2.0), each with Solidity, Daml, deployment scripts and a test suite. The final set is confirmed with the community during M2:

- **Permissioned lending**, Compound-shaped: Canton-authorized deposits and borrows, compliant liquidations.
- **Compliant vault**: ERC-4626 with Canton-authorized entry and exit.
- **KYC-gated trading**: an AMM-style pool that enforces party permissions on swaps.

The Milestone 1 and 2 builds use EVM-native test ERC-20 assets. ERC-4626 requires an ERC-20 underlying; variants over an EVM representation of a CIP-56 asset depend on Zenith's Gateway and registry layer and are scoped only once that is available to third parties. The permit-path builds are independent of Zenith-specific features. An authorization does not move a Canton asset into or out of an EVM contract, and this is not claimed.

**Relationship to #665.** Woof's Canton Risk Engine proposal ([#665](https://github.com/canton-foundation/canton-dev-fund/pull/665)) also uses a reference lending market and an ERC-4626 vault. If both are funded, that base and its test infrastructure (Zenith testnet deployment scripts, CI, test tokens) are built once and each proposal pays only for its own layer: this one for compliance gating, #665 for Registry integration and parameter governance. The effort saved goes to additional reference patterns and test coverage. If only one is funded, it builds the minimal base it needs within its own budget. Neither proposal's acceptance depends on the other.

### Technologies

Solidity on Zenith; TypeScript on npm; Hardhat as the primary environment, with Foundry for invariant and fuzz tests; Slither as the static-analysis baseline; any Daml packages checked with the [Daml Package Analyzer (#130, Certora)](https://github.com/canton-foundation/canton-dev-fund/pull/130) where available.

### Proof of concept

- [woof-software/canton-compliance-poc](https://github.com/woof-software/canton-compliance-poc): the EVM side, a base contract with an `onlyKYC` modifier resolving compliance through a pluggable interface, with a mock for the Canton side. Passing CI.
- [woof-software/canton-localnet-poc](https://github.com/woof-software/canton-localnet-poc): the Daml side, built with SDK 3.4.11 and run on a live Canton ledger; the script creates and reads back an on-ledger compliance decision. Run log and DAR committed.

The PoCs validate the two sides separately. Milestone 1 delivers the join on the permit path; the pluggable interface becomes the authorization verifier, and the Daml side becomes the authorization producer.

## 4. Architectural Alignment

- **CIP-56 and CIP-0112.** The SDK is an EVM consumption surface for CIP-56. The permit path is independent of the token standard version: the contract verifies a signed authorization and never reads or moves token-standard contracts. Where the SDK touches the token standard, it follows its dependency: the TypeScript asset helpers follow the #453 facade, which has its own CIP-0112 migration milestone, and the Gateway path follows Zenith's Gateway, whose testnet release uses the V1 packages.
- **Zenith composability.** Zenith coordinates EVM execution from Canton workflows through its Gateway and `external_call()`. The SDK follows that direction: the fact comes from Canton and the EVM contract receives an authorization.
- **RFP 12.1.** The [2026-2028 Strategic Roadmap](https://github.com/canton-foundation/canton-dev-fund/blob/main/2026-2028-strategic-roadmap.md) asks under Identity, Credentials and KYC Standards for "open standards, interfaces, and reference implementations rather than proprietary identity or compliance services", covering KYC or KYB status, accreditation, jurisdiction and eligibility to hold or transact. The SDK is that surface on the EVM side, with no proprietary service in the stack, and consumes the Identity and Metadata SIG's credential and party-metadata standards as they land. On revocation, the author of the draft Credentials Standard ([cips#204](https://github.com/canton-foundation/cips/pull/204)) replied to our question: "I would not expect the registry to define the interpretation, but the apps consuming the credentials and the apps producing the credentials" ([comment of 23 September 2026](https://github.com/canton-foundation/cips/pull/204#issuecomment-5794088256)). The authorizing service is such a consuming application, so which issuers it trusts and how it detects a withdrawal are part of what the SDK defines.
- **Review Process priority areas.** [Security and Resilience](https://github.com/canton-foundation/canton-dev-fund/blob/main/Development%20Fund%20Proposal%20Review%20Process.md) ("monitoring, compliance, and third-party audit capabilities") and App Building and Developer Experience ("reduced developer friction", "interoperability across wallets, assets, and dApps").
- **Durability against standards.** The SDK defines no standard of its own. As standards mature, anything the platform absorbs natively becomes a dependency the SDK drops. What remains is the application-layer surface: a dApp's own per-action permissions over objects that are not registry instruments.

## 5. Backward Compatibility

None. The SDK deploys new Solidity contracts on Zenith EVM and new Daml templates; it does not modify TokenProof or any existing application. If `ComplianceGuard` evolves, the SDK tracks it through versioned releases. The current EVM PoC's `isPermitted(address, action)` mock is replaced in M1 by the bound-authorization interface above and is not compatible with it by design; consumers integrate against the M1 interface.

---

## Dev Fund 2.0 Alignment

**RFP mapping.** RFP 12, item 12.1. The proposal builds the consumption side of that standard: open interfaces and a reference implementation through which an application acts on a credential or compliance decision issued, verified and revoked on Canton. It defines no credential standard and operates no compliance service.

**Beneficiaries.** Solidity teams building regulated applications on Zenith, and the RWA issuers whose assets they handle. Today each such team designs its own bridge between Canton facts and its contracts, and each design is a separate trust model for reviewers; the ecosystem gets one reviewed surface instead. Nothing requires changes to Canton, Daml, Splice or the OSS Wallet.

**What Woof gets, and what the grant pays for.** Woof's day-to-day work is deploying lending markets on EVM chains (see Team), and our interest is to be ready if EVM lending markets, including those of the protocol we work on, come to Canton through Zenith. None of the deliverables depends on a particular protocol. Woof gets experience building on Canton, a public track record and possibly separate integration work for teams that want help, contracted and paid outside this grant. The grant pays for the open deliverables in the milestones, all usable without a contract with Woof.

**Adoption path.** Milestone 1 ships the SDK with a reference integration and a published static-analysis report. A 374,610 CC tranche of Milestone 2, 30% of the total budget, is released only when at least two external teams have integrated the SDK in a test environment and published written feedback (see Acceptance Criteria).

---

# Milestones and Deliverables

Every milestone is delivered as tagged releases of the public repositories and an update to one documentation site (see How the committee verifies each milestone).

## Milestone 1: Core Compliance Layer and Middleware Foundation

- **Estimated Delivery:** Month 3
- **Focus:** Build, security-review and publish the core SDK; first end-to-end integration on testnet.
- **Deliverables / Value Metrics:**
  - Solidity contract layer covering the functional areas in Specification §3 (Canton-authorized entry points, authorization producers on the permit path, party to address resolution), deployed and verified on Zenith testnet. CIP-56 interaction is delivered through the TypeScript middleware over the #453 facade; contract-level CIP-56 helpers only if an EVM representation of a Canton asset is available to third parties on testnet by then.
  - Revocation path for issued permits, with its design note.
  - TypeScript middleware published to npm (beta): typed authorization flow, party resolution, transaction assembly.
  - Local testing support (Hardhat) with mock compliance responses.
  - Slither report with zero high-severity findings, published.
  - Quickstart and the first page of the documentation site.
  - At least one integration exercising the under-one-hour quickstart: an external team if available, otherwise a Woof-built reference integration separate from the SDK repository.

## Milestone 2: Reference dApps and Documentation

- **Estimated Delivery:** Month 6
- **Focus:** Reference dApps for common compliant patterns, complete documentation, community handoff.
- **Deliverables / Value Metrics:**
  - Open-source reference dApps for the most-demanded compliant patterns (for example permissioned lending, compliant vault, KYC-gated trading), deployed and operable on Zenith testnet.
  - Frontend building blocks (React components and hooks) for compliance state.
  - Documentation site completed: architecture overview, party-model walkthrough, compliance-gated settlement flow, error handling and a "deploy a compliant dApp" walkthrough.
  - **Target adoption signal:** at least 3 external Canton-ecosystem teams publicly committing to evaluate integration (reported, not gated).
  - Community review on [forum.canton.network](https://forum.canton.network) with feedback incorporated.

---

# Acceptance Criteria

Milestone 1 is gated on deliverables, since adoption cannot precede a shipped artifact. Milestone 2 is split: the deliverables are gated on the hard criteria below, and a 374,610 CC tranche, 30% of the total, is gated on external adoption.

**Hard acceptance criteria (within our control):**
- **Time to first integration:** a Solidity developer with no prior Canton experience deploys a compliance-enabled contract inheriting the SDK base layer and completes a compliance-gated operation in under one hour following the quickstart, demonstrated by a Woof-built reference integration and by an external team's integration where available.
- **Authorization correctness.** On the permit path the contract reverts for every binding the authorization carries, each with its own test: wrong signer, chain id, verifying contract, account, recipient or amount, or action; an expired authorization and one not yet valid; a reused nonce; a signer rotated out.
  - On the issuing side, a request for a fact already revoked or archived at the service's ledger read is refused, and an unavailable or stale Canton source produces a refusal, never a silent pass.
  - The deadline the contract checks is signed into the permit and is the earlier of the read time plus the validity window and the fact's evidence time plus the maximum age, both published with the milestone. Changes after the read are bounded by that deadline, not eliminated.
  - Each property of the revocation path has its own test, plus one that a permit issued after a revocation to an account that is not blocked is accepted. These tests assert rejection from delivery, not from the moment the block is recorded on Canton. The target delay is published with the milestone, together with the delays measured in the testnet run.
  - A failed business call after a valid authorization leaves no consumed nonce behind.
  - The suite runs on Zenith testnet and its results are published with the milestone. The permit-path suite is the paid acceptance criterion for Milestone 1.
- **Security posture:** Solidity contracts pass Slither with zero high-severity findings; Daml helpers, if any, pass the Certora Daml Package Analyzer with zero high-severity findings. A third-party audit is not budgeted; the baseline is static analysis plus internal manual review of a deliberately thin layer.

**Milestone 2 adoption gate (gates the 374,610 CC tranche, see Funding):**
- At least 2 external teams have integrated the SDK in a test environment and provided written feedback on the integration surface, published in the PR thread or on the Canton forum.

**Adoption targets (reported, not gated):**
- At least 3 external teams publicly committing to evaluate integration by the end of M2.
- At least one integration exercised end to end in a production-track deployment.

## How the committee verifies each milestone

A reviewer can check each result without a Woof account, whitelisting or a validator.

| Milestone / payment | Result and environment | Evidence |
| :---- | :---- | :---- |
| M1, 624,350 CC | Permit path, refusal and revocation cases; local Canton and public Zenith testnet (or the agreed substitute) | Reproducible acceptance suite, Slither report, npm release, verified contracts, quickstart run |
| M2 delivery, 249,740 CC | Reference dApps, frontend components, full documentation; public EVM test environment | Tagged release, runnable references, completion report |
| M2 adoption, 374,610 CC | Two external teams integrate in a test environment and publish written feedback | Each team's public feedback, naming its integration and SDK version |

- **Documentation site, one page per milestone:** every deliverable, the commands and prerequisites to reproduce it, pinned toolchain versions (Solidity compiler, Hardhat, Foundry, Daml SDK), and test counts as passed, failed and skipped. A skipped required test is not a pass.
- **Release manifest:** commit and tag per repository, npm version, Daml package ids and DAR checksum, chain id and contract addresses with verified source, deployment configuration and CI run. A component unchanged since an earlier milestone keeps its pinned release; changed code is tested again.
- **Local reproduction:** one documented command, after the listed prerequisites, starts a local Canton ledger, the reference authorizing service with a test issuer, and a local EVM chain, and runs the authorization, stale-source and revocation cases. It uses only publicly available dependencies. This runner is an M1 deliverable.
- **Testnet run:** each functional case links to its EVM transaction and test assertion. Rejection cases are shown by reproducible assertions with their inputs, not by failed receipts alone. Revocation delay is reported in three timestamps: the issuer's record, the contract accepting the update, and the first rejected call. Our Canton test records are private; their behaviour is checked through the local reproduction.
- **Screen recordings** of the timed quickstart and of a permit issued, used and rejected after revocation. They support the tests, not replace them.
- **Completion report:** each criterion marked met, partly met or not met, with its evidence and environment, and every deviation listed for the committee to decide.
- **Adoption evidence:** the two teams' public written feedback. A public repository or contract address strengthens it. If a team cannot disclose its code, we agree the form of evidence with the committee before claiming the gate. Woof's own reference integration does not count.

**Environment note.** If public Zenith testnet is unavailable, we agree the substitute public EVM environment with the committee in advance. The permit path does not depend on Zenith-specific features. Local and testnet results show behaviour against a test issuer, not production adoption or Gateway integration; Gateway criteria come with the separate revision in Specification §3.

---

# Funding

**Total Funding Request:** 1,248,700 CC

## Payment Breakdown by Milestone

- **Milestone 1** (Core Compliance Layer and Middleware Foundation): 624,350 CC upon committee acceptance.
- **Milestone 2** (Reference dApps and Documentation): 624,350 CC, in two tranches:
  - **249,740 CC** upon final release and acceptance of the deliverables.
  - **374,610 CC** when the Milestone 2 adoption gate is met (see Acceptance Criteria). This tranche remains claimable for three months after Milestone 2 delivery and is forfeited if the gate is not met in that window.

The adoption tranche is 30% of the total budget, raised from 12.5% in the September 2026 revision in line with the Dev Fund 2.0 focus on adoption. Delivering the code is within our control and is paid on delivery; external teams choosing to integrate is not, so that part of the budget is placed at risk rather than asserted as a target.

## Volatility Stipulation

The grant is denominated in fixed Canton Coin. CC amounts convert the USD cost estimate of $120,000 at the CC/USD price of $0.0961 on 27 October 2026 (CoinGecko). The project duration is 6 months. The Milestone 2 adoption tranche, claimable up to three months after Milestone 2 delivery, is paid in the same fixed CC amount. Should the project timeline extend beyond 6 months due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility.

---

# Co-Marketing

On release, Woof will work with the Canton Foundation on a joint announcement at v1.0, an engineering post on the EVM to Daml compliance pattern, one talk or workshop at a Canton ecosystem event during the milestone window, and use of the reference dApps in ecosystem materials if the Foundation wishes.

---

# Distribution & Go-to-Market

- **Channels.** A versioned npm package and a Solidity package verified on the Zenith explorer, in public GitHub repositories, with the standard `npm install` and inherit-and-import flow EVM developers expect.
- **Discovery.** The documentation site and quickstart, a launch post on forum.canton.network, an engineering post, a walkthrough video, and listing in Canton tooling directories once live.
- **Onboarding.** The reference dApps are starting points: a developer forks the closest pattern. The under-one-hour quickstart is the measured target.
- **Targeted adoption.** Direct outreach to EVM teams entering through Zenith and to TradFi and hybrid teams for whom compliance is mandatory. External adoption gates the 374,610 CC tranche.

---

# Rationale

## Why this approach

**Solidity base contracts are the lowest-friction surface for EVM developers.** Inherit-and-extend with familiar modifiers maps to standard EVM patterns; developers do not need to learn Daml or Canton's party model to add compliance gating. **Two layers, Solidity and TypeScript,** follow the OpenZeppelin Contracts plus viem model EVM developers already use.

## Alternatives considered

- **Contribute Solidity bindings to TokenProof.** Considered. CompliLedger focused on the Daml-side primitive, and in June 2026 described the EVM-facing middleware, Solidity abstractions and reference dApps we proposed as "a different layer of the stack". Clean ownership of each layer was healthier.
- **A single "do everything compliant" wrapper instead of base contracts.** Rejected: it prevents composition with a team's existing inheritance.
- **Wait for OpenZeppelin's Canton Stack.** Rejected: their reference implementations are Daml-centric, not Solidity contracts on Zenith.
- **Leave it to the platform roadmap.** Considered. The Registry App scopes itself to asset-model authorization. If the platform covers the same application-layer surface, we revise our scope rather than duplicate it.
- **Build on Chainlink ACE.** Considered. ACE's `PolicyProtected` and `runPolicy` are the closest EVM prior art for modifier-based gating, but it is licensed under BUSL 1.1 with no permitted production use in its additional-use grant, converting to MIT only in October 2029 for the current version. The SDK keeps its own minimal verifier under MIT and stays compatible where practical, so a team already licensing ACE can wrap the Canton authorization as an ACE policy.

## Fit with existing ecosystem tooling

- **TokenProof:** implements against its public `ComplianceGuard` interface, coordinated with CompliLedger before submission ([their reply of 16 June 2026](https://github.com/canton-foundation/canton-dev-fund/pull/231#issuecomment-4718622123) to [our note](https://github.com/canton-foundation/canton-dev-fund/pull/231#issuecomment-4718506264)); #231 has since been withdrawn. If a later CompliLedger proposal covers the Solidity side, we will revise our scope rather than duplicate it.
- **OpenZeppelin Canton Stack ([#262](https://github.com/canton-foundation/canton-dev-fund/pull/262)):** different layers. Their [Milestone 2 criteria](https://github.com/canton-foundation/canton-dev-fund/issues/565) include "integration patterns for custody, compliance, and risk management systems"; this SDK is one such system on the EVM side.
- **#453 CIP-56/ERC-20 Middleware:** wallet transport over CIP-56; this SDK uses its address registration and adds contract-level enforcement. ChainSafe's [M1 delivery claim](https://github.com/canton-foundation/canton-dev-fund/issues/887) identifies the canonical bridge implementation and states that `approve` and `transferFrom` are unsupported and `allowance` returns zero. The TypeScript helpers preserve those limitations; they do not treat the facade as a complete ERC-20 implementation. The EVM reference dApps use EVM-native test ERC-20 assets.
- **Contract-agnostic attestation ([#577](https://github.com/canton-foundation/canton-dev-fund/pull/577)):** proposes proofs of Canton state and an external verifier, including Canton-to-EVM use cases. State evidence alone does not define the issuer's eligibility policy, wallet binding, permitted action, nonce, expiry or delivered-revocation rules. We will compare that evidence interface before implementing a competing transport; no integration with #577 is claimed.
- **Canton Event Stream ([#300](https://github.com/canton-foundation/canton-dev-fund/pull/300)):** a candidate for notifying the revocation worker of issuer-record changes, subject to confirming its issuer-template profile, authorized visibility and recovery from stream gaps. It does not replace fresh Ledger API reads or the worker's freshness checks, and the SDK does not depend on it.
- **Digital Asset Registry App:** asset-model controls; this SDK is the application-layer counterpart and reimplements neither.
- **Daml Package Analyzer ([#130](https://github.com/canton-foundation/canton-dev-fund/pull/130)):** audit baseline for any Daml helpers.

---

# Sustainability

- **Primary steward: Woof.** At least 6 months of bug fixes, CIP-56 compatibility and Zenith version updates after delivery, with security disclosures addressed within 48 hours.
- **Small maintenance surface.** The SDK is a thin layer over the Canton facts it consumes; most standard evolution is absorbed on the Daml side.
- **No hosted dependency.** The SDK is a library in other teams' deployments; it needs no infrastructure run by Woof.
- **Community handoff.** All code is MIT or Apache-2.0 with a public issue tracker and contribution guide; stewardship can move to or be shared with the relevant SIG.

---

# Open Source

- Solidity contracts: MIT.
- TypeScript middleware: MIT.
- Reference implementations: Apache-2.0.
- Documentation: CC-BY-4.0.
- Repositories: `github.com/woof-software/canton-compliance` (TypeScript middleware) and `github.com/woof-software/canton-compliance-contracts` (Solidity contracts).

---

# Team

**Woof** ([woof.software](https://woof.software)): senior EVM engineers for DeFi and an active Compound DAO contractor team, delivering the deployments behind Compound's market expansion to Optimism, Mantle and other networks. Solidity, security review (Slither, manual review) and audit-grade engineering are daily practice. Relevant public artifacts:

- [`comet`](https://github.com/woof-software): Compound v3 core contributions.
- [`comet-wrapper`](https://github.com/woof-software): production Solidity ERC-4626 and ERC-7246 wrapper for Compound III; precedent for the compliant vault.
- [`compound-multiplier`](https://github.com/woof-software): risk-adjusted DeFi engineering on EVM.
- [`migrator-v2`](https://github.com/woof-software): cross-protocol position migration; precedent for multi-protocol transaction building.

We do not present ourselves as Daml protocol experts. The proposal is scoped to the EVM side, with the Daml side kept to the minimum the authorization path requires.

---

# References

- [TokenProof](https://github.com/Compliledger/canton_tokenproof): reference Daml implementation of `ComplianceGuard` (funding proposal [#231](https://github.com/canton-foundation/canton-dev-fund/pull/231) withdrawn 8 September 2026).
- Adjacent proposals: [#130 Daml Package Analyzer](https://github.com/canton-foundation/canton-dev-fund/pull/130), [#262 OpenZeppelin Canton Stack](https://github.com/canton-foundation/canton-dev-fund/pull/262), [#453 CIP-56/ERC-20 Middleware](https://github.com/canton-foundation/canton-dev-fund/pull/453).
- [CIP-56 Token Standard](https://github.com/global-synchronizer-foundation/cips/blob/main/cip-0056/cip-0056.md), [CIP-0100](https://github.com/canton-foundation/cips/blob/main/cip-0100/cip-0100.md), [Canton DevEx Survey 2026](https://forum.canton.network/t/canton-network-developer-experience-and-tooling-survey-analysis-2026/8412).
- [Zenith launch (March 2026)](https://www.globenewswire.com/news-release/2026/03/09/3252106/0/en/Zenith-launches-as-the-EVM-layer-for-Canton-Network-merging-Ethereum-s-developer-ecosystem-into-Wall-Street-s-blockchain.html), [Zenith atomic transactions (The Block, March 2026)](https://www.theblock.co/post/394288).
