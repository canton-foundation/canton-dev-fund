## Development Fund Proposal

**Author:** Eunoia CYM Limited
**Status:** Submitted
**Created:** 2026-06-05
**Label:** token-asset-standards
**Champion:** Canton Foundation

---

## Abstract

Eunoia CYM Limited (the "Applicant"), working alongside its technical collaborator (Chainsafe Systems Inc, "Chainsafe") is pleased to submit this grant application.

This project provides Canton Network operators, token issuers, and ecosystem participants with a MetaMask-compatible middleware exposing an Ethereum JSON-RPC facade over CIP-56 token contracts, plus a distributed indexer and an Ethereum↔Canton bridge relayer. The system lets any EVM-native wallet, dapp, or tool interact with Canton-native tokens using familiar Ethereum semantics, while preserving Canton's privacy-preserving ledger model.

This grant application covers the continued development and maintenance of the Canton middleware: an Ethereum JSON-RPC server, a distributed indexer, an Ethereum↔Canton bridge relayer, and the supporting Daml contracts (CIP-56 token, bridge core). Users are onboarded as Canton external parties via EIP-191-signed registration, and Canton transactions are executed through the Interactive Submission API. The result is that any MetaMask user, or any EVM dapp, indexer, or block explorer, can transact against Canton-native tokens through the same RPC surface they already use on Ethereum, while Canton's privacy and finality guarantees are preserved.

The work is structured in two build stages (M1–M4, M5–M6):

- **M1–M4: MetaMask-Compatible Middleware for CIP-56 Tokens.** Implement CIP-56 / Splice Token Standard compliant Daml packages (Token, TransferFactory, Events, Config, Compliance), an Ethereum JSON-RPC server that exposes ERC-20 operations through standard EVM contract-call encoding, a Go-based distributed indexer for CIP-56 contract state, and an Ethereum/Canton bridge relayer. The result: any MetaMask user or EVM-native tool can interact with CIP-56 tokens through familiar Ethereum RPC, including bridged stablecoins like USDCx as additional CIP-56 issuances onboard.

  Note: The middleware is built against the current CIP-0056 token standard. CIP-0112 (Canton Token Standard V2) is in Draft status as of 2026-05-22. ChainSafe is tracking the spec and the reference implementation on the splice `token-standard-v2-upcoming` branch in parallel with M5–M6 work. The migration approach, code-reuse estimates, and contingency clause for mid-build ratification are detailed in the "CIP-112 Migration Plan" subsection below.

- **M5–M6: Non-Custodial Signing via MetaMask Snap and Institutional Custody Path.** Eliminate the platform as a trust point for end-user signing by shipping a MetaMask Snap that performs Canton Ed25519 signing inside MetaMask's isolated origin, with key material derived from the user's existing MetaMask seed phrase. In parallel, establish an institutional custody path, either through integration with an established custody partner (e.g. Fireblocks, BitGo, Anchorage, Copper) or, if no viable partner is available, through an in-house KMS-backed signer. Both tracks drop into the pluggable signer interface introduced in Milestones 1–4; the choice between custodial, Snap, partner, and KMS becomes a deployment-time configuration rather than a code change.

Middleware deployment is designed for two operational modes:

- **Full Visibility Mode:** For tokens like Canton Coin, where Super Validators have full ledger visibility, the middleware can be operated by validator nodes to provide globally accurate ERC-20 API responses.
- **Scoped Visibility Mode:** For other tokens (e.g., stablecoins or tokenized RWAs), the middleware must be operated by entities with global visibility into the token (e.g., issuers), or by end users for personal visibility. In this mode, functions like `balanceOf` will only work for addresses the operator is authorized to see, ensuring compliance with Canton's privacy model.

Detailed licensing posture, infrastructure topology, audit policy, CIP-112 migration plan, and long-term sustainment commitments are provided in dedicated sections below.

---

## Licensing and Open-Source Posture

All grant-funded deliverables are released under **Apache License 2.0** with full source on public GitHub repositories. No component of the deliverable set is proprietary, source-available-only, or otherwise restricted.

License coverage per deliverable subtree:

- Go middleware (`cmd/`, `pkg/`): Apache 2.0
- Daml contracts (`contracts/canton-erc20/daml/`, including `cip56-token`, `bridge-core`, `bridge-wayfinder`, and `common`): Apache 2.0
- Solidity bridge contracts (`contracts/ethereum-wayfinder/` and `contracts/canton-erc20/ethereum/`): Apache 2.0
- MetaMask Snap (`canton-snap` repository): Apache 2.0
- Documentation, deployment templates, and reference apps: Apache 2.0

**Explicit non-scope** (infrastructure operations, not grant deliverables): ChainSafe-operated hosted services such as DevNet endpoints, Auth0 tenants, OAuth client secrets, and per-tenant deployment credentials are operational infrastructure. The Docker images, Kubernetes manifests, and configuration templates that describe deployments are in scope as source artifacts; the running deployments are not.

**Third-party dependency disclosure:** a transitive dev/test dependency (`halmos-cheatcodes` under `openzeppelin-contracts` test tooling) is licensed under AGPL-3.0. This dependency is build-time only, used in Solidity test suites, and is not bundled into any distributed binary or contract artifact. The dependency will be replaced or vendor-isolated before Milestones 1–4 acceptance to keep the project's effective license footprint Apache-2.0-compatible end to end.

