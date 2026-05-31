## Development Fund Proposal

**Author:** Jatin Sahijwani, Anirudh Singh (HackTour India)
**Status:** Submitted
**Created:** 2026-05-31
**Label:** daml-tooling

**Champion:** Engagement initiated with Canton Foundation DevRel; daml-tooling SIG review path identified per direction from Jatin Pandya (forum thread 8668). Champion confirmation pending committee process.

---

## Abstract

Canton Bindings delivers production-grade Java/Kotlin and Rust client SDKs for the Canton Network, a polyglot JWT/OIDC authentication toolkit with first-class presets for Keycloak, Auth0, Azure AD, and Okta, and a pre-flight transaction byte-size and Canton Coin cost profiler. The proposal is targeted at the institutional Java/Kotlin developer cohort — the same JVM-heavy teams behind DTCC, Goldman, HSBC, BNY Mellon, and Broadridge — and the high-performance Rust services cohort that sits adjacent to them.

The scope is deliberately narrow and complementary. After reviewing every open and merged Dev Fund proposal, this work is explicitly scoped to fill the runtime-layer gaps that no other proposal addresses: there is no Java/Kotlin SDK in flight, no Rust SDK in flight, no proposal for first-class JWT/OIDC middleware (the single most-cited pain point for "Hybrid and TradFi teams" in the Foundation's Q1 2026 Developer Experience and Tooling Survey), and no pre-flight cost estimation tooling. Canton Bindings ships as a Cantool plugin (`cantool bindings gen <lang>`) so the work integrates cleanly with Eric Mann's CLI rather than competing with it.

Total requested funding: **850,000 CC** across 4 milestones over approximately 36 weeks, with adoption-tied payments in the final milestone to align Foundation outlay with real ecosystem uptake.

---

## Specification

### 1. Objective

**Problem.** The Foundation's Q1 2026 Developer Experience and Tooling Survey identified three concrete, repeatedly-cited friction points that today have no dedicated infrastructure. Quoted directly from the report:

> "Typed Client SDK & Code Generator: Developers currently spend days manually extracting hash strings from compiled files (.dar) and hardcoding them into their frontends. They also struggle significantly with implementing JWT authentication middleware, which is a repeated friction point for 'Hybrid' and 'TradFi' teams."

> "Pre-Flight Resource & Cost Profiler: Developers often deploy 'blindly,' only discovering that their transactions are too large (hitting byte-size limits) or too expensive after they fail in a testnet or production environment."

The institutional cohort behind 83% of Canton survey respondents — TradFi and Hybrid teams — runs the JVM. DTCC, Goldman, HSBC, BNY Mellon, Broadridge, and the rest of the institutional super-validator and dApp landscape ship production services in Java and Kotlin. Today, those teams either hand-write gRPC clients against the Canton Ledger API, maintain bespoke wrappers around the JSON API, or work around the absence of first-party JVM tooling at significant engineering cost.

The Rust cohort is smaller in headcount but disproportionately important. It is the cohort building performance-sensitive infrastructure adjacent to Canton: indexers, validators, oracle relays, market-making engines. Rust-native bindings unlock a class of integrations that today require process boundaries and serialization overhead.

The auth and profiler gaps cross-cut both languages and every other language community on Canton. JWT/OIDC verification is reinvented in every TradFi codebase. Pre-flight cost estimation does not exist.

**Outcome.** A complete, maintained Canton client SDK stack — `canton-bindings-cli` codegen binary, Java/Kotlin and Rust runtime libraries, JWT/OIDC middleware with presets for Keycloak, Auth0, Azure AD, and Okta, a pre-flight profiler library, and a Cantool plugin — that is open source under Apache-2.0, production-grade, security-audited, and adopted by application teams shipping institutional workloads on Canton.

**Success looks like.** A Canton developer building a Spring Boot or Ktor service can add a Maven dependency, point at LocalNet, and submit their first transaction in under 10 minutes. A TradFi team running Keycloak, Auth0, or Azure AD can add Canton support to their existing identity stack with a single middleware module and no custom JWT verification code. A developer can call `profiler.estimate(commands)` and get a credible cost and byte-size estimate before submitting to the ledger. By the end of Milestone 4, at least three independent TradFi/Hybrid teams have shipped a production workload on Canton Bindings, verified by a public showcase.

### 2. Relationship to other Development Fund work

We have read every open and merged proposal in this repository and engaged the relevant community channels (forum, grants-discuss) before submission. Canton Bindings is scoped to be complementary to, not competitive with, the existing pipeline.

| Existing proposal / project | Their lane | What Canton Bindings does |
|---|---|---|
| **DA — Canton Network dApp SDK and Tooling** (PR for `2026-03-DA-Canton-Network-dapp-sdk-and-tooling.md`) | TypeScript/JavaScript dApp SDK, CIP-0103 wallet connectivity, WalletConnect, Wallet Discovery | We do **not** ship a TypeScript SDK. JVM/Rust only. We do not touch the wallet connectivity layer. |
| **Noders LLC — Go DAML SDK + Go Wallet SDK + DAZL contributions** (`2026-03-Noders LLC-go-sdks.md`) | Go SDK + Go Wallet SDK + Python DAZL upstream | We do **not** ship Go bindings. We do **not** ship Python bindings. Noders' DAZL contributions remain the canonical Python path. |
| **Peaceful Studio — C#/.NET SDK** (`2026-03-Peaceful Studio-csharp-dotnet-sdk.md`) | C#/.NET SDK | We do **not** ship C#/.NET bindings. |
| **Cantool** (`2026-03-CCTools-cctools.md`) | Local dev loop CLI: `init`, `build`, `test`, `dev`, env profiles, MCP server | Milestone 4 ships a `cantool-bindings` plugin so our codegen is available as `cantool bindings gen <lang>`. Designed to require zero changes to Cantool core, per Cantool's published plugin specification. |
| **BitDynamics DevKit** (`2026-05-BitDynamics-devkit.md`) | Local environment lifecycle | Out of our scope. Canton Bindings runs on top of any local environment the developer chooses. |
| **CantonTrace** (PR #185) | Runtime visual debugger, transaction tracing, static analyzer | Runtime debugging is out of scope. Canton Bindings is the type-safe client; CantonTrace observes what it produces. |
| **PartyLayer (PR #9), Wallet Gateway (PR #109)** | End-user wallet UX, signing services | We sit on the server / service side, not the wallet side. |
| **Kaiko Data Standard** (`2026-05-Kaiko-data-standard.md`) | DAML interface for on-ledger data point publication | Orthogonal. Canton Bindings consumers can use Kaiko-standard data points like any other ledger contract. |
| **`daml codegen js` (Digital Asset)** | TypeScript only, no runtime resolver, no auth presets | Out of our scope. We do not touch the TypeScript codegen path. |
| **DAZL (Digital Asset)** | Python client | Out of our scope. Noders is already improving DAZL. |

This is a deliberately empty quadrant of the Canton developer ecosystem: production JVM and Rust client tooling, with cross-cutting auth and cost-estimation. Funding Canton Bindings closes that quadrant.

### 3. Implementation Mechanics

**Codegen pipeline.** A Rust binary, `canton-bindings-cli`, consumes a `.dar` archive, decodes the Daml-LF via the existing community parser, and emits a language-agnostic Typed IR. Per-language emitters consume the IR and produce idiomatic packages. The IR layer is the key technical decision: it lets each emitter ship ergonomic code (Kotlin sealed classes for choice variants, Rust `enum`s with discriminant matching) rather than a lowest-common-denominator translation.

**Java / Kotlin runtime.** Maven Central distribution. Built on the official `com.daml:bindings-java` low-level layer where it exists, and on direct gRPC + JSON API otherwise. Idiomatic Kotlin API with coroutines support; idiomatic Java API for teams on JDK 17+. Spring Boot autoconfiguration and Ktor module shipped as separate artifacts so consumers pay only for what they use.

**Rust runtime.** crates.io distribution. `tokio`-native async surface. `prost`-based protobuf decoding for ledger types. Strong-typing via the codegen IR.

**Runtime Package ID Resolver.** Each runtime ships a resolver that, at application startup, queries the participant's `PackageManagementService.ListKnownPackages`, matches discovered packages against metadata baked into the generated code at codegen time, and pins the resolution with configurable policy (`exact`, `compatible`, `latest`). This eliminates the "hardcoded SHA-256 hashes" pain explicitly cited in the Q1 2026 survey. Default policy is `exact` pinning; `compatible` and `latest` require explicit opt-in and emit warnings.

**JWT/OIDC Auth Kit.** Per-language middleware with JWK fetching over TLS, signature verification (`nimbus-jose-jwt` for JVM, `jsonwebtoken` for Rust), configurable claim-to-party mapping (`email → party`, `groups[] → readAs/actAs`), token refresh and rotation, and pre-built adapters for the four enterprise IdPs that cover the majority share of the institutional cohort: Keycloak (matching cn-quickstart's OAuth2 mode), Auth0, Azure AD, and Okta. Spring Security, Spring Boot, Ktor, and Actix integration examples.

**Pre-Flight Profiler.** A pure-function library that takes a set of commands and a party, serializes them through the same proto wire format the participant uses, applies published Canton Coin cost coefficients bundled at compile time, and returns a `TransactionEstimate` (estimated bytes, estimated CC cost, byte-limit warnings, large-fetch warnings). No network call required for estimation. Cost coefficients are versioned; remote configuration is explicitly out of scope to prevent supply-chain attacks against cost estimation.

**Cantool plugin.** Implemented per Cantool's public JSON-RPC plugin specification. Registers `cantool bindings gen <lang>` and `cantool bindings profile <command>`. Designed to require zero changes to Cantool core, subject to Cantool's published plugin specification at the time of integration. Coordinated publicly with Eric Mann via the canton-dev-fund forum before development begins.

**Operational approach.** Apache-2.0 code, semantic-release publishing, full CI matrix (JDK 17/21, Rust stable/beta, multiple Canton/Daml-LF versions). Security audit in Milestone 3 (see Security section). MAINTAINERS.md and contribution governance committed in Milestone 1; explicit transition plan to community maintainership in Milestone 4.

### 4. Architectural Alignment

**Application-layer additive.** Canton Bindings introduces no protocol changes. It does not require changes to Canton core, Splice, Daml, `dpm`, `daml codegen js`, or any existing Canton dApp. It is forward-compatible with future Daml-LF versions via the IR abstraction layer.

**Ledger settlement as the source of truth.** The Resolver introspects the participant via official `PackageManagementService` endpoints rather than relying on out-of-band package registries. The Profiler uses the same wire format and published cost model the participant itself uses. No central directory, no transaction telemetry.

**Privacy-preserving by default.** No package or transaction metadata leaves the boundary of the participant the application connects to. The Profiler performs estimation entirely in-process.

**CIP alignment.** The work is consistent with the CIP-0103 dApp API direction (DA's proposal) at the wallet/dApp boundary. Canton Bindings sits below that boundary, on the server / service side. No new CIP is required for this work; a future CIP standardizing the IR format may emerge from the community as adoption matures, and we will support that process if invited.

### 5. Backward Compatibility

No backward compatibility impact. Canton Bindings is additive. Existing JVM and Rust applications that integrate Canton via hand-written gRPC clients can continue to do so unchanged; Canton Bindings is opt-in.

---

## Milestones and Deliverables

All milestones paid in Canton Coin upon Committee acceptance per CIP-0100. See the Funding section below for the volatility stipulation appropriate to the project's >6-month duration. Adoption-tied payments in Milestone 4 align Foundation outlay with real ecosystem uptake.

### Milestone 1: Foundation — Java/Kotlin SDK + Resolver + Keycloak JWT

- **Estimated Delivery:** 10 weeks from grant approval
- **Funding:** 250,000 CC upon committee acceptance
- **Focus:** Ship the JVM client surface end-to-end against `cn-quickstart`'s OAuth2 mode. JVM first because it serves the largest institutional cohort and is where the proposal's strongest commercial signal lives.

**Deliverables / Value Metrics:**
- `canton-bindings-cli` binary (Rust) consuming `.dar` archives and emitting a Maven artifact containing typed Java + Kotlin client code, published to Maven Central.
- `io.cantonbindings:runtime-jvm` artifact with the Package ID Resolver, configurable pinning policy, and refresh hooks.
- `io.cantonbindings:auth-jvm-keycloak` artifact with Spring Security integration, party-claim mapping, and token refresh.
- Public GitHub repository under Apache-2.0 with CI (JDK 17 + JDK 21 + LocalNet), semantic-release publishing, MAINTAINERS.md, and a CONTRIBUTING guide.
- End-to-end Spring Boot demo: a concise service that authenticates a user via Keycloak, resolves the IOU package against LocalNet's `PackageManagementService`, and submits a transfer.
- Documentation site scaffolding (Docusaurus) with installation and quickstart pages live.

**Acceptance criteria:**
- A committee delegate can install the published Maven artifacts, point at LocalNet, and submit a transfer using the documented quickstart, with no manual configuration beyond a credentials file.
- Generated Kotlin code uses sealed classes for choice variants and passes our published detekt baseline configuration with no high-severity findings.
- Resolver pins and caches the IOU package against LocalNet's `PackageManagementService` and demonstrates correct behavior under a package upgrade.
- All deliverables verifiable via public `make` targets in the repo.

### Milestone 2: Rust SDK + Auth0 + Azure AD presets

- **Estimated Delivery:** 8 weeks after M1 acceptance
- **Funding:** 200,000 CC upon committee acceptance
- **Focus:** Complete the Rust language surface and broaden enterprise IdP coverage to Auth0 and Azure AD — the two IdPs most commonly cited by institutional cohorts after Keycloak.

**Deliverables / Value Metrics:**
- Rust bindings published to crates.io: `tokio`-native, `prost`-based decode, full feature parity with M1.
- Auth0 preset implemented for JVM and Rust (Spring Security and Actix integrations).
- Azure AD preset implemented for JVM and Rust, tested against a public Azure AD tenant operated by the team for verification.
- End-to-end Actix demo mirroring the M1 Spring Boot demo.
- Migration guide for teams currently hand-rolling gRPC clients in JVM or Rust.

**Acceptance criteria:**
- IOU transfer demo runs identically in Java, Kotlin, and Rust with semantically equivalent code.
- Auth0 and Azure AD presets successfully authenticate against live tenants in acceptance testing, demonstrated via a recorded reproducible run.
- Rust SDK passes `cargo clippy -- -D warnings` and `cargo audit` with no high-severity findings.

### Milestone 3: Security Audit, Okta, Pre-Flight Profiler

- **Estimated Delivery:** 8 weeks after M2 acceptance
- **Funding:** 220,000 CC upon committee acceptance (of which ~150,000 CC covers third-party audit fee; remainder covers Okta integration, profiler implementation, and remediation)
- **Focus:** Establish a third-party-validated security baseline and ship the pre-flight cost-estimation library that the Q1 survey explicitly called out.

**Deliverables / Value Metrics:**
- Third-party security audit of `canton-bindings-cli`, JVM runtime, Rust runtime, and auth presets. Vendor pre-quoted (e.g., Cure53, Trail of Bits, or equivalent). Audit scope agreed with the Foundation Security Subcommittee and published before audit begins.
- Okta preset implemented for JVM and Rust.
- Pre-Flight Profiler library in both languages with byte-size and CC cost estimation. Cost coefficients versioned and bundled at compile time.
- Profiler accuracy validated against actual submission costs on TestNet with a published test report covering a representative sample of at least 50 transactions, against the Canton Coin cost coefficient version current at the time of the M3 audit.
- All critical findings remediated; high findings either remediated or formally accepted with documented rationale; medium and low findings documented with rationale.
- Patched releases of all artifacts with changelog entries referencing the audit.

**Acceptance criteria:**
- External audit report received and publicly summarized; all critical findings remediated; high findings either remediated or formally accepted with documented rationale, per the Foundation Security Subcommittee's review.
- Profiler estimates within ±15% of actual submitted cost on the published representative sample, against the Canton Coin cost coefficient version current at audit completion.
- Profiler correctly warns when a transaction exceeds the configured participant max command size.

### Milestone 4: Cantool Plugin + Adoption + Maintainer Handoff

- **Estimated Delivery:** 10 weeks after M3 acceptance
- **Funding:** 180,000 CC fixed (paid on delivery per the fixed-portion acceptance criteria below) + independent adoption-tied bonus of 25,000 CC per qualifying production adopter, capped at 6 adopters (maximum 330,000 CC total for M4). Fixed and bonus portions are evaluated separately.
- **Focus:** Ship the Cantool plugin, complete the documentation and developer education stack, and demonstrate real ecosystem adoption. Adoption-tied payment structure follows the precedent of Kaiko (per-adopter) and Digital Asset (adoption progress reports).

**Deliverables / Value Metrics:**

Fixed-portion deliverables:
- `cantool-bindings` plugin (Go, per Cantool's JSON-RPC plugin spec) registering `cantool bindings gen <lang>` and `cantool bindings profile`.
- Full documentation site (Docusaurus) live on GitHub Pages.
- Two end-to-end tutorials with verifiable working code: (a) "Build a Canton TradFi service with Spring Boot + Keycloak + Canton Bindings in 30 minutes" and (b) "Migrate a hand-rolled gRPC Canton client to Canton Bindings."
- Two live hands-on workshops run through the HackTour India community channel during the grant period.
- MAINTAINERS.md with explicit transition plan to community maintainership.
- Public handoff session with Canton Foundation DevRel and the Cantool team.

Adoption-tied bonus structure (25,000 CC per qualifying adopter, max 6):
- A "qualifying production adopter" is an independent team (not affiliated with the proposing team) that has shipped a production workload on either Canton MainNet or a production-track environment using Canton Bindings, verifiable via a public PR, blog post, or named attestation accepted by the Committee.
- Up to 6 adopters paid out at 25,000 CC each. Payment released per adopter upon Committee acceptance of evidence, not in bulk.
- Rationale: Foundation pays for actual ecosystem outcomes, not just delivery of code. Aligns with Kaiko's per-adopter precedent and DA's adoption-reporting precedent.

**Acceptance criteria (fixed-portion, 180,000 CC):**
- `cantool bindings gen kotlin` works end-to-end on a fresh Cantool install, subject to Cantool's published plugin specification at the time of integration.
- Documentation site is publicly live.
- Both end-to-end tutorials are publicly accessible with verifiable working code.
- Both HackTour India workshops have been run and recordings or recap notes are publicly available.
- Maintainer handoff session has been held with Canton Foundation DevRel and the Cantool team, with public meeting notes.

**Acceptance criteria (adoption-tied bonus, up to 150,000 CC):**
- The bonus is independent of fixed-portion acceptance. Each qualifying production adopter, upon Committee acceptance of evidence, triggers a 25,000 CC payout, capped at 6 adopters. Zero adopters in the M4 window does not affect fixed-portion payment.

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone
- Demonstrated functionality or operational readiness
- Documentation and knowledge transfer provided
- Alignment with stated value metrics — emphasizing ecosystem adoption over artifact delivery

Project-specific acceptance conditions:

- **Milestone 1:** Maven Central artifacts published; Spring Boot demo runs against LocalNet via public `make` target; Keycloak auth flow verifiable end-to-end.
- **Milestone 2:** crates.io artifacts published; Auth0 and Azure AD presets verified against live tenants; Actix demo runs end-to-end.
- **Milestone 3:** External audit report received and publicly summarized; critical findings remediated and high findings handled per the M3 milestone-level acceptance criteria; Profiler accuracy report published.
- **Milestone 4 (fixed):** Cantool plugin verifiable on fresh install; documentation site live; both tutorials publicly accessible; both HackTour India workshops run; handoff session held.
- **Milestone 4 (adoption bonus):** Independent of fixed-portion acceptance. Per-adopter payout (25,000 CC) released upon Committee acceptance of evidence, capped at 6.

---

## Funding

**Total Funding Request:** 850,000 CC (fixed) + up to 150,000 CC (adoption-tied bonus in M4) = up to **1,000,000 CC maximum**

### Payment Breakdown by Milestone

| Milestone | Description | Fixed Payment | Adoption Bonus |
|---|---|---|---|
| M1 | JVM SDK + Resolver + Keycloak | 250,000 CC | — |
| M2 | Rust SDK + Auth0 + Azure AD | 200,000 CC | — |
| M3 | Security Audit + Okta + Profiler | 220,000 CC | — |
| M4 | Cantool Plugin + Adoption + Handoff | 180,000 CC | up to 150,000 CC (25,000 CC × up to 6 adopters) |
| **Total** | | **850,000 CC** | **up to 150,000 CC** |

### Anchoring rationale

This proposal sits in a defensible middle of the funded landscape:

- Below **Noders Go SDKs (2,260,000 CC)** because they include retroactive recognition of substantial sunk cost; ours is greenfield.
- Far below **DA dApp SDK (8,170,000 CC)** which spans an entire wallet+dApp connectivity layer plus first-party audits and adoption support.
- Above **Axcess (~318,000 CC)** because Axcess is a single-author single-application project; ours is multi-language infrastructure with a third-party audit milestone.
- Comparable in spirit to **Kaiko Data Standard (1,300,000 CC + adoption bonuses)**: a focused ecosystem-infrastructure proposal with adoption-tied payments.

### Use of Funds

The grant covers categories of expenditure that would not otherwise be funded as commercial work:

- **Engineering time:** Codegen IR design, JVM and Rust runtime implementation, JWT/OIDC middleware across four IdPs, pre-flight profiler implementation, and the Cantool plugin. Requires senior engineering capacity with prior production SDK delivery experience.
- **Third-party security audit:** External audit fee in Milestone 3, scoped against the Foundation Security Subcommittee.
- **Documentation and developer education:** Docusaurus site, two end-to-end tutorials, and two live workshops via HackTour India.
- **Ecosystem adoption support:** Direct integration help for the first cohort of TradFi/Hybrid adopters; office hours; GitHub issue triage during the grant period.
- **Maintainer handoff:** Governance scaffolding, MAINTAINERS.md, contribution guide, and a documented transition plan to community maintainership.

### Volatility Stipulation

Project duration is approximately 36 weeks (~8.3 months). Per CIP-0100, as the project extends beyond 6 months, the grant is denominated in fixed Canton Coin with a formal re-evaluation at the 6-month mark to assess scope, delivery progress, and macro CC/USD conditions. The proposer assumes price volatility risk between milestones, consistent with the pattern set by Digital Asset's dApp SDK proposal.

### Timeline Accountability

- **Acceleration bonus:** If the entire project (through Milestone 4 fixed-portion deliverables) is delivered and accepted 30 days ahead of the cumulative estimated delivery, a +5% bonus on the M4 fixed payment is awarded. Mirrors the pattern in DA's dApp SDK proposal.
- **Late penalty:** For every 30 days of delay beyond the estimated delivery date for any milestone, the fixed payment for that milestone is reduced by 5%, capped at 20% per milestone. Mirrors the same DA proposal.

---

## Co-Marketing

Upon each milestone delivery, the team will collaborate with Canton Foundation DevRel on coordinated announcements:

- **Milestone 1 announcement:** "Production Canton SDK for Java and Kotlin — ship a TradFi service with Spring Boot + Keycloak in 30 minutes"
- **Milestone 2 announcement:** "Canton on Rust + Auth0 and Azure AD presets — cost-aware infrastructure for the institutional cohort"
- **Milestone 3 announcement:** "Audited Canton Bindings + the Pre-Flight Profiler — production safety for institutional workloads"
- **Milestone 4 announcement:** Cantool integration, full tutorial series, and case studies from early adopters

The HackTour India community channel ([x.com/HackTourIND](https://x.com/HackTourIND), 50+ events in 2025) will amplify each announcement and run two live hands-on workshops for Canton Bindings during the grant period, integrated into HackTour India's 2026 calendar. Coordination with the Canton Marketing Committee is requested but not assumed.

---

## Motivation

83% of Canton developers per the Foundation's Q1 2026 survey identify as TradFi or Hybrid. The institutional partners behind those teams — DTCC, Goldman Sachs, HSBC, BNY Mellon, Visa, Broadridge — overwhelmingly run JVM-based production stacks. Today, when those teams ship a Canton workload, they either rebuild low-level gRPC client wiring per project or wait for an SDK that does not exist.

Canton Bindings closes that gap. The JVM is where the institutional super-validators and their counterparties actually deploy code. Java/Kotlin as the lead language is therefore not an arbitrary choice — it is the language of the cohort Canton's growth strategy depends on.

Rust is the supporting language for a smaller but structurally important cohort: performance-sensitive infrastructure that sits adjacent to Canton (oracle relays, indexers, market engines). A first-party Rust SDK unlocks a class of integrations that currently incur process-boundary cost.

JWT/OIDC middleware is the single most-cited friction point for the entire institutional cohort, irrespective of language. Solving it once, with first-class presets for the four IdPs covering the majority enterprise share, removes a real adoption blocker.

The pre-flight cost profiler moves Canton closer to the production-readiness bar that enterprise teams expect by default. Operating Canton in production requires understanding cost, and today the only path is empirical trial-and-error on testnet.

The expected portion of the ecosystem that benefits is concretely large. Per the Foundation's own survey, the JVM-leaning TradFi/Hybrid cohort is the majority. JWT/OIDC and pre-flight estimation benefit every cohort. The four IdP presets cover the dominant enterprise identity share. Adoption is not speculative — we have measurable channels (HackTour India community + active outreach to the survey-tagged TradFi cohort) and have built-in adoption-tied payment structure to align Foundation outlay with real uptake.

---

## Rationale

**Why these specific languages.** Java and Kotlin are the languages of the institutional cohort Canton's strategy depends on. No proposal in the current pipeline addresses them. Rust is the language of the performance-sensitive adjacent cohort, also unaddressed. We deliberately do not propose TypeScript (Digital Asset's dApp SDK proposal covers it), Go (Noders LLC's proposal covers it), Python (DAZL exists and is being improved by Noders), or C#/.NET (Peaceful Studio's proposal covers it). This proposal is the empty quadrant of the language matrix.

**Why a Cantool plugin, not a Cantool replacement.** Cantool occupies the local dev loop lane and Eric Mann is iterating with the Committee. The right move for the ecosystem is integration, not duplication. The Milestone 4 plugin is designed to require zero changes to Cantool core (subject to Cantool's published plugin specification) and gives Cantool's user base access to our codegen as a first-class extension.

**Why first-party JWT presets, not a generic JWT library.** Generic JWT libraries exist for every language. What does not exist is a Canton-aware JWT middleware that maps IdP claims to ledger party and `readAs`/`actAs` semantics, with verified configurations for the IdPs the institutional cohort actually runs. The presets are the deliverable; the underlying JWT verification leverages well-audited per-language libraries (`nimbus-jose-jwt` for JVM, `jsonwebtoken` for Rust). This is the same pattern as Auth0's SDK ecosystem and is the only pattern that scales.

**Why a security audit milestone.** Two of the three components have non-trivial security surface (JWT verification, runtime package resolution). A first-party audit before any institutional team adopts the code is the right risk posture. Setting it as a distinct, externally-validated milestone gives the Committee independent verification without requiring internal Foundation engineering review.

**Why adoption-tied payments in M4.** Foundation funds should align with outcomes, not just artifacts. Kaiko's Data Standard proposal already established this precedent (per-client adoption payment); Digital Asset's dApp SDK proposal uses adoption reporting as a required deliverable. Canton Bindings adopts the same pattern with a tighter, easier-to-verify metric (qualifying production adopter, capped at 6).

**Why this team.** We have previously delivered two foundation-funded developer SDKs structurally identical to this proposal: a production-grade ZK SDK for Arbitrum (Arbitrum Foundation grant — TypeScript SDK that abstracts an entire crypto-native artifact (.circom) into a single-call integration) and a ZK SDK for Avalanche subnets (Avalanche Team1 mini-grant). These are the closest available proxies for our ability to deliver Canton Bindings — same shape of project (typed SDK that turns a heavy format-specific artifact into a one-call integration), same lead language (TypeScript on prior work; Java/Kotlin and Rust here), same target user (application developers, not protocol engineers). Between us we have 15+ hackathon wins across the EVM, Polkadot, Avalanche, and broader L1 ecosystems. HackTour India ([x.com/HackTourIND](https://x.com/HackTourIND)) provides built-in distribution to the Indian Web3 developer cohort — exactly where Canton's next 1,000 builders are most likely to come from.

We are new to Daml/Canton, deliberately. That makes us aligned with the 71% of Canton developers who come from an EVM background per the Foundation's own survey. We will hit every Daml/Canton onboarding friction point in real time as we build, which means the SDK ergonomics will be calibrated against fresh, honest user experience rather than against years of accumulated Daml intuition. Milestone 1 deliberately ships the JVM language surface first — where we have deepest expertise on similar work — so the Committee has an early, complete signal on delivery quality before later milestones commit larger sums.

---

## Pre-PR community engagement

- Canton Network Forum RFC: https://forum.canton.network/t/rfc-canton-bindings-multi-language-sdks-jwt-oidc-pre-flight-profiler/8668
- grants-discuss mailing list thread: https://lists.sync.global/g/grants-discuss/topic/rfc_canton_bindings/119439952
- Direction to proceed with PR received from Canton Foundation DevRel (Jatin Pandya) on forum thread 8668 with explicit commitment to daml-tooling SIG review and security review.
- Full design document and architecture diagrams: https://github.com/jatinsahijwani/canton-bindings/blob/main/README.md

---

## References

- Canton Foundation Grants Program: https://canton.foundation/grants-program/
- CIP-0082 (5% Development Fund): https://github.com/canton-foundation/cips/blob/main/cip-0082/cip-0082.md
- CIP-0100 (Governance & Review Process): https://github.com/canton-foundation/cips/blob/main/cip-0100/cip-0100.md
- Canton Q1 2026 Developer Experience and Tooling Survey Analysis: https://forum.canton.network/t/canton-network-developer-experience-and-tooling-survey-analysis-2026/8412
- Foundation SIG Directory: https://github.com/canton-foundation/canton-dev-fund/blob/main/sig-directory.md

---

## Changelog

- **2026-05-31:** Initial proposal submission. Scope refined from the original 5-language proposal posted on grants-discuss and the Canton Network Forum to focus on the Java/Kotlin and Rust language surfaces that no current proposal addresses; Go, TypeScript, Python, and C#/.NET are explicitly out of scope to avoid overlap with in-flight proposals from Noders LLC, Digital Asset, and Peaceful Studio. Milestone timelines extended (10/8/8/10 weeks; ~36 weeks total) to reflect realistic delivery cadence accounting for a third-party security audit cycle in Milestone 3 and adoption-cycle time for Milestone 4 bonus triggers.