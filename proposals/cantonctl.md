## Development Fund Proposal

**Author:** Merged One
**Status:** Submitted
**Created:** 2026-03-31
**Updated:** 2026-04-02

**Repositories:**
- [merged-one/cantonctl](https://github.com/merged-one/cantonctl) -Splice-aware CLI for deploying, operating, and promoting Canton applications
- [merged-one/cantonjs](https://github.com/merged-one/cantonjs) -Type-safe TypeScript SDK for Canton Ledger API V2 and Splice APIs

**npm packages:**
- [`cantonctl@0.3.3`](https://www.npmjs.com/package/cantonctl) -`npm install -g cantonctl`
- [`cantonjs@0.3.1`](https://www.npmjs.com/package/cantonjs) -`npm install cantonjs`

---

## Abstract

This proposal delivers two tools that fill the operational and SDK gaps in the Canton/Splice developer ecosystem:

| Tool | Role | Status |
|------|------|--------|
| **cantonctl** | Splice-aware CLI for deployment, environment management, and Splice API access | Published v0.3.3, Splice support in progress -30+ commands |
| **cantonjs** | Type-safe TypeScript SDK for Canton Ledger API V2 and Splice APIs | Published v0.3.1 -8 packages |

**Where official tools stop, these tools start.** DPM handles Daml compilation and testing. Daml Studio handles IDE workflows. CN Quickstart provides a reference application and LocalNet. But no official tool deploys DARs to remote nodes, manages multi-environment auth, provides CLI access to Splice APIs, or offers a type-safe TypeScript client for the Ledger API V2.

The Q1 2026 Canton Developer Experience Survey confirms the gap: **41% of developers** cited environment setup as the task that took the longest to get right, and "Local Development Frameworks" was rated as the single most critical tooling gap.

**Both tools are in active development.** cantonctl and cantonjs are published on npm with automated release pipelines.

---

## Specification

### 1. Objective

**Problem:** Canton's official tools (DPM, Daml Studio, CN Quickstart) serve Daml authoring and local development well, but significant gaps remain in the journey from local artifacts to running on real Canton/Splice environments:

- **No deployment CLI.** DPM has no `upload-dar` command. Deploying DARs, allocating parties, and configuring nodes on DevNet/TestNet/MainNet requires raw curl or gRPC calls.
- **No Splice API tooling.** Scan, Validator, ANS, and Token Standard APIs have OpenAPI specs but no CLI and no maintained client libraries.
- **No TypeScript Ledger API V2 client.** The deprecated `@daml/ledger` targets API v1. Official guidance is to generate raw stubs from OpenAPI specs.
- **No environment promotion workflow.** No profile-driven configuration, preflight checks, or CI/CD integration for moving between sandbox, LocalNet, DevNet, and MainNet.

**Intended Outcome:** Two tools that complement official tooling by covering the operational and SDK layers:

- **cantonctl** -deploy, promote, and operate Canton/Splice applications across environments. Wraps DPM for compilation. Wraps CN Quickstart for LocalNet. Adds deployment pipelines, Splice API access, profile-driven auth, and CI/CD integration.
- **cantonjs** -type-safe TypeScript client for Canton Ledger API V2 and Splice APIs. Fills the gap left by the deprecated `@daml/ledger` with modern function-based exports, streaming, codegen, React hooks, and typed Splice API clients.

### 2. Implementation Mechanics

**cantonctl** (TypeScript, oclif framework):
- 30+ commands across Canton and Splice surfaces: init, dev, build, test, deploy, console, status, auth, clean, doctor, serve, playground, profiles, scan, token, ans, validator, localnet, codegen, compat
- Profile-based runtime configuration: sandbox, canton-multi, splice-localnet, remote-validator, remote-sv-network
- Multi-node Docker topology via `dev --full` (Canton-only)
- Splice LocalNet workspace wrapper (`localnet up/down/status`)
- Stable Splice command surfaces: scan (updates, ACS, current-state), token (holdings, transfer), ANS (list, create), validator (traffic-buy, traffic-status)
- Upstream spec sync and generated type artifacts from Canton and Splice OpenAPI/OpenRPC specs
- Profile-aware auth system: env-or-keychain-jwt, bearer-token, oidc-client-credentials, localnet-unsafe-hmac
- Compatibility checking against upstream tracked surfaces (`compat check`)
- Canton IDE Protocol server (REST + WebSocket) with profile-aware serve and playground
- Browser playground with Monaco editor, dynamic Daml template forms, multi-party split view, topology visualization
- 8 project templates including 3 Splice-aware scaffolds (splice-token-app, splice-scan-reader, splice-dapp-sdk)
- Service adapter layer with clear stable/experimental boundaries
- Auto-build on startup, proposal/accept workflow template

**cantonjs** (TypeScript, zero runtime dependencies):
- Three client types: `createLedgerClient()`, `createAdminClient()`, `createTestClient()`
- Function exports (tree-shakeable, ESM + CJS)
- Pluggable transports: HTTP JSON API, gRPC via ConnectRPC, failover
- Type-safe codegen from Daml DAR files (`cantonjs-codegen`)
- Real-time WebSocket streaming with auto-reconnect
- React hooks via `cantonjs-react` (TanStack Query)
- Splice ecosystem packages: Scan, Validator ANS, Token Standard (CIP-0056), wallet adapters (CIP-0103)
- Mock transports, recording transports, and Canton sandbox fixtures for testing (100% coverage enforcement)
- Structured errors with machine-readable codes (CJ1xxx-CJ3xxx) and recovery hints

### 3. Ecosystem Fit

These tools complement, not replace, the official Canton/Splice tooling:

| Official Tool | What It Covers | What cantonctl/cantonjs Adds |
|---------------|---------------|------------------------------|
| **DPM** | Build, test, codegen, sandbox, studio launch | cantonctl wraps DPM for compilation; adds deployment pipelines, hot-reload, party provisioning |
| **Daml Studio** | IDE workflows: errors, autocomplete, script results | No overlap. cantonctl's playground targets browser-based interaction, not IDE replacement |
| **CN Quickstart** | Reference app, full LocalNet in Docker | cantonctl wraps LocalNet (`localnet up/down/status`); adds lightweight sandbox mode without Docker |
| **Wallet SDK / dApp SDK** | Wallet providers, CIP-103 wallet discovery | cantonjs-wallet-adapters is experimental and defers to official SDKs for wallet integration |
| **Splice APIs (raw)** | OpenAPI specs for Scan, Validator, ANS | cantonctl provides CLI access; cantonjs provides typed TypeScript clients |

**Design principles:**
- **Wrap, do not replace.** DPM remains canonical for compilation. CN Quickstart remains canonical for reference apps.
- **Prefer stable external APIs.** Splice command surfaces target stable/external API tiers. Internal API usage is isolated behind `--experimental` flags.
- **Open-source, community-extensible.** oclif plugin system, npm-based distribution, Apache-2.0 licensed.

### 4. Target Users

1. **App/platform engineers** taking Daml applications from local artifacts into validator-backed Canton/Splice environments. They need deployment pipelines, multi-environment auth, and Splice API access.
2. **Solution engineers and DevRel** who need repeatable setup, demo, and environment workflows. They need profile-driven configuration and one-command LocalNet/sandbox startup.
3. **CI/CD and release engineers** who need reliable promotion, preflight checks, and diagnostics across environments. They need structured JSON output and compatibility checking.

**Non-goals:** cantonctl does not target pure Daml contract authors (well-served by DPM + Daml Studio) or wallet providers/exchanges (served by the official Wallet SDK).

### 5. Backward Compatibility

*No backward compatibility impact.* All tools are new. Projects generated by cantonctl produce standard .dar artifacts and use standard Ledger API interfaces. Developers can eject at any time and use raw `dpm`/Canton tools directly.

---

## Milestones and Deliverables

### Milestone 1: cantonctl -250,000 CC -IN PROGRESS

- **Estimated Delivery:** 4 weeks from proposal acceptance
- **Focus:** Splice-aware CLI for deploying, operating, and promoting Canton applications across environments
- **Deliverables / Value Metrics:** 30+ commands, 24+ libraries, 8 templates, 15 ADRs, full Splice API access

**Status: In progress.**

cantonctl v0.3.3 is published on npm. Full Canton + Splice support (v0.4.0) is in development on the `feat/splice-full-support-cantonctl` branch. Repository: [merged-one/cantonctl](https://github.com/merged-one/cantonctl).

| Deliverable | Description | Status |
|-------------|-------------|--------|
| **Core commands** | init, dev, build, test, deploy, console, status, auth, clean, doctor, serve, playground | GA |
| **Profile system** | Runtime profiles: sandbox, canton-multi, splice-localnet, remote-validator, remote-sv-network. Commands: profiles list/show/validate | GA |
| **Splice Scan commands** | `scan updates`, `scan acs`, `scan current-state` -stable public Scan reads with pagination | GA |
| **Token Standard commands** | `token holdings`, `token transfer` -stable holding interface and transfer-factory submission | GA |
| **ANS commands** | `ans list`, `ans create` -stable ANS reads and entry creation | GA |
| **Validator commands** | `validator traffic-buy`, `validator traffic-status` (GA); register-user, offboard-user, external-party (experimental) | GA + Experimental |
| **LocalNet workspace** | `localnet up/down/status` -official Splice LocalNet wrapper with endpoint discovery | GA |
| **Codegen and spec sync** | `codegen sync` -fetch upstream OpenAPI/OpenRPC specs, generate typed clients | GA |
| **Compatibility checking** | `compat check` -validate project against upstream tracked surfaces | GA |
| **Auth system** | `auth login/logout/status` -env-or-keychain-jwt, bearer-token, oidc-client-credentials, localnet-unsafe-hmac | GA |
| **8 project templates** | basic, token, defi-amm, api-service, zenith-evm, splice-token-app, splice-scan-reader, splice-dapp-sdk | GA |
| **Service adapter layer** | Stable adapters for scan, token, ANS, ledger, validator-user; experimental internals isolated | GA |
| **Foundation libraries** | 24+ dependency-injected core libraries | GA |
| **Multi-node Docker topology** | `dev --full` with multi-participant Canton network | GA |
| **Canton IDE Protocol server** | Profile-aware `cantonctl serve` REST + WebSocket | GA |
| **Browser playground** | Profile-aware with dynamic forms, split view, topology visualization, Splice reads | GA |
| **Architecture Decision Records** | 15 ADRs including ADR-0015 (Splice support architecture) | GA |
| **Documentation** | Reference docs, task guides, concept docs, 3 Splice example walkthroughs, migration guide | GA |
| **Automated release pipeline** | Tag → test → publish → GitHub Release with Splice CI gates | GA |

### Milestone 2: cantonjs -250,000 CC -IN PROGRESS

- **Estimated Delivery:** 8 weeks from Milestone 1 acceptance
- **Focus:** Type-safe TypeScript SDK for Canton Ledger API V2
- **Deliverables / Value Metrics:** cantonjs published on npm, streaming, codegen, React hooks, testing utilities

cantonjs v0.3.1 is published on npm with a full package ecosystem. Repository: [merged-one/cantonjs](https://github.com/merged-one/cantonjs).

| Deliverable | Description | Status |
|-------------|-------------|--------|
| **Core clients** | `createLedgerClient()`, `createAdminClient()`, `createTestClient()` with typed methods for all V2 endpoints | GA |
| **Transport layer** | Pluggable transports: HTTP JSON API (static/async auth), gRPC via ConnectRPC, failover across multiple transports | GA |
| **Type-safe codegen** | `cantonjs-codegen` -generate TypeScript types from Daml DAR files | GA |
| **Real-time streaming** | AsyncIterator-based WebSocket streams with auto-reconnect and offset tracking | GA |
| **React hooks** | `cantonjs-react` package: TanStack Query-powered hooks for ledger data | GA |
| **Splice ecosystem** | `cantonjs-splice-scan` (DSO metadata), `cantonjs-splice-validator` (ANS), `cantonjs-splice-interfaces` (Daml interface descriptors), `cantonjs-splice-token-standard` (CIP-0056 transfers) | GA |
| **Wallet adapters** | `cantonjs-wallet-adapters` -CIP-0103 wallet boundary adapters | Experimental |
| **Testing utilities** | Mock transports, recording transports, Canton sandbox fixtures, 100% coverage enforcement | GA |
| **Structured errors** | Machine-readable error codes (CJ1xxx transport, CJ2xxx auth, CJ3xxx ledger), recovery hints, traversable cause chains | GA |
| **Documentation** | API reference, getting started guide, migration guide from raw fetch | GA |

**Acceptance criteria:**
- `npm install cantonjs` works, zero runtime dependencies
- Create, exercise, and query contracts with full type safety via ledger, admin, and test clients
- Pluggable transports: HTTP JSON API, gRPC via ConnectRPC, failover
- WebSocket streaming receives real-time updates with auto-reconnect
- React hooks work with TanStack Query for caching and deduplication
- Splice ecosystem packages published: Scan, Validator ANS, Token Standard, interface descriptors
- Mock transport enables testing without a running Canton node
- 100% test coverage enforcement (statements, branches, functions, lines)
- Compatible with Canton 3.4.x and Splice 0.5.x

---

## Acceptance Criteria

The Tech & Ops Committee will evaluate completion based on:

- Deliverables completed as specified for each milestone
- Demonstrated functionality or operational readiness
- Documentation and knowledge transfer provided
- Alignment with stated value metrics

### Milestone 1 Acceptance Criteria

| Criterion | Target |
|-----------|--------|
| Time-to-first-transaction | Under 5 minutes from `init → dev → deploy` |
| Template quality | All 8 templates compile and pass tests against current Daml SDK |
| Test coverage | 80%+ statement coverage |
| CI/automation | Commands produce valid JSON; Splice CI gates pass |
| Documentation | Every command has reference docs; Splice example walkthroughs |
| Error handling | Every error code documented |
| Splice support | Stable scan, token, ANS, and validator commands functional against Splice 0.5.x |
| Profile system | All profile types resolve and validate correctly |
| Ecosystem compatibility | Works with Canton 3.4.x and Splice 0.5.x |

---

## Funding

**Total Funding Request: 500,000 CC + 150,000 CC/month maintenance**

### Payment Breakdown by Milestone

| Milestone | Scope | CC | Trigger |
|-----------|-------|---:|---------|
| **Milestone 1** | cantonctl (CLI Toolchain) | 250,000 | Upon committee acceptance |
| **Milestone 2** | cantonjs (TypeScript SDK) | 250,000 | Upon npm publish with streaming, codegen, React hooks |

### Ongoing Maintenance

**150,000 CC per month**, beginning after Milestone 1 acceptance. Covers:

- Bug fixes, security patches, and dependency updates for cantonctl and cantonjs
- Compatibility updates for new Canton and Daml SDK releases
- Community issue triage and support
- Documentation updates and improvements

Maintenance is invoiced monthly and subject to committee review. Either party may terminate with 30 days written notice.

### Volatility Stipulation

Project duration is estimated at 8 weeks from Milestone 1 acceptance. Should the project timeline extend beyond 12 weeks due to Committee-requested scope changes, any remaining milestones must be renegotiated to account for significant USD/CC price volatility.

---

## Long-Term Vision

This proposal funds the operational and SDK layers that sit between official Canton/Splice tools and production deployment. Together, cantonctl and cantonjs cover the journey from "I have Daml artifacts" to "I can reliably deploy, promote, and operate against real Canton/Splice environments."

The long-term vision is deeper ecosystem integration: plugin marketplace, community templates, multi-language SDKs, and tighter alignment with upstream DPM and CN Quickstart as they evolve. Detailed plans:

- **[cantonctl Roadmap](https://github.com/merged-one/cantonctl/blob/main/docs/ROADMAP.md)** -Phased roadmap with ecosystem gap analysis
- **[Funding Justification](https://github.com/merged-one/cantonctl/blob/main/docs/FUNDING_JUSTIFICATION.md)** -Comparable tool funding across blockchain ecosystems

---

## Co-Marketing

Upon release, the implementing entity will collaborate with the Foundation on:

- Launch announcement across Canton social channels
- Technical blog post series showing cantonctl + cantonjs alongside DPM and CN Quickstart
- Presentation at Canton community call
- "When to use what" guidance integrated into official Canton documentation

---

## Motivation

The Q1 2026 Developer Experience Survey made it clear: **environment setup is the biggest barrier to Canton adoption.** 41% of developers cited it as the task that took longest to get right, and "Local Development Frameworks" was rated as the single most critical tooling gap.

Official tools address parts of this well. DPM handles compilation and testing. Daml Studio provides IDE support. CN Quickstart offers a reference architecture. But critical gaps remain between these tools and production readiness:

- **DPM has no `upload-dar` command.** Deploying to remote nodes requires raw API calls ([flagged on the Canton forum](https://forum.canton.network/t/dpm-lacks-the-upload-dar-command/8341)).
- **No CLI for Splice APIs.** Developers interact with Scan, Validator, ANS, and Token Standard endpoints via manual HTTP requests.
- **No TypeScript Ledger API V2 client.** The deprecated `@daml/ledger` targets v1. Official guidance is to generate raw stubs from OpenAPI specs.
- **No environment promotion workflow.** Moving from sandbox to LocalNet to DevNet to MainNet is a manual, undocumented process.

cantonctl + cantonjs fill these specific gaps, complementing official tools rather than replacing them.

---

## Rationale

**Why a separate CLI and SDK rather than extending official tools?**

- **DPM is a package manager, not an operations tool.** DPM's scope is compilation, testing, codegen, and sandbox management. Adding deployment pipelines, Splice API access, multi-environment auth, and profile-driven promotion would bloat DPM beyond its single responsibility. cantonctl wraps DPM for compilation and adds the operational layer on top.
- **No official TypeScript Ledger API V2 client exists.** The deprecated `@daml/ledger` targets v1. The official recommendation is raw OpenAPI stubs. cantonjs fills the same role that viem fills for Ethereum: a modern, type-safe, function-based client library with streaming, codegen, and React hooks.
- **Splice APIs need a CLI and client library.** Scan, Validator, ANS, and Token Standard APIs expose OpenAPI specs but have no maintained tooling. cantonctl provides CLI access; cantonjs provides typed TypeScript clients.
- **The operational layer is inherently cross-cutting.** Deployment, auth, environment promotion, and preflight checks span DPM, Canton APIs, and Splice APIs. A dedicated tool that orchestrates across these boundaries is more maintainable than extending each official tool individually.

**Alternatives considered:**
- *Extending DPM directly* -Would require changes to official tooling outside our control. DPM's release cycle and scope are managed by Digital Asset.
- *Raw scripts per project* -Undifferentiated effort repeated by every team. No reuse, no community benefit.
- *Separate proposals per tool* -Integrated CLI + SDK is more valuable than disconnected pieces.
