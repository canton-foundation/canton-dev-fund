# Canton Verifiable Credentials: Open-Source SDK and CIP Draft

**Status:** Draft
**Author:** [Abdullah Faruk Özden](https://github.com/Farukest)
**Label:** regulatory-compliance
**[Champion](https://github.com/canton-foundation/canton-dev-fund/blob/main/sig-directory.md):** Canton Foundation
**Repository:** https://github.com/Farukest/canton-vc (Apache 2.0)
**License:** Apache 2.0 across all packages

## Abstract

`canton-vc` is an open-source reference implementation for issuing, holding, and verifying KYC and identity verifiable credentials on the Canton Network. The repository ships seven TypeScript packages, a DAML template set under the neutral `Canton.VC.Credential` namespace, three production KYC vendor adapters (Didit, Sumsub, and Persona) covering the three most common wire shapes, and the first draft of a Canton Verifiable Credentials Standard CIP.

Total ask is 1,500,000 CC over a maximum of 4 months across four milestones. Milestone 1 (~27%) is paid on approval for already-delivered work; the remaining ~73% is gated on milestone acceptance, with Milestone 4 priced per achieved adoption sub-KPI.

The codebase open-sourced here has been running in production at [Crivacy.io](https://crivacy.io) for approximately six months, where it powers KYC credential issuance and verification across Didit, Sumsub, and Persona on Canton 3.4.

## Motivation

The Canton ecosystem currently has no canonical pattern for KYC and verifiable credentials. Each firm that needs identity primitives on Canton today must (a) build the KYC-vendor integration layer from scratch, (b) negotiate per-firm KYC partner contracts (Onfido, Sumsub, Persona), and (c) design an ad-hoc wire format and verification protocol with no interoperability guarantee.

canton-vc provides the standardized primitives — a vendor-neutral SDK, DAML reference templates, and a CIP draft for the wire format — so that three classes of Canton participants can build on shared infrastructure instead of inventing it independently.

**Identity-provider-style firms** (Crivacy.io is the first such deployment, but the same primitives are open to any new entrant) can build issuer infrastructure with a vendor-neutral KYC adapter layer, on-chain audit replay via content-addressed proof schemas, and a standardized OAuth/OIDC wire format — without rewriting the credential layer per KYC vendor and without inventing a bespoke claim schema.

**dApp / DeFi / NFT / lending verifiers** can accept credentials from any conforming identity provider with a single `verifyDisclosure()` call. No per-issuer integration code, no KYC partner contract on the verifier's side, and no in-house KYC infrastructure to operate. Trust is anchored cryptographically against the Canton sequencer's signature, not against the issuer's word — a tampered or fabricated disclosure blob is rejected by the verifier's own Canton participant before the verification choice body runs.

**Regulated finance institutions** running their own KYC pipelines on Canton benefit from on-chain audit replay (content-addressed proof schemas let an auditor recompute the on-chain hash from retained raw bytes years after the mint), multi-vendor adapter flexibility (a KYC-vendor swap is a label change on the on-chain `ValidatorType` enum, not a re-implementation), and an open-source surface so internal security teams can audit the full stack instead of trusting a closed vendor.

The reusable "verify once, use everywhere" property that some identity providers market to their end users is delivered by the ecosystem of issuers + verifiers adopting the standard — canton-vc is the infrastructure layer that makes that ecosystem possible without forcing every participant to ship the same primitives independently. The code in this repository has been exercised against a working Canton mainnet deployment before being extracted into the open-source workspace; every wire field, every DAML choice, every retry path, and every `DisclosedContract` blob shape has been touched by real ledger state, not just synthetic test runs.

## Specification

### 1. Objective

Deliver an Apache 2.0 reference SDK and DAML template set that lets any Canton-deployed firm (a) issue KYC verifiable credentials from any of the three most common KYC vendors today, (b) hold those credentials as on-chain `Canton.VC.Credential` contracts with optional soulbound `KycNFT` companions, and (c) verify a holder's credential via Canton's `DisclosedContract` mechanism without becoming a contract stakeholder. Land a Canton Verifiable Credentials Standard CIP that defines the wire format so independent implementations can interoperate.

### 2. Implementation Mechanics

The repository at https://github.com/Farukest/canton-vc contains the following packages, all Apache 2.0, all green on tsc and vitest at the day of submission.

`@canton-vc/core`: Canton JSON Ledger v2 client. Config plus Zod schemas for every endpoint, command builders for `CreateKycCredential`, `Verify`, `RevokeCredential`, and `CreateKycNft`, a retry-aware fetch layer, party id parsing, and an error taxonomy. 368 unit tests green.

`@canton-vc/credential`: OAuth 2.0 + OIDC client plus the `verifyDisclosure()` helper. A firm holding the `canton_vc_credential_blob` and `canton_vc_contract_id` claims from an issuer's userinfo endpoint verifies the credential on its own Canton participant in a single call. The participant runs the choice body with chain time, so `isActive` is server-evaluated. 55 unit tests green.

`@canton-vc/kyc-provider`: Vendor-agnostic `KycProvider` interface that decouples the issuer pipeline from any specific KYC vendor.

`@canton-vc/adapter-didit`: Production adapter wrapping Didit (v3 sessions API, HMAC-SHA256 webhook signatures over canonical JSON). 36 unit tests green. Live in the reference deployment.

`@canton-vc/adapter-sumsub`: Production adapter wrapping Sumsub (applicants API, per-request HMAC over `ts + method + path + body`, multi-algorithm webhook digest). 44 unit tests green plus a Canton 3.4 end-to-end live script (`scripts/live-sumsub-canton-e2e.ts`) driving the adapter against real Sumsub API endpoints into a real participant.

`@canton-vc/adapter-persona`: Production adapter wrapping Persona (JSON:API inquiry endpoints, Bearer auth with pinned `Persona-Version`, signed-timestamp `Persona-Signature` webhook scheme with multi-secret key rotation, hosted one-time-link inquiry flow). 52 unit tests green plus Canton 3.4 end-to-end live scripts (`scripts/live-persona-canton-manual-e2e.ts`, `scripts/live-persona-canton-mint-existing.ts`) driving the adapter through a real Persona identity inquiry into a real participant. The three adapters together cover the three most common KYC-vendor authentication patterns; community contributors for Onfido, Veriff, Au10tix, or Jumio inherit an interface validated against three structurally different vendors.

`@canton-vc/adapter-mock`: Deterministic adapter for tests and local development, no network calls. 15 unit tests green.

`daml/canton-vc-credential`: DAML templates under the neutral `Canton.VC.Credential` namespace. `Verify` is a nonconsuming choice returning a `CredentialView` struct, `Revoke` is consuming and cascade-archives the bound `KycNFT`. The DAR is pre-built and shipped with the repository at `daml/canton-vc-credential/release/canton-vc-credential-1.1.0.dar` for direct upload to any Canton participant.

`docs/cip-draft-canton-vc-standard.md`: First draft of the Canton Verifiable Credentials Standard CIP. Covers DAML template signatures, OAuth scope strings, claim names, and the disclosed-blob carriage format.

**Vendor-agnostic call site.** The `KycProvider` interface is the load-bearing abstraction. Switching the issuer's KYC vendor is a one-constructor-line change; the rest of the pipeline (decision normalisation, on-chain mint, disclosure verification) is untouched:

```typescript
// Same call site across all three vendors.
const provider: KycProvider =
  vendor === 'didit'
    ? new DiditAdapter({ apiKey, kycWorkflowId, addressWorkflowId, webhookSecret })
  : vendor === 'sumsub'
    ? new SumsubAdapter({ appToken, secretKey, identityLevelName, addressLevelName, webhookSecret })
    : new PersonaAdapter({ apiKey, identityTemplateId, addressTemplateId, webhookSecret });

const session = await provider.startSession({ userRef, workflow: 'identity' });
// → user completes the vendor-hosted flow at session.redirectUrl

const decision = await provider.fetchDecision(session.sessionId);
// → KycDecision with normalised shape:
//   evidence.{identityVerified, livenessVerified, addressVerified}
//   proofHash + proofSchemaId (vendor-derived SHA-256 over canonical JSON of a named-field payload)
//   level ('basic' | 'enhanced') + status + declineReason

await canton.createCredential({
  userParty,
  userRef:    decision.userRef,
  proofHash:  decision.proofHash,
  status:     'active',
  level:      decision.level ?? 'basic',
  validUntil: decision.expiresAt,
  validator:  vendor,                // 'didit' | 'sumsub' | 'onfido' | …
  ...decision.evidence,
  humanScore: 95,
});
```

Multi-step KYC (identity + proof-of-address) composes from two `startSession` calls with different `workflow` values. Workflow-level enums (`'identity' | 'address'`) hide the vendor-specific identifiers (Didit `workflow_id` UUIDs vs Sumsub `levelName` strings) behind the same call shape.

**End-to-end verification.** All three adapters are verified end-to-end against the real vendor APIs AND a real Canton 3.4 participant. The repository ships five live scripts:

- `scripts/live-didit-canton-manual-e2e.ts` — fresh DiditAdapter session → human-in-the-loop document + selfie submission at the printed Didit URL → poll-to-terminal approval → mint → `verifyDisclosure()` via `DisclosedContract` → `view.validator === 'DiditValidator'` round-trip.
- `scripts/live-persona-canton-manual-e2e.ts` — fresh PersonaAdapter inquiry → human-in-the-loop identity flow at the printed Persona one-time link → poll-to-terminal approval → mint → DisclosedContract verify → `KycNFT` companion mint → `Revoke` cascade-archive.
- `scripts/live-persona-canton-mint-existing.ts` — fetchDecision against an existing approved Persona inquiry → mint with current DAR → DisclosedContract verify.
- `scripts/live-sumsub-canton-e2e.ts` — Sumsub applicant created via the real API + driven to approval through Sumsub's officially supported `testCompleted` development endpoint → SumsubAdapter → mint → DisclosedContract verify → `view.validator === 'SumsubValidator'` round-trip.
- `scripts/live-canton-e2e.ts` — synthetic credential payload mint + `KycNFT` companion mint + `Revoke` cascade-archive on chain (exercises the on-chain leg in isolation from any KYC vendor).

Each script reads real values from real APIs (no mocks, no reference-deployment code path), so the proofHash that ends up in the on-chain payload is the same digest the vendor data produced, and the participant re-authenticates the disclosure blob against the sequencer signature before any verifier reads from it.

**Audit-replay pipeline.** The on-chain `proofHash` is a SHA-256 over a deterministic canonical JSON of a named-field identity payload. The set of fields and their order are pinned by a content-addressed `ProofSchemaSpec`; the spec's own hash is written to the credential as `proofSchemaId` at mint time. Two contracts cannot share a hash unless they share a schema, and the schema itself is published verbatim in `docs/proof-schemas/<id>.json`.

A regulator (or the issuer's own auditor) loads the firm's retained raw bytes, applies `@canton-vc/core#canonicalJson` (`sortKeys + shortenFloats + JSON.stringify`) over the fields the schema names in the order it names them, takes the SHA-256, and compares against the on-chain `proofHash`. A mismatch means either the retained bytes drifted (firm-side issue) or the wrong schema id was used (caller error); the test never silently passes on the wrong inputs.

The hash input contains PII (`firstName`, `lastName`, `dateOfBirth`, `documentNumber`, …) but only as input to a one-way function — the on-chain output is a 64-character hex digest from which no PII is recoverable. Vendor-side opaque ids (`sessionId` / `applicantId` / `inquiryId`) in the input act as salts that defeat brute-force / rainbow-table attacks against the low-entropy identity fields alone.

**Operator design constraints.** The SDK exposes verification primitives; orchestration is left to the operator. The following constraints document where the line falls so committee review can audit the surface without reading source.

1. **The companion KycNFT is optional.** A credential is fully functional on its own — `Verify` returns the complete `CredentialView` whether or not a soulbound `KycNFT` exists. The SDK exposes `createKycNft` as a separate call the issuer opts into; the DAML template's `ensure` clause permits NFT mints only on `level == "Enhanced"`, so Basic-tier credentials are NFT-ineligible at the chain boundary.
2. **Vendor swap is a label change.** The on-chain `validator` field is the `Canton.VC.Credential.ValidatorType` enum (Didit / Onfido / Persona / Sumsub / Veriff / Au10tix / Jumio / Zk / Generic). Existing credentials minted under one vendor remain valid through `Verify` indefinitely after the issuer switches vendors. Three migration patterns are supported: replace, stack, and soft-rotate. The SDK enforces none of these; the issuer's policy choice.
3. **No PII reaches the chain.** Every on-chain field is non-PII by construction: `userRef` is an opaque firm-side identifier, `proofHash` is a one-way SHA-256 digest, `proofSchemaId` is the content-addressed hash of the schema spec, and the remaining fields are enums, booleans, integers, or a network label. PII enters the hash input only and is non-recoverable from the on-chain digest.
4. **Audit replay is deterministic across runtimes.** The canonical pipeline (`shortenFloats` + `sortKeys` + `JSON.stringify`) is fully specified in `@canton-vc/core#canonicalJson`. An auditor in any language that produces identical bytes from `(spec.fieldsInOrder, retained raw values)` will derive the same `proofHash` the issuer wrote to chain. The schema is content-addressed and published at `docs/proof-schemas/<id>.json` — a regulator who only knows the `proofSchemaId` can fetch the full spec from the public registry and execute the audit without further coordination with the issuer.
5. **Adding a new vendor is a community PR.** A new adapter is an npm package implementing `KycProvider` (three methods: `startSession`, `fetchDecision`, `verifyWebhook`). Until the DAML enum is extended in a future DAR upgrade, new vendors mint under the existing `Generic` constructor. Milestone 4 of this grant pays per-unit for accepted community adapter PRs.
6. **Workflow selection is enum-typed.** `startSession({ workflow: 'identity' | 'address' })` selects between the issuer's identity-only and proof-of-address workflows. Multi-step KYC composes by the issuer chaining the two and combining the resulting evidence flags + proof hashes at mint time.
7. **Re-mint and revocation are explicit operations.** Repeat KYC reuses the same `createCredential` and optional `revokeCredential` primitives. The DAML `Revoke` choice cascades to a bound NFT in the same transaction when the issuer passes `nftContractId`. There is no implicit "soft re-mint" — the issuer's worker explicitly decides whether to revoke first, stack a new credential alongside, or let the prior one expire on schedule.
8. **`userRef` is verifier-correlatable by construction.** Issuers SHOULD use credential-scoped random pseudonyms rather than stable customer-DB identifiers. Issuing the same `userRef` to multiple verifiers exposes holders to cross-verifier correlation when verifiers collude or hold side-channel data on the holder. The standard does not enforce a particular pseudonym scheme — issuer policy choice — and the verifier-side helper `userRefLooksLikePseudonym()` in `@canton-vc/credential` provides an opt-in heuristic check for verifiers that want to flag stable identifiers.

**Firm integration flow.** Two roles touch `canton-vc` at six concrete call sites, none requiring custom wire code or chain-side patches:

*Issuer side* (mints credentials):

1. **Start session** — `provider.startSession({ userRef, workflow: 'identity' | 'address' })` returns a vendor-hosted `redirectUrl` the issuer presents to the user.
2. **Receive decision** — either webhook-driven (`provider.verifyWebhookSignature(rawBody, headers)` then body parse) or pull-driven (`provider.fetchDecision(sessionId)`). Both yield the same vendor-agnostic `KycDecision` (status, level, evidence flags, proofHash, proofSchemaId, expiresAt).
3. **Mint on chain** — `canton.createCredential({ userParty, userRef, proofHash, proofSchemaId, status, level, validUntil, humanScore, validator, identityVerified, livenessVerified, addressVerified })` creates a `Canton.VC.Credential` contract with the issuer as `signatory` and the user as `observer`. Optional `canton.createKycNft(...)` mints the Enhanced-tier soulbound companion.
4. **Expose via OAuth** — the issuer's existing OAuth/OIDC userinfo endpoint emits `canton_vc_credential_blob` (the contract's `createdEventBlob`) and `canton_vc_contract_id` when the `canton-vc` scope is granted, alongside the existing `kyc:*` claims.

*Verifier side* (consumes credentials, never becomes a stakeholder):

5. **Receive claims** — verifier completes the OAuth flow against the issuer and reads the `canton_vc_*` claims from the userinfo response.
6. **Verify on own participant** — `verifyDisclosure(claims, { canton, fetcher })` from `@canton-vc/credential` attaches the blob as a `DisclosedContract`, exercises the `Verify` nonconsuming choice on the verifier's own Canton participant, and returns the full `CredentialView`. The participant re-authenticates the blob against the sequencer signature before the choice body runs; a tampered or fabricated blob is rejected with `DISCLOSED_CONTRACT_AUTHENTICATION_FAILED`. `isActive` is server-evaluated against chain time — the verifier trusts the sequencer, not the issuer.

The same six call sites are exercised end-to-end by the live scripts above (`scripts/live-{didit,sumsub,persona}-canton-*.ts`) and by `examples/issuer-demo` + `examples/verifier-demo` against the mock vendor + a mock `CantonClient`. No reference-deployment branches, no Crivacy-specific code paths.

### 3. Architectural Alignment

Canton's stakeholder model gives selective disclosure by default: a contract is visible only to its stakeholders. The `DisclosedContract` mechanism then lets the issuer hand a self-authenticating blob to a third party that is not a stakeholder; that party's participant re-derives the contract id from the blob, checks the sequencer signature, and runs a nonconsuming choice on the contract. A tampered or fabricated blob is rejected with `DISCLOSED_CONTRACT_AUTHENTICATION_FAILED` before the choice body executes, so the verifying firm trusts the network's cryptographic primitives rather than the issuer.

`canton-vc` uses this pattern directly. The credential lives on chain as a `Canton.VC.Credential` contract whose stakeholders are `operator` (the issuer) and `user` (the user's Canton party). The `Verify` choice returns a `CredentialView` struct computed server-side from contract fields and the current ledger time. The OAuth/OIDC userinfo response is a delivery vehicle for the blob plus the contract id; it is not the source of truth.

This positions `canton-vc` as a foundational piece of the Canton Network identity stack: vertical KYC issuers (insurance, capital markets, lending) compose against the same DAML template and the same TypeScript verifier surface, with the CIP defining the wire-format guarantees that hold across implementations.

### 4. Backward Compatibility

DAML smart-contract upgrade rules apply. The template `Canton.VC.Credential` is at v1.1.0; v1.0.0 contracts (deployed during the M0 extraction window) remain queryable and verifiable against their original package id. The v1.1.0 addition (`proofSchemaId : Optional Text`) is appended at the end of the template + view payload per the DAML LF data-constructor append rule; v1.0.0 contracts continue to satisfy the v1.1.0 view shape because the new field is `Optional`. Both DARs coexist on the participant.

The on-chain `ValidatorType` enum (Didit / Onfido / Persona / Sumsub / Veriff / Au10tix / Jumio / Zk / Generic) is similarly extensible: new vendor labels can be added in a future DAR via the LF data-constructor append rule, while community adapters in the interim mint under the existing `Generic` constructor. No existing on-chain contract is invalidated by a vendor expansion.

The OAuth claim names (`canton_vc_credential_blob`, `canton_vc_contract_id`, `canton_vc_user_party`, …) and the scope name (`canton-vc`) are namespaced under `canton_vc_*` to prevent collision with other Canton extensions and unrelated OAuth deployments. The CIP draft locks these names so independent implementations interoperate at the wire level.

## Milestones and Deliverables

### Milestone 1: Open-source release — already-delivered acceptance

**Hard deadline:** Funding released on grant approval against the present-state artefacts (already in the repository at submission).
**Funding:** 400,000 CC (~27%)
**Engineering basis:** Approximately six months of production engineering at [Crivacy.io](https://crivacy.io) running the Canton credential pattern (estimated ~900 person-hours of already-delivered engineering across the SDK, DAR, and integration surface), plus several focused weeks of extraction, hardening, and standardisation work to turn that internal codebase into a vendor-neutral, audit-replay-ready open-source SDK + DAR + CIP draft.
**Person-hours:** ~900 already-delivered + ~10 of remaining release-polish work (npm publish, repository plumbing, tagged release commit).

Deliverables, all currently in the repository at submission time:

- Apache 2.0 release of seven npm packages: `@canton-vc/core` (incl. content-addressed proof-schema infrastructure), `@canton-vc/credential`, `@canton-vc/kyc-provider`, `@canton-vc/adapter-didit`, `@canton-vc/adapter-sumsub`, `@canton-vc/adapter-persona`, `@canton-vc/adapter-mock`.
- Public proof-schema registry at `docs/proof-schemas/<id>.json` for each adapter (content-addressed; on-chain `proofSchemaId` resolves to the published spec).
- Public GitHub repository with LICENSE, CONTRIBUTING, CODE_OF_CONDUCT, GOVERNANCE, CHANGELOG, and SECURITY policies.
- CIP draft v0.1 published at `docs/cip-draft-canton-vc-standard.md` for community comment, with formal submission to `canton-foundation/cips` opened in parallel.
- DAML DAR pre-built and committed at `daml/canton-vc-credential/release/canton-vc-credential-1.1.0.dar` (Canton 3.4 compatible). Package id: `02806dc9e912f57a61ad83a0f8b300452baf4f734cd259d56458c9b1023d4421`.
- Two runnable reference apps under `examples/`: `examples/issuer-demo/` (Node CLI exercising `startSession` → `fetchDecision` → `createCredential`) and `examples/verifier-demo/` (Vite + React SPA exercising `verifyDisclosure()` end-to-end plus a `KycNFT` cascade-revoke panel). Both run in 30 seconds against a mock vendor + in-memory Canton mock with zero credentials; both also support a real KYC vendor sandbox mode (Didit / Sumsub / Persona) via `.env` — the CLI uses the adapters directly, the SPA proxies through a co-located Node-side `vendor-server.ts` so HMAC secrets and API keys stay out of the browser bundle. Smoke-verified end-to-end against the live Didit + Persona sandbox APIs during pre-submission testing.
- CI matrix covering typecheck, lint, and vitest across Node 20 and 22 on Linux, macOS, and Windows.

**Acceptance criteria:** Packages installable from npm under `@canton-vc/*`. CI green at the tagged release commit. CIP draft accessible from the repository README and submitted as a PR to `canton-foundation/cips`. Plus a first Foundation-side acknowledgment within the milestone window — either a CIP PR review comment from the Tech & Ops Committee or a champion ack in the Regulatory Compliance / Identity & Metadata SIG channel.

**Production reference (on-chain verifiable):** [Crivacy.io](https://crivacy.io) has been running the canton-vc credential pattern in production on Canton mainnet since November 2025. The credential-issuing DAML operator is party [`CrivacyOperator::1220a37e50a4f650bcd0554c2fca064b59c3444eebd0383dbaaa65a2cc137bedc524`](https://ccview.io/party/CrivacyOperator::1220a37e50a4f650bcd0554c2fca064b59c3444eebd0383dbaaa65a2cc137bedc524/), running on the validator [`crivacy-validator-1::1220a37e50a4f650bcd0554c2fca064b59c3444eebd0383dbaaa65a2cc137bedc524`](https://ccview.io/validators/crivacy-validator-1::1220a37e50a4f650bcd0554c2fca064b59c3444eebd0383dbaaa65a2cc137bedc524/) (same participant, two parties). The mainnet DAR currently in production is `Crivacy.KYCCredential` v0.0.2 (package id `b547586bbac9c9371b8aa4d085f163f423539470b8c0639161529467c6f000b8`, deployed 2026-04-21) — the structural predecessor of the open-sourced `Canton.VC.Credential` template; existing on-chain contracts remain verifiable against their original package id while new mints use the vendor-neutral v1.1.0 module documented in the [DAML compatibility note](https://github.com/Farukest/canton-vc/blob/main/daml/canton-vc-credential/daml/Canton/VC/Credential.daml).

### Milestone 2: External security audit

**Hard deadline:** 1 month from grant approval.
**Funding:** 300,000 CC (20%). Target audit vendor: [Cure53](https://cure53.de/) or comparable firm with DAML and TypeScript audit experience; final scope and vendor to be approved with the Tech & Ops security subcommittee before kickoff. Expected vendor fee: $24-30k (160-200K CC pass-through). Remainder covers engineering remediation and final report integration.
**Person-hours:** ~80 (audit coordination + remediation)

Deliverables:

- External security audit by Cure53, scope reviewed with the Tech & Ops security subcommittee before kickoff.
- Audit scope: `@canton-vc/core` (Canton JSON Ledger v2 client), the DAML templates (`canton-vc-credential` package — `Credential` + `KycNFT` + `Verify` choice), and `verifyDisclosure()` in `@canton-vc/credential` (DAML + TypeScript boundary).
- Audit report published alongside the Milestone 2 release with all critical and high findings remediated.
- DAR rebuilds verified against the latest stable Canton release (currently 3.4) and the next stable Canton release if it lands during the milestone window (3.5 is in release-candidate as of submission).

**Acceptance criteria:** Cure53 audit report public with no unresolved critical or high findings. DAR builds verified on Canton 3.4, plus any later stable Canton release published during the milestone window.

### Milestone 3: Python SDK port + multi-language roadmap

**Hard deadline:** 2 months from grant approval.
**Funding:** 350,000 CC (23%)
**Person-hours:** ~120 (intensive solo Python port)

Deliverables:

- `canton-vc` Python package with feature-parity to the TypeScript `@canton-vc/core` and `@canton-vc/credential`: Canton JSON Ledger client, OAuth 2.0 + OIDC helpers, `verify_disclosure()` helper. Pydantic validation, same wire layer as the TypeScript packages, idiomatic snake_case API.
- Published to PyPI under Apache 2.0 as `canton-vc`.
- Issuer cookbook and verifier cookbook covering the Python integration path.

**Acceptance criteria:** Python package installable from PyPI with green CI on Python 3.10, 3.11, and 3.12. Feature parity with the TypeScript surface validated by a shared integration test suite running against a Canton participant.

**Roadmap beyond Milestone 3:**

| Language | Status | Where |
|---|---|---|
| TypeScript / JavaScript | ✓ Shipped | Milestone 1 (this proposal) — `@canton-vc/*` on npm |
| Python | Planned | Milestone 3 (this proposal) — `canton-vc` on PyPI |
| Go | Planned | Phase 2 continuation grant |
| Java | Planned | Phase 2 continuation grant |
| Rust | Planned | Phase 2 continuation grant |
| .NET (C#) | Planned | Phase 2 continuation grant |

### Milestone 4: Adoption (per-unit pricing)

**Hard deadline:** 4 months from grant approval.
**Funding:** Up to 450,000 CC (30%), priced per achieved sub-KPI plus a completion lump.
**Person-hours:** ~60 (community support, PR review, integration support).

Sub-KPIs and unit pricing:

- 80,000 CC per accepted community adapter PR (target vendors: Onfido, Veriff, Au10tix, Jumio). Maximum 2 sub-KPI awards (up to 160K).
- 80,000 CC per second-issuer integration, meaning an operator outside the reference deployment running canton-vc to mint Canton credentials. Maximum 1 award (up to 80K).
- 80,000 CC per verifier-firm integration consuming `verifyDisclosure()` against any canton-vc issuer. Maximum 1 award (up to 80K).
- 130,000 CC completion lump on Milestone 4 close, contingent on at least one sub-KPI achieved + repository in maintained state (responded issues, merged PRs, green CI).

Unspent CC at milestone close returns to the development fund. The per-unit structure was chosen because adoption is the dimension where outcomes are least predictable from engineering effort alone; the completion lump rewards the engineering effort of supporting integrators even when adoption ramps slowly.

**Acceptance criteria:** Each sub-KPI is validated through the on-chain trail or the merged PR in `Farukest/canton-vc`. The committee or its delegate confirms each unit award against the published evidence.

### Ongoing: Maintenance (Post-Grant)

**Hard deadline:** Begins on M4 acceptance and runs for 24 months.
**Funding:** Covered by the M4 completion lump; no additional grant ask.
**Scope:**

- Security patches across `@canton-vc/*` npm packages and the `canton-vc-credential` DAR (rebuilds against new stable Canton releases, dependency-pin updates, vendor-adapter API drift fixes).
- Community PR triage and review on `Farukest/canton-vc` (vendor adapter contributions per the Milestone 4 sub-KPI, bug reports, doc improvements).
- `SECURITY.md` vulnerability response process — coordinated disclosure window, patch turnaround, and credit policy following the OWASP / CVE-aligned standard the Foundation already uses for other ecosystem packages.
- CIP draft maintenance — minor revisions in response to Foundation review feedback after the formal CIP PR, and tracking of multi-implementation drift if independent implementations land.

If material maintenance effort emerges beyond this 24-month window (e.g., a major Canton protocol bump that requires a non-trivial DAR rewrite, or a security audit finding outside the Cure53 / M2 scope), a separate Maintenance & Compatibility Extension proposal would be submitted through the Foundation's standard channel. The reference Crivacy.io deployment running canton-vc in production provides a natural co-incentive for sustained maintenance during and beyond the stated window.

## Funding

| Line item | Milestone 1 | Milestone 2 | Milestone 3 | Milestone 4 | Total |
|---|---|---|---|---|---|
| Retroactive recognition of delivered work | 400K | — | — | — | 400K |
| External security audit (vendor + remediation) | — | 300K | — | — | 300K |
| Python SDK port engineering | — | — | 350K | — | 350K |
| Adoption support (per-unit + completion lump) | — | — | — | up to 450K | up to 450K |
| **Subtotal** | **400K** | **300K** | **350K** | **up to 450K** | **up to 1,500K** |

Funding is released after each milestone is accepted by the Tech & Ops Committee against the acceptance criteria above. Unspent CC at milestone close returns to the development fund. Milestone 4 sub-KPIs are paid individually as each is achieved within the milestone deadline.

## Champion

This proposal is championed by the Canton Foundation. The repository at https://github.com/Farukest/canton-vc and the CIP draft inside it are the primary review surface.

## Co-Marketing

On acceptance of Milestone 1, the author will coordinate with the Canton Foundation marketing team on:

- A launch announcement covering the open-source release and CIP draft via the Foundation's channels.
- A dApp Leaders Forum talk or recorded session walking through the SDK integration path (issuer + verifier).
- A reference-architecture blog post co-published with the Foundation describing the disclosed-contract verification pattern.

The author will tag the Canton Foundation in repository milestones (CHANGELOG releases, CIP draft revisions, milestone closures) so the Foundation can amplify on its own schedule.