All released packages will ship `SPDX-License-Identifier` headers, a root `LICENSE` file containing the Apache 2.0 text, and a `NOTICE` file enumerating third-party licenses included in the build.

---

## Infrastructure Topology

ChainSafe operates a small set of services to support development, integration testing, and reference deployments; production deployments for token issuers are stood up by the issuer or their chosen operator using the same images and templates. The two diagrams below distinguish what ChainSafe operates (Diagram A) from how data flows across a representative transaction (Diagram B).

### Diagram A: Deployment topology

![Deployment topology](./2026-06-Eunoia-cip56-erc20-middleware-deployment-topology.png)

**Caption:** Services inside the "ChainSafe-Operated" boundary are stood up and maintained by the team for the duration of the grant. Production deployments for issuers are stood up by the issuer or their chosen operator from the same source artifacts. The "5North" Canton DevNet is ChainSafe's hosted Canton network used for ecosystem development and testing. Auth0 issues JWTs consumed by the API server. The optional Prometheus + Grafana stack is shipped as templates; ChainSafe runs an internal instance for the hosted services.

External components are owned and operated by their respective parties: end users hold their own MetaMask + Snap; customer dapps run wherever the customer chooses; the Splice scan-proxy and token registry are part of the Splice ecosystem; Ethereum L1 connectivity uses commercial RPC providers; and Canton counterparty participants are operated by their respective parties under the Canton trust model.

### Diagram B: Data flow

![Data flow](./2026-06-Eunoia-cip56-erc20-middleware-data-flow.png)

**Caption:** A representative user transaction flows through the API server's JSON-RPC facade, is translated to a Canton Interactive Submission, signed through the pluggable Signer interface (custodial, Snap, or institutional custody), and executed on the Canton ledger. The indexer observes the resulting ledger events to keep its materialised balance and holdings views current. The bridge relayer operates in parallel: deposits on Ethereum L1 are observed and minted as Canton holdings, with the indexer picking up the resulting events through the same path.

---

## Delivery Scope (Milestones 1–6)

The grant deliverable is the source code, documentation, and deployable artifacts described below, hosted on public GitHub repositories under Apache 2.0. ChainSafe does not deliver operated infrastructure under this grant; we deliver the code and templates that enable any qualified operator to stand up their own deployment.

### In Scope

- Source repositories: `canton-middleware` (this repo) and `canton-snap`.
- All Daml packages: `cip56-token`, `bridge-core`, `bridge-wayfinder`, and `common`, plus integration test packages.
- All Solidity bridge contracts (`ethereum-wayfinder`, `canton-erc20/ethereum`) plus Foundry test suites.
- All Go source: API server, indexer, relayer, plus Dockerfiles and binary build configurations.
- TypeScript Snap source plus the npm-published Snap artifact.
- Documentation: architecture, API reference, integration guides per signer type, threat models, deployment guides.
- Infrastructure-as-code templates: Docker Compose, Kubernetes manifests, configuration examples for both operational modes.
- Reference applications and demo scripts.
- Audit reports for the Snap and the bridge contracts, published under `docs/audits/`.

### Out of Scope

- ChainSafe-operated hosted services: Canton DevNet endpoints (internally "5North"), Auth0 tenant, production endpoint URLs, OAuth client secrets, per-tenant credentials.
- Customer-specific configuration values for any integrator's deployment.
- Third-party RPC provider accounts (Infura/Alchemy for EVM, etc.).
- Custodial-partner integration credentials.
- Hardware: HSMs, KMS instances, and CI/CD runners (templates and integration code are in scope; the physical or cloud instances are not).
- Operational support and on-call coverage for any deployment not contractually engaged separately.

The project will deliver the following components and capabilities:

### Architecture & Design Documentation

- System architecture diagram describing interactions between:
  - On-ledger Daml contracts (relayer and CIP-56 token)
  - Off-ledger API server exposing Ethereum JSON-RPC and orchestrating Canton Interactive Submission flows
  - Go indexer materialising CIP-56 contract state for balance/holdings/event queries
- API interface schemas for the ERC-20-compatible middleware.
- Security and privacy model, including:
  - Middleware operation under Canton's visibility constraints (global vs partial observability)
  - Access control patterns for issuer-hosted and user-hosted middleware deployments

### DAML Contracts (CIP-56 / Splice Token Standard Compliant)

Implementation of CIP-56-compliant Daml packages, structured as:

- `cip56-token`: `Token.daml`, `TransferFactory.daml`, `Events.daml`, `Config.daml`, `Compliance.daml`, implementing the Splice Token Standard (HoldingV1, TransferFactory) with DNS-prefixed metadata keys (e.g. `splice.chainsafe.io/symbol`).
- `bridge-core`: Daml contracts modelling the Canton side of the Ethereum↔Canton bridge, used to lock/unlock and mint/burn future bridged assets.
- `common`: shared utilities including fingerprint-based authorization (`FingerprintAuth.daml`) for external-party flows.
- Approve/transferFrom semantics are exposed at the JSON-RPC layer, mapped onto Canton's TransferFactory and signed-instruction model rather than implemented as standalone allowance contracts (consistent with how Splice canonically models authorization in CIP-56).
- Unit and integration test suites under `cip56-token-tests/`, `bridge-core-tests/`, and `integration-tests/`, validated against Canton mainnet.

