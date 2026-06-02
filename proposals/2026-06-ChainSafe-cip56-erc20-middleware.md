## Development Fund Proposal

**Author:** ChainSafe Systems
**Status:** Submitted
**Created:** 2026-06-02
**Label:** wallet-apps

**[Champion](https://github.com/canton-foundation/canton-dev-fund/blob/main/sig-directory.md):** Viv Dikawar (Canton Foundation)

---

## Abstract

This proposal funds the continued development, security review, and long-term maintenance of a MetaMask-compatible middleware for the Canton Network. The middleware exposes an Ethereum JSON-RPC facade over CIP-56 token contracts, a distributed indexer for CIP-56 contract state, and an Ethereum–Canton bridge relayer. The result: any MetaMask user, any EVM dapp, indexer, or block explorer can transact against Canton-native tokens through the same RPC surface they already use on Ethereum, while Canton's privacy-preserving ledger model is preserved.

The work is delivered in two build phases (a CIP-56-compliant middleware, indexer, and bridge; then a non-custodial MetaMask Snap and an institutional custody path) followed by two years of maintenance covering CIP-0112 (Token Standard V2) migration, CVE response, and standards-tracking compatibility updates.

---

## Specification

### 1. Objective

Deliver an EVM-tooling-compatible interface to CIP-56 tokens on Canton so that any MetaMask user or EVM-native dapp, indexer, or block explorer can transact against Canton-native tokens through the JSON-RPC surface they already use on Ethereum, without bespoke client integration.

### 2. Implementation Mechanics

The middleware sits between EVM tooling and the Canton ledger. End users register as Canton **external parties** through an EIP-191-signed payload. The middleware's Ethereum JSON-RPC server (`pkg/ethrpc/`, `cmd/api-server/`) implements the `eth_*`, `net_*`, and `web3_*` namespaces required for MetaMask and the broader EVM tooling ecosystem (`eth_chainId`, `eth_blockNumber`, `eth_gasPrice`, `eth_estimateGas`, `eth_getBalance`, `eth_getTransactionCount`, `eth_getCode`, `eth_call`, `eth_sendRawTransaction`, `eth_getTransactionReceipt`, `eth_getTransactionByHash`, `eth_getLogs`, `eth_getBlockByNumber`, `eth_getBlockByHash`). ERC-20 operations (`transfer`, `transferFrom`, `approve`, `balanceOf`, `allowance`, `totalSupply`) are reachable through standard contract-call encoding via `eth_call` / `eth_sendRawTransaction`, exactly as on Ethereum.

The Transaction Orchestration Engine maps EVM calldata to Canton Ledger API commands against CIP-56 contracts, executes them through the **Interactive Submission API** (`PrepareSubmission` → sign → `ExecuteSubmission`), and returns an EVM-shaped receipt. The signer is a pluggable interface (`pkg/cantonsdk/token/types.go`: `SignDER(message []byte) ([]byte, error)`, `Fingerprint() (string, error)`), wired through a `KeyResolver` callback at API-server initialisation. Phase 1 ships one concrete implementation backed by custodial secp256k1 keys with AES-256-GCM at-rest encryption. Phase 2 adds Snap-backed and institutional-custody-backed signers behind the same interface, selectable per deployment, per tenant, or per user.

A Go-based distributed indexer (`pkg/indexer/`, `cmd/indexer/`) subscribes to the Canton Ledger API, processes CIP-56 token and bridge lifecycle events (Holding creations/archivals, TransferFactory choices, Offer events), and maintains deterministic UTXO-aggregated balance, holdings, and allowance views in PostgreSQL. The indexer is deployable per node so each operator runs its own indexer scoped to its visibility.

The bridge relayer (`pkg/relayer/`, `cmd/relayer/`) uses a generic `Processor` with `Source`/`Destination` adapters for both Canton and Ethereum, enabling bidirectional token movement. The Canton side is modelled in the `bridge-core` Daml package; the Ethereum side in Solidity. PROMPT (ERC-20 → CIP-56 holding) is the reference bridged asset.

Middleware deployment supports two operational modes:

- **Full Visibility Mode**: for tokens where Super Validators have full ledger visibility (e.g., Canton Coin), the middleware can be operated by validator nodes for globally accurate ERC-20 responses.
- **Scoped Visibility Mode**: for stablecoins or tokenised RWAs, the middleware is operated by entities with global visibility into the token (issuers) or by end users for personal visibility. `balanceOf` returns only addresses the operator is authorised to see, preserving Canton's privacy model.

Daml package layout: `cip56-token` (Token, TransferFactory, Events, Config, Compliance — implementing Splice HoldingV1 and TransferFactory with DNS-prefixed metadata keys, e.g., `splice.chainsafe.io/symbol`); `bridge-core` (lock/unlock and mint/burn state machine); `common/FingerprintAuth.daml` for external-party authorization; integration test packages validated against Canton mainnet.

### 3. Architectural Alignment

This work targets Q2 ecosystem priorities directly:

- **App Building & Developer Experience**: every existing EVM tool — MetaMask, Hardhat, Foundry, Ethers, Viem, Etherscan-style explorers — works against CIP-56 tokens without modification. The cost of bringing an EVM-native dapp to Canton becomes "point your RPC at a different endpoint."
- **Token & Asset Standards**: the implementation is built against the ratified **CIP-0056 Splice Token Standard** (HoldingV1, TransferFactory) and is structured for forward migration to **CIP-0112 (Token Standard V2)** via parallel packages (see Rationale § CIP-112 Migration Plan).
- **Stability & Maintainability**: the pluggable signer architecture decouples custody choice from protocol code, so swapping custodial → Snap → KMS → custody-partner is a deployment-time configuration change, not a fork.
- **Security & Resilience**: a third-party security audit covers every component (API server, relayer, indexer, Daml contracts, Snap) prior to Phase 1 and Phase 2 acceptance, with re-audit triggers for V2 dual-interface delivery.

The middleware uses Canton's **Interactive Submission API** as the signer-pluggability seam, which is exactly the seam the API was designed to expose. It does not introduce new ledger semantics, does not modify Canton consensus, and does not alter the trust model for any party beyond the operator running the middleware itself.

### 4. Backward Compatibility

No backward compatibility impact on existing Canton flows. CIP-56 packages are deployed alongside any existing token packages on a participant. When CIP-0112 is ratified, V2 packages will be deployed in parallel with V1 per CIP-0112 §5.2 — V1 implementations continue to operate untouched, and the middleware's orchestrator selects the V1 vs V2 command builder per token at runtime based on the token's advertised compatibility.

---

## Milestones and Deliverables

### Milestone 1: Phase 1 — ERC-20 Middleware, Indexer, and Bridge for CIP-56 Tokens

- **Estimated Delivery:** Q4 2026 (approximately 4 months from grant acceptance)
- **Focus:** Ship the source code, contracts, deployment artifacts, and documentation that enable any qualified operator to stand up an EVM-tooling-compatible interface to CIP-56 tokens.
- **Deliverables / Value Metrics:**
  - **Architecture & Design Documentation**: system architecture diagrams (deployment topology + data flow), API interface schemas, security and privacy model covering both visibility modes.
  - **Daml CIP-56 + Bridge contracts**: `cip56-token` (Token, TransferFactory, Events, Config, Compliance), `bridge-core` (lock/unlock/mint/burn state machine), `common/FingerprintAuth.daml`, plus unit and integration test suites validated against Canton mainnet.
  - **Middleware Service**: Ethereum JSON-RPC API server, Transaction Orchestration Engine (EVM calldata → Canton Interactive Submission), identity/auth/registration (EIP-191 + external-party allocation + JWT session management), pluggable signer interface with the Phase 1 custodial implementation, Splice Registry client, Contract State Resolver, indexer integration adapter, and Docker/Kubernetes deployment artifacts.
  - **Indexer Backend Service**: Go-based indexer subscribing to the Canton Ledger API, PostgreSQL storage with deterministic UTXO aggregation, HTTP query API, per-node distributed deployment, and Docker/Kubernetes artifacts.
  - **EVM ↔ Canton Bridge and Relayer**: relayer service with generic Source/Destination adapters, Solidity bridge contracts, bridge state store, PROMPT reference bridged asset, and local-bootstrap end-to-end test harness (Canton + Anvil + middleware + relayer).
  - **Integration Testing & Demo**: end-to-end functional test suite, Daml scenario tests, lightweight CLI/web demo application.
  - **Documentation & User Guide**: developer integration guide, full API reference, deployment guide.
  - **Value metrics**: at least 1 CIP-56 issuer running the middleware in production; reference EVM dapp transacting against a CIP-56 token end-to-end; publicly available Docker images and Kubernetes manifests; bridged-asset round-trip (Ethereum ↔ Canton) demonstrated end-to-end.

### Milestone 2: Phase 2 — Non-Custodial MetaMask Snap + Institutional Custody Path

- **Estimated Delivery:** Q2 2027 (approximately 4 months after Milestone 1 acceptance)
- **Focus:** Ship the two signing surfaces the Phase 1 architecture was designed to support — a MetaMask Snap for retail non-custodial signing, and an institutional custody path (custody-partner integration if available, in-house KMS otherwise) for issuers and counterparties requiring external audited custody.
- **Deliverables / Value Metrics:**
  - **Architecture & Design Refresh**: updated diagrams for each signer implementation; deterministic Canton-party derivation from MetaMask seed phrase with new-device recovery; per-key authorization policies for institutional path; threat models for each signing surface; custody-partner evaluation framework with go/no-go decision gate at week 4 of Phase 2.
  - **MetaMask Snap for Canton Signing**: Ed25519 signing inside MetaMask's isolated origin, key material derived deterministically from the user's existing MetaMask seed phrase (so seed-phrase recovery also recovers the Canton party), no key material on the server or on disk outside MetaMask. Browser onboarding (install Snap → allocate external party → register with API server → recover on new device via standard MetaMask flow). Snap published to the MetaMask Snap registry with versioned signed updates.
  - **Institutional Custody Integration (Track A or Track B)**: Track A (preferred) — partnership integration against an established custody provider (evaluation set: Fireblocks, BitGo, Anchorage Digital, Copper, plus any further providers identified). Track B (fallback if no partnership reached on commercially or technically acceptable terms within the first four weeks of Phase 2) — in-house KMS-backed signer against AWS KMS as primary target, abstracted so a second provider can be added without rework. Both tracks terminate at the same signer interface.
  - **Integration Testing, Security Review, and Demo**: end-to-end tests across custodial / Snap / institutional / mixed-mode deployments; **independent third-party security audit** of the Snap (BIP-44 derivation correctness, DER signing flow, dialog prompts, supply-chain posture, manifest permission scope) and of the institutional integration; findings remediated before acceptance; audit reports published under `docs/audits/`.
  - **Documentation & Integrator Guides**: a reference dapp per signer mode (custodial, Snap, institutional), Snap user guide, Snap integration guide for dapp developers, institutional custody deployment guide, updated API reference, per-path threat-model summaries suitable for risk-conscious integrators.
  - **Value metrics**: Snap published to the MetaMask registry and installable by any user; at least 1 issuer onboarded on the institutional custody path; published independent audit report covering both new signing surfaces.

### Milestone 3: Maintenance Year 1 — CIP-0112 Migration + Sustainment

- **Estimated Delivery:** Q2 2028 (12 months after Milestone 2 acceptance)
- **Focus:** Ship CIP-0112 (Token Standard V2) dual-interface support, respond to CVEs, track Canton mainnet compatibility, and provide best-effort upkeep against the Apache 2.0 codebase.
- **Deliverables / Value Metrics:**
  - **CIP-0112 V2 dual-interface delivery**: V1 and V2 packages running in parallel via Daml module-prefixes (per CIP-0112 §5.2); V2-aware indexer decoder; V2 command builder in the middleware orchestrator selected per token at runtime; bridge updates to use V2 non-holder Account destinations for mint/burn. Timeline is conditional on CIP-0112 ratification — see contingency in Rationale.
  - **CVE response & security patches** on a triage cadence aligned with severity.
  - **Compatibility tracking**: timely compatibility updates as CIP-56 / CIP-112 standards evolve.
  - **Value metrics**: at least 2 issuers in production using the middleware; zero unresolved P0/P1 CVEs at end of period.

### Milestone 4: Maintenance Year 2 — Continued Sustainment

- **Estimated Delivery:** Q2 2029 (12 months after Milestone 3 acceptance)
- **Focus:** Continued upkeep, standards tracking, and security patching.
- **Deliverables / Value Metrics:**
  - Ongoing security patches and CVE response.
  - Continued tracking of CIP-56 / CIP-112 standards evolution with timely compatibility updates.
  - Critical bug fixes affecting correctness of token operations, bridge flows, or signing paths.
  - **Value metrics**: sustained production use by at least 3 issuers; zero unresolved P0/P1 CVEs at end of period; public Docker images and the MetaMask Snap remain available throughout.

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone
- Demonstrated functionality and operational readiness through working reference deployments
- Documentation and knowledge transfer provided
- Alignment with stated ecosystem value metrics

Per-milestone ecosystem-value criteria:

- **M1**: at least 1 CIP-56 issuer (USDCx or equivalent) running the middleware in production; a reference EVM dapp transacting against a CIP-56 token end-to-end; public Docker images and Kubernetes manifests released; Ethereum ↔ Canton bridge round-trip demonstrated.
- **M2**: Snap published to the MetaMask Snap registry and installable by any user; at least 1 issuer onboarded on the institutional custody path; independent third-party audit report published under `docs/audits/`.
- **M3**: at least 2 issuers in production; CVE response SLA met; CIP-0112 V2 dual-interface work scoped and progressed against ratification timing (see Rationale § CIP-112 Migration Plan contingency).
- **M4**: sustained production use by at least 3 issuers; zero unresolved P0/P1 CVEs at end of period; published artifacts (Docker images, Snap registry listing, documentation) remain publicly available.

Acceptance is based on value delivered to the ecosystem, not on artifact delivery in isolation. Audit findings (where applicable) must be remediated before the corresponding milestone is accepted.

---

## Funding

**Total Funding Request:** 40,000,000 CC (40M Canton Coin)

### Payment Breakdown by Milestone

- Milestone 1 _(Phase 1 — ERC-20 Middleware, Indexer, and Bridge)_: **15,000,000 CC** upon committee acceptance.
- Milestone 2 _(Phase 2 — Non-Custodial Snap + Institutional Custody)_: **5,000,000 CC** upon committee acceptance.
- Milestone 3 _(Maintenance Year 1 — CIP-0112 + Sustainment)_: **10,000,000 CC** upon committee acceptance.
- Milestone 4 _(Maintenance Year 2 — Continued Sustainment)_: **10,000,000 CC** upon final release and acceptance.

### Volatility Stipulation

The project duration is greater than 6 months. The grant is denominated in fixed Canton Coin and will require a re-evaluation at the 6-month mark.

---

## Co-Marketing

Upon release, ChainSafe will collaborate with the Foundation on:

- **Announcement coordination**: joint launch communications for each milestone, particularly the MetaMask Snap registry listing in Milestone 2.
- **Case study and technical blog**: published walkthroughs of the EVM-tooling-against-Canton experience, the Snap UX, and integration patterns for issuers.
- **Developer and ecosystem promotion**: integration guides, reference dapps per signer mode, and developer outreach through ChainSafe's existing ecosystem channels.

---

## Motivation

**Ecosystem impact.** MetaMask has the dominant retail wallet share on EVM networks. Every CIP-56 issuer that wants retail reach today must either build a bespoke wallet integration or accept that their token is unreachable from the wallet most users already have installed. This middleware closes that gap for every CIP-56 token on Canton — not by changing Canton, but by speaking the protocol every existing EVM tool already speaks.

**Portion of ecosystem benefiting.** The work is directly applicable to:

- **Every CIP-56 token issuer** seeking EVM-tool reachability — stablecoins (e.g., USDCx), tokenised RWAs, future Canton-native assets. Universal benefit across the CIP-56 issuer population.
- **Every EVM-native dapp, indexer, and block explorer** that today does not support Canton — the JSON-RPC facade means they don't need to. Hardhat, Foundry, Ethers, Viem, Etherscan-style explorers, EVM-native analytics platforms all become Canton-aware through configuration alone.
- **Retail users** for whom MetaMask is the only wallet they will install. The Phase 2 Snap converts this from a custodial bridge to a fully non-custodial Canton signing experience inside MetaMask, derived from the user's existing seed phrase.
- **Institutional issuers and counterparties** requiring audited external custody. The Phase 2 institutional path is the same signer interface against either a custody partner or a cloud KMS, selectable per deployment.

**Strategic importance.** Canton's privacy model and EVM-tool reachability are typically presented as a trade-off. This middleware demonstrates they aren't: the same RPC surface MetaMask uses can be served against Canton without compromising the privacy-scoped visibility model — the operator simply returns the answers it is authorised to give, exactly as Canton's trust model requires.

---

## Rationale

### Why a JSON-RPC facade rather than a custom Canton SDK

The EVM tool ecosystem (wallets, indexers, explorers, dapp frameworks) is enormous and converged on the Ethereum JSON-RPC surface. A facade lets every one of those tools work against Canton at the cost of one server-side translation layer. A custom SDK requires every tool to be re-integrated; the cost is paid by every dapp and tool author indefinitely. The facade pays the cost once.

### Why the Canton Interactive Submission API for signer pluggability

Interactive Submission separates command preparation from signing. That separation is the natural seam for swapping signer implementations: the orchestrator prepares a Canton submission, hands the prepared payload off to a signer (custodial / Snap / partner / KMS) for a DER signature, and submits the signed result. The protocol does not need to change when the signer changes. This is why Phase 1 ships a custodial signer and Phase 2 ships Snap + institutional signers behind the same interface.

### Why a dual-track institutional path

Custody is the single biggest determinant of whether an institutional issuer will adopt a system. A partner integration is lower-risk (established compliance posture, faster path to enterprise adoption) but is contingent on commercial and technical alignment. Beginning Phase 2 with a structured 4-week partner evaluation, with an in-house KMS-backed signer as the documented fallback against the same signer interface, guarantees Phase 2 delivers an institutional path regardless of partnership outcome. The budget envelope is identical for either track.

### CIP-112 (Token Standard V2) migration

CIP-0112 is a backwards-compatible evolution of CIP-0056 introducing a new EventLog interface, committed allocations and iterated settlement, non-holder Account destinations, privacy-preserving batch settlement, and a pause-status metadata flag. V2 ships as new major-version `splice-api-token-*` packages alongside V1.

Per-layer reuse estimates for V2 delivery:

| Layer | V1 → V2 reuse | Coupling | Notes |
| :---- | :---- | :---- | :---- |
| Daml `cip56-token` packages | ~40% | Tight | Field names and interface instantiations are V1-bound; contract logic patterns survive. |
| Indexer (`pkg/indexer/engine/`) | ~70% | Medium-loose | Decoder pattern is structural; event field renames are the main lift. |
| Middleware orchestration (`pkg/ethrpc/`, `pkg/transfer/`) | ~60% | Medium | Module/entity/choice names are V1-specific; the prepare/execute flow is V-agnostic. |
| Bridge contracts (`bridge-core`) | ~30% | Tight | Mint/burn calls are V1-coupled; flow patterns survive. |

V1 and V2 packages run in parallel via Daml module-prefixes. The indexer gains a V2-aware decoder reusing the existing decoder pattern with V2 field names. The middleware orchestrator gains a V2 command builder alongside the V1 builder, selected per token at runtime based on the token's advertised compatibility (per CIP-0112 §5.2). Core dual-interface effort: 4–6 weeks of engineering with the parallel-packages approach.

**Contingency:** if CIP-0112 is ratified during Phase 2, V2 dual-interface delivery is pulled forward into the back half of Phase 2 in coordination with Foundation timing, funded out of the existing Phase 2 budget envelope. If ratification slips past the end of Phase 2, V2 work begins in Maintenance Year 1 as currently scoped.

### Audit Policy and Cadence

The middleware includes security-critical components: an API server brokering signing and Canton submission, a relayer holding and moving bridge funds, an indexer that serves as the source of truth for balance queries, on-chain Daml contracts custodying value, and (in Phase 2) a MetaMask Snap loaded into the user's wallet. The proposal commits to a comprehensive audit posture across the entire stack.

**Pre-release audit for the MetaMask Snap** (before any release to the MetaMask Snap registry) covers: key derivation against BIP-44 `m/44'/60'/1'/0/0`; DER signing flow and absence of key/signature leakage to the host page; dialog-prompt UX (no signing without explicit confirmation, accurate transaction information); supply-chain posture (`package.json`, lockfile, pinned cryptographic dependencies, build reproducibility); `snap.manifest.json` permission scope (`snap_getEntropy`, `snap_dialog`, `snap_manageState`).

**Full middleware stack audit** (parallel with Snap audit) covers: API server (JSON-RPC surface, Interactive Submission orchestration, session/auth, EIP-191 registration, custodial key handling, AES-256-GCM at-rest storage); relayer (bidirectional engine, bridge state machine, nonce tracking, chain-reorg handling); indexer (event ingestion correctness, deterministic aggregation, visibility-scoped query semantics); Daml contracts (reviewed by a Daml-fluent auditor — Digital Asset, Sygnum, or equivalent); cross-component integration as a single attack surface.

Findings remediated before the corresponding milestone is accepted. Full audit reports published under `docs/audits/`, linked from package READMEs and the Snap registry listing. Reproducible-build instructions published alongside each release.

### Licensing and Open-Source Posture

All grant-funded deliverables are released under **Apache License 2.0** with full source on public GitHub repositories. No component is proprietary, source-available-only, or otherwise restricted.

License coverage per subtree:

- Go middleware (`cmd/`, `pkg/`): Apache 2.0
- Daml contracts (`contracts/canton-erc20/daml/`, including `cip56-token`, `bridge-core`, `bridge-wayfinder`, `common`): Apache 2.0
- Solidity bridge contracts (`contracts/ethereum-wayfinder/`, `contracts/canton-erc20/ethereum/`): Apache 2.0
- MetaMask Snap (`canton-snap` repository): Apache 2.0
- Documentation, deployment templates, and reference apps: Apache 2.0

**Out of scope (operational infrastructure, not grant deliverables):** ChainSafe-operated hosted services such as Canton DevNet endpoints, Auth0 tenants, OAuth client secrets, per-tenant deployment credentials, and any third-party RPC accounts. Docker images, Kubernetes manifests, and configuration templates that describe deployments are in scope as source artifacts; the running deployments are not.

**Third-party dependency disclosure:** a transitive dev/test dependency (`halmos-cheatcodes` under `openzeppelin-contracts` test tooling) is licensed under AGPL-3.0. The dependency is build-time only, used in Solidity test suites, and is not bundled into any distributed binary or contract artifact. The dependency will be replaced or vendor-isolated before Phase 1 acceptance to keep the project's effective license footprint Apache-2.0-compatible end-to-end.

All released packages ship `SPDX-License-Identifier` headers, a root `LICENSE` file containing the Apache 2.0 text, and a `NOTICE` file enumerating third-party licenses.

### Long-Term Sustainment (Post-Year 2)

Beyond Maintenance Year 2, ChainSafe commits to ongoing best-effort upkeep as open infrastructure: security patches against disclosed CVEs, critical correctness fixes affecting token operations / bridge flows / signing paths, and tracking of CIPs affecting CIP-56 / CIP-112 semantics. This baseline is funded by ChainSafe out of pocket and continues indefinitely. GitHub repositories remain public and Apache 2.0-licensed; Docker images and the MetaMask Snap registry listing remain available; documentation remains accessible. ChainSafe will not lock out downstream operators, relicense, or remove published artifacts.

Two options remain open for the Foundation and ecosystem to consider closer to end of Year 2 — Foundation-funded maintainer rotation, or a ChainSafe paid-SLA tier for issuers requiring guaranteed response times — neither of which is a precondition for the baseline sustainment commitment.
