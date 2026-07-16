## Development Fund Proposal

**Author:** [VertexPoint Labs LLC (TrustedPoint)](https://trusted-point.com) · `grants@trusted-point.com`
**Status:** Draft
**Created:** 2026-07-16
**Label:** canton-apis
**Champion:** Need Champion

---

## Abstract

**Canton Network has no mobile SDK today.** There is no Swift or Kotlin library for the Canton Ledger API, no on-device key management pattern for Canton external parties, and no native mobile implementation of the dApp-to-wallet connectivity layer. A wallet provider, an exchange, a DeFi or consumer dApp, or any team adding a mobile client to a Canton product must hand-roll the JSON Ledger API v2 client, the token-standard flows, and the signing layer from scratch, per platform, per team. The same holds for institutions: a bank or asset manager that puts Canton assets in front of its customers does so through its own mobile app, and that app needs the same client and signing layer underneath.

**The demand is documented in the Foundation's own developer survey.** The Canton Network developer survey quoted in Dev Fund #90 records developers asking for an "official crypto wallet ... in the form of browser extension and mobile app like MetaMask or Trust Wallet" and naming "user onboarding & key management ... signing flows and permission boundaries" as what "took longest to get right on the Canton Network". Dev Fund #90 (approved) delivers the browser extension and the web portfolio UI. No approved or in-flight grant delivers the mobile half. The demand is not hypothetical: of the six consumer wallets on the network today (Dev Fund #9 lists them), several have already shipped native mobile apps, each hand-rolling the entire Canton client and custody layer in-house, and the rest remain web-only. The cost this SDK removes is already being paid, team by team, in private codebases.

This proposal funds an **open-source Canton Mobile SDK**: native Swift (iOS) and Kotlin (Android) libraries covering the JSON Ledger API v2 client surface, JWT/OIDC authentication, on-device key management for external parties (hardware-backed ECDSA P-256 where the deployment's crypto configuration admits it, software-keystore Ed25519 as the always-compatible path), biometric-gated transaction signing via the interactive submission flow (`/v2/interactive-submission/prepare` and `execute`), typed token-standard support for both CIP-0056 (V1) and CIP-0112 (V2), pre-built typed bindings for the Splice DARs, and a native implementation of the CIP-0103 method surface over its WalletConnect transport, so Canton dApps can talk to Canton wallets on a phone the way they already do in a browser. A shared Kotlin Multiplatform protocol core keeps one implementation of the change-sensitive protocol logic; each platform gets a hand-written idiomatic surface (Swift Package with async/await, Kotlin coroutines), and all cryptography stays in platform-native layers that never cross the shared core. Everything is Apache-2.0.

The SDK ships with a **public conformance suite in which every shipped capability has a corresponding check**. For the client surface, the published checklist is anchored to Digital Asset's Ledger Client Standard (TLS, error classification, change-ID de-duplication, command recovery through the completion endpoint, resumable streams, and the token-standard flow set); the mobile-specific capabilities (secure-element custody, biometric gating, the CIP-0103 transport) are published as a documented superset, and Standard capabilities deliberately out of scope for a mobile client (PQS, in-memory ACS, OpenTelemetry, replaced on device by lightweight structured-logging hooks) are listed as such. Milestone acceptance is therefore testable against an external reference, not a self-authored list.

**Total Funding Request: 1,150,000 CC**, weighted toward adoption: 390,000 CC (34%) pays for engineering across three accepted milestones, and up to 760,000 CC (66%) is adoption-weighted: 600,000 CC pays only against independent production usage (150,000 CC per Featured App with a mobile client running the SDK in production on Canton mainnet, up to 4 apps), plus a 160,000 CC completion tranche against adoption-enabling deliverables and independent community signals. An independent security review of the key-management and signing layers is budgeted separately as a pass-through of roughly 100,000 to 130,000 CC alongside Milestone 3. For calibration, the approved SDK grants ran 2,260,000 CC (Dev Fund #38) and 2,705,000 CC all-in (Dev Fund #46); this ask is the smallest of the set.

VertexPoint Labs commits to a 6-month minimum maintenance window at no additional cost: 30-day compatibility with each new Canton minor, 60-day with each Splice release, 30-day with each iOS and Android major release, 7-day patches for Critical/High CVEs, with continuation maintenance intent per CIP-0100 beyond that window.

---

## Specification

### 1. Objective

**Problem 1: no Canton client exists for the two platforms end users actually hold.** Existing Canton SDKs and wallet tooling, including the TypeScript dApp and wallet SDKs under Dev Fund #69 and the Splice Wallet Kernel, target backend and browser runtimes. A team building an iOS or Android application today must write its own JSON Ledger API v2 client (and re-discover the body-shape rules: flat for `submit-and-wait`, wrapped for `submit-and-wait-for-transaction`, package-name-qualified template IDs taking a leading `#`, `Int` encoded as string), its own JWT/OIDC session handling, and its own decoding of token-standard contract payloads, per platform. None of that work is shared or maintained anywhere.

**Problem 2: no on-device key custody pattern exists for Canton external parties.** Canton 3.4 supports external parties: parties whose signing keys are held outside the node operator's domain. That is exactly the custody model a non-custodial mobile wallet needs, and the survey quoted in Dev Fund #90 shows key management and signing flows are what integrators struggle with most. The primitives exist (interactive submission: prepare, sign, execute), the platform hardware exists (Secure Enclave, StrongBox), but nothing connects them: no library generates a key in the device's secure element, allocates an external party with it, and signs Canton transactions behind a biometric prompt.

**Problem 3: the wallet connectivity layer has no native mobile implementation.** CIP-0103 is deliberately transport-agnostic; its transport list contemplates in-app bridges for mobile applications, and its method surface is registered over WalletConnect as the `canton_*` set (`canton_prepareSignExecute`, `canton_listAccounts`, `canton_signMessage` and the rest). What does not exist is a Swift or Kotlin implementation of that surface, on either side of the session. A mobile wallet cannot answer those methods without a Canton client, key custody, and signing underneath, so today no Canton dApp can hand a signing request to a wallet app on a phone without a bespoke, per-pair integration.

**Outcome.** A wallet provider, exchange, or dApp team adds one dependency (Swift Package or Maven artefact) and gets a maintained, typed, security-reviewed Canton client with device-held keys and standard dApp connectivity on both mobile platforms.

**Success looks like:** a developer submits and reads a Canton transaction from a stock iOS and Android app in under an hour from `git clone` of the quickstart; an external party is onboarded with a device-held key (secure-element P-256 where the deployment allows it, software-keystore Ed25519 otherwise) and a token-standard transfer settles on DevNet signed behind Face ID / fingerprint; independent Featured Apps run mobile clients on the SDK in production on mainnet (the Milestone 4 tranches pay against exactly this); the conformance suite maps every shipped capability to the published capability checklist and runs green in public CI.

**Out of scope entirely** (excluded, not deferred): a consumer wallet product or custody service (the reference wallet is a sample application demonstrating the SDK, not a supported end-user product); exchange integrations; any hosted backend service; and any new connectivity standard.

### 2. Implementation Mechanics

#### Architecture: one protocol core, two native surfaces, platform-native cryptography

A shared Kotlin Multiplatform core implements the change-sensitive protocol logic once: request/response models for the JSON Ledger API v2, command construction and change-ID de-duplication, ACS and update pagination, retriable-vs-non-retriable error classification, token-standard typed models, and disclosed-contract handling. Each platform then gets a hand-written idiomatic surface: a Swift Package (`async/await`, `Codable`-style value types, structured concurrency) and a Kotlin library (coroutines, `Flow`-based streams). The Swift surface is a curated API, not a raw interop export; the shared core is an implementation detail a consuming iOS team never sees.

Cryptography never enters the shared layer. Key generation, storage, and signing are implemented twice, natively: CryptoKit + Secure Enclave + LocalAuthentication on iOS; Android Keystore + StrongBox + BiometricPrompt on Android. This split is deliberate: protocol logic benefits from a single implementation (one place to track every Canton and Splice release), while key handling must sit on each platform's audited, hardware-backed APIs with no abstraction in between.

#### Workstream A: Canton client (both platforms)

*Transport and auth:* JSON Ledger API v2 client covering command submission (`submit-and-wait` variants and async submit), completions, active-contract and update streams (HTTP paging plus the WebSocket endpoints) with offset-based resume across app lifecycle transitions, event queries, and TLS; JWT/OIDC session handling built for user-present mobile flows (authorization code with PKCE, token refresh, JWT injection) with provider presets. Connectivity works both direct-to-participant and through the Wallet Gateway (Dev Fund #109), whichever the deployment uses.

*Typed data:* pre-built typed bindings for the Splice protocol DARs (Amulet, token standard, wallet payloads), generated in CI from the canonical DARs via a JVM helper on `daml-lf-archive` (the approach Dev Fund #46 established) and shipped as versioned artefacts; a generic typed-value layer for application contracts. A full arbitrary-DAR codegen CLI for Swift/Kotlin is explicitly deferred to a continuation grant: mobile clients overwhelmingly consume the token standard plus one known application DAR, and pre-built bindings cover that without committing this grant to a second codegen toolchain.

#### Workstream B: Keys, signing, and dApp connectivity

*External-party custody:* key generation inside hardware-backed storage using ECDSA P-256 (`ec-p-256` with `ec-dsa-sha-256`, a supported Canton signing scheme): the Secure Enclave on iOS, StrongBox where the device provides it and TEE-backed Keystore otherwise on Android, recorded via key attestation; plus a software-keystore Ed25519 signer (encrypted at rest, biometric-gated unlock) as the always-compatible path for deployments standardised on Ed25519, which the current documentation examples use. Whether a given deployment accepts P-256 external-party keys is validated during M1-M2 against DevNet and the Global Synchronizer's published configuration, before any hardware-custody claim reaches marketing. External-party onboarding has the device sign the combined topology `multiHash` returned by `/v2/parties/external/generate-topology`, with the signed transactions submitted via `/v2/parties/external/allocate`, directly or through the Wallet Gateway. Transaction signing runs via interactive submission: `/v2/interactive-submission/prepare` returns the prepared transaction and its hash, the device signs behind Face ID / BiometricPrompt, and `/v2/interactive-submission/execute` (or `executeAndWait`) submits with `partySignatures`. The SDK does not blind-sign a participant-supplied hash: it recomputes the hash locally from the returned `preparedTransaction` under the stated `hashingSchemeVersion`, verifies the two match, and surfaces a transaction summary at the biometric prompt. All flows align with the external-signing patterns in the Splice Wallet Kernel.

*Token standard:* typed flows for CIP-0056 (V1) and CIP-0112 (V2): holdings, transfer instructions, allocations, choice-context and disclosed-contract / `createdEventBlob` handling, and V2 transfer-event parsing, with end-to-end transfer examples on both platforms.

*Mobile dApp connectivity:* a native implementation of the CIP-0103 method surface (`prepareExecute`, `listAccounts`, `getPrimaryAccount`, `signMessage`, `ledgerApi`, plus the session events) delivered over its WalletConnect transport, where those methods are registered as the `canton_*` set (`prepareExecute` is registered as `canton_prepareSignExecute`); wallet-side on both platforms with a dApp-side helper, interoperable with the WalletConnect integration the dApp SDK (Dev Fund #69) already ships; a same-device deep-link / app-link session path where dApp and wallet are both local. The mobile transport binding and any gaps found while implementing the surface are contributed upstream to the Splice Wallet Kernel discussion.

*Samples and conformance:* a reference wallet sample app per platform (external party, balances, token-standard send/receive, dApp session approval) distributed via TestFlight and Play internal track; the conformance suite (structure per the Abstract) run in public CI against LocalNet fixtures; a published compatibility matrix (SDK version × Canton / Splice range × iOS / Android OS versions).

Deferred to continuation grant: arbitrary DAR-to-Swift/Kotlin codegen CLI shipped as a `dpm` component; gRPC transport parity; React Native and Flutter bridges over the native core; push-notification transaction inbox; passkey-based session recovery; offline QR signing flows; watchOS and Wear OS surfaces; additional sample applications beyond the reference wallet.

#### Ecosystem demand and adoption path

The demand signal is documented above: the developer survey quoted in Dev Fund #90 asks for the mobile wallet form factor, and of the six wallets in Dev Fund #9's adapter list, the teams that have gone mobile each hand-rolled the Canton client layer in-house while the rest remain web-only. The wallet-stack announcement on the Canton blog (June 2026) covers browser-extension and server-based integration paths; a mobile client layer is not part of the published stack. Prospective adopter teams will be invited to comment directly on this proposal PR, so the review is informed by direct feedback from teams that intend to build with the SDK, not only by this description. Per-milestone demo sessions are offered to the Splice Wallet Kernel maintainers and the Digital Asset wallet team, with feedback incorporated before each acceptance.

Adoption follows a staged path: teams start on a DevNet integration, graduate through TestFlight or Play internal-track distribution to a public store release, and are credited under the Milestone 4 per-app tranches once their client runs against mainnet in production. Success is measured first by independent production applications on mainnet, which is what the 600,000 CC per-event line pays against; store listings, Maven Central download statistics, and GitHub activity are secondary, supporting signals.

### 3. Architectural Alignment

The SDK extends the existing wallet stack to the two platforms it does not reach; it replaces nothing.

- Splice Wallet Kernel (maintained under Dev Fund #50) and Wallet Gateway (Dev Fund #109): the mobile SDK is a client of this stack; external-party onboarding and gateway connectivity follow its patterns, and the mobile connectivity transport is contributed to its upstream discussion.
- Dev Fund #90 (reference wallet, approved): delivers the browser extension and web portfolio UI; the survey quotes inside it name the mobile app as the other requested form factor. This proposal delivers that complement.
- CIP-0103 (dApp API Standard) and the Canton method set specified over WalletConnect: the SDK implements the wallet side of the already-specified method surface natively on mobile, interoperating with the WalletConnect integration the dApp SDK (Dev Fund #69) already ships; no new connectivity standard is invented.
- CIP-0056 and CIP-0112 (Token Standard V1 / V2): first-party typed support on both platforms.
- NODERS Funding Proposal #38, Peaceful Studio #46, Dev Fund #407: adjacent language-SDK grants, all serving backend runtimes; nothing in this proposal overlaps with them. The funding shape follows Peaceful Studio #46: per-event adoption tranches, an audit pass-through held outside the engineering envelope, and an extended adoption window granted as an explicit exception.
- PartyLayer (Dev Fund #9, approved): a JS framework layer (React, Vue, React Native) above the dApp SDK; React Native teams keep using PartyLayer, native teams get this SDK; the two do not overlap.
- Digital Asset's language roadmap (TypeScript, Java, Python, per the record in Dev Fund #46): backend bindings; DA's Java work targets JVM services, not an Android SDK with secure-element custody, and no DA effort covers iOS.

The proposal does not duplicate any approved or in-flight grant. It is the mobile member of the SDK set, sitting on top of the wallet-kernel stack the Foundation already funds.

### 4. Backward Compatibility

Additive client libraries; no changes to Canton, Splice, or any existing SDK. Depends on Canton 3.4+ (JSON Ledger API v2, external parties, interactive submission); external-party onboarding uses the Ledger API's external-party endpoints, directly or through the Wallet Gateway, as the deployment exposes them.

*No backward compatibility impact on existing Canton ecosystem components.*

The SDK itself follows semantic versioning with tagged releases: any breaking API change ships under a major version bump with published migration notes, and release tags carry changelogs and upgrade notes.

---

## Milestones and Deliverables

> Engineering milestones (M1 to M3) complete in approximately six months. Milestone 4 opens on Milestone 3 acceptance and runs to a 12-month deadline from grant approval (rationale under Funding). Milestone 1 delivers a working proof of concept, proving feasibility before the heavier milestones open; Dev Fund #46 applied the same de-risking principle with its pre-funding prototypes.

### Milestone 1: Shared core, Android client, PoC

- **Estimated Delivery:** Month 1.5 · **Hard deadline:** 2 months from grant approval.
- **Estimated effort:** ~45 person-days (including its share of documentation and CI).
- **Focus:** the protocol core and the first native surface, proven end to end on DevNet.
- **Deliverables / Value Metrics:**
  - Shared protocol core: JSON Ledger API v2 models, command construction with change-ID de-duplication, command recovery through the completion endpoint (pending command state recovered across app-lifecycle kills and network transitions, never blind re-submission), ACS/update paging and resumable streams, error classification, TLS.
  - Kotlin (Android) SDK surface published to Maven Central under a working namespace; JWT/OIDC auth with provider presets.
  - Android sample app submitting and reading a transaction on LocalNet/DevNet, with a recorded demo.
  - Namespace confirmation with the Foundation for `canton-*` artefact coordinates (working namespace `vertexpoint-canton-*` until confirmed).
  - Public repository (Apache-2.0), CI green, quickstart documentation.
- **Verification:** committee or delegate confirms the artefact resolves from Maven Central, tests pass in public CI, and the sample app submits and reads a transaction end to end.
- **Payment:** 90,000 CC upon committee acceptance.

### Milestone 2: iOS surface, on-device keys, external-party signing

- **Estimated Delivery:** Month 3 · **Hard deadline:** 4 months from grant approval.
- **Estimated effort:** ~75 person-days (the heaviest engineering milestone).
- **Focus:** platform parity and the custody layer that makes the SDK a wallet foundation rather than a read-only client.
- **Deliverables / Value Metrics:**
  - Swift Package (iOS) at functional parity with the Android surface: async/await API, structured concurrency, identical protocol coverage.
  - Native key layers: CryptoKit + Secure Enclave (iOS) and Android Keystore (StrongBox where present, TEE-backed otherwise, recorded via key attestation) holding ECDSA P-256 keys whose generation, storage, and signing never leave hardware-backed storage, plus the Ed25519 software-keystore signer.
  - External-party onboarding with the topology `multiHash` signed on device: `/v2/parties/external/generate-topology`, sign, `/v2/parties/external/allocate`; direct-to-participant and via Wallet Gateway.
  - Interactive submission flow (`prepare`, local re-computation of the hash from the returned `preparedTransaction` under the stated `hashingSchemeVersion` so the device never blind-signs a participant-supplied hash, sign behind Face ID / BiometricPrompt, `execute` / `executeAndWait` with `partySignatures`) with a transaction signed by a device-held key settling on DevNet, on both platforms.
  - iOS sample app at parity with the Android sample; recorded demo of the external-party signing flow.
- **Verification:** committee or delegate observes an external party onboarded from a stock device and a transaction signed on-device settling on DevNet, on both platforms; the flow is demonstrated with an ECDSA P-256 secure-element key and with an Ed25519 software-keystore key, and the P-256 path is checked against the Global Synchronizer's published crypto configuration, settling the signing-scheme question before the token-standard milestone opens.
- **Payment:** 160,000 CC upon committee acceptance.

### Milestone 3: Token standard V1 + V2, wallet connectivity, conformance, security review

- **Estimated Delivery:** Month 5 · **Hard deadline:** 6 months from grant approval.
- **Estimated effort:** ~80 person-days plus the external review window.
- **Focus:** the asset and connectivity layers, hardening, and independent review.
- **Deliverables / Value Metrics:**
  - Typed token-standard support covering CIP-0056 (V1) and CIP-0112 (V2): holdings, transfer instructions, allocations, choice-context and disclosed-contract / `createdEventBlob` handling, V2 transfer-event parsing; end-to-end transfer examples on both platforms (V1 transfer and a V2 `Account`-based transfer/allocation) settling on DevNet. V2 typed flows track the specification as deployed on DevNet; if CIP-0112 semantics are still moving at M3, acceptance passes on V1 with the V2 flows delivered within 30 days of CIP-0112 running unchanged on DevNet for a full release cycle.
  - Pre-built typed bindings for the Splice DARs, generated in CI via `daml-lf-archive` and published as versioned artefacts for both platforms.
  - Native wallet-side implementation of the WalletConnect Canton method set on both platforms plus a same-device deep-link session path, with a working demo in which a dApp built on the dApp SDK (Dev Fund #69) completes a `canton_prepareSignExecute` round-trip against the reference wallet across two separate apps on one phone.
  - Reference wallet sample apps distributed via TestFlight and Play internal track.
  - Conformance suite green in public CI against the published capability checklist; published compatibility matrix (SDK × Canton/Splice range × iOS/Android versions).
  - Independent security review of the key-management, signing, and session-transport layers; vendor engaged and scope agreed with the Tech & Ops security subcommittee during Milestone 2 (respecting auditor lead times), the scope document published before the review begins, the review running in parallel with Milestone 3 engineering; Critical/High findings remediated with a public remediation summary before any v1.0 tag.
- **Verification:** token-standard transfers settle end to end on DevNet on both platforms (demonstrated, not mocked); the `canton_prepareSignExecute` demo runs across two apps on stock devices; conformance suite green; security-review remediation summary published.
- **Payment:** 140,000 CC upon committee acceptance. Security review paid separately as a pass-through (see Funding).

### Milestone 4: Adoption and production deployment

- **Opens:** on Milestone 3 acceptance.
- **Deadline:** 12 months from grant approval, an explicit exception to the 9-month default (rationale under Funding; Dev Fund #46 carries an 18-month exception on the same grounds).
- **Focus:** real production usage on mainnet; the majority of the grant (66%) pays only here.
- **Deliverables / Value Metrics:**

| Deliverable | Acceptance Criteria | Tranche payout |
|-------------|---------------------|----------------|
| Featured App with a mobile client on mainnet | Each independent application whose iOS or Android client uses the SDK to hold keys, sign, or submit against Canton mainnet in production, meeting the independence and minimum-usage criteria under Verification. Up to 4 apps credited. Evidenced by party IDs and on-chain submission, or by private attestation to the Canton Foundation under NDA (the Foundation confirms to the committee). | **150,000 CC per app (up to 600,000 CC)** |
| Reference application | The reference wallet sample matured into a public, open-source app in both stores (or store-ready with a public listing pending review), running against mainnet | bundled in completion tranche |
| Documentation, enablement, and maintenance plan | Docs site live and linked from Canton developer docs; at least 2 developer enablement sessions (workshop or office hours) delivered; long-term maintenance plan published; final report at M4 close covering issues resolved, release notes, known limitations, and roadmap suggestions for a continuation grant | bundled in completion tranche |
| Adoption-completion gate | ≥2 independent apps (distinct from the reference wallet delivered under this grant) in public app stores or public TestFlight/open-track distribution using the SDK; ≥5 GitHub issues or PRs from external contributors; ≥3 community-reported issues triaged through to resolution | 160,000 CC |
| **Milestone 4 maximum** | | **760,000 CC** |

- **Verification:** Featured Apps evidenced by party IDs and on-chain mainnet submission (public roster with adopter consent) or private attestation under NDA (the Foundation confirms to the committee); the completion gate evidenced by store listings, GitHub insights, and triaged-issue links. An application counts as independent only if it has no common ownership or control with VertexPoint Labs and has received no payment from VertexPoint Labs for the integration; the Foundation verifies independence. A per-app tranche fires only when the SDK sits on the app's custody or signing path in its production build, with sustained mainnet activity over at least 4 consecutive weeks; a token single-call integration does not qualify. Adopting teams and the proposal champion (once assigned) are invited to confirm milestone completion, so acceptance comes corroborated by real users, not self-reported alone.

---

## Acceptance Criteria

Evaluated on ecosystem value, not artefact delivery:

- A developer adds the Swift Package or Maven artefact, points at a participant or Wallet Gateway, and submits a first transaction from a stock device.
- An external party is created with a device-held key (generated in the secure element where the deployment supports it), and a transaction signed behind a biometric prompt settles on DevNet; the key never leaves the device.
- Token-standard transfers settle end to end on DevNet on both platforms: a V1 (CIP-0056) transfer and a V2 (CIP-0112) `Account`-based transfer/allocation.
- A Canton dApp completes a `canton_prepareSignExecute` round-trip against a separate wallet app on the same device and receives a signed result.
- Independent Featured Apps run mobile clients on the SDK in production on Canton mainnet; the Milestone 4 per-event tranches pay against those deployments.
- The conformance suite maps shipped capabilities to the published capability checklist and runs green in public CI; documentation, tests, security-review results, and a maintenance plan are published under Apache-2.0.

---

## Funding

**Total Funding Request: 1,150,000 CC**

The request is weighted **66% toward adoption** (760,000 CC) and 34% toward engineering delivery (390,000 CC), per the framework introduced in PR #258: acceptance is based on demonstrated ecosystem value, not artefact delivery alone. The engineering portion covers a roughly six-month build of a two-platform SDK: shared protocol core, two idiomatic native surfaces, hardware-backed key management, interactive-submission signing, token-standard support (CIP-0056 V1 and CIP-0112 V2), the CIP-0103 mobile transport, pre-built Splice bindings, samples, and a conformance suite. For calibration against the approved SDK grants: Dev Fund #38 totalled 2,260,000 CC and Dev Fund #46 2,705,000 CC all-in; at up to roughly 1,280,000 CC including the audit pass-through, this is the smallest ask in the set.

### Payment Breakdown by Milestone

| Milestone | Payment | % of total |
|---|---|---|
| M1: Shared core, Android client, PoC | 90,000 CC upon committee acceptance | ~8% |
| M2: iOS surface, on-device keys, external-party signing | 160,000 CC upon committee acceptance | ~14% |
| M3: Token standard V1 + V2, wallet connectivity, conformance, security review | 140,000 CC upon committee acceptance | ~12% |
| M4: Adoption and production deployment | up to 760,000 CC, per-event + completion tranches | 66% |
| **Total** | **1,150,000 CC** | **100%** |

**Engineering (M1 to M3): 390,000 CC (34%).** Front-loaded so the committee evaluates quality at each acceptance before the adoption-weighted tranche opens. M2 carries the heaviest engineering: platform parity plus the custody layer (secure-element key handling and interactive-submission signing on two platforms).

**Adoption (M4): up to 760,000 CC (66%).**
- **150,000 CC per Featured App with a mobile client in production on Canton mainnet, up to 4 apps = 600,000 CC.** The dominant line by design: the largest share pays only when independent teams ship mobile clients on the SDK to mainnet.
- **160,000 CC completion tranche** against the adoption-enabling deliverables (public reference app, docs site, maintenance plan) and the quantitative gate (≥2 independent apps distinct from the reference wallet delivered under this grant in public distribution, ≥5 GitHub issues/PRs from external contributors, ≥3 community issues triaged). Proof of production usage comes from the 600,000 CC per-event line; this tranche pays for the enabling deliverables and the community signals listed above.

Per-event payouts make adoption proportional to demonstrated usage: if two of four apps ship, two tranches pay. The adoption-enabling deliverables are committed under M4 and are not contingent on the per-event tranches firing.

### Security review (pass-through, separate from the 1,150,000 CC base)

The independent security review at Milestone 3 is commissioned proactively, without waiting for a committee request. It is budgeted as a pass-through of roughly 100,000 to 130,000 CC at vendor invoice, paid alongside M3 acceptance, outside the engineering/adoption base; for calibration, the comparable Go SDK audit under Dev Fund #38 was quoted at 24,000 USD by Cure53. The vendor shortlist is Cure53, for continuity with the Dev Fund #38 audit, plus a mobile-security specialist such as NCC Group or Trail of Bits; the executed quote is published with the scope document before the review begins. Accepted or deferred Medium and Low findings are documented with rationale alongside the Critical/High remediation summary, and if the final invoice materially exceeds the estimate, the delta is raised at the standard re-evaluation point per the Volatility Stipulation rather than mid-review, and 130,000 CC is a hard cap on the pass-through absent explicit committee re-approval. The scope is mobile-specific: secure-element key handling, biometric gating, interactive-submission signing, and the app-to-app session transport. All-in exposure for the fund, including the audit pass-through, is up to roughly 1,280,000 CC.

### Effort Breakdown

| Activity | Person-days |
|---|---|
| Shared protocol core (models, streams, errors, auth) | 32 |
| Android surface + Maven publishing + sample app | 24 |
| iOS surface (Swift Package) + sample app | 28 |
| Native key layers (Secure Enclave / Keystore, biometrics) | 22 |
| External-party onboarding + interactive submission signing | 20 |
| Token standard V1 + V2 typed flows, both platforms | 22 |
| Splice DAR bindings pipeline (`daml-lf-archive` CI helper) | 10 |
| CIP-0103 mobile transport (spec + implementation + demo) | 14 |
| Conformance suite + compatibility matrix + CI | 12 |
| Documentation, quickstarts, recorded demos | 8 |
| Security-review coordination and remediation | 8 |
| **VertexPoint Labs engineering total** | **200** (approximately 1,600 hours) |
| External security review (vendor pass-through) | separate |

### Risk Mitigation

- *Build risk*: retired by the Milestone 1 PoC (a real transaction submitted and read from a stock Android device); Dev Fund #46 de-risked its grant with proof-of-concept work on the same principle.
- *Wallet Kernel or Ledger API surface evolves mid-build*: the SDK pins to tagged Canton/Splice releases; the conformance suite isolates breakage; the 30-day Canton-minor compatibility SLA applies from first release. The external-party topology composition is explicitly documented as subject to change, so the SDK treats the generate-topology response as opaque and signs the returned `multiHash` rather than assuming a fixed transaction set.
- *Signing-scheme mismatch (secure elements hold P-256, current documentation examples use Ed25519)*: ECDSA P-256 (`ec-dsa-sha-256`) is a supported Canton signing scheme; Milestone 2 demonstrates onboarding and settlement with both an ECDSA P-256 secure-element key and an Ed25519 software-keystore key, so either path is proven before the token-standard milestone opens.
- *iOS interop scepticism toward a shared core*: the Swift surface is hand-written idiomatic Swift and the shared core is internal; if platform-native demand dominates, the facade permits a pure-Swift core swap without an API break. Cryptography is already pure-native on both platforms.
- *App-store review friction delays public samples*: TestFlight and Play internal track distribution satisfy M3; public store listings are an M4 completion-gate item with "store-ready with listing pending review" accepted.
- *Adoption stalls, fewer than 4 apps verified*: per-event tranches simply do not fire; engineering payments are unaffected.
- *Security review finds a critical issue in key handling*: the vendor is engaged during M2 (respecting auditor lead times), the review runs alongside M3 engineering, and remediation slack sits inside the M3 window before any v1.0 tag.
- *Maintainer becomes unavailable*: public CI, public conformance suite, `docs/maintainers/` runbooks, and a 30-day handover commitment if the Foundation designates a successor.
- *Overlap risk*: as of July 2026 no community Swift or Kotlin Canton client was found (searched GitHub, Maven Central, and the Swift Package Index; the closest adjacent work is PartyLayer's React Native layer, addressed under Architectural Alignment). Should one surface during the grant, the commitment is to engage its authors and converge rather than fork, alongside the existing upstream contribution of the mobile transport binding. The same commitment applies if Digital Asset adds a mobile layer to the wallet stack mid-grant: the per-milestone demos to the DA wallet team exist precisely so the work converges instead of colliding.
- *WalletConnect dependency*: the cross-device session path rides WalletConnect's relay; the same-device deep-link path already in scope is relay-free and serves as the fallback if relay terms, pricing, or availability change. The CIP-0103 method surface is transport-agnostic, so a replacement transport slots under the same API without breaking consumers.

### Deadline rationale

Engineering milestones complete in approximately six months. Milestone 4 runs to a 12-month deadline from grant approval, an explicit exception to the 9-month default: the adopter set (wallet providers, exchanges, consumer dApps) ships mobile clients on app-store review and institutional release cycles that routinely exceed nine months. Dev Fund #46 carries an 18-month exception on the same proportionality rationale; the window requested here is shorter.

### Volatility Stipulation

The grant is denominated in fixed Canton Coin and is re-evaluated at the standard 6-month review point, with a second review at the 12-month mark to cover the extended M4 adoption window. Should scope change at Committee request, remaining milestones are renegotiated at the same review points to account for USD/CC volatility.

### Target use cases

- **Wallet providers.** Non-custodial Canton wallets with device-held keys: the survey-requested "mobile app like MetaMask or Trust Wallet" form factor.
- **Exchanges and custodians.** Mobile companion apps for balances, transfer approval, and transaction review against their Canton integration.
- **Consumer dApps.** Retail-facing Canton applications (payments, loyalty, tokenised assets) whose users are on phones, connecting to wallets over the CIP-0103 mobile transport.
- **Institutional approval flows.** Biometric-gated approval of prepared transactions by named individuals: the mobile leg of governance-aware signing. In digital-asset custody this is standard practice (Fireblocks routes approvals to its mobile app; BitGo ships a standalone approval app, BitGo Verify), so institutional Canton workflows will expect the same approval surface.

### What's deferred to a continuation grant

Arbitrary DAR-to-Swift/Kotlin codegen CLI shipped as a `dpm` component; gRPC transport parity; React Native and Flutter bridges over the native core; push-notification transaction inbox; passkey-based session recovery; offline QR signing flows; watchOS and Wear OS surfaces; additional sample applications beyond the reference wallet.

---

## Maintenance Commitment

**6-month minimum post-launch maintenance at no additional cost beyond this grant, with continuation grant intent per CIP-0100 at month 3.**

Maintenance covers five tracks: (1) per-Canton-release compatibility within 30 days of each new minor; (2) per-Splice-release compatibility within 60 days; (3) per-iOS/Android-major compatibility within 30 days of each platform release (mobile SDKs break on OS majors; this SLA is specific to this grant); (4) security patching, with Critical/High CVEs in 7 days and Medium in 30; (5) dependency and toolchain currency (Kotlin, Swift, Gradle, Xcode) with the compatibility matrix kept current in CI. A documented upgrade playbook in `docs/maintainers/` covers the procedure for moving the SDK to a new Canton, Splice, or OS-major version, so the work does not depend on a single person.

Issue and PR SLAs: Critical (security, signing correctness, broken install) 48h response and 7-day fix; Normal 7-day response and 30-day fix; external contributor PRs reviewed within 7 days.

If we become unavailable, the work degrades gracefully: published artefacts remain resolvable, CI and the conformance suite are public, and `docs/maintainers/` documents the release and DAR-bindings pipelines. A stewardship transfer is initiated if our capacity to maintain at the committed cadence is impaired, or by mutual agreement; under that model the GitHub repository and the Maven Central artefact coordinates transfer to the canton-foundation organisation, with a 30-day handover. Following the DA Canton OSS Maintenance and Splice Wallet Kernel Maintenance (400,000 CC/month) precedents, we intend to file a continuation maintenance grant per CIP-0100 at month 3 post-launch; the indicative monthly ask sits well below the Wallet Kernel line.

---

## Co-Marketing

Upon release, VertexPoint Labs will collaborate with the Foundation on: an announcement and a "first Canton transaction from an iPhone in 10 minutes" walkthrough; a reference-wallet case study covering external-party custody on device; developer enablement (quickstarts, recorded demos, office hours); coordinated posts with adopting wallet and exchange teams at each M4 tranche; and a reference-wallet workshop and mobile-track support at the next Canton hackathon.

---

## Motivation

The Foundation's own developer survey (quoted in Dev Fund #90) records demand for a mobile wallet form factor and names key management and signing flows as the hardest part of building on Canton. Dev Fund #90 closes the browser half of that request; nothing closes the mobile half. Every consumer-facing wallet on the network today, and every exchange with a retail surface, ships mobile apps; none of them can currently do so against Canton without hand-rolling the client, custody, and connectivity layers this SDK provides.

Estimated portion of the ecosystem benefiting: every wallet provider and exchange with a consumer surface (the network's six live wallets to start, per Dev Fund #9), plus the share of dApps targeting retail users on phones. The per-event M4 structure means the Foundation pays for exactly the adoption that materialises.

---

## Rationale

**Why an SDK at all, when a phone can call the JSON API directly.** The SDK contains no Daml; contracts stay on the ledger. Reading the ledger over HTTP is the easy tenth of the job. The other nine tenths live client-side and are what every team currently re-implements: generating a key in the secure element and formatting its signatures for the ledger, signing the onboarding `multiHash` and the prepared-transaction hash correctly, command de-duplication and recovery when the OS kills the app mid-submit, the token-standard choice-context and disclosed-contract flows, and answering CIP-0103 signing requests from dApps. None of that is a REST call. The same split holds on every chain: contracts execute on nodes, yet mobile teams build on client SDKs, because keys, signing, and protocol quirks live in the client.

**Why fund this when Canton wallet apps are already in the app stores.** The mobile wallets that exist today prove the demand; they do not remove the problem. Each of those teams wrote its own private Canton client and custody layer; none of that code is shared, security-reviewed, or maintained for anyone else, and each team re-verifies it against every Canton and Splice release on its own. The web-only wallets and every future entrant still face the full cost from zero. Shipped apps have also not produced a connectivity layer: no Canton dApp can hand a signing request to any of those wallets on a phone today, because each app is an island without the CIP-0103 surface. The grant does for mobile what the Go, C#, and Rust grants did for their runtimes: it replaces private, unaudited implementations of the same layer with one public, maintained, security-reviewed one, and adds the connectivity surface no single wallet has an incentive to build alone. Funding an incumbent wallet team to open-source its client would not produce this either: each existing implementation is embedded in one app and shaped by one product's choices, none is structured as a reusable library, and a product-neutral SDK is what lets all of them, incumbents included, converge on one audited layer.

**Why native Swift and Kotlin rather than a cross-platform framework.** PartyLayer (Dev Fund #9) already serves React Native teams at the JS framework layer. Institutional wallet and exchange teams ship native apps: secure-element APIs, biometric gating, and app-store review posture are native surfaces, and security review of a custody path is materially simpler without a JS bridge in the middle. A native SDK also gives cross-platform frameworks something to bind to later (deferred React Native / Flutter bridges).

**Why a shared protocol core instead of two independent codebases.** The protocol layer is the part that changes with every Canton and Splice release; implementing it once is what makes the 30/60-day compatibility SLAs credible for a small team, the same reasoning Dev Fund #46 applied when it wrapped `daml-lf-archive` once rather than reimplementing LF decoding. The parts where platform-native quality matters (API idiom, cryptography, biometrics) are duplicated deliberately and natively.

**Why pre-built Splice bindings, not a full codegen CLI, in v1.** Mobile clients overwhelmingly consume the token standard plus one known application DAR. Pre-built, CI-refreshed bindings cover that need without committing this grant to a second codegen toolchain; the CLI is scoped for continuation once the runtime surface is proven. Dev Fund #46 staged its `dpm` component the same way.

**Why anything new is built at all.** The default approach is to extend what exists, and this proposal does: it is a client of the Wallet Gateway, follows the Splice Wallet Kernel's external-signing patterns, implements the CIP-0103 method surface over its WalletConnect transport and contributes the mobile transport binding upstream as a public specification. There is no existing component to extend for the platform surfaces themselves: no Canton code targets iOS or Android today.

### Why us

**VertexPoint Labs LLC**, operating as **TrustedPoint**, has run Proof-of-Stake validator infrastructure since 2020.

Track record:

- Operating validators since 2020 across 9 PoS networks: Sui, Story, Ika, Somnia, Walrus, Initia, Celestia, Zetachain, Monad.
- $350M+ in staked assets secured across our validators.
- 19,000+ delegators across nine networks.
- Hands-on Canton engineering: production integration experience with the JSON Ledger API v2 against cn-quickstart deployments, including the Featured App reward flow end to end, and Canton validator operations on DevNet.

Reliability and security are our day job. We run a monitored 24/7 validator fleet across nine networks, and Canton and Splice release tracking folds into that same monitoring discipline, which is why the maintenance SLAs in this proposal are realistic for a team our size. The committee accepted the same argument from the validator team behind NODERS Funding Proposal #38. The build is staffed with dedicated iOS and Android engineers alongside our Canton integration experience, and the funding structure prices mobile execution risk in instead of asking the committee to take it on trust: the Milestone 1 proof of concept and the dual-scheme Milestone 2 demonstration put working software on stock devices in front of the committee while more than 90% of the grant is still ungated, and no adoption tranche opens before platform parity, custody, and connectivity have all been accepted.

We prefer to participate in the Canton ecosystem directly, not only as an infrastructure vendor: building the mobile layer extends our stake in the network's adoption to the devices its end users hold.

Channels: [trusted-point.com](https://trusted-point.com) · [github.com/trusted-point](https://github.com/trusted-point) · [twitter.com/Trusted_Point](https://twitter.com/Trusted_Point) · [t.me/TrustedPointCorp](https://t.me/TrustedPointCorp)