### ERC-20 Middleware API Layer

- Ethereum JSON-RPC server compatible with MetaMask and the broader EVM tooling ecosystem (block explorers, indexers, dapps). Method surface includes `eth_chainId`, `eth_blockNumber`, `eth_gasPrice`, `eth_estimateGas`, `eth_getBalance`, `eth_getTransactionCount`, `eth_getCode`, `eth_call`, `eth_sendRawTransaction`, `eth_getTransactionReceipt`, `eth_getTransactionByHash`, `eth_getLogs`, `eth_getBlockByNumber`, `eth_getBlockByHash`, plus `net_*` and `web3_*` namespaces. ERC-20 operations (`transfer`, `transferFrom`, `approve`, `balanceOf`, `allowance`, `totalSupply`) are reachable through standard contract-call encoding via `eth_call` / `eth_sendRawTransaction`, exactly as on Ethereum.
- Transaction Orchestration Engine that maps EVM transactions to Canton Interactive Submission flows: decode EVM calldata → construct Canton Ledger API commands against CIP-56 contracts → PrepareSubmission → sign with the user's custodial Canton key → ExecuteSubmission → return an EVM-shaped transaction receipt.
- Identity, registration, and session management:
  - User registration via EIP-191-signed payloads, with per-user external-party allocation on Canton.
  - JWT-based session management for the JSON-RPC server, plus EVM-signature verification for transaction submission.
  - Custodial key management (`pkg/keys/`): secp256k1 user keys at rest, AES-256-GCM encrypted, used to sign Canton Interactive Submission payloads on behalf of the user. Architecture is structured to allow a future non-custodial signing path (MetaMask Snap or KMS-backed) without protocol changes.
  - Splice Registry client (`pkg/registry/`) for discovering wallet TransferFactory contracts.
- Contract State Resolver to resolve token and holding contract states, including UTXO composition for transfers.
- Visibility-Aware Execution Logic, which allows middleware to operate in "full visibility" (issuer/operator) and "partial visibility" (end-user) modes, returning appropriate errors for unauthorized queries.
- Deployment infrastructure (Docker, Kubernetes, IaC) and observability components for both operational modes.

### Indexer

- Indexer Core Service that subscribes to Canton Ledger API or Canton Sync Service for all relevant token-related events (contract creations/archivals).
- Database Schema & Storage Engine (PostgreSQL or equivalent), optimized for real-time token state queries and immutable audit trails.
- Deterministic Indexing Logic to maintain consistent balance and allowance views from distributed UTXO contract state.
- Query API Layer for exposing token state to middleware and clients in a format analogous to standard ERC-20 calls.

---

## Milestones

The grant is organised as six delivery milestones (M1–M6), a CIP-0112 migration milestone (M7), and eight quarterly maintenance milestones (M8–M15). Engineering is paid on committee acceptance of delivery, with value gates on the milestones: M5 and M6 each hold part of their payment against an adoption gate, M7 carries a traction gate alongside the CIP-0112 delivery, and the maintenance term (M8–M15) is released quarter by quarter against both a maintenance upkeep bar and a verified adoption tranche. Per CIP-0100, adoption is funded directly: 11mil (about 30% of the grant) is released only against independently verified ecosystem adoption.

### Milestone 1: Architecture & Daml / Bridge Contracts

Combines the system design and the on-ledger Daml packages that the middleware, indexer, and bridge all build on.

- **Architecture & Design document**
  - System architecture diagram describing interactions between Daml contracts, middleware, and indexer.
  - Data flow specifications outlining how token state changes propagate across layers (ledger → indexer → API).
  - Interface definitions and API schemas (OpenAPI spec or gRPC IDL) for ERC-20 middleware endpoints.
  - Security and privacy model detailing identity mapping, authorization flow, and data access restrictions.
- **Daml CIP-56 Token + Bridge Contracts**
  - CIP-56 / Splice Token Standard compliant Daml packages: `cip56-token` (Token, TransferFactory, Events, Config, Compliance) reference token implementation.
  - Bridge Daml packages: `bridge-core` (lock/unlock/mint/burn state machine).
  - Shared modules: `common/FingerprintAuth.daml` and supporting types/utilities for external-party authorization.
  - ERC-20 semantics (transfer, approve, transferFrom, balanceOf, allowance, totalSupply, mint, burn) exposed through the JSON-RPC layer and mapped to TransferFactory / signed-instruction flows rather than via a standalone allowance template.
  - Unit and integration test suites against Canton mainnet.
- **Estimated resources:** Engineering: 8 weeks; Project Management: 2 weeks
- **Estimated duration:** 4 weeks
- **Amount:** 3mil
- **Acceptance Criteria:**
  - Architecture and design documents (deployment topology, data-flow, API schemas, security/privacy model) published to the public repository and available for committee review.
  - `cip56-token` and `bridge-core` packages build and pass their unit + integration test suites against Canton mainnet, reproducibly from the repo.

### Milestone 2: Middleware Service (Ethereum JSON-RPC API + supporting libraries)

- **Scope:**
  - **Ethereum JSON-RPC API Server** (`pkg/ethrpc/`, `cmd/api-server/`): MetaMask-compatible JSON-RPC server implementing the `eth_*`, `net_*`, and `web3_*` method namespaces required for EVM wallet, dapp, indexer, and explorer interoperability.
  - **Transaction Orchestration Engine**: EVM-calldata → Canton-command translation, executed via Interactive Submission (PrepareSubmission → sign → ExecuteSubmission).
  - **Identity, Auth, and Onboarding**: user registration via EIP-191 signatures, external-party allocation, JWT session management, EVM-signature verification (`pkg/auth/`, `pkg/registration/`).
  - **Pluggable Signer interface** (`pkg/cantonsdk/token/types.go`) with signature `SignDER(message []byte) ([]byte, error)` and `Fingerprint() (string, error)`, wired through a `KeyResolver` callback in `pkg/app/api/server.go` so signer implementations are selected at API server initialization time. This milestone ships one concrete implementation (`CantonKeyPair` in `pkg/keys/canton_keys.go`) backed by custodial secp256k1 keys with AES-256-GCM encryption at rest. The interface is designed to accept additional implementations without orchestrator changes: Milestones 5–6 add Snap-backed and institutional-custody-backed signers behind the same interface, selectable per deployment, per tenant, or per user.
  - Splice Registry client (`pkg/registry/`) for wallet TransferFactory discovery.
  - **Contract State Resolver**: token + holding + bridge state resolution for transaction construction and EVM-shaped receipts.
  - **Indexer Integration Adapter**: balance, holdings, and event queries served from the indexer backend.
  - **Infrastructure as Code**: containerisation (Docker), Kubernetes manifests, configuration, observability.
- **Estimated resources:** Engineering: 14 weeks; DevOps: 1 week; Project Management: 2 weeks
- **Estimated duration:** 7 weeks
- **Amount:** 5mil
- **Acceptance Criteria:**
  - A stock MetaMask wallet connects to the middleware and completes an ERC-20 transfer against a CIP-56 token (USDCx) on MainNet through the `eth_*` surface, with no bespoke client integration.
  - The documented `eth_*` / `net_*` / `web3_*` methods return EVM-shaped responses, and end-to-end onboarding (EIP-191 registration → external-party allocation → JWT session) works against a live endpoint.

### Milestone 3: Indexer Backend Service

- **Scope:**
  - **Indexer Core Service** (`pkg/indexer/`, `cmd/indexer/`), written in Go for stack consistency, subscribing to Canton Ledger API and processing CIP-56 token + bridge contract lifecycle events (Holding creations/archivals, TransferFactory choices, Offer events).
  - **Database & Storage**: PostgreSQL, optimised for real-time balance/holdings/allowance queries and immutable audit trails.
  - **Deterministic Aggregation**: UTXO-style holdings rolled up deterministically into total supply, per-party balance, and per-token allowance views.
  - **Query API**: HTTP query layer exposing balance, holdings, allowance, supply, and event queries to the JSON-RPC server and external consumers.
  - **Distributed Operation**: deployable per node so each operator can run its own indexer scoped to its visibility.
  - **Infrastructure as Code**: containerisation, Kubernetes manifests, observability.
- **Estimated resources:** Engineering: 14 weeks; DevOps: 1 week; Project Management: 1.5 weeks
- **Estimated duration:** 7 weeks
- **Amount:** 5mil
- **Acceptance Criteria:**
  - Indexer-reported balances, holdings, allowances, and total supply reconcile with Canton ledger state for a live CIP-56 token.
  - The indexer runs per-node scoped to operator visibility, and an EVM dapp or block explorer successfully reads token state through indexer-backed JSON-RPC responses.

### Milestone 4: EVM/Canton Bridge, Relayer, Integration & Documentation

Combines the bridge/relayer, end-to-end integration testing and demo, and the developer documentation.

- **EVM/Canton Bridge and Relayer**
  - **Relayer service** (`pkg/relayer/`, `cmd/relayer/`) implementing a generic Processor with Source/Destination adapters for both Canton and Ethereum, enabling bidirectional token movement.
  - **Canton bridge Daml contracts** (`bridge-core`) for the on-ledger side of locking/unlocking and minting/burning bridged tokens.
  - **Ethereum bridge contracts** for the EVM side.
  - **Bridge state store** (`pkg/db/`) tracking transfers, chain state, and nonces.
  - **Reference bridged asset:** PROMPT (ERC-20 → CIP-56 holding).
  - Unit, integration, and end-to-end test suites including local bootstrap (`scripts/testing/bootstrap-local.sh`) running Canton + Anvil + middleware + relayer in concert.
- **Integration Testing & Demo**
  - End-to-End Functional Test Suite: comprehensive automated tests validating all ERC-20 operations.
  - Scenario-Based Daml Simulations: integration of test scripts that simulate realistic user flows.
  - Mock Frontend / CLI Demo Application: a lightweight web UI or command-line interface that showcases ERC-20 usage.
- **Documentation & User Guide**
  - Developer Integration Guide: how third-party developers interact with the middleware, including API endpoints, authentication flows, example payloads, and token operations.
  - API Specs: documentation of all ERC-20-compatible endpoints, suitable for inclusion in SDKs or third-party tooling.
- **Estimated resources:** Engineering: 12 weeks; Project Management: 2 weeks
- **Estimated duration:** 6 weeks
- **Amount:** 5mil
- **Acceptance Criteria:**
  - An Ethereum↔Canton bridged-asset round-trip (deposit → mint on Canton → burn → withdraw on Ethereum) is demonstrated end-to-end with the reference asset.
  - The end-to-end suite (all ERC-20 operations plus bridge flows) runs green on the local-bootstrap harness (Canton + Anvil + middleware + relayer), reproducible by a reviewer.

### Milestone 5: Non-Custodial MetaMask Snap

Combines the pluggable-signer architecture refresh and the MetaMask Snap.

- **Architecture & Design Refresh**
  - Updated architecture diagrams covering the pluggable signer interface and each of its implementations (custodial, Snap, custody partner, KMS).
  - Snap signing flow: browser → Snap → API server → Canton Interactive Submission. Deterministic Canton-party derivation from the MetaMask seed phrase, including new-device recovery.
  - Institutional custody flow: API server → custody partner API (or KMS) → Canton Interactive Submission. Per-key authorization policies, audit logging, operational runbooks.
  - Threat model for each signing path, including supply-chain considerations for the Snap and key-policy considerations for the institutional path.
  - Custody partner evaluation framework: capability checklist (Ed25519 support, programmatic signing, latency, audit log access, jurisdictional coverage, compliance posture), commercial criteria, and go/no-go decision gate for the in-house KMS fallback.
  - **Custodian-status disclosure:** at the time of grant submission, ChainSafe has not engaged any custody partners. The evaluation framework runs in the first four weeks of the custody workstream. Candidate providers in the evaluation set include Fireblocks, BitGo, Anchorage Digital, and Copper; this is the set ChainSafe will approach during evaluation and is not a list of existing engagements.
- **MetaMask Snap for Canton Signing**
  - MetaMask Snap package providing Ed25519 signing for Canton transactions, with key material derived deterministically from the user's existing MetaMask seed phrase and stored inside MetaMask's isolated origin (so the user's existing seed-phrase recovery flow also recovers the Canton party).
  - Snap integration with the API server: the server returns prepared transaction hashes from PrepareSubmission, the Snap signs them inside MetaMask, the server submits via ExecuteSubmission. No private key ever touches the server; no key file ever touches the user's disk or browser storage.
  - Browser onboarding flow: install Snap, allocate external party from the Snap-derived public key, register with the API server, recover on a new device via the standard MetaMask seed-phrase restore.
  - Snap distribution: published to the MetaMask Snap registry; versioned, signed, user-confirmed updates.
  - Snap test suite covering signing correctness, key derivation determinism, signing-UX prompts, and cross-device recovery.
- **Estimated resources:** Engineering: 11 weeks; Project Management: 2 weeks
- **Estimated duration:** 6 weeks
- **Amount:** 5mil (4mil delivery + 1mil adoption gate)
- **Delivery portion (4mil), on committee acceptance of delivery criteria:**
  - The Snap is published to the MetaMask Snap registry and installable by any user.
  - A non-custodial CIP-56 token transfer, signed inside the Snap with no private key on the server or on disk, is demonstrable end-to-end.
- **Adoption gate (1mil):** at least 100 independent users have each installed the Snap and executed a real non-custodial CIP-56 transfer through the Snap on MainNet (or 50 with at least 2 transfers each), evidenced by on-chain party IDs (or attestation).

### Milestone 6: Institutional Custody, Security Review & Integrator Docs

Combines the institutional custody path, the cross-mode integration testing plus independent third-party security audit, and the integrator documentation.

- **Institutional Custody Integration** — splits into two tracks.

  **Track A (preferred): Custody partner integration**
  - Structured evaluation of the candidate provider set (Fireblocks, BitGo, Anchorage Digital, Copper, plus any further providers identified during scoping) against the Milestone 5 framework, including direct technical conversations and reference checks. If no candidate meets the framework on commercially or technically acceptable terms within the first four weeks of the workstream, the team transitions to Track B without a budget shift or schedule slip.
  - Partnership selection and integration agreement.
  - Implementation of the signer interface against the selected partner's API, including key provisioning, signing, audit log retrieval, and operational tooling.
  - Per-tenant key isolation and policy configuration appropriate to the partner's model.
  - Integration tests against the partner's sandbox; staged rollout against a non-production tenant.

  **Track B (fallback): In-house KMS-backed signer**
  - Implementation of the signer interface against at least one cloud KMS (AWS KMS as primary target), with the abstraction structured so a second provider can be added without rework.
  - Per-user / per-issuer key isolation inside the KMS, with policy-bound key usage and tamper-evident audit logging.
  - Operational tooling for key lifecycle (provision, rotate, deprecate).
  - Integration tests against a live KMS instance; unit tests against mocked KMS clients.
- **Integration Testing, Security Review, and Demo**
  - End-to-end test suites covering: custodial path (regression from the build milestones), Snap signing path, institutional custody path (whichever track was selected), and mixed-mode deployments where different user populations use different signers.
  - Independent third-party security review covering: the Snap (code, key derivation against BIP-44 m/44'/60'/1'/0/0, DER signing flow, dialog prompts, supply-chain posture of `package.json` and lockfile, `snap.manifest.json` permission scope); the institutional signing integration (key handling, audit-log integrity, configuration safety, per-tenant isolation); and the cross-mode regression suite. Findings remediated before milestone acceptance. Full audit report published under `docs/audits/` and linked from the Snap registry listing. Detailed audit cadence and re-audit triggers are described in the "Audit Policy and Cadence" section.
  - Reference demo (extension of `bootstrap-local.sh`) showing a MetaMask user installing the Snap, registering an external party, and transacting a CIP-56 token without the platform ever holding the signing key; plus a separate flow demonstrating signing against the institutional custody path.
- **Documentation and Integrator Guides**
  - **Reference dapp per signer mode:** one minimal end-to-end reference application demonstrating each signer mode (custodial, Snap, institutional custody / KMS). Each app exercises register, sign, submit, and query against a CIP-56 token, intended as the canonical integration example for that signer type.
  - Snap user guide: install, recover, troubleshoot.
  - Snap integration guide for dapp developers: detect, request signing, handle recovery.
  - Institutional custody deployment guide: partner onboarding (Track A) or KMS provisioning (Track B), key isolation policies, audit configuration.
  - Updated API reference covering signer selection and multi-mode routing.
  - Threat-model summary documents per signing path, suitable for sharing with risk-conscious integrators.
- **Estimated resources:** Engineering: 11 weeks; Project Management: 2.5 weeks
- **Estimated duration:** 6 weeks
- **Amount:** 5mil (4mil delivery + 1mil adoption gate)
- **Delivery portion (4mil) on committee acceptance of the existing delivery criteria:**
  - The institutional signer (Track A partner integration or Track B KMS) signs and submits a CIP-56 transaction end-to-end through the shared signer interface, with at least one issuer/tenant provisioned on the institutional path.
  - An independent third-party security audit covering the Snap and the institutional integration is published under `docs/audits/`, with all critical and high findings remediated before acceptance.
- **Adoption gate (1mil):** at least **1 named** operator or issuer, live on the institutional custody path on MainNet, evidenced by on-chain party ID or attestation (public or Foundation-confidential).

### Milestone 7: CIP-0112 (Token Standard V2) Migration

- **Scope:** Ship CIP-0112 (Token Standard V2) dual-interface support alongside V1 — V1/V2 packages in parallel via Daml module-prefixes, a V2-aware indexer decoder, a V2 command builder in the middleware orchestrator selected per token at runtime, and bridge updates for V2 non-holder Account mint/burn. Full approach, reuse estimates, and the ratification-timing contingency are detailed in the "CIP-112 Migration Plan" section.
- **Estimated resources:** Engineering 4–6 weeks (core dual-interface effort, per the CIP-112 Migration Plan).
- **Amount:** 4mil (3mil delivery + 1mil traction gate)
- **Delivery portion (3mil) on committee acceptance of the existing delivery criteria:**
  - Existing V1 issuers continue operating unchanged (V1 regression suite green).
  - A V2 token transfer is demonstrable once CIP-0112 is ratified; pending ratification, acceptance is against the dual-interface implementation validated on the `token-standard-v2-upcoming` reference (per the CIP-112 Migration Plan contingency).
- **Traction gate (1mil):** at least 1 issuer/token committed to or using the V2 path (or continued production use by at least 2 independent issuers), evidenced on-chain or by attestation.

## Maintenance + Adoption Tranches (Milestones 8–15)

The two-year maintenance term funds bug and security fixes and ecosystem adoption, per CIP-0100's expectation that grants be weighted toward adoption. It is delivered as **eight quarterly milestones (M8–M15), 1mil each (4mil per year)**. Each quarterly payment releases only when the committee accepts **both** the upkeep bar **and** the adoption tranche for that quarter, plus a continuation vote.

**(A) Delivery of upkeep bar, acceptance criteria:**

- CVE triage and patching within severity-based SLAs evidenced by the public issue/release log.
- Compatibility maintained with every Canton MainNet or protocol release that quarter, evidenced by release tags.
- Dependency and toolchain currency; CIP-56 / CIP-112 standards tracking with timely compatibility updates.
- Correctness bug-fixes affecting token operations, bridge flows, or signing paths.
- Public Docker images, the MetaMask Snap registry listing, and documentation kept current; security-disclosure process operating.

**(B) Adoption tranche, each quarter:**

- Either at least 1 independent issuer added and sustained in production through the middleware every two quarters and an additional 30 independent users have each executed a real custodial or non-custodial CIP-56 transfer through the middleware service or Snap on MainNet, evidenced by on-chain party IDs (or attestation). **OR** if no independent issuer added, then 100 independent users each quarter.
- A submitted quarterly adoption report (issuers live, external integrations, transfer/bridge volume, Snap active users).

### Milestones 8–15: Quarterly Maintenance + Adoption Tranche

| Milestone | Token Amount (CC) |
|---|---|
| M8 — Year 1, Q1 | 1mil |
| M9 — Year 1, Q2 | 1mil |
| M10 — Year 1, Q3 | 1mil |
| M11 — Year 1, Q4 | 1mil |
| M12 — Year 2, Q1 | 1mil |
| M13 — Year 2, Q2 | 1mil |
| M14 — Year 2, Q3 | 1mil |
| M15 — Year 2, Q4 | 1mil |
| **Total** | **8mil** |

---

## CIP-112 Migration Plan

CIP-0112 ("Canton Network Token Standard V2") is a backwards-compatible evolution of CIP-0056 introducing a new EventLog interface for transaction parsing, committed allocations and iterated settlement, non-holder Account destinations for clean mint/burn semantics, privacy-preserving batch settlement, and a pause-status metadata flag. V2 ships as new major-version `splice-api-token-*` packages alongside V1, so V1 implementations continue to operate untouched.

The middleware's Milestones 1–4 architecture is structured to make V2 dual-interface delivery a focused refactor rather than a rewrite. Concrete reuse estimates per layer:

| Layer | V1 → V2 reuse | Coupling | Notes |
|---|---|---|---|
| Daml `cip56-token` packages | ~40% | Tight | Field names and interface instantiations are V1-bound; contract logic patterns survive. |
| Indexer (`pkg/indexer/engine/`) | ~70% | Medium-loose | Decoder pattern is structural; event field renames are the main lift. |
| Middleware orchestration (`pkg/ethrpc/`, `pkg/transfer/`) | ~60% | Medium | Module/entity/choice names are V1-specific; the prepare/execute flow is V-agnostic. |
| Bridge contracts (`bridge-core`) | ~30% | Tight | Mint/burn calls are V1-coupled; flow patterns survive. |

**Migration approach:** V1 and V2 packages run in parallel via Daml module-prefixes (consistent with the design guidance in `contracts/canton-erc20/docs/middleware-bridge-architecture.md`). The indexer gains a V2-aware decoder reusing the existing decoder pattern with V2 field names. The middleware orchestrator gains a V2 command builder alongside the V1 builder, selected per token at runtime based on the token's advertised compatibility (per CIP-0112 §5.2).

**Effort window** for core dual-interface delivery: 4–6 weeks of engineering with the parallel-packages approach; 10–12 weeks for a clean-room rewrite (not recommended).

**Contingency clause:**

- If CIP-0112 is ratified during M5–M6, ChainSafe pulls V2 dual-interface delivery forward into the back half of M5–M6 in coordination with Foundation timing, funded out of the existing M5–M6 budget envelope.
- If ratification slips past the end of M5–M6, the V2 dual-interface upgrade is delivered as Milestone 7 in the quarter following ratification, with the same 4–6 week core effort.

**V2 features that align directly with the middleware's existing architecture and the ecosystem direction:**

- The V2 `EventLog_HoldingsChange` interface gives the indexer a cleaner, filterable event stream and simplifies the EVM-shaped log emission for `eth_getLogs`.
- Committed allocations and iterated settlement standardize a primitive that maps directly onto x402 facilitator and pre-funded payment flows.
- Non-holder Account destinations let bridge mint/burn use the standard transfer/allocation flows instead of a custom state machine.

---

## Audit Policy and Cadence

The middleware delivers several security-critical components: an API server brokering signing and Canton submission, a relayer holding and moving bridge funds, an indexer that serves as the source of truth for balance queries, on-chain DAML contracts that custody value directly, and as of Milestones 5–6 a MetaMask Snap loaded into the user's wallet. ChainSafe commits to a comprehensive audit posture across the entire stack, including the snap.

### Pre-release audit for the MetaMask Snap

Before any release of the `canton-snap` package to the MetaMask Snap registry, an independent third-party security audit will cover:

- Key derivation correctness against BIP-44 `m/44'/60'/1'/0/0` and the documented derivation rationale.
- Signing flow correctness: DER encoding correctness, absence of key or signature leakage to the host page, correct handling of the prepared transaction hash.
- Dialog-prompt UX: no signing operation executes without explicit user confirmation; prompts present accurate and unambiguous transaction information.
- Supply-chain posture: `package.json` and lockfile review, pinned cryptographic dependency versions, build reproducibility.
- `snap.manifest.json` permission scope: minimum-required permissions declared (`snap_getEntropy`, `snap_dialog`, `snap_manageState`) with justification.

### Full Middleware stack audit

In parallel with the Snap audit, an independent third-party security audit of the full middleware stack will cover:

- **API server** (`pkg/ethrpc/`, `cmd/api-server/`): the JSON-RPC method surface, the Interactive Submission orchestration (PrepareSubmission, signing, ExecuteSubmission), session and authentication handling, the EIP-191 registration flow, custodial key handling, and the AES-256-GCM at-rest key storage path.
- **Relayer** (`pkg/relayer/`, `cmd/relayer/`): the bidirectional Source/Destination engine, bridge state machine, nonce tracking, chain reorg handling, and on-chain event consumption logic.
- **Indexer** (`pkg/indexer/`, `cmd/indexer/`): event ingestion correctness, deterministic balance and holdings aggregation, visibility-scoped query semantics, and database integrity.
- **Daml contracts** (`cip56-token`, `bridge-core`), reviewed by a Daml-fluent auditor (Digital Asset, Sygnum, or equivalent specialist): the token authorization model, TransferFactory semantics, Compliance hooks, and bridge mint and burn governance.
- **Cross-component integration**: the boundary between the API server and the Canton ledger, between the relayer and both chains, and between the indexer and the API server, validated as a single attack surface rather than per-component in isolation.

Findings from any of the above audits are remediated before the corresponding deliverable is accepted, and full audit reports are published.

### Published artifacts

All audit reports are published under `docs/audits/` in the relevant repository, with the report version and audit date linked from the package README and the Snap registry listing. Reproducible-build instructions are published alongside each release.

---

## Adoption Statement

The Applicant is committed to fostering the long-term growth and adoption of their CIP-56/ERC-20 Middleware within the Canton ecosystem. The Applicant has already engaged in discussions with major Ethereum based defi projects who are excited to launch tokens on Canton and become long-term players on the network. The Applicant will earn integration fees and potentially ongoing transaction fees for any third party who they can onboard to Canton via their middleware. The Applicant is thus directly incentivized to bring new liquidity and ongoing transaction volume to Canton and will allocate resources dedicated to achieving these goals throughout the maintenance phase and beyond.

Reflecting the committee's guidance, adoption is **funded and gated** rather than aspirational: the Snap milestone (M5) and the institutional milestone (M6) each hold part of their payment against an adoption gate, the CIP-0112 migration (M7) carries a traction gate, and the entire two-year maintenance term (M8–M15) is released quarter by quarter only against verified ecosystem adoption. In total about 30% of the grant is adoption-contingent. The gates are set at conservative, honestly attestable floors (on-chain party IDs, third-party attestation, or public repository evidence; a confidential-to-Foundation path for private/TradFi adopters), so every adoption payment reflects genuine, independently verifiable value. The Applicant's path to that adoption:

- **Reference deployments per signer mode** — stand up publicly accessible reference dapps for the custodial, Snap, and institutional signing modes, so issuers and integrators can evaluate the middleware against a live endpoint.
- **Issuer onboarding** — work with CIP-56 issuers (stablecoins, tokenized RWAs, Canton-native assets) to route real token activity through the middleware on mainnet, including bridged stablecoins such as USDCx as additional issuances onboard.
- **Wallet / dapp integration** — enable external wallets and EVM-native dapps to reach Canton tokens through the JSON-RPC surface and the Splice Registry, beyond ChainSafe's own reference dapps.
- **Snap distribution** — drive installs of the MetaMask Snap from the registry as the non-custodial on-ramp for retail users. ChainSafe has a long standing partnership with MetaMask that will help facilitate this.
- **Reporting** — track and publish adoption signals (issuers live, integrations shipped, bridged-asset activity, Snap installs) as evidence of ecosystem value.

---

## Timing and Financials

The grant is a build phase (M1–M6), a CIP-0112 migration milestone (M7), and a two-year quarterly maintenance term (M8–M15) covering bug and security fixes and ecosystem adoption. M1–M4 are paid on committee acceptance; M5, M6 and M7 pay a delivery portion on acceptance and hold a portion to an adoption or traction gate; maintenance milestones (M8–M15) require the committee to accept that quarter's adoption tranche.

| Milestone | Trigger | Token Amount (CC) |
|---|---|---|
| M1: Architecture & Daml / Bridge Contracts | Committee acceptance | 3mil |
| M2: Middleware Service | Committee acceptance | 5mil |
| M3: Indexer Backend Service | Committee acceptance | 5mil |
| M4: Bridge, Relayer, Integration & Docs | Committee acceptance | 5mil |
| M5: Non-Custodial MetaMask Snap | 4mil delivery + 1mil adoption | 5mil |
| M6: Institutional Custody, Security Review & Docs | 4mil delivery + 1mil adoption | 5mil |
| M7: CIP-0112 (V2) Migration | 3mil delivery + 1mil traction | 4mil |
| M8: Yr1 Q1 Maintenance + adoption tranche | Upkeep bar + adoption tranche | 1mil |
| M9: Yr1 Q2 Maintenance + adoption tranche | Upkeep bar + adoption tranche | 1mil |
| M10: Yr1 Q3 Maintenance + adoption tranche | Upkeep bar + adoption tranche | 1mil |
| M11: Yr1 Q4 Maintenance + adoption tranche | Upkeep bar + adoption tranche | 1mil |
| M12: Yr2 Q1 Maintenance + adoption tranche | Upkeep bar + adoption tranche | 1mil |
| M13: Yr2 Q2 Maintenance + adoption tranche | Upkeep bar + adoption tranche | 1mil |
| M14: Yr2 Q3 Maintenance + adoption tranche | Upkeep bar + adoption tranche | 1mil |
| M15: Yr2 Q4 Maintenance + adoption tranche | Upkeep bar + adoption tranche | 1mil |
| **Total** | | **40mil** |

### Long-Term Sustainment (Post-Year 2)

Beyond the end of Maintenance Year 2, ChainSafe commits to ongoing best-effort upkeep of the middleware as open infrastructure. This includes:

- Security patches in response to disclosed CVEs in the dependency tree or in the middleware itself, on a triage cadence aligned with severity.
- Critical bug fixes affecting correctness of token operations, bridge flows, or signing paths.
- Tracking of Canton Improvement Proposals affecting CIP-56 / CIP-112 token semantics, with timely compatibility updates as the standards evolve.

This baseline commitment is funded by the Applicant's out of pocket and continues indefinitely. The GitHub repositories remain public and Apache 2.0-licensed indefinitely; Docker images and published artifacts (including the MetaMask Snap on the registry) remain available; documentation remains accessible. ChainSafe will not lock out downstream operators, relicense to a closed model, or remove published artifacts.

Beyond the baseline, two options remain open for the Foundation and ecosystem to consider closer to the end of Year 2:

- **Foundation-funded maintainer rotation**, under which the repository becomes Foundation-stewarded with a rotating maintainer schedule across ecosystem contributors.
- **A ChainSafe paid-SLA tier** funded by issuers or operators who require guaranteed response times for production deployments.

The Applicant is happy to discuss either path with the Foundation or ecosystem operators when the time comes; neither is a precondition for the baseline sustainment commitment above.
